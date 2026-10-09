// engine/localmap.js — SNG-678 L1/L2. THE LOCAL MAP: a place drawn as what it is, at the scale a person walks.
//
// ✅ ERIK (2026-10-06): *"We need the local maps done. Then we can finally retire that geometric view."* And,
// correcting the first reading: *"we need to keep the local map level that the geometric one was supposed to
// represent."* The ring was a stand-in for the third of his three zoom levels (SNG-383 §4): world → region →
// *"its sites lay out as a local map."* This module is that tier.
//
// ⛔ THE TERRAIN HAS NOTHING AT THIS SCALE, AND THAT IS THE WHOLE DESIGN (SNG-403 §1). The world raster's
// finest feature is ~33 km; a village is ~1 km. So the ground is NEVER the region raster upsampled — it is
// paper, with the three gradients the world DOES supply drawn across it: contours across the measured
// uphill, a channel on the measured river, roads out on the measured bearings. Everything with a name on it
// is authored (`local_layouts.json`, R28: authored is canon) or generated from those gradients with its
// reason attached (L2, SNG-404 §4: "a placement that cannot cite a gradient or a line of prose is
// decoration").
//
// ✅ ERIK'S VISUAL BRIEF (2026-08-11), which the mock `po/img/local_mock_millbrook.png` answers and this
// module draws: *"Where are their woods, fields, buildings … the river should have bends and sandbars and
// banks and rapids."* So an `extent` feature is drawn AS WHAT IT IS: water is a meandering channel of its
// authored width with banks, reeds and sandbars on the insides of its bends; a field is strip patchwork laid
// to the nearest road; a wood is tree crowns; built ground is roofs along the roads. None of it is a soft
// blob with a name on it.
//
// ⛑ THE MODEL IS PURE AND THE PAINTER TAKES A 2D CONTEXT, so the whole thing can be driven from a test with
// a counting stand-in for the canvas — which is how the mock's facts are gated (the well in the village and
// not in the water, the wheels on the waterfront, the ford upstream) rather than asserted.
// ⚠️ EVERYTHING SEEDED IS SEEDED FROM THE PLACE ID. The same place draws the same way on every visit and on
// every device; a texture that moved between visits would read as the world having changed.

import { measureGradients, usableGradients, placeSite, roadsOut as roadBearings } from "./localdetail.mjs";
import { glyphFor, drawGlyph, drawStateMark } from "./mapicons.mjs";
import { drawLabel, labelSpace } from "./maplabel.js";
import { placeGround, finishGround, inPoly, singleSiteOf } from "./localground.js";
import { overlayAdded, liveLocations, eventsFor, eventKnown } from "./mapstate.js";   // ✅ SNG-679 S8: what has been added to a place joins its layout as an overlay

const R = Math.PI / 180;
const norm180 = (d) => ((d + 540) % 360) - 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** metres a person walks in a minute — 5 km/h, the pace `walkingDays` already assumes for a day's march */
const METRES_PER_MINUTE = 83;

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// A SEED THAT IS THE PLACE'S OWN. fnv-1a over the id, then mulberry32 — small, portable, and the same in
// node and in every browser, which is what "draws the same on a reload" needs.
export function seedOf(text) {
  let h = 0x811c9dc5;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
export function rngOf(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ L0 · THE REGION MAP READS `regionDisplay`. ✅ AEVI: *"SNG-426 (August) authored the split in `location_kinds.json`
// → `regionDisplay`: seven sites marked `suppressAtRegion` … places renamed at region scale: 'Harmonic Heights', not
// 'Harmonic Heights — Lower Terrace', with a city icon … ⛔ Nothing reads it."* And her general rule: *"ANY location
// whose `parentId` is another location AND which sits within 0.5° of that parent is SUPPRESSED at region scale. An
// entry in `regionDisplay` is an explicit decision about that place and the general rule does not reach it."*
// ⛑ One reader for the three answers (name, kind, suppressed), pure, so the region map and the gate ask the same
// function and the +N a suppressed site adds to its parent is counted where the suppression is decided.
export function regionFaceOf(id, content, { locations = null } = {}) {
  const locs = locations || content?.locations || {};
  const l = locs[id] || null;
  const disp = content?.locationKinds?.regionDisplay?.[id] || null;
  const parentId = l?.parentId && locs[l.parentId] ? l.parentId : null;
  let suppressed = false, by = null;
  if (disp && typeof disp === "object" && !String(id).startsWith("_")) {
    suppressed = disp.suppressAtRegion === true;
    by = suppressed ? "regionDisplay" : null;
  } else if (parentId && l?.worldPos && locs[parentId]?.worldPos) {
    const a = l.worldPos, b = locs[parentId].worldPos;
    const dLat = Number(a.colatitude) - Number(b.colatitude);
    const dLon = (((Number(a.longitude) - Number(b.longitude)) + 540) % 360) - 180;
    const lat = Number(b.colatitude) - 90;
    const deg = Math.hypot(dLat, dLon * Math.cos(lat * Math.PI / 180));
    suppressed = Number.isFinite(deg) && deg <= 0.5;
    by = suppressed ? "within 0.5° of its parent" : null;
  }
  return {
    id, parentId,
    name: (disp && typeof disp.regionName === "string" && disp.regionName) || l?.name || id,
    kind: (disp && typeof disp.regionKind === "string" && disp.regionKind) || null,
    suppressed, by,
    tallyTo: suppressed ? parentId : null,
  };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ✅ AEVI (2026-10-07, ruling 2 on the diagrams' retirement): *"The deliberately-wrong regions stay, now drawn on the real
// ground maps. Each gets a line in the map's hint … Place markers and routes always stay accurate; only the drawing
// around them misbehaves."* ⛑ ONE table, which the painter and the gate both read; her words are the hint lines. The
// day she authors this on the region record in `regions.json`, this reads that instead of the table.
const REGION_LOOKS = Object.freeze({
  the_pattern_reach:  Object.freeze({ look: "unsteady", hint: "The lines here will not hold still." }),
  the_veiled_reach:   Object.freeze({ look: "lying",    hint: "Not everything drawn here is so." }),
  the_numinous_reach: Object.freeze({ look: "fading",   hint: "The survey gives out here." }),
});
/** the four spreading places: the Blaze, the Churn Edge, the Scouring, the Ceaseless — a dashed, outward-hatched edge */
const SPREADING_PLACES = Object.freeze(["the_blaze", "the_churn_edge", "the_scouring", "the_ceaseless"]);
/** ✅ AEVI (REPLY_aevi_ccode_the_diagrams_retire, 2026-10-07): *"Authored with this note in `regions.json` →
 *  `renderGuidance`. Each failure has a `treatment`, a `how`, and a `say` line for the region map's hint."* Her record is
 *  the source; the table above is the fallback for a world without one. Treatment → look: jitter/unsteady, decoy/lying,
 *  fade/fading. */
const TREATMENT_LOOK = Object.freeze({ jitter: "unsteady", decoy: "lying", fade: "fading" });
export function regionLook(regionId, content = null) {
  const id = String(regionId || "");
  const hf = content?.regionRules?.renderGuidance?.honestFailures?.[id];
  if (hf && typeof hf === "object") {
    const look = TREATMENT_LOOK[String(hf.treatment || "")] || null;
    if (look) return { look, hint: String(hf.say || REGION_LOOKS[id]?.hint || ""), how: String(hf.how || "") };
  }
  return REGION_LOOKS[id] || null;
}
/** ✅ AEVI: *"Growth is authored there too … a dashed outer edge with an outward hatch on their region and local maps,
 *  nothing at world scale, and '{name} is spreading.' in the hint."* */
export function isSpreading(placeId, content = null) {
  const id = String(placeId || "");
  const places = content?.regionRules?.renderGuidance?.growth?.places;
  if (Array.isArray(places)) return places.includes(id);
  return SPREADING_PLACES.includes(id);
}
export function spreadingSay(name, content = null) {
  const say = content?.regionRules?.renderGuidance?.growth?.say;
  return String(say || "{name} is spreading.").replace("{name}", String(name || "This place"));
}
/** a stable pseudo-random in [0, 1) from a seed and an index — "a little differently each time you open the map" is a
 *  per-open seed, never Math.random, so one open draws one picture however often it repaints */
export function lookRand(seed, i) { const x = Math.sin((Number(seed) || 0) * 12.9898 + (Number(i) || 0) * 78.233) * 43758.5453; return x - Math.floor(x); }

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ L5 · DEPTH. ✅ AEVI: *"SNG-403 §4a: interiors need a vertical axis. The pocket halls, the delves and the deep
// places are stacked, not spread. v1: a place whose sub-places carry `depth` draws one level at a time, with a
// level switch (surface, −1, −2…). Each level is laid out like L1. The shafts and stairs that join two levels
// show on both."* ⛑ A level is `localMap.level` on an authored site (the Cogitarium's hall at 0 and its third
// terrace at 3 share a footprint; the Service Ways run −1, −2, −4), or a grown place's `worldPos.depth` read
// down (depth 2 is level −2). The surface is level 0, and a site with no level is on it.
export function siteLevel(site) {
  const l = Number(site?.localMap?.level);
  if (Number.isFinite(l)) return Math.round(l);
  const d = Number(site?.worldPos?.depth);
  return Number.isFinite(d) && d !== 0 ? -Math.round(d) : 0;
}
/** The levels a layout has, sorted top down (surface first, then −1, −2 …; a terrace above the surface comes first). */
export function levelsOf(layout) {
  const set = new Set([0]);
  for (const s of layout?.sites || []) set.add(siteLevel(s));
  return [...set].sort((a, b) => b - a);
}
/** ⛔ THE WAY DOWN SHOWS ON BOTH LEVELS. A site that JOINS two levels — a stair, a shaft, a ladder, a lift, a well
 *  cut through, or any underplace that is the way into the level below — is drawn on its own level and on the one
 *  above it, so a watcher on the surface sees where the delve begins. Pure: the test is the name and the kind. */
export function joinsLevels(site) {
  if (/\b(stair|stairs|stairway|shaft|ladder|lift|descent|climb|the way down|the way up|hatch|trapdoor)\b/i.test(String(site?.name || ""))) return true;
  return site?.kind === "underplace" && siteLevel(site) < 0;
}
/** The sites drawn on one level: its own, plus the joins from the level directly below (seen from above). */
export function sitesAtLevel(layout, level) {
  const L = Number(level) || 0;
  return (layout?.sites || []).filter((s) => {
    const sl = siteLevel(s);
    if (sl === L) return true;
    return joinsLevels(s) && sl === L - 1;
  });
}
/** The word a level wears on the switch and in the chip. */
export function levelWord(level) {
  const L = Number(level) || 0;
  if (L === 0) return "surface";
  return L < 0 ? `${L} · ${-L === 1 ? "one level down" : `${-L} levels down`}` : `+${L} · ${L === 1 ? "one level up" : `${L} levels up`}`;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ L4 · CITIES USE THE CITY. ✅ AEVI: *"A place whose kind is a city draws through `cityPlan`, as the Crossing does
// now."* `cityPlan` lays a city out from RADIAL places — a distance from the hall (`rho`) and a bearing — which is
// exactly the frame a local layout is written in. So a city's sites become its places: the site at the centre is
// the hall, the rest stand at their authored distance and bearing, and the roads out become the avenues. Pure, so
// the gate can drive the Crossing's five sites through the planner and find every one inside the wall.
export function isCityPlace(placeId, content) {
  if (placeId === "the_crossing") return true;              // the hub: its region map IS the city, so its own ground is too
  return placeKindOf(placeId, { content }) === "city";
}
export function cityPlacesOf(layout, { nameOf = null } = {}) {
  const radius = Math.max(1, Number(layout?.radiusMetres) || 400);
  const sites = layout?.sites || [];
  const places = sites.map((s) => ({
    id: s.id, name: s.name || s.id, tier: s.location ? "settlement" : "site",
    rho: Math.max(0, Number(s.localMap?.metres) || 0) / radius, bearingDeg: Number(s.localMap?.bearing) || 0, big: false,
  }));
  const hall = places.slice().sort((a, b) => a.rho - b.rho)[0] || null;
  const roadsOut = (layout?._measured?.roadsOut || []).map((r) => ({
    to: r.to, name: (typeof nameOf === "function" ? nameOf(r.to) : null) || r.to, bearingDeg: Number(r.bearing) || 0, mi: r.mi ?? null,
  }));
  return { places, hallId: hall ? hall.id : null, roadsOut };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ THE FRAME. ✅ AEVI (L1): *"the frame fits every site and the near edge of every `extent` feature, the way
// the mock frames the wheels and the ford 3.4 km out."* A frame that fit only `radiusMetres` would leave
// Millbrook's wheels, landing and ford — the three sites its own seed calls a centre of daily life — off the
// map. The near edge of a feature is where it STARTS: a river 3200 m out is reached at its near bank, a
// meadow that begins at the village edge is reached at zero.
/** ⛔ A SINGLE SITE, SIZED TO HOLD WHAT IT HOLDS. `singleSiteOf` sizes it from its own thing; a few places hold more than fits round it
 *  (the Axis Gate's eight posts along its road, the Reclamation Site's six cogs by the river), and Aevi's frame is *"the drawn extent
 *  of the features"* — so the site is tried at its size and grown by a quarter, at most twice, until nothing is short for room.
 *  Cached on the place's ground entry (content, so it is the same object every time).
 *  ⛔ AN AUTHORED LAYOUT KEEPS THE FRAME ITS SITES NEED: Aevi placed them in metres (Echo River Crossing is a few houses' place with
 *  sites hundreds of metres out), and framing the houses would put her sites off the map. */
const _singleGrow = new WeakMap();
export function singleFor(layout) {
  if (!layout?.ground || layout.authored) return null;
  const base = singleSiteOf(layout.ground, layout.groundKinds);
  if (!base) return null;
  const key = layout.ground;
  if (!_singleGrow.has(key)) {
    let g = 1;
    for (let k = 0; k < 2; k++) {
      const s = { ...base, siteMetres: base.siteMetres * g };
      const fr = localFrame(layout, { w: 800, h: 500, focusMetres: Math.max(30, s.siteMetres * 1.6) });
      let short = false;
      try { short = (localModel(layout, fr, { placeId: layout.placeId, _single: s }).ground?.short || []).some((x) => /no room/.test(String(x.why || ""))); } catch { short = false; }
      if (!short) break;
      g *= 1.25;
    }
    _singleGrow.set(key, g);
  }
  return { ...base, siteMetres: base.siteMetres * _singleGrow.get(key) };
}
export function fitMetres(layout) {
  // ✅ G8 (Aevi): *"When `dwellings` is `none` or `few`, frame the drawn extent of the features (×1.6, at least 60 m across), not the
  // radius a town would want. Far sites and the roads out stay as edge pointers."*
  const single = singleFor(layout);
  if (single) return Math.round(Math.max(30, single.siteMetres * 1.6));
  let fit = Number(layout?.radiusMetres) || 300;
  for (const s of layout?.sites || []) {
    const m = Number(s?.localMap?.metres);
    if (Number.isFinite(m)) fit = Math.max(fit, m * 1.08);
  }
  for (const f of layout?.extent || []) {
    // ⛑ CCODE-691 (Aevi): water held where the world has it after a move does not pull the frame out to it — *"the river might end
    // up at the edge of the frame, or off it, and that's the truth of the move"*
    if (f?.heldInWorld) continue;
    const from = Number(f?.fromMetres) || 0;
    const half = Number(f?.kind === "water" ? (f.widthMetres || 0) / 2 : (f.radiusMetres || 0));
    fit = Math.max(fit, Math.max(0, from - half) * 1.05 + 60);
  }
  return Math.round(fit);
}

/** The metres→pixels frame for a canvas of w×h. `focusMetres` overrides the fit (the enlargement, the
 *  film's close-in); `view` is the pan/zoom the local tier carries. */
export function localFrame(layout, { w = 800, h = 500, focusMetres = null, view = null, pad = 26 } = {}) {
  const fit = focusMetres || fitMetres(layout);
  const k = view?.k || 1;
  const pxPerMetre = ((Math.min(w, h) / 2 - pad) / fit) * k;
  const cx = w / 2 - (view?.dx || 0) * k, cy = h / 2 - (view?.dy || 0) * k;
  const toXY = (bearing, metres) => ({
    x: cx + Math.sin((Number(bearing) || 0) * R) * (Number(metres) || 0) * pxPerMetre,
    y: cy - Math.cos((Number(bearing) || 0) * R) * (Number(metres) || 0) * pxPerMetre,
  });
  const toMetres = (x, y) => ({
    metres: Math.hypot(x - cx, y - cy) / pxPerMetre,
    bearing: Math.round(norm180(Math.atan2(x - cx, -(y - cy)) / R)),
  });
  return { w, h, cx, cy, pxPerMetre, fitMetres: fit, toXY, toMetres, k };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ THE SCALE LEGEND, IN THE UNITS places.js ALREADY SPEAKS. "Metres under a mile, miles over" is `span`'s
// rule for the GM; the walk is the same 5 km/h `walkingDays` assumes. ✅ The mock: *"500 m · about six
// minutes' walk"* — the bar length is the round number that fits between 60 and 150 px.
const BAR_STEPS = [50, 100, 200, 250, 500, 1000, 1609, 3219, 8047, 16093];
export function scaleLegend(frame) {
  const want = 95 / Math.max(1e-9, frame.pxPerMetre);
  let metres = BAR_STEPS[0];
  for (const s of BAR_STEPS) if (s * frame.pxPerMetre <= 150) metres = s;
  if (metres * frame.pxPerMetre < 60) metres = want;
  return { metres, px: metres * frame.pxPerMetre, text: `${spanWord(metres)} · ${walkWord(metres)}` };
}
export function spanWord(metres) {
  const m = Number(metres) || 0;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  const mi = m / 1609.34;
  return `${mi < 10 ? (Math.abs(mi - Math.round(mi)) < 0.05 ? Math.round(mi) : mi.toFixed(1)) : Math.round(mi)} mi`;
}
const SMALL = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export function walkWord(metres) {
  const mins = Math.max(1, Math.round((Number(metres) || 0) / METRES_PER_MINUTE));
  if (mins < 60) return `about ${SMALL[mins] || mins} minute${mins === 1 ? "" : "s"}' walk`;
  const hrs = Math.round(mins / 30) / 2;
  if (hrs === 1) return "about an hour's walk";
  return `about ${hrs % 1 ? `${Math.floor(hrs)} and a half` : hrs} hours' walk`;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ L2 · GROUND FOR EVERY PLACE, NOT 18. ✅ AEVI: *"Where no authored layout exists, generate one when the
// place is opened: `measureGradients` for its roads, river and slope; its sub-places … placed by SNG-404's
// precedence. Each one carries its reason, as authored sites do. Fill to the place's `kind`."* ⚠️ R28 holds:
// an authored layout is never touched by this except to add the sub-places it does not name.

/** What a place's kind says its ground is made of. ⛑ The settlement words ask for built ground, worked
 *  ground and a wood; the institutional words for built ground only; the broken words for rock and waste.
 *  A kind missing here gets built ground and nothing else, which is the honest minimum. */
const KIND_FILL = {
  city:      { radius: 900, built: 0.55, field: 2, wood: 0 },
  town:      { radius: 600, built: 0.5, field: 2, wood: 1 },
  village:   { radius: 450, built: 0.42, field: 2, wood: 1 },
  fen_town:  { radius: 400, built: 0.45, marsh: 1, field: 0, wood: 0 },
  harbour:   { radius: 500, built: 0.5, field: 1, wood: 0 },
  hold:      { radius: 400, built: 0.4, field: 1, wood: 1 },
  march:     { radius: 420, built: 0.35, field: 1, wood: 1, rock: 1 },
  hall:      { radius: 180, built: 0.6 },
  archive:   { radius: 180, built: 0.6 },
  inn:       { radius: 140, built: 0.6, field: 1 },
  shop:      { radius: 120, built: 0.6 },
  market:    { radius: 260, built: 0.6 },
  works:     { radius: 280, built: 0.5, rock: 1 },
  terrace:   { radius: 320, built: 0.45, field: 2 },
  grove:     { radius: 340, built: 0.15, wood: 2 },
  hermitage: { radius: 200, built: 0.2, wood: 1, rock: 1 },
  shrine:    { radius: 160, built: 0.25, wood: 1 },
  temple:    { radius: 220, built: 0.5 },
  cathedral: { radius: 280, built: 0.55 },
  arena:     { radius: 260, built: 0.6 },
  tower:     { radius: 160, built: 0.3, rock: 1 },
  towers:    { radius: 240, built: 0.45, rock: 1 },
  eyrie:     { radius: 220, built: 0.3, rock: 2 },
  skyhold:   { radius: 260, built: 0.4, rock: 1 },
  waygate:   { radius: 220, built: 0.2, rock: 1 },
  gate:      { radius: 200, built: 0.3 },
  bridge:    { radius: 260, built: 0.35 },
  road:      { radius: 400, built: 0.1, field: 1, wood: 1 },
  street:    { radius: 160, built: 0.6 },
  ruin:      { radius: 300, built: 0.3, waste: 1, rock: 1 },
  waste:     { radius: 500, waste: 2, rock: 1 },
  strange:   { radius: 320, built: 0.2, waste: 1 },
  underplace:{ radius: 300, built: 0.2, rock: 2 },
  pole:      { radius: 520, built: 0.2, rock: 1, waste: 1 },
  region:    { radius: 800, built: 0.3, field: 2, wood: 1 },
};

/** ⛔ A SUB-PLACE'S BASIS IS READ OFF ITS NAME, AND SAID SO. The generator for a NEW place runs the model
 *  (localbuilder.mjs); a sub-place the GM already named in play has no model turn to spend, so the one
 *  thing its name says — that a dock needs water, that a shrine wants height — decides its basis, and the
 *  placement records that the word did it. A name that says nothing is placed on a road out, in turn. */
const NAME_BASIS = [
  [/\b(well|spring|cistern|fountain)\b/i, "centre", "well"],
  [/\b(dock|landing|wharf|quay|jetty|ferry|waterfront)\b/i, "river", "dock"],
  [/\b(ford|crossing)\b/i, "river", "ford"],
  [/\b(mill|wheel)s?\b/i, "river", "mill"],
  [/\b(field|meadow|farm|pasture|orchard|garden|allotment)s?\b/i, "anti-uphill", "field"],
  [/\b(gate|arch|waygate)\b/i, "road", "gate"],
  [/\b(market|fair|exchange|bazaar)\b/i, "road", "market"],
  [/\b(inn|tavern|hostel|house of|lodging|alehouse)\b/i, "road", "hall"],
  [/\b(smith|forge|works|yard|tannery|kiln|foundry|workshop)\b/i, "road", "works"],
  [/\b(store|shop|stall|trader)\b/i, "road", "shop"],
  [/\b(shrine|temple|chapel|altar|sanctum)\b/i, "uphill", "shrine"],
  [/\b(tomb|barrow|burial|graveyard|cemetery|grave)s?\b/i, "uphill", "burial"],
  [/\b(tower|watch|keep|lookout|spire|belfry)\b/i, "uphill", "tower"],
  [/\b(grove|wood|coppice|copse|orchard|thicket)\b/i, "anti-road", "grove"],
  [/\b(green|common|square|plaza|court)\b/i, "centre", "green"],
  [/\b(hall|library|archive|school|guild)\b/i, "road", "hall"],
  [/\b(camp|billet|barracks|tents?)\b/i, "anti-road", "camp"],
  [/\b(cave|delve|hollow|cellar|undercroft|tunnel|mine|shaft)s?\b/i, "anti-road", "underplace"],
  [/\b(ruin|rubble|wreck)s?\b/i, "anti-road", "ruin"],
];
export function basisFromName(name, aliases = []) {
  for (const [re, basis, kind] of NAME_BASIS) if (re.test(String(name || ""))) return { basis, kind, why: `its name says "${String(name).match(re)[0]}"` };
  // ⛑ CCODE-689 (Erik's renames): A JOINED-UP NAME HIDES ITS WORD. "The Made Gate" said gate and Madegate does not, and
  // twelve records lost their kind that way (Cairngate, Entgrove, Lowmarket, Longdelve…). The old name still says it. A
  // word ENDING is not read instead: Saltmarch would be an arch.
  for (const a of Array.isArray(aliases) ? aliases : [])
    for (const [re, basis, kind] of NAME_BASIS) if (re.test(String(a || ""))) return { basis, kind, why: `its older name, ${a}, says "${String(a).match(re)[0]}"` };
  return { basis: "road", kind: null, why: "its name says nothing about where it sits — placed on a road out, in turn" };
}

/** The place's authored kind, from `location_kinds.json`, then its own record, then its tier. */
export function placeKindOf(placeId, { content = null, loc = null } = {}) {
  const k = content?.locationKinds?.kinds?.[placeId]?.kind;
  if (k) return k;
  const l = loc || content?.locations?.[placeId] || null;
  if (l?.kind) return l.kind;
  if (l?.role === "gate") return "waygate";
  return l?.tier === "region" ? "town" : "village";
}

/** ⛔ GENERATE A LAYOUT FROM THE MEASURED FRAME. Pure: the gradients and the children come in, a layout the
 *  painter can draw comes out, every site with its reason, and the record marked `generated`. */
export function generateLayout(placeId, { loc = null, kind = "village", gradients = null, children = [], locations = null } = {}) {
  const rnd = rngOf(seedOf("layout:" + placeId));
  const fill = KIND_FILL[kind] || { radius: 350, built: 0.4 };
  const usable = usableGradients(gradients);
  // ⛑ roads with no gradient reader still have bearings: a place's connections have positions
  if (!usable.roads.length && loc && locations) usable.roads = roadBearings(loc, locations);
  const radiusMetres = fill.radius;
  const extent = [];
  const up = usable.uphill?.bearing;
  const flat = Number.isFinite(up) ? norm180(up + 180) : (usable.roads[0]?.bearing ?? 0);
  const widest = (() => {
    // the widest gap between the roads: where a wood or a camp sits because nothing passes it
    const bs = usable.roads.map((r) => ((r.bearing % 360) + 360) % 360).sort((a, b) => a - b);
    if (!bs.length) return norm180(flat + 90);
    let best = null, gap = -1;
    for (let i = 0; i < bs.length; i++) { const a = bs[i], b = bs[(i + 1) % bs.length] + (i + 1 === bs.length ? 360 : 0); if (b - a > gap) { gap = b - a; best = a + (b - a) / 2; } }
    return norm180(best);
  })();
  if (fill.built) extent.push({ id: `${placeId}:built`, name: null, kind: "built", bearing: 0, fromMetres: 0,
    radiusMetres: Math.round(radiusMetres * fill.built), generated: true });
  // ⛔ A RIVER IS DRAWN ONLY WHEN IT IS INSIDE A WALK. `usableGradients` admits water to 1.5° (a gradient a
  // dock can be placed toward); a CHANNEL on the map has to be reachable within the frame, so it comes in
  // only under 4 km, at its measured distance, and flows across the bearing it was measured on.
  const riverM = gradients?.riverDistanceDeg != null ? gradients.riverDistanceDeg * 111320 : null;
  if (riverM != null && riverM <= 4000 && Number.isFinite(gradients.riverBearing)) {
    extent.push({ id: `${placeId}:water`, name: null, kind: "water", bearing: gradients.riverBearing,
      fromMetres: Math.max(120, Math.round(riverM)), widthMetres: 90 + Math.round(rnd() * 160),
      flowBearing: norm180(gradients.riverBearing + (rnd() < 0.5 ? 90 : -90)), generated: true });
  }
  for (let i = 0; i < (fill.field || 0); i++) {
    const b = i === 0 ? flat : (usable.roads[i % Math.max(1, usable.roads.length)]?.bearing ?? norm180(flat + 70));
    extent.push({ id: `${placeId}:field${i}`, name: null, kind: "field", bearing: norm180(b + (rnd() - 0.5) * 30),
      fromMetres: Math.round(radiusMetres * (0.55 + rnd() * 0.3)), radiusMetres: Math.round(radiusMetres * (0.35 + rnd() * 0.3)), generated: true });
  }
  for (let i = 0; i < (fill.wood || 0); i++) {
    extent.push({ id: `${placeId}:wood${i}`, name: null, kind: "wood", bearing: norm180(widest + (i ? 140 : 0) + (rnd() - 0.5) * 40),
      fromMetres: Math.round(radiusMetres * (0.7 + rnd() * 0.3)), radiusMetres: Math.round(radiusMetres * (0.3 + rnd() * 0.25)), generated: true });
  }
  for (let i = 0; i < (fill.rock || 0); i++) {
    extent.push({ id: `${placeId}:rock${i}`, name: null, kind: "rock", bearing: Number.isFinite(up) ? norm180(up + (i ? 50 : -20)) : norm180(widest + 180 + i * 60),
      fromMetres: Math.round(radiusMetres * (0.6 + rnd() * 0.35)), radiusMetres: Math.round(radiusMetres * (0.25 + rnd() * 0.2)), generated: true });
  }
  for (let i = 0; i < (fill.waste || 0); i++) {
    extent.push({ id: `${placeId}:waste${i}`, name: null, kind: "waste", bearing: norm180(widest + 90 + i * 120),
      fromMetres: Math.round(radiusMetres * (0.5 + rnd() * 0.4)), radiusMetres: Math.round(radiusMetres * (0.4 + rnd() * 0.3)), generated: true });
  }
  if (fill.marsh) extent.push({ id: `${placeId}:marsh`, name: null, kind: "marsh", bearing: Number.isFinite(gradients?.riverBearing) ? gradients.riverBearing : flat,
    fromMetres: Math.round(radiusMetres * 0.5), radiusMetres: Math.round(radiusMetres * 0.9), generated: true });

  // the sub-places, each by the basis its name licenses, each with its reason
  const sites = [];
  let roadIdx = 0, figIdx = 0;
  const placed = [];
  for (const c of children || []) {
    if (!c) continue;
    const nb = basisFromName(c.name, c.aliases);
    let at = null, why = "";
    // ⛑ A PROMOTED PLACE HAS A POSITION OF ITS OWN, and its bearing from the parent is a fact, not a guess
    if (c.worldPos && loc?.worldPos) {
      const from = [loc.worldPos.colatitude - 90, loc.worldPos.longitude];
      const to = [c.worldPos.colatitude - 90, c.worldPos.longitude];
      const dLat = to[0] - from[0], dLon = (to[1] - from[1]) * Math.cos(from[0] * R);
      const bearing = norm180(Math.atan2(dLon, dLat) / R);
      const metres = Math.hypot(dLat, dLon) * 111320;
      if (metres > 5) { at = { bearing: Math.round(bearing), metres: Math.round(Math.min(metres, radiusMetres * 1.6)) }; why = "its own position, bearing from here"; }
    }
    if (!at) {
      at = placeSite({ basis: nb.basis, name: c.name }, usable, { radiusMetres, index: nb.basis === "road" ? roadIdx : figIdx,
        between: placed.slice(-2).map((p) => ({ bearing: p.localMap.bearing, metres: p.localMap.metres })) });
      why = at ? `${nb.why}; ${at.why}` : "";
      if (at) { if (nb.basis === "road") roadIdx++; else figIdx++; }
    }
    if (!at) {
      // ⚠️ NOTHING ON THIS GROUND ANSWERED (a dock with no water, a shrine on the flat). Her rule is to emit
      // fewer — but this is a place the character has STOOD IN, and a sub-place that vanishes from the map
      // because the ground is flat is a loss, not a restraint. It is placed in the clear and the reason
      // says the ground did not decide it.
      const b = norm180(widest + 35 * (figIdx + 1));
      at = { bearing: Math.round(b), metres: Math.round(radiusMetres * 0.6) };
      why = `${nb.why}; nothing on this ground answered "${nb.basis}" — placed in the clear between the roads`;
      figIdx++;
    }
    const site = { id: c.id, name: c.name || c.id, kind: c.kind === "location" ? (c.placeKind || nb.kind || "hall") : (nb.kind || "square"),
      localMap: { bearing: at.bearing, metres: at.metres }, basis: nb.basis, placedBecause: why, generated: true,
      ...(c.kind === "location" ? { location: true } : {}), ...(c.visited ? { visited: true } : {}) };
    sites.push(site); placed.push(site);
  }
  return { radiusMetres, extent, sites, generated: true,
    _measured: { uphillBearing: up ?? null, relief: usable.uphill?.relief ?? gradients?.relief ?? null,
      riverBearing: gradients?.riverBearing ?? null, riverDistanceDeg: gradients?.riverDistanceDeg ?? null,
      roadsOut: usable.roads.map((r) => ({ to: r.to, bearing: r.bearing, mi: r.mi ?? null })) } };
}

/** ⛔ THE DOOR: authored → the save's cache → generated. R28: authored is canon, and the generator adds only
 *  the sub-places the authored file does not name. The cache lives on the character, marked `generated`, so
 *  the same place draws the same way on a reload — and a place with an authored layout is never cached,
 *  because content is the truth and a cached copy of it is the thing that goes stale. */
export function localLayoutFor(placeId, { content = null, character = null, children = [], gradients = null, roadsMiles = null } = {}) {
  const loc = content?.locations?.[placeId] || null;
  const kind = placeKindOf(placeId, { content, loc });
  const authored = content?.rules?.localLayouts?.[placeId] || null;
  const measured = gradients || (loc && content?.locations ? measureGradients(loc, { locations: content.locations }) : null);
  if (measured && roadsMiles) for (const r of measured.roadsOut || []) r.mi = roadsMiles(placeId, r.to);
  if (authored && (authored.sites?.length || authored.extent?.length)) {
    // the sub-places the authored file does not name, placed by the same rule and marked
    const named = new Set((authored.sites || []).map((s) => s.id).concat((authored.sites || []).map((s) => String(s.name || "").toLowerCase())));
    const extra = (children || []).filter((c) => c && !named.has(c.id) && !named.has(String(c.name || "").toLowerCase()));
    // ⛑ the AUTHORED measurements win over a live reading that may have nothing in it (no hydrology, no sampler)
    const gen = extra.length ? generateLayout(placeId, { loc, kind, gradients: { ...(measured || {}), ...(authored._measured || {}), roadsOut: authored._measured?.roadsOut || measured?.roadsOut || [] }, children: extra, locations: content?.locations }) : null;
    return withGround({ ...authored, kind, authored: true, placeId,
      _measured: { ...(measured || {}), ...(authored._measured || {}) },
      sites: [...(authored.sites || []), ...(gen ? gen.sites : [])] }, placeId, content, character);
  }
  const cached = character?.localLayouts?.[placeId] || null;
  const have = new Set((cached?.sites || []).map((s) => s.id));
  if (cached && (children || []).every((c) => !c || have.has(c.id))) return withGround({ ...cached, kind, placeId }, placeId, content, character);
  // ⛑ a cached layout GROWS when a new sub-place is named, it is not re-rolled (L3: "placed into the existing
  // layout, not re-rolled with it") — the extent and the sites already placed keep their seats
  const fresh = generateLayout(placeId, { loc, kind, gradients: measured, children: cached ? (children || []).filter((c) => c && !have.has(c.id)) : children, locations: content?.locations });
  const out = cached ? { ...cached, sites: [...cached.sites, ...fresh.sites] } : fresh;
  out.kind = kind; out.placeId = placeId; out.generated = true;
  if (character) { character.localLayouts = character.localLayouts || {}; character.localLayouts[placeId] = out; }
  return withGround(out, placeId, content, character);
}

/* ═════ CCODE-691 · S8 · A MOVED PLACE KEEPS THE WORLD'S WATER WHERE THE WORLD HAS IT ═════
 * ✅ AEVI 2026-10-08: *"The Echo doesn't move with Millbrook. The authored river is a fact about the ground, so after a move, draw
 * it at its world position relative to the new centre. Shift it by the opposite of the move, without shifting it with the place.
 * After a half-day move the river might end up at the edge of the frame, or off it, and that's the truth of the move."*
 * ⛔ EACH FEATURE FROM ITS OWN FRAME. The authored water was laid out from the authored point; a channel cut or a field cleared in
 * play was laid out from where the place stood THE DAY IT WAS MADE. So the shift is from the place's position on that day (the last
 * move the character knows of on or before it) to where it stands now — a channel cut after the move does not shift at all.
 * ⛑ Recomputed from the events every time a layout is asked for, never cached: the same answer as projecting once at the move, and
 * a character who has not learned of the move still draws the river where it always was (S7).
 * ⚠️ A FIELD THE PLAYER CLEARED holds still in the world too — it is ground, not a building — where the authored ground the place
 * brings with it is re-derived around the new centre, as S8 ruled. ⬜ A river TURNED after a move is shifted with the move as well;
 * a turn records no day of its own, so its frame is not known. */
function moveMetres(a, b) {
  const la = Number(a?.colatitude) - 90, lb = Number(b?.colatitude) - 90;
  const dLon = norm180(Number(b?.longitude) - Number(a?.longitude));   // ⛑ both conventions of longitude come out the same
  if (![la, lb, dLon].every(Number.isFinite)) return null;
  return { east: dLon * Math.cos(la * R) * 111320, north: (lb - la) * 111320 };
}
/** The feature held where it is in the world while its frame's centre moved by `d` (metres east, metres up-map). */
function heldInWorld(f, d) {
  if (!d || !Number.isFinite(Number(f?.bearing)) || Math.hypot(d.east, d.north) < 1) return f;   // made where it stands: nothing moved
  const b = Number(f.bearing) * R, m = Number(f.fromMetres) || 0;
  const e = Math.sin(b) * m - d.east, n = Math.cos(b) * m - d.north;
  return { ...f, bearing: Math.round(norm180(Math.atan2(e, n) / R)), fromMetres: Math.round(Math.hypot(e, n)), heldInWorld: true };
}
/** Where the place stood on `day` (null = its authored point), by the moves this character knows of. */
function placePosOn(character, placeId, authored, day) {
  let at = authored;
  if (day == null) return at;
  const moves = eventsFor(character, `place:${placeId}`).filter((e) => e?.change === "moved" && e.pos && eventKnown(character, e))
    .sort((x, y) => (Number(x.day) || 0) - (Number(y.day) || 0));
  for (const m of moves) if ((Number(m.day) || 0) <= Number(day)) at = m.pos;
  return at;
}

/** ✅ AEVI (the local ground, G1): *"`localLayoutFor` takes the place's entry."* Attached on the way OUT, never into the save's
 *  cache: the entry is content, and a cached copy of content is the thing that goes stale. A place with no entry (a place
 *  grown in play) keeps drawing the way it always has. */
function withGround(layout, placeId, content, character = null) {
  // ✅ S8: the additions this character knows of, laid over the layout on the way out (never cached: they are the world's, and move)
  if (character) layout = overlayAdded(layout, placeId, character, { content });
  // ✅ S8: *"Its layout keeps its sites, drops its water and ground, re-derives them by L3 at the new point"* — a place this character
  // knows was moved stands on the ground of where it stands now
  if (character && content?.locations?.[placeId]) {
    const live = liveLocations(character, content.locations, { content });
    const moved = live?.[placeId]?.movedFrom ? live[placeId] : null;
    if (moved) {
      const kind = placeKindOf(placeId, { content, loc: moved });
      const gen = generateLayout(placeId, { loc: moved, kind, gradients: measureGradients(moved, { locations: live }), children: [], locations: live });
      // ✅ CCODE-691 (Aevi): the world's water, and what the player laid on the ground, stay where they are in the world
      const authoredPos = content.locations[placeId].worldPos;
      const held = (layout.extent || []).filter((f) => f && f.kind !== "built" && (f.kind === "water" || f.added))
        .map((f) => heldInWorld(f, moveMetres(placePosOn(character, placeId, authoredPos, f.added ? f.addedDay ?? null : null), moved.worldPos)));
      const ownWater = held.some((f) => f.kind === "water" && !f.added);   // the authored river is the river; a re-measured one would be a second
      layout = { ...layout, extent: [...(layout.extent || []).filter((f) => f?.kind === "built"), ...held,
          ...(gen.extent || []).filter((f) => f?.kind !== "built" && !(ownWater && f?.kind === "water"))],
        _measured: { ...(layout._measured || {}), ...(gen._measured || {}) }, movedFrom: moved.movedFrom };
    }
  }
  const g = content?.rules?.localGround || null;
  const entry = g?.places?.[placeId] || null;
  return entry ? { ...layout, ground: entry, groundRules: g._rules || null, groundKinds: g._kinds || null } : layout;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ THE MODEL: every shape the painter draws, computed once from the layout and the frame. The painter then
// only puts ink down, which is what lets the film draw the same model sixty times a second.

/* ═════ THE LOCAL GROUND, G2 · ROOFS COME FROM WHO LIVES THERE, NEVER FROM THE KIND ═════
 * ✅ ERIK: *"Not every location had homes... and if they do they aren't always lined neatly along the roads."* ✅ AEVI (G2):
 * *"`none` draws no roofs. `few` draws exactly `n`. Every other value draws within its range. `cluster`, the default, must not
 * look laid out: knots of houses round the centre and the junctions, thinning outward; each house turned to its nearest way
 * within about ±30°, some set back with a yard, with gaps between knots; never two continuous rows at one spacing down a
 * road."* ⚠️ MEASURED before: every kind with a built fraction got roofs on both sides of every way at one spacing — the
 * fifteen gate yards, a single cabin, a machine in a riverbed — and the Spent Yard drew a row of houses on a road.
 * ⛑ The layouts not on open ground are folded for now, and said so: `dug`, `rock` and `interior` are openings cut in, not
 * roofs; `stilts`, `hulls`, `floating` and `underwater` sit on the water where there is water; `canopy` sits in the wood. */
export const DWELLING_RANGE = Object.freeze({ none: [0, 0], hamlet: [6, 15], village: [15, 45], town: [45, 150], city: [150, 320] });
export function dwellingRange(ground) {
  const d = String(ground?.dwellings || "");
  if (d === "few") { const n = Math.max(0, Number(ground?.n) || 3); return [n, n]; }
  return DWELLING_RANGE[d] || null;
}
const HOUSE_STYLE = { dug: "dug", rock: "dug", interior: "dug", camp: "tent", hulls: "hull", floating: "hull", underwater: "hull", stilts: "stilt" };
/** The houses a place's ground says it has, laid out the way its entry says they sit. Pure: the model's own ways, water and
 *  wood in; `[{ x, y, ang, style }]` out. The count is within the entry's range (fewer only when the ground has no room). */
export function groundHouses({ ground, frame, built, roads = [], lanes = [], sites = [], water = null, features = [], id = "place", uphill = null, blocked = null, streamLine = null, pools = [] }) {
  const range = dwellingRange(ground);
  if (!range || range[1] <= 0) return [];
  const rnd = rngOf(seedOf("houses:" + id));
  const want = range[0] + Math.floor(rnd() * (range[1] - range[0] + 1));
  const s = frame.pxPerMetre;
  const L = Math.max(2.2, 9 * s), Wd = Math.max(1.6, 6 * s);
  const layout = String(ground?.layout || "cluster");
  const style = HOUSE_STYLE[layout] || "roof";
  // ✅ G4: a layout ON the water stands in the entry's pools too (the reef city in its shallows); every other keeps out of them
  const wetLayout = ["stilts", "hulls", "floating", "underwater"].includes(layout);
  const inPool = (x, y) => pools.some((p) => inPoly(x, y, p.poly));
  const segsOf = (pts) => { const out = []; for (let i = 1; i < (pts || []).length; i++) out.push([pts[i - 1], pts[i]]); return out; };
  const segs = [...roads.flatMap((r) => segsOf(r.pts)), ...lanes.flatMap((l) => segsOf(l.pts))];
  const segDist = (x, y, [a, b]) => { const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1; const t = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / L2, 0, 1); return { d: Math.hypot(a[0] + vx * t - x, a[1] + vy * t - y), ang: Math.atan2(vy, vx) }; };
  const nearestWay = (x, y) => { let best = { d: Infinity, ang: 0 }; for (const sg of segs) { const r = segDist(x, y, sg); if (r.d < best.d) best = r; } return best; };
  // ✅ G4: the place's river, or where it has none, the entry's own stream (Thinwater's) — both are water a house is not in
  const wLine = water?.channel?.pts ? { pts: water.channel.pts, half: water.channel.widthPx / 2 } : (streamLine?.pts ? streamLine : null);
  const wSegs = wLine ? segsOf(wLine.pts) : [];
  const wHalf = wLine ? wLine.half : 0;
  const waterDist = (x, y) => { let d = Infinity; for (const sg of wSegs) d = Math.min(d, segDist(x, y, sg).d); return d; };
  const wayHalf = Math.max(1.6, 4 * s);
  const placed = [];
  const inFrame = (x, y) => x > 4 && y > 4 && x < frame.w - 4 && y < frame.h - 4;
  const tryPlace = (x, y, ang, { gap = L * 1.15, onWater = false } = {}) => {
    if (placed.length >= want || !inFrame(x, y)) return false;
    const wd = wSegs.length ? waterDist(x, y) : Infinity;
    if (onWater ? !(wd < wHalf + L || inPool(x, y)) : wd < wHalf + Wd) return false;
    if (nearestWay(x, y).d < wayHalf + Wd * 0.8) return false;
    if (blocked && blocked(x, y, Wd * 0.9, wetLayout)) return false;   // ✅ G4: clear of every mark, site, stream, pool and drop
    if (!placed.every((q) => Math.hypot(q.x - x, q.y - y) >= gap)) return false;
    placed.push({ x, y, ang, style }); return true;
  };
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const turnToWay = (x, y) => nearestWay(x, y).ang + (rnd() - 0.5) * (Math.PI / 3) + (rnd() < 0.4 ? Math.PI / 2 : 0);   // ±30°, end-on or side-on
  const pointAlong = (pts, dist) => { let acc = 0; for (let i = 1; i < (pts || []).length; i++) { const [a, b] = [pts[i - 1], pts[i]]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + l >= dist) { const f = (dist - acc) / (l || 1); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; } acc += l; } return null; };
  const R0 = Math.max(8, built.r);
  const tries = want * 40;
  const cluster = (centreBias = 1, around = null) => {
    // knots: the centre, a point out along each road, the open sites, and two of the ground's own
    const knots = around ? [{ x: around.x, y: around.y, w: 3, r: around.r }] : [{ x: built.x, y: built.y, w: 3 * centreBias, r: R0 * 0.3 }];
    if (!around) {
      for (const r of roads) { const p = pointAlong(r.pts, R0 * (0.4 + rnd() * 0.25)); if (p) knots.push({ x: p[0], y: p[1], w: 1.6, r: R0 * 0.22 }); }
      for (const st of sites) if (["green", "square", "market", "well"].includes(st.kind) && Math.hypot(st.x - built.x, st.y - built.y) < R0) knots.push({ x: st.x, y: st.y, w: 1.4, r: R0 * 0.2 });
      for (let k = 0; k < 2; k++) { const a = rnd() * Math.PI * 2, d = R0 * (0.35 + rnd() * 0.4); knots.push({ x: built.x + Math.cos(a) * d, y: built.y + Math.sin(a) * d, w: 1, r: R0 * 0.18 }); }
    }
    const tw = knots.reduce((n, k) => n + k.w, 0);
    for (let i = 0; i < tries && placed.length < want; i++) {
      let pick = rnd() * tw, k = knots[0];
      for (const q of knots) { pick -= q.w; if (pick <= 0) { k = q; break; } }
      const a = rnd() * Math.PI * 2, rr = k.r * Math.abs(gauss());
      const x = k.x + Math.cos(a) * rr, y = k.y + Math.sin(a) * rr;
      const dc = Math.hypot(x - built.x, y - built.y) / R0;
      if (!around && (dc > 1.05 || rnd() < dc * dc * 0.55)) continue;   // thinning outward
      tryPlace(x, y, turnToWay(x, y), { gap: L * (1.1 + rnd() * 0.8) });   // yards and gaps vary
    }
  };
  const along = (pts, depth, reach = 1.35) => {
    let acc = 0, next = 0;
    for (let i = 1; i < (pts || []).length && placed.length < want; i++) {
      const [a, b] = [pts[i - 1], pts[i]]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l, nx = -ty, ny = tx;
      for (; next < acc + l; next += L * (1.2 + rnd() * 0.9)) {
        const t = next - acc, x = a[0] + tx * t, y = a[1] + ty * t;
        if (Math.hypot(x - built.x, y - built.y) > R0 * reach) continue;
        const side = rnd() < 0.5 ? 1 : -1, off = depth + Wd * (0.9 + rnd() * 0.5);
        tryPlace(x + nx * side * off, y + ny * side * off, Math.atan2(ty, tx) + (rnd() - 0.5) * 0.28, { gap: L * 1.05 });
        if (rnd() < 0.25) tryPlace(x + nx * side * (off + Wd * 2.2), y + ny * side * (off + Wd * 2.2), Math.atan2(ty, tx) + (rnd() - 0.5) * 0.5, { gap: L * 1.05 });   // a little depth behind
      }
      acc += l;
    }
  };
  const mainRoad = roads.slice().sort((p, q) => (q.pts?.length || 0) - (p.pts?.length || 0))[0] || null;
  const baseAng = mainRoad && mainRoad.pts.length > 1 ? Math.atan2(mainRoad.pts[1][1] - mainRoad.pts[0][1], mainRoad.pts[1][0] - mainRoad.pts[0][0]) : 0;
  const ranks = (spacingAcross, spacingAlong, ang, within = 1) => {
    const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    for (let r = -R0; r <= R0 && placed.length < want; r += spacingAcross) for (let t = -R0; t <= R0 && placed.length < want; t += spacingAlong) {
      const x = built.x + ux * t + vx * r, y = built.y + uy * t + vy * r;
      if (Math.hypot(x - built.x, y - built.y) > R0 * within) continue;
      tryPlace(x, y, ang, { gap: Math.min(spacingAlong, spacingAcross) * 0.9 });
    }
  };
  switch (layout) {
    case "street": {
      const stream = (ground.features || []).some((f) => ["stream", "river", "channel"].includes(f.k) && f.at === "across");
      const sLine = stream ? (streamLine?.pts ? streamLine : (water?.channel?.pts ? { pts: water.channel.pts, half: wHalf } : null)) : null;
      const line = sLine ? sLine.pts : (mainRoad ? mainRoad.pts : null);
      /* ✅ AEVI (G8): *"Thinwater's houses are a round knot with the stream through it. Its entry says a street along the stream."*
       * ⛑ A street runs ON along its line — further than a knot's radius — and two deep, before anything left over knots up */
      if (line) { const d0 = sLine ? sLine.half : wayHalf; along(line, d0, 2.3); if (placed.length < want) along(line, d0 + Wd * 2.6, 2.3); }
      if (placed.length < want) cluster(0.6);
      break;
    }
    case "rows": ranks(Wd * 3, L * 1.5, baseAng); break;
    case "grid": ranks(Wd * 2.6, L * 1.35, baseAng); break;
    case "rings": for (const f of [0.35, 0.6, 0.85]) { const r = R0 * f, n = Math.max(4, Math.floor((2 * Math.PI * r) / (L * 1.6))); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; tryPlace(built.x + Math.cos(a) * r, built.y + Math.sin(a) * r, a + Math.PI / 2, { gap: L }); } } break;
    case "tiers": {
      /* ✅ `_rules.layout.tiers`: *"stepped levels, up a slope or down round a shaft or a lake"* — a lake at the centre
       * (Undermere's black lake) is ringed by its tiers; otherwise the levels step across the slope */
      const lake = pools.find((p) => Math.hypot(p.x - built.x, p.y - built.y) < R0 * 0.3 && p.rPx >= R0 * 0.3);
      if (lake) for (let r = lake.rPx + Wd * 2.2; r <= R0 * 1.02 && placed.length < want; r += Wd * 2.6) {
        const n = Math.max(6, Math.floor((2 * Math.PI * r) / (L * 1.4))), ph = rnd() * Math.PI * 2;
        for (let i = 0; i < n && placed.length < want; i++) { const a = ph + (i / n) * Math.PI * 2; tryPlace(built.x + Math.cos(a) * r, built.y + Math.sin(a) * r, a + Math.PI / 2, { gap: L * 1.15 }); }
      }
      else { const u = uphill != null ? uphill * Math.PI / 180 - Math.PI / 2 : baseAng; ranks(Wd * 3.4, L * 1.45, u + Math.PI / 2, 0.95); }
      break;
    }
    case "scatter": for (let i = 0; i < tries && placed.length < want; i++) { const a = rnd() * Math.PI * 2, d = R0 * 1.4 * Math.sqrt(rnd()); const x = built.x + Math.cos(a) * d, y = built.y + Math.sin(a) * d; tryPlace(x, y, turnToWay(x, y), { gap: R0 * 0.25 }); } break;
    case "yard": case "court": {
      const r = R0 * 0.5, n = Math.max(want, 6);
      for (let i = 0; i < n * 3 && placed.length < want; i++) {
        const a = layout === "court" ? (Math.floor(rnd() * 4) / 4) * Math.PI * 2 + Math.PI / 4 + (rnd() - 0.5) * 1.2 : rnd() * Math.PI * 2;
        const rr = layout === "court" ? r / Math.max(0.55, Math.abs(Math.cos(((a - Math.PI / 4) % (Math.PI / 2)) - Math.PI / 4))) : r * (0.9 + rnd() * 0.2);
        tryPlace(built.x + Math.cos(a) * rr, built.y + Math.sin(a) * rr, a + Math.PI / 2, { gap: L * 1.1 });   // facing in
      }
      break;
    }
    case "camp": for (let i = 0; i < tries && placed.length < want; i++) { const a = -Math.PI * 0.55 + rnd() * Math.PI * 1.1 + baseAng, rr = R0 * (0.45 + (rnd() - 0.5) * 0.2); tryPlace(built.x + Math.cos(a) * rr, built.y + Math.sin(a) * rr, a, { gap: L * 1.3 }); } break;
    case "dug": case "rock": case "interior": cluster(1.6); break;
    case "canopy": {
      const woods = features.filter((f) => f.kind === "wood");
      for (const w of woods) cluster(1, { x: w.x, y: w.y, r: w.rPx * 0.5 });
      if (placed.length < want) cluster(1);
      break;
    }
    case "stilts": case "hulls": case "floating": case "underwater": {
      if (wSegs.length) for (let i = 0; i < tries && placed.length < want; i++) {
        const sg = wSegs[Math.floor(rnd() * wSegs.length)], f = rnd(); const x = sg[0][0] + (sg[1][0] - sg[0][0]) * f + (rnd() - 0.5) * wHalf, y = sg[0][1] + (sg[1][1] - sg[0][1]) * f + (rnd() - 0.5) * wHalf;
        if (Math.hypot(x - built.x, y - built.y) > R0 * 1.6) continue;
        tryPlace(x, y, Math.atan2(sg[1][1] - sg[0][1], sg[1][0] - sg[0][0]), { gap: L * 1.2, onWater: true });
      }
      // ✅ G4: no river, but the entry's own pools — the houses stand in them
      for (let i = 0; pools.length && i < tries && placed.length < want; i++) {
        const p = pools[Math.floor(rnd() * pools.length)], a = rnd() * Math.PI * 2, d = p.rPx * 0.9 * Math.sqrt(rnd());
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
        if (Math.hypot(x - built.x, y - built.y) > R0 * 1.6) continue;
        tryPlace(x, y, rnd() * Math.PI, { gap: L * 1.2, onWater: true });
      }
      if (placed.length < want) cluster(1);
      break;
    }
    default: cluster(1);
  }
  /* ⛑ A FILL PASS for the organic layouts: the marks and the water now take ground the houses used to have, so a pass
   * that ran out of tries is given more before the count is called short — irregular, inside the built ground, never in
   * rows. "Fewer only when the ground has no room" is then true and not a matter of the first sweep's luck. */
  if (placed.length < want && ["cluster", "street", "dug", "rock", "interior", "canopy", "tiers", "stilts", "hulls", "floating", "underwater"].includes(layout)) {
    for (let i = 0; i < want * 80 && placed.length < want; i++) {
      const a = rnd() * Math.PI * 2, d = R0 * 1.03 * Math.sqrt(rnd()), x = built.x + Math.cos(a) * d, y = built.y + Math.sin(a) * d;
      tryPlace(x, y, turnToWay(x, y), { gap: L * (1.05 + rnd() * 0.4) });
    }
  }
  // a camp keeps its loose curve: the same sweep, a wider band of it
  if (placed.length < want && layout === "camp") {
    for (let i = 0; i < want * 80 && placed.length < want; i++) { const a = -Math.PI * 0.55 + rnd() * Math.PI * 1.1 + baseAng, rr = R0 * (0.3 + rnd() * 0.65); tryPlace(built.x + Math.cos(a) * rr, built.y + Math.sin(a) * rr, a, { gap: L * 1.2 }); }
  }
  return placed;
}

/** A blob: a circle with a seeded radial wobble, so a field is a field and not a compass rose. */
function blobPath(cx, cy, r, rnd, { wobble = 0.14, n = 18 } = {}) {
  const pts = [];
  const phase = rnd() * Math.PI * 2;
  const k1 = 0.6 + rnd() * 0.8, k2 = 0.3 + rnd() * 0.5;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + wobble * (Math.sin(a * 2 + phase) * k1 + Math.sin(a * 5 + phase * 2) * k2 * 0.5);
    pts.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * w]);
  }
  return pts;
}

/** ⛔ THE CHANNEL. A line through the feature's point along `flowBearing`, with a seeded meander of about
 *  half the width at a wavelength of several widths — a river that bends, as Erik asked — carried well
 *  past the frame so it enters and leaves at the edges. Returns the centreline, its banks and the
 *  sandbars: a sandbar sits on the INSIDE of each bend, which is where a real one is deposited. */
function channel(f, frame, rnd) {
  const p0 = frame.toXY(f.bearing, f.fromMetres);
  const widthPx = Math.max(2.5, (Number(f.widthMetres) || 120) * frame.pxPerMetre);
  const dir = [Math.sin((Number(f.flowBearing) || 0) * R), -Math.cos((Number(f.flowBearing) || 0) * R)];
  const nrm = [-dir[1], dir[0]];
  const reach = Math.hypot(frame.w, frame.h) * 1.2;
  const metresPx = 1 / frame.pxPerMetre;
  // the meander, in METRES so it does not change shape with the zoom
  const amp = (Number(f.widthMetres) || 120) * (0.45 + rnd() * 0.35);
  const lam = (Number(f.widthMetres) || 120) * (7 + rnd() * 5);
  const ph = rnd() * Math.PI * 2, ph2 = rnd() * Math.PI * 2;
  const pts = [], banks = [[], []];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const t = -reach + (i / N) * reach * 2;                // px along the flow
    const m = t * metresPx;
    const off = (amp * Math.sin(m / lam * Math.PI * 2 + ph) + amp * 0.35 * Math.sin(m / (lam * 0.37) + ph2)) * frame.pxPerMetre;
    const x = p0.x + dir[0] * t + nrm[0] * off, y = p0.y + dir[1] * t + nrm[1] * off;
    pts.push([x, y]);
  }
  // bank offsets from the local tangent, and the bends (sign changes of curvature) for the sandbars
  const bars = [];
  for (let i = 0; i <= N; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
    const nx = -ty / L, ny = tx / L;
    banks[0].push([pts[i][0] + nx * widthPx / 2, pts[i][1] + ny * widthPx / 2]);
    banks[1].push([pts[i][0] - nx * widthPx / 2, pts[i][1] - ny * widthPx / 2]);
    if (i > 2 && i < N - 2) {
      const c = pts[i], p = pts[i - 2], q = pts[i + 2];
      const curv = (q[0] - c[0]) * (c[1] - p[1]) - (q[1] - c[1]) * (c[0] - p[0]);
      const cp = pts[i - 1], cq = pts[i + 1], pp = pts[i - 3], qq = pts[i + 3];
      const curvPrev = (cq[0] - cp[0]) * (cp[1] - pp[1]) - (cq[1] - cp[1]) * (cp[0] - pp[0]);
      const curvNext = (qq[0] - cq[0]) * (cq[1] - cp[1]) - (qq[1] - cq[1]) * (cq[0] - cp[0]);
      // the apex of a bend: curvature at a local extreme of the same sign
      const lastBar = bars.length ? bars[bars.length - 1].i : -99;
      if (Math.abs(curv) > Math.abs(curvPrev) && Math.abs(curv) >= Math.abs(curvNext) && Math.abs(curv) > widthPx * 2.2 && i - lastBar >= 6) {
        const inside = curv > 0 ? 1 : -1;
        bars.push({ i, x: c[0] - nx * inside * widthPx * 0.28, y: c[1] - ny * inside * widthPx * 0.28,
          rx: widthPx * (0.9 + rnd() * 0.6), ry: widthPx * 0.22, ang: Math.atan2(ty, tx) });
      }
    }
  }
  return { pts, banks, bars, widthPx, dir, nrm, p0 };
}

/** ⛔ A ROAD OUT: from the centre to the frame's edge on its bearing, through the site it serves when one
 *  names it (`toward`), with a seeded gentle bend so it reads as a road and not a spoke. */
function roadPath(bearing, frame, rnd, { through = null } = {}) {
  const reach = Math.hypot(frame.w, frame.h);
  const b = (Number(bearing) || 0) * R;
  const dir = [Math.sin(b), -Math.cos(b)], nrm = [-dir[1], dir[0]];
  const bend = (rnd() - 0.5) * 0.18, bend2 = (rnd() - 0.5) * 0.1;
  const pts = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * reach;
    let off = Math.sin((i / N) * Math.PI) * bend * reach * 0.35 + Math.sin((i / N) * Math.PI * 2.3) * bend2 * reach * 0.12;
    let x = frame.cx + dir[0] * t + nrm[0] * off, y = frame.cy + dir[1] * t + nrm[1] * off;
    if (through) {
      // pull the road through the site: a bump that peaks at the site's distance and fades either side
      const d = Math.hypot(through.x - frame.cx, through.y - frame.cy);
      const w = Math.exp(-((t - d) ** 2) / Math.max(1, (d * 0.6) ** 2));
      const sx = frame.cx + dir[0] * d + nrm[0] * (Math.sin((d / reach) * Math.PI) * bend * reach * 0.35);
      const sy = frame.cy + dir[1] * d + nrm[1] * (Math.sin((d / reach) * Math.PI) * bend * reach * 0.35);
      x += (through.x - sx) * w; y += (through.y - sy) * w;
    }
    pts.push([x, y]);
  }
  return pts;
}

/** Where a polyline leaves the frame, for the exit label. */
function exitPoint(pts, w, h, inset = 6) {
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (x < inset || x > w - inset || y < inset || y > h - inset) {
      const [px, py] = pts[i - 1];
      return { x: clamp(x, inset, w - inset), y: clamp(y, inset, h - inset), px, py };
    }
  }
  const last = pts[pts.length - 1];
  return { x: clamp(last[0], inset, w - inset), y: clamp(last[1], inset, h - inset) };
}

/** ⛔ THE WHOLE MODEL FOR ONE FRAME. `layout` from `localLayoutFor`; `frame` from `localFrame`. */
export function localModel(layout, frame, { placeName = "", placeId = "", nameOf = null, level = 0, _single = undefined } = {}) {
  const id = placeId || layout?.placeId || "place";
  const rnd = rngOf(seedOf("model:" + id + (level ? ":L" + level : "")));
  // ✅ L5: one level at a time — its own sites, and the way down from the level below
  const sites = sitesAtLevel(layout, level).map((s) => {
    const p = frame.toXY(s.localMap?.bearing, s.localMap?.metres);
    return { ...s, x: p.x, y: p.y, glyph: glyphFor({ kind: s.kind }) || "hall" };
  });
  const meas = layout?._measured || {};
  /* ✅ L5: BELOW GROUND THERE IS NO FIELD AND NO RIVER. A level under the surface is laid out like L1 — the same
   * frame, the same label space — but its ground is the hollow it is cut into: a built extent the size of the
   * place, and rock beyond it. The surface extent is the surface's. */
  const extentAtLevel = (Number(level) || 0) < 0
    ? [{ id: `${id}:hollow`, name: null, kind: "built", bearing: 0, fromMetres: 0, radiusMetres: Math.round((Number(layout?.radiusMetres) || 300) * 0.8), generated: true },
       { id: `${id}:rockN`, name: null, kind: "rock", bearing: 45, fromMetres: Math.round((Number(layout?.radiusMetres) || 300) * 1.15), radiusMetres: Math.round((Number(layout?.radiusMetres) || 300) * 0.6), generated: true },
       { id: `${id}:rockS`, name: null, kind: "rock", bearing: -135, fromMetres: Math.round((Number(layout?.radiusMetres) || 300) * 1.15), radiusMetres: Math.round((Number(layout?.radiusMetres) || 300) * 0.6), generated: true }]
    : (layout?.extent || []);
  // ✅ G8: a single place's ground is the size of the thing it is, at the centre — not the built radius a town would want
  const single = (Number(level) || 0) < 0 ? null : (_single !== undefined ? _single : singleFor(layout));
  const built = extentAtLevel.find((f) => f.kind === "built") || null;
  const builtR = single ? single.siteMetres * frame.pxPerMetre
    : built ? (Number(built.radiusMetres) || 200) * frame.pxPerMetre : (Number(layout?.radiusMetres) || 300) * 0.4 * frame.pxPerMetre;
  const builtAt = single ? frame.toXY(0, 0) : built ? frame.toXY(built.bearing, built.fromMetres) : { x: frame.cx, y: frame.cy };
  // roads out, each through the site that names it — none below ground: a delve's ways out are its stairs
  const roads = ((Number(level) || 0) < 0 ? [] : (meas.roadsOut || [])).map((r, i) => {
    const through = sites.find((s) => s.toward === r.to) || null;
    const pts = roadPath(r.bearing, frame, rngOf(seedOf(`road:${id}:${r.to || i}`)), { through });
    return { ...r, name: (typeof nameOf === "function" ? nameOf(r.to) : null) || r.name || r.to, pts, exit: exitPoint(pts, frame.w, frame.h) };
  });
  /* ✅ G6 (CCODE-676): *"The kind's fills stop inventing farmland. Keep the measured terrain (the river within a walk, rock
   * uphill, wood in the widest gap between roads). Fields come only from the farms rule or the entry's areas, so a gate yard
   * stops growing two fields."* With a ground entry a GENERATED field is not drawn — read at the model, so a layout already
   * cached on a save loses it too. An authored field (Millbrook's) is canon and stays. */
  // ⛑ G8: and a single place with no houses draws no generated built-up ground — that blob was sized for a town
  const extentDrawn = layout?.ground ? extentAtLevel.filter((f) => !(f.generated && f.kind === "field") && !(single && (layout.ground.dwellings === "none" || single.yard) && f.generated && f.kind === "built")) : extentAtLevel;
  /* ✅ AEVI (G8): *"Millbrook's Open Fields sits on top of its Terraced Gardens. Two field areas shouldn't overlap."* ⛑ Two pieces of
   * farmed ground that would overlap (their blobs wobble a sixth past their radius) are both drawn smaller, in proportion, until they
   * only meet — never under 60% of the size they were given. */
  const FARMED = new Set(["field", "meadow", "garden", "orchard", "pasture"]);
  const keptApart = new Map();
  {
    const fl = extentDrawn.filter((f) => FARMED.has(f.kind)).map((f) => { const at = frame.toXY(f.bearing, f.fromMetres); return { f, x: at.x, y: at.y, r: (Number(f.radiusMetres) || 150) * frame.pxPerMetre, r0: (Number(f.radiusMetres) || 150) * frame.pxPerMetre }; });
    for (let pass = 0; pass < 4; pass++) for (let i = 0; i < fl.length; i++) for (let j = i + 1; j < fl.length; j++) {
      const a = fl[i], b = fl[j], want = Math.hypot(a.x - b.x, a.y - b.y) / 1.17;
      if (a.r + b.r > want) { const k = want / (a.r + b.r); a.r = Math.max(a.r0 * 0.6, a.r * k); b.r = Math.max(b.r0 * 0.6, b.r * k); }
    }
    for (const o of fl) if (o.r < o.r0) keptApart.set(o.f, o.r);
  }
  // the extent, each as what it is
  const features = extentDrawn.map((f) => {
    const frnd = rngOf(seedOf(`extent:${id}:${f.id}`));
    // ⛑ G8: a few-house single place's built ground is the size of its site, round its own centre
    const sized = single && f.kind === "built" && f.generated;
    const at = sized ? frame.toXY(0, 0) : frame.toXY(f.bearing, f.fromMetres);
    const rPx = sized ? single.siteMetres * 0.9 * frame.pxPerMetre : keptApart.has(f) ? keptApart.get(f) : (Number(f.radiusMetres) || 150) * frame.pxPerMetre;
    const base = { ...f, x: at.x, y: at.y, rPx };
    if (f.kind === "water") return { ...base, channel: channel(f, frame, frnd) };
    const poly = blobPath(at.x, at.y, rPx, frnd, { wobble: f.kind === "built" ? 0.1 : 0.16 });
    // the road the patchwork is laid to: the nearest road out by bearing
    const nearest = roads.length ? roads.reduce((b, r) => (Math.abs(norm180(r.bearing - f.bearing)) < Math.abs(norm180(b.bearing - f.bearing)) ? r : b)) : null;
    return { ...base, poly, stripAngle: nearest ? (Number(nearest.bearing) || 0) * R : (f.bearing || 0) * R };
  });
  // ⛔ THE FORD, THE NARROWS AND THE WHEELS ARE PLACED ON THE WATER THEY ARE ABOUT. A site whose basis is
  // the river snaps to the nearest point of the channel, so the dock cannot sit in a meadow because the
  // channel bent away from the bearing the author wrote before the channel had bends.
  const water = features.find((f) => f.kind === "water") || null;
  if (water) {
    for (const s of sites) {
      if (!["dock", "ford", "mill", "bridge", "harbour"].includes(s.kind) && s.basis !== "river") continue;
      // ⛑ the nearest point ON the polyline, not its nearest vertex — the wheels and the landing are 190 m apart
      // and a vertex every 35 px put them on one point
      let best = null, bd = Infinity, bx = 0, by = 0;
      const P = water.channel.pts;
      for (let i = 0; i < P.length - 1; i++) {
        const [ax, ay] = P[i], [qx, qy] = P[i + 1];
        const vx = qx - ax, vy = qy - ay, L2 = vx * vx + vy * vy || 1;
        const tt = clamp(((s.x - ax) * vx + (s.y - ay) * vy) / L2, 0, 1);
        const px = ax + vx * tt, py = ay + vy * tt;
        const d = (px - s.x) ** 2 + (py - s.y) ** 2;
        if (d < bd) { bd = d; best = i; bx = px; by = py; }
      }
      if (best == null || Math.sqrt(bd) > water.channel.widthPx * 3 + 40 * frame.k) continue;
      const x = bx, y = by;
      const a = P[best], b = P[best + 1];
      const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
      const nx = -ty / L, ny = tx / L;
      // which bank: the one on the village's side
      const side = ((s.x - x) * nx + (s.y - y) * ny) >= 0 ? 1 : -1;
      const onBank = s.kind === "ford" ? 0 : water.channel.widthPx * 0.5;
      s.x = x + nx * side * onBank; s.y = y + ny * side * onBank; s.onWater = { i: best, tangent: [tx / L, ty / L], normal: [nx * side, ny * side] };
    }
  }
  // lanes: a site beyond the built ground that no road passes gets a lane from the nearest road or the centre
  const lanes = [];
  for (const s of sites) {
    const dC = Math.hypot(s.x - builtAt.x, s.y - builtAt.y);
    if (dC <= builtR * 1.05) continue;
    let nearRoad = null, nd = Infinity;
    for (const r of roads) for (const [x, y] of r.pts) { const d = Math.hypot(x - s.x, y - s.y); if (d < nd) { nd = d; nearRoad = [x, y]; } }
    if (nd < 9 * frame.k) continue;                    // a road already passes it
    const from = nearRoad && nd < dC ? nearRoad : [builtAt.x, builtAt.y];
    const lrnd = rngOf(seedOf(`lane:${id}:${s.id}`));
    const mid = [(from[0] + s.x) / 2 + (lrnd() - 0.5) * dC * 0.2, (from[1] + s.y) / 2 + (lrnd() - 0.5) * dC * 0.2];
    lanes.push({ to: s.id, pts: [from, mid, [s.x, s.y]] });
  }
  // contours across the measured uphill, tightening with relief
  const relief = Number(meas.relief);
  const contours = (() => {
    const out = [];
    const up = Number.isFinite(Number(meas.uphillBearing)) ? Number(meas.uphillBearing) * R : null;
    const strength = Number.isFinite(relief) ? clamp(relief, 0, 1.2) : 0;
    // spacing in px: flat ground gets a few faint lines, a hill town gets many — the spacing is the relief
    const spacing = strength <= 0.018 ? 120 : clamp(95 - strength * 110, 16, 90);
    const dirUp = up == null ? [0, -1] : [Math.sin(up), -Math.cos(up)];
    const along = [-dirUp[1], dirUp[0]];
    const reach = Math.hypot(frame.w, frame.h);
    const crnd = rngOf(seedOf(`contour:${id}`));
    const n = Math.ceil(reach / spacing);
    for (let i = -n; i <= n; i++) {
      const d = i * spacing + (crnd() - 0.5) * spacing * 0.3;
      const pts = [];
      const ph = crnd() * Math.PI * 2, amp = spacing * (0.25 + crnd() * 0.3);
      for (let k = 0; k <= 40; k++) {
        const t = -reach + (k / 40) * reach * 2;
        const off = amp * Math.sin(t / (reach * 0.18) + ph) + amp * 0.4 * Math.sin(t / (reach * 0.05) + ph * 2);
        pts.push([frame.cx + dirUp[0] * (d + off) + along[0] * t, frame.cy + dirUp[1] * (d + off) + along[1] * t]);
      }
      out.push(pts);
    }
    return { lines: out, strength, spacing };
  })();
  // ✅ G2: the houses the ground says there are, laid out as it says — only on the surface, and only where there is an entry
  const onSurface = !((Number(level) || 0) < 0);
  // ⚠️ Number(null) is 0, a bearing — an unmeasured uphill stays unmeasured (it had been read as due up-map)
  const uphillB = meas.uphillBearing != null && Number.isFinite(Number(meas.uphillBearing)) ? Number(meas.uphillBearing) : null;
  /* ✅ G4/G5 (CCODE-675): what stands on the ground, placed BEFORE the houses so they keep clear of it; what is `among`
   * the houses after them. Only on the surface, and only where there is an entry. */
  const ground = (layout?.ground && onSurface)
    ? placeGround({ ground: layout.ground, kinds: layout.groundKinds, frame, built: { ...builtAt, r: builtR }, roads, lanes, sites, water, uphill: uphillB, fields: features.filter((f) => f.kind === "field"), rnd: rngOf(seedOf("ground:" + id)), metric: single ? { pxPerMetre: frame.pxPerMetre, single } : null })
    : null;
  const houses = (layout?.ground && onSurface)
    ? groundHouses({ ground: layout.ground, frame, built: { ...builtAt, r: builtR }, roads, lanes, sites, water, features, id, uphill: uphillB, blocked: ground?.blocked || null, streamLine: ground?.streamLine || null, pools: (ground?.areas || []).filter((a) => a.k === "water") })
    // ✅ SNG-679 H6: a hold's own map draws its FEATURES — no roofs invented along its road (the old rule drew a street down
    // Stillwater's Trouble's way in, and roofs the size of the hull on the open sea round the Grey Gull)
    : (layout?.hold ? [] : null);
  if (ground) finishGround(ground, houses || []);
  return { id, placeName, frame, layout, sites, roads, lanes, features, contours, built: { ...builtAt, r: builtR }, water, rnd, level: Number(level) || 0, houses, ground, single };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// THE PAINTER. Paper, then ground, then water, then ways, then sites, then the furniture. Labels go through
// the shared table and space (SNG-677 §0): `space` and `queue` are injected by the caller so this tier's
// labels sit in the same queue the region map flushes — *"nothing in this tier draws a label any other way."*

const INK = {
  paper: "#efe8d6", paperEdge: "#d9cfb6", contour: "rgba(120,98,66,0.20)",
  water: "#6f9fc2", waterDeep: "#5d8fb5", bank: "rgba(58,90,120,0.55)", reed: "rgba(96,122,88,0.75)", sand: "#e6d6ad",
  field: "#e3dfae", fieldAlt: "#d6d49a", fieldLine: "rgba(140,128,70,0.42)", meadow: "#d6e2bd", grass: "rgba(102,132,84,0.55)",
  wood: "#6f9a63", woodEdge: "rgba(40,72,36,0.7)", stool: "rgba(90,60,30,0.6)",
  built: "rgba(196,166,132,0.35)", builtEdge: "rgba(140,104,74,0.35)", roof: "#8d4a3a", roofEdge: "rgba(60,26,18,0.8)",
  road: "#c9a978", roadEdge: "#8a6b44", lane: "#d9c8a4", laneEdge: "rgba(120,96,60,0.7)",
  rock: "rgba(150,142,128,0.5)", rockLine: "rgba(80,74,64,0.55)", waste: "rgba(150,140,120,0.3)", wasteDot: "rgba(90,80,64,0.45)", marsh: "#cfdcc3",
  glyph: "rgba(34,28,22,0.92)", glyphFill: "rgba(250,246,234,0.92)", glyphAccent: "#3f7fb0",
  legend: "rgba(40,34,26,0.85)",
};

function strokePath(ctx, pts, close = false) {
  if (!pts || pts.length < 2) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}
/** a smooth polyline through the points (Catmull-Rom via quadratic midpoints) */
function smoothPath(ctx, pts, close = false) {
  if (!pts || pts.length < 2) return;
  ctx.beginPath();
  if (close) {
    const n = pts.length;
    const m0 = [(pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2];
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.closePath();
    return;
  }
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  const last = pts[pts.length - 1]; ctx.lineTo(last[0], last[1]);
}

function paintFeature(ctx, f, model, rnd, wv = null) {
  const { frame } = model;
  const s = frame.pxPerMetre;
  if (f.kind === "water") {
    const ch = f.channel;
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    /* ✅ AEVI's S5 table: *"water damaged / ruined / destroyed — channel narrowed, then dry"*. Fouled narrows it and muddies it,
     * running low narrows it further and pales it, run dry leaves a bed of sand between its two banks, dashed. */
    const ws = wv?.state || "whole";
    if (ws === "destroyed") {
      ctx.strokeStyle = INK.sand; ctx.lineWidth = ch.widthPx; smoothPath(ctx, ch.pts); ctx.stroke();
      ctx.strokeStyle = INK.bank; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      for (const side of [1, -1]) {
        ctx.beginPath();
        ch.pts.forEach(([x, y], k) => { const a = ch.pts[Math.max(0, k - 1)], b = ch.pts[Math.min(ch.pts.length - 1, k + 1)]; const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
          ctx[k ? "lineTo" : "moveTo"](x + (-ty / L) * side * ch.widthPx / 2, y + (tx / L) * side * ch.widthPx / 2); });
        ctx.stroke();
      }
      ctx.setLineDash([]); ctx.restore();
      return;
    }
    const narrow = ws === "damaged" ? 0.65 : ws === "ruined" ? 0.35 : 1;
    // the channel
    ctx.strokeStyle = ws === "damaged" ? "#7f8f86" : ws === "ruined" ? "#a9bfcc" : INK.water; ctx.lineWidth = ch.widthPx * narrow;
    smoothPath(ctx, ch.pts); ctx.stroke();
    // a darker thread down the middle reads as depth
    ctx.strokeStyle = INK.waterDeep; ctx.lineWidth = Math.max(1, ch.widthPx * 0.35 * narrow); ctx.globalAlpha = ws === "ruined" ? 0.25 : 0.5;
    smoothPath(ctx, ch.pts); ctx.stroke();
    ctx.globalAlpha = 1;
    // the narrows: where a ford sits, the channel pinches just upstream and runs white over the stones
    const ford = model.sites.find((q) => q.kind === "ford" && q.onWater);
    if (ford) {
      const i0 = ford.onWater.i;
      /* ⚠️ `up[k]` is `ch.pts[s0 + k]`, and the neighbours were indexed as `i0 - 7 + k` — the same only when the ford is at
       * least seven points into the channel. In Millbrook's enlargement the ford sits at the channel's start, the index went
       * negative and the whole local tier threw (CCODE-676, found painting the panel). Indexed from where the slice starts. */
      const s0 = Math.max(0, i0 - 7);
      const up = ch.pts.slice(s0, Math.max(1, i0 - 1));
      if (up.length > 1) {
        ctx.strokeStyle = INK.paper; ctx.lineWidth = ch.widthPx * 0.42; ctx.globalAlpha = 0.9;
        // two paper strokes along the banks pinch the water between them
        for (const side of [1, -1]) {
          ctx.beginPath();
          for (let k = 0; k < up.length; k++) {
            const [x, y] = up[k];
            const a = ch.pts[Math.max(0, s0 + k - 1)], b = ch.pts[Math.min(ch.pts.length - 1, s0 + k + 1)];
            const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
            const pinch = Math.sin((k / Math.max(1, up.length - 1)) * Math.PI) * ch.widthPx * 0.3;
            ctx[k ? "lineTo" : "moveTo"](x + (-ty / L) * side * (ch.widthPx / 2 + ch.widthPx * 0.2 - pinch), y + (tx / L) * side * (ch.widthPx / 2 + ch.widthPx * 0.2 - pinch));
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // rapids: three white zigzags across the narrows
        ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = Math.max(0.8, ch.widthPx * 0.08);
        for (let k = 1; k < up.length - 1; k += 2) {
          const [x, y] = up[k];
          const a = up[k - 1], b = up[k + 1];
          const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
          const nx = -ty / L, ny = tx / L, z = ch.widthPx * 0.16;
          ctx.beginPath();
          ctx.moveTo(x - nx * z * 1.6, y - ny * z * 1.6);
          ctx.lineTo(x - nx * z * 0.5 + tx / L * z * 0.5, y - ny * z * 0.5 + ty / L * z * 0.5);
          ctx.lineTo(x + nx * z * 0.5 - tx / L * z * 0.5, y + ny * z * 0.5 - ty / L * z * 0.5);
          ctx.lineTo(x + nx * z * 1.6, y + ny * z * 1.6);
          ctx.stroke();
        }
      }
    }
    // banks
    ctx.strokeStyle = INK.bank; ctx.lineWidth = Math.max(0.6, Math.min(1.4, ch.widthPx * 0.06));
    smoothPath(ctx, ch.banks[0]); ctx.stroke();
    smoothPath(ctx, ch.banks[1]); ctx.stroke();
    // sandbars on the insides of the bends
    ctx.fillStyle = INK.sand; ctx.strokeStyle = "rgba(150,130,80,0.5)"; ctx.lineWidth = 0.6;
    for (const b of ch.bars) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang);
      ctx.beginPath(); ctx.ellipse(0, 0, Math.min(b.rx, ch.widthPx * 1.4), Math.max(0.8, b.ry), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // reeds: short ticks along the outside of the banks, every so often
    ctx.strokeStyle = INK.reed; ctx.lineWidth = 0.7;
    for (const bank of ch.banks) {
      for (let i = 2; i < bank.length - 2; i += 2) {
        if (rnd() < 0.45) continue;
        const [x, y] = bank[i];
        const a = bank[i - 1], b = bank[i + 1];
        const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
        const out = bank === ch.banks[0] ? 1 : -1;
        const nx = -ty / L * out, ny = tx / L * out;
        const len = Math.max(2, ch.widthPx * 0.18);
        for (let k = -1; k <= 1; k++) {
          const ox = x + tx / L * k * len * 0.5, oy = y + ty / L * k * len * 0.5;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + nx * len + (k * 0.3) * nx * len, oy + ny * len); ctx.stroke();
        }
      }
    }
    ctx.restore();
    return;
  }
  const poly = f.poly;
  ctx.save();
  smoothPath(ctx, poly, true);
  if (f.kind === "field") {
    const meadow = /meadow|wet|pasture|graz|marsh|common/i.test(String(f.name || "")) || f.marsh;
    ctx.fillStyle = meadow ? INK.meadow : INK.field;
    ctx.fill();
    ctx.clip();
    if (meadow) {
      // grass: short double ticks scattered over the ground
      ctx.strokeStyle = INK.grass; ctx.lineWidth = 0.7;
      const n = Math.round((f.rPx * f.rPx) / 140);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * f.rPx * 1.1;
        const x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d;
        ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x - 1, y - 1.5); ctx.moveTo(x + 1.5, y + 2); ctx.lineTo(x + 2, y - 1); ctx.stroke();
      }
    } else {
      // ⛔ STRIP PATCHWORK, LAID TO THE NEAREST ROAD: parallel strips of seeded widths, every third a shade
      // off, with the strip lines running the way the road does — which is how fields are actually laid out.
      const ang = f.stripAngle;
      const dir = [Math.sin(ang), -Math.cos(ang)], nrm = [-dir[1], dir[0]];
      const stripW = Math.max(4, Math.min(16, 55 * s));          // ~55 m strips, never under 4 px
      let d = -f.rPx * 1.2;
      let k = 0;
      while (d < f.rPx * 1.2) {
        const w = stripW * (0.7 + rnd() * 0.8);
        if (rnd() < 0.3) { ctx.fillStyle = k % 2 ? INK.fieldAlt : INK.field; ctx.globalAlpha = 0.9;
          const L = f.rPx * 1.3;
          ctx.beginPath();
          ctx.moveTo(f.x + nrm[0] * d - dir[0] * L, f.y + nrm[1] * d - dir[1] * L);
          ctx.lineTo(f.x + nrm[0] * (d + w) - dir[0] * L, f.y + nrm[1] * (d + w) - dir[1] * L);
          ctx.lineTo(f.x + nrm[0] * (d + w) + dir[0] * L, f.y + nrm[1] * (d + w) + dir[1] * L);
          ctx.lineTo(f.x + nrm[0] * d + dir[0] * L, f.y + nrm[1] * d + dir[1] * L);
          ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
        ctx.strokeStyle = INK.fieldLine; ctx.lineWidth = 0.6;
        const L = f.rPx * 1.3;
        ctx.beginPath();
        ctx.moveTo(f.x + nrm[0] * d - dir[0] * L, f.y + nrm[1] * d - dir[1] * L);
        ctx.lineTo(f.x + nrm[0] * d + dir[0] * L, f.y + nrm[1] * d + dir[1] * L);
        ctx.stroke();
        d += w; k++;
      }
      // the headland lines across the strips, a few, so the patchwork has ends
      ctx.strokeStyle = INK.fieldLine; ctx.lineWidth = 0.7;
      for (let i = 0; i < 3; i++) {
        const t = (rnd() - 0.5) * f.rPx * 1.6;
        ctx.beginPath();
        ctx.moveTo(f.x + dir[0] * t - nrm[0] * f.rPx * 1.3, f.y + dir[1] * t - nrm[1] * f.rPx * 1.3);
        ctx.lineTo(f.x + dir[0] * t + nrm[0] * f.rPx * 1.3, f.y + dir[1] * t + nrm[1] * f.rPx * 1.3);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.save(); smoothPath(ctx, poly, true); ctx.strokeStyle = INK.fieldLine; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
    return;
  }
  if (f.kind === "wood") {
    const coppice = /coppice|copse|cut/i.test(String(f.name || ""));
    ctx.fillStyle = "rgba(111,154,99,0.18)"; ctx.fill();
    ctx.clip();
    // ⛔ TREE CROWNS, NOT A GREEN BLOB. Crowns of ~12 m, packed on a jittered grid and clipped to the blob;
    // a coppice shows smaller crowns and the cut stools between them.
    const crown = Math.max(2.2, (coppice ? 7 : 12) * s);
    const step = crown * 1.55;
    ctx.fillStyle = INK.wood; ctx.strokeStyle = INK.woodEdge; ctx.lineWidth = 0.6;
    for (let y = f.y - f.rPx * 1.2; y < f.y + f.rPx * 1.2; y += step) {
      for (let x = f.x - f.rPx * 1.2; x < f.x + f.rPx * 1.2; x += step) {
        if (rnd() < 0.22) continue;
        const jx = (rnd() - 0.5) * step * 0.9, jy = (rnd() - 0.5) * step * 0.9;
        const r = crown * (0.7 + rnd() * 0.6);
        ctx.beginPath(); ctx.arc(x + jx, y + jy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (coppice && rnd() < 0.3) { ctx.fillStyle = INK.stool; ctx.beginPath(); ctx.arc(x + jx + r * 0.8, y + jy + r * 0.6, Math.max(0.8, r * 0.25), 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK.wood; }
      }
    }
    ctx.restore();
    return;
  }
  if (f.kind === "clearing") {
    // ✅ SNG-679 S8: ground CLEARED — kept ground, pale, its edge dashed
    ctx.fillStyle = "#e9e6cc"; ctx.fill();
    ctx.strokeStyle = "rgba(140,128,90,0.6)"; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    return;
  }
  if (f.kind === "built") {
    // ✅ G2: *"`none` draws no roofs. The built ground then draws as what its features say … or not at all."*
    if (model.layout?.ground?.dwellings === "none") { ctx.restore(); return; }
    ctx.fillStyle = INK.built; ctx.fill();
    ctx.strokeStyle = INK.builtEdge; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    return;
  }
  if (f.kind === "rock") {
    ctx.fillStyle = INK.rock; ctx.fill(); ctx.clip();
    ctx.strokeStyle = INK.rockLine; ctx.lineWidth = 0.8;
    // hachures: short strokes down the slope
    const ang = (model.layout?._measured?.uphillBearing ?? 0) * R;
    const dir = [Math.sin(ang), -Math.cos(ang)];
    const n = Math.round((f.rPx * f.rPx) / 60);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * f.rPx;
      const x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d, L = 2 + rnd() * 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir[0] * L, y + dir[1] * L); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); smoothPath(ctx, poly, true); ctx.strokeStyle = INK.rockLine; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    return;
  }
  if (f.kind === "marsh") {
    ctx.fillStyle = INK.marsh; ctx.fill(); ctx.clip();
    ctx.strokeStyle = INK.reed; ctx.lineWidth = 0.7;
    const n = Math.round((f.rPx * f.rPx) / 110);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * f.rPx * 1.1;
      const x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d;
      ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.moveTo(x, y); ctx.lineTo(x, y - 3); ctx.stroke();
    }
    ctx.restore();
    return;
  }
  // waste, and anything unnamed: a stipple
  ctx.fillStyle = INK.waste; ctx.fill(); ctx.clip();
  ctx.fillStyle = INK.wasteDot;
  const n = Math.round((f.rPx * f.rPx) / 90);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * f.rPx * 1.1;
    ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 0.8 + rnd() * 0.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** ⛔ ROOFS ALONG THE ROADS. Houses are where the ways are: a small rotated block either side of every road
 *  and lane within the built ground, at seeded spacing, and a ring of them around any open site (a green,
 *  a square). Each roof is ~9 m, so the picture densifies honestly as the frame closes in. */
function paintRoofs(ctx, model, rnd) {
  const { frame, built } = model;
  const s = frame.pxPerMetre;
  const roofL = Math.max(2.2, 9 * s), roofW = Math.max(1.6, 6 * s), gap = Math.max(3, 14 * s);
  // ✅ G2: a place with a ground entry draws ITS houses — the count and the arrangement its entry says — and nothing else
  if (Array.isArray(model.houses)) {
    ctx.save();
    for (const h of model.houses) {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.ang);
      if (h.style === "dug") { ctx.fillStyle = "rgba(48,38,30,0.85)"; ctx.beginPath(); ctx.ellipse(0, 0, roofL * 0.42, roofW * 0.45, 0, 0, Math.PI * 2); ctx.fill(); }
      else if (h.style === "tent") { ctx.fillStyle = "#cdb98f"; ctx.strokeStyle = INK.roofEdge; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-roofL * 0.45, roofW * 0.4); ctx.lineTo(0, -roofW * 0.6); ctx.lineTo(roofL * 0.45, roofW * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (h.style === "hull") { ctx.fillStyle = "#7a5a3a"; ctx.strokeStyle = INK.roofEdge; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.ellipse(0, 0, roofL * 0.6, roofW * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      else {
        if (h.style === "stilt") { ctx.strokeStyle = INK.roofEdge; ctx.lineWidth = 0.6; for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { ctx.beginPath(); ctx.moveTo(px * roofL * 0.5, py * roofW * 0.5); ctx.lineTo(px * roofL * 0.7, py * roofW * 0.8); ctx.stroke(); } }
        ctx.fillStyle = INK.roof; ctx.strokeStyle = INK.roofEdge; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.rect(-roofL / 2, -roofW / 2, roofL, roofW); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
    return;
  }
  const inBuilt = (x, y) => Math.hypot(x - built.x, y - built.y) <= built.r * 1.02;
  ctx.save();
  ctx.fillStyle = INK.roof; ctx.strokeStyle = INK.roofEdge; ctx.lineWidth = 0.5;
  const roof = (x, y, ang) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.rect(-roofL / 2, -roofW / 2, roofL, roofW); ctx.fill(); ctx.stroke(); ctx.restore(); };
  const ways = [...model.roads.map((r) => r.pts), ...model.lanes.map((l) => l.pts)];
  for (const pts of ways) {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const L = Math.hypot(bx - ax, by - ay) || 1;
      const tx = (bx - ax) / L, ty = (by - ay) / L, nx = -ty, ny = tx;
      for (let t = acc; t < L; t += gap) {
        const x = ax + tx * t, y = ay + ty * t;
        if (!inBuilt(x, y)) continue;
        const off = Math.max(2.5, 7 * s) + roofW * 0.6;
        for (const side of [1, -1]) {
          if (rnd() < 0.28) continue;
          const jit = (rnd() - 0.5) * gap * 0.4;
          roof(x + nx * side * off + tx * jit, y + ny * side * off + ty * jit, Math.atan2(ty, tx) + (rnd() - 0.5) * 0.25);
        }
      }
      acc = (acc - L) % gap; if (acc < 0) acc += gap;
    }
  }
  // the ring around an open site
  for (const site of model.sites) {
    if (!["green", "square"].includes(site.kind)) continue;
    const r = Math.max(6, 28 * s);
    const n = Math.max(5, Math.round((2 * Math.PI * r) / gap));
    for (let i = 0; i < n; i++) {
      if (rnd() < 0.2) continue;
      const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
      roof(site.x + Math.cos(a) * r, site.y + Math.sin(a) * r, a + Math.PI / 2);
    }
  }
  ctx.restore();
}

/* ═════ THE LOCAL GROUND, G4 · THE PAINTER (CCODE-675) ═════
 * ✅ AEVI: *"marks as glyphs, lines as lines, areas as fills … `state` changes the drawing: `abandoned` dimmed with roofs
 * fallen, `unfinished` an outline with scaffold, `dead` grey, `sealed` capped, `razed` and `former` as footprints only."*
 * The geometry is `localground.js`'s; this only puts ink down. A fill the map already knows (field, wood, rock, marsh,
 * waste) is drawn by the same hand as the measured ground, so a ground wood and a measured wood read as one wood. */
const GINK = {
  orchard: "#dfe6c0", orchardTree: "#7fa463", ash: "#cbc8c1", ashDot: "rgba(90,88,84,0.45)", glass: "#d3e7ea", glassLine: "rgba(255,255,255,0.95)",
  grass: "#d9e6c2", heath: "#ddd5ab", heathDot: "rgba(110,104,60,0.55)", mud: "#c2ac88", mudLine: "rgba(96,74,48,0.5)",
  burnt: "#8f8881", stump: "rgba(30,24,20,0.8)", salt: "#f4f2ec", saltLine: "rgba(150,146,136,0.75)", blocks: "#cfc8ba", blockLine: "rgba(110,100,86,0.75)",
  clearing: "#e9e6cc", clearingEdge: "rgba(140,128,90,0.6)", drop: "rgba(70,58,46,0.34)", dropLine: "rgba(60,46,34,0.9)", pool: "#7ea9c9",
  dead: "#b2aea6", stream: "#6f9fc2", pipe: "#7d828a", trench: "#5d4a34", hedge: "#5f7f4b", chain: "#55524e",
  beam: "rgba(255,236,160,0.5)", beamCore: "#fff7cf", shaft: "#6e6a64", wall: "#8f8678", wallEdge: "rgba(60,54,46,0.85)", path: "rgba(140,112,72,0.85)",
};
function walkLine(pts, step, cb) {
  let carry = 0;
  for (let i = 1; i < (pts || []).length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay) || 1e-9, tx = (bx - ax) / L, ty = (by - ay) / L;
    let t = carry;
    for (; t < L; t += step) cb(ax + tx * t, ay + ty * t, tx, ty);
    carry = t - L;
  }
}
function paintGroundArea(ctx, a, model, rnd) {
  const s = model.frame.pxPerMetre, dead = a.state === "dead";
  const reuse = { field: "field", pasture: "field", garden: "field", wood: "wood", marsh: "marsh", rock: "rock", waste: "waste" }[a.k];
  if (reuse && !dead) {
    paintFeature(ctx, { kind: reuse, poly: a.poly, x: a.x, y: a.y, rPx: a.rPx, name: a.k === "pasture" ? "pasture" : "", stripAngle: a.stripAngle }, model, rnd);
  } else {
    // ⛑ the texture is counted by the part of the fill INSIDE the frame — a band across the whole map is not a million specks
    const xs = a.poly.map((p) => p[0]), ys = a.poly.map((p) => p[1]);
    const x0 = Math.max(0, Math.min(...xs)), x1 = Math.min(model.frame.w, Math.max(...xs)), y0 = Math.max(0, Math.min(...ys)), y1 = Math.min(model.frame.h, Math.max(...ys));
    const bw = Math.max(0, x1 - x0), bh = Math.max(0, y1 - y0);
    const count = (per) => Math.min(1400, Math.round((bw * bh) / per));
    const spot = () => [x0 + rnd() * bw, y0 + rnd() * bh];
    const fills = { orchard: GINK.orchard, ash: GINK.ash, glass: GINK.glass, grass: GINK.grass, heath: GINK.heath, mud: GINK.mud, burnt: GINK.burnt,
      salt_pans: GINK.salt, blocks: GINK.blocks, clearing: GINK.clearing, water: a.state === "fouled" ? "#7f8f86" : GINK.pool, drop: GINK.drop };
    ctx.save(); smoothPath(ctx, a.poly, true);
    ctx.fillStyle = dead && a.k !== "water" ? GINK.dead : (fills[a.k] || INK.waste); ctx.fill(); ctx.clip();
    switch (a.k) {
      case "orchard": {
        // fruit trees in rows, laid to the road like the fields; dead, the bare crowns only
        const ang = a.stripAngle || 0, dx = Math.cos(ang), dy = Math.sin(ang), step = Math.max(4.5, 14 * s), r = Math.max(1.3, 4.5 * s);
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, RR = Math.hypot(bw, bh) / 2 + step;
        ctx.fillStyle = GINK.orchardTree; ctx.strokeStyle = dead ? "rgba(96,92,86,0.85)" : INK.woodEdge; ctx.lineWidth = 0.5;
        for (let u = -RR; u <= RR; u += step) for (let v = -RR; v <= RR; v += step * 1.25) { const x = cx + dx * u - dy * v, y = cy + dy * u + dx * v; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (!dead) ctx.fill(); ctx.stroke(); }
        break;
      }
      case "ash": ctx.fillStyle = GINK.ashDot; for (let i = 0; i < count(70); i++) { const [x, y] = spot(); ctx.fillRect(x, y, 1.2, 1.2); } break;
      case "glass": ctx.strokeStyle = GINK.glassLine; ctx.lineWidth = 0.8; for (let i = 0; i < count(240); i++) { const [x, y] = spot(), L = 3 + rnd() * 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y - L * 0.6); ctx.stroke(); } break;
      case "grass": ctx.strokeStyle = INK.grass; ctx.lineWidth = 0.7; for (let i = 0; i < count(150); i++) { const [x, y] = spot(); ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x - 1, y - 1.5); ctx.moveTo(x + 1.5, y + 2); ctx.lineTo(x + 2, y - 1); ctx.stroke(); } break;
      case "heath": ctx.fillStyle = GINK.heathDot; for (let i = 0; i < count(90); i++) { const [x, y] = spot(); ctx.beginPath(); ctx.arc(x, y, 0.9 + rnd() * 1.1, 0, Math.PI * 2); ctx.fill(); } break;
      case "mud": ctx.strokeStyle = GINK.mudLine; ctx.lineWidth = 0.9; for (let i = 0; i < count(150); i++) { const [x, y] = spot(); ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.quadraticCurveTo(x, y - 2, x + 3, y); ctx.stroke(); } break;
      case "burnt": ctx.fillStyle = GINK.stump; ctx.strokeStyle = GINK.stump; ctx.lineWidth = 0.7; for (let i = 0; i < count(140); i++) { const [x, y] = spot(); ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1.5, y - 2.5); ctx.stroke(); } break;
      case "salt_pans": case "blocks": {
        // squares in rows: white pans with their dykes; ground resolved into stacked units, some lifted
        const step = a.k === "salt_pans" ? Math.max(5, 18 * s) : Math.max(4, 12 * s);
        ctx.strokeStyle = a.k === "salt_pans" ? GINK.saltLine : GINK.blockLine; ctx.lineWidth = 0.7;
        for (let x = x0 - (x0 % step); x < x1; x += step) for (let y = y0 - (y0 % step); y < y1; y += step) {
          const o = a.k === "blocks" && rnd() < 0.35 ? 1.2 : 0;
          ctx.strokeRect(x + 1 + o, y + 1 - o, step - 2, step - 2);
          if (o) { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x + 1 + o, y + 1 - o, step - 2, 2); }
        }
        break;
      }
      case "drop": case "water": case "clearing": break;
      default:
        // a dead wood or marsh: grey, the crowns bare
        if (dead) { ctx.strokeStyle = "rgba(104,100,94,0.75)"; ctx.lineWidth = 0.6; for (let i = 0; i < count(110); i++) { const [x, y] = spot(); ctx.beginPath(); ctx.arc(x, y, 1.6 + rnd() * 1.4, 0, Math.PI * 2); ctx.stroke(); } }
    }
    ctx.restore();
    ctx.save();
    if (a.k === "drop" && a.edge) {
      // the lip, and the hachures falling away from it
      ctx.strokeStyle = GINK.dropLine; ctx.lineWidth = 1.5; strokePath(ctx, a.edge); ctx.stroke();
      ctx.lineWidth = 0.8;
      walkLine(a.edge, 5, (x, y) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + a.dir[0] * 6.5, y + a.dir[1] * 6.5); ctx.stroke(); });
    } else if (a.k === "water") { smoothPath(ctx, a.poly, true); ctx.strokeStyle = INK.bank; ctx.lineWidth = 1; ctx.stroke(); }
    else if (a.k === "clearing") { smoothPath(ctx, a.poly, true); ctx.strokeStyle = GINK.clearingEdge; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]); ctx.stroke(); }
    else { smoothPath(ctx, a.poly, true); ctx.strokeStyle = "rgba(120,100,70,0.35)"; ctx.lineWidth = 0.7; ctx.stroke(); }
    ctx.restore();
  }
  if (a.own && a.k !== "drop") { ctx.save(); smoothPath(ctx, a.poly, true); ctx.strokeStyle = "rgba(60,40,24,0.6)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
}
function paintGroundLine(ctx, l, model) {
  const w = l.own ? 1.5 : 1;
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (l.state === "unfinished") ctx.setLineDash([5, 4]);
  if (l.state === "dead" || l.state === "empty" || l.state === "abandoned") ctx.globalAlpha = 0.55;
  switch (l.k) {
    case "stream":
      ctx.strokeStyle = INK.bank; ctx.lineWidth = l.half * 2 + 1.2; smoothPath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = l.state === "fouled" ? "#7f8f86" : GINK.stream; ctx.lineWidth = l.half * 2; smoothPath(ctx, l.pts); ctx.stroke();
      break;
    case "channel":
      // a cut channel: straight banks, square ends
      ctx.lineCap = "butt"; ctx.lineJoin = "miter";
      ctx.strokeStyle = INK.bank; ctx.lineWidth = l.half * 2 + 2 * w; strokePath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = GINK.stream; ctx.lineWidth = l.half * 2; strokePath(ctx, l.pts); ctx.stroke();
      break;
    case "pipe_run":
      ctx.strokeStyle = GINK.pipe; ctx.lineWidth = 2.6 * w; strokePath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = "rgba(222,224,228,0.8)"; ctx.lineWidth = 0.8; strokePath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = GINK.pipe; ctx.lineWidth = 1;
      walkLine(l.pts, 10, (x, y, tx, ty) => { ctx.beginPath(); ctx.moveTo(x - ty * 2.4, y + tx * 2.4); ctx.lineTo(x + ty * 2.4, y - tx * 2.4); ctx.stroke(); });
      break;
    case "trench":
      ctx.strokeStyle = GINK.trench; ctx.lineWidth = 3 * w; smoothPath(ctx, l.pts); ctx.stroke();
      ctx.lineWidth = 0.7;
      walkLine(l.pts, 4, (x, y, tx, ty) => { for (const sd of [1, -1]) { ctx.beginPath(); ctx.moveTo(x - ty * sd * 2, y + tx * sd * 2); ctx.lineTo(x - ty * sd * 4.2, y + tx * sd * 4.2); ctx.stroke(); } });
      break;
    case "hedgerow":
      ctx.fillStyle = GINK.hedge; ctx.strokeStyle = "rgba(40,64,32,0.7)"; ctx.lineWidth = 0.5;
      walkLine(l.pts, 2.6, (x, y) => { ctx.beginPath(); ctx.arc(x + Math.sin(x * 7.1 + y) * 0.6, y + Math.cos(x + y * 5.3) * 0.6, 1.5 + Math.abs(Math.sin(x * 3 + y)) * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      break;
    case "chain": {
      ctx.strokeStyle = GINK.chain; ctx.lineWidth = 0.9; let k = 0;
      walkLine(l.pts, 4, (x, y, tx, ty) => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(ty, tx)); ctx.beginPath(); ctx.ellipse(0, 0, 2.6, k++ % 2 ? 0.9 : 1.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); });
      break;
    }
    case "beam":
      ctx.strokeStyle = GINK.beam; ctx.lineWidth = 6 * w; strokePath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = GINK.beamCore; ctx.lineWidth = 1.4; strokePath(ctx, l.pts); ctx.stroke();
      break;
    case "drive_shaft":
      ctx.strokeStyle = GINK.shaft; ctx.lineWidth = 2 * w; strokePath(ctx, l.pts); ctx.stroke();
      ctx.lineWidth = 1;
      walkLine(l.pts, 7, (x, y, tx, ty) => { ctx.beginPath(); ctx.moveTo(x - ty * 3, y + tx * 3); ctx.lineTo(x + ty * 3, y - tx * 3); ctx.stroke(); });
      break;
    case "wall":
      ctx.strokeStyle = GINK.wallEdge; ctx.lineWidth = 3.4 * w; smoothPath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = GINK.wall; ctx.lineWidth = 2 * w; smoothPath(ctx, l.pts); ctx.stroke();
      break;
    case "track":
      // a farm track: a lane's colours, thinner, solid
      ctx.strokeStyle = INK.laneEdge; ctx.lineWidth = 2; smoothPath(ctx, l.pts); ctx.stroke();
      ctx.strokeStyle = INK.lane; ctx.lineWidth = 1; smoothPath(ctx, l.pts); ctx.stroke();
      break;
    default:
      // a path or track
      ctx.setLineDash(l.state === "unfinished" ? [2, 4] : [4, 3]); ctx.strokeStyle = GINK.path; ctx.lineWidth = 1.3 * w; smoothPath(ctx, l.pts); ctx.stroke();
  }
  ctx.restore();
}
/** The deck a moving hold stands on, in the frame's metres. Returns its shape. */
function paintDeck(ctx, model) {
  const d = model.layout.deck, f = model.frame, s = f.pxPerMetre;
  const L = (Number(d.lengthMetres) || 30) * s, hd = (Number(d.heading) || 0) * R;
  const ux = Math.sin(hd), uy = -Math.cos(hd), nx = -uy, ny = ux, cx = f.cx, cy = f.cy;
  const at = (t, o) => [cx + ux * t + nx * o, cy + uy * t + ny * o];
  ctx.save();
  ctx.fillStyle = "rgba(160,122,82,0.88)"; ctx.strokeStyle = "rgba(70,44,24,0.9)"; ctx.lineWidth = 1.4;
  if (d.shape === "line") {
    const W = L * 0.3;
    const pts = [at(L * 0.62, 0), at(L * 0.3, W / 2), at(-L * 0.46, W / 2 * 0.9), at(-L * 0.52, 0), at(-L * 0.46, -W / 2 * 0.9), at(L * 0.3, -W / 2)];
    smoothPath(ctx, pts, true); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(70,44,24,0.35)"; ctx.lineWidth = 0.7;
    for (const o of [-W * 0.22, 0, W * 0.22]) { const a = at(-L * 0.44, o), b = at(L * 0.36, o * 0.6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  } else if (d.shape === "ring") {
    ctx.lineWidth = L * 0.16; ctx.strokeStyle = "rgba(160,122,82,0.88)";
    ctx.beginPath(); ctx.arc(cx, cy, L * 0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(70,44,24,0.9)";
    for (const r of [L * 0.35 - L * 0.08, L * 0.35 + L * 0.08]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
  } else if (d.shape === "stack") {
    const pts = [at(L / 2, L * 0.28), at(L / 2, -L * 0.28), at(-L / 2, -L * 0.28), at(-L / 2, L * 0.28)];
    strokePath(ctx, pts, true); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  return d.shape;
}
const TURNS = new Set(["boats", "bridge", "ford", "stacks", "shed", "column", "footings"]);
/* ═════ G8 · THE OWN THING, DRAWN AS WHAT IT IS ═════
 * ✅ AEVI: *"A building is a footprint, not an icon: a cathedral 60–80 m, the half that stands solid and the rest in scaffold; a
 * temple 30–50 m; a shrine 8–15 m with its court; a cabin one roof. Draw it on the ground at metres, never under 40 px across on
 * screen."* ⛑ A plan seen from above, its long side along the road it is entered by (`footprint.ang`), its width the kind's own
 * proportion. Its state is drawn on the plan: unfinished open ribs in scaffold, razed only the dashed footprint, abandoned faded. */
const FOOT_W = Object.freeze({ temple: 0.45, shrine: 1, hall: 0.6, inn: 0.5, store: 0.7, works: 0.62, market: 0.85, stair: 0.42, gate: 0.32,
  forge: 0.7, mill: 0.7, terrace: 0.5, court: 1, square: 1, arena: 0.76, bridge: 0.22, footings: 0.6, wall: 0.08 });
function drawFootprint(ctx, m) {
  const L = Number(m.footprint?.px) || 40, k = m.k, st = m.state;
  const W = L * (FOOT_W[k] ?? 0.62);
  const wall = "rgba(52,40,30,0.92)", stone = "#dccfb5", roofLine = "rgba(120,92,62,0.55)", sand = "#e4d4ae", dark = "rgba(46,40,58,0.82)";
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Number(m.footprint?.ang) || 0);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (st === "abandoned") ctx.globalAlpha = 0.62; else if (st === "empty" || st === "dead") ctx.globalAlpha = 0.72;
  const rect = (x0, y0, w, h, fill = stone, lw = 1.4) => { ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = lw; ctx.stroke(); };
  const ridge = (x0, x1) => { ctx.strokeStyle = roofLine; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke(); };
  // its own ground under it: the shrine's court, the swept ground a cairn or a post stands in (see `placeGround`'s apron)
  const apron = Number(m.footprint?.apron) || 0;
  if (apron > 0) {
    ctx.beginPath(); ctx.arc(0, 0, apron, 0, Math.PI * 2); ctx.fillStyle = "rgba(228,216,188,0.6)"; ctx.fill();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(120,96,66,0.55)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
  }
  if (st === "razed" || st === "former") {
    // where it stood: the footprint dashed, nothing standing in it
    ctx.globalAlpha = st === "former" ? 0.5 : 0.85; ctx.setLineDash([4, 3]); ctx.strokeStyle = wall; ctx.lineWidth = 1.1;
    ctx.strokeRect(-L / 2, -W / 2, L, W); ctx.setLineDash([]); ctx.restore(); return;
  }
  if (k === "temple") {
    // the nave and its apse, the aisles marked by their columns; the door toward the road (+x), the apse away from it; unfinished: the
    // apse half solid, the half toward the road open ribs in scaffold
    const ax = -L / 2 + W / 2;
    const shape = () => { ctx.beginPath(); ctx.moveTo(L / 2, -W / 2); ctx.lineTo(ax, -W / 2); ctx.arc(ax, 0, W / 2, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(L / 2, W / 2); ctx.closePath(); };
    if (st === "unfinished") {
      ctx.save(); ctx.beginPath(); ctx.rect(-L / 2 - 1, -W, L / 2 + 1, 2 * W); ctx.clip(); shape(); ctx.fillStyle = stone; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.strokeStyle = roofLine; ctx.lineWidth = 0.8; for (let x = -L / 2 + 4; x < 0; x += 5) { ctx.beginPath(); ctx.moveTo(x, -W / 2 + 2); ctx.lineTo(x + W * 0.25, W / 2 - 2); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, -W, L, 2 * W); ctx.clip(); shape(); ctx.setLineDash([3, 2.5]); ctx.strokeStyle = wall; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(70,54,40,0.7)"; ctx.lineWidth = 1; for (let x = 4; x < L / 2; x += Math.max(5, L / 14)) { ctx.beginPath(); ctx.moveTo(x, -W / 2); ctx.lineTo(x, W / 2); ctx.stroke(); }
      ctx.restore();
      // the scaffold standing round what is not done
      ctx.strokeStyle = "rgba(140,104,60,0.75)"; ctx.lineWidth = 0.7; ctx.beginPath();
      for (let x = 0; x <= L / 2 + 2; x += Math.max(6, L / 12)) { ctx.moveTo(x, -W / 2 - 4); ctx.lineTo(x, W / 2 + 4); }
      for (const y of [-W / 2 - 3, -W / 6, W / 6, W / 2 + 3]) { ctx.moveTo(0, y); ctx.lineTo(L / 2 + 3, y); }
      ctx.stroke();
    } else {
      shape(); ctx.fillStyle = stone; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "rgba(70,54,40,0.6)";
      for (let x = ax + W * 0.2; x < L / 2 - W * 0.2; x += Math.max(5, L / 12)) for (const y of [-W / 4, W / 4]) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
    }
  } else if (k === "shrine") {
    // (its court is the apron drawn above) the shrine, its porch toward the way in, and the lamp
    rect(-L / 2, -L / 2, L, L, stone, 1.6);
    ctx.beginPath(); ctx.rect(L / 2, -L * 0.3, L * 0.34, L * 0.6); ctx.fillStyle = "#ece2cb"; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath(); ctx.arc(L / 2 - L * 0.12, 0, Math.max(1.8, L * 0.07), 0, Math.PI * 2); ctx.fillStyle = "#e0a640"; ctx.fill();
  } else if (k === "tower") {
    ctx.beginPath(); ctx.arc(0, 0, L / 2, 0, Math.PI * 2); ctx.fillStyle = stone; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, L * 0.3, 0, Math.PI * 2); ctx.strokeStyle = roofLine; ctx.lineWidth = 1; ctx.stroke();
  } else if (k === "arena") {
    // the bowl: its outer wall, the tiers stepping down, the floor
    ctx.beginPath(); ctx.ellipse(0, 0, L / 2, W / 2, 0, 0, Math.PI * 2); ctx.fillStyle = stone; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.strokeStyle = roofLine; ctx.lineWidth = 0.9;
    for (const f of [0.86, 0.72, 0.58]) { ctx.beginPath(); ctx.ellipse(0, 0, L / 2 * f, W / 2 * f, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, L / 2 * 0.46, W / 2 * 0.46, 0, 0, Math.PI * 2); ctx.fillStyle = sand; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1; ctx.stroke();
  } else if (k === "gate") {
    // the paved apron the gate stands on, the two piers, and the fold between them across the road
    ctx.beginPath(); ctx.rect(-L / 2 - 4, -L * 0.36, L + 8, L * 0.72); ctx.fillStyle = "#e2d7bf"; ctx.fill(); ctx.strokeStyle = "rgba(110,90,64,0.55)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = "rgba(150,130,100,0.35)"; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let x = -L / 2; x <= L / 2; x += Math.max(4, L / 9)) { ctx.moveTo(x, -L * 0.36); ctx.lineTo(x, L * 0.36); }
    ctx.stroke();
    const p = Math.max(5, L * 0.16);
    ctx.beginPath(); ctx.rect(-L / 2 + p, -W * 0.28, L - 2 * p, W * 0.56); ctx.fillStyle = dark; ctx.fill();
    rect(-L / 2, -W / 2, p, W, stone, 1.6); rect(L / 2 - p, -W / 2, p, W, stone, 1.6);
    ctx.strokeStyle = "rgba(160,170,220,0.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-L / 2 + p, 0); ctx.lineTo(L / 2 - p, 0); ctx.stroke();
  } else if (k === "market" || k === "square" || k === "court") {
    rect(-L / 2, -W / 2, L, W, "#e9dfc6", 1.2);
    if (k === "market") { ctx.strokeStyle = wall; ctx.lineWidth = 0.8; const s = L / 7; for (let i = -2; i <= 2; i += 2) for (let j = -1; j <= 1; j += 2) { ctx.beginPath(); ctx.rect(i * s - s * 0.4, j * W * 0.22 - s * 0.3, s * 0.8, s * 0.6); ctx.fillStyle = "#c79a6a"; ctx.fill(); ctx.stroke(); } }
  } else if (k === "stair") {
    rect(-L / 2, -W / 2, L, W, stone, 1.3);
    ctx.strokeStyle = roofLine; ctx.lineWidth = 0.9; for (let x = -L / 2 + L / 10; x < L / 2; x += L / 10) { ctx.beginPath(); ctx.moveTo(x, -W / 2); ctx.lineTo(x, W / 2); ctx.stroke(); }
  } else if (k === "cave") {
    ctx.beginPath(); ctx.ellipse(0, 0, L / 2, L * 0.36, 0, 0, Math.PI * 2); ctx.fillStyle = "rgba(150,142,128,0.7)"; ctx.fill(); ctx.strokeStyle = "rgba(80,74,64,0.7)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-L * 0.08, 0, L * 0.26, L * 0.18, 0, 0, Math.PI * 2); ctx.fillStyle = "rgba(28,24,22,0.88)"; ctx.fill();
  } else if (k === "machinery") {
    const r = L / 2, n = 12; ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r : r * 0.84; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = "#c9c2b2"; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = "#8f877a"; ctx.fill(); ctx.stroke();
  } else if (k === "standing_stones" || k === "cairn") {
    if (k === "standing_stones") for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ctx.save(); ctx.translate(Math.cos(a) * L / 2, Math.sin(a) * L / 2); ctx.rotate(a); rect(-2.5, -1.5, 5, 3, "#bdb6a8", 1); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(0, 0, L / 2, 0, Math.PI * 2); ctx.fillStyle = "#c4bdae"; ctx.fill(); ctx.strokeStyle = wall; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = "rgba(80,74,64,0.6)"; for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = (L / 2) * Math.sqrt((i + 0.5) / 9) * 0.8; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, Math.max(1.2, L * 0.05), 0, Math.PI * 2); ctx.fill(); } }
  } else if (k === "inn") {
    rect(-L / 2, -W / 2, L, W, stone, 1.5); rect(L / 2 - W * 0.8, W / 2 - 1, W * 0.8, W * 0.7, stone, 1.5); ridge(-L / 2 + 3, L / 2 - 3);
  } else if (k === "works" || k === "forge" || k === "mill") {
    rect(-L / 2, -W / 2, L, W, "#d6cbb5", 1.5);
    ctx.strokeStyle = roofLine; ctx.lineWidth = 0.9; for (let x = -L / 2 + L / 8; x < L / 2; x += L / 8) { ctx.beginPath(); ctx.moveTo(x, -W / 2); ctx.lineTo(x - L / 16, W / 2); ctx.stroke(); }
  } else {
    // a hall, a store, a house of the place's own: the plan and its roof ridge
    rect(-L / 2, -W / 2, L, W, stone, 1.5); ridge(-L / 2 + Math.min(4, L * 0.1), L / 2 - Math.min(4, L * 0.1));
  }
  if (st === "unfinished" && k !== "temple") {
    ctx.strokeStyle = "rgba(140,104,60,0.75)"; ctx.lineWidth = 0.7; ctx.setLineDash([2, 2]); ctx.strokeRect(-L / 2 - 4, -W / 2 - 4, L + 8, W + 8); ctx.setLineDash([]);
  }
  if (st === "sealed") { ctx.strokeStyle = "rgba(40,34,28,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-L * 0.3, -W * 0.3); ctx.lineTo(L * 0.3, W * 0.3); ctx.moveTo(L * 0.3, -W * 0.3); ctx.lineTo(-L * 0.3, W * 0.3); ctx.stroke(); }
  ctx.restore();
}

/* ═════ G8 · A YARD DRAWS ITS YARD ═════
 * ✅ AEVI: *"Packed-earth ground with its fence line is the place's ground. `stacks` are long rectangles in parallel rows … give each
 * row a short tag. `shed` is an open-sided roof footprint. `crane` is a gantry spanning a row. `machinery` cogs are accents among the
 * rows, not marks of their own. The `_order` runs along the road."* */
function paintYardGround(ctx, y, model) {
  ctx.save(); ctx.translate(y.x, y.y); ctx.rotate(y.ang || 0);
  const r = Math.min(y.hl, y.hw) * 0.12;
  const path = () => { ctx.beginPath(); ctx.moveTo(-y.hl + r, -y.hw); ctx.lineTo(y.hl - r, -y.hw); ctx.quadraticCurveTo(y.hl, -y.hw, y.hl, -y.hw + r); ctx.lineTo(y.hl, y.hw - r);
    ctx.quadraticCurveTo(y.hl, y.hw, y.hl - r, y.hw); ctx.lineTo(-y.hl + r, y.hw); ctx.quadraticCurveTo(-y.hl, y.hw, -y.hl, y.hw - r); ctx.lineTo(-y.hl, -y.hw + r); ctx.quadraticCurveTo(-y.hl, -y.hw, -y.hl + r, -y.hw); ctx.closePath(); };
  path(); ctx.fillStyle = "rgba(200,178,140,0.55)"; ctx.fill();
  // the churned earth: short strokes along the way the loads are dragged
  const rnd = rngOf(seedOf("yardground:" + model.id));
  ctx.strokeStyle = "rgba(120,94,60,0.28)"; ctx.lineWidth = 0.8; ctx.beginPath();
  for (let i = 0; i < 140; i++) { const px = (rnd() * 2 - 1) * y.hl * 0.95, py = (rnd() * 2 - 1) * y.hw * 0.92, l = 3 + rnd() * 5; ctx.moveTo(px, py); ctx.lineTo(px + l, py + (rnd() - 0.5) * 1.5); }
  ctx.stroke();
  // the fence, posts along it — or, where the entry rings the yard with a wall, the wall
  if (y.walled) { path(); ctx.strokeStyle = "rgba(60,52,44,0.9)"; ctx.lineWidth = 3.2; ctx.stroke(); path(); ctx.strokeStyle = "rgba(200,190,170,0.9)"; ctx.lineWidth = 1.2; ctx.stroke(); }
  else { path(); ctx.strokeStyle = "rgba(70,52,34,0.8)"; ctx.lineWidth = 1.1; ctx.setLineDash([7, 2.5]); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
}
const PLAN_KINDS = new Set(["stacks", "shed", "crane", "spoil", "yard"]);
/** Whether a label says the place's own name (a leading article and case aside). */
const sameName = (a, b) => { const n = (s) => String(s || "").toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, " ").trim(); return !!n(a) && n(a) === n(b); };
const FOOT_KINDS = new Set(["hall", "works", "store", "inn", "forge", "mill", "tower", "temple", "shrine", "gate", "market", "scales", "arena", "stair"]);
function drawPlanMark(ctx, m) {
  const L = Number(m.plan) || 12, k = m.k;
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.ang || 0); ctx.lineJoin = "round";
  if (k === "stacks") {
    // a stack: a long rectangle of material laid in courses, its row's tag at its end
    const W = Math.max(4, L * 0.25), tones = ["#a07a52", "#8d8a84", "#5f5a52", "#b39668"], tone = tones[Math.abs(Math.round((m.x + m.y) / 7)) % tones.length];
    ctx.beginPath(); ctx.rect(-L / 2, -W / 2, L, W); ctx.fillStyle = tone; ctx.fill(); ctx.strokeStyle = "rgba(40,30,22,0.85)"; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.strokeStyle = "rgba(250,240,220,0.35)"; ctx.lineWidth = 0.7; ctx.beginPath(); for (let x = -L / 2 + 3; x < L / 2; x += 3.2) { ctx.moveTo(x, -W / 2 + 0.8); ctx.lineTo(x, W / 2 - 0.8); } ctx.stroke();
    if (m.tag) { ctx.rotate(-(m.ang || 0)); ctx.font = `bold ${Math.max(8, Math.min(12, W * 1.4))}px Georgia, serif`; ctx.fillStyle = "rgba(60,44,30,0.9)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const ex = -Math.cos(m.ang || 0) * (L / 2 + 7), ey = -Math.sin(m.ang || 0) * (L / 2 + 7); ctx.fillText(m.tag, ex, ey); }
  } else if (k === "shed") {
    // open-sided: the roof's footprint, its ridge, posts at the corners and no walls
    const W = L * 0.62;
    ctx.beginPath(); ctx.rect(-L / 2, -W / 2, L, W); ctx.fillStyle = "rgba(160,150,136,0.5)"; ctx.fill();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(50,40,30,0.75)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(60,50,40,0.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L / 2, 0); ctx.stroke();
    ctx.fillStyle = "rgba(40,30,22,0.9)"; for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) { ctx.beginPath(); ctx.rect(px * L / 2 - 1.3, py * W / 2 - 1.3, 2.6, 2.6); ctx.fill(); }
  } else if (k === "crane") {
    // a gantry: the beam spanning, a leg at each end, the trolley on it
    ctx.strokeStyle = "rgba(150,96,40,0.95)"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(L / 2, 0); ctx.stroke();
    ctx.fillStyle = "rgba(60,44,30,0.95)"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.rect(s * L / 2 - 2, -3, 4, 6); ctx.fill(); }
    ctx.beginPath(); ctx.rect(-2.5, -2.5, 5, 5); ctx.fillStyle = "#e0b060"; ctx.fill(); ctx.strokeStyle = "rgba(60,44,30,0.9)"; ctx.lineWidth = 0.8; ctx.stroke();
  } else if (k === "spoil") {
    // a heap of what was cut away
    ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr = L / 2 * (0.75 + 0.25 * Math.sin(i * 2.7)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.7); } ctx.closePath();
    ctx.fillStyle = "rgba(150,128,100,0.6)"; ctx.fill(); ctx.strokeStyle = "rgba(90,74,56,0.6)"; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = "rgba(80,64,48,0.5)"; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 2.3) * L * 0.25, Math.sin(i * 1.7) * L * 0.15, 1, 0, Math.PI * 2); ctx.fill(); }
  } else if (k === "yard") {
    // the intake: a patch of harder-worn ground where the loads come off the road
    const W = L * 0.66; ctx.beginPath(); ctx.rect(-L / 2, -W / 2, L, W); ctx.fillStyle = "rgba(170,146,108,0.45)"; ctx.fill();
    ctx.setLineDash([3, 2]); ctx.strokeStyle = "rgba(90,70,48,0.6)"; ctx.lineWidth = 0.9; ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
}

function paintGroundMark(ctx, m, model) {
  const st = m.state, sz = m.sz;
  // ✅ G8: a single place's own thing is its footprint at metres, not a glyph in a ring
  if (m.own && m.footprint) {
    drawFootprint(ctx, m);
    if (st === "abandoned" || st === "ruined") drawStateMark(ctx, "ruin", m.x, m.y, Math.min(sz, 18));
    return;
  }
  // ✅ G8: and what stands on a single place's ground is drawn as a plan of itself, at its metres
  if (model?.single && m.plan && PLAN_KINDS.has(m.k) && !(m.own && m.k !== "stacks")) { drawPlanMark(ctx, m); return; }
  // ✅ G8: a building on a single place's ground (a hall in a yard, the works at its end) is a footprint too, never a giant icon
  if (model?.single && m.plan && FOOT_KINDS.has(m.k) && !m.footprint) {
    drawFootprint(ctx, { ...m, footprint: { px: Math.max(14, m.plan), ang: m.ang || 0 } });
    if (st === "abandoned" || st === "ruined") drawStateMark(ctx, "ruin", m.x, m.y, Math.min(sz, 12));
    return;
  }
  ctx.save();
  if (st === "razed" || st === "former") {
    // footprints only: where it stood, dashed, fainter for an old layout
    ctx.globalAlpha = st === "former" ? 0.45 : 0.85; ctx.strokeStyle = INK.glyph; ctx.lineWidth = 0.9; ctx.setLineDash([2.5, 2]);
    ctx.translate(m.x, m.y); if (m.ang && TURNS.has(m.k)) ctx.rotate(m.ang);
    ctx.strokeRect(-sz * 0.95, -sz * 0.65, sz * 1.9, sz * 1.3);
    ctx.restore(); return;
  }
  if (m.own) {
    // the place's own mark: a paper ground under it and a ring, so the eye finds it first
    ctx.fillStyle = "rgba(250,246,234,0.88)"; ctx.beginPath(); ctx.arc(m.x, m.y, sz * 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(150,108,40,0.65)"; ctx.lineWidth = 1.1; ctx.stroke();
  }
  if (st === "abandoned") ctx.globalAlpha = 0.5; else if (st === "empty") ctx.globalAlpha = 0.62;
  const style = st === "dead" ? { ink: "rgba(110,108,104,0.92)", fill: "rgba(208,206,200,0.92)", accent: "#8f8f8f" }
    : st === "unfinished" ? { ink: INK.glyph, fill: "rgba(0,0,0,0)", accent: INK.glyphAccent }
    : { ink: INK.glyph, fill: INK.glyphFill, accent: INK.glyphAccent };
  // ⛑ only what has a long axis turns to its line — a hull to the current, a bridge across it, a stack to its row; a tower stands up
  ctx.translate(m.x, m.y); if (m.ang && TURNS.has(m.k)) ctx.rotate(m.ang);
  if (st === "unfinished") ctx.setLineDash([2, 1.6]);
  if (m.k === "bridge" && m.onWater) {
    // a bridge on its water: the deck across the channel, the two parapets
    const L = (m.half || 4) + 4;
    ctx.fillStyle = "#cdbf9f"; ctx.strokeStyle = INK.glyph; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.rect(-L, -sz * 0.38, 2 * L, sz * 0.76); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-L, -sz * 0.38); ctx.lineTo(L, -sz * 0.38); ctx.moveTo(-L, sz * 0.38); ctx.lineTo(L, sz * 0.38); ctx.stroke();
  } else if (m.k === "ford" && m.onWater) {
    const L = (m.half || 4) + 2, n = Math.max(4, Math.round(L / 1.6));
    ctx.fillStyle = "rgba(250,246,234,0.9)"; ctx.strokeStyle = "rgba(90,80,60,0.6)"; ctx.lineWidth = 0.5;
    for (let k = 0; k <= n; k++) { ctx.beginPath(); ctx.arc(-L + (2 * L * k) / n, ((k % 2) - 0.5) * 1.5, 1.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  } else {
    try { drawGlyph(ctx, m.glyph, 0, 0, sz, style); }
    catch { ctx.fillStyle = INK.glyph; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.setLineDash([]);
  if (st === "unfinished") {
    // the scaffold standing round what is not done
    ctx.strokeStyle = "rgba(120,90,50,0.85)"; ctx.lineWidth = 0.6; ctx.beginPath();
    for (const fx of [-0.7, 0, 0.7]) { ctx.moveTo(sz * fx, -sz * 1.05); ctx.lineTo(sz * fx, sz * 1.05); }
    for (const fy of [-0.5, 0.35]) { ctx.moveTo(-sz * 0.85, sz * fy); ctx.lineTo(sz * 0.85, sz * fy); }
    ctx.stroke();
  }
  if (st === "sealed") {
    // capped: a stone lid over it, and the bar across
    ctx.fillStyle = "rgba(52,44,36,0.92)"; ctx.strokeStyle = "rgba(240,236,224,0.9)"; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(0, 0, sz * 0.48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-sz * 0.48, 0); ctx.lineTo(sz * 0.48, 0); ctx.stroke();
  }
  ctx.restore();
  if (st === "abandoned" || st === "ruined") drawStateMark(ctx, "ruin", m.x, m.y, sz);
}

/** the "you are here" ring, the glyph and the hit target for a site; dimmed when only heard of */
function paintSite(ctx, site, { here = false, know = "seen", scale = 1, level = 0 }) {
  const dim = know === "heard";
  ctx.save();
  if (dim) ctx.globalAlpha = 0.5;
  const sz = (site.location ? 9 : 7.5) * scale;
  if (site.kind === "green") {
    ctx.fillStyle = "rgba(120,170,96,0.75)"; ctx.strokeStyle = "rgba(60,100,50,0.7)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(site.x, site.y, sz * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  if (here) {
    ctx.strokeStyle = "#b8860b"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(site.x, site.y, sz + 4, 0, Math.PI * 2); ctx.stroke();
  }
  try { drawGlyph(ctx, site.glyph, site.x, site.y, sz, { ink: INK.glyph, fill: INK.glyphFill, accent: INK.glyphAccent }); }
  catch { ctx.fillStyle = INK.glyph; ctx.beginPath(); ctx.arc(site.x, site.y, 3, 0, Math.PI * 2); ctx.fill(); }
  // ✅ L5: the way down (or up) wears a small arrow, so a stair is read as a stair on both the levels it joins
  if (joinsLevels(site)) {
    const down = siteLevel(site) <= level;          // seen from the level above, or on its own level: the way down
    ctx.fillStyle = INK.glyph;
    ctx.beginPath();
    if (down) { ctx.moveTo(site.x + sz + 3, site.y - 3); ctx.lineTo(site.x + sz + 9, site.y - 3); ctx.lineTo(site.x + sz + 6, site.y + 3); }
    else { ctx.moveTo(site.x + sz + 3, site.y + 3); ctx.lineTo(site.x + sz + 9, site.y + 3); ctx.lineTo(site.x + sz + 6, site.y - 3); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  return { id: site.id, x: site.x, y: site.y, r: sz + 6, site };
}

/** ⛔ WHAT THE CHARACTER KNOWS OF A SITE (L6). ✅ AEVI: *"the sites the character has visited in full and the
 *  ones they have heard of dimmed … A site nobody has told them about is not drawn."* ⛑ With the one rule
 *  she asked for underneath it: *"this is a place they are standing in, so an empty map is worse than a
 *  sparse one"* — standing in a place shows you its built ground, and what is further out is heard of until
 *  you have walked to it. A site that is a place of its own answers by the region map's own `isPlaceKnown`. */
export function siteKnowledge(site, { character = null, placeId = null, layout = null, known = null, reveal = false } = {}) {
  if (reveal || !character) return "seen";
  if (site?.hold) return "seen";   // ✅ SNG-679 H6/H7: a hold is drawn because it is known — your own, or a card you were shown
  const pm = character.placeMemory?.[placeId] || {};
  const here = character.currentLocationId === placeId;
  // ⛑ standing here IS a visit, and `notePlaceVisit` has usually counted it already — so the two are not summed
  const visits = Math.max(pm.visits || 0, here ? 1 : 0);
  const sub = pm.subPlaces?.[site.id] || Object.values(pm.subPlaces || {}).find((s) => s?.name && String(s.name).toLowerCase() === String(site.name || "").toLowerCase());
  if (sub) return sub.visited ? "seen" : "heard";
  if (site.location && typeof known === "function") return known(site.id) ? "seen" : (visits > 0 ? "heard" : "unknown");
  if (!visits) return "unknown";
  const builtR = Number((layout?.extent || []).find((f) => f.kind === "built")?.radiusMetres) || (Number(layout?.radiusMetres) || 300) * 0.4;
  const m = Number(site.localMap?.metres) || 0;
  // ⛔ what lies beyond the built ground stays heard-of until it is WALKED TO — which is when the GM names it as a
  // sub-place and `notePlaceVisit` marks it visited. A second visit to the village does not walk you to the mill.
  return m <= builtR * 1.15 ? "seen" : "heard";
}

/** ⛔ THE WHOLE PICTURE. Returns the hit targets so the caller can wire clicks, and the facts a gate can read:
 *  where each site landed, which were labelled, which were dimmed and which withheld. */
export function paintLocalMap(ctx, model, {
  space = null, queue = null, exitSpace = null, character = null, known = null, reveal = false,
  hereSite = null, inset = null, labelMinPx = 0, title = true, legend = true, compass = true, exits = true, legendShort = false, clip = null,
  spreading = false, stateOf = null, waterStateOf = null,
} = {}) {
  const { frame, rnd } = model;
  const w = frame.w, h = frame.h;
  const sp = space || labelSpace();
  const exSp = exitSpace || labelSpace();
  // ⛑ a painter with no queue draws its labels at once — a test, or a film frame drawn in one pass
  const q = queue || ((c, text, box, kind, opts) => { if (box) { c.textAlign = opts?.align || "center"; drawLabel(c, text, box.x, box.y, kind, opts || {}); } });
  const R2 = rngOf(seedOf("paint:" + model.id));
  const out = { sites: [], exits: [], labelled: [], dimmed: [], withheld: [], inset: null, stated: [] };
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
  // paper
  ctx.fillStyle = INK.paper; ctx.fillRect(0, 0, w, h);
  // ✅ SNG-679 H6: a moving hold out on the water is drawn on the water — *"whatever it is passing over … not a town"*
  if (model.layout?.sea) {
    ctx.fillStyle = INK.water; ctx.globalAlpha = 0.9; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 0.8;
    const sr = rngOf(seedOf("sea:" + model.id));
    for (let i = 0; i < Math.round((w * h) / 2600); i++) { const x = sr() * w, y = sr() * h; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.quadraticCurveTo(x, y - 2.5, x + 4, y); ctx.stroke(); }
    out.sea = true;
  }
  // a faint paper grain — a few hundred seeded specks
  ctx.fillStyle = "rgba(120,98,66,0.06)";
  for (let i = 0; i < Math.round((w * h) / 900); i++) ctx.fillRect(R2() * w, R2() * h, 1.2, 1.2);
  // contours across the uphill
  ctx.strokeStyle = INK.contour; ctx.lineWidth = 0.8;
  ctx.globalAlpha = model.contours.strength <= 0.018 ? 0.5 : 1;
  for (const line of model.contours.lines) { smoothPath(ctx, line); ctx.stroke(); }
  ctx.globalAlpha = 1;
  if (model.layout?.sea) { /* no contours on the open water */ }
  // the ground: fields, woods, rock, marsh, waste first; built ground over them; water last so it cuts them
  const order = { field: 0, marsh: 0, waste: 0, rock: 1, wood: 2, built: 3, water: 4 };
  // ✅ SNG-679 S5 (CCODE-673): the place's own water by its state — keyed by the feature's index, `water:<place>/<n>`, the key
  // the GM's map ops can name. The index is the feature's place in the model's own list, which is the layout's extent order.
  const waterView = (f) => (f.kind === "water" && typeof waterStateOf === "function") ? waterStateOf(model.features.indexOf(f), f) : null;
  const sortedFeatures = [...model.features].sort((a, b) => (order[a.kind] ?? 1) - (order[b.kind] ?? 1));
  const paintExtent = (f) => {
    const wv = waterView(f);
    if (wv && wv.state && wv.state !== "whole") out.stated.push({ id: f.id, state: wv.state, water: true });
    paintFeature(ctx, f, model, rnd, wv);
  };
  const G = model.ground || null;
  const groundRnd = rngOf(seedOf("groundpaint:" + model.id));
  // ✅ G3 (CCODE-676): the farmland ring under everything, so the village's built ground sits over its fields
  if (G) for (const a of G.areas) if (a.farm) paintGroundArea(ctx, a, model, groundRnd);
  for (const f of sortedFeatures) if (f.kind !== "water") paintExtent(f);
  // ✅ G4 (CCODE-675): the ground's own fills, over the measured ground and under its water; its lines over the water
  if (G) for (const a of G.areas) if (!a.farm) paintGroundArea(ctx, a, model, groundRnd);
  // ✅ G8: the yard's own ground — packed earth inside its fence — over the measured ground, under its water, its ways and what stands in it
  if (G?.yard) paintYardGround(ctx, G.yard, model);
  for (const f of sortedFeatures) if (f.kind === "water") paintExtent(f);
  if (G) for (const l of G.lines) paintGroundLine(ctx, l, model);
  // the ways
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  const roadW = Math.max(2.2, Math.min(7, 5 * frame.pxPerMetre * 1.6 + 1.6));
  for (const l of model.lanes) {
    ctx.strokeStyle = INK.laneEdge; ctx.lineWidth = roadW * 0.55; smoothPath(ctx, l.pts); ctx.stroke();
    ctx.strokeStyle = INK.lane; ctx.lineWidth = roadW * 0.3; smoothPath(ctx, l.pts); ctx.stroke();
  }
  for (const r of model.roads) {
    ctx.strokeStyle = INK.roadEdge; ctx.lineWidth = roadW; smoothPath(ctx, r.pts); ctx.stroke();
    ctx.strokeStyle = INK.road; ctx.lineWidth = roadW * 0.6; smoothPath(ctx, r.pts); ctx.stroke();
  }
  ctx.restore();
  // a ford is a dotted way across the water; a dock a short pier; wheels sit on the bank
  for (const s of model.sites) {
    if (!s.onWater) continue;
    const ch = model.water.channel;
    const [nx, ny] = s.onWater.normal, [tx, ty] = s.onWater.tangent;
    ctx.save();
    if (s.kind === "ford") {
      ctx.fillStyle = "rgba(250,246,234,0.9)"; ctx.strokeStyle = "rgba(90,80,60,0.6)"; ctx.lineWidth = 0.5;
      const n = Math.max(4, Math.round(ch.widthPx / 3.2));
      for (let k = 0; k <= n; k++) {
        const t = (k / n - 0.5) * ch.widthPx * 1.1;
        ctx.beginPath(); ctx.arc(s.x + nx * t + tx * ((k % 2) - 0.5) * 1.5, s.y + ny * t + ty * ((k % 2) - 0.5) * 1.5, 1.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    } else if (s.kind === "dock" || s.kind === "harbour") {
      ctx.strokeStyle = "rgba(70,40,24,0.9)"; ctx.lineWidth = Math.max(1.5, ch.widthPx * 0.1);
      const L = Math.max(5, ch.widthPx * 0.45);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - nx * L, s.y - ny * L); ctx.stroke();
    }
    ctx.restore();
  }
  paintRoofs(ctx, model, rngOf(seedOf("roofs:" + model.id)));
  // ✅ SNG-679 H6: a moving hold IS its local map — its deck under its rooms: a hull bow to stern, a ring round its open
  // middle, a stack's frame; a `scatter` deck (a grown hold) has none, its rooms where the living thing allows
  if (model.layout?.deck) out.deck = paintDeck(ctx, model);
  // ✅ G4: the marks over the roofs, unlabelled, and the place's own mark LAST — *"the first thing the eye finds"*
  if (G) {
    // ✅ G8: a single place's own thing is its ground-sized footprint, so it goes down FIRST and what stands on it (the cranes on the
    // Half-Cathedral's open half) over it; a town's own mark is a glyph, and goes last so the eye finds it
    if (model.single) for (const m of G.marks) if (m.own) paintGroundMark(ctx, m, model);
    for (const m of G.marks) if (!m.own) paintGroundMark(ctx, m, model);
    if (!model.single) for (const m of G.marks) if (m.own) paintGroundMark(ctx, m, model);
    out.ground = { marks: G.marks.length, lines: G.lines.length, areas: G.areas.length, own: G.marks.filter((m) => m.own).length };
  }
  // ⛔ THE EXITS GO FIRST, in their own band at the rim (SNG-677 §0) — and their boxes are CLAIMED in the main
  // space as well, so a site's name cannot land across a road's name. ⚠️ The box is CENTRED on where the ink
  // will be: a left-aligned label placed by its left edge and then clamped into the frame by its centre drew
  // half a label's width to the right of the box it had reserved (measured at 365 px: "→ Sunken Choir · 500 mi"
  // sat under "The Water Wheels" with both spaces reporting no collision).
  /* ✅ AEVI (G8, the local maps seen): *"Edge labels collide. Vigil Shrine's two road pointers overlap at the top right, and the
   * bottom-left one overlaps the scale bar. G7's test should include the compass, the scale bar and the edge pointers."* ⛑ The
   * frame's furniture is CLAIMED in the exits' band and the main space before any exit is placed, so a road's name finds room
   * beside them rather than across them; the boxes are said in `out.furniture` for the gate. */
  out.furniture = {};
  if (legend) {
    const L0 = scaleLegend(frame);
    ctx.save(); ctx.font = "600 10px ui-serif, Georgia, serif";
    const lw = Math.max(L0.px, Number(ctx.measureText(legendShort ? spanWord(L0.metres) : L0.text)?.width) || 0);
    ctx.restore();
    out.furniture.scale = { x0: 10, x1: 14 + lw + 4, y0: h - 30, y1: h - 6 };
  }
  if (compass) {
    ctx.save(); ctx.font = "italic 600 9px ui-serif, Georgia, serif";
    const cw = Number(ctx.measureText("the Crossing")?.width) || 56;
    ctx.restore();
    out.furniture.compass = { x0: w - 22 - 7 - cw - 4, x1: w - 12, y0: 12, y1: 50 };
  }
  // ⛑ claimed with the margin an exit's own box carries, so a name placed beside them is clear of them, not touching
  for (const b of Object.values(out.furniture)) { const pad = { x0: b.x0 - 6, x1: b.x1 + 6, y0: b.y0 - 2, y1: b.y1 + 2, kind: "furniture", rank: -9 }; exSp.claim({ ...pad }); sp.claim({ ...pad }); }
  if (exits) {
    for (const r of model.roads) {
      const name = r.name || r.to || "";
      if (!name) continue;
      // ⛑ under a mile a road's length is said in metres — "0 mi" said a gate yard's road was no road at all. ⚠️ AND AN UNKNOWN LENGTH
      // SAYS NOTHING: a generated layout carries `mi: null`, and Number(null) is 0 — every such road read "0 mi"
      const mi = r.mi == null || r.mi === "" ? NaN : Number(r.mi);
      // ⛑ and a stored 0 is a length rounded away, not a road of no length: it says nothing rather than "0 m"
      const miles = Number.isFinite(mi) && mi > 0 ? (mi < 1 ? ` · ${spanWord(mi * 1609.34)}` : ` · ${Math.round(mi)} mi`) : "";
      const text = `→ ${name}${miles}`;
      const ex = r.exit;
      const tw = (drawLabel(ctx, text, -9999, -9999, "exit", { max: 30 })?.w) || 0;
      const cx = clamp(ex.x, tw / 2 + 6, w - tw / 2 - 6);
      const ey = clamp(ex.y + (ex.y < h / 2 ? 14 : -8), 12, h - 4);
      // ⛑ CCODE-697: a road's name slides ALONG the frame's edge to find room (beside the compass, past the scale bar), then steps in —
      // it is never simply dropped because its first spot was taken
      const along = Math.abs(ey - h / 2) > Math.abs(cx - w / 2) * (h / w);   // on the top or bottom edge: slide sideways
      // along the edge first, then a row in from it and along that row, then a second and a third — four roads leaving one corner
      // under the scale bar (Kestrel's Roost) still each find a line
      const slides = [];
      for (const row of [0, 16, 32, 48]) {
        const inward = along ? [0, ey < h / 2 ? row : -row] : [cx < w / 2 ? row * 2 : -row * 2, 0];
        slides.push(inward);
        for (let k = 1; k <= 16; k++) slides.push(along ? [inward[0] - k * 26, inward[1]] : [inward[0], inward[1] - k * 16], along ? [inward[0] + k * 26, inward[1]] : [inward[0], inward[1] + k * 16]);
      }
      const box = exSp.place(cx, ey, tw, 12, { kind: "exit", clampTo: { w, h }, offsets: slides });
      if (!box) continue;
      sp.claim({ x0: box.x0, x1: box.x1, y0: box.y0, y1: box.y1, kind: "exit", rank: -2 });
      q(ctx, text, box, "exit", { align: "center", max: 30 }, 0, exSp);
      out.exits.push({ id: r.to, x0: box.x - tw / 2 - 6, x1: box.x + tw / 2 + 6, y0: box.y - 13, y1: box.y + 5, name });
    }
  }
  /* ✅ G7 (CCODE-677): *"When two site labels overlap, the second goes to the other side of its mark, then a step lower."*
   * ⚠️ MEASURED on Aevi's frames: the labels never overlapped EACH OTHER — the label space kept their boxes apart — but
   * nothing kept a label off the next site's MARK, so Millbrook's store, well, green and smithy each wrote its name across
   * a neighbour and read as one pile. ⛑ The marks are kept OUT of the label space (its own gate holds that no two reserved
   * boxes intersect, and two marks may touch); each candidate spot is tested against them before the space is asked. */
  const markScale7 = clamp(Math.sqrt(frame.k), 1, 1.6);
  const marks7 = [];
  for (const s of model.sites) {
    if (s.x < -20 || s.y < -20 || s.x > w + 20 || s.y > h + 20) continue;
    if (siteKnowledge(s, { character, placeId: model.id, layout: model.layout, known, reveal }) === "unknown") continue;
    const r = (s.location ? 9 : 7.5) * markScale7 * 0.85;
    marks7.push({ id: s.id, x0: s.x - r, x1: s.x + r, y0: s.y - r, y1: s.y + r });
  }
  for (const m of G?.marks || []) if (m.own) marks7.push({ id: null, x0: m.x - m.sz * 1.3, x1: m.x + m.sz * 1.3, y0: m.y - m.sz * 1.3, y1: m.y + m.sz * 1.3 });
  out.labelsDropped = [];
  // the sites, by what is known of them
  const fit = model.frame.fitMetres;
  /* ⛑ AND NAMED IN ORDER OF WHAT MATTERS, because a crowded map seats only so many names (A3: dropped, not shrunk): where
   * you stand and your own holds first, then the places, then the rest. ⚠️ Measured on Silas's Millbrook: the panel seats 11
   * of 20 names, and his own hold — appended last — was the one that lost its name. */
  const nameRank = (s) => (s.id === hereSite || s.hold?.own) ? 0 : s.location ? 1 : s.hold ? 2 : 3;
  const sitesByRank = [...model.sites].sort((a, b) => nameRank(a) - nameRank(b));
  for (const s of sitesByRank) {
    const kn = siteKnowledge(s, { character, placeId: model.id, layout: model.layout, known, reveal });
    if (kn === "unknown") { out.withheld.push(s.id); continue; }
    if (s.x < -20 || s.y < -20 || s.x > w + 20 || s.y > h + 20) continue;
    if (kn === "heard") out.dimmed.push(s.id);
    // ✅ SNG-679 S5 (CCODE-672): the site's state — cracked, a ruin, or only a trace where it stood ("where the mill stood")
    const sv = typeof stateOf === "function" ? stateOf(s) : null;
    if (sv && sv.state && sv.state !== "whole") out.stated.push({ id: s.id, state: sv.state });
    const sScale = clamp(Math.sqrt(frame.k), 1, 1.6), sSz = (s.location ? 9 : 7.5) * sScale;
    let hit;
    if (sv?.glyph === false) { hit = { id: s.id, x: s.x, y: s.y, r: sSz + 4, location: s.location || null }; drawStateMark(ctx, "trace", s.x, s.y, sSz); }
    else {
      if (sv && sv.alpha < 1) { ctx.save(); ctx.globalAlpha *= sv.alpha; }
      hit = paintSite(ctx, s, { here: hereSite === s.id, know: kn, scale: sScale, level: model.level });
      if (sv && sv.alpha < 1) ctx.restore();
      if (sv?.mark) drawStateMark(ctx, sv.mark, s.x, s.y, sSz);
      // ✅ Part R · R2: *"While they work, the local map shows the thing under repair"*
      if (sv?.mending) { drawStateMark(ctx, "mending", s.x, s.y, sSz); out.stated.push({ id: s.id, state: sv.state, mending: true }); }
      if (sv?.state === "damaged") { ctx.save(); ctx.fillStyle = "rgba(40,30,24,0.18)"; ctx.beginPath(); ctx.ellipse(s.x + sSz * 0.6, s.y + sSz * 0.7, sSz * 1.4, sSz * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }   // a scorch on the ground
    }
    out.sites.push(hit);
    // ⛑ a site close to the centre is labelled in the ENLARGEMENT when there is one (SNG-677 §0 at this scale)
    const dC = Math.hypot(s.x - model.built.x, s.y - model.built.y);
    if (inset && dC < labelMinPx) continue;
    const kind = s.location ? "landmark" : "landmarkUnder";
    const text = String(sv?.label || s.name || s.id);
    if (sameName(text, model.placeName)) continue;   // ✅ AEVI (G8): "Greyhearth's name is written twice" — the title says it
    const tw = (drawLabel(ctx, text, -9999, -9999, kind, {})?.w) || 0;
    // ✅ G7: above; the other side of its mark; a step lower; then beside it, either side, and a step lower there — each
    // spot first tested against every OTHER mark (a label may sit on its own mark's ground, as it always has)
    const side7 = tw / 2 + sSz + 4, half7 = tw / 2 + 2;
    const clear7 = [[0, 0], [0, 22], [0, 35], [side7, 15], [-side7, 15], [side7, 28], [-side7, 28]].filter(([dx, dy]) => {
      const cx = clamp(s.x + dx, half7 + 2, w - half7 - 2), cy = clamp(s.y - 11 + dy, 14, h - 4);
      return !marks7.some((mb) => mb.id !== s.id && cx - half7 < mb.x1 && cx + half7 > mb.x0 && cy - 12 < mb.y1 && cy + 4 > mb.y0);
    });
    const box = clear7.length ? sp.place(s.x, s.y - 11, tw, 12, { kind, clampTo: { w, h }, offsets: clear7 }) : null;
    if (box) { q(ctx, text, box, kind, { align: "center", ...(sv && sv.labelAlpha < 1 ? { alpha: sv.labelAlpha } : {}) }); out.labelled.push(s.id); }
    else out.labelsDropped.push(s.id);   // ⛑ dropped, not shrunk (A3) — and said, so a caller can take the enlargement
  }
  // the extent's names, italic, in the ground's own style
  for (const f of model.features) {
    if (!f.name) continue;
    let at = [f.x, f.y];
    if (f.kind === "water") {
      // ⛑ a river is named where it RUNS THROUGH THE FRAME — the channel point nearest the centre that is inside
      // it. A channel that never enters the frame (the enlargement of a village two miles from its river) is
      // not named there at all; clamping its far-off point to the edge put "The Echo" on a panel with no water.
      let best = null, bd = Infinity;
      for (const [x, y] of f.channel.pts) {
        if (x < 10 || y < 10 || x > w - 10 || y > h - 10) continue;
        const d = (x - w / 2) ** 2 + (y - h / 2) ** 2;
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (!best) continue;
      at = best;
    }
    const x = clamp(at[0], 30, w - 30), y = clamp(at[1], 16, h - 8);
    if (f.kind !== "water" && (f.x < -f.rPx || f.y < -f.rPx || f.x > w + f.rPx || f.y > h + f.rPx)) continue;
    // ✅ S5: run dry, the water's name is the world's trace words ("a dry bed")
    const fv = f.kind === "water" ? waterView(f) : null;
    const text = String(fv?.state === "destroyed" ? (fv.label || f.name) : f.name);
    if (sameName(text, model.placeName)) continue;   // ✅ AEVI (G8): Greyhearth's built ground is named Greyhearth — the title says it
    const tw = (drawLabel(ctx, text, -9999, -9999, "landmarkUnder", {})?.w) || 0;
    // ✅ G7: the ground's own names keep off the marks too (Millbrook's "The Village" sat across the store)
    const halfF = tw / 2 + 2;
    // ⛑ and when its middle is taken, anywhere else inside its own ground — a field is named in the field, not on the farm
    const ringF = f.kind !== "water" && f.rPx > 24 ? [0.45, 0.7].flatMap((k) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [Math.cos(i * Math.PI / 4) * f.rPx * k, Math.sin(i * Math.PI / 4) * f.rPx * k * 0.8])) : [];
    const clearF = [[0, 0], [0, -18], [0, 18], [-halfF - 8, 0], [halfF + 8, 0], ...ringF].filter(([dx, dy]) => {
      const cx = clamp(x + dx, halfF + 2, w - halfF - 2), cy = clamp(y + dy, 14, h - 4);
      return !marks7.some((mb) => cx - halfF < mb.x1 && cx + halfF > mb.x0 && cy - 12 < mb.y1 && cy + 4 > mb.y0);
    });
    const box = clearF.length ? sp.place(x, y, tw, 12, { kind: "landmarkUnder", clampTo: { w, h }, offsets: clearF }) : null;
    if (box) { q(ctx, text, box, "landmarkUnder", { align: "center" }); out.labelled.push(f.id); }
  }
  // the place's own name, over the built ground — the one label nothing may evict when you stand here
  if (title && model.placeName) {
    const text = String(model.placeName).toUpperCase();
    const tw = (drawLabel(ctx, text, -9999, -9999, "landmark", { here: true })?.w) || 0;
    /* ✅ AEVI (growth): on the local map too — a dashed outer edge a little beyond the built ground, hatched outward */
    if (spreading && model.built?.r > 0) {
      const er = model.built.r * 1.18 + 6;
      ctx.save(); ctx.strokeStyle = "rgb(226,160,96)"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(model.built.x, model.built.y, er, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath();
      for (let t = 0; t < 24; t++) { const ang = (t / 24) * Math.PI * 2; ctx.moveTo(model.built.x + er * Math.cos(ang), model.built.y + er * Math.sin(ang)); ctx.lineTo(model.built.x + (er + 9) * Math.cos(ang), model.built.y + (er + 9) * Math.sin(ang)); }
      ctx.stroke(); ctx.restore();
      out.spreading = true;
    }
    // ✅ G7: the title too keeps off the marks where it can — but it is ALWAYS drawn: the spots clear of marks first, then the rest
    const offT = [[0, 0], [0, model.built.r * 2 + 30], [tw / 2 + model.built.r + 10, 0], [-tw / 2 - model.built.r - 10, 0]], halfT = tw / 2 + 2;
    const clearT = (dx, dy) => { const cx = clamp(model.built.x + dx, halfT + 2, w - halfT - 2), cy = clamp(model.built.y - model.built.r - 8 + dy, 16, h - 4);
      return !marks7.some((mb) => cx - halfT < mb.x1 && cx + halfT > mb.x0 && cy - 14 < mb.y1 && cy + 4 > mb.y0); };
    const box = sp.place(model.built.x, model.built.y - model.built.r - 8, tw, 14, { kind: "landmark", opts: { here: true }, clampTo: { w, h }, offsets: [...offT.filter(([dx, dy]) => clearT(dx, dy)), ...offT.filter(([dx, dy]) => !clearT(dx, dy))] });
    if (box) q(ctx, text, box, "landmark", { here: true, align: "center" });
  }
  // the furniture: scale, compass
  if (legend) {
    const L = scaleLegend(frame);
    const x0 = 14, y0 = h - 14;
    ctx.save();
    ctx.strokeStyle = INK.legend; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + L.px, y0); ctx.moveTo(x0, y0 - 4); ctx.lineTo(x0, y0 + 2); ctx.moveTo(x0 + L.px / 2, y0 - 3); ctx.lineTo(x0 + L.px / 2, y0 + 1); ctx.moveTo(x0 + L.px, y0 - 4); ctx.lineTo(x0 + L.px, y0 + 2); ctx.stroke();
    ctx.font = "600 10px ui-serif, Georgia, serif"; ctx.fillStyle = INK.legend; ctx.textAlign = "left";
    ctx.fillText(legendShort ? spanWord(L.metres) : L.text, x0, y0 - 7);
    ctx.restore();
    out.legend = L;
  }
  if (compass) {
    // ⛔ THE ONE DIRECTION EVERY PLAYER KNOWS. Bearing 180 is the Crossing from everywhere on the sphere — it is
    // the pole — so the arrow points DOWN-MAP and says so, rather than inventing a north this world has not got.
    const x = w - 22, y = 18;
    ctx.save();
    ctx.strokeStyle = INK.legend; ctx.fillStyle = INK.legend; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + 28); ctx.lineTo(x - 4, y + 19); ctx.lineTo(x + 4, y + 19); ctx.closePath(); ctx.fill();
    ctx.font = "italic 600 9px ui-serif, Georgia, serif"; ctx.textAlign = "right";
    ctx.fillText("the Crossing", x - 7, y + 24);
    ctx.restore();
  }
  // the frame's edge
  ctx.strokeStyle = INK.paperEdge; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  ctx.restore();
  return out;
}

/** ⛔ THE ENLARGEMENT. ✅ AEVI: *"When the built ground comes out under about 150 px across, it gets an
 *  enlargement with the central sites in it."* Same painter, a frame focused on the built ground, drawn in a
 *  panel at the corner the ground is furthest from. Returns the panel's box and the inset's own targets. */
export function enlargementFor(model, { minPx = 150 } = {}) {
  const across = model.built.r * 2;
  if (across >= minPx) return null;
  const builtF = (model.layout?.extent || []).find((f) => f.kind === "built");
  const radius = (Number(builtF?.radiusMetres) || (Number(model.layout?.radiusMetres) || 300) * 0.4) * 1.45;
  const w = model.frame.w, h = model.frame.h;
  const size = Math.round(Math.min(w, h) * 0.46);
  // the corner the built ground is furthest from
  const corners = [[w - size - 10, 10], [10, 10], [w - size - 10, h - size - 10], [10, h - size - 10]];
  const far = corners.reduce((b, c) => (Math.hypot(c[0] + size / 2 - model.built.x, c[1] + size / 2 - model.built.y) > Math.hypot(b[0] + size / 2 - model.built.x, b[1] + size / 2 - model.built.y) ? c : b));
  return { x: far[0], y: far[1], w: size, h: size, focusMetres: radius, builtRadiusPx: model.built.r };
}

/** The inset drawn: a panel, the same model re-framed at `focusMetres`, with its own scale. */
export function paintEnlargement(ctx, layout, panel, { placeName = "", placeId = "", space = null, queue = null, character = null, known = null, reveal = false, hereSite = null, level = 0 } = {}) {
  const frame = localFrame(layout, { w: panel.w, h: panel.h, focusMetres: panel.focusMetres, pad: 12 });
  const model = localModel(layout, frame, { placeName, placeId, level });
  ctx.save();
  ctx.translate(panel.x, panel.y);
  // ⛑ no exits and no compass inside the panel — they are the frame's, and a road's name in a 150 px panel
  // is a second map's worth of words; the legend is the bar and its length alone
  const res = paintLocalMap(ctx, model, { space, queue, character, known, reveal, hereSite, title: false, compass: false, exits: false, legend: true, legendShort: true,
    clip: { x: 0, y: 0, w: panel.w, h: panel.h } });
  ctx.strokeStyle = "rgba(60,50,36,0.8)"; ctx.lineWidth = 1.5; ctx.strokeRect(0.75, 0.75, panel.w - 1.5, panel.h - 1.5);
  ctx.font = "italic 600 9px ui-serif, Georgia, serif"; ctx.fillStyle = INK.legend; ctx.textAlign = "right";
  ctx.fillText("the centre, enlarged", panel.w - 6, 11);
  ctx.restore();
  // the targets, translated back to the host frame
  return { ...res, model, sites: res.sites.map((s) => ({ ...s, x: s.x + panel.x, y: s.y + panel.y })) };
}
