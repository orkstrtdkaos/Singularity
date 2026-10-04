// X · the Crossing as a city, driven on the real places before a single pixel is painted.
import * as CP from "../engine/cityplan.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const mem = Object.keys(C.locations).filter(id => (C.locations[id]?.regionId || C.locations[id]?.region) === "the_center" && C.locations[id]?.worldPos);
const places = mem.map(id => {
  const l = C.locations[id];
  return { id, name: l.name || id, tier: l.tier, rho: Number(l.worldPos.colatitude), bearingDeg: Number(l.worldPos.longitude),
    big: id === "the_great_coliseum" };
});
const hub = C.locations.the_crossing;
const bearingOf = (id) => { const l = C.locations[id]; return l?.worldPos ? Number(l.worldPos.longitude) : null; };
const roadsOut = (hub.connections || []).filter(o => (C.locations[o]?.regionId || C.locations[o]?.region) !== "the_center" && C.locations[o]?.worldPos)
  .map(o => ({ to: o, name: C.locations[o]?.name || o, bearingDeg: bearingOf(o) }));
const axis = C.locations.the_axis_gate;
const gates = (axis.connections || []).filter(o => C.locations[o]?.worldPos && (C.locations[o]?.role === "gate" || /gate|waygate/.test(o)))
  .map(o => ({ to: o, name: C.locations[o]?.name || o, bearingDeg: bearingOf(o) }));
const W = 900, H = 560;
const plan = CP.cityPlan(places, { W, H, hallId: "the_crossing", roadsOut, gates, seed: "the_center" });
console.log(`hall at (${plan.cx}, ${plan.cy})  wall r=${plan.wallR.toFixed(0)}  rhoMax=${plan.rhoMax}`);
console.log(`\n${plan.marks.length} marks:`);
for (const m of plan.marks.slice().sort((a, b) => a.r - b.r)) {
  console.log(`  ${String(m.name).padEnd(30)} rho ${String(m.rho).padStart(5)}  bearing ${String(m.bearingDeg).padStart(6)}  ->  r ${m.r.toFixed(0).padStart(4)}px  (${m.x.toFixed(0)},${m.y.toFixed(0)})${m.hall ? "  HALL" : m.ward ? "  ward" : ""}`);
}
// nothing may overlap, and nothing may escape the wall
let worst = Infinity, worstPair = null;
for (let i = 0; i < plan.marks.length; i++) for (let j = i + 1; j < plan.marks.length; j++) {
  const a = plan.marks[i], b = plan.marks[j];
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (d < worst) { worst = d; worstPair = [a.name, b.name]; }
}
const outside = plan.marks.filter(m => Math.hypot(m.x - plan.cx, m.y - plan.cy) > plan.wallR).length;
console.log(`\nclosest pair: ${worst.toFixed(1)}px (${worstPair.join(" / ")})   outside the wall: ${outside}`);
console.log(`avenues: ${plan.avenues.length} (want 12)   gate ring: ${plan.poleRing.length}`);
console.log(`fabric: ${plan.fabric.rings.length} ring streets, ${plan.fabric.blocks.length} blocks, ${plan.fabric.blocks.filter(b=>b.kind==="garden").length} gardens, ${plan.fabric.blocks.filter(b=>b.kind==="courtyard").length} courtyards`);
// seeded: the same plan twice
const again = CP.cityPlan(places, { W, H, hallId: "the_crossing", roadsOut, gates, seed: "the_center" });
const same = JSON.stringify(plan.fabric.blocks) === JSON.stringify(again.fabric.blocks)
  && plan.marks.every((m, i) => Math.abs(m.x - again.marks[i].x) < 1e-9);
console.log(`deterministic: ${same}`);

// ---- the quarters outside the gates, from the tradition in that direction ----
const withLean = plan.avenues.map(a => {
  const l = C.locations[a.to];
  return { ...a, lean: CP.leanOf(l?.spectrum), toward: l?.betweenCrossingAnd || null };
});
const fb = CP.faubourgs(withLean, { cx: plan.cx, cy: plan.cy, wallR: plan.wallR, rimR: plan.rimR, seed: "the_center" });
console.log(`\n${fb.length} quarters outside the wall:`);
for (const q of fb.slice().sort((a,b)=>a.bearingDeg-b.bearingDeg)) {
  console.log(`  ${String(q.name).padEnd(16)} ${String(q.bearingDeg).padStart(5)}deg  toward ${String(q.toward||'-').padEnd(22)} ${String(q.lean?.key||'-').padEnd(24)} -> ${String(q.kind).padEnd(12)} ${q.huts.length} structures`);
}
const kinds = new Set(fb.map(q => q.kind));
console.log(`\ndistinct characters: ${kinds.size} of ${fb.length} roads — ${[...kinds].join(", ")}`);
const insideWall = fb.flatMap(q => q.huts).filter(h => Math.hypot(h.x - plan.cx, h.y - plan.cy) <= plan.wallR).length;
console.log(`structures inside the wall (want 0): ${insideWall}`);
const far = fb.flatMap(q => q.huts).filter(h => Math.hypot(h.x - plan.cx, h.y - plan.cy) > Math.min(900,560)/2).length;
console.log(`structures off the canvas (want 0): ${far}`);
