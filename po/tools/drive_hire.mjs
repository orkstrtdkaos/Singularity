// ⛑ SNG-652 §6 / C1 — DRIVE THE WHOLE PATH, not the function. The card computes a row, the button hires them, the tick
// sends the cart, the road fights for it and the arrival takes their cut. Every one of those is a separate door, and
// C1's first cut failed two of them silently (no `companies` reached `storeExits`; the button's id segment was the
// COMPANY, so `setRoute` would have answered "nowhere by that name" into a console line nobody reads).
// ⚠️ On a COPY of the save — this never writes to characters/.
import { readFileSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CV = await import("../../engine/caravan.js");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
const L = C.locations, CO = Object.values(C.tradeCompanies || {});
const src = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
const day = 1200;

for (const which of ["The Fell Pell"]) {
  const ch = JSON.parse(JSON.stringify(src));
  const h = ch.holdings.find(x => x.name === which);
  const reg = L[h.locationId]?.regionId || null;
  const ex = CV.storeExits(ch, h, { cfg, economy: econ, locations: L, regionId: reg, powers: C.powers, rules: C.rules, companies: CO });
  const row = ex.rows.find(r => r.id.startsWith("hire:"));
  console.log(`\n── ${which} @ ${h.locationId}`);
  console.log(`   row ${row.id}`);
  console.log(`   said: ${row.said}`);
  // the button's own arithmetic, character for character with app.js's data attribute
  const seg = String(row.id).split(":");
  const [holdId, companyId, toId] = [h.id, row.company.id, seg.slice(2).join(":")];
  console.log(`   button → hold=${holdId} company=${companyId} to=${toId}  (to is a place: ${!!L[toId]})`);
  const hr = CV.hireCompany(ch, holdId, { companyId, toId, companies: CO, locations: L, cfg, day });
  console.log(`   hireCompany → ok=${hr.ok} ${hr.ok ? hr.said : hr.why}`);
  if (!hr.ok) continue;
  console.log(`   route now: ${JSON.stringify(h.route)}`);
  console.log(`   routeCompany → ${CV.routeCompany(h, CO)?.name}`);
  // and the card again, so the HIRED row is the one that says it is hired
  const ex2 = CV.storeExits(ch, h, { cfg, economy: econ, locations: L, regionId: reg, powers: C.powers, rules: C.rules, companies: CO });
  const mine = ex2.rows.find(r => r.hired);
  console.log(`   after hiring, the row that says hired: ${mine ? mine.id : "⛔ NONE — the card forgot"}`);
  // the tick sends it
  const people = { ...(C.npcs || {}), ...(ch.npcRegistry || {}) };
  h.store = { ...(h.store || {}), iron_ingot: 40 };
  const notes = CV.runStandingRoutes(ch, { locations: L, cfg, day: day + 10, people });
  console.log(`   runStandingRoutes → ${JSON.stringify(notes).slice(0, 220)}`);
  const car = (ch.caravans || []).at(-1);
  console.log(`   caravan: ${car ? `to ${car.to}, load ${JSON.stringify(car.load)}, company ${JSON.stringify(car.company)}` : "⛔ none departed"}`);
  if (!car) continue;
  // the road, then the arrival
  for (let i = 1; i <= 400 && car.status !== "home" && car.status !== "sold" && car.status !== "arrived"; i++) {
    CV.tickCaravans(ch, { locations: L, cfg, economy: econ, day: day + 10 + i, people, rng: Math.random });
  }
  console.log(`   after walking: status=${car.status} — events:`);
  for (const e of (car.events || []).slice(0, 8)) console.log(`     · ${e.what}`);
  console.log(`   purse ${JSON.stringify(ch.currencies || ch.crystal)}`);
}
