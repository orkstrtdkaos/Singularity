<!-- status: work order for CCode, 2026-09-27 — everything outstanding after CCODE-551, prioritised; three rulings from Erik at the top -->
# WORK ORDER: Aevi → CCode, 2026-09-27. What's left

## Erik's rulings today (2026-09-27)

> *"1. yes. i agree. 2. agree. I also think the energy cost at a gate is kind of pointless at this point... 10e is
> next to nothing."*

1. **The supply-line rule goes ON** (SNG-641 §7.4). With the exclusive-hungers fix, not before (see A1).
2. **A load pays nothing at a gate.** Your reading of his "it doesn't cost to go through a gate" was right.
3. **Nobody pays energy at a gate either.** Drop the gate leg's energy cost for travellers (`gateEnergy`), so a gate
   leg costs time and nothing else, for everyone. §382 then asserts it for travellers too.

---

## A — Small, and each unblocks something (do first)

| # | what | then |
|---|---|---|
| A1 | **§372: move the tie check onto a synthetic rule** (two hungers sharing a kind), so it tests the engine, not my content | I apply `po/staged_content/SNG-663_supply_line_hungers_exclusive.patch` (0 ties, 10 lines, Ninefold gets the Undercount) |
| A2 | **Flip `supplyLineRule.on`** (ruling 1), after A1 lands | — |
| A3 | **Gate energy to zero** (ruling 3) | — |
| A4 | **Claimant arcs:** measure the four arcs over a simulated year before/after `po/staged_content/SNG-663_claimant_arcs.json`, apply with the numbers; add the gate that a figure's npc file and epic row may not disagree on `arcAffinity` | the open Chaos/Order seat becomes finishable |
| A5 | **Seats per world:** `seatsTaken` into the shared world beside the arcs | — |

## B — SNG-663 §2: gates, yards, keepers, markets (content all staged)

| # | what | content (staged) |
|---|---|---|
| B1 | **§2b yards:** gate legs land at the yard; the `waygate` flag moves off the 15 settlements; a save standing in a moved city isn't stranded; a raid by gate lands in the yard and meets the watch and defence there | `SNG-663_gate_yards.json` (15) |
| B2 | **§2c keepers, after B1:** "holding a gate" is an **act** flag (closing, charging, garrisoning the arch), never derived from `holds`; stigma (standing drop on seizing, drift while held); the escalation clock (a season apart, notable → legendary); released gate stops them within a tick; the Made Gate never counts | `SNG-663_lattice_keepers.json` (class + 4, all `random: false`) |
| B3 | **§2d market fees + §2e corruption:** flat fee per load that sells, to the power holding the market; hostile ×2, allied waived; refused → can't sell there; the card subtracts it; corrupt: fee varies by who you are, a bribe opens a hostile market, the coin moves no standing, exposing them is a deed | `SNG-663_market_fees.json` (11 powers, 2 corrupt) |

## C — SNG-652 §6: the two trade rows that are still quotes

| # | what | content (staged) |
|---|---|---|
| C1 | **Hire a company:** a row you can accept on the hold's card; the load leaves with their people; they carry the road risk | `SNG-652_trade_companies_and_traders.json` → `companies` (4) |
| C2 | **Visiting traders:** a `trading_post` kind (or `draws: ["traders"]` on `market`), the arrival roll, standing orders (floor price, never-sell) | same file → `traders` (10 powers) |

## D — Still open from before

- **P4 item 16:** the generator reads its schema per type; waits on draft schemas being ratified (mine).
- **The ability census:** 441 of 441 invalid, mostly the engine's own load-time stamps judged by an author's schema.
  Your finding; propose the split (authored vs stamped fields) and I'll ratify.
- **P5 backlog** (Erik's): the encounter tuning matrix, NPC generation beyond domains, the Afterling and the Unordered
  as peoples, the `autonomous` nanite state, the opponent's third mood, crowding by the opposing source. Not queued.

## Mine, alongside

SNG-645 (powers for the 24 empty regions) · two more epics (SNG-660 §1d) · ratify the draft schemas for item 16.

## Waiting on Erik

SNG-634 §8 and SNG-636 §8 (powers on the ground, the hierarchy above them) · SNG-641 §7's remaining items (Lucifer's
mask, the Starless, the seat count) · SNG-640 §6. *(Sera / Seraphine: settled 2026-09-28. Sera IS the High Luminary, one record since SNG-646; Seraphine the Unbending Witness is a different woman, and the Hollow King's dangling rival `seraphine_unbending` now points at her.)*

**Suggested order:** A (all five are small) → B1 → B3 → C1 → B2 → C2 → D.

— Aevi, PO