// ⛑ TAIL ITEM 5 — `economy.markets.chargePerPass` ON. Driven at the TIPPING POINT, because the whole point of the dial
// is what it does to DISTANCE, and near a market the two rules agree exactly.
//
// ⛔ AND IT TOOK THREE TRIES TO MEASURE, each failure worth recording:
//   1. I flipped the default in `powers.js` and 0 of 34 measured rows moved — because caravan.js read
//      `rules?.economy?.markets?.chargePerPass` DIRECTLY, and `economy.markets` is unauthored, so that reach saw
//      `undefined` for ever and never met a default. Two bags for one dial; `marketDials` is the door now.
//   2. Still 0 — because only ONE place in the authored world holds a market (Millbrook, fee 2), and no destination in
//      that sweep is one.
//   3. Still 0 — because `routeValue` takes `days` as a PARAMETER and my fixture passed none, so every run measured
//      0 days, `perDeparture` was 1, and fee/1 === fee makes the two rules identical by construction.
import { readFileSync } from "node:fs";
const CV = await import("../../engine/caravan.js");
const J = await import("../../engine/journey.js");
const P = await import("../../engine/powers.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
let fails = 0;
const check = (ok) => { if (!ok) fails++; return ok ? "ok" : "⛔ FAIL"; };

/* ══ 1 · THE DIAL IS ON, THROUGH THE ONE DOOR ════════════════════════════════════════════ */
console.log(`\n══ 1 · the dial, assembled\n`);
const dials = P.marketDials(C.rules);
console.log(`  marketDials(rules).chargePerPass = ${dials.chargePerPass}`);
console.log(`  economy.markets authored        = ${JSON.stringify(C.rules?.economy?.markets ?? null)}`);
console.log(`  ${check(dials.chargePerPass === true)} — on, and it comes from the DEFAULTS, which is why the door matters`);

/* ══ 2 · WHO IN THE WORLD HOLDS A MARKET AT ALL ══════════════════════════════════════════ */
// ⚠️ A RULE'S POPULATION IS PART OF THE REPORT. If one place charges, the flip is worth exactly one place.
console.log(`\n══ 2 · the population this dial can reach\n`);
const charging = [];
for (const id of Object.keys(C.locations || {})) {
  const f = P.marketFeeAt(id, { content: { powers: C.powers || [], locations: C.locations || {} },
    powers: C.powers || [], character: { name: "probe", level: 10 }, rules: C.rules, locations: C.locations || {}, worth: 100 });
  if (f && Number(f.fee) > 0) charging.push(`${id} (${f.powerName}, fee ${f.fee})`);
}
console.log(`  ${Object.keys(C.locations || {}).length} place(s); ${charging.length} hold a market that charges:`);
for (const c of charging) console.log(`    ${c}`);
console.log(`  ${check(charging.length > 0)} — the dial has a population at all`);

/* ══ 3 · AT THE TIPPING POINT: NEAR AND FAR, BOTH RULES ══════════════════════════════════ */
// ⛔ HER SENTENCE: the card subtracts the fee "per pass, so a far market with a steep fee can lose to a near one".
// A flat per-LOAD fee does the opposite, because a far market means one big load rather than many small ones.
console.log(`\n══ 3 · what the two rules do to distance\n`);
const yielder = Object.keys(cfg.features?.kinds || {}).filter(k => !k.startsWith("_")).find(k => cfg.features.kinds[k]?.yields);
const shed = (at) => ({ name: "T", level: 10, purse: { crystal: 9999, scrip: {} }, holdings: [{
  id: "h1", name: "The Far Shed", kind: "post", condition: "thriving", locationId: at,
  crew: ["a", "b"], garrison: [], store: { raw_material: 30 },
  features: [{ kind: yielder, name: "a mine", count: 2, by: "you" }] }] });
const priced = (from, on) => {
  const ch = shed(from);
  const road = J.roadRoute(from, "millbrook", C.locations || {});
  const rules = JSON.parse(JSON.stringify(C.rules));
  rules.economy.markets = { chargePerPass: on };
  return CV.routeValue(ch, ch.holdings[0], { toId: "millbrook", days: road?.days ?? 0,
    locations: C.locations || {}, powers: C.powers || [], rules, cfg, economy: econ });
};
console.log(`  from                     round trip  per departure   stall per LOAD   stall per PASS`);
const rows = [];
for (const from of ["millbrook", "archive_hollow", "bedrock"]) {
  const a = priced(from, false), b = priced(from, true);
  if (!a?.ok) { console.log(`  ${from.padEnd(24)} refused: ${a?.why?.slice(0, 50)}`); continue; }
  rows.push({ from, trip: a.wait.roundTrip, per: a.wait.perDeparture, load: a.stall, pass: b.stall });
  console.log(`  ${from.padEnd(24)} ${String(a.wait.roundTrip).padEnd(12)}${String(a.wait.perDeparture).padEnd(16)}${String(a.stall).padEnd(17)}${b.stall}`);
}
// ⛔ NEAR, THE TWO RULES AGREE (one departure a pass). FAR, the per-load fee shrinks toward nothing while the per-pass
// fee holds — which is the inversion her sentence describes, and the reason the lever exists.
const near = rows.find(r => r.per === 1), far = rows.find(r => r.per > 4);
console.log(`\n  ${check(!!near && near.load === near.pass)} — at a market on your doorstep the two rules agree exactly`);
console.log(`  ${check(!!far && far.pass > far.load * 2)} — and far off, the per-load fee had shrunk to ${far?.load} a pass where the rule charges ${far?.pass}`);
console.log(`  ${check(!!far && far.load < near?.load)} — which is the inversion: the SAME fee cost a far market less than a near one`);

console.log(`\n${fails ? `⛔ ${fails} check(s) FAILED` : "✅ every check passed"}\n`);
process.exit(fails ? 1 : 0);
