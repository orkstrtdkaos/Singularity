// ⛑ SNG-652 §6 / C1 — IS HIRING A LIVE CHOICE ONCE THE CARD STOPS FUDGING IT?
// My first cut subtracted `guards × a dial` from the hired run's expected loss, which made hiring win by construction.
// With that gone the hired row pays the SAME expected loss as your own crew, so hiring can only win on the two things
// Aevi actually authored: their speed (fewer days on the road → fewer hazards, and first coin sooner) against their cut,
// plus your own crew's upkeep, which a hired run does not pay. This prints the WHOLE table per hold so the answer is
// measured rather than asserted — and prints the holds where hiring LOSES too, because a door nobody opens is not a door.
import { readFileSync, readdirSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CV = await import("../../engine/caravan.js");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
const L = C.locations, CO = C.tradeCompanies || {};
console.log(`\ncompanies loaded: ${Object.keys(CO).length}`);
for (const c of Object.values(CO)) console.log(`  ${c.name.padEnd(32)} cut ${c.cut}  ${String(c.guards).padStart(2)} guards  from ${c.operatesFrom}  reaches ${(c.reaches || []).join("/")}${c.water ? "  [water]" : ""}`);

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
let holds = 0, withCo = 0, hireBest = 0;
for (const ch of saves) for (const h of ch.holdings || []) {
  if (!h?.store || !Object.keys(h.store).length) continue;
  holds++;
  const reg = L[h.locationId]?.regionId || null;
  let ex; try { ex = CV.storeExits(ch, h, { cfg, economy: econ, locations: L, regionId: reg, powers: C.powers, rules: C.rules, companies: CO }); } catch (e) { console.log(`  ${h.name} ERR ${e.message}`); continue; }
  const hire = ex.rows.filter(r => r.id.startsWith("hire:"));
  if (hire.length) withCo++;
  if (String(ex.best?.id).startsWith("hire:")) hireBest++;
  console.log(`\n## ${ch.name} / ${h.name} @ ${h.locationId} (${reg})  best=${ex.best?.id}`);
  for (const r of ex.rows) console.log(`   ${r.id.slice(0, 40).padEnd(42)} perPass ${String(r.perPass ?? "—").padStart(8)}  days ${String(r.days ?? "—").padStart(6)}  danger ${r.risk ?? "—"}`);
}
console.log(`\nholds with stock ${holds}; a company will carry for ${withCo}; the card's BEST row is a hire on ${hireBest}`);
