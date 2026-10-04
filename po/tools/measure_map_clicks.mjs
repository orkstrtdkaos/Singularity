/* ⛔ WHAT A CLICK ON THE GROUND MAP WOULD HIT, measured before building the hit test — so the radius and the
 * spiderfy threshold are chosen from the world as it is rather than from the globe's constant.
 *
 * ⛑ THE GLOBE ALREADY HAS A HIT TEST: `nearest(mx, my)` in `wireWorldGlobe()`, a squared-distance scan with a 14px
 * radius. The region map has none and throws `marks416` away when it finishes painting. This asks what that same
 * 14px would do down here, where a region is 30° across instead of a planet.
 *
 *   node po/tools/measure_map_clicks.mjs
 */
import fs from "node:fs";
import { regionExtent } from "../../engine/worldglobe.js";
import { loadContentHeadless } from "../../tests/headless_content.mjs";

const CONTENT = await loadContentHeadless();
const REGION_MAPS = JSON.parse(fs.readFileSync("content/packs/core/world/region_maps.json", "utf8"));
const W = 800, H = 420, HIT = 14;          // the canvas as index.html pins it; the radius the globe uses

/* ⚠️ the authored region map is not optional — without it `regionExtent` normalises to ±180 while `worldPos`
   runs unwrapped, and every place lands at x≈9900 on an 800px canvas (the two-conventions trap). */
const toScreen = (lon, lat, w, h, e) => ({
  x: ((lon - e.lo0) / (e.lo1 - e.lo0)) * w,
  y: (1 - (lat - e.la0) / (e.la1 - e.la0)) * h,
});

const marksFor = (regionId) => {
  const ext = regionExtent(regionId, CONTENT.locations, { authored: REGION_MAPS[regionId] || null });
  if (!ext) return [];
  const out = [];
  for (const [id, l] of Object.entries(CONTENT.locations)) {
    if (!l?.worldPos || (l.regionId || l.region) !== regionId || l.supersededBy) continue;
    const p = toScreen(l.worldPos.longitude, l.worldPos.colatitude - 90, W, H, ext);
    if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20) continue;
    out.push({ id, name: String(l.name || id), x: p.x, y: p.y });
  }
  return out;
};

const regions = [...new Set(Object.values(CONTENT.locations).map(l => l?.regionId || l?.region).filter(Boolean))];

/* ══ 1 · how many places a single click cannot tell apart ══════════════════════════════════════════ */
let ambiguous = 0, placed = 0, worst = null, regionsWith = 0;
const clusterSizes = [];
for (const regionId of regions) {
  const ms = marksFor(regionId);
  if (ms.length < 2) continue;
  placed += ms.length;
  const near = new Set();
  for (let i = 0; i < ms.length; i++) {
    for (let j = i + 1; j < ms.length; j++) {
      if (Math.hypot(ms[i].x - ms[j].x, ms[i].y - ms[j].y) < HIT) { near.add(ms[i].id); near.add(ms[j].id); }
    }
  }
  if (near.size) regionsWith++;
  ambiguous += near.size;

  // ⛑ the clusters themselves, by single-link within the hit radius — these are what a fan has to open
  const seen = new Set();
  for (const m of ms) {
    if (seen.has(m.id)) continue;
    const stack = [m]; seen.add(m.id);
    for (let k = 0; k < stack.length; k++) {
      for (const o of ms) {
        if (seen.has(o.id)) continue;
        if (Math.hypot(o.x - stack[k].x, o.y - stack[k].y) < HIT) { stack.push(o); seen.add(o.id); }
      }
    }
    if (stack.length > 1) clusterSizes.push({ regionId, n: stack.length, names: stack.map(s => s.name) });
  }
  if (!worst || near.size > worst.near) worst = { regionId, total: ms.length, near: near.size };
}

console.log(`\n── a click on the ground map, at the globe's own ${HIT}px radius ──`);
console.log(`   ${placed} places drawn across ${regions.length} regions`);
console.log(`   ${ambiguous} of them (${(100 * ambiguous / placed).toFixed(1)}%) sit inside another place's click radius, in ${regionsWith} region(s)`);
console.log(`   worst: ${worst.regionId} — ${worst.near} of ${worst.total} places not separable by a click`);

/* ══ 2 · the fans, and whether a circle covers them ════════════════════════════════════════════════ */
clusterSizes.sort((a, b) => b.n - a.n);
console.log(`\n── what a fan would have to open ──`);
console.log(`   ${clusterSizes.length} cluster(s), sizes ${clusterSizes.map(c => c.n).join(", ")}`);
const biggest = clusterSizes[0]?.n || 0;
// ⛔ OverlappingMarkerSpiderfier's own threshold: a circle up to 8, a spiral above it.
console.log(`   biggest is ${biggest} — so a CIRCLE covers every case in the world today; the spiral (>8) has no population yet.`);
for (const c of clusterSizes.slice(0, 5)) console.log(`      ${c.regionId.padEnd(18)} ×${c.n}  ${c.names.join(" / ").slice(0, 92)}`);

/* ══ 3 · the valley, place by place, since that is the one Erik is looking at ══════════════════════ */
const v = marksFor("valley").sort((a, b) => a.x - b.x || a.y - b.y);
console.log(`\n── the Valley of Echoes, ${v.length} places ──`);
for (const m of v) {
  const near = v.filter(o => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < HIT).length;
  console.log(`   ${m.name.slice(0, 34).padEnd(36)}(${m.x.toFixed(0)},${m.y.toFixed(0)})${near ? `  ⚠ ${near} other(s) within ${HIT}px` : ""}`);
}
