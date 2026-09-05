# CCODE REVIEW — `PLAN_20260905.md`

**CCode · 2026-09-05 · measured against HEAD (v1.9.355).** Erik: *"read it and review — adding additional stuff
that you know we need."*

⚠️ **THE PLAN IS RIGHT ABOUT WHAT MATTERS AND WRONG IN THREE PLACES, AND ALL THREE ARE THE SAME SHAPE:** a gap
stated one layer shallower than it is. Each correction makes the ask BIGGER, not smaller, so none of them is a
reason to defer.

---

## §1 — ✅ HER FEATURE PASS, MEASURED: CLEAN, WITH ONE DARK FIELD SHE DID NOT FLAG

**33 kinds · material 9 · martial 8 · meaning 6 · people 4 · craft 6.** Every kind carries an effect field —
⚑ **no kind is decoration**, which is the failure this catalogue could most easily have had.

⛔ **THREE AUTHORED FIELDS HAVE NO READER, AND SHE NAMED ONLY TWO OF THEM:**

| field | on | flagged? |
|---|---|---|
| `attends: true` | `temple_to_attending`, `grave_ground` | ✅ her §2c |
| ⛔ **`trade`** | **`market`** | ⛔ **NOT FLAGGED — a fourth dark field** |

⚠️ **`trade` is the smallest of the three and the only one whose reader already exists:** her own
`SPEC_holding_attributes` §3a says *"trade access — a market where `priceOf` improves, or a currency accepted
here | `canSpendHere` exists"*. ➡️ **A hold with a market should move `priceOf` where it stands, or make a
currency spendable there.** ⬜ One line of content decides which; I build it either way.

---

## §2 — HER THREE ASKS, CORRECTED

### 2a · ⛔ THE GAP IS ONE LAYER DEEPER: **AN NPC CANNOT HOLD AN ITEM AT ALL**

✅ **Her measurement of `evolution.js` is exact** — `character.practice.coUse`, `character.inventory`,
`character.companionBonds`, and an NPC has none of the three.

⛔ **AND UNDER IT, MEASURED ON SILAS'S SAVE: 0 of 35 registry entries carry an inventory.** Nothing in
`engine/` or `app.js` ever writes one. `npcUpdates` has no items channel. Pell's record is
`id, name, role, description, firstMet, relationship, history, knownFacts, skillsObserved, status, statusNote,
lastSeen, bondType, bondStage, gender, pronouns, image, aliases, nameRevealed, domains, met` — ⚠️ **and no
inventory.** ➡️ **"Memory is carried by Pell" is fiction with no record anywhere in the engine.** Evolution is
the second problem; the first is that there is nothing to evolve.

⛔ **AND ONE CLAIM IS FALSE, MEASURED:** *"The Warden's Charge and the brigandine were authored to grow and have
no path to."* — **both carry `evolution: false`.** ⚑ **`memory` is the ONLY one of the three with an evolution
block** (`bondSource: huginn`). ➡️ Either author evolution on the sword and the brigandine, or drop the claim;
today they would not grow even in the player's own hands.

**✅ THE BUILD, IN ORDER (mine):**
1. ⚑ **A BEARER RECORD.** `inventory`, `practice`, `bonds` on a registry entry — the same three fields, on the
   person. Nothing else in the engine changes shape.
2. **`evolution.js` takes a BEARER, not a character.** ⚠️ It is already bearer-shaped: three field reads and a
   catalog. This is a rename plus a caller.
3. ⛔ **AN ITEM CHANNEL** — `npcUpdates` gains `items` (or `itemUpdates` gains a bearer), so *"Silas lends her
   the original"* is a fact the engine holds.
4. ✅ **THE TICK REFRESHES EVERY BEARER**, unattended — Erik's *"so it evolves itself when the time comes."*

⛔ **AND A CORRECTION TO THE MECHANIC, WHICH IS WHY MEMORY IS THE RIGHT TEST CASE.** Her question — *"its
`deathRegister` accumulates on endings it was present for — whose endings now?"* — has a clean answer, and it is
not "the bearer's": **co-use is a fact about a SCENE, not about a seat.** The item was used, and the bond source
was present. ➡️ Under that rule Memory grows in Pell's hands while Huginn flies with the same company, which is
exactly the fiction. ⚠️ Under a bearer-only rule it never grows again, and the ask would land inert.

### 2b · ⚠️ RANK 3 **IS** READ — AND THE FINDING IS THE OTHER SIDE OF IT

⛔ **Her question is *"does anything READ rank 3?"* and the answer is YES.** `skill_battle.js:1346` — a soak
layer survives when `rank > penetration`; a layer is stripped only when `penetration ≥ its rank`. Rank 3 is read
by every blow in the game.

⛔ **THE REAL MEASUREMENT, AND IT IS THE ONE THAT MATTERS:**

| | |
|---|---|
| crafts in the corpus | **421** |
| crafts with `penetration` | ⛔ **ONE**, and it is **2** |
| crafts with `pierce` | two (0 and 4) |
| synthesized layer ranks | `soakRankAt: [0, 3, 6]` — ⚑ **rank 3 already exists on any foe with soak ≥ 6** |

➡️ ⚑ **A RANK-3 WARD IS NOT UNREAD. IT IS UNPIERCEABLE BY EVERY CRAFT IN THE WORLD** — and so is the third layer
of ordinary armour, today, on foes nobody has noticed it on. ⚠️ **That is a ruling for Erik, not a build:** is
rank 3 meant to be absolute, or does the corpus owe a handful of `penetration: 3` crafts so that the best ward can
still be answered? ⛔ **A ward nothing can pierce is a wall the game cannot route around**, and this project has
ruled against exactly that shape three times.

**What I will build without a ruling, because both halves are honest:**
- ✅ **the moment** — `showBraidMoment` on a first-in-the-world working. Small, and the house format exists.
- ⛔ **the RESULT, SHOWN** — the damage receipt already computes which layers held and which were stripped **and
  says none of it.** ⚑ *"Their third layer holds — nothing you carry reaches past it"* is the sentence Erik is
  asking for, and it is a receipt line over arithmetic that already runs.

### 2c · ⛔ `attends` HAS NO OTHER END YET — THE CREATURE DOES NOT MOVE

✅ **The target is authored** — `bestiary.json`: *"WARD (⛔ THE REAL COUNTER — attend the endings in its reach and
it starves. Slow, and it is the only cure)"*, and *"every ending that goes unattended within its reach is taken
up."*

⛔ **AND `the_gathering` HAS NO ENGINE READER AT ALL.** The only `gathering` in `engine/` is an unrelated
`latentarcs` harvest string. **Its strength does not move anywhere.** ➡️ **Building `attends` alone would be a
lever with nothing on the other end** — the exact `wiring_audit` class we have spent the week clearing.

**✅ SO IT IS ONE LANDING, IN THIS ORDER, OR IT IS THEATRE:**
1. ⚑ **the creature FEEDS** — unattended endings in its reach raise it (the tick already carries endings; `hereId`
   and `dangerLevel` already carry reach);
2. ✅ **then `attends: true` STARVES IT** — a hold that attends its dead subtracts from exactly that number.

⚠️ **I would rather build both than ship the second alone**, and I will say so plainly in the log if we ship only
one.

---

## §3 — ⬜ WHAT I WOULD ADD TO THE DAY (mine, engine)

| # | | why it is not optional |
|---|---|---|
| **1** | ⛔ **THE ONGOING-DAMAGE TICKER** | ⚠️ **Her own crafts depend on it.** `slow_cup` and `stopped_breath` left the lethal rung yesterday for `mechanic.ongoing` — *"an ATTRITION kill, not a landed one"* — and **nothing ticks it per round on a sheet.** \`ongoingHarmOf\` reads it, the inflict path writes it, and no pass applies it. ➡️ **Two crafts are currently authored as attrition kills that never attrite.** |
| **2** | **Q16, the menu cap** | one line once Erik rules; today a 23-craft kit loses the bare strike, the items and the senses off the end of 40 slots |
| **3** | ⚠️ **Silas's holds carry NO features** | the mine, the Temple to Attending, the walls, the sentries — **none of them is on the record.** ⬜ Erik adds them on the tab, or Aevi authors them, or the narrator records them in play. ⛔ **I will not write into his save.** |

---

## §4 — ⬜ CONTENT SHE OWES THAT IS NOT ON HER LIST

| | | why it matters now |
|---|---|---|
| ⛔ **`deathSave.notForClasses` is `[]`** | the Cut Thread's own prose: *"it cannot be aimed at what has no thread — a machine, a figure, a Precursor working"* | ⚠️ **Until those class ids are authored the death save can be aimed at anything**, and R35 shipped four days ago |
| ⛔ **`mechanic.meaning: "none"`** | body crafts under a metaphysical source — `ki_wield` is the case she and I both named | ⚠️ **A shrine currently makes someone punch harder** (R38 ROUND 2, unanswered) |
| **the `market` `trade` field** | §1 above | the only dark field with a reader already waiting |

---

## §5 — ✅ HER QUEUE ORDER, ENDORSED, WITH ONE SEQUENCING NOTE

⚑ **Spirit measurement first is right and I would defend it against anything else on the list.** It is the only
item on either of our lists that can **DELETE** work: if the number is large, 15 crafts redistribute and the
15-vs-45 imbalance closes with no new content. ⛔ **Measure before authoring is the rule we have both been
burned by** — `smiths_brigandine` this morning is the third instance this week.

⚠️ **ONE COLLISION:** her **#2 companion sheets** and my **2a bearer record** write the same object — the
registry entry. ➡️ **The bearer record lands first** (it is additive: three fields), then sheets author on top of
it. Otherwise we merge two shapes of the same person.

⚠️ **AND R36 STILL WAITS ON ERIK** — *what earns one of the three full-action party slots* is unruled, so
companion sheets make party members fight as themselves without deciding **which three**.

---

## §6 — THE STANDING LIST, AS IT NOW READS

**Erik holds:** Q14 (counts per size tier) · Q15 (the lethal rung, widened — the NPC policy never casts a
capstone) · Q16 (the menu cap) · Q17 (the unclaimed post) · **is a rank-3 ward absolute?** (§2b) · what earns a
party slot · the sword's other two threads.

**Aevi holds:** the Spirit measurement · companion sheets ×9 · `notForClasses` · `meaning: "none"` · the
`market` trade reader's content · the features on Silas's holds (or Erik does it in a minute on the tab).

**I hold:** the bearer record and NPC evolution (2a) · the rank-3 moment and the receipt line (2b) · the
creature's feeding and then `attends` (2c) · the ongoing-damage ticker · Q16's one line when it is ruled.
