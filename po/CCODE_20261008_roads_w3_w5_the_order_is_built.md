<!-- status: FOR AEVI. SNG-682 W3, W4 and W5 on origin (CCODE-665/666); the order is built; what each bought, measured; what remains is the ground and three rulings. -->
# CCode → Aevi · the world's roads, W3–W5: the order is built

**CCode · 2026-10-08 · CCODE-665, 666**

## W3 · the cap on a polar grid (CCODE-665)

`capRoadRoutes` routes every road with an end within 60° of the Crossing on an azimuthal grid over `makeGroundCost`'s
polar disc — both ends in the cap on a 60° disc; one end in the cap on a disc wide enough for its far end. That second
case is mine, not the order's: a road with one end at the pole is broken at that end on the lon/lat grid whatever its
far end is (21 such roads, 9 of them over ×2; 2 after). The roads with no end in the cap stay on the lon/lat grid. The
globe routes the cap in idle slices of six roads after the trunks land and the regions follow — nothing waits.

| | before | after W3 |
|---|---|---|
| straight arcs (unrouted) | 22 | **15** |
| wet straight arcs | 4 | **1** — the Numen ↔ Thinwater and Kindlerow ↔ the Blaze found land |
| over ×2, the world grid's | 24 | **4** |
| over ×2 within 10° of the Crossing | 13 | **8** |
| the Crossing → Thinwater | ×3.22 | ×3.09 — 34% of its straight line is sea; the ground forces the rest |
| cap roads on the polar grid | — | 97 of 109 |

Your W3 gate (*no road with an end within 10° of the Crossing walks over ×2 unless the ground forces it*) is pending at
8 and ratcheted; the remaining eight are the Axis Gate's roads to the gate yards (×2.5–3.0), which the ground forces
the same way the Crossing → Thinwater is forced. Each path is now named by the map it came from — the grid's, the
cap's, the region's — so your "over ×2, down from 25" stays the grid's own number.

## W4 and W5 · sea lanes and buried roads (CCODE-666)

`roadKinds` names every connected pair once, from the ground and its ends: `road`, `sea` (an unrouted crossing more
than 20% wet between two coastal ends — dotted, in the hydrology blue), `hidden` (such a crossing with an end inland —
not drawn at world scale at all), `buried` (an end under the ground — dashed in the precursor violet, on the land and
lattice layers only, never a surface road over the sea or the land above it). `networkPaths` tags each run and leaves
a hidden road out; the painter draws each kind as what it is; the measurement reads the same kinds, so a straight arc
is counted only when it is a ROAD drawn straight.

Measured on origin, over the road network's 234 roads:

| | after W3 | after W4/W5 |
|---|---|---|
| straight arcs drawn as roads | 15 | **12** — the three that were buried ends are dashed under-ground now |
| wet straight arcs | 1 | **0** — your target, met; the check is hard from today |
| sea lanes | — | **0** — every crossing over 20% wet found land on the polar grid |
| not drawn at world scale | — | 0 |
| buried roads (an end under the ground) | — | **50**, dashed on the land and lattice layers, absent on topo |

So the one thing the map must not draw — a straight line across the sea that claims to be a road — it no longer draws:
the four you listed are routed over land (the Numen ↔ Thinwater, Kindlerow ↔ the Blaze), or under the ground (the
Harborward ↔ the Unlit Deep, the passage below it). The sea-lane style exists and waits for the first crossing that
needs it.

## What remains, and whose it is

1. **The region router's detours** (your first W2 gate): Millbrook → the Crossing walks ×3.3 as the region's own road,
   round the Echo. Three ways, in the last reply; I lean to the crossing's end entering the water.
2. **The straight arcs left** are gate-yard stubs — a place and its own gate yard, 0.04° to 0.16° apart, shorter than
   any grid's cell, a dot at world scale (the Axis Gate → the Crossing's yard, Cloudform → its yard, the Lensward → its
   yard) — and Leviathan Road → the Blaze at 4.3°. A stub that short is honestly straight; if you would rather they not
   draw at world scale at all, it is one length. Separately, `networkPaths` draws the 28 `connections` edges the road
   network FOLDS (a triangle's third side, SNG-422) as arcs with no route to look up: a ruling — draw a folded edge as
   the legs it folds onto, or not at all. I'd draw nothing.
4. **Two long roads the ground forces round the sea** now route over land at ×4.37 (the Numen ↔ Thinwater) and ×3.53
   (Kindlerow ↔ the Blaze) — no longer straight lines across the water, but a long way round. If a sea lane would be
   the truer picture for those two, say so: `roadKinds` already knows which ends are coastal.
3. **Buried roads on the topo layer:** your order says land and lattice; on topo they are not drawn. If you would rather
   see them everywhere, it is one condition.

— CCode
