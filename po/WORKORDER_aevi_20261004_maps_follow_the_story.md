<!-- status: OPEN for CCode. Erik 2026-10-04: "let's make sure that the story and generating new locations can update the maps." Audited read-only against 19aba2be5; every gap below has its file:line. -->
# WORKORDER: Aevi → CCode · the maps follow the story (SNG-672)

**Aevi (PO) · 2026-10-04.** Erik:

> *"Also, let's make sure that the story and generating new locations can update the maps."*

The maps you built in B2–B5 read the live world for **powers**. CCODE-601's R4.1 stamp covers contingents, holds
taken and lost, broken powers, held gates and standing, and those already redraw. **Places** are the half that does
not follow. A place made in play gets onto the regional map **as a name with no icon**, never reaches the globe, and
reaches territory only when it happens to have a `worldPos`. On the most-used mint path, it doesn't.

## What I measured (read-only, at 19aba2be5)

| | where | what happens |
|---|---|---|
| **A** | app.js:5828 (`handleGenerateRequests` → `CONTENT.locations[rec.id] = rec`) | The GM's `generateRequest` path **never sets `worldPos`**. It sets `parentId`, `regionId` and the legacy 2D `rec.map`, but it does not go through `commitGeneratedLocation` (app.js:11754), which is the door that derives the position. Reconcile v37 (reconcile.js:2318) backfills **once per save**, so any place minted after that step stays unplaced. §97 (how_it_works.mjs:10308) says "one door" but checks the source text, so it misses this second door. |
| **B** | app.js:13485 | Regional icons come from `_terrain.locations[m.id] \|\| {}`, the frozen index, not the live record. A minted place has no row there, `glyphFor({k: undefined})` returns null, and nothing is drawn. **A label floating over empty ground.** |
| **C** | worldglobe.js:1425 (`visiblePins`), called at app.js:14101 | Globe and world pins iterate the **frozen `terrain.json` index only**. A place minted on a save can never appear there: 0 pins, verified with a synthetic place. The globe label also uses the frozen name `m.n` (:1434), so a rename shows on the regional map and not on the globe. |
| **D** | worldmap.js:442–458 (`worldPosForGenerated`) | Derives from `connections[0]`, not `parentId`. A site's parent is where it **is**; its first connection is only where a road goes. |
| **E** | influence.js:114 (`anchorsOf`) vs sharedholds.js:30 | Territory silently drops a hold whose place has no `worldPos`, while sharedholds climbs `parentId` through `positionedPlace`. Two readers of one question, giving two answers. A hold founded at a fresh minted place counts in one and not the other. |
| **F** | app.js:2923 · :13078 · :12989 · :12420 | Caches outlive a mid-session change. The field is built once (`worldField`). `_fieldTex` is keyed on extent and lens only. `_regionBases` is keyed by region only, so a new place outside the original frame is culled at :13455. Regional roads are keyed on **place count**, so a new road between two existing places waits for a reload. A hold that only changes `locationId` doesn't move `stateStamp` (realms.js:253). |
| **G** | places.js:64–124, quests.js:788 | **The story has no structured way to change a place.** Destroyed, ruined, renamed, opened or revealed all go to free-text `placeMemory` and flags, and no map reads them. |

## The work

**M1 · One door, for real.** Route the `generateRequest` location branch (app.js:5828) through
`commitGeneratedLocation`, so every mint derives a position at the write. In `worldPosForGenerated`, prefer
`parentId` and fall back to `connections[0]`. Rewrite §97 as **behaviour**: mint through every path the app has
(transit, waygate, `generateRequest`) and assert each record comes back with a `worldPos`. A future fourth path
then fails the test instead of passing on the source text.

**M2 · One place-reader for every map.** A single `mapPlaces(content, terrain, save)` that merges the frozen
index with the live records, **live wins** for name, kind, worldPos and state. Globe pins (worldglobe.js:1425),
regional icons (app.js:13485), labels and world pins all read it. A minted place's **kind** comes from its own
record (`kind`, else its tier and tags through the `location_kinds` rules). If neither yields one, it gets a
generic glyph. ⛔ A place with no icon is a place nobody sees; `null` is never the answer.

**M3 · The story can change a place.** A structured overlay on the save, `character.placeState[id]`, and a GM
request to write it, the same shape the GM already uses to mint (`generateRequest`). The changes the story needs:

| change | what the maps do |
|---|---|
| `renamed` | new name on every surface, old one kept as an alias so the player's speech still resolves |
| `ruined` / `destroyed` | ruined glyph; it stops being a territory anchor and a road end |
| `founded` | covered by M1 (a hold the player founds is a mint plus a holding) |
| `road opened` / `road closed` | a connection added to or removed from the live graph; roads redraw |
| `revealed` | see the question for Erik below; build the field now and leave it unread until he rules |

The record keeps **who changed it and in which beat**, the way contingents already do, so a change can be
explained when the player asks.

**M4 · Everything that caches keys on a world revision.** One counter, bumped by any mint, any `placeState`
write and any holding change (including a moved `locationId`). The field, `_fieldTex`, `_regionBases` (re-frame
when a place falls outside), roads and the territory key all include it. Nothing waits for a reload.

**M5 · One answer to "where is this place".** `anchorsOf` uses the same `positionedPlace` climb as
sharedholds, so territory and shared holds agree about a hold founded at a minted site.

## Gates (behaviour, on in-memory copies; do not mutate a live content file to prove one can fail)

1. A place minted through each path has a `worldPos`, a glyph on the regional map, a pin on the globe, and joins
   the road graph when connected.
2. A hold founded at a freshly minted place moves territory, and the realm lens and sharedholds agree.
3. `renamed` shows on the regional map **and** the globe; the old name still resolves as an alias.
4. `ruined` changes the glyph and drops the place as an anchor.
5. Mint, then redraw **without reloading**: the new place, its road and the territory change are all there.
6. Negative: the frozen index alone (live overlay ignored) fails gates 1 and 3. That is the proof each gate reads
   the live record.

## For Erik (one question, not blocking M1–M5)

**Should the maps show only places the character knows?** Today the canvas maps show every authored place from
the first minute, and only the older diagram view (app.js:14439) checks `isPlaceKnown`. If the story is to
**reveal** places, the map has to start without them. My lean is yes, with three layers: places you have been,
places you have heard of (drawn faint) and places nobody told you (not drawn). Regions and the great powers'
borders stay visible regardless, because everyone knows roughly where the Blaze is. It is a big change to how
the map feels, so it is your ruling.

— Aevi, PO
