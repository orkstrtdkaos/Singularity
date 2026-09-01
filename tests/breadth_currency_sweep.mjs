// breadth_currency_sweep.mjs — SNG-260 §C+§D / SNG-261 §A. CAP vs CURRENCY: what does a kit actually cost?
//
// Erik, on pricing tier: "depending on choices, a player could end up with far fewer crafts than someone who
// bought only the cheapest. I don't think this is a problem, just something to test."
//
// Aevi's framing, which this file measures: the breadth CAP is the ceiling (how many crafts you may hold);
// the CURRENCY is the shape of the kit under it (what you can afford). Both should matter somewhere, and
// neither should be dead weight everywhere. §D lands WITH §C because tuning either alone gives a false read
// of the other.
//
// THE INSTRUMENT. Two buyers walk the SAME real catalog with the SAME points and the SAME cap, and differ
// only in what they reach for: CHEAPEST-FIRST takes the lowest-priced craft available; STRONGEST-FIRST takes
// the highest tier it can afford. Prices come from the REAL `learnPointCost` — the engine's own single site —
// so this cannot drift from what a player is charged.
//
// Run: node tests/breadth_currency_sweep.mjs [--json]

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { learnPointCost, tierPrice } from "../engine/skilltree.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const CAP = rj("content/packs/core/rules/skill_capacity.json");
const LEVELING = rj("content/packs/core/rules/resolution.json").leveling || {};

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pad = (v, n) => String(v).padStart(n);

// ---------- the real catalog ----------
const CATALOG = [];
for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  const pk = rj(`content/packs/core/abilities/${f}`);
  for (const a of (pk.abilities || [])) CATALOG.push({ ...a, powerSystem: a.powerSystem || pk.powerSystem });
}
const tierOfAb = a => Math.max(1, Number(a.levelReq) || 1);
const byTier = {};
for (const a of CATALOG) byTier[tierOfAb(a)] = (byTier[tierOfAb(a)] || 0) + 1;

// Points earned by a level: the engine's own rate, so the budget is not invented here.
const pointsAt = level => Math.max(0, Math.round(level * (LEVELING.skillPointPerLevel ?? 1)));
const capAt = level => Number(CAP.skillsKnownByLevel?.[String(level)]) || (level + 1);

// A character shaped like the ones the app builds: a home class, no domains set (so the DISTANCE term is the
// cross-class multiplier, which is the path a fresh character actually walks).
const buyerFor = level => ({ origin: "valley", nativeTradition: "valley_craft", level, abilities: [] });

/** Walk the catalog under a cap and a purse, taking crafts in a given ORDER. Returns what they end with. */
function buy(level, order) {
  const character = buyerFor(level);
  const purse = pointsAt(level), cap = capAt(level);
  // only what this level could legally reach at all — tier access is gated by levelReq independently of price
  const reachable = CATALOG.filter(a => tierOfAb(a) <= Math.ceil(level / 5) + 1);
  const priced = reachable.map(a => ({ a, cost: learnPointCost(a, character, CAP, null), tier: tierOfAb(a) }));
  priced.sort(order === "cheapest"
    ? (x, y) => x.cost - y.cost || y.tier - x.tier
    : (x, y) => y.tier - x.tier || x.cost - y.cost);
  let spent = 0; const took = [];
  for (const p of priced) {
    if (took.length >= cap) break;
    if (spent + p.cost > purse) continue;      // can't afford this one; a cheaper one may still fit
    spent += p.cost; took.push(p);
  }
  const tiers = took.reduce((m, p) => (m[p.tier] = (m[p.tier] || 0) + 1, m), {});
  return { count: took.length, spent, purse, cap, tiers,
    meanTier: took.length ? Math.round((took.reduce((s, p) => s + p.tier, 0) / took.length) * 100) / 100 : 0,
    boundBy: took.length >= cap ? "cap" : (spent + Math.min(...priced.map(p => p.cost)) > purse ? "currency" : "catalog") };
}

console.log("BREADTH vs CURRENCY — cap = the ceiling, currency = the shape of the kit under it (SNG-260 §C+§D)\n");
const ROMAN = ["I", "II", "III", "IV", "V"];
console.log(`      tier prices: ${[1,2,3,4,5].map(t => `T-${ROMAN[t-1]}=${tierPrice({ levelReq: t }, CAP)}`).join(" · ")}`);
console.log(`      catalog by tier: ${Object.keys(byTier).sort().map(t => `T${t}:${byTier[t]}`).join(" · ")}`);
console.log(`      points/level ${LEVELING.skillPointPerLevel ?? 1} · cross-class multiplier ${CAP.crossClass?.costMultiplier ?? 2}\n`);

const LEVELS = [5, 10, 20, 30];
console.log("      THE SPREAD — same points, same cap, different appetites");
console.log("      level  purse  cap   cheapest-first: crafts (mean tier, bound by)   strongest-first: crafts (mean tier, bound by)");
const rows = [];
for (const level of LEVELS) {
  const cheap = buy(level, "cheapest"), strong = buy(level, "strongest");
  rows.push({ level, cheap, strong });
  console.log(`      ${pad(level, 5)}  ${pad(cheap.purse, 5)}  ${pad(cheap.cap, 3)}   `
    + `${pad(cheap.count, 6)} (mean T${cheap.meanTier}, ${cheap.boundBy})`.padEnd(46)
    + `${pad(strong.count, 6)} (mean T${strong.meanTier}, ${strong.boundBy})`);
}

console.log("\n      READ:");
{
  const l20 = rows.find(r => r.level === 20);
  console.log(`      At level 20 a cheapest-first buyer ends with ${l20.cheap.count} crafts (mean tier ${l20.cheap.meanTier});`);
  console.log(`      a strongest-first buyer ends with ${l20.strong.count} (mean tier ${l20.strong.meanTier}). That gap IS the mechanic:`);
  console.log("      the cap says how many you may hold, the currency says what you can afford to hold.");
  const capBound = rows.filter(r => r.cheap.boundBy === "cap").map(r => r.level);
  const curBound = rows.filter(r => r.strong.boundBy === "currency").map(r => r.level);
  console.log(`      CAP binds the cheap buyer at level(s): ${capBound.join(", ") || "none"}.`);
  console.log(`      CURRENCY binds the strong buyer at level(s): ${curBound.join(", ") || "none"}.`);
  console.log("      Both mattering somewhere is the §C/§D goal; if one is empty, that dial is dead weight.");
}

// ---------- what must hold whatever the prices are ----------
console.log("");
check("§D: tier is PRICED — a Tier-III costs strictly more than a Tier-I (it was flat before)",
  tierPrice({ levelReq: 3 }, CAP) > tierPrice({ levelReq: 1 }, CAP),
  `T-I ${tierPrice({ levelReq: 1 }, CAP)} vs T-III ${tierPrice({ levelReq: 3 }, CAP)}`);
// ⛔ R1 (ERIK 2026-08-31) REPLACED THE LADDER THIS GATE WAS WRITTEN FOR. It asserted STRICTLY increasing
// (1<2<3<4<5). R1 compressed it to 1·2·2·3·3 deliberately: "two natural investment steps (T1→T2 and
// T3→T4) instead of five flat ones". ⚠️ THE OLD ASSERTION WOULD NOW BLOCK THE RULING — a gate defending
// a rule its author had already retired. Rewritten to assert R1's SHAPE, which is a stronger claim than
// "goes up": non-decreasing, topping out at T-IV/T-V, with exactly two rises.
const LADDER = [1, 2, 3, 4, 5].map(t => tierPrice({ tier: t }, CAP));
check("§261 §A / R1: the price ladder never goes DOWN as tier rises",
  LADDER.every((v, i) => i === 0 || v >= LADDER[i - 1]), `ladder: ${LADDER.join(" · ")}`);
check("§261 §A / R1: it reaches its top at T-IV/T-V, so a capstone is the dearest thing you can buy",
  LADDER[4] === Math.max(...LADDER) && LADDER[3] === Math.max(...LADDER), `ladder: ${LADDER.join(" · ")}`);
check("§261 §A / R1: EXACTLY TWO investment steps — T1→T2 and T3→T4, as ruled",
  LADDER.filter((v, i) => i > 0 && v > LADDER[i - 1]).length === 2
  && LADDER[1] > LADDER[0] && LADDER[3] > LADDER[2],
  `ladder: ${LADDER.join(" · ")} — rises at ${LADDER.map((v, i) => i > 0 && v > LADDER[i-1] ? `T${i}→T${i+1}` : null).filter(Boolean).join(", ") || "nowhere"}`);
check("§D: tier COMPOSES with distance — a cross-class Tier-III costs more than an in-class Tier-III",
  learnPointCost({ levelReq: 3, powerSystem: "harmonic" }, buyerFor(20), CAP, null)
  > learnPointCost({ levelReq: 3, powerSystem: "valley_craft" }, buyerFor(20), CAP, null));
check("§D item 3 — THE FLOOR HOLDS: nobody can spend into a character with nothing to do",
  rows.every(r => r.cheap.count >= 2 && r.strong.count >= 1),
  `worst: cheapest ${Math.min(...rows.map(r => r.cheap.count))}, strongest ${Math.min(...rows.map(r => r.strong.count))}`);
// §D item 4 is a TUNING outcome, not a structural truth — so it is REPORTED, never gated. Erik sets the
// prices and Aevi tunes cap+currency together; a red build on a dial they have not turned yet would be this
// file overstepping (the tradition_matrix rule: percentages are a report, assertions are truths design
// cannot excuse). It is printed loudly because the answer right now is a real finding.
{
  const seen = new Set(rows.flatMap(r => [r.cheap.boundBy, r.strong.boundBy]));
  const capBinds = seen.has("cap"), curBinds = seen.has("currency");
  console.log("");
  if (capBinds && curBinds) {
    console.log("      ✓ §D item 4: BOTH dials bind somewhere — cap and currency each do real work.");
  } else {
    console.log(`      ⚠ §D item 4 FINDING: only the ${curBinds ? "CURRENCY" : "CAP"} ever binds — the ${curBinds ? "breadth cap" : "currency"} is dead weight as tuned.`);
    console.log(`      With ${LEVELING.skillPointPerLevel ?? 1} point/level, a cap of level+1 and a cheapest craft of 1 point, the purse is ALWAYS`);
    console.log("      smaller than the cap, so the cap can never be reached. Pricing tier did not just shape the kit —");
    console.log("      it made §C's ceiling unreachable. This is exactly why Aevi sequenced §D to land WITH §C:");
    console.log("      cap and currency have to be tuned together, and the numbers to tune are Erik's.");
  }
}
check("§D item 1 — the appetites genuinely diverge (if they don't, the currency is doing nothing)",
  rows.some(r => r.cheap.count !== r.strong.count || r.cheap.meanTier !== r.strong.meanTier));
check("no price is free — every craft in the catalog costs at least 1 point",
  CATALOG.every(a => learnPointCost(a, buyerFor(20), CAP, null) >= 1));

if (process.argv.includes("--json")) {
  writeFileSync(join(root, "tests/breadth_currency.json"), JSON.stringify({
    at: new Date().toISOString(), tierPrice: CAP.tierPrice, catalogByTier: byTier, rows
  }, null, 2));
  console.log("      wrote tests/breadth_currency.json");
}

console.log(failures === 0
  ? "\nBreadth/currency sweep: all checks passed. (The spread is a REPORT — Erik sets the prices, Aevi tunes cap+currency together.)"
  : `\nBreadth/currency sweep: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
