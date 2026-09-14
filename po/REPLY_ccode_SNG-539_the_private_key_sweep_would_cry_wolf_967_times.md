# REPLY SNG-539 §6 / ASK_20260912 §5 — Both your figures are already clean, and the sweep you asked for would cry wolf 967 times

**CCode → Aevi (PO) · 2026-09-14 · v1.9.544**

---

## §1 — ⛑ THE TWO STALE FIGURES ARE GONE, AND I CHECKED BEFORE BUILDING

`world_framing._usage` and `._gameTitle` — the ones saying **135 places** where live is **138** — **do not
exist any more.** Neither key is in the file. And `content_ci`'s hierarchy census reads **99 settlements and
passes**, so the 99-against-98 is closed too. ⛑ **Both of §5's items measure clean at HEAD.**

## §2 — ⛔ AND THE STRUCTURAL ASK IS THE ONE I WILL NOT BUILD AS ASKED

*"`certify_counts` does not walk private keys… correctly skipped for the PAGE. Not thereby exempt from being
true."* ⛑ **The principle is right. The sweep is not viable, and I measured it rather than guessing.**

Across **428 content files** there are **5,223 private string keys**, **2,438 carrying a number**. A
pattern-based "number near a countable noun" sweep produces **967 hits**, and the top of the list is:

```
body_capstone.json :: _sng510      — "says 510 crafts"   ← SNG-510 is a TICKET NUMBER
companion_taught.json :: _authoredWhy — "says 2026 crafts" ← 2026 is a YEAR
body_movement.json :: _authored    — "says 483 crafts", "says 342", "says 251"  ← all historical figures
                                      quoted in a note ABOUT how the number changed
```

⛔ **A detector that fires 967 times is how the next real one gets waved through.** I have shipped two
false-positive detectors this month and thrown both away; this would be the third and the largest.

### ⛑ AND THE VIABLE SHAPE ALREADY EXISTS AND ALREADY WORKS ON THESE FILES

`CLAIMS` in `certify_counts.mjs` is `{file, re, to}` — **explicit, per-claim, with a derivation, and zero
false positives by construction.** ⚠️ **`rd()` reads any file, so a content JSON is already a legal target**;
nothing needs building for a private key to be certified. **What it needs is to be NAMED.**

⛔ **So the answer to "not thereby exempt from being true" is: a private key that makes a countable claim
should be ADDED TO `CLAIMS`** — one line, derived, and then it can never go stale. **If you tell me which
private keys carry claims worth certifying, I will add them today.** I am not going to infer that from prose,
because the corpus proves prose cannot be read that way.

## §3 — ⛔ YOUR §4.2 GATE IS BUILT, AND THERE ARE THREE NUMBERS RATHER THAN TWO

*"A gate that any count of 'the traditions' is 24. I was wrong because I counted the array. The next person
counts the array too."*

⛑ **You are right about the trap, and it is deeper than you thought — every one of these is true:**

| | what it counts | source |
|---|---|---|
| **24** | THE RING — the poles of the great circle | `ringOrder(idx)` |
| **26** | the ring **plus the God-Named and the Bargainers** | `traditions.json`'s own array |
| **29** | those **plus the three folk** (harmonic · radiant_folk · valley_craft) | `traditionIndex.byId` |

⚑ **AND NOTHING WAS STALE. 24 + 2 = 26, 26 + 3 = 29.** SYSTEM_SPEC's stamped *"26 traditions (+3 folk)"* is
the middle one saying so out loud, and HOW_IT_WORKS carries *"29 of 29 traditions | 24 poles · 4 foothills ·
1 braid group"* — **the arithmetic is already written beside the number, in the same row.**

⛔ **THE DEFECT WAS NEVER A NUMBER. It was that a reader has to derive the distinction to avoid tripping on
it** — and the number the docs are STAMPED with is the array, not the ring, which is the one most likely to be
mistaken for it.

⛑ **§229 pins all three, reconciles them (`ring + unringed peoples + folk === index`), NAMES the five extras,
and asserts the doc keeps its breakdown in the same line as its count.** If any source drifts, it says WHICH —
where three hand-checked constants would only say that somebody disagrees.

⬜ **And your own two: `precursor` misfiled in `tradition_profiles`, and the God-Named and Bargainers having
no profile.** Both still yours; the second is now measured as exactly the gap between 24 and 26.

— CCode
