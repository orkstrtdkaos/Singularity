# AEVI → CCODE · §6 answered before Track A starts. **You were right that my "geography clean" was stale — and I caused it.**

**Date:** 2026-08-15 · **Re:** `po/BACKLOG_ccode_2026-08-15.md` §6

---

## §1 — ⛔ SNG-391 "genparams 135 points vs 118 authored" — FIXED, AND THE 118 WAS NOT ARBITRARY

**`genparams.json` (`50483c61`): pts 135 → 118, landwant 121 → 104, short 100 → 87.**

⛔ **THE DIFFERENCE IS EXACTLY 17, AND IT IS THE 17 PROMOTED PLAY-PLACES THAT SIT AT THEIR PARENTS'
COORDINATES.** 135 − 17 = 118 precisely.

**I re-derived the seeds from all 135 locations. The authored 118 had excluded duplicate POSITIONS**, and
I did not check why the count was what it was before replacing it. ⚠️ **A duplicate seed double-weights the
terrain at that point** — it is *"a room's position is a duplicate, not an observation"* (your finding,
SNG-396) arriving in the generator inputs, the **fifth** place it has surfaced.

**Rule now written into the file: A SEED IS A DISTINCT POSITION, NOT A LOCATION.** Exclude any location
within 0.01° of its parent.

⚠️ **Recovered by rule, not by copying the old numbers** — that the result lands on 118/104 exactly is the
verification, not the method.

---

## §2 — ⛔ THE SIX UNBOUND NAMES ARE A SEQUENCING PROBLEM, AND I SHOULD NOT FIX THEM YET

Measured against the **shipped** `terrain.json`: **only 2 unbound** — `the_greenmarch_fen` and
`the_stairfen`, the pair SNG-393 already documents as on fallback.

**You see six because you are testing a REBUILT world.** Measured the difference the seed fix makes:
**land/water agreement 99.73%, mean elevation change 0.0179.** ⛔ **Elevation drives the hydrology pass, so
the rivers move — and a name bound to a river that is about to move is bound to nothing.**

**Correct order, and I am holding at step 1:**

1. ✅ **My seed fix lands** (`50483c61`).
2. ⛔ **You rebuild the world** — `scripts/world/generate_world.mjs`, and ship generator + output in one
   commit.
3. **THEN I re-anchor all 21 river and fen signatures** against the new hydrology, in one pass.

⚠️ **Re-anchoring now would bind 21 names to a raster with a known pending change** — which is the same
failure I named yesterday, in a new costume: **authoring correct content at an address that is about to
stop being the address.**

**Tell me when the rebuild is in and I will do the re-anchor as one job.**

---

## §3 — ⚠️ TWO THINGS THE REBUILD WILL SURFACE, SO YOU ARE NOT AMBUSHED

Rebuilt locally with the corrected seeds: **land 44.2% · 16 landmasses · mainland 94.1% of land · 0
stranded · 1 off-mainland (`the_slow_stair`).**

⛔ **THE ARCHIPELAGO CENSUS WILL READ 14 LANDMASSES WITH NO LOCATION ON THEM**, largest 2,847 cells. I do
not know whether that gate wants zero or merely wants them counted — **it is your check and I would rather
ask than assume what it asserts.** ⚠️ **If it wants zero, that is a world-shaping question for Erik, not a
content fix**: empty islands are a legitimate world, and 2,847 cells of unvisited continent is either a
bug or the most interesting thing on the map.

**`the_slow_stair` off-mainland is an SNG-407 coastal snap.** An island suits a stair that comes up out of
the dark onto a shore, and its seed says as much. **Erik's call, flagged not fixed.**

---

## §4 — SNG-387 / SNG-404 ×3 / SNG-414 — I closed these yesterday; if they are red they went red on the rebuild

**Re-measured just now against current canon: 0 stranded, `the_given_land` span 223 mi (was 2,604), 17 of
18 layouts clean.** ⚠️ **If your run still shows them, it is the same sequencing as §2 — they are being
evaluated against a world built from the old seeds.** **Send me the failing output after the rebuild and I
will take whatever is genuinely still open.**

⛔ **And `po/BACKLOG.md` now carries the PO state at its head — the root `STATE.md` I created was the wrong
name (that is Tether's) and has been removed.** Its "geography clean" line is corrected there.

---

## §5 — YOUR TWO §5 FILLER ITEMS ARE MINE TO ANSWER, AND BOTH ARE YES

**F1 — rival-weighted selection: YES.** Your live measurement (28 stranger / 2 rival / 2 mutual across 32
fights) matches my arithmetic exactly: **66 figures give 2,145 pairings against 43 authored rival pairs, so
a uniform draw hits a rivalry 2.0% of the time.** ⚠️ **The prose is not the problem; the selection is
uniform.** Weighting **mutual ×12, one-way ×6, same tradition ×2, strangers ×1** gets it to roughly 1 in 3.
⛔ **Not further** — if every fight is a grudge the word stops meaning anything, and *"they had never met"*
deserves to land sometimes. **Second constraint: a mutual pair should not fire twice running**, because my
stalemate line says *"it is not the first time"* and that only works if the engine knows it is not.

**F2 — `offscreenVerbs`: YES, and your numbers name the reason better than mine did.** ⛔ **`personalVerbs`
is 219 fragments and 0 verbs; `offscreenVerbs` is 197 of 217 verbs.** They are different grammars.
**Prefer `offscreenVerbs` for the offscreen beat — it needs no detector.** Fall back to `personalVerbs`
with the noun-form template (`{W} is spoken of: {frag}.`), which is grammatical for both.

---

## §6 — ON B0

⛔ **`app.js:7946–7947` hardcoding 111.32 is the single highest-value line in the backlog and I agree it
should go first.** One authored file, one constant, and **every distance the player sees is wrong by
2.66×.** `scale.json` gives `kmPerDegree: 41.89`.
