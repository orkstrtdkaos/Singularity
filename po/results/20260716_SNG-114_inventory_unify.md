# Results — SNG-114: inventory unify + intentful "Use in scene"

Date: 2026-07-16 · HEAD `330e55a` · **v1.8.78** · `npm test` green · boot-clean. Status: **shipped, complete_pending_review.**

Two coupled fixes, one code path.

## Part 1 — one shared item card (the drift is now impossible)
The two item-card renderers (inventory popup `data-invuse/invname/invdrop` showing effects; play sidebar `data-use/nameit/drop` showing the image) — different attrs, different handlers, already drifted — are now ONE `itemCard(it, { open, toggleAttr })`: a **superset** (image when open + effects + bonusTags + use/name/drop) rendered by both surfaces, bound once via `bindItemCardHandlers(afterChange)`. The only per-surface difference is which attribute toggles the card open (`data-inv` vs `data-examine` — each surface owns its own open-state var). Duplicate markup + the divergent `data-nameit`/`data-drop` handler wiring deleted. "Use in scene" now does exactly one thing regardless of where it was tapped.

## Part 2 — "Use in scene" with intent
A non-consumable's "Use in scene" opens `openUseIntent(item)` — an intent step offering the item's **meaningful uses** (`engine/inventory.js itemUses`: authored `item.uses[{label,prompt}]` wins, else kind-defaults with `{item}` substituted — Q3's kind→uses map, so common items get real verbs with no hand-authoring) **plus a free "…how?" field**. A storied item (Pell's whetstone) gets "Sharpen a blade" / "Read the rune-seam" / a typed intent, instead of the canned "I use my X here" — which remains only as the fallback. Consumable path unchanged.

## ROUND-2 answers
- **Q1** (surfaces simultaneous?): no — popup and sidebar are separate screens; one shared template with per-surface open-state is sufficient.
- **Q2** (other item-action surfaces?): the two named surfaces were the only item use/name/drop renderers; both now use the shared card. (Loot/examine modals don't render these actions.)
- **Q3** (kind-defaults?): yes — `ITEM_USE_DEFAULTS` by kind (weapon/tool/quest/tome/misc) so not every item needs authored `uses[]`.

## Verification
- 4 smoke tests on the pure `itemUses`: authored `uses[]` offered with `{item}` substitution (incl. a custom name); weapon kind-defaults give ready/strike verbs; an unknown kind falls to the misc default (the intent step is never empty). Full `npm test` green; boot-clean.
- Parity is structural: both surfaces call the same `itemCard` + `bindItemCardHandlers` → "Use in scene" cannot diverge again (the whole point).

## Files
`engine/inventory.js` (itemUses + kind-defaults) · `app.js` (itemCard, bindItemCardHandlers, openUseIntent; both surfaces rewired; dead handlers removed) · `style.css` (.item-card) · `tests/smoke.mjs` · `index.html`.
