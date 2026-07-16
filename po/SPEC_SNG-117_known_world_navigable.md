# SPEC — SNG-117: The world you know is navigable — fix stuck-location + name the places you know
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** Two symptoms, one root cause: **the engine can only travel to / name places it has a resolvable location record for.** So leaving Millbrook "via the pass" left the header stuck on Millbrook (the exit resolved to no id), and the map shows `?` for every place you haven't *visited* — even ones you know the name of and are actively traveling to. Make **known-by-any-means** places (heard-of, en-route, rumoured, adjacent) resolvable and named, so the map is actually usable to click-and-travel.

> **Verified at HEAD `v1.8.80`.**
> - **Stuck header:** `app.js` L2670–2682 (SNG-056 "header follows the fiction") updates `currentLocationId` ONLY when the GM emits a structured `turn.moveTo` AND `resolveLocationId(moveRef)` returns a known id. A narrative exit with no `moveTo`, or a `moveTo:"the pass"` that doesn't resolve to a location record (the pass is a route/edge, not a place with an id), silently no-ops → header stays Millbrook.
> - **Map `?`:** L3214 renders `visited ? l.name : "?"` — the name gate is binary **visited**. L3202/L3234 already have a "heard of it · one travel away" reachable state, so the *reachability* data exists; the **name you know is just not surfaced.** You can know a place's name (en route, rumour, adjacency) and still see `?`.

## THE ROOT CAUSE
"Known" is currently conflated with "visited," and travel targets must be full location records. But the fiction gives you places you know *of* before you stand in them — the pass, the edge district, a rumoured town. The engine has nowhere to put "a place I know by name but haven't entered," so those places are un-nameable and un-travelable.

## THE FIX
1. **A "known places" layer, wider than visited.** A place becomes *known* (name surfaces, becomes a travel target) via any of: visited, GM-named as a destination/route (`moveTo` or narration entity), rumoured (already a map kg-node), or adjacent to a visited place. Store known-place refs (id-or-name) on the character; the map reads this layer, not just `visited`.
2. **Resolve a named-but-unrecorded destination into a real, travelable place.** When the GM moves the player to "the pass" and it has no location record, **mint a lightweight location** (the generated-content path already exists — `coordForGenerated`, `noteGeneratedAttention`) so it gets an id, a name, a map coord, and becomes both the current location AND a future travel target. A route/threshold the fiction treats as a place becomes a real place. This is the same "attention makes it real" path the world-gen already uses.
3. **Header follows the fiction, even on a soft exit.** If the GM narration clearly moves the player out of the current place (leaves Millbrook) but emits no clean `moveTo`, either (a) infer the destination from the narration's named place and mint/resolve it, or (b) at minimum set an "in transit / left Millbrook" state so the header stops asserting Millbrook. Never keep asserting a location the fiction has left.
4. **Map names what you know.** L3214: render `known(l) ? l.name : "?"` (known, not visited). A place you've heard of or are traveling to shows its name and is clickable to travel (subject to the existing reachability gate). `?` is reserved for the genuinely unknown.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (moveTo, L2673) | If `moveRef` doesn't resolve to a record, mint a generated location for it (reuse the gen path) and set it current; if narration exits without moveTo, infer-or-transit so the header never lies. |
| `engine/*` (known layer) | A `knownPlaces` set/map on the character fed by visited + moveNamed + rumour + adjacency; `isPlaceKnown(character, locId)`. |
| `app.js` renderMap (L3214/3234) | Name + make clickable any *known* place (not just visited); keep `?` for unknown; reachability gate for the travel action unchanged. |
| `engine/worldmap` / travel | `travelTo` accepts a known-but-unvisited target (mint-on-arrival if needed). |
| `tests/*` | Leaving a place via narration updates the header (mint or transit); a heard-of/en-route place shows its name on the map and is travelable; `?` only for unknown; minting is idempotent (no dup places). |

## GUARDS
- **The header never asserts a place the fiction has left** — worst case is honest "in transit," never a stale wrong location.
- **Minting is idempotent** — "the pass" becomes exactly one place, not a new one each mention (key off name/normalized id; reuse the dedup the gen path already has).
- Reachability/danger gates on the *travel action* are unchanged — this surfaces names + targets; it doesn't let you teleport past real gating.
- Fog unchanged — knowing a place's NAME is not knowing what's IN it.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the generated-location mint path (`coordForGenerated` et al.) already dedup by normalized name so "the pass" mints once? If not, add that key.
2. Is there a clean signal in a turn that the player LEFT the current place without a resolvable destination (so we can set "in transit")? Or must we infer from narration?
3. Adjacency source — do location records carry neighbors/exits, or is adjacency only implied by the region map? (Determines how "adjacent = known" is computed.)
