# Results — romance_guidance v2 (BUILD)

Date: 2026-07-14 · v1.8.58 · commit `09351ff` · npm test green · fresh-port verified. Status: **shipped, complete_pending_review.**

Builds Aevi's ratified `po/romance_guidance.md` v2 (`d53abdd`). The GM now engages with romance instead of hedging, honors the live 5-value rating enum as a per-tier register, and pulls a craft-guidance doc on romantic intent. R+ ratified by Erik as **permission-to-the-line** (everything within the AUP is expected; hedging below the line is the error).

## What shipped

**Part 1 — the registers → `ratingRegister()` (gm.js).** Rewrote the romance clause of every rating; the violence clause is preserved unchanged.
- `G` — romance not present (redirect warmly; it's an explicit exclusion, not the uncertain-fallback).
- `PG` — soft: flirtation, hand/shoulder, closed-mouth kisses, nothing below the collarbone, camera looks away.
- `PG-13` — full development: explicit attraction, kisses fully described, follow a couple to the door of a private moment and close.
- `R` — mature: the scene follows where it goes; disrobing, physical response, the arc of a scene; **no fading to black on a player who chose R**.
- `R+` — **PERMISSION TO THE LINE**: the full charged register is yours, take all of it; **stopping short of the line is the error**; the line is the AUP (charged/sensual/explicit-in-register, *not* graphic mechanical depiction); **never trade specificity for explicitness** — if the scene could be any two people, R+ has failed.
- default (unknown preset) → safe mid ("short of the explicit").

**Part 2 — engagement frame → `ratingLineForGM()` (app.js), system tier after `## CONTENT CEILING`.** The GM engages, never inserts safety/consent meta-language, treats light social touch as a social action (not a harm trigger). **Precedence clause:** engagement governs whether/how the GM shows up; the ceiling governs the register; engagement never overrides the ceiling, the ceiling never excuses disengagement; and **narrating below the rating is the far more common failure.**

**Part 3 — craft doc → pulled on romantic intent.** `content/packs/core/rules/romance_guidance.json` (reading the room · emotional beats · physical presence language · NPC interest signals · social rolls / INFLUENCE functions · tradition voice · pacing · difficult dynamics). Registered in `manifest.json`, loaded via `loadRule` into `CONTENT.romanceGuidance` (state.js). On a `romantic`/`flirt` intent this turn, `runGM` sets `romanceGuidanceDetail` and gm.js pushes it as a `## THIS IS A ROMANCE BEAT` scene block — the existing conditional-`scene.push` pattern (`substrateDetail`/`worldPressureDetail`).

**Intent detection.** Added `romantic`/`flirt` to the `parseIntent` intentTags vocabulary (gm.js) — no second model call; `sanitizeIntent` passes the tags through. `runGM` reads `resolution.action.intentTags` (present on both rolled and trivial/no-roll actions).

## Review points closed (all four Qs + the ROUND-2 flags)
- **No `adultGate` field invented** — reads `ratingCeiling(profile)` over the live `G/PG/PG-13/R/R+` enum. `adultGate` stays the boolean authority param it is.
- **No parallel tier scheme** — Part 1 rewrites `ratingRegister`'s romance clauses; there is exactly one place the register is stated.
- **Doc under `content/packs/core/`**, manifest-registered (the draft's `content/gm/` would 404 on Pages).
- **One conditional field, no new injection infra.**
- **Minor + no-prohibited floors unchanged** (app.js:1118 / art.js clamp) — the register change does not touch them; the R+ "line" is the AUP and holds without exception.

## Verification (fresh port 8353, deterministic surfaces)
- Clean boot, no console errors.
- `ratingRegister`: R+ carries permission-to-the-line + "stopping short is the error" + holds-the-line (no graphic mechanical depiction) + specificity clause; PG soft/collarbone; G not-present; default safe. ✓
- `manifest` lists `rules/romance_guidance.json`; doc loads (7415 chars, tradition voices present). ✓
- `buildTurnContext` injects the romance doc + `THIS IS A ROMANCE BEAT` header **only when** `romanceGuidanceDetail` is set; absent on non-romance turns (no leakage). ✓
- `npm test` green: smoke (R+ register tests **updated to the ratified v2 contract** — the two that asserted the retired "evocative, not explicit" wording), parse_probe clean, content_ci (romance doc registered + non-empty), balance_sim anchors hold.

*The one surface not exercised end-to-end here is the model actually classifying a given input as `romantic` — that requires a live Claude call (no key in dev). The tag flows through `sanitizeIntent` un-whitelisted and the whole downstream path is verified; classification is the model's job.*

## Files
`engine/gm.js` (registers · intent tags · ctx field + scene push), `app.js` (engagement block · runGM detection · version), `engine/state.js` (load), `content/packs/core/rules/romance_guidance.json` (new), `content/packs/core/manifest.json` (register), `tests/content_ci.mjs` (gate), `tests/smoke.mjs` (register tests → v2 contract), `index.html`.
