// resolve.js — deterministic d100 action resolution. The model NEVER rolls; this does.
// Pure functions only: no I/O, no globals, fully testable in Node.

/** Cosine-ish alignment between two spectrum vectors (sparse maps of axis -> [-1,1]).
 *  Returns [-1, 1]: how much the character's fingerprint agrees with the action's demands. */
export function spectrumAlignment(a = {}, b = {}) {
  const axes = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const ax of axes) {
    const va = a[ax] || 0, vb = b[ax] || 0;
    dot += va * vb; magA += va * va; magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Compute true success chance for an action. Everything is data-driven from rules JSON.
 *  action: { attribute, skillId?, axes?, abilityLevel?, difficulty (0-100 penalty), planned? }
 *  aptitudeMods: flat map merged from the player's aptitudes (see playerprofile.js). */
export function successChance({ character, action, location, rules, aptitudeMods = {}, equipmentBonus = 0 }) {
  const bc = rules.baseChance;
  // Sub-attributes (strength/agility, reason/insight, presence/rapport, craft/wits)
  // are the real target when present; the parent attribute is the fallback.
  const attrLevel = (action.subAttribute && character.subAttributes?.[action.subAttribute])
    || character.attributes[action.attribute] || 1;
  let chance = attrLevel * bc.attributeMultiplier;

  if (action.skillId && character.skills?.[action.skillId]) {
    chance += character.skills[action.skillId] * bc.skillBonus;
  }
  if (action.abilityLevel) chance += action.abilityLevel * bc.abilityLevelBonus;

  // Spectrum modifiers: does who-you-are match what-you're-doing, and does the place help?
  const sm = rules.spectrumModifier;
  let spectral = spectrumAlignment(character.alignment, action.axes) * sm.alignmentWeight
               + spectrumAlignment(location?.spectrum, action.axes) * sm.locationWeight;
  spectral = Math.max(sm.minTotal, Math.min(sm.maxTotal, spectral));
  chance += spectral;

  // Player-aptitude modifiers (bonuses AND penalties — the human shapes the character)
  if (action.planned && aptitudeMods.plannedActionBonus) chance += aptitudeMods.plannedActionBonus;
  if (action.attribute === "physical" && aptitudeMods.physicalBonus) chance += aptitudeMods.physicalBonus;
  if (action.attribute === "mental" && aptitudeMods.mentalBonus) chance += aptitudeMods.mentalBonus;
  if (action.attribute === "social") {
    if (aptitudeMods.socialBonus) chance += aptitudeMods.socialBonus;
    if (action.tags?.includes("rapport") && aptitudeMods.rapportBonus) chance += aptitudeMods.rapportBonus;
    if (action.tags?.includes("finesse") && aptitudeMods.socialFinessePenalty) chance += aptitudeMods.socialFinessePenalty;
  }
  if (action.tags?.includes("discipline") && aptitudeMods.disciplinePenalty) chance += aptitudeMods.disciplinePenalty;

  // Equipment: the right tool in your pack helps (computed by inventory.equipmentBonus)
  chance += equipmentBonus;

  // Novel/combined ability use is genuinely harder — unless it's a technique the
  // character already DISCOVERED, in which case it's earned skill with a bonus.
  if (action.discoveryBonus) chance += action.discoveryBonus;
  else if (action.novel) chance -= rules.novel?.difficultySurcharge ?? 15;

  chance -= Number(action.difficulty) || 0;
  // hard guard: malformed inputs must never reach the dice as NaN
  if (!Number.isFinite(chance)) {
    console.warn("[resolve] non-finite chance from action:", action.label);
    chance = 50;
  }
  return Math.max(rules.d100.floorChance, Math.min(rules.d100.ceilingChance, Math.round(chance)));
}

/** Roll and grade an action. Returns the full receipt so narration and telemetry both have everything.
 *  rng injectable for tests. Degrees: crit_success | success | partial | failure | crit_failure */
export function resolveAction(ctx, rng = Math.random) {
  const { rules } = ctx;
  const chance = successChance(ctx);
  const roll = Math.floor(rng() * 100) + 1;
  const d = rules.d100;
  const critLow = d.critSuccessMax + (ctx.aptitudeMods?.critSuccessBonus || 0);
  let critHigh = d.critFailMin - (ctx.aptitudeMods?.critFailPenalty || 0);
  // Novel use is volatile: the crit-failure band widens — reach exceeding grasp can HURT
  if (ctx.action.novel && !ctx.action.discoveryBonus) critHigh -= rules.novel?.critFailWiden ?? 3;

  let degree;
  if (roll <= critLow) degree = "crit_success";
  else if (roll >= critHigh) degree = "crit_failure";
  else if (roll <= chance) degree = "success";
  else if (roll <= chance + d.partialBand) degree = "partial";
  else degree = "failure";

  return { roll, chance, degree, action: ctx.action };
}

/** Apply energy cost for an action/ability use. Returns new energy (never below 0). */
export function applyEnergyCost(character, cost, rules) {
  const c = cost ?? rules.energy.defaultActionCost;
  return Math.max(0, (character.energy ?? rules.energy.max) - c);
}
