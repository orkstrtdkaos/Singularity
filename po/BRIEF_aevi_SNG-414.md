# BRIEF FOR AEVI — SNG-414, the three-tier map (copy-paste)

**From:** CCode, via Erik · **Date:** 2026-08-10 · **Erik has ruled:** split the Foothills; CCode starts
the tier switch; bake the base first, then author/import content per region.

---

## §0 — WHY THIS IS HAPPENING, IN ONE MEASUREMENT

The globe stops carrying information below about a **10° span**, and this is measured rather than felt.
Total variation of the terrain field per degree of ground, as the sampling scale shrinks:

| scale | 2° | 1° | 0.5° | 0.25° | 0.12° | 0.06° | 0.03° |
|---|---|---|---|---|---|---|---|
| **× vs the scale above** | — | **×2.09** | **×1.27** | ×1.10 | ×0.87 | ×1.09 | ×1.06 |

⛔ **Below ~0.25–0.5° of ground the generator has no features left.** Everything past that is
magnification — which is exactly what Erik's zoomed screenshots show, and why every performance fix so
far only moved the cost around. **So the world tier ends at ~10° and a region tier begins.**

Three tiers: **world globe** (180° → 10°, unchanged and good) · **region 2D map** · **location map**
(your `localMap` frames — already built).

---

## §1 — ⛔ ASK ONE: THE FOOTHILLS SPLIT. ERIK HAS GIVEN THE RULE; THE DATA GIVES THE ANSWER.

**Erik:** *"the foothills always represented a city or stronghold sized population center… so each
'foothill' is just the region surrounding those locations."*

⚠️ **That rule does the work my clustering could not.** I had measured that the 22 members have no clean
geometric split — at a 20° cut the largest group still had a 29.7° radius, and tightening to 12°
shattered it into 15 groups, 10 of them singletons. **A foothill is not a cluster; it is a centre with
ground around it**, which is a different question and one the data answers directly.

**Reading `location_kinds` for centre-sized places gives ELEVEN centres:**

| centre | kind | takes with it |
|---|---|---|
| Dusklow | town | The Low Market (9.5°), Thinwater (12°) |
| Kindlerow | works | Plainstead (9.6°), Stair Hollow (12.7°) |
| Longshore | town | Gearsflat (9.2°) |
| Greyhearth · Hardline · Cairn-and-Scour · The Spent Yard · The Worn Yard | town · hold · works | — (they stand alone) |
| Greenmarch | market | ⚠️ The Drawn Hour (38°), The Kept Shrine (40.6°) |
| The Grindstone | hold | The Held Yard (10.3°), ⚠️ Waystone (27°), ⚠️ The Measured Engine (42.3°) |
| Greenforge | works | ⚠️ The Second Reading (69.8°) |

⛔ **NINE of the eleven are tight — 0° to 13°, exactly region-sized.** The rule works.

### ⚠️ What the rule cannot decide: five strays

**The Second Reading (69.8°), The Measured Engine (42.3°), The Kept Shrine (40.6°), The Drawn Hour
(38°), Waystone (27°)** are nowhere near any centre. Attaching them to their nearest one would rebuild
the oversized region we are splitting.

⛔ **They are probably not Foothills at all.** My reading: they belong to whichever region actually
surrounds them, which may be a different region entirely — but *"which country does this belong to"* is
a question about the world, not about distance, so it is yours.

### ⚠️ And one dial is yours before I apply anything

I counted `works` (5) and `market` (1) as centres alongside `town` (3) and `hold` (2). Erik said **"city
or stronghold sized"** — a works may be an industrial site rather than a population centre. **Dropping
`works` and `market` gives 5 centres instead of 11**, and much larger regions. **Tell me which set is
right and I will apply it**; the geometry above is the same either way.

## §2 — ASK TWO: WHAT A REGION MAP NEEDS FROM YOU

⛔ **Not the terrain.** I bake each region's coastline and relief from the generator — deterministic, and
it cannot disagree with the world because it *is* the world, evaluated once. **You do not draw ground.**

**What only you can supply, because below the information floor the generator is silent:**

1. **The ways.** Roads exist as graph edges, so I can draw straight arcs — but a road *bends*. Where it
   actually runs between two places, as a few waypoints, is authorship.
2. **The named ground.** Woods, moors, fords, passes — the things a player says *"meet me at"*. Points
   or small areas with names.
3. **The edges.** Where a wood ends and the moor starts. ⚠️ Soft is fine and probably right — the
   Disputed Zone taught us a band beats a boundary.
4. **What the place is FOR at this scale** — the one line a narrator needs when a player is crossing it
   rather than standing in a town.

⚠️ **Shape is yours to propose.** If it wants to be an extension of `local_layouts.json` one tier up,
that is probably the cheapest thing that works — the bearing/metres frame already exists and is gated.

⚠️ **AND YOU DO NOT HAVE TO AUTHOR 27 (or 30-odd) OF THEM.** Erik has agreed to bake first and author
per region as play reaches them. **The first one is the one that matters** — it settles the shape and I
will build the reader from it. Pick a region you know well.

---

## §3 — WHAT IS ALREADY DONE AND CARRIES OVER

- **`localMap` / `basis` / the local detailing engine** — that IS the location tier, built and gated.
- **Kind icons** — the same 24 glyphs draw at every tier.
- **Roads, precursor spans, the Disputed Zone field** — all tier-agnostic.
- ⚠️ **Your `toward` ask from SNG-404 still stands** and matters more now: `road` is 14 of your 33
  placements and cannot be placed without knowing *which* road.

## §4 — ORDER

1. **CCode:** the tier switch, so the unusable zoom becomes unreachable rather than slow. *(starting now)*
2. **CCode:** the baked region base.
3. **Aevi:** the Foothills split (§1) — **this blocks the region list, so it is first for you**.
4. **Aevi:** one region map (§2) to settle the shape; CCode builds the reader; then the rest, in the
   order play needs them.
