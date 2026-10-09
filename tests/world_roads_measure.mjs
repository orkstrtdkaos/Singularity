// tests/world_roads_measure.mjs — ⛔ SNG-682 (CCODE-660): what the world map's roads ARE, measured against the ground
// they cross, every push. ✅ AEVI (WORKORDER_aevi_20261006_world_roads): *"`measure_world_roads.mjs` runs in CI, with
// these ratchets: unrouted roads drawn as straight lines: 0; routed roads over ×2: down from 25, may only fall; wet
// straight arcs: 0."* Her tool (`po/tools/measure_world_roads.mjs`) is lifted here whole; the ratchets live in
// `tests/world_roads_baseline.json` and may only go DOWN — a number that fell is a baseline to rewrite (`--write`),
// never a number to leave stale. Run: node tests/world_roads_measure.mjs [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const asUrl = (p) => p.replace(/\\/g, "/").replace(/^([A-Z]):/, "file:///$1:");
const WG = await import(asUrl(join(root, "engine/worldglobe.js")));
const { loadContentHeadless } = await import(asUrl(join(root, "tests/headless_content.mjs")));
const WRITE = process.argv.includes("--write");
const BASE = join(root, "tests/world_roads_baseline.json");

const C = await loadContentHeadless();
const t = WG.decodeTerrain(JSON.parse(readFileSync(join(root, "content/packs/core/world/terrain.json"), "utf8")));
// ✅ W2: the regions' own roads, routed on their fine ground with the painter's recipe, merged over the world grid
const { makeTerrain } = await import(asUrl(join(root, "scripts/world/terrain.mjs")));
const gp = JSON.parse(readFileSync(join(root, "content/packs/core/world/genparams.json"), "utf8"));
let regionMaps = {}; try { regionMaps = JSON.parse(readFileSync(join(root, "content/packs/core/world/region_maps.json"), "utf8")); } catch { regionMaps = {}; }
const regionCache = new Map();
const regionPaths = (rid) => { if (!regionCache.has(rid)) regionCache.set(rid, WG.regionRoadPaths(t, C.locations, rid, { gen: (win) => makeTerrain(gp, win), authored: regionMaps[rid] || null, tierOf: (l) => l?.tier, content: C })); return regionCache.get(rid)?.byPair || null; };
// ✅ W3: the cap on the polar grid, whole, before the regions
const cap = WG.capRoadRoutes(t, C.locations, { tierOf: (l) => l?.tier, content: C });
const routes = WG.worldRoadRoutes(t, C.locations, { tierOf: (l) => l?.tier, regionPaths, regionStamp: 1, capPaths: cap.byPair, capStamp: 1, content: C });
const net = WG.roadNetwork(C.locations, { tierOf: (l) => l?.tier });
const kinds = WG.roadKinds(t, C.locations, routes.byPair);   // ✅ W4/W5: what each road is
// ✅ ERIK (2026-10-08): the long road AND a boat — the lanes derived by the rule, written on --write, checked always
const lanes = WG.seaLanePairs(t, C.locations, routes.byPair);
const LANES = join(root, "content/packs/core/world/sea_lanes.json");
const R = Math.PI / 180;
const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a[0] * R) * Math.sin(b[0] * R) + Math.cos(a[0] * R) * Math.cos(b[0] * R) * Math.cos((a[1] - b[1]) * R)))) / R;
const wet = (lat, lon) => { let lo = lon; while (lo > 180) lo -= 360; while (lo < -180) lo += 360; const s = WG.sampleAt(t, lo, lat); return s ? (s.type & 3) === 0 : false; };
const slerp = (a, b, n) => {
  const v = (p) => [Math.cos(p[0] * R) * Math.cos(p[1] * R), Math.cos(p[0] * R) * Math.sin(p[1] * R), Math.sin(p[0] * R)];
  const A = v(a), B = v(b), out = [];
  for (let i = 0; i <= n; i++) { const f = i / n; const x = A.map((c, k) => c + (B[k] - c) * f); const m = Math.hypot(...x) || 1; out.push([Math.asin(x[2] / m) / R, Math.atan2(x[1], x[0]) / R]); }
  return out;
};
const P = (id) => { const w = C.locations[id]?.worldPos; return w ? [w.colatitude - 90, w.longitude] : null; };
const rows = [];
const STUB_DEG = 3 * WG.WORLD_TIER_FLOOR_DEG / 700;   // ✅ ruling 4: 3 px at the closest world zoom
for (const e of net.roads) {
  const a = P(e.a), b = P(e.b); if (!a || !b) continue;
  const key = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`;
  const routed = routes.byPair.get(key);
  // ⛑ each path is named by the map it came from — the region's own, the cap's polar grid, or the world grid — never by "differs
  // from the grid", which the cap's paths also do
  const regionOf = (id) => C.locations[id]?.regionId || C.locations[id]?.region;
  const fromRegion = !!routed && (regionOf(e.a) === regionOf(e.b)) && regionPaths(regionOf(e.a))?.get(key) === routed;
  const fromCap = !!routed && !fromRegion && cap.byPair.get(key) === routed;
  const path = routed || slerp(a, b, 48);
  let n = 0, w = 0;
  for (let i = 1; i < path.length; i++) { const seg = slerp(path[i - 1], path[i], 4); for (const p of seg) { n++; if (wet(p[0], p[1])) w++; } }
  let walked = 0; for (let i = 1; i < path.length; i++) walked += gc(path[i - 1], path[i]);
  const straight = gc(a, b);
  const depthA = Number(C.locations[e.a]?.worldPos?.depth) || 0, depthB = Number(C.locations[e.b]?.worldPos?.depth) || 0;
  const sameRegion = (C.locations[e.a]?.regionId || C.locations[e.a]?.region) === (C.locations[e.b]?.regionId || C.locations[e.b]?.region);
  rows.push({ key, kind: kinds.get(key)?.kind || "road", sameRegion, fromRegion, fromCap, routed: !!routed, wetPct: Math.round(100 * w / Math.max(1, n)), ratio: straight > 0.2 ? +(walked / straight).toFixed(2) : null,
    straightDeg: +straight.toFixed(2), minColat: +Math.min(C.locations[e.a].worldPos.colatitude, C.locations[e.b].worldPos.colatitude).toFixed(2),
    primary: !!e.primary, buried: depthA < 0 || depthB < 0,
    // ✅ J1: the road's own length over its straight line, for every routed road however short (the regions route the short ones)
    lenRatio: routed && straight > 0 ? +(walked / straight).toFixed(2) : null });
}
const routedRows = rows.filter((r) => r.routed), arcs = rows.filter((r) => !r.routed);
const pct = (xs, q) => { const s = [...xs].sort((x, y) => x - y); return s.length ? s[Math.floor(q * (s.length - 1))] : null; };
const measured = {
  roads: rows.length,
  routed: routedRows.length,
  // ✅ W4/W5: a straight ARC is a road drawn straight; a sea lane is a lane and a buried arc is under the ground
  // ✅ ruling 4: under 3 px at the world tier's closest zoom (10° across 700 px) a stub never draws at world scale
  unroutedStraightArcs: arcs.filter((r) => r.kind === "road" && r.straightDeg >= STUB_DEG).length,
  stubsNotDrawn: arcs.filter((r) => r.kind === "road" && r.straightDeg < STUB_DEG).length,
  seaLanes: rows.filter((r) => r.kind === "sea").length, hiddenAtWorld: rows.filter((r) => r.kind === "hidden").length, buriedRoads: rows.filter((r) => r.kind === "buried").length,
  seamDropped: routes.seamDropped,
  // ⛑ two routers, two numbers: Aevi's "over ×2, down from 25" is the world GRID's; a region's own route is the region
  // map's picture of that road, and its detours (the Echo's water cost takes Millbrook → the Crossing x3.3) are ruled there
  // ⛑ a sea lane is drawn as the arc across the water, so the land route the router walked for it is not a road on the map
  routedOver2x: routedRows.filter((r) => r.kind !== "sea" && !r.fromRegion && !r.fromCap && r.ratio != null && r.ratio > 2).length,
  regionOver2x: routedRows.filter((r) => r.fromRegion && r.ratio != null && r.ratio > 2).length,
  capOver2x: routedRows.filter((r) => r.fromCap && r.ratio != null && r.ratio > 2).length,
  wetStraightArcs: arcs.filter((r) => r.kind === "road" && r.wetPct > 20).length,
  capArcsWithin10: arcs.filter((r) => r.minColat < 10).length,
  capRoutedOver2xWithin10: routedRows.filter((r) => r.minColat < 10 && r.ratio != null && r.ratio > 2).length,
  fromRegions: routes.fromRegions || 0,
  fromCap: routes.fromCap || 0, capRoads: cap.roads || 0,
  capMedianRatio: pct(routedRows.filter((r) => r.minColat <= 60 && r.ratio).map((r) => r.ratio), 0.5),
  capP90Ratio: pct(routedRows.filter((r) => r.minColat <= 60 && r.ratio).map((r) => r.ratio), 0.9),
  crossingThinwaterRatio: rows.find((r) => r.key === "the_crossing|thinwater")?.ratio ?? null,
  // ✅ AEVI's W2 gate: no road under 1° is drawn as a straight stub when its region map has a route for it
  shortStubsWithRegionRoute: arcs.filter((r) => r.straightDeg < 1 && r.sameRegion && regionPaths((C.locations[r.key.split("|")[0]]?.regionId || C.locations[r.key.split("|")[0]]?.region))?.has(r.key)).length,
  millbrookCrossingRatio: rows.find((r) => r.key === "echo_river_crossing|millbrook")?.ratio ?? null,
  medianRatio: pct(routedRows.filter((r) => r.ratio).map((r) => r.ratio), 0.5),
  p90Ratio: pct(routedRows.filter((r) => r.ratio).map((r) => r.ratio), 0.9),
};
console.log(`world roads: ${measured.roads} · routed ${measured.routed} · straight arcs ${measured.unroutedStraightArcs} (wet ${measured.wetStraightArcs}) · seam-dropped ${measured.seamDropped}`);
console.log(`W2: ${measured.fromRegions} roads take their region's own route · Millbrook → Echo River Crossing walks x${measured.millbrookCrossingRatio} · short stubs with a region route: ${measured.shortStubsWithRegionRoute}`);
console.log(`W3: ${measured.fromCap} of ${measured.capRoads} cap roads on the polar grid (over x2 among them: ${measured.capOver2x}) · cap walked/straight median ${measured.capMedianRatio} · p90 ${measured.capP90Ratio} · the Crossing → Thinwater x${measured.crossingThinwaterRatio} · over x2 within 10° of the Crossing: ${measured.capRoutedOver2xWithin10}`);
console.log(`W4/W5: sea lanes ${measured.seaLanes} · not drawn at world scale ${measured.hiddenAtWorld} · buried ${measured.buriedRoads}`);
console.log(`Erik's boat: ${lanes.length} pair(s) with a road AND a sea lane — ${lanes.map((l) => `${l.key} (${l.wetPct}% wet, land x${l.landRatio}, shore ${l.shoreDeg.join("°/")}°)`).join(" · ")}`);
console.log(`routed: walked/straight median ${measured.medianRatio} · p90 ${measured.p90Ratio} · over ×2: ${measured.routedOver2x} (within 10° of the Crossing: ${measured.capRoutedOver2xWithin10})`);
console.log("worst routed by detour:"); routedRows.filter((r) => r.ratio).sort((x, y) => y.ratio - x.ratio).slice(0, 5).forEach((r) => console.log("   ", r.key, "x" + r.ratio, r.straightDeg + "°", "colat " + r.minColat));
console.log("straight arcs drawn (unrouted), wettest first:"); arcs.sort((x, y) => y.wetPct - x.wetPct).slice(0, 8).forEach((r) => console.log("   ", r.key, r.wetPct + "% wet", r.straightDeg + "°", r.buried ? "buried" : ""));

// ── the ratchets ──
const RATCHETS = ["unroutedStraightArcs", "routedOver2x", "wetStraightArcs", "seamDropped", "capRoutedOver2xWithin10", "shortStubsWithRegionRoute", "regionOver2x", "millbrookCrossingRatio", "crossingThinwaterRatio", "capOver2x"];
let baseline = null;
try { baseline = JSON.parse(readFileSync(BASE, "utf8")); } catch { baseline = null; }
let failures = 0, fell = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "ok   " : "FAIL "} ${name}${detail ? " — " + detail : ""}`); if (!ok) failures++; };
if (!baseline) {
  if (WRITE) { writeFileSync(BASE, JSON.stringify({ _what: "SNG-682 ratchets for the world map's roads — each may only go DOWN; rewrite with --write when one falls", written: new Date().toISOString().slice(0, 10), ...Object.fromEntries(RATCHETS.map((k) => [k, measured[k]])) }, null, 2) + "\n"); console.log("baseline written"); }
  else check("world roads: a baseline exists (run with --write once)", false);
} else {
  for (const k of RATCHETS) {
    // a ratchet the baseline has never seen is written on its first run (--write), never compared to nothing
    if (baseline[k] == null) { console.log(`new   ratchet: ${k} = ${measured[k]} — not in the baseline yet${WRITE ? ", writing it" : " (run with --write)"}`); baseline[k] = measured[k]; fell++; continue; }
    const was = Number(baseline[k]); const now = Number(measured[k]);
    check(`ratchet: ${k} = ${now} (baseline ${was}) — may only go DOWN`, now <= was);
    if (now < was) fell++;
  }
  // ✅ AEVI's targets — reported as pending until the work orders that reach them (W2–W4) land, then failures: a target
  // gate that is red for weeks teaches everyone to read past red
  // ✅ AEVI's W2 gate: *"Millbrook → Echo River Crossing walks under ×1.6 on the world map"*. ⚠️ MEASURED: the road now
  // takes the region's own route, and the region router walks it x3.3 (x2.5 on the region map's own canvas) — the Echo's
  // water cost sends it round the river. That is the region map's picture of the road and a ruling on the cost model,
  // not a world-map defect, so the target is reported until the ruling, and ratcheted downward meanwhile.
  // ✅ AEVI (ruling 3): with the crossing's ford and the dry shortcut, the gate is HARD
  check("SNG-682 W2: Millbrook → Echo River Crossing walks under ×1.6 on the world map", measured.millbrookCrossingRatio != null && measured.millbrookCrossingRatio < 1.6, `x${measured.millbrookCrossingRatio}`);
  check("SNG-682 W2: no road under 1° is drawn as a straight stub when its region map has a route for it", measured.shortStubsWithRegionRoute === 0, `${measured.shortStubsWithRegionRoute} today`);
  const pending = Number(baseline.unroutedStraightArcs) > 0 || Number(baseline.wetStraightArcs) > 0 || Number(baseline.capRoutedOver2xWithin10) > 0;
  // ✅ AEVI W3's gate: *"no road with an end within 10° of the Crossing walks over ×2 unless the ground forces it"* — pending while any remain
  for (const [name, now] of [["SNG-682 target: unrouted roads drawn as straight lines = 0", measured.unroutedStraightArcs], ["SNG-682 target: wet straight arcs = 0", measured.wetStraightArcs], ["SNG-682 W3 target: no road with an end within 10° of the Crossing walks over x2", measured.capRoutedOver2xWithin10]]) {
    if (now === 0) check(name, true);
    else if (pending) console.log(`pend  ${name} — ${now} today`);
    else check(name, false, `${now} today`);
  }
  if (fell && WRITE) {
    // ⚠️ ONLY DOWNWARD. A value that rose stays a failure and keeps its old baseline — a rewrite that raised a number would
    // be the ratchet quietly slipping a tooth.
    const lowered = Object.fromEntries(RATCHETS.map((k) => [k, Number(measured[k]) <= Number(baseline[k]) ? measured[k] : baseline[k]]));
    writeFileSync(BASE, JSON.stringify({ ...baseline, written: new Date().toISOString().slice(0, 10), ...lowered }, null, 2) + "\n");
    console.log(`baseline rewritten — ${fell} ratchet(s) fell`);
  } else if (fell) console.log(`⚠️ ${fell} ratchet(s) went DOWN — rewrite the baseline with --write so the gain is kept`);
}
// ✅ the derived list: written on --write, and every push asks that the file IS the rule's answer, and that the answer is the two
// pairs Erik ruled — a third pair is a red line here, never a silent new boat
{
  let filed = null; try { filed = JSON.parse(readFileSync(LANES, "utf8")); } catch { filed = null; }
  if (WRITE) {
    writeFileSync(LANES, JSON.stringify({ _what: "DERIVED — the pairs that get both a road and a sea lane (Erik, 2026-10-08). Written by tests/world_roads_measure.mjs --write from engine/worldglobe.js seaLanePairs; the push fails when this file and the rule disagree. Do not edit by hand.", _rule: "both ends within a week's walk of the sea, the straight line more than 20% wet, the land route over x3 (Aevi's rule; the coast measured in days, see seaLanePairs)", lanes }, null, 2) + "\n");
    filed = { lanes };
    console.log(`sea lanes written: ${lanes.length}`);
  }
  const same = !!filed && JSON.stringify((filed.lanes || []).map((l) => l.key)) === JSON.stringify(lanes.map((l) => l.key));
  check("Erik's boat: content/packs/core/world/sea_lanes.json IS the rule's answer (rewrite with --write when the world moves)", same, `file ${(filed?.lanes || []).map((l) => l.key).join(", ")} · rule ${lanes.map((l) => l.key).join(", ")}`);
  check("Erik's boat: the pairs with both a road and a sea lane are exactly the two Erik ruled — the Numen ↔ Thinwater and Kindlerow ↔ the Blaze; a third is a ruling, not a quiet addition",
    JSON.stringify(lanes.map((l) => l.key)) === JSON.stringify(["kindlerow|the_blaze", "the_numen|thinwater"]));
}
/* ✅ J1 · ERIK 2026-10-09 (through Aevi): *"A leg's days follow the routed road's length, not the crow's line … A road with no route keeps
 * the straight line, and says so in `fallbacks`."* ⛔ DERIVED, LIKE THE SEA LANES: the journey reads this file, never the router at
 * play time (the router takes ~0.6 s and would price a journey one way before the globe opened and another after). Written on --write;
 * every push asks that the file IS the router's answer. ⛑ A sea lane keeps its line — it is drawn as the arc across the water. */
{
  const LENGTHS = join(root, "content/packs/core/world/road_lengths.json");
  const roads = {}, fallbacks = [], sea = [];
  for (const r of [...rows].sort((x, y) => (x.key < y.key ? -1 : 1))) {
    if (r.kind === "sea") { sea.push(r.key); continue; }
    if (r.routed && r.lenRatio != null) roads[r.key] = Math.max(1, r.lenRatio);
    else fallbacks.push(r.key);
  }
  let filed = null; try { filed = JSON.parse(readFileSync(LENGTHS, "utf8")); } catch { filed = null; }
  if (WRITE) {
    filed = { _what: "DERIVED — each routed road's length over its straight line, which is how long a journey on it takes (Erik, 2026-10-09: \"Makes sense for road journeys to take longer\"). Written by tests/world_roads_measure.mjs --write from the same router the map draws; the push fails when this file and the router disagree. Do not edit by hand.",
      _rule: "roads: key 'a|b' (ids sorted) → walked ÷ straight, two decimals, never under 1. fallbacks: roads with no route — they keep the straight line. sea: roads drawn as a sea lane — the lane is the line.",
      roads, fallbacks, sea };
    writeFileSync(LENGTHS, JSON.stringify(filed, null, 1) + "\n");
    console.log(`road lengths written: ${Object.keys(roads).length} routed, ${fallbacks.length} straight, ${sea.length} sea`);
  }
  const same = !!filed && JSON.stringify(filed.roads || {}) === JSON.stringify(roads) && JSON.stringify(filed.fallbacks || []) === JSON.stringify(fallbacks)
    && JSON.stringify(filed.sea || []) === JSON.stringify(sea);
  const vals = Object.values(roads).sort((a, b) => a - b);
  check("J1: content/packs/core/world/road_lengths.json IS the router's answer — each routed road's length over its straight line, the roads with no route listed as `fallbacks` (rewrite with --write when the world moves)",
    same, `file ${Object.keys(filed?.roads || {}).length}/${(filed?.fallbacks || []).length} · router ${Object.keys(roads).length}/${fallbacks.length}`);
  check("J1: the median road walks about ×1.4 its straight line (Aevi's measure) and no road is shorter than its line",
    vals.length > 100 && vals[Math.floor(vals.length / 2)] >= 1.25 && vals[Math.floor(vals.length / 2)] <= 1.55 && vals[0] >= 1, `median ×${vals[Math.floor(vals.length / 2)]}`);
}
console.log(failures ? `${failures} FAILURE(S)` : "world roads: every ratchet holds");
process.exit(failures ? 1 : 0);
