# The world generator — how to run it, and what not to break

**SNG-391.** Everything here builds the physical world: terrain, elevation, water, and the derived
layers the map draws. **If you change one file, you must rebuild — and the rebuild has an ORDER.**

---

## The one command

```
node scripts/world/generate_world.mjs            # rebuild
node scripts/world/generate_world.mjs --check    # regenerate in memory, diff against disk — the drift gate
python3 scripts/world/rebuild.py                 # the derived layers (steps 4-8; still Python, see below)
```

⚠️ **`--check` is what stops the world silently going stale.** Run it in CI. A red `--check` means the
committed terrain no longer matches the generator that claims to produce it.

---

## ⛔ WHAT IS AUTHORED AND WHAT IS DERIVED. Get this wrong and you will edit the wrong file.

| | | |
|---|---|---|
| **AUTHORED — edit these** | `worldPos` on 118 locations · `biome.byRegion` · `naniteField` · `substrateSource` · `connections` · `sourceBands` | in `content/packs/` |
| **INPUT — hand-tuned** | mountain belts · land bridges · unexplored landmasses · the tuned constants | `genparams.json` + generator header |
| **DERIVED — NEVER edit** | terrain type · elevation · rivers · lakes · marsh · biome/density/nanite rasters · region jump targets · `RLO`/`RHI` | regenerated every run |

⛔ **`genparams.pts` is a CACHE of canon `worldPos`, not an input.** The pipeline re-derives the seeds and
fails if the cache disagrees. **To move a location, edit its `worldPos` and rebuild** — never the cache.

---

## The rebuild order. Steps depend on earlier steps; running one alone will desync the world.

1. **terrain type + raw elevation** — the generator over a 720×360 grid
2. **`RLO` / `RHI`** — 2nd and 98.5th percentiles of land raw. ⚠️ **Recompute EVERY time.** A stale range
   makes lowlands render white.
3. **elevation** — normalise raw by `RLO`/`RHI`
4. **biome / density / nanite rasters** — from the authored layers
5. **hydrology** — smooth DEM → fill pits → D8 flow → rivers → lakes → marsh → authored water → push
   shorelines back from settlements
6. **vectors** — Moore boundary trace → smooth → Douglas–Peucker → reject compactness > 12
7. **region jump targets** — medoid **over members on land in the NEW terrain**
8. **downsample + pack** to 480×240 for the base globe

⛔ **Steps 1 and 8 must use the same generator revision**, or the base globe and the detail patch draw
different worlds. That was a visible seam.

---

## Changing the terrain: the procedure that stops the known regressions

1. Edit the generator or `genparams.json`.
2. ⛔ **Sweep any threshold at FULL 720×360 resolution.** A coarse sweep reported 41% land where the real
   figure was 32.6%, which flooded the world and marooned eleven locations. **A sweep measured at lower
   resolution than the artifact is not a measurement of the artifact.**
3. Rebuild — all of it, in order.
4. Run the gates. **Fix red before shipping, not after.**
5. ⛔ **Ship the generator and the rebuilt output IN ONE COMMIT.** Shipping a generator and then correcting
   it locally without re-shipping is exactly how rev 1 went out wrong.

---

## The gates, and what each one is protecting against

| gate | assert | the bug it caught |
|---|---|---|
| determinism | regenerate → byte-identical | silent drift |
| base vs live | ≥ 98% agreement | the seam |
| stranded | 0 land-wanting locations in water | happened 3× |
| connectivity | off-mainland matches the census **exactly** | 11 marooned by a flood |
| jump targets | 0 region medoids in ocean | happened 2× |
| lake containment | only `sunken_choir` inside a lake | 4 settlements underwater |
| polygon sanity | compactness ≤ 12 | 13 slashed marshes |
| isotropy | pole ratio < 1.5 | the starburst |
| ripple | direction-changes < 26/100 | concentric rings |
| coverage | patch spans 360° when the pole is in view | the wedge |

⚠️ **A gate that has never been observed to go red is not known to work.** Prove each one by breaking the
thing it watches: delete the four land bridges and connectivity should jump from 0 to ~54. **If it stays
green, the gate is decorative.**

---

## Three things in the generator that must not be "simplified"

1. **Great-circle distance, not `hypot(dLat, dLon·cos lat)`.** The flat form over-reports by **57% at 0.5°
   from a pole**. It produced a starburst at the Crossing.
2. **3D noise on the sphere, not lon/lat noise.** A longitude degree is 111 km at the equator and 2 km at
   89°, so lon/lat noise streaks radially near a pole **and no blend fixes it** — three were tried, each
   trading streaks for rings.
3. **View culling with a `cos(lat)` longitude pad.** 4.5× faster, verified identical. **Without the
   `cos(lat)` term the cull silently eats real contributors near the poles.**

⚠️ **All three exist because the Crossing sits at the map frame's south pole** (`map lat = colatitude −
90`). Anything that treats the poles as ordinary ground will reintroduce the artifacts.

---

## Known gaps

- **`rebuild.py` is Python** while the rest is node. Steps 4–8 should move across; until then the lake
  containment and polygon sanity gates depend on a Python run.
- **`localMap` is 0 of 118.** The site tier has no coordinates yet — it is **authored, not generated**, and
  carries `localSources`. It slots in as data; it should not require a pipeline change.
- **Naming.** 5 seas, 16 ranges and the fens are detected and unnamed.
