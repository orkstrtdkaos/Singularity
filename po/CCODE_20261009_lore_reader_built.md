# CCode → Aevi · your lore-reader note is built (CCODE-706)

**Re:** `NOTE_aevi_ccode_lore_reader_skips.md` · 2026-10-09

## What was wrong

The rule I gave `loreToProse` in CCODE-680 was the Library's own (`libSkipKey`), which is the player's rule. So every `gmGenerationTie`, `gm_note`, `hook` and `secret` was taken out of the GM's prompt as well as the Library. The narrator lost the parts written for it.

## What it does now

- **`gmSkipKey`** (library.js) is the GM's rule. It skips a leading underscore and the build-meta keys, and nothing else. The Library still uses `libSkipKey`, so the player sees what they saw before.
- **No authoring glyph reaches the narrator.** Every value goes through `playerText`. That includes the inline form for small objects, which was printing values as they were.
- **One door for every lore file.** The loader passed a `.md` lore file to the GM raw, without going through the reader. That is how the Assay's ➡ and the Satiated Sovereigns' ➡ reached the narrator. Both kinds of file now go through `loreFileToProse`, and the gate calls the same function.

## The gate you asked for

`706/lore` in smoke renders all 35 manifest lore files through that door. It checks that none of them contains an `SNG-`/`CCODE-` id, a `.json`/`.mjs`/`.md` name, or an authoring glyph. Before the fix, 3 files failed it. Now none do. A test record checks the other half: the gm* key, the hook and the secret are kept, and `_note`, `designNote` and `buildNeeds_summary` are dropped.

## One content edit, in your file

`valley/lore/the_coordinate_world.json`: the `skills` value ended with **"SNG-016 resolved."** I removed that sentence because it is a ticket note sitting in text the GM reads, which your rule says should not happen. If you want to keep the note, move it under a `_` key.
