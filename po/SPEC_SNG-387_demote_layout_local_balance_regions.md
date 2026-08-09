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

⛔ **MY GUARDRAIL WAS WRONG AND ERIK OVERRULED IT. I had written that a local frame must never overturn
its world ground.** Erik: *"the local frame can very much overturn its world ground — that's how different
traditions INVADE and can be effective in an antipole. It takes planning and resources: carried
sinks/pools, high-tier crafts. But being local means the opposite to your craft can be brought to bear as
well, so the element of surprise is key."*

⚠️ **I was protecting a canon line by making the world static.** `theKeyImage` says *a Seraph in the
Quickwood is nearly powerless* — **and that is a Seraph who ARRIVED UNPREPARED.** A Seraph who arrives with
carried charge, a high-tier craft and a plan is a different proposition, **and that difference is a story
rather than a bug.** A ground that cannot be contested is scenery.

### §2a — ⛔ THE MODEL: GROUND IS CONTESTED, AND MOST OF IT ALREADY EXISTS

**Three layers, and two are already built:**

| layer | state | what it does |
|---|---|---|
| **carried** | ✅ **LIVE** — `carriedSubstrate`, negatives count, clamped ±1 | an expedition kit. Six charged items authored (SNG-381): keystone shard +0.09, far token +0.08, quiet stone −0.05 |
| **built** | ⛔ **MISSING** | a shrine, a ward, a reclamation works — **a source somebody MADE** |
| **authored** | ✅ live | the 43 world sources |

⚠️ **The carried layer already supports an invasion and nobody has noticed.** A party carrying five
keystone shards moves their ground **+0.45** — enough to take a Seraphic from starved to working in
mid-density country. **The kit exists; what is missing is the ability to plant a flag.**

### §2b — ⛔ THE BUILT SOURCE, AND IT IS ERIK'S SHRINE

> *"what if the Seraphs invade, win some battles and create a shrine outpost that powers nanite
> reclamation and has a REGIONAL effect? That should be possible. But the power and range depend on the
> items and their crafted skill."*

**A built source is a `substrateSource` a faction MADE**, and it should live on a HOLDING (SNG-358) rather
than as a free-floating field edit. ⚠️ **That convergence is the whole design and I did not see it until
Erik said "outpost":**

- **A holding already has a condition that moves both ways** — failing · strained · holding · thriving.
  ⛔ **So a shrine's substrate output IS its condition.** A thriving Seraphic shrine projects; a failing one
  projects nothing; an abandoned one decays back to the world value.
- **A holding already needs a steward and advances on WORLD days** (SNG-366). **So a planted source
  requires occupation to persist** — which is exactly what taking ground means.
- **Magnitude and radius scale with investment**, per Erik: the tier of the craft that made it, the charged
  items consumed into it, and how long it has been maintained.

**⚠️ AND THE COUNTER IS THE SAME MECHANIC, which is what makes it a game.** Erik: *"the opposite to your
craft can be brought to bear as well."* A Rootkin expedition carrying quiet stones and Ent-cleared wards
walks into a Seraphic shrine's radius and **suppresses it**. ⛔ **`carriedSubstrateSources` already returns
an itemised receipt naming the cause — so a defender can be told WHY their ground moved**, and the design
note on that function says exactly why that matters: *"the difference between a mechanic and the cruellest
possible bug."*

⚠️ **Surprise falls out of this without a stealth system.** A built source is visible on the map; a carried
kit is not. **You can see a shrine coming for a season. You cannot see five keystone shards in a pack**
— which is precisely Erik's *"the element of surprise is key most times."*

### §2c — NO RANGE CAP

**I proposed ±0.15 and Erik declined it.** ⛔ **A built source's reach should be earned, not bounded:** a
hasty ward is local and brief, a maintained shrine is regional and lasting, and the difference is what was
spent. ⚠️ **The natural ceiling is the authored world sources — 43 of them at +0.10 to +0.26 — so a
faction that out-builds those has genuinely changed the world**, and that should be rare, expensive, and
possible.

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
