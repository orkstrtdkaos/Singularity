<!-- status: OPEN for CCode. Erik ruled one world (S2, Part R). Content half shipped: feature site kinds, hold radii, frame decks, map-state words, effects, repair and reckoning. -->
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
- `seen` is `named`, `described` or `unseen`: whether the locals know who did it (Part R). The GM's `mapOps` must
  say. Damage by the world itself (a flood, a power's war) has no culprit.

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
- **Everything else is the world's, not the save's (Erik: one world, below).** It lives in a shared store,
  `world/places/valley.json`, built the way `fates.js` shares lives:
  - **One record per key**, with an append-only list of change events.
  - **Event ids are derived from `{ key, change, worldDay, by }`**, so two worlds that recorded the same change hold
    one event, not two (`personIdFor`'s rule).
  - **The state is a fold that every client computes the same way:**
    - events are sorted by world-day, then by severity on a tie (destroyed > ruined > damaged > repaired > the rest),
      then by id;
    - damage jumps on the ladder, and a repair climbs one rung;
    - the latest move and the latest rename stand;
    - the first `added` stands.
  - **Each save adopts the store before its pass and publishes what it changed after,** the same cycle as fates.
  - `character.mapState` is only a read-through cache of the folded store and the changes not yet published. It is
    never a second truth.
  - `placeState` *is* this store with the `place:` prefix. Don't build both.
- Each folded record is `{ state, since, by, seen, cause, beat, name?, was?, pos?, repair?, reckoning?, history[≤12] }`.
  - `was` holds what a move or rename replaced, for the trace and the "once called" line.
  - `seen` is how well the locals know who did it (Part R).
- **Holds stay on their records,** because a hold is its owner's. Its card publishes the hold's own `state` and the
  state of its *outward* features (the martial family: wall, gate, tower, keep and so on), because those are what a
  visitor would see.
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

**S7 · What the character knows.** The world is shared, but knowledge isn't. The map shows the state the character
**has learned**, not the state the world holds. A change carries `beat`, and the character learns of it by:

- being there;
- being told (a GM line naming it);
- a relay or hold report;
- **word of it**, meaning the news the change posts to `world/feed.json` for anything at `ruined` or worse, which
  reaches characters within a few days' travel of it. Until then their map shows the old state, and the card says `knowledge.lastKnown`. This is SNG-672
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

## Part R · Someone has to mend it: the locals, who come after you, or a player, who is rewarded

Erik ruled this after the first draft:

> *"One world. If you burn a bridge someone must repair or rebuild it. Either the locals — and they'll try to track
> you down — or a player (who may be rewarded)."*

Content holds the numbers and the words: `mapStates.repair` and `mapStates.reckoning`.

**R1 · Nothing mends itself.** A damaged, ruined or destroyed thing stays that way in every game until work brings it
back. There is no timer that restores it.

**R2 · The locals mend what they can, at a pace.**

- They start `repair.localsBeginAfterDays` after the change, and take `repair.localDays[state]` to bring it to whole.
  The work is recorded on the shared record's `repair` block (`{ progress 0–1, byLocals, byPlayers{} }`), so every
  game sees the same scaffolding.
- **What the locals will not mend** waits for a player (`repair.localsWillNot`):
  - a razed place, because there's nobody left to rebuild it;
  - a broken waygate, which needs a maker;
  - a river run dry;
  - holds and their features, which are their keepers' to mend.
- While they work, the local map shows the thing under repair, and the card reads `reckoning.words.mending`.

**R3 · And they go after whoever did it.** This happens when the mending costs the locals anything (their own work or
a reward they pay) and the change was `named` or `described`:

- **A debt of kind `damages`** goes on the culprit's save through `recordDebt`.
  - **Holder:** a named local. Use the place's own people (`npcsPresent`) when there are any. Otherwise mint one with
    an id derived from the event, so every game meets the same person.
  - **Amount:** **what the locals actually spent**, which is their own share of the work plus any reward they paid
    players, valued as `repairCost` × the thing's build value by the existing `priceOf` path. It is recomputed as
    the work goes on.
  - **Escalation:** the debt ladder is the same as today (colder reception, then refusal). But **this holder always
    acts**: damages are not a matter of temperament, so don't gate it on `reactsToReputation`.
- **Someone is sent.**
  - After `reckoning.searchBeginsAfterDays[seen]`, the holder or someone they hire sets out towards the culprit's
    whereabouts. Use `world/travelers.json` for a player who is about, or their nearest hold if they have one.
  - They find the culprit within `reckoning.findWithinDays[seen]` plus the travel time.
  - `described` is slower than `named` and searches the right region. It doesn't need to be clever.
  - The culprit's news reads `asking`, then `sent`.
- **When they arrive** it is a scene: `found`. The outcomes are `reckoning.outcomes`:
  - **pay:** settles the debt;
  - **work it off:** the culprit's labour on the repair counts as player work (R4), and the debt falls by its value;
  - **refuse:** escalation goes to the top at once;
  - **fight:** an ordinary fight, and the community's standing falls with it;
  - **flee:** the search starts again from where the culprit went.
- **`unseen` damage is never traced.** The locals mend it and remember (`remembered`). If the GM later reveals the
  culprit, R3 starts from there.
- **Hitting another player's hold** puts the debt with that hold's steward (a named person). If the hold has no
  steward, the debt is to the owner, and what they do about it is theirs.

**R4 · Or a player does the work, and is rewarded.**

- Every game shows the job at the place, drawn from the shared record: `wanted` ("Wanted at {place}: hands to
  {mend} the {thing}"). It appears on the SNG-677 card, **and on the character's job list (R6)**.
- A player can:
  - **pay** for materials and hands: the repair value in goods from their store or in currency;
  - **or do the work** in passes, the way clearing a hold's room works (`holdStore.slots.clearing`).

  Their share goes into `repair.byPlayers[characterId]`.
- **When the thing is whole,** everyone who worked is paid `playerReward.share` × the repair value × their share:
  - in the Reach's scrip or crystal, **never coin**;
  - with origin `reward`, so it moves value rather than minting it (purse.js `TRANSFER_ORIGINS`);
  - plus `standingSteps[state]` with the community.

  The news reads `thanked`, and for everyone who knew it was broken, `mended`.
- **The culprit can be the one who mends it.** Their work counts against their debt rather than being paid.
- **A player can take on what the locals won't** (`localsWillNot`): remaking a broken gate at the cost of making one,
  or resettling a razed place, which goes through SNG-672 M1 as a founding at the trace's position with the old name
  offered back.
- **If the locals finish first,** players are paid for the share they did. The debt (R3) is whatever the locals
  spent, including those payments.
- **A player may decline the reward** and give the work. That share then costs the locals nothing, so it is not in
  the culprit's debt, and the standing is still earned.

**R5 · Holds are their owners'.** Damage to a hold or a feature is mended by its keeper through `holdingOps`
(`repair`), at `repairCost` from the hold's store. No locals and no job board are involved. Another player can't mend
your hold uninvited. Gifting work to a hold is a later question.

**R6 · Mending is a job on the job list.** Erik:

> *"You could have local jobs like that show up on the job list — they're like quests you can delegate or assign
> people to, or just do yourself."*

So R4's work goes through the job system that exists: `jobstate.js` holds the board, `jobs.js` the plan and the roll.
It needs no new machinery for who goes. You can send yourself (`"player"`), people, a delegate or a band, the same way
you send anyone on a job.

- **Posting.**
  - Each damaged, ruined or destroyed thing the character **knows of** (S7) that is within `jobs.withinDays` of where
    they are, or of one of their holds, is posted to their board with `postJob`.
  - At most `jobs.onBoardMax` mending jobs are on a board at once, nearest first. The board's cap is 12, and mending
    must not crowd out the GM's jobs. The place card lists all of them.
  - **The id is derived from the shared key and the rung,** for example `mend:road:a|b:ruined`. Re-posting it
    replaces it, and a rung that has been mended takes its job off every board on the next adopt.
- **One job is one rung:** destroyed → ruined → damaged → whole. A razed bridge is three jobs, and the scaffolding
  shows between them.
- **The job.**

  | field | value |
  |---|---|
  | `label` | `jobs.labels.mend` with `{Mend}` = `reckoning.words.mend[state]`, capitalised |
  | `where` | the place |
  | `from` | `jobs.from` |
  | `needs` | `jobs.needs[class]`, else `default` |
  | `effort` | `jobs.effortDays[state]` |
  | `level` | from the thing's build value, like any priced job |

  The stakes are `crystal`, the R4 reward for that rung inside `normalizeJob`'s level clamp; `standing`,
  `repair.playerReward.standingSteps[state]` clamped to the job's ±2; and a new **`mend`**.
- **`stakes.mend = { key, from, to, goods }`, built like CCODE-452's `raise`:**
  - a success climbs the rung through `applyMapChange`, as `repaired` with `by` set to the character;
  - anything short of a critical failure gives the goods back;
  - a critical failure spends them.

  The team's share goes into the shared `repair.byPlayers[characterId]` on landing, and that is what R3's debt and
  R4's reward read.
- **Three variants of the same job:**
  - **The gift.** The player can mark it as a gift before sending. The stakes then carry no crystal, the card reads
    `jobs.giftLine`, the standing is still earned, and the share is gifted (R4).
  - **The culprit's own job:** `jobs.labels.makeGood`. It carries no crystal; a success reduces the `damages` debt by
    the rung's value; and it is always on the culprit's board, past `onBoardMax`, while the debt stands.
  - **What the locals won't do:** `remake` for a broken gate, at the cost of making one, and `resettle` for a razed
    place. A successful resettle founds the place through SNG-672 M1 at the trace's position, with the old name
    offered back.
- **Two players on the same rung** both work it. Whoever lands the success completes the rung, and both are paid by
  share (R4). A job whose rung was finished elsewhere while the team was out comes home with "someone got there
  first". The team keeps its time spent and is paid for the share it did.
- **The GM** sees mending jobs in `jobsForGM` like any other, and can offer one from a scene. "The miller asks if
  you'd help with the wheel" is the same job, posted by the GM.

## Content shipped with this order (mine, on origin with this commit)

- **`economy.json` → `holdFeatures.kinds[*].siteKind`:** all 44 feature kinds name their site glyph from the closed
  vocabulary. For example, mine → `underplace`, fishery → `dock`, grave ground → `burial` and reclamation bowl →
  `circle`.
- **`holdStore.slots.ladder[*].siteRadiusMetres`:** post 40 · steading 90 · hamlet 150 · village 250 · town 450 ·
  keep 300 · fortress 400 · stronghold 700.
- **`holdStore.slots.frames.kinds[*].deck`:** hull is a 30 m `line`; legs is a 2-level `stack`; lift is a 60 m
  `ring`; grown is a `scatter`; borne is a `line` along the bearer's back.
- **`location_kinds.json` → `mapStates`:** the ladder, the changes, the player-facing words for every class in S0,
  `knowledge` words, `effects` and `repairCost`. Also `repair`, which holds the locals' pace, what they won't mend and
  the player reward, and `reckoning`, which holds the debt kind, the search pacing, the outcomes and the lines a player
  reads. `jobs` holds, for mending jobs, the needs by class, the effort by rung, the board cap and reach, and the
  labels. The words are world language only (SYSTEM_SPEC §29.7). Build notes sit under `_`.
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
- **G10 · One world.**
  - Two saves record changes to the same bridge in either order and fold to the same state.
  - The same change recorded by both is one event.
  - A bridge burned in save A is burned in save B after B adopts the store.
- **G11 · Nothing mends itself.**
  - With nobody working, a ruined road is still ruined after 365 world-days.
  - With the locals working, it is whole after `localDays.ruined`.
  - A destroyed waygate is never mended by the locals.
- **G12 · The reckoning.**
  - A `named` burning mended by the locals leaves a `damages` debt on the culprit, held by a named local, and someone
    sent who reaches them within the configured days plus travel.
  - An `unseen` one leaves no debt.
  - Working off the debt reduces it by the work's value.
- **G13 · The reward.**
  - A player who does half the work is paid half the repair value, in scrip or crystal with origin `reward`, and
    gains standing.
  - No path pays coin.
  - The culprit's own work pays nothing and reduces their debt instead.
  - A burning mended entirely by gifted work leaves no debt and sends nobody.
- **G14 · Mending is a job.**
  - A ruined road two days from the character is on their board, with RESTORE in its needs.
  - Sending a team of the player, a delegate or a band works the same way.
  - A success makes it damaged on the shared record, and the next rung's job replaces it.
  - A gifted success pays no crystal and still gives standing.
  - The culprit's own job pays nothing, reduces the debt, and stays on the board past the cap.
  - A rung finished by another player takes the job off this board on the next adopt.
- **G9 · Player-facing words.** Every string in `mapStates.words` and `knowledge` passes the §29.7 check (no ticket
  id, no file name, no build words).

## Order

1. **H2** (whereabouts on the globe), because raids are reading the wrong point today.
2. **S1 + S2** (the door and the shared store with its fold, with `placeState` folded in), with gates **G2** and
   **G10**.
3. **H1 + H3 + H4** (holds on the world and region maps).
4. **S5 + S6 + S3 + S4** (state drawn and played; the channels).
5. **H6 + H7**, once SNG-678 L1/L2 are in (holds and features on local maps).
6. **Part R** (the locals' repair, the reckoning, the reward, and mending on the job list), once S1–S6 are in.
7. **H5, S7, S8.**

**Ruled (Erik):** one world. The first draft of this order asked whether state was per save; S2 and Part R are his
answer.

**My reading, which Erik can overrule:** the reckoning follows the locals' cost. The reward a player is paid comes
out of the locals' pocket, so it adds to what they come to collect. That gives the player a choice. A player can
**do the work as a gift** and decline the reward (`repair.byPlayers[id].gift`). Then the locals have spent nothing
on that share. If gifts covered all of it, nobody is sent, and the culprit is only remembered. A gift still earns
the standing.

— Aevi, PO
