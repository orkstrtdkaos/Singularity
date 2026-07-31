# CCODE-45 — The Turn is playable: stepped selection, two GM calls, the measured dial, and CCODE-44 rebuilt

**CCode · 2026-07-31 · v1.8.307 (`b2fa0a29`) + v1.8.310 (`0036d023`) · npm test exit 0 (all gates, rawProseCaps 63, 19 seams) · live-verified end to end.**

Erik: *"do all of this."* All four items shipped.

---

## 1. The bonus-step dial — measured, and my guess was wrong

I proposed **crit-only** in the CCODE-45 spec and flagged it as needing simulation. The simulation overturned it.
1200 fights per config on the real turn shape, threat-60 peer:

| threshold | median | p90 | player wins | down | **unresolved** |
|---|---|---|---|---|---|
| crit only | 21 turns | 30 | 71% | 8% | **20%** |
| **crit + success** | **13 turns** | 21 | 82% | 18% | **0%** |
| crit + success + partial | 12 turns | 20 | 82% | 18% | 0% |

**Crit-only left one in five peer fights unresolved at 30 turns** — too stingy to close a fight. Set to
**crit + success**.

The sim also answered the design's central question — *does sensing actually pay?*

| | median | player wins |
|---|---|---|
| senses every turn | 20 turns | **71%** |
| never senses | 28 turns | **53%** |

Sensing lifts the peer win-rate 53% → 71%. **The sense step earns its place**, which is the whole premise.

## 2. The Turn is playable

```
SENSE (optional) → [Proceed] → GM CALL #1 narrates the read → THE STEP LOCKS
  → ACTION → [BONUS if the read earned it] → REVIEW (Edit / Execute)
  → Execute resolves → GM CALL #2 narrates the whole turn → next turn
```

Each step is a **selection** step, per Erik: *"The action selections need to be just that."* Pick a craft; pick a
**second and they braid**. That replaces the ⋈ arm-then-pick gesture he called unintuitive — identical mechanics
(both effects land, both cost, co-activation recorded), with none of the modality. **Every step has its own
free-text field**, which rides into that step's GM prompt.

Edit returns you to the **action**, never to the sense — it has already been narrated.

## 3. CCODE-44 rebuilt
The pre-fight appraisal I wrongly reverted earlier today. It was never broken. Restored and verified live:
*"serious threat · Their craft a match for you · Their physical prowess beneath you · They are out to hurt you ·
An even contest."*

---

## Two real bugs the live walkthrough caught that the tests did not

**(a) The seam, again.** `skillBattleRound` hand-builds its `battleRound` call, so it **silently dropped**
`phase` / `tickEffects` / `setupBonus`. The **sense step ran as a full action round** — moving momentum, advancing
the round, costing the exchange. It defeated the entire point of the phase, and reported `setupBonus: 0` with no
error. This is the **second time this wrapper has eaten an option** (CCODE-35 was `effects`), so it is now a
**declared seam** — `seam_battle_round_options` (19 total) plus 3 sim checks.

**(b) Write-through.** `activeEnc()` returns a **fresh wrapper object every call**, so `enc.state = rr.state`
assigned to a throwaway and the turn's entire resolved state — effects, energy, pressure — was **discarded**.
`sbDeclare` had always done this correctly (`character.activeEncounter = {...}`); my new code did not. Fixed in
five sites.

**Neither was reachable from a unit test** — the first needed the real wrapper, the second the real character
object. This is exactly why the live walkthrough is not optional, and it is the discipline I committed to after
today's earlier miss.

## Live verification (never-used ports 8412 / 8415, a full turn walked)
- **Sense**: costs its craft (100→95e) but **round stays 1 and momentum stays 0** — *sensing is no longer a free
  hit for them*. `setupBonus +5`, `bonusEarned true` → the **✦ Bonus** step appears; tracker reads **"◎ Sense • locked"**.
- **Braid**: two crafts select as **1 / 2** with *"⋈ braided — both crafts, both effects, both costs."*
- **Review**: the whole turn laid out, Execute + Edit both present.
- **Execute**: energy 95→85, hp 30→27, momentum 0→−3.5, **effects tick ONCE across the turn** (2r→1r), practice
  recorded (`prism_sight 8, sonic_resonance 1`), turn resets to `sense`. Fight continues. **No console errors.**

## Files
- `app.js` — `SB_STEPS`, `sbTurn`/`sbFreshTurn`/`sbDeclFromSel`/`sbStepTracker`/`sbReviewCard`, the selection chip,
  the stepped panel, `sbResolveSense` (GM #1), `sbExecuteTurn` (GM #2), the write-through fix, `appraiseOpponent` wiring.
- `engine/encounters.js` — accept + forward `phase`/`tickEffects`/`setupBonus`; sense doesn't advance the round.
- `engine/sense.js` — `appraiseOpponent` / `dispositionOf`.
- `content/.../skill_battle_system.json` — `turn` dials (bonus threshold measured), `appraisal`.
- `style.css` · `tests/skill_battle_sim.mjs` (+3 seam checks) · `tests/seams.json` (19).

## Open / next
- **CCODE-42** — Finish-it gated on a finishing-potential craft with honest situational odds (Cut the Thread as an
  opposed roll: near-certain vs a run-down foe when you hold momentum). Unbuilt.
- **CCODE-43** — items in combat (dagger vs axe, metal vs energy shield, throw a chemical, drink a potion). Unbuilt,
  independent, and the honest answer to being spent.
- **Erik's dials:** `turn.setupBonusScale` / `setupBonusMax` / `bonusOnDegrees`, `weave.energyMultiplier`,
  `momentum.pressure.breakAtPressure`.
- **Minor, flagged:** the action and bonus steps each advance the round counter, so "round" now counts *steps*, not
  turns. Harmless today (nothing player-facing keys off it), but if you want round == turn, say so and I'll change it.

*— CCode. The turn is a turn now: you read, you see what the read bought, you commit, and the GM tells the whole of
it. status: complete_pending_review.*
