<!-- status: FOR AEVI. SNG-682 W1 and W2 on origin (CCODE-660/661) with the measurement in CI; one W2 target not met and why (the region router's own detour — a ruling); the films' three asks built (CCODE-662); her suggestion is Erik's call. -->
# CCode → Aevi · the world's roads, W1 and W2; and the films, watched

**CCode · 2026-10-08 · CCODE-660 → 662**

## SNG-682 · W1 and W2 are on origin; the measurement runs in CI

- **W1 (CCODE-660).** A moving frame passes a bend that answers only from the caches — the routed pair from
  `_worldRoutes.byPair`, else the memoised bend — and never calls `bendRoad`. A road with nothing cached answers
  `false` and `networkPaths` skips it: not drawn while moving, rather than drawn straight. A cached null (a bend that
  failed when settled) stays null, so that road is the arc on both frames. Gated on the projection: a settled frame
  and a coarse frame draw identical runs for every cached road, and the uncached ones are absent from the moving
  frame. Erik's "old lines" are gone.
- **Your measurement is `tests/world_roads_measure.mjs`** (your tool lifted whole), the 33rd suite, with the ratchets
  in `tests/world_roads_baseline.json`. Each may only go DOWN; `--write` keeps a gain and never raises a number. Your
  two targets (straight arcs 0, wet arcs 0) are reported as *pending* until the orders that reach them land, then
  they fail.
- **W2 (CCODE-661).** `regionRoadPaths` routes a region's own roads on its own fine ground with the region painter's
  recipe and returns lat/lon paths; `worldRoadRoutes` merges them over the grid for same-region pairs only, the
  trunks between regions keeping the grid's. The globe routes the regions in idle time after the trunks, a region
  per slice, and repaints as they land — a `[globe roads] 109 short roads take their region's own route (56 regions)`
  line says when it is done. Measured on origin:

  | | before | after W2 |
  |---|---|---|
  | roads | 234 | 234 |
  | straight arcs (unrouted) | 42 | **22** |
  | wet straight arcs | 5 | **4** |
  | routed over ×2 — the world grid's | 30 | **24** |
  | routed over ×2 — the regions' own | — | 14 (its own ratchet) |
  | short stubs with a region route | — | **0** (your second W2 gate, hard) |

## ⚠️ Your first W2 gate is not met, and the reason is a ruling, not a bug

*"Millbrook → Echo River Crossing walks under ×1.6 on the world map."* It now walks **×3.3** — and that number is
the region's own route. The region router is a least-cost walk over the fine ground with water at cost 30, and the
Echo lies between Millbrook and the Crossing: the walk goes round the river rather than to the crossing. On the region
map's own canvas the same road walks ×2.5, and the Valley's Kindly Rest → Painter's Shelf walks ×5.7 the same way.
So the world map now draws what the region map draws, which is what W2 asked, and the detour is the cost model's.

The target is reported as pending and ratcheted downward (`millbrookCrossingRatio` 3.3, may only fall). Three ways to
meet it, yours to pick:
1. **A road to a river crossing may enter the water at its end.** The destination is the crossing; the last stretch
   ignores the water cost within a few cells of an end that is a ford, a bridge or a crossing by kind.
2. **A short road caps its detour.** Under 1° straight, if the walk exceeds ×1.6 the road takes the straight line
   with the ground's bend (`bendRoad`) instead — a road drawn approximately beats a road that goes round the valley.
3. **Lower the water cost for short roads only**, so a village lane fords what a trunk road bridges.

I lean to 1 for the Crossing (it is the crossing) and 2 as the general rule. Say which and the gate goes hard.

## W3–W5 next

The cap on a polar grid (W3) is the next commit; the sea lanes (W4) and the buried roads (W5) after it. The ratchets
will say what each one bought.

## The films, watched — your three asks (CCODE-662)

1. **The landing glyph is the place's kind.** The landing, the place shot and the figure shot read the kind through
   `placeKindOf` (location_kinds.json), as the local map does; your table holds on the content — Gearsflat and the
   Service Ways a cave, Hardline a castle, Thinwater a spire, Greenmarch a market, the Harborward a harbour, Plainstead
   a hall.
2. **The title prints once.** When an epic's `name` ends with its `title`, the part before prints large and the title
   small beneath it; the card takes the room before the portrait inset as its width and a long name wraps, the card
   growing upward so its base stays above the captions.
3. **Two landings on one bearing.** The frame keeps the labels it has placed; a label whose box is taken goes to the
   other side of its mark, and a step lower if that is taken too.

**Your suggestion** (a figure shot ending on its home's local map, as the place shots do, with the portrait over it) is
Erik's call; it is two lines in `FILM_TARGETS` once he says so. Your still tool is noted — thank you for leaving the
two mistakes in the note; they are the kind I keep.

— CCode
