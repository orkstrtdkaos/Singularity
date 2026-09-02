# NPC AUTHORING TEMPLATE — the four defects that made two sheets inert

**Aevi (PO) · 2026-09-02**
⛔ **Pell and Veth hit the IDENTICAL four defects. Two for two is a TEMPLATE FAULT, not a slip** — so this
file is the fix, and the sheets were only the symptom.

---

## ⛔ THE FOUR, IN THE ORDER THEY BITE

### 1 · REGISTER THE FILE IN THE MANIFEST
`content/packs/valley/manifest.json` → `provides.npcs`.

⚠️ **Pell was 44 files on disk against 43 listed — hers the only one missing.** The file never loaded, so
**nothing downstream could have mattered.** Every other check below was moot.

✅ CCode's §49 now asserts every NPC on disk is named by the manifest. ⛔ **Add the path anyway; do not
rely on the gate to catch it.**

### 2 · `schemaVersion` — the validator only wakes once the file is registered
⚠️ **Registering Pell switched on a validator that had never seen her**, because an unregistered file is
never validated. **Defect 1 HID defects 2–4.**

### 3 · `knowledge` IS AN ARRAY — 40 of 43 carry one
⛔ Prose fails the schema. Split it; it splits losslessly.

### 4 · `reactsToReputation` IS `tag → response`, NOT PROSE
⚠️ Use tags already in the corpus (`reliable`, `loose-lipped`, …). ✅ Keep the authored sentence verbatim
in `_reactsWhy` — **the structure changes, the judgement does not.**

---

## ⛔ THE FIFTH, AND IT IS THE WORST BECAUSE IT LOOKED FINE

`sheetFor` says **"AN AUTHORED SHEET ALWAYS WINS"** — and `authored` is a **caller-supplied option that
nothing passes.** The record was never consulted.

⚠️ **Pell's level got through by accident**, because `derivedLevel` happens to read `entry.level`.
⛔ **So the sheet came back L27 with health 81 and looked ENTIRELY PLAUSIBLE, while `subAttributes` was
`{}` and `skills` was `[]`.**

➡️ **A PLAUSIBLE WRONG ANSWER IS WORSE THAN A BLANK ONE.** ✅ Fixed by CCode — but the lesson generalises:
**a doc-comment promise is not a reader.**

---

## ⚠️ AND THE SHAPE COLLISION UNDERNEATH IT

`craftsOf` reads **`skillsObserved`**. ⛔ **Measured across all 44 authored NPCs: ZERO have ever carried
that field.** The sheets use **`abilities`** — crafts by id with ranks, the shape a player character
carries.

➡️ **A reader with no writer met a writer with no reader, and they were the same defect from opposite
sides.** ✅ `abilities` is the better shape and is now read first; `skillsObserved` still works, because
dropping it would be a migration disguised as a fix.

---

## ✅ THE CHECKLIST — run it before committing any NPC sheet

| # | check |
|---|---|
| 1 | ⛔ **path added to `manifest.json` → `provides.npcs`** |
| 2 | `schemaVersion` present |
| 3 | `knowledge` is an **array** |
| 4 | `reactsToReputation` is **tag → response**; prose preserved in `_reactsWhy` |
| 5 | crafts under **`abilities`** as `{abilityId, level, why}` |
| 6 | every `abilityId` **resolves in the catalogue** — verify before writing, not after |
| 7 | ⛔ **`assistTags` present** — ⚠️ WITHOUT THEM `contributionsOf` falls to its HARM default and **a master smith counts as a striker** |
| 8 | `sex` / `gender` per R24; `romanceEligible` as an explicit author decision |
| 9 | ⛔ **run `battleSkillsFor()` and confirm it returns more than 1** — the end-to-end proof the sheet is actually read |

⚠️ **Step 9 is the one that would have caught all five.** Pell yielded **1** skill before the fixes and
**32** after; Veth yields 40.

---

## ⛔ AND THE AUTHORING LESSON THAT IS NOT MECHANICAL

**Aevi built Veth's entire sheet around *"she has never struck anything"* and wrote *"the absences are the
characterisation."***

⚠️ **The absence was that NOBODY HAD AUTHORED HER, so the GM had nothing to run with.** Erik: *"don't take
that as her not being able to strike or even wanting to strike."*

➡️ **A DATA GAP IS NOT A PERSONALITY.** Same failure class as the session's five false-absence claims,
moved from code into character — and **worse there, because a sheet reads as deliberate to the next
author.** ⛔ **Before reading an absence as characterisation, check whether anyone ever wrote the presence.**
