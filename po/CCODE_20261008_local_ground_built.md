<!-- status: FOR AEVI. Your local-ground order built, G1–G7 (CCODE-674 → 677), and the Leviathan Road as a sea lane. Three choices to confirm (what I folded together, boats, the film's labels), one note on Cairnhold, one on effects. -->
# CCode → Aevi · the local maps draw what the place says is there

**CCode · 2026-10-08 · CCODE-674 → 677**

Every number below is measured on all 158 places at 800×500 through `localLayoutFor` → `localModel`, the same path the
map tier and the films take.

## G1 · read it (CCODE-674)

`local_ground.json` loads beside `local_layouts.json`, and every layout carries its place's entry. The entry is attached
on the way out, never cached on the save, so editing it changes every save at once.

## G2 · roofs from `dwellings` and `layout` (CCODE-674, adjusted in 675)

- `none` draws no roofs and no built ground. `few` draws exactly `n`. Every other value draws within its range.
- `cluster` is knots round the centre, the roads and the open sites, thinning outward. Houses are turned to their way
  within ±30°, with varied yards and gaps. Millbrook's gate holds that no five roofs stand in a line at one spacing.
- `street` lines the line the entry names. Thinwater's houses line its stream, which is now drawn (G4).
- **What I folded together, for you to confirm:**
  - `dug`, `rock` and `interior` draw as dark openings cut in, not roofs.
  - `stilts`, `hulls`, `floating` and `underwater` stand on the place's river, or in the entry's own pools.
  - `canopy` sits in the wood.
  - `tiers` round a lake at the centre ring it. Undermere is *"a city built in tiers around the water"*.
- **Cairnhold's gate yard:** your order says all fifteen gate yards draw 0 roofs. Your entry gives Cairnhold's *"a warden's
  hut"* (`few`, `n` 1). I followed the entry, so fourteen draw none and Cairnhold's draws its one hut.
- Short of their range at this frame size: 15 places when 674 shipped, 4 now. Three are cities whose built ground is
  45 px across (Deepmark, the Maw, Undermere); the fourth is the Wend's camp curve. The frame fits their far sites,
  so the city is small on its own map.

## G4 · features (CCODE-675)

- **Every entry draws.** 1,042 marks placed and 4 counted as named sites (G5): 1,046 of 1,046. Every line and every fill
  entry draws at least one run or patch. Anything that cannot fit goes in `short` with a reason; nothing is dropped
  silently. Nothing is short today.
- **`own`** stands exactly on the centre, where the roads meet, on a paper disc with a ring, and is drawn last. That holds
  for all 131 own marks. A line `across` and a run through the centre sit a little off it, because a stream through the
  centre drowned the own mark.
- **`state`:** abandoned is dimmed with fallen walls. Unfinished is an outline in scaffold. Dead is grey. Sealed is capped.
  Razed and former are footprints only. Fouled water is murky. A gate holds that every state your entries use changes the
  drawing.
- **Unnamed features carry no label.**
- **New marks:** all 21 are new glyphs in a ground alphabet of their own, drawn smaller than a site. None sits on an
  existing glyph. Two things for `_kinds`:
  - `cairn_row` is `n` cairns.
  - **`boats` draw as `boat` (a hull), not `dock`.** Millbrook's four boats beside its River Dock would otherwise read as
    five docks.
  - Measured on the pixels: the worst pair within the alphabet overlaps 34%, and against the place and site glyphs 44%.
    The threshold is SNG-409's 45%.
- **New lines and fills:** all drawn. Stream, cut channel, pipe run, trench, hedgerow, chain, beam and drive shaft.
  Orchard rows, ash, glass, grass, heath, mud, burnt ground with stumps, salt pans, blocks, kept clearings and a sheer drop.
- **Rules I had to choose, for you to confirm:**
  - `end` is toward the road the place is entered by. `far_end` is the side clearest of every road.
  - So the Spent Yard's intake yard is 12 px from its road and its sheds 74–75 px. The rigs stand a rank in from the sheds.
  - **No measured slope** (39 entries): falling ground and a drop go on the side clearest of the roads, and rising ground
    on the next-clearest. Each is listed in `fallbacks`. The Painter's Shelf's drop had first landed where its road runs.
  - **`river` or `water` with nothing within a walk:** the mark sits on the outskirts, also listed.
  - **A lake that IS the place** takes the heart of its ground (0.6 of it), so the city can ring it.
- By name: the Spent Yard has 0 roofs, 10 stacks in rows with 4 machines among them, 3 sheds and 3 cranes. The Kept
  Shrine has its shrine on the centre and 0 roofs. Thinwater's six shrines stand 6–9 px from its stream.

## G5 · authored layouts keep what they name (CCODE-675)

**It is a count, not a skip.** A site the layout already names, of the glyph a mark would draw, counts as one of that
entry's `n`, and no copy is placed on it.

- Greyhearth's four burial plots are its Burying Grounds and three more.
- An `own` mark is only ever counted against an AUTHORED site, never a sub-place record.
- Millbrook keeps its well, green, smithy and wheels. It gains a stone bridge across the river and four boats on it.

## G3 · farms, and G6 (CCODE-676)

- **The farmland** is the fields a place already draws (Millbrook's three), else the fields its entry names (Sunfold's
  four), else a ring of fields round the built ground. Ring fields are laid to the nearest road and painted under the
  built ground.
- **Farmsteads** stand inside a field, outside the built ground, each on a bent track off the nearest road. None stands
  third in a line at one spacing.
- **10 places farm, and every one has its full count.** Millbrook has 8 of 8 in its fields, Greyhearth 12, the Ceaseless 16.
- Millbrook's six hedgerows run along stretches of its fields' own edges.
- **G6:** with an entry, a generated field is not drawn. This is read at the model, so a layout already cached on a save
  loses it too. Authored fields stay, and the measured river, rock and wood stay. No place draws an invented field now, and
  no gate yard draws a field.

## G7 · labels (CCODE-677)

- **What I measured first.** The labels never overlapped each other, because the label space already kept their boxes
  apart. What piled up was each name written across the next site's mark. On the 21 authored layouts, painted as the film
  paints them: 99 names drawn, 11 of them across a neighbour's mark.
- **Built.** Every name is tested against every other mark before the label space is asked: a site's name, the ground's
  own italic names and the place's title.
  - A site label goes above, then the other side of its mark, then a step lower, then beside it on either side and a step
    lower there.
  - A ground name may move anywhere inside its own ground.
  - The title still always draws. It takes a clear spot first.
- **After:** 105 names drawn, none across a mark. Millbrook's store, well, green and smithy each read on their own.
- **The enlargement.** The map tier already gives Millbrook its panel, because its built ground is under 150 px across.
  At 900×560 the panel seats all nine central names.
- **A label that still can't be seated is dropped, not shrunk, by your A3 rule, and it is reported.** At 600×420
  Millbrook's panel drops the Mill Lane and the Water Wheels. At phone width (375) it drops four. The marks stay tappable,
  and the chip names them.
- **For you to rule: the film.** Your F1 ruling is no panel in a film. Under it, the film's Millbrook seats its names
  beside their marks and drops two: the Green and the Water Wheels. If you'd rather a film shot take the panel when a
  village can't hold its names, that reverses F1 for those shots. Say so and it's a small change.

## The Leviathan Road (CCODE-676)

- **Drawn as a sea lane:** the arc across the water, never bent along the land route.
- The raster cannot say it is a sea road. No place stands on water, and its straight line to the Blaze is only 12% wet.
  So it is named in one list, `SEA_ROAD_PLACES` in worldglobe.js, with your words beside it.
- If you'd rather own it in content, give the location a field and I'll read that instead.
- Its journey is still priced and offered as a land road. I didn't change travel without a ruling.
- The road measure no longer counts its land route as a road, so the over-×2 count went back from 5 to 4.

## Found on the way

- **Millbrook's enlargement panel threw, and with it the whole local tier.** This bug predates the order. The ford's
  rapids indexed the river from seven points before the ford, and in the panel's frame the ford sits at the channel's
  start. Fixed in 676. A gate now paints every authored layout, with its enlargement, at three sizes.

## Not built, and why

- **`effects`** (doubled, frames, false fronts, unlit, blocky, rain, …) are not in G1–G7. Tell me if they're next.
- **Longshore's appearance line:** noted as yours.

— CCode
