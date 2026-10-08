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

/** ⛔ WHERE THE WORLD TIER ENDS, AND IT IS MEASURED RATHER THAN CHOSEN. Total variation of the terrain
 *  field per degree of ground, as the sampling scale shrinks: refining 2°→1° gives ×2.09 more structure
 *  and 1°→0.5° gives ×1.27 — then it goes FLAT (×1.10, ×0.87, ×1.09, ×1.06). Below roughly a quarter
 *  of a degree of ground the generator has no features left, so everything finer is magnification.
 *
 *  ⚠️ On a 700px canvas a view of span S shows a 0.25° feature at 0.25×700/S pixels; it reaches ~20px —
 *  an obvious shape rather than a texture — at S ≈ 9°. So the globe carries genuine information down to
 *  about a 10° span and NOTHING below it, which is why every performance fix below that boundary only
 *  ever moved the cost around: the work was never buying information.
 *
 *  ⛔ Past this the map hands off to the REGION tier, which is authored. Erik: "somewhere around that
 *  point we start to lose meaningful information, so we should switch to the regional map." */
export const WORLD_TIER_FLOOR_DEG = 10;

/* ═════ SNG-677 W1 · WHAT A CLICK ON A GLOBE PIN DOES ═════
 * ✅ ERIK's standing rule: *"harnesses simulate the real game; move play logic into the engine, app.js and
 * tests call the same functions."* ⛔ THIS USED TO LIVE IN THE HANDLER, AND THE GATE READ ITS SOURCE TEXT
 * — two `indexOf` slices between `cv.onclick`, `cv.ondblclick` and `cv.onwheel`. ⚠️ Which is the defect
 * Aevi named on D1: *"the smoke gate checks the source text, not boxes — so it was green while the map was
 * not."* And it broke the moment the behaviour it described MOVED: deleting the dblclick handler left both
 * slices running to the end of the file, so both checks failed without either rule being wrong.
 * ⛑ The decision is pure — a pin, what is currently framed, and a way to ask which region an id is in —
 * so it belongs here, where a test can drive it with no canvas at all. */
export const REGION_FRAME_DEG = 26;

/**
 * @param pin        {{id, kind, tier, name}} the pin under the pointer, from `visiblePins`
 * @param framed     the region id the camera was last flown to, or null
 * @param regionOf   (id) => regionId, so this module needs no CONTENT
 * @returns {{action:"frame"|"enter"|"card", regionId, selectId, span}}
 */
export function globeClickAction(pin, { framed = null, regionOf = null } = {}) {
  if (!pin || !pin.id) return null;
  /* ⛔ "IS THIS A REGION SEAT" IS `tier`, NOT `kind` — measured 2026-10-06, and it cost 4 of 25 seats.
   * `markerKind` is the ICON vocabulary and it tests the waygate branch FIRST:
   *     if (m.ro === "gate" || m.wg) return "gate";
   *     if (m.t === "region")        return "region";
   * ⚠️ So a region seat that is ALSO a waygate draws as a gate and, if navigation read `kind`, would skip
   * framing and enter on the first click — The Thin Edge, The Marchward, The Middle Way and The Thinning,
   * four of the twenty-five, behaving differently from the other twenty-one for a reason nobody chose.
   * ⛑ Same shape as the key order that made a gang outrank an order: a declaration order quietly became a
   * priority rule. `kind` answers "what shape do I draw"; `tier` answers "is this a region". Two questions,
   * so two readings — and `kind` is kept as the fallback for any caller that has no tier to offer. */
  const isSeat = pin.tier ? pin.tier === "region" : pin.kind === "region";
  const rid = (regionOf ? regionOf(pin.id) : null) || (isSeat ? pin.id : null);
  /* ⛔ A PLACE CLICK OPENS ITS CARD, OVER THE GLOBE. It used to ENTER, and that was W1 read on its own.
   * ✅ W1 says *"A place click enters its region with the place selected, which is W7"* — pointing at W7 for
   * the detail — and ✅ W7 is explicit: *"A tap on a place pin opens the card over the globe. 'Look inside'
   * and 'Travel' work from there, and 'Show on region map' enters the region with that place selected."*
   * ⚠️ So entering is a BUTTON ON THE CARD, not the click. W1 shipped the entering form because there was
   * no card over the globe to open yet; now there is, and this is the authoritative reading.
   * ⛑ What has NOT changed is the thing W1 was actually for: there is no 8° place frame. That frame sat
   * below `floorRadius`, so it could only ever paint the raster past its own resolution — W6's bug, reached
   * by a click. `regionId` still rides along, because the card's extra button needs somewhere to go. */
  if (!isSeat) {
    return { action: "card", regionId: rid, selectId: pin.id, span: null };
  }
  // ⛔ ONE CLICK FRAMES, A SECOND ENTERS. ✅ Aevi: *"Double-click entry is unreliable, because the first
  // click starts a flight and the second lands on a moved pin. A phone has no double-click at all."*
  if (framed === pin.id) return { action: "enter", regionId: rid || pin.id, selectId: null, span: null };
  return { action: "frame", regionId: pin.id, selectId: null, span: REGION_FRAME_DEG };
}

/** The camera radius at which the world tier bottoms out, for a given canvas. */
export function floorRadius(canvasPx) {
  return (canvasPx / 2) / Math.sin((WORLD_TIER_FLOOR_DEG / 2) * Math.PI / 180);
}

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
    /* ⛔ AND `seats` IS THE SAME FAILURE AGAIN, ONE FIELD LATER — found 2026-10-06 driving SNG-677 W2.
     * The asset has carried a seat for all 39 regions (`{regionId: [lat, lon, placeId]}`) the whole time,
     * and this decoder dropped it, so `_terrain.seats` was `undefined` on every frame the globe ever drew.
     * ⚠️ IT HAD TWO READERS AND NO WRITER, AND BOTH FAILED SILENTLY because `regionNearest` returns null
     * over an empty map rather than throwing:
     *   1. `zoomBy`'s floor handoff — `const rid = c ? regionNearest(...) : null; if (rid) {…}` — so the
     *      wheel has NEVER ONCE entered a region. ✅ Aevi read it from the source and concluded *"that makes
     *      click and tap a dead end below the floor, and the wheel the only way in"*; in fact there was no
     *      way in at all except the breadcrumb, which is why W1 matters more than the order says.
     *   2. W2's "which region is the camera over", which is what sent me looking.
     * ⛑ A null-tolerant guard is where a missing field hides — the same shape as `if (!creature) continue`
     * swallowing a reader pointed at the wrong level of the bestiary. */
    seats: doc.seats || null,
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

  // ⛔ THE SLOW FIELDS RIDE THE PATCH, ON A COARSER SUB-GRID. The region vote is a pass over 118 voters
  // — 8.2µs a pixel — and running it per screen pixel took a full paint from 0.25s to 3.7s. It is also
  // the smoothest thing on the map: a region boundary is hundreds of kilometres wide, so sampling it at
  // a quarter of the terrain resolution loses nothing an eye could find.
  // ⚠️ Built lazily. The topographic layer never asks for these, and paying for them on the default view
  // is exactly the waste that caused the regression in the first place.
  const FS = Math.max(8, Math.round(n / 4));                   // field sub-grid, a quarter the linear rate
  let fReg = null, fDen = null;
  const buildFields = () => {
    fReg = new Array(FS * FS); fDen = new Float32Array(FS * FS);
    const fstep = (2 * halfDeg) / (FS - 1);
    for (let j = 0; j < FS; j++) for (let i = 0; i < FS; i++) {
      const [lo, la] = frameToLonLat(-halfDeg + i * fstep, -halfDeg + j * fstep);
      const r2 = regionVoteAt(t, lo, la);
      fReg[j * FS + i] = r2;
      fDen[j * FS + i] = densityAt(t, lo, la, r2);
    }
  };
  const fieldAt = (e, nn) => {
    if (!fReg) buildFields();
    const fstep = (2 * halfDeg) / (FS - 1);
    const x = Math.round(Math.max(0, Math.min(FS - 1, (e + halfDeg) / fstep)));
    const y = Math.round(Math.max(0, Math.min(FS - 1, (nn + halfDeg) / fstep)));
    return { region: fReg[y * FS + x], density: fDen[y * FS + x] };
  };

  // ⚠️ ONE-ENTRY MEMO ON THE FRAME TRANSFORM. A field layer asks the sampler for terrain and then asks
  // `fieldsAt` for the region, with the SAME point — two acos+atan2 transforms per pixel for one
  // location. The call order makes a single-slot cache hit every time, which is the cheapest possible
  // fix and needs no coordination between the two callers.
  let memoLon = NaN, memoLat = NaN, memoF = null;
  const frameOf = (lon, lat) => {
    if (lon === memoLon && lat === memoLat) return memoF;
    memoLon = lon; memoLat = lat; memoF = lonLatToFrame(lon, lat);
    return memoF;
  };
  const sampler = (lon, lat) => {
    const f = frameOf(lon, lat);
    // ⛔ DECLINES rather than clamps: a point beyond the patch returned its EDGE sample once, which
    // painted everything outside the patch with whatever sat on its border, in patch-shaped rectangles.
    if (!f || Math.abs(f[0]) > halfDeg || Math.abs(f[1]) > halfDeg) return null;
    const r = at(raw, f[0], f[1]);
    const near = nearestType(f[0], f[1]);
    // ⚠️ A PLAIN OBJECT, DELIBERATELY. My first attempt hung a getter here so the sub-grid would build
    // lazily — and defining an ACCESSOR on a per-pixel object costs more than the work it defers: the
    // topographic layer, which never reads the field at all, went from 0.80µs to 4.35µs a pixel. The
    // laziness is real but it belongs on the SAMPLER, not on every pixel it returns.
    return { type: r > 0 ? (near === 0 ? 1 : near) : 0, raw: r, elevDelta: at(del, f[0], f[1]) };
  };
  /** the slow fields, asked for by name — only the layers that read them ever call this */
  sampler.fieldsAt = (lon, lat) => {
    const f = frameOf(lon, lat);
    if (!f || Math.abs(f[0]) > halfDeg || Math.abs(f[1]) > halfDeg) return null;
    return fieldAt(f[0], f[1]);
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
/** ⛔ THE BOX A CLOSE SHOT'S FINE WINDOW COVERS (SNG-680, Aevi's ruling 2). A film that names a place closes in to
 *  9°, and at that span the 0.75° bake is a blocky coast — so the film bakes a square window of `colorAt` through
 *  a fine patch around the place, and the raster reads it where it covers. The box is 0.7 × the span either side
 *  (the frame's half-height is span/2; the margin pays for the turn), the longitude half widened by 1/cos(lat)
 *  and capped, the latitude clamped short of the poles. `n` texels a side: at 9° that is 0.057° a texel, thirteen
 *  times the bake's cell. Pure. */
export function fineWindowBox(centre, spanDeg, { n = 220 } = {}) {
  const lat = Math.max(-89.5, Math.min(89.5, Number(centre?.lat) || 0));
  const lon = ((Number(centre?.lon) || 0) + 540) % 360 - 180;
  const half = Math.max(2, Math.min(40, (Number(spanDeg) || 9) * 0.7));
  const conv = Math.max(0.12, Math.cos(lat * Math.PI / 180));
  const lonHalf = Math.min(180, half / conv);
  return {
    la0: Math.max(-90, lat - half), la1: Math.min(90, lat + half),
    lo0: lon - lonHalf, lo1: lon + lonHalf,              // unwrapped: a reader compares an unwrapped longitude
    half, n: Math.max(32, Math.round(n)), lat, lon,
  };
}

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
    if (Math.abs(tw * bands - bn - 0.5) < 0.055) w = [w[0] * 1.35 + 6, w[1] * 1.3 + 8, w[2] * 1.22 + 10];
    return w;
  }
  // ⚠️ AND THE HILLSHADE FOLLOWS THE SAME SOURCE. Shading off the coarse grid under a per-pixel
  // coastline puts 0.75° blocks of light on a crisp shore — worse than either alone.
  const sh = o.fine ? hillshadeFine(t, lon, lat, o.fine) : hillshade(t, lon, lat);
  const tone = (elevExact - 128) / 126;
  let c;
  // ⛔ ONLY THE LAYERS THAT USE IT PAY FOR IT — and getting this wrong cost a 15× slowdown on the
  // DEFAULT layer. The region vote is a pass over 118 voters, 8.2µs a pixel; I ran it whenever a detail
  // patch was active, including on the topographic layer, which reads neither density nor nanite. A
  // 700×540 paint went from 0.25s to 3.67s for work whose result was discarded.
  // ⚠️ This is the same mistake as the eleven-second repaint, one field along: per-pixel work over a
  // large set, added without asking what a pixel actually needs.
  // ⛔ ONLY THE LAYERS THAT USE IT PAY FOR IT, AND THEY READ IT OFF THE PATCH RATHER THAN VOTING PER
  // PIXEL. Getting this wrong cost a 15× slowdown on the DEFAULT layer: the vote is 8.2µs a pixel and I
  // ran it whenever a patch was active, including on topographic, which reads neither density nor
  // nanite — a 700×540 paint went from 0.25s to 3.67s for work whose result was thrown away.
  // ⚠️ Same mistake as the eleven-second repaint, one field along: per-pixel work over a large set,
  // added without asking what a pixel actually needs.
  const needsVote = fine && t.fields && o.fine.fieldsAt && (layer === "lattice" || layer === "nanite" || layer === "ground");
  const pf = needsVote ? o.fine.fieldsAt(lon, lat) : null;
  const dens = pf ? pf.density : s.density;
  const nan = pf ? (t.fields.nanByRegion[pf.region] ?? 0) : s.nanite;
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
    // ⛔ THE THRESHOLD IS A FRACTION OF THE BAND SPACING AND MUST NOT SCALE WITH THE STEP. Mine did,
    // and the arithmetic is unforgiving: at step 8 the test inked 88% of every band and at step 16 it
    // inked ALL of it — the "contours" Erik saw destroyed were not drawn wrongly, they were drawn
    // EVERYWHERE, so the map became its own contour and the residue read as noise.
    // ⚠️ Constant is also the RIGHT scaling, not merely the safe one: screen line width goes as
    // threshold × zoom / bands, and `bands` already tracks the zoom through contourStep — so a constant
    // threshold holds the line at a steady width, while scaling it multiplied the growth twice.
    const bands = 12 * (o.contourStep || 1);
    const bandN = Math.floor(tone * bands);
    if (Math.abs(tone * bands - bandN - 0.5) < 0.055) c = [c[0] * 0.72, c[1] * 0.72, c[2] * 0.72];
    if (s.type === 3) c = [c[0] * 0.55 + 31.5, c[1] * 0.55 + 29.7, c[2] * 0.55 + 42.3];
    if (s.type === 2) c = [c[0] * 0.5 + 65, c[1] * 0.5 + 31, c[2] * 0.5 + 22];
  }
  return [c[0] * sh, c[1] * sh, c[2] * sh];
}

/** Sphere → screen, orthographic. Null when the point is on the far side. ⚠️ Pure, and the exact inverse
 *  of `unproject` — the two are tested against each other rather than eyeballed on screen. */
export function project(lon, lat, view, radius) {
  const v = view || {};
  // ⚠️ `radius` is a multiplier on the sphere, not the camera: 1 is the surface, below 1 is UNDER it.
  // The precursor spans use it so the horizon occludes them earlier than the ground above them.
  const rad = radius == null ? 1 : radius;
  const yaw = v.yaw || 0, pitch = v.pitch || 0, r = (v.r == null ? 1 : v.r) * rad, cx = v.cx || 0, cy = v.cy || 0;
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

/** ⛔ SNG-414 TIER 2 — THE REGION BASE, GENERATED ONCE AT THE INFORMATION FLOOR AND KEPT.
 *
 *  The plan said "bake the base", and the arithmetic changed what baking should mean. New structure
 *  stops arriving below ~0.25° of ground, so a region only ever needs samples at that spacing — a
 *  median region (11.2° radius) is **90 × 90 = 8,100 samples, about 49ms**. Shipping that as an asset
 *  would cost ~0.42MB across 27 regions to save a twentieth of a second per region, once.
 *
 *  ⛔ SO IT IS NOT SHIPPED. It is generated on first entry and cached, which costs no payload, cannot
 *  go stale against the world, and — because it comes from the same deterministic generator — agrees
 *  with the globe by construction rather than by a tolerance. Aevi's constraint, satisfied the same way
 *  the region-vote fields satisfied it.
 *
 *  ⚠️ FLAT, NOT SPHERICAL. This is a 2D map of one region: an equirectangular window with the longitude
 *  axis scaled by cos(lat) so the ground is not stretched. At region scale that distortion is small and
 *  the gain is large — no projection maths per pixel, which is the cost that made the globe slow down
 *  here in the first place. */
/** ⛔ C1 · A POLE-CENTRED BASE, for a region sitting on the world's axis.
 *  ✅ ERIK, 2026-10-04: *"We do need a pole-centered Crossing map."* — answering CCODE-596, where the Crossing's
 *  eleven places spanned 0.76° of real ground and got a lon/lat box 171° wide that excluded ten of them.
 *
 *  ⛑ SAME OBJECT SHAPE AS `makeRegionBase` ON PURPOSE (`sample`, `toScreen`, `toWorld`, `extent`, `samples`), so
 *  the ground painter, the roads, the field, the territory walk and the clicks keep working without ever asking
 *  which base they are holding. That is Aevi's C1 in one sentence and it is the whole design.
 *
 *  ⚠️ AZIMUTHAL EQUIDISTANT: ρ is colatitude measured from the pole, θ is longitude, and screen distance from
 *  the hub is proportional to ρ everywhere — which is the one property a hub map must have. Longitude 0 points up.
 *  ⛔ AND IT DISSOLVES THE 360° PROBLEM rather than working around it: two places at colatitude 0.3 on opposite
 *  meridians are 0.6° apart here, because they ARE 0.6° apart. A lon/lat frame put them a world apart. */
export function makePolarBase(t, gen, extent, opts) {
  const o = opts || {};
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const floorDeg = o.floorDeg || 0.25;
  const pole = extent.pole || (extent.centre?.lat < 0 ? -1 : 1);
  const R = Math.max(1e-6, extent.poleRadiusDeg || Math.max(0.6, (extent.radiusDeg || 1) * 1.25));
  // ρ ↔ latitude, for whichever pole this region sits on
  const rhoOf = (lat) => (pole < 0 ? lat + 90 : 90 - lat);
  const latOf = (rho) => (pole < 0 ? rho - 90 : 90 - rho);
  // the projected plane, in degrees: u = ρ·sinθ (east), v = ρ·cosθ (toward longitude 0)
  const uvOf = (lon, lat) => { const r = rhoOf(lat), a = lon * RAD; return { u: r * Math.sin(a), v: r * Math.cos(a) }; };

  // ⛑ sampled on a CARTESIAN grid in the projected plane, so the samples are evenly spaced on the ground
  const n = Math.max(24, Math.min(512, Math.ceil((2 * R) / floorDeg)));
  const raw = new Float32Array(n * n), typ = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) {
    const v = -R + (j / (n - 1)) * 2 * R;
    for (let i = 0; i < n; i++) {
      const u = -R + (i / (n - 1)) * 2 * R;
      const rho = Math.hypot(u, v);
      const lat = latOf(Math.min(rho, 180));
      const lon = Math.atan2(u, v) * DEG;
      const g = gen(lon, lat);
      raw[j * n + i] = g.raw; typ[j * n + i] = g.type;
    }
  }
  const at = (arr, lon, lat) => {
    const { u, v } = uvOf(lon, lat);
    const fx = Math.max(0, Math.min(n - 1, ((u + R) / (2 * R)) * (n - 1)));
    const fy = Math.max(0, Math.min(n - 1, ((v + R) / (2 * R)) * (n - 1)));
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = Math.min(n - 1, x0 + 1), y1 = Math.min(n - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    const a = arr[y0 * n + x0], b = arr[y0 * n + x1], c = arr[y1 * n + x0], d = arr[y1 * n + x1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  const base = {
    extent, nx: n, ny: n, polar: true, pole, radiusDeg: R,
    // ⚠️ `conv` exists so a caller that reads it gets something sane rather than `undefined` doing arithmetic.
    // It is a LIE at this scale, which is why C2 re-points every caller at `toScreen`/`toWorld` instead.
    conv: 1,
    /** the same shoreline trick: sign(raw) IS the coast, so it is finer than the samples that drew it */
    sample(lon, lat) {
      const r = at(raw, lon, lat);
      const { u, v } = uvOf(lon, lat);
      const fx = Math.round(Math.max(0, Math.min(n - 1, ((u + R) / (2 * R)) * (n - 1))));
      const fy = Math.round(Math.max(0, Math.min(n - 1, ((v + R) / (2 * R)) * (n - 1))));
      const near = typ[fy * n + fx];
      return { type: r > 0 ? (near === 0 ? 1 : near) : 0, raw: r, elevation: elevFromRaw(t, r, r > 0 ? 1 : 0) };
    },
    toScreen(lon, lat, w, h) {
      const k = Math.min(w, h) / (2 * R);
      const { u, v } = uvOf(lon, lat);
      return { x: w / 2 + k * u, y: h / 2 - k * v };
    },
    toWorld(x, y, w, h) {
      const k = Math.min(w, h) / (2 * R);
      const u = (x - w / 2) / k, v = -(y - h / 2) / k;
      const rho = Math.hypot(u, v);
      return { lon: Math.atan2(u, v) * DEG, lat: latOf(Math.min(rho, 180)) };
    },
    /** ⛑ the disc is the map; outside it is the frame's margin, not ground */
    insideDisc(x, y, w, h) {
      const k = Math.min(w, h) / (2 * R);
      return Math.hypot(x - w / 2, y - h / 2) <= k * R + 1e-9;
    },
  };
  base.samples = n * n;
  return base;
}

export function makeRegionBase(t, gen, extent, opts) {
  const o = opts || {};
  const floorDeg = o.floorDeg || 0.25;                          // the measured information floor
  const midLat = (extent.la0 + extent.la1) / 2;
  const conv = Math.max(0.12, Math.cos(midLat * Math.PI / 180));
  const groundLon = (extent.lo1 - extent.lo0) * conv, groundLat = extent.la1 - extent.la0;
  // sample at the floor, with a floor of its own so a tiny region still gets a usable grid
  const nx = Math.max(24, Math.min(512, Math.ceil(groundLon / floorDeg)));
  const ny = Math.max(24, Math.min(512, Math.ceil(groundLat / floorDeg)));
  const raw = new Float32Array(nx * ny), typ = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const lat = extent.la0 + (j / (ny - 1)) * (extent.la1 - extent.la0);
    for (let i = 0; i < nx; i++) {
      const lon = extent.lo0 + (i / (nx - 1)) * (extent.lo1 - extent.lo0);
      const g = gen(lon, lat);
      raw[j * nx + i] = g.raw; typ[j * nx + i] = g.type;
    }
  }
  /** a longitude brought into the frame's own turn: 357° in a frame that runs −20…18 is −3°, and 238° in one that runs
   *  229…247 stays 238°. The frame is unwrapped on purpose (the Echo Vale runs 1.2 → 36.2); the WORLD is not. */
  const wrapLon = (lon) => {
    const mid = (extent.lo0 + extent.lo1) / 2;
    let v = Number(lon);
    while (v - mid > 180) v -= 360;
    while (mid - v > 180) v += 360;
    return v;
  };
  const at = (arr, lon0, lat) => {
    const lon = wrapLon(lon0);
    const fx = Math.max(0, Math.min(nx - 1, ((lon - extent.lo0) / (extent.lo1 - extent.lo0)) * (nx - 1)));
    const fy = Math.max(0, Math.min(ny - 1, ((lat - extent.la0) / (extent.la1 - extent.la0)) * (ny - 1)));
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = Math.min(nx - 1, x0 + 1), y1 = Math.min(ny - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    const a = arr[y0 * nx + x0], b = arr[y0 * nx + x1], c = arr[y1 * nx + x0], d = arr[y1 * nx + x1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
  const base = {
    extent, nx, ny, conv, wrapLon,
    /** ⚠️ sign(raw) IS the shoreline (100.000% against the generator over 20,000 samples), so the
     *  interpolated field crosses zero exactly where the coast runs and the shore is finer than the
     *  samples that drew it — the same trick that fixed the globe's staircase. */
    sample(lon0, lat) {
      const lon = wrapLon(lon0);
      const r = at(raw, lon, lat);
      const fx = Math.round(Math.max(0, Math.min(nx - 1, ((lon - extent.lo0) / (extent.lo1 - extent.lo0)) * (nx - 1))));
      const fy = Math.round(Math.max(0, Math.min(ny - 1, ((lat - extent.la0) / (extent.la1 - extent.la0)) * (ny - 1))));
      const near = typ[fy * nx + fx];
      return { type: r > 0 ? (near === 0 ? 1 : near) : 0, raw: r, elevation: elevFromRaw(t, r, r > 0 ? 1 : 0) };
    },
    /** screen ↔ world, for a canvas showing the whole extent */
    toScreen(lon0, lat, w, h) {
      const lon = wrapLon(lon0);
      return { x: ((lon - extent.lo0) / (extent.lo1 - extent.lo0)) * w,
               y: (1 - (lat - extent.la0) / (extent.la1 - extent.la0)) * h };
    },
    toWorld(x, y, w, h) {
      return { lon: extent.lo0 + (x / w) * (extent.lo1 - extent.lo0),
               lat: extent.la0 + (1 - y / h) * (extent.la1 - extent.la0) };
    },
  };
  base.samples = nx * ny;
  return base;
}

/** ⛔ A REGION IS A CIRCLE ON A SPHERE, NOT A BOX IN LATITUDE AND LONGITUDE — and Aevi's four authored
 *  maps are what proved it. She gives each region a `centre` and a `radiusDeg`, and in all four the
 *  farthest member sits at EXACTLY her radius (14.0/14, 12.5/12.5, 10.6/10.6, 17.1/17.1): a spherical
 *  bounding circle, computed properly.
 *
 *  ⚠️ MY BOUNDING BOX DISAGREED WITH HER BY 36° OF LONGITUDE ON THE CENTRE, and hers was right. A box
 *  centre is the midpoint of a lat/lon rectangle, which near a pole is not the middle of anything —
 *  the Centre sits at latitude −85.6 where a longitude midpoint is meaningless. ⛔ That mattered more
 *  than any coverage question: every bearing and distance she authors is measured FROM the centre, so
 *  two definitions of it would land every feature in the wrong place.
 *
 *  So: the circle is the frame. An authored map's centre WINS outright, because her bearings are
 *  measured from it; a region with no map gets the same circle computed the same way. */
export function regionExtent(regionId, locations, { padFrac = 0.18, authored = null } = {}) {
  const R2 = Math.PI / 180;
  const pts = [];
  for (const id of Object.keys(locations || {})) {
    const l = locations[id];
    if (!l?.worldPos || l.worldPosInherited) continue;
    if ((l.regionId || l.region) !== regionId) continue;
    pts.push([l.worldPos.colatitude - 90, l.worldPos.longitude]);
  }
  if (!pts.length && !authored) return null;

  const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1,
    Math.sin(a[0] * R2) * Math.sin(b[0] * R2) +
    Math.cos(a[0] * R2) * Math.cos(b[0] * R2) * Math.cos((a[1] - b[1]) * R2)))) / R2;

  let centre, radiusDeg;
  if (authored?.centre && Number.isFinite(authored.radiusDeg)) {
    // ⛔ THE AUTHORED CENTRE WINS. Her ways and named grounds are bearings and kilometres FROM it, so
    // recomputing one here would silently move every feature she placed.
    centre = { lat: authored.centre.lat, lon: authored.centre.lon };
    radiusDeg = authored.radiusDeg;
  } else {
    // the same circle, computed: a 3D mean direction (which has no pole problem), then the farthest member
    let x = 0, y = 0, z = 0;
    for (const [la, lo] of pts) {
      x += Math.cos(la * R2) * Math.cos(lo * R2);
      y += Math.cos(la * R2) * Math.sin(lo * R2);
      z += Math.sin(la * R2);
    }
    const m = Math.hypot(x, y, z) || 1;
    // ⚠️ atan2 answers in ±180 while the places are stored 0–360 — so the Making's centre came out at −121° with its
    // five places at 236–246°, and a wrap-blind projection put all five a full turn off the canvas (42 places in 14
    // regions, measured headlessly). The centre takes the MEMBERS' convention: the representation within 180° of them.
    let lonC = Math.atan2(y, x) / R2;
    const lonRef = pts[0][1];
    while (lonC - lonRef > 180) lonC -= 360;
    while (lonRef - lonC > 180) lonC += 360;
    centre = { lat: Math.asin(Math.max(-1, Math.min(1, z / m))) / R2, lon: lonC };
    radiusDeg = pts.reduce((mx, q) => Math.max(mx, gc([centre.lat, centre.lon], q)), 0);
  }
  // ⚠️ a one-member region has radius 0, and Erik's Foothills split produced NINE of them. A map of one
  // town is a map of the country around it, so a floor applies — in ground degrees, which a circle
  // measures natively and a box never did.
  const r = Math.max(3, radiusDeg * (1 + padFrac));
  const conv = Math.max(0.12, Math.cos(centre.lat * R2));
  return {
    centre, radiusDeg: r, members: pts.length,
    // the drawing window, derived FROM the circle so the two can never disagree
    la0: Math.max(-90, centre.lat - r), la1: Math.min(90, centre.lat + r),
    lo0: centre.lon - Math.min(180, r / conv), lo1: centre.lon + Math.min(180, r / conv),
    // a circle that swallows a hemisphere has no useful 2D map and wants splitting
    global: r > 80,
    // ⛔ AND NEITHER HAS A CIRCLE ON THE POLE. `conv` is clamped at 0.12 because near the pole a degree of
    // longitude is almost no ground at all — but the clamp does not make the box true, it only stops it being
    // infinite. MEASURED on `the_center`: 11 places spanning **0.76° of actual ground** get a box **171° of
    // longitude wide**, and 10 of its own 11 members fall OUTSIDE it. Twelve real roads drew nothing.
    // ⚠️ A CALLER MUST SAY SO RATHER THAN DRAW AN EMPTY FRAME. At the pole longitude carries no ground
    // distance, so two places 0.1° apart land on opposite sides of the map; no rectangle fixes that, only a
    // polar projection or a world that does not stack a country on the axis. Both are above this function.
    polar: conv <= 0.12,
    // ⛑ C1 — WHAT A POLAR BASE NEEDS, worked out here because this is the one function that walks the members.
    // The projection centre is the POLE, never the authored centre: at colatitude 0.3 a "centre longitude" is not
    // the middle of anything. ⚠️ R IS NOT `radiusDeg`: that is a bounding circle about the authored centre, while
    // this is how far the farthest member sits from the AXIS, which is what sets the frame of a hub map.
    // ✅ AEVI: *"Frame radius R = the farthest member × 1.25, floor 0.6°, not the general 3° floor. That floor
    // would make eleven places a dot."*
    pole: centre.lat < 0 ? -1 : 1,
    poleRadiusDeg: Math.max(0.6, 1.25 * pts.reduce((mx, q) => Math.max(mx, Math.abs(Math.abs(q[0]) - 90)), 0)),
  };
}

/** ⛔ SNG-423 — A ROAD THAT LEAVES THE REGION RUNS OFF THE EDGE; IT DOES NOT CROSS THE MAP TO GET THERE.
 *  Measured on the Echo Vale: **3 roads inside the region and 20 leaving it.** Drawing each leaver all
 *  the way to its far endpoint streaked twenty long lines across a frame that contains three real roads,
 *  and because many of them leave toward the same distant country they arrived as near-parallel bundles
 *  — which is exactly what Erik saw: *"you would have two nearly parallel roads usually."*
 *
 *  ⚠️ A REGIONAL MAP EXITS ITS ROADS AT THE FRAME, the way every paper road atlas does: the road goes to
 *  the edge, and a label says where it is going. That is more informative than the full line, not less —
 *  the full line's far end was never on this map anyway, and its direction was the only true thing about it.
 *
 *  Returns the clipped end point plus the exit side, so the caller can letter it. */
export function clipToFrame(from, to, extent) {
  // parametric clip of the segment from→to against the extent rectangle, in lon/lat space
  const dLon = to.lon - from.lon, dLat = to.lat - from.lat;
  let tMax = 1;
  const slab = (p, q) => { // p + t*q inside [lo, hi]
    if (Math.abs(q.d) < 1e-12) return;
    const t1 = (q.lo - p) / q.d, t2 = (q.hi - p) / q.d;
    const enter = Math.min(t1, t2), exit = Math.max(t1, t2);
    if (exit < tMax) tMax = Math.max(0, exit);
    if (enter > 0) tMax = Math.min(tMax, Math.max(0, enter));
  };
  slab(from.lon, { d: dLon, lo: extent.lo0, hi: extent.lo1 });
  slab(from.lat, { d: dLat, lo: extent.la0, hi: extent.la1 });
  const t = Math.max(0, Math.min(1, tMax));
  const end = { lon: from.lon + dLon * t, lat: from.lat + dLat * t };
  return { end, clipped: t < 0.999, t };
}

/** ⛔ SNG-422 — A ROAD NETWORK IS NOT A LIST OF EDGES, and drawing it as one produced exactly the
 *  artefact Erik named: *"you're drawing roads just by connecting places, but you need to think about
 *  people travelling. They take the road to the next town or crossroads then choose the next leg. You
 *  would have two nearly parallel roads usually."*
 *
 *  ⚠️ MEASURED: at a detour tolerance of only 1.05×, **114 of 182 connection edges are redundant** —
 *  there is another place on the way, so a traveller goes through it and the direct line is a second
 *  road running alongside the first two. 68 edges are real roads; the rest are the same journeys drawn
 *  twice.
 *
 *  ⛔ THIS DISCARDS NO CONNECTION. The graph stays canon for travel; what changes is that a connection is
 *  DRAWN as the legs that realise it. A→C is on the map — as A→B followed by B→C — which is how someone
 *  walking it would describe the route anyway.
 *
 *  ⚠️ And the through-place must be genuinely on the way: `k` is how much longer the two legs may be than
 *  the direct line before the direct line earns its own road. */
export function roadNetwork(locations, { k = 1.08 } = {}) {
  const R2 = Math.PI / 180;
  const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1,
    Math.sin(a[0] * R2) * Math.sin(b[0] * R2) +
    Math.cos(a[0] * R2) * Math.cos(b[0] * R2) * Math.cos((a[1] - b[1]) * R2)))) / R2;
  const P = {};
  for (const id of Object.keys(locations || {})) {
    const l = locations[id];
    if (l?.worldPos) P[id] = [l.worldPos.colatitude - 90, l.worldPos.longitude];
  }
  const ids = Object.keys(P);
  const edges = [], seen = new Set();
  for (const id of ids) {
    for (const o of locations[id].connections || []) {
      if (!P[o]) continue;
      const key = id < o ? id + "|" + o : o + "|" + id;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: id, b: o, d: gc(P[id], P[o]) });
    }
  }
  // ⚠️ LONGEST FIRST. A long edge is the one most likely to have a town on the way, and testing it
  // against everything else first means the short legs it decomposes into survive to carry it.
  edges.sort((x, y) => y.d - x.d);
  // ⛔ THE THROUGH-TOWN MUST BE SOMEWHERE YOU CAN ACTUALLY DRIVE TO, and my first version forgot to check.
  // It folded A→C via any place that merely SAT on the line — so it folded journeys onto legs that do not
  // exist as roads: 111 of 114 folded edges became unwalkable and 47 places were cut off the network
  // entirely. ⚠️ "They take the road to the next town" only holds if there IS a road to that town.
  const nbr = {};
  for (const e of edges) { (nbr[e.a] = nbr[e.a] || new Set()).add(e.b); (nbr[e.b] = nbr[e.b] || new Set()).add(e.a); }
  const kept = [], dropped = [];
  const live = new Set(edges.map((e) => (e.a < e.b ? e.a + "|" + e.b : e.b + "|" + e.a)));
  const has = (x, y) => live.has(x < y ? x + "|" + y : y + "|" + x);
  for (const e of edges) {
    let via = null;
    // only a shared neighbour can carry the journey — both legs must be roads that survive
    for (const m of (nbr[e.a] || [])) {
      if (m === e.b || !nbr[e.b]?.has(m)) continue;
      if (gc(P[e.a], P[m]) + gc(P[m], P[e.b]) <= k * e.d && has(e.a, m) && has(m, e.b)) { via = m; break; }
    }
    if (via) {
      dropped.push({ ...e, via });
      // ⚠️ the edge stops being a candidate carrier the moment it is folded, or two edges can fold onto
      // each other and both disappear — the pair that takes a journey must still be on the map
      live.delete(e.a < e.b ? e.a + "|" + e.b : e.b + "|" + e.a);
    } else kept.push(e);
  }
  return { roads: kept, folded: dropped, positions: P };
}

/** ⛔ ROADS THAT ARE ROADS — each connection routed least-cost over the real ground, instead of an arc drawn
 *  between two dots. (AEVI B3, from Erik: *"the map itself should show roads between the places."*)
 *
 *  ⛑ THE CONNECTION GRAPH IS UNTOUCHED. `roadNetwork` still says WHICH places are joined and `walkingDays` still
 *  says HOW FAR; this changes only the line. A road that looked like a straight hop over a ridge now goes round it,
 *  and the hop still takes the same number of days.
 *
 *  ⚠️ A USED CELL COSTS `reuse` (0.32), SO ROADS JOIN INTO TRUNKS. Routed independently they run as a bundle of
 *  near-parallel lines through the same pass; made cheap to share, a later road bends to MEET an earlier one and
 *  they travel together, which is how roads actually grow. Primary-first then shortest-first, so trunks form around
 *  the roads that matter and the tracks hang off them.
 *
 *  ⚠️ WHICH MEANS THE ORDER IS PART OF THE RULE, and ties in it must break the same way every run or the same
 *  world routes differently twice. Hence the id tiebreak: without it `sort` is free to reorder equal-length roads
 *  and the trunks move.
 *
 *  ⚠️ AND A RIM PENALTY, or a route slides along the frame edge because that is cheaper than crossing the ground
 *  — an artefact of where the canvas was cut, not a fact about the world.
 *
 *  ⛑ PURE, and expensive (Aevi measured 0.9–3.9s a region): the caller caches. `step` is B1's one ground-cost
 *  rule, handed in; `toScreen`/`toWorld` are the region base's own projection. Returns screen-space paths. */
/** ⛑ Where a segment leaves the grid: a parametric clip of here→away against the cell rectangle, returning the
 *  last cell still inside. That is the EXIT POINT — the spot on the frame a road runs to before it stops. */
function frameCellToward(here, away, gw, gh) {
  const dx = away.x - here.x, dy = away.y - here.y;
  if (!dx && !dy) return null;
  let tMax = 1;
  const slab = (p, d, lo, hi) => {
    if (Math.abs(d) < 1e-12) return;
    const t1 = (lo - p) / d, t2 = (hi - p) / d;
    const exit = Math.max(t1, t2);
    if (exit < tMax) tMax = Math.max(0, exit);
  };
  slab(here.x, dx, 0, gw - 1);
  slab(here.y, dy, 0, gh - 1);
  const x = Math.max(0, Math.min(gw - 1, Math.round(here.x + dx * tMax)));
  const y = Math.max(0, Math.min(gh - 1, Math.round(here.y + dy * tMax)));
  const i = y * gw + x;
  return (i === here.y * gw + here.x) ? null : { x, y, i };
}

export function routeRoads(roads, locations, { W, H, step, toScreen, toWorld, extent = null,
  cell = 2, reuse = 0.32, rim = 4, budgetMs = 0 } = {}) {
  if (!W || !H || typeof step !== "function" || typeof toScreen !== "function" || typeof toWorld !== "function") return null;
  const gw = Math.ceil(W / cell), gh = Math.ceil(H / cell), N = gw * gh;
  // ⚠️ ONE LONGITUDE CONVENTION. A region extent runs UNWRAPPED while a stored longitude is ±180; comparing them
  // raw is the trap that put a power from the far side of the world in Erik's valley (CCODE-595) and drew a road
  // 357° round the planet to join two places 3° apart (CCODE-594).
  const inF = (lon) => {
    // ⛔ C2: a polar frame needs no unwrapping — its `toScreen` is trigonometric, so 252° and −108° are the
    // same bearing and land on the same pixel. Unwrapping against a fabricated box would move them apart.
    if (!extent || extent.polar) return lon;
    const mid = (extent.lo0 + extent.lo1) / 2;
    let v = lon; while (v - mid > 180) v -= 360; while (mid - v > 180) v += 360; return v;
  };
  const cellOf = (id) => {
    const l = locations[id];
    if (!l?.worldPos) return null;
    const s = toScreen(inF(Number(l.worldPos.longitude)), Number(l.worldPos.colatitude) - 90, W, H);
    const x = Math.floor(s.x / cell), y = Math.floor(s.y / cell);
    return { x, y, i: y * gw + x, onFrame: x >= 0 && y >= 0 && x < gw && y < gh, s };
  };
  const world = new Array(N);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) world[y * gw + x] = toWorld(x * cell + cell / 2, y * cell + cell / 2, W, H);
  const atRim = new Uint8Array(N);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) atRim[y * gw + x] = Math.min(x, y, gw - 1 - x, gh - 1 - y) < 3 ? 1 : 0;

  const used = new Uint8Array(N);                       // cells an earlier road already runs through
  const tierOf = (id) => String(locations[id]?.tier || "");
  const lives = (id) => tierOf(id) === "settlement" || tierOf(id) === "region";
  // ⛑ PRIMARY is a road between two places people LIVE in; anything touching a site is a TRACK — somewhere you
  // go TO. That is the whole classification, and it is what decides cased-and-cream against dashed.
  const primary = (e) => lives(e.a) && lives(e.b);

  // ⛑ A HEAP, local on purpose: a binary heap is a DATA STRUCTURE, not a rule. Two copies of a RULE drift — that
  // is what this codebase keeps getting bitten by — and two copies of a heap do not.
  const mkHeap = () => { const k = [], v = []; return {
    get size() { return k.length; },
    push(key, val) { k.push(key); v.push(val); let i = k.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= k[i]) break; [k[p], k[i]] = [k[i], k[p]]; [v[p], v[i]] = [v[i], v[p]]; i = p; } },
    pop() { const key = k[0], val = v[0], lk = k.pop(), lv = v.pop();
      if (k.length) { k[0] = lk; v[0] = lv; for (let i = 0; ;) { const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < k.length && k[l] < k[m]) m = l; if (r < k.length && k[r] < k[m]) m = r; if (m === i) break;
        [k[m], k[i]] = [k[i], k[m]]; [v[m], v[i]] = [v[i], v[m]]; i = m; } }
      return [key, val]; } }; };

  const order = (roads || []).slice().sort((x, y) =>
    (primary(y) ? 1 : 0) - (primary(x) ? 1 : 0)
    || (x.d || 0) - (y.d || 0)
    || `${x.a}\u0000${x.b}`.localeCompare(`${y.a}\u0000${y.b}`));

  const out = [], exits = [];
  const cost = new Float64Array(N), prev = new Int32Array(N);
  const t0 = Date.now();
  let unrouted = 0, ranOut = false;
  for (const e of order) {
    if (budgetMs && Date.now() - t0 > budgetMs) { ranOut = true; unrouted++; continue; }
    const A = cellOf(e.a), B = cellOf(e.b);
    if (!A || !B) { unrouted++; continue; }
    // ⛔ A ROAD THAT LEAVES THE REGION STILL RUNS TO THE EDGE AND STOPS, the way every paper road atlas does
    // (SNG-423). Both ends outside and it is not this region's road at all.
    if (!A.onFrame && !B.onFrame) continue;
    let from = A, to = B, leaving = null;
    if (!A.onFrame || !B.onFrame) {
      const here = A.onFrame ? A : B, away = A.onFrame ? B : A;
      // ⚠️ THE EXIT IS WHERE THE ROAD CROSSES THE FRAME, NOT WHERE THE TOWN IS. My first cut recorded the
      // town's own cell, so every leaving road went undrawn and its label landed on top of the place name
      // instead of out at the edge — a pile of destinations sitting on the one place they are not.
      const edge = frameCellToward(here, away, gw, gh);
      if (!edge) continue;
      from = here; to = edge;
      leaving = { from: A.onFrame ? e.a : e.b, to: A.onFrame ? e.b : e.a };
    }
    cost.fill(Infinity); prev.fill(-1);
    const h = mkHeap();
    cost[from.i] = 0; h.push(0, from.i);
    let done = false;
    while (h.size) {
      const [c, i] = h.pop();
      if (c > cost[i]) continue;
      if (i === to.i) { done = true; break; }
      const x = i % gw, y = (i / gw) | 0, a = world[i];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
        const j = Y * gw + X;
        let w = step(a.lat, a.lon, world[j].lat, world[j].lon);   // the one ground rule
        if (used[j]) w *= reuse;                                   // cheaper where a road already runs
        if (atRim[j]) w *= rim;                                    // dearer along the frame
        const c2 = c + w;
        if (c2 < cost[j]) { cost[j] = c2; prev[j] = i; h.push(c2, j); }
      }
    }
    if (!done) { unrouted++; continue; }
    const path = [];
    for (let i = to.i; i !== -1; i = prev[i]) { path.push(i); if (i === from.i) break; }
    path.reverse();
    // ⚠️ SHARED IS READ BEFORE THE PATH IS MARKED. Marked first, every cell is used and every road reports 1.0.
    const shared = path.length ? path.reduce((n, i) => n + (used[i] ? 1 : 0), 0) / path.length : 0;
    for (const i of path) used[i] = 1;
    const pts = path.map((i) => ({ x: (i % gw) * cell + cell / 2, y: ((i / gw) | 0) * cell + cell / 2 }));
    out.push({
      a: e.a, b: e.b, d: e.d, primary: primary(e), track: !primary(e), shared, points: pts,
      leaves: !!leaving,
    });
    // ⛑ and it says where it is going, which is the only true thing about its far end on this map
    if (leaving) exits.push({ ...leaving, at: pts[pts.length - 1], primary: primary(e) });
  }
  // ⛑ `unrouted` is reported rather than swallowed: a caller that caps the work must be able to tell a finished
  // map from a half-drawn one.
  return { roads: out, exits, unrouted, ranOut, ms: Date.now() - t0, gw, gh, cell };
}

/** ⛔ SNG-421 — A ROAD BENDS BECAUSE SOMEBODY FOUND THE WAY ROUND, so derive the bend from the ground
 *  rather than authoring it. Erik: "the roads are only important in that we need some roads — they can
 *  be redrawn and it sounds like they should be." Aevi's own reason for the Echo Vale's main road is
 *  exactly this shape: *"a straight arc would run it through the worst of the interference; the road
 *  exists because somebody found the way round."*
 *
 *  ⚠️ THE COST FUNCTION IS CLIMB, NOT DISTANCE. A road wants the flattest crossing, not the shortest
 *  one — that is why real roads follow valleys and switchback up passes. Total absolute elevation change
 *  along the path is the thing to minimise, and it produces a bend only where the ground gives a reason.
 *
 *  ⚠️ AND IT RETURNS THE REASON WITH THE PATH. A bend with no cited cause is decoration (Aevi's §4), so
 *  the result carries how much climb the detour saved. If it saves nothing, the straight line is
 *  returned and says so — the honest answer on flat ground is a straight road. */
/** ⛔ ONE GROUND-COST RULE — how hard it is to cross a step of ground. (AEVI B1, 2026-10-04: "Three callers, one
 *  rule.") Before this there was no cost surface at all: `bendRoad` summed raw climb with no water term and no
 *  normalisation, which is a different question from "how hard is this to cross".
 *
 *  ⛑ THE RULE: `distance × (1 + climb·slope² + water·isWater)`, with slope measured against **this region's own
 *  90th percentile**, so "steep" means steep FOR HERE — a 200m rise is nothing in the Palelands and a wall in the
 *  valley. Divided by the TYPICAL step so the terrain BENDS a route without inflating its total.
 *
 *  ⚠️ TWO SETTINGS OF ONE RULE, NOT TWO RULES. Roads care hard about climb and avoid water almost absolutely
 *  (climb 7, water 30 — slope SQUARED, so a gentle grade is nearly free and a cliff is impassable); territory
 *  spreads more softly (climb 1.4, water 2.5). Her numbers, from the prototype, named here so both callers read the
 *  same ones.
 *
 *  ⚠️ ELEVATION THROUGH `elevSmooth`, which is the ONE reader — bilinear and wrap-aware. Her round-1 appendix read
 *  the raw raster instead, and I flagged it: a road bending around a ridge the border runs straight over, on the
 *  same ground, is two readers disagreeing about the shape of the world.
 *
 *  Returns `{ at(lat, lon), step(aLat, aLon, bLat, bLon), slopeRef, typical }`. Pure but for the terrain handed in. */
export const GROUND_COST = {
  road: { climb: 7, water: 30 },        // a road hunts for the pass and does not ford
  territory: { climb: 1.4, water: 2.5 }, // a realm spreads over rough ground, more slowly
};
export function makeGroundCost(t, { climb = 7, water = 30, extent = null, samples = 48 } = {}) {
  const RAD = Math.PI / 180;
  const elevAt = (lat, lon) => elevSmooth(t, lon, lat);
  const wetAt = (lat, lon) => { const s = sampleAt(t, lon, lat); return s ? (s.type & 3) === 0 : false; };
  // ⛑ THE REGION'S OWN 90th PERCENTILE. Sampled over the extent when one is given, else over the whole world — a
  // global reference would call the valley flat and the Palelands sheer, which is the opposite of what is wanted.
  const la0 = extent ? Math.min(extent.la0, extent.la1) : -80, la1 = extent ? Math.max(extent.la0, extent.la1) : 80;
  const lo0 = extent ? extent.lo0 : -180, lo1 = extent ? extent.lo1 : 180;
  // ⛔ C2 — A POLAR REGION'S lon/lat BOX IS A FABRICATION, so sampling it would take this reference across 171°
  // of longitude for a city 0.6° wide. Sample the DISC instead: an even grid in the projected plane, which is an
  // even grid on the ground. ⚠️ Same trap as the two longitude conventions, from the other side (Aevi, C2).
  const polar = !!extent?.polar;
  const pole = extent?.pole || -1, R = extent?.poleRadiusDeg || 1;
  const DEG = 180 / Math.PI;
  const diffs = [];
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      let lat, lon;
      if (polar) {
        const u = -R + ((i + 0.5) / samples) * 2 * R, v = -R + ((j + 0.5) / samples) * 2 * R;
        const rho = Math.hypot(u, v);
        if (rho > R) continue;                              // outside the disc is not this region's ground
        lat = pole < 0 ? rho - 90 : 90 - rho;
        lon = Math.atan2(u, v) * DEG;
      } else {
        lat = la0 + (la1 - la0) * ((i + 0.5) / samples);
        lon = lo0 + (lo1 - lo0) * ((j + 0.5) / samples);
      }
      if (wetAt(lat, lon)) continue;                       // ⚠️ the sea is flat and would drag the reference down
      // ⛑ the sample spacing is the DISC's where the frame is polar — a gradient needs the true ground distance
      // between its two samples, and (la1-la0)/samples would be the fabricated box's again.
      const dLat = polar ? (2 * R) / samples : (la1 - la0) / samples;
      const dLon = polar ? (2 * R) / samples / Math.max(1e-6, Math.cos(lat * RAD)) : (lo1 - lo0) / samples;
      // ⛔ A GRADIENT, NOT A RISE — rise per DEGREE of ground, so each side divides by its own distance.
      // ⚠️ AEVI, CCODE-596: *"the ground-cost slope is a rise, not a gradient… so almost nothing bends a
      // road."* She found it by opening the valley in the game: the main east–west road ran ruler-straight
      // across a frame the map draws contour after contour over, and I had looked at the same picture and
      // called it flat ground.
      // ⚠️ THE REAL FAULT IS THAT THE COST DEPENDED ON THE CANVAS. This reference was a rise measured a
      // forty-eighth of the region apart, and `step` compared it against a rise across ONE ROUTING CELL — so
      // the same terrain priced differently at cell 2 and cell 4, and on a bigger canvas the ground got
      // flatter. MEASURED before the fix: the climb term averaged **0.043 against a base of 1**, about 4% of
      // what B1 intended, and `min(1.5, …)` never came close to binding.
      const clRef = Math.max(1e-6, Math.cos(lat * RAD));
      diffs.push(Math.abs(elevAt(lat + dLat, lon) - elevAt(lat, lon)) / dLat);
      diffs.push(Math.abs(elevAt(lat, lon + dLon) - elevAt(lat, lon)) / (dLon * clRef));
    }
  }
  diffs.sort((a, b) => a - b);
  const slopeRef = Math.max(1e-6, diffs[Math.floor(diffs.length * 0.9)] || 1e-6);
  // ⚠️ NORMALISED BY THE TYPICAL STEP, so terrain bends a route rather than making every route longer. Without
  // this a rough region's realms would simply be smaller, which is a claim about the world nobody made.
  const mults = diffs.map((d) => 1 + climb * Math.min(1.5, d / slopeRef) ** 2).sort((a, b) => a - b);
  const typical = mults[Math.floor(mults.length / 2)] || 1;
  /** the multiplier at a point: 1 on easy dry ground, higher on a slope, much higher in water.
   *  ⚠️ `slope` is a GRADIENT — rise per degree of ground — and so is `slopeRef`. Passing a bare rise here
   *  is the CCODE-598 defect: it makes the climb term depend on how long the step happened to be. */
  const at = (lat, lon, slope = 0) =>
    (1 + climb * Math.min(1.5, slope / slopeRef) ** 2 + water * (wetAt(lat, lon) ? 1 : 0)) / typical;
  /** the cost of ONE step a→b: ground distance × the multiplier of the ground it lands on */
  const step = (aLat, aLon, bLat, bLon) => {
    const cl = Math.cos(((aLat + bLat) / 2) * RAD);
    const d = Math.hypot(bLat - aLat, (bLon - aLon) * cl);
    // ⛑ …and the other side of the same comparison: rise per degree, so a step of any length prices the
    // same slope the same way. This is what makes the surface SCALE-INVARIANT, which is the property §417 gates.
    const rise = Math.abs(elevAt(bLat, bLon) - elevAt(aLat, aLon));
    return d * at(bLat, bLon, d > 1e-12 ? rise / d : 0);
  };
  return { at, step, slopeRef, typical, elevAt, wetAt };
}

export function bendRoad(t, a, b, { samples = 9, offsets = 7, maxOffsetFrac = 0.28, cost = null } = {}) {
  const R2 = Math.PI / 180;
  const elevAt = (lat, lon) => elevSmooth(t, lon, lat);
  // ⛔ THE SHORT WAY ROUND. `b[1] - a[1]` raw sends a road whose ends straddle the 0°/360° seam ALL THE WAY AROUND
  // THE WORLD: the Lampless Market and the Slow Stair are 3° apart and it drew 357°. Measured 2026-10-04 while
  // checking what B1 changed — 35 of 224 real segments, 15.6%, every one of them since bendRoad shipped. A 112°
  // "midpoint shift" on a bend capped at 0.28 of the separation is arithmetically impossible, and that is what made
  // me look rather than file the number.
  // ⚠️ WRAPPED ONCE, HERE, so no path below can take the long way: every use of the difference reads `dLonTotal`.
  const dLonTotal = ((b[1] - a[1] + 540) % 360) - 180;
  const along = (f, offDeg) => {
    // a point at fraction f along a→b, pushed sideways by offDeg (perpendicular, in ground degrees)
    const lat = a[0] + (b[0] - a[0]) * f, lon = a[1] + dLonTotal * f;
    const dLat = b[0] - a[0], dLon = dLonTotal * Math.cos(lat * R2);
    const m = Math.hypot(dLat, dLon) || 1;
    const pLat = -dLon / m, pLon = dLat / m;                   // unit perpendicular, ground-corrected
    return [lat + pLat * offDeg, lon + (pLon * offDeg) / Math.max(0.12, Math.cos(lat * R2))];
  };
  // ✅ AEVI B1 — PRICED BY THE ONE RULE. ⚠️ This used to sum raw |Δelevation| and knew nothing about water, so a
  // road would happily bend across a bay to save a hill. `groundCost` prices slope SQUARED against the region's own
  // 90th percentile and charges for water, which is the same question the territory spread and the road router ask.
  // ⛑ The cost surface is handed in when the caller has one (it is expensive to build and worth reusing); without
  // one, bendRoad builds its own over the whole world, which is what every existing caller gets.
  const G = cost || makeGroundCost(t, GROUND_COST.road);
  const climbOf = (offDeg) => {
    let sum = 0, prev = null;
    for (let i = 0; i <= samples; i++) {
      const f = i / samples;
      // the deviation eases in and out — a road leaves and rejoins its endpoints, it does not start bent
      const w = Math.sin(Math.PI * f);
      const p = along(f, offDeg * w);
      if (prev !== null) sum += G.step(prev[0], prev[1], p[0], p[1]);
      prev = p;
    }
    return sum;
  };
  const sep = Math.hypot(b[0] - a[0], dLonTotal * Math.cos(((a[0] + b[0]) / 2) * R2));
  const maxOff = sep * maxOffsetFrac;
  let best = { off: 0, climb: climbOf(0) };
  const straight = best.climb;
  for (let k = 1; k <= offsets; k++) {
    for (const sgn of [-1, 1]) {
      const off = (k / offsets) * maxOff * sgn;
      const c = climbOf(off);
      if (c < best.climb) best = { off, climb: c };
    }
  }
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const f = i / samples;
    pts.push(along(f, best.off * Math.sin(Math.PI * f)));
  }
  const saved = straight - best.climb;
  return {
    points: pts,
    bent: Math.abs(best.off) > 1e-9,
    // ⚠️ the reason, in the units the decision was made in — a bend that saved nothing is not a bend
    why: Math.abs(best.off) > 1e-9
      ? `bends ${best.off > 0 ? "left" : "right"} to save ${saved.toFixed(2)} of ${straight.toFixed(2)} in ground cost`
      : "runs straight — no detour on this ground costs less",
    climbSaved: saved, straightClimb: straight,
  };
}

/** ⛔ SNG-409 §5 — A CONTESTED AREA LOOKS LIKE AN AREA. "No location in this world has a boundary — all
 *  135 are points, including the 25 marked `tier: region`. A contested territory currently looks like a
 *  village."
 *
 *  ⛔ THE FICTION IS THE FORMULA, and it is hers: the Disputed Zone is "the band of broken country where
 *  harmonic and radiant power fields interfere", which makes it an ELLIPSE about the two powers —
 *  `d_a + d_b ≤ k × separation`. ⚠️ She had already corrected her own first attempt, and the correction
 *  is worth keeping in view: equidistance is NOT betweenness. The Great Coliseum is exactly equidistant
 *  from both powers and sits far off to the side; an asymmetry test admitted it and an ellipse does not.
 *
 *  ⚠️ RETURNS A FIELD, NOT A POLYGON. Her acceptance is "the zone reads as a band with NO CLEAN EDGE —
 *  the fiction says shimmer-vortices wander", so this gives an insideness from 1 at the foci to 0 past
 *  the boundary and the caller tints by it. A drawn outline would assert a precision the world denies. */
export function areaFieldAt(area, lon, lat) {
  if (!area?.foci || area.foci.length < 2) return 0;
  const R2 = Math.PI / 180;
  const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1,
    Math.sin(a[0] * R2) * Math.sin(b[0] * R2) +
    Math.cos(a[0] * R2) * Math.cos(b[0] * R2) * Math.cos((a[1] - b[1]) * R2)))) / R2;
  const p = [lat, lon];
  const dA = gc(p, [area.foci[0].lat, area.foci[0].lon]);
  const dB = gc(p, [area.foci[1].lat, area.foci[1].lon]);
  const sep = area.separationDeg || gc([area.foci[0].lat, area.foci[0].lon], [area.foci[1].lat, area.foci[1].lon]);
  const k = area.k || 1.35;
  const sum = dA + dB;
  const bound = k * sep;
  if (sum >= bound) return 0;
  // ⚠️ soft toward the rim: 1 along the line between the powers, falling to 0 at the boundary, so the
  // band has no edge to point at — which is the whole of her acceptance test.
  const t = (bound - sum) / Math.max(1e-9, bound - sep);
  return Math.max(0, Math.min(1, t));
}

/** ⛔ MEMBERSHIP IS COMPUTED, NEVER READ FROM `parentId` — her one load-bearing constraint, and she gave
 *  the measurement that forces it: "only 1 of the Fringe's 8 children is actually in the band; the other
 *  7 span 288° of longitude. The graph is wrong by measurement." */
export function areaMembers(area, locations) {
  const out = [];
  for (const id of Object.keys(locations || {})) {
    const l = locations[id];
    if (!l?.worldPos) continue;
    if (areaFieldAt(area, l.worldPos.longitude, l.worldPos.colatitude - 90) > 0) out.push(id);
  }
  return out.sort();
}

/** ⛔ SNG-409 §3 — THE THREE NETWORKS, AND THEIR INDEPENDENCE IS THE POINT. Aevi: "Precursors laid the
 *  lines, someone else built the gates, and people walk neither. That is why `wake_the_line` exists as a
 *  craft — you only rouse a road nobody has been using. The map is the only place a player can see it."
 *  She measured it: waygates sit a median 6.32° from the nearest precursor span, against 2.15° for a
 *  random location — and she flagged her own first null as biased, since a network BUILT FROM locations
 *  guarantees locations sit near it.
 *
 *  ⚠️ ROADS ARE DERIVED, NOT AUTHORED — a road is a `connections` edge between two placed locations, so
 *  it costs no payload and cannot fall out of sync with the graph a player actually walks.
 *
 *  ⛔ PRECURSOR SPANS RUN UNDER THE GROUND, which is her rendering note and not a style choice: they are
 *  drawn at a radius INSIDE the sphere, so the horizon occludes them earlier than the surface and they
 *  read as buried. ⚠️ And they are not shown by default — `old_roads` is the craft that senses them, so
 *  a player without it sees roads and gates and no lines, which is exactly the fiction.
 *
 *  Great-circle arcs, subdivided, because a straight screen line between two far points is not the path
 *  the world takes and would cross the limb wrongly. */
/* ═════ ✅ ERIK, 2026-10-06: *"the world map needs the roads updates like the region map has now."* ═════
 *
 * ⛔ AND HE IS RIGHT TWICE OVER, because the globe's roads were doing LESS than they look:
 *   · every edge was a straight great-circle arc — no terrain at all, so a road ran over a mountain range
 *     exactly as readily as along a valley, while the region map walks the ground;
 *   · every edge drew the SAME — 0.9px of cream at 0.42 alpha — so a trunk between two seats and a track to
 *     an outlying site were indistinguishable;
 *   · and `bendRoad`, which exists to bend a road over terrain and carries its own measured bug-fix from the
 *     ±180 seam, HAS NEVER BEEN CALLED. Imported into app.js and called by nothing: the four-doors shape, in
 *     the one place a player looks at the whole world.
 *
 * ⛑ WHAT IS NOT COPIED FROM THE REGION MAP, AND WHY. The region map ROUTES: a least-cost walk over a 2px
 * grid, up to three seconds for one region. That is right there — you can see the ground it is avoiding — and
 * it would be wrong here: at world span a mountain is a few pixels, the walk would cost seconds on every view
 * change, and nobody could see what it bought. `bendRoad` is the world-scale answer: a handful of samples per
 * road, bent toward the cheaper ground, computed once per terrain and cached by the caller. */
export function networkPaths(t, view, { locations, precursor, showPrecursor = false, canvasPx = 700,
  bend = null, tierOf = null } = {}) {
  const arc = (a, b, radius, steps) => {
    // spherical interpolation between two [lat, lon] points, projected per step
    const R2 = Math.PI / 180;
    const v = (p) => [Math.cos(p[0] * R2) * Math.cos(p[1] * R2), Math.cos(p[0] * R2) * Math.sin(p[1] * R2), Math.sin(p[0] * R2)];
    const A = v(a), B = v(b);
    const dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    const om = Math.acos(dot);
    const n = Math.max(2, Math.min(64, steps || Math.ceil((om * 180 / Math.PI) / 2) + 2));
    const runs = []; let run = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      let x, y, z;
      if (om < 1e-9) { x = A[0]; y = A[1]; z = A[2]; }
      else {
        const s1 = Math.sin((1 - f) * om) / Math.sin(om), s2 = Math.sin(f * om) / Math.sin(om);
        x = A[0] * s1 + B[0] * s2; y = A[1] * s1 + B[1] * s2; z = A[2] * s1 + B[2] * s2;
      }
      const lat = Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI;
      const lon = Math.atan2(y, x) * 180 / Math.PI;
      const pr = project(lon, lat, view, radius);
      if (!pr) { if (run.length > 1) runs.push(run); run = []; continue; }
      run.push([pr.x, pr.y]);
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };

  const span = spanDeg(view, canvasPx);
  // ⛔ TWO FADES, BECAUSE A TRUNK AND A TRACK ARE NOT THE SAME CLAIM AT THE SAME SCALE.
  // ✅ ERIK, 2026-10-06, looking at the WORLD view: *"the world map needs the roads updates."* ⚠️ At the
  // opening span of 180° there were no roads AT ALL — one fade governed everything and it reaches zero above
  // 90°, so the tier whose whole question is *which Reach am I in* showed a world with no ways between its
  // Reaches. ⛑ The fade was right about TRACKS: 75 paths to outlying sites at world span is a hairball that
  // says nothing. It was wrong about TRUNKS: the ways between places people live ARE the shape of the world,
  // and they come in from 150°, faint, so the first thing you see is that the Reaches are connected.
  const out = {
    roads: [], precursor: [],
    fade: Math.min(1, Math.max(0, (90 - span) / 30)),          // tracks, the precursor lines, hydrology
    /* ⛔ THE TRUNKS KEEP A FLOOR, because the view the player OPENS on is the one they judge the map by.
     * ⚠️ This was `(200 - span) / 70`, which is 0.29 at the full 180° globe — and `fade` (the tracks) is a
     * hard 0 anywhere above 90°. So the opening view showed 115 trunk roads at under a third alpha and
     * nothing else, which with a five-pixel bend is exactly ✅ Erik's *"straight line routes"*. The trunks
     * are the thing he asked to see; the tracks still fade out, because a site track at hemisphere scale is
     * a texture rather than information. */
    trunkFade: Math.min(1, Math.max(0.62, (260 - span) / 110)),    // the ways between places people live, faint at the full globe
  };
  if (out.fade <= 0 && out.trunkFade <= 0) return out;

  // roads — every connection edge, drawn once per pair
  // ⚠️ A ROAD IS A TRUNK OR A TRACK, and the distinction is the same one the region map draws: a way between
  // two places people live is a road, a way ending at a SITE is a path to something. `tierOf` is injected so
  // this module still reads no content of its own.
  const seen = new Set();
  const tier = typeof tierOf === "function" ? tierOf : (l) => l?.tier;
  for (const id of Object.keys(locations || {})) {
    const l = locations[id];
    if (!l?.worldPos) continue;
    for (const other of l.connections || []) {
      const key = id < other ? id + "|" + other : other + "|" + id;
      if (seen.has(key)) continue;
      seen.add(key);
      const o2 = locations[other];
      if (!o2?.worldPos) continue;
      const a = [l.worldPos.colatitude - 90, l.worldPos.longitude];
      const b = [o2.worldPos.colatitude - 90, o2.worldPos.longitude];
      const primary = tier(l) !== "site" && tier(o2) !== "site";
      // ⛔ BENT OVER THE GROUND WHEN THE CALLER SUPPLIES A BEND, straight when it does not — so a caller with
      // no terrain in hand still gets a map, which is what `fade` already promises at a wide span.
      // ⛑ THE IDS RIDE ALONG. A routed path is stored per PAIR, and keying a lookup on rounded coordinates
      // instead would be a second identity for a thing that already has one.
      const pts = bend ? bend(a, b, id, other) : null;
      // ✅ AEVI W1 (SNG-682): a bend that answers `false` has NOTHING cached for this road on a moving frame — the road is
      // not drawn, rather than drawn straight. `null` still means "no route": the arc, as on a settled frame.
      if (pts === false) continue;
      const runs = [];
      if (pts && pts.length > 1) {
        // ⛑ ONE CHAIN, NOT A RUN PER SEGMENT. Arcing each segment separately gave 1,637 runs for 226 roads —
        // eight `beginPath`s per road, each stroked and cased on its own, which both costs and leaves a seam at
        // every join where two casings meet. The bent path is walked ONCE and broken only where the projection
        // fails, which is the limb, exactly as `arc` breaks a single segment.
        let run = [];
        for (const pt of pts) {
          const pr = project(pt[1], pt[0], view, 1.0);
          if (!pr) { if (run.length > 1) runs.push(run); run = []; continue; }
          run.push([pr.x, pr.y]);
        }
        if (run.length > 1) runs.push(run);
      } else {
        for (const run of arc(a, b, 1.0)) runs.push(run);
      }
      for (const run of runs) out.roads.push({ run, primary });
    }
  }

  if (showPrecursor && precursor?.spans) {
    const byId = {};
    for (const n of precursor.nodes || []) byId[n.id] = n;
    for (const sp of precursor.spans) {
      const a = byId[sp.a], b = byId[sp.b];
      if (!a || !b) continue;
      // ⚠️ 0.985 — inside the sphere, so the limb hides them sooner than the surface: buried, not painted on
      for (const run of arc([a.lat, a.lon], [b.lat, b.lon], 0.985)) out.precursor.push(run);
    }
  }
  return out;
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
    if (p) out.push({ id, name: m.n || id, region: m.r || null, waygate: !!m.wg,
      // ⚠️ KIND IS READ, NEVER DERIVED. tier and role are canon (SNG-396/398 ratified them) and the
      // pipeline stamps them into the asset; a viewer that inferred "this looks like a hold" would be
      // the second-source-of-truth mistake that worldPos is already gated against.
      tier: m.t || null, role: m.ro || null, kind: markerKind(m), placeKind: m.k || null,
      x: p.x, y: p.y, z: p.z });
  }
  return out.sort((a, b) => a.z - b.z);
}

/* ═════ SNG-677 · THE WORLD MAP'S ROADS ARE ROUTED, NOT ARCED ═════
 * ✅ ERIK, 2026-10-06: *"The world map still shows the straight line routes between places. It needs to show
 * the drawn roads from the region maps (at least the major trunks)."* ⛔ HE IS RIGHT AND I MEASURED BOTH.
 * `bendRoad` — what CCODE-620 shipped — is a ONE-PARAMETER ARC: nine samples, seven candidate sideways
 * offsets, capped at 0.28 of the separation. Measured as a fraction of each road's own length, its median
 * bend is 8.2% (p90 29%). The region map's roads are a least-cost WALK, and routed over a world grid the
 * same roads bend a median 23.5% (p90 79%, max 216% — a road that goes right around something), with 7 to
 * 229 points instead of nine samples. At the opening 180° view an 8% bend over a 700px canvas is about five
 * pixels. Five pixels is a straight line.
 *
 * ⚠️ WHY NOT JUST RUN THE REGION MAP'S ROUTER: it is measured in this repo at 640ms a region and 2.97s at
 * worst, times 38 regions — about 24 seconds. So this routes ONE world grid instead of 38 regional ones:
 * 194 of 200 roads in ~535ms at 360×180 with a 2px cell, paid ONCE per terrain and cached. The remaining six
 * fall back to the arc, which is what the caller already does when no bend is offered.
 * ⛑ 360×180 rather than 720×360 (2.1s) because the globe's own information floor is about a quarter of a
 * degree — SNG-403 measured that — so a finer grid buys detail the map cannot draw.
 *
 * ⛔ AND THE ±180 SEAM IS GUARDED, because this project has been bitten by it twice: a road drawn 357° round
 * the planet to join two places 3° apart, and a power from the far side of the world placed in Erik's valley.
 * A plate-carrée grid cannot see that the seam is a seam, so any route whose path length wildly exceeds the
 * great-circle distance between its ends is DISCARDED rather than drawn, and the count is returned.
 */
const _worldRoutes = new WeakMap();
export function worldRoadRoutes(t, locations, { tierOf = null, gridW = 360 } = {}) {
  if (!t || !locations) return null;
  let hit = _worldRoutes.get(t);
  const stamp = `${gridW}|${Object.keys(locations).length}`;
  if (hit && hit.stamp === stamp) return hit;

  const gw = gridW, gh = Math.round(gridW / 2);
  const toScreen = (lon, lat) => ({ x: ((lon + 180) / 360) * gw, y: ((90 - lat) / 180) * gh });
  const toWorld = (x, y) => ({ lon: (x / gw) * 360 - 180, lat: 90 - (y / gh) * 180 });
  const extent = { lo0: -180, lo1: 180, la0: -90, la1: 90, polar: false };
  const net = roadNetwork(locations, { tierOf });
  const G = makeGroundCost(t, { ...GROUND_COST.road, extent });
  const t0 = Date.now();
  const out = routeRoads(net.roads, locations, {
    W: gw, H: gh, step: G.step, toScreen, toWorld, extent, cell: 2,
  });
  const byPair = new Map();
  let seamDropped = 0, kept = 0;
  const R2 = Math.PI / 180;
  const gcDeg = (a, b) => Math.acos(Math.max(-1, Math.min(1,
    Math.sin(a[0] * R2) * Math.sin(b[0] * R2) +
    Math.cos(a[0] * R2) * Math.cos(b[0] * R2) * Math.cos((a[1] - b[1]) * R2)))) / R2;
  for (const r of (out?.roads || [])) {
    const pts = r.points || [];
    if (pts.length < 2) continue;
    const path = pts.map((p) => { const w = toWorld(p.x, p.y); return [w.lat, w.lon]; });
    // ⛔ the seam guard: walk the path in ground degrees and compare to the straight-line separation
    let walked = 0;
    for (let i = 1; i < path.length; i++) walked += gcDeg(path[i - 1], path[i]);
    const straight = gcDeg(path[0], path[path.length - 1]);
    if (straight > 0.5 && walked > straight * 4) { seamDropped++; continue; }
    const key = r.a < r.b ? `${r.a}|${r.b}` : `${r.b}|${r.a}`;
    byPair.set(key, path);
    kept++;
  }
  hit = { stamp, byPair, kept, seamDropped, input: net.roads.length, ms: Date.now() - t0, gw, gh };
  _worldRoutes.set(t, hit);
  return hit;
}
