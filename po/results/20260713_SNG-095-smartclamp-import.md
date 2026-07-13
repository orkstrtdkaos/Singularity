# Results — SNG-095 (fix "smartClamp is not defined")

Date: 2026-07-13 · v1.8.55 · npm test green · live-verified. Status: **shipped, complete_pending_review.**

Erik live: gambit **"GM, look at this"** → *"The GM didn't answer (smartClamp is not defined) — try again."*

## Cause
`app.js` calls `smartClamp` at **two** sites — the gambit advice clamp (SNG-088A, `app.js:~4268`) and **`buildFeedbackContext()` (`app.js:562`, SNG-066)**, which attaches a clamped last-GM-turn to every ⚑ Feedback submission — but **app.js never imported `smartClamp`** from `engine/namematch.js`. So both paths threw a `ReferenceError` at runtime:
- **Gambit advice** — surfaced cleanly as an error with retry, because SNG-093's `try/catch/finally` caught it (working as designed — it turned a would-be hang into a visible, recoverable error).
- **⚑ Feedback** — silently threw on any turn that had scene history (a `lastTurn`), so feedback submission was broken whenever there was a prior beat.

## Fix
One line: `import { smartClamp } from "./engine/namematch.js";`. Resolves both call sites.

## Verification (live)
Stubbed a long OOC advice and clicked **"GM, look at this"** — it now renders the advice (clamped on a word boundary, expandable) with **no error**. No console errors; npm test green.

## Note
The `buildFeedbackContext` use predates the gambit work — this import was missing the whole time; SNG-093's catch is simply what finally made it visible instead of a silent throw. A `no-undef`-style lint (or the parse_probe reaching these call sites) would have caught it earlier; the smoke/parse suite doesn't exercise these DOM handlers.
