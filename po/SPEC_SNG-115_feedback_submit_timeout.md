# SPEC — SNG-115: Feedback submit hangs on "Sending…" (no timeout on the network await)
## Aevi (PO) · 2026-07-15 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The feedback form's Send button `await`s a GitHub write that has **no timeout**; if the request stalls (rate-limit, network, or a SHA-conflict retry loop that keeps re-fetching), the await never resolves or rejects, and the status stays stuck on "Sending…" forever.

> **Verified at HEAD `v1.8.73`.** `app.js` L674–683: `fb-send.onclick` → `await submitFeedback(entry)` → `submitFeedback` (L633) → `await pushMergedFile(...)` (L638). `pushMergedFile` (`engine/sync.js`) is a 3-attempt SHA-conflict loop of bare `ghGet`/`ghPut` `fetch` calls — **no `AbortController`, no `setTimeout`, no deadline anywhere in the chain.** The `try/catch` only catches a *thrown* error; a request that hangs open never throws, so the `await` never returns and the UI sits on "Sending…". A stalled write = a permanent hang, and the entry may also not be safely queued because the catch never runs.

## THE FIX
1. **Timeout the network calls.** Add an `AbortController` with a deadline (~10–12s) to `ghGet`/`ghPut` in `sync.js` (or wrap `pushMergedFile` in a `Promise.race` against a timeout). On timeout, **throw** — which routes into `submitFeedback`'s existing catch (L645), so the entry is saved to the local queue ("never lose it") and the status reports "saved, will retry", not an infinite spinner.
2. **Guard the button UI regardless.** In `fb-send.onclick`, race the `await submitFeedback` against a UI-level timeout so the status ALWAYS resolves to a terminal message even if something below misbehaves — never leave "Sending…" as a permanent state. Disable the button while sending; re-enable on resolve.
3. **The queue is the safety net — make sure it always catches.** Because feedback is already queued-and-retried (`flushFeedbackQueue` at boot/enter-play), the correct failure behavior is: timeout → throw → catch → `saveFeedbackQueue(pending)` → "saved, will send next time." The entry is never lost; the user is never stuck.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/sync.js` | `AbortController` + deadline on `ghGet`/`ghPut` (or `pushMergedFile`); on abort, throw a timeout error. |
| `app.js` | `fb-send.onclick`: disable button while sending; `Promise.race` the submit against a UI timeout; always land on a terminal status; re-enable button. |
| `tests/*` | A stalled/aborted write resolves to the queued-and-saved path within the deadline; status never remains "Sending…"; the entry is present in the local queue after a timeout; a successful write still flushes. |

## GUARDS
- **Never lose feedback** — a timeout must route to the queue (the existing "never lose it" path), not drop the entry.
- **Never a permanent spinner** — the button status always reaches a terminal state (sent / queued / failed-try-again).
- Timeout applies to the *network*, not to genuine merge logic — a real 409 conflict still gets its 3 retries within the per-attempt deadline.

## OPEN QUESTIONS — CCODE ROUND 2
1. Best deadline value — 10s? And should each of the 3 conflict-retry attempts get its own deadline, or one deadline for the whole `pushMergedFile`? (Recommend per-attempt so a slow-but-progressing retry isn't killed mid-success.)
2. Do other sync callers (character save, event ledger) share the same no-timeout `ghGet`/`ghPut` and therefore the same latent hang? If yes, fixing it at the `ghGet`/`ghPut` layer fixes all of them in one place — **recommend the low-level fix over per-caller.**
