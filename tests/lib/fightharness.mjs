// fightharness.mjs — ONE simulated fight loop, shared by every contest simulation.
//
// Extracted so `contest_sim` (does a round report itself truthfully?) and `tradition_matrix` (which kits
// perform, and where?) drive the SAME loop. Two copies of a fight harness would drift, and a drifted
// harness produces confident numbers about a fight the game does not actually run — which is the exact
// class of error these sims exist to catch.
//
// THE THING MOST EASILY GOT WRONG, and the reason this is a module rather than a snippet: battleRound
// REPORTS the player's damage and deliberately does not apply it ("the PLAYER's health is the app's to
// apply — checkIncapacitation owns that exit"). A harness that forgets simulates an IMMORTAL player. The
// first draft of contest_sim did exactly that and reported a 100% win rate at three of four threat bands.
// Applying it is mirrored from encounters.js and lives here once.

import { battleRound, opponentPolicy, synthesizeOpponentSheet } from "../../engine/skill_battle.js";
import { receiptLine, roundVerdict } from "../../engine/roundreceipt.js";

/** Seeded RNG — a red run must reproduce exactly. */
export function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Fight one contest to resolution (or the round cap) with the REAL engine.
 *
 *  `moves` is the player's kit — real ability records. `sheet` is their character sheet. Returns the
 *  per-round trail INCLUDING the receipt line the player would have read, so a caller can assert on the
 *  artifact rather than on a recomputation of it. */
export function oneFight({ threat, moves, sheet, sb, steps, rules, rng, maxRounds = 40, oppHealth = 6 }) {
  const oppSheet = synthesizeOpponentSheet({ name: "them", threat }, sb);
  const cfg = sb.momentum?.pressure || {};
  let state = { round: 1, momentum: 0, playerEnergy: sheet.energy, opponentEnergy: oppSheet.energy,
    effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: oppHealth };
  let playerHealth = sheet.health;
  const rounds = [];
  for (let i = 0; i < maxRounds; i++) {
    if (!moves.length) break;
    const decl = { ...moves[Math.floor(rng() * moves.length)] };
    const oppDecl = opponentPolicy(oppSheet, state, null, sb);
    const before = state.momentum;
    let rr;
    try {
      rr = battleRound({ state, playerSheet: { ...sheet, health: playerHealth }, oppSheet, playerDecl: decl, oppDecl,
        sb, steps, rules, rng, phase: "action", tickEffects: true });
    } catch (e) { return { rounds, error: e.message }; }
    // The player's health is the CALLER's to apply — see the header. Mirrored from encounters.js.
    if (rr.damage?.side === "player") playerHealth -= rr.damage.amount || 0;
    if (rr.pressureEvent?.side === "player") playerHealth -= rr.pressureEvent.healthLoss ?? cfg.playerHealthLoss ?? 3;
    const after = rr.state?.momentum ?? before;
    const line = receiptLine({ rr: { ...rr, oppDecl }, playerDecl: decl, beforeMom: before,
      meterWord: "momentum", meterMax: sb.momentum?.meterMax ?? 16 });
    // The verdict is read BACK OUT of the emitted line, never recomputed — recomputing tests the helper,
    // and the bug this stack exists for was in what the line SAID.
    const said = /neither gains/.test(line) ? "even" : /you take the exchange/.test(line) ? "player"
      : /they take the exchange/.test(line) ? "opponent" : "?";
    const downed = playerHealth <= 0;
    rounds.push({ before, after, verdict: said, engineVerdict: roundVerdict(before, after).verdict,
      roundWinner: rr.roundWinner, line, resolved: downed ? "opponent" : rr.resolved,
      pressure: { ...rr.pressure }, opponentHealth: rr.opponentHealth, playerHealth });
    state = rr.state;
    if (rr.resolved || downed) break;
  }
  const last = rounds[rounds.length - 1];
  return { rounds, resolvedBy: last?.resolved || null, won: last?.resolved === "player", playerHealth };
}
