# SNG-427 — ⛔ STOP. The Echo River towns are not on the Echo River.

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"I'm pretty sure Millbrook is the town closest to the Echo River crossing… that's why the
crossing exists. We should take a look at the entire region to make it make sense before we finalize."*
**He is right, and it is worse than he thought.**

---

## §1 — THE MEASUREMENTS

| | |
|---|---|
| **Millbrook → Echo River Crossing** | ⛔ **1,382 miles — 89 walking days** |
| Echo River Crossing → nearest water | ⛔ **100 miles.** It is a bridge. |
| Archive Hollow → the crossing it is *"upstream of"* | ⛔ **1,045 miles** |
| Millbrook → nearest water | 7 miles, and its seed says wheels turn **along** the river |
| the traced Echo (110.8° long) → nearest of these towns | **218 miles** |

⛔ **FOUR TOWNS NAMED FOR ONE RIVER, NONE OF THEM ON IT, AND UP TO 1,382 MILES APART.**

---

## §2 — WHAT I DID WRONG

⛔ **I authored a region map, a road network and a local layout on top of geography that does not hold
together, and I did not check the geography first.**

Worse: **I had the evidence and read past it.** SNG-403 flagged that `echo_river_crossing`'s nearest river
was 3.83° away and I wrote *"I placed the bridge on the fiction and flagged the gap."* ⚠️ **I flagged it
and then built four more layers on top of it.**

**And Erik caught two more in the same look:**
- ⛔ **The well is at 0,0 with the river 11 miles away** — so Millbrook's dock, at 300 m, reaches water
  that is 11 miles off. **The local layout is incoherent on its own terms.**
- ⛔ **`road_river_road` (Crossing→Switchback, secondary) parallels Crossing→Thornwake→Switchback (main).**
  A secondary road duplicating a main route is a network error, not a style choice.

---

## §3 — ⚠️ ALSO: THE "CROSSING" AMBIGUITY, AGAIN

Eight locations match *"the crossing"*. **Four of them mean THE CROSSING, the place** — Greyhearth, the
Axis Gate, the Low Market, the Made Gate — **not a river crossing.**

⛔ **That is the third time this exact ambiguity has cost me**: the water-word regex, the `gen-object-object`
repair, and now this. **"The Crossing" is a proper noun in this world and a common noun in English.**

---

## §4 — THE FIX, AND IT IS ERIK'S CALL

**Place the Echo cluster ON the Echo, as a cluster:**

1. **Echo River Crossing** goes to the traced Echo where the channel narrows.
2. **Millbrook** goes a short way downstream — ⛔ **the crossing exists because the town is there.**
3. **Archive Hollow** goes upstream of the crossing, as its seed says.
4. **Waystone** — *"the masons build the crossing"* — near enough to be the builders' outpost.

⚠️ **This is bigger than SNG-407's eleven moves: these are hundreds of miles, not five days.** ⛔ **But
Erik's standing ruling covers it — world geography outranks unanchored play memory — and the fiction here
is not a memory, it is authored text that the placement contradicts.**

**After that, and only after that: the region map and roads are worth finalising.**

---

## §5 — AND I SHOULD STOP DRAWING

Erik: *"if you don't have the capacity to make a nice looking town map, then maybe just keep the locations
and layout ready to hand to ccode."*

⛔ **Agreed. My renders are diagnostics, not deliverables** — they were useful for catching the scale error
and the stacked labels, and they are not what a player should see. **The authored data goes to CCode; the
drawing is his.**

⚠️ **What the local tier still needs from me, and does not have:** woods, fields, the built-up area, and a
river with banks and bends rather than a straight band. **That is authoring, not rendering, and it is
worth doing — after the towns are on the river.**
