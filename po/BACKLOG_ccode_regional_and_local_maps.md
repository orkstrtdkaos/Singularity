# BACKLOG — regional and local maps, and moving around on them

**CCode · 2026-09-18 · Erik's ask, backlogged. Not started.**

> Erik: *"Backlog some map work... the world level and the power source mapping is great, but we have a lot of work to do on
> the regional and local mapping and navigation."*

The world tier stays as it is. Everything below is the two tiers under it, measured today on content (143 places, 38 regions)
and on screen with Silas's save at the Whistling Woman Post.

## What the two tiers do today

| | what it is | measured |
|---|---|---|
| **Region: the ground** (canvas) | every place in the region at its real position, on the baked terrain | a picture: **no click, no hover**. Since CCODE-416 a name that would land on another yields and the one that stays counts it (*"Whistling Woman Post +8"*), so a cluster shows one name |
| **Region: the diagram** (SVG under it) | how places CONNECT; the clickable view, with the travel button | draws only places whose parent is not in the same region — **82 of 143 places never appear on their own region's diagram** |
| **Local: "Look inside"** | a ring of sub-places around the host | a diagram, not ground: `local_layouts.json` is authored for **26 of 143** places and this view does not read it |

## The defects, by what a player hits first

1. ⛔ **Your own town is not on your region's map.** The valley diagram draws 5 of its 18 places. **Millbrook is four levels
   down** — under Echo River Crossing, under the Disputed Zone — Fringe — so the home of the Fell Pell never appears; nor do Echo
   River Crossing, the Reclamation Site or the Pale March waygate (under the fork, under Millbrook). **The Crossing's region draws 1
   of its 9.** The SNG-392 hierarchy nests settlements under settlements, and the diagram reads every parent as "inside".
2. ⛔ **You can only travel to a neighbour from the map.** The travel button appears only for places joined to where you stand by
   a road (from the Whistling Woman, 2 of the 6 other places drawn). The journey planner — road or gate, days, the route by name — exists in the
   engine (`planJourney`, `routeBetween`) and reaches the map only for neighbours; anywhere further, a player has to tell the GM.
3. ⚠️ **Another region is a double-click on a globe pin away.** The tier bar offers the World and the region you are in. There is
   no list of regions and no way to find a place by name.
4. ⚠️ **The ground and the diagram are two pictures of one region**, and only the one that is not the ground can be clicked.
5. ⚠️ **Edge labels still collide.** The ground map's "→ place" labels for roads leaving the region stack on the left edge, two of them
   printed on top of each other.
6. ⚠️ **Inside a place is a ring, not a floor plan.** 26 places have an authored local layout; none is drawn.

## Content under it (Aevi's)

- **Region maps: 8 of 38 authored.** 11 regions hold a single place and may want none.
- **Local layouts: 26 of 143.**
- **13 places still sit at an inherited position** (a room at its building's coordinates) — listed in
  `po/CCODE_20260918_travel_bugs_and_the_gate_cluster.md`. A place of its own among them will draw and route wrong.

## A proposed order — for Erik to reorder

1. **Every settlement on its region's map.** Nest only SITES (SNG-398: within a day of their parent); a settlement draws on the
   region map whatever its parent chain. Measured first, gated after: the count of places a region's map can show.
2. **Plan a journey to any place you know, from the map.** The place panel offers *Plan the journey* for every known place, with
   the road and gate options, the days, and the route by name — the same `planJourney` the GM directive uses.
3. **One region view.** The ground becomes the clickable view — glyphs select, clusters expand on click — and the connections draw
   as a toggleable layer over it.
4. **Find a place.** A region list in the tier bar and a search by name, both opening the region with the place selected.
5. **Inside a place, the authored ground** where a local layout exists; the ring where none does.

## ⬜ Two calls that are Erik's

- **What the region map is FOR first**: finding and planning a trip (the diagram's job), or reading the land (the ground's)? The
  order above assumes the first.
- **Whether a gate route can be planned from the map** for a place the character has only heard of — the planner restricts gates
  to ones the character knows, and the map shows places heard of too.
