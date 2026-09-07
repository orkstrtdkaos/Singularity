# SPEC — what a hold costs: building, keeping, warding, and asking

**Author:** Aevi (PO) · **2026-09-06** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** holdings-economy, hold-features
> Erik: *"Come up with a cost and benefits for each. **We shouldn't be adding these for free** to a place if
> they're built — they can come with features if they arrive narratively. I want **crafts applied to cost
> energy** and either have **energy upkeep or last certain durations before refresh** if they are ground
> modifiers or defense. I want **more of the people I know to be able to be asked to come work them.**"*

---

## §1 — ⛔ MEASURED: EVERYTHING IS FREE

| path | costs today |
|---|---|
| ⛔ **`addFeature`** | **NOTHING.** 38 kinds, no cost on any of them. A keep and a hearth are the same price |
| ⛔ **`improveHolding`** | ⚠️ **NOTHING, AND IT IS PERMANENT.** Apply a craft, the hold climbs a rung, forever, once per craft |
| **`setCrew` / `setGarrison`** | ⚑ **names, no wage** |
| **upkeep** | ✅ **exists** — but by KIND, and `post` is **zero** |

⚠️ **So a player can put a keep, a ward-line, a mine and a temple on a post in one turn, spend nothing, and
pay nothing to hold them.**

---

## §2 — ⚑ WHAT A FEATURE COSTS: THREE NUMBERS, ONE TABLE

⬜ **Every kind gains `build` (goods + labour-days), `upkeep` (per pass), and keeps its benefit.**
⛔ **THE PRINCIPLE: the cost is what the thing IS, not what family it is in.**

### material — pays for itself or it should not exist
| kind | build | upkeep | benefit |
|---|---|---|---|
| **mine** | 12 cut_stone · 20 days | ⚑ **4** | `raw_material` |
| **quarry** | 8 raw_material · 16 days | 3 | `cut_stone` |
| **mill** | 10 cut_stone · 14 days | 2 | `raw_material` |
| **workshop** | 8 mech_parts · 12 days | 3 | ⚑ its own `yields` |
| **herd** · **fishery** | 6 living_stock · 10 days | 2 | `living_stock` |
| **kiln** | 6 cut_stone · 8 days | 2 | `cut_stone` |
| **still** | 6 medicines · 10 days | 2 | `medicines` |
| ⚑ **lens_works** | ⛔ **20 worked_light · 30 days** | ⛔ **6** | `worked_light` — ⚠️ **the most expensive material kind, because Blaze-work is** |

### martial — ⛔ COSTS NOTHING TO BUILD AND EVERYTHING TO KEEP
| kind | build | upkeep | benefit |
|---|---|---|---|
| **wall · barrier · gate** | 10 cut_stone · 12 days | ⚑ **1** | defence 1. ⚠️ **stone is cheap to keep** |
| **tower** | 18 cut_stone · 20 days | 2 | defence 2 |
| **keep** | 40 cut_stone · 60 days | 4 | defence 3 |
| **muster_yard** | 4 raw_material · 6 days | 1 | defence 1, a band forms here |
| ⛔ **sentries · watch · ward_line** | ⚠️ **cheap to build** | ⛔ **6 · 8 · 5 — THE HIGHEST IN THE GAME** | ⚑ **`watch: true` — and R46a says only a WATCH turns a raid into a fight** |

⛔ **THE ASYMMETRY IS THE DESIGN. STONE IS BUILT ONCE AND STANDS. PEOPLE MUST BE PAID EVERY PASS**, and
*"stone does not see."* ⚠️ **A player who cannot afford the watch has a wall and a raid they do not get to
answer.**

### people — the ones that make the others possible
| kind | build | upkeep | benefit |
|---|---|---|---|
| **keepers_hut** | 4 raw_material · 6 days | 1 | +1 hand, residents |
| **quarters** | 10 raw_material · 12 days | 2 | +2 hands, 4 residents |
| **longhouse** | 16 raw_material · 20 days | 3 | +3 hands |
| **infirmary** | 8 medicines · 12 days | ⚑ **3** | +1 hand · ⬜ **`woundedUntilDay` runs faster here** |
| **market** | 6 cut_stone · 10 days | 2 | ⚑ **`trade: true` — `canSpendHere`, and a better `priceOf`** |

### craft — ⛔ AND A WAYGATE IS NOT LIKE THE OTHERS
| kind | build | upkeep | benefit |
|---|---|---|---|
| **smithy · stable** | 6 · 8 days | 1 | repair · travel |
| **forge** | 12 mech_parts · 16 days | 2 | make arms and tools here |
| **scriptorium · school_room** | 10 documents · 14 days | 2 | ⚑ **`learnedAt` — R33's other end** |
| **laboratory** | 16 instruments · 24 days | 4 | research, `projectTicks` |
| **relay_station** | 8 mech_parts · 12 days | 3 | ⚑ **`service: true` — the runner fees** |
| ⛔ **waygate** | ⛔ **CANNOT BE BUILT** | ⛔ **12 — the largest upkeep in the game** | ⚠️ **Twenty-seven exist. You do not build one; you come to hold one, or you MAKE one and that is a story, not a purchase** |

### meaning — ⚑ CHEAP TO RAISE, AND THEY ASK FOR ATTENTION INSTEAD
| kind | build | upkeep | benefit |
|---|---|---|---|
| **hearth · shrine** | 2 · 4 days | ⚑ **0** | aura 0.1, 1 pilgrim |
| **memorial · grave_ground** | 6 cut_stone · 8 days | 1 | aura 0.15 · ⚑ **`attends`** |
| **reclamation_bowl** | 8 · 12 days | 1 | aura 0.2 · `attends` |
| **temple** | 20 cut_stone · 30 days | 3 | aura 0.2 · 2 pilgrims · ⚑ **a substrate pool** |
| **temple_to_attending** | 24 cut_stone · 36 days | 4 | aura 0.25 · `attends` · a pool |

⛔ **A HEARTH COSTS NOTHING TO KEEP AND THAT IS CORRECT** — ⚠️ **a fire nobody lets go out is kept by the
people living there, not by your purse.**

---

## §3 — ⛔ AND FEATURES ARRIVE THREE WAYS, NOT ONE

> Erik: *"they can come with features if they arrive narratively."*

| ⬜ | cost |
|---|---|
| ⚑ **BUILT** | ⛔ **the full price above** — goods and labour-days, drawn from the store |
| ⚑ **INHERITED** | ⛔ **FREE.** A post that already had a mine when you claimed it came with one — ⚠️ **`inferFeatures` already reads this from the description and is the right path** |
| ⚑ **GRANTED** | **free, and it is a story.** Someone builds it for you, a community raises it, a debt is paid in stone |

⚠️ **AND ONLY *BUILT* CHARGES.** ⛔ **The other two still pay UPKEEP** — ➡️ **which is the honest asymmetry:
you can be given a keep and still not afford to man it.**

---

## §4 — ⚑ CRAFT ON A PLACE: ENERGY, AND IT DOES NOT LAST FOREVER

> Erik: *"I want crafts applied to cost energy and either have energy upkeep or last certain durations
> before refresh if they are ground modifiers or defense."*

⛔ **TODAY `improveHolding` COSTS NOTHING AND LASTS FOREVER.**

⬜ **Proposed — the cost is the craft's own, and the duration is what it DOES:**

| what the craft does | cost | lasts |
|---|---|---|
| ⚑ **MAKES a thing** — a wall raised, a shaft cut, a mend that holds | ⛔ **energy × a build multiplier, once** | ⚑ **PERMANENT.** It is a thing now, and things need upkeep, not renewal |
| ⛔ **MODIFIES THE GROUND** — a substrate pool, a meaning aura, a ward-line | ⛔ **energy once, THEN ENERGY UPKEEP or a DURATION** | ⚠️ **a season, then it needs refreshing** |
| ⛔ **DEFENDS** — a standing ward, a warded threshold | **energy once** | ⚠️ **a season** |

⚑ **THE TEST IS WHETHER THE CRAFT LEFT SOMETHING BEHIND.** ⛔ **A mason who cuts a shaft has made a mine and
can walk away. A warden who holds a ward-line IS the ward-line, and when they stop, it stops.**

⬜ **`improvements[]` gains `expiresDay` and `refreshCost`.** ⚠️ **An expired improvement does not remove the
feature — it removes its BENEFIT**, and the hold reports it: ⚑ *"the ward-line at Stillwater's Trouble has
gone quiet."*

⛔ **AND R47'S FLOOR APPLIES: at zero energy you cannot raise a ward, and that is a real consequence of
having spent yourself elsewhere.**

---

## §5 — ⚑ ASKING PEOPLE TO COME

> Erik: *"I want more of the people I know to be able to be asked to come work them."*

⛔ **TODAY: `isRecruitable` REQUIRES BAND ≥ ALLY** — `RECRUIT_BANDS = ["devoted", "ally"]`. ⚠️ **Of 48
registered people, very few clear that**, and the ones who do are already with you.

### ⬜ THE CORRECTION: WORKING FOR SOMEONE IS NOT TRAVELLING WITH THEM

| ⬜ ask | needs | what they do |
|---|---|---|
| ⚑ **come and WORK** | ⛔ **a much lower bar — `known` and not hostile** | crew, hands, a trade they have |
| ⚑ **come and KEEP** | **the delegate bar** — `PROPOSAL_delegate_tiers` | keeper of a hold |
| ⚑ **come and TRAVEL** | ⛔ **band ≥ ally, unchanged** | the company |

⚠️ **THE CURRENT GATE ASKS THE TRAVELLING QUESTION OF EVERY ASK.** ⛔ **Bren Thalle is two dry seasons
behind with two children — she does not need to be devoted to you to take paid work at a mill.**

⬜ **And what they bring is on their record already:** `assistTags` says what they are good at; `domains`
says what they know; ⚑ **an `infirmary` staffed by someone with `tend` is worth more than one staffed by a
smith.**

⛔ **AND A WAGE MAKES IT REAL.** ⚠️ **Crew are `hands` today with no cost.** ➡️ **A person asked to work is
paid, and the upkeep numbers above assume it** — ⚑ **which is what makes *"who can I afford"* a question
worth asking, and what makes Pell's forge paying into the household purse matter.**

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Where does `build` draw from?** ⬜ The hold's own store, the player's purse, or either? ⚠️ **Aevi's
   read: the STORE first, purse second, and a build that cannot be paid STALLS rather than fails** —
   `SPEC_hold_store` §2b already ruled that shape.
2. **Are labour-days real, or flavour?** ⬜ `projectTicks` exists and `hands: 1 + party.length` is already
   the labour model — ⚑ **a build may simply BE a project, which would need no new machinery at all.**
3. ⚠️ **Does an expired ground-modifier get a grace period?** ⛔ **A ward that lapses the pass you are 300
   miles away is a punishment for travelling.** ⬜ Aevi's read: it reports one pass before it lapses.
4. ⬜ **What is a wage?** ⚑ The upkeep numbers assume crew are paid from it. ⚠️ **Erik's number, and it is
   the one that makes the whole table balance or not.**
5. ⛔ **Does asking someone to work COST standing if they refuse?** ⬜ Aevi's read: **no** — asking is free,
   ⚠️ **but asking someone who is already keeping something else should be visible as taking them off it.**
