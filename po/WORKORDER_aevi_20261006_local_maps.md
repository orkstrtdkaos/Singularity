<!-- status: OPEN for CCode. Erik 2026-10-06. Read against origin 8c49e6f86. Follows SNG-677 §0 (label precedence) and P (the place card). -->
# WORKORDER: Aevi → CCode · the local maps, and then the diagrams go (SNG-678)

**Aevi (PO) · 2026-10-06.** Erik:

> *"We need the local maps done. Then we can finally retire that geometric view."*

This is the fifth item of your own BACKLOG_ccode_regional_and_local_maps (2026-09-18): *"Inside a place, the authored
ground where a local layout exists; the ring where none does."* Erik's ruling goes further: **no ring at all.** Every place
gets ground. After that, the two diagrams retire:

- the **location tier's ring** (`renderMapLocation`, app.js:15266, laid out by `interiorLayout` in worldmap.js:177);
- the **region tier's connection diagram**, the SVG under the ground map (app.js:15535).

## What exists already

Most of the pieces are built. Nothing draws them.

| piece | where | state |
|---|---|---|
| authored local ground | `content/packs/core/world/local_layouts.json` | **18 places, 85 sites**: `radiusMetres`, `extent` features (water, field, wood, with bearing, distance and width), `sites` at `localMap: {bearing, metres}` with a `basis` and a `why`, and `_measured` roads out, river and uphill, re-measured against the frozen terrain |
| the gradients | `measureGradients` (engine/localdetail.mjs:122) | river bearing and distance, uphill, relief and roads out, for **any** place |
| the generator | `placeProposal` (engine/localbuilder.mjs:68), with SNG-404's precedence order and `location_kinds.json` (138 kinds) | proposes a site's position with its reason |
| the reader | places.js:244 | turns authored ground into sentences for the GM, and returns `null` for the 140 places without a layout |
| a city | `cityPlan` (engine/cityplan.js:50) | the Crossing, drawn |
| the label table, the space, the card | maplabel.js, `flushLabels`, SNG-677 P | shared |

places.js:254 says it plainly: *"it is not a map. There is no place-level canvas."* That canvas is this order.

## The work

**L1 · A local canvas.** "Look inside" opens a canvas tier in the region map's style, centred on the place.

- **Scale:** the frame shows `radiusMetres × 2.5`, widened to include every `extent` feature and every site. Show the
  scale in a corner, in the units places.js already speaks: metres under a mile, miles over.
- **Ground:** SNG-403 §1 holds: the terrain has nothing at this scale, so the local map must not upsample the region
  raster. Draw a plain ground in the region palette. Tint the slope toward `uphillBearing`, scaled by `relief`, so a
  hill town reads as a hill town.
- **Extent first:** water as a band across the frame at its bearing, distance and width, flowing on `flowBearing`.
  Fields and woods as soft areas.
- **Roads out:** from the `_measured.roadsOut` bearings, each leaving the frame with an exit label that names the
  destination, as the region map's exits do. The road nearest a site's `toward.road` passes it.
- **Sites:** glyphs by `kind` with names through the label table, at the SNG-677 §0 precedence. The site you are at,
  if you are at one, ranks first.
- **Labels:** the shared `labelSpace` and queue. Nothing in this tier draws a label any other way.

**L2 · Ground for every place, not 18.** Where no authored layout exists, generate one when the place is opened:

- `measureGradients` for its roads, river and slope.
- Its sub-places from `locationTierNodes` (the same list the ring draws today), placed by `placeProposal` in
  SNG-404's precedence. Each one carries its reason, as authored sites do.
- Fill to the place's `kind` from `location_kinds.json`.
- **Seeded from the place's id, so the same place draws the same way every time.** Cache it on the save, and mark it
  `generated`.

R28 holds: **authored is canon, the generator fills the rest.** If a place has an authored layout, the generator adds
nothing to it except sub-places the authored file does not name. Those get placed and marked.

**L3 · New places arrive with ground.** This is SNG-404 §5 and SNG-673's born-whole rule, at this tier. A place
minted in play gets its local layout at `commitGeneratedLocation`, so its first "Look inside" is the same as its
hundredth. A sub-place the GM names later is placed into the existing layout, not re-rolled with it.

**L4 · Cities use the city.** A place whose kind is a city draws through `cityPlan`, as the Crossing does now. It also
gets its wards and quarters when it has them in content (the Crossing does: `crossing_wards`, M13).

**L5 · Depth.** SNG-403 §4a: interiors need a vertical axis. The pocket halls, the delves and the deep places are
stacked, not spread. v1:

- A place whose sub-places carry `depth` draws one level at a time, with a level switch (surface, −1, −2…). Each
  level is laid out like L1.
- The shafts and stairs that join two levels show on both, as the way down and the way up.

If this is the long pole, ship L1–L4 first and leave interiors on the ring until L5 lands. Say so in the commit.
Don't fake a floor plan.

**L6 · What you know.** The local map shows the sites the character has visited in full and the ones they have heard
of dimmed, by the same rule the region map's "Show what you know" uses. A site nobody has told them about is not
drawn. This is a place they are standing in, so an empty map is worse than a sparse one. If nothing is known yet, draw
the ground, the roads and the host, with a one-line hint that the rest is found by looking.

**L7 · The card.** A tap on a site opens SNG-677's place card. "Look inside" on a site that is a place of its own
nests: its own local map, with the breadcrumb growing one step.

## Then the diagrams retire

Neither diagram goes until its jobs have a home on the ground maps. **Measure first.** List every control and every
piece of information each diagram offers, and where it now lives. Put that list in the commit that deletes it.

From my reading, the parity list starts here. Extend it with anything I missed.

| the diagram does | it moves to |
|---|---|
| ring: the sub-places of a place, visited or heard of, promoted ones ringed | L1 + L6 |
| ring: step into a promoted interior (nesting) | L7 |
| ring: `localSourcesPanel` beside it | stays, beside the local canvas |
| region diagram: **which places CONNECT** ("which the ground does not say") | a **Connections** toggle on the region map. It draws the edges that are not roads (waygate links, paths), as threads, never fills (B5's rule) |
| region diagram: "Show what you know": people met, threads heard of, where they live | the same toggle on the region map. People as small marks at their places, in the label rank below places |
| region diagram: "Show sub-places" | the local maps. The region map keeps one name per place, plus its +N |
| region diagram: the field colour per place | already on the ground |
| region diagram: zoom, fit and centre-on-me controls | the region canvas's own (CCODE-601/606). Add **◎ centre on me** if it is missing |
| region diagram: the travel button on a selected place | the card (SNG-677 P) |

Two cautions:

1. **Places the diagram reaches and the ground doesn't.** BACKLOG item 1 counted 82 of 143 places missing from their
   own region's diagram. Count the other direction too: any place that is clickable only on the diagram has to become
   clickable on the ground first.
2. **Gates that pin the diagram.** The wiring audit and the smoke tests reference the SVG ids (`skill-svg`, `graph-wrap`,
   `map-kg-toggle`). Re-point them at behaviour (does the toggle draw people on the ground?), not at the new ids. Don't
   delete them.

## Done when

- **Every one** of the 158 places opens a local map, and there is no ring anywhere in the app.
- **Millbrook** draws the Well at the centre, the Green just east, the Smithy on the Crossing road, the Mill Lane
  running south-west, and the Echo two miles out past the Wet Meadows, with the Water Wheels on it. That is its
  authored file, read as a picture, and it is the template.
- **A generated place**, any of the 140, draws the same on a reload, and a new place minted in play has a local map
  on its first open.
- At 390 px wide, the local map, its labels and the card all fit without scrolling the page.
- **Both diagrams are deleted**, with the parity list in the commit, and the ratchet is green with its gates
  re-pointed at behaviour.

## Order

SNG-677 §0 (label precedence) and P (the card) first, because every map here uses both. Then L1 on the 18 authored
places, L2, L3, L6, L7, and L4. L5 when it's ready. The diagrams last, after the parity list.

The content side is mine. If a generated layout comes out wrong in a way that is the data's fault (a site with no
reason, or a kind with no fill rule), send it to me with the place id and I'll author it.

— Aevi, PO
