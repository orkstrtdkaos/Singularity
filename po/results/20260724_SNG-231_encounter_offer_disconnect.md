# SNG-231 §3 — the GM can now offer the encounter POOL (the two encounter systems talk)

**CCode · 2026-07-24 · v1.8.258 (`21bc3fd2`) · suite + wiring + content CI green · live-verified.** *complete_pending_review. §3 (the keystone) shipped; §2 (a separate op-commit-throw trace) deferred as its own diagnostic.*

## §1 confirmed
`listAvailableEncounters()` (app.js) built the GM's `AVAILABLE ENCOUNTERS` block from `location.encounterSeeds` ONLY — a hand-authored, mostly-empty field. The random-encounter POOL (SNG-225's un-starved 62-row table) and the BESTIARY (SNG-229) were **unreachable through GM offers** — so at a generated location / the Disputed Zone, the GM had nothing to offer and `newEncounter`/`encounterOps` sat at 0 over 190 turns. The travel-tick path fired the pool; the GM-offer path read a different, empty source. The two systems didn't talk.

## §3 fix (the keystone — SNG-225/229/230 are all premised on encounters firing)
- **`eligibleEncountersFor(table, location, {cap})`** (random_encounters.js): the SAME `isEligible` danger+tag gate `pickEncounter` rolls against, but the FULL list — filtered to **structured** entries (`routing` duel/challenge, which synthesize real defs, **including the SNG-229 `beast_` duels**). Weight-ordered + capped (default 8) so the prompt isn't flooded. Loose narrative/opposed rows have no def to start, so they stay ambient narration (not offered by id).
- **`listAvailableEncounters`**: authored seeds AND the eligible pool (deduped against seeds). Danger-gated — a calm place surfaces little, a dangerous one real threats.
- **`onChoice`**: a GM-offered POOL id (an id with no pre-built def) routes through **`fireEncounter`** → the engage/decline offer beat (SNG-002b), so the decline path stays intact. No double-fire (the block is null during an active encounter; `onChoice` guards `!activeEncounter`).

## OQ answered
- **OQ1** (pool→offer surfacing): a shared `eligibleEncountersFor(location)` both paths use — built.
- **OQ2** (bestiary→encounter): the bestiary is **already in the pool** (SNG-229 §2b merged `beast_` duels into `randomEncounters`), so no separate path is needed — `eligibleEncountersFor` picks them up automatically.
- **OQ3 / §2** (the commit-throw): NOT this ship — flagged below.

## Verified
Live (fresh port) against the REAL loaded pool (88 entries, 26 beasts): danger-0 → **1** offerable (calm); danger-4 → **8** offerable, all real bestiary creature-duels (gloamwolf pack / glimmerling swarm / mire-gulper …). A player at a dangerous place can now MEET the monsters we wove, in the frame we built (SNG-230). Smoke: 5 new §231 checks (the eligibility gate + danger-scaling + the cap + both wirings). Suite + wiring-audit (`rawProseCaps` held at 63 via `smartClamp`; `testOnlyExports` 7) + content CI green.

## AEVI (per §OWNERSHIP)
Audit which **signature** locations deserve hand-authored `encounterSeeds` beyond the pool (a curated ambush at a specific place), and confirm bestiary→location eligibility (which creatures at which danger — currently the `minDanger` on each `beast_` entry). The pool now backstops every location; the seeds are the curation on top.

## §2 DEFERRED (a separate diagnostic, not the keystone)
The intermittent op-commit throw the CCODE-07 guard swallows ("part of this turn's bookkeeping didn't land") — instrument WHICH op throws (add the failing op id to the aside/log so it's diagnosable). Its own trace task; flagged, not built.

*— CCode. The pool, the bestiary, and the frame were all built; this is the connective tissue that makes them PLAY. The GM can finally offer what the world actually holds.*
