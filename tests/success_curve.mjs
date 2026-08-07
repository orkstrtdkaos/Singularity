// success_curve.mjs — A REPORT, NOT A GATE. Erik, on Splarf at level 1: "failing hard on lvl 1... ugh."
//
// The screenshot: presence 2 → +20, training +0, equipment +0, exhausted −10, TOTAL 10%.
//
// ⛔ THE FINDING IS THAT THERE IS NO BASE. successChance starts at `let chance = 0` and every point comes
// from a modifier — so the "base 40" in SNG-339's framing was never a floor in the code, it is simply what
// an attribute-4 character gets from `attribute × 10`. A character at attribute 2 is at 20 before anything
// goes wrong, and one bad state (exhausted, −10) halves it.
//
// ⚠️ REPORT, NOT GATE, ON PURPOSE. Whether a base exists — and what it is — is a design dial Erik and Aevi
// own (SNG-280: no engine-side moral or balance weighting). This prints the curve so the dial is turned
// with numbers in hand rather than by feel. Nothing here asserts a value.
//
// Run: node tests/success_curve.mjs

import { loadContentHeadless } from "./headless_content.mjs";
import { successChance } from "../engine/resolve.js";

const C = await loadContentHeadless();
const rules = C.rules;

const character = (attr, energy = 1) => ({
  attributes: { physical: attr, mental: attr, social: attr, practical: attr },
  subAttributes: { presence: attr, rapport: attr, strength: attr, agility: attr, reason: attr, insight: attr, craft: attr, wits: attr },
  energy, maxEnergy: 100, alignment: {}, level: 1, abilities: [],
});
const action = (extra = {}) => ({ attribute: "social", subAttribute: "presence", tags: [], ...extra });

const pct = (n) => `${String(Math.round(n)).padStart(3)}%`;

console.log("SUCCESS CURVE — a d100 rolled AT OR UNDER the number below.\n");
console.log("There is no base constant: chance = attribute×10 + modifiers, starting from zero.\n");

console.log("attribute   rested   exhausted   +training(1 rank)   +training+gear");
for (const attr of [1, 2, 3, 4, 5, 6]) {
  const rested    = successChance({ character: character(attr),    action: action(), location: null, rules });
  const tired     = successChance({ character: character(attr, 0), action: action(), location: null, rules });
  const trained   = successChance({ character: character(attr),    action: action(), location: null, rules, skillBonus: rules.baseChance.skillBonus });
  const geared    = successChance({ character: character(attr),    action: action(), location: null, rules, skillBonus: rules.baseChance.skillBonus, equipmentBonus: rules.baseChance.equipmentBonus });
  console.log(`    ${attr}      ${pct(rested)}     ${pct(tired)}        ${pct(trained)}              ${pct(geared)}`);
}

console.log("\nSPLARF, AS SHOWN: presence 2, exhausted, no training, no gear");
const splarf = successChance({ character: character(2, 0), action: action(), location: null, rules });
console.log(`  → ${pct(splarf)}   (the screenshot said 10%)`);

console.log("\nWHAT EACH LEVER IS WORTH");
console.log(`  one attribute point      +${rules.baseChance.attributeMultiplier} (up to the soft cap of ${rules.baseChance.attributeSoftCap}, then +${rules.baseChance.attributePerPointBeyond})`);
console.log(`  one rank of training     +${rules.baseChance.skillBonus}`);
console.log(`  equipment                +${rules.baseChance.equipmentBonus} (capped at +${rules.baseChance.equipmentBonusCap})`);
console.log(`  an ability rank          +${rules.baseChance.abilityLevelBonus}`);
console.log(`  exhausted                −${rules.energy?.exhaustedPenalty ?? 10}`);

console.log("\nTHE DIAL, IF ONE IS WANTED — three shapes, none applied:");
console.log("  a) a flat base added to every roll (e.g. base 25 → Splarf reads 35%, a competent 4 reads 65%)");
console.log("  b) raise attributeMultiplier (steeper — rewards attributes, widens the gap between 1 and 4)");
console.log("  c) soften `exhausted` at low totals (a −10 costs half of a 20 and a quarter of a 40)");
console.log("\n⚠️ (a) and (b) are NOT equivalent: a flat base lifts everyone equally and compresses the");
console.log("   spread; a bigger multiplier lifts the strong far more than the weak. Which one is right");
console.log("   depends on whether level 1 should feel COMPETENT or should feel like the bottom of a climb.");


// ---------- SNG-346: the symmetric scale, checked against Aevi's published model ----------
console.log("\n\nSNG-346 — ERIK'S SYMMETRIC SCALE, as built.\n");
const bands = rules.difficultyBands;
const BAND_ORDER = ["very_easy", "easy", "normal", "hard", "very_hard"];
console.log(" ".repeat(34) + BAND_ORDER.map(b => b.replace("_", " ").padStart(11)).join(""));
const TRAIN = rules.baseChance.skillBonus, GEAR = rules.baseChance.equipmentBonus;
const row = (label, attr, opts) => {
  const cells = BAND_ORDER.map(b => pct(successChance({
    character: character(attr), action: action({ difficulty: b }), location: null, rules, ...opts,
  })).padStart(11));
  console.log(label.padEnd(34) + cells.join(""));
};
row("L1 trained, attr 4", 4, { skillBonus: TRAIN });
row("L1 trained + geared, attr 4", 4, { skillBonus: TRAIN, equipmentBonus: GEAR });
row("mid, attr 5, trained + geared", 5, { skillBonus: TRAIN, equipmentBonus: GEAR });
row("master, attr 6, 2 ranks, gear", 6, { skillBonus: TRAIN * 2, equipmentBonus: GEAR });
row("untrained, attr 2", 2, {});

console.log("\nERIK'S TARGET: succeed 2/3 at easy, fail 2/3 at hard (67 / 33).");
const l1 = (b) => successChance({ character: character(4), action: action({ difficulty: b }), location: null, rules, skillBonus: TRAIN });
console.log(`  L1 trained attr 4 — easy ${pct(l1("easy"))} · hard ${pct(l1("hard"))}   (Aevi modelled 65 / 35)`);
console.log(`  every band is ${Math.abs(bands.easy - bands.normal)} points apart — the ladder is learnable`);

console.log("\nSTILL OPEN, AND ERIK'S — the weak end:");
const weak = (b) => successChance({ character: character(2), action: action({ difficulty: b }), location: null, rules });
console.log(`  untrained attr 2 — hard ${pct(weak("hard"))} · very hard ${pct(weak("very_hard"))}  (the ${rules.d100.floorChance}% floor clamp doing the work)`);
console.log("  ⚠️ attribute 2 is effectively OUT OF THE GAME in the top two bands. Aevi: playable-but-poor,");
console.log("     or the wrong tool? Not assumed either way — the floor is a position, not a default.");

console.log("\nALSO OPEN — proportional exhaustion (dial (c), untouched):");
const flat = rules.energy?.exhaustedPenalty ?? 10;
for (const a of [2, 6]) {
  const rested = successChance({ character: character(a), action: action({ difficulty: "normal" }), location: null, rules });
  console.log(`  attr ${a}: a flat −${flat} costs ${Math.round(flat / rested * 100)}% of what they had (${rested}%)`);
}
console.log("  → flat punishes the WEAK hardest; proportional would reverse it, which reads correctly");
console.log("    because tiredness should cost more when you were relying on being good.");
