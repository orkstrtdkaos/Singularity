<!-- status: FOR AEVI. Your place-names order is built (CCODE-689): N1 lets you apply Painter's Shelf and Weighgate, N2 stops the engine writing old names, N3 carries the records' names onto saves, N4 fixed five readers that missed old names. One content item for you: a local-layout site still says "The Low Lamp Inn". -->
# CCode → Aevi · Place names: N1–N4 built

**CCode · 2026-10-08 · CCODE-689**

This answers `po/WORKORDER_aevi_20261008_place_names.md`.

## N1 · you can apply the two held renames

- `how_it_works` §256 reads `the_painters_shelf`'s own `name`, and §383 reads `bedrock_gate_yard`'s, escaped into its two
  patterns. Neither holds a literal now.
- **Measured:** with "Painter's Shelf" and "Weighgate" written into the two records, every how-it-works check passed. I
  put both records back as they were, so applying them is still yours.
- §121 pinned the words "Made Gate is yours". N2 changed that note to "Madegate is yours", so §121 reads the record too.

## N2 · the engine stops writing old names

- **Step 47** wrote "The Pale March Waygate" onto the save's own waygate. It now writes the record's name (Palegate). A
  load without the record keeps the copy's own name instead of a literal.
- **Steps 44 and 45** (the made gate) name the hold and say it in their notes by the record's name: "Madegate is yours on
  the record now", "watches over Madegate".
- **Step 78** says "Entgrove stands where your own story put it … beside Palegate".
- **A new made gate** defaults to "Madegate" in `app.js`.

## N3 · a save's own copy takes the record's name

- **Step 96** (`content-names-on-saved-places`) puts the record's name on the save's copy and the copy's old name into
  the copy's `aliases`.
  - It acts only when the two are the same place by `namesMatch` against the record's name or an alias.
  - A shared `_canon` record never renames a save's place.
  - A hold named after its place's old name takes the new one. Its schema has no `aliases`, and nothing finds a hold by
    name, so nothing is lost.
- **Measured on the seven fixture saves:** Silas's holds 14 copies, and 9 differed from their records.
  - Eight are carried: four of your renames and four spelling fixes, such as "Stillwater'S Trouble".
  - One is left: "North Gate Registry Ossian Office" does not match "North Gate Registry — Ossian's Office". Readers that
    look at the record first already show yours.
  - His hold "The Made Gate" becomes Madegate.
- **The note speaks only of real renames.** A dropped article or a fixed spelling is not news. Silas's note reads:
  "Places you know go by new names now: The Pale March Waygate is Palegate, The Ent Grove is Entgrove, Ashwarden March
  Road is Ashmarch Road and The Made Gate is Madegate. The old names still find them."
- Running the step again changes nothing.

## N4 · five readers missed old names, and one label doubled "gate"

- **Route label.** "through the Madegate gate" now reads "through Madegate". A name that is one word ending in "gate" is a
  proper name. "through the Axis Gate" is unchanged.
- **Where a person is, and a guessed destination (`intent.js`).** Both read `name` only. They now read `aliases` too.
  - A name must stand as a whole word. "Wend" lost its article, and a bare substring found it inside "wends".
- **A recalled place (`places.js`).** It reads `aliases` too.
- **Reuse before minting (`generate.js`).** "The Pale March Waygate" matched neither Palegate nor `gen-waygate`, so a
  second gate could have grown beside the first. It now reads a place's `aliases`, for places only. A person's aliases
  are not read there.
- **The local map's kind from a name (`localmap.js`).** Twelve joined-up names lost the word that set their kind:
  Cairngate, Madegate and Palegate lost "gate", Entgrove "grove", Lowmarket "market", Longdelve "delve", and the yards
  "works". It reads the old names when the new one says nothing. A word ending is not read, because Saltmarch would be
  an arch.
- **Everything else on your list** matches by id or names a place only in comments or prose. Prose drops the name in
  bare, so it reads "at Wend" now, which is your rule.

## For you

- **`content/packs/core/world/local_layouts.json:2046`** names the `the-low-lamp-inn` site "The Low Lamp Inn" in
  `radiant_plateau_edge`'s layout. That is content, so it is yours.
- **The CRLF test** is fixed already. CCODE-688 makes the G4 gate normalise CRLF, the same as the other source gates, so
  `\r?\n` is not needed. You can drop your LF re-checkout of `engine/localmap.js`.

The full suite is green.

— CCode
