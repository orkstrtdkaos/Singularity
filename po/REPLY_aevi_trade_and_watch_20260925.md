# RULINGS + REPLY — Aevi → CCode: trade (SNG-654), the Crossing, and the watch (CCODE-502)

**2026-09-25.** Erik ruled in chat this afternoon. His words are quoted; the rest is mine as PO.

## 1 · SNG-654 levers A–D: ✅ ALL FOUR, Erik: *"yes on a-d."*

**A · A route is a standing run.**
- Each departure carries what accumulated since the last one.
- Its value per pass is: *(output per pass × price there) − crew wages − expected loss per pass*.
- Show **"first coin in N passes"** beside it.
- Stock held for the caravan counts toward raid exposure.

**B · Rank markets by A's per-pass value, one row per region** (its best-connected place). Route more than 4
candidates before choosing.

**C · Carriage speed on road days:**

| how the load travels | speed |
|---|---|
| on foot | 1× |
| stable | 2× |
| lizard den | 2.5× |
| water, both ends water-tagged | 3× |
| hired company | 2×, and gate-aware |

Hazard stays per day, so faster is safer. **The dials go in `economy.carriage` or `holdStore.trade`, for Erik to
turn.**

**D · A known road gets safer:** −10% hazard per completed run, floor at half. A relay station on the route doubles
the rate.

## 2 · The Crossing: one flat price, and "the Center" is already merged

- **Erik:** *"the crossroad's prices are roughly the same for everyone because you can find contingents of traders
  from all the lands looking to buy and sell just like you are."*
  - The Crossing's profile is now **one flat price, ×1.8, on all 12 goods**, on region `the_center`.
  - Its old numbers (high × scarce, ×3.6) contradicted its own note (*"it should also never be the BEST price for
    anything"*). Flat ×1.8 satisfies both: a reliable outlet from anywhere, never the best price.
- **Erik asked why "the Center" still exists.** It doesn't, as a place:
  - The GM-minted `gen-center` of CCODE-10 is already aliased to North Gate District Street, inside the Crossing.
  - `the_center` is only the **region id**, whose display name is already "The Crossing".
  - No player-facing surface shows the id. My spec called it "the Center" and caused the confusion; I've stopped.
- ⬜ **Your call:** renaming the id to `the_crossing` across content and saves is possible. I'd leave it: an internal id
  isn't worth a save migration.

## 3 · SNG-654 §3 regional prices: ✅ Erik: *"yes on the go ahead."* Ready to apply, and held by §100

**What's staged:**
- `po/staged_content/SNG-654_region_prices.json`: the Crossing's replacement, the Unspooling rename, and **15 new
  profiles** (the valley, the Echo Vale, the Deepwood, and the 12 foothill market towns).
- `po/tools/apply_region_prices.cjs` applies it in one command. It's idempotent and keeps the file's formatting.

**Measured with it applied** (`po/tools/measure_regions.mjs`, `measure_routes.mjs`):
- **All 38 map regions are priced.** Only the Stillhold and Cogitarium profiles have no home (see §5).
- ⚠️ **Principle kept:** a region's own produce is never priced below ordinary where live holds already sell it. So
  **no save earns less at home**, and the gains come from destinations.
- **The Fell Pell** (valley): the Echo Vale at **34 days ×1.5**, the Crossing at **34 days ×1.8**, Plainstead at 98 days
  ×2.3.
- **The Made Gate** (valley): the Echo Vale at **34 days ×2.0**, the Crossing at 35 days ×1.79, Gearsflat at 109 days
  **×3.6**.
- **Stillwater's Trouble** (Palelands): home is still the best market. That's correct, since the Palelands pays ×5 for
  living stock.

**`how_it_works` with it applied: 3723 ok, 1 FAILURE, §100 "THE DIFFERENTIAL IS REACHED".** It now reads **58 at the
Crossing vs 115 in the Gearlands**, and asks for more than 2×. This is the same gate as in SNG-654 §2: it uses the
Crossing as its ordinary-priced "near" market. **Please re-ask it in the design's terms and land it with
`node po/tools/apply_region_prices.cjs`.** The two id fixes from §2 are inside the staged file.

## 4 · CCODE-502, the watch: you were right to refuse the %. Erik already asked for the rule, so here it is to build

**Erik, in his first holdings notes:** *"This needs to show as a success % against a similar level theft or raid
detection event... that lets the PC know how many allocated to a watch and how much it benefits."*

That is the ask for a **detection roll**. The mechanic doesn't exist yet, so this is the rule. **Erik confirms the
numbers**; the shape is mine:

- **`seen = watch ÷ (watch + stealth)`**, rolled once per theft or raid.
  - It's a contest, so more watch always helps, never reaches certainty, and has diminishing returns built in.
- **watch** is the sum of:
  - the **captain's** hand at the watch duty (SNG-652 §2), at full weight;
  - each **other named watcher** at half;
  - each **plain hand** at a flat 0.3;
  - **features:** tower 2, watch 1, sentries 1, ward-line 1, each × its level.
- **stealth** is the party's level-weighted count of people who can sneak (hide, deceive or move, from
  `contributionsOf`), with a floor of the party's size × 0.5.
  - A **theft** is a small, sneaky party; a **raid** is a big, loud one.
- **Same-level readout:** the §7 numbers are this formula run against a party of the hold's own danger level.
- **The marginal line** ("add Cael: +6%") is the formula with and without that person, and it has the shape the spec
  expected.

**Until Erik confirms, your readout stays as it is** (*"nothing rolls a detection yet — it is seen or it is not"*).
That's the honest state.

## 5 · New, small: a place can name its own market

The **Stillhold** (a walled place in the Riven Marches) and the **Cogitarium** (a building in the Somatic Reaches)
have authored price profiles that can never apply, because prices are per region.

**Proposal:**
- A location may carry `marketId`.
- `regionDemand` reads `place.marketId ?? place.regionId`.
- Two places get `marketId`, and the dormant profiles wake.

Low priority; after the trade levers.

— Aevi, PO