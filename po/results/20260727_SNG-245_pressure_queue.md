# SNG-245 — The Pressure Queue: make the world DRIVE

**CCode · 2026-07-27 · v1.8.291 (`250ba382`) · npm test exit 0 (18 new checks, SYSTEM_SPEC count 68, ENGINE_MAP ok, wiring audit all-pass, rawProseCaps 63).**

Erik: *"We have quest/arc advancement, NPCs with wants, villains with agendas... but how do we make them HOOK
the narrative and DRIVE a player? ACTIVITY!"*

## The gap (spec §1, verified)
The world had an initiative TRIGGER (SNG-080 "THE WORLD ACTS" fires on quiet turns) but nothing DRIVEN to fire —
it handed the GM a generic `pressureDirective` ("invent something"), so the GM invented a generic something. The
villain schemed but never *moved on you*; the NPC wanted but never *came to you*; the beast waited but never
*attacked*. The pieces existed; they were never wired to the trigger.

## What I built (the ONE connective piece + repoint)
### `engine/pressure.js` (new, pure) — the Pressure Queue
- **The registry:** `ensurePressureQueue`, `enqueuePressure` (de-duped by `(kind, subjectId)` so the same person/
  threat is never queued twice; a fresher/higher-urgency copy wins; urgency-ordered; capped at 6), `pullTopPressure`
  (returns the top entry that still applies, dropping location-bound entries the player has walked away from).
- **Producer A — `npcWantPressures` (npc-unmet-want, SNG-233):** a BONDED NPC (a real bondType, or devoted/ally
  standing) who is NOT with the player, whose want is authored, and whom the player hasn't seen in longer than the
  staleness threshold → an entry whose hook names them + their want ("they come to you"). Staleness = `now −
  lastSeen.day`; the threshold scales with the aggression pref (`wantStalenessThreshold` — Calm waits ~22d,
  Relentless ~5d). `becomes: scene`.
- **Producer B — `threatAttackPressure` (threat-attack):** a REAL beast/threat from the player's location's
  eligible pool (`eligibleEncountersFor`, never invented), rolled on `danger × pacing`. `becomes: { encounter,
  encounterId }` — **teeth:** it routes through the SNG-236 hard-frame and becomes a real defend-encounter, aimed
  at your ground.
- `engine/pacing.js`: `drivenPressureDirective` — weaves a queued hook as a real story beat, never a system toast.

### `app.js` — the wiring
- **`runPressureProducers`** runs on the world tick (a boundary — primes driven things without per-turn churn),
  gathering the real `npcRegistry` + wants (interiority overlay first, then the catalog want) + the eligible pool,
  and enqueuing onto `character.worldState.pressureQueue`.
- **`maybeWorldPressure` REPOINTED:** on a quiet-turn fire it PULLS the top entry aimed where the player stands.
  A threat → `pendingEncounterOffer` (the framed defend-encounter). Else → a driven scene directive. It falls back
  to the generic escalating push **only when the queue is empty** (SNG-080 behavior preserved).

### Guards honored
- **Driven, never relentless:** `maybeWorldPressure` now inherits the tender/intimate-scene floor the SNG-080 path
  never had (it only checked `eventful`/`gambitDraft`) — a driven push obeys the same "never break an intimate/
  intense beat" rule the encounter path (SNG-075) does, plus the grief/vigil/mourn intent-tag floor. It also never
  stacks on an encounter that already turned up this beat.
- **Aimed, not random:** an entry with no `subjectId` is refused; every entry is a real person/threat.
- **The hook has teeth:** a threat-attack becomes a real defend-encounter (the SNG-232/236 lesson — an event that
  can't engage is fog), not a line of flavor.
- **The player can still say no:** the framed encounter carries a decline path; a driven scene is an invitation.

## Live verification (fresh port 8365, real content, dev character)
On the tick (`enterPlay → maybeTick → runPressureProducers`):
- **npc-want:** the queue filled with a real entry for **Pell** — urgency 4, aimed, `becomes: scene`, hook reading
  her ACTUAL authored want ("Silas's ATTENTION, undivided…"), computed from a 35-day absence. **Not duplicated**
  across repeated ticks (dedup proven).
- **threat-attack:** at the dangerous `disputed_zone_fringe`, the producer picked a **real bestiary creature**
  (`beast_rust_choir_gnats`) → `becomes: { encounter, encounterId, name }`, aimed at that location, hook naming the
  foe. Both producers fired together, both aimed, both with real subjectIds + teeth.
- The consumer half (`maybeWorldPressure` pulls the top on a quiet turn) is unit-covered (`pullTopPressure` drops
  stale + returns top-urgency) and wired; a live GM turn *consuming* an entry needs an API key to exercise.

## Owed (per the spec OWNERSHIP)
- **AEVI:** the hook VOICE per kind (so a push reads as a story beat, not a system event) + the producer RULES/
  thresholds (the *design* of "driven" — how long unmet, how a want becomes a knock). My hooks are serviceable
  defaults; the exact register + thresholds are your lane.
- **ERIK:** the aggression FEEL — the pacing pref is the dial (Calm→Relentless); tune `wantStalenessThreshold`
  (days unseen) and the threat-attack chance (`0.10 × danger × pacingMult`) to taste. And which producer to wire
  next: villain-move / arc-stir / treasure-rumor / a fired wake → a pressure entry (the natural home per spec §3)
  are the authored follow-ons — the queue + repoint are built to take them without more plumbing.

*— CCode. Every agenda you authored can now DRIVE: the bonded NPC reaches for you, the beast comes to your ground.
Two producers prove the loop; the rest plug into the same queue. status: complete_pending_review.*
