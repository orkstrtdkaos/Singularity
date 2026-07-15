# SPEC — SNG-112: Quest offers gated by proximity/thread, not just region
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** A structured quest is offered whenever `def.region === ctx.region` — region is too coarse, so an unrelated questline (Cellaceron's "pick up Fendt") surfaced to Silas who was on different threads and nowhere near its location. Gate offers on **actual proximity to the location OR an already-touched story thread**, not merely sharing a region. And a shared thread should allow a **player-specific parallel quest**, not one canonical take-it-or-leave-it.

> **Verified at HEAD `v1.8.67`.** `availableStructuredQuests` (quests.js) filters: offer if `def.region === ctx.region`, or if a scene NPC matches `def.giver`, else (no context) offer all. **Region-match is the leak** — a region holds many locations and threads; anything tagged the region pops regardless of where the player actually is or what they're pursuing. Erik: the Fendt quest surfaced when he was working different Silas storylines and not near its location/thread.

## THE FIX — tighten the offer gate
Offer a structured quest only when at least one *real* connection holds:
1. **Location proximity** — the player is AT or ADJACENT to the quest's `locationId`/`locationEntityId` (not just its region). Region alone no longer qualifies.
2. **Giver present** — a scene NPC matches `def.giver` (keep; this is already a real connection).
3. **Thread touched** — the player has an active/known quest or pinned fact that references this quest's thread/entities (so a continuation surfaces, a cold unrelated arc does not).
Region becomes a *soft* signal at most (e.g. a quest board explicitly lists region quests — a place the player chose to browse), never an automatic push into the scene.

## PARALLEL PLAYER QUESTS ON A SHARED THREAD (the design half)
A shared arc (Fendt exists in Cellaceron's game too) should support a **player-specific quest on the same thread** rather than forcing the one canonical version. Structured quests already slugify per character; extend so a thread/arc id can host multiple quest instances differentiated by character — Silas can hold *his own* quest on the Fendt arc without inheriting Cellaceron's framing. (Shared family canon with a rating lens already exists — this is the same principle at the quest layer: shared world, player-specific threads.)

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/quests.js` | `availableStructuredQuests`: replace bare region-match with proximity(location) OR giver OR thread-touched. Add `threadId`/`arcId` to the quest shape; allow per-character instances on a shared thread. |
| `engine/worldmap.js` / location | Provide "at or adjacent to locationId" — confirm an adjacency/distance helper exists (it does for regions; need location-granularity). |
| `engine/gm.js` | Quest-surfacing guidance: only raise a structured quest when the offer gate passes; a region-only match is not a reason to interrupt the player's current thread. |
| `tests/*` | A region-only quest with a far location + untouched thread is NOT offered; a proximate or thread-touched one IS; two characters hold distinct instances on one shared arc. |

## GUARDS
- Don't break quest boards / explicit browse surfaces (region listing there is intentional — it's player-initiated, not a push).
- A quest already accepted/known still progresses regardless of the tightened *offer* gate (this changes what's newly surfaced, not what's underway).

## OPEN QUESTIONS — CCODE ROUND 2
1. Is there a location-granularity adjacency/distance helper, or only region-level? (Determines whether "proximity" is buildable now or needs a location graph first.)
2. Do quests carry a `threadId`/`arcId` today, or is thread identity only implicit in giver/entities? (Determines the parallel-quest key.)
3. Where does the Fendt quest's `region` get set such that it matched Silas — confirm the specific leak against the live catalog entry.
