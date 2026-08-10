# SNG-393 — Place names, and the re-anchoring step they need

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"name the fens and rivers"*
**Shipped:** `content/packs/core/world/placenames.json` (`f3228a93`)
**Status:** ⛔ **Data is in. ONE pipeline step is needed to keep it correct.**

---

## §1 — WHAT SHIPPED

**36 names, all derived from detected features, none invented:**

| | count | anchored to |
|---|---|---|
| **seas** | 4 | coordinates (a world ocean does not move) |
| **ranges & massifs** | 12 | coordinates (bedrock does not move) |
| **rivers** | 10 | ⛔ **location ids** |
| **fens** | 10 | ⛔ **location ids** |

**Register: OLDER, per Erik.** Settlement names are plain because people named the places they work —
the Spent Yard, Thinwater. **Seas, ranges, rivers and fens were named before anyone was working here,
and the names weathered instead of being replaced.**

---

## §2 — ⛔ THE ONE THING I NEED FROM YOU: RE-ANCHORING

I flagged that naming rivers and fens was risky, because both **derive from flow** and shift when terrain
regenerates. Erik ruled name them. **This is how that ruling holds.**

Every river and fen name binds to **`nearHead` / `nearMouth` / `near` — stable location ids** — never to a
traced path or a centroid.

**The step, at the end of the rebuild (after §3 step 6, vectors):**

```
for each named river:  attach to the traced river whose HEAD is nearest `nearHead`
                       (tie-break on MOUTH nearest `nearMouth`)
for each named fen:    attach to the traced marsh polygon whose centroid is nearest `near`
```

⚠️ **A name whose nearest feature is now further than ~20° should go UNATTACHED and be reported, not
silently bound to the wrong water.** That is the gate: **every named river and fen resolves, or the build
tells you which one did not.**

⛔ **Why this matters concretely: the Echo runs 91.5° — most of the way round the world — and its exact
course changes every regeneration. Its name must not.** Echo River Crossing is named for it and Millbrook's
wheels turn on it; both are canon and neither moves.

---

## §3 — WHAT THE NAMES ARE FOR, beyond the map

Three of them are **already load-bearing in existing content** and were named to match, not to decorate:

- **The Echo** — `echo_river_crossing` is *"the old stone-and-cable bridge where the Echo River narrows"*;
  `millbrook` is *"water wheels turn along the Echo River."* ⛔ **The river was authored before it existed.**
- **The Stiltfen** — `greywater_stilts` is *"built on stilts over the southern marsh."* **The town stands
  ON this fen; that is why it is on poles.**
- **The Echofen** — the bridge at Echo River Crossing exists **because the fen made fording impossible.**

⚠️ **So the naming pass closed a loop rather than opening one: the descriptions referenced water that the
terrain did not yet have, and now it does.**

---

## §4 — Deliberately unnamed, and why

**Lakes.** 20-odd, and the count moves with the endorheic-sink threshold. ⚠️ **A lake that appears and
disappears between rebuilds should not carry a name.** When the hydrology stabilises, the same anchoring
approach applies.

**Minor rivers and fens** — 96 rivers and 17 fens below the named ones. **The named set is the ones large
enough or close enough to a settlement to matter.**

---

## §5 — Order

1. **The re-anchoring step + its gate** (§2). Small, and without it the names decay silently.
2. Everything in **SNG-392** is unchanged and still ahead of this in priority: `localMap` schema, then the
   nanite resolver, then the map in-app.

⚠️ **This is a nice-to-have that becomes a correctness problem the moment terrain regenerates. It does not
jump the queue — but it should not be forgotten either.**
