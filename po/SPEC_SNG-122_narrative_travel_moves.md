# SPEC — SNG-122: Narrative travel must actually move you (promote the SNG-117 deferred boundary)
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** In-fiction travel to a known place ("head to the edge district") often doesn't move the player — the GM narrates the journey but emits no resolvable `moveTo`, so the location never changes and the player is forced to fall back to map-travel. This is the pure-narration-exit boundary SNG-117 explicitly deferred; **live play proved it's blocking normal movement, so build it.**

> **Verified at HEAD `v1.8.81` + live evidence.** SNG-117 fixed the *concrete* case (`moveTo:"the pass"` → mint + move) but deferred inferring a destination from prose when the GM emits **no** `moveTo` at all. Erik: "I used map travel to get to the edge district because the in-game travel was just not getting there." That's the deferred case, hit in real play — narrative travel silently no-ops, map-travel is the only thing that works. Map `travelTo` (app.js) works precisely because it sets `currentLocationId` directly; the narrative path depends on a GM op that often isn't emitted.

## THE FIX
1. **Infer a destination from a clear travel beat.** When narration plainly moves the player toward/into a named place (a place that `isPlaceKnown` or that the fiction just named) but no `moveTo` op is present, resolve-or-mint that place (the SNG-117 mint path already exists) and move there — or, if the beat reads as *en route* rather than *arrived*, set the in-transit state so at least the header follows and the next beat can complete the arrival.
2. **Nudge the GM to emit `moveTo` on travel intent.** When the player's action is a travel intent (intentTags include a move verb, or the choice was a "travel"/"go to" action), the GM prompt should explicitly require a `moveTo` op in the reply. Make travel a first-class op the GM is *told* to emit, not something it optionally narrates. (Cheapest, highest-leverage half — fixes the cause, not just the symptom.)
3. **A traversal fallback in the UI.** If the player picks a "go to {known place}" and the resulting turn still didn't move them, offer a one-tap "you arrive at {place}" that runs the same `travelTo` the map uses — so narrative travel and map travel converge on one code path and the player is never stranded.

## RELATION TO THE "STATE UPDATES WERE LOST" NOTE (Erik's screenshot — diagnosed, NOT caused by travel)
The "This beat's state updates were lost" note in the same screenshot is a **separate, already-graceful** path: the GM reply came back as malformed/truncated JSON, the retry also failed, and the engine salvaged the narration while the structured ops were unrecoverable (`gm.js` L366–377). It **self-cleared** (Silas's `_opNote` is now null; he's correctly at `radiant_plateau_edge`). This is the model occasionally emitting bad JSON — **not** caused by map-travel (travel doesn't call the GM; the broken reply was the next narrative beat). The salvage system is robust (recovers 20+ op types, preserves prior scene). **No fix required for the recovery**; see SNG-123 for optional hardening of the malformed-reply rate. The two symptoms are adjacent in time, not causally linked.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/gm.js` | On a travel-intent action, require `moveTo` in the reply contract; add guidance + a validator that flags a travel beat with no move. |
| `app.js` (turn apply) | If narration is a clear travel beat with no `moveTo`, infer destination (known/named place) → resolve-or-mint → move, or set in-transit; converge on the map `travelTo` path. |
| `app.js` (UI fallback) | A "go to {place}" choice that didn't move → one-tap "arrive" using `travelTo`. |
| `tests/*` | A travel-intent turn without `moveTo` still moves the player (infer/mint); a "go to" choice always results in arrival or a one-tap arrival; narrative + map travel share one arrival path. |

## GUARDS
- **Never strand the player** — if a travel beat doesn't move them, the fallback does; narrative travel can't silently no-op.
- Reuse the SNG-117 mint (idempotent) — inferred destinations mint once, same as `moveTo`.
- Don't over-move — only infer on a *clear* travel beat; ambiguous prose sets in-transit or offers the one-tap, never teleports on a guess.

## OPEN QUESTIONS — CCODE ROUND 2
1. Is there a reliable signal that a choice/action was a travel intent (move verb in intentTags, a "go to" choice kind)? That's the trigger for requiring `moveTo`.
2. Can the GM prompt cheaply enumerate the known adjacent places so `moveTo` targets are constrained to real/known destinations (fewer unresolvable refs)?
