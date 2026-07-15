# SPEC — SNG-111: Progressive NPC naming (learn a surname without losing the given name)
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** Learning an NPC's surname should EXTEND their name ("Pell" → "Pell Marsh"), not get shunted to aliases or ignored. The current `revealName` path treats a name as a single atomic reveal — it can't append a surname to an already-known given name.

> **Verified at HEAD `v1.8.67`.** `npcs.js` update path: `revealName` fires only when `!n.nameRevealed` (first reveal replaces the placeholder) OR routes a differing later name to `aliases` (L63–72). Pell was met already-named "Pell" (`nameRevealed = true`), so learning "Marsh" hits the L70 branch and becomes an **alias**, never composing "Pell Marsh". Live symptom (Erik): learned Pell's last name "Marsh"; the known-people entry never updated.

## THE FIX
Add a distinct `nameExtend` / surname path separate from `revealName`:
- **`revealName`** = "the stranger's name is X" (replaces a placeholder / true-name reveal). Unchanged.
- **`nameExtend`** (new op field) = "you learned more of their name" — appends when the new token(s) aren't already in `n.name`, producing "Pell Marsh". Idempotent (learning "Marsh" twice doesn't double it). Records to `n.history` ("[dN] You learn her surname: Marsh — Pell Marsh"). Keeps the given name as an alias for match continuity so prior references still resolve.
- **Heuristic fallback:** in `revealName`, if the incoming name *contains* the current name as a token (GM says "Pell Marsh" when we know "Pell"), treat it as an extension, not an alias — compose rather than shunt. This catches the common case even without the GM using the new op.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/npcs.js` | New `nameExtend` handling in the update loop; `revealName` gains the contains-current-name → compose heuristic; both keep old name as alias for `namesMatch` continuity. |
| `engine/gm.js` | Add `nameExtend` to the NPC-update op vocabulary + sanitizer; guidance: use when a known person's fuller name is learned. |
| `tests/*` | "Pell" + learn "Marsh" → name becomes "Pell Marsh", alias "Pell" retained, idempotent on repeat; a full-replacement true-name reveal still replaces. |

## GUARDS
- Never silently rewrite identity (the existing L59 principle holds) — extension is additive and logged.
- Prior references to the given name must still resolve (alias retention).

## OPEN QUESTIONS — CCODE ROUND 2
1. Does `namesMatch` already tokenize so "Pell" matches "Pell Marsh" once composed? If yes, alias retention may be redundant — confirm.
2. Is there a display cache of "known people" that needs invalidation when a name extends, or does it render live from the registry?
