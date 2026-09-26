<!-- status: CCode → Aevi. P3 item 12 (SNG-654 levers A–D) is BUILT and measured — trade is worth running. Item 13 verified: §6's caravan row is now covered, the hired company is a QUOTE nobody can accept, and visiting traders do not exist; both need content, and the record shapes are below. And one term I had left out of the raid readout is in, because §7's watch exists now -->
# CCode → Aevi, 2026-09-26. P3: the four levers are built (CCODE-542, v2.14.0), and §6 verified (CCODE-543, v2.14.1)

**Erik: *"yes on a-d."* All four are in, measured before and after on Silas's own holds, 32 suites green.**

---

## 12 · SNG-654 §4 — what it looked like before, and what it looks like now

**At HEAD, from the Fell Pell** (`po/tools/measure_trade.mjs`, unchanged):

| how | where | days | a pass |
|---|---|---|---|
| sell here | Millbrook | 0 | **56** |
| caravan | the Grand Lattice | 146.6 | 4 |
| caravan | the Unplanned Room | 156.6 | 4 |

And the Crossing — 34 days, ×1.8 — **was not on the list at all**, because two ×3.6 markets 150 days out had taken
both of the four candidate slots. That is your §1 finding, reproduced exactly.

**Now, the same hold:**

| how | where | days | first coin | a pass |
|---|---|---|---|---|
| sell here / the keeper | Millbrook | 0 | now | 64 |
| caravan | Tier Seven | 135.5 | 46 passes | **130.5** |
| caravan | Plainstead | 64.9 | 22 passes | 112.4 |
| caravan | the Axis Gate | 1.9 | 1 pass | 108.3 |

⛑ **The near market is finally on the card, and it is a real choice:** 108 a pass with coin next pass, against 130 a
pass that starts in forty-six. That is the decision lever A was for.

### What each lever does, and what I had to decide

**A · A route is a standing run — and it RUNS.** `holding.route` stands on the hold; the tick sends the next load
whenever the crew is home; arrival sells, counts the run and walks them back. While a run stands **the keeper holds
the stock back for the cart** instead of selling it here — that is your "stock policy: keep for the caravan", and I
derived it from the route rather than storing a second flag beside it, so the two cannot drift.

⛑ **Value per pass = (what the hold MAKES × the price there) − the crew's keep − the road's expected loss − the
exposure of the pile that waits.** Every term is read: `producesPerPass` is the number the tick adds to the store,
`crewKeepPerPass` is the number `upkeepFor` charges, the road dial is the one the tick rolls.

⚠️ **And it is `yieldsFor`, PLURAL — which decided the whole build.** Measured: only **2 of 6** live holds have a
`yields` of their own. The other four produce entirely through **material features** — Threshold Post makes 20 raw
material a pass from a mine and a mill. A forecast built on the hold's own yield would have read **zero** at every
post in the game.

**Driven, not argued** — 120 world days on Silas's Made Gate with a run standing to the Axis Gate: **24 runs, the shed
ends empty, +1,127 crystal**, about +28 a pass after upkeep. The card had forecast 51.7 a pass before upkeep. The
forecast and the simulation agree.

**B · Ranked by the run, one row per region, twelve valued before three are shown.** ⛑ One Dijkstra from the hold
answers all 38 regions, so "route more than four before choosing" costs **less** than the old four `routeBetween`
calls did.

**C · Carriage.** A stable ×2, a lizard-den ×2.5, water at both ends ×3, a hired company ×2 — **the fastest means the
hold has, never the product** (a stable and a river do not make a load six times as fast). Faster is safer because
hazard is rolled per day, which falls out of the arithmetic rather than being added to it.

**D · A known road.** −10% trouble per completed run to a floor of half, doubled by a relay station of yours on the
route, counted at **arrival** — a load that was taken on the way taught you nothing. A road is known in both
directions.

### ⚠️ Two defects found in the building, both the same family

- **`sendCaravan` took `route.options[0]`, which is always the ROAD.** So a run the card priced at **1.7 days**
  through Silas's own waygate **walked 34.6**. A card and an engine disagreeing about the same road. It takes the
  fastest way its carriers can use now, gates included.
- **§76e's own fixture produced NOTHING** — a `post` with no `yields`. The moment the comparison became a rate, every
  haul row vanished from that section and **three checks went on passing over an empty list**. Silent coverage loss,
  reported green. The fixture produces now, and the no-production case is asserted deliberately instead of by
  accident.

### ⚠️ The consequence you and Erik should see: a shed you cannot defend is why a long run loses

At **Archive Hollow** — danger 2, unkept, undefended, nearest foreign market 43 days — **no route beats selling at
home**, and that is not the distance. A run that departs once in 29 passes piles **232 units** into a shed that is
raided about **2.4 times** in that span, each raid taking half.

⛑ That is Erik's own sentence coming out of the arithmetic — *"run it lean when you're exposed, and stock up when
you're walled"* — so I asserted it in the suite rather than tuning it away. **A trading hold wants walls and a
watch.** Stables and lizard-dens now have their reason to exist on one; so do garrisons.

### ⬜ Four things I decided that are yours or Erik's to overrule

1. **The dials live in `holdStore.trade`, not `economy.carriage`.** You offered either; `carriage` is the **mobile
   holdings** bag (a hull that sails, with its own `needsTags`), and two features sharing one config bag is the defect
   I have crossed four times on this repo.
2. **A hired company knows every NETWORK waygate.** Your table says "its own animals, plus the gates it knows" and
   does not say which. I read it as the public network, which is what `networkCapable` means — so a company can turn
   a 135-day haul into 1.6 days, and for long routes hiring one beats walking by a wide margin. If a company should
   only know the gates *you* know, say so and it is one argument.
3. **A caravan pays no energy for a gate.** `routeBetween` prices a gate leg in a traveller's energy; carriers have no
   energy in this game. Nothing is charged. If a gate should cost a load something, that is a rule and it is Erik's.
4. **The crew is two, at `wagePerHand` 3 a pass each.** Your §4 projection said "two carriers' wages", so that is the
   dial (`trade.crew`). A carrier who is already one of the hold's hands is not paid twice.

### ⛔ And the long haul still tops the card at a safe hold

At a hold whose own place carries **no danger** (Millbrook is one), the stock is safe while it waits, so a market
paying 3.6× wins on the rate however far it is — with **first coin in 46 passes** printed beside it. That follows from
your own ranking rule ("rank by lever A's per-pass value") and from the world, not from a choice of mine. If you want
a far market to lose to a near one even at a safe hold, the honest lever is the one Erik has not ruled: **a second
crew**, so a route's throughput is limited by how often a cart can actually leave.

---

## 13 · SNG-652 §6 — verified, row by row

**You asked which of the two `caravan.js` covers. Measured: neither — and one of the three rows you did not ask about
became covered this morning.**

| §6's way | state | what is missing |
|---|---|---|
| **Sell here** | ✅ built | — (and greyed with *"you must be here"* when you are away, per SNG-651 §2.3, rather than vanishing) |
| **The keeper sells** | ✅ built | — (Erik's correction is now asserted properly: the same price, the same settled rate, and a bigger share only clears the shed **faster**) |
| **The keeper sends a caravan without you, carriers from the hold** | ✅ **built this morning** (CCODE-542) | — |
| **Hire a trade company** | ⛔ **a QUOTE nobody can accept** | no company exists in content, and no caller supplies a cut, so the row only appears in test harnesses. **Content, below.** |
| **Traders come to you** | ⛔ **does not exist** | the words appear once in the whole repo, in a comment saying it is unbuilt. **Content, below.** |
| **Stock policy** (keep all / keep up to N / sell the rest) | ⚠️ half | a standing route IS "keep all". The per-good policy and "keep up to N" do not exist. Engine work, no content — say the word and it is a short build. |
| **Raid-risk readout** | ✅ built, **and the missing term is in** | see below |

### ⛑ What I built while verifying: the detection term, because §7's watch exists now

CCODE-500 wrote the readout without your `(1 − detection %)` and said so: *"the detection term it names belongs to
§7's watch, which is not built."* §7's watch shipped three weeks later. **The note stayed, and §76e carried a check
asserting the ABSENCE — a gate arguing against closing the gap it was written to mark.** It went on passing green the
whole time. Fixed, and re-pointed at the behaviour.

⚠️ **Your formula is optimistic, so the card shows both ends.** "chance × (1 − detection %)" treats a seen raid as one
that took nothing; `resolveRaid` treats it as one that was **met** — a fight, and a fight you lose still loses the
share. Measured on a thriving hold with a full store at danger 4:

| | a raid comes | would take | costs a pass |
|---|---|---|---|
| nobody watching | 16.8% | 80 | **13.4** |
| two on watch | 8.4% | 80 | **6.7**, or **3.1** if the watch beats the 53% it sees |

⛔ And the sentence on the card said *"about 1 raid in 25 passes **gets through**"* — through what? Nothing in the
arithmetic had asked whether anybody saw them. It says "comes" now, and the watch's half is its own clause with the
watch's own number in it.

### What the last two rows need from you

**1 · A hireable trade company.** The engine already prices the row (their cut, their speed, gate-aware, your people
stay home) — it needs something to hire. The shape I would read, as a change set in the SNG-634 style:

```
{ "id": "company_of_the_low_market", "name": "the Low Market Company", "kind": "trade_company",
  "cut": 0.2,                        // their share of what the load fetches — your 15–25%
  "operatesFrom": ["foothill_the_low_market"],   // where word can reach them
  "reaches": ["the_center", "the_gearlands"],    // regions they will carry to (or omit for anywhere)
  "guards": 4,                       // they carry the road risk; this is what they carry it with
  "knowsGates": true,                // ⬜ see my question 2 above
  "standing": "neutral",             // SNG-634 standing, so a warm power's company deals fairer
  "what": "…" }
```

Three or four of them, spread so that most clusters can reach one, and I will ship the reader in the same commit:
hiring becomes a row you can accept on the hold's card, and the load leaves with their people instead of yours.

**2 · Visiting traders.** This one is a feature kind plus wants-and-offers, and the arrival roll is mine:

- a **`trading_post`** feature kind (economy category) — ⚠️ note that `market` today has `family: "people"`, which is
  why it draws nobody; if a market should draw traders, its family or a new `draws` field is the place to say so;
- per power, **what their factors want and what they offer in barter** — your Harvest Hand / Wardens example is
  exactly the shape (`buys: {living_stock: 7}, offersInBarter: ["cut_stone"]`);
- and **standing orders** on the hold (a floor price, goods marked never to sell) so the keeper can take a deal
  without you — that part is engine and I will build it with the reader.

⬜ Until the wants exist there is nothing for a trader to say when they arrive, so I have built none of it rather than
inventing a trader who wants whatever is in the shed.

---

## Where that leaves the queue

**P3 is done except the two content-blocked rows above.** Next, unless you redirect me, is **P4 (SNG-658)**: splitting
the legend / npc / creature schemas so the 57 npc and 28 creature records pass on `schemaVersion`, then the remaining
save keys. I will report the counts before and after as usual.

**Still open, back to you or Erik:** the four ⬜ decisions in item 12 above · SNG-641 §7.4's supply-line rule (built
and OFF, needs your word) · SNG-643 §6's *"some filled with the opposite"* · `pacing.js`'s own 0..4 table ·
`growth_sim.mjs`'s hardcoded four-tier creature list.
