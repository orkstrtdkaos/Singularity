# SNG-223 — an image for every craft (the scene-image pipeline, extended)

**CCode · 2026-07-23 · v1.8.225 (`574e7089`) · 6 tests green · live-verified.** *"Keep [the amazing scene images] going with the skill celebration and catalogs."* Done — the exact `ensureImage` pipeline, extended to crafts, lazy and cached.

---

## What shipped

- **`assembleImagePrompt` gains an `"ability"` kind** — the craft's authored description *is* the prompt, grounded in its tradition's aesthetic ("… — rendered in the aesthetic of the ashwarden tradition"), so an Ashwarden craft looks Ashwarden.
- **`abilityImageFor(id)`** = authored `image` ?? `character.abilityImages[id]` — the exact parallel to `locationImageFor`. **`ensureAbilityImage`** generates-**once**-and-caches on the character (persists in the save, never regenerates) + drops it in the gallery; a closed antipode never generates.
- **Lazy, generate-on-first-contact:** the **detail panel** generates + shows the craft image the first time the player opens it — only crafts they actually look at (Q2: on-view). It **never batches** the ~280-craft catalog (the quota GUARD). A craft with no image keeps its clean tradition-glyph node; a failed gen is a no-op (`ensureImage` already).
- **One image per craft, reused.** The discovery/braid moment image (SNG-222 §5) and this share the same pipeline; rating-lens, minor-safe floors, lightbox, and gallery all come free from `ensureImage`.

## ROUND 2 — answered

**Q1 (cache location):** `character.abilityImages[id]` — per-character, matching the rating-lens (a viewer's ceiling shapes the image) and the place-image precedent. **Q2 (on-learn vs on-view):** on-view (the detail panel) — cheapest, only what's looked at; the wheel/catalog then reuse the cache. **Q3 (items):** items are SNG-215 §B's `"item"` extension — noted, not built here (the `"item"` kind already exists in `assembleImagePrompt`, so it's a one-liner when that ships). **Q4 (per-tradition aesthetic guide):** the prompt already carries the tradition name; a richer per-tradition visual guide is your optional content add — flag it if you want each people's crafts to share a tighter look.

## Where it shows (and what's deferred)

Built now: the **detail panel** — the highest-value surface, the larger image beside the mechanics/rank ladder (SNG-218 §4). The cache (`abilityImageFor`) is ready for the other surfaces the spec §4 lists (wheel node, merged catalog/character sheet) to read once they render images — they can show `abilityImageFor(id)` **if cached** (free, no gen) as a light follow-on. I scoped the generate-trigger to the detail panel to keep the quota discipline tight (generate only what's opened); wiring the cached image into the catalog rows is a small additive next step if wanted.

## Verified

6 checks: `assembleImagePrompt("ability")` builds from description + tradition (unit-tested, pure); `abilityImageFor` reads authored-then-cache; the generate-once-lazy guard (a cached craft returns immediately); the detail panel generates + shows it; the styled art with lightbox. Suite green — ratchets held (the prompt slice is marked `// prose-cap-ok`, matching the sibling location/item/moment prompt caps in the same function — it's a prompt, not displayed prose). **Live** (v1.8.225): opened Drumline Stride on the wheel → its detail panel generated and showed a Pollinations image, 0 console errors.

*— CCode. The crafts have faces now — generated the moment you look at one, in its people's own aesthetic, kept once and reused everywhere the craft appears. Same pipeline the scenes use; the discovery's celebration image and the catalog's are the one image, made once.*
