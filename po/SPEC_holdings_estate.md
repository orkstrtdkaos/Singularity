# SPEC REQUEST — What a holding IS: income, defences, power, resources, capabilities

**Raised by:** Erik, 2026-09-02 · **Written by:** CCode · **For:** Aevi
**Status:** ⬜ `needs_design` — the tab is built; five of its seven panels have no model behind them

> Erik: *"The holdings should have a spot in your UI somewhere… detailed in a character sheet tab with
> income, defenses, power, resources, capabilities, personnel, capacity, etc."*

---

## §1 — ✅ BUILT, AND ⛔ WHAT IS NOT

**The tab exists** (`⌂ Holdings`, beside Traits / Chronicle / The World). Of Erik's seven:

| panel | state |
|---|---|
| ✅ **capacity** | **built** — R25's three scales, first player-facing surface they have ever had |
| ⚠️ **personnel** | **partial** — stewards, delegates, company. Real records, but a holding has ONE steward and no staff |
| ⛔ income | **no model** |
| ⛔ defences | **no model** |
| ⛔ power | **no model** |
| ⛔ resources | **no model** |
| ⛔ capabilities | **no model** |

**A holding record is, in full:**

```js
{ id, kind: "post"|"enterprise", name, locationId, steward, obligation,
  condition: "failing"|"strained"|"holding"|"thriving", claimedDay, lastMovedWorldCount, history[] }
```

⛔ **I did not mock the missing five.** A panel showing a number the engine never computes teaches the
player something false and reads, to the next author, as a built system — which is the defect this project
has spent the most time undoing.

---

## §2 — ⚠️ ONE THING HOLDINGS ALREADY DO, WHICH NOTHING EVER SAID

`melee.js` — `canRaiseBand`: **holding two places lets you raise a following even when your command slots
are too few.** ✅ Real since it was written, and no screen ever mentioned it. **The tab says it now.**

➡️ **So "power" is not a blank page** — there is one thread already tied, and the design question is whether
the rest hangs off it.

---

## §3 — ⬜ THE QUESTIONS, IN THE ORDER I WOULD ANSWER THEM

### Q1 — ⛔ Does a holding PRODUCE, and in what?

`engine/purse.js` is real: `credit(character, currency, amount, { origin })`, multiple currencies, regional
acceptance, an exchange with a spread. ⚠️ **`origin` is exactly the seam an income would arrive through.**

- Does a **post** produce, or only an **enterprise**? (The two `HOLDING_KINDS` may be exactly this split.)
- Does `condition` scale it — `thriving` pays, `failing` costs?
- ⛔ **Does an unkept holding COST money?** That would make a steward's departure bite in a currency the
  player already understands.
- **Cadence:** the world tick already moves holdings on `ASSIGN_INTERVAL_HOURS`. Income on the same beat?

### Q2 — ⚠️ Defences against WHAT?

⛔ **Nothing currently threatens a holding.** `advanceHolding` moves condition on `progress|stall|problem|
done` — the same four words delegated work answers in. There is no raid, no seizure, no rival claim.

➡️ **"Defences" implies an attacker.** ⬜ **That is a bigger design question than a panel:** does the world
contest what you hold? If it does not, a defence value is a number that never gets tested.

### Q3 — ⬜ Resources: a store, or a description?

Is a resource a **countable stock** (timber, ore, scrip) the player draws on — which needs a store, a
consumer and a refill rule — or a **descriptive tag** ("has a forge") that unlocks what can happen there?

⚠️ **The second is far cheaper and probably richer.** `holding.tags[]` read by the GM block would let a
forge matter narratively without inventing an economy.

### Q4 — ⚠️ Capabilities: is this `capabilitiesOf` at a place?

`engine/capabilities.js` and `groupCapability` already model what a *group* can do, by function family
(HARM / PROTECT / KNOW / …). ⬜ **Does a holding have a capability profile in the same vocabulary?** That
would let "the Threshold Post can KNOW" mean something concrete — and would reuse a vocabulary the engine,
the content and the model all already speak.

### Q5 — ⛔ Personnel beyond one steward

Today: `holding.steward` — **one npcId**. Erik's word is plural. ⬜ Does a holding have a roster? If so, is
it people from `npcRegistry`, or anonymous counts ("nine hands, two smiths")?

⚠️ **The anonymous form is what `contingents` already does for bands** — worth looking at before inventing
a second shape.

---

## §4 — ⬜ WHAT I RECOMMEND, IF YOU WANT A SMALL FIRST STEP

**Q3 as tags, and Q1 as income keyed to `condition`.** Both reuse machinery that exists (`holdingsForGM`
already renders a holding to the model; `purse.credit` already takes an `origin`), neither needs a new
subsystem, and together they make the two questions a player actually asks — *what is this place for* and
*what do I get for keeping it* — answerable.

⛔ **Q2 (defences) I would hold** until there is something that attacks a holding. **A defence stat with no
attacker is the clearest possible example of the panel-with-no-engine problem this spec exists to avoid.**
