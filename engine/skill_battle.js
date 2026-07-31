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
  // CCODE-38 (Erik: "they seem to always just strike"): the old policy took skills[0] unless a tendency was known,
  // and skills[0] is a strike for nearly every synthesized sheet — so every foe was a metronome. Now each option is
  // SCORED: the matchup edge when we've read a tendency, a situational lean (behind → press; ahead → consolidate),
  // and an anti-repetition penalty so a foe doesn't hammer the same verb twice running. The tiebreak varies with
  // the round number, so behaviour differs across rounds while staying fully DETERMINISTIC (no rng — duels stay
  // reproducible and PvP stays symmetric).
  if (skills.length > 1) {
    const attacks = (sb?.persistentEffects?.attackFunctions) || ["strike", "break"];
    const defensive = (sb?.functionMatchup?.defensiveFunctions) || ["shield", "ward", "resist"];
    const behind = oppMomentum < 0, ahead = oppMomentum > 0;
    let best = -Infinity;
    skills.forEach((s, i) => {
      let score = seenPlayerTendency ? matchupBonus(s.function, seenPlayerTendency, sb) * 2 : 0;
      if (behind && attacks.includes(s.function)) score += 2;        // losing → press
      if (ahead && defensive.includes(s.function)) score += 2;       // winning → protect the lead
      if (s.function === state.lastOppFn) score -= 3;                // don't be a metronome
      score += ((state.round || 0) * 7 + i * 3) % 5 * 0.4;           // deterministic variety
      if (score > best) { best = score; pick = s; }
    });
  }
  // attrition: can't afford a Surge on a near-empty pool → drop to Standard/Conserve
  if (intensity === "surge" && (state.opponentEnergy ?? oppSheet.energy ?? 0) < 12) intensity = "standard";
  return { function: pick.function, name: pick.name, tier: pick.tier || 1, attribute: pick.attribute || "practical", intensity };
}

// ---------- CCODE-35: persistent effects (Erik: "each action should produce something that could persist") ----------
// A move that LANDS leaves a standing effect for a few rounds. The load-bearing rule: an effect is never a hidden
// fudge — it enters the next round's roll as a NAMED, SIGNED contestMod on the SNG-106 self-summing breakdown, so
// "guard up +4" sits in the same honest math as the matchup and intensity terms. Definitions are content
// (skill_battle_system.json engine.persistentEffects); the code owns only when they land, apply, and expire.

/** Does this effect modify `side`'s roll THIS round, given who declared what? Pure. */
function effectApplies(fx, side, ownDecl, oppDecl, sb) {
  if (fx.side !== side) return false;
  const attacks = (sb?.persistentEffects?.attackFunctions) || ["strike", "break"];
  if (fx.applies === "whenAttacked") return attacks.includes(oppDecl.function);   // it answers incoming harm
  if (fx.applies === "whenAttacking") return attacks.includes(ownDecl.function);  // it sharpens your own blow
  return true;                                                                     // "always" — knowledge/hindrance cuts both ways
}

/** The contestMod lines the active effects contribute to one side's roll — one honest labelled term each. */
export function effectMods(effects, side, ownDecl, oppDecl, sb) {
  return (effects || [])
    .filter(fx => effectApplies(fx, side, ownDecl, oppDecl, sb))
    .map(fx => ({ label: `${fx.label}${fx.roundsLeft > 1 ? ` (${fx.roundsLeft} rounds)` : ""}`, value: fx.value }));
}

/** The effect a landed move leaves behind, or null. `roll` is that side's resolved receipt; `actor` is the side
 *  that declared it. A miss leaves nothing — a botched guard is not a raised shield. */
function effectFrom(decl, roll, actor, sb) {
  const cfg = sb?.persistentEffects; if (!cfg) return null;
  const def = cfg.byFunction?.[decl.function]; if (!def) return null;
  const ok = (cfg.requiresDegree || ["crit_success", "success", "partial"]).includes(roll.degree);
  if (!ok) return null;
  const partial = roll.degree === "partial";
  const value = Math.round((def.value || 0) * (partial ? (cfg.partialValueMult ?? 0.5) : 1));
  if (!value) return null;
  const rounds = Math.max(1, (def.rounds || 1) + (roll.degree === "crit_success" ? (cfg.critBonusRounds ?? 0) : 0));
  const other = actor === "player" ? "opponent" : "player";
  return {
    kind: def.kind, label: def.label, value, roundsLeft: rounds, applies: def.applies || "always",
    side: def.target === "opponent" ? other : actor,   // WHOSE roll this modifies
    source: decl.name || decl.function, from: actor
  };
}

/** Tick every effect down one round and drop the expired. Pure. */
function tickEffects(effects) {
  return (effects || []).map(fx => ({ ...fx, roundsLeft: fx.roundsLeft - 1 })).filter(fx => fx.roundsLeft > 0);
}

/** Add a landed effect: the same kind on the same side REFRESHES rather than stacking, and each side is capped. */
function addEffect(effects, fx, sb) {
  if (!fx) return effects;
  const cfg = sb?.persistentEffects || {};
  let out = effects.slice();
  if (cfg.refreshesSameKind !== false) out = out.filter(e => !(e.kind === fx.kind && e.side === fx.side));
  out.push(fx);
  const cap = cfg.maxActivePerSide ?? 3;
  const mine = out.filter(e => e.side === fx.side);
  if (mine.length > cap) { const drop = mine.slice(0, mine.length - cap); out = out.filter(e => !drop.includes(e)); }
  return out;
}

/** Roll ONE side through successChance (SNG-106 rails): attribute + tier + matchup + intensity as named,
 *  self-summing contest mods — plus any standing persistent effects (CCODE-35), each its own honest line.
 *  Returns the full receipt + the round margin (chance − roll). */
function rollSide(sheet, decl, oppDecl, sb, steps, rules, rng, fxMods = [], momMod = 0) {
  const tier = decl.tier || 1;
  const mu = matchupBonus(decl.function, oppDecl.function, sb);
  const step = steps[decl.intensity] || steps.standard || {};
  const ctx = {
    character: { attributes: sheet.attributes || {}, subAttributes: sheet.subAttributes || {}, alignment: sheet.alignment || {}, skills: sheet.skills || {}, energy: sheet.energy ?? 0 },
    action: { attribute: decl.attribute || "practical", abilityLevel: tier, label: decl.name || decl.function, axes: {} },
    rules,
    contestMods: [
      { label: `matchup (${decl.function} vs ${oppDecl.function})`, value: mu },
      ...(step.effectMod ? [{ label: decl.intensity, value: step.effectMod }] : []),
      // CCODE-37: a WOVEN second craft is its own named line — the player can see exactly what folding it in bought.
      ...(decl.woven ? [{ label: `woven: ${decl.woven.name || decl.woven.function}`, value: wovenBonus(decl.woven, sb) }] : []),
      // CCODE-38: momentum is a MODIFIER now — being ahead presses your advantage, being behind costs you.
      ...(momMod ? [{ label: momMod > 0 ? "momentum (you have the advantage)" : "momentum (you're on the back foot)", value: momMod }] : []),
      ...fxMods
    ]
  };
  const res = resolveAction(ctx, rng);
  return { ...res, margin: res.chance - res.roll, matchup: mu, intensity: decl.intensity, tier, function: decl.function, name: decl.name || decl.function, effectMods: fxMods, woven: decl.woven || null };
}

/** CCODE-37: what folding a second craft into the round is worth — scales with the woven craft's tier, capped. */
export function wovenBonus(woven, sb) {
  const w = sb?.weave || {};
  return Math.min(w.maxBonus ?? 8, Math.round((woven?.tier || 1) * (w.bonusPerTier ?? 2)));
}

/** CCODE-38 (Erik: "momentum should be a MODIFIER mechanic, not the primary exit encounter metric"): the roll
 *  bonus/penalty a side carries for being ahead/behind on the meter. `momentum` is always +player; pass
 *  side="opponent" to mirror it. Capped, and its own named line in the breakdown. Pure. */
export function momentumModifier(momentum, side, sb) {
  const m = sb?.momentum?.asModifier || {};
  const signed = (side === "opponent" ? -1 : 1) * (momentum || 0);
  return clamp(Math.round(signed * (m.perPoint ?? 0.5)), -(m.max ?? 8), m.max ?? 8);
}

// CCODE-37: a WOVEN round pays for both crafts — doing two things in one turn is a real cost, not a free upgrade.
// (Once the pairing is EARNED as a braid it becomes one craft at one craft's price — that's the payoff.)
const energyCost = (decl, sb, steps, rules) => Math.round(
  (rules.energy?.defaultActionCost ?? 5)
  * ((steps[decl.intensity] || steps.standard || {}).energyMult ?? 1)
  * (decl.woven ? (sb?.weave?.energyMultiplier ?? 1.8) : 1)
);

/** CCODE-39: can this side pay for what it declared? If not, the craft doesn't answer — the declaration falls back
 *  to a plain effort in the same spirit (a guard stays a guard, everything else becomes a bare strike). Pure. */
export function degradeIfSpent(decl, energy, sb, steps, rules) {
  if (energyCost(decl, sb, steps, rules) <= energy) return decl;
  const defensive = (sb?.functionMatchup?.defensiveFunctions) || ["shield", "ward", "resist"];
  const guarding = defensive.includes(decl.function);
  return {
    function: guarding ? "shield" : "strike", tier: 1, attribute: decl.attribute || "physical",
    intensity: "conserve", name: guarding ? "a last raised guard" : "a bare-handed effort",
    spentFallback: true, wanted: decl.name || decl.function
  };
}

/** One skill-battle ROUND. Both sides declare {function, tier, attribute, intensity}; both roll; compare
 *  margins; the higher shifts momentum by the difference; both pay energy (attrition). The engine computes
 *  BOTH full rolls — the returned `opponent` receipt is complete and identical regardless of who's watching;
 *  the fog is applied later by senseOpponent over this true state. Pure; rng injectable. */
export function battleRound({ playerDecl, oppDecl, playerSheet, oppSheet, state = {}, rules, sb, steps, rng = Math.random }) {
  sb = sb || {};
  steps = steps || rules?.intensitySteps || DEFAULT_STEPS;
  // CCODE-35: standing effects modify THIS round's rolls as named contestMods, then tick; newly landed ones
  // are added after both sides roll (an effect never modifies the round that created it).
  // CCODE-39: a side with nothing left in the pool cannot pay for a craft — its declaration DEGRADES to a plain
  // effort (steel and wit: a bare strike or a raised guard, tier 1, conserve, no weave). You fight on; you just
  // fight without your crafts until you find energy again. Enforced here so it binds both sides equally.
  playerDecl = degradeIfSpent(playerDecl, state.playerEnergy ?? playerSheet.energy ?? 0, sb, steps, rules);
  oppDecl = degradeIfSpent(oppDecl, state.opponentEnergy ?? oppSheet.energy ?? 0, sb, steps, rules);
  const standing = state.effects || [];
  const p = rollSide(playerSheet, playerDecl, oppDecl, sb, steps, rules, rng, effectMods(standing, "player", playerDecl, oppDecl, sb), momentumModifier(state.momentum || 0, "player", sb));
  const o = rollSide(oppSheet, oppDecl, playerDecl, sb, steps, rules, rng, effectMods(standing, "opponent", oppDecl, playerDecl, sb), momentumModifier(state.momentum || 0, "opponent", sb));
  let effects = tickEffects(standing);
  const landedP = effectFrom(playerDecl, p, "player", sb);
  // CCODE-37: THE PAYOFF — a woven round lands the SECOND craft's effect too, so one turn leaves two things
  // standing. This is what "braids shine in combat" means mechanically: turn-by-turn forces one move per turn,
  // and a weave is how a practised pairing beats that limit.
  const landedW = playerDecl.woven ? effectFrom({ ...playerDecl.woven, intensity: playerDecl.intensity }, p, "player", sb) : null;
  const landedO = effectFrom(oppDecl, o, "opponent", sb);
  effects = addEffect(effects, landedP, sb);
  effects = addEffect(effects, landedW, sb);
  effects = addEffect(effects, landedO, sb);

  const mom = sb.momentum || {};
  const meterMax = mom.meterMax ?? 10, marginScale = mom.marginScale ?? 0.5, crush = mom.surgeCrushEndsIt ?? 8;
  let momentum = state.momentum || 0, roundWinner = null, delta = 0;
  if (p.margin !== o.margin) {
    roundWinner = p.margin > o.margin ? "player" : "opponent";
    delta = Math.abs(p.margin - o.margin) * marginScale;
    momentum += roundWinner === "player" ? delta : -delta;
  }
  momentum = clamp(momentum, -meterMax, meterMax);

  let playerEnergy = Math.max(0, (state.playerEnergy ?? playerSheet.energy ?? 0) - energyCost(playerDecl, sb, steps, rules));
  let opponentEnergy = Math.max(0, (state.opponentEnergy ?? oppSheet.energy ?? 0) - energyCost(oppDecl, sb, steps, rules));
  // CCODE-39 (Erik: "if energy is depleted it shouldn't stop a fight cold… people can fight on with simple strikes
  // and defends"): being spent is a STATE, not a verdict. It is surfaced so the player can yield BY CHOICE, drink
  // something, or keep swinging steel — the engine never decides it for them.
  const spent = { player: playerEnergy <= 0, opponent: opponentEnergy <= 0 };

  // CCODE-38 (Erik: "the momentum mechanic is ending fights it shouldn't — I took one hit, still tons of energy
  // and health"): filling the meter is now a PRESSURE EVENT, not a death. The dominated side is driven back — real
  // attrition, a pressure tick — and the meter RESETS so they are still in the fight. A crushing single blow is
  // heavy pressure too, not an instant end. What ENDS a fight is now only what the player can feel and manage:
  // health gone, energy gone, the opponent breaking after breakAtPressure, mutual exhaustion, or a deliberate exit.
  const pcfg = mom.pressure || {};
  const pressure = { player: state.pressure?.player || 0, opponent: state.pressure?.opponent || 0 };
  let pressureEvent = null;
  const overwhelmed = Math.abs(momentum) >= meterMax || (delta >= crush && roundWinner);
  if (overwhelmed) {
    const dominated = (momentum > 0 || (momentum === 0 && roundWinner === "player")) ? "opponent" : "player";
    pressure[dominated] += 1;
    pressureEvent = { side: dominated, healthLoss: dominated === "player" ? (pcfg.playerHealthLoss ?? 3) : 0, pressure: pressure[dominated] };
    if (dominated === "opponent") opponentEnergy = Math.max(0, opponentEnergy - (pcfg.opponentEnergyLoss ?? 14));
    momentum = (dominated === "opponent" ? 1 : -1) * meterMax * (pcfg.resetTo ?? 0.35); // driven back, still in it
  }

  // CCODE-39: energy no longer ENDS a fight. Running dry means your crafts stop answering (a spent side can only
  // make simple, costless moves — steel and wit), not that you lose. Yielding while spent is the player's call,
  // and an energy item is a real answer to it. The opponent breaking is still the engine's own end condition.
  let resolved = null;
  if (pressure.opponent >= (pcfg.breakAtPressure ?? 3)) resolved = "player";                       // they finally break
  // the PLAYER's exit is health, owned by the app (checkIncapacitation) — a meter never decides it, and neither
  // does an empty energy pool.

  const newState = { ...state, round: (state.round || 0) + 1, momentum, playerEnergy, opponentEnergy, effects, pressure, spent, resolved, status: resolved ? "resolved" : "active" };
  return { state: newState, player: p, opponent: o, roundWinner, delta, resolved, effects, pressure, pressureEvent, spent, landed: [landedP, landedW, landedO].filter(Boolean),
    degraded: { player: !!playerDecl.spentFallback, opponent: !!oppDecl.spentFallback } };
}
