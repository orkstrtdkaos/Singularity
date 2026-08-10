# SNG-405 — ⛔ Locations cannot be moved onto features. The features are not near them, and I found out why.

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"the locations shouldn't be centered in little land circles… use the local geography to shift
the positions to something that makes sense."*
**Status:** ⛔ **NOTHING SHIPPED. This is a world-shaping decision and it is Erik's.**

---

## §1 — I BUILT THE MOVER, AND IT BARELY MOVED ANYTHING

Scored all 96 placeable locations against what their **authored biome** wants — coast, river, marsh, high
ground, low ground — searching for a better cell within a per-location cap of **25% of its shortest road
edge** (median 1.5°, because **1° of arc = 1.67 walking days** and the shortest edge in the world is 3.72
days).

| | |
|---|---|
| moved more than 0.05° | **21 of 96** |
| ⛔ **less blob-centred afterwards** | **1 of 96** |
| mean land-centrality before → after | **0.997 → 0.996** |

⚠️ **Raising the budget to 4° — which breaks travel canon for 21 locations, worst move 6.5 walking days —
barely helped:** river distance 6.01° → 5.07°, marsh 16.69° → 16.30°.

---

## §2 — ⛔ MY FIRST EXPLANATION WAS WRONG, AND THE REAL ONE IS WORSE

**I assumed the "little land circles" were the `landwant` seeds — each location forcing land around itself
at r=3.6°, so every town sits at the centre of a blob it made.** ⛔ **Measured, and it is false:**

- Land fraction on rings around each seed: **1.000 at r=3.6, 0.945 at r=5.5.** The coast is not at the
  seed radius.
- With the seeding term **deleted entirely: 104 of 104 locations are STILL on land.**
- **Land created only by the seeds: 1.7%.**

⛔ **The locations did not make their ground. The world is simply very continental — 41.7% land — and they
sit deep inside it.**

**The real cause is the other term.** 118 location seeds each add 0.78 at **sigma 8.2°**. ⚠️ **Where
locations cluster, their combined contribution guarantees a continent around the cluster.** Coast can only
exist far from where people are — **which is the exact opposite of how a settled world works.**

**Swept the land threshold to test it:**

| thr | land | off-mainland | ⛔ **mean sea% within 3° of a location** |
|---|---|---|---|
| 0.85 | 41.7% | 0 | **0.0%** |
| 1.15 | 35.9% | 1 | **0.3%** |
| 1.25 | 33.6% | 10 | **0.6%** |

⛔ **Drowning a fifth of the world moves coastal access from 0.0% to 0.6%.** The dial does not reach.

---

## §3 — HOW WRONG THE AUTHORED BIOMES ARE, MEASURED

| want | n | reality |
|---|---|---|
| **coast / coast_karst** | 9 | ⛔ **0.00 sea fraction within 2.5°. All nine are landlocked.** |
| **river_valley** | 12 | 9 are further than 1.5° from any river; mean **6.0°** |
| **fen / wetland_maze** | 10 | ⛔ **10 of 10 stranded; mean 16.7°.** The Hall of Mirrors is **50.4°** from marsh |

⚠️ **This is the same class as the Millfen: I authored a world and the generator built a different one.**

---

## §4 — ⛔ THE THREE REAL OPTIONS. YOUR CALL.

**A · ACCEPT AND RE-AUTHOR THE BIOMES.** Cheapest, no regeneration. ⛔ **But it means deleting the coast
from nine coastal towns and the fen from ten fen towns** — the Feeling Coast stops being a coast. **I do
not recommend it; the fiction is older than the terrain.**

**B · ⛔ REBALANCE THE GENERATOR SO CONTINENTALITY LEADS.** Cut the `pts` sigma (8.2°) and/or amplitude so
land follows the continentality field rather than location density. **Coasts then form where geography
says, and locations sit near them because the continent is shaped rather than inflated.**
⚠️ **Cost: full world regeneration.** Coastlines move, hydrology re-runs, all 36 place names re-anchor,
the 8 local layouts re-measure. ⛔ **And it must be swept at full resolution against off-mainland — the
last time I retuned this I flooded the world.**

**C · CARVE FEATURES TOWARD LOCATIONS.** Generalise the existing Umbral coast-carve to anything wanting a
shore. ⚠️ **I tested it: 0.000 → 0.015 sea fraction. The `landwant` term fights the carve and wins.**
Tunable, but it is a patch on a patch.

---

## §5 — WHAT I THINK, SINCE YOU WILL ASK

⛔ **B, and not soon.** The world is playable, the map is good, and the reason it looks wrong is a real
structural fact worth fixing properly rather than papering. **But it invalidates a lot of shipped work at
once**, and there are three unfinished things in front of it — the battle-image blocker, the local
detailing engine, and 88 unauthored local layouts.

⚠️ **What I would do first, cheaply: re-author the biomes of the WORST offenders only** — the ten fen
towns at a mean 16.7° from any marsh are simply wrong on any reading, and fixing those ten does not need a
regeneration.
