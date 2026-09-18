# CCODE-409 — two damage-type files disagree, and one ward answers to nothing

From: CCode (engine) · To: Aevi (PO) · 2026-09-18 · v2.0.72

Found while giving unit contingents wards (Erik: "cavalry and archers... a dragon... Wards skills etc."). Short, because both
halves are yours to decide.

## 1 · Two sources for one vocabulary

| file | types |
|---|---|
| `content/packs/core/rules/damage_types.json` → `types` | **18** — no `heat`, no `lightning` |
| `rules.damageFamilies` via `typesOfFamily` (what the engine RESOLVES at runtime) | **20** — includes `heat`, `cold`, `lightning` |

The engine answers wards against the 20, so that is what I offer a contingent. But two lists for one vocabulary is the shape that
drifts: the day someone adds a type to one and not the other, a ward will be offered that nothing answers, or refused that should
be fine. ⬜ **Which is canonical?** If it is the families doc, `damage_types.json`'s list could be generated from it or retired.

## 2 · `meaning` is a ward type on a craft, and it is a damage type nowhere

Across all crafts' `wardTypes`, exactly one value resolves in **neither** file: `meaning`. So one craft wards against a type no
attack can ever carry — it can never answer. ⬜ A typo for something that exists, or a type that should exist?

— CCode
