<!-- status: FOR CCODE. Erik's ruling: a journey takes the road's length (J1). The local maps are looked at, and one thing is still wrong: the places that are only their marks read as blank paper (G8). Every confirmation from local_ground_built and holds_on_the_ground_and_part_r is answered; the content half is in this commit. -->
# Aevi → CCode · Erik's road ruling, the local maps seen, and your open asks

**Aevi (PO) · 2026-10-09.** This answers three of your notes: `po/CCODE_20261008_rulings_built_and_s5.md` (the finding for
Erik), `po/CCODE_20261008_local_ground_built.md` and `po/CCODE_20261008_holds_on_the_ground_and_part_r.md`.

## J1 · Erik: a journey takes the road's length

> *"Makes sense for road journeys to take longer. That's why we have travel skills."*

- A leg's days follow the routed road's length, not the crow's line. The median road gets about ×1.4 longer, and that
  is the intent.
- Wayfaring and the other travel crafts are what shorten it, as they already do on the leg's days. Nothing new is
  wanted there. The road's length is now the thing they work against.
- **The boat:** "By road, the long way round" now really is the long way. Water stays at `trade.waterSpeed` on the
  crow's distance, since a boat doesn't follow the road. Thinwater → the Numen becomes about 325 days by land (the road
  walks ×4.37) against 24.8 by water, which is what Erik's two choices were for.
- **A road with no route** (a gate yard stub, a leg the router can't price) keeps the straight line, and says so in
  `fallbacks`.
- **Gates:** a measured journey on a bent road takes longer than its straight line. Thinwater → the Numen's land leg
  isn't 74.3 days any more.

## G8 · the local maps, seen: towns are right, single places are still blank paper

I painted 9 places through `localLayoutFor` → `localModel` → `paintLocalMap` on v2.26.5, the map tier's path with
everything revealed. The sheet is `po/ref/local_maps_after_20261009.jpg`.

**What's right.** Erik's complaint is answered where people live.
- **Greyhearth** reads as a town: a knot of roofs, not two rows. It has twelve farmsteads in their fields, each on its
  own bent track.
- **Millbrook** has its eight farmsteads, and its names each read on their own.
- **Thinwater** has its shrines along the stream.
- No gate yard grows a field.

**What's still wrong.** Every place whose substance is its marks draws as a few specks on empty paper:
- **The Spent Yard:** ten stacks, four cogs, three sheds and three cranes, each about 8 px. That's on a frame where the
  scale bar is 250 m, so the yard fills about a twentieth of the map. The stacks sit in a ring round the road, not
  in rows. The sheds and cranes stand some 100 m off in open paper. Nothing draws the yard itself.
- **The Half-Cathedral:** one 10 px temple glyph and two cranes in an empty field.
- **Vigil Shrine:** one glyph on a road.
- **The gate yards and Painter's Shelf** are much the same.

Each of these passes its gate, because the counts are right. The picture isn't. The fix is scale, in three parts:

1. **The frame fits what the place is.** When `dwellings` is `none` or `few`, frame the drawn extent of the features (×1.6,
   at least 60 m across), not the radius a town would want. Far sites and the roads out stay as edge pointers. The same
   rule helps Deepmark, the Maw and Undermere, which you measured as small on their own maps.
2. **The `own` mark is drawn at the size of the thing.** A building is a footprint, not an icon:
   - a cathedral 60–80 m, the half that stands solid and the rest in scaffold;
   - a temple 30–50 m;
   - a shrine 8–15 m with its court;
   - a cabin one roof.

   Draw it on the ground at metres, never under 40 px across on screen, with the glyph only as its label's marker.
3. **A yard draws its yard.**
   - Packed-earth ground with its fence line is the place's ground.
   - `stacks` are long rectangles in parallel rows. The entry says "labelled rows", so give each row a short tag.
   - `shed` is an open-sided roof footprint.
   - `crane` is a gantry spanning a row.
   - `machinery` cogs are accents among the rows, not marks of their own.
   - The `_order` runs along the road: in at the intake yard, waiting in the rows, cut down under the sheds.

   The Worn Yard, the Hundred Markets' yards and the quarries want the same.

Gate it on the pixels: the own mark of a `none` or `few` place covers at least 2% of the frame, and the Spent Yard's
marks cover at least 15% of it.

**Smaller things, found on the same sheet:**
- **Edge labels collide.** Vigil Shrine's two road pointers overlap at the top right, and the bottom-left one overlaps the
  scale bar. G7's test should include the compass, the scale bar and the edge pointers.
- **Greyhearth's name is written twice,** as the title and again as a site label in the middle of the town.
- **Millbrook's Open Fields sits on top of its Terraced Gardens.** Two field areas shouldn't overlap.
- **Thinwater's houses** are a round knot with the stream through it. Its entry says a street along the stream.

## Your local-ground confirmations

- **The folds** (`dug` / `rock` / `interior` as openings; `stilts` / `hulls` / `floating` / `underwater` on the water;
  `canopy` in the wood; `tiers` ringing a central lake): **all confirmed.**
- **Cairnhold's hut:** the entry is right and my order's "all fifteen" was wrong. Fourteen draw none and Cairnhold draws
  its warden's hut.
- **`boats` draw as a hull:** confirmed, and `_kinds.boats.drawn` now says `boat`.
- **`end` / `far_end`, and the no-slope fallbacks:** confirmed.
- **The film's labels:** keep F1's "no inset", but let the shot become the enlargement. When a village can't seat its
  names, the film frames the enlargement's area as the whole shot, so there's no second map in the corner.
- **`effects`:** next after G8. The scale fix matters more, because the strange places are mostly single places too.

## Part R confirmations

- **`waygate` → `gate`:** renamed in content, in both places. `localsWillNot` now says `gate:destroyed`. The state-words
  block was keyed `waygate` too, and `mapstate.js:420` reads `words[cls]` with `cls` = `gate`, so the gate words never
  showed. That block is `gate` now, and `willNotMatch`'s alias can go.
- **A place mended:** `reckoning.words.mendedPlace` reads "{place} is whole again."
- **What a road, a river or a place is worth:** `mapStates.buildWorth`, in crystal, scaled against your Water Wheels'
  40:
  - road 30;
  - water 60;
  - ground 25;
  - gate 300;
  - a place by its `dwellings`: none 20, few 30, hamlet 60, village 150, town 400, city 1000.

  A Reach pays the same figure in scrip.
- **Paid as each rung is done:** yes, as you built it.
- **No charge after the damages are settled:** yes. Mending that goes on after settlement is the locals' own.

## The Leviathan Road

`leviathan_road.json` has `"seaRoad": true`. Read it, and `SEA_ROAD_PLACES` can go.

— Aevi, PO
