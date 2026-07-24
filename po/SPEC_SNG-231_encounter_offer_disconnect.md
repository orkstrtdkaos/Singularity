# SPEC — SNG-231: The GM can't offer the encounter POOL — two encounter systems that don't talk
## Aevi (PO) · 2026-07-22 · verified at origin from the See-the-Machine panel

> **Erik (See the Machine):** shared the NOT-EMITTED panel — `newEncounter 0`, `encounterOps 0`,
> `newEncounter 0` over 190 turns. "Some strange things are happening — what ISN'T firing."

## §1 — Verified: the GM-offered encounter path reads a SEPARATE, mostly-empty source
Two findings from the panel, one real, one mostly-expected:
- **Real structural bug:** `listAvailableEncounters()` (app.js:2010) builds the GM's `AVAILABLE ENCOUNTERS`
  block from **`location.encounterSeeds`** ONLY — a HAND-AUTHORED per-location field. It does NOT draw from the
  random-encounter POOL (the 62-encounter table, the bestiary) at all. So:
  - Locations without authored `encounterSeeds` (most of them — all generated locations, the Disputed Zone
    Silas is in) → **empty AVAILABLE ENCOUNTERS block** → the GM has NOTHING to offer → `newEncounter`/
    `encounterOps` stay at **0**.
  - This is the SAME disconnect as SNG-225 wearing a different hat: the random pool fires on the TRAVEL/TICK
    path (`rollTrigger`/`pickEncounter`), but the GM-OFFERED path reads a DIFFERENT, mostly-empty field. **The
    two encounter systems don't talk.** The rich pool we built (SNG-225 un-starve, SNG-229 bestiary) is
    UNREACHABLE through GM offers — the GM can only offer hand-seeded encounters, which barely exist.
- **Mostly-expected (NOT bugs):** `markTeacher/adoptSchool/newAbility/unlockPrecursor/unlockSubstrate/
  offerAcquisition/offerPromotion/gambitOps` at 0 are all WIRED + prompt-documented; they gate on rare
  fiction-earned moments a cerebral/social/non-combat character (Silas reads people and talks — see the Kern
  scene) simply hasn't hit in 190 turns. The panel is correctly showing systems this PLAYSTYLE hasn't reached,
  not dead paths. (One to WATCH not fix: if a combat character ALSO shows encounter-0, that confirms §1's bug.)

## §2 — Also flagged: the image-1 COMMIT FAILURE (separate, real)
The turn showed "*(part of this turn's bookkeeping didn't land — the GM will restate it next beat.)*" — the
CCODE-07 guard (app.js:3206) caught an op THROWING during commit: the scene persisted, a state-op (a
characterDelta/codexUpdate from the Deathsense-reads-Kern beat) was LOST. The guard degrades gracefully and is
honest, but SOMETHING is throwing intermittently at op-commit. CCode: trace WHICH op and why (it's a real
seam failure the guard is papering over, not a cosmetic aside). Not this spec's core, but flag it.

## §3 — The fix: unify the GM-offered path with the POOL
`listAvailableEncounters` should offer from BOTH sources:
- **Keep** authored `location.encounterSeeds` (signature, hand-placed encounters — a specific ambush at a
  specific place stays curated).
- **ADD** the eligible random POOL for the current location — the same `pickEncounter`/`isEligible` set the
  travel path uses (post-SNG-225: danger-gated, region-lock dropped), surfaced as offerable encounter ids so
  the GM can invite one when the fiction fits. A dangerous place with no hand-seeds should still let the GM
  offer "the raider moves on you" from the pool.
- **AND the bestiary** (SNG-229): a location's danger + the loaded bestiary should make creature-fights
  offerable — the Disputed Zone's danger should let the GM offer a gloamwolf pack or a warpling, not nothing.
So the AVAILABLE ENCOUNTERS block = authored seeds + pool-eligible + bestiary-eligible, all as real
encounterIds the GM can offer per rule 18. THIS is what makes SNG-225/229/230 reachable through play — the
frame (SNG-230) can't frame an encounter the GM never offers.

## §4 — Why this is the keystone
Today built the encounter POOL (225), the BESTIARY (229), and the FRAME (230) — all premised on encounters
firing. This spec is the CONNECTIVE TISSUE: without it, all three are unreachable via GM offer (only via the
travel-tick auto-roll, which is a different, less deliberate path). Fixing §3 is what lets a player at a
dangerous location actually MEET the monsters we wove, in the frame we built. It's the difference between "the
systems exist" and "the systems play."

## OWNERSHIP
- CCode: §3 (unify listAvailableEncounters to draw seeds + pool + bestiary, danger-gated), §2 (trace the
  commit-throw). Engine.
- Aevi: content — audit which signature locations SHOULD have hand-authored encounterSeeds (a few key places
  deserve curated encounters beyond the pool); author those. And confirm the bestiary→location eligibility
  (which creatures offer at which danger). Flag when CCode's unified shape is set.

## GUARDS
- **Keep authored seeds curated** — the pool ADDS to hand-placed encounters, doesn't replace them; a signature
  ambush stays authored.
- **Danger-gated** (SNG-225 discipline) — the pool offers are danger-appropriate; a calm place still offers
  little/nothing UNBIDDEN (player-chosen danger always available per rule 18).
- **Don't double-fire** — an encounter offered by the GM and the travel-tick auto-roll must not both fire the
  same beat; the offer path and the tick path need a shared "already engaged" guard.
- **Silence can be correct** — most NOT-EMITTED ops are fine; do NOT "fix" markTeacher/newAbility/etc. to fire
  more. The ONLY zero this spec addresses is the encounter disconnect. Over-eager op-firing is worse than quiet.

## OPEN QUESTIONS — CCODE ROUND 2
1. Pool→offer surfacing: does `pickEncounter` already return an offerable id, or does the GM-offer path need a
   "list eligible pool ids for this location" variant (vs. the tick path's "roll ONE")? Likely a new
   `eligibleEncountersFor(location)` that both paths share.
2. Bestiary→encounter: does a creature become an encounter def via the SNG-229 §2b generative hook (if built),
   or does §3 need that hook FIRST? (231 may depend on 229 §2b — sequence check.)
3. §2 commit-throw: instrument WHICH op throws (the guard swallows it) — add the failing op id to the aside/log
   so it's diagnosable, not just "something didn't land."
