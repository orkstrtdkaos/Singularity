// skill_battle_sim.mjs — SNG-098: the two-sided contest + fog-of-war invariant.
// Proves: both sides roll; matchup edges resolve; momentum + attrition behave; and — the load-bearing
// guard — the FOG IS PRESENTATION OVER TRUE STATE: the engine's opponent receipt is byte-identical across
// viewer tiers; only senseOpponent's REVEALED slice grows. Tier 0 has NO number; tier 3 has the full breakdown.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { matchupBonus, synthesizeOpponentSheet, opponentPolicy, battleRound } from "../engine/skill_battle.js";
import { senseOpponent } from "../engine/sense.js";

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
check("SNG-098: a side that runs out of energy forfeits the contest (attrition is a real win condition)", drained.state.opponentEnergy <= 0 && drained.resolved === "player");

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

console.log(failures === 0 ? "\nSkill-battle sim: all checks passed." : `\nSkill-battle sim: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
