<!-- status: CCode → Aevi. B3 SHIPPED (CCODE-558, v2.14.13) — §2d fees and §2e corruption, all four selling doors on one reader. ⛔ MEASURED: the flat per-load fee is REGRESSIVE with distance and does the OPPOSITE of what §2d says it is for (near market 3.13% of its rate, far market 0.15%). Shipped as authored with the lever OFF. §2e.4's "wardens become an enemy" has no record to land on -->
# CCode → Aevi, 2026-09-28. The market charges

**B3 is shipped** — CCODE-558, v2.14.13, **32 of 32 suites green**, 4,118 checks. Your eleven markets are content, and
all four doors that sell read one fee.

## ⛑ Your content was clean, and it is live on three holds

All 11 staged markets resolve: the power exists, the place exists, and in every case the power **holds** that place.
Nothing needed correcting. And the fee is live today — **Silas's Fell Pell and Made Gate and Loki's Standing Annex**
all sit in `valley`, where the Millbrook Council holds a market at `millbrook`.

⚑ One design call worth naming: the fee reads `holds`, **never `reach`**. Your line is "a market *held* by a power",
and reading `reach` would have put a stall fee on every town in a crown's shadow — the eleven powers' reaches cover
sixty places between them.

## ⛔ The fee as specified does the opposite of what §2d says it is for

You wrote: *"The trade card subtracts it from a run's value per pass, so a far market with a steep fee can lose to a
near one."* **Measured on Silas's Fell Pell:**

| market | what it asks | how often | per pass | share of that arrangement's rate |
|---|---|---|---|---|
| Millbrook (near) | 2 | every pass that sells | 2 | **3.13%** |
| the Grand Lattice (far) | 8 | one load every 27 passes | 0.3 | **0.15%** |

⛔ **A flat per-load fee costs a near market twenty-one times more of its rate than a far one**, because distance means
one big load rather than many small ones: the Lattice's eight shards buy twenty-seven passes of production. A steep far
fee cannot lose to a near one under this shape.

⛑ **So it ships exactly as you authored it** — the numbers are yours and the shape of the rule is yours and Erik's —
**and the lever that would make your sentence true is in and OFF**: `economy.markets.chargePerPass`. On, the stall fee
is charged every pass a run is running, so distance costs more rather than less (the far run's 0.3 becomes 8). Proven:
off, the arithmetic is bit-identical to the per-load rule. One word from either of you.

## ⛑ The bands, and where §2d and §2e disagreed

§2d says hostile **doubles** and allied **waives**; §2e.2 says a hostile power's market is **shut** and a bribe opens a
corrupt one. Both are in, with the thresholds as authored dials on the ladder every standing in this game reads —
waived at `trusted`, doubled at `wary`, shut at `hated`. Driven end to end on the Barony (base 10, corrupt):

```
revered  →   0  waived        neutral →  23
trusted  →   0  waived        wary    →  45  doubled
known    →   8  (they know you, and it is less today)
hated    →  45  doubled · SHUT — 45 into a warden's hand opens it
```

⚠️ Two arithmetic defects the driving caught, both of which said the opposite of the rule:
- **The bribe was cheaper than the fee** (30 against a doubled 45) — a discount for being hated. It is never less than
  the fee it replaces, and at the shut band **the bribe is what you pay**, or it was a number nobody ever paid.
- **A corrupt receipt called the same person a stranger AND a friend** in one breath, because `isKnownPower` reads the
  *who-you-know* ledger and the discount reads *standing* — two different records. A person cannot be both.

## ⛑ §2e, as you specified it

1. *"The fee is what they say it is today"* — **by who you are, never by a die.** A fee that rolled every visit could
   not be quoted on the trade card, and a number the player cannot plan against is noise rather than a mechanic. So
   the same person asking twice is told the same price: more from a stranger, more from the plainly rich, less from a
   friend of the wardens.
2. **A bribe opens a hostile market** — and only a corrupt one. A fair power that has shut its market has shut it.
3. **The coin never reaches the power** — `toPower: false`, and paying moves no standing either way (your §2d: paying a
   fair power "is ordinary and moves nothing"). What differs is *who has it*, and that is what exposing them rests on.
4. **Exposing them is a deed** — a button on the hold's card, only at a corrupt market and only while you are standing
   in it, through `movePowerStanding`, the one writer of a power's opinion. ⬜ **The other half has nowhere to land:**
   *"the wardens become an enemy"* needs a warden record and there is none in content. The receipt says
   `wardens: null` rather than inventing one — **that is a content ask, if you want it.**

## ⛔ And B1 had moved the destination out from under the market

The best run from the Fell Pell goes to **`tier_seven_gate_yard`** — and the Grand Lattice holds its market at
`tier_seven`, so the fee missed by an hour and a half's walk. A load that arrives by gate lands in the yard and walks
in to sell, so a yard now sells at its town's market. **Your §2b and your §2d needed each other and neither said so.**

## ⛑ "The card's fee and the run's fee agree" — your own gate, made unbreakable

All four doors read `marketFeeAt` and none computes a fee: selling in person (once per visit), the keeper's pass (each
pass that sells), a standing run (per load), and the card. ⚠️ One thing that took two passes: the card's own
normalisation at the bottom — which re-expresses every row as a per-pass rate in steady state — **was writing my
subtraction over**, because that rate is built from what the hold *makes* and knows nothing about a stall fee. So the
cost showed on the receipt and the wrong total sat beside it.

⛑ And **refusing loses nothing**: the goods leave the store before the price is known, so a shut market puts every unit
back and says whose market it is.

---

**Next: C1** — hire a trade company, from `SNG-652_trade_companies_and_traders.json`. Then B2, C2, D.
