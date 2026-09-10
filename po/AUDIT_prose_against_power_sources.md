# AUDIT — thirteen places whose prose claims a power that starves there

**Aevi (PO) · 2026-09-09.** ⬜ **Found by Erik, in the field prototype, in about a minute.**
> Erik: *"What is The Thinning? It is high substrate right now where I would expect it to be **high veil** —
> if it means that kind of thinning. **Have you compared the authored locations against the new
> understanding of power sources to make sure they make sense?**"*

⛔ **NO, AND THE ANSWER IS THIRTEEN.**

---

## §1 — ⛑ THE THINNING IS THE CLEAREST CASE AND ERIK NAMED IT FROM A COLOUR

**Its own description:** *"A settlement where **THE VEIL IS THIN ENOUGH TO FEEL** and the residents have
stopped finding that remarkable."*

| | |
|---|---|
| its region | `the_numinous_reach` |
| ⛔ **density** | ⛔ **0.82** |
| veil needs | **−0.10 to 0.30** |

➡️ ⛑ **A SETTLEMENT NAMED FOR THE THINNESS OF THE VEIL IS ONE OF THE WORST PLACES IN THE WORLD TO WORK
VEIL CRAFT.**

---

## §2 — ⛔ AND IT IS SYSTEMATIC, NOT SCATTERED

**Every region whose NAME promises thinness is thick:**

| region | density | |
|---|---|---|
| `manifest_domain` | 0.90 | ⛔ |
| `the_kept_reach` | 0.84 | ⛔ |
| ⚠️ **`the_numinous_reach`** | **0.82** | ⛔ |
| `the_veiled_reach` | 0.66 | ⛔ |
| `umbral_depths` | 0.58 | ⛔ |
| `the_feeling_coast` | 0.48 | ⛔ |
| ⚠️ **`foothill_thinwater`** | **0.40** | ⛔ **a town called THINWATER** |

⛑ **AND THE FIVE REGIONS WHERE VEIL ACTUALLY WORKS ARE ABOUT SOMETHING ELSE ENTIRELY:** the Quickwood
(0.12), the Riven Marches (0.20), the Somatic Reaches (0.22), Unspooling (0.28), the Given Land (0.30).

⛔ **THE BEST VEIL GROUND IN THE WORLD IS THE QUICKWOOD — AND THE CORPUS SAYS WHY IT IS THIN, AND IT IS
NOT THE VEIL:**

> *"The Rootkin did not merely go back to nature — **they grew a country the lattice cannot get purchase
> in.** It is the single lowest-substrate region in the world (0.12) and **that is not an accident. It is a
> fortification.**"*

⚠️ **A DELIBERATE ANTI-LATTICE FORTRESS IS ACCIDENTALLY THE BEST DOORWAY IN EXESA.**

---

## §3 — ⬜ THE THIRTEEN

| place | claims | density | needs |
|---|---|---|---|
| `the_thinning` | veil | 0.82 | −0.10–0.30 |
| `dw_the_thinedge` | veil | 0.90 | |
| `the_slow_stair` | veil | 0.58 | |
| `wellspring` | veil | 0.48 | |
| `thinwater` | veil | 0.40 | |
| `the_old_warden_post` | veil | 0.32 | ⚑ **near-miss — 0.02 out** |
| `the_figure_works` | metaphysical | 0.85 | −0.07–0.37 |
| `the_kept_shrine` | metaphysical | 0.84 | |
| `the_lampless_hermitage` | metaphysical | 0.82 | |
| `the_lampless_market` | metaphysical | 0.58 | |
| `sunken_choir` | metaphysical | 0.46 | |
| `the_stillhold` | nanite | 0.20 | 0.70–1.10 |
| `the_middle_way` | nanite | 0.22 | |

---

## §4 — ⚑ AND THE DIAGNOSIS IS THE ONE ALREADY IN THE SPECS

⛔ **THIS IS NOT THIRTEEN AUTHORING MISTAKES. IT IS ONE MISSING FIELD, THIRTEEN TIMES.**

⚠️ **`SPEC_six_fields_and_their_keepers` §1: of six power sources, ONLY PRECURSOR AND NANITE HAVE THEIR OWN
GEOGRAPHY.** ⛑ **Veil and metaphysical read the PRECURSOR density through a band** — so *"where the veil is
thin"* is being scored against *"how thick the lattice is"*, ⛔ **and the two are not the same axis.**

⚑ **THE AUTHORS WERE RIGHT EVERY TIME. The Thinning IS thin — in the veil.** ⚠️ **It sits in a Reach dense
with meaning and apparatus, which is exactly what a numinous Reach should be**, and the model has one number
for both.

➡️ ⛑ **THE THIRTEEN ARE NOT A LIST TO FIX. THEY ARE THE MEASUREMENT THAT `veilField` AND `meaningField` ARE
LOAD-BEARING RATHER THAN TIDY.**

---

## §5 — ⬜ SO THE TUNING TARGET IS NOW CONCRETE

⚑ **When Aevi authors `veilField.byRegion` for 39 regions, THESE THIRTEEN ARE THE FIXTURES:**

| ⬜ must come out | |
|---|---|
| **the_numinous_reach** | ⛔ **HIGH veil AND high meaning AND high precursor.** ⚠️ **A thin place can be a thick place — that is the entire point of separate fields** |
| **foothill_thinwater** | high veil. Its name is a promise |
| **umbral_depths · the_veiled_reach** | high veil |
| ⚠️ **the_quickwood** | ⛔ **LOW veil, despite being the thinnest LATTICE ground.** ⛑ **The Rootkin grew a country the lattice cannot hold — that is not a door, it is a WALL. It should be the worst veil ground in the world, not the best** |
| **the_stillhold · the_middle_way** | ⬜ nanite is `naniteField`'s already and reads `wild`/`clear` there — ⚠️ **worth re-reading the prose: they may claim ORDER rather than nanite** |

⛔ **AND THE OLD WARDEN POST IS 0.02 OUTSIDE THE BAND** — ⚑ **the one entry on this list that a tuning pass
fixes rather than a new field.**

---

# ⛔ CORRECTED — AEVI HAD THE MODEL BACKWARDS, AND THE DATA WAS ALWAYS RIGHT

> **Erik: *"The Veil is the BARRIER. The power source veil is strongest where the Veil is THINNEST — and the
> veil is thinnest in the nexus locations or any location that DOESN'T have crystal substrate nearby (nor
> ordered nanite, which also bolsters the veil thickness)."***

⛑ **HE IS RIGHT, AND `the_veil.json` SAYS IT IN THE SAME WORDS:**

> ⛔ *"THE VEIL IS THE DIVIDE between this side and the other side… **powered by an ABSENCE, not a
> substance** — **the MIRROR of precursor**."*
> ⛔ *"precursor lattice work **STRENGTHENS** — THE SUBSTRATE SOLIDIFIES THE DIVIDE. Every line laid, every
> seal held, every waygate kept is **the Veil made thicker.**"*

## ⚠️ SO THE BAND MODEL IS CORRECT AND §4 OF THIS AUDIT WAS WRONG

⛔ **AEVI CONCLUDED *"veil needs its own field because it is being scored against the wrong axis."*** ⛑ **IT
IS NOT THE WRONG AXIS. IT IS THE MIRROR OF THE RIGHT ONE**, and that is authored canon, not an accident of
the band table.

⚑ **`veil` at 0.10 ± 0.20 IS `1 − precursor` EXPRESSED AS A BAND.** ⚠️ **Thin lattice = thin divide = strong
veil craft. The model has been saying exactly what Erik just said.**

## ⛑ AND THE QUICKWOOD IS NOT BACKWARDS. IT IS THE BEST STORY IN THE AUDIT.

**Aevi wrote: *"a deliberate anti-lattice fortress is accidentally the best doorway in Exesa"* and called it
wrong.** ⛔ **IT IS NOT WRONG. IT IS TRUE, AND NOBODY IN THE FICTION HAS NOTICED.**

> *"The Rootkin did not merely go back to nature — **they grew a country the lattice cannot get purchase
> in.** It is a fortification, and the Lattice-Cities know it."*

⚑ **THEY BUILT A WALL AGAINST AKINETOS AND IT IS A DOOR FOR EVERYTHING ELSE.** ⚠️ **The single lowest-lattice
region in the world is the single thinnest divide in the world** — ⛑ **and `the_quickwood` is `wild` nanite,
so nothing is bolstering it either.** ⛔ **That is a campaign, not a bug.**

## ⬜ WHAT SURVIVES OF THE THIRTEEN

⚠️ **They are still a real finding — but they are PROSE errors, not model errors.**

| ⛔ genuinely wrong | ⚑ why |
|---|---|
| **`the_thinning`** at 0.82 | ⛔ *"where the veil is thin enough to feel"* — **it is one of the THICKEST divides in the world.** ⚠️ Either the prose moves or the place does |
| **`dw_the_thinedge`** at 0.90 | ⛔ same, worse |
| **`thinwater`** at 0.40 | ⚠️ a town named for thin water sitting above the band |
| **`the_veiled_reach`** 0.66 · **`umbral_depths`** 0.58 | ⛔ **Reaches named for the veil where the divide is thick** |
| ⚑ **`the_old_warden_post`** 0.32 | **0.02 outside — a tuning nudge, not a rewrite** |

⛑ **AND THE FIVE METAPHYSICAL ROWS ARE A DIFFERENT QUESTION ENTIRELY** — ⚠️ **meaning is NOT the mirror of
precursor and has no reason to track it at all.** ⛔ **`the_kept_shrine` at 0.84 claiming meaning is the case
where a separate field IS still warranted**, and Aevi should not have bundled the two.

## ⬜ AND THE SPEC CHANGES

⛔ **`SPEC_six_fields_and_their_keepers` OVERSTATED THE JOB.** ⚑ **Veil does not need an independent field —
it needs:**

```
veil = f( LOW precursor, NOT-ordered nanite ) + authored NEXUS pools
```

⚠️ **Which is a DERIVED field plus a short authored list, not 39 hand-tuned regions.** ⛑ **`meaning` still
wants its own — shrines and memorials have no relationship to lattice density.**

⛔ **AND THE NEXUS LIST IS NOW THE WHOLE OF THE AUTHORING JOB FOR VEIL:** ⚠️ **a door somebody built is the
one thing the formula cannot derive**, and `the_thinning` should be the first one — ⛑ **which makes its
prose true again without moving a single density.**
