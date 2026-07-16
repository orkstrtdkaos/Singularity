# SPEC — SNG-114: Unify the two inventory surfaces + make "Use in scene" intentful
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **Two coupled fixes in one ticket (same code):**
> 1. **Consolidate** the two divergent inventory renderers into one shared item-card component. They're duplicated markup + duplicated handlers that have already drifted.
> 2. **Make "Use in scene" intentful** — today it fires the blandest possible generic prompt ("I use my X here") with zero intent; the GM has to guess. Let the player say *how*, or surface the item's meaningful uses.

> **Verified at HEAD `v1.8.67`.** Two separate item-card render sites:
> - **Popup** (`renderInventoryScreen`, app.js L3990–4011): buttons `data-invuse`/`data-invname`/`data-invdrop`; shows **effects**; `data-invuse` handler inlines `renderPlay`.
> - **Play sidebar** (L4888–4900 + handlers ~L5112–5125): buttons `data-use`/`data-nameit`/`data-drop`; shows the **item image**; `data-use` calls `useItem()`.
> Same three actions, **different data-attributes, different handlers, different feature sets** (popup has effects, sidebar has the image — neither is a superset). **They have already drifted:** `data-invuse` and `data-use` are implemented differently, so "Use in scene" behaves subtly differently depending on which surface you clicked. This is a latent bug farm — fix one, forget the other.

## PART 1 — WHAT "USE IN SCENE" DOES TODAY (answering Erik)
`useItem(name)` (app.js):
- **Consumable** → `consumeItem` applies health/energy, removes it, shows an aside. Mechanical, correct.
- **Non-consumable** → `onFreeform("I use my ${name} here")` — **literally submits that sentence as a freeform action**, same path as typing it. So: yes, it's a canned text-action button. And it's the *blandest* possible one — no intent, no verb, no target. For an item as storied as Pell's whetstone ("returned to the bench twice and given away once"), "I use my River Whetstone here" throws away everything and makes the GM guess.

## PART 2 — CONSOLIDATE (one item-card component)
Extract a single `itemCard(it, { context })` used by BOTH surfaces:
- One markup template, one set of data-attributes (`data-item-use` / `data-item-name` / `data-item-drop` / `data-item-examine`), one handler-binding function.
- **Superset of features:** the image (from the sidebar) AND effects/bonusTags (from the popup) AND examine — the unified card shows all of it.
- `context` param handles the only real difference (popup vs inline-sidebar layout/size), not divergent behavior. "Use in scene" does the SAME thing from either surface after this.
- Delete the duplicate handler wiring; both surfaces bind the one shared function.

**Result:** one place to change item-card behavior; the drift becomes impossible.

## PART 3 — "USE IN SCENE" WITH INTENT
Replace the single canned prompt with an intent step. When a non-consumable's "Use in scene" is tapped:
- **Offer the item's meaningful uses** if it declares them: an item can carry `uses: [{label, prompt}]` (e.g. a whetstone → "Sharpen a blade", "Read the rune-seam", "Give it to someone"). Tapping a use submits its richer prompt.
- **Plus a free "Use it how?" field** — a one-line input so the player can state intent ("I press the whetstone to the seam and listen") that becomes the freeform action. This is the honest general case: the item + the player's stated intent, not a canned sentence.
- **Fallback** (item declares no `uses`, player types nothing) → the current generic prompt, so nothing regresses.
- Storied/named/forged items (the whetstone, the Unfinished Spear) especially benefit — their provenance can seed suggested uses.

*Design note: this is the same "attention makes it real" principle at the interaction layer — a meaningful item deserves a meaningful verb, not "I use my X here."*

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` | Extract `itemCard(it, ctx)` + `bindItemCardHandlers(root)`; both inventory popup and play sidebar render via it. Superset card (image + effects + tags + examine). Delete duplicate markup/handlers. |
| `app.js` (use flow) | "Use in scene" on a non-consumable opens an intent step: item's `uses[]` (if any) + a free "how?" field; submits the chosen/typed prompt via `onFreeform`. Consumable path unchanged. Generic prompt is the fallback. |
| `engine/inventory.js` / item records | Optional `uses: [{label, prompt}]` on items; forged/named items can seed suggested uses from provenance. |
| `style.css` | One `.item-card` style used in both contexts (size via a context class), replacing the two divergent blocks. |
| `tests/*` | Both surfaces render identical actions via the shared card; "Use in scene" from popup and from sidebar produce IDENTICAL behavior (regression against the current drift); intent step submits the chosen use; fallback preserves the generic prompt; consumable path unchanged. |

## GUARDS
- **Behavior parity is the point** — after consolidation, "Use in scene" must do exactly one thing regardless of surface. A test asserts popup and sidebar produce the same action for the same item.
- No regression for consumables (mechanical consume path untouched).
- Fallback preserves today's generic prompt so items with no `uses[]` and no typed intent still work.
- Drop still confirms; Name it still prompts.

## OPEN QUESTIONS — CCODE ROUND 2
1. Are the two surfaces ever shown simultaneously, or always one-at-a-time? (Affects whether the shared card needs two live instances or just one template.)
2. Does any other surface (examine modal, gambit builder, encounter loot) render item actions too, and should it also adopt the shared card in this pass?
3. `uses[]` authoring — should common item kinds (whetstone, blade, tome) get default uses from a kind→uses map, so not every item needs hand-authoring? (Recommend yes — a small kind-defaults table.)
