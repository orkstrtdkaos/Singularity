<!-- status: SNG-665 — Aevi (PO); Erik's ruling 2026-09-29; ⬜ CCode, first after the 09-29 tail -->
# SPEC SNG-665: the trading screen: many runs, clear numbers, and the keeper never holds everything

**Aevi (PO) · 2026-09-29**

> **Erik:** *"No — a keeper does NOT hold the entire stock while a trade route runs. The trading screen needs to be
> clear and simple. You can put more or less into a run (of which you can have many different routes set up) and you
> should be able to see the effect on the $ expected to be brought in. You should have a toggle that lets you always
> hold enough product back to sell for operating costs."*

## §1 — What changes

Today (CCODE-542/562): one `holding.route` per hold, and while it stands the keeper holds **all** stock for the cart.
Loki's Annex made nothing for 26 passes because of it. **That rule is withdrawn.**

1. **A hold has any number of runs** (`holding.runs[]`), each: destination, carrier (own crew or a hired company),
   and **how much of each pass's product goes to it** (units per pass, or a share; the screen shows units).
2. **Everything not put into a run sells at home**, every pass, through the keeper, at the home market's price and fee.
3. **"Cover operating costs first" toggle** (per hold, on by default): before anything goes to a run, the keeper sells
   enough at home to pay the hold's upkeep that pass. What's left is what the runs can draw on. The screen says how many
   units that takes.
4. **A run never starves the hold.** If the runs ask for more than is left after the reserve, each takes its share
   proportionally, and the row says so ("asking 20, getting 14").
5. The cart for a run leaves when its load is gathered (the load is its per-pass amount × the passes the round trip
   takes, capped by what the carrier can carry), exactly as a standing run does now, so first coin still comes when
   the cart comes back. The stock waiting for a run is the only stock at risk in the shed.

## §2 — The screen (one panel per hold, no popups; numbers illustrative)

| | per pass | into it | expected back per pass | first coin |
|---|---|---|---|---|
| **Upkeep reserve** ✔ | 24 | 7 units | covers upkeep | now |
| **Sell at home** (Millbrook) | | 3 units | 18 | now |
| **Run → the Axis Gate** (own cart) | ◀ 4 ▶ | 4 units | 51 | 1 pass |
| **Run → Tier Seven** (Hub Yard Porters) | ◀ 0 ▶ | — | — | — |
| **+ Add a run** | | | | |
| **Total** | makes 14 | | **69 a pass** · upkeep 24 · **net +45** | |

- **The ◀ ▶ changes the number and the totals move at once.** No save button: what the row says is what happens.
- "Expected back" is the same reader the card uses today (lever A's value, the fee, the carrier's cut, the road's
  expected loss), per run, so the total is the sum of its rows and nothing is computed twice.
- **Add a run** opens the existing ranked list of destinations (lever B) inline; picking one adds a row at 0.
- Each run row folds open to its detail (road danger, who walks, the fee, where the cart is). Closed, it's one line.
- Plain words on the row, not machine terms: "4 of your 14 a pass go to the Axis Gate; it earns about 51 a pass once
  the cart is running."

## §3 — Gates

- A hold with runs set and the toggle on never ends a pass unable to pay upkeep from its own product, unless its whole
  product is less than its upkeep (and then the row says that).
- The keeper sells at home whatever no run asked for, every pass. The "hold everything" state is unreachable.
- The screen's total equals the sum of its rows, and the tick's actual earnings over 20 passes land within the card's
  forecast band (the forecast and the run agree, as with lever A).
- Existing saves: a hold's single `route` becomes one run carrying its whole product minus the reserve; Loki's Annex
  starts selling the remainder at home on the next pass.

— Aevi, PO