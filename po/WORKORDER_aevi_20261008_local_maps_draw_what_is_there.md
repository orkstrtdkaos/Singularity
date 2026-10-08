<!-- status: OPEN for CCode. Erik on the local maps: too simple, sometimes wrong. Measured on all 158 places. The content half (local_ground.json) is on origin with this order; the engine half is G1–G7. -->
# WORK ORDER: Aevi → CCode · The local maps draw what the place says is there

**Aevi (PO) · 2026-10-08.** Erik:

> *"most of the local maps are too simple and are in error at times. Not every location had homes... and if they do
> they aren't always lined neatly along the roads. In some places, you're supposed to have shrines and temples but
> they're not necessarily on the map. The spent yard doesn't show the machinery and reclamation process at all. if
> there are towns, such as millbrook you should also see farm houses and things of that sort scattered around the
> area."*

## What I measured

I ran this through the game's own `localLayoutFor` and `filmLocalMap` on origin, for every place below region tier.
The frames are in `po/ref/local_maps_before_20261008.jpg`.

- **143 of the 158 places have generated layouts, and every one of them has no mark at all, not even its own.** A
  generated layout's only sites are sub-places that are already records, so the Kept Shrine, the High Temple of the
  Body and the Half-Cathedral draw no shrine, temple or cathedral.
- **Houses come from the kind, never from who lives there.**
  - Every kind with a `built` fraction in `KIND_FILL` gets roofs, and `paintRoofs` puts them on both sides of every road
    and lane inside the built ground, at one even spacing.
  - So the houses are lined up exactly as Erik says. They also appear where nobody lives:
    - all fifteen gate yards (typed `village`);
    - the Painter's Shelf, a single cabin;
    - the Reclamation Site, a machine in a riverbed;
    - shrines, waygates, the poles and the underplaces.
- **Nothing is ever drawn outside the built ground.** Forty-five places draw fields, and none of those fields has a
  farmhouse in it. Millbrook, "home to a few hundred", draws three fields and a wet meadow with nobody living in them.
- **The places' own words never reach the map.**
  - 57 places name something in their own description or appearance that their map doesn't draw.
  - 21 of those name machinery or salvage. The Spent Yard's own line is *"timber, plate, cable and unidentifiable
    machinery stacked in labelled rows… cutting rigs under open sheds"*, and it draws a row of houses on a road.
- **Millbrook's labels stack.** The store, the well, the green and the smithy sit within a few pixels of each other, one
  over the next.

## The content half: `content/packs/core/world/local_ground.json` (mine, on origin)

There is one entry per place, all 158, each read off the place's own appearance and description lines; `_why` quotes
the line. Each entry says:
- **`dwellings`:** who lives here and roughly how many. `none`, `few` (`n` exactly), `hamlet`, `village`, `town` or
  `city`, with roof ranges in `_rules`. 83 places are `none`.
- **`layout`:** how the houses sit. The default is `cluster`, organic. `street` is only where the words say *along*.
  The others are `rows`, `grid`, `rings`, `tiers`, `stilts`, `rock`, `dug`, `canopy`, `scatter`, `yard`, `court`,
  `camp`, `hulls`, `floating`, `underwater` and `interior`, each defined in `_rules.layout`.
- **`features`:** marks, lines and areas. Each has a kind (`k`) from the closed vocabulary in `_kinds`, an optional count
  (`n`), where it goes (`at`, defined in `_rules.at`), an optional `state`, and `own` for the one that *is* the place.
  131 places name their own mark.
- **`outlying`:** what stands outside town, given explicitly where the words imply it (Millbrook's eight farmsteads,
  Sunfold's six). Every other surface village, town or city takes the **farms rule** in `_rules.farms`, unless it says
  `farms: false`; 18 do, each because its own words rule farmland out.
- **`effects`:** for the strange places, the treatment their words describe. Spindrift Hollow is `doubled`, the
  Flensing `frames`, the Last Mask `false_fronts`, the Unlit Deep `unlit`, the Blocklands `blocky`, and so on.
- **`_order`:** where the arrangement IS the point. On the Spent Yard and the Worn Yard, the reclamation reads as a
  line from the road: the yard it comes in at, the labelled rows where it waits, the sheds where the rigs cut it down.

`_kinds` says, for each kind, the glyph in `mapicons.mjs` it can use today, or `new`.

## The engine half

**G1 · Read it.** Load `local_ground.json` beside `local_layouts.json`. `localLayoutFor` takes the place's entry.

**G2 · Roofs come from `dwellings` and `layout`, never from the kind.**
- `none` draws no roofs. The built ground then draws as what its features say (a yard, a clearing) or not at all.
- `few` draws exactly `n`. Every other value draws within its range.
- **`cluster`, the default, must not look laid out:**
  - knots of houses round the centre and the junctions, thinning outward;
  - each house turned to its nearest way within about ±30°, some set back with a yard, with gaps between knots;
  - never two continuous rows at one spacing down a road.
- **`street`** is the frontage along the line the entry names (the road, the stream, the rim), with a little depth
  behind it.
- Every other layout as `_rules.layout` defines it. Those that aren't on open ground (`dug`, `rock`, `stilts`,
  `canopy`, `floating`, `underwater`, `hulls`, `interior`) each want their own simple treatment. Tell me which you'd
  rather fold together for now.

**G3 · Farms.** Where the farms rule applies, or an entry gives `outlying` farmsteads:
- the place is ringed by its farmland (the field areas you already draw);
- farmsteads, each a house with its barn and yard, stand scattered in that farmland, each on a short track off the
  nearest road;
- spacing is irregular, never in a line;
- the hedgerows Millbrook's entry names run along some field edges.

**G4 · Features.**
- Every entry draws: marks as glyphs, lines as lines, areas as fills, `n` repeated along its `at`.
- `own` draws at the place's own mark, the first thing the eye finds.
- `state` changes the drawing: `abandoned` dimmed with roofs fallen, `unfinished` an outline with scaffold, `dead`
  grey, `sealed` capped, `razed` and `former` as footprints only.
- Unnamed features carry no label. They're the ground, not places to go.
- **New marks needed:** farmstead, shed, machinery, crane, stacks, cairn, cairn row, post, lens, scales, stair, fire,
  shelter, footings, figure, aperture, stone field, leviathan, solid, sun disc, column.
- **New lines:** stream, channel, pipe run, trench, hedgerow, chain, beam, drive shaft.
- **New fills:** orchard, ash, glass, grass, heath, mud, burnt, salt pans, blocks, drop.
- Plain shapes are enough: a cog for machinery, a stack of bars for stacks, a gantry for crane. If any of these can sit
  on an existing glyph for now, say which and I'll note it in `_kinds`.

**G5 · Authored layouts keep what they name.** The ground adds dwellings, farms and unnamed features to the 18 authored
layouts, and never draws a second copy of a site the authored file already names within its radius. Millbrook keeps
its well, green, smithy and wheels, and gains its stone bridge, its moored boats and its farmsteads.

**G6 · The kind's fills stop inventing farmland.** Keep the measured terrain (the river within a walk, rock uphill,
wood in the widest gap between roads). Fields come only from the farms rule or the entry's areas, so a gate yard stops
growing two fields.

**G7 · Labels that overlap move.** When two site labels overlap, the second goes to the other side of its mark, then a
step lower. If a village still can't hold its names at the frame's scale, it takes the enlargement panel L-enlargement
already has. That's Millbrook.

## Gates

- **`content_ci`:**
  - every non-region place has an entry;
  - every `k`, `at`, `layout`, `dwellings`, `state` and `effect` is in the file's own vocabulary;
  - at most one `own` per place;
  - `few` carries `n`.
- **Driven, on every place:**
  - the model has at least one mark per feature entry (and `n` of them, where `n` fits the frame);
  - the roof count is within its `dwellings` range, and **zero where it is `none`**;
  - no roof stands outside the built ground except a farmstead;
  - every place under the farms rule has at least the minimum farmsteads, each inside a field area.
- **Driven, by name:**
  - **the Spent Yard:** 0 roofs, at least 10 stacks, 3 sheds, 3 cranes, and its intake yard nearer the road than its
    sheds;
  - **the Kept Shrine:** a shrine at the centre and 0 roofs;
  - **Thinwater:** its six shrines along its stream;
  - **the Painter's Shelf:** exactly 1 roof;
  - **all fifteen gate yards:** 0 roofs;
  - **Millbrook:** at least 8 farmsteads in its fields, and no five roofs in a line at even spacing (measure the
    collinearity, not the picture).

## Two smaller things found on the way

- **The Leviathan Road is a sea road**, which answers my question from this morning. Its own line: *"the migration road
  of the great leviathans across the world ocean… riders who live on the backs of beasts the size of towns"*. Its 4.3°
  to the Blaze isn't an unrouted road. Draw it as a sea lane.
- **Longshore's appearance line disagrees with its description.** The appearance has *"boats drawn up on the shingle
  below"*; the description has the inner sea *"a day and a half down the slope"*. The ground entry follows the
  description and draws no boats. Fixing the appearance line is mine, and I'll do it with the next art pass.

— Aevi, PO
