// skill_battle.js — SNG-098: the two-sided contest. Both wills declare a skill + intensity and ROLL;
// the higher net wins the round and shifts a BIDIRECTIONAL momentum meter; energy attrition is the second
// win condition. Both rolls run through resolve.js successChance (the SNG-106 rails) so each side's math is
// real and self-summing — the fog (sense.js senseOpponent) gates DISPLAY of the opponent's roll, never the
// math. Pure + deterministic (rng injectable) so duels are fair and PvP is symmetric. The narrative GM
// narrates the resolved exchange; it never chooses the opponent's mechanical move — that is opponentPolicy.

import { resolveAction } from "./resolve.js";
import { chooseTarget, foeKnowledge } from "./targeting.js";
import { damageMixOf, wardAnswer, resolveComposite } from "./damagetypes.js";   // CCODE-281: composite damage, and the reader `wardTypes` never had
import { predictAggregate, distributeCasualties, combatWeight } from "./melee.js";   // CCODE-298: the folded line takes losses too   // CCODE-274: the folded party contributes as a measured aggregate, not as N more rolls   // CCODE-250: a foe chooses who to hit
import { groupCapability, loadBearing } from "./group.js";   // CCODE-322/323: what the line covers, who holds it alone, and how much of it they can bring
import { redirectImposition, interceptorFor, catchesCondition, catchesDamage } from "./intercept.js";
import { persistsUntilHealed, persistedConditionName } from "./conditions.js";   // CCODE-296: the readers that accept BOTH authored shapes
import { downEntity } from "./combatants.js";   // CCODE-298: the first path that can fire an authored downedEffect   // CCODE-296: the readers that accept BOTH authored shapes   // CCODE-250: …and someone may step in front of it
import { mechanicFor, rollMagnitude, resolveHeal, resolveImposition, antisoakLanded, ongoingHarmOf, authoredBlock, resolveProvoke, resolveSoothe, rollOperative } from "./craftmechanics.js";   // SNG-263: a craft's own magnitudes, with family fallback

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** ⛔ CCODE-290 — THIS WAS MISSING AND ALREADY BEING CALLED. `num(dcfg?.minHit, 1)` entered the composite
 *  damage path in CCODE-281, and `num` was never defined in this file nor imported into it.
 *  ⚠️ IT HAS NEVER THROWN, because that line runs only when the TARGET SHEET carries `wardTypes` — and no
 *  test, fixture or authored foe ever gave one. So a ReferenceError sat in the damage path for two days,
 *  behind a condition nothing met. ⛔ A CRASH LIKE THAT DOES NOT HIDE, IT WAITS. Found by walking into it
 *  while wiring soak, which is the only reason it is not still there. */
const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
const DEFAULT_STEPS ={ conserve: { energyMult: 0.6, effectMod: -8 }, standard: { energyMult: 1, effectMod: 0 }, surge: { energyMult: 1.6, effectMod: 10, backlashChance: 0.25 } };

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
  // SNG-263 r4 GAP1: HEALTH now scales on the same knee-curve as attribute and tier. This block derived
  // attribute, tier and energy from threat and carried no health term at all, so every synthesised foe fell
  // back to the hardcoded 5 in encounters.js — an epic and a rat had the same five hit points, and no amount
  // of damage tuning could ever make a legendary fight feel unlike a rat's.
  const health = Math.max(syn.healthFloor ?? 3,
    Math.round((syn.healthBase ?? 4) + curve(threat * (syn.threatToHealth ?? 0.09), syn.healthKnee ?? 12)));
  // GAP2: SOAK is what a landed hit must overcome. Nothing in the engine reduced damage — no armour, no
  // damage reduction, no temporary hit points — so there was nothing to overcome, and nothing for ward or
  // shield to actually DO.
  const soak = Math.max(0, Math.round((syn.soakBase ?? 0) + curve(threat * (syn.threatToSoak ?? 0.02), syn.soakKnee ?? 4)));
  // SNG-263: soak is a STACK OF RANKED LAYERS, not one flat number — Aevi's radiant pass showed the catalog
  // already assumed it. radiant_lance r2 cuts "LIGHT ARMOR" and r3 beats "a Harmonic shield's FIRST RANK":
  // penetration is meant to beat guard BY DEGREE. The total is unchanged; this decides how it is DISTRIBUTED,
  // and therefore what a penetrating craft can bypass. A riffraff has no layer at all; an epic has two.
  const rankAt = syn.soakRankAt || [0, 3, 6];
  const soakLayers = [];
  { let left = soak;
    for (let i = 0; i < rankAt.length && left > 0; i++) {
      if (soak < (rankAt[i] ?? Infinity)) break;
      const take = (i === rankAt.length - 1) ? left : Math.ceil(soak / rankAt.length);
      const value = Math.min(left, Math.max(1, take));
      soakLayers.push({ rank: i + 1, value });
      left -= value;
    }
    if (left > 0 && soakLayers.length) soakLayers[soakLayers.length - 1].value += left;
  }
  const tags = opponent.tacticTags || [];
  if (opponent.skills?.length) { // authored override — a real, hand-built sheet
    return { name: opponent.name || "the opponent", attributes: opponent.attributes || { practical: attr, physical: attr, mental: attr, social: attr },
      energy: opponent.energy ?? energy, maxEnergy: opponent.energy ?? energy, tacticTags: tags, skills: opponent.skills,
      health: opponent.health ?? health, soak: opponent.soak ?? soak, soakLayers: opponent.soakLayers ?? soakLayers,
    // CCODE-83: the creature's authored AFFINITY must reach the sheet, or a typed bestiary is prose again.
    ...(opponent.affinity ? { affinity: opponent.affinity } : {}), ...(opponent.class ? { creatureClass: opponent.class } : {}), authored: true };
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
    energy, maxEnergy: energy, tacticTags: tags, skills,
    health: opponent.health ?? health, soak: opponent.soak ?? soak, soakLayers: opponent.soakLayers ?? soakLayers,
    // CCODE-83: the creature's authored AFFINITY must reach the sheet, or a typed bestiary is prose again.
    ...(opponent.affinity ? { affinity: opponent.affinity } : {}), ...(opponent.class ? { creatureClass: opponent.class } : {}), synthesized: true };
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
  // ⛔ CCODE-331 — THE CHOSEN CRAFT SURVIVES THE CHOICE. This built a fresh object from four fields and
  // dropped everything else on `pick`, so a skill's `abilityId` and `mechanic` never reached `battleRound`.
  // `mechanicFor` then found no authored block and fell to the family default for EVERY policy-driven
  // combatant in the game.
  //
  // ⚠️ MEASURED, NOT REASONED: one authored sheet carrying a 1d6 skill and a 12d6 skill dealt the SAME
  // 8.64 mean either way. ⛔ WHICH CRAFT A FOE CHOSE COULD NOT CHANGE WHAT IT DID — the scoring loop above
  // picked carefully between weapons that were all the same weapon.
  //
  // ⚠️ ERIK: "the skill use is what will provide the differences." It could not, until this line.
  //
  // ⚠️ SAFE BY CONSTRUCTION: a SYNTHESIZED sheet's skills carry exactly {function,name,tier,attribute},
  // so spreading one is a no-op and every generated foe behaves precisely as before. Only an AUTHORED sheet
  // — the hand-built kind that already passes `opponent.skills` through verbatim — gains anything, which is
  // the one case where a craft identity existed to lose.
  return { ...pick, function: pick.function, name: pick.name, tier: pick.tier || 1,
    attribute: pick.attribute || "practical", intensity };
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
function effectFrom(decl, roll, actor, sb, { cm = null, rng = Math.random } = {}) {
  const cfg = sb?.persistentEffects; if (!cfg) return null;
  const def = cfg.byFunction?.[decl.function]; if (!def) return null;
  const ok = (cfg.requiresDegree || ["crit_success", "success", "partial"]).includes(roll.degree);
  if (!ok) return null;
  const partial = roll.degree === "partial";
  const value = Math.round((def.value || 0) * (partial ? (cfg.partialValueMult ?? 0.5) : 1));
  if (!value) return null;
  let rounds = Math.max(1, (def.rounds || 1) + (roll.degree === "crit_success" ? (cfg.critBonusRounds ?? 0) : 0));

  // CCODE-77 — HOW LONG IT LASTS COMES FROM THE CRAFT, NOT THE VERB. `def.rounds` is one number per verb, so a
  // T-V bind held exactly as long as a T-I one and an authored `duration` reached nothing: SNG-263's finding
  // in a place nobody had looked. Where the craft's own shape is ABOUT duration, that is the number, rolled —
  // which is also what finally gives Aevi's `variance` something to widen on the eight churnfolk crafts that
  // are not damage.
  //
  // Two deliberate limits. Rounds are CLAMPED (`craftDurationMax`), because a craft's duration ladder runs to
  // 17 and a fight is not 17 rounds long — the tier advantage should be felt, not decisive on its own. And
  // `value` is left alone: a contest-mod and a craft magnitude are different currencies, and quietly making
  // one drive the other is how a number ends up serving two masters.
  // CCODE-82: does holding this cost your attention? Read from the craft, defaulting to NO — which is
  // what every guard already did.
  const tend = { requiresAttention: !!(decl?.mechanic?.[decl.function]?.requiresAttention ?? decl?.mechanic?.requiresAttention),
                 autonomous: !!(decl?.mechanic?.[decl.function]?.autonomous ?? decl?.mechanic?.autonomous),
                 rank: decl?.mechanic?.[decl.function]?.soakRank ?? decl?.mechanic?.soakRank ?? null };
  const durCfg = cfg.craftDuration || {};
  // ⛔ CCODE-290 — RESOLVED ONCE, USED TWICE. The mechanic was computed inside the duration branch only; the
  // soak below needs the same resolution, and resolving one craft twice is how two call sites quietly
  // disagree about the same number.
  const m = cm?.families
    ? mechanicFor(decl, { verb: decl.function, tier: decl.tier, rank: decl.rank || 1,
        intensity: decl.intensity || "standard", cfg: cm })
    : null;
  // ⛔ DID A PERSON WRITE THIS NUMBER? §45.1 shape — authored at the rank, read at the ability — so check
  // the per-verb block and the rank as well as the craft root. A default is not an authoring decision.
  const authoredSoak = decl?.mechanic?.[decl.function]?.soak ?? decl?.mechanic?.soak ?? null;
  if (durCfg.enabled !== false && cm?.families) {
    if (m && m.operative === "duration") {
      const rolled = rollOperative(m, rng, { cfg: cm })?.value;
      if (Number.isFinite(rolled)) {
        const scaled = rolled * (durCfg.roundsPerPoint ?? 0.5) * (partial ? (cfg.partialValueMult ?? 0.5) : 1);
        rounds = Math.max(1, Math.min(durCfg.craftDurationMax ?? 5,
          Math.round(scaled) + (roll.degree === "crit_success" ? (cfg.critBonusRounds ?? 0) : 0)));
      }
    }
  }
  const other = actor === "player" ? "opponent" : "player";
  return {
    kind: def.kind, label: def.label, value, roundsLeft: rounds, applies: def.applies || "always",
    side: def.target === "opponent" ? other : actor,   // WHOSE roll this modifies
    // CCODE-41: deniesPhase must ride from the content def onto the LIVE effect — without this copy, phaseDenied
    // reads undefined on every effect and the blinding counterplay is inert while still advertised in content.
    ...(def.deniesPhase ? { deniesPhase: def.deniesPhase } : {}),
    // CCODE-82: whether this guard needs TENDING rides from the craft onto the live effect. Same copy the
    // line above exists for — a flag left on the definition reads `undefined` on the effect and is inert.
    ...(tend.requiresAttention ? { requiresAttention: true } : {}),
    ...(tend.autonomous ? { autonomous: true } : {}),
    // CCODE-84: every standing effect carries the RANK of the working that made it, so an unmaking craft has
    // something to measure itself against. A ward's own `soakRank` is that rank where it has one; otherwise
    // the craft's tier stands in, which is the only other thing on the table that means "how strong a working".
    rank: Math.max(1, Number(tend.rank) || Number(decl.tier) || 1),
    // ⛔ CCODE-290 — THE GUARD ABSORBS. Erik ruled it: *"raising a guard makes the blow SMALLER, not more
    // likely to miss."* 30 crafts author `mechanic.soak`; it was carried faithfully into `fields.soak`
    // (2 → 2, 20 → 20) and NOTHING DOWNSTREAM SPENT IT. The number arrived and stopped.
    //
    // ⚠️ THIS IS A SECOND CURRENCY, NOT A REPLACEMENT FOR `value`. The comment above says why `value` is
    // left alone — "a contest-mod and a craft magnitude are different currencies, and quietly making one
    // drive the other is how a number ends up serving two masters." Absorption is the OTHER currency, so
    // it rides as its own field and the roll-mod is untouched.
    //
    // ⛔ TYPED WHERE THE CRAFT NAMES TYPES (Aevi): `death_ward`'s soak 5 answers decay, vitality and cold —
    // not everything. All 30 soak crafts carry `wardTypes`, so this is the norm rather than the exception.
    // ⚠️ ONE LAYER ANSWERING SEVERAL TYPES, never several layers — three layers of 5 would be 15 soak.
    // ⚠️ AUTHORED SOAK ONLY — AND THIS NEARLY SHIPPED TOO WIDE. `craftmechanics` MIRRORS `magnitude` into
    // `soak` for every guard-shape craft, so reading the resolved field alone gave absorption to every
    // shield in the game, authored or not. Erik and Aevi scoped this to the 30 crafts that AUTHOR the
    // number; a family default is not an authoring decision. ⛔ The resolved value is still what lands,
    // so rank scaling applies — the gate is `authoredSoak`, the amount is `m.fields.soak`.
    ...(authoredSoak != null && Number.isFinite(m?.fields?.soak) && m.fields.soak > 0
      ? { soak: m.fields.soak,
          ...(Array.isArray(decl?.mechanic?.wardTypes) && decl.mechanic.wardTypes.length
            ? { soakTypes: decl.mechanic.wardTypes.map(String) } : {}) }
      : {}),
    source: decl.name || decl.function, from: actor
  };
}

/** CCODE-80 — EVASION: THE ATTACK DOES NOT LAND (Erik's correction; Aevi's re-authored `the_wrong_target`).
 *
 *  Erik: evasion is NOT soak. Soak reduces damage after a hit lands; evasion means the attack doesn't land,
 *  and the craft's own prose says so — "not blocking, not armoring, just not being where they land." Authoring
 *  it as soak flattened a real distinction: `resonant_shield` SOAKS, `the_fixed_point` ANCHORS, and this one
 *  EVADES, and only the third acts before the hit.
 *
 *  Aevi's proposed mechanic is a DEGREE DEGRADE — crit_success→success, success→partial, partial→failure — and
 *  she is right that it fits the existing ladder with no new resolution stage. But measured, HALF of it lands:
 *  `degree` drives the effect layer and the receipt, while DAMAGE is computed from `roundWinner` and
 *  `marginGap` and never looks at degree at all. Degrading only the degree would print "partial" and deal a
 *  full hit — the readout would say evaded while the health bar said otherwise.
 *
 *  So evasion is applied in BOTH of the engine's currencies, which is what "it did not land" has to mean here:
 *   · the attacker's DEGREE degrades one step (Aevi's spec — the effects they would have left, they do not);
 *   · the attacker's MARGIN drops by the authored `evasion` (the damage currency — a smaller gap is a smaller
 *     hit, and it can flip a won exchange into a lost one, which IS a miss).
 *
 *  THE GRAZE needs no code: Erik's second half — "the remaining partial is reduced by a small soak" — is what
 *  `the_wrong_target`'s own `soak: 2, soakRank: 1` already does through the ranked-soak path. Building it again
 *  here would double-count it.
 *
 *  `evasionRank` follows Aevi's rank-2 note verbatim ("degrades even a well-set-up attack"): at rank 1 an
 *  attacker who READ you first still finds you, because they know where you will be; at rank 2+ the read does
 *  not help them. Pure; every number is a content dial. */
const DEGREE_DOWN = { crit_success: "success", success: "partial", partial: "failure", failure: "failure", crit_failure: "crit_failure" };
export function evasionOf(decl, cm) {
  if (!decl || !cm?.families) return null;
  const m = mechanicFor(decl, { verb: decl.function, tier: decl.tier, rank: decl.rank || 1,
    intensity: decl.intensity || "standard", cfg: cm });
  const ev = Number(m?.fields?.evasion) || 0;
  return ev > 0 ? { evasion: ev, rank: Math.max(1, Number(m.fields.evasionRank) || 1) } : null;
}
export function applyEvasion(p, o, playerDecl, oppDecl, sb, cm, setupBonus = 0) {
  const cfg = sb?.evasion || {};
  if (cfg.enabled === false) return null;
  const out = [];
  for (const [evader, evadeDecl, attacker, attackRoll] of [["player", playerDecl, "opponent", o], ["opponent", oppDecl, "player", p]]) {
    const ev = evasionOf(evadeDecl, cm);
    if (!ev) continue;
    // A read beats a low-rank dodge: they are aiming where you WILL be, not where you were. Read from the
    // SETUP BONUS ITSELF, whose sign says who the read favoured (battleRound hands the opponent `-setupBonus`).
    // The first draft sniffed the roll's `components` for a setup line — and `components` comes back EMPTY on
    // these rolls, so the whole rule was inert while reading as though it worked. The value was right there.
    const wasRead = attacker === "player" ? setupBonus > 0 : setupBonus < 0;
    if (wasRead && ev.rank < (cfg.rankToBeatARead ?? 2)) {
      out.push({ evader, attacker, applied: false, why: "they read you first — a rank-1 dodge does not beat a set-up attack" });
      continue;
    }
    const before = attackRoll.degree, marginBefore = attackRoll.margin;
    attackRoll.degree = DEGREE_DOWN[before] || before;                       // Aevi's ladder step
    attackRoll.margin = marginBefore - ev.evasion * (cfg.marginPerPoint ?? 1); // the damage currency
    attackRoll.evaded = { by: evader, evasion: ev.evasion, rank: ev.rank, degreeFrom: before, marginFrom: marginBefore };
    out.push({ evader, attacker, applied: true, evasion: ev.evasion, rank: ev.rank, from: before, to: attackRoll.degree });
  }
  return out.length ? out : null;
}

/** CCODE-84 — a landed unmaking strips standing effects up to its own rank.
 *
 *  `sides` is [[decl, roll, who], ...]. A side unmakes the OTHER side's workings, never its own — a craft that
 *  dispelled your own guard while you cast it would be a trap rather than a capstone. The roll must actually
 *  have landed: a botched unmaking tears nothing down, the same rule a botched guard already follows. */
export function applyUnmaking(effects, sides, sb, cm) {
  const cfg = sb?.unmaking || {};
  if (cfg.enabled === false) return { effects, removed: [] };
  const ok = new Set(cfg.requiresDegree || ["crit_success", "success"]);
  const kinds = Array.isArray(cfg.kinds) && cfg.kinds.length ? new Set(cfg.kinds) : null;
  let out = effects, removed = [];
  for (const [decl, roll, who] of sides) {
    const m = decl?.mechanic?.[decl.function] ?? decl?.mechanic ?? null;
    const reach = Math.max(0, Number(m?.unmakeRank) || 0);
    if (!reach || !ok.has(roll?.degree)) continue;
    const theirs = who === "player" ? "opponent" : "player";
    const doomed = out.filter(fx => fx.from === theirs && (Number(fx.rank) || 1) <= reach && (!kinds || kinds.has(fx.kind)));
    if (!doomed.length) continue;
    out = out.filter(fx => !doomed.includes(fx));
    removed.push(...doomed.map(fx => ({ by: who, craft: decl.name || decl.function, kind: fx.kind,
      label: fx.label, rank: Number(fx.rank) || 1, reach })));
  }
  return { effects: out, removed };
}

/** CCODE-83 — what KIND of harm is this craft's? Read from the craft, else from its tradition's default.
 *  Content owns both; an unmapped craft has no type and resolves exactly as everything did before. */
export function resolvedDamageType(decl, cm) {
  if (!decl) return null;
  // The same RESOLUTION ORDER every other dimension uses, for the same reason: the craft's own block wins,
  // then the per-craft table, then its tradition's default. Aevi authored the last two as separate lookups
  // (traditionTypes + perCraftOverrides) because a craft's kind is usually its tradition's and sometimes not.
  // Ordering them explicitly is what keeps a second source from becoming a rival source.
  // CCODE-86 — A BOUND WEAPON CARRIES THE KIND OF HARM IT WAS BOUND WITH.
  //
  // Erik: test Silas Weir's Memory spear against the unmoored choir. It did 0.00. That spear is a L29 item
  // rune-bound by three people in a unified working, carrying "a SHADOW-HARM focus at the quillon" and
  // "Huginn's Ashwarden ENDING-SENSE running the fuller" — and the engine saw a weapon with no tradition,
  // typed it physical, and the choir shrugged it off. Every one of its four bound threads, cast as a bare
  // craft, hits for 21.27. The item's whole reason to exist was invisible to the one question that mattered.
  //
  // So an item may NAME its kind (`damageType`), or name the THREADS bound into it and take the kind from
  // the first that has one — because that is how the fiction already describes these weapons, as a stack of
  // bindings rather than a single element. Sixth door for PromisedButUnread: the item promised a kind of
  // harm and nothing could hear it.
  const item = decl.item || null;
  const itemType = item && (item.damageType
    || (item.threads || []).map(t => (cm?.damageTypeByTradition || {})[t?.tradition || t]).find(Boolean));
  const authored = decl.mechanic?.[decl.function]?.damageType ?? decl.mechanic?.damageType ?? decl.itemDamageType ?? itemType;
  if (authored) return authored;
  const byCraft = cm?.damageTypeByCraft || {};
  const id = decl.abilityId || decl.id;
  if (id && byCraft[id]) return byCraft[id];
  const byTradition = cm?.damageTypeByTradition || {};
  return byTradition[decl.tradition] || byTradition[decl.powerSystem] || null;
}

/** CCODE-83 — how does this sheet answer that KIND? immune | resist | vulnerable | absorb | null.
 *  A thing that EATS light is not heavily armoured against it; it is in a different relationship to it, which
 *  is why this is separate from soak and applied before it. Unknown values are ignored, never guessed at. */
/** ⛔ CCODE-315 — CAN THIS CRAFT REACH A THING WITH NO SELF? Erik: "only if it simplifies and provides
 *  clarity." ⚠️ SIX CRAFTS STATED THIS RULE IN FOUR DIFFERENT PHRASINGS — "without a self", "has no
 *  self", "anything without a mind", "anything that does not rely on the man beside it" — and one creature
 *  stated the other half as `feeling: immune`, in data. ⛔ NOTHING COULD CHECK THE TWO AGREED WHILE ONE
 *  SIDE WAS PROSE.
 *
 *  ✅ NOW THE CRAFT DECLARES `requiresSelf` AND THE CREATURE'S CLASS DECLARES `hasSelf`, AND THIS IS THE
 *  ONE PLACE THEY MEET. ⚠️ THE CLASS IS RESOLVED, NEVER STORED ON THE SHEET: a copied `hasSelf` would be
 *  a stored copy of a derived value, which is the failure this project has committed most.
 *
 *  ⚠️ ABSENT IS NOT FALSE. A creature with no class, or a class that says nothing, is treated as HAVING a
 *  self — so nothing changes for the 20 creatures Aevi has not classed and every existing fight is
 *  byte-identical. Only an explicit `hasSelf: false` blocks anything. */
export function selfBlocked(decl, targetSheet, { classes = null, rank = 1 } = {}) {
  if (!decl || !targetSheet || !classes) return false;
  const needs = authoredBlock(decl, "requiresSelf", num(decl.rank, rank)) === true
    || decl.requiresSelf === true || decl.mechanic?.requiresSelf === true;
  if (!needs) return false;
  const cls = classes[String(targetSheet.creatureClass || "")];
  // ⛔ EXPLICIT FALSE ONLY. `undefined` is undecided, and undecided must not silently disarm a craft.
  return cls && typeof cls === "object" && cls.hasSelf === false;
}

export function affinityOf(sheet, type, sb) {
  if (!type || !sheet) return null;
  const legal = new Set((sb?.damageTypes?.affinities) || ["immune", "resist", "vulnerable", "absorb"]);
  const v = sheet.affinity?.[type] ?? sheet.affinities?.[type] ?? null;
  return v && legal.has(v) ? v : null;
}

/** CCODE-82: a SENSE step prepares - it must not be read as 'acting elsewhere' and drop a tended guard. */
function senseStepEarly(phase, sb) { return phase === "sense" && (sb?.turn || {}).senseMovesMomentum !== true; }

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

/** SNG-500 §4 / CCODE-211 — OBSCURE IS A DECLARATION, NOT A PROPERTY OF THE SHEET.
 *
 *  ⚠️ Read the TAG, never the verb. Aevi's §4.3 says the fields are `ability.sense` (27) and
 *  `ability.obscure` (15), and inferring obscure from `conceal`/`deceive` would silently enrol every craft
 *  carrying those verbs into a role its author never gave it. The passive path already reads the sheet for
 *  a conceal craft (`senseResistOf`); this is the other thing — what you CHOSE this round.
 */
export function isObscureDecl(decl) { return decl?.obscure === true; }
export function isSenseDecl(decl) { return decl?.sense === true; }

/** ⛔ THE OBSCURER WINS TIES, AND THIS IS THE RULE AEVI FLAGGED AS MOST LIKELY TO BE SOFTENED.
 *
 *  Her words: *"you flagged this as the rule most likely to get softened during implementation because it
 *  looks unfair in a unit test. It is not unfair — it is the whole balance. Without it the sense slot
 *  belongs permanently to the perceptive traditions."*
 *
 *  ⚠️ IT DOES LOOK WRONG IN ISOLATION. An equal roll losing to the hider reads as a bug, and the instinct
 *  is to make ties go to the reader "for symmetry". That instinct is the bug: reading is already the
 *  advantaged side — the reader picks the moment, and a failed read costs a step the obscurer had to spend
 *  anyway. The tie is the obscurer's compensation for spending their slot NOT acting.
 *
 *  It is its own function so that softening it requires editing a thing with this comment on it. */
export function obscurerWinsTie(readerGap) { return readerGap <= 0; }

/** SNG-517 §1 / CCODE-212 — DID THEY SPEND THE SLOT READING? Erik's change pays a successful obscure only
 *  against an opponent who actually LOOKED, so this is the question that decides whether the gambit paid.
 *
 *  ⚠️ AND IT IS DELIBERATELY LOOSER THAN `isObscureDecl`, WHICH IS A TAG AND ONLY A TAG. The asymmetry is
 *  principled, not sloppy:
 *    · OBSCURE is a ROLE the author grants. Inferring it from `conceal`/`deceive` would enrol crafts whose
 *      author never gave them that job — which is why CCODE-211 gates "the tag, never the verb".
 *    · SENSE here is an ACT, not a role: "did this opponent spend their slot reading?" `senseFunctions`
 *      (`reveal`/`foresee`/`track`) is already authored for exactly that question and already used by the
 *      engine, so consulting it is reading content, not guessing.
 *  ⛔ AND THE PRACTICAL REASON, WHICH IS THE DECIDING ONE: `opponentPolicy` builds declarations as
 *  `{function, name, tier, attribute, intensity}` and carries NO tags. Requiring `sense: true` would mean
 *  the bonus could never fire against an AI opponent — a reader with no writer, shipped on purpose. */
export function declaredSense(decl, sb) {
  if (decl?.sense === true) return true;
  const fns = sb?.senseStep?.senseFunctions || ["reveal", "foresee", "track"];
  return fns.includes(decl?.function);
}

/** ⛔ SNG-517 §1a/§1b — WHO EARNS A BONUS ACTION OUT OF THE SENSE STEP. Erik: *"successfully obscuring
 *  against an active sense gives you the bonus action as well… and we should probably have a null band
 *  where something that's roughly a tie doesn't yield a bonus for either party."*
 *
 *  ⛔ ONLY THE OBSCURER CAN EVER EARN HERE, AND THAT IS THE WHOLE SAFETY OF THE CHANGE. CCode's warning on
 *  record: the sense step was built consequence-free so that READING is not a way to win. This does not
 *  reverse that — the reader still banks nothing. What it adds is that BEATING a reader is a way to win,
 *  which is a different claim and the one Erik ruled on.
 *
 *  ⚠️ THE NULL BAND IS NOT THE TIE RULE AND MUST NOT TOUCH IT (Aevi's §1b):
 *    · the TIE RULE answers WHO WINS THE READ    — gap 0 is the obscurer's, unchanged (`obscurerWinsTie`)
 *    · the NULL BAND answers WHO EARNS A BONUS   — inside it, nobody does
 *  So at gap 0 the obscurer still denies the read AND earns no bonus. They broke even, which is the right
 *  feel for a coin-flip.
 *
 *  `gap` is the reader's margin over the obscurer's resistance — positive means the reader is ahead.
 *  Returns "obscurer" or null. It can never return "reader" by construction, not by omission. */
/** CCODE-213 — DID THIS SIDE DO NOTHING AT ALL IN THE SENSE STEP? Erik: *"we need to let obscure grant a
 *  free action in the case the opponent does nothing in the sense round as well."*
 *
 *  ⛔ NOTHING MEANS NOTHING — NOT "SOMETHING THAT ISN'T A READ". A guard is an act: they spent the slot,
 *  they just did not spend it looking, and Aevi's "hiding from nobody is not a win" still governs that
 *  case. This is the narrower thing: no declaration reached the step at all.
 *
 *  ⚠️ THE NARROW READING IS DELIBERATE AND IT IS AN ASSUMPTION, RECORDED SO IT CAN BE OVERTURNED ON
 *  PURPOSE. `degradeIfSpent` degrades a broke side to a bare strike or guard rather than to nothing, and a
 *  static antagonist "holds" — so a genuinely empty declaration is rare, which is what keeps this from
 *  becoming a bonus tap. If Erik meant the wider reading (anyone who did not READ, guard included), it is
 *  one condition in `senseBonusFor`. */
export function declaredNothing(decl) {
  return !decl || !decl.function || decl.noAct === true || decl.idle === true;
}

export function senseBonusFor({ obscured = false, opponentSensed = false, opponentIdle = false, gap = 0, sb } = {}) {
  if (!obscured) return null;                 // the reader banks nothing — the asymmetry, stated once
  // ⛔ CCODE-213 / ERIK: AN UNCONTESTED OBSCURE PAYS. You spent your slot, they spent nothing, and you
  // come out of the step holding more of the round than they do. ⚠️ THE NULL BAND DOES NOT APPLY HERE
  // and that is not an oversight: the band exists to say a COIN-FLIP earns nobody anything, and there was
  // no flip. Comparing a gap against an opponent who never rolled would be arithmetic about nothing.
  if (opponentIdle) return "obscurer";
  if (!opponentSensed) return null;           // they acted, just not at you — hiding from nobody is not a win
  const band = Math.max(0, Number(sb?.senseStep?.bonusNullBand ?? 2));
  const g = Number(gap) || 0;
  if (Math.abs(g) <= band) return null;   // roughly a tie: neither side gained
  return g < 0 ? "obscurer" : null;       // beaten cleanly, or they read you anyway
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

/** ⛔ CCODE-243 / SPEC_pierce_value — WHAT LANDS, IN TWO PORTIONS.
 *
 *  SOAKABLE: the ordinary hit, through soak as always. PIERCE: a flat amount that bypasses soak entirely
 *  and always lands. ⚠️ They are ADDITIVE, and the antisoak sees their SUM — which is the entire reason
 *  the spec exists: `antisoakLanded` returns 0 when nothing gets through, so armour that outvalues the
 *  skill damage used to switch off the vulnerability the craft is built around.
 *
 *  ⛔ AFFINITY STILL COMES FIRST AND `immune` STILL MEANS IMMUNE. Aevi flagged this as my call and I agree
 *  with her reasoning: if pierce beat immunity it would be a universal answer and nothing in the bestiary
 *  would be safe. This function never sees an immune target — that branch returns 0 above it.
 *  Pure; the caller owns affinity. */
export function pierceLanded(hit, soak = 0, pierce = 0, antisoak = 0, dcfg = {}) {
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const soakable = Math.max(0, n(hit) - Math.max(0, n(soak)));
  const p = Math.max(0, n(pierce));
  const through = soakable + p;
  if (through <= 0) return 0;
  return through + Math.max(0, n(antisoak));
}

/** ⚠️ THE TARGET'S CARRIED ANTISOAK. Mirrors `conditions.js::antisoakOn` deliberately rather than
 *  importing it: this file takes SHEETS, not characters, and a sheet is not a character. The rule is one
 *  line and the shapes differ; a shared helper here would have to know about both.
 *  ⛔ SUMMED (§41) — two different weaknesses open are worse than one. */
function antisoakFromConditions(sheet) {
  return (sheet?.conditions || [])
    .filter(c => c && c.kind === "antisoak")
    .reduce((t, c) => t + Math.max(0, Number(c.magnitude) || 0), 0);
}

/** ⛔ CCODE-306 — IS SOMEONE STILL IMPOSSIBLE TO IGNORE? A taunt is deliberately not permanent (CCODE-256:
 *  "a taunt that held forever would let one character lock a foe onto themselves for a whole fight"), so it
 *  carries the round it lapses on and this is where that is honoured.
 *
 *  ⚠️ RETURNS null FOR EVERY STATE THAT PREDATES IT, so a save written before this shipped simply has no
 *  taunt — the same opt-in shape as `knowledge` and `foeReadTier` on the same call. */
export function standingTaunt(state) {
  const t = state?.taunted;
  if (!t || !t.targetId) return null;
  const now = Number(state?.round) || 0;
  if (Number.isFinite(t.until) && now >= t.until) return null;   // lapsed
  return { targetId: t.targetId, rounds: t.until != null ? t.until - now : null };
}

export function battleRound({ playerDecl, oppDecl, playerSheet, oppSheet, state = {}, rules, sb, steps, rng = Math.random,
  // CCODE-250 (Erik: "Yes a foe chooses who to hit"): the party seat. `allies` is the live roster a foe may aim
  // at — ABSENT OR EMPTY MEANS TODAY, and a 1v1 round then resolves byte-identically, which is the gate.
  allies = null, targetPolicy = null, protections = null,
  // ⛔ CCODE-315 — the bestiary's CLASS table, so `requiresSelf` has something to be answered by.
  // ⚠️ ABSENT MEANS TODAY: with no table nothing is ever blocked and every existing caller is unchanged.
  creatureClasses = null,
  // ⛔ CCODE-316 / ERIK 2026-08-30: "the intent is to be able to heal anyone you want, or use healing on
  // any target." ⚠️ A HEAL WAS SPENT ON ITS OWN SIDE, ALWAYS — one line decided it and nothing could ask.
  // Absent means today: no pick, the caster heals themselves, byte-identical to what shipped.
  healTarget = null,
  // ⛔ CCODE-274 / ERIK'S [C] — THE ONES YOU DID NOT BRING FORWARD ARE STILL IN THE FIGHT.
  // "Named companions folded into the aggregate still feel like people... it's just that you only have so
  // much focus." `folded` is that: allies who are fighting and are not narrated blow by blow this round.
  // ⚠️ ABSENT MEANS TODAY. With no folded set the round is byte-identical, which is the gate.
  folded = null,
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
  // ⛔ CCODE-250 — WHO IS THIS AIMED AT. Erik: "Yes a foe chooses who to hit... you need to sense who's
  // getting attacked so you can intervene if you want." Until now `oppDecl` resolved against `playerSheet`
  // and there WAS no choosing, which is why `intercept.js` had nothing to intercept.
  // ⚠️ I ADDED A SEAT, NOT A TABLE. `playerSheet`/`oppSheet` are untouched; ONE derived binding decides which
  // sheet fills the receiving seat when the opponent lands something. With no allies passed it IS playerSheet.
  // ⛔ CCODE-255 — AND IT PICKS WITH WHAT IT ACTUALLY LEARNED. `foeReadTier` rides on state from the sense
  // step. ⚠️ NULL MEANS PERFECT KNOWLEDGE, which is what every caller got before this and what every existing
  // gate still asserts — the read is opt-in, so nothing silently changes under a caller that has not adopted it.
  const foeKnows = state.foeReadTier == null ? null : foeKnowledge(state.foeReadTier, { cfg: sb?.foeRead || {} });
  const aimedAt = (allies && allies.length)
    // ⛔ CCODE-306 — THE TAUNT NOW REACHES THE PICK. `chooseTarget` has implemented the override since
    // CCODE-256, with a written rationale, and NOTHING HAS EVER PASSED IT. `resolveProvoke` produced
    // `taunted` 650 lines below, spread it into a RECEIPT, and let it fall on the floor.
    // ⚠️ PRODUCER GREEN, CONSUMER GREEN, LIVE PATH CONNECTING NEITHER — a wiring gap, not a module gap.
    ? chooseTarget(allies, { policy: targetPolicy || oppSheet?.targetPolicy || "threat", rng, knowledge: foeKnows,
        taunt: standingTaunt(state) })
    : null;
  // the seat. Everything downstream that used to say "the player eats it" says this instead.
  // ⚠️ CCODE-261: ASK THE FLAG, NEVER THE ID. A real save's player id is `char-…`, not "player".
  const aimedAtPlayer = !!(aimedAt?.target && (aimedAt.target.isPlayer || aimedAt.target.kind === "player"));
  const defenderSheet = (aimedAt && aimedAt.target && !aimedAtPlayer && aimedAt.target.sheet)
    ? aimedAt.target.sheet : playerSheet;
  const p = rollSide(playerSheet, playerDecl, oppDecl, sb, steps, rules, rng, effectMods(standing, "player", playerDecl, oppDecl, sb), momentumModifier(state.momentum || 0, "player", sb), setupBonus);
  const o = rollSide(oppSheet, oppDecl, playerDecl, sb, steps, rules, rng, effectMods(standing, "opponent", oppDecl, playerDecl, sb), momentumModifier(state.momentum || 0, "opponent", sb), -setupBonus);
  // CCODE-80 — EVASION IS NOT SOAK (Erik's correction, Aevi's re-authoring of `the_wrong_target`).
  // "Not blocking, not armoring, just not being where they land." Soak reduces damage AFTER a hit lands;
  // evasion means it does not land. Applied HERE, between the rolls and everything downstream, because both
  // the effect layer and the damage layer read what this changes.
  const evasion = applyEvasion(p, o, playerDecl, oppDecl, sb, rules?.craftMechanics, setupBonus);
  // ⛔ CCODE-256 / ERIK: "A successful conceal can also make people untargetable — OR AT LEAST HAVE IT BE
  // VERY DIFFICULT TO ACTUALLY HIT THEM." Both halves of that sentence are now built, and this is the
  // second half. When a foe could not find ANYBODY it still swings (`blindly`), and a swing at where it
  // thinks you are should mostly miss.
  // ⚠️ IT BELONGS IN EVASION, NOT IN A NEW PENALTY. CCODE-80 already means exactly this — "not blocking,
  // not armoring, just not being where they land" — and inventing a parallel mechanic for the same idea is
  // how a system grows two names for one thing. (Erik, this week: "temp soak sounds like soak to me.")
  // ⚠️ AND IT IS APPLIED THE WAY EVASION IS APPLIED — by degrading the attack roll itself. My first version
  // tried to raise a `threshold` field on the returned value; `applyEvasion` returns an ARRAY OF RECEIPTS and
  // does its work by mutating the roll, so that patch changed nothing at all while reading as though it did.
  // I wrote it against a shape I assumed instead of the one I could have read in thirty seconds.
  let blindStrike = null;
  if (aimedAt?.blindly) {
    const per = Math.max(0, Number(sb?.blindStrike?.marginPenalty ?? 6));
    const before = o.degree, mBefore = o.margin;
    o.degree = DEGREE_DOWN[before] || before;
    o.margin = mBefore - per;
    blindStrike = { penalty: per, degreeFrom: before, degreeTo: o.degree, marginFrom: mBefore,
      why: "it swung where it thought you were" };
  }
  // CCODE-45: effects tick ONCE PER TURN, not per step — Erik: "the sustaining effects would not tick down a count
  // until the full round's actions are complete." The orchestrator passes tickEffects:false on every step but the last.
  let effects = doTick ? tickEffects(standing) : standing.slice();
  // CCODE-77: the craft-mechanics bag and the SAME rng ride into effectFrom so a craft's own duration —
  // and its authored variance — decide how long what it leaves behind actually stands.
  const fxOpts = { cm: rules?.craftMechanics, rng };
  const landedP = effectFrom(playerDecl, p, "player", sb, fxOpts);
  // CCODE-37: THE PAYOFF — a woven round lands the SECOND craft's effect too, so one turn leaves two things
  // standing. This is what "braids shine in combat" means mechanically: turn-by-turn forces one move per turn,
  // and a weave is how a practised pairing beats that limit.
  const landedW = playerDecl.woven ? effectFrom({ ...playerDecl.woven, intensity: playerDecl.intensity }, p, "player", sb, fxOpts) : null;
  const landedO = effectFrom(oppDecl, o, "opponent", sb, fxOpts);
  effects = addEffect(effects, landedP, sb);
  effects = addEffect(effects, landedW, sb);
  effects = addEffect(effects, landedO, sb);
  // CCODE-82 — A GUARD THAT NEEDS TENDING LAPSES WHEN YOU LOOK AWAY.
  //
  // Aevi asked for an `autonomy` flag on the guard shape: `the_mechanical_defense` r2's whole increment is a
  // defence that "holds without constant attention - works while you work on something else". Measured, that
  // is ALREADY WHAT EVERY GUARD DOES: raise a ward, strike next round, and the ward is still standing. So
  // `autonomy` as a flag would have described the default and meant nothing.
  //
  // The distinction only becomes real as its COMPLEMENT: the field belongs on the guards that DO need
  // tending, and `the_mechanical_defense` is then distinguished by not carrying it (or by `autonomous: true`,
  // which overrides an inherited one). With nothing authored this is byte-identical to before - and today
  // nothing is authored, deliberately: WHICH guards cost attention is Aevi's call, not mine.
  // CCODE-84 — WHAT IS BOUND CAN BE UNMADE (Aevi CHECKS 6f).
  //
  // `the_undoing_word` r2: "the word reaches WHAT IS BOUND as well as what is BUILT — a working, a ward, a
  // seal, A PACT held by craft. Unmaking bindings rather than objects is the T-IV kind-change." Nothing in
  // the engine could remove a standing effect: they only ever ticked down. So the destruction pole's capstone
  // increment did NOTHING against every tradition whose crafts work by leaving something standing — which is
  // most of them. Aevi is right that this is load-bearing, not flavour.
  //
  // It is RANKED, like soak and evasion before it, because "unmakes anything" is not a mechanic: a craft
  // unmakes workings up to its own reach and a deeper binding holds. With no craft authoring `unmakeRank`,
  // nothing is ever removed and this is inert — which is the case today.
  const unmade = applyUnmaking(effects, [[playerDecl, p, "player"], [oppDecl, o, "opponent"]], sb, rules?.craftMechanics);
  if (unmade.removed.length) effects = unmade.effects;

  const defFns = new Set(sb?.functionMatchup?.defensiveFunctions || []);
  if (!senseStepEarly(phase, sb)) {
    const actedElsewhere = { player: !defFns.has(playerDecl.function), opponent: !defFns.has(oppDecl.function) };
    effects = effects.filter(fx => !(fx.requiresAttention && !fx.autonomous && actedElsewhere[fx.from]));
  }

  const mom = sb.momentum || {};
  const meterMax = mom.meterMax ?? 10, marginScale = mom.marginScale ?? 0.5, crush = mom.surgeCrushEndsIt ?? 8;
  // CCODE-45: a SENSE step PREPARES — it never moves the meter. Otherwise momentum swings up to 3× per turn and
  // the CCODE-38 pressure pacing (measured over 1200 fights/threat-level) is invalidated. Content dial.
  const turnCfg = sb.turn || {};
  const senseStep = phase === "sense" && turnCfg.senseMovesMomentum !== true;
  // ⛔ CCODE-208 / SNG-500 §2 — ACTION LOSS. `deniesPhase` already rode from content onto live effects
  // (CCODE-41), and `phaseDenied` was consulted for exactly one phase: "sense", in app.js. Nothing anywhere
  // asked whether a side could ACT — so an effect declaring `deniesPhase: "action"` was inert while still
  // advertised in content, which is the same shape as the blinding counterplay that comment was written for.
  //
  // ⚠️ A DENIED SIDE DOES NOT ROLL BADLY — IT DOES NOT ACT. Losing on margin would let a lucky roll
  // shrug off a condition that says you get no turn, and would make the effect a penalty rather than a
  // silence. Both sides denied is a wasted round for both, which is the honest reading.
  const deniedAct = { player: phaseDenied(standing, "player", "action"), opponent: phaseDenied(standing, "opponent", "action") };
  let momentum = state.momentum || 0, roundWinner = null, delta = 0;
  if (phase === "action" && (deniedAct.player || deniedAct.opponent) && !(deniedAct.player && deniedAct.opponent)) {
    roundWinner = deniedAct.player ? "opponent" : "player";
    delta = Math.abs(p.margin - o.margin) * marginScale;
    if (!senseStep) momentum += roundWinner === "player" ? delta : -delta;
  } else if (phase === "action" && deniedAct.player && deniedAct.opponent) {
    roundWinner = null;
  } else if (p.margin !== o.margin) {
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
  const healFns = new Set(dcfg.healFunctions || ["heal", "mend", "restore"]);
  let opponentHealth = state.opponentHealth ?? oppSheet.health ?? null;
  let damage = null, healing = null;
  // ⛔ CCODE-207: HEALING WAS NEVER GUARDED OUT OF THIS BLOCK - IT WAS NEVER LET IN. The branch below is
  // gated on `harmFns`, and `heal`/`mend`/`restore` are not harm functions, so 25 crafts with authored dice
  // could win a round and produce nothing at all. Authored beside `harmFunctions` for the same reason that
  // one is authored: a set of verbs the engine treats specially is content, not code.
  // A kind whose LOSING costs no health deals no DAMAGE either — the same ruling, read once. Caught by the
  // SNG-247 tests the moment damage was added: without this a standoff drew blood, which is exactly what
  // `losingCostsHealth: false` was written to forbid. A contest of wills cannot wound you from either side.
  const kindDealsDamage = kcfg.outcomes?.losingCostsHealth !== false;
  if (!senseStep && roundWinner && dcfg.enabled !== false && kindDealsDamage) {
    const winDecl = roundWinner === "player" ? playerDecl : oppDecl;
    const winRoll = roundWinner === "player" ? p : o;
    const loseRoll = roundWinner === "player" ? o : p;
    if (healFns.has(winDecl.function)) {
      // ⚠️ A HEAL IS SPENT ON ITS OWN SIDE, and the round it wins is a round it did not attack in - the
      // tempo cost IS the trade (SNG-500 §1.3). `resolveHeal` states the asymmetries; this only decides who
      // receives it and reports the intermediate numbers so a soaked heal reads as soaked.
      const marginGap = Math.max(0, (winRoll.margin || 0) - (loseRoll.margin || 0));
      const cmCfgH = rules?.craftMechanics;
      const side = roundWinner === "player" ? "player" : "opponent";
      // ⛔ CCODE-316 — WHO IS BEING MENDED. The old line was `roundWinner === "player" ? playerSheet :
      // oppSheet` and that was the whole of it: a heal could not reach an ally, and could not reach a foe.
      // ⚠️ THAT IS WHY `heal → decay on an undead` (backlog P3) HAD NO PATH TO FIRE — not because the rule
      // was hard, but because nothing could aim a heal at the undead thing in the first place.
      const ownSheet = roundWinner === "player" ? playerSheet : oppSheet;
      const pickedAlly = healTarget && healTarget !== "self" && healTarget !== "opponent"
        ? (allies || []).find(a => a && a.id === healTarget && a.present !== false) : null;
      const aimedAtFoe = healTarget === "opponent";
      const subject = pickedAlly?.sheet || (aimedAtFoe ? (roundWinner === "player" ? oppSheet : playerSheet) : ownSheet);
      // ⚠️ THE SIDE FOLLOWS THE SUBJECT, not the caster — otherwise the caller applies an ally's mending to
      // the player's own health, which is the CCODE-250 seat error in the other direction.
      const healSide = pickedAlly ? "ally" : aimedAtFoe ? (roundWinner === "player" ? "opponent" : "player") : side;
      const r = resolveHeal(winDecl, {
        rank: winDecl.rank || 1, tier: winDecl.tier, intensity: winDecl.intensity || "standard",
        cfg: cmCfgH || {}, rng, marginGap,
        ongoingHarm: subject?.ongoingHarm || [],
        staunch: winDecl.staunch === true,
        priorHeals: Number(state.healsBySide?.[side]) || 0
      });
      if (r.ok) {
        // ⛔ CCODE-316 / BACKLOG P3 — AND THE MENDING ANSWERS THE SAME AFFINITIES A BLOW DOES. Aevi typed
        // 25 healing crafts `vitality` on Erik's ruling, and `the_narrowed` is authored `vitality:
        // vulnerable`. ⚠️ SO THIS IS NOT A NEW RULE — it is the rule the corpus already states, finally
        // asked. A thing that is vulnerable to vitality is BURNED by being mended, and the inversion
        // needs no undead flag: it falls out of what the creature already says about itself.
        const healType = winDecl.damageType || resolvedDamageType(winDecl, cmCfgH) || null;
        const healAff = affinityOf(subject, healType, sb);
        const inverted = healAff === "vulnerable";
        const amount = healAff === "immune" ? 0
          : inverted ? -r.healed
          : healAff === "absorb" ? Math.round(r.healed * (sb?.damageTypes?.absorbMult ?? 1.5))
          : r.healed;
        healing = { side: healSide, amount, ...(pickedAlly ? { onId: pickedAlly.id, onName: pickedAlly.name } : {}), ...(healType ? { healType } : {}), ...(healAff ? { affinity: healAff } : {}), ...(inverted ? { inverted: true, why: "mending burns a thing that runs on decay" } : {}), verb: winDecl.function, by: winDecl.name || winDecl.function,
          rolled: r.rolled,
          ...(r.tapered !== r.rolled ? { tapered: r.tapered } : {}),
          ...(r.soaked ? { soaked: r.soaked } : {}),
          ...(r.staunched ? { staunched: r.staunched, ended: r.ended } : {}) };
        // the opponent's health is the one this engine owns; the player's is applied by the caller from
        // `healing.side`, exactly as it already applies `damage.side`.
        if (healSide === "opponent" && opponentHealth != null) {
          const ceiling = Number(oppSheet?.maxHealth ?? oppSheet?.health);
          opponentHealth = Number.isFinite(ceiling) ? Math.min(ceiling, opponentHealth + amount) : opponentHealth + amount;
        }
      }
    } else if (harmFns.has(winDecl.function)) {
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
        // SNG-263 r4: the dice reshape retired `max`, and this guard still tested for it — so the craft path
        // silently stopped firing and every hit fell back to the generic formula. Caught by measuring damage
        // per landed hit (T-III delivered 5.2 where its dice say 13.4) rather than by reading the code.
        // CCODE-77: `cfg` is threaded so a craft's authored VARIANCE widens its band from Erik's live dial
        // rather than the function's own fallback — the same reason the wild dials read from rules.wild.
        if (m?.shape === "damage" && (m.fields?.dice || m.fields?.max != null)) hit = Math.max(dcfg.minHit ?? 1, rollMagnitude(m.fields, rng, { marginGap, cfg: cmCfg }));
      }
      if (hit == null) {
        const raw = (dcfg.base ?? 1)
          + (winDecl.tier || 1) * (dcfg.perTier ?? 0.5)
          + marginGap * (dcfg.perMarginPoint ?? 0.06);
        hit = Math.max(dcfg.minHit ?? 1, Math.round(raw));
      }
      // SNG-263 r4 §11 — SCALING: the WIELDER's contribution. The dice are what the craft IS; this is what
      // the person swinging it brings. Without it a master's kindle hit exactly as hard as a novice's, which
      // is why a level-20 character's T-I fell off a cliff above the regional band. Deliberately a FLAT ADD:
      // it lifts a low tier into usefulness without closing the gap to a high tier (whose dice are bigger at
      // both ends), and soak below is the limiter that stops a scaled cantrip becoming universal.
      const scfg = dcfg.scaling || {};
      const wielder = roundWinner === "player" ? playerSheet : oppSheet;
      const attrKey = winDecl.attribute || "practical";
      const attrVal = Number(wielder?.attributes?.[attrKey]) || 0;
      const uses = Number(winDecl.uses) || 0;   // inert until SNG-258 §2's use-counter supplies it
      const scaled = Math.min(scfg.maxScaling ?? 6,
        (Number(wielder?.level) || 0) * (scfg.perLevel ?? 0)
        + Math.max(0, attrVal - (scfg.attributeBase ?? 3)) * (scfg.perAttributePoint ?? 0)
        + Math.min(uses, scfg.useCap ?? 0) * (scfg.perUse ?? 0));
      if (scaled > 0) hit = hit + Math.round(scaled);

      // SNG-263 r4 GAP2 — SOAK. The target's armour is subtracted from a landed hit, floored at minHit so a
      // blow that connects always costs something. This is the honest limiter Erik's §11 asks for: it is what
      // stops a level-scaled low-tier craft from becoming universal, because soak is a FLAT subtraction and a
      // bigger die beats it by more. "An armored epic foe needs more than a scaled-up cantrip" is exactly this
      // arithmetic — reported on the receipt so a blunted blow reads as blunted rather than as a bad roll.
      const targetSheet = roundWinner === "player" ? oppSheet : defenderSheet;   // CCODE-250: the seat, not necessarily you
      // RANKED soak. The catalog authored this before the engine had it: radiant_lance r2 cuts "LIGHT ARMOR"
      // and r3 beats "a Harmonic shield's FIRST RANK", so penetration is meant to beat a guard BY DEGREE
      // rather than subtract from one flat number. A craft cuts every layer whose rank is at or below its
      // penetration; the layers above it still soak. Falls back to the flat value when a sheet carries no
      // layers, so an authored foe with a hand-written `soak` keeps working unchanged.
      // ⛔ CCODE-243 — READ RANK-FIRST, BECAUSE IT WAS NEVER READ AT ALL. This was
      // `Number(winDecl.penetration)`, and NEITHER authored craft puts it there: `radiant_lance` carries it
      // on `mechanic`, `hastened_grey` on a RANK. So `pen` was 0 on every blow in the game's history, the
      // layer-cutting branch never ran, and `penetrated` never once appeared on a receipt.
      // ⚠️ THAT IS §45.1 FOR THE FIFTH TIME — a reader looking at the ability level where the authoring is
      // one layer down. `authoredBlock` is the one reader for this shape and it belongs here too.
      const pen = Math.max(0, Number(authoredBlock(winDecl, "penetration", winDecl?.rank || 1)) || 0);
      // ⛔ CCODE-243 / SPEC_pierce_value — PIERCE IS AN AMOUNT, NOT A RANK. Erik: "a pierce value (the
      // amount that bypasses the soak) along with the normal skill based damage." It is ADDITIVE to whatever
      // got through normally, and its whole purpose is that it guarantees SOMETHING lands — so a craft
      // whose identity is a vulnerability cannot have that identity switched off by sufficient armour.
      const pierce = Math.max(0, Number(authoredBlock(winDecl, "pierce", winDecl?.rank || 1)) || 0);
      // ⛔ CCODE-290 — A STANDING GUARD IS A SOAK LAYER. The consumer already existed and was correct;
      // `soakLayers` has resolved ranked, typed soak against `pierce` and `penetration` since CCODE-83.
      // What was missing was a WRITER: nothing turned an authored guard into one. So a craft that says it
      // absorbs 5 absorbed nothing, and `soak 2` and `soak 20` produced identical fights.
      // ⚠️ `fx.side` IS WHOSE ROLL THE EFFECT MODIFIES, which for a guard is the character who raised it —
      // so the layers that matter here are the SUFFERER's, not the winner's.
      const sufferer = roundWinner === "player" ? "opponent" : "player";
      const guardLayers = (effects || [])
        .filter(fx => fx.side === sufferer && Number.isFinite(fx.soak) && fx.soak > 0)
        .map(fx => ({ value: fx.soak, rank: fx.rank, types: fx.soakTypes || null, from: fx.source || fx.kind }));
      const sheetLayers = Array.isArray(targetSheet?.soakLayers) ? targetSheet.soakLayers : null;
      // ⚠️ ABSENT MEANS TODAY: with no standing guard and no authored layers this is null exactly as before,
      // and the flat-`soak` fallback below keeps every hand-authored foe resolving unchanged.
      const layers = (sheetLayers || guardLayers.length)
        ? [...(sheetLayers || []), ...guardLayers] : null;

      // CCODE-83 — DAMAGE HAS A KIND, and some things answer a kind rather than an amount.
      //
      // Aevi's CHECKS item A6, sharpened from two directions in one pass: `the_true_ground` soaks DECEPTION at
      // rank 2 and NOTHING against a blade, and the bestiary's `the_bright_devourer` HEALS from light-family
      // crafts. Ranked soak had a rank but no TYPE — so a ward against lies stopped a sword just as well, and a
      // thing that eats light took damage from it like anything else.
      //
      // Two concepts, deliberately kept apart:
      //  · a soak LAYER may name a type — it then answers only that type and is transparent to everything else;
      //  · a sheet may carry an AFFINITY per type — immune / resist / vulnerable / absorb — applied BEFORE soak,
      //    because absorbing light is not thicker skin, it is a different relationship to it.
      // ABSORB is the one that changes the record's shape: the blow HEALS its target, so it is reported as a
      // NEGATIVE amount with `absorbed` set, rather than quietly becoming zero and reading as a miss.
      // CCODE-83c — UNTYPED-BY-NATURE IS NOT UNTYPED-YET, and conflating them was a real defect.
      //
      // `the_unmoored_choir` is authored `physical: immune`, plainly meaning immune to blades, so untyped harm
      // became physical. But Erik asked what MEMORY does to it, and the answer exposed the blunder: that
      // fallback typed 15 UNMAPPED TRADITIONS as physical too — `logos` (syllogist), `the_grief_strike`
      // (threnodist), `noesis` (cogitant). A choir immune to blades is not immune to GRIEF, and arguably grief
      // is what it is MOST open to. Half the harm catalog was bouncing off it for no authored reason.
      //
      // So the fallback applies only to harm with NO TRADITION AT ALL — a sword, a thrown rock, bare hands.
      // A craft whose tradition simply has not been typed yet is UNDECIDED, not mundane, and stays untyped
      // until someone decides: the same absent-is-not-zero rule the rest of this engine runs on.
      const mundane = !(winDecl.tradition || winDecl.powerSystem);
      const declaredType = winDecl.damageType || resolvedDamageType(winDecl, cmCfg);
      const defaultedType = declaredType ? null
        : (mundane ? ((sb.damageTypes || {}).untypedIs || null) : null);
      const dmgType = declaredType || defaultedType;

      // ⛔ CCODE-314 / ERIK 2026-08-30: "untyped can default to physical for now if that's the way we have
      // it set up... BUT IT STILL NEEDS A FLAG SO WE CAN FIND AND TYPE THE DAMAGE."
      //
      // ⚠️ A DEFAULT THAT LEAVES NO TRACE IS A DEFECT THAT LOOKS LIKE A DESIGN. Two different things
      // happen above and both used to be silent:
      //   `typedByDefault` — a MUNDANE blow (sword, rock, bare hands) took the `untypedIs` fallback.
      //                      That is Erik's ruling working, and it should still be findable.
      //   `untyped`       — ⛔ A CRAFT RESOLVED TO NO KIND AT ALL. It is INVISIBLE TO EVERY AFFINITY IN
      //                      THE GAME: no immunity, no resistance, no vulnerability can answer it.
      //                      Aevi typed 40 crafts on Erik's ruling; this is how the next one is found
      //                      WITHOUT a corpus sweep, in the receipt, at the moment it happens.
      const typedByDefault = !declaredType && !!defaultedType;
      const untyped = !dmgType;

      // ⛔ CCODE-315 — A CRAFT THAT NEEDS A SELF FINDS NOTHING TO HOLD. Computed here, beside the affinity,
      // because it answers the same question: can this reach that at all. ⚠️ IT BLOCKS BOTH HALVES — the
      // wound AND the condition — since "nothing without a self can be FRIGHTENED" is about the binding,
      // not the bruise, and blocking only damage would have left the fear landing.
      const noSelf = selfBlocked(winDecl, targetSheet, { classes: creatureClasses, rank: winDecl?.rank || 1 });
      if (noSelf) hit = 0;
      const aff = affinityOf(targetSheet, dmgType, sb);
      const acfg = sb.damageTypes || {};
      if (aff === "immune") hit = 0;
      else if (aff === "resist") hit = Math.round(hit * (acfg.resistMult ?? 0.5));
      else if (aff === "vulnerable") hit = Math.round(hit * (acfg.vulnerableMult ?? 1.5));

      // A TYPED layer answers only its own type; an untyped layer answers everything, which is what every
      // layer does today — so with nothing typed this arithmetic is identical to before.
      // ⛔ CCODE-281 — COMPOSITE DAMAGE AND THE WARD THAT ANSWERS PART OF IT. Erik: "once we get the basic
      // damage types down, we can start showing COMBINATIONS — that makes WARDING ABLE TO BE PARTIAL, and
      // makes attacks more viable because they can BRING CERTAIN DAMAGE TYPES THROUGH."
      // ⚠️ A SINGLE `damageType` IS A MIX OF ONE, so a craft authored before this resolves identically and
      // the whole corpus keeps working untouched. Only a craft that authors `damageMix`, or a target that
      // authors `wardTypes`, takes the new path.
      // ⛔ AND THIS IS WHERE `wardTypes` FINALLY GETS A READER — documented to the GM at length, authored on
      // 48 crafts, and read by nothing in the resolution path until now.
      const dmgMix = damageMixOf(winDecl, dmgType);
      const wardRec = targetSheet?.ward || (targetSheet?.wardTypes ? targetSheet : null);
      // ⛔ CCODE-282 — THE LOADED TABLE WINS. `rules.damageFamilies` is Aevi v2 (four families, 20 types,
      // no polar); `craftMechanics.damageFamilies` is the v1 copy this line used to read exclusively, which
      // made her whole file inert. ⚠️ THE v1 COPY STAYS AS THE FALLBACK so a pack that ships only
      // craft_mechanics.json resolves exactly as it did — absent means today, which is the gate.
      const famTable = rules?.damageFamilies || cmCfg?.damageFamilies;
      const wardAns = wardRec ? wardAnswer(wardRec, num(wardRec.wardRank, targetSheet?.wardRank) || 1,
        { families: famTable, ladder: cmCfg?.wardLadder, breadth: cmCfg?.wardBreadth }) : null;
      // ⛔ CCODE-290 — A LAYER MAY ANSWER SEVERAL TYPES. `wardTypes` is a LIST on all 30 soak crafts
      // (`death_ward`: decay, vitality, cold), and the single-`type` form could not express that. Splitting
      // one ward into three layers would have TRIPLED its soak, so the layer answers a set instead.
      // ⚠️ The old single-`type` shape still works untouched — an authored foe sheet keeps resolving.
      const answers = l => (!l.type && !l.types) || !dmgType
        || (l.types ? l.types.includes(dmgType) : l.type === dmgType);
      const soak = layers
        ? layers.filter(l => answers(l) && (Number(l.rank) || 1) > pen).reduce((a, l) => a + (Number(l.value) || 0), 0)
        : Math.max(0, Number(targetSheet?.soak) || 0);
      const cutThrough = layers
        ? layers.filter(l => answers(l) && (Number(l.rank) || 1) <= pen).reduce((a, l) => a + (Number(l.value) || 0), 0) : 0;
      const wrongType = layers ? layers.filter(l => !answers(l)).reduce((a, l) => a + (Number(l.value) || 0), 0) : 0;
      // ⚠️ DECLARED BEFORE ITS USE. My first placement put this after the branch that sets it — `let` is
      // hoisted into a temporal dead zone, so it would have thrown on the first blow a big guard stopped.
      let foldedLosses = null;
      let soakFloored = false;
      let landed = aff === "absorb"
        ? -Math.max(1, Math.round(hit * (acfg.absorbMult ?? 1)))          // it FEEDS — a negative hit is healing
        : aff === "immune" ? 0
        // ⛔ CCODE-210 — ANTISOAK WAS BUILT AND NEVER CALLED. `antisoakLanded` was written against Erik's
        // three worked examples, gated, and had NO CALL SITE - my own reader-with-no-writer, found by
        // Aevi's dungeon spec before she built a room of it. His definition is a VULNERABILITY ON THE
        // TARGET: what got past soak is amplified, so it stacks with piercing rather than competing, and a
        // blow that never landed cannot be made worse (10/8/6=8 · 6/8/6=0 · 2/0/6=8).
        // ⚠️ READ FROM THE TARGET, NOT THE ATTACKING CRAFT. `grief_strike` authors `antisoak: 3` and it is
        // ambiguous whether that means "this blow benefits" or "this blow LEAVES them vulnerable";
        // reading it from the striker would decide that silently. Reported to Erik instead.
        // ⛔ CCODE-238 — AND FROM THE TARGET'S CONDITIONS, NOT ONLY A FLAT SHEET FIELD. CCODE-216 built
        // antisoak as a CONDITION and CCODE-228 wired an imposition to write one onto the sheet — and this
        // line read `targetSheet.antisoak`, a number nothing populated from them. Measured: a flat
        // `antisoak: 5` raised a 20 to 25, and the identical antisoak carried as a condition changed
        // nothing at all. The chain was imposed → condition → [nothing] → antisoakLanded.
        // ⚠️ SUMMED, not max'd, per §41: two crafts each opening a different weakness is worse than one.
        // ⛔ CCODE-243 — PIERCE ENTERS AS `through`, WHICH IS THE WHOLE POINT. `antisoakLanded` returns 0
        // when nothing gets past soak, so a craft built around a vulnerability had its vulnerability
        // switched off by enough armour — Aevi's worked case: hit 6 into soak 8 is 0 through, antisoak 8
        // never fires, and the most interesting part of the craft is the part that vanishes.
        // ⚠️ ADDITIVE, NOT AN ALTERNATIVE (Erik: "the pierce damage… plus any unsoaked damage").
        : pierceLanded(hit, soak, pierce,
            (Number(targetSheet?.antisoak) || 0) + antisoakFromConditions(targetSheet), dcfg);
      // ⛔ CCODE-290 — A GUARD MAY NOT STACK INTO IMMUNITY. Aevi named this before I built it, and the first
      // run did it: `death_ward` at soak 20 reduced a connected blow to ZERO. ⚠️ `minHit` already says no
      // FOE is immune — the same floor has to hold when the soak is on the PLAYER's side, or a big enough
      // guard is an off switch. The floor applies only where the blow CONNECTED: a miss stays a miss, and
      // an authored `immune` affinity is untouched, because that is a deliberate property of a creature
      // rather than a number stacking up.
      if (aff !== "immune" && aff !== "absorb" && hit > 0 && landed <= 0) {
        landed = num(dcfg?.minHit, 1);
        soakFloored = true;
      }
      // ⛔ CCODE-281 — AND THE WARD ANSWERS ITS PART. Applied HERE, after soak and antisoak have sized the
      // blow, because a ward answers what LANDS rather than competing with armour over what lands at all.
      // ⚠️ ONLY WHEN THERE IS A WARD AND MORE THAN ONE COMPONENT, OR A WARD THAT NAMES THIS TYPE. With no
      // `wardTypes` on the target the whole path is skipped and the arithmetic is byte-identical to before.
      let composite = null;
      if (wardAns && dmgMix.length && landed > 0) {
        const rc = resolveComposite(landed, dmgMix, wardAns,
          { minHit: num(dcfg?.minHit, 1), cfg: cmCfg?.wardLadder || {}, families: famTable });
        if (rc.blocked > 0) { composite = { ...rc, ward: wardAns.depth, answers: wardAns.answers }; landed = rc.landed; }
      }
      damage = { side: roundWinner === "player" ? "opponent" : "player",
        // ⛔ CCODE-314 — CARRIED ON THE RECEIPT, not merely computed. A flag the caller cannot see is the
        // same silence it replaces. `untyped: true` means NO affinity could have applied to this blow.
        ...(typedByDefault ? { typedByDefault: true } : {}),
        ...(untyped ? { untyped: true } : {}),
        ...(composite ? { composite } : {}),
        // ⛔ CCODE-290 — THE FLOOR ANNOUNCES ITSELF. A guard big enough to stop everything reduces the blow
        // to the minimum instead of to nothing, and a player who sees "1" needs to know WHY it was not 0.
        // ⚠️ An unannounced floor is indistinguishable from a rounding artefact, and this project has
        // spent a week finding numbers that arrive without saying where they came from.
        ...(soakFloored ? { soakFloored: true, soakFlooredWhy: "the guard stopped everything — nothing is ever fully immune" } : {}),
        ...(guardLayers.length ? { guardedBy: guardLayers.map(l => l.from).filter(Boolean) } : {}),
        // ⛔ CCODE-250 — THE SIDE IS NOT THE SUFFERER. The seat swapped the ARITHMETIC (soak, resist,
        // conditions all read the target's sheet) but this receipt still said "player", so a caller
        // would have applied an ally's wound to the player's health. Naming the bearer is the other
        // half of the seat, and without it the swap is a lie that balances.
        ...(roundWinner === "opponent" && aimedAt && aimedAt.target && !aimedAtPlayer
          ? { onId: aimedAt.target.id, onName: aimedAt.target.name } : {}), amount: landed, verb: winDecl.function,
        by: winDecl.name || winDecl.function,
        // CCODE-83: a blow that was EATEN, shrugged off or doubled must say so. Silently different arithmetic
        // is indistinguishable from a bad roll — the same argument evasion needed.
        ...(dmgType ? { damageType: dmgType } : {}),
        ...(aff ? { affinity: aff } : {}),
        ...(aff === "absorb" ? { absorbed: true } : {}),
        ...(wrongType ? { soakBypassedByType: wrongType } : {}),
        // ⚠️ THE TWO PORTIONS ARE NAMED SEPARATELY (acceptance 5) so a player can see WHY armour did not
        // help. "You hit for 12" against 8 soak is indistinguishable from a bug without this line.
        ...(pierce ? { pierce, pierceNote: `${pierce} bypassed armour entirely` } : {}),
        ...(soak || cutThrough || pierce ? { rolled: hit, soaked: Math.max(0, hit - Math.max(0, landed - pierce)), soak,
          ...(cutThrough ? { penetrated: cutThrough, penetration: pen } : {}) } : {}) };

      // ⛔ CCODE-259 — INTERCEPTION CAUGHT CONDITIONS AND NOT BLOWS, AND THAT IS NOT WHAT "STEP IN FRONT OF
      // SOMEONE" MEANS TO ANYONE. CCODE-246 built `redirectImposition` — the name says imposition — and
      // CCODE-250 joined it to the imposition path only. So Pell could put herself between the reaver and
      // Marrow, the receipt would say she had, and the blow would land on Marrow anyway.
      // ⚠️ FOUND BY RUNNING ERIK'S OWN PARTY rather than by a gate: the demo printed "PELL STEPS IN FRONT OF
      // MARROW" and then "it lands on MARROW for 6" two lines later.
      // ⛔ AND THE HIT IS RE-SOAKED BY THE PROTECTOR, not merely relabelled. The whole point of the tank is
      // that they are BETTER at eating it; moving the number without moving the armour would make Pell a
      // bookkeeping entry, which is the exact failure CCODE-246 §5.1 exists to prevent.
      // ⚠️ ONLY A PROTECTION THAT CATCHES BLOWS. Erik: the Death craft that opens one today is FOR
      // CONDITIONS, and making every protection eat damage handed it a power its author never gave it.
      // Filtered here rather than in `interceptorFor`, so the condition path keeps using the same chooser.
      const dmgGuards = (protections || []).filter(catchesDamage);
      // ⛔ CCODE-274 — THE MELEE'S OWN CONTRIBUTION, and it has to reach the DAMAGE or "they are in the
      // fight" is decoration. This is the whole mechanical content of Erik's [C]: the party is bigger, the
      // foe takes more, and the round is still three beats long.
      // ⚠️ IT USES `predictAggregate`, WHICH IS THE MEASURED COMPRESSION — mean scales with K, spread with
      // √K. The naive alternative (K× one roll) matches on the average and is 614% wrong on the spread,
      // which is invisible to anyone checking averages and is how a party that recruits a fourth member
      // starts seeing wipes. `scripts/scale_fidelity.mjs` re-measures it against the real engine.
      if (damage && roundWinner === "player" && folded && folded.length) {
        // ⛔ CCODE-313 — THE FOLD CANNOT BEAT AN IMMUNITY THE BLOW ITSELF COULD NOT BEAT. Found by running
        // Aevi's twelve crafts through a melee-scale fight: a physical-immune foe took 0 from the player's
        // typed blow and SIX from the folded party's contribution to that same blow — while the receipt
        // still said `affinity: "immune"`. ⚠️ AN IMMUNITY THAT REPORTS ITSELF AND DOES NOTHING IS WORSE
        // THAN NO IMMUNITY: the number says it worked.
        //
        // ⚠️ THIS IS ONE BLOW, NOT MANY. The receipt reads "they are in it too — +6": the fold ADDS to the
        // strike the player declared rather than swinging separately, so it carries that blow's damage type
        // and must answer that blow's affinity. ⛔ IF ERIK RULES THAT A FOLDED PARTY SWINGS ITS OWN WEAPONS
        // OF ITS OWN TYPES, this becomes wrong — but then the fold needs its own damage type, and today it
        // has none. Recorded in the handoff rather than assumed.
        const foldBlocked = damage.affinity === "immune" || damage.affinity === "absorb";
        const able = folded.filter(f => f && f.present !== false && !f.downed && (f.contributions || []).includes("HARM"));
        if (able.length && !foldBlocked) {
          const per = Math.max(0, Number(sb?.melee?.perFoldedAlly ?? 2));
          const agg = predictAggregate({ mean: per, sd: per / 2 }, able.length);
          // ⛔ CCODE-323 — COHESION FINALLY DOES SOMETHING. `groupCapability` has computed it since
          // CCODE-307 and NOTHING MULTIPLIED BY IT, so Aevi's `break_the_line` — which removes a
          // formation's benefit without killing anyone — had nothing to remove.
          //
          // ⚠️ THIS IS THE RIGHT PLACE AND THE ONLY PLACE. Cohesion is "how much of what a group HAS it can
          // actually BRING" (SPEC_group_aggregation §3b), and the folded contribution IS what they bring.
          // ⛔ A GROUP AT LOW COHESION STILL HAS ITS COVERAGE AND CANNOT USE IT — which is what a rout is,
          // and the game had no way to express one.
          // ⚠️ THE LADDER MUST REACH IT. Without `tierWeights` an officer's rung is invisible and the
          // boost is silently zero — the reader-with-no-writer shape, one layer down.
          const foldCap = groupCapability(folded, { tierWeights: rules?.capabilityByTier || sb?.attentionByTier || rules?.arcResponse?.attentionByTier || null });
          // ⛔ CCODE-324 / ERIK: "cohesion CAN GO ABOVE 1.0." My clamp at 1 would have silently thrown away
          // every officer's contribution — a legendary commander steadies a line to 1.3, and a ceiling of 1
          // makes that identical to no commander at all. ⚠️ THE FLOOR STAYS: a line still standing brings
          // something, and `cohesionOf` already holds it above zero.
          const cohesion = Math.max(0, Number(foldCap?.cohesion ?? 1));
          const add = Math.max(0, Math.round(agg.mean * cohesion));
          if (add > 0) {
            damage = { ...damage, amount: (Number(damage.amount) || 0) + add,
              // ⚠️ REPORTED SEPARATELY AND BY NAME. A number folded silently into the total would make the
              // party invisible at exactly the moment it mattered — and Erik's whole ruling is that these
              // are people you chose not to narrate, not people who stopped existing.
              melee: { added: add, by: able.map(f => f.name || f.id), count: able.length,
                why: `${able.map(f => String(f.name || f.id).split(" ")[0]).join(", ")} are in it too` + (cohesion < 0.999 ? ` — but the line is coming apart` : cohesion > 1.001 ? ` — and they are well led` : ""),
                ...(Math.abs(cohesion - 1) > 0.001 ? { cohesion } : {}) } };
          }
        }
      }

      // ⛔ CCODE-298 — AND THE OTHER HALF, WHICH WAS NEVER BUILT. The branch above adds the folded party's
      // contribution when the PLAYER wins. There was no branch for when the opponent does, so a folded
      // party was PURE UPSIDE: it hurt the foe and could not be hurt.
      //
      // ⚠️ AEVI: "that is not a design, it is a missing branch" — and `distributeCasualties` quotes Erik's
      // own words in its comment, *"the pc playing into and being a casualty of that melee"*. It was built
      // for exactly this and called by nothing.
      //
      // ⛔ AND ERIK'S "STILL FEEL LIKE PEOPLE" RULING ARGUES *FOR* IT: a companion who can be hurt is more
      // of a person than one who cannot. The asymmetry is what made a folded ally read as a damage stat.
      //
      // ⚠️ NON-COMBATANTS ARE EXPOSED, DELIBERATELY. `distributeCasualties` filters on `downed` alone, so
      // Aevi cannot swing and can still be hurt — being unable to fight is not being safe, and the reverse
      // would make non-combatants the optimal thing to fold.
      if (damage && roundWinner === "opponent" && folded && folded.length) {
        const standing = folded.filter(f => f && f.present !== false && !f.downed);
        if (standing.length) {
          const per = Math.max(0, Number(sb?.melee?.perFoldedAlly ?? 2));
          // ⚠️ THE SAME √K COMPRESSION THE CONTRIBUTION USES, so the two sides of the fold are measured the
          // same way. A pool sized like the line, not a copy of the blow that landed on the front.
          // ⛔ CCODE-319 — PROPORTIONAL TO HEALTH, WHICH IS THE WHOLE FIX. The old pool was `per × K` and
          // named no level; health is `level × 2`. The two curves diverged immediately, so the mechanic was
          // in range at level 1–2 and DEAD from level 3 to 100. ⚠️ NOT UNDER-TUNED — OUT OF RANGE: no value
          // of `perFoldedAlly` repairs it, because a constant cannot track a curve.
          //
          // ⚠️ THE FOLD'S OWN HEALTH, not the player's — these are the people at risk, and a typical health
          // is the right scale for a pool that has to reach one of them.
          const foldHealths = standing.map(x => combatWeight(x).health).filter(h => h > 0).sort((a, b) => a - b);
          const typicalHealth = foldHealths.length ? foldHealths[Math.floor(foldHealths.length / 2)] : 0;
          const perHealth = Math.max(0, Number(sb?.melee?.foldedPoolPerHealth ?? 0));
          // ⚠️ ABSENT IS TODAY. With no dial the old arithmetic runs untouched, so a caller that has not
          // adopted the content change sees exactly the fight it saw yesterday.
          const pool = perHealth > 0 && typicalHealth > 0
            ? Math.max(0, Math.round(typicalHealth * perHealth))
            : Math.max(0, Math.round(predictAggregate({ mean: per, sd: per / 2 }, standing.length).mean));
          if (pool > 0) {
            // ⛔ CCODE-318 — THE FOLD HEARS THE ENEMY'S INTENT. The same `chooseTarget` that decided who
            // the blow was aimed at now decides who the fold's losses fall on, so a brute cuts into the
            // people fighting it and a hunter still goes for the mender. ⚠️ SAME CASUALTY COUNT — the
            // ordering changes WHO, never how many, which is what CCODE-308 measured.
            const foePolicy = targetPolicy || oppSheet?.targetPolicy || "threat";
            const byIntent = (live) => {
              const out = [], left = live.slice();
              while (left.length) {
                const pick = chooseTarget(left, { policy: foePolicy, rng })?.target || left[0];
                out.push(pick);
                const at = left.indexOf(pick);
                left.splice(at < 0 ? 0 : at, 1);
              }
              return out;
            };
            const cas = distributeCasualties(standing, pool, { rng, order: byIntent });
            for (const d of (cas.downed || [])) {
              const who = standing.find(x => x.id === d.id);
              // ⛔ AND THIS IS THE FIRST PATH THAT COULD EVER FIRE A `downedEffect`. All nine companions
              // author one; `downEntity` existed to set the state and was called by NOTHING.
              if (who) downEntity(who, { why: "the melee", day: state?.day ?? null });
            }
            // ⛔ ATTACHED HERE, NOT IN THE RECEIPT LITERAL. My first version spread `foldedLosses` into the
            // `damage` object at its construction — 82 LINES BEFORE THIS BRANCH SETS IT — so the value was
            // computed and thrown away every round. ⚠️ COMPUTED AND NEVER SPENT: the exact shape I have
            // spent the week finding in other people's code, committed thirty minutes after fixing the
            // identical thing for soak. The player-wins branch above re-spreads `damage`; so does this one.
            if (cas.hits.length) foldedLosses = {
              pool, hits: cas.hits, downed: cas.downed,
              // ⚠️ BY NAME, like the contribution above. A folded ally that goes down silently is the
              // damage stat we are trying to stop them being.
              why: `${cas.hits.map(h => h.name || h.id).join(", ")} took the weight of it`,
              ...(cas.downed.length ? { downedEffects: cas.downed.map(d =>
                (folded.find(f => f.id === d.id) || {}).downedEffect || null).filter(Boolean) } : {}) };
            if (foldedLosses) damage = { ...damage, foldedLosses };
          }
        }
      }
      if (damage && damage.onId && dmgGuards.length) {
        const guard = interceptorFor(damage.onId, dmgGuards, Object.fromEntries((allies || []).map(x => [x.id, x.sheet || {}])));
        if (guard) {
          const gs = (allies || []).find(x => x.id === guard.protection.protectorId);
          const gSoak = Math.max(0, Number(gs?.sheet?.soak) || 0);
          const raw = Number(damage.rolled ?? (damage.amount + (damage.soaked || 0))) || damage.amount;
          const through = Math.max(Number(sb?.damage?.minHit ?? 1), raw - gSoak);
          damage = { ...damage, amount: through, soaked: Math.max(0, raw - through), soak: gSoak,
            onId: gs?.id ?? guard.protection.protectorId, onName: gs?.name ?? guard.protection.protectorId,
            intercepted: { caughtBy: guard.protection.protectorId, onBehalfOf: damage.onId,
              why: (gs?.name || "they") + " took it instead" } };
        }
      }
      // CCODE-83: `landed` is NEGATIVE when the target ABSORBS this damage type, so this same line heals it —
      // but `Math.max(0, ...)` bounds only the floor, and an absorbing foe would have healed WITHOUT LIMIT,
      // becoming unkillable by anyone who kept hitting it with the thing it eats. Thematic; still a bug.
      // Feeding is capped at the creature's OWN maximum: it can be restored, never inflated.
      if (roundWinner === "player" && opponentHealth != null) {
        const ceiling = Number(oppSheet?.maxHealth ?? oppSheet?.health);
        const next = opponentHealth - landed;
        opponentHealth = Math.max(0, landed < 0 && Number.isFinite(ceiling) ? Math.min(ceiling, next) : next);
      }
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
  // ⛔ CCODE-208 — AND A WINNING CRAFT MAY IMPOSE. Aevi's correction is the whole design: Keening does not
  // need a new state, it needs a way to put someone into the one that already exists. Resolved AFTER the
  // exchange because only a winner imposes, and read off the SUBJECT's resistance so it is contested.
  let imposed = null, inflicted = null, opened = null;
  // ⛔ CCODE-315 — DECLARED BESIDE THE THING IT BELONGS TO. My splice assigned this and never declared it,
  // which is a ReferenceError waiting behind the first craft that requires a self — the exact shape of the
  // `num` bug that sat undetected for two days. `node --check` passes on it, which is why it needed a run.
  let unreachable = null;
  // ⛔ CCODE-214 — AND A WINNING CRAFT LEAVES ITS ONGOING HARM ON THEM. Eight crafts have claimed this in
  // prose since the day they were written; `resolveHeal` has read the condition off the subject since
  // v1.9.168 and NOTHING PUT IT THERE. The reader had a writer in the catalogue and no hand in between.
  // ⚠️ Emitted on the round rather than mutated onto a sheet, exactly like `damage` and `healing`: the
  // caller owns the subject, and an engine that reaches into a character sheet from inside a round is the
  // thing every other branch here was written to avoid.
  if (roundWinner && phase === "action") {
    const infDecl = roundWinner === "player" ? playerDecl : oppDecl;
    const harm = ongoingHarmOf(infDecl, infDecl?.rank || 1);
    const losingSide = roundWinner === "player" ? "opponent" : "player";
    // ⛔ CCODE-296 — `=== true` NEVER FIRED. `persistUntilHealed` is authored as an OBJECT that NAMES what
    // persists — `{condition:"bleeding"}`, `{condition:"enfeeblement"}` — on all SIX crafts that use it, and
    // NOT ONE authors the bare `true` this compared against. So a flag six crafts rely on was stamped
    // exactly never, and `resolveSoothe`, which already honours `c.persistUntilHealed`, had nothing to honour.
    // ⚠️ `conditions.js` HAD THE RIGHT READER ALL ALONG: `persistsUntilHealed()` accepts both shapes and
    // `persistedConditionName()` returns the name the object carries. Both were exported and called by
    // nothing. ⛔ A READER AND A WRITER THAT NEVER MET — and the third `=== true` against a richer authored
    // shape this week, after `isProjectCraft` vs `projectTicks: "r3"`.
    const persists = persistsUntilHealed(infDecl, infDecl?.rank || 1);
    const persistName = persistedConditionName(infDecl, infDecl?.rank || 1);
    if (harm && harm.magnitude > 0) inflicted = { side: losingSide, kind: "ongoingHarm",
      by: infDecl.name || infDecl.function, persistUntilHealed: persists,
      // ⚠️ THE NAME IS THE POINT OF HER SHAPE. "bleeding" and "enfeeblement" are different things to be
      // carrying, and a bare boolean throws that away — which is why the object form is the better one.
      ...(persists && persistName ? { persistedAs: persistName } : {}), ...harm };
    // ⛔ CCODE-216 — AND THE VULNERABILITY A BLOW LEAVES BEHIND. Erik's antisoak ruling had one open
    // question: does `grief_strike`'s number mean "this blow benefits" or "this blow LEAVES them open"?
    // ⚠️ AEVI ANSWERED IT BY AUTHORING. `antisoakImposed` 3/5/8 across its three ranks - the imposing
    // reading - and nothing read the field. The target-side half has been wired since CCODE-210; this is
    // the half that puts it there.
    const asImposed = Math.max(0, Number(authoredBlock(infDecl, "antisoakImposed", infDecl?.rank || 1)) || 0);
    if (asImposed > 0) opened = { side: losingSide, kind: "antisoak", magnitude: asImposed,
      by: infDecl.name || infDecl.function, persistUntilHealed: persists,
      ...(persists && persistName ? { persistedAs: persistName } : {}) };
  }
  if (roundWinner && phase === "action") {
    const impDecl = roundWinner === "player" ? playerDecl : oppDecl;
    const loserSheet = roundWinner === "player" ? oppSheet : defenderSheet;   // CCODE-250: an imposition lands on whoever it was aimed at
    const winRoll = roundWinner === "player" ? p : o, loseRoll = roundWinner === "player" ? o : p;
    // ⛔ THE GUARD HAD TO MOVE TOO. `resolveImposition` learned to read a rank-level block; this line did
    // not, so it kept deciding there was nothing to resolve and never called it. A reader fixed in one
    // place and gated in another is still a reader nobody reaches.
    const spec = authoredBlock(impDecl, "imposes", impDecl?.rank || 1);
    if (spec) {
      const resistKey = String(spec.resist || "physical");
      // ⛔ CCODE-315 — AND THE BINDING, WHICH IS THE HALF AEVI'S CRAFTS ACTUALLY MEAN. A terror laid on a
      // thing with no self is not resisted, it is UNREACHABLE — so this refuses before the roll rather
      // than after it, and the receipt says which.
      const impNoSelf = selfBlocked(impDecl, loserSheet, { classes: creatureClasses, rank: impDecl?.rank || 1 });
      const r = resolveImposition(impDecl, {
        rank: impDecl.rank || 1, cfg: rules?.craftMechanics || {},
        margin: Math.max(0, (winRoll.margin || 0) - (loseRoll.margin || 0)),
        targetResist: Number(loserSheet?.attributes?.[resistKey]) || 0,
        degree: winRoll.degree
      });
      if (impNoSelf) unreachable = { by: impDecl?.name || "it", why: "there is no self in it to take hold of" };
      if (r.ok && !impNoSelf) imposed = { side: roundWinner === "player" ? "opponent" : "player",
        // ⛔ CCODE-250 — THE SIDE IS NOT THE SUFFERER. The seat swapped the ARITHMETIC (soak, resist,
        // conditions all read the target's sheet) but this receipt still said "player", so a caller
        // would have applied an ally's wound to the player's health. Naming the bearer is the other
        // half of the seat, and without it the swap is a lie that balances.
        ...(roundWinner === "opponent" && aimedAt && aimedAt.target && !aimedAtPlayer
          ? { onId: aimedAt.target.id, onName: aimedAt.target.name } : {}), condition: r.condition,
        by: impDecl.name || impDecl.function, targets: r.targets, threshold: r.threshold,
        ...(r.resisted ? { resisted: true, degradedFrom: r.degradedTo } : {}) };
      else if (r.why) imposed = { refused: r.why, by: impDecl.name || impDecl.function };

      // ⛔ CCODE-250 — THE JOIN THAT MAKES `intercept.js` LIVE. I built interception (CCODE-246) against a
      // blow that could never have been aimed at an ally, so it has been inert since the day it shipped:
      // there was nothing to step in front of. Now that a foe chooses, someone can.
      // ⚠️ AND ERIK'S TRADE IS ENFORCED UPSTREAM, NOT HERE — a protection had to be DECLARED, which means
      // the protector had to have SEEN the aim, which means they read instead of hiding. This function only
      // honours a decision already paid for.
      const condGuards = (protections || []).filter(catchesCondition);
      if (imposed && imposed.onId && condGuards.length) {
        const sheetsById = Object.fromEntries((allies || []).map(a => [a.id, a.sheet || {}]));
        const caught = redirectImposition({
          aimedAt: imposed.onId, sourceId: "opponent", protections: condGuards, sheets: sheetsById,
          imposition: { condition: imposed.condition, degradesTo: spec?.degradesTo, onCrit: spec?.onCrit },
          degree: winRoll.degree });
        // ⚠️ NULL MEANS NOBODY STOOD THERE, and the imposition is exactly what it was. Additive.
        if (caught) imposed = { ...imposed, intercepted: caught, condition: caught.lands.condition,
          onId: caught.lands.on, onName: (allies || []).find(a => a.id === caught.lands.on)?.name || caught.lands.on };
      }
    }
  }

  // ⛔ CCODE-236 §6 — PROVOKE AND SOOTHE RESOLVE HERE, beside the imposition, because they are contest
  // verbs and this is where a contest verb lands. Both were "unmechanised" only in the sense that nobody
  // had connected them to the thing they obviously act on: provoke takes `state.tactic`, soothe takes
  // MOMENTUM. Neither needed a new field, which was Aevi's §6 point.
  let unsettled = null, cooled = null;
  {
    const winDecl = roundWinner === "player" ? playerDecl : oppDecl;
    const fns = new Set([winDecl?.function, ...(winDecl?.functions || [])].filter(Boolean));
    // ⚠️ RE-DERIVED IN THIS SCOPE, NOT BORROWED. My first version reached for `winRoll`/`loseRoll`, which
    // live inside the imposition block above — a ReferenceError that killed the whole suite and reported
    // ONE failure while deleting 240 passes. Same mistake, same tell, second time this month.
    const wr = roundWinner === "player" ? p : o, lr = roundWinner === "player" ? o : p;
    const winMargin = Math.max(0, (wr?.margin || 0) - (lr?.margin || 0));
    if (fns.has("provoke")) {
      // ⛔ CCODE-306 / CCODE-261 — THE REAL ID, NOT THE WORD "player". `resolveProvoke` defaults its
      // taunter to the literal string "player", and `chooseTarget` resolves a taunt by `a.id === targetId`.
      // ⚠️ A REAL SAVE'S PLAYER ID IS `char-…`, so the default could NEVER have matched even once the
      // wiring existed — the same trap CCODE-261 names two hundred lines above: ask the flag, not the word.
      const mePick = (allies || []).find(a => a && (a.isPlayer || a.kind === "player"));
      const pr = resolveProvoke(newState, { margin: winMargin, taunter: mePick?.id || null });
      // ⚠️ THE STATE CHANGE IS THE EFFECT. Reporting `broke` without clearing the tactic would be the
      // decorative version of this verb, and the whole complaint about it was that it did nothing.
      if (pr.ok) newState.tactic = null;
      // ⛔ AND THE EFFECT IS NOW STATE, NOT A SENTENCE. Spreading `pr` into the receipt below reported the
      // taunt to the reader and stored nothing, so the next round could not act on it. THE RECEIPT IS NOT
      // THE MECHANIC — the same shape as the folded-casualty receipt built before the branch that set it.
      if (pr.ok && pr.taunted?.targetId) {
        newState.taunted = { targetId: pr.taunted.targetId, until: (newState.round || 0) + Math.max(1, Number(pr.taunted.rounds) || 1) };
      }
      unsettled = { by: winDecl?.name || "provoke", side: roundWinner === "player" ? "opponent" : "player",
        // ⛔ CCODE-250 — THE SIDE IS NOT THE SUFFERER. The seat swapped the ARITHMETIC (soak, resist,
        // conditions all read the target's sheet) but this receipt still said "player", so a caller
        // would have applied an ally's wound to the player's health. Naming the bearer is the other
        // half of the seat, and without it the swap is a lie that balances.
        ...(roundWinner === "opponent" && aimedAt && aimedAt.target && !aimedAtPlayer
          ? { onId: aimedAt.target.id, onName: aimedAt.target.name } : {}), ...pr };
    }
    if (fns.has("soothe")) {
      const so = resolveSoothe(newState, { margin: winMargin, cfg: sb?.engine || {},
        conditions: (roundWinner === "player" ? oppSheet : defenderSheet)?.conditions || [] });   // CCODE-250: antisoak reads the SEAT's conditions
      if (so.ok) newState.momentum = so.momentum.after;
      cooled = { by: winDecl?.name || "soothe", ...so };
    }
  }

  // ⛔ CCODE-250 — THE CHOICE RIDES ON THE OPPONENT RECEIPT, because that is the object the fog reads.
  // `senseOpponent` gates DISPLAY over true state; putting the aim here means a good read EARNS it and a
  // character who obscured themselves simply never sees the field. Absent with no allies — so a 1v1 receipt
  // is byte-identical to the one this engine produced yesterday.
  if (aimedAt) o.targetChoice = aimedAt;
  const out = { state: newState, unsettled, cooled, player: p, opponent: o, roundWinner, ...(aimedAt ? { aimedAt } : {}), ...(blindStrike ? { blindStrike } : {}), delta, resolved, effects, pressure, pressureEvent, spent, damage, healing, imposed, inflicted, opened, ...(unreachable ? { unreachable } : {}), deniedAct, opponentHealth, landed: [landedP, landedW, landedO].filter(Boolean),
    degraded: { player: !!playerDecl.spentFallback, opponent: !!oppDecl.spentFallback },
    // CCODE-80: an evaded blow must SAY it was evaded. An attack that quietly does less is indistinguishable
    // from a bad roll, and the whole point of the three defensive logics is that they read differently.
    ...(evasion ? { evasion } : {}),
    // CCODE-84: an unmade ward must be SEEN to be unmade — the player who spent a turn raising it is owed the
    // reason it is gone, and "it expired" and "it was torn down" are different stories.
    ...(unmade.removed.length ? { unmade: unmade.removed } : {}) };
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
    // CCODE-78 (Erik): a ward may be declared on the SENSE step, so a guard raised early covers this round and
    // the next. The effect machinery already did that — a guard laid here is standing before the action step
    // resolves. What did NOT exist was the COST: this block computes a setup bonus from the roll no matter
    // what was declared, so warding here would have bought the guard AND the read. It is a choice only if it
    // is a trade — you guarded, so you did not look.
    const senseCfg = sb?.senseStep || {};
    const guardFns = senseCfg.guardFunctions || [];
    if (senseCfg.guardEarnsNoRead !== false && guardFns.includes(playerDecl.function)) {
      out.setupBonus = 0;
      out.guardedInsteadOfReading = { function: playerDecl.function, name: playerDecl.name || playerDecl.function };
    }
    // Erik's ladder: "a failed roll should drop the sense tier that round to 0. a partial should give you tier 1,
    // success 2, and a large success margin and/or a crit success tier 3." What you LEARN is earned by the roll
    // now, not by a standing character stat — a read is a thing you DO, not a thing you have.
    // ...and a guard earns no sense TIER either. senseTier is what you LEARN — craft names, then GM advice —
    // and learning it from a step you spent raising a shield would be the free upgrade by another door.
    // ⛔ SNG-500 §4 / CCODE-211 — AND DECLARING OBSCURE IS THE SAME TRADE, ONE STEP FURTHER. The guard
    // above costs you the read; obscure costs you the read AND works at being unfound. Today the
    // resistance was passive — read off the sheet whether or not they lifted a finger — so hiding was
    // something you HAD rather than something you DID.
    if (isObscureDecl(playerDecl)) {
      out.setupBonus = 0;
      out.obscuredInsteadOfReading = { function: playerDecl.function, name: playerDecl.name || playerDecl.function };
    }
    // ⛔ WHEN THE PLAYER IS THE ONE HIDING, THE GAP RUNS THE OTHER WAY. `readerGap` below is the PLAYER's
    // read against the opponent; for a player who obscured, the reader is the OPPONENT and the gap must be
    // their margin over the player's. Using the same number for both would have paid the bonus off the
    // hider's own read - a sign error that reads as balance.
    const playerHiding = isObscureDecl(playerDecl);
    // an ACTIVE obscure opposes the read with the roll they actually made, never less than their passive
    // guardedness — working at it cannot leave you easier to read than standing there.
    const oppObscuring = isObscureDecl(oppDecl);
    const activeResist = oppObscuring ? Math.max(resist.value, o.margin) : resist.value;
    const readerGap = p.margin - activeResist;
    // ⚠️ recorded because SNG-517's null band needs the same number the tie rule used. Two axes, ONE gap -
    // computing it twice is how they would drift apart.
    out.senseGap = playerHiding ? (o.margin - Math.max(resist.value, p.margin)) : readerGap;
    if (oppObscuring) out.obscuredBy = { name: oppDecl.name || oppDecl.function, resist: activeResist, was: resist.value };
    out.senseTier = (out.guardedInsteadOfReading || out.obscuredInsteadOfReading) ? 0
      // ⛔ THE TIE GOES TO THE OBSCURER. See obscurerWinsTie — do not soften this.
      : (oppObscuring && obscurerWinsTie(readerGap)) ? 0
      : senseTierFromDegree(p.degree, readerGap, sb);
    const grants = turnCfg.bonusOnDegrees || ["crit_success"];
    out.bonusEarned = { player: grants.includes(p.degree), opponent: grants.includes(o.degree) };
    // ⛔ SNG-517 / CCODE-212 — AND A SUCCESSFUL OBSCURE EARNS ONE TOO. Without it the trade is pure
    // denial: you spend your slot, they lose theirs, nobody gains, and obscure is a tax on both sides
    // rather than a play. `senseBonusFor` states the conditions once; this only routes the answer.
    const oppSensed = declaredSense(oppDecl, sb);
    const oppIdle = declaredNothing(oppDecl);
    const bonusWinner = senseBonusFor({
      obscured: !!out.obscuredInsteadOfReading, opponentSensed: oppSensed, opponentIdle: oppIdle,
      gap: (out.senseGap != null ? out.senseGap : 0), sb
    });
    if (bonusWinner === "obscurer") out.bonusEarned = { ...out.bonusEarned, player: true };
    // ⛔ CCODE-255 / ERIK: "i agree with the foe having to read you as well, in addition to being able to
    // obscure your party." Until now the foe picked its target with PERFECT knowledge of your side — it knew
    // who was softest and who was mending, free, every round, while you had to earn the same by reading.
    // ⚠️ THE FOE'S READ IS EARNED IN THIS STEP AND SPENT IN THE ACTION STEP, exactly like yours. And it is
    // the OPPONENT'S roll that earns it, so hiding is not a magic ward — it is a contest they can win.
    // ⚠️ NO SIGN FLIP. When the player is hiding, `senseGap` above IS ALREADY THE FOE'S reader-gap — that is
    // exactly what the line computing it says it is. My first version negated it, which inverted who had won
    // the read and let a foe who was beaten by 23 come away with a tier. A gate caught it in one run.
    out.foeReadTier = playerHiding
      // you spent the step working at being unfound: their read is opposed, and a tie is YOURS — the same
      // `obscurerWinsTie` rule as always, simply pointed at the other reader.
      ? (obscurerWinsTie(out.senseGap ?? 0) ? 0 : senseTierFromDegree(o.degree, out.senseGap ?? 0, sb))
      : senseTierFromDegree(o.degree, 0, sb);
    out.senseBonus = { winner: bonusWinner, opponentSensed: oppSensed, opponentIdle: oppIdle,
      band: Math.max(0, Number(sb?.senseStep?.bonusNullBand ?? 2)), gap: out.senseGap ?? null };
  }
  return out;
}
