# THE APPARATUS — every harness, what it is for, and whether it runs

⛔ **ERIK, 2026-08-29: *"I want this to be a well oiled factory."*** ⚠️ **A factory you cannot see is not
well oiled.** 82 harnesses across `tests/` and `scripts/`, and before this document nobody could say which
were gates, which were reports, and which had quietly stopped being wired into anything.

```bash
node scripts/apparatus.mjs          # the live inventory
node scripts/apparatus.mjs --md     # …as markdown for §5
node scripts/run_tests.mjs --ratchet    # the gates, blocking only on regression
```

**Last measured: 2026-08-29 · v1.9.259 · 82 files.**

---

## 1 · THE SIX KINDS, AND WHY THE DISTINCTION MATTERS

| kind | n | what it is | belongs |
|---|---|---|---|
| ✅ **GATE** | **24** | asserts something and fails the build | ⛔ **in the runner** |
| ⛔ **GATE-UNWIRED** | **0** | assertions nobody runs | ⛔ **nowhere — this must stay zero** |
| ⚠️ **LIVE-API** | 2 | needs a real API key; costs money; cannot run in CI | run by hand, deliberately |
| ○ **REPORT** | 19 | answers *how often / how hard / at what tier* | in a person's hand |
| 🔧 **TOOL** | 32 | does a job — generates, repairs, measures on demand | invoked, not scheduled |
| · **LIBRARY** | 1 | imported by other harnesses | nowhere |

⛔ **"REPORT" IS NOT A LESSER THING.** A report answers a question a gate cannot ask, and **every balance
ruling this month rested on one** — the rank-delta before/after, the folded-casualty rate, the damage map.
⚠️ **A gate tells you something broke. A report tells you what the game is like.**

⛔ **THE DISTINCTION THAT ACTUALLY MATTERS IS WIRED vs NOT.** On 2026-08-29 the inventory found **four gate
suites that existed, passed, and were run by nobody** — `changeset_check` (11 checks), `dev_world`,
`playthrough_sim`, `verification_ledger`. ⚠️ **A GATE THAT DOES NOT RUN IS WORSE THAN NO GATE: it reads as
coverage while sitting on the shelf.** All four are wired now, and `GATE-UNWIRED` must stay at zero.

---

## 2 · THE GATES THAT CARRY THE MOST WEIGHT

| harness | what it defends |
|---|---|
| `smoke` | ⛔ **~4,400 assertions.** The broad net. Everything ends up here eventually |
| `content_ci` | the corpus is internally consistent — schemas, vocabularies, cross-references |
| `skill_battle_sim` | the two-sided contest and the fog-of-war invariants |
| `how_it_works` | ⛔ **the DOCUMENTATION is true.** Executes `HOW_IT_WORKS`, `FIELD_REFERENCE` and `PLAYERS_GUIDE` |
| `wiring_audit` | ⛔ **the one-way ratchets** — test-only exports, unread rules, orphaned code |
| `save_fixtures` | ⛔ **16 real saves still load, and nothing shrinks or dangles** |
| `changeset_check` | a content rework's declared referrers match the DERIVED ones |
| `import_integrity` | every import resolves; nothing is imported and never called |

---

## 3 · THE REPORTS, AND WHAT EACH ONE IS FOR ASKING

⚠️ **Reach for these when you need to know what the game FEELS like, not whether it is broken.**

| report | the question it answers |
|---|---|
| `rankdelta_report` | what changed when rank deltas connected — **323 of 546 resolutions moved kind** |
| `folded_casualties_report` | how often a folded ally goes down — **and it proved the answer was never** |
| `damage_map` | which damage types each tradition actually deals |
| `rank_curve` | every rank ladder in the game, and which curve fits them |
| `field_atlas` | every authored field and who reads it |
| `tradition_matrix` | which kits perform, at which level, against what |
| `player_lives` · `playthrough_sim` | what a whole life looks like, many times over |
| `success_curve` · `roll_sensitivity` | how the roll behaves as the dials move |
| `contest_math_report` | distributional truth about the contest |

---

## 4 · THE TOOLS

| tool | what it does |
|---|---|
| `run_tests --ratchet` | ⛔ **the gate.** Blocks on REGRESSION against `suite_baseline.json`, never on the standing count |
| `run_tests --rebaseline` | records a deliberate improvement as a visible commit |
| `safe_delete <field>` | ⛔ **triage before deleting anything.** Refuses to output "delete" |
| `field_atlas` · `atlas_inject` | derive the field inventory; write it into `FIELD_REFERENCE` §13 |
| `apparatus` | this document's §5, derived |
| `bump_version` | the version moves with the source it describes |
| `hooks/install.sh` | installs the pre-push ratchet — ⚠️ **git does not version hooks** |
| `engine_map --check` | the module map matches the code |
| `repair_self_variants` · `repair_minted_transit` | one-shot and per-save data repairs |

⚠️ **`turn_flow` · `silas_battle` · `run_warden` · `encounter_types` are DEMONSTRATIONS** — they answer a
question Erik asked by *showing* rather than describing. ⛔ **They are referenced by nothing and that is
correct; deleting them on that signal would be the "unreferenced is not useless" mistake.**

---

## 5 · THE FULL INVENTORY

⛔ **Generated. Re-run `node scripts/apparatus.mjs --md` and paste; do not hand-edit.**

<!-- APPARATUS:BEGIN -->
| harness | kind | assertions | purpose |
|---|---|---|---|
| `tests/smoke` | ✅ GATE | 3521 | — |
| `tests/skill_battle_sim` | ✅ GATE | 217 | SNG-098: the two-sided contest + fog-of-war invariant |
| `tests/content_ci` | ✅ GATE | 183 | SNG-BATCH-10 Phase 4 / SNG-040/064: the content integrity gate |
| `tests/how_it_works` | ✅ GATE | 134 | CCODE-285 |
| `tests/craft_crit` | ✅ GATE | 43 | miss // it and YOU HAVE ONLY MADE CHAOS |
| `tests/wiring_audit` | ✅ GATE | 39 | BATCH-11 §23 |
| `tests/group_capability` | ✅ GATE | 26 | CCODE-307 |
| `tests/damage_sensitivity` | ✅ GATE | 22 | — |
| `tests/growth_sim` | ✅ GATE | 15 | behave sensibly when // run for a whole playthrough rather than one beat |
| `tests/contest_sim` | ✅ GATE | 13 | THE CONTEST AUDITOR: distributional truth about the round engine |
| `tests/changeset_check` | ✅ GATE | 11 | CCODE-204 · SNG-505 Layer 2: a change set is CHECKED, not trusted |
| `tests/save_fixtures` | ✅ GATE | 11 | CCODE-288 |
| `tests/taunt_wiring` | ✅ GATE | 11 | CCODE-306 |
| `tests/roll_sensitivity` | ✅ GATE | 9 | SNG-258 §SENSITIVITY |
| `tests/tradition_matrix` | ✅ GATE | 9 | WHICH KITS PERFORM, AND WHERE? A tradition × level × threat matrix |
| `tests/breadth_currency_sweep` | ✅ GATE | 6 | SNG-260 §C+§D / SNG-261 §A |
| `tests/endgame_scaling` | ✅ GATE | 5 | — |
| `tests/dev_world` | ✅ GATE | 4 | CCODE-94: a DEV WORLD |
| `tests/world_drive_audit` | ✅ GATE | 4 | — |
| `tests/import_integrity` | ✅ GATE | 3 | SNG-353b |
| `tests/staged_crafts_check` | ✅ GATE | 3 | — |
| `tests/parse_probe` | ✅ GATE | 1 | — |
| `tests/playthrough_sim` | ✅ GATE | 1 | SNG-236: THE PLAYTHROUGH AUDITOR |
| `tests/verification_ledger` | ✅ GATE | 1 | SNG-272: WHAT WE BUILT, AND WHAT PROVES IT |
| `tests/live_gm_suite` | ⚠️ LIVE-API | 27 | THE ONE-CLICK LIVE GM SUITE |
| `tests/live_gm` | ⚠️ LIVE-API | 2 | calls the real Anthropic API (costs a few cents) |
| `tests/balance_harness` | ○ REPORT | — | SNG-357 |
| `tests/balance_sim` | ○ REPORT | — | Erik's balance call is pending) |
| `tests/circuit_sim` | ○ REPORT | — | SNG-366 |
| `tests/content_coverage` | ○ REPORT | — | SNG-301: is it authored yet? // // Erik: *"I thought she authored the verbs |
| `tests/content_which` | ○ REPORT | — | assertions that name WHICH, not WHETHER |
| `tests/contest_math_report` | ○ REPORT | — | — |
| `tests/copy_coupling` | ○ REPORT | — | SNG-350 step 2 |
| `tests/deed_ladder_sweep` | ○ REPORT | — | — |
| `tests/holding_effect` | ○ REPORT | — | you were paid for sacrifice, // never for work |
| `tests/player_impact` | ○ REPORT | — | — |
| `tests/player_lives` | ○ REPORT | — | SNG-308: run a lot of lives and see what happens to them |
| `tests/promise_sweep` | ○ REPORT | — | CCODE-91: the GENERAL sweep behind every PromisedButUnread finding |
| `tests/save_history_audit` | ○ REPORT | — | THE SAVES ARE IN THE TREE |
| `tests/strike_mix` | ○ REPORT | — | — |
| `tests/success_curve` | ○ REPORT | — | A REPORT, NOT A GATE |
| `tests/sunk_assay_run` | ○ REPORT | — | SNG-522 · PLAY THE ROOMS |
| `tests/wiring_shape` | ○ REPORT | — | SNG-303: the wiring is checkable, so it does not have to be remembered |
| `tests/world_endgame` | ○ REPORT | — | — |
| `tests/world_presets` | ○ REPORT | — | — |
| `scripts/verify_scene_merge` | 🔧 TOOL+SELFTEST | 8 | BATCH-11 146a live acceptance test (Law 7) |
| `scripts/safe_delete` | 🔧 TOOL+SELFTEST | 5 | CCODE-283 |
| `scripts/bump_version` | 🔧 TOOL+SELFTEST | 3 | SNG-274: the version moves, and it moves in ONE step |
| `scripts/run_tests` | 🔧 TOOL+SELFTEST | 3 | EVERY SUITE RUNS, EVEN AFTER ONE GOES RED |
| `scripts/apparatus` | 🔧 TOOL+SELFTEST | 1 | CCODE-301 |
| `scripts/encounter_types` | 🔧 TOOL+SELFTEST | 1 | CCODE-262 |
| `scripts/engine_map` | 🔧 TOOL+SELFTEST | 1 | BATCH-12 §5 |
| `scripts/prompt_grid` | 🔧 TOOL+SELFTEST | 1 | SNG-435 §B3: the ordering grid |
| `scripts/run_warden` | 🔧 TOOL+SELFTEST | 1 | CCODE-258 |
| `scripts/scale_fidelity` | 🔧 TOOL+SELFTEST | 1 | CCODE-251 |
| `scripts/apparatus_inject` | 🔧 TOOL | — | write the generated inventory into docs/APPARATUS |
| `scripts/apply_promotion_SNG-396` | 🔧 TOOL | — | applies Aevi's two ratifications, and ONLY what they say |
| `scripts/atlas_inject` | 🔧 TOOL | — | regenerate the §13 table inside docs/FIELD_REFERENCE |
| `scripts/audit_images` | 🔧 TOOL | — | — |
| `scripts/axis_worklist` | 🔧 TOOL | — | THE GAIN-AXIS WORKLIST |
| `scripts/bonus_dial` | 🔧 TOOL | — | CCODE-257 |
| `scripts/casualty_sim` | 🔧 TOOL | — | CCODE-304 |
| `scripts/damage_map` | 🔧 TOOL | — | CCODE-280 / AEVI's SPEC_damage_type_system |
| `scripts/derive_location_tiers` | 🔧 TOOL | — | SNG-383 §2 |
| `scripts/effect_audit` | 🔧 TOOL | — | IS EACH EFFECT ACTUALLY WIRED? MEASURED BY BEHAVIOUR, NEVER BY GREP |
| `scripts/extract_generated_places` | 🔧 TOOL | — | SNG-396 §3 |
| `scripts/field_atlas` | 🔧 TOOL | — | CCODE-287 |
| `scripts/folded_casualties_report` | 🔧 TOOL | — | CCODE-298 |
| `scripts/group_fidelity` | 🔧 TOOL | — | CCODE-307 |
| `scripts/op_emission_audit` | 🔧 TOOL | — | because narration succeeds without them, so nothing complains |
| `scripts/rank_curve` | 🔧 TOOL | — | CCODE-284 / SPEC_rank_scaling_derive_with_override §4 |
| `scripts/rankdelta_report` | 🔧 TOOL | — | CCODE-289 |
| `scripts/reachability_audit` | 🔧 TOOL | — | SNG-165 |
| `scripts/rederive_site_tier` | 🔧 TOOL | — | SNG-398 §4 |
| `scripts/repair_minted_transit` | 🔧 TOOL | — | CCODE-10 data repair |
| `scripts/repair_self_variants` | 🔧 TOOL | — | CCODE-04 data repair |
| `scripts/silas_battle` | 🔧 TOOL | — | CCODE-259 |
| `scripts/turn_flow` | 🔧 TOOL | — | CCODE-254 |
| `scripts/vocab_sweep` | 🔧 TOOL | — | NEAR-DUPLICATE TERMS |
| `scripts/world_projection` | 🔧 TOOL | — | project the authored 12D disposition space onto the plane |
| `scripts/worldspace_audit` | 🔧 TOOL | — | — |
| `tests/headless_content` | · LIBRARY | — | CCODE-96: run the app's REAL content assembly from node |
<!-- APPARATUS:END -->
