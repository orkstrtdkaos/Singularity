# PIPELINE ALERT — Singularity## ✅ DOMAIN GROWTH ARC — SHIPPED & CLOSE-VERIFIED (Aevi HEAD audit, v1.8.63)

CCode built all three top-down; **Aevi confirmed at authenticated origin** (not report): `standingWithPeople` · `meetsStandingBar` · `promotionEligible` · `promote` · `acquirable` · `acquireDomain` all present at HEAD. SNG-100b (standing bar, wires the long-fiction accessGates capstone) → SNG-101 (promotion, additive model, foreclosure gates learn + both rank paths, braids exempt, Law-14 throw) → SNG-102 (acquisition, Tier-I entry, closed-opposite never loosened). CCode also fixed a Phase-1 CI bug the classification pass exposed (CI wrongly required `combinationAxis` on the 6 cross-pole braids, which correctly have none — the braid-exemption foundation). Decisions CCode was delegated: standing source = `peopleDisposition`; thresholds in `resolution.json`; region gate loose (no people→region map — flagged); acquisition teacher-bounded. Writeup: `po/results/20260714_domain_growth_arc.md`. **Green.**

---

## 🐛 SNG-103 — GM effective energy cost (specced, awaiting CCode)
`po/SPEC_SNG-103_gm_effective_energy_cost.md`. `abilitiesForGM` prints base `ab.energyCost`, not effective — GM false-flags correct discounted costs (found live: Silas/Palework 6-vs-3). Fix: thread `CONTENT.rules`, interpolate `effectiveEnergyCost`. Guard: never "repair" base down — that's the real corruption. Awaiting ROUND 2.

## 🖥 SNG-104 — Vitals x/y readout + tap/hover detail (specced + STAGED DIFF, awaiting CCode)
`po/SPEC_SNG-104_vitals_readout.md` + `..._STAGED_DIFF.md` (byte-precise drop-in). The Health/Energy bars show **no number** — that's why Erik couldn't tell if energy was depleting faster or he had less. Adds always-visible `current / max` (zero-tap phone answer) + a tap/hover popover reusing the info-dot delegation (phone parity built in). Verified anchors at HEAD.

## ⚖ ENERGY ECONOMY — ERIK'S QUESTION ANSWERED + a balance call for him
Erik felt energy "depleting faster / lower than usual." **Verified: maxEnergy is correct** (100 + 5/level = 125 at L6). The felt effect is real and diagnosed: **ability costs discounted DOWN (most of Silas's land at 3 by L6) but `defaultActionCost` is a flat 5 that never discounts, and recovery is FIXED (sleep +40, breather +10, meal +10) while the pool grows +5/level.** So a night's sleep was 40% of the bar at L1, 32% at L6, falling every level — the refill feels grindier as you climb. Not a bug (every number matches formula) — a design tension. **Erik's call:** scale recovery with level/maxEnergy fraction? → would become **SNG-105** if yes.

---

## ✅ ABILITY ARCH v2 — TRACK 1 ENGINE: CLOSED GREEN (Aevi LLW audit at HEAD, v1.8.60)

CCode shipped across 4 commits; **Aevi verified at authenticated origin, not on report.** All 4 files syntax-clean; behavioral tests pass.

**What audited clean:** `autoAdvancePracticedRanks` (rank 1→2 automatic, level-bar + fork-safe) · `markDefiningMoment` GM op present, in `salvageOps` whitelist, engine-gated on use-threshold **and** `rank3Min` · RIPE FOR MASTERY prompt block · all four deepen surfaces converted — **`rankUpAbility` has zero call sites** (spend path is dead, not merely hidden); progress-line language live · `skillGraphModel` states · `combinationThresholdMet` (~6 co-activation) · CI reports the **247** count and fails legacy `rankProgression:"spend"`.

**The catch I chased (would have passed on paper, failed in play):** the redesign replaced `practiceRankReady` with `practicedForRank`, which reads `rules.practice.useRankThreshold` and **returns false — a silent no-op — if that key is absent.** A smoke test that seeds the rule passes while live play does nothing. **Verified the config is actually shipped and correctly nested:** `resolution.json` → `.practice.useRankThreshold = {2:8, 3:16}`, and `CONTENT.rules` (loaded resolution.json) is what the call sites pass. Chain closes. Confirmed missing-config still degrades safe (no crash, no phantom advance).

**Law 14 by construction — verified, not assumed:** old save with a rank-3 ability and no `practice.uses` object reads correctly, advances nothing, loses nothing. No migration step needed; CCode correctly did not add a dead one.

**Ruling logged (Erik 2026-07-14):** on domain **promotion**, keep the ground you have. Foreclosure is directional — promotion closes the road forward to the newly-opposed pole, never confiscates what was already learned. Feeds SNG-101.

### Owed — Aevi content (engine runs unchanged today; these enrich)
1. Classify 247 abilities native/combination (CI: 0/247; fiction call per ability).
2. Native-gate entries in `attribute_gates.json` (table covers Tier III+ only).
3. Combination authoring — **schema gap CCode found: `unlockCondition` is prose, not engine-computable.** Each authored combo needs a machine trigger (`unlockCondition.components:[ids]` / `viaAbilities:[ids]`) that `combinationThresholdMet` already reads. **Fold into the spec.**
4. Native-grants-at-creation wiring — reading fns built; wiring deferred until natives tagged (testable, not blind). Correct call.

---

## 🟡 ROMANCE (v1.8.59) — STILL AWAITING ERIK'S BROWSER LEG
Engine + SNG-100 fix both audited clean. The one unprovable-without-a-live-model surface remains: **does a flirtatious action get tagged `romantic`, and does the beat block then fire?** → **In play: flirt with an NPC at `R`; confirm the GM stays in the scene, no fade, no hedge, doesn't drop below the rating.** Thin/coy = tag not firing → parse prompt, not register.

---

## 🎯 DOMAIN GROWTH ARC — SPECS DISPOSITIONED, RE-SEQUENCED (Aevi 2026-07-14)

CCode reviewed SNG-101/102 as the dependent pair. **Aevi verified all structural claims at HEAD — review ACCEPTED in full.** Disposition: `po/SPEC_SNG-101_102_AEVI_DISPOSITION.md`.

**Two claims verified true at origin (both my misses, same class as §7b):**
- The standing bar both specs "reuse verbatim" **isn't wired.** `domainAccess` enforces station/ceiling/closed-opposite and *nothing else* — the `accessGates` capstone rule is content-only, and per-people standing doesn't exist as a score (`standingWith` is per-settlement; `peopleDisposition` is display-only). I read a comment as an implementation.
- **SNG-101 §2 was a breaking type change**, not "additive" — `domains.{primary,secondary,tertiary}` are bare strings compared by identity across ~11 sites; the object-swap breaks all of them.

**Resolved:**
- **NEW `po/SPEC_SNG-100b_standing_bar.md`** (`af42971`) — builds per-people standing + durable teacher flag + region-presence, and **wires the unenforced SNG-049/050 capstone bar.** The floor everything above stands on.
- **SNG-101 v2** (`4235065`) — §2 rewritten additive: keep strings, add `foreclosed` + `domainCeilings` + `domainsAcquired`, generalize `domainAccess`. Zero type change, every design goal preserved. Rank-path gate named (`autoAdvancePracticedRanks` + `markDefiningMoment` skip foreclosed **natives**; braids exempt on all three paths). Hard dep on the classification pass — **now satisfied** (247/247 tagged).
- **SNG-102 v2** (`2ece6f1`) — inherits SNG-101's additive `domainsAcquired` (string array), no new schema; standing from SNG-100b.

**Affirmed by CCode (survived the rework):** station-vs-ceiling decoupling · directional keep-the-ground foreclosure · endgame-falls-out-of-geometry · Law-9 offer-vs-commit (the `markDefiningMoment` pattern) · skilltree `state` → `FORECLOSED` extends cleanly.

### 🔢 BUILD ORDER — ✅ ALL SHIPPED v1.8.61–63 · complete_pending_review (results `po/results/20260714_domain_growth_arc.md`)
```
1. ✅ Ability-arch classification pass  (247 → 241 native / 6 combination)
2. ✅ SNG-100b — Standing Bar   v1.8.61 — standingWithPeople (source b: peopleDisposition + peopleStandingBands) · meetsStandingBar WIRED into learnAbility (closes SNG-049/050) · durable teachers{} + regionsKnown{} + markTeacher op. Also fixed the Phase-1 CI braid conflation (6 braids are combination, no combinationAxis).
3. ✅ SNG-101 — Domain Promotion v1.8.62 — additive §2 (strings + foreclosed[] / domainCeilings{} / domainsAcquired[]; zero type change) · domainAccess generalized (ceiling override, acquired iteration, foreclosed-natives-only) · promotionEligible/promote (Law-14 throw-on-lower) · foreclosure gates learn + BOTH rank paths, braids exempt · offerPromotion op · Domains panel + commit modal · skilltree FORECLOSED state.
4. ✅ SNG-102 — Domain Acquisition v1.8.63 — acquirable/acquireDomain (Tier-I entry, forecloses joined antipode; closed-opposite never loosened) · offerAcquisition op · "join a people" cards + modal. No new schema.
```
**25 new smoke tests; fresh-port verified against real content at each version; npm test green; clean boot. Only Aevi closes.**
**Design latitude taken (spec-delegated):** standing = peopleDisposition (b); thresholds in resolution.json not traditions.json (the `rules` bag every gate gets); region gate loose (no people→region content map — flagged); acquisition candidates teacher-bounded.

---

## 🟡 ROMANCE (v1.8.59) — STILL AWAITING ERIK'S BROWSER LEG
Flirt with an NPC at `R`; confirm the GM stays in the scene (no fade, no hedge, doesn't drop below the rating). Thin/coy = tag not firing → parse prompt, not register.

---

## 📋 OWED — AEVI (queue)
- ~~SNG-101 + SNG-102 specs~~ ✅ · ~~SNG-100b spec~~ ✅
- ~~Ability-arch classification pass~~ ✅ **DONE** — all 247 tagged `nativeOrCombination`: **241 native, 6 combination** (3 explicit `cross_pole_braid` + 3 axis-midpoint braid-crafts: `the_whole_act`, `riding_order`, `the_held_breath`). Rule: `cross_pole_braid` tradition OR (`axes==0.0` + `gated:learned` + "braid-craft"). Verified 247/247 at authenticated origin, all files parse. **The SNG-101 braid-exemption dependency is now CLEARED.**
  - ⚑ **One flag for Erik:** `the_last_gift` (rootkin) sits at `axes:0.0` but is death-tending, not a braid — classified **native** (lacks braid-craft declaration + `gated:learned`). Overrule if you read it as a combination.
- SNG-098 (skill battles) · SNG-099 (ID collapse) · `po/OPERATIONAL_FLOWS.md`
