# Results — The World-Authorship Chronicle (SNG-128)

Date: 2026-07-16 · HEAD `9173bc0` · **v1.8.86** · `npm test` green · browser-runtime verified. Status: **shipped, complete_pending_review.**

Brooklyn intuited by playing that her actions are world-affecting — and the engine already agreed; it just never showed her. This is **surfacing, not inventing**: every number is read from real provenance flags, never estimated.

## ROUND-2 answers
- **Q1 (session boundary):** none existed at HEAD — no session object anywhere. Built a lightweight one: `touchSession` (each beat) opens a new session after a real-time gap (3h) or an explicit `endSession`, else extends the current one. Pure given an injected clock (the app passes `nowISO`/`worldDay`); capped at 40 on the save.
- **Q2 (does canon carry the contributor?):** yes — `_canon.provenance.playerKey/.characterId` was already stamped at nomination. Added a friendly `_canon.contributedBy` alias in `buildCanonRecord` so the readout names the author cleanly; `contributionsBy` reads either.
- **Q3 (world-effect formula):** weighted — promoted-shared entities × their realness weight (`effectiveWeight`), not a bare count. Matches the realness model; a heavily-real place counts more.
- **Q4 (paragraph machinery scoped to a session):** reused via `buildSessionPrompt` — the SNG-109 chronicle voice, scoped to one session's deeds + what it made/persisted, facts-only + ceiling-bound.

## Part 1 — the session log
`sessionLog(character)` returns each session newest-first with the content that fell in its span: **deeds scoped by real time** (`deed.at ∈ [startedAt, lastAt]`), **places minted / people met / canon promoted** by the session's world-day range. The Chronicle renders it as an expandable list; each session has an on-demand **"✍ Write session recap"** button (lazy, cached on the session, reuses `buildSessionPrompt` → the `chronicle` model task at the GM's ceiling). An **"End this session"** control closes the current span.

## Part 2 — the authorship readout (the part Brooklyn wanted)
`authorshipStats(character, content)` — all pure, all from real flags:
- **Canon vs. novel** — authored places you've stood in + authored people you've met (in `CONTENT.*`, no `_gen`) vs the novel records you minted (`character.generated.*`). *"14 authored places walked · called 6 new ones into being."*
- **Persistence tally** — of your novel content, how much is **shared-world canon** (`_gen.promotedWorldDay != null && canonTier === "canonical"`), how much **personal** (not yet promoted), how much a **rumor/variant** (lost a contradiction). Read straight from the local tiers.
- **World-effect** — the weighted headline number: her intuition made literal. *She was right; the Chronicle shows her the number.*
- **Attention map** — the not-yet-shared entities she's poured the most attention into (highest `engagementScore`), "what you're making real right now."

## Part 3 — across the family
`crossCharacterAuthorship(characters, content)` ranks each visible character by world-effect (novel-count · canon · world-effect). Rendered as an "Across the family" board (only when 2+ are visible). Privacy honored: **your own characters always show; another player's shows only if that player set `sharedChronicle`** (opt-in, default off). `contributionsBy(store)` is the shared-store attribution (promoted/variant per player) for a future sync-aware "whose canon others are walking into" cross-reference.

## Guards honored
- **Rating lens reused** — the session recap routes through `ratingLineForGM` (the same ceiling the GM narrates to); the authorship stats are numbers + already-lensed canon names.
- **Read-only** — the Chronicle displays state; the only mutation is the session marker + the opt-in flag.
- **Privacy opt-in** — a chronicle is private until `sharedChronicle` is set; the family board respects it.
- **Honest counts** — authored-vs-novel from `_gen`, persistence from the real canon tiers, never faked.

## Verification
- **15 new smoke tests:** authored/novel counts (novel ids excluded from authored); persistence split shared/personal/rumor; world-effect weighted (Q3); top-attention sorted; honest names; session gap-vs-extend + explicit end + reopen; `sessionLog` real-time deed scoping + day-range minted/promoted; `buildSessionPrompt` facts-only + ceiling-bound; `crossCharacterAuthorship` ranked by world-effect; `buildCanonRecord` stamps `contributedBy`; `contributionsBy` per-player tally. `npm test` fully green.
- **Browser-runtime, served modules:** `authorshipStats` (3 authored / 4 novel / shared 1 · rumor 1 · personal 2 / world-effect 7), session gap logic, `crossCharacterAuthorship` ranking, and served `canon.js` `contributedBy` + `contributionsBy` — 4/4. Boot-clean on 8215, `?v=1.8.86`, no console errors.
- The Chronicle page render (authorship grid, session list, family board) is a template over these verified helpers, syntax- + boot-clean; the live click-through (opening the page, generating a session recap) needs a keyed play session with real generated content — eyeball there.

## Files
`engine/chronicle.js` (touchSession/endSession/sessionLog/buildSessionPrompt/authorshipStats/crossCharacterAuthorship) · `engine/canon.js` (contributedBy alias, contributionsBy) · `app.js` (touchSession in applyTurn; renderChronicle authorship + sessions + family sections; ensureSessionRecap; sharedChronicle opt-in) · `style.css` (.authorship-grid / .auth-stat / .session-entry / .family-row) · `tests/smoke.mjs` · `index.html`.
