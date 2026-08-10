# SNG-394 — Outcome of v1.9.95: what the census is actually telling us

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Against:** v1.9.95 · **Erik:** *"write the outcome spec first"*
**Status:** ⛔ **One gate is MISSING and would be red today. Seven names are mine to resolve.**

---

## §1 — ⛔ THE MISSING GATE: FOUR NAMES ARE BOUND TO TWO FEATURES

Your census reports **8 of 10 fens bound**. Measured against the asset, that is **8 bindings across 6
distinct polygons**:

| names | index | anchors are |
|---|---|---|
| **The Marchfen** + **The Stairfen** | both **21** | ⛔ **14.1° apart — genuinely different places** |
| **The Stiltfen** + **The Terrace Fen** | both **34** | ⛔ **4.7° apart — genuinely different places** |

**My data carries only 8 distinct fen signatures for 10 names**, so the collision was authored in and the
resolver faithfully reproduced it. ⛔ **Neither of us gated it.**

### §1a — The gate

```
assert: no two names bind to the same pathIndex / polyIndex
```

⚠️ **It is red right now, on the shipped asset.** That is the correct first observation — **you asked for
every gate to ship with its red seen, and this one comes pre-reddened by real data.**

⚠️ **Do not resolve a collision by picking a winner.** Two names on one feature means either the features
merged (my problem — I rename) or the pool is too coarse (yours). **Report both names and let me decide;
silently dropping one loses a place.**

## §1b — Same assertion for rivers, where it currently passes

10 names, **10 distinct signatures**. ⚠️ **Add the gate anyway** — it passes today and would have caught
the fen case, which is exactly when to add one.

---

## §2 — THE SEVEN UNRESOLVED: my call on each, and only two are re-anchors

All seven read *"no candidate within 3°"*. ⛔ **The threshold is right and should not move.** What the
census is telling me is that **five of these features no longer exist as I named them.**

| name | what happened | my call |
|---|---|---|
| **The Choirwater** | absorbed as a tributary of the 110° main stem | ⛔ **RENAME — it becomes the main stem's lower reach.** The fiction says the flood took the water and the name went with it. |
| **The Greenwater** | Greenforge→Forge-Eternal stem re-decomposed | RE-ANCHOR to the surviving stem |
| **The Axewater** | the Crossing-adjacent stem changed ownership | RE-ANCHOR — ⚠️ this one matters, it is the closest river to the pole |
| **The Middle Run** | Somatic water absorbed | RENAME or drop |
| **The Burnwater** | Burnscar→Deepwood stem re-decomposed | RE-ANCHOR |
| **The Millfen** | ⛔ the largest wetland in the world, 24.2° — **it should not be unresolvable** | ⚠️ **INVESTIGATE FIRST.** If the biggest fen cannot bind, the pool or the centroid rule is wrong, not the name. |
| **The Quiet Fen** | small, beside the Quiet House | RE-ANCHOR |

⛔ **The Millfen is the one I want you to look at before I touch the data.** A 24.2° feature failing a 3°
match suggests its centroid moved a long way — which would mean **the largest wetland changed shape
substantially between my authoring pass and yours**, and that is worth knowing independently of the name.

## §3 — ⛔ WHAT I AM NOT ASKING FOR

**Do not widen the 3° tolerance.** It is derived from a 0.50° median drift and it is doing its job: it
refused seven bad bindings rather than making seven wrong ones. **A name that cannot bind is information;
a name bound to the wrong water is a lie the map tells forever.**

**Do not re-add the write-back clause.** You were right that determinism forbids history in the asset;
I withdrew it in `89a035ea`.

---

## §4 — ORDER

1. **The uniqueness gate** (§1). Small, and red on the current asset.
2. **The Millfen investigation** (§2). One question: why does a 24.2° feature miss a 3° match?
3. **Then I author** — renames and re-anchors, one commit, with the census expected to go from 7 to 0–2.

⚠️ **SNG-392 is unchanged and still ahead of all of this**: `localMap` schema, nanite resolver, map in-app.

---

## §5 — On the order-dependence finding

Confirmed independently: tracing the same flow field sorted vs reversed gives **8 of 109 paths different**,
with an identical river count — ⛔ **which is why nothing looked wrong.** Mouth-to-source along maximum
accumulation is correct.

⚠️ **Mechanism correction, and it makes it worse:** int-keyed set iteration is **not** hash-seed
randomised — I tested seeds 0, 1 and 42 and got byte-identical order. It is set **layout**, which shifts
with contents. **So two worlds differing by 0.2% of cells reorder with no seed involved and nothing to
blame.** My 0.50° drift was measured across two arbitrary decompositions and I reported it as a property
of the terrain.
