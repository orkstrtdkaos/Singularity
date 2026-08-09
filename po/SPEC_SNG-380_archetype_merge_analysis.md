# SNG-380 — Merge analysis: 13 archetypes account for 23% of the catalogue, and they explain the glut

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"during classification pass, let's look
for more merge opportunities."*
**Status:** measurement + proposal · **Reads with** SNG-374 (one craft many uses) and SNG-373 (the glut)

---

## §0 — TWO DETECTORS, AND THE FIRST ONE FAILED USEFULLY

**Text similarity found ONE pair** across 374 abilities. ⚠️ **That is not because there are no duplicates —
it is because the prose is genuinely distinct.** Every one of these was authored with its own idiom, its
own tradition's voice, its own examples. **The writing is not the duplication.**

⛔ **The duplication is mechanical, and SNG-374 §2c already named the right test: shared MECHANISM.**
Matching on `(shape, functions)` instead of prose:

| | |
|---|---|
| distinct mechanism signatures | **249** |
| singletons — genuinely one-of-a-kind | 196 |
| ⛔ **signatures spanning 4+ traditions** | **13** |
| ⛔ **abilities inside those 13** | **87 — 23% of the catalogue** |

---

## §1 — THE THIRTEEN, and they are archetypes rather than accidents

The largest:

| mechanism | traditions | the same craft, in each tradition's idiom |
|---|---|---|
| `setup [foresee, reveal]` | **10** | body_read · mind_read_folk · chaos_sense · pattern_sense · **deathsense** · fault_sense · see_the_made_thing · **hour_sense** |
| `reveal [foresee, reveal]` | **10** | the_loose_thread · the_ordered_record · the_true_figure · the_sound_read · the_felt_room · the_read_burn · the_true_account · the_read_want |
| `bolster [resist, sustain]` | **9** | the_long_form · the_long_haul · the_long_dark · the_axiom_holds · the_held_truth · the_running_engine |
| `setup [reveal]` | **8** | echo_sense · prism_sight · order_sense · appetite_sense · the_measuring_eye · numen_sense |
| `setup [reveal, track]` | **7** | echo_memory · address_sense · stone_read · lightsense · lifesense · mech_sense |
| `bolster [empower, sustain]` | **7** | the_sustained_chord · the_choir_sustains · the_ongoing_work · the_wellspring |
| `reposition [transform, travel]` | **7** | the_carrying_note · the_drawn_ascent · the_raised_road · the_carried_green · the_stepped_span |
| `bolster [bind, command]` | **6** | the_weight_of_presence · the_set_word · the_blazing_word · the_weight |

⚠️ **Note that the six I authored yesterday and called duplicates are in here — and so are their
pre-existing partners, and so are eight other traditions' versions of the same thing.** **I did not create
this pattern. I completed rows in it without noticing it was a grid.**

---

## §2 — ⛔ THIS EXPLAINS THE REVEAL GLUT, AND IT IS NOT WHAT I SAID IN SNG-373

I reported 143 `reveal` tags as an authoring imbalance. **The real cause is structural: the catalogue grew
as TRADITION × ARCHETYPE, so every sensing archetype costs 26 abilities to complete.**

**Four sensing archetypes × ~9 traditions each = 36 abilities that are one craft four times.**

⛔ **So "author fewer reveals" was the wrong prescription and "author more conceal" is only half right.**
The counter-imbalance is real (204 vs 43) — **but the sensing side is inflated by replication, not by
over-authoring.** ⚠️ **Collapse the archetypes and the ratio moves without deleting a single player-facing
craft.**

---

## §3 — THE PROPOSAL, and it is NOT "merge them"

⛔ **Do not collapse `deathsense` and `hour_sense` into "Sense".** The names, the idiom and the tradition's
voice are the reason any of this is worth playing — **that is exactly the flavour Erik has been protecting
all session.**

**Three options, and I recommend the third:**

| | | |
|---|---|---|
| **(a)** keep as-is | 87 separate crafts, mechanically identical, maintained in 87 places | ⛔ status quo; every balance change is 87 edits |
| **(b)** true merge | one craft, tradition supplies flavour text | ⛔ **guts the distinctiveness. Reject.** |
| **(c)** ⚠️ **ARCHETYPE + IDIOM** | the archetype carries the MECHANIC; the ability carries the NAME, the prose, the source and the tradition's constraint | ✅ |

**Under (c) nothing a player sees changes.** They still learn *Deathsense*, not *Sense (Ashwarden)*.
**What changes is that `mechanic`, `shape`, harm rungs and rank structure live once**, and the ability
declares `archetype: "reading"` plus its own idiom and `cannot`.

**Mechanic definitions to maintain: 249 → 175.**

⚠️ **AND IT IS THE SAME SHAPE AS SCHOOLS, WHICH ERIK ALREADY RATIFIED.** SNG-193: *"a school NEVER grants
exclusive abilities — the moment it does it becomes a subclass and the tradition fractures."* **An
archetype is that rule applied to mechanics instead of access: shared skeleton, per-tradition expression.**

## §3a — What makes two abilities the same archetype

⛔ **Same `(shape, functions)` is the CANDIDATE test, not the answer.** Applying SNG-374 §2c:
**one archetype only if they share a MECHANISM, not merely a shape.**

⚠️ **A worked counter-example from the data:** `the_read_burn` (blazeborn) and `the_true_account`
(ashwarden) both sit in `reveal [foresee, reveal]`. **But one reads residual heat and the other reads
decline toward an ending. Same shape, different mechanism — they are not one archetype.** Whereas
`hour_sense` and `the_kept_count` genuinely are.

**So the 13 clusters are where to LOOK, not what to merge.** Each needs the mechanism test applied by
hand, and I expect the 87 to resolve into more than 13 archetypes and far fewer than 87.

---

## §4 — SEQUENCING: this belongs WITH the source classification, exactly as Erik said

⚠️ **Erik's instinct is right and the reason is stronger than convenience: source is the thing most likely
to split a cluster.** Two `reveal [foresee, reveal]` crafts that draw on **different sources** are almost
certainly different mechanisms — one reads a lattice record, the other reads a mind. ⛔ **Classifying by
source and clustering by archetype in the same pass means each check informs the other**, and doing them
separately would mean merging things the source pass would then have to split.

**Order:** the six bands → `power_sources.json` rebase → **then one combined pass: source per ability AND
archetype per ability**, with the mechanism test arbitrating.

⛔ **Nothing to build yet, and I am not authoring an `archetype` field before there is a consumer** — the
mistake I have made four times this week and once more in sequencing. **This is the analysis; the ruling
is Erik's.**
