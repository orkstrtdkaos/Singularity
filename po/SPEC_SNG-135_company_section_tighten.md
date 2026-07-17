# SPEC — SNG-135: Tighten the Company section — one clean row per member
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik (screenshot): "This UI section needs to run a bit cleaner."** The Company section (SNG-120/126: Companions · Allies · recruitable) is functionally right but *reads heavy* — every member is a tall stack of blocks with a full-width action button on its own line.

> **Verified at HEAD `v1.8.92`.** Company render (app.js L5562–5567). Each member currently stacks vertically: a `.companion-name` line, a role/bond line below (`roleBadges` / bond tag / `.hint`), then a **full-width `.companion` action button** ("Part ways" / "+ Recruit") on its OWN line beneath. So Huginn, Pell, Calvar, Fendt, Leth each occupy ~3 rows, and the blunt full-width buttons dominate the column (screenshot: a loose, tall stack). The data + roles are correct (SNG-126); only the LAYOUT is loose.

## THE FIX — one tight row per member
- **Single row per person:** name · role/bond badge · compact action, all on one line. E.g. `Pell  [ally]                    ⋯` where the action is a small icon/kebab or a compact button, not a full-width bar.
- **Demote the action button** from full-width block to a compact inline control: a small "Part ways" / "Recruit" button or an overflow (⋯) that reveals it — so the buttons stop dominating. Recruit especially can be a small `+` that expands.
- **Companion detail (Huginn's "an Ashwarden-touched carrion bird that attends endings")** moves to hover/tap (the SNG-134 entity-hover, or a tap-to-expand) rather than always-printed prose under the name — it's lovely but it's two lines per companion when collapsed density is wanted.
- **Group headers stay** (Companions / Allies / Party) but tighten spacing between rows; the groups read as compact lists, not spaced-out cards.
- **Bond/role badge inline** with the name (Huginn `bond 10 · stage 2`, Pell `ally`) — one badge, right of the name, consistent across all three groups.
- **Keep the roster/recruit logic exactly** (SNG-126) — this is layout only: same members, same roles, same recruit gating, same part-ways confirm. Nothing about *who's* in the company changes.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` Company render (L5562–5567) | Restructure each member to a single flex row: name + inline badge + compact action; move companion description to hover/tap; tighten inter-row spacing. |
| `style.css` | `.company-row` (flex, one line), compact `.company-action` (small button / kebab), inline `.company-badge`; reduce `.company-group` vertical gaps. |
| `tests/*` | Each member renders as one row (name + badge + action inline); part-ways + recruit still fire from the compact control; companion detail available on hover/tap; solo still hides the section (unchanged). |

## GUARDS
- **Layout only** — roster, roles, recruit gating, part-ways confirm all UNCHANGED (SNG-126 intact). A test asserts the same members + actions are present, just re-laid-out.
- **Actions still reachable on phone** — the compact control (small button or tap-to-reveal) must be tappable; don't hide actions behind hover-only.
- **Reuse SNG-134 hover** for the companion detail if that ships together; otherwise tap-to-expand.
- Composes with SNG-120 collapse (still a collapsible `data-sec="company"` with count in the summary).

## OPEN QUESTIONS — CCODE ROUND 2
1. Compact action as a small labeled button ("Part ways") or an overflow kebab (⋯ → menu)? (Recommend small labeled button for the primary action, since there's usually just one — kebab only if multiple actions per member.)
2. Companion description — hover (SNG-134 registry) or a tap-to-expand caret on the row? (Recommend whichever ships first; tap-caret if SNG-134 isn't built yet.)
