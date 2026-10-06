// po/tools/measure_world_roads.mjs — Aevi, 2026-10-06. What the world map's roads actually are, measured
// against the ground they cross. Run: node po/tools/measure_world_roads.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WG = await import(join(root, "engine/worldglobe.js").replace(/\\/g, "/").replace(/^([A-Z]):/, "file:///$1:"));
const { loadContentHeadless } = await import(join(root, "tests/headless_content.mjs").replace(/\\/g, "/").replace(/^([A-Z]):/, "file:///$1:"));
const C = await loadContentHeadless();
const t = WG.decodeTerrain(JSON.parse(readFileSync(join(root, "content/packs/core/world/terrain.json"), "utf8")));
const routes = WG.worldRoadRoutes(t, C.locations, { tierOf: (l) => l?.tier });
const net = WG.roadNetwork(C.locations, { tierOf: (l) => l?.tier });
const R = Math.PI / 180;
const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a[0]*R)*Math.sin(b[0]*R) + Math.cos(a[0]*R)*Math.cos(b[0]*R)*Math.cos((a[1]-b[1])*R)))) / R;
const wet = (lat, lon) => { let lo = lon; while (lo > 180) lo -= 360; while (lo < -180) lo += 360; const s = WG.sampleAt(t, lo, lat); return s ? (s.type & 3) === 0 : false; };
const slerp = (a, b, n) => { const v = (p) => [Math.cos(p[0]*R)*Math.cos(p[1]*R), Math.cos(p[0]*R)*Math.sin(p[1]*R), Math.sin(p[0]*R)];
  const A = v(a), B = v(b), out = []; for (let i = 0; i <= n; i++) { const f = i / n; const x = A.map((c, k) => c + (B[k]-c)*f); const m = Math.hypot(...x); out.push([Math.asin(x[2]/m)/R, Math.atan2(x[1], x[0])/R]); } return out; };
const P = (id) => { const w = C.locations[id]?.worldPos; return w ? [w.colatitude - 90, w.longitude] : null; };
const rows = [];
for (const e of net.roads) {
  const a = P(e.a), b = P(e.b); if (!a || !b) continue;
  const key = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`;
  const routed = routes.byPair.get(key);
  const path = routed || slerp(a, b, 48);
  // densify for the wet test
  let n = 0, w = 0;
  for (let i = 1; i < path.length; i++) { const seg = slerp(path[i-1], path[i], 4); for (const p of seg) { n++; if (wet(p[0], p[1])) w++; } }
  let walked = 0; for (let i = 1; i < path.length; i++) walked += gc(path[i-1], path[i]);
  const straight = gc(a, b);
  rows.push({ key, routed: !!routed, wetPct: Math.round(100 * w / n), ratio: straight > 0.2 ? +(walked / straight).toFixed(2) : null,
    straightDeg: +straight.toFixed(2), minColat: +Math.min(C.locations[e.a].worldPos.colatitude, C.locations[e.b].worldPos.colatitude).toFixed(2),
    primary: !!e.primary });
}
const routed = rows.filter((r) => r.routed), arcs = rows.filter((r) => !r.routed);
const pct = (xs, q) => { const s = [...xs].sort((x, y) => x - y); return s.length ? s[Math.floor(q * (s.length - 1))] : null; };
console.log(`roads ${rows.length} · routed ${routed.length} · fall back to the straight arc ${arcs.length} · seam-dropped ${routes.seamDropped}`);
console.log(`routed: wet% median ${pct(routed.map(r => r.wetPct), .5)} · p90 ${pct(routed.map(r => r.wetPct), .9)} · >20% wet: ${routed.filter(r => r.wetPct > 20).length}`);
console.log(`routed: walked/straight median ${pct(routed.filter(r=>r.ratio).map(r => r.ratio), .5)} · p90 ${pct(routed.filter(r=>r.ratio).map(r => r.ratio), .9)} · over 2x: ${routed.filter(r => r.ratio > 2).length}`);
console.log(`arcs: wet% median ${pct(arcs.map(r => r.wetPct), .5)} · >20% wet: ${arcs.filter(r => r.wetPct > 20).length}`);
const byCap = (rs, lim) => rs.filter((r) => r.minColat < lim).length;
console.log(`unrouted with an end within 10° of the Crossing: ${byCap(arcs, 10)} of ${arcs.length}; routed: ${byCap(routed, 10)} of ${routed.length}`);
console.log("worst routed by wet%:"); routed.sort((x, y) => y.wetPct - x.wetPct).slice(0, 8).forEach(r => console.log("  ", r.key, r.wetPct + "% wet", "x" + r.ratio, "colat " + r.minColat));
console.log("worst routed by detour:"); routed.filter(r=>r.ratio).sort((x, y) => y.ratio - x.ratio).slice(0, 6).forEach(r => console.log("  ", r.key, "x" + r.ratio, r.straightDeg + "°", "colat " + r.minColat));
console.log("straight arcs drawn (unrouted):"); arcs.sort((x, y) => y.wetPct - x.wetPct).slice(0, 12).forEach(r => console.log("  ", r.key, r.wetPct + "% wet", r.straightDeg + "°", "colat " + r.minColat, r.primary ? "TRUNK" : ""));
