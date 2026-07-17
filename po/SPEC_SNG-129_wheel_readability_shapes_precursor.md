# SPEC — SNG-129: Skill wheel readability — room, function shapes, precursor path
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Three asks from Erik (live screenshot):** (1) give everything more room — labels collide into an unreadable pile in dense areas; (2) use different **shapes** per function family, not just colored dots, so a node's primary function reads at a glance; (3) surface **how precursor skills are learned** — the wheel shows them but gives no path.

> **Verified at HEAD `v1.8.88/89`.**
> - **Label collision:** wheel labels render at a FIXED offset (`wheelPt(ang, tierRadius + 12)`, centered above each node, L3662/3668) with **no collision avoidance** — every owned/matched label lands at the same relative spot, so a dense spoke (an owned primary tradition) stacks labels directly on top of each other. This is the unreadable center in the screenshot.
> - **Shapes:** every node is a `<circle>` (L3665); function is shown ONLY by a tiny 2.4px colored dot beside it (L3666, SNG-124). So function = color, shape = always-circle. Erik wants shape to carry function too.
> - **Precursor:** VERIFIED a real, deliberate gate — precursor abilities are learnable ONLY when `character.precursorAccess` lists them (progression.js L253), and that list is populated ONLY when the GM emits `unlockPrecursor` in the fiction ("when the fiction earns it", L2656; narration: *"A door opens that was never on any list"*). **The mechanic is beautiful — the outer ring can't be shopped, only lived into — but the wheel gives NO signal that precursor nodes are narrative-locked rather than tier-locked.** Erik's question IS the discoverability bug.

## ✅ PROTOTYPE APPROVED — encoding LOCKED (Erik, 2026-07-16)
Interactive prototype reviewed and approved. Locked decisions for the build:
- **8 family shapes (LOCKED):** HARM=diamond · RESTORE=cross · PROTECT=shield · KNOW=ring · SHAPE=triangle · INFLUENCE=hexagon · MOVE=chevron · SUSTAIN=capsule. Shape carries the PRIMARY family (`families[0]`); color retained (redundant encoding). Multi-function nodes: primary shape + secondary family dots.
- **Function filter (LOCKED):** tap a family chip → matching-shape nodes highlight, rest dim; each chip shows its shape+color. `clear` resets.
- **Precursor sealed state (LOCKED):** dashed hollow outline + ✦ mark on the outer ring; visibly different from too-high/closed. Tap → the honest narrative-path explanation ("a door opens only when the fiction earns it… no learn button"). This is the approved treatment.
- **Label de-collision (LOCKED as direction):** label owned + filter-matched + selected only; nudge overlapping labels apart; owned labels show name + effective cost (⚡N). Dense spokes still want the fuller fix (arc-spread + zoom-gate) — build the de-collide first, add arc-spread if a spoke still crowds.

## PART 1 — Give it room (fix label collision)
- **Collision-avoided labels.** Don't place every label at the same fixed offset. Options (recommend a mix): (a) only label owned + selected + filter-matched nodes at full zoom, glyph-only otherwise (partly there — tighten it); (b) a lightweight de-collision pass — nudge labels radially/tangentially off each other, or leader-line a crowded cluster; (c) **zoom-gated labels** — at low zoom show shapes only, labels fade in as you zoom into a region (the spec-4 intent of SNG-124 that didn't fully land).
- **Spread dense spokes.** An owned primary tradition stacks many nodes at similar angles/radii — give tier rings more radial spacing and/or fan a spoke's nodes across a small arc so they don't overlap. More breathing room per node.
- **Selected/hover detail moves to a side panel**, not more on-wheel text — tap a node → its name/cost/function/how-to-learn in a panel, so the wheel itself stays uncluttered.

## PART 2 — Function SHAPES (not just color)
Give each of the 8 families a distinct **node shape**, so function reads by silhouette even before color:
| Family | Shape (suggestion) |
|---|---|
| HARM | ◆ diamond / spike |
| RESTORE | ✚ cross / plus |
| PROTECT | ⬟ shield/pentagon |
| KNOW | ○ ring/eye |
| SHAPE | ▲ triangle |
| INFLUENCE | ⬢ hexagon |
| MOVE | ▸ chevron/arrow |
| SUSTAIN | ⬭ rounded bar/capsule |
- Replace the single `<circle>` primitive with a `nodeShape(family)` that returns the SVG path/poly for the node's **primary** family (`nd.families[0]`). Keep the family COLOR too (shape + color = redundant encoding, easier to read, accessible).
- A **multi-function** node (several families) can carry small secondary family dots (as now) around a primary shape — primary = silhouette, secondaries = dots.
- Owned/closed/barred states still apply (fill/strike/dim) to whatever the shape is.
- A shape legend in the by-function bar (the filter chips already name the families — pair each chip with its shape).

## PART 3 — The precursor path (surface the narrative gate)
Precursor is narrative-locked, not tier-locked — the wheel must SAY that:
- **Distinct precursor node state.** A precursor node the player hasn't unlocked shows a distinct "sealed / not-on-any-list" treatment (e.g. a dashed/ghosted outer-ring node with a keyhole or ✦ mark) — visibly different from a merely too-high or closed node.
- **Tap → honest explanation.** Tapping a locked precursor node explains the real path: *"Precursor crafts aren't taught or bought. A door opens only when the fiction earns it — walking the Old Roads, a precursor-touched teacher, a discovery. Keep playing toward it."* (No fake "learn" button — that would lie.)
- **Unlocked precursor** (in `precursorAccess`) shows as learnable with its ✦ "a door has opened" state — celebrating that it was earned.
- Ties to SNG-124's "Suggested for you": a precursor the player is *close* to earning (thread/location proximity) could hint "the Old Roads may yet open this to you" — aspirational, not a purchase.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` wheel render (L3655–3670) | `nodeShape(family)` primitive replacing the bare `<circle>`; per-family SVG shapes + retained color; label collision-avoidance (zoom-gate + de-collide owned/selected); dense-spoke radial spacing; move detail to a side panel. |
| `app.js` precursor state | A `precursor-sealed` node class + tap-handler that shows the narrative-path explanation; unlocked-precursor ✦ state. |
| `engine/functions.js` | `FAMILY_SHAPE` map (8 shapes) alongside `FAMILY_COLOR`/`FAMILY_GLYPH`. |
| `style.css` | shape/precursor-sealed styling; label de-collision helpers; legend shapes. |
| `tests/*` | Each family renders its distinct shape; a multi-function node shows primary shape + secondary dots; no two labels overlap in a dense spoke at full zoom; a locked precursor node shows sealed state + narrative explanation on tap (no learn button); an unlocked precursor shows learnable. |

## GUARDS
- **Redundant encoding** — shape AND color carry function (accessibility: don't rely on color alone).
- **Never a fake precursor "learn" button** — the wheel must not imply a precursor is buyable; the only honest surface is "earned through play."
- **The wheel's tradition geometry stays** (SNG-073) — shapes/labels/precursor states are overlays; the great-circle/antipode structure is untouched.
- Performance: shape rendering + de-collision must stay smooth at full-circle zoom (only de-collide visible labels; only label owned/selected/matched).

## OPEN QUESTIONS — CCODE ROUND 2
1. De-collision approach — zoom-gating alone (simplest), or zoom-gate + a light radial nudge for owned clusters? (Recommend start with zoom-gate + owned-only labels; add nudging only if a spoke still crowds.)
2. Shape rendering cost — 8 SVG poly/path shapes × many nodes; confirm it stays performant, or precompute shape paths once and translate.
3. Does `nd.families` reliably carry the ability's families post-SNG-124 for every node (owned + unowned), so `nodeShape(families[0])` always has a family? Fallback shape for a family-less node.
4. Precursor "close to earning" hint — is there a signal (thread/location proximity to a precursor unlock) to drive the aspirational hint, or leave it as pure sealed-until-fiction?
