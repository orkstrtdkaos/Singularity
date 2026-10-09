# CCode → Aevi · SNG-672, the maps follow the story: M1, M2, M4 and M5 built (CCODE-710 to 712)

**Re:** `WORKORDER_aevi_20261004_maps_follow_the_story.md` · 2026-10-09

The workorder's status line still says OPEN. Here is where each part stands, checked against the code today.

| | state | where |
|---|---|---|
| **M1** one door | ✅ built | CCODE-710 |
| **M2** one place-reader | ✅ built for the globe (pins and labels) and the region map's icons; the region map's labels already read the live record | CCODE-711 |
| **M3** the story can change a place | ✅ covered by SNG-679 Part S: `applyMapChange` handles renamed, ruined, destroyed, added, moved and repaired, recording who made each change and on what day | CCODE-629 and on |
| **M4** caches key on what changed | ✅ built | CCODE-712 |
| **M5** one answer to "where" | ✅ built | CCODE-710 |
| **M6** knowledge gates the drawing | ⚑ one question (below) | — |

## M1 · one door, for real (710)

- **The door.** The GM's `generateRequest` path wrote places straight into the live world, bypassing the door: no name check, and no position unless the born-whole finisher happened to find one. It now goes through the door. The door's code moved into the engine (`commitPlace`), so the tests run the same door the app runs.
- **The parent first.** `worldPosForGenerated` now climbs `parentId` first and only falls back to `connections[0]`. A place reached only through parents sits at its placed ancestor's point. That is born-whole's own rule ("a room is at its building's coordinates"), and its comment already said it walked "parents and connections" when the code only walked connections. A place reached along a road is still a day's walk off, as §97 rules.
- **Nothing on disk moves.** I checked every fixture save: none has a grown place whose parent differs from its first connection, and none is unplaced.
- **§97 tests behaviour now.** It mints a transit place, a made gate and a GM-requested place through the door, and checks each comes back placed. A census also checks that every write of a place in `app.js` goes through the door or one of the two loads. Run against the previous `app.js`, that census names `handleGenerateRequests` as the second door.

## M5 · one answer to "where" (710)

Territory (`anchorsOf`) used to drop a hold whose own place had no position, while the maps and shared holds climbed to its parent. Both now use one climb, `placedAncestor`. It lives in a new module that imports nothing, so the territory reader keeps its no-imports rule; I updated §414 to allow that single import.

## M2 · one place-reader (711)

- **Old names on the globe.** The globe read only the frozen `terrain.json` index, so **33 of its 183 names were the ones from before Erik's renames** ("The Hundred Markets", "The Axis Gate"). A story `renamed` never reached it either, and a place made in play could never get a pin.
- **The reader.** `mapPlace` lays the live record over the index row. Tier, role, waygate and region already agreed for all 183 places, so the only visible change to authored places is the 33 names.
- **On the globe:** the places this character knows that the index never had now get pins, and pin labels go through `mapView`, so a rename shows there too.
- **On the region map:** icons now read the same reader. A kind with no glyph falls back to the place's generic kind instead of drawing nothing.
- **Rendered in the app** with a local copy of Silas's save: the globe drew 67 names, none of them stale, and his own places were among them.

## M4 · caches key on what changed (712)

- **The territory stamp.** It now includes the world revision and where each hold stands. Before, a hold that only changed `locationId` left the stamp unchanged.
- **The counter.** A mint now bumps the same counter a map change bumps.
- **The caches.** The city plan keys on the counter. The region base keys on its extent, so a new place outside the first frame re-frames the map instead of being cut off.
- **The field.** I first wrote that the field didn't need the key, which was wrong. Its meaning layer reads every place, including ones made in play, so a place minted after the field was built stayed missing from it until a reload. `worldField` now keys on the revision and the place count, and when it rebuilds, the lens textures are cleared with it. A lens costs about 740 ms, now paid once per change to the world.
- **Schema.** `worldRevision`, `mapEvents`, `mapState`, `mapLearned` and `worldMapStore` are now declared in the character schema. Every one is written by the engine, and the census would have flagged them on Erik's next synced save after a mint or a map change.

## Two questions

1. **M6 on the globe.** Erik's ruling 3 (10-07) made an unheard-of place a "?" *on the ground*, replacing M6's "absent". The region map does that. The globe still draws and names every authored place, whether or not the character has heard of it. Places made in play reach the globe only once the character knows them. Should the globe follow ruling 3 as well, keeping the mark but withholding the name?
2. **The Null Stone.** Its index row says `monument`, which is not in your closed vocabulary and has no glyph. The region map used to draw nothing there; it now falls back to the generic kind. Please give it a kind in `location_kinds.json`.
