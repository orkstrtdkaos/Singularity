/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
 * lenses.js — THE GEOMETRY A MAP LENS IS MADE OF, with no canvas in the room
 *
 * ⛔ PURE, AND IMPORTS NOTHING, the same bargain `field.js` and `influence.js` keep. A lens is two separable
 * things: WHERE the marks go, which is arithmetic over a field, and HOW they are inked, which is taste and
 * belongs in the painter. Everything here is the first half, so it can be driven and gated without a browser.
 *
 * ⚠️ AND IT IS SHARED ON PURPOSE. B4 draws the crystal lattice and the veil as contour LINES at the membership
 * level; B5 draws a power's border by contouring its blurred claim at 0.5. That is one algorithm serving two
 * lenses, and writing it twice is how two borders end up disagreeing about what a line through a grid means.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** ⛑ A deterministic hash, so a stipple is the SAME stipple on every repaint. A field lens that re-scattered
 *  its dots each frame would shimmer, and worse, would look like the world was changing when nothing had. */
function hash2(i, j, seed = 0) {
  let h = (i * 374761393 + j * 668265263 + seed * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** ⛔ MARCHING SQUARES — the contour of a scalar grid at `level`, as STITCHED polylines in grid coordinates.
 *
 *  ⚠️ STITCHED, NOT A BAG OF SEGMENTS, and that is the whole reason this is more than twenty lines. A dashed
 *  line drawn over disconnected two-point segments dashes each segment from its own start, so the dashes bunch
 *  at every cell boundary and the line reads as a dotted smear. Aevi's B4 asks for *"solid glowing at 0.55,
 *  dashed at 0.8"* — the dashed one only works on a joined path.
 *
 *  ⛑ Linear interpolation on the crossed edges, so the line sits where the value actually crosses rather than
 *  on the cell boundary — which is the same trick `makeRegionBase` uses for the shoreline. */
export function isoLines(grid, w, h, level, { minPoints = 4 } = {}) {
  if (!grid || w < 2 || h < 2) return [];
  const at = (x, y) => grid[y * w + x];
  const segs = [];
  const lerp = (x0, y0, v0, x1, y1, v1) => {
    const t = Math.abs(v1 - v0) < 1e-12 ? 0.5 : (level - v0) / (v1 - v0);
    return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
  };
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const a = at(x, y), b = at(x + 1, y), c = at(x + 1, y + 1), d = at(x, y + 1);
      let code = 0;
      if (a > level) code |= 8;
      if (b > level) code |= 4;
      if (c > level) code |= 2;
      if (d > level) code |= 1;
      if (code === 0 || code === 15) continue;
      const top = () => lerp(x, y, a, x + 1, y, b);
      const right = () => lerp(x + 1, y, b, x + 1, y + 1, c);
      const bottom = () => lerp(x, y + 1, d, x + 1, y + 1, c);
      const left = () => lerp(x, y, a, x, y + 1, d);
      // ⛑ the two saddle cases (5, 10) are split by the cell's own mean, which is the standard disambiguation
      const mid = (a + b + c + d) / 4;
      switch (code) {
        case 1: case 14: segs.push([left(), bottom()]); break;
        case 2: case 13: segs.push([bottom(), right()]); break;
        case 3: case 12: segs.push([left(), right()]); break;
        case 4: case 11: segs.push([top(), right()]); break;
        case 6: case 9: segs.push([top(), bottom()]); break;
        case 7: case 8: segs.push([left(), top()]); break;
        case 5: if (mid > level) { segs.push([left(), top()]); segs.push([bottom(), right()]); }
                else { segs.push([left(), bottom()]); segs.push([top(), right()]); } break;
        case 10: if (mid > level) { segs.push([top(), right()]); segs.push([left(), bottom()]); }
                 else { segs.push([left(), top()]); segs.push([bottom(), right()]); } break;
      }
    }
  }
  if (!segs.length) return [];

  // ---- stitch: join segments whose endpoints coincide, to within a fraction of a cell ----
  const KEY = (p) => `${Math.round(p[0] * 64)},${Math.round(p[1] * 64)}`;
  const ends = new Map();
  segs.forEach((s, i) => {
    for (const p of [s[0], s[1]]) {
      const k = KEY(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [segs[i][0], segs[i][1]];
    // walk forward from the tail, then backward from the head
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0];
        const cand = (ends.get(KEY(tip)) || []).find((j) => !used[j]);
        if (cand == null) break;
        used[cand] = 1;
        const s = segs[cand];
        const same = KEY(s[0]) === KEY(tip);
        const next = same ? s[1] : s[0];
        if (dir) line.push(next); else line.unshift(next);
      }
    }
    if (line.length >= minPoints) lines.push(line);
  }
  return lines;
}

/** ⛑ A box blur over a grid, separable, `r` cells each way. B5 contours a power's claim AFTER blurring it, so a
 *  border reads as a border and not as the staircase of whatever grid the walk happened to use. */
export function blurGrid(grid, w, h, r = 1) {
  if (!grid || r < 1) return grid;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let k = -r; k <= r; k++) { const X = x + k; if (X < 0 || X >= w) continue; s += grid[y * w + X]; n++; }
    tmp[y * w + x] = s / (n || 1);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let k = -r; k <= r; k++) { const Y = y + k; if (Y < 0 || Y >= h) continue; s += tmp[Y * w + x]; n++; }
    out[y * w + x] = s / (n || 1);
  }
  return out;
}

/** ⛔ B4 · WILD NANITE AS A SCATTERED STIPPLE. One jittered candidate per cell of a coarse grid, kept with
 *  probability equal to the field there — so the DENSITY carries the value and no single dot claims a reading.
 *
 *  ⚠️ SCATTERED MEANS SCATTERED, NOT RANDOM-PER-FRAME: the jitter and the keep are both hashes of the cell, so
 *  the same world stipples identically every repaint. Aevi's word for the wild register is *"scattered"*, and
 *  the thing that makes it read as wild rather than as noise is that it holds still.
 *
 *  `valueAt(x, y)` is in SCREEN pixels and returns 0..1; `keepAt` is an optional mask (land only, inside a disc). */
export function stipple(W, H, valueAt, { cell = 7, seed = 1, keepAt = null, max = 1, floor = 0, cap = 0 } = {}) {
  // ⛔ M4 (SNG-675) — A FLOOR AND A CAP, because "density IS the value" alone fills a frame.
  // ✅ AEVI: *"hundreds of green motes over the whole frame (wild nanite at 27%) … in the mock the motes are
  // SPARSE, drawn only where wild nanite runs high, and capped."*
  // ⚠️ A FIELD THAT IS WEAKLY EVERYWHERE IS THE COMMON CASE, not the edge one: at 0.27 over a 977×513 frame
  // on a 7px grid this scattered ~2,500 dots, which reads as a texture over the whole map rather than as a
  // claim about anywhere. `floor` is the value below which the wild is not worth marking at all.
  // ⛑ AND THE CAP KEEPS THE STRONGEST, NEVER THE FIRST. Truncating the list would bias every capped frame to
  // its top-left corner — the dots are generated in scan order — so a cap sorts by value and keeps the head.
  const out = [];
  const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const jx = hash2(i, j, seed), jy = hash2(i, j, seed + 101);
      const x = (i + jx) * cell, y = (j + jy) * cell;
      if (x >= W || y >= H) continue;
      if (keepAt && !keepAt(x, y)) continue;
      const v = Math.max(0, Math.min(max, Number(valueAt(x, y)) || 0));
      if (v < floor) continue;                           // M4: below this the wild is not worth marking
      if (hash2(i, j, seed + 7919) > v) continue;         // density IS the value
      out.push({ x, y, v });
    }
  }
  if (cap > 0 && out.length > cap) {
    out.sort((a, b) => b.v - a.v);
    out.length = cap;
  }
  return out;
}

/** ⛔ B4 · ORDERED NANITE AS THE SAME DOTS ON A TIDY HEX LATTICE, GATHERED. Aevi: *"density = the field's ordered
 *  value × nearness to a tended point (settlements, and wells at 1.4× reach)"*.
 *
 *  ⛑ THE LATTICE IS THE POINT, and it is why this is not `stipple` with a different argument. The wild register
 *  scatters; the ordered register is the same substance ARRANGED, so its dots sit on a lattice with no jitter at
 *  all. Side by side the two read as one material in two states, which is the thing the map is trying to say.
 *
 *  `gatherAt(x, y)` returns 0..1 nearness to something tended — the caller knows where those are. */
export function hexGather(W, H, valueAt, gatherAt, { pitch = 9, seed = 3, keepAt = null } = {}) {
  const out = [];
  const dy = pitch * Math.sqrt(3) / 2;
  const rows = Math.ceil(H / dy) + 1, cols = Math.ceil(W / pitch) + 1;
  for (let j = 0; j < rows; j++) {
    const y = j * dy;
    for (let i = 0; i < cols; i++) {
      const x = i * pitch + (j % 2 ? pitch / 2 : 0);     // the half-row offset IS the hex lattice
      if (x >= W || y >= H) continue;
      if (keepAt && !keepAt(x, y)) continue;
      const v = Math.max(0, Math.min(1, Number(valueAt(x, y)) || 0));
      const g = Math.max(0, Math.min(1, Number(gatherAt(x, y)) || 0));
      const d = v * g;
      if (d <= 0.02) continue;
      if (hash2(i, j, seed) > d) continue;
      out.push({ x, y, v, g, d });
    }
  }
  return out;
}

/** ⛑ B4 · NEARNESS TO A TENDED POINT. A smooth 1-at-the-centre, 0-at-the-edge falloff over a list of points,
 *  each with its own reach. Aevi gives wells 1.4× the reach of a settlement, because a well is tended harder.
 *  Pure, and screen-space: the caller has already projected its points. */
export function nearness(points, { fallback = 0 } = {}) {
  const pts = (points || []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y) && p.r > 0);
  if (!pts.length) return () => fallback;
  return (x, y) => {
    let best = fallback;
    for (const p of pts) {
      const d = Math.hypot(x - p.x, y - p.y);
      if (d >= p.r) continue;
      const t = 1 - d / p.r;
      const v = t * t * (3 - 2 * t) * (p.w == null ? 1 : p.w);   // smoothstep, so there is no hard rim
      if (v > best) best = v;
    }
    return best;
  };
}

/** ⛔ B4 · A WELL'S RAYS. A faceted crystal: `n` rays round the point, length from |strength|, alternating long
 *  and short so it reads as cut rather than as a star. Returns the points of one closed polygon.
 *  ⛑ The caller inks it; this only says where the facets are. */
export function crystalFacets(x, y, radius, { points = 6, inner = 0.46 } = {}) {
  const out = [];
  const n = Math.max(3, points) * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (i % 2 ? inner : 1);
    out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return out;
}
