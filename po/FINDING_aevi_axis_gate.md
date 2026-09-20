# FINDING — The Axis Gate: it is the Crossing's gate, it is 13 days outside the Crossing, and the reason is a unit.

**Aevi · 2026-09-20 · for CCode.** Erik ruled the Coliseum and the rest are IN the Crossing, then asked three
things about the Axis Gate. ⛑ **All three are answered by its own file.**

---

## ⛔ §1 — "WHY IS IT OUT AWAY FROM THE HUB?" — IT WAS NEVER MEANT TO BE

`content/packs/valley/locations/the_axis_gate.json`:

```json
"parentId": "the_crossing",
"worldPos": { "colatitude": 8, "longitude": 0 },
"worldPosNote": "The hub's gate. As near the pole as a built thing gets."
```

⚑ **It is a CHILD of the Crossing, exactly like the Coliseum, and the note states the intent in plain words.**
⛔ **Then the authored number puts it 208 miles — 13.4 WALKING DAYS — away.**

⚠️ **THE CAUSE IS A UNIT, AND IT IS THE `walkingDays` TRAP WEARING A DIFFERENT HAT.** On a colatitude scale where
**90** is a pole locus, **8 reads like "practically at the centre."** It is not a percentage. It is degrees, and
this sphere is 2400 km:

| authored | ground | on foot |
|---|---|---|
| colatitude **1** | 26 mi | ⛑ **1.7 days — THIS is "the hub's gate"** |
| colatitude 2 | 52 mi | 3.3 days |
| colatitude 4 | 104 mi | 6.7 days |
| ⛔ **colatitude 8** (authored) | **208 mi** | ⛔ **13.4 days** |

⛑ **The prose and the number contradict each other and the number won.** Nothing was mis-derived — **a small-looking
figure was written for a small-sounding distance.**

---

## §2 — "WHAT IS NEAR IT?" — ⛔ NOTHING, AND THAT IS THE TELL

| | distance | |
|---|---|---|
| `the_great_coliseum` | 135 mi · **8.7 days** | ⚠️ its own sibling — **which Erik just ruled is INSIDE the Crossing** |
| `the_crossing` | 208 mi · 13.4 days | ⛔ **its own PARENT** |
| `the_quiet_house` | 290 mi · 18.6 days | same broken cluster |
| `the_hundred_markets` | 435 mi · 28.0 days | same broken cluster |
| `radiant_plateau_edge` | **536 mi** · 34.4 days | ⛑ **the first thing that is genuinely a different place** |

⚑ **Everything within 450 miles of the Axis Gate is the Crossing wrongly scattered. Past that there is five
hundred miles of nothing.** ⛑ **So "what is near it" answers itself: the Axis Gate is not near anything, because
the only things that should be near it are the ones this ticket is about.**

**As a substrate source it is alone too, and correctly so.** It is a crystal well (`delta +0.16`) and **the nearest
other source is Waystone at 596 miles.** Its own reason says why that is right rather than wrong:
*"Every waygate in the world routes through here. The traffic itself keeps the lattice thick."* ⛑ **A pool fed by
traffic, not by neighbours — the one thing about this place that is working as authored.**

---

## ⚑ §3 — "WHY IS IT AXIS GATE?" — THE TWELVE, NOT THE PLANET'S

⛔ **Not the rotational axis. The twelve DISPOSITION axes** — the same twelve that `axisVector` carries.

> *"Twelve roads leave the Crossing, one per axis, each running out toward a pole and its opposite beyond. Stand at
> the Gate and you can see, faintly, the direction of every people in the world… Every journey in this world begins
> and ends at the Axis Gate."*

> *"A wide paved circle at a crossroads where twelve roads leave in twelve directions, each marked by a tall
> standing pillar."*

**It is where you choose which axis you walk.** 25 `connections` — **nearly every waygate in the world terminates
here.** Its own lean is slight: `space_time −0.3`, `poleIntensity space 0.3`.

⛑ **And the name is earned twice over, which I suspect was not planned: the Crossing sits ON the planet's axis, so
the Gate of the twelve axes stands essentially at the world's own.** ⚑ **Worth keeping. It costs nothing and it is
the kind of thing a reader notices once and never forgets.**

⛑ **A gate belongs IN the thing it is the gate of** — a city gate is in the city. **So Erik's ruling covers it
without strain: the Axis Gate is the Crossing's gate, at the EDGE of the Crossing's own extent**, and the twelve
roads radiate from it. ⚠️ **And the twelve roads run toward the axes' POLES — real places — not compass bearings,
so they sidestep the pole degeneracy in `FINDING_aevi_crossing_sublocations.md` §2 entirely.** **That part of the
design is sound; only the number is wrong.**

---

## ⬜ §4 — WHAT I RECOMMEND, AND WHAT IS ERIK'S

⛑ **Recommend: `colatitude 8 → 1`** — 26 miles, 1.7 days, the edge of the Crossing's ground. It honours
`worldPosNote` as written and needs no new concept.

⚠️ **Not mine to just do.** `radiusWorld 0.09` was *"chosen by sweep against the authored worldPos"*, and the file
warns that a mis-scaled radius **"blankets a whole region… and renormalization cancels the field flat — the failure
CCode measured and reverted."** ⛔ **Move the position and the sweep that justified the radius no longer holds.**
**CCode: re-sweep after the move, do not carry 0.09 across on faith.**

⬜ **And the same question now stands for every child of the Crossing** — the Coliseum at colatitude 7, the Quiet
House at 11, the Hundred Markets at 9. ⚑ **The pattern says these were all written with the same wrong intuition
about what a colatitude degree costs on foot.**

— Aevi
