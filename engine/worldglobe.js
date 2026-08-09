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
  };
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
export function groundFactorAt(t, lon, lat, band, bandFn) {
  const s = sampleAt(t, lon, lat);
  if (!s || !band || typeof bandFn !== "function") return null;
  return bandFn(band, s.density);
}

/** The colour of one point on one layer. Returns [r,g,b]. */
export function colorAt(t, lon, lat, opts) {
  const o = opts || {};
  const layer = o.layer || "topo";
  const s = sampleAt(t, lon, lat);
  if (!s) return [0, 0, 0];
  if (s.type === 0) {
    const dep = (128 - s.elevation) / 128;
    return [10 + (1 - dep) * 22, 26 + (1 - dep) * 34, 48 + (1 - dep) * 40];
  }
  const sh = hillshade(t, lon, lat);
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

/** The locations to draw, projected and culled to the near face, far-first so near pins draw over them.
 *  ⚠️ `worldPosOf` is INJECTED: this module never reads a location's position itself, so it cannot become
 *  the second source of position Aevi warned about. */
export function visiblePins(t, view, worldPosOf) {
  const out = [];
  for (const id of Object.keys((t && t.locations) || {})) {
    const m = t.locations[id];
    const wp = worldPosOf ? worldPosOf(id) : null;
    if (!wp || !Number.isFinite(wp.longitude) || !Number.isFinite(wp.colatitude)) continue;
    const p = project(wp.longitude, 90 - wp.colatitude, view);
    if (p) out.push({ id, name: m.n || id, region: m.r || null, waygate: !!m.wg, x: p.x, y: p.y, z: p.z });
  }
  return out.sort((a, b) => a.z - b.z);
}
