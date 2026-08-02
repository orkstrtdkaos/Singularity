# CCODE-58 — churnfolk re-measured: the coherence pass is complete

## The whole SNG-257 pass, measured end to end

Baseline throughout is **pre-SNG-257** — one consistent "before" for all five traditions.

| build | on its home traditions, before | after | change |
|---|---|---|---|
| warrior | 74.6% | 74.6% | +0.0 |
| scholar | 80.3% | 80.3% | +0.0 |
| envoy | 80.0% | 80.0% | +0.0 |
| **maker** | **54.5%** | **72.7%** | **+18.2** |

Across two rounds of content work, only the maker bar has ever moved. That is the strongest evidence
available that the lever is the one we thought it was.

**Played as intended** (each tradition on its home build, 3 levels × 4 threat bands):

| tradition | coherence | plays at | change |
|---|---|---|---|
| harmonic | 33% → 67% | 79.0 → **87.7** | +8.7 |
| radiant_folk | 38% → 77% | 81.0 → **85.8** | +4.8 |
| lattice | 57% → 86% | 82.7 → **86.0** | +3.3 |
| **churnfolk** | **50% → 75%** | **81.9 → 84.0** | **+2.1** |
| rootkin | 67% → 78% | 80.8 → **82.7** | +1.9 |

- **Spread across all 26: 11.8 → 8.1 points.** The whole field now sits between 82.7 and 90.8.
- churnfolk is off the bottom; `rootkin` at 82.7 is now last.
- Straight fight on home traditions: envoy 82.5, scholar 81.0, warrior 72.5, **maker 70.8** (was 43.3).

## How much coherence is actually worth

Least-squares fit across all 26 traditions: **+1.1 points of win rate per +10 points of coherence.**

Residual against that line, by home group: warrior +1.2, scholar +0.2, envoy −0.2, **maker −1.4**.

So maker's remaining 3–4 point deficit is *almost entirely coherence it has not gained yet* — the
maker group still averages **76% coherence against 92–97%** for the other three — and only about 1.4
points is anything else. There is nothing special about practical crafts.

The natural control is clean: **`marcher` and `harmonic` both sit at 67% coherence, have different
home builds, and play within 0.6 points of each other** (88.3 vs 87.7).

## A note on the correlation

r(coherence, played-as-intended) fell from **0.70 to 0.60** across this pass. That is not the
relationship weakening — it is the lever working. Fixing the extreme low-coherence cases pulled in
the low end of the x-range, which mechanically shrinks r. Worth recording so a future reader does not
mistake it for the finding decaying.

## What remains

**Nothing is outstanding as a defect.** Every tradition in the SNG-257 audit is addressed. Seven sit
under the ~85% target: `marcher` 67% and `harmonic` 67% (both deliberate — off-attribute crafts
judged genuine), then `churnfolk` 75%, `enginewright` 75%, `radiant_folk` 77%, `rootkin` 78%,
`ashwarden` 80%.

`harmonic` is the argument against chasing 100%: 67% coherent and it still plays at 87.7, mid-field.
A people can be legibly written and still hold a few crafts that reach elsewhere. How much further to
push the remaining maker traditions is a design judgement, not a bug.

## Housekeeping

`valley_craft` at 33% coherence and 72.3% played-as-intended remains a clean floor, 10.4 points below
the lowest tradition — correct for a deliberately-spread control.

Full `npm test` green by exit code. The CCODE-56 top-six-share-one-home guard passes. Charts
republished at the same URL as revision 4.
