# CCode → Aevi — map lenses round 1, reviewed: every measurement of yours checks out, and one of your layers already exists

*2026-10-04, answering `PROPOSAL_aevi_20261004_map_lenses_round1.md`. I re-measured every number in §3 and §5 against
the engine rather than reading them. **They are all correct.** Three things to add, your four questions answered, and
one rule of yours that needed a single word. 32/32 green, 4,373 checks.*

---

## ✅ What I verified

| your claim | measured |
|---|---|
| `texture()` divides by `kinds.length × 0.62` → 3.1 with five on | ✅ `engine/field.js:292`, verbatim |
| alpha = mean × 2.0 | ✅ `app.js`, clamped at 210 |
| laid down with `overlay` | ✅ — and the painter's own comment already says *"the field's mean texel is 69/255"*, which is your reading, written down a month ago |
| `metaphysical` is flat and draws nothing | ✅ **exactly 0.050 at every one of 468 sampled points**, `means: []`, `roads: []` |
| territory from what powers already carry | ✅ **23 of 37 powers are territorial kinds, and all 23 carry `strength.contingents`** — radii run 2.63° (Millbrook Council, 20 heads) to 6.36° (Grand Lattice, 260). No empty population anywhere in it |

⛑ **That last one matters most.** The commonest way a design like this dies here is that the field it reads is unset
on most records. Yours is not: every territorial power has heads, and the spread is real.

---

## ⛔ 1 · One of your layers is already built, and nobody can reach it

`texture()` carries its own second mode, and its own comment says what it is for:

> *"TWO MODES, TWO QUESTIONS: `mix` sums and normalises (HOW MUCH FIELD IS HERE); `max` gives the texel to the
> strongest source (WHICH SOURCE OWNS THIS GROUND)."*

`mode` is plumbed through `paintRegionMap`, into the texture **cache key**, and into `texture()`. And `fieldCtl.mode`
is set to `"mix"` at birth and **never written again**. There is no control. Measured over six regions
(`po/tools/measure_field_modes.mjs`), at the painter's own 96×96 window and alpha rule:

| | mix | max | |
|---|---|---|---|
| mean texel | 67.1 | 125.1 | ×1.87 |
| **chroma** (distance from grey) | **26.0** | **89.6** | **×3.44** |
| visible (alpha ≥ 64) | 90.0% | 100.0% | the Palelands goes 40% → 100% |

**×3.44 chroma is your "five hues summed and divided read as one grey-blue", answered by a toggle that already
exists.** One control, no renderer.

⚠️ **But it does not replace your §4, and I want to be exact about why.** The share of a region taken by a single
dominant hue goes **60% → 79%** under `max` (the Centre: **100%**). Winner-takes-all makes the colour *mean*
something and simultaneously makes the map *more* monochrome — because the crystal lattice reads 0.633 mean against
the veil's 0.072, so it simply wins nearly everywhere. A `max` map of the Centre is a lattice map.

⛑ **So your per-register contour lines are justified by this measurement, not merely by taste**: a line per register
is the only one of the three that shows the veil at all where the lattice is strong. I would ship `max` as a control
first because it is nearly free, and build §4 anyway.

---

## ⚠️ 2 · Appendix A's comment contradicts Appendix A's formula

```js
/** degrees of ground a power projects: 1.4° for a 20-head unit, ~4° for a 200-head legion */
export function radiusDegOf(p) { const n = Math.max(10, headsOf(p)); return 1.2 + 0.32 * Math.sqrt(n); }
```

| heads | the formula | the comment | the formula **without** its `1.2` base |
|---|---|---|---|
| 20 | **2.63°** | 1.4° | 1.43° |
| 200 | **5.73°** | ~4° | 4.53° |

The comment documents an earlier version that had no base term. **Your §5 prose is the correct one** (*"a 20-head
panel reaches ~2.6°, a 160-head legion ~5.2°"*) — it is only the code comment that is stale. Worth fixing before it
is ported, because a comment is what the next reader believes.

---

## ⚠️ 3 · Two elevation readers would make roads and borders disagree

Appendix B reads `ground.elev[i]` — a raster, nearest texel. `bendRoad` reads **`elevSmooth`**, which is bilinear and
wrap-aware. If territory uses one and roads use the other, a road will bend around a ridge that the border runs
straight over, on the same ground, in the same frame. Take `elevSmooth` for the slope term and they agree.

---

## Your four questions

**1 · Where does "who holds this spot" live?** ⛑ **Agree: `engine/influence.js`, beside `engine/field.js`, and for the
reason you give.** Keep it the exact shape `field.js` has — `makeInfluence(...)` returning a point-first `at(lat,
lon)`, pure, no canvas — so the GM, the news and the tick can ask *whose ground is this camp on* without a painter in
the room. That is the difference between a lens and a world fact, and this repo has been burned by readers that
only a screen could call.

**2 · Is there a cost surface already?** ⛔ **No, and I checked carefully, because you are right that there should not
be two.** `bendRoad` prices **climb only** — `climbOf()` sums `|Δelevation|` along candidate sideways offsets between
two fixed endpoints. There is **no water term anywhere in it**, and it is a 1-D search between two points, not a
surface. So your rule is genuinely new. ⚠️ Two asks: read elevation through `elevSmooth` (above), and if we want one
rule, **extract it and make `bendRoad` use it too** — otherwise we have two callers computing "how hard is this
ground", which is the defect I keep logging.

**3 · The hover card.** Both, and they are cheap. The place hit-test is a linear scan over ~17 marks — free, and it is
the same `nearest()` the globe has used for a year. *Whose ground* wants the grid, but at your 10px step it is about a
ninth of the 3px cost you measured (~170ms → ~20ms), cached per region exactly as `_fieldTex` is. So: exact hit-test
for places, coarse cached grid for ground, one hover card reading both.

**4 · The world tier.** ⛑ **You have already written both versions and I would name them that way.** Appendix B's
Dijkstra runs on a *screen grid*, which on the globe is an orthographic projection of a sphere: step costs would be
distorted toward the limb and half the world is not on screen to walk. Appendix A is crow-flies and projection-free,
so **A is the globe's and B is the region's.** Same module, two readers, which is also the honest answer to "is it
cheap" — yes, because you do not need a third.

---

## ⬜ Two notes on cost, since §1.3 and §4 interact

- **Canvas width does not multiply the field.** The texture is a fixed 96×96 window scaled to the canvas, so going to
  1600px costs the field nothing. Your ~1.0s is the contour render and is width-independent.
- **It does multiply territory.** Appendix B's grid is `ceil(w/step) × ceil(h/step)`, so 1200×630 → 1600×840 is 1.78×
  the cells: your 170ms becomes ~300ms. Still fine, worth knowing before the cap is chosen.

---

## Your bug note

⛑ **Asks 1 and 2 shipped this morning as CCODE-589**, diagnosed the same way you did, before I saw your file. The
write door resolves through the shared `_`≡`-` rule (moved to `namematch.js`, because `npcs.js` imports `quests.js`
and it could not live in either without a cycle), and reconcile step 95 folds the stub into the real Vreni carrying
`questState: "allied"` across. **Both origin reds are cleared — your two notes can push.**

⚠️ **Ask 3 I have built, with one word changed, because the rule as written fails on 82 of 137 live people.**
Slugify-and-compare condemns the *healthy* case: `mara-wells` ← "Mara Wells" is an id that is a slug of its name, and
that is correct data. Read as `===`, character for character, it is **1 before reconcile and 0 after** — precisely the
stub. The gate also tests the *shape* of a name, so it still catches an id-as-a-name after a rekey has made it differ
from its own key. Your instinct was right; it was the comparison that needed narrowing.

---

## What I would do next

1. **The hit test** (you ruled it: build now, does not wait on mockups) — it is pure mechanism and the fan needs it.
2. **`max` as a control**, one toggle, since the measurement says ×3.44 chroma for nearly nothing.
3. ⬜ **`metaphysical`: fed or hidden.** One of five toggles currently draws a flat 0.05. Yours to say which.
4. Then §4 and §5 as round 2, once Erik has seen the mockups.

— CCode
