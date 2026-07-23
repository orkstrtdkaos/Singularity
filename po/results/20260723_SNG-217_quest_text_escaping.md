# SNG-217 — literal `\n` and raw `**` in quest text — normalize on write, render on display, heal the save

**CCode · 2026-07-23 · v1.8.210 (`63c92113`) · full suite green (18 new tests) · clean boot.** Both halves shipped, plus the backfill. The Second Thread — and any future model-authored quest with a paragraph break — reads with real line breaks and bold, not raw escape sequences.

---

## §3a — normalize on WRITE (the data half, the one that prevents recurrence)

`normalizeProse(s)` in `quests.js` converts the literal two-character escapes models "type" into JSON strings (`\n`, `\r\n`, `\t`) into real breaks, on write. Applied at both quest-write paths:

- **`structuredQuestRecord`** (The Second Thread's path): `premise`, `stakes`, every stage's `objective`/`condition`/`change`, and each outcome's `summary` + `narration[]`.
- **`applyQuestUpdates`** (the GM-op path): the started-quest `summary` and every progress `note`.

**Markdown `**bold**` is deliberately LEFT in the stored value, not stripped** — that's authored intent, and the render layer honors it (below). Because the fix is on write, *every* downstream consumer — GM context, codex/search, export — now sees real breaks, not just the visible card. The GUARD holds: a real newline is never matched (the regex targets backslash-n, two chars), and a legit backslash-literal in prose is rare and left alone. Fast-path: a string with no backslash returns untouched.

## §3b — render markdown on DISPLAY (the visible half)

`mdProse(s)` in `app.js` — `esc()` first (XSS-safe), then the app's existing light-markdown convention (`**bold**` → `<strong>`, same as `mdLite`) plus newline → `<br>`. The three quest-body render sites (premise, stakes on the map card; stakes on the quest detail) now use it instead of raw `esc()`, so a stored `**` renders bold and a real newline renders as a break instead of collapsing.

## §3c — heal the one that exists (the backfill)

Reconcile `CHARACTER_STEPS` **v18 `quest-prose-escapes`** normalizes literal escapes in every quest prose field already in a save — premise, stakes, summary, progress notes, stage conditions/objectives, outcome summaries/narration. Idempotent (a real newline is never re-matched; a second pass is a no-op), silent (pure text hygiene). The Second Thread cleans itself on next load — no origin hand-edit of the volatile save (LLW respected).

## ROUND 2 — answered

**Q1 — where are structured-quest text fields persisted?** `engine/quests.js` — `structuredQuestRecord(def)` (line 180, the def→record builder every structured quest passes through) and `applyQuestUpdates` (line 49, the GM `questUpdates` op path). Both are now the normalize sites. That's the complete §3a surface.

**Q2 — does the narration renderer already do markdown?** The app already has `mdLite` (bold-only, used for authored help copy) — so `**bold**` is an established in-app convention, not a new invention. I extended it to `mdProse` (bold + line breaks) for prose bodies rather than pointing quest text at the full play-narration renderer (which carries scene-specific handling quest cards don't want). Quest bodies now support the same light markdown the rest of the app's authored copy uses — consistent, minimal, and Erik can widen it later if wanted.

**Q3 — backfill scope: quest-text-only or a general sweep?** Quest-text-only, matching your scan (the literal `\n` appeared *only* in this quest). A general "every stored prose string" sweep would violate the GUARD (*don't globally rewrite every string; some fields legitimately contain backslashes*). The write-side normalize (§3a) is what prevents recurrence on the next generated quest; §3c only cleans the one that exists. If a future scan finds literal escapes elsewhere (arc premises are the likely next surface — they're model-generated too), that's a scoped follow-on, not this ticket.

## Verified

18 smoke tests: both write paths normalize (structured record across all prose fields + the GM-op summary); `**` is preserved on write; `normalizeProse` is idempotent and safe on non-strings/null/clean text; the render sites use `mdProse` and `mdProse` escapes-then-renders `<strong>`+`<br>` (XSS-safe); the v18 backfill heals a quest already in a save across premise/stakes/condition/summary/progress, and the gate advances past 17. Full `npm test` green — ratchets held (`rawProseCaps` 63 unchanged; `normalizeProse` uses `.replace`, not a slice), wiring audit clean, ENGINE_MAP ok. Clean boot at v1.8.210 (fresh port — the first port showed the known stale-internal-module hang from a long-lived tab; a fresh port rendered "The Valley of Echoes — v1.8.210" with 0 console errors, confirming it was cache, not code).

## The acceptance criterion, honestly

The visible bug is fixed on both axes — the stored data is clean (real breaks, markdown intent preserved) and the display renders it (bold + line breaks). The engine half is exhaustively green. The live confirm — Erik opening The Second Thread and seeing prose paragraphs and a bold phrase instead of `\n\n` and `**` — lands the moment his save loads (the v18 backfill runs on load) or he views the quest card. Ship §3a is what makes the *next* generated quest immune, and it's in.

*— CCode. The model typed the escape and meant the break; the store kept the escape and the screen showed it. Now the store keeps the break and the screen renders the bold. Fixed where it's written, shown how it's meant, and the one already wrong heals itself on load.*
