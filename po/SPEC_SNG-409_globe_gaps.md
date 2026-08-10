# SNG-409 — What the world map still needs to DO

**Author:** Aevi (PO) · **Date:** 2026-08-10 · **Rev 2**
⚠️ **REWRITTEN AS OBJECTIVES.** Rev 1 specified methods — "import terrain.mjs", "use a tangent disc". Erik:
*"spec for intended objective, not how to do something… he might come up with a better solution."* He is
right, and my methods were just the first thing that worked in a prototype. **Each item below is an
OUTCOME plus the evidence for why it matters plus a test that says it is done. The approach is yours.**

---

## §0 — WHAT IS ALREADY WORKING

`engine/localdetail.mjs` is **ahead of my spec** — it consumes `basis` and `level`, which I added only
after measuring. ⚠️ **It took the corrections, not just the first draft.** SNG-404 is largely built.

`worldglobe.js` has cursor-anchored zoom, absolute elevation range, region seats and the baked layers.

---

## §1 — ⛔ OBJECTIVE: THE MAP RESOLVES AS YOU ZOOM

**Today it does not.** Type, nanite and biome are baked at **480 × 240** — roughly **ten cells across the
screen at a 5° view.** ⛔ **The map is a picture that gets bigger, not a world that resolves.**

**Done when:** at any zoom down to the ~1.2° floor, the visible ground shows detail proportional to the
view rather than the bake. **Test: compare a 40° view and a 4° view — the 4° should reveal features the
40° could not have contained.**

⚠️ **Constraint, not method: whatever produces the detail must agree with the baked layers**, or the base
and the detail draw different worlds. **I hit that as a visible seam and measured it at 2.44% disagreement.**

---

## §2 — ⛔ OBJECTIVE: THE CROSSING RENDERS CORRECTLY

**It sits at latitude −90 EXACTLY** — the world's centre, and the point every player looks at first.
⛔ **At a pole every meridian converges: a full 360° of longitude spans zero distance.**

**Two failures I measured and fixed in the prototype, both of which return if this is not handled:**
- **radial starburst** — anything treating the pole as ordinary ground fans terrain outward
- **a wedge of bare globe** — anything capping longitude span leaves the rest uncovered

**Done when:** the Crossing looks like ground from orbit to the zoom floor. **Test: sample around rings
centred on it — variation should run outward at roughly the same rate as it runs around. I used an
angular/radial ratio and treated anything above ~1.5 as streaked.**

---

## §3 — ⛔ OBJECTIVE: THE THREE NETWORKS ARE VISIBLY INDEPENDENT

**Roads and precursor lines are both absent from the globe.** ⚠️ **This is not decoration — it is a
measured argument.** Waygates are only **1.1× closer to substrate sources than chance**, 2 of 26 within 3°.

⛔ **Precursors laid the lines, someone else built the gates, and people walk neither. That is why
`wake_the_line` exists as a craft — you only rouse a road nobody has been using.** **The map is the only
place a player can see it.**

**Done when:** a player can see that the roads, the gates and the buried lines do not follow each other.

---

## §4 — ⛔ OBJECTIVE: A POLE NEVER READS AS A TOWN

`location_kinds.json` (`f061921f`) is authored for all 135 and **has no reader.** **`tier` is size, `role`
is function, `kind` is SHAPE.**

⛔ **Twelve locations are `pole`** — the Blaze, the Scouring, the Numen, the Unfallen. **They are pure
extremities of an axis, not settlements, and a settlement icon would lie about the most dangerous places
in the world.**

**Done when:** a waygate, a village, an underplace and a pole are distinguishable at a glance.
⚠️ **The 34-kind vocabulary is mine and negotiable — if it is too fine to draw, tell me which distinctions
are not worth an icon and I will collapse them.**

---

## §5 — ⛔ OBJECTIVE: A CONTESTED AREA LOOKS LIKE AN AREA

**No location in this world has a boundary** — all 135 are points, including the 25 marked `tier: region`.
A contested territory currently looks like a village.

`areas.json` (`545e61e0`) has the Disputed Zone as an ellipse with two foci and `k = 1.35`.

⚠️ **One constraint that IS load-bearing: membership must be computed, not read from `parentId`.** ⛔ **Only
1 of the Fringe's 8 children is actually in the band; the other 7 span 288° of longitude.** The graph is
wrong by measurement.

**Done when:** the zone reads as a band with no clean edge — the fiction says shimmer-vortices *wander*.

---

## §6 — ⛔ CANON MOVED. THE REBUILD MUST FOLLOW.

**SNG-407 moved 11 locations** onto real coast and river, 4–8 walking days each, worst connection change
**11.7 days**.

⛔ **`walkingDays` must be RE-DERIVED, not preserved.** Erik ruled the land is ground truth, so travel
follows position. **Anything caching a distance is stale**, and three moved locations have authored local
layouts whose river and uphill bearings have changed.

**⛔ STANDING RULING (Erik, 2026-08-10): WORLD GEOGRAPHY OUTRANKS UNANCHORED PLAY MEMORY.** A remembered
distance from before the terrain existed is a remembered feeling, not a measurement. ⚠️ **It does NOT
demote play-authored CONTENT** — the Made Gate, the Watershed Road and the Far Side are canon for what
happened in them. **Only remembered POSITIONS yield.**

---

## §7 — TWO OPEN QUESTIONS THAT ARE MINE, NOT YOURS

- **`placenames` has 2 unresolved**, and the asset's detected `features` (5 seas, 16 ranges) is a different
  set from my names (4 seas, 12 ranges). ⚠️ **A detected range with no name should render unlabelled
  rather than mislabelled** — I will close the gap.
- **The 10 marsh-authored towns sit a median 30° from any marsh.** ⛔ **Those are wrong biomes, not
  misplaced towns**, and re-authoring them is mine.

---

## §8 — PRIORITY, AND WHY

**§1 first** — several other items are hard or pointless without detail at zoom. **§2 second**, because the
Crossing is where players look first and the failures there are ugly. **§4 third** — Erik asked directly,
the content is ready and it is contained. Then §3, §5, §6.

⚠️ **If you disagree with that order because of what the code actually looks like, take your own.** **I can
see the outcome I want; you can see what it costs.**
