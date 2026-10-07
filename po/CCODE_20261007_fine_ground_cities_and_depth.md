<!-- status: FOR AEVI AND ERIK. Ruling 2, SNG-678 L4 and L5 are in (CCODE-645). Next: the diagrams' retirement with the parity list, then SNG-682 and SNG-679. -->
# CCode → Aevi, Erik · the fine ground under a close shot, cities on the local tier, and depth

**CCode · 2026-10-07 · CCODE-645**

## Ruling 2 · one sampler for the film and the map

*"Hoist `makeFinePatch` so the film and the map share one sampler."* They do: a close shot — `place`, `region`,
`figure` — reaches the region map's own `_fineGenShared`, `makeFinePatch` and `colorAt` with `fine`, and bakes
the result once per place into a square window (`fineWindowBox`, pure: 0.7 × the span either side, the longitude
half widened by 1/cos(lat), clamped short of the poles; 220 texels a side, 0.057° at 9°, thirteen times the
bake's cell). The raster reads the window bilinearly where it covers, feathered over its outer tenth so it meets
the bake without a square edge, on the Exesa ground.

Two things I chose, both stated in the gates: the window is **filled a band of rows a frame** (the patch ~120 ms,
the 220² of `colorAt` another ~150 ms — a quarter-second freeze at a cut reads as a slide), and the bake draws
until it is `ready`, about six frames; and it is **sized to the shot's final span**, not to the close-in — sized
to 35° it would be coarser across the final 9° frame than the frame needs, so the centre is sharp from the first
frame and the periphery comes from the bake until the close-in brings the window to the edges. A patch that is
not `worthIt` leaves the bake in place. *Not yet measured at the seam on a real shot*: if a square shows at the
window's edge, the feather is one number.

## L4 · cities use the city

A city is already the planner's frame: `cityPlan` lays a city out from a distance-from-the-hall and a bearing,
which is exactly what a local layout writes for every site. So L4 is a mapping (`cityPlacesOf`, pure — the site
at the centre is the hall, the roads out are the avenues) and the **one** city painter the region tier uses
(`paintCityPlan`, lifted out of `paintCrossingCity`) draws the wall, the fabric, the gates and the quarters on
the place's own ground. The ring of poles and the rim names stay the region's. `the_crossing` and every `city`
kind take it; the gate drives the Crossing's authored sites through the planner and finds every one inside the
wall. Looked at in the browser: seven sites inside the wall, twenty roads out, the quarters beyond the gates.

The Crossing's own landmarks (the coliseum, the markets, the Axis Gate, the Quiet House) keep their drawn
forms where the ids match; an authored site with no form of its own is a plaza. If you want forms for the
Stillhold's or Harmonic Heights' sites, that is `paintLandmarks`'s switch — one case per id.

## L5 · depth

*"Interiors need a vertical axis."* `siteLevel` reads an authored `localMap.level` or a grown place's
`worldPos.depth` read down (the two fields mean the same thing in opposite signs, and the flip lives in one
reader). A place with levels shows a **level switch** — surface, −1 · one level down, −2, −4 — and draws that
level's sites on its own ground, laid out like L1. Below ground there is no field and no river: the level is cut
into a hollow with rock beyond it and has no roads out, because a delve's ways out are its stairs.

*"The shafts and stairs that join two levels show on both"* has no authored field, so the join is the **name**
(stair, shaft, ladder, lift, hatch…) or the **kind** (an underplace below ground is the way into the level
below); a join draws on its own level and on the one above it, with a small arrow for the way down. Stated,
gated, and ready to be replaced by a `joins` field the day you author one.

The Service Ways runs surface, −1, −2, −4 in the browser; the Cogitarium's hall at 0 and its third terrace at
+3 are two levels of one footprint, as you authored them. **The ring is no longer the interiors' tier** — no
place is an interior the canvas cannot draw — and `renderMapLocationRing` goes with the diagrams and their
parity list, which is next.

## Measured

Gates 680/R2 (the box driven, the shared sampler, the banded fill, the feathered read, the close shots), 678/L4
(the Crossing through the planner, one painter), 678/L5 (the Service Ways' levels, `siteLevel`'s two fields, one
level at a time with the way down, the hollow below ground, the switch). Smoke green; no console error on the
city tier, the level switch or the Foothills film.

— CCode
