# SPEC — SNG-295: `stageMoved` credit, fully decided
## Aevi (PO) · 2026-08-04 · Erik answered all four. This is the build spec.

## THE FOUR RULINGS
**1. REVERSING COUNTS AS TURNING.** Pushing an arc *back* a stage earns the credit exactly as advancing it
does — **and the title does not disambiguate.** *"Who Turned the Bleed"* says you moved it; **the stories say
which way.** This keeps the Feared and the Kept on identical footing, which `DIRECTIVE_SNG-280` requires.
**2. SHARED CREDIT — ALL OF THEM.** Every figure on the side the arc moved toward **who won a contest on that
arc that pass** banks a stage-move. A turning is genuinely collective; naming one figure would be false.
**3. ⚠️ CREATING THE VACANCY COUNTS.** Erik: *"striking defenders is a good mechanic to credit."* **A figure
who struck an arc's defenders and thereby emptied the front that let it move HAS TURNED IT** — by removing the
people holding it, rather than by pushing. **This is the nastiest mechanic in the system and one of the best:
you can turn an arc without ever contesting it, by killing the people who were.**
**4. THE PLAYER CAN EARN IT.** Deeds travel; a party holds an arc position. It is likely the most satisfying
title in the game — **it is the one that says the world is different and it was you.**

## THE CREDIT RULE, ASSEMBLED
```
on a stage change of arc A this pass, credit `stageMoved` to:
  (a) every figure LEANING TOWARD the direction it moved, who WON A CONTEST on A this pass
  (b) every figure whose STRIKE removed a defender of the side that lost, within the vacancy window
  (c) the player, if either (a) or (b) describes them
  and NOT to anyone who leaned against it, whatever they did      ← the whole bug
figures who leaned with it but won nothing:  `heldThroughCrisis` (1), which already exists
```
**`heldThroughCrisis` for the merely-present is the important half.** They did contribute — they were the
weight the winners were adding to. **They just did not turn it**, and the record should say the difference.

## ⚠️ THE CONSEQUENCE OF RULING 2 + 3, AND CCODE SHOULD SEE IT BEFORE BUILDING
**Erik's answers make credit BROADER than my minimal proposal.** My reply had it as *"pushed it and won
contests"*; ruling 3 adds a second, entirely separate route in.
**Rough estimate against CCode's measured run:** presence-credit gave `pro + con` ≈ **~30 figures per stage
move**, and produced **20 turner-mythics in 4 worlds × 12 years (95% of all mythics)**. Causation-credit with
all-of-the-winning-side is maybe **4–8 figures**, plus the vacancy strikers — call it **a 4–6× reduction**, so
**~3–5 turner-mythics** over the same run.
**That is probably the right number** — THE TURNER *should* be a real road, and with the other six now priced
per-rung rather than as career totals, they should start firing too. **But it is an estimate, and the sweep is
the answer.** If THE TURNER still takes >50% of mythics after this lands, **the fix is to raise its bar to
three stage moves — not to narrow the credit further**, because Erik has ruled on who deserves it and that
ruling shouldn't be undone by tuning.

## WHAT THIS UNBLOCKS
- **`who_turned` generative title ships** — it was blocked precisely on this, and under presence-credit it
  would have named figures who fought to prevent the turning.
- **THE TURNER mythic path becomes meaningful** rather than a presence test.
- **And ruling 3 gives the strike system a second consequence**: a striker was already earning `strikeLanded`;
  now a *campaign* of strikes against one arc's defenders can turn the arc, and the world will name them for
  it. **That is a coherent villain arc that nobody had to author.**

## FOR CCODE
- the `[...pro, ...con]` site is the one to change; the contest-winner set for that arc/pass is already to hand.
- **the vacancy window needs a definition — my proposal: a strike counts if the struck figure was holding that
  arc at the time of the strike, and the stage moved within the same or the following pass.** Tighter than
  "ever", loose enough that a real campaign lands.
- and re-run the sweep reporting the path distribution — **that number is the acceptance test, not this spec.**
