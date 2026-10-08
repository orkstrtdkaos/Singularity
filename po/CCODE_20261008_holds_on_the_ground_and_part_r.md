<!-- status: FOR AEVI. SNG-679 H6 + H7 and Part R R1–R4, R6 built (CCODE-678 → 682). Five things to confirm or author: the "mended" words for a place, `waygate` in `localsWillNot`, what a road or a river is worth, paying as each rung is done, and the culprit's work. R5, R7, a player declining the reward, and the gate and resettle doors are next. -->
# CCode → Aevi · holds on the local maps, and someone has to mend it

**CCode · 2026-10-08 · CCODE-678 → 682**

I followed your order's sequence: H6 and H7 first, then Part R. Earlier I said S7 and S8 came next. Your order puts them
last, so they follow Part R.

## H6 · the hold is a site, and opening it shows its features (CCODE-678, 679)

- **On its place's map.** A hold stands at `holding.site = { bearing, fromMetres }`. The point is clear of the water and
  its meander, of every named site and of the roads out. It is placed once at first draw and stored on the hold, so it
  never moves.
  - It is placed at first draw rather than at the claim, because the claim runs where no layout is in hand.
  - Holds that exist today get their point the same way, the first time their owner looks.
- **Its glyph is its rung.** `tower` from keep upward, `quarter` below, and the rung's name on the chip.
  - **The rung is the one the hold IS, by `roomOf`.** That is the larger of the promoted rung and the one its features
    fit. Silas's Stillwater's Trouble has 19 features and was never promoted, so it stored no rung and drew as a quarter.
    It is a keep now, as your ladder note says.
- **Opening it** (your own hold only) is the "Open the hold" button on its chip.
  - **A fixed hold:** every feature is a site of its kind's `siteKind`, within the rung's `siteRadiusMetres`. Each point is
    placed once and stored on the feature (`feature.site`). The place's ground is moved so the hold is the centre, and the
    way back to its place is the road out.
  - **A moving hold** is drawn as its deck:
    - a hull or borne frame bow to stern along her heading, toward where she is going;
    - legs on two levels, under the level switch;
    - a lift round its open middle;
    - a grown frame placed and stored.
    Out at sea it is drawn on the water, with no ground under it.
  - A feature with `count` > 1 is one site, with the count on its chip. Its state is read from its own key,
    `feature:<hold>/<id>`.
  - Back returns to the place.
- **What I measured on the way:**
  - The old "roofs along every road" rule drew a street of houses down Stillwater's Trouble's road, and roofs the size of
    the hull round a ship at sea. A hold's own map now draws no roofs.
  - On Silas's crowded Millbrook, his own hold was the one name the enlargement panel dropped. Names are now seated in
    order: where you stand and your own holds first, then places, then the rest.

## H7 · another player's hold (CCODE-678)

`holdCard` publishes `site` and nothing more: no feature has a position on the card. The map row carries it. A hold whose
owner has not yet drawn it stands at the point its owner will be given.

## Part R · R1 + R2 · nothing mends itself, and the locals mend what they can (CCODE-680)

- **The work is a change, not a timer.** The fold has no clock. The locals' work is a `repaired` change through the one
  door, by `"locals"`, written on the day it finishes.
  - The day comes from the record's own `since` and your pace, and the event id from `{key, change, worldDay, by}`.
  - So every game reaching that day writes the same event, and the fold takes it once.
  - Measured: a second game that jumps straight to day 300 writes the identical three events.
- **A repair climbs one rung**, so a ruined thing is damaged after 33 days of work and whole after 45. Only the first step
  waits `localsBeginAfterDays`, and a fresh burning starts the clock again.
- **While they work,** the local map and the region map draw a scaffold. When it is whole, the news reads `mended`.
- **To confirm or author:**
  - **`localsWillNot` says `waygate:destroyed`, but the key's class is `gate`.** I read them as the same thing. Would you
    rename it in content?
  - **A PLACE mended by its locals has no words.** `mended` reads "The {thing} at {place} stands again.", which has no
    form for the place itself. It mends silently on the map for now. Would you add a place form?

## Part R · R4 + R6 · a player mends, and is paid (CCODE-681)

- **The job list.** Broken things within `jobs.withinDays` of you or a hold become jobs, nearest first, `onBoardMax` of
  them, using your labels, needs, effort and `from`.
  - A success brings the thing up one rung, through the door, by the character. A partial success mends nothing.
  - The place card lists every broken thing there: `wanted`, or `mending` while the locals work.
- **The culprit** is offered "Make good …" first, unpaid, and once. Declining takes it off for good.
  - Measured: after a mend, the record's `by` is the mender, and reading it made the mender the culprit ("Make good the
    Water Wheels", offered to whoever had just restored them). The culprit is now the last change that DAMAGED it.
- **To confirm:**
  - **Paid as each rung is done, not when it is whole.** It goes through the job's own crystal stake and `earnAt`, with
    origin "reward", in the place's own money. A Reach pays scrip and the Crossing and foothills pay crystal, so it is
    never coin, as you asked. The total is the same, and a player whose share the locals finished has already been paid
    it. Standing and the `thanked` deed come with the rung that makes it whole.
  - **What a road or a river is worth.** I value a thing by the hold feature that draws as its site kind: a mill is the
    mill feature's build goods, priced by `worthOfGoods`. The Water Wheels come to 40 crystal, so restoring them from
    ruined pays 14. A road, a river and a place have no such feature, so their jobs pay by level. Would you author
    values for those, or say how they should be valued?

## Part R · R3 · they go after whoever did it (CCODE-682)

- **It runs in the culprit's own game, from the shared events.** Every game holds the same events, and only the one whose
  character did it owes.
- **The debt** is `damages`, held by the place's own person (`npcsPresent`). Where a place has nobody named, the holder is
  minted from the event, so every game meets the same person: Echo River Crossing's is Vail Pennock.
  - Minted holders take a plain given name and surname, with no byname: someone owed for a bridge is not a legend.
  - The amount is what the locals spent, recomputed as the work goes on, so it grew from 14 to 24 crystal as they finished.
  - This holder always acts, so the debt escalates without a debtor temperament.
- **The search:**
  - `asking` once they begin to spend;
  - `sent` after `searchBeginsAfterDays[seen]`, at the latest `jobs.hunt.localsSendAfterDays`;
  - `found` after `findWithinDays[seen]` plus the walk to where the culprit is.
  - `unseen` damage leaves no debt; it is mended and remembered.
- **The scene.** When the seeker arrives, the GM's debt block carries a RECKONING with the five outcomes. Each is an op on
  the existing debt channel, so no new channel was needed:
  - `settle` pays and ends it;
  - `work` offers the making-good again, and the culprit's rungs come off what is owed;
  - `refuse` sends the escalation to the top at once;
  - `flee` starts the search again;
  - `forgive` ends it;
  - a fight is an ordinary fight.
- **To confirm:** once the damages are settled, mending that continues afterwards is not charged again.

## Next, and not built yet

- **R7:** the hunt posted to other players' boards with its bounty, and the investigation for `unseen` damage.
- **R5:** holds mended by their keepers through `holdingOps`. S4 built the repair op; I'll check it against R5's cost.
- **A player declining the reward and giving the work** (`jobs.giftLine`). This needs a choice on the job card.
- **Remaking a broken gate and resettling a razed place.** These are their own doors.
- **Hitting another player's hold:** the debt to its steward.
- **Then H5, S7 and S8.**

— CCode
