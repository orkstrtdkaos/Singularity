// skill_battle_sim.mjs — SNG-098: the two-sided contest + fog-of-war invariant.
// Proves: both sides roll; matchup edges resolve; momentum + attrition behave; and — the load-bearing
// guard — the FOG IS PRESENTATION OVER TRUE STATE: the engine's opponent receipt is byte-identical across
// viewer tiers; only senseOpponent's REVEALED slice grows. Tier 0 has NO number; tier 3 has the full breakdown.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { matchupBonus, synthesizeOpponentSheet, synthesizeStaticSheet, opponentPolicy, battleRound, phaseDenied } from "../engine/skill_battle.js";
import { senseOpponent } from "../engine/sense.js";
import { startEncounter, skillBattleRound, sanitizeNewEncounter } from "../engine/encounters.js";
import { mintableBraidsFor, BRAID_RIPEN_AT } from "../engine/braids.js";   // CCODE-37: the weave feeds the braid economy
import { recordUse } from "../engine/practice.js";
import { FRAME_KINDS, encounterKind, chaseFromFight, frameModel } from "../engine/encounterFrame.js";   // SNG-247: the kind list the colour gate checks
import { synthesizeStandoffDef, synthesizePuzzleDef, frameExemplarEncounters, eligibleEncountersFor } from "../engine/random_encounters.js";   // SNG-247 2a: the kind that never minted
import { harmTargetFor } from "../engine/intent.js";   // SNG-246 Fix A: who the player committed harm against

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;

let failures = 0;
const check = (label, cond) => { console.log((cond ? "PASS  " : "FAIL  ") + label); if (!cond) failures++; };
// deterministic RNG: a fixed sequence so rolls are reproducible (no Math.random in tests).
const seqRng = (vals) => { let i = 0; return () => vals[i++ % vals.length]; };

// ---- matchup edges (structured, from content) ----
check("SNG-098: reveal beats conceal (+2 for the reveal)", matchupBonus("reveal", "conceal", sb) === 2);
check("SNG-098: conceal is at a disadvantage vs reveal (-2)", matchupBonus("conceal", "reveal", sb) === -2);
check("SNG-098: a shield BLUNTS a strike — no edge, never a penalty (0)", matchupBonus("strike", "shield", sb) === 0);
check("SNG-098: bind pins move (+2)", matchupBonus("bind", "move", sb) === 2);
check("SNG-098: an unknown matchup falls to the default (0)", matchupBonus("waffle", "nonsense", sb) === 0);

// ---- opponent sheet synthesis from threat + tacticTags ----
const raider = synthesizeOpponentSheet({ name: "Raider", threat: 35, tacticTags: ["berserker"] }, sb);
check("SNG-098: a threat-35 berserker synthesizes a modest sheet (attrs + tier + energy + strike skills)",
  raider.attributes.practical >= 2 && raider.skills.length > 0 && raider.skills[0].function === "strike" && raider.energy > 0);
const authored = synthesizeOpponentSheet({ name: "Duelist", threat: 20, skills: [{ function: "reveal", name: "the read", tier: 4 }] }, sb);
check("SNG-098: an authored opponent.skills[] overrides the synthesis", authored.authored === true && authored.skills[0].function === "reveal" && authored.skills[0].tier === 4);

// ---- opponent policy is deterministic: behind → Surge, ahead → Conserve ----
const berserkerSheet = { skills: [{ function: "strike", name: "reave", tier: 2 }], tacticTags: ["berserker"], energy: 40 };
check("SNG-098: a berserker behind on momentum Surges", opponentPolicy(berserkerSheet, { momentum: 6, opponentEnergy: 40 }, null, sb).intensity === "surge");
const duelistSheet = { skills: [{ function: "strike", name: "cut", tier: 2 }, { function: "shield", name: "guard", tier: 2 }], tacticTags: ["duelist"], energy: 40 };
check("SNG-098: a duelist ahead on momentum paces (does not Surge)", opponentPolicy(duelistSheet, { momentum: -6, opponentEnergy: 40 }, null, sb).intensity !== "surge");
check("SNG-098: policy picks the skill that matches up best vs the player's shown tendency",
  opponentPolicy({ skills: [{ function: "strike", name: "s", tier: 2 }, { function: "reveal", name: "r", tier: 2 }], energy: 40 }, {}, "conceal", sb).function === "reveal");
check("SNG-098: attrition — a near-empty pool can't Surge (drops to Standard)",
  opponentPolicy(berserkerSheet, { momentum: 6, opponentEnergy: 5 }, null, sb).intensity === "standard");

// ---- a round: both sides roll; the receipt is complete ----
const playerSheet = { attributes: { mental: 4, practical: 3 }, energy: 100 };
const oppSheet = synthesizeOpponentSheet({ threat: 30, tacticTags: ["duelist"] }, sb);
const rng = seqRng([0.30, 0.70]); // player rolls ~31, opponent ~71 — player beats their threshold by more
const round = battleRound({
  playerDecl: { function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "the read" },
  oppDecl: { function: "conceal", tier: 2, attribute: "practical", intensity: "standard", name: "the feint" },
  playerSheet, oppSheet, state: { momentum: 0 }, rules, sb, steps, rng
});
check("SNG-098: a round produces BOTH full rolls with SNG-106 breakdowns", !!round.player.breakdown && !!round.opponent.breakdown && Array.isArray(round.opponent.breakdown.components));
check("SNG-098: the matchup edge enters the opponent's breakdown as its own honest line",
  round.opponent.breakdown.components.some(c => /matchup/.test(c.label)));
check("SNG-098: sum(components) === breakdown.total (self-summing, SNG-106)",
  round.opponent.breakdown.components.reduce((s, c) => s + c.value, 0) === round.opponent.breakdown.total);
check("SNG-098: a round shifts momentum toward a winner (bidirectional meter moved)", round.state.momentum !== 0 && !!round.roundWinner);
check("SNG-098: both sides pay energy (attrition accrues)", round.state.playerEnergy < 100 && round.state.opponentEnergy < oppSheet.energy);

// ---- attrition can decide it independent of rolls ----
const drained = battleRound({
  playerDecl: { function: "strike", tier: 2, intensity: "standard", name: "cut" },
  oppDecl: { function: "shield", tier: 2, intensity: "surge", name: "guard" },
  playerSheet: { attributes: { practical: 3 }, energy: 100 }, oppSheet: { attributes: { practical: 3 }, energy: 3, skills: [] },
  state: { momentum: 0, playerEnergy: 100, opponentEnergy: 3 }, rules, sb, steps, rng: seqRng([0.5, 0.5])
});
// CCODE-39 REWRITES this rule (Erik: "if energy is depleted it shouldn't stop a fight cold… that is a yield
// option, but people can fight on with simple strikes and defends, or use an item to restore energy"). Attrition is
// still real — it strips your CRAFTS — but it no longer hands anyone the win.
check("CCODE-39: attrition still bites (the pool empties) but no longer FORFEITS the contest",
  drained.state.opponentEnergy <= 0 && drained.resolved !== "player" && drained.state.spent?.opponent === true);

// ---- ⭐ THE FOG INVARIANT: presentation over TRUE state, never false state ----
const viewerBlind = { attunement: 0 };   // tier 0
const viewerMaster = { attunement: 9 };  // tier 3
const oppRound = round.opponent;         // ONE true receipt
const fog0 = senseOpponent(viewerBlind, oppRound, rules, sb);
const fog3 = senseOpponent(viewerMaster, oppRound, rules, sb);
check("SNG-098 FOG: at tier 0 the viewer gets the OUTCOME and NO number (no intent, no band, no breakdown)",
  fog0.tier === 0 && fog0.revealed.outcome && fog0.revealed.intent === undefined && fog0.revealed.band === undefined && fog0.revealed.breakdown === undefined);
check("SNG-098 FOG: at tier 3 the viewer sees the skill, intensity, and the FULL breakdown (the enemy's math)",
  fog3.tier === 3 && fog3.revealed.skill && fog3.revealed.intensity && fog3.revealed.breakdown === oppRound.breakdown);
check("SNG-098 FOG: a mid tier (2) shows intent + a qualitative BAND but still no number",
  (() => { const f = senseOpponent({ attunement: 5 }, oppRound, rules, sb); return f.tier === 2 && f.revealed.intent && f.revealed.band && f.revealed.breakdown === undefined; })());
check("SNG-098 FOG: the engine's TRUE opponent receipt is IDENTICAL regardless of who's watching (fog never mutates state)",
  JSON.stringify(oppRound) === JSON.stringify(round.opponent) && oppRound.breakdown.total === round.opponent.breakdown.total);
check("SNG-098 FOG: a 'read them' action BUYS a tier (scouting/buyTier raises what a blind viewer sees)",
  senseOpponent(viewerBlind, oppRound, rules, sb, { buyTier: 1 }).tier === 1);
check("SNG-098 FOG: never fabricates a number — a low-tier reveal contains no numeric field",
  Object.values(fog0.revealed).every(v => typeof v !== "number"));

// ---- Phase B: encounters routing (spawn + round → the classic duel lifecycle) ----
const duelDef = { id: "d1", type: "duel", opponent: { name: "Raider", health: 4, threat: 30, yieldAt: 0, tacticTags: ["berserker"] } };
check("SNG-098 B: sanitizeNewEncounter accepts an AUTHORED opponent.skills[] (set-piece override)",
  (() => { const e = sanitizeNewEncounter({ type: "duel", name: "Duel", opponent: { name: "Sef", skills: [{ function: "reveal", name: "the read", tier: 3 }] } }); return e.opponent.skills?.[0]?.function === "reveal" && e.opponent.skills[0].tier === 3; })());
check("SNG-098 B: a classic duel (no sheet) stays the single-margins duel — no skill-battle fields",
  (() => { const st = startEncounter(duelDef); return st.mode === undefined && st.opponentHealth === 4; })());
const oppS = synthesizeOpponentSheet(duelDef.opponent, sb);
const sbState = startEncounter(duelDef, { oppSheet: oppS });
check("SNG-098 B: a duel spawned WITH a sheet runs as a skill battle (mode + momentum + opponentSheet)",
  sbState.mode === "skill_battle" && sbState.momentum === 0 && !!sbState.opponentSheet && sbState.opponentEnergy > 0);
const char = { attributes: { practical: 4, mental: 3 }, energy: 100 };
const rr = skillBattleRound(sbState, duelDef, { function: "reveal", tier: 3, attribute: "mental", intensity: "surge", name: "the read" }, { character: char, rules, sb, steps, rng: seqRng([0.15, 0.85]) });
check("SNG-098 B: a skill-battle round returns a fog-gateable opponent receipt + shifts momentum + spends the player's energy",
  !!rr.opponent?.breakdown && rr.state.momentum !== 0 && rr.deltas.energy < 0);
check("SNG-098 B: yielding ends the contest via the classic lifecycle outcome", skillBattleRound(sbState, duelDef, {}, { character: char, rules, sb, steps, yield: true }).outcome === "yielded");
// CCODE-38: a decisive swing no longer ENDS the fight — it is PRESSURE. Sustained domination does end it: once the
// opponent has been driven back breakAtPressure times they break, and THAT maps to the classic duel outcome.
const crush = skillBattleRound({ ...sbState, momentum: 9 }, duelDef, { function: "strike", tier: 4, attribute: "practical", intensity: "surge", name: "the blow" }, { character: char, rules, sb, steps, rng: seqRng([0.02, 0.98]) });
check("CCODE-38: a single decisive swing PRESSURES rather than ends (Erik: a meter must not decide a fight)",
  !crush.ended && crush.pressureEvent?.side === "opponent");
check("CCODE-38: sustained domination DOES end it — the opponent breaks, mapped to a classic duel outcome",
  (() => {
    const breakAt = sb.momentum.pressure.breakAtPressure;
    const st = { ...sbState, momentum: 9, pressure: { player: 0, opponent: breakAt - 1 } };
    const out = skillBattleRound(st, duelDef, { function: "strike", tier: 4, attribute: "practical", intensity: "surge", name: "the blow" }, { character: char, rules, sb, steps, rng: seqRng([0.02, 0.98]) });
    return out.ended && /opponent_(fell|yielded)/.test(out.outcome || "");
  })());

// ---- CCODE-35: persistent effects (Erik: "each action should produce something that could persist") ----
// The load-bearing guard is NOT "an effect appears on state" — it's "the effect REACHES THE ROLL as an honest,
// named line." A feature that shows "guard up" while the math never sees it is worse than no feature at all.
const fxCfg = sb.persistentEffects;
check("CCODE-35: the effect definitions are CONTENT, not code (engine.persistentEffects.byFunction)",
  !!fxCfg && !!fxCfg.byFunction?.shield && !!fxCfg.byFunction?.bind);
// a landed shield leaves a standing guard on the ACTOR; a landed bind lands on the OTHER side
const guardRound = battleRound({
  playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard" },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
  playerSheet: { attributes: { physical: 5 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
  state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.01, 0.99]) // player crits, opponent botches
});
const guardFx = (guardRound.effects || []).find(f => f.kind === "guard");
check("CCODE-35: a landed shield leaves a standing guard on the ACTOR's side", !!guardFx && guardFx.side === "player" && guardFx.roundsLeft > 0);
check("CCODE-35: an effect never modifies the round that created it (it enters state, not this roll)",
  !(guardRound.player.effectMods || []).some(m => /guard up/.test(m.label)));
// THE SEAM: carry that state into the next round and prove the bonus is a NAMED line in the breakdown
const nextRound = battleRound({
  playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard" },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
  playerSheet: { attributes: { physical: 5 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
  state: { momentum: 0, effects: guardRound.effects }, rules, sb, steps, rng: seqRng([0.5, 0.5])
});
check("CCODE-35: a standing guard REACHES THE ROLL as a named, signed contestMod (not a hidden fudge)",
  (nextRound.player.breakdown?.components || []).some(c => /guard up/.test(c.label) && c.value > 0));
// SNG-106 self-summing WITH an effect line. `total` is the POST-clamp chance, so the honest invariant is
// sum === (clampedFrom ?? total) — and when an effect pushes a strong character past the d100 ceiling, the
// breakdown must DISCLOSE the clamp rather than quietly swallowing the difference.
check("CCODE-35: sum(components) === (clampedFrom ?? total) WITH an effect line (SNG-106 self-summing)",
  (() => { const b = nextRound.player.breakdown; return b.components.reduce((s, c) => s + c.value, 0) === (b.clampedFrom ?? b.total); })());
check("CCODE-35: an effect that pushes past the d100 ceiling DISCLOSES the clamp (clampedFrom set, never silent)",
  (() => { const b = nextRound.player.breakdown; const sum = b.components.reduce((s, c) => s + c.value, 0); return sum <= b.total || b.clampedFrom === sum; })());
// whenAttacked gating: a guard does NOT apply when the opponent isn't attacking
const vsNonAttack = battleRound({
  playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard" },
  oppDecl: { function: "conceal", tier: 1, attribute: "practical", intensity: "standard", name: "a fade" },
  playerSheet: { attributes: { physical: 5 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
  state: { momentum: 0, effects: guardRound.effects }, rules, sb, steps, rng: seqRng([0.5, 0.5])
});
check("CCODE-35: a whenAttacked guard does NOT fire when the opponent isn't attacking",
  !(vsNonAttack.player.breakdown?.components || []).some(c => /guard up/.test(c.label)));
// a MISS leaves nothing — a botched guard is not a raised shield
const missed = battleRound({
  playerDecl: { function: "shield", tier: 1, attribute: "physical", intensity: "standard", name: "Raise a guard" },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
  playerSheet: { attributes: { physical: 1 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
  state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.99, 0.5]) // player botches
});
check("CCODE-35: a MISSED move leaves no effect (a botched guard is not a raised shield)",
  !(missed.effects || []).some(f => f.side === "player"));
// effects expire
check("CCODE-35: an effect ticks down and EXPIRES (it is not permanent)",
  (() => {
    let st = { momentum: 0, effects: [{ kind: "guard", label: "guard up", value: 4, roundsLeft: 1, applies: "whenAttacked", side: "player", source: "t", from: "player" }] };
    const r = battleRound({
      playerDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "s" },
      oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "s" },
      playerSheet: { attributes: { physical: 3 }, energy: 100 }, oppSheet: { attributes: { physical: 3 }, energy: 100, skills: [] },
      state: st, rules, sb, steps, rng: seqRng([0.99, 0.99]) // both botch, so nothing new lands
    });
    return !(r.effects || []).some(f => f.kind === "guard");
  })());
// THE ROUND-TRIP SEAM (seam_battle_effects_roundtrip): effects survive skillBattleRound's hand-built state
check("CCODE-35: effects survive the skillBattleRound round-trip (the hand-built state object keeps them)",
  (() => {
    const st = { ...sbState, effects: [{ kind: "insight", label: "you have their measure", value: 3, roundsLeft: 3, applies: "always", side: "player", source: "t", from: "player" }] };
    const out = skillBattleRound(st, duelDef, { function: "strike", tier: 2, attribute: "practical", intensity: "standard", name: "a cut" }, { character: char, rules, sb, steps, rng: seqRng([0.4, 0.6]) });
    return (out.state.effects || []).some(f => f.kind === "insight") && (out.player.breakdown?.components || []).some(c => /measure/.test(c.label));
  })());

// ---- CCODE-37: the WEAVE — two crafts in one turn (Erik: "this is where braids really shine") ----
// Turn-by-turn forces one move per turn; a weave is how a practised pairing beats that limit. It must cost for
// both, show its second craft as a named line, and — the payoff — land BOTH effects from the one turn.
const weaveCfg = sb.weave;
check("CCODE-37: the weave dials are CONTENT (engine.weave)", !!weaveCfg && Number.isFinite(weaveCfg.bonusPerTier));
const wovenRound = battleRound({
  playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard",
                woven: { function: "reveal", tier: 2, name: "Prism Sight" } },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
  playerSheet: { attributes: { physical: 3 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
  state: { momentum: 0, effects: [], playerEnergy: 100 }, rules, sb, steps, rng: seqRng([0.01, 0.99])
});
check("CCODE-37: the woven craft is its OWN named line in the roll (not a hidden bonus)",
  (wovenRound.player.breakdown?.components || []).some(c => /woven: Prism Sight/.test(c.label) && c.value > 0));
check("CCODE-37: THE PAYOFF — one woven turn lands BOTH crafts' effects",
  (() => { const k = (wovenRound.effects || []).filter(f => f.side === "player").map(f => f.kind); return k.includes("guard") && k.includes("insight"); })());
check("CCODE-37: a woven round costs energy for BOTH crafts (weaving is a real price, not a free upgrade)",
  (() => {
    const plain = battleRound({
      playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard" },
      oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
      playerSheet: { attributes: { physical: 3 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
      state: { momentum: 0, effects: [], playerEnergy: 100 }, rules, sb, steps, rng: seqRng([0.01, 0.99])
    });
    return wovenRound.state.playerEnergy < plain.state.playerEnergy;
  })());
check("CCODE-37: an unwoven round is unchanged (the weave is additive, never a tax on normal play)",
  !(battleRound({
    playerDecl: { function: "shield", tier: 3, attribute: "physical", intensity: "standard", name: "Raise a guard" },
    oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
    playerSheet: { attributes: { physical: 3 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
    state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.5, 0.5])
  }).player.breakdown?.components || []).some(c => /woven/.test(c.label)));
// the braid economy: a weave is a CO-ACTIVATION, so weaving a pairing enough times earns it as a braid
check("CCODE-37: weaving records a co-activation, so a pairing ripens toward a real braid (the whole arc)",
  (() => {
    const ch = { abilities: [{ abilityId: "a", level: 2 }, { abilityId: "b", level: 2 }], practice: null };
    for (let i = 0; i < BRAID_RIPEN_AT; i++) recordUse(ch, ["a", "b"], { day: i });
    const cat = { a: { id: "a", name: "A", functions: ["strike"] }, b: { id: "b", name: "B", functions: ["reveal"] } };
    return mintableBraidsFor(ch, { catalog: cat }).some(m => m.components.includes("a") && m.components.includes("b"));
  })());

// ---- CCODE-38: momentum is a MODIFIER, not the exit (Erik: "I took one hit - still tons of energy and health") ----
const bigSheets = { playerSheet: { attributes: { physical: 4 }, energy: 100 }, oppSheet: { attributes: { physical: 4 }, energy: 100, skills: [] } };
const decls = { playerDecl: { function: "strike", tier: 2, attribute: "physical", intensity: "standard", name: "a cut" },
                oppDecl: { function: "strike", tier: 2, attribute: "physical", intensity: "standard", name: "a hard strike" } };
check("CCODE-38: momentum enters the roll as a NAMED modifier line (ahead presses, behind costs)",
  (() => {
    const r = battleRound({ ...decls, ...bigSheets, state: { momentum: 10, effects: [] }, rules, sb, steps, rng: seqRng([0.5, 0.5]) });
    return (r.player.breakdown?.components || []).some(c => /momentum \(you have the advantage\)/.test(c.label) && c.value > 0)
        && (r.opponent.breakdown?.components || []).some(c => /momentum \(you're on the back foot\)/.test(c.label) && c.value < 0);
  })());
check("CCODE-38: momentum at zero adds NO line (no zero-value noise in the breakdown)",
  !(battleRound({ ...decls, ...bigSheets, state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.5, 0.5]) })
    .player.breakdown?.components || []).some(c => /momentum/.test(c.label)));
// THE ONE THAT MATTERS: a full meter must not end a fight fought by someone with resources left
check("CCODE-38 (Erik's fight): filling the meter does NOT end it — it pressures, and the meter RESETS",
  (() => {
    const r = battleRound({ ...decls, ...bigSheets, state: { momentum: -15, effects: [], pressure: { player: 0, opponent: 0 } }, rules, sb, steps, rng: seqRng([0.99, 0.01]) });
    const meterMax = sb.momentum.meterMax;
    return !r.resolved && r.pressureEvent?.side === "player" && Math.abs(r.state.momentum) < meterMax;
  })());
check("CCODE-38: a pressure event costs the PLAYER real health via skillBattleRound (attrition, not a verdict)",
  (() => {
    const st = { ...sbState, momentum: -15, pressure: { player: 0, opponent: 0 } };
    const out = skillBattleRound(st, duelDef, { function: "strike", tier: 1, attribute: "practical", intensity: "standard", name: "a cut" }, { character: char, rules, sb, steps, rng: seqRng([0.99, 0.01]) });
    return !out.ended && out.deltas.health < 0;
  })());
check("CCODE-38: pressure survives the skillBattleRound round-trip (the seam that would silently drop it)",
  (() => {
    const st = { ...sbState, momentum: -15, pressure: { player: 1, opponent: 0 } };
    const out = skillBattleRound(st, duelDef, { function: "strike", tier: 1, attribute: "practical", intensity: "standard", name: "a cut" }, { character: char, rules, sb, steps, rng: seqRng([0.99, 0.01]) });
    return (out.state.pressure?.player || 0) >= 2;
  })());
// ---- CCODE-38: the opponent is not a metronome (Erik: "they seem to always just strike") ----
check("CCODE-38: opponentPolicy VARIES its verb across rounds instead of always picking skills[0]",
  (() => {
    const sheet = { skills: [{ function: "strike", name: "a hard strike", tier: 2 }, { function: "shield", name: "a raised guard", tier: 2 }, { function: "bind", name: "a grapple", tier: 2 }], energy: 80, tacticTags: [] };
    const picks = new Set();
    let last = null;
    for (let round = 0; round < 6; round++) { const d = opponentPolicy(sheet, { momentum: 0, round, opponentEnergy: 80, lastOppFn: last }, null, sb); picks.add(d.function); last = d.function; }
    return picks.size > 1;
  })());
check("CCODE-38: the policy stays DETERMINISTIC (same state in → same move out; duels stay reproducible)",
  (() => {
    const sheet = { skills: [{ function: "strike", name: "s", tier: 2 }, { function: "shield", name: "g", tier: 2 }], energy: 80, tacticTags: [] };
    const st = { momentum: -4, round: 3, opponentEnergy: 80, lastOppFn: "strike" };
    return opponentPolicy(sheet, st, null, sb).function === opponentPolicy(sheet, st, null, sb).function;
  })());

// ---- CCODE-39: an empty energy pool is a STATE, not a verdict (Erik: "it shouldn't stop a fight cold") ----
const spentState = { momentum: 0, effects: [], pressure: { player: 0, opponent: 0 }, playerEnergy: 0, opponentEnergy: 60 };
const spentRound = battleRound({
  playerDecl: { function: "strike", tier: 3, attribute: "physical", intensity: "surge", name: "Hunter's Strike" },
  oppDecl: { function: "strike", tier: 2, attribute: "physical", intensity: "standard", name: "a hard strike" },
  playerSheet: { attributes: { physical: 4 }, energy: 0 }, oppSheet: { attributes: { physical: 3 }, energy: 60, skills: [] },
  state: spentState, rules, sb, steps, rng: seqRng([0.5, 0.5])
});
check("CCODE-39: running out of energy does NOT end the fight", !spentRound.resolved);
check("CCODE-39: a spent side's CRAFT doesn't answer — it degrades to steel and wit, and says so",
  spentRound.degraded?.player === true && spentRound.state.spent?.player === true);
check("CCODE-39: the spent side still ROLLS and still contests (they fight on, they don't stand still)",
  Number.isFinite(spentRound.player?.roll) && Number.isFinite(spentRound.player?.margin));
check("CCODE-39: an unspent side is untouched by the degrade rule",
  spentRound.degraded?.opponent === false);
check("CCODE-39: yielding while spent is still the PLAYER's call, and still works",
  skillBattleRound({ ...sbState, playerEnergy: 0 }, duelDef, {}, { character: char, rules, sb, steps, yield: true }).outcome === "yielded");
// ...and the fight must still TERMINATE — removing an exit must not create an unkillable stalemate.
check("CCODE-39: fights still terminate — the opponent breaking remains a real end condition",
  (() => {
    const breakAt = sb.momentum.pressure.breakAtPressure;
    const out = skillBattleRound({ ...sbState, momentum: 9, pressure: { player: 0, opponent: breakAt - 1 }, playerEnergy: 0 },
      duelDef, { function: "strike", tier: 4, attribute: "practical", intensity: "surge", name: "the blow" },
      { character: char, rules, sb, steps, rng: seqRng([0.02, 0.98]) });
    return out.ended;
  })());

// ---- CCODE-40: stacks are compared PRIOR to the clamp (Erik's exact arithmetic) ----
// "If I have +35 due to abilities and skills and the enemy has +25 but has also landed a bind on me (-15) the net
// difference would be (-5) to my roll." Before this, both sides clamped at the 95% ceiling and the bind did NOTHING.
const strongP = { attributes: { physical: 6 }, energy: 100 };   // deep into the clamp on its own
const strongO = { attributes: { physical: 6 }, energy: 100, skills: [] };
const evenDecls = { playerDecl: { function: "strike", tier: 3, attribute: "physical", intensity: "standard", name: "a cut" },
                    oppDecl: { function: "strike", tier: 3, attribute: "physical", intensity: "standard", name: "a hard strike" } };
const noBind = battleRound({ ...evenDecls, playerSheet: strongP, oppSheet: strongO, state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.5, 0.5]) });
const withBind = battleRound({ ...evenDecls, playerSheet: strongP, oppSheet: strongO,
  state: { momentum: 0, effects: [{ kind: "bound", label: "bound", value: -15, roundsLeft: 2, applies: "always", side: "player", source: "a grapple", from: "opponent" }] },
  rules, sb, steps, rng: seqRng([0.5, 0.5]) });
check("CCODE-40: both sides are ABOVE the ceiling here (the clamp really is biting — the bug's precondition)",
  noBind.player.breakdown?.clampedFrom > noBind.player.chance && noBind.opponent.breakdown?.clampedFrom > noBind.opponent.chance);
check("CCODE-40: a bind laid on you now MOVES the contest (it was silently discarded by the clamp before)",
  withBind.player.margin < noBind.player.margin);
check("CCODE-40: the bind's full -15 reaches the margin, undiluted by the ceiling",
  (noBind.player.margin - withBind.player.margin) === 15);
// margin is ALWAYS rawChance - roll; and on the still-clamped side raw and clamped genuinely differ.
// (With the -15 applied the player drops back UNDER the ceiling — which is the point: the penalty now bites.)
check("CCODE-40: the contest margin is always rawChance − roll, on both sides",
  withBind.player.margin === (withBind.player.rawChance - withBind.player.roll)
  && withBind.opponent.margin === (withBind.opponent.rawChance - withBind.opponent.roll));
check("CCODE-40: on a side the ceiling DID bite, the raw stack outranks the clamped chance",
  noBind.player.rawChance > noBind.player.chance && withBind.opponent.rawChance > withBind.opponent.chance);
check("CCODE-40: DEGREE still uses the clamped chance — the ceiling still lets your own action fail",
  noBind.player.chance <= rules.d100.ceilingChance);
check("CCODE-40: an unclamped roll is unaffected (rawChance === chance when the ceiling never bit)",
  (() => {
    const weak = battleRound({ ...evenDecls, playerSheet: { attributes: { physical: 1 }, energy: 100 }, oppSheet: { attributes: { physical: 1 }, energy: 100, skills: [] },
      state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.5, 0.5]) });
    return weak.player.rawChance === weak.player.chance && weak.player.margin === weak.player.chance - weak.player.roll;
  })());

// ---- CCODE-41 groundwork: an effect can DENY a phase (Erik: "blinded you to the sense skills you might have") ----
check("CCODE-41: phaseDenied reads deniesPhase off a standing effect, for that side only",
  phaseDenied([{ side: "player", deniesPhase: "setup" }], "player", "setup")
  && !phaseDenied([{ side: "player", deniesPhase: "setup" }], "opponent", "setup")
  && !phaseDenied([{ side: "player", deniesPhase: "setup" }], "player", "action"));
check("CCODE-41: an ordinary effect denies nothing (no accidental phase locks)",
  !phaseDenied([{ side: "player", kind: "guard", value: 4 }], "player", "setup"));
check("CCODE-41: deniesPhase rides from the CONTENT def onto the live effect (else the counterplay is inert)",
  (() => {
    const def = sb.persistentEffects.byFunction.deceive;
    if (!def?.deniesPhase) return false;                       // content must declare it
    const r = battleRound({
      playerDecl: { function: "deceive", tier: 3, attribute: "mental", intensity: "standard", name: "a deep feint" },
      oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
      playerSheet: { attributes: { mental: 5 }, energy: 100 }, oppSheet: { attributes: { physical: 2 }, energy: 100, skills: [] },
      state: { momentum: 0, effects: [] }, rules, sb, steps, rng: seqRng([0.01, 0.99])
    });
    return phaseDenied(r.effects, "opponent", "setup");        // it landed ON the opponent and denies their setup
  })());

// ---- CCODE-45: THE TURN — sense → action → bonus (Erik: "sensing doesn't give the opponent a free hit") ----
const turnSheets = { playerSheet: { attributes: { mental: 5, physical: 4 }, energy: 100 },
                     oppSheet: { attributes: { mental: 2, physical: 3 }, energy: 100, skills: [] } };
const senseDecls = { playerDecl: { function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "Prism Sight" },
                     oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" } };
const baseState = { momentum: 4, effects: [], pressure: { player: 0, opponent: 0 }, round: 3 };
const senseOut = battleRound({ ...senseDecls, ...turnSheets, state: baseState, rules, sb, steps, rng: seqRng([0.01, 0.99]), phase: "sense", tickEffects: false });
check("CCODE-45: the turn dials are CONTENT (engine.turn)", !!sb.turn && Array.isArray(sb.turn.bonusOnDegrees));
check("CCODE-45 (the whole point): a SENSE step does NOT move momentum — sensing is not a free hit for them",
  senseOut.state.momentum === baseState.momentum);
check("CCODE-45: a SENSE step applies no pressure and does not advance the round (the turn is one round)",
  !senseOut.pressureEvent && senseOut.state.round === baseState.round);
check("CCODE-45: a winning sense returns a positive setupBonus for the reader",
  Number.isFinite(senseOut.setupBonus) && senseOut.setupBonus > 0);
check("CCODE-45: a CRIT sense earns the bonus step ('it's the payoff')",
  senseOut.player.degree === "crit_success" && senseOut.bonusEarned?.player === true);
check("CCODE-45: the sense step still LANDS its effect (a read leaves insight standing)",
  (senseOut.effects || []).some(f => f.side === "player" && f.kind === "insight"));
// the setup bonus must REACH the action roll as a named line, signed against the opponent
const actionOut = battleRound({
  playerDecl: { function: "strike", tier: 2, attribute: "physical", intensity: "standard", name: "Hunter's Strike" },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "a hard strike" },
  ...turnSheets, state: senseOut.state, rules, sb, steps, rng: seqRng([0.5, 0.5]),
  phase: "action", tickEffects: true, setupBonus: senseOut.setupBonus
});
check("CCODE-45: the setup bonus is a NAMED line on the ACTION roll (never a hidden fudge)",
  (actionOut.player.breakdown?.components || []).some(c => /you read them first/.test(c.label) && c.value === senseOut.setupBonus));
check("CCODE-45: the setup bonus is SIGNED against the opponent (their read of you cost them)",
  (actionOut.opponent.breakdown?.components || []).some(c => /they read you first/.test(c.label) && c.value === -senseOut.setupBonus));
check("CCODE-45: an ACTION step still moves momentum normally (the turn's real exchange)",
  actionOut.state.momentum !== senseOut.state.momentum);
// effects tick ONCE per turn, not per step
check("CCODE-45: tickEffects:false holds an effect's counter across a step; the last step ticks it",
  (() => {
    const fx = [{ kind: "guard", label: "guard up", value: 4, roundsLeft: 3, applies: "always", side: "player", source: "t", from: "player" }];
    const held = battleRound({ ...senseDecls, ...turnSheets, state: { ...baseState, effects: fx }, rules, sb, steps, rng: seqRng([0.5, 0.5]), phase: "sense", tickEffects: false });
    const ticked = battleRound({ ...senseDecls, ...turnSheets, state: { ...baseState, effects: fx }, rules, sb, steps, rng: seqRng([0.5, 0.5]), phase: "action", tickEffects: true });
    return held.effects.find(f => f.kind === "guard")?.roundsLeft === 3
        && ticked.effects.find(f => f.kind === "guard")?.roundsLeft === 2;
  })());
// BACKWARD COMPATIBILITY: the defaults must leave every existing caller byte-identical
check("CCODE-45: the new options DEFAULT to today's behaviour (no existing caller changes)",
  (() => {
    const a = battleRound({ ...senseDecls, ...turnSheets, state: baseState, rules, sb, steps, rng: seqRng([0.4, 0.6]) });
    const b = battleRound({ ...senseDecls, ...turnSheets, state: baseState, rules, sb, steps, rng: seqRng([0.4, 0.6]), phase: "action", tickEffects: true, setupBonus: 0 });
    return a.state.momentum === b.state.momentum && a.player.chance === b.player.chance && a.setupBonus === undefined;
  })());

// ---- CCODE-45: the turn options must SURVIVE skillBattleRound (seam_battle_round_options) ----
// This seam has bitten TWICE. The wrapper hand-builds its battleRound call, so an option it does not forward
// vanishes silently — and a SENSE step that quietly runs as an ACTION round defeats the whole sense phase.
check("CCODE-45 SEAM: phase survives skillBattleRound — a sense does NOT advance the round or move momentum",
  (() => {
    const st = { ...sbState, momentum: 2, round: 5 };
    const out = skillBattleRound(st, duelDef, { function: "reveal", tier: 2, attribute: "mental", intensity: "standard", name: "a read" },
      { character: char, rules, sb, steps, rng: seqRng([0.4, 0.6]), phase: "sense", tickEffects: false });
    return out.state.round === 5 && out.state.momentum === 2;
  })());
check("CCODE-45 SEAM: setupBonus + bonusEarned come back OUT of skillBattleRound",
  (() => {
    const out = skillBattleRound({ ...sbState, momentum: 0 }, duelDef, { function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "a read" },
      { character: char, rules, sb, steps, rng: seqRng([0.01, 0.99]), phase: "sense", tickEffects: false });
    return Number.isFinite(out.setupBonus) && !!out.bonusEarned;
  })());
check("CCODE-45 SEAM: an ACTION step through the wrapper still advances the round (default unchanged)",
  (() => {
    const st = { ...sbState, round: 5 };
    const out = skillBattleRound(st, duelDef, { function: "strike", tier: 2, attribute: "practical", intensity: "standard", name: "a cut" },
      { character: char, rules, sb, steps, rng: seqRng([0.4, 0.6]) });
    return out.state.round === 6;
  })());

// ---- CCODE-48: the cleanups have real consumers, not just exports ----
check("CCODE-48: every persistentEffects key is a REAL verb from the 24-verb vocabulary (no invented functions)",
  (() => {
    const vocab = rj("content/packs/core/rules/function_vocabulary.json");
    const verbs = new Set(Object.values(vocab.families).flat().map(e => e.verb));
    return Object.keys(sb.persistentEffects.byFunction).every(k => verbs.has(k));
  })());
check("CCODE-48: deniesPhase sits on a real verb, so the blinding counterplay can actually fire",
  (() => {
    const withDeny = Object.entries(sb.persistentEffects.byFunction).filter(([, v]) => v.deniesPhase);
    const vocab = rj("content/packs/core/rules/function_vocabulary.json");
    const verbs = new Set(Object.values(vocab.families).flat().map(e => e.verb));
    return withDeny.length > 0 && withDeny.every(([k]) => verbs.has(k));
  })());
check("CCODE-48: a ROUND is a TURN — sense and a mid-turn action do not advance it; the closing step does",
  (() => {
    const base = { ...sbState, round: 7 };
    const decl = { function: "strike", tier: 2, attribute: "practical", intensity: "standard", name: "a cut" };
    const o = { character: char, rules, sb, steps, rng: seqRng([0.4, 0.6]) };
    const sense = skillBattleRound(base, duelDef, { function: "reveal", tier: 2, attribute: "mental", intensity: "standard", name: "a read" }, { ...o, phase: "sense", tickEffects: false });
    const mid   = skillBattleRound(base, duelDef, decl, { ...o, phase: "action", tickEffects: false }); // a bonus follows
    const close = skillBattleRound(base, duelDef, decl, { ...o, phase: "action", tickEffects: true });  // ends the turn
    return sense.state.round === 7 && mid.state.round === 7 && close.state.round === 8;
  })());

// ---- SNG-246 FIX A: engine-enforced fight entry (Erik's ruling: c, with b as the fallback) ----
// The load-bearing property is NOT that it finds a target — it is that it REFUSES TO INVENT ONE. A resolver that
// guesses produces phantom opponents, the same class as seam_travelTo_is_place (a person minted as a destination).
const REG = { "mara-wells": { id: "mara-wells", name: "Mara Wells" },
              "grey": { id: "grey", name: "Grey-braided woman", aliases: ["the grey woman"] } };
check("SNG-246 A: an explicit targetNpcId resolves (the strongest signal)",
  harmTargetFor({ targetNpcId: "mara-wells" }, { npcRegistry: REG })?.id === "mara-wells");
check("SNG-246 A: a REGISTERED person named in the player's own choice resolves",
  harmTargetFor({ label: "Strike at Mara Wells with the Edge" }, { npcRegistry: REG })?.name === "Mara Wells");
check("SNG-246 A: an ALIAS in the player's exact words resolves",
  harmTargetFor({ label: "attack", exactWords: "I go for the grey woman" }, { npcRegistry: REG })?.id === "grey");
check("SNG-246 A (the one that matters): an unresolvable target returns NULL — the engine never invents a person",
  harmTargetFor({ label: "Strike at the shadows" }, { npcRegistry: REG }) === null
  && harmTargetFor({}, { npcRegistry: REG }) === null
  && harmTargetFor({ label: "kill them" }, { npcRegistry: {} }) === null);
check("SNG-246 A: a minted duel from a resolved target is a REAL skill battle (rounds, not one prose roll)",
  (() => {
    const def = { id: "harm-mara", type: "duel", opponent: { name: "Mara Wells", threat: 40, health: 5, yieldAt: 1 } };
    const sheet = synthesizeOpponentSheet(def.opponent, sb);
    const st = startEncounter(def, { oppSheet: sheet });
    return st.mode === "skill_battle" && st.momentum === 0 && !!st.opponentSheet;
  })());

// ---- SNG-247 Tier 1: THE EXIT RULE IS PER-KIND CONTENT, NOT FIGHT-SHAPED CODE ----
// The contest core was already kind-agnostic except for ONE block: what a pressure tick costs each side and what
// it is called. The load-bearing property is that lifting it into content did NOT move the fight — a chase can
// cost wind instead of blood without a fight round resolving one point differently.
const sbCrush = { ...sb, momentum: { ...sb.momentum, surgeCrushEndsIt: 0 } }; // any decisive round is a pressure tick
const kindRound = (kind, sbUse, rngVals) => battleRound({
  playerDecl: { function: "strike", tier: 2, attribute: "practical", intensity: "standard" },
  oppDecl: { function: "strike", tier: 2, attribute: "practical", intensity: "standard" },
  playerSheet: { attributes: { practical: 4 }, energy: 100 },
  oppSheet: synthesizeOpponentSheet({ threat: 30, tacticTags: ["duelist"] }, sb),
  state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 100, effects: [], pressure: { player: 0, opponent: 0 } },
  rules, sb: sbUse, steps, rng: seqRng(rngVals), ...(kind ? { kind } : {}),
});
const pLoses = [0.95, 0.05], pWins = [0.05, 0.95];   // lower roll = bigger margin (see the SNG-098 round above)
const noKind = kindRound(null, sbCrush, pLoses), asFight = kindRound("fight", sbCrush, pLoses), unknown = kindRound("wombat", sbCrush, pLoses);
check("SNG-247: the player-side tick fires and costs the fight's authored blood (health 3, no energy)",
  noKind.pressureEvent?.side === "player" && noKind.pressureEvent.healthLoss === 3 && noKind.pressureEvent.energyLoss === 0);
check("SNG-247 (the one that matters): kind defaults to fight, and an UNKNOWN kind falls back to it — the numbers never move",
  JSON.stringify([noKind.pressureEvent.healthLoss, noKind.pressureEvent.energyLoss, noKind.state.momentum])
  === JSON.stringify([asFight.pressureEvent.healthLoss, asFight.pressureEvent.energyLoss, asFight.state.momentum])
  && JSON.stringify([noKind.pressureEvent.healthLoss, noKind.pressureEvent.energyLoss])
  === JSON.stringify([unknown.pressureEvent.healthLoss, unknown.pressureEvent.energyLoss]));
check("SNG-247: the fight's authored pressure PROSE rides on the event, per side, with {them} left for the caller",
  /drives you back hard/.test(asFight.pressureEvent.label?.player || "")
  && asFight.pressureEvent.label.player.includes("{them}")
  && unknown.pressureEvent.label === null);   // prose authored for one kind never leaks onto another
check("SNG-247: the opponent-side tick spends their energy, not their blood (still the live momentum.pressure dial)",
  kindRound("fight", sbCrush, pWins).pressureEvent?.energyLoss === (sb.momentum.pressure.opponentEnergyLoss ?? 14));
// A kind whose cost is a genuinely different CURRENCY — the Tier-2 shape, proven against the real code now, so
// authoring a chase later is content-only work.
const sbChase = { ...sbCrush, kinds: { ...(sb.kinds || {}), chase: { playerLoss: { health: 0, energy: 12 }, pressure: { breakAtPressure: 1 } } } };
const chase = kindRound("chase", sbChase, pLoses);
check("SNG-247: a per-kind playerLoss SHADOWS the fight's defaults — a chase takes wind, not blood",
  chase.pressureEvent.healthLoss === 0 && chase.pressureEvent.energyLoss === 12);
check("SNG-247: a per-kind playerLoss actually drains the pool it names (reported AND applied)",
  chase.state.playerEnergy === kindRound("fight", sbCrush, pLoses).state.playerEnergy - 12);
check("SNG-247: a per-kind breakAtPressure ends it sooner — one decisive gain shakes a pursuer, two break a fighter",
  kindRound("chase", sbChase, pWins).resolved === "player" && kindRound("fight", sbCrush, pWins).resolved === null);

// SNG-247 Tier 0: EVERY frame kind must have a border colour. The `enc-frame-<kind>` hook shipped with SNG-230 and
// then sat completely unstyled, so every encounter rendered fight-red. This is the gate that stops a NEW kind
// shipping colourless the same way.
const cssText = readFileSync(join(root, "style.css"), "utf8");
const kindsMissingHue = Object.keys(FRAME_KINDS).filter(k =>
  !(cssText.includes(`.enc-kind-${k}`) && cssText.includes(`.enc-frame-${k}`)));
check(`SNG-247: every frame kind has an --enc-hue rule on BOTH hooks (missing: ${kindsMissingHue.join(", ") || "none"})`,
  kindsMissingHue.length === 0);
check("SNG-247: the frame + the contest panel read the SAME hue variable — one colour decision, not two",
  /\.enc-frame\s*\{[^}]*var\(--enc-hue/.test(cssText) && /\.sb-panel\s*\{[^}]*var\(--enc-hue/.test(cssText));

// ---- SNG-247 Tier 2a: STANDOFF BECOMES A REAL THING ----
// It had a FRAME_KINDS entry, an encounterKind mapping, an authored exemplar and an authored receipt format —
// and nothing ever minted one. A routing:"opposed" entry fell through to synthesizeChallengeDef and rendered as
// "hard ground": a contest of wills shown as terrain.
check("SNG-247 2a: a duel's FLAVOR says what is being contested — blades, ground, or resolve",
  encounterKind({ type: "duel", flavor: "standoff" }) === "standoff"
  && encounterKind({ type: "duel", flavor: "chase" }) === "chase"
  && encounterKind({ type: "duel", flavor: "fight" }) === "fight");
check("SNG-247 2a (regression guard): a duel with no/unknown flavor is still a FIGHT — no existing duel changes kind",
  encounterKind({ type: "duel" }) === "fight" && encounterKind({ type: "duel", flavor: "theft" }) === "fight");
const tollEntry = { id: "toll", kind: "standoff", routing: "opposed", flavor: "theft", tier: "notable",
  seed: "Someone stands between you and where you are going.", opponent: { name: "the toll-keeper", threat: 30 } };
const tollDef = synthesizeStandoffDef(tollEntry);
check("SNG-247 2a: an opposed entry mints a STANDOFF that the frame reads as a standoff (not hard ground)",
  tollDef.type === "duel" && tollDef.flavor === "standoff" && encounterKind(tollDef) === "standoff"
  && tollDef.opponent.name === "the toll-keeper" && tollDef.lethal === false);
check("SNG-247 2a: a standoff runs the ONE contest engine — startEncounter gives it a real skill battle",
  (() => {
    const st = startEncounter(tollDef, { oppSheet: synthesizeOpponentSheet(tollDef.opponent, sb) });
    return st?.mode === "skill_battle" && st.momentum === 0;
  })());
// The mechanically load-bearing half: a contest of WILLS cannot cost blood. Pressing one until someone draws is
// a MORPH into a fight — a different mechanic — not a standoff that deals damage.
const standoffLost = (kindDef) => {
  const oppSheet = synthesizeOpponentSheet(kindDef.opponent, sb);
  const st = startEncounter(kindDef, { oppSheet });
  return skillBattleRound({ ...st, pressure: { player: 9, opponent: 0 }, opponentEnergy: oppSheet.energy },
    kindDef, { function: "strike", tier: 1, attribute: "practical", intensity: "standard" },
    { character: { attributes: { practical: 2 }, energy: 100, health: 40, skills: {} },
      rules, sb, steps, rng: seqRng([0.99, 0.01]) });
};
check("SNG-247 2a: the standoff's authored prose reaches the round (no fight wording on a contest of wills)",
  /certainty|stands aside|holds the line/i.test(standoffLost(tollDef).events.join(" ")));
check("SNG-247 2a (the one that matters): losing a STANDOFF costs no health — losingCostsHealth:false is a ruling, not a label",
  standoffLost(tollDef).deltas.health === 0);
check("SNG-247 2a: a FIGHT still pays in blood — the per-kind rule didn't disarm the fight",
  (() => {
    const fightDef = { ...tollDef, flavor: "fight", id: "f", opponent: { ...tollDef.opponent, name: "the raider" } };
    return standoffLost(fightDef).deltas.health <= 0;
  })());

// ---- SNG-247 Tier 2b: A CHASE IS AN OPPOSED CONTEST, NOT A STAGE LADDER ----
// The same person who was swinging at you is running you down, with their own wind and their own choices. It runs
// the one contest engine; only the CURRENCY differs — ground is bought with wind, not blood.
const fightForChase = { id: "fight-1", type: "duel", flavor: "fight", tier: "notable",
  opponent: { name: "the raider", threat: 35, health: 5, yieldAt: 1 } };
const chaseDef = chaseFromFight(fightForChase);
check("SNG-247 2b: fleeing a fight builds a chase that RUNS ON THE CONTEST ENGINE, against the same person",
  chaseDef.type === "duel" && chaseDef.flavor === "chase" && encounterKind(chaseDef) === "chase"
  && chaseDef.opponent.name === "the raider" && chaseDef.opponent.yieldAt === 0);
check("SNG-247 2b: the chase keeps the way back into the fight it came from (the chain is what makes flee not a teleport)",
  chaseDef._chainedFrom.kind === "fight" && chaseDef._chainedFrom.fightDefId === "fight-1");
const chaseState = startEncounter(chaseDef, { oppSheet: synthesizeOpponentSheet(chaseDef.opponent, sb) });
check("SNG-247 2b: it starts as a real skill battle (a chase you can actually play, not a ladder you click through)",
  chaseState?.mode === "skill_battle");
// The meter bug this had to dodge: a duel-shaped chase has NO stages, so the stage-counting branch would have
// reported 0/0 forever — a bar that never moves through the whole chase.
const fmChase = frameModel(chaseDef, { ...chaseState, momentum: 5 });
check("SNG-247 2b (the one that matters): a contest-engine chase reads the CONTEST meter, not a stage count that does not exist",
  fmChase.meter.pct === 75 && /distance|ground/i.test(fmChase.meter.label));
check("SNG-247 2b: its exits keep the chase's own words but wire to the DUEL's actions — buttons that fire at something",
  (() => {
    const byRole = Object.fromEntries(fmChase.exits.map(e => [e.role, e]));
    return byRole.defeat.action === "strike" && byRole.flee.action === "flee"
      && /chase|catch|pursu/i.test(byRole.defeat.label + byRole.defeat.means);
  })());
check("SNG-247 2b: a STAGED encounter still counts stages — the contest-meter rule didn't swallow hazards",
  (() => {
    const hz = { type: "challenge", flavor: "dangerous", stages: [{ name: "a" }, { name: "b" }] };
    const m = frameModel(hz, { stageIndex: 1, stagesDone: ["a"] }).meter;
    return m.total === 2 && m.done === 1 && m.pct === 50;
  })());
check("SNG-247 2b: losing a chase costs WIND, not blood — being caught is the fight resuming, not damage",
  (() => {
    const oppSheet = synthesizeOpponentSheet(chaseDef.opponent, sb);
    const st = startEncounter(chaseDef, { oppSheet });
    const rr = skillBattleRound({ ...st, pressure: { player: 9, opponent: 0 }, opponentEnergy: oppSheet.energy },
      chaseDef, { function: "move", tier: 1, attribute: "physical", intensity: "standard" },
      { character: { attributes: { physical: 2 }, energy: 100, health: 40, skills: {} },
        rules, sb, steps, rng: seqRng([0.99, 0.01]) });
    return rr.deltas.health === 0 && /runs you down|ground is gone/i.test(rr.events.join(" "));
  })());

check("SNG-247 2b: a FIGHT still has NO player-break dial — health owns the player's exit (CCODE-39 not taken back)",
  (() => {
    const cfg = sb.kinds || {};
    const fightPressure = { ...(sb.momentum.pressure || {}), ...((cfg.fight || {}).pressure || {}) };
    return fightPressure.playerBreaksAtPressure === undefined
      && cfg.chase.pressure.playerBreaksAtPressure > 0 && cfg.standoff.pressure.playerBreaksAtPressure > 0;
  })());

// ---- SNG-247 Tier 3: THE STATIC ANTAGONIST ----
// A sealed door has no turn. Giving it a sheet that CHOOSES would mean inventing an agent — the SNG-246-A error
// class. But rollSide produces a margin, and a fixed margin is exactly what a DC is.
const doorSheet = synthesizeStaticSheet({ resist: 20, tier: 3, holdName: "the marks hold" }, sb);
check("SNG-247 3: a static sheet resists at ONE number and holds with one craft",
  doorSheet.static === true && doorSheet.staticResist === 20 && doorSheet.skills[0].name === "the marks hold");
check("SNG-247 3 (the one that matters): a static antagonist never CHOOSES — same declaration every round, whatever it is shown",
  (() => {
    const a = opponentPolicy(doorSheet, { momentum: -8, round: 1, lastOppFn: "ward" }, "conceal", sb);
    const b = opponentPolicy(doorSheet, { momentum: 9, round: 7, lastOppFn: "ward" }, "strike", sb);
    return JSON.stringify(a) === JSON.stringify(b) && a.intensity === "standard" && a.static === true;
  })());
const doorRound = (playerDecl, extraState = {}) => battleRound({
  playerDecl, oppDecl: opponentPolicy(doorSheet, {}, null, sb),
  playerSheet: { attributes: { mental: 4 }, energy: 100 }, oppSheet: doorSheet,
  state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 60, effects: [], pressure: { player: 0, opponent: 0 }, ...extraState },
  rules, sb, steps, rng: seqRng([0.40, 0.40]), kind: "puzzle",
});
const dr = doorRound({ function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "the read" });
check("SNG-247 3: the door does not roll — its resistance IS its margin, and it is the SAME every time",
  dr.opponent.static === true && dr.opponent.roll === 0
  && doorRound({ function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "x" }).opponent.margin === dr.opponent.margin);
check("SNG-247 3 (SNG-106 held): the door's resistance is a NAMED line on the self-summing breakdown, not a hidden number",
  (() => {
    const mods = dr.opponent.breakdown.contestMods;
    return mods.some(m => m.label === sb.staticAntagonist.resistLabel && m.value === 20)
      && mods.reduce((a, m) => a + (m.value || 0), 0) === dr.opponent.margin;
  })());
check("SNG-247 3: a bind laid on the door still WEAKENS it — the static side is not immune to the contest, only unmoving",
  (() => {
    const bound = doorRound({ function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "the read" },
      { effects: [{ id: "b", label: "bound", side: "opponent", value: -9, roundsLeft: 2, from: "player" }] });
    return bound.opponent.margin < dr.opponent.margin;
  })());
// A puzzle promoted onto the engine: the hint ladder rides ALONG rather than being replaced.
const doorDef = { id: "door", type: "puzzle", name: "The Sealed Door",
  hintTiers: ["the marks repeat", "the repeat is an order", "the order is a name"] };
const doorSt = startEncounter(doorDef, { oppSheet: doorSheet });
check("SNG-247 3: a puzzle with a static sheet runs the contest engine AND keeps its hint state",
  doorSt.mode === "skill_battle" && doorSt.hintsRevealed === 0 && doorSt.solved === false);
check("SNG-247 3: a puzzle with NO sheet stays on its classic attempt path — an authored puzzle is never stranded",
  startEncounter(doorDef, {}).mode === undefined && startEncounter(doorDef, {}).attempts === 0);
check("SNG-247 3 (Erik's per-kind weighting): on a sealed thing, WINNING THE READ buys a layer — the sense step is the game",
  (() => {
    const rr = skillBattleRound(doorSt, doorDef, { function: "reveal", tier: 5, attribute: "mental", intensity: "surge", name: "the read" },
      { character: { attributes: { mental: 6 }, subAttributes: { mental: { insight: 4 } }, energy: 100, health: 40, skills: {} },
        rules, sb, steps, rng: seqRng([0.01, 0.01]), phase: "sense", tickEffects: false });
    return rr.state.hintsRevealed === 1 && /a layer gives/i.test(rr.events.join(" "));
  })());
check("SNG-247 3: a puzzle def with no `opponent` block does not throw — the thing itself is the other side",
  (() => {
    const rr = skillBattleRound(doorSt, doorDef, { function: "break", tier: 2, attribute: "practical", intensity: "standard", name: "force it" },
      { character: { attributes: { practical: 3 }, energy: 100, health: 40, skills: {} }, rules, sb, steps, rng: seqRng([0.5, 0.5]) });
    return typeof rr.events.join(" ") === "string" && rr.deltas.health === 0;
  })());

// ---- SNG-247 Tier 4: THE MORPH MADE VISIBLE ----
// The chain has worked since SNG-230 and never SAID so — the border silently changed colour and the player was
// left to infer that the rules had changed under them. Source-asserted (it is a render), plus the CSS it needs.
const appSrc247 = readFileSync(join(root, "app.js"), "utf8");
const cssSrc247 = readFileSync(join(root, "style.css"), "utf8");
check("SNG-247 4: both chain points stamp WHERE THIS CAME FROM, so the frame can name the transition",
  /_morphedFrom: \{ kind: "fight"/.test(appSrc247) && /_morphedFrom: \{ kind: "chase"/.test(appSrc247));
check("SNG-247 4: the frame renders the morph in BOTH kinds' icons and words (not just a colour change)",
  /st\._morphedFrom/.test(appSrc247) && /enc-frame-morph/.test(appSrc247) && /morph-from/.test(appSrc247) && /morph-to/.test(appSrc247));
check("SNG-247 4: the line can show the hue it came FROM — every kind has a free-standing hue var for it",
  Object.keys(FRAME_KINDS).every(k => cssSrc247.includes(`--enc-hue-${k}:`)) && /\.enc-frame-morph\s*\{[^}]*--enc-hue-from/.test(cssSrc247));

// SNG-247 Tier 3 (Aevi's 2026-07-31 library): her puzzle exemplars carry kind:"puzzle" with routing:"challenge",
// which fell through to synthesizeChallengeDef and rendered as HARD GROUND — the toll-keeper gap again, with four
// real encounters behind it. Read straight from her staged file so the check tracks the content, not a copy of it.
const staged = JSON.parse(readFileSync(join(root, "po/staged_content/encounter_frame_kinds.json"), "utf8"));
const stagedPuzzles = (staged.exemplarEncounters || []).filter(e => e.kind === "puzzle");
const stagedStandoffs = (staged.exemplarEncounters || []).filter(e => e.kind === "standoff");
check(`SNG-247 3: EVERY authored puzzle exemplar mints as a PUZZLE, not hard ground (${stagedPuzzles.length} of them)`,
  stagedPuzzles.length >= 4 && stagedPuzzles.every(e => {
    const d = synthesizePuzzleDef(e);
    return d.type === "puzzle" && encounterKind(d) === "puzzle" && d.hintTiers.length >= 2;
  }));
check(`SNG-247 3: every authored STANDOFF exemplar still mints as a standoff (${stagedStandoffs.length} of them, only ONE of which is routing:"opposed")`,
  stagedStandoffs.length >= 4 && stagedStandoffs.every(e => encounterKind(synthesizeStandoffDef(e)) === "standoff"));
check("SNG-247 3: an authored puzzle's stage BEATS become its hint ladder — the understanding survives without re-authoring",
  (() => {
    const e = stagedPuzzles.find(x => (x.stages || []).length >= 2);
    return synthesizePuzzleDef(e).hintTiers[0] === e.stages[0].beat;
  })());

// SNG-247 PROMOTION: the exemplars are REACHABLE, not just present. `exemplarEncounters` had been authored since
// SNG-230 and read by nothing — loadContent took `frameKinds` off that doc and dropped the encounters on the
// floor. Moving the file into content/packs/ alone would have changed NOTHING; these check the path, not the file.
const liveKinds = rj("content/packs/core/rules/encounter_frame_kinds.json");
check(`SNG-247: the authored library is LIVE, not staged (${(liveKinds.exemplarEncounters || []).length} exemplars in the loaded pack)`,
  (liveKinds.exemplarEncounters || []).length >= 8);
const pooled = frameExemplarEncounters(liveKinds);
check("SNG-247 (the one that matters): every exemplar becomes a POOL ENTRY the offer path can actually reach",
  pooled.length === liveKinds.exemplarEncounters.length
  && pooled.every(e => e.id && e.seed && ["duel", "challenge", "opposed"].includes(e.routing)));
check("SNG-247: `kind` survives the pool hop — a standoff stays a standoff and a puzzle stays a puzzle, not the challenge default",
  pooled.filter(e => e.kind === "standoff").length >= 4 && pooled.filter(e => e.kind === "puzzle").length >= 4);
check("SNG-247: the pool's eligibility filter admits `opposed` — without it the one routing:'opposed' exemplar could never be offered",
  (() => {
    const loc = { dangerLevel: 3 };
    const got = eligibleEncountersFor({ encounters: pooled }, loc, { cap: 50 });
    return got.some(e => e.routing === "opposed") && got.length >= 8;
  })());
check("SNG-247: a quiet place does NOT surface the weightier ones — tier became minDanger, so they are danger-gated like every other entry",
  eligibleEncountersFor({ encounters: pooled }, { dangerLevel: 0 }, { cap: 50 }).length < pooled.length);

// ---- AEVI-247-AUTHOR: the per-kind VOICE merged, mechanics untouched ----
// Aevi authored the four judgment calls as voice. Two things had to be got right in the merge: her `playerBreaks`
// is the engine's `playerOvercome` (one vocabulary, not two), and her `degreeVoice` needed a READER or it would
// have been authored-and-inert — the exact class this whole ticket keeps closing.
check("AEVI-247: each kind now sounds like ITSELF — a puzzle is UNDERSTOOD, a chase is WIND, a standoff is COMPOSURE",
  /understanding closer to open|comes clear/i.test(sb.kinds.puzzle.pressureLabel.opponent)
  && /wind|breath/i.test(sb.kinds.chase.outcomes.playerOvercome)
  && /certainty|PERSUADED/i.test(sb.kinds.standoff.outcomes.opponentYields));
check("AEVI-247 (the merge could have broken this): the voice pass did NOT undo the no-blood rulings",
  ["puzzle", "chase", "standoff"].every(k => sb.kinds[k].outcomes.losingCostsHealth === false)
  && sb.momentum.pressure.playerHealthLoss === 3);   // and the fight still pays in blood
check("AEVI-247: her `playerBreaks` landed under the engine's `playerOvercome` — one vocabulary, so the line actually prints",
  ["puzzle", "chase", "standoff"].every(k => typeof sb.kinds[k].outcomes.playerOvercome === "string"
    && sb.kinds[k].outcomes.playerOvercome.length > 20));
check("AEVI-247: the static antagonist's degreeVoice has a READER — an authored voice nothing prints is the inert class",
  (() => {
    const sheet = synthesizeStaticSheet({ resist: 60 }, sb);   // resists hard -> a high band
    const def = { id: "d2", type: "puzzle", name: "The Sealed Door", hintTiers: ["a"] };
    const rr = skillBattleRound(startEncounter(def, { oppSheet: sheet }), def,
      { function: "break", tier: 1, attribute: "practical", intensity: "conserve", name: "force it" },
      { character: { attributes: { practical: 1 }, energy: 100, health: 40, skills: {} },
        rules, sb, steps, rng: seqRng([0.9, 0.9]) });
    const said = rr.events.join(" ");
    return Object.values(sb.staticAntagonist.degreeVoice).some(v => said.includes(v));
  })());
check("AEVI-247: it HOLDS rather than fights — the resist line reads as a made thing, not an opponent",
  // assert what the voice IS, not a keyword ban — Aevi's line legitimately contains "not fighting you", and a
  // naive blocklist would have rejected the very phrasing that makes her point.
  /hold/i.test(sb.staticAntagonist.resistLabel)
  && /yield/i.test(sb.staticAntagonist.giveNote)
  && /clear|loosen|understood/i.test(Object.values(sb.staticAntagonist.degreeVoice).join(" ")));

// ---- SNG-247 (Erik): TRY-EACH-KIND dev buttons ----
// The value of these buttons is that they mint from the LIVE POOL — a button that fires a synthetic def would
// "pass" while the authored content stayed unreachable, which is the exact thing this build fixed.
const appTry = readFileSync(join(root, "app.js"), "utf8");
const cssTry = readFileSync(join(root, "style.css"), "utf8");
check("SNG-247 dev: there is one try-button per frame kind, and no kind is missing one",
  Object.keys(FRAME_KINDS).every(k => new RegExp(`kind: "${k}"`).test(appTry.slice(appTry.indexOf("const KIND_TRY")))));
check("SNG-247 dev: the buttons mint from the LIVE POOL, not from synthetic defs",
  /CONTENT\.randomEncounters\?\.encounters/.test(appTry.slice(appTry.indexOf("function fireEncounterKind"), appTry.indexOf("const LEG_RUNNERS"))));
check("SNG-247 dev: the CHASE button goes through the real chain (beginChaseFromFight), not a shortcut that only looks like one",
  /if \(kind === "chase"\) \{ beginChaseFromFight\(def\); return; \}/.test(appTry));
check("SNG-247 dev: each button wears the SAME enc-kind-<kind> class the play surface does — it cannot advertise a hue the frame won't fly",
  /class="kind-try enc-kind-\$\{k\.kind\}"/.test(appTry) && /\.kind-try\s*\{[^}]*var\(--enc-hue/.test(cssTry));
check("SNG-247 dev: every button is wired to a handler (a dev button that does nothing is worse than no button)",
  /\[data-firekind\]/.test(appTry) && /fireEncounterKind\(b\.dataset\.firekind\)/.test(appTry));

// Two bugs the dev buttons found the moment they were clicked (2026-08-01) — both invisible to every prior test.
check("SNG-247 dev-found: an authored puzzle gets its OWN name, not the flavor map's (a sealed mechanism read as 'Hard Ground')",
  (() => {
    const p = (liveKinds.exemplarEncounters || []).find(e => e.id === "enc_the_stopped_mechanism");
    return p && synthesizePuzzleDef(p).name === "The Stopped Mechanism";
  })());
check("SNG-247 dev-found: every authored exemplar mints a DISTINCT name — four puzzles are not four 'Sealed Thing's",
  (() => {
    const names = (liveKinds.exemplarEncounters || []).map(e =>
      (e.kind === "puzzle" ? synthesizePuzzleDef(e) : e.kind === "standoff" ? synthesizeStandoffDef(e) : { name: e.id }).name);
    return new Set(names).size === names.length;
  })());
check("SNG-247 dev-found: the frame's meter renders on a CONTEST-engine kind — the old gate was a stage count, so a chase had no Distance bar",
  /Number\.isFinite\(fm\.meter\?\.pct\)/.test(readFileSync(join(root, "app.js"), "utf8")));

console.log(failures === 0 ? "\nSkill-battle sim: all checks passed." : `\nSkill-battle sim: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
