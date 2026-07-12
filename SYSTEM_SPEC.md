# SINGULARITY — System Specification v2.0

| | |
|---|---|
| **Status** | `round-2-complete` — Aevi (PO) authored the DESIGN + CONTRACT layers; **CCode performed ROUND 2 (v1.8.26): every claim substrate-verified against HEAD, all `[CCODE]` markers filled, corrections marked ⚠️ inline.** Ready for Aevi to review the corrections and promote. |
| **Supersedes** | System Specification v1.0 (which predates the great circle, traditions, domains, the generative world, shared canon, and ~20 of the 38 engine modules) |
| **HEAD verified** | Round-2 at **v1.8.26** · confirmed against origin: 38 engine modules · 18 core rules files · 92 locations / 24 regions · 137 abilities / 24 traditions (+3 folk) · 44 combinations · 41 NPCs · 9 companions · 58 random-encounter entries. *(All authoring-header counts confirmed correct.)* |
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

**Module map** — all 38 engine modules, verified against exports at HEAD (ROUND 2). Format: **OWNS · API (public exports) · NEVER (the load-bearing invariant).** `app.js` is not in this table — it is all UI + the `applyTurn` op-dispatch loop (§11).

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
- **Chance** = attr contribution + skill×10 + abilityRank×5 + spectrum fit (alignment×15 + location×10, clamped ±25) + equipment (**best matching item only**, cap 10 — §15) + companion (+5/relevant, cap 10) + aptitude mods − difficulty (0/15/30) − exhaustion (−10 at 0 energy) − **novel surcharge (−15)** *or* **+ discovery bonus (+20)**. **Clamped 5–95.**
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
  | `ledgerEvents[]` | `appendLedger` | only when `syncEnabled()` |
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

---

*Aevi owns this document. **ROUND 2 done by CCode at v1.8.26:** every `[CCODE]` marker filled from origin, every checkable claim substrate-verified, corrections marked ⚠️ inline. **Where the draft was wrong (for Aevi to promote or amend):*** (1) **§4 XP "+3 novel" → actual `novelBonus` is 8.** (2) **§9 drift — the design implies a place's disposition pulls the character's spectrum over time; it does not.** Character drift comes only from the *action's* axes (EWMA 95/5 + precursor +0.05/use); location affinity is a per-roll bonus with no write-back; there is no decay routine. (3) **§11 op list — `item ops` and `stateOps` do not exist at HEAD** (items ride `characterDeltas.inventoryAdd/Remove`; `stateOps` is unbuilt); `relationshipDeltas`/`timeAdvanceHours` are live-but-legacy and off-contract. (4) **§3 conflated `canon.js` and `sync.js`** into one row — they are separate modules (now split, all 38 mapped). Everything else in the draft verified TRUE against origin — including all of §5's ring order, §4's resolution/energy/recovery numbers, §6's access table, and every count in the header.*
