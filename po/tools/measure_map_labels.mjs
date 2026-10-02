/* ⛔ THE MAP, measured rather than waited for. Aevi's 09-29 work order §3 reads *"The map interface. Erik brings the
 * specifics from play"* — so this brings them instead.
 *
 * ⛑ THE LABEL DEFECT, PROVEN BOTH WAYS. `placeLabels` reserves a box from the width it is HANDED; the view handed it
 * `measureText(m.name)` and then drew `m.name + " +N"`. This drives the real function with both widths and reports
 * how many drawn labels overlap another drawn label in each case — the one-pass number is the defect, the two-pass
 * number is the fix.
 *
 * ⚠️ TEXT WIDTH IS APPROXIMATED, since node has no canvas. The approximation is stated and applied identically to
 * both runs, so it cannot favour either: what is being compared is one-pass against two-pass, not pixels against
 * pixels. The overlap it finds is the one visible in the screenshot.
 *
 *   node po/tools/measure_map_labels.mjs
 */
import { placeLabels } from "../../engine/worldmap.js";
import { regionExtent } from "../../engine/worldglobe.js";
import fs from "node:fs";

/* ⛔ THE AUTHORED REGION MAP IS NOT OPTIONAL. My first run passed `{}` and every one of the valley's 17 places landed
   at x≈9900 on an 800px canvas — the TWO LONGITUDE CONVENTIONS this repo has a note about: `regionExtent` without the
   authored centre normalises to ±180 while `worldPos.longitude` is unwrapped (249°, not −111°). The driver reported
   0 overlapping labels because it had placed nothing on the canvas at all, which is the shape of fixture that agrees
   with everything. The app passes `_regionMaps[regionId]`; so does this. */
const REGION_MAPS = JSON.parse(fs.readFileSync("content/packs/core/world/region_maps.json", "utf8"));

/* the region base's own projection, which is a plain linear map of the extent and needs no terrain asset:
     x = ((lon - lo0) / (lo1 - lo0)) * w
     y = (1 - (lat - la0) / (la1 - la0)) * h                     (engine/worldglobe.js, base.toScreen) */
const toScreen = (lon, lat, w, h, e) => ({
  x: ((lon - e.lo0) / (e.lo1 - e.lo0)) * w,
  y: (1 - (lat - e.la0) / (e.la1 - e.la0)) * h,
});
import { loadContentHeadless } from "../../tests/headless_content.mjs";

const CONTENT = await loadContentHeadless();
const W = 800, H = 420;                       // the canvas as index.html pins it

// ⚠️ 600 10px system-ui: digits and caps run wide, lowercase narrow. 5.1px/char is the mean over the real names
// below; the "+N" badge is what matters and it is measured the same way in both runs.
const widthOf = (s) => String(s).length * 5.1;

const overlaps = (boxes) => {
  let n = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) n++;
    }
  }
  return n;
};
const drawnBoxes = (marks, shown, hiddenBy) => marks.filter(m => shown.has(m.id)).map(m => {
  const text = m.name + (hiddenBy[m.id] ? ` +${hiddenBy[m.id]}` : "");
  const w = widthOf(text), y = m.y + 18;
  return { id: m.id, text, l: m.x - w / 2, r: m.x + w / 2, t: y - 10, b: y + 2 };
});

let worstRegion = null;
const regions = [...new Set(Object.values(CONTENT.locations).map(l => l?.regionId || l?.region).filter(Boolean))];
let totalOne = 0, totalTwo = 0, regionsWithOverlap = 0;

for (const regionId of regions) {
  const ext = regionExtent(regionId, CONTENT.locations, { authored: REGION_MAPS[regionId] || null });
  if (!ext) continue;
  const marks = [];
  for (const [id, l] of Object.entries(CONTENT.locations)) {
    if (!l?.worldPos || (l.regionId || l.region) !== regionId) continue;
    if (l.supersededBy) continue;
    const p = toScreen(l.worldPos.longitude, l.worldPos.colatitude - 90, W, H, ext);
    if (!p || p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20) continue;
    marks.push({ id, x: p.x, y: p.y, name: String(l.name || id).slice(0, 22), rank: l.waygate ? 1 : l.tier === "site" ? 3 : 2 });
  }
  if (marks.length < 2) continue;

  const boxesFor = (ms, by) => ms.map(m => ({ id: m.id, x: m.x, y: m.y + 18, w: widthOf(m.name + (by[m.id] ? ` +${by[m.id]}` : "")), h: 10, rank: m.rank }));

  /* ── as it shipped: one pass, measured WITHOUT the badge it then draws ── */
  const one = placeLabels(marks.map(m => ({ id: m.id, x: m.x, y: m.y + 18, w: widthOf(m.name), h: 10, rank: m.rank })));
  const oneBad = overlaps(drawnBoxes(marks, one.shown, one.hiddenBy));

  /* ── the fix: pass 1 decides the badges, pass 2 places at the drawn width ── */
  const p1 = placeLabels(boxesFor(marks, {}));
  const kept = marks.filter(m => p1.shown.has(m.id));
  const p2 = placeLabels(boxesFor(kept, p1.hiddenBy));
  const hid = { ...p1.hiddenBy };
  for (const m of kept) {
    if (p2.shown.has(m.id)) continue;
    const taker = p2.hiddenInto[m.id];
    const carry = (hid[m.id] || 0) + 1;
    delete hid[m.id];
    if (taker) hid[taker] = (hid[taker] || 0) + carry;
  }
  for (const id of Object.keys(hid)) if (!p2.shown.has(id)) delete hid[id];
  const twoBad = overlaps(drawnBoxes(marks, p2.shown, hid));

  totalOne += oneBad; totalTwo += twoBad;
  if (oneBad) regionsWithOverlap++;
  if (!worstRegion || oneBad > worstRegion.oneBad) worstRegion = { regionId, marks: marks.length, oneBad, twoBad, shown1: one.shown.size, shown2: p2.shown.size };

  // ⛔ NOTHING MAY VANISH UNCOUNTED: every place is either drawn or inside somebody's tally.
  const tallied = Object.values(hid).reduce((a, n) => a + n, 0);
  if (p2.shown.size + tallied !== marks.length) {
    console.log(`   ❌ ${regionId}: ${marks.length} places, ${p2.shown.size} drawn + ${tallied} tallied — ${marks.length - p2.shown.size - tallied} LOST`);
  }
}

console.log(`\n── label overlap across ${regions.length} regions, canvas ${W}×${H} ──`);
console.log(`   AS SHIPPED (one pass, badge unmeasured): ${totalOne} overlapping pair(s), in ${regionsWithOverlap} region(s)`);
console.log(`   WITH THE FIX (placed at the drawn width): ${totalTwo} overlapping pair(s)`);
if (worstRegion) {
  console.log(`\n   worst: ${worstRegion.regionId} — ${worstRegion.marks} places`);
  console.log(`      one pass : ${worstRegion.shown1} labels drawn, ${worstRegion.oneBad} overlapping pair(s)`);
  console.log(`      two pass : ${worstRegion.shown2} labels drawn, ${worstRegion.twoBad} overlapping pair(s)`);
}
console.log(`\n⚠️  and the canvas is pinned: index.html says width="800" height="420" with max-width:800px.`);
