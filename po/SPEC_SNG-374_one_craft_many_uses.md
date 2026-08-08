# SNG-374 — One craft, many uses: the merge model and how to work the catalogue

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"merge skills that do nearly the same
thing and let the player use it multiple ways… I want the crafts to be distinct enough to make sense,
while the use of them can be more varied."*
**Status:** proposal · **Supersedes** the "disposition the six duplicates" line in SNG-373 §6.3

---

## §0 — THIS IS A MODEL CHANGE, NOT A CLEANUP

⛔ **The catalogue is currently built on "one ability = one application."** That is why it has 374
abilities, why `reveal` is 143 of them, and why I could author six near-duplicates without noticing:
**when every use needs its own ability, the count grows with the fiction and the card list stops being a
choice.**

**Erik's model is "one craft = many applications."** `hour_sense` and `the_kept_count` are not two crafts.
**They are one craft — reading time — asked two different questions.** Under the current model that is two
purchases; under Erik's it is one purchase and two uses.

⚠️ **The two axes this separates, which the current schema conflates:**

| axis | is | expressed by |
|---|---|---|
| **DEPTH** — how far the craft reaches | earned, GM-marked | the rank `tree` (already exists) |
| **BREADTH** — what you can ask it | inherent to the craft | ⛔ **nothing today** — so it became separate abilities |

---

## §1 — THE SIX MERGES, and the direction is decided by the evidence

**Merge INTO the old id. Retire the new one.** ⚠️ **Verified: NEITHER id is held in any live save**, so
neither direction breaks a character — but old ids are the ones referenced by braid recipes, native
grants and school curricula, so they are the load-bearing name.

⚠️ **And in all six pairs the old ability is the vague one-liner and mine is the concrete one** — so the
merge keeps the old ID and takes MY prose. That is the honest read of §373's vagueness finding and my own
duplication finding pointing at the same six rows.

| keep (id) | absorb | one craft, asked two ways |
|---|---|---|
| `hour_sense` | `the_kept_count` | *how long since* · *how long until* · **how much is left** |
| `chaos_sense` | `the_loose_thread` | *where it will break* · **which assumption it rests on** |
| `pattern_sense` | `the_true_figure` | *that this is a pattern* · **which element does not fit** |
| `deathsense` | `the_true_account` | *how near death* · **what is failing and what it fails from** |
| `read_the_fight` | `the_read_field` | *a foe's tell, a beat early* · **the ground's fight before it starts** |
| `the_measuring_eye` | `the_weighed_word` | *what a person carries* · **whether an answer was honest** |

**Net: 374 → 368 abilities, and six tier-I choices stop being a coin toss between two cards that read the
same.**

---

## §2 — HOW A CRAFT CARRIES ITS USES

**§2a — NOW, with no engine change:** fold the applications into the rank-1 `grants` as named questions.
`hour_sense` rank 1 becomes *"ask it one of three things — how long since, how long until, or how much is
left — and it answers exactly."* ⚠️ **Works today, reaches the GM through the ABILITY LAW block, costs
nothing.**

**§2b — BETTER, and it needs CCode:** an `applications[]` array — `{name, asks, gives, cannot}` per use.
⛔ **DO NOT AUTHOR THIS BEFORE A CONSUMER EXISTS** — that is the mistake I made with `combination_recipes`
and nearly made with `rule_copy.json`. §2a first, §2b when the card can render it.

⚠️ **Why §2b is worth doing at all:** with applications as data, the card can show a craft's uses as a
short list, and the player sees *"this one craft answers three questions"* rather than one paragraph they
must parse. **That is the whole benefit Erik is asking for — it is a display problem as much as a content
one.**

**§2c — the line that keeps crafts distinct:** ⛔ **two applications belong to one craft only if they
share a MECHANISM, not merely a subject.** Reading elapsed time and reading remaining time are one
mechanism (the count) asked twice. Reading time and *stretching* time are two mechanisms and stay two
crafts. ⚠️ **Without this test, "merge near-duplicates" collapses into one omni-craft per tradition**,
which is the opposite failure and harder to undo.

---

## §3 — THE ORDER I PROPOSE FOR THE WHOLE CATALOGUE

1. **The six merges** (§1) — smallest, decided, and mine. Do first.
2. ⛔ **Author the counter: `conceal` + `deceive`.** 204 vs 43 is the worst imbalance in the game and the
   only opposed pair outside 1.6:1. ⚠️ **Not by deleting reveals** — by making hiding a real craft.
   Every tradition with a strong sense-craft should have something that answers one.
3. **The two interior tier holes** — `foresee` and `hinder` at tier 4.
4. **`heal`/`mend`/`shield` at tier 5** — the capstone tier has no care in it.
5. **A merge sweep beyond the six**, applying §2c: I expect more pairs that are one mechanism asked twice.
6. **The 29 flat trees**, tier I first — and ⚠️ **under the new model many of these are not broken; they
   are crafts whose ranks should have been APPLICATIONS.** Re-read them as breadth before adding depth.
7. **The 25 short-and-vague grants**, tier 4 first.

⚠️ **§373 §6.6 still stands and Erik should rule on it before anything is authored there:** `transform`
absent at tier 1 and `track` absent at tiers 4-5 may be DESIGN. **A verb withheld from level 1 is a
decision; I should not fill a hole that is a wall.**

---

## §4 — WHAT THIS DOES TO THE REVEAL NUMBER, honestly

**Merging six removes six `reveal` tags. It does not fix the 4.74:1.** ⚠️ **Anyone reading §373 might
expect the merge to solve the glut, and it will not — the glut is a missing counter, not a surplus.**
Only step 2 moves that ratio.
