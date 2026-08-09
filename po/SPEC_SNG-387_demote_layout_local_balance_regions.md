# SNG-387 — Demote don't delete; geodesic weighting; local frames as balance; and the Valley is two places

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Measured at:** `baed9a27`
**Origin:** Erik — *"it needs to be demoted not deleted"* · *"use it to balance things as well"* · *"look
at these regions… make sure they make sense for the fact that the Valley is not the whole world"*

---

## §1 — WHAT I NEED FROM CCODE

### §1a — ⛔ DEMOTE `map.x/y`. DO NOT DELETE IT. (Erik ratified; this reverses what I told you yesterday.)

**Measured, and it is why:** correlation between layout distance and field similarity —
**`map.x/y` 0.228, azimuthal-from-`worldPos` 0.130.** ⛔ **The schematic is the BETTER base for your §5
interpolation, and I recommended retiring it on a single measurement against travel time.**

**What demotion means, concretely:**
1. **Schema note on the field**: *a RENDER LAYOUT, never a geography. Nothing may read it for position,
   distance, bearing, adjacency or containment.*
2. ⛔ **A gate: `worldPos` is the sole positioning authority.** Fail the build if anything outside the
   renderer reads `map.x/y`.
3. ⚠️ **A coherence gate, which is the actual fix for what I was trying to prevent.** The Hollowing sat
   264 walking days from its own region and the schematic made it look fine. **Assert that a location's
   map-space rank-order of nearest neighbours roughly agrees with its geodesic rank-order** — loose
   enough not to fire on the waypoints, tight enough to catch a location placed in the wrong half of the
   world. **That catches the bug without costing the useful field.**

### §1b — WEIGHT THE FIELD BY GEODESIC DISTANCE, NOT SCREEN DISTANCE

Every pixel on the azimuthal projection has an exact inverse — colatitude and longitude — so its true
distance to each location is the same `geodesic()` the field itself uses. **Then the smoothing is exact
under any layout and the projection stops being a claim.**

⛔ **This is what your method was already reaching for.** You wrote that the field is *"an interpolation
between known-true points rather than a claim about radii"* — **screen-distance weighting quietly
reintroduces a claim about the projection.** ⚠️ **If per-pixel inversion is too slow, a coarse grid with
interpolation between grid points is exact enough and I would take that trade.**

### §1c — SCALE-FILTERED VIEWS ARE UNBLOCKED
Tier corrections shipped at `091dad1a`. **25 regions · 28 settlements · 65 sites; roles `gate` ×2,
`waypoint` ×22.** ⚠️ **Your thin-middle-tier flag was me hiding 22 towns in a tier of their own** — Erik
caught it: **tier is SIZE, role is FUNCTION.**

---

## §2 — LOCAL FRAMES AS A BALANCE SURFACE (Erik's, and it is the best idea in this ticket)

> *"you can get creative and use it to balance things as well — with wells and sinks we can make every
> local frame have better or worse grounds for the different power sources."*

⛔ **This solves a problem I had filed as unsolvable.** The world field is one number per location, so
inside a settlement every craft has the same ground — **a Seraphic and a Rootkin standing in different
rooms of the same hold read identically.** Local wells and sinks give a place internal terrain.

**And it is the natural home for the per-source typing SNG-381 §3 asked for.** A local sink authored as
*"the Ent-embassy ward"* is not generic thinness — **it is nanite-clear and lattice-neutral**, and at
local scale that distinction is cheap to author and immediately legible: *cross the courtyard and your
craft changes.*

⚠️ **Design guardrail I want on the record before I author 65 of these: a local frame must not be able to
overturn its world ground.** A Seraphic in the Quickwood may find a room that is merely bad instead of
hopeless. **They must not find a room that is good** — that would make the world map decorative, and
`theKeyImage` is canon: *a Seraph in the Quickwood is nearly powerless.* **Local range should be a
fraction of the world range, and I would author it as ±0.15 unless Erik prefers otherwise.**

**Mine to author. CCode: `localMap {x, y}` plus `localSources[]` on sites — same shape as
`substrateSource`, resolved within the frame only.**

---

## §3 — ⛔ THE REGIONS: 23 OF 26 ARE SOUND. THREE FLAGS, TWO FALSE.

**The structure is a clean three-shell world and it holds up:**

| shell | | |
|---|---|---|
| **hub** | `the_center` | colat 0–11 |
| **near-centre folk country** | `valley` | colat 18–28 |
| **the waypoint ring** | `the_foothills` | colat 36–87, all longitudes — **by design** |
| **23 pole domains** | the reaches, holds, lands | colat 67–90, each in a ~10° longitude band |

**Two flags are false:** `the_center` spans all longitudes because at colatitude 7 longitude barely means
anything; `umbral_depths` reads 0–359 because **that is a WRAP around zero, not a spread** — its true
extent is 35 days.

## §3a — ⛔ THE REAL ONE: THE VALLEY IS TWO PLACES, 90 DAYS APART

**Erik's instinct was right and the number is worse than "old verbiage."** `valley` spans **90 walking
days — 30% of the way round the world** — and there is a **53° longitude gap** cleanly splitting it:

| | | |
|---|---|---|
| **longitude 167–248** | millbrook · archive_hollow · sunken_choir · kestrels_roost · disputed_zone_fringe | ⚠️ **Erik's home ground. This is the actual Valley.** |
| **longitude 49–114** | harmonic_heights_terrace · radiant_plateau_edge · echo_river_crossing · old_switchback · thornwake_glade · greywater_stilts | ⛔ **a different country entirely** |

**And the second group says so in its own descriptions:** *"the lowest terrace of the Harmonic Heights,
where the sonic civilization meets the valley floor"* · *"the rim of the Radiant Plateau"* · *"built on
stilts by people who wanted out from under BOTH CITIES."*

⛔ **That is not the Valley. It is the country between the two craft-family civilisations, and being
between them is its whole identity** — the bridge, the pass, the marsh-town of people who left both.

**PROPOSAL: split. `valley` keeps the Millbrook belt.** The other six become their own region.
⚠️ **Name is Erik's.** My candidates, in order: **`the_echo_vale`** (the Echo River is its spine and it is
genuinely a vale, unlike the belt currently called one) · `the_lower_terraces` · `between_the_cities`.

⚠️ **Consequence worth naming: this is the last structural place where "the valley" was standing in for
"the world."** The pack directory is the other, and that one is a rename risk rather than a content
decision — **CCode: is a pack rename feasible, or do we leave the folder and fix its note?**
