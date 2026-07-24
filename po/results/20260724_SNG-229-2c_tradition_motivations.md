# SNG-229 §2c — the tradition motivations reach the GM (WHY a people acts + what its craft DREADS)

**CCode · 2026-07-24 · v1.8.246 (`38dab1cd`) · content CI + smoke + wiring green · live-verified.** *The staged `tradition_motivations.json` (24 traditions, where SNG-229's FEARS were folded) had never been integrated.*

## Why it couldn't just be "registered as lore"

`loreForLocation` only surfaces what a location `loreRefs`, and **no location names** `tradition_motivations`. Plain-lore registration would have been dead content fed to nothing (or, if force-fed, ~5k tokens of all-24 every turn). So it needed its own content type + a **selective** surface.

## What shipped

- **Loader:** valley manifest gains `provides.tradition_motivations`; `state.js` loads it into `CONTENT.traditionMotivations`, parallel to the bestiary loader (tolerant — a miss disables the surface). Canary: `traditionMotivations=24`.
- **Selector** (`state.traditionMotivationsForGM`, pure): given the traditions **in play this beat** — the character's own domains + each scene NPC's primary craft — emits each people's **WANT** and the creature its craft **DREADS** (dread `creatureId` resolved to a name against the bestiary). Deduped, unknown ids dropped, bounded to who's present (never all 24). `villainy` rides as a **GM-eyes** antagonist seed, explicitly never stated to the player as settled fact.
- **Wired into the GM context:** a registry row (`traditionMotiveDetail`) + a rendered world-tier block ("WHY THESE TRADITIONS ACT"). Registry↔gm.js parity holds.

## Why it matters

A tradition's NPCs can now act on real motive, and a feared creature lands as **THE** thing that unmakes their particular craft — the fear→creature half of the SNG-229 weave, in play. Example (live selector output): *Ashwarden wants to attend endings well · DREADS the wrong stag — a thing past dying-right, the one creature Palework cannot answer.*

## Verified

Smoke §2c: selective/deduped surface · want+dread both present · villainy GM-eyes · empty-case tolerance · the wiring (registry + render, not a dead export). Live (fresh port 8281): `bestiary=26 beastEncounters=26 traditionMotivations=24`, zero console errors. Content CI + smoke + wiring-audit green; no mojibake.

## Aevi next (§2c-e, now unblocked at the loaded target)

The doc is **loaded**, so folding `bestiary_weave.json`'s wants/hunts and any further per-tradition motive edits land on `content/packs/valley/tradition_motivations.json` (not the staged copy) and reach the GM through this surface. Dread `creature` ids resolve against the loaded bestiary.

**Tier-2 (Erik):** an Ashwarden NPC fearing the wrong stag, or a tradition's people acting on their want, surfacing on-screen in play.

*— CCode. The map of WHY was authored; now the GM reads it, for exactly the crafts in the room.*
