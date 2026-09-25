// SNG-654: for each of a save's holds, the best market per region by road — gross there vs here, and days.
// Usage: node po/tools/measure_routes.mjs [save path]
import { readFileSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const H = await import("../../engine/holdings.js");
const J = await import("../../engine/journey.js");
const C = await loadContentHeadless(); const L = C.locations; const econ = C.rules.economy;
const cfg = { ...econ.holdStore, features: econ.holdFeatures };
const ch = JSON.parse(readFileSync(process.argv[2] || "characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
for (const h of ch.holdings || []) {
  if (!h.store || !Object.keys(h.store).length || !L[h.locationId]) { console.log(`\n## ${h.name}: no store or not on the map`); continue; }
  const home = L[h.locationId].regionId; const here = H.storeWorth(h, { economy: econ, regionId: home, cfg });
  const d = J.roadDistances(h.locationId, L).dist || {};
  const best = {};
  for (const [id, days] of Object.entries(d)) { const reg = L[id]?.regionId; if (!reg || reg === home) continue; if (!(reg in best) || days < best[reg].days) best[reg] = { id, days }; }
  const rows = Object.entries(best).map(([reg, b]) => ({ reg, name: L[b.id]?.name, days: b.days, there: H.storeWorth(h, { economy: econ, regionId: reg, cfg }) }))
    .filter(r => r.there > here).sort((a, b) => a.days - b.days).slice(0, 6);
  console.log(`\n## ${h.name} (${home}) store ${JSON.stringify(h.store)} — here ${here}`);
  for (const r of rows) console.log(`  ${String(r.days.toFixed(0)).padStart(4)} days  ${r.reg.padEnd(24)} ${String(r.there).padStart(5)}  x${(r.there / here).toFixed(2)}  (${r.name})`);
  if (!rows.length) console.log("  no better market by road");
}