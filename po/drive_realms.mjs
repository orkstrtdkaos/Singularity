// R4.1/R4.2/R4.3 driven on Silas's real save, against Aevi's own measured table.
import { readFileSync } from "node:fs";
import * as R from "../engine/realms.js";
import * as INF from "../engine/influence.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));

console.log(`== R4.2 realmsOf — ${ch.name} ==`);
// the holdings cfg, assembled the way the gates assemble it
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };
// grown places live on the save; at runtime they are merged into the content pools
const locs = { ...C.locations, ...(ch.generated?.location || {}) };
const realms = R.realmsOf(ch, locs, cfg);
if (!realms.length) { console.log("  NO REALM — holdings:", (ch.holdings||[]).length); }
for (const rm of realms) {
  console.log(`  realm "${rm.name}"  kind=${rm.kind}  reachFloor=${rm.reachFloor}  total heads=${INF.headsOf(rm)}`);
  console.log(`    ${"hold".padEnd(24)} ${"heads".padStart(5)} ${"eyes".padStart(4)} ${"radius".padStart(7)}  seat`);
  if (rm.unplaced?.length) console.log(`    UNPLACED: ${rm.unplaced.map(u => u.name + " @" + u.at).join(", ")}`);
  for (const h of rm.holds) console.log(`    ${String(h.name).padEnd(24)} ${String(h.heads).padStart(5)} ${String(h.eyes).padStart(4)} ${h.radiusDeg.toFixed(2).padStart(6)}d  ${h.seat ? "SEAT" : ""}`);
}
console.log(`\nAevi's table: Fell Pell 33 heads/1 eye · Made Gate 4/2 · Whistling Woman 4/1 · Stillwater's 11/5 · Threshold 3/1`);

console.log(`\n== R4.1 resolvedPowers ==`);
const rp = R.resolvedPowers(ch, C);
const all = Array.isArray(C.powers) ? C.powers : Object.values(C.powers);
console.log(`  ${all.length} authored -> ${rp.length} standing;  ${rp.filter(INF.isTerritorial).length} territorial`);
let moved = 0;
for (const p of rp) {
  const a = all.find(q => q.id === p.id);
  if (INF.headsOf(a) !== INF.headsOf(p)) { moved++; if (moved <= 4) console.log(`    ${p.name}: authored ${INF.headsOf(a)} -> live ${INF.headsOf(p)}`); }
}
console.log(`  ${moved} power(s) differ from their authored strength on this save`);

console.log(`\n== R4.3 powerRelation ==`);
const terr = rp.filter(INF.isTerritorial);
const tally = {};
for (const p of terr) { const r = R.powerRelation(realms[0] || {id:"realm:x",yours:true}, p, ch, { allPowers: all }); tally[r] = (tally[r]||0)+1; }
console.log("  the realm vs every territorial power:", JSON.stringify(tally));
let pp = {};
for (let i = 0; i < terr.length; i++) for (let j = i+1; j < terr.length; j++) { const r = R.powerRelation(terr[i], terr[j], ch, { allPowers: all }); pp[r]=(pp[r]||0)+1; }
console.log("  power vs power:", JSON.stringify(pp));
console.log("\n  stateStamp:", R.stateStamp(ch, rp));
