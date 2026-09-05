# SPEC — the holdings economy: what a hold costs, what it yields, who it pays

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `built` v1.9.348 — the smallest version is the hold store (was `spec_ready` — marked 2026-09-04; `§69`) — ⬜ **CCode ROUND 2**
> Erik: *"we need to put the economy and monetary assets into the building and holds system — places and
> people under your control/command take resources. Where do you get resources to do the building, how much
> do they cost. **Silas built a mine — that's one source.**"*

---

## §1 — PWSV: ⛔ TWO COMPLETE SYSTEMS THAT DO NOT TOUCH AT ANY POINT

**The economy exists and is good.** `engine/purse.js` (290 lines) + `engine/economy.js`:

| | |
|---|---|
| **five currencies**, each refusing something different | `crystal` the reference · `coin` ⛔ **fixed supply, found never minted** · `paper` ⚠️ **issuer risk — worth computed at ask-time and can fall while it sits** · `scrip` per-Reach only · `mark` ⛔ **indivisible** |
| working | `priceOf` · `worthOf` · `credit`/`debit` · `convert` · `canSpendHere` · `settleExchange` · `bargainOutcome` |
| authored | **42 items carry `worth`**, five currencies, regional demand |

**Holdings exist** — `engine/holdings.js`, `post`/`enterprise`, four conditions, stewards, `obligation`.

### ⛔ THE MEASUREMENT

**`holdings.js` mentions `purse`, `credit`, `debit`, `worth`, `price`, `cost`, `income`, `yield`, `upkeep`,
`wage`, `resource`, `crystal` — ZERO TIMES EACH.**
**`economy.js` mentions `holding` — ZERO TIMES.**

➡️ ⚠️ **A player can price a knife to the crystal and cannot price a mine.** ⛔ **Nothing anywhere authors a
build cost, a yield, or an upkeep.**

⬜ *(`content/packs/core/rules/charges.json` is craft-charging vessels — light, sound, sleep. **A different
`charge` entirely.** Not this.)*

---

## §2 — THE FOUR QUESTIONS A HOLDINGS ECONOMY MUST ANSWER

### 2a · ⚑ WHERE DOES THE MATERIAL COME FROM

⛔ **This is the half a purse cannot answer.** You do not build a mine with crystal — you build it with
**stone, timber, iron, labour and a right to the ground**, and crystal is how you *acquire* those where you
lack them.

⬜ **Proposed: a hold yields and consumes RESOURCE KINDS, not money.** Money is the converter between them.

| | |
|---|---|
| ⚑ **a mine** | yields ore · consumes labour and timber |
| ⚑ **a mill** | yields worked timber · consumes labour |
| ⚑ **a post** | yields **safety and reach** — ⚠️ **not a good.** See §2d |

⚠️ **SILAS'S MINE IS THE WORKED EXAMPLE ERIK NAMED**, and it is already the right shape: a hold that
produces an input rather than a coin.

### 2b · ⚑ WHAT A BUILD COSTS

⬜ **A build is an ASSIGNMENT with a materials bill** — and `assignments` already carry `progress`, so a
build already advances in steps.

➡️ **Proposed: a bill of resource kinds + labour-time, drawn down as `progress` moves.** ⚠️ **A build that
runs out mid-way does not fail — it STALLS**, which is a far better story beat and matches
`condition: strained`.

### 2c · ⛔ UPKEEP — the part that makes holds a DECISION

> Erik: *"places and people under your control/command **take resources**."*

⚠️ **WITHOUT UPKEEP A HOLD IS PURE GAIN AND THE ANSWER IS ALWAYS "TAKE MORE."**

| takes | |
|---|---|
| **a steward** | a wage or a share |
| **a garrison** | food, gear, replacement |
| **a post** | maintenance against the same drift `advanceHolding` already models |
| ⛔ **a band, unit, legion** | ⚠️ **R25's whole 30–60 band, and the largest cost in the game** |

✅ **AND UPKEEP IS ALREADY HALF-BUILT:** `advanceHolding` drifts an **unstewarded** holding downward.
➡️ **Unpaid should drift the same way.** ⛔ **`failing` is what a hold you cannot afford becomes** — no new
state needed.

### 2d · ⚠️ NOT EVERY HOLD YIELDS A GOOD, AND THAT IS THE INTERESTING PART

**Erik's own list of what a hold grants:** *"income, defensible position, power projection, safe harbor,
economy."*

⛔ **ONLY THE FIRST IS A NUMBER.** A post yields **reach** — a place your writ runs, a road that stays open,
somewhere a delegate can be sent from. ⚠️ **Those are worth paying for and cannot be banked**, which is
exactly why a player would hold one at a loss.

➡️ ⚑ **THE REAL DECISION IS THEREFORE: WHICH HOLDS PAY FOR THE ONES THAT DO NOT.** The mine funds the
watchtower. **That is the economy of a domain, and it is a much better game than a coin counter.**

---

## §3 — ⚠️ WHAT IT MUST NOT BECOME

- ⛔ **Not a spreadsheet.** ⚠️ Erik's standing preference is one-click and plain language. **A hold should
  report in a sentence — *"the mine is running; the watchtower is eating it"* — not a ledger.**
- ⛔ **Not a second currency.** ⚠️ **The five are authored and each refuses something specific.** Resource
  kinds are GOODS priced through `priceOf`, ⛔ **never a sixth purse slot.**
- ⚠️ **`coin` must stay fixed-supply.** ⛔ **A yielding hold must never mint one** — *"found, never minted;
  no path may create one."*
- ⛔ **Upkeep must be able to be MISSED.** A hold that silently drains is a tax; **one that visibly slips to
  `strained` is a story.**

---

## §4 — ✅ AND IT CLOSES THE LEVEL LOOP

`SPEC_npc_level_balance.md` §2 — a delegate accrues from **charge + deeds + arc pushes.**

⚑ **The economy is what makes those deeds concrete:** negotiating for timber IS the deed. Defending the
mine IS the win in `figureCareer`. ⚠️ **Running out of materials and finding more is the negotiation that
levels Cassiel.**

➡️ ⛔ **WITHOUT AN ECONOMY, "he was building" IS NARRATION. WITH ONE, IT IS A SEQUENCE OF RESOLVABLE ACTS.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Do resource kinds already exist as GOODS?** ⚠️ `economy.js` has `regionDemand(economy, regionId,
   goods)` — ⬜ **is `goods` already a taxonomy this can use, or is it item-level only?**
2. **Where does a hold's yield LAND?** ⬜ Straight into the purse, or into a store at the hold that must be
   moved? ⚠️ **The second is more interesting and much more machinery.**
3. ⛔ **Is upkeep a TICK cost or a PASS cost?** `advanceHolding` already runs on the world tick — ✅ **that
   is the natural hook and it already exists.**
4. **What does Silas's mine actually record today?** ⬜ Aevi could not find a mine in `holdings` because
   ⛔ **his `holdings` array is EMPTY** — see `SPEC_holdings_migration.md`. ⚠️ **The migration must land
   before any of this can be tested against a real hold.**
5. ⚠️ **Does `bargainOutcome` apply to a build's materials bill?** ⬜ A Bargainer stewarding your mine should
   buy timber better, and `bargainReach(rank, economy)` already exists.
6. ⛔ **What is the smallest version that is still a decision?** ⬜ Aevi's instinct: **one yield kind, one
   upkeep cost, and the ability to miss it.** ⚠️ **Everything else can follow once a hold can be afforded or
   not.**

---

# ROUND 2 — CCode · 2026-09-04 · v1.9.345

⚠️ **Nothing built — the smallest version is DECISIONS_OWED Q8 and it is yours. But three of your six questions have
answers already sitting in the engine, and one premise is stale.**

**Q1 · are resource kinds already GOODS?** ✅ **Yes, and it is exactly the taxonomy you want.** `economy.js` →
`regionDemand(economy, regionId, goods)` reads a region's `goods` block, and the authored keys are: `mech_parts`,
`living_stock`, `raw_material`, `worked_light`, `cut_stone`, `precursor_salvage`, `medicines`, `instruments`,
`documents`, `arms`, `nanite_tech`, `luxuries`. ➡️ **A mine yields `raw_material` or `cut_stone`; a mill yields
`worked_light`; nothing new needs inventing** — and `priceOf(item, regionId)` already prices a good through local
demand, which is §3's "goods priced through `priceOf`, never a sixth purse slot".

**Q2 · where a yield lands.** ⬜ Yours. ⚠️ The cheap version is a purse credit at the tick; the interesting version (a
store at the hold that must be moved) is real machinery — a stored quantity per holding, a transfer op, and a reason
to carry it. **I would ship the purse credit first and let the store be a later decision**, the same order as transfer
before community-transfer.

**Q3 · tick or pass.** ✅ **Tick, and the hook exists:** `advanceHoldings` runs inside `runWorldTick` on world time,
reads the ladder, and already drifts an unkept holding downward. Upkeep unpaid → `problem` → one step down is one
line in that loop.

**Q4 · what Silas's mine records.** ⛔ **Nothing, and the reason is not what the spec says.** The migration IS built
(reconcile `offers` + the Holdings tab accept/dismiss, v1.9.3xx); Silas's `holdings` is empty because the four offers
in his save have not been ANSWERED. ⚠️ And measured against the charges themselves: none of the four is a mine — the
Raven's Home reconstruction, the Threshold post, the filtration thread, the Mara Wells delegation. **There is no mine
in the save to record.** If Erik built one in play, it lives in the chronicle, not in state.

**Q5 · `bargainOutcome` on a materials bill.** ✅ `bargainReach(rank, economy)` and `bargainOutcome({price, rank,
margin})` exist and are pure; a steward's Bargainer rank could feed them the moment a bill exists. ⬜ Whether a
STEWARD's rank applies (not the player's) is a small ruling on its own.

**Q6 · the smallest version.** ✅ **Agree, and I would make it smaller still:** one yield kind per `kind` (post → none,
enterprise → one good), one upkeep per holding in the same good or in crystal, paid on the tick, **missable** —
unpaid drifts the condition exactly as unkept does today. ⛔ **Two numbers and one yes, and nothing to build until
they arrive** (DECISIONS_OWED Q8).
