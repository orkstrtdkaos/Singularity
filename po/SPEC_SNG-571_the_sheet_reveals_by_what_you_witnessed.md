<!-- status: SNG-571 spec_ready GO (Erik 2026-09-13) — amends SNG-570 §3 -->
# SPEC SNG-571 — The sheet is revealed by what the PC knows, and every field for it already exists

**Aevi (PO) · 2026-09-13**

---

## §1 — ERIK'S RULING

> *"The sheet could be revealed over time. Based on what the PC knows or witnesses."*

⛑ **THIS IS ALREADY HOW THE DATA WORKS. NOTHING NEEDS INVENTING — IT NEEDS RENDERING.**

## §2 — ⛔ THE GM HAS A FULL CHARACTER SHEET FOR EVERY NPC. THE PLAYER HAS A NAME AND A PORTRAIT.

**Measured at HEAD:**

| what exists | who reads it |
|---|---|
| `npcsheet.sheetFor(entry)` — level, tier, attributes, subAttributes, crafts | ⚠️ **`sheetsForGM`** |
| `combatants.presenceSheet(record)` — a bystander's sheet with a scaling floor | ⛔ **0 readers in `app.js`** |
| `npcRegistry[].skillsObserved` — **the crafts the PC has SEEN them use** | ⛔ **0 in `app.js`**, 2 in `gm.js` |
| `npcRegistry[].knownFacts` — what the PC has learned about them | ⛔ **0 in `app.js`, 0 in `gm.js`** |
| `nameRevealed` · `firstMet {locationId, day}` · `lastSeen` · `history[]` · `relationship` · `bondType` | engine + repair tooling |

⛑ **AND THEY ARE RICHLY POPULATED, BY THE GM, IN PLAY: of Silas's 41 registered people, 26 carry
`skillsObserved` and 35 carry `knownFacts`.**

⛔ **`knownFacts` IS THE PUREST INSTANCE OF THIS WEEK'S CLASS WE HAVE FOUND: 35 people carry a list of what
the player knows about them, and NOTHING ANYWHERE SHOWS IT TO THE PLAYER.** The GM does not even read it.
⚠️ It is written every session and consumed only by `corrections`, `devreport`, `reconcile` and
`recovery_snapshots` — **four repair tools and no reader in play.**

## §3 — ⛑ THE REVEAL MECHANIC IS THE FILTER, AND THE FILTER FIELDS ARE THE ONES ALREADY WRITTEN

**O1 · The player's sheet is `sheetFor` masked by what the registry says the PC knows.** ⛔ **One builder,
two audiences** — the same discipline SNG-381 used for the ground card, where the screen and the prompt read
one source *"so they cannot disagree."*

| sheet row | revealed by | already populated |
|---|---|---|
| **name** | `nameRevealed` | ✅ and Marrow proves it — hidden, then revealed |
| **crafts** | ⛔ **`skillsObserved` — you see what you have WATCHED THEM DO** | ✅ 26 of 41 |
| **what you know** | `knownFacts` | ✅ 35 of 41 |
| **where and when you met** | `firstMet`, `lastSeen` | ✅ |
| **what you have done together** | `history[]`, `relationship`, `bondType` | ✅ |
| **level / attributes** | ⬜ **the last thing revealed, if ever** — see O3 |

**O2 · ⚠️ `skillsObserved` IS ERIK'S RULING ALREADY IMPLEMENTED IN CONTENT.** Marrow's reads: *"Perfect
warden's attention — complete, unhurried, undivided"*, *"Judgment of endings and what they mean"*, *"Ability
to stand in two forms at once"*, *"Reading a warding through touch."* ⛑ **That is not a craft list. It is a
record of things Silas watched her do**, in the GM's words, dated by the history beside it. **It is better
than a craft list and it is already there.**

**O3 · ⛔ NUMBERS ARE THE LEAST-REVEALED THING, AND MAY NEVER BE.** You learn that Marrow reads endings
because you watched her; you do not learn that she is level 31. ⚠️ **`presenceSheet`/`sheetFor` should back
the sheet, not BE it** — pips and plain words where a number would be, per SNG-381: *"pips before
percentages."* ⬜ **Erik rules whether raw numbers ever surface for an NPC.** My read: **no, and the sheet is
better for it** — what a player needs is *"she could reach you in the deep dark"*, which is a verdict, not a
stat.

## §4 — ⛑ AND THIS IS WHAT MAKES THE WILL HONEST

**SNG-570 asks the player to name who should try for them at each depth.** ⛔ **YOU CANNOT NAME SOMEONE
WHOSE REACH YOU HAVE NEVER SEEN.**

⚠️ **So the roster is bounded by the sheet, and the sheet is bounded by what you witnessed.** A player who
has never watched anyone attend an ending has nobody to write in the near dark — **and that is correct, and
it is the design arguing for itself: go and travel with people, and pay attention to what they do.**

⛑ **AND IT GIVES `skillsObserved` A CONSEQUENCE IT HAS NEVER HAD.** Watching Marrow read a warding through
touch stops being colour and becomes **the reason you are able to name her at the deep dark.**

## §5 — WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **A sheet that reveals on a counter.** *"3 more meetings until you learn her crafts"* is a progress bar
  wearing a relationship. ⚠️ **The reveal is EVIDENTIAL: you know it because it happened**, and the fields
  already work that way because the GM writes them when the thing occurs.
- ⚠️ **An empty sheet reading as broken.** A stranger's sheet is mostly blank and should SAY so in the
  world's voice — *"you have met her twice and watched her do nothing"* — rather than showing empty rows.
- ⛑ **And the test: a player should be able to open two sheets and tell, without a number, which of those
  two people they actually know.**

## §6 — WHAT IS WHOSE

**CCode:** the player sheet over `sheetFor` masked by the registry knowledge fields · the empty-state voice ·
`knownFacts` getting its first reader in the game's history.
**Aevi:** the prose for every empty state and every reveal threshold.
**Erik:** O3 — whether raw numbers ever show.

— Aevi, PO
