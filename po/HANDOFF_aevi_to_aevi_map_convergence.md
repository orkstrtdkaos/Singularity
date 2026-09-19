# HANDOFF — Aevi → Aevi · map convergence
**Written 2026-09-19 at the close of a long session. Read this first, then measure.**

---

## §1 — ⛔ THE TASK, IN ERIK'S WORDS

> *"I want to get the map and world and travel laying out seamlessly. We have the wonderful world view with
> rotation and some zoom capability, as well as the power source world map — **those need to converge into one**.
> Then we have Regional maps and Local maps."*

**Four surfaces. Two need to become one; two need to sit under it coherently.**

## §2 — ⛑ WHAT EXISTS, MEASURED

| surface | file | lines |
|---|---|---|
| the globe — rotation, zoom | `engine/worldglobe.js` | 1085 |
| geometry, distance, travel | `engine/worldmap.js` | 669 |
| standalone world view | `singularity_world.html` | 525 |
| **the power-source field** | `exesa_field.html` | 424 |
| icons | `engine/mapicons.mjs` | 252 |
| the wheel | `engine/wheelgeom.js` | 191 |
| projection script | `scripts/world_projection.mjs` | 107 |

**Regional and local live in data, not renderers:** `content/packs/core/world/` holds `region_maps.json`,
`local_layouts.json`, `areas.json`, `scale.json`, `terrain.json`, `placenames.json`, `precursor_lines.json`,
`waterauth.json`, `location_kinds.json`, `genparams.json`. ⚠️ Read by `engine/places.js`, `engine/state.js`,
`engine/npcsheet.js`, `app.js`.

## §3 — ⛔ THE FIRST THING TO MEASURE, AND DO NOT SKIP IT

**Do the two renderers share a projection, or does each carry its own?** The convergence question is already
half-answered in the data and I did not verify it against the code:

- `worldPos` is `{colatitude, longitude, depth}` on **all 143 locations**
- `geodesic(a, b, {depthScale = 0.05})` — **depth is charged**, so one level down is ≈ 4.8 walking days
- `walkingDays` returns **days**, computed as `d × 300/π`. ⚠️ **IT IS NOT MILES.** `milesFor(days, scale)`
  converts. I read days as miles and nearly sited three places wrong.
- `scripts/world_projection.mjs` reads `world_node_atlas.axisOrder` — **the same twelve axes closed in SNG-633**,
  so the axis geometry and the map geometry touch.

⛑ **There is one coordinate system already.** The real question is whether `worldglobe` and `exesa_field` both
honour it or each re-derive. **Measure that before proposing anything.**

## §4 — ⚠️ THE LIVE HAZARD

**SNG-391 is red on purpose and it will matter here in a way it has not for content work.** `terrain.json` was
built **2026-08-10** and the regenerated world differs. Erik ruled: *moving forward with the unexplained diff,
not intending to regenerate.*

⛑ **`terrain.locations` is a MAINTAINED INDEX, not a regenerated one** — that is how five places have been
minted this week without a rebuild. But the raster underneath it is stale, and **a map renderer reads the
raster.** Expect the drift to surface as a visual discrepancy the content layer never noticed.

## §5 — ⬜ ALSO OPEN, IF MAPS STALL

Four of five SNG-627 hooks are unwired: `mounts` (shortens a journey — **this one is travel and belongs to the
map work**), `healing`, `housing`, and **troops are not furniture** — a garrison is still only a bill.
`callCostPerHead` 4 and `trainedCallMult` 0.75 are authored; CCODE-430 wired training.

— Aevi
