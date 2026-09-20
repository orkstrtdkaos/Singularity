// engine/field.js — ⛔ THE POWER FIELD: EVALUATED EVERYWHERE, NEVER INTERPOLATED BETWEEN MARKERS.
//
// ⛔ WHY THIS EXISTS, AND WHY IT IS AN EXTRACTION RATHER THAN A REWRITE. `exesa_field.html` was filed as a
// prototype to delete. Erik: *"the exesa prototype's way of showing and applying all of the power sources — that
// was most of the work we did."* ⚑ Aevi's correction (`po/REPLY_aevi_exesa_field_engine.md`) is the reason this
// file exists: she had measured what the prototype DUPLICATED (a projection, baked coordinates, invented terrain)
// and concluded it contributed nothing, **never measuring what it did that nothing else does**. What it did is
// here — items 1–10 of her list, lifted whole, before the page is deleted.
//
// ⛑ ONE EVALUATOR, THREE TIERS. The world globe, the region map and the location plate all read THIS, because a
// field that is computed twice is a field that disagrees with itself — which is the whole failure the map
// convergence work exists to end. `po/REPLY_aevi_map_convergence.md` §5 asserts it: *exactly one field evaluator*.
//
// ⚠️ PURE, AND DATA IN. Nothing here fetches, bakes or knows about a canvas. The caller hands it the world's own
// numbers — voters, sources, anchors, meaning rows, roads — so the question "the authored 44 or the baked 43?"
// stays a decision at ONE call site instead of a fact welded into the evaluator. (It is the authored 44: the bake
// is a lower layer than its source, and 41 of 44 match while Archive Hollow and Waystone are missing from it.)

/** ⛔ THE ONE PLACE THAT KNOWS WHERE THE WORLD KEEPS ITS NUMBERS, so the evaluator below never does. Takes the
 *  world's `fields` block and the nanite table and returns the shape `makeGrids` eats.
 *
 *  ⚠️ IT READS THE BAKE TODAY, AND THAT IS A DECISION WITH A DATE ON IT. Aevi ruled the field should read the
 *  AUTHORED 44 (`substrateSource` on a location), because "a bake is a lower layer than its source". Measured
 *  2026-09-20, before flipping it: of 118 baked points with an authored record, **113 agree within half a degree
 *  and FIVE do not** — `waystone` by 127° of longitude, `echo_river_crossing` by 164°, `archive_hollow` by 53°,
 *  `millbrook` by 4°, and four of those five carry near-identical worldPos, which reads as stamped rather than
 *  placed. ⛔ Reading the authored side today would move those sources to the wrong ground. So: one line, flipped
 *  the day those five are settled, and the drift measured rather than assumed in the meantime.
 *
 *  ⛑ THE MODEL IS THE EXTRACTED ONE (`world/field_model.json`): its bands, its arcs and its nanite table each
 *  existed in the prototype page and NOWHERE else — the bake keeps the nanite state as an enum and drops the
 *  magnitude, and `rules/the_substrate.json`'s `sourceBands` is a different table (bands per authored SOURCE, not
 *  per field kind, which is why asking it for `precursor` answers nothing). ⚠️ `bands` rides in the returned data
 *  so a caller cannot forget it and read a silent zero. */
export function fieldDataFrom(fields = {}, model = null, { substrate = null } = {}) {
  const LETTER = { ordered: "o", wild: "w", clear: "c" };
  const nanByRegion = {};
  for (const [rid, row] of Object.entries(model?.regions || {})) nanByRegion[rid] = [LETTER[row.state] || "c", Number(row.value) || 0];
  const sources = (fields.sources || []).map(s => [s[0], s[1], s[2], s[3]]);
  // a source is also an ANCHOR: a positive draw is a well, a negative one a veil nexus, and the ring logic needs
  // to know which state the ground around it is in
  const anchors = sources.map((s, i) => [`source ${i + 1}`, s[0], s[1], s[2], s[3], "o"]);
  return {
    voters: fields.voters || [],
    densByRegion: substrate?.substrateDensity || fields.densByRegion || {},
    nanByRegion,
    sources,
    anchors,
    meaning: [],   // ⬜ the meaning rows and the roads live in the prototype's own block; they arrive with the layer
    roads: [],
    bands: model?.bands || {},
    arcs: model?.arcs || [],
  };
}

/** ⛔ THE MEMBERSHIP LINE, AND IT IS ONE NUMBER IN THREE PLACES — in/out on the probe, the coverage share, and the
 *  pivot POLARISE pushes away from. Aevi: "it must move to `field.js` as a named export, not be re-typed." */
export const MEMBERSHIP = 0.55;

/** The six things the ground can be made of. `body` is the plain flesh-and-stone reading and is off by default. */
export const FIELD_KINDS = ["precursor", "nanite", "veil", "wild", "metaphysical", "body"];

/** ⛔ ARC STAGES SHIFT THE FIELD — "the ground is not where it was authored". ⚑ Aevi: "THE FIELD ANSWERS TO THE
 *  STORY. This is the most valuable thing in the file and it appears nowhere else in the codebase." A stage above
 *  one moves every texel; `POLARISE` pushes away from the middle instead of up or down. */
export const ARC_EFFECTS = {
  arc_what_wakes_beneath: { precursor: +1, nanite: +0.6, veil: -1, metaphysical: -0.7 },
  arc_the_poles_pull: { POLARISE: 1 },
  arc_manifestation_storm: { precursor: +0.5, wild: +0.8, veil: -0.4 },
  arc_bleeding_grammar: { nanite: +1, wild: -0.8 },
  arc_green_schism: { wild: -1, veil: +0.4, metaphysical: +0.5 },
  arc_the_disagreement: { veil: +1, metaphysical: +0.8 },
};
export const ARC_STEP = 0.055;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const RAD = Math.PI / 180;

/** Longitude difference across the antimeridian — the wrap every region renderer gets wrong once. Pure. */
export function lonDelta(a, b) {
  let d = a - b;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/** ⛔ THE VOTE. Canon's own note says "evaluate, do not interpolate"; this is its working implementation —
 *  inverse distance at 1.6, with longitude convergence (`cos(lat)`) so a degree near the pole is not a degree at
 *  the equator, and +6 so a texel sitting on a voter does not divide by nothing. Pure. */
export function voteWeight(lat, lon, vLat, vLon, cosLat) {
  const dy = lat - vLat;
  const dx = lonDelta(lon, vLon);
  return 1 / Math.pow(dy * dy + dx * dx * cosLat * cosLat + 6, 1.6);
}

/** Cheap value noise — deterministic, seedless, and the same everywhere so two tiers agree texel for texel. */
export function noise2(a, b) {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** The centre of texel `i` in a `width × height` equirectangular grid. Pure. */
export function texelCentre(i, width, height) {
  return { lat: 90 - (Math.floor(i / width) + 0.5) / height * 180, lon: -180 + ((i % width) + 0.5) / width * 360 };
}

/** ⛔ EVERY GRID, EVALUATED PER TEXEL (Aevi's items 1–5). Returns Float32Arrays, never markers:
 *   • `base`    — substrate density: the region vote, then SOURCES AS GAUSSIANS on top. ⚑ A source's strength may
 *                 be NEGATIVE, and then it is a SINK that draws the field DOWN — "the applying half of Erik's
 *                 sentence", and the half the first audit dropped entirely.
 *   • `ordered` / `wild` — TWO ACCUMULATORS, not one field with a flag. A region's authored state is one or the
 *                 other, but the FIELD MIXES, because the vote blends neighbours and the drift collar puts wild
 *                 around ordered. Overlap is the normal case.
 *   • `meaning` — R38a/b: derived from a place's tags, tier, community and who is present — NEVER from substrate,
 *                 which is why it must not be drawn from the same band as the veil. Roads carry it as a ribbon.
 *  ⚠️ PATCHINESS IS NOT DECORATION: the corpus says wild is "scattered thin along the old routes and gone feral IN
 *  PATCHES", "SMALL FIELDS gone feral", so wild gets value noise at two scales and ordered ground stays even. */
export function makeGrids(data = {}, { width = 288, height = 144, rings = true } = {}) {
  const voters = data.voters || [];
  const sources = data.sources || [];
  const anchors = data.anchors || [];
  const meaningRows = data.meaning || [];
  const roads = data.roads || [];
  const densByRegion = data.densByRegion || {};
  const nanByRegion = data.nanByRegion || {};
  const n = width * height;
  const base = new Float32Array(n), ordered = new Float32Array(n), wild = new Float32Array(n), meaning = new Float32Array(n);

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y + 0.5) / height * 180;
    const cl = Math.cos(lat * RAD);
    for (let x = 0; x < width; x++) {
      const lon = -180 + (x + 0.5) / width * 360;
      const i = y * width + x;

      // ── the vote: density, and the two nanite accumulators, in one pass over the voters
      let dNum = 0, dDen = 0, ordN = 0, wldN = 0, wgt = 0;
      for (const v of voters) {
        const w = voteWeight(lat, lon, v[0], v[1], cl);
        dNum += w * (densByRegion[v[2]] ?? 0.5);
        dDen += w;
        const nan = nanByRegion[v[2]];
        if (nan && nan[0] === "o") ordN += w * nan[1];
        if (nan && nan[0] === "w") { wldN += w * nan[1]; wgt += w; }
      }
      let d = dDen ? dNum / dDen : 0.5;

      // ── sources apply as Gaussians, clipped at 3σ; a negative strength is a SINK
      for (const s of sources) {
        const dy = lat - s[0];
        const dx = lonDelta(lon, s[1]);
        const dd = Math.sqrt(dy * dy + dx * dx * cl * cl) * RAD;
        const r = s[3];
        if (dd < r * 3) d += s[2] * Math.exp(-(dd * dd) / (2 * r * r));
      }
      base[i] = clamp01(d);

      let o = dDen ? ordN / dDen : 0, wv = dDen ? wldN / dDen : 0;
      if ((dDen ? wgt / dDen : 0) > 0.05) {
        const p = noise2(lat * 1.9, lon * 1.9) * 0.62 + noise2(lat * 5.3, lon * 5.3) * 0.38;
        wv *= 0.22 + 1.65 * p;
      }
      // ⬜ THE DRIFT COLLAR (proposed, not authored): "the reprocessing never stopped — spent nanite is gathered
      // and re-ordered on a schedule somebody still keeps", so what is NOT gathered goes feral at the circuit's
      // edge. An abandoned well's ring FILLS IN; a `clear` one blooms nothing at all.
      if (rings) {
        for (const a of anchors) {
          const dl = Number(a[3]);
          const state = a[5];
          if (!(dl > 0) || state === "c") continue;
          const dy = lat - a[1];
          const dx = lonDelta(lon, a[2]);
          const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
          const R0 = 7.5, W0 = 4.2, abandoned = state === "w";
          if (abandoned ? dd < R0 + W0 * 1.6 : (dd > R0 - W0 && dd < R0 + W0 * 1.6)) {
            const t = abandoned ? Math.max(0, (dd - R0) / W0) : (dd - R0) / W0;
            const pr = noise2(lat * 3.1 + 9, lon * 3.1 + 4) * 0.6 + noise2(lat * 7.7, lon * 7.7) * 0.4;
            wv = Math.max(wv, (abandoned ? 0.52 : 0.40) * Math.exp(-t * t * 1.1) * Math.min(1, dl * 4.5) * (0.3 + 1.4 * pr));
          }
        }
      }
      ordered[i] = clamp01(o);
      wild[i] = clamp01(wv);

      // ── meaning: a city means something further out than a hermitage does, and roads carry it
      let m = 0.05;
      for (const row of meaningRows) {
        const dy = lat - row[1];
        const dx = lonDelta(lon, row[2]);
        const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
        const Rm = 4.5 + 16 * (row[4] || 0) + 7 * (row[5] || 0);
        if (dd < Rm) m = Math.max(m, (row[3] || 0) * Math.exp(-(dd * dd) / (Rm * Rm * 0.42)));
      }
      for (const [ay, ax, by, bx] of roads) {
        const ex = lonDelta(bx, ax), ey = by - ay, L2 = ex * ex + ey * ey;
        if (!L2) continue;
        const px = lonDelta(lon, ax);
        let t = ((lat - ay) * ey + px * ex) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qy = lat - (ay + ey * t), qx = px - ex * t;
        const q = Math.sqrt(qy * qy + qx * qx * cl * cl);
        if (q < 5.5) m = Math.max(m, 0.30 * Math.exp(-(q * q) / 9));
      }
      meaning[i] = Math.min(1, m);
    }
  }
  return { width, height, base, ordered, wild, meaning };
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

/** ⛔ HOW MUCH OF ONE KIND IS AT ONE TEXEL, 0–1. Each kind answers its own question:
 *   • `veil` is the MIRROR of the lattice — "powered by an ABSENCE", "the substrate SOLIDIFIES the divide" — so a
 *     thin lattice is a thin divide, and the authored thin places are nexuses on top of it. NOT a meaning band.
 *   • `nanite` and `wild` each read THEIR OWN grid; clear ground stays dark rather than dimly glowing.
 *   • everything else is a band on the density: inside it, 1; below, a power curve; above, a straight falloff. */
export function strengthAt(kind, grids, i, opts = {}) {
  const { lat, lon, stages = {}, bands = {}, anchors = [], effects = ARC_EFFECTS } = opts;
  const d = grids.base[i];
  if (kind === "body") return MEMBERSHIP;
  if (kind === "veil") {
    const dd = clamp01(d + arcShift("veil", d, stages, effects));
    let v = Math.max(0, 1 - dd * 1.9);
    if (lat !== undefined) {
      const cl = Math.cos(lat * RAD);
      for (const a of anchors) {
        const dl = Number(a[3]);
        if (!(dl < 0)) continue;
        const dx = lonDelta(lon, a[2]);
        const q = Math.sqrt((lat - a[1]) * (lat - a[1]) + dx * dx * cl * cl) * RAD;
        const r = Math.max(a[4] || 0, 0.05);
        if (q < r * 3) v = Math.max(v, Math.min(1, MEMBERSHIP + Math.abs(dl) * 2.4) * Math.exp(-(q * q) / (2 * r * r)));
      }
    }
    return v < 0.05 ? 0 : v;
  }
  if (kind === "metaphysical") return clamp01(grids.meaning[i] + arcShift("metaphysical", d, stages, effects) * 0.6);
  if (kind === "nanite" || kind === "wild") {
    const g = (kind === "nanite" ? grids.ordered : grids.wild)[i];
    const n = clamp01(g + arcShift(kind, d, stages, effects));
    return n < 0.06 ? 0 : n;
  }
  const b = bands[kind];
  if (!b) return 0;
  const lo = b.center - b.width, hi = b.center + b.width;
  const dd = clamp01(d + arcShift(kind, d, stages, effects));
  if (dd >= lo && dd <= hi) return 1;
  return dd < lo ? Math.pow(dd / Math.max(lo, 1e-6), 2.2) : Math.max(0, 1 - (dd - hi) * 1.7);
}

/** ⛔ THE FIELD AS A PICTURE — RGB per texel, which is what makes it read as ground rather than as pins.
 *  ⚑ TWO BLEND MODES, and they answer two different questions: `mix` sums and normalises by how many sources are
 *  lit (HOW MUCH FIELD IS HERE); otherwise the strongest source wins the texel (WHICH SOURCE OWNS THIS GROUND). */
export function paint(grids, sources, { mix = true, ...opts } = {}) {
  const lit = (sources || []).filter(s => s.on !== false);
  const n = grids.width * grids.height;
  const out = new Uint8ClampedArray(n * 3);
  for (let i = 0; i < n; i++) {
    const { lat, lon } = texelCentre(i, grids.width, grids.height);
    let r = 0, g = 0, b = 0;
    for (const s of lit) {
      const v = strengthAt(s.kind || s.k, grids, i, { ...opts, lat, lon });
      if (mix) { r += s.rgb[0] * v; g += s.rgb[1] * v; b += s.rgb[2] * v; }
      else { r = Math.max(r, s.rgb[0] * v); g = Math.max(g, s.rgb[1] * v); b = Math.max(b, s.rgb[2] * v); }
    }
    const k = mix ? Math.max(1, lit.length * 0.62) : 1;
    out[i * 3] = r / k; out[i * 3 + 1] = g / k; out[i * 3 + 2] = b / k;
  }
  return out;
}

/** ⛔ HOW MUCH OF THE WORLD ONE SOURCE HOLDS — the share of sampled texels above `MEMBERSHIP`. ⚠️ An analysis
 *  instrument, not a legend: it is how you find out that a source you thought was everywhere covers 3%. */
export function coverage(grids, kind, { stride = 7, ...opts } = {}) {
  const n = grids.width * grids.height;
  let seen = 0, held = 0;
  for (let i = 0; i < n; i += stride) {
    const { lat, lon } = texelCentre(i, grids.width, grids.height);
    seen++;
    if (strengthAt(kind, grids, i, { ...opts, lat, lon }) > MEMBERSHIP) held++;
  }
  return seen ? held / seen : 0;
}

/** The texel a position falls in. Pure. */
export function indexAt(grids, lon, lat) {
  const x = Math.min(grids.width - 1, Math.max(0, Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * grids.width)));
  const y = Math.min(grids.height - 1, Math.max(0, Math.floor((90 - lat) / 180 * grids.height)));
  return y * grids.width + x;
}

/** ⛔ THE PROBE — "how you find out WHY a place reads the way it does", and the debugging surface for the whole
 *  field. One point in: density, what stands nearest, and EVERY source's contribution with in/out against
 *  `MEMBERSHIP`. ⚠️ A crystal well and a veil nexus are told apart, because they are opposite things that sit in
 *  the same list (a well has positive draw, a nexus negative). Pure. */
export function probeAt(grids, lon, lat, opts = {}) {
  const { sources = [], places = [], waygates = [], anchors = [], kinds = FIELD_KINDS } = opts;
  const i = indexAt(grids, lon, lat);
  const cl = Math.cos(lat * RAD);
  const near = (rows) => {
    let best = null, bestD = Infinity;
    for (const r of rows) {
      const dy = lat - r[1], dx = lonDelta(lon, r[2]);
      const dd = Math.sqrt(dy * dy + dx * dx * cl * cl);
      if (dd < bestD) { bestD = dd; best = r; }
    }
    return best ? { name: best[0], degrees: Math.round(bestD * 10) / 10 } : null;
  };
  const wells = anchors.filter(a => Number(a[3]) > 0), nexuses = anchors.filter(a => Number(a[3]) < 0);
  return {
    at: { lon, lat, texel: i },
    density: grids.base[i],
    ordered: grids.ordered[i],
    wild: grids.wild[i],
    meaning: grids.meaning[i],
    nearestPlace: near(places),
    nearestWaygate: (() => { const w = near(waygates); return w && w.degrees <= 6 ? w : null; })(),
    nearestWell: near(wells),
    nearestNexus: near(nexuses),
    sources: kinds.map((k) => {
      const v = strengthAt(k, grids, i, { ...opts, lat, lon });
      return { kind: k, value: v, inside: v > MEMBERSHIP, lit: !sources.length || sources.some(s => (s.kind || s.k) === k && s.on !== false) };
    }),
  };
}
