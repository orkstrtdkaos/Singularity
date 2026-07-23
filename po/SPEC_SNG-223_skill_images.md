# SPEC — SNG-223: An image for every skill — extend the scene-image pipeline to the craft catalog
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** *"we probably want an image for every skill... but the images the scene itself produces were
> amazing, let's keep that going with the skill celebration and catalogs."*

## §1 — The pipeline already exists and generalizes (verified)
The "amazing" scene/place/moment images all run through ONE function: **`ensureImage(entity, type, opts)`**
(app.js) — generate-once-and-cache, rating-lensed, minor-safe, gallery + lightbox integrated. It already
serves types: `character`, `npc`, `location` (SNG-046, cached per-character on discovery/visit), and
`moment` (SNG-035, the braid/scene moment art). Place images (SNG-046 L3): `ensureImage` generates ONCE on
discovery/visit, persists on `character.locationImages[locId]`, never regenerates.

**So "an image for every skill" is the SAME pattern applied to a new entity type — not a new system.** Add an
`"ability"` (craft) image type; generate-once-and-cache per craft; display in the catalog, the wheel node,
the detail panel, and the discovery moment (SNG-222 §5).

## §2 — Outcome wanted
Every craft (owned, and ideally reachable/known) has an image, generated from its authored description, shown
wherever the craft appears: the skill wheel node, the detail panel (SNG-218 §4), the merged
catalog/character sheet (SNG-215 §C), and the discovery/braid moment. The same visual richness the scene
images bring, carried into the craft surfaces.

## §3 — The design decisions (this is why it's a spec, not just "call ensureImage")
Generating an image for EVERY skill has cost/timing tradeoffs the place-image system already reasoned about;
apply the same discipline:
- **Generate-once-and-cache, on FIRST MEANINGFUL CONTACT — not all at once.** Do NOT batch-generate images
  for all ~280 catalog crafts (cost + quota blowout). Mirror place images: generate a craft's image the first
  time it MATTERS — when learned/owned, when minted as a discovery/braid (that image IS the moment image,
  SNG-222 §5, generated once and reused), or when first opened in the detail panel. Cache on the record
  (`character.abilityImages[abilityId]` or `ability.image` for authored ones), never regenerate.
- **Authored vs generated (the place-image precedent).** A craft MAY carry an authored `image` in content
  (like a born-with location image); else the per-character generate-once fills it. `abilityImageFor(id)` =
  `CONTENT.abilities[id]?.image || character.abilityImages?.[id] || null` — exact parallel to
  `locationImageFor`.
- **Prompt from the authored description + tradition aesthetic.** The craft's own text is the prompt seed
  ("read the death-pattern of any creature within sight simultaneously… every nearby ending as a single
  illuminated page" — Undying Ledger). Ground the visual in the craft's tradition/school aesthetic so an
  Ashwarden craft LOOKS Ashwarden. Rating-lens + minor-safe come free via ensureImage.
- **Priority order (Erik's "keep it going" — the highest-impact first):**
  1. **Discovery/braid moment images** (SNG-222 §5) — the celebration, the most emotionally-loaded surface.
     FIRST.
  2. **Owned crafts** — the player's actual kit gets faces (wheel node, detail, catalog). Generated on
     learn/first-view.
  3. **Reachable/known crafts on view** — generate lazily when opened in the detail panel, not preemptively.
  4. **Aspirational/distant crafts** — placeholder/tradition-glyph until reached; don't spend quota on crafts
     the player may never learn.
- **Failed-gen is a no-op** (ensureImage already: a failed gen leaves no tile) — a craft with no image shows
  a clean tradition-glyph fallback, never a broken frame.

## §4 — Where the images show (ties the UX cluster together)
This is the visual payoff for specs already written:
- **Skill wheel node (SNG-218 §3)** — a craft's node can carry its image (or glyph fallback).
- **Detail panel (SNG-218 §4)** — the larger craft image beside its mechanics/rank ladder.
- **Merged catalog / character sheet (SNG-215 §C)** — every trait/craft with its image, the "clean layout
  with relevant info" Erik asked for, now illustrated.
- **Inventory bag (SNG-215 §B)** already wants item images — same ensureImage extension for items, if not
  already; note the parallel.
- **Discovery/braid moment (SNG-222)** — the celebration image.
One image per craft, generated once, reused across all of them.

## OWNERSHIP
CCode — engine/app.js: the `"ability"` image type in ensureImage, `abilityImageFor` + `abilityImages` cache,
the generate-on-first-contact triggers, the glyph fallback, and wiring the image into wheel/detail/catalog/
moment. Aevi (me): if we want a per-tradition visual-aesthetic guide for the prompt (so each tradition's
crafts share a look), I author that as prompt-guidance content — flag if wanted.

## GUARDS
- **Never batch-generate the whole catalog** — generate-once-on-contact, exactly like place images; ~280
  crafts × preemptive gen = quota disaster. Lazy + cached is the rule.
- **Reuse ensureImage** — rating-lens, minor-safe floors, gallery, lightbox all come from it; do NOT build a
  parallel skill-image path.
- **Glyph fallback, never a broken frame** — a craft without an image shows a tradition glyph; a failed gen
  is a no-op.
- **The moment image IS the craft image** — a discovery/braid generates its image once at its moment
  (SNG-222 §5) and that same cached image serves the catalog/wheel/detail; don't regenerate per surface.

## OPEN QUESTIONS — CCODE ROUND 2
1. Cache location — `character.abilityImages[id]` (per-character, like locationImages) vs a shared cache? Per
   character matches the place-image precedent and the rating-lens (a viewer's rating level affects the
   image); lean per-character.
2. Generate-on-learn vs generate-on-first-view for owned crafts? On-view is cheaper (only crafts the player
   actually looks at); on-learn means the wheel is always illustrated. Maybe on-learn for owned (small set),
   on-view for the rest.
3. Do items (SNG-215 §B bag) share this exact extension (an `"item"` image type), or are item images already
   handled? Confirm and unify if so.
4. Want a per-tradition visual-aesthetic guide (Aevi authors) so each tradition's crafts share a coherent
   look, or let the per-craft description carry it alone?
