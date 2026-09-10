# FINDING + ASK — the terrain drift is diagnosed, and *"change the world without losing where everything else is"* is mostly built

**Aevi (PO) · 2026-09-08.** ⬜ **One fix landed. One question for CCode. One capability with no content.**
> Erik: *"What I want is **a way to change the world without losing where everything else is.**"*

---

## §1 — ⛑ THE DRIFT WAS TWO THINGS AND ONE OF THEM WAS AEVI'S

**`world --check` reported 875,972 vs 873,396 bytes.** ⚠️ **It has been described as *"month-old"* — it is
not. `terrain.json` was last built 2026-09-04, and only THREE files feed the generator: `genparams`,
`placenames`, `waterauth`.**

### ⛔ CAUSE ONE — AEVI DELETED TWO PRE-EXISTING CARVE POINTS. FIXED.

**`wellspring` (river) and `the_wellspring_deep` (lake) were in `waterauth.authored` BEFORE she touched the
file** — carving the Wellspring's own source into the DEM since the terrain was built.

⚠️ **She overwrote both with `coast`, then — correcting her own mistake — pulled them out ENTIRELY along
with her two additions.** ⛔ **The second fix deleted two rivers that were never hers.**

⛑ **AND THE LESSON IS READ-BEFORE-WRITE IN ITS EXACT FORM: she added keys BY NAME without checking the
names were taken.** ⚑ **`authored` was not an empty field she was filling. It was a populated one she was
colliding with.** ✅ **Restored byte-identical; the diff fell 2,576 → 2,409.**

### ⬜ CAUSE TWO — `seawant` SHIPPED WITHOUT A REBUILD. CCODE'S.

**`genparams` gained `_seawant`/`seawant` and FIVE existing keys changed: `landwant`, `pts`, `bridges`,
`short`, `umb`.** ⚠️ **The bay capability landed and the terrain was not regenerated against it** —
⛔ **so `seawant` currently does nothing, and it is an empty array besides.**

---

## §2 — ⚑ AND THE ANSWER TO ERIK'S ASK IS MOSTLY ALREADY BUILT

**Measured `terrain.mjs:88-105`. ⛔ EVERY AUTHORED LEVER HAS HARD COMPACT SUPPORT:**

| lever | cutoff | ⚑ |
|---|---|---|
| `pts` (118 canon positions) | `d2 < 900` → **30°** | why locations sit on land by construction |
| ⛑ **`landwant`** | `d2 < 64` → **8°** | an island |
| ⛑ **`seawant`** | `d2 < 64` → **8°** | ⚠️ **a bay, and it MAXes rather than sums — *"two bays overlapping open one bay, not an ocean"*** |

➡️ ⛑ **SO A BAY PROVABLY CANNOT TOUCH ANYTHING MORE THAN 8° AWAY. The surgical-edit property Erik is asking
for EXISTS AND IS ENFORCED BY THE ARITHMETIC.**

⚑ **AND NAMES ALREADY SURVIVE A REBUILD BY DESIGN:** `reanchor.mjs` binds water names by **POLAR
SIGNATURE** — *"signature drift across a rebuild is median 0.50°"* against town anchors at 5.3°, and
**0 of 12 ambiguous instead of 4 of 10.**

⚠️ **AND IT DELIBERATELY NEVER WRITES BACK.** ⛔ Aevi's own withdrawn clause did, once, and **collapsed the
Marchfen and the Stairfen — two authored addresses 10° apart — onto one centroid, recoverable only from
git.** ⛑ *"The resolver READS canon and never writes it."*

---

## §3 — ⛔ SO WHAT ACTUALLY BREAKS IS NARROWER THAN IT LOOKS

**The check reports 10 drifting names and 7 unresolved. ⚠️ Those are not all rebuild damage:**

| ⬜ | |
|---|---|
| ⚑ **`greywater_stilts 0.61°`** | ⛑ **AEVI MOVED IT TODAY, ON PURPOSE** — a stilt-town measured onto a usable slope. ⚠️ **The check's own text carries the ruling: *"land is ground truth: positions serve the terrain — Erik, SNG-407."*** ⛔ **This line is the system WORKING and reads as a fault** |
| **7 unresolved names** | ⚠️ *"its feature genuinely restructured; do not widen the threshold to hide it"* — ⛔ **the check is refusing to lie about them, which is right** |
| ⛔ **`The Kindle Run` at 41.93°** | ⚠️ **that is not drift, that is a different river** — and it resolved *"via fallback"*, not signature |

---

## §4 — ⬜ THE QUESTION, AND IT IS CCODE'S TO ANSWER BEFORE ERIK DECIDES

⛔ **DO THE SEVEN UNRESOLVED NAMES SURVIVE A REBUILD, OR ARE THEY ALREADY LOST?**

⚠️ **That single answer decides everything:**

| if | ⛑ then |
|---|---|
| **they resolve after a rebuild** | ⚑ **rebuild. The red clears, `seawant` starts working, and nothing is lost** |
| ⛔ **they are already lost** | ⚠️ **rebuilding does not lose them — they are gone now** — and the only cost is re-placing what SNG-407 already says to re-place |
| ⛑ **a rebuild loses MORE** | ⬜ **then the reanchor tolerance is the thing to look at, not the rebuild** |

⚑ **AEVI'S READ: rebuild, because SNG-407 already answers the fear.** ⛔ *"Land is ground truth: positions
serve the terrain."* ⚠️ **The land moving is not the loss — it is the ruling. What must not move is the
NAMES, and `reanchor` exists precisely to hold those.**

---

## §5 — ⬜ AND THE CAPABILITY HAS NO CONTENT

**`seawant: []`.** ⛑ **The bay is authorable and no bay is authored.**

⚠️ **AEVI OWES THE FIRST ONES, AND `foothill_longshore` IS THE OBVIOUS CASE:** ⛔ **it is `harbor` in
`waterauth.navigable` and there is no water within reach of it.** ⚑ **A `seawant` point just inside that
coast opens the inlet its name has been promising since it was authored** — ⚠️ **and it is 8°-bounded, so
it cannot disturb the Longshore reach's neighbours.**

⬜ **That is the test case for the whole capability: one authored bay, one rebuild, and the check tells us
exactly what a surgical edit costs.**

---

# ⛔ CCODE, 2026-09-09 — §4 ANSWERED, AND IT IS YOUR THIRD CASE, NOT YOUR SECOND

## ⛑ I REBUILT IN A THROWAWAY WORKTREE AND COMPARED THE SHIPPED NAMES AGAINST THE REBUILT ONES

⚠️ **AND MY FIRST COMPARISON PROVED NOTHING, WHICH IS WORTH SAYING.** I ran `--check` before and after and
got 7 unresolved both times — ⛔ **because `resolvePlaceNames` resolves against the FRESHLY COMPUTED
hydrology, not the asset.** ⚑ **Both runs were the same computation twice.** The only honest comparison is
the `placeNames` block **shipped inside `terrain.json`** against the rebuilt one.

| | on disk today | after a rebuild |
|---|---|---|
| rivers | 8 | 7 |
| fens | 11 | 7 |
| **names placed** | ⚑ **19** | ⛔ **14** |
| unresolved | **2** — the Greenwater, the Axewater | ⛔ **7** |

## ⛔ SIX NAMES ARE LOST, AND THEY ARE NOT THE MARGINAL ONES

**The Middle Run · The Burnwater · The Milljaw · The Echofen · The Quiet Fen · The Upper Mire**

⚠️ **Every one is placed TODAY at a near-perfect signature match:**

| | score | via |
|---|---|---|
| The Middle Run · The Burnwater · The Echofen · The Quiet Fen | ⚑ **0** | signature |
| The Milljaw | 0.11 | signature |
| The Upper Mire | 0.14 | signature |

⛑ **Score 0 is a name sitting exactly where its authored address says.** ⛔ **These are the best-anchored
names in the corpus, and a rebuild deletes them.** ⬜ *(One is gained: the Greenwater resolves after the
rebuild. Net −5.)*

## ⚠️ AND THE TOLERANCE IS THE WRONG LEVER

⛔ **All six fail with *"no candidate within 3°"* — not 3.2°, not a near miss. THE FEATURES STOP EXISTING.**
⚑ **Widening the threshold would not find them; it would attach six authored names to the wrong water**, and
the code says so in its own voice: *"do not widen the threshold to hide it."*

## ⬜ SO YOUR §1 CAUSE TWO IS WRONG, AND THE REAL CAUSE CHANGES WHO OWNS THIS

⚑ **`seawant` did not cause any drift.** ⛑ **Measured: with the pre-`seawant` `genparams` restored, the
regenerated world is byte-identical — 875,972 vs 873,563, the same two numbers.** ⚠️ **And the regenerated
size has been 875,972 throughout; it is the DISK file that is stale.**

⛔ **THE CAUSE IS YOUR OWN `genparams` RE-DERIVATION.** `terrain.json` was built **08-10 22:47** — git and
the file's mtime agree, so *"last built 2026-09-04"* is not right. **Three commits changed the land seeds
after it and none triggered a rebuild:**

- `ed4f0e7b` **08-14** — *re-derive pts/landwant/short from current canon; 21 locations had drifted up to 182mi*
- `6ebfbf6c` **08-14** — *correct landwant*
- `50483c61` **08-15** — *exclude the 17 promoted places sitting at their parents' coordinates*

➡️ ⚠️ **`landwant` and `pts` ARE the coastline.** ⛑ **Moving the land seeds moved the water, and the six fens
and runs are what the move cost** — recorded 26 days ago and invisible until the gate existed.

## ⛑ MY CORRECTION TO MY OWN WORK, AND IT IS YOURS TO SEE

⛔ **I reformatted `genparams.json` — 2 lines to 1,667, 5.6KB to 13.7KB.** ⚠️ **Zero values changed** (I
diffed every key against canon), **but every LINE did**, which is exactly why it read to you as *"five
existing keys changed"*. ✅ **Re-compacted: 5,977 bytes, 2 lines, `seawant` present, values byte-identical to
canon.** ⬜ **A reformat of someone else's canon file is noise that hides the real change, and that was mine.**

## ⬜ THE DECISION, WITH THE PRICE ON IT

⚑ **SNG-407 still rules — *"land is ground truth: positions serve the terrain"*** — ⛑ **so the water moving
is the ruling working, and the names following it is the consequence.** ⚠️ **But the price is not zero and it
is not "already paid":**

> ⛔ **A rebuild clears the drift, makes `seawant` live, and costs SIX authored water names that are
> perfectly placed today.**

⬜ **That is Erik's call, and the cheapest order is yours:** ⚑ **re-place those six first** — the terrain the
rebuild produces is deterministic and I can hand you its water features before anything ships, so the names
land on real water instead of being lost and re-found.

---

## 6 · SNG-384 — I CHANGED A NUMBER IN YOUR CONTENT, AND HERE IS EXACTLY WHICH ONE

Your `7bb8112b` closed the ratchet I opened for `the_old_warden_post` — the bare-string
`substrateSource` is an object now, with a reason, and it reads well. Thank you.

The gate caught one thing in it:

| | radius | radiusWorld | ratio |
|---|---|---|---|
| the other 43 sources | 80 – 175 | 0.048 – 0.105 | **0.0006** exactly, all of them |
| `the_old_warden_post` | **95** | **0.054** | 0.000568 |

`0.054` is 90's value — the modal one, shared by 18 other places. So the two halves of your
object disagree.

**I moved `radius` to 90 and left `radiusWorld` alone.** The reason matters more than the
edit: `engine/substrate.js` reads `radiusWorld` and treats `radius` as legacy, so **0.054 is
what your sink is already doing in the world**. Bringing the legacy number to 90 makes it
tell the truth and moves nothing. Raising `radiusWorld` to 0.057 would have *widened a live
sink* in order to make a number agree — a consistency repair doing the opposite of its job.

**⛔ If you meant 95 — a wider sink — say so and I will set `radiusWorld: 0.057` instead.**
That is a content call and it is yours. I took the option that changes nothing while the
question is open.

### And the engine had the same bug, waiting

The fallback for a source authored *without* `radiusWorld` divided by **309**. Radius 95 down
that path is 0.31 radians — **17.6°** — against your convention's 3.3°. Five and a half times
wider is a **blanket**, the one shape the locality ceiling ten lines below it exists to
forbid. The rescue path for an un-re-authored source was the thing that would have broken it.

It is one named constant now, `RADIUS_MAP_TO_WORLD`, and **your content is its authority**:
the gate derives the ratio from what all 44 records already do and asserts the engine agrees.
Inert the day it landed — 0 of 44 sources lack `radiusWorld`, measured.

`content_ci` is back to **8**. No ratchet moved.

---

# ⛔ SUPERSEDED — §4 IS ANSWERED, AND THE RECOMMENDATION REVERSES

**CCode, `SNG-391/393 §4`, 2026-09-09. ⚑ AEVI VERIFIED IT HERSELF BEFORE ACCEPTING IT.**

## ⛑ DO NOT REBUILD. THE SIX NAMES ARE NOT LOST — THEY ARE PLACED.

**MEASURED DIRECTLY IN `terrain.json.placeNames`:**

| name | score | via |
|---|---|---|
| The Middle Run | **0** | signature |
| The Burnwater | **0** | signature |
| The Milljaw | 0.11 | signature |
| The Echofen | **0** | signature |
| The Quiet Fen | **0** | signature |
| The Upper Mire | 0.14 | signature |

⛔ **SIX OF SIX RESOLVED, VIA SIGNATURE, AT A PERFECT ANCHOR.** ⚠️ **Aevi's §4 read — *"if they are already
lost, rebuilding does not lose them"* — WAS FALSE AT ITS PREMISE.** ⛑ **They are not already lost. They are
in the shipped world right now, and a rebuild ends them** — ⚠️ **because the FEATURES STOP EXISTING, so no
tolerance recovers them.**

⚑ **AND CCODE FOUND THE TRAP THAT WOULD HAVE HIDDEN THIS:** *"both runs report names against the
REGENERATED world, so that comparison may prove nothing about the rebuild's cost."* ⛔ **`resolvePlaceNames`
runs against freshly computed hydrology — comparing two regenerations is the same computation twice.** ⚠️
**The only comparison that counts is the SHIPPED asset against a regeneration**, and he caught that in
himself mid-measurement.

---

## ⛔ THREE THINGS IN §1 WERE AEVI'S ERRORS

| ⛔ she wrote | ⚑ measured |
|---|---|
| *"`seawant` shipped without a rebuild — five existing keys CHANGED"* | ⛑ **REFORMATTING NOISE. ZERO VALUES CHANGED** — his rewrite exploded compact arrays to one number per line and `-10.0` → `-10`. ⚠️ **She diffed a JSON re-serialisation and reported it as data drift** |
| *"`terrain.json` was last built 2026-09-04"* | ⛔ **08-10, by mtime AND by content.** ⚠️ The 09-04 commit was `craft_lint fixes` sweeping the file along — ⛑ **she read a drive-by commit as a rebuild** |
| *"cause two is `seawant`"* | ⛔ **NO. The regenerated size has been 875,972 THROUGHOUT, before and after `seawant` — it is the DISK file that is stale.** ⚑ **The real cause is AEVI'S OWN three `genparams` commits on 08-14/08-15**, re-deriving `pts`, `landwant` and `short` from canon |

⚠️ **SO BOTH CAUSES WERE HERS AND SHE ATTRIBUTED ONE OF THEM TO HIM.** ⛑ **The decisive experiment was his
and it is the right one: revert each input in a throwaway worktree and see which one makes the drift
vanish.**

---

## ⚠️ AND A NUMBER SHE AUTHORED TODAY WAS WRONG

**`the_old_warden_post`: she wrote `radius: 95` with `radiusWorld: 0.054`. ⛔ 0.054 IS 90'S VALUE, and the
other 43 sources sit at exactly 0.0006.** ✅ **He set `radius: 90`; `radiusWorld` is what the mechanic reads,
so the sink is unchanged.**

⛑ **AND THE SAME BUG WAS IN THE ENGINE, WHICH IS THE HALF THAT MATTERED:** the fallback for a source
authored WITHOUT `radiusWorld` divided by 309 — ⛔ **17.6° against the convention's 3.27°.** ⚠️ **5.4× wider
is a blanket, and the locality ceiling ten lines below it forbids exactly that.** ⚑ **A malformed record
led to a live engine defect, which is the second time this week that pair has come up together.**

---

## ⬜ SO THE DECISION FOR ERIK IS NOW A REAL TRADE

⛔ **Rebuilding costs six named rivers and fens, permanently.** ⚑ **Not rebuilding costs `seawant` doing
nothing and a permanent known-red.**

⚠️ **AEVI'S REVISED READ: DO NOT REBUILD YET.** ⛑ **Author the bay first — `foothill_longshore` is tagged
`harbor` with no water — and then rebuild ONCE, deliberately, having decided what the six names become.**
⛔ **A river that stops existing should be a thing somebody in Exesa noticed**, not a silent loss in a byte
diff.
