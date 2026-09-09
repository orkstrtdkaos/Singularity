# SPEC — the substrate moves: what an arc does to the power under your feet

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** substrate, arcs
> Erik: *"I want to look at **balancing the world's power sources** — as well as understanding **what arcs
> will shift them and what that does to the power sources in each area.**"*

---

## §1 — ⛑ MEASURED FIRST, AND AEVI WAS WRONG TWICE

⛔ **She wrote on 09-08 that *"135 authored locations, ZERO with a substrate field of any kind."* THAT WAS
FALSE.**

✅ **`resolveSubstrateField` is live and stamps density onto locations at boot** — pools and sinks with a
`delta` and a `radiusWorld`, compact support at 2.5 radii, and **an authored override always wins.**

⚑ **45 AUTHORED SOURCES: 31 POOLS AND 14 SINKS.** `the_great_engine` +0.22, `the_blaze` +0.18,
`the_untethered` +0.17. ⚠️ **The comment on the line says it plainly: *"26 sources were inert content until
this line existed."***

⛔ **SO THE THING SHE SPECCED IN `SPEC_ground_card_everywhere` §4 AS A GAP IS BUILT.** ⬜ The real gap is
narrower and more interesting.

---

## §2 — ⛔ THE FIELD IS STATIC, AND EVERY ARC ALREADY SAYS IT SHOULD NOT BE

**MEASURED: `substrate.js` does not read `arcPressure`, `arcStage`, or anything arc-shaped. ZERO
REFERENCES.** ⚠️ **The field resolves once at boot and never moves again.**

⛑ **AND ALL SIX ARCS DESCRIBE A SUBSTRATE EFFECT IN THEIR OWN TENDENCY TEXT:**

| arc | ⚑ what it says it does | ⛔ reaches the field? |
|---|---|---|
| **What Wakes Beneath** | *"the substrate that runs all the crafts is STIRRING WORLD-WIDE"* | ⛔ **no** |
| **The Poles Pull** | *"each Reach drifting harder toward its own extreme"* | ⛔ no |
| **The Second Manifestation** | *"new domains BLOOMING, old ones BLEEDING"* | ⛔ no |
| **The Bleeding Grammar** | *"matter beginning to resolve into craftable units WHERE IT SHOULDN'T"* | ⛔ no |
| **The Green Schism** | *"let the life-disposition RETREAT from the valley"* | ⛔ no |
| **The Disagreement** | ⚠️ the two entities' argument, and the substrate IS their medium | ⛔ no |

➡️ ⛑ **SIX ARCS THAT ARE ALL ABOUT THE SUBSTRATE, AND A SUBSTRATE THAT CANNOT HEAR THEM.**

---

## §3 — ⬜ PROPOSED: `arcSources` — an arc is a pool that grows

⚑ **DO NOT BUILD A NEW MECHANISM. AN ARC'S EFFECT IS A `substrateSource` WHOSE `delta` IS A FUNCTION OF
STAGE.**

```json
"arcSources": [
  { "arcId": "arc_what_wakes_beneath", "at": "archive_hollow",
    "deltaByStage": [0.02, 0.06, 0.14, 0.25], "radiusWorld": 0.12,
    "why": "the substrate stirring, strongest where it was already thin enough to feel" }
]
```

⚠️ **`resolveSubstrateField` ALREADY SUMS OVERLAPPING SOURCES AND ALREADY CLAMPS.** ⛑ **An arc source is
just another source, and the whole change is that its `delta` reads a live stage instead of a constant.**

### ⛔ AND THE DIRECTION MUST BE PER-SOURCE, NOT PER-ARC

⚑ **THE POLES PULL IS THE PROOF: it does not raise density, it POLARISES.** ⚠️ **Each Reach drifts toward
its own extreme, so a HIGH region climbs and a THIN region THINS** — one arc, opposite signs in different
places.

⬜ **So an arc carries several sources, each with its own place and sign.** ⛔ **A single global number
would say the wrong thing about the most important arc in the game.**

---

## §4 — ⚠️ AND HERE IS WHAT IT DOES TO EACH SOURCE, WHICH IS THE BALANCE ANSWER

**Measured `sourceBands` against the 39 authored region densities:**

| source | band | ⚑ works in |
|---|---|---|
| **wild** | 0.12–0.52 | **17 of 39 — 44%** |
| **precursor** | 0.70–1.10 | 14 — 36% |
| **nanite** | 0.70–1.10 | 14 — 36% |
| ⚠️ **metaphysical** | −0.07–0.37 | **7 — 18%** |
| ⛔ **veil** | −0.10–0.30 | ⛔ **5 — 13%** |
| **body** | *floor, no band* | ⚑ **never starves** |

⛑ **NOW MAKE THE FIELD MOVE AND READ IT AGAIN:**

⛔ **`What Wakes Beneath` RAISES DENSITY — so as it advances, PRECURSOR AND NANITE WORK IN MORE OF THE WORLD
AND VEIL AND METAPHYSICAL WORK IN LESS.** ⚠️ **The Ashwardens and the Numinous get quietly weaker every
stage, and nobody has to explain why — the ground changed under them.**

⚑ **AND THAT IS THE BALANCE LEVER ERIK IS ASKING FOR.** ⛔ **Veil at 13% is not a bug to widen — it is a
tradition whose whole subject is ABSENCE, and the arc that fills the world is its enemy.** ⚠️ **The Veil's
people should be the ones fighting `What Wakes Beneath` hardest, and the numbers now say so.**

⬜ **THE SAME READ, ARC BY ARC:**

| arc advancing | ⚑ who gains | ⛔ who starves |
|---|---|---|
| **What Wakes Beneath** | precursor · nanite | ⛔ **veil · metaphysical** |
| **The Green Schism** *(life retreats)* | ⚠️ veil and metaphysical, locally | rootkin, in its own home |
| **The Bleeding Grammar** | nanite, in the Gearlands | wild, where the Churn is being resolved |
| ⛑ **The Poles Pull** | ⚠️ **BOTH — that is what polarising means** | ⛔ **the middle. Everyone at the Crossing** |

---

## §5 — ⬜ ROUND 2 QUESTIONS

1. ⛔ **Does the field re-resolve on the world tick, or only on arc stage change?** ⚑ **Aevi's read: on
   STAGE CHANGE only** — ⚠️ it is expensive and a stage is a rare, meaningful event.
2. ⚠️ **Does a player feel it?** ⛑ **The ground card is the surface** — *"deathsense here 78%, and it was 84%
   last season"* is the single best thing this could produce, ⬜ and it needs the card built first.
3. ⛔ **Should an arc's source be authored per-place or derived from its `regions`?** ⚑ **Aevi: AUTHORED.**
   ⚠️ *"The substrate stirring is strongest where it was already thin enough to feel"* is a judgement about
   the world, and a regex is not entitled to make it.
4. ⬜ **What happens at a SINK that an arc fills?** ⚠️ **`the_untethered` +0.17 and a Veil-worker's only good
   ground are the same kind of place** — ⛔ **an arc that fills it does not weaken a craft, it takes away
   somewhere.**
