// skill_battle.js — SNG-098: the two-sided contest. Both wills declare a skill + intensity and ROLL;
// the higher net wins the round and shifts a BIDIRECTIONAL momentum meter; energy attrition is the second
// win condition. Both rolls run through resolve.js successChance (the SNG-106 rails) so each side's math is
// real and self-summing — the fog (sense.js senseOpponent) gates DISPLAY of the opponent's roll, never the
// math. Pure + deterministic (rng injectable) so duels are fair and PvP is symmetric. The narrative GM
// narrates the resolved exchange; it never chooses the opponent's mechanical move — that is opponentPolicy.

import { resolveAction } from "./resolve.js";
import { mechanicFor, rollMagnitude } from "./craftmechanics.js";   // SNG-263: a craft's own magnitudes, with family fallback

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
  // CCODE-52 (Erik: "opponent stats need to not be capped like that. We need a threat system for the world that
  // can handle all levels of play"). attributeCeiling 6 / tierCeiling 4 meant EVERY foe at threat ≥ 70 was
  // mechanically identical — an epic was no harder than a threat-70 raider, so the world had no upper tail and
  // "run from this" could never be the right answer. The ceilings are gone; the floors stay, and growth goes
  // sub-linear past a knee so a threat-300 thing is fearsome without the arithmetic running away. A ceiling is
  // still readable as a dial for anyone who wants to re-impose one.
  const curve = (v, knee) => (v <= knee ? v : knee + Math.pow(v - knee, syn.aboveKneeExponent ?? 0.75));
  const attrRaw = curve(threat * (syn.threatToAttribute ?? 0.08), syn.attributeKnee ?? 6);
  const tierRaw = curve(threat * (syn.threatToTier ?? 0.06), syn.tierKnee ?? 4);
  const attr = Math.max(syn.attributeFloor ?? 2, Math.round(Number.isFinite(syn.attributeCeiling) ? Math.min(attrRaw, syn.attributeCeiling) : attrRaw));
  const tier = Math.max(syn.tierFloor ?? 1, Math.round(Number.isFinite(syn.tierCeiling) ? Math.min(tierRaw, syn.tierCeiling) : tierRaw));
  const energy = Math.round((syn.energyBase ?? 40) + threat * (syn.threatToEnergy ?? 1.2));
  const tags = opponent.tacticTags || [];
  if (opponent.skills?.length) { // authored override — a real, hand-built sheet
    return { name: opponent.name || "the opponent", attributes: opponent.attributes || { practical: attr, physical: attr, mental: attr, social: attr },
      energy: opponent.energy ?? energy, maxEnergy: opponent.energy ?? energy, tacticTags: tags, skills: opponent.skills, authored: true };
  }
  // SNG-253 (scoped from the post-252 re-look): the opponent's move VOCABULARY was kind-blind. Verified against
  // this engine rather than predicted — a STANDOFF opponent declared "a hard strike" and held "a raised guard",
  // in a contest the ribbon had just told the player "cannot hurt you"; a CHASE pursuer did the same instead of
  // closing or cutting you off. All five authored archetypes (berserker/duelist/trickster/warden/default) are
  // fight verbs, and tacticTags was the only selector, so every non-fight kind fell through to the fight default.
  //
  // Selection order: the KIND's archetype, then an explicit tacticTag — a tag is the most specific thing an
  // author can say about THIS opponent, so it still wins. Kind is THREADED IN, never inferred here, so one
  // source decides it (seam_encounter_kind_single_source). Purely additive: with no per-kind archetypes
  // authored this resolves exactly as it did before, so the engine half lands safely ahead of the content.
  // Aevi owns the per-kind verb sets.
  const arche = syn.archetypeSkills || {};
  let defs = arche.default || [{ function: "strike", name: "a hard strike" }, { function: "shield", name: "a raised guard" }];
  const kindDefs = opponent.encounterKind ? arche[`kind:${opponent.encounterKind}`] : null;
  if (Array.isArray(kindDefs) && kindDefs.length) defs = kindDefs;
  for (const t of tags) if (arche[t]) { defs = arche[t]; break; }
  const skills = defs.map(s => ({ function: s.function, name: s.name, tier, attribute: s.attribute || "practical" }));
  return { name: opponent.name || "the opponent", attributes: { practical: attr, physical: attr, mental: attr, social: attr },
    energy, maxEnergy: energy, tacticTags: tags, skills, synthesized: true };
}

/** The opponent's move for this round — DETERMINISTIC engine policy (not GM invention). Behind on momentum
 *  → press (Surge); ahead → pace (Conserve); tacticTags bias it. Skill pick: the function that matches up
 *  best against the player's last-SHOWN tendency (only what the fog let the opponent read of the player). */
export function opponentPolicy(oppSheet, state = {}, seenPlayerTendency = null, sb) {
  // SNG-247 Tier 3: a STATIC antagonist makes no choices — it holds, the same way, every round. Returning early is
  // the point: running the scoring loop on a door would give it tactics it does not have, and the variety term
  // would make it "vary" its response to being read, which is a lie about what a sealed thing is.
  if (oppSheet?.static) {
    const hold = (oppSheet.skills || [])[0] || { function: "ward", name: "it holds", tier: 2 };
    return { function: hold.function, name: hold.name, tier: hold.tier || 2, attribute: "practical", intensity: "standard", static: true };
  }
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

/** CCODE-41 (Erik): is `side` locked out of a phase this round by a standing effect? A craft can blind you to your
 *  own senses — *"if the opposing skill has blinded you to the sense skills you might have"* — which denies the
 *  SETUP phase and sends you straight to your action. Pure; content owns which effects deny what (deniesPhase). */
export function phaseDenied(effects, side, phase) {
  return (effects || []).some(fx => fx.side === side && fx.deniesPhase === phase);
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
    // CCODE-41: deniesPhase must ride from the content def onto the LIVE effect — without this copy, phaseDenied
    // reads undefined on every effect and the blinding counterplay is inert while still advertised in content.
    ...(def.deniesPhase ? { deniesPhase: def.deniesPhase } : {}),
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
// ---------- SNG-247 Tier 3: THE STATIC ANTAGONIST ----------
// A sealed door and a stretch of hard ground have no turn. Giving them an opponent SHEET that chooses and rolls
// would mean inventing an agent — the same error class as inventing a fight target (SNG-246 A). But `rollSide`
// produces a MARGIN, and a fixed margin is exactly what a DC is. So an unopposed thing is a side that never
// chooses and never rolls: it resists at one number, forever, and everything else about the contest still applies.
// It stays honest under SNG-106 because its resistance enters as a NAMED contestMod like every other term — a bind
// laid on the door still weakens it, visibly, on the same self-summing breakdown.

/** SNG-247 Tier 3: a sheet for a thing that resists but never acts. `resist` is its standing margin (its DC). Pure. */
export function synthesizeStaticSheet(thing = {}, sb) {
  const cfg = sb?.staticAntagonist || {};
  return {
    static: true,
    staticResist: clamp(Math.round(thing.resist ?? thing.threat ?? cfg.defaultResist ?? 18), -50, 90),
    resistLabel: thing.resistLabel || cfg.resistLabel || "it resists, unmoving",
    attributes: {}, subAttributes: {}, alignment: {}, skills: [
      { function: thing.holdFunction || cfg.holdFunction || "ward", name: thing.holdName || "it holds", tier: thing.tier || 2 },
    ],
    // its "energy" is how much give is left in it — pressure ticks spend it down, which IS understanding it better
    energy: thing.give ?? cfg.defaultGive ?? 60,
    tacticTags: ["unmoving"],
  };
}

/** SNG-247 Tier 3: margin → degree for a side that never rolled. Content-dialled; pure. */
function staticDegree(margin, sb) {
  const b = sb?.staticAntagonist?.degreeBands || {};
  if (margin >= (b.crit ?? 40)) return "crit_success";
  if (margin >= (b.success ?? 15)) return "success";
  if (margin >= (b.partial ?? 0)) return "partial";
  if (margin >= (b.failure ?? -15)) return "failure";
  return "crit_failure";
}

function rollSide(sheet, decl, oppDecl, sb, steps, rules, rng, fxMods = [], momMod = 0, setupMod = 0) {
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
      // CCODE-45: what your SENSE step bought this action — a named line, never a hidden fudge.
      ...(setupMod ? [{ label: setupMod > 0 ? "you read them first" : "they read you first", value: setupMod }] : []),
      // CCODE-43: what you are WIELDING, when it suits this move. Its own named line, so a dagger and an axe are
      // visibly different choices rather than an invisible thumb on the scale.
      ...(decl.wield?.value ? [{ label: decl.wield.label || "wielded gear", value: decl.wield.value }] : []),
      ...fxMods
    ]
  };
  // SNG-247 Tier 3: a STATIC side never rolls — it resists at one number. Its resistance is a NAMED line on the
  // same self-summing breakdown, so a bind laid on the door still weakens it and you can SEE that it did.
  if (sheet.static) {
    const mods = [{ label: sheet.resistLabel || "it resists, unmoving", value: sheet.staticResist ?? 0 }, ...ctx.contestMods];
    const margin = mods.reduce((a, m) => a + (m.value || 0), 0);
    return { roll: 0, chance: margin, rawChance: margin, margin, degree: staticDegree(margin, sb),
      breakdown: { contestMods: mods, static: true }, matchup: mu, intensity: decl.intensity, tier,
      function: decl.function, name: decl.name || decl.function, effectMods: fxMods, woven: null, static: true };
  }
  const res = resolveAction(ctx, rng);
  // CCODE-40 (Erik, exact): "All of the bonuses and penalties need to be stacked and compared PRIOR to a clamp. If
  // I have +35 due to abilities and skills and the enemy has +25 but has also landed a bind on me (-15) the net
  // difference would be (-5) to my roll." The margin was computed from the CLAMPED chance, so once a capable
  // character hit the 95% ceiling every further term — a bind laid on them, a woven craft, momentum, a guard —
  // was silently discarded and the contest read as a tie of two 95s. The fix is surgical and keeps both truths:
  //   • DEGREE still uses the clamped chance — the ceiling exists so your own action can always fail.
  //   • The CONTEST margin uses the RAW pre-clamp stack, so every named term actually reaches the comparison.
  const rawChance = res.breakdown?.clampedFrom ?? res.chance;
  return { ...res, rawChance, margin: rawChance - res.roll, matchup: mu, intensity: decl.intensity, tier, function: decl.function, name: decl.name || decl.function, effectMods: fxMods, woven: decl.woven || null };
}


// ---------- CCODE-46: what the player can SEE before committing ----------
// Erik: "The skills should also bring in the players read of how likely each are to succeed. just like normal play,
// but with all the opposed and conditions incorporated. If the enemy uses umbracraft then I might not be able to
// tell certain success chances as well - unless of course i have a radiant skill."
//
// Two honest halves:
//   1. the ESTIMATE — a real contested win-chance, not a solo success roll. You win the exchange when your margin
//      beats theirs, i.e. when (theirRoll - yourRoll) > (theirStack - yourStack). Both rolls are d100, so the
//      difference is triangular and the probability is closed-form.
//   2. the CONFIDENCE — itself fogged. Reading them buys precision; holding a COUNTER-craft to what they use buys
//      it too (light finds shadow: a reveal-user can price a concealer). At low confidence we show a BAND, never a
//      fabricated number — the fog hides what you know, it never lies about it.

/** P(D > g) where D = d2 - d1, both uniform 1..100. Closed form; pure. */
export function pDiffExceeds(g) {
  const n = 100;
  if (g <= -n) return 1;
  if (g >= n) return 0;
  if (g >= 0) { const k = n - g; return (k * (k - 1)) / (2 * n * n); }
  const k = n + g; return 1 - (k * (k - 1)) / (2 * n * n);
}

/** Do I hold a craft that COUNTERS what they are doing? That is the "unless of course i have a radiant skill"
 *  clause — a favourable matchup against their function means I can price this exchange far better. */
export function hasCounterCraft(mySkills, theirFunction, sb) {
  return (mySkills || []).some(s => matchupBonus(s.function, theirFunction, sb) > 0);
}

/** The player's READ on one candidate move: an estimated chance to win the exchange, and how much to trust it.
 *  `theirStack` is the engine's honest estimate of the opponent's raw total; confidence gates how it is shown. */
export function estimateExchange({ myStack, theirStack, fogTier = 0, counterCraft = false, sb }) {
  const cfg = sb?.oddsPreview || {};
  const conf = Math.min(3, (cfg.confidenceByFogTier?.[Math.max(0, Math.min(3, fogTier))] ?? fogTier)
    + (counterCraft ? (cfg.counterCraftBonus ?? 1) : 0));
  const pct = Math.round(pDiffExceeds((theirStack || 0) - (myStack || 0)) * 100);
  const bands = cfg.bands || [{ at: 80, label: "near certain" }, { at: 62, label: "likely" },
    { at: 45, label: "even odds" }, { at: 28, label: "unlikely" }, { at: 0, label: "a long shot" }];
  const band = (bands.find(b => pct >= b.at) || bands[bands.length - 1]).label;
  // conf 0 = you cannot price them at all; 1 = a band only; 2 = a band + a rough number; 3 = the number.
  return { pct, band, confidence: conf,
    show: conf <= 0 ? "none" : conf === 1 ? "band" : conf === 2 ? "rough" : "exact",
    label: conf <= 0 ? (cfg.unreadableLabel || "you cannot price this yet")
      : conf === 1 ? band
      : conf === 2 ? `${band} (~${Math.round(pct / 10) * 10}%)`
      : `${pct}%` };
}

/** CCODE-46 (Erik): "the finish It button should be an indicator on skills instead of a button. any harm skill,
 *  even the basic, could eventually be tagged with finish it. Instakill skills have that from the beginning."
 *  A craft that CAN kill carries the potential from the start; an ordinary harm craft EARNS it by tier. Pure. */
export function finisherPotential(skill, def, sb) {
  const cfg = sb?.finisher || {};
  const harm = (sb?.persistentEffects?.attackFunctions || ["strike", "break"]).includes(skill?.function);
  if (!harm) return null;
  const rung = def?.harmRung || skill?.harmRung || "none";
  if ((cfg.alwaysAtHarmRung || ["lethal", "atrocity"]).includes(rung)) return { can: true, why: "innate", rung };
  const at = cfg.finisherTierAt ?? 3;
  if ((skill?.tier || 1) >= at) return { can: true, why: "earned", rung };
  return { can: false, why: "needs-tier", needTier: at, rung };
}

/** CCODE-42 (Erik): a finisher's chance to END the fight outright is SITUATIONAL, not flat.
 *  "against a healthy foe of equal level it might be a 50/50 ... but against a run down opponent when you have the
 *  momentum it's a near certainty ... just like it's a lower chance with the momentum against you or against a high
 *  level opponent." Base by how lethal the craft is, then moved by their condition, your momentum, and the tier gap.
 *  Pure. Returns { pct, reasons[] } so the UI can show WHY, never just a number. */
export function finishOdds({ skill, def, oppSheet, state = {}, sb }) {
  const cfg = sb?.finisher?.odds || {};
  const pot = finisherPotential(skill, def, sb);
  if (!pot?.can) return null;
  const rung = pot.rung || "none";
  let pct = (cfg.baseByRung || {})[rung] ?? 10;
  const reasons = [`${rung === "none" ? "a plain blow" : rung} — base ${pct}%`];
  // momentum: yours raises it, theirs lowers it
  const mom = state.momentum || 0;
  if (mom) {
    const d = Math.round(mom * (cfg.perMomentumPoint ?? 2.5));
    pct += d;
    reasons.push(`${d >= 0 ? "you hold the momentum" : "the momentum is against you"} ${d >= 0 ? "+" : ""}${d}`);
  }
  // tier gap: out-classing them helps, being out-classed hurts
  const myTier = skill?.tier || 1;
  const theirTier = Math.max(1, ...((oppSheet?.skills || []).map(x => Number(x.tier) || 1)));
  if (myTier !== theirTier) {
    const d = (myTier - theirTier) * (cfg.perTierGap ?? 7);
    pct += d;
    reasons.push(`${d >= 0 ? "you out-class them" : "they out-class you"} ${d >= 0 ? "+" : ""}${d}`);
  }
  // their condition: a run-down foe is far easier to finish — "near certainty"
  const maxE = oppSheet?.maxEnergy || oppSheet?.energy || 0;
  const nowE = state.opponentEnergy ?? maxE;
  if (maxE > 0 && nowE / maxE <= (cfg.wornDownAtEnergyPct ?? 0.3)) {
    pct += cfg.wornDownBonus ?? 30;
    reasons.push(`they are run down +${cfg.wornDownBonus ?? 30}`);
  }
  const pressed = state.pressure?.opponent || 0;
  if (pressed) { const d = pressed * (cfg.pressureBonus ?? 12); pct += d; reasons.push(`you have driven them back ${pressed}\u00d7 +${d}`); }
  pct = Math.max(cfg.floor ?? 2, Math.min(cfg.ceiling ?? 95, Math.round(pct)));
  return { pct, reasons, rung };
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
/** CCODE-51: what RESISTS being read. Their concealing craft when they have one (its tier is real opposition),
 *  else a flat passive off their sharpest attribute — a foe who is not hiding is easier to read, which is right.
 *  Returns a NAMED value so it can sit on a breakdown like every other term. Pure. */
export function senseResistOf(oppSheet = {}, sb) {
  const cfg = sb?.senseStep || {};
  const hideFns = cfg.concealFunctions || ["conceal", "deceive"];
  const hide = (oppSheet.skills || []).find(x => hideFns.includes(x.function));
  if (hide) return { value: Math.round((hide.tier || 1) * (cfg.concealTierWeight ?? 6)), label: `they are hiding it (${hide.name || hide.function})`, from: "craft" };
  const best = Math.max(0, ...Object.values(oppSheet.attributes || {}).map(Number).filter(Number.isFinite));
  return { value: Math.round(best * (cfg.passiveAttributeWeight ?? 3)), label: "their natural guardedness", from: "passive" };
}

/** CCODE-51 (Erik's ladder): the sense TIER is earned by the read's DEGREE — fail 0, partial 1, success 2, and a
 *  crit (or a decisive margin) 3. Pure; every band is a content dial. */
export function senseTierFromDegree(degree, margin, sb) {
  const cfg = sb?.senseStep?.tierByDegree || {};
  if (degree === "crit_success") return cfg.crit ?? 3;
  if (degree === "success") return (margin >= (cfg.decisiveMargin ?? 25)) ? (cfg.crit ?? 3) : (cfg.success ?? 2);
  if (degree === "partial") return cfg.partial ?? 1;
  return cfg.failure ?? 0;
}

export function battleRound({ playerDecl, oppDecl, playerSheet, oppSheet, state = {}, rules, sb, steps, rng = Math.random,
  // CCODE-45: a TURN is sense -> action -> bonus. Both options DEFAULT to today's behaviour, so every existing
  // caller is untouched: phase "action" resolves exactly as before, and tickEffects true ticks per exchange.
  // The turn orchestrator passes phase:"sense" (no momentum, no pressure — it PREPARES) and tickEffects:false on
  // every step but the last, so a turn's effects tick exactly once.
  // SNG-247 Tier 1: WHICH BOUNDED THING this is. The contest core is already kind-agnostic — two sheets, two
  // rolls, a margin delta driving a meter. The one fight-shaped thing in it was the EXIT RULE (what a pressure
  // tick costs each side, how many ticks break them), and that is now per-kind CONTENT. Defaults to "fight", so
  // every existing caller resolves EXACTLY as before.
  phase = "action", tickEffects: doTick = true, setupBonus = 0, kind = "fight" }) {
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
  const p = rollSide(playerSheet, playerDecl, oppDecl, sb, steps, rules, rng, effectMods(standing, "player", playerDecl, oppDecl, sb), momentumModifier(state.momentum || 0, "player", sb), setupBonus);
  const o = rollSide(oppSheet, oppDecl, playerDecl, sb, steps, rules, rng, effectMods(standing, "opponent", oppDecl, playerDecl, sb), momentumModifier(state.momentum || 0, "opponent", sb), -setupBonus);
  // CCODE-45: effects tick ONCE PER TURN, not per step — Erik: "the sustaining effects would not tick down a count
  // until the full round's actions are complete." The orchestrator passes tickEffects:false on every step but the last.
  let effects = doTick ? tickEffects(standing) : standing.slice();
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
  // CCODE-45: a SENSE step PREPARES — it never moves the meter. Otherwise momentum swings up to 3× per turn and
  // the CCODE-38 pressure pacing (measured over 1200 fights/threat-level) is invalidated. Content dial.
  const turnCfg = sb.turn || {};
  const senseStep = phase === "sense" && turnCfg.senseMovesMomentum !== true;
  let momentum = state.momentum || 0, roundWinner = null, delta = 0;
  if (p.margin !== o.margin) {
    roundWinner = p.margin > o.margin ? "player" : "opponent";
    delta = Math.abs(p.margin - o.margin) * marginScale;
    if (!senseStep) momentum += roundWinner === "player" ? delta : -delta;
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
  // SNG-247 Tier 1: THE EXIT RULE IS PER-KIND CONTENT, NOT FIGHT-SHAPED CODE. A pressure tick costs what the
  // bounded thing actually takes from you — a fight costs blood, a chase costs wind, a standoff costs composure,
  // a sealed thing costs only the effort of trying again. `sb.kinds[kind]` names that; absent an entry the
  // fight's own numbers hold, so kind:"fight" (the default) is bit-identical to before.
  const kcfg = (sb.kinds || {})[kind] || {};
  const pcfg = { ...(mom.pressure || {}), ...(kcfg.pressure || {}) };
  // What a tick TAKES from a side. An explicit per-kind {health, energy} wins; else the fight's legacy keys —
  // the player pays in health (applied by the app, which owns the player's body), the opponent in energy.
  const lossFor = (side) => {
    const explicit = side === "player" ? kcfg.playerLoss : kcfg.opponentLoss;
    if (explicit) return { health: explicit.health || 0, energy: explicit.energy || 0 };
    return side === "player"
      ? { health: pcfg.playerHealthLoss ?? 3, energy: pcfg.playerEnergyLoss ?? 0 }
      : { health: pcfg.opponentHealthLoss ?? 0, energy: pcfg.opponentEnergyLoss ?? 14 };
  };
  const pressure = { player: state.pressure?.player || 0, opponent: state.pressure?.opponent || 0 };
  let pressureEvent = null;
  const overwhelmed = !senseStep && (Math.abs(momentum) >= meterMax || (delta >= crush && roundWinner));
  if (overwhelmed) {
    const dominated = (momentum > 0 || (momentum === 0 && roundWinner === "player")) ? "opponent" : "player";
    pressure[dominated] += 1;
    const loss = lossFor(dominated);
    // `label` is what a tick is CALLED in this kind ("driven back" / "ground lost" / "your point gives") — the
    // receipt's word for it, so a chase never reads as a mis-labelled fight.
    pressureEvent = { side: dominated, healthLoss: loss.health, energyLoss: loss.energy, pressure: pressure[dominated], label: kcfg.pressureLabel || null };
    if (dominated === "opponent") opponentEnergy = Math.max(0, opponentEnergy - loss.energy);
    else playerEnergy = Math.max(0, playerEnergy - loss.energy);
    momentum = (dominated === "opponent" ? 1 : -1) * meterMax * (pcfg.resetTo ?? 0.35); // driven back, still in it
  }

  // CCODE-39: energy no longer ENDS a fight. Running dry means your crafts stop answering (a spent side can only
  // make simple, costless moves — steel and wit), not that you lose. Yielding while spent is the player's call,
  // and an energy item is a real answer to it. The opponent breaking is still the engine's own end condition.
  // CCODE-51 (Erik: "the fight ends even though the strike didn't seem to land… I can't seem to actually
  // wound/damage an opponent"). He was right, and it was structural: CCODE-38 replaced momentum-as-death with
  // PRESSURE and never put DAMAGE back, so opponentHealth was set at startEncounter and never moved again. A
  // skill battle had no wounds and no way to kill — it was a two-tick pressure race that reported "they yield"
  // whether or not anything landed.
  //
  // Damage is now what a WON exchange with a HARM verb does. Pressure stays what it became — being driven back —
  // so the two tracks answer different questions: pressure is position, health is injury. Only the side that WON
  // the exchange deals it, only with a harming verb, and it scales with the margin (a clean hit hurts more than a
  // scraping one) — so a turned-aside blow does nothing, which is what Erik watched fail to happen.
  const dcfg = sb.damage || {};
  const harmFns = new Set(dcfg.harmFunctions || sb.persistentEffects?.attackFunctions || ["strike", "break"]);
  let opponentHealth = state.opponentHealth ?? oppSheet.health ?? null;
  let damage = null;
  // A kind whose LOSING costs no health deals no DAMAGE either — the same ruling, read once. Caught by the
  // SNG-247 tests the moment damage was added: without this a standoff drew blood, which is exactly what
  // `losingCostsHealth: false` was written to forbid. A contest of wills cannot wound you from either side.
  const kindDealsDamage = kcfg.outcomes?.losingCostsHealth !== false;
  if (!senseStep && roundWinner && dcfg.enabled !== false && kindDealsDamage) {
    const winDecl = roundWinner === "player" ? playerDecl : oppDecl;
    const winRoll = roundWinner === "player" ? p : o;
    const loseRoll = roundWinner === "player" ? o : p;
    if (harmFns.has(winDecl.function)) {
      const marginGap = Math.max(0, (winRoll.margin || 0) - (loseRoll.margin || 0));
      // SNG-263 §7: the damage is the CRAFT's now, and it is ROLLED. The formula below was
      // `base + tier*0.5 + marginGap*0.06` keyed off the function FAMILY — so every strike-craft in the game
      // hit for the same number, and a Tier-V capstone differed from a Tier-I basic by a flat per-tier term.
      // If the craft (or, until the catalog is authored, its family) resolves a damage band, roll it. Margin
      // raises the FLOOR rather than adding a bonus: a decisive blow cannot land feeble, and no blow can
      // exceed what the craft itself says it can do. Read off `rules` rather than a new battleRound option
      // on purpose — seam_battle_round_options has bitten four times, and a value the wrapper already
      // carries cannot be dropped on the way in.
      let hit = null;
      const cmCfg = rules?.craftMechanics;
      if (cmCfg?.families) {
        const m = mechanicFor(winDecl, { verb: winDecl.function, tier: winDecl.tier,
          rank: winDecl.rank || 1, intensity: winDecl.intensity || "standard", cfg: cmCfg });
        if (m?.shape === "damage" && m.fields?.max != null) hit = Math.max(dcfg.minHit ?? 1, rollMagnitude(m.fields, rng, { marginGap }));
      }
      if (hit == null) {
        const raw = (dcfg.base ?? 1)
          + (winDecl.tier || 1) * (dcfg.perTier ?? 0.5)
          + marginGap * (dcfg.perMarginPoint ?? 0.06);
        hit = Math.max(dcfg.minHit ?? 1, Math.round(raw));
      }
      damage = { side: roundWinner === "player" ? "opponent" : "player", amount: hit, verb: winDecl.function, by: winDecl.name || winDecl.function };
      if (roundWinner === "player" && opponentHealth != null) opponentHealth = Math.max(0, opponentHealth - hit);
      // the PLAYER's health is the app's to apply (checkIncapacitation owns that exit) — reported, never written here
    }
  }

  let resolved = null;
  // Health reaching zero ENDS it — a foe can be put down. Whether that reads as FELL or YIELDED is the caller's
  // call (encounters.js already owns `def.opponent.yieldAt`), so the engine only reports that they are finished.
  // This is the exit Erik was looking for and could not reach: "test out what happens when I kill an opponent."
  if (opponentHealth != null && opponentHealth <= 0) resolved = "player";
  else if (pressure.opponent >= (pcfg.breakAtPressure ?? 3)) resolved = "player";                  // or they finally break
  // SNG-247 Tier 2b: a kind where LOSING COSTS NO HEALTH needs its own player-break condition, or the player can
  // never lose it — a chase would run forever because being run down isn't damage. A FIGHT deliberately has none:
  // health owns the player's exit there (CCODE-39), and adding one would take that back from them.
  else if (Number.isFinite(pcfg.playerBreaksAtPressure) && pressure.player >= pcfg.playerBreaksAtPressure) resolved = "opponent";
  // the PLAYER's exit is health, owned by the app (checkIncapacitation) — a meter never decides it, and neither
  // does an empty energy pool.

  // CCODE-45: a sense step doesn't advance the ROUND counter either — the whole turn is one round.
  const newState = { ...state, round: (state.round || 0) + (senseStep ? 0 : 1), momentum, playerEnergy, opponentEnergy, effects, pressure, spent, resolved, opponentHealth, status: resolved ? "resolved" : "active" };
  const out = { state: newState, player: p, opponent: o, roundWinner, delta, resolved, effects, pressure, pressureEvent, spent, damage, opponentHealth, landed: [landedP, landedW, landedO].filter(Boolean),
    degraded: { player: !!playerDecl.spentFallback, opponent: !!oppDecl.spentFallback } };
  // What the SENSE step bought: a named bonus on the coming action (signed toward whoever read better), and —
  // on a crit read — the bonus step. "It's the payoff." Both are content dials.
  if (phase === "sense") {
    const scale = turnCfg.setupBonusScale ?? 0.3, cap = turnCfg.setupBonusMax ?? 12;
    // CCODE-51 (Erik, decisive): "a Read/Sense should NOT depend on out-sensing them. It should depend on your
    // sense skill and all modifiers vs their relevant attribute/conceal skill and modifiers."
    // It DID depend on out-sensing them: `o.margin` is whatever the opponent declared that step — usually a
    // STRIKE — so reading a foe who was swinging meant beating their swing with your eyes. The read is now
    // opposed by what actually resists BEING READ: their concealing craft if they have one, else a flat passive
    // off their sharpest attribute. A foe who isn't hiding is simply easier to read, which is right.
    const resist = senseResistOf(oppSheet, sb);
    out.senseResist = resist;
    out.setupBonus = clamp(Math.round((p.margin - resist.value) * scale), -cap, cap);
    // Erik's ladder: "a failed roll should drop the sense tier that round to 0. a partial should give you tier 1,
    // success 2, and a large success margin and/or a crit success tier 3." What you LEARN is earned by the roll
    // now, not by a standing character stat — a read is a thing you DO, not a thing you have.
    out.senseTier = senseTierFromDegree(p.degree, p.margin - resist.value, sb);
    const grants = turnCfg.bonusOnDegrees || ["crit_success"];
    out.bonusEarned = { player: grants.includes(p.degree), opponent: grants.includes(o.degree) };
  }
  return out;
}
