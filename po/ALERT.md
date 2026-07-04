# PO Alert — Singularity

**Status:** active

---

## Task SNG-002 — Encounters Engine (duels, challenges, puzzles)

**Task ID:** SNG-002
**Opened:** 2026-07-04 (Aevi, PO). Direction ratified by Erik 2026-07-04. Sequenced ahead of SNG-001 (party play) by Erik's call — scenes get teeth before the family shares them.

**Goal (one session, one outcome):** A location can declare an encounter; entering it starts a typed, multi-round/multi-stage structure where each round resolves through the existing d100 engine and the GM narrates per-round receipts. One duel, one challenge, and one puzzle authored and playable in the Valley.

**Scope — in:**
- `engine/encounters.js` (new) — generic encounter state machine. Three types:
  - **duel/battle:** opponent stat block (`health`, `threat` 0–100, `spectrum`, `tacticTags[]`, `yieldAt`, `fleeDifficulty`). Round loop: player declares action → normal `successChance` roll, opposed by opponent threat as difficulty; margins map to opponent-health/player-health deltas (data-driven table in resolution.json → `encounters.duel`); end states: opponent yields/falls, player yields/flees/falls (falls = incapacitated, never auto-death — GM narrates consequence).
  - **challenge:** ordered stages (each a typed action: attribute/skill/axes/difficulty); partial failure costs (health/energy/time) from the stage record, not full stop; complete/abandon end states.
  - **puzzle:** attempts cost energy/time; `hintTiers[]` revealed through the existing sense filter (attunement gates how much you're told); `codexUnlocks[]` — knowing a codex topic can open a solution path; solve/walk-away end states.
- Content schema: `content/packs/*/encounters/*.json`, `schemaVersion: 1`; locations gain optional `encounterSeeds[]` (like questSeeds). Engine loads whatever manifests declare.
- Rules numbers: new `encounters` block in `content/packs/core/rules/resolution.json` (duel margin table, challenge failure-cost defaults, puzzle attempt costs). All tuning lives here.
- GM integration: encounter receipt block in the turn context (round #, both sides' state, roll receipt); GM narrates receipts and proposes choices — **never** advances encounter state itself; `encounterOps` typed + engine-clamped like all other ops. Draft contract rule text goes in the results file for **Erik's ratification before ship** (load-bearing rule).
- Companions assist inside rounds (existing companionBonus path). Abilities/items usable as round actions. Novel-use and discovery work inside encounters unchanged.
- First content (Aevi-authored post-build if session runs long — flag in results): one duel (Disputed Zone raider), one challenge (rockslide crossing), one puzzle (Precursor mechanism, water-crisis adjacent — truth field GM-eyes-only).
- Smoke tests: every state transition (start/round/stage/attempt/end for all three types), clamp paths, margin table edges. State new test count in results.

**Scope — out:**
- Party-play interaction with encounters (SNG-001 lands after; design encounter state to serialize cleanly so shared scenes can carry it, but build no sync).
- Initiative systems, multi-opponent battles (v-next of encounters).
- Any change to `resolve.js` math — encounters CONSUME resolution, never modify it.
- New abilities (SNG-003), inventory/character screens (SNG-007).

**Guardrails:**
- Design law 1 absolute: model never rolls, never edits encounter state freeform. All GM encounter influence flows through typed, clamped ops.
- Graceful degradation: GM parse failure mid-encounter → engine state holds, plain narration fallback, encounter continues; no failure blocks play or strands the character.
- Content-not-code: no opponent, stage, or puzzle specifics in engine files.
- Additive schemas only. Incapacitation, never engine-imposed death.
- This repo never touches the ErikIAm pipeline.

**Files expected to change:** `engine/encounters.js` (new), `engine/gm.js` (receipt block + encounterOps parsing), `engine/state.js` (active-encounter on character), `app.js` + `style.css` (encounter UI: round header, both-sides status, action bar), `content/packs/core/rules/resolution.json` (encounters block), `content/packs/valley/encounters/` (3 seed encounters) + valley `manifest.json` + touched location files (encounterSeeds), `schemas/` (encounter schema), `tests/smoke.mjs`, `SYSTEM_SPEC.md` (§3, §6, §7, §9), `README.md`.

**Verification criteria (per-change, specific):**
1. `node tests/smoke.mjs` — all prior tests pass + new encounter tests (state count).
2. Live: start the raider duel → at least 3 rounds with visible per-round receipts (chance, roll, margin, both health bars moving) → reach two different end states across runs (win, flee).
3. Live: rockslide challenge — fail one stage, verify partial cost applied and progression continues.
4. Live: Precursor puzzle — verify hint tier shown matches character attunement tier; verify a codex-unlocked path appears only when the topic is known.
5. Degradation: force a GM parse failure mid-duel (malformed reply in test harness) → engine state intact, plain narration, next round playable.
6. GM contract rule draft present in results file, awaiting Erik ratification — ship blocks on it.

**Rollback note:** Additive. Revert commits; encounter content files inert without engine module.

**Spec updates required on ship:** §3 (encounters.js row), §6 (Encounters subsection with margin table + all numbers), §7 (ratified rule text), §9 (mark shipped; note party-play interaction deferred to SNG-001).

---

## Queue note
SNG-001 (party play, previously active) returns to queue — now first after SNG-002. Full backlog + ordering: `po/BACKLOG.md`.

---

*This file is the task ledger between Aevi (Product Owner) and Claude Code build sessions. Task template and flow: `SYSTEM_SPEC.md` §10. Results land in `po/results/`. Only Aevi closes tasks.*
