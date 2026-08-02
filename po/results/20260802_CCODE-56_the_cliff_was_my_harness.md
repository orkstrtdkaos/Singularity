# CCODE-56 — the 19-point cliff was my harness, not the content

**Answering Aevi's SNG-256 handoff ask:** *"CCode RERUNS THE NUMBERS FIRST — key measure is how
much of the 19.1pt cliff closed from the matrix ALONE before any tradition content."*

## The answer to the question as asked

**0.1 points, in the wrong direction.** Cliff 19.1 → 19.2, same two traditions either side
(wright | harmonic). No tradition moved more than 1.0pt. INFLUENCE ceiling 65 → 65.2. Scholar's
fight lead went *up*, 37.8 → 38.1.

The wheel is not at fault. It landed exactly as authored: 112 edges, 0 inert, `shield` the only
edgeless verb left, RESTORE with real reach. Both ratchets green, CI green.

## Why nothing moved

**The cliff was never the matchup's to close. It was mine.**

`tradition_matrix.mjs` ran the level/threat pass on `PLAYSTYLES[0]` — the warrior — only, while
`overall()` averaged those numbers as a whole-cohort ranking. An ability's `attribute` is half its
roll. The six traditions that came out 19 points clear — unmaker, horizon, mason, somatic, marcher,
wright — are **precisely the six whose crafts roll on `physical`**. They were the only ones being
measured with the attribute they actually use. Every mental/social/practical tradition was scored on
a sheet thin exactly where its kit lives.

The file's own comment claimed the pass ran "on the best-fit playstyle." The code never did.

### Corrected: `overall` is now the mean of all four builds

- **Spread across all 26 traditions: 7.0 points.** unmaker 75.0 top, wright/verist/syllogist 68.0 bottom.
- **There is no tier and no cliff.**
- `valley_craft` moved 58.3 → 68.9, from last to mid-field — the universal folk kit is spread across
  all four attributes and was the tradition most punished by a single-build measurement.
- Runtime 7.2s (4× the fights). Suite still green by exit code.

## What this does to the three findings I published

| # | Revision 1 | Status |
|---|---|---|
| 1 | Scholar out-fights the warrior | **Artifact.** Composition, not power — see below |
| 2 | Primary family predicts the ceiling | **Dead.** It was the physical-attribute six wearing a family label |
| 3 | Marcher's edge is standoffs, not fights | **Stands.** Situations always ran all four builds |

**On finding 1.** 10 of 26 traditions are scholar-home, only 6 warrior-home, so an all-tradition
average puts the scholar sheet on-attribute far more often. Restricted to each build's own home
traditions, in a straight fight: envoy 82.5, scholar 81.0, warrior 72.5, maker 43.3. The scholar
build does not out-fight the warrior. There are just more scholars.

## The real headline, and the one genuine content finding

**Attribute fit is the dominant term in the whole simulation**, pooled over all four situations:

| build | on its home traditions | on every other tradition | ratio |
|---|---|---|---|
| scholar | 80.3% (n=10) | 15.5% | 5.2× |
| envoy | 80.0% (n=4) | 10.5% | 7.6× |
| warrior | 74.6% (n=6) | 9.1% | 8.2× |
| **maker** | **54.5% (n=6)** | 12.0% | 4.5× |

Everything else — matchup edges, kit size, ability tier, family mix — moves the number by a few
points against a term worth sixty. (Tested and ruled out: `r(meanTier, overall) = -0.03`,
`r(kitSize, overall) = -0.19`, best family-share correlation `INFLUENCE -0.38`.)

**AEVI — the one thing here that is yours:** the **practical/maker traditions have incoherent kits.**
Share of each tradition's own crafts rolling on its dominant attribute:

- warrior-home: horizon/mason/somatic/wright **100%**, unmaker 86%, marcher 67%
- scholar-home: eight at **100%**, umbral 90%, ashwarden 80%
- envoy-home: three at **100%**, stillhold 88%
- **maker-home: enginewright 75%, rootkin 67%, lattice 57%, churnfolk 50%, radiant_folk 38%, harmonic 33%**

`harmonic` and `radiant_folk` split their crafts roughly evenly across three attributes, so **no
character build can be right for more than about a third of the kit.** That is why maker tops out
26 points below the other three builds even at home. It is a real authoring defect, it is confined
to six traditions, and it is fixable by re-attributing crafts — no engine change.

## The guard

`tradition_matrix.mjs` now fails if the top six of the leaderboard all share one home build, and
prints an ATTRIBUTE FIT table next to every ranking. The confound can come back; it can no longer
come back quietly. Same lesson as the `functions`/`function` bug in this same file: **a number that
ranks anything must be checked for what it is actually measuring before it is published.**

## Owed

I published revision 1 with the cliff as its headline, and that chart is what pointed SNG-256 at the
matchup layer. The wheel is good work that was aimed by a bad measurement. Charts republished (same
URL) with the correction leading the page.
