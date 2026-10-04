// AEVI B3 — do the routed roads actually go round things, how long does it take, and do they form trunks?
// The question I owe her an answer on: cache per region, or bake.
import { readFileSync } from "node:fs";
import * as WG from "../engine/worldglobe.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";

const C = await loadContentHeadless();
const RM = JSON.parse(readFileSync("content/packs/core/world/region_maps.json", "utf8"));
const terr = WG.decodeTerrain(JSON.parse(readFileSync("content/packs/core/world/terrain.json", "utf8")));
const NET = WG.roadNetwork(C.locations, { k: 1.1 });
console.log(`network: ${NET.roads.length} roads kept, ${NET.folded.length} folded, over ${Object.keys(NET.positions).length} placed locations`);

// the region population is the distinct regionId over LOCATIONS, not the region-tier places: regionExtent
// keys off `l.regionId || l.region`. My first pass asked for region-tier ids and got "no extent" 25 times.
const census = {};
for (const id of Object.keys(C.locations)) {
  const l = C.locations[id];
  const r = l?.regionId || l?.region || "(none)";
  census[r] = census[r] || { n: 0, placed: 0, inh: 0 };
  census[r].n++;
  if (l?.worldPos) census[r].placed++;
  if (l?.worldPosInherited) census[r].inh++;
}
// the polar sweep lives here too, because it is the same question: can this region be framed at all?
// MEASURED: the_center's 11 places span 0.76 degrees of ground and get a box 171 degrees of longitude wide.
const R2 = Math.PI / 180;
const gcd = (a, b) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a[0]*R2)*Math.sin(b[0]*R2) + Math.cos(a[0]*R2)*Math.cos(b[0]*R2)*Math.cos((a[1]-b[1])*R2)))) / R2;
console.log("regions by location count:");
for (const [r, v] of Object.entries(census).sort((a, b) => b[1].n - a[1].n)) {
  const e = WG.regionExtent(r, C.locations, { authored: RM[r] || null });
  let note = "";
  if (e) {
    const pts = Object.keys(C.locations).filter((id) => (C.locations[id]?.regionId || C.locations[id]?.region) === r && C.locations[id]?.worldPos)
      .map((id) => [C.locations[id].worldPos.colatitude - 90, C.locations[id].worldPos.longitude]);
    let spread = 0;
    for (const a of pts) for (const b of pts) spread = Math.max(spread, gcd(a, b));
    const inF = (lon) => { const mid = (e.lo0 + e.lo1) / 2; let q = lon; while (q - mid > 180) q -= 360; while (mid - q > 180) q += 360; return q; };
    const on = pts.filter(([la, lo]) => la >= e.la0 && la <= e.la1 && inF(lo) >= e.lo0 && inF(lo) <= e.lo1).length;
    if (e.polar) note = `  <-- POLAR: ${spread.toFixed(2)}deg of ground in a ${(e.lo1 - e.lo0).toFixed(0)}deg box, ${on}/${pts.length} on frame`;
    else if (on < pts.length) note = `  <-- loses ${pts.length - on} member(s) off frame`;
  }
  console.log(`  ${r.padEnd(24)} ${String(v.n).padStart(3)} places  ${v.placed} placed  ${v.inh} inherited${note}`);
}
const regions = Object.keys(census).filter((r) => r !== "(none)");
const W = 800, H = 420;
let total = 0;
const rows = [];
for (const rid of regions) {
  const ext = WG.regionExtent(rid, C.locations, { authored: RM[rid] || null });
  if (!ext) { rows.push([rid, "no extent"]); continue; }
  const toScreen = (lon, lat, w, h) => ({ x: ((lon - ext.lo0) / (ext.lo1 - ext.lo0)) * w, y: (1 - (lat - ext.la0) / (ext.la1 - ext.la0)) * h });
  const toWorld = (x, y, w, h) => ({ lon: ext.lo0 + (x / w) * (ext.lo1 - ext.lo0), lat: ext.la0 + (1 - y / h) * (ext.la1 - ext.la0) });
  const G = WG.makeGroundCost(terr, { ...WG.GROUND_COST.road, extent: ext });
  const t0 = Date.now();
  const R = WG.routeRoads(NET.roads, C.locations, { W, H, step: G.step, toScreen, toWorld, extent: ext, cell: 2 });
  const ms = Date.now() - t0;
  total += ms;
  if (!R) { rows.push([rid, "null"]); continue; }
  // does it BEND? routed px length against the straight px line between the same two dots
  let bends = 0, detour = [];
  for (const r of R.roads) {
    let len = 0;
    for (let i = 1; i < r.points.length; i++) len += Math.hypot(r.points[i].x - r.points[i - 1].x, r.points[i].y - r.points[i - 1].y);
    const a = r.points[0], b = r.points[r.points.length - 1];
    const straight = Math.hypot(b.x - a.x, b.y - a.y);
    const ratio = straight > 8 ? len / straight : 1;
    detour.push(ratio);
    if (ratio > 1.06) bends++;
  }
  const med = detour.slice().sort((x, y) => x - y)[Math.floor(detour.length / 2)] || 1;
  const worst = Math.max(1, ...detour);
  const trunked = R.roads.filter((r) => r.shared > 0.2).length;
  rows.push([rid, `${String(ms).padStart(5)}ms  ${String(R.roads.length).padStart(3)} roads (${R.roads.filter((r) => r.primary).length} primary / ${R.roads.filter((r) => r.track).length} track)  ${String(R.exits.length).padStart(2)} exits  unrouted ${R.unrouted}  bend>6% ${bends}  median detour ${med.toFixed(3)}  worst ${worst.toFixed(2)}  trunked ${trunked}`]);
}
for (const [a, b] of rows) console.log(`  ${a.padEnd(22)} ${b}`);
console.log(`\nTOTAL ${total}ms over ${regions.length} regions  ·  mean ${(total / regions.length).toFixed(0)}ms/region`);
