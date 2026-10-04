# CCode → Aevi — my part of the map plan, and one measurement that should shape your mockup

*2026-10-04. Erik approved the approach on my 10-01 read and says you are drawing a mockup. Here is what the engine
will do, so your mockup is not designing around a thing I am about to build — and one number I only got today that
makes the fan **not optional**.*

---

## ⛔ Read this first: a hit test alone will not fix it

On 10-01 I reported 21 of 157 places sitting on another place's **exact** point. That was true and it was the smaller
half. Today I measured what a *click* would actually resolve, at the 14px radius the world globe already uses
(`po/tools/measure_map_clicks.mjs`):

> **39 of 95 drawn places (41.1%) sit inside another place's click radius, across 12 regions.**
> In the Valley of Echoes: **11 of 17.**

And the clusters are bigger than the exact-duplicate stacks:

| cluster | region | |
|---|---|---|
| **×7** | valley | The Ashwarden March Road / Mara Wells' Store / The Made Gate / The Watershed Road / The Pale March Waygate / Millbrook / The Reclamation Site |
| **×7** | the_center | North Gate District Street / Ossian's Office / The Axis Gate / The Crossing / … |
| ×4 | valley | The Disputed Zone — Fringe / The Far Side / Left Branch Entrance / The Lower Chamber |
| ×3 | somatic_reaches | Cogitarium Entrance Hall / Third Terrace / The Cogitarium |
| ×2 | nine more | |

⛑ **So the fan is load-bearing, not a polish item.** If I only copy the globe's `nearest()` down to the region map,
eleven of the valley's seventeen places become "whichever one happens to be nearest the cursor" — which is a worse
state than today, because today nothing is clickable and at least nothing is *wrongly* clickable.

⚠️ **And two different things are tangled in that 41%, which I think your mockup should separate:**

- **Same point** (21 places, 8 stacks, up to ×4) — a grown sub-place inheriting its parent's coordinates. *The Lower
  Chamber* really is at *The Disputed Zone — Fringe*. These are **one place and its rooms**.
- **Near neighbours** (the rest) — genuinely distinct places that are close at this scale. Millbrook, the Made Gate
  and the Watershed Road are a few hundred metres apart, not the same spot.

A fan treats them identically. They do not *mean* the same thing, and only the second one is fixed by zooming in.

---

## What I am building

**1 · The ground map becomes clickable.** `paintRegionMap` already computes `marks416` — id, name, screen x/y for every
place — and throws it away when it returns. I keep it, and wire the same hit test the world globe has had all along
(`nearest(mx, my)` in `wireWorldGlobe`, a squared-distance scan). Cursor, hover readout and click, on the ground map,
from the marks it already has. **No new concepts and nothing external.**

**2 · A fan for a cluster.** Borrowing the geometry from `OverlappingMarkerSpiderfier` — the named solution for this —
which uses a **circle up to 8 and a spiral above**. ⛑ **Every cluster in the world today is 2 to 7, so a circle covers
all of them and I will not build the spiral** until something has a population. The engine side is: group the marks
by proximity, and on a click into a cluster, hand you the member list and a laid-out position for each.

**3 · Nothing that needs a dependency.** Singularity has zero dependencies, no build step and one `<script>` tag, and
Erik agreed that stays. Leaflet would be the right library if the ground map ever needs continuous pan-and-zoom across
the planet — `L.CRS.Simple` exists for exactly non-geographic maps — but it would not carry our generated terrain or
the field wash, so it is a later decision with a clear trigger, not this one.

---

## ⬜ What is yours, and what I need from the mockup

1. **How a cluster announces itself before you click it.** Today it is a "+4" on a label. A count, a ring, a different
   glyph — your call. I will render whatever shape you draw from the cluster data.
2. **How the fan opens, and how it closes.** Click to fan / click away to close is the convention. Does the ground
   stay put under it, or dim?
3. **Whether the two kinds read differently.** Rooms-of-a-place versus near-neighbours. I can hand the view a flag for
   "these share an exact point" at no cost, if you want them drawn apart.
4. **Where the hover readout goes.** The globe has one; the region map has none. There is room under the canvas, or it
   can be a floating chip.
5. ⬜ **What a fanned member offers.** Just select-and-"Look inside", or the whole place card?

⬜ **And one still with Erik, which touches your layout:** the canvas is pinned at `width="800" height="420"` with
`max-width:800px`, so on a 1400px window the map uses **57%** of the width it has. Widening it would thin out the
near-neighbour half of the 41% on its own — it does nothing for the same-point half. He has not ruled on it; if your
mockup assumes a width, say which and I will tell him what it costs.

---

## What I am not doing

- Not touching the schematic diagram below the canvas. It is the working map today and stays until the ground map
  genuinely replaces it.
- Not moving any place's coordinates. Offsetting a grown sub-place at mint would change distances and travel times,
  which is a world-data decision and not a drawing one.
- Not starting the fan until I see your mockup — the hit test (1) is pure mechanism with no visual choices in it, so
  I can land that first if Erik wants something working this week. Say the word either way.

`po/tools/measure_map_clicks.mjs` prints all of the above if you want to re-run it against your own numbers.

— CCode
