# SNG-403 — Local layouts, and the detailing engine they are meant to seed

**Author:** Aevi (PO) · **Date:** 2026-08-09
**Erik:** *"author some locale positions for a location map… the docks in millbrook on the river, the
smithy, the fields… the results of a few authorings should probably be the basis for a local detailing
engine so that any place gets this treatment and new (discovered, minted, created) places do as well."*
**Shipped:** `content/packs/core/world/local_layouts.json` (`c0bbaae7`) — **4 settlements, 21 sites.**

---

## §1 — ⛔ THE LOCAL MAP IS NOT A FURTHER ZOOM. THE TERRAIN HAS NOTHING DOWN THERE.

The generator's finest feature is **~0.3° ≈ 33 km.** A village spans **~0.01° ≈ 1 km.** ⛔ **Zooming past
about 1.2° shows one smooth cell, which is exactly why SNG-391 capped the zoom there.**

**So the local frame is a NEW LAYER — but it is not invented.** The world layer already knows three things
at every point, and everything I placed is placed against them:

| gradient | source | measured at Millbrook |
|---|---|---|
| **river bearing + distance** | traced hydrology | **156°, 0.27° away** |
| **uphill bearing** | sample the generator's raw elevation in a ring | **210°** |
| **road bearings** | connections' `worldPos` | west −88°, east 91° |

⚠️ **Water trades go riverward. Terraces and orchards go uphill. Fields take the flat. Gates and markets
sit on the road bearings.** That is the whole rule set, and it produced four different-looking towns.

**Frame:** `localMap: { bearing, metres }` from the settlement centre — ⛔ **metres, not degrees**, because
degrees at 400 m are unreadable. Conversion is two lines and the frame stays the world's own.

---

## §2 — ⛔ AND THE SUB-PLACES WERE ALREADY WRITTEN. NOBODY MADE THEM PLACES.

Millbrook's own seed:

> *"Water wheels turn along the Echo River; terraced gardens climb the lower slopes. **The village well
> and the river dock are the two centres of daily life.**"*

⛔ **"Two centres" is a layout instruction and it has been sitting in the prose the whole time.** Same as
the water-words, the `imagePrompt`s, the `deathImagePrompt`s: **authored, unread.**

**Every one of the 21 sites cites either a measured bearing or a sentence already in the location's seed.**
⚠️ **That is the constraint the engine must inherit: a generated layout that cannot cite a gradient or a
line of prose is decoration.**

---

## §3 — THE FOUR SHAPES, chosen to be different on purpose

- **Millbrook** — two named centres; wheels *downstream* of the dock so boats are not fighting the race.
- **Echo River Crossing** — ⛔ **the bridge IS the centre**; every other site is which end you are on. The
  empty fisher shacks sit **upstream**, where the contamination is worst — the position states the reason.
- **Greyhearth** — a burying town's plan is its traffic. Receiving yard on the Crossing road; grounds
  **uphill, for drainage**; the Quiet Road pointing at the Quiet Ground, because **the two towns are one
  process.**
- **The Cogitarium** — ⚠️ **broke the frame, usefully.** See §4.

---

## §4 — ⛔ TWO FINDINGS THAT NEED YOU

### §4a — Interiors need a VERTICAL axis
The Cogitarium's two promoted places are an **entrance hall** and a **third terrace** — same footprint,
different heights. ⛔ **With bearing+metres alone they land on top of each other and the map says they are
the same place.** **`localMap` needs an optional `level`: 0 ground, positive up, negative below.** I have
authored `level: 0` and `level: 3` on the assumption you will take it.

### §4b — ⛔ A BRIDGE TOWN WITH NO RIVER
**`echo_river_crossing`'s nearest traced river is 3.83° away — about 425 km — and its entire identity is a
bridge over the Echo.** `waterauth.json` authors a river there; the built hydrology does not carry one to
it. ⚠️ **I placed the bridge on the fiction and flagged the gap rather than bending the layout around bad
data.** Worth a look when you are next in the rebuild.

---

## §5 — WHAT THE ENGINE SHOULD DO

1. **Measure the three gradients** at any settlement (§1). Cheap, and already possible.
2. **Read the location's own seed for named places** — ⛔ **a builder step, not a regex.** The water-word
   audit is the standing warning: a regex over prose finds words, not facts.
3. **Place by role against the gradients**, using the rules in §1.
4. ⚠️ **Every placement emits its reason.** The `why` on all 21 is not commentary — **it is the training
   signal and the review surface.** A layout nobody can argue with is a layout nobody can correct.
5. **Newly minted places get this on creation**, so a discovered place arrives with a local frame instead
   of acquiring one later.

⛔ **I would author perhaps four more before you build it** — a Deep Works town, a Reach, a fen settlement
and one of the Foothills waystations — because all four here are Valley-shaped and the rules should be
tested against ground that is not.
