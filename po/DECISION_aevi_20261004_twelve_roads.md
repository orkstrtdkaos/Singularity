<!-- status: NEEDS ERIK. Erik 2026-10-04: "determine if the roads are supposed to exit out only the upper half or if they are supposed to exit more evenly around." Answer: evenly. A placement bug squeezed them. Fixing it moves the twelve foothills, which overturns the SNG-537 "no rebuild" ruling for the region field; the land is untouched. -->
# DECISION: Aevi → Erik (and CCode) · the twelve roads out of the Crossing (SNG-676)

**Aevi (PO) · 2026-10-04.** Erik: *"determine if the roads are supposed to exit out only the upper half or if they
are supposed to exit more evenly around."*

## The answer: they're supposed to leave all round. A bug squeezed them into one half.

Each of the twelve foothills is authored as the stop **between the Crossing and a pole** (`betweenCrossingAnd`).
The twelve poles are spread around the whole compass: 30°, 67°, 73°, 92°, 136°, 150°, 180°, 199°, 216°, 255°,
330° and 357°. So the roads should leave the city in twelve directions all round.

They don't, because of how the foothills were first placed. **Every foothill sits at exactly half its pole's
longitude, measured from 0°.**

| foothill | its pole | pole's bearing | foothill's bearing | off by |
|---|---|---|---|---|
| Kindlerow | the Blaze | 180° | 270° (= −90°) | 90° |
| Plainstead | the Unblinking Stone | 199° | 280° | 81° |
| Gearsflat | the Great Engine | 150° | 75° | 75° |
| Stair Hollow | Choirheight | 216° | 288° | 72° |
| Longshore | the Long Span | 136° | 68° | 68° |
| Greenmarch | the Heartroot | 255° | 308° | 53° |
| Hardline | the Redline | 92° | 46° | 46° |
| Greyhearth | the Quiet Ground | 73° | 36° | 37° |
| the Worn Yard | the Scour | 67° | 34° | 33° |
| the Low Market | the Maw | 30° | 15° | 15° |
| Thinwater | the Numen | 330° | 345° | 15° |
| Dusklow | the Underlight | 357° | 1.8° | 5° |

**Why it happened:** the Crossing is the pole, and the pole has no longitude; its stored longitude is 0. Taking
"the point between the Crossing and the Blaze" as the average of their coordinates averages 0° with 180°
(stored as −180°) and gives −90°. The true midpoint between the pole and anything lies on that thing's own
meridian. All twelve foothills fit `wrap(pole) / 2` to within two degrees, so this is the cause, not a
coincidence.

**What it does, beyond the city picture:**
- The road from Kindlerow to the Blaze runs sideways, 90° off the line from the Crossing.
- Every foothill-to-pole leg is longer than it should be.
- All twelve quarters outside the city wall sit in one half.

The globe and region maps are drawn faithfully; they are drawing the wrong positions.

The picture `po/img/twelve_roads_bearing.png` shows each road as it is, gold from the Crossing to its foothill
to its pole, and the straight bearing in blue.

## Why it isn't a one-line fix

1. **The foothills are region seats.** Each is a voter in the region field (`terrain.json` → `fields.voters`).
   Moving one changes which ground belongs to which region. That is SNG-537's *"moving it is a rebuild by
   another name"*, and Erik ruled the rebuild out then. **This decision overturns that ruling for the region
   field.**
2. **Four of the true bearings cross an inner sea at the foothill's current distance:** Longshore, Gearsflat,
   Kindlerow and Thinwater. The world's land was built round the misplaced seats. On the true bearing those
   four need to sit nearer the Crossing, where there is land. **The land itself does not need rebuilding.**

## The options

**A · Fix the world (my recommendation).**
- **The move:** each foothill goes onto its pole's bearing, at the nearest land to its current distance. Its
  sites, gate yard and local places move with it (SNG-409's inherited positions already do that).

  | foothill | new bearing | distance (colatitude) |
  |---|---|---|
  | Dusklow | 357° | 45.7 |
  | the Low Market | 30° | 45 |
  | the Worn Yard | 67° | 38 |
  | Greyhearth | 73° | 43 |
  | Hardline | 92° | 44 |
  | Longshore | 136° | **27** (was 36) |
  | Gearsflat | 150° | **31.5** (was 44) |
  | Kindlerow | 180° | **30.5** (was 45) |
  | Plainstead | 199° | 36.5 |
  | Stair Hollow | 216° | 42 |
  | Greenmarch | 255° | 45 |
  | Thinwater | 330° | **20** (was 45) |

- **What gets regenerated:** the region field only, from the new seats. Roads, travel times, the city's
  avenues, the quarters and the globe then follow by themselves.
- **What it costs:**
  - one region-field rebuild (CCode's pipeline);
  - every foothill's travel times change;
  - Silas's save will see the foothills in new places, though nothing in it breaks, because positions are read
    live;
  - my pockets that sit "beside" a foothill keep their authored connections, but I'll re-check their prose
    ("east of Gearsflat").
- **What it buys:** a world where the twelve roads go where they say they go, and a city with avenues all
  round it.

**B · Fix only the city drawing.** Draw each avenue at its pole's bearing. It's cheap. But the city map then
disagrees with the region map and the globe: the avenue leaves due south and the foothill it leads to is
north-east. I'd rather not have two maps that disagree.

**C · Keep it and make it canon.** "The roads all leave on the Valley side because…" I can't find a reason in
the world that isn't an excuse, so I don't recommend it.

## If Erik rules A

- **CCode:** a pipeline change. Recompute the twelve foothill seats on their poles' bearings, using the table
  as the target and nearest land as the rule, and regenerate the region field.
- **The gates:**
  - every foothill's bearing is within 5° of its `betweenCrossingAnd` pole's;
  - no foothill seat is on water;
  - §183's drift census is re-baselined in the same commit, with this ruling in it.
- **Mine:** the foothills' and pockets' prose that names a direction, plus the census note if a site changes
  tier (none should).

— Aevi, PO
