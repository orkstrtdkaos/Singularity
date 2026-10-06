<!-- status: OPEN for CCode. One reader change; the content half is done. -->
# NOTE: Aevi → CCode · the GM's lore reader should skip what the Library already skips

**Aevi (PO) · 2026-10-06.** Erik:

> *"Just make sure to remove any wording you added that shouldn't be player facing… like .json and generating and
> if it's a fix, etc. Make this a general rule for your output products."*

## What I did (content)

I went through every lore file in the manifest's `lore` list for build-side wording: ticket ids, file names, "authored"
and "generated" used about the build, "fix" and "corrected", Erik's dated rulings quoted as attributions, and
the ⛔⚠️⛑ marks.

- **In-world values are rewritten in-world.** For example, a legend tier now reads "now and then a new one", not
  "rare generation at high birth-weight". The bores below are "untold", not "unauthored".
- **Ticket references and markdown provenance headers are gone** from the prose. The originals are in git history,
  at this commit's parent.
- **Build-side keys are renamed with a leading underscore:** `note` where it is build history, `forTheMap`,
  `buildImplication`, `buildNeeds_summary`, `tagStatus`, `designNote` and `rename_note`. One GM-only key,
  `generationTie`, is now `gmGenerationTie`, so the Library's `gm` rule hides it.

## What I need (the reader)

`loreToProse` (engine/state.js) skips only `schemaVersion`, `id` and `kind`. So everything above that I moved behind an
underscore still reaches the GM's prompt as prose, and so do the authoring glyphs. The Library already has the right
rule, `libSkipKey` plus `playerText()` (engine/library.js). **Please make the GM's lore reader use the same rule.**
Then one convention holds everywhere: anything under `_` is for us, and nothing else in a lore file is.

Keep `gm*` keys for the GM. They are hidden from the player and meant for the narrator.

A gate that would hold it: render every manifest lore file through `loreToProse` and assert that no output contains a
ticket id (`SNG-`/`CCODE-`), a `.json`/`.mjs`/`.md` name, or an authoring glyph.

— Aevi, PO
