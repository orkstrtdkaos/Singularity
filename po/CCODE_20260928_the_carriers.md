<!-- status: CCode → Aevi & Erik. C1 SHIPPED (CCODE-559, v2.15.0) — four trade companies, hire from the hold's card, their cut at arrival, their guards on the road. ⛔ THREE THINGS THE CARD PROMISED AND THE ROAD DID NOT, one of them ERIK'S OWN SPEED RULING implemented on the card only (every cart in the game has been walking on foot at the quoted price of animals). ⛔ AND ONE BALANCE INVERSION FOR ERIK: losing a road fight loses the WHOLE load while walking with nobody loses half, so an escort that loses is worse than no escort — true of the player's own carriers too -->
# CCode → Aevi & Erik, 2026-09-28. The carriers you can hire

**C1 is shipped** — CCODE-559, **v2.15.0**, 32 of 32 suites green, **4,137 checks** (§388 is 18 of them, proved red by
reverting each fix).

Your four companies are content and live on the hold's card. The choice is real and it **flips per destination inside a
single hold**, which is the best result I could have hoped for — there is no dominant answer to learn once.

## ⛑ What it measures at, on Silas's own holds

| from | to | your own cart | hiring | who wins |
|---|---|---|---|---|
| The Fell Pell | Intake Level | 130.5 a pass, **135.3 days** | **174.3**, 1.6 days (Porters) | **hire** |
| The Fell Pell | Plainstead | **112.3**, 65 days | 100.4, 32.5 days (Porters) | own |
| The Fell Pell | the Axis Gate | **108.4**, 1.8 days | 94.0, 0.8 days (Carters) | own |
| The Made Gate | Gearsflat | **75.9**, 75.4 days | 73.2, 37.7 days (Porters) | own |
| The Made Gate | Sunken Choir | 45.1, 33.9 days | **46.2**, 16.7 days (Carters) | **hire** |
| The Made Gate | the Axis Gate | **51.7**, 1.6 days | 47.5, 0.7 days (Carters) | own |

⚑ **What is actually buying the win is your `knowsGates`, not the guards.** The Porters turn a 135-day walk into 1.6
days because they use a gate Silas does not know. On a road that is already short or already safe, their cut is simply
money the player kept before — so the rule the player learns is *"pay them for distance you cannot cross yourself"*,
which is a good rule to have to learn.

⚠️ Two of your authored fields had **no reader at all** until this pass, and both now decide something:
`water: true` bounds the Keelmouth lighters to the four places that carry a water tag (keelmouth, echo_river_crossing,
firstsight, millbrook) — without it they offered to carry a load 125 days over dry ground — and `reaches` gates **both
ends**, so Stillwater's Trouble in the Palelands can hire three of the four and specifically not the cheapest.

⛑ **One presentation call.** Four companies across three markets is twelve rows on a card that had five, so the card
shows at most two per market — the best rate and the cheapest cut when that is somebody else, which are the two ends of
the real decision — says how many more would carry there, and always shows one you have already hired.

## ⛔ Three things the card promised that the road did not

Every one of these is the same shape: **two callers computing the same journey two different ways.** All three are now
one reader, and §388 gates the agreement by driving both sides and comparing.

**1 · A company that knows the gates was not allowed to use them.** The card priced the Porters at 1.6 days
(`gatesUsableBy(null)` — the public network). `sendCaravan` then resolved the route with `traveller: character`, so the
cart walked *Silas's* roads: **135.3 days**, and the news said so. Fixed by putting `knowsGates` on the route and
resolving the road for whoever walks it.

**2 · ⛔ ERIK — YOUR SPEED RULING HAS ONLY EVER MOVED THE ESTIMATE.** Lever C's table — *"on foot 1×, a stable 2×, a
lizard-den 2.5×, by water with both ends water-tagged 3×, a hired company 2×"* — lives in `carriageFor`, and
`carriageFor` had **exactly one caller**: the function that prices the comparison card. `sendCaravan` stamped the raw
road onto the cart, and the tick walked that and rolled hazard per day on it. So since SNG-654 shipped, **every cart in
the game has travelled on foot at the quoted price of animals.**

⚠️ **The reason nobody caught it is worth more than the fix:** the rule had no population. Measured — all **6 holds in
the world carry ×1 on foot**. Not one stable, lizard-den or water pair among them, so the card and the cart agreed on
every row by coincidence. A hired company is the table's **first live rung**, and the moment it existed 6 of 12 priced
rows quoted half the journey the cart would walk.

Carts now travel at the ruled speed. ⚑ That is a real change to the existing game and not only to hiring: journeys are
shorter, so fewer hazard rolls happen on them — *"a faster road is a safer one"*, your own note on lever C, is now true
of the road and not just of the quote. Nothing else needs authoring for it; the other rungs go live the day a hold gets
a stable.

**3 · Two player-facing lines describing mechanisms that were not what happened.** The departure note said *"and NOBODY
walking with it"* on a run six hired guards were walking (it read `crew`, which a hired run empties by construction —
and those guards had just beaten raiders off). And the arrival said *"sold for 940 Lattice Cities scrip, after 80 to the
carriers"* — the 940 in the market's money and the 80 in crystal, so a 22% share read as 8%.

## ⛔ ERIK — A BALANCE INVERSION, AND I HAVE NOT TOUCHED IT

This one is not about companies at all, and I want it in front of you rather than quietly tuned. Realised share of the
load lost in **one** road hazard, 1,500 runs a cell:

| road danger | nobody walking | 3 guards | 4 guards | 5 guards | 6 guards |
|---|---|---|---|---|---|
| 1–3 | 50.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| 4 | 50.0% | 46.6% | 0.0% | 0.0% | 0.0% |
| **5** | **50.0%** | **100.0%** | **100.0%** | **84.5%** | **21.3%** |
| 6 | 50.0% | 100.0% | 100.0% | 100.0% | 84.4% |

⛔ **Losing a road fight takes the WHOLE load. Walking with nobody takes half.** So an escort that loses is *strictly
worse than no escort*, and that is equally true of the player's own carriers — it is in `resolveRoadHazard`'s existing
logic and predates C1 entirely. The world authors dangers 0–5 and a road's danger is the worst step on it, so danger-5
roads are reachable today.

My first cut of the card had hired guards absorb a share of the expected loss. **I removed it**, because the measurement
shows that discount would lie in both directions — at danger 1–3 guards lose *nothing* where an unescorted cart loses
half, and at danger 5 three guards lose *everything*. The card now charges a hired run exactly what it charges your own
crew. That is not a claim that escorts do not matter; it is a refusal to invent the number for how much they do.

⚑ And §388 gates the **agreement** between what the card predicts and what the road rolls, not the absence of a
discount — so whichever way you rule, the ruling lands in your lane and not against a gate of mine.

Three shapes it could take, if it helps: the losing side keeps a share rather than losing all of it; a loss with an
escort is capped at the unescorted share, so bringing people can never be worse than bringing nobody; or a lost fight
takes everything only when the escort is *wiped*, which is already its own branch. I have not implemented any of them.

## ⛑ What is next

**B2** — §2c's lattice keepers: `gateHeld` as an act, the stigma, the escalation clock.
**C2** — the visiting traders. Your `SNG-652_trade_companies_and_traders.json` carries 10 powers' traders and they need
a place to stand: either a `trading_post` kind or `draws: ["traders"]` on `market`. Your call which, and it is the only
thing blocking C2.
**D** — P4 item 16, the ability census split.

⚠️ Still waiting on you: `po/staged_content/SNG-663_supply_line_hungers_exclusive.patch` (A2). §372 holds a check that
says the supply-line rule is OFF, and it gets re-pointed the day you flip it.
