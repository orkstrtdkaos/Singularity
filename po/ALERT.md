# PIPELINE ALERT — Singularity

> **This file carries CURRENT STATUS ONLY.** History lives in `po/results/*` and the graph. *(Per SNG-071: old append-only ALERT archived at `po/archive/ALERT_20260712.md`.)*

**HEAD:** `abf59d0` (v1.8.60) · **Authoritative spec:** `SYSTEM_SPEC.md` v2.0 (`round-2-complete`) · **Active build spec:** `po/SNG_UPDATE_v1.9.0.md`
**Process:** SNG-071 two-round cycle. Aevi authors ROUND 1 → **CCode substrate-verifies (ROUND 2)** → Aevi amends + promotes → CCode builds → `complete_pending_review` → **only Aevi closes.**

---


---

## 🟡 ROMANCE — SHIPPED v1.8.58, PATCHED v1.8.59. AWAITING ERIK'S BROWSER LEG.

**CCode shipped `romance_guidance.md` v2 clean. Aevi LLW audit at HEAD found one silent-failure bug; fixed and pushed as SNG-100 (`a71c1f2`, v1.8.59 `dc3d9ec`).**

### SNG-100 — `intentTags` cap could silently drop the tag the whole feature hangs on
`sanitizeIntent` truncated `intentTags` to `.slice(0, 6)` **in emission order** — and `romantic`/`flirt` are the **last two of 31 tags** in the parse prompt's vocabulary. `romantic` is the *only* tag in that vocab that gates a document (`app.js buildTurnContext` → `romanceGuidanceDetail` → `CONTENT.romanceGuidance`). A rich beat parsing as `persuade, charm, comfort, rapport, finesse, risky, romantic` puts it at index 6 — **sliced off.** The gate goes false, the craft doc never loads, and **the GM just narrates a worse scene with no error anywhere.**

Every one of CCode's verifications still passed, because they all supply the tag. The tests hand it over; live play makes a model produce it into an unbounded array competing for six slots against tags it was told about first. **Order-dependence on unordered model output — passes on paper, fails in use.**

**Fix:** hoist `romantic`/`flirt` before truncating, in `sanitizeIntent` (gm.js). Cap still honored; non-romantic paths behaviourally unchanged.
**Proven:** old code on that beat → `[persuade, charm, comfort, rapport, finesse, risky]`, doc **does not load**. New code → `[romantic, persuade, charm, comfort, rapport, finesse]`, doc loads. 6/6 behavioral cases pass; `node --check` clean.
**Standing rule:** *if a tag gates a document, it must survive the cap.* Commented at the site so a future vocab reorder can't silently break it again.

### Aevi's audit at HEAD — what's verified without Erik
Registers correct, R+ clause verbatim-faithful **including the specificity guardrail** (*"if the scene could be any two people, you have failed at R+ no matter how far it went"*) · retired *"never explicit mechanics"* wording fully gone · engagement block in the system tier immediately after `## CONTENT CEILING` with the precedence rule · load chain unbroken `state.js:57 → CONTENT.romanceGuidance → app.js:2250 → gm.js:186` · doc whitelisted in the core manifest, 7,833 chars · **floors intact and ceiling-independent** (`art.js` hard-scrubs minors to ≤PG with a forced non-sexual tone; never a softening).

### ❗ ERIK'S BROWSER LEG — the only accepted proof
The one surface neither CCode nor Aevi can exercise: **does the live model actually tag a flirtatious action `romantic`, and does the beat block then appear?** That's a real Claude call. Everything downstream of the tag is verified; the classification itself is the model's job.
→ **In play: flirt with an NPC at `R`. Watch for the GM staying in the scene (no fade, no hedge) and not backing off the rating.** If the narration reads thin or coy, the tag isn't firing — say so and we look at the parse prompt, not the register.

*CCode's own honest note flagged exactly this gap. Correct call.*

---

## 🟢 ABILITY ARCH v2, TRACK 1 — ENGINE SHIPPED v1.8.60 (`abf59d0`) · complete_pending_review
Built in 3 phases (results `po/results/20260714_ability_arch_v2_track1.md`). **Depth is now earned, not bought:**
- **P1 schema + CI** — `state.js` tolerant defaults for the new fields; `content_ci` validates shape-where-present, fails on legacy `rankProgression:"spend"`, reports the count (**247**, script-generated) + classification coverage.
- **P2 depth-through-use (core)** — `autoAdvancePracticedRanks` (rank 1→2 automatic, free, fork-safe) + `markDefiningMoment` (rank 2→3, GM op only, engine-gated on use-threshold AND `rank3Min`). New `markDefiningMoment` GM op (whitelist + sanitizer + rule 19B + RIPE FOR MASTERY block). **All four deepen surfaces converted** spend-button → progress line (Skill Wheel+Graph · Level-Up · Character · play panel) via a shared `rankProgress()`. Built ON `practiceRankReady`.
- **P3 states + combo hooks** — `skillGraphModel.state` (OWNED_1/2/3 · LOCKED · AVAILABLE, derived); `nativeGrantsFor` / `combinationsAvailableFor`; `combinationThresholdMet` (~6 co-activation) + `ripeAxisTouchCombinations`.
- **P4 reconcile — verified UNNECESSARY:** rank lives in `owned.level` in both models, reads optional-chained → old saves unchanged, no rank ever stripped (**Law 14 by construction**). No dead migration added.

13 new smoke tests; fresh-port verified (live auto-rank-2, every surface shows "practiced N/8 → rank 2 lands through use", no buy button, clean boot). **Only Aevi closes.**

**⚠ REMAINING — Aevi content + one blocked CCode step** (engine reads all tags with safe defaults, so the game runs unchanged today):
1. **Classify the 247** `native`/`combination` (step 2) — fiction call per ability. CI: **0/247 classified.**
2. **Native-gate entries in `attribute_gates.json`** (step 3, depends on 1) — table only covers levelReq 3+; Tier I–II natives have no coverage.
3. **Axis-touch combination authoring** (step 9). **Schema gap:** `unlockCondition` is prose and NOT engine-computable — each authored combination needs a machine trigger, `unlockCondition.components:[ids]` (co-activation) or `viaAbilities:[ids]`. `combinationThresholdMet` reads exactly these.
4. **Native-grants-at-creation wiring (§8) — CCode, blocked on 1+2.** Reading fns built; wiring into the creation flow deferred until natives are tagged so it's verifiable, not blind.

**Cut, unchanged:** §7b → **SNG-098** · ID collapse → **SNG-099** · proximity unlock (no counter) · `energyMult` (SNG-090 follow-on).

---

## ✅ ABILITY ARCH v2 — CCODE ROUND 2 DISPOSITIONED (Aevi 2026-07-14, `6c5db33`)

**Disposition: `po/SPEC_AMENDMENT_ability_arch_v2_AEVI_DISPOSITION.md`. CCode's review accepted almost in full.**

**§7b (Skill Challenges) is WITHDRAWN.** It duplicated `skill_battle_system.json` — a system **Aevi authored 2026-07-07** and then re-invented worse, seven days later, without reading it. GenerateBeforeVerify at the design layer. The older spec wins on every contested point (matchup table, momentum meter, energy attrition, tier weight, `challengeProfile`, SNG-027 unification). Folding forward from §7b: the three-type taxonomy, the environmental-conditions table, the Coliseum, vulnerability-disclosure-as-authoring-law. Dying: the rank-bonus resolution block, rank-as-contest-axis, `notFor`-as-machine-input.

**Other dispositions:** C2 accepted (`check_pipeline.py` → `tests/content_ci.mjs`; wrong repo's tool). C3 accepted — **`attributeCategory` field withdrawn**; reuse `attribute_gates.json` per-sub-attribute gates, **extended with native-grant entries** (the existing table only covers levelReq 3+, so natives have no coverage — that's the real gap under the error). `practical` is a real 4th category. B1 accepted, four deepen surfaces budgeted; **build on `practiceRankReady`**, don't reinvent. B2/Q1 accepted: rank 2 engine-automatic, rank 3 = new GM op `markDefiningMoment` (whitelist + sanitizer, engine-gated on thresholds). U1/Q4: `abilityLevelBonus: 5` confirmed — the proposed +20 would have made rank 3 **+35** on a 5–95 clamp. One rank term, differential, tuned in `balance_sim.mjs`. Q3: reuse live numbers (~6 co-activations); **proximity CUT from v1** — no counter exists beneath it. U4/Q5: count at HEAD is **247**, not 137 (Aevi) or 233 (CCode) — **header count regenerated by script**, never hand-set.

**Track 1 — ABILITY ARCH v2: GO for CCode once Aevi lands the amended doc.** Native grants · breadth/depth separation · axis-touch combinations (action-pattern only) · schema (minus `attributeCategory`) · skill-tree states. **No ID collapse in this build.**

→ **SNG-098** (skill battles: amend `skill_battle_system.json` with taxonomy/conditions/Coliseum, then wire engine + unify SNG-027). Not in this build.
→ **SNG-099** (tiered-same-action ID collapse). Deferred last, guarded — mutating `abilityId`s orphans owned abilities (**Law 14**); payoff is cosmetic, risk is not.

---

## ✅ CLOSED GREEN (Aevi verified at HEAD 2026-07-13)

| Item | Closed at | What |
|---|---|---|
| **SNG-BATCH-10** | v1.8.22–25 | Domain gates engine-enforced · starting locations · structured quests + loader · Content CI |
| **SYSTEM_SPEC v2.0 R2 + `effects[]`** | v1.8.26 | Quest outcomes apply machine-readable deltas. BOUNDARY-1 CLOSED. |
| **SNG-056** | ✔ | Location-header desync |
| **SNG-074** | ✔ | Dev off-switch |
| **SNG-075** | ✔ | Encounters fire in narrative play |
| **SNG-076** | v1.8.32 | Authored prose renders in full; model output word-boundary-clamped |
| **SNG-070** | v1.8.30–31 | GM corrections — the game self-heals |
| **SNG-052** | ✔ | Adult-gate checkbox persistence |
| **SNG-067/068/069 P1** | v1.8.33 | Commit boundary — creation never commits before confirm |
| **SNG-077** | v1.8.34 | Gambit hint: GM declares `gambitApt`; dismissal sticks + cooldown |
| **SNG-066** | v1.8.35 | In-game ⚑ Feedback — one tap, auto-context |
| **SNG-080** | v1.8.36 | The world must push — quiet-turn pacing, danger findable on map |
| **SNG-073** | v1.8.38 | The Skill Wheel — skill tree IS the great circle |
| **SNG-081** | v1.8.39 | GM keeps the player's words — scene history is a dialogue |
| **SNG-082** | v1.8.40 | World map: pan/zoom/fit/centre-on-me + data-driven terrain |
| **SNG-083** | v1.8.41 | "Show what you know" — people + rumours, empty state |
| **SNG-085** | v1.8.43 | Repair panel — `corrections.js` exposed directly, no arguing |
| **SNG-086** | v1.8.44 | "Describe yourself" — the third creation door |
| **SNG-087** | v1.8.45 | Cross-device discovery — sync config is the only setup |
| **SNG-088** | v1.8.46 | Gambit builder: 4 fixes + reorder + auto-fill from conversation |
| **SNG-089 Ph1** | v1.8.48 | notFor LAW (CI) + harm rungs → GM + Accords engine ungate |
| **SNG-091** | v1.8.47 | Player's plan request is unconditional — gambitOps ≠ gambitApt |
| **SNG-092** | v1.8.49 | Manifest unification — resolution by name, not position (fixed a LIVE break); +4 reach_* files (20 abilities, 6/7 Accords); Content CI now checks core |
| **SNG-093** | v1.8.50 | GM can never hang the gambit builder — `withTimeout` + `try/catch/finally` |
| **SNG-095** | v1.8.55 | Fix "smartClamp is not defined" — app.js never imported it (broke gambit advice + ⚑ Feedback submission) |
| **SNG-096** | a8ccc988 | Option B breadth pass — **ALL 24 traditions, 8/8 families.** 5 stub reach files authored this session (mechanical_spiritual · dark_light · demonic_angelic · emotional_logical · falsehood_truth). Histogram: 24/24 ✓ |
| **SNG-084 Ph1+2** | v1.8.51 / v1.8.53 | In-context helper text — ⓘ at the walls (capacity · energy · circle) + Ph2 (roll receipt · level/xp · attributes · tiers · quests · companion bond · gambit · map danger). Ph3: locked-ability reasons + precursor/heard-of |
| **SNG-094** | v1.8.52 | Skill learning fixed (a native could learn ONLY Valley Craft — legacy gate null-filtered their own people's craft; domain gate is authoritative now) + a ⬆ Level-Up window (deepen/learn in one place) |

---

## 🔧 SNG-097 — LEARN/DEEPEN FROM THE SKILL WHEEL + UPGRADE LADDER — SHIPPED v1.8.57 · complete_pending_review

Erik-direct request (no Aevi ticket yet — provisional number, Aevi to confirm/renumber/close). The skill **wheel** and **graph** were read-only; now tapping a node lets you **spend skill points right there** and shows an **upgrade ladder** (what each rank grants + cannot, next-to-buy highlighted) so you see what an upgrade does before spending. One shared pure `skillSelectionActions(ab)` + `wireSkillSelectionActions()` reuse the same `learnAbility`/`rankUpAbility` engine paths as the Level-Up modal (no new balance surface, gates can't drift). Live-verified: Learn Staunch 3→2 pts, Deepen 2→1 (rank 2), ladder fills, both wheel+list views, clean console. Results `po/results/20260713_SNG-097-skill-wheel-learn.md`.

---

## 🔧 SNG-090 — SUBSTRATE (SECOND DIFFICULTY MAP) — PHASE A+B SHIPPED v1.8.56 · complete_pending_review

**Phase B shipped (`0c93ff6`, results `po/results/20260713_SNG-090-phaseB.md`):** the substrate now BITES in live play. `successChance` takes a `substratePenalty` — its own already-clamped additive term, **SEPARATE from SNG-079's spectral fit** (never folded). Per ability choice, `substrateForAction()` builds the verdict; `onChoice` **hard-gates** when the craft is off (*"the lattice is too thin — X barely stirs; steel and wit still work"*), else subtracts the chance penalty. Receipts land on the roll (*"the lattice is thin — your craft ran at N%"*) and a **map-details density chip** (thin/even/dense lattice); a **THE SUBSTRATE GM block** narrates the strain/interference without inventing absent power. `carriedSubstrate()` sums item `substrateCharge` + companion `substrateAura` → rescues the starved, worsens the crowded. **Ability actions only** — a weapon swing is substrate-free. Live-verified fresh-port against real region keys: Seraph@Quickwood **13% → gated off**, +carried 0.6 **→ 100% rescued**, Rootkin@Gearlands **69% crowded (not off)**. npm test green, clean boot.

**Phase A shipped (`923a474`, results `po/results/20260713_SNG-090-phaseA.md`):** the foundation — pure `engine/substrate.js` (two-sided band factor: starve below / interfere above / carried rescues-or-worsens), the **balance harness `tests/balance_sim.mjs`** (owed since SNG-078; now in `npm test`, validates the anchors as a gate + reports the SNG-078 ceiling), `CONTENT.substrateModel` load, and a `content_ci` gate that every location resolves a density (all 92 do).

**Deferred (non-blocking):** energy-cost multiplier (`energyMult` is computed but not yet applied to `energyCost` — held pending a balance call on whether thin/crowded ground should also drain faster); SVG ring-overlay on the map (the details-panel chip lands the "overlay" requirement; a full danger-ring-style substrate ring is a refinement). **Needs Aevi content:** the Waystaff (and any charged reservoir) wants a `substrateCharge` property, and living motes a `substrateAura`, before carried-charge bites in real inventories — the engine reads both today; the content fields don't exist yet.

<details><summary>original amendment note</summary>
**Amendment 1 promoted 2026-07-13.** Data file `the_substrate.json` amended at `1e3403e6`. Spec §9b inserted + §4 formula updated at `34fccefe`. **CCode may now build.**

**The two-sided affinity band (design canon — do not collapse):**
- Each tradition has a `substrateBand.center` and `substrateBand.width`. Inside the band: full output.
- **Below band — starvation (steep).** Continuous traditions (high affinity) near-zero in thin ground. Seraph in Quickwood ≈ 13%.
- **Above band — interference (mild).** Returned traditions (low affinity) impaired in dense ground, floor ~60–75%. Never 13%.
- **Carried substrate** (`density + carried`) pushes Returned craft further above affinity in dense ground → makes it WORSE. Why the Rootkin find the Waystaff trade ridiculous. The battery rescues the Continuous from starvation; it cannot rescue the Returned from interference.

**Resolve-chain contract (engine/substrate.js — does not yet exist):**
- `substratePenalty` = additive chance penalty in `successChance`. **Ability actions only** (weapon swings are substrate-free per SNG-089).
- Hard gate at extreme (says why; never silently fails).
- Optional energy-cost multiplier.
- **SEPARATE from SNG-079 spectral-fit term.** Never fold. Both additive, both independently clamped.
- Receipt line required: "The lattice is thin here" / "The lattice crowds your signal" + GM context + map overlay (alongside `dangerLevel`).

**Data:** `the_substrate.json` — `substrateBand` (center + width per tradition), `substrateDensity` per region. Locations derive from `regionId`; optional per-location override. CI: every location must resolve an effective density.

**Build order:** (1) load `the_substrate.json` + CI check → (2) pure `engine/substrate.js`, tuned by `tests/balance_sim.mjs` — **never eyeball the curves** → (3) wire into `successChance` + gate + energy mult → (4) receipts + GM line + map overlay → (5) carried-charge logistics.

*⚠️ Engine code does not yet exist. Build blocked until `tests/balance_sim.mjs` exists and tunes the curves.*
</details>

---

## ⭐ SNG-079 — AXIAL MISALIGNMENT IS THE DIFFICULTY GATE (Erik-designed, specced, unbuilt)

Spectral fit is ±25 and `poleIntensity` varies 0.05→0.98, but the penalty doesn't bite (base chance inflates from level 5 per SNG-078). The model: misfit penalty scales with `poleIntensity × ring-distance from that place's pole` → your antipode region is the hardest place in the world **for you**. Widen the band and lower the base before this gate can hold. Says so when something is beyond you.

**Dependent on SNG-078 balance pass (Erik's call).**

## 🚨 SNG-078 — THE GAME CEILINGS OUT AT LEVEL 5 (analytic, unbuilt — Erik's call)

`attributeMultiplier: 20` vs `attributeSoftCap: 4` → attribute of 4 = 80% before skill/rank/gear/companion/alignment. Very hard tops at 30; a level-5 character sits at 95%. Tension survives only in modifiers (against-grain −25, exhausted −10, novel −15).

**Levers:** lower `attributeMultiplier` (20 → ~8–10) · widen difficulty band · scale with level. **CCode owes `tests/balance_sim.mjs`.** Erik decides.

---

## 🎯 ERIK'S CALL

- **Should a place change you?** Standing in the Redline or the Cogitarium should leave a mark — but the mechanic was never built. The spec claimed it; it doesn't exist. A slow spectrum-pull toward a place's poles (with decay) would make "geography = disposition" true of people, not just terrain. Erik decides: feature or road not taken.
- **SNG-078 balance tuning** — see above.

---

## ⛔ NEXT (build order)

1. **SNG-058 — party leader.** (Was next before the substrate sprint opened.)
2. **SNG-084 Ph3** — locked-ability reasons + `world.precursor`/`heard_of` + "every refusal explains itself". (Ph1+2 shipped.)
3. **SNG-089 Ph2** — Accord waygate-journey acquisition · 12 braids → GM · living treaty as world-event.
4. **SNG-078/079** — balance + axial gate (Erik's call; `balance_sim.mjs` now exists). SNG-090 Ph B added a fresh live term to `successChance` → a good moment to re-tune the whole chain together.
5. **SNG-045 Part A** — duplicate-Erik profile merge. Discovery (SNG-087) mitigates; clean fix is a backup-first guarded `mergePlayers(from→to)`. Aevi to author the reconcile or confirm CCode builds it.
6. **SNG-090 follow-ons** (non-blocking) — apply `energyMult` to energy cost (balance call); SVG substrate ring on the map; Aevi authors `substrateCharge`/`substrateAura` content so carried-charge bites.

---

## 📋 Owed

**Aevi:**
- Option B ability authoring (breadth pass): **COMPLETE ✅** — all 24 traditions, 8/8 families (SNG-096 a8ccc988)
- ~~Amend `romance_guidance.md`~~ ✅ v2 shipped `d53abdd`
- ~~Amend `SPEC_AMENDMENT_ability_arch_v2.md`~~ ✅ v2 shipped `af6080d`
- **SNG-098 spec** (skill-battle amendment: taxonomy + conditions + Coliseum → `skill_battle_system.json`, then wire + unify SNG-027)
- **SNG-099 spec** (tiered-same-action ID collapse, guarded)
- Axis-touch combination authoring pass (Track 1 step 9)
- `po/OPERATIONAL_FLOWS.md` — incl. **grep `content/packs/core/rules/` + `po/` before authoring a new system section. A spec is content; read the lower layer first.**
- Thin regions: `riven_marches`, `somatic_reaches`, `unspooling` each want ~6 locations
- `po/SPEC_BACKLOG.md` retirement as primary surface (180KB — move active items here)

**CCode:**
- ~~`tests/balance_sim.mjs`~~ ✅ delivered SNG-090 Ph A (v1.8.54) — in `npm test`, gates the substrate anchors + reports the SNG-078 ceiling
- §22 debt list from SYSTEM_SPEC R2: slugify in wrong module · worldtime MODE per-player vs "one clock" · `newEncounter` stashes-not-activates · quest stage-conditions advance manually · `narration`↔`effects[]` drift no linter · dead `regenPerRest` key · `parse_probe` can't reach `boot()`
- `withTimeout` pattern on party find/join + roster play/adopt (flagged in SNG-093 commit — non-acute, follow-on)

**Erik:**
- Preview-legs (`po/PREVIEW_LEGS.md`)
- §9 drift call (should a place change you?)
- GH Action for `npm test` (BOUNDARY-2: a gate that only fires when someone remembers to run it is weak against exactly the failure it exists to prevent)
- SNG-076 final leg: confirm no text is cut anywhere in-game (§21: close-on-symptom)
