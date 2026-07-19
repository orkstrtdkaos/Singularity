# SNG-169 — Reuse the images we already generate; fix the inventory card

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play
**Numbering:** checked `po/` at HEAD before minting (highest was 168).

Erik: *"Image generation works really well as is — I would want to use any generated images to show
what each item is… This same image reuse should be applied to the popups for the people known. If
they have an image already generated, use it. If not, offer the option to generate one."*

**Nothing here needs a new image system.** The generators exist and are good. This is reuse and layout.

---

# §1 — What already exists (measured at HEAD)

`engine/art.js` is complete and well-built:

| export | state |
|---|---|
| `itemImage(item, {ratingLevel})` | returns `item.image`, else assembles a sanitized prompt and returns a **deterministic** URL seeded on `item.name` |
| `npcImage(npc)` | same shape, seeded on `npc.id`, with `isMinorSubject` protection |
| `locationImage` / `sceneImage` | in use |
| `ensureImage`, `ensureGallery`, `addGalleryImage` | persistence + gallery |
| `sanitizeImagePrompt` | rating ceiling + absolute minor-protection floor, every prompt routes through it |

Because `imageURLFor` is deterministic on prompt + seed key, **the same item resolves to the same URL
every time.** Thumbnails cost nothing extra: it is the image we would already have shown.

## The three defects

**1a. `npcImage` is imported and never called.** `app.js:21` imports it; there are zero call sites in
the entire codebase. NPC portraits resolve for generated NPCs via `generate.js:313`, but nothing ever
asks `art.js` for an NPC image on a surface. Built, correct, unreached — the eleventh this batch.

**1b. Item images only render when a card is already open.** `itemCard` (app.js:5917):

```js
const img = open && imagesEnabled() ? itemImage(it, {...}) : null;
```

So the list is text-only and the image appears *after* you have already committed to the item. That
is backwards: the picture is the thing that tells you which item this is.

**1c. The card layout forces the pin onto its own line.** `.item-name { width: 100% }` (style.css:198)
with no `display:flex` on `.item-card` — so the pin button wraps beneath every row. That is the
column of pink markers in Erik's screenshot, and it is why the inventory reads as "crappy UI" before
any image work.

---

# §2 — The inventory card

**Keep `itemCard` as the single shared component.** Its own comment says it is rendered by *both* the
inventory popup and the play sidebar *"so the two can never drift again."* That discipline holds —
all changes go in the one function.

**2a. Layout**
- `.item-card` → `display:flex; align-items:center; gap:8px` on its header row; drop `width:100%`
  from `.item-name` so the pin sits inline.
- New `.item-thumb` — small square (~28–32px), `object-fit:cover`, rounded, in the header row before
  the name. Sized so a full inventory still fits a phone screen, per Erik.
- `.item-img` keeps `width:100%` for the expanded view. Thumbnail and full image are the same URL at
  two sizes; no second fetch.

**2b. Thumbnail always, expansion unchanged**
- Render the thumb whenever `imagesEnabled()`, regardless of `open`.
- `loading="lazy"` and the existing `onerror` hide, so a failed image degrades to today's text row.
- **Tapping the thumb** opens the full image (lightbox); **tapping the name** toggles the card as it
  does now. Two targets, two behaviours, both obvious.

**2c. The description popup**
Erik: *"The item should also carry the click description popup."* The unified popup already exists —
`entityHover("kind:id")` → `showPopoverText`, SNG-134 Part 2, *"ONE hover/tap detail for a skill /
name / item, everywhere they appear."* Items in the sidebar already use it.

So: give inventory rows `data-entity="item:<name>"` and they inherit the same popup for free. **Do
not build a second popup** — that is exactly the drift SNG-134 was written to prevent.

---

# §3 — Images in the entity popup (Erik's second ask)

`showPopoverText` is **text-only**. That is the surface where Erik wants portraits.

- Extend the popover to accept an optional image: `showPopover({ image, text })`, with
  `showPopoverText` kept as a thin wrapper so no existing call site changes.
- **NPC popups call `npcImage(npc)`** — the function that has been sitting unused. If it returns a
  URL, show the portrait above the text.
- **Same for items** via `itemImage`, so the popup and the card agree.

## 3a. "If not, offer the option to generate one"

This is the part that needs care, because generation costs money and can surprise.

- If no image resolves and art mode is **`generate`**, the deterministic URL *is* the offer — it will
  render on demand. Nothing to ask.
- If art mode is **off** or **existing-only**, show a **"Generate a portrait"** button rather than
  silently doing nothing. One tap, explicit, and the result persists via `ensureImage` so it is
  generated once.
- Persist to `npc.image` so it survives the session and every later surface reuses it — which is the
  whole point of Erik's ask.
- **`sanitizeImagePrompt` and `isMinorSubject` are non-negotiable** on this path. A user-initiated
  generate must route through the same floors as an automatic one; the button is a trigger, never a
  bypass.

---

# §4 — Acceptance

1. The inventory list shows a thumbnail per item, and a full inventory still fits a phone screen.
2. The pin sits inline with the name — no wrapped row of markers.
3. Tapping a thumb opens the full image; tapping a name expands the card as before.
4. An item's description popup is the **same** popup used elsewhere, not a new one.
5. A known person with an existing image shows it in their popup — **no new generation call.**
6. A known person without one shows an explicit generate offer, and the result persists.
7. Art mode `off` behaves exactly as today, everywhere.

# §5 — Questions for CCode ROUND 2

1. §2b — is the thumbnail URL identical to the expanded one (same prompt, same seed), so the browser
   serves the second from cache? I believe yes from `imageURLFor`, but you own that path.
2. §3a — does `ensureImage` already persist to the character save, or only to the in-memory record?
   Erik's ask depends on "generate once, reuse everywhere," which needs the save.
3. Is there a per-session or per-character image budget worth surfacing? Thumbnails across a full
   inventory are the first place this app renders many images at once, and I would rather know the
   cost than discover it.
