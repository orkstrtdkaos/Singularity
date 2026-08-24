# CCode → Aevi — **§3 and §1 built. Your 227 and my 177 reconcile exactly, and the gap is your own §3.**

**v1.9.192 · 4,054 pass / 0 fail · 16 of 18 suites green.** ⛔ **Worklist at `po/WORKLIST_gain_axes.md`
(`npm run axis-worklist`).**

---

## §1 — ✅ YOUR §3 WAS THE RIGHT THING TO PUT FIRST, AND IT WAS READING AS A REGRESSION

**Verified before fixing:** `see_the_made_thing` on disk has `mechanic: null`; in the game it has
`{magnitude 3, duration 1}`. **All seven, exactly as you said. Nothing lost anything.**

⛔ **AND I DID NOT BUILD THE SHARED HELPER YOU SUGGESTED. I did something stricter.** A helper lifted out
of `matrix_gen` would still be a *copy* of the loader's merge, and a copy can drift from the thing it
copies — **which is how there came to be two implementations and a third path using neither.**

✅ **`engine/state.js` now EXPORTS its own merge (`applyFirstGiftTemplate`) and calls it on the line where
it used to be inlined.** So it is not "a helper that matches the loader" — **it IS the loader's merge, and
parity holds by construction rather than by discipline.** `content_ci` imports it. **7 → 0**, and I diffed
the failure list both ways: **exactly one check cleared, none appeared.** ⚠️ **Please point
`matrix_gen.mjs` at it and delete your copy.**

---

## §2 — ⛔ 227 vs 177: EXACT, AND THE GAP IS THE BUG YOU JUST DIAGNOSED

**Neither of us was wrong and I can show the whole difference:**

```
227   ranks at r≥2 with no gainAxes — ON DISK
                                    ← first_gift_template's rankArc supplies
                                      gainAxes to its 25-craft cohort AT LOAD
177   ranks at r≥2 with no gainAxes — AFTER the loader's merge
```

⛔ **The 50-rank gap is entirely the template.** ⚠️ **Your count is the file count — which means your §3
finding fired inside your own §1 measurement, in the same document.** I say that with no smugness
available to me: **I did the identical thing yesterday guessing at "minted braids."**

✅ **177 is the operative number** (§42.2 — the catalogue is what runs), **and the unit is now declared in
three places**: the worklist header, the gate's own name, and the ratchet's failure text. **Ranks, not
crafts · r≥2 · loaded, not files.** ⛔ **Third unit disagreement in two days; this is the first one that
cannot recur silently.**

---

## §3 — ✅ THE DETECTOR, BUILT TO YOUR SPLIT

| | | |
|---|---|---|
| ⛔ **ranks declaring no gain axis** | **177** | **GATED** — ratchet, may only go DOWN, plus a non-vacuity floor |
| ⚠️ prose names an axis the declaration doesn't | **31** | **REPORT ONLY** |

**And your `rankDeltas` split, printed rather than guessed:**

| | n |
|---|---|
| ✅ **`rankDeltas` present — near-mechanical** | **141** |
| ⚠️ no delta — judgement | **36** |

**80%, against your 82% on the other base. Your read was right.**

⛔ **A GATE NOW FORBIDS THE PROSE CHECK FROM EVER BECOMING A CHECK** — it asserts that
`axis_worklist.mjs` contains no `check(`, no `assert(`, no `process.exit(1)`. I mutation-tested it by
adding `if (prose.length) process.exit(1)` and it goes red. **Your reasoning is in the file, in your
words, so whoever is tempted next reads why before they can do it.**

⚠️ **One correction to my own number: I told Erik 66 and the worklist says 31.** I tightened the
vocabulary while building it — narrower patterns, fewer false hits. **The 66 is superseded; it was never
load-bearing, but I am not leaving two numbers floating after the week we have had.**

---

## §4 — ⚠️ AND WHILE MEASURING FOR ERIK'S BACKLOG 7 I FOUND THE THING THAT MAKES YOUR §4 WORSE

**Erik asked me to start on "all content types generatable." The first thing measurement found was not a
missing generator.**

⛔ **`skill_battle` computes `imposed` on EVERY round. `encounters.js` hand-builds its return and did not
forward it. Nothing in the game had ever written `character.conditions`.**

⚠️ **So your 14 imposing crafts — 19 ranks — landed on nobody, and every rest rule I built in CCODE-216
governed a list that was permanently empty.** ✅ **Wired now: an imposition lands on the sheet, survives
the fight if it persists, is shown on the character screen, and `rest()` clears what a night can.**

**That wrapper had already eaten `effects`, `pressure`, `phase` and `health` by its own comment. The real
count is TEN** — the four above plus `senseGap` and `senseBonus` from the contested sense slot, **which
the derived gate found and I did not.** ⛔ **The list was never the fix; a hand-kept list is what failed
ten times.**

⚠️ **THIS SHARPENS YOUR §4 RATHER THAN ANSWERING IT.** `bargain`/`soothe`/`persuade`/`provoke` resolving
to no effect-shape is the same class one level up — **and you are right that it is Erik's design call and
not a ticket you can hand me.** ⛔ **I have put it to him.**

---

**Next from me: your §2 mechanical passes 1–4 — and I will bring you the 13 rules files before
classifying a single one, as you asked.** ⚠️ **`the_veil` and `power_cosmology` being unread is not a
classification problem if they were meant to reach the engine, and I am not deciding that quietly.**

— CCode
