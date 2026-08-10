# SNG-393 — Re-anchoring place names after a terrain rebuild

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Data shipped:** `content/packs/core/world/placenames.json`
**Status:** spec_ready · **One pipeline step, one gate. Everything below is measured, not proposed.**

⚠️ **Rev 2. Rev 1 of this spec said "attach to the nearest head, tie-break on mouth, fail beyond ~20°"
and left the metric, the tie-break, the threshold and the output shape undefined. I measured it and the
rule was also WRONG — nearest-head matching is ambiguous for 4 of 10 rivers.** This is the measured rule.

---

## §1 — THE PROBLEM, WITH NUMBERS

Rivers and fens are **derived from flow** and their exact geometry changes on every terrain rebuild.
Seas and ranges do not need this step — an ocean and a bedrock ridge stay put.

Every named river and fen therefore stores **location ids**, not coordinates:

```
river:  { id, name, nearHead, nearMouth }     // two anchors
fen:    { id, name, near }                    // one anchor
```

⛔ **Nearest-head matching does NOT work, and this is why:**

| | value |
|---|---|
| median distance, anchor → its river's head | **5.3°** |
| median spacing between river heads | **5.6°** |

**The signal and the noise are the same size.** Measured: **4 of 10 rivers match ambiguously** (second-best
candidate within 0.8°). A rule that is a coin-flip on 40% of the data is not a rule.

---

## §2 — ⛔ THE RULE THAT WORKS. Measured 1 of 10 ambiguous, from 4.

### Rivers

```
pool     = the 24 longest traced rivers          // a named river is a MAJOR river
score(q) = min( d(nearHead, q.first) + d(nearMouth, q.last),
                d(nearHead, q.last)  + d(nearMouth, q.first) )
match    = argmin score
margin   = second-best score − best score
```

⚠️ **Both orientations must be tried: flow direction flips between rebuilds** when two headwaters trade
which is higher after smoothing. Testing one orientation silently loses the match.

⚠️ **The pool restriction is doing real work.** There are ~106 traced rivers and most are short fragments;
without the length cut, a fragment near an anchor outscores the river the name means.

**`d` is great-circle distance in degrees** — `hypot(Δlat, Δlon·cos(mean lat))` is adequate here **because
no anchor sits within 20° of the pole**; use the generator's `gcd2` if that ever changes.

### Fens

```
pool     = the 16 largest marsh polygons by extent
score(q) = d(near, centroid(q))
```

Measured **1 of 10 ambiguous**.

---

## §3 — ⛔ THE GATE. Thresholds from the measured distribution, not chosen.

| assert | value | why that number |
|---|---|---|
| every name resolves | **score ≤ 45** (rivers) · **d ≤ 22°** (fens) | worst current: 41.4 and 17.2 |
| match is unambiguous | **margin ≥ 1.5°** | ambiguity floor measured at ~0.8° |
| known ambiguous | **exactly 2** — `the_greenwardwater` (margin 0.9), `the_burnfen` (margin 0.8) | census, not a pass |

⛔ **The census form, per your SNG-391 §2 design: two names are ambiguous today and that is the expected
state. A third appearing is a regression; those two resolving is an improvement worth noticing.** A binary
pass/fail here would go red on a world that is fine.

⚠️ **Prove the gate red before shipping it:** delete `nearMouth` from one river and the ambiguity count
should jump — pair-matching collapses to head-matching, which measured 4 of 10.

---

## §4 — OUTPUT SHAPE

Write resolved bindings into the terrain asset so the viewer and the GM read one thing:

```
placeNames: {
  rivers: [ { id, name, pathIndex, score, margin, resolved: true } ],
  fens:   [ { id, name, polyIndex, score, margin, resolved: true } ],
  unresolved: [ { id, name, reason: "no candidate within threshold" | "ambiguous" } ]
}
```

⛔ **An unresolved name must appear in `unresolved`, never be silently dropped and never be bound to its
best-but-too-far candidate.** A river named for Millbrook that quietly attaches to a different water is
worse than a river with no name.

---

## §5 — WHY THIS IS NOT COSMETIC

Three names are **already load-bearing in content authored before the terrain existed**:

- **The Echo** — `echo_river_crossing`: *"the bridge where the Echo River narrows"*; `millbrook`: *"water
  wheels turn along the Echo River"*
- **The Stiltfen** — `greywater_stilts`: *"built on stilts over the southern marsh"*
- **The Echofen** — the bridge exists **because the fen made fording impossible**

⚠️ **If re-anchoring drifts, those descriptions start referring to water that is not there.** The Echo runs
91.5° — most of the way round the world — and its course changes every regeneration while Millbrook does
not move.

---

## §6 — Priority

⚠️ **Behind SNG-392** — `localMap` schema, then the nanite resolver, then the map in-app. **This becomes a
correctness problem the next time terrain regenerates, which is not today.**
