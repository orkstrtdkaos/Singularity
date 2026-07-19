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


---

# REVISION 3 — SHIPPED. Erik ratified; geographic pass authored, mobile sources specced.

## What shipped

`substrateSource` on **26 sites — 18 pools, 8 sinks** — each with a `reason` in prose.

```json
"substrateSource": { "kind": "pool", "strength": 0.97, "radius": 160,
                     "reason": "The Blaze burns on lattice, not on fuel. It has been drawing it inward since before the Transition." }
```

**`strength` is the density AT the source**, not an abstract magnitude. Region density stays the
regional **mean**, so a pool rises above its own region's ambient and a sink falls below it, and the
authored calibration is preserved by construction rather than by tuning.

```
d_loc = region_base + max(pool_delta · falloff) − max(sink_delta · falloff)
falloff = exp(−distance / radius), with compact support (nothing past radius × 2.5)
```

**Verified locally before ship** (content_ci + full npm suite green; origin content-hash verified on
an authenticated API read):

| | |
|---|---|
| region-mean drift from authored | **0.059** — calibration held |
| locations with real local variation | **62 of 95** |
| `the_blaze` | 0.86 → **0.92** (pool rises) |
| `the_great_engine` | 0.98 → **1.00** |
| `the_heartroot` | 0.12 → **0.08** (sink falls) |
| `sunken_choir` | 0.40 → **0.68** — a pre-Transition ruin reading high in ordinary valley country |

`sunken_choir` is the result that shows the model earning its place: a flooded pre-Transition work
now reads as an anomaly **because of what it is**, with an authored reason, without anyone tuning a
number for it.

## ⚠️ One result that did NOT go my way, reported plainly

**Cliffs got slightly worse: mean 0.287 → 0.312, worst 0.78 → 0.76.**

Pools and sinks add local variation **on top of a step function**. Raising one side of a border can
widen the step. The cliff problem needs the *base* to be continuous, which is what the §4
connection-blend did.

**They are orthogonal, and both are available.** Pooling gives Erik the geography he asked for and
makes coordinates load-bearing; connection-blend fixes the seams. Composing them is a further
ruling, not a hidden consequence — recording it here rather than letting the number pass quietly.

## Two errors in my own verification, banked

1. **The first verification formula was malformed** — a dead `if False else` branch. It ran, produced
   plausible numbers, and I nearly reported them.
2. **Every pool's strength was initially set equal to its region's baseline**, so pools created no
   rise at all and only sinks bit. The output looked like a working model and was measuring almost
   nothing.

Both are the session's named failure — *a number that looked like a finding* — occurring inside the
verification step meant to catch it. Caught by checking whether `the_blaze` moved in the direction
the physics required, which is the cheap test I should reach for first.

---

# §M — MOBILE SOURCES (Erik's extension — the model's second half)

> *"Carried/created items and perhaps creatures can have abilities that act as an immediate-area
> sink/pool with varying strength and range. Memory's capacitor is exactly this type of pool, as is
> the Waystaff's charged crystal lattice. This is how Epic NPCs travel the world without as much
> difficulty as one might assume. There should probably be SKILLS with these aura sink/pool
> properties as well."*

This unifies the model: **the substrate field is generated by sources, and a source need not be a
place.** Same `substrateSource` shape, three new carriers.

## M1. Items

```json
"substrateSource": { "kind": "pool", "strength": 0.15, "radius": "self|party|site",
                     "reason": "the capacitor holds a charge the country around it cannot" }
```

Composes into the existing `carried` term, which canon already defines correctly as two-sided:
*"it helps whoever is below their band and HARMS whoever is above it."* An item source is not a
separate multiplier — it moves local density, and the band model does the rest.

- **Memory's capacitor** — a player-evolved item that became a pool through play. This is the case
  that proves items must be able to *acquire* the property, not only be authored with it. Ties to
  `itemUpdates` and the evolution engine.
- **The Waystaff** — authored: *"pale crystal nodes… tuned to catch and carry the old frequencies."*
  The description already says it is a pool; the data never did.
- **A suppressor is a weapon.** Carrying an Ent-embassy ward into the Gearlands protects a Rootkin
  and cripples an Enginewright. Falls out of the physics rather than being bolted on.

## M2. Creatures and Epic NPCs

**This is Erik's explanation for how Epic NPCs travel**, and it is a good one: they are not tougher
travellers, they **carry their own weather**. An Epic NPC with a personal pool stays inside their
band across country that would starve anyone else — which also makes them *detectable*, and makes
travelling in their company a real and legible benefit.

## M3. Skills with aura properties

A craft that pools or thins the substrate around its user for a duration — the ability equivalent of
a held breath. Sits naturally beside the harm-rung and function vocabulary already authored, and
gives the 24 traditions another axis on which to differ in idiom rather than in numbers.

## M4. What this needs before it can be built

1. **A field resolver that accepts moving sources.** Static geography can be precomputed; a party
   carrying two items and an Epic NPC cannot. The resolver must take `(position, carried, present
   actors)` — a real change to `substrate.js:locationDensity`, and the reason this is spec work
   rather than a content pass.
2. **Visibility, again.** SNG-090 ROUND 2 §54 called a silent success-chance penalty *"the cruellest
   possible bug."* A mobile source makes that worse: the ground changes because of what someone
   **walked in with**. The receipt line must name the cause — *"the Waystaff is holding the frequency
   here"* — or this becomes unexplainable at exactly the moment it matters.
3. **`bonusTags`** should carry a readable marker (`substrate-gathering`, `lattice-warded`) so the
   GM and the player can see it without opening a stat block — per BATCH-12 §2.
4. **The two falloff scales remain untuned** and are still SNG-078 harness work. Unchanged.


---

# REVISION 4 — RETRACTION, and the spec restated as outcomes

**CCode stopped on this and was right to.** Recorded plainly.

## What I got wrong

1. **The published numbers are not reproducible from the repo.** My verification ran from an
   uncommitted script in `/tmp`. Anyone checking my work had to reconstruct the formula from prose.
   That is not a verifiable claim; it is an assertion with decimals on it.
2. **The formula had a load-bearing detail no reader could infer**: each source's delta was measured
   against **its own region's** ambient, not the target location's. That is why a faithful reading of
   the prose moves `the_blaze` the wrong way.
3. **I specced a resolver that already exists.** `carriedSubstrate` has read `item.substrateCharge`
   and `companion.substrateAura` since before this session. Erik's correction — *"USE the engines"* —
   is exact. The gap is that it accepts positives only, so it does pools and not sinks.

**All published per-location numbers in REV2 and REV3 are RETRACTED.** Not "pending confirmation" —
withdrawn. The authored content stands; the numbers attached to it do not.

## What replaces them: outcomes, not arithmetic

The invariants now live in **`SYSTEM_SPEC.md §9b`** and are the contract:

1. pool site resolves above its region's density; sink site below
2. regional means stay close to the authored table (calibration is the target, not the output)
3. influence falls with distance and reaches zero
4. mobile and geographic sources compose through the existing `effectiveDensity` path
5. never a silent modifier — receipts name the cause, including a carried one
6. every location resolves a density (CI, as today)

**CCode owns the math.** Kernel shape, falloff form, and whether the field is precomputed into
`location.substrateDensity` (the hook `locationDensity` already reads first) or resolved live are
engineering decisions, not PO decisions. If a simpler function satisfies the invariants, it is the
better one.

**The falloff scales remain untuned and the `tuningNote` blocker stands.** Any constants that land
before `tests/balance_sim.mjs` exists are provisional by definition and should be named in one place
so the harness can move them.
