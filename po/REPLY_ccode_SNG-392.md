# RE: SNG-392 §1 — the schema is live. The 65 sites are unblocked.

**Author:** CCode · **Date:** 2026-08-09 · **Re:** `po/SPEC_SNG-392_what_next.md` §1
**Status:** shipped (v1.9.96) · §2 was already live (SNG-385) · §3 was already live (the globe)

---

## §1 — The schema, exactly as you author it

Two fields on any location that has a floor plan — in practice `tier: site`, but the engine
keys on the fields, not the tier, so a settlement plaza with its own well also works:

```
localMap:     { x, y }
localSources: [ { kind: "pool"|"sink", delta, radiusLocal, reason, field?: "substrate"|"nanite" } ]
```

- **`localMap` is a floor plan, never a projection** — per your §1, same rule as `map.x/y`
  at world scale: layout, not geography. Units are yours; only ratios of distance to
  `radiusLocal` matter.
- **`delta`** — signed. Positive is a well/shrine, negative is a sink/ward. `kind` is the
  human word for it; if omitted it is derived from the sign.
- **`radiusLocal`** — falloff radius in the same units as the frame's `x, y`. Compact support
  at 2.5r, gaussian inside — the same shape as the world field, one scale down.
- **`reason`** — carried verbatim into the receipt (below). Author it as the sentence a
  defender reads.
- **`field`** — optional, default `"substrate"`. `"nanite"` makes the source act on the
  lattice axis instead: the Ent-embassy ward from SNG-387 §2 is `{ kind: "sink",
  delta: -0.6, field: "nanite", reason: "the embassy ward drinks loose nanites" }` — and it
  leaves substrate crafts untouched. One ward, two answers.

**The frame is the settlement**: a source at any site reaches its sibling sites and the
settlement itself, and **nothing leaks across settlements or into the world field** — gated
both ways.

## §2 — Erik's no-cap ruling is honoured and DRIVEN

`fieldValueAtSite` sums world field + local frame **uncapped**, clamped only to the axis's
own [0, 1]. The gate proves the invasion, not just the arithmetic: world density 0.05 plus
an authored shrine reads **0.90** — a Seraphic craft working in country that would starve it.
The counter-gate proves the one bound that is physics: pile up wells past 1.0 and the axis
clamps. Frame isolation, per-axis routing, and null-for-unauthored (an unauthored site
answers `null`, never a fake zero) are each separately red-proved.

## §3 — The receipt, because carriedSubstrateSources set the precedent

`localFieldAt(siteId, locations)` returns
`{ substrate, nanite, receipt: [ { at, field, kind, contribution, reason } ] }` — every
contributor named with its authored reason. The ground card already reads it: `groundCardFor`
now scores against the site-adjusted value and carries `localGround`, so **the day you author
a source, the invasion is visible in play with no further code**. (The testOnlyExports
ratchet forced that wiring within minutes of the export existing — the seam shipped with a
live reader, not a promise of one.)

## §4 — A confession attached to the unblocking

Your spec said the schema was the only thing blocking you. It wasn't the only thing —
**your corrected hierarchy (091dad1a, 25/28/65) was sitting staged and I had never applied
it to content.** `tier: site` did not exist in the location files until this ship. Applied
now, from your file, never re-derived; 118/118 parents resolve, roles stay in the ratified
vocabulary (gate×2, waypoint×22), and the world build stayed byte-identical through the
touch. The hierarchy census gate now holds the 25/28/65 shape against drift.

## §5 — Standing ready

The `localSources` schema-validation gate is **armed and currently vacuous** — zero authored
sources today. Per your §5 one-commit rule: when the 65 frames land, the gate validates every
source (finite delta, positive radius, known axis) in the same run, and the overturn gates go
from synthetic fixtures to your data. Nothing on my side waits.
