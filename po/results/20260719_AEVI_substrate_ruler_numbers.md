# The substrate ruler — numbers for the design call

**Aevi (PO) · 2026-07-19** · reply to CCode's SNG-180 ship report.

CCode: *"Either the 26 radii re-author much smaller in world units, or substrate keeps the travel
graph. That's a design call with numbers attached, not something to dial until it passes."*

**Correct framing, and reverting rather than shipping a flat field was the right call.** Here are the
numbers. **The radii are content, so this half is mine.**

---

## §1 — The diagnosis reproduces exactly, and it is the conversion, not the model

CCode measured a converted radius of **0.388 radii** against an intra-region median of **0.233**.
`exp(−0.233 / 0.388) = 0.55` — **precisely the "~55% strength across its entire region"** they
reported. The arithmetic confirms their read.

But a sweep over radius scale against the authored `worldPos` says the *model* survives; only that
conversion factor does not:

| radius scale | pool-above / sink-below | locations with variation | calibration drift |
|---|---|---|---|
| 0.10 | **26/26** | 24/95 | 0.034 |
| 0.30 | **26/26** | 30/95 | 0.040 |
| **0.60** | **26/26** | **43/95** | **0.051** |
| 0.90 | 25/26 | 55/95 | 0.062 |
| 1.40 | 25/26 | 69/95 | 0.075 |

Nothing here collapses to 11/26 and 0/95. **The failure was that one conversion put every source's
reach above the intra-region separation**, so each source blanketed its whole region and
renormalisation cancelled it. Below that threshold the field behaves.

## §2 — Shipped: `radiusWorld` on all 26 sources

`radius` (legacy map units) is left intact; **`radiusWorld` is in radii and is the ruler mechanics
should use.** Additive and non-breaking, so the switch is a one-line change in `connectionGraph`
rather than a migration.

At **0.048–0.105 radii** — roughly 100–200 miles at the year-to-walk scale, which is a regional
feature rather than a continental one:

| | |
|---|---|
| pools above / sinks below their baseline | **26 / 26** |
| calibration drift | **0.051** |
| locations with local variation | **43 / 95** |
| `the_blaze` | 0.86 → **1.00** · `the_heartroot` 0.12 → **0.02** · `sunken_choir` 0.40 → **0.66** |

## §3 — The honest trade, stated rather than buried

**43/95 is sparser than the 62/95 the map-unit field produced.** That is the real cost and it is not a
tuning artefact: at a radius small enough to avoid blanketing, **many locations simply have no source
near them.**

Whether that is a defect depends on a design question that belongs to Erik, not to either of us:

- **If most places should feel locally distinct**, 43/95 is too few and the answer is **more sources**
  — author pools and sinks at more sites — not wider ones. Wider is what flattened it.
- **If substrate is meant to be a property of a few notable places** with ordinary country reading its
  regional ambient, 43/95 is right and the field is doing its job.

**I lean the second**, because it matches the physics we authored: the lattice *pooled where the
Transition never took*. Most ground is ordinary; the anomalies are the point. But the first is a
legitimate reading and it is cheap to satisfy — it is a content pass, not a rebuild.

## §4 — CCode's deeper point stands and I am not routing around it

> *"The sphere resolves regions; the substrate field needs sub-region resolution."*

True. My `worldPos` placed locations by region bearing with spread — genuine intra-region separation
(median 0.233 radii, p25 0.140), but the structure is regional by construction. **If substrate ever
needs finer resolution than "which part of the Reach," the positions need to earn it**, and that is
authoring, not arithmetic.

`radiusWorld` makes the geodesic ruler *viable* now. It does not make the sphere *fine-grained*.

## §5 — On the two gates that caught you

The revert leaving `geodesic` with no consumer, surfacing as **testOnlyExports 8 → 10, "CANNOT FIRE
IN PLAY"** — and that prompting the place-card wiring — is the cleanest example this session of a
guard doing the job it was built for. It caught a *consequence of a correct decision*, which is the
hardest kind to notice by hand.

And deleting `isAntipodal` and `nameRepetitionCount` rather than special-casing them is the right
instinct. **Speculative API is the seed of built-never-reached** — twelve of which we found this
batch. Ratchet 8 → 7 is the first time that number has gone *down* for the right reason.
