# SPEC — SNG-136: Portraits reflect lived growth — chronicle into the seed, NPC portraits on bond milestones
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik (gallery screenshot): (1) "The chronicle isn't piping into the appearance text that generates a new picture every couple level-ups." (2) "I have 0 renders of Pell — the generator should fire when an NPC hits certain relationship milestones (the higher ones)."**

> **Verified at HEAD `v1.8.92`. Both confirmed — and both are additions to existing systems, not new engines:**
> 1. **`characterPromptSeed` (art.js) does NOT read the chronicle, deeds, or level.** It reads `appearance`/`form`, origin, background, gear, and `bio.motivation` — all creation-era static (only gear changes over time). So a level-up regen rebuilds from who the character WAS, not who they've become. The lived story never reaches the picture.
> 2. **There is NO NPC-portrait-on-milestone anywhere.** `art.js` has no `npcPromptSeed`, no bond-triggered generation. The only portrait regen is MANUAL (`regeneratePortraitFlow`, app.js L4205). Pell has 0 renders because nothing is built to make one — the NPCs in the gallery (Vash, Calvar) are incidental SCENE art, not dedicated portraits. The gallery machinery (`addGalleryImage`, dedup, cap) + bond stages (`bondStage`, `advanceBond`) already exist — only the trigger + NPC seed are missing.

## PART 1 — The chronicle feeds the character seed (so regens show who they've become)
- **`characterPromptSeed` reads the lived record**, not just the creation description. Fold in, briefly: the character's **level/standing** (a level-11 Silas looks more marked than a level-1), their **major deeds** (SNG-109 `majorDeeds` — "the necromancer who ended X", scars of what he's done), their **current arc stage** (SNG-133 personal arc), and their **evolved appearance** if the player has updated it. The seed becomes: static form + *what the years and deeds have written on them*.
- **Keep it bounded** — a few evocative clauses from the chronicle, not the whole log (prompt length + coherence). Prioritize: latest major deed + level-band + arc register. E.g. Silas's seed gains "hardened by what he has ended, the Deathbound spear worn familiar, a man the valley half-fears" from his deeds — so the regen at level 11 differs meaningfully from level 5.
- **Ties to SNG-134 Part 1** (the evolving lived story) — same source: the chronicle that feeds the header story feeds the portrait seed. One lived-record, many surfaces.

## PART 2 — NPC portraits fire on bond milestones (the higher ones)
- **A bond crossing a HIGH milestone triggers an NPC portrait.** When `advanceBond` moves an NPC to a high `bondStage` (e.g. committed / devoted / partner — the milestones that mean this person MATTERS), fire an NPC portrait generation → drop into the character's gallery (the same `addGalleryImage` path). Pell (together · devoted) would have fired one several stages ago.
- **`npcPromptSeed(npc, character)`** (new, parallel to `characterPromptSeed`): builds from the NPC's `form`/description, role/standing, and relationship to the player ("her blacksmith lover, at his back" — the record already describes Pell this way). Rating-lensed.
- **Which milestones:** the HIGH ones only (Erik: "the higher ones") — don't render every acquaintance. Recommend: fire at first crossing into a committed/devoted-tier bond (romantic) and at a high platonic threshold (deep ally / sworn). One portrait per NPC per milestone (dedup), never spammy.
- **Retroactive catch-up:** on load, any NPC ALREADY past a high milestone with no portrait yet (like Pell now) gets one generated once — so existing devoted bonds aren't left blank. (A version-gated one-time backfill, like the native-grants retro.)
- **Respects art mode** — only fires when artMode ≠ off (now defaults to "generate"); queues like other generated art; failed/blank generation retries rather than leaving an empty tile (the Vash blank tile in the screenshot suggests a failed gen that should retry or drop, not persist empty).

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/art.js` | `characterPromptSeed` folds in chronicle (majorDeeds) + level + arc stage; new `npcPromptSeed(npc, character)`; a blank/failed generation retries or is dropped (no empty gallery tile). |
| `engine/npcs.js` `advanceBond` | On crossing a HIGH bond milestone, emit a portrait-generation signal (or return a flag the app acts on) → generate + `addGalleryImage`. Dedup one-per-NPC-per-milestone. |
| `app.js` | Wire the bond-milestone signal to the art queue; a one-time retro backfill for NPCs already past a high milestone with no portrait (Pell); auto-regen the character portrait every N level-ups now reads the enriched seed. |
| `tests/*` | A character seed at level 11 with deeds differs from level 1 (chronicle present in prompt); crossing to devoted fires exactly one NPC portrait → gallery; retro backfill renders Pell once; a blank/failed gen does not leave an empty tile; art-off suppresses all of it. |

## GUARDS
- **Bounded seed** — chronicle folds in as a few clauses, not the whole log (coherence + length).
- **High milestones only** — NPC portraits at meaningful bond tiers, deduped one-per-milestone; never every acquaintance, never every turn.
- **Rating-lensed** — NPC portrait prompts respect the character's rating ceiling (a devoted-romantic portrait stays within the profile's rating).
- **No empty tiles** — a failed/blank generation retries or drops; it never persists as the empty Vash-style tile in the gallery.
- **Reuses existing art plumbing** — `addGalleryImage`, dedup, cap, seed-stability all unchanged; this adds triggers + the NPC seed, not a new art pipeline.
- **Minor-safety** — an NPC portrait for a bond involving a minor is platonic-only and rating-floored (inherits SNG-108's absolute minor gate; romantic-tier milestones can't be reached with a minor anyway).

## OPEN QUESTIONS — CCODE ROUND 2
1. Exact high-milestone thresholds to fire on — the SNG-108 `bondStage` values for committed/devoted/partner (romantic) + the top platonic tier. Confirm the stage names.
2. Character auto-regen cadence — every N level-ups (Erik: "every couple level-ups") — is there an existing counter, or add `levelsSincePortrait`? (Recommend every 3 levels, or on a major-deed, whichever first.)
3. The empty gallery tile (Vash) — is that a persisted failed-gen URL, or a pending-never-resolved entry? (Determines whether the fix is retry-on-fail or prune-empty-on-load.)
