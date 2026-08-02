// roll_sensitivity.mjs — SNG-258 §SENSITIVITY. WHAT IS EACH CONSTANT ACTUALLY WORTH?
//
// Aevi: "sweep each constant across a range, report where the field's win-rate and spread land, so §1-3 are
// tuned on DATA not vibes. This runs BEFORE any constant changes ship."
//
// Erik's finding, restated as the thing this file measures: attribute at x20 to a soft cap of 4 contributes
// 80 points on its own, so once a character reaches attr 4 the tier/skill/gear terms pile against the 95
// ceiling and are CLAMPED AWAY. They do not feel weak — they mathematically ARE nothing.
//
// THE INSTRUMENT. This sweeps the REAL `successChance` from engine/resolve.js by handing it a MUTATED COPY of
// the rules JSON. It does not reimplement the math. That matters more here than anywhere else in the test
// stack: a sensitivity tool that models its own version of the formula would produce confident dials for an
// engine that does something else, and the whole point is that Erik will TURN these dials.
//
// THE HEADLINE METRIC is not the mean chance — it is MARGINAL VALUE. "What is one more rank of ability
// actually worth, after the clamp?" A term whose marginal value is 0.0 is a term that does not exist, however
// large its constant. That is the number that answers §1, §2 and §3 at once.
//
// This file CHANGES NOTHING. It reads the shipped constants, reports, and asserts only invariants that must
// hold at every setting.
//
// Run: node tests/roll_sensitivity.mjs [--json]

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { successChance, resolveAction } from "../engine/resolve.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const RULES = rj("content/packs/core/rules/resolution.json");

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const r1 = v => Math.round(v * 10) / 10;
const pad = (v, n) => String(v).padStart(n);

/** Seeded RNG — a red run must reproduce exactly. */
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** A rules object with ONE constant overridden. Deep-ish clone of only what we touch, so a sweep can never
 *  leak a mutation into the next cell — the classic way a sweep produces a smooth, wrong curve. */
const withConst = (group, key, value) => ({ ...RULES, [group]: { ...RULES[group], [key]: value } });

// ── THE CAST ────────────────────────────────────────────────────────────────────────────────────────────
// A ladder of competence, not a random sample: the question is whether the terms separate these people, and
// a grid answers that where an average hides it. Attribute/skill/rank move together the way they do in play —
// nobody has rank-3 crafts and attribute 2.
const CAST = [
  { name: "novice",     attr: 2, skill: 0, rank: 1, gear: 0 },
  { name: "apprentice", attr: 3, skill: 1, rank: 1, gear: 0 },
  { name: "competent",  attr: 4, skill: 2, rank: 2, gear: 5 },
  { name: "expert",     attr: 5, skill: 3, rank: 3, gear: 5 },
  { name: "master",     attr: 6, skill: 3, rank: 3, gear: 10 }
];
// The same threat bands the tradition matrix uses, so the two reports can be read side by side. 0 = an
// unopposed task, which is where the ceiling problem shows most plainly.
const DIFFICULTIES = [
  { name: "unopposed", d: 0 }, { name: "riffraff", d: 22 }, { name: "notable", d: 38 },
  { name: "regional", d: 55 }, { name: "epic", d: 78 }
];

/** One cell of the grid, through the real engine. Spectral fit is left NEUTRAL on purpose: it is its own
 *  open thread (§4/§6) and folding a fabricated alignment in here would put an invented number inside every
 *  cell of a table whose whole job is to say what each term is worth. */
function cell(rules, who, difficulty, { rankPlus = 0, skillPlus = 0 } = {}) {
  const character = {
    attributes: { physical: who.attr, mental: who.attr, social: who.attr, practical: who.attr },
    subAttributes: {}, skills: { the_craft: who.skill + skillPlus }, alignment: {}, energy: 50
  };
  const action = { attribute: "physical", skillId: who.skill + skillPlus > 0 ? "the_craft" : null,
    abilityLevel: who.rank + rankPlus, difficulty, axes: {}, tags: [] };
  const ctx = { character, action, location: null, rules, equipmentBonus: who.gear, substratePenalty: 0 };
  const total = successChance(ctx);
  const b = ctx._breakdown;
  const raw = b.clampedFrom ?? b.total;                       // pre-clamp — where the wasted points live
  const attrPts = b.components.filter(c => /^physical /.test(c.label)).reduce((a, c) => a + c.value, 0);
  // Attribute's share of the POSITIVE point budget. Dividing by `raw` looks natural and is a trap: raw goes
  // to zero and negative on hard cells, so the ratio explodes and the mean of it is meaningless. The honest
  // question is "of everything working in this character's favour, how much is attribute?"
  const budget = b.components.filter(c => c.value > 0).reduce((a, c) => a + c.value, 0);
  return { total, raw, attrPts, budget,
    // points thrown away at BOTH ends: above the ceiling nothing more helps, below the floor nothing helps.
    wastedHigh: Math.max(0, raw - RULES.d100.ceilingChance),
    wastedLow: Math.max(0, RULES.d100.floorChance - raw),
    live: raw > RULES.d100.floorChance && raw < RULES.d100.ceilingChance,
    components: b.components };
}

/** The whole grid at one setting, reduced to the five numbers a dial-turner needs. */
function sweepPoint(rules) {
  const cells = [];
  for (const who of CAST) for (const dd of DIFFICULTIES) cells.push({ who, dd, ...cell(rules, who, dd.d) });
  // MARGINAL VALUE — the point of the file. Re-run each cell with one more rank / one more skill level and
  // measure the delta in the CLAMPED chance, which is the only chance the player ever experiences.
  const dRank = cells.map(c => cell(rules, c.who, c.dd.d, { rankPlus: 1 }).total - c.total);
  const dSkill = cells.map(c => cell(rules, c.who, c.dd.d, { skillPlus: 1 }).total - c.total);
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  return {
    meanChance: r1(mean(cells.map(c => c.total))),
    pctAtCeiling: r1((cells.filter(c => c.wastedHigh > 0).length / cells.length) * 100),
    pctAtFloor: r1((cells.filter(c => c.wastedLow > 0).length / cells.length) * 100),
    // THE metric a dial-turner needs: only in the live band does any other term change an outcome.
    pctLive: r1((cells.filter(c => c.live).length / cells.length) * 100),
    meanWasted: r1(mean(cells.map(c => c.wastedHigh + c.wastedLow))),
    attrShare: r1(mean(cells.filter(c => c.budget > 0).map(c => (c.attrPts / c.budget) * 100))),
    marginalRank: r1(mean(dRank)),
    marginalSkill: r1(mean(dSkill)),
    // does the ladder still SEPARATE people? a constant that collapses novice and master has broken the game
    // even if its mean looks healthy.
    ladderSpread: r1(mean(DIFFICULTIES.map(dd =>
      cell(rules, CAST[CAST.length - 1], dd.d).total - cell(rules, CAST[0], dd.d).total)))
  };
}

console.log("ROLL SENSITIVITY — what each constant is actually worth (SNG-258 §SENSITIVITY)\n");
console.log(`      shipped constants: attributeMultiplier ${RULES.baseChance.attributeMultiplier} · softCap ${RULES.baseChance.attributeSoftCap}`
  + ` · perPointBeyond ${RULES.baseChance.attributePerPointBeyond} · skillBonus ${RULES.baseChance.skillBonus}`
  + ` · abilityLevelBonus ${RULES.baseChance.abilityLevelBonus} · ceiling ${RULES.d100.ceilingChance}\n`);

// ── THE STATUS QUO, cell by cell ────────────────────────────────────────────────────────────────────────
console.log("      WHERE THE FIELD SITS TODAY (chance / pre-clamp raw — a raw above 95 is points thrown away)");
console.log("      " + "PROFILE".padEnd(12) + DIFFICULTIES.map(d => d.name.padStart(13)).join(""));
for (const who of CAST) {
  const row = DIFFICULTIES.map(dd => { const c = cell(RULES, who, dd.d);
    return `${pad(c.total, 3)}/${pad(c.raw, 4)}${c.wastedHigh ? "^" : c.wastedLow ? "v" : " "}`.padStart(13); }).join("");
  console.log("      " + who.name.padEnd(12) + row);
}
console.log("      (^ = pinned at the ceiling, v = pinned at the floor. In BOTH, tier/skill/gear buy the player NOTHING.)");
console.log("      Note the master: solved at everything up to notable, and only genuinely playing at regional and epic.\n");

// ── §1 THE ATTRIBUTE CURVE ──────────────────────────────────────────────────────────────────────────────
const MULTS = [8, 10, 12, 14, 16, 18, 20];
const byMult = MULTS.map(m => ({ m, ...sweepPoint(withConst("baseChance", "attributeMultiplier", m)) }));
console.log("      §1 ATTRIBUTE MULTIPLIER SWEEP — Aevi's goal: a maxed attribute is a STRONG base (~55-65), not a solved one");
console.log("      mult   attr4 base   mean%   live band%   at ceiling%   at floor%   attr share%   +1 rank worth   +1 skill worth   master-novice");
for (const s of byMult) {
  const attr4 = Math.min(4, RULES.baseChance.attributeSoftCap) * s.m;
  console.log(`      ${pad(s.m, 4)}   ${pad(attr4, 10)}   ${pad(s.meanChance, 5)}   ${pad(s.pctLive, 10)}   ${pad(s.pctAtCeiling, 11)}`
    + `   ${pad(s.pctAtFloor, 9)}   ${pad(s.attrShare, 11)}   ${pad(s.marginalRank, 13)}   ${pad(s.marginalSkill, 14)}   ${pad(s.ladderSpread, 13)}`);
}
{
  const now = byMult.find(s => s.m === RULES.baseChance.attributeMultiplier);
  const best = byMult.slice().sort((a, b) => (b.marginalRank - a.marginalRank) || (b.pctLive - a.pctLive))[0];
  console.log(`\n      READ: at the shipped ${RULES.baseChance.attributeMultiplier}, a rank of ability delivers ${now.marginalRank} of its nominal `
    + `${RULES.baseChance.abilityLevelBonus} points — ${r1((now.marginalRank / RULES.baseChance.abilityLevelBonus) * 100)}% of what the constant says —`);
  console.log(`      and only ${now.pctLive}% of the grid is in the LIVE BAND (${now.pctAtCeiling}% pinned at the ceiling, ${now.pctAtFloor}% at the floor).`);
  console.log(`      Attribute is ${now.attrShare}% of everything working in a character's favour.`);
  console.log(`      Best in this sweep: multiplier ${best.m} — a rank delivers ${best.marginalRank}, ${best.pctLive}% of the grid live,`);
  console.log(`      attribute down to ${best.attrShare}% of the budget, and the master-novice gap still ${best.ladderSpread} points.`);
  console.log(`      NOTE the floor is a ceiling too: points are thrown away at BOTH ends, which is why no multiplier`);
  console.log(`      in this sweep delivers a rank's full ${RULES.baseChance.abilityLevelBonus} points. A hard cell is as dead as a solved one.`);
}

// ── §3 THE TIER TERM ────────────────────────────────────────────────────────────────────────────────────
console.log("\n      §3 ABILITY-RANK BONUS SWEEP — is a bigger flat tier bonus the answer? (at the SHIPPED attribute multiplier)");
console.log("      bonus   nominal T3   actually delivered   at-ceiling%   master-novice");
for (const b of [5, 8, 10, 12, 15]) {
  const s = sweepPoint(withConst("baseChance", "abilityLevelBonus", b));
  console.log(`      ${pad(b, 5)}   ${pad(b * 3, 10)}   ${pad(r1(s.marginalRank * 3), 18)}   ${pad(s.pctAtCeiling, 11)}   ${pad(s.ladderSpread, 13)}`);
}
console.log("      READ: raising the flat bonus mostly raises the WASTE — the delivered value lags the nominal");
console.log("      because the points land above the ceiling. This is the evidence for Aevi's §3 design call:");
console.log("      tier should buy a WIDER BAND (reach/crit/partial), not more flat points that clamp away.");

// ── §2 THE SKILL TERM ───────────────────────────────────────────────────────────────────────────────────
console.log("\n      §2 SKILL BONUS SWEEP — the budget a use-counter would have to live inside");
console.log("      bonus   nominal skill3   actually delivered   at-ceiling%");
for (const b of [4, 6, 8, 10, 12]) {
  const s = sweepPoint(withConst("baseChance", "skillBonus", b));
  console.log(`      ${pad(b, 5)}   ${pad(b * 3, 14)}   ${pad(r1(s.marginalSkill * 3), 18)}   ${pad(s.pctAtCeiling, 11)}`);
}

// ── §3b / §9 THE PARTIAL BAND ───────────────────────────────────────────────────────────────────────────
// Aevi's §3b goal: mastery should FAIL SOFTER. Before that can be designed, we need to know what the band is
// worth today — how much of the outcome space a point of band actually moves.
console.log("\n      §3b/§9 PARTIAL BAND SWEEP — how much outcome space does the band buy? (10k seeded rolls per cell)");
console.log("      band   " + CAST.map(c => c.name.padStart(11)).join("") + "     (share of rolls landing PARTIAL, at the notable band)");
for (const band of [10, 15, 20, 25, 30]) {
  const rules = { ...RULES, d100: { ...RULES.d100, partialBand: band } };
  const row = CAST.map(who => {
    const rng = mulberry32(0x5EED ^ (who.attr * 7919) ^ (band * 104729));
    let partial = 0;
    for (let i = 0; i < 10000; i++) {
      const character = { attributes: { physical: who.attr, mental: who.attr, social: who.attr, practical: who.attr },
        subAttributes: {}, skills: { the_craft: who.skill }, alignment: {}, energy: 50 };
      const action = { attribute: "physical", skillId: who.skill > 0 ? "the_craft" : null,
        abilityLevel: who.rank, difficulty: 38, axes: {}, tags: [] };
      if (resolveAction({ character, action, location: null, rules, equipmentBonus: who.gear, substratePenalty: 0 }, rng).degree === "partial") partial++;
    }
    return r1((partial / 10000) * 100).toString().padStart(11);
  }).join("");
  console.log(`      ${pad(band, 4)}   ${row}`);
}
console.log(`      READ: expert and master sit at chance ${RULES.d100.ceilingChance}, and crit-failure starts at ${RULES.d100.critFailMin} —`);
console.log("      so there is NO ROOM between their success line and the crit-fail line. Widening the band moves");
console.log("      them not at all: a master's miss is never a partial, it is a critical failure. The flat band");
console.log("      lands entirely on the people who need it least. This is Aevi's §3b goal stated as a defect:");
console.log("      today expertise makes failure MORE binary, not softer. Any §3b design has to reach the ceiling");
console.log("      cases, which means the band cannot be the only lever — the ceiling has to come down too (§1).");

// ── INVARIANTS ──────────────────────────────────────────────────────────────────────────────────────────
// The report is the deliverable. These gates are the structural truths that must hold at EVERY setting —
// if one breaks, no number above can be trusted.
console.log("");
{
  // SNG-106's honesty contract, checked across the whole sweep rather than at one setting: the popup can only
  // show the real math if the named components sum to the pre-clamp total.
  let worst = 0;
  for (const m of MULTS) for (const who of CAST) for (const dd of DIFFICULTIES) {
    const c = cell(withConst("baseChance", "attributeMultiplier", m), who, dd.d);
    worst = Math.max(worst, Math.abs(c.components.reduce((a, x) => a + x.value, 0) - c.raw));
  }
  check("every named component sums to the pre-clamp total, at every multiplier (SNG-106 — the popup cannot lie)",
    worst < 0.5, `worst drift ${worst}`);
}
{
  let bad = null;
  for (const m of MULTS) for (const dd of DIFFICULTIES) {
    let prev = -Infinity;
    for (const who of [...CAST].sort((a, b) => a.attr - b.attr)) {
      const t = cell(withConst("baseChance", "attributeMultiplier", m), who, dd.d).total;
      if (t < prev) bad = `mult ${m}, ${dd.name}: ${who.name} rolls WORSE than a lesser profile`;
      prev = t;
    }
  }
  check("competence is monotonic — a more capable profile never has a lower chance, at any multiplier", !bad, bad || "");
}
{
  const bad = MULTS.map(m => sweepPoint(withConst("baseChance", "attributeMultiplier", m)))
    .some(s => !Number.isFinite(s.meanChance) || !Number.isFinite(s.marginalRank));
  check("no setting in the sweep produces a non-finite chance", !bad);
}
{
  const now = byMult.find(s => s.m === RULES.baseChance.attributeMultiplier);
  check("the SHIPPED constants appear in the sweep, so the report always states the status quo",
    !!now, "the shipped attributeMultiplier is outside the swept range — widen MULTS");
}
{
  // The ladder must still be a ladder at every candidate setting Erik might pick. A multiplier that flattens
  // master and novice into each other would be a worse failure than the ceiling problem it fixes.
  const flat = byMult.filter(s => s.ladderSpread < 10).map(s => s.m);
  check("every swept multiplier keeps a real gap between the master and the novice",
    flat.length === 0, `these multipliers flatten the ladder below 10 points: ${flat.join(", ")}`);
}

if (process.argv.includes("--json")) {
  writeFileSync(join(root, "tests/roll_sensitivity.json"), JSON.stringify({
    at: new Date().toISOString(), shipped: RULES.baseChance, d100: RULES.d100,
    cast: CAST, difficulties: DIFFICULTIES,
    grid: CAST.map(who => ({ who: who.name, cells: DIFFICULTIES.map(dd => ({ at: dd.name, ...cell(RULES, who, dd.d), components: undefined })) })),
    multiplierSweep: byMult,
    rankSweep: [5, 8, 10, 12, 15].map(b => ({ b, ...sweepPoint(withConst("baseChance", "abilityLevelBonus", b)) })),
    skillSweep: [4, 6, 8, 10, 12].map(b => ({ b, ...sweepPoint(withConst("baseChance", "skillBonus", b)) }))
  }, null, 2));
  console.log("      wrote tests/roll_sensitivity.json");
}

console.log(failures === 0
  ? "\nRoll sensitivity: all invariants hold. (The tables are a REPORT — Erik owns the dials, this file changes nothing.)"
  : `\nRoll sensitivity: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
