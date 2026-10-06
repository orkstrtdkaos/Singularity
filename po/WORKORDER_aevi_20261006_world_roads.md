<!-- status: OPEN for CCode. Measured on origin (v2.21.1) and seen in the browser. Content half: the names ruling, on origin with this order. -->
# WORK ORDER: Aevi → CCode · The world map's roads, still and moving (SNG-682)

**Aevi (PO) · 2026-10-06.** Erik:

> *"I noticed the roads aren't working quite right in the world view, plus the old lines for the world show up
> when panning or spinning the world."*

I reproduced both in the browser on Silas Weir's save, and measured the roads with
`po/tools/measure_world_roads.mjs` (on origin). Run it before and after.

## What is happening

**1 · While you drag, every road becomes its straight arc.** This is the "old lines". `app.js` 16763:

```js
const net = networkPaths(_terrain, view, { …, bend: coarse ? null : globeBend });
```

On a coarse frame (any drag or spin) no bend is offered, so `networkPaths` draws all 200 roads as great-circle
arcs. Those are long straight chords running across the seas, and the frame shows them until the globe settles. Held
mid-drag, the screen is full of them; let go, and the routed roads come back.

**2 · The world grid is too coarse for the short roads.** `worldRoadRoutes` routes on a 360×180 grid with `cell: 2`,
which is about 2° per step. The measurements:

| | |
|---|---|
| roads | **200**. 162 are routed, **38 fall back to the straight arc**, and 3 are seam-dropped |
| routed: walked ÷ straight | median **1.37**, p90 **2.34**, and **25 roads over 2×** |
| the valley's own main road | **Millbrook → Echo River Crossing is 0.54° straight and walked ×3.88.** This is the road a new player sees first |
| unrouted, short | most of the 38 are under 1° (the Crossing's districts, Millbrook's neighbours), and they draw as straight stubs |

A road a few cells long can't be routed honestly on that grid. It either fails or zigzags to the next cell centre.

**3 · The inhabited world sits around a pole, and the grid is plate carrée.** The Crossing is at latitude −90.
Almost everyone lives within about 50° of it, and the far poles of the dispositions stand around the equator. On a
lon/lat grid, the cap around the Crossing is where cells collapse:

- **40 of the 162 routed roads** have an end within 10° of the Crossing;
- **the Crossing → Thinwater** walks ×3.22;
- **the Axis Gate's** roads walk ×2.5 to ×3.05.

The region maps already solved this. `makeGroundCost` has the polar disc ("C2 — a polar region's lon/lat box is a
fabrication"), and the world router doesn't use it. This is the pole artifact again, in the router this time.

**4 · Four long straight arcs run over open sea.**
- the Numen ↔ Thinwater: 45°, **70% wet**;
- Kindlerow ↔ the Blaze: 59°, **63% wet**;
- the Harborward ↔ the Unlit Deep: 62% wet;
- the passage below the Unlit Deep ↔ the Unlit Deep: 100% wet.

All four are unrouted, so they draw as straight lines across the water.

**5 · Roads to places under the ground are drawn on the surface.** The last two in §4 join places with
`worldPos.depth` −5. The Great Engine (−3), the Maw (−3), the Underlight (−3), the Leaden Deep (−4) and the Service
Ways (−4) also have surface roads drawn to them, over whatever is above.

## What to build

- **W1 · Moving frames draw the cached routes.** On a coarse frame, pass a bend that returns **only what is
  already cached**: `_worldRoutes.byPair` and `_bendFor`. It never calls `bendRoad`. Projecting a cached path is
  the same cost as projecting the arc. A road with nothing cached is **not drawn while moving**, rather than drawn
  straight. Nothing that looks different from the settled frame may appear during a drag.
- **W2 · Short roads come from the region maps.** Erik's original ask was *"show the drawn roads from the region
  maps (at least the major trunks)"*.
  - A road whose two ends share a region, or which spans fewer than ~4 world cells, takes its path from that region's
    routed roads (`_roadsByTerrain`, already computed at region scale), converted to lat/lon.
  - The world grid routes only the long inter-region trunks.
  - **Gate:** Millbrook → Echo River Crossing walks under ×1.6 on the world map, and no road under 1° is drawn as a
    straight stub when its region map has a route for it.
- **W3 · Route the cap on a polar grid.**
  - Every road with both ends within ~60° of the Crossing goes on an azimuthal (polar) grid centred on the
    Crossing, using `makeGroundCost`'s polar disc.
  - Roads out toward the equator poles stay on the lon/lat grid, which is sound there.
  - The seam guard stays, and a polar grid has no seam to guard in the cap.
  - **Gate:** no road with an end within 10° of the Crossing walks over ×2 unless the ground forces it. Report the
    measured median and p90 before and after.
- **W4 · A crossing over water is drawn as a sea way, not a road.**
  - Some roads still can't be routed over land once W3 is in. If such a road is more than 20% wet, draw it as a
    **sea lane**: dotted, in the hydrology palette, only where both ends are coastal.
  - If an end isn't coastal, don't draw it at world scale at all.
  - A straight line across the sea that claims to be a road is the one thing this map must not draw.
- **W5 · Under-ground roads are drawn as under-ground.**
  - If either end has `depth < 0`, the road is dashed in the buried style the precursor lines already use.
  - It is shown only from the region tier down, or on `land` and `lattice` layers if you prefer.
  - It never draws as a surface road over the sea or the land above it.

## Gates

- `measure_world_roads.mjs` runs in CI, with these ratchets:
  - unrouted roads drawn as straight lines: **0**;
  - routed roads over ×2: down from **25**, may only fall;
  - wet straight arcs: **0**.
- A coarse frame and a settled frame draw the same set of road paths, apart from roads still waiting for a cached
  route. Test the projection, not the pixels.

## And a ruling that changes CCODE-633 §3

Erik, today: the names in the world guide and the player's guide **are public**. I've set `nameKnown: "world"` on
the fifteen records the guides name. That includes Akinetos, Kenosis, Parakletos, the Hollow King of the Wild Half,
the Starless One, the Still Lattice, the Thornmother, the Choirmaster Who Would Not Return, the Bright Bargain, the
Keeper of Small Debts, the Slow Green, Ysenkar, Tolvess, Aelith of the First Shape and the Old Stag. Each record
keeps its old value in `_nameKnownWas_20261006`.

- **What stays sealed is what stands behind a name, not the name.** "The Hollow King" is public. That he is the
  power the Long Petition feeds is not.
- So the title seal should **subtract every name a public record carries**, along with its court, from the sealed
  set. Istvane's "Speaker of the Hollow Court" then shows.
- `onceNamed` keeps gating the arc's *line*, the one that connects the name to the arc, exactly as it does now.

— Aevi, PO
