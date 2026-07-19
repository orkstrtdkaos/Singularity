// substrate_field_probe.mjs — the §9b field model, run as a REPORT rather than shipped.
// Kept persistent so the invariant table can be re-measured on demand and so the model can be
// argued with before it is built into the engine. `node scripts/substrate_field_probe.mjs`.
//
// DISTANCE BASIS: shortest path over CONNECTIONS, each edge weighted by coordinate distance.
// This is the synthesis of the proposal's own two halves: §3 proved raw coordinates are the wrong
// DRIVER (hand-placed for legibility; ent_deepwood and the_lampless_market share (40,300) while
// being unconnected and in different regions — euclidean says full bleed, which is wrong). §4 proved
// connections are the right topology. Weighting graph edges by coordinate distance keeps the 26
// authored `radius` values meaningful in the units they were written in, while travel adjacency —
// not the flat map — decides what reaches what.
//
// CALIBRATION: renormalize per region so the region mean equals its authored value EXACTLY.
// Invariant 2 then holds by construction rather than by tuning, which is what makes the untuned
// falloff scales safe to ship: they change the SHAPE within a region, never the regional calibration.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const R = join(import.meta.dirname, "..");
const model = JSON.parse(readFileSync(`${R}/content/packs/core/rules/the_substrate.json`, "utf8"));
const d = `${R}/content/packs/valley/locations`;
const L = readdirSync(d).filter(x => x.endsWith(".json")).map(x => JSON.parse(readFileSync(`${d}/${x}`, "utf8")));
const byId = Object.fromEntries(L.map(l => [l.id, l]));
const base = model.substrateDensity || {};
const SUPPORT = 2.5;

const adj = {};
const xy = l => [l.map?.x ?? 0, l.map?.y ?? 0];
const edgeLen = (a, b) => Math.hypot(xy(a)[0] - xy(b)[0], xy(a)[1] - xy(b)[1]);
for (const l of L) {
  adj[l.id] = adj[l.id] || new Map();
  for (const c of l.connections || []) {
    const to = typeof c === "string" ? c : (c.to || c.id || c.locationId);
    if (!to || !byId[to]) continue;
    const w = edgeLen(l, byId[to]);
    adj[l.id].set(to, w);
    (adj[to] = adj[to] || new Map()).set(l.id, w);
  }
}

/** Dijkstra from a source, bounded by maxDist (compact support). Returns Map<id, pathDistance>. */
function reach(fromId, maxDist) {
  const dist = new Map([[fromId, 0]]);
  const pq = [[0, fromId]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dd, n] = pq.shift();
    if (dd > (dist.get(n) ?? Infinity)) continue;
    for (const [m, w] of adj[n] || []) {
      const nd = dd + w;
      if (nd > maxDist) continue;
      if (nd < (dist.get(m) ?? Infinity)) { dist.set(m, nd); pq.push([nd, m]); }
    }
  }
  return dist;
}

export function resolveField() {
  const sources = L.filter(l => l.substrateSource && Number.isFinite(Number(l.substrateSource.radius)));
  const pool = new Map(), sink = new Map();
  for (const s of sources) {
    const src = s.substrateSource;
    const radius = Number(src.radius);
    const ambient = base[s.regionId];
    if (typeof ambient !== "number") continue;
    const peak = Number(src.strength) - ambient;      // delta AT the source, vs its OWN region's ambient
    for (const [id, pd] of reach(s.id, radius * SUPPORT)) {
      const delta = peak * Math.exp(-pd / radius);
      if (src.kind === "sink") sink.set(id, Math.max(sink.get(id) || 0, -delta));
      else pool.set(id, Math.max(pool.get(id) || 0, delta));
    }
  }
  // raw field
  const raw = new Map();
  for (const l of L) {
    const b = base[l.regionId];
    if (typeof b !== "number") continue;
    raw.set(l.id, b + (pool.get(l.id) || 0) - (sink.get(l.id) || 0));
  }
  // Per-region renormalisation, applied ONLY to locations a source actually touched.
  // Shifting every location would restore the regional mean but violate invariant 3 — a place far
  // from every source must resolve to its region's ambient EXACTLY, and a global shift moves it.
  // Correcting only the affected set satisfies 2 and 3 together: untouched ground stays ambient,
  // and the places that rose or fell carry the correction that keeps the region's mean honest.
  const groups = {};
  for (const l of L) if (raw.has(l.id)) (groups[l.regionId] = groups[l.regionId] || []).push(l.id);
  const touched = id => (pool.get(id) || 0) !== 0 || (sink.get(id) || 0) !== 0;
  const out = new Map();
  for (const [rg, ids] of Object.entries(groups)) {
    const hit = ids.filter(touched);
    if (!hit.length) { for (const id of ids) out.set(id, raw.get(id)); continue; }
    const mean = ids.reduce((a, id) => a + raw.get(id), 0) / ids.length;
    const shift = (base[rg] - mean) * ids.length / hit.length;   // whole correction, borne by the touched
    for (const id of ids) out.set(id, Math.max(0, Math.min(1, raw.get(id) + (touched(id) ? shift : 0))));
  }
  return { field: out, raw, sources };
}

const { field, sources } = resolveField();

console.log("=== INVARIANT CHECKS (§9b) ===\n");

// 1. pool above its region's authored density; sink below
let v1 = 0;
for (const s of sources) {
  const b = base[s.regionId], got = field.get(s.id);
  if (got == null || typeof b !== "number") continue;
  const ok = s.substrateSource.kind === "pool" ? got > b : got < b;
  if (!ok) { v1++; console.log(`  [1] VIOLATION ${s.id} (${s.substrateSource.kind}, ${s.regionId}) authored ${b} -> ${got.toFixed(3)}`); }
}
console.log(`1. pools rise / sinks fall: ${sources.length - v1}/${sources.length} correct${v1 ? "" : "  OK"}`);

// 2. regional calibration
let worst = 0, sum = 0, n = 0;
const groups = {};
for (const l of L) if (field.has(l.id)) (groups[l.regionId] = groups[l.regionId] || []).push(field.get(l.id));
for (const [rg, vs] of Object.entries(groups)) {
  const b = base[rg]; if (typeof b !== "number") continue;
  const drift = Math.abs(vs.reduce((a, x) => a + x, 0) / vs.length - b);
  worst = Math.max(worst, drift); sum += drift; n++;
}
console.log(`2. regional calibration: mean drift ${(sum / n).toFixed(4)}, worst ${worst.toFixed(4)}  (REV3's withdrawn run: 0.059)`);

// 3. distance matters and ends
const far = L.filter(l => field.has(l.id) && Math.abs(field.get(l.id) - base[l.regionId]) < 1e-9);
console.log(`3. distance ends: ${far.length} location(s) sit exactly at their region ambient (untouched by any source)`);
const varied = L.filter(l => field.has(l.id) && Math.abs(field.get(l.id) - base[l.regionId]) > 0.005);
console.log(`   locations with real local variation: ${varied.length}/${L.length}`);

// 6. every location resolves
const unresolved = L.filter(l => !field.has(l.id));
console.log(`6. every location resolves: ${L.length - unresolved.length}/${L.length}${unresolved.length ? " MISSING: " + unresolved.map(l => l.id).join(", ") : "  OK"}`);

// cliffs — the metric REV3 reported getting worse
function cliffs(get) {
  let mx = 0, tot = 0, c = 0;
  for (const l of L) for (const [to] of adj[l.id] || []) {
    if (l.id >= to) continue;
    if (byId[l.id].regionId === byId[to].regionId) continue;   // a cliff is a BORDER step
    const a = get(l.id), b = get(to);
    if (a == null || b == null) continue;
    const g = Math.abs(a - b); mx = Math.max(mx, g); tot += g; c++;
  }
  return { worst: mx.toFixed(3), mean: (tot / c).toFixed(3) };
}
const before = cliffs(id => base[byId[id].regionId]);
const after = cliffs(id => field.get(id));
console.log(`\ncliffs across connected CROSS-REGION pairs — region-flat: worst ${before.worst} mean ${before.mean}  ->  field: worst ${after.worst} mean ${after.mean}`);

console.log("\n=== the sites REV3 named (its numbers are WITHDRAWN; these are this model's) ===");
for (const id of ["the_blaze", "the_great_engine", "the_heartroot", "sunken_choir"]) {
  const l = byId[id]; if (!l) continue;
  console.log(`  ${id.padEnd(18)} region ${String(base[l.regionId]).padEnd(5)} -> ${field.get(id).toFixed(3)}   ${l.substrateSource ? l.substrateSource.kind : "(not a source)"}`);
}
console.log("\ncollision check — unconnected places sharing (40,300):");
for (const id of ["ent_deepwood", "the_lampless_market"]) console.log(`  ${id.padEnd(20)} ${field.get(id).toFixed(3)} (region ambient ${base[byId[id].regionId]})`);
