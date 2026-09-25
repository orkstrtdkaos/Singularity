import { readFileSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CV = await import("../../engine/caravan.js");
const H = await import("../../engine/holdings.js");
const J = await import("../../engine/journey.js");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
const L = C.locations;
for (const h of ch.holdings || []) {
  const reg = L[h.locationId]?.regionId || null;
  let ex; try { ex = CV.storeExits(ch, h, { cfg, economy: econ, locations: L, regionId: reg, companyCut: 0.2 }); } catch (e) { console.log(h.name, "ERR", e.message); continue; }
  console.log(`\n## ${h.name} @ ${h.locationId} (${reg}) store=${JSON.stringify(h.store)} best=${ex.best?.id}`);
  for (const r of ex.rows) console.log(`  ${r.id.padEnd(34)} gross ${String(r.gross).padStart(5)} net ${String(r.net).padStart(5)} days ${String(r.days).padStart(6)} risk ${r.risk} perPass ${r.perPass ?? ""}`);
}
// world: nearest-market road days between regions, from each region's places
const byReg = {}; for (const [id, l] of Object.entries(L)) if (l?.regionId) (byReg[l.regionId] ||= []).push(id);
const regs = Object.keys(byReg); console.log("\nregions:", regs.length, regs.join(", "));
const rows = [];
for (const a of regs) { const d = J.roadDistances(byReg[a][0], L); for (const b of regs) { if (a >= b) continue; const m = Math.min(...byReg[b].map(p => d?.[p]?.days ?? d?.dist?.[p] ?? Infinity)); rows.push([a, b, m]); } }
const ds = rows.map(r => r[2]).filter(Number.isFinite).sort((x, y) => x - y);
const q = p => ds[Math.floor(p * (ds.length - 1))];
console.log("region-pair road days: n", ds.length, "min", ds[0]?.toFixed(1), "p25", q(.25)?.toFixed(1), "median", q(.5)?.toFixed(1), "p75", q(.75)?.toFixed(1), "max", ds.at(-1)?.toFixed(1));
console.log("sample", JSON.stringify(Object.entries(J.roadDistances(byReg[regs[0]][0], L) || {}).slice(0, 2)).slice(0, 300));