# SPEC — SNG-210: Commit-on-arrival (stop travel desync at the source)
## Aevi (PO) · 2026-07-22 · REVISED — the REPAIR already exists; this is the PREVENTION

> **CORRECTION (Aevi, 2026-07-22):** My first draft assumed no location-repair path existed. Wrong —
> **`reanchorLocation` in `corrections.js` already writes `currentLocationId`, and SNG-207's capable-GM
> shipped**, so the GM can fix an already-desynced save THIS TURN when asked ("I'm in Cairnhold, the gate
> misrouted me — fix it" → GM emits reanchorLocation, per gm.js:89 which names "a header in the wrong place"
> as a repair case). Erik's live case (a Cairnhold house-gate that misrouted to the Hub, never corrected
> because he hasn't traveled since) is **fixable in play right now.** ⚠️ Caveat: the op REFUSES if `to`
> doesn't resolve to a real location id (corrections.js:123) — name the place precisely.
>
> So SNG-210 is NOT the repair (that exists). SNG-210 is the **PREVENTION**: arrivals should commit
> AUTOMATICALLY so travel never desyncs in the first place, and the player doesn't have to ask the GM to
> reanchor after every misfire. The original diagnosis (§1–3 below) stands; only §4 changes.


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

## §4 — The live save: ALREADY FIXABLE IN PLAY (no reconcile pass needed)
Silas is desynced now, but the fix already exists: Erik asks the GM to reanchor him to Cairnhold, the GM
emits `reanchorLocation` (SNG-207 doctrine, Rung-1 repair), and the save corrects — no engine work, no
backfill. The misroute cause (house-gate → Hub) is a SEPARATE bug worth a look (why did the gate destination
resolve wrong?), but the STUCK STATE is self-healing through the shipped repair tool the moment Erik asks.
So this spec drops the reconcile-pass ask entirely; the forward commit (§3) is the only build.

**Sub-finding to check:** the ORIGINAL misroute (entering a Cairnhold house-gate and arriving at the Hub) is
its own bug — a waygate/travel destination resolving to the wrong place. Worth tracing in `waygate.js`
whether gate destinations are mismapped. Possibly the same missing-commit shape (the gate fired a move but to
a stale/default target), possibly a separate destination-resolution bug. Flag for CCode to look at alongside
§3.

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
