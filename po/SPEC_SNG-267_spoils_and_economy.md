# SPEC — SNG-267: SPOILS AND THE VALLEY ECONOMY
## Aevi (PO) · 2026-08-02 · Erik: "why are we fighting things? … we should be able to take gear and items off
## the defeated, or harvest something useful — valuable things. We don't have a system for that, and that
## probably means we need a money and buying system too."

## WHAT EXISTS TODAY (verified, not assumed)
| thing | status |
|---|---|
| items with `bonusTags`, evolution, grants, provenance | **✅ rich and live** |
| `inventoryAdd` / `inventoryRemove` via GM `characterDeltas` | **✅ live — loot has a real path already** |
| `engine/inventory.js` (add, dedupe, name, pin, uses) | ✅ live |
| **any currency at all** | **❌ NONE. Zero occurrences.** |
| **any item VALUE / price** | **❌ NONE.** An item record is id·name·kind·description·bonusTags·consumable |
| **loot / drops / harvest** | **❌ NONE** |
| **buying, selling, shops** | **❌ NONE** |
**So the honest scope: the ITEM half is mature and the VALUE half does not exist at all.** Loot doesn't need a
new inventory system — it needs a **reason to exist** and **something to convert into.**

## ⚠️ THE DESIGN QUESTION UNDER ERIK'S QUESTION
*"Why are we fighting things?"* — the answer must not become **"to farm them."** A generic drop table turns
every creature into a vending machine, and it would fight everything the bestiary pass established: those 26
creatures were given bodies, affinities and authored answers precisely so encounters would be *problems*, not
*resources*. **The spoils system has to reward the fight without making the fight the point.**
**Three rules I'd hold to, and they fall out of content that already exists:**

### RULE 1 — WHAT YOU GET IS WHAT IT WAS, NOT A DROP ROLL
The bestiary already carries **`class`**, and it answers the harvest question by itself:
| class | what it leaves | why |
|---|---|---|
| `manifested_creature` | **NOTHING** | glimmerlings *"wink out like the fiction they are"* — **a manifestation has no body to loot**, and that is already authored |
| `warped_beast` | **materials** — hide, sinew, the warped organ | it is flesh; it leaves flesh |
| `feral_construct` | **parts** — plating, a directive-core, precursor components | it is a machine; the salvage rings already exist to buy these |
| `made_weapon` | **gear** — because it *was* a person, and it carries what it was given | the most uncomfortable loot in the game, correctly |
| `great_manifestation` | **a residue, singular** | not a resource — a story object |
**This kills the vending-machine problem at the root: half the roster leaves nothing, and the fiction already
said so.**

### RULE 2 — HARVEST IS A CRAFT CHECK, NOT A FREE PICKUP
The catalog already has the crafts: `greenlore` (reads an ailment, knows the plant), `stone_read`,
`tinkers_hand` (*"diagnose any mechanism by touch"*), `keen_appraisal` (*"read an object's history from
wear"*), `old_roads` (*"salvage safely"*), `hunters_strike` r3 (***"nothing is wasted — the strike, the taking,
the use"***).
**`hunters_strike` r3 is the thesis statement for this whole system and it is already written.** A hunter who
strikes clean harvests clean; a botched kill ruins the hide. **That is the mechanic, and it makes HOW you won
matter — which is exactly the answer to "why are we fighting."**

### RULE 3 — VALUE IS LOCAL AND SOCIAL, NOT A GOLD PIECE
⚠️ **This world should not have gold.** The Transition ended the pre-Transition economy; what the Valley
actually runs on is what the lore and my own authored content already show: **charters** (the licence trade),
**obligations** (the High Seat's patronage), **bargains** (the Hollow Market, `the_offered_price`), and
**standing** (`reputation.js`, already live with `weight` and `spread`).
**PROPOSAL — a three-layer economy, and only the first layer is new:**
1. **BARTER-WEIGHT (`worth`)** — a NEW numeric field on items. Not a price: **a rough trade-weight**, so a
   Marcher's Blade and a sack of grain can be compared. This is the minimum viable "money" and it is one field.
2. **THE MARK** — the Valley's actual near-currency: **a tally of settled obligation.** Cast metal or scrip is
   worthless where nobody honours it; a Mark is *"X owes me, and the community knows."* **It ties directly into
   the live `reputation.js` `spread` mechanic** — a Mark is only good where the deed that earned it travelled.
   **That is a currency with GEOGRAPHY, and it is far more interesting than coins.**
3. **STANDING** — already live. Buys what money cannot: access, charters, a Mercy-House bed, the Quiet Hands
   moving you.

## WHAT I'D BUILD FIRST (smallest thing that answers Erik's question)
1. **Add `worth` to the item schema** (one field) and backfill the existing catalog. Nothing else changes.
2. **Add `spoils` to the bestiary roster** — keyed on `class`, per Rule 1. **26 entries, and half of them are
   "nothing."**
3. **Harvest as a craft check** gated on the crafts above, with `hunters_strike` r3 as the clean-kill bonus.
4. **Traders as NPCs, not shops.** The Valley has no shop UI and should not get one — **a trader is a person
   with wants**, and the `wants`/`fears` NPC fields already exist. **Buying is a conversation, which is what
   this game is good at.** The Hollow Market, the salvage rings, and the Quiet Hands are all already authored
   as places to sell things.
5. **The Mark last** — it is the richest piece and the one most likely to need play data first.

## WHAT I WOULD *NOT* BUILD
- **No gold, no shop screen, no drop tables.** Each of them would flatten something the world already does
  better.
- **No loot from `manifested_creature`s, ever.** It contradicts authored fiction and it is the guardrail that
  keeps the system honest.

## ERIK'S CALLS
1. **`worth` as a raw number, or as bands** (worthless / useful / valuable / precious / irreplaceable)? **I lean
   BANDS** — this game has consistently preferred legible qualitative tiers over false precision, and bands
   survive a GM narrating a trade far better than "37 marks."
2. **Is the Mark right?** It is the piece I am least certain of and the one I like most — a currency whose value
   depends on whether your reputation reached that valley.
3. **Should party-facing loot include GEAR from `made_weapon` foes?** It is the most uncomfortable loot in the
   game — taking the blade off a person who was unmade into a weapon. **I think yes, and I think it should cost
   something to do.**
