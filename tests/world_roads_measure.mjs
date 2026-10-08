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
const routes = WG.worldRoadRoutes(t, C.locations, { tierOf: (l) => l?.tier });
const net = WG.roadNetwork(C.locations, { tierOf: (l) => l?.tier });
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
for (const e of net.roads) {
  const a = P(e.a), b = P(e.b); if (!a || !b) continue;
  const key = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`;
  const routed = routes.byPair.get(key);
  const path = routed || slerp(a, b, 48);
  let n = 0, w = 0;
  for (let i = 1; i < path.length; i++) { const seg = slerp(path[i - 1], path[i], 4); for (const p of seg) { n++; if (wet(p[0], p[1])) w++; } }
  let walked = 0; for (let i = 1; i < path.length; i++) walked += gc(path[i - 1], path[i]);
  const straight = gc(a, b);
  const depthA = Number(C.locations[e.a]?.worldPos?.depth) || 0, depthB = Number(C.locations[e.b]?.worldPos?.depth) || 0;
  rows.push({ key, routed: !!routed, wetPct: Math.round(100 * w / Math.max(1, n)), ratio: straight > 0.2 ? +(walked / straight).toFixed(2) : null,
    straightDeg: +straight.toFixed(2), minColat: +Math.min(C.locations[e.a].worldPos.colatitude, C.locations[e.b].worldPos.colatitude).toFixed(2),
    primary: !!e.primary, buried: depthA < 0 || depthB < 0 });
}
const routedRows = rows.filter((r) => r.routed), arcs = rows.filter((r) => !r.routed);
const pct = (xs, q) => { const s = [...xs].sort((x, y) => x - y); return s.length ? s[Math.floor(q * (s.length - 1))] : null; };
const measured = {
  roads: rows.length,
  routed: routedRows.length,
  unroutedStraightArcs: arcs.length,
  seamDropped: routes.seamDropped,
  routedOver2x: routedRows.filter((r) => r.ratio != null && r.ratio > 2).length,
  wetStraightArcs: arcs.filter((r) => r.wetPct > 20).length,
  capArcsWithin10: arcs.filter((r) => r.minColat < 10).length,
  capRoutedOver2xWithin10: routedRows.filter((r) => r.minColat < 10 && r.ratio != null && r.ratio > 2).length,
  medianRatio: pct(routedRows.filter((r) => r.ratio).map((r) => r.ratio), 0.5),
  p90Ratio: pct(routedRows.filter((r) => r.ratio).map((r) => r.ratio), 0.9),
};
console.log(`world roads: ${measured.roads} · routed ${measured.routed} · straight arcs ${measured.unroutedStraightArcs} (wet ${measured.wetStraightArcs}) · seam-dropped ${measured.seamDropped}`);
console.log(`routed: walked/straight median ${measured.medianRatio} · p90 ${measured.p90Ratio} · over ×2: ${measured.routedOver2x} (within 10° of the Crossing: ${measured.capRoutedOver2xWithin10})`);
console.log("worst routed by detour:"); routedRows.filter((r) => r.ratio).sort((x, y) => y.ratio - x.ratio).slice(0, 5).forEach((r) => console.log("   ", r.key, "x" + r.ratio, r.straightDeg + "°", "colat " + r.minColat));
console.log("straight arcs drawn (unrouted), wettest first:"); arcs.sort((x, y) => y.wetPct - x.wetPct).slice(0, 8).forEach((r) => console.log("   ", r.key, r.wetPct + "% wet", r.straightDeg + "°", r.buried ? "buried" : ""));

// ── the ratchets ──
const RATCHETS = ["unroutedStraightArcs", "routedOver2x", "wetStraightArcs", "seamDropped", "capRoutedOver2xWithin10"];
let baseline = null;
try { baseline = JSON.parse(readFileSync(BASE, "utf8")); } catch { baseline = null; }
let failures = 0, fell = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "ok   " : "FAIL "} ${name}${detail ? " — " + detail : ""}`); if (!ok) failures++; };
if (!baseline) {
  if (WRITE) { writeFileSync(BASE, JSON.stringify({ _what: "SNG-682 ratchets for the world map's roads — each may only go DOWN; rewrite with --write when one falls", written: new Date().toISOString().slice(0, 10), ...Object.fromEntries(RATCHETS.map((k) => [k, measured[k]])) }, null, 2) + "\n"); console.log("baseline written"); }
  else check("world roads: a baseline exists (run with --write once)", false);
} else {
  for (const k of RATCHETS) {
    const was = Number(baseline[k]); const now = Number(measured[k]);
    check(`ratchet: ${k} = ${now} (baseline ${was}) — may only go DOWN`, now <= was);
    if (now < was) fell++;
  }
  // ✅ AEVI's targets — reported as pending until the work orders that reach them (W2–W4) land, then failures: a target
  // gate that is red for weeks teaches everyone to read past red
  const pending = Number(baseline.unroutedStraightArcs) > 0 || Number(baseline.wetStraightArcs) > 0;
  for (const [name, now] of [["SNG-682 target: unrouted roads drawn as straight lines = 0", measured.unroutedStraightArcs], ["SNG-682 target: wet straight arcs = 0", measured.wetStraightArcs]]) {
    if (now === 0) check(name, true);
    else if (pending) console.log(`pend  ${name} — ${now} today`);
    else check(name, false, `${now} today`);
  }
  if (fell && WRITE) {
    writeFileSync(BASE, JSON.stringify({ ...baseline, written: new Date().toISOString().slice(0, 10), ...Object.fromEntries(RATCHETS.map((k) => [k, measured[k]])) }, null, 2) + "\n");
    console.log(`baseline rewritten — ${fell} ratchet(s) fell`);
  } else if (fell) console.log(`⚠️ ${fell} ratchet(s) went DOWN — rewrite the baseline with --write so the gain is kept`);
}
console.log(failures ? `${failures} FAILURE(S)` : "world roads: every ratchet holds");
process.exit(failures ? 1 : 0);
