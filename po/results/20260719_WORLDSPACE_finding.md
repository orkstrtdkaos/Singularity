# The map is a drawing, not a space — and the space already exists

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Prompted by** | Erik: *"if the lampless market ISN'T in the Deepwood, it SHOULDN'T have the same coordinates. We need to make the COORDINATES the worldspace first."* |
| **Status** | finding + recommendation — **nothing built**. This is an architectural ruling, and it revises something I shipped this morning. |
| **Reproduce** | `node scripts/worldspace_audit.mjs` |

---

## §1 · You are right, and it is worse than one collision

The Lampless Market is not an outlier. Measured across all 95 locations:

| | |
|---|---|
| cross-region pairs sitting **within 30 units** | **23** — and **not one of them is connected** |
| regions whose footprint contains another region's locations | **13 of 25** |
| `valley`'s footprint | radius 301, containing **56 locations of other regions** |
| connections spanning further than the median distance between *any two* locations | **18** |

A road longer than the typical gap between strangers is not a road. **The map is a diagram — layout hints drawn for legibility — and every mechanic that reads distance from it inherits that silently.** Which is exactly what I did this morning.

---

## §2 · The worldspace you are describing is already authored

`content/packs/valley/lore/world_node_atlas.json` defines **`axisOrder`** — the 12 axes in canonical order — and gives all 12 world nodes a **12-dimensional `axisVector`**. And **73 of 95 locations already carry one.**

That is not a map coordinate. It is a position in the axis-space the world's own canon says the world *is*:

> the axis-space made land: twelve Reaches … arranged not as a flat map but as a coordinate-space you travel through — `the_twelve_reaches.json`

**That file had never once reached the GM until this morning's loader fix.** The canon describing the world as a coordinate-space was in the drawer, and the map got drawn by hand without it.

### It holds up under measurement

| | hand-placed `map.x/y` | **full 12-D `axisVector`** |
|---|---|---|
| cross-region near-coincidences | **23** | **0** |
| regions overlapping another's footprint | 13 / 25 | **6 / 21** |
| `ent_deepwood` ↔ `the_lampless_market` | **0 units — identical** | *n/a — see below* |

**And the punchline: `ent_deepwood` has no `axisVector` at all.** The one location that started this conversation is among **22 of 95 that were never placed in the world** — only drawn on the map. It has a picture-position and no world-position.

---

## §3 · The part that changes your plan: no 2-D map can carry this

Your step order was *"make the coordinates the worldspace, overlay the axes, move the locations, then read off their coordinates."* I tested the "read off their coordinates" step by projecting the authored 12-D vectors down to 2-D (principal-axis projection — no aesthetics, just the two directions of greatest variance):

| | hand-placed | **2-D projection of the real vectors** |
|---|---|---|
| regions overlapping | 13 / 25 | **20 / 21 — worse** |
| cross-region collisions | 23 | **31 — worse** |

**This is not a tooling failure. It is dimensional.** A Reach is defined as the region *where one axis runs strongest* — so 25 regions are extremal along 12 different axes. Flattening to two dimensions destroys precisely the thing that separates them. Any 2-D layout, hand-drawn or derived, will put unrelated places on top of each other; it can only choose *which* ones.

So the conclusion inverts one step of the plan, and I think in your favour:

> **Don't move the locations on the map. Give the 22 unplaced locations their world coordinates, and demote `map.x/y` from a source of truth to a drawing.**

The map stays hand-drawn — legibility is a *correct* goal for a picture, and that is why the coordinates were placed that way in the first place. It simply stops being the thing mechanics measure.

---

## §4 · What this costs me — the substrate field I shipped this morning

I chose shortest-path-over-connections weighted by **coordinate distance**, reasoning that §3 of the substrate proposal had proved coordinates unreliable and the graph was the trustworthy topology.

That was routing around the defect instead of naming it. **You named it.** With axis-space available the weight should be **axis distance**, not map distance — a contained change to one function (`connectionGraph` in `engine/substrate.js`), because I kept the metric in one place.

What survives, and I'd argue should survive regardless: **the connection graph still carries traversability**, which is a genuinely different fact from distance even in a correct world — a chasm, a sealed gate, a wall. Two places can be adjacent in axis-space and a week apart on foot. So the shape stays *path over connections*; only the ruler changes.

**The 26 substrate sources' authored `radius` values are in map units** and would need re-scaling to axis units. That is the one real migration cost, and it is 26 numbers.

---

## §5 · What I recommend

1. **Author the 22 missing `axisVector`s.** This is the whole unblock and it is content — `ent_deepwood`, `millbrook`, `dw_the_moot` and 19 others. Content-side judgement, and the 12 atlas nodes are the reference frame.
2. **CI gate: every location has a 12-D `axisVector`** matching `axisOrder`'s length. Same shape as the loreRef gate — the absence has been invisible for as long as it has existed.
3. **Move mechanical distance to axis-space** — substrate falloff first, since it is the only consumer today.
4. **Demote `map.x/y` in the spec** to "a drawn view, not a measurement," so the next person does not derive physics from it. A CI check that flags *new* cross-region coordinate collisions would keep the drawing honest without forcing it to be accurate.
5. **Leave the drawing alone otherwise.** Fixing 23 collisions on a picture is cosmetic work; fixing 22 missing world-positions is structural.

**Open question that is yours, not mine:** should the 2-D map eventually be *generated* from axis-space per region — a local projection, where only 3–6 places compete and flattening is nearly lossless — rather than one global drawing? That would make the picture agree with the world without asking two dimensions to hold twelve. I have not tested it and would want to before recommending it.

---

*— CCode. Nothing built. §4 is the part I got wrong, and it was worth being told.*
