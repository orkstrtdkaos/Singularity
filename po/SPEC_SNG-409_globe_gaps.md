# SNG-409 — Gaps between the prototype and the shipped globe, prioritised

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"he's mostly implemented your world prototype but didn't get everything yet… look at what he has
vs what you made to find gaps to prioritize."*
**Method:** audited `engine/worldglobe.js` and `engine/localdetail.mjs` against the prototype.

---

## §1 — WHAT IS ALREADY THERE. Credit where it is due.

`engine/localdetail.mjs` is **substantially ahead of my spec** — it consumes `riverBearing`, `uphill`,
`relief`, `roadsOut`, `basis`, `prose`, `tradition`, `localMap`, `level`, `metres`, `bearing`.
⛔ **SNG-404 is largely built.** ⚠️ **It already reads `basis` and `level`, both of which I added only
after measuring — so it took the corrections, not just the first draft.**

`engine/worldglobe.js` has: **cursor-anchored zoom, absolute `RLO`/`RHI`, region seats, vector hydrology,
baked layers, and an areas hook.**

---

## §2 — ⛔ PRIORITY 1: THE CLIENT CANNOT GENERATE TERRAIN, SO ZOOM IS CAPPED

`worldglobe.js` **imports nothing** and reads only the baked layers. `makeTerrain` appears **zero times**.
`scripts/world/terrain.mjs` exists and is **never imported.**

| baked | resolution |
|---|---|
| type / nanite / biome / density | **480 × 240** |
| elevation | 720 × 360 |

⛔ **At a 5° view that is roughly TEN CELLS ACROSS THE SCREEN.** The whole zoom story — detail patch,
staged refinement, runtime calibration — **depends on generating live at the visible window.** Without it
the map is a picture that gets bigger, not a world that resolves.

**Fix: import `terrain.mjs` client-side and regenerate the visible patch.** ⚠️ **Everything else in §3
follows from this; several of them are impossible without it.**

⚠️ **Runtime calibration appears once and looks vestigial** — it has nothing to calibrate while there is
no generator to time.

---

## §3 — ⛔ ABSENT, IN ORDER

**1 · THE POLAR DISC.** `poleInView` / `CircleGeometry` — **absent.** ⛔ **The Crossing is the centre of
this world and sits at latitude −90 exactly, where every meridian converges.** Without the disc it
starburst-streaks, and a patch capped at ±170° longitude leaves **a wedge of bare globe**. Both were real
bugs I hit and fixed; **they will return the moment anyone zooms to the Crossing.**

**2 · ROADS AND PRECURSOR LINES.** Both **absent** (`roads` 0, `prelines` 0). ⚠️ **These are not
decoration — they carry a measured finding: the three networks are INDEPENDENT.** Waygates are 1.1×
closer to substrate sources than chance, 2 of 26 within 3°. **Precursors laid the lines, someone else built
the gates, people walk neither — which is why `wake_the_line` exists as a craft.** The map is the only
place that argument is visible.

**3 · KIND ICONS.** `location_kinds.json` (`f061921f`) is authored for all 135 and **nothing reads it.**
⛔ **12 locations are `pole` — the Blaze, the Scouring, the Numen — and an icon that says "settlement"
would lie about the most dangerous places in the world.**

**4 · AREAS.** `areas.json` (`545e61e0`) has one entry and the globe references areas once. ⚠️ **Membership
must be COMPUTED from the ellipse, never read from `parentId`** — only 1 of the Fringe's 8 children is
actually in the band.

**5 · STAGED REFINEMENT.** Absent, and blocked by §2.

---

## §4 — CONTENT SHIPPED THIS WEEK WITH NO READER

| file | commit | state |
|---|---|---|
| `location_kinds.json` | `f061921f` | ⛔ no reader |
| `areas.json` | `545e61e0` | one hook |
| `local_layouts.json` | `db13ac4d` | ⛔ **8 towns, 38 sites — `localdetail.mjs` has the machinery; does it read the CORPUS?** |
| `placenames.json` | 36 names | 8 rivers + 11 fens resolved, **2 unresolved** |

⚠️ **`features` in the asset has 5 seas / 16 ranges DETECTED; I named 4 seas and 12 ranges. They are
separate sets and need joining** — a detected range with no name should render unlabelled, not
mislabelled.

---

## §5 — ⛔ CANON CHANGES SINCE YOUR LAST PASS

**SNG-407 — 11 locations MOVED.** Coastal and riverine snapped onto real terrain, 4–8 walking days each.
⛔ **`walkingDays` must be RE-DERIVED, not preserved** — Erik ruled the land is ground truth, so travel
follows position. Worst single change: **11.7 days.** The rebuild chain must re-run; three moved locations
have authored local layouts whose bearings are now different.

**SNG-408 — the Disputed Zone is an ellipse**, not a lens. ⚠️ **My first formula tested equidistance, and
equidistance is not betweenness** — it caught the Great Coliseum, which is exactly 18.2° from both powers
while sitting far off to the side. Erik caught it. **Foci are Harmonic Heights and Radiant Plateau,
k = 1.35.**

**⛔ STANDING RULING, Erik 2026-08-10: WORLD GEOGRAPHY OUTRANKS UNANCHORED PLAY MEMORY.** Play happened
before the terrain existed, so a remembered distance is a remembered feeling, not a measurement.
⚠️ **It does NOT demote play-authored CONTENT** — the Made Gate, the Watershed Road and the Far Side are
canon because of what happened in them. **It demotes only remembered POSITIONS.**

---

## §6 — ORDER I WOULD TAKE THEM

1. **Import the generator client-side** (§2). Unblocks three other items.
2. **The polar disc** (§3.1). The Crossing is where players start looking.
3. **Kind icons** (§3.3) — Erik asked directly, content is ready, and it is contained drawing.
4. **Roads and precursor lines** (§3.2).
5. **Areas** (§3.4).
6. **Re-run the rebuild after SNG-407** (§5) — ⚠️ **or the moved locations sit on stale biome and name data.**
