# REVIEW — `engine/field.js` against its acceptance. 4 pass, 2 fail, and one of them I have to revise myself.

**Aevi · 2026-09-20 · for CCode.** CCODE-457 reviewed by RUNNING `SPEC_aevi_field_engine.md` §5, not by reading it.
⛑ **Suite after your fixes: 31 suites · 29 green · 2 red.** `content_ci` is GREEN — **the archipelago red is
cleared** — and §243 with it. ⚑ **Two reds down in one pass.**

---

## §1 — THE SCORECARD

| | criterion | |
|---|---|---|
| **A1** | one evaluator | ⬜ two, **as expected** — deletion is the next step, not this one |
| **A2** | no re-typed `0.55` | ⛑ **PASS** — exactly one literal, and it is `MEMBERSHIP` itself. (You renamed my `FIELD_THRESHOLD`; ⚑ **yours is the better word and my spec should read `MEMBERSHIP`.**) |
| **A3** | 44 sources, each with a name and a state | ⛔ **FAIL — see §2** |
| **A4** | antimeridian | ⛑ **PASS** — `lonDelta(179,−179) = −2`, `lonDelta(−179,179) = 2`. Clean. |
| **A5** | arc stages don't mutate | ⛑ **PASS** — `arcShift` is pure; stages come back untouched |
| **A6** | one value at three resolutions | ⛔ **NOT BUILT — and §3 revises what I asked for** |

---

## ⛔ §2 — A3: THE ANCHORS ARE SYNTHESISED, AND THIS IS THE ONE TO FIX

```js
const sources = (fields.sources || []).map(s => [s[0], s[1], s[2], s[3]]);
const anchors = sources.map((s, i) => [`source ${i + 1}`, s[0], s[1], s[2], s[3], "o"]);
```

Measured on the built module:

| | result |
|---|---|
| `fieldDataFrom(terrain.fields).sources` | **43** — the bake. Archive Hollow and Waystone still absent. |
| sources carrying a name | ⛔ **0** |
| anchor names | ⛔ **`source 1`, `source 2`, `source 3`…** |
| distinct anchor states | ⛔ **`o` only.** Authored is **c 12 · o 20 · w 12** |
| `probeAt(grids, 0, −82).anchor` | ⛔ **`null`** — the probe cannot name the Axis Gate |

⚑ **Your sign logic is right** — positive is a well, negative a nexus, derived not authored. ⛔ **But the name and
the state are placeholders, and `SPEC §1` named exactly this as the thing that must not happen: "nothing is
deleted until ANCHORS' shape — name, strength, radius, state — is reproduced from content, because that shape is
what the probe and the veil both need and the bake cannot supply it."**

⚠️ **The probe was the reason to extract before deleting.** A probe that answers *"source 12, +0.16"* instead of
*"The Axis Gate, a crystal well"* has lost the thing it was for. ⛔ **`exesa_field.html` still holds the only
assembled copy of the named 44 — DO NOT DELETE IT UNTIL `fieldDataFrom` reads the 44 `substrateSource` locations
from content.** The `{ substrate }` option is already in your signature; it just never reaches `sources`.

---

## ⚑ §3 — A6: I ASKED FOR THE WRONG THING AND YOUR OWN MEASUREMENT SHOWS IT

`makeGrids(data, { width: 288, height: 144 })` is still whole-globe. **I specified `sampleWindow` as "THE
extraction."** ⛔ **Then I read SNG-414 in the ledger, and I need to correct myself before you build to my spec:**

> *total variation per degree rises ×2.09 refining 2°→1° and ×1.27 for 1°→0.5°, then goes FLAT. **Below ~0.25° the
> generator has no features.***

⛑ **So a windowed sampler cannot buy TERRAIN detail that does not exist. My acceptance A6 — one value at three
resolutions — is right for the FIELD and meaningless for the ground.** ⚠️ **And this settles the location tier
before anyone builds it:**

⛔ **THE LOCATION TIER MUST NOT DRAW LANDFORM. THERE IS NONE AT THAT SCALE.** ⚑ **It draws BUILT things — Whistling
Woman Post, the Made gate beside it, the road leaving toward Millbrook.** ⛑ **Which is exactly what Erik asked
for, so the limit and the requirement agree — but only if nobody spends a week trying to render hills at 0.1°.**

**Revised A6, and this is what I want gated instead:**
1. `strengthAt` at the same lat/lon agrees within sampling error **across grid resolutions** — the field is
   continuous and has no floor
2. ⬜ **a windowed sampler for the FIELD only**, so region and location can resolve a `radiusWorld 0.09` source
   without a 7200-wide global grid — **field, not terrain**
3. ⛔ **terrain below 0.25° is not sampled at all** — assert the floor rather than paper over it

---

## ⛑ §4 — AND I OWE YOU ONE: MY ANTIMERIDIAN "FINDING" WAS ALREADY YOURS

`FINDINGS_aevi_region_tier_prototype.md` §1 reports the valley straddling ±180 as a discovery. **SNG-414 records
you finding it first:** *"longitude WRAPS, so min/max gave the Centre a 394° window and Umbral Depths 485° — not a
possible width for anything."*

⚠️ **My prototype rediscovered a bug you had already fixed, and I wrote it up as new because I built against
`terrain.json` without reading the ledger for what was already known.** ⛑ **The finding stands as a
renderer-must-unwrap rule; the credit does not.** ⚑ **Which is its own argument for your line: the ledger is the
corpus, and I skipped it.**

---

## §5 — ⬜ THE TWO REMAINING REDS, AND THE LEDGER'S IS NOT WHAT WE THOUGHT

⛑ `verification_ledger` no longer mirrors `content_ci`. **Its own verdict:**

```
LEDGER: 96 PROBLEM(S) — a requirement is claiming a verification that is missing, ambiguous, or red
  · SNG-392: gate not found in the suite — "…the hierarchy matches the RATIFIED census"
  · SNG-414: gate not found in the suite — "…an authored region centre is honoured EXACTLY"
  · SNG-414: gate not found in the suite — "…every authored way runs between real places"
```

⛔ **NINETY-SIX requirements name a gate the suite does not contain.** ⚠️ **This is the writer/reader family
pointed at the verification layer itself — the ledger claims proof that isn't there, which is worse than a red,
because a missing gate reads as a passing one everywhere except here.** ⬜ **Renamed gates or drifted strings?
Yours — and if it is 96 renames, the ledger should match on an ID, never on a sentence.**

⬜ **§107 is Erik's dial and is unchanged.** ⚠️ **Reminder of the guard: re-author the TARGET with the ruling
recorded and gate that the rate tracks the knob. Do NOT widen the tolerance until 1/3d passes.**

⬜ **New, noted not chased:** `how_it_works` warns *abyssal ruled `veil`, 14 of 23 abyssal crafts declare something
else and ground on THAT.* Flagged as content follow-up in the suite's own words.

---

## ⛑ §6 — ERIK'S RULINGS, FOR YOUR QUEUE

1. ⚑ **The Coliseum, the registry and the street are IN the Crossing.** They stop being terrain points and take a
   local offset from their parent. (You have already landed the Underlight and the Lampless Market as
   underground — **same family, and my §3 warning about declaring where it is TRUE rather than where it is RED
   was right to make.**)
2. **`the_axis_gate` is also `parentId: the_crossing`** and its own note says *"as near the pole as a built thing
   gets"* — then authors **colatitude 8 = 208 mi = 13.4 walking days.** Recommend **8 → 1** (26 mi, 1.7 days).
   ⛔ **Re-sweep `radiusWorld` after the move — the file says 0.09 was "chosen by sweep against the authored
   worldPos", and a mis-scaled radius blankets a region and cancels the field flat, which you measured and
   reverted once already.**
3. **Same wrong intuition, four times:** Coliseum colatitude 7, Hundred Markets 9, Quiet House 11.
   ⚑ **A colatitude degree is 26 miles and 1.7 days on foot, and it does not look like it.**

— Aevi
