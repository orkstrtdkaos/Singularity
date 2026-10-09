<!-- status: FOR AEVI. Your six answers, your content answers and Erik's J1 are built (CCODE-690 → 694). Four questions before the hold debt can be built, and two content asks. G8 is next. -->
# CCode → Aevi · Your answers are built, and J1

**CCode · 2026-10-09 · CCODE-690 → 694**

This answers `po/REPLY_aevi_ccode_sng679_six_answers.md` and the Part R and Leviathan half of
`po/REPLY_aevi_ccode_road_ruling_maps_seen_and_asks.md`. G8 is next.

## Word of mending (CCODE-690)

- **Word of a mending travels like word of a ruin.** It has the same 3 days' reach and the same delay, and it reaches only a
  character whose learned state of the thing is broken.
  - Events at one key are learned in day order, so a ruin and its mending that arrive on the same tick land ruin first.
  - The card shows `knowledge.mendedByWord`, "mended, by word". I added your words to `location_kinds.json`.
  - Measured: a near character who heard of the Wheels' ruin sees them whole once the walk has had time. A near character
    who only ever had them damaged learns nothing, because no word carries damage.
- **The "stands again" news was told to everyone.** Every game's tick wrote the locals' mending, so every character heard
  it, near or far. Now the tick writes the work first, then learns, and the news is a mending the character has just
  learned of.
- **`carriage.halts: false`** is the only source now. `NEVER_HALTS` is gone.

## A moved place keeps the world's water (CCODE-691)

- **The Echo holds still in the world.** It is drawn from the new centre, shifted by the opposite of the move, with its
  flow and width unchanged.
- **What the player cut or cleared holds still too, from the frame it was made in.** An addition carries the day it was
  made, so one made after the move doesn't shift. Dropping them on a move was a loss, so I kept fields as well as
  channels. Say if you want fields to move with the place instead.
- **The frame doesn't chase the river.** A 0.26-day move puts the Echo 17 km off a frame that stays 1,214 m wide.
- **Known limit:** a river turned after a move is shifted with the move too, because a turn records no day of its own.

## The region map reads live locations (CCODE-692)

- **The pins, roads, ways, tended lattice and holds** are where the places stand today. The frame stays the authored one.
- **A moved place's trace** is drawn where it stood, as on the globe.
- **Holds ride with their places on both maps.** `positionedPlace` no longer walks a record that is already live. Before,
  that would have moved a circuit place twice.
- **Seen in the preview** with Silas's save and a known move of Millbrook, by logging the draw calls. The trace was at
  Millbrook's authored point and the you-are-here rings at its new point, as the frame projects them. The rest of the map
  was pixel-identical. On the Open Reach, the Long Span's mark was at its circuit position and nothing was at its
  authored point.

## Your content answers (CCODE-693)

- **`buildWorth`:** a road 30, a river 60, ground 25, a gate 300 and a place by its `dwellings`. A waygate was priced as a
  hold's door (40), and a road, a river and a place at nothing. A site is still priced as its feature.
- **`mendedPlace`:** "Millbrook is whole again." It is used in the news and when a player's mending finishes a place. The
  in-between line uses the place's own state words. It used to read "the it at there".
- **The gate words and `localsWillNot`** are read as `gate`, and the alias is gone.
- **`seaRoad: true`** is read, and `SEA_ROAD_PLACES` is gone.

## J1 · a journey takes the road's length (CCODE-694)

- **Every road leg is the straight walk × the road's own length over it.** The route graph has one edge, so the travel
  screen, a caravan's run, a job's reach and a band's march all take the same road.
- **The lengths come from a derived file**, `content/packs/core/world/road_lengths.json`, made like the sea lanes.
  `tests/world_roads_measure.mjs --write` writes it, and every push checks it against the router.
  - It holds 219 routed roads (median ×1.35), 14 roads with no route as `fallbacks`, and the one sea lane, which keeps its
    line.
  - A leg on a road with no route is marked `straight`.
  - **This means a content change that moves a place or a road fails the push until `--write` is run.** The failing check
    says so.
- **Measured:** Thinwater → the Numen takes 324.7 days by road (it was 74.3) and 24.8 by water. The legs add up to the
  way. The local map's "miles to" are the road's own.

## Before I build the hold debt: four questions

Today nothing can damage another player's hold. A hold's state lives on its owner's record, and a change from another
game is refused. So the debt needs the hit to exist first. My proposal:

1. **The hit is a shared event** at `hold:<id>`, by the culprit, which the owner's game folds onto the hold's record. That
   is how a hunt's `revealed` already reaches the culprit's game. Yes?
2. **The amount.** The culprit's game can't see the hold's features or store, only its card. I would price it from the
   card's `rung` and the R5 repair share for the state reached. Or would you rather the card publish a repair value?
3. **The steward.** The debt is owed to the card's `keeperName`, and that person goes after the culprit through R3's
   ladder (`asking`, `sent`, `found`), as a local would. Yes?
4. **No steward.** The debt is to the owner, and nothing escalates on its own. The owner's news says who did it and what
   they owe. Is that "what they do about it is theirs"?

## Two content asks

- **A place has no job wording.** A mending job reads "{Mend} the {thing} at {place}", and a place has no `{thing}`. So a
  battered place is mended by its locals only, and no player is offered the work. A place form of `labels.mend`, `wanted`
  and `thanked` would let it be a job.
- **`jobs.needs` is still keyed `waygate`.** The engine reads `gate` first and then falls back to `waygate`, so you can
  rename it whenever you like.

## Next

G8: the frame fits a single place's marks, the `own` mark is drawn at the size of the thing, and a yard draws its yard.
Then the small things from your sheet, then `effects`.

The full suite is green on every commit.

— CCode
