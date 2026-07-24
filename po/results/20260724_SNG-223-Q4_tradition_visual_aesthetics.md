# SNG-223 Q4 — each people's crafts share a look (per-tradition visual aesthetic in the image prompt)

**CCode · 2026-07-24 · v1.8.247 (`99dd72e8`) · content CI + smoke + wiring green · live-verified.** *SNG-223's craft-image pipeline carried only the bare tradition NAME. Aevi authored the concrete visual guide and staged it; this wires it in.*

## What shipped

- **Content home:** `tradition_visual_aesthetics.json` → `content/packs/core/rules/` + registered in the core manifest `provides.rules` (STRICT dir — placement + registration in one commit). 24 traditions, each `{canonAesthetic, palette, materials, light, mood}` built on the tradition's canon `aesthetic`.
- **Loader:** `state.js` `loadRule("tradition_visual_aesthetics")` → `CONTENT.traditionVisualAesthetics` (the `.traditions` map). Optional — a miss keeps the bare-name fallback. Canary `traditionAesthetics=24`.
- **Prompt** (`art.js` `assembleImagePrompt("ability")`): takes `ctx.aesthetic`; when present, the craft's **palette / materials / light / mood** ride the prompt; when absent, the exact old bare-name string — backward-safe (the existing 223 test still passes untouched).
- **Caller** (`app.js` `ensureAbilityImage`): keys the craft to its **canonical** tradition id (`abilityTradition` via `traditionOf` — many abilities carry no bare `.tradition`) and passes that tradition's block via `promptOpts`. **Forward-only:** already-cached craft images are never regenerated (the SNG-223 generate-once guard), so only crafts opened from here on get the richer aesthetic — no quota spike, no churn of existing images.

## Why it matters

An Ashwarden craft now renders in greys/ash/grave-stone under the grey light of a still morning, "the mercy of stopping — solemn, tender, kept"; a Wright craft in scaffolds/half-built/becoming. The tradition is no longer a word in the prompt — it's a concrete look the whole people shares.

## Verified

Live (fresh port 8291): `traditionAesthetics=24`, zero console errors, and the **full app path** — ability *Palework* → `traditionOf` → `ashwarden` → block found → prompt tail `"ash, grave-stone, worn iron, chalk; the grey light of a still morning; the mercy of stopping — solemn, tender, kept"`. Smoke: 5 new §Q4 checks (loaded + whitelisted · with-aesthetic palette/materials/light/mood present · without-doc bare-name fallback · loader + caller wiring). Content CI + smoke + wiring-audit green; SYSTEM_SPEC core rules 34 → 35; no mojibake.

**Tier-2 (Erik):** open a craft's detail panel in play — its generated image now carries its people's palette.

## Note

`po/staged_content/tradition_visual_aesthetics.json` is now integrated (loaded copy at `content/packs/core/rules/`). Any future aesthetic edits land on the content-pack copy.

*— CCode. The crafts had faces (SNG-223); now a people's faces share a family look.*
