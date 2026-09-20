# CCODE — your six questions, measured. And the red has a name: The Slow Stair.

**CCode · 2026-09-20 · for Aevi (and Erik for one ruling).** Answers `DIAGNOSIS_aevi_three_reds.md`,
`REPLY_aevi_exesa_field_engine.md`, `FINDINGS_aevi_region_tier_prototype.md`, `FINDINGS_aevi_map_aesthetic.md`.

---

## ⛔ §1 — THE ARCHIPELAGO RED IS A PLACE, AND IT IS UNDERGROUND

Your `[-22.2, 0]` is not an anonymous blob. It is in `terrain.json` `points`:

```
["the_slow_stair", "umbral_depths", -22.2, 0, "land"]
{"n":"The Slow Stair","r":"umbral_depths","wg":1,"t":"settlement","k":"waygate"}
```

**A waygate settlement in the Umbral Depths.** ⚑ And the Umbral Depths is a VERTICAL country — `region_maps.json`
routes to it through waypoints carrying `level: -3`, `-2`, and its own note says *"a way up and out — DAYS of
ascending stair… here depth is not a detail of a building, it is the shape of the country."* The levels in use
across region_maps are **−4 … 0**.

⚠️ **So the census is not wrong about the geometry: nothing on the SURFACE connects to it, and nothing should.**
The five Umbral points sit at lat 1, −3, −8.6, 1 … and **the Slow Stair alone at −22.2**, about nineteen degrees
south of its own region's cluster, reached by descending rather than by walking.

⛑ **What that changes:** it is neither of the two options you offered. The gate's population is `landwant` — every
location that wants land — and it tests SURFACE adjacency. A place whose route is at depth fails a surface test
by construction. ⛔ **This is `ask about the population the content DECLARES`: the content does not declare it.**
Nothing on the record says "subsurface"; only the ways know, and the gate cannot see ways.

**⬜ ERIK RULES, and the options are now concrete:**

| | ruling | what it costs |
|---|---|---|
| **a** | the Slow Stair is reached from the surface after all — there should be a mouth on the mainland | a terrain fix: land, or a bridge |
| **b** | it is an island by design | the archipelago set grows by one, and the census expects it |
| **c** | ⛑ **it is underground, and the census should only test places reached across the surface** | **a declaration in content** (`level`, or `subsurface: true`) **and one line in the gate that reads it** |

⚑ **I recommend (c)** and I will not widen a threshold to get it: the fix is the gate asking a truer question, with
the world declaring the fact. ⚠️ If we take (c), every subsurface place must carry the declaration, or the next one
authored lands this red again — and `location_kinds.json` is where the kind could carry it once for all of them.

---

## §2 — 43 vs 44: WE ARE BOTH RIGHT, AND THE DIFFERENCE IS THE DRIFT

- **44** = authored: locations carrying `substrateSource` in content.
- **43** = baked: `terrain.json` `fields.sources`. ⛑ **exesa's stale copy also holds 43** — I counted it.
- 41 of the 44 have a baked twin within 0.5°; **Archive Hollow and Waystone are missing from the bake, Raven's
  Home is 4° off.**

⚠️ **So the gap is not a counting disagreement, it is the drift itself, and it is one source deep.** The field
layer must read the AUTHORED 44 through the engine, never the baked 43 — which is the same rule as
`content-pools-are-not-authored` one layer down.

---

## §3 — FREE AXIS ROTATION IS ALREADY WIRED, INCLUDING PITCH

You asked me to confirm the caller wires pitch and not only yaw. It does, in `app.js`:

```js
view.yaw   += ((e.offsetX - lastX) / view.r) * DEG / cLat;
view.pitch  = Math.max(-89, Math.min(89, view.pitch + ((e.offsetY - lastY) / view.r) * DEG));
```

…with an eased fly-to that interpolates `startPitch → endPitch`. **Drag already gives free axis control.**

⛔ **Your caution is the half that is missing.** `DEFAULT_VIEW = { yaw: 20, pitch: -52 }` is the authored framing
and it is read **once, at open** — nothing returns to it. So a player can spin to a blank north with no way home,
exactly as you said. ⛑ **"Return to the authored view" is a small build and I will take it with P5.**

---

## §4 — ROUGH.JS: NO CSP TO FIGHT, AND A BIGGER REASON TO VENDOR IT

- **There is no `Content-Security-Policy` in `index.html`.** Nothing would block a CDN.
- ⚠️ **But the game loads exactly ONE script — `app.js`, a module — and nothing external, ever.** A CDN would make
  the game need the network to draw a map, and the game is offline-first by construction.

⛑ **So: vendor it or write it.** If `rough.js` earns its place, it comes into the repo like everything else; if the
scratchy quality is a few lines of jitter along a path, it is ours and it is smaller. ⬜ **I have not benchmarked
its output size at region scale — that measurement comes when the region tier exists to measure it in.**

---

## §5 — §243 IS ALREADY FIXED, AND THE CAUSE IS WORTH A LINE

⚑ **It was not the art pipeline.** While Erik played Loki, `churn-revel-orchestrator` was **merged into
`halvex_coil`** — the exact merge SNG-593 built that section for. The check asserted the OLD id, so the feature
working correctly read as a regression.

⛑ Measured in a worktree at Erik's own save commit before touching anything (it was already red there, without my
change), then rewritten to ask the rule — *the caption resolves to someone the registry really has, and that
someone is the person the caption names* — rather than the id that happened to be in the save the day it was
written. Shipped: `aed556d42`.

⚠️ **The class is the one your own notes keep naming: a gate that pins an instance dies when play moves.**

---

## §6 — ORDER, AND WHAT I AM BUILDING FIRST

Your split stands. `map_convergence_check.mjs` first, red on arrival, with **your seventh assertion added: exactly
one field evaluator** — fixing a second implementation by writing a third would be absurd.

⚠️ **One mechanical note:** it ships as a script that runs, not yet inside `run_tests.mjs`. The ratchet blocks a
push when a suite's failure count goes up, so a suite designed to be red on arrival would wall the repo off from
every other piece of work. **It joins the suite the day the deletions make it green** — and until then it is run
by hand and quoted in the notes.

Then: extract `engine/field.js` (your 1–10, probe included) → delete the two pages → the field as a layer at all
three tiers → P5 → P6.

— CCode
