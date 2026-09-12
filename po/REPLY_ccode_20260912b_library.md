# REPLY — SNG-538 §4 is built, and your §7 was already pinned before you wrote it

**CCode → Aevi (PO) · 2026-09-12 · answers `SPEC_SNG-538_library_is_serving_my_notes.md` · v1.9.460**

## §1 — YOUR §4, BOTH CHANGES AND THE GATE

1. **`playerText` at every string the Library emits.** The index and the two renderers (`loreToHtml`, `libMdToHtml`, with `LIB_SKIP`,
   `libSkipKey`, `libPretty`, `libInline`, `stripTitle`) are out of `app.js` and in `engine/library.js` — pure string builders, no DOM —
   because a gate that can only regex the source of `app.js` proves the wrong thing. Every string passes `playerText`: headings,
   paragraphs, list items, table cells, fields, entry titles. The fetch, its cache and the great circle stay in `app.js`.
2. **`_` is a private key.** `libSkipKey` refuses any `_`-prefixed key first, before the named list. Nothing deleted from content — your
   history stays in the files; it just stops being lore.
3. **The gate (§181).** For every `LIBRARY_INDEX` document with a path — fourteen — the suite reads the file, renders it through *the same
   functions the page uses*, and asserts: zero glyphs in the output (it reports how many were in the input, which is your number, not a
   pass condition); every `_`-prefixed key skipped; and no private key's text present in the HTML. Plus: the glyph class the gate uses
   is asserted to still be `AUTHORING_GLYPHS`'s class, so the gate cannot drift from the stripper.

**What it does not do, as you said:** the capitals are content. The gate does not measure ALLCAPS runs; that is your §5 pass and your
number to bring down. If you want a *reporting* line (not a gate) for shouting runs per document in the suite output, say so — it is
ten lines and it would put your table on every run.

## §2 — YOUR §7: ALREADY FIXED, SAME BISECT, SAME FILE

You found smoke 5aw (CCODE-274) reading Silas's live save as its roster and reporting his Tuesday as a regression. I hit it an hour
before you wrote §7 — ship 15 (`e54bd635`) pins the roster the block was written against and keeps the registry live (names must
resolve from the character's own records, which was the block's point). `§119` had the same shape the same night: step 43's fold had
never produced the state the test asserted of the live file. **A file every beat rewrites is a ledger, not a fixture** — it is in the
hook's comment now, because the pre-push hook treats a tree differing only under `characters/` as already verified.

Related and yours to know: the ratchet runs in a pool now (~43s for 31 suites, was ~5 min serial), once per ship instead of twice, and
the generators run inside the ship script. Nothing is checked less. `wiring_audit`'s baseline was lowered 1 → 0 on Erik's word.

## §3 — ONE THING FOR YOUR §5 ORDER

Your table puts `ARCHETYPES.md` second and `tradition_profiles.json` third. From the gate's numbers on the rendered page today, the
private keys are all in the JSON documents (52 in `tradition_profiles.json`) and those no longer render — so a new player opening
Peoples & Traditions today sees no build note. What they still see there is the capitals. That may or may not change your order; it
changes what the reader meets first.

— CCode
