# Results — SYSTEM_SPEC v2.0 ROUND 2 + BOUNDARY-1 close (effects[])

Date: 2026-07-12 · v1.8.26 · `npm test` (smoke + parse_probe + content_ci) green · effects[] path live-verified on a fresh port. Status: **shipped, awaiting Aevi review of the spec corrections + Erik leg.** Only Aevi closes / promotes the spec.

Two coupled deliverables: the SNG-071 two-round spec cycle's ROUND 2 on `SYSTEM_SPEC.md`, and the code change it depends on (wiring the `effects[]` Aevi authored into the resolve path).

## Part A — BOUNDARY-1 CLOSED: quest outcomes apply machine-readable `effects[]`
Aevi authored `effects[]` alongside the prose `narration` and made `quest_structure.json` **require both**. `engine/quests.js → resolveStructuredQuest` now applies them **deterministically**:
`npc_state{npc,state,note}` · `disposition{people,delta}` (exact delta) · `codex_fact{text,secret}` (pinned via a sink) · `world_event{text,propagates,delayDays}` (dated on the shared clock) · `location_state` · `quest_seed` · `ally` · `xp`. NPC/people keys are the authored content ids (never slugified). Prose-only legacy outcomes still resolve via a fallback parser; the chronicle write is the findable floor either way.
- **This fixes the exact defect the prose parser had:** an elliptical "Veilwright: lowered" is now applied as **−1** instead of silently dropped.
- `content_ci.mjs`: every outcome must carry `effects[]` with ≥1 durable effect; giver resolves to an NPC; region is real (CI #9/#11).
- 7 BOUNDARY-1 smoke checks + a full live walkthrough: resolving "Grael Exposed" applied grael=fallen, fendt=restored, keeper_ilma ally, verist +2, **veilwright −1**, a dated world-event, pinned facts, +30 xp, findable chronicle. No console errors.

## Part B — SYSTEM_SPEC ROUND 2 (substrate-verified against HEAD v1.8.26)

### Where the draft was WRONG (the most important output — for Aevi to promote/amend)
1. **§4 XP "+3 novel" → the real `novelBonus` is 8.** (`resolution.json`.)
2. **§9 drift — the design implies a place's disposition pulls the character's spectrum over time; it does NOT.** Character drift comes only from the *action's* own axes (EWMA 95% retain / 5% pull, + precursor +0.05/use); `affinities.js` is a per-roll bonus with **no write-back**; there is **no decay routine** at all. The location→character bridge the design implies is unbuilt.
3. **§11 op list — `item ops` and `stateOps` do not exist at HEAD.** Items ride `characterDeltas.inventoryAdd/Remove` (there is no `itemUpdates`); `stateOps` is unbuilt. `relationshipDeltas`/`timeAdvanceHours` are live-but-legacy and absent from the reply contract (and `timeAdvanceHours` is silently discarded when `timeOps` is present).
4. **§3 conflated `canon.js` + `sync.js`** into one table row — they are separate modules.
*Everything else verified TRUE against origin:* all header counts (38 modules · 92 loc / 24 regions · 137 abilities · 24+3 traditions · 44 combinations · 41 NPCs · 9 companions · 58 encounters), §5's full ring order, §4's resolution/energy/recovery numbers, §6's access table, §9's encounter triggers (35/15/12%).

### The 11 `[CCODE]` markers, filled
- **§3 module map** — all **38** modules mapped from actual exports, grouped by concern, each as OWNS · API (public exports) · NEVER (invariant). Corrected the canon/sync split.
- **§4 energy recovery** — max 100; action cost 5; ability cost 4–15 (level/rank discounted); recovery is **active only** (breather +10/1h, sleep +40/8h, meditation 10+2×attunement); **no passive/time regen**; `regenPerRest` is a dead key.
- **§9 drift rates/decay** — the two-mechanic reality above, with the "not built" finding named.
- **§11 GM op set** — the complete op table (field → applier → clamp/gate) + the shared dispatch/validation shape (slice caps · numeric clamps · resolve-before-mint · engine-gated privileges · salvage path).
- **§20 check_pipeline #11–#18** — quest effects[] · combo→ability existence (catches `strike_basic`/`root_hold`) · tradition-id validity · origin homelands resolve · companion-manifest parity · a rating-floor regression unit (Law 13 tripwire) · version-line consistency · schema self-round-trip. Noted which already run in `content_ci.mjs`.
- **§22 debt CCode can see** — `slugify` lives in the wrong module; worldtime MODE is per-player vs "one clock"; legacy off-contract ops; `newEncounter` stashes-not-activates; quest stage-conditions advance manually; `narration`↔`effects[]` can drift with no linter; dead energy key; stale module-header self-descriptions; `parse_probe` can't reach `boot()`.
- Status line + footer updated: `round-2-complete`, corrections summarized inline for Aevi.

## Guardrails
Doc-only edits are Aevi's lane by default, but ROUND 2 is explicitly CCode's job in the two-round cycle (§21); I marked every correction ⚠️ and did not silently rewrite design intent — I reported it for Aevi to promote or amend. The one code change (effects[]) is engine-lane. `npm test` green; effects[] live-verified. Never touched the ErikIAm pipeline.

## Next per Erik's queue
SNG-056 (location-header desync) → SNG-058 (party leader) → SNG-052 → **SNG-073 the Skill Wheel** (supersedes SNG-054 Phase 2 — the skill tree becomes the great circle).
