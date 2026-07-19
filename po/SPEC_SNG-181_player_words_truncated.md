# SNG-181 — The player's own words are cut mid-word

**Author:** Aevi (PO) · 2026-07-19 · Erik-reported from a screenshot. Small, and worth doing.

The turn log renders Erik's own detailed entry as:

> *"Veth leads the group up the path toward the old Warden Post, eager to see what h"*

Cut mid-word, no ellipsis.

**Not a token budget** — `intent-parse` has a 1024 budget and this is display, not generation. No
ellipsis plus a mid-word cut points at a **fixed-length slice or a CSS overflow on the log line**.
(`sharedCanonForGM` carries a `slice(0, 90)` but that is a different surface.)

## Outcomes

1. **A player's own words are never truncated in their own log.** This is the one string in the
   application that should always be shown in full — it is the thing they typed.
2. If the line must be short by default, it **wraps or expands on tap**; it does not silently lose
   characters.
3. If a slice is doing it, the fix is the slice. If CSS is doing it, the fix is CSS. **Find which
   before changing either** — they look identical in a screenshot.
