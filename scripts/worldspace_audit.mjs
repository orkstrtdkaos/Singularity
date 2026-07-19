// worldspace_audit.mjs — is the map a SPACE, or a diagram?
//
// Erik, 2026-07-19: "if the lampless market ISN'T in the Deepwood, it SHOULDN'T have the same
// coordinates. We need to make the COORDINATES the worldspace first."
//
// This measures whether map.x/map.y currently behave like positions in a world or like layout hints
// on a chart. The test is simple: if coordinates are worldspace, then regions occupy coherent
// territory, two places close together are in the same region or on its border, and travel
// connections run between things that are near each other. If coordinates are a diagram, none of
// that holds and every mechanic derived from distance inherits the incoherence silently.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const R = join(import.meta.dirname, "..");
const d = `${R}/content/packs/valley/locations`;
const L = readdirSync(d).filter(f => f.endsWith(".json")).map(f => JSON.parse(readFileSync(`${d}/${f}`, "utf8")));
const byId = Object.fromEntries(L.map(l => [l.id, l]));
const xy = l => [l?.map?.x ?? 0, l?.map?.y ?? 0];
const dist = (a, b) => Math.hypot(xy(a)[0] - xy(b)[0], xy(a)[1] - xy(b)[1]);

console.log(`${L.length} locations, ${new Set(L.map(l => l.regionId)).size} regions\n`);

// ---- 1. exact and near collisions across regions ----
const pairs = [];
for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
  const dd = dist(L[i], L[j]);
  if (dd < 30) pairs.push({ a: L[i], b: L[j], d: dd });
}
const crossRegion = pairs.filter(p => p.a.regionId !== p.b.regionId);
console.log(`=== 1. PLACES SITTING ON TOP OF EACH OTHER (< 30 units apart) ===`);
console.log(`   ${pairs.length} pairs, of which ${crossRegion.length} are in DIFFERENT regions`);
for (const p of crossRegion.sort((x, y) => x.d - y.d).slice(0, 10)) {
  const connected = (p.a.connections || []).some(c => (typeof c === "string" ? c : c?.to) === p.b.id);
  console.log(`   ${p.d.toFixed(0).padStart(3)}u  ${p.a.id} [${p.a.regionId}]  <->  ${p.b.id} [${p.b.regionId}]${connected ? "" : "   NOT CONNECTED"}`);
}

// ---- 2. are regions coherent territory, or scattered? ----
console.log(`\n=== 2. DO REGIONS OCCUPY COHERENT TERRITORY? ===`);
const groups = {};
for (const l of L) (groups[l.regionId] = groups[l.regionId] || []).push(l);
const spreads = [];
for (const [rg, ls] of Object.entries(groups)) {
  if (ls.length < 2) continue;
  const cx = ls.reduce((a, l) => a + xy(l)[0], 0) / ls.length;
  const cy = ls.reduce((a, l) => a + xy(l)[1], 0) / ls.length;
  const radius = Math.max(...ls.map(l => Math.hypot(xy(l)[0] - cx, xy(l)[1] - cy)));
  spreads.push({ rg, n: ls.length, cx, cy, radius });
}
// how many OTHER regions' places fall inside a region's own footprint?
let intruded = 0;
for (const s of spreads) {
  const inside = L.filter(l => l.regionId !== s.rg && Math.hypot(xy(l)[0] - s.cx, xy(l)[1] - s.cy) < s.radius);
  if (inside.length) { intruded++; console.log(`   ${s.rg.padEnd(22)} footprint r=${s.radius.toFixed(0).padStart(3)} contains ${inside.length} location(s) of OTHER regions`); }
}
console.log(`   ${intruded} of ${spreads.length} multi-location regions overlap another region's territory`);

// ---- 3. do connections run between things that are near each other? ----
console.log(`\n=== 3. DOES TRAVEL AGREE WITH DISTANCE? ===`);
const edges = [];
for (const l of L) for (const c of l.connections || []) {
  const to = typeof c === "string" ? c : (c?.to || c?.id);
  if (byId[to] && l.id < to) edges.push({ a: l, b: byId[to], d: dist(l, byId[to]) });
}
edges.sort((x, y) => y.d - x.d);
console.log(`   ${edges.length} edges. Longest: ${edges.slice(0, 3).map(e => `${e.a.id}->${e.b.id} ${e.d.toFixed(0)}u`).join(", ")}`);
// a "teleport" edge: two connected places further apart than most unconnected pairs
const allPairDists = [];
for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) allPairDists.push(dist(L[i], L[j]));
allPairDists.sort((a, b) => a - b);
const median = allPairDists[Math.floor(allPairDists.length / 2)];
const teleports = edges.filter(e => e.d > median);
console.log(`   median distance between ANY two locations: ${median.toFixed(0)}u`);
console.log(`   ${teleports.length} connection(s) span further than that — a road longer than the typical gap between strangers`);

// ---- 4. is there any axis structure in the coordinates today? ----
console.log(`\n=== 4. IS THERE AXIS STRUCTURE IN THE COORDINATES? ===`);
// the world's own canon says it is "axis-space made land". If x/y encoded axes, a location's
// spectrum should correlate with its position. Test the strongest available pair.
const withSpec = L.filter(l => l.spectrum && Object.keys(l.spectrum).length);
const axes = [...new Set(withSpec.flatMap(l => Object.keys(l.spectrum)))];
const corr = (f, g) => {
  const n = f.length, mf = f.reduce((a, b) => a + b, 0) / n, mg = g.reduce((a, b) => a + b, 0) / n;
  const cov = f.reduce((a, _, i) => a + (f[i] - mf) * (g[i] - mg), 0);
  const sf = Math.sqrt(f.reduce((a, v) => a + (v - mf) ** 2, 0)), sg = Math.sqrt(g.reduce((a, v) => a + (v - mg) ** 2, 0));
  return (sf && sg) ? cov / (sf * sg) : 0;
};
const results = [];
for (const ax of axes) {
  const ls = withSpec.filter(l => typeof l.spectrum[ax] === "number");
  if (ls.length < 10) continue;
  const vals = ls.map(l => l.spectrum[ax]);
  results.push({ ax, n: ls.length, x: corr(vals, ls.map(l => xy(l)[0])), y: corr(vals, ls.map(l => xy(l)[1])) });
}
results.sort((a, b) => Math.max(Math.abs(b.x), Math.abs(b.y)) - Math.max(Math.abs(a.x), Math.abs(a.y)));
for (const r of results.slice(0, 6)) console.log(`   ${r.ax.padEnd(24)} n=${String(r.n).padStart(3)}  corr(x)=${r.x.toFixed(2).padStart(5)}  corr(y)=${r.y.toFixed(2).padStart(5)}`);
const strongest = Math.max(...results.map(r => Math.max(Math.abs(r.x), Math.abs(r.y))));
console.log(`   strongest spectrum<->position correlation anywhere: ${strongest.toFixed(2)}  (1.0 = coordinates ARE the axis; 0 = unrelated)`);
