# SNG-389 — Only precursor has a geography. And the naming path for world B.

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Measured at:** `924b8e9d`

---

## §1 — ⛔ ERIK ASKED IF MOST OF THE WORLD IS WILD-FRIENDLY. IT IS, AND IT IS WORSE THAN THAT.

Measured across **119,700 land cells** of world B:

| source | full strength | workable ≥70% | starved <40% | OFF |
|---|---|---|---|---|
| **wild** | **47%** | **100%** | **0%** | **0%** |
| metaphysical | 14% | 82% | **0%** | 0% |
| veil | 12% | 70% | **0%** | 0% |
| **precursor** | 30% | **61%** | **12%** | **3%** |
| nanite · body | 100% | 100% | — | — |

⛔ **PRECURSOR IS THE ONLY SOURCE WITH A GEOGRAPHY. Four of six work everywhere.**

### §1a — The cause is the TUNING, not the content, and it is one asymmetry

`SUBSTRATE_TUNING`: **`starveFloor: 0.0`** but **`crowdFloor: 0.6`**.

⛔ **Starvation goes to zero. Crowding never costs more than 40%.** So a source whose band sits LOW on the
axis can never be badly off — it can only ever be mildly crowded. **Only a HIGH-centred band can starve**,
and precursor at 0.90 is the sole one.

⚠️ **And wild's band is the second half of it: `0.32 ± 0.34` is full strength across 0–0.66 — 68% of the
axis.** Precursor's covers 30%. **That is not a band, it is most of the world.**

### §1b — Three fixes, and they are Erik's to pick

1. **Lower `crowdFloor`** to ~0.35 so abundance genuinely hurts. ⚠️ **Smallest change, largest effect — it
   gives every low-centred source a real weakness without touching a single band.**
2. **Narrow `wild`** to something like `0.32 ± 0.20`. ⚠️ Wild would then be a *middle-ground* source rather
   than a universal one, which reads truer to "ungoverned nanite is unreliable."
3. **Both.**

⛔ **I am not changing the bands.** Every one carries provenance — precursor carried because nanite split
out of it, metaphysical carried from `inherent`, veil derived as its mirror. **A balance change to a table
with authored reasons is a design decision, not a tuning pass.**

---

## §2 — THE NORTHERN EDGE AND THE UNEXPLORED (Erik)

**The known world's northern coast is no longer a line.** It rides on two octaves of noise — a ragged
margin between roughly 8°N and 30°N, so the world *frays out* rather than stopping.

**And there are three unnamed landmasses plus six island chains in the north — 2.4% of the surface.**
⚠️ **They carry no locations, no roads, no names, and that is the point:** they are drawn so a player can
see them and not go there yet. **The five great civilizations have somewhere to be.**

---

## §3 — THE NAMING PATH, and the features are DERIVED not invented

⛔ **Nothing below was made up. Every feature was found by reading the terrain**, the same discipline as
the substrate field: detect, then name what is there.

| feature | how found | count |
|---|---|---|
| **seas** | connected water bodies over 250 cells | **5** — one world ocean, four inland seas |
| **bays** | water cells with >62% land within 4 cells, clustered | **5** |
| **ranges & massifs** | connected cells above the 93rd elevation percentile; long-vs-round decides which | **16** |
| **fens** | connected `fen`/`wetland_maze` biome | **2**, the largest 4,223 cells |

⚠️ **The elevation model had to be fixed first — it was clipping, median and max both 254, so the world
had NO RELIEF.** Rescaled to the 1st–99.5th percentile with ridges dominating the top end. Land now runs
128 median 165 max 254, and the 16 ranges fall out of that honestly.

### §3a — Order of authoring, and who does what

1. ⛔ **Seas first.** Five names, and they are load-bearing: the world ocean is what separates the known
   world from the unexplored north, so its name is a statement about the setting.
2. **Ranges next** — 16, and each already has a peak coordinate and an extent. ⚠️ **Name the shape:
   a 7°×4° massif is not a range and should not be called one.**
3. **Bays**, then **fens**, then **coasts** as the seam between named sea and named land.
4. **Rivers LAST and only if the terrain grows them** — ⚠️ **there is no river model yet.** Naming rivers
   before drainage exists would be inventing, and I would rather add a flow model than author names for
   water that does not run anywhere.

⚠️ **Erik's call on register:** the existing world names are plain and functional — the Spent Yard, the
Worn Yard, Thinwater, the Long Grey. **Seas and ranges should probably match that** rather than reaching
for grandeur; "the Long Water" fits this world better than "the Sea of Sorrows."
