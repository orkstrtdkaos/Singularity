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
