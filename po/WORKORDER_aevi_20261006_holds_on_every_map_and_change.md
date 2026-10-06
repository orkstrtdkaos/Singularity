<!-- status: OPEN for CCode. Content half shipped with this order (feature site kinds, hold radii, frame decks, map-state words and effects). -->
# WORK ORDER: Aevi → CCode · Holds on every map, and everything on the maps can change (SNG-679)

**Aevi (PO) · 2026-10-06.** Erik:

> *"Make sure traveling holds can show up on all the map levels with site details on the local level. Every single
> thing that exists needs to be able to be added, damaged, ruined, moved, etc by the game."*

This order extends **SNG-672 M3** (`placeState`) from places to everything a map draws, and builds on **SNG-677**
(world map + card) and **SNG-678** (local maps). Where they overlap, this order says which one wins.

## What is true on origin today (read, not assumed)

| finding | where |
|---|---|
| **No map draws a holding.** `character.holdings` is read only for framing the world view. | app.js `renderMapWorld` (14848), `renderMap` (15949); worldglobe.js `visiblePins` / `markerKind` (656) have no hold kind |
| A moving hold's position exists but is **linear in longitude and colatitude**. From longitude 350 to 10 she sails the long way round through 180. Near the Crossing it is the same pole error as the measuring script in CCODE_20261006. `nearestId` (what raids her) inherits it. | carriage.js `voyagePosition` (64), `whereaboutsOf` (89) |
| A caravan's position jumps from place to place (`path[i]`); nothing gives a point between. | caravan.js `positionOnRoad` (59) |
| **Three places move and never do.** The Long Span, the Unlanded and the Wend carry `carriage.circuit` + `daysPerCircuit`, and no engine code reads `circuit`. The Unlanded's own text promises that a player who reaches a waypoint on the wrong day finds ruts and nothing else. | content `valley/locations/the_{long_span,unlanded,wend}.json` |
| Another player's hold under way is published at its **port**: `holdCard` takes `worldPos` from `locationId` only. | sharedholds.js `holdCard` |
| A hold has a `condition` (failing … thriving), which is its **fortune**, and raid slips. Nothing is physical: no damaged wall, no burned mill, no wrecked hull. | holdings.js 50, 131 |
| `holdingOps` kinds: caravan, carriage, claim, crew, feature, garrison, improve, release, rename, route, sail, sell, steward, stock, transfer. **No damage, ruin, destroy, repair or move.** | GM op channels |
| **No GM channel can change a place, site, ground, road, river or waygate.** SNG-672 M3 is unbuilt; there is no `placeState`. | grep: zero hits |
| What *does* change today: `character.gatesHeld` / `powerState[id].gateHeld` (gatehold.js 79–87). That is a holder, not a state, and it stays as it is. | |

## Part H · Holds on every map

**H1 · One hold reader for the maps.** `mapHolds(character, { sharedStore, locations, worldDay })` returns one row
per hold the character can know about:

- their own holds (`character.holdings`);
- other players' holds from `sharedHolds`, as far as their cards say;
- caravans under way (`caravansOf`);
- moving places on their circuits (H5).

Each row carries `{ key, kind: "hold"|"caravan"|"movingPlace", name, ownerName, rung|frame, atSea|onRoad, worldPos,
from, to, fraction, placeId, state }`. All three tiers read it. Nothing draws a hold any other way.

**H2 · Where a moving thing is, once, and on the globe.** Replace the lerp inside `voyagePosition` (not beside it, so
raids and the maps agree):

- along the **routed line** between `from` and `to` when one exists (`worldRoadRoutes`, CCODE-626) at `fraction` of
  its length;
- otherwise a **great-circle** interpolation (slerp on the unit sphere).

`nearestId` follows from the corrected point. Caravans get the same treatment: `positionOnRoad` keeps `placeId` and
adds `worldPos`, interpolated between `path[i]` and `path[i+1]` the same way.

**H3 · The world and region maps draw holds.**

- A new `markerKind` for holds, with one shape for fixed holds and one for moving ones. The rung or frame sets the
  size. Your own holds and other players' holds are told apart by colour, not shape.
- A moving hold under way is drawn **at its point**, with its route from `from` to `to` (the part sailed is solid, the
  part to come is dashed), and its card reads `voyageLine`. A moored one sits beside its place's pin, offset so it
  never covers it.
- Caravans are a smaller mark on their road, with the same solid and dashed line.
- **Label precedence (amends SNG-677 §0):** the place you're in → **your holds** → places → other players' holds →
  field sources → named ground → powers.
- Tapping one opens the SNG-677 card (popover, or bottom sheet on a phone) with the hold's card:

  - name, owner, rung or frame, condition, state (Part S) and features;
  - for a hold under way, where she is and how far along.

**H4 · Shared holds publish where they are.** `holdCard` publishes `whereaboutsOf(h).worldPos` when she is under way,
with `atSea`, `from`, `to` and `fraction`, so other players see her on the water and not at her port. The card stays
"what a visitor could know": no store, no crew names.

**H5 · Moving places move.** `circuitPosition(loc, worldDay)` walks `carriage.circuit` at `daysPerCircuit`. Each leg
gets days in proportion to its great-circle length, and the position comes from the same H2 rule. Then:

- `positionedPlace` answers the live position for these three, so maps, routing and `whereOf` agree.
- **The Unlanded never stops**, so it has no "at" state. The Long Span and the Wend are "at" a waypoint for the first
  part of each leg. Their content says nothing finer, so use a stop of 20% of the leg's days.
- **Arriving where the place is not** finds its trace (`words.place.trace`), as the Unlanded's own text promises.

**H6 · Local level: the hold is a site, and opening it shows its features as sites.**

- **At its place.** A fixed hold is a site on its place's local map. Its position (`holding.site = { bearing,
  fromMetres }`) is chosen once by L2's placer when the hold is claimed, avoiding water extent and existing sites,
  and then **stored**, so it never jumps. Holds that exist today are given one on first draw and stored the same way.
  Its kind is its rung. Use the `tower` glyph from `keep` upwards, `quarter` below it, and the rung's name on the card.
- **Its own local map.** Each feature is a site:
  - **Kind:** `holdFeatures.kinds[k].siteKind`. All 44 are in content now, all from the closed vocabulary.
  - **Position:** for a fixed hold, within `holdStore.slots.ladder[rung].siteRadiusMetres` of the hold's centre,
    placed once and stored on the feature (`feature.site`). The hold's ground follows L3 from the hold's own point.
  - **A moving hold's local map is the hold itself.** The features are laid out by
    `holdStore.slots.frames.kinds[frame].deck`:
    - `line`: front to back, along `lengthMetres`, with the bow facing the direction of travel;
    - `stack`: L5 levels;
    - `ring`: around an open middle;
    - `scatter`: placed and stored as for a fixed hold.

    It is drawn on whatever it is passing over: the water or ground at its point (L3 at `worldPos`), not a town.
  - **Name:** the feature's `name`, or the kind's `label`. Its state comes from Part S.
- **Count.** A feature with `count` > 1 is one site with the count on its card, not N glyphs.

**H7 · Other players' holds at the local level** are sites on the place's map, at the position their card publishes.
`holdCard` adds `site` alone, not the hold's feature layout. A visitor sees the hold, not its rooms.

## Part S · Everything on the maps can change

**S0 · The inventory: every class a map draws, and the changes each takes.** This table is the scope. A gate (G1)
keeps it complete.

| class | key | added | damaged / ruined / destroyed | repaired | moved | renamed | revealed / hidden |
|---|---|---|---|---|---|---|---|
| place | `place:<id>` | SNG-672 M1 mint | ✓ | ✓ | ✓ (§S8) | ✓ | ✓ |
| site | `site:<placeId>/<siteId>` | ✓ (bearing, metres) | ✓ | ✓ | ✓ | ✓ | ✓ |
| ground (extent area) | `ground:<placeId>/<n>` | ✓ (cleared, planted, drained) | ✓ | ✓ | – | – | – |
| water (channel or river) | `water:<riverId>` or `water:<placeId>/<n>` | ✓ (a cut channel) | ✓ | ✓ | ✓ (turned) | ✓ | ✓ |
| road | `road:<a>\|<b>` (sorted ids) | ✓ | ✓ | ✓ | ✓ (new line) | – | ✓ |
| waygate | `gate:<placeId>` | ✓ (made) | ✓ | ✓ (not from destroyed) | – | – | ✓ |
| hold | on the record | `claim` | ✓ | ✓ | `sail`, or §S8 | `rename` | – |
| hold feature | on the record | `feature` | ✓ | ✓ | ✓ (within the hold) | ✓ | – |
| caravan | on the record | `caravan` | ✓ (raided) | – | on its road | – | – |
| region / named ground | `region:<id>` | – | – | – | – | ✓ | ✓ |
| power's mark | derived | – | follows its seat (a place) and its anchors | – | follows its seat | – | – |

**S1 · One door.** `applyMapChange(character, change, ctx)` is the only writer. Each change is
`{ key, change, …args, by, cause, beat, day }`:

- `change` is one of `content.mapStates.changes`;
- `by` is a person, a power, or "the world";
- `cause` is a short world phrase ("fired in the raid", "the flood");
- `beat` is the turn id.

Every channel calls it: the GM's new `mapOps` (S3), the hold channels that already exist (S4), raids, and the world
tick. That is SNG-672 M1's "one door", applied to change. It validates and writes, then bumps the **world revision**
(SNG-672 M4).

- **Validation:** the key resolves; the class allows the change (S0); a `damaged`/`ruined`/`destroyed` step is a move
  on `mapStates.ladder`; `added` names a parent that exists and a kind from the closed vocabularies; a repair of
  `destroyed` is refused except for things S0 says can be added again.
- **The ladder is free to jump.** A fire can take a mill from whole to destroyed in one change. Repair climbs one rung
  per change, at `repairCost`.

**S2 · One store, one reader.**

- **Holds, features and caravans** keep their state on their own records (`holding.state`, `feature.state`,
  `caravan.state`), the way `condition` lives there now. Fortune and fabric are separate axes: a thriving hold can
  have a burned wall.
- **Everything else** lives in `character.mapState[key]`, the SNG-672 M3 overlay generalised. `placeState` *is*
  `mapState` with the `place:` prefix. Don't build both.
- Each record is `{ state, since, by, cause, beat, name?, was?, pos?, history[≤12] }`. `was` holds what a move or
  rename replaced, for the trace and the "once called" line.
- `mapStateOf(character, key)` reads both stores and returns `{ state: "whole", … }` for anything never touched. Every
  renderer, the router, the economy and `groundForGM` read it. **The live record wins** (SNG-672 M2).

**S3 · The GM channel: `mapOps`.** It has the same shape as the other op channels, and its prompt section lists only
what the scene can see:

- the place the party is in and its sites, ground and water;
- the roads out of it;
- the holds there.

It writes through S1 and nothing else. An op the scene could not see is refused, the way a `holdingOp` on a hold you
don't own is refused today. The GM's lore section describes damaged and ruined things using `mapStates.words`, so the
prose and the map say the same thing.

**S4 · The existing channels go through the door.**

- **`holdingOps` gains** `damage`, `ruin`, `destroy`, `repair` and `move`. `move` relocates a fixed hold within its
  place, or to a new site when the story re-founds it. **`feature` gains** the same, aimed at one feature.
- **A raid that succeeds** writes `damaged` to the features its slip names (defence features first), not only a fall
  in `condition`. A raid that "burns" writes `ruined`.
- **The world tick** writes through S1 when a power takes or loses a seat: `gatesHeld` stays the holder, and a fought
  gate becomes `damaged`.

**S5 · Every tier draws state.** The words are content (`mapStates.words[class]`). The marks are yours.

| state | world map | region map | local map | card |
|---|---|---|---|---|
| damaged | pin gets a crack mark | glyph cracked | glyph cracked, a scorch on the ground | `words[class].damaged` |
| ruined | ruin pin | ruin glyph, greyed label | ruin glyph, walls broken | `ruined` |
| destroyed | faint trace dot | trace, label `trace` | trace only, `trace` as its name | `destroyed`, and `trace` as the line |
| moved | drawn at the new point | new point, plus a faint trace at the old one if the character knew it | same | `moved`, with `{from}` |
| renamed | new name | new name | new name | `renamed` ("once called {old}") |
| added | normal; "new" on the card for 30 days | same | same | `added` |
| water damaged / ruined / destroyed | river line thinned | thinned, then dashed, then a dry bed | channel narrowed, then dry | `words.water.*` |
| road damaged / ruined / destroyed | road dashed | dashed, then blocked with a bar | as region | `words.road.*` |

**S6 · State changes play, not just pictures.** The numbers are in `mapStates.effects` and `repairCost`, read from
content (first cut, Erik rules them):

- **Features:** the effect multiplies what the feature gives (yield, defence, aura, beds, facility). A ruined feature
  keeps its room; a destroyed one frees it. A hold's own state caps its features.
- **Roads:** damaged ×1.5 days. Ruined ×2 days and closed to carts, caravans and moving holds. Destroyed is out of
  `routeBetween` until it is repaired or added again.
- **Waygates:** damaged is +1 day. Ruined and destroyed are out of the network; destroyed needs remaking at the full
  cost of making one.
- **Places:**
  - **Ruined:** no services (market, inn, trade) and no territory anchor, but still a road end, so you can walk to a
    ruin.
  - **Destroyed:** not a road end, no anchor; a trace. **This amends M3**, which took ruined places off the roads
    too.
- **Water and ground:** the multiplier applies to the water-fed and ground-worked features of the places and holds on
  them (mills, docks and fisheries; fields, herds and quarries).

**S7 · What the character knows.** The map shows the state the character **has learned**, not the state the world
holds. A change carries `beat`; the character learns it by being there, being told (a GM line naming it), or a
relay/hold report. Until then their map shows the old state, and the card says `knowledge.lastKnown`. This is SNG-672
M6's layering applied to state. If M6 isn't built, ship S1–S6 with "learned = everything", and keep the field.

**S8 · Adding and moving, the cases that need rules.**

- **Adding a site or ground** takes `{ bearing, fromMetres }` or `{ toward: <placeId>, near|far }`, the same shapes
  local_layouts uses. The new thing joins the layout as an overlay entry; content isn't edited.
- **Adding water** is a cut channel, `{ bearing, fromMetres, widthMetres, flowBearing }`, drawn like extent water.
  Turning a river (`moved`) re-routes its local channel at the places on it. Re-routing the world river trace is out
  of scope: the world map draws the old line marked `turned` until the hydrology can say otherwise.
- **Moving a fixed place** is rare and is a story act (a village rebuilt above the flood line). It writes `pos`. Its
  layout keeps its sites, **drops its water and ground**, re-derives them by L3 at the new point, and leaves a trace
  at the old one. Its roads re-measure live. Cap it at 0.5 days from the old point. Further than that is a new place
  founded (M1) and the old one ruined or razed.
- **Adding a road** between two places adds a live connection (M3's "road opened"). It is routed by CCODE-626's
  router like any other road.

## Content shipped with this order (mine, on origin with this commit)

- **`economy.json` → `holdFeatures.kinds[*].siteKind`:** all 44 feature kinds name their site glyph from the closed
  vocabulary. For example, mine → `underplace`, fishery → `dock`, grave ground → `burial` and reclamation bowl →
  `circle`.
- **`holdStore.slots.ladder[*].siteRadiusMetres`:** post 40 · steading 90 · hamlet 150 · village 250 · town 450 ·
  keep 300 · fortress 400 · stronghold 700.
- **`holdStore.slots.frames.kinds[*].deck`:** hull is a 30 m `line`; legs is a 2-level `stack`; lift is a 60 m
  `ring`; grown is a `scatter`; borne is a `line` along the bearer's back.
- **`location_kinds.json` → `mapStates`:** the ladder, the changes, the player-facing words for every class in S0,
  `knowledge` words, `effects` and `repairCost`. The words are world language only (SYSTEM_SPEC §29.7). Build notes
  sit under `_`.
- **Your ruling from CCODE_20261006 (`regionDisplay` precedence): your reading is right. Implement it.** An entry is
  an explicit decision: `suppressAtRegion` suppresses, any other entry keeps, and the 0.5° rule decides only places
  with no entry. `_suppressionRule` now says so.
- **`the_service_ways.radiusMetres` is 800.** The earlier write left it `null`; you were right that it wasn't there.

## Gates (behaviour, on in-memory copies)

- **G1 · The inventory is closed.**
  - Every class `mapHolds` and the three renderers draw has a row in a `MAP_CLASSES` table. Every class has
    `mapStates.words[class]` for each change S0 allows it.
  - Every `siteKind`, and every state × tier in S5, has a mark.
  - A new class drawn on a map without a row fails.
- **G2 · One door.** Grep: nothing writes `mapState`, `holding.state`, `feature.state` or `caravan.state` except
  `applyMapChange`.
- **G3 · Each change plays.** On a copy:
  - ruin a road and `routeBetween` costs ×2 and refuses a caravan;
  - destroy it and the route is gone;
  - repair it and the route returns;
  - ruin a waygate and the network drops it;
  - damage a mill and its yield halves;
  - ruin the Echo and a mill or fishery on a hold at Millbrook yields 0;
  - raze Millbrook and it is not a road end, while a ruined one still is.
- **G4 · Every tier shows it.** For each class × state, the render model (not the canvas) of the world, region and
  local maps carries the state's mark and the card carries the word.
- **G5 · A hold under way is where she is.** A voyage from longitude 350 to 10 at half-way is near longitude 0, not
  180. A voyage between two places near the Crossing stays within the great-circle distance of both. A raid's
  `nearestId` is the same place the map draws her nearest.
- **G6 · Holds are on every map.**
  - A hold at Millbrook is a site on Millbrook's local map, in the same spot across two loads.
  - Opening it shows one site per feature, with the `siteKind` glyph.
  - A hull under way is a pin on the world and region maps at her H2 point, and her local map is a `line` deck on
    water.
  - Another player's hull under way appears at her point, not her port.
- **G7 · Moving places move.** The Unlanded on day 0 and day 14 are at different points, and both are on its circuit.
  Arriving at a circuit waypoint on a day it isn't there finds the trace.
- **G8 · Knowledge.** A change made where the character isn't shows `lastKnown` until they learn it.
- **G9 · Player-facing words.** Every string in `mapStates.words` and `knowledge` passes the §29.7 check (no ticket
  id, no file name, no build words).

## Order

1. **H2** (whereabouts on the globe), because raids are reading the wrong point today.
2. **S1 + S2** (the door and the store, with `placeState` folded in) and the **G2** gate.
3. **H1 + H3 + H4** (holds on the world and region maps).
4. **S5 + S6 + S3 + S4** (state drawn and played; the channels).
5. **H6 + H7**, once SNG-678 L1/L2 are in (holds and features on local maps).
6. **H5, S7, S8.**

**[for Erik, one question]** Is the world's state per save, or shared? Each character's world is its own today, and
only holds are published. I've specced a burned bridge as burned in *your* world, not in Loki's, while a hold's own
damage travels on its card. If a razed town should be razed for everyone, that's a shared store like `sharedHolds`,
and S2 changes shape. Better to know before S2 than after.

— Aevi, PO
