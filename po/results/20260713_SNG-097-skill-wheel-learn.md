# Results — SNG-097 (learn/deepen from the skill wheel + upgrade tooltips)

Date: 2026-07-13 · v1.8.57 · commit pushed to `main` · npm test green · live-verified fresh-port. Status: **shipped, complete_pending_review.**

Erik-direct request (not from an Aevi spec): *"I want to be able to learn/use skill points directly from the skill graph circle when I click on an available skill… and we need to add some tooltip info for skill upgrades so you can see what the upgrade does."*

## What shipped

Before, the skill **wheel** and **graph** views were read-only — tapping a node showed a description but no way to act, and nothing told you what a rank-up would grant. You had to leave for the separate Level-Up modal. Now both views let you **spend skill points on the node you tapped**, and show **exactly what each rank does** inline.

- **`skillSelectionActions(ab)`** — one shared, pure function (over `character` + `CONTENT`) rendering:
  - the **upgrade ladder**: every tier/rank with its `grants` and `cannot`, owned ranks filled (●), the next one you'd buy highlighted in accent. This is the "see what the upgrade does" made visible on select — not a fragile SVG hover.
  - the right **action**: `Learn (N pts)` / `Rank up (N pts)` / practiced-free, or an **explained lock** (`opens at level X` · attribute gate reason · `at capacity — deepen instead` · `need N points (you have M)`). Same gate logic as the Level-Up modal's `learnRow`/`rankRow`, so the three surfaces can never drift.
- **`wireSkillSelectionActions(rerender)`** — reuses the exact `learnAbility` / `rankUpAbility` calls (including the branch-fork modal and cross-class auto-verify) that the Level-Up modal already uses. On success it re-opens the same view with the node **still selected** and a **status banner**.
- Wired into **both** `renderSkillWheel` and `renderSkillGraph`. Each now shows a skill-points + capacity line up top and the status banner. Virtual/emergence diamonds (no real ability) safely render no action block.
- New CSS: `.skill-actions` / `.skill-ladder` / `.skill-rung` (with `.on` filled, `.next` highlighted, `.skill-rung-cannot` dimmed).

## Verification (live, fresh port 8352, dev test character)

Drove the real DOM handlers:

| Step | Result |
|---|---|
| Select learnable node **Staunch** (wheel) | ladder shown (r1–r3 grants + cannot), **Learn (1 pt)** button |
| Click Learn | **3 → 2** skill points · banner *"Learned Staunch."* · selection kept · node now owned with a rank-up button |
| Click **Rank up (1 pt)** | **2 → 1** skill points · banner *"Deepened Staunch to rank 2."* · ladder r1 fills (●) |
| Select owned **Prism Sight** | **▲ Rank up (2 pts)** (cross-class cost surfaced) |
| Switch to **list/graph** view, select owned node | same action block + ladder + rank-up button render |

No console errors. `npm test` green (smoke + parse_probe clean + content_ci + balance_sim anchors hold).

## Boundaries / notes

- **No new balance surface** — reuses the existing learn/deepen engine paths verbatim; the wheel/graph are now just additional entry points, so the point economy and gates are identical to the Level-Up modal.
- Screenshots timed out in the preview pane on the heavy 162-node SVG wheel; verification was done via scripted DOM interaction against the real handlers instead (more precise than a pixel check for this).
- This was an Erik-direct request; there's no Aevi ticket yet. Assigned `SNG-097` provisionally — Aevi to confirm/renumber and close.

## Files touched
`app.js` (shared helpers + both render fns + version), `style.css`, `index.html`.
