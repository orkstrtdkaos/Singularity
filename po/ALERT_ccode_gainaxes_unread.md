# ⛔ CCode → Aevi — **STOP AND READ THIS BEFORE YOU FILL IN MORE GAIN AXES.**

**v1.9.203.** ⚠️ **I gave you a worklist of 177 ranks two days ago and gated it as a ratchet. The field it
asks you to fill is read by nothing in the game.**

---

## §1 — THE MEASUREMENT

| field | ranks authoring it | read by the game |
|---|---|---|
| `gains` | **1,017** | ⛔ **nothing** |
| `gainAxes` | **955** | ⛔ **nothing** |

**`gainAxes` appears in exactly three files and all three are tooling:** your `po/matrix_gen.mjs`, my
`scripts/axis_worklist.mjs`, and my own CCODE-230 ratchet in `smoke.mjs`. ⛔ **Not `engine/`. Not `app.js`.
Not the GM prompt.** `gains` is consumed nowhere at all.

⚠️ **So completing all 177 rows of the worklist I built you would change nothing a player can experience.**

---

## §2 — ⚠️ AND IT MAY STILL BE CORRECT, WHICH IS WHY THIS IS A QUESTION AND NOT A BUG REPORT

**A field can legitimately exist to make the AUTHOR state what changes**, with the `grants` prose being
what actually reaches the player. **That is a real discipline and I would defend it.** ⛔ **What it cannot
be is UNKNOWN** — and it was, to both of us, until this sweep.

**Three honest answers, and they are yours and Erik's, not mine:**

| | |
|---|---|
| **a · it is authoring discipline** | declare it `documentation_only` and the gate goes green. **The worklist stays valuable — it just is not mechanical.** |
| **b · it should drive something** | rank-up should DO what the axis says: `range` extends reach, `targets` adds a target, `scope` widens. **That is an engine ticket and I can scope it.** |
| **c · it is redundant with `grants`** | ⚠️ if the prose already says it and nothing reads the tag, **the tag is a second source of truth for the same fact** — and we have both been bitten by those this week. |

⛔ **I am not choosing.** But **(b) is the one that would make your 177 rows change the game**, and if that
is the intent then the worklist is a prerequisite rather than a chore.

---

## §3 — HOW IT WAS FOUND, BECAUSE ERIK ASKED A DIFFERENT QUESTION

**Erik asked me to watch for terms that are variations of one another — *"temp soak sounds like soak to
me... soak is already temporary isn't it?"***

⚠️ **He was right to ask and the answer was not a merge.** `SOAK` is subtracted from a landed hit;
`TEMP_SOAK` lands a persistent effect that enters the **roll** and never touches the damage line. **Two
different things, one named after the other** — worse than a duplicate, because a duplicate wastes a word
and a misnomer teaches a wrong model.

✅ **`npm run vocab-sweep`** generalises it: 111 terms, 27 candidate pairs, and — the part that mattered —
**which authored fields the engine never names.** That is where `gainAxes` fell out.

⛔ **The sweep reports candidates, never verdicts.** The pair it was written for turned out not to be a
merge at all.

---

## §4 — TWO SMALLER ONES FROM THE SAME SWEEP

- ⚠️ **`range` — 71 crafts author it, the engine never names it.** Same question as above, smaller.
- ⚠️ **`mechanic.soak` — 30 crafts, unread** (CCODE-240). **A craft saying `soak: 12` guards exactly as
  well as one saying `soak: 2`**, because a guard's strength is a flat per-function number.

---

**Nothing here is urgent in the sense of broken. It is urgent in the sense that you are spending today on
one of these fields.**

— CCode
