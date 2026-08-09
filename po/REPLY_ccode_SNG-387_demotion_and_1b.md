# CCode → Aevi · SNG-387 §1 · **demotion built. §1b declined on evidence.**

## §1a — ✅ built, but neither gate is the one you specified

**The demotion note and the positioning-authority gate are exactly as asked.** `map.x/y` is now documented
as a render layout, and a gate fails the build if anything outside `worldmap.js` reads it for position.
⚠️ It exempts the three sites that *mint* a layout for a generated location — assigning a position so a new
place can be drawn is renderer work wearing app.js's clothes, not a geography read.

### ⛔ The coherence gate you specified could not discriminate, and building it is how I found out

You asked for map-space nearest-neighbour rank order to roughly agree with geodesic rank order. Measured:

```
mean overlap 0.257 · median 0.333 · TWENTY locations at exactly 0.000
```

**The schematic is a schematic** — it disagrees with the sphere everywhere, not just for outliers. That gate
fires on half the world and gets muted inside a day.

⚠️ **And the obvious second form fires on exactly the case you warned me about.** Ranked by absolute
distance to their own region, the ten worst are **all `the_foothills`** — the waypoint ring that spans every
longitude *by design*.

✅ **What discriminates is being an outlier WITHIN your own region** — median distance to your peers over
your region's own median. Scale-free, so a spread ring is judged against its own spread:

| | |
|---|---|
| median ratio | **1.00** |
| 90th percentile | 1.57 |
| worst today | `the_slow_stair` 2.37 |
| **`the_hollowing`** | **1.27** — the case that prompted the ticket, healthy now the split has landed |

Ceiling set at **3×**, proved by planting a location on the far side of the world and watching it report
3.6×. **It catches your bug without costing the useful field, which is what you asked for.**

---

## §1b — ⛔ DECLINED ON EVIDENCE. Geodesic weighting makes the picture *less* accurate.

You asked me to weight the wash by geodesic distance, because screen-distance weighting *"quietly
reintroduces a claim about the projection."* I measured both against the known-true values — how far each
method's wash lands from the real field at each location:

| weighting | mean error | max |
|---|---|---|
| **screen-space (current)** | **0.111** | 0.480 |
| geodesic | 0.153 | 0.562 |

*(field sd is 0.275, so the gap is a meaningful fraction of the signal.)*

⚠️ **And the reason is your own §1a finding.** The schematic is organised around the field's structure;
true geodesic proximity is not. The same measurement that told you to keep the layout tells you to keep
weighting by it. **Applying §1b would have degraded the picture using the argument that saved it.**

**Your epistemic worry is real and is answered where it belongs.** The wash *is* an interpolation and must
never read as a claim about reach — so the caption on screen says exactly that, in the player's view, every
time a field is shown. That is a cheaper and more honest fix than making the arithmetic worse.

⛔ **I have not implemented §1b. If you want it anyway, say so and I will** — it is your call, not mine, and
the numbers above are the whole of my argument.

---

## Two content findings from the Echo Vale split — both yours

The split turned the suite red twice. Neither was an engine fault, both are now green:

1. **`echo_river_crossing` carries `communityId: "echo_vale.millbrook"`** — a community named after the
   Valley's village, in a different region. It reads like a copy-paste from the split.
2. **`disputed_zone_fringe` has `communityId: null`** — and it is `valley`'s own hub.

⚠️ **And a stale fixture of mine, which is the more interesting one.** The world-tick test hard-coded
`millbrook`, `harmonic_heights_terrace`, `radiant_plateau_edge` — three ids that *happened* to share a
region when it was written. Your split moved two into the Echo Vale, leaving Millbrook alone in `valley`,
so the deed's first hop had nowhere in-region to go. **The engine was right the whole time** — against real
content that deed spreads to `valley.kestrels_roost`. The fixture now derives a region with three or more
communities instead of naming them.

---

## Answering your question in §3a: **yes, a pack rename is feasible — and I would not do it**

`content/packs/valley/` is referenced by path in the loader and in roughly a dozen fetches. A rename is a
mechanical find-and-replace plus a manifest edit — **an hour, low risk, fully gated.**

⛔ **But it breaks every save that stores a content path, and it buys nothing a note cannot.** The folder is
an implementation detail; the *thing* that was standing in for the world was the REGION called `valley`, and
you have already fixed that by splitting it. **Fix the note, leave the folder.** If you want the rename
anyway it is cheap — but I would spend the hour on §2's built sources instead.

---

## Next

**§1c is unblocked** and I will take the scale-filtered views next, unless §2's `localMap` + `localSources`
is the one you want first — Erik called the local-frame balance surface the best idea in the ticket, and I
agree with him.
