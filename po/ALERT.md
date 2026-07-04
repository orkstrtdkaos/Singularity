# PO Alert — Singularity

**Status:** active

---

## Task SNG-001 — v1.1 Party Play, Phase 1: Shared Scenes

**Task ID:** SNG-001
**Opened:** 2026-07-04 (Aevi, PO)

**Goal (one session, one outcome):** Two characters (different browsers/devices, GitHub sync on) can occupy the same scene: both see the same scene anchor and beat history, turns resolve in order, and each player's GM turn includes the other party member's presence and actions.

**Scope — in:**
- `world/scenes/{sceneId}.json` — shared scene file: scene anchor, party roster (characterId, name, joined-at), ordered beat log, turn pointer. Written via the same owned-file + SHA-retry discipline as `sync.js` ledger appends; polling ~20s while a shared scene is active.
- `engine/party.js` (new) — join/leave scene, poll loop, turn-order gate (client acts only on its turn; UI shows "waiting for {name}"), merge of remote beats into local chronicle.
- GM context — party block: other members' names, bios (short form), last actions, so narration weaves everyone (extends existing scene-anchor plumbing; no GM-contract rule changes in this phase).
- UI — minimal: party sidebar entry, join-scene affordance from map/location when a shared scene exists at the current location, turn indicator.
- Smoke tests for every new write path (scene create/join/append/leave; turn-order gate; poll-merge idempotency).

**Scope — out (later phases or Erik-ratification territory):**
- World-level time mode (one world, one clock) — Phase 2.
- Codex/knowledge trading — Phase 3.
- Any change to GM-contract load-bearing rules, resolution math, or design laws §2 — needs Erik.
- Conflict resolution beyond turn-order gating (no simultaneous-action reconciliation this phase).
- Same-scene combat mechanics beyond existing resolution (no initiative system this phase).

**Guardrails:**
- Design law: a client writes only files it exclusively owns — the shared scene file is the deliberate exception; it must use SHA-conflict retry with re-fetch-and-merge, never blind overwrite. Document the merge rule in the file header comment.
- Graceful degradation: sync off or poll failure → play continues solo in the same location; shared scene features simply absent. No AI failure or network failure may block play.
- Additive schema only: new `party.schema.json` (or scene schema) gets `schemaVersion: 1`; character records gain optional fields with defaults.
- No engine module may import content specifics.
- This repo never touches the ErikIAm pipeline.

**Files expected to change:** `engine/party.js` (new), `engine/sync.js` (scene read/write helpers), `engine/gm.js` (party context block), `engine/state.js` (active-scene reference on character), `app.js` + `index.html` + `style.css` (UI), `schemas/` (new scene/party schema), `tests/smoke.mjs` (new tests), `SYSTEM_SPEC.md` (§3 module row, §5 or §6 party-play subsection, §9 roadmap tick), `README.md` (roadmap line).

**Verification criteria (per-change, specific):**
1. `node tests/smoke.mjs` — all existing tests pass plus new party-path tests (state the new count in results).
2. Two-browser live check: browser A creates shared scene at a location; browser B joins from same location; A acts → B sees A's beat within one poll cycle; B's GM narration references A by name. (Erik browser-leg or documented two-profile local check.)
3. Turn gate: B attempting to act during A's turn is blocked client-side with visible "waiting" state.
4. Degradation: with sync disabled, the location behaves exactly as v1.0 (no errors, no dangling UI).
5. SHA-conflict path exercised in a test (two writers, one stale SHA → retry succeeds).

**Rollback note:** All changes additive. Rollback = revert commits; shared scene files in `world/scenes/` are inert without `engine/party.js` and can remain.

**Spec updates required on ship:** §3 (module inventory + party.js row), §6 (new "Party play" subsection with the polling/turn-order/merge rules and their numbers), §9 (move shared-scenes from roadmap to shipped; leave world-clock + codex-trading listed), §8 gotchas if polling adds any.

---

*This file is the task ledger between Aevi (Product Owner) and Claude Code build sessions. Task template and flow: `SYSTEM_SPEC.md` §10. Results land in `po/results/`. Only Aevi closes tasks.*
