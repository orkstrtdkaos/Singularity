# SPEC — SNG-219: Back/Done at the TOP of scrollable screens, not just the bottom
## Aevi (PO) · 2026-07-22 · verified at origin · small universal UX fix

> **Erik, live:** *"Lots of Done/Back buttons are at the end of content. I'd like some at the top too so I
> don't have to scroll all the way down to go back."*

## §1 — Verified: ~20 hand-rendered per-screen buttons, all bottom-anchored
`app.js` has **~20 Back/Done buttons** (grep: 18 "Back", 2 "Done" at lines 868, 1048, 1104, 1340, 2441,
2731, 2842, 3314, 4741, 4776, 4939, 5309, 5410, 5606, 5736, 5837, 5953, 6016, 6042, 6098). They are
**hand-rendered at the END of each screen's content** — NOT a shared component — which is why they all sit at
the bottom: each screen appends its own after its body. They ARE structurally consistent (`class="btn
secondary"`, same close/back handler shape), so ONE shared pattern fixes all of them.

Impact: on long screens (the level-up all-traditions list, the skill list in the screenshot, inventory,
character sheet) the only way back is a full scroll to the bottom. On a phone that's several swipes to do the
most common action — leave.

## §2 — Outcome wanted: a top back control on every scrollable screen
A back/close control reachable WITHOUT scrolling, at the top of each screen, IN ADDITION to (or replacing)
the bottom one.

### Recommended: a shared screen-chrome wrapper (fix once, not 20 times)
The buttons are consistent enough to unify. Introduce a small shared screen header the sub-screens render
through — a sticky top bar carrying the screen title + the back/close control:
- **Sticky top bar** — title on the left, Back/Done on the right (or back-arrow on the left, the common
  mobile pattern). `position: sticky; top: 0` so it stays reachable even mid-scroll on long screens.
- **Every screen routes its back through it** — replace the 20 bottom-appended buttons' ROLE with this shared
  bar. Keep a bottom button too if desired (a long form benefits from back at both ends), but the TOP one is
  the fix.
- **One handler** — the bar's back action calls the same close/back the bottom buttons already call; wire the
  existing per-screen handler into the shared bar so behavior is identical, just relocated/duplicated.

### Minimum viable (if the wrapper refactor is too big for now)
Add a top back control to the WORST offenders first — the long-scroll screens: the level-up traditions list
(image), inventory, character sheet, codex. Even without the full refactor, a top button on the screens that
actually scroll solves Erik's pain. But the shared-bar approach is cleaner and prevents the next new screen
from re-introducing the problem.

## §3 — Design notes (grounds in the app, not generic)
- **Sticky, not just top-placed** — on a long list a top-only button scrolls away as you go down; sticky keeps
  it reachable throughout, which is the actual ask ("don't scroll all the way").
- **Consistent placement** — pick ONE side/pattern and apply everywhere; inconsistent back-button placement is
  its own small UX tax. Mobile convention: back-arrow top-left, primary action top-right.
- **Title in the bar** — the top bar doubles as a "where am I" label (many of these screens' titles currently
  live in the body); folding the title into the sticky bar is free orientation.
- **Don't remove the bottom button reflexively** — for a long form, back at both ends is genuinely better;
  the fix is ADD at top, and DE-DUP only where the bottom one is now redundant on short screens.

## OWNERSHIP
CCode — this is app.js render/chrome work. No content, no engine. Small but touches ~20 sites (or one shared
wrapper the 20 route through).

## GUARDS
- **Same behavior, new location** — the top control must call the EXACT close/back each bottom button already
  does; don't introduce a second, subtly-different navigation path.
- **Sticky, not fixed-overlay** — it should push content, not cover it; a fixed bar that overlaps the first
  line of content trades one annoyance for another.
- **One pattern everywhere** — resist per-screen bespoke placement; the whole point is consistency + a shared
  chrome so screen #21 gets it for free.

## OPEN QUESTIONS — CCODE ROUND 2
1. Shared screen-chrome wrapper (fix once, all screens route through it) vs. add-top-button per-screen? The
   wrapper is more work now, cheaper forever. Your call on refactor appetite.
2. Sticky bar with title + back, or just a floating back control? (Title-bar gives orientation for free; a
   bare back control is smaller.)
3. Keep bottom buttons everywhere, or de-dup to top-only on short screens? (Long forms want both; short
   modals want one.)
