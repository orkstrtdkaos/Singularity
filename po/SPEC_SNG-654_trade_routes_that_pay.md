<!-- status: SNG-654 — Aevi (PO); two content defects fixed in this push; four engine levers for Erik to rule and CCode to build -->
# SPEC SNG-654: trade routes that pay

**Aevi (PO) · 2026-09-25**

**The ask.** Erik: *"you and I should make them profitable."* CCode (CCODE-500): *"long-haul trade is priced so it can
never be worth it — 48–65 passes for 3× the gross."*

## §1 — WHAT IS ACTUALLY WRONG (measured today, `po/tools/measure_trade.mjs` and `measure_regions.mjs`)

**Three causes, and only one of them is distance.**

**1 · Most of the world has no prices of its own.** `economy.regions` has 25 demand profiles. The map has 38 regions.
- **17 regions have no profile,** so they all price at *ordinary × ordinary*: the valley (18 places), the_center (10),
  the_echo_vale (8), manifest_domain (5), unspooling (6), and all 12 foothill market towns.
- **4 profiles fit no region at all.** ⛔ Two of them are id defects that switch off authored content:
  - **`the_crossing`**: *"the clearing house"*, **high** need for 11 of 12 goods. The Crossing, along with the Hundred
    Markets and the Axis Gate, sits in region **`the_center`**. **The one market authored to buy everything never
    priced anything.**
  - **`the_unspooling`**: its six places use `unspooling`.
  - `the_stillhold` and `the_cogitarium` match nothing. ⬜ I need to find where they belong; they are left alone here.
- **The result:** from the valley, **every market within 140 days pays exactly what home pays.** The first better
  price is the Grand Lattice, 147 days away. There was never a nearby route to take.

**2 · The comparison prices one load, once.** `storeExits` values a caravan as *today's store ÷ passes on the
road*. A trade route isn't one trip. It runs again and again, and **each departure carries everything the hold made
since the last one.** In steady state, distance costs **delay, risk and carriers away**. It does not divide the income.
- ⚠️ It also ranks candidate markets by **gross price** and routes only the top 4. So with the Crossing fixed, the
  valley still doesn't list it (33 days, 2.8×), because two 147-day markets at 3.6× take the slots.

**3 · Caravans walk.** Route days are `walkingDays`. Region-to-region by road:

| | days |
|---|---|
| min | 9.7 |
| 25th percentile | 159 |
| median | 207 |
| 75th percentile | 257 |

A world day is a real day. Nothing a hold owns (stables, lizard dens, a river, a longship) makes goods move faster.

## §2 — TWO ID FIXES, READY, AND ONE OF CCODE'S GATES IS HOLDING THEM (content; mine)

In `content/packs/core/rules/economy.json` `regions[]`, two one-line edits:
- `"regionId": "the_crossing"` → **`"regionId": "the_center"`**. ⚠️ This prices **all ten** of the_center's places as
  the clearing house, including the Ent Grove and the Coliseum. I think that's right: the center *is* the
  crossroads. The alternative is a place-level override, which the engine doesn't have yet.
- `"regionId": "the_unspooling"` → **`"regionId": "unspooling"`**.

**Measured with both applied:**
- **Stillwater's Trouble** gains its first real route: the_center, **9.9 days**, 173 there against 163 here.
- **The Fell Pell** and **The Made Gate** gain the Crossing at **2.8×**, 33 days away, but can't see it until lever
  B below.

**Why it isn't committed:** `how_it_works §100` "THE DIFFERENTIAL IS REACHED" uses **the Crossing as its
ordinary-priced "near" market**. It asserts the Gearlands pays more than **2×** what the Crossing pays for 8 raw
material.
- That was only true while the Crossing's profile was dead.
- With it live: **64 at the Crossing, 115 in the Gearlands.** Still a big differential, but not 2×.

**The gate pins the defect,** so it's CCode's to re-ask. For example, use a genuinely ordinary-priced place as the
baseline, or assert the differential in the terms the design intends (*"the far market pays more than the near
one"*). Then land it together with these two lines. 3717 ok · 1 failure (that one) with the fix in.
## §3 — THE PRICE MAP, NEXT (content; mine, after Erik's nod on §4)

**Author the 16 missing profiles** so that **every cluster has a trading partner within about 10–35 days**, and the
long hauls stay the big, rare, dangerous wins.

**The geography helps.** The foothill towns (Hardline, Keelmouth, Longshore, Plainstead, Greyhearth, the Worn Yard,
Thinwater…) ring the center at 60–75 days, and each sits near one of the great regions. Each becomes a **specialist
market town**: it buys what its neighbouring region lacks, and sells what it has too much of.
- *Hardline/Keelmouth* (a harbour on the frontier) wants arms and raw material and sells salt goods.
- *Gearsflat* sells parts cheap and wants raw material.

**The valley itself** gets a real profile: a producer's region (living stock and raw material abundant; parts,
instruments and medicines scarce). That way the Crossing, 33 days out, is its natural outlet.

## §4 — ⬜ FOUR ENGINE LEVERS (Erik rules the dials, CCode builds)

**A · A route is a standing run, not a trip.**
- Once a route is set, each departure carries **what accumulated** since the last one.
- Its value per pass is: *(what the hold produces per pass × price there) − crew wages − expected loss per pass.*
- The comparison shows **"first coin in N passes"** beside the per-pass figure.
- Stock waiting for the caravan counts toward raid exposure. That ties into the stock policy: *keep for the caravan*.

→ Distance becomes a **delay and a risk**, not a divisor, which is how trade works.

**B · Pick markets by what they'd earn, one per market.**
- Rank candidates by lever A's per-pass value, not by gross price.
- Take one row per region (its best-connected place), so ten places in the_center are one market, not ten
  candidates.
- Route more than 4 before choosing.

**C · Carriage by means.** Speed multipliers on road days:

| how the load travels | speed |
|---|---|
| on foot | 1× |
| pack animals or carts (the hold has a **stable**) | **2×** |
| lizard mounts (a **lizard den**) | **2.5×** |
| by water, both ends water-tagged (a **longship**, or Keelmouth's harbour) | **3×** |
| **a hired company** (its own animals, plus the gates it knows) | **2×**, gate-aware |

Hazard is rolled per day, so faster is safer as well. **This gives stables and lizard dens their reason to exist on a
trading hold.**

**D · A known road gets safer.** Each completed run cuts that route's hazard by 10%, down to half. The relay station
feature doubles the rate.

**Projection, on content that exists** (valley → the Crossing, 33 days, with A + B + C and a stable):
- The road is 16.5 days, about **6 passes to first coin**.
- **For every 10 working parts the Pell makes:** 40 at home, **144 at the Crossing**.
- **For every 10 raw material:** 40 at home, **80 there**.
- After the first arrival, that difference lands **every pass** the route runs, minus two carriers' wages and a
  small road risk.

**That's a route worth running, and it will still lose to selling at home for a hold that makes very little.** The
choice comes from the hold, not from a law against trade.

## §5 — ⬜ FOR ERIK

1. **Levers A–D:** yes or no to each. The speed numbers in C and the 10%/half in D are yours to turn.
2. **The Crossing's prices applying to all of the_center:** keep, or ask CCode for a place-level price override so
   only the Crossing and the Hundred Markets buy at clearing-house rates.
3. **§3 go-ahead:** 16 regional profiles, authored as one change set, and measured before and after with the same
   tool.

— Aevi, PO