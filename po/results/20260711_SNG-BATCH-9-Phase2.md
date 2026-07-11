# Results — SNG-BATCH-9 (Generative living world) · Phase 2 — Living advancement
Date: 2026-07-11 · Shipped v1.8.1 · Suite green at every sub-phase (652 checks, +17 over SNG-041) + parse_probe. Live-verified (clean origin). Status: **shipped, awaiting Erik preview-legs before complete_pending_review**. Only Aevi closes.

**The living half of the anchor.** Phase 1 grew a personal world; Phase 2 makes it MOVE between visits. Depended on BATCH-9 Phase 1 (generate + weight) AND SNG-041 (shared absolute dating) — both landed this session, in order. Built as two green sub-phases.

## 2a — Offscreen advancement of established generated entities
- **`engine/worldtick.js advanceGeneratedOffscreen`** — a SEPARATE call (runWorldTick untouched — lower blast radius, independently testable), wired into `maybeTick` after the world-tick + shared-world sync.
- **Established/nominated** generated NPCs + arcs advance while the player is away; an **injectable AI pass** imagines ONE small, in-grain development per the entity's **want/tension + disposition** — derives-never-fabricates (the prompt forbids drastic/contradicting/**future-dated** turns). Applied as an accumulated codex fact (`[while away] …`) so the entity has demonstrably **moved on** and surfaces, plus an away-digest item **dated on the SNG-041 shared absolute clock** (on-or-before now).
- **Gated two ways:** the Phase-1 engagement governor (fresh/dormant do NOT advance) and **real-time** elapsed world-days (`ws.lastTickWorldDay` baseline — the far world ages in real time; the first observation just anchors the baseline). Never throws (a failed pass is swallowed, returns empty).
- Live-verified: an established entity's offscreen log grew, the away-digest dated on the shared clock; a fresh entity did not advance; nothing-established advances the baseline but produces nothing.

## 2b — ⭐ keep boost + nomination surfacing
- **⭐ keep** = the explicit engagement boost (the complement to Phase-1's implicit score): `recordAttention` gains a `keep` signal at weight 4 — **one tap reaches established, two reach nominated**. Available, never nagged. On a grown entity's codex page: a **canon-tier badge** (◇ freshly grown / ◆ established / ★ notable) + a **⭐ Keep** button.
- **Nomination surfacing** (§3): entities crossing established→nominated surface as promotion candidates — a **"★ Notable — grown into your world's canon"** banner on the codex screen, each tappable to its page. `nominationsFor` carries **provenance + rating-tag** intact so Phase-3 promotion is zero-rework. **Surfacing only — no promotion** (that is Phase 3).
- Live-verified through the served build: the ⭐ Keep button, the keep handler, and the nominations banner all shipped; a keep pushed an entity to nominated and it surfaced as a candidate.

## Erik preview tests (Phase 2, live on v1.8.1)
1. **Offscreen life:** "Leave an established generated NPC or thread alone across a gap (a day or more of real time, then return) — it has moved on plausibly, and the *While you were away…* digest dates its deeds on the shared world-clock, on-or-before now."
2. **⭐ keep:** "Open a grown entity's codex page and tap **⭐ Keep** — it holds and advances (climbs toward *notable*), where an entity you ignore fades from what the GM raises."
3. **Nominations:** "Play a while and keep/return-to a few grown things — some surface at the top of your Codex as **★ Notable — grown into your world's canon** (candidates to become shared-world canon later)."

## Guardrails held
Design law 1 (engine owns the gate + scoring + dating; the AI pass only narrates a development, the engine applies + dates + caps it); only established-tier advances offscreen (the Phase-1 governor); disposition-consistent (in-grain, grounded in want/tension); away-digest dated coherently via SNG-041 (no future-date-as-current-news, on-or-before now); derives-never-fabricates; reused worldtick + weight + codex — extended, not reinvented; generation/advancement never halts a turn; suites + parse_probe green per sub-phase; never touched the ErikIAm pipeline.

## Where the anchor stands
- **BATCH-9 Phase 1** (generate + governor + rating/floors, v1.7.6→v1.7.9) + **SNG-041** (one clock, v1.8.0) + **BATCH-9 Phase 2** (living advancement, v1.8.1) — all shipped this session, awaiting Erik's legs.
- **Phase 3 remains** (shared-world promotion + the rating-lens + contradiction→rank) — the store is built promotable from day one (provenance, birth-weight, engagement/tier, rating-tag all in place), so Phase 3 is composition, not rework. Legends (SNG-042) ride this path — content anchors are authored (legends.json); the surfacing/deployment system is a follow-on.
- Live-verification used a fresh origin to bypass the long-lived preview tab's stale internal-module cache (a known artifact; Node loads the full graph across all 652 checks; served files correct).
