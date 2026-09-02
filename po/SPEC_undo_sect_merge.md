# SPEC — Undoing the sect merge: restore per-sect crafts, retire `sectFlavour`

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `round_2_requested`
**Origin:** Erik — *"I'm leaning toward carefully undoing the merge… that would keep the authored writing
to incorporate into the skill that sect is doing without adding complication to our skill set and bringing
uniformity back. I don't want you to do this cavalierly though — let's do it thoroughly like the audit pass."*

⛔ **NOTHING IS TO BE AUTHORED OR EDITED UNTIL CCODE'S ROUND 2 ANSWERS §6.** The 1→N migration is the
blocker, not the writing.

---

## §1 — PWSV

| claim | measured at v1.9.316 |
|---|---|
| crafts carrying `sectFlavour` | **12 of 419** |
| domains they sit in | ⚠️ **Mind (7) and Body (5) ONLY** — the two domains audited first |
| other multi-sect domains carrying it | ⛔ **0** — Light, Dark, Death, Breaking, Building, Order, Span all have none |
| cross-sect near-duplicates corpus-wide | **5 signature collisions in 419**, and on inspection **none is a true duplicate** (`fault_sense` reads structural weakness, `read_the_fight` reads a fight — same `foresee,reveal` shape, different craft) |
| crafts after a full split | **28** (net **+16**) |
| pre-merge originals captured in a revert log | ⛔ **2 of 12** — `perfect_motion`, `second_wind` (SNG-479 only) |

### ⛔ THE FINDING: `sectFlavour` is a merge receipt, not authored variation

The rename map records what merged into each craft. **The sectFlavour lines ARE the names of the crafts
that were merged away.**

| `unbroken_thread` sect line | merged-away craft |
|---|---|
| syllogist — *"THE AXIOM HOLDS"* | `the_axiom_holds` |
| cogitant — *"THE LONG FORM"* | `the_long_form` |
| figurist — *"THE KEPT PATTERN"* | ⚠️ **no rename entry — invented at merge time** |

➡️ **This is what makes the undo tractable: the field is a record of what was lost, in the words it was
lost under.**

### ⚠️ BUT ONLY SEVEN OF TWELVE WERE ACTUALLY MERGED

Stripping the `the_`-de-articling entries (naming SOP §31, not merges):

| craft | real merges in | so the undo is… |
|---|---|---|
| `case_closed` | **5** — stated_case · necessary_case · inescapable_conclusion · closing_argument · proved_position | ⚠️ a genuine restore |
| `physicians_tome` | 3 — correct_protocol · restored_form · correct_restoration | restore |
| `solved_route` | 3 — clear_path · derived_route · patterned_way | restore |
| `unbroken_thread` | 2 — axiom_holds · long_form | restore |
| `perfect_motion` | 2 — soma (part) · whole_act | ✅ **captured in SNG-479** |
| `second_wind` | 2 — soma (part) · long_haul | ✅ **captured in SNG-479** |
| `set_word` | 1 — weight_of_presence | restore |
| `deduced_strike` · `ignore_me` · `ki_wield` · `known_price` · `loose_limbed` | ⛔ **0 — renamed only** | ⚠️ **their `sectFlavour` is authored variation, NOT merge residue** |

⛔ **THOSE LAST FIVE ARE A DIFFERENT PROBLEM AND MUST NOT BE SPLIT BY REFLEX.** Nothing was taken from
them. Splitting them would CREATE crafts the corpus never had — the opposite of restoring uniformity.

---

## §2 — THREE POPULATIONS, THREE DIFFERENT ACTIONS

| # | population | crafts | action |
|---|---|---|---|
| **A** | ✅ **Merged, original captured** | `perfect_motion`, `second_wind` | **Restore from `revert_SNG-479_body_merge.json`**, then reconcile forward against everything ratified since — T5/T6/T7, `tier`, `gainAxes`, per-rank `harmRung` |
| **B** | ⚠️ **Merged, original NOT captured** | `case_closed`, `physicians_tome`, `solved_route`, `unbroken_thread`, `set_word` | ⛔ **RE-AUTHOR.** The originals are gone; only their NAMES (rename map) and their CHARACTER (sectFlavour line) survive. This is authoring guided by evidence, not restoration |
| **C** | ⛔ **Never merged — variation only** | `deduced_strike`, `ignore_me`, `ki_wield`, `known_price`, `loose_limbed` | ⚠️ **DO NOT SPLIT.** Fold the sect line into `description`/`narrationHints` where it adds, drop `sectFlavour`. ⬜ Erik's call whether `known_price` and `deduced_strike` — both carrying three strong sect lines — are exceptions worth splitting anyway |

⚠️ **Population C is where a cavalier pass would do damage**, and it is 5 of the 12.

---

## §3 — THE THREE DENIAL ENTRIES ARE A SEPARATE, SMALLER FIX

`ki_wield`/mason · `loose_limbed`/mason · `ignore_me`/umbral all read *"⚠️ Not this craft…"*.

⛔ **These are `notFor` claims wearing a flavour field.** Both Aevi and CCode surfaced this independently
and neither moved them. ➡️ **Move the substance into `notFor`, where the access model can enforce what the
string currently only asserts.** ✅ Independent of the split; can land first.

---

## §4 — BLAST RADIUS (measured, not estimated)

Every id appears in files beyond the ability packs:

| surface | files | note |
|---|---|---|
| **school curricula** | `mind_schools.json` (7 ids), `body_schools.json` (5) | ⚠️ a school teaching `case_closed` must now teach WHICH one |
| **starting grants** | `native_grants.json` (7), `SNG-101b_native_grants.json` | ⛔ **touches R3 creation directly** |
| **prologue** | `prologue.json` (2) | `perfect_motion`, `second_wind` are prologue grants |
| **recipes** | `combination_recipes.json`, `emergence_recipes.json` | braid inputs |
| **rules** | `traditions.json`, `skill_battle_system.json`, `tempo.json`, `mechanic_effects.json`, `skill_utility_audit.json` | |
| ⛔ **engine code** | `craftmechanics.js` (`physicians_tome`), `progression.js` (`known_price`) | **hard-coded ids** |
| **tests** | `smoke.mjs`, `content_ci.mjs`, `how_it_works.mjs`, `verification_ledger.mjs`, `wiring_audit.mjs`, `sunk_assay_run.mjs` | |
| **schema** | `ability.schema.json` (`ki_wield` as example) | |
| ⛔ **a live save** | `characters/player-s9z9u1/char-mt67f8py.json` holds **`unbroken_thread`** | see §5 |

---

## §5 — ⛔ THE BLOCKER: 1→N MIGRATION HAS NO MECHANISM

`reconcile.js` v31 sweeps `ability_rename_map.json` on every load. ⚠️ **That map is 1→1.** The one
multi-target entry — `soma → second_wind + perfect_motion` — exists, so the SHAPE is expressible, but:

⛔ **A character holding `case_closed` must become the holder of ONE of five restored crafts, and only
their sect can decide which.**

➡️ **Aevi's proposed rule, for CCode to accept or replace:** migrate to the variant matching the holder's
own sect; where the holder's sect has no variant, keep the craft they hold and let it become that sect's
version. **⬜ This is a substrate judgement and it is CCode's to make, not mine.**

---

## §6 — ROUND 2 QUESTIONS FOR CCODE (nothing is authored until these land)

1. ⛔ **Can `ability_rename_map` express 1→N conditioned on the holder's sect?** `soma → second_wind +
   perfect_motion` suggests multi-target parses. Does `reconcile.js` resolve it, or split-and-duplicate?
2. **Is §5's rule right?** Migrate to the sect-matching variant; fall through to the held craft when the
   sect has no variant. If a better rule exists, name it.
3. ⛔ **`craftmechanics.js` and `progression.js` hard-code `physicians_tome` and `known_price`.** What do
   those reads do, and what should they read after a split?
4. **School curricula** — `mind_schools`/`body_schools` reference the merged ids. Does a school teach ALL
   variants, or the one matching the school's sect?
5. ⛔ **`native_grants.json` touches R3 creation.** Does a split change what a level-1 character is offered,
   and does it reopen the tier-1 pool question I already got wrong once?
6. **How much does restoring 16 crafts move `certify_counts`?** ⚠️ Per the coordination rule I proposed
   and broke three times: **announce before you certify.** 419 → 435 if all of A and B split.
7. ⬜ **Anything already true at HEAD.** ⚠️ **I have claimed absence from a partial scan five times this
   session.** Assume this spec contains a sixth.

---

## §7 — ORDER OF WORK, once unblocked

| # | step | why here |
|---|---|---|
| 1 | Move the 3 denials into `notFor` (§3) | ✅ independent, small, both of us already flagged it |
| 2 | Population C — fold sect lines into prose, drop `sectFlavour` (5 crafts) | ⚠️ no new ids, no migration, no blast radius |
| 3 | Population A — restore `perfect_motion`/`second_wind` from SNG-479, reconcile forward | ✅ originals exist; proves the reconcile-forward process on 2 crafts before 5 |
| 4 | Population B — re-author 5 crafts into ~13 (§2) | the real work; every new craft through the full authoring gate |
| 5 | Sweep the blast radius (§4) | schools, grants, prologue, recipes, engine, tests, schema |
| 6 | ⛔ Save migration (§5) | last, and only after CCode's mechanism exists |

⚠️ **Steps 3 and 4 each end with a full gate run against ORIGIN, not against the draft** — the failure
mode from the OI-19 pass.
