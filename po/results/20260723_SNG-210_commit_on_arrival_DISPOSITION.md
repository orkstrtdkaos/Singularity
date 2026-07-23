# SNG-210 — commit-on-arrival — DISPOSITION: already built + robust; the desync was SNG-216

**CCode · 2026-07-23 · audit at v1.8.209 (`0a010f70`) · no code change — the build §3 asks for already exists.** Per your own discipline (*"audit for existence before speccing a build"*), I traced every premise before touching anything. The forward commit SNG-210 §3 wants is present, robust, and now durable; the desync Erik saw was the SNG-216 crash discarding the turn before persist, not a missing commit path.

---

## The commit-on-arrival path exists and is layered

When the GM narrates a completed move, `applyTurn` commits it — four layers deep:

1. **The reader** (`app.js:3864` → `3894`): `moveRef = turn.moveTo && (…location||…id||…)`; then `if (destId && destId !== currentLocationId) { character.currentLocationId = destId; addKnownPlace; notePlaceVisit; … }`. The move IS written to the durable field, plus known-places and a place-visit/chronicle mark — exactly §3's ask.
2. **The prompt contract** (`gm.js:90`): a forceful, explicit instruction — *"Whenever your narration MOVES the character to a different established place … emit moveTo … ⛔ WHEN THE PLAYER'S ACTION IS TO TRAVEL … you MUST emit moveTo this turn — narrating the journey without moveTo strands the player."* The arrival-within-a-scene case §3 names is called out verbatim.
3. **A text-salvage fallback** (`gm.js:419-421`): if the JSON parse drops `moveTo`, a regex recovers `{location, why}` from the raw response — so a malformed-but-present move still commits.
4. **The never-strand affordance** (`app.js:3903-3913`): a travel-intent turn that produced no arrival stashes `_pendingArrival`, and `renderPlay` offers a one-tap "arrive" on the map's own `travelTo` path. Even total emission failure degrades gracefully, never silently.

## §OQ answers

**§OQ1 — missing reader, or missing turn field?** *Neither.* The reader exists (`app.js:3894`) and is applied every turn; the turn contract already has the `moveTo` field and the prompt forcefully requires it. It's not a missing commit — it was the **SNG-216 crash** aborting `applyTurn` before the commit persisted.

**§OQ2 — is `activeScene.locationId` source-of-truth or derived?** *Derived.* `app.js:3962` rebuilds `activeScene = { locationId: character.currentLocationId, … }` at the end of every `applyTurn` — **`currentLocationId` is the source of truth; `activeScene.locationId` follows it.** The move-commit (3894) runs *before* the activeScene rebuild (3962), both inside `applyTurn`, so on a clean turn they cannot diverge. Both were stale in Silas's save because the SNG-216 throw aborted `applyTurn` before line 3962 *and* before the save-persist — so neither the commit nor the derive reached disk. The arrival writes `currentLocationId`; activeScene follows automatically. No second write needed.

**§OQ3 — reconcile pass?** *Dropped, per your own revised §4.* The forward commit is the only build, and it exists. Existing desynced saves self-heal via `reanchorLocation` (SNG-207, shipped) or the next clean travel; the GUARD forbids guessing a location into a save. ⚠️ One honest note below.

## The §5 sub-bug (house-gate → Hub) was already fixed by SNG-190

`waygate.js:100-107` is the fix, and its comment names Erik's exact case: *"The fail-OPEN branch this replaces sent Erik to The Crossing for lifting his mother's garden latch, because Cairnhold happens to contain a gate."* An unresolvable destination now **fails closed** (returns null → the caller resolves a sub-place to its parent / mints an adjacent place / stays put) instead of routing across the world to the hub. The misroute that started Erik's Cairnhold desync can't recur.

## Why the desync is fixed now

The throw happened *during* `applyTurn`. `applyTurn` mutates `character` in memory and persists at the end; a mid-apply throw discards the whole turn's mutations — including the `currentLocationId = destId` commit at 3894 — so on reload the save still holds the old location. With SNG-216's reader-harden, `applyTurn` runs to completion, the commit persists, and `activeScene` derives from the committed location. **The commit was never missing; the crash was eating it.**

## The one honest residual — flagged, not silently reconciled

A save that *already* desynced before the SNG-216 fix stays desynced on load — the fix prevents future loss, it doesn't retroactively replay the move that was discarded. SNG-216's v17 backfill heals `_gen`, not the location pointer (heuristically guessing `currentLocationId` from chronicle/scene would violate your GUARD *"don't guess a location into a save; Erik confirms"*). Per §4 these self-heal the moment the player travels again or asks the GM to `reanchorLocation`. **If Erik wants pre-fix saves auto-corrected rather than self-healing, that's a Round-2 call on a confirmed-per-save reconcile — say the word and I'll build it gated on Erik's confirmation, not a guess.**

## Disposition

**No code shipped — the build §3 specifies already exists, is robust across four layers, and is now durable because SNG-216 stopped the crash that discarded it.** This mirrors your repeated "already exists" audits: the honest deliverable is the trace, not a re-build of a working path. SNG-210's outcome (*travel commits, header agrees with prose*) holds at HEAD once SNG-216 landed. Marking `complete_pending_review` as a disposition; only-Aevi-closes — and if the pre-fix-save reconcile above is wanted, this reopens as a small confirmed-reconcile build.

*— CCode. The commit was there all along, wearing four coats; the crash was picking its pocket. 216 stopped the thief.*
