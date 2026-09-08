# HANDOFF — the NPC sheet is the core system, and it is specced

**Aevi (PO) → CCode · 2026-09-07.** ⬜ **`po/SPEC_npc_sheet_generation.md` is ready for ROUND 2.**
> Erik: *"Did you write this all up for CCode reviews? NPC sheet generation and evolution. **It's core to
> pretty much every aspect of the game.**"*

⚑ **He is right, and the measurement says how right: 41 of 56 authored people carry NO abilities at all, and
0 of 17 encounters carry an authored `opponent.skills[]`.** ⛔ **Every fight in the game against anyone who
is not one of fifteen people is fought by a synthesis.**

---

## §1 — ⛔ WHY THIS IS THE CORE AND NOT A CONTENT CHORE

**Everything downstream reads a sheet, and each of these is a system we have built this month:**

| system | reads |
|---|---|
| ⚑ **R36 — a party member fights from their own sheet** | ⛔ **crafts, ranks, energy** |
| ⚑ **R36a — three act fully, the rest fold** | `assistTags` → `contributionsOf` |
| **`personOpponent`** | ⛔ **the whole sheet, for any named foe** |
| ⚑ **R37 — delegates grow** | `growthFor`, capacity, `skillsObserved` |
| **the presence cadence** | ⚠️ **a heroic weekly — and they arrive with what?** |
| ⚑ **R49 — a mystery needs named people** | ⛔ **`hingeNpcs` may not be empty, and empty is what they are** |
| **the encounter matrix** | ⚠️ **win rate correlated with THREAT at −0.95, because threat was the only authored number that varied** |

➡️ ⛔ **THE SHEET IS THE OBJECT ALL OF IT STANDS ON, AND IT IS AUTHORED FOR 15 PEOPLE.**

---

## §2 — ⚑ THE SPEC IN ONE SCREEN

| # | |
|---|---|
| ⛔ **§1** | **NINE OF FIFTEEN AUTHORED SHEETS ARE THIN AGAINST THEIR OWN LEVEL.** `growthFor` has carried `capacity = round(level/2)` the whole time; ⚠️ **Aevi gave eight champions eight crafts each because eight felt like enough** |
| ⚑ **§2** | ⛔ **LEVEL IS STEP ONE.** Health, energy, `breakAtPressure`, capacity and the top rank all hang off it. ⚠️ **And an opponent's level currently derives FROM THREAT — which inverts once they have a sheet** |
| **§3** | ⚑ **rank is level-bound too**, and a sheet where everything is r2 is a person with no character |
| ✅ **§3b** | ⛔ **ERIK RULED: earned crafts RAISE the cap as well as filling it** — `capacity = round(level/2) + earned.length`. ⚠️ **Otherwise braiding two crafts you own hands you a third and takes a future one away** |
| **§4** | ⚑ **the kit is drawn from EVIDENCE**: `skillsObserved` → tactic tags → role → domains → the family archetype as the floor. ⛔ **And absences are authored: `closed[]`** |
| **§5** | ⚑ **evolution is R39's loop pointed at people** — the story shows a thing, the sheet gains it, at r1, never pruning below the authored floor |

---

## §3 — ⬜ THE TWO THINGS ONLY YOU CAN ANSWER

### 3a · ⛔ `earned` HAS NO FIELD

⚠️ **MEASURED: all 36 of Silas's crafts read `source: authored`.** ⛔ **The eight earned ones are findable
ONLY because they are absent from the catalogue** — three braids and five minted or bond-taught.

➡️ ⛔ **THAT IS AN INFERENCE WHERE A RECORD BELONGS**, and §3b's rule cannot be computed reliably without
one. ⚑ **A braid is minted by the engine; it should say so when it is.**

### 3b · ⚑ DOMAINS FOR THE 41, AND NOTHING ELSE WORKS WITHOUT IT

⛔ **`kitFor` on a person with no `domains` returns `band: "open"` and draws from THE WHOLE CATALOGUE** —
⚠️ **the trap that caught Pell and Veth, and 41 people are standing in it.**

⬜ **Derivable from `assistTags`, `role` and `communityId`** — ⚑ **Aevi will author them if a derivation is
not safe, but a derivation would be better and she cannot tell from outside whether it is.**

---

## §4 — ⬜ AND THE ORDER AEVI WOULD BUILD IT IN

| # | | who |
|---|---|---|
| **1** | ⛔ **`domains` for the 41** — the prerequisite | ⚠️ **CCode derives, or Aevi authors** |
| **2** | ⚑ **the `earned` field** + §3b's capacity term | CCode |
| **3** | **generate a kit from level + domains + evidence** | CCode |
| **4** | ⚑ **let `growthFor` WRITE** — ⛔ it has been a reader since it shipped | CCode |
| **5** | ⛑ **bring the nine thin sheets to capacity** | ⚠️ **Aevi — their tags and prose already name more than 8 crafts each** |
| **6** | ⬜ **derive an opponent's threat FROM the sheet** | ⚑ **which is what stops −0.95 being the whole story** |
