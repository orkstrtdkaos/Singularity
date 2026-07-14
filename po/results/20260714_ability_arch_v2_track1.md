# Results — Ability Architecture v2, Track 1 (engine)

Date: 2026-07-14 · v1.8.60 · HEAD `abf59d0` · npm test green · fresh-port verified. Status: **engine phases shipped, complete_pending_review.**

Builds the engine of `po/SPEC_AMENDMENT_ability_arch_v2.md` v2 (`af6080d`) — the depth-through-use architecture. Shipped in three committed phases. The content-judgment steps (classify 247 abilities, author native-gate entries, author axis-touch combinations) are Aevi's lane; the engine reads them with safe defaults so nothing breaks before the content lands. §7b and ID-collapse are out of scope (SNG-098 / SNG-099).

## Phase 1 — schema foundation + CI (non-behavioral)
- **state.js** loads abilities with tolerant defaults for the new fields: `rankProgression` → `"use"`, `nativeOrCombination` → `null` (unclassified), `combinationAxis` → `null`, `rankThresholds` default. The engine can read the new schema before every ability is tagged.
- **content_ci.mjs** validates the new schema **where present** (`nativeOrCombination` ∈ native|combination; a combination names a `combinationAxis` + carries an `unlockCondition`), **fails on any legacy `rankProgression:"spend"`**, and **reports the ability count** — **247** entries (the §7 header, now script-generated; both "137" and "233" were hand-count errors) plus classification coverage.

## Phase 2 — depth is EARNED, not bought (the core delta)
Skill points now buy **breadth only**; depth comes from play.
- **progression.js** — `autoAdvancePracticedRanks` (rank 1→2 **automatic** at the use threshold, free, fork-safe — a pending fork blocks the auto-advance, Law 9) + `markDefiningMoment` (rank 2→3, **GM-driven only**, engine-gated on the use threshold **and** `rank3Min`, so mastery can never be handed to an unpracticed craft). Built **on** the existing `practiceRankReady` — didn't reinvent it. The point-spend rank path is retired from every UI.
- **gm.js** — new **`markDefiningMoment`** op (REPLY-FORMAT + `salvageOps` whitelist + sanitizer clamp + rule 19B) and a **RIPE FOR MASTERY** context block (`masteryDetail`) so the GM only narrates a breakthrough the engine will honor.
- **app.js** — auto-advance hooked after **both** `recordUse` sites (toasts *"X is fluent now — rank 2"*); `masteryReadyForGM` feeds the GM; `applyTurn` applies the op (a craft that forks at rank 3 sets `pendingMasteryFork`, resolved on the Character screen — the player picks the permanent path, then the engine lands rank 3). **All four deepen surfaces converted** spend-button → progress line via a shared `rankProgress()` helper: **Skill Wheel + Graph** (SNG-097), **Level-Up modal** (SNG-094), **Character screen**, **play ability panel**.
- **6 smoke tests**: auto rank-2 at/below threshold; rank-3 never auto; `markDefiningMoment` masters / refuses-ungated / refuses-unpracticed.

## Phase 3 — skill-tree states + axis-touch combination hooks
- **skilltree.js** — `skillGraphModel` nodes carry a derived **`state`**: `OWNED_1/2/3` (from rank) · `LOCKED` · `AVAILABLE`, named from the flags the model already carried (no new computation). `nativeGrantsFor(tradition, catalog)` and `combinationsAvailableFor(tradition, char, catalog, thresholdMet)` (threshold predicate **injected** to avoid a practice.js circular import). Empty until combinations are authored + tagged.
- **practice.js** — `combinationThresholdMet` (reuses the live ~6 co-activation model; reads a machine trigger on `unlockCondition` — `components` co-activation or `viaAbilities` uses) + `ripeAxisTouchCombinations`. **A prose-only `unlockCondition` returns false** (see schema gap below).
- **7 smoke tests**: state derivation (OWNED_2 / AVAILABLE), prose-vs-machine threshold, ripe surfacing, native-grant reads.

## Phase 4 — reconcile migration: verified UNNECESSARY
Both the old spend model and the new use model store the rank in **`owned.level`**, and every new save read is optional-chained (`practice?.uses`, `pendingMasteryFork` defaults falsy). So old saves work unchanged and **no owned rank is ever stripped — Law 14 holds by construction.** A `reconcile.js` step would be dead code; none was added. *(The spec assumed a storage change that isn't there.)*

## Verification (fresh port 8354, deterministic)
- Clean boot, no console errors after the large app.js surgery.
- Live `autoAdvancePracticedRanks`: rank 1 → 2 fires at the use threshold. ✓
- Every deepen surface shows *"rank 1 · practiced 0/8 → rank 2 lands through use"* (or ripe-for-mastery / mastered) — **no buy button** on the Character screen, Skill Wheel, Graph, Level-Up, or play panel. ✓
- `content_ci` reports 247 entries; the spend path is clean. `npm test` green (13 new tests).

## ⚠ REMAINING — Aevi content, then one CCode wiring step
The engine reads all the new tags with safe defaults, so the game runs unchanged today. What's left is **content-judgment work (Aevi's lane)** plus the one engine step that can't be built or tested until that content exists:

1. **Classify the 247 abilities** `native` / `combination` (spec step 2) — a fiction call per ability (which functions a tradition natively owns vs reaches through an adjacent axis). CI reports **0/247 classified**.
2. **Native-gate entries in `attribute_gates.json`** (step 3) — the live table only covers levelReq 3+, so Tier I–II natives have no gate coverage. Author `{subAttribute, learnMin}` per native. *Depends on (1).*
3. **Axis-touch combination authoring** (step 9) — 3–5 per tradition with `unlockCondition`. **Schema gap found:** the spec's `unlockCondition` is prose (`{type, description}`) and is **not engine-computable**. To make the narrative threshold fire, each authored combination needs a machine trigger — `unlockCondition.components: [abilityIds]` (co-activation, ~6) or `unlockCondition.viaAbilities: [ids]`. `combinationThresholdMet` reads exactly these; a prose-only condition surfaces via the GM/creation instead.
4. **Native-grants-at-creation wiring (§8) — CCode, blocked on (1)+(2).** The reading functions (`nativeGrantsFor`, `combinationsAvailableFor`) are built; wiring them into the domain-selection/creation flow is deferred until natives are tagged so it can be built **and verified** against real grants rather than blind. Flagged, not forgotten.

## Files
`engine/state.js` · `engine/progression.js` · `engine/gm.js` · `engine/skilltree.js` · `engine/practice.js` · `app.js` · `tests/content_ci.mjs` · `tests/smoke.mjs` · `index.html`.
