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
import { glyphFor, drawGlyph } from "./mapicons.mjs";
import { drawLabel, labelSpace } from "./maplabel.js";

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
// ⛔ THE FRAME. ✅ AEVI (L1): *"the frame fits every site and the near edge of every `extent` feature, the way
// the mock frames the wheels and the ford 3.4 km out."* A frame that fit only `radiusMetres` would leave
// Millbrook's wheels, landing and ford — the three sites its own seed calls a centre of daily life — off the
// map. The near edge of a feature is where it STARTS: a river 3200 m out is reached at its near bank, a
// meadow that begins at the village edge is reached at zero.
export function fitMetres(layout) {
  let fit = Number(layout?.radiusMetres) || 300;
  for (const s of layout?.sites || []) {
    const m = Number(s?.localMap?.metres);
    if (Number.isFinite(m)) fit = Math.max(fit, m * 1.08);
  }
  for (const f of layout?.extent || []) {
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
export function basisFromName(name) {
  for (const [re, basis, kind] of NAME_BASIS) if (re.test(String(name || ""))) return { basis, kind, why: `its name says "${String(name).match(re)[0]}"` };
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
    const nb = basisFromName(c.name);
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
    return { ...authored, kind, authored: true, placeId,
      _measured: { ...(measured || {}), ...(authored._measured || {}) },
      sites: [...(authored.sites || []), ...(gen ? gen.sites : [])] };
  }
  const cached = character?.localLayouts?.[placeId] || null;
  const have = new Set((cached?.sites || []).map((s) => s.id));
  if (cached && (children || []).every((c) => !c || have.has(c.id))) return { ...cached, kind, placeId };
  // ⛑ a cached layout GROWS when a new sub-place is named, it is not re-rolled (L3: "placed into the existing
  // layout, not re-rolled with it") — the extent and the sites already placed keep their seats
  const fresh = generateLayout(placeId, { loc, kind, gradients: measured, children: cached ? (children || []).filter((c) => c && !have.has(c.id)) : children, locations: content?.locations });
  const out = cached ? { ...cached, sites: [...cached.sites, ...fresh.sites] } : fresh;
  out.kind = kind; out.placeId = placeId; out.generated = true;
  if (character) { character.localLayouts = character.localLayouts || {}; character.localLayouts[placeId] = out; }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ THE MODEL: every shape the painter draws, computed once from the layout and the frame. The painter then
// only puts ink down, which is what lets the film draw the same model sixty times a second.

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
export function localModel(layout, frame, { placeName = "", placeId = "", nameOf = null } = {}) {
  const id = placeId || layout?.placeId || "place";
  const rnd = rngOf(seedOf("model:" + id));
  const sites = (layout?.sites || []).map((s) => {
    const p = frame.toXY(s.localMap?.bearing, s.localMap?.metres);
    return { ...s, x: p.x, y: p.y, glyph: glyphFor({ kind: s.kind }) || "hall" };
  });
  const meas = layout?._measured || {};
  const built = (layout?.extent || []).find((f) => f.kind === "built") || null;
  const builtR = built ? (Number(built.radiusMetres) || 200) * frame.pxPerMetre : (Number(layout?.radiusMetres) || 300) * 0.4 * frame.pxPerMetre;
  const builtAt = built ? frame.toXY(built.bearing, built.fromMetres) : { x: frame.cx, y: frame.cy };
  // roads out, each through the site that names it
  const roads = (meas.roadsOut || []).map((r, i) => {
    const through = sites.find((s) => s.toward === r.to) || null;
    const pts = roadPath(r.bearing, frame, rngOf(seedOf(`road:${id}:${r.to || i}`)), { through });
    return { ...r, name: (typeof nameOf === "function" ? nameOf(r.to) : null) || r.name || r.to, pts, exit: exitPoint(pts, frame.w, frame.h) };
  });
  // the extent, each as what it is
  const features = (layout?.extent || []).map((f) => {
    const frnd = rngOf(seedOf(`extent:${id}:${f.id}`));
    const at = frame.toXY(f.bearing, f.fromMetres);
    const rPx = (Number(f.radiusMetres) || 150) * frame.pxPerMetre;
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
  return { id, placeName, frame, layout, sites, roads, lanes, features, contours, built: { ...builtAt, r: builtR }, water, rnd };
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

function paintFeature(ctx, f, model, rnd) {
  const { frame } = model;
  const s = frame.pxPerMetre;
  if (f.kind === "water") {
    const ch = f.channel;
    ctx.save();
    // the channel
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = INK.water; ctx.lineWidth = ch.widthPx;
    smoothPath(ctx, ch.pts); ctx.stroke();
    // a darker thread down the middle reads as depth
    ctx.strokeStyle = INK.waterDeep; ctx.lineWidth = Math.max(1, ch.widthPx * 0.35); ctx.globalAlpha = 0.5;
    smoothPath(ctx, ch.pts); ctx.stroke();
    ctx.globalAlpha = 1;
    // the narrows: where a ford sits, the channel pinches just upstream and runs white over the stones
    const ford = model.sites.find((q) => q.kind === "ford" && q.onWater);
    if (ford) {
      const i0 = ford.onWater.i;
      const up = ch.pts.slice(Math.max(0, i0 - 7), Math.max(1, i0 - 1));
      if (up.length > 1) {
        ctx.strokeStyle = INK.paper; ctx.lineWidth = ch.widthPx * 0.42; ctx.globalAlpha = 0.9;
        // two paper strokes along the banks pinch the water between them
        for (const side of [1, -1]) {
          ctx.beginPath();
          for (let k = 0; k < up.length; k++) {
            const [x, y] = up[k];
            const a = ch.pts[Math.max(0, i0 - 7 + k - 1)], b = ch.pts[Math.min(ch.pts.length - 1, i0 - 7 + k + 1)];
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
  if (f.kind === "built") {
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

/** the "you are here" ring, the glyph and the hit target for a site; dimmed when only heard of */
function paintSite(ctx, site, { here = false, know = "seen", scale = 1 }) {
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
} = {}) {
  const { frame, rnd } = model;
  const w = frame.w, h = frame.h;
  const sp = space || labelSpace();
  const exSp = exitSpace || labelSpace();
  // ⛑ a painter with no queue draws its labels at once — a test, or a film frame drawn in one pass
  const q = queue || ((c, text, box, kind, opts) => { if (box) { c.textAlign = opts?.align || "center"; drawLabel(c, text, box.x, box.y, kind, opts || {}); } });
  const R2 = rngOf(seedOf("paint:" + model.id));
  const out = { sites: [], exits: [], labelled: [], dimmed: [], withheld: [], inset: null };
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
  // paper
  ctx.fillStyle = INK.paper; ctx.fillRect(0, 0, w, h);
  // a faint paper grain — a few hundred seeded specks
  ctx.fillStyle = "rgba(120,98,66,0.06)";
  for (let i = 0; i < Math.round((w * h) / 900); i++) ctx.fillRect(R2() * w, R2() * h, 1.2, 1.2);
  // contours across the uphill
  ctx.strokeStyle = INK.contour; ctx.lineWidth = 0.8;
  ctx.globalAlpha = model.contours.strength <= 0.018 ? 0.5 : 1;
  for (const line of model.contours.lines) { smoothPath(ctx, line); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // the ground: fields, woods, rock, marsh, waste first; built ground over them; water last so it cuts them
  const order = { field: 0, marsh: 0, waste: 0, rock: 1, wood: 2, built: 3, water: 4 };
  for (const f of [...model.features].sort((a, b) => (order[a.kind] ?? 1) - (order[b.kind] ?? 1))) paintFeature(ctx, f, model, rnd);
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
  // ⛔ THE EXITS GO FIRST, in their own band at the rim (SNG-677 §0) — and their boxes are CLAIMED in the main
  // space as well, so a site's name cannot land across a road's name. ⚠️ The box is CENTRED on where the ink
  // will be: a left-aligned label placed by its left edge and then clamped into the frame by its centre drew
  // half a label's width to the right of the box it had reserved (measured at 365 px: "→ Sunken Choir · 500 mi"
  // sat under "The Water Wheels" with both spaces reporting no collision).
  if (exits) {
    for (const r of model.roads) {
      const name = r.name || r.to || "";
      if (!name) continue;
      const miles = Number.isFinite(Number(r.mi)) ? ` · ${Math.round(Number(r.mi))} mi` : "";
      const text = `→ ${name}${miles}`;
      const ex = r.exit;
      const tw = (drawLabel(ctx, text, -9999, -9999, "exit", { max: 30 })?.w) || 0;
      const cx = clamp(ex.x, tw / 2 + 6, w - tw / 2 - 6);
      const ey = clamp(ex.y + (ex.y < h / 2 ? 14 : -8), 12, h - 4);
      const box = exSp.place(cx, ey, tw, 12, { kind: "exit", clampTo: { w, h } });
      if (!box) continue;
      sp.claim({ x0: box.x0, x1: box.x1, y0: box.y0, y1: box.y1, kind: "exit", rank: -2 });
      q(ctx, text, box, "exit", { align: "center", max: 30 }, 0, exSp);
      out.exits.push({ id: r.to, x0: box.x - tw / 2 - 6, x1: box.x + tw / 2 + 6, y0: box.y - 13, y1: box.y + 5, name });
    }
  }
  // the sites, by what is known of them
  const fit = model.frame.fitMetres;
  for (const s of model.sites) {
    const kn = siteKnowledge(s, { character, placeId: model.id, layout: model.layout, known, reveal });
    if (kn === "unknown") { out.withheld.push(s.id); continue; }
    if (s.x < -20 || s.y < -20 || s.x > w + 20 || s.y > h + 20) continue;
    if (kn === "heard") out.dimmed.push(s.id);
    const hit = paintSite(ctx, s, { here: hereSite === s.id, know: kn, scale: clamp(Math.sqrt(frame.k), 1, 1.6) });
    out.sites.push(hit);
    // ⛑ a site close to the centre is labelled in the ENLARGEMENT when there is one (SNG-677 §0 at this scale)
    const dC = Math.hypot(s.x - model.built.x, s.y - model.built.y);
    if (inset && dC < labelMinPx) continue;
    const kind = s.location ? "landmark" : "landmarkUnder";
    const text = String(s.name || s.id);
    const tw = (drawLabel(ctx, text, -9999, -9999, kind, {})?.w) || 0;
    const box = sp.place(s.x, s.y - 11, tw, 12, { kind, clampTo: { w, h }, offsets: [[0, 0], [0, 22], [tw / 2 + 10, 5], [-tw / 2 - 10, 5]] });
    if (box) { q(ctx, text, box, kind, { align: "center" }); out.labelled.push(s.id); }
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
    const text = String(f.name);
    const tw = (drawLabel(ctx, text, -9999, -9999, "landmarkUnder", {})?.w) || 0;
    const box = sp.place(x, y, tw, 12, { kind: "landmarkUnder", clampTo: { w, h } });
    if (box) { q(ctx, text, box, "landmarkUnder", { align: "center" }); out.labelled.push(f.id); }
  }
  // the place's own name, over the built ground — the one label nothing may evict when you stand here
  if (title && model.placeName) {
    const text = String(model.placeName).toUpperCase();
    const tw = (drawLabel(ctx, text, -9999, -9999, "landmark", { here: true })?.w) || 0;
    const box = sp.place(model.built.x, model.built.y - model.built.r - 8, tw, 14, { kind: "landmark", opts: { here: true }, clampTo: { w, h }, offsets: [[0, 0], [0, model.built.r * 2 + 30], [tw / 2 + model.built.r + 10, 0], [-tw / 2 - model.built.r - 10, 0]] });
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
export function paintEnlargement(ctx, layout, panel, { placeName = "", placeId = "", space = null, queue = null, character = null, known = null, reveal = false, hereSite = null } = {}) {
  const frame = localFrame(layout, { w: panel.w, h: panel.h, focusMetres: panel.focusMetres, pad: 12 });
  const model = localModel(layout, frame, { placeName, placeId });
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
