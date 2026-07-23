# SPEC — SNG-210: The GM narrates travel the save never commits (location desync)
## Aevi (PO) · 2026-07-22 · awaiting CCode ROUND 2 · verified against a live save

> **Erik, from live play:** the location header reads "THE CROSSING" while the prose is set in Cairnhold and
> he's "been in Cairnhold this whole time."

## §1 — Verified at origin (Silas's save, char-mrhs8286)
Not a display bug — the **tracked field is wrong**, and the header reads it faithfully:
- `currentLocationId: "the_crossing"` and `activeScene.locationId: "the_crossing"` — both stale.
- `knownPlaces` **contains cairnhold** (he's been there / knows it), and the GM prose narrates *"The road out
  of Cairnhold…"* — so the fiction moved him and the world knows it.
- `_pendingArrival: null` — no arrival is queued or stuck; the move simply never committed.
- `intent.js:85` only **reads** `currentLocationId` (`locations[character.currentLocationId]`); grep shows
  no arrival-commit **writes** it on a narrated move. The GM changes the scene in prose; nothing writes the
  new location back to the save.

**This is the creation-commit family again (SNG-067/068/069): narration outrunning state.** The GM describes
a thing happening; the durable field it should update is never written. Here it's location; there it was
character creation. Same shape — a side-effect the fiction implies but the engine doesn't commit.

## §2 — Why it matters beyond the header
`currentLocationId` is read all over: `intent.js` (what's *here*), the "great figures near you" legend
surface (SNG-208 reads `homeLocation` against current location), encounter/place logic, `knownPeopleAt`. A
stale location silently poisons all of them — the player is mechanically standing at the_crossing while the
story is in Cairnhold, so *everything location-gated fires for the wrong place*. The header is just the
visible tip.

## §3 — Outcome wanted
When the GM narrates an arrival (a completed move to a place), the engine **commits it**:
`character.currentLocationId` (and `activeScene.locationId`) update to the arrived-at location, `knownPlaces`
gains it if new, and a `placeMemory`/chronicle entry marks the arrival. The commit is the same discipline
SNG-067/068 established for creation: **the fiction's side-effects must be written, not just spoken.**

Likely mechanism (CCode confirms): the GM's turn output should carry an arrival signal (a `locationId` in the
scene/intent result, or an `arrive`/`travelTo` op) that a write-site applies — parallel to how quest/npc
updates already commit. If the signal exists but isn't applied, it's a missing reader (the recurring shape);
if the GM isn't emitting it, the turn contract needs the field.

## §4 — The live save needs repair too
Silas is desynced *now*. Beyond the forward fix, a one-time reconcile: set `currentLocationId` to his true
location (Cairnhold, per the prose + knownPlaces) so the existing save isn't stuck. Same pattern as prior
`reconcileVersion`/`backfillVersion` passes. ⚠️ Confirm the true location with Erik before writing — the prose
says Cairnhold, but Erik is the ground truth.

## GUARDS
- **Commit on ARRIVAL, not on mention.** Narrating "the road *toward* Cairnhold" is in-transit, not arrived;
  only a completed move commits. Don't teleport the player every time a place is named in prose.
- **Reuse the write-site discipline** — this is the SNG-067/068 commit pattern applied to location; not a new
  subsystem.
- **The reconcile is one-time + confirmed** — don't guess a location into a save; Erik confirms.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the GM turn already emit an arrival/`locationId` that simply isn't applied (missing reader), or does
   the turn contract need an `arrive` field? (Read a recent turn's raw output for Silas to see.)
2. Is `activeScene.locationId` supposed to be the source of truth and `currentLocationId` derived, or vice
   versa? They're both stale here — which one does the arrival write, and does the other follow?
3. The reconcile pass: a general "currentLocationId trails the last chronicle/scene location" backfill, or a
   targeted one-off for Silas? (General is safer if other saves have drifted the same way — likely.)
