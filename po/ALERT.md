# PO Alert — Singularity

**Status:** active — BIG UPDATE batch (SNG-BATCH-1)

---

## SNG-BATCH-1 — one build session, four phases in strict order

**Opened:** 2026-07-04 (Aevi, PO; batch requested by Erik). If the session runs short, ship phases completed in order — each phase is independently shippable and verified. Results: one file `po/results/YYYYMMDD_SNG-BATCH-1.md`, per-phase sections, `complete_pending_review` per phase.

### Phase 0 — SNG-002b: lethal avoidability clamp (~30 min, RATIFIED)
Erik's ratification (2026-07-04): GM-invented lethal duels permitted; lethality always avoidable. Build: (1) force `avoidable: true` on any `lethal: true` encounter at offer time — decline path always present, entry only by explicit player choice; (2) rule 18 += "A lethal encounter is always offered, never imposed — the player must have a clear path to decline before engagement."; (3) round-1 flee always AVAILABLE in lethal duels (difficulty applies, availability doesn't); (4) smoke tests: lethal-offer-carries-decline, forced-entry rejected, round-1 flee present. SYSTEM_SPEC §7 update.

### Phase 1 — SNG-003: ability catalog integration (content pre-authored by PO)
`content/packs/core/abilities/valley_craft.json` is ALREADY AT ORIGIN (12 unaligned abilities, PO-authored, registered in core manifest v0.2.0). Build work:
- Wire origin access: valley origin gains the valley_craft power system (its ability list at creation and level-up draws from it); harmonic/radiant origins may take valley_craft abilities at +1 levelReq (cross-training rule — add to resolution.json `leveling` block as `crossTraditionLevelPenalty: 1`; valley taking harmonic/radiant stays origin-gated as today).
- Author 8 new harmonic + 8 new radiant abilities IN THE STYLE OF the existing files and valley_craft (3-rank trees, hard `cannot` lines, `notFor` honest, grounded hopeful-strange, no ability trivializes another's niche). PO style bar: every rank names what it CANNOT do as concretely as what it grants; rank 3 is legend-adjacent but priced. Append to existing harmonic.json / radiant.json.
- Ability-picker UI: group by power system, show levelReq gating and cross-training penalty. Smoke tests: catalog loads (28+ abilities), cross-training gate, no id collisions.
- **PO review gate:** new harmonic/radiant entries land as content for Aevi review in results (verbatim list) — Aevi ratifies content; do not tune valley_craft entries.

### Phase 2 — SNG-007: character sheet & inventory screens
- **Character screen**, reachable any time in play: bio/backstory (full text), attributes + all 8 sub-attributes as current/20 bars with soft-cap knee at 4 visually marked, abilities with ranks + tree progress + energy cost after discounts, aptitudes, XP/level + banked points (pendingSubPoints, skillPoints) with spend-affordances, custom/GM-generated abilities, active quests summary, companions with assist tags.
- **Inventory screen**, first-class: item details from catalog, equipment/carried split, use/examine/drop, quantities. Sidebar strip remains as the quick view.
- Same components render at creation (point bars) and in play. Smoke: screens render from a fixture character; spend-affordance calls existing progression functions only.

### Phase 3 — SNG-005: companion bonds & evolution
- Bond value −10..10 per companion, same bands as NPC relationships; grows via witnessed shared deeds (companion present on the beat), assists used, encounters weathered together (data-driven weights in resolution.json `companions` block).
- Tiers: bond ≥3 assist cap +3; ≥6 companion grants one companion-specific ability (defined in companion JSON `bondGrants`); ≥8 evolution stage 2 (companion JSON `stages[]`: name/description/narrationHints shift — e.g. Aevi's motes condense and brighten). GM context gains bond band + stage per companion. GM-generated companions (Cellaceron case) get default bond track with GM-authored `stages` allowed via clamped op ONLY at creation, engine-owned after.
- Migration: existing companions bond 0, stage 1. Smoke: bond growth paths, tier unlocks, stage transition, GM cannot move bond directly.

### Batch-wide guardrails
Design law 1 absolute everywhere; graceful degradation on every new surface; additive schemas only; content-not-code; encounters/resolution math untouched except the named resolution.json blocks; this repo never touches the ErikIAm pipeline; `node tests/smoke.mjs` + `tests/parse_probe.mjs` green at every phase boundary — a phase ships only green.

### Verification (Erik browser-leg after ship)
1. Lethal offer shows decline path. 2. Creation: valley origin sees 13+ abilities grouped by system; cross-training gate visible. 3. Character screen from live play: backstory readable, /20 bars with knee, banked points spendable. 4. Inventory screen: examine + drop round-trip. 5. Companion panel shows bond meter; a shared deed moves it.

### Queue after batch
SNG-001 party play (spec below preserved) → SNG-004 origins-as-content (+ SNG-008 Heimrún/Mavens/framework weave). Full ordering: `po/BACKLOG.md`.

---

## Task SNG-001 — v1.1 Party Play, Phase 1: Shared Scenes (QUEUED — next after batch)

**Goal:** Two characters (different browsers/devices, GitHub sync on) share a scene: same anchor and beat history, turns in order, each player's GM turn includes the other's presence and actions.
**In:** `world/scenes/{sceneId}.json` (anchor, roster, ordered beats, turn pointer; SHA-retry re-fetch-and-merge, never blind overwrite; poll ~20s while active); `engine/party.js` (join/leave, poll, turn gate with waiting-UI, beat merge); GM party context block (names, short bios, last actions); encounter interop — `character.activeEncounter` serializes into the scene so partners WITNESS an ongoing encounter (joint participation = phase 2); minimal UI (party sidebar, join affordance at location, turn indicator); smoke tests on every write path + merge idempotency + encounter serialization.
**Out:** world clock; codex trading; joint encounters; contract/resolution/design-law changes (Erik ratifies); reconciliation beyond turn-order.
**Verify:** two-browser live (join, see beat within a poll, narration names partner); turn gate blocks with waiting state; sync-off degrades to exact solo; SHA-conflict retry-merge test; encounter-witness block present.
**Ship spec updates:** §3, §6 (party subsection), §9, §8 gotchas if any.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes tasks. Queue: `po/BACKLOG.md`.*
