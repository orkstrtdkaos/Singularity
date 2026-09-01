// intensity.js — SNG-015 Part A. An ability use resolves at one of three intensities:
// Conserve / Standard / Surge. Energy scales, effect scales, and Surge alone carries a
// backlash risk paid by the ability's Tier. AUTO picks the minimum intensity the task
// needs (via the comfort read) and NEVER auto-surges — surge is always deliberate.
//
// Pure functions (rng injectable). Intensity scales the ROLL/effect and energy only —
// it never bypasses attribute gates or levelReq (those are enforced at learn/rank time;
// a use only ever involves an already-owned ability).

import { tierOf, abilityTier } from "./skilltree.js";

export const INTENSITIES = ["conserve", "standard", "surge"];

export function intensityStep(rules = {}, key = "standard") { // registry:internal
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

// ⛔ `tierNum` WENT WITH THE FUNCTIONS THAT USED IT. R18 merged surge backlash into
// `progression.applyBacklash`, which removed `surgeBacklash`/`applySurgeBacklash` — and `tierNum` was
// their private helper. ⚠️ The wiring audit caught it immediately: a `registry:internal` marker with no
// same-module caller is the marker LOWERING THE RATCHET rather than describing the code.



/** Does a surge backlash fire? Base chance rises on a marginal/failed roll, near-nil on a
 *  clean success — a surge that lands clean is mostly safe; one that slips bites. */
export function shouldBacklash(intensity, degree, rules = {}, rng = Math.random) {
  if (intensity !== "surge") return false;
  const base = intensityStep(rules, "surge").backlashChance ?? 0;
  const mult = degree === "crit_failure" ? 2 : degree === "failure" ? 1.5 : degree === "partial" ? 1 : 0.3;
  return rng() < Math.min(1, base * mult);
}


/** A dial descriptor for the UI: each step's label, scaled energy, and surge warning. */
// ⛔ R18 (ERIK 2026-09-01) — `surgeBacklash` AND `applySurgeBacklash` WERE REMOVED, NOT DEPRECATED.
// They scaled a surged slip's harm by TIER off `intensity_scaling.surgeBacklashByTier`, while the
// crit-failure door beside them scaled by RUNG off `resolution.novel.backlashByRung` — two tables for
// one fiction. ⚠️ R18b: tier drops out ENTIRELY, surge included. Both doors now call
// `progression.applyBacklash`, which takes rung × rank × intensity × pool and a `trigger` that keeps a
// surged slip milder than an outright critical failure. `intensity.backlashChance` still decides IF.

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
