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


---

# REVISION 2 — Erik was right to push back. I tested the wrong model.

**2026-07-18, after Erik asked to revisit coordinates.**

## What I actually rejected in §3

Inverse-distance interpolation **over region centroids** — i.e. "blend between each region's average."
That is not Erik's model and never was. His words were: *"the nanite substrate must vary by geography
and will TEND to pool in places they never made the transition."*

**Pools are POINT SOURCES at specific sites.** Region-centroid interpolation treats each region as a
uniform blob emitting its own average. Those are different physics, and my rejection of the second
says nothing about the first. Recorded as a real error: I dismissed a directive by testing a
strawman of it.

## The pooling model, tested

Pools = high-density sites with untransitioned character (`precursor`, `locus`, `deep`, `machine`,
`arcology`, `ruin`…). 34 identified. Field = strongest pool's reach, exponential falloff.

| result | |
|---|---|
| **`the_blaze` — the case that killed IDW** | authored 0.86, field **0.86 — exact** |
| `ent_deepwood` | 0.90 → 0.86 |
| region-mean calibration error | **0.085** |
| regions gaining genuine internal variation | 9 of 25 |
| cliffs | mean 0.287 → 0.199, worst 0.78 → 0.46 |

**Pooling preserves the deep sites**, because under this physics a deep site IS a source — the field
at its own location is its own strength. That is the exact failure that sank interpolation, and it
does not occur here. **Coordinates are load-bearing in this model in a way they were not in mine.**

## The Quickwood exposes the missing half — of Erik's own canon

Pools alone flood the Quickwood: authored **0.12**, field **0.53**. Badly wrong, and diagnostic.

`the_substrate.json :: whyTheQuickwoodIsEMPTY` already says why: the Rootkin **completed** the
Transition. The lattice did not fail to gather there — **it withdrew.** So the physics needs both:

- **POOLS** — untransitioned sites where the lattice collected.
- **SINKS** — completed-Transition ground that drains it.

With sinks added, the Quickwood reads **0.06**. Correct, and for the authored reason.

## Where it stands, honestly

| model | calibration err | Quickwood | the_blaze | worst cliff |
|---|---|---|---|---|
| authored region step-function (today) | — | 0.12 ✓ | 0.86 ✓ | **0.78** |
| region-centroid IDW (rejected §3) | 0.105 | 0.52 ✗ | **0.34 ✗** | — |
| connection-blend (§4) | — | 0.12 ✓ | 0.86 ✓ | 0.35 |
| **pools only** | **0.085** | 0.53 ✗ | **0.86 ✓** | 0.46 |
| **pools + sinks** | 0.209 | **0.06 ✓** | 0.40 ✗ | 0.47 |

Pools+sinks is **structurally right and numerically untuned** — it over-drains. Four eyeballed
parameters: pool threshold, pool falloff scale, sink threshold, sink falloff scale.

## The recommendation that removes half the tuning

**Author the pools and sinks instead of inferring them.**

Deriving pools from `tags + region density ≥ 0.55` is a guess dressed as a rule, and two of the four
parameters exist only to support the guess. Instead put them in content:

```json
"substrateSource": { "kind": "pool" | "sink", "strength": 0.9,
                     "reason": "the machines here never stopped" }
```

- **Removes 2 of 4 tuned parameters.** Only the falloff scales remain.
- **Makes the map a designed artifact**, not an emergent accident — a place is a pool because someone
  decided it is, with a stated reason, the same discipline BATCH-12 §1d requires of every density.
- **Region density becomes derived, not authored** — a check rather than an input. If the field's
  regional mean drifts far from the authored table, that is a content bug the CI can name.
- **Generation gets a rule**: a new location near a pool inherits high density with a legible cause.

**The two falloff scales remain genuinely untuned and are exactly what SNG-078's harness is for.**
That blocker is unchanged and I am not proposing to eyeball past it. But the shape of what gets tuned
is now two numbers with a physical meaning, rather than an interpolation constant with none.

## Recommendation

Supersede §4's connection-blend with **authored pools and sinks over map coordinates**. Connection-blend
was a decent fix to a symptom; this is the mechanism Erik described, it explains the authored numbers
instead of merely smoothing them, and it makes coordinates mean something.

**Erik's ruling needed on:** whether pool/sink authoring is a content pass he wants (25 regions, maybe
40–50 sites), and whether the two falloff scales wait for SNG-078 or ship as named constants.
