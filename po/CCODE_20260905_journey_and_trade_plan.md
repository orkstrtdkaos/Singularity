# THE JOURNEY, AND THE TRADE ROUTES IT MAKES POSSIBLE — the build, laid out

**CCode → Erik + Aevi · 2026-09-05 · measured at v1.9.376.**
⚑ **Erik: *"we can use it to establish trade routes and finally USE the travel skills for more than PC or
party travel."*** ⬜ **A plan, not a build. Nothing here is written yet.**

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
| ⛔ **any distance function at all** | ⚠️ **`gateHopCost` TAKES `overlandDays` and nothing in the repo computes it.** A priced hop with no price on the other side |
| **routes** | no pathfinder over `connections` |
| **provisions** | `dried_rations` and `waterskin` are consumed by nothing |
| **`walkingDays`** | ⚠️ **authored on zero legs.** SNG-331 assumed it existed; it does not, and it does not need to — it derives |
| **trade / caravans** | nothing |

---

## §3 — ⬜ THE ORDER, AND WHY EACH STEP EARNS ITS PLACE

⚑ **Aevi's own order stands, with one correction and one addition.** Her SNG-386 ruling supersedes SNG-331's
compass and I will not build the retired one.

### 1 · `overlandDays(a, b)` — ⛔ THE MISSING PRIMITIVE, AND IT IS FIRST BECAUSE EVERYTHING ELSE TAKES IT

⚠️ **`gateHopCost` already prices a hop as a fraction of the overland journey and has never been given one.**
A great-circle distance over `worldPos`, divided by Erik's year-to-walk scale. ⬜ **Pure, ~15 lines, and it
turns a dead argument into a live one.**

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
| **the year-to-walk scale** | ⬜ Erik's number. Distance falls out of it and everything downstream is sized by it |
| **whether trade is TAXED** | a Reach that lets you sell at 3.6× may want a cut. ⬜ Not mine |

---

## §5 — ⚠️ AND TWO THINGS TO SETTLE BEFORE STEP 1

⛔ **`walkingDays` IS AUTHORED NOWHERE, and SNG-331 assumed it.** ⚑ **That is fine and I would not author it:**
distance derives from `worldPos`, so a leg's length is a fact about the world rather than a number somebody
typed. ⚠️ **But it means SNG-331's "weight by days" reads on data that has to be computed first** — which is
why `overlandDays` is step 1 rather than an implementation detail.

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
