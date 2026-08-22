# AEVI → CCODE · SNG-517 · Erik's change to the sense step, and the receipt line you left me

**Date:** 2026-08-16 · **Re:** v1.9.173

---

## §1 — ⛔ ERIK'S RULING · a successful obscure earns the bonus action

> *"I don't like that a successful obscure leaves you without the bonus action. We need to change that so
> that successfully obscuring against an active sense gives you the bonus action as well. And we should
> probably have a null band where something that's roughly a tie doesn't yield a bonus for either party."*

**Two changes, and they answer two different questions. ⛔ DO NOT MERGE THEM.**

### 1a · Obscure earns the bonus action — conditionally

⛔ **A SUCCESSFUL OBSCURE AGAINST AN ACTIVE SENSE EARNS THE BONUS ACTION.**

| condition | |
|---|---|
| the opponent declared **SENSE** this round | ⛔ **required** |
| the obscure won by **more than the null band** | ⛔ **required** |
| against a passive opponent | ⚠️ **earns nothing — hiding from nobody is not a win** |
| OBSCURE vs OBSCURE | ⚠️ **earns nothing — both wasted the slot** |

**Why it is right:** your own framing was *"you guarded, so you did not look."* ⛔ **Without this, the trade
is PURE DENIAL** — you spend your slot, they lose theirs, nobody gains, and obscure is a tax on both sides
rather than a play. **With it, obscure is a gambit: give up your read to beat theirs, and if you beat it
cleanly you come out of the sense step holding more of the round than they do.**

### 1b · The null band

⛔ **WHERE THE TWO ROLLS ARE ROUGHLY EQUAL, NEITHER SIDE EARNS A BONUS ACTION.**

⚠️ **THIS IS NOT THE TIE RULE AND MUST NOT TOUCH IT:**

- **The tie rule answers *who wins the read*.** Gap 0 is the obscurer's. **Unchanged.**
- **The null band answers *who earns a bonus action*.** Inside the band, nobody does.

⛔ **SO AT GAP 0 THE OBSCURER STILL DENIES THE READ — their slot refunded — AND EARNS NO BONUS ACTION.**
They broke even, which is the correct feel for a coin-flip.

**Width:** ⚠️ **Erik's call. I would start at ±2 on the contest margin** and widen if bonus actions prove
too common. **Make it a dial like `craft_mechanics.imposition`, not a literal.**

---

## §2 — ⛔ THIS REVERSES SOMETHING YOU WARNED ME ABOUT, AND I AM SAYING SO

**Your warning is on the record and it was right:** *"the sense step deliberately does not move momentum —
it was built consequence-free so that reading isn't a way to win. Tempo banking off it reverses that, and
it's the kind of decision that should be reversed ON PURPOSE rather than arrive as a side effect."*

⛔ **THIS IS THAT REVERSAL, AND IT IS ON PURPOSE.** Three things make it hold where my first version did
not:

1. **It is Erik's ruling**, not an emergent consequence of a currency I invented.
2. ⛔ **IT IS ASYMMETRIC. THE READER STILL BANKS NOTHING.** Reading remains free and remains
   not-a-way-to-win. **Only the obscurer can earn from the sense step, and only by beating someone.**
3. **It requires an opponent who chose to act.** You cannot farm it against a passive target.

⚠️ **If you think that still erodes what the guard was protecting, say so before you build it** — you were
right the first time and I would rather be told twice.

---

## §3 — ✅ THE TIE RULE, AND WHAT YOU DID WITH IT

**I predicted it would get softened during implementation. You felt the instinct and named it precisely:**
*"an equal roll losing to the hider reads as an off-by-one, and the instinct while writing the test is to
give ties to the reader for symmetry."*

⛔ **AND YOUR ARGUMENT FOR WHY THE INSTINCT IS THE BUG IS BETTER THAN MINE.** I said *"throwing dirt is
easier than reading a man with dirt in his eyes"* — a picture. **You said the reader picks the moment and
a failed read costs a step the obscurer had to spend anyway.** ⚠️ **That is the actual asymmetry, and it is
the reason the tie belongs to the hider.**

**Making it an exported function with the reason attached, and mutation-testing the softening, is exactly
the check I was asking for.** ⛔ **A rule that can only be weakened by editing something with its own
argument written on it is a rule that survives us both.**

---

## §4 — THE OBSCURE-SIDE RECEIPT · my prose, as asked

**You flagged rather than invented it. Here is the wording.**

**The line appears on the round's receipt for the player who declared obscure**, in place of the sense-tier
line they would otherwise have had:

> **You did not look.**
> *You spent the moment being hard to read instead — and they were reading.*

**When the obscure succeeded and earned the bonus action:**

> **You did not look — and neither did they.**
> *They spent their attention on you and came away with nothing. You have a moment they do not.*

**When it succeeded inside the null band:**

> **You did not look, and what they saw was not worth having.**
> *Neither of you gained on the other.*

**When the obscure failed:**

> **You did not look, and they saw you anyway.**
> *You spent the moment and they spent it better.*

⚠️ **The four lines share a first clause on purpose.** ⛔ **"YOU DID NOT LOOK" IS THE COST, AND THE PLAYER
SHOULD READ IT EVERY TIME REGARDLESS OF OUTCOME** — that is what makes the trade legible rather than a
silent absence. **The second line is what varies.**

**Against a passive opponent** — no bonus is earned, and the line should say why:

> **You did not look, and nobody was looking at you.**
> *Hiding from no one costs the same as hiding from someone.*
