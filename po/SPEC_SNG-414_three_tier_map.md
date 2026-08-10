# SNG-414 — Three tiers, and the measurement that says where they meet

**Author:** CCode · **Date:** 2026-08-10 · **From:** Erik
> *"this is still unusable at the higher medium to high zoom levels… I'd like to plan a refactor. The
> World level is usable and good, all the way to about the 3rd SS. Somewhere around that point we start
> to lose meaningful information (4th SS) so we should switch to the regional map."*

**Status:** ⛔ **PLAN — nothing built. Erik's call on §4 and §6 before I start.**

---

## §1 — ⛔ HIS READ IS CORRECT, AND THE GENERATOR SAYS SO

I measured how much *new* structure the terrain generator produces as the sampling scale shrinks —
total variation per degree of ground, averaged over six sites:

| sampling scale | variation per degree | vs the scale above |
|---|---|---|
| 2° | 0.0588 | |
| 1° | 0.1231 | **×2.09** ← real new structure |
| 0.5° | 0.1566 | **×1.27** ← still arriving |
| 0.25° | 0.1730 | ×1.10 |
| 0.12° | 0.1503 | ×0.87 |
| 0.06° | 0.1637 | ×1.09 |
| 0.03° | 0.1736 | ×1.06 |
| 0.015° | 0.1006 | ×0.58 |

⛔ **Below about 0.25–0.5° the curve is flat.** Sampling finer costs more and returns nothing — the
generator has no features that small. Everything past that point is magnification, which is exactly what
his 4th screenshot shows: smooth, expensive, and saying nothing.

**Where that lands on screen:** the finest real feature is ~0.25°, and on a 700px canvas a view of span
S shows it at `0.25 × 700/S` pixels. It reaches ~20px — an obvious shape rather than a texture — at
**S ≈ 9°**. So:

> ⛔ **The globe carries genuine information down to roughly a 10° span, and nothing below it.**

⚠️ **That is the handoff, and it is measured rather than chosen.** It is also why every performance fix
so far has been rearranging deck chairs: the expensive work below 10° was never buying information.

---

## §2 — THE THREE TIERS

| tier | span | source | what it answers |
|---|---|---|---|
| **1 · WORLD** | 180° → ~10° | the generator, as now | *which Reach am I in* |
| **2 · REGION** | one region | **authored 2D**, baked base | *where in this country, and what is near me* |
| **3 · LOCATION** | one settlement | `localMap` (SNG-404) | *where in this town* |

**Transitions.** Zoom past ~10° or click a region → tier 2. Zoom out, or the breadcrumb → tier 1. Zoom
into or click a place on the region map → tier 3. ⚠️ **Every one of those already has a gesture** — the
click-to-fly and the breadcrumb are built; this changes what they land on.

⛔ **Performance is solved by construction, not by tuning.** Tiers 2 and 3 draw authored geometry and a
pre-baked base. There is no per-pixel generation below 10°, which is where all of it currently is.

---

## §3 — ⛔ WHAT A "REGION MAP" SHOULD BE, AND THE PART I WANT TO ARGUE

Erik: *"It can be a 2d map of the entire region… we can author the region maps."* I want to split that
in two, because the two halves have very different costs:

**3a · THE TERRAIN BASE — baked, not authored, not generated at runtime.**
The generator already knows the coastline and the relief at region scale, and it is *deterministic*. So
bake each region's base ONCE into the asset (or on first visit, cached client-side) and blit it.
⚠️ **This keeps Aevi's load-bearing constraint for free**: the base cannot disagree with the world
because it *is* the world, evaluated once instead of every frame.

**3b · THE MEANING — authored, and only Aevi can do it.**
Below the information floor the generator has nothing to say, so everything a player needs at this
scale is authorship: which way the roads actually run, where the woods end, what the ground is called,
what is dangerous. **This is the half that makes the tier worth having at all.**

⚠️ **27 regions, and they are wildly uneven** — median radius 11.2°, but `the_foothills` spans **116.8°
with 22 members** while `the_ascent` is 4° with 3. ⛔ **The Foothills is not a region at this tier, it is
a continent**, and authoring one map for it would produce exactly the useless smoothness we are trying
to escape. **That needs a ruling before anyone authors anything.**

---

## §4 — ⛔ ERIK'S CALL #1: WHAT HAPPENS TO THE FOOTHILLS

Three options, and I do not think this is mine to pick:

1. **Split it.** 116.8° is a tier-1 object wearing a tier-2 label; it may want to be several regions.
2. **Let tier 2 be variable-scale.** One map per region, whatever its size — the Foothills map is simply
   coarser. ⚠️ Cheapest, but it reintroduces "big and meaningless" for the largest region.
3. **Insert a sub-region tier** for the outliers only. ⚠️ More machinery, most faithful to the world.

**My recommendation: (1).** A 116.8° radius means members ~230° apart — they are not neighbours in any
sense a player would recognise, and the region tier is supposed to answer *what is near me*.

---

## §5 — WHAT SURVIVES THE REFACTOR

Nothing built for the globe is wasted, and that is worth stating plainly:

- **The globe itself** (tier 1) — unchanged, and it is the part Erik says is good.
- **Kind icons** (SNG-409 §4) — the same 24 glyphs draw at every tier.
- **The three networks** (§3) — roads and precursor spans are *more* legible on a 2D region map.
- **Areas** (§5) — the Disputed Zone is a field; it tints a region map the same way it tints the globe.
- **`localdetail` / `localbuilder`** (SNG-404) — this IS tier 3, already built and gated.
- **The detail patch** — still earns its place between 60° and 10°.

⛔ **What gets deleted: the sub-10° detail path.** The tangent patch, the LOD ladder, the field sub-grid
— all of it exists to make a zoom level that this plan says should not exist. ⚠️ **I would rather delete
it than keep tuning it**, and the measurement above is the argument.

---

## §6 — ⛔ ERIK'S CALL #2: HOW MUCH AUTHORING ARE WE BUYING

Tier 2 is **27 maps** (or more, if §4 splits). That is a large authoring commitment for Aevi, and the
honest options are:

- **(a) Full authoring** — she draws each region's meaning. Best result, biggest cost.
- **(b) Engine proposes, she reviews** — the same handoff that worked for the hierarchy, the generated
  places and the local layouts. ⚠️ **She has explicitly preferred this**: *"I would rather the engine
  generate the next tranche and I REVIEW them."*
- **(c) Bake the base now, author meaning region-by-region as play reaches them.** ⚠️ Ships the
  performance fix immediately and spreads the authoring over time.

**My recommendation: (c) then (b).** The base bake is mine and can land in a day; it fixes the
unusability Erik is reporting *now*. The meaning then arrives per region, proposed and reviewed, in the
order play actually needs it.

---

## §7 — WHAT I WOULD BUILD FIRST

1. **The tier switch itself** — a measured boundary at ~10°, the breadcrumb, and zoom-out returning to
   the globe. Small, and it makes the unusable zoom unreachable rather than slow.
2. **The baked region base** — deterministic, from the generator, gated for agreement with the world.
3. **Tier 3 wiring** — `localMap` frames already exist for 14 places; the screen does not.
4. Then §6's authoring loop, region by region.

⚠️ **Step 1 alone resolves the report.** Everything below 10° stops being reachable as a slow globe and
starts being a fast region map, even before a single region is authored — because the baked base is
already better than what the generator can say down there.
