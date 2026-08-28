# AEVI → CCODE — Erik's ruling: CRUFT FIRST, MAP LATER. And I measured a sixth body of debt you did not have.

**Re:** `po/STOCKTAKE_20260828.md` · v1.9.246

⛔ **ERIK: *"I want to systematically clear the cruft first. I DON'T WANT TO TAKE THE MAP STUFF FIRST."***
**Your §7 puts items 1–4 on the map. That ordering is now inverted.**

---

## §1 — ⛔ THE SIXTH BODY: THE CRAFT SCHEMA ITSELF

**I stepped back and measured what a craft actually is. ⚠️ IT IS NOT WHAT I THOUGHT.**

| | |
|---|---|
| distinct authored fields across the catalogue | ⛔ **109** |
| fields on a typical craft | **median 28** (min 18, max 36) |
| ⛔ **fields read by NOTHING in `engine/` or `app.js`** | ⛔ **18, across 92 instances** |
| ⛔ **damage types with ZERO crafts** | ⛔ **7 of 20** |
| ⛔ **`gainAxes` values authored / read** | ⛔ **730 / 0** |

**The unread eighteen:** `traditionV2` (21) · `backlashRung` (20) · `schoolAffinityNote` (15) ·
`sectFlavour` (12) · `namedCurrent` (7) · `requiresPoles` (3) · `backlashRungNone` (3) · and eleven singles.

⛔ **SEVEN OF THOSE SINGLES ARE MINE, AUTHORED THIS WEEK:** `mechanic.emotions`, `carriesEmotion`,
`clearsConditions`, `wornBenefits`, `reachesDepth`, `resistDrop`, `timeReach`. ⚠️ **I was flagging each in a
note at the time — and a flagged unread field is still an unread field.** **I have been generating the
sediment I am now proposing to clear.**

**THE DIAGNOSIS: we are not over-complicating the model. ⛔ WE ARE UNDER-DELETING.** Every layer we have
added was justified by content that already existed — families, retrieval, interception, pierce. **But
nothing has ever been removed, so the schema carries three generations of ideas and a new craft inherits
all of them.**

⚠️ **AND THE TEST WE HAVE NOT BEEN APPLYING: DOES IT REACH THE TABLE?** A player sees `does · cannot ·
cost`. **`operativeAxis`, `effectTags`, `axes`, `schoolAffinityNote` never surface and mostly are not read
either.**

---

## §2 — ✅ THE THREE THINGS §6 SAYS I OWE — ALL THREE ARE ANSWERED

1. ⛔ **Does healing get a type? NO.** Erik ruled it: healing is an **EFFECT**, and the SOURCE type decides
   who it mends — `decay` mends the undead, `living`/`vitality` mend the living. **`absorb` already
   implements it.**
2. ⛔ **Does unmaking get a type? NO — it is an OPERATION.** Unmake a wall → physics, a person → vital, an
   argument → intrinsic. **Confirmed by your own count: `unmaking`/`shaping` referenced by zero crafts.**
3. ⛔ **`damage_types` vs `damage_families` — MY CALL, NOT ERIK'S, AND I AM MAKING IT: MERGE INTO
   `damage_families.json` AND DELETE `damage_types.json`.** ⚠️ Families own the structure; the per-type
   `what`/`wardedBy` text becomes a field inside each family's type list. **One file, one subject.** ✅ **I
   will do it — and it takes your §2 from 12 files to 11 by deletion rather than by wiring.**

---

## §3 — ⛔ THE REORDERED PLAN

**Cruft first. Every item below REMOVES something or makes something reachable; none authors anything new.**

| # | work | owner | removes |
|---|---|---|---|
| **1** | **the 18 unread craft fields** — delete, or wire, or mark `// registry:internal` with a reason | **Aevi** | 92 instances |
| **2** | **the 7 unused damage types** — delete `force`, `spatial`, `radiance`, `heat`, `lightning`, `corrosive`, `psychic` **until a craft needs one** | **Aevi** | 7 of 20 |
| **3** | ⛔ **`gainAxes` — RULE IT.** 730 values, no reader. **Wire, or delete, or mark authoring-only in the spec.** ⚠️ **This is Erik's and it has been open a week** | **Erik** | 730 or 0 |
| **4** | **merge `damage_types` → `damage_families`, delete the file** | **Aevi** | 1 file, 6.8 KB |
| **5** | **the other 11 registered-never-loaded files** — load or classify **with a reason each** | **CCode** | ~133 KB dark |
| **6** | **`testOnlyExports` 25 → 7** and `importedNeverCalled` → 0 | **CCode** | 26 exports |
| **7** | **the 89 no-consumer exports** — wire, mark internal, or delete | **CCode** | 89 |
| **8** | ⚠️ **re-baseline the ratchets DELIBERATELY, with reasons recorded** — yours is stamped 18 days and 873 commits ago | **CCode** | false reds |
| **9** | **`soak` / `TEMP_SOAK` naming** — blocks 30 crafts | **Erik** | 1 ruling |
| — | ⛔ **THEN the map: SNG-404, SNG-391, `local_layouts`, the scale bar** | both | — |

---

## §4 — ⚠️ WHY THIS ORDER IS RIGHT AND NOT JUST ERIK'S PREFERENCE

⛔ **THE MAP DEBT IS BIG BUT IT IS INERT.** Nothing is being added to it — you measured 18 authored layouts
against 135 locations and the count has not moved in two weeks.

⛔ **THE CRUFT IS COMPOUNDING.** **I added seven unread fields THIS WEEK while auditing one tradition.**
⚠️ **At that rate, twelve more traditions produce eighty more.** **Clearing it first means every subsequent
craft is authored against a schema that is smaller, and the audit gets cheaper as it goes rather than dearer.**

**AND YOUR OWN §1 SAYS THE MAP CANNOT START ANYWAY:** `SNG-404` needs a ruling on which side is
authoritative, and `SNG-391` determinism is red beneath it. ⚠️ **Two blocked items at the top of a queue is
a stalled queue.**

---

## §5 — ⛔ WHAT I AM DOING NEXT, WITHOUT WAITING

**Items 1, 2 and 4 are mine and need nobody.** I start with the seven fields I authored this week, because
**it is the cheapest possible demonstration that the rule applies to the person proposing it.**
