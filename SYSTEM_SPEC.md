# SINGULARITY — System Specification v2.0

| | |
|---|---|
| **Status** | `round-2-complete + BATCH-11 build` — Aevi (PO) authored the DESIGN + CONTRACT layers; CCode ROUND 2 (v1.8.26) substrate-verified every claim; **BATCH-11 (v1.8.105–108, 2026-07-18) added Law 16 + §23 (the Wiring Contract, machine-gated), SNG-145 intent gates (§11), SNG-148 waygates (§9), the 146a–c/f multiplayer fixes (§18), and 147a/d skill-integrity (ratcheted in `npm test`).** |
| **Supersedes** | System Specification v1.0 (which predates the great circle, traditions, domains, the generative world, shared canon, and ~20 of the 38 engine modules) |
| **HEAD verified** | BATCH-11 at **v1.8.105** · confirmed against origin: 55 engine modules · 30 core rules files · 96 locations / 25 regions · 285 abilities / 24 traditions (+3 folk) · 44 combinations · 41 NPCs · 9 companions · 58 random-encounter entries. **Count freshness is now machine-gated** — `tests/wiring_audit.mjs` fails the build when this line drifts from HEAD (the 38/137-era drift, found by BATCH-11 §0, must not recur silently). |
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
| `gambit.js` | Declared multi-step plans (assess → ordered execute → reroll/fallback). **API** `parseGambitSteps, assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM`. **NEVER** rolls its own resolution — every step routes through `resolve.js`. |
| `intensity.js` | Conserve/standard/surge scaling + surge-only backlash. **API** `intensityStep, scaledEnergy, effectMod, autoIntensity, surgeBacklash, shouldBacklash, applySurgeBacklash, intensityOptions`. **NEVER** auto-surges — surge is deliberate. |
| `encounters.js` | Typed multi-round structures (duel/challenge/puzzle) + receipt→state. **API** `startEncounter, encounterDifficulty, duelRound, challengeStage, puzzleAttempt, applyEncounterOps, encounterReceiptForGM, lethalOfferClamp`. **NEVER** rolls the d100 or imposes death (incapacitation only). |
| `random_encounters.js` | Whether/which flavored encounter fires (danger+tag weighted). **API** `dangerOf, isEligible, rollTrigger, pickEncounter, synthesizeDuelDef, synthesizeChallengeDef, buildOffer, canIncapacitate`. **NEVER** resolves an action — reuses `resolve`/`encounters` (its `rng` only picks which/whether). |
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
| `worldmap.js` | Deterministic map layout (auto-position, icon/terrain tint, KG overlay). **API** `autoMapPositions, coordForGenerated, iconForTags, terrainClass, kgOverlayEntities`. **NEVER** touches the DOM or uses `rng`. |
| `worldtick.js` | Offscreen advancement (event stages, news spread, NPC evolution, shared-canon sync). **API** `initWorldState, buildRegionView, effectiveLocation, runWorldTick, syncSharedWorld, syncSharedCanon, advanceGeneratedOffscreen, takeUnseenNews, newsForGM`. **NEVER** runs unless in-game days have passed since the last tick. |
| `legends.js` | The world's great figures — tiers, rarity governors, dramatic-beat surfacing. **API** `tierBirthWeight, loadLegends, tierForArc, legendSurfacing, legendDeploymentForGM`. **NEVER** narrates the appearance — engine detects/governs, GM narrates. |
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
| `namematch.js` | The shared name-resolution primitive (normalize + conservative fuzzy). **API** `normName, namesMatch, resolveByName`. **NEVER** takes a dependency — kept dep-free to break the codex↔quests import cycle. |
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
| `art.js` | The image pipeline (assemble → rating/minor floors → URL → persist-once → gallery). **API** `getArtMode, setArtMode, locationImage, sceneImage, itemImage, npcImage, sanitizeImagePrompt, assembleImagePrompt, imageURLFor, ensureImage, ensureGallery, addGalleryImage`. **NEVER** bypasses the floors, or re-assembles a record born with an image. |
| `claude.js` | Anthropic transport + task→model routing (`MODEL_MAP`) + loose-JSON parse. **API** `getApiKey, setApiKey, callClaude, parseLooseJSON, callClaudeJSON`. **NEVER** puts the API key in a committed file — localStorage only. |

*Cross-cutting note:* `slugify` is exported from `quests.js` but imported by `progression.js`/`codex.js`/`npcs.js` — an odd home for a shared helper (same smell that justified extracting `namematch.js`); flagged as debt (§22).

---

## 4. Character & Resolution (the numbers)

- **Sub-attributes (8):** strength/agility · reason/insight · presence/rapport · craft/wits. Creation: 12 points across 4 parents (1–4) + 2 specialise points. Cap 20.
- **Chance** = attr contribution + skill×10 + abilityRank×5 + spectrum fit (alignment×15 + location×10, clamped ±25) + equipment (**best matching item only**, cap 10 — §15) + companion (+5/relevant, cap 10) + aptitude mods − difficulty (0/15/30) − exhaustion (−10 at 0 energy) − **novel surcharge (−15)** *or* **+ discovery bonus (+20)** − **substratePenalty (§9b, ability actions only — 0 if within band or no ability)**. **Clamped 5–95.**
  - **Attr contribution: ×20/point through soft cap 4, +5/point beyond** — mastery buys power against hard rolls without trivialising easy ones.
  - **Novel vs discovery is a REPLACEMENT, not a stack.** The same action that cost −15 to improvise pays **+20** once it is a known discovery: a 35-point swing. *Reaching past what you know is dangerous; surviving it and repeating it makes it yours.*
  - **⚠️ OPEN BALANCE Q (Erik, parked for sensitivity testing):** at +20 a discovered technique ceilings out on most builds. Intended, or tune to +12–15?
- **d100 degrees:** crit ≤5 · success ≤chance · partial ≤chance+15 · failure · crit-fail ≥96 (novel widens by 3).
- **Trivial actions** (GM-marked or parser-detected; never ability/novel): no roll, no energy, no XP.
- **Sense tiers** by attunement (0/2/5/9): nothing → vibes → 5 bands → ~numeric. +1 tier if location matches alignment; Strategist +1 on planned.
- **XP** (engine-paid, per rolled action): crit 8 / success 5 / partial 3 / failure 2 / crit-fail 2, **+8 novel** (`xp.novelBonus`). **Gambits 12/10/3 + completion bonus 10.** Quest completion: **structured quests award the outcome's `xp` effect (default 30, clamped 0–60); freeform GM-proposed completion clamps 0–25** (§14, §11). *(⚠️ ROUND-2 CORRECTION: v2.0 draft said "+3 novel" — HEAD `resolution.json → xp.novelBonus` is **8**.)*
- **Level:** `xp ≥ level×100` → +1 attunement, +5 reserves, +1 banked sub-point, +1 skill point.
- **Energy `[CCODE: recovery curve]`:** max **100**; default action cost **5**; each ability carries an `energyCost` (minted clamped 4–15, discounted −1 per two character levels and −1 per rank, floored at ⌈½·base⌉). 0 energy = **−10 exhaustion, not a hard stop.** **Recovery is ACTIVE, never passive — advancing the clock alone restores nothing:**
  - **Rest** (`rest()`): a **breather** = +10 energy / +1 health / 1h; **sleep** = +40 energy / +3 health / 8h. Flat add, clamped to max.
  - **Meditation** (engine-owned, action-driven): a `meditate`-tagged action on a crit/success/partial gains `10 + 2×attunement` (halved on partial).
  - **Consumables / GM deltas:** item `effects.energy` (clamped ±10–25); GM `characterDeltas.energy` (clamped −20…+40); encounter-round energy deltas.
  - *Substrate note:* `energy.regenPerRest: 40` in `resolution.json` is a **dead/legacy key** — the code reads `recovery.sleep.energy` (also 40). There is **no per-turn or time-based regen** anywhere.

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
2. **Regional calibration holds** — the mean of a region's locations stays close to its authored value.
   The authored table is the calibration target, not a value to be overwritten.
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
- **`newEncounter` stashes but never activates** — it lands in `customEncounters` and goes live only if a later choice carries its id. The contract reads as "invent a duel"; the effect is "offer one later." Easy GM misread.
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
