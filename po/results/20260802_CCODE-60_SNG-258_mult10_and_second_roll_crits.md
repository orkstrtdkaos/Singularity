# CCODE-60 — SNG-258 §1 set, and the second-roll crit model built

Both of Erik's unblocked items. Full `npm test` green by exit code.

## §1 — attributeMultiplier 20 → 10

Set. The tool's numbers hold exactly as Erik's decision predicted: attribute falls from **72.7% → 59%**
of a character's positive budget, **skill delivers 6.8 against a rank's 3.3** (skill selection ≈ 2× a
tier step — Erik's stated goal), and the ladder holds (master still +55.4 over novice).

## §3b — crits are now a SECOND roll

`critProfile(ctx)` returns two dials **and their named reasons**, in the same shape `successChance`
uses, because §9 asks the popup to say *"crit-success X% / crit-failure Y% — and why"*. The first roll
grades success/partial/failure; a success or a failure then takes its own crit roll. **A partial takes
no crit roll** — it is already the soft middle, and "a critical partial" has no meaning for the
narration or the receipt line. (My call; say the word if you want partials to crit.)

Measured, at the notable band, 10k seeded rolls per profile:

| profile | crit-succ dial | crit-fail dial | observed crit-succ% | observed crit-fail% |
|---|---|---|---|---|
| novice | 8 | 3 | 0.5 | 2.4 |
| competent | 15 | 1 | 5.3 | 0.5 |
| master | **20** | **1** | 13.3 | 0.2 |

Mastery triumphs harder **and** fails softer — and it does so at chance 95, which the partial band
could never reach. Four invariants now assert exactly that, including *"a character PINNED at the
ceiling can still crit-succeed"* — the original defect, so it cannot silently return.

**A tuning defect the model surfaced, and what I did about it.** On the first run every rank-2+
character had a **0% crit-failure dial** — "fails softer" had become "cannot catastrophically fail at
all," which quietly deletes the tail from the game. I floored `crit.minChance` at 1 so catastrophe stays
on the table at every rank, and asserted it. The floor is a data dial and the magnitudes are yours.

## The splash damage — what I went looking for, and what was actually there

Erik's point stands: `npm test` plus grep was not enough. What the audits **did not** cover:

1. **SNG-140's dials were nearly orphaned.** My first draft copied `wild.critSuccessWiden` /
   `critFailWiden` into the new `crit` block instead of reading them. Aevi's authored dial would have
   become dead content — Erik turns it, nothing happens. The `encounterRate` class, one layer down.
   Fixed by reading from their real home; the values and their meaning are unchanged.
2. **So I built the guard that catches the class.** `wiring_audit.mjs` now ratchets
   **`unreadRuleConstants`** — every authored tuning constant in `resolution.json` that no engine/app
   module reads by name. Baselined at the 11 that exist today; **proven to bite** (planted a fake dial,
   count went 11 → 12 and the build failed, naming the exact key). `SHOW_UNREAD_RULE_CONSTANTS=1` lists
   them.
3. **A real API contract change: `resolveAction` now draws up to TWO rng values.** Any caller feeding a
   fixed-length seeded sequence sized one-per-action now under-feeds. Production uses `Math.random`, so
   this is a test/replay concern — but it broke 4 fixtures, and worse:
4. **`seqRng` CYCLES.** A 2-value array that meant "player rolls X, opponent rolls Y" was silently
   feeding the player's *crit* roll to the opponent as their *outcome* roll. Rewritten as explicit
   per-side quads `[pRoll, pCrit, oRoll, oCrit]`, with the old degrees reproduced exactly.
5. **SYSTEM_SPEC §4a lied in two places** — both roll-table lines described the old bands. Corrected.
6. **`skill_battle.js` still has its OWN crit model** (`margin >= 40 → crit_success`, line 211). It is
   now a second, divergent notion of "critical" in the codebase. **Deliberately not changed** — it is a
   different subsystem with its own dials in `COMBAT_DIALS.md`, and folding it in is a bigger call than
   this ticket. Flagging it rather than leaving it to be discovered.

Two of my own edits I caught and reverted in diff review: a fixture I patched at the wrong line (294
instead of 613), and an em-dash my JSON writer re-encoded in the ratchet baseline.

## Attribution

For the record, since it affects who gets credit in the log: **the ceiling-as-reserve reframe and the
second-roll crit model were both Erik's** — Aevi's entry records them as his corrections to her. What I
contributed was the measurement that made them findable: the tool showing the master pinned at 95 with
crit-fail at 96, which is what proved the partial band could not work.

## Next

The §4/§4b popup, per Aevi's order. `critProfile` already returns its components, so the popup gets the
crit dials and their reasons for free alongside `successChance`'s breakdown.
