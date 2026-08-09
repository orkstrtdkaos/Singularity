# CCode → Aevi · SNG-390 · **the generator is not in the delivery**

> *"Ship the GENERATOR, not just the raster. A baked terrain file with no reproducible source is a 250 KB
> asset nobody can re-derive after the next content change — and content will change."*

⛔ **You are right, and what arrived is the raster.** I have `singularity_world_v2.html` from Downloads.
Measured:

| | |
|---|---|
| total file | **809 KB** |
| the baked blob `G` | **792 KB** |
| **all HTML + CSS + JS** | **16.2 KB** |

**Ten functions, every one a viewer**: `idx`, `eIdx`, `Acell`, `buildTexture`, `build`, `sprite`, `v3`,
`hyp`, `factor`, `loop`.

**Searched the 16.2 KB for generation vocabulary** — `noise`, `simplex`, `perlin`, `fbm`, `octave`,
`erosion`, `watershed`, `drainage`, `tectonic`, `seed`, `generate`, `derive`:

```
NONE.
```

The only `plate` in the file is the word *plateau* in a colour table. The three `Math.random` calls are the
spin, not the terrain.

⚠️ **So §4 items 1–3 are blocked, and item 3 is not merely blocked but meaningless:** a determinism gate is
*"regenerate and diff"*, and there is nothing to regenerate with. I can gate that the shipped bytes do not
change — but that gates the asset against **me**, not against content drift, which is the opposite of what
you asked for.

**What I need is whatever produced `G`** — the script, notebook or session that turned `worldPos` +
`biome` + `naniteField` + `substrateSource` into those four channels. If it does not exist as an artifact,
the honest statement is that the terrain is **authored output**, not derived, and it belongs in the canon
column of your own §1 table rather than the derived one.

---

## What I have built anyway, because your §2 says the viewer alone is a complete deliverable

**`content/packs/core/world/terrain.json` — 617 KB.** ⚠️ Its `note` field says in the file what I have said
here: baked output, no generator, cannot be re-derived.

⛔ **World B only.** The prototype ships two worlds; *A · the southern cap* is the alternative you measured
canon against in SNG-389 (*"119,700 land cells of world B"*). Carrying a design comparison into the game
cost 176 KB for nothing.

**A dependency-free globe renderer.** ⚠️ **The prototype loads Three.js from cdnjs**, and this app has
**zero** external runtime dependencies — `index.html` fetches nothing off any network. A globe that needs a
CDN stops working on a plane, in a tunnel, and on the day cdnjs has an outage. Vendoring Three.js was the
alternative at ~600 KB on top of a 617 KB asset. **An orthographic globe needs no 3D library** — sphere to
screen is eight lines of trigonometry, and drag-to-spin, scroll-to-zoom and hover are all in the
projection. What is lost is a perspective camera and Lambert lighting; the hillshade carries the relief.

⛔ **And I did not copy your `factor()`.** The prototype hard-codes `BANDS` and a `0.6` crowd floor — a
second copy of `sourceBands` + `SUBSTRATE_TUNING`. **That is the `map.x/y` failure class you named, inside
the very file that names it**: the moment Erik picks one of SNG-389's three options, the map would keep
telling the old story. The "whose ground" layer calls the engine's own `bandFactor` against the live band
table instead.

---

## On travel — ✅ agreed, and nothing to do

Your measurement stands on its own: **median 1.05×** is noise, and rewriting `walkingDays` globally would
churn every authored distance to chase it. **The tail is the real finding** — 2.37× worst, six edges above
1.3×.

⛔ **I have not built `roadFactor`**, per your own §4 item 5: it is a proposal with a measurement attached
and Erik has not ruled. When he does, it is a per-edge optional field on ~6 edges and half a day.

---

## Where this leaves the ticket

| §4 item | state |
|---|---|
| 1 · `scripts/generate_world.mjs` | ⛔ **blocked — no generator delivered** |
| 2 · `content/…/terrain.*` | ✅ shipped as baked output, labelled as such |
| 3 · determinism gate | ⛔ **meaningless without 1** |
| 4 · the viewer | 🔨 **in progress — dependency-free, read-only** |
| 5 · `roadFactor` | ⛔ correctly not built |

⚠️ **The regional maps you mention are built — I have not seen them.** If they arrive the same way, the
same question applies: generator or raster.
