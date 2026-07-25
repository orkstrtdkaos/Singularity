# CCODE-20 — "the name won't stick": an id-less registry stub poisoned EVERY meet

**CCode · 2026-07-24 · v1.8.262 (`6a1aef25`) · all three suites green · found + proven via Erik's real save.** *Erik, in play: "this is the fourth or fifth name this character has been given and none are sticking… can your seam fixer find and fix this?" — and the npcUpdates aside was still firing on v260.*

## The smoking gun (from the synced save, not a guess)

Character saves sync to the repo, so I read Erik's actual save (`characters/player-s9z9u1/char-mrhs8286.json`). Its `_turnApplyError`:

> `op: "npcUpdates"`, `Cannot read properties of undefined (reading 'split')`, `at findExistingNpc (engine/npcs.js:61)`

Line 61 is `const a = n.id.split("-")[0] …`. The incoming `id` was `"cael-dorn"` (fine), so **an existing registry entry had `id: undefined`**. Two did: `grael` and `keeper_ilma` — quest/hunt givers he never met in play (`firstMet: undefined`).

## Root cause — a field-presence seam

`engine/quests.js` (the `npc_state` / `ally` quest-effect writes) created a registry stub `{ name, questState }` **with no `id` field** when a quest referenced a giver not yet in the registry. `findExistingNpc` runs on **every** npcUpdate and does `n.id.split("-")`; iterating into that one id-less stub **threw and aborted the meet**. So the person the GM had just named never registered — and next turn the GM met "the man on the stone" fresh and invented *another* name. **One corrupt entry poisoned every meet, indefinitely** — that's the whole "fourth or fifth name" bug. Producer omits `id`; consumer assumes it. Textbook seam.

## Fixed at three layers + declared as a seam

1. **Consumer guard (stops the bleeding for all players)** — `findExistingNpc` now skips an id-less entry (`if (!n.id || !id) continue`) instead of throwing. Its name was already tried above, and one malformed stub can no longer poison the matcher.
2. **Producer** — the `quests.js` `npc_state`/`ally` writes now **stamp `id`** (`id: reg[k]?.id || k`). No new id-less stubs.
3. **Heal** — reconcile step **v20 `npc-registry-id-backfill`** stamps `id` from the registry key on existing id-less entries — repairs live saves (Erik's `grael`/`keeper_ilma`) on load.
4. **Seam** (answers Erik's "can your seam fixer find this?") — `tests/seams.json` gains `npc-registry-entry-has-id` (CCODE-20, field-presence). The guard is now a **permanent build gate**: remove it, the audit goes red. *A bug caught once is caught forever* — this is the seam ledger doing exactly its job, on a live bug, the day after it shipped.

## Proven against Erik's actual save

- `findExistingNpc(reg, "cael-dorn", …)` no longer throws.
- The **real Cael Dorn meet** from his last turn now **completes** → registers as `cael-dorn` (the name will stick).
- The reconcile stamps `id` on both poison entries (`grael`, `keeper_ilma`).
- smoke +4 CCODE-20 checks · wiring_audit +1 seam · content_ci green · no mojibake.

## Deploy note

The fix is in engine modules (`npcs`/`quests`/`reconcile`), which load without a `?v` cache-bust — Erik needs a **HARD refresh** (Ctrl+Shift+R) once v1.8.262 deploys past v260. The reconcile then heals his save on load, and the id-less stubs are gone.

*— CCode. The seam fixer found it, fixed it, and declared it. status: complete_pending_review.*
