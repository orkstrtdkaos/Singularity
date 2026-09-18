# AUTHORING A RECORD — the procedure, and why it exists

**Aevi · 2026-09-18 · SNG-626**

> **Erik:** *"Make sure you document how to write and update objects. You made errors on writing skills — you
> shouldn't. Everything exists for you to be able to read and know how to author properly. Document it and
> follow it."*

---

## §1 — ⛔ WHAT WENT WRONG, EXACTLY, SO THE PROCEDURE HAS A REASON

Authoring four commander crafts I made **nine errors**, and **every answer was already in the corpus**:

| # | error | what would have caught it |
|---|---|---|
| 1 | `harmRung: 0` — a number | it is a **gate** vocabulary, not a schema enum: `lethal \| damaging \| incapacitating \| none` |
| 2 | `axes` as an array | the schema says `object`, and every neighbouring craft is one |
| 3 | authored `rankProgression` | the engine **stamps** it — it is on a loaded record and in no schema |
| 4 | `tier` ≠ `levelReq` | CCODE-224, a ratchet |
| 5 | no per-rank `functions` | 147c reads the RANK, not the ability |
| 6 | a rank verb the top level lacked | §88, a ratchet |
| 7 | `reachesDepth` as a unit scope | it is the **death ladder's** ordinal |
| 8 | **glyphs in player-facing fields** | A1 — pinned at zero **the day before**, by me |
| 9 | **quoted Erik by name inside a card** | nothing: a gate cannot see authoring voice. Only reading it can |

⚠️ **Eight of the nine are machine-checkable and I found them one gate at a time, over nine runs.** The ninth is
not checkable at all.

## §2 — ⛑ THE PROCEDURE

**1 · Does it already exist?** `node scripts/exists.mjs <name>` — searches every authored kind by id and name.
⛔ I once resumed intending to author a craft **I had written myself six minutes earlier**.

**2 · What is the shape?** `node scripts/authoring.mjs <type> [exemplarId]` — prints the required fields, the
closed enums, the **shapes that are not strings**, the fields the engine **stamps and you must never author**, the
vocabularies **closed by a gate rather than by the schema**, and a live exemplar to match field for field.

**3 · Open the nearest authored record and match it.** Not a remembered shape — the actual neighbour. If you are
writing a marcher craft, read a marcher craft.

**4 · Run the suite BEFORE the commit message, not after.** Every one of the eight was a single `npm test` away.

**5 · Then read your own player-facing text back.** ⛔ The ninth error passes every gate: `description`, `notFor`,
`plainly`, `grants` and `cannot` are **read by a player**, and the house notation, the shouting and the authoring
voice are all invisible to a machine and obvious to a person.

## §3 — ⚠️ THE TWO RULES UNDER ALL OF IT

**A GATE'S VOCABULARY IS NOT IN THE SCHEMA.** `harmRung`, `damageType`, `assistTags` and `vocation` are closed by
`content_ci`, `damage_families.json` and `combatants.js` respectively. ⛑ `authoring.mjs` reads each from its own
source so it cannot drift from what actually enforces it.

**AND THE CORPUS IS THE SPECIFICATION.** ⛔ Not this document — **this document goes stale and the tool does
not.** Everything here that is a fact rather than a habit is printed by `authoring.mjs` from the live schema, the
live gates and a live record. If the two ever disagree, **the tool is right.**

— Aevi
