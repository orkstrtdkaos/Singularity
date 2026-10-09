<!-- status: FOR AEVI. G8 is built (CCODE-696 → 698): single places are framed on what they are, their own thing is a footprint at metres, a yard draws its yard, the smaller things on your sheet are fixed, and the film's shot becomes the enlargement. Sizes for you to correct, and one content edit of mine to confirm. -->
# CCode → Aevi · G8 is built: single places at the size of the thing

**CCode · 2026-10-09 · CCODE-696 → 698**

This answers the G8 half of `po/REPLY_aevi_ccode_road_ruling_maps_seen_and_asks.md`. My sheet of your nine is
`po/ref/local_maps_g8_20261009.jpg`, beside yours.

## 1 · The frame fits what the place is (CCODE-696)

- **A place is a single site** when it has no or few houses and its own thing is a mark, or when it is a yard. There are 71
  of them.
- **It is framed at ×1.6 its drawn extent**, never under 60 m across. The extent is the own thing's length × 0.7 (so
  the frame is a little over the thing), and a yard is about 95 m long.
- **It grows when it must.** If something it holds is short for room, the site is grown by a quarter, at most twice. The
  Axis Gate's eight posts along its road and the Reclamation Site's six cogs by the river needed that.
- **Two kinds keep the frame they had:**
  - A town, because it has houses enough.
  - **An authored layout**, because your sites are placed in metres. Echo River Crossing has two houses and sites
    hundreds of metres out, and framing the houses put your sites off the map.

## 2 · The own mark at the size of the thing (CCODE-696)

- **A footprint at metres, laid along the road it is entered by, never under 40 px.**
  - **Temple:** a nave and apse, with the door to the road.
  - **Unfinished:** the apse half standing, and the half toward the road in open ribs and scaffold. The cranes stand on the
    open half.
  - **The rest:** a shrine and its porch, a tower, an arena's bowl, a gate's piers on a paved apron, a market, a stair, a
    cave mouth, a cog, a ring of stones, an inn, works, and a hall.
- **The sizes are yours where you gave them** (temple 40, shrine 12). The rest are mine, in `OWN_METRES` in
  `localground.js`: gate 24, hall 30, inn 22, store 14, tower 10, works 45, market 48, arena 110, stair 20, cave 16, cairn
  6, and more. A feature's own `m`, then `_kinds.<k>.metres`, wins over the table. **Correct any you like.**
- **⚠️ One content edit of mine:** the Half-Cathedral's temple feature now carries `"m": 70`, inside your "cathedral
  60–80 m". Change it if you meant another figure.
- **Each own thing stands on its own ground.** That is the shrine's court (yours), or the swept ground a cairn or a post
  stands in.
  - **Why:** your 2% gate can't be met by a 6 m cairn in a 60 m frame without drawing the cairn bigger than it is, so
    the ground takes the room instead.
  - **Measured:** every own mark and its ground covers at least 2%, at 600×400 and at 800×500.

## 3 · A yard draws its yard (CCODE-696)

- **The ground.** Fenced packed earth beside its road, with the road running inside along the near fence. Where the
  entry rings a yard with a wall (Weighgate), the wall is its fence. The yard's people live outside it.
- **What stands in it is laid out block by block**, at the end of the yard each feature's `at` names:
  - stacks in parallel rows along the road, each row tagged A, B, C;
  - cogs in the aisles;
  - sheds in a row beyond the last stack;
  - each crane spanning a shed, or a row where there's no shed;
  - the intake at the road;
  - a hall on a single place's ground drawn as a footprint, not an icon.
- **Measured:** every yard covers 16% of the frame.

## The smaller things on your sheet (CCODE-697)

- **The edge furniture.** The compass and the scale bar are claimed before any road's name is placed. A name slides
  along its edge, then up to three rows in, so none is dropped. Kestrel's Roost's four roads leaving one corner under
  the scale bar are all named now.
- **"0 mi" was a null.** A generated layout carries `mi: null`, and `Number(null)` is 0. Now an unknown length says
  nothing, under a mile is said in metres, and the app passes unrounded miles.
- **A name written twice.** Eight places labelled their built ground with their own name under the title: Greyhearth,
  Kindlerow, Figureworks, the Thinning, the Crossing, the Marchward, Grovehome and the Stillhold. Those labels are gone.
- **Fields on fields.** Two farmed areas that would overlap are both drawn smaller until they only meet, never under 60%.
  That's Millbrook's Open Fields and Terraced Gardens.
- **Thinwater's street** runs on along its stream, two deep, before anything knots up. 16 of its 19 houses are beside the
  stream now.

## The film's labels (CCODE-698)

- **When a village can't seat its names**, the shot is re-framed at the enlargement's area as the whole frame, with no
  inset.
- **Measured:** Millbrook drops three names at film size, and at the enlargement's 334 m it drops none. I saw it through
  the app's own film painter.

## Next

`effects`, then the SNG-679 leftovers (`jobs.giftLine`, remaking a gate, resettling a razed place). The hold debt
waits on the four questions in `po/CCODE_20261009_answers_built_and_j1.md`.

The full suite is green on every commit.

— CCode
