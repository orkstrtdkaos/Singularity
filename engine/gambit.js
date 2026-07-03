// gambit.js — declared multi-step plans. The player lays out a sequence of
// intended actions with optional fallbacks, sees what their experience lets them
// see about each step's odds, then executes. Steps resolve in order through the
// SAME deterministic resolver as everything else; a failed step blocks the run
// and forces a decision: fallback, spend an adaptation point to reroll, press on,
// or abandon. The GM narrates the whole run cinematically afterward from receipts.

import { callClaudeJSON } from "./claude.js";
import { resolveAction, successChance } from "./resolve.js";
import { senseAction } from "./sense.js";

/** Parse all step texts into action specs in ONE cheap call. */
export async function parseGambitSteps(stepTexts, character, location) {
  const sys = `Classify each step of an RPG player's declared plan into an action spec. Reply ONLY JSON:
{"steps": [{"label": "short restatement", "attribute": "physical|mental|social|practical", "subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits", "axes": {"spectrumId": -1..1}, "difficulty": 0|15|30, "intentTags": ["..."], "abilityId": "id-or-null", "comboAbilities": ["ids if deliberately combining two abilities, else []"], "novelUse": false, "noveltyHint": "2-4 words, only if novelUse"}]}
One entry per input step, same order. subAttribute picks the finest fit: strength (force) / agility (speed, balance, stealth) / reason (analysis) / insight (perception, reading people) / presence (command) / rapport (charm) / craft (tool work) / wits (improvisation).
Spectrum ids: emotional_logical, falsehood_truth, demonic_angelic, violence_peace, concrete_abstract, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation.
Intent tags: plan, scout, prepare, attack, climb, force, persuade, charm, negotiate, comfort, study, investigate, analyze, gamble, drink, revel, risky, careful, retreat, help, give, rescue, heal, meditate, threaten, steal, rapport, finesse, discipline.
abilityId must be one the character actually has, or null. novelUse=true when an ability is pushed outside its normal envelope or two are braided together. Later steps in a plan are typically harder (guards alerted, time pressure) — reflect that in difficulty.`;
  const content = `Character abilities: ${(character.abilities || []).map(a => a.abilityId).join(", ") || "none"}. ` +
    `Inventory: ${(character.inventory || []).map(i => i.name || i).join(", ") || "empty"}. ` +
    `Location: ${location.name} (${(location.tags || []).join(", ")}).\n` +
    `Plan steps:\n${stepTexts.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  const out = await callClaudeJSON([{ role: "user", content }], { task: "intent-parse", system: sys, maxTokens: 2048 });
  const steps = Array.isArray(out.steps) ? out.steps : [];
  // pad/truncate defensively to match input count
  const SUBS = ["strength", "agility", "reason", "insight", "presence", "rapport", "craft", "wits"];
  return stepTexts.map((text, i) => {
    const owned = id => (character.abilities || []).some(a => a.abilityId === id);
    const combo = (Array.isArray(steps[i]?.comboAbilities) ? steps[i].comboAbilities : []).filter(owned);
    return {
      label: steps[i]?.label || text.slice(0, 60),
      attribute: ["physical", "mental", "social", "practical"].includes(steps[i]?.attribute) ? steps[i].attribute : "practical",
      subAttribute: SUBS.includes(steps[i]?.subAttribute) ? steps[i].subAttribute : null,
      axes: steps[i]?.axes || {},
      difficulty: [0, 15, 30].includes(steps[i]?.difficulty) ? steps[i].difficulty : 0,
      intentTags: Array.isArray(steps[i]?.intentTags) ? steps[i].intentTags : [],
      abilityId: owned(steps[i]?.abilityId) ? steps[i].abilityId : null,
      comboAbilities: combo,
      novel: !!steps[i]?.novelUse || combo.length > 1,
      noveltyHint: steps[i]?.noveltyHint || "",
      planned: true,
      tags: Array.isArray(steps[i]?.intentTags) ? steps[i].intentTags : []
    };
  });
}

/** Per-step odds + what the character's attunement lets them perceive.
 *  bonuses: (action) => number — equipment/companion bonus resolver from the app. */
export function assessGambit(actions, { character, location, rules, aptitudeMods = {}, bonuses = () => 0 }) {
  const assessed = actions.map(action => {
    const equipmentBonus = bonuses(action);
    const chance = successChance({ character, action, location, rules, aptitudeMods, equipmentBonus });
    const sense = senseAction({ character, action, location, rules, aptitudeMods }, chance);
    return { action, chance, sense };
  });
  // the weak link: visible to characters with a real read (tier >= 2)
  let weakIndex = null;
  if (assessed.length && assessed[0].sense.tier >= 2) {
    weakIndex = assessed.reduce((min, a, i) => a.chance < assessed[min].chance ? i : min, 0);
  }
  return { steps: assessed, weakIndex };
}

export function adaptationPointsFor(profile, rules) {
  const base = rules.gambit?.adaptationBase ?? 1;
  const bonus = profile?.aptitudes?.includes("strategist") ? (rules.gambit?.strategistBonusPoints ?? 1) : 0;
  return base + bonus;
}

/** Execute steps from startIndex until done or a step FAILS (blocks). Pure —
 *  rng injectable. Partial successes continue with a complication note.
 *  Returns { receipts, blockedAt, done } and mutates nothing. */
export function executeGambit(actions, { character, location, rules, aptitudeMods = {}, bonuses = () => 0 }, rng = Math.random, startIndex = 0) {
  const receipts = [];
  for (let i = startIndex; i < actions.length; i++) {
    const action = actions[i];
    const equipmentBonus = bonuses(action);
    const r = resolveAction({ character, action, location, rules, aptitudeMods, equipmentBonus }, rng);
    const receipt = { index: i, ...r };
    if (r.degree === "partial") receipt.complication = rules.gambit?.partialComplicationNote || "a complication";
    receipts.push(receipt);
    if (r.degree === "failure" || r.degree === "crit_failure") {
      return { receipts, blockedAt: i, done: false };
    }
  }
  return { receipts, blockedAt: null, done: true };
}

/** Reroll one blocked step (an adaptation point was spent). */
export function rerollStep(action, ctx, rng = Math.random) {
  const equipmentBonus = ctx.bonuses ? ctx.bonuses(action) : 0;
  return resolveAction({ character: ctx.character, action, location: ctx.location, rules: ctx.rules, aptitudeMods: ctx.aptitudeMods || {}, equipmentBonus }, rng);
}

/** Format the whole run as a resolution block the GM narrates from. */
export function gambitResolutionForGM(goal, allReceipts, actions, outcome) {
  const lines = allReceipts.map(r => {
    const a = actions[r.index];
    let line = `Step ${r.index + 1}: ${a.label} — ${r.degree.replace("_", " ")} (rolled ${r.roll} vs ${r.chance})`;
    if (r.complication) line += ` [complication: ${r.complication}]`;
    if (r.viaFallback) line += ` [fallback used: ${r.viaFallback}]`;
    if (r.rerolled) line += ` [adaptation: rerolled from a failure]`;
    return line;
  });
  return {
    action: { label: `GAMBIT — ${goal}` },
    degree: outcome, // "completed" | "completed_rough" | "abandoned"
    roll: null, chance: null,
    gambit: { goal, outcome, steps: lines }
  };
}
