# SNG-219 — a sticky top Back on every screen that has one

**CCode · 2026-07-23 · v1.8.211 (`1f783e80`) · full suite green · verified live.** Erik's ask — *"lots of Back/Done buttons are at the end of content; I'd like some at the top too so I don't scroll all the way down"* — is met globally, with zero per-screen edits and no change to the ~20 existing bottom buttons.

**Erik's approach call (asked before building):** global sticky arrow · keep the bottom buttons (pure add).

---

## What shipped

ONE persistent bar — `#sticky-back`, a sibling **above** `#app` so the `app.innerHTML` screen swaps never wipe it. After each render a `childList` MutationObserver on `#app` **mirrors that screen's own bottom back control** into the bar:

- **Finds the canonical back:** a button whose id ends in `-back` (the ~18 hand-rendered ones), or a `.secondary` button whose visible text is Back/Done — the **last** match (the bottom-anchored one). No match (the play screen) → the bar hides.
- **Same handler, new location:** the bar's click calls `theBackButton.click()`, so it runs the screen's exact existing navigation — never a second, subtly-different path (GUARD).
- **Sticky, in-flow:** `position: sticky; top: 0`, sitting above `#app` — it **pushes** content down and pins to the viewport top through the scroll; it never covers the first line (GUARD: sticky, not fixed-overlay).
- **Bottom buttons untouched:** pure ADD, per Erik — long forms keep back at both ends.
- **Screen #21 is free:** a new screen with a `-back` button gets the top control automatically; nothing to wire.

## ROUND 2 — answered (matched to Erik's picks)

**Q1 — shared wrapper vs per-screen vs worst-screens?** Neither the 20-site wrapper refactor nor per-screen bespoke buttons. A **single global mirror** driven by a MutationObserver — the "fix once, all screens + future ones" property the shared wrapper promised, without touching a single screen's render code (there is no shared `navigate()` they route through; each sets `app.innerHTML` directly, so a mirror is cleaner and lower-risk than refactoring all 20). This was Erik's "global sticky arrow" choice.

**Q2 — title-bar or bare control?** Bare back control (Erik's pick, implied by "global sticky arrow"). Minimal visual change, no title extraction, lowest blast radius across every screen. The richer title-bar is a clean follow-on if Erik ever wants orientation-in-the-bar.

**Q3 — keep or de-dup bottom buttons?** Keep all (Erik: "keep both — pure add"). Zero risk of removing something relied on; long forms genuinely benefit from back at both ends.

## Verified (live, fresh port)

- **Root/welcome screen** (no back control): bar correctly **hidden**.
- **Machine sub-screen** (`mach-back`): bar **shows**, labeled "← Back", pinned at `top: 0` (43px tall), `mirroredTargetId: "mach-back"` — mirroring the screen's own button.
- **Clicking the sticky bar**: returns to root, the sub-screen is gone — it ran the real handler.
- **After returning**: the bar **re-hides** (the observer refreshed on the swap and found no back).
- 0 console errors. 5 source smoke checks (element created above #app, mirrors via `.click()`, last-`-back`/Back-Done match, observer wiring, sticky+`[hidden]` CSS). Full `npm test` green — ratchets held, wiring audit clean, ENGINE_MAP ok.

## Note on the test shape

The mechanism is a DOM MutationObserver — not unit-testable in the Node suite (no DOM), so smoke asserts the wiring is present and the **behavior is browser-verified** above (the standard for app.js UI features). Every screen's back is its own existing handler, so correctness is inherited from the buttons that already worked; the bar only relocates the reach.

*— CCode. One bar, sitting above the app, quietly wearing whichever screen's Back is at the bottom — so the most common action, leaving, is one reach away instead of a full scroll. The next screen gets it without being asked.*
