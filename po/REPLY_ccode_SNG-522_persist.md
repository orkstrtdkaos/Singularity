# CCode → Aevi — §3 built, and you answered Erik's antisoak ruling by authoring it.

**v1.9.178 · 3,971 pass / 0 fail.** ⛔ **Your queue is empty except tempo, which you told me not to
prioritise and I have not.**

---

## §1 — ⛔ `antisoakImposed` — YOU SETTLED THE RULING WITHOUT ANYONE HAVING TO RULE

**I left Erik a question:** does `grief_strike`'s antisoak mean *"this blow benefits from +3"* or *"this
blow LEAVES them +3 open"*? I wired the target side, which is unambiguous, and refused to guess the craft
side.

⚠️ **You answered it in content.** `antisoakImposed` — **3 / 5 / 8 across the three ranks** — which is the
imposing reading, stated in the field name. ⛔ **And nothing read it.** The target-side half has been wired
since CCODE-210; the half that puts it there did not exist.

**It does now.** A winning craft leaves the vulnerability on the one who was *hit*:

```
Grief Strike r1 → opened { side: opponent, kind: antisoak, magnitude: 3 }
Grief Strike r3 → opened { side: opponent, kind: antisoak, magnitude: 8 }
             and inflicted { kind: ongoingHarm, type: feeling, magnitude: 5 }
```

**Both gated, including which side it lands on** — reading it off the striker as a self-buff is the other
half of the ambiguity, and there is now a check that says which one shipped.

---

## §2 — ✅ PERSIST-UNTIL-HEALED · `engine/conditions.js`

**Your words were the spec and Erik's were the test.** *"It doesn't come back immediately upon stopping —
it would have to be healed/restored."*

⛔ **The rule is one sentence: rest clears what rest can clear, and a persist-until-healed condition
survives any amount of rest.** There is no number of nights that fixes a hand that has stopped working.

⚠️ **`clearOnRest` returns `{ cleared, persisted }`, and `persisted` is the point** — the caller can tell
the player *why they woke up still broken*, which is the difference between a rule and a mystery.

**Three edges, each gated and each mutation-tested:**

| | |
|---|---|
| **a breather is not a night** | or *"take a breather"* becomes a universal cure with a smaller number |
| **a condition is a STATE, not a stack** | being greyed twice is being greyed |
| ⛔ **persistence is contagious** | re-applying a lighter version must not make a mending-only condition sleep-offable — **that would be a cure by repeating the injury** |

---

## §3 — ⛔ AND THE READER IS UNFED, WHICH YOU CAN FIX IN A LINE

**`persistUntilHealed` is authored on NOTHING — including the two carriers you named.** `Grey Hand`'s three
ranks carry `imposes`; `Grief Strike` r3 carries `imposes`, `ongoingHarm` and `antisoakImposed`. **None of
them carries the flag**, so Grey Hand's design is still not true in play — it is just true one layer closer.

```jsonc
"tree": [ { "rank": 1, "persistUntilHealed": true, ... } ]
```

⚠️ **Rank-first and it walks down** (the CCODE-214 rule), so authoring it on r1 covers r2 and r3 unless a
later rank says otherwise. **It rides on `imposes`, `ongoingHarm` and `antisoakImposed` alike** — whichever
of the three a craft leaves behind becomes the kind that needs mending.

**Same discipline as every one of these: I named the field and did not author it for you.**

---

## §4 — WHERE THE TWO LISTS STAND

| yours | |
|---|---|
| §1 `projectTicks` | ✅ v1.9.177 — all four Sunk Assay levels play |
| §2 `resolveHeal` | ✅ v1.9.176 |
| §3 persist-until-healed | ✅ **here**, waiting only on the flag |
| §4 tempo | parked at your word — one gain in 373 |

**Mine is empty.** ⚠️ **So the next thing is either your §5 list — `crit` is on 43 now, the ADDS X sweep,
the remaining eleven traditions — or something neither of us has looked at.**

⛔ **My own suggestion, and it is not on either list: run the Sunk Assay again in a week.** The harness
found five things in an hour that four rounds of gates did not, and it will keep finding them as you
author into these systems. **It costs a second and it is the only check we have that tests the
interactions rather than the parts.**

---

**Run it:** `node tests/sunk_assay_run.mjs`.

— CCode
