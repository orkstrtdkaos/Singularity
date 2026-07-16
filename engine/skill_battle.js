// skill_battle.js — SNG-098: the two-sided contest. Both wills declare a skill + intensity and ROLL;
// the higher net wins the round and shifts a BIDIRECTIONAL momentum meter; energy attrition is the second
// win condition. Both rolls run through resolve.js successChance (the SNG-106 rails) so each side's math is
// real and self-summing — the fog (sense.js senseOpponent) gates DISPLAY of the opponent's roll, never the
// math. Pure + deterministic (rng injectable) so duels are fair and PvP is symmetric. The narrative GM
// narrates the resolved exchange; it never chooses the opponent's mechanical move — that is opponentPolicy.

import { resolveAction } from "./resolve.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const DEFAULT_STEPS = { conserve: { energyMult: 0.6, effectMod: -8 }, standard: { energyMult: 1, effectMod: 0 }, surge: { energyMult: 1.6, effectMod: 10, backlashChance: 0.25 } };

/** The matchup edge for an attacker function vs a defender function — STRUCTURED, from the content, never
 *  parsed from prose (the §7b lesson). A defensive defender (shield/ward/resist) BLUNTS: it caps the
 *  attacker's edge to [0, bluntCap] — it denies an advantage, it never hands the round to the attacker or
 *  penalizes them. Returns a signed roll bonus FOR THE ATTACKER. */
export function matchupBonus(attackerFn, defenderFn, sb) {
  const fm = sb?.functionMatchup || {};
  const base = fm.edges?.[attackerFn]?.[defenderFn];
  let bonus = Number.isFinite(base) ? base : (fm.default ?? 0);
  if ((fm.defensiveFunctions || []).includes(defenderFn)) bonus = clamp(bonus, 0, fm.defensiveBluntCap ?? 3);
  return bonus;
}

/** Synthesize a modest skill sheet for a duel opponent from its threat + tacticTags (it carries no
 *  skills[] at spawn). An authored `opponent.skills[]` overrides the synthesis entirely. */
export function synthesizeOpponentSheet(opponent = {}, sb) {
  const syn = sb?.opponentSheetSynthesis || {};
  const threat = Number(opponent.threat) || 20;
  const attr = clamp(Math.round(threat * (syn.threatToAttribute ?? 0.08)), syn.attributeFloor ?? 2, syn.attributeCeiling ?? 6);
  const tier = clamp(Math.round(threat * (syn.threatToTier ?? 0.06)), syn.tierFloor ?? 1, syn.tierCeiling ?? 4);
  const energy = Math.round((syn.energyBase ?? 40) + threat * (syn.threatToEnergy ?? 1.2));
  const tags = opponent.tacticTags || [];
  if (opponent.skills?.length) { // authored override — a real, hand-built sheet
    return { name: opponent.name || "the opponent", attributes: opponent.attributes || { practical: attr, physical: attr, mental: attr, social: attr },
      energy: opponent.energy ?? energy, maxEnergy: opponent.energy ?? energy, tacticTags: tags, skills: opponent.skills, authored: true };
  }
  const arche = syn.archetypeSkills || {};
  let defs = arche.default || [{ function: "strike", name: "a hard strike" }, { function: "shield", name: "a raised guard" }];
  for (const t of tags) if (arche[t]) { defs = arche[t]; break; }
  const skills = defs.map(s => ({ function: s.function, name: s.name, tier, attribute: s.attribute || "practical" }));
  return { name: opponent.name || "the opponent", attributes: { practical: attr, physical: attr, mental: attr, social: attr },
    energy, maxEnergy: energy, tacticTags: tags, skills, synthesized: true };
}

/** The opponent's move for this round — DETERMINISTIC engine policy (not GM invention). Behind on momentum
 *  → press (Surge); ahead → pace (Conserve); tacticTags bias it. Skill pick: the function that matches up
 *  best against the player's last-SHOWN tendency (only what the fog let the opponent read of the player). */
export function opponentPolicy(oppSheet, state = {}, seenPlayerTendency = null, sb) {
  const pol = sb?.opponentPolicy || {};
  const oppMomentum = -(state.momentum || 0); // state.momentum is +player; the opponent is mirror
  let intensity = pol.defaultIntensity || "standard";
  if (oppMomentum <= (pol.behindSurgeAt ?? -3)) intensity = "surge";
  else if (oppMomentum >= (pol.aheadConserveAt ?? 3)) intensity = "conserve";
  for (const t of (oppSheet.tacticTags || [])) { const b = pol.tacticBias?.[t]; if (b?.surge) intensity = "surge"; else if (b?.pace && intensity === "surge") intensity = "standard"; }
  const skills = oppSheet.skills || [];
  let pick = skills[0] || { function: "strike", name: "a strike", tier: 1 };
  if (seenPlayerTendency && skills.length) {
    let best = -Infinity;
    for (const s of skills) { const b = matchupBonus(s.function, seenPlayerTendency, sb); if (b > best) { best = b; pick = s; } }
  }
  // attrition: can't afford a Surge on a near-empty pool → drop to Standard/Conserve
  if (intensity === "surge" && (state.opponentEnergy ?? oppSheet.energy ?? 0) < 12) intensity = "standard";
  return { function: pick.function, name: pick.name, tier: pick.tier || 1, attribute: pick.attribute || "practical", intensity };
}

/** Roll ONE side through successChance (SNG-106 rails): attribute + tier + matchup + intensity as named,
 *  self-summing contest mods. Returns the full receipt + the round margin (chance − roll). */
function rollSide(sheet, decl, oppDecl, sb, steps, rules, rng) {
  const tier = decl.tier || 1;
  const mu = matchupBonus(decl.function, oppDecl.function, sb);
  const step = steps[decl.intensity] || steps.standard || {};
  const ctx = {
    character: { attributes: sheet.attributes || {}, subAttributes: sheet.subAttributes || {}, alignment: sheet.alignment || {}, skills: sheet.skills || {}, energy: sheet.energy ?? 0 },
    action: { attribute: decl.attribute || "practical", abilityLevel: tier, label: decl.name || decl.function, axes: {} },
    rules,
    contestMods: [
      { label: `matchup (${decl.function} vs ${oppDecl.function})`, value: mu },
      ...(step.effectMod ? [{ label: decl.intensity, value: step.effectMod }] : [])
    ]
  };
  const res = resolveAction(ctx, rng);
  return { ...res, margin: res.chance - res.roll, matchup: mu, intensity: decl.intensity, tier, function: decl.function, name: decl.name || decl.function };
}

const energyCost = (decl, sb, steps, rules) => Math.round((rules.energy?.defaultActionCost ?? 5) * ((steps[decl.intensity] || steps.standard || {}).energyMult ?? 1));

/** One skill-battle ROUND. Both sides declare {function, tier, attribute, intensity}; both roll; compare
 *  margins; the higher shifts momentum by the difference; both pay energy (attrition). The engine computes
 *  BOTH full rolls — the returned `opponent` receipt is complete and identical regardless of who's watching;
 *  the fog is applied later by senseOpponent over this true state. Pure; rng injectable. */
export function battleRound({ playerDecl, oppDecl, playerSheet, oppSheet, state = {}, rules, sb, steps, rng = Math.random }) {
  sb = sb || {};
  steps = steps || rules?.intensitySteps || DEFAULT_STEPS;
  const p = rollSide(playerSheet, playerDecl, oppDecl, sb, steps, rules, rng);
  const o = rollSide(oppSheet, oppDecl, playerDecl, sb, steps, rules, rng);

  const mom = sb.momentum || {};
  const meterMax = mom.meterMax ?? 10, marginScale = mom.marginScale ?? 0.5, crush = mom.surgeCrushEndsIt ?? 8;
  let momentum = state.momentum || 0, roundWinner = null, delta = 0;
  if (p.margin !== o.margin) {
    roundWinner = p.margin > o.margin ? "player" : "opponent";
    delta = Math.abs(p.margin - o.margin) * marginScale;
    momentum += roundWinner === "player" ? delta : -delta;
  }
  momentum = clamp(momentum, -meterMax, meterMax);

  const playerEnergy = Math.max(0, (state.playerEnergy ?? playerSheet.energy ?? 0) - energyCost(playerDecl, sb, steps, rules));
  const opponentEnergy = Math.max(0, (state.opponentEnergy ?? oppSheet.energy ?? 0) - energyCost(oppDecl, sb, steps, rules));

  let resolved = null;
  if (Math.abs(momentum) >= meterMax) resolved = momentum > 0 ? "player" : "opponent";           // meter filled
  else if (delta >= crush && roundWinner) resolved = roundWinner;                                  // a single crushing blow
  else if (playerEnergy <= 0 && opponentEnergy <= 0) resolved = "stalemate";                       // both spent
  else if (playerEnergy <= 0) resolved = "opponent";                                               // attrition
  else if (opponentEnergy <= 0) resolved = "player";

  const newState = { ...state, round: (state.round || 0) + 1, momentum, playerEnergy, opponentEnergy, resolved, status: resolved ? "resolved" : "active" };
  return { state: newState, player: p, opponent: o, roundWinner, delta, resolved };
}
