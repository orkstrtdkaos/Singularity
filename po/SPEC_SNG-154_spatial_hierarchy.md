# SNG-154 — The world has a shape: containment, distance, and direction

| | |
|---|---|
| **Status** | `ROUND 1 — awaiting CCode ROUND 2` |
| **Author** | Aevi (PO) · 2026-07-18 |
| **Report** | Erik, with the map: *"It placed the Low Lamp Inn on the other side of the map when it's actually a location WITHIN the Edge District. It says the Switchback contains the back booth that's IN the Low Lamp Inn!! We need to fix the map structure."* |
| **Direction** | Three tiers — **World** (tradition centers, world-level sites, waygates) → **Region** (settlements, points of interest — most of today's map) → **Location interior** (the sub-places within Millbrook, the Edge District, the Inn). *"Everything needs to know how far it is from the center of everything else, and what direction… that way the geography is consistent and travel times actually make sense,"* with long trips offering **routes** — alternate stops and challenges. |
| **Scope** | Large. Almost certainly a batch, not one build. Sequencing proposed in §6. |

---

## §0 · PRE-WORK SCOPE VERIFICATION (Law 11)

Measured at HEAD `05872f2`, against Erik's live save (`char-mrhs8286`, Silas Weir).

**There are two parallel place systems and neither knows the other exists.**

| | **Locations** | **Sub-places** |
|---|---|---|
| Where | `content/packs/*/locations/*.json` | `character.placeMemory[locId].subPlaces` |
| Identity | first-class `id`, manifest-listed | a slug derived from a display name |
| Position | `map:{x,y}` — **one flat global plane** | **none** |
| Belonging | `regionId` + `connections` | **implicit: whatever `locationId` was passed in** |
| Cap | — | 12 per location, name ≤ 40 chars |

**There is no `parentId` anywhere in the codebase.** Containment is not modelled. It is inferred, per write, from wherever the engine last believed the character was standing.

### The reported bugs, traced

**1 · The Low Lamp Inn is in two tiers at once.** It exists as a sub-place under `radiant_plateau_edge` — the Edge District, *correct* — **and** as its own top-level `placeMemory` key carrying 7 sub-places of its own. It was promoted from sub-place to location by a `moveTo`, and **promotion does not carry a parent**. With no `map:{x,y}` and no positioned neighbour in `connections`, `autoMapPositions` (`worldmap.js:20`) fell through both passes to its last resort:

```js
// anything still unplaced (no positioned neighbour): a deterministic hash grid
out[l.id] = { x: margin + (h % (width - 2*margin)), y: margin + (…) };
```

**The Inn's map position is a hash of its id.** It is not on the other side of the map because of a layout bug; it was never given a place to be.

**2 · The booth is filed under the wrong building.** `back-corner-booth` sits under `old_switchback`. `applyPlaceUpdates(character, locationId, …)` attaches every sub-place to the **current** `locationId` with no check that it belongs there. The GM narrated movement inside a scene without emitting `moveTo`, so everything named landed under a stale parent.

**3 · The same fault, at scale, already in the save.** Under `the-low-lamp-inn`: `cooperage-lane-east-district`, `cooperage-rear-service-passage-cut-lan`, `cooperage-barrel-yard-and-cut-lane-gate`, `cut-lane-south-exit-cooperage`. **The cooperage is a different building.** Under `millbrook`: `upper-meadow` and `upper-meadow-north-of-millbrook-`; `pell-s-forge` and `pell-s-forge-interior`. Under the Inn: `bath-trough-room` and `bath-trough-room-low-lamp-inn`.

**4 · Truncation is manufacturing duplicate places.** `cooperage-rear-service-passage-cut-lan` — severed at 40 by `places.js:26`, `String(u.subPlace.name || u.subPlace).slice(0, 40)`. The **slug is derived from the truncated name**, so the same place recorded twice under slightly different phrasings becomes two records that can never match. **SNG-152 is not only a display defect; it is corrupting identifiers.** Fixing that is a prerequisite here, not a parallel nicety.

### Distance and direction

**No distance model exists.** `map:{x,y}` is a render coordinate on an 800×440 canvas, unrelated to world scale. Nothing derives distance, direction, or travel time from it — travel is narrated by the GM and `moveTo` teleports state. `timeOps` are the GM's estimate, unanchored to geography. So *"travel times actually make sense"* is not a tuning problem; **the quantity does not exist yet.**

---

## §1 · The model — one place graph, four tiers, positions relative to a parent

A single place record type at every scale, distinguished by `tier` and joined by `parentId`:

```
WORLD      the world             parentId: null
REGION     The Valley of Echoes  parentId: world      ← 25 declared today
LOCATION   Millbrook · the Edge District · The Old Switchback
                                 parentId: region     ← 92 today
INTERIOR   The Low Lamp Inn · Back Corner Booth · Pell's Forge
                                 parentId: location or interior (nests)
```

**The load-bearing change: a place's position is `{ parentId, bearing, distance }` — an offset from its parent — never a global `x, y`.**

That single change fixes the reported bugs structurally rather than by correction:

- The Low Lamp Inn **cannot** land across the map, because its coordinate is expressed relative to the Edge District. Rendering resolves the chain; there is no global plane to be lost on.
- Promotion from interior to location **preserves `parentId` by construction** — the field is required, so there is nowhere for the parent to go.
- Distance between any two places = walk both to their **lowest common ancestor** and compose the offsets. Direction falls out of the same walk. **Consistent by construction, not by authoring discipline.**
- Travel time = distance ÷ mode rate. `timeOps` become *derived and checkable* instead of guessed.

**Nesting is required, not optional.** Erik's own example is four deep: Millbrook → the Edge District → the Low Lamp Inn → the Back Corner Booth. A fixed three-level scheme cannot hold it.

### Containment must be validated on write

`applyPlaceUpdates` currently trusts the caller's `locationId`. It must instead require the GM to **name the parent** for any sub-place, and reject a sub-place whose named parent is not the current place or one of its ancestors/children. When the GM names a place it isn't standing in, that is a `moveTo` it failed to emit — the existing SNG-122/123 machinery — not a new containment.

---

## §2 · The three maps

Same graph, three viewports. Each renders one tier and its children.

- **WORLD** — regions as territories, tradition centers, world-level sites, and **waygates** (SNG-148; `travel`'s canon exemplars already name Waygate). The scale at which "which Reach am I in" is the question.
- **REGION** — settlements and points of interest. Most of today's map, correctly scoped. `regionShape`/`convexHull` (`worldmap.js:85,100`) already draw territories and are reusable.
- **LOCATION** — the interior. Millbrook showing the Edge District showing the Inn showing the booth. **This tier does not exist today** and is where every reported bug lives.

Zoom is navigation between tiers, not a scale slider.

---

## §3 · Routes

Once distance and direction are real, a long trip is a **path through the graph**, not a teleport:

- enumerate 2–3 viable routes between origin and destination
- each names its intermediate stops, its time cost, and its character — the fast exposed road, the slow safe one, the one through a place with something on it
- the challenges along a route come from the places it passes, which already carry `dangerLevel`, `encounterFlavor`, and `questSeeds`
- **a route is a `departure`-class act** and therefore hits SNG-145's intent gate: the player sees the time cost and confirms before committing

---

## §4 · Migration — the save already has scrambled data

Erik has a live character. Roughly 30 sub-places across 4 locations, with wrong parents, duplicate pairs, and at least one truncated slug.

- **Re-parenting is a reconcile step**, in the existing `CHARACTER_STEPS` registry (`reconcile.js:26`) — versioned, idempotent, player-facing note. That machinery is built and is the right home.
- **Duplicate collapse should reuse SNG-153's adjudicator**, not invent a second one. `upper-meadow` / `upper-meadow-north-of-millbrook-` is the same judgement call as the codex merges, one tier over.
- **Truncated slugs cannot be repaired** — the tail was never stored. They can be merged into their twin; they cannot be restored. Same honesty as SNG-152.
- **Nothing is deleted.** A sub-place whose parent cannot be determined is attached to its current parent and flagged, never dropped.

---

## §5 · Questions for CCode — ROUND 2

1. **Is `{parentId, bearing, distance}` viable, or does render need cached absolutes?** Resolving a chain per place per frame may be too slow; a derived-and-cached global coordinate may be the practical form. **This is the load-bearing unknown for the batch.**
2. **What promotes an interior to a location today?** The Low Lamp Inn crossed tiers somehow; I have the effect, not the code path.
3. **Scale.** What unit is `distance` — and does `worldtime.js`'s ratio already imply a world scale to anchor it to?
4. **The 92 authored locations carry `map:{x,y}`.** Are those coordinates meaningful geography to convert to offsets, or layout hints to discard?
5. **The 12-sub-place cap.** Millbrook is already at 12. A real interior tier likely needs a different bound — or the cap is doing load-bearing work I should not remove.
6. **Sequencing.** Proposed in §6; contest it.

---

## §6 · Proposed sequencing

This is a batch. Ordered so each stage is verifiable alone and nothing builds on unfixed ground:

1. **SNG-152 first** (already specced) — truncation corrupts slugs, so identity is unreliable until it lands.
2. **`parentId` on every place, required, with promotion preserving it.** Retires the reported bugs. No maps yet.
3. **Containment validation on write** — stops new scrambling.
4. **Reconcile step** — repair the existing save.
5. **Relative positioning + distance/direction.**
6. **The three viewports.**
7. **Routes**, on SNG-145's departure gate.

Stage 2 alone fixes what Erik reported. Everything after it is the structure that keeps it fixed.

---

*— Aevi (PO), ROUND 1. Traced against Erik's live save. Both reported bugs are one root: containment is inferred per-write from the engine's belief about where the character is standing, and nothing in the data model records where anything actually is.*
