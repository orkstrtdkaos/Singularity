<!-- status: FOR AEVI (and Erik, item 2). Your rulings built: CCODE-669 (figure shots on the home's map), 670 (the detour, the stubs, the Leviathan seam), 671 (the long road and a boat); and SNG-679 S5 (672, 673). One measured deviation (what "coastal" had to mean), one finding for Erik (a journey prices the road straight). -->
# CCode → Aevi · your rulings on W2–W5 and the films, built

**CCode · 2026-10-08 · CCODE-669 → 673**

## 1 · Figure shots end on the home's local map (CCODE-669)

The same `map` weight as a place shot; the painter dissolves to the figure's `homeLocation` map, and the portrait and the
name card draw over it. No home, or no map, keeps the close-in (the weight only counts when there is a map to show).
Watched with your still tool on life and death, shot 14: the globe closes on the Quiet Ground at u 0.15; at u 1 it is the
Quiet Ground's own map, **Neth** over *Who Has Buried More Than She Has Known*, her kept portrait in the inset.

## 3 · The detour (CCODE-670): your 1 and your 2, made hard

- **1.** `isCrossingPlace` knows a crossing by its kind or its region-scale face (`bridge`, `ford`: the Echo River Crossing,
  the Waystone). Within one world-raster cell of a crossing end (0.75°, derived from the raster the wetness is read from)
  the router prices the step without its water term.
- **2.** A road under 1° that walked over ×1.6 takes the ground's bend, else the plain straight line — the first that
  samples dry end to end, a crossing's own water counting as dry. A line that crosses water keeps the detour; a gate drives
  that on a synthetic river.
- **Millbrook → Echo River Crossing: ×3.3 → ×1.0. The gate is hard.**
- **Kindly Rest → Painter's Shelf: ×5.7 → ×1.06.** You asked what is between them: nothing. Their straight line is dry; the
  router had simply walked round the Echo's edge. No ford is needed and it keeps no walk.
- One rule set (`roadRules`) goes to every caller of the router — the world grid, the cap, the regions' own roads and the
  region map's painter — so the two maps draw one road.

## 4 · The stubs, the folded edges, Leviathan Road

- **Stubs:** a road whose projected run is under 3 px is not drawn at world scale; measured on the projection, so it draws
  when zoomed in, and always on the region and local maps. The measurement counts a straight arc under 3 px at the closest
  world zoom as a stub not drawn. Straight arcs drawn as roads: **12 → 1** — the Axis Gate → its gate yard, 0.16° (11 px at
  the closest zoom, so it draws there, honestly straight).
- **Folded edges:** nothing, as ruled — they were never drawn by the router, and the globe draws only the network's roads.
- **Leviathan Road → the Blaze — a bug, not a ruling, and not a road-kind skip.** The Blaze sits at exactly 180°. A grid
  running −180…180 projected it to x = W, one cell past the last, so the road was taken for one leaving the map toward an
  edge that isn't there and dropped *without being counted*. A point exactly on the far edge is in the last cell now. It
  routes at ×2.7 (12% of its straight line is wet). That is the one road the grid's over-×2 count gained (4 → 5); I raised
  that ratchet by hand with the reason written in the baseline, because a road that exists is counted.

## 5 · Buried roads on topo: as built, absent.

## 2 · The long road and a boat (CCODE-671) — one deviation, measured

**Your rule's "coastal" names neither pair.** On the world raster the four ends sit 1.3°–4.0° from the sea:

| end | nearest water |
|---|---|
| Thinwater | 1.5° |
| the Numen | 3.2° |
| Kindlerow | 1.3° |
| the Blaze | 4.0° |
| (the Crossing) | none within 15° |

So I measured coastal as **the sea within a week's walk of each end** (4.2°, in `walkingDays`' own scale). With your other
two conditions (straight line over 20% wet, land route over ×3) that names exactly the Numen ↔ Thinwater and Kindlerow ↔
the Blaze, and leaves out the Crossing ↔ Thinwater (34% wet, ×3.09, no sea near the Crossing). The Blaze is at 4.0°, so a
shorter week would drop it; if you want a different shore, it is one dial (`shoreDays` in `seaLanePairs`).

- **One derived list.** The road measurement writes `content/packs/core/world/sea_lanes.json` from the rule, and every push
  checks the file is the rule's answer **and** that it is exactly Erik's two — a third pair is a red line, not a quiet boat.
  The loader carries it as `CONTENT.seaLanes`; the map and the journey both read it. It is a derived file in your pack, marked
  so; please don't edit it by hand — rerun the measurement with `--write`.
- **The map** draws W4's dotted blue lane beside the land road for each pair.
- **The journey** between the two ends offers *"By road, the long way round"* and *"By water, if a boat will take you"*, the
  water way at the road's distance over `trade.waterSpeed` (3×); setting out by water says *"You find a boat going your
  way."* once on the road's record. Your words are `SEA_WAY_WORDS` in journeyplan.js; if you'd rather own them in content,
  put them under `rules.journey.byWater` and they win. Cost and peril stay the GM's, as you said.
- Seen in the browser: Thinwater → the Numen, *By road, the long way round — 74.3 days* and *By water, if a boat will take
  you — 24.8 days*.

## For Erik — a finding the boat brought out, not built

**A journey prices its road at the straight-line distance, not the road the map draws.** Thinwater → the Numen's land route
walks ×4.37 on the map, but its leg costs `walkingDays` between the two ends — 74.3 days, the crow's figure. So "the long
way round" is not longer in days than the line across the sea; the boat is simply three times faster on the same number.
Every journey is priced this way today. Should a leg's days follow the routed road's length? It would change every
journey's length (the median road walks ×1.4), so it is yours to rule, not mine to slip in.

## SNG-679 S5 · every tier draws state (CCODE-672, 673)

- **One reader, one painter.** `mapView` turns a key's folded state into what a painter needs (the mark, the glyph's and
  label's alpha, the name now, "once called", "new" for thirty days); `drawStateMark` draws a crack, broken walls (a gapped
  ring and a fallen slash) or a faint trace; the shared label painter takes a fade.
- **Region map:** a place cracked, a faded ruin with its name greyed, or only its trace labelled with your trace words; roads
  damaged dashed, ruined dashed and **barred** (a cased red bar at the middle), destroyed the faint line of an old road.
- **Globe:** the pins and the roads the same way.
- **Local map:** a site cracked with a scorch on the ground, a ruin, or a trace; the place's own water fouled and narrowed,
  running low and pale, or run dry — a bed of sand between dashed banks, named *"a dry bed"*.
- **Card:** *"once called {old}"* after a rename and *"newly founded"* for thirty days, beside the state band it had.
- **A "?" place draws no state.** What the character has not heard of, they have not heard has burned.
- Seen on Silas's save with your still tool: the ruined Archive Hollow road dashed and barred, the Mountain Pass greyed with
  broken walls, Millbrook's mark cracked inside its gold ring.
- **Not drawn yet, and why:** river-scale water (`water:<riverId>`) has no writer — no scene lists a river as a key it can
  see — so the world and region river lines wait for one; and "moved" draws at a new point once S8 says what `pos` holds.

## Next

Your new work order (the local maps draw what stands on each place's ground), then SNG-679 S7 and S8.

— CCode
