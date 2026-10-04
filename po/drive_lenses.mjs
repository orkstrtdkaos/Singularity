// B4 geometry driven on known shapes, where the right answer is arithmetic rather than opinion.
import * as L from "../engine/lenses.js";

// ---- isoLines: a cone. The 0.5 contour of 1-r/R is a circle of radius R/2. ----
const W = 101, H = 101, R = 50;
const g = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = Math.max(0, 1 - Math.hypot(x - 50, y - 50) / R);
for (const lvl of [0.5, 0.8]) {
  const lines = L.isoLines(g, W, H, lvl);
  const pts = lines.flat();
  const rad = pts.map(p => Math.hypot(p[0] - 50, p[1] - 50));
  const want = R * (1 - lvl);
  console.log(`iso ${lvl}: ${lines.length} polyline(s), longest ${Math.max(...lines.map(l => l.length))} pts, radius ${Math.min(...rad).toFixed(2)}..${Math.max(...rad).toFixed(2)} (want ${want})`);
}
// closed? first point should meet the last
const ring = L.isoLines(g, W, H, 0.5)[0];
console.log(`  closed: ${Math.hypot(ring[0][0] - ring[ring.length-1][0], ring[0][1] - ring[ring.length-1][1]).toFixed(3)} px gap (0 = closed)`);

// ---- a field with two separate blobs must give TWO lines, not one ----
const g2 = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  g2[y * W + x] = Math.max(Math.max(0, 1 - Math.hypot(x - 25, y - 50) / 18), Math.max(0, 1 - Math.hypot(x - 75, y - 50) / 18));
}
console.log(`two blobs at 0.5: ${L.isoLines(g2, W, H, 0.5).length} polyline(s) (want 2)`);

// ---- blur flattens, and keeps the mean ----
const mean = (a) => [...a].reduce((s, v) => s + v, 0) / a.length;
const b = L.blurGrid(g, W, H, 3);
console.log(`blur: mean ${mean(g).toFixed(4)} -> ${mean(b).toFixed(4)}; peak ${Math.max(...g).toFixed(3)} -> ${Math.max(...b).toFixed(3)}`);

// ---- stipple: density tracks the value, and is identical twice ----
for (const v of [0.15, 0.5, 0.9]) {
  const s = L.stipple(400, 400, () => v, { cell: 6 });
  const cells = Math.ceil(400/6) ** 2;
  console.log(`stipple v=${v}: ${s.length} dots of ${cells} cells = ${(s.length/cells).toFixed(3)} (want ~${v})`);
}
const s1 = L.stipple(300, 300, () => 0.5, { cell: 6 }), s2 = L.stipple(300, 300, () => 0.5, { cell: 6 });
console.log(`  deterministic: ${s1.length === s2.length && s1.every((p,i) => p.x === s2[i].x && p.y === s2[i].y)}`);

// ---- hexGather: on a lattice, and gathered toward the tended point ----
const near = L.nearness([{ x: 100, y: 100, r: 80 }]);
const hx = L.hexGather(400, 400, () => 1, near, { pitch: 10 });
const far = hx.filter(p => Math.hypot(p.x - 100, p.y - 100) > 80).length;
const dys = [...new Set(hx.map(p => Math.round(p.y * 100) / 100))].sort((a,b)=>a-b);
console.log(`hex: ${hx.length} dots, ${far} outside the reach (want 0), ${dys.length} distinct rows, row pitch ${(dys[1]-dys[0]).toFixed(3)} (want ${(10*Math.sqrt(3)/2).toFixed(3)})`);
console.log(`nearness: centre ${near(100,100).toFixed(3)} (want 1), rim ${near(180,100).toFixed(3)} (want 0), mid ${near(140,100).toFixed(3)}`);
const fac = L.crystalFacets(0, 0, 10, { points: 6 });
console.log(`crystal: ${fac.length} points (want 12), radii ${[...new Set(fac.map(p => Math.hypot(p[0],p[1]).toFixed(1)))].join("/")}`);
