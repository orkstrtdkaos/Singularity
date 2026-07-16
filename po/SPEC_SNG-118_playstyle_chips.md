# SPEC — SNG-118: Play-style as tight, clickable aptitude chips
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The PLAY-STYLE panel is a wall of run-on prose ("strategist: You think ahead… silver tongue: Words come easily…"). Make each aptitude a **tight, colored, clickable chip** — `[Strategist]` — that expands its effect/description on tap. Same reveal mechanism as the info-dot/vitals work; phone-friendly.

> **Verified at HEAD `v1.8.80`.** The panel concatenates each held aptitude's `name: description` into one flowing paragraph (screenshot: strategist / silver tongue / scholar / daredevil—fading / good samaritan / tactician / orator / sage / stalwart…). As the SNG-113 roster grows to ~18–24, this wall becomes unreadable. The data is per-aptitude (id, name, description, mods, a "fading" flag already shown) — perfect for chips.

## THE CHANGE
- Render each held aptitude as a **chip**: colored pill with the name (`[Strategist]`), a "fading" visual state (dimmed/italic) for ones near their keep-floor (the fading flag already exists), and a distinct tint for background-granted (lineage) vs earned vs inverse.
- **Tap/hover a chip → its detail**: the one-line effect + description (and, at higher transparency, the actual mods — ties to the SNG-106 breakdown surface). Reuse the info-dot/vital-num popover so phone tap works identically.
- Tight layout: chips wrap in a row, not a paragraph. The whole play-style becomes scannable at a glance — you see WHO you are as a cluster of tags, and drill in only where you care.
- Optional: group by axis (earned · romantic · inverse) if the count warrants, or just color-code.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (play-style render) | Replace the prose concat with a chip row: `aptitudeChip(apt)` → colored pill + fading state + lineage/earned/inverse tint; delegated tap → detail popover (reuse the existing popover). |
| `style.css` | `.aptitude-chip` (+ `.fading`, `.lineage`, `.inverse` variants); wrapping row. |
| `tests/*` | Held aptitudes render as chips; a fading aptitude shows the fading state; tapping a chip opens its detail; empty state ("no marked tendencies yet") graceful. |

## GUARDS
- Fading state must be visible (SNG-113's "loss is legible" — a chip about to drop looks like it).
- Phone parity: tap == hover, reuse the working popover.
- Don't lose information — the description is one tap away, not gone.

## OPEN QUESTIONS — CCODE ROUND 2
1. Reuse the SNG-104/106 popover surface directly, or a chip-specific tooltip? (Recommend reuse — one popover mechanism.)
2. Color source — per-axis (earned/romantic/inverse) or per-tendency-family? (Recommend per-axis: fewer colors, clearer meaning.)
