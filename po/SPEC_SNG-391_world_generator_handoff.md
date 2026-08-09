# SNG-391 — WORLD GENERATOR: handoff to CCode

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"hand this off to ccode"*
**Prototype:** `singularity_world.html` (a viewer, not the source of truth)
**Status:** ⛔ **The prototype works. The PIPELINE does not exist, and that is the whole ticket.**

---

## §1 — WHY THIS IS BEING HANDED OVER, HONESTLY

The map is good. **The way I have been maintaining it is not.**

⛔ **I regenerated this world EIGHT times in one session.** Each time, the layers that depend on terrain —
base raster, biome, substrate density, nanite, hydrology, region jump targets, the absolute elevation
range — had to be rebuilt. **Each time I rebuilt them by hand, with scripts I wrote in the moment.** That
is not a pipeline; it is me remembering.

⚠️ **Every bug in §5 below is the same bug**: I changed the generator and something downstream went stale,
and Erik found it in the browser. **A build step cannot forget to rebuild. I can, and did, repeatedly.**

**What I keep:** authoring and canon. Biome layers, the nanite field, the water-word audit, which places
are sites of the Crossing, naming. **What you take:** making the derived layers impossible to desync.

---

## §2 — THE GENERATOR

`makeTerrain(GP, view) -> (lon,lat) => {type, raw}` — pure, deterministic, no RNG.
`type`: 0 sea · 1 land · 2 volcanic · 3 unexplored. `raw`: unnormalised elevation.

### §2a — Inputs (`GENPARAMS.json`, ~5.4 KB — this is ALL the world needs)
`pts` 118 location seeds · `landwant` 104 that must have ground · `umb` 5 Umbral (coastal carving) ·
`belts` 8 mountain polylines · `bridges` 4 land bridges with width factors · `short` 83 road-route raises ·
`north` 9 unexplored landmasses.

### §2b — ⛔ THE THREE CORRECTNESS FIXES. Port these or the artifacts come back.

1. **GREAT-CIRCLE DISTANCE, not `hypot(dLat, dLon·cos lat)`.** The flat form over-reports by **57% at
   0.5° from a pole** and worse closer in. It was the cause of the starburst at the Crossing.
   Implemented as a chord: `chord² = 2(1−cos d)`, `arc² ≈ chord²(1 + chord²/12)` — no `acos`, verified
   **99.995% identical** to the exact form and much faster.
2. **3D NOISE ON THE SPHERE, not lon/lat noise.** A longitude degree is 111 km at the equator and 2 km at
   89°, so lon/lat noise streaks radially near a pole **no matter what blend is applied** — I tried three
   and each traded streaks for rings. Sampling from the unit vector has no poles. ⚠️ Measured isotropy
   0.67–0.76 across **every** distance band from the pole; anything near 1.0 is fine, anisotropy shows as
   a ratio above ~1.5.
3. **VIEW CULLING** — drop parameters that cannot affect the window. 4.5× faster, verified **100%
   identical** across six windows. ⚠️ **The longitude pad must divide by `cos(lat)`** or the cull eats real
   contributors near a pole; that bug cost 3% accuracy and was invisible except at the poles.

### §2c — Tuned constants (swept, not guessed)
`thr = 1.30 + 0.18·noise` · northern taper exponent `1.3` × **`2.2`** · continentality `× 0.62` ·
polar noise scale `F3 = 57.2957795` · **absolute elevation range `RLO = 0.0915`, `RHI = 1.9265`**.
⚠️ **`RLO`/`RHI` are GLOBAL and must be recomputed whenever the generator changes.** Normalising
elevation to the *visible* range made lowlands render white when nothing higher was on screen.

---

## §3 — THE REBUILD ORDER. ⛔ THIS IS THE DELIVERABLE.

Terrain changes ⇒ **all of this** must regenerate, in order:

1. **`B_TYPE` + `B_RAW`** from the generator over the 720×360 grid
2. **`RLO`/`RHI`** — 2nd and 98.5th percentile of land `raw`
3. **`B_ELEV`** — normalise `raw` by `RLO`/`RHI`
4. **`B_BIOM` / `B_DENS` / `B_NAN`** — from authored `biome.byRegion`, `substrateSource`, `naniteField`
5. **HYDROLOGY** — smooth DEM (4 passes) → fill pits → D8 flow → rivers (top 1.5% accumulation) →
   lakes (30 strongest endorheic sinks) → marsh → **authored water at the 12 evidence-backed locations** →
   push shorelines back from Archive Hollow, Cairn-and-Scour, Millbrook (the Sunken Choir stays submerged)
6. **VECTORS** — Moore boundary trace → smooth → Douglas–Peucker → **reject compactness > 12**
7. **REGION JUMP TARGETS** — medoid **over members that are on land in the NEW terrain**
8. **DOWNSAMPLE + PACK** to 480×240 for the base globe

⚠️ **Steps 1 and 8 must use the same generator revision or the base globe and the detail patch draw
different worlds** — that was a visible seam, measured at 2.44% disagreement.

---

## §4 — GATES I WANT, EACH FROM A BUG THAT ACTUALLY HAPPENED

| gate | assert | the bug it catches |
|---|---|---|
| **determinism** | regenerate → byte-identical | silent drift |
| **base vs live** | ≥ 98% agreement | the seam |
| **stranded** | 0 land-wanting locations in water | happened 3× |
| **jump targets** | 0 region medoids in ocean | happened 2× |
| **lake containment** | only `sunken_choir` inside a lake polygon | 4 settlements underwater |
| **polygon sanity** | compactness ≤ 12 | 13 slashed marshes |
| **isotropy** | pole ratio < 1.5 | starburst |
| **ripple** | direction-changes < 26/100 | concentric rings |
| **connectivity** | every land-wanting location on the mainland | 4 marooned |
| **coverage** | patch spans 360° when the pole is in view | the wedge |

---

## §5 — BUGS FOUND AND THEIR CAUSES. ⚠️ THE MOST USEFUL SECTION — do not rediscover these.

- **starburst at the Crossing** → flat distance approximation, not the projection
- **concentric rings** → noise sampled in polar coordinates makes rings *by construction*
- **radial smearing at mid-zoom** → lon/lat noise is anisotropic near a pole; only 3D noise fixes it
- **wedge of bare globe** → patch capped at ±170° longitude while the pole was in view
- **lowlands rendering white** → hypsometric scale normalised per-view instead of absolute
- **lake octagons** → convex hulls instead of traced outlines
- **slashed marshes** → boundary walk never closed; truncation left an open path
- **Tier Seven in a lake** → regex matched *"the Lattice-folk are **well**-served"*. ⛔ **Ten of eighteen
  water matches were false positives**, including two NEGATIONS (*"**no** river-plot reaches here"*).
  **Replaced with an authored list. Do not reintroduce prose regex.**
- **foothills jump landing in ocean** → region centroid; a scattered network has no meaningful centre
- **patches accumulating** → added to `globe`, removed from `scene`
- **`hyp(NaN)` crash** → elevation packed at 480×240, indexed at 720×360
- **`ray is not defined`** → a `str_replace` that matched nothing is a silent no-op
- **zoom spinning the globe** → cursor anchoring used a fixed 0.55 per tick; correct factor is
  `1 − newSpan/oldSpan`

⚠️ **And two failures of my own testing, which are the reason for the handoff:** a parse check cannot see
a runtime error, and **a harness that stubs `THREE` reports green on a branch it never executed** — the
polar disc had never once run when I called it verified.

---

## §6 — VIEWER BEHAVIOUR WORTH KEEPING

Base globe + **detail patch** regenerated live for the visible window. **Runtime calibration** — time 200
real calls, then size the buffer; a hardcoded cost table was wrong by **up to 221%** and is
machine-dependent besides. **Staged refinement** 1×/2×/4× at ~280 ms per stage, cancelled by token the
moment the view moves, capped by zoom (1 stage above 60°, 2 above 34°, 4 below). **Polar disc** whenever
the pole is in view. Cursor-anchored zoom, hard floor at 1.006 radii.

---

## §7 — WHAT IS STILL MINE, AND WHAT COMES NEXT

**Mine, not yours:** naming (5 seas, 16 ranges, fens — detected and unnamed), per-source `naniteSource`
points, the remaining tier/parent corrections.

⛔ **AND THE LOWEST LEVEL OF DETAIL IS STILL TO COME, AND IT IS MINE.** `localMap` is **0 of 118**. The 65
sites have no coordinates inside their settlements, so there is no settlement map yet. That tier is
authored, not generated — a floor plan is not a projection of anything — and it carries `localSources`,
the per-place wells and sinks that give a settlement internal terrain. **Erik's ruling stands: local
ground CAN overturn world ground, because that is how a tradition invades an antipole.** I will author
that layer separately; **build the pipeline so a new tier slots in rather than needing a rebuild.**
