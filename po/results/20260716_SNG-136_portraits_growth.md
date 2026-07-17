# Results — Portraits reflect lived growth (SNG-136)

Date: 2026-07-16 · HEAD `53a3b79` · **v1.8.95** · full suite green · browser-verified. Status: **shipped, complete_pending_review.**

Two additions to the existing art plumbing (`addGalleryImage`/dedup/cap/floors all unchanged) — not a new pipeline.

## Part 1 — the chronicle feeds the character seed
`characterPromptSeed` (art.js) now folds in the **lived record**: a level-band clause (level 5 / 8 / 12 tiers), the **latest major deed** (`|weight|≥2`), and the current **personal-arc stage** (SNG-133) — bounded to a few evocative clauses. The seed motivation shows only until real deeds accrue. Because the every-2-levels regen (`refreshPortraitMilestone`) builds through this seed, a level-11 portrait now differs meaningfully from level 1 — *"seasoned, bearing the marks of what they've done, ended the raider-lord at the weir…"* Same lived source that feeds SNG-134's evolving header story.

## Part 2 — NPC portraits fire on high bond milestones
- **`npcPromptSeed(npc, character)`** (new, art.js) — the NPC's look + role + their bond to the player ("partner romantic to Silas"); used by `assembleImagePrompt`'s `npc` branch (was a bare form+role line).
- **`npcPortraitTier(n)`** (new, pure, npcs.js) — returns the high milestone (`partner` / `committed` / `sworn` / **devoted-band** score≥7) or null. The higher tiers only — never every acquaintance. The devoted band catches Pell.
- **`ensureBondPortraits(character)`** (app.js) — scans the registry and mints **one portrait per NPC per tier** (deduped via `n._portraitTier`) → `addGalleryImage`. Runs **after each turn's npcUpdates** (a bond that crossed this turn) **and once on load** as the **retro backfill** (Pell, already devoted, gets hers). Art-off = no-op; rating-lensed + minor-safe via `ensureImage`'s floors; a failed gen records **no tile**.
- **`pruneEmptyGalleryTiles(character)`** — drops any prior blank (the Vash-style failed-gen tile) on load, so the gallery never shows an empty card.

## ROUND-2 answers
1. **Milestones:** romantic `partner`/`committed` bondStages + `sworn` bondType + the `devoted` band (score ≥ 7 — Pell). The high ones only.
2. **Regen cadence:** reuses the existing every-2-levels `refreshPortraitMilestone` (now seeded from the enriched, lived prompt) — no new counter needed.
3. **The empty tile:** treated as a persisted blank → **prune-empty-on-load**, plus `ensureBondPortraits` only records a tile when the mint URL actually resolved (no new blanks).

## Guards honored
- **Bounded seed** — a few clauses (latest deed + level-band + arc stage), not the whole log.
- **High milestones only, deduped** — one portrait per NPC per tier; never every acquaintance, never every turn.
- **Rating-lensed + minor-safe** — the NPC prompt runs the same `ensureImage` floors; romantic-tier milestones are unreachable with a minor (SNG-108 gate), so a minor bond stays platonic/floored.
- **No empty tiles** — a failed gen leaves no gallery card; blanks are pruned on load.
- **Reuses existing plumbing** — `addGalleryImage`/dedup/cap/seed-stability all unchanged; this adds the triggers + the NPC seed.

## Verification
- **6 smoke tests:** a level-11 seed with deeds differs from level 1 (lived record folded in); the seed carries the latest major deed + a level-band clause, bounded (excludes routine deeds); a fresh seed unchanged; `npcPromptSeed` weaves look+role+bond; `npcPortraitTier` fires on the high milestones only (dedup by tier). Full `npm test` green.
- **Browser-runtime, served modules:** the lived seed folds in the deed + level-band; `npcPromptSeed` is bond-aware; `assembleImagePrompt('npc')` uses it; `npcPortraitTier` high-only. 4/4. Boot-clean on 8235.
- The actual portraits (a level-up regen showing the marks; Pell's backfilled portrait in the gallery) need a keyed play session with art on — that's the eyeball part; the seed enrichment + trigger logic + dedup are verified.

## Files
`engine/art.js` (characterPromptSeed lived-record fold-in; new npcPromptSeed; npc branch uses it) · `engine/npcs.js` (npcPortraitTier) · `app.js` (ensureBondPortraits + pruneEmptyGalleryTiles; wired after applyNpcUpdates + on load) · `tests/smoke.mjs` · `index.html`.
