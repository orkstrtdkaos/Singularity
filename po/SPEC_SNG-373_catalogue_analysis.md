# SNG-373 — Catalogue analysis: the reveal glut, six duplicates I authored, and 29 flat trees

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"take a hard look at the reveal skills
— and all the skills for vagueness, useless ranks, missing ranks, duplicate or nearly redundant skills"*
**Method:** all 374 abilities pulled from origin. Every figure below is reproducible from `ALL.json`.
**Status:** measurement — nothing changed yet.

---

## §0 — TWO OF MY OWN DETECTORS FAILED FIRST, AND THE FAILURE IS THE SAME ONE

My first vagueness scan flagged **125 of 143** reveal abilities as weak. ⛔ **That number is wrong and I
am not quoting it.** It searched for *"NAMES / tells you / gives you"* — **my own phrasing.** `echo_sense`
says *"count people, tell cart from horse, catch a digger at work below"*; that is entirely concrete and
my detector could not see it because I did not write it.

⚠️ **Third time today** — the corpus-shaped self-tax regex, the FIGHT-tag combat check, and now this.
**Every time I build a test from the corpus, it measures how much the corpus sounds like me.**

**The neutral proxy used below instead:** a concrete grant carries a quantity, a distance/duration, or a
comma/semicolon list of instances. Style-agnostic. **It gives 71 of 374, and I believe that one.**

---

## §1 — ⛔ THE REVEAL GLUT IS REAL AND IT IS A COUNTER-COVERAGE PROBLEM

| | |
|---|---|
| `reveal` | **143** tags — 38% of all abilities carry it |
| KNOW family (reveal/foresee/track) | **204 abilities across 3 verbs — 68 per verb** |
| SHAPE family (make/transform/summon) | 81 across 3 — **27 per verb** |

**But the count is not the finding. This is:**

| capability | vs its counter | ratio |
|---|---|---|
| ⛔ **reveal + track + foresee — 204** | **conceal + deceive — 43** | **4.74 : 1** |
| strike/break/hinder — 144 | ward/shield/resist — 96 | 1.50 : 1 |
| heal/mend/restore — 80 | strike/break — 101 | 0.79 : 1 |
| bind — 73 | open/move/travel — 97 | 0.75 : 1 |
| ⚠️ summon — 16 | break — 42 | 0.38 : 1 |

⛔ **The game can see roughly five times better than it can hide.** Every other opposed pair sits inside
1.5:1. **This is not "too many reveals" — it is that concealment lost an arms race**, and it means an
opposing NPC's secret, a Veilwright's disguise, and any mystery is structurally fragile. ⚠️ **Fixing it by
deleting reveals would be wrong; the fix is authoring the counter.**

---

## §2 — ⛔ TIER HOLES, INCLUDING TWO INTERIOR ONES

A verb that exists at tiers 1-3 and 5 but **not 4** is a hole a progressing character falls into.

| verb | total | absent at | |
|---|---|---|---|
| **foresee** | 46 | **tier 4** | ⛔ **INTERIOR** — 28/11/3/**0**/4 |
| **hinder** | 43 | **tier 4** | ⛔ **INTERIOR** — 21/17/4/**0**/1 |
| transform | 20 | tier 1 | ⚠️ a SHAPE verb no level-1 character can reach at all |
| track | 15 | tiers 4 **and** 5 | ⚠️ tracking simply stops existing above tier 3 |
| command · heal · shield · mend | 36/35/31/21 | tier 5 | the capstone tier has no healing and no shielding |

⚠️ **`heal`, `mend` and `shield` all vanishing at tier 5 is a pattern, not four coincidences** — the
capstone tier is authored as endgame *power* and forgot endgame *care*.

---

## §3 — ⛔ SIX EXACT DUPLICATES, AND ALL SIX ARE MINE

Ten abilities share tradition + tier + function-set with another. **Six of the ten are abilities I
authored on 2026-08-07, duplicating a sense-ability the tradition already had:**

| my new ability | duplicates | tradition, tier, functions |
|---|---|---|
| `the_loose_thread` | `chaos_sense` | churnfolk T1 foresee+reveal |
| `the_true_figure` | `pattern_sense` | figurist T1 foresee+reveal |
| `the_true_account` | `deathsense` | ashwarden T1 foresee+reveal |
| `the_kept_count` | `hour_sense` | hourkeeper T1 foresee+reveal |
| `the_read_field` | `read_the_fight` | marcher T1 foresee+reveal |
| `the_weighed_word` | `the_measuring_eye` | seraphic T1 reveal |

⛔ **My pre-flight step 6 says "read 2–3 sibling abilities in the destination file." I read the file and
still authored a second first-tier sense-craft for six traditions that already had one.** Reading for
SHAPE is not the same as reading for OVERLAP, and my process only asks for the first.

⚠️ **They are not all worthless** — `the_kept_count` returns a specific remaining time where `hour_sense`
returns elapsed-and-until; `the_true_account` reads decline where `deathsense` reads death. **But a
level-1 character sees two options that look identical on the card, and that is a wasted choice.**
**Disposition needed per pair: merge, differentiate, or retier.**

---

## §4 — 29 FLAT TREES (rank 3 adds no function and no harm rung over rank 1)

**18 of the 29 are tier I** — where most characters live.

⚠️ **Flat is not automatically wrong**: `darksight` getting further and sharper is a legitimate ladder.
⛔ **But three are flat AND vague**, which is the bad quadrant, and all three are pre-existing:
`mind_read_folk` · `appetite_sense` · `hour_sense`.

**And 66 abilities have a tree that is not 3 ranks** — 1- and 2-rank trees. ⚠️ **Worth confirming with
CCode whether a 1-rank tree is legal**, because if the engine assumes three, those abilities silently
cannot be deepened.

---

## §5 — VAGUENESS: 71 of 374 by the neutral proxy, 25 of them under 80 characters

**The worst are one-line assertions with no output named:**
*"Wake the living current in the ground, drawing on the deep life-substrate"* (rootkin T3) ·
*"Act with body and mind fused — perception, decision, and motion as a single instant"* (somatic T4) ·
*"Tilt an uncertain moment toward a good break for you"* (churnfolk T3).

⚠️ **Tier 4 is the worst band (19), not tier 1** — the abilities nobody has reached yet are the least
concrete, because nothing has forced them to be. **Play is what makes an ability concrete, and the top of
the ladder has never been played.**

---

## §6 — WHAT I PROPOSE, in order

1. **Author the counter, not fewer reveals** — conceal/deceive is the single worst imbalance in the game.
2. **Fill the two interior holes** — `foresee` and `hinder` at tier 4.
3. **Disposition the six duplicates I made** — merge, differentiate or retier. Mine to fix.
4. **`heal`/`mend`/`shield` at tier 5** — the capstone has no care in it.
5. **The 25 short-and-vague grants**, tier 4 first.
6. ⚠️ **`transform` at tier 1 and `track` at tiers 4-5** — check these are DESIGN before authoring into
   them. A verb deliberately withheld from level 1 is a decision; I should not fill a hole that is a wall.
