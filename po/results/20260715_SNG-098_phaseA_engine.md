# Results — SNG-098 Phase A: Skill-battle engine core

Date: 2026-07-15 · HEAD `4e99b07` · **v1.8.75** · `npm test` green (incl. new sim) · browser-runtime verified. Status: **Phase A shipped, complete_pending_review. Phases B (encounters routing) + C (duel UI) remain.**

Built in the exact order my ROUND-2 review set — **engine + sim green before the UI** — because the review flagged the app.js duel-flow rewrite as the largest, riskiest single piece (it touches the live combat path). Phase A is the tested foundation everything else stands on; it changes no player-facing behavior yet (encounters.js still uses the single-margins resolver), so it carries zero live-play risk.

## What shipped (the tested engine core)
- **`engine/skill_battle.js` (new)** — the pure, deterministic two-sided resolver:
  - `matchupBonus(atkFn, defFn, sb)` — structured function-vs-function edges (reveal beats conceal +2; a shield **blunts** a strike to [0, cap], never penalizes or hands the round away). Reads NUMBERS from content, never prose (the §7b lesson).
  - `synthesizeOpponentSheet(opponent, sb)` — a duel opponent carries `threat` + `tacticTags` but no skills; synthesize a modest sheet (threat→attribute+tier, tacticTags→archetype skills + energy). An authored `opponent.skills[]` overrides.
  - `opponentPolicy(sheet, state, seenPlayerTendency, sb)` — **deterministic** (not GM invention): behind on momentum → Surge, ahead → Conserve, tacticTags bias, picks the skill that matches up best vs the player's shown tendency, attrition-aware (a near-empty pool can't Surge).
  - `battleRound(...)` — both sides roll via `resolve.js successChance` (SNG-106 rails), compare margins, shift the **bidirectional momentum meter**, pay energy (attrition is the second win condition), resolve at meter-end / a crushing blow / exhaustion.
- **`engine/sense.js senseOpponent(viewer, oppRound, rules, sb, opts)`** — the fog gate. `senseTier` is a function of the VIEWER (attunement + Strategist-on-scout + a bought tier from a "read them" action), so it points at the adversary unchanged. Returns exactly the slice the tier earns: tier 0 outcome-only → tier 3 the full SNG-106 breakdown ("see the enemy's math"). **Never fabricates a number** — shows less, never false.
- **`content/.../skill_battle_system.json`** — amended with a structured `engine{}` layer (matchup table, momentum params, opponentPolicy thresholds, `senseVisibility` tier table, opponent-sheet synthesis). The authored prose design is untouched (it stays the record); the `engine{}` block is what executes.
- **`engine/resolve.js`** — `contestMods`: matchup + intensity enter `successChance` as their own honest, self-summing named lines (so the tier-3 fog view shows the opponent's real math). Additive; absent outside a skill battle.
- **`engine/state.js`** — loads `skill_battle_system` into `CONTENT.skillBattle`.
- **`tests/skill_battle_sim.mjs` (new, in `npm test`)** — 26 checks: matchup edges, synthesis, deterministic policy (behind→Surge / ahead→pace / best-matchup pick / attrition), a full round (both rolls, self-summing breakdowns, momentum, attrition), and the load-bearing **fog invariant** — tier 0 has NO number, tier 3 has the full breakdown, and **the engine's true opponent receipt is byte-identical across viewer tiers** (fog is presentation-only, never mutates state; never numeric at low tiers).

## Verification
- `npm test` green (smoke + content CI + parse probe + balance sim + **skill-battle sim**).
- **Browser-runtime, through the actually-loaded CONTENT:** `CONTENT.skillBattle` wired; a threat-35 berserker synthesized (strike/break, energy 82); `opponentPolicy` → Surge; a round resolved with the player taking momentum to +10; the opponent breakdown self-sums (SNG-106); fog tier 0 = `{outcome}` with no numeric field, tier 3 = full reveal incl. breakdown.

## ROUND-2 answers (from `po/SPEC_SNG-098_CCODE_REVIEW.md`, all honored)
- **Q1** — synthesize the opponent sheet from threat/tacticTags now; accept an authored `opponent.skills[]` override. ✅ (`synthesizeOpponentSheet`).
- **Q2** — `senseTier` composes cleanly against the opponent because it's viewer-indexed; `senseOpponent` is a thin wrapper. ✅
- **Q3** — momentum is net-new bidirectional state; `opponentHealth`/lifecycle untouched. ✅ (returned in `battleRound`'s state; encounter lifecycle not yet wired — Phase B).

## What remains — Phases B & C (flagged, not built)
- **Phase B — `engine/encounters.js` routing:** when an encounter is skill-battle-typed, hand the round to `skill_battle.js` instead of the single-margins resolver; generate the opponent sheet at spawn (via `synthesizeOpponentSheet`), add optional authored `opponent.skills[]` to `sanitizeNewEncounter` + the GM `newEncounter` schema. Encounter lifecycle (offer/flee/yield/health/lethal) unchanged.
- **Phase C — `app.js` duel UI (the largest piece):** the skill+intensity declaration picker; the momentum meter; the **fog-gated opponent panel** rendering `senseOpponent().revealed` per tier (reuse SNG-106's `showBreakdownPopover` for the tier-3 opponent-math view); a "read them" action that buys a tier. This replaces the current single-choice duel branch and is the main wall-clock cost.
- **PvP** stays a flagged follow-on: the engine is already two-sided/symmetric — replace `opponentPolicy` with the other player's declaration.

## Files
`engine/skill_battle.js` (new) · `engine/sense.js` · `engine/resolve.js` · `engine/state.js` · `content/packs/core/rules/skill_battle_system.json` · `tests/skill_battle_sim.mjs` (new) · `package.json` · `index.html`.
