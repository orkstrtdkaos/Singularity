# BUILD LIST — CCode's road to 2.0.0

**Aevi (PO) · 2026-09-11 · against HEAD `5db8670` · v1.9.453**
⛑ **Every number below was RUN, not remembered** — full suite cloned and executed at HEAD before this was written.

---

## §0 — ⛔ THE HEADLINE: THE SUITE IS RED AT HEAD, AND ONE OF THEM IS A REGRESSION

```
31 suites ran · 27 green · 4 red
```

| suite | state | whose |
|---|---|---|
| `wiring_audit` | ⛔ **REGRESSION — the audit says so itself** | CCode |
| `content_ci` (2 of 8) | registered-but-unread rules files | CCode + Aevi |
| `content_ci` (6 of 8) + `world --check` | the river names — **blocked on Erik's world ruling** | Erik |
| `verification_ledger` | red, undiagnosed | CCode |

⚠️ **`STOCKTAKE_20260911` §1 reports every dial as reaching the game and does not mention that the suite is red.**
That is my correction to make, not CCode's: the stocktake measured *reach* and reported it as *health*. Both
are true and they are different claims — the same shape as the pipeline-stage error I was taught this session.

---

## §1 — ⛔ B1 · THE TEST-ONLY EXPORT RATCHET (the one blocking thing)

```
FAIL  ratchet: testOnlyExports = 16 (baseline 7) — may only go DOWN
      ⚠ 1 failure(s) above are NOT on the known-red list — treat as a regression.
```

`tests/wiring_baseline.json` was last stamped **2026-08-14**. Since then **nine engine functions have
accumulated that only a test can reach.** They pass CI and cannot fire in play:

| module | export |
|---|---|
| `engine/canon.js` | `contributionsBy`, `mergeCanonStores` |
| `engine/company.js` | `liaisonMultiplierFor` |
| `engine/conditions.js` | `clearOnHeal` |
| `engine/gm_registry.js` | `registryKeys` |
| `engine/group.js` | `groupMatchup` |
| `engine/holdings.js` | `debtRefusalAt` |
| `engine/melee.js` | `actingSlots`, `unitComposition` |
| `engine/npcsheet.js` | `leanOf`, `summonSheetFor` |
| `engine/party.js` | `closeScene` |
| `engine/practice.js` | `ripeAxisTouchCombinations` |
| `engine/skill_battle.js` | `isSenseDecl` |
| `engine/skilltree.js` | `nativeGrantsFor` |
| `engine/traditions.js` | `isPoleTradition` |

Plus a note beside it: **98 exports with no consumer at all.**

⛔ **Read the list as fiction, not as code.** It is the party work, the group work, the summon sheets, the
holdings debt, the melee unit composition. **That is the multiplayer and retinue layer, built and unreachable.**

**OUTCOME:** the ratchet reads ≤ 7, honestly.
**EVIDENCE:** `node tests/wiring_audit.mjs` green; for every name above, either a call site in `app.js`/engine, or
its deletion, or a `// registry:internal` marker with one line saying why.
**ACCEPTANCE:** a fresh clone runs `npm test` and `wiring_audit` is green with `0 NOT expected`.
⚠️ **Do NOT re-baseline upward to clear this** — the file says never hand-edit upward and it is right.
Each of the nine is a decision: wire, delete, or mark. **The decision is the deliverable, not the number.**

## §2 — ⛔ B2 · NINE REGISTERED RULES FILES REACH NOTHING

```
FAIL  every registered rules file is fetched, or DECLARED with a reason (SNG-342)
FAIL  CCODE-55: no NEWLY registered core rule is left unloaded (registered ≠ read)
      ability_distribution_target · companion_template · damage_types · death_domain
      energy_costs · healing_intent · mechanic_effects · nexuses · tempo
```

This is §42.1 failure mode two — **registered, unloaded.** `rules_classification.json` exists for exactly this
and **none of the nine are in it.**

⚠️ **`mechanic_effects`, `healing_intent` and `tempo` are the whole SNG-499/500 content layer by §42's own
account.** `nexuses` is on my list and is the reason my nexus work has no surface. `damage_types` is load-bearing
for the damage model we just spent a week on.

**OUTCOME:** every one of the nine is either read by the engine or classified with a reason.
⛔ **The classification is not a formality and it is not mine to rubber-stamp** — `runtime_unwired` in that file
says it plainly: *"a file wired without a consumer is the same failure with more steps."* If the honest answer
is `reference_pending_build`, say so and the debt becomes the unbuilt feature, which is a smaller debt.
**ACCEPTANCE:** `content_ci` green on both gates; no entry added to `rules_classification` without a sentence a
reader would accept.

## §3 — ⛔ B3 · THE GATE §166 EARNED

CCode's own finding, and it is the sharpest thing in the last round:

> *"`§166` read `subAttribute` from a craft while `additionalProperties: false` made authoring one illegal —
> I shipped a reader for a field nobody could legally write."*

**OUTCOME:** a gate asserting **every field the engine reads off a craft is declared in `schemas/ability.schema.json`.**
⚠️ **Generalise it past crafts if it is cheap.** The inverse of this bug is the one that has cost us most —
a field authored at an address nothing reads. **A reader with no legal author and an author with no reader are
the same wall from opposite sides,** and one gate that walks both directions is worth more than two that don't.

## §4 — B4 · `verification_ledger` IS RED AND UNDIAGNOSED

It fails in the run and emits only its own preamble. **OUTCOME:** it passes, or its failure is a named
known-red with a reason. A gate nobody can read the failure of is not a gate.

## §5 — CARRIED FORWARD FROM THE STOCKTAKE (unchanged, still CCode's)

| # | what | note |
|---|---|---|
| 1 | is 34% the right even fight? | per-fight telemetry is the next tool; Erik's ruling, CCode's instrument |
| 2 | diagnose the domain spread (44–91) | offense, ground, defensive reach and harm share all ruled out |
| 3 | `fieldAt` container + `keptBy` + the arc term | ⚠️ **fix `SPEC_BUILD_six_fields` §3 sign error first** |
| 4 | the ranked source | measure-only per Erik; not verified |
| 5 | the field view in the game | Erik on the prototype: *"how to incorporate it into the game"* |
| 6 | mobile holdings | ships and groves that carry you — ⛔ **see §6, this one moved** |
| 7 | the arc stub born whole | `SPEC_generative_arcs_and_bestiary` §3 |
| 8 | Bricke at L23 | content question at 39% exactly as it would be at 0% |

## §6 — ⛔ NEW, AND IT JUMPED THE QUEUE: MOBILE HOLDINGS IS NOW ON THE CRITICAL PATH

Full spec: **`po/SPEC_SNG-537_places_answer_to_terrain.md`**.

Brayden's character is walking toward Longshore believing it is a deep-water port. **It is a mountain town
at +77 above sea level, 416 miles from the nearest sea.** A player is in motion toward a destination that
cannot deliver what he was told, and longship play needs a hull that moves.

⛔ **B6a is small and it unblocks a player:** the place-relocation path in SNG-537 §4 — a location's
`worldPos` must be movable, and a new location mintable at authored coordinates, **without a world rebuild.**
The terrain layer is NOT touched. Erik's ruling: *"the world stays as it is basically."*
**ACCEPTANCE:** move one location, mint one, run `content_ci` geography, and the five geography gates read
exactly as they do today — no new failures, no rebuild, saves intact.

**B6b is mobile holdings proper** (#6 above) — the longship as a holding that carries you. That is the
feature behind the quests and it is the larger build. **Take B6a first; it is the one a player is waiting on.**

---

## §7 — THE CUT

⛔ **My read as PO: 2.0.0 does not cut with §1 red.** A version whose own audit says sixteen engine functions
cannot fire in play is a version that ships a promise it has not read. §1 and §2 are the gate. §3 is what
stops the class recurring. §4 is hygiene. §5 is quality and none of it blocks. §6 is a player in motion.

⚠️ **And the honest headline, which is mine to give (§29.6):** authoring and building have *both* outrun
consumption again — in the same week we named that as the pattern. **The recurring find this session was
authored content with no reader. The ratchet is the same finding wearing the engine's face.**

**Order: §1 → §2 → §6a → §3 → §4 → §5.**

— Aevi, PO
