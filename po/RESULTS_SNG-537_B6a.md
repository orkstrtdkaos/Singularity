# RESULTS — SNG-537 §4 B6a: a place moves off the seats or is minted at authored coordinates, with no terrain regeneration

**CCode → Aevi (PO) · 2026-09-12 · measured, gated as `§183`, v1.9.462**

## §1 — YOUR ROUND 2 QUESTION FIRST, BECAUSE IT DECIDES THE REST

*"Does anything downstream cache a location's coordinates — the region field vote, `substrate_atlas`, a save's travel state, the map
tiers? `fields.voters` is a flat authored array and I do not know whether it is derived at load or stored."*

**Stored — for the seats, and only the seats.** `scripts/world/generate_world.mjs` builds `fields.voters` from `canon.seeds` (the 120
region seats: id, region, name, lat, lon) and serialises them into `terrain.json`; `worldglobe.js` evaluates the region vote over that
shipped list. Nothing else stores a coordinate:

| reader | how it gets the position |
|---|---|
| travel (`walkingDays`), the nearest waygate, the journey planner, presence, the nearest-place resolver in `state.js` | reads `worldPos` off the location record at call time |
| the substrate field | resolved from authored sources at load; a location's position is looked up when asked |
| a save | caches only *generated* places, and only those that had no position (`reconcile.js` stamps one from the first connection, once) |
| the map tiers | draw from `CONTENT.locations` each render |
| **the region vote** | **the seats' positions, inside the asset** |

So your §3 conclusion is exactly right and already enforced: **moving a seat is a rebuild by another name**, and `content_ci`'s
`SNG-391: genparams seeds are the canon derivation — a moved worldPos without a rebuild fails here` is the gate that says so. §183
proves it in both directions on copies: Longshore's seat moved 0.5° trips the gate; a non-seat place moved 3° trips nothing and its
travel times change as they should. **O1's hidden cost is real for seats and nothing else. §3(a) for Longshore stands.**

## §2 — THE EVIDENCE YOUR §4 ASKS FOR

1. **One existing location moved, one new location minted, the geography gates unchanged.** Both are done on copies inside `§183`
   rather than in content, because content is yours: a non-seat authored place (the first in the catalogue with a placed neighbour)
   moved 3° east changes its travel to that neighbour and leaves `verifySeeds(canon)` at zero moved; the shipped terrain is not
   touched, so the five SNG-391 gates read byte-for-byte as they do today — the six river-name gates included, red in exactly the
   same way. A seat moved the same way is caught. **Nothing in the engine had to change for either:** the engine never cached a
   non-seat position, and the seat gate already existed. What changed is that it is now *proven*, on every run.
2. **A place minted at authored coordinates resolves.** `worldPosForGenerated` returns a placed node's own position with
   `derivedFrom: null` — it has never moved a placed node (the comment at `worldmap.js:407` records the day it did). A place minted
   *without* coordinates is still set a day from its parent, so the two paths do not fight. Cross-check from your own numbers: the
   Longshore seat (−54, 68) to the unnamed river mouth at (−38.25, 52.25) computes to **32.0 walking days** from the coordinates
   alone; you measured 32. An existing save loads either kind the way it loads every generated place today.
3. **`scale.json` is consulted, and named.** It had no reader since SNG-424 (FIELD_REFERENCE held it at 9/10 for exactly that). It
   has one now: `milesFor(days, scale)` in `worldmap.js`, and the travel card says *about 32 days (about 499 miles) on foot* — the
   first distance any player has been shown in a unit. `walkingDays` itself stays on canon `300/π` (1° = 5/3 days); the file's
   `walkingDaysPerDegree: 1.67` is that number rounded, and `scaleAgrees` gates the file to canon within 1%, so a travel time can
   never drift in one place and not the other. If you would rather the file carry `1.6667` exactly, it is yours to change and the
   gate will read the same.

## §4 — TWO THINGS FOUND WHILE PROVING IT, AND WHOSE THEY ARE

1. **A true check with a false label (mine, fixed).** content_ci's `SNG-391: genparams seeds are the canon derivation — a moved
   worldPos without a rebuild fails here` does not fail on a moved seat: `verifySeeds` checks only that `genparams.pts` is the authored
   118 — the *land's* size. A moved seat shows by name in `seedDrift`'s census and fails the **determinism** gate (the votes read
   current `worldPos`, so the asset regenerates differently). §183 proves both; the label and the ledger's claim now say what the
   check measures. Your third face of the wall, one more instance: the gate was right and the sentence over it was not.
2. **A canon place stamped exactly on its parent (yours to move or leave).** `gen-ashwarden-march-road` sits at the same `worldPos` as
   `gen-waygate` (colatitude 76, longitude 74) — 0.0 walking days apart — stamped before `worldPosForGenerated` offset a child a day
   from its parent by a hash of its id. §183 happened to pick it as the "non-seat place" and moved it 3° to 4.9 days away on a copy,
   which is also why that check reads *0.0 → 4.9*. It is not a seat; moving it in canon rebuilds nothing.

## §3 — WHAT I DID NOT BUILD, AND WHY

- **No editor for moving a place in play.** The spec's outcome is "movable"; the move is a content edit to `worldPos`, and content_ci
  tells you within a minute whether you moved a seat. A UI for it would be a UI for Erik to move the world by hand, which §3 says he
  ruled out.
- **The river and the port are not minted here.** §3(d): naming is authorship and it is yours; the engine now proves a place with
  your coordinates keeps them. When you author `river-mouth-33` (or whatever it is called) with `worldPos: { colatitude: 128.25,
  longitude: 52.25 }`, it loads, it resolves, and it is 32 days from Longshore.

— CCode
