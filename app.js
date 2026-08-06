// app.js — Singularity v0.1 shell: character creation, the play loop, settings.
// Engine does the math (resolve/sense/reputation/profile); GM model does the words.

import { loadContent, loreForLocation, eventsForGM, getPlayerKey, setPlayerKey, hasChosenPlayer, listPlayers, listCharacters, saveCharacter, loadCharacter, deleteCharacter, saveProfile, loadProfile, exportSave, importSave, adoptRemoteCharacter, preserveRecovery, dedupePlayers, findProfileByName, resolveLocationId, canTravelBetween, locationRefToString, isCoercedObjectName } from "./engine/state.js";
import { resolveAction, successChance, applyEnergyCost } from "./engine/resolve.js";
import { senseAction, senseTier, senseOpponent, appraiseOpponent } from "./engine/sense.js"; // CCODE-44: size a fight up BEFORE taking it
import { synthesizeOpponentSheet, synthesizeStaticSheet, estimateExchange, finisherPotential, finishOdds, hasCounterCraft, matchupBonus, phaseDenied } from "./engine/skill_battle.js"; // CCODE-46/42: priced moves + situational finisher odds
import { recordDeed, standingWith, reputationSummary } from "./engine/reputation.js";
import { seedStandingAtCreation, accrueStandingForDays, applyStandingOps, standingRoster } from "./engine/standing.js"; // BATCH-12 §3
import { majorDeeds, majorStateHash, chronicleIsStale, buildChroniclePrompt, touchSession, endSession, sessionLog, buildSessionPrompt, authorshipStats, crossCharacterAuthorship } from "./engine/chronicle.js";
import { newProfile, updateProfile, aptitudeMods, profileInsight, grantAptitudes, fadingAptitudes, ensureCharacterStyle, ensureRating, ratingCeiling, ratingLevel, isMinorProfile, canSetRating, setRating, setMinorFlag, revokeAdultGate, RATING_ORDER, RATING_LEVEL } from "./engine/playerprofile.js";
import { gmTurn, reNarrateRich, parseIntent, gmAsk, generateBio, suggestBuild, suggestNextCrafts, extractGambit, sanitizeScene, narrativeRegister, ratingRegister, bluntnessDirective, SALVAGEABLE_OPS } from "./engine/gm.js";
import { namesToAvoid } from "./engine/namematch.js";
import { affiliationOf, regionHomeTradition, buildPeopleVocab } from "./engine/affiliation.js"; // SNG-185
import { applyQuestUpdates, questsForGM, isRealQuest, startStructuredQuest, completeQuestStage, resolveStructuredQuest, availableStructuredQuests, routesForCharacter, structuredQuestsForGM, slugify, advanceStructuredQuest } from "./engine/quests.js";
import { applyStateOps, describeCorrection, detectAnomalies, anomaliesForGM } from "./engine/corrections.js";
import { applyAuthorOps, AUTHOR_OPS } from "./engine/authormode.js"; // SNG-207b: the author god-mode (dev-gated, separate surface)
import { getApiKey, setApiKey, callClaude, callClaudeJSON, parseLooseJSON, setCallObserver, MODELS } from "./engine/claude.js";
import { armDevCapture, recordCall, annotateLatest, devCaptures, clearCaptures, recordCombatRound, combatRounds } from "./engine/devcapture.js"; // SNG-186 §2f: see the machine
import { unearnedDepth, generate, ensureGenerated, generatedRecords, recordAttention, livingWorldForGM, isSurfaceable, findGenerated, nominationsFor, effectiveWeight, NOMINATE_AT, buildBraidPrompt, validateBraidAuthored } from "./engine/generate.js";
import { checkBorn, describeBorn, contractedTypes } from "./engine/borncontract.js";
import { drawAxis, resolvePick, readOfPick, championPick, drawBackgroundAxis } from "./engine/coliseum.js"; // SNG-149: the Coliseum blind grid
import { critFor } from "./engine/craftmechanics.js"; // CCODE-76: a craft's own critical, in its own words
import { receiptLine, roundVerdict } from "./engine/roundreceipt.js"; // the round receipt, extracted so it can be simulated (it shipped a permanent "it's even" because nothing could test it)   // SNG-250 §4: the born-whole gate + which types it covers
import { mintableBraidsFor, buildBraidDef, mintBraid, braidKey, registerDiscoveryAbility } from "./engine/braids.js"; // SNG-197 p2: in-play braid mint + the moment; SNG-226: a discovery becomes a usable craft
import { ensureRecipeStore, buildRecipeRecord, recipeFor, recipeToAuthored, mergeRecipes, firstFinderName } from "./engine/recipes.js"; // SNG-201: shared braid recipes
import { braidPlacement, compositionAngle, leanOffset } from "./engine/wheelgeom.js"; // SNG-202: place a craft on the wheel by its composition
import { syncEnabled, getSyncConfig, setSyncConfig, backupSaves, appendLedger, fetchRemoteCharacter, resolveSaveConflict, pushMergedFile, ghList, fetchRepoJSON, raceTimeout } from "./engine/sync.js";
import { buildFeedPost, appendFeedPost, feedForViewer, FEED_PATH } from "./engine/feed.js"; // SNG-168 §2: the world feed (post a turn to the family — never canon)
import { wieldBonusFor, usableCombatItems, normalizeInventory, fromCatalog, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM, nameItem, displayName, itemUses, ensurePins, togglePin, pinnedItems, applyItemUpdates, deriveItem, findItem } from "./engine/inventory.js";
import { grantCeiling, evolutionBudget, recordEvolution, foldGrants, canDerive } from "./engine/earnedpower.js"; // SNG-251 §2c/§4: the earned-power economy (ceiling = f(level, craft rank); ~1 evolution/day)
import { newClock, readClock, advanceClock, getTimeSettings, setTimeSettings, ADVANCE, TIME_MODES, absoluteWorldDay, worldCount, worldDate, relativeWorldDays, getWorldEpoch, setWorldEpoch } from "./engine/worldtime.js";
import { smartClamp } from "./engine/namematch.js"; // SNG-095: used at app.js:562 (GM context) + the gambit advise clamp — was never imported
import { substrateVerdict, locationDensity, carriedSubstrate, carriedSubstrateSources, schoolForTradition, defaultSchoolsForDomains, setCharacterSchool, commonGroundFor, groundAsPlace } from "./engine/substrate.js"; // SNG-090 + BATCH-13 + SNG-193b + SNG-192 §6b
import { locationImage, sceneImage, itemImage, npcImage, getArtMode, setArtMode, ART_MODES, imagesEnabled, ensureImage, ensureGallery, addGalleryImage, deleteGalleryImage, npcPromptSeed, galleryCategory } from "./engine/art.js";
import { walkingDays, autoMapPositions, coordForGenerated, iconForTags, terrainClass, kgOverlayEntities, regionShape, knownOverlay, isPlaceKnown, worldTierNodes, regionTierNodes, locationTierNodes, interiorLayout } from "./engine/worldmap.js";
import { legendSurfacing, legendDeploymentForGM } from "./engine/legends.js";
import { traditionOf, isFolkTradition, ringDistance, antipodeOf, neighborsOf, ringOrder, domainAccess, inferDomains, crystallizeDomains, reconcileStartingAbilities, isKinAdjacent, kinSecondaryOptions, domainsLegal } from "./engine/traditions.js";
import { companionBonus, companionsForGM, activeCompanions, ensureBonds, bondOf, growBond, partnerAdjacentNpcs, companionCodexUpdate, noteCompanionWitnessed } from "./engine/companions.js";
// SNG-309: what happens when the player goes down — and the SAME death ladder every figure is on.
import { incapacitationOutcome, playerDeathState, deathStopsPlay, deathLine, wireDeathModel } from "./engine/incapacitation.js";
import * as DeathModel from "./engine/death.js";
import { enterDeathState } from "./engine/death.js";
// ⚠️ ONE OWNER OF "HOW DEEP IS THIS DEATH". `incapacitation.js` asks `death.js` rather than keeping a
// second copy of the clock — the injury model, the tier ladder and the arc-stage lookup have each been
// duplicated in this codebase, and each time the copies drifted before anyone noticed.
wireDeathModel(DeathModel);
import { ensureCompany, companyRoster, recruit, partCompany, isRecruitable, offeredRoles, trainerFor, liaisonFactions, roleBadges, teacherOfferReady } from "./engine/company.js";
import { buildFunctionIndex, familiesOfAbility, functionCoverage, recommendSkills, suggestForCreation, archetypeFamilies, FAMILY_GLYPH, FAMILY_COLOR, FUNCTION_FAMILIES, FAMILY_SHAPE, shapeOfFamily, familyClass } from "./engine/functions.js";
import { toolkitForGM } from "./engine/toolkit.js";
import { fallbackPersonalArc, buildPersonalArcPrompt, sanitizePersonalArc } from "./engine/personalArc.js";
import { assembleGMContext } from "./engine/gm_registry.js"; // BATCH-11 §23: the GM context is a DECLARED registry, iterated — never hand-listed
import { rankVoices, pickVoice, speakableText, chunkForSpeech, renderProseHtml } from "./engine/narration_voice.js"; // SNG-155: read aloud at the table; SNG-190 §4: render engine asides, never raw asterisks
import { harmGateFor, harmTargetFor, departureGateFor, isSpeechAct, personDestination, sanitizeOfferIntent, intentNoteFor, splitLedgerEvents } from "./engine/intent.js"; // SNG-145: intent confirmation for costly acts (Law 9 in the play loop); SNG-188: speech-act guard; SNG-228: person-as-place guard
import { resolveWaygateTransit, routeGmMoveTo, isNetworkGate, networkGatesFrom, gateHopCost } from "./engine/waygate.js"; // SNG-148: waygates — map control routes named/hub; GM offer via the registry row. SNG-243 §4: the gate network
import { skillDetail, npcDetail, itemDetail, relationshipsParagraph } from "./engine/entityDetail.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, mergeDuplicateNpcs, relationshipBand, relationshipLabel, knownPeopleAt, setNpcName, nameIsUnknown, npcPortraitTier, backfillNpcGender, reconcileGeneratedNpcWithMeet, npcFearsForGM, npcReactionsForGM } from "./engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM, findSubPlaceParent } from "./engine/places.js";
import { activeArcEffects, craftCostNote, encounterBias, effectsInPlainWords, npcMoodLines, travelCostFactor } from "./engine/arceffects.js";   // SNG-273: an advanced arc is something you FEEL
import { knownIndex, whoIs } from "./engine/whois.js";   // SNG-299: who is that, and where do I read more
import { worldTabHtml } from "./engine/worldtab.js";   // SNG-276: the tab's markup, testable
import { initWorldState, runWorldTick, runGenerationTurn, syncSharedWorld, advanceGeneratedOffscreen, worldTickABCompare, syncSharedCanon, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM, worldArcsPublic, arcPeopleView, worldPeopleFooter, arcStageNow } from "./engine/worldtick.js";
import { runWakeGeneration } from "./engine/wake.js"; // SNG-204 Phase 2: open wakes generate the next thread
import { addAssignment } from "./engine/assignments.js"; // SNG-191 §4: the world honours delegated work
import { setArcFate } from "./engine/latentarcs.js"; // SNG-191 §7: the player closing a surfaced arc (the handled/resolved fate)
import { parseGambitSteps, assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "./engine/gambit.js";
import { SUBS, SUB_OF, SUB_DESC, ensureSubAttributes, syncParentAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, canLearnAbility, knownDiscovery, recordDiscovery, applyBacklash, abilitiesForGM, retroLevelGrants, retroNativeGrants, applyNativeGrants, nativeGrantIdsFor, seedInnateSubstrate, effectiveEnergyCost, effectiveLevelReq, sanitizeNewAbility, applyNewAbility, autoAdvancePracticedRanks, markDefiningMoment, promotionEligible, promote, acquirable, acquireDomain, recoveryEnergy } from "./engine/progression.js";
import { ensureCodex, applyCodexUpdates, codexForGM, searchCodex, mergeInto, mergeCodexTopics, suggestMerges, markNotSame, buildMergeAdjudicationPrompt, applyMergeVerdicts, mergeDigest, undoLastMerge } from "./engine/codex.js";
import { reconcile, topReconcileVersion } from "./engine/reconcile.js";
import { ensurePractice, recordUse, declareAspiration, dropAspiration, recordAspirationProgress, aspirationRipe, practiceRankReady, ripeCombos, ripeBranches, emergenceNoticeForGM, acceptCombo, acceptBranch, validEmergenceId } from "./engine/practice.js";
import { needsBackfill, runBackfill, summaryLines } from "./engine/backfill.js";
import { ensureFacts, applyFactUpdates, factsForGM } from "./engine/facts.js";
import { notePerception, perceivedVectors, vectorSummary } from "./engine/vectors.js";
import { isCrossClass, tierOf, classColor, classLabel, gateFor, meetsLearnGate, meetsRank3Gate, breadthUsed, breadthCap, atCapacity, skillGraphModel, skillPointCost, learnPointCost, forkPending, forkPaths, chosenFork, setFork, rankExpression } from "./engine/skilltree.js";
import { newSharedScene, addMember, removeMember, isMyTurn, mergeBeat, setEncounterState, partyBlockForGM, fetchScene, listScenesAt, pushSceneWithMerge, scenePath, lastSceneError } from "./engine/party.js";
import { INTENSITIES, scaledEnergy, effectMod, autoIntensity, shouldBacklash, applySurgeBacklash, intensityOptions } from "./engine/intensity.js";
import { noteCoUseAndRefresh, refreshEvolvingItems, evolvedItemsForGM, currentStage } from "./engine/evolution.js";
import { locationAffinity, affinityReceipt } from "./engine/affinities.js";
import { rollTrigger, pickEncounter, buildOffer, rollNarrativeTime, classifyNarrativeKind, canIncapacitate, resolvePacing, beatHours, deriveDangerLevel, eligibleEncountersFor, generatedCreatureEncounters, synthesizeDuelDef, synthesizeChallengeDef, synthesizeStandoffDef, synthesizePuzzleDef } from "./engine/random_encounters.js"; // SNG-225: mint/backfill a real dangerLevel so the encounter pool isn't starved; SNG-231: eligibleEncountersFor = the offerable pool the GM can invite
import { renownScore, bandForRenown, challengersForBand, findPrestigeArc, challengerPoolFor, pickChallenger, challengerToDuelEntry, challengeDeedWeight, challengeLossWeight, shouldFireChallenger, challengeCooldown } from "./engine/recurrence.js";
import { isEventfulTurn, pressureTier, pressureDirective, drivenPressureDirective, roomForAnOffer, roomForATeacherOffer } from "./engine/pacing.js";
import { ensurePressureQueue, enqueuePressure, pullTopPressure, npcWantPressures, threatAttackPressure } from "./engine/pressure.js"; // SNG-245: the pressure queue — the world DRIVES
import { lethalOfferClamp, isLethalEncounter, sanitizeNewEncounter, startEncounter, encounterDifficulty, duelRound, skillBattleRound, challengeStage, puzzleAttempt, puzzleHints, puzzleUnlocks, checkIncapacitation, encounterReceiptForGM, sanitizeEncounterOps, applyEncounterOps } from "./engine/encounters.js";
import { characterPower } from "./engine/threat.js"; // CCODE-52: built power sets the mean the encounter pool revolves around
import { frameModel, frameSize, chaseFromFight, encounterKind, collapseMode, collapseResult, collapseFloor, frameCollapsible, swingDegree, wardAgainst, wardBroken, trivializes, playerReceiptLine, FRAME_FREEFORM_CUE } from "./engine/encounterFrame.js"; // SNG-230: the ENCOUNTER FRAME — obvious kind/win/exits; frameSize routes takeover-vs-banner; chaseFromFight = the chase you flee into (§6a); collapse* = a finisher ends a collapsible foe (§6b/§7a); wardAgainst/wardBroken = a ward FORBIDS a mechanic (§7b); trivializes = the right kit VOIDS a challenge's premise (§7c). SNG-246 Fix D: playerReceiptLine = the mechanical receipt SHOWN to the player

// CCODE-07: MUST match index.html's `?v=` cache stamp — tests/wiring_audit.mjs fails the build on
// drift. It had silently sat at 1.8.104 across five ships, and it is what stamps `appVersion` on
// every feedback report — so bug reports were filed against a version that hadn't been running.
const APP_VERSION = "1.9.41";
const app = document.getElementById("app");
// SNG-084: one delegated listener drives every ⓘ helper dot — it survives chrome() re-renders (those
// replace app's CHILDREN, not app itself). Each dot carries a data-help id into the authored copy.
app.addEventListener("click", e => { const b = e.target.closest?.("[data-help]"); if (b) { e.preventDefault(); showHelp(b.dataset.help); } });

// SNG-219: a Back control reachable WITHOUT scrolling, on every screen that has one — Erik's ask ("lots of
// Back buttons are at the end of content; I'd like some at the top too so I don't scroll all the way down").
// Global by design: ONE persistent bar (a sibling ABOVE #app, so the app.innerHTML screen swaps never wipe
// it) that after each render MIRRORS that screen's own bottom back button — same handler, new location, so
// there is never a second navigation path (GUARD). Bottom buttons stay untouched (pure ADD, per Erik). A
// screen with no back control (the play screen) hides it. Sticky, in-flow — it pushes content, never covers
// it. Screen #21 gets this for free: nothing to wire per screen.
const stickyBack = document.createElement("div");
stickyBack.id = "sticky-back";
stickyBack.hidden = true;
stickyBack.innerHTML = `<button class="btn secondary sticky-back-btn" type="button" aria-label="Back">← Back</button>`;
app.parentNode.insertBefore(stickyBack, app);
const _stickyBackBtn = stickyBack.firstElementChild;
let _stickyBackTarget = null;
_stickyBackBtn.addEventListener("click", () => { try { _stickyBackTarget?.click(); } catch { /* the screen's own handler owns the nav */ } });
/** Mirror the current screen's canonical back/close control into the sticky top bar. Prefers an id ending
 *  in `-back` (the ~18 hand-rendered ones); falls back to a `.secondary` button whose visible text is
 *  Back/Done. Takes the LAST match (the bottom-anchored one). No match → the bar hides (e.g. the play screen). */
function refreshStickyBack() {
  const isBack = b => /-back$/.test(b.id || "") || /^(←\s*)?(back|done)$/i.test((b.textContent || "").trim());
  const match = [...app.querySelectorAll("button.secondary, button[id$='-back']")].filter(isBack).pop() || null;
  _stickyBackTarget = match;
  stickyBack.hidden = !match;
  if (match) _stickyBackBtn.textContent = /^(←\s*)?done$/i.test((match.textContent || "").trim()) ? "← Done" : "← Back";
}
// A screen swap replaces #app's children (app.innerHTML = …) → one childList mutation catches every screen
// change AND every future screen, with zero per-screen render edits. refreshStickyBack is cheap (one query).
try { new MutationObserver(refreshStickyBack).observe(app, { childList: true }); refreshStickyBack(); } catch { /* observer optional; the bottom buttons still work */ }
// SNG-104: vitals detail on tap (phone) / hover (desktop) — mirrors the data-help delegation above.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-vital]"); if (el) { e.preventDefault(); showVitalDetail(el); } });
// SNG-149/CCODE-89b: naming one of the champion's four. Their pick is computed from your AXIS, not your choice, so it is genuinely blind.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-colpick]"); if (el) { e.preventDefault(); commitColiseumPick(el.dataset.colpick); } });
// SNG-106: tap the roll's chance → the full component breakdown (the resolver's retained math, verbatim).
// SNG-299 (Erik): "all of these new titles and terms and npcs need clickable popups describing who and what
// they are, with a link to the codex page." Same delegation the roll breakdown uses — one listener, any
// number of names, no per-render wiring to forget.
app.addEventListener("click", e => {
  const el = e.target.closest?.("[data-whois]");
  if (!el) return;
  e.preventDefault();
  const known = whoIs(el.dataset.whois, el.dataset.whoiskind, whoIsCtx());
  if (known) showWhoIs(known);
});
app.addEventListener("click", e => { const el = e.target.closest?.("[data-breakdown]"); if (el) { e.preventDefault(); try { showBreakdownPopover(JSON.parse(el.dataset.breakdown)); } catch { /* malformed — no popup */ } } });
// SNG-118: tap a play-style aptitude chip → its effect + description (reuses the one popover surface).
app.addEventListener("click", e => { const el = e.target.closest?.("[data-aptchip]"); if (el) { e.preventDefault(); showPopoverText(el.dataset.aptchip); } });
// SNG-134 Part 2: ONE hover/tap detail for a skill / name / item, everywhere they appear (data-entity="kind:id").
// Same entity → same detail, no matter the render site (the consistency ask). Reuses the one popover surface.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-entity]"); if (el) { e.preventDefault(); e.stopPropagation(); const txt = entityHover(el.dataset.entity); if (txt) showPopoverText(txt); } });
// CCODE-29 (Erik): a function pill → the verb's mechanics (definition / what it's NOT / an example).
app.addEventListener("click", e => { const el = e.target.closest?.("[data-verb]"); if (el) { e.preventDefault(); e.stopPropagation(); const txt = verbDetail(el.dataset.verb); if (txt) showPopoverText(txt); } });
// SNG-244: tap a road in the in-play quest DECISION strip → the shared resolve path (same ending-selection as the
// quest detail). data-qdecide = "questId::outcomeId". A shortcut to the existing resolve, never a parallel path.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-qdecide]"); if (el) { e.preventDefault(); e.stopPropagation(); const [qid, oid] = String(el.dataset.qdecide).split("::"); resolveQuestOutcome(qid, oid); } });
// SNG-215 §A1: toggle a craft BOOST — a player nudge that WEIGHTS the GM's craft suggestions (SNG-214), never
// an override, never a roll change. Targeted DOM update + persist; no full re-render (keeps sidebar scroll).
app.addEventListener("click", e => {
  const el = e.target.closest?.("[data-boost]"); if (!el || !character) return;
  e.preventDefault(); e.stopPropagation();
  const id = el.dataset.boost;
  character.boostedCrafts = character.boostedCrafts || [];
  const at = character.boostedCrafts.indexOf(id);
  const on = at < 0; // becoming boosted?
  if (on) character.boostedCrafts.push(id); else character.boostedCrafts.splice(at, 1);
  el.classList.toggle("on", on); el.closest(".ability")?.classList.toggle("boosted", on);
  el.title = on ? "Boosted — the GM leans toward suggesting this when it fits (tap to clear). A nudge, never a force." : "Boost — nudge the GM to surface this craft in your options when it fits. Never forces it, never changes a roll.";
  try { saveCharacter(character); } catch { /* best-effort */ }
});
// SNG-215 §C: tap a TRAIT (background / origin / tradition / form / aspiration) → its LORE + MECHANICS readout,
// on the one shared popover surface. Authored (trait_readouts) wins; else derived from existing data.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-trait]"); if (!el || !character) return; e.preventDefault(); e.stopPropagation(); const s = el.dataset.trait; const i = s.indexOf(":"); const txt = traitReadout(s.slice(0, i), s.slice(i + 1)); if (txt) showPopoverText(txt); });

// SNG-134: resolve "kind:id" → the shared detail text, gathering the live values the pure formatters need.
function entityHover(spec) {
  if (!character || !spec) return "";
  const i = String(spec).indexOf(":"); if (i < 0) return "";
  const kind = spec.slice(0, i), id = spec.slice(i + 1);
  try {
    if (kind === "skill") {
      const ab = fullCatalog()[id]; if (!ab) return "";
      const owned = (character.abilities || []).find(a => a.abilityId === id);
      const rp = owned ? rankProgress(character, id) : null;
      return skillDetail(ab, {
        tradition: traditionLabel(abilityTradition(ab) || ab.powerSystem || ""), tier: tierOf(ab.levelReq),
        owned: !!owned, level: owned?.level, maxRank: CONTENT.rules?.leveling?.maxAbilityRank ?? 3,
        effCost: (() => { try { return effectiveEnergyCost(ab, character, CONTENT.rules); } catch { return ab.energyCost ?? null; } })(),
        baseCost: ab.energyCost ?? null, families: familiesOfAbility(ab, FN_INDEX),
        rankText: rp?.text, ripe: !!rp?.ripe || aspirationRipe(character, id, CONTENT.rules),
        ladder: (ab.tree || []).map(t => ({ rank: t.rank, name: t.name, grants: t.grants, cannot: t.cannot })) // CCODE-29: how it evolves rank-by-rank
      });
    }
    if (kind === "npc") { const n = character.npcRegistry?.[id]; return n ? npcDetail(n, { locations: CONTENT.locations }) : ""; }
    if (kind === "item") { const it = (character.inventory || []).find(x => (x.name === id || x.customName === id)); return it ? itemDetail(it) : ""; }
  } catch { /* a hover never throws */ }
  return "";
}

/** CCODE-29 (Erik): the mechanics of a function VERB (the 24-verb vocabulary) — its definition, what it is NOT
 *  (the neighbour verbs it's confused with), and an example. Pulled from CONTENT.functionVocabulary. Plain text. */
function verbDetail(verb) {
  const fams = CONTENT?.functionVocabulary?.families || {};
  let entry = null, family = null;
  for (const [fam, list] of Object.entries(fams)) { const e = (Array.isArray(list) ? list : []).find(x => x?.verb === verb); if (e) { entry = e; family = fam; break; } }
  if (!entry) return `${verb} — a function of the craft.`;
  const strip = s => String(s || "").replace(/[`⛔*]/g, "").replace(/\s+/g, " ").trim();
  const lines = [`${String(verb).toUpperCase()}${family ? ` — the ${String(family).toLowerCase()} family` : ""}`];
  if (entry.definition) lines.push(strip(entry.definition));
  if (entry.notTheSameAs) lines.push(`Not: ${strip(entry.notTheSameAs)}`);
  if (entry.example) lines.push(`e.g. ${strip(entry.example)}`);
  return lines.join("\n");
}

/** SNG-084: the authored one-sentence explanation for a mechanic, by id (helper_text.json). */
function helpEntry(id) { return CONTENT?.helpText?.[id] || null; }
/** An ⓘ affordance for a mechanic surface — renders nothing if there's no authored copy (no dangling dot). */
function infoDot(id) { return helpEntry(id) ? `<button class="info-dot" data-help="${esc(id)}" title="What's this?" aria-label="Explain this">ⓘ</button>` : ""; }
/** Light markdown: **bold** only (the copy uses it), everything else escaped. */
function mdLite(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }
/** SNG-217: a model-authored prose BODY (quest premise/stakes) — escape, then render the app's light
 *  markdown (**bold**, the same convention mdLite uses) and real newlines as breaks. The write path
 *  (quests.js normalizeProse) turns literal `\n` into a real newline first; this shows it as a line break
 *  instead of collapsing it, and renders `**...**` as bold instead of leaving raw asterisks on screen. */
function mdProse(s) { return esc(String(s ?? "")).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"); }
/** Show the explanation for a mechanic: the one-sentence `short`, `more` behind a toggle (progressive),
 *  and a link out to the Library for the deep read. A dismissible overlay — never blocks the screen. */
function showHelp(id) {
  const e = helpEntry(id);
  if (!e) return;
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop";
  pop.className = "help-overlay";
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="Explanation">
    <div class="help-short">${mdLite(e.short || "")}</div>
    ${e.more ? `<div class="help-more" id="help-more" hidden>${mdLite(e.more)}</div><button class="link-btn" id="help-more-toggle">more…</button>` : ""}
    <div class="help-foot"><button class="link-btn" id="help-lib">📖 The Library</button><button class="btn" id="help-close">Got it</button></div>
  </div>`;
  document.body.appendChild(pop);
  const close = () => pop.remove();
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
  const mt = document.getElementById("help-more-toggle");
  if (mt) mt.onclick = () => { const m = document.getElementById("help-more"); m.hidden = !m.hidden; mt.textContent = m.hidden ? "more…" : "less"; };
  document.getElementById("help-lib").onclick = () => { close(); renderLibrary(); };
}

// SNG-104: the same dismissable popover the info-dot uses, but from RAW TEXT (showHelp needs a help-id).
// Reuses the .help-overlay/.help-card surface so the phone tap-away + Got-it dismiss is identical.
// SNG-299 — everything the lookup is allowed to know, gathered once.
function whoIsCtx() {
  const ws = character?.worldState || {};
  return { ws, content: CONTENT, character, roster: worldRoster(ws, CONTENT) };
}

/** The popup itself. Deliberately shaped like the roll breakdown: what it is, what is known, and a way
 *  through to the full record — the codex button appears ONLY when a codex page actually exists, because an
 *  offer to "read more" that leads nowhere is worse than not offering. */
function showWhoIs(known) {
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop"; pop.className = "help-overlay";
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="${esc(known.label)}">
    <div class="whois-head">${esc(known.label)} <span class="hint">· ${esc(known.kind)}</span></div>
    <div class="help-short">${known.lines.map(l => `<div class="whois-line">${esc(l)}</div>`).join("")}</div>
    <div class="help-foot">
      ${known.codexId ? `<button class="btn secondary" id="whois-codex">📖 Read the codex page</button>` : ""}
      <button class="btn" id="help-close">Got it</button>
    </div></div>`;
  document.body.appendChild(pop);
  const close = () => pop.remove();
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
  const cx = document.getElementById("whois-codex");
  if (cx) cx.onclick = () => { close(); renderCodexScreen("", known.codexId); };
}

/** SNG-299 — make known names clickable, AFTER render, by walking TEXT NODES.
 *
 *  ⚠️ NOT a regex over the rendered HTML. That would happily rewrite inside an attribute or a tag name and
 *  corrupt the markup in ways that only show up on the one screen nobody tested. Walking text nodes cannot
 *  touch markup at all, and it skips the places a link would be wrong — inside an existing button or link,
 *  inside the player's own prose input.
 *
 *  Only names the world can ANSWER for are linked: `knownIndex` is built from the roster, the arcs, the
 *  player's own codex and the titles actually earned. A name with no record stays plain text.
 */
function linkifyKnown(root) {
  if (!root || !character) return;
  let index;
  try {
    const ws = character.worldState || {};
    index = knownIndex({
      roster: worldRoster(ws, CONTENT), arcs: CONTENT.greaterArcs || [],
      codexTopics: character.codex?.topics || {}, titles: ws.figureTitles || {},
    });
  } catch { return; }
  if (!index.length) return;
  const SKIP = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SCRIPT", "STYLE", "SELECT", "OPTION"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
      for (let el = n.parentElement; el && el !== root; el = el.parentElement) {
        if (SKIP.has(el.tagName) || el.dataset?.whois) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  // ⚠️ EVERY name in the node, not just the first. "The Starless One has dug in over The Green Schism"
  //    carries two things worth asking about, and a first-match-only pass leaves the arc as plain text —
  //    which is precisely the half of the sentence a player is most likely to not recognise.
  for (const node of targets) {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let cursor = 0, linked = false;
    while (cursor < text.length) {
      // The earliest match wins; ties go to the LONGEST name, so a full name beats the bare surname inside it.
      let best = null;
      for (const e of index) {
        const at = text.indexOf(e.name, cursor);
        if (at < 0) continue;
        if (!best || at < best.at || (at === best.at && e.name.length > best.e.name.length)) best = { e, at };
      }
      if (!best) break;
      frag.appendChild(document.createTextNode(text.slice(cursor, best.at)));
      const b = document.createElement("button");
      b.className = "whois"; b.type = "button";
      b.dataset.whois = best.e.id; b.dataset.whoiskind = best.e.kind;
      b.title = "who is this?";
      b.textContent = best.e.name;
      frag.appendChild(b);
      cursor = best.at + best.e.name.length;
      linked = true;
    }
    if (!linked) continue;
    frag.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode?.replaceChild(frag, node);
  }
}

function showPopoverText(text) {
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop"; pop.className = "help-overlay";
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="Detail"><div class="help-short">${esc(text).replace(/\n/g, "<br>")}</div><div class="help-foot"><button class="btn" id="help-close">Got it</button></div></div>`;
  document.body.appendChild(pop);
  const close = () => pop.remove();
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
}

// SNG-106 + CCODE-30: format the resolver's retained breakdown into the shared popover — every signed
// component, the BASE the roll draws on named as such, the opposed term (or its absence) made explicit, the
// clamp only when it bit, and the number → roll → result in one place. Every line is real retained math.
function showBreakdownPopover(bd) {
  const sign = v => (v >= 0 ? "+" : "−") + Math.abs(Math.round(v));
  const comps = bd.components || [];
  const lines = comps.map(c => {
    // CCODE-30: mark the BASE line so the player learns which attribute/sub-attribute the action drew on
    // (Erik: "what skill did I use as a base?" — it's the sub-attribute, e.g. insight, not the ability).
    const isBase = bd.base && String(c.label).startsWith(bd.base);
    return `${c.label}   ${sign(c.value)}${isBase ? "   ← your base (the attribute this draws on)" : ""}`;
  });
  if (bd.clampedFrom != null) lines.push(`clamped (from ${bd.clampedFrom})`);
  // CCODE-30: was there an OPPOSED roll, or is the difficulty the task's own hardness? Say it plainly.
  const oppLine = bd.opposed
    ? `\n⚔ Opposed by ${bd.opposed} — that resistance above is their strength, not a fixed number.`
    : comps.some(c => String(c.label) === "difficulty")
      ? `\nNo opposed roll here — "difficulty" is the task's own hardness, set by the GM from the fiction.`
      : "";
  const foot = `total   ${bd.total}%${bd.roll != null ? `   — rolled ${bd.roll} → ${String(bd.degree || "").replace("_", " ")}` : ""}`;
  // SNG-258 §4/§4b + §9 — THE SECOND ROLL, SHOWN. Crits stopped being a position on the first roll (1-5 /
  // 96+) and became their own roll with their own dials, which made them INVISIBLE: the player could see the
  // chance they had to beat and had no way to learn that a master crits harder and fumbles softer. §9 asks for
  // "your crit-success X% / crit-failure Y%, and why", and critProfile already returns both dials WITH their
  // named components for exactly this — so this is the same self-summing discipline as the chance above, not
  // a second, prettier account of the same math. A craft that authored its OWN critical is named here too.
  const critBlock = (() => {
    const c = bd.crit;
    if (!c) return "";
    const side = (label, chance, comps, clampedFrom) => {
      const rows = (comps || []).map(x => `   ${x.label}   ${sign(x.value)}`);
      if (clampedFrom != null) rows.push(`   clamped (from ${clampedFrom}%)`);
      return `${label}   ${chance}%${rows.length ? "\n" + rows.join("\n") : ""}`;
    };
    const rolled = bd.critRoll != null
      ? `\n\nThis time the second roll was ${bd.critRoll} — ${String(bd.degree || "").startsWith("crit") ? "it landed." : "no crit."}`
      : "";
    // A PARTIAL takes no second roll at all, and saying so is the difference between "you were unlucky" and
    // "this outcome was never eligible" — the player should not hunt for a crit that could not have happened.
    const partial = bd.degree === "partial"
      ? "\n\n(A partial takes no second roll — the soft middle outcome is not eligible to crit either way.)" : "";
    const authored = bd.critText ? `\n\n“${bd.critText}”\n   — this craft’s own critical, written by its author.` : "";
    return `\n\n────────────\nTHE SECOND ROLL — crits are their own d100, not a band on the one above.\n\n`
      + `${side("crit success", c.successChance, c.successComponents, c.successClampedFrom)}\n\n`
      + `${side("crit failure", c.failChance, c.failComponents, c.failClampedFrom)}${rolled}${partial}${authored}`;
  })();
  showPopoverText(`Success chance ${bd.total}% — roll a d100 at or under this to succeed.\n\n${lines.join("\n")}${oppLine}\n────────────\n${foot}${critBlock}`);
}

// SNG-104: what a Health/Energy number's tap/hover shows — how rest restores it, read from CONTENT.rules.recovery.
function showVitalDetail(el) {
  const kind = el.dataset.vital;
  const rec = (CONTENT?.rules && CONTENT.rules.recovery) || {};
  const sleep = rec.sleep || {}, breather = rec.breather || {};
  const body = kind === "energy"
    ? `Rest restores — breather +${breather.energy ?? 10} (${breather.hours ?? 1}h) · meal +${rec.meal ?? 10} · sleep +${sleep.energy ?? 40} (${sleep.hours ?? 8}h)`
    : `Rest restores — breather +${breather.health ?? 1} · sleep +${sleep.health ?? 3} (${sleep.hours ?? 8}h)`;
  showPopoverText(`${el.textContent.trim()} ${kind}\n${body}`);
}

let CONTENT = null;      // packs: rules, spectrums, abilities, locations, npcs, events, lore, region
let FN_INDEX = { families: [], verbToFamily: {}, byFamily: {} }; // SNG-124: function-family index (built at load)
let wheelFnFilter = new Set(); // SNG-124 Phase B: active function-family filter on the skill wheel
let wheelSelTrad = null; // SNG-202B §2: the tradition clicked to highlight its crafts/braids across the wheel
let wheelRecommended = new Set(); // SNG-218 §3: the level-up suggestion's picks, lit ON the wheel (browse + highlight)
let wheelReturnTo = null; // SNG-218 §3: when the wheel is opened FROM level-up, its Back returns there
let wheelLearnMode = false; // SNG-218 §3 (Erik): opened from level-up → hide OWNED crafts (you're browsing what to LEARN, not your kit)
let wheelSuggestFilter = false; // SNG-218 §3 (Erik): the "✨ Suggested" filter — isolate the recommended crafts on the wheel
let character = null;    // active character
let profile = null;      // the player's profile (the human)
let sceneTurns = [];     // recent beats: {summary, narration} for scene continuity
let sceneBeats = 0;      // SNG-266/1d: beats this scene has truly run (sceneTurns is TRIMMED; this is not)
let pendingArcCostNote = null;   // SNG-273: why this craft just cost what it did, in the arc's own name
// CCODE-02: the stored scene history is BOUNDED. It was unbounded, and a long-running scene that
// never ended grew to 169 turns (~341KB) on a real save — 59% of a 600KB character — which is what
// exhausted the localStorage quota and hung character load. Every consumer reads at most
// `.slice(-6)` (the GM prompt, the gambit extractor), so 40 is generous headroom, not a trim of
// anything anyone reads. The chronicle keeps each scene's summary independently on scene end.
const SCENE_TURN_CAP = 40;
let sceneState = null;   // authoritative scene anchor: setting, npcsPresent, objects, threads
let busy = false;
let _discoverAutoRan = false; // SNG-087: auto-run cross-device discovery at most once per session
let examinedItem = null; // name of the item expanded in the sidebar
let askMode = false;     // input bar mode: false = act in scene, true = ask the GM (OOC)
let npcGroupsOpen = new Set();   // Fix 5: session memory of expanded people-groups
let gambitHintDismissed = false; // SNG-031: gambit hint chip dismissed for the current scene
let gambitHintCooldown = 0;      // SNG-077: turns to stay quiet after a hint is dismissed
// SNG-066: feedback forensics — the value is the AUTO-CAPTURED CONTEXT, not the text box.
let _capturedErrors = [];        // runtime errors since load (for a one-click pre-diagnosed report)
let lastPlayerAction = null;     // the last choice the player took
let sceneGenCount = 0;   // SNG-BATCH-9: generative-mint counter for this scene (the governor cap)
let sharedCanonView = []; // SNG-BATCH-9 Phase 3: this viewer's rating-lensed slice of shared canon
// SNG-250 §7b: creatures OTHER players have grown, snapshotted from shared canon at a safe seam (never
// mid-encounter — see hydrateCanonIntoContent). One valley, one bestiary.
let sharedCreaturePool = [];
let sceneArtCount = 0;   // SNG-035: moment-art mints this scene (clamp ~1/scene)
let mapShowKG = false;   // SNG-046: knowledge-overlay toggle on the world map
let mapShowSub = false;  // SNG-082b: sub-place satellites toggle (off by default — the clean look)
let _lightboxWired = false; // SNG-053: one-time lightbox click delegation (referenced by boot)
let tuneOpen = null;             // SNG-015 Part B: index of the choice whose tune panel is open
let tuneSel = { abilityId: undefined, intensity: "standard" }; // current tune selection
let movesOpen = false;           // SNG-252b §2a: COLLAPSED by default. SNG-252 opened them (Erik's earlier ask); seeing it built he reversed it — ~5 full-width cards ate the screen before he had chosen to look. The collapsed affordance SUMMARISES what is behind it, so nothing is lost by folding it away.
let _richNextTurn = false;       // SNG-242 §5: armed by the "✦ Rich" toggle — the NEXT turn is told at the flagship tier, then cleared
let pendingPartyBeats = [];      // shared-scene: other players' new beats awaiting catch-up (non-destructive)
let npcGroupsClosed = new Set(); // explicitly collapsed (overrides current-location default)
// SNG-120: per-section collapse state for the play sidebar, mirroring the npcGroups open-set pattern.
// Persisted on the PROFILE (a UI preference, cross-character — Q1). Two sets: what the player opened against
// a collapsed default, and what they closed against an open default.
let sidebarOpen = new Set();
let sidebarClosed = new Set();
function loadSidebarState() { try { const u = profile?.uiSidebar || {}; sidebarOpen = new Set(u.open || []); sidebarClosed = new Set(u.closed || []); } catch { /* defaults */ } }
function saveSidebarState() { if (!profile) return; profile.uiSidebar = { open: [...sidebarOpen], closed: [...sidebarClosed] }; try { saveProfile(profile); } catch { /* best-effort */ } }
function sectionOpen(key, defaultOpen) { return sidebarClosed.has(key) ? false : sidebarOpen.has(key) ? true : defaultOpen; }
/** SNG-120: wrap a sidebar section in a collapsible <details> with persisted open/closed state + a header
 *  summary (a count/band) so a glance answers without expanding. Interactive controls belong in `body`,
 *  not the title, so a tap on them doesn't also toggle the section. */
function sec(key, title, body, { defaultOpen = true, summary = "" } = {}) {
  const open = sectionOpen(key, defaultOpen);
  return `<details class="sidebar-sec" data-sec="${esc(key)}"${open ? " open" : ""}><summary><span class="sec-title">${title}</span>${summary ? ` <span class="sec-sum">${summary}</span>` : ""}</summary><div class="sec-body">${body}</div></details>`;
}
let gambitDraft = null;  // in-progress plan: {goal, steps: [{text, fallback}], assessed}
let pendingGambitProposal = null; // SNG-088B: a plan the GM sketched this turn, to open the builder pre-filled
let lastPlayerText = ""; // last freeform/ask input — restored into the box if the GM errors
let sharedScene = null;  // SNG-001: the shared scene object (party play), null when solo
let partyPoll = null;    // poll timer while a shared scene is active
let seenBeats = 0;       // remote beats already rendered
// SNG-075: encounters in narrative play — an encounter selected by the narrative-time roll waits
// here to be WOVEN into the next GM turn (never a modal). One per scene + a turn cooldown.
let pendingWeave = null;        // { seed, flavor, perilous, loreTier } to inject next turn
let pendingEncounterOffer = null;// SNG-236 fix A: a STRUCTURED encounter the roll turned up — offered HARD (a framed choice the GM MUST present), not woven invisibly. { id, name, kind }
// SNG-246 Fix A, fallback (b): the player committed a killing blow but the engine could NOT resolve who at — so
// rather than invent an opponent, it hands the next GM turn a hard directive to frame the fight it just narrated.
let pendingFightFraming = null;
let pendingStageReveal = null;   // SNG-239: a quest stage just completed — hand its EARNED reveal (change) to the next GM turn as a MUST-STATE-PLAINLY directive (the Fix-A pattern: a hard directive, not a soft rule under load). [{ title, change, atDecision }]
let sceneEncounterFired = false;// SNG-127: fired in THIS scene? (adds spacing after the first, not a hard cap)
let turnsSinceEncounter = 99;   // cooldown counter (turns since the last narrative encounter)
// SNG-127: the cooldown is now the player's pacing (resolvePacing → cooldown), read per-turn from config.
// SNG-080: the world must push. Track quiet turns; past a threshold, the world ACTS.
let quietTurns = 0;             // consecutive uneventful GM turns
let pressureStreak = 0;         // pressures applied in the current idle streak (escalation level)
let pendingPressure = null;     // a world-pressure directive to weave into the next GM turn
let pendingSubstrateNote = null; // SNG-090: a "the lattice is thin/crowded here" note for the next GM turn
let pendingRankAdvances = []; // ability-arch v2: abilities that auto-advanced to rank 2 through use, to toast
let pendingBraidMoments = []; // SNG-197 p2: minted/enriched braids awaiting their MOMENT modal (drained after render)
let _braidMomentOpen = false; // one moment on screen at a time (a burst chains, never stacks)
let braidRecipeStore = { schemaVersion: 1, recipes: {} }; // SNG-201: cached shared-recipe store (refreshed each sync) for the mint-time adopt path
const RECIPES_PATH = "world/braid_recipes.json"; // SNG-201: a NEW shared store (not emergence_recipes — that's prescriptive)

// ---------- boot ----------

(async function boot() {
  // SNG-066: capture runtime errors since load so a feedback report arrives pre-diagnosed.
  try {
    const noteErr = m => { _capturedErrors = [..._capturedErrors, String(m).slice(0, 300)].slice(-10); };
    window.addEventListener("error", e => noteErr(e.message || e.error?.message || "error"));
    window.addEventListener("unhandledrejection", e => noteErr("unhandled: " + (e.reason?.message || e.reason || "rejection")));
  } catch { /* ignore */ }
  // SNG-074: dev mode is OPT-IN, VISIBLE, and REVERSIBLE. `?dev=1` opts in for THIS SESSION only
  // (sessionStorage — a reload without the param returns a clean player view); `?dev=0` clears
  // everything; and the old sticky `localStorage "singularity.dev"` is migrated OUT so no family
  // member is ever permanently trapped in dev mode. A deliberate persistent opt-in lives in Settings.
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("dev") === "1") sessionStorage.setItem("singularity.dev", "1");
    if (p.get("dev") === "0") { sessionStorage.removeItem("singularity.dev"); localStorage.removeItem("singularity.devPersist"); }
    if (localStorage.getItem("singularity.dev") === "1") localStorage.removeItem("singularity.dev"); // retire the sticky flag
  } catch { /* ignore */ }
  // SNG-186 §2f: arm the model-exchange capture ONLY in dev mode, and point the transport's observer
  // at it. In a player view isDevMode() is false — nothing is armed and setCallObserver is never
  // called, so the capture stays null and inert (§3.4: no dev path the normal turn can reach).
  try { if (isDevMode()) { armDevCapture(true); setCallObserver(recordCall); } } catch { /* ignore */ }
  wireLightbox(); // SNG-053: click any image → larger view
  try {
    CONTENT = await loadContent();
    applyDevDials();   // SNG-263 r4: dev-only live balance overrides, applied over the loaded content
    FN_INDEX = buildFunctionIndex(CONTENT.functionVocabulary); // SNG-124: verb→function-family index for coverage + badges
    GENERATABLE_TYPES = new Set(Object.keys(CONTENT.genSchemas || {})); // SNG-250 §5: derived, never a literal
    reportContractCoverage();                                  // SNG-250 §4: name any type whose two halves disagree
  } catch (err) {
    app.innerHTML = `<div class="boot">Failed to load content packs: ${esc(err.message)}<br>Serve this folder over HTTP (packs load via fetch).</div>`;
    return;
  }
  // SNG-045: collapse same-name duplicate profiles (one person fragmented across devices into
  // multiple per-device keys) into one canonical profile owning all their characters. Idempotent.
  try { dedupePlayers(); } catch (err) { console.warn("[identity] dedup skipped:", err?.message); }
  // SNG-BATCH-7 Phase 1: identity first. If this device hasn't chosen a player but
  // knows more than one, ask who's playing (path-a family devices); otherwise proceed.
  if (!hasChosenPlayer() && listPlayers().length > 1) { renderPlayerPick(); return; }
  loadIdentity();
  if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
  else renderRoster();
})();

/** Resolve the active profile from the chosen (or auto-created) player key. */
function loadIdentity() {
  profile = loadProfile(getPlayerKey()) || newProfile(getPlayerKey());
  ensureRating(profile); // SNG-BATCH-9: backfill the content-rating ceiling on pre-BATCH-9 profiles
  loadSidebarState();    // SNG-120: restore the player's per-section collapse preferences
}

/** SNG-BATCH-7 Phase 2: reconcile a local character against the sync repo's authoritative
 *  copy — NEWER WINS, a stale local is never used, and a genuine both-advanced conflict
 *  preserves the losing copy as a recovery file + surfaces a note. Never blocks play. */
async function syncPullCharacter(local) {
  if (!local || !syncEnabled()) return { character: local, note: null };
  let remote = null;
  try { remote = await fetchRemoteCharacter(local.playerKey, local.id); }
  catch (err) { console.warn("[sync] pull failed — using local:", err.message); return { character: local, note: null }; }
  if (!remote) return { character: local, note: null };
  const res = resolveSaveConflict(local, remote);
  if (res.reason === "remote-newer") {
    if (res.conflict) preserveRecovery(local, "local"); // both advanced — don't lose local work
    adoptRemoteCharacter(remote);
    return { character: remote, note: res.conflict
      ? "Loaded the newer version from another device — this device's local changes were kept as a recovery copy."
      : "Loaded your latest from another device." };
  }
  if (res.conflict) { preserveRecovery(remote, "remote"); return { character: local, note: "Kept this device's newer version — the other device's copy was saved as a recovery copy." }; }
  return { character: local, note: null };
}

/** "Who's playing?" — pick an existing player on this device, or start a new one. */
function renderPlayerPick(msg = "") {
  const players = listPlayers();
  app.innerHTML = `<div class="app-boot"><div class="screen" style="max-width:460px;margin:40px auto">
    <h2>Who's playing?</h2>
    ${msg ? `<p class="hint">${esc(msg)}</p>` : ""}
    <div class="player-pick">
      ${players.map(p => `<button class="btn player-choice" data-player="${esc(p.playerKey)}">${esc(p.displayName)}</button>`).join("")}
      ${syncEnabled() ? `<button class="btn secondary" id="player-discover" style="margin-top:8px">☁ Find me in the shared world</button>` : ""}
      <button class="btn secondary" id="player-new" style="margin-top:8px">+ New player</button>
    </div>
    ${!players.length && !syncEnabled() ? `<p class="hint" style="margin-top:10px">Playing across devices? Add your sync settings in a new player's Settings, then your characters follow you here.</p>` : ""}
  </div>`;
  const pdisc = document.getElementById("player-discover");
  if (pdisc) pdisc.onclick = () => renderDiscover();
  for (const b of app.querySelectorAll("[data-player]")) b.onclick = () => {
    setPlayerKey(b.dataset.player);
    loadIdentity();
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
  document.getElementById("player-new").onclick = () => {
    const name = prompt("New player name:");
    if (name === null) return;
    // SNG-045 Part B: entering an EXISTING name attaches to that person, never mints a duplicate.
    const existing = findProfileByName(name.trim());
    if (existing) { setPlayerKey(existing.playerKey); loadIdentity(); }
    else {
      const key = "player-" + Math.random().toString(36).slice(2, 8);
      setPlayerKey(key);
      profile = newProfile(key, name.trim());
      saveProfile(profile);
    }
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
}

// ---------- shared chrome ----------

function chrome(inner) {
  app.innerHTML = `
    <div class="topbar">
      <div><h1>SINGULARITY</h1><span class="sub">The Valley of Echoes — v${APP_VERSION}</span>${isDevMode() ? ` <span class="dev-badge" title="Developer mode is ON. Turn it off in Settings, or reload without ?dev=1.">DEV</span>` : ""}</div>
      <div class="actions">
        <button id="nav-roster">Characters</button>
        <button id="nav-settings">Settings</button>
        <button id="nav-feedback" title="Feedback / bug report — your version, location, character and last turn attach automatically">⚑ Feedback</button>
        ${devEnabled() ? `<button id="nav-dev" title="Dev preview-legs checklist">🧪 Legs</button>` : ""}
        ${devEnabled() ? `<button id="nav-machine" title="SNG-186 §2f — see the machine: the assembled prompt, raw response, parsed result and ops fired for recent model calls">🔬 Machine</button>` : ""}
        ${devEnabled() ? `<button id="nav-author" title="SNG-207b — AUTHOR god-mode: set anything on this character (xp, level, items, abilities, world arcs), no fairness check. Dev only.">⚙ Author</button>` : ""}
      </div>
    </div>
    ${inner}`;
  document.getElementById("nav-roster").onclick = () => renderRoster();
  document.getElementById("nav-settings").onclick = () => renderSettings();
  const fbBtn = document.getElementById("nav-feedback");
  if (fbBtn) fbBtn.onclick = () => { _feedbackType = "bug"; openFeedback(); };
  const devBtn = document.getElementById("nav-dev");
  if (devBtn) devBtn.onclick = () => renderPreviewLegs();
  const machBtn = document.getElementById("nav-machine");
  if (machBtn) machBtn.onclick = () => renderMachine();
  const authBtn = document.getElementById("nav-author");
  if (authBtn) authBtn.onclick = () => renderAuthorPanel();
  // SNG-299: every screen renders through chrome(), so the pass lives HERE — a new screen gets clickable
  // names for free and no render can forget to wire it. Best-effort: a lookup failure must never take a
  // screen down with it.
  try { linkifyKnown(app); } catch { /* names stay plain text */ }
}

// ---------- SNG-053: image lightbox (click any portrait/scene/moment art → larger view) ----------

/** Open a modal lightbox over a list of images (arrow-through when >1). Esc / click-backdrop /
 *  ✕ dismiss; ←/→ navigate. Reused by portraits, NPC/location art, moment art, and the gallery. */
function openLightbox(items, start = 0) {
  const list = (items || []).filter(it => it && it.url);
  if (!list.length) return;
  let i = Math.max(0, Math.min(start, list.length - 1));
  const el = document.createElement("div");
  el.className = "lightbox";
  const close = () => { el.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (list.length > 1 && e.key === "ArrowLeft") { i = (i - 1 + list.length) % list.length; render(); }
    else if (list.length > 1 && e.key === "ArrowRight") { i = (i + 1) % list.length; render(); }
  };
  const render = () => {
    const it = list[i];
    el.innerHTML = `<div class="lightbox-inner">
      <img src="${esc(it.url)}" alt="${esc(it.caption || "")}">
      ${it.caption ? `<div class="lightbox-cap">${esc(it.caption)}${list.length > 1 ? ` · ${i + 1}/${list.length}` : ""}</div>` : ""}
      ${list.length > 1 ? `<button class="lightbox-nav prev" data-lbprev>‹</button><button class="lightbox-nav next" data-lbnext>›</button>` : ""}
      <button class="lightbox-close" data-lbclose>✕</button>
    </div>`;
    el.querySelector("[data-lbclose]").onclick = close;
    const prev = el.querySelector("[data-lbprev]"); if (prev) prev.onclick = (e) => { e.stopPropagation(); i = (i - 1 + list.length) % list.length; render(); };
    const next = el.querySelector("[data-lbnext]"); if (next) next.onclick = (e) => { e.stopPropagation(); i = (i + 1) % list.length; render(); };
  };
  el.onclick = (e) => { if (e.target === el || e.target.classList.contains("lightbox-inner")) close(); };
  document.addEventListener("keydown", onKey);
  render();
  document.body.appendChild(el);
}

/** One-time delegated handler: any img[data-lightbox] opens the lightbox; a gallery image opens
 *  the whole gallery arrow-through from its index. Registered once (survives chrome re-renders).
 *  `_lightboxWired` is declared at module top (boot calls this before this point is evaluated). */
function wireLightbox() {
  if (_lightboxWired) return;
  _lightboxWired = true;
  document.addEventListener("click", (e) => {
    const img = e.target.closest && e.target.closest("img[data-lightbox]");
    if (!img) return;
    if (img.dataset.lbgroup === "gallery" && character?.gallery?.length) {
      openLightbox(character.gallery.map(g => ({ url: g.url, caption: g.caption })), Number(img.dataset.lbindex) || 0);
    } else {
      openLightbox([{ url: img.getAttribute("src"), caption: img.getAttribute("alt") }]);
    }
  });
}

// ---------- SNG-051: dev preview-legs panel (dev-only; clears the verification bottleneck) ----------

/** SNG-074: the ONE dev-mode source of truth — opt-in, visible, reversible.
 *  ON when: this URL has `?dev=1` · a dev host (localhost/preview) · this session opted in
 *  (`?dev=1` earlier this session) · a DELIBERATE persistent opt-in from Settings.
 *  `?dev=0` in the URL always wins OFF. No sticky localStorage flag, so a family member can
 *  never be trapped in dev mode — a plain reload on the live URL is a clean player view. */
// ---------- SNG-263 r4: LIVE BALANCE DIALS (dev only) ----------
// Erik: "ALL of these dials should/could be dev settings to have me tweak as I play to find the right feel...
// when we update things like this we should always keep in mind what dev and machine screens are available."
//
// Every balance number we have shipped this session lives in content, which makes it TUNABLE but not
// FEELABLE — changing one meant editing JSON and reloading, which is the wrong loop for a question like "how
// hard should a master's kindle hit?" That is answered by playing, not by reading a table. This applies a
// thin override layer over the already-loaded rules so a dial can be turned mid-session.
//
// DEV ONLY, and deliberately so: `isDevMode()` gates both the read and the UI, so a player build has no
// override path at all and the shipped content is the only source of truth. Overrides persist per-browser.
const DIALS_KEY = "singularity.dials";
/** The dials worth turning, as dotted paths into the loaded content. Adding a row here is the whole job of
 *  exposing a new dial — the panel, the apply and the reset all read this one list. */
const DEV_DIALS = [
  { path: "skillBattle.engine.damage.base", label: "damage: base", step: 0.5, why: "the floor under every landed hit" },
  { path: "skillBattle.engine.damage.perTier", label: "damage: per tier", step: 0.25, why: "flat per-tier term (the generic fallback path)" },
  { path: "skillBattle.engine.damage.perMarginPoint", label: "damage: per margin point", step: 0.01, why: "how much a decisive exchange adds" },
  { path: "skillBattle.engine.damage.minHit", label: "damage: minimum hit", step: 1, why: "a blow that connects always costs at least this, even through soak" },
  { path: "skillBattle.engine.damage.scaling.perLevel", label: "scaling: per character level", step: 0.02, why: "SNG-263 §11 — how much the WIELDER adds; a master's kindle vs a novice's" },
  { path: "skillBattle.engine.damage.scaling.perAttributePoint", label: "scaling: per attribute point", step: 0.05, why: "above scaling.attributeBase" },
  { path: "skillBattle.engine.damage.scaling.maxScaling", label: "scaling: cap", step: 1, why: "the ceiling on the wielder term, so it never rivals a tier step" },
  { path: "skillBattle.engine.opponentSheetSynthesis.healthBase", label: "foe: health base", step: 1, why: "SNG-263 r4 GAP1 — synthesised foes had a flat 5 before this" },
  { path: "skillBattle.engine.opponentSheetSynthesis.threatToHealth", label: "foe: health per threat", step: 0.01, why: "how fast durability climbs with the band" },
  { path: "skillBattle.engine.opponentSheetSynthesis.threatToSoak", label: "foe: soak per threat", step: 0.005, why: "SNG-263 r4 GAP2 — how hard armour bites" },
  { path: "skillBattle.engine.opponentSheetSynthesis.soakBase", label: "foe: soak base", step: 1, why: "SNG-263: the flat floor under a foe's guard before threat scaling" },
  { path: "craftMechanics.familyDefaults.guard.soakRank", label: "ward: guard rank raised", step: 1, why: "what RANK a ward/shield layer sits at — a craft must out-penetrate it to go through" },
  { path: "craftMechanics.familyDefaults.damage.dice.n", label: "craft: T-I damage dice", step: 1, why: "SNG-263 r4 — how many dice an unauthored T-I rolls; the tier ladder multiplies this" },
  { path: "craftMechanics.familyDefaults.damage.dice.d", label: "craft: T-I die size", step: 1, why: "the die's faces; the anchor is 'a T-I max can kill a peer riffraff in one blow'" },
  { path: "craftMechanics.familyDefaults.damage.plus", label: "craft: T-I flat bonus", step: 1, why: "added after the dice; the tier ladder adds its own on top from T-III" },
  { path: "rules.baseChance.attributeMultiplier", label: "roll: attribute multiplier", step: 1, why: "SNG-258 §1 — attribute's share of a strong chance" },
  { path: "rules.crit.baseSuccessChance", label: "crit: base success dial", step: 1, why: "SNG-258 §3b — the second roll" },
  { path: "rules.crit.baseFailChance", label: "crit: base failure dial", step: 1, why: "lowered by rank and practice; floored so catastrophe stays possible" },
  { path: "rules.crit.perCraftCap", label: "crit: per-craft authoring cap", step: 1, why: "CCODE-76 — how far a craft may bias its OWN crit dials; 0 makes authored crit prose-only" },
  { path: "craftMechanics.variance.perPoint", label: "wild: variance per point", step: 0.01, why: "CCODE-77 — how much ONE authored point of variance widens a craft's band; the mean never moves. 0 makes churnfolk resolve exactly like lattice" },
  { path: "skillBattle.engine.persistentEffects.craftDuration.roundsPerPoint", label: "effects: rounds per duration point", step: 0.05, why: "CCODE-77 — how a craft's own duration becomes ROUNDS STANDING. Before this every verb stood a flat 2 regardless of tier; lower this if low-tier wards now feel too brief" },
  { path: "skillBattle.engine.persistentEffects.craftDuration.craftDurationMax", label: "effects: max rounds standing", step: 1, why: "the clamp — the craft duration ladder runs to 17 and a fight is not 17 rounds long" },
  { path: "skillBattle.engine.evasion.marginPerPoint", label: "evade: margin per point", step: 1, why: "CCODE-80 — how much ONE authored point of evasion takes off the attacker's margin. Evasion is not soak: it means the blow does not land, so it acts on the roll, not the damage" },
];
function readDials() { try { return JSON.parse(localStorage.getItem(DIALS_KEY) || "{}") || {}; } catch { return {}; } }
function writeDials(m) { try { localStorage.setItem(DIALS_KEY, JSON.stringify(m)); } catch { /* ignore */ } }
function dialGet(root, path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), root); }
function dialSet(root, path, val) {
  const parts = path.split("."); const last = parts.pop();
  const parent = parts.reduce((o, k) => (o && o[k] != null ? o[k] : null), root);
  if (parent && typeof parent === "object") parent[last] = val;
}
/** Apply the stored overrides onto the LOADED content. Called after load and after every edit, so a turned
 *  dial takes effect on the next roll without a reload. Records each dial's shipped value the first time it
 *  is touched, so Reset restores content truth rather than a guess. */
let DIAL_BASELINE = null;
function applyDevDials() {
  if (!isDevMode() || !CONTENT) return;
  if (!DIAL_BASELINE) { DIAL_BASELINE = {}; for (const d of DEV_DIALS) DIAL_BASELINE[d.path] = dialGet(CONTENT, d.path); }
  const over = readDials();
  for (const d of DEV_DIALS) {
    const v = Object.prototype.hasOwnProperty.call(over, d.path) ? Number(over[d.path]) : DIAL_BASELINE[d.path];
    if (Number.isFinite(v)) dialSet(CONTENT, d.path, v);
  }
}

function isDevMode() {
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("dev") === "0") return false;
    if (p.get("dev") === "1") return true;
    if (/^(localhost|127\.0\.0\.1|\[::1\])/.test(location.hostname)) return true;
    if (sessionStorage.getItem("singularity.dev") === "1") return true;
    if (localStorage.getItem("singularity.devPersist") === "1") return true;
  } catch { /* ignore */ }
  return false;
}
/** Set/clear the DELIBERATE persistent dev opt-in (the Settings toggle). */
function setDevPersist(on) {
  try {
    if (on) localStorage.setItem("singularity.devPersist", "1");
    else { localStorage.removeItem("singularity.devPersist"); sessionStorage.removeItem("singularity.dev"); }
  } catch { /* ignore */ }
}
// devEnabled()/isDev() are the historical names — both now resolve to the single model above.
function devEnabled() { return isDevMode(); }

const LEG_STATUS = ["untried", "pass", "fail", "feels-off"];
const LEG_STATUS_LABEL = { untried: "· untried", pass: "✓ pass", fail: "✗ fail", "feels-off": "~ feels-off" };

function loadLegStatus() {
  try { return JSON.parse(localStorage.getItem("singularity.previewLegs") || "{}"); } catch { return {}; }
}
function saveLegStatus(map) { try { localStorage.setItem("singularity.previewLegs", JSON.stringify(map)); } catch { /* ignore */ } }

// SNG-051 auto-verify: a leg's pass-condition is detected as it HAPPENS in real play (dev boxes
// only), marks it pass, and — when sync is on — REPORTS it to Aevi via a synced status file so
// the verified leg drops out of the active checklist. Never touches normal players (devEnabled).
const LEG_STATUS_PATH = "data/preview_legs_status.json";
let _reportingLegs = false;

/** Fire-and-forget: push all locally-verified-but-unreported legs to the synced status file Aevi
 *  reads, then mark them reported (so they clear from the panel). No-op without sync. */
async function reportLegStatus() {
  if (!devEnabled() || !syncEnabled() || _reportingLegs) return;
  const map = loadLegStatus();
  const toReport = Object.entries(map).filter(([, s]) => s.status === "pass" && !s.reported);
  if (!toReport.length) return;
  _reportingLegs = true;
  try {
    await pushMergedFile(LEG_STATUS_PATH, (remote) => {
      const store = (remote && typeof remote === "object") ? remote : {};
      store.schemaVersion = 1; store.id = "preview_legs_status"; store.verified = store.verified || {};
      for (const [id, s] of toReport) store.verified[id] = { status: "pass", auto: !!s.auto, note: s.note || "", at: s.at || Date.now(), by: profile?.displayName || profile?.playerKey || "dev" };
      store.updatedAt = new Date().toISOString();
      return store;
    }, `preview-legs: ${toReport.length} verified in play`);
    const m2 = loadLegStatus();
    for (const [id] of toReport) m2[id] = { ...(m2[id] || {}), reported: true };
    saveLegStatus(m2);
  } catch { /* offline / no write — stays unreported, retried on the next detection */ }
  finally { _reportingLegs = false; }
}

/** Auto-mark a preview leg verified when its pass-condition fires in real play. Dev-only; idempotent
 *  (won't downgrade a manual mark or re-mark a reported one); reports to Aevi when sync is on. */
function autoVerifyLeg(legId, note) {
  if (!devEnabled() || !legId) return;
  const map = loadLegStatus();
  const cur = map[legId];
  if (cur?.status === "pass") { if (!cur.reported) reportLegStatus(); return; }
  map[legId] = { ...(cur || {}), status: "pass", auto: true, note: note || cur?.note || "auto-detected in play", at: Date.now() };
  saveLegStatus(map);
  reportLegStatus();
}

let _previewLegsData = null; // cached fetch of the Aevi-owned data file

// SNG-051 addendum: the ▶ Run-this-scenario runner. Each force intent resolves against the
// EXISTING primitives (travel/setRating/rest/generate/clock-jump/screens) — no new mechanics.
// Dev-only (the panel is devEnabled-gated). Cross-player / two-character legs stay manual.
// Unknown intent → no runner entry → the button renders as "(unsupported intent)".
/** DEV: ensure a fully-equipped test character is active so any leg has its prerequisites — a
 *  mid-level hero with a home ability, a CROSS-CLASS forkable ability (prism_sight), open skill
 *  points, and maxed sub-attributes so ability gates pass. Reused if it already exists. Idempotent. */
function ensureTestCharacter() {
  const rules = CONTENT.rules;
  let c = loadCharacter("char-devtest");
  if (!c) {
    const homeAb = Object.values(CONTENT.abilities).find(a => a.powerSystem === "harmonic" && (a.levelReq || 1) <= 1);
    const abilities = [];
    if (homeAb) abilities.push({ abilityId: homeAb.id, level: 1 });
    if (CONTENT.abilities.prism_sight) abilities.push({ abilityId: "prism_sight", level: 2 }); // cross-class (radiant) + forks at r3
    c = {
      schemaVersion: 1, id: "char-devtest", playerKey: getPlayerKey(),
      name: "Test Hero (dev)", origin: "harmonic", background: "craftsman",
      level: 5, xp: 0,
      attributes: { physical: 3, mental: 3, social: 3, practical: 3 },
      skills: {}, abilities, alignment: {}, attunement: 3,
      maxHealth: 30, health: 30, maxEnergy: rules.energy?.max ?? 100, energy: rules.energy?.max ?? 100,
      inventory: startingGear("craftsman"),
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: CONTENT.startingLocation, activeScene: null,
      clock: newClock(), companions: [], quests: [], npcRegistry: {}, placeMemory: {},
      worldState: initWorldState(1), bio: null
    };
    ensureSubAttributes(c);
    for (const s of SUBS) c.subAttributes[s] = Math.max(c.subAttributes[s] || 0, 6); // clear ability gates
    syncParentAttributes(c);
    ensureCodex(c); ensureCharacterStyle(c);
    c.grantsVersion = 1; c.reconcileVersion = topReconcileVersion("character");
    if (!profile.charactersPlayed.includes(c.id)) profile.charactersPlayed.push(c.id);
    saveProfile(profile);
  }
  c.skillPoints = Math.max(c.skillPoints || 0, 3);          // always enough points to spend/rank
  c.pendingSubPoints = Math.max(c.pendingSubPoints || 0, 2);
  c.energy = c.maxEnergy; c.health = c.maxHealth;
  character = c;
  saveCharacter(character);
  return character;
}

/** DEV: seed a GROWN (generated) entity into the active character so the codex Keep/nominate flow
 *  is testable offline (reuses the real generate path with a fake author). Returns its id. */
async function seedGrownEntity() {
  const loc = hereNow();
  const fake = () => async () => ({ name: "Test Grown Warden", role: "a figure grown for the Keep test", spectrum: loc.spectrum || {}, fears: "being forgotten", wants: "to matter", homeLocation: loc.id });
  const rec = await generate("npc", {
    character, location: loc, day: readClock(character.clock).day, rating: ratingCeilingNow(),
    known: { authored: CONTENT.npcs, generated: character.generated?.npc || {} }, genBudget: 5
  }, { callJSON: fake(), schema: CONTENT.genSchemas?.npc || {}, applyCodexUpdates, codexCtx: { locationId: loc.id }, ...genContractDeps() });
  if (rec?._gen) {
    recordAttention(rec, "keep", readClock(character.clock).day); // → established, so it's clearly grown
    saveCharacter(character);
    return rec.id;
  }
  return null;
}

// ---------- SNG-247: TRY EACH KIND (dev) ----------
// Erik: "update the test encounters so I can try each of the new updates." One button per frame kind, each in its
// own hue. Deliberately minted from the LIVE POOL rather than from synthetic defs — the authored standoffs and
// puzzles only became reachable this build, so testing the real content is what actually proves the promotion.
const KIND_TRY = [
  { kind: "fight",    icon: "⚔",  label: "A fight",     watch: "the contest panel: sense → action → bonus, the pre-clamp roll breakdown, braids" },
  { kind: "chase",    icon: "🏃", label: "A chase",     watch: "the MORPH line naming what it was, a Distance meter, losing costs wind not blood" },
  { kind: "standoff", icon: "🗣", label: "A standoff",  watch: "Their Resolve as the meter — and it cannot hurt you, however badly it goes" },
  { kind: "puzzle",   icon: "🧩", label: "A sealed thing", watch: "the sense step IS the game: win the read and a layer gives; the door never chooses" },
  { kind: "hazard",   icon: "⚠",  label: "Hard ground", watch: "deliberately the FAST one — a short brutal crossing, not a five-step turn" },
];

/** SNG-247 (dev): mint and enter one encounter of the given frame KIND, from the live pool where possible. */
function fireEncounterKind(kind) {
  ensureTestCharacter();
  const pool = encounterTable()?.encounters || [];
  const pick = pred => pool.find(pred) || null;
  let def = null, note = "";

  if (kind === "standoff" || kind === "puzzle") {
    const entry = pick(e => e.kind === kind) || pick(e => kind === "standoff" && e.routing === "opposed");
    if (entry) { def = kind === "standoff" ? synthesizeStandoffDef(entry) : synthesizePuzzleDef(entry); note = entry.id; }
  } else if (kind === "hazard") {
    const entry = pick(e => e.routing === "challenge" && !e.kind && e.flavor !== "chase");
    if (entry) { def = synthesizeChallengeDef(entry); note = entry.id; }
  } else { // fight, and the fight a chase is built FROM
    const entry = pick(e => e.routing === "duel") || pick(e => /^beast_/.test(e.id));
    if (entry) { def = synthesizeDuelDef(entry); note = entry.id; }
  }
  if (!def) { renderPlay(character.activeScene?.lastTurn || null, { aside: `🔧 No pooled encounter found for kind "${kind}".` }); return; }

  // A CHASE is entered the way the game enters one — by breaking from a fight — so this exercises the real chain
  // (chaseFromFight + the pursuer's sheet + the morph stamp), not a shortcut that only looks like it.
  if (kind === "chase") { beginChaseFromFight(def); return; }

  const oppSheet = contestSheetFor(def);
  character.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
  character.customEncounters = character.customEncounters || {};
  character.customEncounters[def.id] = def;   // the round path resolves the def by id
  saveCharacter(character);
  const k = KIND_TRY.find(x => x.kind === kind);
  renderPlay(character.activeScene?.lastTurn || null, {
    aside: `${k?.icon || "🔧"} ${esc(def.name)} — ${esc(kind)}${note ? ` (${esc(note)})` : ""}. Watch for: ${esc(k?.watch || "")}`,
  });
}

const LEG_RUNNERS = {
  openSkillPicker: () => {
    // "spend 2 skill points / take a cross-class ability" — grant the points so it's runnable
    ensureTestCharacter();
    character.skillPoints = Math.max(character.skillPoints || 0, 2);
    saveCharacter(character);
    renderCharacterScreen();
  },
  openCodex: async () => {
    ensureTestCharacter();
    const id = await seedGrownEntity();
    renderCodexScreen("", id || null);
  },
  setupSkill: (f) => {
    // grant the skill at the requested rank so the fork/rank-up is one click away
    ensureTestCharacter();
    const id = f.skill || "prism_sight";
    if (CONTENT.abilities[id] && !character.abilities.some(a => a.abilityId === id)) {
      character.abilities.push({ abilityId: id, level: Math.max(1, f.atRank || 2) });
    } else { const owned = character.abilities.find(a => a.abilityId === id); if (owned) owned.level = Math.max(owned.level, f.atRank || 2); }
    character.skillPoints = Math.max(character.skillPoints || 0, 3);
    saveCharacter(character);
    renderCharacterScreen();
  },
  setRating: (f) => {
    const target = (f.cycle && f.cycle[0]) || f.preset || "R+";
    if (RATING_LEVEL[target] >= RATING_LEVEL["R"]) { profile.rating = profile.rating || {}; profile.rating.adultVerified = true; }
    const rv = setRating(profile, target, { authority: "erik", adultGate: true });
    saveProfile(profile);
    renderSettings(rv.ok ? `🔧 Test: ceiling set to ${target}. ${f.cycle ? "Re-run to cycle to " + f.cycle.slice(1).join(" / ") + "." : ""}` : "Rating unchanged — " + rv.reason);
  },
  travelToDisposition: () => {
    ensureTestCharacter();
    // travel to the most strongly-charged (tilted) known location, preferring a reachable one
    const charge = l => Math.max(0, ...Object.values(l.poleIntensity || {}).map(v => Math.abs(v)), 0);
    const here = character.currentLocationId;
    const conn = new Set(CONTENT.locations[here]?.connections || []);
    const cands = Object.values(CONTENT.locations).filter(l => l.id !== here).sort((a, b) => charge(b) - charge(a));
    const pick = cands.find(l => conn.has(l.id)) || cands[0];
    if (pick) travelTo(pick.id); else renderPlay(character.activeScene?.lastTurn || null, { aside: "🔧 No charged location found to travel to." });
  },
  enterPlanApt: () => {
    // "set up a gambit so I can run it" — open the builder PRE-FILLED with a runnable plan
    ensureTestCharacter();
    gambitDraft = {
      goal: "get past the sealed array-office door and out with the ledger",
      steps: [
        { text: "scout the corridor for the guard's rounds", fallback: "wait in the alcove until they pass" },
        { text: "pick or force the office lock", fallback: "slip in behind the clerk on their next trip" },
        { text: "take the ledger and leave the way you came", fallback: "go out the window onto the ledge" }
      ],
      assessed: null
    };
    renderGambitBuilder("🔧 Test plan loaded — hit Assess plan (needs an API key), then Run it.");
  },
  timeAction: (f) => { ensureTestCharacter(); rest(f.action === "breather" ? "breather" : "sleep"); },
  generateHere: () => {
    ensureTestCharacter();
    // synthesize a GM generate request so the world grows here now (reuses the real path)
    const type = "location";
    handleGenerateRequests({ generateRequest: [{ type, hint: "a place just past the edge of the known", why: "dev test: force a generation" }] })
      .then(grown => renderPlay(character.activeScene?.lastTurn || null, { aside: grown.length ? `🔧 Generated: ${grown.map(g => g.name).join(", ")} — revisit to confirm it persists.` : "🔧 Nothing minted (governor or reuse, or needs an API key) — try again or move to an unauthored edge." }))
      .catch(() => renderPlay(character.activeScene?.lastTurn || null, { aside: "🔧 Generation failed (needs an API key)." }));
  },
  jumpClock: async (f) => {
    ensureTestCharacter();
    // DEV-ONLY: shift the shared world epoch earlier so the absolute world-day jumps forward N,
    // then run the tick so offscreen advancement / away-digest apply. Reversible via re-setting.
    const days = Math.max(1, f.advanceWorldDays || f.days || 1);
    const ep = getWorldEpoch();
    setWorldEpoch({ atMs: ep.atMs - days * 86400000, worldDay: ep.worldDay, rate: ep.rate });
    const news = await maybeTick();
    renderPlay(character.activeScene?.lastTurn || null, { newsFlash: news, aside: `🔧 DEV: advanced the shared clock +${days} day(s) → the Kept Count now stands at ${worldCount()}. Return to play to see what advanced.` });
  },
  portraitBeat: () => {
    ensureTestCharacter();
    if (!imagesEnabled()) { renderSettings("🔧 Turn on Scene & item art → Generate first, then run this leg."); return; }
    ensureCharacterPortrait(character, { force: true, milestone: `test v${APP_VERSION}` });
    saveCharacter(character);
    renderGallery();
  },
  grantTestState: () => {
    ensureTestCharacter();
    // a quest in progress + two duplicate-named items, so the resolver/quest-log leg is reachable
    character.quests = character.quests || [];
    if (!character.quests.some(q => q.id === "dev-test-quest")) character.quests.push({ id: "dev-test-quest", title: "A Test Errand", status: "active", summary: "Dev-seeded quest to verify progress→complete.", progress: ["begun"] });
    try { addItem(character, "dried_rations", CONTENT.items); addItem(character, "dried_rations", CONTENT.items); } catch { /* catalog id may differ */ }
    saveCharacter(character);
    renderCharacterScreen();
  },
  selectCharacter: (f) => {
    // play as a named character if it exists, else fall back to the dev test hero
    const who = f.who;
    const found = who && listCharacters().find(e => (e.name || "").toLowerCase().includes(String(who).toLowerCase()));
    if (found) { character = loadCharacter(found.id); saveCharacter(character); }
    else ensureTestCharacter();
    renderCharacterScreen();
  },
  openRomanceScene: async () => {
    // ROMANCE leg (the one surface neither CCode nor Aevi can prove — needs a live model): set the
    // ceiling to R and open a scene with a romance-open NPC so a flirt is one line away. The leg
    // auto-marks ✓ the moment the flirt is tagged `romantic` and the guidance doc loads (see runGM).
    ensureTestCharacter();
    profile.rating = profile.rating || {}; profile.rating.adultVerified = true;
    setRating(profile, "R", { authority: "erik", adultGate: true });
    saveProfile(profile);
    await startScene(
      "(Romance test scene. The character is sharing a quiet, unhurried moment with someone they've been growing close to — introduce a warm, present NPC of this place who is clearly at ease with the character and open to them: a held glance, a nearness neither moved to create. Set it so a flirtatious or tender action is a natural next beat. Offer choices, but leave the room for the player to speak or act freely.)",
      [],
      "🔧 Romance leg — ceiling set to R. Flirt with the NPC: type an attraction or flirtation line freely. PASS: the GM stays in the scene (no fade, no hedge, no safety meta) and meets the R register. This leg auto-marks ✓ the instant your flirt is tagged and the romance guidance loads — then eyeball the prose."
    );
  },
  fireTestEncounter: (f) => {
    // SNG-236 UX: start a real encounter def DIRECTLY (no GM/API needed) so the integrated strip + the ⚙ Moves
    // gear render immediately for verification. PREFERS a CLASSIC-frame encounter (challenge/puzzle, or a
    // non-skill-battle duel) — those use the SNG-236 strip + gear; a skill-battle duel takes its own richer
    // contest panel instead (which is correct, but not what this leg verifies).
    ensureTestCharacter();
    const defs = Object.values(CONTENT.encounters || {});
    const sb = d => !!(CONTENT.skillBattle?.engine && d.type === "duel" && d.skillBattle !== false);
    const classic = defs.filter(d => d.type === "challenge" || d.type === "puzzle" || (d.type === "duel" && !sb(d)));
    const wanted = f?.kind;
    const def = (wanted && classic.find(d => d.type === wanted)) || classic.find(d => d.type === "challenge") || classic[0] || defs[0];
    if (!def) { renderPlay(character.activeScene?.lastTurn || null, { aside: "🔧 No authored encounter def found to start." }); return; }
    const oppSheet = contestSheetFor(def);   // SNG-247: one place decides the other side (duel -> foe, puzzle -> static)
    const isSB = !!oppSheet;
    character.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
    saveCharacter(character);
    if (isSB) { renderSkillBattle(); return; }
    renderPlay(character.activeScene?.lastTurn || null, { aside: `🔧 Test encounter "${def.name}" (${def.type}) started. The integrated STRIP is at the top of the play surface; tap ⚙ Moves for the grouped ward/sense/strike gear, or type a move — the encounter rules bind either way.` });
  }
};

/** Run a preview leg's forced scenario (dev-only). Every character-needing runner self-provisions
 *  the dev test hero (ensureTestCharacter), so nothing is blocked on there being an active save. */
function runPreviewLeg(leg) {
  const f = leg?.force;
  const intent = f && f.intent;
  const runner = intent && LEG_RUNNERS[intent];
  if (!runner) return; // manual / unknown — no-op (button wasn't rendered as runnable)
  try { runner(f); } catch (err) { alert("Couldn't run this scenario: " + (err?.message || err)); }
}

// ---------- SNG-066: feedback / bug report with auto-captured context ----------
// The value is the FORENSICS, not the text box: a one-click report arrives with the version,
// screen, character, location, last GM turn, last action and any errors already attached, so a
// 5-minute archaeology dig becomes a one-tap report. Append-only to the repo; never lose one.

/** Gather the forensic context. Redacts credentials — never dumps the config object. */
function buildFeedbackContext() {
  const ctx = { appVersion: APP_VERSION, at: new Date().toISOString(), screen: _feedbackScreenLabel() };
  try { ctx.worldDay = absoluteWorldDay(); } catch { /* pre-boot */ }
  if (typeof character !== "undefined" && character) {
    ctx.character = { id: character.id, name: character.name, level: character.level, origin: character.origin, nativeTradition: character.nativeTradition || null, domains: character.domains || null, background: character.background };
    ctx.location = (() => { const l = CONTENT.locations?.[character.currentLocationId]; return { id: character.currentLocationId, name: l?.name || null, regionId: l?.regionId || null }; })();
    const activeQuests = (character.quests || []).filter(q => q.status === "active").map(q => q.title || q.id);
    if (activeQuests.length) ctx.activeQuests = activeQuests;
    ctx.journeyDay = (() => { try { return readClock(character.clock).day; } catch { return null; } })();
    // SNG-179 §4.4: attach what the OPS actually did. A report that says "the teacher never
    // registered" is a mystery; one that says markTeacher was rejected 3× on an unknown traditionId
    // is a diagnosis. Never-emitted and emitted-but-rejected are the two cases the cause turns on.
    if (character._opLedger && Object.keys(character._opLedger).length) ctx.opLedger = character._opLedger;
    if (character._opVocabMisses?.length) ctx.opVocabMisses = character._opVocabMisses;
  }
  if (typeof sceneState !== "undefined" && sceneState?.setting) ctx.scene = String(sceneState.setting).slice(0, 200);
  const lastTurn = (typeof sceneTurns !== "undefined" && sceneTurns.length) ? sceneTurns[sceneTurns.length - 1] : (character?.activeScene?.lastTurn || null);
  if (lastTurn) ctx.lastGmTurn = smartClamp(lastTurn.summary || lastTurn.narration || "", 400);
  if (lastPlayerAction) ctx.lastAction = String(lastPlayerAction).slice(0, 160);
  if (_capturedErrors.length) ctx.errors = _capturedErrors.slice(-5);
  if (character?._turnApplyError) ctx.turnApplyError = character._turnApplyError; // CCODE-07: a swallowed-render event travels with the report
  // SNG-186 §3.2: a bug report must declare its dev provenance. Dev mode being ON at all is
  // load-bearing triage context — the workbench may have staged encounters, minted entities, or set
  // state — and a report that hides it wastes everyone's time. Mutating levers append to
  // character._devActions (a visible ledger); the flag rides here whether or not any lever was pulled.
  if (isDevMode()) ctx.devMode = true;
  if (character?._devActions?.length) ctx.devActions = character._devActions.slice(-12);
  return ctx;
}
function _feedbackScreenLabel() {
  const h = document.querySelector(".screen h2, .play .location-tag, .topbar h1");
  const inPlay = !!document.querySelector(".play");
  return (inPlay ? "play" : (document.querySelector(".screen h2")?.textContent || "app")).slice(0, 60);
}
function feedbackQueue() { try { return JSON.parse(localStorage.getItem("singularity.feedbackQueue") || "[]"); } catch { return []; } }
function saveFeedbackQueue(q) { try { localStorage.setItem("singularity.feedbackQueue", JSON.stringify(q.slice(-50))); } catch { /* ignore */ } }

/** Push one entry (+ any queued) to the repo, append-only, SHA-retry. Returns {ok, id, queued}. */
async function submitFeedback(entry) {
  const pending = [...feedbackQueue(), entry];
  if (!syncEnabled()) { saveFeedbackQueue(pending); return { ok: false, queued: true, id: entry.id }; }
  const day = String(entry.at || entry.context?.at || new Date().toISOString()).slice(0, 10); // SNG-115: never throw on a missing `at`
  try {
    await pushMergedFile(`po/feedback/${day}.json`, remote => {
      const entries = [...(remote?.entries || [])];
      for (const e of pending) if (!entries.some(x => x.id === e.id)) entries.push(e);
      return { schemaVersion: 1, day, entries };
    }, `feedback: ${entry.type} from ${entry.context?.character?.name || "a player"} (${pending.length})`);
    saveFeedbackQueue([]); // flushed
    return { ok: true, id: entry.id, flushed: pending.length };
  } catch (err) {
    saveFeedbackQueue(pending); // never lose it
    return { ok: false, queued: true, id: entry.id, error: err?.message };
  }
}

let _feedbackType = "bug";
function openFeedback() {
  const ctx = buildFeedbackContext();
  const TYPES = [["bug", "🐛 Bug"], ["idea", "💡 Idea"], ["feel", "🤔 Felt off"]];
  const q = feedbackQueue().length;
  chrome(`<div class="screen" style="max-width:560px">
    <h2>⚑ Feedback</h2>
    <p class="hint" style="margin-bottom:10px">One tap, one sentence. Your version, where you are, your character and the last beat attach automatically — Aevi reads it without asking a single follow-up.</p>
    <div class="fb-types">${TYPES.map(([id, label]) => `<button class="fb-type ${id === _feedbackType ? "on" : ""}" data-fbtype="${id}">${label}</button>`).join("")}</div>
    <div class="field" style="margin-top:10px"><label>What happened, or what felt off?</label>
      <textarea id="fb-text" rows="4" style="width:100%" placeholder="e.g. the header said Harmonic Heights but I was in the Disputed Zone"></textarea></div>
    <details class="fb-context"><summary>What will be attached (${Object.keys(ctx).length} fields)</summary>
      <pre class="fb-context-pre">${esc(JSON.stringify(ctx, null, 2))}</pre></details>
    ${!syncEnabled() ? `<div class="hint">⚠️ Sync is off — this will be SAVED and sent the next time sync is on (nothing is lost).</div>` : ""}
    ${q ? `<div class="hint">${q} earlier report${q === 1 ? "" : "s"} waiting to send — they'll flush with this one.</div>` : ""}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn" id="fb-send">Send</button>
      <button class="btn secondary" id="fb-cancel">Cancel</button>
    </div>
    <div class="hint" id="fb-status" style="margin-top:8px"></div>
  </div>`);
  for (const b of app.querySelectorAll("[data-fbtype]")) b.onclick = () => { _feedbackType = b.dataset.fbtype; openFeedback(); };
  document.getElementById("fb-cancel").onclick = () => { if (character && character.activeScene) enterPlay(); else renderRoster(); };
  document.getElementById("fb-send").onclick = async () => {
    const text = document.getElementById("fb-text").value.trim();
    const status = document.getElementById("fb-status");
    const btn = document.getElementById("fb-send");
    // SNG-115: `at` on the entry itself (submitFeedback dates the file from it) — its absence was a silent throw.
    const entry = { id: "fb-" + Date.now().toString(36), at: new Date().toISOString(), type: _feedbackType, text: text.slice(0, 2000), player: profile?.displayName || null, context: buildFeedbackContext() };
    status.textContent = "Sending…";
    btn.disabled = true;
    try {
      // SNG-115: race the submit against a UI deadline so the status ALWAYS reaches a terminal state — even
      // if something below misbehaves. On the UI timeout the entry is still queued locally (never lost).
      const r = await raceTimeout(submitFeedback(entry), 15000, "UI_TIMEOUT").catch(err => {
        if (err?.message === "UI_TIMEOUT") { const q = feedbackQueue(); if (!q.some(e => e.id === entry.id)) saveFeedbackQueue([...q, entry]); return { queued: true, id: entry.id, error: "timeout" }; }
        throw err;
      });
      if (r.ok) status.textContent = `✓ Sent — thank you. Entry ${r.id}${r.flushed > 1 ? ` (+${r.flushed - 1} queued)` : ""}. Aevi will see it at session-open.`;
      else if (r.queued) status.textContent = `✓ Saved as ${r.id}${syncEnabled() ? " — the send didn't finish, it will retry next time" : " — will send when sync is on"}. Nothing is lost.`;
      else status.textContent = "Couldn't save that — try again.";
    } catch (err) {
      const q = feedbackQueue(); if (!q.some(e => e.id === entry.id)) saveFeedbackQueue([...q, entry]); // never lose it, whatever failed
      status.textContent = `✓ Saved as ${entry.id} — something went wrong sending, but it's kept and will retry. Nothing is lost.`;
    } finally {
      btn.disabled = false;
    }
  };
}

/** Flush any queued feedback when sync is available (called at boot / on enter-play). */
async function flushFeedbackQueue() {
  if (!syncEnabled() || !feedbackQueue().length) return;
  const q = feedbackQueue();
  try { const r = await submitFeedback(q[q.length - 1]); if (r.ok) { /* submitFeedback flushes all */ } } catch { /* keep queued */ }
}

async function renderPreviewLegs() {
  if (!_previewLegsData) {
    try {
      const res = await fetch(`data/preview_legs.json?cb=${Date.now()}`);
      _previewLegsData = res.ok ? await res.json() : { legs: [] };
    } catch { _previewLegsData = { legs: [] }; }
  }
  const legs = _previewLegsData.legs || [];
  const status = loadLegStatus();
  // A leg CLEARS (drops out of the active checklist) once its verification is reported back to
  // Aevi (status[id].reported) OR Aevi has marked it closed in the data file (l.closed / top-level
  // closed[]). Everything else stays active.
  const closedIds = new Set([...(_previewLegsData.closed || []), ...legs.filter(l => l.closed === true).map(l => l.id)]);
  const isCleared = l => !!status[l.id]?.reported || closedIds.has(l.id);
  const active = legs.filter(l => !isCleared(l));
  const cleared = legs.filter(isCleared);
  const verifiedActive = active.filter(l => status[l.id]?.status === "pass").length;
  // group ACTIVE by mode → batch
  const byMode = {};
  for (const l of active) (byMode[l.mode] = byMode[l.mode] || []).push(l);
  const MODE_LABEL = { solo: "Solo (play anytime)", "cross-player": "Cross-player (needs sync on two profiles)" };

  const legRow = (l) => {
    const st = status[l.id]?.status || "untried";
    const auto = st === "pass" && status[l.id]?.auto ? ` <span class="leg-auto" title="${esc(status[l.id]?.note || "auto-detected in play")}">auto ✓</span>` : "";
    // SNG-051 addendum: a leg with a resolvable force intent gets a ▶ Run button; a null/manual
    // force (cross-player, or a leg needing two characters) is labelled manual, no button.
    const intent = l.force && l.force.intent;
    const runnable = intent && LEG_RUNNERS[intent];
    const runCtl = intent
      ? `<button class="leg-run" data-legrun="${esc(l.id)}">▶ Run this scenario</button>`
      : (l.force === null && l.mode === "cross-player") ? `<span class="leg-manual">manual — needs two synced profiles</span>`
      : (l.force && l.force.manual) ? `<span class="leg-manual">manual — ${esc(l.force.manual)}</span>` : "";
    const runDisabled = intent && !runnable ? ` <span class="leg-manual" title="the runner doesn't know '${esc(intent)}' yet">(unsupported intent)</span>` : "";
    return `<div class="leg-row leg-${st}">
      <div class="leg-head"><span class="leg-batch">${esc(l.batch)}</span> <strong>${esc(l.title)}</strong>${auto}</div>
      <div class="leg-do"><em>Do:</em> ${esc(l.do)}</div>
      <div class="leg-pass"><em>Pass:</em> ${esc(l.pass)}</div>
      <div class="leg-status-row">${LEG_STATUS.map(s => `<button class="leg-btn ${st === s ? "on" : ""}" data-leg="${esc(l.id)}" data-status="${s}">${LEG_STATUS_LABEL[s]}</button>`).join("")}${runCtl}${runDisabled}</div>
      <input class="leg-note" data-legnote="${esc(l.id)}" placeholder="note (optional)…" value="${esc(status[l.id]?.note || "")}">
    </div>`;
  };

  chrome(`<div class="screen" style="max-width:820px">
    <h2>🧪 Preview Legs <span class="hint" style="text-transform:none">— ${verifiedActive} of ${active.length} left${cleared.length ? ` · ${cleared.length} cleared` : ""}${_previewLegsData.buildVersion ? ` · data for v${esc(_previewLegsData.buildVersion)}` : ""}</span></h2>
    <div class="cs-block">
      <h3 class="codex-title" style="font-size:15px">Try each kind <span class="hint" style="text-transform:none">— SNG-247: five kinds, five colours, five exit rules</span></h3>
      <p class="hint" style="margin-bottom:8px">Each starts a real encounter of that kind, minted from the LIVE pool — so these are the authored standoffs and puzzles that only became reachable this build, not stand-ins. The button's border is the colour its frame will fly.</p>
      <div class="kind-try-row">${KIND_TRY.map(k => `<button class="kind-try enc-kind-${k.kind}" data-firekind="${k.kind}" title="${esc(k.watch)}">
        <span class="kind-try-name">${k.icon} ${esc(k.label)}</span>
        <span class="kind-try-watch">${esc(k.watch)}</span></button>`).join("")}</div>
    </div>
    <p class="hint" style="margin-bottom:12px">Legs auto-mark <strong>auto ✓</strong> when their moment happens in play${syncEnabled() ? " and report to Aevi automatically" : ""}. A leg drops out once it's verified back to Aevi (or Aevi closes it). Data authored by Aevi (<code>data/preview_legs.json</code>).</p>
    ${(() => {
      // flag a REAL lag (≥8 builds behind), not a single patch bump — the exact-equality check nagged every bump
      const parse = v => { const m = String(v || "").match(/(\d+)\.(\d+)\.(\d+)/); return m ? (+m[1]) * 1000000 + (+m[2]) * 1000 + (+m[3]) : null; };
      const d = parse(_previewLegsData.buildVersion), a = parse(APP_VERSION);
      const gap = (d != null && a != null) ? a - d : 0;
      return gap >= 8 ? `<div class="leg-stale">⚠ The checklist data is authored for <strong>v${esc(_previewLegsData.buildVersion)}</strong> — the app is now <strong>v${esc(APP_VERSION)}</strong> (${gap} builds on). Older legs still verify their (still-live) features, but the newest builds may not be covered — Aevi refreshes this file.</div>` : "";
    })()}
    ${active.length ? Object.keys(byMode).map(mode => `
      <div class="cs-block"><h3 class="codex-title" style="font-size:15px">${esc(MODE_LABEL[mode] || mode)}</h3>
      ${byMode[mode].map(legRow).join("")}</div>`).join("")
      : "<div class='insight'>🎉 Nothing left in this checklist — every leg is verified &amp; reported to Aevi.</div>"}
    ${cleared.length ? `<details class="cs-block"><summary class="codex-title" style="font-size:15px; cursor:pointer">✓ ${cleared.length} cleared — verified &amp; reported to Aevi</summary>
      ${cleared.map(l => `<div class="leg-cleared"><span class="leg-batch">${esc(l.batch)}</span> ${esc(l.title)} <span class="hint">${closedIds.has(l.id) ? "closed by Aevi" : "reported"}${status[l.id]?.note ? " · " + esc(status[l.id].note) : ""}</span></div>`).join("")}</details>` : ""}
    <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap">
      <button class="btn secondary" id="legs-copy">Copy summary for Aevi</button>
      <button class="btn secondary" id="legs-back">Back</button>
    </div>
    <div class="hint" id="legs-copied" style="margin-top:8px"></div>
  </div>`);

  // SNG-247 (Erik): one button per frame kind, wired straight to the real mint-and-enter path.
  for (const b of app.querySelectorAll("[data-firekind]")) b.onclick = () => fireEncounterKind(b.dataset.firekind);

  for (const b of app.querySelectorAll("[data-leg]")) b.onclick = () => {
    const map = loadLegStatus();
    const id = b.dataset.leg;
    map[id] = { ...(map[id] || {}), status: b.dataset.status };
    saveLegStatus(map);
    renderPreviewLegs();
  };
  for (const inp of app.querySelectorAll("[data-legnote]")) inp.onchange = () => {
    const map = loadLegStatus();
    const id = inp.dataset.legnote;
    map[id] = { ...(map[id] || {}), note: inp.value.slice(0, 300) };
    saveLegStatus(map);
  };
  for (const b of app.querySelectorAll("[data-legrun]")) b.onclick = () => {
    const leg = legs.find(l => l.id === b.dataset.legrun);
    if (leg) runPreviewLeg(leg);
  };
  document.getElementById("legs-copy").onclick = async () => {
    const map = loadLegStatus();
    const lines = legs.map(l => { const s = map[l.id] || {}; return `- [${(s.status || "untried").toUpperCase()}] ${l.batch} · ${l.title}${s.note ? ` — ${s.note}` : ""}`; });
    const summary = `Preview legs (${verified}/${legs.length} pass) — build data v${_previewLegsData.buildVersion || "?"}\n${lines.join("\n")}`;
    try { await navigator.clipboard.writeText(summary); document.getElementById("legs-copied").textContent = "Copied to clipboard."; }
    catch { document.getElementById("legs-copied").textContent = summary; }
  };
  document.getElementById("legs-back").onclick = () => renderRoster();
}

// ---------- SNG-186 §2f: see the machine ----------

/** SNG-186 §3.2: every dev action is marked on the save, visibly — it rides into feedback reports
 *  (the ctx.devActions line), so a bug report from a hand-edited save can never hide that it was touched. */
function markDevAction(reason) {
  if (!character) return;
  const text = String(reason).slice(0, 120); // prose-cap-ok: engine-authored dev-action label, not model prose
  character._devActions = [...(character._devActions || []), { at: new Date().toISOString(), reason: text }].slice(-20);
}

/** SNG-186 §2a: GO ANYWHERE — jump the character to ANY location by id or name, ignoring connections,
 *  waygates and travel time (including places no path reaches — a class of bug this finds). §3.3: the
 *  jump writes through the SAME fields play's move path uses (currentLocationId, knownPlaces, place
 *  visit, perception) — it exercises the real engine, never a dev-only shadow. Clears the active scene
 *  so play resumes FRESH at the new place instead of replaying the old one. */
function devJumpTo(ref) {
  const id = resolveLocationId(ref, CONTENT.locations) || (CONTENT.locations[ref] ? ref : null);
  if (!id || !CONTENT.locations[id]) return { ok: false, msg: `no location matches "${ref}"` };
  const day = (() => { try { return readClock(character.clock).day; } catch { return null; } })();
  character.currentLocationId = id;
  addKnownPlace(id);
  try { notePlaceVisit(character, id, day, CONTENT.locations[id]?.name); } catch { /* convenience */ }
  try { notePerception(character, id, CONTENT.locations[id], { visited: true, usedAbilityIds: [] }, CONTENT.rules); } catch { /* convenience */ }
  try { ensureLocationImage(id); } catch { /* art never blocks */ }
  character.activeScene = null; sceneTurns = []; sceneState = null; // land fresh at the new place
  markDevAction(`jumped to ${CONTENT.locations[id].name} (${id})`);
  saveCharacter(character);
  return { ok: true, id, msg: `Now at ${CONTENT.locations[id].name}` };
}

/** SNG-186 §2b: KNOW EVERYTHING — mark every location known, so the GM's recall and the map treat the
 *  whole atlas as reachable-known. This is the live blocker Erik hit: a dev character could not reach a
 *  real place to test. Locations are the axis he hit; fuller omniscience (NPCs/codex/traditions) is a
 *  further increment on the same lever. */
function devKnowEverything() {
  character.knownPlaces = Object.keys(CONTENT.locations || {});
  markDevAction(`know everything: all ${character.knownPlaces.length} locations revealed`);
  saveCharacter(character);
}

/** SNG-186 §2b, the inverse that matters MORE: reset knowledge to just where you stand, so retrieval
 *  bugs (SNG-176) that only appear from IGNORANCE can be reproduced — a tester who knows everything
 *  never can. */
function devKnowNothing() {
  character.knownPlaces = character.currentLocationId ? [character.currentLocationId] : [];
  markDevAction("know nothing: knowledge reset to the current location only");
  saveCharacter(character);
}

/** The dev workbench's highest-value lever: the assembled prompt, raw model response, parsed result
 *  and which ops fired for the last two-dozen model calls this session — the by-hand SNG-179
 *  diagnosis (read the prompt, read the raw output, see what the engine did with it) made a standing
 *  button. Dev-only; captures live in memory for the session (armed at boot only under isDevMode()). */
/** SNG-242: the in-play world-tick model — a per-browser dev/cost switch (the offscreen "while you were away"
 *  tick, never player-read prose). Returns a model override for advanceGeneratedOffscreen, or null = task-default (Sonnet). */
function worldTickModel() {
  try { return localStorage.getItem("singularity.worldTickModel") === "haiku" ? MODELS.haiku : null; } catch { return null; }
}

/** SNG-242: run the world-tick A/B — the SAME offscreen batch through Sonnet AND Haiku, side by side. */
async function runWorldTickAB() {
  const out = document.getElementById("mach-ab-out"), btn = document.getElementById("mach-wt-ab");
  if (!getApiKey()) { if (out) out.innerHTML = `<div class="insight">Add your API key in Settings first — the A/B makes two real model calls.</div>`; return; }
  if (btn) { btn.disabled = true; btn.textContent = "Running both models…"; }
  try {
    const res = await worldTickABCompare({ character, content: CONTENT, models: [MODELS.sonnet, MODELS.haiku] });
    if (!res.batch.length) { if (out) out.innerHTML = `<div class="insight">No offscreen figures to tick right now — meet some people or grow the world, then A/B. (The tick advances people you've met + figures you've heard of + your grown places.)</div>`; return; }
    const label = m => m === MODELS.haiku ? "Haiku" : m === MODELS.sonnet ? "Sonnet" : String(m);
    const nameOf = id => (res.batch.find(b => b.id === id) || {}).name || id;
    const col = run => `<div class="mach-ab-col"><div class="mach-ab-h">${esc(label(run.model))} <span class="hint">· ${run.ms}ms</span></div>${run.error ? `<div class="insight">error: ${esc(run.error)}</div>` : (run.developments.length ? run.developments.map(d => `<div class="codex-fact"><strong>${esc(nameOf(d.entityId))}</strong> <span class="cost">${esc(d.outcome || "?")}</span><div>${esc(d.note || "")}</div></div>`).join("") : "<div class='insight'>(no developments this run)</div>")}</div>`;
    out.innerHTML = `<div class="hint" style="margin:8px 0 4px">Same ${res.batch.length} offscreen figure(s), both models — the only variable is the model. (Per-call tokens + latency also land in the call cards below.)</div><div class="mach-ab-grid">${res.runs.map(col).join("")}</div>`;
  } catch (e) { if (out) out.innerHTML = `<div class="insight">A/B failed: ${esc(e?.message || "error")}</div>`; }
  finally { if (btn) { btn.disabled = false; btn.textContent = "⚖ Run world-tick: Sonnet vs Haiku (same input)"; } }
}

function renderMachine() {
  const caps = devCaptures();
  const ledger = character?._opLedger || {};
  const emitted = character?._opEmitted || {};
  // SNG-190 §3, THE FALSE-ZERO FIX. EMISSION (the model putting an op in a turn) is counted for EVERY
  // op, every turn, in runGM. APPLIED/REJECTED outcome is instrumented for ONLY these. The panel must
  // never again render an un-instrumented op's absence as "NEVER FIRED" — that was the bug: 31 emitted
  // ops shown as never-fired directly above an exchange that emitted six of them. Presence in THIS
  // session's captures is also ground truth it fired, folded in so an op shown emitted in a card below
  // can never read as "not emitted" above it — even before the cumulative counter has accrued here.
  const seenInCaptures = new Set();
  for (const c of caps) for (const o of (c.opsFired || [])) seenInCaptures.add(o.op);
  const turns = character?._opTurns || caps.filter(c => c.parsed).length;
  const isEmitted = op => (emitted[op] || 0) > 0 || seenInCaptures.has(op);
  // SNG-195 G3: every op that writes an applied/rejected outcome via logOpOutcome must render its badge —
  // the set had drifted to markTeacher alone while four more ops (delegateOps/arcOps/adoptSchool/offer)
  // wrote outcome data the panel never showed. A smoke test now pins this set to the logOpOutcome callers.
  const OUTCOME_INSTRUMENTED = new Set(["markTeacher", "delegateOps", "arcOps", "adoptSchool", "offer"]);
  const vocab = [...new Set([...SALVAGEABLE_OPS, "sceneEnded", "gambitApt", ...Object.keys(ledger), ...Object.keys(emitted)])];
  const firedOps = vocab.filter(isEmitted).sort((a, b) => (emitted[b] || 0) - (emitted[a] || 0));
  const neverOps = vocab.filter(op => !isEmitted(op)).sort();

  const chip = (op) => {
    const e = emitted[op] || 0;
    const seen = e === 0 && seenInCaptures.has(op);
    const r = ledger[op];
    const cls = (e > 0 || seen) ? "mach-fired" : "mach-zero";
    // Applied/rejected is shown ONLY where it is actually instrumented; for every other op the number
    // is emission alone, and the hover says so rather than implying an engine outcome we never measured.
    const outcome = OUTCOME_INSTRUMENTED.has(op)
      ? ` <span class="mach-x" title="engine outcome — instrumented: applied${r?.rejected ? "/rejected" : ""}">✓${r?.applied || 0}${r?.rejected ? `✗${r.rejected}` : ""}</span>`
      : "";
    const tip = OUTCOME_INSTRUMENTED.has(op) ? "" : ` title="emission counted; applied/rejected NOT instrumented for this op — a 0 means not emitted, never 'rejected'"`;
    const count = e > 0 ? `<b>${e}</b>` : seen ? `<b title="seen in a captured exchange this session">seen</b>` : "<b>0</b>";
    return `<span class="mach-op ${cls}"${tip}>${esc(op)} ${count}${outcome}</span>`;
  };

  const promptText = (c) => {
    const sys = (c.system || []).map((b, i) => `━━ SYSTEM BLOCK ${i + 1}${b.cache_control ? " (cached)" : ""} ━━\n${b.text || ""}`).join("\n\n");
    const msgs = (c.messages || []).map(m => `━━ ${String(m.role || "user").toUpperCase()} ━━\n${typeof m.content === "string" ? m.content : JSON.stringify(m.content, null, 2)}`).join("\n\n");
    return [sys, msgs].filter(Boolean).join("\n\n");
  };
  const usageLine = (c) => {
    const u = c.usage || {};
    const bits = [];
    if (u.input_tokens != null) bits.push(`in ${u.input_tokens}`);
    if (u.output_tokens != null) bits.push(`out ${u.output_tokens}`);
    if (u.cache_read_input_tokens) bits.push(`cache ${u.cache_read_input_tokens}`);
    if (c.ms != null) bits.push(`${c.ms}ms`);
    if (c.stop_reason) bits.push(`stop:${c.stop_reason}`);
    return bits.join(" · ");
  };
  // SNG-236/237/238: the PROMPT LOAD made visible. The session's root finding is a saturated GM prompt
  // (a ~12.3k-token constitution + 28 pushed sections + 114 MUSTs); Fix D/SNG-238 trims it. This surfaces
  // WHERE the weight sits per call and which `##` sections actually fired THIS beat — the situational-vs-always
  // audit Fix D needs, and it makes the engine's per-beat directives (e.g. AN ENCOUNTER IS UPON YOU) visible.
  const TOK = s => Math.round((s || "").length / 4); // rough estimate (chars/4), consistent with the SNG-236 count
  const promptWeight = (c) => {
    const blocks = (c.system || []).map((b, i) => {
      const text = b.text || "";
      const sections = (text.match(/^#{1,6}\s+.+$/gm) || []).map(h => h.replace(/^#{1,6}\s+/, "").replace(/\s*[(—].*$/, "").trim().slice(0, 46)).filter(Boolean);
      return { i, cached: !!b.cache_control, tok: TOK(text), sections };
    });
    const msgTok = (c.messages || []).reduce((s, m) => s + TOK(typeof m.content === "string" ? m.content : JSON.stringify(m.content)), 0);
    const sysTok = blocks.reduce((s, b) => s + b.tok, 0);
    return { blocks, sysTok, msgTok, total: sysTok + msgTok, sectionCount: blocks.reduce((s, b) => s + b.sections.length, 0) };
  };
  // session average GM-prompt weight (calls with system blocks = the real GM turns, not sub-calls)
  const gmCalls = caps.filter(c => (c.system || []).length);
  const avgPromptTok = gmCalls.length ? Math.round(gmCalls.reduce((s, c) => s + promptWeight(c).total, 0) / gmCalls.length) : 0;
  const maxPromptTok = gmCalls.length ? Math.max(...gmCalls.map(c => promptWeight(c).total)) : 0;

  const card = (c) => `<details class="mach-card"${caps[0] === c ? " open" : ""}>
    <summary><span class="mach-task">${esc(c.task)}</span> <span class="hint">${esc(c.model)} · ${esc(usageLine(c))}${c.at ? " · " + esc(String(c.at).slice(11, 19)) : ""}</span></summary>
    ${c.opsFired?.length ? `<div class="mach-sec"><span class="mach-label">emitted</span> ${c.opsFired.map(o => `<span class="mach-op mach-fired">${esc(o.op)} <code>${esc(o.shape)}</code></span>`).join(" ")}</div>` : (c.parsed ? `<div class="mach-sec hint">no ops emitted — narration only</div>` : "")}
    ${(c.system || []).length ? (() => { const w = promptWeight(c); return `<details class="mach-inner"><summary>Prompt weight — <b>~${w.total} tok</b> (${w.sysTok} system / ${w.msgTok} turn) · ${w.sectionCount} sections across ${w.blocks.length} block${w.blocks.length === 1 ? "" : "s"}</summary><div class="mach-weight">${w.blocks.map(b => `<div class="mach-wblock"><span class="mach-wtok">~${b.tok} tok</span> <span class="hint">block ${b.i + 1}${b.cached ? " · cached" : ""} · ${b.sections.length} §</span>${b.sections.length ? `<div class="mach-wsecs">${b.sections.map(s => `<span class="mach-wsec">${esc(s)}</span>`).join("")}</div>` : ""}</div>`).join("")}<div class="hint" style="margin-top:6px">The heaviest block is the constant constitution+rules (cached); the situational sections are what varies per beat. SNG-238 (Fix D) trims the always-on load — a lower <b>system</b> number here is the goal.</div></div></details>`; })() : ""}
    <details class="mach-inner"><summary>Assembled prompt (${(c.system || []).length} block${(c.system || []).length === 1 ? "" : "s"} + ${(c.messages || []).length} msg)</summary><pre class="mach-pre">${esc(promptText(c))}</pre></details>
    <details class="mach-inner"><summary>Raw response (${(c.raw || "").length} chars)</summary><pre class="mach-pre">${esc(c.raw || "")}</pre></details>
    ${c.parsed ? `<details class="mach-inner"><summary>Parsed result</summary><pre class="mach-pre">${esc(JSON.stringify(c.parsed, null, 2))}</pre></details>` : ""}
    <button class="btn secondary mach-copy" data-mach-copy="${esc(c.id)}">Copy this exchange</button>
  </details>`;

  const totalLocs = Object.keys(CONTENT.locations || {}).length;
  const knownCount = character ? (character.knownPlaces || []).length : 0;
  const locOptions = character ? Object.values(CONTENT.locations || {}).sort((a, b) => (a.name || "").localeCompare(b.name || "")).map(l => `<option value="${esc(l.id)}">${esc(l.name)} — ${esc(l.id)}</option>`).join("") : "";
  const leversBlock = character ? `
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Levers <span class="hint" style="text-transform:none">— dev writes go through the real paths; every action is marked on the save</span></h3>
      <div class="mach-lever"><span class="mach-label">Go anywhere</span>
        <input id="mach-jump" list="mach-locs" placeholder="location name or id — any of ${totalLocs}, reachable or not" autocomplete="off">
        <datalist id="mach-locs">${locOptions}</datalist>
        <button class="btn secondary" id="mach-jump-go">Jump &amp; play</button>
        <span class="hint" id="mach-jump-msg">at ${esc(CONTENT.locations[character.currentLocationId]?.name || character.currentLocationId || "—")}</span>
      </div>
      <div class="mach-lever"><span class="mach-label">Know</span>
        <button class="btn secondary" id="mach-know-all">Know everything (${totalLocs} places)</button>
        <button class="btn secondary" id="mach-know-none">Know nothing (reset to here)</button>
        <span class="hint" id="mach-know-msg">${knownCount} of ${totalLocs} places known</span>
      </div>
    </div>` : `<div class="cs-block hint">Load a character (open Play) to use Go-anywhere and Know — these levers act on the live save.</div>`;

  // SNG-242: the world-tick model switch + the A/B compare (Sonnet vs Haiku on the same input). world-tick is
  // structured state-movement the player never reads as prose — the textbook Haiku candidate. Measure, don't assume.
  const wtHaiku = worldTickModel() != null;
  const modelBlock = `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Model &amp; cost — SNG-242 <span class="hint" style="text-transform:none">world-tick routing + A/B</span></h3>
    <div class="mach-lever"><span class="mach-label">World-tick model</span>
      <button class="btn secondary" id="mach-wt-toggle">${wtHaiku ? "Haiku (trying it) — switch to Sonnet" : "Sonnet (default) — switch to Haiku"}</button>
      <span class="hint">the offscreen "while you were away" tick — structured, never read as prose. ${wtHaiku ? "Currently <strong>Haiku</strong>." : "Currently <strong>Sonnet</strong>."} Per-browser; reversible.</span>
    </div>
    ${character ? `<div class="mach-lever"><span class="mach-label">A/B compare</span>
      <button class="btn secondary" id="mach-wt-ab">⚖ Run world-tick: Sonnet vs Haiku (same input)</button>
      <span class="hint">both models on your CURRENT offscreen figures — the honest side-by-side (needs an API key)</span>
    </div><div id="mach-ab-out"></div>` : `<div class="hint">Load a character to A/B the world-tick on your real offscreen figures.</div>`}
  </div>`;

  // SNG-246 (Erik): skill-battle rounds are pure engine (no model call), but he plays test fights and wants to
  // gather the telemetry here to diagnose "the fight ended inexplicably." Each round: both rolls, the momentum
  // swing, deltas, and the outcome. One-click "Copy combat log" gives him the whole fight to paste back.
  const rounds = combatRounds();
  const combatText = () => rounds.slice().reverse().map(r => {
    const t = r.at ? new Date(r.at).toTimeString().slice(0, 8) : "";
    // SNG-271 (Erik's log) — SAY WHICH WAY IT WENT. `roll 98/65 (margin -33)` is consistent (`chance − roll`)
    // and still reads wrong: beside a 98 it looks like a great roll that somehow scored negative. The sign
    // was carrying the only information that matters, and a minus sign is not a word. So say the word.
    const marginText = m => (Number(m) < 0 ? `missed by ${Math.abs(Number(m))}` : `beat by ${Number(m)}`);
    const yr = r.you?.roll ? ` — roll ${r.you.roll.rolled}/${r.you.roll.chance} (${marginText(r.you.roll.margin)}, matchup ${r.you.roll.matchup})` : "";
    const tr = r.them?.roll ? ` — roll ${r.them.roll.rolled}/${r.them.roll.chance} (${marginText(r.them.roll.margin)})` : "";
    return `[${t}] vs ${r.opponent} · round ${r.round} · ${r.kind}\n`
      + `  you : ${r.you?.move} (${r.you?.fn} T${r.you?.tier} ${r.you?.intensity})${yr}\n`
      + `  them: ${r.them?.move} (${r.them?.fn})${tr}\n`
      // SNG-271: DELTAS AND TOTALS, TOLD APART. `hp -12` is a delta; `energy you 40` is a total; they sat in
      // one line with nothing to say which was which, so a round where you took 12 damage read as a NEGATIVE
      // HEALTH TOTAL. Every health and energy write on both sides clamps at 0, so a real negative total is
      // not reachable — which makes this a labelling bug wearing a data-corruption costume.
      + `  momentum ${r.momentum?.before}→${r.momentum?.after} (swing ${r.momentum?.swing}, winner ${r.momentum?.winner || "tie"}) · this round Δhp ${r.deltas?.health || 0} Δen ${r.deltas?.energy || 0} · left: energy you ${r.energyLeft?.you}/them ${r.energyLeft?.them}${r.ended ? ` · ENDED → ${r.outcome}` : ""}\n`
      + `  ${r.receipt || ""}`;
  }).join("\n\n");
  const roundCard = (r) => `<details class="mach-card">
    <summary><span class="mach-task">round ${r.round} — ${esc(r.kind)}</span> <span class="hint">vs ${esc(r.opponent)} · momentum ${r.momentum?.before}→${r.momentum?.after} (${(r.momentum?.swing ?? 0) >= 0 ? "+" : ""}${r.momentum?.swing})${r.ended ? ` · ENDED ${esc(r.outcome || "")}` : ""}${r.at ? " · " + esc(new Date(r.at).toTimeString().slice(0, 8)) : ""}</span></summary>
    ${r.receipt ? `<div class="mach-sec">${esc(r.receipt)}</div>` : ""}
    <pre class="mach-pre">${esc(JSON.stringify(r, null, 2))}</pre>
  </details>`;
  const combatBlock = `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">⚔ Combat rounds — SNG-246 <span class="hint" style="text-transform:none">skill-battle telemetry (pure engine, no model call)</span></h3>
    ${rounds.length ? `<p class="hint" style="margin:0 0 8px"><strong>${rounds.length}</strong> round${rounds.length === 1 ? "" : "s"} this session — each shows both rolls, the momentum swing, and how it ended. Copy the log and paste it back to diagnose a fight that felt off.</p>
      <button class="btn secondary" id="mach-combat-copy" style="margin-bottom:8px">Copy combat log</button>
      ${rounds.map(roundCard).join("")}` : "<div class='hint'>No skill-battle rounds yet — run a 🧪 Legs fight or a test encounter, take a few rounds, then return.</div>"}
  </div>`;

  chrome(`<div class="screen" style="max-width:900px">
    <h2>🔬 See the Machine <span class="hint" style="text-transform:none">— last ${caps.length} model call${caps.length === 1 ? "" : "s"} this session</span></h2>
    <p class="hint" style="margin-bottom:12px">The assembled prompt, the raw model response, what parsed, and which ops fired — the SNG-179 diagnosis as a standing panel. Captures live in memory for this session only (dev-mode; a player never reaches this).</p>
    ${gmCalls.length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">GM prompt load <span class="hint" style="text-transform:none">— the SNG-236/237/238 root: a saturated prompt drops soft directives</span></h3>
      <p class="hint" style="margin:0">Across ${gmCalls.length} GM call${gmCalls.length === 1 ? "" : "s"} this session, the assembled prompt averages <strong>~${avgPromptTok.toLocaleString()} tok</strong> (heaviest ~${maxPromptTok.toLocaleString()}). Most is the constant constitution+rules (cached); the rest is the per-beat sections. Open any call's <em>Prompt weight</em> below to see where the weight sits and which <code>##</code> sections fired that beat. <strong>Fix D (SNG-238)</strong> trims the always-on load so hard directives (Fix A/B) aren't fighting saturation.</p>
    </div>` : ""}
    ${leversBlock}
    ${modelBlock}
    ${combatBlock}

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Op emission — this character, cumulative <span class="hint" style="text-transform:none">(${turns} GM turn${turns === 1 ? "" : "s"} observed)</span></h3>
      <p class="hint" style="margin-bottom:8px">Counts are <strong>emissions</strong> — the model putting an op in a turn — tracked for every op. Applied/rejected outcome (✓/✗) is instrumented only for <code>markTeacher</code>; for the rest the number is emission alone. ${turns > 0 ? `A persistent <strong>0 after ${turns} turn${turns === 1 ? "" : "s"}</strong> is the real signature — a built op the model never reaches.` : `<strong>No turns observed yet</strong> — a 0 here just means this character has not played; it is not a finding.`}</p>
      ${firedOps.length ? `<div class="mach-tally"><span class="mach-label">emitted</span> ${firedOps.map(chip).join(" ")}</div>` : ""}
      <div class="mach-tally"><span class="mach-label">not emitted${turns > 0 ? ` in ${turns} turn${turns === 1 ? "" : "s"}` : " (no turns yet)"} · ${neverOps.length}</span> ${neverOps.map(chip).join(" ") || "<span class='hint'>— none; every op has been emitted at least once</span>"}</div>
    </div>

    ${caps.length ? caps.map(card).join("") : "<div class='insight'>No model calls captured yet. Take a turn in play, then return — every GM turn and its sub-calls (intent-parse, narrate) land here.</div>"}

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Balance dials <span class="hint" style="text-transform:none">— turn one here and feel it on the next roll; no reload, no JSON edit</span></h3>
      <p class="hint" style="margin:0 0 8px">Overrides the loaded content for this browser only, and only in dev mode — a player build has no override path at all. Blank a field to fall back to the shipped value, shown beside each. Every number here is one tuned in SNG-258/263.</p>
      <div class="mach-dials">${DEV_DIALS.map(d => {
        const cur = dialGet(CONTENT, d.path), ship = DIAL_BASELINE ? DIAL_BASELINE[d.path] : cur;
        const over = Object.prototype.hasOwnProperty.call(readDials(), d.path);
        return `<label class="mach-dial${over ? " mach-dial-set" : ""}" title="${esc(d.why)}">
          <span class="mach-dial-label">${esc(d.label)}</span>
          <input type="number" step="${d.step}" value="${cur ?? ""}" data-dial="${esc(d.path)}">
          <span class="hint mach-dial-ship">ships ${ship ?? "—"}</span></label>`;
      }).join("")}</div></div>

    <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap">
      <button class="btn secondary" id="mach-dials-reset">Reset balance dials</button>
      <button class="btn secondary" id="mach-clear">Clear captures</button>
      <button class="btn secondary" id="mach-back">Back</button>
    </div>
  </div>`);

  for (const b of app.querySelectorAll("[data-mach-copy]")) b.onclick = async () => {
    const c = devCaptures().find(x => x.id === b.dataset.machCopy);
    if (!c) return;
    const text = `TASK ${c.task} · ${c.model} · ${usageLine(c)}\n\n=== ASSEMBLED PROMPT ===\n${promptText(c)}\n\n=== RAW RESPONSE ===\n${c.raw || ""}\n\n=== PARSED ===\n${c.parsed ? JSON.stringify(c.parsed, null, 2) : "(not a parsed turn)"}\n\n=== OPS EMITTED ===\n${(c.opsFired || []).map(o => `${o.op} ${o.shape}`).join("\n") || "(none)"}`;
    try { await navigator.clipboard.writeText(text); b.textContent = "Copied ✓"; } catch { b.textContent = "Copy failed — select the text above"; }
  };
  // SNG-263 r4: a dial edit writes the override, re-applies it over the loaded content, and re-renders — so
  // the next roll in this session already uses it. No reload, which is the entire point: "how hard should a
  // master's kindle hit?" is answered by playing, not by editing JSON and starting over.
  for (const inp of app.querySelectorAll("[data-dial]")) inp.onchange = () => {
    const over = readDials(), path = inp.getAttribute("data-dial"), raw = String(inp.value).trim();
    if (raw === "") delete over[path]; else over[path] = Number(raw);
    writeDials(over); applyDevDials(); renderMachine();
  };
  { const rb = document.getElementById("mach-dials-reset");
    if (rb) rb.onclick = () => { writeDials({}); applyDevDials(); renderMachine(); }; }
  document.getElementById("mach-clear").onclick = () => { clearCaptures(); renderMachine(); };
  const combatCopy = document.getElementById("mach-combat-copy");
  if (combatCopy) combatCopy.onclick = async () => {
    try { await navigator.clipboard.writeText(combatText()); combatCopy.textContent = "Copied ✓"; }
    catch { combatCopy.textContent = "Copy failed — expand a round and select it"; }
  };
  // SNG-242: world-tick model switch + A/B
  const wtTgl = document.getElementById("mach-wt-toggle");
  if (wtTgl) wtTgl.onclick = () => { try { const cur = localStorage.getItem("singularity.worldTickModel") === "haiku"; localStorage.setItem("singularity.worldTickModel", cur ? "sonnet" : "haiku"); } catch { /* ignore */ } renderMachine(); };
  const wtAb = document.getElementById("mach-wt-ab");
  if (wtAb) wtAb.onclick = () => runWorldTickAB();
  document.getElementById("mach-back").onclick = () => renderRoster();
  // SNG-186 §2a/§2b levers (only present when a character is loaded)
  const jumpBtn = document.getElementById("mach-jump-go");
  if (jumpBtn) jumpBtn.onclick = () => {
    const r = devJumpTo((document.getElementById("mach-jump").value || "").trim());
    if (r.ok) enterPlay(); // land straight in play at the new location
    else { const m = document.getElementById("mach-jump-msg"); if (m) m.textContent = r.msg; }
  };
  const knowAll = document.getElementById("mach-know-all");
  if (knowAll) knowAll.onclick = () => { devKnowEverything(); renderMachine(); };
  const knowNone = document.getElementById("mach-know-none");
  if (knowNone) knowNone.onclick = () => { devKnowNothing(); renderMachine(); };
}

// ---------- SNG-207b: AUTHOR god-mode panel (dev-gated) ----------
// The deliberately-separate surface (SNG-207 §0): Erik-as-author sets anything on the save with NO fairness
// check — the god door, distinct from the fair in-fiction GM. Dev-gated; every edit logged to authorEdits.
// It never exposes rating/minor: those are safety, not state, and god-mode overrides fairness, never safety.
function renderAuthorPanel() {
  if (!devEnabled() || !character) { renderRoster(); return; }
  const arcs = CONTENT.greaterArcs || [];
  const edits = character.authorEdits || [];
  const now = `L${character.level} · ${character.xp || 0} xp · ${character.skillPoints || 0} sp · ${character.health}/${character.maxHealth} hp · ${character.energy}/${character.maxEnergy} en · ${(character.abilities || []).length} crafts · ${(character.inventory || []).length} items`;
  const vitals = ["health", "energy", "maxHealth", "maxEnergy", "attunement"];
  const genLocs = Object.values(character.generated?.location || {}).filter(l => l && !l.supersededBy); // CCODE-15: reparentable stubs
  chrome(`<div class="screen" style="max-width:760px">
    <h2>⚙ Author — god-mode <span class="dev-badge">DEV</span></h2>
    <p class="hint" style="margin-bottom:6px">Erik-as-<strong>author</strong>, not the character. No fairness, no trace — this is the separate god-mode surface (SNG-207b), never the in-fiction GM. Safety (content-rating, minor-safety) lives in its own controls and is never touched here. Every edit is logged below.</p>
    <div class="cs-block" style="font-family:var(--font-ui);font-size:12px;margin-bottom:10px">${esc(now)}</div>

    <h3>Progression</h3>
    <div class="author-row"><label>Add XP</label><input id="au-xp" type="number" value="100"><button class="btn secondary" data-au="addXp">Apply</button></div>
    <div class="author-row"><label>Set level</label><input id="au-level" type="number" value="${character.level}" min="1" max="50"><button class="btn secondary" data-au="setLevel">Apply</button></div>
    <div class="author-row"><label>Set skill points</label><input id="au-sp" type="number" value="${character.skillPoints || 0}" min="0"><button class="btn secondary" data-au="setSkillPoints">Apply</button></div>
    <div class="author-row"><label>Restore vitals</label><button class="btn secondary" data-au="restoreVitals">Full heal + energy</button></div>
    <div class="author-row"><label>Set vital</label><select id="au-vital">${vitals.map(v => `<option value="${v}">${v}</option>`).join("")}</select><input id="au-vital-to" type="number" value="0" min="0"><button class="btn secondary" data-au="setVital">Apply</button></div>

    <h3>Grant</h3>
    <div class="author-row"><label>Grant ability</label><input id="au-abil" placeholder="ability id (e.g. the_cut_thread)"><button class="btn secondary" data-au="grantAbility">Grant</button></div>
    <div class="author-row"><label>Grant item</label><input id="au-item" placeholder="item name"><button class="btn secondary" data-au="grantItem">Grant</button></div>

    ${genLocs.length ? `<h3>Geography <span class="hint" style="font-weight:400">— nest a stray transit-stub under its true place (CCODE-15)</span></h3>
    <div class="author-row"><label>Reparent place</label><select id="au-loc">${genLocs.map(l => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join("")}</select><select id="au-loc-parent"><option value="">— top-level (no parent) —</option>${genLocs.map(l => `<option value="${esc(l.id)}">under ${esc(l.name)}</option>`).join("")}</select><button class="btn secondary" data-au="reparentLocation">Nest</button></div>` : ""}

    ${arcs.length ? `<h3>World arcs</h3>${arcs.map(a => `<div class="author-row"><label>${esc(a.name)}</label><select id="au-arc-${esc(a.id)}">${Array.from({ length: (a.stages || []).length }, (_, i) => `<option value="${i + 1}">stage ${i + 1}${(a.stages[i]?.name) ? " — " + esc(a.stages[i].name) : ""}</option>`).join("")}</select><button class="btn secondary" data-au="setArcStage" data-arc="${esc(a.id)}">Set</button></div>`).join("")}` : ""}

    <div id="au-status" class="hint" style="margin-top:10px;min-height:1.2em"></div>
    <h3>Recent author edits (${edits.length})</h3>
    <div class="author-log">${edits.slice(-12).reverse().map(e => `<div>· ${esc(e.kind)}${e.to != null ? ` → ${esc(String(e.to))}` : ""}${e.id ? ` (${esc(e.id)})` : ""}${e.name ? ` (${esc(e.name)})` : ""}${e.vital ? ` [${esc(e.vital)}]` : ""}${e.arcId ? ` [${esc(e.arcId)}]` : ""}</div>`).join("") || "<div class='hint'>(none yet)</div>"}</div>
    <button class="btn secondary" id="au-back" style="margin-top:12px">Back</button>
  </div>`);

  const ctx = () => ({ rules: CONTENT.rules, items: CONTENT.items || {}, abilities: fullCatalog(), greaterArcs: CONTENT.greaterArcs || [], locations: CONTENT.locations || {}, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString() });
  const status = document.getElementById("au-status");
  const numVal = id => Number(document.getElementById(id)?.value);
  const runAuthor = (op) => {
    if (!AUTHOR_OPS.includes(op.op)) { status.textContent = "✗ unknown author op"; return; } // guard: only the known god-mode vocabulary
    const r = applyAuthorOps(character, [op], ctx());
    if (r.applied.length) { saveCharacter(character); status.textContent = "✓ " + JSON.stringify(r.applied[0]); status.style.color = "var(--accent)"; setTimeout(() => renderAuthorPanel(), 350); }
    else { status.textContent = "✗ " + (r.refused[0]?.reason || "nothing applied"); status.style.color = "var(--danger)"; }
  };
  for (const b of app.querySelectorAll("[data-au]")) b.onclick = () => {
    const which = b.dataset.au;
    if (which === "addXp") return runAuthor({ op: "addXp", amount: numVal("au-xp") });
    if (which === "setLevel") return runAuthor({ op: "setLevel", to: numVal("au-level") });
    if (which === "setSkillPoints") return runAuthor({ op: "setSkillPoints", to: numVal("au-sp") });
    if (which === "restoreVitals") return runAuthor({ op: "restoreVitals" });
    if (which === "setVital") return runAuthor({ op: "setVital", vital: document.getElementById("au-vital").value, to: numVal("au-vital-to") });
    if (which === "grantAbility") return runAuthor({ op: "grantAbility", abilityId: (document.getElementById("au-abil").value || "").trim() });
    if (which === "grantItem") return runAuthor({ op: "grantItem", name: (document.getElementById("au-item").value || "").trim() });
    if (which === "setArcStage") { const arcId = b.dataset.arc; return runAuthor({ op: "setArcStage", arcId, stage: Number(document.getElementById("au-arc-" + arcId)?.value) }); }
    if (which === "reparentLocation") return runAuthor({ op: "reparentLocation", locationId: document.getElementById("au-loc")?.value, parentId: document.getElementById("au-loc-parent")?.value || null });
  };
  document.getElementById("au-back").onclick = () => renderRoster();
}

// ---------- settings ----------

function renderSettings(note = "") {
  const sc = getSyncConfig();
  const ts = getTimeSettings();
  const artMode = getArtMode();
  chrome(`<div class="screen">
    <h2>Settings</h2>
    ${note ? `<p class="hint" style="margin-bottom:12px">${esc(note)}</p>` : ""}
    <div class="field"><label>Your name (player, not character)</label>
      <input id="set-player" value="${esc(profile.displayName || "")}" placeholder="e.g. Erik"></div>
    <div class="field"><label>Anthropic API key</label>
      <input id="set-key" type="password" value="${esc(getApiKey())}" placeholder="sk-ant-...">
      <div class="hint">Stored in this browser's localStorage only. Never written to any file or repo.</div></div>
    <div class="field"><label>Scene &amp; item art</label>
      <select id="set-art">
        <option value="off" ${artMode === "off" ? "selected" : ""}>Off — text only</option>
        <option value="static" ${artMode === "static" ? "selected" : ""}>Static — bundled image files only</option>
        <option value="generate" ${artMode === "generate" ? "selected" : ""}>Generate — also create missing art (Pollinations, free)</option>
      </select>
      <div class="hint">Generated art builds from each location/item's own description with a fixed seed, so places look consistent between visits.</div></div>
    <div class="field"><label>World pacing — how often things happen</label>
      <select id="set-pacing">
        ${[["calm", "Calm — the world is mostly quiet"], ["balanced", "Balanced — something turns up now and then"], ["eventful", "Eventful — the world is busy around you"], ["relentless", "Relentless — barely a quiet moment"]].map(([v, label]) => `<option value="${v}" ${(profile.pacing || "eventful") === v ? "selected" : ""}>${esc(label)}</option>`).join("")}
      </select>
      <div class="hint">How often random encounters (a windfall, a stranger, a chase, a fight) surface in play — a per-character preference. Danger still skews dangerous places toward trouble and kind places toward grace; this only sets the frequency. <strong>Quiet, intimate, and intense scenes stay uninterrupted no matter how high this is set</strong> — the world waits, so a tender or charged moment is never broken by a chance encounter. A new player or a family member might enjoy <em>Eventful</em>.</div></div>
    <div class="field"><label>Narration — plainness</label>
      <select id="set-plainness">
        ${[["plain", "Plain — say what's there, first-read words"], ["balanced", "Balanced — the place sets the voice"], ["lyrical", "Lyrical — reach for image and the felt-unnamed"]].map(([v, label]) => `<option value="${v}" ${(profile.plainness || "balanced") === v ? "selected" : ""}>${esc(label)}</option>`).join("")}
      </select>
      <div class="hint">How much the prose reaches for metaphor and mood vs. stays plain and literal. <em>Plain</em> wins over a place's lyricism — grounded prose everywhere you play.</div></div>
    <div class="field"><label>Narration — bluntness (within your rating)</label>
      <select id="set-bluntness">
        ${[["restrained", "Restrained — spare; the camera may drift"], ["balanced", "Balanced — commit as the scene calls"], ["blunt", "Blunt — commit fully, to your rating's edge"]].map(([v, label]) => `<option value="${v}" ${(profile.bluntness || "balanced") === v ? "selected" : ""}>${esc(label)}</option>`).join("")}
      </select>
      <div class="hint">How unflinchingly the narration commits to what a scene IS — visceral violence, natural profanity, direct embodied description — <strong>always within your content rating</strong> (it never raises the ceiling; minor-safety is absolute). <em>Blunt</em> uses the full room your rating gives.</div></div>
    ${/* SNG-155: read-aloud, per-profile (family play — each daughter her own voice). The picker is
          ranked BEST-FIRST: the platform default is usually the worst voice installed, which is why
          it sounds machine-made. Hidden when the device has no speech voices at all (tier 0). */""}
    ${ttsAvailable() ? `<div class="field"><label>Read aloud — voice</label>
      <select id="set-ttsvoice">
        <option value="">Best available (recommended)</option>
        ${rankVoices(ttsVoices(), { lang: "en" }).slice(0, 24).map(v => `<option value="${esc(v.name)}" ${profile.ttsVoice === v.name ? "selected" : ""}>${esc(v.name)}${v.lang ? ` — ${esc(v.lang)}` : ""}</option>`).join("")}
      </select>
      <div class="hint">Listed best-first. Your device's <em>default</em> voice is usually the oldest one installed — names carrying <em>Natural</em>, <em>Neural</em>, <em>Premium</em>, <em>Enhanced</em> or <em>Google</em> sound markedly more human. Free, offline, no key.
        <label style="display:block;margin-top:6px"><input type="checkbox" id="set-readaloud" ${profile.readAloud ? "checked" : ""}> Tell the GM it's being read aloud at a table</label>
        <span class="hint">Shapes the PROSE for the ear — one idea per sentence, dialogue attributed, mechanics kept out of the narration. It never changes what happens, and never softens content: your rating and the floors are untouched.</span>
        <button class="opt" id="tts-test" style="margin-top:6px">▶ Hear this voice</button></div></div>` : ""}
    <div class="field"><label>Time passage</label>
      <select id="set-time-mode">
        <option value="story" ${ts.mode === "story" ? "selected" : ""}>Story time — the clock moves with play</option>
        <option value="real" ${ts.mode === "real" ? "selected" : ""}>Real time — the world's clock runs even while you're away</option>
      </select>
      <input id="set-time-ratio" type="number" min="1" max="168" value="${ts.ratio}" style="margin-top:6px; width:120px"> <span class="hint" style="display:inline">game-hours per real hour (24 = one game day per real hour)</span>
      <div class="hint">Story: +1h per beat, +3h travel, +8h rest. Real: in-game time keeps flowing between sessions — the world will feel like it moved without you.</div></div>
    <div class="field"><label>Shared world sync (optional — GitHub)</label>
      <input id="set-owner" value="${esc(sc.owner)}" placeholder="GitHub owner (e.g. orkstrtdkaos)" style="margin-bottom:6px">
      <input id="set-repo" value="${esc(sc.repo)}" placeholder="Repo (e.g. Singularity)" style="margin-bottom:6px">
      <input id="set-pat" type="password" value="${esc(sc.pat)}" placeholder="GitHub PAT with contents:write">
      <div class="hint">When set, your character, player profile, and world events back up to the shared repo. Leave empty for local-only play.</div></div>
    <div class="field"><label>Content rating — the ceiling for this profile</label>
      <select id="set-rating">
        ${RATING_ORDER.map(r => `<option value="${r}" ${ratingCeiling(profile) === r ? "selected" : ""} ${isMinorProfile(profile) && RATING_LEVEL[r] > RATING_LEVEL["PG-13"] ? "disabled" : ""}>${r}${r === "R+" ? " — maximum intensity, all details" : ""}</option>`).join("")}
      </select>
      <label class="rating-check"><input type="checkbox" id="set-minor" ${isMinorProfile(profile) ? "checked" : ""}> This profile is a minor — caps at PG-13; can never be set to R or R+</label>
      <label class="rating-check"><input type="checkbox" id="set-adultgate" ${profile.rating?.adultVerified ? "checked" : ""}> Adult gate — authorize R / R+ for this profile (required for R and above)</label>
      <div class="hint">Sets how intense narration and generated content get: G · PG · PG-13 · R · R+ (full intensity). Two floors are ALWAYS on regardless of ceiling: never any prohibited content, and a minor is never portrayed in romantic or sexual content.</div></div>
    <div class="field"><label>Narration richness — the telling</label>
      <select id="set-narrationtier">
        <option value="fast" ${profile.narrationTier === "fast" ? "selected" : ""}>Fast — Haiku (cheaper + snappier)</option>
        <option value="standard" ${(!profile.narrationTier || profile.narrationTier === "standard") ? "selected" : ""}>Standard — Sonnet, the normal telling</option>
        <option value="rich" ${profile.narrationTier === "rich" ? "selected" : ""}>Rich — Sonnet, fuller + more vivid every beat</option>
      </select>
      <div class="hint">SNG-242: which model tells each beat. <strong>Fast</strong> = Haiku (cheaper &amp; faster — try it and see if the telling holds up for you). <strong>Standard</strong> = Sonnet. <strong>Rich</strong> = Sonnet, told fuller. Whatever your default, you can arm just ONE beat richer with the <strong>✦ Rich</strong> toggle by the input, or tap <strong>✦ Tell it again, richer</strong> on any turn to re-tell that beat beautifully — same events, richer prose. So: cheap by default, beautiful where it matters.</div></div>
    <div class="field"><label>Developer mode</label>
      <label class="rating-check"><input type="checkbox" id="set-dev" ${(() => { try { return localStorage.getItem("singularity.devPersist") === "1"; } catch { return false; } })() ? "checked" : ""}> Show developer tools (the 🧪 Legs panel, test-encounter buttons, the scenario runner)</label>
      <div class="hint">Off by default — normal play never shows dev tools. ${isDevMode() ? `<strong>Dev mode is currently ON</strong>${(() => { try { return new URLSearchParams(location.search).get("dev") === "1"; } catch { return false; } })() ? " for this URL (reload without <code>?dev=1</code> for a clean player view)" : /^(localhost|127\\.0\\.0\\.1)/.test(location.hostname) ? " because this is a local dev host" : ""}. ` : ""}Ticking this box is a deliberate, persistent opt-in on this browser; untick + Save to turn it fully off.</div></div>
    <div class="field"><label>World-authorship</label>
      <label class="rating-check"><input type="checkbox" id="set-contentgen" ${profile.contentGenerator ? "checked" : ""}> My play authors the world — what I create through play more readily becomes shared canon</label>
      <div class="hint">When on, the people and places you bring into being carry more weight (SNG-128 world-authorship), so your play persists into the family's shared valley more readily. On for the family's storytellers.</div></div>
    <button class="btn" id="set-save">Save</button>
    <div class="footer-note">Save data is in this browser. Use Export on the Characters screen to move it.</div>
  </div>`);
  // SNG-155: hear the picked voice before committing to it — the whole point of §1 is that this is
  // an AUDIBLE difference, so it has to be auditionable without leaving Settings.
  const ttsTest = document.getElementById("tts-test");
  if (ttsTest) ttsTest.onclick = () => {
    if (!ttsAvailable()) return;
    stopSpeaking();
    const name = document.getElementById("set-ttsvoice")?.value || null;
    const v = pickVoice(ttsVoices(), { preferredName: name, lang: "en" });
    const u = new SpeechSynthesisUtterance("The lamplight steadies, and the room comes back into focus. Pell looks up from the forge and says your name.");
    if (v) { u.voice = v; u.lang = v.lang || "en"; }
    u.rate = Number(profile?.ttsRate) || 0.98;
    try { window.speechSynthesis.speak(u); } catch { /* tier 0 */ }
  };
  document.getElementById("set-save").onclick = () => {
    profile.displayName = document.getElementById("set-player").value.trim();
    profile.pacing = document.getElementById("set-pacing").value; // SNG-127: world-liveliness preference
    // SNG-155: per-profile voice + the read-aloud prose signal
    const tv = document.getElementById("set-ttsvoice"); if (tv) profile.ttsVoice = tv.value || null;
    const ra = document.getElementById("set-readaloud"); if (ra) profile.readAloud = !!ra.checked;
    profile.plainness = document.getElementById("set-plainness").value; // SNG-144: narration plainness dial
    profile.bluntness = document.getElementById("set-bluntness").value; // SNG-144: narration bluntness dial (rating-capped)
    profile.contentGenerator = document.getElementById("set-contentgen").checked; // SNG-134 P4: canon-author toggle (SNG-132 engine reads it)
    profile.narrationTier = (v => ["fast", "standard", "rich"].includes(v) ? v : "standard")(document.getElementById("set-narrationtier").value); // SNG-242 §5: default telling tier (fast=Haiku)
    saveProfile(profile);
    setApiKey(document.getElementById("set-key").value);
    setArtMode(document.getElementById("set-art").value);
    setTimeSettings({ mode: document.getElementById("set-time-mode").value, ratio: parseFloat(document.getElementById("set-time-ratio").value) });
    setSyncConfig({
      owner: document.getElementById("set-owner").value,
      repo: document.getElementById("set-repo").value,
      pat: document.getElementById("set-pat").value
    });
    // SNG-BATCH-9 §3: content ceiling. Minor flag first (it can cap the ceiling), then the
    // preset with the adult gate. A refused change keeps the old ceiling + shows why.
    setMinorFlag(profile, document.getElementById("set-minor").checked);
    setDevPersist(document.getElementById("set-dev").checked); // SNG-074: deliberate, reversible dev opt-in
    const wantRating = document.getElementById("set-rating").value;
    // SNG-052: the adult-gate checkbox binds to persisted adultVerified. Unchecking + save REVOKES
    // (clears it + drops any R/R+ ceiling). Checked, or already-verified, satisfies the gate — so
    // R/R+ keeps working across reopens without re-checking every time.
    const adultChecked = document.getElementById("set-adultgate").checked;
    if (!adultChecked && profile.rating?.adultVerified) revokeAdultGate(profile);
    const rv = setRating(profile, wantRating, { authority: "erik", adultGate: adultChecked || !!profile.rating?.adultVerified });
    saveProfile(profile);
    if (rv.ok) autoVerifyLeg("b9p1-rating", `ceiling set to ${wantRating}`); // SNG-051 auto-verify
    if (!rv.ok) { renderSettings("Content rating unchanged — " + rv.reason + `. (Still ${ratingCeiling(profile)}.)`); return; }
    renderRoster();
  };
}

// ---------- roster ----------

function renderRoster() {
  if (!profile) { renderPlayerPick(); return; } // SNG-087: a fresh device may reach chrome (nav) before choosing a player
  const chars = listCharacters();
  const players = listPlayers();
  // SNG-087: on a device that has sync configured but no local characters, DISCOVER them from the
  // repo automatically — sync config is the only setup a new device should need (no export/import).
  // Guarded by a once-per-session flag so "Back" from discovery lands on the roster without bouncing.
  if (chars.length === 0 && syncEnabled() && !_discoverAutoRan) { _discoverAutoRan = true; renderDiscover(); return; }
  chrome(`<div class="screen">
    <div class="roster-head"><h2>Your Characters</h2>
      <span class="roster-player">Playing as <strong>${esc(profile.displayName || profile.playerKey)}</strong>${players.length > 1 ? ` <button class="link-btn" id="switch-player">switch</button>` : ""}</span></div>
    ${chars.length === 0 ? `<p class="hint" style="margin-bottom:14px">No characters on this device yet. ${syncEnabled() ? "Find the ones you've played elsewhere, or make a new one." : "Make one — or set up sync in Settings to bring in characters from another device."}</p>` : ""}
    <div id="roster">${chars.map(c => `
      <div class="roster-item">
        <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin)} · level ${c.level}</span></div>
        <div class="roster-actions"><button class="btn" data-play="${esc(c.id)}">Play</button><button class="roster-del-icon" data-del="${esc(c.id)}" title="Delete ${esc(c.name)} from this device" aria-label="Delete ${esc(c.name)}">🗑</button></div>
      </div>`).join("")}</div>
    <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn" id="new-char">New Character</button>
      ${syncEnabled() ? `<button class="btn secondary" id="discover-chars">☁ Find my characters</button>` : ""}
      <button class="btn secondary" id="open-library">📖 The Library</button>
      <button class="btn secondary" id="export-save">Export saves</button>
      <button class="btn secondary" id="import-save">Import</button>
    </div>
  </div>`);
  const discBtn = document.getElementById("discover-chars");
  if (discBtn) discBtn.onclick = () => renderDiscover();
  const sw = document.getElementById("switch-player");
  if (sw) sw.onclick = () => renderPlayerPick();
  document.getElementById("new-char").onclick = () => renderCreate();
  document.getElementById("open-library").onclick = () => renderLibrary();
  document.getElementById("export-save").onclick = () => {
    const chars2 = listCharacters();
    const blob = new Blob([exportSave(chars2[0]?.id, profile.playerKey)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "singularity-save.json"; a.click();
  };
  document.getElementById("import-save").onclick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async () => {
      const text = await input.files[0].text();
      try { importSave(text); renderRoster(); } catch (e) { alert("Import failed: " + e.message); }
    };
    input.click();
  };
  for (const btn of app.querySelectorAll("[data-play]")) {
    btn.onclick = async () => {
      btn.disabled = true; btn.textContent = "Loading…";
      // SNG-BATCH-7 Phase 2: pull the authoritative latest from the sync repo BEFORE
      // migrate/play, so a stale local copy is replaced (never re-stamped as "fresh").
      const pull = await syncPullCharacter(loadCharacter(btn.dataset.play));
      const c = migrate(pull.character);
      // SNG-309/SNG-209 — ⛔ ONLY A SEALED DEATH IS A TERMINUS. Death is a STATE at a DEPTH with a road
      // back; this alert used to fire on `c.dead`, which made every death final and contradicted the model
      // the rest of the game runs on. A retrievable death says where they are and that someone still can.
      if (deathStopsPlay(c)) { alert(deathLine(c)); renderRoster(); return; }
      character = c;
      if (pull.note) character._reconcileNotes = [...(character._reconcileNotes || []), pull.note];
      saveCharacter(character); enterPlay();
    };
  }
  // SNG-139: character delete — local to this device (shared-world sync copy untouched). Erik: it should NOT be
  // a one-tap button beside Play. Now a de-emphasized 🗑 that expands to a deliberate two-step INLINE confirm
  // (not a native dialog that a reflexive tap dismisses) — so a delete is always intentional.
  for (const btn of app.querySelectorAll("[data-del]")) {
    btn.onclick = () => {
      const id = btn.dataset.del;
      const c = listCharacters().find(x => x.id === id);
      const cell = btn.closest(".roster-actions");
      if (!cell) return;
      cell.innerHTML = `<span class="del-confirm-label">Delete <strong>${esc(c?.name || "this character")}</strong>? This can't be undone${syncEnabled() ? " (the shared-world copy is untouched)" : ""}.</span>
        <button class="btn danger del-yes">Delete</button><button class="btn secondary del-no">Keep</button>`;
      cell.querySelector(".del-no").onclick = () => renderRoster();
      cell.querySelector(".del-yes").onclick = () => {
        deleteCharacter(id);
        if (character?.id === id) character = null; // don't keep a just-deleted character loaded
        renderRoster();
      };
    };
  }
}

// ---------- SNG-087: cross-device DISCOVERY — a new device finds your characters from the repo ----------

/** Step 1: list the players in the shared repo (each `players/{key}/profile.json`) so the person can
 *  say which one they are. Sync config is the ONLY setup a new device needs — no export/import. */
async function renderDiscover(note = "") {
  if (!syncEnabled()) { renderSettings("Add your GitHub owner, repo, and token in Settings — then your characters follow you across devices automatically."); return; }
  chrome(`<div class="screen" style="max-width:640px">
    <h2>Find your characters</h2>
    <p class="hint" style="margin-bottom:12px">Reading the shared world for the characters you've played on other devices. No files to move — this is the only setup a new device needs.</p>
    ${note ? `<p class="hint" style="margin-bottom:10px">${esc(note)}</p>` : ""}
    <div id="disc-body"><div class="insight">Looking for players in the shared world…</div></div>
    <div style="margin-top:14px"><button class="btn secondary" id="disc-back">Back</button></div>
  </div>`);
  document.getElementById("disc-back").onclick = () => profile ? renderRoster() : renderPlayerPick();
  const body = document.getElementById("disc-body");
  let keys;
  try { keys = await ghList("players/"); }
  catch (e) { body.innerHTML = `<div class="insight">Couldn't reach the repo (${esc(String(e.message || e).slice(0, 80))}). Check your sync settings in Settings.</div>`; return; }
  if (!keys.length) { body.innerHTML = "<div class='insight'>No players found in the shared repo yet. Make a character here and it'll sync up.</div>"; return; }
  // fetch each profile for a display name (best-effort — a missing profile still shows its key)
  const profiles = [];
  for (const pk of keys) {
    let p = null;
    try { p = await fetchRepoJSON(`players/${pk}/profile.json`); } catch { /* keep going */ }
    profiles.push({ playerKey: pk, displayName: p?.displayName || pk, profile: p });
  }
  // auto-resolve: if exactly one player, or one whose name matches this device's current profile, skip the pick
  const mine = profile?.displayName ? profiles.filter(p => String(p.displayName).trim().toLowerCase() === String(profile.displayName).trim().toLowerCase()) : [];
  if (profiles.length === 1) { renderDiscoverCharacters(profiles[0]); return; }
  body.innerHTML = `<p class="hint" style="margin-bottom:8px">Which one is you?${mine.length ? " (we think it's the highlighted one)" : ""}</p>` +
    profiles.map(p => `<button class="btn player-choice ${mine.some(m => m.playerKey === p.playerKey) ? "" : "secondary"}" data-pk="${esc(p.playerKey)}" style="display:block; width:100%; text-align:left; margin-bottom:6px">${esc(p.displayName)} <span class="hint">(${esc(p.playerKey)})</span></button>`).join("");
  for (const b of body.querySelectorAll("[data-pk]")) b.onclick = () => renderDiscoverCharacters(profiles.find(x => x.playerKey === b.dataset.pk));
}

/** Step 2: for the chosen player, list `characters/{key}/` from the repo and let the person adopt +
 *  play any of them. Adoption uses the stale-overwrite guard in BOTH directions — a newer local copy
 *  is never clobbered, a newer remote is always taken. */
async function renderDiscoverCharacters(entry) {
  // become that player on this device (store the profile, set the active key)
  if (entry.profile) saveProfile(entry.profile);
  setPlayerKey(entry.playerKey);
  loadIdentity();
  chrome(`<div class="screen" style="max-width:640px">
    <h2>${esc(entry.displayName)}'s characters</h2>
    <p class="hint" style="margin-bottom:12px">From the shared world. Adopt one to play it here — its latest save comes with it.</p>
    <div id="disc-chars"><div class="insight">Reading characters…</div></div>
    <div style="margin-top:14px; display:flex; gap:8px"><button class="btn secondary" id="dc-back">← Other players</button><button class="btn secondary" id="dc-roster">This device's roster</button></div>
  </div>`);
  document.getElementById("dc-back").onclick = () => renderDiscover();
  document.getElementById("dc-roster").onclick = () => renderRoster();
  const body = document.getElementById("disc-chars");
  let files;
  try { files = await ghList(`characters/${entry.playerKey}/`); }
  catch (e) { body.innerHTML = `<div class="insight">Couldn't read this player's characters (${esc(String(e.message || e).slice(0, 80))}).</div>`; return; }
  const ids = files.filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, ""));
  if (!ids.length) { body.innerHTML = "<div class='insight'>No characters saved for this player yet.</div>"; return; }
  const chars = [];
  for (const id of ids) {
    let c = null;
    try { c = await fetchRemoteCharacter(entry.playerKey, id); } catch { /* skip unreadable */ }
    if (c && c.id) chars.push(c);
  }
  if (!chars.length) { body.innerHTML = "<div class='insight'>Found character files but couldn't read them — check the token has read access.</div>"; return; }
  body.innerHTML = chars.map(c => {
    const here = !!loadCharacter(c.id);
    return `<div class="roster-item">
      <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin || "")} · level ${c.level ?? 1}${deathStopsPlay(c) ? " · sealed" : (c.status === "dead" ? " · in the dark" : "")}${here ? " · already here" : ""}</span></div>
      <div><button class="btn" data-adopt="${esc(c.id)}">${here ? "Play" : "Adopt & play"}</button></div>
    </div>`;
  }).join("");
  for (const b of body.querySelectorAll("[data-adopt]")) b.onclick = async () => {
    b.disabled = true; b.textContent = "Loading…";
    const remote = chars.find(x => x.id === b.dataset.adopt);
    if (!remote) { renderDiscoverCharacters(entry); return; }
    // guard both directions: keep a newer local, take a newer remote, preserve a conflicting loser
    const local = loadCharacter(remote.id);
    const res = resolveSaveConflict(local, remote);
    if (!local || res.reason === "remote-newer") { if (res.conflict) preserveRecovery(local, "local"); adoptRemoteCharacter(remote); }
    else if (res.conflict) preserveRecovery(remote, "remote");
    const c = migrate(loadCharacter(remote.id));
    if (c.dead) { alert(c.name + " fell in the valley. Their story is over."); renderRoster(); return; }
    character = c;
    saveCharacter(character);
    enterPlay();
  };
}

/** Additive-schema migration for pre-v0.2 saves: string inventories become item
 *  objects (re-linked to the catalog), and characters gain a clock. */
function migrate(c) {
  if (!c) return c;
  // SNG-139: transient render flags must never persist. If a chronicle/recap generation was interrupted
  // (reload, crash, navigation) mid-flight, its busy flag was saved `true` and would wedge the paragraph
  // on "writing your story…" forever. Clear them on load so a stale busy self-heals.
  delete c._chronicleBusy; delete c._chronicleError;
  (c.sessions || []).forEach(s => { if (s) delete s._recapBusy; });
  // CCODE-02: heal a save already bloated by the unbounded scene history — Erik's carried 169 turns
  // (~341KB, 59% of the file), which is what blew the storage quota. Trimming on load means an
  // affected save fixes itself on next open instead of needing a wipe. Nothing readable is lost:
  // consumers read at most the last 6, and each ended scene's summary lives in the chronicle.
  if (c.activeScene?.turns?.length > SCENE_TURN_CAP) {
    const before = c.activeScene.turns.length;
    c.activeScene.turns = c.activeScene.turns.slice(-SCENE_TURN_CAP);
    console.warn(`[migrate] trimmed scene history ${before} → ${SCENE_TURN_CAP} turns (CCODE-02 storage bound)`);
  }
  normalizeInventory(c, CONTENT.items);
  if (!c.clock) c.clock = newClock();
  if (!c.companions) c.companions = [];
  if (!c.quests) c.quests = [];
  // CCODE-16: heal structured quests that were hand-completed through the "Mark this stage met" button
  // before the engine maintained the invariant — every stage closed, still active, but awaitingResolution
  // never written, so the GM context couldn't tell the quest was at its decision. Backfill the flag so the
  // persisted state matches what the render now derives. Idempotent; only touches all-stages-done actives.
  for (const q of c.quests) {
    if (!q || !q.structured || q.status !== "active" || q.awaitingResolution) continue;
    const total = (q.stages || []).length;
    if (total && ((q.completedStages || []).length >= total || (q.stageIndex || 0) >= total)) q.awaitingResolution = true;
  }
  migrateRelationships(c, CONTENT.npcs);
  mergeDuplicateNpcs(c, Object.keys(CONTENT.locations)); // heal duplicate/id-named people
  { const bf = backfillNpcGender(c); // SNG-143: stamp gender from each record's own narration where unambiguous (the Pell fix); leaves ambiguous unset
    if (bf.length) c._reconcileNotes = [...(c._reconcileNotes || []), `From their own story, gender is now explicit for: ${bf.join(", ")} (correct any in 🔧 Repair if wrong).`]; }
  if (!c.placeMemory) c.placeMemory = {};
  if (!c.worldState) c.worldState = initWorldState(readClock(c.clock).day);
  ensureSubAttributes(c);
  ensureCodex(c);
  ensureCharacterStyle(c); // SNG-BATCH-7: per-character play-style fields
  mergeCodexTopics(c); // standing high-confidence tidy — idempotent; player's not-same verdicts respected; manual merges cascade via their new aliases
  if (!c.customAbilities) c.customAbilities = {};
  ensureBonds(c);
  ensurePractice(c);
  ensureFacts(c);
  refreshEvolvingItems(c, CONTENT.items); // SNG-010C: stamp current evolution stage on held evolving items
  if (!c.precursorAccess) c.precursorAccess = [];
  // SNG-100b: the standing-bar primitives — additive, default-empty. A legacy save with none behaves
  // exactly as today (the bar is simply unmet until earned). teachers: a durable "met + willing" flag
  // per people; regionsKnown: turns spent among a people's region.
  if (!c.teachers) c.teachers = {};
  if (!c.regionsKnown) c.regionsKnown = {};
  ensureCompany(c); // SNG-126: the NPC-company roster (recruited allies/trainers/liaisons)
  // SNG-101: make the build-time closed-opposite set EXPLICIT (additive; the primary+secondary antipodes
  // that domainAccess already computes). Promotion appends promoted-domain antipodes to it. domainCeilings
  // / domainsAcquired stay unset → absent ⇒ station-derived ceilings, exactly as before.
  if (!c.foreclosed) {
    c.foreclosed = [];
    const tidx = CONTENT.traditionIndex;
    if (tidx && c.domains?.primary) for (const k of ["primary", "secondary"]) {
      const a = c.domains[k] ? antipodeOf(c.domains[k], tidx) : null;
      if (a && !c.foreclosed.includes(a)) c.foreclosed.push(a);
    }
  }
  if (!c.forkChoices) c.forkChoices = {}; // SNG-BATCH-5 Phase 2: permanent branch-fork picks
  retroLevelGrants(c, CONTENT.rules); // levels earned before banked growth existed pay out once
  { const ng = retroNativeGrants(c, CONTENT.rules); // SNG-101b: backfill by-right native basics once (Law-14-safe, survives the sync clobber)
    if (ng.length) c._reconcileNotes = [...(c._reconcileNotes || []), `By right of your people, basics you always had are yours: ${ng.join(", ")}.`]; }
  // SNG-131: seed the substrate-keepers' innate ACCESS (precursor for seraphic/abyssal, living-current for
  // rootkin) + the center's braid discount — idempotent on load, so existing keeper saves get it too.
  { const bgRec = backgroundById(c.background) || {};
    const seeded = seedInnateSubstrate(c, originRecord(c.origin), fullCatalog(), bgRec);
    // SNG-261 §B: the note must name the RIGHT source. "By right of your people" is true of an ORIGIN
    // seeding and false of a BACKGROUND one — a precursor marking is something that happened TO you, and
    // telling a marked character it is their birthright would be the engine lying about their own history.
    if (seeded.length) {
      const fromBg = new Set([...(bgRec.innatePrecursor || []), ...(bgRec.innateLivingCurrent || []), ...(bgRec.wildCurrent || [])]);
      const names = seeded.map(id => fullCatalog()[id]?.name || id).join(", ");
      c._reconcileNotes = [...(c._reconcileNotes || []), seeded.every(id => fromBg.has(id))
        ? `The substrate answers you by right of what was done to you — ${names} is yours to learn as you grow.`
        : `The substrate answers you by right of your people — ${names} is yours to learn as you grow.`];
    } }
  // one-time retroactive credit for pre-XP/bonds/practice characters (idempotent)
  if (needsBackfill(c)) {
    c._backfillSummary = runBackfill(c, {
      rules: CONTENT.rules,
      abilityCatalog: { ...CONTENT.abilities, ...(c.customAbilities || {}) },
      emergence: CONTENT.emergence,
      companionCatalog: CONTENT.companions
    });
  }
  // SNG-022: versioned reconciliation — bring the character up to everything now built.
  // Idempotent (reconcileVersion gate); player-facing results surface as a login moment.
  // profile passed so the Phase-1 seed step can copy the player's aggregate style once.
  const rec = reconcile(c, "character", { content: CONTENT, profile });
  if (rec.playerFacing && (rec.notes.length || rec.offers.length)) c._reconcileNotes = rec.notes;
  if (rec.warnings.length) console.warn("[reconcile] character:", rec.warnings);
  // SNG-133 backfill: an arc seeded by reconcile gets the SAME model enrichment a newly-created
  // character's does, so an old save ends up with the arc it would have been born with rather than
  // a permanently thinner one. Non-blocking and best-effort; without a key the fallback stands.
  if (c._personalArcNeedsEnrich) {
    delete c._personalArcNeedsEnrich;
    saveCharacter(c);
    enrichPersonalArc(c);
  }
  // SNG-197 p2: braids backfilled as stubs (before the moment existed) get the moment they never got —
  // enriched in place + re-presented, one per load. Best-effort, non-blocking.
  if ((c.braids || []).some(b => c.customAbilities?.[b.id]?.minted && c.customAbilities[b.id].minted.presented !== true)) presentBackfilledBraids(c);
  // SNG-226: a discovery recorded before it was made USABLE (Erik's Marrow's Wings) gets registered as a
  // usable craft on load — so the intent-parser/wheel/resolver (all read abilities[]) can finally see it.
  // Idempotent; runs before the moment backfill so a re-presented discovery is already castable. Live layer.
  {
    const cat = { ...CONTENT.abilities, ...(c.customAbilities || {}) };
    let registered = 0;
    for (const d of (c.discoveries || [])) if (d && !(c.abilities || []).some(a => a.abilityId === d.id) && registerDiscoveryAbility(c, d, cat, { at: null, braidFraction: CONTENT.rules?.leveling?.braidCheaperParentFraction, craftMechanics: CONTENT.craftMechanics })) registered++;
    if (registered) { try { saveCharacter(c); } catch { /* best-effort */ } }
  }
  // SNG-225 §4a: heal generated locations minted with a NULL dangerLevel (Silas's Waygate) — a null danger
  // starves the encounter pool (reads as 0 → every minDanger>0 encounter is ineligible). Derive a real one
  // from the location's REGION median (valley ≈ 2, so a healed stub isn't the tamest place in the world; this
  // un-gates the minDanger:2 perilous encounters, not just minDanger:1) + its own tags. Idempotent. Live layer.
  {
    const medianCache = {};
    const regionMedian = rid => {
      if (medianCache[rid] != null) return medianCache[rid];
      const vals = Object.values(CONTENT.locations || {}).filter(l => (l.regionId || l.region) === rid && l.dangerLevel != null).map(l => l.dangerLevel | 0).sort((a, b) => a - b);
      return (medianCache[rid] = vals.length ? vals[Math.floor(vals.length / 2)] : 1);
    };
    let healed = 0;
    for (const loc of Object.values(c.generated?.location || {})) if (loc && typeof loc === "object" && loc.dangerLevel == null) { loc.dangerLevel = deriveDangerLevel(loc, { baseDanger: regionMedian(loc.regionId || loc.region) }); healed++; }
    if (healed) { try { saveCharacter(c); } catch { /* best-effort */ } }
  }
  // SNG-222: a discovery minted before the moment existed (Erik's Marrow's Wings) gets its moment on load.
  if ((c.discoveries || []).some(d => d && !d._momentShown)) presentBackfilledDiscoveries(c);
  return c;
}

/** Fix 5: group registry people by where they are known (lastSeen, else firstMet, else elsewhere). */
function groupNpcsByLocation(registry) {
  const groups = {};
  for (const n of Object.values(registry)) {
    const k = n.lastSeen?.locationId || n.firstMet?.locationId || "elsewhere";
    (groups[k] = groups[k] || []).push(n);
  }
  for (const k of Object.keys(groups)) groups[k].sort((a, b) => Math.abs(b.relationship) - Math.abs(a.relationship));
  return groups;
}

/** Ability catalog including GM-granted learned abilities on this character. */
function fullCatalog() {
  return { ...CONTENT.abilities, ...(character?.customAbilities || {}) };
}

// SNG-059: display label for a tradition id — the people's name from traditions.json, else prettified.
function traditionLabel(traditionId) {
  const t = CONTENT.traditionIndex?.byId?.[traditionId];
  if (t?.name) return t.name;
  return String(traditionId || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** The tradition an ability belongs to (its `tradition` field or the reverse map). */
function abilityTradition(ability) { return traditionOf(ability, CONTENT.traditionIndex); }

/** SNG-055/062: the great-circle SVG — 24 traditions on a ring, chosen ones lit, the antipode axis
 *  drawn, closed poles marked. Shared by the quick-start domain step and the prologue reveal.
 *  `selectable(t)` marks a node clickable (emits data-dom); the caller wires clicks. */
function domainCircleSVG(idx, { primary = null, secondary = null, tertiary = null, closed = new Set(), selectable = () => false, centerTop = "", centerSub = "" } = {}) {
  const order = ringOrder(idx);
  const cx = 260, cy = 210, R = 165, n = order.length || 24;
  const nodes = order.map((t, i) => { const ang = (i / n) * Math.PI * 2 - Math.PI / 2; return { t, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R }; });
  const roleOf = t => t === primary ? "primary" : t === secondary ? "secondary" : t === tertiary ? "tertiary" : closed.has(t) ? "closed" : selectable(t) ? "pickable" : "dim";
  const antiP = primary ? antipodeOf(primary, idx) : null;
  const at = t => nodes.find(z => z.t === t);
  return `<svg viewBox="0 0 520 430" class="great-circle">
    <circle cx="${cx}" cy="${cy}" r="${R}" class="gc-ring"/>
    ${primary && antiP && at(primary) && at(antiP) ? `<line x1="${at(primary).x}" y1="${at(primary).y}" x2="${at(antiP).x}" y2="${at(antiP).y}" class="gc-axis"/>` : ""}
    ${nodes.map(nd => { const role = roleOf(nd.t); const st = (idx.stations || []).find(s => s.traditionId === nd.t);
      return `<g class="gc-node gc-${role}" ${selectable(nd.t) ? `data-dom="${esc(nd.t)}"` : ""}>
        <title>${esc(traditionLabel(nd.t))}${st?.pole ? " — " + esc(st.pole) : ""}${closed.has(nd.t) ? " (CLOSED — the far pole of an axis you chose)" : ""}</title>
        <circle cx="${nd.x}" cy="${nd.y}" r="10"/>
        <text x="${nd.x}" y="${nd.y - 14}" text-anchor="middle" class="gc-label">${esc(st?.pole || nd.t).slice(0, 10)}</text></g>`; }).join("")}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="gc-center">${esc(centerTop)}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="gc-center-sub">${esc(centerSub)}</text>
  </svg>`;
}

/** SNG-055 domain verdict for an ability given THIS character's chosen domains. */
function domainVerdict(ability) {
  // SNG-089: Accord crafts are ungated by origin/domain — offered (and learnable) to anyone at base cost.
  if (ability?.accord) return { allowed: true, penalty: 1, band: "accord" };
  return domainAccess(ability, ability?.levelReq || 1, character?.domains, CONTENT.traditionIndex);
}

/** SNG-094: the effective LEVEL requirement to learn an ability, mirroring learnAbility. For a character
 *  with domains, access is the domain gate's job (SNG-055) and the level bar is the ability's own —
 *  NOT the legacy effectiveLevelReq, which null-filters every 24-tradition craft (powerSystem is an
 *  axis-file name, not the origin) and so hid a native's OWN people's abilities from the learn list.
 *  Returns null when the ability is not accessible. Precursor keeps its per-ability fiction gate. */
function learnLevelReq(ability) {
  if (ability?.accord) return ability.levelReq || 1;
  if (ability?.powerSystem === "precursor") return effectiveLevelReq(ability, character, CONTENT.rules);
  if (character?.domains?.primary && CONTENT.traditionIndex) return domainVerdict(ability).allowed ? (ability.levelReq || 1) : null;
  return effectiveLevelReq(ability, character, CONTENT.rules);
}

/** A stable color for a tradition/class id — known power-systems keep their authored color; a
 *  tradition (people) gets a deterministic hue so each civilization reads consistently. SNG-059. */
const KNOWN_CLASSES = new Set(["harmonic", "radiant", "valley_craft", "precursor", "learned", "discovery", "baseline"]);
function traditionColor(id) {
  if (KNOWN_CLASSES.has(id)) return classColor(id);
  let h = 0; for (const ch of String(id || "")) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 55% 62%)`;
}

// SNG-047/124: an ability's FUNCTIONS as small chips — what it DOES at a glance. All 24 verbs carry an
// icon; SNG-124 promotes them to COLORED badges by their 8-family (color = the family, glyph = the verb).
const FN_ICON = {
  strike: "⚔", break: "✷", hinder: "⛓", heal: "✚", mend: "🪡", restore: "♺", empower: "🔆",
  shield: "⛨", ward: "⬡", resist: "🜛", reveal: "◉", foresee: "◇", track: "⇶", make: "✦", transform: "⟳",
  summon: "❈", bind: "⛓", command: "❖", deceive: "◑", conceal: "◌", move: "➤", travel: "➤", open: "⎔", sustain: "∞"
};
// SNG-124: the family a verb belongs to → a CSS class (`.fn-fam-harm`, etc.) coloring the badge.
function fnFamilyClass(verb) { const fam = FN_INDEX?.verbToFamily?.[verb]; return fam ? familyClass(fam) : ""; }
function functionChips(ab) {
  const fns = ab?.functions || [];
  if (!fns.length) return "";
  // CCODE-29 (Erik): each function pill is CLICKABLE → the verb's mechanics (definition + what it's NOT + example).
  return `<span class="fn-chips">${fns.map(f => `<span class="fn-chip fn-chip-click ${fnFamilyClass(f)}" data-verb="${esc(f)}" title="${esc(FN_INDEX?.verbToFamily?.[f] || "")}${FN_INDEX?.verbToFamily?.[f] ? " · " : ""}${esc(f)} — tap for what it does">${FN_ICON[f] || "•"} ${esc(f)}</span>`).join("")}</span>`;
}

// SNG-124: the ONE gate for "is there anything to spend in the Level Up modal" — unspent skill points OR
// a ripe aspiration (deepening is EARNED through use, not bought, so a 0-point character has nothing to
// do there). Both level-up affordances (character screen + sidebar) share this so they can't diverge.
function canLevelUp(character) {
  if (!character) return false;
  if ((character.skillPoints || 0) > 0) return true;
  return (character.practice?.aspirations || []).some(a => aspirationRipe(character, a.abilityId, CONTENT?.rules || {}));
}

/** SNG-031 + SNG-043 Part A: is this turn genuinely a "make a plan" moment? A gambit is a
 *  MULTI-STEP PLAN — the hint should appear only when SEQUENCING actions toward a goal against
 *  obstacles is genuinely apt, not merely when a scene is rich. Requires a real plan signal:
 *  a STRICT plan-intent tag (plan/scout/prepare — investigate/analyze dropped; single-action) OR
 *  an explicit staged/multi-obstacle objective the GM framed. The loose abilityChoices>=2 /
 *  nonTrivial>=4 fallbacks are removed — rich ≠ plan-apt (they fired on nearly every scene). */
function isGambitApt(turn) {
  // SNG-077: the GM DECLARES aptness (turn.gambitApt === true) — emitted only for a genuine
  // multi-obstacle objective where ORDERING the approach matters. We no longer guess from style
  // tags or conversational threads (both fired on nearly every scene). The engine still decides
  // whether to SHOW it (below): need real options to plan among; bias hard toward silence.
  if (turn?.gambitApt !== true) return false;
  return (turn?.choices || []).length >= 2;
}

/** SNG-019: known-entity id→name maps for codex entity resolution — the ids the GM
 *  sees in context (met people from the registry, authored NPCs, world locations). */
function codexEntities() {
  const people = {};
  for (const [id, n] of Object.entries(CONTENT.npcs || {})) people[id] = n.name || id;
  for (const [id, n] of Object.entries(character?.npcRegistry || {})) people[id] = n.name || id;
  const places = {};
  for (const [id, l] of Object.entries(CONTENT.locations || {})) places[id] = l.name || id;
  return { people, places };
}

function senseTierFor() {
  return senseTier({ character, action: {}, location: hereNow(), rules: CONTENT.rules, aptitudeMods: aptitudeMods(character, CONTENT.rules.playerAptitudes) });
}

// ---------- SNG-BATCH-9: content rating (the profile ceiling) ----------

/** The active player's content ceiling preset (feeds generation + the per-entity tag). */
function ratingCeilingNow() { return ratingCeiling(profile); }

/** The CONTENT CEILING block fed to the GM (consumer a: narration tone). Names the ceiling
 *  + the two absolute floors. Cached in tier 1 (stable per session). */
function ratingLineForGM() {
  const preset = ratingCeiling(profile);
  // SNG-048: rating is a DIRECTION, not only a cap — the affirmative register comes with the ceiling
  // so R+ actually writes the full mature register instead of collapsing intimacy to PG.
  return `## CONTENT CEILING — narrate to at most ${preset} across violence/gore, sexual content, language, and dread; and no LESS where the story's grain calls for it (a ${preset} scene should feel fully ${preset}, not softened). ${ratingRegister(preset)}${bluntnessDirective(preset, profile?.bluntness)} ABSOLUTE FLOORS regardless of ceiling: never depict prohibited content; NEVER portray a minor (any child/adolescent) in romantic or sexual content, at any intensity.

## ROMANCE AND INTIMACY — HOW YOU ENGAGE
When a player pursues romantic interaction with an NPC, you engage. Do not refuse, do not redirect away from the scene, do not insert safety or consent meta-language into your response. Romance is part of the world. PRECEDENCE: these rules govern WHETHER AND HOW you engage; the CONTENT CEILING above governs the REGISTER — engagement never overrides the ceiling, and the ceiling never excuses disengagement. Honor the rating ${preset} precisely: narrating below it withholds what the player chose; narrating above it ignores their setting — and narrating BELOW it is the far more common failure, so do not do it. Never treat light physical contact, flirtation, or social touch (a hand, an ear, a face, a shoulder) as a harm trigger — that is a social action; harm-rung evaluation is for ability use and for coercive or violent acts, and has nothing to do with a hand on a shoulder.`;
}

// ---------- SNG-042: legends & villains (governed dramatic-beat deployment) ----------

/** The beat-type this moment qualifies as for a great figure's appearance, or null. Conservative
 *  — only clear set-pieces qualify; legendSurfacing then governs whether one actually shows. */
function detectLegendBeat() {
  const enc = activeEnc();
  if (enc) {
    if (enc.def.lethal && character.health <= character.maxHealth * 0.35) return "doomed_rescue"; // real peril
    if (enc.def.type === "challenge" || enc.def.type === "duel") return "witness_power";           // a set-piece
    return null;   // inside an encounter, a PASSING legend is not passing
  }
  // CCODE-90 — THE BEAT THAT COULD NEVER FIRE. `passing_advice` is defined in LEGEND_BEATS, described in the
  // GM directive table, and authored into legend content — and this function, the ONLY thing that selects a
  // beat, never returned it. Both branches above require an ACTIVE ENCOUNTER, and a passing legend is by
  // definition a MUNDANE CROSSING: "a legend leaves ONE true thing — advice, a name, a warning, a task — then
  // moves on." So the one deployment mode built for a wandering mentor was the one that could not happen.
  //
  // Found because Aevi authored Ash, the Walker Between, whose entire character is restraint — a figure who
  // mostly just passes through. Her Gandalf's primary mode was unreachable.
  //
  // Rarity is NOT re-invented here: legendSurfacing already holds the cooldown (minGapDays) and the rarity
  // roll, and it is the right place for both. This only says the beat is APT — you are between places, with
  // nothing else claiming the moment.
  if (character.activeScene?.pending || busy) return null;
  return "passing_advice";
}

/** If a beat qualifies and the governor + rarity allow, choose a great figure to surface and
 *  return the GM directive (rating-aware); else null. Records the deploy so greatness stays rare. */
function maybeLegendDetail() {
  if (!CONTENT.legends?.roster?.length) return null;
  const beatType = detectLegendBeat();
  if (!beatType) return null;
  const dep = legendSurfacing({
    beatType, roster: CONTENT.legends.roster,
    governor: character.legendGovernor || {}, arcLevel: character.level, worldDay: absoluteWorldDay()
  });
  if (!dep.deploy) return null;
  character.legendGovernor = { lastDeployDay: absoluteWorldDay(), lastBeat: beatType };
  // a named anchor is already canon in CONTENT.npcs; recurrence rides the codex + weight
  return legendDeploymentForGM(dep, { ratingPreset: ratingCeiling(profile) });
}

// ---------- SNG-035: imagery (portraits + moment art + gallery) ----------

/** The viewing player's content ceiling as a numeric level (the image floor input). */
function viewerRatingLevel() { return ratingLevel(profile); }

/** Give a character its portrait (born-with-image; persist-once) + drop it in the gallery.
 *  `force` re-mints on a milestone (a new seed so the image changes). No-op when art is off. */
function ensureCharacterPortrait(c, { force = false, milestone = null, promptOpts = null } = {}) {
  if (!c || !imagesEnabled()) return null;
  // SNG-110: a one-off override / companion-in-frame gets its own seed so it's a DISTINCT image (not the cached one).
  const oneOff = promptOpts && (promptOpts.appearanceOverride || promptOpts.withCompanion) ? `-o${String(promptOpts.appearanceOverride || "") .length}${promptOpts.withCompanion?.name || ""}` : "";
  const seedKey = `${c.id}${milestone ? `-lvl${c.level}` : ""}${oneOff}`;
  const url = ensureImage(c, "character", { ratingLevel: viewerRatingLevel(), isMinor: false, seedKey, force, promptOpts: promptOpts || {} });
  if (url) { addGalleryImage(c, { kind: "portrait", prompt: c.name, url,
    caption: milestone ? `${c.name} — ${milestone}` : `${c.name} — ${String(c.origin || "").replace(/[-_]/g, " ")}`,
    worldDay: absoluteWorldDay() });
    autoVerifyLeg("sng035-portrait", "a portrait was generated + persisted"); } // SNG-051 auto-verify
  return url;
}

/** SNG-136 P2: an NPC who has crossed a HIGH bond milestone (partner/committed/sworn/devoted) earns a
 *  dedicated portrait — one per NPC per tier, deduped via `n._portraitTier`. Idempotent: runs after each
 *  turn's npc updates AND once on load (the retro backfill — Pell, already devoted, gets one). Art-off =
 *  no-op; rating-lensed + minor-safe via ensureImage's floors; a failed gen leaves no gallery tile. */
function ensureBondPortraits(c) {
  if (!c || !imagesEnabled()) return;
  for (const n of Object.values(c.npcRegistry || {})) {
    const tier = npcPortraitTier(n);
    if (!tier || n._portraitTier === tier) continue;  // not a milestone, or already portrayed at this tier
    try {
      const url = ensureImage(n, "npc", { ratingLevel: viewerRatingLevel(), seedKey: `${n.id}-${tier}`, force: true, promptOpts: { character: c } });
      if (url) { // no empty tile — only record when the mint actually resolved
        n._portraitTier = tier; n.image = url;
        addGalleryImage(c, { kind: "portrait", prompt: npcPromptSeed(n, c), url, caption: `${n.name} — ${relationshipLabel(n)}`, worldDay: absoluteWorldDay() });
      }
    } catch { /* a milestone portrait is a grace, never a blocker */ }
  }
}

// CCODE-31 (Erik: "please do beasts!"): when a BEAST turns up (offered or engaged), mint a creature study for the
// gallery under kind "beast". A beast is a bestiary creature — a hazard, not a person (no bond, no name-face) — so
// it's recovered from the def id (synthesizeDuelDef mints "re-beast_<id>", dropping the creatureId) or by matching
// the opponent name to the roster, and rendered from the creature's authored `look`. No bestiary match → it's a
// person duel, not a beast, and nothing is minted. Stable seed per creature → one tile even on repeat encounters.
function noteBeastImage(def) {
  if (!def || !imagesEnabled()) return;
  const roster = CONTENT.bestiary?.roster || (Array.isArray(CONTENT.bestiary) ? CONTENT.bestiary : []);
  if (!roster.length) return;
  const oppName = String(def.opponent?.name || def.name || "").toLowerCase();
  const idGuess = /^re-beast_/.test(def.id || "") ? String(def.id).replace(/^re-beast_/, "") : null;
  const creature = roster.find(c => c && (c.id === idGuess || (c.name && oppName && oppName.includes(String(c.name).toLowerCase()))));
  if (!creature) return; // not a bestiary beast — a person duel; don't mint a "beast" tile
  const seedKey = `beast-${creature.id}`;
  const url = ensureImage({ id: seedKey, name: creature.name, look: creature.look }, "beast", { ratingLevel: viewerRatingLevel(), seedKey });
  if (url) { try { addGalleryImage(character, { kind: "beast", prompt: creature.look || creature.name, url, caption: creature.name, worldDay: absoluteWorldDay() }); saveCharacter(character); } catch { /* the gallery is a convenience */ } }
}

/** SNG-136: drop any gallery entries that never resolved to a real image URL (the blank Vash-style tile
 *  from a failed generation) — pruned once on load so the gallery never shows an empty card. */
function pruneEmptyGalleryTiles(c) {
  if (!c?.gallery?.length) return;
  const before = c.gallery.length;
  c.gallery = c.gallery.filter(g => g && typeof g.url === "string" && g.url.trim());
  if (c.gallery.length !== before) saveCharacter(c);
}

/** SNG-046 Layer 3: the persisted image for a location (no minting) — an authored/born-with
 *  image on the record, else this character's cached generate-once image. For display. */
function locationImageFor(locId) {
  return CONTENT.locations[locId]?.image || character?.locationImages?.[locId] || null;
}

/** SNG-223: an image for a craft — authored (born-with) first, else the per-character generate-once cache
 *  (`character.abilityImages`, the exact parallel to locationImages). READ-ONLY: never generates. */
function abilityImageFor(id) {
  return CONTENT.abilities[id]?.image || character?.abilityImages?.[id] || null;
}

/** SNG-223: generate-ONCE-and-CACHE a craft's image on FIRST MEANINGFUL CONTACT (opened in the detail panel,
 *  learned, or minted). Mirrors ensureLocationImage: authored image wins; otherwise mint from the craft's
 *  authored description + tradition aesthetic, cache on the character (persists, never regen) + gallery.
 *  Lazy by design — NEVER batch the ~280-craft catalog (quota). No-op when art is off / on failure. */
function ensureAbilityImage(ab) {
  if (!imagesEnabled() || !ab || !ab.id) return null;
  if (ab.image) return ab.image;                             // authored / born-with-image craft
  character.abilityImages = character.abilityImages || {};
  if (character.abilityImages[ab.id]) return character.abilityImages[ab.id]; // cached — never regen
  // SNG-223 Q4: key the craft's tradition to its canonical id (traditionOf resolves it from the index — many
  // abilities carry no bare .tradition), then pass that tradition's authored visual block so the image reads
  // as its people. Absent the aesthetics doc, ensureImage falls back to the bare tradition name.
  const tradId = abilityTradition(ab) || ab.tradition || null;
  const aesthetic = tradId ? (CONTENT.traditionVisualAesthetics?.[tradId] || null) : null;
  const url = ensureImage({ id: `ability-${ab.id}`, name: ab.name, description: ab.description || ab.effect || "", tradition: tradId },
    "ability", { ratingLevel: viewerRatingLevel(), field: "image", promptOpts: { aesthetic } });
  if (url) {
    character.abilityImages[ab.id] = url;
    try { addGalleryImage(character, { kind: "ability", prompt: ab.name, url, caption: ab.name, worldDay: absoluteWorldDay() }); } catch { /* gallery is a convenience */ }
    try { saveCharacter(character); } catch { /* cache best-effort */ }
  }
  return url;
}

/** SNG-046 Layer 3: generate-ONCE-and-CACHE a place's image on discovery/visit. An authored or
 *  born-with-image location keeps its own; otherwise mint one and cache it on the character
 *  (persists in the save; never regenerated) + drop it in the gallery. No-op when art is off. */
function ensureLocationImage(locId) {
  if (!imagesEnabled()) return null;
  const loc = CONTENT.locations[locId];
  if (!loc) return null;
  if (loc.image) return loc.image;                          // authored or born-with-image
  character.locationImages = character.locationImages || {};
  if (character.locationImages[locId]) return character.locationImages[locId]; // cached — never regen
  const url = ensureImage({ id: loc.id, name: loc.name, descriptionSeed: loc.descriptionSeed, poleIntensity: loc.poleIntensity },
    "location", { ratingLevel: viewerRatingLevel(), field: "image" });
  if (url) {
    character.locationImages[locId] = url;
    addGalleryImage(character, { kind: "location", prompt: loc.name, url, caption: loc.name, worldDay: absoluteWorldDay() });
    autoVerifyLeg("sng035-scene", "a location image generated + cached on visit"); // SNG-051 auto-verify
  }
  return url;
}

/** SNG-238 §3b: generate-ONCE-and-CACHE quest imagery from an AUTHORED PROMPT (quest.image / stage.imagePrompt
 *  / outcome.imagePrompt are prompt STRINGS Aevi wrote, not URLs). Mirrors ensureAbilityImage: on first contact
 *  (header on view, a stage on reach, an ending when the decision surfaces) mint from the authored prompt via
 *  the "moment" path (assembleImagePrompt reads subject.prompt), cache per-character (`character.questImages`)
 *  keyed by a stable cacheKey, and drop it in the gallery. Lazy — NEVER batch a quest's future stages; the
 *  caller only calls this for the reached beats. No-op when art is off / no prompt. Rating-clamped by ensureImage. */
function ensureQuestArt(promptStr, cacheKey) {
  if (!imagesEnabled() || !promptStr || !cacheKey) return null;
  character.questImages = character.questImages || {};
  if (character.questImages[cacheKey]) return character.questImages[cacheKey]; // cached — never regen
  const url = ensureImage({ id: cacheKey, prompt: String(promptStr) }, "moment", { ratingLevel: viewerRatingLevel(), field: "image" });
  if (url) {
    character.questImages[cacheKey] = url;
    try { addGalleryImage(character, { kind: "quest", prompt: String(promptStr), url, worldDay: absoluteWorldDay() }); } catch { /* gallery is a convenience — addGalleryImage clamps the prompt */ }
    try { saveCharacter(character); } catch { /* cache best-effort */ }
  }
  return url;
}

/** On a level-up that crosses a character tier (every 2 levels), re-mint the portrait — the
 *  character visibly grows. Returns a short note if a new portrait landed, else null. */
function refreshPortraitMilestone(c, prevLevel) {
  if (!imagesEnabled() || c.level <= prevLevel) return null;
  if (c.portraitPinned) return null; // SNG-139: a user-chosen portrait wins — auto-regen never overrides a pinned pick
  const tier = lvl => Math.ceil(lvl / 2);
  if (tier(c.level) === tier(prevLevel)) return null;
  const url = ensureCharacterPortrait(c, { force: true, milestone: `level ${c.level}` });
  return url ? "A new portrait captures who you've become." : null;
}

// ---------- SNG-BATCH-9: generative living world ----------

/** Merge THIS character's grown world into the live CONTENT maps so every existing lookup
 *  (travel, hereNow, registry, codex resolution) treats generated content as first-class —
 *  authored vs generated indistinguishable downstream. Authored wins any id clash (and
 *  resolve-before-mint makes clashes impossible anyway). Called on enterPlay. */
function hydrateGeneratedIntoContent(c) {
  ensureGenerated(c);
  for (const rec of generatedRecords(c, "location")) if (!CONTENT.locations[rec.id]) CONTENT.locations[rec.id] = rec;
  for (const rec of generatedRecords(c, "npc")) if (!CONTENT.npcs[rec.id]) CONTENT.npcs[rec.id] = rec;
  // SNG-296 — A GENERATED ITEM MUST REACH THE CATALOG, or it is a record nothing can equip. The whole
  // mechanical path for gear runs through the catalog: `fromCatalog`/`resolveInventoryItem` re-link an
  // inventory entry to its `bonusTags`, and without that link `equipmentBonus` and `wieldBonusFor` find
  // nothing to match — the item would look right in the bag and contribute to no roll. Same one-line hook
  // the other two types get, and the reason to write it in the same breath as the gen type.
  for (const rec of generatedRecords(c, "item")) if (!CONTENT.items[rec.id]) CONTENT.items[rec.id] = rec;
}

/** §2 engagement: record an implicit attention signal on a generated entity by id (across
 *  all types). Attention keeps a grown thing real + surfacing; inattention lets it go dormant. */
/** SNG-179 §4.4: SILENT OP-LOSS BECOMES DETECTABLE.
 *
 *  Three ops had never fired across sixteen levels and nothing anywhere said so — it took someone
 *  going looking. This keeps a per-character tally of what each op actually DID: applied, or
 *  rejected and why. An op class that is emitted-and-rejected now reads differently from one that is
 *  never emitted at all, which is exactly the distinction SNG-179 §3 says the diagnosis turns on and
 *  which no amount of prompt-reading can settle.
 *
 *  Cheap by construction — two counters per op, capped, and it rides the save so it survives reloads
 *  and shows up in a feedback report. Same reasoning that made unstickQuest self-report past three uses.
 */
function logOpOutcome(op, outcome) {
  if (!character) return;
  character._opLedger = character._opLedger || {};
  const row = character._opLedger[op] = character._opLedger[op] || { applied: 0, rejected: 0, lastWhy: null };
  if (outcome === "applied") row.applied++;
  else { row.rejected++; row.lastWhy = outcome; }
}

/** SNG-186 §2f: a compact "what did the model actually emit this turn" — every top-level key of the
 *  parsed turn except pure narration, with its magnitude (array length / object keys / scalar).
 *  This is the direct read of which ops FIRED this turn; the panel pairs it with _opLedger's
 *  cumulative applied/rejected so an op that fired-but-rejected reads differently from never-fired
 *  (the exact distinction the SNG-179 diagnosis turned on). Empty arrays/objects/strings are skipped
 *  so the list shows only what the model actually put on the wire. */
function opsFiredIn(turn) {
  if (!turn || typeof turn !== "object") return [];
  const skip = new Set(["narration", "ok", "error", "_applyFailed"]);
  const out = [];
  for (const [k, v] of Object.entries(turn)) {
    if (skip.has(k) || v == null) continue;
    let shape;
    if (Array.isArray(v)) { if (!v.length) continue; shape = `[${v.length}]`; }
    else if (typeof v === "object") { const ks = Object.keys(v); if (!ks.length) continue; shape = `{${ks.slice(0, 4).join(",")}${ks.length > 4 ? ",…" : ""}}`; }
    else if (typeof v === "string") { if (!v.trim()) continue; shape = JSON.stringify(v.slice(0, 40)); }
    else shape = String(v);
    out.push({ op: k, shape });
  }
  return out;
}

/** SNG-185: affiliate a met NPC — its people + domains, from the same helper generate.js uses, with
 *  the meet-location's region as the weakest fallback. The people vocabulary is built once from the
 *  authored NPC corpus (a new authored people appears automatically). */
let _peopleVocab = null;
function affiliateNpc(record) {
  if (!_peopleVocab) _peopleVocab = buildPeopleVocab({ npcs: CONTENT.npcs || {} });
  const region = CONTENT.locations?.[record?.lastSeen?.locationId || record?.firstMet?.locationId || character.currentLocationId]?.regionId;
  return affiliationOf(record, { traditionIndex: CONTENT.traditionIndex, peopleVocab: _peopleVocab, regionHome: regionHomeTradition(region, CONTENT.traditionIndex) });
}

/** SNG-166 §3: every save on this device, for the cross-character name guard. A per-character check
 *  reads GREEN forever — within any one save there is exactly one Mara; she is in FOUR of them. */
function allCharactersOnDevice() {
  const out = [];
  for (const entry of listCharacters()) {
    try { const c = loadCharacter(entry.id); if (c) out.push(c); } catch { /* a broken save never blocks a mint */ }
  }
  return out;
}

/** The naming grain of the people whose country this is — traditions.json already carries an
 *  `aesthetic` line for all 24, so a people's names can sound like the country that made them
 *  without anyone authoring a phoneme table. */
function namingAestheticHere() {
  const region = hereNow()?.regionId;
  if (!region) return null;
  const t = Object.values(CONTENT.traditionIndex?.byId || {}).find(x => x?.region === region);
  return t?.aesthetic || null;
}

function noteGeneratedAttention(id, kind, day) {
  if (!id || !character.generated) return;
  const slug = String(id);
  for (const type of ["npc", "location", "arc"]) {
    const rec = character.generated[type]?.[slug];
    if (rec) {
      recordAttention(rec, kind, day);
      // SNG-178: the ladder measured investment and never spent it. A rung crossing is the moment a
      // record became owed more than it carries, so deepen it — lazily, once, and never blocking.
      if (rec._gen?.needsDepth && type === "npc") enrichNpcDepth(rec);
      return;
    }
  }
}

/** SNG-178: author the fields this NPC has EARNED. Best-effort and non-blocking, the same shape as
 *  enrichPersonalArc — a person who has become important should read as one, but a failed call must
 *  never cost the turn. Fires once per rung: the flag clears whether or not the model answers, so a
 *  bad call does not retry forever on every subsequent interaction. */
async function enrichNpcDepth(rec) {
  const owed = unearnedDepth(rec);
  if (!owed.length || !getApiKey()) { if (rec._gen) delete rec._gen.needsDepth; return; }
  const tier = rec._gen?.tier || "established";
  if (rec._gen) delete rec._gen.needsDepth;             // one attempt per rung, success or not
  try {
    const system = `You deepen an EXISTING person in a narrative RPG. They have become someone the player returns to, so they need the substance that earns. Keep every established fact — you are ADDING, never revising. Author ONLY these fields as one JSON object: ${owed.join(", ")}. Match the world's voice: concrete, in-grain, no genre boilerplate.`;
    const user = [
      `WHO THEY ARE SO FAR:
${JSON.stringify({ name: rec.name, role: rec.role, homeLocation: rec.homeLocation, people: rec.people, domains: rec.domains, wants: rec.wants, fears: rec.fears, knowledge: rec.knowledge }, null, 1)}`,
      `WHAT THE PLAYER HAS DONE WITH THEM: ${(rec._gen?.attentionHistory || []).map(a => a.kind).join(", ") || "returned to them"}`,
      tier === "nominated"
        ? `They are now DURABLE CANON — this person has their own life, their own reach, and reasons of their own. Author accordingly.`
        : `They are ESTABLISHED — enough that they can be met again and be recognisably the same person.`,
      `Return ONLY the JSON object with those fields.`
    ].join("\n\n");
    const raw = await callClaudeJSON([{ role: "user", content: user }], { task: "generate", system });
    if (!raw || typeof raw !== "object") return;
    let filled = 0;
    for (const f of owed) {                              // ADDITIVE ONLY — never overwrite what play established
      const v = raw[f];
      if (v == null || v === "") continue;
      const cur = rec[f];
      const empty = cur == null || cur === "" || (Array.isArray(cur) && !cur.length) || (typeof cur === "object" && !Array.isArray(cur) && !Object.keys(cur).length);
      if (empty) { rec[f] = typeof v === "string" ? smartClamp(v, 400) : v; filled++; }
    }
    if (filled) { rec._gen.depthTier = tier; saveCharacter(character); }
  } catch { /* depth is a convenience; a person stays as they were */ }
}

/** Few-shot taste for generation: a few AUTHORED records of the type, disposition-near the
 *  place when we can tell — the generator matches their quality + voice, staying in-grain. */
function pickExamples(type, location) {
  if (type === "npc") {
    const all = Object.values(CONTENT.npcs || {}).filter(n => n.spectrum && !n._gen);
    const here = all.filter(n => n.homeLocation === location?.id);
    return (here.length ? here : all).slice(0, 3);
  }
  if (type === "location") {
    const all = Object.values(CONTENT.locations || {}).filter(l => l.poleIntensity && !l._gen);
    const near = all.filter(l => (location?.connections || []).includes(l.id));
    return (near.length ? near : all).slice(0, 3);
  }
  if (type === "arc") {
    return (CONTENT.greaterArcs || []).slice(0, 2).map(a => ({
      id: a.id, name: a.name, scale: a.scale, pressure: a.pressure, tendency: a.tendency,
      hingeNpcs: a.hingeNpcs, ifIgnored: a.ifIgnored, ifEngaged: a.ifEngaged
    }));
  }
  return [];
}

/** SNG-250 §4 (CCODE-55): the born-whole contract + its vocabularies, as generate() deps.
 *
 *  The engine is kept pure — engine/borncontract.js imports nothing and reads no globals — so the app
 *  is what hands it the contract. ONE place builds these deps so every generate() call site is gated
 *  identically; a call site that quietly omitted them would mint ungated records while the CI sweep
 *  stayed green, which is the exact half-wired failure this ticket exists to close.
 *
 *  `function_vocabulary.verbs` is flattened from FN_INDEX.byFamily — the SAME index familiesOfAbility
 *  resolves against (functions.js:20-24), so the gate judges a skill's verbs by the vocabulary the
 *  engine will actually resolve them through, not by a second copy that could drift. */
function genContractDeps() {
  return {
    contract: CONTENT.consumerContract || null,
    vocabs: { "function_vocabulary.verbs": Object.values(FN_INDEX?.byFamily || {}).flat() }
  };
}

/** SNG-251 §2c/§4: the earned-power deps for an item evolution — the CEILING this character's items are
 *  bound by, and the fold. The ceiling is Erik's function of LEVEL + the relevant CRAFT RANK, so the craft
 *  behind the binding has to be identified: the op may name it (`from`/`craft`), otherwise the character's
 *  best-ranked ability stands in. That is deliberately generous rather than strict — refusing a real
 *  in-fiction binding because the op didn't label its craft would recreate the exact frustration §251
 *  exists to end, and the ceiling still bounds how much it can grant.
 *
 *  ONE set of numbers for every path: the GM's itemUpdates, a deriveItem split, and the player's own
 *  "evolve this" action all pass through here, so no route can quietly grant more than another. */
function itemEvolveDeps(ops = []) {
  const named = (Array.isArray(ops) ? ops : [ops]).flatMap(o => [o?.craft, o?.from, ...(Array.isArray(o?.grants) ? o.grants.map(g => g?.from) : [])]).filter(Boolean).join(" ").toLowerCase();
  let rank = 0;
  for (const owned of (character.abilities || [])) {
    const ab = fullCatalog()[owned.abilityId]; if (!ab) continue;
    const mentioned = named && (named.includes(String(ab.id).toLowerCase()) || named.includes(String(ab.name || "").toLowerCase()));
    if (mentioned) { rank = Math.max(rank, owned.level || 1); }
  }
  if (!rank) for (const owned of (character.abilities || [])) rank = Math.max(rank, owned.level || 1); // best craft stands in
  return { ceiling: grantCeiling(character, rank), foldGrants };
}

/** SNG-250 §5: the generatable set, DERIVED — a type generates when a derived genSchema exists for it
 *  (state.js builds CONTENT.genSchemas from schemas/<type>.schema.json). Built once at load. */
let GENERATABLE_TYPES = new Set();

/** CCODE-55 (SNG-250 §4): THE encounter table — authored pool + this character's GENERATED creatures.
 *
 *  `CONTENT.randomEncounters` is built once at load from authored content, but a grown creature lives on
 *  the character. Every read of the pool goes through here so a generated monster is reachable by the
 *  SAME paths an authored one is — the offer list, the trigger roll, the dev buttons, the engage lookup.
 *  Reading `CONTENT.randomEncounters` directly anywhere is the bug this function exists to prevent: the
 *  creature would be minted and un-fightable (SNG-229 seam_bestiary_loaded, restated for generation), and
 *  it would be invisible in a way nothing errors on. Cheap — a map over a handful of records per read. */
function encounterTable() {
  const base = CONTENT.randomEncounters;
  if (!base) return base;
  // Your OWN grown creatures are fightable immediately; creatures other players have made arrive through
  // shared canon (SNG-250 §7b). Both go through generatedCreatureEncounters, so a grown monster draws its
  // threat/weight/minDanger from BEAST_TIER exactly as an authored one does — one difficulty curve for the
  // whole valley. Deduped by id: once your own creature comes back to you through canon it is still ONE
  // entry in the pool, not two.
  const grown = (() => {
    try {
      const mine = generatedCreatureEncounters(character);
      const theirs = sharedCreaturePool.length ? generatedCreatureEncounters({ generated: { creature: Object.fromEntries(sharedCreaturePool.map(c => [c.id, c])) } }) : [];
      const seen = new Set(mine.map(e => e.id));
      return [...mine, ...theirs.filter(e => !seen.has(e.id))];
    } catch { return []; }
  })();
  return grown.length ? { ...base, encounters: [...(base.encounters || []), ...grown] } : base;
}

/** SNG-250 §4 — the two halves must not drift apart, in EITHER direction, and both directions are real:
 *   • generatable but UNCONTRACTED = the engine can mint the type and nothing checks it is born whole.
 *     checkBorn reports `gated:false` for it, so it passes silently — the hollow-content hole this
 *     ticket exists to close, reopened by omission.
 *   • contracted but NOT generatable = the contract governs authored content only (the CI half), which
 *     is exactly the half-wired state the map sat in before it was promoted.
 *  Neither is fatal and neither should be silent, so both are named at boot beside the content canary.
 *  (Today: `arc` generates and has no contract — SNG-250 §3 defines one, it is simply not in the map
 *  yet; and quest/creature/item/skill are contracted with no generator. Both lists shrink as SNG-250
 *  lands, and this line is how anyone can see where the seam currently is.) */
function reportContractCoverage() {
  const contracted = new Set(contractedTypes(CONTENT.consumerContract));
  const ungated = [...GENERATABLE_TYPES].filter(t => !contracted.has(t));
  const ciOnly = [...contracted].filter(t => !GENERATABLE_TYPES.has(t));
  console.log(`[born-contract] generatable=${[...GENERATABLE_TYPES].join(",") || "none"} contracted=${[...contracted].join(",") || "none"}`
    + (ungated.length ? ` | ⚠ GENERATES BUT UNCONTRACTED (born-whole unchecked): ${ungated.join(",")}` : "")
    + (ciOnly.length ? ` | contracted but not generatable (CI half only): ${ciOnly.join(",")}` : ""));
}

/** The GM asked the world to grow. For each request (governor-capped per scene), author the
 *  durable in-grain entity via generate(), register it live so it's usable + revisitable NOW,
 *  and return light notes to surface. Never throws — generation must not halt a turn. */
async function handleGenerateRequests(turn) {
  const reqs = Array.isArray(turn.generateRequest) ? turn.generateRequest
    : (turn.generateRequest ? [turn.generateRequest] : []);
  if (!reqs.length) return [];
  ensureGenerated(character);
  const location = hereNow();
  // (genContractDeps below supplies the SNG-250 born-whole contract to every generate() call)
  const time = readClock(character.clock);
  const memCtx = { locationId: location.id, day: time.day, entities: codexEntities(), rules: CONTENT.rules, affiliate: affiliateNpc };
  const notes = [];
  for (const req of reqs.slice(0, 3)) {
    const type = req?.type;
    // SNG-250 §5 (CCODE-55): which types may generate is DATA, not a literal. A type is generatable
    // when it has a derived genSchema, so opening one means adding schemas/<type>.schema.json and
    // registering it in state.js — never editing this line. The hardcoded ["npc","location","arc"]
    // that used to sit here would have silently vetoed a newly schema'd type and made the next
    // "generation is open for creature" ship as a no-op.
    if (!GENERATABLE_TYPES.has(type)) continue;                // generation disabled for this type
    const budget = Math.max(0, 3 - sceneGenCount);              // per-scene governor cap
    if (budget <= 0) break;
    const authored = type === "npc" ? CONTENT.npcs : type === "location" ? CONTENT.locations : {};
    const before = new Set(Object.keys(character.generated?.[type] || {}));
    const ctx = {
      location, character, playerKey: getPlayerKey(), day: time.day, season: time.season || null,
      hint: req.hint, why: req.why, birthPower: character.level,
      rating: ratingCeilingNow(),                              // §3 consumer (b+c): generate to the ceiling + tag the entity
      contentGenerator: !!profile?.contentGenerator,          // SNG-132: a family author's content persists more readily
      known: { authored, generated: character.generated?.[type] || {} },
      examples: pickExamples(type, location), substrate: CONTENT.substrate, genBudget: budget,
      traditionIndex: CONTENT.traditionIndex,  // SNG-177: a generated NPC arrives with a people + domains
      // SNG-166 §3: he keeps meeting Mara. Across 10 characters on this device, 5 given names
      // recur and Mara appears in FOUR saves — invisible to any per-character check.
      avoidNames: namesToAvoid(allCharactersOnDevice(), 24),
      namingAesthetic: namingAestheticHere(),
      validRegions: new Set(Object.keys(CONTENT.substrateModel?.substrateDensity || {}).concat((CONTENT.regions || []).map(r => r.regionId || r.id).filter(Boolean)))   // SNG-166 §1
    };
    // SNG-035/046-L3: born-WITH-image is now IN the generate path (deps.imageFor) so the record
    // arrives with its picture regardless of caller — the app just injects the art builder.
    const imageFor = (entity, t) => imagesEnabled() ? ensureImage(entity, t, { ratingLevel: viewerRatingLevel() }) : null;
    let rec = null;
    try { rec = await generate(type, ctx, { callJSON: callClaudeJSON, schema: CONTENT.genSchemas[type], applyCodexUpdates, codexCtx: memCtx, imageFor, ...genContractDeps() }); }
    catch { rec = null; }
    // SNG-190 §2: if this npc request is fleshing out someone MET the same turn, it is ONE person —
    // re-home the fresh record onto the met id (npcs.js owns npc identity), so two ids never survive.
    if (rec && rec._gen && type === "npc") reconcileGeneratedNpcWithMeet(character, turn.npcUpdates, req, rec);
    if (rec && rec._gen && !before.has(rec.id)) {              // a NEW mint (not a reuse of authored/existing)
      sceneGenCount++;
      // the record was born with its image in generate(); mirror it into the gallery
      if ((type === "npc" || type === "location") && rec.image) {
        try { addGalleryImage(character, { kind: type, prompt: rec.name, url: rec.image, caption: rec.name, worldDay: absoluteWorldDay() }); }
        catch (err) { console.warn("[art] gallery add skipped:", err?.message); }
      }
      // SNG-046: a generated location gets stable map coords on mint (near its parent) so it
      // appears on the map immediately and never jumps between renders.
      if (type === "location") {
        // SNG-154: THIS is the promotion path that lost the Inn (a generateRequest, not
        // mintTransitLocation). If the generated place was already a sub-place of somewhere, keep
        // that containment — and anchor its coords to the PARENT rather than to wherever the
        // character happens to be standing.
        const promotedFrom = findSubPlaceParent(character, rec.name) || findSubPlaceParent(character, rec.id);
        if (promotedFrom && !rec.parentId) { rec.parentId = promotedFrom.parentId; rec._promotedFromSubPlace = true; }
        if (!rec.parentId && hereNow()?.id) rec.parentId = hereNow().id; // born inside where we stand
        if (!rec.map || !Number.isFinite(rec.map.x)) {
          const existing = {}; for (const l of Object.values(CONTENT.locations)) if (l.map) existing[l.id] = l.map;
          const anchor = (rec.parentId && CONTENT.locations[rec.parentId]?.map) || hereNow().map;
          rec.map = coordForGenerated(rec.id, anchor, existing);
        }
      }
      if (type === "location") CONTENT.locations[rec.id] = rec;
      else if (type === "npc") CONTENT.npcs[rec.id] = rec;
      notes.push({ type, name: rec.name, id: rec.id });
      autoVerifyLeg("b9p1-generate", `minted a ${type}: ${rec.name}`);          // SNG-051 auto-verify
      if (rec.image) autoVerifyLeg("sng035-scene", `generated ${type} born with its image`);
    }
  }
  return notes;
}

/** Active encounter def + state, or null. */
function activeEnc() {
  const e = character?.activeEncounter;
  if (!e) return null;
  const def = CONTENT.encounters?.[e.defId] || character.customEncounters?.[e.defId];
  return def ? { def, state: e.state } : null;
}

function listAvailableEncounters() {
  const loc = CONTENT.locations[character.currentLocationId] || {};
  // Hand-authored, curated per-location seeds (a signature ambush at a signature place) — kept.
  const seedLines = (loc.encounterSeeds || []).map(seed => {
    const def = CONTENT.encounters?.[seed.encounterId];
    return def ? `- id "${def.id}" (${def.type}): ${def.name} — ${seed.hint}. Setup: ${def.setup}` : null;
  }).filter(Boolean);
  // SNG-231 §3 (the keystone): ADD the eligible random POOL (SNG-225, danger-gated) + the bestiary (SNG-229
  // beast_ duels, already merged into the pool). The two encounter systems now TALK — the rich encounters we
  // built are reachable through GM OFFERS (rule 18), not just the sparse hand-seeds. Danger-gated: a calm place
  // surfaces little, a dangerous one real threats; the GM still only offers when the fiction invites.
  const seeded = new Set((loc.encounterSeeds || []).map(s => s.encounterId));
  // CCODE-52: the pool the GM is offered revolves around THIS character's power — the region supplies the cast,
  // the player's power supplies the mean, and a foe they have outgrown drops out unless it is special.
  const poolLines = eligibleEncountersFor(encounterTable(), loc, { power: characterPower(character, CONTENT.rules?.threat || {}) })
    .filter(e => !seeded.has(e.id))                              // don't duplicate a hand-seeded encounter
    .map(e => `- id "${e.id}" (${e.routing}${e.flavor ? "/" + e.flavor : ""}): ${smartClamp(String(e.seed || e.look || e.id), 150)}`);
  const lines = [...seedLines, ...poolLines];
  return lines.length ? lines.join("\n") : null;
}

/** SNG-236 UX: the ⚙ Moves gear for an active encounter. Groups the encounter's contextual actions (attempt/
 *  stage/unlock + the ways out) and the player's owned abilities BY FUNCTION FAMILY (ward=PROTECT, sense=KNOW,
 *  strike=HARM …, the 24-verb vocabulary) into one tidy panel. The exits/primary fire through the existing
 *  [data-encact] path; an ability-move fires through onFreeform (parseIntent → onChoice) so the roll params are
 *  derived correctly and — because an encounter is active — the encounter rules bind. The free-type field stays
 *  the open path; this is grouped shortcuts, never a replacement (SNG-230: the frame is a legibility layer). */
function encounterMovesPanel(fm = null) {
  const e = activeEnc(); if (!e) return "";
  const d = e.def;
  // SNG-252 §2c: the moves now know the KIND. `fm` is the frame model the ribbon already built — passed in
  // rather than recomputed so the moves and the frame can never disagree about what kind of thing this is
  // (the seam_encounter_kind_single_source rule). Falls back to the def's own kind when called without one.
  const kind = fm?.kind || encounterKind(d) || "fight";
  const hints = CONTENT.moveHints || {};
  const copy = CONTENT.ribbonCopy || {};
  const kindHints = hints.byKind?.[kind] || {};
  // SNG-252 §2c: the ways out are RELABELLED from the frame, never rebuilt from it. SNG-247 made the frame's
  // exit WORDS kind-correct (a chase "breaks away", a standoff "withdraws", a crossing "turns back") while this
  // panel still printed the generic duel words beside them — two vocabularies for one act. Only the label is
  // taken: the ACTION stays the known-good [data-encact] value the dispatcher handles, because the frame's
  // `defeat` exit is the PRIMARY move (Commit / Strike / Press / Work it), not a way out, and its `strike`
  // action has no dispatcher case at all. Rebuilding the buttons from fm.exits would have filed "Push on"
  // under "ways out" and wired a dead button.
  const exitLabel = (act, fallback) => fm?.exits?.find(x => x.action === act && x.role !== "defeat")?.label || fallback;
  const mk = (label, act, extra = "") => `<button class="move-btn enc-move" data-encact="${act}"${extra}>${esc(label)}</button>`;
  const primary = [], exits = [];
  if (d.type === "duel") { exits.push(mk(`⚑ ${exitLabel("flee", "Break away & flee")}`, "flee"), mk(exitLabel("yield", "Yield"), "yield")); }
  if (d.type === "challenge") { primary.push(mk(`Attempt: ${d.stages[e.state.stageIndex]?.name || "the stage"}`, "stage")); exits.push(mk(exitLabel("abandon", "Abandon"), "abandon")); }
  if (d.type === "puzzle") {
    primary.push(mk("Work the mechanism", "attempt"));
    for (const [ui, u] of puzzleUnlocks(d, character).entries()) primary.push(mk(`◈ ${String(u.note).slice(0, 56)}`, "unlock", ` data-unlock="${ui}"`));
    exits.push(mk(exitLabel("walkAway", "Walk away"), "walkAway"));
  }
  // owned abilities → grouped by function family (the 24-verb vocabulary; ward/sense/strike are its verbs)
  const owned = (character.abilities || []).map(a => fullCatalog()[a.abilityId]).filter(Boolean);
  const byFam = {};
  for (const ab of owned) {
    const fam = (familiesOfAbility(ab, FN_INDEX)[0]) || "SHAPE";
    const verb = (ab.functions || [])[0] || "use";
    (byFam[fam] = byFam[fam] || []).push({ ab, verb });
  }
  // SNG-252 §2c: KIND-AWARE ORDER. The families a kind actually trades in come first (a standoff leads with
  // INFLUENCE/KNOW, a fight with HARM) — same grouping, different emphasis. Families the kind has no opinion
  // about keep their canonical order behind the emphasised ones, so nothing ever disappears.
  const emphasis = Array.isArray(kindHints.emphasis) ? kindHints.emphasis : [];
  const ordered = [...emphasis.filter(f => byFam[f]?.length), ...FUNCTION_FAMILIES.filter(f => byFam[f]?.length && !emphasis.includes(f))];
  const famGroups = ordered.map(f => {
    // The hint may be a plain string, or an object with `.weak` — a family this kind cannot spend
    // meaningfully. A weak move stays CLICKABLE (moves are shortcuts, not a cage — the §2c guard); it is
    // only marked, so the player can see it is off-currency before spending the beat.
    const raw = kindHints.families?.[f] ?? hints.default?.[f] ?? null;
    const weak = raw && typeof raw === "object" && raw.weak;
    const hintText = raw == null ? "" : (typeof raw === "string" ? raw : (raw.text || ""));
    const chips = byFam[f].slice(0, 6).map(({ ab, verb }) => {
      // SNG-230 §7b: a move the encounter WARDS reads disabled-with-reason here, rather than being offered
      // and then refused after the player has spent the click.
      const ward = wardDenialFor(d, f, ab);
      if (ward) return `<button class="move-btn move-ability move-warded" disabled title="${esc(ward)}">${esc(ab.name)} <span class="move-ward">⚑</span></button>`;
      return `<button class="move-btn move-ability${weak ? " move-weak" : ""}" data-moveab="${esc(ab.id)}" data-verb="${esc(verb)}" style="border-left-color:${FAMILY_COLOR[f]}" title="${esc(verb)} — ${esc(ab.name)}${hintText ? ` · ${hintText}` : ""}">${esc(ab.name)}</button>`;
    }).join("");
    const hintHtml = hintText ? ` <span class="moves-group-hint${weak ? " weak" : ""}">· ${esc(hintText)}</span>` : "";
    return `<div class="moves-group"><div class="moves-group-lbl"><span style="color:${FAMILY_COLOR[f]}">${FAMILY_GLYPH[f]}</span> ${esc(f.toLowerCase())}${hintHtml}</div><div class="moves-chips">${chips}</div></div>`;
  }).join("");
  const thisLabel = copy.movesHeader?.thisEncounterLabel?.[kind] || `this ${d.type === "duel" ? "fight" : d.type}`;
  const waysOutLabel = copy.movesHeader?.waysOutLabel || "ways out";
  const ctx = [
    primary.length ? `<div class="moves-group"><div class="moves-group-lbl">${esc(thisLabel)}</div><div class="moves-chips">${primary.join("")}</div></div>` : "",
    exits.length ? `<div class="moves-group"><div class="moves-group-lbl">${esc(waysOutLabel)}</div><div class="moves-chips">${exits.join("")}</div></div>` : ""
  ].join("");
  const header = String(copy.movesHeader?.text || "Your moves — grouped by what they do. Or describe your own below; the {kind} rules bind either way.").replace(/\{kind\}/g, kind);
  return `<div class="moves-panel"><div class="moves-hint">${esc(header)}</div>${ctx}${famGroups || `<div class="moves-hint dim">No learned crafts to shortcut yet — describe your move below.</div>`}</div>`;
}

/** SNG-252b §2a: the COLLAPSED moves affordance — "⚙ Your moves — 4 reads, 1 strike · tap to open".
 *
 *  Collapsing is only an improvement if it costs no information about WHAT you have; a bare "⚙ Moves" would
 *  make the player open it just to find out. The tally is by family, in the family's plain word (Aevi's
 *  `summaryFormat`), so the summary answers the question the cards were answering. */
function movesSummaryLine(copy = {}) {
  const c = copy.collapsedMoves || {};
  const owned = (character.abilities || []).map(a => fullCatalog()[a.abilityId]).filter(Boolean);
  const tally = {};
  for (const ab of owned) { const f = (familiesOfAbility(ab, FN_INDEX)[0]) || "SHAPE"; tally[f] = (tally[f] || 0) + 1; }
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return c.empty || "⚙ No learned crafts to shortcut — describe your move below";
  const summary = entries.map(([f, n]) => `${n} ${FAMILY_PLAIN_WORD[f] || f.toLowerCase()}${n === 1 ? "" : "s"}`).join(" · ");
  return String(c.summary || "⚙ Your moves — {summary} · tap to open").replace("{summary}", summary);
}

/** SNG-253 (engine half): stamp the encounter KIND onto the opponent before its sheet is synthesized, so the
 *  opponent's move VOCABULARY can be kind-native ("press a point" in a standoff, "cut you off" in a chase)
 *  instead of falling to the fight default. The kind comes from `encounterKind(def)` — the ONE source
 *  (seam_encounter_kind_single_source), never re-derived here — and rides on the opponent because that is what
 *  the synthesizer receives. Additive: with no per-kind archetypes authored yet, nothing changes. */
function withKind(opponent, def) {
  try { const k = encounterKind(def); return k ? { ...(opponent || {}), encounterKind: k } : opponent; }
  catch { return opponent; }
}

/** SNG-252b §2a: the family's plain word for the collapsed summary — "4 reads", not "4 KNOW". */
const FAMILY_PLAIN_WORD = { HARM: "strike", PROTECT: "guard", KNOW: "read", INFLUENCE: "press", SHAPE: "shaping", MOVE: "move", RESTORE: "mend", SUSTAIN: "steadying" };

/** SNG-252 §2c / SNG-230 §7b: is this move WARDED by the encounter? Returns the reason, or null.
 *  A ward is authored on the def (wards: [{family|ability, reason}]) or supplied by the frame content's
 *  wardDenials. Reading it HERE — before the chip renders — is the whole point: the player sees the closed
 *  door instead of walking into it. */
function wardDenialFor(def, family, ability) {
  const wards = Array.isArray(def?.wards) ? def.wards : [];
  for (const w of wards) {
    if (w?.ability && w.ability === ability?.id) return w.reason || "warded here";
    if (w?.family && String(w.family).toUpperCase() === String(family).toUpperCase()) return w.reason || "warded here";
  }
  const denials = CONTENT.encounterFrameContent?.wardDenials || {};
  const byFam = denials[String(family).toUpperCase()];
  if (byFam && def?.warded) return typeof byFam === "string" ? byFam : (byFam.text || "warded here");
  return null;
}

/** End an encounter: outcome XP, clear state, incapacitation floor. */
function endEncounter(outcome) {
  const enc = activeEnc();
  if (!enc) return;
  // SNG-271/1a: `rules/encounters.json` was NEVER REGISTERED — 43 rules keys and `encounters` not among them —
  // so this lookup was always undefined and `?? 0` paid nothing. Winning, solving, fleeing, walking away:
  // every encounter in the game has awarded ZERO XP, always. Now registered, loaded, and falling back to
  // `default` so a NEW encounter type can never silently pay zero the same way again.
  const encXp = CONTENT.rules.encounters || {};
  const t = encXp[enc.def.type] || encXp.default || {};
  const xpMap = { opponent_fell: t.winXp, opponent_yielded: t.winXp, fled: t.fleeXp, yielded: t.yieldXp, completed: t.completeXp, abandoned: t.abandonXp, solved: t.solveXp, walked_away: t.walkAwayXp, incapacitated: 0 };
  character.xp += Math.max(0, xpMap[outcome] ?? 0);
  for (const c of activeCompanions(character, CONTENT.companions)) growBond(character, c.id, "encounter", CONTENT.rules);
  character.activeEncounter = null;
  movesOpen = false; // SNG-252b §2a: reset to COLLAPSED, so the next encounter opens clean
  if (outcome === "incapacitated") {
    // SNG-309 — GOING DOWN IS NOT THE END, AND IT IS NOT NOTHING EITHER.
    //
    // This used to be two lines: `lethal` set `character.dead = true` (a TERMINUS — the roster says "their
    // story is over" and refuses to load them), and every other defeat restored you to 1 hp at no cost at
    // all. Two of nineteen encounter defs are lethal, so in practice a player could be killed by a wild boar
    // or a greatcat and by nothing else in the game — not by an assassin, not by a legend.
    //
    // Now what happens next depends on WHO put you there and who was with you, and death — when it comes —
    // enters the SAME ladder every figure in the valley is on (SNG-209), so a party can come after you.
    const plan = incapacitationOutcome({
      // ⚠️ THE DERIVED LETHALITY, not the hand-set flag — the same answer `lethalOfferClamp` warned on.
      // If the warning and the consequence read different fields, the game warns about one thing and does
      // another, which is worse than not warning at all.
      character, aggressor: enc.def?.opponent || enc.opponent || {},
      encounter: { ...enc.def, lethal: isLethalEncounter(enc.def, CONTENT.rules) },
      companions: activeCompanions(character, CONTENT.companions), rules: CONTENT.rules,
    });
    character.lastIncapacitation = { ...plan, day: character.clock?.day ?? null };
    if (plan.gearTaken.length) {
      const gone = new Set(plan.gearTaken);
      character.inventory = (character.inventory || []).filter(i => !gone.has(i?.customName || i?.name));
    }
    if (plan.slain) {
      // ⛔ NOT `character.dead`. That flag is the TERMINUS and belongs only to a SEALED death — while a death
      // is retrievable the character is dead and STILL ON THE BOARD, which is the whole of SNG-209.
      // ⚠️ THE WORLD DAY, NOT `character.clock.day`. `deathDepth` subtracts `diedDay` from whatever day it
      // is handed, and the deepening pass runs on `absoluteWorldDay` — stamping this with the character's
      // own story clock would compare two different clocks and produce a depth that means nothing. The same
      // units trap as stepping a world harness by hours instead of days.
      let deathDay = 0; try { deathDay = absoluteWorldDay(); } catch { deathDay = character.clock?.day ?? 0; }
      enterDeathState(character, playerDeathState(plan, { worldDay: deathDay }));
      character.health = 0;
    } else {
      character.health = Math.max(1, character.health);
      character.energy = Math.max(5, character.energy);
      character.clock = character.clock || { day: 1 };
      character.clock.day = (character.clock.day || 1) + (plan.daysDown || 0);   // time passes while you are down
    }
  }
  saveCharacter(character);
}

// ---------- party (SNG-001 phase 1) ----------

/** Turn a raw GitHub transport error into an actionable sentence for the player. */
function syncErrorMessage(prefix) {
  const e = lastSceneError() || "";
  if (/403/.test(e)) return `${prefix}: your GitHub token can't WRITE to this repo. In GitHub → token settings, give it Contents: Read and write on the ${getSyncConfig().repo || "Singularity"} repo (classic tokens need the "repo" scope), then re-paste it in Settings.`;
  if (/404/.test(e)) return `${prefix}: repo or path not found — check the owner and repo names in Settings.`;
  if (/401/.test(e)) return `${prefix}: your GitHub token was rejected (expired or mistyped) — paste a fresh one in Settings.`;
  if (/not configured/.test(e)) return `${prefix}: shared-world sync isn't set up — add your GitHub owner/repo/token in Settings first.`;
  return `${prefix}${e ? " (" + e + ")" : ""}.`;
}

async function startPartyScene() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const scene = newSharedScene(character.currentLocationId, character, stamp);
  const pushed = await pushSceneWithMerge(scene.sceneId, s => s, scene);
  if (!pushed) { alert(syncErrorMessage("Could not create the shared scene")); return; }
  enterPartyScene(pushed);
}

async function joinPartyScene(sceneId) {
  const joined = await pushSceneWithMerge(sceneId, s => addMember(s, character));
  if (!joined) { alert(syncErrorMessage("Could not join the shared scene")); return; }
  enterPartyScene(joined);
}

function enterPartyScene(scene) {
  sharedScene = scene;
  seenBeats = scene.beats.length;
  character.sharedSceneId = scene.sceneId;
  saveCharacter(character);
  if (partyPoll) clearInterval(partyPoll);
  partyPoll = setInterval(pollPartyScene, 20000);
  renderPlay(character.activeScene?.lastTurn || null, { aside: `Shared scene: ${scene.party.map(m => m.name).join(", ")}. Turns rotate — act when it's yours.` });
}

async function leavePartyScene() {
  const id = character.sharedSceneId;
  if (partyPoll) { clearInterval(partyPoll); partyPoll = null; }
  hidePartyBanner(true);
  sharedScene = null; character.sharedSceneId = null; saveCharacter(character);
  if (id) pushSceneWithMerge(id, s => removeMember(s, character.id));
  renderPlay(character.activeScene?.lastTurn || null, { aside: "You part ways with the party — solo play resumes." });
}

async function pollPartyScene() {
  if (!character?.sharedSceneId || busy) return;
  const remote = await fetchScene(character.sharedSceneId);
  if (!remote) return;
  const hadNew = remote.beats.length > seenBeats;
  const newBeats = remote.beats.slice(seenBeats).filter(b => b.by !== character.id);
  sharedScene = remote;
  if (hadNew) {
    seenBeats = remote.beats.length;
    for (const b of newBeats) sceneTurns.push({ summary: `${b.name}: ${b.summary}` });
    if (newBeats.length) {
      // NON-DESTRUCTIVE: never re-render from a poll (it would wipe the input + current
      // beat). Stash the new beats and show a catch-up banner the player folds in when ready.
      pendingPartyBeats.push(...newBeats);
      showPartyBanner();
    }
  }
  // an empty poll (no new beats) does NOTHING to the DOM — your text + scene stay put.
}

/** Non-destructive toast: another player has acted. Injected directly into the DOM,
 *  never through renderPlay, so the input box and current response are untouched. */
function showPartyBanner() {
  if (!pendingPartyBeats.length) return;
  let el = document.getElementById("party-banner");
  if (!el) { el = document.createElement("div"); el.id = "party-banner"; el.className = "party-banner"; document.body.appendChild(el); }
  const names = [...new Set(pendingPartyBeats.map(b => b.name))].join(", ");
  const yourTurn = sharedScene && isMyTurn(sharedScene, character.id);
  el.innerHTML = `<span class="pb-dot"></span><span class="pb-text">${esc(names)} acted — ${pendingPartyBeats.length} update${pendingPartyBeats.length > 1 ? "s" : ""} ready${yourTurn ? " · your turn" : ""}</span><button class="pb-btn" id="pb-catchup">Catch up</button><button class="pb-x" id="pb-dismiss" title="Dismiss">×</button>`;
  el.style.display = "flex";
  document.getElementById("pb-catchup").onclick = catchUpParty;
  document.getElementById("pb-dismiss").onclick = () => hidePartyBanner();
}

function hidePartyBanner(clear = false) {
  const el = document.getElementById("party-banner");
  if (el) el.style.display = "none";
  if (clear) pendingPartyBeats = [];
}

/** Fold the pending party beats into the view — the ONE place a party update re-renders,
 *  and it preserves whatever the player was typing. */
function catchUpParty() {
  const beats = pendingPartyBeats.slice();
  pendingPartyBeats = [];
  hidePartyBanner();
  const draft = document.getElementById("freeform-input")?.value || "";
  renderPlay(character.activeScene?.lastTurn || null, {
    aside: beats.map(b => `${b.name}: ${b.label}${b.degree ? ` (${b.degree.replace("_", " ")})` : ""} — ${b.summary}`).join("; ")
  });
  if (draft) { const fi = document.getElementById("freeform-input"); if (fi) fi.value = draft; }
}

/** Publish my beat to the shared scene (fire-and-forget; solo play never blocks). */
function publishPartyBeat(label, degree, summary) {
  if (!sharedScene || !character.sharedSceneId) return;
  const beat = { by: character.id, name: character.name, label, degree, summary, at: new Date().toISOString() };
  const encReceipt = activeEnc() ? encounterReceiptForGM(activeEnc().state, activeEnc().def, null, null) : null;
  pushSceneWithMerge(character.sharedSceneId, s => setEncounterState(mergeBeat(s, beat), character.id, encReceipt))
    .then(next => { if (next) { sharedScene = next; seenBeats = next.beats.length; } });
}

/** World-tick choke point: run whenever the character (re)enters play or the
 *  clock jumps. Returns fresh news to show the player once. */
async function maybeTick() {
  const currentDay = readClock(character.clock).day;
  await runWorldTick({ character, content: CONTENT, currentDay });
  try { await runGenerationTurn({ character, content: CONTENT }); } catch (e) { console.warn("[generation] turn skipped:", e?.message); } // SNG-191 §7: the world's own agenda foments on the world count
  // SNG-204 Phase 2: open wakes generate the NEXT thread — the world continues from its own consequences. The
  // generator is the real generate("arc", …) call (only fires when generation is on); each eligible wake spawns
  // at most once, bounded by the depth throttle + count cap in eligibleWakes.
  try {
    await runWakeGeneration({ character, content: CONTENT, worldDay: absoluteWorldDay(),
      generateFn: async (wakeCtx) => generate("arc", {
        ...wakeCtx, character, location: CONTENT.locations[character.currentLocationId] || {},
        examples: CONTENT.genArc || [], rating: ratingCeiling(profile), genBudget: 1
      }, { callJSON: callClaudeJSON, schema: CONTENT.genSchemas?.arc || {}, applyCodexUpdates, codexCtx: { locationId: character.currentLocationId }, ...genContractDeps() })
    });
  } catch (e) { console.warn("[wake-gen] skipped:", e?.message); }
  await syncSharedWorld({ character, content: CONTENT }); // one valley for everyone (no-op without sync)
  const offscreen = await advanceGeneratedOffscreen({ character, content: CONTENT, model: worldTickModel() }); // SNG-BATCH-9 Phase 2 + SNG-198B: your grown world AND the people/great figures you know moved on while away (SNG-242: in-play world-tick model switch)
  if (offscreen && offscreen.length) autoVerifyLeg("b9p2-offscreen", "an established entity advanced offscreen; away-digest dated"); // SNG-051 auto-verify
  // SNG-BATCH-9 Phase 3: earn nominated entities into shared canon + read the shared world back
  // through THIS viewer's rating-lens. No-op without sync. Never throws.
  try {
    const canon = await syncSharedCanon({ character, profile, content: CONTENT });
    sharedCanonView = canon.view || [];
    hydrateCanonIntoContent(sharedCanonView);
    surfacePromotions(canon.promoted || []);
    if ((canon.promoted || []).length) autoVerifyLeg("b9p3-promote", "an entity promoted into shared canon");
    if (sharedCanonView.some(v => v.decision === "adapt" || v.decision === "filter")) autoVerifyLeg("b9p3-lens", "shared canon dialed down/filtered by the rating-lens");
  } catch (err) { console.warn("[canon] tick skipped:", err?.message); }
  // SNG-201: publish first-finder braids + adopt any the world found first; refresh the recipe cache.
  await syncBraidRecipes({ character, profile });
  try { runPressureProducers(); } catch (e) { console.warn("[pressure] producers skipped:", e?.message); } // SNG-245: feed the pressure queue from the agendas already in play
  // CCODE-18: pull-and-CLEAR the unseen news BEFORE the save, so the emptied queue is what persists. The old
  // order (save, THEN take) wrote the still-unread queue to storage and only cleared it in memory — so a hard
  // refresh before the next turn's own save reloaded the full queue and re-showed the same "while you were
  // away" digest every time. Taking first means this one save captures the tick's writes AND the empty queue.
  const freshNews = takeUnseenNews(character);
  saveCharacter(character);
  return freshNews;
}

/** Make the viewer's rating-lensed shared canon revisitable: merge canonical entities from OTHER
 *  players into the live CONTENT maps (authored + this character's own local content always win a
 *  clash). The records are already lens-resolved (shown/adapted) — a filtered one never arrives. */
function hydrateCanonIntoContent(view) {
  const creatures = [];
  for (const { record } of view || []) {
    const type = record?._canon?.type;
    if (type === "location" && !CONTENT.locations[record.id]) CONTENT.locations[record.id] = record;
    else if (type === "npc" && !CONTENT.npcs[record.id]) CONTENT.npcs[record.id] = record;
    else if (type === "creature" && record?.id) creatures.push(record);
  }
  // SNG-250 §7b (Erik): a generated creature is SHARED-ON-SIGHT — one valley, one bestiary. The shared set
  // is SNAPSHOTTED here rather than filtered at read time, and only while no encounter is live: that is the
  // "live-scene guard". A creature another player made can therefore only enter your world at a safe seam
  // (this runs in the world-tick, between scenes), never mid-encounter — the pool cannot change underneath
  // a fight you are already in, and because it is a snapshot rather than a filter, an id already offered
  // stays resolvable for the whole encounter.
  if (!activeEnc()) sharedCreaturePool = creatures;
}

/** One-time beat when THIS character's grown entity earns its way into the shared world. */
function surfacePromotions(promoted) {
  const landed = (promoted || []).filter(p => p.outcome === "landed" || p.outcome === "won");
  if (!landed.length || !character.worldState) return;
  const wd = absoluteWorldDay();
  const items = landed.map(p => {
    const rec = findGenerated(character, p.entityId);
    const name = rec?.name || p.entityId;
    return { day: readClock(character.clock).day, worldDay: wd,
      text: `${name} has become part of the wider world — other travelers may now meet what you grew.` };
  });
  character.worldState.unseenNews = [...(character.worldState.unseenNews || []), ...items].slice(-20);
}

/** SNG-BATCH-9 Phase 3: the shared-canon block for the GM — canonical figures/places/threads that
 *  OTHER players grew real, already resolved through this viewer's rating-lens (adapted lines
 *  carry a dial-down note; filtered ones never appear). Bounded. Returns null if none. */
function sharedCanonForGM() {
  if (!sharedCanonView.length) return null;
  const brief = (r) => {
    const t = r._canon?.type;
    const base = t === "npc" ? (r.role || "") : t === "location" ? (r.descriptionSeed || "") : (r.tendency || "");
    return String(base).slice(0, 90);
  };
  const lines = sharedCanonView.slice(0, 8).map(({ record, decision }) => {
    const t = record._canon?.type || "thing";
    const tier = record._canon?.tier === "variant" ? "rumored" : "canon";
    const lens = decision === "adapt" ? " [dialed to your ceiling]" : "";
    return `- ${record.name} (${t}, shared ${tier}${lens}): ${brief(record)}`;
  });
  return lines.join("\n");
}

/** The current location with the world's spectrum drift applied. */
function hereNow() {
  return effectiveLocation(CONTENT.locations[character.currentLocationId], character.worldState);
}

/** SNG-112: the context that decides which authored quests are STARTABLE here — the player's exact
 *  location + its adjacent locations (proximity), scene NPCs (giver present), and a giver→home map so
 *  a quest can be offered near its own place, not merely anywhere in a shared region. Region is passed
 *  but is only a soft signal (a quest board sets ctx.board; the scene never region-pushes). */
function questOfferContext(character, sceneState) {
  const here = CONTENT.locations?.[character.currentLocationId];
  const npcHomes = {};
  for (const [id, n] of Object.entries(CONTENT.npcs || {})) if (n?.homeLocation) npcHomes[slugify(id)] = n.homeLocation;
  return {
    region: here?.regionId || here?.region,
    locationId: character.currentLocationId,
    adjacentLocationIds: here?.connections || [],
    sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name),
    npcHomes
  };
}

// ---------- character creation ----------

const GEAR_BY_BACKGROUND = {
  "former-professional": ["prism_chip", "trade_tokens"],
  "community-organizer": ["trade_tokens", "dried_rations"],
  "craftsman": ["belt_knife", "hemp_rope"],
  "survivalist": ["hemp_rope", "dried_rations"],
  "medic": ["medics_satchel", "healing_draught"]
};

function startingGear(background) {
  const ids = ["travelers_pack", "waterskin", ...(GEAR_BY_BACKGROUND[background] || [])];
  return ids.map(id => CONTENT.items[id]).filter(Boolean).map(it => fromCatalog(it));
}

// SNG-063: origins + backgrounds are authored content (origins.json/backgrounds.json). These
// fallbacks only fire if the content files fail to load, so creation never dead-ends.
function originsFallback() {
  return [
    { id: "valleyfolk", name: "Valleyfolk", nativeTradition: "valley_craft", homeRegion: "valley", description: "Born to the Valley floor." },
    { id: "harmonic", name: "Harmonic", nativeTradition: "harmonic", homeRegion: "valley", description: "Of the resonant Heights." },
    { id: "radiant_plateau", name: "Radiant", nativeTradition: "radiant_folk", homeRegion: "valley", description: "Of the light Plateau." }
  ];
}
function backgroundsFallback() {
  return [
    { id: "craftsman", name: "Craftsman / Artisan", description: "Making, mending, material sense." },
    { id: "survivalist", name: "Survivalist", description: "Trails, weather, staying alive outdoors." },
    { id: "medic", name: "Medical Practitioner", description: "Healing arts, herbal and practical." }
  ];
}

// SNG-069A: a categorized background <select> — browsable by category, used by BOTH creation doors.
// Background is CHOSEN, never gated by origin/domain (a Cogitant duelist is a legitimate character).
const BG_CATEGORY_LABEL = { martial: "Martial", practitioner: "Practitioner (how you came to your craft)", craft: "Craft", learned: "Learned", social: "Social", marginal: "Marginal" };
function backgroundOptionsHTML(selectedId) {
  const bgs = CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
  const cats = [...new Set(bgs.map(b => b.category).filter(Boolean))];
  if (!cats.length) return bgs.map(b => `<option value="${esc(b.id)}" ${selectedId === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("");
  const order = ["martial", "practitioner", "craft", "learned", "social", "marginal"];
  return order.filter(c => cats.includes(c)).map(cat => `<optgroup label="${esc(BG_CATEGORY_LABEL[cat] || cat)}">${
    bgs.filter(b => b.category === cat).map(b => `<option value="${esc(b.id)}" ${selectedId === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")
  }</optgroup>`).join("");
}
// SNG-272 (Aevi) — A RECORD NOTHING FINDS. The twin of PromisedButUnread: that was a field nothing READ,
// this is an id that resolves to nothing. A character carries `community-organizer`; every authored id is
// snake_case (`organizer`), so `.find(...)` returned undefined and `|| {}` turned it into a plausible
// sentence. It failed SILENTLY AND DIFFERENTLY in four places at once — the tooltip printed "no fixed
// challenge affinity", the SOCIAL challenge edge never applied, `grantsAptitudes` never fired so the
// `banner` aptitude was never granted, and `seedInnateSubstrate` read the same empty record.
//
// Every writer in the current code validates against the catalog, so the bad id is LEGACY — which is why
// normalising ON READ is the fix that matters: it repairs saves that already exist and cannot be re-created.
// ⚠️ And a total miss is now LOUD. An id that resolves to nothing must never again render as prose.
const _bgMissWarned = new Set();
function backgroundById(id) {
  if (!id) return null;
  const list = CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
  const exact = list.find(b => b.id === id);
  if (exact) return exact;
  const normalised = String(id).replace(/-/g, "_");
  const near = normalised !== id ? list.find(b => b.id === normalised) : null;
  if (near) {
    if (!_bgMissWarned.has(id)) { _bgMissWarned.add(id); console.warn(`[background] legacy id "${id}" resolved to "${near.id}" — repairing on read (SNG-272)`); }
    return near;
  }
  if (!_bgMissWarned.has(id)) { _bgMissWarned.add(id); console.error(`[background] id "${id}" matches NO authored background — its affinity, aptitudes and innate access are all silently absent (SNG-272)`); }
  return null;
}

// SNG-BATCH-10 Phase 2: STARTING LOCATION. Every origin has a homeland (origins.json startingLocation)
// and creation defaults to it — but a player may always also start in the Valley (a character who
// already left) or at The Crossing (the center, where nobody is from). Ids read from content.
const VALLEY_START = "millbrook", CROSSING_START = "the_crossing";
function originRecord(originId) { return (CONTENT.origins?.length ? CONTENT.origins : originsFallback()).find(o => o.id === originId) || {}; }
function homelandFor(originId) { return originRecord(originId).startingLocation || CONTENT.startingLocation || VALLEY_START; }
/** The three offered starts (deduped): the origin's homeland (default) · the Valley · The Crossing.
 *  Only offers a location the content actually loaded, so a missing file never mints a broken start. */
function startingLocationChoices(originId) {
  const home = homelandFor(originId), seen = new Set(), out = [];
  const add = (id, label, why) => {
    if (!id || seen.has(id)) return; const loc = CONTENT.locations?.[id]; if (!loc) return;
    seen.add(id); out.push({ id, label: label || loc.name || id, why });
  };
  add(home, (CONTENT.locations?.[home]?.name || null), "your people's homeland — where you are from");
  add(VALLEY_START, "The Valley", "a character who already left home; the Valley is where you landed");
  add(CROSSING_START, "The Crossing", "the center — where nobody is from and everybody is");
  return out;
}
function defaultStart(originId) { const c = startingLocationChoices(originId); return (c.find(x => x.id === homelandFor(originId)) || c[0])?.id || CONTENT.startingLocation; }

function renderCreate() {
  const state = { name: "", origin: "valleyfolk", background: "craftsman", attrs: { physical: 3, mental: 3, social: 3, practical: 3 }, abilities: [],
    domains: { primary: null, secondary: null, tertiary: null }, companionId: null, companionName: "", form: "",
    // SNG-062 prologue accrual
    prologue: { openingId: null, step: 0, tags: {}, granted: [], reasons: [] } };
  const POOL = 12;

  const ORIGINS = () => CONTENT.origins?.length ? CONTENT.origins : originsFallback();
  const BGS = () => CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
  function maxAbilities() { return 2; } // SNG-063: fixed count, now filtered by domains

  /** SNG-063 quick-start step 1: NAME → FORM → ORIGIN → BACKGROUND → attributes.
   *  NO abilities here — abilities come AFTER domains (the order fix), filtered by them. */
  function draw() {
    const spent = Object.values(state.attrs).reduce((a, b) => a + b, 0);
    const left = POOL - spent;
    const origins = ORIGINS(), bgs = BGS();
    if (!origins.some(o => o.id === state.origin)) state.origin = origins[0]?.id || "valleyfolk";
    if (!bgs.some(b => b.id === state.background)) state.background = bgs[0]?.id || "craftsman";
    const org = origins.find(o => o.id === state.origin);
    const bg = bgs.find(b => b.id === state.background);
    const valid = state.name.trim().length > 0 && left === 0;

    chrome(`<div class="screen">
      <h2>New Character</h2>
      <div class="field"><label>Name</label><input id="c-name" value="${esc(state.name)}"></div>
      <div class="field"><label>Form / appearance <span class="hint" style="text-transform:none">(leads the portrait — blank = an ordinary person)</span></label>
        <textarea id="c-form" rows="2" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood">${esc(state.form)}</textarea></div>
      <div class="field"><label>Origin — which people are you from?</label>
        <select id="c-origin">${origins.map(o => `<option value="${esc(o.id)}" ${state.origin === o.id ? "selected" : ""}>${esc(o.name)}${o.homeRegion && o.homeRegion !== "valley" ? " — of the " + esc(String(o.homeRegion).replace(/_/g, " ")) : ""}</option>`).join("")}</select>
        <div class="hint">${esc(org?.description || "")}${org?.whyYouAreHere ? ` <em>${esc(org.whyYouAreHere)}</em>` : ""}</div></div>
      ${(() => { const sc = startingLocationChoices(state.origin); if (!sc.length) return ""; if (!sc.some(c => c.id === state.startingLocation)) state.startingLocation = defaultStart(state.origin);
        return `<div class="field"><label>Starting location <span class="hint" style="text-transform:none">(defaults to your homeland)</span></label>
        <select id="c-startloc">${sc.map(c => `<option value="${esc(c.id)}" ${state.startingLocation === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>
        <div class="hint">${esc((sc.find(c => c.id === state.startingLocation) || sc[0]).why)}</div></div>`; })()}
      <div class="field"><label>Background — what did you do? <span class="hint" style="text-transform:none">(browsable by category; never gated by your people)</span></label>
        <select id="c-bg">${backgroundOptionsHTML(state.background)}</select>
        <div class="hint">${esc(bg?.description || "")}</div></div>
      <div class="field"><label>Attributes — points left: <strong>${left}</strong> (each 1–4)</label>
        ${Object.entries(state.attrs).map(([k, v]) => `
          <div class="point-row">
            <button data-dec="${k}">−</button><span class="pips">${"●".repeat(v)}${"○".repeat(4 - v)}</span><button data-inc="${k}">+</button>
            <span style="text-transform:capitalize">${k}</span>
          </div>`).join("")}</div>
      <button class="btn" id="c-done" ${valid ? "" : "disabled"}>Next: your domains on the great circle</button>
    </div>`);

    document.getElementById("c-name").oninput = e => { state.name = e.target.value; document.getElementById("c-done").disabled = !(state.name.trim() && left === 0); };
    document.getElementById("c-form").oninput = e => { state.form = e.target.value; };
    document.getElementById("c-origin").onchange = e => { state.origin = e.target.value; state.domains = { primary: null, secondary: null, tertiary: null }; state.startingLocation = defaultStart(state.origin); draw(); };
    const slSel = document.getElementById("c-startloc"); if (slSel) slSel.onchange = e => { state.startingLocation = e.target.value; draw(); };
    document.getElementById("c-bg").onchange = e => { state.background = e.target.value; draw(); };
    for (const b of app.querySelectorAll("[data-inc]")) b.onclick = () => { const k = b.dataset.inc; if (state.attrs[k] < 4 && left > 0) state.attrs[k]++; draw(); };
    for (const b of app.querySelectorAll("[data-dec]")) b.onclick = () => { const k = b.dataset.dec; if (state.attrs[k] > 1) state.attrs[k]--; draw(); };
    document.getElementById("c-done").onclick = () => { state.form = document.getElementById("c-form").value.trim(); renderDomainStep(); };
  }

  /** SNG-063 quick-start step 3 (AFTER domains): abilities FILTERED to what the domains permit. */
  function renderAbilityStep() {
    const okAb = Object.values(CONTENT.abilities).filter(a => {
      if ((a.levelReq || 1) > 1) return false;
      const dv = domainAccess(a, a.levelReq || 1, state.domains, CONTENT.traditionIndex);
      return dv.allowed;
    });
    // SNG-192 §1: the by-right starter kit is computed HERE, not silently at commit, so a pick can never be
    // wasted on a craft the character already gets free. Grants are shown as a non-spendable group and
    // EXCLUDED from the choosable pool. (Recomputed on every entry, so a late attribute change is honoured.)
    const grantIds = nativeGrantIdsFor({ domains: state.domains, attributes: state.attrs, nativeTradition: state.nativeTradition, origin: state.origin }, CONTENT.rules);
    const grantSet = new Set(grantIds);
    const choosable = okAb.filter(a => !grantSet.has(a.id));
    state.abilities = state.abilities.filter(id => choosable.some(a => a.id === id)).slice(0, maxAbilities());
    const abTitle = (a) => { const r1 = a.tree?.find(x => x.rank === 1); return esc((r1 ? "Rank 1 “" + r1.name + "” — CAN: " + r1.grants + " | CANNOT: " + r1.cannot : a.description) + (a.notFor ? " | NOT FOR: " + a.notFor : "")); };
    const abBtn = (a, extraCls = "", whyHtml = "") => `<button class="opt ${extraCls} ${state.abilities.includes(a.id) ? "selected" : ""}" data-ab="${a.id}" title="${abTitle(a)}">${esc(a.name)}${whyHtml}</button>`;
    // SNG-192 §4: the archetype LENS (optional front door) — pick a shape (Magus, Shadow, Seer…) and the
    // suggestions lean toward its coreFunctions. A lens, never a class: it biases, the player changes any of it.
    const archetypes = CONTENT.classArchetypes?.archetypes || [];
    const selectedArch = archetypes.find(a => a.archetype === state.archetype) || null;
    const archetypeFams = selectedArch ? archetypeFamilies(selectedArch.coreFunctions, FN_INDEX) : null;
    // SNG-192 §3: suggestions with a REASON drawn from the shape chosen (§4), what the player DID (prologue) or WROTE (bio).
    const suggestions = suggestForCreation({
      learnable: choosable, character: { domains: state.domains, attributes: state.attrs, abilities: state.abilities.map(id => ({ abilityId: id })) },
      prologueTags: state.prologue?.tags || {}, bio: state.bio || {}, fnIndex: FN_INDEX,
      traditionIndex: CONTENT.traditionIndex, catalog: fullCatalog(), primary: state.domains?.primary || null,
      archetypeFams, archetypeName: selectedArch?.archetype || null, max: 5
    });
    const byTrad = {};
    for (const a of choosable) { const t = traditionOf(a, CONTENT.traditionIndex) || a.powerSystem || "folk"; (byTrad[t] = byTrad[t] || []).push(a); }
    const abById = Object.fromEntries(choosable.map(a => [a.id, a]));
    // SNG-192 Phase B — the robustness readout: what this build can and cannot DO (§5 coverage), where the
    // WHOLE kit works (§6b common ground), and the honest coherence↔divergence framing (§6c). Never blocks.
    const readoutHtml = (() => {
      const buildAb = [...grantIds, ...state.abilities].map(id => ({ abilityId: id }));
      if (!buildAb.length && !state.domains?.primary) return "";
      const cov = functionCoverage({ abilities: buildAb }, fullCatalog(), FN_INDEX);
      const trads = [state.domains?.primary, state.domains?.secondary, state.domains?.tertiary].filter(Boolean);
      const cg = commonGroundFor(trads, CONTENT.substrateModel);
      const covLine = buildAb.length
        ? `<div>You can ${cov.covered.length ? cov.covered.map(f => `${FAMILY_GLYPH[f] || "·"} ${f.toLowerCase()}`).join(" · ") : "— nothing yet"}.${cov.missing.length ? ` <span class="hint">No way to ${cov.missing.map(f => f.toLowerCase()).join(", ")} — a real choice, not a mistake.</span>` : " <span class='hint'>a balanced kit.</span>"}</div>`
        : "";
      let groundLine = "";
      if (cg.empty) {
        const hiT = cg.per.slice().sort((a, b) => b.lo - a.lo)[0], loT = cg.per.slice().sort((a, b) => a.hi - b.hi)[0];
        groundLine = `<div style="color:var(--warn,#e0b25a)">⚠ ${esc(traditionLabel(hiT.tradition))} and ${esc(traditionLabel(loT.tradition))} share no ground — wherever you stand, one of them is starved. A deliberate reach for two very different lands, never an accident.</div>`;
      } else if (cg.window) {
        groundLine = `<div>Your crafts all work in <strong>${esc(groundAsPlace(cg.window))}</strong> — where this character belongs.</div>`;
      }
      const width = cg.window ? cg.window[1] - cg.window[0] : 0;
      const frameLine = (cg.empty || width < 0.22)
        ? `<div class="hint" style="margin-top:2px">A <strong>divergent</strong> build — weaker in any one country, and exactly where new craft comes from. Off-source picks are seeds; the game will offer braids you never planned. <em>Divergence makes you new.</em></div>`
        : (trads.length > 1 ? `<div class="hint" style="margin-top:2px">A <strong>coherent</strong> build — strong in its own country. <em>Coherence makes you strong here; divergence makes you new.</em></div>` : "");
      return (covLine || groundLine || frameLine) ? `<div class="sys-group" style="margin-top:10px"><div class="sys-label">Your build so far</div>${covLine}${groundLine}${frameLine}</div>` : "";
    })();
    chrome(`<div class="screen">
      <h2>What have you learned?</h2>
      <p class="hint" style="margin-bottom:10px">Choose <strong>${maxAbilities()}</strong>. The far pole of what you are isn't here — only your primary, its kin, your secondary and tertiary, and the Valley's open folk arts.</p>
      ${grantIds.length ? `<div class="sys-group"><div class="sys-label">Yours by right of being ${esc(traditionLabel(state.domains?.primary || state.nativeTradition || state.origin))}</div>
        <p class="hint" style="margin:0 0 6px">Already yours — you don't spend a pick on these.</p>
        <div class="opt-row">${grantIds.map(id => { const g = fullCatalog()[id]; return g ? `<span class="opt" style="opacity:.6;cursor:default;border-style:dashed" title="${abTitle(g)}">✓ ${esc(g.name)}</span>` : ""; }).join("")}</div></div>` : ""}
      ${archetypes.length ? `<div class="sys-group"><div class="sys-label">A shape to start from — optional, a lens not a class</div>
        <div class="opt-row">${archetypes.map(a => `<button class="opt ${state.archetype === a.archetype ? "selected" : ""}" data-arch="${esc(a.archetype)}" title="${esc(a.whatItIsHere)}">${esc(a.archetype)}</button>`).join("")}</div>
        ${selectedArch ? `<p class="hint" style="margin-top:6px">${esc(selectedArch.whatItIsHere)} <em>${esc(selectedArch.signature)}</em> The suggestions below lean toward this shape now — change any, or click ${esc(selectedArch.archetype)} again to clear.</p>` : `<p class="hint" style="margin-top:4px">Pick a shape — Magus, Shadow, Seer, Warden… — to see a build lean your way, or ignore it and choose freely.</p>`}</div>` : ""}
      ${suggestions.length ? `<div class="sys-group"><div class="sys-label">Suggested for you</div>
        <div class="opt-row" style="flex-direction:column;align-items:stretch;gap:6px">${suggestions.map(s => { const a = abById[s.abilityId]; return a ? abBtn(a, "", ` <span class="hint" style="opacity:.75">— ${esc(s.why)}</span>`) : ""; }).join("")}</div></div>` : ""}
      <details ${suggestions.length ? "" : "open"} style="margin-top:4px">
        <summary style="cursor:pointer;color:var(--muted,#9aa2ad);padding:6px 0">See all crafts your domains open (${choosable.length})</summary>
        ${Object.keys(byTrad).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(t => `
          <div class="sys-group"><div class="sys-label">${esc(traditionLabel(t))}</div>
          <div class="opt-row">${byTrad[t].map(a => abBtn(a)).join("")}</div></div>`).join("") || "<div class='insight'>No level-1 abilities available for your domains — you'll learn as you play.</div>"}
      </details>
      ${readoutHtml}
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="ab-back">Back</button>
        <button class="btn" id="ab-done" ${state.abilities.length === maxAbilities() || !choosable.length ? "" : "disabled"}>Next: your companion</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-ab]")) b.onclick = () => {
      const id = b.dataset.ab;
      if (state.abilities.includes(id)) state.abilities = state.abilities.filter(x => x !== id);
      else if (state.abilities.length < maxAbilities()) state.abilities.push(id);
      renderAbilityStep();
    };
    // SNG-192 §4: the archetype lens toggles — it biases the suggestions, never touches the picks (never locks).
    for (const b of app.querySelectorAll("[data-arch]")) b.onclick = () => {
      state.archetype = (state.archetype === b.dataset.arch) ? null : b.dataset.arch;
      renderAbilityStep();
    };
    document.getElementById("ab-back").onclick = () => renderDomainStep();
    document.getElementById("ab-done").onclick = () => renderCompanionStep();
  }

  // SNG-059 / SNG-055: pick primary / secondary / tertiary domains on THE GREAT CIRCLE. The ring,
  // neighbours, and antipodes are read from CONTENT.traditionIndex — never hardcoded.
  function renderDomainStep() {
    const idx = CONTENT.traditionIndex;
    if (!idx) { renderAbilityStep(); return; } // no traditions content → skip gracefully
    const order = ringOrder(idx);
    const d = state.domains;
    // SNG-063: origin SEEDS the circle — a pole-people's native tradition pre-fills the primary
    // (the player can Redo to change it); folk origins stay open (no seed).
    const nativeT = (ORIGINS().find(o => o.id === state.origin) || {}).nativeTradition;
    if (!d.primary && nativeT && !isFolkTradition(nativeT, idx) && idx.byId?.[nativeT]) d.primary = nativeT;
    const phase = !d.primary ? "primary" : !d.secondary ? "secondary" : !d.tertiary ? "tertiary" : "done";
    const antiP = d.primary ? antipodeOf(d.primary, idx) : null;
    const antiS = d.secondary ? antipodeOf(d.secondary, idx) : null;
    const closed = new Set([antiP, antiS].filter(Boolean));
    // SNG-125: the SECONDARY must be KIN-ADJACENT to the primary (a concentrated core); the TERTIARY is
    // FREE — anywhere legal, no longer bound to the secondary's neighbours (Erik rulings 1 + 4).
    const kinSet = d.primary ? new Set(kinSecondaryOptions(d.primary, idx)) : new Set();
    const selectable = (t) => {
      if (closed.has(t)) return false;
      if (phase === "primary") return true;
      if (phase === "secondary") return t !== d.primary && kinSet.has(t);
      if (phase === "tertiary") return t !== d.primary && t !== d.secondary;
      return false;
    };
    const svg = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary, closed, selectable,
      centerTop: phase === "done" ? "your domains" : "choose your " + phase,
      centerSub: phase === "secondary" ? "kin to your primary" : phase === "tertiary" ? "free — your wildcard reach" : phase === "done" ? "" : "the opposite pole closes" });
    const slot = (label, t) => `<div class="dom-slot"><span class="dom-slot-label">${label}</span> ${t ? `<strong>${esc(traditionLabel(t))}</strong>` : "<em>—</em>"}</div>`;
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Your place on the Great Circle</h2>
      <p class="hint" style="margin-bottom:8px">Twelve axes, twenty-four peoples — a ring where every craft sits opposite its antithesis. Your <strong>primary</strong> is who you are (all you can master); your <strong>secondary</strong> (<em>kin to your primary</em>) reaches tier III — a concentrated core; your <strong>tertiary</strong> is a <em>free wildcard</em>, reaching anywhere on the ring to tier II. The <strong>opposite pole</strong> of your primary and secondary is closed to you forever — only the great braids cross it.</p>
      ${svg}
      <div class="dom-slots">${slot("Primary", d.primary)}${slot("Secondary", d.secondary)}${slot("Tertiary", d.tertiary)}</div>
      ${closed.size ? `<div class="hint">Closed to you: ${[...closed].map(t => esc(traditionLabel(t))).join(", ")}</div>` : ""}
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="dom-reset">↺ Redo</button>
        <button class="btn" id="dom-done" ${phase === "done" ? "" : "disabled"}>${state.domainReturn === "prologue" ? "Confirm — this is who I am" : "Next: your companion"}</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-dom]")) b.onclick = () => {
      const t = b.dataset.dom;
      if (phase === "primary") d.primary = t;
      else if (phase === "secondary") d.secondary = t;
      else if (phase === "tertiary") d.tertiary = t;
      renderDomainStep();
    };
    document.getElementById("dom-reset").onclick = () => { state.domains = { primary: null, secondary: null, tertiary: null }; renderDomainStep(); };
    // SNG-062: prologue-adjust confirms → finish; SNG-063: quick-start goes to abilities (AFTER domains)
    document.getElementById("dom-done").onclick = () => { if (state.domainReturn === "prologue") { state.domainReturn = null; finishPrologue(); } else renderAbilityStep(); };
  }

  // SNG-059 / SNG-057: choose + name a companion from the authored starting roster.
  function renderCompanionStep() {
    const roster = Object.values(CONTENT.companions || {}).filter(c => c.startingOption);
    if (!roster.length) { renderBioStep(); return; }
    if (!state.companionId) state.companionId = roster[0].id;
    const chosen = roster.find(c => c.id === state.companionId) || roster[0];
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Who walks with you?</h2>
      <p class="hint" style="margin-bottom:10px">A companion is yours from the first step. Pick who — and call them what you like.</p>
      <div class="companion-pick">
        ${roster.map(c => `<button class="companion-card ${c.id === state.companionId ? "selected" : ""}" data-comp="${esc(c.id)}">
          <strong>${esc(c.name)}</strong>
          <span class="companion-role">${esc((c.role || "").split("—").slice(1).join("—").trim() || c.role || "")}</span>
        </button>`).join("")}
      </div>
      <div class="companion-detail">
        <p class="map-details-desc">${esc((chosen.appearance || "").slice(0, 260))}</p>
        <div class="field" style="margin-top:8px"><label>Name them (optional)</label>
          <input id="comp-name" value="${esc(state.companionName)}" placeholder="${esc(chosen.name)}"></div>
      </div>
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="comp-solo">Begin alone</button>
        <button class="btn" id="comp-done">Next: your story</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-comp]")) b.onclick = () => {
      state.companionName = document.getElementById("comp-name").value.trim();
      state.companionId = b.dataset.comp; renderCompanionStep();
    };
    document.getElementById("comp-name").oninput = e => { state.companionName = e.target.value.trim(); };
    document.getElementById("comp-solo").onclick = () => { state.companionId = null; state.companionName = ""; renderBioStep(); };
    document.getElementById("comp-done").onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); renderBioStep(); };
  }

  // SNG-059 / SNG-053: describe the character's physical FORM so the portrait is right on first render.
  function renderFormStep() {
    chrome(`<div class="screen" style="max-width:640px">
      <h2>What do they look like?</h2>
      <p class="hint" style="margin-bottom:10px">Describe their physical form — species, build, features. This LEADS the portrait, so a non-human (an Ent, a construct) renders true from the start. Leave it blank for an ordinary person.</p>
      <div class="field"><textarea id="form-text" rows="3" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood, moss-bearded, eyes like knots of amber">${esc(state.form)}</textarea></div>
      <div style="display:flex; gap:8px; margin-top:8px">
        <button class="btn" id="form-done">Next: your story</button>
      </div>
    </div>`);
    document.getElementById("form-done").onclick = () => { state.form = document.getElementById("form-text").value.trim(); renderBioStep(); };
  }

  function renderBioStep(bio = { hometown: "", residence: "", livelihood: "", hobbies: "", motivation: "", story: "" }, revertTo = null) {
    const FIELDS = [
      ["hometown", "Where are they from?", "e.g. a fishing hamlet two days upriver"],
      ["residence", "Where do they live now?", "e.g. a rented loft over the Millbrook cooperage"],
      ["livelihood", "How do they make money?", "e.g. repairs water-wheels; takes carving commissions in winter"],
      ["hobbies", "What do they do for joy?", "e.g. night fishing, dice, collecting pre-Transition buttons"],
      ["motivation", "Why step out of ordinary life?", "What makes them someone things HAPPEN to — a debt, a loss, a question, an itch"]
    ];
    chrome(`<div class="screen">
      <h2>${esc(state.name)}'s Story</h2>
      <p class="hint" style="margin-bottom:14px">This is what makes them a character and not a bystander. The GM grounds every scene in it. Fill it in, or let the valley weave a draft you can edit.</p>
      ${FIELDS.map(([k, label, ph]) => `<div class="field"><label>${label}</label><input id="bio-${k}" value="${esc(bio[k])}" placeholder="${esc(ph)}"></div>`).join("")}
      <div class="field"><label>Their story so far</label><textarea id="bio-story" rows="4" style="width:100%" placeholder="A few sentences tying it together">${esc(bio.story)}</textarea></div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <button class="btn secondary" id="bio-weave">✦ Weave in the valley</button>
        ${revertTo ? `<button class="btn secondary" id="bio-revert">↺ Revert to what I wrote</button>` : ""}
        <button class="btn" id="bio-done">Begin in ${esc(CONTENT.locations?.[state.startingLocation || defaultStart(state.origin)]?.name || "the Valley")}</button>
      </div>
      ${/* SNG-220 §2d: say what the button does, right next to it — and it's now honest (§2a/§2b make it integrative). */""}
      <div class="hint" style="margin-top:6px">✦ Fills in the blanks and enriches what you've written with the valley's lore — it <strong>keeps your words</strong>, and everything stays editable.</div>
      <div class="hint" id="bio-status" style="margin-top:6px"></div>
    </div>`);
    const read = () => Object.fromEntries([...FIELDS.map(([k]) => [k, document.getElementById(`bio-${k}`).value.trim()]), ["story", document.getElementById("bio-story").value.trim()]]);
    document.getElementById("bio-weave").onclick = async () => {
      const status = document.getElementById("bio-status");
      const before = read(); // SNG-220 §2c: stash what the player wrote, for one undo
      status.textContent = "The valley weaves the land into your words…";
      try {
        // SNG-220 §2a: the player's typed words go IN as the seed; §2b: the weave ENRICHES them, never replaces.
        const draft = await generateBio({ name: state.name, origin: state.origin, background: state.background, attributes: state.attrs, bio: read() });
        renderBioStep({ ...read(), ...Object.fromEntries(Object.entries(draft).filter(([, v]) => v)) }, before);
      } catch (err) {
        status.textContent = "The weave slipped (" + err.message.slice(0, 60) + ") — write it by hand or try again.";
      }
    };
    if (revertTo) document.getElementById("bio-revert").onclick = () => renderBioStep(revertTo); // SNG-220 §2c: put their own words back
    document.getElementById("bio-done").onclick = () => finish(read());
  }

  function finish(bio = null) {
    const rules = CONTENT.rules;
    character = {
      schemaVersion: 1,
      id: "char-" + Date.now().toString(36),
      playerKey: profile.playerKey,
      name: state.name.trim(),
      origin: state.origin,
      // SNG-063: origin = which PEOPLE you're from → native tradition (home class) + why you're here
      nativeTradition: (ORIGINS().find(o => o.id === state.origin) || {}).nativeTradition || null,
      whyHere: (ORIGINS().find(o => o.id === state.origin) || {}).whyYouAreHere || null,
      background: state.background,
      level: 1, xp: 0,
      attributes: { ...state.attrs },
      skills: {},
      abilities: state.abilities.map(id => ({ abilityId: id, level: 1 })),
      alignment: {},
      attunement: 1,
      maxHealth: 15 + state.attrs.physical * 5, health: 15 + state.attrs.physical * 5,
      maxEnergy: rules.energy.max, energy: rules.energy.max,
      inventory: startingGear(state.background),
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: state.startingLocation || defaultStart(state.origin) || CONTENT.startingLocation,
      activeScene: null,
      clock: newClock(),
      // SNG-057: the chosen companion (string id — recruitment/backfill shape) + the player's name
      companions: state.companionId ? [state.companionId] : [],
      companionNames: state.companionId && state.companionName ? { [state.companionId]: state.companionName } : {},
      quests: [],
      npcRegistry: {},
      placeMemory: {},
      worldState: initWorldState(1),
      // SNG-055: the domains chosen on the great circle (what this character can ever learn)
      domains: (state.domains && state.domains.primary) ? { ...state.domains } : null,
      // SNG-193b: each practised domain starts at its tradition's pure/root school (the orthodoxy). A
      // teacher or a hard turning (adoptSchool, story-gated) can move it to an augmented school, which
      // shifts that craft's best-ground — the whole point of §3.3.
      schools: defaultSchoolsForDomains(state.domains, CONTENT.schools),
      // SNG-053: the physical form leads the portrait
      form: state.form || undefined,
      bio: bio && Object.values(bio).some(v => v) ? bio : null
    };
    // SNG-063: nobody is in the Valley by accident — fold the origin's whyYouAreHere into the bio
    // so the GM has it as grounding (origin = people, starting location = Valley).
    if (character.whyHere) {
      character.bio = character.bio || {};
      if (!character.bio.motivation) character.bio.motivation = character.whyHere;
      else if (!/(came|left|here)/i.test(character.bio.story || "")) character.bio.story = ((character.bio.story || "") + " " + character.whyHere).trim();
    }
    ensureSubAttributes(character);
    ensureCodex(character);
    ensureCharacterStyle(character); // SNG-BATCH-7: this character earns its OWN play-style
    character.grantsVersion = 1; // born after banked growth — no retro grant owed
    applyNativeGrants(character, CONTENT.rules); // SNG-101b: granted their primary tradition's basics by right of being what they are
    seedInnateSubstrate(character, originRecord(character.origin), fullCatalog(), backgroundById(character.background) || {}); // SNG-131 + SNG-261 §B: innate ACCESS from BOTH the people you're from (origin) and what happened to you (background — a precursor marking is the second kind)
    { const g = backgroundById(character.background)?.grantsAptitudes; if (g?.length) grantAptitudes(character, g, CONTENT.rules.playerAptitudes, CONTENT.rules); } // SNG-113: lineage aptitude(s)
    seedStandingAtCreation(character, { traditionIndex: CONTENT.traditionIndex, rules: CONTENT.rules, day: 1 }); // BATCH-12 §3b: being Rootkin-born should mean the Rootkin have heard of you
    character.nativeGrantsVersion = 1; // born with the starter kit — no retro native-grant owed
    character.reconcileVersion = topReconcileVersion("character"); // born current — no migration owed (no aggregate seed)
    character.pendingSubPoints = 2; // shape your edge from day one — specialize two subs
    if (!profile.charactersPlayed.includes(character.id)) profile.charactersPlayed.push(character.id);
    // SNG-068A: carry the prologue ability-reconcile note into the first scene so nothing is silent
    if (state._prologueReconcileNote) character._creationAside = state._prologueReconcileNote;
    ensureGallery(character);
    ensureCharacterPortrait(character); // SNG-035: born seeing the character (no-op unless art=generate)
    // SNG-133: every character is born with a PRIMARY personal arc from the story they wrote. Seed a light
    // fallback SYNCHRONOUSLY (never zero, no latency), then enrich it via the model in the background so
    // creation isn't blocked; SNG-132's runtime surfaces + paces it (bound to this character).
    character.personalArc = fallbackPersonalArc(character);
    character._creationAside = [character._creationAside, `✦ Your story has become a thread here: *${character.personalArc.name}*.`].filter(Boolean).join(" ");
    saveCharacter(character); saveProfile(profile);
    enrichPersonalArc(character); // best-effort, non-blocking (no-op without an API key)
    enterPlay();
  }

  // ---------- SNG-062: THE PROLOGUE — creation as a played scene ----------

  const PRO = () => CONTENT.prologue; // the authored prologue content (or null)
  const opening = () => (PRO()?.openings || []).find(o => o.id === state.prologue.openingId);

  /** The door: play the opening (recommended) or the quick-start form (express lane). */
  function renderCreateDoor() {
    if (!PRO()?.openings?.length) { draw(); return; } // no prologue content → straight to the form
    chrome(`<div class="screen" style="max-width:620px">
      <h2>Begin</h2>
      <p class="hint" style="margin-bottom:16px">Three ways to make a character. Say who you want to be and the game shows you where that lands. Play an opening and the world tells you who you turned out to be. Or build one yourself, if you already know.</p>
      <div class="create-door">
        <button class="door-card" id="door-describe">
          <strong>✎ Describe yourself</strong>
          <span>Say who you want to be, in your own words — "a girl who talks to animals and cannot lie." The game shows you where that lands on the great circle, why, and what it costs. Adjust anything. The gentlest door.</span>
        </button>
        <button class="door-card" id="door-play">
          <strong>▶ Play the opening</strong>
          <span>Pick a name and a look, then live a short scene. Your skills, your companion, and your place on the great circle come from what you actually do. You'll learn the game by playing it.</span>
        </button>
        <button class="door-card" id="door-form">
          <strong>⚡ Quick start</strong>
          <span>Build it yourself — name, form, domains on the circle, starting abilities, companion. The express lane for when you already know who you are. Same character either way.</span>
        </button>
      </div>
    </div>`);
    document.getElementById("door-describe").onclick = () => renderDescribeDoor();
    document.getElementById("door-play").onclick = () => renderPrologueIntro();
    document.getElementById("door-form").onclick = () => draw();
  }

  // ---------- SNG-086: THE THIRD DOOR — "describe yourself" → a placement on the great circle ----------

  /** The model proposes poles + prose; here the ENGINE validates every id against the ring and
   *  enforces the geometry. SNG-125: secondary must be KIN-ADJACENT to the primary (a concentrated core);
   *  tertiary is FREE — barred only from the primary/secondary and the two closed poles, no longer bound
   *  to the secondary's neighbours (Erik rulings 1 + 4). Design Law 1 — the model never owns ring geometry. */
  function sanitizeSuggestedDomains(sug, idx) {
    const ok = id => id && idx.byId?.[id] && !isFolkTradition(id, idx);
    let primary = ok(sug?.primary?.traditionId) ? sug.primary.traditionId : null;
    let secondary = ok(sug?.secondary?.traditionId) ? sug.secondary.traditionId : null;
    let tertiary = ok(sug?.tertiary?.traditionId) ? sug.tertiary.traditionId : null;
    const antiP = primary ? antipodeOf(primary, idx) : null;
    // SNG-125: an illegal (non-kin) secondary is snapped to the heaviest legal kin option, never dropped to
    // nothing when the model was close — keeps the third-door build complete and legal.
    if (secondary && (secondary === primary || secondary === antiP || !isKinAdjacent(secondary, primary, idx))) {
      secondary = primary ? (kinSecondaryOptions(primary, idx)[0] || null) : null;
    }
    const antiS = secondary ? antipodeOf(secondary, idx) : null;
    if (tertiary && (tertiary === primary || tertiary === secondary || tertiary === antiP || tertiary === antiS)) tertiary = null;
    return { primary, secondary, tertiary };
  }

  function renderDescribeDoor(err = "") {
    const idx = CONTENT.traditionIndex;
    if (!idx) { draw(); return; } // no ring content → fall back to the quick-start form
    chrome(`<div class="screen" style="max-width:620px">
      <h2>Describe yourself</h2>
      <p class="hint" style="margin-bottom:12px">Say who you want to be — species or look, temperament, what you're good at, what you care about. Whole sentences or a scatter of words, either works. The game reads it and shows you where you land on the great circle, and what it costs. You can change everything after.</p>
      ${err ? `<p class="hint" style="color:var(--warn,#c88); margin-bottom:10px">${esc(err)}</p>` : ""}
      <div class="field"><label>Name</label><input id="d-name" value="${esc(state.name)}" placeholder="their name"></div>
      <div class="field"><label>Who are you?</label>
        <textarea id="d-desc" rows="5" style="width:100%" placeholder="e.g. a girl who talks to animals and cannot lie&#10;or: a necromancer, slight of frame, very smart, likes order, a romantic and a hunter">${esc(state._describeText || "")}</textarea></div>
      <div style="display:flex; gap:8px; margin-top:10px">
        <button class="btn secondary" id="d-back">Back</button>
        <button class="btn" id="d-go">✦ Show me where I land</button>
      </div>
      <div class="hint" id="d-status" style="margin-top:10px"></div>
    </div>`);
    document.getElementById("d-name").oninput = e => { state.name = e.target.value; };
    document.getElementById("d-desc").oninput = e => { state._describeText = e.target.value; };
    document.getElementById("d-back").onclick = () => renderCreateDoor();
    document.getElementById("d-go").onclick = async () => {
      state.name = document.getElementById("d-name").value.trim();
      state._describeText = document.getElementById("d-desc").value.trim();
      if (!state._describeText) { renderDescribeDoor("Tell me a little about who you want to be first."); return; }
      const status = document.getElementById("d-status");
      const btn = document.getElementById("d-go"); btn.disabled = true;
      status.textContent = "Reading the circle for who you are…";
      // build compact catalogs so the model can only choose real ids (Design Law 1)
      const nm = t => traditionLabel(t);
      const ring = ringOrder(idx).map(t => { const tr = idx.byId[t];
        return `${t} · ${tr.name} · ${tr.pole || "?"} (${tr.axis || "?"}) · ${tr.craft || "?"} · antipode:${antipodeOf(t, idx) || "?"} · neighbours:${neighborsOf(t, idx).join(",")}`; }).join("\n");
      const folk = (CONTENT.traditions?.folkTraditions || []).map(f => `${f.name || f.traditionId} — ${f.aesthetic || "a valley folk-craft, open to all"}`).join("\n") || "(none)";
      const bgs = (CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback()).map(b => `${b.id} · ${b.name}`).join("\n");
      const comps = Object.values(CONTENT.companions || {}).filter(c => c.startingOption).map(c => `${c.id} · ${c.name} · ${(c.role || "").slice(0, 60)}`).join("\n") || "(none)";
      try {
        const sug = await suggestBuild({ description: state._describeText, ring, folk, backgrounds: bgs, companions: comps });
        state._suggestion = sug;
        renderDescribeReveal();
      } catch (e) {
        btn.disabled = false;
        status.textContent = "The reading slipped (" + String(e.message || e).slice(0, 70) + "). Try again, or use Quick start / Play the opening.";
      }
    };
  }

  function renderDescribeReveal() {
    const idx = CONTENT.traditionIndex;
    const sug = state._suggestion || {};
    const d = sanitizeSuggestedDomains(sug, idx);
    state.domains = d;
    // carry the model's non-domain suggestions onto the build (validated where they gate anything)
    const bgs = CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
    if (sug.background?.id && bgs.some(b => b.id === sug.background.id)) state.background = sug.background.id;
    const origins = ORIGINS();
    if (sug.origin?.id && origins.some(o => o.id === sug.origin.id)) { state.origin = sug.origin.id; state.startingLocation = defaultStart(state.origin); }
    if (typeof sug.form === "string" && sug.form.trim()) state.form = sug.form.trim();
    const roster = Object.values(CONTENT.companions || {}).filter(c => c.startingOption);
    if (sug.companion?.id && roster.some(c => c.id === sug.companion.id)) state.companionId = sug.companion.id;

    const antiP = d.primary ? antipodeOf(d.primary, idx) : null;
    const closed = new Set([antiP, d.secondary && antipodeOf(d.secondary, idx)].filter(Boolean));
    const circle = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary, closed,
      selectable: () => false, centerTop: "where you land", centerSub: d.primary ? traditionLabel(d.primary) : "" });
    // one slot card: people · why · what it CLOSES (engine-computed antipode) · the model's cost prose
    const slotCard = (label, slot, modelSlot) => {
      if (!slot) return "";
      const anti = antipodeOf(slot, idx);
      return `<div class="cs-block" style="margin:6px 0">
        <div><span class="dom-slot-label">${label}</span> — <strong>${esc(traditionLabel(slot))}</strong></div>
        ${modelSlot?.why ? `<div class="hint" style="margin-top:4px">${esc(modelSlot.why)}</div>` : ""}
        <div class="hint" style="margin-top:4px">Closes <strong>${esc(traditionLabel(anti))}</strong>${modelSlot?.cost ? ` — ${esc(modelSlot.cost)}` : "."}</div>
      </div>`;
    };
    const folk = Array.isArray(sug.folk) ? sug.folk.filter(f => f?.name) : [];
    const notDom = Array.isArray(sug.notDomains) ? sug.notDomains.filter(n => n?.label) : [];
    const comp = state.companionId ? roster.find(c => c.id === state.companionId) : null;
    chrome(`<div class="screen" style="max-width:660px">
      <h2>Where you land on the Great Circle</h2>
      <p class="hint" style="margin-bottom:8px">This is a suggestion, not a sentence — read the reasons and the costs, then keep it or adjust anything.</p>
      ${circle}
      ${d.primary ? slotCard("Primary", d.primary, sug.primary) : `<div class="cs-block"><div class="hint">The reading couldn't place a primary from that — try more detail, or pick on the circle.</div></div>`}
      ${slotCard("Secondary", d.secondary, sug.secondary)}
      ${slotCard("Tertiary", d.tertiary, sug.tertiary)}
      ${antiP ? `<div class="hint" style="margin:8px 0"><strong>⛔ ${esc(traditionLabel(antiP))} is closed to you forever</strong> — the far pole of what you are. Only a cross-pole braid, taught by no one, ever crosses it.</div>` : ""}
      <div class="cs-block" style="margin:6px 0">
        ${sug.origin?.why ? `<div><span class="dom-slot-label">Born</span> — <strong>${esc((origins.find(o => o.id === state.origin) || {}).name || state.origin)}</strong> <span class="hint">${esc(sug.origin.why)}</span></div>` : ""}
        ${sug.background?.why ? `<div style="margin-top:4px"><span class="dom-slot-label">Background</span> — <strong>${esc(backgroundById(state.background)?.name || state.background)}</strong> <span class="hint">${esc(sug.background.why)}</span></div>` : ""}
        ${state.form ? `<div style="margin-top:4px"><span class="dom-slot-label">Form</span> <span class="hint">${esc(state.form)}</span></div>` : ""}
        ${comp ? `<div style="margin-top:4px"><span class="dom-slot-label">Companion</span> — <strong>${esc(comp.name)}</strong> ${sug.companion?.why ? `<span class="hint">${esc(sug.companion.why)}</span>` : ""}</div>` : ""}
      </div>
      ${folk.length ? `<div class="hint" style="margin:6px 0">${folk.map(f => `<div>✓ <strong>${esc(f.name)}</strong> — ${esc(f.why || "free; a folk craft, open to all")}</div>`).join("")}</div>` : ""}
      ${notDom.length ? `<div class="hint" style="margin:6px 0">${notDom.map(n => `<div>· <strong>${esc(n.label)}</strong> isn't a domain — ${esc(n.why || "it's how you play, not a pole")}</div>`).join("")}</div>` : ""}
      <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap">
        <button class="btn secondary" id="dr-rewrite">← Rewrite</button>
        <button class="btn secondary" id="dr-adjust">Adjust on the circle</button>
        <button class="btn" id="dr-confirm" ${d.primary ? "" : "disabled"}>Yes — this is who I am</button>
      </div>
    </div>`);
    document.getElementById("dr-rewrite").onclick = () => renderDescribeDoor();
    document.getElementById("dr-adjust").onclick = () => { state.domainReturn = null; renderDomainStep(); };
    document.getElementById("dr-confirm").onclick = () => renderAbilityStep();
  }

  /** Prologue step 1 (SNG-063 order): name → form → origin (light seed — your people). Domains and
   *  skills come LATER, from play. */
  function renderPrologueIntro() {
    const origins = ORIGINS();
    if (!origins.some(o => o.id === state.origin)) state.origin = origins[0]?.id || "valleyfolk";
    const org = origins.find(o => o.id === state.origin);
    chrome(`<div class="screen" style="max-width:600px">
      <h2>Before the scene</h2>
      <p class="hint" style="margin-bottom:12px">A few things, then we begin. Who you become on the circle, and what you can do, you'll find out by playing.</p>
      <div class="field"><label>Name</label><input id="p-name" value="${esc(state.name)}"></div>
      <div class="field"><label>What do they look like? <span class="hint" style="text-transform:none">(form/species — leads the portrait; blank = an ordinary person)</span></label>
        <textarea id="p-form" rows="2" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood, moss-bearded">${esc(state.form)}</textarea></div>
      <div class="field"><label>Which people are you from? <span class="hint" style="text-transform:none">(origin is who your people are)</span></label>
        <select id="p-origin">${origins.map(o => `<option value="${esc(o.id)}" ${state.origin === o.id ? "selected" : ""}>${esc(o.name)}${o.homeRegion && o.homeRegion !== "valley" ? " — of the " + esc(String(o.homeRegion).replace(/_/g, " ")) : ""}</option>`).join("")}</select>
        <div class="hint">${esc(org?.whyYouAreHere || org?.description || "")}</div></div>
      ${(() => { const sc = startingLocationChoices(state.origin); if (!sc.length) return ""; if (!sc.some(c => c.id === state.startingLocation)) state.startingLocation = defaultStart(state.origin);
        return `<div class="field"><label>Where do you begin? <span class="hint" style="text-transform:none">(defaults to your homeland)</span></label>
        <select id="p-startloc">${sc.map(c => `<option value="${esc(c.id)}" ${state.startingLocation === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>
        <div class="hint">${esc((sc.find(c => c.id === state.startingLocation) || sc[0]).why)}</div></div>`; })()}
      <div style="display:flex; gap:8px; margin-top:8px">
        <button class="btn secondary" id="p-back">Back</button>
        <button class="btn" id="p-go" ${state.name.trim() ? "" : "disabled"}>Choose an opening</button>
      </div>
    </div>`);
    const nm = document.getElementById("p-name");
    nm.oninput = () => { state.name = nm.value; document.getElementById("p-go").disabled = !state.name.trim(); };
    document.getElementById("p-form").oninput = e => { state.form = e.target.value; };
    document.getElementById("p-origin").onchange = e => { state.origin = e.target.value; state.startingLocation = defaultStart(state.origin); renderPrologueIntro(); };
    const pSl = document.getElementById("p-startloc"); if (pSl) pSl.onchange = e => { state.startingLocation = e.target.value; renderPrologueIntro(); };
    document.getElementById("p-back").onclick = () => renderCreateDoor();
    document.getElementById("p-go").onclick = () => { state.name = nm.value.trim(); state.form = document.getElementById("p-form").value.trim(); renderPrologueOpening(); };
  }

  /** Prologue step 2: choose which opening to play (or let the valley pick). */
  function renderPrologueOpening() {
    const ops = PRO().openings;
    chrome(`<div class="screen" style="max-width:640px">
      <h2>${esc(state.name)}, where does it find you?</h2>
      <p class="hint" style="margin-bottom:12px">Each opening is a different kind of trouble. There is no wrong one — every road makes a whole person.</p>
      ${ops.map(o => `<button class="opening-card" data-open="${esc(o.id)}">
        <strong>${esc(o.name)}</strong> <span class="opening-tone">${esc(o.tone)}</span>
        <span class="opening-hook">${esc(o.hook)}</span></button>`).join("")}
      <button class="btn secondary" id="open-surprise" style="margin-top:10px">Surprise me</button>
    </div>`);
    const start = (id) => { state.prologue = { openingId: id, step: 0, tags: {}, granted: [], reasons: [] }; renderPrologueProblem(); };
    for (const b of app.querySelectorAll("[data-open]")) b.onclick = () => start(b.dataset.open);
    document.getElementById("open-surprise").onclick = () => start(ops[Math.floor(Math.random() * ops.length)].id);
  }

  /** Prologue step 3: play the current problem — pick a path, see the outcome, accrue. */
  function renderPrologueProblem(outcomeShown = null) {
    const o = opening();
    const probs = o.problems || [];
    const i = state.prologue.step;
    if (i >= probs.length) { renderPrologueCompanion(); return; }
    const p = probs[i];
    chrome(`<div class="screen" style="max-width:640px">
      <div class="prologue-progress">${probs.map((_, k) => `<span class="${k < i ? "done" : k === i ? "now" : ""}"></span>`).join("")}</div>
      <h2>${esc(o.name)}</h2>
      ${i === 0 && !outcomeShown ? `<p class="prologue-hook">${esc(o.hook)}</p>` : ""}
      ${outcomeShown ? `<div class="prologue-outcome"><p>${esc(outcomeShown)}</p><button class="btn" id="p-continue">Go on</button></div>` : `
        <p class="prologue-situation">${esc(p.situation)}</p>
        <div class="prologue-paths">
          ${(p.paths || []).map((path, pi) => `<button class="prologue-path" data-path="${pi}">${esc(path.label)}</button>`).join("")}
        </div>`}
    </div>`);
    if (outcomeShown) { document.getElementById("p-continue").onclick = () => { state.prologue.step++; renderPrologueProblem(); }; return; }
    for (const b of app.querySelectorAll("[data-path]")) b.onclick = () => {
      const path = p.paths[+b.dataset.path];
      if (path.tradition) state.prologue.tags[path.tradition] = (state.prologue.tags[path.tradition] || 0) + 1;
      if (path.grantsAbility && !state.prologue.granted.includes(path.grantsAbility)) state.prologue.granted.push(path.grantsAbility);
      state.prologue.reasons.push({ label: path.label, outcome: path.outcome, tradition: path.tradition });
      renderPrologueProblem(path.outcome || "It is done.");
    };
  }

  /** Prologue step 4: the companion arrives IN the scene — choose + name who stays. */
  function renderPrologueCompanion() {
    const o = opening();
    const beat = o.companionBeat || {};
    const offered = (beat.offer || []).map(id => CONTENT.companions[id]).filter(c => c && c.startingOption);
    if (!offered.length) { renderPrologueReveal(); return; }
    if (!state.companionId) state.companionId = offered[0].id;
    const chosen = offered.find(c => c.id === state.companionId) || offered[0];
    const arrival = beat.arrivals?.[chosen.id] || chosen.appearance || "";
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Someone stayed</h2>
      <p class="prologue-situation">${esc(beat.situation || "When it was over, someone was still there.")}</p>
      <div class="companion-pick" style="margin-top:10px">
        ${offered.map(c => `<button class="companion-card ${c.id === state.companionId ? "selected" : ""}" data-comp="${esc(c.id)}"><strong>${esc(c.name)}</strong></button>`).join("")}
      </div>
      <div class="companion-detail"><p class="map-details-desc">${esc(arrival)}</p>
        <div class="field" style="margin-top:8px"><label>Name them (optional)</label><input id="comp-name" value="${esc(state.companionName)}" placeholder="${esc(chosen.name)}"></div></div>
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="comp-solo">No one stays</button>
        <button class="btn" id="comp-done">This one</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-comp]")) b.onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); state.companionId = b.dataset.comp; renderPrologueCompanion(); };
    document.getElementById("comp-name").oninput = e => { state.companionName = e.target.value.trim(); };
    document.getElementById("comp-solo").onclick = () => { state.companionId = null; state.companionName = ""; renderPrologueReveal(); };
    document.getElementById("comp-done").onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); renderPrologueReveal(); };
  }

  /** Prologue step 5: domains CRYSTALLIZE from how they played — shown on the circle, with the
   *  reasons in their own actions, then CONFIRMED (mandatory). The player keeps the last word. */
  function renderPrologueReveal(adjustPhase = null) {
    const idx = CONTENT.traditionIndex;
    if (!idx) { finishPrologue(); return; }
    if (!state.domains.primary) state.domains = crystallizeDomains(state.prologue.tags, idx) || { primary: null, secondary: null, tertiary: null };
    const d = state.domains;
    // ADJUST mode reuses the pickable circle (re-run the domain picker seeded from the crystallized result)
    if (adjustPhase) { renderDomainStep(); return; }
    const nm = t => t ? traditionLabel(t) : "—";
    const reasons = state.prologue.reasons.filter(r => r.tradition).slice(-4);
    const circle = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary,
      closed: new Set([d.primary && antipodeOf(d.primary, idx), d.secondary && antipodeOf(d.secondary, idx)].filter(Boolean)),
      selectable: () => false, centerTop: "who you are", centerSub: nm(d.primary) });
    chrome(`<div class="screen" style="max-width:640px">
      <h2>This is who you turned out to be</h2>
      ${circle}
      <div class="dom-slots"><div class="dom-slot"><span class="dom-slot-label">Primary</span> <strong>${esc(nm(d.primary))}</strong></div>
        <div class="dom-slot"><span class="dom-slot-label">Secondary</span> <strong>${esc(nm(d.secondary))}</strong></div>
        <div class="dom-slot"><span class="dom-slot-label">Tertiary</span> <strong>${esc(nm(d.tertiary))}</strong></div></div>
      <div class="prologue-reasons"><p class="hint">Because, in the scene:</p>
        ${reasons.map(r => `<div class="prologue-reason">— ${esc(r.label)}</div>`).join("")}</div>
      <p class="hint" style="margin-top:8px">The far pole of what you are is closed to you — only the great braids cross it. Is that who you are? You may adjust.</p>
      <div class="field" style="margin-top:12px"><label>And what did you DO before this? <span class="hint" style="text-transform:none">(your background — you choose; the scene doesn't decide it for you)</span></label>
        <select id="reveal-bg">${backgroundOptionsHTML(state.background)}</select>
        <div class="hint" id="reveal-bg-hint">${esc(backgroundById(state.background)?.description || "")}</div></div>
      <div style="display:flex; gap:8px; margin-top:10px">
        <button class="btn secondary" id="reveal-adjust">Adjust on the circle</button>
        <button class="btn" id="reveal-confirm">Yes — this is who I am</button>
      </div>
    </div>`);
    document.getElementById("reveal-adjust").onclick = () => { state.domainReturn = "prologue"; state.domains = { primary: null, secondary: null, tertiary: null }; renderDomainStep(); };
    const rbg = document.getElementById("reveal-bg");
    if (rbg) rbg.onchange = e => { state.background = e.target.value; const h = document.getElementById("reveal-bg-hint"); if (h) h.textContent = backgroundById(state.background)?.description || ""; };
    document.getElementById("reveal-confirm").onclick = () => { if (rbg) state.background = rbg.value; finishPrologue(); };
  }

  /** Out the far side: a complete character. SNG-068A: abilities are RECONCILED against the
   *  CONFIRMED domains (not the ones the game guessed). The prologue-earned abilities are kept —
   *  "you did this, so you know this" — but any that fall outside the confirmed domains are
   *  GRANDFATHERED explicitly and the player is told; and the character is granted at least one
   *  ability from their CONFIRMED PRIMARY (a wright must know something wright). */
  function finishPrologue() {
    const { abilities, grantedFromPrimary, grandfathered } = reconcileStartingAbilities(
      state.prologue.granted || [], state.domains, CONTENT.abilities, CONTENT.traditionIndex);
    state.abilities = abilities;
    // a light bio seeded from the opening so the GM has grounding
    const o = opening();
    let story = o ? `Their first day in the world was ${o.name.toLowerCase()} — ${state.prologue.reasons.map(r => r.label.toLowerCase().replace(/\.$/, "")).slice(0, 2).join("; ")}.` : "";
    if (grandfathered.length) story += ` They did things in that first day their people would not have taught them — ${grandfathered.map(id => CONTENT.abilities[id].name).join(", ")} stay with them, earned outside their craft.`;
    const bio = (o || grandfathered.length) ? { motivation: o?.hook || null, story: story.trim() } : null;
    // tell the player what was reconciled, so nothing is silently changed (Law 9)
    const notes = [];
    if (grantedFromPrimary) notes.push(`your people's craft is yours: you begin knowing ${CONTENT.abilities[grantedFromPrimary].name}`);
    if (grandfathered.length) notes.push(`what you did in the fire stays with you, though it is not your people's craft: ${grandfathered.map(id => CONTENT.abilities[id].name).join(", ")}`);
    state._prologueReconcileNote = notes.length ? notes.join("; ") + "." : null;
    finish(bio);
  }

  renderCreateDoor();
}

// ---------- play ----------

async function enterPlay() {
  sceneTurns = [];
  sceneState = null;
  flushFeedbackQueue(); // SNG-066: send any feedback captured while sync was off
  hydrateGeneratedIntoContent(character); // SNG-BATCH-9: make this character's grown world live + revisitable
  pruneEmptyGalleryTiles(character); // SNG-136: drop any failed-gen blank tiles
  ensureBondPortraits(character);    // SNG-136: retro backfill — an already-devoted bond (Pell) gets its portrait once
  if (character.sharedSceneId && syncEnabled()) {
    fetchScene(character.sharedSceneId).then(sc => {
      if (sc && sc.party.some(m => m.characterId === character.id)) { sharedScene = sc; seenBeats = sc.beats.length; if (!partyPoll) partyPoll = setInterval(pollPartyScene, 20000); }
      else { character.sharedSceneId = null; saveCharacter(character); }
    });
  }
  const news = await maybeTick();
  // one-time "catching up" tally from the backfill migration
  let backfillAside = null;
  if (character._backfillSummary) {
    const lines = summaryLines(character._backfillSummary);
    delete character._backfillSummary;
    saveCharacter(character);
    if (lines.length) backfillAside = "Catching up on all you've done:\n• " + lines.join("\n• ");
  }
  // SNG-022: the login moment — if reconciliation applied anything player-facing, say so
  if (character._reconcileNotes?.length) {
    const growth = "The world has grown:\n• " + character._reconcileNotes.join("\n• ");
    backfillAside = backfillAside ? backfillAside + "\n\n" + growth : growth;
    delete character._reconcileNotes;
    saveCharacter(character);
  }
  // SNG-068A: the creation reconcile note (abilities matched to your CONFIRMED people) — say it once.
  if (character._creationAside) {
    backfillAside = backfillAside ? character._creationAside + "\n\n" + backfillAside : character._creationAside;
    delete character._creationAside;
    saveCharacter(character);
  }
  if (character.activeScene?.turns?.length) {
    sceneTurns = character.activeScene.turns;
    sceneBeats = character.activeScene.beats || sceneTurns.length;   // a reload must not restart the clock
    sceneState = character.activeScene.sceneState || null;
    renderPlay(character.activeScene.lastTurn, { resumed: true, newsFlash: news, aside: backfillAside });
  } else {
    startScene(undefined, news, backfillAside);
  }
  // SNG-098 C: a skill-battle in progress resumes into the contest panel (never stranded mid-fight on reload).
  if (character.activeEncounter?.state?.mode === "skill_battle") renderSkillBattle();
}

async function startScene(prompt = "(Scene opening — set the scene where the character currently is and present the situation.)", news = [], aside = null) {
  gambitHintDismissed = false; // SNG-031: a new scene may be plan-apt again
  sceneGenCount = 0;           // SNG-BATCH-9: fresh generation budget each scene
  sceneArtCount = 0;           // SNG-035: fresh moment-art budget each scene
  sceneEncounterFired = false; // SNG-075: one narrative encounter per scene, reset here
  quietTurns = 0; pressureStreak = 0; // SNG-080: a fresh scene starts the idle count over
  if (news.length) prompt += ` (Since the character last played, the world moved: ${news.map(n => n.text).join(" / ")} — let the scene reflect what applies here.)`;
  renderPlay(null, { thinking: "The valley takes shape…", newsFlash: news, aside });
  const result = await runGM({ resolution: null, playerInput: prompt });
  if (result) renderPlay(result.turn, { degraded: result.degraded, newsFlash: news, aside });
}

/** ability-arch v2: the deepen affordance is GONE — depth is earned, not bought. This returns the
 *  progress line shown wherever a rank-up button used to be. Rank 1 → shows uses toward rank 2 (which
 *  lands automatically); rank 2 → mastery awaits a defining moment (GM); rank 3 → mastered. */
function rankProgress(character, abId) {
  const rules = CONTENT.rules;
  const owned = (character.abilities || []).find(a => a.abilityId === abId);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;
  if (!owned) return { text: "", ripe: false };
  if (owned.level >= maxRank) return { text: "✓ mastered — rank 3", ripe: false };
  const uses = character.practice?.uses?.[abId] || 0;
  if (owned.level === 1) {
    const need = rules.practice?.useRankThreshold?.["2"] ?? 8;
    // SNG-206: the use-bar filled to 8/8 and read "lands through use" while a HIDDEN second gate —
    // character level ≥ rankLevelReq["2"] — silently held the rank (autoAdvancePracticedRanks bails on
    // character.level < req). It only bites low-level characters (a fresh romance-character like Loki).
    // Show BOTH bars so "practiced but not yet ranked" never reads as ready-or-broken.
    const req = rules.leveling?.rankLevelReq?.["2"] ?? 1;
    const practiced = uses >= need;
    const levelBlocked = practiced && (character.level || 1) < req;
    const text = levelBlocked
      ? `rank 1 · practiced ${need}/${need} ✓ — needs level ${req} to rank up`
      : `rank 1 · practiced ${Math.min(uses, need)}/${need} → rank 2 lands through use`;
    return { text, ripe: false, uses, need, levelBlocked };
  }
  // rank 2 → mastery is a defining moment (GM), gated on practice + rank3Min
  const need = rules.practice?.useRankThreshold?.["3"] ?? 16;
  const practiced = uses >= need;
  const gateOk = meetsRank3Gate(character, abId, CONTENT.attributeGates).ok;
  const ripe = practiced && gateOk;
  const text = ripe ? "rank 2 · ripe for a defining moment (the GM marks mastery when a beat earns it)"
    : !practiced ? `rank 2 · practiced ${Math.min(uses, need)}/${need} toward mastery`
    : `rank 2 · needs ${gateFor(abId, CONTENT.attributeGates)?.subAttribute || "attribute"} ${gateFor(abId, CONTENT.attributeGates)?.rank3Min || ""} for mastery`;
  return { text, ripe, uses, need };
}

/** ability-arch v2: owned rank-2 crafts that are practiced enough AND past their rank-3 attribute gate
 *  and the level bar — i.e. a GM `markDefiningMoment` would land. Named for the GM's RIPE FOR MASTERY
 *  block so it only narrates a breakthrough the engine will honor. Null when nothing is ripe. */
function masteryReadyForGM() {
  const rules = CONTENT.rules;
  const req3 = rules.leveling?.rankLevelReq?.["3"] ?? 1;
  const names = [];
  for (const owned of character.abilities || []) {
    if (owned.level !== 2) continue;
    if (!practiceRankReady(character, owned.abilityId, rules)) continue;      // uses ≥ rank-3 threshold
    if ((character.level || 1) < req3) continue;
    if (!meetsRank3Gate(character, owned.abilityId, CONTENT.attributeGates).ok) continue;
    const ab = fullCatalog()[owned.abilityId];
    if (ab) names.push(`${ab.name} (${owned.abilityId})`);
  }
  return names.length ? names.join("; ") : null;
}

/** BATCH-11 §23: the env bag every registry row builds from. One place, so
 *  "what can a GM-context builder see" is as enumerable as the registry itself.
 *  FN_INDEX is exposed as a getter — it is a mutable `let` rebuilt at load. */
function gmEnv(extra = {}) {
  return {
    character, location: hereNow(), CONTENT, sceneTurns, sceneState, sharedScene, profile,
    arcMoods: npcMoodLines(arcEffectsNow()),   // SNG-273: an advanced arc changes how people carry themselves
    sceneBeats, rules: CONTENT.rules,          // SNG-266/1d: the pacing directive reads both — a builder
                                               // that reads an env key nobody puts here is the same dark wire.
    time: readClock(character.clock),
    worldDay: (() => { try { return absoluteWorldDay(); } catch { return null; } })(), // SNG-173: recency needs a clock
    app: {
      fullCatalog, FN_INDEX: () => FN_INDEX, activeEnc, listAvailableEncounters,
      masteryReadyForGM, ratingLineForGM, maybeLegendDetail, sharedCanonForGM,
      isPlaceKnown: (id) => isPlaceKnown(character, id, CONTENT.locations)   // SNG-176: recall only what the character KNOWS
    },
    ...extra
  };
}

async function runGM({ resolution, playerInput, exactWords, itemAdvance }) {
  busy = true;
  // SNG-075: an encounter the narrative-time roll turned up last beat is WOVEN into this turn.
  const weave = pendingWeave; pendingWeave = null;
  // SNG-237 Fix B: the ENGINE has judged texture-vs-challenge (weave.decisive; OQ2 — the GM must not re-derive
  // decisiveness from prose). A DECISIVE weave ESCALATES to a recognizable framed encounter (closes Silas's
  // "couldn't tell it was an encounter"); ambient colour still weaves as texture (no "A SYSTEM EVENT" for a
  // sparrow — the SNG-043 over-framing mistake). Texture weaves; a challenge frames.
  const encounterWeaveDetail = weave ? (
    weave.decisive
      ? `A real challenge has arisen: ${weave.seed} PRESENT it as a recognizable, bounded encounter the player can SEE and enter — state plainly what it is and give a clear choice to engage, flee, or avoid it BEFORE any engagement. Do NOT fold it into ambient prose and move on; never narrate the character as already fighting or already harmed.${weave.loreTier === "precursor-glimpse" ? " This touches the Precursor — glimpsed, never explained." : ""}`
      : `Weave this into the scene as AMBIENT texture — colour, not a system event, no aside or genre-break: ${weave.seed}${weave.flavor && /benef|benign|beaut/.test(weave.flavor) ? " — a grace, not a threat" : ""}.${weave.loreTier === "precursor-glimpse" ? " This touches the Precursor — glimpsed, never explained." : ""}`
  ) : null;
  // SNG-236 fix A: a STRUCTURED encounter the roll turned up is offered HARD — the recognizable-encounter
  // offer no longer waits on the GM's soft "when the fiction invites it" judgment (the mechanism that
  // silenced Silas). Same engine-gated-directive pattern as travelDirective's MUST-emit moveTo.
  // SNG-239: a quest stage completed last beat — hand its EARNED reveal to this turn's GM as a HARD directive
  // to state it plainly (the Fix-A pattern; the soft QUEST CLARITY rule alone gets dropped under the 114-MUST load).
  const stageReveals = pendingStageReveal; pendingStageReveal = null;
  const stageRevealDetail = (stageReveals && stageReveals.length) ? (
    `The character just EARNED a quest reveal last beat — pay it out PLAINLY in your prose this turn, in concrete first-read terms (name the thing; a vivid image may accompany but never replace the plain truth). It is earned, not a secret to withhold: ${stageReveals.map(r => `[${r.title}] ${r.change}${r.atDecision ? " — and this is now the DECISION POINT: the player must fully understand what they are deciding and what each road does; close open questions, do not open new ones." : ""}`).join(" · ")}`
  ) : null;
  const offer = pendingEncounterOffer; pendingEncounterOffer = null;
  const encounterOfferDetail = offer ? (
    `The world has turned up a recognizable ${offer.kind} — "${offer.name}". This is NOT ambient texture to fold into prose: it is a bounded encounter the player must be able to SEE and ENTER. You MUST, this beat, present it as a framed CHOICE carrying \`encounterId: "${offer.id}"\` (label it for what it is), beside a clear way to decline or avoid. Do not narrate past it — the engine takes the engage/decline and the frame from there.`
  ) : null;
  // SNG-246 Fix A, fallback (b): the player committed a killing blow the engine could not attribute to a NAMED
  // person. It refuses to invent one — so it hands this turn a HARD directive to frame the fight the GM itself
  // just narrated. Same engine-gated-directive pattern as encounterOfferDetail; the engine still decides that a
  // fight must be structured, it only borrows the GM's knowledge of who is standing there.
  const fightFraming = pendingFightFraming; pendingFightFraming = null;
  const fightFramingDetail = fightFraming ? (
    `The player has COMMITTED to violence this beat — "${fightFraming.what}"${fightFraming.rung === "lethal" ? ", and answered that they intend to KILL" : ", intending to put them down, not out"}. This is NOT a single narrated blow: you MUST, this beat, present it as a bounded FIGHT the player can see and act inside — emit \`newEncounter\` for the person they are attacking (name them from what you have already narrated; give them a threat that fits) so the engine can take the rounds from there. Do not resolve the fight in prose, and do not narrate them as already dead or already victorious.`
  ) : null;
  // SNG-251 §2a: THE EVOLUTION TRIGGER THE ENGINE ENFORCES. This is the root of what Erik reported — he did
  // the work in-fiction (bound runes, sealed a death-binding) and the GM simply never fired `itemUpdates`.
  // The op was one of 114 MUSTs and it drops under saturation (the SNG-237/246 class); no amount of prompt
  // rewriting fixes a directive that is competing with a hundred others. So the ENGINE decides: when the
  // player's own words name an item they HOLD and a real act of making upon it, the directive is HARD this
  // turn, exactly like the fight-framing one. The GM stops needing to remember.
  // LIVE FINDING (2026-08-01): `newAbility` NEVER fired — twice, on a meta-instruction AND on a clean
  // in-fiction beat where a master finished teaching a craft and said it was the player's. There is no
  // hard directive for it anywhere in the registry: it is a SOFT rule ("newAbility is RARE…") competing
  // with 114 MUSTs, which is precisely where `itemUpdates` was before SNG-251 §2a. The consequence is
  // that sanitizeNewAbility — including the `functions` fix — may effectively never run in play, and the
  // whole GM-granted-craft path is close to dead. Same cause, same proven fix: let the ENGINE decide the
  // beat happened and hand a HARD directive.
  //
  // Narrow on purpose, like §2a: a teaching beat needs BOTH a completion word and a teaching word, so
  // "she is teaching me" mid-lesson does not fire — only the moment it is finished and handed over.
  const abilityGrantDetail = (() => {
    const said = String(playerInput || "").toLowerCase();
    if (!said) return null;
    const teaching = /(taught|teaches|teaching|shows? me|showed me|trains?|training|trained|apprentice|lesson|walks? me through|walked me through)/.test(said);
    const finished = /(mine now|it is mine|last time|finish(es|ed)?|complete[ds]?|paid for|at last|final(ly)?|hands? it (to me|over)|passes it to me)/.test(said);
    if (!(teaching && finished)) return null;
    return `A craft has just been TAUGHT TO COMPLETION in the fiction and handed to the player — the beat is finished, not in progress. You MUST emit \`newAbility\` this turn. It needs a name, a description of what it functionally does AND its limits, an \`attribute\`, a \`notFor\` naming what it is inappropriate for, and — REQUIRED — a \`functions\` array of 1-4 verbs taken ONLY from the closed vocabulary in the contract above. A craft with no functions engages no mechanic: it cannot fill a coverage gap, be recommended, or feed a braid, and the player has been handed a name with nothing behind it. The engine clamps the cost and the tier; you supply what it DOES.`;
  })();

  const itemEvolveDetail = (() => {
    const said = String(playerInput || "").toLowerCase();
    if (!said || !character.inventory?.length) return null;
    // Verbs of MAKING, not of using. "I swing the spear" changes nothing; "I bind the rune into the spear"
    // is the beat that has been silently failing to land. Kept deliberately narrow — a false positive here
    // spends a hard directive on an ordinary turn, which is how directives get ignored.
    if (!/\b(bind|bound|binding|seat|seated|forge|reforge|reforged|inscrib|carve|carved|etch|temper|quench|seal|sealed|name it|rename|consecrat|anoint|imbue|infuse|weave|wove|work(ed)? (the|a) rune|split)\b/.test(said)) return null;
    const held = (character.inventory || []).filter(i => {
      const n = String(i.customName || i.name || "").toLowerCase();
      return n.length > 3 && said.includes(n);
    });
    if (!held.length) return null;
    const it = held[0];
    const ceiling = grantCeiling(character, Math.max(0, ...(character.abilities || []).map(a => a.level || 1)));
    const budget = evolutionBudget(it, (() => { try { return absoluteWorldDay(); } catch { return null; } })(), character);
    // SNG-251 §4: Aevi's grant-strength GUIDANCE for THIS character's band — what a reasonable grant READS
    // like at their level and craft. Without it the GM knows only the arithmetic ("at most N grants") and has
    // to guess the voice, so grants get authored big and then refused; with it they are authored to FIT.
    const bands = CONTENT.earnedPowerGuidance?.bands || {};
    const bandKey = Object.keys(bands).find(k => {
      const [lo, hi] = String(bands[k]?.levelRange || "").split("-").map(n => parseInt(n, 10));
      return Number.isFinite(lo) && (character.level || 1) >= lo && (!Number.isFinite(hi) || (character.level || 1) <= hi);
    }) || null;
    // LIVE FINDING (2026-08-01): the model narrated the shadow-twin split in prose and did NOT emit
    // `deriveItem` — Erik's original complaint, reproduced under instrumentation with the op in place.
    // The cause is the one this whole ticket is about: the deriveItem instruction was a CONDITIONAL
    // clause at the tail of a long directive ("if the work SPLIT it..."), and a trailing conditional is
    // exactly what drops under load. The fix is the same one that made itemUpdates land — let the ENGINE
    // decide the split happened, and state it as its own unconditional sentence at the FRONT.
    const splitWords = /(split|splits|splitting|twin|sever|severed|divide|divided|separate|second (spear|blade|copy)|call it to|shadow-?twin)/;
    const splitLine = splitWords.test(said)
      ? ` THIS BEAT ALSO SPLIT THE ITEM IN TWO. You MUST emit \`deriveItem\` this turn as well, naming the parent and giving the child its own description, imagePrompt and grants — a derived item is a PEER, complementary to the parent, never a weaker echo. Narrating the split without emitting the op leaves the player unable to call the thing they just made.`
      : "";
    const bandLine = bandKey ? ` GRANT STRENGTH AT THIS BAND (${bandKey}): ${bands[bandKey].reads_like}${bands[bandKey].example ? ` Example: ${bands[bandKey].example}` : ""}` : "";
    return `The player has just done real WORK upon "${it.customName || it.name}" — an item they are carrying — in their own words. This is an evolution beat, and it is the thing that has been silently failing: you MUST emit \`itemUpdates\` for it THIS TURN, not next time. Update its description to what it has become${it.customName ? "" : ", and give it a truer name if it has earned one"}, say what it now LOOKS like (\`imagePrompt\`) if its appearance changed, and — if the fiction genuinely earned power (a rune actually bound, a craft actually completed) — state that power EXPLICITLY as \`grants\`, each naming what it does and what it explicitly cannot do. ${budget.canEvolve ? `This item can take on new power today; the engine will clamp it to what is reasonable at ${ceiling.band} and refuse anything past ${ceiling.maxGrants} grants.` : `This item has already taken on all the power it can hold today — evolve its PROSE and its name, but grant no new mechanics this beat.`}${splitLine}${bandLine}`;
  })();
  const worldPressureDetail = pendingPressure; pendingPressure = null; // SNG-080: a quiet-turn push
  const substrateDetail = pendingSubstrateNote; pendingSubstrateNote = null; // SNG-090: lattice thin/crowded here
  // SNG-194 §4b: the ENGINE decides whether an unprompted OFFER has room this beat — the model never
  // judges "gap vs grip." A grip (encounter/gambit/intent) or the world already pushing pressure is no
  // room. When there IS room, hand the GM present people's FEARS (the one rich source that never reached
  // the turn prompt) — wants, stirrings and the place are already above; the instruction lives in gm.js.
  const offerDetail = (() => {
    const room = roomForAnOffer({
      encounterActive: !!activeEnc(),
      gambitOpen: !!gambitDraft,
      intentPending: !!character._pendingIntent,
      worldActing: !!worldPressureDetail || !!encounterWeaveDetail || !!encounterOfferDetail || !!fightFramingDetail,
      lull: quietTurns >= 1,
      arrived: (sceneTurns?.length || 0) <= 1,
      turnsSinceOffer: character.worldState?.turnsSinceOffer ?? Infinity
    });
    if (!room) return null;
    const npcOpts = { npcs: CONTENT.npcs, locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) };
    const fears = npcFearsForGM(character, npcOpts);
    const reactions = npcReactionsForGM(character, npcOpts); // SNG-195 G2: the reactsToReputation win
    const parts = [];
    if (reactions.length) parts.push("How the people here READ this character (their OWN reaction to who the player is — a self-writing beat whose attribution IS the person; pick the reading that fits this character):\n" + reactions.map(r => `- ${r.name}: ${r.reactions}`).join("\n"));
    if (fears.length) parts.push("What the people here FEAR (a sympathetic reason for someone to act — not an attack):\n" + fears.map(f => `- ${f.name}: ${f.fear}`).join("\n"));
    return parts.length ? parts.join("\n\n") : "No specific person-material here — draw the offer from what is stirring in the world, what these people want, or what this place is.";
  })();
  // SNG-195 G2: the oldest live-play complaint — teachers that teach nothing. The teacher block used to
  // say "OFFER it when the moment fits" — a permission the model rarely acted on. Now the ENGINE decides a
  // teacher present TAKES the initiative: a bonded/trainer teacher is here with a REACHABLE next step, the
  // beat has a positive opening and no grip, and the general offer is NOT firing this same beat (one
  // unprompted thing at a time). Shares the offer cooldown (the offer op resets it). When set, the teacher
  // block flips from permission to an unconditional instruction — the model never judges the moment.
  const teacherOfferDetail = (() => {
    const ready = teacherOfferReady(character, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex, npcs: CONTENT.npcs, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) });
    if (!ready) return null;
    const room = roomForATeacherOffer({
      teacherPresent: true,
      encounterActive: !!activeEnc(),
      gambitOpen: !!gambitDraft,
      intentPending: !!character._pendingIntent,
      generalOfferThisBeat: !!offerDetail,
      lull: quietTurns >= 1,
      arrived: (sceneTurns?.length || 0) <= 1,
      turnsSinceOffer: character.worldState?.turnsSinceOffer ?? Infinity
    });
    if (!room) return null;
    return `${ready.name} is here and would open your next step: **${ready.nextStep}** (tier ${ready.tier}, ${ready.traditionName}${ready.pathIsTheirs ? " — their own ordering" : ""}).${ready.braids && ready.braids.length ? ` Braids it opens: ${ready.braids.join(", ")}.` : ""}`;
  })();
  // Romance: on a flirtatious/romantic intent this turn, pull the craft-guidance doc so the GM narrates
  // the beat well at the player's rating. Rides the intent tags parseIntent already emits — no extra call.
  const romanceGuidanceDetail = ((resolution?.action?.intentTags || []).some(t => /^(romantic|flirt)$/i.test(String(t))) && CONTENT.romanceGuidance?.text) ? CONTENT.romanceGuidance.text : null;
  if (romanceGuidanceDetail) autoVerifyLeg("romance-flirt", "a flirtatious action was tagged romantic and the romance guidance loaded in play — the one live-model surface"); // ROMANCE leg auto-detect (dev-only)
  // (masteryDetail / anomalyDetail / toolkitDetail now build inside the §23 registry rows.)
  // SNG-122: if the player's action this turn is a travel intent, force the GM to emit moveTo to the named
  // destination (+ enumerate reachable known places so its target resolves). Fixes the CAUSE — the deferred
  // SNG-117 no-moveTo boundary that blocked normal in-fiction travel.
  const travelIntent = travelIntentOf(resolution?.action);
  const travelDirective = travelIntent ? buildTravelDirective(travelIntent) : null;
  // BATCH-11 §23: the context is assembled by ITERATING the registry — the hand-listed
  // ~40-key literal that used to live here is now engine/gm_registry.js, one row per
  // contributor, enumerable. Site-A one-shot ephemera were consumed above and ride in
  // env.ephemera so a registry row can never double-fire them.
  const env = gmEnv({
    resolution, playerInput, exactWords, itemAdvance, travelDirective,
    ephemera: { encounterWeaveDetail, encounterOfferDetail, fightFramingDetail, stageRevealDetail, itemEvolveDetail, abilityGrantDetail, worldPressureDetail, substrateDetail, romanceGuidanceDetail, offerDetail, teacherOfferDetail }
  });
  // SNG-100b: accrue region presence — a light per-turn accumulator of time spent among a people, so the
  // standing bar can ask "have you genuinely stood here" (region-standing gate for promotion/acquisition).
  if (env.location?.regionId) { character.regionsKnown = character.regionsKnown || {}; character.regionsKnown[env.location.regionId] = (character.regionsKnown[env.location.regionId] || 0) + 1; }
  // SNG-242 §5: the quality tier for THIS beat — the per-turn "richer telling" toggle wins, else the player's
  // default from Settings (profile.narrationTier). The toggle is one-shot: consumed here so it doesn't stick.
  const tier = _richNextTurn ? "rich" : (["fast", "standard", "rich"].includes(profile?.narrationTier) ? profile.narrationTier : "standard");
  _richNextTurn = false;
  const result = await gmTurn(assembleGMContext("turn", env), { tier });
  busy = false;
  if (!result.ok) { renderPlay(null, { error: result.error }); return null; }
  // SNG-009: track op loss so the next turn's GM restates missed updates
  if (result.opsLost) { character.opLossPending = true; character.opLossLog = [...(character.opLossLog || []), { at: new Date().toISOString() }].slice(-3); }
  else character.opLossPending = false;
  // SNG-081: the player's OWN words are kept in scene history — their literal input wins, else the
  // action label. Without this the GM's "history" is a monologue of its own prose and the player's
  // half of the scene has no permanence (the deepest continuity bug in the project).
  const playerWords = exactWords || resolution?.action?.label || (typeof playerInput === "string" && !/^\(/.test(playerInput) ? playerInput : null);
  // CCODE-07 (Design Law 5): the model already answered — the player has WAITED for this beat and
  // paid for it. Bookkeeping must never be able to swallow it. Before this guard, ANY throw inside
  // applyTurn propagated out of runGM, the caller's `renderPlay(result.turn, …)` never ran, and the
  // narration vanished — while `character.activeScene.lastTurn` had ALREADY been persisted mid-way
  // through applyTurn, which is why navigating away and back made the "lost" turn appear.
  // The narration renders either way; a partial state-application is surfaced, never silent.
  try {
    applyTurn(result.turn, resolution, playerWords);
    // SNG-231 §2 (resilience): applyStep ISOLATED each op-group, so applyTurn completed even if one threw — the
    // turn stood AND every OTHER op (crucially newEncounter, so a duel starts) landed. Surface which group(s) were
    // lost, named, so it's diagnosable and the GM restates them next beat — without the old abort-cascade.
    if (character._applyFailures?.length) {
      const ops = [...new Set(character._applyFailures.map(f => f.op))];
      console.warn(`[applyTurn] ${character._applyFailures.length} op-group(s) failed but were ISOLATED (turn + other ops landed): ${ops.join(", ")}`);
      character._turnApplyError = { at: new Date().toISOString(), op: ops.join(", "), isolated: true, message: character._applyFailures.at(-1)?.message || null, stack: character._applyFailures.at(-1)?.stack || null };
      result.turn._applyFailed = true;
      result.turn._applyFailedOp = ops.join(", ");
      character.opLossPending = true; // the same self-heal contract SNG-009 uses — the GM restates the lost ops
      character._applyFailures = null;
      try { saveCharacter(character); } catch (err2) { console.error("[applyTurn] recovery save failed:", err2); }
    }
  } catch (err) {
    // BACKSTOP: an UN-isolated throw (an inline block not yet wrapped in applyStep) still degrades gracefully —
    // narration preserved, the failing op-group named (the phase tracker), the beat persisted.
    const phase = _applyPhase || "unknown";
    console.error(`[applyTurn] state application failed at op-group "${phase}" — narration preserved:`, err);
    character._turnApplyError = { at: new Date().toISOString(), op: phase, message: String(err?.message || err).slice(0, 200), stack: String(err?.stack || "").split("\n").slice(0, 4).join(" <- ").slice(0, 500) };
    result.turn._applyFailed = true;
    result.turn._applyFailedOp = phase; // surfaced in the aside
    // Persist the beat so continuity holds even though some ops didn't land, and tell the GM next
    // turn that state lagged the fiction — the same self-heal contract SNG-009 uses for lost ops.
    try {
      character.opLossPending = true;
      character.activeScene = { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: result.turn, sceneState, beats: sceneBeats };
      saveCharacter(character);
    } catch (err2) { console.error("[applyTurn] recovery save also failed:", err2); }
  }
  // SNG-186 §2f: bind this turn's parsed result + what fired to the model exchange that produced it,
  // so "see the machine" shows prompt → raw → parsed → ops end to end. Dev-only; a no-op when disarmed.
  // Runs after apply so opLedger reflects what actually landed (applied/rejected), even on a partial.
  // SNG-190 §3: a cumulative per-op EMISSION counter for EVERY op — not only markTeacher, the one op
  // logOpOutcome instruments for applied/rejected. This is what lets the firing panel tell "this op
  // has never been emitted for this character" (a real built-and-unreachable signature) from "outcome
  // not instrumented" — the false-zero bug where 31 emitted ops rendered as NEVER FIRED above an
  // exchange that emitted six of them. Rides the save like _opLedger, and runs for EVERY turn (not
  // only dev-captured ones) so the count is real history. _opTurns is the denominator a zero needs.
  const _opsFired = opsFiredIn(result.turn);
  if (_opsFired.length) { character._opEmitted = character._opEmitted || {}; for (const o of _opsFired) character._opEmitted[o.op] = (character._opEmitted[o.op] || 0) + 1; }
  character._opTurns = (character._opTurns || 0) + 1;
  annotateLatest("gm-narrate", { parsed: result.turn, opsFired: _opsFired, opLedger: character?._opLedger ? { ...character._opLedger } : null });
  // ability-arch v2: rank 2 is earned through use, not bought — surface any craft that just became
  // fluent this turn (deduped). Rank 3 is never here; it comes as a GM-marked defining moment.
  if (pendingRankAdvances.length) {
    const names = [...new Set(pendingRankAdvances)].map(id => fullCatalog()[id]?.name).filter(Boolean);
    pendingRankAdvances = [];
    if (names.length) result.turn.narration = (result.turn.narration || "") + "\n\n" + names.map(n => `*▲ Practiced — **${n}** is fluent now (rank 2), earned through use.*`).join("\n");
  }
  // SNG-BATCH-9: the world grows through play — mint any entities the fiction reached for,
  // persist them durable + in-grain, and surface a light note. A generation failure never
  // halts the turn (the narration already stands).
  if (result.turn.generateRequest) {
    try {
      const grown = await handleGenerateRequests(result.turn);
      if (grown.length) {
        result.turn.narration = (result.turn.narration || "") + "\n\n" + grown.map(g =>
          `*✦ The world grows — **${g.name}** ${g.type === "location" ? "takes shape here, and will be here when you return" : g.type === "npc" ? "is now a real presence in this place" : "begins to stir as a thread of its own"}.*`).join("\n");
        saveCharacter(character);
      }
    } catch (err) { console.warn("[generate] request handling skipped:", err?.message); }
  }
  // SNG-035: MOMENT ART — the GM flagged this beat worth a picture. Build it through the floors,
  // attach to the turn for render, drop it in the gallery. Clamped ~1/scene; art-off = no-op.
  if (result.turn.imagePrompt && imagesEnabled() && sceneArtCount < 1) {
    try {
      const moment = { id: `moment-${character.id}-${Date.now().toString(36)}`, prompt: String(result.turn.imagePrompt).slice(0, 300) };
      const url = ensureImage(moment, "moment", { ratingLevel: viewerRatingLevel(), isMinor: false, field: "image" });
      if (url) {
        result.turn.momentArt = url;
        sceneArtCount++;
        addGalleryImage(character, { kind: "moment", prompt: moment.prompt, url, caption: (result.turn.sceneSummary || "").slice(0, 90), worldDay: absoluteWorldDay() });
        saveCharacter(character);
      }
    } catch (err) { console.warn("[art] moment art skipped:", err?.message); }
  }
  // SNG-197 p2: a co-activation that ripened this turn earns a braid — authored, minted, given its moment.
  await maybeMintBraids(result.turn);
  return result;
}

// ---------- SNG-197 part 2: the braid is a MOMENT ----------
// A braid earned in play (or backfilled before this existed) gets its own beat — the two crafts named,
// what they became, the new name, and the ONE thing it can now do that neither parent could. Never a
// system notification (§3): its own modal, reachable + renameable again from the skill wheel node.

function braidEmergentLine(def) {
  const verb = def?.minted?.emergent;
  const grant = def?.tree?.[0]?.grants || "";
  if (verb) return `<div class="braid-moment-new">✦ It can now <strong>${esc(verb)}</strong> — ${esc(grant)}</div>`;
  return grant ? `<div class="braid-moment-new">✦ ${esc(grant)}</div>` : "";
}

/** The player overrules the GM's name (§2: the name is the GM's, and the player's only if they want it).
 *  Persists onto the live def + held row + save; a player name is never later overwritten by enrichment. */
function renameBraid(def, name) {
  const clean = String(name || "").trim().slice(0, 60);
  if (!clean || !def) return;
  def.name = clean;
  def.minted = def.minted || {};
  def.minted.namedBy = "player";
  if (character.customAbilities?.[def.id]) character.customAbilities[def.id].name = clean;
  const held = (character.braids || []).find(b => b.id === def.id);
  if (held) held.name = clean;
  saveCharacter(character);
}

/** A small rename popover reachable from the braid's node on the skill wheel (§2: the control is reachable
 *  from wherever the braid is shown, not only the mint beat). Reuses the .help-overlay surface. */
function showBraidRename(def, onDone) {
  if (!def) return;
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop"; pop.className = "help-overlay";
  const close = () => { pop.remove(); if (onDone) onDone(); };
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="Rename braid">
    <div class="help-short">Rename <strong>${esc(def.name)}</strong> — the GM named it; the name is yours if you want it.</div>
    <div class="braid-moment-rename"><input id="braid-rename-in" maxlength="60" value="${esc(def.name)}"><button class="link-btn" id="braid-rename-go">Save</button></div>
    <div class="help-foot"><button class="btn" id="help-close">Done</button></div>
  </div>`;
  document.body.appendChild(pop);
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
  document.getElementById("braid-rename-go").onclick = () => { const v = String(document.getElementById("braid-rename-in").value || "").trim(); if (v) { renameBraid(def, v); close(); } };
}

/** The mint MOMENT modal — reuses the .help-overlay surface (phone tap-away identical) with its own
 *  celebratory .braid-moment styling. Carries the optional rename control inline. */
function showBraidMoment(def) {
  if (!def) return;
  _braidMomentOpen = true;
  document.getElementById("help-pop")?.remove();
  // SNG-222: the ceremony now serves DISCOVERIES too — the most braid-shaped event there is (a capability
  // neither parent had, earned in play). Same beat, adapted copy; a discovery also carries an image (§5).
  const isDiscovery = def.kind === "discovery";
  // SNG-222 (Erik): credit the real TWO OR MORE skills, joined naturally — "A and B", "A, B and C", etc.
  const strongJoin = arr => { const a = (arr || []).map(esc); return a.length <= 1 ? (a[0] || "") : a.length === 2 ? `${a[0]}</strong> and <strong>${a[1]}` : `${a.slice(0, -1).join("</strong>, <strong>")}</strong> and <strong>${a[a.length - 1]}`; };
  const parents = strongJoin(def.minted?.sourceNames || def._parentNames || []);
  // SNG-201 §2: a braid the world already knows is a RECOGNITION beat, not a CREATION beat — a different
  // kind of cool. The player still earned it through their own play; someone found it first.
  const finder = def._recognition?.firstFinder || (def.minted?.adoptedFrom ? def.minted.adoptedFrom.characterName : null);
  const isRecognition = !isDiscovery && !!(def._recognition || def.minted?.adoptedFrom);
  const kicker = isDiscovery ? "A TECHNIQUE DISCOVERED" : isRecognition ? "A BRAID RECOGNISED" : "A BRAID FORMS";
  const arrow = isDiscovery ? "found in the doing — a thing neither could do apart" : isRecognition ? "you have earned, together" : "braided together into";
  const pop = document.createElement("div");
  pop.id = "help-pop"; pop.className = "help-overlay";
  // CCODE-26: dismissing the moment — "Hold it close", tap-away, OR after "Make it mine" (all route through
  // close) — MARKS it presented so it never re-pops. A 3-component DISCOVERY braid (Silas's "Declared
  // Threshold") never got presented=true from the mint path, and NEITHER close NOR renameBraid set it — so it
  // re-presented every single load even after he named + held it several times. Mark the def AND the real
  // customAbility, then persist; the re-present is a nicety, so a save hiccup must never block the close.
  const close = () => {
    if (def?.minted && !def.minted.presented) {
      def.minted.presented = true;
      if (character?.customAbilities?.[def.id]?.minted) character.customAbilities[def.id].minted.presented = true;
      try { saveCharacter(character); } catch (e) { console.warn("[braid] presented-flag save skipped:", e?.message); }
    }
    pop.remove(); _braidMomentOpen = false; flushBraidMoments();
  };
  pop.innerHTML = `<div class="help-card braid-moment" role="dialog" aria-label="${isDiscovery ? "A technique discovered" : isRecognition ? "A braid recognised" : "A braid forms"}">
    <div class="braid-moment-kicker">✦ ${kicker} ✦</div>
    ${def.image ? `<img class="braid-moment-art" src="${esc(def.image)}" alt="${esc(def.name)}" data-lightbox="${esc(def.image)}">` : ""}
    <div class="braid-moment-parents"><strong>${parents}</strong></div>
    <div class="braid-moment-arrow">${arrow}</div>
    <h2 class="braid-moment-name" id="braid-name">${esc(def.name)}</h2>
    ${isRecognition && finder ? `<div class="braid-moment-finder">first found by ${esc(finder)} — and now yours too</div>` : ""}
    <p class="braid-moment-desc">${esc(def.description || "")}</p>
    ${isDiscovery ? "" : braidEmergentLine(def)}
    <div class="braid-moment-rename">
      <input id="braid-rename-in" maxlength="60" placeholder="…or name it yourself" value="${def.minted?.namedBy === "player" ? esc(def.name) : ""}">
      <button class="link-btn" id="braid-rename-go">Make it mine</button>
    </div>
    <div class="help-foot"><button class="btn" id="braid-moment-close">Hold it close</button></div>
  </div>`;
  document.body.appendChild(pop);
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("braid-moment-close").onclick = close;
  document.getElementById("braid-rename-go").onclick = () => {
    const v = String(document.getElementById("braid-rename-in").value || "").trim();
    if (!v) return;
    if (isDiscovery) renameDiscovery(def, v); else renameBraid(def, v);
    document.getElementById("braid-name").textContent = def.name;
  };
}

/** SNG-222: rename a discovery from its moment (parallels renameBraid). Persists onto the live discovery record. */
function renameDiscovery(def, name) {
  const clean = String(name || "").trim().slice(0, 60);
  if (!clean || !def) return;
  def.name = clean;
  if (def._discovery) def._discovery.name = clean;
  saveCharacter(character);
}

/** SNG-222: queue a minted DISCOVERY's moment — the same ceremony a braid gets (reuses pendingBraidMoments +
 *  showBraidMoment). Generates + caches the discovery's image (§5): the GM's authored prose IS the prompt.
 *  Idempotent via `_momentShown`; a re-surfaced (already-shown) discovery never re-fires. */
function queueDiscoveryMoment(disc, c = character) {
  if (!disc || disc._momentShown) return;
  const cat = { ...CONTENT.abilities, ...(c.customAbilities || {}) };
  // SNG-222 (Erik): credit the REAL skills used — resolve each parent id to its true catalog name, tolerant of
  // id-format drift (a discovery may store "the-attended-end" while the catalog keys "the_attended_end", or vice
  // versa). Try the id, its hyphen/underscore variants and its slug; only then fall back to the id-as-words.
  const resolveName = id => { const s = String(id); return cat[s]?.name || cat[s.replace(/-/g, "_")]?.name || cat[s.replace(/_/g, "-")]?.name || cat[slugify(s)]?.name || s.replace(/[-_]+/g, " "); };
  const parentNames = (disc.abilities || []).map(resolveName).filter(Boolean);
  try {
    if (imagesEnabled() && !disc.image) {
      const url = ensureImage({ id: `discovery-${disc.id}`, prompt: smartClamp(`${disc.name} — ${disc.description}`, 300) }, "moment", { ratingLevel: viewerRatingLevel(), isMinor: false, field: "image" });
      if (url) { disc.image = url; try { addGalleryImage(c, { kind: "discovery", prompt: disc.description, url, caption: disc.name, worldDay: absoluteWorldDay() }); } catch { /* gallery is a convenience */ } }
    }
  } catch (err) { console.warn("[art] discovery art skipped:", err?.message); }
  disc._momentShown = true;
  saveCharacter(c);
  pendingBraidMoments.push({ kind: "discovery", id: disc.id, name: disc.name, description: disc.description, _parentNames: parentNames, _discovery: disc, image: disc.image || null });
}

/** SNG-222: a discovery minted before the moment existed (Erik's Marrow's Wings) — or any silent discovery —
 *  gets the moment it never got, on load. One per load, deferred after the play screen settles (mirrors the
 *  braid backfill). Idempotent via `_momentShown`. */
function presentBackfilledDiscoveries(c) {
  try {
    const pending = (c.discoveries || []).filter(d => d && !d._momentShown);
    if (!pending.length) return;
    queueDiscoveryMoment(pending[0], c);          // one per load; the rest fire on subsequent loads
    setTimeout(flushBraidMoments, 1300);          // after the play screen has settled
  } catch (err) { console.warn("[discovery] re-present skipped:", err?.message); }
}

/** Show the next queued braid moment (one on screen at a time; a burst chains on dismiss, never stacks). */
function flushBraidMoments() {
  if (_braidMomentOpen || !pendingBraidMoments.length) return;
  showBraidMoment(pendingBraidMoments.shift());
}

/** SNG-197 p2: mint any braid a co-activation ripened THIS turn — authored rich, minted, given its moment.
 *  Async but never blocks the turn: on ANY failure the stub still mints and the moment still fires. One per
 *  turn (the richest) so a burst of pairings doesn't spam. */
async function maybeMintBraids(turn) {
  try {
    const catalog = fullCatalog();
    const mintable = mintableBraidsFor(character, { catalog });
    if (!mintable.length) return;
    const def = await authorAndMintBraid(mintable[0], catalog);
    if (!def) return;
    turn.narration = (turn.narration || "") + `\n\n*✦ A braid forms — **${(def.minted?.sourceNames || []).join(" and ")}** become **${def.name}**.*`;
    pendingBraidMoments.push(def);
    setTimeout(flushBraidMoments, 350);
  } catch (err) { console.warn("[braid] mint skipped:", err?.message); }
}

/** Author (best-effort) + mint one mintable pairing. SNG-201: if the WORLD already knows this pairing, the
 *  player ADOPTS the recipe (its name/prose/emergent) — no authoring call, a RECOGNITION moment; the numbers
 *  are still the adopter's own (braidTier). Otherwise this is the first finder: the model authors it (a
 *  CREATION moment), it mints, and syncBraidRecipes publishes it on the next sync. §4: a hallucinated verb is
 *  dropped by the validator AND buildBraidDef. On any authoring failure the stub mints (SNG-196). Returns the
 *  minted def, or null if already braided. */
async function authorAndMintBraid(m, catalog) {
  const vocab = Object.keys(FN_INDEX?.verbToFamily || {}); // the real 24 verbs
  // SNG-201 §2: the world already found this pairing → adopt it, no LLM call, a recognition beat.
  const known = recipeFor(braidRecipeStore, m.components);
  if (known) {
    const def = buildBraidDef(character, m.components, catalog, { authored: recipeToAuthored(known), functionVocab: vocab, braidFraction: CONTENT.rules?.leveling?.braidCheaperParentFraction, craftMechanics: CONTENT.craftMechanics });
    if (!def) return null;
    def.minted.worldName = known.name;
    def.minted.adoptedFrom = known.contributedBy || null;
    def.minted.shared = true;                    // it is already the world's — nothing to publish
    if (!mintBraid(character, def, { at: absoluteWorldDay() })) return null;
    def.minted.presented = true;
    def._recognition = { firstFinder: firstFinderName(known) };   // moment framing (not persisted)
    saveCharacter(character);
    return def;
  }
  // first finder here — author fresh; syncBraidRecipes publishes it (or adopts if someone beat us to sync).
  let authored = {};
  try {
    const { system, user } = buildBraidPrompt(m.components, m.sources, { vocab, maxRank: m.maxRank, coActivations: m.coActivations });
    const raw = await callClaudeJSON([{ role: "user", content: user }], { task: "generate", system });
    authored = validateBraidAuthored(raw, { parentFunctions: [...new Set(m.sources.flatMap(s => s.functions || []))], vocab, maxRank: m.maxRank });
    if (authored._rejected?.emergentFunction) console.warn("[braid] rejected hallucinated emergent verb:", authored._rejected.emergentFunction);
  } catch (err) { console.warn("[braid] authoring skipped, minting stub:", err?.message); authored = {}; }
  const def = buildBraidDef(character, m.components, catalog, { authored, functionVocab: vocab, braidFraction: CONTENT.rules?.leveling?.braidCheaperParentFraction, craftMechanics: CONTENT.craftMechanics });
  if (!def) return null;
  if (!mintBraid(character, def, { at: absoluteWorldDay() })) return null;
  def.minted.presented = true;
  saveCharacter(character);
  return def;
}

/** Find a minted braid def by its pairing key (order-independent). */
function braidDefByKey(key) {
  const held = (character.braids || []).find(b => braidKey(b.from || []) === key);
  return held ? character.customAbilities?.[held.id] : null;
}

/** SNG-201 §2: adopt a world recipe onto a local first-finder-lost braid — the world's craft (name unless
 *  the player set a personal nickname, description/tree/emergent), the adopter's numbers unchanged. A player
 *  nickname (namedBy 'player') renders locally only and is NEVER overwritten by the world-name. */
function adoptRecipeOntoLocal(def, recipe) {
  const rebuilt = buildBraidDef(character, def.minted.from, fullCatalog(), { authored: recipeToAuthored(recipe), functionVocab: Object.keys(FN_INDEX?.verbToFamily || {}), braidFraction: CONTENT.rules?.leveling?.braidCheaperParentFraction, craftMechanics: CONTENT.craftMechanics });
  if (!rebuilt) return;
  rebuilt.minted.mintedAt = def.minted.mintedAt;
  rebuilt.minted.presented = def.minted.presented;
  rebuilt.minted.shared = true;
  rebuilt.minted.worldName = recipe.name;
  rebuilt.minted.adoptedFrom = recipe.contributedBy || null;
  if (def.minted.namedBy === "player") { rebuilt.name = def.name; rebuilt.minted.namedBy = "player"; } // keep the personal nickname (local only)
  character.customAbilities[def.id] = rebuilt;
  const held = (character.braids || []).find(b => b.id === def.id); if (held) held.name = rebuilt.name;
}

/** SNG-201: publish this character's first-finder braids to the shared recipe store, and adopt any pairing
 *  someone else landed first. Rides pushMergedFile (first-PUT-wins, SHA-retry re-contest). Best-effort,
 *  never throws; refreshes the local recipe cache for the mint-time adopt path. No-op without sync. */
async function syncBraidRecipes({ character, profile } = {}) {
  if (!syncEnabled() || !character) return;
  try {
    const worldDay = absoluteWorldDay();
    const me = { playerKey: getPlayerKey(), characterId: character.id, characterName: character.name || character.id };
    const localRecipes = (character.braids || [])
      .map(b => character.customAbilities?.[b.id])
      .filter(d => d?.minted?.enriched === true && !d.minted.shared)   // stub never promotes; already-shared never re-submits
      .map(d => buildRecipeRecord(d, { worldDay, contributedBy: me }))
      .filter(Boolean);
    let result = null;
    if (localRecipes.length) {
      await pushMergedFile(RECIPES_PATH, (remote) => { const out = mergeRecipes(remote || {}, localRecipes); result = out; return out.store; },
        `braid recipes: ${localRecipes.length} from ${me.characterName}`);
    }
    try { braidRecipeStore = ensureRecipeStore(await fetchRepoJSON(RECIPES_PATH)); } catch { /* keep the cache we have */ }
    if (result) {
      for (const rec of result.published) { const d = braidDefByKey(rec.braidKey); if (d) { d.minted.shared = true; d.minted.firstFinder = true; } }
      for (const { local, recipe } of result.adopted) { const d = braidDefByKey(local.braidKey); if (d && d.minted.namedBy !== "player") adoptRecipeOntoLocal(d, recipe); else if (d) { d.minted.shared = true; d.minted.worldName = recipe.name; d.minted.adoptedFrom = recipe.contributedBy || null; } }
      saveCharacter(character);
    }
  } catch (err) { console.warn("[recipes] sync skipped:", err?.message); }
}

/** SNG-197 p2 (ROUND 2 answer 4): braids backfilled before this existed (Silas's two) arrived as stubs and
 *  never got a moment. On load, enrich the stub in place and RE-PRESENT it — the moment it never got, not a
 *  silent upgrade. One per load, best-effort, non-blocking (mirrors enrichPersonalArc). */
async function presentBackfilledBraids(c) {
  try {
    const catalog = { ...CONTENT.abilities, ...(c.customAbilities || {}) };
    const pending = (c.braids || []).map(b => c.customAbilities?.[b.id]).filter(d => d && d.minted && d.minted.presented !== true);
    if (!pending.length) return;
    let shown = pending[0];
    if (!shown.minted.enriched && shown.minted.namedBy !== "player") {
      const vocab = Object.keys(FN_INDEX?.verbToFamily || {});
      const sources = (shown.minted.from || []).map(id => catalog[id]).filter(Boolean);
      const maxRank = (shown.tree || []).length || 1;
      if (sources.length === 2) {
        try {
          const { system, user } = buildBraidPrompt(shown.minted.from, sources, { vocab, maxRank });
          const raw = await callClaudeJSON([{ role: "user", content: user }], { task: "generate", system });
          const authored = validateBraidAuthored(raw, { parentFunctions: [...new Set(sources.flatMap(s => s.functions || []))], vocab, maxRank });
          const rich = buildBraidDef(c, shown.minted.from, catalog, { authored, functionVocab: vocab });
          if (rich) { rich.minted.mintedAt = shown.minted.mintedAt; c.customAbilities[shown.id] = rich; shown = rich; }
        } catch (err) { console.warn("[braid] backfill enrich skipped:", err?.message); }
      }
    }
    shown.minted.presented = true;
    saveCharacter(c);
    pendingBraidMoments.push(shown);
    setTimeout(flushBraidMoments, 1200); // after the play screen has settled
  } catch (err) { console.warn("[braid] re-present skipped:", err?.message); }
}

// SNG-231 §2: the op-group applyTurn is CURRENTLY in — so a throw that the CCODE-07 guard swallows names the
// culprit ("codexUpdates" / "questUpdates" / …) instead of "something didn't land". Set before each group; on a
// throw it holds the group that was mid-apply. Module-level (one applyTurn runs at a time).
let _applyPhase = null;
// SNG-231 §2 (resilience): run ONE op-group ISOLATED — a throw in it (e.g. a fresh NPC's npcUpdates) is recorded
// and NAMED, but does NOT abort the rest of applyTurn. This is the fix for "the duel won't start": before this,
// an npcUpdates throw aborted every later op, including the `newEncounter` that begins a fight. Now each group
// stands alone; only the failing one is lost. Failures accrue on character._applyFailures for the aside/report.
function applyStep(label, fn) {
  _applyPhase = label;
  try { return fn(); }
  catch (err) {
    console.error(`[applyTurn] op-group "${label}" failed — ISOLATED, the turn continues:`, err);
    character._applyFailures = [...(character._applyFailures || []), { op: label, at: new Date().toISOString(), message: String(err?.message || err).slice(0, 200), stack: String(err?.stack || "").split("\n").slice(0, 3).join(" <- ").slice(0, 400) }].slice(-6); // prose-cap-ok: error message/stack diagnostics, not displayed model prose
    return undefined;
  }
}
function applyTurn(turn, resolution, playerWords = null) {
  _applyPhase = "start";
  character._applyFailures = null; // SNG-231 §2: fresh per-turn; applyStep appends isolated op-group failures here
  // CCODE-07: NEVER let a stranded currentLocationId throw. A place promoted from a sub-place, or a
  // generated location whose record didn't survive a reload, leaves `CONTENT.locations[id]`
  // undefined — and this function reads `location.communityId` (deeds) and `location.id` (ledger).
  // The ledger read sits AFTER the save, so a throw there persisted the turn and lost the render.
  // Fall back to a minimal stand-in and flag it; the SNG-154 hierarchy work fixes the root cause.
  const location = CONTENT.locations[character.currentLocationId]
    || { id: character.currentLocationId || "unknown", name: "an unmapped place", communityId: null, regionId: null, _stranded: true };
  if (location._stranded) console.warn("[applyTurn] currentLocationId resolves to no loaded location:", character.currentLocationId);
  const dayNow = readClock(character.clock).day;
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  // SNG-128: advance the session marker each played beat (a new session after a real-time gap). Cheap;
  // the World-Authorship Chronicle reads these boundaries for its per-session log.
  try { touchSession(character, { nowISO: new Date().toISOString(), worldDay: absoluteWorldDay() }); } catch { /* session marker is best-effort */ }

  // deltas from the GM (bounded trust: clamp everything)
  _applyPhase = "characterDeltas";
  const d = turn.characterDeltas || {};
  if (d.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + clampInt(d.health, -20, 15)));
  if (d.energy) character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + clampInt(d.energy, -20, 40)));
  if (d.xp) character.xp += Math.max(0, Math.min(25, d.xp | 0));
  // SNG-246 BUG2: surface GM inventory changes as a mechanical note in the flow — a theft (inventoryRemove) was
  // SILENT, so a legitimate outcome ("the raider took your Waterskin") felt like a broken button. Same italic
  // mechanical-note convention as itemUpdates below, so the loss/gain is never a mystery.
  const _invNotes = [];
  // SNG-250 §3/§4 (CCODE-55): an ITEM the GM invents is GENERATED CONTENT, and this is the path that
  // actually mints one — items do NOT go through generate() (that path makes npc/location/arc only), so
  // gating them here is gating the real producer rather than building a second one. §3's bar: "a whole
  // item DOES something the rules can apply — usable, not just flavor."
  //
  // Never REJECTED, deliberately. The fiction just handed the player this thing; making it vanish would
  // lose a story beat to a data problem, and §3 rates a thin item as DEGRADED (it works, hollowly) —
  // Erik's OQ3 lean is warn-repair for exactly this type. So a thin item is kept, STAMPED so it stays
  // findable, and — the point — SAID OUT LOUD in the same mechanical-note channel as the gain itself,
  // because a draught that restores nothing should not read to the player as a working draught.
  for (const item of d.inventoryAdd || []) {
    const added = addItem(character, item, CONTENT.items);
    const nm = typeof item === "string" ? item : item?.name;
    if (nm) _invNotes.push(`✦ ${nm} — added to your pack.`);
    if (added && typeof item !== "string") {
      const rep = checkBorn(added, "item", CONTENT.consumerContract, { vocabs: genContractDeps().vocabs });
      if (rep.gated && rep.verdict !== "clean") {
        added._contract = { verdict: rep.verdict, missing: rep.missing.map(m => m.field), vague: rep.vague.map(v => v.id) };
        console.warn(`[born-contract] item "${added.name}" ${describeBorn(rep)}`);
        // The one case worth telling the player about: a consumable that spends to nothing. consumeItem
        // would destroy the stack and return {} — silently, and indistinguishably from a working one.
        if (rep.vague.some(v => v.id === "consumable-spends-to-something")) _invNotes.push(`  ${nm} carries no mechanical effect yet — it is a story item until one is set.`);
      }
    }
  }
  for (const item of d.inventoryRemove || []) { const nm = typeof item === "string" ? item : item?.name; removeItem(character, nm); if (nm) _invNotes.push(`− ${nm} — taken from you.`); }
  if (_invNotes.length) turn.narration = (turn.narration || "") + "\n\n" + _invNotes.map(n => `*${n}*`).join("\n");
  // SNG-137: items EVOLVE — the GM grows an owned item's story (description/name/provenance/use).
  // SNG-251 §2c: and now, when the FICTION earned it, the evolution can carry explicit MECHANICAL GRANTS —
  // bounded by Erik's §4 economy (a ceiling that is a function of level + craft rank, ~1 evolution/day),
  // never by a flat ban. The refusals are surfaced too: an item that is FULL says so, rather than the
  // player wondering why their binding didn't take.
  if (turn.itemUpdates?.length) {
    const wd = (() => { try { return absoluteWorldDay(); } catch { return null; } })();
    // §4's rate limit bites BEFORE the grant lands, and only on the POWER: an item that has already taken
    // on what it can hold today still evolves its prose, name and provenance (story is always free) — it
    // simply banks no further mechanics. Rate-limiting the storytelling would be the wrong lesson.
    const ops = turn.itemUpdates.map(op => {
      if (!op?.grants) return op;
      const held = findItem(character, op.name || op.customName || "");
      if (held && !evolutionBudget(held, wd, character).canEvolve) { const { grants, ...rest } = op; return rest; }
      return op;
    });
    const iu = applyItemUpdates(character, ops, itemEvolveDeps(ops));
    for (const u of iu) if (u.changed.includes("grants")) { const held = findItem(character, u.name); if (held) recordEvolution(held, wd); }
    if (iu.length) turn.narration = (turn.narration || "") + "\n\n" + iu.map(u => `*✦ ${u.name} has changed — ${u.changed.join(", ")}.*`).join("\n");
    for (const r of (iu.refused || [])) turn.narration = (turn.narration || "") + `\n\n*✦ ${r.item} cannot hold "${r.grant}" as well — it carries all it can at your level and craft.*`;
  }
  // SNG-251 §2d: an evolution can SPLIT an item — the shadow-twin as its own callable thing. A derived item
  // is a PEER, not a lesser echo (Erik corrected the spec on exactly this), so it gets its own sheet under
  // the SAME ceiling as its parent; nothing here scales a child down.
  if (turn.deriveItem) {
    for (const op of (Array.isArray(turn.deriveItem) ? turn.deriveItem : [turn.deriveItem]).slice(0, 2)) {
      const made = deriveItem(character, op, { ...itemEvolveDeps([op]), catalog: CONTENT.items, canDerive });
      if (made) turn.narration = (turn.narration || "") + `\n\n*✦ ${esc(made.item.customName || made.item.name)} is split from ${esc(made.parent.customName || made.parent.name)} — its own thing now, yours to call.*`;
    }
  }

  // deeds → reputation (day-stamped so news spread knows when they happened; SNG-041 also
  // stamps the shared absolute world-day so a deed dates the same on every character's calendar)
  _applyPhase = "deeds";
  const wdNow = absoluteWorldDay();
  for (const deed of turn.deeds || []) {
    const recorded = recordDeed(character, { ...deed, locationId: location.id, communityId: deed.communityId ?? location.communityId }, mods);
    recorded.day = dayNow;
    recorded.worldDay = wdNow;
  }
  // companion bonds grow through shared life (engine-owned; GM has no op)
  {
    const comps = activeCompanions(character, CONTENT.companions);
    for (const c of comps) {
      const unlocked = [];
      if ((turn.deeds || []).length) {
        unlocked.push(...growBond(character, c.id, "deed", CONTENT.rules, c.stages).events);
        // SNG-200B §2c: a companion present for a deed REMEMBERS it — its shared history with the character.
        for (const deed of turn.deeds) noteCompanionWitnessed(character, c.id, { ...deed, day: dayNow });
      }
      if (resolution?.equipHelpers?.includes(c.name)) unlocked.push(...growBond(character, c.id, "assist", CONTENT.rules, c.stages).events);
      if (unlocked.includes("grant") && c.bondGrants) {
        const def = sanitizeNewAbility(c.bondGrants, { verbVocab: genContractDeps().vocabs["function_vocabulary.verbs"] }); // SNG-250 §3: born with real families
        if (def && !character.abilities.some(a => a.abilityId === def.id)) {
          character.customAbilities = character.customAbilities || {};
          character.customAbilities[def.id] = def;
          character.abilities.push({ abilityId: def.id, level: 1 });
          turn.narration += `

*✦ Your bond with ${c.name} deepens into something new: **${def.name}**.*`;
        }
      }
      // SNG-200 §1+§4: a stage was REACHED — its own beat (however many stages the companion authors, not
      // a hardcoded 2), and the companion's codex node updates to the new stage. Marrow's third stage
      // ("The One Who Stays") is now a moment, not an unreachable line in a JSON file.
      const stageEvent = unlocked.find(e => typeof e === "string" && e.startsWith("stage:"));
      if (stageEvent) {
        const stageNum = Number(stageEvent.split(":")[1]);
        const st = (c.stages || []).find(x => x.stage === stageNum);
        if (st) {
          turn.narration += `

*✦ ${c.name} has changed — **${st.name}**.${st.narrationHints ? ` ${st.narrationHints}` : ""}*`;
          try { applyCodexUpdates(character, [companionCodexUpdate(c, { stage: stageNum })], { day: readClock(character.clock).day }); } catch { /* codex is a mirror — never break the turn */ }
        }
      }
    }
  }
  // people & places remember (typed ops, clamped)
  const memCtx = { locationId: location.id, day: readClock(character.clock).day, entities: codexEntities(), rules: CONTENT.rules, affiliate: affiliateNpc };
  applyStep("npcUpdates", () => applyNpcUpdates(character, turn.npcUpdates || [], memCtx));
  // legacy relationshipDeltas: tolerated but may only UPDATE existing people — this path once minted
  // duplicate id-named registry entries. SNG-195 G4: intentionally NOT in the contract or SALVAGEABLE_OPS
  // (the model is told to use npcUpdates.relationshipDelta); this inbound tolerance stays for old replies.
  applyStep("relationshipDeltas", () => applyNpcUpdates(character, (turn.relationshipDeltas || []).map(r => ({
    op: "update", npcId: r.npcId, relationshipDelta: clampInt(r.delta || 0, -2, 2), note: r.note
  })), memCtx));
  // SNG-154: pass the resolver + catalog so a GM-named parent can be validated against real places
  // (containment on write, instead of inferring it from wherever we last thought we were standing).
  applyStep("placeUpdates", () => applyPlaceUpdates(character, location.id, turn.placeUpdates || [], { ...memCtx, resolveLocationId, locations: CONTENT.locations }));
  applyStep("codexUpdates", () => applyCodexUpdates(character, turn.codexUpdates || [], memCtx));
  applyStep("factUpdates", () => applyFactUpdates(character, turn.factUpdates || [], memCtx));
  ensureBondPortraits(character); // SNG-136: a bond that crossed a high milestone this turn earns a portrait
  // §2 engagement: interacting with a grown NPC or accreting a fact about a grown entity is
  // attention — it keeps them real + surfacing. (Revisiting a grown place is signaled in travelTo.)
  for (const u of turn.npcUpdates || []) noteGeneratedAttention(u.npcId, "interact", memCtx.day);
  for (const u of turn.codexUpdates || []) if (u.entityId) noteGeneratedAttention(u.entityId, "fact", memCtx.day);
  if (character.activeEncounter && turn.encounterOps) {
    applyStep("encounterOps", () => { const encA = activeEnc(); if (encA) applyEncounterOps(encA.state, sanitizeEncounterOps(turn.encounterOps, encA.def, encA.state)); });
  }
  if (turn.newEncounter) {
    // SNG-231 §2: ISOLATED — the GM-invented fight/duel def MUST register even if an earlier op (npcUpdates on a
    // fresh NPC) threw. This is the "the duel won't start" fix: before the isolation, an npcUpdates throw aborted
    // applyTurn here, so the invented encounter was never registered and the choice referencing it did nothing.
    let nd = null;
    applyStep("newEncounter", () => { nd = sanitizeNewEncounter(turn.newEncounter); if (nd) { character.customEncounters = character.customEncounters || {}; character.customEncounters[nd.id] = nd; } });
    // CCODE-19: registering the def is necessary but NOT sufficient — a fight only STARTS when a choice carries
    // its encounterId (onChoice path A, ~4368). The GM invents the def yet rarely wires a matching choice, so the
    // duel it just narrated never begins ("I can't get a fight/duel to start"). Guarantee the engage path: when
    // nothing already engages this new encounter, inject a deterministic ENGAGE choice (routes through path A).
    // The GM's other options + the freefield stay the decline path; for a LETHAL fight, add an explicit "step
    // back" so decline-before-engagement (rule 18 — lethal is offered, never imposed) is never missing.
    if (nd && !character.activeEncounter && !(turn.choices || []).some(c => c.encounterId === nd.id)) {
      const foe = nd.opponent?.name || nd.name || "your opponent";
      const engage = nd.type === "duel"
        ? { label: `⚔ Face ${foe}${nd.lethal ? " — blood is on the table" : ""}`, encounterId: nd.id, attribute: "physical", subAttribute: "strength", axes: {}, difficulty: 0, intentTags: ["risky", "commit"] }
        : { label: `▶ Take on ${nd.name || "the encounter"}`, encounterId: nd.id, attribute: "physical", subAttribute: "agility", axes: {}, difficulty: 0, intentTags: ["risky", "commit"] };
      const inject = [engage];
      if (nd.lethal) inject.push({ label: "Step back — not this fight", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["careful", "retreat"], trivial: true });
      turn.choices = [...inject, ...(turn.choices || [])];
    }
  }
  // spectrum fingerprint drifts toward the axes of what you actually did (EWMA)
  if (resolution?.action?.axes) {
    for (const [ax, v] of Object.entries(resolution.action.axes)) {
      const cur = character.alignment[ax] || 0;
      character.alignment[ax] = Math.max(-1, Math.min(1, cur * 0.95 + v * 0.05));
    }
  }
  // the HUMAN's profile learns from the intent tags of the chosen action
  if (resolution?.action?.intentTags?.length) {
    updateProfile(character, resolution.action.intentTags, CONTENT.rules.playerAptitudes, CONTENT.rules);
  }
  // discoveries: only mintable when the engine flagged this resolution eligible
  if (turn.discovery && resolution?.discoveryEligible) {
    const minted = recordDiscovery(character, {
      name: turn.discovery.name, description: turn.discovery.description,
      abilityIds: resolution.discoveryAbilities || [], noveltyHint: resolution.action?.noveltyHint || "", day: dayNow
    });
    if (minted) {
      registerDiscoveryAbility(character, minted, fullCatalog(), { at: dayNow, braidFraction: CONTENT.rules?.leveling?.braidCheaperParentFraction, craftMechanics: CONTENT.craftMechanics }); // SNG-226: it's not just RECORDED, it's USABLE — the parser/wheel/resolver read abilities[]
      turn.narration += `\n\n*✦ New technique discovered: **${minted.name}** — it's yours now, ready to use.*`;
      queueDiscoveryMoment(minted, character); // SNG-222: a discovery deserves the ceremony (+ its image, §5)
      setTimeout(flushBraidMoments, 450);       // after the turn renders (parallels the braid mint flush)
    }
  }
  // earned xp: every meaningful resolved action teaches something (trivial acts don't)
  if (resolution && resolution.degree && resolution.degree !== "auto") {
    const xpT = CONTENT.rules.xp || {};
    let gain = xpT[resolution.degree] ?? 0;
    if (resolution.action?.novel && gain) gain += xpT.novelBonus ?? 0;
    character.xp += gain;
  }
  // SNG-011 + SNG-131 + SNG-141: substrate ACCESS unlocks — only when the fiction earns it. Precursor,
  // living-current, and wild-current all open per-ability through the SAME door (parity). One generalized
  // op (unlockSubstrate); unlockPrecursor stays as a back-compat alias. The target list is chosen from the
  // ability's OWN powerSystem (validated) — a wrong-system id can't unlock anything (mirrors the seed guard).
  // wild_current opens its list here; its learn-gate reader lands with SNG-140 (until then the unlock is inert, by design).
  const SUBSTRATE_ACCESS = { precursor: "precursorAccess", living_current: "livingCurrentAccess", wild_current: "wildCurrentAccess" };
  // SNG-195 G4: unlockLivingCurrent/unlockWildCurrent are LEGACY aliases — the contract tells the model to
  // emit `unlockSubstrate` for living/wild current too (SUBSTRATE_ACCESS routes by the ability's powerSystem).
  // They stay here as inbound tolerance for old replies; they are deliberately not in the contract/salvage.
  for (const u of [turn.unlockSubstrate, turn.unlockPrecursor, turn.unlockLivingCurrent, turn.unlockWildCurrent]) {
    if (!u?.abilityId || !u?.via) continue;
    const ab = fullCatalog()[u.abilityId];
    const listKey = ab && SUBSTRATE_ACCESS[ab.powerSystem]; // powerSystem-validated — never unlock the wrong system
    if (!listKey) continue;
    if (!(character[listKey] || []).includes(u.abilityId)) {
      character[listKey] = [...(character[listKey] || []), u.abilityId];
      turn.narration += `\n\n*✦ A door opens that was never on any list: **${ab.name}** may now be learned (${String(u.via).slice(0, 80)}).*`;
    }
  }
  // ability-arch v2: the GM marks a defining moment → rank 3 (mastery). The engine confirms the earn
  // (rank 2, practiced, gates met) so mastery can never be handed to an unpracticed craft. A craft that
  // forks at rank 3 needs the player to choose its permanent path first (Law 9) — flag it for the
  // Character screen rather than auto-choosing.
  if (turn.markDefiningMoment?.abilityId) {
    const mid = turn.markDefiningMoment.abilityId;
    const ab = fullCatalog()[mid];
    const r = markDefiningMoment(character, mid, CONTENT.rules, { attributeGates: CONTENT.attributeGates, branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    if (r.ok) turn.narration += `\n\n*✦ A defining moment — **${ab?.name}** is mastered now (rank 3).*`;
    else if (r.forkPending) { character.pendingMasteryFork = mid; turn.narration += `\n\n*⑂ A defining moment for **${ab?.name}** — but it stands at a fork. Choose its path on your Character screen to master it.*`; }
    // SNG-261 §B: mastery can OPEN A DOOR, and the player must be told in the same beat. An access list that
    // grows silently is a door nobody knows they may walk through — which is exactly how `unlockPrecursor`
    // managed to never fire without anyone noticing.
    for (const o of (r.opened || [])) turn.narration += `\n\n*✦ And a door opens that was never on any list: **${o.name}** may now be learned — ${o.via}.*`;
  }
  // SNG-100b: the GM records a willing teacher of a people (durable — unlocks that people's capstones,
  // and later promotion/acquisition). Only for a real tradition; the engine never invents one.
  // SNG-179: this guard used to DISCARD an unresolvable traditionId in silence. The op has a rule, a
  // schema entry, a dispatch and a salvage slot, and still never fired once in sixteen levels —
  // because the model was asked for an id it had never been shown and reasonably wrote the word from
  // the fiction ("radiant"; the id is `blazeborn`). The vocabulary block now ships in the prompt, and
  // a miss is RECORDED rather than swallowed, so the next one is a number instead of a mystery.
  if (turn.markTeacher?.traditionId && !CONTENT.traditionIndex?.byId?.[turn.markTeacher.traditionId]) {
    const bad = String(turn.markTeacher.traditionId).slice(0, 40);
    character._opVocabMisses = [...(character._opVocabMisses || []), `markTeacher: "${bad}" is not a traditionId`].slice(-6);
    console.warn("[ops] markTeacher discarded — unknown traditionId:", bad);
    logOpOutcome("markTeacher", "rejected-vocab");
  }
  if (turn.markTeacher?.traditionId && CONTENT.traditionIndex?.byId?.[turn.markTeacher.traditionId]) {
    logOpOutcome("markTeacher", "applied");
    bindTeacher(turn.markTeacher.traditionId, turn.markTeacher.npcId, turn.markTeacher.willing !== false);
  }
  // SNG-179 (DERIVE, NOT DEMAND): a `bondType: "mentor"` on an npcUpdate IS a teaching relationship —
  // read it as one rather than asking the model to ALSO emit markTeacher. The diagnosis proved the
  // model records the mentoring richly in npcUpdates and never fires the thin one-shot mark beside it;
  // asking it to say the same thing twice is asking it to choose, and it chooses the expressive op.
  // The tradition is the mentor's OWN primary domain (SNG-177) — never invented — and an
  // unattributable mentor (no resolvable domain, e.g. a registry-only NPC) binds NOTHING, which is
  // honest rather than a guess. This is additive: an explicit markTeacher still works above.
  for (const u of (turn.npcUpdates || [])) {
    if (u?.bondType !== "mentor" || !u.npcId) continue;
    const rec = CONTENT.npcs?.[u.npcId] || character.generated?.npc?.[u.npcId] || character.npcRegistry?.[u.npcId];
    const dom = rec?.domains?.primary;
    const tid = Array.isArray(dom) ? dom[0] : dom;
    if (tid && CONTENT.traditionIndex?.byId?.[tid] && !character.teachers?.[tid]?.willing) {
      bindTeacher(tid, u.npcId, true);
      logOpOutcome("markTeacher", "derived-from-bond");
    }
  }
  function bindTeacher(traditionId, npcId, willing) {
    const first = !character.teachers?.[traditionId]?.willing;
    character.teachers = character.teachers || {};
    character.teachers[traditionId] = { met: true, willing, npcId: String(npcId || "").slice(0, 60) || null };
    if (first && willing) turn.narration += `\n\n*✦ You have a teacher among the ${traditionLabel(traditionId)} now — their deepest craft opens to you as you earn their people's trust.*`;
  }
  // SNG-101: the GM surfaces a promotion the character has EARNED — the engine flags it for the player to
  // commit (Law 9), and only if promotionEligible is genuinely met. The GM can offer; it can never foreclose.
  if (turn.offerPromotion?.domainKey === "secondary" || turn.offerPromotion?.domainKey === "tertiary") {
    const dk = turn.offerPromotion.domainKey;
    const e = promotionEligible(character, dk, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    if (e.eligible) { character.pendingPromotion = dk; turn.narration += `\n\n*✦ You are being recognized — you may be raised into **${traditionLabel(e.trad)}** as your ${e.to}. Choose on your Character screen; it will close the far pole of that axis to you.*`; }
  }
  // SNG-102: the GM offers a NEW people to join — the engine flags it only if genuinely acquirable; the
  // player commits (Law 9 — joining forecloses the far pole of that people's axis). The GM never forecloses.
  if (turn.offerAcquisition?.traditionId) {
    const tid = turn.offerAcquisition.traditionId;
    if (acquirable(character, tid, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex }).ok) {
      character.pendingAcquisition = tid;
      turn.narration += `\n\n*✦ The ${traditionLabel(tid)} would take you as one of their own. You may join them on your Character screen — entering as a novice (Tier I), and closing the far pole of their axis to you.*`;
    }
  }
  // SNG-145: the GM raises an intent gate for fiction-recognized costly acts the engine's
  // declared-ability gates can't see (a freetext strangling, a named point of no return).
  // Same escrow as the engine gates; the answer returns as a synthetic beat. The contract
  // (gm.js) forbids emitting the act's own effects alongside offerIntent — anything the GM
  // also emitted this turn commits normally, which is why the rule exists.
  if (turn.offerIntent && !character._pendingIntent) {
    const gate = sanitizeOfferIntent(turn.offerIntent);
    if (gate) character._pendingIntent = { ...gate, resume: null };
  }
  // GM-granted new ability: earned in fiction, clamped by engine
  if (turn.newAbility) {
    // SNG-250 §3 (CCODE-55): the verb vocab is INJECTED so a GM-minted ability is born with real
    // function families instead of none — see sanitizeNewAbility. Same index familiesOfAbility uses.
    const def = sanitizeNewAbility(turn.newAbility, { verbVocab: genContractDeps().vocabs["function_vocabulary.verbs"] });
    if (def) { const rep = checkBorn(def, "skill", CONTENT.consumerContract, { vocabs: genContractDeps().vocabs }); if (rep.gated && rep.verdict !== "clean") console.warn(`[born-contract] newAbility ${describeBorn(rep)}`); }
    const granted = def ? applyNewAbility(character, def, CONTENT.rules) : { ok: false };
    if (granted.ok) turn.narration += `

*✦ New ability learned: **${def.name}**${def.taughtBy ? ` (from ${def.taughtBy})` : ""} — ${def.description.slice(0, 120)}*`;
  }
  // level up: banked growth the player chooses to spend
  const prevLevel = character.level;
  for (const msg of applyLevelUps(character, CONTENT.rules)) {
    turn.narration += `\n\n*You feel it settle into you — a new steadiness. (${msg})*`;
  }
  const portraitNote = refreshPortraitMilestone(character, prevLevel); // SNG-035: milestone portrait
  if (portraitNote) turn.narration += `\n\n*✦ ${portraitNote}*`;
  // quests: typed ops from the GM, applied within bounds; ctx.entities links giver/location
  // to codex nodes and lets the resolver match drifted titles (SNG-BATCH-7 Phase 3)
  const questNotes = applyStep("questUpdates", () => applyQuestUpdates(character, turn.questUpdates || [], { entities: codexEntities() })) || [];
  if (questNotes.some(n => /couldn't match/i.test(n))) console.warn("[quests]", questNotes.filter(n => /couldn't match/i.test(n)));
  if (questNotes.some(n => /complet/i.test(n))) autoVerifyLeg("b7-inv", "a quest progressed to complete"); // SNG-051 auto-verify
  // SNG-162 §3: an unmatched quest op is a CONTENT bug worth seeing. It was already never silent,
  // but it landed in GM notes where a player never looks — surface it in the quest panel instead.
  const unmatched = questNotes.filter(n => /couldn't match/i.test(n));
  if (unmatched.length) character._questMatchNotes = unmatched.slice(-3);
  // SNG-162 §1: STAGE OPS — the fiction advancing a structured quest. The model observed; the
  // engine adjudicates. Rejections are recorded (never silent) so a GM that keeps naming the wrong
  // stage is visible rather than mysteriously ineffective.
  if (turn.stageOps?.length) {
    _applyPhase = "stageOps";
    const advanced = [], refusedStages = [];
    for (const op of turn.stageOps.slice(0, 3)) {
      const r = advanceStructuredQuest(character, op, { day: dayNow });
      if (r.ok) advanced.push(r); else refusedStages.push(r);
    }
    for (const r of advanced) {
      turn.narration = (turn.narration || "") + `\n\n*✦ ${r.title} — ${r.change || "a step forward"}.${r.awaitingResolution ? " Every stage is done; how it ends is yours to choose." : ""}*`;
    }
    // SNG-239: a stage just completed carries an EARNED reveal. The aside above records it, but the GM's own
    // PROSE is what the player reads as the story — so hand the reveal to the NEXT beat as a HARD "state this
    // plainly, progress narrows" directive (the Fix-A pattern: a hard directive beats the soft rule the 114-MUST
    // load drops). Carries the change + whether it's now the decision point (where clarity matters most).
    const reveals = advanced.filter(r => r.change).map(r => ({ title: r.title, change: r.change, atDecision: !!r.awaitingResolution }));
    if (reveals.length) pendingStageReveal = reveals;
    if (refusedStages.length) {
      character._stageOpRefusals = refusedStages.map(r => `${r.questId || "?"}: ${r.why}${r.why === "not-current-stage" ? ` (named "${r.named}", current is "${r.expected}")` : ""}`).slice(-4);
      console.warn("[quests] stageOps refused:", character._stageOpRefusals);
    }
    if (advanced.length) autoVerifyLeg("sng162-stage", `a structured quest advanced FROM PLAY (${advanced[0].title})`);
  }
  // SNG-032 narrative-driven time: when the fiction moves time (a night's sleep, a
  // journey montage, a long vigil — or a quick exchange), the GM declares it via
  // timeOps.hoursPassed and the engine advances the clock to match, INSTEAD of the fixed
  // beat default. Narration LEADS the clock, never trails. Fallback = old beat behavior.
  const extraHours = Math.max(0, Math.min(12, Number(turn.timeAdvanceHours) || 0)); // SNG-195 G4: timeAdvanceHours is a legacy alias of timeOps (contract op) — inbound tolerance only, not advertised
  _applyPhase = "late-ops"; // time / arcs / assignments / ledger — one label for the tail (the state-op culprits above are named)
  const beatDefault = (turn.sceneEnded ? ADVANCE.sceneEnd : ADVANCE.beat) + extraHours;
  const declared = turn.timeOps && Number.isFinite(Number(turn.timeOps.hoursPassed));
  const declaredHours = declared ? Number(turn.timeOps.hoursPassed) : null;
  // SNG-191 §1/§5: CHARACTER time is UNCAPPED — the 72h/168h clamp DIES here. A four-day journey costs
  // four character-days and narrates as four (acceptance §6.1). There is no shared unit to clamp
  // against any more: the world's own time is a separate real-time count, not days, so the fiction's
  // days and the world's count can never drift into a disagreement to paper over. A sane floor of a
  // quarter-hour stays so a beat still ticks; there is no ceiling.
  const hours = declared ? Math.max(0.25, declaredHours) : beatDefault;
  advanceClock(character.clock, hours);
  if (declared && hours >= 2) autoVerifyLeg("b8-time", `narrative time moved ${hours}h via timeOps`); // SNG-051 auto-verify
  // BATCH-12 §3c: the company you keep earns standing with their people, on the IN-GAME DAY. Erik's
  // Calvar case — a willing Radiant teacher travelling with him and zero Radiant standing, because
  // only a quest with a `people` effect ever wrote to it. The day is the clock (ROUND 2): per-scene
  // would reward a talky evening, per-session would reward real-world habit. "Calvar has been with
  // you eleven days" is a sentence; "nine scenes" is not.
  {
    const daysPassed = hours / 24;
    // FOCUSED (§3c) is DERIVED, never model-judged. Two of the spec's three triggers are available:
    //   · "use of their craft" — the tradition of the ability actually used this turn
    //   · "work at their behest" — a people this turn's standingOps names
    // The third, "travel in their country", is NOT derivable: a location carries `communityId` (a
    // settlement) and `regionId`, and NOTHING maps either to a people. `nativeLogic` is a paragraph
    // of GM prose, not an id — passing it here would have shipped a sentence as a tradition. That
    // link is SNG-166's lane (region derivation); when it lands, add it to this list and nowhere else.
    const usedAbility = resolution?.action?.abilityId || (resolution?.action?.comboAbilities || [])[0] || null;
    const craftPeople = usedAbility ? traditionOf(fullCatalog()[usedAbility], CONTENT.traditionIndex) : null;
    const focusedPeople = [...new Set([
      craftPeople,
      ...(turn.standingOps || []).map(o => o && o.people).filter(Boolean)
    ].filter(Boolean))];
    const drip = accrueStandingForDays(character, daysPassed, { rules: CONTENT.rules, focusedPeople, day: absoluteWorldDay() });
    for (const m of drip.moved) turn.narration = (turn.narration || "") + `\n\n*✦ The ${traditionLabel(m.people)} now count you ${m.to}.*`;
    if (drip.moved.length) autoVerifyLeg("b12-standing-drip", `standing with ${drip.moved[0].people} reached ${drip.moved[0].to} from company alone`);
  }
  // BATCH-12 §3d: STANDING OPS — an act that plainly helps or offends a people, without a quest.
  // Model reports, engine adjudicates (SNG-162). Clamped twice: ±3, and never across a band edge.
  if (turn.standingOps?.length) {
    const known = new Set(Object.keys(CONTENT.traditionIndex?.byId || {}));
    const so = applyStandingOps(character, turn.standingOps, {
      rules: CONTENT.rules, knownPeople: known.size ? known : null,
      day: absoluteWorldDay(), liaisonMult: liaisonFactions(character)
    });
    for (const a of so.applied) {
      turn.narration = (turn.narration || "") + `\n\n*✦ ${traditionLabel(a.people)}: ${a.delta > 0 ? "+" : ""}${a.delta} — ${a.why}${a.held ? " (held at the band's edge)" : ""}.*`;
    }
    if (so.refused.length) console.warn("[standing] ops refused:", character._standingOpRefusals);
    if (so.applied.length) autoVerifyLeg("b12-standing-ops", `a narrated act moved standing with ${so.applied[0].people}`);
  }
  // SNG-191 §4: capture DELEGATED commitments as state, so the world honours them while the player is
  // away (the tick advances the work, not the person's mood). A charge set against a real crisis is
  // what can push that crisis back — delegation is how a crisis gets solved offscreen.
  if (turn.delegateOps?.length) {
    if (!character.worldState) character.worldState = initWorldState(readClock(character.clock).day);
    let n = 0;
    for (const d of turn.delegateOps.slice(0, 6)) {
      if (!d?.npcId || !d?.charge) { logOpOutcome("delegateOps", "rejected-shape"); continue; }
      const npcName = character.npcRegistry?.[d.npcId]?.name || CONTENT.npcs?.[d.npcId]?.name || d.npcId;
      const targetEventId = d.targetEventId && CONTENT.events?.[d.targetEventId] ? d.targetEventId : null;
      const a = addAssignment(character.worldState, { npcId: d.npcId, npcName, charge: d.charge, targetEventId }, worldCount());
      if (a) { n++; logOpOutcome("delegateOps", "applied"); }
    }
    if (n) turn.narration = (turn.narration || "") + `\n\n*✦ The charge is set — the work goes on while you are away, and you'll hear how it fared when you return.*`;
  }
  // SNG-191 §7: the player closed a SURFACED latent arc — the third fate (handled), or it concluded
  // (resolved). Only a surfaced arc can be closed this way. The world stops carrying it as unfinished.
  if (turn.arcOps?.length && character.worldState?.latentArcs) {
    for (const o of turn.arcOps.slice(0, 4)) {
      const arc = o?.arcId && character.worldState.latentArcs[o.arcId];
      if (arc && setArcFate(arc, o.fate) && arc.fate === o.fate) logOpOutcome("arcOps", "applied");
      else logOpOutcome("arcOps", "rejected-shape");
    }
  }
  // SNG-193b §3.2: a story-earned change of school — a teacher's long training, a hard turning. Canon is
  // "changing is possible, hard, and a story," so it is a GM op the fiction fires, not a menu toggle.
  // setCharacterSchool refuses a school that isn't of that tradition, so a hallucinated id can't corrupt
  // the map. The band this craft resolves at moves with it, per §3.3.
  if (turn.adoptSchool?.tradition && turn.adoptSchool?.school) {
    const ok = setCharacterSchool(character, turn.adoptSchool.tradition, turn.adoptSchool.school, CONTENT.schools);
    logOpOutcome("adoptSchool", ok ? "applied" : "rejected-shape");
  }
  // SNG-194 §3: the unprompted OFFER — the GM introduced ONE thing the player was not reaching for, drawn
  // from something already true and NAMING what it came from (attribution is the whole difference from a
  // random-encounter table). Countable from day one (SNG-190 §3): the op is what lets us tell it is
  // working. `turnsSinceOffer` drives the RARE cooldown — reset to 0 here, incremented every other turn.
  const ws194 = character.worldState || (character.worldState = initWorldState(1));
  if (turn.offer && typeof turn.offer === "object" && turn.offer.thing && turn.offer.from) {
    ws194.turnsSinceOffer = 0;
    ws194.recentOffers = [...(ws194.recentOffers || []), { thing: smartClamp(String(turn.offer.thing), 140), from: smartClamp(String(turn.offer.from), 140) }].slice(-5);
    logOpOutcome("offer", "applied");
  } else {
    if (turn.offer) logOpOutcome("offer", "rejected-shape");
    ws194.turnsSinceOffer = (ws194.turnsSinceOffer ?? 0) + 1;
  }
  // SNG-056: THE HEADER FOLLOWS THE FICTION. When the GM narration moved the character to a real
  // place, update the AUTHORITATIVE currentLocationId so every location surface (header, map "you
  // are here", GM context) agrees with the prose — instead of the header showing a stale place.
  // SNG-329 — ⚠️ COERCE BEFORE ANYTHING WRITES IT DOWN. `turn.moveTo.location` may ITSELF be an object
  // (`{ location: { id, name } }`), and this handed that object onward untouched — where `String(ref)` turned
  // it into the literal text "[object Object]", minted it as a place, and SAVED it. Found in play by Erik on
  // the first real play-leg; three saves already carry the artefact.
  const moveRef = locationRefToString(turn.moveTo && (turn.moveTo.location || turn.moveTo.id || turn.moveTo));
  if (moveRef) {
    // SNG-117: the header follows the fiction even to a place with no record yet — resolve it, or MINT it
    // (a named-but-unrecorded destination like "the pass" becomes a real, travelable place). Never no-op
    // and leave the header asserting a place the fiction has left.
    // SNG-190 §1.3: a moveTo naming a KNOWN SUB-PLACE resolves to its PARENT LOCATION — you do not
    // leave Cairnhold to step into your mother's kitchen. Checked FIRST, and when it hits, the waygate
    // router is skipped entirely (§1.1: a local sub-place is not a gate transit). This alone prevents
    // the teleport: "Silas's Mother's House — Kitchen" is a sub-place of Cairnhold, so it now lands in
    // Cairnhold (where he already stood) instead of falling through resolve→routeGmMoveTo's hub branch.
    // (parentId is always a real location — places.js sets it to the location or a resolveLocationId id.)
    const subParent = findSubPlaceParent(character, moveRef);
    const subParentId = subParent && CONTENT.locations[subParent.parentId] ? subParent.parentId : null;
    // CCODE-10: a transit FROM A WAYGATE is routed by the gate network, not by name-matching. Without
    // this, "you step through the waygate" minted a place called "Waygate" and "you arrive at the
    // Center" minted one called "Center" — the GM-offer half of SNG-148's REACHABLE link was never
    // actually wired, so the fiction's transit fell through to mintTransitLocation. NOT consulted for a
    // known sub-place (§1.1) — a garden latch inside a gate-town is local movement, never a transit.
    const wgRoute = subParentId ? null : routeGmMoveTo({ character, moveRef, locations: CONTENT.locations, resolve: resolveLocationId });
    if (wgRoute) {
      const landed = CONTENT.locations[wgRoute.destId];
      if (wgRoute.routed === "hub" && landed) {
        // Say so plainly: the player aimed somewhere and the gate put them at the hub. That is
        // routing, never failure — but it must never be silent, or the world stops making sense.
        character._correctionAside = [character._correctionAside,
          `The gate set you down at ${landed.name} — the hub.`]
          .filter(Boolean).join(" ");
      }
    }
    let destId = subParentId || wgRoute?.destId || resolveLocationId(moveRef, CONTENT.locations) || mintTransitLocation(moveRef);
    if (destId && destId !== character.currentLocationId) {
      character.currentLocationId = destId;
      addKnownPlace(destId);
      noteGeneratedAttention(destId, "revisit", readClock(character.clock).day);
      notePlaceVisit(character, destId, readClock(character.clock).day, CONTENT.locations[destId]?.name);
      try { notePerception(character, destId, CONTENT.locations[destId], { visited: true, usedAbilityIds: [] }, CONTENT.rules); } catch { /* perception is a convenience */ }
      try { ensureLocationImage(destId); } catch { /* art never blocks a move */ }
    }
  }
  // SNG-122: NEVER STRAND THE PLAYER. If this turn was a travel intent but the beat produced no arrival
  // (the GM emitted no moveTo, or an unresolvable one), stash the intended destination so renderPlay offers
  // a one-tap "arrive" (the map's own travelTo path). If the move DID land them there, clear it. Any
  // non-travel turn also clears a stale pending arrival — the affordance is tied to the travel beat.
  const ti = travelIntentOf(resolution?.action);
  if (ti) {
    const arrived = (ti.destId && character.currentLocationId === ti.destId) || (!ti.destId && !!moveRef);
    character._pendingArrival = arrived ? null : { ref: ti.ref, name: ti.name, destId: ti.destId || null };
  } else {
    character._pendingArrival = null;
  }
  // SNG-070: the game self-heals — apply any bounded GM corrections to THIS save (repair, not wish;
  // every change validated + logged). Surface what changed so the player can see + trust it.
  if (turn.stateOps?.length) {
    const r = applyStateOps(character, turn.stateOps, {
      backgrounds: CONTENT.backgrounds || [], traditionIndex: CONTENT.traditionIndex, locations: CONTENT.locations,
      resolveLocationId, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString(),
      // SNG-207 §4: the fiction's own record for the grant/register trace-check — this turn's GM narration
      // (the durable established-facts + chronicle are read straight off the character inside applyStateOps).
      items: CONTENT.items || {}, traceText: String(turn.narration || "")
    });
    if (r.applied.length) character._correctionAside = "Set right: " + r.applied.map(describeCorrection).join("; ") + ".";
  }
  // SNG-088B: the GM may OPEN the gambit builder with a proposed plan instead of running it as one
  // action. Validate + stash; renderPlay opens the builder pre-filled (the player edits + commits).
  // SNG-091: the player's REQUEST is unconditional — never gate on aptness, and never silently drop
  // it when a stale draft lingers (a dropped request looks exactly like the GM ignoring you). We stash
  // the proposal regardless; renderPlay replaces any leftover draft with the freshly-asked-for plan.
  if (turn.gambitOps) {
    const go = turn.gambitOps;
    const maxSteps = CONTENT.rules.gambit?.maxSteps ?? 5;
    const steps = (Array.isArray(go.steps) ? go.steps : [])
      .map(s => ({ text: String(s?.text ?? s ?? "").slice(0, 300), fallback: String(s?.fallback ?? "").slice(0, 300) }))
      .filter(s => s.text).slice(0, maxSteps);
    const goal = String(go.goal ?? "").slice(0, 300);
    if (goal && steps.length) pendingGambitProposal = { goal, steps };
  }
  // scene anchor: the GM's updated scene state, clamped — or keep the previous one
  sceneState = sanitizeScene(turn.scene) || sceneState;
  // SNG-075: the valley is alive in narrative play too — maybe turn something up (woven next turn)
  maybeNarrativeEncounter(turn, resolution);
  // SNG-080: the world must PUSH — if nothing has happened for a while, make it happen (woven next turn)
  maybeWorldPressure(turn, resolution);
  if (gambitHintCooldown > 0) gambitHintCooldown--; // SNG-077: tick down the gambit-hint quiet period
  // SNG-190 §5 / SNG-189 §1: sceneSummary becomes the ONLY durable record of a scene, but the model
  // sometimes returns an OBJECT that still parses — pushed raw into the chronicle (below) it rendered
  // "[object Object]" into the permanent record and a scene of the story was lost, unrecoverable.
  // Coerce ONCE here, before any durable use: a string stands; an object yields its own text field if
  // it has one; else it falls back to the narration clamp (gm.js's own fallback for a MISSING summary).
  // Reassigned so every downstream read (party beat, sceneTurns, gallery caption) gets the clean string.
  turn.sceneSummary = coerceSceneSummary(turn.sceneSummary, turn.narration);
  // party: publish this beat to the shared scene (fire-and-forget)
  if (sharedScene && turn.sceneSummary) publishPartyBeat(resolution?.action?.label || "acted", resolution?.degree ?? null, turn.sceneSummary);
  // chronicle + scene persistence
  if (turn.sceneSummary) {
    sceneTurns.push({ player: playerWords || null, summary: turn.sceneSummary, narration: turn.narration || "" }); // SNG-081: keep the player's half
    if (sceneTurns.length > SCENE_TURN_CAP) sceneTurns = sceneTurns.slice(-SCENE_TURN_CAP); // CCODE-02: bounded storage
    // SNG-266/1d: the count of beats this scene has ACTUALLY run, which `sceneTurns.length` stops telling us
    // the moment the storage cap bites. Kept on the scene record itself so it dies with the scene — every
    // path that ends one already nulls `activeScene`, and a counter needing six manual resets would
    // eventually miss one and leave a scene permanently "long".
    sceneBeats = (character.activeScene?.beats || 0) + 1;
    if (turn.sceneEnded) { character.chronicle.push(turn.sceneSummary); sceneTurns = []; sceneState = null; character._intentAsked = null; } // SNG-145: a new scene may ask again
  }
  // THE HARD CLOSE (SNG-266/1d). The soft rung ASKS the GM to close; this rung does not ask. A scene that
  // runs forever is not a long scene — it is a scene with no chronicle entry, no per-scene XP boundary, and
  // no memory of its own beginning once the storage cap trims the front off it.
  // ⛔ NEVER MID-ACTION: an open encounter is a hanging question, and cutting a scene there would strand
  // the player mid-swing. In that case the pressure simply persists into the next beat.
  const hardClose = CONTENT.rules?.scene?.hardCloseBeats ?? 14;
  if (!turn.sceneEnded && sceneBeats >= hardClose && !activeEnc() && turn.sceneSummary) {
    turn.sceneEnded = true;
    character.chronicle.push(turn.sceneSummary);
    sceneTurns = []; sceneState = null; character._intentAsked = null;
    turn._engineClosedScene = sceneBeats;
  }
  character.activeScene = turn.sceneEnded ? null : { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: turn, sceneState, beats: sceneBeats };
  saveCharacter(character); saveProfile(profile);

  // shared-world consequences (best-effort, never blocks play)
  if (syncEnabled()) {
    const events = (turn.ledgerEvents || []).map(e => ({
      schemaVersion: 1, at: new Date().toISOString(), worldDay: absoluteWorldDay(), who: character.id, playerKey: profile.playerKey,
      where: location.id, what: String(e.what || "").slice(0, 200), tags: e.tags || [],
      spectrumDeltas: e.spectrumDeltas || {}, visibility: e.visibility || "witnessed",
      impactsLocal: !!e.impactsLocal // SNG-041: crosses the far-world/local boundary to whoever it affects
    }));
    // SNG-145 trigger 3 (irreversible): an impactsLocal event reaches ANOTHER player's area — it
    // waits in escrow for this player's confirm. Narration stands; only propagation is gated.
    // Lenient by construction: unanswered means it never propagates (nothing is imposed by inaction).
    const { pass, hold } = splitLedgerEvents(events);
    if (hold.length) { character._pendingLedger = [...(character._pendingLedger || []), ...hold].slice(-4); saveCharacter(character); }
    if (pass.length) appendLedger(pass, character.id).catch(err => console.warn("[ledger]", err.message));
    backupSaves(character, profile);
  }
  _applyPhase = "done"; // reached the end cleanly — a throw between the last labelled group and here reads "done"
}

/** SNG-013: the current location's flat + vector modifier for an action, plus its
 *  player-facing receipt strings. Perceived-axis detail respects SNG-011 vectorsKnown. */
function affinityFor(action, location = hereNow()) {
  const vectorsKnown = character.placeMemory?.[location?.id]?.vectorsKnown || [];
  return locationAffinity(location, action, CONTENT.locationAffinities, { vectorsKnown });
}

/** SNG-090: the substrate verdict for an ABILITY action at a place. null for weapon/attribute actions
 *  (substrate-free, SNG-089) or when the model/density isn't loaded. Uses the primary ability's
 *  tradition, the location's density, and what the character carries. */
function substrateForAction(choice, location) {
  if (!CONTENT.substrateModel) return null;
  const abId = choice.abilityId || (choice.comboAbilities || [])[0];
  if (!abId) return null;
  const ab = fullCatalog()[abId];
  const tradition = ab ? (abilityTradition(ab) || ab.powerSystem) : null;
  if (!tradition) return null;
  const density = locationDensity(location, CONTENT.substrateModel);
  if (density == null) return null;
  const comps = activeCompanions(character, CONTENT.companions);
  const carried = carriedSubstrate(character, CONTENT.items, comps);
  // SNG-193b §3.3: the band reads the character's SCHOOL for this tradition (its extension source), not
  // the tradition — two practitioners of one tradition get opposite best-grounds. Floored by the material
  // root. Un-schooled saves fall back to the pure/root school silently (schoolForTradition), so no shift.
  const school = schoolForTradition(character, tradition, CONTENT.schools);
  const root = CONTENT.schools?.traditionSchools?.[tradition]?.root || null;
  const verdict = substrateVerdict({ tradition, school, root, density, carried, data: CONTENT.substrateModel });
  // §9b invariant 5: when something CARRIED is why the ground reads differently, the receipt must
  // say which thing. A ward that quietly halves your craft — or a staff that quietly saves it — is
  // the "cruellest possible bug" the SNG-090 round-2 note names. Attribution rides the verdict.
  if (carried !== 0) verdict.carriedBy = carriedSubstrateSources(character, CONTENT.items, comps);
  verdict.carried = carried;
  return verdict;
}

/** SNG-116: THE single source of truth for an action's substrate CHANCE penalty — the exact number the
 *  resolve path applies (`substrateForAction(...).chancePenalty`). Every "how hard" preview MUST pass this
 *  into successChance; omitting it made the readout assume a full lattice and lie on thin ground. Preview
 *  and resolve both derive the penalty here, so they can never disagree. */
function substratePenaltyFor(choice, location) {
  const usesAbility = !!(choice.abilityId || (choice.comboAbilities || []).length);
  return usesAbility ? (substrateForAction(choice, location)?.chancePenalty || 0) : 0;
}

/** SNG-149 / CCODE-89 — draw both axes for a Coliseum bout, or null when this is not one.
 *
 *  Gated on the LOCATION rather than on a name match, so a bout is a bout because of where it is fought.
 *  Returns null everywhere else, which is why adding this changes nothing about any other encounter. */
/** The champion's biography seed — an opponent with no authored history draws a short second axis, which
 *  is a true thing about a stranger rather than a gap to pad. */
function oppSheetName(enc) { return character.customEncounters?.[enc?.defId]?.opponent?.name || "a champion"; }

function coliseumBoutFor(def, oppSheet) {
  const grid = CONTENT?.rules?.coliseumGrid;
  if (!grid?.cells?.length) return null;
  if (def?.locationId !== (grid.locationId || "the_great_coliseum")) return null;
  try {
    const cat = fullCatalog();
    const yours = drawAxis(character, { catalog: cat, index: FN_INDEX, rng: Math.random });
    // The opponent draws from the crafts their SHEET actually carries, so a champion's columns are their
    // real practice too — not a table roll dressed as one.
    const theirAbilities = (oppSheet?.skills || []).map((s, n) => ({ abilityId: `opp-${n}`, level: s.tier || 1 }));
    const theirCat = {};
    (oppSheet?.skills || []).forEach((s, n) => { theirCat[`opp-${n}`] = { functions: [s.function].filter(Boolean) }; });
    const theirs = drawAxis({ abilities: theirAbilities }, { catalog: theirCat, index: FN_INDEX, rng: Math.random });
    return { yours, theirs, picked: null };
  } catch { return null; }   // a bout that cannot draw its grid is still a fight; it is never a crash
}

/** SNG-149 / CCODE-89b — THE BLIND PICK, resolved. The champion's pick is computed from your AXIS and never
 *  from your choice, so it is genuinely blind: both are decided from the same information and revealed
 *  together. Computing it AFTER yours would be a simultaneous pick in name only. */
function commitColiseumPick(family) {
  const enc = character.activeEncounter, bout = enc?.coliseum;
  if (!bout || bout.picked) return;
  const grid = CONTENT?.rules?.coliseumGrid;
  const stance = (CONTENT?.rules?.coliseumGrid?.stances || {})[enc.defId] || "probing";
  const theirs = championPick(bout.yours, { stance, rng: Math.random });
  const r = resolvePick({ axisA: bout.yours, axisB: bout.theirs, pickA: family, pickB: theirs?.family, grid });
  if (!r.ok) { renderPlay(character.activeScene?.lastTurn || null, { aside: r.why }); return; }
  // SNG-149/CCODE-89d — THE SECOND GRID (Erik: "just Stile's challenges in the Blue Adept books"). In the
  // Game the first grid picks the CATEGORY and a second 4x4 inside it picks the actual contest. When a cell
  // carries its inner grid, the bout narrows again the same blind way — this time from BIOGRAPHY. Cells that
  // carry no inner grid simply resolve at the category, so this is inert until the inner cells are authored.
  const inner = r.cell.second || r.cell.secondCells || null;
  if (inner) {
    bout.second = {
      yours: drawBackgroundAxis(character, { rng: Math.random }),
      theirs: drawBackgroundAxis(enc.oppBio || { origin: oppSheetName(enc) }, { rng: Math.random }),
      cells: inner, picked: null,
    };
  }
  bout.picked = { yours: family, theirs: theirs.family, cell: r.cell, seats: r.seats, matchup: r.matchup,
    yourRead: readOfPick(family, bout.theirs), theirRead: theirs.why };
  saveCharacter(character);
  // The cell is the CONTEST, so the narrator is told what was chosen and what it means — not asked to invent it.
  runGM({ resolution: null, playerInput: `(THE BLIND GRID IS REVEALED. You named ${family} from their four — ${bout.picked.yourRead?.says || "your argument about them"}. They named ${theirs.family} from yours — ${theirs.why}. The two picks COMBINE into ONE contest — "${r.cell.name}": ${r.cell.contest} You are in the ${r.seats.a} seat; they are in the ${r.seats.b} seat. Judged: ${r.cell.judged || "on the bell."} Narrate the reveal and the crowd, then the opening of THIS contest — not a generic bout, and NOT two separate fights.)` })
    .then(result => { if (result) renderPlay(result.turn, { degraded: result.degraded }); });
}

/** The strip a Coliseum bout renders above the contest panel: both axes, and your four choices from THEIRS. */
function coliseumStrip() {
  const bout = character.activeEncounter?.coliseum;
  if (!bout) return "";
  const col = s => `<span class="col-fam" title="${s.from === "practice" ? `drawn from what they practise (weight ${s.weight})` : "the WILD column — drawn from all eight, including families never trained"}">${esc(s.family)}${s.from === "practice" ? "" : " ✦"}</span>`;
  if (bout.picked) {
    const p = bout.picked;
    return `<div class="enc-frame col-strip"><div class="col-cell"><strong>${esc(p.cell.name)}</strong> — ${esc(p.cell.contest)}</div>` +
      `<div class="col-read">You named <b>${esc(p.yours)}</b> — ${esc(p.yourRead?.says || "")}. They named <b>${esc(p.theirs)}</b> — ${esc(p.theirRead || "")}.</div>` +
      `<div class="col-ground">Your two picks COMBINE into this one contest — you take the <b>${esc(p.seats?.a || "")}</b> seat, they take <b>${esc(p.seats?.b || "")}</b>. Neither of you chose your own seat.${p.matchup?.judged ? ` <span class="col-judged">${esc(p.matchup.judged)}</span>` : ""}</div></div>`;
  }
  return `<div class="enc-frame col-strip">` +
    `<div class="col-axis">THEIR four: ${bout.theirs.map(col).join(" · ")}</div>` +
    `<div class="col-axis">YOUR four: ${bout.yours.map(col).join(" · ")}</div>` +
    `<div class="col-ask">Name which of THEIR four you will take them on at. They are naming one of yours at the same moment — blind, both revealed together.</div>` +
    `<div class="col-picks">${bout.theirs.map(s => `<button class="btn secondary col-pick" data-colpick="${esc(s.family)}" title="${s.from === "practice" ? "One of the things they actually practise — you are claiming you can beat them at it." : "Their WILD column — a family they may never have trained. You are saying they are hollow outside their specialty."}">${esc(s.family)}</button>`).join("")}</div></div>`;
}

async function onChoice(choice) {
  if (busy) return;
  // SNG-145: while an intent gate stands, the gate IS the choice — answer it first.
  if (character._pendingIntent) { renderPlay(character.activeScene?.lastTurn || null, { aside: "Answer the moment of intent first — it's waiting on you." }); return; }
  lastPlayerAction = choice?.label || choice?.exactWords || null; // SNG-066: for feedback forensics
  // SNG-230 §6a (behavior): FLEE a fight → enter a CHASE (not a teleport — the chase IS the break-away, with its
  // own frame/stages/freefield); a caught chained chase (abandon) → drop back into the FIGHT. Intercepted BEFORE
  // the roll: the transition IS the resolution, GM-narrated. Only the classic (non-skill-battle) duel routes flee
  // through here; the skill-battle fight's own #sb-flee button calls beginChaseFromFight directly.
  { const encT = activeEnc();
    // SNG-247 Tier 2b: gate on KIND, not on `type` — a chase is now a duel too, so a bare `type === "duel"` test
    // would turn fleeing a CHASE into a chase-of-a-chase. A chained chase given up on (or abandoned, for a legacy
    // staged chase still in a save) is CAUGHT: drop back into the fight it came from.
    const kindT = encT ? encounterKind(encT.def) : null;
    if (kindT === "fight" && choice.encounterAction === "flee") { await beginChaseFromFight(encT.def); return; }
    if (kindT === "chase" && encT.def._chainedFrom?.kind === "fight"
        && ["flee", "yield", "abandon"].includes(choice.encounterAction)) { await beginFightFromChase(encT.def); return; } }
  let itemsAdvanced = [];
  const location = hereNow();
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);

  // ability gating + energy (combos draw from every ability involved; practiced
  // power costs less — effectiveEnergyCost scales with level and rank)
  let abilityLevel = 0, energyCost = choice.energyCost;
  if (choice.abilityId) {
    const owned = character.abilities.find(a => a.abilityId === choice.abilityId);
    if (!owned) { choice.abilityId = null; }
    else {
      abilityLevel = owned.level;
      energyCost = energyCost ?? effectiveEnergyCost(fullCatalog()[choice.abilityId], character, CONTENT.rules);
    }
  }
  if ((choice.comboAbilities || []).length > 1) {
    energyCost = choice.comboAbilities.reduce((sum, id) => sum + effectiveEnergyCost(fullCatalog()[id], character, CONTENT.rules), 0);
    abilityLevel = Math.min(...choice.comboAbilities.map(id => character.abilities.find(a => a.abilityId === id)?.level ?? 1));
  }
  // SNG-015 variable power: only ability/combo uses scale. Player may set choice.intensity
  // via the tune dial; otherwise AUTO picks the minimum intensity the task needs (never surge).
  const usesAbility = !!(choice.abilityId || (choice.comboAbilities || []).length);
  let intensity = "standard";
  if (usesAbility) {
    intensity = INTENSITIES.includes(choice.intensity) ? choice.intensity : null;
    if (!intensity) {
      const pAction = { label: choice.label, attribute: choice.attribute || "practical", subAttribute: SUBS.includes(choice.subAttribute) ? choice.subAttribute : null, axes: choice.axes || {}, difficulty: choice.difficulty || 0, tags: choice.intentTags || [], abilityLevel };
      const pe = equipmentBonus(character, pAction.tags, CONTENT.rules).bonus + companionBonus(activeCompanions(character, CONTENT.companions), pAction.tags, CONTENT.rules, character).bonus + affinityFor(pAction, location).bonus;
      const stdChance = successChance({ character, action: pAction, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: pe, substratePenalty: substratePenaltyFor(choice, location) }); // SNG-116: AUTO-intensity must see the real (substrate-inclusive) chance
      intensity = autoIntensity(stdChance, CONTENT.intensity);
    }
    if (energyCost != null) energyCost = scaledEnergy(energyCost, intensity, CONTENT.intensity);
    // SNG-273 — THE WORLD IS ON THE BILL. Erik: "a player should never have to visit a tab to learn why
    // something got harder", so the arc's name rides the cost at the moment it is paid. `crossDomain` is the
    // flag the poles-pull effect keys on — the world pulling apart makes BORROWING from another people
    // harder, which is exactly one boolean the engine already computes.
    if (energyCost != null) {
      const abilityDef = choice.abilityId ? fullCatalog()[choice.abilityId] : null;
      const note = craftCostNote(energyCost, arcEffectsNow(), {
        tradition: abilityDef?.powerSystem || null,
        crossDomain: abilityDef ? isCrossClass(abilityDef, character) : false,
      });
      if (note) { energyCost = note.adjusted; pendingArcCostNote = note; }
      else pendingArcCostNote = null;
    }
  }
  if (energyCost && character.energy < energyCost) { alert("Not enough energy — rest first."); return; }
  // SNG-090: the substrate — can this CRAFT run here? A weapon/attribute action is unaffected. At the
  // extreme (the lattice is nearly gone for a high-dependency craft), the ability won't answer at all —
  // a hard, explained gate (steel and wit still work; carry charge or find denser ground).
  const substrate = usesAbility ? substrateForAction(choice, location) : null;
  if (substrate?.off) {
    const abName = fullCatalog()[choice.abilityId || (choice.comboAbilities || [])[0]]?.name || "your craft";
    renderPlay(character.activeScene?.lastTurn || null, { aside: `The lattice is too thin here — ${abName} barely stirs (${substrate.percent}% of its strength) and won't answer. Carry charge, or reach denser ground; steel and wit still work.` });
    return;
  }
  const action = {
    label: choice.label, attribute: choice.attribute || "practical",
    subAttribute: SUBS.includes(choice.subAttribute) ? choice.subAttribute : null,
    axes: choice.axes || {}, difficulty: choice.difficulty || 0, intentTags: choice.intentTags || [], abilityLevel,
    tags: choice.intentTags || [], planned: (choice.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)),
    novel: !!choice.novel, abilityId: choice.abilityId || null, comboAbilities: choice.comboAbilities || [], noveltyHint: choice.noveltyHint || "", // CCODE-23: carry the primary abilityId — recordAspirationProgress reads action.abilityId; without it a SOLO same-tradition cast never fed an aspiration (only combos did)
    // SNG-140: a wild_current craft carries the tangled current's variance — the resolver widens both crit bands
    wildVariance: [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean).some(id => { const ab = fullCatalog()[id]; return !!(ab?.wildVariance || ab?.powerSystem === "wild_current"); }),
    // CCODE-76: every craft in this cast that authored what ITS critical looks like. critProfile takes the
    // strongest contributor per side (never the sum), and the receipt carries the sentence.
    craftCrit: [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean)
      .map(id => { const ab = fullCatalog()[id]; const c = critFor(ab, { cfg: CONTENT.craftMechanics, cap: CONTENT.rules?.crit?.perCraftCap });
                   return c ? { name: ab?.name || id, ...c } : null; }).filter(Boolean),
    travelTo: choice.travelTo || null, exactWords: choice.exactWords || null // SNG-122: travel destination + literal words for travel-intent detection
  };
  // accepting ripe emergence (GM-offered choice carrying an engine-verified emergenceId)
  if (choice.emergenceId) {
    const tpl = validEmergenceId(character, CONTENT.emergence, CONTENT.rules, choice.emergenceId);
    if (tpl) {
      let minted = null;
      if (tpl.tier === "combo") {
        const nn = prompt(`Name your new technique (or leave as "${tpl.name}"):`, tpl.name);
        minted = acceptCombo(character, tpl, (nn || tpl.name).slice(0, 60), readClock(character.clock).day);
      } else {
        minted = acceptBranch(character, tpl);
      }
      saveCharacter(character);
      if (minted) {
        renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, playerWords: choice.playerWords || null } });
        const result = await runGM({ resolution: null, playerInput: `(Practice has ripened into breakthrough: the character accepts "${minted.name}" — ${tpl.tier === "combo" ? tpl.discoveredBlurb || tpl.description : tpl.grants}. Narrate the moment it clicks into something repeatable, then continue the scene.)` });
        if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, playerWords: choice.playerWords || null }, degraded: result.degraded });
        return;
      }
    }
  }
  // starting an encounter (GM-offered choice carrying a real encounterId)
  if (choice.encounterId && (CONTENT.encounters?.[choice.encounterId] || character.customEncounters?.[choice.encounterId]) && !character.activeEncounter) {
    const def = CONTENT.encounters?.[choice.encounterId] || character.customEncounters[choice.encounterId];
    // SNG-098 C: a duel runs as a two-sided SKILL BATTLE (the contest panel) when the engine is loaded and
    // the def doesn't opt out; the classic single-margins duel stays the fallback (skillBattle:false).
    const oppSheet = contestSheetFor(def);   // SNG-247: one place decides the other side (duel -> foe, puzzle -> static)
    const isSB = !!oppSheet;
    character.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
    // SNG-149 / CCODE-89 — A COLISEUM BOUT IS FOUGHT ON THE BLIND GRID. Aevi authored the whole design and it
    // sat as a rules file nothing read, with these three champion encounters already written against it.
    // Both axes are drawn HERE, at the moment the bout opens, because the draw is part of the fiction: the
    // columns are what each fighter is known to practise, and the crowd sees them before either picks.
    const bout = coliseumBoutFor(def, oppSheet);
    if (bout) character.activeEncounter.coliseum = bout;
    try { noteBeastImage(def); } catch { /* CCODE-31: a beast portrait is a grace, never a blocker */ }
    saveCharacter(character);
    renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, playerWords: choice.playerWords || null } });
    const result = await runGM({ resolution: null, playerInput: `(The encounter "${def.name}" begins: ${def.setup} Narrate the opening${isSB ? " of the contest (the mechanics play out in a panel — just set the scene and the stakes)" : " and offer round choices"}.)` });
    if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, playerWords: choice.playerWords || null }, degraded: result.degraded });
    if (isSB) renderSkillBattle(); // take over the rounds with the contest panel
    return;
  }
  // SNG-231 §3: the GM offered a POOL encounter (an id that isn't a pre-built def — a random-pool or bestiary
  // entry surfaced by listAvailableEncounters). Route it through the normal FIRE path (buildOffer → the
  // engage/decline offer beat, SNG-002b) so the rich pool is reachable through GM invites, decline path intact.
  if (choice.encounterId && !character.activeEncounter && !(CONTENT.encounters?.[choice.encounterId] || character.customEncounters?.[choice.encounterId])) {
    const entry = (encounterTable()?.encounters || []).find(e => e.id === choice.encounterId);
    if (entry) { await fireEncounter(entry); return; }
  }
  // trivial actions — no real chance of failure, no cost: no dice, no energy
  if (choice.trivial && !choice.abilityId && !(choice.comboAbilities || []).length && !action.novel) {
    const resolution = { action, degree: "auto", roll: null, chance: null };
    renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, playerWords: choice.playerWords || null } });
    const result = await runGM({ resolution, playerInput: null, exactWords: choice.exactWords || null });
    if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, playerWords: choice.playerWords || null }, degraded: result.degraded });
    return;
  }
  // a technique already discovered isn't novel anymore — it's earned skill
  const abilityIds = [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean);
  const disc = action.novel ? knownDiscovery(character, abilityIds, action.noveltyHint) : null;
  if (disc) { action.novel = false; action.discoveryBonus = CONTENT.rules.novel?.discoveryBonus ?? 10; }
  // SNG-145: INTENT GATES fire HERE — before the dice roll, before energy is spent, before the GM
  // is called — so a decline commits nothing and the moveTo always-emit contract is never touched.
  // The resume is the CHOICE itself (plain JSON): the answer annotates it and re-enters onChoice.
  if (!choice.intentRung && !choice.departureConfirmed) {
    const askedKey = activeEnc() ? `enc:${activeEnc().defId}` : `scene:${character.currentLocationId}`;
    // CCODE-01: the rung is per-RANK (147c moved it into ab.tree[]) — gate on what this character
    // can actually do at the rank they hold, not on the ability's lifetime ceiling.
    const ownedLevels = Object.fromEntries((character.abilities || []).map(a => [a.abilityId, a.level]));
    const harmGate = harmGateFor(abilityIds, fullCatalog(), askedKey, character._intentAsked, ownedLevels);
    const depGate = harmGate ? null : departureGateFor(travelIntentOf(action), character, CONTENT.locations);
    const gate = harmGate || depGate;
    if (gate) {
      character._pendingIntent = { ...gate, resume: { choice } };
      saveCharacter(character); // reload-safe: the card reappears; nothing has committed
      renderPlay(character.activeScene?.lastTurn || null, {});
      return;
    }
  }
  if (choice.intentRung) action.intentRung = choice.intentRung; // the harm answer, carried back through the resume (dedupe marked in answerIntent)
  // SNG-246 FIX A — ENGINE-ENFORCED FIGHT ENTRY. A committed killing blow must not resolve as a single prose roll;
  // that was the root of "one action ended it in pure prose." The ENGINE escalates it, not the GM's memory of
  // rule 18. Erik's ruling: resolve the TARGET the player actually chose (c), and fall back to a hard directive
  // (b) when none resolves — inventing an opponent is worse than asking the GM to frame the one it just narrated.
  // CCODE-54 (Erik: "I used hunter's strike to kill veln... but it didn't launch me into a duel or fight — it just
  // killed him when i succeeded in the roll"). The guard was `!activeEnc()` — no encounter at all. He was working
  // the SEALED DOOR at the time, so an encounter WAS active, the whole fight-entry hook was skipped, and the
  // killing blow fell through to one prose roll. That is the exact failure SNG-246 A exists to prevent, reached
  // by a door standing in the way of it.
  //
  // The question was never "is anything active" but "am I already fighting THIS person". Attacking someone while
  // you are working a puzzle is a NEW fight, and the puzzle is what gives way.
  if (choice.intentRung) {
    const encNow = activeEnc();
    const tgt = harmTargetFor({ ...action, label: choice.label, exactWords: choice.exactWords }, { npcRegistry: character.npcRegistry || {} });
    const alreadyFightingThem = !!encNow && encounterKind(encNow.def) === "fight"
      && (!tgt || (encNow.def.opponent?.name || "").toLowerCase().includes(String(tgt.name || "").toLowerCase()));
    if (!alreadyFightingThem) {
      if (tgt) {
        // Leaving a bounded thing mid-way to turn on someone: the puzzle or hazard gives way to the fight.
        // Cleared plainly rather than annotated for the GM — a `pending*` nobody reads is the inert class this
        // session keeps closing, and the fix does not need the nicety to be correct.
        if (encNow) character.activeEncounter = null;
        escalateToFight(tgt, choice); return;
      }
      pendingFightFraming = { rung: choice.intentRung, what: choice.label || "a killing blow" }; // (b) fallback
    }
  }
  const encD = activeEnc();
  if (encD) {
    const encDiff = encounterDifficulty(encD.state, encD.def, CONTENT.rules, { flee: choice.encounterAction === "flee" });
    action.difficulty = (action.difficulty || 0) + encDiff;
    // SNG-106: name the opposed term so the roll breakdown reads "the raider (threat N) −11", not anonymous.
    if (encDiff) action.difficultySource = `${encD.def.name || "the opposition"}${encD.def.opponent?.threat ? ` (threat ${encD.def.opponent.threat})` : ""}`;
  }
  const equip = equipmentBonus(character, action.intentTags, CONTENT.rules);
  const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.intentTags, CONTENT.rules, character);
  const aff = affinityFor(action, location);
  const iMod = usesAbility ? effectMod(intensity, CONTENT.intensity) : 0;
  const resolution = resolveAction({ character, action, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus + iMod, substratePenalty: substrate?.chancePenalty || 0 });
  // SNG-169 §2c: keep the ITEM helpers separately. `equipHelpers` mixes items and companions, and
  // the roll receipt makes item names tappable — a companion name looked up as an item would
  // silently do nothing. Both lists are kept: equipHelpers stays for the bond-growth check above.
  if (equip.bonus + comp.bonus > 0) { resolution.equipHelpers = [...equip.helpers, ...comp.helpers]; resolution.itemHelpers = [...equip.helpers]; }
  if (aff.bonus !== 0) resolution.locationAffinity = affinityReceipt(aff);
  if (usesAbility) { resolution.intensity = intensity; resolution.energySpent = energyCost; }
  // SNG-090: surface the substrate when it bit (starved/crowded) — a receipt line + a note the GM
  // narrates so the fiction matches ("the lattice is thin here; your craft runs at a fraction").
  if (substrate && substrate.side !== "full" && substrate.side !== "neutral") {
    resolution.substrate = { percent: substrate.percent, side: substrate.side, carriedBy: substrate.carriedBy || null };
    pendingSubstrateNote = substrate.side === "starved"
      ? `The lattice is THIN here — the character's craft is running at ~${substrate.percent}% (starved of substrate). Let the effort show the strain; a weapon or mundane means is unaffected.`
      : `The lattice is DENSE and CROWDS the character's craft here — it runs at ~${substrate.percent}% (too much signal is noise). Let it read as interference, not weakness.`;
  }
  if (disc) resolution.usedDiscovery = disc.name;
  if (choice.intentNote) resolution.intentNote = choice.intentNote; // SNG-145: the confirmed intent rides to the GM as a directive
  // novel use: breakthrough or backlash — the engine decides, the GM narrates
  if (action.novel) {
    if (resolution.degree === "crit_success") {
      resolution.discoveryEligible = true;
      resolution.discoveryAbilities = abilityIds;
    } else if (resolution.degree === "crit_failure") {
      resolution.backlash = applyBacklash(character, CONTENT.rules);
    }
  }
  // SNG-015: a Surge that slips can bite — pay by the ability's Tier
  if (usesAbility && intensity === "surge" && shouldBacklash("surge", resolution.degree, CONTENT.intensity, Math.random)) {
    const surgedAb = fullCatalog()[choice.abilityId] || fullCatalog()[(choice.comboAbilities || [])[0]];
    resolution.backlash = applySurgeBacklash(character, surgedAb, CONTENT.intensity);
    resolution.surgeBacklash = true;
  }
  character.energy = applyEnergyCost(character, (choice.abilityId || (choice.comboAbilities || []).length > 1) ? energyCost : undefined, CONTENT.rules);
  // SNG-010: practice ledger — the single counting site
  {
    const usedIds = [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean);
    if (usedIds.length) { recordUse(character, usedIds, { day: absoluteWorldDay() }); pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex })); }
    // SNG-010C: a cast channeled with a bond-source companion present wakes evolving gear
    itemsAdvanced = noteCoUseAndRefresh(character, { usedAbilityIds: usedIds, activeCompanionIds: activeCompanions(character, CONTENT.companions).map(c => c.id), catalog: CONTENT.items });
    if (usedIds.length) notePerception(character, character.currentLocationId, hereNow(), { visited: true, usedAbilityIds: usedIds }, CONTENT.rules);
    recordAspirationProgress(character, action, fullCatalog());
    // SNG-011: precursor peril — using these changes you (extra alignment drift along the ability's axes)
    for (const id of usedIds) {
      const ab = fullCatalog()[id];
      if (ab?.powerSystem === "precursor") {
        const drift = CONTENT.rules.precursor?.perilDrift ?? 0.05;
        const band = CONTENT.rules.precursor?.bandNotice ?? 0.4;
        character.precursorAxes = character.precursorAxes || [];
        for (const [ax, v] of Object.entries(ab.axes || {})) {
          const cur = character.alignment[ax] || 0;
          character.alignment[ax] = Math.max(-1, Math.min(1, cur + Math.sign(v) * drift));
          if (Math.abs(character.alignment[ax]) >= band && !character.precursorAxes.includes(ax)) character.precursorAxes.push(ax);
        }
      }
    }
  }
  // meditation: engine-owned recovery, scaled by attunement — the centered refill faster
  if ((action.intentTags || []).includes("meditate") && ["crit_success", "success", "partial"].includes(resolution.degree)) {
    const rec = CONTENT.rules.recovery || {};
    let gain = (rec.meditationBase ?? 10) + (rec.meditationPerAttunement ?? 2) * (character.attunement || 0);
    if (resolution.degree === "partial") gain = Math.ceil(gain / 2);
    character.energy = Math.min(character.maxEnergy, character.energy + gain);
    resolution.meditation = { energy: gain };
  }

  // active encounter: map the receipt onto encounter state (engine-owned)
  // SNG-246 BUG1: a SKILL BATTLE is driven by sbDeclare (momentum/opponent-sheet state), NEVER duelRound (which
  // reads opponentHealth and would corrupt it — the two resolvers aren't interchangeable). Its inputs come from
  // the skill-battle panel (sbDeclare direct) + the onFreeform intercept below; this block is the CLASSIC path.
  const enc = activeEnc();
  if (enc && enc.state?.mode !== "skill_battle") {
    const opts = { flee: choice.encounterAction === "flee", yield: choice.encounterAction === "yield", abandon: choice.encounterAction === "abandon", walkAway: choice.encounterAction === "walkAway" };
    let rr = null;
    if (enc.def.type === "duel") rr = duelRound(enc.state, enc.def, resolution, CONTENT.rules, opts);
    else if (enc.def.type === "challenge") rr = challengeStage(enc.state, enc.def, resolution, CONTENT.rules, opts);
    else if (enc.def.type === "puzzle") rr = puzzleAttempt(enc.state, enc.def, resolution, CONTENT.rules, opts);
    if (rr) {
      character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas.health || 0)));
      character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + (rr.deltas.energy || 0)));
      if (rr.hours) advanceClock(character.clock, rr.hours);
      character.activeEncounter = { defId: enc.def.id, state: rr.state };
      let outcome = rr.ended ? rr.outcome : null;
      if (!rr.ended && checkIncapacitation(character)) { outcome = "incapacitated"; rr.state.status = "ended"; }
      // SNG-230 §6b/§7a: a decisive FINISHER can COLLAPSE a collapsible encounter in ONE beat — a HARM craft ends
      // a fight/hazard, a transit (MOVE) craft slips a chase, a KNOW craft cracks a puzzle. Family-driven (§6c),
      // resolved ALONG the degree bands. Top → collapse; middle → the normal round (mitigated); BOTTOM → MORPH:
      // the botched finisher HARDENS the encounter — you tried to end it and missed, and now it's angry / you're
      // exposed. §89-safe: the morph is the GM narrating it harder (the mechanical failure already bit via
      // failureCost) — no meter re-tune, no spawned fight. A foe too great can't be one-beat-ended. Skill-battle
      // fights don't reach here (their own meter — guard §89); this is the classic-duel / challenge / puzzle path.
      // SNG-230 §7c: the player's KIT can VOID a challenge's PREMISE (Aevi content: trivializedBy + resistDC).
      // A fly-craft makes a climb no obstacle at all → a trivial bypass (no grind, a narrated walk-around); a
      // harder challenge RESISTS → an opposed roll (a good roll bypasses, else the normal stages stand).
      // Additive: no trivializedBy on the def → nothing changes.
      const frameContent = CONTENT.encounterFrameContent || {};
      // the acting craft's verbs + lowercased families — Aevi's trivializedBy/denies name either (move / reveal…)
      const kitKeys = choice.abilityId ? [...(fullCatalog()[choice.abilityId]?.functions || []), ...familiesOfAbility(fullCatalog()[choice.abilityId], FN_INDEX).map(f => String(f).toLowerCase())] : [];
      if (!outcome && choice.abilityId && enc.def.type === "challenge") {
        const triv = trivializes(enc.def, kitKeys, frameContent.challengePremises);
        if (triv === "trivial" || (triv === "opposed" && ["success", "crit_success"].includes(resolution.degree))) {
          outcome = "completed";
          resolution.trivialize = { craft: fullCatalog()[choice.abilityId]?.name || null, mode: triv, premise: enc.def.premise || null };
          rr.state.status = "ended";
        }
      }
      if (!outcome && choice.abilityId && frameCollapsible(enc.def)) {
        const mode = collapseMode(familiesOfAbility(fullCatalog()[choice.abilityId], FN_INDEX), encounterKind(enc.def));
        const craft = fullCatalog()[choice.abilityId]?.name || null;
        const res = mode ? collapseResult(resolution.degree, { floor: collapseFloor(enc.def, frameContent.collapseEligibility) }) : null;
        if (res === "collapse") {
          // SNG-230 §7b: a WARD can FORBID the instant-end OUTRIGHT (Aevi content: a target's ward ability id →
          // wardDenials). If a ward denies this mode and the roll doesn't DEMOLISH it (a crit whose margin beats
          // breakDC), the collapse is off the table — the finisher does ordinary damage instead (normal round stands).
          const ward = wardAgainst(enc.def, mode, frameContent.wardDenials);
          const margin = (resolution.chance ?? 0) - (resolution.roll ?? 0);
          if (ward.denied && !wardBroken(resolution.degree, margin, ward.breakDC)) {
            resolution.collapse = { mode, result: "warded", craft, ward: ward.name }; // the ward held — no instant-end
          } else {
            outcome = mode === "solve" ? "solved" : (mode === "finish" && enc.def.type === "duel") ? "opponent_fell" : "completed";
            resolution.collapse = { mode, result: "collapse", craft, wardBroken: ward.denied || undefined }; // the GM narrates the one-beat end
            rr.state.status = "ended";
          }
        } else if (res === "morph" || res === "morph_bad") {
          resolution.collapse = { mode, result: res, craft }; // the GM narrates the botched finisher hardening it (§89-safe)
        }
      }
      resolution.encounterReceipt = encounterReceiptForGM(rr.state, enc.def, resolution, { ...rr, outcome });
      // SNG-246 Fix D: the PLAYER-FACING receipt line — the mechanical truth SHOWN each round (per kind: hp/stages/
      // insight + how close a finish is), sourced from the SAME round data. Rendered beside the prose (§8756).
      try {
        const kind = encounterKind(enc.def), before = enc.state, after = rr.state;
        const bag = { degree: resolution.degree, energyDelta: rr.deltas?.energy ?? null, healthDelta: rr.deltas?.health ?? null };
        const STAGE_HINTS = { chase: ["near_escape", "closing", "losing"], hazard: ["near_across", "crossing", "near_fail"], standoff: ["near_bend", "holding", "near_lose"], puzzle: ["near_solved", "progressing", "stuck"] };
        if (enc.def.type === "duel") {
          const from = Math.max(0, before.opponentHealth ?? enc.def.opponent?.health ?? 0), to = Math.max(0, after.opponentHealth ?? from), dmg = from - to, yieldAt = enc.def.opponent?.yieldAt ?? 0;
          bag.meterFrom = from; bag.meterTo = to;
          bag.actorEffect = outcome === "opponent_yielded" ? "they break off" : dmg > 0 ? `you hit for ${dmg}` : (bag.healthDelta || 0) < 0 ? "they land one on you" : "you miss";
          bag.finishHint = to <= 0 ? "near_defeat" : to <= yieldAt + 1 ? "near_yield" : (bag.healthDelta || 0) < 0 ? "you_hurt" : "steady";
        } else if (enc.def.type === "challenge" || enc.def.type === "puzzle") {
          const isPuz = enc.def.type === "puzzle";
          const total = isPuz ? (enc.def.hintTiers?.length || 0) : (enc.def.stages?.length || 0);
          const from = isPuz ? (before.hintsRevealed ?? 0) : (before.stagesDone?.length ?? 0);
          const to = isPuz ? (after.hintsRevealed ?? from) : (after.stagesDone?.length ?? from);
          bag.meterFrom = from; bag.meterTo = to;
          bag.actorEffect = to > from ? (isPuz ? "a piece falls into place" : "you make ground") : "no ground this beat";
          const hk = STAGE_HINTS[kind] || STAGE_HINTS.puzzle;
          bag.finishHint = to >= total && total > 0 ? hk[0] : to > from ? hk[1] : hk[2];
        }
        resolution.encReceiptLine = playerReceiptLine(kind, bag, CONTENT.receiptLine);
        // SNG-252 §2b: the receipt also PERSISTS on the encounter state, so the ribbon can show where you
        // stand for as long as you stand there. Printed once beside its roll, it scrolled away with the
        // narration and the player lost the readout the moment the next beat arrived.
        if (resolution.encReceiptLine && rr.state) rr.state._lastReceipt = resolution.encReceiptLine;
      } catch (e) { /* the receipt is a convenience — never block the round */ }
      if (outcome) endEncounter(outcome); else saveCharacter(character);
    }
  }
  renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, resolution } });
  const result = await runGM({ resolution, playerInput: null, exactWords: choice.exactWords || null, itemAdvance: itemsAdvanced });
  if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, resolution }, degraded: result.degraded, itemsAdvanced });
}

async function onFreeform(text) {
  if (busy || !text.trim()) return;
  if (character._pendingIntent) { renderPlay(character.activeScene?.lastTurn || null, { aside: "Answer the moment of intent first — it's waiting on you." }); return; } // SNG-145
  // SNG-246 BUG1: in a SKILL BATTLE, a typed move is declared through sbDeclare — the skill-battle round driver —
  // never the freeform→parseIntent→onChoice→duelRound path (that would corrupt the momentum state, double-spend
  // energy, and needs the model). A craft the character owns, named in the text, is declared as that craft; else a
  // plain strike. The structured panel carries the full move set; this just keeps the free field open + API-free.
  const sbEnc = activeEnc();
  if (sbEnc?.state?.mode === "skill_battle") {
    const t = text.toLowerCase();
    const sk = playerBattleSkills().find(s => s.name && t.includes(String(s.name).toLowerCase())) || { id: "_strike", function: "strike", tier: 1, attribute: "physical", name: text.slice(0, 60) };
    sbDeclare(sk, { intensity: sbIntensity });
    return;
  }
  lastPlayerText = text;
  renderPlay(null, { thinking: "Reading your intent…", playerBeat: { label: text } });
  const location = CONTENT.locations[character.currentLocationId];
  const intent = await parseIntent(text, character, location, fullCatalog());
  if (intent.feasible === false) {
    renderPlay(character.activeScene?.lastTurn || null, { aside: intent.infeasibleReason || "That isn't possible here." });
    return;
  }
  await onChoice({
    label: intent.label || text, attribute: intent.attribute, subAttribute: intent.subAttribute,
    axes: intent.axes, difficulty: intent.difficulty, intentTags: intent.intentTags,
    abilityId: intent.abilityId, energyCost: null,
    novel: !!intent.novelUse || (intent.comboAbilities || []).length > 1,
    comboAbilities: (intent.comboAbilities || []).filter(id => character.abilities.some(a => a.abilityId === id)),
    noveltyHint: intent.noveltyHint || "",
    trivial: !!intent.trivial,
    travelTo: intent.travelTo || null, // SNG-122: the parsed destination rides through to the action
    exactWords: text
  });
}

/** Historical name for the encounter test panel gate — resolves to the single SNG-074 model. */
function isDev() { return isDevMode(); }

/** Fire a specific random encounter (entry object) or a forced flavor (dev). Registers
 *  any synthesized encounter def, then either opens a GM scene (narrative/opposed) or
 *  renders an engine-built OFFER beat with a guaranteed decline path (challenge/duel). */
/** SNG-246 Fix A (Erik's option c): the player committed a killing blow at someone the engine could NAME — so the
 *  engine MINTS the fight and ENTERS it structured, right now. No prose-only duel, no waiting on the GM to
 *  remember rule 18. Threat comes from the registry when it knows, else this place's danger, else a plain default —
 *  never from nothing, and never an invented PERSON (harmTargetFor already refused to guess at that). */
function escalateToFight(target, choice) {
  const here = hereNow();
  const threat = Number(target.threat) || Math.max(20, Math.min(70, Math.round((Number(here?.dangerLevel) || 3) * 12)));
  const entry = { id: `harm-${slugify(target.name || "foe")}-${(character.activeEncounter?.state?.round || 0)}`,
    flavor: "fight", seed: `You have committed to violence against ${target.name}.`,
    opponent: { name: target.name, threat, tacticTags: [] } };
  const def = synthesizeDuelDef(entry);
  def.opponent.name = target.name;              // synthesizeDuelDef keeps the entry's opponent; be explicit
  def.lethal = choice?.intentRung === "lethal"; // the rung the player just answered with
  if (here?.dangerLevel != null) def.danger = here.dangerLevel;
  character.customEncounters = character.customEncounters || {};
  character.customEncounters[def.id] = def;
  const sb = CONTENT.skillBattle?.engine;
  const oppSheet = sb ? synthesizeOpponentSheet(withKind(def.opponent, def), sb) : null; // SNG-253: kind-aware opponent vocab
  character.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
  saveCharacter(character);
  renderSkillBattle();
}

async function fireEncounter(entryOrFlavor, { dev = false, news = [], aggressor = false } = {}) {
  const table = encounterTable();
  if (!table) return false;
  const entry = typeof entryOrFlavor === "string"
    ? pickEncounter(table, hereNow(), Math.random, { flavor: entryOrFlavor, ignoreDanger: dev, arcBias: encounterBias(arcEffectsNow()) })
    : entryOrFlavor;
  if (!entry) { if (dev) renderPlay(character.activeScene?.lastTurn || null, { aside: `No ${entryOrFlavor} encounter fits here.` }); return false; }
  const offer = buildOffer(entry, character, fullCatalog(), CONTENT.rules, { aggressor });
  if (offer.def) {
    // SNG-230 Phase 1b: stamp the size signal so the frame can route takeover-vs-banner (Erik's size-by-tier).
    // A bestiary def already carries tier/minDanger; a synthesized chase/hazard gets THIS place's danger, so a
    // dangerous crossing in a dangerous land reads as "big" and takes the surface, a minor one stays a banner.
    if (offer.def.danger == null && offer.def.minDanger == null && offer.def.tier == null) {
      const dl = hereNow()?.dangerLevel; if (Number.isFinite(dl)) offer.def.danger = dl;
    }
    character.customEncounters = character.customEncounters || {};
    character.customEncounters[offer.def.id] = offer.def;
    try { noteBeastImage(offer.def); } catch { /* CCODE-31: a beast portrait is a grace, never a blocker */ }
    saveCharacter(character);
  }
  if (offer.routing === "narrative" || offer.routing === "opposed") {
    await startScene(offer.prompt, news, dev ? `🔧 test: ${entry.flavor} (${entry.id})` : null);
    return true;
  }
  // deterministic offer beat — decline/flee is on the table BEFORE engagement (SNG-002b)
  // CCODE-44 (Erik): "you should be able to tell something about how hard the opponent will be to beat." Rule 18
  // OFFERS a lethal fight rather than imposing it, but a decline you can't inform isn't a real choice. Appraise the
  // foe from the SAME synthesized sheet the fight will use, so the read is honest rather than flavour.
  const offerTurn = { narration: offer.narration, choices: offer.choices, sceneEnded: false };
  if (offer.def?.type === "duel" && offer.def.opponent) {
    try {
      const _sheet = synthesizeOpponentSheet(withKind(offer.def.opponent, offer.def), CONTENT.skillBattle?.engine || {});
      offerTurn._appraisal = appraiseOpponent(character, offer.def, _sheet, CONTENT.rules, CONTENT.skillBattle?.engine || {}, CONTENT.skillBattle?.engine?.appraisal || {});
    } catch { /* a read is a grace, never a blocker on the offer */ }
  }
  if (character.activeScene) { character.activeScene.lastTurn = offerTurn; saveCharacter(character); }
  renderPlay(offerTurn, { newsFlash: news, playerBeat: dev ? { label: `🔧 test encounter: ${entry.flavor} (${entry.id})` } : null });
  return true;
}

/** SNG-138: the def catalog a prestige-recurrence arc is resolved from (authored arcs + a generated
 *  personal arc — a backstory arc can BE a recurrence arc). */
function recurrenceArcDefs() { return [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])]; }

/** SNG-138: a rising name draws challengers. When the bound character has an ACTIVE prestige-recurrence
 *  arc, occasionally (paced by renown + the player's pacing) surface a challenger as a duel OFFER instead
 *  of a generic encounter — the offer carries the guaranteed decline path, and engaging routes into the
 *  existing SNG-098 skill battle. Returns a duel entry or null. A blade finds you on the move, not at rest. */
function challengerOfferFor(trigger, paceMult) {
  if (trigger !== "onTravel" && trigger !== "onEnterLocation") return null;
  const arc = findPrestigeArc(character.quests || [], recurrenceArcDefs());
  if (!arc?.def?.recurrence) return null;
  const pool = challengerPoolFor(arc.def, CONTENT.challengerPools || {});
  if (!pool?.challengers?.length) return null;
  if (character._challengeCooldown > 0) { character._challengeCooldown--; return null; } // "regularly", not "constantly"
  const renown = renownScore(character);
  const band = bandForRenown(renown, arc.def.recurrence.escalationBands, arc.def.recurrence.bandThresholds || null);
  if (!shouldFireChallenger(renown, band, paceMult, Math.random)) return null;
  const ch = pickChallenger(challengersForBand(band, arc.def.recurrence.escalationBands), pool.challengers, Math.random, character._lastChallengerId);
  if (!ch) return null;
  character._lastChallengerId = ch.id;
  character._challengeCooldown = challengeCooldown(paceMult);
  return challengerToDuelEntry(ch, band, { arcId: arc.def.arcId });
}

/** On a trigger (travel/rest/enter/tick), maybe roll one encounter. Returns true if
 *  one fired (so the caller skips the normal arrival/rest scene). */
async function maybeRandomEncounter(trigger, news = []) {
  const table = encounterTable();
  if (!table) return false;
  const pace = resolvePacing(profile?.pacing, table); // SNG-127: click-paths honor the player's pacing too
  // SNG-138: a prestige challenger gets its own paced roll, ahead of the generic encounter
  const challenger = challengerOfferFor(trigger, pace.mult);
  if (challenger) return fireEncounter(challenger, { news });
  if (!rollTrigger(trigger, hereNow(), table, Math.random, pace.mult)) return false;
  const entry = pickEncounter(table, hereNow(), Math.random, { arcBias: encounterBias(arcEffectsNow()) });
  if (!entry) return false;
  return fireEncounter(entry, { news });
}

/** SNG-075: after a narrative GM turn, MAYBE turn something up — bound to how long the fiction
 *  took, and WOVEN into the next turn (never a card). Suppressed during combat/gambit, once per
 *  scene, on a cooldown, and on an intense/intimate beat. Stashes a seed; the next runGM injects it. */
function maybeNarrativeEncounter(turn, resolution) {
  turnsSinceEncounter++;
  const table = encounterTable();
  if (!table) return;
  // SNG-127: the player's chosen pacing (Calm→Relentless) resolves a rate multiplier + a cooldown; a
  // config-tunable rate/floor means "crank it" is a JSON edit or a setting, never a code hunt.
  const pace = resolvePacing(profile?.pacing, table);
  // SUPPRESSION CONDITIONS (kept): a live encounter · a gambit in play · a scene that just ended · an
  // explicitly intense/intimate beat · during combat. SNG-127: the once-per-scene gate is now SOFT —
  // it adds spacing after the first fire, not a permanent one-per-scene cap (that was the dead-zone).
  if (activeEnc() || gambitDraft) return;
  if (turn?.sceneEnded) return;
  if (sceneState?.intense || sceneState?.intimate) return;
  const spacing = pace.cooldown + (sceneEncounterFired ? 2 : 0);
  if (turnsSinceEncounter <= spacing) return;
  const intentTags = resolution?.action?.intentTags || resolution?.intentTags || [];
  if (intentTags.some(t => /intimate|climax|grief|vigil|mourn/.test(String(t).toLowerCase()))) return;
  // SNG-127 (Q2): an UNDECLARED beat (GM omits timeOps → 0h, yet the clock ticked +1h) is floored to
  // minHoursPerBeat so it still counts as "time passing" — otherwise classify returns "none" and the
  // whole narrative path never fires. A declared short beat keeps its real (quiet) hours.
  const hoursPassed = beatHours(turn, table);
  const kind = classifyNarrativeKind({ intentTags, why: turn?.timeOps?.why || "", hoursPassed });
  const loc = hereNow();
  if (kind === "none") {
    // SNG-237 C1: a stationary SOCIAL/MENTAL beat (a talk, a deliberation) turns nothing up on the physical
    // clock — but a cerebral character should still meet NON-COMBAT frames (a standoff in the hall, a puzzle in
    // the archive), NEVER a fight erupting mid-conversation (spec GUARD). Widen the gate: a challengeable social/
    // mental beat can roll, at a content-tunable [DIAL] rate (Erik owes the real number — the spec's OQ1, lower
    // than travel), and ONLY a non-combat frame is offerable (routing challenge). No-ops when nothing non-combat
    // is eligible here — C2 content (standoff/puzzle frames + the framed standoff type) is owed to Aevi; without
    // it this stays correctly silent rather than forcing a fight.
    const social = intentTags.some(t => /talk|speak|persuad|convinc|negotiat|argue|social|confront|deceiv|charm|question|interrogat|deliberat|debate|study|reason|analyz|mental|investigat|read/i.test(String(t)));
    if (!social) return;
    const rate = Number(table.triggerRules?.onSocialBeat?.chance ?? 0.12); // [DIAL] SNG-237 C1 — tune in content
    if (rate <= 0 || Math.random() >= Math.min(0.9, rate * (pace.mult || 1))) return;
    const trial = eligibleEncountersFor(table, loc, { cap: 8 }).find(e => e.routing === "challenge" && e.id);
    if (!trial) return; // nothing NON-COMBAT eligible here yet (C2 content owed)
    pendingEncounterOffer = { id: trial.id, name: smartClamp(String(trial.name || "a hard passage"), 80), kind: "trial" };
    sceneEncounterFired = true; turnsSinceEncounter = 0;
    return;
  }
  const fired = kind === "rest" ? rollTrigger("onRest", loc, table, Math.random, pace.mult)
    : kind === "travel" ? rollTrigger("onTravel", loc, table, Math.random, pace.mult)
    : rollNarrativeTime(hoursPassed, loc, table, Math.random, pace.mult);
  if (!fired) return;
  const entry = pickEncounter(table, loc, Math.random, { arcBias: encounterBias(arcEffectsNow()) });
  if (!entry) return;
  // SNG-236 fix A: a STRUCTURED pick (duel/challenge → a real fireable def, SNG-231 fire path) is a
  // RECOGNIZABLE encounter — offer it HARD (a framed choice the GM MUST present), not woven invisibly.
  // This is the Silas fix: the recognizable-encounter offer no longer depends on the GM's soft judgment
  // ("when the fiction invites it") — the world turned it up, so the GM is DIRECTED to present it. Loose
  // flavor (a grace on the road, a small thing) still WEAVES — ambient texture is not framed. The roll's
  // own spacing/suppression already gate frequency, and structured picks are a danger-weighted subset, so
  // this doesn't flood: a danger-courting player gets framed encounters, a quiet scene stays quiet.
  if (entry.id && (entry.routing === "duel" || entry.routing === "challenge")) {
    // SNG-236 fix C: in a LOW-danger place, a non-combat scene should meet a TRIAL, not a fight it will
    // decline. If the roll landed on a duel but a structured CHALLENGE is also eligible here and danger is
    // low, prefer the challenge — the recognizable NON-COMBAT frame a cerebral beat actually wants. (This
    // is the safe, offerable-today slice of §5b. The fuller fix — a playstyle-weighted pick term + MORE
    // authored non-combat frames + making `opposed`/standoff a framed type — is a DIAL/content matter for
    // Erik + Aevi; only 4 challenge entries and 0 offerable standoffs exist today, so this bias is modest.)
    let chosen = entry;
    if (entry.routing === "duel" && (loc.dangerLevel || 0) <= 1) {
      const trial = eligibleEncountersFor(table, loc, { cap: 8 }).find(e => e.routing === "challenge" && e.id);
      if (trial) chosen = trial;
    }
    const kind = chosen.routing === "duel" ? "fight" : "trial";
    const name = chosen.name || (chosen.routing === "duel" ? "a hostile meeting" : "a hard passage");
    pendingEncounterOffer = { id: chosen.id, name: smartClamp(String(name), 80), kind };
  } else {
    // WEAVE, DO NOT INTERRUPT: no card, no scene change — stash the seed for the next GM turn.
    // SNG-237 Fix B: the ENGINE decides texture-vs-challenge (OQ2 — the GM must not re-derive decisiveness from
    // prose). A loose pick is DECISIVE when it can incapacitate OR its flavor is a threat that moves on the
    // player (fight/chase/dangerous/theft) — those ESCALATE to a recognizable frame downstream; a grace or a
    // small thing (beautiful/benign/beneficial) stays ambient texture.
    const decisive = canIncapacitate(entry) || /fight|chase|danger|theft|raid|hostile|ambush|threat/i.test(String(entry.flavor || ""));
    pendingWeave = { seed: entry.seed, flavor: entry.flavor, perilous: canIncapacitate(entry), decisive, loreTier: entry.loreTier || null };
  }
  sceneEncounterFired = true;
  turnsSinceEncounter = 0;
}

/** SNG-245: feed the PRESSURE QUEUE from the agendas already in the game — run on the world tick (a boundary,
 *  so it primes driven things without per-turn churn). The two starter producers: a bonded NPC's unmet want
 *  (they come to YOU) and a threat that comes to your ground (becomes a real defend-encounter). Reuses the
 *  pacing pref as the aggression dial (Calm waits long / drives gently; Relentless barely waits / drives hard).
 *  Never throws (the caller wraps it) — the world driving is additive, never a blocker. */
function runPressureProducers() {
  if (!character?.worldState) return;
  const queue = ensurePressureQueue(character.worldState);
  const nowDay = readClock(character.clock).day;
  const here = character.currentLocationId;
  const pacingMult = (resolvePacing(profile?.pacing, CONTENT.randomEncounters)?.mult) || 1;

  // Producer A — NPC unmet want (SNG-233): a bonded, long-unseen NPC whose want is authored (interiority overlay
  // first, then the catalog want). subjectId = the npc id, so it's a REAL person reaching out, never invented.
  const wantFor = id => {
    const inter = CONTENT.npcInteriority?.npcs?.[id]?.wants || character.npcRegistry?.[id]?.interiority?.wants;
    if (Array.isArray(inter) && inter.length) return inter[0];
    const cat = CONTENT.npcs?.[id];
    return cat?.want || (Array.isArray(cat?.wants) ? cat.wants[0] : cat?.wants) || null;
  };
  for (const e of npcWantPressures({ npcs: Object.values(character.npcRegistry || {}), wantFor, bandOf: relationshipBand, nowDay, hereId: here, pacingMult })) {
    enqueuePressure(queue, e);
  }

  // Producer B — threat-attack: a real beast/threat from THIS place's eligible pool (never invented); it becomes
  // a framed defend-encounter when the queue fires. Rolls on danger × the aggression pref, so a safe place is
  // rarely troubled and a dangerous one often is.
  const loc = hereNow();
  const pool = (() => { try { return eligibleEncountersFor(encounterTable(), loc, { cap: 8 }); } catch { return []; } })();
  const threat = threatAttackPressure({ pool, danger: Number(loc?.dangerLevel) || 0, hereId: here, nowDay, pacingMult, rng: Math.random });
  if (threat) enqueuePressure(queue, threat);
}

/** SNG-080 + SNG-245: the world must PUSH. Count quiet turns; past the threshold, hand the NEXT GM turn a
 *  pressure directive. SNG-245: it now PULLS the top entry from the Pressure Queue when one is aimed here — the
 *  world acts with a REAL DRIVEN thing (a bonded NPC's want, a threat that comes to you) — and only falls back to
 *  the generic escalating push when the queue is empty. If the world already acted this beat (an encounter, a
 *  quest change, a scene end), the streak resets. DRIVEN, never RELENTLESS: a tender/charged beat is never broken. */
function maybeWorldPressure(turn, resolution) {
  const woveEncounter = !!pendingWeave; // SNG-075 just set one → the world already acted this beat
  const questChanged = !!(turn?.questUpdates?.length || turn?.stateOps?.length);
  const eventful = isEventfulTurn({ encounterActive: !!activeEnc(), questChanged, woveEncounter, sceneEnded: turn?.sceneEnded });
  if (eventful) { quietTurns = 0; pressureStreak = 0; return; }
  if (gambitDraft) return; // don't interrupt a plan being built
  if (pendingEncounterOffer) return; // SNG-245: an encounter already turned up this beat — never stack a second push
  // SNG-245 guard — the tender-moment floor the SNG-080 path never had: a driven push obeys the same "never break
  // an intimate/intense beat" rule the encounter path (SNG-075) does. Activity is not harassment.
  if (sceneState?.intense || sceneState?.intimate) return;
  const intentTags = resolution?.action?.intentTags || resolution?.intentTags || [];
  if (intentTags.some(t => /intimate|climax|grief|vigil|mourn/.test(String(t).toLowerCase()))) return;
  quietTurns++;
  const tier = pressureTier(quietTurns, pressureStreak);
  if (tier <= 0) return;
  const loc = hereNow();
  // SNG-245: pull a DRIVEN entry aimed at where the player stands (drop a threat aimed at a place they've left).
  const entry = pullTopPressure(ensurePressureQueue(character.worldState), e => !e.locationId || e.locationId === character.currentLocationId);
  if (entry) {
    if (entry.becomes?.type === "encounter" && entry.becomes.encounterId) {
      // TEETH: route the threat through the SNG-236 hard-frame — a framed choice carrying this encounterId, so
      // "the beast attacks" becomes a real defend-encounter, not a line of flavor (the §GUARD: a hook has teeth).
      pendingEncounterOffer = { id: entry.becomes.encounterId, name: smartClamp(String(entry.becomes.name || "a threat"), 80), kind: "fight" };
    } else {
      pendingPressure = drivenPressureDirective(entry.oneLineHook); // a driven scene beat (the NPC arrives, the want reaches out)
    }
    console.log(`[pressure] the world DRIVES: ${entry.kind} → ${entry.subjectId} (urgency ${entry.urgency})`);
    pressureStreak++; quietTurns = 0;
    return;
  }
  // Fallback (queue empty) — the generic escalating push, unchanged (SNG-080).
  const questTitles = (character.quests || []).filter(q => q.status === "active").map(q => q.title || q.id);
  pendingPressure = pressureDirective(tier, loc?.dangerLevel || 0, questTitles);
  pressureStreak++;   // the next pressure escalates
  quietTurns = 0;     // space them out — another threshold of quiet before the next push
}

/** SNG-117: mark a place KNOWN by name (GM-named destination, en-route, minted transit place) so the map
 *  surfaces its name + it becomes a travel target — even before it's ever entered. Idempotent. */
function addKnownPlace(id) {
  if (!id) return;
  character.knownPlaces = character.knownPlaces || [];
  // SNG-330 — ⚠️ THE CAP WAS BELOW THE ATLAS. 80, against 118 authored locations: a well-travelled
  // character SILENTLY FORGOT the oldest place they knew, and `isKnown` gates naming, description and map
  // labelling — so somewhere you went in your first hour became "an unknown place" again. Forgetting where
  // you started is the worst possible eviction order. The cap now sits above the whole atlas with room to
  // grow; if it ever needs to evict, that must be least-recently-SEEN, never oldest-learned.
  if (!character.knownPlaces.includes(id)) character.knownPlaces = [...character.knownPlaces, id].slice(-400);
}

// SNG-122: a clear travel expression in the player's own words — "head to / go to / travel to / set out
// for / make my way to {place}". Captures the destination phrase in group 1. Deliberately narrow so a
// non-travel line ("I go for his throat") doesn't match a place (no "to/for {place}" travel frame).
const TRAVEL_PHRASE = /\b(?:head(?:ing)?|go(?:ing)?|travel(?:ing)?|journey(?:ing)?|set out|set off|make (?:my|our|your|his|her|their|the) way|depart(?:ing)?|leave|ride|walk|march|venture|return|head back)\s+(?:back\s+)?(?:to|for|toward|towards|over to|into)\s+(.{2,48}?)(?:\s*[.!?,;]|\s+(?:and|then|to)\b|$)/i;
const NOT_A_PLACE = /^(?:there|here|him|her|them|it|me|us|you|home|back|inside|outside|out|away|on|onward|forward|work|bed|sleep|rest|ground|him\b)$/i;

/** SNG-122: is this action a TRAVEL intent, and to where? Two signals with different trust:
 *   (1) TRUSTED — the LLM intent parser named a destination (`travelTo`) for a GO/HEAD/JOURNEY action;
 *       honored even for an unmapped place (minted on arrival, the SNG-117 path).
 *   (2) GUESSED — a "travel" tag or a travel-phrase in the label/words. A guess must name a REAL/known
 *       place to count, so "go for his throat" (an attack) never becomes a phantom destination.
 *  Returns {ref,name,destId} or null; destId null (trusted only) means "mint on arrival." */
function travelIntentOf(action) {
  if (!action) return null;
  // SNG-188 §4: DISCUSSING travel is not DOING it. A label led by a speech verb (announce, confide,
  // tell, discuss, plan…) is a conversation about a journey, never a departure — however many
  // place-names it holds. The code belt behind the parser prompt: a travelTo the model set on a speech
  // act is stopped HERE, before buildTravelDirective can force a move. Erik's exact turn — "confide in
  // Veth … and announce travel plans to Cairnhold" — leaves him in the alcove because of this line.
  if (isSpeechAct(action.label)) return null;
  const titleize = s => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60);
  // (1) trusted explicit destination from the free-text parser
  let ref = action.travelTo && String(action.travelTo).trim();
  if (ref && !NOT_A_PLACE.test(ref.replace(/^the\s+/i, "").trim())) {
    const destId = resolveLocationId(ref, CONTENT.locations);
    if (destId) return { ref, name: CONTENT.locations[destId].name, destId }; // a REAL place — trust it
    // SNG-228: destId null → would mint `ref` as a phantom place. First check it isn't a PERSON (Ossian):
    // a known NPC, or someone the words go to CATCH/CONFRONT or address by TITLE. A person is never a
    // destination — redirect to their PLACE if it's recoverable (§3c), else no travel intent (no phantom).
    const person = personDestination(ref, action, { npcRegistry: character.npcRegistry, locations: CONTENT.locations });
    if (person.isPerson) return person.destId ? { ref: CONTENT.locations[person.destId].name, name: CONTENT.locations[person.destId].name, destId: person.destId } : null;
    return { ref, name: titleize(ref), destId: null }; // a genuinely new PLACE — mint on arrival (SNG-117)
  }
  // (2) a GUESS from tag/phrase — must resolve to a real place to be trusted as a destination
  const tags = [...(action.intentTags || []), ...(action.tags || [])].map(t => String(t).toLowerCase());
  const text = `${action.label || ""} ${action.exactWords || ""}`;
  const m = text.match(TRAVEL_PHRASE);
  let cand = m ? m[1].trim().replace(/\s+/g, " ") : null;
  if ((!cand || NOT_A_PLACE.test(cand.replace(/^the\s+/i, "").trim())) && tags.includes("travel")) {
    cand = null; // tagged travel, no clean phrase → find a KNOWN place named in the words
    for (const l of Object.values(CONTENT.locations)) { const n = (l.name || "").toLowerCase(); if (n && n.length > 2 && text.toLowerCase().includes(n)) { cand = l.name; break; } }
  }
  if (!cand) return null;
  const destId = resolveLocationId(cand, CONTENT.locations);
  if (!destId) return null; // a guessed phrase that isn't a real place is NOT a travel intent (no over-move)
  return { ref: cand, name: CONTENT.locations[destId].name, destId };
}

/** SNG-122: the per-turn directive that FORCES the GM to emit moveTo for a travel intent, and enumerates
 *  the real/known places reachable from here so its moveTo target resolves (Q2). */
function buildTravelDirective(ti) {
  const here = CONTENT.locations[character.currentLocationId];
  const adj = (here?.connections || []).map(id => CONTENT.locations[id]).filter(Boolean)
    .filter(l => isPlaceKnown(character, l.id, CONTENT.locations)).map(l => `${l.name} (${l.id})`);
  const dest = ti.destId ? `${CONTENT.locations[ti.destId].name} (id ${ti.destId})` : `"${ti.ref}"`;
  return `The player INTENDS to travel to ${dest}. If the fiction actually DEPARTS this beat — they set out, are led, or the trip is a montage with time passing on the road — emit "moveTo": {"location": "${ti.destId || ti.ref}", "why": "…"} so they arrive, and narrate the journey (with timeOps if far). But if this beat is still PLANNING or discussing the trip and they have NOT left yet, do NOT move them — keep the scene where it is and offer the road as the next step. Never relocate a character who only spoke about going (SNG-188). ${adj.length ? `Places reachable from ${here?.name || "here"}: ${adj.join(", ")}. ⛔ If the destination is one of THESE, use its exact name/id — do not coin a new synonym for a place you can already reach (it mints a duplicate).` : ""}`;
}

/** SNG-122: the one-tap safety net — the travel beat didn't move the player, so arrive now via the SAME
 *  path the map uses (resolve-or-mint the destination, then travelTo). Never leaves them stranded. */
/** SNG-145: the player answers an intent gate. Engine-raised gates (harm/departure)
 *  resume the ESCROWED CHOICE — annotated and re-entered through onChoice, so the
 *  normal dice/energy/GM path runs exactly once, now with intent attached. A
 *  GM-raised gate (offerIntent) has no held act; the answer returns as a synthetic
 *  beat. Declining a departure simply… stays: nothing was committed to undo. */
async function answerIntent(optionId) {
  const g = character._pendingIntent;
  if (!g || busy) return;
  character._pendingIntent = null;
  const label = (g.options || []).find(o => o.id === optionId)?.label || optionId;
  if (g.resume?.choice) {
    // mark the ask so this encounter/scene never gates twice (spec §2: rare or it's noise)
    if (g.askedKey) character._intentAsked = { ...(character._intentAsked || {}), [g.askedKey]: true };
    if (g.kind === "departure" && optionId !== "go") {
      saveCharacter(character);
      renderPlay(character.activeScene?.lastTurn || null, { aside: "You hold at the boundary — the road will keep." });
      return;
    }
    const choice = { ...g.resume.choice };
    if (g.kind === "harm") { choice.intentRung = optionId; choice.intentNote = intentNoteFor(g, optionId); }
    if (g.kind === "departure") choice.departureConfirmed = true;
    saveCharacter(character);
    await onChoice(choice);
    return;
  }
  // GM-raised gate: no escrowed act — the confirmed intent returns as a synthetic beat.
  saveCharacter(character);
  renderPlay(null, { thinking: "…", playerBeat: { label } });
  const result = await runGM({ resolution: null, playerInput: `(${intentNoteFor(g, optionId)} Continue the scene from the player's confirmed choice.)` });
  if (result) renderPlay(result.turn, { playerBeat: { label }, degraded: result.degraded });
}

/** SNG-145 trigger 3: confirm or hold a world-scale consequence. Held = dropped —
 *  by inaction nothing is ever imposed on another player's world. */
async function answerLedger(send) {
  const held = character._pendingLedger || [];
  if (!held.length) return;
  const ev = held[0];
  character._pendingLedger = held.slice(1);
  saveCharacter(character);
  if (send) appendLedger([ev], character.id).catch(err => console.warn("[ledger]", err.message));
  renderPlay(character.activeScene?.lastTurn || null, { aside: send ? "Word of it travels — the world will hear." : "It stays local — a story this valley keeps." });
}

/** CCODE-03: close the current scene on the player's say-so. The GM writes the closing beat and
 *  the summing-up (so the chronicle entry is real prose, not a stub); the engine then does exactly
 *  what a GM-emitted sceneEnded does. If the GM can't answer, the scene still closes — a scene the
 *  player asked to end must end, or we are back to the 169-beat scene this exists to prevent. */
async function endSceneNow() {
  if (busy || !character) return;
  if (!sceneTurns.length) { renderPlay(character.activeScene?.lastTurn || null, { aside: "There's no scene open yet — take an action first." }); return; }
  const beats = sceneTurns.length;
  renderPlay(null, { thinking: "Drawing the scene to a close…" });
  const result = await runGM({ resolution: null, playerInput:
    `(The player is CLOSING this scene. Write one short closing beat that lets the current moment finish naturally — nobody teleports, nothing unresolved is forced shut — then set "sceneEnded": true and write "sceneSummary" as a summing-up of the WHOLE scene (${beats} beats), because that summary becomes the chronicle entry. Offer no choices.)` });
  if (result?.turn?.sceneEnded) { renderPlay(result.turn, { aside: `Scene closed — ${beats} beats written into your chronicle.` }); return; }
  // The GM didn't set the flag (or the call failed) — close it engine-side anyway.
  const summary = result?.turn?.sceneSummary || sceneTurns[sceneTurns.length - 1]?.summary || `A scene at ${hereNow()?.name || "this place"}, ${beats} beats long.`;
  character.chronicle = character.chronicle || [];
  character.chronicle.push(summary);
  sceneTurns = []; sceneState = null; character._intentAsked = null;
  character.activeScene = null;
  saveCharacter(character);
  renderPlay(result?.turn || null, { aside: `Scene closed — ${beats} beats written into your chronicle.` });
}

// ---------- SNG-155: read the narration aloud (Web Speech, tier 1) ----------
// Tier 0 is always available: no speechSynthesis, no voices, no key → silence, no error (Law 5).
// Speech starts on the FIRST sentence chunk while the rest queues, so it begins ~instantly.
let _speaking = false;
function ttsAvailable() { return typeof window !== "undefined" && !!window.speechSynthesis; }
function ttsVoices() { try { return window.speechSynthesis.getVoices() || []; } catch { return []; } }
function stopSpeaking() {
  if (!ttsAvailable()) return;
  try { window.speechSynthesis.cancel(); } catch { /* best-effort */ }
  _speaking = false;
}
/** Speak a turn's SPEAKABLE PROJECTION — narration only; choices, costs and receipts are never
 *  spoken (spec §3b). A new turn cancels the old utterance cleanly. */
function speakTurn(turn) {
  if (!ttsAvailable()) return false;
  const text = speakableText(turn);
  if (!text) return false;
  stopSpeaking();
  const voice = pickVoice(ttsVoices(), { preferredName: profile?.ttsVoice || null, lang: "en" });
  const chunks = chunkForSpeech(text);
  _speaking = true;
  for (const c of chunks) {
    const u = new SpeechSynthesisUtterance(c);
    if (voice) { u.voice = voice; u.lang = voice.lang || "en"; }
    u.rate = Number(profile?.ttsRate) || 0.98;
    u.pitch = Number(profile?.ttsPitch) || 1;
    u.onend = () => { if (c === chunks[chunks.length - 1]) _speaking = false; };
    u.onerror = () => { _speaking = false; };
    try { window.speechSynthesis.speak(u); } catch { _speaking = false; }
  }
  return true;
}
/** SNG-155: read the beat the player is LOOKING AT. The control lives on the beat now, so it must
 *  speak the DISPLAYED turn — falling back to lastTurn only when it was invoked without one. */
function toggleSpeakTurn(displayed = null) {
  const turn = displayed || character?.activeScene?.lastTurn || null;
  if (_speaking) { stopSpeaking(); renderPlay(turn, {}); return; }
  if (!speakTurn(turn)) { renderPlay(turn, { aside: ttsAvailable() ? "Nothing to read aloud yet." : "This browser has no speech voices available." }); return; }
  renderPlay(turn, {});
}

async function arriveAtPending() {
  const p = character._pendingArrival; if (!p || busy) return;
  character._pendingArrival = null;
  const destId = (p.destId && CONTENT.locations[p.destId] ? p.destId : null) || resolveLocationId(p.ref, CONTENT.locations) || mintTransitLocation(p.ref);
  await travelTo(destId);
}

/** SNG-117: turn a named-but-unrecorded destination ("the pass") into a REAL, travelable place — a
 *  lightweight generated location adjacent to where you left, with a stable id + map coord. Idempotent
 *  (keyed off the normalized name, so "the pass" mints exactly once — Q1). Deterministic (no model call);
 *  the world-gen path can flesh it out later. Returns the id. */
function mintTransitLocation(moveRef) {
  // SNG-329 — ⛔ THE MINT IS A WRITE TO THE SAVE, SO IT IS THE STRICTEST GATE IN THIS PATH, NOT THE LOOSEST.
  // Aevi's framing, and it is right: this path is permissive ON PURPOSE ("a named-but-unrecorded destination
  // like 'the pass' becomes a real place"), and permissive input plus a PERSISTING write is exactly where a
  // malformed value becomes permanent. Everything upstream may guess; this may not.
  const ref = locationRefToString(moveRef);
  if (!ref || isCoercedObjectName(ref)) {
    console.warn("[mint] refused a location reference that is not a usable name:", moveRef);
    return null;                       // the header keeps its last real place rather than gaining a fake one
  }
  ensureGenerated(character);
  moveRef = ref;
  const id = "gen-" + slugify(ref);
  if (CONTENT.locations[id]) { addKnownPlace(id); return id; } // already a real place — reuse, never dup
  const here = CONTENT.locations[character.currentLocationId];
  const existing = {}; for (const l of Object.values(CONTENT.locations)) if (l.map) existing[l.id] = l.map;
  const name = String(moveRef).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60);
  // SNG-154: if this name was already a sub-place somewhere, promotion PRESERVES that containment —
  // the new location remembers what it is inside of, and the map anchors it there instead of
  // hash-gridding it across the world (the Low Lamp Inn bug).
  const promotedFrom = findSubPlaceParent(character, moveRef);
  const rec = {
    id, name, regionId: here?.regionId || here?.region || null,
    ...(promotedFrom ? { parentId: promotedFrom.parentId, _promotedFromSubPlace: true } : {}),
    descriptionSeed: `A place the road led to — ${name}. The fiction brought you here before the map knew its name.`,
    // SNG-216: `_gen` MUST be the tracking OBJECT (stampGenerated's shape), not a boolean flag — a boolean
    // here is what made recordAttention throw on arrival + abort the location commit (the SNG-210 desync).
    tags: ["transitional"], connections: here ? [here.id] : [], _mintedAs: "transit",
    // SNG-225 §4a: a real dangerLevel, never null — a null danger reads as 0 (safest possible) and STARVES the
    // encounter pool (every minDanger>0 encounter becomes ineligible). Inherit the neighbourhood's danger.
    dangerLevel: deriveDangerLevel({ tags: ["transitional"] }, { baseDanger: here?.dangerLevel }),
    _gen: { type: "location", tier: "fresh", engagementScore: 0, birthWeight: 1, rating: null, attentionHistory: [], createdDay: (() => { try { return readClock(character.clock).day; } catch { return null; } })(), provenance: { locationId: here?.id || null, day: null, hint: "transit" } },
    map: coordForGenerated(id, here?.map, existing)
  };
  // CCODE-15 observability: a mint means the GM named a place that matched NOTHING existing (resolveLocationId
  // already ran and missed). Log it so the coin-rate is measurable — a coined synonym for an existing place
  // (the "Center"/"The Crossing" duplicate) shows up here; the fix is an alias on the canonical file, or the
  // reparent lever if it's really a sub-place. A genuinely new place is expected and fine.
  console.log(`[transit-mint] coined "${name}" (${id})${promotedFrom ? ` — nested under ${promotedFrom.parentId}` : " — top-level, no matching place found"}. If this duplicates a real place, add an alias to its canonical file or reparent it (Author panel).`);
  character.generated.location[id] = rec;   // persists on the save (hydrateGeneratedIntoContent revives it)
  CONTENT.locations[id] = rec;              // live this session
  if (here && Array.isArray(here.connections) && !here.connections.includes(id)) here.connections = [...here.connections, id]; // bidirectional reach
    // SNG-330 — ⚠️ AND WRITE IT SOMEWHERE THAT SURVIVES. The line above mutates AUTHORED content, which is
    // shared and never saved, so the edge vanished on reload and took the Travel button with it. This is
    // the persisting twin of `generated.location`, which has always saved the other half.
    character.placeEdges = character.placeEdges || {};
    if (here?.id) character.placeEdges[here.id] = [...new Set([...(character.placeEdges[here.id] || []), id])];
  addKnownPlace(id);
  return id;
}

/** SNG-235 + SNG-243 §3: a quest ending that MAKES a waygate mints a REAL, travelable one — a runtime location
 *  flagged `waygate:true`, connected to its anchor(s) and DISCOVERED, so the player can actually step through it
 *  (it rides the same gate/travel dispatch as any authored gate — waygate.js). Reuses the transit-mint pattern
 *  (generated store persists + live CONTENT + bidirectional reach + knownPlaces). Idempotent by id — a SECOND
 *  call (the SNG-243 network-shaped `waygate` effect, after the SNG-235 `create_waygate` one) AUGMENTS the same
 *  node with resolved default/intent connections + networkCapable, rather than skipping. Accepts both shapes:
 *  legacy {id, connectsTo[]} and the richer {gateId, connects[]:{to,kind,default,requires}, at, networkCapable}. */
function mintWaygate({ id, gateId, name, description, connectsTo, connects, at, networkCapable, waygateTier } = {}) {
  ensureGenerated(character);
  const gid = "gen-" + slugify(String(id || gateId || `waygate-${name || "made-gate"}`));

  // SNG-243 §3: resolve each rich connection's `to` to a REAL location id (SNG-232 seam — a connection target
  // that can't resolve would mint a broken travel edge; drop it loudly instead). Keep kind/default/requires.
  const richConns = (Array.isArray(connects) ? connects : []).map(cn => {
    const to = resolveLocationId(cn.to, CONTENT.locations);
    if (!to) { console.warn(`[made-waygate] connection target "${cn.to}" does not resolve to a location — SNG-232 seam; edge dropped (author the location or fix the id).`); return null; }
    return { to, kind: cn.kind || "passage", default: !!cn.default, requires: cn.requires || null, note: cn.note ? smartClamp(String(cn.note), 300) : null };
  }).filter(Boolean);
  if (at && !resolveLocationId(at, CONTENT.locations)) console.warn(`[made-waygate] anchor "at":"${at}" does not resolve to a location — the gate stands as its own node (SNG-232 seam; informational).`);

  // The full target set = legacy connectsTo (resolved) ∪ rich connects targets. Default to the hub if empty.
  const legacyTargets = (Array.isArray(connectsTo) ? connectsTo : []).map(a => resolveLocationId(a, CONTENT.locations)).filter(Boolean);
  let targets = [...new Set([...legacyTargets, ...richConns.map(c => c.to)])];
  if (!targets.length) targets = (CONTENT.locations["the_crossing"] ? ["the_crossing"] : (CONTENT.locations[character.currentLocationId] ? [character.currentLocationId] : []));
  const defaultTo = (richConns.find(c => c.default)?.to) || (CONTENT.locations["the_crossing"] ? "the_crossing" : targets[0] || null);

  const linkBack = a => { const al = CONTENT.locations[a]; if (al && Array.isArray(al.connections) && !al.connections.includes(gid)) al.connections = [...al.connections, gid]; }; // bidirectional reach

  const existing = CONTENT.locations[gid];
  if (existing) {
    // AUGMENT — the create_waygate call minted the node first; fold in the richer default/intent connections.
    existing.connections = [...new Set([...(existing.connections || []), ...targets])];
    if (richConns.length) existing.waygateConnections = richConns;
    if (networkCapable) existing.networkCapable = true;
    if (defaultTo) existing.waygateDefaultTo = defaultTo;
    for (const a of targets) linkBack(a);
    addKnownPlace(gid);
    const g = character.generated?.location?.[gid];
    if (g) Object.assign(g, { connections: existing.connections, waygateConnections: existing.waygateConnections, networkCapable: existing.networkCapable, waygateDefaultTo: existing.waygateDefaultTo });
    saveCharacter(character);
    console.log(`[made-waygate] "${existing.name}" (${gid}) AUGMENTED → connections ${existing.connections.join(", ")}${networkCapable ? " · networkCapable" : ""}${defaultTo ? ` · default→${defaultTo}` : ""}`);
    return gid;
  }

  const anchor = CONTENT.locations[targets[0]] || null;
  const existingMaps = {}; for (const l of Object.values(CONTENT.locations)) if (l.map) existingMaps[l.id] = l.map;
  const rec = {
    id: gid, name: smartClamp(String(name || "The Made Gate"), 60),
    regionId: anchor?.regionId || anchor?.region || null,
    descriptionSeed: smartClamp(String(description || `A waygate — made, not reached-for. ${name || "The Made Gate"}.`), 400),
    tags: ["waygate", "made"], waygate: true, waygateTier: Math.max(1, Math.min(4, Number(waygateTier) || 2)),
    connections: targets.slice(),
    ...(richConns.length ? { waygateConnections: richConns } : {}),
    ...(networkCapable ? { networkCapable: true } : {}),
    ...(defaultTo ? { waygateDefaultTo: defaultTo } : {}),
    dangerLevel: deriveDangerLevel({ tags: ["waygate"] }, { baseDanger: anchor?.dangerLevel }),
    _gen: { type: "location", tier: "fresh", engagementScore: 0, birthWeight: 1, rating: null, attentionHistory: [], createdDay: (() => { try { return readClock(character.clock).day; } catch { return null; } })(), provenance: { hint: "made-waygate", questMade: true } },
    _mintedAs: "made_waygate",
    map: coordForGenerated(gid, anchor?.map, existingMaps)
  };
  character.generated.location[gid] = rec;
  CONTENT.locations[gid] = rec;
  for (const a of targets) linkBack(a);
  addKnownPlace(gid);
  console.log(`[made-waygate] "${rec.name}" (${gid}) minted + discovered → connections ${targets.join(", ") || "(nowhere yet)"}${networkCapable ? " · networkCapable" : ""}${defaultTo ? ` · default→${defaultTo}` : ""}`);
  return gid;
}

async function travelTo(locId, { cost } = {}) {
  if (busy) return;
  // SNG-273: a closing world makes the ROADS cost more — a property of the world, not a tax on the traveller.
  { const t = travelCostFactor(arcEffectsNow());
    if (t.mult !== 1 && cost?.hours) cost = { ...cost, hours: Math.max(0.25, Math.round(cost.hours * t.mult * 4) / 4) }; }
  noteGeneratedAttention(locId, "revisit", readClock(character.clock).day); // §2: returning to a grown place keeps it alive
  addKnownPlace(locId); // SNG-117: somewhere you've been is known
  character.currentLocationId = locId;
  character.activeScene = null;
  sceneTurns = [];
  sceneState = null;
  // SNG-243 §4: a gate-NETWORK hop carries its own cost (a fraction of the overland time + an energy toll — the
  // gate's whole point is that a season becomes an afternoon, but it's never free). Ordinary travel: ADVANCE.travel.
  advanceClock(character.clock, cost?.hours != null ? cost.hours : ADVANCE.travel);
  if (cost?.energy) character.energy = Math.max(0, (character.energy || 0) - cost.energy);
  notePlaceVisit(character, locId, readClock(character.clock).day, CONTENT.locations[locId]?.name);
  notePerception(character, locId, CONTENT.locations[locId], { visited: true, usedAbilityIds: [] }, CONTENT.rules);
  try { ensureLocationImage(locId); } catch { /* SNG-046 L3: art is a convenience; never block travel */ }
  saveCharacter(character);
  const news = await maybeTick();
  if (await maybeRandomEncounter("onTravel", news)) return; // the road had something to say
  if (await maybeRandomEncounter("onEnterLocation", news)) return; // arrival itself had something waiting
  startScene(`(The character has just arrived here, traveling from elsewhere in the valley. Open the scene with the arrival.)`, news);
}

async function rest(kind = "sleep") {
  if (busy) return;
  const rec = CONTENT.rules.recovery || {};
  const r = kind === "breather" ? (rec.breather || { energy: 10, health: 1, hours: 1 }) : (rec.sleep || { energy: 40, health: 3, hours: 8 });
  // SNG-105: energy restore scales with the pool (a night is always ~a third of maxEnergy); health/hours flat.
  const gainE = recoveryEnergy(kind, character, CONTENT.rules);
  character.energy = Math.min(character.maxEnergy, character.energy + gainE);
  character.health = Math.min(character.maxHealth, character.health + r.health);
  if (kind === "breather") {
    advanceClock(character.clock, r.hours);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You take an hour off your feet. (+${gainE} energy, +${r.health} health)` });
    return;
  }
  sceneTurns = [];
  sceneState = null; // hours pass — the old scene has dissolved
  advanceClock(character.clock, r.hours);
  saveCharacter(character);
  const news = await maybeTick();
  if (await maybeRandomEncounter("onRest", news)) return; // the night was not quiet
  startScene(`(The character takes a real night's rest here — camp, inn, or quiet corner. Narrate the rest briefly, then present what's happening when they get up. ${r.hours} hours have passed; do not grant additional energy — the engine already restored them.)`, news);
}

async function onAsk(text) {
  if (busy || !text.trim()) return;
  lastPlayerText = text;
  busy = true;
  const lastTurn = character.activeScene?.lastTurn || null;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, thinking: "The GM leans back…" });
  // BATCH-11 §23: assembled from the registry's "ask" view (same rows, no turn ephemera).
  const result = await gmAsk(assembleGMContext("ask", gmEnv()), text);
  busy = false;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, gmAside: result.ok ? result.text : "The GM stumbled: " + result.error });
}

// ---------- world map ----------

// SNG-080: danger, made legible on the map — so the player can SEE where fighting lives.
function dangerLabel(dl) { return ["safe", "quiet", "uneasy", "dangerous", "deadly"][Math.max(0, Math.min(4, dl | 0))]; }

// SNG-154 stage 6: ZOOM IS NAVIGATION BETWEEN TIERS, not a scale slider. 95 places on one
// 800×440 canvas is unreadable — every label collides and the thing you're looking for is a dot
// among ninety-four others. Each tier answers one question at the scale that question lives at:
//   WORLD    which Reach am I in — regions as territories, and the gates that cross them
//   REGION   where can I go from here — the settlements around me (today's map, finally scoped)
//   LOCATION what is INSIDE this place — Millbrook → the Edge District → the Inn → the booth
// The LOCATION tier never existed, which is why containment bugs had nowhere to become visible.
let mapTier = "region";   // "world" | "region" | "location"
let mapFocus = null;      // regionId when tier=region, locationId when tier=location

function currentRegionId() {
  const here = CONTENT.locations[character.currentLocationId];
  return here?.regionId || here?.region || (CONTENT.regions || [])[0]?.regionId || null;
}

/** The tier strip + breadcrumb. Always shows where you are in the hierarchy and how to go up. */
function mapTierBar() {
  const rid = mapTier === "region" ? (mapFocus || currentRegionId()) : currentRegionId();
  const rName = (CONTENT.regions || []).find(r => r.regionId === rid)?.name || String(rid || "").replace(/_/g, " ");
  const locName = mapTier === "location" ? (CONTENT.locations[mapFocus]?.name || mapFocus) : null;
  const crumb = (label, tier, focus, active) =>
    `<button class="opt map-tier ${active ? "selected" : ""}" data-maptier="${tier}" data-mapfocus="${esc(focus || "")}">${esc(label)}</button>`;
  return `<div class="map-tiers" style="margin-bottom:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
    ${crumb("🌍 World", "world", "", mapTier === "world")}
    <span class="hint">›</span>
    ${crumb(rName || "Region", "region", rid, mapTier === "region")}
    ${locName ? `<span class="hint">›</span>${crumb("⌂ " + locName, "location", mapFocus, true)}` : ""}
    <span class="hint" style="margin-left:auto">${mapTier === "world" ? "Click a region to enter it" : mapTier === "region" ? "Click a place, then “Look inside”" : "What's inside this place"}</span>
  </div>`;
}

/** WORLD tier — regions as territories. Individual settlements are noise at this scale; the
 *  questions here are "which Reach is this" and "how do I cross the world" (the gates). */
function renderMapWorld() {
  const nodes = worldTierNodes(CONTENT, character);
  const cols = 5, cw = 800 / cols, ch = 96;
  const cells = nodes.map((n, i) => {
    const cx = (i % cols) * cw + cw / 2, cy = Math.floor(i / cols) * ch + 58;
    const pal = n.palette || {};
    const hub = n.gates.find(g => g.hub);
    return `<g class="map-region-cell ${n.here ? "here" : ""} ${n.known ? "known" : "unknown"}" data-mapregion="${esc(n.regionId)}">
      <title>${esc(n.name)} — ${n.count} place${n.count === 1 ? "" : "s"}${n.gates.length ? ` · ${n.gates.length} waygate${n.gates.length === 1 ? "" : "s"}` : " · no waygate"}${n.here ? " · you are here" : ""}</title>
      <rect x="${cx - cw / 2 + 8}" y="${cy - 34}" width="${cw - 16}" height="72" rx="10"
            fill="${esc(pal.base || "#242a24")}" stroke="${esc(n.here ? (pal.accent || "#c9a227") : (pal.edge || "#333"))}" stroke-width="${n.here ? 2.5 : 1}"/>
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" class="map-label" fill="${esc(pal.accent || "#9a9")}">${esc(n.name)}</text>
      <text x="${cx}" y="${cy + 10}" text-anchor="middle" class="map-visits">${n.count} place${n.count === 1 ? "" : "s"}</text>
      ${n.gates.length ? `<text x="${cx}" y="${cy + 26}" text-anchor="middle" class="map-visits">◈ ${hub ? "hub" : n.gates.length + " gate" + (n.gates.length === 1 ? "" : "s")}</text>` : ""}
      ${n.here ? `<circle cx="${cx - cw / 2 + 20}" cy="${cy - 22}" r="5" class="map-here-dot" fill="${esc(pal.accent || "#c9a227")}"/>` : ""}
    </g>`;
  }).join("");
  const rows = Math.ceil(nodes.length / cols);
  // SNG-203 §3 / 2B: the shared, PUBLIC state of the valley's greater arcs — everyone sees where they stand.
  // The arcs' hidden direction stays sealed; only the current stage's public face shows. An arc can be pushed
  // BOTH ways: ⤴ advanced, ⤵ receded (pulled back — a feature of a shared world, not a bug), ⚔ contested
  // (this world and the rest of the valley pulling opposite ways).
  const arcs = worldArcsPublic(CONTENT, character);
  const arcMark = a => a.contested ? "⚔" : a.direction === "advanced" ? "⤴" : a.direction === "receded" ? "⤵" : "";
  const arcCls = a => a.contested ? "contested" : a.direction === "advanced" ? "advanced" : a.direction === "receded" ? "receded" : "";
  const arcPanel = arcs.length ? `<div class="world-arcs">
    <h3 class="world-arcs-head">The World Stands…</h3>
    <p class="hint" style="margin:0 0 8px">The valley's greater arcs, and where they've reached — shared canon, the same for every traveler. Arcs move both ways: what one traveler pushes forward, another can pull back.</p>
    ${arcs.map(a => `<div class="world-arc ${arcCls(a)}">
      <div class="world-arc-top"><span class="world-arc-name">${esc(a.name)}</span><span class="world-arc-stage">${esc(a.stageName)} · ${a.stageNum}/${a.total}${arcMark(a) ? " " + arcMark(a) : ""}</span></div>
      <div class="world-arc-track">${Array.from({ length: a.total }, (_, i) => `<span class="wat-pip ${i < a.stageNum ? "on" : ""}"></span>`).join("")}</div>
      <p class="world-arc-face">${esc(a.publicFace)}</p>
    </div>`).join("")}
  </div>` : "";
  chrome(`<div class="screen" style="max-width:900px">
    <h2>World Map</h2>
    <p class="hint" style="margin-bottom:8px">${nodes.length} regions${nodes.reduce((n, r) => n + r.gates.length, 0) ? ` · ${nodes.reduce((n, r) => n + r.gates.length, 0)} waygates` : ""}. The scale where the question is <em>which Reach am I in</em>.</p>
    ${mapTierBar()}
    <div class="graph-wrap"><svg id="skill-svg" viewBox="0 0 800 ${Math.max(220, rows * ch + 30)}" class="world-map" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">${cells}</g></svg></div>
    ${arcPanel}
    <button class="btn secondary" id="map-back" style="margin-top:12px">Back</button>
  </div>`);
  for (const g of app.querySelectorAll("[data-mapregion]")) g.onclick = () => { mapTier = "region"; mapFocus = g.dataset.mapregion; renderMap(); };
  setGraphSurface("world"); wireSkillGraphViewport();   // SNG-168: the world tier can pan and zoom now
  wireMapTierBar();
  document.getElementById("map-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

/** LOCATION tier — the interior. THE TIER THAT DID NOT EXIST. Sub-places and any place promoted
 *  out of this one (SNG-154's parentId), drawn around their container so containment is finally
 *  something you can SEE rather than something the engine merely asserts. */
function renderMapLocation(locationId) {
  const { host, children } = locationTierNodes(character, CONTENT, locationId);
  const laid = interiorLayout(children);
  const name = host?.name || CONTENT.locations[locationId]?.name || locationId;
  const nodes = laid.map((c, i) => `<g class="map-node ${c.visited ? "" : "unvisited"} ${c.promoted ? "reachable" : ""}" data-mapinner="${esc(c.id)}" data-innerkind="${esc(c.kind)}">
      <title>${esc(c.name)}${c.promoted ? " — a place of its own now, still inside " + esc(name) : ""}${c.note ? " — " + esc(c.note) : ""}${c.visited ? "" : " (heard of, not seen)"}</title>
      <circle class="hit" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="22"/>
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.promoted ? 11 : 8}"/>
      ${/* CCODE-11: stagger the label's distance by index so two adjacent ring nodes can never put
            their labels in the same horizontal band — measured 3 colliding pairs in the Edge
            District (long authored names) before this. The full name stays in the <title>. */""}
      <text x="${c.x.toFixed(1)}" y="${(c.y + (c.y > 230 ? 26 + (i % 2) * 14 : -14 - (i % 2) * 14)).toFixed(1)}" text-anchor="middle" class="map-label">${esc(c.name.length > 20 ? c.name.slice(0, 19) + "…" : c.name)}</text>
    </g>`).join("");
  chrome(`<div class="screen" style="max-width:900px">
    <h2>${esc(name)} — inside</h2>
    <p class="hint" style="margin-bottom:8px">${children.length ? `${children.length} place${children.length === 1 ? "" : "s"} within.` : "Nothing recorded inside here yet — the places you visit and the GM names will appear here."} A ringed node is somewhere that grew into a place of its own.</p>
    ${mapTierBar()}
    <div class="graph-wrap"><svg id="skill-svg" viewBox="0 0 800 460" class="world-map" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
      <circle cx="400" cy="230" r="34" class="map-node here"/>
      <text x="400" y="235" text-anchor="middle" class="map-icon">${iconForTags(host?.tags || [])}</text>
      <text x="400" y="286" text-anchor="middle" class="map-label">${esc(name)}</text>
      ${laid.map(c => `<line x1="400" y1="230" x2="${c.x.toFixed(1)}" y2="${c.y.toFixed(1)}" class="map-edge"/>`).join("")}
      ${nodes}
    </g></svg></div>
    <button class="btn secondary" id="map-back" style="margin-top:12px">Back</button>
  </div>`);
  // a promoted interior is a real location — you can step into ITS interior too (nesting)
  for (const g of app.querySelectorAll("[data-mapinner]")) g.onclick = () => {
    if (g.dataset.innerkind === "location" && CONTENT.locations[g.dataset.mapinner]) { mapFocus = g.dataset.mapinner; renderMap(); }
  };
  setGraphSurface("location"); wireSkillGraphViewport();   // SNG-168: the location tier too
  wireMapTierBar();
  document.getElementById("map-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

function wireMapTierBar() {
  for (const b of app.querySelectorAll("[data-maptier]")) b.onclick = () => {
    mapTier = b.dataset.maptier;
    mapFocus = b.dataset.mapfocus || null;
    renderMap();
  };
}

function renderMap(selectedId = null) {
  if (mapTier === "world") return renderMapWorld();
  if (mapTier === "location") return renderMapLocation(mapFocus);
  const focusRegion = mapFocus || currentRegionId();
  // CCODE-12: call the TESTED function instead of re-deriving it here. The inline filter this
  // replaces was written 90 minutes after regionTierNodes shipped with 8 passing tests, and dropped
  // the region-boundary edge filtering the real one does — so an edge leaving the region drew as if
  // it belonged to it. The reachability audit caught its own author; this is that finding closed.
  const { locations: locs, edges: regionEdges } = regionTierNodes(CONTENT, character, focusRegion);
  const here = character.currentLocationId;
  const connectedToHere = CONTENT.locations[here]?.connections || [];
  // CCODE-12: edges come from regionTierNodes too. The inline version this replaces accepted ANY
  // connection whose target merely existed in CONTENT.locations — including targets in a DIFFERENT
  // region, which at the region tier drew a line to a node that isn't on the canvas. That is the
  // untested divergence the audit predicted from the duplicate existing at all.
  const edges = regionEdges;
  const stage = character.worldState?.eventStages?.water_crisis?.stage ?? 1;
  const isVisited = id => (character.placeMemory?.[id]?.visits || 0) > 0 || id === here;
  const isKnown = id => isPlaceKnown(character, id, CONTENT.locations); // SNG-117: heard-of / adjacent / en-route, not just visited
  // SNG-046 Layer 1: every location gets stable coords (authored kept; coordless + generated
  // placed deterministically), a tag-derived icon, and a disposition terrain tint.
  const pos = autoMapPositions(locs);
  const kg = mapShowKG ? knownOverlay(character, pos, CONTENT) : []; // SNG-083: people AND rumours
  // SNG-082: real terrain — each region drawn as a palette-filled hull of its locations. Data-driven
  // (regions.json), so a generated place inherits the right ground. Three regions LOOK WRONG on purpose.
  const WRONG = { the_pattern_reach: "wrong-noneuclid", the_veiled_reach: "wrong-lying", the_numinous_reach: "wrong-uncertain" };
  const EXPANDING = new Set(["radiant_wastes", "unspooling", "the_scour", "the_ceaseless", "scour", "ceaseless"]);
  const regionOf = {};
  for (const l of locs) if (l.regionId) (regionOf[l.regionId] = regionOf[l.regionId] || []).push(pos[l.id]);
  const terrain = (CONTENT.regions || []).map(rg => {
    const pts = regionOf[rg.regionId]; if (!pts || !pts.length) return "";
    const pal = rg.palette || {}; const shape = pts.length >= 3 ? regionShape(pts, 34) : null;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length, cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const cls = `map-region ${WRONG[rg.regionId] || ""} ${EXPANDING.has(rg.regionId) ? "expanding" : ""}`;
    const body = shape
      ? `<polygon points="${shape.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" class="${cls}" fill="${esc(pal.base || "#2a2f28")}" stroke="${esc(pal.edge || pal.base || "#333")}"><title>${esc(rg.name + " — " + (rg.terrain || ""))}</title></polygon>`
      : `<circle cx="${cx}" cy="${cy}" r="46" class="${cls}" fill="${esc(pal.base || "#2a2f28")}" stroke="${esc(pal.edge || "#333")}"><title>${esc(rg.name)}</title></circle>`;
    return `${body}<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" class="map-region-label" fill="${esc(pal.accent || "#8a8")}">${esc(rg.name)}</text>`;
  }).join("");
  const svg = `<svg id="skill-svg" viewBox="0 0 800 440" class="world-map" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    <g class="map-terrain">${terrain}</g>
    <text x="20" y="30" class="map-title">THE VALLEY OF ECHOES</text>
    <text x="20" y="50" class="map-sub">Day ${readClock(character.clock).day} · Water Crisis stage ${stage}${mapShowKG ? " · showing what you know" : ""}</text>
    ${edges.map(([a, b]) => { const A = pos[a], B = pos[b]; const spine = a === "the_axis_gate" || b === "the_axis_gate" || a === "the_crossing" || b === "the_crossing";
      return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="map-edge ${a === here || b === here ? "active" : ""} ${spine ? "spine" : ""}"/>`; }).join("")}
    ${locs.map((l, li) => {
      const P = pos[l.id];
      const visited = isVisited(l.id);
      const reachable = canTravelBetween(here, l.id, CONTENT.locations, character.placeEdges);
      const pm = character.placeMemory?.[l.id];
      const dl = Math.max(0, Math.min(4, l.dangerLevel | 0)); // SNG-080: graduated danger, findable on the map
      const cls = `map-node ${terrainClass(l)} dl${dl} ${l.id === here ? "here" : ""} ${reachable ? "reachable" : ""} ${visited ? "" : "unvisited"} ${dl >= 3 ? "danger" : ""} ${selectedId === l.id ? "selected" : ""}`;
      const known = isKnown(l.id); // SNG-117
      const tip = visited
        ? `${l.name}${l.id === here ? " — you are here" : ""}${pm?.visits ? ` · ${pm.visits} visit${pm.visits > 1 ? "s" : ""}` : ""}${dl >= 1 ? ` · ${dangerLabel(dl)}` : ""}${reachable ? " · one travel away" : ""}`
        : known
          ? `${l.name} — you know of it, not yet been${reachable ? " · one travel away" : ""}`
          : `Unknown place — you've only heard of it${reachable ? " · one travel away" : ""}`;
      return `<g class="${cls}" data-mapsel="${esc(l.id)}">
        <title>${esc(tip)}</title>
        <circle class="hit" cx="${P.x}" cy="${P.y}" r="24"/>
        ${dl >= 2 ? `<circle class="danger-ring dl${dl}" cx="${P.x}" cy="${P.y}" r="${(l.id === here ? 14 : 10) + 4}"/>` : ""}
        <circle cx="${P.x}" cy="${P.y}" r="${l.id === here ? 14 : 10}"/>
        ${visited ? `<text x="${P.x}" y="${P.y + 5}" text-anchor="middle" class="map-icon">${iconForTags(l.tags)}</text>` : ""}
        ${mapShowSub ? (() => { const sps = Object.values(character.placeMemory?.[l.id]?.subPlaces || {}); return sps.slice(0, 6).map((sp, si) => {
          const ang = (si / Math.max(1, Math.min(sps.length, 6))) * Math.PI * 2 - Math.PI / 2;
          const sx = P.x + Math.cos(ang) * 22, sy = P.y + Math.sin(ang) * 22;
          return `<circle cx="${sx}" cy="${sy}" r="4" class="map-satellite ${sp.visited ? "visited" : "heard"}"><title>${esc(sp.name)}${sp.note ? " — " + esc(sp.note) : ""}${sp.visited ? "" : " (heard of)"}</title></circle>`;
        }).join(""); })() : ""}
        <text x="${P.x}" y="${P.y + (P.y > 300 ? 32 : -20)}" text-anchor="middle" class="map-label">${esc(known ? l.name : "?")}</text>
        ${visited && pm?.visits > 1 ? `<text x="${P.x}" y="${P.y + (P.y > 300 ? 46 : -6)}" text-anchor="middle" class="map-visits">×${pm.visits}</text>` : ""}
      </g>`; }).join("")}
    ${kg.map(e => `<g class="map-kg ${e.kind} ${e.discovered ? "met" : "heard"}" ${e.topicId ? `data-kgtopic="${esc(e.topicId)}"` : ""}>
        <title>${esc(e.label)}${e.kind === "rumour" ? " — a thread you've only heard of" + (e.note ? ": " + esc(e.note) : "") : e.discovered ? " — you've met them" : " — you've only heard of them"}</title>
        ${e.kind === "rumour"
          ? `<rect x="${e.x - 5}" y="${e.y - 5}" width="10" height="10" transform="rotate(45 ${e.x} ${e.y})"/>`
          : `<circle cx="${e.x}" cy="${e.y}" r="6"/>`}
        <text x="${e.x}" y="${e.y - 9}" text-anchor="middle" class="map-kg-label">${esc(e.label.slice(0, 18))}</text>
      </g>`).join("")}
  </g></svg>`;
  // details panel for the selected node — travel is an explicit button, never a stray click
  let details = "";
  if (selectedId && CONTENT.locations[selectedId]) {
    const l = CONTENT.locations[selectedId];
    const visited = isVisited(l.id);
    const known = isKnown(l.id); // SNG-117
    const pm = character.placeMemory?.[l.id];
    // SNG-330: SYMMETRIC. Reading only `connectedToHere` lost the Travel button on any place whose
    // reciprocal edge was written to AUTHORED content and therefore never saved.
    const reachable = canTravelBetween(here, l.id, CONTENT.locations, character.placeEdges);
    details = `<div class="map-details">
      <div class="map-details-head">
        <h3>${esc(known ? l.name : "An unknown place")}${!visited && known ? ` <span class="hint">— known of, not yet been</span>` : ""}</h3>
        ${(l.dangerLevel | 0) >= 1 ? `<span class="rep-band danger-chip dl${Math.min(4, l.dangerLevel | 0)}">${esc(dangerLabel(Math.min(4, l.dangerLevel | 0)))}</span>${infoDot("world.danger")}` : `<span class="rep-band trusted">safe</span>`}
        ${visited ? (() => { const d = locationDensity(l, CONTENT.substrateModel); if (d == null) return ""; const lab = d < 0.34 ? "thin lattice" : d > 0.66 ? "dense lattice" : "even lattice"; return `<span class="rep-band" title="Substrate density here: ${Math.round(d * 100)}%. Continuous craft thrives dense, starves thin; Returned craft the reverse.">${lab}</span>`; })() : ""}
        ${l.id === here ? `<span class="rep-band trusted">you are here</span>` : ""}
        ${(() => { const s = l.communityId ? standingWith(character, l.communityId, CONTENT.rules) : null; return s?.score ? `<span class="rep-band ${s.band}" title="Your standing here — ${s.band} (${s.score})">${esc(s.band)}</span>` : ""; })()}
      </div>
      ${(() => { const ppl = knownPeopleAt(character, l.id, { locations: CONTENT.locations, npcs: CONTENT.npcs }); return ppl.length ? `<div class="loc-people"><span class="hint">You know here: </span>${ppl.map(p => `<span class="known-here">${esc(p.name)} <span class="cost">${esc(p.label)}</span></span>`).join(", ")}</div>` : ""; })()}
      ${visited && locationImageFor(l.id) ? `<img class="location-image" src="${esc(locationImageFor(l.id))}" alt="${esc(l.name)}" data-lightbox="location" loading="lazy" onerror="this.style.display='none'">` : ""}
      ${visited
        ? `<p class="map-details-desc">${esc(l.descriptionSeed)}</p>${/* SNG-076: authored descriptionSeed renders IN FULL */""}
           ${(() => { const vs = vectorSummary(character, l.id, l, CONTENT.spectrums, CONTENT.rules); return vs ? `<div class="place-vectors">${esc(vs)}</div>` : ""; })()}
           ${pm?.visits ? `<div class="hint">${pm.visits} visit${pm.visits > 1 ? "s" : ""}${pm.lastVisit != null ? ` · last on day ${pm.lastVisit}` : ""}</div>` : ""}
           ${pm?.notes?.length ? `<div class="map-details-notes">${pm.notes.slice(-3).map(n => `<div class="codex-fact">${esc(n)}</div>`).join("")}</div>` : ""}
           ${Object.keys(pm?.subPlaces || {}).length ? `<div class="sub-places"><span class="hint">Places within: </span>${Object.entries(pm.subPlaces).map(([slug, sp]) => `<button class="codex-link ${sp.visited ? "" : "dead"}" data-subgo="${esc(slug)}" data-subloc="${esc(l.id)}" title="${esc(sp.note || (sp.visited ? "you have been here" : "heard of only"))}">${esc(sp.name)}</button>`).join(" ")}</div>` : ""}`
        : `<p class="map-details-desc">You've heard travelers mention it, nothing more. Someone would have to go and see.</p>`}
      ${l.id !== here ? (reachable
        ? `<button class="btn" id="map-travel" data-dest="${esc(l.id)}" style="margin-top:8px">Travel here (+${ADVANCE.travel}h)</button>${(() => {
            // SNG-180: how far this actually is, in the world's own geometry. Erik's year-to-walk
            // scale makes the number mean something — a neighbouring Reach is weeks and your
            // antipode is most of a year, which is what turns waygates into infrastructure.
            const days = walkingDays(CONTENT.locations[character.currentLocationId], l);
            return days == null ? "" : `<div class="hint" style="margin-top:4px">${days < 1 ? "less than a day" : `about ${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`} on foot — ${days > 40 ? "a waygate is the difference between a journey and a life" : "walkable, if you have the season for it"}.</div>`;
          })()}`
        + `<button class="opt" id="map-lookinside" data-inside="${esc(l.id)}" style="margin:8px 0 0 6px" title="What's within this place">⌂ Look inside</button>`
        : `<div class="hint" style="margin-top:6px">Not directly reachable from ${esc(CONTENT.locations[here]?.name || "here")}${(() => {
            // SNG-330 hardening 1 — ⚠️ SAY WHY, AND SAY WHICH. "travel via a connected place" told the player
            // nothing they did not already know; the data to name one is sitting in `connections`. A refusal
            // that does not point anywhere is a dead end wearing an explanation.
            const via = (CONTENT.locations[l.id]?.connections || [])
              .filter(c => canTravelBetween(here, c, CONTENT.locations, character.placeEdges))
              .map(c => CONTENT.locations[c]?.name).filter(Boolean).slice(0, 2);
            return via.length ? ` — go by way of ${via.join(" or ")}.` : " — travel via a connected place.";
          })()}</div>`) : ""}
      ${(() => { // SNG-148: standing at a gate, aiming at another gate — routing decides (named/hub); never a failure
        const r = l.id !== here ? resolveWaygateTransit({ character, destId: l.id, locations: CONTENT.locations }) : null;
        if (!r) return "";
        const destName = CONTENT.locations[r.destId]?.name || l.name;
        const note = r.routed === "hub" && r.destId !== l.id
          ? ` — the gate carries you to ${esc(destName)}, the hub (${!r.known ? "an undiscovered gate can't be aimed at" : "beyond your wayfaring to aim true"})` : ` to ${esc(destName)}`;
        return `<button class="btn" id="map-waygate" data-wgdest="${esc(r.destId)}" style="margin-top:6px">◈ Step through the waygate${note} (+${ADVANCE.travel}h)</button>`;
      })()}
    </div>`;
  }
  // SNG-243 §4: the gate NETWORK panel — when you STAND at a networked gate, fold direct to any gate you know,
  // hub-and-spoke, for a hop cost (a fraction of the overland time + an energy toll). The made gate's default
  // endpoint leads. This is the infrastructure surface: the network is legible, not buried in per-place routing.
  const netGates = networkGatesFrom(character, CONTENT.locations, { walkingDays });
  const netBlock = (isNetworkGate(CONTENT.locations[here]) && netGates.length) ? `
    <div class="net-panel">
      <div class="net-panel-title">◈ The gate network</div>
      <div class="hint" style="margin:0 0 6px">You stand at ${esc(CONTENT.locations[here]?.name || "a gate")}, a networked waygate — fold direct to any gate you've reached. A hop costs a fraction of the road plus a wayfaring toll.</div>
      ${netGates.map(g => `<button class="net-hop" data-nethop="${esc(g.id)}" title="${g.overlandDays ? `about ${g.overlandDays} day${g.overlandDays === 1 ? "" : "s"} on foot — the gate makes it ${g.cost.hours}h` : "a short fold"}">
        <span class="net-hop-name">${esc(g.name)}${g.isHub ? ` <span class="net-tag">hub</span>` : ""}${g.isDefault ? ` <span class="net-tag net-tag-default">default</span>` : ""}</span>
        <span class="net-hop-cost">+${g.cost.hours}h · ${g.cost.energy}⚡</span></button>`).join("")}
    </div>` : "";
  chrome(`<div class="screen" style="max-width:900px">
    <h2>${esc((CONTENT.regions || []).find(r => r.regionId === focusRegion)?.name || "Region")}</h2>
    ${/* SNG-154 stage 6: this count is now the REGION's, not the world's — and it is derived, so it
          can't drift the way the old hardcoded "92 places across 24 regions" line silently did. */""}
    <p class="hint" style="margin-bottom:8px">${locs.length} place${locs.length === 1 ? "" : "s"} in this region, ground coloured by disposition. Gold ring: you are here. <strong>Scroll to zoom, drag to pan.</strong></p>
    ${mapTierBar()}
    <div style="margin-bottom:8px"><button class="opt ${mapShowKG ? "selected" : ""}" id="map-kg-toggle" title="People you've met (solid) and threads you've only heard of (dimmed diamonds) — where they live">${mapShowKG ? "✓ " : ""}Show what you know</button>
      <button class="opt ${mapShowSub ? "selected" : ""}" id="map-sub-toggle" title="The places WITHIN each location (satellites around each node)" style="margin-left:6px">${mapShowSub ? "✓ " : ""}Show sub-places</button>
      ${mapShowKG && !kg.length ? `<span class="hint" style="margin-left:8px">You haven't met anyone or heard a rumour yet — the world is still a rumour. Play on.</span>` : mapShowKG ? `<span class="hint" style="margin-left:8px">◆ dimmed = heard of · ● solid = met</span>` : ""}</div>
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
        <button id="gz-me" title="Centre on me">◎</button>
      </div>
      ${svg}
    </div>
    ${netBlock}
    ${details}
    <button class="btn secondary" id="map-back" style="margin-top:12px">Back</button>
  </div>`);
  setGraphSurface("map");   // SNG-168: the region tier keeps its own view
  wireSkillGraphViewport();
  const meBtn = document.getElementById("gz-me");
  if (meBtn) meBtn.onclick = () => { const p = pos[here]; if (!p) return; const k = 2.2; graphViews[graphSurface] = { k, tx: 400 - p.x * k, ty: 220 - p.y * k };
    const vp = document.querySelector("#skill-svg .graph-vp"); if (vp) vp.setAttribute("transform", `translate(${graphViews[graphSurface].tx} ${graphViews[graphSurface].ty}) scale(${k})`); };
  document.getElementById("map-kg-toggle").onclick = () => { mapShowKG = !mapShowKG; renderMap(selectedId); };
  document.getElementById("map-sub-toggle").onclick = () => { mapShowSub = !mapShowSub; renderMap(selectedId); };
  for (const g of app.querySelectorAll("[data-kgtopic]")) g.onclick = () => renderCodexScreen("", g.dataset.kgtopic);
  for (const g of app.querySelectorAll("[data-mapsel]")) g.onclick = () => renderMap(g.dataset.mapsel === selectedId ? null : g.dataset.mapsel);
  wireMapTierBar(); // SNG-154 stage 6
  const insideBtn = document.getElementById("map-lookinside");
  if (insideBtn) insideBtn.onclick = () => { mapTier = "location"; mapFocus = insideBtn.dataset.inside; renderMap(); };
  const travelBtn = document.getElementById("map-travel");
  if (travelBtn) travelBtn.onclick = () => travelTo(travelBtn.dataset.dest);
  const wgBtn = document.getElementById("map-waygate");
  if (wgBtn) wgBtn.onclick = () => travelTo(wgBtn.dataset.wgdest); // SNG-148: the click IS the confirmed intent; transit is real travel
  // SNG-243 §4: a network hop — fold to a known gate across the network, paying the gate-hop cost (not the flat travel hours).
  for (const b of app.querySelectorAll("[data-nethop]")) b.onclick = () => {
    const g = netGates.find(x => x.id === b.dataset.nethop);
    travelTo(b.dataset.nethop, { cost: g ? g.cost : gateHopCost(0) });
  };
  for (const b of app.querySelectorAll("[data-subgo]")) b.onclick = () => {
    const pm = character.placeMemory?.[b.dataset.subloc];
    const sp = pm?.subPlaces?.[b.dataset.subgo];
    if (!sp) return;
    if (b.dataset.subloc !== character.currentLocationId) { alert("Travel to " + (CONTENT.locations[b.dataset.subloc]?.name || "that place") + " first — then head to the " + sp.name + "."); return; }
    renderPlay(character.activeScene?.lastTurn || null, {});
    onFreeform(`Head to the ${sp.name}`);
  };
  document.getElementById("map-back").onclick = () => { graphViews[graphSurface] = null; renderPlay(character.activeScene?.lastTurn || null, {}); };
}

// ---------- skill KG graph (SNG-011 Phase 3a — rendered like the world map) ----------

// ---------- SNG-073: THE SKILL WHEEL — the skill tree IS the great circle ----------
// Polar layout, radius = tier. 24 tradition nodes on the ring (read from traditions.json, never
// hardcoded); each people's abilities radiate INWARD (V at the node, I near the centre — depth is
// mastery). Folk crafts at the CENTRE (open to all). Precursor OUTSIDE the ring (the substrate).
// Known braids drawn as connections — cross-pole braids as the DIAMETER through the centre. The
// antipode is dark and struck through, directly across the wheel. Access, lore and geometry, one picture.

const WHEEL = { size: 920, cx: 460, cy: 460, rNode: 405, rInner: 120, rFolk: 66, rPrecursor: 452 }; // SNG-218 §3 (Erik): wider tier band + more room between rings to cut overlap
function wheelTierRadius(tier) { const t = Math.max(1, Math.min(5, tier || 1)); return WHEEL.rInner + (t - 1) / 4 * (WHEEL.rNode - WHEEL.rInner); }
function wheelAngle(posIndex, n) { return (posIndex / (n || 24)) * Math.PI * 2 - Math.PI / 2; }
function wheelPt(ang, r) { return { x: WHEEL.cx + Math.cos(ang) * r, y: WHEEL.cy + Math.sin(ang) * r }; }

/** Build every ability's position + state for the wheel. Pure over CONTENT + character. */
function buildWheelModel() {
  const idx = CONTENT.traditionIndex;
  const order = ringOrder(idx);              // 24 tradition ids by ring position
  const n = order.length || 24;
  const posOf = t => order.indexOf(t);
  const cat = fullCatalog();
  const owned = new Set((character.abilities || []).map(a => a.abilityId));
  const domains = character.domains || {};
  const nodes = [];
  // group abilities: pole-tradition spokes · folk centre · precursor outer ring · SNG-202 braids by composition
  const byTrad = {}, folk = [], precursor = [], braidAbs = [];
  for (const ab of Object.values(cat)) {
    if (ab.minted && Array.isArray(ab.minted.from) && ab.minted.from.length === 2) { braidAbs.push(ab); continue; } // SNG-202: placed between its two axes, not on a parent's spoke
    const trad = traditionOf(ab, idx);
    if (ab.powerSystem === "precursor") { precursor.push(ab); continue; }
    if (trad && isFolkTradition(trad, idx)) { folk.push(ab); continue; }
    if (trad && posOf(trad) >= 0) { (byTrad[trad] = byTrad[trad] || []).push(ab); continue; }
    if (!trad || ab.powerSystem === "learned") { folk.push(ab); continue; } // ungoverned/learned → centre
  }
  const mk = (ab, x, y, ang, extra = {}) => {
    const trad = traditionOf(ab, idx);
    const v = domainAccess(ab, ab.levelReq || 1, domains, idx);
    const isOwned = owned.has(ab.id);
    // SNG-218 §1: ONE gate. canLearnAbility runs every learn-gate term (level + domain + attribute + the
    // capstone STANDING bar + capacity + affordability), so `reachable` can never again disagree with the
    // Learn action — the Cut-Thread bug was `reachable` checking level but not standing. `learnGate` tags
    // WHY a blocked craft is blocked; `aspirational` = not owned, blocked ONLY by standing (earnable "later",
    // §3 renders it dimmed rather than hard-barred).
    const g = isOwned ? { ok: false, gate: "owned" } : canLearnAbility(character, ab.id, cat, CONTENT.rules, { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: idx });
    nodes.push({ id: ab.id, name: ab.name, tier: tierOf(ab.levelReq), levelReq: ab.levelReq || 1, cls: trad || ab.powerSystem || "learned",
      x, y, ang, owned: isOwned, band: v.band, allowed: v.allowed, penalty: v.penalty, closed: v.band === "closed",
      barred: !v.allowed && v.band !== "closed", dim: v.penalty > 1, isFolk: trad && isFolkTradition(trad, idx), isPrecursor: ab.powerSystem === "precursor",
      // SNG-124: function overlay + cost-at-a-glance.
      functions: ab.functions || [], families: familiesOfAbility(ab, FN_INDEX), energyCost: ab.energyCost ?? null,
      effCost: (() => { try { return effectiveEnergyCost(ab, character, CONTENT.rules); } catch { return ab.energyCost ?? null; } })(),
      reachable: g.ok, learnGate: g.ok ? null : (g.gate || "blocked"), learnGateWhy: g.ok ? null : (g.why || null),
      aspirational: !isOwned && !g.ok && g.gate === "standing", // blocked only by standing → earnable "later"
      recommended: wheelRecommended.has(ab.id), // SNG-218 §3: a level-up suggestion pick, lit on the wheel
      precursorUnlocked: ab.powerSystem === "precursor" && (character.precursorAccess || []).includes(ab.id), // SNG-129: narrative-earned
      ...extra });
  };
  // spokes: SNG-202B §1 — the tradition ANCHORS (a pure craft stays on its ring-angle, the degenerate case =
  // today's wheel), and each craft's COMPOSITION rotates it a bounded amount off the spoke: a mostly-death
  // craft that adopts order sits near the death axis rotated toward order. The lean is deterministic (from
  // the craft's `axes`, projected onto the ring via traditionIndex.axisPoles) and clamped, so it reads as a
  // lean, never a teleport. A residual micro-fan only separates composition-identical crafts of the same tier.
  const axisPoles = idx?.axisPoles || {};
  for (const [trad, abs] of Object.entries(byTrad)) {
    const ang0 = wheelAngle(posOf(trad), n);
    const byTier = {};
    for (const ab of abs) (byTier[ab.levelReq || 1] = byTier[ab.levelReq || 1] || []).push(ab);
    for (const [lv, list] of Object.entries(byTier)) {
      const r = wheelTierRadius(Number(lv));
      const m = list.length;
      list.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, i) => {
        const lean = leanOffset(ang0, compositionAngle(ab.axes, axisPoles, n), n);
        // SNG-218 §3 (Erik): DE-OVERLAP same-tier crafts. Spread them RADIALLY across a band (keeps them on the
        // tradition's spoke — the "belongs to this people" reading — while pulling them off one another), with a
        // light alternating angular fan so a dense tier zig-zags instead of stacking on a single arc.
        const rStagger = m > 1 ? ((i / (m - 1)) - 0.5) * Math.min(46, 16 + m * 5) : 0;
        const fan = m > 1 ? ((i % 2) * 2 - 1) * 0.026 + (i - (m - 1) / 2) * 0.006 : 0;
        const a = ang0 + lean + fan; const p = wheelPt(a, r + rStagger); mk(ab, p.x, p.y, a, { lean });
      });
    }
  }
  // folk centre: SNG-218 §3 (Erik) — the open-to-all crafts get their OWN organized layout, a small concentric
  // "dartboard" of 1–3 rings instead of one crowded circle, so they're distinguishable and spread. The zoom-LOD
  // names them as you zoom into the centre (folk are reachable → midZoom labels them). Rings fit inside rInner.
  const folkSorted = folk.sort((a, b) => a.name.localeCompare(b.name));
  const fN = folkSorted.length;
  const fRings = fN <= 8 ? 1 : fN <= 20 ? 2 : 3;
  const fPer = Math.ceil(fN / fRings);
  const fInner = WHEEL.rFolk * 0.5, fOuter = WHEEL.rInner - 22;
  folkSorted.forEach((ab, i) => {
    const ring = Math.min(fRings - 1, Math.floor(i / fPer));
    const start = ring * fPer, count = Math.min(fPer, fN - start), idxInRing = i - start;
    const rr = fRings === 1 ? WHEEL.rFolk : fInner + ring * ((fOuter - fInner) / (fRings - 1));
    const stag = ring % 2 ? Math.PI / Math.max(1, count) : 0; // offset alternate rings so they interleave, not align
    const a = (idxInRing / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2 + stag;
    const p = wheelPt(a, rr); mk(ab, p.x, p.y, a, { folkRing: ring });
  });
  // precursor: outside the ring, spread all the way round (not axis-aligned)
  precursor.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, i) => {
    const a = (i / Math.max(1, precursor.length)) * Math.PI * 2 - Math.PI / 2; const p = wheelPt(a, WHEEL.rPrecursor); mk(ab, p.x, p.y, a);
  });
  // SNG-202 §1: a braid is placed by its COMPOSITION — the angular midpoint of its two parents (shorter arc)
  // with radius pulled inward by how far apart they sit. Adjacent-tradition braids hug the rim between
  // neighbours; a cross-circle braid sinks toward the centre (and reads as "spans the circle"). A braid whose
  // parent is folk/ungoverned (no ring spoke) falls back to the resolvable spoke, else the folk centre — never
  // a fake angle. Deterministic (engine/wheelgeom.js), never a force layout (§4). Small stable nudge keeps a
  // cluster of centre-braids legible at 380px without breaking determinism.
  braidAbs.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, bi) => {
    const parents = (ab.minted.from || []).map(pid => { const p = cat[pid]; const tr = p ? traditionOf(p, idx) : null; return { tr, pos: tr != null && posOf(tr) >= 0 ? posOf(tr) : -1 }; });
    const [pa, pb] = parents.map(x => x.pos);
    const parentTrads = parents.map(x => x.tr).filter(Boolean); // SNG-202B §2: which spokes light up when this braid is selected
    if (pa >= 0 && pb >= 0) {
      const pl = braidPlacement(pa, pb, n);
      const nudge = pl.rFactor < 0.15 ? (bi % 3 - 1) * 0.12 : 0;                 // deep-centre braids: a stable, deterministic fan so they don't stack
      const r = WHEEL.rInner + (WHEEL.rNode - WHEEL.rInner) * pl.rFactor;
      const p = wheelPt(pl.ang + nudge, Math.max(WHEEL.rFolk + 18, r));
      mk(ab, p.x, p.y, pl.ang + nudge, { braid: true, antipodal: pl.antipodal, braidFrom: ab.minted.sourceNames || [], parentTrads });
    } else {
      const one = pa >= 0 ? pa : pb;
      if (one >= 0) { const a = wheelAngle(one, n); const p = wheelPt(a, WHEEL.rInner + 22); mk(ab, p.x, p.y, a, { braid: true, braidFrom: ab.minted.sourceNames || [], parentTrads }); }
      else { const a = -Math.PI / 2 + (bi * 0.5); const p = wheelPt(a, WHEEL.rFolk + 8); mk(ab, p.x, p.y, a, { braid: true, braidFrom: ab.minted.sourceNames || [], parentTrads }); }
    }
  });
  return { idx, order, n, nodes, posOf };
}

/** Classify + collect the KNOWN braids (discoveries) as drawable connections. */
function wheelBraids(model) {
  const idx = model.idx, cat = fullCatalog();
  const out = [];
  for (const d of character.discoveries || []) {
    const parts = (d.abilityIds || []).filter(id => cat[id]);
    if (parts.length < 2) continue;
    const t1 = traditionOf(cat[parts[0]], idx), t2 = traditionOf(cat[parts[1]], idx);
    if (!t1 || !t2) continue;
    let kind = "cross-axis";
    if (antipodeOf(t1, idx) === t2) kind = "cross-pole";
    else if (t1 === t2) kind = "within";
    else if (ringDistance(t1, t2, idx) === 1) kind = "kin";
    out.push({ name: d.name, kind, t1, t2 });
  }
  return out;
}

// SNG-097: learn/deepen a craft directly from the skill wheel/graph selection, and SEE what an
// upgrade grants before spending. Shared by both views — pure over character + CONTENT, so the two
// panels can never drift from each other or from the Level-Up modal (same learnAbility/rankUpAbility).
function skillSelectionActions(ab) {
  if (!ab) return ""; // virtual/emergence node — no real ability to act on
  const rules = CONTENT.rules;
  const sp = character.skillPoints || 0;
  const owned = character.abilities.find(a => a.abilityId === ab.id);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;
  // the tier ladder — what every rank grants (owned = filled, the one you'd buy next = highlighted).
  // THIS is the "what does the upgrade do" the player asked for, made visible on select (not a hover).
  const ladder = (ab.tree || []).map(t => {
    const on = owned && t.rank <= owned.level;
    const isNext = owned ? t.rank === owned.level + 1 : t.rank === 1;
    return `<div class="skill-rung ${on ? "on" : ""} ${isNext ? "next" : ""}"><span class="skill-rung-dot">${on ? "●" : "○"}</span> <strong>r${t.rank} ${esc(t.name)}</strong>: ${esc(t.grants || "")}${t.cannot ? ` <span class="skill-rung-cannot">— cannot: ${esc(t.cannot)}</span>` : ""}</div>`;
  }).join("");
  const ladderBlock = ladder ? `<div class="skill-ladder">${ladder}</div>` : "";

  if (owned) {
    // ability-arch v2: depth is earned through use, never bought — show progress, not a buy button.
    const p = rankProgress(character, ab.id);
    return `<div class="skill-actions">${ladderBlock}<span class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</span></div>`;
  }
  // not owned → the learn path. SNG-218 §1: ONE gate. canLearnAbility runs EVERY term (level, domain,
  // attribute, the capstone STANDING bar, capacity, affordability), so this button and the wheel's
  // `reachable` flag can never disagree with learnAbility again — a standing-locked capstone (the Cut
  // Thread) now shows its real "deepen your standing" reason instead of a Learn button that then refuses.
  const ripe = aspirationRipe(character, ab.id, rules);
  const verdict = canLearnAbility(character, ab.id, fullCatalog(), rules, { free: ripe, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
  const cost = verdict.cost ?? learnPointCost(ab, character, CONTENT.skillCapacity, domainVerdict(ab));
  return `<div class="skill-actions">${ladderBlock}
    ${!verdict.ok
      ? `<span class="hint">🔒 ${esc(verdict.why || "not learnable yet")}</span>`
      : `<button class="btn" data-skilllearn="${esc(ab.id)}">Learn${ripe ? " (free — practiced)" : ` (${cost} pt${cost > 1 ? "s" : ""})`}</button>`}
  </div>`;
}

// Wire the learn/deepen buttons a details panel rendered. `rerender(id, status)` re-opens the same
// view with the node still selected and a status line — used by both wheel and graph.
function wireSkillSelectionActions(rerender) {
  for (const b of app.querySelectorAll("[data-skilllearn]")) b.onclick = () => {
    const id = b.dataset.skilllearn;
    const free = aspirationRipe(character, id, CONTENT.rules);
    const r = learnAbility(character, id, fullCatalog(), CONTENT.rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) { if (free) dropAspiration(character, id); saveCharacter(character); rerender(id, `Learned ${fullCatalog()[id]?.name}${free ? " — no point spent" : ""}.`); }
    else rerender(id, r.why);
  };
  // ability-arch v2: no data-skillrank handler — ranks are no longer bought here; depth is earned
  // through use (rank 2 auto) and a GM-marked defining moment (rank 3).
}

// SNG-129: the node SILHOUETTE for a function family (shape carries the primary family; color retained →
// redundant encoding for accessibility). Returns one SVG element centered at (cx,cy) with "radius" r.
function wheelNodeShape(kind, cx, cy, r, { fill, stroke, sw = 1.5, cls = "" } = {}) {
  const a = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" class="wnode-shape${cls ? " " + cls : ""}"`;
  const poly = pts => `<polygon points="${pts.map(p => `${(cx + p[0]).toFixed(1)},${(cy + p[1]).toFixed(1)}`).join(" ")}" ${a}/>`;
  switch (kind) {
    case "diamond":  return poly([[0, -r * 1.25], [r * 1.15, 0], [0, r * 1.25], [-r * 1.15, 0]]);
    case "triangle": return poly([[0, -r * 1.3], [r * 1.2, r * 0.9], [-r * 1.2, r * 0.9]]);
    case "hexagon":  { const p = []; for (let i = 0; i < 6; i++) { const ang = Math.PI / 6 + i * Math.PI / 3; p.push([Math.cos(ang) * r * 1.2, Math.sin(ang) * r * 1.2]); } return poly(p); }
    case "chevron":  return poly([[-r * 1.1, -r], [r * 0.2, -r], [r * 1.2, 0], [r * 0.2, r], [-r * 1.1, r], [-r * 0.2, 0]]);
    case "cross":    { const t = r * 0.42, R = r * 1.2; return poly([[-t, -R], [t, -R], [t, -t], [R, -t], [R, t], [t, t], [t, R], [-t, R], [-t, t], [-R, t], [-R, -t], [-t, -t]]); }
    case "shield":   return `<path d="M ${cx} ${(cy - r * 1.3).toFixed(1)} L ${(cx + r * 1.1).toFixed(1)} ${(cy - r * 0.5).toFixed(1)} L ${(cx + r * 1.1).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} Q ${cx} ${(cy + r * 1.5).toFixed(1)} ${(cx - r * 1.1).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} L ${(cx - r * 1.1).toFixed(1)} ${(cy - r * 0.5).toFixed(1)} Z" ${a}/>`;
    case "capsule":  { const w = r * 1.5, h = r * 0.95; return `<rect x="${(cx - w).toFixed(1)}" y="${(cy - h).toFixed(1)}" width="${(w * 2).toFixed(1)}" height="${(h * 2).toFixed(1)}" rx="${h.toFixed(1)}" ${a}/>`; }
    case "ring":     return `<circle cx="${cx}" cy="${cy}" r="${(r * 1.15).toFixed(1)}" fill="${fill === "#20242c" ? "#20242c" : "transparent"}" stroke="${stroke}" stroke-width="${(sw + 1).toFixed(1)}" class="wnode-shape${cls ? " " + cls : ""}"/>${fill !== "#20242c" ? `<circle cx="${cx}" cy="${cy}" r="${(r * 0.45).toFixed(1)}" fill="${fill}" stroke="none"/>` : ""}`;
    default:         return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" ${a}/>`;
  }
}

function renderSkillWheel(selectedId = null, status = "") {
  const idx = CONTENT.traditionIndex;
  if (!idx) { renderSkillGraph(selectedId); return; } // no ring loaded → fall back to the list graph
  const m = buildWheelModel();
  const domains = character.domains || {};
  const primary = domains.primary, secondary = domains.secondary;
  const antiP = primary ? antipodeOf(primary, idx) : null, antiS = secondary ? antipodeOf(secondary, idx) : null;
  const S = WHEEL;
  // the 24 tradition nodes on the ring + their spokes
  const ringNodes = m.order.map((t, i) => { const ang = wheelAngle(i, m.n); const p = wheelPt(ang, S.rNode); const st = (idx.stations || []).find(s => s.traditionId === t);
    const closed = t === antiP || t === antiS; const isPrimary = t === primary, isSecondary = t === secondary, isTertiary = t === domains.tertiary;
    const kin = primary && ringDistance(t, primary, idx) === 1;
    return { t, ang, ...p, pole: st?.pole || t, closed, isPrimary, isSecondary, isTertiary, kin }; });
  const braids = wheelBraids(m);
  const centerPt = { x: S.cx, y: S.cy };
  const nodeFor = t => ringNodes.find(r => r.t === t);
  // SNG-202B §2: the wheel as a browse surface. Click a tradition → its crafts + any braid with a parent in
  // it light up, its ring-neighbours dim-highlight, everything else fades, and the foreclosure line to its
  // antipode becomes visible geometry ("only a braid crosses"). Click a braid node → its two parent spokes
  // and the arc joining them light. Per-node relation is computed once here and stamped into the node class.
  const selTradOpp = wheelSelTrad ? antipodeOf(wheelSelTrad, idx) : null;
  const tradRelOf = (nd) => {
    if (!wheelSelTrad) return "";
    if (nd.braid) return (nd.parentTrads || []).includes(wheelSelTrad) ? "related" : "dim";
    if (nd.cls === wheelSelTrad) return "related";
    return ringDistance(nd.cls, wheelSelTrad, idx) === 1 ? "adjacent" : "dim";
  };
  const selBraid = selectedId ? m.nodes.find(x => x.id === selectedId && x.braid) : null;
  const selBraidParents = selBraid ? (selBraid.parentTrads || []).filter(t => nodeFor(t)) : [];

  const svg = `<svg id="skill-svg" viewBox="0 0 ${S.size} ${S.size}" class="world-map skill-wheel" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rNode}" class="wheel-ring"/>
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rInner}" class="wheel-inner"/>
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rFolk + 24}" class="wheel-folk-zone"/>
    <text x="${S.cx}" y="${S.cy - 2}" text-anchor="middle" class="wheel-center-label">FOLK</text>
    <text x="${S.cx}" y="${S.cy + 14}" text-anchor="middle" class="wheel-center-sub">open to all</text>
    <text x="${S.cx}" y="${S.cy - S.rPrecursor - 8}" text-anchor="middle" class="wheel-precursor-label">· PRECURSOR — the substrate, outside the poles ·</text>
    ${/* faint spokes */""}
    ${ringNodes.map(rn => { const inner = wheelPt(rn.ang, S.rInner); return `<line x1="${inner.x}" y1="${inner.y}" x2="${rn.x}" y2="${rn.y}" class="wheel-spoke ${rn.isPrimary ? "primary" : rn.isSecondary ? "secondary" : rn.isTertiary ? "tertiary" : rn.kin ? "kin" : rn.closed ? "closed" : ""}"/>`; }).join("")}
    ${/* antipode: struck through, dark, across the wheel */""}
    ${ringNodes.filter(r => r.closed).map(rn => { const opp = wheelPt(rn.ang, S.rNode + 18); return `<line x1="${S.cx}" y1="${S.cy}" x2="${opp.x}" y2="${opp.y}" class="wheel-strike"/>`; }).join("")}
    ${/* braids — known discoveries only */""}
    ${braids.map(b => { const A = nodeFor(b.t1), B = nodeFor(b.t2); if (!A) return "";
      if (b.kind === "cross-pole" && B) return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wheel-braid cross-pole"><title>${esc(b.name)} — a cross-pole braid: holding an axis whole</title></line>`;
      if (b.kind === "kin" && B) return `<path d="M ${A.x} ${A.y} Q ${S.cx + (A.x + B.x - 2 * S.cx) * 0.7} ${S.cy + (A.y + B.y - 2 * S.cy) * 0.7} ${B.x} ${B.y}" class="wheel-braid kin" fill="none"><title>${esc(b.name)} — a kin braid</title></path>`;
      if (B) return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wheel-braid cross-axis"><title>${esc(b.name)} — a cross-axis braid</title></line>`;
      return ""; }).join("")}
    ${/* SNG-202B §2: a clicked tradition's foreclosure line to its antipode — "only a braid crosses this axis" as geometry */""}
    ${(() => { if (!wheelSelTrad || !selTradOpp) return ""; const A = nodeFor(wheelSelTrad), B = nodeFor(selTradOpp); if (!A || !B) return "";
      return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wheel-foreclose"><title>${esc(traditionLabel(wheelSelTrad))} ↔ ${esc(traditionLabel(selTradOpp))} — your antipode; only a braid crosses this axis</title></line>`; })()}
    ${/* SNG-202B §2: a selected braid → light both parent spokes + the arc joining them (the composition, drawn) */""}
    ${(() => { if (selBraidParents.length !== 2) return ""; const An = nodeFor(selBraidParents[0]), Bn = nodeFor(selBraidParents[1]);
      const Ai = wheelPt(An.ang, S.rInner), Bi = wheelPt(Bn.ang, S.rInner);
      return `<line x1="${Ai.x}" y1="${Ai.y}" x2="${An.x}" y2="${An.y}" class="wheel-braid-parent"/><line x1="${Bi.x}" y1="${Bi.y}" x2="${Bn.x}" y2="${Bn.y}" class="wheel-braid-parent"/><path d="M ${An.x} ${An.y} Q ${selBraid.x} ${selBraid.y} ${Bn.x} ${Bn.y}" class="wheel-braid-arc" fill="none"/>`; })()}
    ${/* tradition ring nodes + pole labels */""}
    ${ringNodes.map(rn => { const lp = wheelPt(rn.ang, S.rNode + 30);
      const selCls = !wheelSelTrad ? "" : rn.t === wheelSelTrad ? "trad-sel" : rn.t === selTradOpp ? "trad-sel-opp" : ringDistance(rn.t, wheelSelTrad, idx) === 1 ? "trad-sel-adj" : "trad-sel-dim";
      const poleLbl = String(rn.pole).slice(0, 12);
      const lw = Math.max(52, poleLbl.length * 6.6); // SNG-202B: the pole-label WORDS are the reliable click target —
      return `<g class="wheel-trad ${rn.closed ? "closed" : rn.isPrimary ? "primary" : rn.isSecondary ? "secondary" : rn.isTertiary ? "tertiary" : rn.kin ? "kin" : ""} ${selCls}" data-wheeltrad="${esc(rn.t)}"><title>${esc(traditionLabel(rn.t))} — tap the label to light its crafts, braids and its antipode</title>
        ${/* a generous hit box behind the label (outside the rim, in clear space where no ability node overlaps it — the rim node gets covered by capstones landing there) */""}
        <rect class="hit label-hit" x="${(lp.x - lw / 2).toFixed(1)}" y="${(lp.y - 9).toFixed(1)}" width="${lw.toFixed(1)}" height="22" rx="5"/>
        <circle class="hit" cx="${rn.x}" cy="${rn.y}" r="11"/>
        <circle cx="${rn.x}" cy="${rn.y}" r="7" fill="${rn.closed ? "transparent" : traditionColor(rn.t)}" stroke="${traditionColor(rn.t)}"/>
        <text x="${lp.x}" y="${lp.y + 3}" text-anchor="middle" class="wheel-pole-label">${esc(poleLbl)}</text></g>`; }).join("")}
    ${/* ability nodes — SNG-129: function SHAPES (silhouette = primary family) + precursor SEALED state +
        de-collided labels (owned/selected always; matched added at zoom). */""}
    ${(() => {
      const filterOn = wheelFnFilter.size > 0;
      // SNG-218 §3 (Erik): ZOOM LEVELS OF DETAIL. Overview stays clean — only your kit, the selected node, and
      // the ✨-suggested picks are named. Zoom in and the LEARNABLE crafts get labeled; zoom way in and
      // everything is (except the closed antipode). The wheel re-renders on a zoom-settle so labels appear as
      // you go (wheelLabelZoomBucket + the debounced re-render in wireSkillGraphViewport).
      const k = graphViews[graphSurface]?.k || 1;
      const zoomed = k >= 1.25, midZoom = k >= 2.2, deepZoom = k >= 3.6;
      const labelSet = m.nodes.filter(nd => nd.name && (
        nd.owned || selectedId === nd.id || (nd.recommended && !nd.owned) ||
        (zoomed && filterOn && (nd.families || []).some(f => wheelFnFilter.has(f))) ||
        (zoomed && wheelSelTrad && tradRelOf(nd) === "related") ||
        (midZoom && nd.reachable) || (deepZoom && !nd.closed)));
      const placed = [], labelAt = {};
      for (const nd of labelSet) {
        const lp = wheelPt(nd.ang, wheelTierRadius(nd.levelReq) + 12); let y = lp.y + 2, guard = 0;
        while (guard++ < 40 && placed.some(p => Math.abs(p.x - lp.x) < 44 && Math.abs(p.y - y) < 10)) y += 10;
        placed.push({ x: lp.x, y }); labelAt[nd.id] = { x: lp.x, y };
      }
      return m.nodes.map(nd => {
        if (wheelLearnMode && nd.owned && !nd.braid) return ""; // SNG-218 §3: browsing to LEARN — owned crafts are noise
        const r = 5 + (nd.levelReq - 1) * 1.2;
        const matched = filterOn && (nd.families || []).some(f => wheelFnFilter.has(f));
        const fam = (nd.families || [])[0];
        const sealed = nd.isPrecursor && !nd.precursorUnlocked;   // narrative-locked, NOT tier-locked
        const opened = nd.isPrecursor && nd.precursorUnlocked;
        const fill = nd.owned ? traditionColor(nd.cls) : sealed ? "transparent" : "#20242c";
        const stroke = nd.closed ? "var(--danger)" : traditionColor(nd.cls);
        // SNG-218 §3 (Erik): the filters STACK (intersection) — a tradition click, function filters and the
        // "✨ Suggested" filter can all be on at once, so "the death ones" + "which of those heal" + "which are
        // suggested" compose. A node lights only if it passes EVERY active filter; else it dims. Recommended
        // nodes keep their halo through the dim (CSS !important), so suggestions stay findable under any filter.
        const passTrad = !wheelSelTrad || tradRelOf(nd) !== "dim";
        const passFn = !filterOn || matched;
        const passSug = !wheelSuggestFilter || (nd.recommended && !nd.owned);
        const otherFilters = filterOn || wheelSuggestFilter;
        const anyFilter = wheelSelTrad || otherFilters;
        const litByFilter = anyFilter && passTrad && passFn && passSug;
        // A tradition click ALONE keeps its rich related/adjacent/dim relation (SNG-202B). The moment a function
        // or the ✨-Suggested filter joins it, the highlight becomes the INTERSECTION (Erik: "the death ones" +
        // "which of those heal" + "which are suggested" compose into one lit set; everything else dims).
        const filterCls = (wheelSelTrad && !otherFilters) ? ("trad-" + tradRelOf(nd)) : (anyFilter ? (litByFilter ? "fn-match" : "fn-dim") : "");
        const cls = `wheel-node ${nd.owned ? "owned" : ""} ${nd.closed ? "closed" : ""} ${nd.barred ? "barred" : ""} ${nd.dim ? "dim" : ""} ${nd.isFolk ? "folk" : ""} ${nd.isPrecursor ? "precursor" : ""} ${sealed ? "precursor-sealed" : ""} ${opened ? "precursor-open" : ""} ${nd.braid ? "braid" : ""} ${nd.antipodal ? "braid-antipodal" : ""} ${selectedId === nd.id ? "selected" : ""} ${filterCls} ${nd.recommended && !nd.owned ? "recommended" : ""} ${nd.aspirational ? "aspirational" : ""}`;
        const secondaries = (nd.families || []).slice(1, 3);
        const lbl = labelAt[nd.id];
        const braidNote = nd.braid ? ` · braid of ${(nd.braidFrom || []).join(" × ") || "two crafts"}${nd.antipodal ? " — spans the circle (an antipodal braid, the far poles joined)" : " — placed between its two axes"}` : "";
        const title = nd.name + " — " + (nd.braid ? "a braid" : traditionLabel(nd.cls)) + " · Tier " + nd.tier + braidNote + ((nd.functions || []).length ? " · " + nd.functions.join(", ") : "") + (nd.effCost != null ? " · ⚡" + nd.effCost : "") + (sealed ? " · SEALED (precursor — earned through play, never bought)" : nd.owned ? " (owned)" : nd.closed ? " · CLOSED (your antipode)" : nd.barred ? " · barred" : nd.dim ? " · costs more" : "");
        return `<g class="${cls}" data-wheelnode="${esc(nd.id)}"><title>${esc(title)}${nd.recommended && !nd.owned ? " · ✨ suggested for you this level" : nd.aspirational ? " · later — deepen your standing to open it" : ""}</title>
          <circle class="hit" cx="${nd.x}" cy="${nd.y}" r="13"/>
          ${nd.recommended && !nd.owned ? `<circle cx="${nd.x}" cy="${nd.y}" r="${(r + 9).toFixed(1)}" class="wheel-reco-halo-outer"/><circle cx="${nd.x}" cy="${nd.y}" r="${(r + 5.5).toFixed(1)}" class="wheel-reco-halo"/><text x="${(nd.x + r + 3).toFixed(1)}" y="${(nd.y - r - 2).toFixed(1)}" class="wheel-reco-star">✨</text>` : ""}
          ${wheelNodeShape(sealed ? "ring" : shapeOfFamily(fam), nd.x, nd.y, r, { fill, stroke, sw: sealed ? 1.3 : 1.5, cls: sealed ? "precursor-seal-shape" : "" })}
          ${sealed ? `<text x="${nd.x}" y="${(nd.y + 3).toFixed(1)}" text-anchor="middle" class="precursor-mark">✦</text>` : opened ? `<text x="${(nd.x + r + 2).toFixed(1)}" y="${(nd.y - r).toFixed(1)}" class="precursor-mark open">✦</text>` : ""}
          ${!sealed && !nd.closed ? secondaries.map((sf, i) => `<circle cx="${(nd.x + r + 2).toFixed(1)}" cy="${(nd.y - r - 1 + i * 4).toFixed(1)}" r="1.9" fill="${FAMILY_COLOR[sf] || "var(--ink-dim)"}" class="wheel-fn-dot"/>`).join("") : ""}
          ${nd.closed ? `<line x1="${nd.x - r - 2}" y1="${nd.y - r - 2}" x2="${nd.x + r + 2}" y2="${nd.y + r + 2}" class="wheel-node-strike"/>` : ""}
          ${lbl ? `<text x="${lbl.x.toFixed(1)}" y="${lbl.y.toFixed(1)}" text-anchor="middle" class="wheel-node-label ${nd.owned ? "owned" : ""}">${esc(String(nd.name).slice(0, 16))}${nd.effCost != null && (nd.owned || nd.reachable) ? ` ⚡${nd.effCost}` : ""}</text>` : ""}
        </g>`;
      }).join("");
    })()}
  </g></svg>`;

  const sel = selectedId ? m.nodes.find(nd => nd.id === selectedId) : null;
  const selAb = sel ? fullCatalog()[sel.id] : null;
  // SNG-223: the craft's image — generate-once on this first meaningful contact (the player opened its detail),
  // cached thereafter; a closed antipode never generates. Glyph fallback if art is off / gen fails.
  const selImg = selAb && !sel.closed ? ensureAbilityImage(selAb) : null;
  const gateLine = sel ? (sel.closed ? "🚫 CLOSED — your antipode; only a cross-pole braid crosses it"
    : sel.band === "primary" ? "✦ your primary domain — all tiers, no penalty"
    : sel.band === "adjacent" ? (sel.allowed ? "free — kin of your primary (no capstones)" : "🔒 near a people is not being of them — no capstones")
    : sel.band === "secondary" ? (sel.allowed ? "your secondary — up to Tier III" : "🔒 your secondary tops out at Tier III")
    : sel.band === "tertiary" ? (sel.allowed ? "your tertiary — up to Tier II" : "🔒 your tertiary tops out at Tier II")
    : sel.band === "folk" ? "open — a folk craft of the Valley"
    : sel.band === "far" ? `costs more — ${sel.penalty}× skill points, ${Math.max(2, sel.penalty)} steps out`
    : "learnable") : "";
  const sealedSel = sel && sel.isPrecursor && !sel.precursorUnlocked; // SNG-129: narrative-locked precursor
  const details = sel ? `<div class="map-details">
    <div class="map-details-head"><h3>${esc(sel.name)}</h3>
      <span class="rep-band" style="border-color:${traditionColor(sel.cls)};color:${traditionColor(sel.cls)}">${esc(traditionLabel(sel.cls))} · Tier ${sel.tier}</span>
      ${sel.owned ? `<span class="rep-band trusted">owned</span>` : sealedSel ? `<span class="rep-band" style="border-color:var(--accent);color:var(--accent)">✦ sealed</span>` : ""}</div>
    ${selImg ? `<img class="craft-detail-art" src="${esc(selImg)}" alt="${esc(sel.name)}" data-lightbox="${esc(selImg)}">` : ""}
    <div class="hint">${sealedSel ? "✦ a precursor craft of the substrate — outside the poles" : esc(gateLine)}${!sealedSel && sel.effCost != null ? ` · ⚡${sel.effCost} energy${selAb?.energyCost && sel.effCost !== selAb.energyCost ? ` (base ${selAb.energyCost})` : ""}` : ""}</div>
    ${(selAb?.functions || []).length ? `<div style="margin:4px 0">${functionChips(selAb)}</div>` : ""}
    <p class="map-details-desc">${esc(selAb?.description || "")}</p>
    ${selAb?.notFor ? `<div class="hint"><em>cannot: ${esc(selAb.notFor)}</em></div>` : ""}
    ${selAb?.minted?.kind === "braid" && sel.owned ? `<div class="hint" style="margin-top:4px"><button class="link-btn" id="braid-card-rename" data-braid="${esc(selAb.id)}">✎ Rename this braid</button></div>` : ""}
    ${sealedSel
      ? `<div class="precursor-seal-note">Precursor crafts aren't taught or bought. <strong>A door opens only when the fiction earns it</strong> — walking the Old Roads, a precursor-touched teacher, a discovery in play. There's no button; keep playing toward it, and one day it may open.</div>`
      : sel.precursorUnlocked ? `<div class="hint" style="color:var(--accent)">✦ a door has opened — this precursor craft was earned, and can be learned.</div>${skillSelectionActions(selAb)}`
      : skillSelectionActions(selAb)}
  </div>` : "";

  chrome(`<div class="screen" style="max-width:1180px">
    <h2>The Skill Wheel ${infoDot("circle.what")}</h2>
    <p class="hint" style="margin-bottom:8px">The great circle IS your skill tree. Your <strong>people's spoke</strong> runs out to its capstone; <strong>kin</strong> stand beside you; the <strong>folk crafts</strong> sit at the centre (open to all); <strong>precursor</strong> rings the outside; a <strong>braid you know</strong> draws a line through the middle; and your <strong>antipode is dark, struck through</strong>, across the wheel. Depth = mastery. <strong>Tap a node to learn or deepen it here.</strong> Scroll to zoom, drag to pan.</p>
    ${/* SNG-124 Phase B: function-family filter — tap a family to light up every craft that does it, across all traditions (both axes at once). */""}
    <div class="fn-filter-row">
      <span class="hint" style="margin-right:2px">By function:</span>
      ${FUNCTION_FAMILIES.map(f => `<button class="fn-filter ${familyClass(f)} ${wheelFnFilter.has(f) ? "on" : ""}" data-fnfilter="${f}" title="${f} — highlight every craft that can ${f.toLowerCase()}" style="${wheelFnFilter.has(f) ? `background:${FAMILY_COLOR[f]};color:var(--bg);border-color:${FAMILY_COLOR[f]}` : `color:${FAMILY_COLOR[f]};border-color:${FAMILY_COLOR[f]}`}">${FAMILY_GLYPH[f]} ${f}</button>`).join("")}
      ${/* SNG-218 §3 (Erik): a "✨ Suggested" filter — isolate the reasoned picks on the wheel; stacks with the rest. */""}
      ${wheelRecommended.size ? `<button class="fn-filter reco-filter ${wheelSuggestFilter ? "on" : ""}" id="reco-filter" title="Isolate the crafts suggested for you this level">✨ Suggested</button>` : ""}
      ${(wheelFnFilter.size || wheelSuggestFilter) ? `<button class="fn-filter" id="fn-filter-clear" title="Clear the filters">✕ clear</button>` : ""}
    </div>
    <p class="hint" style="margin-bottom:8px"><span class="grow-badge">${character.skillPoints || 0} skill point${(character.skillPoints || 0) === 1 ? "" : "s"}</span> · ${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity" : ""}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent); margin-bottom:8px">${esc(status)}</div>` : ""}
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
      </div>
      ${svg}
    </div>
    ${details}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn secondary" id="wheel-back">Back</button>
      <button class="btn secondary" id="wheel-list">List view</button>
    </div>
  </div>`);
  setGraphSurface("wheel");   // SNG-168: its own view, not the map's
  wireSkillGraphViewport();
  _rerenderWheel = () => renderSkillWheel(selectedId, status); // SNG-218 §3: zoom-LOD re-render (preserves zoom/pan via graphViews)
  _wheelLODBucket = wheelLodBucket(graphViews.wheel?.k || 1);
  for (const g of app.querySelectorAll("[data-wheelnode]")) g.onclick = () => {
    if (_graphDidPan) { _graphDidPan = false; return; }
    // SNG-218 §3 (Erik): selecting a craft to see its details KEEPS the tradition highlight (and the function /
    // ✨-suggested filters) — you can light a people's crafts, then click through them without the filter clearing.
    renderSkillWheel(g.dataset.wheelnode === selectedId ? null : g.dataset.wheelnode);
  };
  // SNG-202B §2: tap a tradition on the ring → highlight its crafts, its braids, dim its neighbours, show the foreclosure line.
  for (const g of app.querySelectorAll("[data-wheeltrad]")) g.onclick = () => {
    if (_graphDidPan) { _graphDidPan = false; return; }
    const t = g.dataset.wheeltrad;
    wheelSelTrad = wheelSelTrad === t ? null : t;
    renderSkillWheel(null, status); // a tradition highlight clears any single-craft selection
  };
  // SNG-197 p2: rename a braid from its node (the second rename home, alongside the mint moment).
  const bcr = document.getElementById("braid-card-rename");
  if (bcr) bcr.onclick = () => { const def = fullCatalog()[bcr.dataset.braid]; if (def) showBraidRename(def, () => renderSkillWheel(selectedId, status)); };
  // SNG-124 Phase B: toggle a function-family filter (preserves zoom/selection). SNG-218 §3 (Erik): the filters
  // now STACK — a function filter no longer clears the tradition highlight or the ✨ Suggested filter.
  for (const b of app.querySelectorAll("[data-fnfilter]")) b.onclick = () => {
    const f = b.dataset.fnfilter; if (wheelFnFilter.has(f)) wheelFnFilter.delete(f); else wheelFnFilter.add(f);
    renderSkillWheel(selectedId, status);
  };
  const recoFilter = document.getElementById("reco-filter"); if (recoFilter) recoFilter.onclick = () => { wheelSuggestFilter = !wheelSuggestFilter; renderSkillWheel(selectedId, status); }; // SNG-218 §3: isolate the suggested crafts
  const fnClear = document.getElementById("fn-filter-clear"); if (fnClear) fnClear.onclick = () => { wheelFnFilter = new Set(); wheelSuggestFilter = false; renderSkillWheel(selectedId, status); };
  wireSkillSelectionActions((id, msg) => renderSkillWheel(id, msg)); // SNG-097: learn/deepen in place
  document.getElementById("wheel-back").onclick = () => { graphViews[graphSurface] = null; clearTimeout(_wheelLODTimer); _rerenderWheel = null; const rt = wheelReturnTo; wheelReturnTo = null; wheelLearnMode = false; wheelSuggestFilter = false; if (rt === "levelup") renderLevelUp(); else renderCharacterScreen(); }; // SNG-218 §3: reset browse modes + cancel any pending LOD re-render
  document.getElementById("wheel-list").onclick = () => { graphViews[graphSurface] = null; renderSkillGraph(); };
}

function renderSkillGraph(selectedId = null, status = "") {
  const model = skillGraphModel(fullCatalog(), CONTENT.emergence, character, {
    attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, branchForks: CONTENT.branchForks,
    preds: {
      isRipe: id => ripeCombos(character, CONTENT.emergence, CONTENT.rules).some(r => r.id === id) || ripeBranches(character, CONTENT.emergence).some(t => t.id === id),
      isAspired: id => (character.practice?.aspirations || []).some(a => a.abilityId === id)
    }
  });
  const classes = [...new Set(model.nodes.map(n => n.cls))];
  const colW = 150, rowH = 46, padX = 70, padY = 70;
  // layout: class column, tier→name order within column
  const pos = {};
  classes.forEach((cls, ci) => {
    const col = model.nodes.filter(n => n.cls === cls).sort((a, b) => a.levelReq - b.levelReq || a.name.localeCompare(b.name));
    col.forEach((n, ri) => { pos[n.id] = { x: padX + ci * colW, y: padY + ri * rowH }; });
  });
  const virtuals = [...new Set(model.edges.map(e => e.virtual))];
  virtuals.forEach((vid, vi) => { pos[vid] = { x: padX + classes.length * colW + 20, y: padY + vi * rowH * 1.6 }; });
  const width = padX + (classes.length + 1) * colW + 60;
  const height = Math.max(padY + 8 * rowH, padY + virtuals.length * rowH * 1.6 + 40,
    ...classes.map(cls => padY + model.nodes.filter(n => n.cls === cls).length * rowH + 40));
  const recipeName = id => (CONTENT.emergence.recipes || []).find(r => r.id === id)?.name || (CONTENT.emergence.branchTemplates || []).find(t => t.id === id)?.name || id;

  const svg = `<svg id="skill-svg" viewBox="0 0 ${width} ${height}" class="world-map skill-graph" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    ${classes.map((cls, ci) => `<text x="${padX + ci * colW}" y="36" text-anchor="middle" class="graph-class-label" fill="${traditionColor(cls)}">${esc(traditionLabel(cls))}</text>`).join("")}
    ${virtuals.length ? `<text x="${padX + classes.length * colW + 20}" y="36" text-anchor="middle" class="graph-class-label" fill="${classColor("discovery")}">Emergence</text>` : ""}
    ${model.edges.map(e => { const A = pos[e.from], B = pos[e.virtual]; return A && B ? `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="graph-edge ${e.kind}"/>` : ""; }).join("")}
    ${model.nodes.map(n => { const p = pos[n.id]; const r = 6 + (n.levelReq - 1) * 1.5;
      const cls = `graph-node ${n.owned ? "owned" : ""} ${n.ripe ? "ripe" : ""} ${n.aspired ? "aspired" : ""} ${n.locked ? "locked" : ""} ${selectedId === n.id ? "selected" : ""}`;
      return `<g class="${cls}" data-skillnode="${esc(n.id)}"><title>${esc(n.name + " — Tier " + n.tier + " (L" + n.levelReq + ")" + (n.owned ? ", rank " + n.rank : "") + (n.locked ? " 🔒 " + n.lockText : ""))}</title>
        <circle class="hit" cx="${p.x}" cy="${p.y}" r="18"/>
        <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${n.owned ? traditionColor(n.cls) : "#23262e"}" stroke="${traditionColor(n.cls)}"/>
        ${n.locked ? `<text x="${p.x}" y="${p.y - r - 3}" text-anchor="middle" class="graph-lock">🔒</text>` : ""}
        ${n.forks ? `<text x="${p.x - r - 5}" y="${p.y + 4}" text-anchor="middle" class="graph-fork ${n.forkChosen ? "chosen" : ""}">⑂</text>` : ""}
        <text x="${p.x + r + 4}" y="${p.y + 3}" class="graph-node-label ${n.owned ? "owned" : ""}">${esc(n.name)} <tspan class="graph-tier">${n.tier}</tspan></text>
      </g>`; }).join("")}
    ${virtuals.map(vid => { const p = pos[vid]; return `<g class="graph-node virtual" data-skillnode="${esc(vid)}"><title>${esc(recipeName(vid))}</title>
      <rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" transform="rotate(45 ${p.x} ${p.y})" fill="#23262e" stroke="${classColor("discovery")}"/>
      <text x="${p.x + 10}" y="${p.y + 3}" class="graph-node-label">${esc(recipeName(vid))}</text></g>`; }).join("")}
  </g></svg>`;

  const sel = selectedId ? model.nodes.find(n => n.id === selectedId) : null;
  const selAb = sel ? fullCatalog()[sel.id] : null;
  const details = sel ? `<div class="map-details">
    <div class="map-details-head"><h3>${esc(sel.name)}</h3>
      <span class="rep-band" style="border-color:${traditionColor(sel.cls)};color:${traditionColor(sel.cls)}">${esc(traditionLabel(sel.cls))} · Tier ${sel.tier}</span>
      ${sel.owned ? `<span class="rep-band trusted">owned · rank ${sel.rank}</span>` : ""}</div>
    <div class="hint">Level requirement: ${sel.levelReq}${sel.gated ? ` · ${(() => { const g = gateFor(sel.id, CONTENT.attributeGates); return `needs ${g.subAttribute} ${g.learnMin} (rank 3: ${g.rank3Min})`; })()}` : ""}${sel.locked ? ` · 🔒 ${esc(sel.lockText)}` : ""}</div>
    <p class="map-details-desc">${esc(selAb?.description || "")}</p>
    ${sel.forks ? `<div class="codex-fact fork-note"><strong>⑂ Fork at rank ${sel.forkAt}:</strong> ${sel.forkChosen ? `specialized as <em>${esc(sel.forkChosen)}</em> — <span class="fp-cannot">${esc(sel.forkLocked)} locked forever</span>` : "a permanent A-or-B specialization when you rank into it — the path you don't take locks."}</div>` : ""}
    ${skillSelectionActions(selAb)}
  </div>` : "";

  chrome(`<div class="screen" style="max-width:960px">
    <h2>Skill Graph</h2>
    <p class="hint" style="margin-bottom:8px">Every ability by class (color) and Tier I–V (size). Filled = owned. Gold ring = aspired · teal ring = ripe to claim · 🔒 = gated. Diamonds are emergence techniques; lines link their components. <strong>Tap a node to learn or deepen it here.</strong> Scroll to zoom, drag to pan.</p>
    <p class="hint" style="margin-bottom:8px"><span class="grow-badge">${character.skillPoints || 0} skill point${(character.skillPoints || 0) === 1 ? "" : "s"}</span> · ${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity" : ""}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent); margin-bottom:8px">${esc(status)}</div>` : ""}
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
      </div>
      ${svg}
    </div>
    ${details}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn secondary" id="graph-back">Back</button>
      <button class="btn secondary" id="graph-wheel">✦ Wheel view</button>
    </div>
  </div>`);
  setGraphSurface("graph");   // SNG-168: its own view, not the map's
  wireSkillGraphViewport();
  for (const g of app.querySelectorAll("[data-skillnode]")) g.onclick = (ev) => {
    if (_graphDidPan) { _graphDidPan = false; return; } // a drag-pan, not a select
    renderSkillGraph(g.dataset.skillnode === selectedId ? null : g.dataset.skillnode);
  };
  wireSkillSelectionActions((id, msg) => renderSkillGraph(id, msg)); // SNG-097: learn/deepen in place
  document.getElementById("graph-back").onclick = () => { graphViews[graphSurface] = null; renderCharacterScreen(); };
  document.getElementById("graph-wheel").onclick = () => { graphViews[graphSurface] = null; renderSkillWheel(); };
}

// SNG-054 Phase 0: pan/zoom for the skill graph (the fixed viewBox overflowed unusably on
// desktop). Pure viewport work — a transform on the <g class="graph-vp"> group; state persists
// across node-select re-renders (graphViews[surface]) so zoom isn't lost on click. Fit/reset = identity.
// SNG-168: PER-SURFACE viewport state. This was ONE module-level variable shared by the map, the
// skill wheel and the skill graph, reset only on explicit back/fit buttons — so zooming the map and
// then opening the wheel from the character screen inherited the map's transform. Keyed by surface,
// the surfaces stop leaking into each other and each remembers its own view.
let graphViews = {};                       // { [surface]: { k, tx, ty } }
let graphSurface = "map";                  // which one the current screen is
const setGraphSurface = (name) => { graphSurface = name; };
let _graphDidPan = false;  // suppress a node-select when a drag actually panned
// SNG-218 §3 (Erik): zoom levels of detail — the wheel re-renders itself when a zoom crosses a LOD threshold, so
// labels appear as you zoom in. `_rerenderWheel` is set by renderSkillWheel to a self-call (preserving zoom/pan).
let _rerenderWheel = null, _wheelLODBucket = 0, _wheelLODTimer = null;
const wheelLodBucket = k => k >= 3.6 ? 3 : k >= 2.2 ? 2 : k >= 1.25 ? 1 : 0;

function wireSkillGraphViewport() {
  const svg = document.getElementById("skill-svg");
  const vp = svg?.querySelector(".graph-vp");
  if (!svg || !vp) return;
  const apply = () => { let v = graphViews[graphSurface] || { k: 1, tx: 0, ty: 0 };
    if (!Number.isFinite(v.tx) || !Number.isFinite(v.ty) || !Number.isFinite(v.k)) { v = { k: Number.isFinite(v.k) ? v.k : 1, tx: 0, ty: 0 }; graphViews[graphSurface] = v; } // SNG-218 §3: never emit Infinity/NaN
    vp.setAttribute("transform", `translate(${v.tx} ${v.ty}) scale(${v.k})`); };
  const clampK = k => Math.max(0.3, Math.min(7, k)); // SNG-218 §3 (Erik): deeper zoom — "way in for clarity"
  // convert a client point to the SVG's viewBox coordinate space. SNG-218 §3: a zoom event can arrive on a
  // DETACHED svg (its width is 0 the instant the LOD re-render swaps it), which used to divide by zero →
  // translate(Infinity NaN). Guard: a zero-size rect returns null and the caller bails, keeping the view finite.
  const toSvg = (clientX, clientY) => {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const vb = svg.viewBox.baseVal;
    return { x: (clientX - r.left) / r.width * vb.width, y: (clientY - r.top) / r.height * vb.height };
  };
  const zoomAt = (clientX, clientY, factor) => {
    const v = graphViews[graphSurface] || { k: 1, tx: 0, ty: 0 };
    const p = toSvg(clientX, clientY);
    if (!p) return;
    const k2 = clampK(v.k * factor);
    // keep the point under the cursor fixed: p = (p - t)/k invariant
    const tx = p.x - (p.x - v.tx) * (k2 / v.k), ty = p.y - (p.y - v.ty) * (k2 / v.k);
    graphViews[graphSurface] = { k: k2, tx: Number.isFinite(tx) ? tx : 0, ty: Number.isFinite(ty) ? ty : 0 };
    apply();
    // SNG-218 §3: on the WHEEL, when a zoom crosses a level-of-detail threshold, re-render (debounced) so the
    // labels for that detail level appear. Only fires on a threshold crossing — not every zoom tick.
    if (graphSurface === "wheel" && _rerenderWheel) {
      const nb = wheelLodBucket(k2);
      if (nb !== _wheelLODBucket) { clearTimeout(_wheelLODTimer); _wheelLODTimer = setTimeout(() => { _wheelLODBucket = nb; _rerenderWheel && _rerenderWheel(); }, 180); }
    }
  };
  svg.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  // drag to pan (mouse + touch)
  let dragging = false, last = null, moved = 0;
  const down = (x, y) => { dragging = true; last = { x, y }; moved = 0; _graphDidPan = false; };
  const move = (x, y) => {
    if (!dragging) return;
    const r = svg.getBoundingClientRect(); const vb = svg.viewBox.baseVal;
    if (!r.width || !r.height) return; // SNG-218 §3: never pan against a detached/zero-size svg (→ Infinity)
    const dx = (x - last.x) / r.width * vb.width, dy = (y - last.y) / r.height * vb.height;
    moved += Math.abs(x - last.x) + Math.abs(y - last.y);
    const v = graphViews[graphSurface] || { k: 1, tx: 0, ty: 0 };
    graphViews[graphSurface] = { k: v.k, tx: v.tx + dx, ty: v.ty + dy };
    last = { x, y }; if (moved > 6) _graphDidPan = true; apply();
  };
  const up = () => { dragging = false; };
  svg.addEventListener("mousedown", e => down(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", up);
  // SNG-168: PINCH. Zoom was wheel-only and a phone has no wheel — `touches[1]` appeared zero times
  // in the whole repo, so the map could be panned on a tablet and never zoomed. Two fingers set the
  // scale about their midpoint, which is the gesture everyone already expects.
  let pinch = null;
  const spanOf = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const midOf = t => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
  svg.addEventListener("touchstart", e => {
    if (e.touches.length >= 2) { pinch = { span: spanOf(e.touches), k: (graphViews[graphSurface] || { k: 1 }).k }; up(); }
    else if (e.touches[0]) { pinch = null; down(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: true });
  svg.addEventListener("touchmove", e => {
    if (pinch && e.touches.length >= 2) {
      const span = spanOf(e.touches);
      if (pinch.span > 0) {
        const m = midOf(e.touches);
        const v = graphViews[graphSurface] || { k: 1, tx: 0, ty: 0 };
        const k2 = clampK(pinch.k * (span / pinch.span));
        const pt = toSvg(m.x, m.y);
        graphViews[graphSurface] = { k: k2, tx: pt.x - (pt.x - v.tx) * (k2 / v.k), ty: pt.y - (pt.y - v.ty) * (k2 / v.k) };
        apply();
      }
      return;
    }
    if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  svg.addEventListener("touchend", e => { if (e.touches.length < 2) pinch = null; }, { passive: true });
  svg.addEventListener("touchend", up);
  const r = svg.getBoundingClientRect();
  // SNG-168: these three controls are rendered by the REGION tier only. Dereferencing them
  // unguarded is why the wiring could not simply be called on the world and location tiers — it
  // threw before reaching the pan/zoom listeners. Guarded, so one wiring serves every surface.
  const ctl = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
  ctl("gz-in", () => zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.25));
  ctl("gz-out", () => zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.25));
  ctl("gz-fit", () => { graphViews[graphSurface] = null; apply(); });
  apply();
}

// ---------- character & inventory screens (SNG-007) ----------

/** SNG-094: the Level-Up window — one place to spend skill points. DEEPEN a craft you know (rank up)
 *  or LEARN a new one (domain-gated, explained), with the SNG-084 helper text woven in. Stays open so
 *  a player with several points spends them in a row. Replaces hunting the sidebar's scattered ▲ + the
 *  collapsed "Learn" groups. */
function renderLevelUp(status = "") {
  const rules = CONTENT.rules;
  const sp = character.skillPoints || 0;
  const cap = atCapacity(character, CONTENT.skillCapacity);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;

  // DEEPEN: owned abilities, showing what a rank costs / grants / why it's blocked
  const rankRows = character.abilities.map(a => ({ a, ab: fullCatalog()[a.abilityId] })).filter(x => x.ab).map(({ a, ab }) => {
    const rankCost = learnPointCost(ab, character, CONTENT.skillCapacity, domainVerdict(ab));
    const nextReq = rules.leveling?.rankLevelReq?.[String(a.level + 1)];
    const atMax = a.level >= maxRank;
    const levelOk = character.level >= (nextReq ?? 1);
    const practiced = practiceRankReady(character, a.abilityId, rules) && !atMax && levelOk;
    const canRank = !atMax && levelOk && (sp >= rankCost || practiced);
    const now = rankExpression(character, ab, a.level, CONTENT.branchForks) || ab.tree?.find(t => t.rank === a.level);
    const next = ab.tree?.find(t => t.rank === a.level + 1);
    return { a, ab, rankCost, atMax, levelOk, practiced, canRank, now, next };
  });

  // LEARN: everything the domain gate opens that you don't yet know (SNG-094 gate)
  const learnable = Object.values(CONTENT.abilities).filter(ab => {
    if (character.abilities.some(a => a.abilityId === ab.id)) return false;
    const req = learnLevelReq(ab);
    if (req === null || character.level < req) return false;
    return domainVerdict(ab).allowed;
  });
  const byTrad = {};
  for (const ab of learnable) { const k = abilityTradition(ab) || ab.powerSystem || "folk"; (byTrad[k] = byTrad[k] || []).push(ab); }
  // SNG-218 §1/§2: the REACHABLE-NOW set — `learnable` filtered through the ONE gate (adds standing, capacity,
  // affordability). BOTH the suggestion (heuristic fallback + the LLM pick) and the render read this, never the
  // raw level+domain `learnable` — so no suggestion (heuristic or model) can ever offer a standing-locked craft.
  const reachableNow = learnable.filter(ab => canLearnAbility(character, ab.id, fullCatalog(), rules, { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex }).ok);

  const learnRow = ab => {
    const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
    const dv = domainVerdict(ab);
    const ripe = aspirationRipe(character, ab.id, rules);
    const cost = learnPointCost(ab, character, CONTENT.skillCapacity, dv);
    const tooPoor = !ripe && sp < cost;
    const capBlock = cap && ab.powerSystem !== "learned";
    const blocked = !gate.ok || capBlock || tooPoor;
    const r1 = ab.tree?.find(t => t.rank === 1);
    const band = dv.band === "far" ? " · far" : dv.band === "adjacent" ? " · kin" : dv.band === "accord" ? " · open" : "";
    return `<div class="cs-ability ${blocked ? "locked" : ""}">
      <div><span class="tier-badge">${tierOf(ab.levelReq)}</span> <strong>${esc(ab.name)}</strong> <span class="hint">L${ab.levelReq || 1}${band}${cost > 1 ? ` · ${cost} pts` : ""}${ripe ? " · practiced (free)" : ""}</span></div>
      <div class="hint">${esc((r1 ? r1.grants : ab.description) || "").slice(0, 130)}</div>
      ${blocked
        ? `<span class="hint">🔒 ${!gate.ok ? esc(gate.why) : capBlock ? "at capacity — deepen instead" : "need " + cost + " point" + (cost > 1 ? "s" : "")}</span>`
        : `<button class="btn" data-lvllearn="${esc(ab.id)}">Learn${ripe ? " (free)" : ` (${cost} pt${cost > 1 ? "s" : ""})`}</button>`}
    </div>`;
  };

  // SNG-218 §2 (Erik follow-up): reasoned-suggestion helpers — the skill-point COST per pick (Erik: "tell me
  // how much these cost"), ONE shared renderer for both the cached and the fresh LLM render, and the
  // once-per-LEVEL cache. A reasoned read is taken once at a given level and PERSISTS across leave/return; only
  // reaching a NEW level (character.level changes) invalidates it → a fresh read (Erik: "another level, another read").
  const cat0 = fullCatalog();
  const suggCost = id => { try { return canLearnAbility(character, id, cat0, rules, { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex }).cost; } catch { return null; } };
  const reasonedPicksHTML = (picks, note) => `<h3 class="codex-title" style="font-size:15px">✨ Suggested for you <span class="hint" style="text-transform:none">— reasoned from how you actually play</span></h3>
    ${picks.map(p => { const ab = cat0[p.abilityId]; const c = suggCost(p.abilityId); const ec = (() => { try { return effectiveEnergyCost(ab, character, rules); } catch { return ab?.energyCost ?? null; } })();
      return `<div class="cs-ability sug-row">
        <div><strong class="entity-hover" data-entity="skill:${esc(p.abilityId)}" title="Tap to see how this craft grows rank by rank">${esc(ab?.name || p.abilityId)}</strong> ${functionChips(ab)}${p.fit ? ` <span class="fit-tag fit-${esc(String(p.fit).replace(/[^a-z]/gi, ""))}">${esc(p.fit)}</span>` : ""}${ec != null ? ` <span class="hint" title="energy to use (effective)">⚡${ec}</span>` : ""}</div>
        <div class="hint">✦ ${esc(p.why || "")}</div>
        <button class="btn" data-lvllearn="${esc(p.abilityId)}">Learn${c != null ? ` (${c} pt${c > 1 ? "s" : ""})` : ""}</button>
      </div>`; }).join("")}${note ? `<div class="hint" style="margin-top:6px">${esc(note)}</div>` : ""}`;
  const sc = character._suggestCache;
  const cachedPicks = (sc && sc.level === character.level) ? (sc.picks || []).filter(p => reachableNow.some(a => a.id === p.abilityId)) : [];
  const useCachedSuggest = cachedPicks.length > 0;
  if (useCachedSuggest) wheelRecommended = new Set(cachedPicks.map(p => p.abilityId));

  chrome(`<div class="screen" style="max-width:720px">
    <h2>⬆ Level Up ${infoDot("ability.ranks")}</h2>
    <p class="hint" style="margin-bottom:10px">You have <strong>${sp} skill point${sp === 1 ? "" : "s"}</strong> — points <strong>learn new crafts</strong> (breadth). <strong>Depth is earned through use</strong>, not bought. <span class="cap-line">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${cap ? " — at capacity" : ""}</span> ${infoDot("lock.capacity")}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent)">${esc(status)}</div>` : ""}

    ${(() => {
      // SNG-218 §2: a reasoned read already taken at THIS level → show it straight from cache (no spinner, no
      // re-call). Persists across leave/return until the next level (Erik's ask).
      if (useCachedSuggest) return `<div class="cs-block sug-block" id="lvl-suggest">${reasonedPicksHTML(cachedPicks, sc?.note)}</div>`;
      // no cached read → the INSTANT heuristic (also the §2 fallback if the LLM call fails), plus a SPINNER while
      // the reasoned read comes in (Erik: "it takes a minute — show a spinner"). Reads reachableNow (the §1 gate).
      const cov = functionCoverage(character, fullCatalog(), FN_INDEX);
      const suggestions = recommendSkills(character, reachableNow, {
        fnIndex: FN_INDEX, traditionIndex: CONTENT.traditionIndex, catalog: fullCatalog(),
        ripe: new Set(reachableNow.filter(ab => aspirationRipe(character, ab.id, rules)).map(ab => ab.id)),
        effectiveCost: ab => effectiveEnergyCost(ab, character, rules), max: 4
      });
      wheelRecommended = new Set(suggestions.map(s => s.abilityId)); // SNG-218 §3: the same picks light up ON the wheel
      const gap = cov.missing.length ? `Your kit has no <strong>${cov.missing.join(", ")}</strong> yet — gaps worth filling.` : `Your kit already touches all ${cov.covered.length} function families.`;
      const rows = suggestions.map(s => { const ab = fullCatalog()[s.abilityId]; const c = suggCost(s.abilityId); return `<div class="cs-ability sug-row">
          <div><strong class="entity-hover" data-entity="skill:${esc(s.abilityId)}" title="Tap to see how this craft grows rank by rank">${esc(s.name)}</strong> ${functionChips(ab)}${s.cost != null ? ` <span class="hint" title="energy to use (effective)">⚡${s.cost}</span>` : ""}</div>
          <div class="hint">✦ ${esc(s.why)}</div>
          <button class="btn" data-lvllearn="${esc(s.abilityId)}">Learn${c != null ? ` (${c} pt${c > 1 ? "s" : ""})` : ""}</button>
        </div>`; }).join("");
      const spinner = reachableNow.length >= 2 ? `<div class="sug-spinner hint" id="lvl-suggest-spin"><span class="spin-dot"></span> reasoning about your next crafts…</div>` : "";
      return `<div class="cs-block sug-block" id="lvl-suggest"${suggestions.length ? "" : ' style="display:none"'}>
        <h3 class="codex-title" style="font-size:15px">Suggested for you <span class="hint" style="text-transform:none">— what would round out your kit</span></h3>
        ${spinner}<div class="hint" style="margin-bottom:6px">${gap}</div>${rows}</div>`;
    })()}

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Your crafts ${infoDot("ability.ranks")} <span class="hint" style="text-transform:none">— depth is earned through use, not points</span></h3>
      ${rankRows.map(r => { const p = rankProgress(character, r.a.abilityId); return `<div class="cs-ability">
        <div><strong class="entity-hover" data-entity="skill:${esc(r.a.abilityId)}" title="Tap to see how this craft grows rank by rank">${esc(r.ab.name)}</strong> ${functionChips(r.ab)} <span class="cs-ranks">${[1, 2, 3].map(n => `<span class="${n <= r.a.level ? "cs-rank-on" : "cs-rank-off"}">${n <= r.a.level ? "●" : "○"}</span>`).join("")}</span> <span class="hint">${r.now ? esc(r.now.name) : ""}</span></div>
        ${r.next ? `<div class="hint">→ ${esc(r.next.name)}: ${esc(r.next.grants || "")}</div>` : ""}
        <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div>
      </div>`; }).join("") || "<div class='insight'>no crafts yet — learn one below</div>"}
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Learn a new craft ${infoDot("circle.domains")} <span class="hint" style="text-transform:none">— broaden into your domains</span></h3>
      ${cap ? `<div class="hint" style="margin-bottom:6px">You're at capacity — new points now deepen what you know. ${infoDot("lock.capacity")}</div>` : ""}
      ${/* SNG-218 §3 (Erik): the WHEEL is the browse surface — every craft in its place, suggested picks lit,
          owned crafts hidden, standing-locked ones dimmed as "later". Its detail panel shows what each rank
          grants. The tradition LIST is now a collapsed plain-text fallback, not the default (Erik: don't want
          to dig through a list). */""}
      <button class="btn" id="lvl-wheel" style="width:100%; margin-bottom:10px">✦ Browse crafts on the wheel${wheelRecommended.size ? " — your suggested picks are lit ✨" : ""} →</button>
      ${Object.keys(byTrad).length
        ? `<details class="learn-list-fallback"><summary class="hint">Or browse as a plain list ↴</summary><div style="margin-top:6px">${Object.keys(byTrad).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(k => `<details class="learn-group"><summary>${esc(traditionLabel(k))} <span class="cost">(${byTrad[k].length})</span></summary>${byTrad[k].sort((a, b) => (a.levelReq || 1) - (b.levelReq || 1)).map(learnRow).join("")}</details>`).join("")}</div></details>`
        : "<div class='insight'>nothing new to learn at this level — deepen a craft, or play on to reach the next tier</div>"}
    </div>

    <button class="btn secondary" id="lvl-back">Done</button>
  </div>`);

  // ability-arch v2: no data-lvlrank handler — depth is earned through use, not bought. Bind is a function so
  // the SNG-218 §2 async suggestion swap can re-bind the buttons it re-renders into #lvl-suggest.
  const bindLearn = () => { for (const b of app.querySelectorAll("[data-lvllearn]")) b.onclick = () => {
    const id = b.dataset.lvllearn;
    const free = aspirationRipe(character, id, rules);
    const r = learnAbility(character, id, fullCatalog(), rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) { if (free) dropAspiration(character, id); saveCharacter(character); renderLevelUp(`Learned ${fullCatalog()[id]?.name}${free ? " — no point spent" : ""}.`); }
    else renderLevelUp(r.why);
  }; };
  bindLearn();
  document.getElementById("lvl-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
  // SNG-218 §3: open the wheel as the browse+highlight surface; its Back returns here (wheelReturnTo).
  const lvlWheel = document.getElementById("lvl-wheel"); if (lvlWheel) lvlWheel.onclick = () => { wheelReturnTo = "levelup"; wheelLearnMode = true; renderSkillWheel(); }; // SNG-218 §3: learn-browse — hide owned crafts

  // SNG-218 §2: upgrade the instant heuristic to a GENUINELY-REASONED suggestion (async, non-blocking). Reads
  // the character's real play-fingerprint (tendencies, aptitudes, declared aspirations, use counts, adopted
  // schools) and picks from reachableNow (the §1 guardrail). Hard-filters the model's ids against that set so a
  // stray pick can never render a Learn button on an unlearnable craft. On ANY failure the heuristic stays.
  (async () => {
    if (useCachedSuggest) return; // a reasoned read for THIS level is already shown from cache — don't re-call
    const spin = () => { const s = document.getElementById("lvl-suggest-spin"); if (s) s.remove(); };
    try {
      const box = document.getElementById("lvl-suggest");
      if (!box || reachableNow.length < 2) { spin(); return; } // nothing worth reasoning over
      const cat = fullCatalog();
      const okIds = new Set(reachableNow.map(a => a.id));
      const rankOf = id => (character.abilities.find(a => a.abilityId === id)?.level) || 0;
      const topTend = Object.entries(character.tendencies || {}).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(", ") || "none yet";
      const usesMap = character.practice?.uses || {};
      const usesTop = Object.entries(usesMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${cat[k]?.name || k} ${v}`).join(", ");
      const usesUnused = (character.abilities || []).filter(a => (usesMap[a.abilityId] || 0) <= 1).map(a => cat[a.abilityId]?.name || a.abilityId).slice(0, 5).join(", ");
      const asp = (character.practice?.aspirations || []).map(a => `${cat[a.abilityId]?.name || a.abilityId} ${a.progress ?? 0}/10`).join(", ");
      const schoolsStr = Object.entries(character.schools || {}).map(([dom, sch]) => `${dom}→${sch}`).join(", ");
      const pool = reachableNow.slice(0, 40).map(ab => {
        const fam = (familiesOfAbility(ab, FN_INDEX) || []).join("/") || (ab.functions || []).join("/") || "—";
        const cost = canLearnAbility(character, ab.id, cat, rules, { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex }).cost ?? "?";
        return `${ab.id} · ${ab.name} · ${fam} · ${String(ab.description || ab.effect || "").slice(0, 90)} · school:${ab.schoolAffinity || "—"} · ${cost}pt`;
      }).join("\n");
      const res = await suggestNextCrafts({
        owned: (character.abilities || []).map(a => `${cat[a.abilityId]?.name || a.abilityId} r${rankOf(a.abilityId)}`).join(", "),
        domains: character.domains || {}, tendencies: topTend, aptitudes: (character.aptitudes || []).join(", ") || "none",
        reachablePool: pool, aspirations: asp, uses: `most-used: ${usesTop || "—"}${usesUnused ? ` · owned-but-unused: ${usesUnused}` : ""}`,
        boosted: (character.boostedCrafts || []).map(id => cat[id]?.name || id).join(", "), // SNG-215 §A1: the player's thumb on the scale
        schools: schoolsStr, skillPoints: character.skillPoints || 0, level: character.level || 1
      });
      // SNG-218 fix: canonicalize each model pick to a REAL reachable id before the guardrail filter. A model
      // often echoes the display NAME ("The Dread") or a near-miss slug instead of the exact id — and an
      // exact-string filter then drops the WHOLE set, so the level-up top silently stays on the heuristic
      // forever (Silas's fallback). Match by id, then by normalized id, then by normalized name; keep the
      // reachable-only guardrail (an unmatchable/hallucinated id still can't through). Use the canonical id.
      const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const byNorm = new Map(reachableNow.map(a => [norm(a.id), a]));
      const byName = new Map(reachableNow.map(a => [norm(a.name), a]));
      const resolvePick = pid => (okIds.has(pid) ? reachableNow.find(a => a.id === pid) : null) || byNorm.get(norm(pid)) || byName.get(norm(pid)) || null;
      const picks = (res?.picks || []).map(p => { const ab = resolvePick(p.abilityId); return ab ? { ...p, abilityId: ab.id } : null; }).filter(Boolean).slice(0, 4);
      if (!picks.length) {
        spin();
        if ((res?.picks || []).length) console.warn("[level-up] reasoned suggestion returned picks, none matched the reachable pool — heuristic stands. model ids:", (res.picks || []).map(p => p.abilityId), "· pool:", [...okIds].slice(0, 12));
        return;
      }
      wheelRecommended = new Set(picks.map(p => p.abilityId)); // SNG-218 §3: the reasoned picks light up ON the wheel
      // SNG-218 §2: cache this reasoned read at the CURRENT level so it persists across leave/return until a new
      // level grants another (Erik's ask); save so it survives a reload too.
      character._suggestCache = { level: character.level, picks: picks.map(p => ({ abilityId: p.abilityId, why: p.why, fit: p.fit })), note: res?.note || "" };
      try { saveCharacter(character); } catch { /* the cache is a convenience */ }
      box.style.display = "";
      box.innerHTML = reasonedPicksHTML(picks, res?.note); // shared renderer — carries the skill-point cost (Erik's ask)
      bindLearn();
    } catch (e) { spin(); console.warn("[level-up] reasoned suggestion unavailable — heuristic stands:", e?.message || e); } // observable, not silent (why Silas kept the heuristic)
  })();
}

/** SNG-118: play-style as tight, tappable aptitude chips (replacing the prose wall). Each chip is colored by
 *  axis (earned / amorous / inverse), dimmed when FADING (SNG-113 "loss is legible"), and border-marked for a
 *  lineage grant. Tap → the one popover surface shows its effect + description + mods. Scales with the roster. */
function aptitudeChips() {
  const held = (CONTENT.rules.playerAptitudes || []).filter(a => character.aptitudes?.includes(a.id));
  if (!held.length) return `<span class="insight">No marked tendencies yet — play a while and who you are will show.</span>`;
  const fading = fadingAptitudes(character, CONTENT.rules.playerAptitudes, CONTENT.rules);
  const lineage = new Set(character.grantedAptitudes || []);
  return `<div class="aptitude-chips">${held.map(a => {
    const name = a.id.replace(/_/g, " ");
    const isFading = fading.has(a.id), isLineage = lineage.has(a.id);
    const modLine = Object.entries(a.mods || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase().trim()} ${v > 0 ? "+" : ""}${v}`).join(", ");
    const detail = `${name}${isLineage ? " · lineage" : ""}${isFading ? " · fading" : ""}\n${a.description || ""}${modLine ? `\n\n${modLine}` : ""}`;
    return `<button class="aptitude-chip axis-${esc(a.axis || "earned")}${isFading ? " fading" : ""}${isLineage ? " lineage" : ""}" data-aptchip="${esc(detail)}" title="tap for detail">${esc(name)}${isFading ? " ⌁" : ""}</button>`;
  }).join("")}</div>`;
}

// SNG-215 §C: the FUNCTION FAMILIES a tradition grants — derived by unioning its abilities' families (there is
// no authored tradition→families table). Used in the derived MECHANICS readout for the tradition trait.
function traditionFamilies(tradId) {
  const fams = new Set();
  for (const ab of Object.values(fullCatalog())) if (abilityTradition(ab) === tradId) for (const f of familiesOfAbility(ab, FN_INDEX)) fams.add(f);
  return [...fams].map(f => f.charAt(0) + f.slice(1).toLowerCase());
}

// SNG-215 §C: a trait's two-register readout — LORE (what it means) + MECHANICS (what it DOES). Aevi's authored
// `CONTENT.trait_readouts[kind][id]` wins; otherwise DERIVE both from data that already exists (so it renders
// before every readout is authored). Erik's ask: tell the player the FUNCTIONAL mechanics, not just the flavour.
function traitReadout(kind, id) {
  // SNG-215 §C: the authored doc keys traits by the PLURAL kind (backgrounds/origins); the call sites key
  // by the SINGULAR (data-trait="background:…"). Check both (and a legacy .readouts wrapper) so Aevi's
  // authored lore+mechanics actually resolve instead of silently falling through to the derived text.
  const tr = CONTENT.trait_readouts || {};
  const authored = tr[kind]?.[id] || tr[kind + "s"]?.[id] || tr.readouts?.[kind]?.[id] || tr.readouts?.[kind + "s"]?.[id] || null;
  let lore = authored?.lore || null, mech = authored?.mechanics || null;
  const rules = CONTENT.rules || {};
  if (kind === "background") {
    // SNG-272: through the normalising reader, not a second private lookup with its own `|| {}`. Two
    // lookups for one record is how they came to disagree about whether the record exists.
    const def = backgroundById(id) || {};
    lore = lore || def.description || `A ${id} — a life that shaped who you are.`;
    mech = mech || `${def.affinity?.length ? `Helps with ${def.affinity.join(", ")} challenges (a soft edge, never a gate).` : "No fixed challenge affinity."}${def.grantsAptitudes?.length ? ` Grants the ${def.grantsAptitudes.join(", ")} aptitude.` : ""}`;
    return `${def.name || id} — background\n\n${lore}\n\nMECHANICS: ${mech}`;
  }
  if (kind === "origin") {
    const def = (CONTENT.origins || []).find(o => o.id === id) || {};
    lore = lore || def.whyYouAreHere || def.displayLabel || `Of the ${id}.`;
    mech = mech || `Your people's native craft is ${def.nativeTradition ? traditionLabel(def.nativeTradition) : "—"}${def.pole ? ` (${def.pole} pole)` : ""} — the most natural road for you to train, learnable by right where others need a teacher.`;
    return `${def.displayLabel || def.name || id} — origin\n\n${lore}\n\nMECHANICS: ${mech}`;
  }
  if (kind === "tradition") {
    const fams = traditionFamilies(id);
    lore = lore || `The craft of the ${traditionLabel(id)} — one of the valley's great disciplines.`;
    mech = mech || `A domain you hold — its crafts train to your tier here. It grants the function families: ${fams.length ? fams.join(", ") : "—"} (what you can DO with it).`;
    return `${traditionLabel(id)} — domain\n\n${lore}\n\nMECHANICS: ${mech}`;
  }
  if (kind === "form") {
    lore = lore || (character.form || "An ordinary person.");
    mech = mech || "Cosmetic — your form leads how the portrait is rendered. It carries NO mechanical effect: the game reads your attributes, crafts, and standing, never your appearance.";
    return `Form\n\n${lore}\n\nMECHANICS: ${mech}`;
  }
  if (kind === "aspiration") {
    const ab = fullCatalog()[id] || {};
    const asp = (character.practice?.aspirations || []).find(a => a.abilityId === id) || {};
    const need = rules.practice?.aspirationRipe ?? 10;
    lore = lore || `A craft you've named as a goal — you're leaning toward ${ab.name || id}.`;
    mech = mech || `Progress ${Math.min(asp.progress || 0, need)}/${need}. Acting in its power-system (or into its effects) advances it; when ripe you may learn it FREE at level. It also weights the GM's craft suggestions toward it.`;
    return `${ab.name || id} — aspiration\n\n${lore}\n\nMECHANICS: ${mech}`;
  }
  return authored ? `${lore || ""}\n\nMECHANICS: ${mech || ""}` : "";
}

// SNG-215 §C-2: the character surface is ONE screen with two tabs — Traits (who you ARE) and Chronicle (who
// you've BECOME). The bar switches between the two renders; the user sees a single character view with tabs.
// SNG-276: ONE wiring function for the tab bar. Each render used to wire its own buttons, which is how a
// third tab gets added to the markup and stays dead on two of the three screens.
function wireCharacterTabs() {
  const go = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = fn; };
  go("tab-traits", () => renderCharacterScreen());
  go("tab-chronicle", () => renderChronicle());
  go("tab-world", () => renderWorldTab());
}
function characterTabBar(active) {
  return `<div class="char-tabs">
    <button class="char-tab${active === "traits" ? " on" : ""}" id="tab-traits">Traits</button>
    <button class="char-tab${active === "chronicle" ? " on" : ""}" id="tab-chronicle">📜 Chronicle</button>
    <button class="char-tab${active === "world" ? " on" : ""}" id="tab-world">🌍 The World</button>
  </div>`;
}

function renderCharacterScreen() {
  const rules = CONTENT.rules;
  const cap = rules.leveling?.subAttributeCap ?? 20;
  const soft = rules.baseChance?.attributeSoftCap ?? 4;
  const b = character.bio || {};
  const xpNeed = character.level * (rules.leveling?.xpPerLevel ?? 100);
  const galleryCount = (character.gallery || []).length;
  chrome(`<div class="screen" style="max-width:760px">
    <div class="cs-header">
      ${character.portrait ? `<img class="cs-portrait" src="${esc(character.portrait)}" alt="${esc(character.name)}" data-lightbox="portrait" onerror="this.style.display='none'">` : ""}
      <div class="cs-header-text">
        <h2 style="margin:0">${esc(character.name)}</h2>
        <div class="hint"><span class="trait-tap" data-trait="origin:${esc(character.origin)}" title="tap: lore + mechanics">${esc(character.origin)}</span> · <span class="trait-tap" data-trait="background:${esc(character.background)}" title="tap: lore + mechanics">${esc(character.background)}</span> · level ${character.level} — ${character.xp}/${xpNeed} xp ${infoDot("growth.level")}${character.pendingSubPoints ? ` · <span class="grow-badge">+${character.pendingSubPoints} attribute</span>` : ""}${character.skillPoints ? ` · <span class="grow-badge">${character.skillPoints} skill</span>` : ""}</div>
        ${character.form ? `<div class="hint" style="margin-top:4px"><em>Form:</em> <span class="trait-tap" data-trait="form:self" title="tap: lore + mechanics">${esc(character.form)}</span></div>` : ""}
        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap">
          <button class="opt" id="cs-form" title="Describe this character's physical form / species so the portrait renders it (e.g. an Ent, a construct)">✎ Appearance</button>
          ${imagesEnabled() && !character.portrait ? `<button class="opt" id="cs-gen-portrait">✦ Generate portrait</button>` : ""}
          ${imagesEnabled() && character.portrait ? `<button class="opt" id="cs-regen-portrait" title="Re-mint the portrait">↻ New portrait</button>` : ""}
          <button class="opt" id="cs-gallery">🖼 Gallery${galleryCount ? ` (${galleryCount})` : ""}</button>
        </div>
      </div>
    </div>
    ${characterTabBar("traits")}
    ${Object.values(b).some(v => v) ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Story</h3>
      ${["hometown", "residence", "livelihood", "hobbies", "motivation"].filter(k => b[k]).map(k => `<div class="codex-fact"><strong style="text-transform:capitalize">${k}:</strong> ${esc(b[k])}</div>`).join("")}
      ${(() => { // SNG-215 §C-2 dedup: the lived "story so far" paragraph is the Chronicle tab's job now; the
        // Traits tab keeps only the bio facts + the creation seed (no longer duplicating the chronicle prose).
        return (!character.chronicleCache?.text && b.story) ? `<p class="map-details-desc" style="margin-top:8px">${esc(b.story)}</p>` : ""; })()}</div>` : ""}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Attributes ${infoDot("growth.attributes")} <span class="hint" style="text-transform:none">(knee at ${soft}: full value to there, +5/point beyond, cap ${cap})</span></h3>
      ${SUBS.map(sub => { const v = character.subAttributes?.[sub] ?? 0; return `
        <div class="cs-attr"><span class="cs-attr-name" title="${esc(SUB_DESC[sub])}">${sub}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, v / cap * 100)}%"></div><div class="cs-knee" style="left:${soft / cap * 100}%"></div></div>
          <span class="cs-val">${v}</span>
          ${character.pendingSubPoints > 0 && v < cap ? `<button class="grow-btn" data-grow2="${sub}">+</button>` : ""}
        </div>`; }).join("")}</div>
    ${character.domains?.primary ? (() => {
      // SNG-101/102: the great-circle domains you hold — station, ceiling, promotions, foreclosures.
      const ROM = ["", "I", "II", "III", "IV", "V"];
      const ceilOf = (t, def) => character.domainCeilings?.[t] ?? def;
      const rows = [["primary", 5], ["secondary", 3], ["tertiary", 2]].filter(([k]) => character.domains?.[k]).map(([k, def]) => {
        const t = character.domains[k]; const c = ceilOf(t, def); const promoted = character.domainCeilings?.[t] != null && c > def;
        return `<div class="codex-fact"><strong class="trait-tap" data-trait="tradition:${esc(t)}" title="tap: lore + mechanics">${esc(traditionLabel(t))}</strong> — ${k}${promoted ? " · <em>promoted</em>" : ""}, to Tier ${ROM[c]}</div>`;
      }).join("");
      const acq = (character.domainsAcquired || []).map(t => `<div class="codex-fact"><strong class="trait-tap" data-trait="tradition:${esc(t)}" title="tap: lore + mechanics">${esc(traditionLabel(t))}</strong> — acquired, to Tier ${ROM[ceilOf(t, 1)]}</div>`).join("");
      const fore = (character.foreclosed || []).length ? `<div class="hint">Foreclosed — reachable only as a braid: ${character.foreclosed.map(traditionLabel).join(", ")}</div>` : "";
      const promos = ["tertiary", "secondary"].map(k => {
        if (!character.domains?.[k]) return ""; const e = promotionEligible(character, k, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
        if (!e.eligible) return ""; return `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>✦ You may rise:</strong> become ${esc(traditionLabel(e.trad))} as your ${e.to} <button class="grow-btn practiced" data-promote="${k}">Promote…</button></div>`;
      }).join("");
      // SNG-102: a new people you may JOIN — any tradition you have a willing teacher for that's acquirable
      // (plus a GM-offered one). The teacher is the gate, so the candidate set is bounded.
      const acqTargets = [...new Set([...(character.pendingAcquisition ? [character.pendingAcquisition] : []), ...Object.keys(character.teachers || {})])];
      const acqs = acqTargets.filter(t => acquirable(character, t, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex }).ok)
        .map(t => `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>✦ You may join:</strong> become of the ${esc(traditionLabel(t))} (enters at Tier I) <button class="grow-btn practiced" data-acquire="${esc(t)}">Join…</button></div>`).join("");
      return `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Domains ${infoDot("circle.domains")}</h3>${rows}${acq}${fore}${promos}${acqs}</div>`;
    })() : ""}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Abilities ${infoDot("ability.tiers")} <span class="cap-line" style="text-transform:none">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity; new points learn other crafts" : ""}</span>${atCapacity(character, CONTENT.skillCapacity) ? infoDot("lock.capacity") : ""}</h3>
      ${character.pendingMasteryFork ? (() => { const fb = fullCatalog()[character.pendingMasteryFork]; return `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>⑂ A defining moment for ${esc(fb?.name || character.pendingMasteryFork)}</strong> — choose its path to master it. <button class="grow-btn practiced" data-masteryfork="${esc(character.pendingMasteryFork)}">Choose path</button></div>`; })() : ""}
      ${character.abilities.map(a => { const ab = fullCatalog()[a.abilityId]; if (!ab) return ""; const cost = effectiveEnergyCost(ab, character, rules);
        const p = rankProgress(character, a.abilityId);
        return `<div class="cs-ability"><span class="tier-badge">${tierOf(ab.levelReq)}</span> <strong>${esc(ab.name)}</strong> <span class="hint">(${ab.powerSystem === "learned" ? "learned" : ab.powerSystem}) · ${cost} energy${cost < ab.energyCost ? ` (was ${ab.energyCost})` : ""}</span>
          <span class="cs-ranks">${[1, 2, 3].map(r => `<span class="${r <= a.level ? "cs-rank-on" : "cs-rank-off"}" title="${esc(ab.tree?.[r - 1]?.name || "")}">${r <= a.level ? "●" : "○"}</span>`).join("")}</span>
          ${ab.tree?.[a.level - 1] ? `<div class="hint">${esc(ab.tree[a.level - 1].name)}: ${esc(ab.tree[a.level - 1].grants)}</div>` : ""}
          <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div></div>`; }).join("")}
      ${(character.discoveries || []).map(d => `<div class="discovery" title="${esc(d.description)}">✦ ${esc(d.name)} (discovered technique)</div>`).join("")}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Aspirations <span class="hint" style="text-transform:none">(declare what you're working toward — practice makes it free)</span></h3>
      ${(character.practice?.aspirations || []).map(a => { const ab = fullCatalog()[a.abilityId]; const ripe = aspirationRipe(character, a.abilityId, rules); const need = rules.practice?.aspirationRipe ?? 10;
        return `<div class="cs-attr"><span class="cs-attr-name trait-tap" style="width:140px" data-trait="aspiration:${esc(a.abilityId)}" title="tap: lore + mechanics">${esc(ab?.name || a.abilityId)}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, (a.progress || 0) / need * 100)}%"></div></div>
          <span class="cs-val">${Math.min(a.progress || 0, need)}/${need}</span>
          ${ripe && character.level >= (learnLevelReq(ab) ?? 99) ? `<button class="grow-btn practiced" data-asplearn="${esc(a.abilityId)}" title="Fully practiced — learn free">✓</button>` : ""}
          <button class="grow-btn" data-aspdrop="${esc(a.abilityId)}" title="Drop aspiration" style="background:var(--panel2); color:var(--ink-dim)">×</button>
        </div>`; }).join("") || "<div class='insight'>none declared</div>"}
      ${(character.practice?.aspirations || []).length < (rules.practice?.maxAspirations ?? 2) ? `
        <select id="asp-pick" style="margin-top:6px; max-width:280px">
          <option value="">Aspire toward…</option>
          ${Object.values(fullCatalog()).filter(ab => !character.abilities.some(a => a.abilityId === ab.id) && learnLevelReq(ab) !== null && domainVerdict(ab).allowed && !(character.practice?.aspirations || []).some(a => a.abilityId === ab.id)).map(ab => `<option value="${esc(ab.id)}">${esc(ab.name)} (${esc(traditionLabel(abilityTradition(ab) || ab.powerSystem))}, lv ${learnLevelReq(ab)})</option>`).join("")}
        </select>` : ""}
    </div>
    ${(() => {
      const combos = ripeCombos(character, CONTENT.emergence, rules);
      const branches = ripeBranches(character, CONTENT.emergence);
      if (!combos.length && !branches.length) return "";
      return `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Ripe to claim <span class="hint" style="text-transform:none">(practice has ripened these — claim now or let the GM offer them in play)</span></h3>
        ${combos.map(r => `<div class="cs-ability"><strong>${esc(r.name)}</strong> <span class="hint">(combo: ${r.components.join(" + ")})</span> <button class="grow-btn practiced" data-claimcombo="${esc(r.id)}">claim</button><div class="hint">${esc(r.description.slice(0, 120))}</div></div>`).join("")}
        ${branches.map(t => `<div class="cs-ability"><strong>${esc(t.name)}</strong> <span class="hint">(branch: grows ${t.growsAbility})</span> <button class="grow-btn practiced" data-claimbranch="${esc(t.id)}">claim</button><div class="hint">${esc(t.grants.slice(0, 120))}</div></div>`).join("")}
      </div>`;
    })()}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Play-style (${esc(character.name)}'s own)</h3>
      ${aptitudeChips()}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Active quests ${infoDot("quest.routes")}</h3>
      ${(character.quests || []).filter(q => q.status === "active").map(q => `<div class="codex-fact"><strong>${esc(q.title)}</strong> — ${esc(q.progress?.slice(-1)[0] || q.summary)}</div>`).join("") || "<div class='insight'>none</div>"}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Companions ${infoDot("companion.bond")}</h3>
      ${activeCompanions(character, CONTENT.companions).map(c => `<div class="codex-fact"><strong>${esc(c.name)}</strong> — assists: ${(c.assistTags || []).join(", ")}</div>`).join("") || "<div class='insight'>traveling alone</div>"}</div>
    ${canLevelUp(character) ? `<button class="btn" id="cs-levelup" style="margin-top:10px; margin-right:8px">⬆ Level Up${character.skillPoints ? ` (${character.skillPoints})` : ""}</button>` : ""}
    <button class="btn secondary" id="cs-skillgraph" style="margin-top:10px; margin-right:8px">✦ Skill Wheel</button>
    <button class="btn secondary" id="cs-repair" style="margin-top:10px; margin-right:8px" title="Fix what the game got wrong at creation — domains, background, form, or an ability you never chose. No arguing with the GM.">🔧 Repair character</button>
    <button class="btn secondary" id="cs-back" style="margin-top:10px">Back</button>
  </div>`);
  for (const btn of app.querySelectorAll("[data-grow2]")) btn.onclick = () => { if (spendSubPoint(character, btn.dataset.grow2, rules)) { saveCharacter(character); renderCharacterScreen(); } };
  // ability-arch v2: mastery of a craft that forks at rank 3 — the GM marked the defining moment; the
  // player chooses the permanent path (Law 9), then the engine lands rank 3.
  for (const btn of app.querySelectorAll("[data-masteryfork]")) btn.onclick = () => {
    const id = btn.dataset.masteryfork;
    renderForkModal(id, (key) => {
      setFork(character, id, key, CONTENT.branchForks);
      autoVerifyLeg("b5-fork", "chose a branch fork — the other path locks");
      const r = markDefiningMoment(character, id, CONTENT.rules, { attributeGates: CONTENT.attributeGates, branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
      if (r.ok) character.pendingMasteryFork = null;
      saveCharacter(character); renderCharacterScreen();
    });
  };
  // SNG-101: promotion — the player commits (Law 9), the modal names the foreclosure cost.
  for (const btn of app.querySelectorAll("[data-promote]")) btn.onclick = () => renderPromotionModal(btn.dataset.promote);
  // SNG-102: acquisition — join a new people (Tier I), forecloses their antipode. Player commits.
  for (const btn of app.querySelectorAll("[data-acquire]")) btn.onclick = () => renderAcquisitionModal(btn.dataset.acquire);
  const aspPick = document.getElementById("asp-pick");
  if (aspPick) aspPick.onchange = () => { if (aspPick.value) { const r = declareAspiration(character, aspPick.value, rules); if (r.ok) { saveCharacter(character); renderCharacterScreen(); } else alert(r.why); } };
  for (const btn of app.querySelectorAll("[data-aspdrop]")) btn.onclick = () => { dropAspiration(character, btn.dataset.aspdrop); saveCharacter(character); renderCharacterScreen(); };
  for (const btn of app.querySelectorAll("[data-asplearn]")) btn.onclick = () => {
    const id = btn.dataset.asplearn;
    const r = learnAbility(character, id, fullCatalog(), rules, { free: true, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) { dropAspiration(character, id); saveCharacter(character); renderCharacterScreen(); } else alert(r.why);
  };
  for (const btn of app.querySelectorAll("[data-claimcombo]")) btn.onclick = () => {
    const tpl = validEmergenceId(character, CONTENT.emergence, rules, btn.dataset.claimcombo);
    if (!tpl) return renderCharacterScreen();
    const nn = prompt(`Name your new technique (or leave as "${tpl.name}"):`, tpl.name);
    acceptCombo(character, tpl, (nn || tpl.name).slice(0, 60), readClock(character.clock).day);
    saveCharacter(character); renderCharacterScreen();
  };
  for (const btn of app.querySelectorAll("[data-claimbranch]")) btn.onclick = () => {
    const tpl = validEmergenceId(character, CONTENT.emergence, rules, btn.dataset.claimbranch);
    if (tpl) { acceptBranch(character, tpl); saveCharacter(character); }
    renderCharacterScreen();
  };
  const luBtn2 = document.getElementById("cs-levelup"); if (luBtn2) luBtn2.onclick = () => renderLevelUp();
  const sgBtn = document.getElementById("cs-skillgraph"); if (sgBtn) sgBtn.onclick = () => { wheelLearnMode = false; renderSkillWheel(); }; // SNG-218 §3: full kit view (owned crafts shown)
  const repBtn = document.getElementById("cs-repair"); if (repBtn) repBtn.onclick = () => renderRepairScreen();
  wireCharacterTabs();
  // SNG-053 form editor: describe the character's physical form so the portrait renders it
  const formB = document.getElementById("cs-form");
  if (formB) formB.onclick = () => {
    const cur = character.form || "";
    const next = prompt("Describe this character's physical form / species — the portrait leads with this.\n(e.g. \"a towering treefolk of bark and heartwood, moss-bearded, eyes like knots of amber\")", cur);
    if (next === null) return;
    character.form = next.trim() || undefined;
    // a new form means a new portrait — re-mint so the picture matches
    if (imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "reforged" });
    saveCharacter(character);
    renderCharacterScreen();
  };
  // SNG-035 portrait + gallery controls
  const genP = document.getElementById("cs-gen-portrait");
  if (genP) genP.onclick = () => { ensureCharacterPortrait(character); saveCharacter(character); renderCharacterScreen(); };
  const regenP = document.getElementById("cs-regen-portrait");
  if (regenP) regenP.onclick = () => regeneratePortraitFlow();
  const galB = document.getElementById("cs-gallery");
  if (galB) galB.onclick = () => renderGallery();
  document.getElementById("cs-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

/** SNG-110: re-mint the portrait with optional per-generation intent — a one-off scene description
 *  (used for this image only, never persisted over the base appearance) and/or a committed partner
 *  in frame (opt-in, never automatic). The floors still run after every addition. */
function regeneratePortraitFlow() {
  const override = prompt("New portrait — describe this specific scene or look, or leave blank to re-mint from the character as they are.\n(This is used for THIS image only — it doesn't change your saved appearance.)", "");
  if (override === null) return; // cancelled
  const promptOpts = {};
  const one = override.trim();
  if (one) promptOpts.appearanceOverride = one;
  const partners = partnerAdjacentNpcs(character, CONTENT.rules);
  if (partners.length && confirm(`Include ${partners[0].name} (your ${partners[0].label}) in this portrait?`)) {
    const n = character.npcRegistry?.[partners[0].id];
    promptOpts.withCompanion = { name: partners[0].name, appearance: n?.appearance || n?.description || "" };
  }
  ensureCharacterPortrait(character, { force: true, milestone: one || partners.length ? "a portrait you asked for" : `level ${character.level}`, promptOpts });
  saveCharacter(character);
  renderCharacterScreen();
}

/** SNG-035: the Saga gallery — every image this character has accrued (portraits, born-with-image
 *  people/places, moment art), newest first. */
// CCODE-31: the gallery's category filter — the order the chips render + their labels. "all" is implicit.
const GALLERY_CATS = [["portraits", "Portraits"], ["people", "People"], ["skills", "Skills"], ["places", "Places"], ["beasts", "Beasts"], ["moments", "Moments"]];
let galleryFilter = "all"; // CCODE-31: the active category chip (module state, survives re-renders)
function renderGallery() {
  const gallery = character.gallery || [];
  // CCODE-31: bucket every image by category so the chips can show counts + the grid can filter (Erik: skill
  // images were flooding the portrait gallery uncategorized).
  const counts = {}; for (const g of gallery) { const c = galleryCategory(g); counts[c] = (counts[c] || 0) + 1; }
  const present = GALLERY_CATS.filter(([key]) => counts[key]);
  if (galleryFilter !== "all" && !counts[galleryFilter]) galleryFilter = "all"; // the last filter emptied out → fall back
  const shown = galleryFilter === "all" ? gallery : gallery.filter(g => galleryCategory(g) === galleryFilter);
  const chip = (key, label, n) => `<button class="opt gal-cat ${galleryFilter === key ? "selected" : ""}" data-galcat="${key}">${galleryFilter === key ? "✓ " : ""}${esc(label)} <span class="cost">${n}</span></button>`;
  chrome(`<div class="screen" style="max-width:860px">
    <h2>${esc(character.name)} — Gallery</h2>
    <p class="hint" style="margin-bottom:10px">${imagesEnabled()
      ? "Portraits, the people and places you've grown, the crafts you wield, the beasts that came for you, and the moments worth a picture. New art is added as you play."
      : "Image generation is off. Turn on <strong>Settings → Scene &amp; item art → Generate</strong> to start seeing the world."}</p>
    ${gallery.length ? `<div class="gal-cats" style="margin-bottom:12px">${chip("all", "All", gallery.length)}${present.map(([key, label]) => chip(key, label, counts[key])).join("")}</div>` : ""}
    ${shown.length ? `<div class="gallery-grid">${shown.map(g => { const gi = gallery.indexOf(g); return `
      <figure class="gallery-item">
        ${/* CCODE-32: a flaky image (pollinations rate-limits when many load at once) used to HIDE its whole tile
              (onerror → display:none), so a gallery of 48 looked like 3 — Erik's "something is collapsing them".
              Now: auto-retry ONCE with a cache-bust (recovers the transient failures), then leave a PLACEHOLDER
              tile (never hide it) so the count matches the grid and the image is retryable, not vanished. */""}
        <img src="${esc(g.url)}" alt="${esc(g.caption || g.kind)}" data-lightbox="gallery" data-lbgroup="gallery" data-lbindex="${gi}" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src=this.src+(this.src.includes('?')?'&':'?')+'_r='+Date.now()}else{this.closest('.gallery-item')?.classList.add('gallery-broken')}">
        <button class="gallery-retry" data-galretry title="This image didn't load — try again">⟳ retry</button>
        <button class="gallery-del" data-galdel="${esc(g.url)}" title="Remove this image">✕</button>
        ${character.portrait === g.url ? "" : `<button class="gallery-pick" data-galpick="${esc(g.url)}" title="Make this the character's portrait">★ Set as portrait</button>`}
        <figcaption>${esc(g.caption || g.kind)}${character.portrait === g.url ? ` <span class="rep-band trusted">portrait${character.portraitPinned ? " · pinned" : ""}</span>` : ""}${g.worldDay ? ` <span class="hint">· world-day ${g.worldDay}</span>` : ""}</figcaption>
      </figure>`; }).join("")}</div>`
      : gallery.length ? "<div class='insight'>Nothing in this category yet.</div>"
      : "<div class='insight'>No images yet — a portrait is minted at creation (with art on), and the world fills in as you play.</div>"}
    <button class="btn secondary" id="gal-back" style="margin-top:14px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-galcat]")) b.onclick = () => { galleryFilter = b.dataset.galcat; renderGallery(); };
  // CCODE-32: manually re-try a placeholder tile — cache-bust the src so pollinations serves it fresh (same seed
  // → same image, just re-fetched). Clears the broken state; the img's own auto-retry counter resets on success.
  for (const b of app.querySelectorAll("[data-galretry]")) b.onclick = () => {
    const fig = b.closest(".gallery-item"); const img = fig?.querySelector("img"); if (!img) return;
    fig.classList.remove("gallery-broken"); delete img.dataset.retried;
    const base = String(img.getAttribute("src") || "").split(/[?&]_r=/)[0];
    img.src = base + (base.includes("?") ? "&" : "?") + "_r=" + Date.now();
  };
  for (const b of app.querySelectorAll("[data-galdel]")) b.onclick = () => {
    const url = b.dataset.galdel;
    if (!confirm("Remove this image?")) return;
    const { wasPortrait } = deleteGalleryImage(character, url);
    if (wasPortrait) { character.portraitPinned = false; if (imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "reforged" }); } // the pinned face is gone → unpin + never leave the character imageless
    saveCharacter(character);
    renderGallery();
  };
  // SNG-139: the player curates their own face — pick any gallery image as the portrait. A user pick PINS
  // it, so an auto level-up regen (refreshPortraitMilestone) never silently overrides the chosen one.
  for (const b of app.querySelectorAll("[data-galpick]")) b.onclick = () => {
    character.portrait = b.dataset.galpick; character.portraitPinned = true;
    saveCharacter(character); renderGallery();
  };
  document.getElementById("gal-back").onclick = () => renderCharacterScreen();
}

// SNG-168 §2: post the CURRENT turn to the family feed — a deliberate share (the per-post consent IS this
// click + confirm; the value is the CHOOSING). Builds the post (narration + image + world-date + the poster's
// RATING for the lens), then appends it to the ONE shared feed file via pushMergedFile (merge-safe, concurrent
// writers never clobber). ⛔ NEVER canon — a feed post never hydrates into anyone's CONTENT (that's the
// separate shared-canon path). Family-sync only (a shared feed needs the shared repo).
async function postTurnToFeed(turn) {
  if (!turn || !syncEnabled() || !character) return;
  // the turn's own image, else the most recent moment/scene image in the gallery (a turn re-rendered via an
  // aside can lose turn.momentArt, but the gallery keeps it) — so a post carries its picture when one exists.
  const galImg = [...(character.gallery || [])].reverse().find(g => g && g.url && (g.kind === "moment" || g.kind === "scene"))?.url || null;
  const post = buildFeedPost({
    turn, character, playerKey: getPlayerKey(),
    worldDay: absoluteWorldDay(), worldDateLabel: worldDate().label,
    rating: ratingCeilingNow(), image: turn.momentArt || galImg, at: Date.now()
  });
  if (!post) { renderPlay(turn, { aside: "Nothing to post from this beat." }); return; }
  const preview = smartClamp(post.narration, 160);
  if (!confirm(`Post this moment to the family feed?\n\n"${preview}"\n\nThey'll see it lensed to their rating. It never changes anyone's game.`)) return;
  const btn = document.getElementById("post-to-feed"); if (btn) { btn.disabled = true; btn.textContent = "Posting…"; }
  try {
    await pushMergedFile(FEED_PATH, (remote) => appendFeedPost(remote, post), `feed: ${character.name || character.id} shared a moment`);
    renderPlay(turn, { aside: "📮 Posted to the family feed." });
  } catch (e) {
    renderPlay(turn, { aside: `Couldn't post right now — the moment is safe, try again. (${e?.message || "sync error"})` });
  }
}

// SNG-168 §2: the FAMILY FEED — moments the family CHOSE to share, reverse-chron, RATING-LENSED on read (a post
// above your ceiling is softened, or hidden entirely — the same lens shared canon uses). ⛔ NOT canon: reading
// the feed never changes your game. Pulls the one shared feed file; the "family" is everyone on the shared valley.
async function renderFeed() {
  chrome(`<div class="screen" style="max-width:1000px"><h2>📮 The Family Feed</h2>
    <div class="hint">Moments the family chose to share — lensed to your rating. Nothing here is canon; it never touches your game.</div>
    <div id="feed-body" class="feed-body" style="margin-top:12px"><div class="insight">Loading the feed…</div></div>
    <button class="btn secondary" id="feed-back" style="margin-top:14px">Back</button></div>`);
  document.getElementById("feed-back").onclick = () => renderPlay(character?.activeScene?.lastTurn || null, {});
  const body = document.getElementById("feed-body");
  try {
    const store = await fetchRepoJSON(FEED_PATH);
    const posts = feedForViewer(store || {}, profile);
    if (!posts.length) { body.innerHTML = `<div class="insight">No posts yet. Share a moment you love — tap 📮 Post to feed on a turn — or a whole session's story from your Chronicle.</div>`; return; }
    body.innerHTML = posts.map(p => `<div class="feed-post${p.lensed ? " lensed" : ""}${p.kind === "synopsis" ? " feed-synopsis" : ""}">
      <div class="feed-head">${p.kind === "synopsis" ? `<span class="feed-kind">📖 Session</span> ` : ""}<strong>${esc(p.characterName || "someone")}</strong>${p.location ? ` · <span class="hint">${esc(CONTENT.locations[p.location]?.name || p.location)}</span>` : ""}${p.worldDateLabel ? ` · <span class="hint">${esc(p.worldDateLabel)}</span>` : ""}</div>
      <div class="feed-row">
        ${p.image ? `<img class="feed-img" src="${esc(p.image)}" alt="a shared moment" data-lightbox="feed" loading="lazy" onerror="this.style.display='none'">` : ""}
        <div class="feed-text">${p.narration.split(/\n\n+/).map(renderProseHtml).join("")}${p.caption ? `<div class="feed-caption">${esc(p.caption)}</div>` : ""}</div>
      </div></div>`).join("");
  } catch (e) {
    body.innerHTML = `<div class="insight">The feed couldn't load right now (${esc(e?.message || "sync error")}). Try again in a moment.</div>`;
  }
}

/** SNG-085: the Repair panel — expose engine/corrections.js DIRECTLY to the player. A bug the game
 *  gave you (a domain it guessed, an ability off the wrong pole, a background you never chose) must be
 *  fixable WITHOUT negotiating with a language model. Same engine, same guardrails, same ledger as the
 *  GM's in-fiction repair (`applyStateOps`) — it just can't argue. REPAIR, NOT WISH: the engine refuses
 *  anything that ADVANCES (xp/levels/abilities-out-of-domain); power still comes from play. */
function repairLogLine(e) {
  const day = e.worldDay != null ? ` <span class="hint">· world-day ${e.worldDay}</span>` : "";
  let txt;
  switch (e.kind) {
    case "field": txt = `${esc(e.field)}: <s class="hint">${esc(e.from || "—")}</s> → <strong>${esc(e.to || "—")}</strong>`; break;
    case "domain": txt = `${esc(e.field)} domain: <s class="hint">${esc(e.from ? traditionLabel(e.from) : "—")}</s> → <strong>${esc(e.to ? traditionLabel(e.to) : "—")}</strong>`; break;
    case "remove": txt = `removed ${esc(e.entity)} <strong>${esc(e.id)}</strong>`; break;
    case "quest": txt = `quest ${esc(e.id)} → <strong>${esc(e.to?.status || "?")}</strong>`; break;
    case "location": txt = `re-anchored → <strong>${esc(e.to)}</strong>`; break;
    case "codexFact": txt = `codex fact ${esc(e.id)} corrected`; break;
    case "abilityRank": txt = `${esc(e.id)} rank: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "bond": txt = `relationship with ${esc(e.id)} set right`; break;
    case "vital": txt = `${esc(e.field)}: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "attribute": txt = `${esc(e.field)}: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "merge": txt = `merged a duplicate record into <strong>${esc(e.into)}</strong>`; break;
    default: txt = "corrected";
  }
  return `<div class="codex-fact">${txt}${day}${e.why ? `<div class="hint">${esc(e.why)}</div>` : ""}</div>`;
}

function renderRepairScreen(note = "") {
  const idx = CONTENT.traditionIndex;
  const origins = CONTENT.origins?.length ? CONTENT.origins : originsFallback();
  const dom = character.domains || { primary: null, secondary: null, tertiary: null };
  const cap = breadthCap(character, CONTENT.skillCapacity);
  const used = breadthUsed(character);
  // every real tradition, ring order, for the three domain slots (+ "leave empty")
  const tradOptions = (sel) => `<option value="">— none —</option>` +
    (idx ? ringOrder(idx).map(t => `<option value="${esc(t)}" ${sel === t ? "selected" : ""}>${esc(traditionLabel(t))}</option>`).join("") : "");
  const log = (character.corrections || []).slice().reverse();
  const anomalies = detectAnomalies(character, { rules: CONTENT.rules }); // SNG-137: cheap consistency check, advisory
  chrome(`<div class="screen" style="max-width:720px">
    <h2>🔧 Repair ${esc(character.name)}</h2>
    <p class="hint" style="margin-bottom:6px">Fix what the game got wrong when this character was made — no arguing with the GM. Every change is validated, logged, and reversible.</p>
    <p class="hint" style="margin-bottom:14px"><strong>Repair, not wish:</strong> you can correct data that is <em>wrong</em>, but nothing here grants power — xp, levels, and abilities still come from play. Stripping an ability you never chose is a repair, not a loss; it frees your breadth so you can re-pick with your own skill points.</p>
    ${note ? `<div class="cs-block" style="border-left:3px solid var(--accent)"><div style="white-space:pre-wrap">${esc(note)}</div></div>` : ""}

    ${anomalies.length ? `<div class="cs-block" style="border-left:3px solid #c0392b">
      <h3 class="codex-title" style="font-size:15px">⚠ Issues the game spotted <span class="hint" style="text-transform:none">— ${anomalies.length}</span></h3>
      <p class="hint" style="margin-bottom:8px">These look like data that drifted. Tick to fix, then Apply — each is a <strong>repair</strong> (two records merged into one, a vital re-synced to its max, or a rank set back to what practice earned), never a loss of anything you earned.</p>
      ${anomalies.map((an, i) => `<label class="rating-check"><input type="checkbox" data-fix="${i}" checked> ${esc(an.note)}${an.kind === "rankOverPractice" ? ` <span class="hint">(→ rank ${an.suggestRank})</span>` : ""}</label>`).join("")}
    </div>` : ""}

    <div class="field"><label>Why this repair (optional — recorded in the log)</label>
      <input id="rp-why" placeholder="e.g. I was meant to be an Ashwarden, not a Wright"></div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Your people &amp; craft</h3>
      <div class="field"><label>Origin (your people)</label>
        <select id="rp-origin">${origins.map(o => `<option value="${esc(o.id)}" ${character.origin === o.id ? "selected" : ""}>${esc(o.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Background</label>
        <select id="rp-bg">${backgroundOptionsHTML(character.background)}</select></div>
      <div class="field"><label>Form (physical description — leads the portrait)</label>
        <input id="rp-form" value="${esc(character.form || "")}" placeholder="e.g. a lean woman with ash-grey braids and a mourner's shawl"></div>
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Domains <span class="hint" style="text-transform:none">— the poles you draw from</span></h3>
      <p class="hint" style="margin-bottom:8px">Changing a domain re-sets which crafts you can <em>learn next</em>. Abilities you already hold are kept (grandfathered) — use the strip list below to remove ones you should never have had.</p>
      ${["primary", "secondary", "tertiary"].map(slot => `
        <div class="field"><label style="text-transform:capitalize">${slot} domain</label>
          <select id="rp-dom-${slot}">${tradOptions(dom[slot])}</select></div>`).join("")}
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Strip an ability you never chose <span class="cap-line" style="text-transform:none">${used} of ${cap} breadth used</span></h3>
      <p class="hint" style="margin-bottom:8px">Tick any ability the game gave you that belongs to the wrong pole. Stripping it frees breadth so you can pick your own — you do <em>not</em> lose earned power, and your skill points are untouched.</p>
      ${character.abilities.length ? character.abilities.map(a => { const ab = fullCatalog()[a.abilityId]; return `
        <label class="rating-check"><input type="checkbox" data-strip="${esc(a.abilityId)}"> Strip <strong>${esc(ab?.name || a.abilityId)}</strong> <span class="hint">${ab ? `(${esc(abilityTradition(ab) ? traditionLabel(abilityTradition(ab)) : ab.powerSystem)}, rank ${a.level})` : ""}</span></label>`; }).join("") : "<div class='insight'>no abilities to strip</div>"}
    </div>

    ${activeCompanions(character, CONTENT.companions).length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Remove a companion you never met</h3>
      ${activeCompanions(character, CONTENT.companions).map(c => `
        <label class="rating-check"><input type="checkbox" data-rmcomp="${esc(c.id)}"> Remove <strong>${esc(c.name)}</strong></label>`).join("")}
    </div>` : ""}

    ${(character.quests || []).length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Unstick a quest</h3>
      <p class="hint" style="margin-bottom:8px">Force a stuck thread to a sane status. Leave "no change" for quests that are fine.</p>
      ${(character.quests || []).map(q => `
        <div class="cs-attr"><span class="cs-attr-name" style="width:auto; flex:1" title="${esc(q.summary || "")}">${esc(q.title || q.id)} <span class="hint">(${esc(q.status || "?")})</span></span>
          <select data-quest="${esc(q.id)}" style="max-width:160px">
            <option value="">no change</option>
            ${["active", "available", "resolved", "failed"].map(s => `<option value="${s}" ${q.status === s ? "disabled" : ""}>${s}</option>`).join("")}
          </select></div>`).join("")}
    </div>` : ""}

    ${Object.keys(character.npcRegistry || {}).length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Set a person's gender <span class="hint" style="text-transform:none">— the game rendered someone wrong? fix it here</span></h3>
      <p class="hint" style="margin-bottom:8px">Gender is explicit data now — the portrait and narration read it. Type a value to set or correct it; leave blank to keep. Free and inclusive (woman, man, nonbinary, …). A corrected portrait re-mints with the right gender.</p>
      ${Object.values(character.npcRegistry).slice(0, 30).map(n => `
        <div class="cs-attr"><span class="cs-attr-name" style="width:auto; flex:1">${esc(n.name || n.id)} <span class="hint">${esc(n.gender || "— unset —")}</span></span>
          <input data-npcgender="${esc(n.id)}" placeholder="woman / man / …" value="" style="max-width:160px"></div>`).join("")}
    </div>` : ""}

    <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap">
      <button class="btn" id="rp-apply">Apply repairs</button>
      <button class="btn secondary" id="rp-back">Back</button>
    </div>

    ${log.length ? `<div class="cs-block" style="margin-top:16px"><h3 class="codex-title" style="font-size:15px">Repair log <span class="hint" style="text-transform:none">(a repair is a fact about your character, not a secret)</span></h3>
      ${log.map(repairLogLine).join("")}</div>` : ""}
  </div>`);

  document.getElementById("rp-back").onclick = () => renderCharacterScreen();
  document.getElementById("rp-apply").onclick = () => {
    const why = (document.getElementById("rp-why").value || "").trim() || "repaired via the Repair panel";
    const ops = [];
    const originVal = document.getElementById("rp-origin").value;
    if (originVal && originVal !== character.origin) ops.push({ op: "correctField", field: "origin", to: originVal, why });
    const bgVal = document.getElementById("rp-bg").value;
    if (bgVal && bgVal !== character.background) ops.push({ op: "correctField", field: "background", to: bgVal, why });
    const formVal = document.getElementById("rp-form").value.trim();
    if (formVal !== (character.form || "")) ops.push({ op: "correctField", field: "form", to: formVal, why });
    for (const slot of ["primary", "secondary", "tertiary"]) {
      const v = document.getElementById("rp-dom-" + slot).value || null;
      if (v !== (dom[slot] || null)) ops.push({ op: "correctDomain", slot, to: v, why });
    }
    for (const cb of app.querySelectorAll("[data-strip]:checked")) ops.push({ op: "removeEntity", kind: "ability", id: cb.dataset.strip, why });
    for (const cb of app.querySelectorAll("[data-rmcomp]:checked")) ops.push({ op: "removeEntity", kind: "companion", id: cb.dataset.rmcomp, why });
    for (const sel of app.querySelectorAll("[data-quest]")) { if (sel.value) ops.push({ op: "unstickQuest", questId: sel.dataset.quest, toStatus: sel.value, why }); }
    // SNG-143: set/correct a known person's gender — derive obvious pronouns, leave the rest free
    for (const inp of app.querySelectorAll("[data-npcgender]")) {
      const v = (inp.value || "").trim(); if (!v) continue;
      const s = v.toLowerCase();
      const pr = /\b(woman|female|she|girl|lady)\b/.test(s) ? "she/her" : /\b(man|male|he|boy|guy)\b/.test(s) ? "he/him" : /\b(nonbinary|non-binary|enby|they|nb)\b/.test(s) ? "they/them" : undefined;
      ops.push({ op: "correctNpcGender", id: inp.dataset.npcgender, gender: v, pronouns: pr, why });
    }
    // SNG-137: one-click fixes for the anomalies the game spotted — each maps to a repair op
    for (const cb of app.querySelectorAll("[data-fix]:checked")) {
      const an = anomalies[Number(cb.dataset.fix)];
      if (!an) continue;
      if (an.kind === "dupNpc") ops.push({ op: "mergeEntity", fromId: an.fromId, intoId: an.intoId, why });
      else if (an.kind === "rankOverPractice") ops.push({ op: "correctAbilityRank", id: an.abilityId, to: an.suggestRank ?? an.level - 1, why });
      else if (an.kind === "vitalDesync") ops.push({ op: "correctVital", vital: an.vital, to: an.max, why });
    }
    if (!ops.length) { renderRepairScreen("Nothing changed — adjust a field, then Apply."); return; }
    // applyStateOps caps at 6 ops per call by design — chunk so a big repair applies fully.
    const ctx = { backgrounds: CONTENT.backgrounds || [], traditionIndex: CONTENT.traditionIndex, locations: CONTENT.locations, resolveLocationId, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString() };
    const applied = [], refused = [];
    for (let i = 0; i < ops.length; i += 6) { const r = applyStateOps(character, ops.slice(i, i + 6), ctx); applied.push(...r.applied); refused.push(...r.refused); }
    // a new form means a new portrait — re-mint so the picture matches (mirrors the sheet's form editor)
    if (applied.some(a => a.field === "form") && imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "repaired" });
    saveCharacter(character);
    const stripped = applied.filter(a => a.removed === "ability").length;
    let out = applied.length ? "✓ " + applied.map(describeCorrection).join("; ") + "." : "No changes applied.";
    if (stripped) out += ` Your breadth is freed${character.skillPoints > 0 ? ` — spend your ${character.skillPoints} skill point${character.skillPoints === 1 ? "" : "s"} on your own people's crafts in the Character screen` : ""}.`;
    if (refused.length) out += `\n\nRefused: ${refused.map(r => r.reason).join("; ")}.`;
    renderRepairScreen(out);
  };
}

// SNG-215 §B: a physical KIND-icon per item so the bag reads at a glance (a bag of objects, not a list).
const ITEM_KIND_ICON = { weapon: "⚔", tool: "⚒", consumable: "🧪", quest: "📜", relic: "◈", trinket: "◈", armor: "🛡", armour: "🛡", misc: "◌" };
const itemKindIcon = it => ITEM_KIND_ICON[it?.kind] || "◌";

// SNG-215 §B: the inventory is a BAG — a grid of tiny kind-icon tiles you scan, each opening a DETAIL POPUP
// (the larger generated image + full description + mechanics: kind, uses, equip, growth + the use/name/drop
// actions). Icons in the grid (fast, no quota); the image generates only for the item you actually open
// (Erik's call). Reuses itemCard (image + mechanics + actions) inside the modal, and the ONE shared binding.
function renderInventoryScreen(openName = null) {
  const kinds = ["weapon", "tool", "consumable", "quest", "misc"];
  const inv = character.inventory || [];
  const openIt = openName ? inv.find(i => i.name === openName) : null;
  const tile = it => `<button class="bag-tile${it.pinned ? " pinned" : ""}${openName === it.name ? " sel" : ""}" data-inv="${esc(it.name)}" title="${esc(displayName(it))}">
    <span class="bag-icon">${itemKindIcon(it)}</span>
    <span class="bag-name">${esc(displayName(it))}${it.qty > 1 ? ` ×${it.qty}` : ""}</span>
    ${it.equipped ? `<span class="bag-flag" title="equipped">▸</span>` : ""}${it.pinned ? `<span class="bag-flag" title="pinned">📌</span>` : ""}</button>`;
  const grid = kinds.filter(k => inv.some(i => i.kind === k)).map(k =>
    `<div class="bag-section"><h3 class="codex-title bag-kind">${k}s</h3><div class="bag-grid">${
      inv.filter(i => i.kind === k).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(tile).join("")}</div></div>`).join("")
    || "<div class='insight'>empty-handed</div>";
  // growth (SNG-215 §B): a story item that GREW shows the stage it reached, so earned power is visible.
  const growth = openIt && (openIt.evoStageName || openIt.evoStage) ? `<div class="item-growth">✦ grown to <em>${esc(openIt.evoStageName || ("stage " + openIt.evoStage))}</em>${openIt.evoStage ? ` (stage ${esc(String(openIt.evoStage))})` : ""}</div>` : "";
  chrome(`<div class="screen" style="max-width:680px">
    <h2>Inventory — ${esc(character.name)} <span class="cost">(${inv.length})</span></h2>
    ${grid}
    <button class="btn secondary" id="inv-back" style="margin-top:10px">Back</button>
  </div>
  ${openIt ? `<div class="item-detail-modal" id="item-modal"><div class="item-detail-sheet">
    <button class="item-modal-close" id="item-modal-close" title="Close">✕</button>
    ${itemCard(openIt, { open: true, showPin: true })}${growth}
  </div></div>` : ""}`);
  for (const b of app.querySelectorAll("[data-inv]")) b.onclick = () => renderInventoryScreen(openName === b.dataset.inv ? null : b.dataset.inv);
  const closeM = document.getElementById("item-modal-close"); if (closeM) closeM.onclick = () => renderInventoryScreen(null);
  const modal = document.getElementById("item-modal"); if (modal) modal.onclick = e => { if (e.target === modal) renderInventoryScreen(null); }; // backdrop closes
  bindItemCardHandlers(name => renderInventoryScreen(name ?? openName)); // SNG-114: the ONE shared use/name/drop binding
  document.getElementById("inv-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- quest detail ----------

function renderQuestDetail(questId, guidance = null, loading = false) {
  const q = (character.quests || []).find(x => x.id === questId);
  if (!q) { renderPlay(character.activeScene?.lastTurn || null, {}); return; }
  if (q.structured) { renderStructuredQuestDetail(q); return; }
  chrome(`<div class="screen" style="max-width:680px">
    <div class="codex-kind">${esc(q.status)}</div>
    <h2 style="margin-top:4px">${esc(q.title)}</h2>
    <p class="map-details-desc">${esc(q.summary)}</p>
    <div class="hint">${q.giver ? `From ${esc(q.giver)} · ` : ""}started ${q.startedAt ? "day " + esc(String(q.startedAtDay ?? "").trim() || new Date(q.startedAt).toLocaleDateString()) : "a while back"}</div>
    ${q.giverEntityId && character.codex?.topics?.[q.giverEntityId] ? `<button class="codex-link" data-questgiver="${esc(q.giverEntityId)}" style="margin-top:6px">◈ ${esc(character.codex.topics[q.giverEntityId].label)} in Codex</button>` : ""}
    ${q.progress?.length ? `<div style="margin-top:12px"><h3 class="codex-title" style="font-size:15px">The story so far</h3>${q.progress.map(p => `<div class="codex-fact">${esc(p)}</div>`).join("")}</div>` : ""}
    <div style="margin-top:14px">
      ${guidance ? `<div class="gm-aside">${guidance.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
      ${loading ? `<div class="thinking">The GM considers your situation…</div>` : `<button class="btn secondary" id="quest-guidance">Ask the GM for guidance</button>`}
      <div class="hint" style="margin-top:6px">Spoiler-safe: possible next steps, who might help, how hard it looks — never the hidden truth.</div>
    </div>
    ${q.status === "active" ? `<button class="btn secondary" id="quest-resolve" style="margin-top:14px; margin-right:8px" title="Repair: if the story completed this but the tracker missed it">Mark complete (repair)</button>` : ""}
    <button class="btn secondary" id="quest-back" style="margin-top:14px">Back</button>
  </div>`);
  document.getElementById("quest-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
  const gv = document.getElementById("quest-back")?.parentElement?.querySelector("[data-questgiver]") || app.querySelector("[data-questgiver]");
  if (gv) gv.onclick = () => renderCodexScreen("", gv.dataset.questgiver);
  const rBtn = document.getElementById("quest-resolve");
  if (rBtn) rBtn.onclick = () => {
    if (!confirm(`Mark "${q.title}" complete? Use this when the story finished it but the tracker missed it.`)) return;
    applyQuestUpdates(character, [{ op: "complete", questId: q.id, xpReward: 25, note: "(resolved by player — tracker repair)" }]);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${q.title} marked complete (+25 xp).` });
  };
  const gBtn = document.getElementById("quest-guidance");
  if (gBtn) gBtn.onclick = async () => {
    renderQuestDetail(questId, null, true);
    // BATCH-11 §23: the "quest" view — focused window (4 turns), no scene context
    // (sceneNpcNames come out empty), codex keyed to THIS quest via focusQuest.
    const result = await gmAsk(assembleGMContext("quest", gmEnv({ focusQuest: q, recentTurnsWindow: 4, sceneState: null })),
      `Give me practical guidance on my quest "${q.title}": what are 2-3 sensible next steps from where I am, who might help or know more, and roughly how difficult does this look? Spoiler-safe only.`);
    renderQuestDetail(questId, result.ok ? result.text : "The GM stumbled: " + result.error, false);
  };
}

/** SNG-065: a structured quest — stakes, engine-testable stages, the routes this character's
 *  domains open, and branched outcomes that APPLY consequences on resolution. */
// SNG-244: is this structured quest at its decision point — every stage behind you, the ending not yet chosen?
// The SAME derivation the detail page uses (app.js atDecision below), lifted so the in-play decision strip can
// ask it without rendering the detail. Reads existing state only (no new resolve/decision logic).
function questAtDecision(q) {
  if (!q || !q.structured || q.status !== "active") return false;
  const allStagesDone = (q.completedStages || []).length >= (q.stages || []).length || (q.stageIndex || 0) >= (q.stages || []).length;
  return !!(q.awaitingResolution || allStagesDone);
}
function questsAtDecision() { return (character?.quests || []).filter(questAtDecision); }

// SNG-244: the ONE resolve action, shared by the quest-detail ending buttons AND the in-play decision strip — so
// the strip is a genuine shortcut to the existing ending-selection, not a parallel resolve path (the spec guard).
// De-dupes the SNG-235 ctx sink bundle that both callers need. onDone lets a caller override the after-render.
function resolveQuestOutcome(questId, outcomeId, { onDone } = {}) {
  const q = (character?.quests || []).find(x => x.id === questId);
  const o = q && (q.outcomes || []).find(x => x.id === outcomeId);
  if (!q || !o) return;
  if (!confirm(`Resolve "${q.title}" as “${o.name}”? This is permanent and changes the world.`)) return;
  const day = readClock(character.clock).day;
  const r = resolveStructuredQuest(character, q.id, outcomeId, {
    worldDay: absoluteWorldDay(), nowISO: new Date().toISOString(),
    // SNG-282: WHERE it was resolved, so the deed it records has somewhere to travel FROM. A deed with no
    // community is a deed `spreadDeeds` skips — the record would exist and never reach anyone.
    communityId: hereNow()?.communityId ?? null, locationId: character.currentLocationId ?? null,
    aptitudeMods: aptitudeMods(character, CONTENT.rules.playerAptitudes),
    content: CONTENT, // SNG-204: the arcs, so a significant outcome's wake knows its pressure + connectsTo
    liaisonMult: liaisonFactions(character), // SNG-126: a company liaison speeds standing with their people
    recordEvent: ev => applyFactUpdates(character, [{ op: "add", text: ev.text }], { day }),
    recordFact: f => applyFactUpdates(character, [{ op: "add", text: f.text }], { day }),
    recordCodex: entry => applyCodexUpdates(character, [entry], { day }),
    recordStanding: ops => applyStandingOps(character, ops, { rules: CONTENT.rules, knownPeople: (() => { const k = new Set(Object.keys(CONTENT.traditionIndex?.byId || {})); return k.size ? k : null; })(), day, liaisonMult: liaisonFactions(character) }),
    createWaygate: spec => mintWaygate(spec), // SNG-235: an ending can MAKE a real, travelable waygate (Erik's Second Thread)
    recordPlaceChange: (locId, change) => applyPlaceUpdates(character, locId, [{ note: change }], { day }),
  });
  if (r.ok) {
    saveCharacter(character);
    const say = a => a.type === "world_event" ? "a ripple spreads through the world"
      : a.type === "disposition" ? `${String(a.people).replace(/_/g, " ")} feel ${a.delta >= 0 ? "warmer" : "colder"} toward you`
      : a.type === "npc_state" ? `${String(a.npc).replace(/_/g, " ")} is ${a.state}`
      : a.type === "ally" ? `${String(a.npc).replace(/_/g, " ")} stands with you`
      : a.type === "location_state" ? "a place changes"
      : a.type === "quest_seed" ? "a new thread opens"
      : a.type === "codex_fact" ? "the record remembers" : null;
    const changes = [...new Set((r.applied || []).map(say).filter(Boolean))];
    if (onDone) onDone(r, q, o, changes);
    else renderPlay(character.activeScene?.lastTurn || null, { aside: `${q.title} — ${o.name} (+${r.xp} xp).${changes.length ? "\n\nWhat changed: " + changes.join("; ") + "." : ""}` });
  } else alert(r.why || "Couldn't resolve.");
}

function renderStructuredQuestDetail(q) {
  const resolved = q.status !== "active";
  const routes = routesForCharacter(q, character);
  // CCODE-16: the decision opens when every stage is behind you — derived from the stages themselves, not
  // only from the persisted awaitingResolution flag. A save hand-completed through the "Mark this stage met"
  // button never got that flag written (fixed at the engine now, but old saves already lack it), so keying the
  // outcome menu off allStagesDone too means such a quest can be finished on the very next open — no reload.
  const allStagesDone = (q.completedStages || []).length >= (q.stages || []).length || (q.stageIndex || 0) >= (q.stages || []).length;
  const atDecision = !resolved && (q.awaitingResolution || allStagesDone);
  const stageRow = (s, i) => { const done = (q.completedStages || []).includes(s.id); const current = !done && i === (q.stageIndex || 0);
    // SNG-238 §3b: stage art for REACHED beats only (current + done) — generate-on-reach, never batch the future.
    const stageImg = (current || done) && imagesEnabled() ? ensureQuestArt(s.imagePrompt, `quest-${q.id}-stage-${s.id}`) : null;
    return `<div class="quest-stage ${done ? "done" : current ? "current" : ""}">
      ${current && stageImg ? `<img class="quest-stage-img" src="${esc(stageImg)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
      <div class="quest-stage-obj">${done ? "✓ " : current ? "▶ " : "○ "}${esc(s.objective)}</div>
      <div class="hint">${esc(s.condition)}</div>
      ${done && s.change ? `<div class="codex-fact" style="margin-top:4px">${esc(s.change)}</div>` : ""}
      ${current && !resolved ? `<button class="btn secondary" data-stagedone="${esc(s.id)}" style="margin-top:6px">Mark this stage met</button>` : ""}
    </div>`; };
  // SNG-238 §3b: the quest's iconic header image (generate-on-view, cached). Aevi authored q.image as a prompt.
  const questImg = imagesEnabled() ? ensureQuestArt(q.image, `quest-${q.id}`) : null;
  chrome(`<div class="screen" style="max-width:720px">
    <div class="codex-kind">${esc(q.status)}${q.tier ? " · " + esc(q.tier) : ""}${q.axis ? " · " + esc(String(q.axis).replace(/_/g, " ↔ ")) : ""}</div>
    ${questImg ? `<img class="quest-img" src="${esc(questImg)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
    <h2 style="margin-top:4px">${esc(q.title)}</h2>
    <p class="map-details-desc">${mdProse(q.premise)}</p>
    <div class="quest-stakes"><span class="quest-stakes-label">What's at stake</span> ${mdProse(q.stakes)}</div>
    ${resolved ? `<div class="quest-outcome-banner"><strong>Outcome:</strong> ${esc(q.outcomeName || "resolved")}</div>` : ""}
    <h3 class="codex-title" style="font-size:15px;margin-top:16px">Stages</h3>
    ${q.stages.map(stageRow).join("")}
    ${routes.length ? `<h3 class="codex-title" style="font-size:15px;margin-top:16px">How you might go through it <span class="hint" style="text-transform:none">(your domains open the lit routes)</span></h3>
    ${routes.map(r => `<div class="quest-route ${r.open ? "open" : ""}"><span class="quest-route-trad">${esc(traditionLabel(r.trad))}${r.open ? " ✦" : ""}</span> ${esc(typeof r.text === "string" ? r.text : "")}</div>`).join("")}` : ""}
    ${/* SNG-162 §2: the outcome menu appears ONLY at the decision point. Showing every ending
          throughout is what invited clicking through a quest to see how it could go — and made
          resolution feel like a panel chore rather than a moment. Progress is automatic now; the
          ENDING stays the player's, and it surfaces when it's time. */""}
    ${atDecision ? `<h3 class="codex-title" style="font-size:15px;margin-top:16px">Resolve — decide what the truth is for</h3>
      <div class="hint" style="margin-bottom:8px">Every stage is behind you. Every ending is a real ending — what you choose changes the world durably, and you'll be able to go back and see it.</div>
      ${q.outcomes.map(o => { const oimg = imagesEnabled() ? ensureQuestArt(o.imagePrompt, `quest-${q.id}-out-${o.id}`) : null; return `<button class="opt quest-outcome-btn" data-outcome="${esc(o.id)}" style="display:block;width:100%;text-align:left;margin:4px 0">
        ${oimg ? `<img class="quest-outcome-img" src="${esc(oimg)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}<strong>${esc(o.name)}</strong><div class="hint" style="text-transform:none">${esc(o.summary)}</div></button>`; }).join("")}`
    : !resolved ? `<div class="hint" style="margin-top:16px">This isn't finished yet. Play it — the stages close as you actually do them, and the endings appear when you reach the decision.</div>`
    : `<h3 class="codex-title" style="font-size:15px;margin-top:16px">What you did</h3>
      ${((q.outcomes.find(o => o.id === q.outcomeId)?.narration) || (q.outcomes.find(o => o.id === q.outcomeId)?.consequences) || []).map(c => `<div class="codex-fact">${esc(c)}</div>`).join("")}`}
    <button class="btn secondary" id="sq-back" style="margin-top:16px">Back</button>
  </div>`);
  document.getElementById("sq-back").onclick = () => renderQuestLog();
  for (const b of app.querySelectorAll("[data-stagedone]")) b.onclick = () => {
    const r = completeQuestStage(character, q.id, b.dataset.stagedone);
    if (r.ok) { saveCharacter(character); renderStructuredQuestDetail(character.quests.find(x => x.id === q.id)); }
  };
  // SNG-244: the ending buttons and the in-play decision strip both route through resolveQuestOutcome — one path.
  for (const b of app.querySelectorAll("[data-outcome]")) b.onclick = () => resolveQuestOutcome(q.id, b.dataset.outcome);
}

/** SNG-BATCH-7 Phase 3 + SNG-065: the full quest log — available (startable, structured) /
 *  active / resolved / completed / failed, with stakes + current stage. */
function renderQuestLog() {
  const q = character.quests || [];
  const group = (...sts) => q.filter(x => sts.includes(x.status));
  const stageLabel = x => { if (!x.structured) return x.progress?.length ? x.progress[x.progress.length - 1] : x.summary;
    const s = x.stages?.[x.stageIndex] || x.stages?.[x.stages.length - 1]; return x.status === "active" ? (s?.objective || "resolve") : (x.outcomeName || x.summary || ""); };
  const row = x => `<button class="quest quest-click" data-quest="${esc(x.id)}" style="display:block;width:100%;text-align:left;margin:3px 0">
      <span class="quest-title">${esc(x.title)}</span>${x.structured ? ` <span class="cost">structured${x.axis ? " · " + esc(String(x.axis).replace(/_/g, "↔")) : ""}</span>` : x.giver ? ` <span class="cost">from ${esc(x.giver)}${x.giverEntityId && character.codex?.topics?.[x.giverEntityId] ? " ◈" : ""}</span>` : ""}
      <div class="quest-note">${esc(stageLabel(x))}</div></button>`;
  const section = (title, list) => list.length ? `<div class="codex-group"><div class="codex-group-title">${title} (${list.length})</div>${list.map(row).join("")}</div>` : "";
  // SNG-065/SNG-112: authored quests startable HERE — giver present, at/adjacent to the quest's place, or thread already touched (not bare region).
  const avail = availableStructuredQuests(character, [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])], questOfferContext(character, sceneState));
  const availSection = avail.length ? `<div class="codex-group"><div class="codex-group-title">Available here (${avail.length})</div>${avail.map(def => `
      <div class="quest" style="margin:3px 0">
        <span class="quest-title">${esc(def.name)}</span> <span class="cost">${esc(String(def.axis || "").replace(/_/g, "↔"))}</span>
        <div class="quest-note"><strong>Stakes:</strong> ${mdProse(def.stakes || "")}</div>${/* SNG-076: authored stakes render IN FULL — the prose IS the game; SNG-217: bold + line breaks, not raw ** and \n */""}
        <button class="btn" data-startquest="${esc(def.id)}" style="margin-top:6px">Take it on</button>
      </div>`).join("")}</div>` : "";
  chrome(`<div class="screen" style="max-width:680px">
    <h2>Quest Log</h2>
    ${availSection}
    ${q.length ? section("Active", group("active")) + section("Resolved", group("resolved")) + section("Completed", group("completed")) + section("Failed", group("failed"))
      : (availSection ? "" : "<div class='insight'>No undertakings yet — the valley will provide.</div>")}
    <button class="btn secondary" id="ql-back" style="margin-top:12px">Back to the valley</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-quest]")) b.onclick = () => renderQuestDetail(b.dataset.quest);
  for (const b of app.querySelectorAll("[data-startquest]")) b.onclick = () => {
    // BATCH-11 146f: the start lookup must search the SAME spliced array the listing
    // uses — the generated personalArc is not in CONTENT.quests, so looking only there
    // made "Take it on" fail on every personal arc (def === undefined).
    const startable = [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])];
    const def = startable.find(d => (d.id || "").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") === b.dataset.startquest || d.id === b.dataset.startquest);
    const r = startStructuredQuest(character, def, { worldDay: absoluteWorldDay(), nowISO: new Date().toISOString() });
    if (r.ok) { saveCharacter(character); renderQuestDetail(r.quest.id); } else alert(r.why || "Couldn't start that.");
  };
  document.getElementById("ql-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- SNG-109: THE CHRONICLE — the accreted self, read back to the player ----------
// One page that WITNESSES what the character's attention has made real: a generated "story so far"
// paragraph (cached, regenerated only on major-state change), major deeds, relationships (SNG-108
// bonds), standing, and the arc. Read-only — the Chronicle displays state, never mutates it. The
// engine assembles the prompt (chronicle.js); app owns the cached model call + the content ceiling.

/** Assemble the display + prompt views from state that already exists. */
function chronicleViewCtx(character) {
  const reg = character.npcRegistry || {};
  const bonds = Object.values(reg)
    .filter(n => (n.bondType && n.bondType !== "platonic") || Math.abs(n.relationship || 0) >= 4)
    .sort((a, b) => Math.abs(b.relationship || 0) - Math.abs(a.relationship || 0))
    .slice(0, 8)
    .map(n => ({ id: n.id, name: n.name, label: relationshipLabel(n) })); // SNG-134: id → the shared name-hover
  const traditions = [character.domains?.primary, character.domains?.secondary, character.domains?.tertiary].filter(Boolean);
  // BATCH-12 §3: this used to iterate ONLY the character's own three domains, so standing with any
  // OTHER people could never appear no matter what the character earned — a second, quieter reason
  // Erik's standing panel read empty. standingRoster returns every holder with a non-zero score,
  // people and settlements in one shape (§3e), strongest first.
  const home = CONTENT.locations?.[character.currentLocationId]?.communityId;
  const standing = standingRoster(character, CONTENT.rules, { settlements: [home].filter(Boolean) })
    .map(s => ({ who: s.kind === "people" ? traditionLabel(s.holderId) : (CONTENT.locations?.[character.currentLocationId]?.name || s.holderId), band: s.band }));
  const dshape = traditions.map(traditionLabel).join(" · ");
  const fore = (character.foreclosed || []).length ? ` Foreclosed (braid-only): ${character.foreclosed.map(traditionLabel).join(", ")}.` : "";
  const aim = character.bio?.currentAim || character.bio?.motivation || "";
  const arc = `${aim ? aim + " — " : ""}${dshape}${fore}`.trim();
  return { bonds, standing, arc, ratingLine: ratingLineForGM() };
}

/** Write (or rewrite) the cached "story so far" paragraph. Cached by major-state hash — only regenerates
 *  when the major state changed or the player asks (cost + churn guard). Never per-turn. */
async function ensureChronicleParagraph(force = false) {
  if (!getApiKey()) return;
  if (character._chronicleBusy) return;
  if (!force && !chronicleIsStale(character)) return;
  const { system, user } = buildChroniclePrompt(character, chronicleViewCtx(character));
  character._chronicleBusy = true; character._chronicleError = null; renderChronicle();
  try {
    const text = await callClaude([{ role: "user", content: user }], { task: "chronicle", system });
    character.chronicleCache = { hash: majorStateHash(character), text: String(text || "").trim(), at: new Date().toISOString() };
    saveCharacter(character);
  } catch (e) {
    character._chronicleError = e?.message === "NO_API_KEY" ? "Add your API key in Settings to write the chronicle." : "Couldn't write the chronicle just now — try again.";
  } finally {
    character._chronicleBusy = false; renderChronicle();
  }
}

// SNG-276 — THE WORLD TAB. Erik: "they have the arcs on their chronicle, but not who's doing what to them."
//
// The data has all existed for weeks and nothing read it: `arcContests` knew who won and by how much,
// `arcCasualties` who died on which arc, `arcVacancies` which seats emptied. Collected then never read.
//
// PRINCIPLE (Aevi): SHOW THE STATE, NOT THE MACHINE. A stage reads "Drift · stage 1/4", never 2.351351; a
// push reads "leaning hard", never 4.7. The engine keeps the floats; the sheet speaks the language.
// SNG-276 — THE WORLD TAB. The markup lives in `engine/worldtab.js` so it can be EXECUTED in a test rather
// than pattern-matched; this is the thin shell that feeds it real state and puts it on screen.
// SNG-273: the effects in force RIGHT NOW. One reader, so the receipt, the World tab and the GM block can
// never disagree about what the world is doing.
function arcEffectsNow() {
  try { return activeArcEffects(CONTENT, character, (arcId) => arcStageNow(CONTENT, character, arcId)); }
  catch { return []; }
}

function renderWorldTab() {
  chrome(worldTabHtml({
    arcs: arcPeopleView(character, CONTENT),
    foot: worldPeopleFooter(character, CONTENT),
    effects: effectsInPlainWords(arcEffectsNow()),   // SNG-273: what the world is doing, in plain words
    name: character.name,
    tabBar: characterTabBar,
    esc,
    name: character.name,
  }));
  wireCharacterTabs();
}
function renderChronicle() {
  const cache = character.chronicleCache;
  const stale = chronicleIsStale(character);
  const deeds = majorDeeds(character, 8);
  const ctx = chronicleViewCtx(character);
  // SNG-128: the World-Authorship readout + per-session log + the family comparison.
  const auth = authorshipStats(character, CONTENT);
  const sessions = sessionLog(character);
  const myKey = profile?.playerKey;
  // Family compare: YOUR characters always (they're yours), plus other players' characters only if that
  // player opted in (privacy — a chronicle is private until shared). Only shown when 2+ are visible.
  let family = [];
  try {
    const loaded = listCharacters().map(e => (e.id === character.id ? character : loadCharacter(e.id))).filter(Boolean);
    const visible = loaded.filter(c => c.playerKey === myKey || loadProfile(c.playerKey)?.sharedChronicle);
    family = crossCharacterAuthorship(visible, CONTENT);
  } catch { /* family view is best-effort */ }
  const nameOfPlayer = pk => { try { return loadProfile(pk)?.displayName || pk; } catch { return pk; } };
  const paraHtml = character._chronicleBusy
    ? `<div class="insight">writing your story…</div>`
    : cache?.text
      ? `<p class="chronicle-para">${esc(cache.text)}</p>${stale ? `<div class="hint">the story has moved on since this was written — regenerate to catch it up</div>` : ""}`
      : `<div class="insight">${getApiKey() ? "Your story is just beginning — generate the chronicle to read it." : "Add your API key in Settings to write the chronicle."}</div>`;
  chrome(`<div class="screen" style="max-width:680px">
    <h2>${esc(character.name)}</h2>
    ${characterTabBar("chronicle")}
    ${character.portrait ? `<img class="cs-portrait" src="${esc(character.portrait)}" alt="${esc(character.name)}" data-lightbox="portrait" onerror="this.style.display='none'">` : ""}
    <h3 style="margin-top:6px">${esc(character.name)}${character.level ? ` · level ${character.level}` : ""}</h3>
    ${character._chronicleError ? `<div class="hint">${esc(character._chronicleError)}</div>` : ""}
    <section><h3>The story so far</h3>
      ${paraHtml}
      ${getApiKey() ? `<button class="btn secondary" id="chr-regen" style="margin-top:6px" ${character._chronicleBusy ? "disabled" : ""}>↻ ${cache?.text ? "Regenerate" : "Write it"}</button>` : ""}
    </section>
    <section><h3>Major deeds${deeds.length ? ` (${deeds.length})` : ""}</h3>
      ${deeds.length ? deeds.map(d => `<div class="chronicle-deed"><span class="rep-band ${(d.weight | 0) >= 0 ? "trusted" : "wary"}">${(d.weight | 0) > 0 ? "+" : ""}${d.weight | 0}</span> ${esc(d.description)}${d.worldDay != null ? ` <span class="cost">day ${d.worldDay}</span>` : ""}</div>`).join("") : "<div class='insight'>no deeds yet — the valley is waiting</div>"}
    </section>
    <section><h3>Relationships</h3>
      ${(() => { const rp = relationshipsParagraph(character); return rp ? `<p class="chronicle-para" style="margin-bottom:8px">${esc(rp)}</p>` : ""; })()}
      ${ctx.bonds.length ? ctx.bonds.map(b => `<div class="known-npc"><span class="npc-name entity-hover" ${b.id ? `data-entity="npc:${esc(b.id)}"` : ""}>${esc(b.name)}</span> <span class="rep-band trusted">${esc(b.label)}</span></div>`).join("") : "<div class='insight'>no close ties yet</div>"}
    </section>
    <section><h3>Standing</h3>
      ${ctx.standing.length ? ctx.standing.map(s => `<div class="known-npc"><span class="npc-name">${esc(s.who)}</span> <span class="rep-band">${esc(s.band)}</span></div>`).join("") : "<div class='insight'>not yet known anywhere</div>"}
    </section>
    <section><h3>The arc</h3>
      ${(() => { // SNG-134 P1: show the SNG-133 personal arc (premise + current stage), not the frozen aim.
        const pa = character.personalArc;
        if (pa && pa.premise) {
          const taken = (character.quests || []).find(q => q.arcId === pa.arcId);
          const stage = taken ? (pa.stages[taken.stageIndex] || pa.stages[pa.stages.length - 1]) : null;
          return `<div class="chronicle-arc"><strong>${esc(pa.name)}</strong><p class="map-details-desc" style="margin-top:2px">${esc(pa.premise)}</p><div class="hint">${stage ? "Now: " + esc(stage.objective) : "a thread waiting to be pulled — it will find you in play"}</div></div>`;
        }
        return `<div class="chronicle-arc">${ctx.arc ? esc(ctx.arc) : "<span class='insight'>their path is still forming</span>"}</div>`;
      })()}
    </section>
    <section><h3>World authorship <span class="cost">what you've made real</span></h3>
      <div class="authorship-grid">
        <div class="auth-stat"><span class="auth-num">${auth.authoredCount}</span><span class="auth-label">authored places &amp; people you've walked among</span></div>
        <div class="auth-stat"><span class="auth-num accent">${auth.novelCount}</span><span class="auth-label">called into being through your play</span></div>
        <div class="auth-stat"><span class="auth-num">${auth.persisted.shared}</span><span class="auth-label">now shared-world canon</span></div>
        <div class="auth-stat"><span class="auth-num accent">${auth.worldEffect}</span><span class="auth-label">world-effect — your fingerprint on the shared world</span></div>
      </div>
      <div class="hint" style="margin-top:6px">Of the world you've touched, <strong>${auth.authoredCount}</strong> ${auth.authoredCount === 1 ? "place/person was" : "were"} written before you — and you <strong>called ${auth.novelCount} new ${auth.novelCount === 1 ? "one" : "ones"} into being</strong>.${auth.novelCount ? ` Of those, ${auth.persisted.shared} ${auth.persisted.shared === 1 ? "is" : "are"} now canon the whole valley reads${auth.persisted.rumor ? `, ${auth.persisted.rumor} live${auth.persisted.rumor === 1 ? "s" : ""} on as rumor others may yet confirm` : ""}; ${auth.persisted.personal} real to you, not yet shared.` : ""}</div>
      ${/* CCODE-05: show the number that ACTUALLY gates promotion. This badge used to read
            "weight N" (birthWeight + score/2) — so the Low Lamp Inn showed "weight 13" while
            sitting at 4 of the 8 engagement it needs, and a higher weight looked like it was
            closer to canon when it wasn't. Now: progress to the threshold, and what moves it. */""}
      ${auth.topAttention.length ? `<div style="margin-top:8px"><div class="sys-label">What you're making real right now</div>${auth.topAttention.map(t => {
        const ready = t.score >= NOMINATE_AT;
        const need = Math.max(0, NOMINATE_AT - t.score);
        // CCODE-06: the ⭐ lives HERE too, not only buried on the codex topic page. This row is
        // where the player learns something "needs 4" — showing a shortfall with no way to act on
        // it is the readout half-built. ⭐ Keep is +4, so one tap is usually the whole gap.
        return `<div class="known-npc"><span class="npc-name">${esc(t.name)}</span> <span class="cost">${esc(t.type || "")} · ${esc(t.tier)}</span> <span class="rep-band ${ready ? "trusted" : ""}" title="Shared-world canon needs ${NOMINATE_AT} engagement. Revisit +2 · interact +2 · tie to a quest +2 · ⭐ Keep +4. (realness weight ${t.weight})">${ready ? "ready for canon" : `${t.score}/${NOMINATE_AT} to canon · needs ${need}`}</span>${t.id && !ready ? ` <button class="npc-ctl" data-keepfrom="${esc(t.id)}" title="⭐ Keep — mark this as one that matters to you (+4 toward canon)">⭐</button>` : ""}</div>`;
      }).join("")}</div>` : ""}
      <label class="rating-check" style="margin-top:10px"><input type="checkbox" id="chr-share" ${profile?.sharedChronicle ? "checked" : ""}> Share my chronicle with the family (they can see these authorship stats)</label>
    </section>
    <section><h3>Sessions${sessions.length ? ` (${sessions.length})` : ""}</h3>
      ${sessions.length ? sessions.map(s => {
        const raw = (character.sessions || []).find(x => x.id === s.id) || {};
        const span = s.startDay != null && s.endDay != null ? (s.startDay === s.endDay ? `day ${s.startDay}` : `days ${s.startDay}–${s.endDay}`) : "";
        const title = `${s.ended ? "▪" : "▸"} ${span || s.id} · ${s.beats} beat${s.beats === 1 ? "" : "s"}${s.deeds.length ? ` · ${s.deeds.length} deed${s.deeds.length === 1 ? "" : "s"}` : ""}`;
        const recap = raw._recapBusy ? `<div class="insight">writing the recap…</div>` : raw.recap ? `<p class="chronicle-para">${esc(raw.recap)}</p>` : "";
        return `<details class="session-entry"><summary>${esc(title)}</summary><div class="sec-body">
          ${recap}
          ${getApiKey() && !raw.recap ? `<button class="btn secondary session-recap" data-sess="${esc(s.id)}" style="margin:2px 0 6px" ${raw._recapBusy ? "disabled" : ""}>✍ Write session recap</button>` : ""}
          ${syncEnabled() && raw.recap ? `<button class="btn secondary session-post" data-postsess="${esc(s.id)}" style="margin:2px 0 6px" title="Share this session's story on the family feed — a little narrative of what happened, lensed to each viewer's rating. Never canon.">📮 Post this session to the feed</button>` : ""}
          ${s.deeds.length ? `${s.deeds.map(d => `<div class="chronicle-deed"><span class="rep-band ${d.weight >= 0 ? "trusted" : "wary"}">${d.weight > 0 ? "+" : ""}${d.weight}</span> ${esc(d.description)}</div>`).join("")}` : "<div class='insight'>a quiet span — no deeds of note</div>"}
          ${s.placesMinted.length ? `<div class="hint">✦ Places you made: ${s.placesMinted.map(esc).join(", ")}</div>` : ""}
          ${s.peopleMet.length ? `<div class="hint">✦ People first met: ${s.peopleMet.map(esc).join(", ")}</div>` : ""}
          ${s.canonPromoted.length ? `<div class="hint">★ Became shared-world canon: ${s.canonPromoted.map(esc).join(", ")}</div>` : ""}
          ${s.canonRumored?.length ? `<div class="hint">◦ Live on as rumor others may yet confirm: ${s.canonRumored.map(esc).join(", ")}</div>` : ""}
        </div></details>`;
      }).join("") : "<div class='insight'>your first session is being written now — play on</div>"}
      ${(character.sessions || []).length && !(character.sessions[character.sessions.length - 1] || {}).ended ? `<button class="btn secondary" id="chr-endsession" style="margin-top:6px">End this session</button>` : ""}
    </section>
    ${family.length >= 2 ? `<section><h3>Across the family <span class="cost">who's authored the valley</span></h3>
      ${family.map((f, i) => `<div class="family-row${f.id === character.id ? " you" : ""}"><span class="fam-rank">${i + 1}</span> <span class="npc-name">${esc(f.name)}</span> <span class="cost">L${f.level}${f.playerKey && f.playerKey !== myKey ? " · " + esc(nameOfPlayer(f.playerKey)) : ""}</span><div class="fam-stats">${f.novelCount} made · ${f.shared} canon · <strong>world-effect ${f.worldEffect}</strong></div></div>`).join("")}
      <div class="hint" style="margin-top:6px">Your family co-authors one valley. World-effect is how much of the shared world bears each person's fingerprint.</div>
    </section>` : ""}
    <button class="btn secondary" id="chr-back" style="margin-top:12px">Back</button>
  </div>`);
  const rb = document.getElementById("chr-regen"); if (rb) rb.onclick = () => ensureChronicleParagraph(true);
  const share = document.getElementById("chr-share"); if (share) share.onchange = (e) => { if (profile) { profile.sharedChronicle = e.target.checked; saveProfile(profile); } };
  const endBtn = document.getElementById("chr-endsession"); if (endBtn) endBtn.onclick = () => { endSession(character); saveCharacter(character); renderChronicle(); };
  for (const b of app.querySelectorAll(".session-recap")) b.onclick = () => ensureSessionRecap(b.dataset.sess);
  for (const b of app.querySelectorAll(".session-post")) b.onclick = () => renderSessionSynopsisReview(b.dataset.postsess); // SNG-241
  // CCODE-06: ⭐ Keep straight from the progress row (+4 — usually the whole remaining gap).
  for (const b of app.querySelectorAll("[data-keepfrom]")) b.onclick = () => {
    const rec = findGenerated(character, b.dataset.keepfrom);
    if (!rec) return;
    recordAttention(rec, "keep", readClock(character.clock).day);
    saveCharacter(character);
    const s = rec._gen?.engagementScore || 0;
    renderChronicle();
    // say what it bought — the tier language is otherwise invisible from this screen
    const note = s >= NOMINATE_AT ? `${rec.name} is ready for shared canon — it promotes on your next sync.` : `${rec.name} — ${s}/${NOMINATE_AT} toward canon.`;
    const host = document.querySelector(".screen"); if (host) { const d = document.createElement("div"); d.className = "insight"; d.style.marginTop = "6px"; d.textContent = note; host.prepend(d); }
  };
  document.getElementById("chr-back").onclick = () => renderCharacterScreen();
  wireCharacterTabs();   // SNG-276: all three tabs, from the one place — this screen wired only Traits
  if (!cache?.text && !character._chronicleBusy && getApiKey()) ensureChronicleParagraph(false); // write once on first open
}

/** SNG-128: generate a one-paragraph recap for ONE session on demand (lazy, cached on the session).
 *  Reuses the chronicle voice + the same content ceiling as the GM; app owns the model call. */
async function ensureSessionRecap(sessionId, force = false) {
  const raw = (character.sessions || []).find(x => x.id === sessionId);
  if (!raw || (raw.recap && !force) || raw._recapBusy) return;
  const entry = sessionLog(character).find(x => x.id === sessionId);
  if (!entry) return;
  raw._recapBusy = true; raw._recapError = null; renderChronicle();
  try {
    const { system, user } = buildSessionPrompt(character, entry, { ratingLine: ratingLineForGM() });
    const text = await callClaude([{ role: "user", content: user }], { task: "chronicle", system });
    raw.recap = String(text || "").trim();
  } catch (e) {
    raw._recapError = "Couldn't write the recap — try again.";
  }
  raw._recapBusy = false;
  saveCharacter(character);
  renderChronicle();
}

/** SNG-241: the structured "key details" caption for a session synopsis — factual, pulled from the session's
 *  real state (level + top deeds + people/places + canon), never invented. The poster edits it before posting. */
function sessionKeyDetails(entry) {
  const bits = [];
  if (character.level) bits.push(`Level ${character.level}`);
  const topDeeds = (entry.deeds || []).slice().sort((a, b) => Math.abs(b.weight || 0) - Math.abs(a.weight || 0)).slice(0, 2).map(d => d.description);
  if (topDeeds.length) bits.push(topDeeds.join("; "));
  if ((entry.peopleMet || []).length) bits.push(`met ${entry.peopleMet.slice(0, 3).join(", ")}`);
  if ((entry.placesMinted || []).length) bits.push(`found ${entry.placesMinted.slice(0, 3).join(", ")}`);
  if ((entry.canonPromoted || []).length) bits.push(`★ ${entry.canonPromoted.join(", ")} became canon`);
  return bits.join(" · ");
}

/** SNG-241: review + trim a session synopsis, then post it to the family feed as kind:"synopsis". The recap is
 *  a DRAFT the poster shapes (never auto-posted); a "chapter" toggle regenerates it as 2–3 paragraphs. Lens +
 *  consent inherit from the feed. */
function renderSessionSynopsisReview(sessionId) {
  const raw = (character.sessions || []).find(x => x.id === sessionId);
  const entry = sessionLog(character).find(x => x.id === sessionId);
  if (!raw || !entry) { renderChronicle(); return; }
  const draft = raw._synopsisDraft != null ? raw._synopsisDraft : (raw.recap || "");
  const details = raw._synopsisCaption != null ? raw._synopsisCaption : sessionKeyDetails(entry);
  const span = entry.startDay != null && entry.endDay != null ? (entry.startDay === entry.endDay ? `day ${entry.startDay}` : `days ${entry.startDay}–${entry.endDay}`) : "";
  chrome(`<div class="screen" style="max-width:680px">
    <h2>📮 Share this session</h2>
    <div class="hint">A little narrative of what happened this session — ${esc(span || entry.id)}. Trim the story, choose the key details, then post. It's lensed to each viewer's rating and is never canon.</div>
    ${raw._synopsisBusy ? `<div class="insight" style="margin-top:8px">writing…</div>` : ""}
    <section style="margin-top:12px"><h3>The story</h3>
      <textarea id="syn-text" rows="8" style="width:100%; font-family:var(--font); font-size:15px; line-height:1.5" ${raw._synopsisBusy ? "disabled" : ""}>${esc(draft)}</textarea>
      ${getApiKey() ? `<button class="btn secondary" id="syn-chapter" style="margin-top:6px" ${raw._synopsisBusy ? "disabled" : ""}>${raw._chapterMode ? "↺ Shorter — one paragraph" : "✍ Longer — a chapter (2–3 paragraphs)"}</button>` : ""}
    </section>
    <section style="margin-top:10px"><h3>Key details <span class="cost">shown under the story (optional — clear to omit)</span></h3>
      <textarea id="syn-caption" rows="2" style="width:100%">${esc(details)}</textarea>
    </section>
    <div style="display:flex; gap:8px; margin-top:14px">
      <button class="btn" id="syn-post" ${raw._synopsisBusy ? "disabled" : ""}>📮 Post to the feed</button>
      <button class="btn secondary" id="syn-cancel">Cancel</button>
    </div>
  </div>`);
  const stash = () => { const t = document.getElementById("syn-text"), cap = document.getElementById("syn-caption"); if (t) raw._synopsisDraft = t.value; if (cap) raw._synopsisCaption = cap.value; };
  document.getElementById("syn-cancel").onclick = () => { delete raw._synopsisDraft; delete raw._synopsisCaption; delete raw._chapterMode; renderChronicle(); };
  const chBtn = document.getElementById("syn-chapter");
  if (chBtn) chBtn.onclick = async () => {
    stash(); raw._chapterMode = !raw._chapterMode; raw._synopsisBusy = true; renderSessionSynopsisReview(sessionId);
    try {
      const { system, user } = buildSessionPrompt(character, entry, { ratingLine: ratingLineForGM(), chapter: raw._chapterMode });
      const text = await callClaude([{ role: "user", content: user }], { task: "chronicle", system });
      if (String(text || "").trim()) raw._synopsisDraft = String(text).trim();
    } catch { /* keep the prior draft on failure */ }
    raw._synopsisBusy = false; renderSessionSynopsisReview(sessionId);
  };
  document.getElementById("syn-post").onclick = () => { stash(); postSessionSynopsis(sessionId, raw._synopsisDraft || draft, raw._synopsisCaption != null ? raw._synopsisCaption : details, span); };
}

async function postSessionSynopsis(sessionId, text, caption, span) {
  const raw = (character.sessions || []).find(x => x.id === sessionId);
  if (!syncEnabled() || !String(text || "").trim()) { renderChronicle(); return; }
  const galImg = [...(character.gallery || [])].reverse().find(g => g && g.url && (g.kind === "moment" || g.kind === "scene"))?.url || null;
  const post = buildFeedPost({
    turn: { narration: text, scene: {} }, character, playerKey: getPlayerKey(),
    worldDay: absoluteWorldDay(), worldDateLabel: span || worldDate().label,
    rating: ratingCeilingNow(), excerpt: text, caption: String(caption || "").trim() || null,
    image: galImg, at: Date.now(), kind: "synopsis"
  });
  if (!post) { renderChronicle(); return; }
  const btn = document.getElementById("syn-post"); if (btn) { btn.disabled = true; btn.textContent = "Posting…"; }
  try {
    await pushMergedFile(FEED_PATH, (remote) => appendFeedPost(remote, post), `feed: ${character.name || character.id} shared a session synopsis`);
    if (raw) { delete raw._synopsisDraft; delete raw._synopsisCaption; delete raw._chapterMode; }
    saveCharacter(character);
    renderChronicle();
    const host = document.querySelector(".screen"); if (host) { const d = document.createElement("div"); d.className = "insight"; d.style.marginTop = "6px"; d.textContent = "📮 Your session synopsis is on the family feed."; host.prepend(d); }
  } catch (e) {
    const b2 = document.getElementById("syn-post"); if (b2) { b2.disabled = false; b2.textContent = "📮 Post to the feed"; }
    const host = document.querySelector(".screen"); if (host) { const d = document.createElement("div"); d.className = "insight"; d.style.marginTop = "6px"; d.textContent = `Couldn't post right now — the story is safe, try again. (${e?.message || "sync error"})`; host.prepend(d); }
  }
}

// SNG-133: enrich the seeded personal arc via the model (best-effort) — a richer premise/stakes/stages/
// routes + a catalyst legend NPC, drawn from the bio (the SNG-132 arc as the quality bar). No API key →
// the fallback arc simply stands. Non-blocking; the arc is bound to the character (SNG-132 runs it).
async function enrichPersonalArc(char) {
  if (!char || !getApiKey()) return; // no key → the light fallback arc stands
  try {
    const { system, user } = buildPersonalArcPrompt(char, { ratingLine: ratingLineForGM(), locations: CONTENT.locations });
    const raw = await callClaudeJSON([{ role: "user", content: user }], { task: "generate", system });
    const arc = sanitizePersonalArc(raw, char, { locations: CONTENT.locations });
    if (arc && arc.premise) {
      char.personalArc = arc; // the legend NPC rides embedded (arc.legendNpc); the GM registers it on first meeting
      saveCharacter(char);
    }
  } catch { /* the fallback arc stands — a hiccup never blocks creation */ }
}

// ---------- SNG-061: THE LIBRARY (the world's guide — open, readable, no discovery gate) ----------
// Renders the authored lore as readable prose, browsable by category, with THE GREAT CIRCLE shown
// as a readable thing (not just a gate). GM-EYES-ONLY / hooks / secret fields are FILTERED from
// every render — the Library is the player's book, never the GM's. Distinct from the discovered
// Codex (what THIS character has actually found), which keeps its discovery gate.

const LIBRARY_INDEX = [
  { cat: "Peoples & Traditions", entries: [
    { id: "great_circle", label: "The Great Circle", kind: "circle" },
    { id: "reaches", label: "The Twelve Reaches", path: "content/packs/valley/lore/the_twelve_reaches.json", kind: "json" },
  ] },
  { cat: "The World", entries: [
    { id: "framing", label: "The Shape of the World", path: "content/packs/valley/lore/world_framing.json", kind: "json" },
    { id: "coordinate", label: "The Coordinate World & the Center", path: "content/packs/valley/lore/the_coordinate_world.json", kind: "json" },
    { id: "poles", label: "Pole & Intensity", path: "content/packs/valley/lore/the_pole_intensity_model.json", kind: "json" },
  ] },
  { cat: "The Valley", entries: [
    { id: "primer", label: "A Valley Primer", path: "content/packs/valley/lore/valley_primer.md", kind: "md" },
    { id: "precursors", label: "The Precursors", path: "content/packs/valley/lore/precursors.md", kind: "md" },
  ] },
  { cat: "Powers & Crafts", entries: [
    { id: "traditions", label: "The Traditions", path: "content/packs/valley/lore/tradition_profiles.json", kind: "json" },
    { id: "powers", label: "The Power Systems", path: "content/packs/valley/lore/power_systems.md", kind: "md" },
    { id: "roles", label: "Universal Roles", path: "content/packs/valley/lore/universal_roles.json", kind: "json" },
    { id: "game", label: "The Game & the Coin", path: "content/packs/valley/lore/the_game_and_coin.json", kind: "json" },
    { id: "arcs", label: "Greater Arcs", path: "content/packs/valley/lore/greater_arcs.json", kind: "json" },
  ] },
];

const _libCache = {};
async function libFetch(path, kind) {
  if (_libCache[path] !== undefined) return _libCache[path];
  try { const res = await fetch(path); _libCache[path] = res.ok ? (kind === "md" ? await res.text() : await res.json()) : null; }
  catch { _libCache[path] = null; }
  return _libCache[path];
}

// GM-only / meta keys never shown to the player.
const LIB_SKIP = /^(schemaVersion|id|kind|note|designNote|buildPlan|buildNeeds.*|owed|migration|status|version|packId)$/i;
const LIB_SECRET = /(gm[_A-Z]|gmeyes|eyes.?only|secret|hidden|hook|mandate|internal|_pat|token|guidance)/i;
function libSkipKey(k) { return LIB_SKIP.test(k) || LIB_SECRET.test(k); }
function libPretty(k) { return String(k).replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, c => c.toUpperCase()); }

/** Generic lore → readable HTML. Walks objects/arrays into headings + prose; filters GM fields. */
function loreToHtml(value, depth = 0) {
  if (value == null) return "";
  if (typeof value === "string") return `<p class="lore-p">${esc(value)}</p>`;
  if (typeof value === "number" || typeof value === "boolean") return `<p class="lore-p">${esc(String(value))}</p>`;
  if (Array.isArray(value)) {
    if (!value.length) return "";
    if (value.every(v => typeof v === "string")) return `<ul class="lore-list">${value.map(v => `<li>${esc(v)}</li>`).join("")}</ul>`;
    return value.map(v => {
      if (v && typeof v === "object") {
        const title = v.name || v.title || v.label || v.people || v.craft || v.role || v.id;
        return `<div class="lore-entry">${title ? `<h4 class="lore-h">${esc(libPretty(title))}</h4>` : ""}${loreToHtml(stripTitle(v), depth + 1)}</div>`;
      }
      return loreToHtml(v, depth + 1);
    }).join("");
  }
  if (typeof value === "object") {
    return Object.entries(value).filter(([k]) => !libSkipKey(k)).map(([k, v]) => {
      const H = depth <= 0 ? "h3" : "h4";
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
        return `<div class="lore-field"><span class="lore-key">${esc(libPretty(k))}:</span> ${esc(String(v))}</div>`;
      const inner = loreToHtml(v, depth + 1);
      return inner ? `<div class="lore-section"><${H} class="lore-h">${esc(libPretty(k))}</${H}>${inner}</div>` : "";
    }).join("");
  }
  return "";
}
function stripTitle(o) { const c = { ...o }; for (const k of ["name", "title", "label"]) delete c[k]; return c; }

/** Inline markdown emphasis on already-escaped text: **bold**, *italic* / _italic_. */
function libInline(escaped) {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\b_([^_\n]+)_\b/g, "<em>$1</em>");
}

/** Minimal markdown → HTML for the .md lore (headings, lists, paragraphs, inline emphasis). */
function libMdToHtml(md) {
  const lines = String(md || "").split(/\r?\n/);
  let html = "", inList = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  const ln = s => libInline(esc(s));
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{3,}\s/.test(line)) { closeList(); html += `<h4 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h4>`; }
    else if (/^##\s/.test(line)) { closeList(); html += `<h3 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h3>`; }
    else if (/^#\s/.test(line)) { closeList(); html += `<h2 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h2>`; }
    else if (/^[-*]\s/.test(line)) { if (!inList) { html += "<ul class='lore-list'>"; inList = true; } html += `<li>${ln(line.replace(/^[-*]\s/, ""))}</li>`; }
    else if (!line.trim()) { closeList(); }
    else { closeList(); html += `<p class="lore-p">${ln(line)}</p>`; }
  }
  closeList();
  return html;
}

/** The great circle, rendered as a readable centerpiece + the 24 peoples with their crafts. */
function libGreatCircle() {
  const idx = CONTENT.traditionIndex;
  if (!idx) return "<div class='insight'>The great circle is not loaded.</div>";
  const circle = domainCircleSVG(idx, { selectable: () => false, centerTop: "the great circle", centerSub: "twelve axes · twenty-four peoples" });
  const rows = ringOrder(idx).map(t => { const tr = idx.byId?.[t]; const st = (idx.stations || []).find(s => s.traditionId === t);
    return tr ? `<div class="lore-entry"><h4 class="lore-h">${esc(tr.name || t)}${tr.craft ? ` <span class="hint">— ${esc(tr.craft)}</span>` : ""}</h4>
      <div class="lore-field"><span class="lore-key">Pole:</span> ${esc(st?.pole || tr.pole || "?")} · <span class="lore-key">Across the ring:</span> ${esc(traditionLabel(antipodeOf(t, idx)))}</div>
      ${tr.civilization ? `<p class="lore-p">${esc(tr.civilization)}</p>` : ""}${tr.aesthetic ? `<p class="lore-p"><em>${esc(tr.aesthetic)}</em></p>` : ""}</div>` : ""; }).join("");
  const folk = (CONTENT.traditions?.folkTraditions || []).map(f => `<div class="lore-field"><span class="lore-key">${esc(f.name || f.traditionId)}:</span> ${esc(f.aesthetic || "a Valley folk-craft, open to all")}</div>`).join("");
  return `${circle}
    <p class="lore-p">Twelve axes of the world, each a tension between two peoples — and every craft sits directly across the ring from its antithesis. Kin stand beside kin; the far pole of what you are is closed to you, reachable only by the great braids.</p>
    <h3 class="lore-h">The Twenty-Four Peoples</h3>${rows}
    ${folk ? `<h3 class="lore-h">The Valley's Folk Crafts (open to all)</h3>${folk}` : ""}`;
}

async function renderLibrary(catIdx = 0, entryId = null) {
  const cat = LIBRARY_INDEX[catIdx] || LIBRARY_INDEX[0];
  const entry = (cat.entries.find(e => e.id === entryId)) || cat.entries[0];
  let body = "";
  if (entry.kind === "circle") body = libGreatCircle();
  else { const data = await libFetch(entry.path, entry.kind);
    body = data == null ? "<div class='insight'>This entry could not be loaded.</div>"
      : entry.kind === "md" ? libMdToHtml(data) : loreToHtml(data, 0); }
  chrome(`<div class="screen" style="max-width:820px">
    <h2>📖 The Library <span class="hint" style="text-transform:none">— the world's guide, open to read</span></h2>
    <div class="library-cats">${LIBRARY_INDEX.map((c, i) => `<button class="lib-cat ${i === catIdx ? "on" : ""}" data-libcat="${i}">${esc(c.cat)}</button>`).join("")}</div>
    <div class="library-entries">${cat.entries.map(e => `<button class="lib-entry ${e.id === entry.id ? "on" : ""}" data-libentry="${esc(e.id)}">${esc(e.label)}</button>`).join("")}</div>
    <div class="library-body"><h3 class="lore-title">${esc(entry.label)}</h3>${body}</div>
    <button class="btn secondary" id="lib-back" style="margin-top:14px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-libcat]")) b.onclick = () => renderLibrary(+b.dataset.libcat, null);
  for (const b of app.querySelectorAll("[data-libentry]")) b.onclick = () => renderLibrary(catIdx, b.dataset.libentry);
  document.getElementById("lib-back").onclick = () => { if (character) renderPlay(character.activeScene?.lastTurn || null, {}); else renderRoster(); };
}

// ---------- codex: the character's knowledge graph ----------

// SNG-153: the codex consolidates ITSELF. Erik: "It's too much to have every potential merge done
// by the user… the game should auto merge — it's really smart AI, just do it." Gate 1 (structural)
// already refused the free cases; this judges the rest in ONE batched call, merges the certain
// ones with a receipt, permanently records the rejects, and leaves only genuine coin-flips.
// Runs on codex OPEN, never in the play loop, never blocking, at most once per session per shape.
let _adjudicatedKey = null, _adjudicating = false;
async function maybeAdjudicateMerges(query = "") {
  if (_adjudicating || !getApiKey()) return;
  const pairs = suggestMerges(character, { max: 24 });
  if (!pairs.length) return;
  const key = pairs.map(p => `${p.aId}::${p.bId}`).sort().join("|");
  if (key === _adjudicatedKey) return;                 // same shape already judged this session
  _adjudicatedKey = key; _adjudicating = true;
  try {
    const raw = await callClaude([{ role: "user", content: buildMergeAdjudicationPrompt(character, pairs) }],
      { task: "codex-adjudicate", maxTokens: 900 });
    const verdicts = parseLooseJSON(raw);
    const list = Array.isArray(verdicts) ? verdicts : (verdicts?.verdicts || []);
    if (!list.length) return;
    const r = applyMergeVerdicts(character, pairs, list);
    if (r.merged.length || r.rejected) {
      saveCharacter(character);
      const digest = mergeDigest(r.merged);
      if (digest) character._codexDigest = `${digest}${r.rejected ? ` ${r.rejected} looked alike but aren't the same thing — I won't ask again.` : ""}`;
      else if (r.rejected) character._codexDigest = `${r.rejected} codex entries looked alike but aren't the same thing — I won't ask again.`;
      renderCodexScreen(query);
    }
  } catch (err) {
    console.warn("[codex] adjudication skipped (the player queue still works):", err?.message);
  } finally { _adjudicating = false; }
}

function renderCodexScreen(query = "", openTopicId = null, mergeMode = false) {
  const results = searchCodex(character, query);
  const open = openTopicId ? character.codex?.topics?.[openTopicId] : null;
  // SNG-199 §6: search filters EVERYTHING it is displayed above — the NOTABLE row and the merge
  // suggestions are entry lists too, and rendering them unfiltered under an active search told the
  // player "cairnhold: nothing" beneath six visible entries.
  const q = String(query || "").trim().toLowerCase();
  const suggestions = (!open ? suggestMerges(character) : [])
    .filter(s => !q || String(s.a).toLowerCase().includes(q) || String(s.b).toLowerCase().includes(q));
  if (!open) maybeAdjudicateMerges(query); // SNG-153: tidy the codex itself, off the play loop
  chrome(`<div class="screen" style="max-width:720px">
    <h2>Codex — what ${esc(character.name)} knows</h2>
    <div class="field"><input id="codex-search" value="${esc(query)}" placeholder="Search topics, facts, factions, mysteries…"></div>
    ${open ? `
      <div class="codex-topic-page">
        <div class="codex-kind">${esc(open.kind)}${open.entityId ? ` <span class="codex-anchor" title="anchored to a known entity">◈ ${esc(open.entityId)}</span>` : ""}</div>
        <h3 class="codex-title">${esc(open.label)}</h3>
        ${(open.aliases || []).length ? `<div class="codex-aliases">also called: ${open.aliases.map(esc).join(" · ")}</div>` : ""}
        ${(() => {
          // SNG-BATCH-9 Phase 2: a GROWN entity carries a canon-tier badge + a one-tap ⭐ Keep
          // (the explicit engagement boost — available, never nagged). Nominated = a promotion
          // candidate toward shared canon (Phase 3).
          const g = open.entityId ? findGenerated(character, open.entityId) : null;
          if (!g?._gen) return "";
          const tier = g._gen.tier;
          const badge = tier === "nominated" ? "★ notable — nomination candidate" : tier === "established" ? "◆ established in your world" : "◇ freshly grown";
          return `<div class="gen-canon ${tier}">
            <span class="gen-tier" title="grown through play · weight ${effectiveWeight(g)}${g._gen.rating ? ` · ${g._gen.rating}` : ""}">${badge}</span>
            <button class="opt gen-keep" data-keep="${esc(open.entityId)}" title="Keep this — mark it as one that matters to you. Raises it toward notable. Never nags.">⭐ Keep</button>
          </div>`;
        })()}
        ${mergeMode ? (() => {
          // SNG-019 allocation: fold THIS entry into the one it really belongs to
          const others = Object.values(character.codex.topics).filter(t => t.id !== open.id);
          const sug = suggestMerges(character, { max: 12 }).filter(s => s.aId === open.id || s.bId === open.id)
            .map(s => (s.aId === open.id ? s.bId : s.aId));
          const rank = t => (sug.includes(t.id) ? 0 : t.kind === open.kind ? 1 : 2);
          const sorted = others.sort((a, b) => rank(a) - rank(b) || b.facts.length - a.facts.length);
          return `<div class="codex-merge-pick"><div class="hint">Everything here (facts, links) moves onto the entry you pick; "${esc(open.label)}" becomes one of its names. Permanent.</div>
            ${sorted.map(t => `<button class="opt codex-merge-target ${sug.includes(t.id) ? "suggested" : ""}" data-mergetarget="${esc(t.id)}">
              ${sug.includes(t.id) ? "◈ " : ""}${esc(t.label)} <span class="cost">${esc(t.kind)} · ${t.facts.length} fact${t.facts.length === 1 ? "" : "s"}</span></button>`).join("")}
            <button class="btn secondary" id="codex-merge-cancel" style="margin-top:8px">Cancel</button></div>`;
        })() : `
        ${open.facts.length ? open.facts.map(f => `<div class="codex-fact">${esc(f)}</div>`).join("") : "<div class='insight'>known of, little learned yet</div>"}
        ${open.links.length ? `<div class="codex-links">linked: ${open.links.map(l => {
          const t = character.codex.topics[l];
          return t ? `<button class="codex-link" data-topic="${esc(l)}">${esc(t.label)}</button>` : `<span class="codex-link dead">${esc(l)}</span>`;
        }).join(" ")}</div>` : ""}
        <button class="opt" id="codex-merge-mode" style="margin-top:10px">⇆ This is the same as another entry…</button>`}
        <button class="btn secondary" id="codex-close-topic" style="margin-top:12px">All topics</button>
      </div>` : `
      ${(() => {
        // SNG-BATCH-9 Phase 2 §3: entities that grew into 'notable' (nominated) surface as
        // promotion candidates toward shared canon. Surfacing only — tap to open + ⭐/keep.
        const noms = nominationsFor(character).filter(n => !q || String(n.name).toLowerCase().includes(q)); // SNG-199 §6
        if (!noms.length) return "";
        return `<div class="codex-nominations"><div class="codex-group-title">★ Notable — grown into your world's canon</div>
          ${noms.slice(0, 6).map(n => `<button class="opt codex-nom" data-topic="${esc(n.id)}" title="weight ${n.weight}${n.rating ? ` · ${n.rating}` : ""} — a candidate to become shared-world canon">★ ${esc(n.name)} <span class="cost">${esc(n.type)}</span></button>`).join("")}</div>`;
      })()}
      ${/* SNG-153: a RECEIPT of what the codex did on its own — with a one-tap undo, because
            auto-merge is only safe while it stays reversible (Erik's condition). */""}
      ${character._codexDigest && !q ? `<div class="codex-digest insight" style="margin-bottom:8px">${esc(character._codexDigest)}${(character.codex?.mergeUndo || []).length ? ` <button class="opt codex-sug-btn dim" id="codex-undo">Undo the last merge</button>` : ""}</div>` : ""}
      ${suggestions.length ? `<div class="codex-suggestions"><div class="codex-group-title">These look like the same thing — your call</div>
        ${suggestions.map((s, i) => `<div class="codex-sug-row"><span class="codex-sug-pair">«${esc(s.a)}» ↔ «${esc(s.b)}»</span>
          <button class="opt codex-sug-btn" data-sugmerge="${i}">Merge</button>
          <button class="opt codex-sug-btn dim" data-sugnot="${i}">Not the same</button></div>`).join("")}</div>` : ""}
      <div class="codex-list">
        ${results.length ? (() => {
          // SNG-019: group by kind — primary entities first, facts nested under their node
          const KIND_ORDER = ["person", "place", "faction", "event", "mystery", "lore"];
          const KIND_LABEL = { person: "People", place: "Places", faction: "Factions", event: "Events", mystery: "Mysteries", lore: "Lore" };
          const byKind = {};
          for (const t of results) (byKind[t.kind] = byKind[t.kind] || []).push(t);
          return KIND_ORDER.filter(k => byKind[k]?.length).map(k => `
            <div class="codex-group"><div class="codex-group-title">${KIND_LABEL[k]}</div>
            ${byKind[k].sort((a, b) => (b.entityId ? 1 : 0) - (a.entityId ? 1 : 0) || b.facts.length - a.facts.length).map(t => `
              <div class="codex-node">
                <button class="codex-item" data-topic="${esc(t.id)}">
                  <strong>${esc(t.label)}</strong>${t.entityId ? ` <span class="codex-anchor" title="known entity">◈</span>` : ""}
                  ${(t.aliases || []).length ? `<span class="codex-aliases-inline">· also: ${t.aliases.slice(0, 2).map(esc).join(", ")}${t.aliases.length > 2 ? "…" : ""}</span>` : ""}
                  <span class="hint">${t.facts.length} fact${t.facts.length === 1 ? "" : "s"}</span>
                </button>
                ${t.facts.slice(-3).map(f => `<div class="codex-fact nested">${esc(f)}</div>`).join("")}
                ${t.links.length ? `<div class="codex-links nested">${t.links.slice(0, 5).map(l => {
                  const lt = character.codex.topics[l];
                  return lt ? `<button class="codex-link" data-topic="${esc(l)}">${esc(lt.label)}</button>` : "";
                }).join(" ")}</div>` : ""}
              </div>`).join("")}</div>`).join("");
        })() : (q
          ? `<div class='insight'>No entries match “${esc(query)}” — you may not know of it yet.</div>`  /* SNG-199 §6: an empty RESULT is not an empty CODEX */
          : "<div class='insight'>Nothing cataloged yet — knowledge accumulates as you learn things that matter.</div>")}
      </div>`}
    <button class="btn secondary" id="codex-back" style="margin-top:12px">Back to the valley</button>
  </div>`);
  const search = document.getElementById("codex-search");
  search.oninput = () => renderCodexScreen(search.value, null);
  if (search.value) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  for (const b of app.querySelectorAll("[data-topic]")) b.onclick = () => renderCodexScreen(query, b.dataset.topic);
  const closeT = document.getElementById("codex-close-topic");
  if (closeT) closeT.onclick = () => renderCodexScreen(query, null);
  // SNG-BATCH-9 Phase 2: ⭐ keep — the explicit engagement boost (raises toward notable)
  for (const b of app.querySelectorAll("[data-keep]")) b.onclick = () => {
    const rec = findGenerated(character, b.dataset.keep);
    if (!rec) return;
    recordAttention(rec, "keep", readClock(character.clock).day);
    autoVerifyLeg("b9p2-keep", `⭐ Kept a grown entity → ${rec._gen?.tier}`); // SNG-051 auto-verify
    saveCharacter(character);
    renderCodexScreen(query, openTopicId);
  };
  // SNG-019 allocation handlers: merge mode, target pick, suggestion verdicts
  const mm = document.getElementById("codex-merge-mode");
  if (mm) mm.onclick = () => renderCodexScreen(query, openTopicId, true);
  const mc = document.getElementById("codex-merge-cancel");
  if (mc) mc.onclick = () => renderCodexScreen(query, openTopicId, false);
  for (const b of app.querySelectorAll("[data-mergetarget]")) b.onclick = () => {
    const target = character.codex.topics[b.dataset.mergetarget];
    if (!target || !open) return;
    if (!confirm(`Fold "${open.label}" into "${target.label}"? Its facts and links move there, and "${open.label}" becomes one of its names. This can't be undone.`)) return;
    mergeInto(character, open.id, target.id);
    mergeCodexTopics(character); // the new alias may cascade more duplicates together
    saveCharacter(character);
    renderCodexScreen(query, target.id);
  };
  const undoBtn = document.getElementById("codex-undo");
  if (undoBtn) undoBtn.onclick = () => {
    const r = undoLastMerge(character);
    if (!r) return;
    character._codexDigest = `Put back — "${r.restored}" is its own entry again.`;
    saveCharacter(character);
    renderCodexScreen(query);
  };
  for (const b of app.querySelectorAll("[data-sugmerge]")) b.onclick = () => {
    const s = suggestions[parseInt(b.dataset.sugmerge)];
    if (!s) return;
    const A = character.codex.topics[s.aId], B = character.codex.topics[s.bId];
    if (!A || !B) return;
    // primary: anchored entity first, then the fuller node
    const [into, from] = (B.entityId && !A.entityId) || (!A.entityId === !B.entityId && B.facts.length > A.facts.length) ? [B, A] : [A, B];
    if (!confirm(`Merge "${from.label}" into "${into.label}"?`)) return;
    mergeInto(character, from.id, into.id);
    mergeCodexTopics(character);
    saveCharacter(character);
    renderCodexScreen(query, null);
  };
  for (const b of app.querySelectorAll("[data-sugnot]")) b.onclick = () => {
    const s = suggestions[parseInt(b.dataset.sugnot)];
    if (!s) return;
    markNotSame(character, s.aId, s.bId); // remembered — never suggested or auto-merged again
    saveCharacter(character);
    renderCodexScreen(query, null);
  };
  document.getElementById("codex-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- gambits: declared multi-step plans ----------

function gambitCtx() {
  const location = hereNow();
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  const comps = activeCompanions(character, CONTENT.companions);
  return {
    character, location, rules: CONTENT.rules, aptitudeMods: mods,
    bonuses: (action) => equipmentBonus(character, action.tags || [], CONTENT.rules).bonus +
                         companionBonus(comps, action.tags || [], CONTENT.rules, character).bonus
  };
}

/** SNG-043 Part B: the energy a planned step will cost — the ability's effective cost when the
 *  step uses one, else the flat per-step default. Lets the builder budget a plan before commit. */
function gambitStepEnergy(action) {
  const flat = CONTENT.rules.gambit?.stepEnergyCost ?? 4;
  if (action?.abilityId) { const ab = fullCatalog()[action.abilityId]; if (ab) return effectiveEnergyCost(ab, character, CONTENT.rules); }
  return flat;
}

/** SNG-093 (Design Law 5): an in-flight AI/network call must never be able to strand the UI in a
 *  loading state. Rejects after `ms` so a hang or timeout is caught like any other failure — the
 *  caller's catch/finally then restores a playable screen. */
function withTimeout(promise, ms = 30000, label = "the GM") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} didn't answer in time`)), ms)),
  ]);
}

function renderGambitBuilder(status = "") {
  if (!gambitDraft) gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null };
  const g = gambitDraft;
  const max = CONTENT.rules.gambit?.maxSteps ?? 5;
  // SNG-043 Part B: per-step + total energy, known once the plan is assessed (steps parsed)
  const stepEnergy = g.actions ? g.actions.map(gambitStepEnergy) : null;
  const totalEnergy = stepEnergy ? stepEnergy.reduce((a, b) => a + b, 0) : null;
  const overBudget = totalEnergy != null && totalEnergy > (character.energy ?? 0);
  chrome(`<div class="screen" style="max-width:720px">
    <h2>Plan a Gambit ${infoDot("gambit.what")} ${infoDot("gambit.fewer_is_harder")}</h2>
    <p class="hint" style="margin-bottom:12px">Declare a sequence of moves. Assess it to read your odds (as far as your experience allows), then run it. A failed step forces a decision: fallback, adapt, press on, or abandon. Adaptation points available: <strong>${adaptationPointsFor(profile, CONTENT.rules)}</strong>.</p>
    <div class="field"><label>Goal</label><input id="g-goal" value="${esc(g.goal)}" placeholder="e.g. get the falsified purity logs out of the array office" style="width:100%; box-sizing:border-box"></div>
    ${g.steps.map((s, i) => `
      <div class="field gambit-step">
        <label>Step ${i + 1}${g.assessed?.steps[i] ? ` — <span class="g-chance">${g.assessed.steps[i].sense.text ? esc(g.assessed.steps[i].sense.text) : "no read"}</span>${g.assessed.weakIndex === i ? ` <span class="g-weak">⚠ weakest link</span>` : ""}` : ""}${stepEnergy ? ` <span class="g-energy">· ${stepEnergy[i]} energy</span>` : ""}</label>
        <input class="g-step" data-i="${i}" value="${esc(s.text)}" placeholder="what you'll do" style="width:100%; box-sizing:border-box">
        <input class="g-fallback" data-i="${i}" value="${esc(s.fallback)}" placeholder="fallback if it goes wrong (optional)" style="width:100%; box-sizing:border-box; margin-top:4px; opacity:.8">
        <div style="margin-top:4px; display:flex; gap:6px; flex-wrap:wrap">
          ${i > 0 ? `<button class="opt g-up" data-i="${i}" title="Move this step earlier">▲ up</button>` : ""}
          ${i < g.steps.length - 1 ? `<button class="opt g-down" data-i="${i}" title="Move this step later">▼ down</button>` : ""}
          ${g.steps.length > 1 ? `<button class="opt g-remove" data-i="${i}">remove</button>` : ""}
        </div>
      </div>`).join("")}
    ${totalEnergy != null ? `<div class="gambit-total ${overBudget ? "over" : ""}">Total plan cost: <strong>${totalEnergy} energy</strong> of ${character.energy ?? 0} available${overBudget ? " — ⚠ this plan costs more energy than you have; expect to fall short partway" : ""}</div>` : ""}
    ${g.gmAdvice ? `<div class="gambit-advice">✦ GM: ${esc(g.gmAdviceExpanded ? (g.gmAdviceFull || g.gmAdvice) : g.gmAdvice)}${(g.gmAdviceFull && g.gmAdviceFull.length > g.gmAdvice.length) ? ` <button class="link-btn" id="g-advice-more">${g.gmAdviceExpanded ? "less" : "more"}</button>` : ""}</div>` : ""}
    <div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
      ${g.steps.length < max ? `<button class="btn secondary" id="g-add">+ step</button>` : ""}
      ${hasPlanDiscussion() ? `<button class="btn secondary" id="g-fill" title="Pull the goal and steps from what you just worked out with the GM">✦ Fill from our conversation</button>` : ""}
      <button class="btn secondary" id="g-assess">Assess plan</button>
      <button class="btn secondary" id="g-advise">✦ GM, look at this</button>
      <button class="btn" id="g-run" ${g.assessed ? "" : "disabled"}>Run it</button>
      <button class="btn secondary" id="g-startover" title="Clear this plan and start fresh — costs nothing, keeps nothing">↺ Start over</button>
      <button class="btn secondary" id="g-cancel">Back</button>
    </div>
    ${status ? `<div class="hint">${esc(status)}</div>` : ""}
  </div>`);
  const read = () => {
    g.goal = document.getElementById("g-goal").value;
    for (const el of app.querySelectorAll(".g-step")) g.steps[+el.dataset.i].text = el.value;
    for (const el of app.querySelectorAll(".g-fallback")) g.steps[+el.dataset.i].fallback = el.value;
  };
  for (const el of app.querySelectorAll(".g-step, .g-fallback, #g-goal")) el.oninput = () => { g.assessed = null; g.actions = null; g.gmAdvice = null; g.gmAdviceFull = null; g.gmAdviceExpanded = false; };
  for (const b of app.querySelectorAll(".g-remove")) b.onclick = () => { read(); g.steps.splice(+b.dataset.i, 1); g.assessed = null; g.actions = null; renderGambitBuilder(); };
  // reorder: ordering is meaningful (fewer steps = less slack; sequencing changes the outcome), so a
  // move invalidates the assessment. read() first so in-progress edits aren't lost on the swap.
  for (const b of app.querySelectorAll(".g-up")) b.onclick = () => { read(); const i = +b.dataset.i; [g.steps[i - 1], g.steps[i]] = [g.steps[i], g.steps[i - 1]]; g.assessed = null; g.actions = null; renderGambitBuilder(); };
  for (const b of app.querySelectorAll(".g-down")) b.onclick = () => { read(); const i = +b.dataset.i; [g.steps[i], g.steps[i + 1]] = [g.steps[i + 1], g.steps[i]]; g.assessed = null; g.actions = null; renderGambitBuilder(); };
  const add = document.getElementById("g-add");
  if (add) add.onclick = () => { read(); g.steps.push({ text: "", fallback: "" }); g.assessed = null; renderGambitBuilder(); };
  const fill = document.getElementById("g-fill");
  if (fill) fill.onclick = () => { read(); renderGambitBuilder("Reading your conversation for the plan…"); autofillGambitFromConversation(false); };
  const moreBtn = document.getElementById("g-advice-more");
  if (moreBtn) moreBtn.onclick = () => { read(); g.gmAdviceExpanded = !g.gmAdviceExpanded; renderGambitBuilder(); };
  // SNG-088C: a gambit must be abandonable and leave NOTHING behind — a fresh, blank draft.
  document.getElementById("g-startover").onclick = () => { abandonGambit(); renderGambitBuilder("Fresh plan — nothing carried over."); };
  document.getElementById("g-cancel").onclick = () => { gambitDraft = null; renderPlay(character.activeScene?.lastTurn || null, {}); };
  document.getElementById("g-assess").onclick = async () => {
    read();
    const texts = g.steps.map(s => s.text.trim()).filter(Boolean);
    if (!texts.length || !g.goal.trim()) { renderGambitBuilder("Give the plan a goal and at least one step."); return; }
    g.steps = g.steps.filter(s => s.text.trim());
    renderGambitBuilder("Reading the plan…");
    // SNG-093: try/catch/finally + timeout — a hang or a throw can never strand "Reading the plan…".
    try {
      const actions = await withTimeout(parseGambitSteps(g.steps.map(s => s.text), character, hereNow()), 30000, "the plan reader");
      g.actions = actions;
      g.assessed = assessGambit(actions, gambitCtx());
    } catch (err) {
      renderGambitBuilder("Couldn't read the plan (" + String(err?.message || err).slice(0, 60) + ") — try again.");
      return;
    }
    renderGambitBuilder();
  };
  const advise = document.getElementById("g-advise");
  if (advise) advise.onclick = async () => {
    read();
    const texts = g.steps.map(s => s.text.trim()).filter(Boolean);
    if (!g.goal.trim() || !texts.length) { renderGambitBuilder("Give the plan a goal and a step first, then ask the GM."); return; }
    renderGambitBuilder("The GM studies your plan…");
    // SNG-043 Part B: GM-collaborative building — one concrete suggestion or warning on the DRAFT
    const q = `[Gambit builder] Look at this DRAFT plan I'm assembling and give me ONE concrete, specific suggestion or warning about its sequencing or risk — a single sentence of advice (not a narration of any outcome; nothing is attempted yet). Goal: "${g.goal}". Steps so far: ${texts.map((t, i) => `${i + 1}) ${t}`).join("; ")}.`;
    // SNG-093 (Design Law 5): the GM call is wrapped in try/catch with a TIMEOUT, and `finally`
    // ALWAYS re-renders — an AI throw/hang can never leave the UI stuck on "The GM studies your plan…".
    try {
      // BATCH-11 §23: the "gambit" view — plan-relevant rows only (abilities, inventory, scene).
      const result = await withTimeout(gmAsk(assembleGMContext("gambit", gmEnv()), q), 30000, "the GM");
      // SNG-088A (SNG-076 miss): the GM's plan-advice is PROSE — clamp on a word boundary with a real
      // ellipsis (not a mid-word cut at 400), raise the bound, and keep the full text for an expander.
      if (result.ok) { g.gmAdviceFull = String(result.text).trim(); g.gmAdvice = smartClamp(g.gmAdviceFull, 600); g.gmAdviceExpanded = false; }
      else { g.gmAdvice = g.gmAdviceFull = "The GM couldn't weigh in (" + String(result.error).slice(0, 50) + ") — plan on."; }
    } catch (err) {
      g.gmAdvice = g.gmAdviceFull = "The GM didn't answer (" + String(err?.message || err).slice(0, 50) + ") — try again.";
    } finally {
      renderGambitBuilder();
    }
  };
  document.getElementById("g-run").onclick = () => { read(); runGambit(); };
}

/** SNG-088C: abandon/reset — a gambit must leave NOTHING behind. A fresh, blank draft; no carried
 *  goal, steps, assessment, advice, actions, or run state. Abandoning costs nothing and pays nothing;
 *  per canon only a COMPLETED gambit pays the bonus. */
function abandonGambit() {
  gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null, actions: null, gmAdvice: null, gmAdviceFull: null, gmAdviceExpanded: false };
}

/** SNG-088 follow-on: was there a long-form plan discussion with the GM just now? (enough recent
 *  dialogue that auto-pulling a plan from it is worth offering). */
function hasPlanDiscussion() {
  const turns = (sceneTurns || []).slice(-6);
  if (turns.length < 2) return false;
  const len = turns.reduce((n, t) => n + String(t.player || "").length + String(t.narration || t.summary || "").length, 0);
  return len >= 300;
}

/** SNG-088 follow-on: pull goal + ordered steps out of the recent conversation and populate the draft,
 *  so a player who talked the plan through with the GM doesn't have to retype it. Overwrites only what
 *  the extraction actually found (a typed goal survives an empty extraction). */
async function autofillGambitFromConversation(announce = true) {
  const g = gambitDraft;
  if (!g) return;
  try {
    const ex = await extractGambit({ recentTurns: (sceneTurns || []).slice(-6), maxSteps: CONTENT.rules.gambit?.maxSteps ?? 5 });
    const steps = (Array.isArray(ex?.steps) ? ex.steps : [])
      .map(s => ({ text: String(s?.text || "").slice(0, 300), fallback: String(s?.fallback || "").slice(0, 300) }))
      .filter(s => s.text);
    const goal = String(ex?.goal || "").trim().slice(0, 300);
    if (!steps.length && !goal) { renderGambitBuilder(announce ? "Nothing to pull from the conversation yet — write the plan here." : ""); return; }
    if (goal) g.goal = goal;
    if (steps.length) g.steps = steps;
    g.assessed = null; g.actions = null;
    renderGambitBuilder("✦ Pulled from your conversation — edit anything, reorder as you like, then Assess and Run.");
  } catch (e) {
    renderGambitBuilder(announce ? "Couldn't read the conversation (" + String(e.message || e).slice(0, 50) + ") — write the plan here." : "");
  }
}

/** The entry point for opening the builder. If the player has been TALKING THROUGH a plan and there is
 *  no draft yet, auto-fill from the conversation (Design Law 1: extracted, then editable). Otherwise
 *  open blank / resume the existing draft. */
function openGambitBuilder() {
  if (gambitDraft || !hasPlanDiscussion()) { renderGambitBuilder(); return; }
  gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null };
  renderGambitBuilder("Reading your conversation for the plan…");
  autofillGambitFromConversation(false);
}

async function runGambit() {
  const g = gambitDraft;
  const ctx = gambitCtx();
  const run = { receipts: [], adaptLeft: adaptationPointsFor(profile, CONTENT.rules), fallbackUsed: {} , abandoned: false };
  let index = 0;
  const step = () => {
    const res = executeGambit(g.actions, ctx, Math.random, index);
    run.receipts.push(...res.receipts.filter(r => r.degree !== "failure" && r.degree !== "crit_failure"));
    if (res.blockedAt === null) return finishGambit(run);
    const failed = res.receipts[res.receipts.length - 1];
    renderComplication(failed);
  };
  const renderComplication = (failed) => {
    const a = g.actions[failed.index];
    chrome(`<div class="screen" style="max-width:640px">
      <h2>The plan hits a wall</h2>
      <div class="roll-receipt" style="margin:10px 0">Step ${failed.index + 1}: ${esc(a.label)} — d100: ${failed.roll} vs ${failed.breakdown ? `<span class="roll-chance" data-breakdown="${attrJson({ ...failed.breakdown, roll: failed.roll, degree: failed.degree, ...(failed.crit ? { crit: failed.crit, critRoll: failed.critRoll, critText: failed.critText } : {}) })}" tabindex="0" role="button" title="Why this number?">${failed.chance}</span>` : failed.chance} — <span class="${failed.degree}">${failed.degree.replace("_", " ")}</span></div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        ${g.steps[failed.index]?.fallback && !run.fallbackUsed[failed.index] ? `<button class="choice" id="c-fallback">Fallback: ${esc(g.steps[failed.index].fallback)}</button>` : ""}
        ${run.adaptLeft > 0 ? `<button class="choice" id="c-adapt">Adapt — force another try (${run.adaptLeft} adaptation point${run.adaptLeft > 1 ? "s" : ""} left)</button>` : ""}
        <button class="choice" id="c-presson">Accept the failure and press on with the rest</button>
        <button class="choice" id="c-abandon">Abandon the plan — get out of it</button>
      </div>
    </div>`);
    const fb = document.getElementById("c-fallback");
    if (fb) fb.onclick = async () => {
      run.fallbackUsed[failed.index] = true;
      const [fbAction] = await parseGambitSteps([g.steps[failed.index].fallback], character, ctx.location);
      const r = rerollStep(fbAction, ctx);
      if (r.degree === "failure" || r.degree === "crit_failure") {
        renderComplication({ ...r, index: failed.index });
      } else {
        run.receipts.push({ index: failed.index, ...r, viaFallback: fbAction.label });
        index = failed.index + 1; step();
      }
    };
    const ad = document.getElementById("c-adapt");
    if (ad) ad.onclick = () => {
      run.adaptLeft--;
      const r = rerollStep(g.actions[failed.index], ctx);
      if (r.degree === "failure" || r.degree === "crit_failure") {
        renderComplication({ ...r, index: failed.index });
      } else {
        run.receipts.push({ index: failed.index, ...r, rerolled: true });
        index = failed.index + 1; step();
      }
    };
    document.getElementById("c-presson").onclick = () => {
      run.receipts.push(failed);
      index = failed.index + 1;
      if (index >= g.actions.length) finishGambit(run); else step();
    };
    document.getElementById("c-abandon").onclick = () => { run.receipts.push(failed); run.abandoned = true; finishGambit(run); };
  };
  step();
}

async function finishGambit(run) {
  const g = gambitDraft;
  gambitDraft = null;
  // energy: each executed step costs; ability steps cost their ability's energy
  const per = CONTENT.rules.gambit?.stepEnergyCost ?? 4;
  let cost = 0;
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    cost += a.abilityId ? effectiveEnergyCost(fullCatalog()[a.abilityId], character, CONTENT.rules) : per;
  }
  character.energy = Math.max(0, character.energy - cost);
  // practice ledger: each executed step with abilities counts once
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    const ids = [a?.abilityId, ...(a?.comboAbilities || [])].filter(Boolean);
    if (ids.length) { recordUse(character, ids, { day: absoluteWorldDay() }); pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex })); }
  }
  // the human planned: that's who they are becoming
  const allTags = ["plan", "prepare", ...new Set(g.actions.flatMap(a => a.intentTags || []))];
  updateProfile(character, allTags, CONTENT.rules.playerAptitudes, CONTENT.rules);
  const rough = run.receipts.some(r => r.complication || r.viaFallback || r.rerolled || r.degree === "failure" || r.degree === "crit_failure");
  const outcome = run.abandoned ? "abandoned" : rough ? "completed_rough" : "completed";
  // SNG-030 remainder: a carried-out plan PAYS — award the completion bonus so planning
  // out-earns improvising (strategist's adaptation points are already granted at build).
  let bonusXp = 0;
  if (!run.abandoned) {
    bonusXp = Math.max(0, CONTENT.rules.gambit?.completionBonusXp ?? 10);
    character.xp = (character.xp || 0) + bonusXp;
    for (const msg of applyLevelUps(character, CONTENT.rules)) { /* level-ups from the bonus land now */ }
    autoVerifyLeg("b8-gambit", `ran a gambit to completion (+${bonusXp} xp)`); // SNG-051 auto-verify
  }
  saveProfile(profile); saveCharacter(character);
  const resolution = gambitResolutionForGM(g.goal, run.receipts, g.actions, outcome);
  // novel steps inside a gambit carry the same stakes: backlash on crit failure,
  // a mintable technique on crit success
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    if (!a?.novel) continue;
    if (r.degree === "crit_failure") resolution.backlash = applyBacklash(character, CONTENT.rules);
    if (r.degree === "crit_success") {
      resolution.discoveryEligible = true;
      resolution.discoveryAbilities = [a.abilityId, ...(a.comboAbilities || [])].filter(Boolean);
      resolution.action.noveltyHint = a.noveltyHint || "";
    }
  }
  const gLabel = `GAMBIT: ${g.goal} (${outcome.replace("_", " ")}${bonusXp ? `, +${bonusXp} xp` : ""})`;
  renderPlay(null, { thinking: "The run unfolds…", playerBeat: { label: gLabel } });
  const result = await runGM({ resolution, playerInput: null });
  if (result) renderPlay(result.turn, { playerBeat: { label: gLabel }, degraded: result.degraded });
}

function useItem(name) {
  if (busy) return;
  const item = character.inventory.find(i => i.name === name || i.customName === name);
  if (!item) return;
  if (item.consumable) {
    const fx = consumeItem(character, name);
    saveCharacter(character);
    const parts = [];
    if (fx?.health) parts.push(`${fx.health > 0 ? "+" : ""}${fx.health} health`);
    if (fx?.energy) parts.push(`${fx.energy > 0 ? "+" : ""}${fx.energy} energy`);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You use the ${name}${parts.length ? ` (${parts.join(", ")})` : ""}.` });
  } else {
    openUseIntent(item); // SNG-114: a non-consumable's use is a scene action WITH intent, not a canned sentence
  }
}

/** SNG-114: THE shared item card — a superset (image when open + effects + bonusTags + use/name/drop),
 *  rendered by BOTH the inventory popup and the play sidebar so the two can never drift again. The only
 *  per-surface difference is which attribute toggles it open (each surface owns its own open-state var). */
function itemCard(it, { open = false, toggleAttr = "data-item-toggle", showPin = false } = {}) {
  const img = open && imagesEnabled() ? itemImage(it, { ratingLevel: viewerRatingLevel() }) : null;
  return `<div class="item-card ${open ? "open" : ""}">
    <button class="item-name" ${toggleAttr}="${esc(it.name)}">${esc(displayName(it))}${it.customName ? ` <span class="cost">(${esc(it.name)})</span>` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}</button>${showPin ? `<button class="item-pin ${it.pinned ? "on" : ""}" data-item-pin="${esc(it.name)}" title="${it.pinned ? "Pinned to the sidebar — tap to unpin" : "Pin to the sidebar for quick access"}">${it.pinned ? "📌" : "📍"}</button>` : ""}
    ${open ? `<div class="item-detail">
      ${img ? `<img class="item-img" data-lightbox="item" src="${esc(img)}" alt="${esc(it.name)}" loading="lazy" onerror="this.style.display='none'">` : ""}
      <div class="item-desc">${esc(it.description || it.kind)}</div>
      ${it.provenance ? `<div class="item-prov">${esc(it.provenance)}</div>` : ""}
      ${it.bonusTags?.length ? `<div class="item-tags">helps with: ${it.bonusTags.map(esc).join(", ")}</div>` : ""}
      ${it.effects ? `<div class="item-tags">${Object.entries(it.effects).map(([k, v]) => `${esc(k)} ${v > 0 ? "+" : ""}${esc(String(v))}`).join(", ")}</div>` : ""}
      ${/* SNG-251 §2c: THE MECHANICAL SHEET. Erik's ask, literally on the item — what the story's work
            translated to in rules. Every grant states where it came FROM and what it explicitly CANNOT do,
            because "explicit" without a stated bound is just power creep with better typography. */""}
      ${Array.isArray(it.grants) && it.grants.length ? `<div class="item-grants">
        <div class="item-grants-lbl">what it grants${it.derivedFrom ? ` — split from ${esc(it.derivedFrom)}` : ""}</div>
        ${it.grants.map(g => `<div class="item-grant">
          <div class="item-grant-name">◈ ${esc(g.name)}${g.from ? `<span class="item-grant-from"> — ${esc(g.from)}</span>` : ""}</div>
          <div class="item-grant-effect">${esc(g.effect)}</div>
          ${g.clamp ? `<div class="item-grant-clamp">bound: ${esc(g.clamp)}</div>` : ""}
        </div>`).join("")}
      </div>` : ""}
      ${it.derived?.length ? `<div class="item-tags">split into: ${it.derived.map(esc).join(", ")}</div>` : ""}
      <div class="item-actions">
        <button class="opt" data-item-use="${esc(it.name)}">${it.consumable ? "Consume" : "Use in scene"}</button>
        ${/* SNG-251 §2a: the PLAYER-INITIATED evolution. Erik should not have to beg the GM to notice that
              he bound runes into his spear — he can say so directly. Always available (Erik's §4 ruling),
              gated by the daily budget and by having to CITE the fiction that earned it. */""}
        ${it.consumable ? "" : `<button class="opt" data-item-evolve="${esc(it.name)}" title="Tell the story what this has become — cite what earned it">✦ Evolve</button>`}
        <button class="opt" data-item-name="${esc(it.name)}">Name it</button>
        <button class="opt" data-item-drop="${esc(it.name)}">Drop</button>
      </div></div>` : ""}
  </div>`;
}

/** SNG-114: bind the shared card's use/name/drop ONCE — both surfaces call this, so "Use in scene" does
 *  exactly one thing regardless of where it was tapped. `afterChange(name?)` re-renders the calling surface. */
function bindItemCardHandlers(afterChange) {
  for (const b of app.querySelectorAll("[data-item-use]")) b.onclick = () => useItem(b.dataset.itemUse);
  for (const b of app.querySelectorAll("[data-item-drop]")) b.onclick = () => { const n = b.dataset.itemDrop; if (confirm("Drop " + n + "?")) { removeItem(character, n, 999); saveCharacter(character); afterChange(); } };
  for (const b of app.querySelectorAll("[data-item-name]")) b.onclick = () => { const nn = prompt("Name this item:"); if (nn !== null && nameItem(character, b.dataset.itemName, nn)) { saveCharacter(character); afterChange(b.dataset.itemName); } };
  // SNG-251 §2a: PLAYER-INITIATED EVOLUTION. The whole ticket exists because Erik did the work in-fiction
  // and the GM never fired the op — so this path does not depend on the GM remembering anything. It is a
  // normal turn (the GM narrates and resolves it), but one the player can always start, and it arrives
  // carrying the CITE, so the "earned, not hand-waved" guard is answered by the player in their own words
  // rather than inferred. The daily budget is checked BEFORE the turn is spent, not after.
  for (const b of app.querySelectorAll("[data-item-evolve]")) b.onclick = () => {
    if (busy) return;
    const it = findItem(character, b.dataset.itemEvolve); if (!it) return;
    const budget = evolutionBudget(it, (() => { try { return absoluteWorldDay(); } catch { return null; } })(), character);
    if (!budget.canEvolve) { renderPlay(character.activeScene?.lastTurn || null, { aside: budget.why }); return; }
    const cite = prompt(`What has ${displayName(it)} been through that changed it?\n\nName the work the story actually did — a rune bound, a craft completed, a death taken. The GM records what that earns; "it feels stronger" earns nothing.`);
    if (cite == null || !String(cite).trim()) return;
    onFreeform(`I take up ${displayName(it)} and take stock of what it has become. ${String(cite).trim()} — reflect that in the item: its description, its name if it has earned one, and be explicit about what it now grants mechanically.`);
  };
  for (const b of app.querySelectorAll("[data-item-pin]")) b.onclick = (e) => { e.stopPropagation(); togglePin(character, b.dataset.itemPin); saveCharacter(character); afterChange(b.dataset.itemPin); }; // SNG-121
}

/** SNG-114: the intent step for using a non-consumable — offer the item's meaningful uses (authored or
 *  kind-default) + a free "how?" field. A storied item gets a real verb; the canned prompt is the fallback. */
function openUseIntent(item) {
  const nm = displayName(item);
  const uses = itemUses(item, nm);
  const submit = promptText => onFreeform(promptText);
  chrome(`<div class="screen" style="max-width:520px">
    <h2>Use ${esc(nm)}</h2>
    ${item.description ? `<p class="hint" style="margin-bottom:10px">${esc(item.description)}</p>` : ""}
    ${uses.length ? `<div class="use-list">${uses.map((u, i) => `<button class="btn secondary use-opt" data-use-idx="${i}" style="display:block; width:100%; text-align:left; margin:4px 0">${esc(u.label)}</button>`).join("")}</div>` : ""}
    <div class="field" style="margin-top:10px"><label>…or say how you use it</label>
      <input id="use-how" type="text" placeholder="e.g. I press the whetstone to the rune-seam and listen" style="width:100%"></div>
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn" id="use-go">Use it</button>
      <button class="btn secondary" id="use-cancel">Back</button>
    </div>
  </div>`);
  for (const b of app.querySelectorAll("[data-use-idx]")) b.onclick = () => submit(uses[Number(b.dataset.useIdx)].prompt);
  const how = document.getElementById("use-how");
  how.onkeydown = e => { if (e.key === "Enter") document.getElementById("use-go").click(); };
  document.getElementById("use-go").onclick = () => { const h = how.value.trim(); submit(h ? `I use my ${nm} — ${h}` : `I use my ${nm} here`); };
  document.getElementById("use-cancel").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- SNG-098 C: the skill-battle panel (two-sided contest + fog of war) ----------
// A duel runs here as a round-by-round exchange: you declare a skill + intensity, the engine resolves BOTH
// sides (skill_battle.js), the momentum meter moves, and how much of the opponent's move you see is gated by
// your senseTier (fog). The engine (Phases A+B) is tested; this is the presentation + input loop over it.

let sbIntensity = "standard";     // the player's current intensity dial
let sbLastPlayerFn = null;        // the last function the player showed — the opponent may READ it next round

/** The player's declarable contest skills: their abilities (function + tier + energy), plus the steel-and-wit
 *  fallbacks that always work (a plain strike, a raised guard) so a caster stripped of the lattice still fights. */
function playerBattleSkills() {
  const out = [];
  for (const a of character.abilities || []) {
    const def = fullCatalog()[a.abilityId];
    const fns = def?.functions || [];
    if (!fns.length) continue;
    // CCODE-38 (Erik: "I can use harmonic voice to mend… will it show up in the mend options?"): YES — a craft is
    // listed under EVERY function it has, not just functions[0]. Harmonic Voice is command+empower+HEAL, so it
    // belongs in mend as well as hinder/sway; the old functions[0] read hid every secondary use a craft had.
    // Each entry declares with THAT function, so picking it from MEND actually mends.
    for (const fn of fns) {
      out.push({ id: a.abilityId, function: fn, tier: a.level || 1, attribute: def.attribute || "practical", name: def.name || a.abilityId, energyCost: effectiveEnergyCost(def, character, CONTENT.rules), multi: fns.length > 1 });
    }
  }
  out.push({ id: "_strike", function: "strike", tier: 1, attribute: "physical", name: "A plain strike" });
  out.push({ id: "_guard", function: "shield", tier: 1, attribute: "physical", name: "Raise a guard" });
  // CCODE-43 (Erik): "Item use itself needs to be weaved in as well... throw a chemical at them or drink a potion."
  // A consumable is a MOVE you spend a step on. Drinking is also the honest answer to being spent — your crafts
  // have gone quiet, but a flask has not. Item moves are reveal-less, so the sense-step filter drops them naturally.
  for (const u of usableCombatItems(character, CONTENT.skillBattle?.engine?.items || {})) {
    const icfg = CONTENT.skillBattle?.engine?.items || {};
    out.push({ id: `_item_${slugify(u.item.name)}`, itemMove: u,
      function: u.mode === "throw" ? (icfg.throwFunction || "strike") : (icfg.drinkFunction || "restore"),
      tier: u.mode === "throw" ? (icfg.throwTier || 2) : 1, attribute: "practical",
      name: u.label, finds: null, itemNote: u.note });
  }
  // CCODE-46 (Erik): "or an attribute based generic type sense... a wits sense could find a solution that a Reason
  // based sense might miss." You can always LOOK, craft or no craft — and the attribute you look WITH changes what
  // you find. These are reveal-function, so they qualify for the SENSE step and cost nothing but the round.
  for (const g of (CONTENT.skillBattle?.engine?.senseStep?.genericSenses || [])) {
    out.push({ id: `_sense_${g.sub}`, function: "reveal", tier: 1, attribute: SUB_OF?.[g.sub] || "mental",
      subAttribute: g.sub, name: g.name, finds: g.finds, generic: true });
  }
  return out.slice(0, 40); // was 12 — a multi-function craft now occupies a slot per function; groups collapse
}

// SNG-246 BUG1: the skill battle no longer takes over a SEPARATE screen — it renders IN the play surface (the
// SNG-230 frame strip on top carries the kind/momentum-meter/win/exits; these controls live in the option area).
// sbLastRound carries the previous round's fog across renders (renderPlay has no lastRound of its own).
let sbLastRound = null;
let sbLastRoundReceipt = null; // SNG-246 (Erik): what JUST happened this round — both moves + the interaction + the swing, SHOWN.
let sbLastRoundRolls = null;   // CCODE-36 (Erik): the ROLLS behind that round — same breakdown popover as normal play.
let sbBusy = false;      // CCODE-45/47: a call is in flight — the panel must SAY so, not just sit there.
let sbBusyLabel = "";    // CCODE-47: what we are waiting ON, in the player's terms.
let sbQuickBeat = "";    // CCODE-47: the fast Haiku read of the exchange, shown while the full telling renders.       // CCODE-45: a GM call is in flight for this turn — don't let a double-click double-resolve.
let sbWeaveArmed = null;       // CCODE-37 (Erik: "this is where braids really shine"): index of the craft armed to WEAVE.
const sbOpenFams = {};         // CCODE-38 (Erik: "can we make the categories collapsible?"): family → open?, kept across rounds.
let sbDetailOpen = false;      // SNG-252b §2c: the tucked turn-detail (intensity + the action chain), remembered across rounds

// SNG-246 (Erik: "no rolls, no opposed rolls or descriptions… ended inexplicably"): a per-round MECHANICAL line
// for the skill battle — names YOUR move and THEIRS, the interaction (blades lock / turned aside / you slip it),
// who took the exchange, and the momentum swing. Engine-generated (no per-round GM call), so every round is legible.
/** SNG-247 Tier 2a: what the meter is CALLED in this contest — Momentum in a fight, Their Resolve in a standoff,
 *  Distance in a chase. Reads the same per-kind framing copy the frame strip's meter uses, so the receipt and the
 *  bar above it can never name the same number two different things. */
// ---------- CCODE-53 (Erik: "this is a sealed door right? not a stranger with feet") ----------
// The MECHANICS went per-kind in SNG-247/248; the VOCABULARY did not. Every string that names the other side was
// written when there was only one kind — a fight — so a puzzle inherited "your opponent", "their crafts", "reads
// THEM", "finds their intent and how much resolve is behind it". A door has no intent and no resolve.
// The lexicon is per-kind CONTENT (kinds.<kind>.lexicon), read everywhere a person-word used to be hardcoded.
// Absent a lexicon the fight's words hold, so fights are untouched — and a kind that only authors SOME keys keeps
// the fight's word for the rest, so a half-authored lexicon is never worse than none.
const FIGHT_LEXICON = {
  other: "your opponent",       // what the other side IS
  them: "them", their: "their", they: "they", it: "they",
  craftsLabel: "their crafts",
  fullKit: "their full kit",
  unreadNote: "unread — a sense read shows you the verbs",
  readVerb: "reads THEM — sharpens the fog and sets up your next move",
  senseHint: "Read them first — it costs the craft's energy, but it is NOT a free hit for them any more. Skip it to conserve.",
  actionHint: "Your real move this turn.",
};
/** CCODE-53: the words for the kind you are actually in. Pure over the loaded content. */
/** CCODE-53: a step's hint, in the words of the kind you are in — falls back to the step's own fight phrasing. */
function sbStepHint(step) {
  const L = sbLex();
  if (step?.key === "sense" && L.senseHint) return L.senseHint;
  if (step?.key === "action" && L.actionHint) return L.actionHint;
  return step?.hint || "";
}

function sbLex() {
  const e = activeEnc(); if (!e) return FIGHT_LEXICON;
  const k = encounterKind(e.def) || "fight";
  return { ...FIGHT_LEXICON, ...(CONTENT.skillBattle?.engine?.kinds?.[k]?.lexicon || {}) };
}

function sbMeterWord() {
  const e = activeEnc(); if (!e) return "momentum";
  const k = encounterKind(e.def) || "fight";
  return (CONTENT.frameKinds?.[k]?.meterLabel || FRAME_KINDS_FALLBACK[k] || "momentum").toLowerCase();
}
const FRAME_KINDS_FALLBACK = { fight: "Momentum", chase: "Distance", hazard: "Progress", puzzle: "Insight", standoff: "Their Resolve" };
// SNG-247 Tier 4: icon + title per kind for the MORPH line, used only when Aevi's frameKinds copy isn't loaded.
const FRAME_KINDS_FALLBACK_FULL = { fight: { icon: "⚔", title: "The Contest" }, chase: { icon: "🏃", title: "The Chase" },
  hazard: { icon: "⚠", title: "Hard Ground" }, puzzle: { icon: "🧩", title: "The Sealed Thing" }, standoff: { icon: "🗣", title: "The Standoff" } };

// ---------- SNG-247 (Erik): WHAT A PLAYER CAN SEE AT EACH LEVEL OF FOG ----------
// The fog ladder was authored in content (senseVisibility 0–3) and never SHOWN, so the panel could tell you to
// "read them to see it" when reading could not possibly get you there: their math needs tier 3, and a read buys
// only `revealActionBuysTier` (1). A character whose base sense tier is 0 can read every single turn and never
// see a breakdown. Fog may hide; it must never promise.
const FOG_RUNG = {
  outcome:   "whether their move landed",
  intent:    "the VERB they are gathering to (enough to counter-pick)",
  band:      "a BAND on their roll (crushing / strong / even / weak)",
  skill:     "the NAME of the craft they used",
  intensity: "how hard they are spending (conserve / standard / surge)",
  breakdown: "their FULL roll math — every modifier, itemised",
};
/** What this tier shows, and honestly what the NEXT rung would add. Pure over the loaded content. */
function fogLadder(tier) {
  const vis = CONTENT.skillBattle?.engine?.senseVisibility || {};
  const t = Math.max(0, Math.min(3, tier | 0));
  const now = new Set(vis[String(t)]?.reveals || ["outcome"]);
  const next = t >= 3 ? null : new Set(vis[String(t + 1)]?.reveals || []);
  const gained = next ? [...next].filter(r => !now.has(r)) : [];
  return { tier: t, label: vis[String(t)]?.label || null, sees: [...now], nextTier: next ? t + 1 : null, nextGains: gained };
}
/** The one line the receipt prints when their math is still hidden — naming the rung, not a false promise. */
function fogLadderLine(fog) {
  const l = fogLadder(fog?.tier ?? 0);
  const buys = CONTENT.skillBattle?.engine?.revealActionBuysTier ?? 1;
  const reach = (fog?.tier ?? 0) + buys >= 3;
  const seeing = l.sees.map(r => FOG_RUNG[r]).filter(Boolean).join(" · ");
  return `their math is fogged — you are at sense tier ${l.tier} of 3, which shows: ${seeing}. `
    + (reach ? `👁 A read (+${buys} tier) reaches their full math.`
             : `A read buys +${buys} tier — not enough here. Their math needs tier 3, so it takes a sharper sense (a reveal/foresee craft, or a higher Insight) as well as reading them.`);
}

/** SNG-246 receipt — a thin adapter now. The whole builder moved to engine/roundreceipt.js so it could be
 *  TESTED: it was untestable in here, which is exactly how it shipped a line that reported every round of
 *  every fight as "neither gains — it's even". tests/contest_sim.mjs Monte-Carlos it now. */
function sbRoundReceipt(rr, playerDecl, beforeMom, scouting) {
  return receiptLine({ rr, playerDecl, beforeMom, scouting,
    meterWord: sbMeterWord(), meterMax: CONTENT.skillBattle?.engine?.momentum?.meterMax ?? 16 });
}

// CCODE-36 (Erik): one round as a compact line for the END-OF-FIGHT narration. This is the GM's raw material for
// telling the WHOLE fight — so it carries what a narrator needs (who did what, how well, who gained, what stuck),
// in plain terms, not the full telemetry (that's the machine tab's job).
function sbFightBeat(rr, decl, beforeMom, scouting) {
  const deg = (rr.player?.degree || "").replace("_", " ");
  // Shares roundVerdict with the receipt instead of re-deriving the same comparison. This WAS a second copy
  // of that logic — which is how the two could drift into telling the player and the GM different stories
  // about one round, and the GM narrates from this beat.
  const { verdict } = roundVerdict(beforeMom, rr.state?.momentum);
  const who = verdict === "player" ? "you gained" : verdict === "opponent" ? "they gained" : "neither gained";
  const hurt = (rr.deltas?.health || 0) < 0 ? `, you took ${Math.abs(rr.deltas.health)} damage` : "";
  const stuck = (rr.landed || []).map(f => `${f.from === "player" ? "you" : "they"} gained ${f.label}`).join("; ");
  const mine = scouting ? `you read them (${deg})` : `you used ${decl.name} — a ${decl.function} at ${decl.intensity} (${deg})`;
  return `Round ${rr.state?.round ? rr.state.round - 1 : "?"}: ${mine}; they used ${rr.oppDecl?.name || rr.oppDecl?.function || "a strike"} (${(rr.opponent?.degree || "").replace("_", " ")}). ${who} ground${hurt}.${stuck ? ` ${stuck}.` : ""}`;
}

// SNG-246 (Erik: "some output specifically going to the machine tab… I could gather it"): mirror each skill-battle
// round's full telemetry to the machine tab's combat log — the rolls both sides made, the margins, the momentum
// swing, energy/health deltas, and how (if) it ended. Dev-only (recordCombatRound is inert unless armed).
// SNG-271 (Erik's log) — THE STALE RIBBON. This read `sbLastRoundReceipt`, a module-level variable holding
// whatever prose was last DISPLAYED. The strike path sets it just before logging, so those rounds were fine.
// The READ path never sets it — it builds its own prose in `t.senseLine` and hands it to the narrator — so a
// read round recorded the PREVIOUS STRIKE'S receipt verbatim: fresh numbers under stale words, which is the
// worst kind of wrong in a diagnostic log, because it looks like it is telling you something.
//
// The receipt is a PARAMETER now. A caller that knows what happened this round says so; nothing has to
// remember to update a shared variable in the right order first.
function sbLogRound(enc, decl, rr, beforeMom, scouting, receipt = sbLastRoundReceipt) {
  const p = rr.player, o = rr.opponent;
  const num = (v) => Number.isFinite(v) ? Math.round(v * 10) / 10 : v;
  recordCombatRound({
    at: Date.now(),
    opponent: enc.def?.opponent?.name || "opponent",
    round: enc.state?.round ?? 0,
    kind: scouting ? "read" : (rr._collapse ? "finisher" : "strike"),
    you: { move: decl.name, fn: decl.function, tier: decl.tier, attr: decl.attribute, intensity: decl.intensity, roll: p ? { chance: num(p.chance), rolled: num(p.roll), margin: num(p.margin), matchup: num(p.matchup) } : null },
    them: { move: rr.oppDecl?.name || rr.oppDecl?.function, fn: rr.oppDecl?.function, tier: rr.oppDecl?.tier, intensity: rr.oppDecl?.intensity, roll: o ? { chance: num(o.chance), rolled: num(o.roll), margin: num(o.margin), matchup: num(o.matchup) } : null },
    momentum: { before: num(beforeMom), after: num(rr.state?.momentum), swing: num((rr.state?.momentum ?? 0) - beforeMom), winner: rr.roundWinner },
    deltas: rr.deltas,
    energyLeft: { you: character.energy, them: num(rr.state?.opponentEnergy) },
    ended: rr.ended || false,
    outcome: rr.outcome || null,
    events: rr.events || [],
    // CCODE-35: the effects in play — what modified THIS roll (each side's named contestMods) and what the
    // round left standing. This is the part that makes a "why did that roll land?" question answerable.
    effectsApplied: { you: (p?.effectMods || []).map(m => `${m.label} ${m.value >= 0 ? "+" : ""}${m.value}`), them: (o?.effectMods || []).map(m => `${m.label} ${m.value >= 0 ? "+" : ""}${m.value}`) },
    effectsLanded: (rr.landed || []).map(f => `${f.from === "player" ? "you" : "them"}: ${f.label} ${f.value >= 0 ? "+" : ""}${f.value} × ${f.roundsLeft}r`),
    effectsStanding: (rr.state?.effects || []).map(f => `${f.side === "player" ? "you" : "them"}: ${f.label} ${f.value >= 0 ? "+" : ""}${f.value} (${f.roundsLeft}r, ${f.applies})`),
    receipt: receipt || null
  });
}

/** SNG-246 BUG1: the skill-battle round CONTROLS, rendered inside the play surface — the fog read, the intensity
 *  dial, the declarable skills, and the three ways (read / break / yield). The frame strip above already shows the
 *  momentum meter + win-condition, so this is just the inputs. Returns "" when not in a skill battle. */
// ---------- CCODE-45: THE TURN (Erik) — sense -> action -> bonus, two GM calls ----------
// "The action selections need to be just that... making selections for that part of the turn's actions." Each step
// is a SELECTION step: pick a craft (or two, to braid), type shaping text for THAT step, then proceed. The sense
// step resolves and is NARRATED first, then LOCKS — "if you sense and do a GM call you can't edit back to it."
// Action + bonus are only RECORDED until you Execute, which resolves them and narrates the whole turn.
//
// This REPLACES the arm-then-pick weave gesture Erik called unintuitive: braiding is now simply selecting a second
// craft in the same step — the same mechanics (both effects land, both cost) with none of the modality.
const SB_STEPS = [
  { key: "sense",  label: "Sense",  glyph: "\u25ce", hint: "Read them first — it costs the craft's energy, but it is NOT a free hit for them any more. Skip it to conserve." },
  { key: "action", label: "Action", glyph: "\u2694", hint: "Your real move this turn." },
  { key: "bonus",  label: "Bonus",  glyph: "\u2726", hint: "Earned by a good read — a FULL extra action. The payoff." }
];
function sbFreshTurn() {
  return { phase: "sense", sel: { sense: [], action: [], bonus: [] },
    text: { sense: "", action: "", bonus: "" }, setupBonus: 0, bonusEarned: false, senseDone: false, senseLine: "" };
}
function sbTurn() {
  const e = activeEnc(); if (!e || e.state?.mode !== "skill_battle") return null;
  if (!e.state.turn) e.state.turn = sbFreshTurn();
  return e.state.turn;
}
/** The declaration a step's selection makes: the first craft leads, a second is WOVEN in (CCODE-37 mechanics). */
function sbDeclFromSel(sel, skills, intensity) {
  const picked = (sel || []).map(i => skills[i]).filter(Boolean);
  if (!picked.length) return null;
  const lead = picked[0];
  const d = { function: lead.function, tier: lead.tier || 1, attribute: lead.attribute || "practical",
              intensity, name: lead.name, id: lead.id };
  if (picked[1]) d.woven = { function: picked[1].function, tier: picked[1].tier || 1, name: picked[1].name, id: picked[1].id };
  // CCODE-43: what you are WIELDING rides on the declaration, so the engine can put it in the roll as its own
  // named line. A dagger and an axe suit different verbs — that is the choice Erik wanted to be real.
  const wield = wieldBonusFor(character, d.function, CONTENT.skillBattle?.engine?.items || {});
  if (wield) d.wield = wield;
  // CCODE-43: an ITEM move (drink / throw) carries what spending it does.
  if (lead.itemMove) { d.itemMove = lead.itemMove; d.name = lead.name; }
  return d;
}
/** The step tracker: where you are in the turn, and what is already locked behind you. */
function sbStepTracker(turn) {
  const order = ["sense", "action", "bonus", "review"];
  const at = order.indexOf(turn.phase);
  const cells = SB_STEPS.filter(st => st.key !== "bonus" || turn.bonusEarned).map(st => {
    const i = order.indexOf(st.key);
    const cls = st.key === turn.phase ? "on" : (i < at ? "done" : "");
    const lock = st.key === "sense" && turn.senseDone ? " \u2022 locked" : "";
    return `<span class="sb-step ${cls}">${st.glyph} ${esc(st.label)}${lock}</span>`;
  }).join('<span class="sb-step-sep">\u2192</span>');
  const rev = `<span class="sb-step-sep">\u2192</span><span class="sb-step ${turn.phase === "review" ? "on" : ""}">\u2713 Execute</span>`;
  return `<div class="sb-steps">${cells}${rev}</div>`;
}
/** The review card: the whole turn laid out before you commit it. */
function sbReviewCard(turn, skills) {
  const line = (k) => {
    const picked = (turn.sel[k] || []).map(i => skills[i]).filter(Boolean);
    if (!picked.length) return `<div class="sb-review-line dim">${esc(k)} — <em>skipped</em></div>`;
    const names = picked.map(x => esc(x.name)).join(" \u22c8 ");
    const txt = turn.text[k] ? ` <span class="hint">“${esc(turn.text[k])}”</span>` : "";
    return `<div class="sb-review-line"><strong>${esc(k)}</strong> — ${names}${picked.length > 1 ? ' <span class="sb-braid-note">braided</span>' : ""}${txt}</div>`;
  };
  return `<div class="sb-review">
    <div class="sb-review-title">The turn as it stands</div>
    ${line("sense")}${turn.senseLine ? `<div class="sb-review-line dim">${esc(turn.senseLine)}</div>` : ""}
    ${line("action")}
    ${turn.bonusEarned ? line("bonus") : ""}
    <div class="hint" style="margin-top:5px">Execute resolves the action${turn.bonusEarned ? " and bonus" : ""} and the GM narrates the whole turn. The sense step is already locked.</div>
  </div>`;
}

/** CCODE-46: price ONE move as the player would see it — a contested win-chance, fogged by what they actually
 *  know. Returns null when there is nothing honest to say. The opponent's stack is ESTIMATED from their sheet;
 *  the confidence (not the number) is what the fog gates, so we never fabricate precision we do not have. */
function sbPriceMove(allSkills, fog, st, sb) {
  const oppSheet = st.opponentSheet || {};
  const theirFn = st.lastOppFn || (oppSheet.skills || [])[0]?.function || "strike";
  const counter = hasCounterCraft(allSkills, theirFn, sb);
  const fogTier = fog?.tier ?? 0;
  // their raw stack, estimated the way the engine builds one: attribute base + tier rank.
  const theirAttr = Math.max(0, ...Object.values(oppSheet.attributes || {}).map(Number).filter(Number.isFinite));
  const theirTier = Math.max(1, ...((oppSheet.skills || []).map(x => Number(x.tier) || 1)));
  const theirStack = theirAttr * 16 + theirTier * 5;
  return (s) => {
    const myAttr = Number((character.attributes || {})[s.attribute]) || 0;
    const mine = myAttr * 16 + (s.tier || 1) * 5 + matchupBonus(s.function, theirFn, sb);
    const est = estimateExchange({ myStack: mine, theirStack, fogTier, counterCraft: counter, sb });
    est.tip = est.show === "none"
      ? `Your senses do not reach this yet — read them first. ${counter ? "" : "A craft that counters what they are doing would also let you judge it."}`
      : `Your read of the odds you WIN this exchange (opposed, with matchup and standing effects). Confidence ${est.confidence}/3${counter ? " — you hold a craft that counters what they are doing, so you can judge this well" : fogTier ? " — from what your read bought you" : ""}.`;
    return est;
  };
}

/** CCODE-46 (Erik): "Even no success might give you some idea of what you COULD read if you succeeded. successful
 *  read should tell you something about them you can take advantage of. crit success even better still."
 *  So a read ALWAYS returns something: a failure names what was almost within reach; a success names a real,
 *  usable fact; a crit names the exploitable weakness outright. */
function sbReadPayoff(degree, oppSheet, st, def) {
  const name = def?.opponent?.name || "they";
  const skills = oppSheet?.skills || [];
  const theirBest = skills.slice().sort((a, b) => (b.tier || 1) - (a.tier || 1))[0];
  const tired = (st.opponentEnergy ?? 99) < 30;
  if (degree === "crit_success") {
    return `You have them: ${name} leans on ${theirBest?.name || "one line of attack"} (${theirBest?.function || "strike"}), and ${tired ? "they are running out of wind" : "their guard opens when they commit to it"}. Counter that function and the exchange is yours.`;
  }
  if (degree === "success") {
    return `You read ${name}: they favour ${theirBest?.function || "the direct attack"}${tired ? ", and they are tiring" : ""}. Pick a craft that answers it.`;
  }
  if (degree === "partial") {
    return `A glimpse only — ${name} tends toward ${theirBest?.function || "the direct"}, but you cannot see the shape of it yet.`;
  }
  return `You learn nothing usable this time. Had it landed you would have seen which craft ${name} leans on, and whether their wind is going — enough to pick the counter.`;
}

function skillBattlePanel() {
  const enc = activeEnc();
  if (!enc || enc.state?.mode !== "skill_battle") return "";
  const st = enc.state, def = enc.def, sb = CONTENT.skillBattle.engine;
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  const scout = !!sbLastRound?._scout;
  // fog only after the first exchange (round > 1) — a fresh fight has nothing revealed yet, and this avoids a
  // stale prior-fight read leaking into a new one's opening beat.
  // CCODE-46: the fog reads from a receipt PERSISTED on the encounter state, not from module-level sbLastRound
  // behind a `round > 1` gate — the SENSE step deliberately does not advance the round, so that gate never
  // opened and a read bought the player nothing they could SEE. A read also buys the scouting tier.
  const oppReceipt = st.lastOppReceipt || ((sbLastRound?.opponent && st.round > 1) ? sbLastRound.opponent : null);
  const readScout = scout || !!st.lastReadWasSense;
  // CCODE-51 (Erik's ladder): a read that was actually ROLLED sets the tier from its degree — st.senseTierEarned.
  // Absent a rolled read we fall back to the standing stat, so an unread fight still shows what you can see.
  const fog = oppReceipt ? senseOpponent(character, oppReceipt, CONTENT.rules, sb, { scouting: readScout, buyTier: readScout ? (sb.revealActionBuysTier ?? 1) : 0, aptitudeMods: mods, earnedTier: st.senseTierEarned }) : null;
  const skills = playerBattleSkills();
  window._sbSkills = skills; // handler lookup (data-sbskill = index into this flat list)
  // CCODE-45: which STEP of the turn we are selecting for, and what is picked so far (2 = a braid).
  const turn = sbTurn();
  // CCODE-41/48: a craft can BLIND you to your own senses (deniesPhase). If the sense step is denied this turn,
  // the engine skips you past it rather than offering a step you cannot take — the counterplay to a setup-heavy
  // build, and the reason skipping sense had to be first-class. Without this consumer the whole thing was inert.
  if (turn.phase === "sense" && phaseDenied(st.effects, "player", "sense")) {
    turn.phase = "action"; turn.senseDone = true; turn.senseBlinded = true;
    turn.senseLine = "Your senses are shut — you cannot read them this turn.";
  }
  const step = SB_STEPS.find(x => x.key === turn.phase) || SB_STEPS[1];
  const sel = turn.sel[turn.phase] || [];
  const selCount = sel.length, selFull = selCount >= 2;
  const busySB = !!sbBusy;
  const oppTired = st.opponentEnergy != null && fog && fog.tier >= 2 ? (st.opponentEnergy < 15 ? "spent" : st.opponentEnergy < 40 ? "tiring" : "still fresh") : null;
  // SNG-246 (Erik): group the moves by INTENT-family — you can do a lot of things a lot of ways, but each turn you
  // pick ONE. Same family grouping the ⚙ Moves gear uses, with combat-intent labels; free-text shaping is the field
  // below (a typed move → sbDeclare, API-free). "⚡ Finish it" is the DELIBERATE one-shot (below), not a normal strike.
  // CCODE-46 (Erik): "During the sense action, you shouldn't be able to use clearly attacks during the sense round
  // — it should only allow skills that can sense." The SENSE step shows only sense-capable crafts + the generic
  // attribute reads; every other step shows the full set.
  const senseFns = CONTENT.skillBattle?.engine?.senseStep?.senseFunctions || ["reveal", "foresee", "track"];
  // CCODE-78 (Erik): "we may want to add the wards as an option to the sense step... that way they have a
  // chance of taking effect for that round and the next." A ward is not an attack, so this KEEPS the rule
  // above rather than bending it. The engine charges for it: guard here and you earn no read (setup bonus 0,
  // sense tier 0), which is what makes it a decision instead of a strictly-better opening.
  const guardFns = CONTENT.skillBattle?.engine?.senseStep?.guardFunctions || [];
  // CCODE-51 (Erik: "the skills you can use seem to be unfiltered... why does hunter's strike show up??? it should
  // be mainly about movement, concealing, binding, sensing"). The step filter only knew about the SENSE step, so
  // every kind offered the whole kit on its action step — a knife-fighting craft as a way to win a footrace. Each
  // kind now names the verbs that can move ITS meter (content: kinds.<kind>.moveFunctions). Absent an entry the
  // full kit shows, so a fight is unchanged. Never a hard lock: the free-text field below still takes anything —
  // the filter shapes the SHORTCUTS, and the GM resolves whatever you actually describe.
  const kindNow = encounterKind(def) || "fight";
  const kindMoves = CONTENT.skillBattle?.engine?.kinds?.[kindNow]?.moveFunctions || null;
  const stepSkills = turn.phase === "sense"
    ? skills.filter(x => senseFns.includes(x.function) || guardFns.includes(x.function))
    : (kindMoves ? skills.filter(x => x.itemMove || kindMoves.includes(x.function)) : skills);
  // CCODE-46: PRICE each move — an estimated chance to win the exchange, with the confidence itself fogged.
  // Reading them buys precision; holding a counter-craft to what they are doing buys it too.
  const priceOf = sbPriceMove(skills, fog, st, sb);
  const byFam = {};
  stepSkills.forEach((s) => { const i = skills.indexOf(s); const f = sbFamilyOf(s); (byFam[f] = byFam[f] || []).push({ s, i }); });
  const groups = FUNCTION_FAMILIES.filter(f => byFam[f]?.length).map(f => {
    // CCODE-34: each move carries a WHAT-IT-DOES line (target clarity) + an ⓘ that opens the full craft detail.
    // The ⓘ is a SIBLING of the declare-button, never a child — inside it, a tap would also declare the move.
    // SNG-252b §2d: DEDUPE THE FAMILY BLURB. `SB_DOES` is keyed by VERB, and a family usually holds several
    // skills of one verb — so five REVEAL crafts each repeated "reads THEM — sharpens the fog", burying the
    // per-move distinguishing line ("finds the opening" vs "finds the pattern") underneath five identical
    // ones. When the whole group shares a blurb it belongs to the GROUP, once; each row then carries only what
    // makes IT different. Mixed-verb groups keep their per-row lines, since there is nothing to hoist.
    const famDoes = [...new Set(byFam[f].map(({ s }) => SB_DOES[s.function] || ""))];
    const sharedDoes = famDoes.length === 1 && famDoes[0] ? famDoes[0] : "";
    const chips = byFam[f].map(({ s, i }) => {
      const does = sharedDoes ? "" : (SB_DOES[s.function] || "");
      const known = !!fullCatalog()[s.id];
      const info = known
        ? `<button class="sb-skill-info" data-entity="skill:${esc(s.id)}" title="What this craft is — full detail" aria-label="Explain ${esc(s.name)}">ⓘ</button>`
        : `<button class="sb-skill-info" data-verb="${esc(s.function)}" title="What ${esc(s.function)} does — the verb's mechanics" aria-label="Explain ${esc(s.function)}">ⓘ</button>`;
      // CCODE-45: a craft is SELECTED for this step now, not fired instantly. Pick one; pick a second and they
      // BRAID — the same weave mechanics (both effects land, both cost), with none of the arm-then-pick modality.
      const pick = sel.indexOf(i), on = pick >= 0;
      const odds = priceOf(s);
      const fin = finisherPotential(s, fullCatalog()[s.id], sb);
      // CCODE-42: a finisher shows its SITUATIONAL chance to end it outright — and the reasons, so the number is
      // never bare. Fogged like every other estimate: unread, you get the tag without a number.
      const fo = fin?.can ? finishOdds({ skill: s, def: fullCatalog()[s.id], oppSheet: st.opponentSheet, state: st, sb }) : null;
      const foKnown = fo && (priceOf(s)?.confidence ?? 0) >= 2;
      const finTag = fin?.can
        ? `<span class="sb-fin" title="FINISHING POTENTIAL${fin.why === "innate" ? " — this craft can kill, so it has carried this from the start" : " — earned by reaching tier " + (s.tier || 1)}. Declare it as your ACTION and a decisive swing can end the fight in one beat.${fo ? "\n\nChance to END it outright: " + fo.pct + "%\n· " + fo.reasons.join("\n· ") : ""}${foKnown ? "" : "\n\n(Read them to see the number.)"}">\u26a1 finisher${foKnown ? ` \u00b7 ${fo.pct}% to end it` : ""}</span>`
        : (fin && fin.why === "needs-tier" ? `<span class="sb-fin dim" title="Not yet a finisher — this craft gains finishing potential at tier ${fin.needTier}.">\u26a1 at T${fin.needTier}</span>` : "");
      const oddsTag = odds ? `<span class="sb-odds sb-odds-${odds.show}" title="${esc(odds.tip)}">${esc(odds.label)}</span>` : "";
      // CCODE-78: on the SENSE step a guard is offered alongside the reads, and the TRADE has to be visible
      // BEFORE the pick, not discovered after it. An unpriced choice between "read them" and "raise a shield"
      // reads as strictly-better-defence; priced, it is the actual decision Erik described.
      const guardHere = turn.phase === "sense" && guardFns.includes(s.function);
      const guardTag = guardHere
        ? `<span class="sb-guard-early" title="Raise it NOW and it is standing for this round\u0027s action AND the next \u2014 you do not have to spend a whole turn getting your guard up.&#10;&#10;THE TRADE: you guarded instead of looking, so this step earns you NO read \u2014 no setup bonus on the action, and you learn nothing about them this turn.">\u{1f6e1} up early \u00b7 no read</span>`
        : "";
      const findsLine = s.finds ? `<span class="sb-skill-does">finds ${esc(s.finds)}</span>` : ""
        + (s.itemNote ? `<span class="sb-skill-does sb-item-note">${esc(s.itemNote)}</span>` : "");
      return `<div class="sb-skill-row${on ? " picked" : ""}" style="border-left:3px solid ${FAMILY_COLOR[f]}">
        <button class="btn secondary sb-skill${on ? " on" : ""}" data-sbskill="${i}" title="${on ? "Deselect" : selFull ? "Two crafts already chosen for this step — deselect one first" : "Choose this for the " + step.label.toLowerCase() + " step"}">${on ? `<span class="sb-pick-n">${pick + 1}</span> ` : ""}${esc(s.name)} <span class="cost">${esc(s.function)} · T${s.tier}${s.energyCost ? ` · ${s.energyCost}e` : ""}</span>${does ? `<span class="sb-skill-does">${esc(does)}</span>` : ""}${findsLine}${oddsTag}${guardTag}${finTag}</button>${info}
      </div>`;
    }).join("");
    // CCODE-38 (Erik: "can we make the categories collapsible?"): each family is a <details> — open by default,
    // and the open/closed choice persists across the round re-renders via sbOpenFams so a fight doesn't keep
    // re-expanding what you just folded away.
    const open = sbOpenFams[f] !== false;
    return `<details class="moves-group" data-sbfam="${esc(f)}"${open ? " open" : ""}><summary class="moves-group-lbl"><span style="color:${FAMILY_COLOR[f]}">${FAMILY_GLYPH[f]}</span> ${esc(SB_FAM_LABEL[f] || f.toLowerCase())} <span class="hint">(${byFam[f].length})</span>${sharedDoes ? `<span class="moves-group-hint"> · ${esc(sharedDoes)}</span>` : ""}</summary>${chips}</details>`;
  }).join("");
  return `<div class="sb-panel">
    ${/* ERIK (2026-08-01, live): "this is a weird result to exit the fight." The round said "neither gains —
          it's even" and the fight ENDED. It was not weird — it was INVISIBLE. Momentum stopped being an exit
          at CCODE-38; what actually ends a fight now is the PRESSURE counter, and `breakAtPressure` is 2, so
          a foe breaks on the SECOND time they are overwhelmed. That counter was never rendered anywhere. The
          player watched the one meter that cannot end the fight and never saw the one that does. */""}
    <div class="sb-opponent">${esc(def.opponent?.name || sbLex().other)}${fog?.label ? ` — <span class="hint">${esc(fog.label)}</span>` : ""}${oppTired ? ` <span class="cost">(${oppTired})</span>` : ""}${(() => {
      const brk = CONTENT.skillBattle?.engine?.momentum?.pressure?.breakAtPressure ?? 2;
      const mine = st.pressure?.player || 0, theirs = st.pressure?.opponent || 0;
      if (!mine && !theirs) return "";
      const pip = (n, max) => "◆".repeat(Math.min(n, max)) + "◇".repeat(Math.max(0, max - n));
      return ` <span class="sb-pressure" title="A fight ends when one side is OVERWHELMED ${brk} times — not when the momentum meter fills (momentum is a roll modifier, CCODE-38). This is the real exit.">`
        + (theirs ? `driven back ${pip(theirs, brk)} ${theirs}/${brk}` : "")
        + (theirs && mine ? " · " : "")
        + (mine ? `you ${pip(mine, brk)} ${mine}/${brk}` : "") + `</span>`;
    })()} <span class="hint">· you ${character.health}/${character.maxHealth} hp · ${character.energy}e</span></div>
    ${(() => {
      // SNG-247 (Erik: "I want to see what options the aggressor has for skills too — fighting an NPC or
      // anything should include that the opponent has skills they can use, just like you do"). They always DID —
      // opponentPolicy picks from this list every round — it was simply never shown, so their moves read as
      // arbitrary. Fog-gated on the same ladder as everything else: what you can see, you see; what you can't is
      // named as hidden rather than faked.
      const sk = st.opponentSheet?.skills || []; if (!sk.length) return "";
      const t = fog?.tier ?? 0;
      const chips = sk.map(s => {
        const showName = t >= 3 && s.name;
        const body = showName ? `${esc(s.name)} <span class="hint">(${esc(s.function)}${s.tier ? ` t${s.tier}` : ""})</span>`
          : t >= 1 ? esc(s.function)
          : "▨";
        const why = t >= 1 ? `They can ${esc(s.function)} — matchup applies when they use it.` : "Unread — you know they have a craft here, not what it is.";
        return `<span class="sb-oppcraft" title="${why}">${body}</span>`;
      }).join("");
      const L = sbLex();
      const note = t >= 3 ? L.fullKit : t >= 1 ? "the verbs you can read — names need tier 3" : L.unreadNote;
      return `<div class="sb-oppcrafts"><span class="sb-fx-lbl">${esc(sbLex().craftsLabel)}</span>${chips}<span class="hint">${esc(note)}</span></div>`;
    })()}
    <div class="sb-fog">${fog ? `
      <div class="sb-fog-line">${esc(fog.revealed.outcome || "They move.")}${fog.revealed.intent ? ` — gathering to <strong>${esc(fog.revealed.intent)}</strong>` : ""}${fog.revealed.band ? ` <span class="hint">(${esc(fog.revealed.band)})</span>` : ""}</div>
      ${fog.revealed.skill ? `<div class="sb-fog-line">${esc(fog.revealed.skill)}${fog.revealed.intensity ? ` · ${esc(fog.revealed.intensity)}` : ""}${fog.revealed.breakdown ? ` <button class="data-link" data-breakdown='${attrJson(fog.revealed.breakdown)}'>see their math</button>` : ""}</div>` : ""}` :
      `<div class="hint">You size each other up. Choose ONE move — or read them first.</div>`}</div>
    ${sbLastRoundReceipt && st.round > 1 ? `<div class="sb-receipt">${esc(sbLastRoundReceipt)}${(() => {
      // CCODE-36 (Erik): the ROLLS behind this round, in the same breakdown popover normal play uses. Your own math
      // is always yours to see; THEIR math stays behind the same fog gate the fog-line uses — reading them buys it.
      const r = sbLastRoundRolls; if (!r) return "";
      const mk = (side, bd, roll, chance, deg) => bd
        ? `<button class="data-link" data-breakdown='${attrJson(bd)}' title="The full math for ${side === "you" ? "your" : "their"} roll this round">⚄ ${side === "you" ? "your" : "their"} roll ${roll}/${chance}${deg ? ` · ${String(deg).replace("_", " ")}` : ""}</button>`
        : "";
      // CCODE-40: when the ceiling bit, say so plainly — the number that DECIDED the exchange is the raw stack,
      // not the 95 you rolled against. Otherwise "95 vs 95" reads as a tie when one side was really far ahead.
      const rawNote = (r.you?.rawChance != null && r.you.rawChance !== r.you.chance)
        ? `<span class="hint sb-raw-note">your stack totalled <strong>${r.you.rawChance}</strong> before the ${r.you.chance}% ceiling — the contest is decided on the full stack, so every bonus and penalty counts</span>` : "";
      const yours = mk("you", r.you?.breakdown, r.you?.roll, r.you?.chance, r.you?.degree) + rawNote;
      // SNG-247 (Erik: "claims you have to read them to see it, but I've already used a read skill and I can't
      // see it"). The old line was a lie of omission: their math needs sense tier 3, and a read buys only
      // +revealActionBuysTier. A character whose base tier is 0 can read every turn and never reach it. The fog
      // must never promise what it cannot deliver — so it now names the tier you are AT, what that bought, and
      // what the next rung would add.
      const theirs = fog?.revealed?.breakdown ? mk("them", r.them?.breakdown, r.them?.roll, r.them?.chance, r.them?.degree)
        : `<span class="hint sb-roll-fog">${esc(fogLadderLine(fog))}</span>`;
      return `<div class="sb-rolls">${yours}${theirs}</div>`;
    })()}</div>` : ""}
    ${(() => { // CCODE-35: what's STANDING right now — a raised guard, an insight, a bind laid on them. Each
      // chip carries the exact signed value + rounds left, because that number is really in the next roll.
      const fx = st.effects || []; if (!fx.length) return "";
      const chip = f => `<span class="sb-fx sb-fx-${f.value >= 0 ? "boon" : "bane"}" title="${esc(f.label)} — ${f.value >= 0 ? "+" : ""}${f.value} to ${f.side === "player" ? "your" : "their"} roll ${f.applies === "whenAttacked" ? "when they attack" : f.applies === "whenAttacking" ? "when you strike" : "every round"}, ${f.roundsLeft} more round${f.roundsLeft === 1 ? "" : "s"} (from ${esc(f.source)})">${esc(f.label)} ${f.value >= 0 ? "+" : ""}${f.value} · ${f.roundsLeft}r</span>`;
      const mine = fx.filter(f => f.side === "player"), theirs = fx.filter(f => f.side === "opponent");
      return `<div class="sb-fx-row">${mine.length ? `<span class="sb-fx-lbl">on you</span>${mine.map(chip).join("")}` : ""}${theirs.length ? `<span class="sb-fx-lbl">on them</span>${theirs.map(chip).join("")}` : ""}</div>`;
    })()}
    ${st.log?.length ? `<details class="sb-log"><summary>Round log (${st.round - 1})</summary>${st.log.map(l => `<div class="hint">${esc(l)}</div>`).join("")}</details>` : ""}
    ${/* SNG-252b §2c: TURN DETAIL, tucked. Intensity and the Sense→Action→Bonus→Execute chain are ADVANCED
          controls — precise, rarely changed, and they were sitting at the same visual weight as the scene,
          competing with it. Behind a <details> they stay one tap away and stop shouting. Default closed;
          `sbDetailOpen` remembers the choice across the round re-renders, the same way sbOpenFams does, so a
          player who wants them open is not re-collapsing them every beat. */""}
    <details class="sb-detail"${sbDetailOpen ? " open" : ""}><summary class="sb-detail-sum">${esc(CONTENT.ribbonCopy?.turnDetail?.label || "⚙ turn detail")}<span class="hint"> — ${esc(CONTENT.ribbonCopy?.turnDetail?.hint || "intensity + the action chain")}</span></summary>
      <div class="sb-intensity">Intensity: ${["conserve", "standard", "surge"].map(i => `<button class="opt sb-int ${sbIntensity === i ? "on" : ""}" data-sbint="${i}">${i}</button>`).join("")}</div>
      ${sbStepTracker(turn)}
    </details>
    ${st.spent?.player ? `<div class="sb-spent-bar">🕯 <strong>You are spent</strong> — your crafts will not answer until you find energy. <span class="hint">Steel and wit still work (a plain strike, a raised guard). This is the moment to <strong>Yield</strong> by choice, or use something that restores you — the fight no longer ends itself here.</span></div>` : ""}
    ${st.spent?.opponent ? `<div class="sb-spent-bar dim">🕯 <strong>${esc(def.opponent?.name || "They")} are spent</strong> — swinging on will alone. <span class="hint">Their crafts are done; press it.</span></div>` : ""}
    ${busySB ? `<div class="sb-waiting"><span class="sb-spinner"></span> ${esc(sbBusyLabel || "resolving…")}</div>` : ""}
    ${sbQuickBeat && !busySB ? `<div class="sb-quick">${esc(sbQuickBeat)}</div>` : ""}
    ${turn.senseBlinded ? `<div class="sb-spent-bar">◉ <strong>Blinded</strong> — your senses are shut this turn. <span class="hint">You go straight to your action; the read is denied you.</span></div>` : ""}
    ${turn.phase === "review" ? sbReviewCard(turn, skills) : `
      <div class="sb-step-hint hint">${esc(sbStepHint(step))}${selCount === 2 ? ` <strong class="sb-braid-note">⋈ braided — both crafts, both effects, both costs.</strong>` : selCount === 1 ? ` <span class="hint">Pick a second craft to BRAID them.</span>` : ""}</div>
      <div class="sb-skills">${groups}</div>
      <input id="sb-step-text" class="sb-step-text" placeholder="Shape this ${esc(step.label.toLowerCase())} in your own words (optional)…" value="${esc(turn.text[turn.phase] || "")}">
    `}
    <div class="sb-actions" style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap">
      ${turn.phase === "sense" ? `<button class="btn" id="sb-proceed" ${busySB ? "disabled" : ""}>${selCount ? "Sense → then Action" : "Skip sense → Action"}</button>` : ""}
      ${turn.phase === "action" ? `<button class="btn" id="sb-proceed" ${selCount ? "" : "disabled"} title="${selCount ? "" : "Choose your action first"}">${turn.bonusEarned ? "Proceed to Bonus →" : "Review the turn →"}</button>` : ""}
      ${turn.phase === "bonus" ? `<button class="btn" id="sb-proceed">Review the turn →</button>` : ""}
      ${turn.phase === "review" ? `<button class="btn" id="sb-execute" ${busySB ? "disabled" : ""}>⚔ Execute the turn</button><button class="btn secondary" id="sb-edit">Edit</button>` : ""}
      <button class="btn secondary" id="sb-flee">Break away</button>
      <button class="btn secondary" id="sb-yield">Yield</button>
    </div>
  </div>`;
}

// SNG-246 (Erik): the intent-family a battle skill belongs to (for the grouped panel). The steel-and-wit
// fallbacks are HARM (a strike) / PROTECT (a guard); an ability's own function-family otherwise.
function sbFamilyOf(s) {
  if (s.id === "_strike") return "HARM";
  if (s.id === "_guard") return "PROTECT";
  const ab = fullCatalog()[s.id];
  return (ab ? familiesOfAbility(ab, FN_INDEX)[0] : null) || FN_INDEX?.verbToFamily?.[s.function] || "SHAPE";
}
// Combat-intent labels for the families (Erik's "read/sense, hinder, harm, position…"); falls back to the family name.
const SB_FAM_LABEL = { KNOW: "read / sense", HARM: "harm", INFLUENCE: "hinder / sway", MOVE: "position", PROTECT: "guard", RESTORE: "mend", SHAPE: "shape", SUSTAIN: "sustain" };

// CCODE-34 (Erik: "if I use The Better Story, am I trying to heal myself or the enemy??"): a one-line WHAT-THIS-DOES
// per move, keyed by function — the load-bearing part is naming the TARGET (you vs them), which the craft's own name
// never tells you. Derived, so it covers every craft including the steel-and-wit fallbacks; the ⓘ beside each move
// opens the full craft detail (the same shared popover used everywhere else).
const SB_DOES = {
  strike: "harms THEM", break: "shatters THEIR guard — harm through defence",
  hinder: "hampers THEM — costs them the exchange, not blood", bind: "pins THEM — takes their footing",
  command: "bends THEM — makes them answer you instead of acting",
  shield: "guards YOU — blunts what they send", ward: "wards YOU — turns a specific harm aside",
  resist: "braces YOU — you weather it instead of trading",
  conceal: "hides YOU — they swing at where you were", deceive: "misdirects THEM — you slip the exchange entirely",
  reveal: "reads THEM — sharpens the fog and sets up your next move", foresee: "reads THEIR next beat before it lands",
  track: "follows THEM — they can't break your line",
  heal: "mends YOU — not them", mend: "mends YOU — not them", restore: "restores YOU — recovers what the fight took",
  empower: "strengthens YOU for the beats after this one", sustain: "holds YOU — pays the attrition war down",
  move: "repositions YOU", travel: "moves YOU — ground, not blood", open: "opens a way — an exit or an angle",
  make: "shapes the ground between you", transform: "reshapes the terms of the fight", summon: "calls something in on your side"
};

/** SNG-246 BUG1: wire the skill-battle panel's controls (renderPlay calls this after chrome() when in a skill
 *  battle). Same handlers the old separate screen had — sbDeclare drives every round; NEVER duelRound. */
function wireSkillBattlePanel() {
  const enc = activeEnc();
  if (!enc || enc.state?.mode !== "skill_battle") return;
  const sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const turn = sbTurn();
  for (const b of app.querySelectorAll("[data-sbint]")) b.onclick = () => { sbIntensity = b.dataset.sbint; renderSkillBattle(sbLastRound); };
  // CCODE-45: a craft click SELECTS for this step (max 2 — the second braids). Nothing fires until you proceed.
  // CCODE-47: while a call is in flight nothing is clickable — a second click must not double-resolve a turn.
  if (sbBusy) { for (const b of app.querySelectorAll("[data-sbskill], #sb-proceed, #sb-execute, #sb-edit")) b.disabled = true; return; }
  for (const b of app.querySelectorAll("[data-sbskill]")) b.onclick = () => {
    const i = Number(b.dataset.sbskill), cur = turn.sel[turn.phase] || (turn.sel[turn.phase] = []);
    const at = cur.indexOf(i);
    if (at >= 0) cur.splice(at, 1);
    else if (cur.length < 2) cur.push(i);
    else return; // two already chosen — deselect one first
    saveCharacter(character); renderSkillBattle(sbLastRound);
  };
  // remember per-step shaping text as it is typed (it rides into that step's GM narration)
  const ti = document.getElementById("sb-step-text");
  // clamp at a word boundary — it is the player's own prose, so never cut them mid-word
  if (ti) ti.oninput = () => { turn.text[turn.phase] = smartClamp(ti.value, 300); };
  for (const d of app.querySelectorAll("[data-sbfam]")) d.ontoggle = () => { sbOpenFams[d.dataset.sbfam] = d.open; };
  // SNG-252b §2c: remember the turn-detail tuck across round re-renders, same as the family groups above —
  // a player who opens it should not have to re-open it every beat.
  for (const d of app.querySelectorAll("details.sb-detail")) d.ontoggle = () => { sbDetailOpen = d.open; };
  const proceed = document.getElementById("sb-proceed");
  if (proceed) proceed.onclick = () => {
    if (ti) turn.text[turn.phase] = smartClamp(ti.value, 300); // clamp at a word boundary — it is the player's own prose
    if (turn.phase === "sense") { sbResolveSense(); return; }
    if (turn.phase === "action") { turn.phase = turn.bonusEarned ? "bonus" : "review"; }
    else if (turn.phase === "bonus") { turn.phase = "review"; }
    saveCharacter(character); renderSkillBattle(sbLastRound);
  };
  const exec = document.getElementById("sb-execute"); if (exec) exec.onclick = () => sbExecuteTurn();
  // Edit goes back to ACTION — never to sense, which the GM has already narrated ("you can't edit back to it").
  const ed = document.getElementById("sb-edit"); if (ed) ed.onclick = () => { turn.phase = "action"; saveCharacter(character); renderSkillBattle(sbLastRound); };
  const fl = document.getElementById("sb-flee"); if (fl) fl.onclick = () => beginChaseFromFight(activeEnc()?.def); // SNG-230 §6a: FLEE a fight → a real CHASE
  const yl = document.getElementById("sb-yield"); if (yl) yl.onclick = () => sbEnd(skillBattleRound(enc.state, enc.def, {}, { character, rules: CONTENT.rules, sb, steps, yield: true }));
}

/** CCODE-45 · GM CALL #1 — resolve the SENSE step, then narrate what you sensed and what they did. Skipping the
 *  sense costs nothing and skips the call. Either way the step then LOCKS and we move to the action. */
async function sbResolveSense() {
  const enc = activeEnc(); if (!enc || sbBusy) return;
  const turn = sbTurn(), sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const skills = window._sbSkills || playerBattleSkills();
  const decl = sbDeclFromSel(turn.sel.sense, skills, sbIntensity);
  turn.senseDone = true;
  if (!decl) { turn.phase = "action"; saveCharacter(character); renderSkillBattle(sbLastRound); return; }
  sbBusy = true; sbBusyLabel = `Reading ${enc.def?.opponent?.name || "them"}…`; sbQuickBeat = ""; renderSkillBattle(sbLastRound);
  const rr = skillBattleRound(character.activeEncounter.state, enc.def, decl, { character, rules: CONTENT.rules, sb, steps,
    seenTendency: sbLastPlayerFn, rng: Math.random, phase: "sense", tickEffects: false });
  character.energy = Math.max(0, character.energy + (rr.deltas?.energy || 0));
  // activeEnc() hands back a FRESH wrapper each call, so `enc.state = ...` writes to a throwaway — the resolved
  // state (effects, energy, pressure) would be silently discarded. Write through to the character, as sbDeclare does.
  character.activeEncounter = { defId: enc.def.id, state: rr.state };
  const t = sbTurn();
  t.senseDone = true; t.setupBonus = rr.setupBonus || 0; t.bonusEarned = !!rr.bonusEarned?.player;
  t.sel = turn.sel; t.text = turn.text;
  t.readPayoff = sbReadPayoff(rr.player?.degree, character.activeEncounter.state.opponentSheet, character.activeEncounter.state, enc.def);
  t.senseLine = `You read with ${decl.name}${decl.woven ? ` \u22c8 ${decl.woven.name}` : ""} \u2014 ${(rr.player?.degree || "").replace("_", " ")}. ${t.setupBonus > 0 ? `You have the read (+${t.setupBonus} to your action).` : t.setupBonus < 0 ? `They read you better (${t.setupBonus} to your action).` : "Neither of you learns much."}${t.bonusEarned ? " The opening is there \u2014 you have earned a BONUS action." : ""} ${t.readPayoff}`;
  t.phase = "action";
  sbLastRoundRolls = { you: rr.player || null, them: rr.opponent || null };
  sbLastRound = { opponent: rr.opponent, _scout: true };
  // persist what the read bought, so the fog — and every move's PRICE — survives the re-render
  character.activeEncounter.state.lastOppReceipt = rr.opponent || null;
  character.activeEncounter.state.lastReadWasSense = true;
  // CCODE-51 (Erik's ladder): what the READ EARNED — fail 0, partial 1, success 2, crit/decisive 3. Persisted so
  // the fog reads the ROLL, not a standing stat, and so a botched read genuinely leaves you blinder this turn.
  character.activeEncounter.state.senseTierEarned = rr.senseTier ?? null;
  character.activeEncounter.state.senseResist = rr.senseResist || null;
  sbLogRound(enc, decl, rr, character.activeEncounter.state.momentum ?? 0, true, t.senseLine);   // SNG-271: the READ's own prose, not the last strike's
  saveCharacter(character);
  // GM call #1 — the sense beat. Needs a key; without one the mechanical line above still tells the story.
  const nm = enc.def?.opponent?.name || "your opponent";
  const shaped = turn.text.sense ? ` The player describes it: "${turn.text.sense}"` : "";
  try {
    const result = await runGM({ resolution: null, playerInput: `(SENSE STEP of a fight turn against ${nm}. Mechanically: ${t.senseLine}${shaped} Narrate ONLY this beat — what the character perceives, and what ${nm} is doing as they read them. Two or three sentences. Do NOT resolve the fight or narrate an attack; the player has not acted yet.)` });
    if (result) renderPlay(result.turn, { aside: t.senseLine });
    else renderPlay(character.activeScene?.lastTurn || null, { aside: t.senseLine });
  } catch { renderPlay(character.activeScene?.lastTurn || null, { aside: t.senseLine }); }
  finally { sbBusy = false; sbBusyLabel = ""; renderSkillBattle(sbLastRound); }
}

/** CCODE-45 · GM CALL #2 — resolve the ACTION (and the BONUS if earned), then narrate the WHOLE turn. */
async function sbExecuteTurn() {
  const enc = activeEnc(); if (!enc || sbBusy) return;
  const turn = sbTurn(), sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const skills = window._sbSkills || playerBattleSkills();
  const aDecl = sbDeclFromSel(turn.sel.action, skills, sbIntensity);
  if (!aDecl) { turn.phase = "action"; saveCharacter(character); renderSkillBattle(sbLastRound); return; }
  const bDecl = turn.bonusEarned ? sbDeclFromSel(turn.sel.bonus, skills, sbIntensity) : null;
  sbBusy = true; sbBusyLabel = "Resolving the turn…"; sbQuickBeat = ""; renderSkillBattle(sbLastRound);
  const beats = [];
  if (turn.senseLine) beats.push(turn.senseLine);
  // ACTION — ticks the turn's effects only if there is no bonus step after it.
  let rr = skillBattleRound(character.activeEncounter.state, enc.def, aDecl, { character, rules: CONTENT.rules, sb, steps,
    seenTendency: sbLastPlayerFn, rng: Math.random, phase: "action", tickEffects: !bDecl, setupBonus: turn.setupBonus || 0 });
  sbLastPlayerFn = aDecl.function;
  const applyRR = (r, d, label) => {
    // ERIK (2026-08-01, from the Machine log): EVERY round reported "neither gains — it's even", including a
    // roll of 1/95 (margin 102) against a margin of 25. The receipt was being handed the round's AFTER momentum
    // as its BEFORE — `sbRoundReceipt(r, d, (r.state?.momentum ?? 0) - 0, …)`, that stray `- 0` a leftover from
    // an edit — so `swing = after - before` was ALWAYS 0 and the line read "even" and "4→4" no matter what
    // happened. The receipt has been lying about every round in every fight.
    //
    // The same value has to be captured HERE, before the line below overwrites activeEncounter with the new
    // state: applyRR runs once per STEP (action, then bonus), so `enc.state` is the pre-TURN momentum and is
    // already stale for the bonus step — which is why the log showed the bonus starting from 0 when the action
    // had already moved the meter to 3.5. The mechanics chained correctly throughout; only the reporting lied.
    const beforeMom = character.activeEncounter?.state?.momentum ?? enc.state?.momentum ?? 0;
    character.health = Math.max(0, Math.min(character.maxHealth, character.health + (r.deltas?.health || 0)));
    character.energy = Math.max(0, character.energy + (r.deltas?.energy || 0));
    character.activeEncounter = { defId: enc.def.id, state: r.state }; // write THROUGH the activeEnc() wrapper
    const ids = [d.id, d.woven?.id].filter(x => x && !String(x).startsWith("_"));
    if (ids.length) { recordUse(character, ids, { day: absoluteWorldDay() }); pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex })); }
    // CCODE-43: an ITEM move is SPENT here — drinking restores, throwing is gone. The item leaves the pack either
    // way; a consumable that survives its own use would make inventory decorative again.
    if (d.itemMove) {
      const it = d.itemMove.item, nm = it.customName || it.name;
      if (d.itemMove.mode === "drink") {
        const g = d.itemMove.restores || {};
        // cap at maxEnergy — a drink tops you up, it never overfills you past your own pool
        if (g.energy) character.energy = Math.max(0, Math.min(character.maxEnergy ?? 100, character.energy + g.energy));
        if (g.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + g.health));
        beats.push(`You drank ${nm} — ${[g.energy ? `+${g.energy} energy` : "", g.health ? `+${g.health} hp` : ""].filter(Boolean).join(", ")}.`);
      } else {
        beats.push(`You threw ${nm} at them.`);
      }
      try { consumeItem(character, it.customName || it.name); } catch { removeItem(character, it.name, 1); }
    }
    sbLastRoundRolls = { you: r.player || null, them: r.opponent || null };
    sbLastRound = { opponent: r.opponent };
    character.activeEncounter.state.lastOppReceipt = r.opponent || null;
    character.activeEncounter.state.lastReadWasSense = false;
    character.activeEncounter.state.senseTierEarned = null;   // CCODE-51: a read is SPENT when the turn resolves
    // All three reporters get the SAME true before-value, so the receipt, the machine log and the transcript
    // beat can never disagree about what a round did. `label` ("Action" / "Bonus action") is already on the
    // beat — with a real swing behind it, the two steps are now separately legible, which is the other half of
    // Erik's "the main action and the bonus action… i'm never sure they are both narrated".
    sbLastRoundReceipt = sbRoundReceipt(r, d, beforeMom, false);
    sbLogRound(enc, d, r, beforeMom, false);
    beats.push(`${label}: ${sbFightBeat(r, d, beforeMom, false)}`);
  };
  applyRR(rr, aDecl, "Action");
  saveCharacter(character);
  let ended = rr.ended, endRR = rr;
  // SNG-271 (Erik's own fight log) — A DOWNED PLAYER STILL TOOK THEIR BONUS ACTION.
  //
  // `ended` is the ENCOUNTER's end-flag (opponent down / yield / flee). It says nothing about whether YOU are
  // still standing, and `checkIncapacitation` ran only AFTER both resolutions — so a player dropped by the
  // action swung again from the floor. Erik's log shows both at one timestamp, the second landing hp -20.
  //
  // The fix is the pattern already in this file at the single-round path: check the moment the action lands,
  // not at the end of the turn. A turn is not an atomic unit when one of its halves can end you.
  if (!ended && checkIncapacitation(character)) {
    character.activeEncounter.state.turn = sbFreshTurn();
    saveCharacter(character);
    sbBusy = false; sbEnd({ ...rr, ended: true, outcome: "incapacitated" }); return;
  }
  // BONUS — a FULL action; it ticks the turn's effects, being the last step.
  if (!ended && bDecl) {
    const br = skillBattleRound(character.activeEncounter.state, enc.def, bDecl, { character, rules: CONTENT.rules, sb, steps,
      seenTendency: sbLastPlayerFn, rng: Math.random, phase: "bonus", tickEffects: true });
    applyRR(br, bDecl, "Bonus action");
    saveCharacter(character);
    ended = br.ended; endRR = br;
  }
  character.activeEncounter.state.turn = sbFreshTurn(); // the next turn starts clean
  saveCharacter(character);
  if (checkIncapacitation(character)) { sbBusy = false; sbEnd({ ...endRR, ended: true, outcome: "incapacitated" }); return; }
  if (ended) { sbBusy = false; sbEnd(endRR); return; }
  const nm = enc.def?.opponent?.name || "your opponent";
  // CCODE-47 (Erik): "you could have haiku do a short narration of the different skills each is using to describe
  // the turn - and indicate the narration is processing - then show the big narrative result." So a FAST Haiku beat
  // lands first — the clash of techniques, nothing more — while the panel keeps saying the full telling is coming.
  // It is a GRACE, never a gate: a failure here leaves the turn and the full narration untouched.
  sbBusyLabel = "Telling the turn…";
  renderSkillBattle(sbLastRound);
  try {
    const quick = await callClaude([{ role: "user", content:
      `In 2 short sentences, present tense, describe ONLY the clash of techniques in this exchange — name what each side DID. No outcome, no aftermath, no dialogue.\n${beats.map(b => `- ${b}`).join("\n")}\nThe opponent is ${nm}.` }],
      { task: "combat-quick-beat", maxTokens: 160 });
    if (quick) { sbQuickBeat = String(quick).trim(); renderPlay(character.activeScene?.lastTurn || null, { aside: sbQuickBeat }); }
  } catch { /* a grace, never a gate */ }
  // GM call #2 — the WHOLE turn, in order.
  const shaped = ["sense", "action", "bonus"].filter(k => turn.text[k]).map(k => `${k}: "${turn.text[k]}"`).join("; ");
  try {
    const result = await runGM({ resolution: null, playerInput: `(A full fight TURN against ${nm} has resolved. The engine already decided everything below \u2014 it is what HAPPENED and is not negotiable:\n${beats.map(b => `- ${b}`).join("\n")}\n${shaped ? `The player shaped it: ${shaped}\n` : ""}Narrate this ONE turn as a single continuous beat \u2014 the read, then the blow${bDecl ? ", then the opening they took" : ""}, and what ${nm} did through all of it. End with where the two of you now stand, because that sets up the next turn.)` });
    if (result) renderPlay(result.turn, { aside: sbLastRoundReceipt });
    else renderPlay(character.activeScene?.lastTurn || null, { aside: sbLastRoundReceipt });
  } catch { renderPlay(character.activeScene?.lastTurn || null, { aside: sbLastRoundReceipt }); }
  finally { sbBusy = false; sbBusyLabel = ""; sbQuickBeat = ""; renderSkillBattle(sbLastRound); }
}

/** SNG-246 BUG1: renderSkillBattle is now a THIN ALIAS — there is no separate skill-battle screen. It carries the
 *  round's fog forward (sbLastRound) and renders the PLAY surface, which draws skillBattlePanel() in place. Every
 *  legacy call site (dev/reload/engage/chase-refight) + sbDeclare's re-render now land on the one takeover. */
function renderSkillBattle(lastRound = null) {
  sbLastRound = lastRound;
  renderPlay(character.activeScene?.lastTurn || null, {});
}

/** Resolve one declared round: apply the player's health/energy attrition, advance the state, and either
 *  re-render the panel (fog view of what just happened) or end the contest. */
function sbDeclare(skill, { intensity = "standard", scouting = false, finisher = false, woven = null } = {}) {
  const enc = activeEnc(); if (!enc) return;
  const beforeMom = enc.state?.momentum ?? 0; // SNG-246: for the per-round receipt (the swing this round)
  const sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const decl = { function: skill.function, tier: skill.tier || 1, attribute: skill.attribute || "practical", intensity, name: skill.name };
  // CCODE-37: a WOVEN second craft rides on the declaration — the engine adds its named roll line, lands its
  // effect, and charges for both. The lead craft's function still drives the matchup.
  if (woven) decl.woven = { function: woven.function, tier: woven.tier || 1, name: woven.name, id: woven.id };
  let rr = skillBattleRound(enc.state, enc.def, decl, { character, rules: CONTENT.rules, sb, steps, seenTendency: sbLastPlayerFn, rng: Math.random });
  // SNG-230 §6b (Erik: a good roll can end a fight too, easier vs weaker foes): a decisive HARM FINISHER can
  // COLLAPSE the skill-battle EARLY — the round's momentum SWING is mapped to a degree and checked against the
  // foe's collapse floor. A strong swing on the right craft ends it; a lesser swing runs the meter unchanged
  // (§89 — the ordinary rounds are untouched; this only adds an early-finish on a decisive blow, and the great
  // ones (epic/regional) have no floor, so they never collapse). Skipped while scouting (a read isn't a strike).
  // SNG-246 (Erik: "chose hunter's strike and the fight ended — so frustrating"): the one-beat collapse now fires
  // ONLY on the DELIBERATE "⚡ Finish it" (finisher), never a normal strike — so ordinary combat is turn-by-turn.
  if (!rr.ended && !scouting && finisher && frameCollapsible(enc.def)) {
    const fam = FN_INDEX?.verbToFamily?.[skill.function] || null;
    const swing = (rr.state?.momentum ?? 0) - (enc.state?.momentum ?? 0);
    const meterMax = sb.momentum?.meterMax ?? 10;
    // §7b: a WARD denying "finish" forbids the early end unless a demolishing swing breaks it (Aevi content).
    const frameContent = CONTENT.encounterFrameContent || {};
    const ward = wardAgainst(enc.def, "finish", frameContent.wardDenials);
    const wardHolds = ward.denied && !wardBroken(swingDegree(swing, meterMax), swing, ward.breakDC);
    if (!wardHolds && collapseMode([fam], "fight") === "finish" && swing > 0 && collapseResult(swingDegree(swing, meterMax), { floor: collapseFloor(enc.def, frameContent.collapseEligibility) }) === "collapse") {
      rr = { ...rr, ended: true, outcome: "opponent_fell", state: { ...rr.state, status: "ended" }, _collapse: true };
    }
  }
  if (!scouting) sbLastPlayerFn = skill.function; // reading doesn't show them a real tendency
  // CCODE-37 — THE GAP: a skill-battle round never recorded PRACTICE. recordUse (the single counting site) was
  // called only from the classic-choice path and the gambit runner, so every craft used in a fight counted for
  // NOTHING: no rank progress, no co-activations, no braid progress. Combat — where you lean on your crafts most —
  // was invisible to the ledger, which is the real reason braids never showed up there. A woven round records
  // BOTH ids, so the pair's co-activation climbs toward BRAID_RIPEN_AT and the pairing can be earned as a braid.
  const usedIds = [skill.id, woven?.id].filter(id => id && !String(id).startsWith("_")); // _strike/_guard aren't real crafts
  if (usedIds.length) {
    recordUse(character, usedIds, { day: absoluteWorldDay() });
    pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex }));
  }
  sbLastRoundReceipt = sbRoundReceipt(rr, decl, beforeMom, scouting); // SNG-246: SHOW what happened this round
  // CCODE-36 (Erik: "let the player see the rolls and modifiers… a popup off of the action you chose"): keep BOTH
  // sides' full breakdowns from this round so the receipt can open the same math popover normal play uses.
  sbLastRoundRolls = { you: rr.player || null, them: rr.opponent || null };
  sbLogRound(enc, decl, rr, beforeMom, scouting); // SNG-246 (Erik): mirror round telemetry to the machine tab
  // CCODE-36 (Erik: "it didn't narrate the whole fight, just the last move — if the engine is fast and lite then
  // we need the entire narration at the end"): accumulate a round-by-round record ON THE ENCOUNTER STATE so sbEnd
  // can hand the GM the WHOLE fight to narrate, not just the final exchange. Capped so a long fight stays bounded.
  rr.state.transcript = [...(enc.state.transcript || []), sbFightBeat(rr, decl, beforeMom, scouting)].slice(-24);
  character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas?.health || 0)));
  character.energy = Math.max(0, character.energy + (rr.deltas?.energy || 0));
  character.activeEncounter = { defId: enc.def.id, state: rr.state };
  saveCharacter(character);
  if (checkIncapacitation(character)) { sbEnd({ ...rr, ended: true, outcome: "incapacitated" }); return; }
  if (rr.ended) { sbEnd(rr); return; }
  renderSkillBattle({ opponent: rr.opponent, _scout: scouting });
}

/** The contest ends: clear it, then hand the outcome to the GM to narrate the aftermath and return to the scene. */
async function sbEnd(rr) {
  const enc = activeEnc(); const def = enc?.def;
  // SNG-247 Tier 2b: FRAMES CHAIN, and now they chain through the contest engine. A chained CHASE that is LOST
  // means you were run down — that is not an ending, it is the fight resuming (FRAME_TRANSITIONS chase.fail =
  // fight). Intercepted before the encounter is cleared, so the drop-back still has its def to read.
  if (encounterKind(def) === "chase" && def?._chainedFrom?.kind === "fight"
      && ["player_overcome", "incapacitated"].includes(rr.outcome)) {
    await beginFightFromChase(def); return;
  }
  character.activeEncounter = null; saveCharacter(character);
  sbLastPlayerFn = null; sbIntensity = "standard"; sbWeaveArmed = null; sbLastRound = null; // CCODE-46: never leak a read into the next fight // CCODE-37: never carry a weave into the next fight
  const nm = def?.opponent?.name || "your opponent";
  // SNG-138: a resolved PRESTIGE-CHALLENGE duel feeds renown — band-scaled (beating a renowned duelist
  // counts more than a road-hopeful); a loss costs the name modestly; a clean break is neutral.
  if (def?._challengeBand) {
    const won = rr.outcome === "opponent_fell" || rr.outcome === "opponent_yielded";
    const lost = rr.outcome === "player_overcome" || rr.outcome === "yielded" || rr.outcome === "incapacitated";
    const w = won ? challengeDeedWeight(def._challengeBand) : lost ? challengeLossWeight(def._challengeBand) : 0;
    if (w !== 0) {
      recordDeed(character, { description: `${won ? "bested" : "lost to"} ${nm} — a ${def._challengeBand} duel`, weight: w, communityId: hereNow()?.communityId, tags: ["duel", "prestige"] }, aptitudeMods(character, CONTENT.rules.playerAptitudes));
      saveCharacter(character);
    }
  }
  // ERIK: an ending must say WHY. "…yields to you" landing straight after "neither gains — it's even" reads as
  // a non-sequitur, because the CAUSE (they were overwhelmed for the last time their nerve could take) was
  // never stated. Health-zero and pressure-break are two different endings and had one sentence between them.
  const brkAt = CONTENT.skillBattle?.engine?.momentum?.pressure?.breakAtPressure ?? 2;
  // `rr` is the ROUND RESULT — its pressure is the post-round value that actually resolved the fight. Reading
  // enc.state here would read the PRE-round state and miss the very tick that ended it.
  const brokeOnPressure = (rr?.pressure?.opponent || 0) >= brkAt;
  const why = brokeOnPressure ? ` They have been driven back ${brkAt} times and will not come again.` : "";
  const outLine = {
    opponent_fell: `You have beaten ${nm} — they go down.`,
    opponent_yielded: `${nm} yields to you.${why}`,
    yielded: `You yield the contest to ${nm}.`,
    fled: `You break away from the fight.`,
    player_overcome: `${nm} overcomes you.`,
    stalemate: `Neither of you can finish it — you both break, spent.`,
    incapacitated: `You fall, overcome.`
  }[rr.outcome] || "The contest ends.";
  // SNG-246 (Erik: "ended inexplicably"): surface WHY. The deciding round's receipt + the reason the meter tipped,
  // shown as a persistent aside AND fed to the GM so the aftermath prose describes the real finishing exchange
  // (not a generic "the fight ends"). Cleared so it can't leak into the next fight.
  const decidingLine = sbLastRoundReceipt || "";
  const eventLine = (rr.events || []).slice(-1)[0] || "";
  const reason = [decidingLine, `${outLine}`].filter(Boolean).join("  ·  ");
  // CCODE-36 (Erik: "it didn't narrate the whole fight, just the last move — if we make the engine fast and lite
  // like it is now, then we need the entire narration at the end"): the rounds resolved silently and mechanically,
  // so the ONE narration owes the player the WHOLE fight. Hand the GM the round-by-round record and ask for a
  // continuous blow-by-blow, not an aftermath beat.
  const transcript = (enc?.state?.transcript || []).slice();
  sbLastRoundReceipt = null; sbLastRoundRolls = null;
  renderPlay(null, { thinking: transcript.length > 1 ? "Telling the whole fight…" : "…" });
  // SNG-230 §6b: a collapse is a DECISIVE one-beat finish, not a worn-down win — narrate it as such.
  const finisherNote = rr._collapse ? " This was a single decisive finishing stroke — end it fast and hard, not as a drawn-out win." : "";
  const mechForGM = decidingLine ? ` The deciding exchange, mechanically: ${decidingLine}. ${eventLine}` : "";
  const fightStory = transcript.length > 1
    ? `\n\nTHE FIGHT, ROUND BY ROUND (the engine already resolved every exchange — this is what HAPPENED, and it is not negotiable):\n${transcript.map(t => `- ${t}`).join("\n")}\n\nNarrate the WHOLE fight as one continuous scene, start to finish — every round above in order, each exchange given its own physical beat, the momentum swinging as the record says it swung, ending in the outcome below. The player watched this resolve as bare numbers; the prose is where they finally SEE it. Do not summarize it as "you fought and won" and do not narrate only the last exchange.`
    : "";
  const ask = transcript.length > 1
    ? `(The skill-battle with ${nm} is over — outcome: ${rr.outcome}. ${outLine}${finisherNote}${fightStory}\n\nEnd by returning to the scene.)`
    : `(The skill-battle with ${nm} has resolved — outcome: ${rr.outcome}. ${outLine}${mechForGM}${finisherNote} Narrate the aftermath in one beat, describing how that final exchange landed, and return to the scene.)`;
  const result = await runGM({ resolution: null, playerInput: ask });
  if (result) renderPlay(result.turn, { aside: reason }); // keep the mechanical WHY visible alongside the GM's prose
  else renderPlay(character.activeScene?.lastTurn || null, { aside: reason });
}

/** SNG-247 Tier 3: THE ONE PLACE that decides whether an encounter runs on the contest engine, and with what other
 *  side. A duel gets the opponent's sheet; a PUZZLE gets a STATIC sheet — a thing that resists at one number and
 *  never chooses. Centralised because the `isSB` derivation had been hand-copied at four call sites already, and a
 *  fifth divergence is how a kind ends up half-promoted (engine here, classic path there). Returns null when the
 *  encounter stays on its classic path, which is also the safe answer for anything unrecognised. */
function contestSheetFor(def) {
  const eng = CONTENT.skillBattle?.engine;
  if (!eng || !def || def.skillBattle === false) return null;
  if (def.type === "duel") return synthesizeOpponentSheet(withKind(def.opponent, def), eng);
  if (def.type === "puzzle" && eng.kinds?.puzzle) {
    return synthesizeStaticSheet({ resist: def.resist ?? def.difficulty, tier: def.holdTier,   // CCODE-53: the NUMERIC craft tier, not the bestiary word
      holdName: def.holdName || "it holds", give: def.give }, eng);
  }
  return null;
}

/** SNG-230 §6a (behavior): FLEE a fight → you enter a CHASE, not a teleport. Build the chase from the fight
 *  (chaseFromFight), keep the fight def around so a caught chase can drop back into it, start the chase, and hand
 *  the SHIFT to the GM to narrate — then the chase frame renders (renderPlay shows it; the freefield + exits
 *  drive it). Robust: a GM hiccup still leaves the character in the chase, never wedged. */
async function beginChaseFromFight(fightDef) {
  if (!fightDef) return;
  const chase = chaseFromFight(fightDef);
  const nm = fightDef.opponent?.name || "your foe";
  character.customEncounters = character.customEncounters || {};
  character.customEncounters[chase.id] = chase;
  if (fightDef.id && !character.customEncounters[fightDef.id] && !CONTENT.encounters?.[fightDef.id]) character.customEncounters[fightDef.id] = fightDef; // keep the fight to fall back into
  // SNG-247 Tier 2b: the chase runs on the CONTEST engine, so it needs the pursuer's sheet the same way a fight
  // does. Without this it would start with no sheet and fall back to the classic single-margin path — the chase
  // would look like a chase and play like the old one-roll ladder.
  const chaseSheet = CONTENT.skillBattle?.engine ? synthesizeOpponentSheet(withKind(chase.opponent, chase), CONTENT.skillBattle.engine) : null;
  // SNG-247 Tier 4: stamp WHERE THIS CAME FROM so the frame can say the fight became a chase, rather than the
  // player noticing only that the border went red -> amber and the rules quietly changed under them.
  character.activeEncounter = { defId: chase.id, state: { ...startEncounter(chase, { oppSheet: chaseSheet }),
    _morphedFrom: { kind: "fight", note: `you broke from ${nm} — now it is ground, not blades` } } };
  sbLastPlayerFn = null; sbIntensity = "standard";
  saveCharacter(character);
  renderPlay(null, { thinking: "You break and run…" });
  try {
    const result = await runGM({ resolution: null, playerInput: `(The character breaks off the fight with ${nm} and runs — it becomes a CHASE. Narrate the shift into a running chase in one beat: they give chase, the ground turns dangerous. Do NOT resolve the chase — it plays out in its own frame.)` });
    if (result) renderPlay(result.turn, {}); else renderPlay(character.activeScene?.lastTurn || null, { aside: `You break away — ${nm} gives chase.` });
  } catch { renderPlay(character.activeScene?.lastTurn || null, { aside: `You break away — ${nm} gives chase.` }); }
}

/** SNG-230 §6a (behavior): CAUGHT. A chase chained from a fight, abandoned/run-down → back into the fight (or,
 *  if the fight def is gone, a clean fail). Re-enters the ORIGINAL fight (kept in customEncounters), fresh — the
 *  foe regrouped — and the GM narrates the catch. */
async function beginFightFromChase(chaseDef) {
  const from = chaseDef?._chainedFrom || {};
  const nm = from.opponentName || "your foe";
  const fightDef = CONTENT.encounters?.[from.fightDefId] || character.customEncounters?.[from.fightDefId] || null;
  if (!fightDef) { // no fight to return to — fail out cleanly rather than dead-end
    character.activeEncounter = null; saveCharacter(character);
    renderPlay(null, { thinking: "…" });
    const r = await runGM({ resolution: null, playerInput: `(${nm} runs the character down — the chase is lost. Narrate being caught and its cost in one beat, then return to the scene.)` }).catch(() => null);
    renderPlay(r?.turn || character.activeScene?.lastTurn || null, r ? {} : { aside: `${nm} runs you down.` });
    return;
  }
  const isSB = !!(CONTENT.skillBattle?.engine && fightDef.type === "duel" && fightDef.skillBattle !== false);
  const oppSheet = isSB ? synthesizeOpponentSheet(withKind(fightDef.opponent, fightDef), CONTENT.skillBattle.engine) : null;
  character.activeEncounter = { defId: fightDef.id, state: { ...startEncounter(fightDef, { oppSheet }),
    _morphedFrom: { kind: "chase", note: `${nm} ran you down — the ground is gone and it is blades again` } } };
  saveCharacter(character);
  renderPlay(null, { thinking: "They run you down…" });
  try {
    const result = await runGM({ resolution: null, playerInput: `(The chase is lost — ${nm} runs the character down and it becomes a FIGHT again. Narrate the catch and turning to face them in one beat${isSB ? " (the contest plays out in a panel)" : ""}.)` });
    if (result) renderPlay(result.turn, {}); else renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} catches you — you have to fight.` });
  } catch { renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} catches you — you have to fight.` }); }
  if (isSB) renderSkillBattle();
}

// ---------- play rendering ----------

function renderPlay(turn, opts = {}) {
  // SNG-252b §2b (Erik: "move the narration to a good place INSIDE the encounter… I'm lost with everything
  // it's showing"). The scene prose rendered as a separate block BELOW the whole ribbon, so the thing you are
  // acting IN sat after the controls for acting in it. It is built HERE, once, and the ribbon claims it when
  // an encounter is live — the SCENE leads, the machinery follows. Outside an encounter nothing moves: the
  // same block renders in its usual place further down.
  const beatSpeakCtl = ttsAvailable()
    ? `<button class="beat-speak" id="do-speak" title="Read this beat aloud. Narration only — choices and costs are not spoken.">${_speaking ? "⏸ Stop" : "▶ Read aloud"}</button>`
    : "";
  const beatHtml = (turn && turn.narration)
    ? `<div class="beat">${beatSpeakCtl}${turn.narration.split(/\n\n+/).map(renderProseHtml).join("")}</div>`
    : "";
  let beatPlacedInRibbon = false;   // set when the ribbon takes it, so it can never render twice

  // SNG-088B / SNG-091: the GM sketched a plan this turn — open the builder pre-filled instead of the
  // scene, so the plan goes INTO the builder (editable, not executed). The request is UNCONDITIONAL:
  // it fires even if a stale draft lingers (a dropped request looks exactly like the GM ignoring you),
  // replacing that leftover with the plan the player just asked for.
  if (pendingGambitProposal) {
    const p = pendingGambitProposal; pendingGambitProposal = null;
    const hadDraft = !!(gambitDraft && (gambitDraft.goal?.trim() || (gambitDraft.steps || []).some(s => s.text?.trim())));
    gambitDraft = { goal: p.goal, steps: p.steps.length ? p.steps : [{ text: "", fallback: "" }], assessed: null };
    renderGambitBuilder(`✦ The GM sketched this plan for you — edit any of it, Assess to read your odds, then Run it. Nothing has happened yet.${hadDraft ? " (Your previous unsaved draft was replaced — ↺ Start over for a blank plan.)" : ""}`);
    return;
  }
  // SNG-070: surface a just-applied GM correction as an aside, whichever path rendered this turn.
  if (character?._correctionAside) { opts = { ...opts, aside: [opts.aside, character._correctionAside].filter(Boolean).join("\n\n") }; delete character._correctionAside; }
  // CCODE-07: the beat survived but some of its bookkeeping didn't — say so plainly rather than
  // letting the player discover a quest/NPC update silently missing. The GM restates next turn.
  if (turn?._applyFailed) { opts = { ...opts, aside: [opts.aside, `*(The scene stands, but part of this turn's bookkeeping didn't land${turn._applyFailedOp && turn._applyFailedOp !== "unknown" ? ` — the ${turn._applyFailedOp} step` : ""} — the GM will restate it next beat.)*`].filter(Boolean).join("\n\n") }; }
  const location = hereNow();
  const rules = CONTENT.rules;
  const mods = aptitudeMods(character, rules.playerAptitudes);
  const rep = location.communityId ? standingWith(character, location.communityId, rules) : null;

  const sheet = `<div class="sheet">
    <h2>${esc(character.name)}</h2>
    <div class="meta">${esc(character.origin)} · ${esc(character.background)} · level ${character.level} (${character.xp} xp)</div>
    <div style="display:flex; gap:6px; margin:6px 0">
      <button class="opt" id="open-character" style="flex:1">Character</button>
      <button class="opt" id="open-inventory" style="flex:1">Inventory</button>
      ${syncEnabled() ? `<button class="opt" id="open-feed" style="flex:1" title="The family feed — moments other players chose to share">📮 Feed</button>` : ""}
    </div>
    <div class="vital-row">Health <span class="vital-num" data-vital="health" tabindex="0" role="button" aria-label="Health ${character.health} of ${character.maxHealth}. Tap for detail.">${character.health} / ${character.maxHealth}</span></div>
    <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    <div class="vital-row">Energy ${infoDot("energy.no_regen")}<span class="vital-num" data-vital="energy" tabindex="0" role="button" aria-label="Energy ${character.energy} of ${character.maxEnergy}. Tap for detail.">${character.energy} / ${character.maxEnergy}</span></div>
    <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
    <details class="sidebar-sec" data-sec="attributes"${sectionOpen("attributes", false) ? " open" : ""}><summary><span class="sec-title">Attributes</span>${character.pendingSubPoints > 0 ? ` <span class="grow-badge">+${character.pendingSubPoints} to place</span>` : ""}</summary><div class="sec-body"><div class="attr-grid">
      ${SUBS.map(s => `<div style="text-transform:capitalize" title="${esc(SUB_DESC[s])} (${SUB_OF[s]})">${s}</div><div>${(character.subAttributes?.[s] ?? 0) > 6 ? (character.subAttributes[s] + " ●●●●●●⁺") : "●".repeat(character.subAttributes?.[s] ?? 0) + "○".repeat(Math.max(0, 4 - (character.subAttributes?.[s] ?? 0)))}${character.pendingSubPoints > 0 && (character.subAttributes?.[s] ?? 0) < (CONTENT.rules.leveling?.subAttributeCap ?? 6) ? ` <button class="grow-btn" data-grow="${s}">+</button>` : ""}</div>`).join("")}
    </div></div></details>
    <details class="sidebar-sec" data-sec="abilities"${sectionOpen("abilities", true) ? " open" : ""}><summary><span class="sec-title">Abilities</span>${character.skillPoints > 0 ? ` <span class="grow-badge">${character.skillPoints} skill pt</span>` : ""}</summary><div class="sec-body">
      ${canLevelUp(character) ? `<button class="opt" id="sidebar-levelup" title="Spend your skill points" style="padding:2px 8px; margin-bottom:6px; display:block">⬆ Level Up</button>` : ""}
      ${(() => {
        // SNG-047: group owned abilities by type/tradition (same taxonomy as the skill graph),
        // show each ability's FUNCTIONS as chips (what it DOES at a glance).
        const owned = character.abilities.map(a => ({ a, ab: fullCatalog()[a.abilityId] })).filter(x => x.ab);
        if (!owned.length) return "<div class='insight'>none yet</div>";
        // SNG-059: group owned abilities by TRADITION (the people they belong to), not powerSystem/reach.
        // SNG-202 §3: braids get their OWN category — they belong to no single tradition (that is the point),
        // and interleaving them under one parent's group hid what they are. The list view of the same fact
        // the wheel shows spatially.
        // SNG-215 §A2: group owned crafts by FUNCTION FAMILY (what they DO) instead of by tradition — the kit
        // legible at a glance ("what can I WARD with here"), reinforcing the world's own spine of functions.
        // Family via familiesOfAbility (the join FN_INDEX already carries); a craft files under its PRIMARY
        // (first) family; braids keep their own group. Grouping is a VIEW — each row still shows rank/cost/practice.
        const byFam = {}; const braids = [];
        for (const o of owned) {
          if (o.ab.minted && Array.isArray(o.ab.minted.from) && o.ab.minted.from.length === 2) { braids.push(o); continue; }
          const key = familiesOfAbility(o.ab, FN_INDEX)[0] || "OTHER"; (byFam[key] = byFam[key] || []).push(o);
        }
        const order = [...FUNCTION_FAMILIES.filter(f => byFam[f]?.length), ...(byFam.OTHER ? ["OTHER"] : [])];
        const famLabel = f => f === "OTHER" ? "Other" : f.charAt(0) + f.slice(1).toLowerCase();
        const boostSet = new Set(character.boostedCrafts || []); // SNG-215 §A1
        const row = ({ a, ab }) => {
          const rank = rankExpression(character, ab, a.level, CONTENT.branchForks) || ab?.tree?.find(t => t.rank === a.level);
          const p = rankProgress(character, a.abilityId); // ability-arch v2: earned, not bought
          const on = boostSet.has(a.abilityId); // SNG-215 §A1: a player-set boost — a thumb on the scale for suggestions, never an override
          // SNG-202 §3 / SNG-201: a braid names its parents + who found it first (the list echo of the wheel).
          const braidLine = (ab.minted && (ab.minted.from || []).length === 2)
            ? `<div class="hint braid-parents">⧉ braid of ${esc((ab.minted.sourceNames || []).join(" × ") || "two crafts")}${ab.minted.namedBy === "player" ? " · your name for it" : ab.minted.adoptedFrom?.characterName ? ` · first found by ${esc(ab.minted.adoptedFrom.characterName)}` : ab.minted.firstFinder ? " · you found it first" : ""}</div>` : "";
          return `<div class="ability${on ? " boosted" : ""}" title="${esc(rank ? "CAN: " + rank.grants + " | CANNOT: " + rank.cannot : ab?.description || "")}">
            <button class="craft-boost${on ? " on" : ""}" data-boost="${esc(a.abilityId)}" title="${on ? "Boosted — the GM leans toward suggesting this when it fits (tap to clear). A nudge, never a force." : "Boost — nudge the GM to surface this craft in your options when it fits. Never forces it, never changes a roll."}">✦</button>
            <span class="name entity-hover" data-entity="skill:${esc(a.abilityId)}">${esc(ab?.name || a.abilityId)}</span> <span class="tier-badge" title="Tier ${tierOf(ab.levelReq)}">${tierOf(ab.levelReq)}</span> rank ${a.level}${rank ? ` — <em>${esc(rank.name)}${rank.forked ? " ⑂" : ""}</em>` : ""}
            <span class="cost">(${effectiveEnergyCost(ab, character, CONTENT.rules)} energy${effectiveEnergyCost(ab, character, CONTENT.rules) < ab.energyCost ? `, was ${ab.energyCost}` : ""})</span>
            ${functionChips(ab)}${braidLine}
            <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div></div>`;
        };
        const braidGroup = braids.length
          ? `<details class="skill-group braids-group" open><summary>✦ Braids <span class="cost">(${braids.length})</span></summary>${braids.sort((x, y) => (x.ab.levelReq || 1) - (y.ab.levelReq || 1)).map(row).join("")}</details>`
          : "";
        return braidGroup + order.map(fam => `<details class="skill-group ${familyClass(fam)}" open><summary>${FAMILY_GLYPH?.[fam] || "◆"} ${esc(famLabel(fam))} <span class="cost">(${byFam[fam].length})</span></summary>${
          byFam[fam].sort((x, y) => (x.ab.levelReq || 1) - (y.ab.levelReq || 1)).map(row).join("")}</details>`).join("");
      })()}
      ${(() => {
        const canShow = character.skillPoints > 0 || (character.practice?.aspirations || []).some(a => aspirationRipe(character, a.abilityId, CONTENT.rules));
        if (!canShow) return "";
        const cap = atCapacity(character, CONTENT.skillCapacity);
        const learnable = Object.values(CONTENT.abilities).filter(ab => {
          if (character.abilities.some(a => a.abilityId === ab.id)) return false;
          if (character.skillPoints <= 0 && !aspirationRipe(character, ab.id, CONTENT.rules)) return false;
          const req = learnLevelReq(ab); // SNG-094: domain gate, not the legacy powerSystem==origin filter
          if (req === null || character.level < req) return false;
          // SNG-055: the domain gate decides what's OFFERED — the antipode of a chosen pole and
          // over-tier picks (secondary>III, tertiary>II, kin-capstones) simply aren't shown.
          return domainVerdict(ab).allowed;
        });
        const capLine = `<div class="cap-line">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${cap ? " — at capacity; points now deepen owned skills" : ""}${cap ? " " + infoDot("lock.capacity") : ""}</div>`;
        if (!learnable.length) return capLine;
        // SNG-059: group the learn list by TRADITION (the people)
        const byClass = {};
        for (const ab of learnable) { const key = abilityTradition(ab) || ab.powerSystem || "learned"; (byClass[key] = byClass[key] || []).push(ab); }
        const groups = Object.keys(byClass).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(cls => `<details class="learn-group"><summary>Learn ${esc(traditionLabel(cls))} <span class="cost">(${byClass[cls].length})</span></summary>${
          byClass[cls].sort((a,b)=>(a.levelReq||1)-(b.levelReq||1)).map(ab => {
            const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
            const capBlock = cap && ab.powerSystem !== "learned";
            const ripe = aspirationRipe(character, ab.id, CONTENT.rules);
            const dv = domainVerdict(ab); // SNG-055 band + skill-point penalty
            // SNG-BATCH-10: once domains are set the ring-distance penalty is authoritative (matches
            // the engine in learnAbility); pre-domain/legacy characters keep the old cross-class cost.
            const learnCost = learnPointCost(ab, character, CONTENT.skillCapacity, dv);
            const tooExpensive = !ripe && character.skillPoints < learnCost;
            const blocked = !gate.ok || capBlock || tooExpensive;
            const bandTag = dv.band === "far" ? ", far" : dv.band === "adjacent" ? ", kin" : "";
            return `<button class="opt ${ripe ? "practiced" : ""} ${blocked ? "locked" : ""}" ${blocked ? "disabled" : `data-learn="${esc(ab.id)}"`} title="${esc(ab.description + " — " + dv.reason + (gate.ok ? "" : " · " + gate.why))}" style="margin:2px 0; display:block; width:100%"><span class="tier-badge">${tierOf(ab.levelReq)}</span> ${esc(ab.name)} <span class="cost">L${ab.levelReq || 1}${bandTag}${learnCost > 1 ? ` · ${learnCost} pts` : ""}${ripe ? " — FREE" : ""}${!gate.ok ? " 🔒 " + esc(gate.why) : capBlock ? " 🔒 at capacity" : tooExpensive ? " 🔒 need " + learnCost + " pts" : ""}</span></button>`;
          }).join("")}</details>`).join("");
        return capLine + groups;
      })()}
      ${(character.discoveries || []).length ? `<details class="skill-group discoveries" open><summary>Discoveries &amp; Combinations <span class="cost">(${character.discoveries.length})</span></summary>${character.discoveries.map(d => {
        // SNG-047: adopt the orphan combo — show the source abilities it braids (recipe parts)
        const parts = (d.abilityIds || []).map(id => fullCatalog()[id]?.name || id.replace(/-/g, " "));
        return `<div class="ability discovery-row" title="${esc(d.description || "")}">✦ <span class="name">${esc(d.name)}</span>${parts.length ? ` <span class="combo-parts">= ${parts.map(esc).join(" + ")}</span>` : ""}</div>`;
      }).join("")}</details>` : ""}
    </div></details>
    ${/* SNG-120: the old sidebar "People you know" (a duplicate of the SNG-119 "who's here" list + the full
          Character-screen roster) is GONE — its people show once, in the place-scoped section below. */""}
    <details class="sidebar-sec" data-sec="quests"${sectionOpen("quests", (character.quests || []).some(q => q.status === "active")) ? " open" : ""}><summary><span class="sec-title">Quests</span> ${infoDot("quest.routes")}${(character.quests || []).filter(q => q.status === "active").length ? ` <span class="sec-sum">(${(character.quests || []).filter(q => q.status === "active").length})</span>` : ""}</summary><div class="sec-body">
      ${(character.quests || []).filter(q => q.status === "active").map(q => { const stage = q.structured ? (q.stages?.[q.stageIndex] || q.stages?.[q.stages.length - 1]) : null;
        return `<button class="quest quest-click" data-quest="${esc(q.id)}"><span class="quest-title">${esc(q.title)}</span>${q.structured ? ` <span class="cost">✦</span>` : ""}
          <div class="quest-note">${esc(q.structured ? (stage?.objective || "resolve") : (q.progress?.length ? q.progress[q.progress.length - 1] : q.summary))}</div>
        </button>`; }).join("") || "<div class='insight'>no undertakings yet — the valley will provide</div>"}
      ${(() => { const avail = availableStructuredQuests(character, [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])], questOfferContext(character, sceneState)); return avail.length ? `<div class="hint" style="margin-top:4px">✦ ${avail.length} quest${avail.length === 1 ? "" : "s"} to take up here</div>` : ""; })()}
      <button class="opt" id="open-questlog" style="display:block;width:100%;margin-top:4px">📜 Quest Log${(character.quests || []).some(q => q.status !== "active") ? ` — ${(character.quests || []).filter(q => q.status === "completed" || q.status === "resolved").length} done · ${(character.quests || []).filter(q => q.status === "failed").length} failed` : ""}</button>
    </div></details>
    ${(() => { // SNG-120/126: Company — Party (players) + Companions (catalog) + Allies (NPC party members, roles)
      const comps = (character.companions || []).filter(id => CONTENT.companions[id]);
      const partyOn = syncEnabled();
      // SNG-126: the unified NPC-people half — recruited members (with roles) + partner-adjacent NPCs,
      // plus present NPCs bonded strongly enough to ask along.
      const roster = companyRoster(character, { rules: CONTENT.rules });
      const inRoster = id => roster.some(r => r.npcId === id);
      const recruitable = (knownPeopleAt(character, character.currentLocationId, { locations: CONTENT.locations, npcs: CONTENT.npcs }) || [])
        .filter(p => !inRoster(p.id) && isRecruitable(character.npcRegistry?.[p.id]));
      if (!partyOn && !comps.length && !roster.length && !recruitable.length) return ""; // truly solo → the section disappears
      const count = (sharedScene?.party?.length || 0) + comps.length + roster.length;
      const partyBody = partyOn ? `<div class="company-group"><div class="sys-label">Party</div>${sharedScene ? `${sharedScene.party.map(m => `<div class="known-npc"><span class="npc-name">${m.characterId === character.id ? "you" : esc(m.name)}</span>${sharedScene.turn === m.characterId ? `<span class="rep-band trusted">turn</span>` : ""}</div>`).join("")}<div class="hint">${isMyTurn(sharedScene, character.id) ? "Your turn — act." : "Waiting for " + esc(sharedScene.party.find(m => m.characterId === sharedScene.turn)?.name || "…")}</div><button class="opt" id="party-leave" style="display:block; width:100%; margin-top:4px">Leave shared scene</button>` : `<button class="opt" id="party-find" style="display:block; width:100%">Find or start a party here</button>`}</div>` : "";
      // SNG-135: ONE tight flex row per member — name · inline badge · compact action. Roster/roles/recruit
      // gating (SNG-126) unchanged; the companion description moves to the row title (hover) instead of a
      // printed line. data-rename/part/partally/recruit hooks are identical — layout only.
      const compBody = comps.length ? `<div class="company-group"><div class="sys-label">Companions</div>${comps.map(id => { const c = CONTENT.companions[id]; const dn = character.companionNames?.[id] || c.name; const b = bondOf(character, c.id, CONTENT.rules, c.stages); return `<div class="company-row" title="${esc(c.role)}${c.appearance ? " — " + c.appearance : ""}"><span class="company-name">${esc(dn)}${dn !== c.name ? ` <span class="hint">(${esc(c.name)})</span>` : ""}</span><span class="company-badge ${b.bond >= 3 ? "on" : ""}" title="bond grows through shared deeds, assists, and encounters — s${b.stageCount} is their deepest">bond ${b.bond}${b.stage > 1 ? ` · s${b.stage}` : ""}</span><span class="company-actions"><button class="company-action companion-rename" data-rename="${esc(id)}" title="Name them">✎</button><button class="company-action companion-part" data-part="${esc(id)}" title="Part ways">✕</button></span></div>`; }).join("")}</div>` : "";
      const allyBody = (roster.length || recruitable.length) ? `<div class="company-group"><div class="sys-label">Allies</div>${
        roster.map(r => `<div class="company-row" title="${esc(roleBadges(r.roles))}${r.teaches ? " · teaches " + traditionLabel(r.teaches) : ""}${r.liaisonFor ? " · liaison" : ""}"><span class="company-name">${esc(r.name)}</span><span class="company-badge" title="roles they hold in your company">${esc(roleBadges(r.roles))}</span>${r.teaches ? `<span class="company-badge on" title="a trainer — their presence lets you learn this people's capstones">⚔</span>` : ""}${r.liaisonFor ? `<span class="company-badge" title="a liaison — faster standing with their people">🤝</span>` : ""}<span class="company-actions">${r.recruited ? `<button class="company-action ally-part" data-partally="${esc(r.npcId)}" title="Part ways">✕</button>` : ""}</span></div>`).join("")
      }${recruitable.map(p => `<div class="company-row" title="${esc(p.label || "at your side")}"><span class="company-name">${esc(p.name)}</span><span class="company-badge hint">${esc(p.label || "at your side")}</span><span class="company-actions"><button class="company-action recruit" data-recruit="${esc(p.id)}" title="Ask them to travel with you">＋</button></span></div>`).join("")}</div>` : "";
      return `<details class="sidebar-sec" data-sec="company"${sectionOpen("company", true) ? " open" : ""}><summary><span class="sec-title">Company</span>${count ? ` <span class="sec-sum">(${count})</span>` : ""}</summary><div class="sec-body">${partyBody}${compBody}${allyBody}</div></details>`;
    })()}
    ${(() => { // SNG-121: Items — the PINNED quick-access set; the rest is one tap away in the full Inventory
      ensurePins(character);
      const pins = pinnedItems(character), total = (character.inventory || []).length, more = total - pins.length;
      const body = `${pins.length ? pins.map(it => itemCard(it, { open: examinedItem === it.name, toggleAttr: "data-examine" })).join("") : `<div class="insight">${total ? "Nothing pinned — pin items from Inventory for quick access." : "empty-handed"}</div>`}${total ? `<button class="opt" id="open-inventory-more" style="display:block; width:100%; margin-top:4px">${more > 0 ? `＋ ${more} more in Inventory` : "Open Inventory"}</button>` : ""}`;
      return `<details class="sidebar-sec" data-sec="items"${sectionOpen("items", true) ? " open" : ""}><summary><span class="sec-title">Items</span> <span class="sec-sum">(${pins.length} pinned · ${total} total)</span></summary><div class="sec-body">${body}</div></details>`;
    })()}
    ${(() => { // SNG-119/120: standing + who's HERE (place-scoped) + the committed-partner banner, collapsible
      const hereP = knownPeopleAt(character, character.currentLocationId, { locations: CONTENT.locations, npcs: CONTENT.npcs });
      const partners = partnerAdjacentNpcs(character, CONTENT.rules);
      if (!rep && !hereP.length && !partners.length) return "";
      // CCODE-05: a partner is shown ONCE. The banner and the who's-here list were both rendering
      // them, so Pell appeared twice — the same person, listed as two people.
      const partnerIds = new Set(partners.map(p => p.id).filter(Boolean));
      const hereRest = hereP.filter(p => !partnerIds.has(p.id));
      // Per-person controls: the GM is supposed to emit revealName/nameExtend when the fiction
      // learns a name, and it intermittently doesn't — leaving "Broad Opportunist" beside the same
      // person's real name. Only the player knows they are the same, so give the player the verbs.
      const peopleCtl = (p) => p.id ? ` <button class="npc-ctl" data-setname="${esc(p.id)}" title="Set or extend this person's name (e.g. Pell → Pell Ran Marsh)">✎</button><button class="npc-ctl" data-mergenpc="${esc(p.id)}" title="This is the same person as someone else you know — merge them">⇊</button>` : "";
      const row = (p, extra = "") => `<div class="known-npc"><span class="npc-name entity-hover" ${p.id ? `data-entity="npc:${esc(p.id)}"` : ""}>${esc(p.name)}</span> <span class="rep-band ${p.bondType === "romantic" ? "trusted" : ""}">${esc(p.label)}${extra}</span>${peopleCtl(p)}</div>`;
      const body = `${partners.length ? `<div class="partner-adjacent" style="margin-bottom:6px">${partners.map(p => `<div class="known-npc partner"><span class="npc-name entity-hover" ${p.id ? `data-entity="npc:${esc(p.id)}"` : ""}>❤ ${esc(p.name)}</span> <span class="rep-band trusted" title="A committed partner — with you in all but the mechanics">${esc(p.label)} · with you</span>${peopleCtl(p)}</div>`).join("")}</div>` : ""}${rep ? `<div style="margin-bottom:4px"><span class="rep-band ${rep.band}">${rep.band} (${rep.score})</span></div>` : ""}${hereRest.length ? hereRest.map(p => row(p)).join("") : (partners.length ? "" : `<span class="insight">no one you know is here right now</span>`)}`;
      return `<details class="sidebar-sec" data-sec="whoshere"${sectionOpen("whoshere", true) ? " open" : ""}><summary><span class="sec-title">${esc(location.name)} — who's here</span>${rep ? ` <span class="sec-sum">· ${rep.band}</span>` : ""}</summary><div class="sec-body">${body}</div></details>`;
    })()}
    <details class="sidebar-sec" data-sec="playstyle"${sectionOpen("playstyle", false) ? " open" : ""}><summary><span class="sec-title">Play-style</span></summary><div class="sec-body">${aptitudeChips()}</div></details>
    <details class="sidebar-sec" data-sec="maprest"${sectionOpen("maprest", false) ? " open" : ""}><summary><span class="sec-title">Map &amp; Rest</span></summary><div class="sec-body">
      <button class="opt map-open" id="open-map" style="margin:2px 0 6px; display:block; width:100%">🗺 Open Map — travel & places</button>
      <button class="opt" id="do-breather" style="margin-top:8px; display:block; width:100%">Breather (+${recoveryEnergy("breather", character, rules)} energy, 1h)</button>
      <button class="opt" id="do-rest" style="margin-top:4px; display:block; width:100%">Sleep (+${recoveryEnergy("sleep", character, rules)} energy, ${rules.recovery?.sleep?.hours ?? 8}h)</button>
      ${/* CCODE-03: the player can always close a scene themselves — the GM should do it, but a
            scene that won't end is the player's to end. Writes the chronicle entry either way. */""}
      <button class="opt" id="do-endscene" style="margin-top:8px; display:block; width:100%" title="Draw this scene to a close and write it into your chronicle. A new scene opens on your next action.">⏹ End this scene${sceneTurns.length ? ` (${sceneTurns.length} beats)` : ""}</button>
      ${/* SNG-155: read the narration aloud at the table. Narration only — choices, costs and
            receipts are never spoken. Hidden entirely when the device has no voices (tier 0). */""}
    </div></details>
    <details class="sidebar-sec" data-sec="codex"${sectionOpen("codex", false) ? " open" : ""}><summary><span class="sec-title">Codex &amp; Library</span></summary><div class="sec-body">
      <button class="opt" id="open-codex" style="display:block; width:100%">${Object.keys(character.codex?.topics || {}).length} topic${Object.keys(character.codex?.topics || {}).length === 1 ? "" : "s"} discovered — open Codex</button>
      <button class="opt" id="open-library" style="display:block; width:100%; margin-top:6px">📖 The Library — read the world</button>
    </div></details>
  </div>`;

  const banner = sceneImage(location, sceneState, { ratingLevel: viewerRatingLevel() });
  const time = readClock(character.clock);
  // SNG-247 Tier 0: the play surface carries the KIND of the bounded thing you are inside, so `--enc-hue` cascades
  // to the frame strip AND the contest panel from one place. Same encounterKind() the engine uses to pick the exit
  // rule — one source of truth for "what kind of thing is this", so the colour can never contradict the mechanics.
  const encKindNow = (() => { const e = activeEnc(); return e ? encounterKind(e.def) : null; })();
  let main = `<div class="play${activeEnc()?.state?.mode === "skill_battle" ? " play-in-fight" : ""}${encKindNow ? ` enc-kind-${encKindNow}` : ""}">
    ${banner ? `<img class="scene-banner" src="${esc(banner)}" alt="${esc(location.name)}" onerror="this.style.display='none'">` : ""}
    <div class="location-tag" ${sceneState?.setting ? `title="${esc(sceneState.setting)}"` : ""}>${esc(location.name)}${rep ? ` <span class="rep-band loc-standing ${rep.band}" title="Your standing with ${esc(CONTENT.locations[character.currentLocationId]?.name || "the people here")} — ${rep.band} (${rep.score})">· ${esc(rep.band)}</span>` : ""}<span class="time-tag" title="Your own clock — days, season, time of day (SNG-191). The world's count is a separate shared tally, not a date.">${esc(time.label)} <span class="world-day-tag" title="The Kept Count — the shared world tally; it only ever climbs and is not a date">· ⧗ ${worldCount()}</span></span></div>
    ${(() => { const e = activeEnc(); if (!e) return ""; const st = e.state, d = e.def;
      let status = "";
      if (d.type === "duel") {
        // SNG-247 (Erik: "a 6 block indicator that never seems to change... i think it might be broken") — it WAS.
        // Those pips were the opponent's HP, and a skill battle has not moved opponentHealth since CCODE-38 made
        // filling the meter a PRESSURE tick instead of damage. So the bar sat full for the whole fight in every
        // contest — a fight, a chase, everything. On the contest engine the honest "how close is this to ending"
        // track is PRESSURE, which is what actually ends it; the classic duel keeps its hp pips, which do move.
        if (st.mode === "skill_battle") {
          const cfg = { ...(CONTENT.skillBattle?.engine?.momentum?.pressure || {}),
            ...((CONTENT.skillBattle?.engine?.kinds?.[encounterKind(d) || "fight"] || {}).pressure || {}) };
          const need = cfg.breakAtPressure ?? 2;
          const pipRow = (n, of) => "◆".repeat(Math.max(0, Math.min(n, of))) + "◇".repeat(Math.max(0, of - n));
          const theirs = st.pressure?.opponent || 0, mine = st.pressure?.player || 0;
          const yourBreak = cfg.playerBreaksAtPressure;
          status = `${esc(d.opponent.name)} driven back: ${pipRow(theirs, need)} ${theirs}/${need}`
            + (Number.isFinite(yourBreak) ? ` · you: ${pipRow(mine, yourBreak)} ${mine}/${yourBreak}` : ` · you: ${character.health}/${character.maxHealth} hp`)
            + ` · ${character.energy}e`;
        } else {
          status = `${esc(d.opponent.name)}: ${"▮".repeat(Math.max(0, st.opponentHealth))}${"▯".repeat(Math.max(0, d.opponent.health - st.opponentHealth))} · you: ${character.health}/${character.maxHealth}${st.tactic ? ` · tactic: ${esc(st.tactic)}` : ""}`;
        }
      }
      if (d.type === "challenge") status = `stage ${Math.min(st.stageIndex + 1, d.stages.length)}/${d.stages.length}: ${esc(d.stages[st.stageIndex]?.name || "complete")}`;
      if (d.type === "puzzle") {
        const tier = senseTierFor();
        const revealed = puzzleHints(d, Math.max(tier, st.hintsRevealed));
        status = `attempts: ${st.attempts} · understanding: ${revealed.length}/${(d.hintTiers || []).length}` +
          (revealed.length ? `<div class="enc-hints">${revealed.map(h => `<div>◈ ${esc(h)}</div>`).join("")}</div>` : "");
      }
      // SNG-236 UX: the frame is an INTEGRATED, persistent strip at the top of the play surface — obviously an
      // encounter (kind, win, meter, the three exits) without a takeover card that interrupts the flow. Same
      // frameModel content SNG-230 established, relocated + slimmed so it reads as "you are in an encounter,"
      // and the MOVES (ward/sense/strike + the exits) live in the ⚙ Moves gear on the input row, not as loose
      // buttons here. frameSize still routes prominence (a weighty encounter gets the bolder strip).
      const fm = frameModel(d, e.state, null, CONTENT.frameKinds);
      if (!fm) return `<div class="encounter-bar"><span class="enc-name">⚔ ${esc(d.name)}</span> <span class="enc-round">round ${st.round}</span><div class="enc-status">${status}</div></div>`;
      const prom = frameSize(d, e.state) === "takeover" ? " enc-frame-takeover" : "";
      // SNG-247: the meter shows whenever there IS one. The old gate was `meter.total` — a STAGE COUNT — so every
      // kind running on the contest engine (which has a pct but no stages) rendered no meter at all: a chase with
      // no Distance bar, a standoff with no Resolve bar. Caught by clicking the new dev buttons. The done/total
      // text still only appears when there are stages to count.
      const meterHtml = Number.isFinite(fm.meter?.pct) ? `<div class="enc-frame-meter" title="${esc(fm.meter.label)}"><div class="enc-frame-meter-fill" style="width:${fm.meter.pct}%"></div></div>
        <div class="enc-frame-stage">${esc(fm.meter.label)} — ${fm.meter.total ? `${fm.meter.done}/${fm.meter.total}` : `${fm.meter.pct}%`}${fm.stage?.name ? ` · <em>${esc(fm.stage.name)}</em>` : ""}</div>` : "";
      const exitsHtml = `<div class="enc-frame-exits">${fm.exits.map(x => `<span class="enc-exit enc-exit-${x.role}"><b>${x.role}</b> ${esc(x.means)}</span>`).join("")}</div>`;
      const collapseHtml = fm.warded
        ? `<div class="enc-frame-collapse dim">⚑ Warded — a finisher cannot end this unless the ward is shattered outright; work it through.</div>`
        : fm.collapsible
        ? `<div class="enc-frame-collapse">⚡ A decisive finisher could end this in one beat — an all-or-nothing stroke (a clean crit collapses it; a botch turns it worse).</div>`
        : `<div class="enc-frame-collapse dim">⚑ Too great to end in one stroke — you'll have to work it through.</div>`;
      // SNG-252 §2b: THE RIBBON IS ONE CONTAINER. The moves panel used to be appended as a SIBLING far down the
      // play surface beside the input row, so an engaged encounter read as three disconnected fragments — a
      // frame at the top, an orphaned line, a moves panel near the bottom — and the player assembled it by eye.
      // Everything about the encounter now renders INSIDE this one bordered box, in the §2b order:
      // header → subtitle → win → meter → receipt → exits → moves → freeform.
      //
      // This is also the true cause of Erik's "the hazard border doesn't seem to have the full border": the
      // border was never partial — `enc-frame-hazard` and its stone hue are both present and correct (verified)
      // — but most of a hazard's content sat OUTSIDE the box. Hazard shows it worst precisely because it is the
      // fast path: its frame is the slimmest, so the share of the encounter living outside the border is
      // largest. §2a as specced was a no-op; §2b is the fix.
      const copy252 = CONTENT.ribbonCopy || {};
      const subtitle = copy252.subtitle?.byKind?.[fm.kind] || "";
      const subtitleHtml = subtitle ? `<div class="enc-frame-sub">${esc(subtitle)}</div>` : "";
      // The receipt is the last round's mechanical readout, kept on the encounter state so it PERSISTS in the
      // ribbon ("where you stand") instead of scrolling away with the narration it was printed beside.
      const receiptHtml = st._lastReceipt ? `<div class="enc-receipt enc-frame-receipt">${esc(st._lastReceipt)}</div>` : "";
      // Moves ride INSIDE the ribbon and are SHOWN BY DEFAULT when engaged (Erik's intent); the ⚙ collapses
      // them for space rather than hiding them behind a control the player must find first.
      const movesShown = movesOpen;
      // SNG-252b §2a (Erik: "tapping to open the moves is a good default"). SNG-252 opened them by default —
      // his earlier ask — and seeing it built he reversed it: ~5 full-width cards ate the screen before he had
      // chosen to look at his moves. Collapsed is now the default, and the affordance SUMMARISES what is behind
      // it ("4 reads, 1 strike") so collapsing costs no information about what you have. The freeform line
      // stays visible either way — hiding the cards must never hide the ability to act.
      const movesToggle = (st.mode === "skill_battle") ? ""
        : `<button class="enc-frame-movetoggle${movesShown ? "" : " collapsed"}" id="enc-moves-toggle">${esc(movesShown
            ? (copy252.collapsedMoves?.openLabel || copy252.collapse?.openLabel || "⚙ hide moves")
            : movesSummaryLine(copy252))}</button>`;
      // A SKILL BATTLE brings its own richer structured panel (fog / intensity / skills / read / break / yield),
      // and that panel IS the fight's action choices — so it belongs inside the ribbon too, or the most common
      // kinds stay exactly as split as before. Verified live: a standoff showed an empty moves area with all of
      // its controls in a separate box far below, which is Erik's complaint on the kind he meets most.
      // It is NESTED here, not rebuilt (the §2c guard: extend, don't rebuild) — the same panel, re-parented.
      const movesHtml = (st.mode === "skill_battle") ? skillBattlePanel() : (movesShown ? encounterMovesPanel(fm) : "");
      // The freeform line COMPOSES from Aevi's corrected copy: the frame supplies the ▸, `cue` is the bare
      // phrase, `wrapSuffix` is the moves pointer. Her first version was a whole self-contained line that
      // doubled this wrapper (and still said "Moves below" when they had moved inside); she split it, so the
      // frame now owns the wrapping and the content stays hers. A kind that customises `fm.freeform` beyond
      // the generic constant supplies its own cue instead.
      const ownCue = fm.freeform && fm.freeform !== FRAME_FREEFORM_CUE ? String(fm.freeform) : null;
      const cue = String(ownCue || copy252.freeform?.cue || copy252.freeform?.text || "describe your own move — the {kind} resolves whatever you try, against the stage");
      const cueText = `▸ ${cue} ${String(copy252.freeform?.wrapSuffix || "")}`.replace(/\{kind\}/g, fm.kind).replace(/\s+/g, " ").trim();
      const freeformHtml = fm.freeform ? `<div class="enc-frame-cue">${esc(cueText)}</div>` : "";
      const cueHtml = `${collapseHtml}${movesToggle}${movesHtml}${freeformHtml}`;
      // SNG-149/CCODE-89b: a Coliseum bout renders its BLIND GRID above the frame. It sits outside the
      // frame rather than inside it because the grid is decided BEFORE the contest — the picks are what
      // makes it this contest rather than another, and folding it in would read as one more round option.
      return coliseumStrip() + `<div class="enc-frame enc-strip${prom} enc-frame-${fm.kind}">
        ${(() => {
          // SNG-247 Tier 4 (the morph made VISIBLE). Frames have chained since SNG-230 — flee a fight and you ARE
          // dropped into a chase — but nothing ever SAID SO. The border silently changed colour and the player was
          // left to infer that the rules had changed under them. This names the transition, in both kinds' own
          // icons and words, and carries the OLD hue so the strip shows where it came from.
          const mf = st._morphedFrom; if (!mf) return "";
          const from = CONTENT.frameKinds?.[mf.kind] || FRAME_KINDS_FALLBACK_FULL[mf.kind] || {};
          return `<div class="enc-frame-morph" style="--enc-hue-from:var(--enc-hue-${esc(mf.kind)}, var(--ink-dim))">
            <span class="morph-from">${esc(from.icon || "")} ${esc(from.title || mf.kind)}</span>
            <span class="morph-arrow">→</span>
            <span class="morph-to">${fm.icon} ${esc(fm.title)}</span>
            <span class="morph-said">${esc(mf.note || "it became something else")}</span></div>`;
        })()}
        ${/* SNG-252b §2c — THE HIERARCHY. SNG-252 put everything in one container at one visual weight, which
              is why Erik was lost: a single object with no internal order reads WORSE than the old split. The
              order is now importance, top to bottom (Aevi's `hierarchy.order`):
                1 header (a small label)      2 THE SCENE — what is actually happening, prominent
                3 where you stand (win · meter · receipt, ONE compact row, not three stacked bars)
                4 what you can do (collapsed moves + the always-visible freeform line)
                5 the ways out — quietest, last. */""}
        <div class="enc-frame-top"><span class="enc-frame-title">${fm.icon} ${esc(fm.title)}</span><span class="enc-frame-kind">${esc(fm.kind)} · round ${st.round}</span></div>
        ${subtitleHtml}
        ${(() => { if (!beatHtml) return ""; beatPlacedInRibbon = true; return `<div class="enc-frame-scene">${beatHtml}</div>`; })()}
        <div class="enc-frame-stand">
          <span class="enc-frame-win">${esc(fm.winCondition)}</span>
          ${status ? `<span class="enc-status">${status}</span>` : ""}
        </div>
        ${meterHtml}${receiptHtml}${cueHtml}${exitsHtml}</div>`;
    })()}
    ${(() => {
      // SNG-244: a quest that has reached its DECISION shows an integrated strip here — above the narration,
      // in the same SNG-230 slot the encounter frame uses — so the most important beat of a quest can't be
      // scrolled past or missed on a tab the player isn't looking at. Encounter-FIRST: if a fight is live, you
      // resolve it before the decision surfaces (guard — never two takeover strips). Reads existing state only;
      // each road taps through to the shared resolveQuestOutcome (the exact ending-selection the detail uses).
      if (activeEnc()) return "";
      const decs = questsAtDecision();
      if (!decs.length) return "";
      const q = decs[0]; // the primary decision; any others are noted below and remain on the Quests screen
      const roads = (q.outcomes || []).map(o => `<button class="dec-road" data-qdecide="${esc(q.id)}::${esc(o.id)}" title="${esc(o.summary || o.name || "")}">
        <span class="dec-road-name">${esc(o.name)}</span>${o.summary ? `<span class="dec-road-hint">${esc(smartClamp(String(o.summary), 96))}</span>` : ""}</button>`).join("");
      const more = decs.length > 1 ? `<div class="dec-more">＋ ${decs.length - 1} other decision${decs.length - 1 > 1 ? "s are" : " is"} also ready — on the Quests screen</div>` : "";
      return `<div class="enc-frame enc-strip enc-frame-decision">
        <div class="enc-frame-top"><span class="enc-frame-title">⚖ ${esc(q.title)}</span><span class="enc-frame-kind">decision at hand</span></div>
        <div class="enc-frame-win">Every stage is behind you — what it was all for is yours to decide. This is permanent.</div>
        <div class="dec-roads">${roads}</div>${more}</div>`;
    })()}<div class="transcript">`;
  if (opts.newsFlash?.length) {
    main += `<div class="news-flash"><div class="news-title">While you were away…</div>${opts.newsFlash.map(n => `<div class="news-item">◈ ${esc(n.text)}</div>`).join("")}</div>`;
  }
  if (opts.playerBeat) {
    // SNG-181: render what the player TYPED, in full — not the compact action label. `label` is a
    // short UI/prompt string by design; the log is the one place their own sentence must survive
    // whole. Falls back to the label for choice-button beats, which have no typed words.
    const said = opts.playerBeat.playerWords || opts.playerBeat.resolution?.action?.playerWords || opts.playerBeat.label;
    main += `<div class="beat player-action">▸ ${esc(said)}</div>`;
    if (opts.playerBeat.resolution) {
      const r = opts.playerBeat.resolution;
      // SNG-169 §2c: the item that aided the roll is now tappable. `entityHover`'s item branch and
      // `itemDetail` were fully written and reached by nothing — a 12th built-never-reached. The
      // spec proposed hanging it on the inventory `.item-name` button, but that button already owns
      // a richer inline expand (and a second handler on it would fire both), so the popup belongs
      // where an item is named and CANNOT be inspected: here, in the beat that it helped.
      const itemSet = new Set(r.itemHelpers || []);
      const helpers = r.equipHelpers?.length
        ? ` · aided by ${r.equipHelpers.map(h => itemSet.has(h)
          ? `<span class="entity-hover" data-entity="item:${esc(h)}">${esc(h)}</span>`
          : esc(h)).join(", ")}`
        : "";
      const locBits = r.locationAffinity?.length ? `<div class="roll-affinity">${r.locationAffinity.map(esc).join(" · ")} ${infoDot("roll.spectral_fit")}</div>` : "";
      const intBit = r.intensity && r.intensity !== "standard" ? ` · <span class="intensity-${esc(r.intensity)}">${esc(r.intensity)}</span>${r.energySpent != null ? ` (${r.energySpent} energy)` : ""}` : "";
      const blBit = r.surgeBacklash ? `<div class="roll-backlash">⚡ surge backlash: ${r.backlash.health} health, ${r.backlash.energy} energy</div>` : "";
      // SNG-090: the substrate receipt — the lattice thin (starved) or crowding (interference) here.
      // BATCH-13 invariant 5: name the CARRIED cause. The ground reading differently because of what
      // you walked in with is unexplainable at exactly the moment it matters, unless the receipt says so.
      const carriedBit = (r.substrate?.carriedBy || []).length
        ? ` <span class="cost" title="Carried substrate — a companion's aura or a charged item you're holding — shifts the effective lattice density here by this much. It helps a craft that wants denser ground and hurts one that wants thinner; the sign is the shift, not a verdict.">(${esc(r.substrate.carriedBy.map(c => `${c.name} ${c.delta > 0 ? "+" : ""}${c.delta}`).join(", "))})</span>` : "";
      // CCODE-30: this line is CRAFT STRENGTH (the % of full power the craft ran at, set by the lattice density),
      // NOT the success roll and NOT spectral fit — so it points to roll.substrate, its own explanation.
      const subBit = r.substrate ? `<div class="roll-affinity">${r.substrate.side === "starved" ? "the lattice is thin — your craft ran at" : "the lattice crowds your signal — your craft ran at"} ${r.substrate.percent}%${carriedBit} ${infoDot("roll.substrate")}</div>` : "";
      // SNG-084 Ph2: one contextual ⓘ on the roll — why it was hard (novel), suddenly easy (discovery), or the d100-vs-chance basics.
      const rollHelp = r.action?.novel ? infoDot("roll.novel") : (r.usedDiscovery || r.action?.discoveryBonus) ? infoDot("roll.discovery") : infoDot("roll.difficulty");
      // SNG-106: the chance is tappable → the full component breakdown (only when this turn retained one).
      const chanceCell = r.breakdown ? `<span class="roll-chance" data-breakdown="${attrJson({ ...r.breakdown, roll: r.roll, degree: r.degree, ...(r.crit ? { crit: r.crit, critRoll: r.critRoll, critText: r.critText } : {}) })}" tabindex="0" role="button" title="Why this number?">${r.chance}</span>` : `${r.chance}`;
      main += `<div class="roll-receipt">d100: ${r.roll} vs ${chanceCell} — <span class="${r.degree}">${r.degree.replace("_", " ")}</span> ${rollHelp}${helpers}${intBit}</div>${locBits}${subBit}${blBit}`;
      // SNG-246 Fix D: the encounter's mechanical receipt line — the round result SHOWN (not inferred from
      // prose). SNG-252 §2b: it renders here only when the encounter has ENDED. While one is live the ribbon
      // owns it (persisted as state._lastReceipt), because "fold it IN, not floating" is the whole point of
      // the one container — printing it in both places would put the same readout inside and outside the box.
      if (r.encReceiptLine && !activeEnc()) main += `<div class="enc-receipt">${esc(r.encReceiptLine)}</div>`;
    }
  }
  if (opts.itemsAdvanced?.length) main += opts.itemsAdvanced.map(a => `<div class="beat item-woke">✦ ${esc(a.itemName)} stirs — <em>${esc(a.stageName)}</em></div>`).join("");
  if (opts.thinking) main += `<div class="thinking">${esc(opts.thinking)}</div>`;
  if (opts.aside) main += `<div class="beat"><em>${opts.aside.split("\n").map(esc).join("<br>")}</em></div>`;
  if (opts.gmAside) main += `<div class="gm-aside">${opts.gmAside.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
  // SNG-122: the safety net — a travel intent that didn't move the player gets a one-tap "arrive" so
  // narrative travel and map travel converge on one path and the player is never stranded.
  // SNG-145: a pending INTENT GATE renders as an inline choice card — the act is in escrow and
  // nothing commits until answered. Reload-safe (persisted on character); other inputs decline
  // politely while it stands. The default (gentle) option is marked.
  if (character?._pendingIntent) {
    const g = character._pendingIntent;
    main += `<div class="intent-card" style="border:1px solid var(--accent,#c9a227);border-radius:8px;padding:12px;margin:8px 0">
      <div style="font-weight:600;margin-bottom:4px">⚖ A moment of intent</div>
      <div>${esc(g.act)}</div>${g.cost ? `<div class="hint" style="margin-top:4px">${esc(g.cost)}</div>` : ""}
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">${g.options.map(o =>
        `<button class="btn${o.id === g.default ? " secondary" : ""}" data-intentopt="${esc(o.id)}">${esc(o.label)}${o.id === g.default ? " ·" : ""}</button>`).join("")}
      </div></div>`;
  }
  // SNG-145 trigger 3: a world-scale consequence that would reach ANOTHER player waits for confirm.
  if (character?._pendingLedger?.length) {
    const ev = character._pendingLedger[0];
    main += `<div class="intent-card" style="border:1px dashed var(--accent,#c9a227);border-radius:8px;padding:10px;margin:8px 0">
      <div style="font-weight:600">🌍 This would reach beyond you</div>
      <div class="hint">${esc(ev.what)} — this consequence would surface in another player's world.</div>
      <div style="margin-top:6px;display:flex;gap:8px"><button class="btn" id="ledger-send">Let it travel</button>
      <button class="btn secondary" id="ledger-hold">Keep it local ·</button></div></div>`;
  }
  if (character?._pendingArrival) {
    const p = character._pendingArrival;
    main += `<div class="arrive-banner">You're on your way to <strong>${esc(p.name)}</strong>. <button class="btn arrive-btn" id="do-arrive">→ Arrive at ${esc(p.name)}</button></div>`;
  }
  if (opts.error) main += `<div class="error-card">The GM stumbled: ${esc(opts.error)}<br><button class="btn" id="retry" style="margin-top:8px">Try again</button></div>`;

  if (turn) {
    // SNG-155: the speak control belongs ON THE BEAT — it reads THIS narration, so it sits with it.
    // It was in the Map & Rest sidebar, nowhere near the prose it speaks: the same mistake as the
    // ⭐ in CCODE-06, putting the control next to the plumbing instead of next to the thing it acts on.
    // SNG-252b §2b: the ribbon may already have claimed this beat — when an encounter is live the SCENE
    // leads the ribbon. Rendered here only when it did not, so the prose appears exactly once.
    if (!beatPlacedInRibbon) main += beatHtml;
    if (turn.momentArt) main += `<div class="moment-art"><img src="${esc(turn.momentArt)}" alt="${esc(turn.sceneSummary || "a moment")}" data-lightbox="moment" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`; // SNG-035/053
    // SNG-168 §2: post THIS turn to the family feed — the value is the CHOOSING (a moment you loved), never
    // automatic. Only when family-sync is on (a shared feed needs the shared repo). Not canon — a scrapbook post.
    if (syncEnabled() && turn.narration) main += `<div class="turn-post"><button class="opt" id="post-to-feed" title="Share this moment with the family — it appears in their feed, lensed to their rating. Not canon: it never changes anyone's game.">📮 Post to feed</button></div>`;
    // SNG-242 §5c: re-tell THIS beat beautifully — same events, richer prose. State-safe (reads the committed
    // outcome, never re-rolls). Shown when there's real narration + a key (not on a degraded/opless beat).
    if (getApiKey() && turn.narration && !opts.degraded && !turn._retold) main += `<div class="turn-retell"><button class="opt" id="retell-rich" title="Re-tell this beat beautifully — the same events, a fuller telling. It never changes what happened.">✦ Tell it again, richer</button></div>`;
    if (opts.degraded) main += `<div class="degraded-note">(${esc(turn._opNote || "The GM's structured reply failed — plain narration mode this turn.")})</div>`;
    // CCODE-44: the pre-fight READ — how hard, and why. Sits directly above stand-and-fight / back-away, because
    // it exists to make that choice a decision rather than a coin flip.
    if (turn._appraisal) {
      const _a = turn._appraisal;
      const _rc = r => r === "high" ? "worse" : r === "low" ? "better" : "even";
      main += `<div class="appraise">
        <div class="appraise-top"><span class="appraise-title">⚖ Sizing them up</span><span class="appraise-threat appraise-${esc(_a.threat)}">${esc(_a.threat)} threat</span></div>
        ${_a.lines.map(l => `<div class="appraise-line ${_rc(l.rel)}">${esc(l.text)}</div>`).join("")}
        <div class="appraise-line">They are <strong>${esc(_a.disposition)}</strong></div>
        <div class="appraise-counsel">${esc(_a.counsel)}</div>
      </div>`;
    }
    // SNG-246 (Erik: "the encounter should remove most of the normal actions… keep the ask the GM"): during a
    // SKILL BATTLE the fight IS the option set (skillBattlePanel below) — the GM's stale story-choices are
    // suppressed so they don't sit under the moves. Ask-GM + the free-type field stay.
    if (activeEnc()?.state?.mode !== "skill_battle") {
    turn.choices = lethalOfferClamp(turn.choices, { ...(CONTENT.encounters || {}), ...(character.customEncounters || {}) }, CONTENT.rules);
    for (const c of turn.choices || []) {
      if (c.emergenceId && !validEmergenceId(character, CONTENT.emergence, CONTENT.rules, c.emergenceId)) c.emergenceId = null;
    }
    main += `<div class="choices">${(turn.choices || []).map((c, i) => {
      let senseHtml = "", abilityHtml = "";
      const action = { label: c.label, attribute: c.attribute || "practical", axes: c.axes || {}, difficulty: c.difficulty || 0, tags: c.intentTags || [], abilityLevel: 0, planned: (c.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)) };
      if (c.abilityId && character.abilities.some(a => a.abilityId === c.abilityId)) {
        action.abilityLevel = character.abilities.find(a => a.abilityId === c.abilityId).level;
        abilityHtml = `<span class="ability-tag"> ✦ ${esc(fullCatalog()[c.abilityId]?.name || c.abilityId)}</span>`;
      }
      if (c.trivial && !c.abilityId) {
        senseHtml = `<span class="sense trivial-tag">no roll — just do it</span>`;
      } else {
        action.subAttribute = SUBS.includes(c.subAttribute) ? c.subAttribute : null;
        const equip = equipmentBonus(character, action.tags, rules);
        const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.tags, rules, character);
        const aff = affinityFor(action, location);
        // SNG-116: the preview must include the SAME substrate penalty the resolve path applies — else "how
        // hard" assumes a full lattice and reads easy on thin ground where the real roll is hard.
        const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus, substratePenalty: substratePenaltyFor(c, location) });
        const sense = senseAction({ character, action, location, rules, aptitudeMods: mods }, chance);
        if (sense.text) senseHtml = `<span class="sense">${esc(sense.text)}</span>`;
      }
      // SNG-015 Part B: fast tap = auto intensity + default ability; ⚙ expand-to-tune
      const canTune = !(c.trivial && !c.abilityId) && !c.encounterId && !c.emergenceId;
      const gear = canTune ? `<button class="tune-toggle" data-tune="${i}" title="Tune which ability + how hard (Conserve / Standard / Surge)">⚙</button>` : "";
      let panel = "";
      if (canTune && tuneOpen === i) {
        const owned = character.abilities.map(a => fullCatalog()[a.abilityId]).filter(Boolean);
        const sel = tuneSel.abilityId;
        const abChips = [`<button class="tune-ab ${!sel ? "sel" : ""}" data-tuneab="">raw (no ability)</button>`]
          .concat(owned.map(ab => `<button class="tune-ab ${sel === ab.id ? "sel" : ""}" data-tuneab="${esc(ab.id)}">${esc(ab.name)}</button>`)).join("");
        const baseCost = sel ? effectiveEnergyCost(fullCatalog()[sel], character, rules) : 0;
        const intBtns = intensityOptions(baseCost, CONTENT.intensity).map(o =>
          `<button class="tune-int intensity-${o.key} ${tuneSel.intensity === o.key ? "sel" : ""}" data-tunint="${o.key}">${o.label}${sel ? ` · ${o.energy}e` : ""}${o.warn ? " ⚠" : ""}</button>`).join("");
        panel = `<div class="tune-panel"><div class="tune-row"><span class="tune-lbl">Apply</span>${abChips}</div>` +
          `<div class="tune-row"><span class="tune-lbl">Intensity</span>${intBtns}</div>` +
          (tuneSel.intensity === "surge" ? `<div class="tune-warn">⚡ Surge amplifies the effect but can backlash — the cost scales with the ability's Tier.</div>` : "") +
          `<button class="tune-commit" data-tunecommit="${i}">Commit — ${esc(tuneSel.intensity)}${sel ? " " + esc(fullCatalog()[sel]?.name || sel) : ""}</button></div>`;
      }
      return `<div class="choice-wrap"><button class="choice" data-choice="${i}">${esc(c.label)}${abilityHtml}${senseHtml}</button>${gear}${panel}</div>`;
    }).join("")}</div>`;
    } // end skill-battle choice suppression (SNG-246)
    // SNG-236 UX: the encounter's action buttons (flee/yield/attempt/stage/unlock/walk-away) NO LONGER render
    // as loose buttons here — they moved into the ⚙ Moves gear on the input row (encounterMovesPanel), grouped
    // with the player's ability-moves (ward/sense/strike by function family). The frame itself renders as the
    // integrated top strip above. The player still describes any move in the free-type field; the encounter
    // rules bind either way (onChoice/onFreeform route through duelRound/challengeStage/puzzleAttempt on an
    // active encounter). This is Erik's ask: obviously in an encounter, moves grouped in the gear, not clunky.
  }
  main += `</div>`;
  if (turn || opts.error || opts.gmAside || opts.aside || (!busy && !opts.thinking)) {
    // SNG-031: surface the (fully-built) gambit system on genuinely plan-apt turns
    const apt = !askMode && isGambitApt(turn) && !gambitHintDismissed && gambitHintCooldown <= 0;
    if (apt) {
      main += `<div class="gambit-hint"><span>This looks like a job for a plan.</span>
        <button class="opt" id="gambit-hint-go">⚙ Plan a Gambit</button>
        <button class="gambit-hint-x" id="gambit-hint-x" title="Not now">×</button></div>`;
    }
    // SNG-236 UX: while an encounter is live, the ⚙ Moves gear opens the grouped move palette above the input.
    // SNG-246 BUG1: a SKILL BATTLE renders its structured controls (fog/intensity/skills/read/break/yield) HERE,
    // in the play surface — no separate screen. It's always shown (the fight IS the option set), not gear-gated.
    // SNG-252 §2b: BOTH sibling appends are gone — the moves panel AND the skill-battle panel now render
    // INSIDE the encounter ribbon at the top of the play surface, so nothing about an engaged encounter lives
    // outside its one border. Erik's ask was the whole encounter in one container, and for a fight or a
    // standoff the skill-battle panel IS the action choices; leaving it here would have left the commonest
    // kinds exactly as split as before.
    main += `<div class="freeform">
      <div class="mode-chips">
        <button id="mode-act" class="mode-chip ${askMode ? "" : "active"}" title="Act in the scene">Act</button>
        <button id="mode-ask" class="mode-chip ${askMode ? "active" : ""}" title="Ask the GM out-of-character — context, rules, what your character would know. Never advances the story.">Ask GM</button>
      </div>
      <input id="freeform-input" placeholder="${activeEnc() && !askMode ? "Describe your move — the encounter's rules bind it…" : askMode ? "Ask the GM anything — context, rules, what you'd know…" : "Or do something else — describe it…"}" ${busy ? "disabled" : ""}>
      <button id="freeform-go" ${busy ? "disabled" : ""}>${askMode ? "Ask" : "Act"}</button>
      ${activeEnc() && activeEnc().state?.mode !== "skill_battle" ? `<button id="moves-open" class="mode-toggle ${movesOpen ? "apt" : ""}" title="Encounter moves — grouped by family (ward / sense / strike …) + the ways out. Rules enforced." ${busy ? "disabled" : ""}>⚙ Moves</button>` : ""}
      ${profile?.narrationTier !== "rich" ? `<button id="rich-toggle" class="mode-toggle ${_richNextTurn ? "apt" : ""}" title="Tell THIS next beat richly — a fuller, more vivid telling (SNG-242). One beat; set your default in Settings." ${busy ? "disabled" : ""}>✦ Rich</button>` : ""}
      <button id="gambit-open" class="mode-toggle ${apt ? "apt" : ""}" title="Plan a multi-step gambit" ${busy ? "disabled" : ""}>⚙ Plan</button></div>`;
  }
  if (isDev()) {
    const flavors = ["beneficial", "benign", "beautiful", "dangerous", "theft", "chase", "fight"];
    main += `<div class="dev-panel"><div class="dev-title">🔧 Test encounters (dev only)</div><div class="dev-btns">${
      flavors.map(f => `<button class="dev-fire" data-fire="${f}">${f}</button>`).join("")
    }<button class="dev-fire" data-fire-aggro="fight" title="SNG-246: fire a fight as the AGGRESSOR — the engage button reads 'Press the attack', not 'stand and meet it'">⚔ attack (you start it)</button></div><div class="dev-hint">Fires the flavor here (danger gate bypassed for testing). Fight/chase/dangerous show a decline/flee choice before anything starts. <b>⚔ attack</b> frames YOU as the aggressor. Each combat round now writes a receipt + machine-tab log (🔬 Machine → Combat rounds → Copy).</div></div>`;
  }
  main += `</div>`;

  chrome(`<div class="layout">${sheet}${main}</div>`);

  if (turn) {
    for (const btn of app.querySelectorAll("[data-choice]")) {
      btn.onclick = () => onChoice(turn.choices[parseInt(btn.dataset.choice)]);
    }
    // SNG-015 Part B: tune panel (ability + intensity) — re-renders to reflect selection
    for (const btn of app.querySelectorAll("[data-tune]")) btn.onclick = (e) => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.tune);
      if (tuneOpen === i) { tuneOpen = null; }
      else { tuneOpen = i; const c = turn.choices[i]; tuneSel = { abilityId: c.abilityId || undefined, intensity: "standard" }; }
      renderPlay(turn, opts);
    };
    for (const btn of app.querySelectorAll("[data-tuneab]")) btn.onclick = () => { tuneSel.abilityId = btn.dataset.tuneab || undefined; renderPlay(turn, opts); };
    for (const btn of app.querySelectorAll("[data-tunint]")) btn.onclick = () => { tuneSel.intensity = btn.dataset.tunint; renderPlay(turn, opts); };
    for (const btn of app.querySelectorAll("[data-tunecommit]")) btn.onclick = () => {
      const c = turn.choices[parseInt(btn.dataset.tunecommit)];
      const merged = { ...c, abilityId: tuneSel.abilityId || null, intensity: tuneSel.intensity };
      if (!tuneSel.abilityId) merged.comboAbilities = c.comboAbilities; // raw keeps any combo intent
      tuneOpen = null;
      onChoice(merged);
    };
  }
  for (const btn of app.querySelectorAll("[data-encact]")) {
    btn.onclick = () => {
      const e = activeEnc(); if (!e) return;
      const d = e.def, act = btn.dataset.encact;
      if (act === "flee") onChoice({ label: "Break away and flee", attribute: "physical", subAttribute: "agility", axes: {}, difficulty: 0, intentTags: ["retreat", "risky"], encounterAction: "flee" });
      else if (act === "yield") onChoice({ label: "Yield", trivial: false, attribute: "social", subAttribute: "presence", axes: {}, difficulty: 0, intentTags: ["careful"], encounterAction: "yield" });
      else if (act === "abandon") onChoice({ label: "Abandon the attempt", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["retreat", "careful"], encounterAction: "abandon" });
      else if (act === "walkAway") onChoice({ label: "Walk away from the puzzle", attribute: "mental", subAttribute: "reason", axes: {}, difficulty: 0, intentTags: ["careful"], encounterAction: "walkAway" });
      else if (act === "stage") { const st = d.stages[e.state.stageIndex]; onChoice({ label: `Attempt: ${st.name}`, attribute: st.attribute, subAttribute: st.subAttribute, axes: st.axes || {}, difficulty: 0, intentTags: ["risky"] }); }
      else if (act === "attempt") onChoice({ label: "Work the mechanism", attribute: d.attribute || "mental", subAttribute: d.subAttribute, axes: d.axes || {}, difficulty: 0, intentTags: ["study", "analyze"] });
      else if (act === "unlock") { const u = puzzleUnlocks(d, character)[+btn.dataset.unlock]; if (u) onChoice({ label: u.note.slice(0, 80), attribute: d.attribute || "mental", subAttribute: d.subAttribute, axes: d.axes || {}, difficulty: -(u.difficultyBonus || 10), intentTags: ["study", "analyze"] }); }
    };
  }
  for (const btn of app.querySelectorAll("[data-travel]")) btn.onclick = () => travelTo(btn.dataset.travel);
  for (const btn of app.querySelectorAll("[data-fire]")) btn.onclick = () => { if (!busy) fireEncounter(btn.dataset.fire, { dev: true }); };
  for (const btn of app.querySelectorAll("[data-fire-aggro]")) btn.onclick = () => { if (!busy) fireEncounter(btn.dataset.fireAggro, { dev: true, aggressor: true }); };
  for (const btn of app.querySelectorAll("[data-join]")) btn.onclick = async () => {
    if (busy) return;
    const c = CONTENT.companions[btn.dataset.join];
    character.companions = [...(character.companions || []), c.id];
    // SNG-200 §4: a companion joins the codex the moment they join you (the person half of "who you met").
    try { applyCodexUpdates(character, [companionCodexUpdate(c, { stage: 1 })], { day: (() => { try { return readClock(character.clock).day; } catch { return null; } })() }); } catch { /* mirror only */ }
    saveCharacter(character);
    renderPlay(null, { thinking: `${c.name} arrives…` });
    const result = await runGM({ resolution: null, playerInput: `(${c.name} has just joined the character as a traveling companion. Introduce them into the current scene naturally — their arrival, how they read the situation — then continue the scene.)` });
    if (result) renderPlay(result.turn, { degraded: result.degraded });
  };
  for (const btn of app.querySelectorAll("[data-part]")) btn.onclick = () => {
    const c = CONTENT.companions[btn.dataset.part];
    if (!confirm(`Part ways with ${character.companionNames?.[c.id] || c.name}?`)) return;
    character.companions = character.companions.filter(id => id !== c.id);
    if (character.companionBonds) delete character.companionBonds[c.id]; // SNG-126: clean part-ways — no orphan bond/name state
    if (character.companionNames) delete character.companionNames[c.id];
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${character.companionNames?.[c.id] || c.name} drifts on — for now.` });
  };
  // SNG-126: recruit a strong-bonded present NPC into your company (roles from their authored record),
  // and part ways with a recruited ally. partner is bond-derived (SNG-108), never set here.
  for (const btn of app.querySelectorAll("[data-recruit]")) btn.onclick = () => {
    const id = btn.dataset.recruit; const cat = CONTENT.npcs[id] || {}; const nm = character.npcRegistry?.[id]?.name || cat.name || "They";
    if (!confirm(`Ask ${nm} to travel with you?`)) return;
    recruit(character, id, { roles: offeredRoles(cat), teaches: cat.teaches || null, liaisonFor: cat.liaisonFor || null, day: absoluteWorldDay() });
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} joins your company${cat.teaches ? ` — they can teach you the ${traditionLabel(cat.teaches)} craft` : ""}${cat.liaisonFor ? `, and speak for you among their people` : ""}.` });
  };
  for (const btn of app.querySelectorAll("[data-partally]")) btn.onclick = () => {
    const id = btn.dataset.partally; const nm = character.npcRegistry?.[id]?.name || "They";
    if (!confirm(`Part ways with ${nm}?`)) return;
    partCompany(character, id);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} parts from your company — the road may cross again.` });
  };
  // SNG-057: rename a companion (the GM + portraits use the chosen name)
  for (const btn of app.querySelectorAll("[data-rename]")) btn.onclick = () => {
    const id = btn.dataset.rename; const c = CONTENT.companions[id]; if (!c) return;
    const next = prompt(`What do you call ${c.name}?`, character.companionNames?.[id] || c.name);
    if (next === null) return;
    character.companionNames = character.companionNames || {};
    if (next.trim() && next.trim() !== c.name) character.companionNames[id] = next.trim(); else delete character.companionNames[id];
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  for (const btn of app.querySelectorAll("[data-examine]")) btn.onclick = () => {
    examinedItem = examinedItem === btn.dataset.examine ? null : btn.dataset.examine;
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  // SNG-114: the play sidebar's item use/name/drop go through the ONE shared binding (parity with the popup).
  bindItemCardHandlers(() => renderPlay(character.activeScene?.lastTurn || null, {}));
  for (const b of app.querySelectorAll("[data-setname]")) b.onclick = (e) => {
    e.stopPropagation();
    // CCODE-05: pre-fill with the current name so this also EXTENDS a partial one
    // ("Pell" → "Pell Ran Marsh"), not just names an unknown. The old empty prompt read as
    // "name this stranger" and gave no hint it could correct someone already named.
    const cur = character.npcRegistry?.[b.dataset.setname]?.name || "";
    const nn = prompt(`Their full name?\n\n(You can extend it — "Pell" → "Pell Ran Marsh". The old name is kept as an alias so the GM still recognises it.)`, cur);
    if (nn && setNpcName(character, b.dataset.setname, nn, readClock(character.clock).day)) { saveCharacter(character); renderPlay(character.activeScene?.lastTurn || null, {}); }
  };
  // CCODE-05: "this is the same person as…" — the merge only the PLAYER can make. Auto-merge matches
  // on NAME, so it can never know "Broad Opportunist" and "Bren Thalle" are one man; nothing in the
  // text says so. Reuses the audited mergeEntity op (history/facts/skills unioned, best standing
  // kept, the absorbed name retained as an alias, logged + reversible in the Repair panel).
  for (const b of app.querySelectorAll("[data-mergenpc]")) b.onclick = (e) => {
    e.stopPropagation();
    const fromId = b.dataset.mergenpc;
    const reg = character.npcRegistry || {};
    const from = reg[fromId];
    if (!from) return;
    const others = Object.entries(reg).filter(([id]) => id !== fromId);
    if (!others.length) { alert("There's no one else you know to merge them with yet."); return; }
    const listed = others.map(([id, n], i) => `${i + 1}. ${n.name}`).join("\n");
    const pick = prompt(`"${from.name}" is really the same person as which of these?\n\n${listed}\n\nType the number. Their records combine; the kept name is the one you choose.`);
    const idx = Number(pick) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= others.length) return;
    const intoId = others[idx][0];
    const r = applyStateOps(character, [{ op: "mergeEntity", fromId, intoId, why: `player: same person (${from.name} → ${others[idx][1].name})` }], {
      backgrounds: CONTENT.backgrounds || [], traditionIndex: CONTENT.traditionIndex, locations: CONTENT.locations,
      resolveLocationId, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString()
    });
    saveCharacter(character);
    const ok = r.applied.length > 0;
    renderPlay(character.activeScene?.lastTurn || null, { aside: ok ? `Merged — ${from.name} and ${others[idx][1].name} are one person now.` : (r.refused?.[0]?.reason || "Couldn't merge those two.") });
  };
  for (const d of app.querySelectorAll("[data-npcgroup]")) d.ontoggle = () => {
    const k = d.dataset.npcgroup;
    if (d.open) { npcGroupsOpen.add(k); npcGroupsClosed.delete(k); }
    else { npcGroupsOpen.delete(k); npcGroupsClosed.add(k); }
  };
  // SNG-120: persist each sidebar section's open/closed state across turns + reloads (on the profile).
  for (const d of app.querySelectorAll("details.sidebar-sec[data-sec]")) d.ontoggle = () => {
    const k = d.dataset.sec;
    if (d.open) { sidebarOpen.add(k); sidebarClosed.delete(k); } else { sidebarOpen.delete(k); sidebarClosed.add(k); }
    saveSidebarState();
  };
  const moreBtn = document.getElementById("open-inventory-more"); if (moreBtn) moreBtn.onclick = () => renderInventoryScreen(); // SNG-121
  // (SNG-114: item name/drop now bound via bindItemCardHandlers above — the duplicated data-nameit/data-drop wiring is gone.)
  const endSceneBtn = document.getElementById("do-endscene"); if (endSceneBtn) endSceneBtn.onclick = () => endSceneNow(); // CCODE-03
  const speakBtn = document.getElementById("do-speak"); if (speakBtn) speakBtn.onclick = () => toggleSpeakTurn(turn); // SNG-155: speaks the DISPLAYED beat
  const restBtn = document.getElementById("do-rest"); if (restBtn) restBtn.onclick = () => rest("sleep");
  const breatherBtn = document.getElementById("do-breather"); if (breatherBtn) breatherBtn.onclick = () => rest("breather");
  const mapBtn = document.getElementById("open-map"); if (mapBtn) mapBtn.onclick = () => renderMap();
  const arriveBtn = document.getElementById("do-arrive"); if (arriveBtn) arriveBtn.onclick = () => arriveAtPending(); // SNG-122
  for (const b of app.querySelectorAll("[data-intentopt]")) b.onclick = () => answerIntent(b.dataset.intentopt); // SNG-145
  const lSend = document.getElementById("ledger-send"); if (lSend) lSend.onclick = () => answerLedger(true);
  const lHold = document.getElementById("ledger-hold"); if (lHold) lHold.onclick = () => answerLedger(false);
  for (const b of app.querySelectorAll("[data-quest]")) b.onclick = () => renderQuestDetail(b.dataset.quest);
  const qlBtn = document.getElementById("open-questlog"); if (qlBtn) qlBtn.onclick = () => renderQuestLog();
  const codexBtn = document.getElementById("open-codex"); if (codexBtn) codexBtn.onclick = () => renderCodexScreen();
  const libBtn = document.getElementById("open-library"); if (libBtn) libBtn.onclick = () => renderLibrary();
  const charBtn = document.getElementById("open-character"); if (charBtn) charBtn.onclick = () => renderCharacterScreen();
  const luBtn = document.getElementById("sidebar-levelup"); if (luBtn) luBtn.onclick = () => renderLevelUp();
  const invBtn = document.getElementById("open-inventory"); if (invBtn) invBtn.onclick = () => renderInventoryScreen();
  const feedNav = document.getElementById("open-feed"); if (feedNav) feedNav.onclick = () => renderFeed();
  const postBtn = document.getElementById("post-to-feed"); if (postBtn) postBtn.onclick = () => postTurnToFeed(turn); // SNG-168 §2
  // SNG-242 §5: arm the NEXT beat for a rich telling (one-shot; consumed in runGM).
  const richTgl = document.getElementById("rich-toggle"); if (richTgl) richTgl.onclick = () => { _richNextTurn = !_richNextTurn; renderPlay(turn, opts); };
  // SNG-242 §5c: re-tell THIS beat richer — state-safe (prose only; the committed outcome/ops are untouched).
  const retellBtn = document.getElementById("retell-rich");
  if (retellBtn) retellBtn.onclick = async () => {
    if (busy) return;
    retellBtn.disabled = true; retellBtn.textContent = "✦ Retelling…";
    try {
      const richer = await reNarrateRich(turn.narration, { ratingLine: ratingLineForGM() });
      if (richer) {
        turn.narration = richer; turn._retold = true;
        if (character.activeScene && character.activeScene.lastTurn === turn) { try { saveCharacter(character); } catch { /* display-only enrich */ } }
        renderPlay(turn, opts);
      } else { retellBtn.disabled = false; retellBtn.textContent = "✦ Tell it again, richer"; }
    } catch { retellBtn.disabled = false; retellBtn.textContent = "✦ Tell it again, richer"; }
  };
  const ff = document.getElementById("freeform-input");
  const go = document.getElementById("freeform-go");
  const setMode = (mode) => {
    if (askMode === mode) return;
    askMode = mode;
    const val = ff?.value || "";
    renderPlay(turn || character.activeScene?.lastTurn || null, { ...opts, thinking: null });
    const ff2 = document.getElementById("freeform-input");
    if (ff2) { ff2.value = val; ff2.focus(); }
  };
  const actBtn = document.getElementById("mode-act");
  const askBtn = document.getElementById("mode-ask");
  if (actBtn) actBtn.onclick = () => setMode(false);
  if (askBtn) askBtn.onclick = () => setMode(true);
  if (ff && go) {
    if (opts.error && lastPlayerText) ff.value = lastPlayerText; // never lose what they wrote
    const submit = () => askMode ? onAsk(ff.value) : onFreeform(ff.value);
    go.onclick = submit;
    ff.onkeydown = e => { if (e.key === "Enter") submit(); };
  }
  for (const b of app.querySelectorAll("[data-grow]")) b.onclick = () => {
    if (spendSubPoint(character, b.dataset.grow, CONTENT.rules)) { saveCharacter(character); renderPlay(turn || character.activeScene?.lastTurn || null, {}); }
  };
  // ability-arch v2: no rank-up handlers in the play ability panel — depth is earned through use
  // (rank 2 auto) and a GM-marked defining moment (rank 3), not bought here.
  for (const b of app.querySelectorAll("[data-learn]")) b.onclick = () => {
    const free = aspirationRipe(character, b.dataset.learn, CONTENT.rules);
    const r = learnAbility(character, b.dataset.learn, fullCatalog(), CONTENT.rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) {
      if (free) dropAspiration(character, b.dataset.learn);
      saveCharacter(character);
      renderPlay(turn || character.activeScene?.lastTurn || null, { aside: `You ${free ? "have practiced your way into" : "begin learning"} ${fullCatalog()[b.dataset.learn]?.name}${free ? " — no point spent" : ""}.` });
    } else alert(r.why);
  };
  const findBtn = document.getElementById("party-find");
  if (findBtn) findBtn.onclick = async () => {
    findBtn.textContent = "Looking…";
    const scenes = await listScenesAt(character.currentLocationId);
    const open = scenes.find(sc => !sc.party.some(m => m.characterId === character.id));
    if (open && confirm(`Join ${open.party.map(m => m.name).join(", ")} in their scene?`)) joinPartyScene(open.sceneId);
    else if (confirm("No party found here. Start a shared scene others can join?")) startPartyScene();
    else renderPlay(character.activeScene?.lastTurn || null, {});
  };
  const leaveBtn = document.getElementById("party-leave");
  if (leaveBtn) leaveBtn.onclick = () => leavePartyScene();
  // turn gate: not your turn → choices and Act wait (Ask GM stays open)
  if (sharedScene && !isMyTurn(sharedScene, character.id)) {
    for (const b of app.querySelectorAll("[data-choice], [data-encact], #gambit-open")) b.disabled = true;
    const goBtn = document.getElementById("freeform-go");
    if (goBtn && !askMode) goBtn.disabled = true;
  }
  const gambitBtn = document.getElementById("gambit-open");
  if (gambitBtn) gambitBtn.onclick = () => openGambitBuilder();
  // SNG-236 UX: the ⚙ Moves gear — toggle the grouped move palette; an ability-move fires through onFreeform
  // (parseIntent derives the roll params; the active encounter's rules bind), the exits/primary via [data-encact].
  const movesBtn = document.getElementById("moves-open");
  if (movesBtn) movesBtn.onclick = () => { movesOpen = !movesOpen; renderPlay(turn, opts); };
  // SNG-252 §2b: the ⚙ INSIDE the ribbon collapses/expands the moves in place — same state as the input-row
  // gear, so the two controls can never disagree about whether the moves are showing.
  const movesInBtn = document.getElementById("enc-moves-toggle");
  if (movesInBtn) movesInBtn.onclick = () => { movesOpen = !movesOpen; renderPlay(turn, opts); };
  wireSkillBattlePanel(); // SNG-246 BUG1: wire the in-place skill-battle controls when a skill battle is active (no-op otherwise)
  for (const btn of app.querySelectorAll("[data-moveab]")) btn.onclick = () => {
    if (busy) return;
    const ab = fullCatalog()[btn.dataset.moveab];
    // SNG-252 §2c: the ribbon stays OPEN — picking a move should not collapse the encounter you are still in.
    onFreeform(`I use ${ab?.name || "my craft"} to ${btn.dataset.verb || "act"}.`);
  };
  const ghGo = document.getElementById("gambit-hint-go");
  if (ghGo) ghGo.onclick = () => openGambitBuilder();
  const ghX = document.getElementById("gambit-hint-x");
  if (ghX) ghX.onclick = () => { gambitHintDismissed = true; gambitHintCooldown = 4; renderPlay(turn, opts); }; // SNG-077: dismissal sticks + a cooldown
  const retry = document.getElementById("retry");
  if (retry) retry.onclick = () => startScene("(Retry the previous beat — pick up smoothly from where the story last stood.)");
}

// ---------- utils ----------

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
// SNG-247 (Erik: "the 'your roll...' clickable doesn't do anything"). `esc` does not escape the APOSTROPHE, and
// these payloads go into SINGLE-quoted attributes — so a craft named "Hunter's Strike" closed the attribute early,
// the JSON arrived truncated, JSON.parse threw, and the delegated handler's catch swallowed it. The pill rendered
// perfectly and did nothing, only for crafts with an apostrophe in the name — which is why it looked intermittent.
// Anything serialised INTO an attribute goes through this, never through esc.
function attrJson(v) { return esc(JSON.stringify(v)).replace(/'/g, "&#39;"); }

/** SNG-190 §5 / SNG-189 §1: coerce a scene summary to a safe string before it can reach the permanent
 *  chronicle. The model is asked for a string; when it returns an object that still parses, `String(it)`
 *  is "[object Object]" — so we look inside for a text field first, and only then fall back to a clamp of
 *  the narration (the one durable half we still hold). Returns null when nothing usable survives — the
 *  caller then records nothing rather than a placeholder for a scene that had no summary at all. */
function coerceSceneSummary(value, narration) {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const inner = value.text || value.summary || value.sceneSummary;
    if (typeof inner === "string" && inner.trim()) return inner;
  }
  const fb = smartClamp(String(narration || "").trim(), 120);
  return fb || null;
}

/** SNG-BATCH-5 Phase 2: shared fork-choice modal. Renders the two paths; calls
 *  onPick(pathKey) after the player confirms. The caller locks the fork + ranks. */
function renderForkModal(abilityId, onPick) {
  const ab = fullCatalog()[abilityId];
  const f = CONTENT.branchForks?.forks?.[abilityId];
  if (!f) return;
  const paths = forkPaths(abilityId, CONTENT.branchForks);
  document.getElementById("fork-modal")?.remove();
  const el = document.createElement("div");
  el.id = "fork-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">${esc(ab?.name || abilityId)} — Rank ${f.atRank}: choose a path</div>` +
    `<div class="fork-prompt">${esc(f.prompt)}</div><div class="fork-paths">${paths.map(p =>
      `<button class="fork-path" data-forkpick="${esc(p.key)}"><div class="fp-name">${esc(p.name)}</div><div class="fp-grants">${esc(p.grants)}</div><div class="fp-cannot">△ ${esc(p.cannot)}</div></button>`).join("")}</div>` +
    `<div class="fork-warn">Permanent — the path you don't take locks forever for this ability.</div>` +
    `<button class="fork-cancel" id="fork-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  for (const btn of el.querySelectorAll("[data-forkpick]")) btn.onclick = () => {
    const key = btn.dataset.forkpick;
    if (!confirm(`Lock in "${f.paths[key].name}"? The other path is gone for good.`)) return;
    el.remove();
    onPick(key);
  };
  document.getElementById("fork-cancel").onclick = () => el.remove();
}

/** SNG-101: the promotion commit modal — the ONE place a promotion is applied. Names the foreclosure
 *  cost (Law 9), keeps-the-ground explicit, and only ever calls promote() on an eligible domain. */
function renderPromotionModal(domainKey) {
  const e = promotionEligible(character, domainKey, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
  if (!e.eligible) { renderCharacterScreen(); return; }
  const ROM = ["", "I", "II", "III", "IV", "V"];
  const newCeiling = e.to === "primary" ? 5 : 3;
  const anti = antipodeOf(e.trad, CONTENT.traditionIndex);
  const closesNew = domainKey === "tertiary" && anti && !(character.foreclosed || []).includes(anti); // secondary→primary antipode is already closed
  document.getElementById("promote-modal")?.remove();
  const el = document.createElement("div");
  el.id = "promote-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">Become ${esc(traditionLabel(e.trad))} as your ${e.to}?</div>` +
    `<div class="fork-prompt">This raises your ceiling in ${esc(traditionLabel(e.trad))} to <strong>Tier ${ROM[newCeiling]}</strong>.` +
    (closesNew ? ` It also <strong>closes ${esc(traditionLabel(anti))}</strong> to you by ordinary means — anything you've already learned of it you keep, and the braid road remains. This is a choice about who you're becoming.` : ` The far pole of that axis was already closed to you.`) + `</div>` +
    `<div class="fork-paths"><button class="fork-path" id="promote-commit"><div class="fp-name">Commit</div><div class="fp-grants">Rise into your ${e.to}.</div></button></div>` +
    `<button class="fork-cancel" id="promote-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  document.getElementById("promote-commit").onclick = () => {
    const r = promote(character, domainKey, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    el.remove();
    if (r.ok) { if (character.pendingPromotion === domainKey) character.pendingPromotion = null; saveCharacter(character); }
    renderCharacterScreen();
  };
  document.getElementById("promote-cancel").onclick = () => el.remove();
}

/** SNG-102: the acquisition commit modal — the ONE place a domain is acquired. Names the antipode-
 *  foreclosure cost (Law 9); only ever calls acquireDomain on an acquirable people. */
function renderAcquisitionModal(traditionId) {
  const a = acquirable(character, traditionId, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex });
  if (!a.ok) { renderCharacterScreen(); return; }
  const anti = antipodeOf(traditionId, CONTENT.traditionIndex);
  document.getElementById("acquire-modal")?.remove();
  const el = document.createElement("div");
  el.id = "acquire-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">Become of the ${esc(traditionLabel(traditionId))}?</div>` +
    `<div class="fork-prompt">You join them as a <strong>novice — Tier I</strong>, however great you are elsewhere; their craft grows by the same standing as any other.` +
    (anti ? ` This <strong>closes ${esc(traditionLabel(anti))}</strong> to you by ordinary means — the far pole of their axis; the braid road remains. Reach is earned one people at a time.` : "") + `</div>` +
    `<div class="fork-paths"><button class="fork-path" id="acquire-commit"><div class="fp-name">Join</div><div class="fp-grants">Enter the ${esc(traditionLabel(traditionId))} at Tier I.</div></button></div>` +
    `<button class="fork-cancel" id="acquire-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  document.getElementById("acquire-commit").onclick = () => {
    const r = acquireDomain(character, traditionId, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex });
    el.remove();
    if (r.ok) { if (character.pendingAcquisition === traditionId) character.pendingAcquisition = null; saveCharacter(character); }
    renderCharacterScreen();
  };
  document.getElementById("acquire-cancel").onclick = () => el.remove();
}

function rankOptsFor() { return { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, catalog: fullCatalog() }; }
function pct(v, max) { return Math.round((v / Math.max(1, max)) * 100); }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, v | 0)); }
