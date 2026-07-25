# CCODE-21 — "[object Object]" in the quest routes (Erik's Second Thread) — a shape seam

**CCode · 2026-07-25 · v1.8.265 (`d82c3387`) · all three suites green · found + proven via Erik's save.** *Erik (screenshot): "why does my Second Thread question look empty at the end? does Aevi need to author?"*

## Answer: no, Aevi doesn't need to author — it's a data-shape bug

The content is there. This is a seam (SNG-232 family): a producer wrote `routes` in a shape the render doesn't expect.

## Root (from the save)

The Second Thread (structured backstory quest, `arcId silas_the_second_thread`) has:
- `routes` = an **ARRAY** of `{id, note}` — the ENDING descriptions landed in the wrong field.
- `outcomes` = id-only (`{id, narration:[], effects:null}`) — no `name`, no `summary`.

The quest-detail render does `Object.entries(quest.routes)` expecting a `{traditionId: "text"}` map. On an **array**, that yields `["0", {…}]` → the left label is "0/1/2" and `esc(object)` prints the literal **`[object Object]`** for each row of "How you might go through it." And the name-less outcomes left the "Resolve — decide what the truth is for" buttons **blank**. `structuredQuestRecord` — the single builder every structured quest flows through — passed `def.routes` straight through and never named outcomes.

## Fixed (producer + heal + render + seam)

- **Producer** — `structuredQuestRecord` now normalizes: `normalizeQuestRoutes()` forces `routes` to a `{trad:string}` map (an array, or non-string values, are dropped — never rendered), and every outcome gets a name fallback (titleized id) so a Resolve button is never blank.
- **Heal (and RECOVER the endings)** — reconcile step **v21 (quest-route-outcome-shape)** fixes existing quests in place: it pulls each outcome's missing `summary` from the same-id `routes[].note` (where the ending text was stranded), names it from its id, then empties the malformed array routes. **Erik's three endings come back** — *Finished / Ended / Given* with their real descriptions.
- **Render** — the "How you might go through it" header hides when there are no routes; route text coerces to `""` unless it's a string, so `[object Object]` can never reach the screen again.
- **Seam** — `tests/seams.json` gains `quest-routes-shape` (CCODE-21, field_shape), a permanent build gate.

## Proven vs Erik's save

- Builder normalizes an array-routes def → `routes: {}`, outcome name → `"Finished"`.
- Reconcile on his actual Second Thread → `routes: {}` (no more `[object Object]`), and the three endings recovered: **"Finished"** — *"The fold is closed as a made thing. A new gate stands…"*, **"Ended"** — *"The fold is released…"*, **"Given"** — *"He finishes it and gives it to someone else…"*.

smoke +3 (normalize array / name fallback / well-formed preserved) · wiring_audit +1 seam · content_ci green · no mojibake. Deploy: engine modules load without `?v` — Erik HARD-refreshes once v1.8.265 is live; the reconcile then heals his Second Thread on load, and the Resolve endings appear.

*— CCode. The endings weren't missing — they were stranded in the wrong field. Recovered, and the seam that stranded them is now a build gate. status: complete_pending_review.*
