# SNG-434 — The five geography failures, closed. Four were mine, and one was not what it looked like.

**Author:** Aevi (PO) · **Date:** 2026-08-10

---

## §1 — ⛔ SNG-387 (3 stranded): **ALREADY ZERO.** Fixed as a side effect.

Re-measured against the live generator: **0 locations in water.** ⚠️ The three were cleared by the
SNG-407 snap and the SNG-427 cluster move — **the fix landed before the gate was re-read.**

---

## §2 — ⛔ SNG-414 (`the_given_land` global): **WAYSTONE, AND IT WAS ME.**

`the_given_land` spanned **2,604 miles** because Waystone was still filed there — **I moved it onto the
Echo in SNG-427 (its seed: *"the masons build the crossing"*) and never updated its region.**

⚠️ **All five nearest neighbours are `valley`, and it is 15 MILES from the crossing its masons build.**
Moved. `the_given_land` now spans 223 mi; `valley` 813.

⛔ **The same miss as Echo River Crossing: I moved the position and forgot the region is a separate
field.** Twice now.

---

## §3 — ⛔ SNG-404 ×2 (bearings + the eight layouts): **17 OF 18 CLEAN.**

Re-measured every authored layout against current terrain. **Only Millbrook was stale, and only its road
set** — its river bearing had not moved at all. Refreshed, and **Waystone is now a 29-mile neighbour where
it was 2,600 miles away in another region.**

⚠️ **`basis` did its job again** — the audit was one town, not eighteen.

---

## §4 — ⛔ SNG-391 (determinism): **THE RASTER WAS FINE. `genparams.json` WAS STALE.**

**I assumed the terrain had drifted. It had not:**

| check | result |
|---|---|
| generator vs itself | ⛔ **100% deterministic** |
| shipped `terrain.mjs` vs local | **functionally identical** — only the ESM export wrapper differs |
| `genparams.json` repo vs local | **byte-identical** |
| shipped raster vs generator | 99.42% |

**The 0.58% was the raster being right and the SEEDS being wrong.** ⛔ **21 locations had no `pts` seed
within 0.2°, worst 182 miles (Waystone).** The four I moved in SNG-427 and the eleven from SNG-407 were
all in that set.

⚠️ **So the terrain was still guaranteeing ground where those towns USED to be.**

**`pts`, `landwant` and `short` are a CACHE of canon `worldPos`** — CCode said exactly this in SNG-391:
*"genparams.pts is a cache of canon worldPos, not an input."* **Re-derived: pts 118→135, landwant
104→121, short 83→100.**

### §4a — ⚠️ And I got `landwant` wrong on the first pass

I excluded `depth < 0`, which dropped Archive Hollow, Gearsflat and 27 others. ⛔ **A CAVERN IS UNDER LAND
AND STILL NEEDS LAND ABOVE IT.** Only `sky` (12) and `undersea` (2) are exempt — the rule the original 104
used, now applied to 135.

**Rebuilt and verified: land 42.0%, mainland 100% of land, ⛔ 0 stranded, 1 off-mainland.**

**That one is `the_slow_stair`** — an SNG-407 coastal move. ⚠️ **An island is an acceptable outcome for a
stair that comes up out of the dark onto a shore**, and its seed says exactly that. **Erik's call if he
wants it on the mainland.**

⛔ **THE GATE WORTH ADDING IS CCODE'S OWN: fail if the cache disagrees with canon.** That is a cheaper
check than a 720×360 diff and it points at the actual fault.

---

## §5 — HIS TWO QUESTIONS, ANSWERED BY MEASUREMENT

### §5a — ⛔ *"Should `rivals` drive more fight selection?"* YES, AND THE NUMBER SAYS SO OUTRIGHT.

**66 figures → 2,145 possible pairings. 43 authored rival pairs.**
⛔ **A uniform draw hits a rivalry 2.0% of the time — so 85% of eight-fight ticks are ALL STRANGERS.**

**7 of 8 is not a bug in the prose. It is exactly what uniform selection produces.**

**Proposed weighting:** mutual rivals ×12 · one-way ×6 · same tradition ×2 (a schism reads as news) ·
strangers ×1. ⛔ **That gives roughly 1 in 3 fights as a rivalry, not 1 in 50.**

⚠️ **And do not go further** — if every fight were a grudge the word would stop meaning anything, and
*"they had never met"* is a good line that deserves to land sometimes. **Second constraint: a mutual pair
should not fire twice running** — my stalemate line says *"it is not the first time"*, which only works if
the engine knows it is not.

### §5b — ⛔ *"Should personal beats draw from `offscreenVerbs`?"* YES — AND IT IS THE FIELD I SHOULD HAVE POINTED AT.

Both are authored 66/66, **and they are different grammars:**

- **`offscreenVerbs`** — third-person active: *"attends an ending unsent-for"*, *"builds another
  impossible thing"*. ⛔ **These drop straight into `{W} {frag}.` and ARE sentences.**
- **`personalVerbs`** — noun phrases: *"a daughter who thinks he is a clerk"*. ⛔ **These are what broke.**

⚠️ **Prefer `offscreenVerbs` for the offscreen beat — authored for exactly this slot, already active
voice, no detector needed.** Fall back to `personalVerbs` with the noun-form template.

⛔ **The verbless bug was a FIELD-CHOICE error before it was a grammar error**, and my SNG-433 fix treated
the symptom.
