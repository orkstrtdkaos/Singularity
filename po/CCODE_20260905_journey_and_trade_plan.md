# THE JOURNEY, AND THE TRADE ROUTES IT MAKES POSSIBLE — the build, laid out

**CCode → Erik + Aevi · 2026-09-05 · measured at v1.9.376.**
⚑ **Erik: *"we can use it to establish trade routes and finally USE the travel skills for more than PC or
party travel."*** ⬜ **A plan, not a build. Nothing here is written yet.**

---

## §0 — ⛔ **A CORRECTION TO MY OWN §2, BEFORE ANYTHING ELSE**

⚠️ **I told you distance did not exist. It does, and it is Erik's scale, and it is already wired.** Three
claims in §2 below were false and I have struck them in place:

| I wrote | ⛔ the measurement |
|---|---|
| *"any distance function at all: **absent**"* | **`walkingDays(a, b)` — `engine/worldmap.js:465`.** Built, pure, correct |
| *"`gateHopCost` TAKES `overlandDays` and **nothing in the repo computes it**"* | ⛔ **`app.js:9511` passes `walkingDays` into `networkGatesFrom`, which computes it at `waygate.js:92`.** The hop has been priced on both sides the whole time |
| *"the year-to-walk scale — **Erik's number**, still to rule"* | ⚑ **Already ruled and already in the code:** *"antipode-to-antipode (πR) is 300 days"*. **One fewer ruling I need from you** |

➡️ **So step 1 as I named it was not work at all.** ⚑ **But there WAS a real step 1, and measuring for this
correction is what found it** — see §2b. ⬜ **I have built it; the rest of the order below stands.**

---

## §1 — ⛔ THE FINDING THAT SHOULD DECIDE THE ORDER: THE PRICES ALREADY EXIST AND ARE UNREACHABLE

**Measured today, on the real economy tables:**

| the same 8 units of raw material, sold at… | gross | net of the keep |
|---|---|---|
| ⛔ **the Unmade** | 5 | **−9** |
| the Quickwood | 16 | +2 |
| ⚠️ **`valley` — Millbrook, where Pell's forge stands** | **32** | **+18** |
| the Crossing | 64 | +50 |
| ⚑ **the Gearlands · the Making** | **115** | ⚑ **+101** |

⚑ **A 3.6× differential, authored, live, and gated behind one line:** `sellStore` refuses away from the
hold — *"the store is at the hold; you sell where it stands."*

➡️ ⛔ **SO TRADE IS NOT A NEW ECONOMY. It is a ROAD to prices this game already has.** ⚠️ That changes what
the journey build is for: **the route is not scenery, it is the mechanism that turns +18 into +101**, and
every piece below earns its place by serving that.

---

## §2 — WHAT EXISTS, MEASURED

| ✅ built | |
|---|---|
| **`worldPos`** | **135 of 135 locations.** `worldmap.js` calls it *"the sole positioning authority"* |
| **`connections`** | **135 of 135** — a real graph, as bare id strings |
| **waygates** | `isWaygate` · `hubWaygate` · `knownWaygates` · `wayfaringTier` · `isNetworkGate` · **`gateHopCost(overlandDays)`** |
| **the hold store** | `tickStore` (yield · upkeep · raid) · `sellStore` · `storeNews` · the `holdStore` dials |
| ⚑ **regional demand** | **25 regions × 12 goods, each with need and scarcity** — the differential above |
| **delegates** | `activeDelegates` · `delegationCapacity` — people who run things while you are elsewhere. **Silas has 3 of 3** |
| **MOVE crafts** | **77**, including `green_road`, `solved_route`, `wake_the_line` |

| ⛔ absent | |
|---|---|
| **any bearing** | and it must come from `worldPos` — **never `map.x/y`, which correlates with real travel at r = 0.443** |
| ✅ ~~any distance function at all~~ | ⛔ **WRONG — see §0. `walkingDays` is built AND wired into `gateHopCost` already** |
| **routes** | no pathfinder over `connections` |
| ⛔ **a position for places MADE IN PLAY** | ⚑ **THE REAL STEP 1 — see §2b** |
| **provisions** | `dried_rations` and `waterskin` are consumed by nothing |
| ✅ ~~`walkingDays` authored nowhere~~ | ⛔ **WRONG — `worldmap.js:465`, at 300 days antipode-to-antipode. SNG-331 assumed it exists because it does** |
| **trade / caravans** | nothing |

---

## §2b — ⚑ **THE REAL STEP 1, FOUND BY MEASURING THE CORRECTION ABOVE** · ✅ built, v1.9.377

⛔ **Erik's holds are at places the game MADE IN PLAY, and none of those places were anywhere.** Measured on
his save: **14 generated locations, ZERO carrying a `worldPos`** — including `gen-whistling-woman-post`,
**the hold he spent four rounds getting granted and the ground he is standing on.**

➡️ ⚠️ **`walkingDays` was never the problem. It returned null because its ARGUMENTS were nowhere** — which
is the honest answer to a missing position, and exactly the wrong state for the world to be in. **Nothing
could be routed to or from any of the fourteen, so the entire journey build was unreachable from where the
player actually stands.**

⚑ **`worldPosForGenerated(id, lookup)` — the position is DERIVED, never invented:** a place found in play
hangs off the place it was found from, which `connections[0]` already records, and the chain is walked
because a generated place can hang off another one *(the post → the gate clearing → the plateau edge)*. The
offset is **exactly one day's walk**, deterministic from the id, and **null when nothing in the chain is
placed — a place with no anchor stays honestly unplaced.**

| measured, after | |
|---|---|
| **14 of 14 placed** | zero nulls, worst deviation from exactly 1 day: **4.8 × 10⁻⁴** |
| ⚑ **the Whistling Woman Post** | **74.3 days from Millbrook** — the number a real load produces, chained through the gate clearing |
| **no two places stacked** | closest of all 91 pairs: **0.28 days** |

### ⚠️ **AND THREE SILENT BUGS CAME OUT OF IT — TWO OF THEM AT THE HUB**

⛔ **The Crossing is at colatitude 0. It IS the pole**, so the singularity in the maths is *the one place
every road in the world runs to*, not an edge case:

1. ⛔ **A flat offset clamped at the pole.** Half the bearings went negative, `Math.max(0, …)` pushed them
   back, and **both places made off the Crossing landed exactly ON it — 0.00 days away.**
2. ⛔ **The great-circle formula that replaced it lost the bearing there.** `cos(lat0)` is 0 at a pole, which
   zeroes the whole longitude term — **every child of the hub arrived at one identical point.** Fixed
   exactly rather than nudged: standing *on* a pole, the bearing you leave by **is** the longitude you
   arrive at.
3. ⛔ **A place that already had a position was displaced a day off itself**, because the walk-up stops at
   the first placed node and that node can be the one you asked about.

⚠️ **And a fourth, in my own gate rather than the engine:** my first coincidence check used `< 1e-6`, but
`walkingDays` reads **1.4 × 10⁻⁶ for two identical points** (floating point in the `acos`). **The threshold
sat below the floor, so it could never have failed.** It is 0.05 now, and §97 asserts that identical points
fall under it — **a check that proves it can still fail.**

---

## §3 — ⬜ THE ORDER, AND WHY EACH STEP EARNS ITS PLACE

⚑ **Aevi's own order stands, with one correction and one addition.** Her SNG-386 ruling supersedes SNG-331's
compass and I will not build the retired one.

### 1 · ~~`overlandDays(a, b)`~~ → ✅ **PUT THE PLACES MADE IN PLAY ON THE MAP** — done, v1.9.377

⛔ **The primitive I named was already built and already wired (§0).** ⚑ **The real first step was that its
arguments were nowhere:** 14 of Erik's locations had no position, and one of them is his newest hold. **§2b
has the finding, the fix and the three bugs it hid.** ➡️ Everything below now has something to measure.

### 2 · `bearingBetween(a, b)` — ⚑ **HUBWARD/OUTWARD · SPINWARD/WIDDERSHINS**, per SNG-386

⛔ **Not compass points. Aevi's canon, and it is better than north:** *"hubward means toward the Crossing,
which means toward BALANCE. Outward means toward a pole, which means toward commitment."* ⚠️ **The vocabulary
is hers and I will not invent words for it.** ➡️ `ctx.location.bearingsToKnown` so the GM can say *"the road
runs outward from here"* without inventing it.

### 3 · `routeBetween(a, b)` over the MIXED graph — roads **and** gates

⚠️ **Two named options, never one optimal one** — SNG-331's rule and it is right: *"four days through the
Wend, or seven around it"* is a decision; a single best route is an answer. ⚑ **And the gate leg is the whole
point:** *"forty days on foot, or six to the Longshore gate and twelve hours through."*

### 4 · ⚑ **TRADE — AND THIS IS WHERE I WOULD PUT IT, NOT LAST**

⛔ **Because §1: the route is only interesting if it reaches a price.** Steps 1–3 make a caravan possible;
step 4 makes them matter. ⬜ **And it is smaller than it sounds, because it composes what exists:**

> **A CARAVAN IS A DELEGATE + A ROUTE + A LOAD.**
> `activeDelegates` already models the person. `routeBetween` gives the road. `holding.store` is the load.
> `sellStore`'s regional pricing is the payoff. ⚠️ **Nothing new is invented; four built things are joined.**

| the piece | what it is |
|---|---|
| **`sendCaravan(hold, toRegion, {carrier, goods})`** | takes a load off the store, puts it on the road |
| **it runs on the TICK** | like a hold's growth — ⚑ *"it should run itself while you're not looking"* |
| ⚠️ **it can be robbed** | `resolveRaid` already exists and a caravan is a store that moved. ⛔ **A watch on the road is what a MOVE craft and an armed carrier are FOR** |
| ⛔ **and it is where the travel crafts finally pay** | `green_road`, `solved_route`, `wake_the_line` shorten a leg or lower its risk — **for someone who is not the player.** That is Erik's ask in one line |
| **the market panel** | ⬜ **what a hold HAS, what it is worth HERE, and what it would be worth THERE** — the differential made visible, which is the whole design |

### 5 · provisions — ⚠️ **still last, deliberately**

⛔ **The only piece that adds a resource the player must manage**, and both specs' rule holds: **running out
COSTS, it does not kill.** ⚑ It also prices a caravan honestly once it exists.

---

## §4 — ⬜ THE DECISIONS I WILL NOT MAKE

| | |
|---|---|
| ⛔ **the direction vocabulary** | **Aevi's**, and SNG-386 already fixed the four words. I will use exactly those |
| ⛔ **what a caravan RISKS** | ⚠️ a lost load is real loss. **Is a robbed caravan a total loss, a share, or a debt?** `resolveRaid`'s `takeShare` is the obvious model and the ruling is Erik's |
| ⛔ **whether a carrier can DIE on the road** | ⚠️ **`legionClash` can kill.** A delegate lost to a trade run is a consequence the game should be able to have — **and it must be a choice, not a side effect** |
| ~~the year-to-walk scale~~ | ✅ **ALREADY RULED AND ALREADY BUILT — 300 days antipode-to-antipode. Not a decision I need** |
| **whether trade is TAXED** | a Reach that lets you sell at 3.6× may want a cut. ⬜ Not mine |

---

## §5 — ⚠️ AND TWO THINGS TO SETTLE BEFORE STEP 1

⛔ ~~**`walkingDays` IS AUTHORED NOWHERE**~~ — **false, and struck: see §0.** ⚑ **SNG-331 assumed it exists
because it does**, at `worldmap.js:465`, deriving from `worldPos` so a leg's length is a fact about the world
rather than a number somebody typed. ⚠️ **What SNG-331's "weight by days" actually needed was for the places
to BE somewhere**, which is §2b — and that is now true for all fourteen.

⬜ **AEVI ASKED ME A DIRECT QUESTION IN SNG-386 §5 AND I OWE HER THE ANSWER: is renaming
`content/packs/valley/` feasible?** ⚑ **Yes, and it is a two-line change plus a migration** — every path is
built from the pack id, and saves reference `image` paths that a redirect can cover. ⚠️ **But it touches
every asset URL in every save, and the honest recommendation is DON'T: leave the directory and fix the NOTE,
because the cost is a day of risk for a word nobody sees.** ⛔ **The rot is real; the folder is the wrong
place to fix it.**

---

⬜ **Say go and I start at step 1.** ⚑ **Steps 1–3 are pure and gateable in one landing; step 4 is where I
would want Erik's two rulings above first, because a caravan that can lose a person is a different game from
one that cannot.**
