# REPLY — `SPEC_rank_scaling_derive_with_override.md`. ⛔ THE CURVE IS FINE. THE MAP NEEDS A FIELD KIND.

**CCode → Aevi and Erik · v1.9.246 · `scripts/rank_curve.mjs`**

```bash
node scripts/rank_curve.mjs
```

**Your §4 asked me to propose a curve and report every place it would overrule a person. ⛔ I DID, AND THE
DISAGREEMENTS FOUND SOMETHING BIGGER THAN THE CURVE.**

---

## §1 — ✅ YOUR COUNTS VERIFY EXACTLY, AND HERE IS THE ONE CRAFT YOU ASKED FOR

| | measured | spec |
|---|---|---|
| `gainAxes` values | **777** | 777 ✅ |
| using one of the nine | **776** | 776 ✅ |
| outside the vocabulary | **1** | 1 ✅ |

⛔ **THE OUTLIER IS `grey_ground` r3, `area`.** *(Your §7.6: "I will do it when you confirm which craft.")*

---

## §2 — ⚠️ YOUR §1 CORRECTION IS RIGHT ABOUT ME AND WRONG ABOUT WHY

**You wrote: *"There is no `axis` field on a rank. The field is `gainAxes`."*** ⛔ **My 73% WAS an artefact
and you were right to stop me. But there are 495 `axis` fields, and the real shape is worse:**

| field | authored | read by |
|---|---|---|
| `rankDeltas[].axis` | ⛔ **495** | ⛔ **nothing** |
| `tree[].gainAxes` | **970 nodes / 777 values** | ✅ `capabilities.js` (presence) |
| ⛔ **`mechanic.axis`** | ⛔ **0** | ⚠️ **`craftmechanics.js` — the allow-list branch** |

**`craftmechanics.js:102` sets `authored = ability.mechanic`, so the field it tests against
`operativeAxis.mechanical` is `mechanic.axis` — WHICH NOBODY HAS EVER AUTHORED.**

⛔ **SO THE WHOLE 19-NAME ALLOW-LIST IS DEAD MACHINERY — a reader with no writer — while 495 authored
`axis` values sit in `rankDeltas` with no reader. Two ships passing.** ⚠️ **Neither is broken; they have
simply never met.** **That belongs on the cruft list, and it is not in scope here — I raise it so it is not
lost.**

---

## §3 — ⛔ §4: THE ENTIRE EMPIRICAL BASIS IS FIVE LADDERS, AND TWO ARE NOT MAGNITUDES

**Every rank ladder in the game:**

| craft | field | values | steps | kind |
|---|---|---|---|---|
| `soul_stare` | `resistDrop` | `[2,3,4]` | +50%, +33% | ✅ magnitude |
| `hastened_grey` | `antisoakImposed` | `[4,6,8]` | +50%, +33% | ✅ magnitude |
| `grief_strike` | `antisoakImposed` | `[3,5,8]` | +67%, +60% | ✅ magnitude |
| `the_attended_end` | `stage` | `[1,2,3]` | +100%, +50% | ⛔ **ORDINAL** |
| `ask_the_dead` | `reachesDepth` | `[0,1,2]` | — , +100% | ⛔ **ZERO-BASED INDEX** |

⚠️ **YOUR SPEC SAYS 30 RANKS AUTHOR A NUMBER; I FIND 15 VALUES IN 5 LADDERS.** ⛔ **My first pass found
ZERO, because I hardcoded a field list and there are TWO authoring shapes I did not know:** an array on the
mechanic (`resistDrop: [2,3,4]`) and a scalar repeated on each tree node (`antisoakImposed`). **Discovery
found them; a named list could not.** **If your 30 counts something else, say what — but the number of
STEP COMPARISONS available to fit a curve is ten, and only six of those are magnitudes.**

### ✅ AND ON THE MAGNITUDES, YOUR OWN CURVE IS GOOD

**"+50% then +33%" — from your §4 — fits ⛔ 5 OF 6 MAGNITUDE STEPS EXACTLY:**

```
soul_stare    [2,3,4]  ->  2, 3, 4    ✅ ✅
hastened_grey [4,6,8]  ->  4, 6, 8    ✅ ✅
grief_strike  [3,5,8]  ->  3, 5, 6    ✅ ⛔ person chose 8
```

⚠️ **The single miss is `grief_strike` r3 — and its own note calls that rank a deliberate break** (*"BREAK
AN EMOTIONAL FORTIFICATION ENTIRELY"*). **That is exactly the case the authored override exists for.**

---

## §4 — ⛔ THE REAL FINDING: THE AXIS→FIELD MAP NEEDS A **KIND**

**Your §3 maps axis → field. ⚠️ IT DOES NOT SAY WHAT KIND OF QUANTITY THE FIELD IS, AND A PERCENTAGE CURVE
IS ONLY MEANINGFUL ON ONE OF THE THREE KINDS:**

| kind | example | what derivation must do |
|---|---|---|
| **MAGNITUDE** | `resistDrop`, `antisoakImposed`, `damage` | ✅ scale by the curve |
| ⛔ **ORDINAL** | `stage [1,2,3]` | ⛔ **step by 1** — "+100% then +50%" is nonsense |
| ⛔ **INDEX** | `reachesDepth [0,1,2]` | ⛔ **step by 1 — AND A MULTIPLICATIVE CURVE CANNOT EXPRESS IT AT ALL: the base is 0, and 0 × anything is 0** |

⛔ **THIS IS A CATEGORY ERROR, NOT A TUNING MISS**, and it is already live in 2 of the 5 known ladders —
**40% of the evidence.** ⚠️ **Across 746 derived ranks it will not stay at 40%, but it will not be zero
either, and nothing in the current spec would catch it.**

✅ **THE FIX IS SMALL AND IT IS YOURS TO AUTHOR:** the axis→field map gains a `kind` per field.
⛔ **And §5's refusal list grows: `tempo` never derives, `conditions` derives count only — AND NO ORDINAL
OR INDEX FIELD DERIVES MULTIPLICATIVELY.** `reachesDepth` in particular is the death ladder and its rungs
are `reachOf(rank)`; the engine must never compute them a second way.

---

## §5 — WHAT I PROPOSE, AND WHAT I WILL NOT DO WITHOUT A RULING

✅ **Curve: `+50%` at r2, `+33%` at r3, rounded — your number, confirmed against every magnitude ladder
that exists (5/6).**
✅ **Resolution order exactly as your §3.** One insertion, above the ability block.
⛔ **Gated on `kind`: MAGNITUDE derives; ORDINAL and INDEX step by 1; unmapped derives NOTHING and says so.**
⛔ **`tempo` refuses and logs, per your §5.**
✅ **`--derived` report over all 746, builder-facing only, no player-facing marker.**

⚠️ **WHAT I WILL NOT DO: ship a curve fitted to six data points without Erik seeing that it is six.** **You
said §46 found no empirical curve. You were right, and the number is smaller than "few" suggests.** ⛔ **The
curve is a DEFAULT for ranks that currently scale by nothing — it is not a discovered law, and the
`--derived` report is how we find out where it is wrong before a player does.**

**Confirm `kind` and I will build it.**

— CCode
