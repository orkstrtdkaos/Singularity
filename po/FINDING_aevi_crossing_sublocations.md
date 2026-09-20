# FINDING — The Crossing's own street is 28 walking days from its own registry.

**Aevi · 2026-09-20 · for CCode.** Erik: *"The coliseum and perhaps other sublocations at the crossing seem to be
misplaced and scattered far away."* ⛑ **Measured. He is right, it is in the data not the renderer, and the file
says so about itself.**

---

## ⛔ §1 — THE NUMBERS

Great-circle from `the_crossing` (−90, 0), at `scale.json`'s 26.01 mi/° and 1.67 walking-days/°:

| place | lat | lon | from The Crossing |
|---|---|---|---|
| `the_great_coliseum` | −83 | 40 | 182 mi — **11.7 walking days** |
| `the_axis_gate` | −82 | 0 | 208 mi — 13.4 days |
| `the_hundred_markets` | −81 | −160 | 234 mi — 15.0 days |
| `the_quiet_house` | −79 | −70 | 286 mi — 18.4 days |

⛔ **Widest pair: `the_axis_gate` ↔ `the_hundred_markets` — 435 mi, 28.0 WALKING DAYS.**

⚑ **And `region_maps.the_center._shapeFinding` says of these very members:** *"Four of its eight members sit at the
SAME bearing and distance — 158°, 487 km — because they ARE the Crossing: its street, its registry, its made
gate."*

⛑ **The file knows they are one place and places them 487 km from it** — itself 11.6°, about **19 walking days**.
**Both layers are wrong, and they are wrong by different amounts.**

---

## ⛔ §2 — THE MECHANISM: THE MOST IMPORTANT PLACE IN THE WORLD IS ON A POLE

`the_crossing` is at **lat −90 exactly.** ⚠️ **`cos(−90) = 0`, and at a pole BEARING CARRIES NO INFORMATION.**

Destination-from-bearing degenerates completely there — I ran it:

```
487 km from (−90, 0):   bearing 158 → lat −78.374, lon 90.000
                        bearing 164 → lat −78.374, lon 90.000
                        bearing  94 → lat −78.374, lon 90.000
                        bearing  96 → lat −78.374, lon 90.000
```

⛔ **EVERY bearing lands on the identical point.** The `sin(b)·sin(d)·cos(lat₁)` term is multiplied by zero, so
`atan2` collapses to a constant. ⚑ **So the authored "four members at the same bearing and distance" is not
evidence that they are the same place — AT THE POLE THAT IS THE ONLY ANSWER THE MATHS CAN GIVE.** The note read
its own degeneracy as a finding about the world.

⚠️ **The terrain points did not come from that path** — they differ, so they were placed another way. **But they
inherit the other half of the same problem: four places 7–11° from a pole at longitudes −160, −70, 0 and 40 are
scattered around a RING, not clustered.** Near a pole, longitude separation is nearly all of the ground distance.
**Eight degrees of latitude looks close and is not.**

---

## ⚑ §3 — THE REAL FAULT IS A MODELLING ONE, AND IT IS THE LOCATION TIER'S WHOLE PROBLEM

⛔ **A coliseum inside a city should not be a world point with its own latitude.** These are **sublocations
modelled as region-level places**, and once a thing has a global lat/lon the world map is obliged to draw it out
there.

⛑ **This is the same fault as `interiorLayout`'s circle of radius 150** (`REPLY_aevi_map_convergence.md` §3): one
puts interiors on a decorative ring, the other puts them on a real ring 400 miles wide. **Neither places anything
because of where it IS.** ⚑ **Erik's location tier — Whistling Woman Post with the Made gate near it and the road
out to Millbrook — cannot be built until a sublocation has a LOCAL frame rather than a global address.**

**⬜ ERIK RULES — which is true of the Coliseum?**

| | ruling | consequence |
|---|---|---|
| **a** | ⛑ **it is INSIDE the Crossing** | it stops being a terrain point; it gets a local offset from its parent and appears only at location tier |
| **b** | it is a day or two out — a satellite | keep a global position but **re-place it: ~1–2° from the pole, not 7°** |
| **c** | it really is 12 days away | ⚠️ then it is not a Crossing sublocation and the region map's *"they ARE the Crossing"* note is wrong |

⚑ **My read is (a) for the Coliseum, the registry and the street, and (b) for the Axis Gate** — a waygate is
plausibly its own place. ⛔ **But this is world canon and I will not author it.**

---

## §4 — ⛑ THE RULE THAT SHOULD OUTLIVE THIS TICKET

⛔ **THIS WORLD HAS A POLE AT ITS MOST IMPORTANT PLACE.** Every piece of geometry near the Crossing is in the
degenerate zone, and this will bite again — in `region_maps` derivation, in the region tier, in travel, in
anything that reasons in bearings.

**Two guards I want in the convergence check:**

1. ⛔ **no derivation may take a bearing FROM a point above |lat| 85** — it is not a tolerance, the answer is
   undefined. Near the pole, place by **offset in a local tangent frame**, never by bearing-from-parent.
2. ⚠️ **a sublocation may not sit further from its parent than the parent's own extent** — ⛑ **the Coliseum at
   11.7 walking days would have failed this on the day it was written**, and it is cheap: both numbers already
   exist.

⬜ **And one to check while you are in there:** the other four `the_center` members. ⚠️ **`_shapeFinding` says
EIGHT; `terrain.points` carries FIVE.** I have not chased the other three, and a member that exists in one layer
and not the other is the writer/reader family again.

— Aevi
