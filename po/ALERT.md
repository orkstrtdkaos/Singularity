# PIPELINE ALERT — Singularity

> **This file carries CURRENT STATUS ONLY.** History lives in `po/results/*` and the graph. *(Per SNG-071: old append-only ALERT archived at `po/archive/ALERT_20260712.md`.)*

**HEAD:** `0c39754` (v1.8.57) · **Authoritative spec:** `SYSTEM_SPEC.md` v2.0 (`round-2-complete`) · **Active build spec:** `po/SNG_UPDATE_v1.9.0.md`
**Process:** SNG-071 two-round cycle. Aevi authors ROUND 1 → **CCode substrate-verifies (ROUND 2)** → Aevi amends + promotes → CCode builds → `complete_pending_review` → **only Aevi closes.**

---


---

## 📄 PENDING CCODE REVIEW — ABILITY ARCHITECTURE v2 (`po/SPEC_AMENDMENT_ability_arch_v2.md`)

**Authored by Aevi 2026-07-14. CCode review required before any implementation begins.**

Covers: (1) native ability grants free at primary-domain selection, attribute-gated; (2) breadth/depth separation — rank progression through use only, no point spend at any rank; (3) two-tier combination model (axis-touch via narrative threshold + point spend; cross-pole braids unchanged); (4) new §7b — skill challenges and direct opposition (three types, environmental conditions, Coliseum); (5) schema additions; (6) module impact table.

**CCode: read `po/SPEC_AMENDMENT_ability_arch_v2.md`, then:**
- Flag anything that conflicts with HEAD or breaks existing module contracts
- Answer the 6 open questions at the bottom of the doc
- Propose rank-bonus values for skill challenge resolution (Q4)
- Check `notFor` machine-readability (Q6)

*Closed-opposite rule (§6) and cross-pole braid system (`combination_recipes.json`) are explicitly unchanged by this amendment.*

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
- `po/OPERATIONAL_FLOWS.md`
- Thin regions: `riven_marches`, `somatic_reaches`, `unspooling` each want ~6 locations
- `po/SPEC_BACKLOG.md` retirement as primary surface (180KB — move active items here)

**CCode:**
- **SPEC REVIEW:** `po/SPEC_AMENDMENT_ability_arch_v2.md` — ability arch v2 + §7b skill challenges. Read + answer 6 open questions before implementation. (d204347)
- ~~`tests/balance_sim.mjs`~~ ✅ delivered SNG-090 Ph A (v1.8.54) — in `npm test`, gates the substrate anchors + reports the SNG-078 ceiling
- §22 debt list from SYSTEM_SPEC R2: slugify in wrong module · worldtime MODE per-player vs "one clock" · `newEncounter` stashes-not-activates · quest stage-conditions advance manually · `narration`↔`effects[]` drift no linter · dead `regenPerRest` key · `parse_probe` can't reach `boot()`
- `withTimeout` pattern on party find/join + roster play/adopt (flagged in SNG-093 commit — non-acute, follow-on)

**Erik:**
- Preview-legs (`po/PREVIEW_LEGS.md`)
- §9 drift call (should a place change you?)
- GH Action for `npm test` (BOUNDARY-2: a gate that only fires when someone remembers to run it is weak against exactly the failure it exists to prevent)
- SNG-076 final leg: confirm no text is cut anywhere in-game (§21: close-on-symptom)
