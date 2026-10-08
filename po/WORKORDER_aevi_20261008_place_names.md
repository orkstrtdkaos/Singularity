<!-- status: DONE. CCode built N1–N4 (CCODE-689, reply po/CCODE_20261008_place_names_built.md) and fixed the CRLF gate (CCODE-688). Aevi applied the two held renames (Painter's Shelf, Weighgate) and the Low Lamp Inn site name in local_layouts. All 64 are on origin. -->
# WORK ORDER: Aevi → CCode · Fewer names that start with "The"

**Aevi (PO) · 2026-10-08.** Erik:

> *"You likely want to run through all the place names and significantly reduce the number of times a name starts
> with 'The'"*

He approved the table below as drafted. 132 place names started with "The"; after this, 68 do. The ones that keep it
are the 17 regions, the 16 poles, and the names that are phrases rather than names (the Last Mask, the Long Grey, the
Sunken Choir and their like). A phrase needs its article. A name doesn't.

## What is on origin (mine)

- **62 location records renamed.** Each one keeps every name it used to have in a new `aliases` array, right after
  `name`. `resolveByName` already reads `aliases`, so a save, a speaker or the GM that says an old name still finds
  the place.
- **`schemas/location.schema.json`:** a new optional `aliases` property (an array of strings).
- **Prose in `content/` and the player-facing docs** (PLAYERS_GUIDE, GREAT_FIGURES, ROSTER, ARCHETYPES,
  SUBSTRATE_ATLAS), where the words themselves change. A name that only loses its article ("the Wend" → "Wend") is
  left alone in running prose: "four days through the Wend" is still right English.
- **Left as they were, on purpose:**
  - history and spec docs (SYSTEM_SPEC, HOW_IT_WORKS, ENGINE_MAP) and all of `po/`, because they record what was said
    at the time;
  - quoted speech anywhere;
  - the ability `proof_halls` ("Proof-Halls") and the rank "Grief-House", which are crafts named after the places,
    not the places;
  - the recipe "The Cleared Ground" in `combination_recipes.json`, which is a different thing from the Scour's gate
    yard.

## The table

| Was | Now | | Was | Now |
|---|---|---|---|---|
| The Anvilhall | Anvilhall | | The Hollowing | Hollowing |
| the Gate Cairn | Cairngate | | The Hundred Markets | Hundred Markets |
| the Lower Court | Choirfoot | | The Kept Shrine | Vigil Shrine |
| The Coral Court | Coral Court | | The Lensward | Lensward |
| The Burnscar | Burnscar | | The Low Lamp Inn | Low Lamp Inn |
| The Deepwood | Deepwood | | The Low Market | Lowmarket |
| The Evenwood | Evenwood | | The Measured Engine | Gaugeworks |
| The Ashwarden March Road | Ashmarch Road | | The Mercy-House | Mercy House |
| The Far Side | Farside | | The Mountain Pass | Farlip Pass |
| The Ent Grove | Entgrove | | The Proof-Halls | Proof Halls |
| The Made Gate | Madegate | | The Quickwood Eaves | Quickwood Eaves |
| The Watershed Road | Watershed Road | | The Quiet Ground | Greypool |
| The Pale March Waygate | Palegate | | The Redline | Redline |
| The Greywater Deep | Greysound | | The Saltmarch | Saltmarch |
| The Greywater Stilts | Greywater | | the Cleared Ground | Clearstone |
| The Leviathan Road | Leviathan Road | | the Waiting Hall | Waiting Hall |
| The Long Delve | Longdelve | | The Slow Stair | Slowstair |
| The Old Switchback | Switchback | | The Spent Yard | Spentyard |
| The Silverbough | Silverbough | | the Plain Yard | Plainyard |
| The Appetite-Halls | Appetite Halls | | The Wayhouse | Wayhouse |
| the Premise Yard | Premise Yard | | The Weighing Yard | Weighing Yard |
| The Axis Gate | Axis Gate | | The Wend | Wend |
| The Blocklands | Blocklands | | The Worn Yard | Wornyard |
| The Churn Edge | Churnedge | | The Tidewrought | Tidewrought |
| The Clearing Ground | Clearground | | the Tide Steps | Tide Steps |
| The Cogitarium | Cogitarium | | The Gearlands Verge | Gearlands Verge |
| the Hub Yard | Hub Yard | | The Greenward | Greenward |
| The Figure-Works | Figureworks | | The Grief-House | Grief House |
| The Fitting House | Fitting House | | The Grindstone | Grindstone |
| the Unfinished Yard | Scaffold Yard | | the Glass Porch | Glass Porch |
| The Harborward | Harborward | | The Held Yard | Heldyard |
| **the Weighed Arch** | **Weighgate** | | **The Painter's Shelf** | **Painter's Shelf** |

"Greywater" was already what most of the world called the stilt town, so the town takes it and the grey sea under the
Palelands becomes Greysound.
## What I need from you

**N1 · Two renames wait on test literals.** `how_it_works` §256 reads "The Painter's Shelf" exactly (five checks)
and §383 reads "the Weighed Arch" exactly (three). Both are in the approved table and both are held back, so the
ratchet stays where it was. Re-point those checks at the record's `name` (or at the new spellings) and tell me. I'll
apply the two the same way as the rest.

**N2 · The engine writes old names onto saves.** These hard-code a name that is now an alias:
- `reconcile.js:2739` sets `name: "The Pale March Waygate"` on the save's waygate. **This one overrides the rename on
  every save it touches,** so it matters most.
- `reconcile.js:2614` names the holding "The Made Gate". Lines 2616, 2630 and 2682 say "the Made Gate" in notes the
  player reads.
- `reconcile.js:3004–3005` say "the Ent Grove" in a note the player reads.
- `app.js:14324` and `14326` default a made gate's name to "The Made Gate".

**N3 · Places the saves carry their own copy of.** The `gen-*` places came out of play, and a save may hold its own
record with the old name. If the place header reads the save's copy, the rename never shows. A reconcile step should
carry the content name onto the save's copy and put the old one in the copy's `aliases`. That's the same rule as the
records: nothing is lost, and the new name is the one shown.

**N4 · Check that nothing matches places by name.** Everything I can find matches by id or only mentions the old name
in comments. These are the files where an old name appears outside a comment, so they're the ones worth a look:
`caravan.js`, `gatehold.js`, `generate.js` (the Deepwood), `localdetail.mjs`, `localmap.js`, `localground.js`,
`worldglobe.js`, `journey.js`, `places.js`, `names.js`, `random_encounters.js`, `intent.js`, `travelers.js`,
`mapholds.js`, `worldtime.js`, `cityplan.js`, `field.js`, `films.js`, `home.js`, `waygate.js`. Every suite but those
two literals passes on the renamed tree.

## Found on the way: a test that fails on a CRLF checkout

`smoke` "ground G4: `own` draws AT THE PLACE'S OWN MARK" reads `engine/localmap.js` with a regex that has a literal
`\n` between the two `paintGroundMark` loops. Erik's machine checks out with `core.autocrlf=true`, so the file has
`\r\n` and the check fails there on origin as it stands. It passes on yours and on CI. Please make it `\r?\n`.

Until then I re-checked out `engine/localmap.js` with LF in my own worktree, which gives the same bytes as origin. I
didn't touch the test or the hook, and the ratchet ran in full.

— Aevi, PO