# SNG-390 — Integrating the world map into the game

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Origin:** Erik, after the prototype
**Status:** spec_ready · **Prototype:** `singularity_world_v2.html` (not in-repo; it is a viewer, not the source)

---

## §1 — ⛔ WHAT IS CANON AND WHAT IS DERIVED. This is the whole ticket.

| | | where it lives |
|---|---|---|
| **AUTHORED — canon** | `worldPos` on 118 locations · `biome.byRegion` (27) + `byLocation` (22) · `naniteField` (27) · `substrateSource` (43) · `connections` (165) · `sourceBands` | already in the repo |
| **DERIVED — reproducible** | terrain type · elevation · rivers/lakes/marsh · roads · precursor lines · region seats | ⛔ **nothing yet** |

⛔ **THE DERIVED LAYER MUST SHIP AS A GENERATOR, NOT ONLY AS OUTPUT.** A baked raster with no
reproducible source is a 250 KB asset nobody can re-derive after the next content change — and content
*will* change. **Ship `scripts/generate_world.mjs` + its output; regenerating must be a build step, not an
archaeology project.**

⚠️ **This is the same failure class as `map.x/y`:** a second representation that can silently drift from
the first. **The generator is what stops that** — it takes canon in and produces terrain out, so drift is
impossible by construction.

## §1a — Determinism is required, not nice-to-have

The terrain uses noise seeded by longitude/latitude, no RNG — **so it is already deterministic.** ⚠️ **Add a
gate: regenerate and diff. A byte-identical result proves the world did not move.** If a content change
*does* move it, that is information, and the diff is where it should surface.

---

## §2 — WHAT THE ENGINE SHOULD READ, AND WHAT IT SHOULD IGNORE

⛔ **START BY READING NOTHING.** The map is a *view* first. Every mechanic below is optional and separable,
and shipping the viewer alone is a complete deliverable.

### §2a — ⚠️ TRAVEL: measured, and the honest answer is "mostly no"

I routed all 84 short roads as least-cost paths over real terrain and compared to the geodesic
`walkingDays` the engine uses now:

| | |
|---|---|
| median road / straight-line | **1.05×** |
| mean | 1.09× |
| worst | ⛔ **2.37×** — 26.7° straight becomes 63.2° by road |

⛔ **DO NOT REWRITE `walkingDays` GLOBALLY. A 5% median correction is noise** and would churn every
authored distance for nothing.

⚠️ **But the tail is real geography.** Three roads exceed 1.6×, and those are places where a range or a
lake genuinely doubles the journey. **Proposal: an optional `roadFactor` on the ~6 edges above 1.3×,
authored from the routing.** Everything else keeps the geodesic. **Small, defensible, and it only touches
edges where the terrain has something to say.**

### §2b — What terrain could feed later, in order of value

1. **Encounter flavour** — the GM already gets `ctx.location`; adding `terrain: {biome, elevation, water}`
   lets it say *"the road climbs"* without inventing it. ⚠️ **Cheapest win, no mechanics.**
2. **The `dependsOn` card (SNG-376 §5a)** — a craft's ground is now visible per-pixel, so *"where is this
   strong"* becomes answerable on a map.
3. **Provisions and camps (SNG-331)** — a routed road knows how many nights are away from a settlement.
4. ⛔ **Nothing else.** Do not gate combat, resources or events on terrain without a design pass.

---

## §3 — THE THREE NETWORKS, AND THEY ARE INDEPENDENT (measured)

| network | follows | count |
|---|---|---|
| **roads** | terrain — 16 percentile points lower than a straight line | 84 routed |
| **precursor lines** | ⛔ **nothing.** Straight spans between the 43 lattice-surfacing sites | 49 |
| **waygates** | ⛔ **neither** | 26 |

⚠️ **I tested whether waygates sit on the Precursor network and they do not: 1.1× closer to substrate
sources than chance, 2 of 26 within 3°. Statistically nothing.**

⛔ **Keep that.** Three unrelated networks says the Precursors laid the lines, someone else built the
gates, and people walk neither — **which is why `wake_the_line` exists as a craft at all.** You only rouse
a road nobody has been using.

**`old_roads` now has something to render:** *"sense, follow, and safely approach Precursor traces."* That
craft, and only that craft, should reveal the cyan layer.

---

## §4 — WHAT I NEED FROM CCODE

1. **`scripts/generate_world.mjs`** — port the generator; canon in, terrain out, deterministic.
2. **`content/packs/core/world/terrain.*`** — the baked layers, regenerable by 1.
3. **A determinism gate** — regenerate, diff, fail on unexplained change.
4. **The viewer**, wherever the app wants a map. ⚠️ **Read-only. It must not become a second source of
   position.**
5. ⛔ **NOT `roadFactor` yet** — §2a is a proposal with a measurement attached, and Erik has not ruled.

---

## §5 — WHAT IS STILL MISSING, HONESTLY

- **Names.** Seas, ranges, fens and rivers are *detected* and unnamed (SNG-389 §3).
- ⚠️ **Inland water at settlements is PLACED, not drained.** Pure hydrology put water near 3 of 118
  locations; the 16 whose own text demands water had it placed there deliberately. **The rivers are real
  where the descriptions are; elsewhere they are drainage.**
- **Regional maps** — the next tier, and the one a player will actually spend time in.
