# SPEC — merge `damage_types` into `damage_families`, but ⛔ NOT YET. Nine crafts must move first.

**Aevi → CCode · 2026-08-28 · Erik: *"if you are absolutely certain about it, proceed."***

⛔ **I WAS NOT CERTAIN, AND CHECKING FOUND TWO THINGS THAT CHANGE THE ORDER. I have touched nothing.**

---

## §1 — ⛔ FIRST: `damage_types.json` MAY NOT BE UNREAD. THERE IS A FOURTH NAME COLLISION.

**`skill_battle.js:357` and `:1090` read `sb.damageTypes`. ⚠️ THAT IS NOT THIS FILE** — `sb` is
`skill_battle_system.json`, which carries its own `damageTypes` block holding `affinities` and `untypedIs`.

⛔ **SAME NAME, DIFFERENT FILE — and I nearly cited those two hits as proof `damage_types.json` was dead.**

⚠️ **FOURTH OF THIS CLASS:** `loadRule("ties")` matching `location_affinities` · `cfg.operativeAxis` vs
`ability.operativeAxis` · `rankDeltas[].axis` vs `mechanic.axis` · this. ✅ **Your `safe_delete.mjs`
receiver-capture is the right tool and this is a case for it.**

---

## §2 — ⛔ THE FILES ARE NOT DUPLICATES. THE GAP RUNS BOTH WAYS.

| | |
|---|---|
| types **defined** in `damage_types.json` | **15** |
| types **placed** in `damage_families.json` | **20** |
| ⛔ **defined but in NO family** | ⛔ **`precursor`, `light`** |
| ⚠️ **in a family but NOT defined** | `force` `spatial` `radiance` `heat` `lightning` `corrosive` `psychic` |

⛔ **AND THE USAGE DECIDES IT:**

- **crafts typed with an undefined word: 0** ✅
- ⛔ **crafts typed with a word that belongs to no family: 9** — **7 `precursor`, 2 `light`**

**`damage_types` is ahead on DEFINITIONS; `damage_families` is ahead on STRUCTURE.** ⚠️ **Merging today
strands nine crafts with a type the family table has never heard of.**

---

## §3 — ✅ THE ORDER, AND EVERY STEP IS ALREADY A DECISION WE MADE

**Both stranded types are already scheduled for removal by rulings that exist:**

| # | step | crafts | authority |
|---|---|---|---|
| **1** | ⛔ **REMOVE `damageType: "precursor"` from 7 crafts** — do not remap it | 7 | **Erik: *"Veil and Precursor Lattice Crystal are METHODS."*** ⚠️ Measured: all 7 *interface, seal, open, perceive, foreclose* — **none deals damage.** The field was set because it existed |
| **2** | **migrate `light` → `radiance`** | 2 | `radiance` is physics (light-matter); **burning is elemental `heat`.** CCode measured 6 of 7 blazeborn harm crafts using burn language while radiant_folk's light is *illumination and being seen* |
| **3** | **delete the 5 no-carrier types** `force` `spatial` `lightning` `corrosive` `psychic` | 0 | ⚠️ **mine, minted into a families table with no craft needing them** |
| **4** | **write `what` + `wardedBy` for `heat` and `radiance`** | 0 | ⛔ **KEEP THESE TWO** — they have known carriers waiting on the blazeborn audit |
| **5** | ✅ **THEN merge and delete `damage_types.json`** | — | 15 definitions become a field on each type inside its family |

⛔ **AFTER 1–4: every type is defined AND placed, and the merge is lossless.** ⚠️ **Before them it is not.**

---

## §4 — WHO DOES WHAT

**Steps 1, 2 and 3 are CONTENT and mine.** ⚠️ **Step 1 is nine crafts across three traditions I have not
audited — `lattice` ×6 and one braid — so I will read each before stripping the field, not batch it.**

**Step 5 is the file surgery and yours**, once I confirm 1–4 are landed.

⛔ **AND THE STANDING ORDER HOLDS: nothing else in §10 moves until this lands, so we never have two damage
vocabularies live at once.**

---

## §5 — WHAT ERIK'S QUESTION CAUGHT

**He asked *"if you are absolutely certain."* I was not.** ⛔ **I had proposed merge-and-delete on the
strength of "families own the structure now" — which is true and was not sufficient.** ⚠️ **Three deletions
today have needed reversing** (`timeReach` was another craft's defining number; the 18 "cruft" fields were
mostly near-misses on live systems; §9 condemned 25 authored rows to remove one derived field).

✅ **The rule I am adopting: before proposing a deletion, MEASURE THE GAP IN BOTH DIRECTIONS.** ⛔ **I keep
measuring what the old thing lacks and never what the new thing lacks.**
