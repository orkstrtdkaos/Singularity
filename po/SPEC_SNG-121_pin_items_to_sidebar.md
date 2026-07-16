# SPEC — SNG-121: Pin items to the sidebar — quick-access set, the rest lives in Inventory
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The sidebar Items section dumps the **entire** inventory (15+ items in play — a long scroll). Instead, let the player **toggle which items show in the sidebar** (a weapon, a couple of consumables) from the Inventory view; the sidebar shows only that pinned quick-access set, and everything else lives in Inventory, out of view.

> **Verified at HEAD `v1.8.81`.** Sidebar Items section (`app.js` L5269–5270) maps `(character.inventory || [])` **in full** through `itemCard`. Item records (`inventory.js`) already carry a `kind` field (`weapon`/`tool`/`consumable`/`quest`/`misc`) — so a pin flag has a natural home, and `kind` gives sensible pin *defaults*. `itemCard` is already the one unified component (SNG-114), so a pin toggle lives in exactly one place.

## THE MODEL
- **A `pinned` flag per item** (`character.inventory[i].pinned`). Pinned items appear in the **sidebar Items section**; unpinned live only in the full **Inventory view**.
- **Toggle from Inventory:** each item card in the Inventory view gets a pin control (📌 / outline) — tap to pin/unpin. Cheap, per-item, persisted on the save.
- **Sensible defaults so it's useful on day one:** on first load (or for a never-pinned character), auto-pin by `kind` — the equipped/primary **weapon**, **consumables**, and anything with active `uses` — and leave bulk `misc`/`quest` items unpinned. The player re-tunes from there. (Never silently *unpin* a player's explicit choice — defaults only fill the initial empty set.)
- **Sidebar shows pinned only**, with a count + "＋ N more in Inventory" affordance so nothing feels hidden — one tap to the full list. If nothing is pinned, the section shows a short "pin items from Inventory for quick access" hint (and honors the SNG-120 collapse).
- **Quantity + quick-use intact:** a pinned consumable still shows its qty and its "use" path (SNG-114 intent uses) right in the sidebar — that's the whole point of pinning it.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (sidebar Items, L5269) | Render `inventory.filter(it => it.pinned)` instead of the full list; add the count + "＋N more in Inventory" link; empty-state hint. |
| `app.js` (Inventory view) | Add a pin toggle to each `itemCard` in the full Inventory screen (`data-pin` / delegated handler); reflect pinned state visually. |
| `engine/inventory.js` | `pinned` field on the item record (default from `kind` on first materialization); `togglePin(character, itemRef)`; a `defaultPins(inventory)` that fills the initial set by kind (weapon/consumable/has-uses) only when the character has never pinned. |
| `itemCard` (SNG-114) | Optional `showPin` context flag so the same card renders the pin control in Inventory but not (or as a small unpin) in the sidebar. |
| `tests/*` | Sidebar shows only pinned; pinning/unpinning from Inventory persists; defaults auto-pin weapon+consumables on a fresh character but never override an explicit choice; "＋N more" count correct; empty-pinned shows the hint. |

## GUARDS
- **Nothing is lost or truly hidden** — unpinned items are always in the Inventory view; the sidebar shows a live "＋N more in Inventory" count so the player knows the rest is one tap away.
- **Defaults never override choice** — auto-pinning fills only a never-pinned character's empty set; once the player pins/unpins anything, defaults stop touching it.
- **Composes with SNG-120** (collapsible sidebar): the Items section is still collapsible; its collapsed header can show "Items (4 pinned · 14 total)".
- **Composes with SNG-114** (unified itemCard): the pin control is a card context flag, not a second renderer — no drift.

## OPEN QUESTIONS — CCODE ROUND 2
1. Is there an "equipped/primary weapon" concept already, or is the weapon just `kind:"weapon"`? (Determines whether the default pins the *equipped* weapon or all weapons.)
2. Persist `pinned` on the item record (travels with the item) or as a set of item ids on the character? Recommend on the record — it's a property of the held item and survives reorder.
3. Should a quest item ever be auto-unpinnable, or are `kind:"quest"` items always shown somewhere prominent regardless? (Recommend: quest items default unpinned from the *quick* set but remain flagged in Inventory.)
