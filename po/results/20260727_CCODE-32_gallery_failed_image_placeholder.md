# CCODE-32 — Gallery: a failed image is a placeholder, not a vanished tile

**CCode · 2026-07-27 · v1.8.293 (`d7f52833`) · npm test exit 0 (rawProseCaps 63, ENGINE_MAP ok, wiring audit all-pass).**

Erik (gallery filtered to People, count says 9, only 3 tiles showing): *"it seems like there are a lot more images
but something is collapsing them."*

## Two separate facts (both checked, not assumed)
1. **The "All 48" is the OLD cap's residue.** I audited: `GALLERY_CAP` is now **240** (CCODE-31 shipped) and there
   is **no other cap or truncation** anywhere (no second slice, nothing in the sync/migrate paths). So the exact
   "48" is what survived the *old* 48-cap — the hundreds generated over 27 world-days were dropped *before* the fix
   landed and were never archived. It grows from here; the already-dropped ones can't come back.
2. **The visible-vs-count mismatch (9 counted, 3 shown) was a live render bug** — and that's what this ticket fixes.

## The bug
The gallery `<img>` used `onerror="this.parentElement.style.display='none'"` — a failed image **hid its whole
tile**. Pollinations rate-limits when a full gallery of images loads at once, so a majority of tiles vanished and
the grid looked far sparser than the count. That's the "collapsing."

## The fix
- **Auto-retry once:** on error the img cache-busts its own src (`?_r=<ts>` — same seed → same image, just a fresh
  fetch), which recovers the transient rate-limit failures without any interaction.
- **Placeholder, never hidden:** if it still fails, the tile becomes a retryable **placeholder** — the img keeps
  its 4:5 box (`visibility:hidden`, not `display:none`), so the tile holds its place, the count matches the grid,
  and a dashed outline + a centered **⟳ retry** read as "this one didn't load."
- **Manual retry:** the ⟳ button cache-busts + clears the broken state, recovering stragglers on demand.

## Live verification (fresh port 8367)
The non-composited preview pane suppresses `loading="lazy"` fetches (a harness artifact — images never attempt to
load, so onerror can't fire naturally). Verified the handler logic deterministically by dispatching `error` events:
- A failed tile **stays visible** (`figure display ≠ none`), the img is hidden (`visibility:hidden`), the **⟳ retry
  is shown**, and the `.gallery-broken` class is set — so the count matches the grid.
- The auto-retry set its counter + cache-busted the src (fresh fetch) before falling back to the placeholder.
- Clicking **⟳ retry** cleared the broken state, reset the counter, and re-fetched.
- The good tile (a data-URI image) was untouched; both tiles present, none hidden.

## Files
- `app.js` — the gallery `<img>` onerror (auto-retry → placeholder); a per-tile `⟳ retry` button; the delegated
  `[data-galretry]` handler.
- `style.css` — `.gallery-broken` (dashed box, img hidden-but-space-kept) + `.gallery-retry`.

## Notes
- CCode-direct follow-up to CCODE-31 (Erik's live gallery observation) → CCODE-32.
- Root cause of the failures is pollinations flaking under concurrent load; the auto-retry + manual retry make the
  gallery resilient to it. If it stays a problem at large galleries, a follow-on could stagger the concurrent
  loads — flag if you still see many placeholders after a reload.

*— CCode. A picture that doesn't load now leaves a marked, retryable slot instead of silently disappearing.
status: complete_pending_review.*
