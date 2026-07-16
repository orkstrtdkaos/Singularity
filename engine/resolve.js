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
export function successChance(ctx) {
  const { character, action, location, rules, aptitudeMods = {}, equipmentBonus = 0, substratePenalty = 0 } = ctx;
  const bc = rules.baseChance;
  // SNG-106: retain every component so the breakdown popup shows the REAL math, never a re-derivation.
  // `add` is the single accumulation site — every term goes through it, so sum(components) === chance
  // (before clamp) by construction. Attached to the passed ctx (ctx._breakdown); return value unchanged.
  const components = [];
  let chance = 0;
  const add = (label, value) => { if (value) components.push({ label, value }); chance += value; };

  // Sub-attributes (strength/agility, reason/insight, presence/rapport, craft/wits)
  // are the real target when present; the parent attribute is the fallback.
  const attrLevel = (action.subAttribute && character.subAttributes?.[action.subAttribute])
    || character.attributes[action.attribute] || 1;
  const soft = bc.attributeSoftCap ?? 4;
  const attrName = action.subAttribute || action.attribute || "attribute";
  // full value through the soft cap (competence), diminishing beyond (mastery)
  add(`${attrName} ${attrLevel}`, Math.min(attrLevel, soft) * bc.attributeMultiplier);
  if (attrLevel > soft) add(`${attrName} mastery (beyond ${soft})`, Math.max(0, attrLevel - soft) * (bc.attributePerPointBeyond ?? 5));

  if (action.skillId && character.skills?.[action.skillId]) add(`skill: ${action.skillId}`, character.skills[action.skillId] * bc.skillBonus);
  if (action.abilityLevel) add(`ability rank ${action.abilityLevel}`, action.abilityLevel * bc.abilityLevelBonus);

  // Spectrum modifiers: who-you-are vs what-you're-doing, and does the place help? Clamped as a TOTAL —
  // so when the clamp doesn't bite, show the two named contributions; when it does, show the clamped sum.
  const sm = rules.spectrumModifier;
  const selfFit = spectrumAlignment(character.alignment, action.axes) * sm.alignmentWeight;
  const placeFit = spectrumAlignment(location?.spectrum, action.axes) * sm.locationWeight;
  const spectralClamped = Math.max(sm.minTotal, Math.min(sm.maxTotal, selfFit + placeFit));
  if (spectralClamped === selfFit + placeFit) { add("spectral fit (you)", selfFit); add("spectral fit (place)", placeFit); }
  else add("spectral fit (clamped)", spectralClamped);

  // Player-aptitude modifiers (bonuses AND penalties — the human shapes the character)
  if (action.planned && aptitudeMods.plannedActionBonus) add("planned action", aptitudeMods.plannedActionBonus);
  if (action.attribute === "physical" && aptitudeMods.physicalBonus) add("physical aptitude", aptitudeMods.physicalBonus);
  if (action.attribute === "mental" && aptitudeMods.mentalBonus) add("mental aptitude", aptitudeMods.mentalBonus);
  if (action.attribute === "social") {
    if (aptitudeMods.socialBonus) add("social aptitude", aptitudeMods.socialBonus);
    if (action.tags?.includes("rapport") && aptitudeMods.rapportBonus) add("rapport", aptitudeMods.rapportBonus);
    if (action.tags?.includes("finesse") && aptitudeMods.socialFinessePenalty) add("social finesse (penalty)", aptitudeMods.socialFinessePenalty);
  }
  if (action.tags?.includes("discipline") && aptitudeMods.disciplinePenalty) add("discipline (penalty)", aptitudeMods.disciplinePenalty);

  // Equipment: the right tool in your pack helps (computed by inventory.equipmentBonus)
  add("equipment", equipmentBonus);

  // Novel/combined ability use is harder — unless it's a technique the character already DISCOVERED.
  if (action.discoveryBonus) add("discovered technique", action.discoveryBonus);
  else if (action.novel) add("novel use (surcharge)", -(rules.novel?.difficultySurcharge ?? 15));

  // SNG-090: the substrate penalty — a SEPARATE, already-clamped environmental term (never folded into spectral).
  if (substratePenalty) add("substrate (the lattice here)", -substratePenalty);

  // SNG-098: skill-battle contest terms — matchup edge (reveal beats conceal), intensity (Surge/Conserve).
  // Each enters as its OWN named, self-summing line (SNG-106 honesty), so the tier-3 fog view shows the
  // opponent's real math. Absent outside a skill battle.
  for (const m of ctx.contestMods || []) add(m.label, m.value);

  // Exhaustion: at zero energy everything is harder — body and field both spent
  if ((character.energy ?? 1) <= 0) add("exhausted", -(rules.energy?.exhaustedPenalty ?? 10));

  // Difficulty — the OPPOSED term lives here (an encounter's threat becomes difficulty). Name its source
  // when the caller passes one (SNG-106): "the raider (threat 35)" instead of an anonymous "difficulty".
  const diff = Number(action.difficulty) || 0;
  if (diff) add(action.difficultySource || "difficulty", -diff);

  // hard guard: malformed inputs must never reach the dice as NaN
  if (!Number.isFinite(chance)) {
    console.warn("[resolve] non-finite chance from action:", action.label);
    chance = 50;
  }
  const rounded = Math.round(chance);
  const total = Math.max(rules.d100.floorChance, Math.min(rules.d100.ceilingChance, rounded));
  ctx._breakdown = { components, total, clampedFrom: total !== rounded ? rounded : null };
  return total;
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

  // SNG-106: carry the retained component breakdown onto the receipt so the popup shows the real math.
  return { roll, chance, degree, action: ctx.action, breakdown: ctx._breakdown || null };
}

/** Apply energy cost for an action/ability use. Returns new energy (never below 0). */
export function applyEnergyCost(character, cost, rules) {
  const c = cost ?? rules.energy.defaultActionCost;
  return Math.max(0, (character.energy ?? rules.energy.max) - c);
}
