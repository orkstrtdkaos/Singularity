# Results — The skill system reads at a glance, functions forward (SNG-124)

Date: 2026-07-16 · HEAD `ca9f23a` · **v1.8.88 (Phase A) + v1.8.89 (Phase B)** · `npm test` green · browser-verified. Status: **both phases shipped, complete_pending_review.**

Five coupled asks, built in two ships (engine + level-up, then the wheel — per Aevi's "engine before wheel" guidance).

## ROUND-2 catch — spec↔data family taxonomy
The spec named the 8 families **HARM/RESTORE/CONTROL/MAKE/KNOW/HIDE/WARD/EMPOWER**, but the authored `function_vocabulary.json` (SNG-092) groups the same 24 verbs as **HARM/RESTORE/PROTECT/KNOW/SHAPE/INFLUENCE/MOVE/SUSTAIN** — and every ability's `functions` verbs map to the *data* families. The content is canon, so everything is built on the real taxonomy. (Also found: the vocab was never loaded into `CONTENT` — added `loadRule("function_vocabulary")`.)

## Phase A (v1.8.88) — engine + level-up
- **`engine/functions.js` (new, pure):** `buildFunctionIndex` (verb→family inversion), `familiesOfAbility`, `functionCoverage` (which of 8 families a kit covers/lacks), `recommendSkills` (scored on **function-GAP** [highest value — a balanced kit], primary-native **class**, **style** tendency→family, ripe **aspiration**), `FAMILY_GLYPH`/`familyClass`.
- **P1 (bug):** `cs-levelup` was unconditional. A shared **`canLevelUp(character)`** now gates both the character-screen button and the sidebar (`skillPoints>0 || a ripe aspiration` — deepening is earned, not bought, so a 0-point character has nothing to spend there).
- **P2:** `renderLevelUp` gains a **"Suggested for you"** block — 2–4 gap-aware recommendations, each with a one-line *why*, function badges, and effective energy cost, learn-in-place (`data-lvllearn`). Above it, a coverage line names the missing families.
- **P3:** `FN_ICON` extended to all 24 verbs; `functionChips` promoted from muted text to **8-family colored badges** (color = family, glyph = verb — a fresh palette, function ≠ tradition).

## Phase B (v1.8.89) — the skill wheel organizes around functions
- **P4 — function overlay:** each wheel node gains a family-color **dot** (what it DOES, visible without hover) + an **8-family filter row**. Tapping a family lights up every craft that does it **across all traditions** (`.fn-match`) and dims the rest (`.fn-dim`) — "where can I heal?" as a pattern over the ring. Both axes visible at once; the SNG-073 great-circle geometry + SNG-054 zoom/pan are preserved (the filter re-render keeps the viewport).
- **P5 — names + cost at a glance:** owned / reachable / selected nodes now **label themselves** (short name + ⚡effective cost, SNG-103) instead of hover-only. The details panel shows **effective** cost (base shown when discounted) + colored function badges. `buildWheelModel` nodes carry `functions`/`families`/`effCost`/`reachable`; `FAMILY_COLOR` added for SVG fills.

## Guards honored
- **Geometry preserved** — function is an OVERLAY (dot/filter/color), not a reorganization; the great-circle/antipode structure and zoom/pan are untouched.
- **Recommendations never auto-spend** — they suggest + one-tap-learn (Law 9 offer-not-commit); the existing `learnAbility` gate + status message still governs.
- **Cost shown is effective** (SNG-103 discounted), never base, so the glance-number matches what you pay.
- **Respects foreclosure** — recommendations come from the same `learnable` set the modal already filters (domain gate + level), so a closed/foreclosed tradition is never pushed.

## Verification
- **9 smoke tests** (Phase A: buildFunctionIndex inverts the authored vocab; familiesOfAbility; functionCoverage covered/missing; recommendSkills ranks gap-fill above redundant + surfaces ripe first + carries cost/families; **every core ability's verb maps to a known family — no orphans across all 247**; Phase B: FAMILY_COLOR+GLYPH cover all 8). `npm test` fully green.
- **Browser-runtime, real loaded content:** the full load path now carries `functionVocabulary`; `functionCoverage`/`recommendSkills` produce real suggestions (*"Echo Sense — fills your KNOW gap"*); the wheel overlay resolves a family + dot color for every node, and the **KNOW filter matches exactly the 21 KNOW-capable crafts across traditions**. Boot-clean on 8221 + 8223, no console errors.
- The level-up modal render + the wheel's on-screen feel (badges lit, a filter dimming the ring, node labels at zoom) are templates over these verified helpers — eyeball in a keyed session with a real character.

## Files
`engine/functions.js` (new) · `engine/state.js` (load the vocab) · `app.js` (canLevelUp + gate; FN_ICON/functionChips → colored badges; renderLevelUp "Suggested for you"; wheel node functions/cost/labels + family dot + 8-family filter overlay; details panel effective cost + badges) · `style.css` (8-family badges, filter row, wheel labels/match/dim) · `tests/smoke.mjs` · `index.html`.
