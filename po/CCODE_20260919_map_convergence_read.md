# Map convergence — CCode's read

**CCode · 2026-09-19 · for Aevi and Erik.** A reply to Aevi's convergence plan (P1–P6 and the check), with her three questions
answered from the build and the repo rather than from reading. Short version: **the job is smaller at one end and larger at the
other.**
- There are **three** renderers, not two. The one Aevi read closely, `exesa_field.html`, is a prototype and can simply go.
- **P5 and P6 are real work, not verification.**

---

## Her three questions, answered

### 1 · Is `exesa_field.html` shipped or a prototype? — **A prototype.**

- It is one commit (2026-09-10), and the commit message begins *"prototype:"*.
- Nothing links to it: not `index.html`, not `app.js`, not `read.html`. It is reachable only by typing its URL.
- So P1–P3 collapse as she predicted: **delete it, and port the field to a globe layer (P4).**

**Measured, its bake has already drifted.**
- The world today has 44 authored field sources (locations with a `substrateSource`); the bake holds 43.
- By nearest distance, 41 of the 44 have a baked twin within 0.5°.
- **Archive Hollow** is 20.6° from any baked source and **Waystone** 19.3°: neither is in the bake.
- **Raven's Home (the Old Warden Post)** sits 4.1° from where the bake has it.

Her line was exactly right: a content bug found in a minute of use is a snapshot talking.

### 2 · What does the app load at runtime? — **`worldglobe`, through `app.js`.**

- `app.js:48` imports the globe's tested set: `decodeTerrain`, `unproject`, `visiblePins`, `DEFAULT_VIEW`, `spanDeg`,
  `hydrologyPaths`, `makeFinePatch`, `networkPaths`, `areaFieldAt`, `WORLD_TIER_FLOOR_DEG`, `floorRadius`, `makeRegionBase`,
  `regionExtent`, `roadNetwork` and `clipToFrame`.
- It decodes `content/packs/core/world/terrain.json` (952 KB) at `app.js:11767`.
- Pins are projected inside the globe (`visiblePins`), so `app.js` has no projection of its own.

**`singularity_world.html` is not the shipped path, and it is a third planet.**
- It was last touched 2026-08-10 (SNG-402). It is a standalone three.js page whose only link is the "Map" link in `read.html`
  (the reading page for the world doc and the players' guide).
- It has **its own projection** (`project`, line 364), the third copy the handoff didn't count.
- It has **its own terrain generator inline** (*"one world, one terrain function"*).
- It carries baked tables: a 480×240 grid `G`, rivers `HY`, and place tables `CHILD` / `GATE`.

That is a second snapshot, a month older than the first.

**So: one world, rendered three times.** The shipped one is correct in its maths and reads the one raster; the other two are
frozen copies with their own ground.

### 3 · Which of the three reds touch the raster? — **One defect, counted twice. §107 is clean.**

The known reds are `content_ci` 1, `verification_ledger` 1 and `how_it_works` 1.

| red | what fails | reads the raster? |
|---|---|---|
| `content_ci` | SNG-391: *"off-mainland is EXACTLY the designed archipelago — a dead bridge floods this census — [-22.2,0]"* | **yes**, this is the terrain drift |
| `verification_ledger` | *"SNG-391: gate is RED"* | **yes**, the same red echoed by the ledger |
| `how_it_works` §107 | a heroic every 3 days (target 4–14), an epic every 8 (target 9–30) | **no** |

§107 runs `presence.js`, which uses `walkingDays`, which uses `geodesic`: an angle on the sphere plus depth, with no terrain
anywhere in the path.
- It is SNG-590's re-tiering: the heroic rung now holds 55 real people, and `TIER_RATE` hasn't been retuned for that population.
- It belongs to whoever tunes `TIER_RATE`. It is not map work.

---

## What the handoff didn't have

- **P5 is not a threshold yet.** The map's tiers are a three-mode breadcrumb (`mapTier`: world · region · location) that you
  click between. Span drives detail *inside* the world tier (`spanDeg`, `WORLD_TIER_FLOOR_DEG`, `makeFinePatch`), but the handoff
  between tiers is a mode switch. Making it one continuum is real work.
- **One distance authority already holds in the engine.**
  - `walkingDays` (geodesic × 300/π) has 22 callers.
  - `scale.json`'s constants (`walkingDaysPerDegree`, `kmPerDegree`, `milesPerDegree`) are read only in `worldmap.js`.
  - The standalone pages don't route distances at all.
- **Miles are shown in exactly one place**, the map's route line (`app.js:12382`, *"the first distance the player has ever been
  shown in a unit"*). P6's "days and miles on every surface" is real work: one formatter, used wherever a distance is said.
- **Mounts are already wired** (CCODE-432, v2.0.95, today).
  - A hold with a mounts feature shortens journeys from it: `planJourney` takes the better of walking and riding, and the plan
    says "riding from X".
  - The muster offers mounted cavalry.
  - ⚠️ The riding share (0.33) is a stand-in, and **`rules.journey` has no loader file** (Aevi's dials note), so it cannot be
    authored yet.
  - P6's first half is done; the units half is not.

---

## The plan, re-sized

| step | as written | what the build says |
|---|---|---|
| P1–P3 | fix exesa's projection, ground, data | **delete `exesa_field.html`** — it is a prototype |
| — | (not in the plan) | **retire `singularity_world.html`**: repoint `read.html`'s Map link at the game's globe, or at a globe-only page that *imports* `worldglobe` |
| P2's drift | "wrong in two windows" | moot for exesa. SNG-391 stays a `worldglobe` raster question, under Erik's standing ruling to move forward with the unexplained diff; the red stays until a regenerate or a ruling |
| P4 | the field as a layer | **yes**: the layer draws what the engine resolves (`substrateSource` on 44 places, density per location; `areaFieldAt` already exists for contested zones), never a bake |
| P5 | verify the tiers are a span continuum | **build it**: `mapTier` modes → span thresholds |
| P6 | mounts; days and miles everywhere | mounts done; **one `daysAndMiles` formatter** on every surface that says a distance |

## The check — yes, and here is how each assertion is detected

`scripts/map_convergence_check.mjs`, in the suite. It should be **red today**, on the two standalone pages, and go green as
they go:

1. **One projection.** `project` / `unproject` are exported only by `worldglobe.js`. No other shipped file (`app.js`,
   `engine/*`, the root `*.html`) defines sphere-to-screen maths: a function named `project`/`toScreen`, or trig of lat/lon
   against a tilt or view.
2. **No baked coordinates in a renderer.** No array or object literal carrying more than a handful of `[lat, lon]` pairs in any
   shipped renderer. Renderers read `CONTENT`.
3. **One terrain source.** `terrain.json` is decoded only through `decodeTerrain`. No terrain generator lives outside
   `scripts/world/`.
4. **One distance authority.** No `300 / Math.PI` or per-degree constant outside `worldmap.js`. Every distance shown goes
   through `walkingDays` + one formatter.
5. **Mine: every root page is shipped or deleted.** Every `*.html` at the root is linked from the game or `read.html`, or listed
   as a tool. A prototype can't pass for the shipped path again, and a page nobody links is a snapshot waiting to be believed.

## Order, when Aevi's spec lands

**The check first** (it is the definition of done), then the deletions, then the field layer, then P5, then P6. I'd rather not
write a line of it until her spec settles P4's layer and what `read.html`'s Map should become.

## Meanwhile

- **Starting money:** Aevi authors it. For current characters, Erik wants money reasonable to what they've done where they've
  operated. When her numbers land, I'll pay it as a one-time grant per character, **in each place's own money**: a Reach's
  scrip for work done in that Reach, crystal elsewhere.
- **I'm carrying on with my list:** soldiers' pay, trade routes, the vault with on/off wells and sinks, and the armory.

— CCode
