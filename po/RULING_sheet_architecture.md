# RULING — sheet architecture: pass the whole sheet, and read it first in the GM block

**Aevi (PO) · 2026-09-02 · closes `SPEC_npc_sheet_architecture.md` ROUND 2**
**CCode: *"Her §2 ruling is right and I'd build it."*** ✅ §2 stands. Four corrections below change HOW.

---

## ✅ R30 — the bridge is THE WHOLE SHEET, not its `skills[]`

⛔ **THE DOC-COMMENT LIES AND THE BUG IS LIVE.** `synthesizeOpponentSheet` claims an authored
`opponent.skills[]` *"overrides the synthesis entirely."* **It does not.** `skills` defers completely;
**every other field is `authored ?? derived-from-threat`, and `threat` defaults to 20.**

➡️ **Passing Pell's `skills[]` alone gives her a threat-20 body — a middling raider wearing a level-27
smith's crafts.** ⚠️ **That is exactly the partial deferral the spec named as worse than either system
alone, and it is what a naive integration would have shipped.**

✅ **`sheetFor` already returns every field that branch reads.** ➡️ **Pass the whole sheet.**
⬜ **And a skills-only sheet should be an ERROR, not a silently-filled raider** — CCode's call, and right:
the failure must be loud, because a threat-20 Pell reads plausible.

## ✅ R31 — the first caller is the GM BLOCK, not a dark mint

⛔ **AEVI PROPOSED "MINT A SHEET AND DO NOT WIRE IT TO COMBAT YET" AS THE SAFE OPTION. IT IS THE OPPOSITE.**

CCode: *"That builds a writer with no reader on purpose — the exact shape that hid `folkAccessible`,
`backlashRung`, `holdings`, `sectFlavour`, `local_layouts` and `npcsheet` itself for weeks. A sheet nobody
reads isn't safe, it's invisible."*

⚠️ **ACCEPTED WITHOUT RESERVATION.** Aevi spent two days cataloguing that failure class and then recommended
it as the cautious path. **Caution that produces an unread field is not caution.**

✅ **The first caller is the GM block** — same shape as R28's `groundDetail`, built today. **It READS but
cannot hurt:** if it is wrong the narrator says something odd and no number moves, and it proves **395 lines
of never-run code against 112 real records.**
➡️ **Combat second, once it has been wrong in public a few times.**

## ✅ R32 — accepted from measurement

| | |
|---|---|
| **The sheet is a VIEW** | `sheetFor` writes nothing, so eviction is free and the 150 cap is the true ceiling |
| **`synthesizeStaticSheet` stays outside** | a door is not a person |
| **Unit threat = max + a √K term**, reusing `predictAggregate` | ⚠️ **so unit and party scales agree BY CONSTRUCTION rather than by tuning.** ⛔ The naive sum is already measured at **614% wrong** on the spread |
| **Q5's shape mismatch is not real** | `battleSkillsFor` emits a superset and converts `abilities` → `skills`. ✅ **A missing call, not a mismatch** |

---

## ⛔ THE EIGHTH FALSE CLAIM — and it inverts the spec's biggest stated risk

**Aevi wrote: *"`derivedLevel` already gives a stranger 15."*** ⛔ **Measured: a bare record and a
just-minted one both derive to 1.** 15 is met-40-across-400-days — **the KNOWN stage, not the stranger.**

⚠️ **`npcsheet.js` says so in its own header: "A STRANGER IS LEVEL 1 AND THAT IS CORRECT — the level is a
claim about what the story has shown, not a courtesy."** Aevi quoted that file repeatedly and still got the
number backwards.

➡️ **So §5's "derivation quality at scale" risk is INVERTED.** The danger is not a hundred bandits too
strong at 15. ⛔ **It is a hundred minted strangers all at 1** — a different tuning question, and **arguably
already the right answer.**

⚠️ **Eight wrong claims this session, in both directions.** ✅ **And one CCode went to correct and could not:
the 52 `assistTags` figure — 43 NPCs + 9 companions. That one was right.**

---

## ⬜ BUILD ORDER

| # | step |
|---|---|
| 1 | `sheetFor` → GM block, whole sheet, reading only |
| 2 | ⛔ skills-only sheet becomes an ERROR |
| 3 | combat, after step 1 has been wrong in public |
| 4 | unit aggregate via `predictAggregate` (max + √K) |
| 5 | ⬜ minted-stranger level-1 tuning — **its own question, not a blocker** |
