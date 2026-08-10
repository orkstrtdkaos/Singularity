// engine/worldglobe.js — SNG-390. The world as a globe, read-only.
//
// Erik: the 3D world map should take the place of the card table. Aevi: "⛔ START BY READING NOTHING. The
// map is a *view* first… shipping the viewer alone is a complete deliverable" and "⚠️ Read-only. It must
// not become a second source of position."
//
// ⛔ A RE-IMPLEMENTATION, NOT A PORT, AND ONE LINE IN THE PROTOTYPE IS WHY:
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">
// This app has ZERO external runtime dependencies — index.html fetches nothing off any network — and a
// globe that needs a CDN stops working on a plane, in a tunnel, and on the day cdnjs has an outage.
// Vendoring Three.js was the alternative, at ~600KB on top of a 617KB terrain asset.
//
// ⚠️ AN ORTHOGRAPHIC GLOBE NEEDS NO 3D LIBRARY. Sphere → screen is eight lines of trigonometry, and the
// interaction Erik asked for — drag to spin, scroll to zoom, hover a place — lives entirely in the
// projection. What is lost is a perspective camera and Lambert lighting; the hillshade below carries the
// relief that the lighting was carrying.
//
// ⛔ AND THE PROTOTYPE'S BALANCE MATH IS NOT COPIED. It hard-codes `BANDS` and a 0.6 crowd floor — a second
// copy of `sourceBands` + `SUBSTRATE_TUNING`, which is the `map.x/y` failure class inside the very file
// that names it. The moment Erik picks one of SNG-389's options the map would keep telling the old story.
// `groundFactorAt` takes the engine's own `bandFactor` and the live band instead.

/** ⛔ THE FRAMING THE MAP OPENS ON, and it lives here because the viewer owns it and because a
 *  DUPLICATED default is a lie waiting to happen — app.js reads this, and so does the gate that
 *  asserts the opening view faces the inhabited hemisphere.
 *
 *  ⚠️ NEGATIVE PITCH IS NOT A TASTE CHOICE. The Crossing is the SOUTH pole of the map frame
 *  (lat = colatitude − 90), so every placed location in this world sits at lat ≤ 0. Opening at
 *  pitch +14 aimed the camera at a hemisphere of empty ocean — Erik's screenshot is exactly that,
 *  an unpopulated north with the land shoved onto the bottom limb. He offered to re-pole the
 *  Crossing northward to fix it; that is data surgery on gated canon to solve a camera problem.
 *  This is the camera fix, and `worldPos` never moved. */
export const DEFAULT_VIEW = { yaw: 20, pitch: -52 };

/** Base64 → bytes, without Buffer, so this runs in the browser and in a test alike. */
function b64(s) {
  if (typeof atob === "function") {
    const raw = atob(s); const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(s, "base64"));
}

/** Decode once and keep the typed arrays. ⚠️ Elevation is a FINER grid (720×360) than the other channels
 *  (480×240) — the prototype samples them separately and so must this. */
export function decodeTerrain(doc) {
  if (!doc || !doc.layers) return null;
  const g = (doc.encoding && doc.encoding.grid) || { w: 480, h: 240 };
  const eg = (doc.encoding && doc.encoding.elevationGrid) || { w: 720, h: 360 };
  return {
    w: g.w, h: g.h, ew: eg.w, eh: eg.h,
    c0: b64(doc.layers.c0), c1: b64(doc.layers.c1), c2: b64(doc.layers.c2), c3: b64(doc.layers.c3),
    biomes: doc.biomes || [], locations: doc.locations || {}, features: doc.features || {},
    // ⛔ SNG-402 — THE ASSET ALREADY CARRIED ALL OF THIS AND NOTHING READ IT. The vector hydrology
    // (111 rivers, 17 lakes, 38 marshes) and the resolved place names were generated, gated, argued over
    // across SNG-391/393/394 — and `grep hydrology engine/worldglobe.js app.js` returned ZERO. The
    // normalisation constants ride too, because a detail patch must reproduce the SAME hypsometry as the
    // baked raster or the two draw different worlds at the seam.
    hydrology: doc.hydrology || null, placeNames: doc.placeNames || null,
    RLO: doc.generatedBy?.RLO ?? null, RHI: doc.generatedBy?.RHI ?? null,
  };
}

/** The visible angular span of an orthographic globe, in degrees — the LOD control variable.
 *  At r >= half the canvas the whole hemisphere is on screen (180°); past that the view is a window. */
export function spanDeg(view, canvasPx) {
  const r = (view && view.r) || 1, half = (canvasPx || 700) / 2;
  return 2 * Math.asin(Math.max(-1, Math.min(1, half / r))) * 180 / Math.PI;
}

/** ⛔ THE PATCH MUST AGREE WITH THE BASE. `raw` → elevation through the SAME normalisation the pipeline
 *  used (2nd and 98.5th percentiles, stamped into the asset), so a generator-drawn pixel and a raster-drawn
 *  pixel of the same ground land on the same colour. rebuild.py's own header lists "the base globe and the
 *  detail patch drawing different worlds (a visible seam)" as a failure that already happened once. */
export function elevFromRaw(t, raw, type) {
  const e = Math.round(elevFromRawExact(t, raw));
  return type === 0 && e >= 128 ? 127 : Math.max(0, Math.min(254, e));
}

/** ⛔ UNROUNDED, AND THE DIFFERENCE MATTERS. The sub-cell relief this whole path exists to recover is
 *  often a FRACTION of one elevation unit — differencing two already-rounded values quantises it to zero
 *  and the detail vanishes silently, which is exactly what the first form of the gate caught. Take the
 *  delta in continuous space; round once, at the end, after it has been added to the baked value. */
export function elevFromRawExact(t, raw) {
  if (t.RLO == null || t.RHI == null) return 128;
  const t01 = Math.max(0, Math.min(1, (raw - t.RLO) / (t.RHI - t.RLO)));
  return 128 + t01 * 126;
}

const wrapLon = (lon) => ((lon + 180) % 360 + 360) % 360;
const cellIdx = (t, lon, lat) =>
  Math.min(t.h - 1, Math.floor((90 - lat) / 180 * t.h)) * t.w + Math.min(t.w - 1, Math.floor(wrapLon(lon) / 360 * t.w));
const elevIdx = (t, lon, lat) =>
  Math.min(t.eh - 1, Math.floor((90 - lat) / 180 * t.eh)) * t.ew + Math.min(t.ew - 1, Math.floor(wrapLon(lon) / 360 * t.ew));

/** What is at this point of the world. Pure. */
export function sampleAt(t, lon, lat) {
  if (!t) return null;
  const i = cellIdx(t, lon, lat), c0 = t.c0[i];
  return {
    type: c0 & 3,                 // 0 water · 1 land · 2 volcanic · 3 UNEXPLORED (SNG-391 corrected: I guessed "built" from the viewer tint; the generator says unexplored)
    nanite: (c0 >> 2) & 3,        // 0 clear · 1 ordered · 2 wild
    biome: t.biomes[t.c1[i]] || null,
    density: t.c2[i] / 63,        // the lattice field, 0..1
    elevation: t.c3[elevIdx(t, lon, lat)],
  };
}

/** The relief the Lambert material was carrying — slope from the elevation gradient. Without it the
 *  topographic layer reads as flat bands of colour. */
export function hillshade(t, lon, lat) {
  const ex = (t.c3[elevIdx(t, lon + 0.5, lat)] - t.c3[elevIdx(t, lon - 0.5, lat)]) / 255;
  const ey = (t.c3[elevIdx(t, lon, Math.min(90, lat + 0.5))] - t.c3[elevIdx(t, lon, Math.max(-90, lat - 0.5))]) / 255;
  return Math.max(0.55, Math.min(1.35, 1 + (ex * 1.6 - ey * 1.6)));
}

// Aevi's ramps, kept exactly — this is her authored look, not a palette for me to redesign.
const HYP = [[46, 84, 52], [92, 124, 60], [150, 158, 80], [186, 166, 104], [176, 136, 88], [150, 114, 84], [132, 120, 112], [176, 172, 168], [236, 238, 240]];
const HEAT = [[74, 27, 12], [113, 43, 19], [153, 60, 29], [216, 90, 48], [237, 161, 0], [192, 221, 151], [151, 196, 89], [99, 153, 34]];
const hyp = (v) => {
  const x = Math.max(0, Math.min(0.9999, v)) * (HYP.length - 1), i = Math.floor(x), f = x - i;
  const a = HYP[i], b = HYP[i + 1] || a;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};

/** ⛔ THE ONE PLACE THE MAP TOUCHES THE RULES, and it borrows them rather than restating them. `bandFn` is
 *  the engine's own `bandFactor` and `band` comes from `sourceBands`, so "whose ground" on the map and a
 *  craft's verdict in play are the same arithmetic — turning a dial moves both or neither. */
/** ⛔ DETAIL INJECTION, BECAUSE THE BAKED DEM KNOWS THINGS THE GENERATOR CANNOT. The shipped elevation
 *  is the HYDROLOGICALLY ADJUSTED surface — authored digs, three smoothing passes, pit fill — written back
 *  after buildHydrology; the generator returns the surface BEFORE any of that. Measured, the two differ by
 *  a median of 1 but a p99 of 28 and a max of 90 out of a 126-unit land range, and the big disagreements
 *  sit exactly where water was dug — which is where a reader looks.
 *
 *  ⚠️ So the generator does not REPLACE the elevation, it ADDS what the grid was too coarse to hold:
 *  the baked cell value stays the truth, and only the generator's variation WITHIN that cell rides on top.
 *  At a cell centre the correction is zero by construction, so base and patch cannot drift apart — the
 *  seam rebuild.py's header records as a real past failure is closed by arithmetic rather than by luck.
 *  The per-cell anchor is memoised: at regional zoom hundreds of pixels share one cell. */
export function makeFineSampler(t, gen) {
  const anchors = new Map();
  return (lon, lat) => {
    const g = gen(lon, lat);
    const i = elevIdx(t, lon, lat);
    let a = anchors.get(i);
    if (a === undefined) {
      const j = Math.floor(i / t.ew), k = i % t.ew;
      const clat = 90 - ((j + 0.5) / t.eh) * 180, clon = -180 + ((k + 0.5) / t.ew) * 360;
      a = elevFromRawExact(t, gen(clon, clat).raw);
      anchors.set(i, a);
    }
    const delta = elevFromRawExact(t, g.raw) - a;
    return { type: g.type, raw: g.raw, elevDelta: delta };
  };
}

/** Hillshade from the generator rather than the elevation grid — same two-tap gradient, finer steps. */
export function hillshadeFine(t, lon, lat, fine) {
  const d = 0.06;
  // ⚠️ the gradient is taken on the COMBINED surface — baked cell plus sub-cell delta — so relief and
  // colour are lit by the same ground. Shading a different surface than the one drawn is its own seam.
  const at = (lo, la) => {
    const f = fine(lo, la);
    return elevOf(t, lo, la) + (f.elevDelta || 0);
  };
  const ex = (at(lon + d, lat) - at(lon - d, lat)) / 255;
  const ey = (at(lon, Math.min(90, lat + d)) - at(lon, Math.max(-90, lat - d))) / 255;
  return Math.max(0.55, Math.min(1.45, 1 + (ex * 2.2 - ey * 2.2)));
}

/** the baked elevation at a point — the low-frequency truth the fine delta rides on */
export function elevOf(t, lon, lat) { return t.c3[elevIdx(t, lon, lat)]; }

export function groundFactorAt(t, lon, lat, band, bandFn) {
  const s = sampleAt(t, lon, lat);
  if (!s || !band || typeof bandFn !== "function") return null;
  return bandFn(band, s.density);
}

/** The colour of one point on one layer. Returns [r,g,b]. */
export function colorAt(t, lon, lat, opts) {
  const o = opts || {};
  const layer = o.layer || "topo";
  const base = sampleAt(t, lon, lat);
  if (!base) return [0, 0, 0];
  // ⚠️ THE FINE SAMPLER IS INJECTED, exactly like `worldPosOf` — this module still imports nothing and
  // still cannot become a second source of truth. When the view is close enough to be worth it the app
  // hands in the generator windowed to the visible patch, and COASTLINE + RELIEF come per-pixel instead of
  // per 0.75° cell. Biome and nanite keep coming from the raster: they are region-scale fields that read
  // smooth at any zoom, and re-deriving them here would mean shipping the whole region vote to the browser.
  const fine = o.fine ? o.fine(lon, lat) : null;
  const s = fine
    ? { ...base, type: fine.type,
        // the baked value carries the hydrology; the generator carries the sub-cell shape
        elevation: Math.max(0, Math.min(254, Math.round(base.elevation + (fine.elevDelta || 0)))) }
    : base;
  if (s.type === 0) {
    const dep = (128 - s.elevation) / 128;
    return [10 + (1 - dep) * 22, 26 + (1 - dep) * 34, 48 + (1 - dep) * 40];
  }
  // ⚠️ AND THE HILLSHADE FOLLOWS THE SAME SOURCE. Shading off the coarse grid under a per-pixel
  // coastline puts 0.75° blocks of light on a crisp shore — worse than either alone.
  const sh = o.fine ? hillshadeFine(t, lon, lat, o.fine) : hillshade(t, lon, lat);
  const tone = (s.elevation - 128) / 126;
  let c;
  if (layer === "lattice") {
    c = s.type === 3 ? [54, 52, 70] : [36 + s.density * 200, 30 + s.density * 160, 24 + s.density * 40];
  } else if (layer === "nanite") {
    c = s.type === 3 ? [62, 58, 80] : (s.nanite === 1 ? [55, 138, 221] : s.nanite === 2 ? [99, 153, 34] : [74, 74, 68]);
  } else if (layer === "ground") {
    if (s.type === 3) return [54, 52, 70];
    const f = groundFactorAt(t, lon, lat, o.band, o.bandFn);
    c = HEAT[Math.max(0, Math.min(7, Math.floor((f == null ? 1 : f) * 8)))];
  } else {
    c = hyp(tone);
    const bandN = Math.floor(tone * 12);                       // twelve contour bands, as the prototype read
    if (Math.abs(tone * 12 - bandN - 0.5) < 0.055) c = [c[0] * 0.72, c[1] * 0.72, c[2] * 0.72];
    if (s.type === 3) c = [c[0] * 0.55 + 31.5, c[1] * 0.55 + 29.7, c[2] * 0.55 + 42.3];
    if (s.type === 2) c = [c[0] * 0.5 + 65, c[1] * 0.5 + 31, c[2] * 0.5 + 22];
  }
  return [c[0] * sh, c[1] * sh, c[2] * sh];
}

/** Sphere → screen, orthographic. Null when the point is on the far side. ⚠️ Pure, and the exact inverse
 *  of `unproject` — the two are tested against each other rather than eyeballed on screen. */
export function project(lon, lat, view) {
  const v = view || {};
  const yaw = v.yaw || 0, pitch = v.pitch || 0, r = v.r == null ? 1 : v.r, cx = v.cx || 0, cy = v.cy || 0;
  const la = lat * Math.PI / 180, lo = (lon + yaw) * Math.PI / 180, p = pitch * Math.PI / 180;
  const x = Math.cos(la) * Math.sin(lo);
  const y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
  const y = y0 * Math.cos(p) - z0 * Math.sin(p);
  const z = y0 * Math.sin(p) + z0 * Math.cos(p);
  return z <= 0 ? null : { x: cx + x * r, y: cy - y * r, z };
}

/** Screen → sphere. Null outside the disc, which is also how a click on empty space is rejected. */
export function unproject(px, py, view) {
  const v = view || {};
  const yaw = v.yaw || 0, pitch = v.pitch || 0, r = v.r == null ? 1 : v.r, cx = v.cx || 0, cy = v.cy || 0;
  const x = (px - cx) / r, y = -(py - cy) / r;
  const d2 = x * x + y * y;
  if (d2 > 1) return null;
  const z = Math.sqrt(1 - d2), p = -pitch * Math.PI / 180;
  const y0 = y * Math.cos(p) - z * Math.sin(p);
  const z0 = y * Math.sin(p) + z * Math.cos(p);
  const lat = Math.asin(Math.max(-1, Math.min(1, y0))) * 180 / Math.PI;
  const lon = Math.atan2(x, z0) * 180 / Math.PI - yaw;
  return { lon: ((lon + 180) % 360 + 360) % 360 - 180, lat };
}

/** ⛔ VECTOR HYDROLOGY — THE REASON A CLOSE ZOOM READS AS COUNTRY INSTEAD OF PIXELS. Water rides the
 *  raster as two bits per 0.75° cell, which at close range is a staircase; the same water exists in the
 *  asset as traced polylines and outlines that scale to any zoom. Aevi's prototype fades them in below a
 *  46° span and that number is kept.
 *
 *  Returns SCREEN-SPACE paths, culled to the near face, so the caller only strokes them — the module
 *  still draws nothing itself and still owns no canvas. `fade` is 0 when the view is too wide to bother. */
export function hydrologyPaths(t, view, canvasPx) {
  const hy = t && t.hydrology;
  if (!hy) return { fade: 0, rivers: [], lakes: [], marsh: [] };
  const span = spanDeg(view, canvasPx);
  const fade = Math.min(1, Math.max(0, (46 - span) / 16));
  if (fade <= 0) return { fade: 0, rivers: [], lakes: [], marsh: [] };
  // ⚠️ THE ASSET STORES [lat, lon] IN THE MAP FRAME (lat = colatitude - 90), the same frame the pins
  // use. Feeding project() a swapped pair is the SNG-394b mirror bug one file over, so the order is
  // named here rather than left to the reader.
  const toScreen = (poly) => {
    const runs = []; let run = [];
    for (const p of poly) {
      const pr = project(p[1], p[0], view);
      if (!pr) { if (run.length > 1) runs.push(run); run = []; continue; }
      run.push([pr.x, pr.y]);
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };
  const many = (list) => (list || []).flatMap(toScreen);
  return {
    fade,
    // river width grows as the view narrows, so a stream stays a stream rather than a hairline
    riverWidth: Math.max(0.9, Math.min(4.5, 60 / Math.max(2, span))),
    rivers: many(hy.rivers), lakes: many(hy.lakes), marsh: many(hy.marsh),
  };
}

/** The locations to draw, projected and culled to the near face, far-first so near pins draw over them.
 *  ⚠️ `worldPosOf` is INJECTED: this module never reads a location's position itself, so it cannot become
 *  the second source of position Aevi warned about. */
export function visiblePins(t, view, worldPosOf) {
  const out = [];
  for (const id of Object.keys((t && t.locations) || {})) {
    const m = t.locations[id];
    const wp = worldPosOf ? worldPosOf(id) : null;
    if (!wp || !Number.isFinite(wp.longitude) || !Number.isFinite(wp.colatitude)) continue;
    // ⛔ MAP FRAME: lat = colatitude - 90 — the Crossing IS the south pole. The first form of this
    // line used 90 - colatitude and mirrored every pin into the empty northern ocean while the terrain
    // stayed put; Erik read it off the screen in one glance. Same frame as the asset and the pipeline.
    const p = project(wp.longitude, wp.colatitude - 90, view);
    if (p) out.push({ id, name: m.n || id, region: m.r || null, waygate: !!m.wg, x: p.x, y: p.y, z: p.z });
  }
  return out.sort((a, b) => a.z - b.z);
}
