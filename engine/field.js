// engine/field.js — ⛔ THE POWER FIELD: EVALUATED EVERYWHERE, NEVER INTERPOLATED BETWEEN MARKERS.
//
// ⛔ WHY THIS EXISTS, AND WHY IT IS AN EXTRACTION RATHER THAN A REWRITE. `exesa_field.html` was filed as a
// prototype to delete. Erik: *"the exesa prototype's way of showing and applying all of the power sources — that
// was most of the work we did."* ⚑ Aevi's correction (`po/REPLY_aevi_exesa_field_engine.md`) is the reason this
// file exists: she had measured what the prototype DUPLICATED (a projection, baked coordinates, invented terrain)
// and concluded it contributed nothing, **never measuring what it did that nothing else does**.
//
// ⛑ ONE EVALUATOR, THREE TIERS, AND `sampleWindow` IS THE EXTRACTION. The prototype hardcodes a 288×144 grid over
// the whole globe. The world tier wants exactly that; the region tier wants its own extent; the location tier
// wants a window a degree across. ⚠️ Same evaluator, different window — a per-tier field layer is impossible
// without it, and a field computed twice is a field that disagrees with itself, which is the whole failure the
// map convergence work exists to end. Built to `po/SPEC_aevi_field_engine.md` and her acceptance review.
//
// ⛔ WHAT A WINDOW CANNOT BUY YOU (SNG-414, and Aevi's own revision of her acceptance A6): total variation per
// degree rises ×2.09 refining 2°→1° and ×1.27 for 1°→0.5°, then goes FLAT — **below ~0.25° the generator has no
// features.** So a window buys FIELD detail and never TERRAIN detail, and **the location tier must not draw
// landform: there is none at that scale.** It draws BUILT things. `TERRAIN_FEATURE_FLOOR_DEG` is that number,
// exported so a later tier asserts the floor instead of spending a week rendering hills that do not exist.
//
// ⚠️ PURE, AND DATA IN. Nothing here fetches, bakes or knows about a canvas — which is what lets three tiers and a
// test call the same functions.

/** ⛔ THE MEMBERSHIP LINE, AND IT IS ONE NUMBER IN THREE PLACES — in/out on the probe, the coverage share, and the
 *  pivot POLARISE pushes away from. Aevi's spec called it `FIELD_THRESHOLD` and then blessed this name: "yours is
 *  the better word and my spec should read MEMBERSHIP." One literal, no re-typing. */
export const MEMBERSHIP = 0.55;

/** ⛔ SNG-414: the resolution below which the world generator has nothing left to say. The FIELD keeps resolving;
 *  the GROUND does not. Named here so the tiers can assert the floor rather than rediscover it. */
export const TERRAIN_FEATURE_FLOOR_DEG = 0.25;

/** The six registers the ground can be read in, and the words a reader sees. `body` is off by default. */
export const FIELD_KINDS = ["precursor", "nanite", "veil", "wild", "metaphysical", "body"];
export const KIND_LABEL = {
  precursor: "crystal lattice", nanite: "ordered nanite", veil: "the veil",
  wild: "wild nanite", metaphysical: "meaning", body: "body",
};

/** ⛔ ARC STAGES SHIFT THE FIELD — "the ground is not where it was authored". ⚑ Aevi: "THE FIELD ANSWERS TO THE
 *  STORY. This is the most valuable thing in the file and it appears nowhere else in the codebase." A stage above
 *  one moves every reading; `POLARISE` pushes away from the middle instead of up or down. */
export const ARC_EFFECTS = {
  arc_what_wakes_beneath: { precursor: +1, nanite: +0.6, veil: -1, metaphysical: -0.7 },
  arc_the_poles_pull: { POLARISE: 1 },
  arc_manifestation_storm: { precursor: +0.5, wild: +0.8, veil: -0.4 },
  arc_bleeding_grammar: { nanite: +1, wild: -0.8 },
  arc_green_schism: { wild: -1, veil: +0.4, metaphysical: +0.5 },
  arc_the_disagreement: { veil: +1, metaphysical: +0.8 },
};
export const ARC_STEP = 0.055;

/** How near a thing must be before the probe will name it — the prototype's reaches, kept. */
export const PROBE_REACH = { waygate: 6, anchor: 9, place: 26 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const RAD = Math.PI / 180;
const LETTER = { ordered: "o", wild: "w", clear: "c" };

/** Longitude difference across the antimeridian — the wrap every region renderer gets wrong once. Pure. */
export function lonDelta(a, b) {
  let d = a - b;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/** Cheap value noise — deterministic, seedless, and the same everywhere so two tiers agree point for point. */
export function noise2(a, b) {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** ⛔ THE VOTE. Canon's own note says "evaluate, do not interpolate"; this is its working implementation —
 *  inverse distance at 1.6, with longitude convergence (`cos(lat)`) so a degree near the pole is not a degree at
 *  the equator, and +6 so a point sitting on a voter does not divide by nothing. Pure. */
export function voteWeight(lat, lon, vLat, vLon, cosLat) {
  const dy = lat - vLat;
  const dx = lonDelta(lon, vLon);
  return 1 / Math.pow(dy * dy + dx * dx * cosLat * cosLat + 6, 1.6);
}

/** ⛔ WHAT THE STORY DOES TO THE GROUND. A stage of 1 is the authored world; every step above it shifts the field
 *  by `ARC_STEP`, and `POLARISE` pushes away from `MEMBERSHIP` rather than up or down. Pure. */
export function arcShift(kind, d, stages = {}, effects = ARC_EFFECTS, step = ARC_STEP) {
  let o = 0;
  for (const id of Object.keys(effects)) {
    const n = (Number(stages[id]) || 1) - 1;
    if (!n) continue;
    const e = effects[id];
    if (e.POLARISE) { o += (d - MEMBERSHIP) * 0.34 * n; continue; }
    if (e[kind]) o += e[kind] * step * n;
  }
  return o;
}

/** ⛔ THE 44 SOURCES, NAMED — `{ id, name, lat, lon, strength, radius, state, kind }`, read from the AUTHORED
 *  records (`substrateSource` on a location) and never from the bake.
 *
 *  ⚠️ THE BAKE CANNOT SUPPLY THIS, AND THAT IS THE WHOLE POINT (Aevi, SPEC §1 and her A3): `terrain.json.fields
 *  .sources` holds 43 anonymous rows — it is missing two (Archive Hollow, Waystone) and it drops the NAME and the
 *  STATE. ⛔ **A probe that answers "source 12, +0.16" instead of "The Axis Gate, a crystal well" has lost the
 *  thing it was extracted for.** ⛑ `crystal well` vs `veil nexus` is DERIVED from the sign of the draw, never
 *  authored; the state comes from the region's nanite standing, and the authored spread is 20 ordered · 12 wild ·
 *  12 clear, which is the distribution her review measured against. */
export function loadSources(content = {}) {
  const locations = content.locations || {};
  const regions = content.fieldModel?.regions || content.regions || {};
  const out = [];
  for (const [key, l] of Object.entries(locations)) {
    const s = l?.substrateSource;
    const wp = l?.worldPos;
    if (!s || !wp || !Number.isFinite(Number(s.delta)) || !Number.isFinite(Number(wp.colatitude))) continue;
    const lon = Number(wp.longitude);
    out.push({
      id: l.id || key,
      name: l.name || l.id || key,
      lat: Number(wp.colatitude) - 90,
      lon: lon > 180 ? lon - 360 : lon,
      strength: Number(s.delta),
      radius: Number(s.radiusWorld) || 0.05,
      state: LETTER[regions[l.regionId]?.state] || "c",
      kind: Number(s.delta) >= 0 ? "crystal well" : "veil nexus",
      regionId: l.regionId || null,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

/** ⛔ THE FIELD. Point-first: every reading is evaluated where it is asked for, and a window is just many points.
 *  Returns an object, because the field a caller holds must be able to say "and now the arcs have moved". */
export function makeField({
  sources = [], voters = [], densByRegion = {}, nanByRegion = {}, means = [], roads = [],
  bands = {}, arcStages = {}, effects = ARC_EFFECTS, rings = true, isLand = null, places = [], waygates = [],
} = {}) {
  const cfg = { sources, voters, densByRegion, nanByRegion, means, roads, bands, arcStages, effects, rings, isLand, places, waygates };

  /** The region vote, then SOURCES AS GAUSSIANS on top. ⚑ A strength may be NEGATIVE, and then it is a SINK that
   *  draws the field DOWN — the applying half of Erik's sentence, and the half the first audit dropped. */
  const densityAt = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    let num = 0, den = 0;
    for (const v of voters) {
      const w = voteWeight(lat, lon, v[0], v[1], cl);
      num += w * (densByRegion[v[2]] ?? 0.5);
      den += w;
    }
    let d = den ? num / den : 0.5;
    for (const s of sources) {
      const dy = lat - s.lat, dx = lonDelta(lon, s.lon);
      const q = Math.sqrt(dy * dy + dx * dx * cl * cl) * RAD;
      const r = Math.max(s.radius, 1e-4);
      if (q < r * 3) d += s.strength * Math.exp(-(q * q) / (2 * r * r));
    }
    return clamp01(d);
  };

  /** ⛔ TWO ACCUMULATORS, not one field with a flag. A region's authored state is one or the other, but the FIELD
   *  MIXES, because the vote blends neighbours and the drift collar puts wild around ordered.
   *  ⚠️ PATCHINESS IS NOT DECORATION: the corpus says wild is "scattered thin along the old routes and gone feral
   *  IN PATCHES", so wild gets value noise at two scales and ordered ground stays even.
   *  ⬜ THE DRIFT COLLAR (proposed, not authored): "the reprocessing never stopped", so what is NOT gathered goes
   *  feral at the circuit's edge — an abandoned well's ring FILLS IN, a `clear` one blooms nothing at all. */
  const naniteAt = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    let ordN = 0, wldN = 0, wgt = 0, den = 0;
    for (const v of voters) {
      const w = voteWeight(lat, lon, v[0], v[1], cl);
      const nan = nanByRegion[v[2]];
      den += w;
      if (!nan) continue;
      if (nan[0] === "o") ordN += w * nan[1];
      if (nan[0] === "w") { wldN += w * nan[1]; wgt += w; }
    }
    let o = den ? ordN / den : 0, wv = den ? wldN / den : 0;
    if ((den ? wgt / den : 0) > 0.05) {
      const p = noise2(lat * 1.9, lon * 1.9) * 0.62 + noise2(lat * 5.3, lon * 5.3) * 0.38;
      wv *= 0.22 + 1.65 * p;
    }
    if (rings) {
      for (const s of sources) {
        if (!(s.strength > 0) || s.state === "c") continue;
        const dy = lat - s.lat, dx = lonDelta(lon, s.lon);
        const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
        const R0 = 7.5, W0 = 4.2, abandoned = s.state === "w";
        if (abandoned ? dd < R0 + W0 * 1.6 : (dd > R0 - W0 && dd < R0 + W0 * 1.6)) {
          const t = abandoned ? Math.max(0, (dd - R0) / W0) : (dd - R0) / W0;
          const pr = noise2(lat * 3.1 + 9, lon * 3.1 + 4) * 0.6 + noise2(lat * 7.7, lon * 7.7) * 0.4;
          wv = Math.max(wv, (abandoned ? 0.52 : 0.40) * Math.exp(-t * t * 1.1) * Math.min(1, s.strength * 4.5) * (0.3 + 1.4 * pr));
        }
      }
    }
    return { ordered: clamp01(o), wild: clamp01(wv) };
  };

  /** R38a/b — meaning is derived from PLACES (tags, tier, community, who is present) and carried by roads, NEVER
   *  from substrate, which is why it must not be drawn from the same band as the veil. */
  const meaningAt = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    let v = 0.05;
    for (const m of means) {
      const dy = lat - m[1], dx = lonDelta(lon, m[2]);
      const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
      const Rm = 4.5 + 16 * (m[4] || 0) + 7 * (m[5] || 0);
      if (dd < Rm) v = Math.max(v, (m[3] || 0) * Math.exp(-(dd * dd) / (Rm * Rm * 0.42)));
    }
    for (const [ay, ax, by, bx] of roads) {
      const ex = lonDelta(bx, ax), ey = by - ay, L2 = ex * ex + ey * ey;
      if (!L2) continue;
      const px = lonDelta(lon, ax);
      let t = ((lat - ay) * ey + px * ex) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qy = lat - (ay + ey * t), qx = px - ex * t;
      const q = Math.sqrt(qy * qy + qx * qx * cl * cl);
      if (q < 5.5) v = Math.max(v, 0.30 * Math.exp(-(q * q) / 9));
    }
    return Math.min(1, v);
  };

  /** ⛔ ONE REGISTER AT ONE POINT, 0–1, at ANY lat/lon — no grid, no texel, so the answer cannot depend on the
   *  resolution somebody happened to ask at (Aevi's revised A6.1). Each kind answers its own question:
   *   • `veil` is the MIRROR of the lattice — "powered by an ABSENCE" — so a thin lattice is a thin divide, and
   *     the authored nexuses bloom through it. NOT a meaning band.
   *   • `nanite` and `wild` each read THEIR OWN accumulator; clear ground stays dark rather than dimly glowing.
   *   • everything else is a band on the density: inside it, 1; below, a power curve; above, a straight falloff. */
  const strengthAt = (kind, lat, lon) => {
    if (kind === "body") return MEMBERSHIP;
    if (kind === "nanite" || kind === "wild") {
      const n = naniteAt(lat, lon);
      const v = clamp01((kind === "nanite" ? n.ordered : n.wild) + arcShift(kind, densityAt(lat, lon), arcStages, effects));
      return v < 0.06 ? 0 : v;
    }
    if (kind === "metaphysical") {
      return clamp01(meaningAt(lat, lon) + arcShift("metaphysical", densityAt(lat, lon), arcStages, effects) * 0.6);
    }
    const d = densityAt(lat, lon);
    if (kind === "veil") {
      const dd = clamp01(d + arcShift("veil", d, arcStages, effects));
      let v = Math.max(0, 1 - dd * 1.9);
      const cl = Math.cos(lat * RAD);
      for (const s of sources) {
        if (!(s.strength < 0)) continue;
        const dx = lonDelta(lon, s.lon);
        const q = Math.sqrt((lat - s.lat) * (lat - s.lat) + dx * dx * cl * cl) * RAD;
        const r = Math.max(s.radius, 0.05);
        if (q < r * 3) v = Math.max(v, Math.min(1, MEMBERSHIP + Math.abs(s.strength) * 2.4) * Math.exp(-(q * q) / (2 * r * r)));
      }
      return v < 0.05 ? 0 : v;
    }
    const b = bands[kind];
    if (!b) return 0;
    const lo = b.center - b.width, hi = b.center + b.width;
    const dd = clamp01(d + arcShift(kind, d, arcStages, effects));
    if (dd >= lo && dd <= hi) return 1;
    return dd < lo ? Math.pow(dd / Math.max(lo, 1e-6), 2.2) : Math.max(0, 1 - (dd - hi) * 1.7);
  };

  /** ⛔ ANY WINDOW, AT ANY RESOLUTION — "THE extraction". The whole globe is just the default window, so the
   *  region tier can resolve a `radiusWorld 0.09` source without a 7200-wide global grid.
   *  ⚠️ THE ANTIMERIDIAN IS UNWRAPPED HERE, ONCE, so no caller can get it wrong: a window given `lon0 > lon1`
   *  crosses ±180 and its longitudes run on past 180 instead of jumping. (Aevi's region prototype rediscovered
   *  that wrap the hard way; SNG-414 had it first — min/max gave the Centre a 394° window.) */
  const sampleWindow = ({ lat0 = -90, lat1 = 90, lon0 = -180, lon1 = 180, w = 288, h = 144 } = {}) => {
    const span = lon1 > lon0 ? lon1 - lon0 : lon1 + 360 - lon0;
    const n = w * h;
    const base = new Float32Array(n), ordered = new Float32Array(n), wild = new Float32Array(n), meaning = new Float32Array(n);
    const lats = new Float32Array(n), lons = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      const lat = lat0 + (lat1 - lat0) * ((y + 0.5) / h);
      for (let x = 0; x < w; x++) {
        const raw = lon0 + span * ((x + 0.5) / w);
        const lon = ((raw + 180) % 360 + 360) % 360 - 180;
        const i = y * w + x;
        lats[i] = lat; lons[i] = lon;
        base[i] = densityAt(lat, lon);
        const nan = naniteAt(lat, lon);
        ordered[i] = nan.ordered; wild[i] = nan.wild;
        meaning[i] = meaningAt(lat, lon);
      }
    }
    return { w, h, lat0, lat1, lon0, lon1, span, base, ordered, wild, meaning, lats, lons,
      at: (i) => ({ lat: lats[i], lon: lons[i] }) };
  };

  /** ⛔ THE FIELD AS A PICTURE — RGB per texel of a window, which is what makes it read as ground rather than as
   *  pins. ⚑ TWO MODES, TWO QUESTIONS: `mix` sums and normalises (HOW MUCH FIELD IS HERE); `max` gives the texel
   *  to the strongest source (WHICH SOURCE OWNS THIS GROUND). */
  const texture = ({ window: win = null, kinds = FIELD_KINDS.filter(k => k !== "body"), mode = "mix", rgb = {} } = {}) => {
    const W = win || sampleWindow();
    const COLOUR = { precursor: [74, 150, 255], nanite: [255, 214, 74], veil: [255, 82, 82], wild: [90, 224, 120], metaphysical: [198, 124, 255], body: [190, 190, 190], ...rgb };
    const out = new Uint8ClampedArray(W.w * W.h * 3);
    const kdiv = mode === "mix" ? Math.max(1, kinds.length * 0.62) : 1;
    for (let i = 0; i < W.w * W.h; i++) {
      const lat = W.lats[i], lon = W.lons[i];
      let r = 0, g = 0, b = 0;
      for (const k of kinds) {
        const v = strengthAt(k, lat, lon);
        const c = COLOUR[k] || [255, 255, 255];
        if (mode === "mix") { r += c[0] * v; g += c[1] * v; b += c[2] * v; }
        else { r = Math.max(r, c[0] * v); g = Math.max(g, c[1] * v); b = Math.max(b, c[2] * v); }
      }
      out[i * 3] = r / kdiv; out[i * 3 + 1] = g / kdiv; out[i * 3 + 2] = b / kdiv;
    }
    return out;
  };

  /** ⛔ HOW MUCH OF THE WORLD (or of a window) ONE KIND HOLDS — the share above `MEMBERSHIP`. ⚠️ An analysis
   *  instrument, not a legend: it is how you find out that a source you thought was everywhere covers 3%. */
  const coverage = (kind, { window: win = null, stride = 7 } = {}) => {
    const W = win || sampleWindow({ w: 144, h: 72 });
    let seen = 0, held = 0;
    for (let i = 0; i < W.w * W.h; i += stride) {
      seen++;
      if (strengthAt(kind, W.lats[i], W.lons[i]) > MEMBERSHIP) held++;
    }
    return seen ? held / seen : 0;
  };

  /** ⛔ THE PROBE — "how you find out WHY a place reads the way it does", and the reason to extract before
   *  deleting. Data, never HTML: density, what stands nearest, and every register's contribution with in/out
   *  against `MEMBERSHIP`. ⚠️ A crystal well and a veil nexus are told apart, because they are opposite things in
   *  the same list — and the anchor is NAMED, because "source 12, +0.16" is not an answer. */
  const probe = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    const near = (rows, reach) => {
      let best = null, bestD = Infinity;
      for (const r of rows || []) {
        const rLat = Array.isArray(r) ? r[1] : r.lat, rLon = Array.isArray(r) ? r[2] : r.lon;
        if (!Number.isFinite(rLat) || !Number.isFinite(rLon)) continue;
        const dy = lat - rLat, dx = lonDelta(lon, rLon);
        const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
        if (dd < bestD) { bestD = dd; best = r; }
      }
      if (!best || bestD > reach) return null;
      return { name: Array.isArray(best) ? best[0] : (best.name || best.id), degrees: Math.round(bestD * 10) / 10, row: best };
    };
    const a = near(sources, PROBE_REACH.anchor);
    const n = naniteAt(lat, lon);
    return {
      at: { lat, lon },
      density: densityAt(lat, lon),
      ordered: n.ordered,
      wild: n.wild,
      land: typeof isLand === "function" ? !!isLand(lat, lon) : null,
      nearest: {
        place: near(places, PROBE_REACH.place),
        waygate: near(waygates, PROBE_REACH.waygate),
        anchor: a ? { name: a.name, kind: a.row.kind, strength: a.row.strength, state: a.row.state, degrees: a.degrees } : null,
      },
      contributions: FIELD_KINDS.map((k) => {
        const value = strengthAt(k, lat, lon);
        return { kind: k, label: KIND_LABEL[k] || k, value, in: value > MEMBERSHIP };
      }),
    };
  };

  return {
    sources, voters, bands, arcStages,
    densityAt, naniteAt, meaningAt, strengthAt, sampleWindow, texture, coverage, probe,
    /** ⛔ A NEW FIELD, NEVER A MUTATION — the story moving the ground must not move it under another caller that
     *  is still reading the authored world. */
    withArcStages: (stages) => makeField({ ...cfg, arcStages: { ...(stages || {}) } }),
  };
}

/** ⛑ THE ONE PLACE THAT KNOWS WHERE THE WORLD KEEPS ITS NUMBERS, so the field above never does.
 *
 *  ⛔ THE SOURCES COME FROM CONTENT — the authored 44, named and stated (`loadSources`) — and the bake is the
 *  fallback for a caller that has no content to hand. Aevi's A3: "a bake is a lower layer than its source", and
 *  the bake is missing two of the 44 besides. ⚠️ Five baked points disagree with their authored record by more
 *  than half a degree (`waystone` 127° of longitude, `echo_river_crossing` 164°, `archive_hollow` 53°,
 *  `millbrook` 4°) — those five are a CONTENT question, and reading the authored side is still right: the field
 *  now sits where the world says the place is, and fixing the place moves the field with it.
 *
 *  ⛑ THE MODEL IS THE EXTRACTED ONE (`world/field_model.json`): its bands, its arcs and its nanite table each
 *  existed in the prototype page and NOWHERE else — the bake keeps the nanite state as an enum and drops the
 *  magnitude, and `rules/the_substrate.json`'s `sourceBands` is a different table (bands per authored SOURCE, not
 *  per field kind, which is why asking it for `precursor` answers nothing). ⚠️ `bands` rides in the returned data
 *  so a caller cannot forget it and read a silent zero. */
export function fieldDataFrom(fields = {}, model = null, { content = null, substrate = null } = {}) {
  const nanByRegion = {};
  for (const [rid, row] of Object.entries(model?.regions || {})) nanByRegion[rid] = [LETTER[row.state] || "c", Number(row.value) || 0];
  const authored = content ? loadSources({ ...content, fieldModel: model }) : [];
  const sources = authored.length
    ? authored
    : (fields.sources || []).map((s, i) => ({
        id: `baked_${i + 1}`, name: `source ${i + 1}`, lat: s[0], lon: s[1], strength: s[2], radius: s[3],
        state: "c", kind: s[2] >= 0 ? "crystal well" : "veil nexus", regionId: null, baked: true,
      }));
  return {
    sources,
    voters: fields.voters || [],
    densByRegion: substrate?.substrateDensity || fields.densByRegion || {},
    nanByRegion,
    means: [],   // ⬜ the meaning rows and the roads arrive with the layer; the field reads them when they do
    roads: [],
    bands: model?.bands || {},
    arcs: model?.arcs || [],
  };
}
