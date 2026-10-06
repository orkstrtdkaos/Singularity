<!-- status: OPEN for CCode. Erik 2026-10-06 (twice: build the local maps, and keep the local tier the ring stood in for). Read against origin 8c49e6f86. Follows SNG-677 §0 (label precedence) and P (the place card). -->
# WORKORDER: Aevi → CCode · the local maps, and then the diagrams go (SNG-678)

**Aevi (PO) · 2026-10-06.** Erik:

> *"We need the local maps done. Then we can finally retire that geometric view."*

Then, correcting how I first read it:

> *"Yes - but we need to keep the local map level that the geometric one was supposed to represent. You had started
> these before. Find your work."*

**The local tier stays. Only its drawing changes.** The ring was a stand-in for the third of Erik's three zoom levels
(SNG-383 §4, 2026-08-08):

1. **World:** regions and their gates.
2. **Region:** the places.
3. **Settlement:** *"its sites lay out as a local map."*

SNG-426 (August) authored the split in `location_kinds.json` → `regionDisplay`:

- **Seven sites marked `suppressAtRegion`:** the Low Lamp Inn, Mara Wells' Store, the Watershed Road, the Hundred
  Markets, the Quiet House, and the Cogitarium's entrance hall and third terrace.
- **Places renamed at region scale:** "Harmonic Heights", not "Harmonic Heights — Lower Terrace", with a city icon; "Echo River
  Crossing" as a `bridge`; "Greywater", not "The Greywater Stilts".

⛔ **Nothing reads it.** `regionDisplay` has no reader anywhere in app.js or engine/, so the region map still says
"Harmonic Heights — Lower Terrace" and still draws the inn on top of its district. That is the other half of this
order, **L0** below. The local map is where suppressed sites go, so the two land together. Retire the ring without
the local tier and those places have nowhere to be drawn. The ring retires once the local tier exists, and the
region diagram after both.

This is also the fifth item of your BACKLOG_ccode_regional_and_local_maps (2026-09-18).

- the **location tier's ring** (`renderMapLocation`, app.js:15266, laid out by `interiorLayout` in worldmap.js:177) is
  **replaced** by the local map;
- the **region tier's connection diagram**, the SVG under the ground map (app.js:15535), **retires** once its jobs
  have moved (the parity list below).

## The work this builds on (mine, August)

I started this in August and it never reached a renderer. Read these before you draw:

| | what it settled |
|---|---|
| **SPEC_SNG-403** (2026-08-09) | §1: the local map is a **new layer, not a further zoom**, because the terrain's finest feature is ~33 km. The frame is `localMap: {bearing, metres}` from the centre. The three gradients (river, uphill, roads) place everything: *water trades go riverward, terraces uphill, fields take the flat, gates and markets on the road bearings.* §4a: interiors need a vertical axis. |
| **SPEC_SNG-404** | The detailing engine: the **precedence order** (§2, corrected in §7: prose outranks gradient), every placement **emits its reason** (§4), new places get a layout **on creation** (§5), and `kind` is authored in `location_kinds.json` (§8). |
| **SPEC_SNG-417** | Four more layouts chosen **from save data**, the places characters actually stand in. The relief threshold narrowed to about 0.08. |
| **SPEC_SNG-423** | The Echo Vale as the **template**, both tiers complete. §4 is the authoring style the rest follow. |
| **SNG-419 / 422 / 427** | The rest of the 18. **427 rebuilt Millbrook** after Erik's review: the well was in the river. It added the `extent` layer: water, wet meadows, open fields, terraced gardens, coppice and built ground. |
| **SNG-426** | Region maps **name places**; local maps **name parts of a place**. `regionDisplay` gives the region-scale name and kind, and suppresses sites. **Authored, never read** (L0). |

**Erik's review of my first render (2026-08-11) is the visual brief, and it still stands:**

> *"Where are their woods, fields, buildings (if local is a town like this)… at this zoom level (the most detailed
> we get) the river should have bends and sandbars and banks and rapids… If you don't have the capacity to make a
> nice looking town map, then maybe just keep the locations and layout ready to hand to ccode."*

The locations and layout are what I kept, and this is the hand-off he meant.

**The target picture:** `po/img/local_mock_millbrook.png`, drawn from `local_layouts.json` and nothing else. The
named things are all authored. The texture under them is the kind of thing L2 generates: field strips, roofs, tree
crowns, the meander, sandbars on the insides of the bends, reed banks, the narrows with rapids above the ford, and
contours across the uphill. Sites near the centre drop at the full frame and show in an enlargement of the built
ground. That is the SNG-677 §0 rule applied at a new scale, not a special case.

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

places.js:255 says it plainly: *"it is not a map. There is no place-level canvas."* That canvas is this order.

## The work

**L0 · The region map reads `regionDisplay`.** At region scale, use `regionName` and `regionKind` where present,
and skip `suppressAtRegion` sites. A suppressed site's parent shows its +N, and the site itself appears on the
parent's local map (L6). The gate: every suppressed id is absent from the region labels and present on its parent's
local map.

**L1 · A local canvas.** "Look inside" opens a canvas tier in the region map's style, centred on the place.

- **Scale:** the frame fits every site and the near edge of every `extent` feature, the way the mock frames the
  wheels and the ford 3.4 km out. When the built ground comes out under about 150 px across, it gets an
  **enlargement** with the central sites in it. Show the scale in a corner, in the units places.js already speaks:
  metres under a mile, miles over, plus the walk ("500 m · about six minutes' walk").
- **Ground:** SNG-403 §1 holds: the terrain has nothing at this scale, so **never upsample the region raster.**
  Paper ground, with contours running across `uphillBearing`, tightening with `relief`, so a hill town reads as a
  hill town.
- **Extent, drawn as what it is**, not as soft blobs (Erik's brief):
  - **water:** a channel of its authored width on `flowBearing`. It meanders, has banks and a reed edge, sandbars
    on the insides of the bends, and a narrows with rapids where the layout or the kind calls for one.
  - **field:** strip patchwork, oriented to the nearest road.
  - **wood:** tree crowns; coppice shows cut stools.
  - **built:** roofs along the roads, and around any `open` site such as a green.
  - The texture is seeded from the place id, so it never moves between visits.
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

## Data fixes found by drawing it (mine, in this commit), and two questions I still own

Drawing Millbrook from the file showed four sites the file got wrong. They are fixed in `local_layouts.json`, with
the old values kept beside the new ones:

1. **The wheels, the landing and the ford were on the wrong bank.** The Echo is authored at 3200 m on −134°, 260 m
   wide, flowing 162°. At their old distances (3400, 3500 and 3300 m) all three fell beyond the far bank. They now
   sit at 3040 m (the wheels, on the near bank), 3230 m (the landing, just downstream of the wheels) and 2940 m (the
   ford, mid-channel). The river stays where it is, and §50's "The Echo — 2.0 mi south-west" still reads true.
2. **Mara Wells' Store** named the Crossing road, but its bearing (−13°) is the north road to the Disputed Zone. The
   `toward` now names that road.

Two I haven't resolved yet, both mine:

- **`_measured` says the nearest traced river is 311 mi away**, but the layout and `placenames` both put the Echo
  two miles from Millbrook. The authored ground is canon (R28), so the local map draws the Echo. I will reconcile
  the region tier, either with SPEC_local_geology's local-geology route or by re-checking the measurement.
- **The west road to the Sunken Choir crosses the Echo with no crossing authored.** It needs a ferry, or it should
  bend to the Old Ford. My guess is the ford: that is what a ford is for. I'll rule on it in content. Draw the road
  to whatever the file says.

## Done when

- **Every one** of the 158 places opens a local map, and there is no ring anywhere in the app.
- **Millbrook** reads like `po/img/local_mock_millbrook.png`: the well at the centre, the green just east, the
  smithy on the Crossing road, the Mill Lane running south-west, and the Echo two miles out past the Wet Meadows,
  with the wheels and the landing on its near bank and the ford in the water. The style needn't match the mock; the facts must.
- **All seven `suppressAtRegion` sites** are off the region map and on their settlement's local map, and the
  region map shows the `regionName`s.
- **A generated place**, any of the 140, draws the same on a reload, and a new place minted in play has a local map
  on its first open.
- At 390 px wide, the local map, its labels and the card all fit without scrolling the page.
- **Both diagrams are deleted**, with the parity list in the commit, and the ratchet is green with its gates
  re-pointed at behaviour.

## Order

SNG-677 §0 (label precedence) and P (the card) first, because every map here uses both. Then L0 with L1 on the 18 authored
places, L2, L3, L6, L7, and L4. L5 when it's ready. The diagrams last, after the parity list.

The content side is mine. If a generated layout comes out wrong in a way that is the data's fault (a site with no
reason, or a kind with no fill rule), send it to me with the place id and I'll author it.

— Aevi, PO
