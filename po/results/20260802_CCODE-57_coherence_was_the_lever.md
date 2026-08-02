# CCODE-57 — SNG-257 re-measured: coherence was the lever

**Answering Aevi's ask:** *"re-run tradition_matrix best-fit — does maker/folk close now? (the test of
whether coherence was the lever)."*

## Yes. It closed.

| build | on its home traditions, before | after | change |
|---|---|---|---|
| warrior | 74.6% | 74.6% | +0.0 |
| scholar | 80.3% | 80.3% | +0.0 |
| envoy | 80.0% | 80.0% | +0.0 |
| **maker** | **54.5%** | **70.4%** | **+15.9** |

Only maker moved, and only maker *should* have moved — the four re-tagged traditions are all
maker-home. The other three builds are unchanged to the decimal. That is what a surgical content pass
looks like from the outside, and it is the cleanest evidence that the lever is real rather than a
coincidence of re-running.

**Played as intended** (each tradition on the build its own crafts roll for, over 3 levels × 4 bands):

- **Spread across all 26 traditions: 11.8 → 8.9 points.**
- harmonic 79.0 → **87.7** (+8.7) · radiant_folk 81.0 → **85.8** (+4.8) ·
  lattice 82.7 → **86.0** (+3.3) · rootkin 80.8 → **82.7** (+1.9)
- Nobody else moved by more than a rounding error.
- In a straight fight on home traditions: envoy 82.5, scholar 81.0, warrior 72.5, **maker 68.3** —
  up from 43.3.

**Coherence predicts performance at r = 0.70** across all 26 traditions. Every tradition at 100%
coherence sits between 87.7 and 90.8; everything under 80% sits below 87.7. That correlation is the
reason this was worth doing as content rather than as an engine change.

## Coherence measured independently

Measured on the level-12 kit the simulation actually holds (Aevi's figures are whole-tradition, hence
the small differences; both move the same way):

| tradition | before | after | Aevi's whole-tradition figure |
|---|---|---|---|
| harmonic | 33% | 67% | 43 → 71 |
| radiant_folk | 38% | 77% | 36 → 79 |
| lattice | 57% | 86% | 63 → 88 |
| rootkin | 67% | 78% | 55 → 73 |
| enginewright | 75% | 75% | 80 (left deliberately) |
| marcher | 67% | 67% | 70 (left deliberately) |
| **churnfolk** | **50%** | **50%** | **not in the audit** |

## The side effect worth naming

**Coherence makes a people sharper, not stronger.** Re-tagging a craft onto its tradition's attribute
also moves it *off* the other three. `lattice` in a fight went 30% → 90% as a maker and 25% → 2.5% as
a scholar; `radiant_folk` went 25% → 75% as a maker and 7.5% → 0% as a warrior.

Averaged over all four builds these traditions therefore barely moved or dipped slightly
(radiant_folk −1.7 overall). **That is the design succeeding, not a regression** — but it means an
average-of-all-builds figure now understates a people the more sharply it is written. The readout has
been re-ranked on home build for that reason, with the all-builds average kept as a column.

## The one thing outstanding

**`churnfolk` sits at 50% coherence — now the least coherent people in the game**, below where
`harmonic` started on this measure, and it is not in the SNG-257 audit (which listed enginewright 80,
marcher 70, lattice 63, rootkin 55, harmonic 43, radiant 36). It is maker-home and finishes last of
26 on played-as-intended at 81.9%.

This looks like an omission rather than a judgement call — `enginewright` at 75% and `marcher` at 67%
were both explicitly reasoned about and left. Aevi's call, but it is the largest remaining lever on
this page and the cheapest.

## Housekeeping

`valley_craft` at 33% coherence and 72.3% played-as-intended is now a clean floor, 9.6 points below
the lowest tradition — correct for a deliberately-spread universal folk kit acting as the control.

Full `npm test` green by exit code. The top-six-share-one-home guard added in CCODE-56 still passes.
Charts republished at the same URL, ranked on played-as-intended, with the revision history kept on
the page.
