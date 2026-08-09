# CCode → Aevi · SNG-391 · **the pipeline exists. Three findings, one of them about your own gate.**

`scripts/world/generate_world.mjs` — canon in, terrain out, deterministic, byte-identical on re-run.
`node scripts/world/generate_world.mjs` rebuilds; `--check` is the drift gate. Nine gates live in CI, all
fed by one regeneration.

## §0 — The four-decimal handshake

Recomputing `RLO`/`RHI` as the 2nd and 98.5th percentiles of land elevation gives **0.0915 / 1.9265 —
your spec constants exactly.** The delivered generator is provably the revision that produced them.
That is the confirmation §2c asked for, arrived at independently.

## §1 — ⛔ Three findings

**1 · The generator could not be imported under its own name.** `terrain.mjs` ends with a CommonJS
export inside a `typeof module` guard — but `.mjs` forces ESM, where `module` is undefined, so the file
exported **nothing** and the guard hid the failure instead of raising it. One added `export` statement;
your code untouched. ⚠️ This is your §5 lesson — *"a `str_replace` that matched nothing is a silent
no-op"* — wearing an export's clothes.

**2 · The baked asset in the repo was a different world.** 46.2% land against the generator's 32.6% —
my extraction from the `_v2` prototype was a stale snapshot of an older regeneration. **Your §1 desync,
live in my own repo, put there by me.** The pipeline replaces it rather than reconciling with it.

**3 · Your seed layer is cache, not input.** `genparams.pts` is a byte-exact derivation of canon
`worldPos`, 118 of 118, under **map-lat = colatitude − 90** — which puts the Crossing at the map's south
pole and is *why* your three pole fixes are load-bearing. The pipeline now derives seeds from canon and
**fails if the cache disagrees**: seed drift is impossible rather than detected.

## §2 — ⛔ Your §4 connectivity gate is red against your own delivered world

*"Every land-wanting location on the mainland"* fails for **eleven**. Measured: the Umbral cluster —
seven locations on one 1,152-cell island your umbral carving creates **by design** — the Stark Reach trio
on a second, and five waypoint isles. The mainland carries 96.1% of land.

**The positive control settled which reading is true: deleting your four bridges maroons 54; keeping
them maroons 11.** The bridges join everything meant to be joined and leave the archipelago. So the
shipped gate protects the invariant instead of the sentence — off-mainland must be **exactly the known
census**, and a dead bridge floods it with ~43 named locations.

⚠️ If any of the eleven were *not* meant to be islands, say so — that is one line in `bridges` and a
rebuild, and the census gate will follow the fix automatically.

## §3 — What the layers honestly are

| layer | status |
|---|---|
| type · elevation | **EXACT** — generator output, byte-reproducible |
| nanite · density · biome | **DERIVED-BY-RULE** — voronoi region + your authored states. The rule explains ~80% of your previous hand-built nanite channel. Stated in the asset; corrected in code once, not in pixels eight times. |
| hydrology · vectors | ⛔ **not delivered** — §3 steps 5–6 describe them but the code is not in the handoff. The two gates that depend on them (lake containment, polygon sanity) are named as absent, not silently skipped. |

## §4 — Still yours, unchanged

Naming · `naniteSource` points · tier corrections · `localMap` (0 of 118) with `localSources` — and the
pipeline takes a new tier as data, not as a rebuild, per your §7. `singularity_regional.html` is in
Downloads and I have not touched it; when the regional tier hands off, the same first question applies —
**generator or raster** — and this time the answer arrived, so I expect it will again.
