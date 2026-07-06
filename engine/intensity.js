// intensity.js — SNG-015 Part A. An ability use resolves at one of three intensities:
// Conserve / Standard / Surge. Energy scales, effect scales, and Surge alone carries a
// backlash risk paid by the ability's Tier. AUTO picks the minimum intensity the task
// needs (via the comfort read) and NEVER auto-surges — surge is always deliberate.
//
// Pure functions (rng injectable). Intensity scales the ROLL/effect and energy only —
// it never bypasses attribute gates or levelReq (those are enforced at learn/rank time;
// a use only ever involves an already-owned ability).

import { tierOf } from "./skilltree.js";

export const INTENSITIES = ["conserve", "standard", "surge"];

export function intensityStep(rules = {}, key = "standard") {
  return (rules.steps && rules.steps[key]) || (rules.steps && rules.steps.standard) || { energyMult: 1, effectMod: 0, backlashChance: 0 };
}

/** Scale an ability's base energy by intensity, honoring the content floors:
 *  Conserve can't drop below 2; Surge can't exceed 2× standard. */
export function scaledEnergy(baseCost, intensity, rules = {}) {
  const step = intensityStep(rules, intensity);
  let e = Math.round((baseCost || 0) * (step.energyMult ?? 1));
  if (intensity === "conserve") e = Math.max(2, e);
  if (intensity === "surge") e = Math.min((baseCost || 0) * 2, e);
  return Math.max(0, e);
}

/** Chance modifier an intensity adds to the roll (surge +, conserve −). */
export function effectMod(intensity, rules = {}) {
  return intensityStep(rules, intensity).effectMod ?? 0;
}

/** AUTO: the minimum intensity that still clears the task comfortably, via the standard-
 *  intensity success chance. Easy/comfortable → conserve; otherwise → standard. NEVER surge. */
export function autoIntensity(standardChance, rules = {}) {
  const floor = rules.autoConserveFloor ?? 70;
  const conserveMod = effectMod("conserve", rules); // negative
  // conserve is auto-picked only if it STILL clears comfortably at its reduced effect
  if ((standardChance + conserveMod) >= floor) return "conserve";
  return "standard";
}

/** Numeric tier 1..5 from an ability's levelReq (surgeBacklashByTier is keyed 1..5,
 *  while tierOf() returns Roman for display). */
export function tierNum(levelReq) {
  return Math.max(1, Math.min(5, levelReq || 1));
}

/** Tier-scaled backlash cost for a surged ability (from surgeBacklashByTier). */
export function surgeBacklash(ability, rules = {}) {
  const map = rules.surgeBacklashByTier || {};
  return map[String(tierNum(ability?.levelReq || 1))] || map["1"] || { health: 3, energy: 4 };
}

/** Does a surge backlash fire? Base chance rises on a marginal/failed roll, near-nil on a
 *  clean success — a surge that lands clean is mostly safe; one that slips bites. */
export function shouldBacklash(intensity, degree, rules = {}, rng = Math.random) {
  if (intensity !== "surge") return false;
  const base = intensityStep(rules, "surge").backlashChance ?? 0;
  const mult = degree === "crit_failure" ? 2 : degree === "failure" ? 1.5 : degree === "partial" ? 1 : 0.3;
  return rng() < Math.min(1, base * mult);
}

/** Apply a surged ability's backlash to the character (health + energy). Returns the cost. */
export function applySurgeBacklash(character, ability, rules = {}) {
  const b = surgeBacklash(ability, rules);
  character.health = Math.max(0, (character.health ?? 0) - (b.health || 0));
  character.energy = Math.max(0, (character.energy ?? 0) - (b.energy || 0));
  return { health: -(b.health || 0), energy: -(b.energy || 0), tier: tierOf(ability?.levelReq || 1), tierNum: tierNum(ability?.levelReq || 1) };
}

/** A dial descriptor for the UI: each step's label, scaled energy, and surge warning. */
export function intensityOptions(baseCost, rules = {}) {
  return INTENSITIES.map(key => {
    const step = intensityStep(rules, key);
    return {
      key,
      label: key[0].toUpperCase() + key.slice(1),
      energy: scaledEnergy(baseCost, key, rules),
      effectMod: step.effectMod ?? 0,
      backlashChance: step.backlashChance ?? 0,
      warn: key === "surge" ? "backlash risk" : null
    };
  });
}
