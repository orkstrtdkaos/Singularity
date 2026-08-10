# SNG-407 — Locations snapped onto the land. **Erik was right and my §4 options were wrong.**

**Author:** Aevi (PO) · **Date:** 2026-08-10 · **Supersedes SNG-405 §4**
**Erik:** *"can't we just look for the nearest Coast for a place that needs a coast, then move it there?
…keep the land as ground truth now and move the locations slightly to fit the land."*
**Applied:** 11 locations moved in canon.

---

## §1 — ⛔ I NEVER MEASURED THE UNBOUNDED DISTANCE. THAT WAS THE WHOLE ERROR.

SNG-405 concluded that locations *"cannot be moved onto features"* and offered three expensive options,
one of which was regenerating the world.

⛔ **That conclusion came from a search CAPPED at 1.5°, then 4°. I never asked how far the nearest feature
actually is.** Measured properly:

| want | n | **median distance** | max |
|---|---|---|---|
| **coast** | 9 | ⛔ **3.0° — five walking days** | 4.9° |
| **river** | 12 | 6.9° (⚠️ **3 already there at 0.3°**) | 12.5° |
| **marsh** | 10 | ⛔ **30.2°** | 51.4° |

⚠️ **The coastal towns were five days from the sea the whole time.** I reported them as unreachable
because my search radius was smaller than the answer. **A bounded search that returns nothing is not
evidence that nothing is there** — and that is the sixth time this week I have concluded from the wrong
measurement.

---

## §2 — WHAT MOVED (limit 5°, "slightly" taken literally)

**11 in canon** — 7 coastal, 4 riverine, **every one 4–8 walking days:**

`the_harborward` 2.7° · `the_slow_stair` 2.8° · `the_underlight` 2.8° · `the_wellspring_deep` 2.8° ·
`the_lampless_market` 3.0° · `the_unlit_deep` 3.0° · `the_grief_house` 3.5° · `dusklow` 4.4° ·
`wellspring` 4.8° · `sunken_choir` 4.1° · `disputed_zone_fringe` 4.8°

⚠️ **`gen-disputed-zone-far-side` is staged, not in content** — it comes with the SNG-397 repair; its move
is in the map at 5.25°.

**Verified:** ⛔ **12 of 12 still on land, 0 collisions, 0 edges under a day.**

### §2a — One real collision, and it was a fiction problem

**`disputed_zone_fringe` and `gen-disputed-zone-far-side` snapped to the SAME river point.** ⛔ **They are
the two sides of the shimmer — being in one place would erase the thing that makes them two places.** The
second was pushed to the next distinct point on the same water.

---

## §3 — ⛔ WHAT I DID NOT MOVE, AND WHY

**The 10 marsh-wanting locations: median 30.2°, up to 51.4° — that is 50 to 86 walking days.**
The Hall of Mirrors is **84 days** from the nearest marsh; the Last Mask **86**.

⛔ **Those are not misplaced locations. Those are wrong biomes.** Moving a place 86 days is not "slightly",
it is exile. ⚠️ **The `fen` and `wetland_maze` authorship on those ten is what should change** — and that
is mine, not a terrain problem.

**The 5 far river-wanters** — the Cogitarium at 21 days, the Low Market at 21 — same reading, same limit.

---

## §4 — WHAT THIS COSTS YOU

**Worst connection change: 11.7 walking days** (`disputed_zone_fringe → radiant_plateau_edge`), against a
median edge of 28.5 days.

⛔ **`walkingDays` MUST BE RE-DERIVED, not preserved.** Erik's ruling is that the land is ground truth now,
so positions serve the terrain and travel times follow positions. ⚠️ **Anything that cached a distance
needs recomputing: the routed roads, the journey costs, `roadFactor` if it lands.**

**And the rebuild chain must re-run** — `worldPos` changed, so biome/density/nanite votes, the region
medoids, and the 36 place-name signatures all shift. ⛔ **The 8 local layouts re-measure too: three of the
moved locations have authored layouts and their river and uphill bearings are now different.**
