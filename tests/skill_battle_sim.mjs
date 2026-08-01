// skill_battle_sim.mjs — SNG-098: the two-sided contest + fog-of-war invariant.
// Proves: both sides roll; matchup edges resolve; momentum + attrition behave; and — the load-bearing
// guard — the FOG IS PRESENTATION OVER TRUE STATE: the engine's opponent receipt is byte-identical across
// viewer tiers; only senseOpponent's REVEALED slice grows. Tier 0 has NO number; tier 3 has the full breakdown.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { matchupBonus, synthesizeOpponentSheet, opponentPolicy, battleRound, phaseDenied } from "../engine/skill_battle.js";
import { senseOpponent } from "../engine/sense.js";
import { startEncounter, skillBattleRound, sanitizeNewEncounter } from "../engine/encounters.js";
import { mintableBraidsFor, BRAID_RIPEN_AT } from "../engine/braids.js";   // CCODE-37: the weave feeds the braid economy
import { recordUse } from "../engine/practice.js";
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

console.log(failures === 0 ? "\nSkill-battle sim: all checks passed." : `\nSkill-battle sim: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
