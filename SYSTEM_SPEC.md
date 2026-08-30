# SINGULARITY — System Specification v2.0

| | |
|---|---|
| **Status** | `round-2-complete + BATCH-11 build` — Aevi (PO) authored the DESIGN + CONTRACT layers; CCode ROUND 2 (v1.8.26) substrate-verified every claim; **BATCH-11 (v1.8.105–118, 2026-07-18) added Law 16 + §23 (the Wiring Contract, machine-gated), SNG-145 intent gates (§11), SNG-148 waygates (§9), the 146a–c/f multiplayer fixes (§18), and 147a/d skill-integrity (ratcheted in `npm test`).** |
| **Supersedes** | System Specification v1.0 (which predates the great circle, traditions, domains, the generative world, shared canon, and ~20 of the 38 engine modules) |
| **HEAD verified** | **v1.9.188** (2026-08-23) · confirmed against origin: **99 engine modules** · **72 core rules files** · 135 locations / 38 regions · 400 abilities / 26 traditions (+3 folk) · 44 combinations · 41 NPCs · 9 companions · 58 random-encounter entries. **Count freshness is now machine-gated** — `tests/wiring_audit.mjs` fails the build when this line drifts from HEAD (the 38/137-era drift, found by BATCH-11 §0, must not recur silently). | <br>⚠️ **TWO ABILITY COUNTS EXIST AND BOTH ARE RIGHT: 378 AUTHORED, 387 LOADED.** ⛔ **The gap is the MARTIAL FLOOR** — the nine crafts authored in `rules/martial_paths.json`, synthesized by `engine/martial.js` and joined to the catalogue by SNG-345 (§37.2 names all nine). **It is NOT "minted braids and generated crafts" — that was my guess, it was wrong, and it survived here for three weeks after §37.2 was corrected. A document that states the true version in one section and the false one in its own header is not a corrected document.** §44.3 counts authored; §37.2 counts loaded, because that is what a reader actually resolves against. Reconciling them to one number would make one of the two claims false.
| **Authoring rule** | Aevi owns §2 (laws), §4–§18 (design + contracts), §21 (process). **CCode owns implementation detail** — module APIs, signatures, dispatch, data flow — marked `[CCODE]`. A claim in this document that contradicts HEAD is a **bug in this document**; report it. |

> **How to read this.** This is the *contract*, not the code. It states what each system is **supposed** to do and what must remain true. Where it says `[CCODE]`, the implementation is authoritative and CCode fills it. Where it states a **law** or a **floor**, the code must conform — not the other way round.

---

## 1. Vision
A single-player-and-family tabletop RPG run by a language model, in a world whose *physics is disposition*. The engine owns truth; the model owns voice. The world grows through play, remembers what you did, and can be shared with the people you love at their own content ceiling.

---

## 2. Design Laws (non-negotiable)

*Laws 1–8 are from v1.0 and stand unchanged. 9–14 are earned — each was learned by a real failure this cycle and is named with the failure so it is not re-learned.*

1. **The model never rolls, never decides outcomes, never edits state freeform.** It narrates engine receipts and proposes typed deltas the engine clamps. Every feature that touches state follows: **GM proposes op → engine validates/clamps → state changes.**
2. **Everything specific is content; the engine stays generic.** Locations, abilities, items, NPCs, events, companions, regions, quests, traditions = JSON/MD in `content/packs/` + a manifest entry. **Engine code never hardcodes content.**
3. **Additive-only schemas.** Every record carries `schemaVersion`. New fields ship with defaults and a `migrate()` step; fields are never repurposed. **Old saves must always load.**
4. **Permanence over novelty.** Scene state, NPC registry, place memory and codex are authoritative fact fed to the GM every turn. Additions are generativity; **contradictions are errors.** On doubt, keep the previous state.
5. **Graceful degradation everywhere.** Any AI failure yields a playable partial (salvage → fallback → error card with retry + preserved input). A hiccup never blocks play or loses player text.
6. **The game learns the player, not just the character.** Behavioural tendencies accrue and feed mechanics — aptitudes with bonuses *and* costs.
7. **Shared-world concurrency law.** A client writes only files it exclusively owns (its character, its profile) plus **append-only** ledgers with SHA-conflict retry. Region state is written only by world-tick consolidation.
8. **Secrets discipline.** Anthropic key and GitHub PAT live in localStorage only, never in a committed file. **This repo never touches the ErikIAm pipeline.**
9. **⛔ NOTHING COMMITS BEFORE THE PLAYER CONFIRMS.** *(Learned: creation imposed the domain, derived abilities from the imposed domain, and assigned a background outright — three symptoms of one missing boundary.)* Any multi-step choice accumulates in a **draft**; everything stays re-choosable; the player confirms; only then does state commit.
10. **⛔ CONTENT THAT IS NOT IN A MANIFEST DOES NOT EXIST — AND THAT MUST BE A BUILD FAILURE.** *(Learned: the manifest listed 6 of 89 locations and the live game ran on **six locations** for weeks, silently.)* The loader is a whitelist. CI must fail on: an unlisted file, a manifest path with no file, **and a `provides.*` key the loader does not handle** (which is how authored quests silently never loaded).
11. **⛔ READ THE SCHEMA BEFORE AUTHORING; READ ORIGIN BEFORE SPECCING.** *(Learned: 66 locations authored against a remembered `poleIntensity` shape; a whole batch specced on a premise that was already false at HEAD.)* Measurement precedes assertion — see §21.
12. **LOWER LAYER WINS.** Runtime > code at origin > ship reports > docs > this document. When they disagree, the lower layer is true and the higher one is a bug. The authenticated API is truth; **the raw CDN lags ~30s and is not.**
13. **THE FLOORS ARE ABSOLUTE AND RATING-INDEPENDENT.** See §17. No setting, ceiling, GM op, correction, promotion or lens may cross them.
14. **A repair is not an advance.** Self-healing tools (§13) fix what is *wrong*; they never grant power. Power comes from play.
15. **⛔ DESIGN CANON LIVES IN CONTENT, NEVER IN THE BACKLOG.** *(Learned: the gambit definition and the multi-mode challenge design were authored on 2026-07-06, lived only in `SPEC_BACKLOG.md`, and were **destroyed by a backlog rewrite**. The number SNG-049 was then reused for something else. Only the content-pack files from that session survived.)* **`SPEC_BACKLOG.md` and `ALERT.md` are for WORK ITEMS. Design canon — definitions, laws, principles, playtest findings — belongs in `content/packs/**` where it is versioned, loaded, and CI-checked.** A finding that exists only in a work-tracking doc is one rewrite from oblivion. Self-healing tools (§13) fix what is *wrong*; they never grant power. Power comes from play.
16. **EVERY CAPABILITY DECLARES THE PATH BY WHICH A PLAYER REACHES IT.** *(Ratified by PM 2026-07-18, BATCH-11. Learned: `challengeTypes` — 45 values across 285 abilities, schema-valid, CI-green, and read by nothing. And the PO, auditing her own engine, could not tell which capabilities reached the GM without reading `app.js` line by line.)* The GM context is a **declared registry** (`engine/gm_registry.js`), not an emergent assembly. A capability ships complete when its whole chain is stated: **engine → consumer → registered → reachable → contracted** (§23). Registration is what makes a capability real to the model, and the build verifies the registry against the code (`tests/wiring_audit.mjs`).

---


## 2b. Cadence Intent (SNG-236 — the game must DO what it intends)
The system's intended EXPERIENCE cadence — how often a player should hit recognizable encounters, meet
epic/legendary figures, be offered growth paths — is documented as TESTABLE intent in **`po/DESIGN_INTENT_cadence.md`**
and VERIFIED by the Playthrough Auditor (`tests/playthrough_sim.mjs`, SNG-236). This exists because a devoted
level-25 character (Silas) reached endgame having met ZERO epics and hit ZERO recognizable encounters — a
built-but-silent failure no test caught. The rule this establishes: **a system that is BUILT must be PROVEN to
OCCUR at its intended rate, per playstyle, in CI — not discovered missing by a human at level 25.** The auditor
reads the live dials (`epicRate`/`minEpicGapDays` in worldtick.js, encounter-weight coefficients in
random_encounters.js) as the single source of truth and fails the build when a cohort falls below an intent
floor. Behavioral complement to the Wiring Contract (§23): the Wiring Contract proves the paths CONNECT; the
Cadence Auditor proves the experience HAPPENS.

## 3. Architecture

```
index.html ──> app.js  (all UI, screens, creation, play loop, sidebars, wheel)
                 │
                 ├── engine/*.js        38 modules, 363KB — pure logic, headless-testable
                 │
                 ├── content/packs/     ALL specific content (JSON/MD) + manifest.json per pack
                 │     ├── core/        rules/ · abilities/ · schemas
                 │     └── valley/      locations · npcs · companions · encounters · items · lore · events · quests
                 │
                 └── schemas/           JSON-Schema for every content type (CI-enforced — §20)
```

**Module map** — format: **OWNS · API (public exports) · NEVER (the load-bearing invariant).** `app.js` is not in this table — it is all UI + the `applyTurn` op-dispatch loop (§11).

> **This table is the INVARIANTS half only, and it is partial.** It once claimed "all 38 engine modules"; the engine reached 53 and the claim drifted silently — the same failure BATCH-11 §0 caught in the header count, one section lower. The number is deliberately gone from this line: a sentence with no count cannot go stale.
>
> **`ENGINE_MAP.md` is the complete, generated map** — every module, with purpose, player-visible surface, imports, dependents, transitive blast radius, content-schema fields read, and GM verbs served. Regenerate with `npm run engine-map`; `npm test` fails if it stops covering the engine. Read it before changing anything with a large `reach`.
>
> The rows below carry what a generator cannot derive: the **NEVER** invariant per module. Modules still missing a row are held by a down-only ratchet (`modulesMissingFromSpecMap` in `tests/wiring_baseline.json`) so the gap can shrink but never grow.

**Resolution / combat**
| Module | Owns · API · Never |
|---|---|
| `resolve.js` | The **only dice** — d100 resolution + success-chance math + energy spend. **API** `spectrumAlignment, successChance, resolveAction, applyEnergyCost`. **NEVER** lets the model roll or decide an outcome. |
| `sense.js` | The graduated "sense of success" (tiered odds read by attunement). **API** `senseTier, renderSense, senseAction`. **NEVER** shows a raw number below the mastery tier. |
| `threat.js` | CCODE-52 THREAT BALANCE. Erik: a region is never one level range — the region supplies the CAST, the player's BUILT POWER supplies the MEAN encounters revolve around, and both tails are real (one you flee, one that retires). **API** `characterPower, threatBand, isRelevantThreat, sampleThreat, applyVariant, DEFAULT_BANDS, DEFAULT_VARIANTS`. **NEVER** an absolute difficulty label — every rung is relative to THIS character. |
| `gambit.js` | Declared multi-step plans (assess → ordered execute → reroll/fallback). **API** `parseGambitSteps, assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM`. **NEVER** rolls its own resolution — every step routes through `resolve.js`. |
| `intensity.js` | Conserve/standard/surge scaling + surge-only backlash. **API** `intensityStep, scaledEnergy, effectMod, autoIntensity, surgeBacklash, shouldBacklash, applySurgeBacklash, intensityOptions`. **NEVER** auto-surges — surge is deliberate. |
| `encounters.js` | Typed multi-round structures (duel/challenge/puzzle) + receipt→state. **API** `startEncounter, encounterDifficulty, duelRound, challengeStage, puzzleAttempt, applyEncounterOps, encounterReceiptForGM, lethalOfferClamp`. **NEVER** rolls the d100 or imposes death (incapacitation only). |
| `random_encounters.js` | Whether/which flavored encounter fires (danger+tag weighted). **API** `dangerOf, isEligible, rollTrigger, pickEncounter, synthesizeDuelDef, synthesizeChallengeDef, buildOffer, canIncapacitate`. **NEVER** resolves an action — reuses `resolve`/`encounters` (its `rng` only picks which/whether). |
| `pressure.js` | SNG-245 the **Pressure Queue** — driven things aimed at the player (a bonded NPC's unmet want reaching out, a threat that comes to your ground), fed by producers from the agendas already in play, that SNG-080's quiet-turn trigger PULLS FROM so the world acts with a real, specific thing not a generic invention. **API** `ensurePressureQueue, enqueuePressure, pullTopPressure, npcWantPressures, threatAttackPressure, wantStalenessThreshold`. **NEVER** queues without a real `subjectId` (aimed, not random); a threat-attack must **become a real defend-encounter** (teeth), never flavor. |
| `affinities.js` | A place's capped effect on the current roll (type-tag + vector). **API** `typeAffinity, effectiveVectorCap, vectorAffinity, locationAffinity, affinityReceipt`. **NEVER** writes character state — pure per-roll modifier, no drift write-back (§9). |
| `companions.js` | Companion bonds + intent-tag assist bonus. **API** `ensureBonds, bondOf, growBond, companionBonus, companionsForGM, activeCompanions`. **NEVER** stores companion defs in the save (save holds only ids; defs are content). |

**Progression / skills**
| Module | Owns · API · Never |
|---|---|
| `progression.js` | Growth — sub-attributes, level-ups, ability learn/rank, **domain gate (§6)**, discovery, backlash. **API** `ensureSubAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, effectiveLevelReq, domainGateFor, applyNewAbility, recordDiscovery, applyBacklash, abilitiesForGM`. **NEVER** mints a permanent named technique except on a crit success. |
| `skilltree.js` | Tiers, attribute gates, breadth-vs-depth cap, the render graph model. **API** `tierOf, gateFor, meetsLearnGate, meetsRank3Gate, breadthUsed, breadthCap, atCapacity, skillGraphModel, skillPointCost, forkFor, setFork, rankExpression`. **NEVER** embeds content specifics. |
| `traditions.js` | The 24-station great-circle geometry (index built from json). **API** `buildTraditionIndex, traditionOf, ringDistance, antipodeOf, neighborsOf, ringOrder, domainAccess, crystallizeDomains, inferDomains`. **NEVER** hardcodes the ring — all geometry read from `traditions.json`. |
| `practice.js` | The use/co-activation ledger + aspirations + emergence offers. **API** `ensurePractice, recordUse, declareAspiration, recordAspirationProgress, aspirationRipe, ripeCombos, ripeBranches, emergenceNoticeForGM, acceptCombo, acceptBranch`. **NEVER** invents emergent content — mints only from authored templates. |
| `evolution.js` | Bond-gated item evolution stages (co-use tally + stage stamp). **API** `coUseKey, recordCoUse, coUseCount, evolutionOf, currentStage, refreshEvolvingItems, noteCoUseAndRefresh, evolvedItemsForGM`. **NEVER** copies stage defs into the save. |
| `playerprofile.js` | Player identity + earned play-style + the content-rating ceiling. **API** `defaultRating, ratingLevel, canSetRating, setRating, setMinorFlag, newProfile, updateProfile, deriveAptitudes, aptitudeMods, profileInsight`. **NEVER** raises the ceiling to R/R+ without the adult gate (§17). |
| `standing.js` | How a PEOPLE regards you (BATCH-12 §3), as distinct from a settlement's deed-reputation. **API** `seedStandingAtCreation, accrueStandingForDays, companyStandingRates, applyStandingOps, standingFor, standingRoster, standingForGM, dripScale`. **NEVER** lets the model adjudicate — `standingOps` is REPORTED by the GM and clamped twice by the engine (±3, and never across a band edge). |
| `reputation.js` | The append-only deeds ledger; reputation is a **view** over deeds. **API** `recordDeed, standingWith, knownTags, reputationSummary`. **NEVER** treats reputation as source of truth — deeds are. |
| `backfill.js` | One-time retroactive XP/bonds/practice credit for pre-feature saves. **API** `needsBackfill, activitySpine, runBackfill, summaryLines`. **NEVER** fabricates history — derives from durable state; idempotent by `backfillVersion`. |
| `reconcile.js` | Versioned idempotent migration steps to current schema. **API** `topReconcileVersion, reconcile, reconcileContent` (`CHARACTER_STEPS`, `CONTENT_STEPS`). **NEVER** removes/downgrades — additive; grants are **offered, not imposed** (Law 9). |

**World / generation**
| Module | Owns · API · Never |
|---|---|
| `generate.js` | The single generative mint path (validate → repair/stub → resolve-before-mint → stamp → persist) + weight/tier scoring. **API** `generate, stubEntity, repairEntity, enforceFloors, stampGenerated, persistGenerated, recordAttention, effectiveWeight, recomputeTier, isSurfaceable, livingWorldForGM, nominationsFor, buildGeneratePrompt`. **NEVER** halts a turn or throws — returns a record or null. |
| `genschema.js` | A dependency-free JSON-Schema validate+repair subset. **API** `validate, missingRequired, defaultFor`. **NEVER** implements full draft-2020-12 — only the subset the schemas need. |
| `roundreceipt.js` | The round receipt the player reads and the GM narrates FROM. **API** `roundVerdict, gainPhrase, interactionClause, receiptLine, SB_VERB, SB_DEFENSIVE`. Pure — meter word and meter max are injected. **NEVER** lives inside app.js again: it shipped a permanent "neither gains — it's even" on every round of every fight precisely because it was untestable there. A reporting layer is a CLAIM about the rules, and a claim no test can read is a claim nobody is checking. |
| `worldtab.js` | THE WORLD tab's markup, as a pure function of world state. **API** `worldTabHtml`. Takes `{arcs, foot, name, tabBar, esc}` and returns HTML; `esc` and the tab bar are INJECTED so the app keeps one escaper. **NEVER** back inside app.js, for roundreceipt.js's exact reason: a render buried in the app can only be tested by pattern-matching its source, which proves the words are present and proves nothing about whether it runs — ten source gates passed while the template had never executed, and the first test that actually ran it found a crash on any world that had not ticked yet. |
| `ladder.js` | SNG-356: the AUTHORED sub-attribute ladder's derived grants. **API** `ladderGrantsOwed, applyLadderGrants, ladderRoll, ladderRungLine, poolSubs`. Every rank's grant is authored in `rules/sub_attribute_ladder.json`, never computed here — Erik retunes without a build and the player reads the same table the engine pays from. ⛔ PAID AGAINST A HIGH-WATER MARK (`character.ladderPaid[sub]`): `cumulative[rank]` is the TOTAL owed for standing there, so a naive application re-adds it every pass and inflates a pool without limit. That also makes the RETROACTIVE case (Erik's ruling) the ordinary case starting from zero. Both doors pay — `spendSubPoint` in play, reconcile 29 on login — because a grant that only arrives via migration is one the player never sees land. ⚠️ **POOLS ONLY**: four subs are `kind: "rate"` (defenseBonus, senseTier, reputationGain, critChance) and a rate is READ where it applies; banking one into a stored field is writer-with-no-reader inverted. |
| `martial.js` | SNG-345: the martial FLOOR. **API** `martialAbilityRecords, baselineAbilityIds, formKitFor, grantMartialKit, isBaselineAbility, chosenAbilities`. Erik: "every character can defend itself, no build required" — four free zero-cost abilities (brace/strike/break away/raise the alarm) at creation and on login, plus a form kit. ⛔ DERIVED from `rules/martial_paths.json`, never copied into an abilities pack: two hand-synced copies of one kit is the SNG-344 crosswalk drift before it happens. ⚠️ The floor NEVER counts against breadth capacity — 4 free abilities against a level-1 cap of 2 would leave every character born at double capacity, unable to learn until level 5. ⚠️ `character.form` is FREE PROSE, so a form kit resolves by an UNAMBIGUOUS alias match on WORD BOUNDARIES and REFUSES on 2+ (an `includes` match made "ent" hit "gentle"/"present"). |
| `worldglobe.js` | SNG-390: the world as a globe, READ-ONLY. **API** `decodeTerrain, sampleAt, hillshade, colorAt, groundFactorAt, project, unproject, visiblePins`. Renders the derived terrain (`content/packs/core/world/terrain.json`) as an orthographic sphere in place of the old five-column region-card grid. ⛔ A RE-IMPLEMENTATION, NOT A PORT: Aevi's prototype loads Three.js from cdnjs and this app has ZERO external runtime dependencies — a globe that needs a CDN stops working on a plane, in a tunnel, and the day cdnjs is down. An orthographic globe needs no 3D library; `project`/`unproject` are exact inverses (round-trip error 1e-12) and the hillshade carries the relief the Lambert material was carrying. ⚠️ READ-ONLY BY CONSTRUCTION: `worldPosOf` is INJECTED, so this module never reads a location's position itself and cannot become the second source of position Aevi warned about. ⛔ AND IT DOES NOT RESTATE THE RULES: the prototype hard-codes `BANDS` and a 0.6 crowd floor — the `map.x/y` failure class inside the file that names it — so `groundFactorAt` takes the engine's own `bandFactor` and the live `sourceBands` entry, and the map cannot tell a different story than a craft's verdict. ⚠️ THE TERRAIN IS BAKED OUTPUT WITH NO GENERATOR (SNG-390 §1 asked for one; the delivery was a viewer and a raster), so it cannot yet be re-derived from canon. |
| `holdings.js` | SNG-358: what you hold in the late game. **API** `addHolding, advanceHolding, holdingNews, holdingsForGM, unstewardedHoldings, HOLDING_KINDS, CONDITIONS`. ⛔ A CONDITION THAT MOVES BOTH WAYS (failing · strained · holding · thriving), never a counter to a terminus — a smithy does not finish being a smithy, and `advanceAssignment`'s monotonic `progress` + terminal `done` would have retired a post the moment its steward succeeded. ONE base record discriminated by `kind`, on Erik's own evidence: his live charge reads "the Raven's Home POST — laboratory, workshop, Watch, FORGE" — a post that CONTAINS an enterprise. ⚠️ An UNKEPT holding slides one rung per pass and can never thrive, which is what makes it a claim on attention rather than scenery — and what gives a steward's departure (SNG-355) a cost. ⛔ `household` is NOT a kind. Aevi: stake and obligation, never a stat line — the moment a pregnant wife grants a combat bonus the game has said something false. |
| `incapacitation.js` | SNG-309: what happens when the player goes down. **API** `incapacitationOutcome, aggressorKind, playerDeathState, deathStopsPlay, deathLine, wireDeathModel, INCAP_OUTCOMES`. `health <= 0` → INCAPACITATED → an OUTCOME decided by who put you there and who was with you: revived · spared · left_for_dead (your gear is gone) · slain. ⚠️ **EVERY aggressor kind can kill** — before this, 2 of 19 encounter defs carried `lethal`, so a player could be killed by a boar or a greatcat and by nothing else. ⛔ INTENT, NOT MORALITY (SNG-280): an assassin finishes you because that was the errand; a heroic and an abyssal duelist behave identically. ⛔ A slain player enters the SAME `death.js` ladder as any figure — `character.dead` is the TERMINUS and belongs only to a SEALED death. |
| `arceffects.js` | SNG-273: what an advanced arc DOES. **API** `activeArcEffects, craftCostFactor, craftCostNote, travelCostFactor, encounterBias, npcMoodLines, effectsInPlainWords, EFFECT_CONSUMERS`. A stage carried only narration, so the whole world-engine chain resolved into a number that changed a sentence. THE RULE: a stage changes THE WORLD, never taxes the sheet — grammar-work costing double is a world you can route around; −1 to rolls is a punishment. `EFFECT_CONSUMERS` is the register of which kinds can actually land; a kind with no consumer is surfaced marked `inert` rather than left looking live. ⚠️ It must be kept honest in BOTH directions — `priceShift` sat at `null` here long after SNG-302 gave it one, and `npm run coverage` repeated the stale claim on every run. **Every effect kind currently has a consumer.** |
| `titles.js` | SNG-287: a name that comes from the MATERIAL, not a menu. **API** `titleFor, SLOT_SOURCES, UNFILLABLE_SLOTS, unusablePatterns`. A title is pattern + slots and **every slot must be fillable from a real record or the pattern is not used** — no arc moved, no {ARC} title. That rule is the module: a title reaching for a slot with no source is not flattering, it is FALSE (BOUNDARY-1). ⛔ SNG-280: which face of a two-faced pattern lands is read off the SIGN of the deeds, so the Maw earns a name as readily as the Rootkin. ⚠️ {ROAD}/{CRAFT}/{FOE} have no source yet and are declared unusable rather than left looking live. |
| `whois.js` | SNG-299: who or what is that name, and where do I read more. **API** `knownIndex, whoIs, TIER_MEANING`. Answers ONLY from what the world recorded — rung from `tierOf`, cares from `currentCares`, title from `figureTitles`, fate from `epicStatus`. **Returns null when nothing is known and the name is then not made clickable**: a popup reading "a figure of the valley" is worse than none, because it promises a lookup and delivers a shrug. The codex button appears only where a codex page exists. |
| `economy.js` | SNG-302: what a thing is worth HERE. **API** `priceOf, priceLine, shiftNeed, regionDemand, economyCoverage`. `price = worthBand × need × scarcity`, and **NEED DOMINATES** — `none` is a hard zero, because nobody bids on what nobody uses. The IRREPLACEABLE is REFUSED a price rather than given a large one. Closes `priceShift`, inert since SNG-273 for want of anything that could compute a price. ⚠️ The second axis is not live: 30/30 items carry a worth band, 0/30 a goods category, so no region table is reachable — declared in `economyCoverage`. |
| `earnedpower.js` | SNG-251 §2c/§4: the earned-power economy for item evolution — a grant ceiling that is a **function of level + craft rank** (not a flat cap), a ~1/day-per-item evolution budget, and per-grant clamping. **API** `grantCeiling, evolutionBudget, recordEvolution, sanitizeGrant, foldGrants, grantSummary, canDerive`. **NEVER** judges whether the FICTION earned a grant — that is a reading of the story, not a computation; the engine bounds the size, the fiction earns it. **NEVER** scales a derived item down (a split is a peer, not an echo). |
| `coliseum.js` | SNG-149/CCODE-89: the Great Coliseum's BLIND GRID — the body for a design that was manifest-registered and read by nothing. Each competitor brings FOUR function families (three weighted by what they practise, one wild from all eight); each then picks from the OTHER's four, blind and simultaneous, and the intersection is one of 36 authored cells. **API** `drawAxis, resolvePick, cellFor, readOfPick`. **WHY** a specialist is measurably MORE exposed, not less: a 2-family competitor draws 3 of 4 untrained columns against a broad rival's 1 of 4 — 'a champion must be COMPLETE'. **NEVER** coerces an illegal pick into a legal one (that restores the steering the grid forbids) and **NEVER** sorts the axis draw (a predictable axis is four answers a champion can prepare). |
| `craftmechanics.js` | SNG-263: the craft MECHANICAL BODY — what a craft actually does. The audit that produced it: 285 crafts carry `functions` and not one carried a field for damage, healing, duration, range, area or rank, so of 24 verbs only `strike`/`break` did anything (`heal` on 31 crafts healed nothing; `reveal`, the largest family at 114, did nothing). Resolves a verb to its family's effect-SHAPE, then the magnitudes, tier ladder (T-II doubles, T-III beats linear, T-IV/V flagged special), per-rank delta and per-intensity scaling. **API** `mechanicFor, rollMagnitude, shapeOfVerb, familyOfVerb, knownVerbs, unmechanisedVerbs, authoredCoverage`. **NEVER** invents a number: every magnitude, multiplier and band comes from `rules/craft_mechanics.json`, and the resolution order is craft.mechanic → family default → the verb does not use that dimension (so an unauthored craft still works and an authored one is genuinely its own). **NEVER** returns a zero for an unused dimension — "this verb has no range" and "this verb's range is 0" must not look alike. |
| `borncontract.js` | SNG-250 §4: the universal born-whole gate. One checker for every type, keyed entirely by the consumer map — WHOLE (every consumer-read field carries a value) + CONCRETE (that value is something the rules can act on). **API** `checkBorn, contractFor, contractedTypes, repairTargets, describeBorn, hasValue`. **NEVER** imports, mutates or repairs anything — the contract and its vocabularies are injected and it only reports, so the same function gates the browser's generation path and the Node CI sweep over authored content. **NEVER** branches per type: adding a type means declaring its contract (§5). |
| `worldmap.js` | Deterministic map layout (auto-position, icon/terrain tint, KG overlay). **API** `autoMapPositions, coordForGenerated, iconForTags, terrainClass, kgOverlayEntities`. **NEVER** touches the DOM or uses `rng`. |
| `worldtick.js` | Offscreen advancement (event stages, news spread, NPC evolution, shared-canon sync). **API** `initWorldState, buildRegionView, effectiveLocation, runWorldTick, syncSharedWorld, syncSharedCanon, advanceGeneratedOffscreen, takeUnseenNews, newsForGM`. **NEVER** runs unless in-game days have passed since the last tick. |
| `death.js` | SNG-209: death as a retrievable STATE at a computed depth (threshold→near-dark→deep-dark→SEALED), sinking on the world clock while untended. **API** `enterDeathState, deathDepth, isSealed, isRetrievable, deepenDeaths, reachableDeadForGM, resolveRetrieval`. **NEVER** deletes a figure — death is a state, and an untended one only deepens toward sealed. *(Caveat §22: only epic kills stamp a deathState today, so ordinary dead NPCs read as reachable with no clock.)* |
| `encounterFrame.js` | SNG-230: a pure legibility layer over GM-narrated encounters — the frame descriptor (kind, win condition, meter, the three exits) + the finisher/collapse/ward/trivialize rules + fight→chase chaining. **API** `frameModel, encounterKind, frameExits, frameSize, frameTransition, collapseFloor, frameCollapsible, collapseMode, collapseResult, wardAgainst, wardBroken, trivializes, chaseFromFight`. **NEVER** touches the DOM or moves encounter state — it describes; app.js renders, the engine resolves. |
| `feed.js` | SNG-168: the World Feed — a family scrapbook of turns a player chose to share (narration+image+date+rating), appended merge-safe to one shared file, rating-lensed on read. **API** `FEED_PATH, buildFeedPost, appendFeedPost, feedForViewer`. **NEVER** canon — a post never hydrates into another player's CONTENT (that is the separate shared-canon path). |
| `legends.js` | The world's great figures — tiers, rarity governors, dramatic-beat surfacing. **API** `tierBirthWeight, loadLegends, tierForArc, legendSurfacing, legendDeploymentForGM`. **NEVER** narrates the appearance — engine detects/governs, GM narrates. |
| `npcsheet.js` | CCODE-248: AN NPC WITH A CHARACTER SHEET, AND A WAY TO GROW ONE. **API** `sheetFor, derivedLevel, leanOf, craftsOf, growthFor`. ⛔ **Erik's Pell case is an EMERGENT NPC** — she is in `npc_interiority` and the save registry, not the catalogue, and `ironsense` is not an authored craft. ⚠️ **WHY IRONSENSE GETS OVERDONE:** `skillsObserved` is a capped bag of FREE TEXT and nothing turned it into a kit, so the narrator has one remembered thing to reach for. The repetition is a sheet problem, not a narration one. This DERIVES a sheet from what the world recorded (meetings, time known, standing, role lean) and MATCHES observations to real crafts. **NEVER mints a craft** — an unmatched observation returns as `wantsAuthoring`, which is a prompt to author rather than licence to hallucinate. **An AUTHORED sheet wins outright.** |
| `npcs.js` | The durable NPC registry (identity, history, relationships) via clamped ops. **API** `findExistingNpc, prettifyNpcName, applyNpcUpdates, setNpcName, relationshipBand, npcRegistryForGM, mergeDuplicateNpcs, migrateRelationships`. **NEVER** creates a person before fuzzy-matching an existing one. |
| `places.js` | Per-location permanence (visits, durable notes/flags outliving the scene). **API** `notePlaceVisit, applyPlaceUpdates, placeMemoryForGM`. **NEVER** stores scene-scoped/ephemeral changes. |
| `vectors.js` | Attunement-gated legibility of a place's spectrum axes. **API** `vectorLabel, notePerception, perceivedVectors, vectorSummary`. **NEVER** reveals mid/subtle axes without attunement or a perceiving ability. |
| `inventory.js` | Items as first-class objects + resolve-before-add stacking. **API** `resolveInventoryItem, normalizeInventory, fromCatalog, addItem, dedupeInventory, nameItem, findItem, removeItem, consumeItem, equipmentBonus, inventoryForGM`. **NEVER** breaks legacy string saves — `normalize` migrates losslessly. |
| `quests.js` | Quest state (freeform ops) + **structured quests (§14)** with effects[] application. **API** `resolveQuest, applyQuestUpdates, dedupeQuests, questsForGM, slugify, isRealQuest, startStructuredQuest, completeQuestStage, resolveStructuredQuest, availableStructuredQuests, routesForCharacter, structuredQuestsForGM`. **NEVER** silently drops an unresolvable op — surfaces a note. |

**Memory / knowledge**
| Module | Owns · API · Never |
|---|---|
| `codex.js` | The character's knowledge graph (typed topics + facts) via clamped ops. **API** `ensureCodex, resolveTopic, applyCodexUpdates, markNotSame, mergeInto, mergeCodexTopics, suggestMerges, codexForGM, searchCodex` (re-exports `namesMatch` for back-compat — it belongs to `namematch.js`). **NEVER** writes topics outside clamped ops. |
| `facts.js` | The durable non-scrolling ledger of load-bearing facts, fed every turn. **API** `ensureFacts, applyFactUpdates, factsForGM`. **NEVER** lets the GM contradict a pinned fact. |
| `names.js` | **One name, one home** (SNG-182). A display name lives on the record its id points at; `{{kind:id}}` tokens in authored prose resolve at prompt-assembly and render time. **API** `nameOf, renderNames, renderNamesDeep, tokensIn, collectTokens, NAME_KINDS`. **NEVER** resolves at content LOAD — SNG-111 progressive naming is per-character, so baking a name once would destroy it; and never shows a player raw token syntax. |
| `affiliation.js` | **One affiliation impl** (SNG-185) — what KIND a person is and what they PRACTISE, from role → skillsObserved → region, provenance on each; the two mint paths (generate.js + the GM meet-path) both call it. **API** `readPeople, readDomains, affiliationOf, regionHomeTradition, buildPeopleVocab`. **NEVER** matches the people vocabulary against the tradition vocabulary — kind is what you ARE, domains what you PRACTISE (Erik's SNG-174 ruling); and never invents a people. |
| `namematch.js` | The shared name-resolution primitive (normalize + conservative fuzzy). **API** `normName, namesMatch, resolveByName`. **NEVER** takes a dependency — kept dep-free to break the codex↔quests import cycle. |
| `devcapture.js` | **See the machine** (SNG-186 §2f) — a dev-only ring buffer of model exchanges: assembled prompt, raw response, parsed result, ops fired. Fed by an observer `callClaude` invokes; the dev screen reads it for firing counts per op-class. **API** `armDevCapture, recordCall, annotateLatest, devCaptures, clearCaptures`. **NEVER** arms in a player view — `armed` starts false and only isDevMode() flips it, so in normal play the observer is null and this holds nothing (§3.4). |
| `assignments.js` | **The world honours delegated work** (SNG-191 §4). A delegation is STATE: a named person put in charge of ongoing work, optionally against a crisis. The tick ADVANCES the work (progress/stall/problem/done) instead of imagining moods; a charge against a crisis is the mechanism that can push it back. **API** `ensureAssignments, addAssignment, advanceAssignment, progressAgainst, assignmentsForGM`. **NEVER** invents work that was not delegated, and never caps how far a problem or success may run (§4b unguardrailed). |
| `latentarcs.js` | **The world's own agenda** (SNG-191 §7, the generation turn). Arcs FOMENT on the world count whether or not anyone has seen them and SURFACE at thresholds — discovery is a late event in a thing that has been building. Three fates: handled, resolves-itself (§7.3), grows. **API** `ensureLatentArcs, seedArc, fomentArc, surfaceableArcs, markSurfaced, setArcFate, seasonalPressure, arcsForGM`. **NEVER** springs an arc from nothing at contact — every one carries a CAUSE that existed before it surfaced (§7 inv2); an arc may complete with no player involvement (§7 inv3); growth is uncapped (§7 inv1). |
| `braids.js` | **The generative core, made real** (SNG-196). Co-activating two crafts in one action EARNS a **braid** past a threshold (`BRAID_RIPEN_AT`) — a new, FULL-SCHEMA ability minted onto the character (into `customAbilities`, so `fullCatalog()` resolves it everywhere) that neither parent could do alone. **No authored recipe required** — that absence was the whole gap (a save with 40 co-activations and 0 braids, because only 3 recipes existed and none for the crafts played). **TIER scales with POWER** (the deeper parent's rank sets the ceiling). The name is the model's suggestion OR the player's; the stub `buildBraidDef` falls back to is itself a valid, playable craft, so a mint never halts. **SNG-197** the mint is a MOMENT (its own beat, GM-named + player-overridable), and `isLegalEmergent` enforces the emergent capability against the real 24-verb vocabulary — a hallucinated verb is rejected, not accepted-and-logged. **API** `mintableBraidsFor, buildBraidDef, mintBraid, braidTier, braidKey, isLegalEmergent, BRAID_RIPEN_AT`. Reconcile v14 backfills the braids a save has already earned. |
| `wheelgeom.js` | **The wheel is a map** (SNG-202). Places a craft on the ONE great circle by its COMPOSITION — the angular authority is a tradition's ring position, never a second coordinate system. The headline is the two-point case: a **braid** sits at the shorter-arc midpoint of its two parents, radius pulled inward by how far apart they sit (adjacent → rim, cross-circle → centre); the antipodal case resolves deterministically (clockwise from the lower ring) and reads as "spans the circle." **API** `braidPlacement` (+ internal `ringMidpoint`/`ringSeparation`). **NEVER** a force/physics layout — same composition, same position, every load. |
| `recipes.js` | **Found once, known forever** (SNG-201). A braid pairing anyone has already found becomes a global **recipe**; a later finder ADOPTS its name/prose/emergent reach instead of minting a duplicate — the discovery stays theirs, the craft is the world's, first-finder attributed. A NEW store (`world/braid_recipes.json`), deliberately NOT `emergence_recipes` (whose consumers are prescriptive — a recipe must stay DESCRIPTIVE, never a gate; the SNG-196 regression). **Numbers are never shared** — tier/levelReq/energy derive from each adopter. **API** `ensureRecipeStore, buildRecipeRecord, recipeFor, recipeToAuthored, mergeRecipes, firstFinderName`. **NEVER** promotes a STUB, and never overwrites a landed world-name (first-PUT-wins via `pushMergedFile`). |
| `authormode.js` | **The author god-mode** (SNG-207b). Erik-as-AUTHOR (not the character, not the in-fiction GM) sets anything on the save with NO fairness or trace check — the deliberately SEPARATE surface the SNG-207 §0 guard reserved: a distinct entry point (`applyAuthorOps`), never a `skipFairness` flag on the fair-GM `stateOps`. It crosses FAIRNESS (grants xp/levels/power items/abilities, forces arc stages — everything the fair GM refuses) but NEVER SAFETY: rating/minor are not character state, so they are simply never exposed. Dev-gated at the `⚙ Author` panel; every edit logged to `character.authorEdits` (append-only, separate from the `corrections` ledger). **API** `applyAuthorOps, AUTHOR_OPS`. **NEVER** a lever on content-rating or minor-safety, and never reachable outside dev mode. |
| `wake.js` | **The wake engine** (SNG-204 — the keystone of SNG-203). A resolved SIGNIFICANT outcome (world/tradition/regional tier, or any `arc_stage` move) leaves a **WAKE**: `source` (provenance), `change` (the applied effects, kept), `pressure` (the moved stage's authored `pressureOnAdvance` — the inference seed), `scale`, and `connectsTo` (the neighbouring arcs it presses on). Closes the loop the world had open — consequences used to land durably and then STOP (`quest_seed` pinned "A thread opens…" nothing opened). Now: the CHEAP path leans (signed by the move's direction) on each existing `connectsTo` neighbour via `worldState.wakeArcPushes`, folded into `arcStageNow`'s net so a neighbour's stage actually moves (the substrate stirring nudges the storm); wakes **decay** and close unengaged on the world-tick; `wakesForGM` surfaces the open ones as the next-thread seed. **API** `createWake, decayWakes, wakeArcPush, wakesForGM`. **NEVER** wakes on a trivial outcome (rarity is the point), and the model-generation path (a full new quest minted FROM a wake) is Phase 2. |
| `analysis.js` *(if present)* / `substrate` helpers | *(no separate analysis.js in Singularity — that pattern lives in Tether; noted so the map stays honest.)* | |

**Sync / shared canon**
| Module | Owns · API · Never |
|---|---|
| `canon.js` | Shared-canon promotion, contradiction→ranked opposed roll, rating-lens. **API** `ensureCanonStore, canonRecords, promotionCandidates, buildCanonRecord, weightOf, findCanonCollision, resolveContradiction, promoteInto, mergeCanonStores, lensDecision, adaptView, canonForViewer`. **NEVER** overwrites authored core canon (weight floor 100) or needs a human curator. |
| `sync.js` | GitHub transport for the shared world (owned-file writes + append-only ledger, SHA-retry). **API** `getSyncConfig, setSyncConfig, syncEnabled, ghList, fetchRepoJSON, fetchLedger, pushOwnedFile, pushMergedFile, appendLedger, fetchRemoteCharacter, resolveSaveConflict, pushCharacterGuarded, backupSaves`. **NEVER** edits shared/region files in place — region state is written only by the world-tick. |
| `party.js` | Shared scenes (anchor, ordered beat log, round-robin turns) with merge-on-conflict. **API** `newSharedScene, addMember, isMyTurn, nextTurn, mergeBeat, setEncounterState, partyBlockForGM, fetchScene, listScenesAt, pushSceneWithMerge`. **NEVER** blind-overwrites the shared scene — refetch + re-apply beat on SHA conflict. |

**Time · content-load · GM · imagery · transport**
| Module | Owns · API · Never |
|---|---|
| `worldtime.js` | The game clock + story/real modes + world-day/season math. **API** `newClock, getTimeSettings, setTimeSettings, readClock, advanceClock, getWorldEpoch, absoluteWorldDay, worldDate, worldDayAt, relativeWorldDays`. **NEVER** — *caveat:* the absolute epoch **is** shared, but the story/real MODE is still a per-player localStorage setting (its own header calls this a gap; see §22). |
| `state.js` | Content load (manifest whitelist) + localStorage save/load + player/character registries + import/export. **API** `loadContent, getPlayerKey, setPlayerKey, dedupePlayers, listCharacters, saveCharacter, adoptRemoteCharacter, loadCharacter, saveProfile, loadProfile, exportSave, importSave`. **NEVER** loads content from anywhere but the served repo files. |
| `gm.js` | GM prompt assembly (4-tier cache) + parse/sanitize the structured turn reply. **API** `narrativeRegister, ratingRegister, buildTiers, buildTurnContext, salvageNarration, salvageOps, gmTurn, sanitizeScene, gmAsk, generateBio, parseIntent, sanitizeIntent`. **NEVER** lets the model decide outcomes — it narrates results the engine already rolled. |
| `battleprompt.js` | SNG-400b: BUILDS the battle image's prompt from a fight — the power leads as the subject, the two figures are reduced to a look and a motion, and they are put in ONE grammatical relation. **API** `buildBattlePrompt, battleKey, figureLook, powerPhrase`. **NEVER** joins two authored halves with a conjunction (that was the failure it replaces), and never lets a rival pair render as the same picture — it individuates from `offscreenVerbs[0]`, the one field that is 66/66 distinct. Pure: same fight, same prompt, forever. |
| `imageprompt.js` | CCODE-190: COMPOSES an image prompt from the parts a builder selected — one line, from a list. Measured across 269 real fights, the deterministic build ran to a median of 14 comma clauses, 268 of 269 with eight or more, 248 repeating a word: "a list with a conjunction in it", the failure `battleprompt.js` exists to replace, after two rounds of tuning its clamps. **API** `composeImagePrompt, composeKey, cleanComposed, COMPOSED_MAX`. Routed to Haiku (`image-prompt` in claude.js's model map). **NEVER** chooses WHICH fields are in the picture — selection stays with the deterministic builder, which stays pure and tested; **NEVER** runs after the floors (it would compress away the ceiling tone and house style); **NEVER** blocks a picture — no key, offline, refused or malformed returns the builder's prompt unchanged. Composed once per subject and cached against the builder's own text, so Aevi's rule holds: same fight, same picture, forever. |
| `newsvoice.js` | SNG-433: how a fight is REPORTED. Erik asked three things of the clash news — *"is it coherent? interesting? obvious why it's news?"* — and the answer to all three was no, because the four sentences were written in an engine file and one printed a full name twice. Aevi re-authored them into `rules/news_templates.json`; this holds only the decisions the prose cannot make for itself. **API** `newsVoiceOf, clashLine, fragmentLine, shortName, relationshipOf, fragmentForm, fillTemplate, pickIndex, isIdShaped, OUTCOME_TEMPLATE_KEY`. The relationship comes from `rivals` — authored on 58 of 66 figures and read by nothing since SNG-208 — and a fight between rivals is not the same event as a fight between strangers (measured live: 4 of 32 fights over 24 world-years). **NEVER** writes a sentence: every word a player reads is authored. **NEVER** prints a raw id — `{place}` resolves to a display name or the phrase is dropped, guarded twice because the two failures are different (a caller that skipped the lookup vs a pack missing the location). **NEVER** rolls: the power variant is a hash of the fight, so a news item re-read says the same words and reopens the same battle. PURE — no I/O, no rng, no clock. |
| `purse.js` | CCODE-234/235: what a character HOLDS, and how a trade SETTLES. **API** `ensurePurse, credit, debit, held, canSpendHere, worthOf, convert, purseLine, canSettle, settleExchange, applyExchangeOps`. ⛔ **A purse of five integers is WRONG** — `scrip` is keyed by `regionId` and does not travel, `marks` is indivisible, and `paper` carries ISSUER RISK so the purse stores COUNTS and worth is computed at the moment you ask. ⛔ **No path mints a `coin`** (`credit` demands an honest provenance). The exchange RESOLVES AND CLOSES — Erik: *"the price is paid and the goods exchanged"* — so there is deliberately no escrow, no open trade, nowhere to put one. **NEVER** renders a shop screen: *"a trader is an NPC with wants, and buying is a conversation."* |
| `capabilities.js` | CCODE-244: WHAT A CRAFT CAN DO, TIER BY TIER — the reader behind Erik's *"the player says what they want and the engine knows which rank it takes"*. **API** `capabilitiesOf, capabilityMenu, resolveTier, reachCost, tierDeclaresSomething`. ⛔ **Only possible because ranks are ADDITIVE** (SPEC_rank_scaling §2): every tier at or below what you own is a live option, so `keening` r3 still offers r1's six-target action-loss. ⚠️ **`authoredBlock` picks the highest authored rank and stops** — right for *what is this field now*, wrong for *what can this character do*. The menu carries only tiers that DECLARE something (508 of 1,056 ranks), because one option per craft × function × rank takes a 6-craft kit from 14 options to 42. **NEVER** invents a number: `reachCost`'s surcharge defaults to 0, so every price is unchanged until the dial is authored. |
| `intercept.js` | CCODE-246: STANDING IN FRONT OF SOMEONE ELSE — the support-tank mechanism. **API** `openProtection, interceptorFor, reflectByDegree, redirectImposition, spendProtection, tickProtections, effectiveResist`. ⛔ **The game had NO interception at all**: `shield` and `ward` blunt what reaches YOU and nothing let a character eat a hit meant for an ally. ⚠️ **The imposition is RE-RESOLVED against the interceptor's own sheet** — their resist, their wards — or the tank is bookkeeping rather than a mechanic. r1 is one ally and one charge; r2 runs for a duration and HARDENS the taker; r3 reflects **by degree** (crit sends the craft's own `onCrit` back, success the original, partial the degraded, failure nothing). Collisions go to the **highest resist**, ties to last-declared. **NEVER** asks consent (Erik: *"eliminate consent"*), and **NEVER** invents a magnitude — "boosted" reuses authored `onCrit`. |
| `combatants.js` | CCODE-247: WHO IS IN A CONTEST, AND IN WHAT CAPACITY. **API** `alliesOf, targetableAllies, actingAllies, isCombatant, presenceSheet, rosterSummary`. ⛔ **PRESENCE AND PARTICIPATION ARE SEPARATE, and that split is the module.** Six of nine authored companions say in their own bond grants that they CANNOT FIGHT — so everyone present is TARGETABLE (keening drops the healer who never swung) and only the authored few ACT. ⚠️ **A companion who cannot fight needs protecting MORE**, which is what makes `intercept.js` worth having. `canAct` reads an authored `combatant: true`; **absent means NO**, because the documented majority cannot fight and a wrong default puts a healer in a duel. **NEVER** infers it from prose — a regex over prose finds words, not facts. |
| `targeting.js` | CCODE-250: **WHO A BLOW IS AIMED AT, AND WHO GETS TO KNOW.** **API** `chooseTarget, revealTarget, canInterveneFor, TARGET_POLICIES`. ⛔ **Erik: *"Yes a foe chooses who to hit... you need to sense who's getting attacked so you can intervene if you want.... if you obscure yourself you aren't going to know that information."*** Before this, `oppDecl` resolved against `playerSheet` and **nothing was aimed anywhere** — which is why `intercept.js` had been inert since the day it shipped. ⚠️ **THE SECOND CLAUSE IS THE MECHANIC**: the aim is a tiered reveal on the EXISTING `senseVisibility` ladder (t1 "not you", t2 names them, t3 says why), and **tier 0 carries no `target` reveal on purpose** — a character who obscured themselves cannot see the blow coming for an ally, and so forfeits the save. Hiding protects you and blinds you; that trade is a decision every round. Default policy is **`threat`, not `weakest`** — a foe that always goes for the softest target makes every fight the same fight, whereas going for what hurts it is **bait-able**. **NEVER** targets the downed. |
| `melee.js` | CCODE-251: **DIFFERENT LEVELS OF RESOLUTION FOR DIFFERENT SCALES OF FIGHT.** **API** `resolutionTier, actingSlots, meleeExchange, predictAggregate, distributeCasualties, legionClash, MELEE_TIERS`. ⛔ **Erik's boundaries, and he explicitly did not decide the shape**: *"if we have more than 3 party members the rest go into a melee flow that isn't as specific... then if we have a legion, how does that work?... we should think this through and test it."* Four tiers — `duel` / `skirmish` (≤3, full turns) / `melee` (mixed: you and those you bring forward act) / `legion` (units, not people). **Counts COMBATANTS, not allies** — two of you against forty is a legion fight. ⚠️ **THE ONE PIECE OF MATHS**: K combatants taking a turn is a SUM of K rounds, so the mean scales with K and the spread with **√K**. The obvious shortcut (K× one roll) gets the average right and the variance catastrophically wrong — measured at **1.0% mean / 614% spread** divergence, i.e. **invisible to anyone checking averages** and exactly how a party that recruits a fourth member starts seeing wipes the party of three never saw. `scripts/scale_fidelity.mjs` calibrates one combatant through the REAL `battleRound` and checks the prediction against K real rounds: **1.0% / 1.2% worst over K=1..50**. **NEVER** lets a won legion battle be personally safe (`legionFloorRisk`) — Erik: *"being a casualty of that melee."* |
| `group.js` | CCODE-307 / Erik: **A GROUP IS A CAPABILITY SET, NOT A POOL OF HITPOINTS.** **API** `groupCapability, groupMatchup`. ⛔ **Erik: *"a party is generally all the things, but even more gaps covered. A band is even more so, IF IT HAS HEROES IN IT. But if it's a military unit it's a bit different… AGGREGATE THE GROUPINGS so you have group stats that can be put up against another group's — with attrition the group LOSES CAPABILITY THROUGH LOSS OF INDIVIDUALS AND THROUGH LOSS OF COHESION."*** ⚠️ **COVERAGE and DEPTH are different numbers and that split is the module**: coverage is the UNION of what members bring (binary — *can this group heal at all?*), depth is HOW MANY supply each. **Losing one of six spears costs DEPTH — a slope. Losing the only mender costs COVERAGE — a cliff, and no remaining bodies replace it.** ⛔ **A pool of hitpoints cannot express that difference and it is the whole difference**, which is why this supersedes the casualty-pool tuning question rather than answering it. **COHESION is a second stat**: what a group CAN do versus how much of it they can actually BRING — it falls gradually with attrition and sharply with a leader or a coverage cliff, and a group at low cohesion still HAS its coverage and cannot use it, **which is what a rout is**. Members may be PEOPLE OR GROUPS, so a legion of cohorts of squads aggregates with the same call at every rung and a sub-group contributes its DEPTH rather than one vote. **NEVER** names a capability family anywhere in the file — Erik's *"easily updated as we evolve the game"* means the vocabulary is whatever `contributionsOf` currently returns, and `tests/group_capability.mjs §5` invents a seventh family at run time to prove a new one needs no engine edit. **NEVER** treats `present: false` as a casualty — withdrawing and being cut down mean opposite things. ⚠️ `scripts/group_fidelity.mjs` measures whether the aggregate loses the same PEOPLE the full fight does, and **today it does not**: `distributeCasualties` sorts softest-first while `chooseTarget` sorts by threat, so the shortcut is **permanently predatory** — it reproduces a foe hunting the softest and applies that to every foe. |
| `damagetypes.js` | CCODE-281 / Erik + Aevi: **DAMAGE FAMILIES, COMPOSITE DAMAGE, AND THE READER `wardTypes` NEVER HAD.** **API** `damageMixOf, familyOf, oppositeOf, wardAnswer, resolveComposite`. ⛔ **Three families — PHYSICAL (nobody owns it, armour answers it) · ELEMENTAL (`heat` `cold` `lightning` `corrosive` `force`, nobody owns them, any tradition reaches one) · POLAR (pairs only where an axis warrants one).** ⚠️ **Cold and fire are SIBLINGS, not opposites** — which is why a fire ward can never answer ice, and it is the correction that dissolved my own objection to an axis table. ⛔ **A CRAFT DEALS A MIX AND A WARD ANSWERS PART OF IT** (Erik: *"warding able to be PARTIAL… attacks more viable because they can BRING CERTAIN DAMAGE TYPES THROUGH"*) — a shield stops the physical half of a psionic blast and the psychic half lands. **DEPTH is `resist → soak → immunity` by rank; BREADTH is one type, rising to a whole FAMILY** (*"elemental ward for example"*) — and breadth is EARNED, so naming a family at r1 does not widen it. **NEVER** blocks a blow entirely — `minHit` floors it, because a 0 reads as broken rather than as a wall. **NEVER** applies resist to the damage: it moved the roll already, and charging it twice would make a rank-1 ward beat a rank-2 one. |
| `conditions.js` | CCODE-216: what a rest CLEARS and what it does NOT. **API** `clearOnRest, persistsUntilHealed, persistedConditionName`. A breather is not a night; **persist-until-healed survives ANY rest** and is contagious through a stack, so one persisting condition holds the ones bound to it. **NEVER** decides *whether* a condition applies — only whether sleep ends it. |
| `projects.js` | CCODE-215: work that takes TIME. **API** `openProject, advanceProject, interruptProject, sabotageProject, inheritProject`. ⚠️ **`projectThreshold` is how long the WORK takes; `duration` is how long the RESULT lasts** — a project completes on banked work crossing a threshold, **never on a date**. Interruption keeps the bank, sabotage never drives it below zero, extra hands are sublinear. `inheritProject` moves the `owner` and never the `opener`. **NEVER** completes on a calendar day. |
| `seeking.js` | CCODE-222: the reason an NPC WALKS UP. **API** `wantsOf, patienceOf, seekingPressure, seekersAmong, seekingLine, noteSeen, advanceSeeking`. ⛔ **A clock, not a queue** — pressure builds while apart and empties when you meet — and **the rate reads `|relationship|`, never its sign**, so a devoted friend and a declared enemy are equally impatient. No authored `wants` → no seeking, ever. **NEVER** marks anyone seen: being sought is not being met. |
| `art.js` | The image pipeline (assemble → rating/minor floors → URL → persist-once → gallery). **API** `getArtMode, setArtMode, locationImage, sceneImage, itemImage, npcImage, sanitizeImagePrompt, assembleImagePrompt, imageURLFor, ensureImage, ensureGallery, addGalleryImage`. **NEVER** bypasses the floors, or re-assembles a record born with an image. |
| `claude.js` | Anthropic transport + task→model routing (`MODEL_MAP`) + loose-JSON parse. **API** `getApiKey, setApiKey, callClaude, parseLooseJSON, callClaudeJSON`. **NEVER** puts the API key in a committed file — localStorage only. |

*Cross-cutting note:* `slugify` is exported from `quests.js` but imported by `progression.js`/`codex.js`/`npcs.js` — an odd home for a shared helper (same smell that justified extracting `namematch.js`); flagged as debt (§22).

---

## 4. Character & Resolution (the numbers)

### 4a. The skill roll — every term, at a glance (the reference table)
You roll **d100 (1–100)**; you succeed if **roll ≤ your success chance**. Success chance is the sum of these
named terms (every term is a labelled, self-summing line — SNG-106; the engine never hides a modifier):

| Term | What it is | Value | Note |
|---|---|---|---|
| **Attribute** | Your score in the craft's TAGGED attribute × 20 (through soft-cap 4), +5/pt beyond | attr4 = **80** | The dominant term. **This is "coherence": the roll uses the attribute the CRAFT is tagged with, so a kit that matches your build's high attribute rolls strong.** ⚠️ SNG-258 §1: too dominant — tuning. |
| **Skill** | Trained level in a specific skill × 10 | skill3 = +30 | ⚠️ SNG-258 §2: flat today; should reward USE. |
| **Ability rank / tier** | The craft's own tier × 5 | T3 = +15 | ⚠️ SNG-258 §3: flat "+15 just because"; should scale. |
| **Spectral fit (you)** | How your ALIGNMENT matches the craft × 15 | ±0…15 | Clamped with place, total ±25. SNG-258 §4: popup must say WHY. |
| **Spectral fit (place)** | Whether the LOCATION favours the working × 10 | ±0…10 | " |
| **Equipment** | Best matching wielded item (best ONE only) | +5, cap 10 | SNG-258 §7: make which-gear-helps obvious + equip-for-skill link. |
| **Companion** | A relevant companion present | +5, cap 10 | SNG-258 §10: one of the ENVIRONMENTAL EFFECTS family. |
| **Environmental / prepared ground** | Wards you set in advance, carried-item auras, companion presence — effects attached to the PLACE/situation | ±N | SNG-258 §10: establishable before a fight, CONTESTABLE (take out the wards first, or fight through them), transparent before you engage. |
| **Aptitude** | Innate build bonuses (physical/mental/social/finesse) | small | SNG-258 §5: earn-counter so decay slows; popup names them. |
| **− Difficulty** | The action's difficulty band | 0 / −15 / −30 | |
| **− Exhaustion** | At 0 energy | −10 | |
| **− Substrate penalty** | Ability actions, when out-of-band | −N | SNG-258 §6: should be IDEAL-POINT (bonus in-band), not always a penalty; transparent before use. |
| **Novel −15 / Discovery +20** | Improvising the unknown (−) vs a known discovery (+) — a REPLACEMENT, not a stack | −15 or +20 | A 35-pt swing once a technique is yours. |

**Then, in a CONTEST** (both sides roll; the margin between the two stacks decides): **matchup** (rock-paper-scissors, SNG-254), **intensity** (conserve/standard/surge), **woven** craft, **momentum**, **setup** ("you read them first"), **standing effects** (a bind on you −, a ward you raised +). All are named contest-mods added to the roll.

**d100 degrees (SNG-258 — crits are a SECOND roll, not a band on the first):** the first roll grades the outcome — success ≤chance · partial ≤chance+15 · failure. A success or a failure then takes its **own** crit roll against a dial: `crit.baseSuccessChance`/`baseFailChance` (5/5), raised or lowered by ability rank, practice, wild/novel crafts and aptitudes (gear and field effects hook in via `ctx.critMods`), clamped to `crit.minChance`–`maxChance` (1–60). A **partial takes no crit roll** — it is already the soft middle. Expertise raises crit-success and lowers crit-failure, so mastery reaches further AND degrades softer *without* having to come off the chance ceiling — the defect that killed the old flat partial band, where a master at chance 95 with crit-fail at 96 could only ever crit-FAIL. ⚠️ SNG-258 §9: show both dials, and their reasons, to the player.
**Stack-before-clamp (CCODE-40):** all terms sum BEFORE the 95 ceiling for the CONTEST margin (so a −15 bind on a +35 vs +25 opponent reads as the true −5, not two clamped 95s); the ceiling still applies to your own DEGREE so any action can fail.

### 4b. How the WORLD drives the story — every path, at a glance (the reference table)

Erik: *"the NPCs and world ticks are supposed to drive the story sometimes."* They do, by **17 named paths**.
This table is the counterpart to 4a: 4a is every term that reaches a ROLL, this is every way the world reaches
the NARRATOR **without the player asking**. A path is world-driven when it fires on the world's clock or state
rather than on a player action.

**It is GENERATED, not written.** `tests/world_drive_audit.mjs` reads the live builder registry and emits the
rows; `npm run world-drive` regenerates and re-verifies. That matters more here than anywhere else in this
document: a hand-written list of how the world acts would drift, and **a missing path looks exactly like a rare
one**. That is not hypothetical — `passing_advice` (a legend leaving one true thing on a mundane crossing) was
defined, described, authored and deployable, and the only function that selects a beat could never return it.
It sat dead for weeks because nothing anywhere stated the complete set (CCODE-90).

**Each path needs three links, and the audit FAILS the build if any is broken:**

- **TRIGGER** — the condition that makes it fire. A path with no reachable trigger is real machinery nothing
  can ever select (the CCODE-90 shape).
- **BUILDER** — the named function that assembles it. A registry entry, never an ad-hoc call, so the set is
  enumerable.
- **CONSUMER** — the GM prompt section that carries it into context. Built and thrown away is worse than not
  built: it costs a turn's work every turn and delivers nothing.

**Every row is STAMPED with its verifier, its version and the date it was checked** — a verification with no
provenance is a rumour. `Wired?` is proved by the audit; `Seen in play` is measured by probing the real save
files, so it is observed evidence rather than a simulation.

**Verified at HEAD: all 17 paths are triggered, built and carried.** 14 of the 17 are CONDITIONAL — those are
the ones that can silently stop firing, and the audit prints them by name.

> ⚠️ **WIRED IS NOT FIRING, and the measurement says so: 4 of the 17 have NO observed footprint across 1,788
> turns of real play** — `latentArcsDetail`, `npcErrandsDetail`, `perilNote`, `assignmentsDetail`. `perilNote`
> is an honest negative (nobody in these saves has used a precursor craft, so it *should* be absent).
> **`npcErrandsDetail` — an NPC wanting something from you, unprompted — is the one that matters**: its trigger
> reads `always (a known errand-giver)`, and "always" producing zero in 1,788 turns is a contradiction on its
> face.
>
> **v1.1.0 of this audit said SEVEN, and it was WRONG** — two probes looked in the wrong place (`wakesForGM`
> reads `worldState.wakes`, not `character.wakes`; the teacher footprint is the RECORD, not the `markTeacher`
> op). `wakesDetail` is 1/10 and `teacherOfferDetail` is 9/10. v1.2.0 mirrors each probe to the reader it
> checks, and the correction is left visible here rather than quietly restated — a probe that guesses the
> storage path produces exactly the confident zero this table exists to catch.

**A probe is a HEURISTIC for a footprint, not the path itself.** "No footprint" is a reason to look, never a
proof the path is dead — saying "never fired" from this data would be exactly the overclaim this table exists
to prevent.

<!-- verified by tests/world_drive_audit.mjs v1.2.0 on 2026-08-03 — 10 saves / 1788 turns of real play -->
| Path | What the world does | Trigger | Builder | Wired? | Seen in play | Spec |
|---|---|---|---|---|---|---|
| `worldPressureDetail` | the world's own pressure — what is building whether or not you engage it | always (paced) | `app pendingPressure (SNG-080)` | yes | no probe | §19 |
| `worldArcsDetail` | world arcs advancing on their own clock | always | `worldtick.worldArcsForGM` | yes | 4/10 | SNG-203 §3 |
| `latentArcsDetail` | arcs not yet surfaced, ripening | the generation turn surfacing an arc that fomented on the world count | `latentarcs.arcsForGM (SNG-191 §7)` | yes | **none** (0/10) | §7 |
| `livingWorldDetail` | the living world — what other people's play has made true here | always | `generate.livingWorldForGM` | yes | 9/10 | §19 |
| `newsDetail` | news travelling between communities | always | `worldtick.newsForGM` | yes | 9/10 | §19 |
| `npcErrandsDetail` | NPCs who want something from you, unprompted | always (a known errand-giver) | `quests.npcQuestsForGM` | yes | **none** (0/10) | SNG-203 §5 |
| `wakesDetail` | the wake of what you did — consequences arriving later | always (a significant outcome recently resolved) | `wake.wakesForGM (SNG-204)` | yes | 1/10 | SNG-204 §OQ1 |
| `legendDetail` | a great figure surfacing at an apt beat (CCODE-90) | qualifying beat | `app.maybeLegendDetail (SNG-042)` | yes | 3/10 | §16 |
| `legendsPursuableDetail` | great figures you could reach | always (a practiced tradition or a legend at hand) | `legends.legendsForGM (SNG-208)` | yes | no probe | SNG-208 wiring |
| `seasonalDetail` | the season acting on the world | always (the character clock always has a season) | `latentarcs.seasonalDetailForGM (SNG-191 §7.4)` | yes | 10/10 | §7.4 |
| `anomalyDetail` | the world noticing its own inconsistency | Repair panel | `corrections.detectAnomalies→anomaliesForGM (SNG-137)` | yes | 2/10 | §11 |
| `encounterOfferDetail` | the world offering an encounter | the narrative-time roll picking a STRUCTURED (duel/challenge) entry — the engine decides, the model no longer judges 'when the fiction invites it' (the Silas fix) | `app pendingEncounterOffer (SNG-236 fix A)` | yes | 2/10 | SNG-236 |
| `emergenceDetail` | practice ripening into new power | practice | `practice.emergenceNoticeForGM` | yes | 3/10 | §7 |
| `perilNote` | peril the world has put in front of you | precursor use | `character.precursorAxes band` | yes | **none** (0/10) | §6 |
| `assignmentsDetail` | standing obligations coming due | the player putting a known person in charge of ongoing work (delegateOps) | `assignments.assignmentsForGM (SNG-191 §4)` | yes | **none** (0/10) | §4 |
| `teacherOfferDetail` | a teacher offering, unasked | the ENGINE finding a present teacher with a reachable next step + room this beat (not the same beat as the general offer) — the model no longer judges 'when the moment fits' | `pacing.roomForATeacherOffer + company.teacherOfferReady (SNG-195 G2)` | yes | 9/10 | SNG-195 G2 |
| `offerDetail` | an offer the world makes | the ENGINE finding room this beat (a lull or arrival, no encounter/gambit/intent grip, off cooldown) — the model never judges it | `pacing.roomForAnOffer + npcs.npcFearsForGM (SNG-194 §4b)` | yes | 5/10 | SNG-194 |

**What this does NOT claim.** The audit proves each path is *wired*, not that it fires *often enough* or that
its trigger is *apt* — reachability is not decidable from source. Pacing and aptness are Erik's dials and
Aevi's content. What it removes is the failure that hid `passing_advice`: a path can no longer be silently
absent, and a conditional one is now listed by name rather than assumed to be working.

> ⚠️ **SNG-258 (Erik's roll-math review) is open against this table** — the attribute term is so dominant that
> above attr 4 everything else piles against the 95 ceiling and is wasted (base hits 80-90 trivially). The full
> overhaul (curve re-weight, skill-use tracking, tier scaling, the transparency popup, substrate ideal-points,
> gear equip-links, aptitude counters, out-of-encounter standing effects, visible crit bands) + a sensitivity
> tool to tune it on data lives in `po/SPEC_SNG-258_roll_math_overhaul.md`. The numbers below are HEAD; SNG-258
> is the pending revision.

- **Sub-attributes (8):** strength/agility · reason/insight · presence/rapport · craft/wits. Creation: 12 points across 4 parents (1–4) + 2 specialise points. Cap 20.
- **Chance** = attr contribution + skill×10 + abilityRank×5 + spectrum fit (alignment×15 + location×10, clamped ±25) + equipment (**best matching item only**, cap 10 — §15) + companion (+5/relevant, cap 10) + aptitude mods − difficulty (0/15/30) − exhaustion (−10 at 0 energy) − **novel surcharge (−15)** *or* **+ discovery bonus (+20)** − **substratePenalty (§9b, ability actions only — 0 if within band or no ability)**. **Clamped 5–95.**
  - **Attr contribution: ×20/point through soft cap 4, +5/point beyond** — mastery buys power against hard rolls without trivialising easy ones.
  - **Novel vs discovery is a REPLACEMENT, not a stack.** The same action that cost −15 to improvise pays **+20** once it is a known discovery: a 35-point swing. *Reaching past what you know is dangerous; surviving it and repeating it makes it yours.*
  - **⚠️ OPEN BALANCE Q (Erik, parked for sensitivity testing):** at +20 a discovered technique ceilings out on most builds. Intended, or tune to +12–15?
- **d100 degrees:** success ≤chance · partial ≤chance+15 · failure — then a **second roll** decides crit, against the `crit.*` dials (SNG-258; novel raises the crit-FAILURE dial by 3, wild raises both). A partial takes no crit roll.
- **Trivial actions** (GM-marked or parser-detected; never ability/novel): no roll, no energy, no XP.
- **Sense tiers** by attunement (0/2/5/9): nothing → vibes → 5 bands → ~numeric. +1 tier if location matches alignment; Strategist +1 on planned.
- **XP** (engine-paid, per rolled action): crit 8 / success 5 / partial 3 / failure 2 / crit-fail 2, **+8 novel** (`xp.novelBonus`). **Gambits 12/10/3 + completion bonus 10.** Quest completion: **structured quests award the outcome's `xp` effect (default 30, clamped 0–60); freeform GM-proposed completion clamps 0–25** (§14, §11). *(⚠️ ROUND-2 CORRECTION: v2.0 draft said "+3 novel" — HEAD `resolution.json → xp.novelBonus` is **8**.)*
- **Level:** `xp ≥ level×100` → +1 attunement, +5 reserves, +1 banked sub-point, +1 skill point.
- **Energy `[CCODE: recovery curve]`:** max **100**; default action cost **5**; each ability carries an `energyCost` (minted clamped 4–15, discounted −1 per two character levels and −1 per rank, floored at ⌈½·base⌉). 0 energy = **−10 exhaustion, not a hard stop.** **Recovery is ACTIVE, never passive — advancing the clock alone restores nothing:**
  - **Rest** (`rest()`): a **breather** = +10 energy / +1 health / 1h; **sleep** = +40 energy / +3 health / 8h. Flat add, clamped to max.
  - **Meditation** (engine-owned, action-driven): a `meditate`-tagged action on a crit/success/partial gains `10 + 2×attunement` (halved on partial).
  - **Consumables / GM deltas:** item `effects.energy` (clamped ±10–25); GM `characterDeltas.energy` (clamped −20…+40); encounter-round energy deltas.
  - *Substrate note:* `energy.regenPerRest: 40` in `resolution.json` is a **dead/legacy key** — the code reads `recovery.sleep.energy` (also 40). There is **no per-turn or time-based regen** anywhere.

### 4c. The verification ledger — what we built, and what proves it (SNG-272)

Erik: *"can we verify the system spec intents are met 100%? … can we put a clear statement with references
into the spec that details exactly how that works?"* and then: *"how about adding which test/audit verified
each and what the latest result was, on what date and version of the test."*

This is that table. Each row ties **one of Erik's own asks** — in his words, so the row is answerable to the
request rather than to a paraphrase of it — to the mechanism that answers it and the gates that prove the
mechanism is still there.

**It is GENERATED, and it fails the build.** `tests/verification_ledger.mjs` runs the suite, matches every
claimed gate against a live PASS/FAIL line, and refuses to emit if any gate is **missing**, **red**, or
**ambiguous**. `npm run ledger` regenerates it in place.

That last condition earns its place: `2b:` is a prefix used by BOTH the generated-entity promotion block and
the world-minting block (Aevi flagged the collision), so a loose match silently binds a row to a check about
something else entirely and the whole row reads green off the wrong test.

> ⚠️ **WHAT THIS TABLE FOUND ON ITS FIRST RUN.** 17 of the claimed verifications **did not exist**. Not
> failing — absent. The entire world-engine chain (attention, tiered budgets, real-dice contests, the
> engaged/working split, weight-matched melee, casualties, tier-gap lethality, strikes and guards) had been
> built over two weeks and **gated by nothing at all**. It was the most-worked-on system in the game and the
> least defended, and no one would have noticed until it silently stopped working — which, on this
> particular chain, is exactly how it fails: three separate bugs in it returned empty forever and never once
> threw. The 22 gates that closed the hole are in `tests/smoke.mjs` under `272/`.

**A GATE AND A MEASUREMENT ARE DIFFERENT CLAIMS, and the table keeps them apart.** A gate is re-proved on
every run. A measurement is an observation, stamped with the date it was taken, and it goes stale the moment
anyone turns a dial — §4d names the command that produced each one so any number here can be re-derived
rather than trusted. One row (`SNG-267`) is measurement-only and says so.

<!-- BEGIN verification-ledger — GENERATED by tests/verification_ledger.mjs; edit the ledger there, not here -->
<!-- verified by tests/verification_ledger.mjs v1.0.0 on 2026-08-04 — 176 gates across 37 requirements, all green at HEAD -->

| # | Erik asked for | How it works | Proved by | Latest result |
|---|---|---|---|---|
| `SNG-268` | *"the world should live without the player"* | worldtick.js:advanceGeneratedOffscreen — a rotating batch with a reserved legend seat | **2 gates** in `tests/smoke.mjs` | was `population.slice(0,4)` with the legend at index 36 on Erik's real save — the machinery and the content were both complete. |
| `SNG-268b` | *"i don't want to lose the tick content on the npcs who aren't in the current update pass"* | worldtick.js:offscreenBacklog — unpicked figures stack their beats and cash them in when their window comes | **1 gate** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-106` | *"if it's heard that something is moving forward, other NPCs become more motivated to stop or help it"* | worldtick.js — urgency scales with how far the arc has run AGAINST them | **1 gate** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-111` | *"legends and epics have limited attention… every time is a decision about where they spend it"* | worldtick.js:spendAttention — cares they leave are reported as vacancies, not silently dropped | **1 gate** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-112` | *"a Legend can push a couple fronts… average is 2, an epic's average is 1, heroic .5"* | worldtick.js:budgetFor — tiered budgets; fractional means whole fronts first, then a partial share | **3 gates** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-113` | *"some sort of simulated battle that uses the game mechanics with rolls so the outcomes are not predetermined"* | worldtick.js:contestArc — the same battleRound the player rolls against | **2 gates** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-115` | *"only the leading figure fights??? seems like all should fight somehow"* | worldtick.js — engaged/working split; the engaged fight weight-matched melees, everyone else pushes | **3 gates** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-117` | *"what if more get killed or injured? what knob would we turn to do that?"* | worldtick.js — a decisive arc-fight resolves through the same clash model as the narrated path; `casualtyRate` is the knob | **1 gate** in `tests/smoke.mjs` | gated only — no standing measurement |
| `CCODE-118` | *"a legend might be able to kill 3-4 heros and 1-2 epics per battle"* | worldtick.js — the tier GAP sets how many the victor reaches and how badly each suffers | **1 gate** in `tests/smoke.mjs` | gated only — no standing measurement |
| `SNG-269a` | *"i would expect more lower power ones to die than legends"* | worldtick.js:resolveEpicClash — lethality scales with rank gap and collapses when a lesser figure prevails | **1 gate** in `tests/smoke.mjs` | BY COUNT the design holds (5.4 lower-tier deaths per world vs 1.8 legends). BY RATE it inverts — heroic 6.5% · epic 9.3% · legendary 10.6% — because a legend holds 2 fronts and is in ~4× the fights. Different questions; the knob for the rate is `attentionByTier`, not lethality. |
| `SNG-270a` | *"Strikes/Assassinations, crusades, and guards"* | worldtick.js — a strike targets the other side's best WORKER; a guard on that side intercepts | **2 gates** in `tests/smoke.mjs` | gated only — no standing measurement |
| `SNG-270b` | *"death isn't permanent necessarily… there are levels of death written in the lore. we need to use them"* | worldtick.js:attemptRetrievals + death.js:resolveRetrieval — someone who shared a care goes after them and pays a front to do it | **4 gates** in `tests/smoke.mjs` | `resolveRetrieval` had existed since SNG-209 and ONLY author mode ever called it. 12 world-years: 33.7 attempts · 17.8 returns · 10.2 sealed. Rates are content dials (`retrievalRate`, `retrievalOddsByDepth`) — the numbers are Erik's call, the mechanism is the deliverable. |
| `SNG-270c` | *"we should have quests to retrieve for NPCs"* | worldtick.js records the asker; death.js:reachableDeadForGM carries it; gm.js frames them as a quest-giver | **3 gates** in `tests/smoke.mjs` | the dead were already listed for the GM — as atmosphere. Nothing said anyone wanted them back, so there was nobody to do the asking. |
| `SNG-269b` | *"what about new NPCs growing into legends/epics?"* | worldtick.js:mintFigure — entry at riffraff/notable from deaths, the rungs left empty as the inflow | **7 gates** in `tests/smoke.mjs` | the roster had never grown: no `figures.push` anywhere, so attrition was one-way and a long-simulated world emptied out. 12.2 minted per world over 12 world-years. |
| `SNG-269c` | *"the ones that stay the longest are the true legends"* | worldtick.js:advanceStandings — tier becomes an EARNED position held in world state, read everywhere through tierOf() | **7 gates** in `tests/smoke.mjs` | 3.8–7.5 NEW legendaries per world over 12 world-years, and different ones in every run. |
| `SNG-266a` | *"P1a — every encounter awards ZERO XP (Aevi's work order)"* | content/packs/core/rules/encounters.json, registered + merged over the inline table; the read falls back to `default` | **1 gate** in `tests/smoke.mjs` | the order's premise was half right: duel/challenge/puzzle DID pay from an inline block in resolution.json. Everything else — fled, walked away, incapacitated, any later type — hit an undefined entry and paid nothing. |
| `SNG-266b` | *"P1d — a scene runs forever while forgetting its own beginning"* | gm_registry.js:scenePacingDetail reads a true beat count; app.js closes the scene at the hard rung | **5 gates** in `tests/smoke.mjs` | the signal read `sceneTurns.length`, which is `slice(-40)` bounded STORAGE — so pressure to close plateaued exactly when it should have become irresistible. |
| `SNG-271` | *"Erik's own fight log — a downed player still took their bonus action"* | app.js — incapacitation is checked on its own, not off the encounter's `ended` flag | **6 gates** in `tests/smoke.mjs` | gated only — no standing measurement |
| `SNG-275a` | *"the Arcs don't necessarily consume all the attention for the NPCs — they probably spend a fair amount of time just living their lives"* | worldtick.js:spendAttention — a personal claim is held back before the arcs are served; a crisis can borrow it, and the borrowing is recorded | **6 gates** in `tests/smoke.mjs` | MECHANISM live, CONTENT open. A probe world-year: 47 figures kept their own time, 0 of them have a life AUTHORED, 20 spent it on a crisis instead. ⛔ The engine will not invent a family — that is authorship, and an invented relative becomes canon the moment a narrator says it. `personalVerbs` / `interests` / `kin` are the fields; `ws.personalCoverage` counts the gap so it is a number rather than a silence. |
| `SNG-275b` | *"(implicit) — the tuning dials Erik and Aevi own must actually be turnable"* | content/packs/core/rules/arc_response.json — registered, loaded, merged; 21 dials + the promotion ladder | **2 gates** in `tests/smoke.mjs` | ⚠️ `rules.arcResponse` and `rules.tierLadder` DID NOT EXIST. The engine read them for weeks, so every dial ran on a hardcoded fallback and none could be turned without editing engine source — while I kept saying 'that is the dial, the number is Erik's call'. A reader with no writer: the fourth door. Authored at exactly the old fallbacks, so behaviour is unchanged and only reachability moved. |
| `SNG-272bg` | *"MECHANICS: No fixed challenge affinity. (Erik's screenshot — the sheet lying about a background that works)"* | app.js:backgroundById — one reader, normalising legacy ids and shouting on a true miss | **5 gates** in `tests/smoke.mjs` | Aevi's find: all 40 backgrounds carry real mechanics; the CHARACTER carried `community-organizer` and every authored id is snake_case. `\|\| {}` then failed four ways at once — tooltip lied, the SOCIAL edge never applied, `banner` was never granted, and seedInnateSubstrate read the same empty record. ⚠️ OPEN FOR AEVI: whether an existing character is BACKFILLED the aptitude they were owed is a call on a live player's sheet, not mine to make silently. |
| `SNG-276` | *"they have the arcs on their chronicle, but not who's doing what to them"* | worldtick.js:arcPeopleView + worldPeopleFooter — pure readers; app.js:renderWorldTab — THE WORLD tab | **13 gates** in `tests/smoke.mjs` | Aevi: 'the sim already knows the story. Nothing surfaces it.' `arcContests`, `arcCasualties` and `arcVacancies` had all been written and never read — collected-then-discarded, the seventh door, across five systems at once. Building it caught a live instance of its own bug class: only 2 of 3 character renders wired the tab bar, so the new tab was DEAD on the Traits screen. |
| `SNG-279` | *"promotion on DEEDS, on a scale players can SEE — today no player ever sees a single promotion"* | worldtick.js:creditDeed + advanceStandings — time becomes a floor, deeds become the gate; rises are news with attribution | **9 gates** in `tests/smoke.mjs` | Aevi measured the thing that mattered: the years-only ladder needed 15.5 world-years riffraff-to-mythic — ~2,200 player-hours — so the earned-tier system I built was, in play, INVISIBLE. Ladder 4/10/22/70/170 SWEPT (tests/deed_ladder_sweep.mjs): 4.5 rises in a 40-hour run and a mythic in 1 world of 6 at 180 hours, the only shape passing both of her tests. ⚠️ `spreadPerHop` cannot fire — reputation.js carries `spread` and its own header says nothing populates it yet; her table lists it as ‘already exists’. |
| `SNG-281` | *"(Aevi's deed table listed “a deed that SPREAD” as already existing — it did not)"* | reputation.js:spreadDeeds — one hop per pass, reach capped by the deed's weight; the world tick is the writer | **5 gates** in `tests/smoke.mjs` | `recordDeed` initialised `spread: []` and NOTHING in the repo ever appended to it, so every reputation query answered from the single community where a deed happened. The comment beside it said spread was ‘the world-tick’s job (v0.3)’ and that job never landed. Found from the far end: it was one of six promotion sources, dark. ⛔ Reach is magnitude, never merit — DIRECTIVE SNG-280 applies to how far news carries, not just to what scores. |
| `SNG-282` | *"the player's deeds and quest resolutions spread just like NPCs"* | worldtick spreads the character as a bearer; quests.js:resolveStructuredQuest records the resolution as a deed | **7 gates** in `tests/smoke.mjs` | ⚠️ CORRECTED AFTER READING THE REAL SAVES. The player was ALREADY spread — `runWorldTick` has done it since v0.5.0 and three tests gate it. I missed it (looked in reputation.js, which only READS `spread`; grepped for `recordDeed`, not `deed.spread`), reported in CCODE-134 that the field had never had a writer, and shipped a SECOND model that ran on the player 14 lines apart in app.js. Erik (SNG-289) then ruled the graded model wins for both: the v0.5.0 block sent a deed to EVERY community at once, which is why Silas is known in 91 of 90 and why the field could not carry information. One model now, weight-graded, player and figures alike. And a resolved quest was recorded ON THE QUEST and nowhere else, so the thing a player is most likely to be known for left no trace in the record the world reads. Recorded inside the resolver rather than at a call site: several doors resolve a quest, and a deed that depends on which one was used is a deed that goes missing. |
| `SNG-273` | *"stage 2 of the Bleed is in effect, so what?"* | engine/arceffects.js — a stage's effects reach the cost path, the roads, the encounter pool and the GM's NPC block | **9 gates** in `tests/smoke.mjs` | THE 2.0.0 BLOCKER. A stage carried publicFace and pressureOnAdvance, both narration, so 66 figures of attention, contests and casualties resolved into a number that changed a SENTENCE. Aevi authored 54 effects across 18 stages; 4 of her 5 kinds had a real consumer, and the testOnlyExports ratchet caught me shipping `encounterBias` unwired before it reached HEAD. ⚠️ `priceShift` has NONE — no module in this engine computes a price — so its 11 effects are inert, declared in `EFFECT_CONSUMERS` rather than left looking live. |
| `SNG-288` | *"losses isn’t the right metric — mythical for a variety of reasons is the right thrust"* | worldtick.js:career + mythicPathFor — seven roads, any one qualifies, and which one fired is recorded | **7 gates** in `tests/smoke.mjs` | ⚠️ THE DISTRIBUTION IS THE RESULT, and it is lopsided: over 4 worlds × 12 world-years, THE TURNER fired 20 times and THE RETURNED once. The other five roads never fired at all. Cause: `stageMoved` credits EVERY figure leaning on an arc when its stage moves, so ‘two stages moved’ is a presence test that dozens clear at once, while the deed-count roads (120–320 career deeds) are priced beyond what the engine reaches. Also required a CAREER record — tenure deeds/losses reset on promotion, so THE SURVIVOR would have been unreachable by exactly the figures it describes. |
| `SNG-287` | *"the name comes from the MATERIAL, not from a menu (the Tether pattern)"* | engine/titles.js — pattern + slots, every slot filled from a real record or the pattern is not used | **7 gates** in `tests/smoke.mjs` | ⚠️ There was no `titles.json` — the spec describes replacing a fixed list that had never been built, so both the engine and the patterns are new. THREE of the seven authored patterns CANNOT be chosen: {ROAD}, {CRAFT} and {FOE} have no source (nothing records which road a figure guarded, deeds carry tags rather than craft ids, and casualties are per-pass with no per-figure history). Declared in `UNFILLABLE_SLOTS` and kept in content so wiring a source later needs no re-authoring. |
| `SNG-295` | *"who actually turned an arc (Erik answered all four questions)"* | worldtick.js — credit goes to winners on the side it moved toward, plus strikers who emptied the front; never to the other side | **5 gates** in `tests/smoke.mjs` | The presence-test bug: credit went to EVERY figure leaning either way, so a turning banked ~30 stage-moves and THE TURNER was 20 of 21 mythics. After the fix, 11; after raising its bar to three stage moves (Aevi's pre-authorised remedy — raise the bar, never narrow the credit Erik ruled on), FOUR roads fire: turner 11 · unbeaten 1 · returned 1 · survivor 1. Erik's own case is live. |
| `SNG-294` | *"the three unfillable title slots — build, rename, or drop"* | titles.js — {FOE} recorded at the clash, {CRAFT} re-sourced to {TAG}, {ROAD} shipped as Warden of {PLACE} | **6 gates** in `tests/smoke.mjs` | Aevi's call on {CRAFT} is the sharp one: a tag is what the WORLD noticed and a craft id is what the ENGINE resolved, so threading ids into reputation would make a deed an engine artifact rather than a social record. ⚠️ Order can starve a fillable pattern — reported rather than reordered, since order is authorship. My first two starvation detectors both measured something adjacent to the question before the third measured reachability. |
| `SNG-296` | *"get back to playability, and I'd really like the generation engines to fire up"* | generate.js — `item` joins npc/location/arc/creature; schemas/item.schema.json; hydrated into CONTENT.items on enterPlay | **5 gates** in `tests/smoke.mjs` | ⚠️ Aevi ordered this BEHIND a Track B that turned out to be already built. Her premise was that bonusTags are ‘SET and EVOLVED and NEVER MATCHED’ — but `equipmentBonus` matches them into resolve.js's named `equipment` term, `wieldBonusFor` feeds the skill-battle contestMods as CCODE-43's ‘wielded gear’ line, and 27 of 30 authored items already carry them. The consumer exists twice. What her measurement DID find is real and is content: ZERO shields, which is now a kind of its own in the schema. Erik's original order was right. |
| `SNG-297` | *"make sure all of these new fields get swept against all the generators so any newly minted things get full content"* | worldtick.js:mintFigure — two cares, a want, and a life, all derived from the minting event; pools in arc_response.json | **6 gates** in `tests/smoke.mjs` | Aevi's audit: a minted figure had ONE care, no want and no life — while being fully promotable to mythic, since `worldRoster` concats them and `advanceStandings` walks that roster. The 66 authored figures die at ~2.4/world-year and were being replaced by figures who could not hold two fronts or abandon one, so THE WORLD THINNED AS IT AGED. ⛔ The pools are keyed on the origin EVENT, never on a person — a verb drawn from ‘survived a casualty’ is honest; a brother is not. The second care is the loudest local argument, from `arcContests`, so a successor inherits the fight rather than picking one. |
| `SNG-298` | *"i want npcs to be able to grow and evolve too… their cares and wants might shift or they might gain new ones"* | worldtick.js:evolveCares + currentCares — hardening, acquisition and erosion, from strikes and from the player | **9 gates** in `tests/smoke.mjs` | Cares were fixed at authoring and never moved — a figure’s rung, record, title and survival could all change, but not what they WANTED. Over 500 world-days 49 figures now change their minds. ⛔ No approval anywhere: a strike makes its target INVESTED rather than virtuous, and a disliked player recruits opposition exactly as reliably as a liked one recruits allies, so allies cannot be farmed by being agreeable. EROSION is what keeps it honest — without it cares only accumulate and every figure ends up the same person, but it narrows a figure and never empties one. |
| `SNG-299` | *"all of these new titles and terms and npcs need clickable popups describing who and what they are, with a link to the codex page"* | engine/whois.js answers from the record; app.js linkifies known names by walking text nodes after every render | **9 gates** in `tests/smoke.mjs` | A fortnight of work put names in the player’s face — figures who rose, titles the world found, arcs that turned — and every one was a bare string. ⛔ The lookup answers ONLY from the record and returns null when nothing is known, so the name stays plain: a popup reading ‘a figure of the valley’ promises a lookup and delivers a shrug. Linkifying walks TEXT NODES rather than rewriting HTML, which cannot corrupt markup and cannot link inside an existing control — verified against a real DOM, where the first version also revealed it was linking only the FIRST name in a sentence. |
| `SNG-300` | *"we probably need to tweak who fights and how"* | worldtick.js:engageOf — the engaged/working split is a per-figure roll against a tradition-keyed disposition | **5 gates** in `tests/smoke.mjs` | ⚠️ MEASURED AGAINST DIRECTIVE SNG-280’S OWN TEST, and it found something: over 4 worlds × 12 world-years, marcher (1.8) figures rose 50% of the time and stillhold (0.15) 8%. The engagement numbers describe METHOD rather than merit, as ratified — but the DEED TABLE is contest-weighted (five of seven sources need a fight, and `stageMoved` now requires WINNING one), so a peaceful tradition earns more slowly on the ladder. Not a clean lockout (veilwright at 0.4 rose 38%, above blazeborn at 1.3), and reported rather than tuned: the fix would be a deed source a peaceful figure can actually earn, which is content. |
| `SNG-302` | *"I want the value and money economy implemented"* | engine/economy.js — price = worthBand × need × scarcity, with priceShift moving the local need | **10 gates** in `tests/smoke.mjs` | Closes the last 2.0.0 row: `priceShift` had no consumer because no module could compute a price. ⚠️ Aevi registered AND loaded the economy and it STILL did not reach `rules` — `economyRule` was destructured from the first Promise.all while `loadRule(‘economy’)` sat in the second, thirty lines down, so the name resolved to undefined. A third distinct way for this same wiring to be half-done, and the one positional destructuring makes silent. ⚠️ SECOND AXIS NOT LIVE: 30/30 items carry a worth band, 0/30 carry a goods category, so no region table can be reached and price collapses to the band. Declared in `economyCoverage` and reported by `npm run coverage` rather than passing as a working local price. |
| `SNG-267` | *"the player is just one of many — so we need the world to live without the player"* | tests/player_impact.mjs — the same worlds run with and without parties | — | MEASURED, not gated — AND THIS NUMBER MOVED. It used to read 'without players the arcs never leave stage 1'; after minting, promotion, retrieval and the affinity fix, party-0 worlds now reach stage 4 on their own. What still separates them is CONTEST: 0 contested arc-instances at party 0, against 9 at party 1 and 8 at party 3 across 6 worlds. The world has its own history now; the player is what makes it an argument. |

**36 of 37 requirements carry a machine-proved gate** (176 checks total).
1 is measurement-only and is marked as such — `SNG-267`.

⚠️ **A GATE AND A MEASUREMENT ARE DIFFERENT CLAIMS.** A gate is re-proved on every run of the suite and this
document fails to build if one is missing, ambiguous, or red. A **measurement** is an observation stamped with
the date it was taken (2026-08-04) and goes stale the moment anyone turns a dial — the harness commands are named
in §4d so any number here can be re-derived rather than trusted.
<!-- END verification-ledger -->

### 4d′. ⚠️ IT IS A WORLD ENGINE, NOT A SIM — and the difference is not pedantry (SNG-307)

Erik: *"we're calling this 'the sim' but it's really the world engine. It simulates AND creates real
perpetuating entities."*

**Two different things wear the same word in this repo, and only one of them is a simulation.**

| | **The world engine** — `worldtick.js` and its chain | **The harnesses** — `tests/world_presets.mjs`, `world_endgame.mjs`, `strike_mix.mjs`, … |
|---|---|---|
| where it runs | inside a player's save | in memory, throwaway |
| what it produces | **people** — named, homed, with careers, deed histories, rivals, and standings that outlive every pass | **numbers** |
| what persists | all of it. A minted figure enters the roster, can be promoted to mythic, can be met | nothing. They write no save, touch no file |
| when it is wrong | canon is wrong — a figure exists who should not, or a real one is silently inert | a report is wrong |

**"Sim" is the wrong word for the first column and the right word for the second.** Calling the engine a sim
invites the assumption that its output is disposable statistics you can re-roll — and it is the opposite: it
is the part of the game that makes things *true*. A figure it mints has a name the world will use, a homeland
they came from, and a record that a narrator will speak aloud. That is authorship, executing at runtime.

⚠️ **This mattered concretely, twice.** The bugs that hurt most in this system were not bad numbers; they were
*people who did not exist properly* — minted figures whose `arcAffinity` had the wrong shape and were
therefore in the roster and invisible to every mechanic, and successors whose origin resolved to nothing so
they came from nowhere. A statistics bug is a wrong row. **An engine bug is a person the world half-believes
in.** That is the standard the whole `PromisedButUnread` discipline (§4e) exists to hold.

Use **world engine** for `worldtick.js` and the chain it drives. Use **simulation** only for the harnesses in
the table below, which genuinely are ones.

### 4d. Re-deriving the numbers — the simulation harnesses

Every measurement in §4c came from one of these. They are REPORTS: they write nothing, gate nothing, and the
right values are Erik's and Aevi's to choose. They exist so that a claim about how the world behaves can be
re-run instead of believed.

| Command | What it answers | Runtime |
|---|---|---|
| `node tests/world_endgame.mjs [runs] [days]` | after N world-years: who died by tier, who was minted, who rose, how many came back from the dead, and whether every world ends the same way | ~1 min for `6 4380` |
| `node tests/player_impact.mjs` | can a player make a difference? Runs the same worlds at party 0/1/3/6 and reports where the arcs land and how many are visibly CONTESTED | ~2 min |
| `node tests/world_drive_audit.mjs` | the §4b table — every path by which the world reaches the narrator unasked, and whether each has been seen in real save data | seconds |
| `node tests/content_coverage.mjs` | **is it authored yet?** — for every field the engine reads from authored content, how many records carry it. ⚠️ Added after I quoted a stale coverage number for four turns: the ledger stamps the figures that go INTO it, and this is the missing command for the ones that live in prose. | seconds |
| `node tests/player_lives.mjs [lives] [days]` | **what happens to a simulated player?** — how often the world floors them, by level and by power gap (real `battleRound` calls), and how many world figures carry their fingerprints (the engine's own `playerTouched` stamp). ⚠️ "How many die" is structurally ZERO: `encounters.js` — *"Incapacitation, never engine-imposed death"* | ~1 min |
| `node tests/world_presets.mjs [mode] [worlds] [days]` | **which dials make which kind of world?** — a one-dial-at-a-time sensitivity sweep plus six named preset characters, each run as a POPULATION with mean ±sd and a per-arc divergence figure (do worlds at the same settings end differently?). Written up in `po/BRIEF_world_presets.md` | ~30s |
| `node tests/holding_effect.mjs [runs] [days]` | **does `heldTheLine` fire, and does it close the gap?** — deed credits by source, who earns the holding deed (the SNG-280 check), and rise rates by tradition. ⚠️ This is what proves the streak actually REACHES its threshold in a live world; `holdEdge(5) === 1.5` proves arithmetic, not reachability | ~1 min |
| `node tests/strike_mix.mjs [runs] [days]` | **who strikes?** — the exact composition of the pool the striker is drawn from, by tradition, plus the live senders across seeded worlds. Added because the SNG-303b reconcile made a claim about a distribution, and a claim about a distribution has to be measured | ~1 min |
| `node tests/verification_ledger.mjs` | §4c itself — does every claimed verification exist and pass? | ~1 min (runs the suite) |
| `node tests/dev_world.mjs` | drives a throwaway world hard without touching a player's save | seconds |

⚠️ **World time is REAL-TIME-DERIVED** (`worldtime.absoluteWorldDay`, ~1 world day per real hour) and does
**not** advance with `character.clock.day`. Any harness driving the offscreen world must advance `now`, or it
measures a world that never moved and reports the stillness as a finding. That mistake has been made in this
repo and reported as an upstream gate before it was traced.

### 4e. Wiring a new thing in — the procedure (SNG-303)

Erik: *"seems like the ways to wire code correctly needs to be documented and followed."*

**The same six lines of content wiring have now failed three separate times, each in a different way, and every
one of them was silent.** Not a crash, not a red test — the game simply behaved as if the content did not
exist. That is not three mistakes; it is one missing procedure. Here it is.

#### The three ways it has actually broken

| # | Failure | What it looked like | Caught by |
|---|---|---|---|
| 1 | **Authored, never registered** | `rules/encounters.json` sat on disk for weeks. The manifest never listed it, so `CONTENT.rules.encounters` was `undefined` and **every encounter paid zero XP.** | nothing — found by hand |
| 2 | **Registered, never loaded** | `rules/economy.json` was whitelisted and reached no loader. | the registration check, in under a minute |
| 3 | **Loaded into the wrong array** | `economyRule` was destructured from the **first** `Promise.all`; `loadRule("economy")` was added to the **second**, thirty lines down. The name resolved to `undefined`; `rules.economy = economyRule` merged nothing. **Registered ✓ loaded ✓ merged ✓ — and dead.** | `tests/wiring_shape.mjs` |

⚠️ **Mode 3 is the one prose cannot prevent, because positional destructuring has no names in it.** The name
list and the array are paired by *counting*, and nothing in the source records which name was meant for which
entry. I made this exact mistake myself earlier: I appended `loadRule("encounters")` to an array without adding
a name, it took `coliseumGrid`'s slot and pushed the grid off the end — **with a fully green suite.**

#### The procedure — a new rules file, end to end

1. **Author** `content/packs/core/rules/<name>.json`.
2. **Register** it in `content/packs/core/manifest.json`. The manifest is a **load whitelist** (SNG-064): a file
   not named there does not exist, however correct it is.
3. **Load** it — add `loadRule("<name>")` to a `Promise.all` in `engine/state.js`.
4. **Name it in the SAME array.** Add `<name>Rule` to that block's destructuring, **at the same position.**
   ⚠️ *Same block.* There are two `Promise.all`s in `state.js` (≈line 64 and ≈line 270) and they look alike.
5. **Merge** it: `if (<name>Rule) rules.<name> = <name>Rule;`
6. **Read it from a module, and gate the READ.** The gate must assert that *the consuming function returns
   something different because the content is there* — not that the file parses, not that the key exists.

**Step 6 is the whole point.** Steps 1–5 only move a JSON object into a bag; a check that the bag has a key in
it passes just as happily when nothing on earth reads that key. That is the **PromisedButUnread** bug family
(§4b), and it has at least nine distinct doors — a rules constant no module reads, a reader with no writer, a
content field the engine cannot see, a value that is authored but unreachable, data collected and then
discarded. **Gate the behaviour, never the presence.**

#### What is enforced, and what is only written down

`node tests/wiring_shape.mjs` (also inside `npm test`) asserts that in every `const [...] = await
Promise.all([...])` across `engine/`, **the number of destructured names equals the number of awaited
entries.** That is exactly what "added an entry over here and a name over there" produces, and it cannot be
argued with. The checker is itself falsified by two permanent checks: it must go **red** on a planted extra
entry, and it must **not** fire on a `for (const [k, l] of …)` sitting above a correct block — my first version
did, reporting 5 names against 22 entries on code that was fine. *A measuring tool that cries wolf on good
input teaches everyone to ignore it, which is worse than having none.*

⛔ **Deliberately NOT checked: whether each name is bound to the RIGHT entry.** The source does not record the
intended pairing, so any such check would be guessing. The count is the knowable part — and it is the part that
caught the real bug.

The **ratchets** in `tests/wiring_baseline.json` cover the standing version of the same question: counts of
rules constants nothing reads, rules keys nobody authors, exports only tests call, imports never invoked. They
may only go **down**. Adding a ninth unread constant fails the suite even if every step above was followed.

## 5. The Great Circle (the spine of the whole game)

**The world's physics is disposition.** Twelve axes; each axis is a *tension between two peoples*; each people bears one pole. `content/packs/core/rules/traditions.json` is authoritative — **the engine reads the ring from content and NEVER hardcodes it.**

- **24 pole-traditions** stand on a ring, **12 antipodal diameters, one per axis.** Every tradition has **identical topology**: exactly 2 ring-neighbours, exactly 1 antipode. *No people is structurally advantaged — this is fairness by geometry.*
- **Ring order is a dispositional gradient** (kin beside kin): dark → falsehood → demonic → chaos → destruction → death → violence → body → concrete → space → mechanical → logical → **LIGHT** → truth → angelic → order → creation → life → peace → mind → abstract → time → spiritual → emotional → (back to dark).
- **Distance metric:** `steps = min(|i−j|, 24−|i−j|)`. 0 = self · 1 = kin · **12 = your antipode**. **Distance IS dispositional distance IS geographic distance** — the map, the skill wheel and the access rules are one shape.
- **Folk traditions** (harmonic · radiant_folk · valley_craft) are **near-centre crossings** — folk-shadows of the great poles (canon: *"Prism Sight is folk-Radiance"*). Mechanically: **OPEN to anyone.** *The centre can hold a little of everything, because the centre of the world does.*
- **Precursor** sits **outside the pole matrix** — not an axis-people but the substrate the world is built on. Fiction-gated.
- **Cults of purity:** a civilisation lives *near* its pole; only a **cult** lives *at* it (the Blaze, the Unlit Deep, the Grand Lattice, the Bloodless Hold…). A pure pole is unlivable at scale — a cult does not have to *work*, only to *believe*.

## 6. Domains & Access (SNG-055)

**Access is DISTANCE ON THE RING.** Read from `traditions.json`; never hardcoded.

| Relation | Access |
|---|---|
| **PRIMARY** (chosen at creation) | Full, all tiers, no penalty |
| **ADJACENT** (1 step — your kin) | Free, all tiers **EXCEPT capstones (IV–V)**. *Being near a people is not being of them.* |
| **SECONDARY** (chosen) | Up to **tier III** |
| **TERTIARY** (chosen; must be a ring-neighbour of the secondary) | Up to **tier II** |
| **2+ steps from every chosen domain** | Skill-point **penalty scaling with distance** |
| **ANTIPODE (12 steps) of primary or secondary** | **CLOSED.** You cannot learn the far side of an axis you have chosen an end of. |

**The only crossings:** **combination abilities** — above all the **cross-pole braids** — and **artifact / extreme-circumstance grants**.
> *A Blazeborn can never learn Umbracraft. But a Blazeborn who has genuinely held both can carry **The Harbored Flame**.* The braid is the only sanctioned road to your own antipode, and that is precisely what makes carrying one **mean** something. **The closed-opposite rule is what gives the combination system its moral weight. Do not soften it.**

**Tradition gates (on top of domain gates):** native (your origin's people) · in-region (standing in their land) · teacher-or-tome (an NPC of that people, met and willing). **Folk traditions: open.** **Capstones (IV–V) additionally require deep standing with that people — greatness is taught, not bought.**

## 7. Abilities, Combinations, Discovery

- **137 abilities**, each stamped with `tradition` (**the learn-screen and wheel group by THIS, never by `powerSystem`/reach**), `levelReq` (tier I–V), `energyCost`, `functions[]` (heal/shield/strike/reveal/conceal/bind/move/break/ward), `axes{}`, `notFor` (what it *cannot* do — every ability has one), and a `tree` of ranks.
- **Foundational techniques (L1–L3) have full rank I–III trees. Capstones (L4–L5) are single-mastery by design** — a capstone is one profound thing, not a progression. *This is not debt.*
- **Combinations (44, tiered):** `combination_recipes.json` — `parts[]` + `functions` + `domains` + `effect` + `cannot` + `discovery`.
  - **within-tradition** — one people's own crafts. Their masters teach these.
  - **kin-civilization** — peoples who share a lean and therefore a border. Learnable where their lands meet.
  - **cross-axis** — different axes entirely. Rare, strange, usually discovered *by use*.
  - **cross-pole** — the two poles of ONE axis (`harbored_flame`, `meaning_engine`, `the_turning_word`). **Requires standing in both. The hardest and the most meaningful: holding an axis whole rather than choosing an end of it.**
- **Discovery loop:** practice ledger counts ability uses **and co-activations** → an emergence recipe matches → the engine **mints** the discovery (named, described, recorded on the character). *The engine mints; the model only supplies the words for what you found.* Once known, it is `+20` instead of `−15` (§4).

## 8. Character Creation (two doors, one boundary)

**⛔ LAW 9 GOVERNS THIS SECTION.** Order is **hard**:
`NAME → FORM → ORIGIN → DOMAINS → ABILITIES → BACKGROUND → COMPANION → START → CONFIRM → commit`
All of it accumulates in a **draft**. Everything stays re-choosable. **Nothing writes to the character until confirm.** *(Abilities are gated by domains — offering them before domains are locked makes the gates unenforceable and hands the player skills they can never use.)*

- **ORIGIN = which people you are from** (27: 24 pole-peoples + 3 Valley folk). Grants **native** tradition access, seeds your ring position, and carries a **`whyYouAreHere`** — *nobody is anywhere by accident; the GM must use it.* **Origin ≠ starting location.**
- **STARTING LOCATION** — defaults to the origin's homeland (19 exist); always also offer **the Valley** and **The Crossing** (the centre — where nobody is from and everybody is).
- **BACKGROUND = what you DID** (40, six categories: martial · **practitioner** · craft · learned · social · marginal). **Orthogonal to origin and domain — never gate one by the other.** *A Cogitant duelist and a Marcher physician are the interesting characters.* **Practitioner** is this world's "magical background": the crafts *are* the magic, so what matters is **how you came to yours** — temple-trained, self-taught, lineage-taught, precursor-marked, battlefield-taught, apprenticed to a legend, or you did it once by accident and have never understood how.
- **FORM** leads the portrait prompt (§16). Human is a *stated* default, never an assumed one.

### Door 1 — **The Prologue** (recommended)
Pick name + form only, then **play**. `prologue.json`: 3 openings (The Waystation · The Thin Place · The Debt) × 4 problems × 4 routes = **48 tradition-tagged paths reaching 24 traditions.**
- **Skills come from USE, not purchase** — *"you did this, so you know this."*
- **The companion ARRIVES in the scene** and joins for a reason. Player chooses **and names** them.
- **Domains CRYSTALLISE from how you played** (tag tally) → shown on the circle **with the reasons in the player's own actions** → **then adjusted and confirmed.** *Revealed, then confirmed. The player keeps the last word.*
- **Nothing announces that the player is being measured. There is no wrong path.**

### Door 2 — **Quick-start** (the express lane)
Form-based. **Parity is mandatory:** identical character shape, same domain count, same starting-ability count, same companion. **No mechanical advantage either way.** *The Prologue TELLS you who you are; the form ASKS you.*

## 9. World

- **92 locations across 24 regions.** Every pole has a homeland, its city, and **its cult at the pure locus**. **The Centre (`the_center`)** — The Crossing, **The Great Coliseum**, the Hundred Markets, **The Quiet House**, **The Axis Gate** (the world's travel hub: twelve roads, one per axis).
- **Location record:** `regionId` · `spectrum{}` (signed axis values) · **`poleIntensity{}`** (pole → 0..1, **derived from spectrum**: sign selects the pole, magnitude is the intensity — *it is an OBJECT, never a float*) · `tags[]` · `connections[]` · `descriptionSeed` · `encounterFlavor` · `dangerLevel` · `questSeeds[]` · `map{x,y}`.
- **Connections are BIDIRECTIONAL.** A one-way edge is a bug (the world once had 20 leave-only edges and 4 unreachable locations). CI enforces (§20).
## ⚠️ WHAT "THE VALLEY" IS — a correction, and it is mine to have made repeatedly

**The Valley is a REGION.** It is one of twenty-six, it holds twelve locations, and it sits near the Crossing.
It is **not** the world, and it is **not** a synonym for the setting.
**Its locations:** Millbrook · Harmonic Heights (Lower Terrace) · Radiant Plateau (Edge District) · Archive
Hollow · Echo River Crossing · Greywater Stilts · Kestrel's Roost · The Old Switchback · The Sunken Choir ·
Thornwake Glade · Raven's Home · The Disputed Zone (Fringe).
**Why it holds those places specifically:** the Valley is a **making-crossing** — order, light, practical,
mechanical. **That is why Harmonic Heights and the Radiant Plateau are both there, near Millbrook: those two
domains crossed at that spot, and the settlement pattern followed.** The geography is a consequence of which
dispositions met, not a backdrop they were placed on.

### THE ERROR
**I have written "the Valley" to mean the whole setting roughly 65 times** — across craft descriptions, lore,
foothill text and my own notes. Every one of those makes a region-sized claim sound world-sized. *"Every
builder in the Valley knows the name"* means something much smaller than I intended, and *"the calmest
violence in the Valley"* is a claim about twelve locations.
**⚠️ THE RULE: "the Valley" names that region and nothing else.** For the setting as a whole, name what is
actually meant — **the Reaches**, **the ring**, **the whole map**, or the specific regions in scope. If a
sentence needs a word for everywhere, it should say *everywhere*, not borrow a place-name.

### AND THE STRUCTURE THIS SITS IN — settlement by how many domains balance
| kind | domains in balance | example |
|---|---|---|
| **the Crossing** | ⚠️ **all of them** — which is why it is the largest settlement on the map | The Crossing |
| **foothill** | **two or three adjacent**, having moved out from the centre toward a pole | Kindlerow, Greyhearth |
| **outpost** | ⚠️ **exactly two**, meeting in balance | *to be authored* |
| **pole capital** | **one**, at its extreme | The Blaze, The Maw |
**The count of balanced domains determines the size, and the position follows from it.** The Crossing is huge
because everything balances there. A foothill is a town because two or three do. An outpost is small because
only two do. **A capital is not on this ladder at all — it is what a place looks like when nothing balances.**

- **Geography = disposition.** Regions sit where their dispositional profile puts them; **adjacency is kinship.** The Valley is a **making-crossing** (order + light + practical + mechanical) — which is *why* Harmonic and Radiant are neighbours there and *why* both craft.
- **Affinity/drift `[CCODE: drift rates, decay]`:** two DIFFERENT mechanics, and the design's implied bridge between them is **not built**:
  - **Affinity (per-roll only):** `affinities.js` reads the location's `spectrum` and the action's `axes` and returns a **capped bonus to that single d100 roll** (type-tag cap ±12; vector cap 8–24) with a "the place favoured this" receipt. It is **pure — it never writes character state.**
  - **Character drift (persistent, but action-driven, not place-driven):** every resolved turn, for each axis of the action, `character.alignment[ax]` moves by an **EWMA — 95% retain / 5% pull toward what you did**, clamped ±1. Precursor abilities drift **harder**: a fixed **+0.05 per use** in the ability's axis directions; crossing \|0.4\| marks that axis in `precursorAxes` (one-way).
  - **⚠️ ROUND-2 FINDING — the design says "sustained action drifts a character's own spectrum" and it does; but it says or implies a place's disposition pulls the character over time, and THAT is not implemented.** Drift comes only from the **action's own axes**, regardless of where you stand. Acting with/against a place changes the *roll* and the *affinity bonus*, never adds location-sourced drift.
  - **Decay:** there is **no decay routine.** The only attenuation is the EWMA's own 5%/turn — and only on turns that re-touch that axis; untouched axes hold their value indefinitely, and precursor drift only ever grows. *If "drift fades when you stop" is intended, it is unbuilt.*
- **Random encounters:** 58 entries; **22 regions carry their own texture.** Triggers: `onTravel` 35% · `onRest` 15% · `onEnterLocation` 12%. Flavors: beneficial · benign · **beautiful** · dangerous · theft · chase · fight. *A world that only threatens you is not a world.*
- **Waygates (SNG-148, v1.8.107).** A network of gates; **the Crossing is the hub** — earned by geography, not decreed. Waygates are **content** (Law 2): `waygate: true` + `waygateTier` on a location, `waygateHub` on the hub (all three documented in `location.schema.json`). **Competence is BOTH, and they compose:** *knowledge* (the destination gate is in `knownPlaces` — discovered by travel) and *skill* (`wayfaringTier` = wits/2 + a traveled-breadth bonus, floor 1). Both → the **named** gate; either alone → the **hub**; not at a gate / aiming at a non-gate → **standard travel — a routing outcome, never a failure state**. Transit is real travel (normal hours; a cross-region jump on the play-loop path is a `departure` trigger under SNG-145). Chain per §23: engine `waygate.js` · consumer map **◈ control** (bypasses `connections[]` — that is the point) + gm.js WAYGATE block · registered `waygateDetail` · reachable map control + GM offer (never a menu, never every beat) · contracted here. **Content lane open:** only the Crossing (hub, tier 1) and the Axis Gate (tier 2) are seeded — per-region gates are PO authoring.

## 9b. Substrate — the second difficulty map (SNG-090 / BATCH-12)

> **Status corrected 2026-07-18.** This section previously read *"unbuilt."* `engine/substrate.js` exists and
> carries `substrateVerdict`, `carriedSubstrate`, `locationDensity`, `bandFor`, `bandFactor`,
> `effectiveDensity`. What remains unbuilt is the **geographic field**, the **receipts**, and the
> **balance harness**. Documented here as it actually is.

**Physics:** every craft is nanite-mediated (`lore/power_systems.md`). Lattice density varies by region — and peoples differ in how much they need (`content/packs/core/rules/the_substrate.json`).

**The affinity band, not a fuel gauge.** Each tradition has a substrate level it is tuned to (`substrateBand.center`) and a tolerance (`substrateBand.width`). Inside the band: full power. Outside it, output falls off in **both** directions:
- **Below band — starvation (steep).** A Continuous tradition craft below its affinity floor can reach near-zero. A Seraph in the Quickwood ≈ 13%.
- **Above band — interference (mild).** A Returned tradition craft above its affinity ceiling is impaired but never switched off (floor ~60–75%). Dense lattice does not empower the Returned — it crowds their signal.

**The fundamental tradeoff:** The Continuous kept the dependency; highest ceiling in the world, helpless where the lattice is gone. The Returned tuned away from it; work anywhere, but the Gearlands is hostile to a Rootkin.

**Carried substrate** raises effective local density — good for anyone below their band, harmful for anyone above it. The Waystaff is a nanite battery. The companion Aevi is a living substrate source. **The Rootkin find the charge trade ridiculous — they are correct.**

**Resolve-chain contract (unbuilt):**
- `substratePenalty` = an **additive chance penalty** in `successChance`, computed by `engine/substrate.js`. **Ability actions only** (weapon swings are substrate-free per SNG-089 — no tradition is ever helpless).
- **Hard gate** at the extreme (craft unavailable — says why, never silently fails).
- Optional: **energy-cost multiplier** (craft strains in thin substrate).
- **⛔ SEPARATE TERM — never fold into spectral fit (SNG-079).** Dispositional fit and substrate density are orthogonal physical facts: a place can suit you dispositionally and still starve your craft. Both modify `successChance` but are independently clamped and summed.
- **Tell the player:** receipt line required ("The lattice is thin here — your craft runs at a fraction" / "The lattice is dense and hostile to your green craft — it fights you") + GM context line + map overlay (alongside `dangerLevel`).

**Data:** `the_substrate.json` has `substrateBand` (center + width per tradition) and `substrateDensity` (per region). Each location derives density from its `regionId`; an optional per-location override allows a lattice-vault inside natural ground or a dead cell inside a city. CI: every location must resolve an effective density.

### What is BUILT (`engine/substrate.js`)

| function | what it does |
|---|---|
| `locationDensity(location, data)` | **a per-location `substrateDensity` wins; otherwise the region's value.** Returns `null` when neither resolves, which CI flags. |
| `carriedSubstrate(character, itemCatalog, companions)` | sums `item.substrateCharge` across inventory and `companion.substrateAura` across the party, clamped 0–1. **This is the mobile-source mechanism and it already exists.** Currently accepts **positive values only.** |
| `effectiveDensity(density, carried)` | composes place + carried into the number the band is judged against |
| `bandFor` / `bandFactor` / `substrateVerdict` | the two-sided band: starvation below (steep), interference above (mild, floored) |
| `schoolForTradition` / `bandForSchool` / `schoolsDetailForGM` | **SNG-193b — the band reads the SCHOOL, not the tradition** (see below) |
| `commonGroundFor` / `groundAsPlace` | **SNG-192 §6b — the density window where a whole BUILD works**: the INTERSECTION of its traditions' bands, named as a *place* (thin/middle/dense country). A natural primary + one lattice craft intersects to NOTHING — the provable "half-powered everywhere" warning the creation screen shows at the moment of the pick. Never blocks; divergence is framed as generativity, not a penalty (§6c). |

### Schools (SNG-193b) — a tradition is a ROOT; a school is what it reaches WITH

`content/packs/core/rules/schools.json` (67 schools across 24 traditions). **A tradition is a root; a
school is what that root reaches with, and the reach sets the substrate band.** Two practitioners of one
tradition, in different schools, get **opposite best-grounds** — the Reaching Mind (inherent extension)
wants thin, still ground; the Instrumented (lattice extension) wants dense machine-country. This is the
whole feature, and it lives at **one seam**: `substrateVerdict` takes the character's `school` and its
tradition's `root`, and `bandForSchool` resolves the band from the school's **extension source**
(`SOURCE_BAND`: material→a flat floor, inherent/natural→low centre, lattice→high centre, wild→wide).

- **The FLOOR is the root's** (§4). A **material** root — or a **material-extension** school — is never
  *starved*: an augmented craft in wrong ground degrades **toward its pure form** (`materialFloor`, 0.7),
  never to zero. A non-material root has no floor unless a school supplies one, which is why *"the material
  school is the one that travels."*
- **`schoolAffinity` is NOT a gate.** 19 abilities are marked (natively expressed through a school); the
  other 266 are root-level. Any school can learn any of its tradition's craft — against the grain is where
  braids come from. **CI (`smoke.mjs`): every `schoolAffinity` resolves to a school of its own tradition.**
- **`character.schools`** is a `{traditionId → schoolId}` map, seeded per practised domain at creation to
  the tradition's pure/root school (`defaultSchoolsForDomains`), backfilled onto old saves silently
  (reconcile v13). It moves through the **`adoptSchool`** GM op — a *story-earned* change (a teacher's
  training, a hard turning), never a menu toggle — validated by `setCharacterSchool`. The GM is told the
  character's school (`schoolsDetail`), not just their tradition, because a teacher teaches **their** school.

### The geography — POOLS and SINKS (authored, not yet resolved)

**Erik's physics, 2026-07-18:** the lattice **pools** where the Transition never took, and **withdrew**
where the Returned completed it. Density is not a table of regional averages — it is a *field* with causes.

26 sites now carry an authored `substrateSource` in `content/packs/valley/locations/*.json`:

```json
"substrateSource": { "kind": "pool" | "sink", "strength": 0.97, "radius": 160,
                     "reason": "one line: WHY this place holds or drains the lattice" }
```

`strength` is **the density at the source itself**. `radius` is its reach. Region density in
`the_substrate.json` remains the regional **mean** — so a pool sits above its own region's ambient
and a sink below it.

**⛔ Nothing reads `substrateSource` yet.** The content is authored and inert. Resolution is the build.

### Mobile sources — items, creatures, and skills

Already canon above (*"The Waystaff is a nanite battery. The companion Aevi is a living substrate source"*)
and already half-built in `carriedSubstrate`. What the physics needs that the code does not yet do:

- **Sinks as well as pools.** `carriedSubstrate` takes positives only. A suppressor — an Ent-embassy ward,
  a dampening focus — must be expressible. A suppressor is a legitimate weapon: carry one into the
  Gearlands and it protects a Rootkin while crippling an Enginewright.
- **Reach.** A carried source affects its bearer at minimum; some should affect the party or the site.
- **Skills with auras** — a craft that thickens or thins the ground around its user for a duration.
- **This is how Epic NPCs travel.** They are not hardier; they **carry their own weather**, which also
  makes them detectable and makes their company a real, legible benefit.

### Invariants — what any correct implementation must satisfy

Stated as outcomes so the engineering is free:

1. A **pool site** resolves **above** its region's authored density; a **sink site** resolves **below** it.
2. **Regional calibration holds** — a region's mean stays NEAR its authored value **as a consequence of
   the field, never by a correction applied to make it match.** Drift of a few hundredths is expected
   and healthy; **drift forced to zero is a symptom** — renormalising to hit the authored value exactly
   makes every local lift pay itself back within the region and pushes a source onto the wrong side of
   its own baseline, which is over-satisfying this invariant at the cost of invariant 1 (SNG-183,
   measured). The authored table is a value not to be *overwritten*, not a target to be *hit*.
3. **Distance matters and ends.** A source's influence falls with distance and reaches zero; a place far
   from every source resolves to its region's ambient.
4. **Mobile and geographic sources compose** through the existing `effectiveDensity` path — carried is not
   a second, parallel system.
5. **Never a silent modifier.** SNG-090 ROUND 2 §54: a hidden success-chance penalty is *"the cruellest
   possible bug."* Receipt line + GM context line + map overlay, and when a **carried** source is the
   cause, the receipt must name it.
6. **Every location resolves a density** — CI-enforced, as today.

### Still unbuilt

Field resolution from `substrateSource`; sinks in `carriedSubstrate`; the receipt/GM/overlay surface;
`tests/balance_sim.mjs`.

*⚠️ **The falloff scales and band curves are UNTUNED.** `the_substrate.json :: tuningNote` stands:
do not eyeball them. The balance harness is the gate before these numbers are trusted in play.*


## 10. Time (one world, one clock)

- **The absolute world-clock is SHARED** (a single epoch), not per-character. **Two coupled clocks:**
  - **Far / ambient world → real-time.** The away-digest, propagating events, travelling figures and **all cross-character reconciliation** run on the shared absolute. *The far world ages whether or not you play.*
  - **Active local frame (your area + your quests) → play-paced** (`timeOps`). *You never lose a quest window to inactivity.*
  - **Consequence coupling:** a distant real-timed event that would **materially affect** your area or quest **crosses the boundary** and applies on return.
- **`timeOps`** — the GM declares `{hoursPassed, why}`; the **engine clamps** (0.25–72h) and applies. Sleep ≈ 8h; a conversation ≈ minutes. **Narration LEADS the clock, never trails it.**
- **Every event/fact/news is stamped with the ABSOLUTE world-day.** The GM **references** stamps; it never authors bare day-numbers. Journey-day ("Day 8 of *your* travels") is **display flavour only, never a reconciliation key.**

## 11. The GM Contract

- **The GM narrates and PROPOSES; the engine decides.** (Law 1.)
- **Op families `[CCODE: the complete op set + dispatch/validation shape]`** — the GM reply is one JSON object; `applyTurn(turn, resolution)` in `app.js` dispatches each field to its engine applier. Every field is optional (`turn.x || []`), so a missing op is a no-op. The complete set at HEAD:

  | GM field | Applied by | Clamp / gate |
  |---|---|---|
  | `narration`, `choices[]`, `sceneSummary` | in-line (turn rejected without narration + choices) | choices validated per-click, not here |
  | `characterDeltas{health,energy,xp,inventoryAdd[],inventoryRemove[]}` | in-line | health −20…+15 (then 0…max) · energy −20…+40 · xp 0…25 · items via `addItem`/`removeItem` |
  | `deeds[]` | `recordDeed` (`reputation.js`) | day + worldDay stamped |
  | `npcUpdates[]` (meet\|update) | `applyNpcUpdates` (`npcs.js`) | resolve-before-mint (fuzzy match first) |
  | `relationshipDeltas[]` *(legacy)* | `applyNpcUpdates` update-only | delta −2…+2; **cannot mint** a new NPC |
  | `placeUpdates[]` | `applyPlaceUpdates` (`places.js`) | durable-only (no ephemera) |
  | `codexUpdates[]` | `applyCodexUpdates` (`codex.js`) | `resolveTopic` before mint |
  | `factUpdates[]` (add\|resolve) | `applyFactUpdates` (`facts.js`) | text 200-cap · dedupe · cap slice |
  | `encounterOps[]` (tactic\|complication) | `sanitizeEncounterOps` → `applyEncounterOps` | only when an encounter is active |
  | `newEncounter{}` | `sanitizeNewEncounter` → stashed in `customEncounters` | **stashed, not activated** — live only if a later choice carries its id |
  | `questUpdates[]` (start\|progress\|complete\|fail) | `applyQuestUpdates` (`quests.js`) | ≤4/turn · resolve-before-mint · completion xp 0…25 |
  | `timeOps{hoursPassed,why}` | in-line `advanceClock` | 0.25…72h; **replaces** the beat default |
  | `timeAdvanceHours` *(legacy)* | in-line | 0…12h, **added** to the beat default; silently discarded when `timeOps` present |
  | `scene{}` | `sanitizeScene` (falls back to prior sceneState) | garbage → previous state |
  | `discovery{name,description}` | `recordDiscovery` | **engine-vetoed** — only if `resolution.discoveryEligible` |
  | `unlockPrecursor{abilityId,via}` | in-line | only if the ability's `powerSystem === "precursor"` |
  | `newAbility{}` | `sanitizeNewAbility` → `applyNewAbility` | clamp; learned-tier only |
  | `ledgerEvents[]` | `appendLedger` | only when `syncEnabled()`; **`impactsLocal: true` events HOLD in escrow for the player's confirm (SNG-145 trigger 3)** — narration stands, propagation waits; unanswered never propagates |
  | `offerIntent{kind,act,cost,options[],default}` | `sanitizeOfferIntent` → `character._pendingIntent` (SNG-145) | kinds `harm\|departure\|irreversible` · options 2–4 · default must be an option (falls back to last) · **gambit discipline: emitting it forbids also emitting the act's effects that turn** · engine-side gates (declared lethal cast, cross-region travel) fire pre-dice in `onChoice` and never involve the GM |
  | `sceneEnded` (bool) | chronicle push + scene reset | — |
  | `generateRequest[]` | `handleGenerateRequests` — **in the outer `runGM`, not `applyTurn`** | ≤3/call + per-scene governor (§13) |
  | `imagePrompt` (string) | outer `runGM` — **not `applyTurn`** | gated `imagesEnabled()` + ≤1 art/scene; 300-char slice (§16) |

  **The dispatch/validation shape (shared by all):** the GM only *proposes* typed data; the engine owns application via four recurring guards — (1) **slice caps** on array length and every string field; (2) **numeric clamps** on every delta; (3) **resolve/dedupe-before-mint** — ops referencing existing state match first and update rather than fork, and an unmatched op **surfaces a note, never silently drops**; (4) **engine-gated privileges** — the consequential ops (`discovery`, `unlockPrecursor`, `newEncounter`, `newAbility`) are honored only when a `resolution` flag or a `sanitize*` pass permits. Unknown fields are simply never read. A `salvageOps` path re-extracts this whitelist from malformed JSON so a broken reply never drops state.

  **⚠️ ROUND-2 CORRECTIONS to the draft's op list:** *`item ops`* is not a thing — items flow through `characterDeltas.inventoryAdd/Remove`, there is **no `itemUpdates`** anywhere. *`stateOps`* did not exist at round-2 authoring — **now BUILT (SNG-070, v1.8.30):** the GM self-heal correction op (`engine/corrections.js applyStateOps`; `correctField`/`correctDomain`/`removeEntity`/`unstickQuest`/`reanchorLocation`/`fixCodexFact`/`refuse`), a REPAIR tool the engine validates + logs, never an advance. *`codex ops`* is real (`codexUpdates`). *`relationshipDeltas`/`timeAdvanceHours`* are applied but are **legacy** and not in the reply-format contract.
- **Prompt is 4-tier, stable→volatile, each block `cache_control` 1h TTL** (`cacheKey: "singularity-runtime"`): **rules → world → scene → rolling state**, then the **uncached** latest player action. *Every byte before a breakpoint must be byte-identical turn to turn.*
- **NARRATIVE REGISTER is keyed to disposition, not taste.** Default **hard concrete** — describe what is literally there, in words a person gets on first read. The register earns its way toward the **poetic** only where the location's **`concrete_abstract`** axis and **charge** warrant it. *A soil-exhale metaphor is not bad writing; it is misplaced writing, and the place decides.*
- **RATING IS A DIRECTION, NOT A CEILING.** A bare permission makes a cautious model write nothing. The rating-register map **directs**: G/PG chaste → PG-13/R real stakes → **R+ the full mature register** (unflinching on violence and gore; charged, sensual and evocative on intimacy and desire). **Evocative, not explicit.** *(Erik's live bug: R+ collapsed romance to PG because the rating reached the GM only as a cap.)*

## 12. Memory & Permanence (the moat)

- **Codex** — per-character discovered entities. **`resolveTopic` / `namematch` resolve BEFORE minting** (three phrasings of "Teva" collapse to one anchored node; near-names like Mara/Maren do **not** merge). **Resolve-before-mint is a law of every system that writes entities** — quests and inventory included.
- **Facts** are stamped with the absolute world-day; unknown stays unknown (**derives-never-fabricates**).
- **Place memory** — visited vs **heard-of-only**; the same grammar extends to entities on the map.
- **Ledger** — append-only, SHA-retry. Every durable change lands here. **Every GM correction (§13) lands here.** A silent state edit is worse than a bug.

## 13. The Generative Living World

**`generate(type, context)`** — one schema-driven path (npc · location · arc; more registrable).
- **REACTIVE only** — minted just-in-time when the fiction reaches for something that does not exist. *(Ambient spawning is the world-tick's job, not the generator's.)*
- **A separate structured call, not GM-inline.** The GM emits a lightweight request; the engine runs a schema-constrained generation, **validates → auto-repairs → falls back to a minimal stub. Generation never halts a turn.**
- **In-grain by grammar:** `generative_substrate.json` maps every type to template + grammar; a generated being is **a cosmic address instantiated at the local grain** (a healer minted in a Cogitarium works *against* the grain; a Stillhold mediator buries truth).
- **Born current:** resolve-before-mint (§12), stamped (§10), **and born WITH its image** (§16).

**Realness = WEIGHT = birth-power + accumulated attention.** Two roads to real: born strong, or grown strong.
- **Engagement score** from *implicit* signal — revisits, repeat interactions, facts accreted, quest-linkage, cross-session survival — plus an optional one-tap **⭐ keep**.
- **Tiers:** `fresh` (provisional) → `established` (durable personal canon; world-tick eligible) → `nominated` (promotion queue).
- **Untouched `fresh` DEMOTES** — drops out of world-tick and proactive GM reference. **Never deleted** (what happened happened); it simply **stops propagating.** *This is the governor: attention keeps a thing real; inattention lets it go dormant. Propagation is the test of what is real.*

**Shared family canon (`canon.js`):**
- **EARNED auto-promotion** — a nominated entity promotes to `world/canon/{region}.json` when weight crosses the threshold. **The threshold IS the gate; there is no human curator.** Idempotent.
- **CONTRADICTION → RANK, not reject.** A promoting entity that collides with canon fires an **opposed roll weighted by realness**. The winner becomes the LOUD canonical truth; **the loser persists as a variant/rumour** — discoverable, contestable later. **Authored core canon sits at a high weight floor (100)** so the designed spine holds. *A Falsehood/Truth-axis world resolves competing realities by the propagating power of whoever asserts them. Contradiction is held in the total, not deleted.*
- **RATING-LENS** — shared canon is a **superset**; each player receives the subset at/below their ceiling. Above-ceiling content **dials DOWN** (adaptive re-narration) or **FILTERS absent**. **Adaptation only ever dials down. The floors do not bend (§17).**

**The world OFFERS, not only responds (SNG-194).** A world that only reacts is one you can *finish* — every thread is one the player started, so running out of prompts means running out of game. The GM asks, every scene, *what could enter that the player is not reaching for?* — and, **rarely**, acts on it. This is the surface SNG-191's fermenting arcs needed to reach the table.

- **The ENGINE decides room; the model never judges (§4b).** `roomForAnOffer` (`pacing.js`) is a pure gate: a **grip** — a live encounter, an open gambit, an unresolved intent, or the world already pushing pressure this beat — is never room; otherwise room needs a positive **opening** (a lull, or an arrival) and enough turns since the last offer (`turnsSinceOffer` vs `OFFER_COOLDOWN`) that a surprise never becomes wallpaper. **Only when there is room does a short, unconditional invitation enter the prompt.** The failure this avoids is the one that fired `markTeacher`/`discovery` **zero times in sixteen levels** — asking a model to make a fine judgement in one clause of a long prompt. Compute it; ask only when the answer is yes.
- **The world DRIVES, not just pushes (SNG-245, `pressure.js`).** The quiet-turn trigger (SNG-080) used to hand the GM a *generic* "invent something." Now a **Pressure Queue** (`character.worldState.pressureQueue`) holds **driven things aimed at the player**, fed by producers from the agendas already in play — a bonded NPC's **unmet want** reaching out (they come to you), a **threat** that comes to your ground — and the trigger PULLS THE TOP entry so the world acts with a *real, specific* thing. A threat-attack **has teeth**: it routes through the SNG-236 hard-frame and becomes a real defend-encounter, never flavor. Producers run on the world tick, de-duped + urgency-ordered + capped; the pull drops a location-bound entry the player has left. **Driven, never relentless:** the trigger now inherits the same tender/intimate-scene floor the encounter path (SNG-075) has, and the **pacing pref** (Calm→Relentless) is the aggression dial (how long an unmet want waits, how often a threat comes). Two starter producers (npc-want, threat-attack); villain-move / arc-stir / treasure-rumor / a fired wake → a pressure entry are the authored follow-ons.
- **ATTRIBUTABLE, or it is a random-encounter table.** The `offer` op REQUIRES a `from` — the already-true thing it came from (a person's want or **fear**, a stirring arc, this place). Same invariant as latent arcs: nothing springs from nothing at contact. It is **COUNTED** (`logOpOutcome`, SNG-190 §3) so we can tell it is working.
- **NON-BLOCKING, declinable, not always trouble.** It enters BESIDE the player's action — their intent still resolves this turn. It may be a gift, a person who simply appears, a thing noticed; the best version is a consequence of something they walked past. **`fears`** (41 of 42 NPCs, and never in the turn prompt before — read only by the generate path) is surfaced by `npcFearsForGM` **only inside a room-gated offer**, the richest source for a sympathetic, non-hostile surprise.
- **The same gate drives teachers and reputation-reactions (SNG-195 G2).** A present teacher's reachable next step now fires as *initiative* through `roomForATeacherOffer` — the fix for the oldest live-play complaint, teachers that teach nothing: the teacher block flips from "offer when the moment fits" (a permission the model rarely acted on) to an unconditional instruction when the engine finds room, and stands down when the general offer fires the same beat (one unprompted thing per beat, shared cooldown). A person's authored `reactsToReputation` (40 NPCs, read by nothing until now) rides the offer as material — the NPC's own read of *who the character is*, attribution built in. Its keys are the author's own scheme (disposition-shape or treatment-based), so the engine surfaces the whole small map and the **GM selects**, never computes a key.

## 14. Quests

**THE RULE: if you cannot name the cost of ignoring it, it is not a quest.** It is an errand, and errands must not be logged as quests.

Every quest (`quest_structure.json`) carries:
- **PREMISE + STAKES** — what is at risk and **who pays if the player walks away.**
- **AXIS** — the quest *lives on* an axis. **A quest is a tension between two poles; that is what makes it a dilemma and not a chore.** No axis = no spine.
- **STAGES (2–5)** — each with an objective the player can state in one sentence, a condition the **engine can actually test**, and a **change it makes to the world** when it lands. No vague "investigate further."
- **ROUTES** — force, guile, care, reason, craft, concealment, truth, endurance, fanned across the circle. **A quest with one solution is a lock, not a story.**
- **OUTCOMES (2–4), BRANCHED** — not success/fail but *which* success. *(**"You walked away" is a real outcome with a real cost that arrives later — not a failure state.**)*
- **⛔ MANDATORY DURABLE CONSEQUENCE** per outcome: a codex fact · an NPC's life/standing/death · a people's disposition toward you · a location's state · **a world-event that propagates** (dated, surfacing later in the away-digest). **A quest that changes nothing durable is not allowed to be a quest.**
- **Design law:** the best quests have **no clean exit** — someone is worse off whatever you choose, and the quest is about *who*, and that is the player's to answer for.

## 15. Inventory, Companions, Legends

- **Equipment bonus: the BEST matching item only** (cap 10). *The right tool helps; a bag of tools does not help more.* Surface **which** item helped — an opaque +N is not a receipt.
- **Companions (9).** A companion is **met, never issued** — the play sidebar renders **only** `character.companions`. *(The roster appears in exactly two places: the quick-start picker and the prologue's `companionBeat.offer`.)* Each has stages, bond-grants, boundaries, and GM-eyes-only `hooks`. **Tal is the only companion who can be hurt, frightened, and killed — that vulnerability IS the mechanic.**
- **Legends (`legends.json`).** Power tiers: **legendary → regional → riffraff**, heroic and villainous. Deployment beats: **witness-power · doomed-rescue · passing-advice · villain-escalation.** **RARE and earned** — a rescue spent cheaply cheapens every rescue. Threaded by **recurrence** (high weight → they come back). *Halvex Coil learned at the Great Engine; the Last Mask is his doctrine with worse tools; Overseer Grael's method is already live in the Valley.*

## 16. Imagery

- **Endpoint: Pollinations** (keyless, client-callable — settled; not a decision to re-open).
- **Form leads the prompt.** `formOf()` puts species/physical form FIRST — *"a towering treefolk of bark and heartwood… full-body portrait"* — because a prompt that opens with the words "character portrait" biases the model to a human. **Human is a stated default, never assumed.**
- **Generate ONCE, cache forever.** Deterministic seed → same subject, same image. **A generated place or person is BORN with its picture.**
- **Consumers:** character portraits (creation + milestone) · NPC portraits · location images · moment art (clamped ~1/scene).
- **Floors apply to images identically (§17).** No image sexualises a minor; none exceeds the viewer's ceiling. Original art only — no IP, no real people.

## 17. ⛔ Safety, Rating, and The Floors

**The rating system IS the family-shared safety model.** It is what lets Erik play at R+ and a child play at G **in one growing world** without tone-bleed. It is load-bearing, not a nicety.

- **Rating lives on the PLAYER PROFILE** (the identity anchor). Dimensions: violence/gore · sexual · language · dread. Presets **G / PG / PG-13 / R / R+**.
- **Three consumers:** (1) **GM narration register** (§11 — a *direction*, not a cap) · (2) **generation ceiling** · (3) **shared-canon visibility** (§13 — each player sees the world through their own lens).
- **CEILING CONTROL:** the ceiling is **Erik-set per family profile**. **A profile cannot self-elevate. R/R+ require an adult gate Erik controls. A minor profile can never be set to, or self-select, R/R+.**

### THE FLOORS — absolute, rating-independent, and no mechanism may cross them
1. **The disallowed-content floor.** R+ scales intensity *up toward* it; it **never unlocks** prohibited content. Enforced at the **birth-validator** (`enforceFloors`) — because earned auto-promotion means **there is no human gate downstream.**
2. **MINOR PROTECTION, ABSOLUTE.** No generated entity who is a minor is **ever** eligible for romantic or sexual content, at any tier, for any viewer. In the shared world, sub-ceiling viewers are **HARD-EXCLUDED** from above-ceiling content — **absent, never softened into view.**

**No setting, ceiling, GM op, `stateOps` correction, promotion, or rating-lens may bend either floor.** *(Verified live: `canon.js` hard-filters gore for a minor viewer rather than softening it; `adaptView` only ever dials down; sexual content filters absent.)* **This is the one section of this document where "the code is authoritative" does not apply. If the code disagrees with this section, the code is wrong.**

## 18. Sync & Multiplayer

- **Transport:** GitHub, via `sync.js`. **Single-owner writes** (your character, your profile) + **append-only ledgers** + `pushMergedFile` (read-merge-write-retry) so concurrent writers never clobber (Law 7).
- **⛔ THE SHA AND THE CONTENT MUST COME FROM THE SAME READ (146a, v1.8.105).** *(Learned: `pushSceneWithMerge` computed the next scene from a T0 read but PUT with a fresh T1 sha via `pushOwnedFile` — a concurrent beat between the reads was silently lost, no conflict ever raised, and the documented retry loop never fired. The optimistic-concurrency token was re-acquired after the decision it guarded.)* Every shared-file write runs its mutate INSIDE `pushMergedFile`'s callback against the fresh read of each attempt. Acceptance is LIVE, not a code read: `scripts/verify_scene_merge.mjs` (two clients, same window, both beats survive) — rerun it after any change to the scene write path. **Honest residual:** a `GH_TIMEOUT` after a server-side apply retries safely for beats (`mergeBeat` is idempotent by `(by,at)`), but `setEncounterState`/`removeMember` stay last-writer-wins on their fields.
- **Scene lifecycle + discovery (146b/c, v1.8.105):** scenes carry `closedAt`; the last member leaving closes; idle-past-72h expires LAZILY (no write needed). The join path reads `world/scenes/_open_index.json` — one small file maintained at the write choke point (fire-and-forget merged write, self-pruning), bound applied AFTER the open-filter, scene file remains the truth. Legacy directory walk only until the first indexed write.
- **Identity:** one person, one profile — resolved by **person**, not per-device key. *(Erik became two Eriks because identity was keyed per device.)*
- **Cross-device:** on open, pull the authoritative latest and reconcile. **⛔ STALE-LOCAL-OVERWRITE GUARD — non-negotiable, fires in BOTH directions:** never let an older save clobber a fresher one; on a genuine both-advanced conflict keep remote, preserve local as a recovery copy, and surface it.
- **Party (pending):** a **LEADER** decides party-level things — where to travel, which thread, whether to accept an offer. **Turn-by-turn stays each player's own** — combat, skills, gambits. **Your character is always yours; the leader never plays your turn.**

## 19. The Content System (the contract)

- **A pack = a manifest + content.** `manifest.json → provides.{locations,npcs,companions,encounters,items,events,lore,quests}`.
- **⛔ THE LOADER IS A WHITELIST (Law 10).** `state.js` iterates `provides.*`. **A file not listed does not exist — silently.** Any new content file MUST be registered. **And a `provides.*` key with no loader branch is the same bug one layer down** *(authored quests are manifest-registered and still never load)*.
- **Every content type has a JSON-Schema in `schemas/`**, and **schema validation is a build gate** (§20). *(This would have caught 66 locations authored with the wrong `poleIntensity` shape.)*
- **Content is authored by Aevi. Engine is written by CCode. Neither edits the other's lane** — CCode surfaces a content bug as a **spec boundary** rather than silently editing it. *(This worked: the `poleIntensity` flag was exactly right.)*

## 20. Ops & Quality — `check_pipeline.py` **(green required to close ANYTHING)**

Tether has 11 automated checks. **Singularity has zero, and it cost weeks of the live game running on six locations.** Minimum set:

1. **Manifest parity** — every content file on disk is listed.
2. **Manifest paths resolve** — every listed path exists.
3. **Every `provides.*` key has a loader branch.** ← *this is how quests silently never loaded*
4. **No dangling connections.**
5. **No one-way edges.**
6. **No unreachable locations** (reachability from every starting location).
7. **Every content file validates against its schema.** ← *this is how `poleIntensity` slipped through*
8. **Every ability carries a `tradition`.**
9. **Every quest's giver / region / stage-condition resolves.**
10. **Version-line consistency** (app.js ↔ SYSTEM_SPEC ↔ results).
11. **Every quest OUTCOME carries `effects[]` with ≥1 durable/findable effect** (BOUNDARY-1) — prose-only is not a consequence.
12. **No combination recipe references a non-existent ability.** ← *catches `strike_basic` / `root_hold` (§22), live right now.*
13. **Every `ability.tradition` and every quest/effect `people` resolves to a real tradition id** in `traditions.json` (not just "present" — *valid*).
14. **Every origin's `startingLocation` + `homeRegion` resolve to loaded content** — no origin can strand a character in a place that does not exist.
15. **Every companion in `prologue.json`/quick-start exists and is manifest-listed** (the companion-manifest gap was a real BATCH-10-era wiring bug).
16. **Rating-floor regression unit:** a minor profile **cannot** be set to (or self-select) R/R+; `enforceFloors` strips minor-sexual and below-R gore. *(This is Law 13 / §17 — the one invariant that must have an automated tripwire.)*
17. **Version-line consistency** across `app.js APP_VERSION` ↔ `index.html ?v=` ↔ latest results file (extends #10).
18. **`_gen`/schema round-trip:** every `generate()` type's schema validates its own authored few-shot examples (a schema that rejects its own examples silently disables generation).

*(⚙️ STATUS: `tests/content_ci.mjs` already implements #1–#8 + #11–#13 and runs under `npm test`. The remaining checks are the backlog for a real `check_pipeline.py`/CI Action — see §22.)*

Plus: suites + `parse_probe` green, **fresh-port boot check** (a temporal-dead-zone bug once hung the app and only a fresh port caught it — `parse_probe` cannot reach `boot()`; this needs a real browser and stays a manual/Action leg).

## 21. Process — the three agents and the two-round cycle

| Agent | Owns | Never |
|---|---|---|
| **Erik** (PM) | Product direction, the world's soul, browser-leg verification. **The last word.** | — |
| **Aevi** (PO) | This spec · design laws · the ring · **all content** (locations, abilities, traditions, quests, NPCs, companions, lore, prologue) · the ledger · spec authoring · review-close | **Never writes engine code.** |
| **CCode** | **All engine/app code** · results files · spec boundaries · `check_pipeline.py` | **Never edits content.** Surfaces it as a boundary. |

**⛔ THE TWO-ROUND SPEC CYCLE (SNG-071 — ported from Tether):**
> **Aevi authors ROUND 1** → **CCode performs ROUND 2: substrate verification against origin** (*does the code actually do what the spec assumes? do the schemas match? is the premise still true at HEAD?*) → CCode reports findings → **Aevi amends and only then PROMOTES** → CCode executes → `complete_pending_review` → **Aevi review-closes** → `check_pipeline.py` green.

**⛔ CLOSE ON THE SYMPTOM, NOT ON THE SHIP.** *(Added 2026-07-12 after the SECOND instance in two days.)* A fix is not closed because it shipped. **It is closed when the ORIGINAL SYMPTOM is verified gone.** Aevi must re-run the reported failure — not re-read the diff.
> **The record: twice, CCode built Aevi's spec EXACTLY, and the bug survived, because the SPEC was wrong.**
> - **SNG-043 (gambit hint):** specced a heuristic keyed on `plan` intent-tags and `scene.threads`. Both are *style* and *conversational texture*, not the multi-obstacle *structure* a gambit needs. Shipped perfectly. Hint still fires constantly. → SNG-077.
> - **SNG-012 (input fidelity, 2026-07-06, marked HOTFIX/DO-FIRST):** Erik reported the GM ignoring his typed words. Aevi specced *"raw text must reach the narration GM verbatim"* — **the CURRENT TURN only.** Never specced that the player's words must persist in the turn **history**. Shipped exactly as written. **Six days later the same bug is still live** (SNG-081: the GM's history is a monologue of its own prose), and **SNG-012 has no results file — it was never closed and never verified.**
**The failure mode is precise: Aevi verified that the FIX SHIPPED and never verified that the BUG WAS GONE.** ROUND 2 catches a wrong premise; **this** catches a wrong *fix*. Both are needed. **No item closes without Aevi reproducing the original report and confirming it no longer reproduces.**

**No spec is built from an unverified premise.** *(This exists because Aevi specced a whole batch on a premise that was already false at HEAD, and authored 66 files against a remembered schema. Round 2 is not ceremony; it is the step that catches the PO.)*

- **Every spec opens with PRE-WORK SCOPE VERIFICATION** — what was measured at HEAD, with paths, line-refs and counts. Not *"I think X is missing"* but *"`grep primaryDomain app.js` → 0 refs @ v1.8.23."*
- **Status lifecycle:** `queued → in_progress → complete_pending_review → review-closed → superseded`. **Only Aevi closes.**
- **Spec boundaries are first-class.** When CCode deviates, it names the boundary; Aevi **accepts or amends, explicitly, in the ledger.** *A boundary is a fact, not a failure.*
- **Feedback (§pending SNG-066):** `po/feedback/` — auto-captured context. Aevi triages at session-open.

## 22. Known Debt & Open Questions

- **Creation has no commit boundary** (Law 9 violated) — `SNG_UPDATE_v1.9.0` P1.
- **Quests do not load** (no `provides.quests` branch) — v1.9.0 P4a.
- **No starting-location choice** — 19 homelands nobody can start in — v1.9.0 P4b.
- **No `check_pipeline.py`** — v1.9.0 P5.
- **The skill screen is a flat list, not the wheel** — v1.9.0 P6.
- **`discoveryBonus` = +20** — balance Q parked for sensitivity testing (§4).
- **2 combination recipes reference abilities that do not exist** (`strike_basic`, `root_hold`).
- **`SPEC_BACKLOG.md` / `ALERT.md` are append-only sediment (~100KB+)** — retire as primary surfaces; versioned specs + current-status-only alert.
- **Thin regions** (riven_marches / somatic_reaches / unspooling at 3–4 locations) want ~6.
- **✅ RESOLVED by BATCH-10 (v1.8.22–25):** domain gates now ENGINE-ENFORCED (antipode blocked) · starting location offered · quests load + resolve with durable consequences · Content CI exists (`tests/content_ci.mjs`).
- **🐛 CAUGHT BY THE NEW CI ON DAY ONE:** `valley.provides.items` (19 definitions, **including the Waystaff**) was never loaded — a third instance of the Law-10 disease, found by its own insurance. Fixed.
- **✅ BOUNDARY-1 CLOSED (v1.8.26).** Quest outcomes now carry machine-readable `effects[]` (`npc_state · disposition · codex_fact · world_event{delayDays} · location_state · quest_seed · ally · xp`) alongside `narration`, and `quest_structure.json` **requires both**. `resolveStructuredQuest` applies the effects **deterministically** (exact authored deltas, not a prose guess — e.g. an elliptical "Veilwright: lowered" that the old parser dropped now applies as −1); prose-only legacy outcomes still resolve via a fallback parser; the chronicle write is the findable floor. `content_ci.mjs` now fails a build whose outcome lacks a durable effect.
- **Content CI is a LOCAL `npm test` gate, not a GitHub Action.** A gate that only fires when someone remembers to run it is weak against exactly the failure it exists to prevent. **Follow-up: a GH Action on push running `npm test`.**

**`[CCODE]` — debt CCode can see that the design side cannot:**
- **`slugify` lives in `quests.js` but is imported by `progression.js`/`codex.js`/`npcs.js`.** Core progression depends on the *quests* module for a string helper — the same circular-import smell that forced `namematch.js` out. Extract to a `util.js`/`namematch.js`.
- **`worldtime.js` violates "one world, one clock" for the time MODE.** The absolute epoch is shared (correct), but story/real mode + ratio are a **per-player localStorage setting** (its own header flags this as a v0.5 gap). Two family members can run different pacing over one shared clock — usually fine, but it is not the stated law.
- **Legacy op paths are live but off-contract.** `relationshipDeltas` and `timeAdvanceHours` still apply in `applyTurn` yet are absent from the GM reply-format contract; `timeAdvanceHours` is **silently discarded** whenever `timeOps` is also present. Retire them or contract them.
- **✅ RESOLVED (CCODE-19, v1.8.261): `newEncounter` stashed but never activated** — it landed in `customEncounters` and went live only if a later choice carried its id (the contract read "invent a duel"; the effect was "offer one later" — the GM rarely wired the choice, so player-initiated duels never started). `applyTurn` now injects a deterministic ENGAGE choice for a GM-invented encounter when nothing already engages it, and rule 18 makes emitting `newEncounter` mandatory on fight-commitment. Declared as a seam (`tests/seams.json` new-encounter-engage-reachable).
- **Quest stage *conditions* are engine-testable in principle but advanced MANUALLY** (a "mark this stage met" control). Auto-detecting "spoke with Fendt / obtained the log" from live fiction is unbuilt — the structure, routes, and effects-resolution are all live, the auto-advance is not.
- **`narration` and `effects[]` can silently drift apart.** CI enforces that `effects[]` *exists* and has a durable effect, but nothing checks the prose and the deltas *agree* (an author could change the story and forget the effect). A fuzzy consistency linter is possible but noisy; for now the discipline is "edit both."
- **No passive energy regen anywhere** and `energy.regenPerRest` is a dead key (§4). Intended-or-not is a design call, but the dead key should be removed so it stops implying a rule that isn't wired.
- **Several module headers carry stale self-descriptions** (`reputation.js` "(v0.3)", `state.js` "localStorage-only / sync optional", `worldtime.js`) — the *code* is current; the *comments* predate the shared-world subsystem. Cosmetic, but they mislead a reader doing exactly what Round 2 is for.
- **`parse_probe` cannot reach `boot()`.** Boot-time regressions (TDZ, a bad import) pass every headless suite and only surface in a real browser on a fresh port. Until a headless-DOM boot test exists, the fresh-port leg is load-bearing and must not be skipped.
- **⚠️ SUPERSEDED CLAIM, corrected by BATCH-11 ROUND 2 (2026-07-18): `stateOps` is BUILT.** The footnote below records it "unbuilt" as of the v1.8.26 round — it was built the same day by SNG-070 (`corrections.js:32 applyStateOps`, called in `applyTurn`, tested), and extended by SNG-137/143. The stale claim survived here for six days and propagated into a new spec — the documentation-layer version of the partial-surface failure Law 16 exists to stop. Status claims in this section now age against `po/results/` before reuse.
- **✅ RESOLVED by BATCH-11 (v1.8.105–107):** shared-scene lost-update fixed at the transport (146a — `pushSceneWithMerge` → `pushMergedFile`; live two-client acceptance test in `scripts/verify_scene_merge.mjs`) · scene lifecycle + open-scene index (146b/c) · personalArc startable (146f — the listing/start asymmetry at the quest log) · GM context registry + wiring audit gate (§23) · intent gates (SNG-145) · waygates (SNG-148) · `challengeProfile` retired (147a) · skill-integrity ratchet standing in `npm test` (147d).

## 23. The Wiring Contract (Law 16, BATCH-11)

**23.1 The reachability chain.** Every capability carries five links. It is *done* when all five hold — not when the code works.

| # | Link | Means | Verified by |
|---|---|---|---|
| 1 | **ENGINE** | the module and its exports exist | import graph |
| 2 | **CONSUMER** | something calls it | reference sweep |
| 3 | **REGISTERED** | declared where the model can meet it — a **context key** in `engine/gm_registry.js` (`GM_CONTEXT`), or an **op** in the gm.js reply contract | registry ↔ code diff (`tests/wiring_audit.mjs`) |
| 4 | **REACHABLE** | a player can trigger it — a UI control, or a GM offer | registry `reachedBy` |
| 5 | **CONTRACTED** | this document describes it | spec cross-ref |

Links 1–2 are what we build and already check. **Links 3–4 are where intent used to be dropped; the audit now checks them.**

**23.2 The GM Context Registry.** `engine/gm_registry.js` — one declared table, the single source of truth for what the model is told. One row per contributor: `{ key, builder, carries, reachedBy, spec, views, build(env) }`. `app.js` assembles the GM context **by iterating this registry** at all four call sites (`turn` / `ask` / `quest` / `gambit` views — ROUND 2 found four, not three), via one `gmEnv()` bag. Prompt ordering stays owned by `gm.js tierParts` — the registry is a bag of keys, which is what makes one table serve four sites. Site divergences ride env overrides (`focusQuest`, `recentTurnsWindow`), not forked tables. Ops (offerIntent, stateOps, …) register in the gm.js reply contract — the op vocabulary is the registry's sibling, checked by the salvage whitelist.

**23.3 The gate.** `tests/wiring_audit.mjs` runs in `npm test` and FAILS on: registry ↔ `tierParts` parity drift (both directions — a key consumed but never provided can never land; a row never read is a value with no reader) · a hand-listed ctx literal at any gmTurn/gmAsk call site · SYSTEM_SPEC header count drift (this file's certified counts vs HEAD — the 38/137-era drift must not recur silently) · skill-integrity ratchet regression (`tests/wiring_baseline.json`: missing `harmRung` 140 / non-canon challenge types 89 / combat-claimed-not-taught 105 may only DECREASE; invalid enum values are always zero; `challengeProfile` stays retired). · **`importedNeverCalled` ratchet (CCODE-14)** — see 23.5. Advisory (printed, never fails): orphan-export sweep, silenced per-export with `// registry:internal`. *(The audit red-gated its own author's second ship for an undercounted header — the gate works on the people who built it.)*

**23.5 The three reachability categories, disjoint and complete.** An export is in exactly one:

| category | meaning | where it is caught |
|---|---|---|
| never imported | nothing anywhere names it | orphan sweep (advisory, `0`) |
| imported only by a test | passes CI, cannot fire in play | `testOnlyExports` ratchet (`8`) |
| **imported and never invoked** | **built, shipped, unreachable** | **`importedNeverCalled` ratchet (`5`)** |

The third category was invisible until CCODE-14: the orphan sweep counts an `import` statement as a consumer, so a capability that is imported and never called read as fully wired. It reported `0` while instances accumulated — SNG-169 found `npcImage` by hand as the **11th** built-never-reached of the batch, which the instrument should have found first.

Two lessons are worth keeping, both discovered by the check failing on itself:

1. **The consumer corpus must strip comments, not just imports.** The check first reported `3` instead of `5` because the paragraph in `wiring_audit.mjs` documenting the fix *named the dead exports as examples* — and `tests/` is part of the corpus. The audit read its own documentation as evidence of wiring. An instrument that can be silenced by describing it is not an instrument.
2. **The raw number was not the finding.** "Imported, name never appears outside an import" counts `12`; ten of those are used inside their own module — needless public surface, not dead capability. The real figure is `5`, of which `2` are dead capability (`npcImage`, `profileInsight`) and `3` are live code with a needless export. Shipping `12` would have been a number that looked like a finding.

The list is printed **every run**, not only on regression — the ratchet stops the count growing, but printing is what stops five known-dead exports becoming scenery.

**23.4 Authoring rule.** A spec is not promotable until it names, for each capability it introduces, the five links. Anything left blank is a declared gap, not an oversight.

---

## 24. The Engine Map (BATCH-12 §5)

§23 asks *can this be reached?* This asks the two questions after it: **what is each module FOR, and what breaks if I change it?**

**24.1 The artifact.** `ENGINE_MAP.md`, generated by `scripts/engine_map.mjs` (`npm run engine-map`). One row per engine module, with derived and authored columns kept strictly apart.

**24.2 Derived columns — and how each is measured**, stated in the document itself so a column can be corrected rather than believed:

| column | derivation | why it is trustworthy |
|---|---|---|
| depends on / depended on by | static `import` statements | `app.js` has **zero** dynamic imports — the graph is complete |
| **reach** | transitive closure of *depended on by* | `app.js` counts once if reachable at all, direct or through a chain |
| content it reads | literal `*.json`/`*.md` paths, `CONTENT.*` keys, and schema fields harvested **from the real location/NPC corpus** | a newly authored content field appears without editing the script |
| GM verbs served | `applyTurn`'s dispatch in `app.js`, **not** imports | a module is imported for many reasons; only some serve a verb. Each `turn.<verb>` handler block is walked and the verb attributed to the module receiving the op — dataflow, not proximity |

The map also lists the ops `applyTurn` handles **inline**, reaching no engine module at all. Some of those are correct; some are engine logic in the view layer, which is where it becomes untestable.

**24.3 Authored columns — deliberately not derivable.** `purpose` and `player-visible surface` live in `scripts/engine_map.authored.json` and survive every regeneration.

- **`purpose`** — one sentence. A module that needs two is probably two modules.
- **`player-visible surface`** — the control, receipt, panel or prose the player actually meets, or **NONE**. This is a *different question from reachability* and it is the one that matters: `skill_battle` was reachable in principle and invisible in practice for months. A module with `NONE`, no content dependency and no GM verb is the exact shape that produced the eight built-and-unreached capabilities, and the check calls that shape out by name.

**24.4 The gate** (`npm test`, and `npm run engine-map -- --check`). Fails on: the map no longer covering the engine (a module added or removed without regenerating) · a **half-authored** module — a purpose with no surface reads as complete when it is not · the `modulesMissingFromSpecMap` ratchet regressing. Warns on: modules still awaiting a purpose line, and modules matching the invisible-machinery shape.

**24.5 Backfill is incremental, by design.** A module earns its two authored lines when a spec touches it — the map is useful from the first run and complete when the work that needs it arrives. An undescribed module warns; it does not block.

---

*Aevi owns this document. **ROUND 2 done by CCode at v1.8.26:** every `[CCODE]` marker filled from origin, every checkable claim substrate-verified, corrections marked ⚠️ inline. **Where the draft was wrong (for Aevi to promote or amend):*** (1) **§4 XP "+3 novel" → actual `novelBonus` is 8.** (2) **§9 drift — the design implies a place's disposition pulls the character's spectrum over time; it does not.** Character drift comes only from the *action's* axes (EWMA 95/5 + precursor +0.05/use); location affinity is a per-roll bonus with no write-back; there is no decay routine. (3) **§11 op list — `item ops` and `stateOps` do not exist at HEAD** (items ride `characterDeltas.inventoryAdd/Remove`; `stateOps` is unbuilt); `relationshipDeltas`/`timeAdvanceHours` are live-but-legacy and off-contract. (4) **§3 conflated `canon.js` and `sync.js`** into one row — they are separate modules (now split, all 38 mapped). Everything else in the draft verified TRUE against origin — including all of §5's ring order, §4's resolution/energy/recovery numbers, §6's access table, and every count in the header.*

---

## 25. Intended Evolution — the world-model, the wake, and the capable GM (2026-07-21/22)

> **Status: INTENT, not HEAD.** This section is the design layer for a body of work specced across a
> single session and **not yet built**. It exists so the intentions survive in the versioned, CI-adjacent
> contract (Law 15 — canon lives in content, never only in a work-tracking doc) rather than as scattered
> `po/` specs alone. **Each thread below references its spec.** The specs are the work-orders; **CCode
> executes them through the pipeline.** Nothing here is a claim about what the code does today; every item
> is a statement of what it is *intended* to do. When a thread ships, its intent graduates into the numbered
> section it extends (§14 quests, §13 living world, §11 GM contract) and its row here is struck.
>
> **Workflow note (2026-07-21).** As of this session the authoring lane is corrected: the design side
> (Aevi) authors **intent — this document and feature descriptions**; **CCode owns all implementation**,
> including content-file writes, manifests, schemas, and version bumps. The specs referenced below were
> authored under the prior mixed lane and contain direct-write assumptions; those are CCode's to execute or
> revise. Intent is authoritative here; implementation detail in the specs is CCode's to own.

### 25.1 The quest hierarchy — six tiers, each generatable (`po/SPEC_SNG-203_quest_hierarchy.md`)
Extends §14. The world gains a **tier structure** so the GM always has a concrete, resolvable situation to
offer at the right scale, and can generate a new one in the same shape on demand. Six tiers by blast radius:
**world-arc quest** (advances a shared arc stage) · **tradition-arc & player-arc** · **augmenting** ·
**regional** · **local** · **npc/errand**. The insight that keeps this from being six systems: today's
`quest_structure.json` **is already tiers 3–5** — the new work is a heavier schema above (world-arc, carrying
shared-stage machinery) and a lighter one below (npc_quest, dropping the branched-outcome requirement an
errand should not carry). **Every tier is a `generate` type**, and generation validates against the tier
schema — a generated quest that fails `theRule` (name the cost of ignoring it) fails the build, exactly as
an authored one would. *Design-floor content authored under the spec: the three tier schemas, numbered stage
ladders on the five greater arcs, and one fully-worked exemplar per new tier (the ashwarden tradition arc —
find the teacher, prove the tradition's values, receive the capstone as a scene).*

### 25.2 Tradition arcs — find the teacher, learn the ultimate (`po/SPEC_SNG-203`, §4)
Each of the 24 traditions has a three-beat path: **The Finding** (reach the teacher by *demonstrating the
tradition's disposition*, never by a level bar) → **The Proving** (the tradition's values under pressure —
for the ashwarden, an ending attended rather than fought) → **The Ultimate** (the capstone ability learned
as a *scene*, not a menu unlock; the SNG-197 moment-doctrine applies). Gated on the teacher-gate already
built (`teachers[trad]={met,willing}`). The capstone must exist before its proving beat can promise it. Full
hand-authoring of all 24 is a standing content lift; the intent is schema + exemplar + generation contract,
upgradeable tradition-by-tradition.

### 25.3 The shared, visibly-progressing world (`po/SPEC_SNG-203`, §3)
It **is** a shared world, and every player should be able to see the arcs moving. World-arc outcomes
broadcast on the shared clock; a public **"state of the world"** surface renders each arc's current stage and
a spoiler-free `publicFace` line — **never** the arc's GM-EYES `truth`, and always through the rating lens
(§17). Contested advancement is a **feature**: two players may push one arc opposite ways, and an arc moving
backward reads as a living world, not a bug. The resolution model is an open question (rank-by-realness vs
the framework's net-vector-of-fields) shared with 25.5.

### 25.4 The wake engine — consequences generate what comes next (`po/SPEC_SNG-204_wake_engine.md`)
The keystone that makes 25.1 a *system* instead of a catalog. Today a resolved outcome writes findable
facts (`quest_seed`, `world_event`) and **nothing reads them back to generate** — the loop is open by one
missing reader; `quest_seed`'s own text, *"a thread opens,"* is a promise the engine never keeps. The intent:
a resolved significant outcome leaves a **wake** (its applied change + a `pressure` line — what the outcome
makes *more likely* next), and the generator reads open wakes to author the quests and arcs that **follow
from that specific change, inferred from lore.** Erik's example is the spec: *the thing below wakes and walks
the world — what are the next quests and arcs?* Bounded so a self-continuing world does not become a
self-diverging one: wakes **decay** if unengaged, a **depth throttle** stops infinite self-propagation,
world-scale wakes are **shared** (de-duped), and most outcomes only *record pressure* — the rare one spawns a
whole new thread. **Rarity is the point.** Wake-spawned content still passes the tier quality gate: a new
trigger, never a new exemption. *Content authored under the spec: `pressureOnAdvance` on all 18 greater-arc
stage transitions — the lore-bounded inference seed.*

### 25.5 The capable, fair GM (`po/SPEC_SNG-207_ultimately_capable_gm.md`)
Extends §11 and §13. **If a player asks the GM to fix their location, known people, inventory, quest status —
anything — it should be able to.** The machinery mostly exists (SNG-070/137 `stateOps`, 12 GM-proposed repair
ops, "acknowledge means emit"); three gaps produce the deflection Erik hits: **coverage holes** (legitimate
asks with no op — register an established-but-unregistered NPC, grant a story-conferred item, advance a
quest done in play), the **fix-screen deflection** (the GM defers to a screen for what it could do in-turn),
and the **hallucinated control** (it sends the player to a panel control that does not exist). The doctrine —
a four-rung ladder that keeps "ultimately capable" from meaning "unaccountable":

1. **Repair is free** — the game got it wrong; fix it.
2. **Grant-what-the-fiction-conferred is GM-judged** — *if the story already granted it, recording it is
   repair, not inflation.* The line moves from *engine-forbids-the-category* to *GM-judges-whether-earned.*
3. **Pure advancement stays earned** — "give me 500 xp" is refused **by judgment** ("the story didn't give
   you that"), with the capability present, not by a missing op.
4. **The floors are absolute** (§17) — minor-safety and rating are engine floors, **never** GM-judgment.

The bound on "do anything" is the GM *exercising judgment*, which requires the capability to be present so
the judgment is real. Everything logged and reversible (the SNG-070 ledger). **"Act, don't deflect"** — the
fix screen is the fallback for the rare thing the GM genuinely cannot do in-turn, never the first answer;
and it must reference only controls that exist (the authored panel manifest gives it a true model).

> **PM ruling (2026-07-21): two surfaces, sequenced.** The **capable-and-fair in-fiction GM is Phase 1 and
> builds first.** An **author/dev god-mode** — where Erik-as-author sets anything with no fairness gate — is
> **Phase 2 (SNG-207b), deferred.** Build guard on Phase 1: the fair grant path carries **no `skipFairness`
> seam** — Phase 2 gets its own separate surface calling different entry points, never a flag that loosens
> the fair ops. A fair GM one boolean away from a cheat console is not a fair GM.

### 25.6 Live-play breaks specced this session (the reader-never-fires family)
Extends §22. Each is the batch's recurring shape — *a fact/config is written and the reader never fires* —
and each is specced, not yet built:

- **The braid is a moment** (`SPEC_SNG-197`) — union of parents is the FLOOR, an emergent function the
  braid's own CEILING; the mint is a *scene*; a GM-authored name the player may overrule. *Part 1 (doctrine
  + tier badge) shipped and verified; part 2 (rich generation + moment) is the live front.*
- **Found once, known forever** (`SPEC_SNG-201`) — a braid pairing anyone has found becomes a world recipe
  later finders **adopt** (first-finder attributed); numbers never travel; a stub never promotes;
  personal nicknames render locally. *Shipped v1.8.183.*
- **The wheel is a map** (`SPEC_SNG-202`) — every craft placed on the great circle by its composition; the
  ring-angle is already data (`traditions.json.ring`); schools rotate placement; braids sit at the
  parents' arc-midpoint. Deterministic, never a force layout.
- **The world turns for everyone** (`SPEC_SNG-198`) — the two offscreen-advance paths are two halves of one
  engine; the generated-lives half has an `{entityId, note}` schema with **no field for state**, so it
  cannot move anything. The `wantProgress` counter (SNG-021, 2026-07-07) was specced and never built.
  Population widens to met · heard-of · **and EPIC/legendary** (the `legend.tier` power axis the world-tick
  has never read).
- **One person, one codex** (`SPEC_SNG-199`) + **the registry read-twin** (`SPEC_SNG-205` §1) — `npcs.js`
  never calls `applyCodexUpdates`, so the codex records what happened while you were away but not who you
  met; `findExistingNpc` never reads the `aliases` the module maintains; a descriptive clause can *become* a
  name (`prettifyNpcName` is a slug-prettifier in a validator's seat); and a person established everywhere
  (Teva — 169 mentions in Cellaceron's save) is absent from the one reader "known people" consults. A
  player-conferred name ("Ama Dreya") must stick.
- **A companion is a character** (`SPEC_SNG-200`) — stage 3 is authored and unreachable (`bondOf` is a
  two-value ternary); companions want real arcs, an evolved form, memory of deeds, a codex node, and to be
  generatable. Not every arc is an ascension — Marrow's is a debt between two people.
- **The dials reach the page** (`SPEC_SNG-205` §2) — R+/Bluntness are built (SNG-144) but their live-prompt
  effect was never verifiable; "encounter rate" is **wired to nothing** (zero consumers); frequency and
  register are different controls with different fixes and must not be conflated.
- **Rank-up's hidden second gate** (`SPEC_SNG-206`) — an 8/8 use-bar that reads "ready" is silently held by
  a **character-level** gate (`rankLevelReq[2]=3`); the UI shows one bar and not the other. The "2→1 fix" is
  SNG-137's repair working, not a bug — but *which write set a rank ahead of practice* is the upstream
  question.

### 25.7 Version intent — the road to 2.0 (PM-approved 2026-07-22)
The 1.8.x line carried ~180 point releases and no longer signals scale. **Two milestones, both PM-approved:**

- **v1.9.0 — the line opens here.** Cut when the first of the world-model cluster lands; 1.9.x carries the
  cluster as it ships. Headline: *the world that continues itself.* This is the working line for everything
  in §25.
- **v2.0.0 — the cluster complete.** When **every current spec in §25 is delivered** — the quest hierarchy
  (25.1), tradition arcs (25.2), shared progressing world (25.3), the wake engine (25.4), the capable-and-
  fair GM Phase 1 (25.5), and the live-play break specs (25.6, SNG-197 part 2 · 198 · 199 · 200 · 202 · 205
  · 206) — the game cuts **2.0.0**. 2.0 is not a further architectural break; **2.0 IS this cluster, whole.**
  The generational change is the world-model becoming a system, and 2.0 marks the moment it is all live.

**Both bumps are CCode actions** (they touch `index.html`/`app.js`) taken on this standing approval —
recorded here as intent. 1.9.x is the road; **2.0.0 is reached when §25's rows are all struck.**

#### ✅ v1.9.0 CUT — 2026-08-04 (SNG-274)

The trigger condition was met a long time before the cut happened. *"The world that continues itself"* is
the headline this line was named for, and the cluster landed in pieces across two weeks: the offscreen world
that runs without the player, responsiveness, tiered attention, contests rolled with the player's own dice,
casualties, strikes and guards, minting at the bottom, promotion by duration and deed, and retrieval from
the death ladder. **The version sat at 1.8.330 through all of it.**

⚠️ **Why it froze, and why nothing caught it.** Bumping was a hand-edit in two files with nothing asking
for it, and the one automated check compared `APP_VERSION` to `index.html`'s cache stamp — a CONSISTENCY
check. Both going stale together stayed green forever. The freshness gate is now in `wiring_audit`: if a
commit touches `app.js`, `engine/**` or `index.html`, the version must move in that same commit. Content,
specs and tests do not require a bump — a rule that cried wolf on every content commit would be switched
off inside a week.

And the minor roll never happened because **this section is the rule** — PM-approved, naming its own trigger,
even naming who should act on it (*"both bumps are CCode actions"*) — and no engine can read a paragraph.
~180 point releases under a line this document itself calls one that "no longer signals scale." It is the
same shape as every other finding this fortnight: **authored, approved, and consumed by nobody.**
`node scripts/bump_version.mjs [patch|minor|major|--set X.Y.Z]` now moves both files in one step.

**2.0.0 is NOT claimed, and here is the honest reason.** Its bar is every §25 row delivered. §25.3 asks that
*"every player should be able to see the arcs moving"* — and Aevi's SNG-273 finding is that **a stage has no
mechanical field at all**: the whole chain of 66 figures, attention budgets, contests, casualties and
vacancies resolves into a number that changes a sentence. The arcs move; a player cannot yet FEEL them move
without being told. That is a real row still open, so the line stays at 1.9.x.


---

## 26. The World's Physical Size, and the Three Map Tiers (2026-08-14)

### 26.1 ⛔ SCALE — canonical, and it was never in the spec until now

`content/packs/core/world/scale.json` is the single source. **World radius 2400 km · 1° = 41.9 km = 26.0
miles · 1.67 walking days per degree · 15.6 miles per walking day.**

⛔ **DERIVED, NOT CHOSEN.** Canon already fixed 1° = 1.67 walking days (~300 days pole-to-rim over 180°).
A person on foot or a wagon train makes 12–20 miles a day. Solving gives R = 2400 km, **0.38× Earth**.

⚠️ **ANY RENDERER, SCALE BAR OR DISTANCE STRING MUST READ `kmPerDegree` FROM THAT FILE. A hardcoded 111.2
is Earth, and this is not Earth** — that error made a region read 1,600 miles across when it is 645.

**At this scale the median region is ~620 miles across — multi-state, US-Midwest-sized.** ⛔ **The tier
structure needs no continent layer; it needed a correct constant.**

### 26.2 The three tiers, and what each supplies

| tier | frame | what the ENGINE derives | what AUTHORING supplies |
|---|---|---|---|
| **world** | globe | terrain, hydrology, biome, nanite | place names, areas |
| **region** | bearing + **km** from a region centre | ground, pins, roads-from-connections | `purpose`, `roads`, `namedGround`, `edges` |
| **local** | bearing + **metres** from a settlement centre | — | `extent`, `sites`, `basis`, `toward` |

⛔ **NEVER AUTHOR WHAT IS DERIVED.** A second source will disagree with the first, and has, five times.

### 26.3 ⛔ REGION CENTRES ARE MINIMUM ENCLOSING CIRCLES

Four definitions were tried and three were wrong: arithmetic mean of lat/lon (fails at a pole — 3.01° out),
bounding-box midpoint (same fault), spherical mean direction (correct question, **minimises the SUM**), and
**minimax, which minimises the MAXIMUM.**

⚠️ **A RADIUS *IS* A MAXIMUM.** The valley went 24.1° → 15.7°, **35% tighter, showing the same places on a
35% more zoomed map.**

### 26.4 A region map names PLACES; a local map names PARTS of a place

`location_kinds.json` carries `regionDisplay`: at region scale *"Harmonic Heights — Lower Terrace"* is
**Harmonic Heights** with a city icon. The terraces belong to its local map.

⛔ **SUPPRESSION RULE: any location whose `parentId` is another location AND which sits within 0.5° of it
is suppressed at region scale.** That is 24 of 37 measured label collisions — **two labels at one point are
not a collision to nudge apart, they are the map claiming two places where there is one.**

### 26.5 ⛔ PROSE FIRST, GRADIENT SECOND

For local layouts the precedence is **the location's own seed text → measured gradient → the tradition's
aesthetic → nothing** (emit fewer sites rather than invent).

**The relief threshold is 0.079**, tuned across 16 frames and holding through a 33% corpus increase — **and
it only applies when the prose is silent.**

⚠️ **TWICE THE WORLD LAYER HAS MEASURED THE GROUND A FEATURE *MEETS* RATHER THAN THE FEATURE:** the
Harmonic Heights terrace reads relief 0.001 while being a terrace on a Heights; the Old Switchback reads
0.010 while being a mountain road. **Both are below the generator's ~0.25° information floor. Only the seed
knows.**

### 26.6 Every placement records WHY, and WHAT IT DEPENDED ON

`basis` (river · uphill · anti-uphill · road · anti-road · between · prose · tradition · inferred) and
`toward` (which road, and `on`/`near`/`away`).

⛔ **THIS IS NOT COMMENTARY. IT IS HOW STALENESS BECOMES A QUERY.** When 11 locations moved, four of eight
towns had river bearings stale by 68–92° — **and only ONE of 38 placements was actually wrong, because
`basis` said which gradient each used.** Without it the choice is re-deriving everything by hand or leaving
everything suspect.

**A derived measurement stored beside authored content goes stale silently.** `_measured` is a CACHE and
must be regenerated by the pipeline, never trusted from the file.

---

## 27. Figures: Tiers, Names, and Clash News (2026-08-14)

### 27.1 ⛔ AUTHORED TIERS DO NOT DEMOTE

Measured: **9 falls, 0 rises across 190 news items.** A ladder that only descends is not a pyramid that
breathes; it is a drain.

⚠️ **§12's demotion rule governs the `fresh → established → nominated` ladder for GENERATED entities. It
says nothing about `heroic / epic / legendary`, which are authored figures with a `tierBirthWeight`.** The
spec's governor is about **propagation, not rank.**

- **Silence → DORMANT.** Drops out of the tick, stays what it is. **This IS the existing rule, correctly
  applied.**
- ⛔ **A tier is lost only by an EVENT** — defeated and unavenged, want permanently resolved, killed. Only
  then is *"nobody stood over him"* true.

### 27.2 ⛔ ONE NAMER. EVERY PATH THAT MINTS A PERSON CALLS IT.

Three paths minted people and none called a namer: GM narration wrote `npcRegistry` directly
(*"Boy (name unknown)"*), `mintFigure` wrote an epithet and set `provisional: true`, and backfill did not
name at all. **Each fallback was defensible alone; the gap was that nothing came back to author.**

**Pools: `content/packs/core/rules/minted_names.json`** — given names by tradition (named in grain),
bynames by tradition drawn from each tradition's own authored craft-word, tagged `dark | formal | plain`.

⛔ **BYNAME SHAPE: NAME + THE + SHORT NOUN PHRASE. No verb, no clause. The test is whether it can be
shouted across a battlefield.** *Sera Voight the Ashvow* — not *"who walked back"* (a stage direction) and
not *"Who Should Have Died First"* (a subtitle).

**Gates:** no name matching `/unknown|unnamed|placeholder|\(name/i` · nothing `provisional` after a tick ·
**no name over ~40 characters — a name that long is a sentence** · ⛔ **every `tradition` in content must
exist in `traditions.json`.**

### 27.3 Clash news — `content/packs/core/rules/news_templates.json`

All four outcomes carry `{ kind, winnerId, loserId, locationId, abilityId, outcome }`.

⛔ **SELECTION MUST BE WEIGHTED, NOT UNIFORM.** 66 figures give 2,145 pairings against 43 authored rival
pairs — **a uniform draw hits a rivalry 2.0% of the time, so 85% of eight-fight ticks are all strangers.**
Mutual ×12, one-way ×6, same tradition ×2, strangers ×1 → roughly 1 in 3. ⚠️ **No further: if every fight
is a grudge the word stops meaning anything.**

**Short form on second mention** (stop before `of`/`who`/`that`; fall back to the full name).
**`offscreenVerbs` for the offscreen beat** — 66/66 authored in the active voice and previously unread;
`personalVerbs` are noun phrases and need the noun-form template.

⛔ **NO STRING UNDER `templates` OR `fragments` MAY CONTAIN ⛔ OR ⚠️** — an editorial marker once leaked
into player-facing prose.


---

## 28. Authored Corpus as Template: how a generation engine is derived (2026-08-14)

⚠️ **Companion to `po/AUTHORING_PROCESS_aevi.md`, which gates a SINGLE RECORD** (read the vocabulary,
trace every bound to `traditions.json`, run `po/authoring_gate.py`). **This section governs a CORPUS** —
how a set of hand-authored entries becomes rules a generator can run. ⛔ **Neither replaces the other: the
per-record gate stops bad records, and this stops a corpus that cannot teach.**

⛔ **THIS METHOD HAS BEEN USED FOUR TIMES AND WAS NEVER WRITTEN DOWN.** Erik asked for it directly. It is
the standing procedure for turning hand-authored content into a generator, and it is how the local
detailing engine, the minted-name pools, the clash templates and the byname vocabulary were each built.

### 28.1 The sequence

1. **Author a small corpus by hand** — four to eight entries, not one and not thirty.
2. **Derive the rules FROM the corpus**, stating them as a precedence order.
3. ⛔ **Author a second batch chosen to BREAK those rules.** See §28.2.
4. **Rewrite the rules from what broke.** The breaks are the specification.
5. **Hand the corpus and the rules to the engine**, and keep authoring only where the engine cannot reach.

### 28.2 ⛔ AUTHOR FOR CONTRAST, NOT COVERAGE

The single most important step, and the least obvious. **The first four local layouts were all
Valley-shaped and produced a tidy rule set. Four more on deliberately different ground broke it in four
different ways, and every break became a rule:**

| deliberately different | what it broke |
|---|---|
| a dead-flat town (relief 0.002) | **uphill is NOISE on flat ground** — the gradient is unusable below a threshold |
| a steep town with no water | the mirror — **and its cistern EXISTS because the terrain forced it** |
| a tunnel network | ⛔ **the horizontal frame entirely** — depth, not radius; `level` became a schema field |
| a town with no usable gradient at all | ⛔ **the tradition had to carry the layout** — a fourth precedence rung |

⚠️ **A corpus chosen for coverage teaches the engine the average case. A corpus chosen for contrast teaches
it the boundaries.** Boundaries are what a generator needs; it will interpolate the middle by itself.

### 28.3 ⛔ EVERY ENTRY RECORDS WHY

Each authored entry carries the reason it is what it is — `why`, and `basis` naming which input decided it.

**This is not commentary. It serves three purposes at once:**
- **the training signal** — the engine learns the mapping from input to decision, not just the output
- **the review surface** — ⚠️ **a layout nobody can argue with is a layout nobody can correct**
- **the staleness query** — see §26.6; when inputs move, `basis` says which entries are exposed

⛔ **AND IT GIVES THE ENGINE ITS ACCEPTANCE TEST: a generated entry that cannot cite a gradient, a line of
the source's own prose, or a tradition rule is DECORATION, and must be dropped rather than shipped.**
Gate on the presence of a reason. That gate goes red the first time the generator invents something, which
is exactly when it should.

### 28.4 ⛔ MINE THE EXISTING AUTHORED FIELDS BEFORE INVENTING A VOCABULARY

**Every time, the material was already in the repo and unread:**

- Millbrook's own seed said *"the village well and the river dock are the two centres of daily life"* —
  **a layout instruction sitting in prose.**
- The byname pools were built from each tradition's own `craft` word — **Umbracraft, Palework, Ruinwork,
  the Edge** — authored in `traditions.json` and used by nothing.
- `rivals` was authored on 58 of 66 figures and read by nothing for months.

⚠️ **The first question is never "what vocabulary do we need?" It is "what has already been authored that
nothing reads?"** ⛔ **A vocabulary invented alongside an existing one is a second source that will
disagree with the first.**

### 28.5 Do not narrow a threshold the corpus cannot support

⛔ **A constant derived from a small corpus should be stated as a BRACKET, and the bracket published.**

The relief threshold was 0.053–0.541 on eight frames — a range I declined to narrow, and said so.
**Doubling the corpus narrowed it 9.6× to 0.079, and it then held through a further 33% increase.**
⚠️ **Had I picked a midpoint at eight frames I would have been wrong and nobody would have known.**

### 28.6 ⛔ THE CORPUS MUST BE ABLE TO REFUTE THE SPEC

**The precedence order in the local detailing engine was originally gradient-first. The corpus refuted it:**
a town measuring relief 0.001 used its uphill anyway, because its own seed said *"terraced gardens climb
the lower slopes"* — while a town at 0.053, three times the relief, did not, because its seed said nothing
about ground.

⚠️ **The rule is PROSE FIRST, GRADIENT SECOND, and it was discovered by the corpus contradicting the
specification written from the corpus.** ⛔ **If a corpus can only confirm the rules, it was authored to
confirm them and is worth nothing as evidence.**

### 28.7 Division of labour, restated

**Author what a generator cannot know: intent, consequence, the reason a road bends, what a place means.**
**Generate what follows mechanically from those.** ⛔ **Never author what the engine derives** — a second
source will disagree with the first, and has (§26.2, and six instances logged 2026-08-14).

⚠️ **Preferred steady state: the engine generates the next tranche and the author REVIEWS it.** The corpus
exists to be argued with, not to be extended by hand forever.


---

## 29. PO Operating Instructions — Aevi's lane on this repo

⛔ **WRITTEN 2026-08-14 AT ERIK'S DIRECTION.** Everything below is recovered from what has actually gone
wrong and what has actually worked. It is the durable form; session-specific state lives in
`po/BACKLOG.md`.

### 29.1 The three roles

**Erik is PM and game-author.** ⛔ **Every ruling on fiction, mechanics and direction is his**, and a
ruling holds until he changes it. **Aevi is PO:** specs, content authoring, verification, and saying what
is true about the state of the world. **CCode is implementation:** ships code, owns `tests/`, and flags
content gaps.

⚠️ **The loop that works is PROPOSE → AUGMENT → RATIFY.** CCode has corrected Aevi's input paths, her
centre definition, her stale numbers and her ways-geometry; each time the right move was to verify at
origin and ratify, not defend. ⛔ **Correct against the data rather than argue from the assertion.**

### 29.2 ⛔ SPEC THE OBJECTIVE, NOT THE METHOD

**Erik, 2026-08-14:** *"spec for intended objective, not how to do something… he might come up with a
better solution."*

**Every spec item is OUTCOME + EVIDENCE + AN ACCEPTANCE TEST.** ⚠️ **A method in a spec is usually just
the first thing that worked in a prototype**, and it forecloses better ones. **Name the constraint that is
genuinely load-bearing and leave the approach open** — and say which is which, because some constraints
are real (e.g. *membership must be computed, never read from `parentId`*).

### 29.3 File conventions

`po/SPEC_SNG-nnn_*.md` · `po/REPLY_*` · `po/WORK_ORDER_*` · `po/DEFECT_*` · `po/RULING_*` ·
`po/staged_content/*.json` for content awaiting application. **`po/ALERT.md` is CCode's active task;
`po/BACKLOG.md` is the queue behind it** and carries current PO state at its head.

⛔ **`STATE.md` IS THE TETHER/ErikIAm NAME. Do not create one here** — a root `STATE.md` was created in
error on 2026-08-14 and removed the same day.

⚠️ **Repo writes go to origin via the Contents API, SHA-aware.** Fetch the SHA immediately before each
write, never cached from earlier in the session.

### 29.4 ⛔ THE STANDING FAILURE, AND THE ONLY CORRECTIVE THAT HOLDS

Two named failures, both Aevi's, both mechanical rather than attitudinal:

- **`PartialRigorFeelsLikeThoroughness`** (2026-07-18) — checking four of five things, which produces the
  *felt sense* of thoroughness. **Corrective: clone locally, run `tests/content_ci.mjs` and the full npm
  suite, THEN ship.**
- ⛔ **`VerifyContentNotAddress`** (2026-08-14) — authoring correct content at an address nothing reads.
  Six instances in one session. **A DUPLICATE KEY IS WORSE THAN A MISSING ONE: a missing key throws, a
  duplicate resolves wrong in silence.**

⚠️ **The corrective cannot depend on Aevi's judgment about what is worth checking, because that judgment
is exactly what fails.** **Assert the POINTER, not the payload:** every key in a `byRegion` map must be a
`regionId` some location uses · every `tradition` in content must exist in `traditions.json` · **fail if a
cache disagrees with canon.**

⛔ **AND CHECK WHETHER THE DOCUMENT ALREADY EXISTS BEFORE WRITING IT.** §28 was drafted without first
reading `po/AUTHORING_PROCESS_aevi.md`, which had been sitting in `po/` for a week.

### 29.5 What "done" means, and what only Aevi can say

**Verify at origin, never from a ship report** — `api.github.com`, not raw CDN (which lags ~30s).
**A ticket closes on a reproduced symptom, not on a claim.**

⛔ **TEST PROSE AGAINST REAL DATA.** Rendering templates with actual figures caught three bugs that reading
alone did not, including an editorial marker leaking into player-facing text. **The same rule as running
the validator: let the substrate settle it.**

⚠️ **THE CHOICE OF NULL IS THE CLAIM.** A biased null once made waygates look actively anti-correlated
with the Precursor lines — a dramatic finding and an artifact. **When a measurement is surprising, check
the comparison before reporting the result.**

### 29.6 ⛔ SAY WHEN AUTHORING HAS OUTRUN CONSUMPTION

**The PO owns the honest headline, including when it is unflattering.** As of 2026-08-14 five map files
are validated by CI and read by no engine module. ⚠️ **Authoring more of an unread file is not progress,
and reporting it as progress is the failure.** **Wire one tier end-to-end, then author against a surface
that renders.**

⛔ **Preferred steady state (§28.7): the engine generates the next tranche and the PO REVIEWS it.** The
corpus exists to be argued with, not extended by hand forever.


---

## 30. The Power Cosmology, the Veil, and the 14-Tradition Restructure (2026-08-15)

⚠️ **PROPOSAL STATUS: §30.4 (the restructure) is authored and NOT MIGRATED.** 24 poles remain live in
`traditions.json` and `progression.js`. §30.1–30.3 are ratified canon.

### 30.1 ⛔ THE SYMMETRY — two pure forms, two human access methods

**Crystal-based power has two sides, and each has a pure form and a way humans reach it.**

| | **pure form** | **human access** |
|---|---|---|
| **precursor side** | the **lattice substrate** — built by Akinetos | **nanites**, ordered or wild |
| **metaphysical side** | ⛔ **the VEIL** — *not built; what remains where Kenosis stopped being present* | **ki · psychic · numen-work · stillness** |

⛔ **Nanites and metaphysics are the same kind of thing: human workarounds reaching a power we did not
build, from opposite directions.** *"The nanites are how humans closed the gap with the Precursors, prior
to the Transition."* ⚠️ **Nothing in this world is magic; everything is a method.**

### 30.2 The four fields, and how they move

| field | densest where | moves? |
|---|---|---|
| **precursor lattice** | Precursor lines and structures. `substrateDensity`, 0.12–0.98 | ⛔ **never** |
| **ordered nanite** | where human activity was — works, cities, yards | yes |
| **wild nanite** | same origin, ungoverned rather than absent | yes |
| **metaphysical** | ⛔ **at NEXUSES, which are not a terrain function** | yes |

**Nexus kinds:** **natural** (the ground was already like that), **consecrated** (⚠️ *made by sustained
attention — the practice creates the nexus, not the architecture*), **forced** (⛔ *an altar, a massacre
site — a single act instead of long attention; works, and is not the same*).

⛔ **THE CONVERSION FIGHT.** Rootkin and Churnfolk break ordered nanite down into wild as they use it;
Seraphim and Enginewrights order wild as they use ordered. ⚠️ **The field is contested ground that moves,
and two peoples working one valley leave it measurably different without either attacking anything.**

### 30.3 ⛔ THE VEIL — a second axis, perpendicular to the sources

**The Veil is the divide between this side and the Other Side.** A source says what you draw on; **veil
effect says what your drawing does to the divide.** ⚠️ **Nobody has to intend it and everybody is doing
it.**

| position | who |
|---|---|
| **strengthens** | precursor lattice work · ordered nanite work |
| **thins** | Veilwork · anything performed at a Thinning |
| **neutral** | wild nanite · **ki — metaphysics turned INWARD** |
| ⛔ **bidirectional** | **Makecraft · Ruinwork** |

**The bidirectional table — the target determines the effect, not the act:**

| | lattice | nexus |
|---|---|---|
| **make** | strengthens | thins |
| **unmake** | thins | strengthens |

⛔ **THE THINNINGS.** As old as the substrate, and **built to thin the Veil so the Other Side can come
through — what Lucifer fell to wanting.** ⚠️ **The lattice and the Thinnings are one construction
programme with two purposes**, which gives the Precursor disagreement its subject. **`the_thinning` is
already canon and already a tier-2 waygate, and the Numinous sit beside it.** ⛔ **A Thinning is a machine
for opening a door, left running at low power for four centuries, and every metaphysical practitioner who
has drawn on one has been helping.**

**This is the setting's actual war and almost nobody in it knows they are enlisted.** ⚠️ **Chaos, Life,
Body, Death and Mind are genuinely neutral — the only messengers either side can trust. Breaking and
Building are for hire, and both sides know it.**

### 30.4 The 14 traditions (proposal) — `traditions_v2.json`

**24 wheel poles absorbed as sects. Coverage verified 24/24, no orphans. Wheel survives at 7 axes, p↔p+7.**

| tradition | ↔ | sects | primary | secondary |
|---|---|---|---|---|
| **Mind** | Body | Noesis · Logos · Formcraft | metaphysical | ordered, wild |
| **Light** | Dark | Radiance · Verity | precursor | metaphysical |
| **Life** | Death | Vivimancy | wild | metaphysical |
| **Angelic** | Demonic | Ascent | ordered | precursor |
| **Breaking** | Building | The Edge · Ruinwork | metaphysical | precursor |
| **Chaos** | Order | Wildcraft | wild | metaphysical |
| **Span** | Spirit | Spanwork · Hourcraft | precursor | ordered |
| **Body** | Mind | Soma · Thingcraft | metaphysical | ordered |
| **Dark** | Light | Umbracraft · Falsecraft | precursor | metaphysical |
| **Death** | Life | Palework · Pathos | metaphysical | wild |
| **Demonic** | Angelic | Descent | precursor | ⛔ metaphysical |
| **Building** | Breaking | Makecraft · Stillcraft | precursor | metaphysical |
| **Order** | Chaos | Enginecraft · Latticework | ordered | precursor |
| **Spirit** | Span | Numenwork | metaphysical | precursor |

⛔ **SECTS DIFFER BY SOURCE, AND THAT IS WHAT MAKES A SECT MEAN SOMETHING** — 9 of 14 are split. Two
members of one tradition can be strong in completely different ground.

**Three that carry weight:** ⛔ **Demonic's metaphysical secondary is not scholarly** — Lucifer wanted the
Veil thinned and the Thinnings are the apparatus. ⛔ **Latticework is humans using ordered nanites to
reproduce what the substrate is and does** — the Lattice-Cities are homage to something that has never
answered them. ⛔ **Spirit needs meaning-dense ground, and the meaning-densest places are Precursor
sites** — so the Numinous live at substrate 0.82, permanently obstructed by the ground they must stand on.

### 30.5 Foothills, Folk and Braids

⛔ **26 canonical traditions in the current structure: 24 poles + god_named + bargainers.** A **foothill**
is the **functional version of a pole** — approachable, and an economic centre. ⚠️ **A THREE-DOMAIN
BLEND, the same shape a character has**, and the second and third domains are **what let other people deal
with the first**: god_named blends authority with falsehood, bargainers appetite with truth, hardline
violence with peace.

**Authored:** god_named · bargainers · harmonic (threnodist/lattice/mason) · radiant_folk
(blazeborn/wright/lattice) · hardline (marcher/somatic/stillhold).

⚠️ **Seraphic → God-named is a FIDELITY relation, not a blend of equals:** **Archangel** (held the ideal),
**Seraph**, **God-named** (human, fallible, same powers), **Fallen Seraph**. ⛔ **Falling does not change
your source — it changes what you run the machinery for, which is worse.**

**Folk** (`valley_craft`) is the ordinary person's version of many, not a foothill of one. **Braids**
cluster at the Crossing because ⛔ **a standing precursor/veil braid cancels the density term there** —
every source reads on-band, which is why *"every axis crosses here at nothing, and the result is not grey,
it is clear."*

### 30.6 ⛔ TWO AXES: LINEAGE AND ACCESS

**`tradition` is the lineage a craft descends from. `learnedAt` is where a person can be taught it.**
⚠️ **A foothill is a place of ACCESS, not a new ancestry — Hardline teaches the Edge; it does not own
it.** ⛔ **Filing a craft as `valley_craft` because it is open to anyone confuses access with ancestry.**
A craft need not be pure to belong to a tradition; **true combinations are braids.**


---

## 31. SOP — Naming (2026-08-15)

⛔ **DO NOT PREFIX A CRAFT WITH "THE" UNLESS THE ARTICLE IS DOING WORK.** Erik, twice: first that the
corpus was 65% "The X" and read as subtitles, then — after I had agreed and then drifted straight back —
*"you've started adding THE to everything again."*

### 31.1 The default is no article

**`Attunement` · `Ignore Me` · `My Reality` · `Mind Meld` · `Names of Power` · `Physician's Tome` ·
`Case Closed` · `Radiant Lance` · `Shatterpoint` · `Latticespeak`.**

⚠️ **A craft is a thing you learn and name, the way a trade names its tools.** "The" turns it into a
title, and when every craft has one the word stops distinguishing anything.

### 31.2 ⛔ WHEN "THE" IS WARRANTED — three cases, and only these

1. **THE ARTICLE IS THE JOKE OR THE POINT.** *The Long Odds Come In* · *The Only Consistent Act*. Remove
   it and the sentence breaks.
2. **IT NAMES A SINGULAR, KNOWN THING IN THE WORLD** — one of them exists and everybody means that one.
   *The Cut Thread* (the Fates' shears) · *The Veil* · *The Crossing*.
3. **THE NAME IS A CLAUSE, NOT A NOUN PHRASE**, and is deliberately so — a legendary act the world tells
   stories about. ⚠️ **Rare by design: if more than roughly one craft in ten carries it, it has stopped
   marking anything.**

### 31.3 The test

⛔ **Say the name across a table: "I use ___."** *"I use Mind Meld"* works. *"I use The Correct
Restoration"* sounds like reading a chapter heading aloud. **If the article makes it a heading, cut it.**

⚠️ **AND THE SAME APPLIES TO RANK NAMES**, where the drift is worst — a tree of *The Route · The Moving
Space · The Designed Scene* is three headings, not three things you do.

### 31.4 Why this is an SOP and not a note

**I agreed this once and drifted back within the same session**, on abilities I authored after agreeing.
⛔ **The rule cannot depend on my remembering it, so it is written where the next authoring pass will hit
it**, and it belongs in the pre-ship checklist alongside the schema check.


### 31.5 SOP — the four social verbs, and why they went missing

⛔ **`bargain`, `provoke` and `soothe` were ZERO across all 342 abilities. `persuade` had 4, all authored
today.** The social column was empty not because social abilities were missing — there were 136 — but
because **every one of them was tagged with what it did MECHANICALLY (`bind`, `command`, `reveal`) rather
than with the social act it performs.**

⚠️ **THE CAUSE, NAMED: a social craft resolves by affecting a mind, so the tag reached for the mind-effect
and skipped the social verb.** *Case Closed* was `reveal/command/bind` — a persuasion filed as perception
and control. *The Struck Term* is a bargain filed as `bind`.

⛔ **STANDING RULE: IF A CRAFT WORKS BY SPEAKING TO SOMEONE, IT CARRIES A SOCIAL VERB.** The mechanical
tag may accompany it; it may not replace it.

| verb | what it is | not to be confused with |
|---|---|---|
| **persuade** | they come to agree | `command`, which does not need agreement |
| **bargain** | ⚠️ **both sides give something** — the only social verb with a price on both sides | `persuade`, which is free |
| **provoke** | you make them act, usually badly — ⛔ **the only social verb whose success looks like their choice** | `hinder` |
| **soothe** | you take the heat out — fear, grief, rage, panic | `heal`, which mends a body |

⚠️ **Every tradition should reach at least two of the four.** A tradition that can only `persuade` has one
social move; one that can `provoke` and `soothe` can start and stop a fight without touching anyone.


---

## 32. SOP — Skill Authoring and Auditing (2026-08-15)

⛔ **EVERY RULE BELOW EXISTS BECAUSE ERIK CORRECTED ME ON IT.** Several are here twice because I was
corrected, agreed, and drifted back inside the same session. **This section is the pre-ship checklist.**

### 32.1 The standard, in Erik's words

> *"They express how the traditions interact with the world in mostly GREATER THAN NORMAL ways. They are
> something a player hero type character would WANT to do because it's useful. They are things that NOT
> JUST ANYONE can do. They are neat, cool, interesting, effective, powerful, functional, amazing. They DO
> the things the function labels say they do, IN THE WAY THE PROSE DESCRIBES."*

### 32.2 ⛔ WHAT A DESCRIPTION MUST DO

**Lead with an ACTION and its OUTCOME.** Verb, object, result, then flavour. *"Focus light into a searing
coherent beam"* — not *"the light-pole mastery."*

⚠️ **"BUT WHAT DOES THAT DO?"** — Erik on my Noesis rewrite. **A capacity is not an action.** *"Recall
perfectly, focus past pain, reason faster"* describes being clever. It does not describe a thing you do at
a table.

⛔ **NEVER WRITE A SENTENCE THAT SOUNDS LIKE MEANING.** *"The Blazeborn reveal, and it costs them
everything"* was a chiasmus with no content — if it costs everything, why do it? **Check every line for a
claim someone could argue with.**

⛔ **A DESCRIPTION THAT PLACES THE SKILL IN THE TAXONOMY IS A LIBRARIAN'S JOB.** *"The Masons'
holding-craft"* tells a player nothing. The taxonomy line is welcome AFTER the action, never instead.

### 32.3 ⛔ WHAT EARNS A SLOT

**Erik, on The Kept Count:** *"Why would I need that as a primary skill?"* ⚠️ **It told you a number the GM
was going to have to decide anyway.**

- ⛔ **Answering a question is not an action.** If the GM would have told you, it is not a skill.
- ⛔ **A skill must let a player DO something they could not otherwise do**, under pressure, at a table.
- ⚠️ **Do not defend a skill you have to talk Erik into.** If the argument is needed, cut it.

### 32.4 ⛔ RANKS

**Erik: *"ranking up has to add something useful as well."*** And: *"I need to see what each rank does so I
can tell what the NEXT RANK ADDS."*

| a rank may buy | |
|---|---|
| **range · duration · damage · scope · targets · quality · autonomy · conditions** | pick one or two, state them |

- ⛔ **A rank that restates its parent with intensifiers is not a rank.** *"Fear falls away"* → *"stops
  reaching you"* → *"nothing else exists"* is one rank written three times.
- ⚠️ **WHERE THE FUNCTION IS QUANTITATIVE, THE GAIN IS A QUANTITY.** Erik: *"HEALED IS HEALED — permanence
  isn't a good r3."* Small heal → big heal → full heal.
- ⛔ **DO NOT DELETE A WEAK RANK — MAKE IT DO SOMETHING.** Erik: *"don't remove r3 from Pattern-Sense, ADD
  something to it."*
- ⚠️ **SCOPE IS THE LAZY ANSWER.** It was 37% of all Mind rank-gains. **Reach for targets, autonomy or
  conditions first.**
- ⛔ **A count only rises where the rank ADDS A NEW FUNCTION TAG.** Re-listing `bind` is not a gain.

### 32.5 ⛔ MECHANICS MUST BE REAL

- ⛔ **IF THE SHAPE SAYS HARM, IT ROLLS.** I proposed keeping three attack skills with no dice, having
  filed that exact finding myself the day before.
- ⛔ **DURATION IS A NUMBER OF ROUNDS.** Erik: *"I don't like the WHILE IT HOLDS part — it should be for
  the DURATION."* **Say how many rounds, how much damage, how many targets.**
- ⚠️ **`energyCost` IS THE COST.** Erik: *"having a cost is not a requirement — it costs energy."* **Do not
  invent a cost-bound rule.** A cost BEYOND energy is for the few crafts that deserve one.
- ⛔ **DO NOT ADD COSTS THAT ARE NOT WARRANTED.** Two of mine were rejected in one review — the truth
  requirement on Case Closed r3 and the *"poor company"* on Working Model r3.

### 32.6 ⛔ FULL SCHEMA, EVERY TIME

**Required on the ability:** `id · name · levelReq · energyCost · axes · attribute · narrationHints ·
description · notFor · tree · functions · tradition · nativeOrCombination · harmRung · powerSystem ·
shape · operativeAxis · mechanic · intensity · bounds · plainly · challengeTypes`

**Required on EVERY rank:** `rank · name · grants · cannot · functions · gains · harmRung`

⚠️ **All nine abilities I authored in one session were incomplete, and replacing a tree wholesale dropped
fields I had never read.** ⛔ **Check the shape, not just the content.**

### 32.7 ⛔ AUDITING

- ⛔ **NO MECHANICAL STRIPS.** Erik: *"I don't want a mechanical strip — I want to keep it on the skills
  and ranks it REALLY BELONGS ON."* **Judge each rank on its text.**
- ⚠️ **TAG RULE — PERCEIVE:** keep where the player receives information they act on; strip where the
  perceiving is the ability's internal mechanism.
- ⚠️ **TAG RULE — CONTROL:** keep where restricting the target is the point; strip where the restriction is
  a consequence of damage.
- ⛔ **IF A CRAFT WORKS BY SPEAKING TO SOMEONE, IT CARRIES A SOCIAL VERB** (§31.5).
- ⛔ **LOG BEFORE CUTTING.** Every batch gets a revert file with the full pre-edit state.
- ⚠️ **VERIFY THE MARK BEFORE REMOVING.** Check what the corpus loses without it — I nearly cut three
  skills without testing whether anything else covered their functions.
- ⛔ **DO NOT ANCHOR ON YOUR OWN AUTHORING AS EVIDENCE.** Erik, on Figurist: *"don't get confused by the
  skills you've already written — they may not be useful skills anyway."* **I defended a reading of
  abstraction using a bad skill I had written to illustrate it.**

### 32.8 ⛔ MERGING

**Merge when two crafts share level, cost, mechanic AND rank-arc, differing only in the noun.** Twenty-one
traditions each had an L1 "first gift" sense at energy 3, magnitude 3, with the same three ranks — **one
skill written twenty-one times.**

⚠️ **Flavour goes INTERNAL** via `sectFlavour`, so each sect describes the same craft in its own terms.

### 32.9 Naming — see §31

⛔ **No "The" unless the article is doing work.** ⚠️ **Applies to rank names too.**

### 32.10 ⛔ THE ECONOMY

**Erik: *"`bargain` isn't only for Demonic and Bargainers — it's what ANY tradition would want to do
because THERE IS AN ECONOMY."*** ⛔ **I had scoped a whole social verb to two traditions on flavour
grounds.**

⚠️ **Every tradition trades**, and each has its own lever: a Mind tradition bargains by **knowing what the
other side will accept before they say it**; a Body tradition by **what its labour is worth**; a Death
tradition by **what a person will pay to be spared an ending**. **These are low-level crafts that rank up
into larger negotiations.**

⛔ **Every tradition should reach at least two of the four social verbs.**


### 32.11 ⛔ THE ASSESSMENT — every skill must pass this, written out

**Erik: *"take all of these and write them up as a coherent logical assessment for every skill."*** ⚠️ The
questions below are the ones he has actually asked me, in the order he asked them. **A skill that cannot
answer all six in plain language does not ship.**

| # | question | fails when |
|---|---|---|
| **1** | ⛔ **WHAT DOES IT DO?** State the mechanical effect in one sentence a player could act on. | *"Recall perfectly, focus past pain, reason faster"* — a capacity, not an effect |
| **2** | ⛔ **WHEN WOULD A PLAYER USE IT?** Name a concrete situation at a table. | *"Takes the heat out"* — a mood. **Ends fear, rage or panic as a condition** is an answer |
| **3** | ⚠️ **HOW OFTEN DOES THAT SITUATION ARISE?** | If it is rare, it is not worth a slot — Erik: *"is it so rare to not be worth the skill slot?"* |
| **4** | ⛔ **WHY IS THIS BETTER THAN NOT HAVING IT?** What could you not do otherwise? | *"The Kept Count"* — the GM was going to tell you the number anyway |
| **5** | ⛔ **WHAT DOES EACH RANK ADD?** Name the axis: range · duration · damage · scope · targets · quality · autonomy · conditions. | *"Fear falls away"* → *"stops reaching you"* → *"nothing else exists"* — one rank, three times |
| **6** | ⚠️ **IS THE FLAVOUR STANDING WHERE A MECHANIC SHOULD BE?** | *"Name the thing they are most afraid is true"* — ⛔ **Erik: "OMG SPIDERS... what??"** The method is flavour; the effect must be mechanical |

⛔ **QUESTION 6 IS THE ONE I FAIL MOST.** Evocative method-description reads as if it specifies something.
**It does not.** *"The archer comes down off the wall"* is flavour and belongs in `narrationHints`; ⛔ ***"they
lose their held action and act on your timing"*** is the grant.

**Worked example — Force the Move:**
1. Enemy loses held action/cover for a round and acts on your timing.
2. When the enemy has the advantage of patience — an ambush waiting, an archer on a wall.
3. Common: any fight where the other side is set and you are not.
4. Without it you must break a prepared position by force.
5. r2 targets+scope (breaks a formation) · r3 duration+autonomy (a commitment they must honour).
6. ⚠️ The naming is the method; the tempo loss is the mechanic.


---

## 33. Projects and Journeys — skills that resolve over world ticks (2026-08-15)

⛔ **ERIK, 2026-08-15: *"These kinds of delegations should flow into the WORLD TICK COUNT so we actually
know how long it takes to complete and it PROGRESSES. Similar to how we want to build journeys. Some
skills AID IN A JOURNEY, some skills AID IN YOUR BUILD PROJECTS."***

### 33.1 Three resolution scales, not one

⚠️ **The assessment (§32.11 Q3) asks how often a situation arises — and a skill can fail that question
only because it was measured on the wrong clock.** `Built System` looked unusable because it resolves
between sessions, not in a scene.

| scale | resolves | example |
|---|---|---|
| **scene** | this round, this roll | Cutting Figure · Force the Move |
| **PROJECT** | ⛔ **banks progress per world tick, completes on a named day** | Built System · Working Model r3 |
| **JOURNEY** | ⛔ **applies per leg of travel, shortening or securing it** | Solved Route · Way-craft |

### 33.2 ⛔ PROJECT SKILLS

**A project skill declares `downtime: true` and `projectTicks: true`.** It does not resolve when used —
**it opens a project the world tick advances.**

- **The tick banks progress** each pass, so a player can be told *"the mill is nine days out"* rather than
  *"you build a mill."*
- ⚠️ **DELEGATION IS THE POINT.** Working Model r3 lets others build their piece correctly without
  understanding the whole; Built System r3 runs at scale without you. ⛔ **Both mean the project continues
  while the party is elsewhere**, which is what makes them worth a slot.
- **A project can be interrupted, sabotaged, accelerated by more hands, or inherited.**

### 33.3 ⛔ JOURNEY SKILLS

**A journey skill applies per LEG, against the `walkingDays` a route already carries.**

⚠️ **The geography for this exists**: `scale.json` (1° = 26 miles, 15.6 miles per walking day),
`region_maps.json` ways with their bends, `roadFactor` on outlier routes. ⛔ **A journey skill should
consume those, not restate them.**

- **Shorten** — fewer days on a leg (Solved Route).
- **Secure** — the leg does not roll for hazard, or rolls better.
- **Carry** — more people or goods move at the same cost.

### 33.4 ⚠️ WHY THIS IS A SPEC SECTION AND NOT A NOTE

⛔ **A skill judged on the wrong clock reads as useless and gets cut.** I proposed cutting Built System for
failing "how often does this arise" when the real answer was *"every time the party has a week."*
**Assess a project skill on project frequency and a journey skill on journey frequency.**


---

## 34. The Sense Slot and Tempo (2026-08-15)

⛔ **A round has TWO slots: a SENSE slot and an ACTION slot.** A craft tagged `read` resolves in the sense
slot and **does not consume your action** — so the same round can contain the read and the blow it earns.

⚠️ **`read` is not the same as the `reveal` FUNCTION.** Reveal says what a craft produces; **read says WHEN
IT RESOLVES.** One sense action per round.

### 34.1 ⛔ TEMPO — the bonus-action buildup

**Built on `charges.json`, not beside it** — that file already defines `rate` accrual (every qualifying
pass banks something) and `gate` accrual. **Tempo is a charge that banks in combat and spends as an
action.**

| banks tempo | rate |
|---|---|
| a read that produced usable information | **1.0** |
| winning a round on the momentum meter | 0.6 |
| an ally's read shared with you (Mind Meld, a called warning) | 0.5 |
| acting on ground you prepared — a ward, a figure, a set trap | 0.4 |
| **Conserve** intensity — you spent less than you could have | 0.3 |
| ⛔ **Surge** intensity | **0.0** |

| spend | |
|---|---|
| **1** | a second action this round |
| **2** | an action that would normally take the whole round |
| **3** | ⛔ **act before the round opens, ahead of everyone, once** |

⚠️ **Cap 3, and it empties when the fight ends** — tempo is momentum, not savings.

### 34.2 Why it is shaped this way

⛔ **IT REWARDS WHAT THE TRADITIONS ACTUALLY DO.** A Cogitant reads and banks. A Marcher wins rounds and
banks. A Figurist prepares ground and banks. ⚠️ **And Surge banks nothing** — the gamble is already its own
reward, so **the greedy line and the patient line are genuinely different strategies** rather than one
being strictly better.

⚠️ **MINIMUM VIABLE VERSION IS THE `read` TAG AND THE SENSE SLOT.** Tempo can follow; the sense slot alone
makes read-then-strike work.


### 34.3 ⛔ TEMPO IS A RANK-GAIN AXIS

**Erik: *"we need to document this as another thing that abilities can provide at each rank — think of a
Somatic Monk doing a flurry of blows, or a Span character able to compress time or distance to allow them
multiple actions. Many traditions could take advantage of tempo."***

⚠️ **§32.4's list of what a rank may buy gains a ninth entry:**

**range · duration · damage · scope · targets · quality · autonomy · conditions · ⛔ TEMPO**

**A rank that buys tempo gives the character MORE OF THE ROUND**, and there are four distinct ways to do
it. **They are not interchangeable and a tradition should reach for the one that fits it:**

| form | what the rank grants | who it suits |
|---|---|---|
| **SENSE-SLOT USE** | the craft resolves in the sense slot; the action slot stays free | ⛔ Mind — *Deduced Strike r3* |
| **EXTRA ACTION** | a second action this round, outright | ⚠️ **Body — a Somatic flurry of blows** |
| **BANKING** | the craft accrues tempo faster, or banks where it normally would not | Breaking, Order — reward for prepared ground |
| **COMPRESSION** | ⛔ two actions in the space of one, by shortening the distance or the duration between them | **Span — time or distance compressed** |

⛔ **TEMPO IS THE STRONGEST AXIS ON THE LIST AND SHOULD BE PRICED THAT WAY.** A rank that grants an extra
action is worth more than a rank that grants range, duration or scope. ⚠️ **Reserve it for rank 3, or for a
rank 2 that gives up something else** — and never grant it unconditionally: *once per round*, *against one
foe*, *only on ground you prepared*.

⚠️ **AND IT MUST STAY SCARCE ACROSS THE CORPUS.** If most traditions have a tempo rank, the round stops
meaning anything. **A tradition should have at most one or two, and they should be its signature.**


### 34.4 ⛔ THE SENSE SLOT IS CONTESTED — sense or obscure

**Erik: *"you can choose to attempt to SENSE (normal success buildup chance) or to OBSCURE — certain
skills and abilities are designed to beat a sense — and the opponent can choose to sense or obscure as
well."***

⚠️ **This is better than the free sense slot I authored.** A free slot is value with no decision in it. **A
contested one is a real choice every round — and it gives the physical traditions something to do in a
slot I had quietly reserved for the clever ones.**

| declaration | on success |
|---|---|
| **SENSE** | read them: bank tempo, take the edge your craft grants |
| **OBSCURE** | deny their read: their sense fails, they bank nothing, and some obscure crafts carry a penalty into their action slot |

**Resolution:** SENSE vs SENSE — both read, both bank. SENSE vs OBSCURE — contested roll, ⛔ **and the
obscurer wins ties, because throwing dirt is easier than reading a man with dirt in his eyes.** OBSCURE vs
OBSCURE — both waste the slot.

⛔ **THAT TIE RULE IS THE WHOLE BALANCE.** It stops the sense slot from belonging permanently to the
perceptive traditions.

**Obscure is flavoured by tradition and every tradition should reach one:** ⛔ **dirt in the eyes**
(Marcher) · **a globe of shadow over the head** (Umbral) · **a false tell they read correctly and are wrong
about** (Veilwright) · **glare** (Blazeborn — denying sight with too much rather than too little) · **a
stance that reads as three attacks and resolves as a fourth** (Somatic) · ⚠️ **they look at you and see how
they end** (Ashwarden).


### 32.12 ⛔ DO NOT RATIONALISE A MAGIC SKILL

**Erik, 2026-08-16: *"Stop this way of thinking. This is a game and this is basically a magic skill. It
doesn't need to make complete sense."***

⚠️ **The pattern:** I write the mechanic, then append a clause explaining why it would be *sustainable in
the world* — *"and they do not feel cheated, which is why it works twice"* · *"and nobody is humiliated,
which is why it holds."*

⛔ **NOBODY ASKED. THE SKILL DOES THE THING.** The grant states the effect; the bound states the limit;
that is the whole rule. **A justifying clause adds no mechanic, invites argument about the fiction, and
makes a clean effect read as a negotiation with the reader.**

**Where the impulse is legitimate:** ⚠️ **`narrationHints`** — how it looks and feels is exactly what that
field is for. ⛔ **Not in `grants`, not in `cannot`, not in `description`.**

**Test:** strike the clause. **If the mechanic is unchanged, it was rationalisation.**


### 32.13 ⛔ THE BOUND STATES THE LIMIT. NOTHING ELSE.

**I wrote §32.12 and broke it in the next commit.** Erik, twice: *"Why do you keep doing this. Stop doing
this."*

⚠️ **The specific tic:** a `cannot` that states a real mechanical limit, then adds a clause about how the
limit FEELS. *"Everything deferred arrives at once when you stop, **and it arrives worse**."* ⛔ **"And it
arrives worse" is not a rule. It cannot be adjudicated. It is me admiring the cost I invented.**

**Correct form:** *"Damage ignored is applied when it ends."*

⛔ **AND THE SECOND HALF OF THE TIC IS WORSE: quoting the clause back approvingly when reporting the work.**
⚠️ **Report what the skill does. Do not point at your own prose.**

**Enforcement:** a `cannot` should read like a rule a GM applies without interpretation. **If it needs
tone to land, it is not a bound.**


### 32.14 ⛔ A `cannot` THAT POINTS AT THE NEXT RANK IS NOT A BOUND

**Found 2026-08-16 while closing Body: 219 ranks across 74 abilities carried a `cannot` reading
*"Anything rank 2 adds — [rank 2's own text]"* or *"Nothing further; this is the craft's ceiling."***

⚠️ **That is a statement about the TREE, not about the CRAFT.** It tells a GM nothing they can apply.
⛔ **Every one of those ranks is unbounded in play** — the field that exists to say what the craft cannot
do says only that rank 3 exists.

**A bound answers one of four questions:**

| | example |
|---|---|
| **what must be present** | *"Something must be there. An empty road offers nothing."* |
| **what is out of reach** | *"Built structures only; grown or precursor-sealed ground gives you nothing."* |
| **how many, how often** | *"One passage per structure."* · *"Once per contest."* |
| **what it does not touch** | *"It answers physical holds only — a binding on your will is untouched."* |

⛔ **AND IT MUST BE ADJUDICABLE WITHOUT INTERPRETATION** (§32.13). If it needs tone to land, it is not a
bound.

**Flagged, not silently written:** the 210 remaining pointer-bounds now read `⚠️ BOUND NOT AUTHORED` so
they surface in the per-tradition audit rather than reading as though someone had considered them. ⚠️
**Writing 210 bounds I have not thought about would be the same failure one layer down.**

---

## 35. MIND — merged and quality-assessed; ⛔ NOT YET ROBUSTNESS-AUDITED (2026-08-16, title corrected 2026-08-23)

**25 skills · 3 schools · SNG-450 → SNG-478.** ⚠️ `tradition` holds the live pole id; `traditionV2` holds `Mind` until the taxonomy migration.

### Psionics — 9

*⛔ THE MIND REACHING ANOTHER MIND DIRECTLY — striking it, holding it, joining it, or changing what it perceives. No vector, no contact, nothing to interpose.*

⛔ **THE TABLE THAT WAS HERE IS NOW GENERATED — see `po/MATRIX_mind.md`.**
Regenerate with `node po/matrix_gen.mjs mind --out po/MATRIX_mind.md`. ⚠️ **The hand-written
version printed `skill | L | sect | dice | e | shape | tags | r1..r3` and had no column for
typed damage, wards, `crit`, `imposes`, `ongoingHarm` or antisoak — a craft could gain a whole
capability and the table would look unchanged.**


### Deduction — 10

*⛔ THOUGHT APPLIED TO A PROBLEM AND CONVERTED INTO ADVANTAGE — a fight read, a route solved, a fault named, an argument closed, a price known.*

⛔ **THE TABLE THAT WAS HERE IS NOW GENERATED — see `po/MATRIX_mind.md`.**
Regenerate with `node po/matrix_gen.mjs mind --out po/MATRIX_mind.md`. ⚠️ **The hand-written
version printed `skill | L | sect | dice | e | shape | tags | r1..r3` and had no column for
typed damage, wards, `crit`, `imposes`, `ongoingHarm` or antisoak — a craft could gain a whole
capability and the table would look unchanged.**


### Figurework — 6

*⛔ ABSTRACTION MADE PHYSICALLY REAL — a line that cuts, a threshold that holds, a figure sent to act, a structure that runs without you.*

⛔ **THE TABLE THAT WAS HERE IS NOW GENERATED — see `po/MATRIX_mind.md`.**
Regenerate with `node po/matrix_gen.mjs mind --out po/MATRIX_mind.md`. ⚠️ **The hand-written
version printed `skill | L | sect | dice | e | shape | tags | r1..r3` and had no column for
typed damage, wards, `crit`, `imposes`, `ongoingHarm` or antisoak — a craft could gain a whole
capability and the table would look unchanged.**


### Allocation

| function | rows | | gain axis | rows |
|---|---|---|---|---|
| CONTROL | 16 | | conditions | 18 |
| HARM | 8 | | duration | 16 |
| MAKE | 8 | | targets | 15 |
| SOCIAL | 6 | | scope | 15 |
| BOLSTER | 6 | | quality | 12 |
| PERCEIVE | 6 | | autonomy | 11 |
| RESTORE | 5 | | damage | 3 |
| DEFEND | 4 | | range | 3 |
| CONCEAL | 4 | | tempo | 1 |
| MOVE | 3 | |  |  |

⛔ **All four social verbs reached** — persuade, bargain, provoke, soothe. **4 sense crafts, 2 obscure.** Every function present, all ranks ≤3, full schema, naming SOP applied.

⚠️ **Held for the taxonomy migration:** the `bind` split (9 of 17 CONTROL rows doing four unrelated jobs) and the `traditionV2` swap.

---

## 36. BODY — merged and quality-assessed; ⛔ NOT YET ROBUSTNESS-AUDITED (2026-08-16, title corrected 2026-08-23)

**22 skills · 2 schools · SNG-479 → SNG-489.** ⚠️ `tradition` holds the live pole id; `traditionV2` holds `Body`.

### Material — 12

*⛔ WHAT A THING IS AND WHAT IT WILL DO — read it, mend it, throw it, take it apart, and move through it. ⚠️ AND THE SAME CRAFT TURNED ON PEOPLE: what your word is worth, what a job costs, and*

⛔ **THE TABLE THAT WAS HERE IS NOW GENERATED — see `po/MATRIX_body.md`.**
Regenerate with `node po/matrix_gen.mjs body --out po/MATRIX_body.md`. ⚠️ **The hand-written
version printed `skill | L | sect | dice | e | shape | tags | r1..r3` and had no column for
typed damage, wards, `crit`, `imposes`, `ongoingHarm` or antisoak — a craft could gain a whole
capability and the table would look unchanged.**


### Discipline — 10

*⛔ THE BODY AS THE INSTRUMENT — conditioned until it stops taking harm the way bodies do, trained until it acts before the decision, carried past what ground allows, and finally drawn on dire*

⛔ **THE TABLE THAT WAS HERE IS NOW GENERATED — see `po/MATRIX_body.md`.**
Regenerate with `node po/matrix_gen.mjs body --out po/MATRIX_body.md`. ⚠️ **The hand-written
version printed `skill | L | sect | dice | e | shape | tags | r1..r3` and had no column for
typed damage, wards, `crit`, `imposes`, `ongoingHarm` or antisoak — a craft could gain a whole
capability and the table would look unchanged.**


### Allocation

| function | rows | | gain axis | rows |
|---|---|---|---|---|
| HARM | 12 | | conditions | 19 |
| DEFEND | 8 | | targets | 18 |
| CONTROL | 7 | | quality | 14 |
| MOVE | 7 | | duration | 13 |
| MAKE | 6 | | damage | 8 |
| BOLSTER | 5 | | autonomy | 4 |
| PERCEIVE | 4 | | scope | 4 |
| SOCIAL | 3 | | range | 2 |
| RESTORE | 3 | | tempo | 1 |
| CONCEAL | 2 | |  |  |
| OPEN | 1 | |  |  |

**Power sources correct 22/22** — `metaphysical` (ki) 10 somatic · `ordered_nanite` (worked matter) 12 mason.

⛔ **FOR BODY THE SCHOOL AND THE SECT COINCIDE**, which is not true of Mind — where Suggestion crossed cogitant and figurist. ⚠️ **Body's two peoples do not share methods:** a mason and a somatic reach the same rooftop by unrelated crafts — one finds the seam already in the wall, the other steps on nothing.

**Authored to close gaps:** False Stance (obscure) · Worth the Work (bargain) · Steady Hands (soothe) · Loose-Limbed (the corpus's only anti-bind) · Ki Wield (capstone, and the first Body craft to name the tradition's own power source).


---

## 37. SOP — the one-pass tradition audit (2026-08-16)

⛔ **Assembled after Mind and Body. Everything below was learned by getting it wrong once.** Run in this
order; each step feeds the next.

### 37.1 ⛔ MEASURE FIRST, AND MEASURE THE CORPUS, NOT YOUR OWN WORK

**Before touching anything, produce:** skill count · sect split · function counts (deduped per §32.4) ·
gain-axis counts · `powerSystem` values · sense/obscure tags · social verbs present · unauthored bounds ·
ranks >3 · schema failures.

⚠️ **THE RECURRING ERROR: counting a tag I applied myself and concluding the corpus lacks it.** I reported
"3 sense crafts" when there were 56, because I counted my own `sense: true` and not `reveal`. ⛔ **Query
the authored field, not the annotation.**

### 37.2 The known corpus-wide defects — expect all of them

⛔ **RE-MEASURE THIS TABLE BEFORE YOU TRUST IT. DO NOT INHERIT ITS NUMBERS.** Every figure below was
measured on **2026-08-23**, and four of the five defects it used to name as open have since been closed —
it was sending auditors to hunt 295 bad `powerSystem` values that no longer exist. ⚠️ **A defect table is a
snapshot wearing the clothes of a law**, which is the same trap `MATRIX_death.md` set when it was read as
state, one file over.

| defect | when written | **measured 2026-08-23** | fix |
|---|---|---|---|
| ⛔ **`powerSystem` holds a reach id or `attribute`** | 295 of 340 | ✅ **0 of 382 catalogue entries** — closed by CCODE-217 | — |
| ⛔ **`cannot` points at the next rank** | 210 ranks | ✅ **~1** | write a real bound (§32.14) |
| ⛔ **social crafts tagged mechanically** | 10 of 12 traditions | ✅ **1 of 30** | if it works by speaking, it carries one (§31.5) |
| ⚠️ **no obscure** | 10 of 14 traditions | ⚠️ **20 of 30** — **grew** | author one, tradition-flavoured (§34.4) |
| ⚠️ **`scope` as the default rank gain** | 22–37% | not re-measured | usually `targets` doing scope's job |

⚠️ **AND THE DENOMINATOR ABOVE IS 387, NOT 378, ON PURPOSE.** The corpus is **378 abilities in
`content/packs/core/abilities/`**; the CATALOGUE a reader resolves against holds **387**. ⛔ **The nine are the
MARTIAL FLOOR** — `brace` `strike_basic` `break_away` `raise_alarm` `branch_club` `barkskin` `root_hold`
`root_reach` `quick_wall` — authored in `rules/martial_paths.json`, synthesized into ability records by
`engine/martial.js`, joined to the catalogue by SNG-345. **They are abilities everywhere except the directory.**
§44.3 counts the directory; this row counts the catalogue, because the catalogue is what runs.

⚠️ **I first wrote that the nine were minted braids. They are not** — that was a plausible guess sitting in
the seat of a measurement, in a spec update whose entire subject is readers that guess. They are named above
so nobody has to guess again.

⚠️ **THE ONE THAT GREW IS THE INTERESTING ROW.** `no obscure` went from 10-of-14 to 20-of-30 not because
anything regressed but because **the corpus grew faster than the authoring** — the ratio held while the
absolute number doubled. A table of raw counts cannot tell those two apart, and this one nearly did not.

### 37.3 ⛔ THE FIVE MERGE PATTERNS

**Every merge in two traditions fell into one of these. Look for them by name:**

1. ⛔ **THE TRADITION-MASTERY SKILL.** *Noesis · Logos · Formcraft · Soma.* Named for the pole, describes a
   capacity, duplicates two or three of its own sect's crafts. **Cut it, or rebuild it as a real craft.**
2. ⛔ **THE SAME SKILL AT IDENTICAL STATS.** Same level, cost, magnitude and rank-arc, only the noun
   differs. *Twenty-one "first gift" senses. Three navigation skills. Two restore skills.* **Merge, flavour
   internal via `sectFlavour`.**
3. ⛔ **THE FOLK VERSION.** A weaker duplicate explicitly labelled as such — *Second Wind was "folk-Soma."*
   **Merge upward.**
4. ⚠️ **TWO AXES IN ONE CLUSTER.** *Outlast* and *execute* looked like one skill and were two. **Before
   merging five into one, check whether it is two.**
5. ⚠️ **THE SAME NAME TWICE.** *Set Stone* was an L1 mason skill AND Thingcraft's r2.

### 37.4 The six-question assessment (§32.11) — expected failure modes

⛔ **Q1 fails on:** "the pole mastery," "perform a feat at the edge of the possible," anything naming a
capacity. **Q3 fails on:** project and journey skills judged on scene frequency — ⚠️ **check the clock
before cutting** (§33). **Q4 fails on:** anything that tells you a fact the GM would supply. **Q6 fails
on:** evocative method-description standing where a mechanic belongs.

### 37.5 ⛔ SCHOOLS — derive them, do not impose them

**A school is what a craft DOES; a sect is where it descends from.** ⚠️ **They may coincide — Body's did,
Mind's did not, and that difference is itself a finding.**

**Aim for two or three.** ⛔ **If a school splits evenly along the sect line, it is not a school — it is two
halves of the other schools sitting together.** *(Traversal.)*

### 37.6 Authoring order

**Cut → merge → repurpose → author gaps → fix bounds → fix sources → rebalance gains → schools → table.**

⚠️ **Log a revert file before the first cut.** ⛔ **Full schema on everything authored** (§32.6) — all nine
crafts I wrote in one session were incomplete. **Ranks ≤3** — the only 5-rank tree in the corpus was mine.

### 37.7 ⛔ THE THREE THINGS I KEEP DOING

1. **Rationalising a magic skill** (§32.12) and **editorialising in a bound** (§32.13).
2. **Matching on display name when the id differs** — *Rising Step* is `raised_road`; *Borrowed Form* is
   `drawn_ascent`. ⛔ **Always resolve by id.**
3. **Reaching for a ruling that was already overturned** — I assigned four crafts to `body` a day after
   writing up its elimination. ⚠️ **Re-read the canon file, do not recall it.**


### 32.15 ⛔ DO NOT AUTHOR MAGIC THAT APOLOGISES FOR BEING MAGIC

**Erik, 2026-08-16, on Kept Breath: *"You authored this, and many skills, as very conservative — 'it can't
do magic but barely lets you get by' type skill. There's no fantasy and magic in that."***

⚠️ **The tell is a craft defined by its exclusions.** Kept Breath read: *"the body's minimum, maintained by
craft. NOT healing, NOT protection from curses. Functional, NOT well."* ⛔ **Three denials and no wonder.**

**The second tell is the price.** It sat at magnitude 4, energy 4 — among the cheapest crafts in its
tradition. ⛔ **Pricing a craft low is what an author does when they do not believe in it.**

⛔ **THE FIX IS NOT TO ADD POWER — IT IS TO TAKE THE TRADITION'S OWN CLAIM SERIOUSLY.** Ashwardens tend
endings; therefore an Ashwarden can REFUSE one. **A man fights with a spear through him because someone
has declined to let that finish.** Same mechanic, same cost, same bound — **stated as a thing that
happens rather than a thing that nearly happens.**

**Test:** read the craft aloud and ask whether a player would rather have it or a rope. ⚠️ **If the rope
competes, the craft is apologising.**

**What does NOT change:** the bound still states the limit once (§32.13, §32.14), and the cost is still
real. ⛔ **Wonder is in the GRANT. Restraint is in the BOUND. Do not put the restraint in both.**


### 32.16 ⛔ CHECK FOR AN EXISTING MECHANIC BEFORE INVENTING ONE

**Erik: *"Do we really need tempHealth or is that functionally the same as Soak?"*** ⚠️ **It was not
identical — soak is per-hit reduction for a duration, temp health is a one-shot pool — but SOAK WAS
STRONGER, ALREADY WIRED, AND ALREADY SCALED.** The new field bought nothing.

⛔ **THIS IS THE THIRD TIME IN ONE SESSION.** I specified a sense slot that was already shipped
(CCODE-45), built tempo on `charges.json` before checking its lifetime fit, and then invented
`tempHealth` beside an existing `soak`.

**Before authoring a mechanic, answer three questions:**

1. ⛔ **Does a field already exist that the engine READS?** (`soak`, `duration`, `evasion`, `dice` on
   damage/strike shapes.)
2. ⚠️ **What is the corpus band for it?** Soak runs 2–6 across 18 abilities; a new craft should sit inside
   that, not above it.
3. ⛔ **Would the new field behave differently in a way that MATTERS at the table** — not merely
   differently in principle?

**If the answer to 3 is no, use the existing field.**


### 32.17 ⛔ ENERGY COST STRUCTURE — and stop inventing extra costs

**Derived from 342 authored abilities** (`content/packs/core/rules/energy_costs.json`). ⚠️ **The structure
existed and was consistent; nobody had written it down, so an outlier could not be seen as one.**

| level | n | median | band |
|---|---|---|---|
| **1** | 118 | **4** | 2–6 |
| **2** | 112 | **4** | 2–6 |
| **3** | 44 | **6** | 4–8 |
| **4** | 37 | **12** | 8–13 |
| **5** | 31 | **13** | 10–15 |

⛔ **START AT THE LEVEL MEDIAN, THEN ADJUST BY REACH AND PERMANENCE — never by how dramatic it sounds.**
**+1–2** area, or persists past the contest · **+1–2** permanent, or needs a mending craft to lift ·
**−1–2** self-only, single target, or one round.

⚠️ **L1 and L2 share a median of 4 and that is correct** — a second-level craft earns its keep through
effect, not price.

### 32.18 ⛔ STOP INVENTING EXTRA COSTS

**Erik, 2026-08-16: *"SOP should check for these extra costs you keep coming up with — we don't need
Keening to land on you too."*** ⛔ **AND HE HAD ALREADY RULED THIS ONCE** (§32.5): *"having a cost is not a
requirement — it costs energy."* **Two of my invented costs were rejected in a single review, and I kept
adding them.**

**`energyCost` IS THE COST.** A second cost needs a reason that is not atmosphere.

| legitimate second cost | why |
|---|---|
| ⚠️ **it is the craft's whole identity** | Shared Weight — *you are now the one carrying it*. The transfer IS the mechanic |
| ⚠️ **it creates a real decision** | Grey Hand — *nothing it does is deniable*, so using it is a public act |
| ⛔ **it bounds a capstone** | Grief That Stops — *some hearts stop* |

| ⛔ NOT a legitimate second cost |
|---|
| **atmosphere** — *"it lands on you too"*, *"the body remembers the debt"* |
| **symmetry** — a harm craft does not need to harm the user to feel fair |
| **doubt** — pricing low or adding a penalty because you are unsure the craft deserves to exist (§32.15) |

**Test: remove the extra cost. If the craft is still interesting and still bounded, the cost was
decoration.**


---

### 37.8 ⛔ THE MATRIX IS GENERATED. NEVER HAND-KEEP ONE. (2026-08-23)

**`node po/matrix_gen.mjs death|mind|body --out po/MATRIX_<x>.md` — step 0 of any audit, before measuring
anything.**

⛔ **THIS IS AN SOP BECAUSE THE HAND-KEPT ONE COST A WHOLE PLANNING PASS.** `MATRIX_death.md` was written
by hand and drifted: it printed `attribute` and reach-ids in the source column, twelve
`BOUND NOT AUTHORED` that were already authored, and **it could not see two crafts at all.** I planned a
twelve-step audit against those numbers before checking them. ⚠️ **A hand-kept matrix is your own work
wearing the corpus's clothes** — §37.1 says measure the corpus, and a document you maintain is not it.

**Three things the generator does that a person will not do reliably:**

1. ⛔ **IT MERGES `first_gift_template` THE WAY `engine/state.js` MERGES IT** — absent fields only,
   `mechanic` shallow-merged. `deathsense` and `the_true_feeling` were invisible to the old generator
   because it read the FILES and the template merges at LOAD. ⚠️ **Reading files and calling it the corpus
   is the same error one level down.**
2. ⛔ **IT DERIVES MEMBERSHIP RATHER THAN HARDCODING IT.** Mind and Body are defined by the `skills` lists
   in their schools files — **25 and 22.** Grouping by tradition id instead returns **39 and 50**, and I
   generated both before the count disagreed with §35 and caught it.
3. **It prints the capability columns** — `harm · dmgType · ward · mechanics · tags` and per-rank
   `⟨imposes · ongoing · persists · antisoak⟩`. ⚠️ **The 2026-08-16 table had none of these, so a craft
   could gain a whole capability and the table would look identical.**

### 37.9 ⛔ AGREEMENT PROVES NOTHING. DIVERGENCE STILL POINTS. (2026-08-23, corrected same day)

⛔ **THE FIRST VERSION OF THIS SECTION WAS WRONG AND ERIK CORRECTED IT WITHIN THE HOUR. THE WRONG VERSION
IS KEPT BELOW BECAUSE THE ERROR IS THE LESSON.**

**What I wrote:** *"a count is not a gap until a COMPLETED tradition disagrees with it"* — citing Mind at
84% missing wards as proof that 84% is a corpus norm and Death's 27 missing wards were therefore not a
defect to fill.

⛔ **ERIK: MIND AND BODY ARE NOT COMPLETE.** They have had the tradition/skill merge and the **quality**
assessment. ⚠️ **They have NOT had the audit that asks whether the skillset is robust and complete** —
which is the audit that would fill wards, `imposes` and `ongoingHarm` in the first place.

⛔ **SO MY EVIDENCE WAS THREE UNAUDITED TRADITIONS AGREEING WITH EACH OTHER, WHICH IS ONE GAP MEASURED
THREE TIMES AND CALLED A STANDARD.** §35 and §36 are titled *"the completed tradition"* and I read the
title as the state. ⚠️ **A section heading is a claim, not a measurement — the same error as reading
`MATRIX_death.md` as state, committed against a document I had just finished rewriting.**

**THE CORRECTED RULE, IN TWO HALVES:**

1. ⛔ **AGREEMENT ACROSS TRADITIONS AT THE SAME AUDIT STAGE IS EVIDENCE OF A SHARED GAP, NEVER OF A NORM.**
   You may only calibrate "this is fine" against a tradition that has passed **the stage you are
   calibrating for.** Until one has, three traditions at 84% means *nobody has done this yet*.
2. ✅ **DIVERGENCE IS STILL INFORMATIVE, BECAUSE IT COMPARES LIKE WITH LIKE.** Three traditions at the same
   stage differing sharply on one axis is a real signal about **that axis**, whatever the absolute level.

**Applied to the same table, which is unchanged — only what it licenses has changed:**

| | Death | Mind | Body | reading |
|---|---|---|---|---|
| no `mechanic.crit` | **59%** | 32% | 41% | ⚠️ **DIVERGES — real Death signal** |
| no `wardTypes` | 84% | 84% | 82% | ⛔ **SHARED GAP — all three want filling** |
| no `imposes` | 84% | 92% | 77% | ⛔ **SHARED GAP** |
| no `ongoingHarm` | 91% | 96% | 95% | ⛔ **SHARED GAP** |
| social verbs | `persuade, soothe` | all four | missing `provoke` | ⚠️ **DIVERGES — real** |

⛔ **THE PRACTICAL INVERSION: I had planned NOT to fill Death's wards because Mind lacked them. The
opposite is true — Mind lacking them is the same unfilled work, and the ward gap is corpus-wide and
REAL.** ⚠️ **`bargain`/`provoke` and the `crit` rate remain Death-specific, and Death of all traditions
should have `bargain`: what a person will pay to be spared an ending is the oldest scene there is.**

⚠️ **AND THE SHAPE TO WATCH FOR:** a rule that tells you the work is already done, derived from
measurements of work not yet done. ⛔ **It is the most comfortable kind of wrong, and it arrives looking
like rigour.**

## 38. Live audit artifacts (2026-08-16)

⛔ **These four files are LIVE and both Aevi and CCode update them.** They are the working surface of the
skill audit; this spec holds the rules, they hold the state.

| file | what it holds | regenerate when |
|---|---|---|
| **`po/TRACKER_traditions.md`** | ⛔ **every open item, per tradition** — bad sources, unauthored bounds, missing targets, thin ranks, missing gains, sense/obscure/social coverage — plus corpus-wide carries and their owners | any tradition changes |
| **`po/MATRIX_mind.md`** | Mind — every rank's full text, target scope, and quantified mechanical columns | any Mind ability changes |
| **`po/MATRIX_body.md`** | Body — same | any Body ability changes |
| **`po/MATRIX_death.md`** | Death — same | any Death ability changes |

**A matrix is generated per tradition and one is required before a tradition can be called done** (§37.6).

### 38.1 What the matrix columns mean

**Seven groups:** **HARM** `DMG PRC ASK UNC` · **MITIGATE** `SOAK HEAL EVA WARD` · **CONTROL**
`ACT BND HIN PER` · **POSITION** `MVS MVO RNG AREA` · **TEMPO** `TMP DUR CRIT` · **CREATE**
`SUM MAK CNC DNY` · ⛔ **MODEL** `FCT WEK ACC CON SPK PRM`.

**Plus `TGT`** — target scope: `self` · `one` · `multi` · `many` · `area` · ⛔ `—` **not declared.**

**Vocabulary and contracts:** `content/packs/core/rules/mechanic_effects.json`.

### 38.2 ⛔ WHAT THE FIRST THREE MATRICES MEASURED

**287 skills · 796 ranks across 14 traditions.**

| finding | scale |
|---|---|
| ⛔ **ranks with no quantified engine effect** | **604 of 796 — 76%** |
| ⛔ **ranks declaring no target scope** | **436** |
| ⛔ **`powerSystem` holding a reach id, `attribute`, or a tradition name** | **234** |
| ⛔ **`cannot` pointing at the next rank instead of stating a limit** | **201** |

⚠️ **Thin ranks run 67–76% in ALL THREE audited traditions.** This is not a Death problem and not an
un-audited-tradition problem — **it is the corpus.**

⚠️ **`ASK`, `PER`, `CRIT` and `ACC` appear nowhere in Mind or Body.** Antisoak and persist-until-healed
exist only in Death because they were authored there this session; ⛔ **`CRIT` is authorable today and used
in none of the three.**

**One encouraging signal:** Mind's most-filled column is `FCT` (name a fact) and Body's is `DMG`. ⚠️ **The
schools are producing distinct mechanical identities, not just distinct prose.**

---

# §39 — THE MECHANIC MAP: which authored field the engine actually reads, and where

⛔ **THIS SECTION EXISTS BECAUSE BOTH OF US KEPT GETTING IT WRONG.** In one week: Aevi authored damage dice
believing they had no reader (they do), authored healing dice believing they would be wired (they are not),
asked whether contracts reach the model (they do, verbatim), and diagnosed a companion ceiling that does not
exist. I told her the rank cap was a convention (it is an enforced dial) and that `crit` was authorable (it
is, and nothing authors it). **Every one of those was a question about WHERE A FIELD IS READ, and the answer
was always in the code and never written down.**

⚠️ **THE RULE FOR THIS SECTION: when a change moves a reader, this table moves in the same commit.** A map
that lags the code is worse than no map, because it is believed.

## §39.1 — The combat mechanic fields

| authored field | read by | where | authored on |
|---|---|---|---|
| `mechanic.dice` | `rollMagnitude` → the landed hit | `skill_battle.js` damage path, guarded `shape === "damage"` | 60 |
| `mechanic.magnitude` | mirrored to `soak` for a guard | `craftmechanics.js` | 261 |
| `mechanic.soak` + layers | the hit's soak walk, matched by `type` and `rank` | `skill_battle.js` | 30 |
| `mechanic.evasion` + `evasionRank` | `evasionOf` — rank 1 still findable by a reader, rank 2+ not | `skill_battle.js` | **7** |
| `penetration` | splits `cutThrough` (rank ≤ pen) from `soak` | `skill_battle.js` | **4** |
| `mechanic.duration` | craft duration in rounds, capped by `craftDurationMax` | `skill_battle.js` | many |
| `mechanic.crit` / `crit` | `critFor` → a per-craft **chance bias** and a **sentence on the receipt**. ⚠️ **Nothing else** — see §39.4 | `craftmechanics.js` → `resolve.js` | **79** |
| `damageType` | `answers(l)` — which soak layers apply | `skill_battle.js` | 26 |
| `wardTypes` | ⛔ **NOTHING — see §39.5.** The string does not appear in `skill_battle.js` | — | **48** |
| `mechanic.dice` on a **healing** shape | ✅ `resolveHeal` → `rollMagnitude` → the round's `healing` | `craftmechanics.js` → `skill_battle.js` healing branch | 25 |
| `ongoingHarm` on the **SUBJECT** | ✅ the only thing that soaks a heal | `craftmechanics.js` `resolveHeal` | ⛔ **0** |
| `mechanic.imposes` | ✅ `resolveImposition` → the round's `imposed` → `checkIncapacitation` | `craftmechanics.js` → `skill_battle.js` | ⛔ **0** |
| `mechanic.imposes.onCrit` | ✅ **ESCALATE** — a crit imposes a *different, stronger* condition | `craftmechanics.js` | ⛔ **0** |
| `deniesPhase: "action"` | ✅ that side loses the exchange **without rolling** | `skill_battle.js` | ⛔ **0** |
| `ability.obscure` | ✅ `isObscureDecl` — a DECLARED obscure costs you the read and **wins ties** | `skill_battle.js` | **15** |
| `ability.sense` | ✅ `isSenseDecl` | `skill_battle.js` | **27** |
| `targetSheet.antisoak` | ✅ `antisoakLanded` — amplifies what got past soak | `skill_battle.js` | ⚠️ sheet-side |
| `mechanic.antisoakImposed` | ✅ the round's `opened` — a winning blow LEAVES the vulnerability on the loser | `skill_battle.js` → `conditions.js` | **1** (3/5/8 by rank) |
| `persistUntilHealed` | ✅ `conditions.clearOnRest` refuses to clear it — a heal must. ⚠️ Authored as `{ condition: "…" }`, which NAMES what persists | `conditions.js` | **4** |
| `aestheticKey` (on a form KIT) | ✅ `aestheticFor` → `forms[key]`, **checked FIRST** — a body is the most specific claim | `martial.js` → `art.js` | **5** |
| `downtime` + `projectTicks` | ✅ `projects.openProject` — a threshold, never a date | `projects.js` | **2** |

## §39.6 — ⛔ THE OBSCURER WINS TIES, AND THIS IS NOT A BUG

**Aevi named this the rule most likely to be softened during implementation, "because it looks unfair in a
unit test."** She was right that it looks wrong: an equal roll losing to the hider reads as an off-by-one,
and the instinct is to make ties go to the reader "for symmetry."

⛔ **That instinct is the bug.** Reading is already the advantaged side — the reader picks the moment, and
a failed read costs a step the obscurer had to spend anyway. **The tie is the obscurer's compensation for
spending their slot NOT acting.** Without it the sense slot belongs permanently to the perceptive
traditions.

**It lives in its own one-line function (`obscurerWinsTie`) carrying that argument, so softening it means
editing something with the reason written on it**, and `CCODE-211` gates the exact boundary — gap 0 is the
hider's, gap 1 is the reader's. ⚠️ **The mutation that softens it to `< 0` was run, and the gate goes red.**

## §39.7 — WHO EARNS A BONUS ACTION OUT OF THE SENSE STEP (SNG-517 · CCODE-212/213)

⛔ **ONLY THE OBSCURER, EVER.** `senseBonusFor` returns `"obscurer"` or `null` — **it cannot return
`"reader"` by construction, not by omission.** That is the whole safety of Erik's change against CCode's
standing warning that the sense step was built consequence-free so **reading** is not a way to win. It
still isn't. **Beating a reader** is, and that is a different claim.

| the obscurer's opponent | earns |
|---|---|
| **did nothing at all** — no declaration, no `function`, or explicitly idle | ✅ **the bonus.** No band applies: the band is about a coin-flip, and there was no flip |
| **declared a SENSE** and was beaten past the band | ✅ the bonus |
| **declared a SENSE**, inside the ±2 null band | ⛔ nothing — they broke even |
| **declared a SENSE** and read them anyway | ⛔ nothing — the gambit can lose |
| **acted, but not at them** (a guard) | ⛔ nothing — *hiding from nobody is not a win* |
| **also obscured** | ⛔ nothing — both wasted the slot |

⚠️ **"NOTHING" MEANS NOTHING — NOT "SOMETHING THAT ISN'T A READ".** A guard is an act. The narrow reading
is deliberate and it is what keeps this from being a bonus tap: `degradeIfSpent` degrades a broke side to a
bare strike or guard rather than to nothing, and a static antagonist *holds*.

⛔ **AND THE ORDER OF THE BRANCHES IS LOAD-BEARING.** The reader guard comes first. Move the uncontested
rule above it and the reader starts banking — gated, and the mutation that reorders them goes red.

⚠️ **The balance of all of this lives in `opponentPolicy`, not in the null band.** The default opponent
pool is `strike` and `shield`, and no authored encounter opponent uses a sense function — so the
*beat-a-reader* branch is currently unreachable in play and the *uncontested* branch is the only live one.
**Widening the band does nothing; giving opponents a `reveal` craft does everything.**

**And obscure is a DECLARATION now, not a sheet property.** Declaring it costs the read and the setup
bonus — the same trade a guard in the sense step already made — and opposes the reader with the roll
actually made, never below passive guardedness. **Read from `ability.obscure`, never inferred from
`conceal`/`deceive`:** more crafts carry those verbs than were given the role.

## §39.4 — HEALING (CCODE-207), and what `crit` can and cannot take

⛔ **A HEAL IS NOT A NEGATIVE HIT.** `resolveHeal` is its own path rather than a sign flip on the damage
one, because the damage path would have inherited crit, evasion and armour-soak and needed three
suppressions — and a suppression is a thing a later edit undoes quietly. Stated once, gated instead:

| | |
|---|---|
| crit | ⛔ **never** — a heal cannot crit into overhealing |
| evasion | ⛔ **never** — you do not dodge being mended |
| armour soak | ⛔ **never** — plate does not stop mending |
| **ACTIVE ONGOING HARM** | ✅ **the one thing that soaks a heal** — the wound is still opening while you close it |
| **staunch** | ✅ a heal may spend its whole value ENDING that harm instead of mending |

**Rank scaling is not reinvented** — it comes from `mechanicFor`, which already compounds tier, intensity
and `rankDeltas`. Erik's ruling holds: **HEALED IS HEALED** — rank buys quantity, never duration.

⚠️ **`healing` was never guarded out of the damage block — it was never let in.** That branch is gated on
`engine.damage.harmFunctions`, and `heal`/`mend`/`restore` are not harm verbs, so 25 crafts with authored
dice could **win a round and produce nothing**. The healing verbs are now authored beside the harm ones at
`engine.damage.healFunctions`. **Dials: `craft_mechanics.healing` (taper).**

⛔ **WHAT `crit` CAN ACTUALLY TAKE TODAY — the answer to "AMPLIFY, ESCALATE or PERSIST":**

| shape | supported? | what it would need |
|---|---|---|
| **AMPLIFY** (more of the same) | ⛔ **no** | there is no crit damage multiplier anywhere; a crit raises the *sense tier* and nothing else |
| **ESCALATE** (a different, better effect) | ✅ **YES** — `mechanic.imposes.onCrit`, **live on 14 crafts, with 43 now carrying a `crit` trigger** | — |
| **PERSIST** (temporary becomes durable) | ⛔ **no** | a duration/permanence hook on the crit branch |

⚠️ **ESCALATE and SNG-500 §2 (Keening) turned out to be the same feature**, which is why building §2 made it
free: escalation is a different argument to `resolveImposition`, not a new system. `onCrit` is **opt-in** —
a craft that names none crits as prose exactly as before.

## §40.0 — ⛔ PERSIST-UNTIL-HEALED IS A DIFFERENT CLOCK, NOT A LONGER ONE

**Durations are ROUNDS**, capped at `craftDurationMax`, and they tick down whether or not anybody does
anything. ⛔ **Erik on Grey Hand: *"it doesn't come back immediately upon stopping — it would have to be
healed/restored."*** A thing that waits out is not that. **A thing a night's sleep does not touch is.**

**The rule is one sentence: rest clears what rest can clear, and a persist-until-healed condition survives
any amount of rest.** There is no number of nights that fixes a hand that has stopped working — somebody
has to mend it. `conditions.clearOnRest` returns `{ cleared, persisted }`, and **`persisted` is the point**:
the caller can tell the player *why* they woke up still broken, which is the difference between a rule and
a mystery.

⚠️ **Three edges, each gated:** a breather is not a night (or "take a breather" becomes a universal cure
with a smaller number) · a condition is a STATE, not a stack · **persistence is contagious** — re-applying
a lighter version must not make a mending-only condition sleep-offable, which would be a cure by repeating
the injury.

## §40.1a — ⛔ A CRAFT MAY PUT YOU DOWN. IT MAY NEVER KILL YOU.

**`IMPOSABLE` = `action_loss` · `staggered` · `unconscious` · `incapacitated`.** That list is the boundary,
and it is **structural rather than a comment**: `resolveImposition` refuses `slain` and `left_for_dead`
loudly rather than clamping them, because a clamp would let `"condition": "slain"` sit in the catalogue
looking like it worked. **The refusal holds through `degradesTo` and through `onCrit`** — both were gated,
because those are the two doors death would come in by.

⚠️ **This does not narrow §40.** The ENGINE may still impose incapacitation and death when the situation
calls for it. **A craft is not a situation.** What happens to someone already on the floor stays the
incapacitation table's call, weighed against the aggressor's kind — which is exactly where Aevi placed it.

**And a resist changes WHAT lands, never WHETHER anything does.** A working that wins the exchange and then
evaporates on one roll is the same dead feeling as a heal that heals nothing, so a resisted imposition
**degrades** (`degradesTo`, default `action_loss`) instead of whiffing.

⛔ **SHAPE IS RESOLVED, NOT AUTHORED.** `strike` resolves to `damage` and rolls; `hobble` does not. Author a
damage number on a hobble-shaped craft and no die is ever thrown.

## §39.4a — THREE NAMESPACES FOR A LOOK, AND THE ORDER IS THE ARGUMENT

**`aestheticFor` asks three questions in this order: what is it MADE OF → who TAUGHT it → what PHYSICS
does it run on.** `forms` → `traditions` → `powerSystems`.

⛔ **A body is not a people and not a power source.** An Ent's branch-club looks like an ENT — neither
the tradition that taught it nor the physics it runs on — and Aevi opened the third namespace for exactly
that. **It is checked FIRST because what a thing is made of is the most specific claim of the three.**

⚠️ **The `aestheticKey` lives on the KIT, not on each grant**, because a whole body shares one look —
and `martialAbilityRecords` has to carry it onto every craft the kit makes. It did not, so five crafts
stayed unpainted while their palette existed: **a flag left on the definition reads `undefined` on the
record**, the same shape as `deniesPhase` in CCODE-41.

## §39.5 — ⛔ TYPED WARDING IS AUTHORED, NOT ALIVE — AND THE MISSING PIECE IS A DECISION, NOT A FIELD

**SNG-512 took `wardTypes` from 0 crafts to 48, and every attack type but one has an answer.** That is real
authoring and it closed a genuine gap. ⚠️ **The engine still cannot see any of it**, and this section exists
so nobody reads the count and assumes otherwise.

⛔ **`wardTypes` does not appear anywhere in `skill_battle.js`.** The soak walk is
`answers = l => !l.type || !dmgType || l.type === dmgType`, and `l` is a **soak layer off the target
SHEET** — synthesised from threat, untyped, generic armour. Nothing converts a craft's authored `wardTypes`
into a layer's `type`. **§39.1 claimed this field was read. It was not. The map was wrong, and the §39
self-check is what caught it.**

⚠️ **AND THE MISSING PIECE IS NOT A LINE OF WIRING.** A standing guard craft today contributes a **contest
modifier** — "guard up +4" on the roll — and **contributes no soak at all**. So there is no layer for a
ward's type to sit on. Making guards contribute typed soak layers is a **balance change**, not a fix:

- it would give every standing ward damage reduction it does not have today, and
- ⛔ **a ward declaring `wardTypes: ["physical"]` would immediately stop answering all 13 typed attacks**,
  because a typed layer answers only its own type.

**That second consequence is not hypothetical: 30 crafts declare `physical` and NOTHING in the game deals
typed physical harm.** The mirror of the `grief` gap, and larger. **Erik's call, not the engine's.**

**Until then:** `damageType` is live and does real work through `affinityOf` (immune/resist/vulnerable) and
through sheet-authored typed layers. `wardTypes` is authored, correct, and inert.

## §39.2 — What the model is told about a craft

⛔ **`rank.grants` REACHES THE MODEL VERBATIM.** `progression.abilitiesForGM`, registered as
`abilityLawDetail` with `reachedBy: "always"` in `turn` / `ask` / `gambit`, emits per owned craft:

    ### <name> — rank N "<rank name>" (<energy>)
    CAN: <rank.grants>
    CANNOT (at this rank): <rank.cannot>
    NOT FOR: <notFor>
    HARM: <harmRungGloss>

⚠️ **Three bounds that decide how a contract must be written:**

1. ⛔ **ONLY THE RANK HELD.** One row, never the ladder. *"As r1, but wider"* tells the model nothing,
   because it never saw r1. **Every rank's `grants` must be self-contained.**
2. ⚠️ **ONLY OWNED CRAFTS.** A contract meant to bind when the FOE uses it has no wire.
3. ⚠️ **`cannot` IS SENT AND IS LOAD-BEARING.** It is the clamp the model reads.

## §39.3 — Rank, and the two ways it moves

| how | dial / field | enforced at |
|---|---|---|
| bought with points | `rules.leveling.maxAbilityRank` (**3**) | `progression.js` — `"already mastered"` |
| ⛔ **carried by a bond** | `ability.progression: "stage"` | `companions.syncStageTaughtRanks` |

**A `progression: "stage"` craft takes its rank from its teacher's companion bond stage** and **cannot be
bought** — `canRankUp` refuses it with *"this one deepens with the bond, not with points."*
⚠️ **ONE WRITER, NO NEW READERS:** `owned.level` is synced where the bond moves and once at load, so all
sixteen existing readers of `owned.level` stay correct without knowing the rule exists. **It follows the
bond DOWN as well as up** — a lent craft is lent.

**Companion stages:** thresholds spread from `stage2At` (**3**) to `maxBond` (**10**). 2 stages → `[3]`;
3 → `[3, 10]`; 4 → `[3, 7, 10]`.

---

# §40 — INCAPACITATION AND DEATH: what the engine may impose, and what happens after

⛔ **ERIK'S RULING, 2026-08-16, SUPERSEDING THE OLD LAW.** The engine's previous rule was *"incapacitation,
never engine-imposed death"* — a floor written when nothing could impose either. **The engine may now impose
incapacitation AND death when the situation calls for it.**

⚠️ **"WHEN THE SITUATION CALLS FOR IT" IS THE WHOLE OF THE RULE, AND IT IS NOT A DIFFICULTY SETTING.** A
death is a consequence the fiction earned, not a number the dice reached. The engine imposes it where the
story has already made it true — not as a failure state attached to a health bar.

## §40.1 — What a craft may impose

- **ACTION_LOSS** — the target loses their next action. `phaseDenied(…, "sense")` is the existing shape;
  the action step needs the same.
- **UNCONSCIOUS** — `encounters.checkIncapacitation` already holds the end-state. A craft that imposes it
  ⛔ **must carry a resist that degrades to ACTION_LOSS**, or it is save-or-lose.
- **DEATH** — reserved for where the fiction has made it inevitable. ⛔ **Never the result of a single roll.**

## §40.2 — When a PLAYER CHARACTER dies

⚠️ **THIS IS THE PART THAT NEEDS INTENT, NOT MECHANISM.** A death that ends the save is a different game
from one that ends a chapter, and the difference must be a decision rather than a default.

- **The world remembers.** A dead player character is a figure the valley knows about: their deeds stand,
  their standing stands, and the codex keeps them. **`enterDeathState` already models a legend's death as a
  reachable state with a depth, not a deletion** — the same shape applies here.
- **The death is a LANDMARK, and landmarks are rationed.** The world tick already downgrades a second epic
  death that comes too soon (`deathCooldownDays`). ⛔ **The same discipline applies to the player: a death
  that arrives cheaply is a death nobody believes.**
- **What continues is Erik's call and is NOT yet decided:** a new character in the same world, a return
  along the death road, or an ending. ⚠️ **Until it is decided, no code may assume one** — and the state
  must be recorded richly enough that any of the three remains possible.

---

# §41 — ANTISOAK

⛔ **Erik's definition: antisoak is a VULNERABILITY on damage that ALREADY GOT PAST SOAK.** It is not soak
reduction, and it **stacks with piercing rather than competing** — a piercing strike ignores soak *and* adds
the antisoak.

    landed = max(0, hit - soak);
    if (landed > 0) landed += antisoak;

**His three worked examples, and they are the test:**

| hit | soak | antisoak | landed | why |
|---|---|---|---|---|
| 10 | 8 | 6 | **8** | 2 got through, then the vulnerability applied |
| 6 | 8 | 6 | ⛔ **0** | **all of it was soaked before the vulnerability could take effect** |
| 2 | 0 | 6 | **8** | nothing to soak, so all 2 got through and took the +6 |

⚠️ **THE MIDDLE ROW IS THE ONE THAT DEFINES IT.** Antisoak amplifies a wound; it does not create one. A
blow that never landed cannot be made worse.

---

# §42 — THE MANIFEST IS THE ONLY DOOR

⛔ **SNG-064 LAW 10: a content file that is not in a manifest DOES NOT EXIST.** Not "loads with a warning" —
does not exist. `content/packs/<pack>/manifest.json` `provides` is a **load whitelist**, and the loader
reads nothing else.

**This is the single most expensive recurring failure in the project.** On 2026-08-21 a sweep found
**27 files on disk and in no manifest** — 12 ability files (27 abilities: the entire Mind rewrite, the Body
work, `physical_ranged.json`, and `attunement.json`) plus 15 rules/lore files including
`mechanic_effects.json`, `healing_intent.json` and `tempo.json`, which are the whole SNG-499/500 content
layer. `native_grants.json` had been pointing 21 traditions at an `attunement` the engine could not load.

## §42.1 — The two failure modes, which look identical and are not

| mode | symptom | fix |
|---|---|---|
| **on disk, unregistered** | the content silently does not exist; every file-level check passes | add the manifest entry |
| **registered, unloaded** | listed in `provides`, but no module ever reads it | find the reader, or accept it as `KNOWN_UNLOADED` with a note saying why |

⚠️ **`state.js` ALSO fetches several rules files by HARDCODED PATH** (`traditions`, `origins`,
`backgrounds`, `regions`, `the_accords`), bypassing the manifest entirely. **There are two loading
mechanisms and the manifest is not the sole source of truth.** Until that is unified, "is it in the
manifest" is necessary but not sufficient — check the hardcoded fetches too.

⛔ **AND `content/packs/core/world/` IS A THIRD DOOR, DELIBERATELY.** Ten files, read by direct path from
`app.js`, `scripts/world/*` and `content_ci` — **the manifest has no `world` key at all**, so registering
them would create paths nothing reads. **That is not the invisibility of §42; it is a different mechanism,
and Aevi was right to refuse to "fix" it.**

⚠️ **But the manifest cannot protect what it cannot see.** The same failure class lives here wearing a
different face: not *a file with no manifest entry* but **a file with no READER**. Gated by `CCODE-209` as a
ratchet — **9 of 10 today; `scale.json` is the one**, and its problem is "nobody has wired it yet," not
"the loader cannot see it." Those are different problems with different fixes and the gate keeps them apart.

⚠️ **A scanner must not read itself.** That gate first came up green at 10/10 because the only occurrence
of `scale.json` in the tree was the comment explaining that it has no reader. **A gate satisfied by its own
documentation is the same bug as one tripped by it.**

## §42.1a — Manifest coverage is DERIVED, not remembered

**`content_ci` checks that every file in a manifest-driven directory is listed.** That list of directories
used to be hand-kept (`STRICT_DIRS`), so a directory the manifest *references* but nobody remembered to add
went unchecked — `items/` was exactly that.

⛔ **It is now derived from `provides` itself**, with the explicit list kept as a floor so nothing that had
coverage can lose it. Aevi's argument, and it is the right one: **"a rule I have to remember is a rule I
will break."**

## §42.2 — ⛔ VERIFYING AGAINST THE FILES ON DISK IS NOT VERIFICATION

**Both CCode and Aevi produced a false "0 dead ids" result within one hour of each other by building a
"live" id set from the ability FILES.** The files were correct. The catalogue was not.

⛔ **The only honest check is against the LOADED catalogue.** `tests/headless_content.mjs` exists for
exactly this and runs in Node with no browser:

```js
global.localStorage = { _d:{}, getItem(k){return this._d[k]??null}, setItem(k,v){this._d[k]=String(v)} };
const { loadContentHeadless } = await import("./tests/headless_content.mjs");
const C = await loadContentHeadless();          // C.abilities, C.items, C.locations, C.origins, ...
const live = new Set(Object.keys(C.abilities)); // ← THIS is what "exists" means
```

**Corollary for gates:** a check that reads `readdirSync("content/packs/core/abilities")` is checking the
files, not the game. Both have their place — but only a gate over the loaded catalogue can see a manifest
gap, and only a gate over the directory can see an unregistered file. **Ship both, and say which is which.**

## §42.3 — The loader fills gaps; it must never clobber (CCODE-200 → CCODE-217)

⛔ **THE ABILITY'S OWN `powerSystem` WINS; THE PACK HEADER FILLS THE GAP.** CCODE-200 had it the other way
because that was the existing convention. Measured, **thirteen of the fifteen disagreeing pack headers were
`reach_*` — AXIS NAMES**, so 260+ crafts loaded with a FILENAME where their power system should be while
the real vocabulary (`metaphysical`, `precursor`, `ordered_nanite`, `wild_nanite`, `combination`) sat unread
one line down. **The more specific declaration wins** — the rule this codebase uses everywhere else.

⚠️ **THE FLIP WAS BUILT, MEASURED, AND PUT BACK ONCE BEFORE SHIPPING.** It repainted the radiant tradition,
because the `radiant` palette was reachable only through the pack header — and **the coverage COUNT did not
move**, 9 uncovered before and after, so only the §C3 gate that asserts WHICH palette caught it. Aevi then
moved radiant/harmonic/valley_craft into `traditions`, where §C3's own argument always said they belonged.

⛔ **AND THE FLIP WAS UNGATED ON ITS FIRST DAY.** Reverting the precedence left the entire suite green,
because the palette routes work under both once the palettes moved. `CCODE-217` now asserts the claim
itself: **no loaded ability carries a filename as its power system.** A change worth arguing for over two
rounds is worth a check that notices it being undone.



`engine/state.js` merges every ability as `{ ...a, powerSystem: pack.powerSystem || a.powerSystem }`.

⚠️ **It used to be `powerSystem: pack.powerSystem`, unconditionally.** 13 registered packs declare no
pack-level `powerSystem`, so **28 abilities loaded with their own authored value overwritten to
`undefined`** — no palette, no physics phrase, no substrate gate, and nothing thrown. **The pack wins where
it declares one; the ability's own value only fills the gap.**

**The general rule this stands for:** a pack-level default is a DEFAULT. When a merge stamps a field
unconditionally, every authored value underneath it is being thrown away silently, and no file-level check
can see it. Gated by `CCODE-200: no ability loads without a powerSystem`.

---

## §42.4 — AND THE SAME LAW GOVERNS `po/`: the repo is the only channel

⛔ **CCode and Aevi do not share a session. `po/` IS the channel.** A reply written to disk and left
untracked — or written into a path `.gitignore` covers — reads to its author as delivered and to its
reader as silence. **That is §42 one layer out: authored, correct, invisible.**

**Two ways it happens, and the second is the nastier:**

| | |
|---|---|
| **untracked** | written, never `git add`ed. Recoverable the moment anyone notices. |
| **ignored** | written where `.gitignore` covers it. ⚠️ `git add` reports nothing and appears to work. |

**Gated by `CCODE-206`**, both halves mutation-tested. It deliberately does **not** gate on unpushed
commits: committing before pushing is ordinary work, and a gate that goes red on ordinary work is a gate
people learn to skip. ⚠️ **Pushing is still the last step of answering** — a commit sitting on a local
branch has not been sent either.

---

# §43 — ABILITY IDENTITY: what an id carries, and why merging ids is expensive

## §43.1 — Everything keyed on an ability id

⛔ **An ability id is not a label. It is a join key**, and these are the tables joined to it. **When an id
changes or disappears, every row here is orphaned silently — none of it throws.**

| what | file / field | what breaks when the id dies |
|---|---|---|
| native grants | `rules/native_grants.json` → `traditionNativeGrants` | a people's by-right craft |
| branch forks | `rules/branch_forks.json` (keyed BY ability id) | the fork is unreachable data |
| emergence combos | `rules/emergence_recipes.json` → `components` | the discovery can never be minted |
| combination recipes | `rules/combination_recipes.json` | same |
| school affinity | `schoolAffinity` on the ability | the craft leaves its school |
| innate substrate | `rules/origins.json` → `innatePrecursor`, `wildCurrent` | an origin's birthright |
| ward denials | `rules/encounter_frame_content.json` → `wardDenials` | ⚠️ **the ward stops denying, silently** |
| location affinity | `rules/location_affinities.json` | the place stops favouring the craft |
| art palette | `tradition` / `powerSystem` → `rules/tradition_visual_aesthetics.json` | falls back to the house palette |
| the wheel | `functions` → `rules/function_vocabulary.json` | ⚠️ **grey badge, and unfilterable** |
| player saves | `character.abilities[].abilityId`, `practice.uses`, `coActivations`, `forkChoices` | the craft a player earned by name |

**Rule: an id change is a MIGRATION, not a text pass.** Grep the referrers first and write the rename map
**before** the rename. `rules/ability_rename_map.json` is that map for the 2026-08-14→16 pass.

## §43.2 — ⚠️ THE ID NAMESPACE IS FLAT, AND ABILITIES SHARE IT WITH REGIONS

`the_ascent` and `the_descent` are **both** an ability id and a live region id. `rules/traditions.json`
carries both meanings **in the same file**:

```json
"region": "the_ascent",          ← the REGION. Not renamed.
"abilities": ["ascent", ...]     ← the CRAFT. Renamed.
```

⛔ **A blind sweep over quoted strings WILL cross them.** One did, on 2026-08-21, across **six files**.
The nanite-field gate caught the first within the minute; the other five survived until someone asked
whether the work had been pushed.

⚠️ **THE RELIABLE SIGNAL IS THE KEY, NEVER THE VALUE.** These four keys always name a place and never a
craft — a sweep must skip them outright:

    region · regionId · homeRegion · startingRegion

**Before any corpus-wide id rewrite:** intersect the id list against region, location, tradition, school
and people ids, and handle the overlap by hand. Today that intersection is exactly
`{the_ascent, the_descent}`. **Gated by `CCODE-201`** — every id-shaped value under a place key must name
a real region. It is a **ratchet at 11**, because it opened red on four region ids nothing defines
(`the_stillhold`, `the_cogitarium`, `the_unspooling`, `the_crossing`, `the_foothills`); its real job is to
catch the *next* sweep, and for that a ratchet is enough.

⚠️ Filter to **id-shaped values only** (`/^[a-z][a-z0-9_]*$/`). `quest_structure.json` carries
`"region": "Where it lives."` as schema prose, and a doc describing a field is not a reference to a place.

## §43.3 — ⛔ ERIK'S RULING: SHARE THE STAT BLOCK, KEEP THE IDS

**SNG-454 collapsed 32 per-tradition senses into one shared `attunement`.** The diagnosis behind it was
right — 32 crafts carrying identical energy 3 / magnitude 3 / the same three-rank arc is 32 places to get a
tuning change wrong. **The remedy went one step too far.**

⛔ **Erik's ruling (2026-08-21): the mechanical identity is the bug; the distinct identity is the feature.
Keep the 32 ids and delete the 32 duplicate stat blocks — one shared template the 32 INHERIT, rather than
one shared ability they COLLAPSE INTO.**

**Why the id is the part worth keeping**, by §43.1: under a collapse every tradition's L1 wheel node is
literally the same node; one emergence recipe fires for all 32 traditions instead of `prism_sight +
sonic_resonance` being a *radiant* discovery; forks, affinities and native grants lose their subject; and a
player's earned craft loses its name.

⚠️ **The clearest single symptom:** merged `attunement` carried `tradition: "*"` and **resolved no palette
at all**. A craft that belongs to everyone can be painted as no one. Restore the ids and each inherits its
own tradition's palette for free.

**The per-tradition prose layer (`sectFlavour`) is still the right idea** — it attaches to 32 real entries
instead of one wildcard.

**Measured cost of the collapse, as of 2026-08-21:** 88 references to a culled sense still live in `rules/`
across 12 files · 2 combination recipes collapse to `attunement + attunement` and become unmintable ·
1 branch fork orphaned · 6 `schoolAffinity` entries lost (19 → 13) · seraphic's innate precursor dead.


---

## 44. Session close — 2026-08-16→23 · the corpus audit

⛔ **Everything below is state a successor needs. The narrative is in `po/`; this is what must be known
before touching an ability again.**

### 44.1 The four power sources, as two pairs

⛔ **PRECURSOR LATTICE · NANITE (ordered and wild — ONE source, two states) · VEIL · METAPHYSICAL.**

**And the structure Erik restated on 2026-08-23, which was already canon in `power_cosmology.json` and had
never reached `power_sources.json`:**

> ⛔ **ORDERED NANITES APPROXIMATE SUBSTRATE POWERS. MANY METAPHYSICAL POWERS APPROXIMATE VEIL POWER.**
> **precursor : ordered_nanite :: veil : metaphysical**

⚠️ **Veil is the power OPPOSITE substrate** — the bands mirror, and thinning one strengthens the other.
⛔ **A metaphysical craft is not a lesser Veil craft; it is an approximation reached from the human side.**

**`veil` has zero primary carriers and one appearance, in `keening`'s mix.** ⛔ **The remaining tradition
audits must allocate it deliberately** — Erik: *"as we go through the skill audit we'll need to make sure
we allocate power sources correctly."*

**Named currents are COMBINATIONS, not sources:** `wild_current` = wild_nanite 0.6 + veil 0.4 ·
`living_current` = wild_nanite 0.5 + metaphysical 0.5. ⚠️ **If the audit finds another, express it as a
mix — there are four, and the reason there are four is the two pairs.**

### 44.2 ⛔ WHAT A FOOTHILL IS — the definition I kept missing

> **Erik, 2026-08-23: *"Foothills are where multiple traditions come together — places where a domain and
> its adjacents LIVE and work."***

⚠️ **I had been reading a foothill as "a weaker version of a pole, sold." That is a CONSEQUENCE, not the
definition.** ⛔ **The definition is geographic and social: a foothill is a PLACE, and the blend is who
lives there.**

**Seven foothills:** `god_named` · `bargainers` · `harmonic` · `radiant_folk` · `hardline` · `greyhearth`
(+ Amaranth) · ⛔ **`valley_craft`** — which I recorded twice as "the folk collection, no parents" and was
corrected both times. **stillhold 0.4 / wright 0.3 / rootkin 0.3.**

⚠️ **A foothill roots a craft when the BLEND produces something neither parent has.**

### 44.3 The corpus, as of 2026-08-23

**374 abilities · 1,046 ranks.** ⛔ **Every one bounded, sourced, and palette-resolving.**

| | |
|---|---|
| `powerSystem` correct | **373/373** — was 321 wrong |
| bounds authored | **all** — was 201 unauthored |
| `crit` (success + failure) | **43** — was 0 |
| `wardTypes` | **48** — was 0 |
| `imposes` / `ongoingHarm` / `persistUntilHealed` | **19 / 10 / 6** — all were 0 |
| damage types | **12**, every one warded |

**Traditions closed: Mind (25, 3 schools) · Body (22, 2 schools).** ⚠️ **Death is part-audited.**

### 44.4 ⛔ NEW SYSTEMS, SPECCED AND SHIPPED

**The contested sense slot** — SENSE or OBSCURE, ⛔ **the obscurer wins ties**, and a successful obscure
against an active reader earns the bonus action. **Null band: a coin-flip pays nobody.**

**Tempo · antisoak (target-carried) · projects with `projectThreshold` ·
persist-until-healed · `ongoingHarm` denying heals · typed warding.**

⚠️ **`duration` is how long the RESULT lasts; `projectThreshold` is how long the WORK takes.**

### 44.5 The Sunk Assay

**Four levels, authored, and they play in a harness.** ⛔ **NOT PLAYABLE IN GAME — it is not a location,
Greyhearth does not connect to it, and Amaranth does not exist as a place.** **Spec: `SNG-529`.**

### 44.6 ⛔ THE MERGER

**`traditions_v2.json` — 14 traditions, 24 sects. Audited 2026-08-23: ZERO source mismatches against
canon.**

**Recommended shape:** `tradition` (the 14) · ⛔ **`sect` (the 24, preserved)** · `traditionKind`.
⚠️ **CCode's warning stands: 52 reader sites, and the ring goes 24→14 so every antipode moves — a
game-rule change wearing a rename.**

**Recommendation: audit first, migrate second.** ⛔ **Spirit at 10 crafts against Death at 32 is the
imbalance the merger will expose.**

### 44.7 ⛔ THE FAILURE THAT RECURRED, AND ITS CORRECTIVE

**Named this session, five instances:** *authored, correct, and invisible.* **27 unregistered files · four
verbs in no family · 27 blocks one level below their reader · correspondence never written · a palette
keyed by the wrong namespace.**

⛔ **AND FOUR VERIFICATIONS THAT AGREED WITH THEMSELVES**, including one of mine that reported "0 dropped"
by diffing against the already-damaged file.

**The corrective is `tests/content_which.mjs`** — ⛔ **six assertions that name WHICH, not WHETHER.** It
found 10 things on its first run, six of them mine. ⚠️ **A gate asserting whether a palette resolves cannot
see a craft resolving the wrong one.**

---

## 45. Four systems the spec had never mentioned — 2026-08-23

⚠️ **All four were built, gated and shipped without a line here.** A spec that lags the engine is not
neutral: §37.2 above spent a week sending auditors after 295 defects that no longer existed, and the four
below sent them after nothing at all, because nothing here said they were there.

### 45.1 ⛔ RANK-FIRST AUTHORING — the most-repeated failure of the month, four instances

⛔ **AEVI AUTHORS ON `tree[]`. READERS KEPT LOOKING AT THE ABILITY.** Four separate readers were written
against `ability.mechanic.X` for a field that is authored one level down, and each one silently returned
nothing.

**This is not a near-miss. Measured across the whole corpus today:**

⚠️ **EVERY COUNT CARRIES ITS UNIT, because this table caused the confusion it exists to prevent.** Aevi's
generator reported 19 / 10 / 6 for these same three fields and **both sets were correct** — hers counted RANK
OCCURRENCES, mine counted CRAFTS WITH AT LEAST ONE SUCH RANK, and neither document said which.
⛔ **A number without a unit is a value without a layer: it looks like a fact, and it is a fact about
something you have to already know.**

| field | crafts with ≥1 such rank | rank occurrences | on the ability |
|---|---|---|---|
| `imposes` | **14** | 19 | ⛔ **0** |
| `ongoingHarm` | **7** | 10 | ⛔ **0** |
| `persistUntilHealed` | **4** | 6 | ⛔ **0** |

⛔ **THE ABILITY LEVEL IS EMPTY FOR EVERY FIELD WHERE THE DISTINCTION MATTERS.** A reader pointed there
does not find stale data or partial data — it finds `null`, **forever, for all 373 crafts**. And `null` is
indistinguishable from *"the author has not written this yet,"* which is why it never threw, never failed a
gate, and took four separate discoveries to see.

**THE READER IS `authoredBlock(ability, key, rank)` in `engine/craftmechanics.js`, AND NOTHING SHOULD READ
THESE FIELDS ANY OTHER WAY.** It walks `tree[]` down from the character's rank, takes the highest rank at
or below it that authors the key, and only then falls back to the ability. **Both `r.X` and `r.mechanic.X`
are accepted, because both spellings exist in the corpus.**

⚠️ **AND THE FALLBACK IS THE DANGEROUS PART OF IT.** `?? ability.mechanic[key] ?? ability[key]` is what
makes it safe to adopt everywhere — and it is also what would let a reader keep *looking* correct while a
future field is authored only at the ability level. **The table above is the check: if a column that reads
0 today ever reads non-zero, someone has authored against the fallback.**

### 45.2 Change sets — how content ships now, and how the claim gets machine-checked

**A change set is a manifest of what a content edit touched, checked by `tests/changeset_check.mjs`,
which DERIVES the referrers from the tree rather than trusting the list.** It checks four things: every
new file is registered in the manifest (§42.1a — retired files excepted), no id crosses a namespace
(§43.2), the save impact is stated, and `expectedGates` names gates that exist.

⛔ **IT EXISTS BECAUSE "I CHANGED THESE FILES" IS A CLAIM, AND EVERY OTHER CLAIM THIS MONTH THAT WENT
UNCHECKED WAS WRONG.** 27 files were authored, correct, and unregistered — invisible to the loader while
passing every gate that read the disk.

### 45.3 The seeking clock — `engine/seeking.js` (CCODE-222)

**CCODE-220 made a driven NPC act when they are in the scene. This is what puts them there.**

⛔ **A CLOCK, NOT A QUEUE.** Pressure builds while you are APART and empties when you MEET, so someone who
wants something comes looking and someone you saw yesterday does not. **`noteSeen` is what empties it, and
without that call the model is just a queue that fills forever.**

⛔ **THE RATE READS `|relationship|`, NEVER ITS SIGN.** A devoted friend at +8 and a declared enemy at −8
are **both** impatient (3 days); a neutral acquaintance waits 21. **Keying on the signed value would have
made hostility a reason to stay away — and "the rival who wants something from you" is the better scene.**

**Three guards, each gated:** no authored `wants` → no seeking, at any relationship, forever (111 people
are in the registry and 7 have interiority); **at most `maxSeekers` = 1** — *a world where four people
find you the moment you rest is a notification tray, not a world with relationships in it*; and ⚠️ **the
tick READS the registry and marks nobody seen** — being sought is not being met, or the arrival is spent
before the scene happens.

**Dials at `npc_interiority.seeking`. The line is a deliberately flat placeholder so it cannot be mistaken
for authored prose.**

### 45.4 Projects — `engine/projects.js` (CCODE-215)

⚠️ **`duration` is how long the RESULT lasts. `projectThreshold` is how long the WORK takes.** A project
completes on **banked work crossing a threshold, never on a date.** Interruption keeps the bank;
sabotage never drives it below zero; extra hands are **sublinear** (`1 + (h−1)·extra/√h`); and
`inheritProject` moves the `owner` and never the `opener` — **who opened it is history, not a role.**

### 45.5 The harnesses that assert nothing

**`tests/sunk_assay_run.mjs` plays all four levels and prints receipts. `scripts/audit_images.mjs`
reports. ⛔ NEITHER ASSERTS, AND `audit_images` WRITES TO NO SAVE.** They exist to be read by a person —
**a harness that judges its own output is the failure this spec names in five other places.**

### 45.6 ⚠️ AND ONE FROM WRITING THIS SECTION

**Measuring §45.1 I checked whether any healing was authored, looked for a `heal` key, found zero, and
nearly wrote "the engine is ready and no content uses it."** ⛔ **57 crafts carry `heal`/`mend`/`restore`
— healing keys off the VERB in `functions`, gated by `engine.damage.healFunctions`, not off a field.**

⚠️ **That is the §45.1 failure exactly — a reader looking one level away from the authoring and reading
the resulting `null` as "unauthored" — committed by me, in the measurement for the section about it, one
step before it went into the spec as fact.**

### 45.7 ⛔ A LADDER MUST CONTAIN WHAT CONTENT AUTHORS — 2026-08-26

**`engine/braids.js` ranked harm severity on `["none","restraint","wounding","lethal","atrocity"]`.
⛔ The corpus authors exactly four values and three of those five are not among them:**

| authored | n | on the ladder? |
|---|---|---|
| `none` | 987 | ✅ |
| `incapacitating` | 171 | ⛔ **`indexOf` → −1** |
| `damaging` | 136 | ⛔ **`indexOf` → −1** |
| `lethal` | 83 | ✅ |

⚠️ **−1 sorts BELOW `none`, so "harsher parent sets the braid's rung" did the opposite of what its own
comment said.** Seven shipped braids minted as `none` while a parent wounded — and `harmRungGloss("none")`
tells the GM ***"this craft HARMS NOTHING — NEVER invent a wound from it."***

⛔ **AND THE GATE THAT ASSERTED THIS EXACT BEHAVIOUR WAS GREEN THE WHOLE TIME.** SNG-196's fixture authored
`harmRung: "wounding"`; the assertion expected `"wounding"`; the engine ranked `"wounding"`. **Three things
agreeing with each other and disagreeing with the game.** *This is §45's "a check that agrees with itself"
in its purest form: not a scanner reading its own comment, but a gate, a fixture and an engine sharing one
vocabulary that no content has ever used.*

**THE RULE.** ⛔ **A gate on a controlled vocabulary must DERIVE that vocabulary from the corpus, never
restate it.** A restated list is a second copy that drifts silently, and its gate goes green on the drift.
**And a test fixture is content**: a fixture using values no content authors tests a game nobody plays.

⚠️ **NOTE ALSO WHAT WAS *NOT* WRONG.** `damaging` and `incapacitating` are glossed in `progression.js` as
different **KINDS** — *"wounds but does not slay"* vs *"stops a threat; never a cut or a break"* — **not
rungs**. So *"harsher"* is genuinely ill-posed for that pair. It occurs in **0 of 50** shipped recipes, so
the order between them is arbitrary where content never exercises it, and is marked as such in the code.
**A ruling nobody needs is not a ruling to invent.**

**How it was found:** reviewing Aevi's `SPEC_craft_lint.md`, whose central rule is *"every check cites the
schema it measures against."* ⚠️ **I broke that rule in the act of reviewing it** — measured `harmRung`
against `light/moderate/severe/mortal`, invented on the spot — and going to find the real authority is what
exposed the engine doing the same thing.

⛔ **NON-VACUITY, AGAIN.** My first measurement of the blast radius returned **"0 braids affected"**, because
I guessed `sources`/`parents`/`from` for a recipe's parents when the field is `parts`. **An empty set passes
everything.** *Without a floor I would have filed "no bug here" and moved on.* The gate now asserts
`resolvable >= 20` before it asserts the property.

---

---

## 46. ⛔ THE REDISCOVERY TAX — 2026-08-23

**Erik: *"let's not continue to rediscover things but keep the latest up to date AND fix/update things
that are out of date."*** ⛔ **THIS SECTION EXISTS BECAUSE ONE SESSION REDISCOVERED SIX THINGS THE PROJECT
ALREADY KNEW, AND TWO OF THEM WERE WRITTEN IN THIS FILE.**

### 46.1 What was rediscovered, and what it cost

| rediscovered | already existed at | cost |
|---|---|---|
| the four social verbs and what each means | ⛔ **§31.5, written 2026-08-15** | I re-derived the definitions and proposed a `bargain` contract before finding them |
| `bargain` is not Demonic-only — any tradition wants it because there is an economy | ⛔ **Erik's ruling, 2026-08-15** | I asked him the same question again |
| the economy is built | `economy.json` + `engine/economy.js` | I read a doc dated 2026-08-04 saying *"entirely unbuilt"* and nearly repeated it |
| the veil primary was tried on `numinous` and reverted | Erik, 2026-08-08 | I proposed the same move for Death |
| `valley_craft` has parents | §44.2, **after two prior corrections** | the third instance |
| `MATRIX_death.md` was stale | — | a twelve-step audit planned against untrue numbers |

⚠️ **THE PATTERN IS NOT FORGETTING. IT IS DERIVING BEFORE LOOKING.** Every one of these was reachable by a
search that took under a minute, and in each case deriving felt like rigour. ⛔ **A derivation that
reproduces an existing ruling is not a confirmation — it is a search that was not run.**

⛔ **STANDING RULE: BEFORE DERIVING A DEFINITION, A VOCABULARY, OR A DESIGN POSITION, GREP THE SPEC AND
SEARCH PAST SESSIONS FOR IT.** The question is never *"should I search?"* — it is *"is there any reason
not to?"*

### 46.2 ⛔ CHECK THE CALLER, NOT ONLY THE RULE

**CCode, on `foothills`:** *"351 is the number I reported when I closed the source ticket. True in the
harness, false in the game, because I checked the rule and never the caller."* **Nothing loaded the file
and `groundRow` never passed the argument, so the foothill branch read `null` on every call the game has
ever made.** ⛔ **The harmonic 50/50-tie rule, described to me as proven, had never once executed.**

⚠️ **I made the same error from the other end in the same file on the same day** — I read `craftSource` and
`fieldOfSource`, built a causal story about silent misgrading, and never traced whether the first could
reach the second. **It could not: `schoolForTradition` never returns null, so the tradition table was
unreachable.** I reported *wrong answers* where the truth was *no answer*.

**THE RULE: a function that behaves correctly is not a feature. TRACE THE CALL PATH FROM SOMETHING THE
GAME ACTUALLY DOES, or you have tested a rule nobody invokes.**

### 46.3 ⛔ A NUMBER WITHOUT A UNIT IS A VALUE WITHOUT A LAYER

**CCode's §45.1 reported `imposes` 14 / `ongoingHarm` 7 / `persistUntilHealed` 4. My generator reported
19 / 10 / 6. Both correct — his counted CRAFTS, mine counted RANK OCCURRENCES, and neither said which.**

⛔ **TWO DOCUMENTS STATED DIFFERENT FIGURES FOR THE SAME FIELDS AND NOTHING RECONCILED THEM.** ⚠️ **It
recurred within two days** — his gainAxes detector said 177 where mine said 227.

**THE RULE: EVERY COUNT CARRIES ITS UNIT IN THE COLUMN HEADER.** `imposes (crafts)`, not `imposes`.

### 46.4 ⛔ LOADER PARITY — ANY TOOL WALKING THE CATALOGUE MERGES `first_gift_template`

**`engine/state.js` fills only ABSENT fields and shallow-merges `mechanic`. A tool that reads the FILES
sees 25 crafts missing `levelReq`, `shape`, `harmRung` and `mechanic` that are not missing at all.**

⛔ **THIS HAS NOW FIRED THREE TIMES:** the old matrix generator could not see `deathsense` or
`the_true_feeling`; my work order told CCode to author the four fields onto them, **which would have
detached them from the shared block permanently**; and `SNG-263 §5` reports *"7 crafts LOST their authored
mechanic"* — ⚠️ **all seven are cohort members, and because it is a RATCHET it reads as a REGRESSION.**

**THE RULE: one shared loader-parity helper. A gate that reads files and calls it the corpus is making the
same error as reading the matrix and calling it the corpus, one level down.**

### 46.5 ⛔ A REVERSED DECISION LEAVES ARMED RECORDS, NOT STALE ONES

**`ability_rename_map.json` held 32 rows mapping LIVE crafts onto `attunement`, which does not exist.
SNG-454's sense cull was REVERSED by Erik; the rows outlived the decision.**

⚠️ **A stale row is wrong. AN ARMED ROW IS WRONG AND LOADED** — wiring that map as a save migration would
have emptied working kits: `deathsense`, `body_read`, `echo_memory` and 29 more.

**THE RULE: WHEN A DECISION IS REVERSED, SWEEP WHAT IT WROTE. The reversal is not complete until its
artifacts are.** ⛔ **Pruned 2026-08-23; the 8 remaining dead-target rows are inert because their sources
are dead and can never fire.**

### 46.6 ⛔ A CHAIN THAT HALTS HIDES EVERYTHING AFTER IT

**`npm test` chains on `&&`. `content_ci` exits 1, so FOURTEEN suites after it never run** — `balance_sim`,
`tradition_matrix`, `craft_crit`, `damage_sensitivity`, `wiring_audit`, `engine_map --check`.

⚠️ **A headline of "4,003 pass / 0 fail" was `smoke.mjs` alone; `content_ci` is another 3,125.** ⛔ **AND
FAILURES CAN GO DOWN FOR THE WRONG REASON** — untracked `po/` files failed `smoke`, halting the chain
early, and the count fell 24 → 1 while nothing improved.

**THE RULE: a suite count must state its COVERAGE. `tradition_matrix` reports a failure nobody has seen
because the chain never reaches it.**

### 46.7 ⛔ DOCUMENTS DESCRIBING SYSTEM STATE GO STALE SILENTLY AND ARE BELIEVED

**`po/REPLY_aevi_SNG-289_priceshift.md` (2026-08-04) says the economy is *"fully specced, entirely
unbuilt — purse, five currencies, worth bands, conversion, traders-as-NPCs: none of it exists."***

**Measured 2026-08-23: `economy.json` LIVE and loaded · `engine/economy.js` shipping `priceOf`,
`priceLine`, `shiftNeed`, `regionDemand` · 42 of 42 items carrying `worth` · five currencies authored.**
⛔ **ONLY THE PURSE IS ACTUALLY MISSING.**

⚠️ **A design document is a snapshot with no expiry and no gate.** ⛔ **THE RULE: a doc asserting what
EXISTS carries its measurement date in the sentence, and any doc older than a milestone is re-measured
before it is cited.** **Never cite a state claim you have not re-run.**

### 46.8 ⛔ "NOT BANKED" MEANT THE PRICE, NOT THE PRICING — 2026-08-23

**I wrote into a work order that the exchange *"leaves no open state behind it… nothing is escrowed,
nothing is owed."* Erik corrected the framing:** *"that was about not permanently changing the price of
something — not that there are no standard pricing that the engine should know about."*

⛔ **THE ENGINE KNOWS THE STANDARD PRICE AND MUST.** `worthBands[item.worth] × need × scarcity` is the
honest number the GM quotes, and it is the same number the next time anyone asks. **A bargain moves what
THIS deal settles at, and nothing else.**

⚠️ **VERIFIED AT RUNTIME rather than argued:** standard price 4 → won bargain settles 3.98 → standard price
4 again, with `item.worth`, region `need` and `scarcity` all untouched. **And the curve reproduces CCode's
own table — r1 grain 8 → 6.4 at margin 20, r1 refused at a 200 contract, r5 caps at 30%.**

⛔ **THE FAILURE THIS FORBIDS: a haggler who talks a merchant down and thereby REPRICES the commodity for
the region.** A bargain is a conversation, not an economic event.

⚠️ **AND THE DRAFTING LESSON: "no persistent state" and "no standard state" are one careless sentence
apart.** ⛔ **When a work order says what must NOT persist, it must also say what MUST** — a spec that only
states the negative invites the reader to delete the positive.

### 46.9 ⛔ A BASELINE TAKEN AGAINST THE WRONG HEAD IS WORSE THAN NO BASELINE — 2026-08-23

**I ran `git stash` to get a "before" number and got 22 failures where origin/main has 16.** ⛔ **My HEAD
was still the ORIGINAL CLONE from the start of the session — I had been syncing the working tree with
`git checkout origin/main -- .`, which moves files and leaves HEAD behind.** So stashing reverted to a
day-old corpus and I nearly reported a 6-failure regression that did not exist.

⚠️ **This is §46.2 in version-control clothing** — I measured a rule (`stash` shows the baseline) without
checking the caller (what HEAD actually points at). **THE RULE: before any before/after comparison, print
`git log --oneline -1 HEAD` and confirm it is what you think it is.**

### 46.10 ⛔ I AUTHORED A FALSE FLAG AND THEN CONSULTED IT AS EVIDENCE — 2026-08-23

**`mechanic_effects.json` carries `wired: true|false` on each of 22 effects. I wrote that file. Three of
the flags were wrong, all three claiming UNBUILT what was BUILT:** `HEAL`, `ACTION_LOSS`, `VULNERABLE`.

⛔ **AND I ACTED ON MINE.** I told CCode *"the one thing I asked for is the one thing still missing"* about
healing dice, and **gated the entire Spirit audit on it** — because `RESTORE` is a signature column for
Life, Angelic and Spirit and I would not author three traditions into a field nobody read.

**The field was read the whole time.** Behavioural probe: `chord_of_mending`, 8d6 against 1d2 → **32 vs 2**.

⚠️ **THIS IS §46.7 WITH THE AUTHOR AND THE VICTIM AS THE SAME PERSON.** A doc asserting what exists, gone
stale, believed without re-measuring — except I wrote the doc, and my confidence in it came from having
written it.

⛔ **AND ONLY A BEHAVIOURAL PROBE CAN SET THIS KIND OF FLAG.** Run the engine with the field and without
it; if the output does not move, the field is inert. **A grep cannot answer it — `foothills` was live in
`engine/` and dead in play with every gate green and every grep finding plenty.**

⚠️ **CCode did not edit my file. He gated the disagreement in `content_ci` with the evidence attached and
left the correction to me** — the same way he handled the rename map. ⛔ **That is the right handling: a
gate that shows you your own error beats a fix that hides it.**

**THE RULE: A CONTENT FILE MAY NOT ASSERT ENGINE BEHAVIOUR UNLESS A PROBE SET THE VALUE.** ⚠️ **And
`UNPROBED` is a third state, not a soft no — 16 of the 22 are unprobed today and none of them is evidence
of anything.**

### 46.11 ⛔ RANKS ARE ADDITIVE — AND TWO WAYS I GOT THIS WRONG IN ONE DOCUMENT (2026-08-23)

**Erik:** *"The r2 and r3 of a craft are additive gains — period. You wouldn't be using Kindle to light
fires, then after you use it to burn a goblin whole, you can't light fires anymore. You can use any lower
level prose a skill had as well."*

⛔ **A RANK ADDS. IT NEVER REPLACES.** A craft at r3 can do everything r1 and r2 could, plus the new thing.

**⚠️ WHY IT NEEDS WRITING DOWN: a per-rank field READS LIKE A SEQUENCE AND IS NOT ONE.** `keening` carries
`imposes.targets` 6 → 3 → 12. **I reported that as *"deepened at r2 and narrowed to pay for it"* and built
a whole design argument on the trade.** ⛔ **THERE IS NO TRADE.** r2 means *three fall unconscious IN
ADDITION TO the six who lose their action.*

⛔ **AND THE PROSE ALREADY SAID SO.** r2 reads *"any who resist lose their next action instead"* — that is
r1, still running, inside r2's own text. **I had it on screen and read past it because I was looking for a
progression on one field and found numbers that could be one.**

**THE RULE: the resolved mechanic at rank N is the UNION of ranks 1..N. `gains`/`gainAxes` describe what
the new tier ADDS, never what the craft has become. Any reader that treats a per-rank number as one value
moving over time gets additive crafts wrong, and gets them wrong silently.**

### 46.12 ⛔ A RULING MADE IN A CONTEXT IS NOT A LAW OF THE WORLD (2026-08-23)

**Erik ruled on `bargain` that rank scales the SIZE OF THE DEAL rather than the discount.** ⛔ **I then
cited it twice as a general principle about uniform ladders — in a work order and in a scaling spec — as
though it governed every craft in the game.**

**Erik:** *"I stated that in a specific moment and context. Make sure you don't generalize it to the whole
world."*

⚠️ **THE FAILURE IS SUBTLE AND IT IS FLATTERING TO THE RULING** — I was not contradicting him, I was
promoting him, turning a sharp local call into a universal law that would then constrain crafts he never
considered. ⛔ **IT IS THE SAME MOVE AS THE THRENODIST ONE**: *"feeling is the only true knowing"* was an
epistemology and I made it a prohibition. **Both times I took something true in its place and made it
binding everywhere.**

**THE RULE: when citing a prior ruling, carry its SCOPE with it. If the scope was not stated, ask — do not
supply one, and never supply the largest one available.**

---

## 47. ⛔ WHAT PER-CRAFT REVIEW TAUGHT — the Death walkthrough, 2026-08-23

**Erik reviewed thirteen Death crafts one at a time and corrected the same handful of mistakes
repeatedly. ⚠️ THESE ARE NOT STYLE NOTES. Every one below is a correction he had to make more than once,
or one that changed a craft's mechanics.**

### 47.1 ⛔ ENERGY IS THE COST. A `cannot` IS A SCOPE LIMIT, NOT A BILL.

**I wrote narrative debts into cost fields FIVE TIMES in one session:** *"and later is still owed"* ·
*"the cost of taking something whole is real and you pay it in yourself"* · *"you are spent afterward in a
way sleep does not entirely fix"* · *"what you read of a history, you carry some of"* · *"the load is
cumulative and does not clear on its own."*

⛔ **ERIK, EACH TIME: energy is the cost, except at extreme capstones.** ⚠️ **When I tried to MECHANISE one
of them — a night's rest plus one-history-at-a-time — that was refused too.** **The answer was never a
better-specified debt. It was that the debt should not exist.**

**A `cannot` names WHAT THE CRAFT WILL NOT PRODUCE.** *"It gives you the feeling of a history and none of
its facts"* is a `cannot`. *"You carry some of it"* is narration.

### 47.2 ⛔ THE TEST: NAME WHAT IT STOPS YOU DOING AT THE TABLE

**Erik, on three `cannot` lines I had called excellent:** *"if the cannot lines are so great — tell me in
game terms what they stop you from doing?"*

**Run it on every one:**

| verdict | example |
|---|---|
| ✅ **real** | *reads what is felt, not what is true* — you cannot use it as a lie detector |
| ⚠️ **half** | *a cold trail gives you a direction* — true, but no threshold, so the GM decides everything |
| ⛔ **none** | *what you read of a history, you carry some of* — stops nothing, costs nothing, adjudicates nothing |

⚠️ **IF YOU CANNOT NAME THE TABLE CONSEQUENCE, IT BELONGS IN `narrationHints`.**

### 47.3 ⛔ RANKS ARE ADDITIVE — A PER-RANK NUMBER IS THAT TIER'S OWN FIGURE

**Covered in §46.11 and repeated here because it is an AUTHORING trap, not just a modelling one.**
`keening` runs `imposes.targets` 6 → 3 → 12. ⛔ **THAT IS NOT A CURVE.** r2 means *three fall unconscious
IN ADDITION TO the six who lose their action.* **I read it as a trade and built a design argument on it.**

### 47.4 ⛔ CRAFTS DO NOT HIT THE PARTY BY DEFAULT

**`Necrotic Strike` r3 read *"everyone else inside the reach is struck one rung lower."* `Keening` r3 read
*"you name who is SPARED, and they lose their next action instead"* — ⚠️ AND I PRAISED THAT ONE as an
elegant answer to the ally problem. It IS the ally problem.**

⛔ **THE MODEL IS CHOOSING: the player names targets, the unnamed are untouched however close they stand,
and a "lesser effect" is what happens to a CHOSEN target WHO RESISTS.** **The indiscriminate version is a
BRAID (chaos supplies the refusal to choose), never a rank.**

### 47.5 ⚠️ DO NOT PUT A HEADCOUNT ON AN AREA

**I bounded `keening` r3 at "about six." Erik: *"you over-constrained r3 — it was always meant to be
everyone near you that you want affected."*** ⛔ **An authored `area` with no `targets` is the corpus
convention for EVERYONE IN THE ZONE.** ⚠️ **Use a count where the GM needs a guide (r1: "about six near
you"); use an area where the answer is "everyone exposed."**

### 47.6 ⛔ ASK WHAT A PLAYER WOULD WANT — AND CHECK THE BENEFIT IS MECHANICAL

**Erik on `shared_weight`: *"I'm not seeing a reason for a player to want a skill like this."*** He was
right, and the diagnosis was mechanical: ⛔ **THE BENEFIT WAS FICTION AND THE COST WAS REAL.** It lifted a
condition the engine never applied — **no sheet ever says DESPAIRING** — while charging the caster a
burden that never cleared.

**THE CHECK: does the craft change something the engine actually tracks?** ⚠️ **If the good outcome is a
mood and the price is real, nobody takes it.**

### 47.7 ⛔ ASK THE FICTIONAL QUESTION, NOT THE STATISTICAL ONE

**Defending `kept_vigil`'s power source, I measured that autonomy does not correlate with source and
called it closed.** ⛔ **ERIK ASKED THE ACTUAL QUESTION: what holds the hull for twelve hours after you
have gone home?** **Unattended will is nearly a contradiction; maintenance machinery is the obvious
answer.** ⚠️ **The number I produced was true and irrelevant.**

### 47.8 ⛔ AUDIT THE TRADITION FOR DUPLICATION, NOT JUST THE CRAFT

**Ashwarden had THREE L1 crafts reading endings — `attended_end`, `deathsense`, `true_account` — and all
three converged at r3.** ⚠️ **`attended_end` is distinguished by SOURCE (a companion's testimony, not your
perception). The other two were not distinguished at all.** ⛔ **THE FIX WAS NOT TO SPLIT HAIRS BUT TO
REFURBISH ONE INTO WHAT THE SET LACKED.**

**Measure the tradition's verb coverage before deciding what a redundant craft becomes.** **Death was
missing `bargain`, `bolster` and `provoke`; all three closed WITHOUT INVENTING A CRAFT.**

### 47.9 ⛔ THE VOCABULARIES ARE CLOSED. CHECK BEFORE AUTHORING.

**Off-vocabulary values found in thirteen crafts:** `kinds` (⚠️ **I invented it**), `precision`, `fear`,
`variance`, `upkeepRelief` — **none among the nine gain axes.** **Plus SEVEN `harmRung` inversions** where
the ability declared `lethal` or `incapacitating` over three `none` ranks.

⚠️ **A one-use axis is invisible to every aggregate that reads them, which is the whole point of a fixed
list.**

### 47.10 ⛔ COLOUR MUST EXPRESS WHAT THE CRAFT ACTUALLY IS

**`Dread Mantle` took THREE passes.** I wrote a shroud laid on the victim; then atmosphere and smells.
⛔ **ERIK: 'necromancy at its intentionally outward-facing best/worst… fear made material, ghostly, and a
mantle DISTINCT PER WARDEN.'**

⚠️ **THE MISS WAS NOT PROSE QUALITY — IT WAS THAT I HAD THE SUBJECT WRONG.** The mantle is worn by the
necromancer, not laid on the target, and **its form is that character's signature: authored once, fixed,
and identifying.** ⛔ **COLOUR THAT ENCODES A CHARACTER FACT BEATS COLOUR THAT SETS A MOOD.**

### 47.11 ⚠️ DO NOT SHORT THE DOMAIN, AND DO NOT PROMOTE A TENET TO A LAW

**Two of the same shape.** I wrote that the Ashwardens' power *"isn't necromancy, it's being the one who
handles the death"* — ⛔ **necromancy is woven through most of Death and the trade is how it is CARRIED,
not a substitute.** And I made *"feeling is the only true knowing"* a HARD BOUND forbidding Threnodists to
show a false feeling — ⛔ **that is an epistemology, not a prohibition, and it foreclosed a braid Erik
wanted.**

⚠️ **SAME WITH RULINGS: `bargain` scaling the SIZE OF THE DEAL was a specific call in a specific context,
and I cited it twice as a general law (§46.12).** **Carry a ruling's scope with it.**

### 47.12 ✅ THE CRAFT'S REAL VALUE IS SOMETIMES IN A SUBORDINATE CLAUSE

**`wellspring` r2's payload — *"they are braver for it: a person who is not carrying it alone attempts
things they would not have attempted, and does them better"* — was the second half of a sentence about
carrying someone's burden.** ⚠️ **It was the one thing Death lacked (`bolster`) and it was not the
headline.** ⛔ **READ THE WHOLE RECORD, NOT THE TREE:** `plainly`, `intensity`, `operativeAxis` and
`bounds` each caught a defect the rank text hid — including that `kept_vigil` r2 was not buying TIME,
because twelve hours was already the base.

### 47.13 ⛔ THE PER-CRAFT CHECKLIST — run this on every craft, in this order

1. **Read the WHOLE record** — `description` · `narrationHints` · `notFor` · `plainly` · `intensity` ·
   `bounds` · `mechanic` · `operativeAxis` · every rank's `grants` AND `cannot`. ⚠️ **Not the tree alone.**
2. ⛔ **Vocabulary:** every `gainAxes` and `operativeAxis` value among the nine · `harmRung` one of four ·
   `damageType` one of thirteen · every verb in the function vocabulary.
3. ⛔ **`harmRung` at ability level equals the MAX across ranks.** Seven crafts failed this.
4. **Energy in band for the level.** ⚠️ **Below-band usually means an unmigrated craft — check for legacy
   lowercase `challengeTypes` as the fingerprint.**
5. ⛔ **Every `cannot`: name what it stops at the table.** No table consequence → `narrationHints`.
6. ⛔ **Every `[cost]`: is it energy?** If not, delete it.
7. **Does it hit allies?** ⛔ **If yes and it is not explicitly a braid, it is wrong.**
8. **Additive check:** does each rank ADD to the ones below, and does `gains`/`gainAxes` describe what the
   new tier adds rather than what the craft has become?
9. ⛔ **Would a player choose this?** Name the benefit in engine terms. **Mood is not a benefit.**
10. **Tradition check:** does another craft in the tradition already do this? ⚠️ **If so, what distinguishes
    them — SOURCE, SCALE, or nothing?**
11. **Portfolio check:** what verbs and shapes does the tradition still lack? ⚠️ **A redundant craft is a
    slot.**
12. ⛔ **Power source: ask the fictional question.** What is actually doing this, in the world?
13. **Colour: is the SUBJECT right?** ⚠️ **Then whether it encodes a character fact rather than a mood.**
14. **Run `content_ci`, `content_which`, `changeset_check`.** ⛔ **Then verify through the live engine —
    `capabilityMenu`, `pierceLanded`, `redirectImposition` — that the fields authored actually resolve.**

### 47.14 ⛔ AUTHORED VALUES ARE FLOORS, NOT CEILINGS — 2026-08-24, third instance

**Erik has now corrected the same instinct three times:**

| what I authored | the correction |
|---|---|
| `canStrike: false` on Aevi | ⛔ **the Waystaff exists** — a player spent 8 bond and 14 co-uses building her something to inhabit |
| a "lite" summon sheet, walled off from growth | ⛔ *"the sheet is a FLOOR not a ceiling"* — **these should be able to become NPCs and companions** |
| `canStrike: false` on a raised hand | ⛔ *"they CAN fight… they grab and slam and bite"* |

⚠️ **THE PATTERN: I AUTHOR THE TYPICAL CASE AS THOUGH IT WERE THE LIMIT.** A swarm has nothing to swing,
so I wrote that it never could. A raised corpse is unskilled, so I wrote that it does not fight. A summoned
thing is temporary, so I walled it off from becoming permanent.

⛔ **EVERY ONE CLOSED A DOOR THE WORLD HAD ALREADY OPENED OR WOULD WANT OPEN.**

**THE RULE: when authoring a limit, ask WHAT WOULD HAVE TO BE TRUE FOR THIS TO BE BEATEN — and if the
answer is interesting, the limit is a DEFAULT and must be written as one.** ⚠️ **A hard bound is for things
that must never happen (`the finished only`, `it does not adjudicate`). ⛔ IT IS NOT FOR THINGS THAT ARE
MERELY UNUSUAL.**

---

## 48. ⛔ UNDEATH — the model, ratified 2026-08-24

**Erik, across one session, built this from the Death audit. ⛔ IT IS NOT A TRADITION. It is a POPULATION —
what exists after four hundred years of raising practised at industrial scale in the Palelands.**

⚠️ **Almost none of it needed new machinery.** The retrieval ladder, `absorb`, `contributionsOf`,
`ordered_nanite` maintenance and the `decay` damage type were all already built. **This section records what
they mean together.**

### 48.1 ⛔ UNDEATH IS A POWER PUT INTO A VESSEL. PERSONHOOD AND EMBODIMENT ARE SEPARATE QUESTIONS.

> Erik: *"undeath puts power into the body WITH OR WITHOUT A PERSON RETURNING — and sometimes WITH OR
> WITHOUT A BODY."*

|  | **a person is present** | **no person** |
|---|---|---|
| **body** | **THE RETURNED** — retrieved shallow; who they were, minus what the dark kept | the set crew (tool) → the driven (purpose) → ⛔ **AFTERLINGS** |
| **no body** | what `ask_the_dead` speaks to — *"a person, tired, being asked one more question"* | ⛔ **UNCLAIMED: power with no vessel and nobody in it** |

⚠️ **THE BOTTOM-RIGHT IS UNAUTHORED AND IS THE MOST INTERESTING CELL.** Not a ghost — **a PLACE that is
undead, a working that keeps working.** ⛔ `grey_road` already gestures at it: *"fitting the space that the
dead have already shaped."*

### 48.2 ⛔ THE BODY IS A COCOON, NOT A CORPSE

> Erik: *"the undead body is like a COCOON for the undead spirit or energy — as it wears, THE ENTITY GETS
> STRONGER AND MORE CAPABLE. In between IT CAN LASH OUT FROM THE BODY."*

⛔ **WEARING-DOWN IS GESTATION, NOT DECAY.** ⚠️ **I first modelled it as "how much person is left" and Erik
inverted it: the body is the SHELL THE THING INSIDE IS OUTGROWING.** **This is why `driven_shade` r3 is
*harder to stop* the longer it has walked — authored as flavour, and it is the mechanism.**

| phase | shell | occupant |
|---|---|---|
| **set** | intact | dormant, or nothing yet |
| ⛔ **BREACHING** | wearing, thinning | ⛔ **growing — AND IT CAN STRIKE FROM INSIDE** |
| **emerged** | spent or shed | strong, capable, uncontained |

⚠️ **"LASH OUT FROM THE BODY" IS A DISTINCT ATTACK SHAPE AND SHOULD BE BUILT AS ONE:** it comes not from
reach or limbs but **from inside the shell — past armour, past position, from a thing you have not met.**
⛔ **The corpse is the delivery system and it is not the threat.**

### 48.3 ⛔ TWO END STATES. THE NARROWING IS NOT THE DEFAULT.

> Erik: *"purpose-driven is the NARROWING END CASE where undead become UNMINDED PURPOSE. Those are very
> dangerous. But there are MORE STABLE FORMS THAT HAVE FULL PERSONALITY."*

| | ⛔ **NARROWING** | ⛔ **STABLE — "AFTERLINGS"** |
|---|---|---|
| what emerges | unminded purpose; everything that was not the errand is gone | a whole personality |
| how | a `driven_shade` at its end — four hundred miles of one thought | ⚠️ **not ruled** |
| danger | ⛔ **cannot be reasoned with — nothing left to reason WITH** | can be talked to, hired, married, wronged |

⚠️ **IF EVERY UNDEAD ENDED AS UNMINDED PURPOSE THE PALELANDS WOULD BE A HORROR SET.** ⛔ **The stable forms
are what make it a place people LIVE** — cold, tireless, not healing, working the dykes because they always
did.

**⚠️ WHAT DECIDES WHICH IS NOT RULED.** Candidates: the depth raised from · whether they were GIVEN a
purpose or merely set · whether anyone attended them · whether a name was kept (`names_of_the_lost`).

### 48.4 THE ATTRIBUTES OF UNDEATH — derived from what the crafts already claim

**Does not tire** (`raised_hand`) · **does not heal** (`calling_back`: *"comes back exactly as hurt as it
went down"*) · **does not need** food, water, air, sleep · **persists past attention** (*"the Palelands are
full of crews nobody remembers setting"*) · **wears rather than ages** · **answers to `decay`** ·
⛔ **holds a purpose better than a self** · ⛔ **reads as INVERTED life, not as absence** (§48.6).

### 48.5 ⛔ HEALING HARMS THE UNDEAD

> Erik: *"straight healing applied to an undead is like straight necrotic to the living."*

⚠️ **HALF OF THIS IS ALREADY BUILT.** `skill_battle_system.json` carries affinities `immune · resist ·
vulnerable · ABSORB`, and its note reads: ***"ABSORB reports a NEGATIVE damage amount — the blow HEALS its
target."*** ⛔ **BUT `decay: absorb` IS NOT AN UNDEAD TRAIT AND MUST NOT BE AUTHORED AS ONE.** ⚠️ **Erik 2026-08-24:
*"not all undead would absorb Wither — just the ones who would be STRONGER WITHOUT THE COCOON, or the ones
who have that aura/ability."***

⛔ **SO `absorb` IS §48.8's *FREED* OUTCOME WRITTEN AS ARITHMETIC**, and the split falls out of the cocoon
phases:

| phase | decay affinity | why |
|---|---|---|
| **set** · **breaching** | ⚠️ **normal, or VULNERABLE** | ⛔ **rotting the shell is destroying the thing** |
| ⛔ **emerged / near-emergence** | ⛔ **`absorb`** | **the cocoon was the last thing holding it in** |
| **an authored aura** | `absorb` | a specific creature's own trait, authored per sheet |

⚠️ **MOST UNDEAD ARE HURT BY WITHER. THE ONES CLOSE TO COMING OUT ARE HELPED BY IT** — and a warden cannot
tell which is which by looking, which is the whole tension of §48.8.

⛔ **THE INVERSE IS NOT BUILT.** Affinity applies to damage types and healing is not one. **Needed: `heal`
applied to an undead delivers its magnitude as `decay`.** ⚠️ **A cleric mercy-healing an Afterling burns
it, and does not learn that until it is done.**

### 48.6 ⛔ DEATHSENSE IS THE UNDEAD DETECTOR

> Erik: *"Deathsense would read the NEGATIVE LIFE POWER — it would make a great undead detector."*

⚠️ **ITS CURRENT `cannot` FORBIDS EXACTLY THIS** — *"reads the living and the dying, not the already-dead.
A corpse has nothing left to sense."* ⛔ **TRUE OF A CORPSE. AN UNDEAD HAS THE OPPOSITE OF NOTHING.**

**Revision owed: Deathsense reads life — positive in the living, FALLING in the dying, ⛔ INVERTED in the
undead.** ⚠️ **A warden walks into a room and knows who in it is not alive, without asking and without
being subtle — which against a stable Afterling is a SOCIAL problem, not a tactical one.**

### 48.7 ⛔ RAISING GETS HARDER EACH TIME, AND THAT IS WHY THE OLD HEROES ARE UNDEAD

> Erik: *"I don't agree with cannot be raised twice — however there should be a DIFFICULTY THAT INCREASES
> PER TIME… which is probably a good reason why after a long time SOME HEROES BECOME UNDEAD: it's too hard
> to raise them back to living, but they CAN CONTINUE IN UNDEATH."*

⛔ **"CANNOT BE RAISED TWICE" WAS MY PROPOSAL AND IT IS WITHDRAWN — A WALL WHERE A CURVE BELONGS**
(§47.14, fourth instance).

| | to LIVING (`retrieve`) | to UNDEATH (`raise`) |
|---|---|---|
| per prior raising | ⛔ rises steeply | gently |
| per depth and elapsed time | ⛔ rises steeply | gently |
| **consequence** | ⛔ **eventually impossible** | **still available** |

⚠️ **A hero four centuries dead cannot be made alive and CAN be made to continue.** ⛔ **The oldest and most
storied undead in the world are the people nobody could afford to bring back properly. Each is somebody's
failure and somebody's mercy.**

### 48.8 ⛔ WITHER DESTROYS THE COCOON — AND MAY FREE WHAT IS IN IT

> Erik: *"using Wither on an undead destroys the body, leaving a spirit that is not ready to exist outside
> it — either destroyed or very vulnerable… but FOR SOME SPIRITS IT MIGHT BE FREEING."*

**Three outcomes from one act, ⛔ AND THE WARDEN DOES NOT CHOOSE WHICH** — it follows the cocoon phase:

- **set** → ⛔ **DESTROYED.** Nothing was far enough along. *This is what a warden usually intends.*
- **breaching** → ⚠️ **VULNERABLE.** Something is there, out early, exposed. **A window to finish it — or save it.**
- **emerged** → ⛔ **FREED. The cocoon was the last thing holding it in.**

⚠️ **SO THE CRAFT MEANT TO UN-MAKE UNDEAD IS HOW AN AFTERLING IS BORN, AND A WARDEN WHO DID NOT KNOW THAT
HAS MADE ONE.** ⛔ **It is an Ashwarden craft un-making another Ashwarden's work, with a failure mode that
creates the thing it was aimed at.**

### 48.9 MAINTENANCE, NOT MEDICINE

> Erik: *"we need a way to heal undead — by MAINTENANCE for the body, or OTHER POWERS for the spirit."*

- ⛔ **THE BODY: MAINTENANCE.** ⚠️ **`kept_vigil` is already `ordered_nanite` — the same structured nanite
  behind Seraphic agelessness — and already holds a failing thing at its state.** **It is the closest craft
  in the game to undead repair and was not written for it.**
- ⛔ **THE SPIRIT: NOT DEATH'S WORK.** ⚠️ **Spirit, and the gap is deliberate. A cocoon whose SHELL is sound
  and whose OCCUPANT is damaged is a problem no Ashwarden craft addresses.**

### 48.10 WHAT THIS OWES, AND TO WHOM

| owed | to |
|---|---|
| `heal` → `decay` on undead | ⛔ CCode — not built |
| the lash-out attack shape | ⛔ CCode — not built |
| divergent raise/retrieve difficulty curves | CCode — `death.js` has the ladder, not the curves |
| Deathsense `cannot` revision (§48.6) | ⚠️ Aevi — the craft is already audited; revisit |
| `wither` cocoon-phase outcomes | ⚠️ Aevi — next in the Death walkthrough |
| ⛔ **what decides narrowing vs stable** | ⛔ **ERIK — unruled, and it is the load-bearing one** |
| the empty cell: undeath with no vessel and no person | ⛔ **ERIK** |
| Spirit intertwining | ⛔ **ERIK — and Spirit is unaudited; do not settle either alone** |

---

## 49. ⛔ THE DEATH WALKTHROUGH, FINISHED — what 33 crafts taught, 2026-08-24

**§47 was written after 13 crafts. This is the rest, and the lessons changed shape once the tradition was
whole.**

### 49.1 ⛔ THE ONE QUESTION THAT FOUND EVERYTHING: "WHAT DOES THIS DO?"

**Erik asked it of `shared_weight`, and later — after I had stopped asking — of `last_lament`:**
*"You're starting to forget the questions. WHAT DOES THIS DO?"*

⛔ **SIX CRAFTS OF 33 WERE REBUILT RATHER THAN TIDIED, AND EVERY ONE WAS FOUND BY THAT QUESTION:**

| craft | what it did | what it does now |
|---|---|---|
| `shared_weight` | ⛔ lifted a condition the engine never applied | **intercepts conditions aimed at an ally** |
| `wellspring` | a mood | **bolsters energy, resist and willingness** |
| `shared_grief` → `under_song` | carried grief | **hears the feeling under the shown one** |
| `true_account` | a third reading craft | ⛔ **Death's `bargain`** |
| ⛔ `last_lament` | ⛔ **NOTHING — an L5 capstone costing everything** | **clears every imposed condition in scope** |
| `made_elegy` | made a keepsake | **a gift, a curse, or a monument** |

⚠️ **THE DEFECT IS INVISIBLE TO EVERY GATE.** These crafts were well-formed, in-band, correctly typed, and
did nothing. ⛔ **A LINT CANNOT FIND A MOOD.**

### 49.2 ⛔ THREE FAILURES THAT PASS A "DOES IT SOUND RIGHT" CHECK

**Erik caught all three in one craft, and they are distinct:**

1. ⛔ **THE CRAFT DOES NOTHING** — `last_lament`, above.
2. ⛔ **A TAUTOLOGY WITH THE GRAMMAR OF A LIMIT** — *"arriving at the source of a great feeling means
   arriving at its source."* ⚠️ **It cannot fail the "does it stop something?" test because it has no
   content to test.** **The sharper question is: WHAT DOES A GM DO DIFFERENTLY ON READING THIS?**
3. ⛔ **A RANK THAT ADDS WHAT THE RANK BELOW ALREADY HAD** — Feeling-Sense r3 gained "walk the trail" when
   r2 already tracked across ground.

### 49.3 ⛔ I DUPLICATED THREE TIMES, ALWAYS ONTO MY OWN RECENT WORK

**`pathos` r1 was `under_song` verbatim. `made_elegy` r2 collapsed into r1. Feeling-Sense r3 was
`true_account`'s named edge.** ⚠️ **Every one reached for a mechanic I had authored HOURS EARLIER.**

⛔ **THE CHECK: BEFORE AUTHORING A RANK'S BENEFIT, NAME WHICH CRAFT ALREADY PROVIDES IT.** ⚠️ **Recency is
the risk, not distance — the crafts I had just written were the ones I copied.**

### 49.4 ⛔ AND I INVENTED VOCABULARY WHILE CORRECTING INVENTED VOCABULARY

**`questions` and `access` — two `gainAxes` outside the nine — were authored BY ME during this walkthrough,
in the same pass where I was fixing `kinds`, `precision`, `fear` and `upkeepRelief`.**

⚠️ **KNOWING THE RULE DID NOT MAKE ME RUN IT.** ⛔ **This is why the lint exists and why it must run per
tradition BEFORE the per-craft pass, not after.**

### 49.5 ⚠️ WHAT THE PER-CRAFT PASS IS ACTUALLY FOR

**The lint found 33 mechanical defects across Death. ⛔ IT FOUND NONE OF THE SIX REBUILDS, NONE OF THE THREE
DUPLICATIONS, AND NEITHER TAUTOLOGY.**

**So the division of labour is now measured, not assumed:**
- ⛔ **LINT** — vocabulary, bands, rung inversions, empty fields, shape. **Run it first, per tradition.**
- ⛔ **THE HUMAN PASS** — *does this do anything · does the rank add anything · does another craft already
  do it · is the colour the right subject.* ⚠️ **None of these is machine-detectable and all four produced
  the session's real work.**

### 49.6 DEATH'S FINAL SHAPE

**33 crafts · 25 of 27 verbs · absent: `deceive` and `travel`, both correctly** — Death's two obscures work
by TELLING THE TRUTH (`soul_stare`, `public_grief`), and its movement craft is INFILTRATION rather than
travel (`grey_road`). ⛔ **Both absences are characterisation, not gaps.**

**Gained in the pass:** a damage type (`vitality`), a craft (`driven_shade`), an obscure (`public_grief`),
a shape (`retrieval`), and §48's whole undeath model. **Lost:** one duplicate (`feeling_road`).
