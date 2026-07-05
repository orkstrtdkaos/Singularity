# PO Alert — Singularity

> **Build status (Claude Code, 2026-07-04):** SNG-002b + SNG-001 phase 1 SHIPPED in v1.2.0 before this batch update landed — results: `po/results/20260704_SNG-002b_SNG-001.md` (complete_pending_review; two-browser live leg awaits Erik). Sub-places/map rework shipped same commit per Erik's direct ask. Batch tasks below not yet started.

**Status:** complete_pending_review — SNG-002b + SNG-001 phase 1 shipped v1.2.0; results: `po/results/20260704_SNG-002b_SNG-001.md`. Two-browser live leg awaits Erik.

---

## PO closure — SNG-002 (2026-07-04, Aevi)

**closed_green** with one open ratification question (below). Verified at origin: 180/180 smoke tests incl. 31 new; engine-before-GM ordering makes degradation structural; resolve.js untouched (hash-identical to pre-task); three seed encounters live with encounterSeeds on three locations; SYSTEM_SPEC §3/§6/§7/§9 updated in the ship commit; parse_probe.mjs guard adopted into ship checklist — good permanent add. Rule 18 shipped-then-ratified was a protocol deviation, correctly self-flagged, resolved by Erik's in-session amendment (v1.1.1). Accepted.

**✓ RATIFIED (Erik, 2026-07-04) — lethal × GM-invented:** GM-invented lethal duels are PERMITTED, with a hard avoidability condition: any lethal encounter (authored or invented) must be declinable before engagement — the entry choice always includes a clear avoid/refuse path, lethal stakes telegraphed in the offer itself, and flee remains available in round 1. Engine enforces: `sanitizeNewEncounter` keeps the lethal passthrough; encounter-offer clamp adds `avoidable: true` forced on all lethal encounters (entry cannot be ambushed/forced); smoke test for the clamp. Rule 18 wording gains one sentence: "A lethal encounter is always offered, never imposed — the player must have a clear path to decline before engagement." → **SNG-002b micro-amendment, bundled into next build session ahead of SNG-001 work.**

---

## Micro-task SNG-002b — Lethal avoidability clamp (do FIRST, ~30 min)

Per Erik's ratification above: (1) force `avoidable: true` on any encounter with `lethal: true` at offer time — an offered lethal encounter must present a decline path and cannot be entered without explicit player choice; (2) rule 18 += "A lethal encounter is always offered, never imposed — the player must have a clear path to decline before engagement."; (3) round-1 flee always available in lethal duels regardless of fleeDifficulty (difficulty applies, availability doesn't); (4) smoke tests: lethal-offer-carries-decline, forced-entry rejected, round-1 flee present. Update SYSTEM_SPEC §7 rule text. Then proceed to SNG-001 below.

---

## Task SNG-001 — v1.1 Party Play, Phase 1: Shared Scenes (ACTIVE)

**Task ID:** SNG-001
**Opened:** 2026-07-04 (Aevi, PO). Re-activated post-SNG-002 per ordering in `po/BACKLOG.md`.

**Goal (one session, one outcome):** Two characters (different browsers/devices, GitHub sync on) can occupy the same scene: both see the same scene anchor and beat history, turns resolve in order, and each player's GM turn includes the other party member's presence and actions.

**Scope — in:**
- `world/scenes/{sceneId}.json` — shared scene file: scene anchor, party roster (characterId, name, joined-at), ordered beat log, turn pointer. Same owned-file + SHA-retry discipline as `sync.js` ledger appends; polling ~20s while a shared scene is active.
- `engine/party.js` (new) — join/leave scene, poll loop, turn-order gate (client acts only on its turn; UI shows "waiting for {name}"), merge of remote beats into local chronicle.
- GM context — party block: other members' names, short bios, last actions, so narration weaves everyone. No GM-contract load-bearing rule changes this phase.
- **Encounter interop (new since original spec):** `character.activeEncounter` serializes into the shared scene file so party members SEE an ongoing encounter's state (round, both sides) in their GM context; joint participation in one encounter is OUT (phase 2) — one owner acts, others witness.
- UI — minimal: party sidebar entry, join-scene affordance from map/location when a shared scene exists at current location, turn indicator.
- Smoke tests for every new write path (scene create/join/append/leave; turn-order gate; poll-merge idempotency; encounter-state serialization into scene).

**Scope — out:** world-level time mode (Phase 2); codex/knowledge trading (Phase 3); joint encounter participation (Phase 2); GM-contract/resolution/design-law changes (Erik ratifies); simultaneous-action reconciliation beyond turn-order gating.

**Guardrails:**
- Shared scene file is the deliberate exception to owned-file writes: SHA-conflict retry with re-fetch-and-merge, never blind overwrite; merge rule documented in file header comment.
- Graceful degradation: sync off or poll failure → solo play continues at the location; no AI or network failure blocks play.
- Additive schema only (`schemaVersion: 1` on scene schema; optional character fields with defaults).
- No engine module imports content specifics. This repo never touches the ErikIAm pipeline.

**Files expected to change:** `engine/party.js` (new), `engine/sync.js`, `engine/gm.js` (party block), `engine/state.js` (active-scene ref), `app.js` + `index.html` + `style.css`, `schemas/` (scene/party schema), `tests/smoke.mjs`, `SYSTEM_SPEC.md` (§3, §6 party-play subsection, §9), `README.md`.

**Verification criteria:**
1. `node tests/smoke.mjs` + `tests/parse_probe.mjs` — all pass; state new count.
2. Two-browser live: A creates shared scene; B joins from same location; A acts → B sees A's beat within one poll cycle; B's narration references A by name. (Erik browser-leg or documented two-profile check.)
3. Turn gate: B blocked client-side during A's turn with visible waiting state.
4. Degradation: sync disabled → location behaves exactly as v1.1.x solo (no errors, no dangling UI).
5. SHA-conflict path exercised in a test (two writers, one stale SHA → retry-merge succeeds).
6. Encounter witness: A mid-duel, B's GM context carries the encounter state block (smoke or live).

**Rollback note:** Additive; revert commits; scene files inert without `engine/party.js`.

**Spec updates on ship:** §3 (party.js row), §6 (Party play subsection: polling/turn-order/merge numbers), §9 (mark phase 1 shipped; world-clock + trading + joint-encounters remain), §8 gotchas if polling adds any.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes tasks. Queue: `po/BACKLOG.md`.*
