# SPEC — SNG-119: Fold "standing here" into location headers + the current-location title
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The "Standing here" sidebar is a separate block; fold each place's standing + the people you know there **into that location's header**, and show current-place standing **next to the current-location title**. Standing becomes a property of the place, read where the place is named — not a detached list.

> **Verified at HEAD `v1.8.80`.** `chronicleViews` (app.js ~L4248–4258) already assembles `bonds` (known NPCs + `relationshipLabel`) and `standing` (per-tradition `standingWithPeople` + per-community `standingWith`) as clean structured data. It's rendered as its own sidebar. The current-location header (L3234 / the location-tag at L5056) shows the name but not the standing/known-people there.

## THE CHANGE
- **Current-location title:** append a compact standing indicator next to the current place name (e.g. "Millbrook · *honored*") — read at a glance where you already look for where-you-are. Tappable → the fuller who-you-know-here detail.
- **Per-location headers (map detail / codex):** each place's header carries its standing band + the people you know there (bonds scoped to that community), so opening a place tells you your footing there and who you'd find. Pell shows under Millbrook (or wherever her community is) as "committed partner · devoted."
- **Retire the detached sidebar** (or reduce it to a roll-up): the information now lives on the places it describes. A person you know is shown under the location they belong to, next to that location's name.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (location header / title) | Current-title gets a standing chip (tappable → detail); map/codex location headers get standing band + community-scoped known-people. |
| `engine/*` | `standingAtLocation(character, locId)` + `knownPeopleAt(character, locId)` — scope bonds/standing to a place (data already exists in chronicleViews; factor to per-location). |
| `app.js` (sidebar) | Fold the standalone "standing here" into the header(s); keep at most a compact roll-up. |
| `tests/*` | Current title shows current standing; a location header lists standing + known people scoped to it; a person appears under their community's location; no double-render with the old sidebar. |

## GUARDS
- Standing shown where the place is named — no detached list the player has to correlate.
- Don't duplicate — folding in means the old sidebar shrinks or goes, not both showing.
- Scope people to their community/location so a place's header shows who's actually THERE, not everyone you know.

## OPEN QUESTIONS — CCODE ROUND 2
1. Do NPC bonds carry a communityId/locationId to scope them to a place, or only a free-standing relationship? (Determines how "known people HERE" is computed — may need a light scoping field.)
2. Current-title real estate — is there room for a standing chip inline (L5056 location-tag), or does it need a second line on narrow phones?
