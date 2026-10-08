// engine/localground.js — AEVI's LOCAL GROUND, G4 and G5: WHAT STANDS ON A PLACE'S GROUND, PUT WHERE ITS ENTRY SAYS.
//
// ✅ ERIK: *"In some places, you're supposed to have shrines and temples but they're not necessarily on the map. The spent
// yard doesn't show the machinery and reclamation process at all."* ✅ AEVI (G4): *"Every entry draws: marks as glyphs,
// lines as lines, areas as fills, `n` repeated along its `at`. `own` draws at the place's own mark, the first thing the
// eye finds. … Unnamed features carry no label. They're the ground, not places to go."* (G5): *"The ground adds dwellings,
// farms and unnamed features to the 18 authored layouts, and never draws a second copy of a site the authored file already
// names within its radius."*
//
// ⚠️ MEASURED BEFORE (Aevi, on origin): 143 of the 158 places drew no mark at all, not even their own — a generated
// layout's only sites are the sub-places that are already records, so the Kept Shrine drew no shrine.
//
// ⛔ PURE GEOMETRY, NO CANVAS. The model's frame, centre, roads, lanes, water and sites come in; marks, lines and areas in
// pixels come out, each carrying the entry it came from, so the painter only puts ink down and a gate measures the same
// numbers the eye sees. TWO PHASES, because `among` means "mixed in with the houses" and the houses have to keep clear of
// everything else: `placeGround` runs before the houses (and hands them `blocked`), `finishGround` after.
//
// ⛑ G5 IS A COUNT, NOT A SKIP. A site the layout already names, of the glyph a mark would draw, counts as one of that
// entry's `n`, and no ground copy is placed on top of it: Greyhearth's four burial plots are its Burying Grounds and three
// more. An `own` mark is only ever counted against an AUTHORED site — a sub-place record is somewhere inside the place,
// not the place itself.
import { glyphFor } from "./mapicons.mjs";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dirOf = (bearing) => [Math.sin((Number(bearing) || 0) * DEG), -Math.cos((Number(bearing) || 0) * DEG)];

/** The closed vocabulary's three sections, read off `_kinds` by its own markers (`_marks`, `_lines`, `_areas`): every
 *  kind after a marker belongs to it. `drawn` is the glyph the file says the kind can use today, or "new". */
export function groundSections(kinds) {
  const out = { marks: new Set(), lines: new Set(), areas: new Set(), drawn: {} };
  let sec = null;
  for (const [k, v] of Object.entries(kinds || {})) {
    if (k.startsWith("_")) { sec = { _marks: "marks", _lines: "lines", _areas: "areas" }[k] || null; continue; }
    if (!sec) continue;
    out[sec].add(k);
    out.drawn[k] = typeof v === "string" ? v : (v?.drawn || "new");
  }
  return out;
}

/** ⛑ TWO KINDS DRAW ON ANOTHER GROUND GLYPH, said in the reply: a cairn row is `n` cairns, and moored boats are hulls —
 *  `_kinds` gives boats the dock glyph, but Millbrook's four boats beside its River Dock would then read as five docks. */
const GLYPH_OF = Object.freeze({ cairn_row: "cairn", boats: "boat" });
export function groundGlyphOf(k, drawn) {
  if (GLYPH_OF[k]) return GLYPH_OF[k];
  if (drawn && drawn !== "new") return drawn;
  return k;   // the ground alphabet in mapicons.mjs carries the kind's own name
}
/** A shrine is drawn smaller than a temple (`_kinds`: "drawn smaller than a temple"); the rest by what they are. */
const SIZE_OF = Object.freeze({ shrine: 0.8, temple: 1.2, post: 0.75, cairn: 0.85, cairn_row: 0.8, stone_field: 1.1, footings: 1.1,
  boats: 0.85, crane: 1.1, shed: 1.15, leviathan: 1.6, sun_disc: 1.4, solid: 1.2, arena: 1.2, figure: 1.1, stacks: 1.05 });
/** What may stand on a way (a gate across the road, a column on the move); what stands on the water. */
const ON_WAY = new Set(["gate", "bridge", "ford", "column", "cairn_row", "post"]);
const ON_WATER = new Set(["boats", "dock", "leviathan", "bridge", "ford", "mill"]);
const ACROSS_WATER = new Set(["bridge", "ford"]);
/** a wall at `ring` is a ring wall and at `across` a line (`_kinds.wall`) — drawn as a line, not a glyph */
const isWallLine = (f) => f?.k === "wall" && (f.at === "ring" || f.at === "across");
/** how many patches or runs an area or line makes when its entry gives no `n` */
const AREA_N = Object.freeze({ scatter: 4, edge: 2, ring: 6, junctions: 4, among: 3 });
const LINE_N = Object.freeze({ edge: 2, scatter: 4, among: 3, rows: 4 });
/** the lines that are water: marks and houses keep out of them */
const WET_LINES = new Set(["stream", "channel"]);

const segDist = (x, y, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1; const t = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / L2, 0, 1); return Math.hypot(a[0] + vx * t - x, a[1] + vy * t - y); };
export function lineDist(x, y, pts) { let d = Infinity; for (let i = 1; i < (pts || []).length; i++) d = Math.min(d, segDist(x, y, pts[i - 1], pts[i])); return d; }
export function inPoly(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi)) c = !c;
  }
  return c;
}
function blob(cx, cy, r, rnd, wobble = 0.16, n = 18) {
  const pts = [], phase = rnd() * TAU, k1 = 0.6 + rnd() * 0.8, k2 = 0.3 + rnd() * 0.5;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, w = 1 + wobble * (Math.sin(a * 2 + phase) * k1 + Math.sin(a * 5 + phase * 2) * k2 * 0.5);
    pts.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * w]);
  }
  return pts;
}
const arcOf = (pts) => { const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return acc; };
function atArc(pts, acc, t) {
  const T = acc[acc.length - 1]; t = clamp(t, 0, T);
  let i = 1; while (i < acc.length - 1 && acc[i] < t) i++;
  const a = pts[i - 1], b = pts[i], l = (acc[i] - acc[i - 1]) || 1, f = (t - acc[i - 1]) / l;
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, tx: (b[0] - a[0]) / l, ty: (b[1] - a[1]) / l };
}
/** the arc position on a line nearest a point */
function nearestArc(pts, acc, x, y) {
  let best = 0, bd = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1;
    const t = clamp(((x - a[0]) * vx + (y - a[1]) * vy) / L2, 0, 1);
    const d = Math.hypot(a[0] + vx * t - x, a[1] + vy * t - y);
    if (d < bd) { bd = d; best = acc[i - 1] + t * (acc[i] - acc[i - 1]); }
  }
  return best;
}

/** ⛔ PHASE ONE: everything but `among`. Returns `{ marks, lines, areas, kept, short, fallbacks, streamLine, blocked }`.
 *  `blocked(x, y, pad)` is what the houses keep clear of: every mark and site, the water lines and the water and drop
 *  fills. `streamLine` is the entry's own water line, which a `street` layout lines its houses along. */
export function placeGround({ ground, kinds = null, frame, built, roads = [], lanes = [], sites = [], water = null, uphill = null, rnd }) {
  const out = { marks: [], lines: [], areas: [], kept: [], short: [], fallbacks: [], streamLine: null };
  const feats = Array.isArray(ground?.features) ? ground.features : [];
  const S = groundSections(kinds);
  const C = { x: Number(built?.x) || frame.cx, y: Number(built?.y) || frame.cy };
  const R0 = Math.max(18, Number(built?.r) || 0);
  const W = frame.w, H = frame.h, s = frame.pxPerMetre;
  const base = 5.5 * clamp(Math.sqrt(frame.k || 1), 1, 1.6);
  const roadHalf = Math.max(2.2, Math.min(7, 5 * s * 1.6 + 1.6)) / 2 + 1;
  const wayPts = [...roads, ...lanes].map((r) => r.pts).filter((p) => p && p.length > 1);
  const wayD = (x, y) => { let d = Infinity; for (const p of wayPts) d = Math.min(d, lineDist(x, y, p)); return d; };
  const mainRoad = roads[0] || null;
  const mainDir = mainRoad ? dirOf(mainRoad.bearing) : dirOf(rnd() * 360);
  const mainAng = Math.atan2(mainDir[1], mainDir[0]);
  // the gaps between the roads, widest first — where `edge` sits and where the far end of the site is
  const bs = roads.map((r) => (((Number(r.bearing) || 0) % 360) + 360) % 360).sort((a, b) => a - b);
  const gaps = (bs.length ? bs.map((a, i) => { const b = i + 1 < bs.length ? bs[i + 1] : bs[0] + 360; return { from: a, width: b - a }; }) : [{ from: 0, width: 360 }])
    .map((g) => ({ ...g, mid: g.from + g.width / 2 })).sort((p, q) => q.width - p.width);
  /* ⛔ THE SITE'S TWO ENDS. `end` is toward the road the place is entered by; `far_end` is the clearest way from every
   * road, so on the Spent Yard the intake yard sits on the road and the sheds as far from any road as the ground allows —
   * Aevi's `_order`: *"the yard where it comes in, the labelled rows where it waits, the sheds where the rigs cut it down."* */
  const endDir = mainDir;
  const farDir = bs.length ? dirOf(gaps[0].mid) : [-mainDir[0], -mainDir[1]];
  // ⚠️ Number(null) is 0, a bearing: an unmeasured uphill must stay unmeasured, not become due up-map
  const upDir = (uphill != null && uphill !== "" && Number.isFinite(Number(uphill))) ? dirOf(Number(uphill)) : null;
  /* ⛑ NO MEASURED SLOPE: the falling ground (and a sheer drop) goes on the side clearest of every road — a drop the road
   * runs into is a road off a cliff — and the rising ground on the next-clearest side. Said in `fallbacks` each time. */
  const slopeDir = (at) => at === "downhill" ? farDir : (gaps[1] ? dirOf(gaps[1].mid) : [-farDir[0], -farDir[1]]);
  const acrossAng = mainAng + Math.PI / 2 + (rnd() - 0.5) * 0.7;
  const inFrame = (x, y, m) => x >= m && y >= m && x <= W - m && y <= H - m;
  const keepIn = (p, m) => ({ ...p, x: clamp(p.x, m, W - m), y: clamp(p.y, m, H - m) });
  const pointOnRoadAt = (road, dist) => {
    const pts = road?.pts || [];
    for (let i = 1; i < pts.length; i++) {
      const d1 = Math.hypot(pts[i][0] - C.x, pts[i][1] - C.y);
      if (d1 >= dist) {
        const a = pts[i - 1], b = pts[i], d0 = Math.hypot(a[0] - C.x, a[1] - C.y), f = clamp((dist - d0) / ((d1 - d0) || 1), 0, 1);
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, tx: (b[0] - a[0]) / l, ty: (b[1] - a[1]) / l };
      }
    }
    return null;
  };
  const acrossPts = (offset = 0, meander = 0) => {
    const ux = Math.cos(acrossAng), uy = Math.sin(acrossAng), nx = -uy, ny = ux, D = Math.hypot(W, H) * 0.75, ph = rnd() * TAU, pts = [];
    for (let i = 0; i <= 48; i++) {
      const t = -D + (i / 48) * 2 * D;
      const m = meander * (Math.sin(t / (R0 * 0.9) + ph) + 0.4 * Math.sin(t / (R0 * 0.33) + ph * 2));
      pts.push([C.x + ux * t + nx * (offset + m), C.y + uy * t + ny * (offset + m)]);
    }
    return pts;
  };

  // ── the water and the drops everything keeps out of, filled in as the lines and areas are placed
  const wet = [];   // { pts, half } water lines; the place's own river first
  if (water?.channel?.pts) wet.push({ pts: water.channel.pts, half: water.channel.widthPx / 2, river: true });
  const wetAreas = [];   // polygons
  const waterGap = (x, y) => {
    let g = Infinity;
    for (const w of wet) g = Math.min(g, lineDist(x, y, w.pts) - w.half);
    for (const p of wetAreas) if (inPoly(x, y, p)) return -1;
    return g;
  };
  const occ = sites.map((st) => ({ x: st.x, y: st.y, r: 8 * clamp(Math.sqrt(frame.k || 1), 1, 1.6) }));

  // ════ LINES ════
  const lineEntries = feats.map((f, i) => ({ f, i })).filter(({ f }) => S.lines.has(f.k) || isWallLine(f));
  let acrossCount = 0;
  for (const { f, i } of lineEntries) {
    // ⛑ a kind the vocabulary has and the painter has not is SAID, not drawn as something else
    if (!GROUND_LINE_KINDS.includes(f.k)) { out.short.push({ k: f.k, entry: i, want: 1, placed: 0, why: "no painter for this line kind yet" }); continue; }
    const n = Math.max(1, Math.round(Number(f.n) || LINE_N[f.at] || 1));
    const half = f.k === "stream" ? clamp(5 * s, 1.5, 4) : f.k === "channel" ? clamp(4 * s, 1.5, 3.5) : f.k === "wall" ? 1.6 : 1;
    const meander = ["stream", "path", "hedgerow", "trench"].includes(f.k) ? R0 * 0.07 : 0;
    const runs = [];
    const at = f.at;
    if (at === "across" || (at === "along" && !roads.length)) {
      // ⛑ the first runs a little off the centre — the centre is the place's own mark, and a stream through it drowned it
      for (let j = 0; j < n; j++) { const k = acrossCount + j; runs.push(acrossPts(R0 * (0.2 + 0.42 * k) * (k % 2 ? -1 : 1), meander)); }
      acrossCount++;
    } else if (at === "along") {
      for (let j = 0; j < n; j++) {
        const r = roads[j % roads.length], side = j % 2 ? -1 : 1, off = R0 * (0.1 + 0.08 * Math.floor(j / 2));
        const pts = [];
        for (let d = R0 * 0.05; d <= R0 * 1.4; d += R0 * 0.07) { const p = pointOnRoadAt(r, d); if (p) pts.push([p.x - p.ty * side * off, p.y + p.tx * side * off]); }
        if (pts.length > 1) runs.push(pts);
      }
    } else if (at === "ring") {
      if (n === 1) {
        const rr = R0 * (f.k === "wall" ? 1.0 : 0.85), pts = [];
        for (let k = 0; k <= 48; k++) { const a = (k / 48) * TAU, w = 1 + 0.04 * Math.sin(a * 3 + 1.3); pts.push([C.x + Math.cos(a) * rr * w, C.y + Math.sin(a) * rr * w]); }
        runs.push(pts);
      } else {
        // n of them round the centre: spokes (a ring of beams, of shafts)
        const ph = rnd() * TAU;
        for (let j = 0; j < n; j++) { const a = ph + (j / n) * TAU; runs.push([[C.x + Math.cos(a) * R0 * 0.3, C.y + Math.sin(a) * R0 * 0.3], [C.x + Math.cos(a) * R0 * 1.1, C.y + Math.sin(a) * R0 * 1.1]]); }
      }
    } else if (at === "edge") {
      for (let j = 0; j < n; j++) {
        const g = gaps[j % gaps.length], k = Math.floor(j / gaps.length), span = Math.min(g.width * 0.55, 70);
        const mid = g.mid + (k ? (k % 2 ? 1 : -1) * Math.min(g.width * 0.25, 40) : 0), rr = R0 * (1.25 + 0.17 * k + rnd() * 0.08), pts = [];
        for (let q = 0; q <= 12; q++) { const b = mid - span / 2 + (q / 12) * span, d = dirOf(b); pts.push([C.x + d[0] * rr, C.y + d[1] * rr]); }
        runs.push(pts);
      }
    } else if (at === "road") {
      for (let j = 0; j < n; j++) {
        const r = roads[j % Math.max(1, roads.length)]; const pts = [];
        const side = j % 2 ? -1 : 1, off = roadHalf + 3 + 3 * Math.floor(j / 2);
        if (r) for (let d = R0 * 0.4; d <= Math.hypot(W, H); d += R0 * 0.1) { const p = pointOnRoadAt(r, d); if (!p) break; pts.push([p.x - p.ty * side * off, p.y + p.tx * side * off]); }
        if (pts.length > 1) runs.push(pts); else runs.push(acrossPts(R0 * 0.5, meander));
      }
    } else if (at === "uphill" || at === "downhill") {
      const d = upDir ? (at === "uphill" ? upDir : [-upDir[0], -upDir[1]]) : slopeDir(at);
      if (!upDir) out.fallbacks.push({ k: f.k, entry: i, at, why: "no measured uphill — drawn toward the clearest side" });
      for (let j = 0; j < n; j++) {
        const nx = -d[1], ny = d[0], off = (j - (n - 1) / 2) * R0 * 0.3, pts = [], ph = rnd() * TAU;
        for (let q = 0; q <= 24; q++) { const t = R0 * 0.3 + (q / 24) * Math.hypot(W, H) * 0.6; const m = meander * Math.sin(t / (R0 * 0.5) + ph); pts.push([C.x + d[0] * t + nx * (off + m), C.y + d[1] * t + ny * (off + m)]); }
        runs.push(pts);
      }
    } else if (at === "river" && wet.length) {
      const w = wet[0], acc = arcOf(w.pts), t0 = nearestArc(w.pts, acc, C.x, C.y), pts = [];
      for (let t = t0 - R0 * 1.2; t <= t0 + R0 * 1.2; t += R0 * 0.08) { const p = atArc(w.pts, acc, t); const side = ((C.x - p.x) * -p.ty + (C.y - p.y) * p.tx) >= 0 ? 1 : -1; pts.push([p.x - p.ty * side * (w.half + 3), p.y + p.tx * side * (w.half + 3)]); }
      runs.push(pts);
    } else if (at === "rows") {
      const ux = Math.cos(mainAng), uy = Math.sin(mainAng), vx = -uy, vy = ux;
      for (let j = 0; j < n; j++) { const b = (j - (n - 1) / 2) * R0 * 0.35; runs.push([[C.x - ux * R0 * 0.8 + vx * b, C.y - uy * R0 * 0.8 + vy * b], [C.x + ux * R0 * 0.8 + vx * b, C.y + uy * R0 * 0.8 + vy * b]]); }
    } else if (at === "scatter" || at === "among") {
      const lim = at === "among" ? R0 * 0.85 : null;
      for (let j = 0; j < n; j++) {
        let best = null, bd = -1;
        for (let q = 0; q < 12; q++) {
          const p = lim ? (() => { const a = rnd() * TAU, d = lim * Math.sqrt(rnd()); return [C.x + Math.cos(a) * d, C.y + Math.sin(a) * d]; })() : [16 + rnd() * (W - 32), 16 + rnd() * (H - 32)];
          const dd = Math.min(...runs.map((r) => Math.hypot(r[0][0] - p[0], r[0][1] - p[1])), Infinity);
          if (dd > bd) { bd = dd; best = p; }
        }
        const a = rnd() * Math.PI, L = (lim ? R0 * 0.35 : R0 * 0.55);
        runs.push([[best[0] - Math.cos(a) * L / 2, best[1] - Math.sin(a) * L / 2], [best[0] + Math.cos(a + 0.3) * L / 2 * 0.1 + (rnd() - 0.5) * 2, best[1] + (rnd() - 0.5) * 2], [best[0] + Math.cos(a) * L / 2, best[1] + Math.sin(a) * L / 2]]);
      }
    } else {
      // centre, and anything the vocabulary adds later: a run through the centre
      if (at === "river") out.fallbacks.push({ k: f.k, entry: i, at, why: "no river within a walk — drawn through the centre" });
      const ux = Math.cos(acrossAng), uy = Math.sin(acrossAng);
      for (let j = 0; j < n; j++) {
        const k = out.lines.length + j, o = R0 * 0.22 * (1 + Math.floor(k / 2)) * (k % 2 ? -1 : 1);
        runs.push([[C.x - ux * R0 * 0.65 - uy * o, C.y - uy * R0 * 0.65 + ux * o], [C.x + ux * R0 * 0.65 - uy * o, C.y + uy * R0 * 0.65 + ux * o]]);
      }
    }
    for (const pts of runs) {
      const l = { k: f.k, entry: i, at, own: !!f.own, state: f.state || null, pts, half };
      out.lines.push(l);
      if (WET_LINES.has(f.k)) wet.push({ pts, half });
    }
    if (!out.streamLine && WET_LINES.has(f.k) && (at === "across" || at === "along") && runs[0]) out.streamLine = { pts: runs[0], half };
  }

  // ════ AREAS ════
  const areaEntries = feats.map((f, i) => ({ f, i })).filter(({ f }) => S.areas.has(f.k));
  const area = (f, i, x, y, r, extra = {}) => {
    const a = { k: f.k, entry: i, at: f.at, own: !!f.own, state: f.state || null, x, y, rPx: r, poly: extra.poly || blob(x, y, r, rnd, f.k === "clearing" ? 0.08 : 0.17), stripAngle: mainAng + Math.PI / 2, ...extra };
    out.areas.push(a);
    if (f.k === "water" || f.k === "drop") wetAreas.push(a.poly);
    return a;
  };
  const amongAreas = [];
  for (const { f, i } of areaEntries) {
    if (!GROUND_AREA_KINDS.includes(f.k)) { out.short.push({ k: f.k, entry: i, want: 1, placed: 0, why: "no painter for this fill yet" }); continue; }
    const n = Math.max(1, Math.round(Number(f.n) || AREA_N[f.at] || 1));
    const at = f.at;
    // ✅ G4: `own` draws at the place's own mark — the first patch of an own fill is the centre, larger
    let left = n;
    // ⛑ a lake or a pool that IS the place takes the heart of it, not all of it: *"a city built in tiers around the water"*
    const ownR = f.k === "water" ? R0 * 0.6 : null;
    if (f.own && at !== "centre" && f.k !== "drop") { area(f, i, C.x, C.y, ownR || R0 * 0.9); left--; }
    if (left <= 0) continue;
    if (f.k === "drop") {
      // ⛔ A SHEER DROP IS AN EDGE, NOT A BLOB: the lip across the frame on the falling side, and everything past it falls
      const d = upDir ? (at === "uphill" ? upDir : [-upDir[0], -upDir[1]]) : slopeDir(at);
      if (!upDir) out.fallbacks.push({ k: f.k, entry: i, at, why: "no measured uphill — the drop is on the clearest side" });
      const nx = -d[1], ny = d[0], D = Math.hypot(W, H), near = R0 * 1.08, edge = [];
      for (let q = 0; q <= 30; q++) { const t = -D + (q / 30) * 2 * D, j = (rnd() - 0.5) * R0 * 0.08; edge.push([C.x + d[0] * (near + j) + nx * t, C.y + d[1] * (near + j) + ny * t]); }
      const poly = [...edge, [edge[30][0] + d[0] * D, edge[30][1] + d[1] * D], [edge[0][0] + d[0] * D, edge[0][1] + d[1] * D]];
      area(f, i, C.x + d[0] * (near + D / 2), C.y + d[1] * (near + D / 2), D / 2, { poly, edge, dir: d });
      continue;
    }
    if (at === "centre") {
      if (left === 1 && !f.own) area(f, i, C.x, C.y, R0 * 0.78);
      else if (left === 1) area(f, i, C.x, C.y, ownR || R0 * 1.0);
      else for (let j = 0; j < left; j++) { const a = (j / left) * TAU + rnd(); area(f, i, C.x + Math.cos(a) * R0 * 0.5, C.y + Math.sin(a) * R0 * 0.5, R0 * 0.32); }
    } else if (at === "scatter") {
      const r = clamp(Math.min(W, H) * 0.1, R0 * 0.28, R0 * 0.55);
      const placed = [];
      for (let j = 0; j < left; j++) {
        let best = null, bd = -1;
        for (let q = 0; q < 16; q++) {
          const p = [r * 1.15 + rnd() * (W - r * 2.3), r * 1.15 + rnd() * (H - r * 2.3)];   // whole inside the frame
          const dC = Math.hypot(p[0] - C.x, p[1] - C.y);
          const dd = Math.min(dC - R0 * 0.9, ...placed.map((o) => Math.hypot(o[0] - p[0], o[1] - p[1]) - r * 1.2), Infinity);
          if (dd > bd) { bd = dd; best = p; }
        }
        placed.push(best); area(f, i, best[0], best[1], r * (0.8 + rnd() * 0.4));
      }
    } else if (at === "edge" || at === "ring") {
      const rr = at === "ring" ? R0 * 1.2 : R0 * 1.45, r = at === "ring" ? R0 * 0.38 : R0 * 0.45, ph = rnd() * 360;
      for (let j = 0; j < left; j++) {
        const b = at === "ring" ? ph + (j / left) * 360 : gaps[j % gaps.length].mid + (Math.floor(j / gaps.length) ? 25 * (j % 2 ? 1 : -1) : 0);
        const d = dirOf(b); const p = keepIn({ x: C.x + d[0] * rr, y: C.y + d[1] * rr }, r * 0.5);
        area(f, i, p.x, p.y, r * (0.85 + rnd() * 0.3));
      }
    } else if (at === "uphill" || at === "downhill" || at === "end" || at === "far_end") {
      const vertical = at === "uphill" || at === "downhill";
      const d = vertical ? (upDir ? (at === "uphill" ? upDir : [-upDir[0], -upDir[1]]) : slopeDir(at)) : (at === "end" ? endDir : farDir);
      if (vertical && !upDir) out.fallbacks.push({ k: f.k, entry: i, at, why: "no measured uphill — drawn on the clearest side" });
      const dist = vertical ? R0 * 1.35 : R0 * 0.62, r = vertical ? R0 * 0.62 : R0 * 0.42, nx = -d[1], ny = d[0];
      for (let j = 0; j < left; j++) { const o = (j - (left - 1) / 2) * r * 1.6; const p = keepIn({ x: C.x + d[0] * dist + nx * o, y: C.y + d[1] * dist + ny * o }, r * 0.4); area(f, i, p.x, p.y, r); }
    } else if (at === "across") {
      const ux = Math.cos(acrossAng), uy = Math.sin(acrossAng), nx = -uy, ny = ux, D = Math.hypot(W, H) * 0.75;
      for (let j = 0; j < left; j++) {
        const off = j * R0 * 0.8 * (j % 2 ? 1 : -1), hw = R0 * 0.28, top = [], bot = [];
        for (let q = 0; q <= 24; q++) { const t = -D + (q / 24) * 2 * D, w = hw * (1 + 0.15 * Math.sin(q * 1.7 + j)); top.push([C.x + ux * t + nx * (off + w), C.y + uy * t + ny * (off + w)]); bot.push([C.x + ux * t + nx * (off - w), C.y + uy * t + ny * (off - w)]); }
        area(f, i, C.x + nx * off, C.y + ny * off, D, { poly: [...top, ...bot.reverse()] });
      }
    } else if ((at === "water" || at === "river") && wet.length) {
      const w = wet[0], acc = arcOf(w.pts), t0 = nearestArc(w.pts, acc, C.x, C.y), r = R0 * 0.36;
      for (let j = 0; j < left; j++) {
        const p = atArc(w.pts, acc, t0 + (j - (left - 1) / 2) * r * 2.2);
        const side = ((C.x - p.x) * -p.ty + (C.y - p.y) * p.tx) >= 0 ? 1 : -1;
        const off = f.k === "water" || f.k === "mud" ? w.half * 0.5 : w.half + r * 0.8;
        area(f, i, p.x - p.ty * side * off, p.y + p.tx * side * off, r);
      }
    } else if (at === "junctions" || at === "road") {
      const J = junctionsOf();
      const r = at === "road" ? R0 * 0.3 : R0 * 0.13;
      for (let j = 0; j < left; j++) {
        let p;
        if (at === "road") { const rd = roads[j % Math.max(1, roads.length)]; const q = rd ? pointOnRoadAt(rd, R0 * 0.95) : null; const side = j % 2 ? -1 : 1; p = q ? { x: q.x - q.ty * side * (roadHalf + r * 1.1), y: q.y + q.tx * side * (roadHalf + r * 1.1) } : { x: C.x, y: C.y - R0 }; }
        else { const q = J[j % J.length], k = Math.floor(j / J.length), a = j * 2.4; p = { x: q[0] + Math.cos(a) * (roadHalf + r * 1.3) * (1 + k), y: q[1] + Math.sin(a) * (roadHalf + r * 1.3) * (1 + k) }; }
        area(f, i, p.x, p.y, r);
      }
    } else if (at === "among") {
      amongAreas.push({ f, i, n: left });
    } else {
      // water with no water within a walk, rows, gate: one patch at the centre, and said
      out.fallbacks.push({ k: f.k, entry: i, at, why: at === "water" || at === "river" ? "no water within a walk — the patch sits downhill" : `no area rule for "${at}" — the patch sits at the centre` });
      const d = upDir ? [-upDir[0], -upDir[1]] : endDir;
      for (let j = 0; j < left; j++) area(f, i, at === "water" || at === "river" ? C.x + d[0] * R0 * 1.3 : C.x, at === "water" || at === "river" ? C.y + d[1] * R0 * 1.3 : C.y, R0 * 0.4);
    }
  }
  function junctionsOf() {
    const J = [];
    if (roads.length >= 2) J.push([C.x, C.y]);
    for (const l of lanes) if (l.pts?.[0] && Math.hypot(l.pts[0][0] - C.x, l.pts[0][1] - C.y) > 4) J.push(l.pts[0]);
    for (const r of roads) { const p = pointOnRoadAt(r, R0 * 0.5); if (p) J.push([p.x, p.y]); }
    if (!J.length) J.push([C.x, C.y]);
    return J;
  }

  // ════ MARKS ════
  const okAt = (x, y, sz, k, onWater, onWay = false) => {
    if (!inFrame(x, y, sz + 1)) return false;
    for (const o of occ) if (Math.hypot(o.x - x, o.y - y) < (o.r + sz) * 0.82) return false;
    if (!onWay && !ON_WAY.has(k) && wayD(x, y) < roadHalf + sz * 0.7) return false;
    if (!onWater && waterGap(x, y) < sz * 0.75) return false;
    return true;
  };
  const SPIRAL = [[0, 0]];
  for (let q = 1; q <= 6; q++) { const m = 6 * q; for (let j = 0; j < m; j++) { const a = (j / m) * TAU + q; SPIRAL.push([Math.cos(a) * q, Math.sin(a) * q]); } }
  const put = (x, y, sz, k, onWater, steps, onWay = false, centre = false) => {
    const lim = 1 + 3 * steps * (steps + 1);   // the spiral's first `steps` rings
    for (let q = 0; q < Math.min(SPIRAL.length, lim); q++) {
      const px = x + SPIRAL[q][0] * sz * 1.15, py = y + SPIRAL[q][1] * sz * 1.15;
      // ⛑ only the exact point may sit on a way (the centre, where the roads meet); a nudged one keeps clear of them
      if (okAt(px, py, sz, k, onWater || (centre && q === 0), (onWay || centre) && q === 0)) { occ.push({ x: px, y: py, r: sz }); return { x: px, y: py }; }
    }
    return null;
  };
  const markEntries = feats.map((f, i) => ({ f, i })).filter(({ f }) => S.marks.has(f.k) && !isWallLine(f));
  const usedSite = new Set();
  const entries = [];
  for (const { f, i } of markEntries) {
    const glyph = groundGlyphOf(f.k, S.drawn[f.k]);
    const n = Math.max(1, Math.round(Number(f.n) || 1));
    // ✅ G5: a site the layout already names, of this glyph, is one of the n — and an own mark only an AUTHORED one
    const same = sites.filter((st) => !usedSite.has(st.id) && glyphFor({ kind: st.kind }) === glyph && (!f.own || !st.generated)
      && Math.hypot(st.x - C.x, st.y - C.y) <= Math.max(R0 * 2.5, Math.min(W, H) * 0.5));
    const keep = Math.min(n, same.length);
    for (const st of same.slice(0, keep)) { usedSite.add(st.id); out.kept.push({ k: f.k, entry: i, site: st.id, own: !!f.own }); }
    const shrink = n > 8 ? clamp(Math.sqrt(8 / n), 0.5, 1) : 1;
    entries.push({ f, i, glyph, n, want: n - keep, placed: 0, sz: base * (SIZE_OF[f.k] || 1) * shrink, ownFirst: !!f.own && keep === 0 });
  }
  const record = (e, p, c = {}) => {
    const m = { k: e.f.k, glyph: e.glyph, x: p.x, y: p.y, sz: e.sz, ang: c.ang || 0, own: false, state: e.f.state || null, entry: e.i, at: e.f.at, onWater: !!c.onWater, half: c.half || 0 };
    out.marks.push(m); e.placed++; return m;
  };
  const tryCands = (e, cands, steps) => {
    for (const c of cands) { const p = put(c.x, c.y, e.sz, e.f.k, !!c.onWater, steps, !!c.onWay, !!c.centre); if (p) return record(e, p, c); }
    return null;
  };
  // ⛔ OWN FIRST, AT THE CENTRE: *"the first thing the eye finds"*. An own of one is the centre whatever its `at`.
  for (const e of entries) {
    if (!e.ownFirst || e.want <= 0 || e.n > 1) continue;
    const sz0 = e.sz; e.sz = sz0 * 1.6;
    // ⛔ THE ROADS RUN INTO A PLACE'S OWN MARK — they all start at the centre — so the centre may sit on them
    // ⛑ and it stands in what is drawn there: the Sunken Choir's arena is IN its pool
    const m = tryCands(e, [{ x: C.x, y: C.y, centre: true, ang: e.f.k === "stacks" || e.f.k === "shed" ? mainAng : 0 }], 6);
    e.sz = sz0;
    if (m) { m.own = true; m.sz = sz0 * 1.6; e.want--; }
  }
  const itemsOf = (group) => {
    const items = [];
    for (const e of group) for (let j = 0; j < e.want; j++) items.push({ e, key: (j + 0.5) / e.want + e.i * 1e-6 });
    return items.sort((a, b) => a.key - b.key);
  };
  const szMaxOf = (group) => Math.max(...group.map((e) => e.sz), base);
  const rowOf = (d, dist, count, sp) => { const nx = -d[1], ny = d[0], o = []; for (let q = 0; q < count; q++) { const off = (q - (count - 1) / 2) * sp; o.push({ x: C.x + d[0] * dist + nx * off, y: C.y + d[1] * dist + ny * off, ang: Math.atan2(ny, nx) }); } return o; };
  const waterCands = (count, k, sz) => {
    if (!wet.length) return null;
    // the river first, the near bank first; then the far bank; then every other water line the entry drew
    const out2 = [], step = sz * 2.4;
    for (const w of wet) for (const far of [false, true]) {
      if (far && (ACROSS_WATER.has(k) || ON_WATER.has(k))) continue;
      const acc = arcOf(w.pts), t0 = nearestArc(w.pts, acc, C.x, C.y);
      for (let q = 0; q < Math.max(12, count * 5); q++) {
        const t = t0 + (q % 2 ? 1 : -1) * Math.ceil(q / 2) * step;
        if (t < 0 || t > acc[acc.length - 1]) continue;
        const p = atArc(w.pts, acc, t), near = ((C.x - p.x) * -p.ty + (C.y - p.y) * p.tx) >= 0 ? 1 : -1, side = far ? -near : near, nx = -p.ty * side, ny = p.tx * side;
        if (ACROSS_WATER.has(k)) out2.push({ x: p.x, y: p.y, ang: Math.atan2(ny, nx), onWater: true, half: w.half });
        else if (ON_WATER.has(k)) { const off = w.half > sz * 1.2 ? w.half - sz * 0.9 : 0; out2.push({ x: p.x + nx * off, y: p.y + ny * off, ang: Math.atan2(p.ty, p.tx), onWater: true, half: w.half }); }
        else out2.push({ x: p.x + nx * (w.half + sz * 1.25), y: p.y + ny * (w.half + sz * 1.25) });
      }
    }
    return out2;
  };
  const AT_ORDER = ["centre", "road", "end", "far_end", "gate", "along", "river", "water", "rows", "ring", "junctions", "uphill", "downhill", "edge", "across", "scatter"];
  const groups = new Map();
  for (const e of entries) { if (e.want <= 0) continue; const a = AT_ORDER.includes(e.f.at) ? e.f.at : (e.f.at === "among" ? "among" : "centre"); if (!groups.has(a)) groups.set(a, []); groups.get(a).push(e); }
  for (const at of AT_ORDER) {
    const group = groups.get(at); if (!group) continue;
    const szM = szMaxOf(group), sp = szM * 2.5;
    if (at === "centre") {
      const items = itemsOf(group); let ringI = 0, slot = 0;
      const centreFree = !out.marks.some((m) => Math.hypot(m.x - C.x, m.y - C.y) < szM);
      const cands = [];
      if (centreFree) cands.push({ x: C.x, y: C.y, onWay: true });
      while (cands.length < items.length + 6) { ringI++; const rr = szM * 2.6 * ringI, cap = Math.max(4, Math.floor((TAU * rr) / (szM * 2.4))), ph = ringI * 0.7; for (slot = 0; slot < cap; slot++) { const a = ph + (slot / cap) * TAU; cands.push({ x: C.x + Math.cos(a) * rr, y: C.y + Math.sin(a) * rr }); } }
      let ci = 0;
      for (const it of items) { let ok = null; while (!ok && ci < cands.length) ok = tryCands(it.e, [cands[ci++]], 0); if (!ok) tryCands(it.e, [{ x: C.x, y: C.y }], 6); }
    } else if (at === "road") {
      const items = itemsOf(group);
      items.forEach((it, q) => {
        const r = roads[q % Math.max(1, roads.length)], k = Math.floor(q / Math.max(1, roads.length)), side = q % 2 ? -1 : 1;
        const p = r ? pointOnRoadAt(r, R0 * (0.85 + 0.3 * Math.floor(k / 2))) : null;
        const c = p ? { x: p.x - p.ty * side * (roadHalf + it.e.sz * 1.3), y: p.y + p.tx * side * (roadHalf + it.e.sz * 1.3) } : { x: C.x, y: C.y - R0 * 0.85 };
        tryCands(it.e, [keepIn(c, it.e.sz + 2)], 4);
      });
    } else if (at === "end" || at === "far_end" || at === "uphill" || at === "downhill") {
      const vertical = at === "uphill" || at === "downhill";
      const d = vertical ? (upDir ? (at === "uphill" ? upDir : [-upDir[0], -upDir[1]]) : slopeDir(at)) : (at === "end" ? endDir : farDir);
      if (vertical && !upDir) for (const e of group) out.fallbacks.push({ k: e.f.k, entry: e.i, at, why: "no measured uphill — placed on the clearest side" });
      // ranked: the first entry at the end itself, each next one a step in from it (the rigs under the sheds)
      group.forEach((e, rank) => {
        const dist = vertical ? R0 * 0.95 + rank * sp : Math.max(R0 * 0.25, R0 * 0.66 - rank * sp);
        // ⛑ and if that ground is taken (a stair down to the water whose water is also downhill), step back toward the centre
        const rows = [1, 0.8, 0.62, 0.45, 1.25].map((f) => rowOf(d, dist * f, e.want, sp).map((c) => keepIn(c, e.sz + 2)));
        for (let q = 0; q < e.want; q++) tryCands(e, rows.map((r) => r[q]), 3);
      });
    } else if (at === "gate") {
      const g = out.marks.find((m) => m.glyph === "gate" || m.glyph === "waygate") || sites.find((st) => ["gate", "waygate"].includes(glyphFor({ kind: st.kind })))
        || (mainRoad ? pointOnRoadAt(mainRoad, R0) : null) || C;
      itemsOf(group).forEach((it, q) => { const a = mainAng + Math.PI / 2 + q * 1.1; tryCands(it.e, [{ x: g.x + Math.cos(a) * szM * 2.4, y: g.y + Math.sin(a) * szM * 2.4 }], 4); });
    } else if (at === "along") {
      // ⛔ ALONG THE LINE THE ENTRY NAMES, else the main road through the centre: Thinwater's shrines are on its stream
      const named = out.streamLine?.pts || out.lines.find((l) => ["path", "pipe_run", "channel", "stream"].includes(l.k) && (l.at === "across" || l.at === "along"))?.pts;
      const half = out.streamLine ? out.streamLine.half : roadHalf;
      const line = named || (roads.length >= 2 ? [...roads[1].pts.slice().reverse(), ...roads[0].pts.slice(1)] : roads.length ? roads[0].pts : acrossPts(0, 0));
      const acc = arcOf(line), t0 = nearestArc(line, acc, C.x, C.y), T = acc[acc.length - 1];
      const lo = Math.max(0, t0 - R0 * 1.25), hi = Math.min(T, t0 + R0 * 1.25);
      const items = itemsOf(group), m = items.length;
      items.forEach((it, q) => {
        const cands = [];
        for (const nudge of [0, 0.35, -0.35, 0.7, -0.7]) {
          const t = lo + ((q + 0.5 + nudge) / m) * (hi - lo), p = atArc(line, acc, t);
          for (const side of q % 2 ? [-1, 1] : [1, -1]) cands.push({ x: p.x - p.ty * side * (half + it.e.sz * 1.3), y: p.y + p.tx * side * (half + it.e.sz * 1.3) });
        }
        tryCands(it.e, cands, 1);
      });
    } else if (at === "river" || at === "water") {
      for (const it of itemsOf(group)) {
        let cands = waterCands(1, it.e.f.k, it.e.sz);
        if (!cands && at === "water") {
          // a pool or the sea drawn as a fill: its shore
          const pools = out.areas.filter((a) => a.k === "water");
          if (pools.length) {
            cands = [];
            for (const pool of pools) {
              // moored by the shore first, then further out; a leviathan wants the open middle
              const rings = it.e.f.k === "leviathan" ? [0, 0.4, 0.65] : [0.82, 0.62, 0.4, 0];
              if (ON_WATER.has(it.e.f.k)) for (const f of rings) { const m = f ? 14 : 1; for (let q = 0; q < m; q++) { const a = (q / m) * TAU + f; cands.push({ x: pool.x + Math.cos(a) * pool.rPx * f, y: pool.y + Math.sin(a) * pool.rPx * f, onWater: true, ang: a + Math.PI / 2 }); } }
              else for (const [x, y] of pool.poly) { const dx = x - pool.x, dy = y - pool.y, L = Math.hypot(dx, dy) || 1; cands.push({ x: x + (dx / L) * it.e.sz * 1.25, y: y + (dy / L) * it.e.sz * 1.25, ang: Math.atan2(dx, -dy) }); }
            }
          }
        }
        if (!cands) {
          if (!out.fallbacks.some((x) => x.entry === it.e.i)) out.fallbacks.push({ k: it.e.f.k, entry: it.e.i, at, why: "no water within a walk — placed on the outskirts" });
          cands = [];
          for (let q = 0; q < 10; q++) { const g = gaps[(it.e.placed + q) % gaps.length], d = dirOf(g.mid + (it.e.placed + q) * 23); cands.push(keepIn({ x: C.x + d[0] * R0 * (1.1 + 0.05 * q), y: C.y + d[1] * R0 * (1.1 + 0.05 * q) }, it.e.sz + 2)); }
          tryCands(it.e, cands, 3);
          continue;
        }
        tryCands(it.e, cands, 0);
      }
    } else if (at === "rows") {
      const items = itemsOf(group), count = items.length;
      const ux = Math.cos(mainAng), uy = Math.sin(mainAng), vx = -uy, vy = ux;
      const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.6))), rowsN = Math.ceil(count / cols);
      const gsp = clamp(Math.min((R0 * 1.5) / cols, (R0 * 1.1) / Math.max(1, rowsN)), szM * 2.25, szM * 4.2);
      const cells = [];
      for (let r = 0; r < rowsN + 1; r++) for (let c = 0; c < cols; c++) { const a = (c - (cols - 1) / 2) * gsp, b = (r - (rowsN - 1) / 2) * gsp * 1.15; cells.push({ x: C.x + ux * a + vx * b, y: C.y + uy * a + vy * b, ang: mainAng }); }
      cells.sort((p, q) => Math.hypot(p.x - C.x, p.y - C.y) - Math.hypot(q.x - C.x, q.y - C.y));
      let ci = 0;
      for (const it of items) { let ok = null; while (!ok && ci < cells.length) ok = tryCands(it.e, [cells[ci++]], 0); if (!ok) tryCands(it.e, [{ x: C.x, y: C.y, ang: mainAng }], 6); }
    } else if (at === "ring") {
      const items = itemsOf(group); let left = items.length, rr = R0 * 0.72, k = 0; const cands = [];
      const ph = rnd() * TAU;
      while (left > 0 && k < 4) { const cap = Math.max(3, Math.floor((TAU * rr) / (szM * 2.4))), m = Math.min(left, cap); for (let q = 0; q < m; q++) { const a = ph + (q / m) * TAU + k * 0.3; cands.push(keepIn({ x: C.x + Math.cos(a) * rr, y: C.y + Math.sin(a) * rr, ang: a + Math.PI / 2 }, szM + 2)); } left -= m; rr += szM * 2.6; k++; }
      items.forEach((it, q) => tryCands(it.e, [cands[q] || cands[q % cands.length]], 3));
    } else if (at === "junctions") {
      const J = junctionsOf();
      itemsOf(group).forEach((it, q) => { const p = J[q % J.length], k = Math.floor(q / J.length), a = q * 2.4 + 0.6; tryCands(it.e, [{ x: p[0] + Math.cos(a) * (roadHalf + it.e.sz * 1.3) * (1 + k * 0.8), y: p[1] + Math.sin(a) * (roadHalf + it.e.sz * 1.3) * (1 + k * 0.8) }], 4); });
    } else if (at === "edge") {
      const items = itemsOf(group), count = items.length, tot = gaps.reduce((a, g) => a + g.width, 0);
      const alloc = gaps.map((g) => Math.floor((count * g.width) / tot)); let rem = count - alloc.reduce((a, b) => a + b, 0);
      for (let q = 0; rem > 0; q = (q + 1) % gaps.length) { alloc[q]++; rem--; }
      const cands = [];
      gaps.forEach((g, gi) => { for (let j = 0; j < alloc[gi]; j++) { const b = g.from + (g.width * (j + 0.5)) / alloc[gi] + (rnd() - 0.5) * Math.min(20, g.width / (alloc[gi] + 1)); const d = dirOf(b), rr = R0 * (1.15 + rnd() * 0.3); cands.push(keepIn({ x: C.x + d[0] * rr, y: C.y + d[1] * rr }, szM + 2)); } });
      items.forEach((it, q) => tryCands(it.e, [cands[q]], 4));
    } else if (at === "across") {
      const ux = Math.cos(acrossAng), uy = Math.sin(acrossAng), items = itemsOf(group), m = items.length, D = Math.min(W, H) * 0.45;
      items.forEach((it, q) => { const t = m === 1 ? R0 * 0.5 : -D + ((q + 0.5) / m) * 2 * D; tryCands(it.e, [keepIn({ x: C.x + ux * t, y: C.y + uy * t, ang: acrossAng }, it.e.sz + 2)], 4); });
    } else if (at === "scatter") {
      // ⛔ SPREAD FAR APART OVER THE WHOLE GROUND: each the best of a dozen candidates for distance from everything placed
      for (const it of itemsOf(group)) {
        const cands = [];
        for (let q = 0; q < 14; q++) { const x = it.e.sz + 6 + rnd() * (W - 2 * (it.e.sz + 6)), y = it.e.sz + 6 + rnd() * (H - 2 * (it.e.sz + 6)); let d = Infinity; for (const o of occ) d = Math.min(d, Math.hypot(o.x - x, o.y - y) - o.r); cands.push({ x, y, d }); }
        cands.sort((a, b) => b.d - a.d);
        tryCands(it.e, cands, 0);
      }
    }
  }
  // an own of more than one: the one nearest the centre is the place's own mark — flagged after `among`, in the finish
  const flagOwn = () => {
    for (const e of entries) {
      if (!e.ownFirst || e.n <= 1) continue;
      let best = null, bd = Infinity;
      for (const m of out.marks) if (m.entry === e.i) { const d = Math.hypot(m.x - C.x, m.y - C.y); if (d < bd) { bd = d; best = m; } }
      if (best) { best.own = true; best.sz = e.sz * 1.45; }
    }
  };
  const amongGroup = groups.get("among") || [];
  // ⛑ `wetOK`: a layout on the water (stilts, hulls, floating, underwater) is not kept out of it — only out of the marks
  const blocked = (x, y, pad = 0, wetOK = false) => {
    for (const o of occ) if (Math.hypot(o.x - x, o.y - y) < o.r + pad) return true;
    return !wetOK && waterGap(x, y) < pad * 0.6;
  };
  Object.defineProperty(out, "blocked", { value: blocked, enumerable: false });
  /* the second phase, after the houses: `among` is mixed in with them */
  Object.defineProperty(out, "_finish", { enumerable: false, writable: true, configurable: true, value: (houses) => {
    const hs = (houses || []).slice().sort((a, b) => Math.atan2(a.y - C.y, a.x - C.x) - Math.atan2(b.y - C.y, b.x - C.x));
    for (const h of hs) occ.push({ x: h.x, y: h.y, r: Math.max(2.2, 9 * s) * 0.55 });
    const items = itemsOf(amongGroup), m = items.length;
    items.forEach((it, q) => {
      const cands = [];
      if (hs.length) for (let k = 0; k < 12; k++) { const h = hs[Math.floor(((q + 0.5) / m) * hs.length + k * 3) % hs.length], a = rnd() * TAU, d = Math.max(2.2, 9 * s) * 0.6 + it.e.sz * 1.1; cands.push({ x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d }); }
      else for (let k = 0; k < 12; k++) { const a = rnd() * TAU, d = R0 * 0.85 * Math.sqrt(rnd()); cands.push({ x: C.x + Math.cos(a) * d, y: C.y + Math.sin(a) * d }); }
      tryCands(it.e, cands, 3);
    });
    for (const { f, i, n } of amongAreas) {
      for (let j = 0; j < n; j++) {
        const h = hs.length ? hs[Math.floor(((j + 0.5) / n) * hs.length)] : null, a = rnd() * TAU, r = R0 * 0.1;
        const x = h ? h.x + Math.cos(a) * r * 1.6 : C.x + Math.cos(a) * R0 * 0.5, y = h ? h.y + Math.sin(a) * r * 1.6 : C.y + Math.sin(a) * R0 * 0.5;
        area(f, i, x, y, r);
      }
    }
    flagOwn();
    // ⛑ WHAT DID NOT FIT IS SAID, entry by entry, never dropped in silence
    for (const e of entries) if (e.placed < e.want) out.short.push({ k: e.f.k, entry: e.i, want: e.want, placed: e.placed, why: "no room at this scale" });
  } });
  return out;
}

/** ⛔ PHASE TWO, after the houses: what is `among` them, and the account of anything that did not fit. */
export function finishGround(g, houses = []) {
  if (g && typeof g._finish === "function") { const fin = g._finish; g._finish = null; fin(houses); }
  return g;
}

/** Every kind the painter can draw, by section — the gate reads these against `_kinds`. */
export const GROUND_LINE_KINDS = Object.freeze(["path", "stream", "channel", "pipe_run", "trench", "hedgerow", "chain", "beam", "drive_shaft", "wall"]);
export const GROUND_AREA_KINDS = Object.freeze(["field", "pasture", "orchard", "garden", "wood", "marsh", "rock", "waste", "ash", "glass", "water",
  "grass", "heath", "mud", "burnt", "salt_pans", "blocks", "clearing", "drop"]);
