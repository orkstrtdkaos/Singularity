# Results — Skill wheel readability: shapes + precursor + room (SNG-129)

Date: 2026-07-16 · HEAD `2ce0f41` · **v1.8.90** · full suite green · browser-verified. Status: **shipped, complete_pending_review.**

Prototype-approved, encoding-locked. Extends the SNG-124 wheel — function becomes a silhouette, precursor gets an honest path, dense spokes stop piling.

## Part 2 — function SHAPES (the approved core)
- `engine/functions.js` `FAMILY_SHAPE` (LOCKED): **HARM diamond · RESTORE cross · PROTECT shield · KNOW ring · SHAPE triangle · INFLUENCE hexagon · MOVE chevron · SUSTAIN capsule** + `shapeOfFamily` (fallback `circle`).
- `app.js` `wheelNodeShape(kind, cx, cy, r, {…})` — a new SVG primitive returning the family silhouette (polygon/path/rect/ring), replacing the bare `<circle>`. The shape carries the node's **primary** family (`families[0]`); **color is retained** → redundant encoding (accessible, doesn't rely on color alone). Multi-function nodes render their **secondary** families as small colored dots around the primary shape.
- Filter-chip glyphs updated to visually pair with the shapes (◆ ✚ ⬟ ◯ ▲ ⬢ ▸ ▬).
- CSS retargeted from `circle:not(.hit)` → `.wnode-shape` (every silhouette carries the class) so hover/owned/closed/selected/fn-match states apply to any shape.

## Part 3 — the precursor path (surface the narrative gate)
- Precursor is narrative-locked, not tier-locked (`character.precursorAccess`, populated only by the GM's `unlockPrecursor`). The wheel now **says** so: a sealed precursor node renders a **dashed hollow ring + ✦** — visibly distinct from a too-high/closed node.
- Tapping a sealed precursor shows the honest path in the detail panel: *"Precursor crafts aren't taught or bought. A door opens only when the fiction earns it — walking the Old Roads, a precursor-touched teacher, a discovery in play. There's no button; keep playing toward it."* — **never a fake learn button** (that would lie).
- An **unlocked** precursor (in `precursorAccess`) shows its ✦ "a door has opened" learnable state — celebrating that it was earned.

## Part 1 — give it room (de-collision)
- Labels render only for **owned / selected** nodes (+ **filter-matched** when zoomed in, `graphView.k ≥ 1.25`), keeping the full circle uncluttered.
- A greedy de-collision pass nudges overlapping label anchors downward (44px x-window, 10px y-gap) so a dense owned spoke stops stacking labels on top of each other.
- Owned/reachable labels show the name + **⚡ effective cost** (SNG-103), so actionable nodes announce themselves without hover.

## Guards honored
- **Redundant encoding** — shape AND color carry function (accessibility).
- **Never a fake precursor "learn" button** — the only honest surface is "earned through play."
- **Tradition geometry preserved** (SNG-073) — shapes/labels/precursor states are overlays; the great-circle/antipode structure + SNG-054 zoom/pan are untouched (the filter re-render keeps the viewport).

## Inherited fixes (flagged — Aevi's SNG-132 content ship red-gated the suite)
Aevi's newly-shipped `the_lightless_seraph.json` failed two gates; fixed minimally to get the suite green **without rewriting her Brooklyn-derived father-arc prose**:
1. `schemas/npc.schema.json` — widened `wants`/`fears` to accept a **string OR array** (she authored layered arrays) and `reactsToReputation` to **object OR boolean** (she used `true`). Backward-compatible; the string form all other NPCs use still validates.
2. `content/packs/valley/manifest.json` — registered `npcs/the_lightless_seraph.json` in the npc whitelist (it was on disk but unlisted — SNG-064 flagged it). This registration is also needed for SNG-132 (the NPC must be in the manifest to load).

## Verification
- **4 smoke tests:** `FAMILY_SHAPE` gives 8 distinct silhouettes; `shapeOfFamily` resolves + falls back to circle; (Phase-A/B palette tests still green). Full `npm test` green — smoke + content_ci + balance_sim + skill_battle_sim — after the two inherited fixes.
- **Browser-runtime, served modules:** `FAMILY_SHAPE` complete/distinct/fallback; the `wheelNodeShape` shape-generation logic yields valid SVG for every family (no `undefined`/`NaN`, carries `.wnode-shape`); the precursor sealed classification (`isPrecursor && !precursorAccess`) is correct. Boot-clean on 8225, `?v=1.8.90`, no console errors.
- The on-wheel *feel* (silhouettes lit, a filter dimming the ring, a sealed precursor's dashed ✦ and its tap-explanation, de-collided labels on a dense owned spoke) is a template over these verified helpers — eyeball in a keyed session with a real character on the wheel.

## Files
`engine/functions.js` (FAMILY_SHAPE / shapeOfFamily / shape-matched glyphs) · `app.js` (wheelNodeShape; node render → shapes + secondary dots + precursor sealed/open; de-collided labels; sealed-precursor detail panel; precursorUnlocked on the wheel model) · `style.css` (wnode-shape state retarget, precursor-sealed/mark/seal-note) · `tests/smoke.mjs` · `index.html` · **inherited:** `schemas/npc.schema.json`, `content/packs/valley/manifest.json`.
