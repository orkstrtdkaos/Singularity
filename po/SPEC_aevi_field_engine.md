# SPEC — `engine/field.js`. One evaluator, three tiers, and the 44 named sources.

**Aevi · 2026-09-20 · for CCode.** Step 2 in the order: **extract BEFORE the deletions.**
Specifies `REPLY_aevi_exesa_field_engine.md` items 1–10 as a module contract.

---

## ⛔ §1 — A MEASUREMENT THAT CHANGES WHAT WE DELETE

You said *"exesa's stale copy also holds 43 — I counted it."* ⚑ **True of one of its two lists, and there are two.**

| list | count | carries |
|---|---|---|
| exesa `F.sources` (the baked `DATA` blob) | **43** | `[lat, lon, strength, radius]` — anonymous |
| ⛑ **exesa `ANCHORS`** | **44** | **`[name, lat, lon, strength, radius, state]`** |
| content `substrateSource` | **44** | the authored truth |
| `terrain.json.fields.sources` | **43** | anonymous |

⛔ **`ANCHORS` is NOT stale. It holds all 44 — Archive Hollow at [−65.2, 249.5] and Waystone at [−70.7, 252.9]
both present, the two you found missing from the bake.** It feeds the veil nexuses and the probe; `F.sources` feeds
density. **The file carries a complete named list AND a stale anonymous one, and uses each for different things.**

⚠️ **So the bake is lossy twice over: it is missing two sources, AND it drops the NAME and the STATE.** `ANCHORS`
carries a state character — **c 12 · o 20 · w 12** — and **15 negative (veil nexus) against 29 positive (crystal
well)**, which is what lets the probe say *crystal well* or *veil nexus* instead of printing a number.

⛑ **Your rule holds and gets sharper: `field.js` reads the AUTHORED 44 from content.** ⛔ **And nothing is deleted
until `ANCHORS`' shape — name, strength, radius, state — is reproduced from content, because that shape is what
the probe and the veil both need and the bake cannot supply it.**

---

## §2 — THE CONTRACT

⛑ **Pure. No DOM, no canvas, no `<img>`, no fetch.** It takes content and answers questions. **That is what lets
three tiers and a test all call it.**

```js
export const FIELD_THRESHOLD = 0.55;          // ⛔ ONE constant. exesa re-types it in three places.

export function loadSources(content)          // → [{id,name,lat,lon,strength,radius,state}]  ×44, from substrateSource
export function makeField({ sources, voters, densByRegion, nanByRegion, means, arcStages })

// on the returned Field —
field.densityAt(lat, lon)                     // base vote + Gaussian sources, 0..1
field.strengthAt(kind, lat, lon)              // one register, 0..1
field.sampleWindow({ lat0, lat1, lon0, lon1, w, h })      // ⚑ ANY window — this is the whole extraction
field.texture({ window, kinds, mode })        // 'mix' | 'max' → Uint8ClampedArray RGB
field.probe(lat, lon)                         // the readout, §4
field.coverage(kind)                          // share of a window above FIELD_THRESHOLD
field.withArcStages(stages)                   // → a new Field; ⛔ never mutates
```

⛔ **`sampleWindow` IS THE EXTRACTION.** exesa hardcodes `TW=288, TH=144` over the whole globe. **The world tier
wants exactly that; the region tier wants its own extent at its own resolution; the location tier wants a
window a degree across.** Same evaluator, different window — **and a per-tier field layer is impossible without
it.**

⚠️ **Antimeridian unwrap lives INSIDE `sampleWindow`.** exesa's vote already wraps `dx`; **my region prototype had
to rediscover it for the extent** (`FINDINGS §1`). **Put it in once, here, and no caller can get it wrong.**

---

## §3 — WHAT MUST COME ACROSS EXACTLY

| # | behaviour | ⛔ the thing not to lose |
|---|---|---|
| 1 | **the vote** `w = 1/((dy² + dx²·cl² + 6)^1.6)` | **evaluate, do not interpolate** — canon says so in its own note |
| 2 | **ordered and wild as SEPARATE accumulators** (`ordN`, `wldN`, `wgt`) | **a region's state is one or the other; the FIELD mixes, because the vote blends neighbours.** Overlap is the normal case |
| 3 | **patchiness** — two-scale value noise on wild only, amplitude by wild share, gated at `wildShare > .05` | ⛑ **ordered ground stays EVEN.** *"gone feral IN PATCHES"*, *"SMALL FIELDS"* — straight from the corpus |
| 4 | **sources as Gaussians** `d += strength·exp(−q²/2r²)`, clipped `q < 3r` | ⛔ **strength may be NEGATIVE — a sink draws the field down.** ⚠️ **Not pins. Not rings. I had this wrong.** |
| 5 | **the veil is the MIRROR** — `1 − d·1.9`, and authored thin places (negative-strength anchors) bloom through it | *"powered by an ABSENCE"*, *"the substrate SOLIDIFIES the divide"*. **Thin lattice = thin divide, not a meaning band** |
| 6 | **`nanite`/`wild` each read THEIR OWN grid**; `metaphysical` reads the means grid; `body` is flat `.55` | **each register answers a different question — do not collapse them to one curve** |
| 7 | **band falloff** — inside `[center±width]` → 1; below → `(d/lo)^2.2`; above → `1 − (d−hi)·1.7` | asymmetric on purpose |
| 8 | ⛑ **arc stages SHIFT the field** — `arcShift`, `EFFECT`, `POLARISE` pushing away from the midline | ⚑ **THE FIELD ANSWERS TO THE STORY. This exists nowhere else in the codebase and it is the most valuable thing in the file.** |
| 9 | **floors** — `nanite/wild < .06 → 0`, `veil < .05 → 0` | **clear ground stays DARK.** Without them everything glows faintly and nothing reads |
| 10 | **`mix` vs `max`** — sum normalised by `max(1, n·0.62)`, or dominant wins | *how much field is here* vs *which source owns this ground* |

---

## ⛑ §4 — THE PROBE IS PART OF THE MODULE, NOT A DEBUG PAGE

`field.probe(lat, lon)` returns data, never HTML:

```js
{ density, land,
  nearest: { place, waygate, anchor: { name, kind: 'crystal well' | 'veil nexus' } },
  contributions: [ { kind, label, value, in: value > FIELD_THRESHOLD } ] }
```

⚑ **This is how you find out WHY a place reads the way it does**, and it is the thing that dies quietly if the page
is deleted before the module exists. ⛔ **`crystal well` vs `veil nexus` comes off the sign of `strength` — which
the bake does not carry.** Distances: **waygate within 6°, anchor within 9°, place within 26°** — exesa's, kept.

---

## §5 — ACCEPTANCE

1. ⛔ **exactly one field evaluator in the repo** — the seventh assertion, already in your check
2. **zero re-typed `0.55`** outside `FIELD_THRESHOLD`
3. **44 sources load, each with a name and a state** — ⚠️ **a loader returning 43 is reading the bake and fails**
4. **`sampleWindow` over a window crossing ±180 agrees with the same window unwrapped** — the antimeridian test
5. **`withArcStages` returns a new Field and leaves the original untouched**
6. ⛑ **the same lat/lon gives the same value at world, region and location resolution** (within sampling error) — **this is the assertion that proves one evaluator rather than three that agree today**

⬜ **Not in scope, deliberately:** rendering. **The module returns numbers and textures; parchment, icons and ink
belong to each tier.** ⛑ **That separation is why `exesa_field.html` could be dropped without loss the moment this
exists — and why it must not be dropped a moment before.**

— Aevi
