# CCode Review — SPEC_AMENDMENT_ability_arch_v2 (ROUND 2, verify-against-HEAD)

Reviewer: Claude Code · 2026-07-14 · HEAD `564c9f3`+ (post-pull) · v1.8.57
Verdict: **build the ability-arch-v2 half after fixes; PAUSE §7b and reconcile it with existing content first.**

The amendment is well-structured and most of the ability-arch-v2 track (native grants, two-tier combinations, skill-tree states, migration discipline) is additive-compatible with HEAD. But it has **one hard conflict** (§7b re-invents an already-authored, promoted system), **three module-contract breaks** it under-plays, a **tooling error**, an **attribute-model mismatch**, and a **rank-bonus double-count** that would break balance. Details below, then the six questions answered.

---

## 🔴 HARD CONFLICTS WITH HEAD

### C1 — §7b duplicates `skill_battle_system.json`, an already-authored & whitelisted (but unwired) system, with a *different, poorer* model
`content/packs/core/rules/skill_battle_system.json` (manifest.json:29, authored by Aevi 2026-07-07, header says *"Flag SNG-045"*) already specifies the exact feature §7b proposes — contested skill-vs-skill, multi-round — but richer:
- a **function-vs-function matchup table** (`reveal +2 vs conceal`, `strike 0 vs shield (blunts)`, `bind +2 vs move`, `reveal(truth) +2 vs conceal(falsehood)`, …) — called *"the core of it"*
- a **momentum meter** (−X..+X, winner shifts by margin), **energy attrition** (war-of-attrition — run out of energy and you lose regardless of rolls), **intensity** (Conserve 0.6× / Standard / Surge 1.6× with backlash), **tier weight**
- an explicit mandate to **unify with the SNG-027 social contest and the duel as flavors of one engine**, and to read the existing `challengeProfile` field for matchup.

§7b instead proposes a **simpler, different** resolution: `rank bonus (0/+10/+20) + attribute + environmental modifier`, a single `directOppositionRound`, and reading `notFor` for conditions. It never mentions `skill_battle_system.json`, the matchup table, the momentum meter, energy attrition, `challengeProfile`, or the SNG-027 unification.

**These are two competing designs for one feature.** Before any build, Aevi/Erik must decide: does §7b *supersede* `skill_battle_system.json` (then delete/retire it), or should §7b *adopt* its matchup/momentum/attrition model? As written, §7b drops the matchup table — the thing the older spec calls its core — in favor of environment conditions. That's a real design regression, not a merge. **This is the single biggest thing to resolve.**

### C2 — `check_pipeline.py` does not exist in Singularity (wrong tool)
Module Impact (line 289) and the Build Order assign the new content-CI validation to `check_pipeline.py`. That's the **Tether/ErikIAm** pipeline tool — it is not in this repo. Singularity's content CI is **`tests/content_ci.mjs`** (+ `tests/smoke.mjs`, `tests/parse_probe.mjs`, `tests/balance_sim.mjs`, run via `npm test`). Retarget every "Content CI (check_pipeline.py)" reference to `tests/content_ci.mjs`.

### C3 — Attribute model mismatch: amendment assumes 3 categories; Singularity has 4 + gates on 8 sub-attributes
§6 native attribute-gating and the schema field `"attributeCategory": "physical" | "mental" | "social"` omit **`practical`** — a whole fourth attribute category (craft/wits) and the home of many crafts (e.g. `Sonic Resonance` is `attribute: "practical"`, harmonic.json:15). Worse, existing ability gating is **per sub-attribute**, not per category: `attribute_gates.json` → `gateFor` returns `{subAttribute: strength|agility|reason|insight|presence|rapport|craft|wits, learnMin, rank3Min}` (skilltree.js:28,37,47). The proposed coarse `attributeCategory` gate would sit in parallel with the existing fine gate and confuse which one decides a native grant. Pick one model (recommend reusing the sub-attribute gate — see Q2). At minimum, add `practical`.

---

## 🟠 MODULE-CONTRACT BREAKS (real, and under-played by the Module Impact table)

### B1 — "Replace `rankUpAbility`" breaks ~6 live UI call sites across three shipped surfaces
`rankUpAbility` (progression.js:107) is the point-spend deepen path and is wired into **app.js** at: `data-lvlrank` (Level-Up modal, SNG-094), `data-rank2` (Character screen), `data-skillrank` (Skill Wheel **and** Graph — SNG-097, shipped **today**), `data-rankpractice` (free practice rank-up), and the handlers at app.js:5007/5017/5024. "Rename/replace with `markPracticedUse`/`markDefiningMoment` (GM-triggered, no point spend)" **deletes the player-facing deepen buttons in all of those.** The Module Impact table lists progression.js + skilltree.js but not the app.js rank-up UIs (beyond a vague "skill tree display"). Whoever builds this must also rewrite those surfaces from *"spend to rank"* to *"show progress toward the use/moment threshold."* Budget for it.

**Also — half of "rank through use" already exists and the amendment doesn't acknowledge it.** `practice.js practiceRankReady` (uses→rank `{2:8, 3:16}`, resolution.json:297) + `rankUpAbility`'s `viaPractice` path already grant free rank-through-use today. The real change is *removing the point-spend option* and *upgrading rank-3 from a use-threshold to a "defining moment."* Build **on** `practiceRankReady`, don't reinvent it.

### B2 — Rank-up is not expressible as a GM op; §7.2/§7b rank-3 "defining moment" is GM-driven (this is Q1, and it's load-bearing)
The GM turn schema (gm.js:34–61) has **no rank-up op**; rank-ups are engine-owned. `newAbility`, `unlockPrecursor`, and `discovery` are the only ability-touching ops. To make rank 3 a "GM call," you need a new op in the schema **and** the `salvageOps` whitelist (gm.js:284) **and** a sanitizer — or keep it engine-detected with GM narration. The amendment flags this (Q1) but the whole "depth through a defining moment" story depends on the answer.

### B3 — "Collapse tiered-same-action abilities" mutates ability IDs that saves, the manifest, and attribute_gates reference
Migration says e.g. *Radiance + Kindle → one ability with ranks.* Characters own abilities by `abilityId` (`character.abilities[].abilityId`). Collapsing two IDs into one **orphans** any save owning the vanishing ID, plus manifest entries and `attribute_gates` keyed by it. The amendment's `reconcile.js` note only covers **rank** migration (spend→use), not **ID** collapse. Add an explicit reconcile step mapping old→new IDs (Law 14: never strip an owned ability — migrate it). reconcile.js has the `reconcileVersion` idempotence gate (reconcile.js:168–187) to hang this on.

---

## 🟡 UNDERSPECIFIED / WILL BITE

### U1 — §7b rank bonus DOUBLE-COUNTS rank and will slam the ceiling (also Q4)
`successChance` already adds `abilityLevelBonus: 5 × rank` (resolution.json:15; resolve.js:35). §7b adds **another** rank bonus `0/+10/+20`. So rank 3 = +15 (existing) **+20 (new) = +35** vs rank 1's +5 — a 30-pt rank swing on a 5–95 clamp. Given **SNG-078** (game already ceilings ~95% at level 5), rank-3 would auto-win most contests. Fix: use **one** rank term — either reuse `abilityLevelBonus`, or make the contest a **differential** of each side's already-rank-inclusive `successChance`. Tune it in `tests/balance_sim.mjs` (the harness exists now) — never eyeball (SNG-078/090 discipline).

### U2 — §7b silently swaps the contest weighting axis from **tier** to **rank**
`skill_battle_system.json` weights contests by **tier** (ability `levelReq` I–V). §7b weights by **rank** (depth 1–3, through use). These are orthogonal (a Tier-I ability at rank 3 vs a Tier-V at rank 1). The amendment changes the axis without saying so. State whether tier still matters in a contest.

### U3 — `challengeProfile` / `challengeTypes` already on every ability, and §7b ignores them
Every ability carries `challengeTypes: [...]` and `challengeProfile: {FIGHT, DUEL, PUZZLE: n}` (harmonic.json:48–56). `skill_battle_system.json` says to read `challengeProfile` for matchup. **No engine code consumes either field today** (grep: 0 hits in engine/). §7b proposes reading `notFor` for conditions instead. Reconcile: is `challengeProfile` the intended matchup input (then wire it) or dead content (then remove it)? Don't add a third parallel system.

### U4 — Content-count baseline (Q5) is already wrong at HEAD
§7 says "~190 post-compression"; Q5 cites "137 abilities + 44 combinations." HEAD actually has **233 ability entries** across the 16 core ability files (reach_dark_light 22, reach_death_life 20, reach_body_mind/mechanical_spiritual 17, …) **plus** the valley pack, and **two** recipe files (`combination_recipes.json`, `emergence_recipes.json`, both whitelisted). Recompute the post-collapse target from 233, not 137, and regenerate the §7 header count by script so it can't drift again.

### U5 — The "modules unchanged" list is wrong about `resolve.js` if the rank bonus lives in successChance
§7b step 3 says the contest *"integrates with §4 successChance formula — substratePenalty applies."* If the contest adds a rank term into `successChance`, its signature changes → **resolve.js is not unchanged.** Decide whether the contest term lives in `successChance` (then resolve.js changes) or in `encounters.js`/a new module (then keep resolve.js's contract; pass a pre-rolled resolution in, as the encounter engine already requires — it never rolls its own d100).

*(Minor: the unchanged/changed lists omit `pacing.js`, `playerprofile.js`, `reputation.js`, `corrections.js`, `companions.js` entirely — not a conflict, just incomplete.)*

---

## ✅ WHAT THE AMENDMENT GETS RIGHT (affirmed against HEAD)
- `duelRound` (encounters.js:33) and `challengeStage` (encounters.js:82) **do** exist — accurate.
- encounters.js takes an **injected pre-rolled `resolution`** and never rolls its own d100 — accurate (nuance: it doesn't import resolve.js; the app injects the receipt — a `directOppositionRound` must preserve that contract).
- `synthesizeChallengeDef` (random_encounters.js:145) is the correct extension point; `challengeStage` already supports staged, cost-bearing, retryable progression. *(Prior art to reconcile: random_encounters.js already has an `"opposed"` routing — direct opposition as a single GM-mediated skill check.)*
- Energy-discount formula (§7.2) matches `effectiveEnergyCost` (progression.js:86) exactly.
- `skillGraphModel` already carries `owned`/`rank`/`locked`/`ripe`/`aspired` flags (skilltree.js:87) → `LOCKED/AVAILABLE/OWNED_1/2/3` derive trivially, no new computation. Low-risk.
- Closed-opposite rule and cross-pole braids (`combination_recipes.json`) left untouched — sound scoping.
- Law-14 backfill discipline for save migration — correct instinct; `reconcile.js` `reconcileVersion` gate is the right hook.

---

## THE SIX OPEN QUESTIONS — answered from HEAD

**Q1 — GM marking a rank; new `markRankUp` op?**
There's no rank-up GM op today (gm.js:34–61); rank-ups are engine-owned (progression.js:107), and free rank-through-use already exists via `practiceRankReady` (uses `{2:8, 3:16}`). Recommendation:
- **Rank 2 = engine-automatic** the moment the use threshold is crossed — no GM, no player confirm (it's earned). Surface as a toast + the ⓘ ladder (SNG-084/097). Gaining power is never a Law-9 "commit before confirm" problem.
- **Rank 3 = a new GM op `markDefiningMoment`** (add to the REPLY-FORMAT block + `salvageOps` whitelist + a sanitizer clamping to `{abilityId}`), applied by the engine **only if** the use-threshold + `meetsRank3Gate` attribute gate are already met — so the GM can't hand rank 3 to an unpracticed ability. Optionally present it as a claimable card (like ripe combos) for a beat.
- Do **not** make routine rank-ups a player-confirmed modal — that recreates the point-spend friction you're removing.

**Q2 — Where does the attribute-category native gate live?**
Neither as written (see C3). Put the **grant-time** native-attribute gate in `progression.js` (alongside `learnAbility`, at domain selection), reading the **same `attribute_gates.json`** everything else uses, expressed **per sub-attribute** — not a new coarse `attributeCategory` field. Keep the **display-side** gate check in `skilltree.js` (`meetsLearnGate`). If category-level gating is truly wanted, define **all four** categories (incl. `practical`) and how each maps to its two sub-attributes.

**Q3 — practice.js threshold numbers.**
Don't invent new numbers — reuse the live ones. Combos ripen at `ripenAt` **6–7** co-activations, branches at **8** uses, aspirations at **10**, rank-through-use at `{2:8, 3:16}` (resolution.json:297; emergence_recipes.json). For axis-touch **action-pattern**, mirror the combo model: **~6 co-activations** of (primary-ability × secondary-axis-tag) — matches Aevi's "5 meaningful uses" and keeps one number to reason about. **Proximity has no existing primitive:** practice.js counts uses/co-activations, not sessions (recordUse, practice.js:16). "3 sessions of proximity" needs a **new counter** (or map "session" → worldtime days) — flag as new work, not a tuning value.

**Q4 — Skill-challenge rank bonus vs the +5/rank in successChance.**
Yes, it double-counts and overshoots (see U1). rank-3 would be +35 total → ceiling-slam given SNG-078. Make the contest a **differential** of each side's already-rank-inclusive `successChance` (don't add a second rank term); if rank should matter *more* in a contest, scale the existing `abilityLevelBonus` weight inside the contest only, and **tune it in balance_sim.mjs.**

**Q5 — Content count after collapse.**
"137+44" is already wrong at HEAD: **233** ability entries in the 16 core ability files (+ valley pack), two recipe files. CCode can produce the exact post-collapse number after Step 2, but the target should be recomputed from **233**, and the §7 header regenerated by script (not hand-set) so it can't drift again.

**Q6 — Is `notFor` machine-readable enough for condition-setting?**
No — it's free-text prose today (harmonic.json:23: *"Fine manipulation (it pushes, shakes, shatters…); silent work…; affecting light or minds."*). Not parseable. §7b needs a structured companion field — **but** the better-fit existing field is `challengeProfile`/`challengeTypes` (already numeric, already on every ability, already what `skill_battle_system.json` says to read for matchup). Recommendation: reuse/extend `challengeProfile`, or add a structured `vulnerabilities: [{condition, effect}]`, and keep `notFor` as the narration gloss. **Do not parse `notFor`.**

---

## RECOMMENDATION — split the amendment into two tracks
1. **Ability-arch-v2 (§6 / §7 / §8 + schema + migration)** — buildable after fixing C2, C3, B1, B3, U4. Mostly additive; the big work is the migration (ID collapse + spend→use rank) and rewiring the three deepen UIs. Ship behind the existing `reconcileVersion` gate.
2. **§7b Skill Challenges — HOLD.** Reconcile with `skill_battle_system.json` + `challengeProfile` + the `"opposed"` routing + SNG-027 first (C1, U1–U3, U5). It's a design decision (which model?), not a build task, until that's settled.
