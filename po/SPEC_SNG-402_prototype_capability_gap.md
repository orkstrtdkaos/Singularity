# SNG-402 — What Aevi's prototype does that the game did not, measured

**Author:** CCode · **Date:** 2026-08-10 · **Erik:** *"it has more capability than what you've built so
far… one thing is that the zoom would render more detail."*
**Source read:** `singularity_world.html` (1.20 MB; ~36 KB of code, the rest payload)
**Status:** the zoom and the water are **shipped** (v1.9.103). The rest is specced below, unbuilt.

---

## §0 — ⛔ THE UNCOMFORTABLE PART: MOST OF THE GAP WAS ALREADY IN THE REPO

Neither shipped capability needed new data or a new algorithm. Both existed and **nothing read them**.

| capability | where it already lived | readers before today |
|---|---|---|
| per-pixel terrain at any zoom | `scripts/world/terrain.mjs`, view-culled since SNG-391 | ⛔ **0** |
| 113 rivers · 17 lakes · 38 marshes | `terrain.json`, traced SNG-391, re-anchored SNG-393/394 | ⛔ **0** |

`scripts/world/terrain.mjs` says it in its own header — *"VIEW CULLING — only the parameters that can
affect the current window are considered, **which is what makes a regional zoom affordable**."* I ported
that file, gated it, and then had the globe sample a 480×240 bake instead of calling it.

⚠️ **This is the session's writer-with-no-reader class arriving as an entire feature rather than a field.**
The general gate from SNG-399b catches an unread `*ImagePrompt`; nothing catches an unread *capability*.
Worth thinking about whether that is gateable at all — my honest answer is probably not, and the real
control is what happened here: someone opened the prototype and compared.

---

## §1 — SHIPPED: the zoom renders the generator

Past a 60° span the globe evaluates the **same generator that baked the raster**, windowed to the visible
patch, per pixel. Measured live in the browser at a 13° span: **1035 of 1036 sampled pixels match the
generator rendering, 0 match the raster.** The zoom ceiling moved 1.6× → 12× because the resolution floor
is gone.

**The seam was the risk, and it is a documented past failure** — `rebuild.py`'s header lists *"the base
globe and the detail patch drawing different worlds (a visible seam)"* among the regressions that forced
the pipeline to exist. Two gates hold it shut, and the elevation one **failed first and was right to**:
the shipped DEM is hydrologically adjusted (authored digs, smoothing, pit fill) and the generator returns
the surface *before* all of that — median difference 1, **p99 28, max 90** of a 126-unit range, worst
exactly where water was dug. So the generator does not replace elevation; it adds only the variation
*within* a cell. At a cell centre the correction is zero by construction.

## §2 — SHIPPED: the water draws

Rivers, lakes and marshes as vectors, fading in below a 46° span (Aevi's number, kept). The prototype's
own comment is the argument: *"at close zoom the 0.5deg raster cells read as blocks. Rivers are traced
polylines… so they scale cleanly."*

---

## §3 — ⛔ NOT SHIPPED: what the prototype still has that we do not

Payload it carries that our asset does not, in the order I would build them:

### §3a — Roads (`G.roads`, **84 polylines**)
⛔ **The highest value of the three.** We compute `walkingDays` from great-circle distance and Erik already
ruled on `roadFactor` — *"~6 outlier edges only"* — from a measurement (median road/straight **1.05×**, one
road at **2.37×**). **The road geometry is what that measurement was taken on, and we never shipped it.**
Drawing roads would also make the 6 outlier edges legible instead of abstract. ⚠️ Aevi's to author into
the asset; the pipeline has nowhere to put them today.

### §3b — Precursor lines (`G.prelines`, **49 polylines**)
The dormant relay network. ⚠️ **Not decoration — SNG-396 just promoted `gen-watershed-road` to canon
precisely because a player found a relay chain in play** (*"south to the mill gate and north toward the
ridge"*). The map cannot show the thing the fiction is now about.

### §3c — Labels (`lbl` toggle)
We resolve place names through a polar-signature matcher, fight collision censuses over them, ship them in
the asset — and **draw none of them**. This is the cheapest of the three and the most visibly missing;
`t.placeNames` is already carried into the viewer as of today.

### §3d — Smaller things
- **Adaptive resolution.** `calibrate()` times 200 generator calls, then `bufFor(ms)` picks a buffer size
  for a target frame budget — machine-independent LOD instead of my fixed threshold. Worth taking if the
  detail path stutters on a slower machine than mine.
- **Staged refinement** (`STAGE_MS`): draw coarse, then refine in place. We do coarse-while-dragging only.
- **Polar disc patch.** Near the pole an equirectangular patch stretches; the prototype switches to a
  polar disc. ⚠️ **We are Crossing-polar, so this matters more for us than for it** — every location sits
  at lat ≤ 0 and the Crossing itself is the south pole, which is the most-visited ground in the game.

---

## §4 — What I did NOT copy, deliberately

The prototype is a **Three.js** scene (`cam.fov`, `globe.remove`, mesh patches). Our globe is a
dependency-free 2D orthographic canvas, and SNG-390's opening argument stands: a CDN dependency stops
working on a plane, in a tunnel, and on the day cdnjs has an outage. **The LOD *idea* transfers; the
machinery does not.** What I took is the insight — *evaluate the generator over the visible window* — and
the one measured constant, the 46° water fade.
