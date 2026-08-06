# SPEC — SNG-331: THE JOURNEY. Multi-hop travel with direction, provisions, and what is on the road.
## Aevi (PO) · 2026-08-06 · Erik: "a concrete sense of DIRECTION along with its concrete sense of distance."

## THE HEADLINE FINDING: DIRECTION ALREADY EXISTS AND IS NEVER SPOKEN
**All 96 locations carry `map: {x, y}`.** Every bearing in the Valley is computable **today** —
`atan2(dy, dx)` — and **nothing in the game has ever said "north."**
The world has a rigorous sense of **how far** (`walkingDays`, Erik's year-to-walk scale) and **no sense of
which way.** That asymmetry is why the map reads as a diagram rather than a place: **a player can tell you the
Palelands are three weeks away and not that they are upriver and east.**
**⚠️ THIS IS THE CHEAPEST HIGH-VALUE ITEM IN THE SPEC. The data is authored; only the vocabulary is missing.**
- **8-point bearings** from the existing coords: *"the Ford lies east-northeast, four days."*
- **Regions get a standing direction from each other**, so a player builds a mental map that survives.
- **The GM gets it too** — `ctx.location` currently carries `{id, name, regionId}`; adding
  `bearingsToKnown` means the narrator can say *"the road runs south out of town"* **without inventing it**,
  which is the failure mode the whole no-authorship rule exists to prevent.

## THE JOURNEY PANEL — what "Travel here" should open
**Right now `Travel here` is a one-hop button with a distance line under it. It should be a plan you accept.**
```
  ⟶ THE PALELANDS · the Quiet Ground          east-northeast · 11 days on foot
  ─────────────────────────────────────────────────────────────────────────
   via the Ford (2d) → the Wend (5d) → the Long Grey (4d)
   provisions   11 days · you carry 6            ⚠ 5 days short
   camps        9 nights in the open, 2 under a roof
   danger       the Wend ⚠⚠ · the Long Grey ⚠⚠⚠   (worst on the route)
   on the road  ⚠ The One Called Ares holds the Wend crossing
                · Morvane of the Harvest Hand is at the Long Grey
   [ Set out ]  [ Provision first ]  [ Go through the wilds ]  [ Cancel ]
```
**Every line above is computable from data that exists**: `connections` for the route, `walkingDays` per leg,
`dangerLevel` per node, `homeLocation` for who is there, and `map` coords for the bearing.

## THE PIECES
### 1. ROUTE — shortest path over `connections`, weighted
**Weight by days, not hops.** Offer the **fastest** and, when they differ, the **safest** (minimising summed
`dangerLevel`). ⚠️ **Two named options beat one optimal one** — *"four days through the Wend, or seven around
it"* is a decision; a single best route is just an answer.
### 2. PROVISIONS AND CAMPS — the mechanic that does not exist yet
**There is no provisions system.** `dried_rations` and `waterskin` exist as items and nothing consumes them.
**Proposal, deliberately small:**
- **1 provision per day on the road.** Arriving at a settlement resets nothing — you buy more.
- **Camps are nights not spent under a roof**, derived from the route: a leg ending at a settlement is a roof.
- **⚠️ Running out does not kill you — it costs.** Out of provisions: no rest recovery, a stacking penalty,
  and a forage roll each day. **Starvation as attrition, not a fail state**, which fits a world where the
  interesting question is what a journey COSTS rather than whether you survive it.
- **This is what makes distance mean something.** Eleven days is currently a number; **eleven days is
  eleven provisions and nine cold nights.**
### 3. WHAT IS ON THE ROAD — the part that turns a route into a story
Assemble from what the world already tracks:
- **figures whose `homeLocation` is on the route** — *"Morvane is at the Long Grey"*
- **⚠️ figures whose arc activity is there** — *"The One Called Ares holds the Wend crossing"*, which is
  `arcContests` + `homeLocation` and needs nothing new
- **arc stage effects in force** on those regions — the Poles Pull raising cross-domain cost, a sealed
  Quickwood, a region whose `deadList` means you cannot resupply
- **danger per node**, and **the worst on the route named**, because that is the number a player actually
  decides on
**⚠️ VISIBILITY BY STANDING, not omniscience.** You see what you would plausibly know: places you have been,
places your deeds have reached, and rumour. **A route through unknown country should show gaps and say so** —
*"three days you have no account of"* is better information than a confident empty stretch.
### 4. THROUGH THE WILDS — Erik's third option
**Off the connection graph entirely: straight-line by bearing.**
- **Faster** — the direct distance rather than the road's dogleg.
- **Costlier** — more camps, no roofs, no resupply, higher encounter rate.
- **⚠️ AND IT IS HOW NEW PLACES GET FOUND.** The wilds route is exactly where `mintTransitLocation` belongs —
  a player crossing unmapped country **should** name what they find. **That turns the mint from a
  fiction-patching mechanism into a reward**, which is a better job for it.
- **It needs the bearing to exist**, which is why §0 comes first.

## ORDER I WOULD BUILD IT
1. **Bearings** — pure derivation from authored coords, no new data, immediately improves every location line.
2. **Multi-hop route + the panel** — the usability win Erik and I both landed on independently.
3. **What is on the road** — assembled from existing records; makes the panel a reason to read.
4. **Provisions** — a real new mechanic, and the one that makes distance cost something.
5. **The wilds** — depends on 1 and 4, and pays off the mint.

## WHAT IS MINE
**The direction vocabulary** (how a bearing is spoken in this world's voice — *upriver*, *poleward*, *toward
the Ascent* rather than only compass points), **the provisions content** (what counts as a provision, what a
roof is, what foraging finds by region — the region tables already carry `living_stock` need/scarcity), and
**the road-facts phrasing.** Say the word and I will author them ahead of the build.
