# SPEC — the hold store: it runs itself, you boost it, and it can be robbed

**Author:** Aevi (PO) · **2026-09-04** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Answers:** `DECISIONS_OWED_20260904.md` **Q8**, and Erik's follow-on constraints.
**subject:** holdings-economy

> Erik: *"Things you produce need to accumulate at the hold. You can use the raw material elsewhere,
> execute trade contracts with it, or sell it on the market. It also makes you a target for bandits, so
> you'll need to protect it. **However, I don't want to make this a whole chore to manage** — it needs to
> set itself up, you can use your skills to boost it, your delegates and stewards to boost it, but **in the
> end it should run itself while you're not looking, like the world ticks.** If your mine is thriving it
> should **more than just pay for the steward costs — it should make quite a bit of profit.**"*

---

## §1 — ⛔ THE GOVERNING CONSTRAINT: THIS IS NOT A MANAGEMENT GAME

**Erik's line is the design, not a preference:** *"I don't want to make this a whole chore to manage."*

| ⛔ never | ✅ instead |
|---|---|
| a per-tick decision the player must make | ⚑ **it runs on the world tick, unattended, like everything else** |
| a screen you must visit | ⚑ **a sentence in the news** — *"the mine is running; the watchtower is eating it"* |
| assigning workers, setting rates | ⚠️ **it sets itself up on claim** |
| a ledger to reconcile | a number you can look at if you want to |

➡️ ⚑ **THE PLAYER'S VERBS ARE BOOST, PROTECT, AND SPEND — never MANAGE.**

---

## §2 — THE STORE

⬜ **Production accumulates AT the hold**, not in the purse:

```
holding.store = { raw_material: 34, cut_stone: 0, … }      // goods kinds, per economy.js
```

⚠️ **Why at the hold and not the purse:** ⛔ **because it can then be taken, moved, contracted and sold —
and because a mine full of ore you cannot get to market is a real problem.** ✅ **It makes roads, reach and
`waygate` matter for a reason other than travel.**

**Four exits, and the player picks per situation:**

| exit | what it needs |
|---|---|
| ⚑ **use it** | crafting, building another hold, repairing this one |
| ⚑ **trade contract** | a standing agreement — ⬜ ties to `struck_term` / the Bargainers |
| ⚑ **sell on the market** | ⚠️ **`regionDemand` already prices the same ore differently by region** |
| ⚑ **let it sit** | ⛔ **and become a target — §4** |

---

## §3 — ⚑ IT RUNS ITSELF, AND A THRIVING HOLD IS GENUINELY PROFITABLE

**On each tick, per hold:** `yield(condition) → store` · `upkeep → purse` · condition drifts per
`advanceHolding` — ✅ **all of which already runs.**

⛔ **ERIK: "IF YOUR MINE IS THRIVING IT SHOULD MORE THAN JUST PAY FOR THE STEWARD COSTS — IT SHOULD MAKE
QUITE A BIT OF PROFIT."**

⬜ **Illustrative shape — CCode prices it, but the CURVE is the ruling:**

| condition | yield | upkeep | net |
|---|---|---|---|
| **thriving** | ⚑ **8** | 6 | ⚑ **strongly positive — the point of holding it** |
| holding | 4 | 6 | ⚠️ **near break-even** |
| strained | 2 | 6 | ⛔ **you are subsidising it** |
| failing | 0 | 6 | ⛔ **pure drain — release it or fix it** |

⚠️ **THE CURVE MUST BE STEEP, NOT LINEAR.** ⛔ **A thriving hold is not 2× a holding one — it is the
difference between an asset and a chore.** ➡️ **That is what makes `condition` worth defending, and what
makes R25's `presence` milestones (which keep an unstewarded hold from slipping) worth having.**

---

## §4 — ⛔ A FULL STORE IS A TARGET

> Erik: *"It also makes you a target for bandits, etc. So you'll need to protect it."*

⚠️ **The store is the first thing in the game that is worth stealing and cannot run away.**

| | |
|---|---|
| **risk rises with store size** | ⚑ **a full mine invites what an empty one does not** |
| ✅ **`dangerLevel` already exists** on 127 locations | the hold's own region prices the threat |
| ⚑ **defence is a hold ATTRIBUTE** | `SPEC_holding_attributes.md` §3b — garrison, defensible position |
| ⛔ **a raid is an EVENT, not a tax** | ⚠️ **it should arrive as news and be answerable** — the player can ride out, or the garrison handles it, or they lose the store |
| ⚠️ **and it can be a DEBT holder's move** | ⛔ **`SPEC_debts_and_reception.md` §4b escalation 4 — a hit squad sent by someone who remembers.** ➡️ **Robbing your mine is what an angry Kestrel does** |

➡️ ⚑ **SO SHIPPING THE STORE IS ITSELF A DECISION:** move it and it is exposed on the road; leave it and it
is exposed at the hold. ⛔ **Neither is safe, and that is the game.**

---

## §5 — BOOSTING IT: the player's actual verbs

⛔ **Not management. Investment.**

| boost | how |
|---|---|
| ⚑ **a better steward** | ⚠️ **already modelled** — an unstewarded hold cannot climb past `holding` (R25) |
| ⚑ **your own craft** | ⚠️ `stonewise` on a mine, `sound_repair` on a mill — **the craft you already carry, applied to a place** |
| ⚑ **delegates** | more people, more capacity — ⬜ ties to R25 delegation capacity |
| **defence** | a garrison converts risk into cost |
| **the ground** | ⬜ `substrateSource` and `meaningDensity` — a hold on good ground yields better |

⚠️ **AND EACH IS A ONE-TIME ACT WITH A LASTING EFFECT** — ⛔ **never a per-tick chore.**

---

## §6 — ROUND 2 QUESTIONS

1. **Does `regionDemand` already price goods per region well enough** to make *where you sell* a real
   decision, or does it need demand that MOVES?
2. ⛔ **How does the store get to market?** ⬜ Is moving goods an assignment (a delegate hauls it), an
   automatic sale at a discount, or the player's own travel? ⚠️ **The first is the most interesting and
   reuses `assignments`.**
3. **Should a trade contract be an `obligation` on the holding**, since that field exists and means
   *"what this place owes"*?
4. ⚠️ **Where does a raid resolve?** ⬜ `random_encounters.js` and `contingentsFromPeople` both exist —
   **can a raid be a party drawn from a hostile community rather than a generic band?**
5. ⬜ **How steep is the yield curve?** §3 sketches 8 / 4 / 2 / 0 against an upkeep of 6. ⚠️ **Erik's ruling
   is that thriving must be clearly profitable; the numbers are CCode's to price.**
6. ⛔ **What happens to the store when a hold is RELEASED or TRANSFERRED?** ⚠️ `releaseHolding` and
   `transferHolding` shipped yesterday and neither knows about goods.

---

## ✅ CCODE ROUND 2 — 2026-09-04 · BUILT v1.9.348 · gated `§69`

**Built as specced:** `holding.store = { goods: units }` fills on the world tick — `yieldByCondition` (8 / 4 / 2 / 0) of
`raw_material` for an enterprise, upkeep 14 crystal from the purse (arrears when it cannot pay), a full store (40) a
target, raids as news, `sellStore` where you stand. Release forfeits, transfer carries. `HOW_IT_WORKS.md` §7d.

**The curve, priced (§6 Q5):** a unit is `worthBands[useful] = 4 × need × scarcity` where it is SOLD. At ordinary demand a
pass nets **thriving +18 · holding +2 · strained −6 · failing −14** — an asset, break-even, a subsidy, a drain. Where the ore
is wanted (the Ascent reads raw_material as high need, scarce → 14.4 a unit) thriving nets **+101** a pass; a season of
32 passes is a real fortune. ⚠️ Erik turns `upkeepByKind` and `unitWorthBand`; the shape holds at any setting because
yield is the steep term.

**§6, answered:**
1. **`regionDemand`:** it prices well enough to make WHERE you sell a decision already — the same 20 units are 80 crystal
   at ordinary demand and 288 at the Ascent. Demand that MOVES (`shiftNeed` from arc stages) is already read by `priceOf`;
   the store's `unitWorth` reads the static row today. ⬜ Wire `shiftNeed` in when an arc should move ore prices.
2. **How it gets to market:** ⛔ NOT built — you sell where the store stands, and `sellStore` refuses elsewhere and says so.
   Your first shape (a delegate hauls it — an assignment) is the right one and reuses `assignments`; it needs a decision on
   what a haul costs and risks on the road. Logged, not decided.
3. **Trade contracts as an `obligation`:** plausible — `obligation` is "what this place owes" and a standing sale is that.
   ⬜ Not built; needs the Bargainers' `struck_term` shape.
4. **Where a raid resolves:** as NEWS today — chance `raid.base × dangerLevel × fill`, halved by an authored `defence` or
   `garrison`, taking `takeShare`. ⬜ A raid as a PARTY from a hostile community (`contingentsFromPeople`) is the same
   decision as the debt spec's escalation 4 — one shape for both.
5. **How steep:** 8 / 4 / 2 / 0 against 14, above. Thriving is 2× holding in yield and ~9× in net.
6. **Release / transfer:** release FORFEITS the store (`storeForfeited` on the former record — the loss is a fact); transfer
   CARRIES it with the place (`storeCarried`). ⚠️ Arrears go with the place on transfer too.
