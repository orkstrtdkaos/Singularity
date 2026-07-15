# SPEC — SNG-109: The Chronicle — the character background page that reflects the story so far
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** A character background page that reads the ACCRETED self back to the player: a generated paragraph of the story so far, a list of major deeds, relationships (with SNG-108 bonds/stages), local standing, and the portrait. One page that witnesses what the player's attention has made real.

> **Thesis (Erik+Aevi, this session):** the game is about attention making reality — spear, bond, standing, deed all accrete by being tended, and the engine already computes most of them but shows the player almost none. The Chronicle is where the attended self gets *witnessed*.

> **Verified at HEAD `v1.8.67`.** The data mostly EXISTS and is unsurfaced: **deeds** (`recordDeed`/`character.deeds`, drives reputation), **relationships** (npcs.js registry + bands), **standing** (`standingWith`/`standingWithPeople`), **portrait** (art.js), **bio** (`character.bio.motivation`/`currentAim`). The Chronicle assembles these; it does not invent new tracking.

## THE PAGE
1. **Portrait** (art.js; SNG-110 makes it earned-record-aware).
2. **The story so far** — a generated paragraph from deeds + arc + major bonds + standing. Generated via the model (a `chronicle` task), CACHED, regenerated on demand or when major state changes (a new tier of deed, a bond stage, a domain promotion) — not every turn (cost). One warm paragraph, in the game's voice, that says who this person has become.
3. **Major deeds** — the top N deeds by weight from `character.deeds`, dated (world-day). The concrete acts under the standing.
4. **Relationships** — known NPCs by bond (SNG-108): Pell as "committed partner · devoted", allies, rivals. The people who revalued you.
5. **Standing** — per-people/settlement bands (SNG-107 gives them teeth; here they're displayed).
6. **The arc** — current aim + domain shape (which poles, any foreclosures from SNG-101) — who they are on the circle.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/chronicle.js` (new) | `chronicleParagraph(character, ctx)` — assemble the model prompt from deeds/bonds/standing/arc, cache result + an invalidation stamp (regen when a major-state hash changes). `majorDeeds(character, n)`. Pure assembly + one cached model call. |
| `engine/claude.js` | `chronicle` task in MODEL_MAP (sonnet; cached; not per-turn). |
| `app.js` | The Chronicle page/tab: portrait, paragraph (with regenerate), deeds list, relationships (SNG-108 labels), standing, arc. |
| `tests/*` | Paragraph assembles from real state; cache invalidates on major-state change, not per turn; deeds sorted by weight; empty-state ("your story is just beginning") is graceful. |

## GUARDS
- Chronicle paragraph is CACHED and regenerated on major-state change or explicit request — never per-turn (cost + churn).
- Model-authored prose routes through the same content ceiling as the GM (the chronicle of an R+ character is still AUP-bounded; minor-safety floors hold).
- Read-only reflection — the Chronicle displays state, it doesn't mutate it.

## DEPENDENCIES
- Reads SNG-108 bonds (relationships section) and benefits from SNG-107 (standing with teeth) and SNG-110 (earned portrait) — but degrades gracefully if those aren't in yet (shows band-only relationships, cosmetic standing, gear-only portrait).

## OPEN QUESTIONS — CCODE ROUND 2
1. Is there a deed-weight/tier already, or do deeds need a salience score to pick "major" ones?
2. Best major-state hash for cache invalidation — deeds count + top-bond stages + domain ceilings? Confirm cheap-to-compute.
