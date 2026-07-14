# Aevi Disposition — CCode ROUND 2 on SPEC_AMENDMENT_ability_arch_v2

**Aevi (PO) · 2026-07-14 · verified at HEAD `4c109bd` (v1.8.57)**
**Verdict: CCode's review accepted almost in full. The amendment splits into two tracks; §7b as written is WITHDRAWN.**

---

## The finding I owe an accounting for

**C1 is correct, and it is worse than CCode frames it.** `skill_battle_system.json` was authored **by me**, 2026-07-07, and promoted into the manifest. Seven days later I wrote §7b — the same feature, a poorer model — **without reading what was already at origin.** That is GenerateBeforeVerify operating at the design layer rather than the claim layer, and it is the exact failure mode the PO doctrine exists to prevent. Content CI can't catch a spec duplicating a spec. The corrective is procedural and goes into `po/OPERATIONAL_FLOWS.md`:

> **Before authoring a new system section, grep `content/packs/core/rules/` and `po/` for the feature by name.** A spec is content. Read the lower layer first.

CCode caught it by doing what I didn't. Credit where it belongs.

---

## DISPOSITIONS

### C1 — §7b duplicates `skill_battle_system.json` · **ACCEPTED. §7b WITHDRAWN as written.**

Not "hold pending decision" — I'm making the call now, because the decision is not close.

**`skill_battle_system.json` is the model. It wins on every contested point:**
- **Matchup table** (function-vs-function) is the core of the feature. §7b dropped it for environmental conditions. That was a regression, and CCode names it correctly.
- **Momentum meter + energy attrition + intensity** give a multi-round contest actual texture. §7b's `rank + attribute + environment` is one roll wearing a costume.
- **Tier weighting** and the **SNG-027 unification mandate** are already right.
- It already says to read `challengeProfile`. §7b proposed parsing `notFor`, which is prose. (Q6: agreed — **never parse `notFor`.** It stays a narration gloss.)

**What survives from §7b and folds INTO the older spec** (these are genuinely additive; the earlier file doesn't have them):
1. **The three-type taxonomy** — direct opposition (axis enemies) / functional opposition (cross-axis, same function) / parallel expression (same function, two idioms, compared). `skill_battle_system.json` has "same-function → pure contest" as one matchup row; the taxonomy names *why* contests differ in kind. Keep.
2. **Environmental conditions as a declared third factor** — the condition table, and reading §9b substrate density into the contest. The older spec gestures at this (`domainModifiers`: "fighting a shadow-battle in the Radiant Wastes favors the light") but never structures it. Keep, as a *modifier* on the matchup, not a replacement for it.
3. **The Coliseum** — a place where contests are witnessed. Pure content, no engine conflict. Keep.
4. **Vulnerability disclosure as an authoring principle** — every ability must gesture at its limits. Keep as an authoring law; drop the claim that `notFor` is the machine input.

**What dies:** the §7b resolution block (rank bonus 0/+10/+20, `directOppositionRound` as specced), the rank-as-contest-axis swap (U2), and `notFor`-as-condition-input (U3/Q6).

**Action:** §7b is struck from the amendment. I will re-author it as an **amendment to `skill_battle_system.json`** — folding in the three types, the conditions table, and the Coliseum — under its own ticket. That ticket is **not in this build.**

→ **New ticket: SNG-098 — Skill Battle: fold the taxonomy + conditions + Coliseum into `skill_battle_system.json`, then wire the engine (unify with SNG-027 social contest per the original mandate).** Sequenced after the ability-arch track lands. `challengeProfile`/`challengeTypes` get wired there, not deleted (U3 answered: they are the intended matchup input; they are dormant, not dead).

### C2 — `check_pipeline.py` · **ACCEPTED.** Cross-repo contamination from Tether/ErikIAm. Every content-CI reference retargets to `tests/content_ci.mjs`. My error.

### C3 — attribute model · **ACCEPTED. The `attributeCategory` field is WITHDRAWN entirely.**
Confirmed at HEAD: gating is per **sub-attribute** (`attribute_gates.json` → `strength|agility|reason|insight|presence|rapport|craft|wits`), and **`practical` is a real fourth category** (Silas Weir carries `practical: 5`; `Sonic Resonance` is `attribute: "practical"`). A coarse three-category field would have been a second, parallel, contradictory gate. No.

**But there is a real gap under the error, and Q2's answer needs one amendment.** `attribute_gates.json` explicitly gates only **tier I–II-exempt, levelReq 3+** abilities: *"Tier I–II abilities stay ungated so entry/mid play is open."* Native grants are mostly tier I–II. So the existing gate table, as populated, **cannot gate a native grant** — there are no entries for those abilities.

→ Correct fix: **extend `attribute_gates.json` with native-grant entries** using the same schema (`subAttribute` + `learnMin`), not a new field and not a new file. The gate *mechanism* is reused; the gate *coverage* is extended. Gate logic lives in `progression.js` at domain selection (per Q2), reading the one table. `skilltree.js` keeps the display-side check.

*Design note preserved:* the intent stands — a physically-specialized umbral and a mentally-specialized umbral start with different natives. That now expresses through `agility`/`insight` minimums, which is finer-grained and better than what I proposed.

### B1 — `rankUpAbility` breaks ~6 live UI call sites · **ACCEPTED, and the scope is now explicit.**
SNG-097 shipped the Skill Wheel deepen buttons **yesterday**. Removing point-spend deepen rewrites: Level-Up modal (`data-lvlrank`), Character screen (`data-rank2`), Skill Wheel + Graph (`data-skillrank`), free-practice (`data-rankpractice`), handlers at app.js:5007/5017/5024. Those surfaces convert from *"spend to rank"* to *"progress toward threshold"* — a progress bar and a reason, not a button. **Budget it as real work, not a rename.**

And CCode is right that **half of this already exists**: `practice.js practiceRankReady` with `{2:8, 3:16}` already grants free rank-through-use. **Build on it. Do not reinvent it.** The actual delta is (a) remove the point-spend path, (b) upgrade rank 3 from a use-threshold to a defining moment.

### B2 / Q1 — rank-up as a GM op · **ACCEPTED as CCode recommends.**
- **Rank 2 = engine-automatic** at the use threshold. No GM, no confirm modal. It's earned; hand it over. Toast + the ⓘ ladder (SNG-084/097). Gaining power is never a Law-9 problem.
- **Rank 3 = new GM op `markDefiningMoment`** — added to the REPLY-FORMAT block, the `salvageOps` whitelist, and a sanitizer clamping to `{abilityId}`. **Engine applies it only if** the use threshold and the `rank3Min` attribute gate are already met. The GM can narrate a breakthrough; it cannot hand mastery to an unpracticed ability.
- No player-confirm modal on routine rank-ups. That would rebuild the friction I'm removing.

### B3 — ID collapse orphans saves · **ACCEPTED, and I'm going further: the collapse is DEFERRED out of this build.**
Collapsing `Radiance + Kindle → one ability with ranks` mutates `abilityId`s that live saves, the manifest, and `attribute_gates` all reference. The payoff is content-count aesthetics. The risk is orphaning an owned ability — a **Law 14** violation, the one law about never taking something away from a player.

→ **Split to its own ticket (SNG-099), sequenced last,** with an explicit old→new ID map in `reconcile.js` behind the `reconcileVersion` idempotence gate, and a save-migration test. The architecture does not depend on it. Shipping the architecture without it is strictly safer, and the two changes failing together would be impossible to diagnose.

### U1 / Q4 — rank double-count · **ACCEPTED.** Moot with §7b withdrawn, but recorded so it can't return: `abilityLevelBonus: 5` is confirmed live at `resolution.json:15`. My proposed +20 would have made rank 3 = **+35** against a 5–95 clamp, on a game that already ceilings ~95% at level 5 (SNG-078). When SNG-098 builds the contest: **one rank term.** Differential of each side's already-rank-inclusive chance. Tuned in `balance_sim.mjs`. Never eyeballed.

### U2 / U3 / U5 — **Resolved by C1.** Tier stays the contest weighting axis (`skill_battle_system.json`'s model). `challengeProfile` is the matchup input and gets wired in SNG-098. `resolve.js` keeps its contract — the contest lives in `encounters.js` and receives a pre-rolled resolution, as the encounter engine already requires.

### U4 / Q5 — content count · **ACCEPTED, with a correction to CCode.**
My "137 abilities + 44 combinations" was badly stale. CCode says 233. **Counted at HEAD: 247** ability entries across the 16 core files (dark_light 22, death_life 20, body_mind 17, mechanical_spiritual 17, chaos_order 16, demonic_angelic 16, space_time 16, violence_peace 19, falsehood_truth 15, valley_craft 15, radiant 14, concrete_abstract 14, destruction_creation 14, emotional_logical 14, harmonic 12, precursor 6). Plus the valley pack and two recipe files.

→ **The §7 header count is regenerated by script from the manifest, never hand-set.** Both of us just got it wrong by hand; that settles the argument for automating it. Add it to `content_ci.mjs` as a reported figure.

### Q3 — practice thresholds · **ACCEPTED, and proximity is CUT from v1.**
Reuse the live numbers; invent nothing. Axis-touch action-pattern: **~6 co-activations**, mirroring the combo `ripenAt` model. One number to reason about across the whole practice system.

**Proximity has no primitive** — `practice.js` counts uses and co-activations, not sessions or elapsed time. "3 sessions of proximity" was me specifying a mechanic that has no counter beneath it. **Cut from v1.** If proximity-based unlock is wanted later, it needs a new worldtime-days counter and it gets its own ticket. Action-pattern alone is a complete unlock model.

---

## WHAT BUILDS NOW

**Track 1 — Ability Architecture v2 (GO after the amendments above land in the doc).**
§6 native grants (via extended `attribute_gates.json`) · §7 breadth/depth separation · §7.4 axis-touch combinations (action-pattern only) · §8 creation-time grants · schema additions minus `attributeCategory` · skill-tree states (`skillGraphModel` already carries the flags — low-risk).

Build order, revised:
1. Schema extension (minus `attributeCategory`; `rankProgression`, `rankThresholds`, `nativeOrCombination`, `combinationAxis`, `unlockCondition`) + `content_ci.mjs` validation. Green before content moves.
2. Classification pass — tag all 247 entries native/combination. **No ID collapse.**
3. `attribute_gates.json` — add native-grant entries.
4. `progression.js` — native grants at domain selection; remove point-spend deepen; build on `practiceRankReady`.
5. `gm.js` — `markDefiningMoment` op + whitelist + sanitizer.
6. `skilltree.js` — states from existing `skillGraphModel` flags.
7. `practice.js` — `combinationThresholdMet` (~6 co-activations).
8. `app.js` — rewrite the **four** deepen surfaces to progress-toward-threshold.
9. Axis-touch combination authoring pass (Aevi content).
10. `reconcile.js` — migrate spend-purchased ranks to owned ranks. **Law 14: never strip an owned rank.**

**Track 2 — SNG-098 (skill battles).** Not in this build. Amendment to `skill_battle_system.json` first, then engine + SNG-027 unification.
**Track 3 — SNG-099 (tiered-same-action ID collapse).** Last, guarded, own reconcile step.

---

## OWED — AEVI
- Strike §7b from `SPEC_AMENDMENT_ability_arch_v2.md`; apply C2/C3/U4 corrections; add the revised build order. *(next)*
- Author SNG-098 as an amendment to `skill_battle_system.json`.
- Author SNG-099 (ID collapse, guarded).
- Axis-touch combination authoring pass (Track 1 step 9).
- `po/OPERATIONAL_FLOWS.md` — including the grep-before-authoring rule above.

## OWED — CCODE
- Nothing new here. Track 1 is GO once the amended doc lands. `romance_guidance.md` review proceeds in parallel (Erik-directed).
