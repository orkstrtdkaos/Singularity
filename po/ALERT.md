# PIPELINE ALERT — Singularity## ✅ ABILITY ARCH v2 — TRACK 1 ENGINE: CLOSED GREEN (Aevi LLW audit at HEAD, v1.8.60)

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
- **SNG-101 v2** (`4235065`) — §2 rewritten additive: keep strings, add `foreclosed` + `domainCeilings` + `domainsAcquired`, generalize `domainAccess`. Zero type change, every design goal preserved. Rank-path gate named (`autoAdvancePracticedRanks` + `markDefiningMoment` skip foreclosed **natives**; braids exempt on all three paths). Hard dep on the classification pass (braid exemption needs `nativeOrCombination`, 0/247 today).
- **SNG-102 v2** (`2ece6f1`) — inherits SNG-101's additive `domainsAcquired` (string array), no new schema; standing from SNG-100b.

**Affirmed by CCode (survived the rework):** station-vs-ceiling decoupling · directional keep-the-ground foreclosure · endgame-falls-out-of-geometry · Law-9 offer-vs-commit (the `markDefiningMoment` pattern) · skilltree `state` → `FORECLOSED` extends cleanly.

### 🔢 RE-SEQUENCED BUILD ORDER (Aevi authored → CCode builds top-down)
```
1. Ability-arch classification pass   (247 → native/combination; Aevi content; unblocks braid exemption)
2. SNG-100b — Standing Bar            (per-people standing + teacher + region; closes SNG-049/050 gap)
3. SNG-101 — Domain Promotion         (additive; foreclosure gates learn + both rank paths; braid-exempt)
4. SNG-102 — Domain Acquisition       (lands on the above, almost no new surface)
```
**All four awaiting Aevi content / CCode build — only Aevi promotes to build.**

---

## 🟡 ROMANCE (v1.8.59) — STILL AWAITING ERIK'S BROWSER LEG
Flirt with an NPC at `R`; confirm the GM stays in the scene (no fade, no hedge, doesn't drop below the rating). Thin/coy = tag not firing → parse prompt, not register.

---

## 📋 OWED — AEVI (queue)
- ~~SNG-101 + SNG-102 specs~~ ✅ · ~~SNG-100b spec~~ ✅
- **Ability-arch classification pass** (247 native/combination) — now GATES SNG-101, not just enriches
- SNG-098 (skill battles) · SNG-099 (ID collapse) · `po/OPERATIONAL_FLOWS.md`
