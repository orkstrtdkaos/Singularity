# Proposal — per-location substrate, and why coordinates are the wrong driver

**Aevi (PO) · 2026-07-18 · Erik-directed. NOT SHIPPED — needs ratification, see §4.**

## §1 — The hook already exists

`engine/substrate.js:95`:
```js
if (typeof location.substrateDensity === "number") return location.substrateDensity;
const d = data.substrateDensity?.[region];   // fallback
```
Per-location override is read FIRST. **Zero locations carry it.** The planned tie is built and unused —
the ninth instance of that pattern this batch.

## §2 — The problem is real: density is a step function

Substrate is authored per REGION (25 values, 0.12–0.98). Every location in a region shares one number,
so a region border is a cliff. Worst cases, measured:

| move | step |
|---|---|
| `the_quickwood_eaves` → `ent_deepwood` | **0.12 → 0.90 in one move** |
| `the_quickwood_eaves` → `dw_the_thinedge` | 0.12 → 0.90 |
| `the_blocklands` → `tumbledown_market` | 0.90 → 0.28 |
| `the_greenward` → `the_axis_gate` | 0.12 → 0.70 |

Mean cross-region step: **0.287.** For a Rootkin (band centred ~0.18) walking out of the eaves, that is
full power to deep interference by stepping through a treeline, with nothing in the fiction to warn them.
AMENDMENT_1's band model makes this worse, not better: both directions hurt now.

## §3 — Coordinates are the wrong driver. Tested, not assumed.

**Inverse-distance interpolation over region centroids performs badly.** It smears interiors:

| location | region says | coordinate field says |
|---|---|---|
| `the_blaze` | 0.86 | **0.34** |
| `disputed_zone_fringe` | 0.40 | **0.90** |
| `the_blocklands` | 0.90 | 0.63 |

A deep Radiant site drops to 0.34 because it sits near thin neighbours. That destroys regional identity,
which is the thing the whole model is built on. Mean |Δ| 0.105, max 0.52 — the field disagrees with
authored canon almost everywhere, and canon is right.

**Two reasons coordinates fail here:**
1. They are hand-placed for *legibility*, not distance-accuracy. Evidence: `ent_deepwood` and
   `the_lampless_market` both sit at exactly `(40,300)` — a pre-existing collision I found while
   authoring the Palelands. Coordinates carry errors that a mechanic would inherit silently.
2. Euclidean nearness is not travel adjacency. Two places can be close on a flat map and unreachable.

## §4 — What I recommend instead: blend along CONNECTIONS

A location's density = its own region's value, pulled toward the regions it actually **connects** to:

```
d_loc = d_region + α · (mean(d of cross-region neighbours) − d_region)      α = 0.30
```

Interiors are untouched by construction (no cross-region connection ⇒ no change).

| result | |
|---|---|
| locations gaining an override | **35 of 95** |
| interiors unchanged | **60** |
| worst cliff | 0.78 → 0.35 (**55% softer**) |
| mean cliff | 0.287 → **0.170** |

**The fiction already agrees.** The locations it touches are the ones authored as `border` / `liminal` —
`the_quickwood_eaves`, `the_greenward`, `the_hollowing`. A border location being *mechanically* between
two densities is what a border IS. The tag and the number stop disagreeing.

Coordinates still earn a job: **validation, not derivation.** If two locations blend into each other,
they should be plausibly near on the map. Coordinate distance becomes a CI check on the travel graph
rather than a source of mechanics.

## §5 — WHY THIS IS NOT SHIPPED

`the_substrate.json :: tuningNote`, still standing:

> ⚠️ THE CURVES ARE NOT TUNED… **SNG-078's balance harness must exist before these numbers are
> trusted — do NOT eyeball them.** (CCode's ROUND-2 blocker, accepted.)

Adding 35 per-location numbers is exactly the eyeballing that blocker forbids. Two things are being
conflated and should not be:

- **The cliff is STRUCTURAL.** A 0.78 step in one move is wrong whatever the endpoint values are.
- **α = 0.30 is a TUNING NUMBER.** I picked it because it looked right. That is the forbidden move.

**Ruling needed, Erik:**
- (a) ship the structure with α as a single named constant, accept it is untuned, and let the harness
  correct it later — the cliff is fixed now and one constant is easy to retune; or
- (b) hold until SNG-078 exists, and the cliffs stay.

I lean (a) — one constant in one file is the cheapest possible thing to retune, and the current
behaviour is a cliff nobody chose. But this is the blocker CCode raised and you accepted, so it is
yours to lift.

## §6 — Also needed either way (§54 of SNG-090 ROUND 2, unbuilt)

A silent success-chance penalty was called *"the cruellest possible bug."* The receipt line, GM context
line, and map overlay are all still unbuilt. **Whatever we do with density, the player must be able to
SEE it** — otherwise this is a hidden modifier, which is worse than a cliff.
