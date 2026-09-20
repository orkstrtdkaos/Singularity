# CORRECTION — the Slow Stair is not underground. It is the MOUTH, and the road is what runs below.

**CCode · 2026-09-20 · for Aevi and Erik. ⛔ Corrects `po/CCODE_20260920_map_answers_and_the_slow_stair.md` §1.**
The ruling stands; **the mechanism it needed is not the one I described.** Erik ruled (c) on my note, so he ruled
on a premise that was half wrong, and that is worth saying before it becomes the thing everyone remembers.

---

## ⛔ §1 — WHAT I SAID, AND WHAT THE RECORD SAYS

I wrote that the Slow Stair is *"an underground place"* and offered a declaration — `level`, or `subsurface: true`
— as the fix. ⚠️ **Then I read its own route.**

```
way_the_slow_stair · the_underlight → the_slow_stair · levels: -3, -2, 0
"⛔ THE WAY OUT, AND IT CLIMBS THE WHOLE WAY — days of it.
 The dark thinning by degrees until it is only evening."
```

And its own record: `worldPos: { colatitude: 67.8, longitude: 0, depth: 0 }`.

⛑ **It is the surface mouth of an underground country.** Depth 0 is not an authoring gap; it is the fact. **What
is below the surface is the ROAD.** Its single way descends to −3 before it climbs out, and nothing walks to it
across the ground.

⚑ **I had already found the vocabulary and mis-read which end of it applied**: 143 records carry `worldPos.depth`
and 18 are non-zero — `archive_hollow` −1, `gearsflat` −2, `the_unlit_deep` −5. The Slow Stair is 0 **because it is
at the top of the stair.**

---

## ⛑ §2 — SO THE RULE READS THE ROUTE, WHICH IS WHERE THE FACT LIVES

**A location whose EVERY way runs below the surface is not required to stand on the mainland.**

⛔ **Declared by content, not by the gate:** `region_maps.json` already carries `level` on every waypoint — your own
`_shapeFinding` put it there (*"`level` exists on `localMap` for interiors; a region map needs it too, because here
depth is not a detail of a building, it is the shape of the country"*). The gate reads what the world says.

Four places qualify today, and they are exactly the ones you would expect: **the_underlight, the_slow_stair,
the_harborward, the_unlit_deep.** One of them is off-mainland, so one is excused.

⚠️ **This is not a widened threshold.** Nothing about the land moved, no tolerance grew, and **a place with even
one surface way is still counted**. If someone later gives the Slow Stair a road, it re-enters the census that day.

⛑ **And the excuse is SAID, every run** — census-not-sentence, so an exemption can never quietly become a hiding
place:

```
· reached only from below, so not required on the mainland: the_slow_stair [-22.2,0]
  (of 4 declared: the_underlight, the_slow_stair, the_harborward, the_unlit_deep)
```

---

## §3 — RESULT

`content_ci` **green**, `verification_ledger` **green** (it mirrors content_ci, as you found). Baseline re-cut:
**the only known red left in the suite is §107**, which Erik has ruled on and which you have correctly said must
become a dial rather than a relaxed tolerance.

⚑ **Your "one ruling clears TWO suites" was right, and it cost less than you priced it at** — no content fix at
all. The world had already declared the thing; nothing was reading it.

— CCode
