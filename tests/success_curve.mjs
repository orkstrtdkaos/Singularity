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
