# HANDOFF — the two unmechanised verbs: ⛔ ONE WAS NEVER A VERB, and the other is one line of mapping

**Aevi → CCode · 2026-08-28 · Erik ruled A+C. `bolster` is closed in content; `persuade` needs you.**

---

## §1 — ✅ `bolster` IS CLOSED, AND IT WAS MINE

⛔ **`bolster` IS A SHAPE, NOT A VERB. It is not in `function_vocabulary` at all.** 50 crafts carry
`shape: bolster`; **exactly one carried it as a FUNCTION — `wellspring`, which I authored on 24 Aug.**

⚠️ **I reached for the shape's name while writing the verb list.** ✅ **Removed. What the craft does — energy
relief, harder resist, willingness — is `empower` and `sustain`, both already declared, so nothing was lost.**

⛔ **HALF OF "TWO UNMECHANISED VERBS" WAS A TYPO OF MINE THAT SURVIVED FOUR DAYS AND A GATE.** ⚠️ **The gate
was right that a craft described what the engine cannot do; it could not know the verb was not real.**
✅ **`content_ci` now reports `persuade` alone.**

---

## §2 — ⛔ `persuade`: ERIK RULED **A + C**

> **A — it resolves as SETUP WITH A SOCIAL TARGET: it does not change a mind, it makes the NEXT social
> action land better.**
> **C — whether they AGREE is table business, like a named axis: shown to the player, not computed.**

**THE DEFINITION DOES NOT CHANGE.** *"Bring someone to AGREE — they act because they now think it right"*
is still what it means in the fiction. ⚠️ **This says what the ENGINE does about it, which is less.**

### ⛔ AND THE MACHINERY ALREADY EXISTS — THIS IS A MAPPING, NOT A BUILD

**`familyDefaults.setup` is `{ magnitude: 3, duration: 1 }` with the note:
*"the setup bonus a read buys for the next exchange."*** ⛔ **THAT IS EXACTLY WHAT PERSUADE NEEDS.**

**And 5 of the 6 persuade crafts are ALREADY `shape: setup`:**

| craft | tradition | shape |
|---|---|---|
| `palework` · `case_closed` · `known_price` · `worth_the_work` | ashwarden · syllogist ×2 · mason | ✅ `setup` |
| `true_account` | ashwarden | `reveal` — ⚠️ **but already grants a named term in the actor's favour** |
| `names_of_power` | cogitant | ⛔ `hobble` — **the one that does not fit; see §3** |

✅ **THE ASK: `persuade` resolves through the setup path** — a named, signed term on the next SOCIAL
exchange, sourced from the craft's `magnitude`. ⚠️ **`true_account` proves the shape works: its reckoning
already enters as a named `contestMod` and Erik ruled that correct.**

---

## §3 — ⚠️ THE ONE THAT DOES NOT FIT, FLAGGED RATHER THAN FORCED

**`names_of_power` [cogitant] is `shape: hobble` and carries `persuade`.** ⛔ **A hobble is a penalty on the
target; a setup is a bonus on your next action. Those are different objects and I will not map one onto the
other to make a gate green.**

⚠️ **Two honest possibilities and I have not chosen:** either the craft's `persuade` is doing work its
`hobble` shape already covers and the verb is redundant — **the `bolster` situation again** — or it is a
genuine persuade whose shape is wrong. ✅ **I will read it and rule, and it is one craft, not a blocker.**

---

## §4 — ⛔ WHAT I DO NOT WANT BUILT

**No `modelAdjudicated` layer for this.** ⚠️ **It is the honest implementation of the definition and Erik
ruled it out with C** — *the craft supplies the leverage; the persuasion is the player's.*

⛔ **A verb that resolves to "the model decides" is a verb the engine cannot test, cannot balance, and
cannot report.** ✅ **Setup can do all three.**

---

## §5 — ACCEPTANCE

1. `content_ci` SNG-263 §1 reports **zero** unmechanised verbs.
2. **A `persuade` craft produces a named term on the next social exchange**, visible in the receipt.
3. ⛔ **It never produces agreement, compliance, or a condition** — `command` and `bind` exist for those and
   the vocabulary is explicit that persuade is neither.
4. ⚠️ **`names_of_power` may be excluded until I rule on it** — do not force its `hobble` through the setup
   path.
