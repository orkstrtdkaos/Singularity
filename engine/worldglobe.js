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
    hydrology: doc.hydrology || null, placeNames: doc.placeNames || null, fields: doc.fields || null,
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
/** ⛔ DETAIL INJECTION ON A BUDGETED PATCH — AND THE BUDGET IS THE WHOLE LESSON. My first version called
 *  the generator once per screen pixel, plus four more for the hillshade gradient: 378,000 pixels × 5 calls
 *  × 6µs = ELEVEN SECONDS of blocking work per repaint. Erik's report was "zooming seems to crash it,"
 *  and it was not a crash — it was the main thread gone for eleven seconds, which is worse than a crash
 *  because nothing says so. ⚠️ My own verification missed it: I waited 2500ms, screenshotted a
 *  HALF-PAINTED canvas, and read the painted half as success.
 *
 *  The fix is Aevi's prototype's shape, which I had read and not understood: sample the generator onto a
 *  small BUFFER over the visible window, then interpolate that buffer per pixel. The buffer is sized from
 *  a MEASURED per-call cost against a millisecond budget, so a slower machine gets a smaller buffer rather
 *  than a frozen tab — detail degrades, responsiveness does not.
 *
 *  ⚠️ Resolution still IMPROVES with zoom: the buffer spans the visible window, so as the window narrows
 *  the same samples cover less ground. At a 13° view a 128² buffer is ~5× finer than the 0.75° bake; at 3°
 *  it is ~20× finer.
 *
 *  ⚠️ THE SEAM PROPERTY SURVIVES THE REWRITE, which is why it is worth stating twice: the per-cell anchor
 *  is taken from THIS BUFFER by the same interpolant, so at a baked cell centre the correction is exactly
 *  zero and base and patch cannot drift apart. */
/** ⛔ THE PATCH IS PARAMETERISED IN A TANGENT FRAME, NOT IN LATITUDE AND LONGITUDE — and the Crossing is
 *  why. It sits at latitude −90 EXACTLY, where a full 360° of longitude spans zero distance, so a lat/lon
 *  window is not merely awkward there, it is the wrong shape: the half-width has to be divided by
 *  cos(lat), which at the pole is a division by zero, and capping it leaves most of the ring around the
 *  pole outside the window. ⚠️ MEASURED BEFORE REWRITING: at a 4° view centred on the Crossing only
 *  12.5% of the visible ground had any detail at all — the other 87.5% fell back to the 480×240 bake.
 *  Aevi predicted exactly this from her prototype ("a wedge of bare globe from capping longitude span")
 *  and she was right; her other predicted failure, the radial starburst, is the same cause seen from the
 *  other side — equirectangular rows collapse to nothing at the pole and smear what they do carry.
 *
 *  ⚠️ A TANGENT FRAME HAS NO SPECIAL CASE AND NO POLE. Sample (east, north) offsets in degrees of ARC
 *  from the patch centre and rotate them onto the sphere; the sampling is uniform on the ground at every
 *  latitude, which also retires the cos(lat) aspect correction the buffer used to need. The basis is
 *  built from a helper axis chosen to be non-parallel to the centre, which is the one line that keeps it
 *  degenerate-free AT the pole rather than merely near it.
 *
 *  ⚠️ The seam property is unchanged and still the load-bearing constraint (Aevi measured her own seam at
 *  2.44% disagreement): the per-cell anchor is taken from THIS buffer by the same interpolant, so at a
 *  baked cell centre the correction is exactly zero and base and detail cannot draw different worlds. */
export function makeFinePatch(t, gen, centre, halfDeg, opts) {
  const o = opts || {};
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const lat0 = centre.lat * Math.PI / 180, lon0 = centre.lon * Math.PI / 180;

  // orthonormal basis at the patch centre
  const up = [Math.cos(lat0) * Math.cos(lon0), Math.cos(lat0) * Math.sin(lon0), Math.sin(lat0)];
  // ⚠️ the helper must not be parallel to `up`, or the cross product vanishes — which is precisely the
  // degeneracy that makes every lat/lon scheme fail at a pole. Swapping the helper near the poles costs
  // one comparison and removes the special case entirely.
  const helper = Math.abs(up[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (v) => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; };
  const east = unit(cross(helper, up));
  const north = cross(up, east);

  /** (east, north) offsets in DEGREES OF ARC → [lon, lat] in degrees */
  const frameToLonLat = (e, n) => {
    const d = Math.hypot(e, n) * Math.PI / 180;
    if (d < 1e-12) return [centre.lon, centre.lat];
    const ce = (e / (Math.hypot(e, n) || 1)), cn = (n / (Math.hypot(e, n) || 1));
    const sd = Math.sin(d), cd = Math.cos(d);
    const v = [up[0] * cd + (east[0] * ce + north[0] * cn) * sd,
               up[1] * cd + (east[1] * ce + north[1] * cn) * sd,
               up[2] * cd + (east[2] * ce + north[2] * cn) * sd];
    return [Math.atan2(v[1], v[0]) * 180 / Math.PI, Math.asin(Math.max(-1, Math.min(1, v[2]))) * 180 / Math.PI];
  };
  /** [lon, lat] → (east, north) offsets in degrees, or null when it falls outside the patch */
  const lonLatToFrame = (lon, lat) => {
    const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    const v = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    const dot = Math.max(-1, Math.min(1, v[0] * up[0] + v[1] * up[1] + v[2] * up[2]));
    const d = Math.acos(dot) * 180 / Math.PI;
    if (d > halfDeg * 1.45) return null;                       // far outside — cheap reject before the rest
    const tx = [v[0] - up[0] * dot, v[1] - up[1] * dot, v[2] - up[2] * dot];
    const m = Math.hypot(tx[0], tx[1], tx[2]);
    if (m < 1e-12) return [0, 0];
    const te = (tx[0] * east[0] + tx[1] * east[1] + tx[2] * east[2]) / m;
    const tn = (tx[0] * north[0] + tx[1] * north[1] + tx[2] * north[2]) / m;
    return [te * d, tn * d];
  };

  // calibrate warm — measured cold, the first calls run interpreted and read six times pessimistic,
  // which pins the buffer to its floor and silently disables the detail it was sized to buy.
  for (let i = 0; i < 48; i++) { const [lo, la] = frameToLonLat((i % 7) * 0.01, (i % 5) * 0.01); gen(lo, la); }
  const t0 = now();
  let probes = 0;
  for (let i = 0; i < 192; i++) { const [lo, la] = frameToLonLat((i % 29) * 0.003, (i % 23) * 0.004); gen(lo, la); probes++; }
  const perCallUs = Math.max(0.4, (now() - t0) * 1000 / probes);
  // ⚠️ SQUARE BY CONSTRUCTION. In a tangent frame both axes are already degrees of ground, so the aspect
  // correction the lat/lon buffer needed — and got wrong near the pole — simply does not arise.
  const n = Math.max(32, Math.min(384, Math.round(Math.sqrt(((o.budgetMs ?? 70) * 1000) / perCallUs))));

  const step = (2 * halfDeg) / (n - 1);
  const raw = new Float32Array(n * n), typ = new Uint8Array(n * n), del = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    const nOff = -halfDeg + j * step;
    for (let i = 0; i < n; i++) {
      const [lo, la] = frameToLonLat(-halfDeg + i * step, nOff);
      const g = gen(lo, la);
      raw[j * n + i] = g.raw; typ[j * n + i] = g.type;
    }
  }
  const at = (arr, e, nn) => {
    const fx = Math.max(0, Math.min(n - 1, (e + halfDeg) / step));
    const fy = Math.max(0, Math.min(n - 1, (nn + halfDeg) / step));
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = Math.min(n - 1, x0 + 1), y1 = Math.min(n - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    const a = arr[y0 * n + x0], b = arr[y0 * n + x1], c = arr[y1 * n + x0], d = arr[y1 * n + x1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  const nearestType = (e, nn) => {
    const x = Math.round(Math.max(0, Math.min(n - 1, (e + halfDeg) / step)));
    const y = Math.round(Math.max(0, Math.min(n - 1, (nn + halfDeg) / step)));
    return typ[y * n + x];
  };

  // second pass: raw → a DELTA against the baked cell it falls in, so the per-pixel read is one
  // interpolation with no map lookup and no further generator calls.
  const anchors = new Map();
  for (let j = 0; j < n; j++) {
    const nOff = -halfDeg + j * step;
    for (let i = 0; i < n; i++) {
      const e = -halfDeg + i * step;
      const [lo, la] = frameToLonLat(e, nOff);
      const ci = elevIdx(t, lo, la);
      let a = anchors.get(ci);
      if (a === undefined) {
        const cj = Math.floor(ci / t.ew), ck = ci % t.ew;
        const cLon = -180 + ((ck + 0.5) / t.ew) * 360, cLat = 90 - ((cj + 0.5) / t.eh) * 180;
        const f = lonLatToFrame(cLon, cLat);
        a = f ? elevFromRawExact(t, at(raw, f[0], f[1])) : elevFromRawExact(t, raw[j * n + i]);
        anchors.set(ci, a);
      }
      del[j * n + i] = elevFromRawExact(t, raw[j * n + i]) - a;
    }
  }

  const sampler = (lon, lat) => {
    const f = lonLatToFrame(lon, lat);
    // ⛔ DECLINES rather than clamps: a point beyond the patch returned its EDGE sample once, which
    // painted everything outside the patch with whatever sat on its border, in patch-shaped rectangles.
    if (!f || Math.abs(f[0]) > halfDeg || Math.abs(f[1]) > halfDeg) return null;
    const r = at(raw, f[0], f[1]);
    const near = nearestType(f[0], f[1]);
    return { type: r > 0 ? (near === 0 ? 1 : near) : 0, raw: r, elevDelta: at(del, f[0], f[1]) };
  };
  sampler.bufferN = n;
  sampler.bufferW = n; sampler.bufferH = n;
  sampler.perCallUs = perCallUs;
  sampler.degPerSampleLon = step;
  sampler.degPerSampleLat = step;
  // the bake's own cell is 360/480 = 0.75°; below that this is worth drawing, above it is not
  sampler.worthIt = step < (360 / t.w) * 0.9;
  sampler.covers = (lon, lat) => sampler(lon, lat) !== null;
  return sampler;
}

/** Hillshade from the generator rather than the elevation grid — same two-tap gradient, finer steps. */
export function hillshadeFine(t, lon, lat, fine) {
  const d = 0.06;
  // ⚠️ the gradient is taken on the COMBINED surface — baked cell plus sub-cell delta — so relief and
  // colour are lit by the same ground. Shading a different surface than the one drawn is its own seam.
  const at = (lo, la) => { const f = fine(lo, la); return elevSmooth(t, lo, la) + (f ? f.elevDelta || 0 : 0); };
  const ex = (at(lon + d, lat) - at(lon - d, lat)) / 255;
  const ey = (at(lon, Math.min(90, lat + d)) - at(lon, Math.max(-90, lat - d))) / 255;
  return Math.max(0.55, Math.min(1.45, 1 + (ex * 2.2 - ey * 2.2)));
}

/** the baked elevation at a point — the low-frequency truth the fine delta rides on */
export function elevOf(t, lon, lat) { return t.c3[elevIdx(t, lon, lat)]; }

/** ⛔ THE ELEVATION FIELD, READ SMOOTHLY — AND THIS IS WHAT SCRAMBLED THE CONTOURS. `elevOf` returns the
 *  NEAREST 0.5° cell, which is a step function about fourteen screen pixels wide at regional zoom. The
 *  topographic layer draws a contour wherever `tone` lands within 0.055 of a band edge, and testing a
 *  thin band against a STAIRCASE means an entire rectangular cell either satisfies it or does not — so
 *  the contours came out as rectangular blobs following the grid instead of lines following the land.
 *  ⚠️ A contour is an isoline of a CONTINUOUS field; it cannot be drawn from a quantised one at any
 *  resolution. Bilinear interpolation is what makes the level set exist at all.
 *  ⚠️ Interpolating ACROSS a shoreline pulls coastal land toward the water's value, which crowds the
 *  low bands near the coast — that is how a real hypsometric map behaves and is left alone. */
export function elevSmooth(t, lon, lat) {
  const fy = Math.max(0, Math.min(t.eh - 1, (90 - lat) / 180 * t.eh - 0.5));
  const lo = ((lon + 180) % 360 + 360) % 360;
  const fx = lo / 360 * t.ew - 0.5;
  const y0 = Math.floor(fy), x0 = Math.floor(fx);
  const ty = fy - y0, tx = fx - x0;
  const yA = Math.max(0, Math.min(t.eh - 1, y0)), yB = Math.max(0, Math.min(t.eh - 1, y0 + 1));
  const xA = ((x0 % t.ew) + t.ew) % t.ew, xB = ((x0 + 1) % t.ew + t.ew) % t.ew;
  const a = t.c3[yA * t.ew + xA], b = t.c3[yA * t.ew + xB];
  const c = t.c3[yB * t.ew + xA], d = t.c3[yB * t.ew + xB];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

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
  // a patch that does not cover this point returns null, and the bake answers instead — see `inside`
  const fine = o.fine ? o.fine(lon, lat) : null;
  // ⚠️ UNROUNDED, AND SMOOTHLY READ. `elevation` stays an integer for anything that reports a height;
  // `elevExact` is the continuous field the SHADING uses, because a contour is a level set and a level
  // set of a rounded staircase is a grid of rectangles — which is precisely what shipped.
  const elevExact = Math.max(0, Math.min(254, elevSmooth(t, lon, lat) + (fine ? fine.elevDelta || 0 : 0)));
  const s = fine
    ? { ...base, type: fine.type, elevation: Math.round(elevExact) }
    : base;
  if (s.type === 0) {
    // ⛔ THE SEA GETS CONTOURS TOO. Erik: "it would be nice to show the topo going underwater as well,
    // that gives the water areas some interesting contour and we can use that for narration." The
    // elevation field runs 0..127 under water by the same normalisation, so the identical level-set rule
    // applies — there was simply never a band test on this branch. ⚠️ Shelf and deep now read differently,
    // which is a fact a narrator can use: a shallow crossing is not an abyss.
    const dep = (128 - elevExact) / 128;                       // 0 at the shore, 1 at the deepest
    let w = [10 + (1 - dep) * 22, 26 + (1 - dep) * 34, 48 + (1 - dep) * 40];
    const bands = 12 * (o.contourStep || 1);
    const tw = 1 - dep;                                        // rises toward the shore, same sense as land
    const bn = Math.floor(tw * bands);
    if (Math.abs(tw * bands - bn - 0.5) < 0.055 * (o.contourStep || 1)) w = [w[0] * 1.35 + 6, w[1] * 1.3 + 8, w[2] * 1.22 + 10];
    return w;
  }
  // ⚠️ AND THE HILLSHADE FOLLOWS THE SAME SOURCE. Shading off the coarse grid under a per-pixel
  // coastline puts 0.75° blocks of light on a crisp shore — worse than either alone.
  const sh = o.fine ? hillshadeFine(t, lon, lat, o.fine) : hillshade(t, lon, lat);
  const tone = (elevExact - 128) / 126;
  let c;
  // ⚠️ WHEN THE VIEW IS CLOSE ENOUGH TO WARRANT DETAIL, THESE TWO ARE EVALUATED RATHER THAN SAMPLED.
  // One region vote serves both, so a point costs one pass over 118 voters instead of two.
  const voteRegion = o.fine && t.fields ? regionVoteAt(t, lon, lat) : null;
  const dens = voteRegion ? densityAt(t, lon, lat, voteRegion) : s.density;
  const nan = voteRegion ? naniteAt(t, lon, lat, voteRegion) : s.nanite;
  if (layer === "lattice") {
    c = s.type === 3 ? [54, 52, 70] : [36 + dens * 200, 30 + dens * 160, 24 + dens * 40];
  } else if (layer === "nanite") {
    c = s.type === 3 ? [62, 58, 80] : (nan === 1 ? [55, 138, 221] : nan === 2 ? [99, 153, 34] : [74, 74, 68]);
  } else if (layer === "ground") {
    if (s.type === 3) return [54, 52, 70];
    // ⚠️ the ground layer asks the ENGINE's band arithmetic (SNG-390) — it is handed the resolved
    // density rather than the cell's, so "whose ground" sharpens with the zoom like everything else.
    const bandFn = o.bandFn;
    const f = (o.band && bandFn) ? bandFn(o.band, dens) : groundFactorAt(t, lon, lat, o.band, bandFn);
    c = HEAT[Math.max(0, Math.min(7, Math.floor((f == null ? 1 : f) * 8)))];
  } else {
    c = hyp(tone);
    // ⛔ CONTOUR INTERVAL FOLLOWS THE ZOOM, which is what a topographic map has always done. Twelve
    // bands across the world's whole 126-unit range means each band is ~10 units; a regional view spans
    // maybe twenty, so it crossed TWO lines and the layer had almost nothing to say at exactly the zoom
    // where relief matters most. Measured after the level-set fix: 284 contour pixels in a full frame.
    // ⚠️ Doubling steps rather than a smooth ramp, so lines APPEAR between zoom levels instead of
    // sliding across the ground — a contour that drifts as you zoom is reporting the camera, not the land.
    const bands = 12 * (o.contourStep || 1);
    const bandN = Math.floor(tone * bands);
    if (Math.abs(tone * bands - bandN - 0.5) < 0.055 * (o.contourStep || 1)) c = [c[0] * 0.72, c[1] * 0.72, c[2] * 0.72];
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

/** The contour interval multiplier for a given view span — 1 at world scale, doubling as the view
 *  narrows so a regional map carries regional relief. Powers of two only: lines appear BETWEEN levels
 *  rather than sliding, so a contour always means the same height at a given zoom. */
export function contourStepFor(span) {
  if (span > 60) return 1;
  if (span > 30) return 2;
  if (span > 14) return 4;
  if (span > 6) return 8;
  return 16;
}

/** ⛔ SNG-409 §1 — NANITE AND DENSITY RESOLVE BY EVALUATION, NOT BY A FINER BAKE.
 *  Aevi: "Type, nanite and biome are baked at 480 × 240 — roughly ten cells across the screen at a 5°
 *  view. The map is a picture that gets bigger, not a world that resolves."
 *
 *  ⚠️ Terrain needed a generator because it is a noise field. These two do not: they are a WEIGHTED VOTE
 *  over region seeds, `w = 1/((d² + 6)^1.6)`, which is a closed form that can be evaluated anywhere. So
 *  the asset ships the vote's INPUTS (118 voters, 27 regions, 43 sources — about 7KB) and this runs the
 *  same expression the pipeline ran.
 *
 *  ⛔ THAT IS ALSO HOW HER CONSTRAINT IS SATISFIED — "whatever produces the detail must agree with the
 *  baked layers, or the base and the detail draw different worlds; I measured it at 2.44% disagreement."
 *  A client that re-derives from the same numbers with the same expression cannot disagree with the
 *  bake: there is no seam to measure, rather than a small one to tolerate. The gate checks it anyway,
 *  because "cannot disagree" is a claim about code and code changes. */
export function regionVoteAt(t, lon, lat) {
  const f = t && t.fields;
  if (!f || !f.voters) return null;
  const R2 = Math.PI / 180;
  const cl = Math.cos(lat * R2);
  const w = {};
  let best = null, bestW = -1;
  for (let i = 0; i < f.voters.length; i++) {
    const v = f.voters[i];
    let dl = Math.abs(lon - v[1]); if (dl > 180) dl = 360 - dl;
    const d2 = (lat - v[0]) ** 2 + (dl * cl) ** 2;
    const ww = 1 / Math.pow(d2 + 6, 1.6);
    const r = v[2];
    const acc = (w[r] = (w[r] || 0) + ww);
    // ⚠️ the pipeline takes the max by a reduce over the accumulated map, which resolves ties toward the
    // first key inserted; tracking the running max reproduces that without materialising the key order.
    if (acc > bestW) { bestW = acc; best = r; }
  }
  return best;
}

/** The lattice density at a point — the winning region's base, plus every authored source that reaches. */
export function densityAt(t, lon, lat, region) {
  const f = t && t.fields;
  if (!f) return null;
  const r = region === undefined ? regionVoteAt(t, lon, lat) : region;
  if (!r) return 0;
  let d = Number(f.densByRegion[r]) || 0.5;
  const cl = Math.cos(lat * Math.PI / 180);
  for (let i = 0; i < f.sources.length; i++) {
    const s2 = f.sources[i];
    let dl = Math.abs(lon - s2[1]); if (dl > 180) dl = 360 - dl;
    // ⚠️ her radians conversion, kept verbatim — 57.3 rather than 180/π, because reproducing the bake
    // means reproducing its arithmetic and not improving it.
    const dist = Math.hypot(lat - s2[0], dl * cl) / 57.3;
    if (dist < s2[3] * 2.5) d += s2[2] * Math.exp(-Math.pow(dist / s2[3], 2));
  }
  return Math.max(0, Math.min(1, d));
}

/** The nanite state at a point — 0 clear · 1 ordered · 2 wild, from the winning region. */
export function naniteAt(t, lon, lat, region) {
  const f = t && t.fields;
  if (!f) return null;
  const r = region === undefined ? regionVoteAt(t, lon, lat) : region;
  return r ? (f.nanByRegion[r] ?? 0) : 0;
}

/** ⛔ WHAT A PLACE IS, IN ONE WORD, FOR THE MAP TO DRAW. Erik: "I'd like actual icons for the various
 *  types of things on the map." The order matters: a GATE is a gate before it is a settlement, because
 *  what you do there is step through it — the network is the fact that changes your route. A waygate
 *  that is also a region seat is still drawn as a gate for the same reason.
 *  ⚠️ `site` is the tier SNG-396 repopulated from play — rooms and yards inside a settlement, which is
 *  why they are drawn smallest and last: they are the interior, not the landmark. */
export function markerKind(m) {
  if (!m) return "settlement";
  if (m.ro === "gate" || m.wg) return "gate";
  if (m.t === "region") return "region";
  if (m.t === "site") return "site";
  if (m.ro === "waypoint") return "waypoint";
  return "settlement";
}

/** The drawing recipe per kind — shape, radius, fill, stroke. Pure data, so the canvas code is a switch
 *  over geometry and the LOOK lives in one place that a designer can read. */
export const MARKER_STYLE = {
  gate:       { shape: "diamond", r: 4.2, fill: "#8fd0e8", stroke: "#dff2fb", label: "waygate" },
  region:     { shape: "ring",    r: 5.0, fill: "rgba(232,214,160,0.30)", stroke: "#e8d6a0", label: "region seat" },
  settlement: { shape: "dot",     r: 2.8, fill: "rgba(240,238,228,0.88)", stroke: null, label: "settlement" },
  waypoint:   { shape: "dot",     r: 2.0, fill: "rgba(214,206,178,0.66)", stroke: null, label: "waypoint" },
  site:       { shape: "square",  r: 2.2, fill: "rgba(198,214,196,0.80)", stroke: null, label: "site" },
  player:     { shape: "pip",     r: 4.4, fill: "#d98a5a", stroke: "#f6d8bf", label: "another traveller" },
  here:       { shape: "here",    r: 5.0, fill: "#e8c14a", stroke: "#e8c14a", label: "you are here" },
};

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
    if (p) out.push({ id, name: m.n || id, region: m.r || null, waygate: !!m.wg,
      // ⚠️ KIND IS READ, NEVER DERIVED. tier and role are canon (SNG-396/398 ratified them) and the
      // pipeline stamps them into the asset; a viewer that inferred "this looks like a hold" would be
      // the second-source-of-truth mistake that worldPos is already gated against.
      tier: m.t || null, role: m.ro || null, kind: markerKind(m), placeKind: m.k || null,
      x: p.x, y: p.y, z: p.z });
  }
  return out.sort((a, b) => a.z - b.z);
}
