# Results — SNG-093 (the GM can never hang the gambit builder)

Date: 2026-07-13 · v1.8.50 · npm test green · live-verified. Status: **shipped, complete_pending_review.**

Erik live: *"the GM doesn't seem to be able to provide feedback. gets stuck."* Design Law 5 says a hiccup never blocks play; this violated a law we already wrote.

## The bug
`app.js` — the **"GM, look at this"** handler was `async` with **no try/catch**. On a throw (`gmAsk` building its context) or a network hang, the promise rejected unhandled, the final `renderGambitBuilder()` never ran, and the UI sat on **"The GM studies your plan…" forever** — no error, no retry, only Back. **"Assess plan"** had a catch but **no timeout**, so a pure hang stranded it too.

## What shipped
- **`withTimeout(promise, ms=30000, label)`** — a `Promise.race` that rejects after 30s, so a hang is caught like any other failure.
- **Both GM-call handlers** now wrap the call in `try/catch` with the timeout; **"GM, look at this"** uses **`finally` to ALWAYS re-render** — a throw/hang/timeout can never leave the builder in a loading state. The error reads *"…— try again"* and the buttons stay live (the retry is the button itself).
- **Audit (spec point 3):** grepped all 12 `onclick = async` handlers. The gambit builder was the **acute** case — a full-screen loading state whose only exit was Back. The party find/join and roster play/adopt render a **button-level** "Loading…" that a throw could leave dangling, but the rest of the screen stays interactive (recoverable by navigating). Same `withTimeout` pattern applies there as a low-priority follow-on; flagged, not rewritten.

## Verification (live, `fetch` stubbed to reject)
Opened the builder, clicked each with the GM call forced to fail:
- **GM, look at this** → *"The GM couldn't weigh in (simulated network failure) — plan on."*; not stuck on "studying"; retry available.
- **Assess plan** → *"Couldn't read the plan (simulated network failure) — try again."*; not stuck on "Reading the plan…"; retry available.
Both recover with a clear error and stay fully usable. The 30s timeout is a `Promise.race` (verified by inspection; a live 30s wait wasn't run).

## Erik test
"Hit Assess plan. Verify you always get EITHER advice or a clear error with a retry — never a permanent 'studying'." Confirmed for both buttons.
