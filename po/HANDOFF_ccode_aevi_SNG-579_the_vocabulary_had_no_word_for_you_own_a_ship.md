# HANDOFF SNG-579 — Your three ship quests are the only 8 outcomes in the corpus that change nothing but a sentence

**CCode → Aevi (PO) · 2026-09-13 · v1.9.519 · Erik, twice: "we need moving holds/enterprises as well"**

---

## §1 — ⛑ YOUR NOTE WAS RIGHT AND IT WAS ONLY HALF THE BLOCKER

`the_first_season._authoredWhy`: *"⛔ DEPENDS ON `SPEC_mobile_holdings` — until `carriage` lands, the reward
has nowhere to live and the GM should hold this at stage 3."*

⛑ **Carriage landed.** ⛔ **And the reward still had nowhere to live**, because `applyQuestEffects` had fifteen
effect types and **not one of them could grant a holding** — or teach a craft.

## §2 — ⚑ THE MEASUREMENT, WHICH NEEDS NO READING OF PROSE

| authored outcomes across all 24 quests | **59** |
|---|---|
| change something real | 51 |
| ⛔ **change nothing but a sentence** | **8** |

**All eight are your three mobile-holdings quests.** `the_first_season` (enterprise, a_ship) ·
`the_take_that_stops_her` (hull_and_ally, hull_alone, she_stops) · `the_tenth_season` (taught,
landing_at_cost, tenth_refused). Every one carries exactly one `world_fact` and nothing else.

⚠️ **AND NOTHING WAS RED.** The seam auditor gates that every effect type *used* is *handled* — `world_fact`
is handled — so a quest promising a longship passed every gate it has. **A vocabulary with no word for the
thing the story just did is a quieter failure than a typo.**

## §3 — ⛑ TWO NEW WORDS, BOTH SHIPPED AND GATED (§216, 13 checks)

**`holding`** — grants a holding, or gives one you already hold a carriage.

```json
{ "type": "holding", "name": "The Longship", "kind": "enterprise", "at": "keelmouth",
  "carriage": { "moves": "crewed", "needsCrew": 4, "speed": 1.4 } }
```

Naming an **existing** holding gives that one a carriage instead of minting a twin — *"the Fell Pell gets
wheels"* is the same sentence as *"you are given a ship"*, one field apart:

```json
{ "type": "holding", "id": "fell_pell", "carriage": { "moves": "living", "bearerId": "corvane" } }
```

⛑ Mints through `addHolding` — the same door the player's own claim uses, so it carries the id, day, ledger
and history everything else expects. ⛔ The carriage is validated through `carriageOf`: a kind the engine does
not have (your §209 lesson — I wrote `"hauled"` into the GM contract myself) leaves **no phantom**, and says
so. A refusal (`"a family is not a holding"`) grants nothing and says that too.

**`teach`** — hands over a craft, through the same `learnAbility` the Level-Up modal uses, `free`.

```json
{ "type": "teach", "abilities": ["break_the_line", "who_falls_first", "small_company"] }
```

**Driven end to end:** granted longship → `canSail` refuses at 0 crew (*"needs 4 aboard"*), sails at 4 aboard,
**4.29 days** to Echo River Crossing at speed 1.4.

## §4 — ⚠️ AND TWO THINGS THAT ARE YOURS AND ERIK'S, NOT MINE

**a · `taught` can currently deliver ONE of the three crafts it names.** All three are `tradition: marcher`;
Silas is ashwarden / cogitant / figurist. `small_company` (tier 3) reaches him; `break_the_line` and
`who_falls_first` (tier 4) are refused **"outside your domains"**. ⛑ The refusal is now *reported with its
reason* rather than dropped, so the GM can play the lesson that does not land — but **whether Orrun's teaching
should also open the marcher domain is a ruling, not a bug.** `acquireDomain` exists; I have not wired a
`domain` effect, because handing over a whole domain in an ending is your call and Erik's.

**b · ⛔ `she_stops` is correctly text-only and should stay that way.** *"…and gained nothing you can sail."*
Its effects match its prose exactly. **It is in the count of 8 and it is not a defect** — I am naming it so
the number does not read as eight things to fix.

## §5 — ⬜ WHAT I HAVE NOT DONE

**I have not edited your quests.** The words exist; the authoring is yours. ⚠️ Note `the_first_season`'s id
slugifies to `the-first-season` at resolve time, so an effect targeting a holding by id should use the id you
want on the record, not the quest's.

⚑ **And one number worth keeping:** across every save, **0 of 5 holdings has ever carried a carriage.** The
engine has been whole since §209; from this commit, content can finally hand one over.

— CCode
