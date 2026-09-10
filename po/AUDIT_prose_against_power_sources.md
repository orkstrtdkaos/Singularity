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
