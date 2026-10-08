<!-- status: FOR AEVI. SNG-679 is built through its last item: R5, R7, H5, S7 and S8 (CCODE-683 → 687). Six things to confirm or author: the Unlanded's "never halts" as a field, the Long Span's distances, word of it from the shared events rather than the feed, what the locals' mending teaches, ground derived in play has no river, and the region map for a moved place. -->
# CCode → Aevi · SNG-679 is built: R5, R7, H5, S7, S8

**CCode · 2026-10-08 · CCODE-683 → 687**

This follows `po/CCODE_20261008_holds_on_the_ground_and_part_r.md` (H6, H7, R1–R4, R6). Your order is now built through
its last item.

## R5 · a hold is its keeper's to mend (CCODE-683)

- `holdingOps` repair costs one rung's share of what it took to build: the feature's build goods × its count × the rung's
  slice of `repairCost`, taken from the hold's own store.
- When the store is short it is refused in words: "Stillwater's store cannot mend it yet — it needs 3 more cut stone".
- The goods are taken only when the mending succeeds. No locals and no job board are involved.

## R7 · the hunt, and the investigation (CCODE-683)

- **Posting.** A thing someone else broke near the character is a hunt: "Find whoever wrecked the Water Wheels at
  Millbrook", with a bounty of `bountyShare` × the repair value.
  - Unseen damage posts "Learn who wrecked …" instead.
  - A hunt is never posted to the culprit, nor for something that fell on its own.
- **How a success reaches the culprit.** It is one shared change: `revealed` by the hunter, with cause `hunted` or
  `investigated`. Every game folds it, so it reaches the culprit's game without a channel of its own.
  - In the culprit's game, a hunt means they are found. The bounty joins what they owe, so 14 spent plus a 6 bounty is 20.
  - An investigation turns an unseen breaking into a named one, so the reckoning starts and the investigation becomes a hunt.

## H5 · moving places move (CCODE-684)

- **The walk.** `circuitPosition` walks each circuit at its `daysPerCircuit`, with legs in proportion to their length and
  the point between waypoints on H2's great circle.
  - The Long Span and the Wend stop 20% of each leg at the waypoint. The Unlanded never stops.
  - It is the same point on the same day in every game.
- **`positionedPlace` answers the live point when it is told the day.** A caller with no day still gets the authored point,
  so nothing reads the wall clock.
  - The readers are the globe's pin, the GM's sense of where, a hold there, and the season and light where the character
    stands.
  - The card says where it is today: "Today it is at The Unlanded, and moves on toward Longshore."
  - Arriving where it is not opens on its trace ("where the Long Span stood"), not on the place.
- **To confirm or author:**
  - **The Unlanded's "never stops" is a name in the engine** (`NEVER_HALTS`), with its own words beside it, because
    `carriage` has no field for it. Would you add `carriage.halts: false`? I read that field already.
  - **The Long Span's distances.** Its waypoints span 3.8 radians of the world, about 360 walking days, where its content
    says 414 miles. Its pace therefore comes out near three times a walk. Should the content or the waypoints change?

## S7 · what the character knows (CCODE-685)

- **The maps draw the state the character has learned. The world keeps the truth.** A ruined road still costs the journey
  that walks it, and the character finds out by walking it.
- **What counts as known:**
  - what the character's own game wrote: their deeds, the GM's lines in their scenes ("being told"), their jobs;
  - what they learn by being there;
  - a hold's report;
  - word of it: ruined or worse, within 3 days' travel, once the walk from there has had time.
- The card says "as you last knew it" when the world holds more than the character knows.
- Measured: a ruin in another game 0.6 days away reads "whole (as you last knew it)" on day 100 and "ruined" on day 101.
  158 days away, word never arrives.
- **To confirm:**
  - **Word of it is derived from the shared events, not posted to `world/feed.json`.** The feed is the players' scrapbook,
    and its own guard says "never an auto-log". If you want the ruin in the feed too, that is a post, not the learning.
  - **The locals' mending teaches nobody by word.** Every game's tick writes it, so it counts as the world's and is learned
    only by going or by a hold's report. A near character still sees the Wheels ruined after the locals finish. Is that
    the reading you want?

## S8 · adding, moving, a road opened (CCODE-686, 687)

- **Adding.** A site (`{ bearing, fromMetres }` or `{ toward, near|far }`), ground (cleared, planted or drained) or a cut
  channel joins the place's layout as an overlay. The overlay is built from the events the character knows of, so content
  is never edited.
  - A turned river takes its new course.
  - An addition that does not say where is refused in words.
  - The GM may add to a place in the scene's view, never to one outside it.
  - Seen on Millbrook: The Ford Shrine, The New Store "near" the road to Echo River Crossing, a cleared field, and The Mill
    Leat, a 12 m cut channel.
- **A place moved.** It writes `pos` and is capped at half a day; Millbrook moved 0.26 days. Further is refused: "that is
  8.3 days from where it stands — further than half a day is a new place founded". A moving place cannot be moved by hand.
  - The character's live locations put it where it now stands and remember where it stood.
  - The globe draws its trace at the old point.
  - Its layout keeps its sites and takes the ground of its new point.
- **A road opened** is a live connection both ways, and a road to nowhere is refused. Journeys, the network and the router
  read the live locations, and the router runs again when the roads change.
- **To confirm or author:**
  - **A moved place loses its authored river.** Ground derived in play has no hydrology reader, so moved Millbrook keeps its
    fields and wood but not the Echo. Should a short move keep the authored water, shifted with the place?
  - **The region map still draws a moved place at its old point.** It reads content positions through its own path. That
    is next if you want it.

## What is left from the order

- A player declining the reward and giving the work (`jobs.giftLine`).
- Remaking a broken gate, and resettling a razed place.
- The debt for hitting another player's hold, owed to its steward.
- The region map for a moved place.
- The `mended` words for a place itself.

The full suite is green on every commit.

— CCode
