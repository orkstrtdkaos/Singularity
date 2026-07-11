# Results — Born-with-image (generate path) + SNG-046 Layer 3 per-location images

Date: 2026-07-11 · Shipped v1.8.14 · 743 smoke checks (+3) + parse_probe green · verified in-browser. Status: **shipped, awaiting Erik preview-legs before complete_pending_review**. Only Aevi closes. (Loose-end 3 of 3 from `po/BACKLOG_AUDIT.md`.)

**The audit's "0 image refs in generate.js" gap, closed.** SNG-035 shipped born-with-image as an app-layer step after mint; this moves it **into the engine generate path** so a generated NPC/location arrives WITH its picture regardless of caller — and adds SNG-046 **Layer 3** per-location images.

## Born-with-image IN the generate path
- `generate()` now accepts an **injected `deps.imageFor(entity, type)`** and stamps `entity.image` at mint (before persist) for npc/location. The image rides the per-save store + sync like any other field — **persist-once**, indistinguishable downstream.
- **Injected, not a direct art import** — `generate.js` stays image-provider-agnostic + headless-testable (no `localStorage`/DOM pulled into the pure engine). **Never throws** — a missing image never blocks a mint.
- `app.js handleGenerateRequests` injects the real builder (`ensureImage` at the viewer's ceiling, art-gated) into `generate`, and mirrors the born image into the gallery. The old post-mint image step is gone — one path now.

## SNG-046 Layer 3 — per-location images (generate-once-and-cache)
- **`ensureLocationImage(locId)`** mints a place's image on **discovery/visit** (wired into `travelTo`) and **caches it on `character.locationImages[locId]`** — persists in the save, **never regenerated** (Erik's key insight: bounded per-place, no whole-map geographic-consistency problem). An authored or born-with-image location keeps its own `image`.
- **`locationImageFor(locId)`** (display-only, no minting) returns the authored/born image or the cached one; shown in the **map detail panel** (`.location-image`).
- No-op when art is off; wrapped so it never blocks travel; added to the gallery.

## Guardrails held
Engine owns the mint; the image builder is injected (provider-agnostic); persist-once (born-with-image / cache-once, never regenerate); floors still apply (the injected builder routes through `sanitizeImagePrompt` with the viewer ceiling + `_gen` minor flag); additive (`entity.image`, `character.locationImages`); never blocks a turn or travel. Suites + parse_probe green. Never touched the ErikIAm pipeline.

## Verification
- `node tests/smoke.mjs` — **743 green** (+3): a generated NPC and a generated location each arrive **with `.image`** in the store via `deps.imageFor`; with **no `imageFor`** the mint still succeeds (image undefined).
- `node tests/parse_probe.mjs` — green.
- **Live-verified in-browser** (v1.8.14): `generate('npc', …, { imageFor: ensureImage })` stamped a **real Pollinations URL** onto the record **and into the per-save store**. Boots clean.

## Erik preview test (art on: Settings → Scene & item art → Generate)
"Play into a new place or meet a new face — it arrives WITH its own image (persisted; revisit and it's the same, not regenerated). Open the World Map and select a place you've visited — its image shows in the detail panel."

## Notes for Aevi
- This completes all 3 loose ends from `po/BACKLOG_AUDIT.md` (SNG-052, the leg-runner, born-with-image + L3). **Stopping here for a check-in before the bigger roadmap**, per Erik's directive.
- SNG-046 **Layer 2** (authored per-region base-map art) remains your content lane; Layer 1 (foundation) + Layer 3 (per-location images) are now both shipped.
