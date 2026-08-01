// contest_sim.mjs — THE CONTEST AUDITOR: distributional truth about the round engine.
//
// WHY. On 2026-08-01 Erik found, in live play, that every round of every fight reported "neither gains —
// it's even" — including a roll of 1/95 (margin 102) against a margin of 25. Nothing caught it, and nothing
// COULD: each round looked perfectly plausible on its own, and only the DISTRIBUTION was absurd. A unit test
// asserts one case; this asserts what must be true across thousands.
//
// That is the niche. `skill_battle_sim` checks the mechanics resolve; `balance_sim` checks the anchors hold;
// this checks the engine's OUTPUT DISTRIBUTION is sane and — the part that was missing entirely — that the
// RECEIPT the player and the GM read actually describes it. Both of the bugs Erik reported by hand that day
// were distributional, and both are now assertions here.
//
// The discipline is the playthrough-sim's (SNG-236): drive the REAL leaf functions, never a reimplementation
// — a reimpl would report a healthy spread while the real path emits a flat lie, which is precisely the
// failure being guarded. Seeded and deterministic, so a red run reproduces exactly.
//
// Run: node tests/contest_sim.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound, opponentPolicy, synthesizeOpponentSheet } from "../engine/skill_battle.js";
import { receiptLine, roundVerdict } from "../engine/roundreceipt.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const rules = rj("content/packs/core/rules/resolution.json");
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;

/** Seeded RNG so a failure reproduces exactly (the playthrough-sim's mulberry32). */
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- the cast: a player kit spanning the function families, across threat bands ----------
const PLAYER_MOVES = [
  { id: "p_strike", name: "Hunter's Strike", function: "strike", tier: 1, attribute: "physical", energyCost: 4, intensity: "standard" },
  { id: "p_read",   name: "Prism Sight",     function: "reveal", tier: 2, attribute: "mental",   energyCost: 3, intensity: "standard" },
  { id: "p_guard",  name: "Raise a guard",   function: "shield", tier: 1, attribute: "physical", energyCost: 2, intensity: "standard" },
  { id: "p_bind",   name: "Sonic Resonance", function: "bind",   tier: 1, attribute: "social",   energyCost: 6, intensity: "standard" },
  { id: "p_mend",   name: "The Better Story", function: "mend",  tier: 2, attribute: "social",   energyCost: 1, intensity: "standard" }
];
const THREAT_BANDS = [{ name: "riffraff", threat: 22 }, { name: "notable", threat: 38 }, { name: "regional", threat: 55 }, { name: "epic", threat: 78 }];
const playerSheet = (level = 5) => ({
  name: "the player", level,
  attributes: { physical: 4, mental: 4, social: 4, practical: 4 },
  subAttributes: { strength: 4, agility: 4, reason: 4, insight: 4, presence: 4, rapport: 4, craft: 4, wits: 4 },
  energy: 120, health: 50, maxHealth: 50
});

/** Fight one contest to resolution (or the cap) with the REAL engine, collecting per-round telemetry —
 *  including the receipt line the player would actually have read. */
function oneFight(threat, rng, { maxRounds = 40 } = {}) {
  const oppSheet = synthesizeOpponentSheet({ name: "them", threat }, sb);
  const def = { name: "a contest", type: "duel", opponent: { name: "them", health: 6, threat, yieldAt: 1 } };
  let state = { round: 1, momentum: 0, playerEnergy: 120, opponentEnergy: oppSheet.energy, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 6 };
  // THE PLAYER'S HEALTH IS THE CALLER'S TO APPLY. battleRound reports the player's damage and never writes it
  // ("the PLAYER's health is the app's to apply — checkIncapacitation owns that exit"), so a harness that
  // forgets to apply it simulates an IMMORTAL player. The first run of this sim did exactly that and reported
  // a 100% win rate at three of four threat bands — the sim's own bug, caught by its own assertion, which is
  // the argument for having the assertion. Mirrored from encounters.js: a pressure event on the player costs
  // health, and a landed harm move costs `damage.amount`.
  const cfg = sb.momentum?.pressure || {};
  let playerHealth = playerSheet().health;
  const rounds = [];
  for (let i = 0; i < maxRounds; i++) {
    const decl = { ...PLAYER_MOVES[Math.floor(rng() * PLAYER_MOVES.length)] };
    const oppDecl = opponentPolicy(oppSheet, state, null, sb);
    const before = state.momentum;
    let rr;
    try {
      rr = battleRound({ state, playerSheet: { ...playerSheet(), health: playerHealth }, oppSheet, playerDecl: decl, oppDecl, sb, steps, rules, rng, phase: "action", tickEffects: true });
    } catch (e) { return { rounds, error: e.message }; }
    if (rr.damage?.side === "player") playerHealth -= rr.damage.amount || 0;
    if (rr.pressureEvent?.side === "player") playerHealth -= rr.pressureEvent.healthLoss ?? cfg.playerHealthLoss ?? 3;
    const after = rr.state?.momentum ?? before;
    const line = receiptLine({ rr: { ...rr, oppDecl }, playerDecl: decl, beforeMom: before, meterWord: "momentum", meterMax: sb.momentum?.meterMax ?? 16 });
    const downed = playerHealth <= 0;   // the player's real exit (checkIncapacitation's, mirrored)
    // The verdict is read BACK OUT OF THE EMITTED LINE, not recomputed from roundVerdict. Recomputing tests
    // the helper; the bug was in what the line SAID. Verified by re-introducing the real regression: with the
    // verdict recomputed, only the anti-theater fixture caught it and 2700 sampled rounds sailed through.
    // Assert on the artifact the player actually reads.
    const said = /neither gains/.test(line) ? "even" : /you take the exchange/.test(line) ? "player" : /they take the exchange/.test(line) ? "opponent" : "?";
    rounds.push({ before, after, verdict: said, engineVerdict: roundVerdict(before, after).verdict, roundWinner: rr.roundWinner, line,
      resolved: downed ? "opponent" : rr.resolved, pressure: { ...rr.pressure }, opponentHealth: rr.opponentHealth, playerHealth });
    state = rr.state;
    if (rr.resolved || downed) break;
  }
  return { rounds, resolvedBy: rounds[rounds.length - 1]?.resolved || null };
}

console.log("CONTEST SIM — distributional truth about the round engine\n");

// ---------- 1. THE RECEIPT MUST DESCRIBE THE ROUND (Erik's bug, as a standing assertion) ----------
// The single highest-value check in this file. A decisive round reported as "even" is the exact lie that
// shipped, and it is invisible to any single-case test.
{
  const all = [];
  for (const band of THREAT_BANDS) for (let i = 0; i < 60; i++) all.push(...oneFight(band.threat, mulberry32(0xC0FFEE ^ (band.threat * 977) ^ i)).rounds);
  const even = all.filter(r => r.verdict === "even").length;
  const decisive = all.filter(r => r.roundWinner && Math.abs(r.after - r.before) > 0.5).length;
  check(`the receipt is not flat: across ${all.length} rounds, "neither gains" is under 60% (got ${pct(even, all.length)}%)`,
    pct(even, all.length) < 60,
    "every round reporting 'even' is the 2026-08-01 bug — swing pinned to zero, the receipt lying about every fight");
  check(`a round the ENGINE says was won is reported as won, never as "even" (${decisive} decisive rounds)`,
    all.every(r => !(r.roundWinner && Math.abs(r.after - r.before) > 0.5 && r.verdict === "even")),
    "a round with a winner AND real meter movement printed 'neither gains' — the receipt contradicts the engine");
  // The receipt and the engine must agree on EVERY round. This is the check that would have caught the live
  // bug on its own, because it compares what was PRINTED against what the meter actually did.
  const disagree = all.filter(r => r.verdict !== r.engineVerdict);
  check(`the printed verdict matches the engine's on every round (${disagree.length} disagreements of ${all.length})`,
    disagree.length === 0,
    disagree.length ? `e.g. engine says "${disagree[0].engineVerdict}" (${disagree[0].before}→${disagree[0].after}), the line says "${disagree[0].verdict}": ${disagree[0].line}` : "");
  // A SMALL decisive swing can legitimately print X→X, because the meter text is Math.round-ed: 3.6→4.1 is a
  // real 0.5 swing that displays as "4→4". That is a rounding artifact, not a lie, so the assertion is scoped
  // to swings big enough that identical endpoints would be genuinely wrong. (The display nit is real and worth
  // a decision — sub-integer movement is invisible — but it is not the bug this file guards.)
  const bigSwing = all.filter(r => Math.abs(r.after - r.before) > 1.5);
  check(`a LARGE swing never prints identical endpoints (${bigSwing.length} rounds swung >1.5)`,
    bigSwing.every(r => !/momentum (-?\d+)→\1(?!\d)/.test(r.line)),
    "printed X→X while the meter moved more than a rounding step — the receipt contradicts the engine");
  // Both directions must occur, or the verdict is stuck on one answer.
  const wins = all.filter(r => r.verdict === "player").length, losses = all.filter(r => r.verdict === "opponent").length;
  check(`both sides win rounds (player ${pct(wins, all.length)}% / opponent ${pct(losses, all.length)}%) — the verdict is not stuck`,
    wins > 0 && losses > 0);
}

// ---------- 2. FIGHTS RESOLVE, AND BY THE MEANS THE DESIGN INTENDS ----------
// CCODE-38 took the exit away from momentum deliberately. If fights start ending on the meter again, or stop
// ending at all, that is a silent regression of a decision Erik made from measured data.
{
  const outcomes = { pressure: 0, health: 0, unresolved: 0 }, lengths = [];
  for (const band of THREAT_BANDS) for (let i = 0; i < 80; i++) {
    const f = oneFight(band.threat, mulberry32(0xBEEF ^ (band.threat * 31) ^ i));
    const last = f.rounds[f.rounds.length - 1];
    if (!last?.resolved) outcomes.unresolved++;
    else { lengths.push(f.rounds.length); (last.opponentHealth <= 0 ? outcomes.health++ : outcomes.pressure++); }
  }
  const total = outcomes.pressure + outcomes.health + outcomes.unresolved;
  const med = lengths.slice().sort((a, b) => a - b)[Math.floor(lengths.length / 2)];
  check(`fights RESOLVE — under 10% run past ${40} rounds (got ${pct(outcomes.unresolved, total)}%)`,
    pct(outcomes.unresolved, total) < 10, "a contest that cannot end is the CCODE-38 stall returning");
  check(`a fight is not over in one round — median length is 2+ rounds (got ${med})`, med >= 2);
  check(`both exits are reachable — pressure-break ${outcomes.pressure} and health-zero ${outcomes.health} both occur`,
    outcomes.pressure > 0 && outcomes.health > 0,
    "one exit is unreachable; the fight has only one way to end and the other path is dead");
}

// ---------- 3. THREAT MEANS SOMETHING (the CCODE-52 uncapped curve, still monotone) ----------
{
  const winRate = band => {
    let won = 0, n = 60;
    for (let i = 0; i < n; i++) {
      const f = oneFight(band.threat, mulberry32(0xD00D ^ (band.threat * 7919) ^ i));
      const last = f.rounds[f.rounds.length - 1];
      if (last?.resolved === "player") won++;
    }
    return pct(won, n);
  };
  const rates = THREAT_BANDS.map(b => ({ band: b.name, rate: winRate(b) }));
  console.log("      player win-rate by threat band: " + rates.map(r => `${r.band} ${r.rate}%`).join(" · "));
  // The player sheet here is SYNTHETIC (a level-5 kit invented for the harness), so its ABSOLUTE win rates are
  // not a balance claim and must not be asserted as one — a level-5 character beating riffraff every time is
  // correct design, not a bug. What IS invariant regardless of the sheet: threat must be monotone (a harder
  // foe is never easier) and the top of the curve must stay genuinely uncertain rather than becoming a wall
  // or a formality. Those hold for any sheet; the percentages are printed as an observation, not a gate.
  check("threat is MONOTONE — no band is easier than a band below it (CCODE-52's uncapped curve still bites)",
    rates.every((r, i) => i === 0 || r.rate <= rates[i - 1].rate + 0.1),
    `${rates.map(r => `${r.band} ${r.rate}%`).join(" · ")} — threat is inverted or inert somewhere on the curve`);
  check(`the hardest band stays a real contest — neither a formality nor a wall (epic ${rates[3].rate}%)`,
    rates[3].rate > 5 && rates[3].rate < 95,
    "the top of the curve is decided before it is played — either unloseable or unwinnable");
}

// ---------- 4. ANTI-THEATER — the suite must be able to go RED (the SNG-232 discipline) ----------
// A green sim that cannot fail proves nothing. Reproduce Erik's exact bug by feeding the receipt the AFTER
// momentum as its BEFORE, and confirm the flat-receipt check above would have caught it.
{
  const rr = { state: { momentum: 9.5 }, oppDecl: { function: "strike", name: "a hard strike" }, deltas: { energy: -5 }, landed: [] };
  const decl = { name: "Hunter's Strike", function: "strike" };
  const honest = receiptLine({ rr, playerDecl: decl, beforeMom: 0 });
  const bugged = receiptLine({ rr, playerDecl: decl, beforeMom: rr.state.momentum });   // the shipped bug, exactly
  check("ANTI-THEATER: the honest call reports a decisive round as decisive",
    /you take the exchange/.test(honest) && /momentum 0→10/.test(honest), honest);
  check("ANTI-THEATER: feeding AFTER as BEFORE reproduces the live bug — 'neither gains' with a flat meter",
    /neither gains — it's even/.test(bugged) && /momentum 10→10/.test(bugged),
    "the bug can no longer be reproduced, so these checks are no longer guarding anything");
  check("ANTI-THEATER: roundVerdict's deadband holds — a hair of drift is not an exchange",
    roundVerdict(0, 0.4).verdict === "even" && roundVerdict(0, 0.6).verdict === "player" && roundVerdict(0, -0.6).verdict === "opponent");
}

console.log(failures === 0 ? "\nContest sim: all checks passed." : `\nContest sim: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
