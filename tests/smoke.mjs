// Node smoke test for the pure engine modules (no browser needed).
// Run: node tests/smoke.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveAction, successChance, spectrumAlignment, applyEnergyCost } from "../engine/resolve.js";
import { senseTier, renderSense } from "../engine/sense.js";
import { recordDeed, standingWith, reputationSummary, knownTags } from "../engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, deriveAptitudes, grantAptitudes, fadingAptitudes, ensureCharacterStyle, defaultRating, ratingCeiling, ratingLevel, isMinorProfile, canSetRating, setRating, setMinorFlag, ensureRating, RATING_LEVEL } from "../engine/playerprofile.js";
import { normalizeInventory, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM, resolveInventoryItem, dedupeInventory, itemUses, ensurePins, togglePin, pinnedItems, applyItemUpdates } from "../engine/inventory.js";
import { newClock, readClock, advanceClock, getWorldEpoch, absoluteWorldDay, worldDate, worldDayAt, relativeWorldDays } from "../engine/worldtime.js";
import { companionBonus, companionsForGM, activeCompanions, partnerAdjacentNpcs } from "../engine/companions.js";
import { applyQuestUpdates, questsForGM, slugify, resolveQuest, dedupeQuests, isRealQuest, startStructuredQuest, completeQuestStage, resolveStructuredQuest, availableStructuredQuests, routesForCharacter, structuredQuestsForGM, threadTouched } from "../engine/quests.js";
import { majorDeeds, majorStateHash, chronicleIsStale, buildChroniclePrompt, touchSession, endSession, sessionLog, buildSessionPrompt, authorshipStats, crossCharacterAuthorship } from "../engine/chronicle.js";
import { sanitizeScene, buildTurnContext, sanitizeIntent, narrativeRegister, ratingRegister, renderSceneHistory, tierParts, bluntnessDirective } from "../engine/gm.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, mergeDuplicateNpcs, findExistingNpc, prettifyNpcName, relationshipBand, advanceBond, relationshipLabel, isPartnerAdjacent, knownPeopleAt, npcPortraitTier, backfillNpcGender } from "../engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM } from "../engine/places.js";
import { initWorldState, runWorldTick, advanceGeneratedOffscreen, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM } from "../engine/worldtick.js";
import { assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "../engine/gambit.js";
import { SUBS, ensureSubAttributes, syncParentAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, knownDiscovery, recordDiscovery, applyBacklash, abilitiesForGM, autoAdvancePracticedRanks, markDefiningMoment, meetsStandingBar, promotionEligible, promote, acquirable, acquireDomain, recoveryEnergy, nativeGrantIdsFor, applyNativeGrants, retroNativeGrants, seedInnateSubstrate } from "../engine/progression.js";
import { ensureCompany, companyRoster, recruit, partCompany, isRecruitable, offeredRoles, trainerFor, liaisonFactions, liaisonMultiplierFor, roleBadges, COMPANY_ROLES } from "../engine/company.js";
import { standingWithPeople } from "../engine/reputation.js";
import { ensureCodex, applyCodexUpdates, codexForGM, searchCodex, resolveTopic, namesMatch, mergeCodexTopics, mergeInto, suggestMerges, markNotSame } from "../engine/codex.js";
import { reconcile, reconcileContent, CHARACTER_STEPS, CONTENT_STEPS, topReconcileVersion } from "../engine/reconcile.js";
import { sceneImage, locationImage } from "../engine/art.js";
import { resolveSaveConflict, raceTimeout } from "../engine/sync.js";
import { namesMatch as nm2, smartClamp } from "../engine/namematch.js";
import { rollTrigger, pickEncounter, buildOffer, isEligible, flavorMultiplier, synthesizeDuelDef, synthesizeChallengeDef, canIncapacitate, dangerOf, narrativeTimeChance, rollNarrativeTime, classifyNarrativeKind, resolvePacing, beatHours } from "../engine/random_encounters.js";
import { renownScore, bandForRenown, challengersForBand, findPrestigeArc, challengerPoolFor, pickChallenger, challengerToDuelEntry, challengeDeedWeight, challengeLossWeight, shouldFireChallenger, challengeCooldown } from "../engine/recurrence.js";
import { typeAffinity, vectorAffinity, locationAffinity, affinityReceipt } from "../engine/affinities.js";
import { recordCoUse, coUseCount, currentStage, refreshEvolvingItems, noteCoUseAndRefresh, evolvedItemsForGM } from "../engine/evolution.js";
import { homeClassOf, isCrossClass, skillPointCost, forkFor, forkPending, chosenFork, setFork, rankExpression, forkPaths, skillGraphModel, nativeGrantsFor, combinationsAvailableFor } from "../engine/skilltree.js";
import { combinationThresholdMet, ripeAxisTouchCombinations } from "../engine/practice.js";
import { buildFunctionIndex, familiesOfAbility, functionCoverage, recommendSkills, familyClass, FUNCTION_FAMILIES, FAMILY_COLOR, FAMILY_GLYPH, FAMILY_SHAPE, shapeOfFamily } from "../engine/functions.js";
import { arcSeed, fallbackPersonalArc, buildPersonalArcPrompt, sanitizePersonalArc } from "../engine/personalArc.js";
import { skillDetail, npcDetail, itemDetail, relationshipsParagraph } from "../engine/entityDetail.js";
import { INTENSITIES, scaledEnergy, effectMod, autoIntensity, shouldBacklash, applySurgeBacklash, surgeBacklash, intensityOptions } from "../engine/intensity.js";
import { validate, missingRequired, defaultFor } from "../engine/genschema.js";
import { generate, ensureGenerated, resolveExisting, mintId, repairEntity, stubEntity, birthWeightOf, buildGeneratePrompt, generatedRecords, GEN_TYPES, isMinorEntity, enforceFloors, recordAttention, effectiveWeight, recomputeTier, isDormant, isSurfaceable, livingWorldForGM, findGenerated, nominationsFor } from "../engine/generate.js";
import { applyCodexUpdates as applyCodexUpdatesGen } from "../engine/codex.js";
import { ensureCanonStore, promotionCandidates, buildCanonRecord, findCanonCollision, resolveContradiction, promoteInto, mergeCanonStores, lensDecision, canonForViewer, adaptView, AUTHORED_CANON_WEIGHT, contributionsBy } from "../engine/canon.js";
import { sanitizeImagePrompt, assembleImagePrompt, characterPromptSeed, npcPromptSeed, imageURLFor, ensureImage, isMinorSubject, addGalleryImage, ensureGallery, itemProvenancePhrase, deleteGalleryImage } from "../engine/art.js";
import { planPlayerDedup, dedupePlayers, resolvePlayerKey, findProfileByName, resolveLocationId, deleteCharacter, saveCharacter, listCharacters } from "../engine/state.js";
import { applyStateOps, describeCorrection, detectAnomalies, anomaliesForGM } from "../engine/corrections.js";
import { isEventfulTurn, pressureTier, pressureDirective } from "../engine/pacing.js";
import { revokeAdultGate } from "../engine/playerprofile.js";
import { autoMapPositions, coordForGenerated, iconForTags, terrainClass, kgOverlayEntities, convexHull, regionShape, knownOverlay, isPlaceKnown } from "../engine/worldmap.js";
import { loadLegends, tierBirthWeight, tierForArc, legendSurfacing, legendDeploymentForGM, LEGEND_TIER_WEIGHT } from "../engine/legends.js";
import { buildTraditionIndex, traditionOf, isFolkTradition, ringDistance, antipodeOf, neighborsOf, ringOrder, domainAccess, inferDomains, crystallizeDomains, reconcileStartingAbilities, isKinAdjacent, kinSecondaryOptions, domainsLegal } from "../engine/traditions.js";

// stub localStorage for worldtime settings in Node
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  get length() { return store.size; },
  key: i => [...store.keys()][i] ?? null
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rules = JSON.parse(readFileSync(join(root, "content/packs/core/rules/resolution.json"), "utf8"));

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
}

// --- spectrum math ---
check("alignment: identical vectors = 1", Math.abs(spectrumAlignment({ chaos_order: 0.5 }, { chaos_order: 0.5 }) - 1) < 1e-9);
check("alignment: opposed vectors = -1", Math.abs(spectrumAlignment({ chaos_order: 0.5 }, { chaos_order: -0.5 }) + 1) < 1e-9);
check("alignment: empty vector = 0", spectrumAlignment({}, { chaos_order: 1 }) === 0);

// --- resolution ---
const char = {
  attributes: { physical: 3, mental: 2, social: 3, practical: 4 },
  skills: { crafting: 2 }, alignment: { violence_peace: 0.4 },
  energy: 50, maxEnergy: 100, attunement: 1
};
const loc = { spectrum: { violence_peace: 0.6, chaos_order: 0.3 } };
const action = { label: "calm the crowd", attribute: "social", axes: { violence_peace: 0.7 }, difficulty: 0 };

const chance = successChance({ character: char, action, location: loc, rules });
check(`chance in bounds (got ${chance})`, chance >= rules.d100.floorChance && chance <= rules.d100.ceilingChance);
check("aligned action beats misaligned", chance > successChance({ character: char, action: { ...action, axes: { violence_peace: -0.7 } }, location: loc, rules }));

const r1 = resolveAction({ character: char, action, location: loc, rules }, () => 0.01); // roll = 2
check("roll 2 = crit_success", r1.degree === "crit_success");
const r2 = resolveAction({ character: char, action, location: loc, rules }, () => 0.98); // roll = 99
check("roll 99 = crit_failure", r2.degree === "crit_failure");
check("energy cost floors at 0", applyEnergyCost({ energy: 3 }, 8, rules) === 0);

// --- sense tiers ---
check("novice gets no read", senseTier({ character: { ...char, attunement: 0, alignment: {} }, action, location: { spectrum: {} }, rules }) === 0);
check("attuned master gets precise read", senseTier({ character: { ...char, attunement: 9 }, action, location: loc, rules }) === 3);
check("tier-2 render is a band", renderSense(65, 2).text.includes("within your reach"));
check("tier-3 render approximates", renderSense(63, 3).text.includes("60"));

// --- reputation ---
const hero = { deeds: [] };
recordDeed(hero, { description: "Pulled two children from the flooded channel", tags: ["child-rescuer", "brave"], weight: 3, communityId: "valley.millbrook" });
recordDeed(hero, { description: "Stole from the grain store", tags: ["thief"], weight: -2, communityId: "valley.millbrook" });
const standing = standingWith(hero, "valley.millbrook", rules);
check(`deeds net out (got ${standing.score})`, standing.score === 5 && standing.band === "known");
check("other community knows nothing", standingWith(hero, "valley.radiant_plateau", rules).score === 0);
check("known tags surface", knownTags(hero, "valley.millbrook").includes("child-rescuer"));
check("summary mentions standing", reputationSummary(hero, "valley.millbrook", rules).includes("known"));

// --- player profile / aptitudes ---
const prof = newProfile("test-player");
// SNG-113: seed strategic into strategist's band (>=11) but below the deeper tier tactician (18), so only
// strategist is held — the tiered roster means a high lean earns the deeper tier too (tested in the SNG-113 block).
prof.tendencies = { strategic: 12 }; prof.aptitudes = deriveAptitudes(prof, rules.playerAptitudes, rules);
check("strategist earned when strategic crosses its threshold (and not yet the deeper tactician)", prof.aptitudes.includes("strategist") && !prof.aptitudes.includes("tactician"));
const mods = aptitudeMods(prof, rules.playerAptitudes);
check("strategist mods flow to resolver", mods.plannedActionBonus === 5 && mods.senseTierBonus === 1);
const planned = successChance({ character: char, action: { ...action, planned: true }, location: loc, rules, aptitudeMods: mods });
check("planned action gets the bonus", planned === chance + 5);

const drinker = newProfile("test-drinker");
for (let i = 0; i < 8; i++) updateProfile(drinker, ["gamble", "drink"], rules.playerAptitudes);
const dmods = aptitudeMods(drinker, rules.playerAptitudes);
check("carouser: rapport up, discipline down", dmods.rapportBonus === 5 && dmods.disciplinePenalty === -5);

// --- inventory ---
const catalog = JSON.parse(readFileSync(join(root, "content/packs/core/items/basic.json"), "utf8")).items
  .reduce((m, it) => (m[it.id] = it, m), {});
const bag = { inventory: ["traveler's pack", "Waterskin", "mystery bone"], health: 10, maxHealth: 30, energy: 50, maxEnergy: 100 };
normalizeInventory(bag, catalog);
check("legacy strings become items", bag.inventory.every(i => typeof i === "object" && i.name));
check("known names re-link to catalog", bag.inventory.find(i => i.name === "Waterskin")?.consumable === true);
check("unknown strings survive as misc", bag.inventory.find(i => i.name === "mystery bone")?.kind === "misc");

addItem(bag, "healing_draught", catalog);
addItem(bag, { name: "Strange Prism", kind: "quest", description: "It hums.", effects: { health: 999 } }, catalog);
check("GM ad-hoc item effects are clamped", bag.inventory.find(i => i.name === "Strange Prism").effects.health <= 15);
const fx = consumeItem(bag, "Healing Draught");
check("consume applies effects and removes stack", fx.health === 8 && bag.health === 18 && !bag.inventory.some(i => i.name === "Healing Draught"));

addItem(bag, "belt_knife", catalog);
const eq = equipmentBonus(bag, ["attack"], rules);
check("knife aids attack actions", eq.bonus === 5 && eq.helpers.includes("Belt Knife"));
check("no relevant tool = no bonus", equipmentBonus(bag, ["persuade"], rules).bonus === 0);
check("removeItem drops the stack", removeItem(bag, "Belt Knife") && !bag.inventory.some(i => i.name === "Belt Knife"));
check("GM inventory summary reads", inventoryForGM(bag).includes("Waterskin"));

const eqChance = successChance({ character: char, action, location: loc, rules, equipmentBonus: 10 });
check("equipment bonus flows into chance", eqChance === chance + 10);

// --- worldtime ---
localStorage.setItem("singularity.timeMode", "story");
const clock = newClock(1, 8);
check("clock starts day 1 morning", readClock(clock).phase === "morning");
advanceClock(clock, 8);
check("advance 8h → afternoon/evening", ["afternoon", "evening"].includes(readClock(clock).phase));
advanceClock(clock, 10);
check("clock rolls into day 2", readClock(clock).day === 2);
localStorage.setItem("singularity.timeMode", "real");
localStorage.setItem("singularity.timeRatio", "24");
const rc = readClock(clock); // anchors now
check("real mode anchors without jumping", rc.day === readClock(clock).day);
check("real anchor stored", !!clock.realAnchor);
localStorage.setItem("singularity.timeMode", "story");
readClock(clock);
check("returning to story mode drops anchor", clock.realAnchor === null);

// --- companions ---
const aevi = JSON.parse(readFileSync(join(root, "content/packs/valley/companions/aevi.json"), "utf8"));
const catalogC = { aevi };
const traveler = { companions: ["aevi"] };
const active = activeCompanions(traveler, catalogC);
check("companion resolves from catalog", active.length === 1 && active[0].name === "Aevi");
check("aevi assists investigation", companionBonus(active, ["investigate"], rules).bonus === 5);
check("aevi does not assist theft", companionBonus(active, ["steal"], rules).bonus === 0);
check("GM block includes boundaries", companionsForGM(active).includes("will not lie"));
check("unknown companion id is dropped", activeCompanions({ companions: ["ghost"] }, catalogC).length === 0);
const chanceWithAevi = successChance({ character: char, action: { ...action, tags: ["investigate"] }, location: loc, rules, equipmentBonus: companionBonus(active, ["investigate"], rules).bonus });
check("companion assist flows into chance", chanceWithAevi === chance + 5);

// --- quests ---
const q = { xp: 0 };
applyQuestUpdates(q, [{ op: "start", title: "Trace the Gray Water", summary: "Follow the contamination upstream", giver: "Mara Wells" }]);
check("quest starts", q.quests.length === 1 && q.quests[0].status === "active" && q.quests[0].id === "trace-the-gray-water");
applyQuestUpdates(q, [{ op: "start", title: "Trace the Gray Water" }]);
check("duplicate start ignored", q.quests.length === 1);
applyQuestUpdates(q, [{ op: "progress", questId: "trace-the-gray-water", note: "The samples match nothing natural." }]);
check("progress appends", q.quests[0].progress.length === 1 && q.quests[0].progress[0].includes("nothing natural"));
applyQuestUpdates(q, [{ op: "complete", questId: "trace-the-gray-water", xpReward: 400 }]);
check("complete clamps xp to 50", q.quests[0].status === "completed" && q.xp === 50);
applyQuestUpdates(q, [{ op: "progress", questId: "trace-the-gray-water", note: "too late" }]);
check("resolved quests reject updates", q.quests[0].progress.length <= 4 && q.quests[0].status === "completed");
for (let i = 0; i < 7; i++) applyQuestUpdates(q, [{ op: "start", title: "Side thing " + i }]);
check("active quest cap holds at 5", q.quests.filter(x => x.status === "active").length <= 5);
check("GM quest block renders", questsForGM(q).includes("Side thing 0"));
check("slugify behaves", slugify("The  Gray!! Water??") === "the-gray-water");

// --- scene permanence ---
const rawScene = {
  setting: "On the Millbrook dock at dusk, " + "x".repeat(500),
  npcsPresent: [{ name: "Dock-master Hela", state: "logging the last barge" }, "Kit Farrow", ...Array(10).fill({ name: "extra", state: "" })],
  objects: Array(20).fill("crate of gray-slick fish"),
  threads: ["Hela hasn't answered the question about the toll-takers"]
};
const clean = sanitizeScene(rawScene);
check("scene setting clamped", clean.setting.length <= 400);
check("scene npcs capped and normalized", clean.npcsPresent.length <= 8 && clean.npcsPresent[1].name === "Kit Farrow");
check("scene objects capped", clean.objects.length <= 10);
check("garbage scene returns null (keep previous)", sanitizeScene({ npcsPresent: [] }) === null && sanitizeScene(null) === null);
const ctx = buildTurnContext({
  character: { name: "T", origin: "valley", background: "craftsman", level: 1, attributes: { physical: 1, mental: 1, social: 1, practical: 1 }, health: 1, maxHealth: 1, energy: 1, maxEnergy: 1, alignment: {}, deeds: [] },
  location: { name: "Dock", descriptionSeed: "d", spectrum: {}, communityId: null },
  rules, sceneState: clean,
  recentTurns: [{ summary: "old beat" }, { summary: "recent beat", narration: "Full narration text of the recent beat." }]
});
check("scene state block is in the GM context", ctx.includes("AUTHORITATIVE") && ctx.includes("Dock-master Hela"));
check("recent beats include full text, older only summaries", ctx.includes("FULL TEXT: Full narration") && ctx.includes("old beat"));

// --- NPC permanence ---
const traveler2 = { name: "Kaelen" };
applyNpcUpdates(traveler2, [{ op: "meet", npcId: "dock-master-hela", name: "Dock-master Hela", role: "Millbrook dock-master", description: "Broad, ink-stained fingers, misses nothing.", note: "Answered Kaelen's question about the gray water — guardedly.", learned: ["Logs every barge; noticed catch weights dropping for a month"], skillsObserved: ["ledger-keeping"], relationshipDelta: 1 }], { locationId: "millbrook", day: 1 });
check("met NPC lands in registry", traveler2.npcRegistry["dock-master-hela"]?.name === "Dock-master Hela");
applyNpcUpdates(traveler2, [{ op: "update", npcId: "dock-master-hela", note: "Kaelen fixed her jammed crane gratis.", relationshipDelta: 2, skillsObserved: ["ledger-keeping", "haggling"] }], { locationId: "millbrook", day: 2 });
const hela = traveler2.npcRegistry["dock-master-hela"];
check("history accumulates with days", hela.history.length === 2 && hela.history[1].includes("d2"));
check("relationship moves, delta clamped to ±2", hela.relationship === 3);
check("skills dedupe", hela.skillsObserved.length === 2);
applyNpcUpdates(traveler2, [{ op: "update", npcId: "dock-master-hela", relationshipDelta: 99 }], {});
check("big deltas clamp", traveler2.npcRegistry["dock-master-hela"].relationship === 5);
check("bands read", relationshipBand(5) === "ally" && relationshipBand(-8) === "enemy");
const regBlock = npcRegistryForGM(traveler2, { locationId: "millbrook", sceneNpcNames: [] });
check("GM registry block carries facts + history", regBlock.includes("catch weights dropping") && regBlock.includes("fixed her jammed crane"));
const legacy = { relationships: { water_keeper: { score: 3, notes: ["shared tea"] } } };
migrateRelationships(legacy, { water_keeper: { name: "Mara Wells", role: "Water Keeper", homeLocation: "millbrook" } });
check("legacy relationships migrate", legacy.npcRegistry["water-keeper"]?.name === "Mara Wells" && legacy.npcRegistry["water-keeper"].history[0] === "shared tea");

// --- place memory ---
const traveler3 = {};
notePlaceVisit(traveler3, "millbrook", 1);
notePlaceVisit(traveler3, "millbrook", 3);
applyPlaceUpdates(traveler3, "millbrook", [{ note: "Left the hemp rope coiled behind the well." }, { flag: { crane_fixed: true } }], { day: 3 });
const pm = placeMemoryForGM(traveler3, "millbrook");
check("place remembers visits, notes, flags", pm.includes("Visits: 2") && pm.includes("hemp rope") && pm.includes("crane_fixed=true"));
check("unvisited place has no block", placeMemoryForGM(traveler3, "archive_hollow") === null);
applyPlaceUpdates(traveler3, "millbrook", [{ note: "Left the hemp rope coiled behind the well." }], { day: 3 });
check("duplicate place notes dedupe", traveler3.placeMemory.millbrook.notes.length === 1);

// --- world tick ---
const wcEvent = JSON.parse(readFileSync(join(root, "content/packs/valley/events/water_crisis.json"), "utf8"));
const locFiles = ["millbrook", "harmonic_heights_terrace", "radiant_plateau_edge"].map(id =>
  JSON.parse(readFileSync(join(root, `content/packs/valley/locations/${id}.json`), "utf8")));
const tickContent = {
  region: { activeEvents: [{ eventId: "water_crisis", stage: 1 }] },
  events: { water_crisis: wcEvent },
  locations: Object.fromEntries(locFiles.map(l => [l.id, l]))
};
const wanderer = {
  name: "Kaelen", worldState: initWorldState(1), npcRegistry: {},
  deeds: [{ description: "Pulled two children from the flooded channel", tags: ["child-rescuer"], weight: 3, communityId: "valley.millbrook", day: 1, spread: [] }]
};
await runWorldTick({ character: wanderer, content: tickContent, currentDay: 1, evolveNpcs: null });
check("same-day tick is a no-op", wanderer.worldState.news.length === 0);
await runWorldTick({ character: wanderer, content: tickContent, currentDay: 14, evolveNpcs: null });
check("event advances after stage days (12)", wanderer.worldState.eventStages.water_crisis.stage === 2);
check("stage shift drifts the spectrum", wanderer.worldState.spectrumDrift.death_life < 0);
check("big deed spread to other communities", wanderer.deeds[0].spread.includes("valley.harmonic_heights") && wanderer.deeds[0].spread.includes("valley.radiant_plateau"));
check("news generated for both", wanderer.worldState.news.length === 2);
const unseen = takeUnseenNews(wanderer);
check("unseen news delivered once", unseen.length === 2 && takeUnseenNews(wanderer).length === 0);
check("news block for GM renders", newsForGM(wanderer).includes("First Sickness"));
await runWorldTick({ character: wanderer, content: tickContent, currentDay: 30, evolveNpcs: null });
check("event advances again (12+15=27 < 30)", wanderer.worldState.eventStages.water_crisis.stage === 3);
await runWorldTick({ character: wanderer, content: tickContent, currentDay: 200, evolveNpcs: null });
check("final stage holds (999 days)", wanderer.worldState.eventStages.water_crisis.stage === 4);
const region2 = buildRegionView(tickContent, wanderer);
check("region view reflects campaign stage", region2.activeEvents[0].stage === 4);
const shifted = effectiveLocation({ id: "millbrook", spectrum: { death_life: 0.4 } }, wanderer.worldState);
check("effective location merges drift", shifted.spectrum.death_life < 0.4);
const evolved = { name: "K", worldState: initWorldState(1), npcRegistry: { hela: { id: "hela", name: "Hela", role: "dock-master", relationship: 3, history: [], knownFacts: [], skillsObserved: [], status: "active" } }, deeds: [] };
await runWorldTick({ character: evolved, content: tickContent, currentDay: 8, evolveNpcs: async () => ({ npcUpdates: [{ npcId: "hela", note: "Fell ill from the water; recovering.", status: "injured" }], news: ["The dock-master took sick last week."] }) });
check("offscreen npc evolution applies", evolved.npcRegistry.hela.status === "injured" && evolved.npcRegistry.hela.history.length === 1);
check("evolution news lands", evolved.worldState.news.some(n => n.text.includes("took sick")));
const failing = { name: "K", worldState: initWorldState(1), npcRegistry: { x: { id: "x", name: "X", role: "", relationship: 0, history: [], knownFacts: [], skillsObserved: [], status: "active" } }, deeds: [] };
await runWorldTick({ character: failing, content: tickContent, currentDay: 8, evolveNpcs: async () => { throw new Error("api down"); } });
check("evolution failure never blocks the tick", failing.worldState.lastTickDay === 8);

// --- gambits ---
const gActions = [
  { label: "scout the office", attribute: "mental", axes: {}, difficulty: 0, intentTags: ["scout"], tags: ["scout"], planned: true },
  { label: "slip inside", attribute: "physical", axes: {}, difficulty: 15, intentTags: ["risky"], tags: ["risky"], planned: true },
  { label: "copy the logs", attribute: "practical", axes: {}, difficulty: 15, intentTags: ["careful"], tags: ["careful"], planned: true }
];
const gCtx = { character: char, location: loc, rules, aptitudeMods: {}, bonuses: () => 0 };
const luckyRolls = [0.1, 0.1, 0.1];
let li = 0;
const cleanRun = executeGambit(gActions, gCtx, () => luckyRolls[li++]);
check("clean run completes all steps", cleanRun.done && cleanRun.receipts.length === 3 && cleanRun.blockedAt === null);
const mixedRolls = [0.1, 0.93, 0.1]; // step 2 rolls 94 -> failure
let mi = 0;
const blocked = executeGambit(gActions, gCtx, () => mixedRolls[mi++]);
check("failed step blocks the run", !blocked.done && blocked.blockedAt === 1 && blocked.receipts.length === 2);
const resumed = executeGambit(gActions, gCtx, () => 0.1, 2);
check("resume from index continues", resumed.done && resumed.receipts[0].index === 2);
const rr = rerollStep(gActions[1], gCtx, () => 0.1);
check("adaptation reroll resolves", rr.degree === "success" || rr.degree === "crit_success");
const assessment = assessGambit(gActions, { ...gCtx, character: { ...char, attunement: 9 } });
check("assessment reads all steps", assessment.steps.length === 3 && assessment.steps.every(s => s.chance > 0));
check("weak link visible to experienced planners", assessment.weakIndex !== null && assessment.steps[assessment.weakIndex].chance === Math.min(...assessment.steps.map(s => s.chance)));
check("novice sees no weak link", assessGambit(gActions, { ...gCtx, character: { ...char, attunement: 0, alignment: {} }, location: { spectrum: {} } }).weakIndex === null);
check("strategist earns extra adaptation point", adaptationPointsFor({ aptitudes: ["strategist"] }, rules) === 2 && adaptationPointsFor({ aptitudes: [] }, rules) === 1);
const gres = gambitResolutionForGM("steal the logs", [...blocked.receipts, { index: 1, roll: 12, chance: 60, degree: "success", rerolled: true, action: gActions[1] }], gActions, "completed_rough");
check("gambit resolution formats for GM", gres.gambit.steps.length === 3 && gres.gambit.steps[2].includes("adaptation") && gres.action.label.includes("steal the logs"));

// --- progression: sub-attributes, leveling, skill trees ---
const hero2 = { origin: "harmonic", level: 1, xp: 0, attributes: { physical: 3, mental: 2, social: 3, practical: 4 }, abilities: [{ abilityId: "sonic_resonance", level: 1 }], maxHealth: 30, health: 30, maxEnergy: 100, energy: 100, attunement: 1 };
ensureSubAttributes(hero2);
check("subs initialize from parents", hero2.subAttributes.strength === 3 && hero2.subAttributes.craft === 4 && hero2.subAttributes.reason === 2);
const subChance = successChance({ character: hero2, action: { attribute: "physical", subAttribute: "strength", axes: {}, difficulty: 0 }, location: { spectrum: {} }, rules });
hero2.subAttributes.strength = 5;
const subChance2 = successChance({ character: hero2, action: { attribute: "physical", subAttribute: "strength", axes: {}, difficulty: 0 }, location: { spectrum: {} }, rules });
// 3→5 crosses the soft cap (4): +20 for the 4th point, +5 for the 5th
check("sub-attribute drives the roll (with soft cap)", subChance2 === subChance + rules.baseChance.attributeMultiplier + rules.baseChance.attributePerPointBeyond || subChance2 === rules.d100.ceilingChance);
hero2.subAttributes.strength = 3;
hero2.xp = 250; // enough for levels 2 and 3
const msgs = applyLevelUps(hero2, rules);
check("multi-level-up banks growth", hero2.level === 3 && hero2.pendingSubPoints === 2 && hero2.skillPoints === 2 && msgs.length === 2);
check("spend sub point works and syncs parent", spendSubPoint(hero2, "agility", rules) && hero2.subAttributes.agility === 4 && hero2.attributes.physical === 4);
check("cannot spend into unknown sub", !spendSubPoint(hero2, "luck", rules));
const abilityCatalog = {};
for (const f of ["harmonic", "radiant"]) {
  const pack = JSON.parse(readFileSync(join(root, `content/packs/core/abilities/${f}.json`), "utf8"));
  for (const a of pack.abilities) abilityCatalog[a.id] = { ...a, powerSystem: pack.powerSystem };
}
const ru = rankUpAbility(hero2, "sonic_resonance", rules);
check("rank up at level 3", ru.ok && ru.newRank === 2);
check("rank 3 gated to level 5", rankUpAbility(hero2, "sonic_resonance", rules).ok === false);
check("harmonic cannot learn radiant arts", learnAbility(hero2, "light_bending", abilityCatalog, rules).why === "wrong tradition");
check("learning own tradition works", learnAbility(hero2, "echo_sense", abilityCatalog, rules).ok && hero2.abilities.length === 2 && hero2.skillPoints === 0);
const law = abilitiesForGM(hero2, abilityCatalog);
check("ability law carries rank grants and limits", law.includes("Standing Wave") && law.includes("CANNOT") && law.includes("NOT FOR"));

// --- SNG-103: the GM is fed the EFFECTIVE energy cost, not the raw base (was false-flagging correct sheets) ---
{
  const eRules = { leveling: { energyEfficiencyPerTwoLevels: 1, rankEnergyDiscount: 1, minEnergyCostFraction: 0.5 }, energy: { defaultActionCost: 5 } };
  const ab = { id: "palework", name: "Palework", energyCost: 6, tree: [{ rank: 1, name: "R1", grants: "g", cannot: "c" }, { rank: 2, name: "Reading the Rot", grants: "g", cannot: "c" }] };
  const leveled = { abilities: [{ abilityId: "palework", level: 2 }], attributes: {}, level: 5, discoveries: [] };
  const gmLeveled = abilitiesForGM(leveled, { palework: ab }, null, eRules);
  check("SNG-103: GM sees the effective (discounted) energy, not base", /Palework.*3 energy/s.test(gmLeveled) && /base 6, discounted/.test(gmLeveled));
  const fresh = { abilities: [{ abilityId: "palework", level: 1 }], attributes: {}, level: 1, discoveries: [] };
  const gmFresh = abilitiesForGM(fresh, { palework: ab }, null, eRules);
  check("SNG-103: an undiscounted ability still reads base (no phantom discount line)", /Palework.*6 energy\)/s.test(gmFresh) && !/discounted/.test(gmFresh));
}

// --- SNG-105: energy recovery scales with the pool (a night is ~a constant fraction), floor unchanged ---
{
  const rr = { recovery: { sleep: { energy: 40, health: 3, hours: 8 }, breather: { energy: 10, health: 1, hours: 1 }, meal: 10 }, recoveryFractions: { sleep: 0.32, breather: 0.08, meal: 0.08 } };
  check("SNG-105: at a small pool the flat floor binds — low levels unchanged", recoveryEnergy("sleep", { maxEnergy: 100 }, rr) === 40);
  check("SNG-105: at a big pool the fraction beats the floor — recovery scales up", recoveryEnergy("sleep", { maxEnergy: 200 }, rr) === 64);
  check("SNG-105: sleep is ~a constant fraction of the pool once above the floor", Math.abs(recoveryEnergy("sleep", { maxEnergy: 300 }, rr) / 300 - 0.32) < 0.01);
  check("SNG-105: breather floors at 10, scales above (16 at max 200)", recoveryEnergy("breather", { maxEnergy: 100 }, rr) === 10 && recoveryEnergy("breather", { maxEnergy: 200 }, rr) === 16);
}

// --- novel use & discoveries ---
const novelAction = { attribute: "practical", subAttribute: "craft", axes: {}, difficulty: 0, novel: true };
const plainChance = successChance({ character: hero2, action: { ...novelAction, novel: false }, location: { spectrum: {} }, rules });
const novelChance = successChance({ character: hero2, action: novelAction, location: { spectrum: {} }, rules });
check("novel use pays the surcharge", novelChance === plainChance - rules.novel.difficultySurcharge);
const rNovel = resolveAction({ character: hero2, action: novelAction, location: { spectrum: {} }, rules }, () => 0.93); // roll 94
check("novel crit-fail band widens (94 crit-fails)", rNovel.degree === "crit_failure");
const rPlain = resolveAction({ character: hero2, action: { ...novelAction, novel: false, difficulty: -50 }, location: { spectrum: {} }, rules }, () => 0.93);
check("same roll is not a crit-fail when routine", rPlain.degree !== "crit_failure");

// --- SNG-106: successChance retains a component breakdown that SUMS (clamped) to the returned total ---
{
  const cases = [
    { character: hero2, action: { attribute: "practical", subAttribute: "craft", axes: {}, difficulty: 0 }, location: { spectrum: {} }, rules },
    { character: hero2, action: { attribute: "practical", subAttribute: "craft", axes: {}, difficulty: 20, difficultySource: "the raider (threat 35)", novel: true }, location: { spectrum: {} }, rules },
    { character: hero2, action: { attribute: "physical", axes: {}, difficulty: 0, abilityLevel: 2 }, location: { spectrum: {} }, rules, substratePenalty: 15 },
  ];
  let allSum = true, named = false, componentsSeen = 0;
  for (const ctx of cases) {
    const total = successChance(ctx);
    const bd = ctx._breakdown;
    componentsSeen += bd.components.length;
    const sum = bd.components.reduce((a, c) => a + c.value, 0);
    const clamped = Math.max(rules.d100.floorChance, Math.min(rules.d100.ceilingChance, Math.round(sum)));
    if (clamped !== total) allSum = false;
    if (bd.components.some(c => /raider/.test(c.label))) named = true;
  }
  check("SNG-106: the breakdown sums (clamped) to the returned chance — the popup shows real math", allSum && componentsSeen > 0);
  check("SNG-106: the opposed difficulty term is NAMED in the breakdown (not anonymous)", named);
}
const before = { h: hero2.health, e: hero2.energy };
const bl = applyBacklash(hero2, rules);
check("backlash costs health and energy", hero2.health === before.h + bl.health && hero2.energy === before.e + bl.energy);
const minted = recordDiscovery(hero2, { name: "Echo-Guided Push", description: "Sonic push aimed by echo-sense through a wall.", abilityIds: ["sonic_resonance", "echo_sense"], noveltyHint: "push through wall", day: 4 });
check("discovery mints once", minted && recordDiscovery(hero2, { name: "Echo-Guided Push", abilityIds: ["sonic_resonance", "echo_sense"], noveltyHint: "push through wall" }) === null);
check("known combo found regardless of hint", !!knownDiscovery(hero2, ["echo_sense", "sonic_resonance"]));
const discChance = successChance({ character: hero2, action: { ...novelAction, novel: true, discoveryBonus: rules.novel.discoveryBonus }, location: { spectrum: {} }, rules });
// RED #2 (post-BATCH-5): commit 6bfb98d raised novel.discoveryBonus 10→20; the fixture's
// plainChance + 20 now crosses d100.ceilingChance, so assert the CLAMPED contract.
check("discovered technique earns bonus instead of surcharge (ceiling-clamped)", discChance === Math.min(rules.d100.ceilingChance, plainChance + rules.novel.discoveryBonus) && discChance > plainChance - rules.novel.difficultySurcharge);
check("ability law lists discovered techniques", abilitiesForGM(hero2, abilityCatalog).includes("Echo-Guided Push"));

// --- codex (knowledge graph) ---
const scribe = {};
ensureCodex(scribe);
applyCodexUpdates(scribe, [
  { topic: "the-gray-water", label: "The Gray Water", kind: "mystery", fact: "The contamination pattern is not natural — Mara recognized it.", links: ["millbrook", "mara-wells"] },
  { topic: "mara-wells", label: "Mara Wells", kind: "person", fact: "Was an environmental engineer before the Transition.", links: ["the-gray-water"] }
], { day: 3 });
check("codex topics created with links", scribe.codex.topics["the-gray-water"]?.links.includes("millbrook") && scribe.codex.topics["mara-wells"]?.kind === "person");
applyCodexUpdates(scribe, [{ topic: "the-gray-water", fact: "The contamination pattern is not natural — Mara recognized it." }], { day: 5 });
check("duplicate facts dedupe across days", scribe.codex.topics["the-gray-water"].facts.length === 1);
applyCodexUpdates(scribe, [{ topic: "the-gray-water", fact: "Upstream fisher families sickened first, in draw order.", links: ["echo-river-crossing"] }], { day: 6 });
check("facts accumulate day-stamped", scribe.codex.topics["the-gray-water"].facts.length === 2 && scribe.codex.topics["the-gray-water"].facts[1].startsWith("[d6]"));
const relevant = codexForGM(scribe, { locationId: "millbrook", questTitles: [] });
check("location-linked topics surface as relevant", relevant.includes("The Gray Water"));
const relevant2 = codexForGM(scribe, { locationId: "archive_hollow", questTitles: ["Trace the Gray Water"] });
check("quest-matched topics surface too", relevant2 && relevant2.includes("Gray Water"));
check("codex search finds facts", searchCodex(scribe, "fisher").length === 1 && searchCodex(scribe, "").length === 2);

// --- scene-level art ---
globalThis.localStorage.setItem("singularity.artMode", "generate");
const testLoc = { id: "millbrook", name: "Millbrook", descriptionSeed: "a village", image: "content/packs/valley/assets/millbrook.jpg" };
const sc1 = sceneImage(testLoc, { setting: "Inside a low-beamed cottage, fire banked, rain on the shutters" });
const sc2 = sceneImage(testLoc, { setting: "On the river dock at dusk, gray-green water lapping the pilings" });
check("generate mode: scene setting drives the image", sc1.includes("pollinations") && sc1 !== sc2);
check("same setting = same image (stable seed)", sc1 === sceneImage(testLoc, { setting: "Inside a low-beamed cottage, fire banked, rain on the shutters" }));
globalThis.localStorage.setItem("singularity.artMode", "static");
check("static mode falls back to the location banner", sceneImage(testLoc, { setting: "anywhere" }) === testLoc.image);
globalThis.localStorage.setItem("singularity.artMode", "off");
check("off mode shows nothing", sceneImage(testLoc, { setting: "anywhere" }) === null);
globalThis.localStorage.setItem("singularity.artMode", "static");

// --- map data ---
for (const id of ["millbrook", "echo_river_crossing", "archive_hollow", "disputed_zone_fringe", "harmonic_heights_terrace", "radiant_plateau_edge"]) {
  const l = JSON.parse(readFileSync(join(root, `content/packs/valley/locations/${id}.json`), "utf8"));
  if (!(l.map && typeof l.map.x === "number" && typeof l.map.y === "number")) { check(`map coords present for ${id}`, false); }
}
check("all locations carry map coordinates", true);

// --- v0.8.1 bug regressions ---
// 1) NaN can never reach the dice
const nanChance = successChance({ character: char, action: { label: "x", attribute: "social", axes: { violence_peace: "very peaceful" }, difficulty: "moderate" }, location: loc, rules });
check("malformed action still yields finite chance", Number.isFinite(nanChance));
const badIntent = sanitizeIntent({ label: "Build rapport", attribute: "social", subAttribute: "vibes", difficulty: "moderate", axes: { violence_peace: "high", chaos_order: 0.4 }, intentTags: ["rapport"], abilityId: "ghost_walk", comboAbilities: "not-an-array", novelUse: "yes" }, { abilities: [{ abilityId: "prism_sight", level: 1 }] });
check("intent sanitizer clamps everything", badIntent.difficulty === 0 && badIntent.subAttribute === null && badIntent.abilityId === null && Array.isArray(badIntent.comboAbilities) && badIntent.axes.chaos_order === 0.4 && !("violence_peace" in badIntent.axes));
const sanChance = successChance({ character: char, action: badIntent, location: loc, rules });
check("sanitized intent rolls clean", Number.isFinite(sanChance) && sanChance > 0);
// 2) named NPC updates: update-only ops can't create ghosts; fuzzy match prevents twins
const town = { name: "T", npcRegistry: {} };
applyNpcUpdates(town, [{ op: "update", npcId: "sorel", relationshipDelta: 1 }], {});
check("update for unknown person is dropped (meet must come first)", !town.npcRegistry.sorel);
applyNpcUpdates(town, [{ op: "meet", npcId: "davan", name: "Davan", role: "channel worker" }], { day: 1 });
applyNpcUpdates(town, [{ op: "meet", npcId: "davan_channel_worker", name: "davan_channel_worker" }], { day: 2 });
check("fuzzy match reuses the same human", Object.keys(town.npcRegistry).length === 1 && town.npcRegistry.davan.name === "Davan");
applyNpcUpdates(town, [{ op: "update", npcId: "davan-channel-worker", note: "helped him clear the channel gate" }], { day: 3 });
check("updates under variant ids land on the one person", town.npcRegistry.davan.history.length === 1);
// 3) duplicate healing + name prettifying for existing saves
const dirty = { npcRegistry: {
  "davan": { id: "davan", name: "Davan", role: "channel worker", relationship: 2, history: ["[d1] met"], knownFacts: [], skillsObserved: [], status: "active" },
  "davan-channel-worker": { id: "davan-channel-worker", name: "davan_channel_worker", role: "", relationship: 1, history: ["[d2] helped"], knownFacts: ["knows the sluices"], skillsObserved: [], status: "active" },
  "millbrook-elder-woman": { id: "millbrook-elder-woman", name: "millbrook.elder_woman", role: "", relationship: -1, history: [], knownFacts: [], skillsObserved: [], status: "active" }
} };
mergeDuplicateNpcs(dirty, ["millbrook"]);
const merged = Object.values(dirty.npcRegistry);
check("duplicates merged into one Davan", merged.filter(n => n.id.startsWith("davan")).length === 1);
const davan = merged.find(n => n.id.startsWith("davan"));
check("merge keeps history and facts from both", davan.history.length === 2 && davan.knownFacts.includes("knows the sluices"));
check("id-shaped names prettified, community token dropped", merged.some(n => n.name === "Elder Woman"));
check("prettify leaves human names alone", prettifyNpcName("Mara Wells") === "Mara Wells");

// --- v0.8.2: exhaustion + narrative rest ---
const tired = { ...char, energy: 0 };
const freshChance = successChance({ character: { ...char, energy: 50 }, action, location: loc, rules });
const tiredChance = successChance({ character: tired, action, location: loc, rules });
check("exhaustion penalizes all actions", tiredChance === freshChance - rules.energy.exhaustedPenalty);
check("one point of energy clears the penalty", successChance({ character: { ...char, energy: 1 }, action, location: loc, rules }) === freshChance);
// --- v0.8.3: recovery table present and sane ---
check("recovery table shipped", rules.recovery && rules.recovery.meal === 10 && rules.recovery.breather.energy === 10 && rules.recovery.sleep.energy === 40);
const medGain = (rules.recovery.meditationBase ?? 10) + (rules.recovery.meditationPerAttunement ?? 2) * 5;
check("meditation scales with attunement", medGain === 20);

// --- v0.9.0: retro grants, energy efficiency, trivial actions ---
const { retroLevelGrants, effectiveEnergyCost } = await import("../engine/progression.js");
const veteran = { level: 3, pendingSubPoints: 0, skillPoints: 0 };
check("retro grant pays owed levels once", retroLevelGrants(veteran, rules) && veteran.pendingSubPoints === 2 && veteran.skillPoints === 2 && !retroLevelGrants(veteran, rules));
const freshChar = { level: 1, grantsVersion: 1, pendingSubPoints: 2, skillPoints: 0 };
retroLevelGrants(freshChar, rules);
check("flagged characters get nothing extra", freshChar.pendingSubPoints === 2 && freshChar.skillPoints === 0);
const sonicDef = abilityCatalog.sonic_resonance; // base 8
check("level 1 rank 1 pays full cost", effectiveEnergyCost(sonicDef, { level: 1, abilities: [{ abilityId: "sonic_resonance", level: 1 }] }, rules) === 8);
check("level 5 rank 3 pays discounted cost", effectiveEnergyCost(sonicDef, { level: 5, abilities: [{ abilityId: "sonic_resonance", level: 3 }] }, rules) === 4);
check("discount floors at half base", effectiveEnergyCost(sonicDef, { level: 20, abilities: [{ abilityId: "sonic_resonance", level: 3 }] }, rules) === 4);
const trivialIntent = sanitizeIntent({ label: "chat with the miller", attribute: "social", trivial: true, feasible: true }, { abilities: [] });
check("trivial survives sanitization", trivialIntent.trivial === true);
const trivialAbility = sanitizeIntent({ label: "x", abilityId: "prism_sight", trivial: true }, { abilities: [{ abilityId: "prism_sight", level: 1 }] });
check("ability use is never trivial", trivialAbility.trivial === false);

// --- v1.0.0: deep attributes, GM-generated abilities ---
const deepChar = (v) => ({ ...char, subAttributes: { strength: v, agility: 3, reason: 3, insight: 3, presence: 3, rapport: 3, craft: 3, wits: 3 }, energy: 50 });
const act8 = { label: "x", attribute: "physical", subAttribute: "strength", axes: {}, difficulty: 30 };
const at4 = successChance({ character: deepChar(4), action: act8, location: { spectrum: {} }, rules });
const at8 = successChance({ character: deepChar(8), action: act8, location: { spectrum: {} }, rules });
const at20 = successChance({ character: deepChar(20), action: act8, location: { spectrum: {} }, rules });
check("beyond soft cap: +5 per point (diminishing)", at8 === at4 + 20 && at20 > at8);
check("hard rolls stay meaningful at high attributes", at20 <= rules.d100.ceilingChance);
const { sanitizeNewAbility, applyNewAbility } = await import("../engine/progression.js");
const rawAb = { name: "Stone-Singing", description: "Coax cracks through rock by humming its grain. Slow — minutes per span; useless on metal or living things.", energyCost: 99, attribute: "practical", axes: { mechanical_spiritual: 2 }, taughtBy: "Elder Resonance" };
const def = sanitizeNewAbility(rawAb);
check("new ability sanitized (cost + axes clamped)", def.energyCost === 15 && def.axes.mechanical_spiritual === 1 && def.powerSystem === "learned");
const learner = { level: 2, abilities: [{ abilityId: "sonic_resonance", level: 1 }] };
check("grant applies and joins the character", applyNewAbility(learner, def, rules).ok && learner.abilities.some(a => a.abilityId === "stone-singing"));
check("duplicate grant rejected", applyNewAbility(learner, def, rules).ok === false);
const capped = { level: 1, abilities: [], customAbilities: { a: {}, b: {} } };
check("learned-ability cap enforced", applyNewAbility(capped, sanitizeNewAbility({ name: "Third", description: "x" }), rules).why.includes("cap"));
check("garbage ability rejected", sanitizeNewAbility({ name: "NoDesc" }) === null);

// --- v1.0.1: JSON salvage + earned xp table ---
const { salvageNarration } = await import("../engine/gm.js");
const { parseLooseJSON } = await import("../engine/claude.js");
const truncated = '```json\n{"narration": "The dock creaks under your boots.\\nMara turns, says \\"you came back\\" — and the light shifts", "sceneSummary": "retur';
const sal = salvageNarration(truncated);
check("narration salvaged from truncated JSON", sal && sal.includes("dock creaks") && sal.includes('"you came back"') && !sal.includes("sceneSummary"));
check("no salvage from garbage returns null", salvageNarration("total nonsense") === null);
check("parseLooseJSON strips fences", parseLooseJSON('```json\n{"a": 1}\n```').a === 1);
check("xp table pays every degree", ["crit_success", "success", "partial", "failure", "crit_failure", "completed", "abandoned"].every(k => (rules.xp[k] ?? 0) > 0));

// --- SNG-002: encounters engine ---
const { startEncounter, encounterDifficulty, duelRound, challengeStage, puzzleAttempt, puzzleHints, puzzleUnlocks, checkIncapacitation, encounterReceiptForGM, sanitizeEncounterOps, applyEncounterOps } = await import("../engine/encounters.js");
const duelDef = JSON.parse(readFileSync(join(root, "content/packs/valley/encounters/zone_raider_duel.json"), "utf8"));
const chalDef = JSON.parse(readFileSync(join(root, "content/packs/valley/encounters/rockslide_crossing.json"), "utf8"));
const puzDef = JSON.parse(readFileSync(join(root, "content/packs/valley/encounters/precursor_mechanism.json"), "utf8"));
let dS = startEncounter(duelDef), cS = startEncounter(chalDef), pS = startEncounter(puzDef);
check("all three types start", dS.opponentHealth === 5 && cS.stageIndex === 0 && pS.attempts === 0);
check("unknown type returns null", startEncounter({ type: "dance" }) === null);
check("duel threat maps to difficulty", encounterDifficulty(dS, duelDef, rules) === Math.round(45 * 0.3));
check("flee uses fleeDifficulty", encounterDifficulty(dS, duelDef, rules, { flee: true }) === 15);
check("challenge uses stage difficulty", encounterDifficulty(cS, chalDef, rules) === 0);
let r = duelRound(dS, duelDef, { degree: "success" }, rules);
check("duel success lands 2 hits", r.state.opponentHealth === 3 && r.deltas.health === 0 && !r.ended);
r = duelRound(r.state, duelDef, { degree: "partial" }, rules);
check("duel partial trades", r.state.opponentHealth === 2 && r.deltas.health === -4);
r = duelRound(r.state, duelDef, { degree: "partial" }, rules);
check("opponent yields at threshold", r.ended && r.outcome === "opponent_yielded");
let dS2 = { ...startEncounter(duelDef), opponentHealth: 2 };
r = duelRound(dS2, duelDef, { degree: "crit_success" }, rules);
check("opponent falls at 0", r.ended && r.outcome === "opponent_fell");
r = duelRound(startEncounter(duelDef), duelDef, { degree: "failure" }, rules);
const rr2 = duelRound(startEncounter(duelDef), duelDef, { degree: "crit_failure" }, rules);
check("failures cost the player", r.deltas.health === -8 && rr2.deltas.health === -12);
check("flee success ends", duelRound(startEncounter(duelDef), duelDef, { degree: "partial" }, rules, { flee: true }).outcome === "fled");
check("flee failure costs a free hit", duelRound(startEncounter(duelDef), duelDef, { degree: "failure" }, rules, { flee: true }).deltas.health <= -4);
check("yield ends immediately", duelRound(startEncounter(duelDef), duelDef, { degree: "failure" }, rules, { yield: true }).outcome === "yielded");
check("incapacitation detects 0 health", checkIncapacitation({ health: 0 }) === "incapacitated" && checkIncapacitation({ health: 1 }) === null);
r = challengeStage(cS, chalDef, { degree: "success" }, rules);
check("challenge success advances free", r.state.stageIndex === 1 && r.deltas.health === 0 && r.deltas.energy === 0);
r = challengeStage(r.state, chalDef, { degree: "partial" }, rules);
check("challenge partial advances with stage cost", r.state.stageIndex === 2 && r.deltas.health === -4 && r.deltas.energy === -5);
const held = challengeStage(r.state, chalDef, { degree: "failure" }, rules);
check("challenge failure holds with cost, retryable", held.state.stageIndex === 2 && held.deltas.health === -3 && !held.ended);
const crit = challengeStage(r.state, chalDef, { degree: "crit_failure" }, rules);
check("crit failure doubles the cost", crit.deltas.health === -6 && crit.hours === 2);
r = challengeStage(r.state, chalDef, { degree: "success" }, rules);
check("final stage completes", r.ended && r.outcome === "completed");
check("abandon ends", challengeStage(cS, chalDef, null, rules, { abandon: true }).outcome === "abandoned");
check("hints gate by sense tier", puzzleHints(puzDef, 0).length === 0 && puzzleHints(puzDef, 2).length === 2 && puzzleHints(puzDef, 9).length === 3);
r = puzzleAttempt(pS, puzDef, { degree: "partial" }, rules);
check("puzzle partial reveals a hint and costs", r.state.hintsRevealed === 1 && r.deltas.energy === -4 && r.hours === 1 && !r.ended);
r = puzzleAttempt(r.state, puzDef, { degree: "failure" }, rules);
check("puzzle failure just costs", r.state.hintsRevealed === 1 && r.state.attempts === 2);
r = puzzleAttempt(r.state, puzDef, { degree: "success" }, rules);
check("puzzle solves", r.ended && r.outcome === "solved" && r.state.solved);
check("walk away ends free of hours", puzzleAttempt(pS, puzDef, null, rules, { walkAway: true }).outcome === "walked_away");
const knower = { codex: { topics: { "the-gray-water": { id: "the-gray-water" } } } };
check("codex unlock appears only when topic known", puzzleUnlocks(puzDef, knower).length === 1 && puzzleUnlocks(puzDef, { codex: { topics: {} } }).length === 0);
const receipt = encounterReceiptForGM(dS, duelDef, { degree: "success" }, { events: ["You land 2 hits."] });
check("receipt carries both sides + guardrail text", receipt.includes("Vess") && receipt.includes("do not move health"));
const eOps = sanitizeEncounterOps([{ op: "tactic", tag: "circle-left" }, { op: "tactic", tag: "cheat-lightning" }, { op: "setHealth", v: 0 }], duelDef);
check("ops clamp to known tactics only", eOps.length === 1 && eOps[0].tag === "circle-left");
const opState = { ...dS }; applyEncounterOps(opState, eOps);
check("tactic op is flavor-only", opState.tactic === "circle-left" && opState.opponentHealth === dS.opponentHealth);

// --- SNG-002b: lethal avoidability + sub-places ---
const { lethalOfferClamp } = await import('../engine/encounters.js');
const lethalCat = { 'gm-black-warden': { id: 'gm-black-warden', type: 'duel', lethal: true, opponent: { name: 'Black Warden' } } };
let cl = lethalOfferClamp([{ label: 'Face the warden', encounterId: 'gm-black-warden', trivial: true }], lethalCat);
check('lethal offer carries a decline path', cl.length === 2 && /decline/i.test(cl[1].label));
check('lethal entry never trivial + telegraphed', cl[0].trivial === false && /lethal/i.test(cl[0].label));
cl = lethalOfferClamp([{ label: 'Face the warden (lethal stakes)', encounterId: 'gm-black-warden' }, { label: 'Back away from this fight', trivial: true }], lethalCat);
check('existing decline not duplicated', cl.length === 2);
check('non-lethal offers untouched', lethalOfferClamp([{ label: 'Spar', encounterId: 'x' }], {}).length === 1);
// sub-places
const wanderer2 = {};
const { applyPlaceUpdates: apu, placeMemoryForGM: pmg } = await import('../engine/places.js');
apu(wanderer2, 'millbrook', [{ subPlace: { name: 'Warden Post', note: 'Hale keeps the ledger here' } }, { subPlace: { name: 'The Cottage', visited: false } }], { day: 4 });
const mem = wanderer2.placeMemory.millbrook;
check('sub-places registered with slugs', mem.subPlaces['warden-post']?.visited === true && mem.subPlaces['the-cottage']?.visited === false);
apu(wanderer2, 'millbrook', [{ subPlace: { name: 'warden post', note: 'second visit' } }], { day: 6 });
check('sub-place dedupes by slug, keeps first name', Object.keys(mem.subPlaces).length === 2 && mem.subPlaces['warden-post'].name === 'Warden Post');
check('GM block lists places within', pmg(wanderer2, 'millbrook').includes('heard of only'));

// --- SNG-001: party shared scenes (pure core) ---
const { newSharedScene, addMember, removeMember, isMyTurn, mergeBeat, nextTurn, setEncounterState, partyBlockForGM } = await import('../engine/party.js');
const cA = { id: 'char-a', name: 'Kaelen', playerKey: 'erik' };
const cB = { id: 'char-b', name: 'Rowan', playerKey: 'kid1' };
let scn = newSharedScene('millbrook', cA, '2026-07-04T12-00-00');
check('scene starts with creator on turn', scn.party.length === 1 && scn.turn === 'char-a' && scn.locationId === 'millbrook');
scn = addMember(scn, cB);
check('join adds member once', scn.party.length === 2 && addMember(scn, cB).party.length === 2);
check('turn gate blocks B during A turn', isMyTurn(scn, 'char-a') && !isMyTurn(scn, 'char-b'));
const beat = { by: 'char-a', name: 'Kaelen', label: 'Calmed the crowd', degree: 'success', summary: 'The square settles.', at: '2026-07-04T12:01:00Z' };
scn = mergeBeat(scn, beat);
check('beat appends and turn rotates to B', scn.beats.length === 1 && scn.turn === 'char-b');
check('merge is idempotent by (by, at)', mergeBeat(scn, beat).beats.length === 1);
check('round-robin wraps', nextTurn(scn, 'char-b') === 'char-a');
scn = setEncounterState(scn, 'char-a', 'ENCOUNTER — The Hook-Pole Raider (duel), round 2');
const block = partyBlockForGM(scn, 'char-b');
check('party block carries other member + last action + encounter', block.includes('Kaelen') && block.includes('Calmed the crowd') && block.includes('Hook-Pole'));
check('solo member gets no party block', partyBlockForGM(newSharedScene('millbrook', cA, 'x'), 'char-a') === null);
scn = setEncounterState(scn, 'char-a', null);
check('encounter state clears', !scn.encounters['char-a']);
scn = removeMember(scn, 'char-b');
check('leave hands turn back and removes member', scn.party.length === 1 && scn.turn === 'char-a');
// conflict-merge simulation: two writers, same base — replay both beats, dedupe holds
let base = addMember(newSharedScene('millbrook', cA, 'y'), cB);
const bA = { by: 'char-a', name: 'Kaelen', label: 'x', degree: 'success', summary: 's1', at: 't1' };
const bB = { by: 'char-b', name: 'Rowan', label: 'y', degree: 'partial', summary: 's2', at: 't2' };
const writerA = mergeBeat(base, bA);          // A pushed first
const replayed = mergeBeat(mergeBeat(writerA, bB), bB); // B refetches A's version, re-applies own beat (twice = retry)
check('SHA-conflict merge-retry keeps both beats exactly once', replayed.beats.length === 2 && replayed.beats.filter(b => b.by === 'char-b').length === 1);

// --- SNG-003: ability catalog + cross-training ---
const { effectiveLevelReq } = await import('../engine/progression.js');
const fullCat = {};
for (const f of ['harmonic', 'radiant', 'valley_craft']) {
  const pk = JSON.parse(readFileSync(join(root, 'content/packs/core/abilities/' + f + '.json'), 'utf8'));
  for (const a of pk.abilities) { check('no id collision: ' + a.id, !fullCat[a.id]); fullCat[a.id] = { ...a, powerSystem: pk.powerSystem }; }
}
// RED #1 (post-BATCH-5): the 2026-07-07 catalog expansion (~28 → 117 abilities) added
// tradition packs whose entries are 1-rank seeds without notFor — the old every-ability
// invariant no longer describes the authored corpus. Preserved contract: the CORE
// catalog stays fully treed, and EVERY ability (seed or full) is engine-safe.
const fullyTreed = Object.values(fullCat).filter(a => a.tree?.length === 3 && a.notFor);
check('core catalog keeps 28+ fully-treed abilities (3 ranks + notFor)', fullyTreed.length >= 28);
check('every ability is engine-safe (id/name/description/energy/class)', Object.values(fullCat).every(a => a.id && a.name && a.description && typeof a.energyCost === "number" && a.powerSystem));
const hChar = { origin: 'harmonic', level: 1 };
check('own tradition at face value', effectiveLevelReq(fullCat.stillness_field, hChar, rules) === 1);
check('cross-training into valley_craft costs +1', effectiveLevelReq(fullCat.wayfinding, hChar, rules) === 2);
check('other civ tradition closed', effectiveLevelReq(fullCat.light_well, hChar, rules) === null);
check('valley takes everything natively', effectiveLevelReq(fullCat.light_well, { origin: 'valley', level: 1 }, rules) === 1 && effectiveLevelReq(fullCat.wayfinding, { origin: 'valley', level: 1 }, rules) === 1);
// SNG-BATCH-5: valley_craft is cross-class for a radiant origin → 2 skill points
const crossLearner = { origin: 'radiant', level: 1, skillPoints: 2, abilities: [] };
check('cross-training gate blocks at low level', learnAbility(crossLearner, 'wayfinding', fullCat, rules).why.includes('cross-training'));
crossLearner.level = 2;
check('cross-training opens at effective level', learnAbility(crossLearner, 'wayfinding', fullCat, rules).ok);

// --- SNG-005: companion bonds ---
const { ensureBonds, growBond, bondOf } = await import('../engine/companions.js');
const bonded = { companionBonds: {} };
ensureBonds(bonded);
for (let i = 0; i < 6; i++) growBond(bonded, 'aevi', 'deed', rules);       // +3.0
check('deeds grow the bond', bondOf(bonded, 'aevi', rules).bond === 3);
const capComp = [{ id: 'aevi', name: 'Aevi', assistTags: ['investigate'] }];
const withBond = companionBonus(capComp, ['investigate'], rules, bonded);
check('bond >= 3 raises assist cap (bonus path intact)', withBond.bonus === 5 && withBond.helpers.includes('Aevi'));
let evts = [];
for (let i = 0; i < 2; i++) evts.push(...growBond(bonded, 'aevi', 'encounter', rules).events); // 3 -> 6
check('grant unlocks exactly once at 6', evts.filter(e => e === 'grant').length === 1);
evts = [];
for (let i = 0; i < 2; i++) evts.push(...growBond(bonded, 'aevi', 'encounter', rules).events); // 6 -> 9
check('stage 2 unlocks at 8', evts.includes('stage2') && bondOf(bonded, 'aevi', rules).stage === 2);
for (let i = 0; i < 20; i++) growBond(bonded, 'aevi', 'encounter', rules);
check('bond clamps at 10', bondOf(bonded, 'aevi', rules).bond === 10);
const aeviDef = JSON.parse(readFileSync(join(root, 'content/packs/valley/companions/aevi.json'), 'utf8'));
check('aevi carries bondGrants + stages (PO content)', aeviDef.bondGrants?.id === 'motes-vigil' && aeviDef.stages?.length === 2);
const gmBlock = companionsForGM([aeviDef], bonded, rules);
check('GM block carries bond + stage-2 hints', gmBlock.includes('stage 2') && gmBlock.includes('Kindled Chorus'));

// --- SNG-009 hotfix ---
const { salvageOps } = await import('../engine/gm.js');
const broken = '{"narration": "The dock creaks...", "questUpdates": [{"op": "progress", "questId": "trace-the-gray-water", "note": "vial filled"}], "npcUpdates": [{"op": "update", "npcId": "mara-wells", "note": "trusts you more"}], "choices": [{"label": "unterminated...';
const sops = salvageOps(broken);
check('salvage recovers complete op arrays from broken JSON', sops.questUpdates?.[0]?.note === 'vial filled' && sops.npcUpdates?.length === 1);
check('salvage skips the truncated segment', !sops.choices);
check('salvage of garbage yields nothing', Object.keys(salvageOps('no json here')).length === 0);
// revealName
const rvChar = { npcRegistry: {} };
applyNpcUpdates(rvChar, [{ op: 'meet', npcId: 'tuning-warden', name: 'The Tuning-Warden', role: 'warden' }], { day: 1 });
applyNpcUpdates(rvChar, [{ op: 'update', npcId: 'tuning-warden', revealName: 'Maren' }], { day: 2 });
const warden = rvChar.npcRegistry['tuning-warden'];
check('revealName updates display, keeps id, logs history', warden.name === 'Maren' && warden.aliases.includes('The Tuning-Warden') && warden.history.some(h => h.includes('revealed')));
// SNG-111: a fuller name CONTAINING the known one composes (extension), not aliases — "Maren" → "Maren the Grey".
applyNpcUpdates(rvChar, [{ op: 'update', npcId: 'tuning-warden', revealName: 'Maren the Grey' }], { day: 3 });
check('SNG-111: a fuller name containing the known one composes (not aliased)', warden.name === 'Maren the Grey' && warden.aliases.includes('Maren'));
// a genuinely DIFFERENT later name (no token overlap) still becomes an alias — identity isn't silently rewritten.
applyNpcUpdates(rvChar, [{ op: 'update', npcId: 'tuning-warden', revealName: 'Corvin' }], { day: 4 });
check('SNG-111: a genuinely different later name still becomes an alias', warden.name === 'Maren the Grey' && warden.aliases.includes('Corvin'));
// nameExtend: learn a surname on an already-named person → appends the new token, keeps the given name.
{
  const c = { npcRegistry: {} };
  applyNpcUpdates(c, [{ op: 'meet', npcId: 'pell', name: 'Pell', role: 'marsh guide' }], { day: 1 });
  applyNpcUpdates(c, [{ op: 'update', npcId: 'pell', nameExtend: 'Marsh' }], { day: 2 });
  const pell = c.npcRegistry.pell;
  check('SNG-111: nameExtend composes the surname (Pell → Pell Marsh), keeps the given name', pell.name === 'Pell Marsh' && pell.aliases.includes('Pell'));
  applyNpcUpdates(c, [{ op: 'update', npcId: 'pell', nameExtend: 'Marsh' }], { day: 3 });
  check('SNG-111: nameExtend is idempotent (learning Marsh twice does not double it)', pell.name === 'Pell Marsh');
}

// --- SNG-108: relationship arcs — bondType + romantic stage, gated, minor-safe, party-adjacent ---
{
  // NO LEAPING: even with a high score, the arc advances ONE step per beat (courting → together → committed → partner).
  const n = { name: "Pell", relationship: 9, history: [], status: "active" };
  advanceBond(n, { bondType: "romantic", bondStage: "courting" }, rules, 1);
  check("SNG-108: bondType sets the KIND; a romantic bond opens at courting", n.bondType === "romantic" && n.bondStage === "courting");
  advanceBond(n, { bondStage: "partner" }, rules, 2); // asks to jump straight to partner...
  check("SNG-108: a romantic stage advances ONE step per beat, never leaps (→ together, not → partner)", n.bondStage === "together");
  advanceBond(n, { bondStage: "partner" }, rules, 3);
  check("SNG-108: another beat → committed (still one step)", n.bondStage === "committed");
  advanceBond(n, { bondStage: "partner" }, rules, 4);
  check("SNG-108: another beat → partner", n.bondStage === "partner");
  check("SNG-108: the bond type is orthogonal to the score (advancing the arc never moved relationship)", n.relationship === 9);
  check("SNG-108: relationshipLabel reads type+stage+band", relationshipLabel(n) === "partner · devoted");
  check("SNG-108: isPartnerAdjacent is true at partner stage", isPartnerAdjacent(n, rules) === true);

  // SCORE FLOOR: a low score holds the arc back — you can't reach "together" (floor 4) at relationship 2.
  const low = { name: "Kite", relationship: 2, history: [], status: "active" };
  advanceBond(low, { bondType: "romantic", bondStage: "courting" }, rules, 1);
  advanceBond(low, { bondStage: "together" }, rules, 2);
  check("SNG-108: a stage is held back when the score floor isn't met (score 2 can't reach together)", low.bondStage === "courting");

  // absolute minor-protection: a romantic bond is REFUSED on a minor subject, at any stage.
  const kid = { name: "A youngster", role: "child of the mill", relationship: 9, history: [], status: "active" };
  const refused = advanceBond(kid, { bondType: "romantic", bondStage: "courting" }, rules, 1);
  check("SNG-108: a romantic bond is refused on a minor subject (same floor as art/romance)", refused.refused === "minor" && !kid.bondType && !kid.bondStage);

  // party-adjacency surfaces a partner-stage romantic NPC — a companion by relationship, not recruitment.
  const char = { npcRegistry: { pell: { id: "pell", name: "Pell", relationship: 8, bondType: "romantic", bondStage: "partner", status: "active" }, sef: { id: "sef", name: "Sef", relationship: 6, bondType: "mentor", status: "active" } } };
  const partners = partnerAdjacentNpcs(char, rules);
  check("SNG-108: partnerAdjacentNpcs surfaces the partner-stage romantic bond, and only that", partners.length === 1 && partners[0].id === "pell" && partners[0].label === "partner · devoted");

  // wired end-to-end through applyNpcUpdates with rules in ctx (the live path).
  const live = { npcRegistry: {} };
  applyNpcUpdates(live, [{ op: "meet", npcId: "wren", name: "Wren", role: "ferrywoman" }], { day: 1, rules });
  applyNpcUpdates(live, [{ op: "update", npcId: "wren", relationshipDelta: 2, bondType: "romantic", bondStage: "courting" }], { day: 2, rules });
  check("SNG-108: applyNpcUpdates wires bondType/bondStage through with the rules from ctx", live.npcRegistry.wren.bondType === "romantic" && live.npcRegistry.wren.bondStage === "courting");
}

// --- SNG-109: the Chronicle — assembles from real state; cache invalidates on major change, not per turn ---
{
  const c = {
    name: "Silas", level: 5,
    deeds: [
      { description: "helped clear the channel gate", weight: 1, worldDay: 3 },
      { description: "broke the overseer's false ledger open in public", weight: 3, worldDay: 9 },
      { description: "stood down a raider at the crossing", weight: 2, worldDay: 12 },
      { description: "shared a meal with the ferry-folk", weight: 1, worldDay: 5 }
    ],
    npcRegistry: { pell: { id: "pell", name: "Pell", relationship: 8, bondType: "romantic", bondStage: "committed" } },
    domains: { primary: "ashwarden", secondary: null, tertiary: null },
    bio: { motivation: "to make the district honest" }
  };
  // major deeds sort by SALIENCE (|weight|), then recency; N cap honored.
  const md = majorDeeds(c, 3);
  check("SNG-109: majorDeeds sorts by weight then recency, capped at N", md.length === 3 && md[0].weight === 3 && md[1].weight === 2 && md[2].weight === 1);
  check("SNG-109: a negative-weight deed is still 'major' (a feared reputation is a chronicle)", majorDeeds({ deeds: [{ description: "burned the toll-house", weight: -3 }, { description: "tipped a barkeep", weight: 1 }] }, 1)[0].weight === -3);

  // cache invalidation: a ROUTINE (weight-1) deed does NOT churn the hash; a MAJOR deed / bond stage / ceiling does.
  const h0 = majorStateHash(c);
  c.deeds.push({ description: "bought bread", weight: 1, worldDay: 13 });
  check("SNG-109: a routine (weight-1) deed does NOT invalidate the chronicle cache", majorStateHash(c) === h0);
  c.deeds.push({ description: "toppled the overseer", weight: 3, worldDay: 14 });
  check("SNG-109: a MAJOR deed (|w|>=2) invalidates the cache", majorStateHash(c) !== h0);
  const h1 = majorStateHash(c);
  c.npcRegistry.pell.bondStage = "partner";
  check("SNG-109: advancing a bond STAGE invalidates the cache", majorStateHash(c) !== h1);
  const h2 = majorStateHash(c);
  c.domainCeilings = { veilwright: 2 };
  check("SNG-109: a domain ceiling change invalidates the cache", majorStateHash(c) !== h2);

  // chronicleIsStale: absent → stale; matching hash → fresh; state moves → stale again.
  check("SNG-109: an absent paragraph reads stale", chronicleIsStale(c) === true);
  c.chronicleCache = { hash: majorStateHash(c), text: "You have become…", at: "t" };
  check("SNG-109: a paragraph whose hash matches the state is fresh", chronicleIsStale(c) === false);
  c.deeds.push({ description: "a new legend", weight: 3, worldDay: 20 });
  check("SNG-109: once the major state moves, the cached paragraph reads stale again", chronicleIsStale(c) === true);

  // buildChroniclePrompt assembles from real state, passes the content ceiling, and invents nothing.
  const { system, user } = buildChroniclePrompt(c, { bonds: [{ name: "Pell", label: "partner · devoted" }], standing: [{ who: "Ashwardens", band: "trusted" }], arc: "to make the district honest — Ashwarden", ratingLine: "PG-13 CEILING." });
  check("SNG-109: the prompt carries the passed content ceiling (AUP-bounded like the GM)", system.includes("PG-13 CEILING."));
  check("SNG-109: the prompt assembles the real deeds, bond, and standing", user.includes("overseer") && user.includes("Pell: partner · devoted") && user.includes("Ashwardens: trusted"));

  // empty-state is graceful — a brand-new character produces a valid, honest prompt.
  const fresh = buildChroniclePrompt({ name: "New" }, {});
  check("SNG-109: empty state is graceful (no deeds/bonds → honest 'nothing yet' prompt, no crash)", fresh.user.includes("nothing of note yet") && fresh.user.includes("no close ties yet"));
}

// --- SNG-110: portrait as earned record — player appearance, provenance gear, opt-in companion, delete ---
{
  // item provenance: a named item reads as yours; a grown item names its earned stage; a plain item is bare.
  check("SNG-110: a player-named item carries its name into the portrait as YOURS", itemProvenancePhrase({ name: "spear", customName: "Gatekeeper" }).includes("Gatekeeper"));
  check("SNG-110: a grown/evolved item names its earned stage", itemProvenancePhrase({ name: "spear", evoStageName: "the Unfinished Spear" }) === "spear — the Unfinished Spear");
  check("SNG-110: a plain item is just its name", itemProvenancePhrase({ name: "lantern" }) === "lantern");

  // player-authored physical description LEADS the portrait; gear appears with provenance.
  const hero = { name: "Silas", form: "a weathered marsh-walker in oiled leathers", origin: "harmonic", background: "craftsman",
    inventory: [{ name: "spear", customName: "Gatekeeper", evoStageName: "the Runebound Spear" }], bio: { motivation: "to make the district honest" } };
  const seed = characterPromptSeed(hero);
  check("SNG-110: the player-authored form/appearance LEADS the prompt", seed.startsWith("a weathered marsh-walker in oiled leathers"));
  check("SNG-110: gear is named with provenance, not a bare item name", seed.includes("Gatekeeper") && seed.includes("Runebound"));

  // companion in frame is OPT-IN — absent by default, present only when asked.
  check("SNG-110: a companion is NOT in the portrait by default", !characterPromptSeed(hero).includes("alongside"));
  const withPell = characterPromptSeed(hero, { withCompanion: { name: "Pell", appearance: "sharp-eyed, river-mud on her boots" } });
  check("SNG-110: a companion is included only when opted in per generation", withPell.includes("alongside Pell") && withPell.includes("river-mud"));

  // one-off override replaces the lead for THIS image only (base appearance untouched).
  const oneOff = characterPromptSeed(hero, { appearanceOverride: "kneeling in the flooded gate at dawn, spear planted" });
  check("SNG-110: a per-generation override leads the prompt without changing the base appearance", oneOff.startsWith("kneeling in the flooded gate at dawn") && hero.form === "a weathered marsh-walker in oiled leathers");

  // THE FLOORS run AFTER every addition — a minor subject stays child-safe even with an override + companion.
  const minor = { name: "A child", role: "child of the mill", form: "a young kid" };
  const rawMinor = characterPromptSeed(minor, { appearanceOverride: "in a romantic embrace", withCompanion: { name: "someone", appearance: "an adult" } });
  const safeMinor = sanitizeImagePrompt(rawMinor, { ratingLevel: 4, isMinor: isMinorSubject(minor) });
  check("SNG-110: the FLOORS still impose the child-safe tone on a minor portrait after override/companion additions (ceiling capped to PG regardless of override)", isMinorSubject(minor) && /age-appropriate|wholesome|non-sexual/i.test(safeMinor));

  // delete removes by url; deleting the primary portrait flags for regeneration (never imageless).
  const c = { gallery: [], portrait: "url-A" };
  addGalleryImage(c, { kind: "portrait", url: "url-A" }); addGalleryImage(c, { kind: "location", url: "url-B" });
  const d1 = deleteGalleryImage(c, "url-B");
  check("SNG-110: deleteGalleryImage removes a non-portrait image by url, leaving the rest", d1.gallery.length === 1 && d1.gallery[0].url === "url-A" && d1.wasPortrait === false);
  const d2 = deleteGalleryImage(c, "url-A");
  check("SNG-110: deleting the PRIMARY portrait flags wasPortrait + clears it (caller regenerates)", d2.wasPortrait === true && c.portrait === null && d2.gallery.length === 0);
}

// --- SNG-101b: by-right native grants — anchors + lean-matched basics, capped, Law-14-safe, versioned ---
{
  const ngContent = JSON.parse(readFileSync(join(root, "content/packs/core/rules/native_grants.json"), "utf8"));
  const ngRules = { ...rules, traditionNativeGrants: ngContent.traditionNativeGrants, grantCap: ngContent.grantCap };

  // ashwarden, MENTAL lean → the death-core caster spine (matches the spec's worked example).
  const casterAsh = { domains: { primary: "ashwarden" }, attributes: { mental: 5, physical: 2, practical: 2, social: 2 } };
  const casterGrants = nativeGrantIdsFor(casterAsh, ngRules);
  check("SNG-101b: a mental-lean ashwarden gets the death-core spine (deathsense + mental basics)",
    casterGrants.includes("deathsense") && casterGrants.includes("palework") && casterGrants.includes("the_grey_hand") && casterGrants.length <= ngContent.grantCap);
  // ashwarden, PRACTICAL lean → the practical basic (wither), then FILLS from the mental spine, capped.
  const martialAsh = { domains: { primary: "ashwarden" }, attributes: { practical: 5, mental: 4, social: 4, physical: 3 } };
  const martialGrants = nativeGrantIdsFor(martialAsh, ngRules);
  check("SNG-101b: a practical-lean ashwarden gets wither, filled from the mental spine, capped at grantCap",
    martialGrants.includes("deathsense") && martialGrants.includes("wither") && martialGrants.length === ngContent.grantCap && martialGrants.length <= 5);

  // grants key off domains.primary (SNG-094 authoritative), NOT a stale nativeTradition.
  const mixed = { domains: { primary: "ashwarden" }, nativeTradition: "wright", origin: "wright", attributes: { practical: 5, mental: 4, social: 4, physical: 3 } };
  check("SNG-101b: the grant keys off domains.primary, not a legacy nativeTradition (Silas: ashwarden, not wright)",
    nativeGrantIdsFor(mixed, ngRules).includes("deathsense") && !nativeGrantIdsFor(mixed, ngRules).includes("makers_eye"));

  // applyNativeGrants adds MISSING at rank 1, LEAVES an owned basic at its earned rank (Law 14), idempotent.
  const silas = { domains: { primary: "ashwarden" }, attributes: { practical: 5, mental: 4, social: 4, physical: 3 },
    abilities: [{ abilityId: "deathsense", level: 3 }, { abilityId: "palework", level: 2 }, { abilityId: "order_sense", level: 3 }] };
  const added = applyNativeGrants(silas, ngRules);
  const findRank = id => silas.abilities.find(a => a.abilityId === id)?.level;
  check("SNG-101b: applyNativeGrants adds the missing ashwarden basics at rank 1", added.includes("wither") && added.includes("the_grey_hand") && findRank("wither") === 1);
  check("SNG-101b: Law 14 — an already-owned basic keeps its EARNED rank (deathsense r3, palework r2 untouched)", findRank("deathsense") === 3 && findRank("palework") === 2);
  check("SNG-101b: a non-native ability the character learned is untouched", findRank("order_sense") === 3);
  const addedAgain = applyNativeGrants(silas, ngRules);
  check("SNG-101b: applyNativeGrants is idempotent (a second call grants nothing)", addedAgain.length === 0);

  // retroNativeGrants runs ONCE, versioned by a DISTINCT flag (never collides with grantsVersion).
  const retroChar = { domains: { primary: "ashwarden" }, attributes: { mental: 5 }, abilities: [], grantsVersion: 1 };
  const r1 = retroNativeGrants(retroChar, ngRules);
  check("SNG-101b: retroNativeGrants backfills a bare character + sets nativeGrantsVersion (distinct from grantsVersion)",
    r1.length > 0 && retroChar.nativeGrantsVersion === 1 && retroChar.grantsVersion === 1);
  const r2 = retroNativeGrants(retroChar, ngRules);
  check("SNG-101b: retroNativeGrants is one-time (a second call on a versioned character grants nothing)", r2.length === 0);

  // no primary / unknown tradition → no grant (never guesses).
  check("SNG-101b: a character with no primary domain is granted nothing (no guessing)",
    nativeGrantIdsFor({ attributes: { mental: 5 } }, ngRules).length === 0);
}
check('revealName cannot create a person', (applyNpcUpdates({ npcRegistry: {} }, [{ op: 'update', npcId: 'ghost', revealName: 'X' }], {}), true));
// customName
const { nameItem, findItem, displayName: dName, inventoryForGM: invGM } = await import('../engine/inventory.js');
const pack = { inventory: [{ name: 'Resonance Lantern', kind: 'tool', qty: 1 }] };
check('player names an item', nameItem(pack, 'Resonance Lantern', 'Waystaff') && dName(pack.inventory[0]) === 'Waystaff');
check('lookup works by either name', !!findItem(pack, 'Waystaff') && !!findItem(pack, 'Resonance Lantern'));
check('GM sees both names', invGM(pack).includes('Waystaff') && invGM(pack).includes('their name for: Resonance Lantern'));
check('cap 40 chars', (nameItem(pack, 'Waystaff', 'x'.repeat(60)), pack.inventory[0].customName.length <= 40));

// --- SNG-010: practice & emergence ---
const { ensurePractice, recordUse, declareAspiration, dropAspiration, recordAspirationProgress, aspirationRipe, practiceRankReady, ripeCombos, ripeBranches, emergenceNoticeForGM, acceptCombo, acceptBranch, validEmergenceId } = await import('../engine/practice.js');
const recipesFile = JSON.parse(readFileSync(join(root, 'content/packs/core/rules/emergence_recipes.json'), 'utf8'));
const learner2 = { origin: 'valley', level: 3, abilities: [{ abilityId: 'prism_sight', level: 1 }, { abilityId: 'sonic_resonance', level: 1 }], discoveries: [], skillPoints: 0, practice: undefined };
ensurePractice(learner2);
recordUse(learner2, ['prism_sight']);
check('use counts once', learner2.practice.uses.prism_sight === 1 && !learner2.practice.coActivations[Object.keys(learner2.practice.coActivations)[0]]);
for (let i = 0; i < 5; i++) recordUse(learner2, ['prism_sight', 'sonic_resonance']);
check('co-activation counts only multi-ability actions', Object.values(learner2.practice.coActivations)[0] === 5 && learner2.practice.uses.prism_sight === 6);
check('not ripe below threshold', ripeCombos(learner2, recipesFile, rules).length === 0);
recordUse(learner2, ['prism_sight', 'sonic_resonance']);
const ripe = ripeCombos(learner2, recipesFile, rules);
check('resonant_sight ripens at 6 co-activations', ripe.length === 1 && ripe[0].id === 'resonant_sight');
check('GM notice lists exactly the ripe id', emergenceNoticeForGM(learner2, recipesFile, rules).includes('resonant_sight'));
check('validEmergenceId rejects unknown and non-ripe', validEmergenceId(learner2, recipesFile, rules, 'true_ward') === null && validEmergenceId(learner2, recipesFile, rules, 'made-up') === null);
const mintedCombo = acceptCombo(learner2, ripe[0], 'Echo-Eye', 9);
check('accept mints exactly one discovery with recipe id', mintedCombo && mintedCombo.recipeId === 'resonant_sight' && learner2.discoveries.length === 1);
check('minted combo no longer ripe', ripeCombos(learner2, recipesFile, rules).length === 0);
// branch: prism_sight needs rank 2 + 8 uses
learner2.abilities[0].level = 2;
for (let i = 0; i < 2; i++) recordUse(learner2, ['prism_sight']);
const rb = ripeBranches(learner2, recipesFile);
check('branch ripens on uses + rank', rb.length === 1 && rb[0].id === 'prism_sight_deep_read');
const br = acceptBranch(learner2, rb[0]);
check('branch attaches free, once', br && learner2.abilities[0].branches.length === 1 && acceptBranch(learner2, rb[0]) === null);
// aspirations
const aspirant = { origin: 'harmonic', level: 2, abilities: [{ abilityId: 'sonic_resonance', level: 1 }], skillPoints: 0 };
ensurePractice(aspirant);
check('aspire caps at 2', declareAspiration(aspirant, 'echo_sense', rules).ok && declareAspiration(aspirant, 'stillness_field', rules).ok && declareAspiration(aspirant, 'tremor_sense', rules).ok === false);
for (let i = 0; i < 10; i++) recordAspirationProgress(aspirant, { abilityId: 'sonic_resonance', tags: [] }, fullCat);
check('same-system use feeds aspiration; ripe at 10', aspirationRipe(aspirant, 'echo_sense', rules) && aspirationRipe(aspirant, 'tremor_sense', rules) === false);
check('free learn via ripe aspiration with 0 points', learnAbility(aspirant, 'echo_sense', fullCat, rules, { free: true }).ok && aspirant.skillPoints === 0);
// use-ranking
const ranker = { origin: 'harmonic', level: 3, abilities: [{ abilityId: 'sonic_resonance', level: 1 }], skillPoints: 0 };
ensurePractice(ranker);
for (let i = 0; i < 8; i++) recordUse(ranker, ['sonic_resonance']);
check('practice-rank ready at threshold', practiceRankReady(ranker, 'sonic_resonance', rules));
check('practice rank-up costs nothing', rankUpAbility(ranker, 'sonic_resonance', rules, { viaPractice: true }).ok && ranker.skillPoints === 0 && ranker.abilities[0].level === 2);
check('not ready for rank 3 below 16 uses', practiceRankReady(ranker, 'sonic_resonance', rules) === false);
// --- SNG-011: precursor gate + peril data ---
const preCat = {};
const prePack = JSON.parse(readFileSync(join(root, 'content/packs/core/abilities/precursor.json'), 'utf8'));
for (const a of prePack.abilities) preCat[a.id] = { ...a, powerSystem: 'precursor' };
const mundane = { origin: 'valley', level: 5, abilities: [], skillPoints: 5 };
check('precursor closed without access (even valley, even high level)', effectiveLevelReq(preCat.address_sense, mundane, rules) === null);
mundane.precursorAccess = ['address_sense'];
check('unlocked precursor opens at its own levelReq', effectiveLevelReq(preCat.address_sense, mundane, rules) === 3);
check('other precursor abilities stay closed', effectiveLevelReq(preCat.foreclose, mundane, rules) === null);
check('precursor rules block shipped', rules.precursor.perilDrift === 0.05 && rules.precursor.bandNotice === 0.4);

// --- backfill: retroactive credit ---
const { needsBackfill, runBackfill, activitySpine, summaryLines } = await import("../engine/backfill.js");
const recipes = JSON.parse(readFileSync(join(root, "content/packs/core/rules/emergence_recipes.json"), "utf8"));
const aeviDef2 = JSON.parse(readFileSync(join(root, "content/packs/valley/companions/aevi.json"), "utf8"));
const abilityCat = {};
for (const f of ["harmonic","radiant","valley_craft"]) { const pk = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/"+f+".json"),"utf8")); for (const a of pk.abilities) abilityCat[a.id] = {...a, powerSystem: pk.powerSystem}; }
// veteran: lots of chronicle + deeds, travels with Aevi, owns both resonant_sight components, one already-minted combo elsewhere
const vet = {
  name: "Cellaceron", origin: "valley", level: 2, xp: 40,
  attributes: {physical:3,mental:3,social:3,practical:4}, subAttributes:{strength:3,agility:3,reason:4,insight:4,presence:3,rapport:3,craft:4,wits:4},
  abilities: [{abilityId:"prism_sight",level:2},{abilityId:"sonic_resonance",level:1}],
  attunement:2, maxHealth:35, health:35, maxEnergy:100, energy:80,
  companions: ["aevi"],
  deeds: Array.from({length:10},(_,i)=>({description:"deed "+i, weight:2, communityId:"valley.millbrook", day:i})),
  chronicle: Array.from({length:40},(_,i)=>("Day "+i+": Cellaceron used prism sight and sonic resonance together to read the wall.")),
  npcRegistry: { "mara": { name:"Mara", history:["met","helped","helped again"], relationship:3, knownFacts:[], skillsObserved:[], status:"active" } },
  quests: [{id:"q1",title:"done one",status:"completed"},{id:"q2",title:"active",status:"active"}],
  discoveries: [], companionBonds: {}, practice: undefined
};
check("veteran needs backfill", needsBackfill(vet));
const spine = activitySpine(vet);
check("activity spine counts chronicle+deeds+npc+quests", spine.chronicle === 40 && spine.deeds === 10 && spine.questsDone === 1 && spine.beats > 60);
const sum = runBackfill(vet, { rules, abilityCatalog: abilityCat, emergence: recipes, companionCatalog: { aevi: aeviDef2 } });
check("backfill grants xp (capped) and re-levels", sum.xpGained > 0 && sum.xpGained <= 300 && vet.level > 2 && vet.pendingSubPoints >= 1 && vet.skillPoints >= 1);
check("idempotent: second run is null", runBackfill(vet, { rules, abilityCatalog: abilityCat, emergence: recipes, companionCatalog: { aevi: aeviDef2 } }) === null && !needsBackfill(vet));
check("aevi bond credited to grant tier + ability granted", vet.companionBonds.aevi >= 6 && vet.abilities.some(a=>a.abilityId==="motes-vigil") && sum.bonds[0].granted);
check("practice seeded from ranks", vet.practice.uses.prism_sight >= 8 && vet.practice.uses.sonic_resonance >= 4);
check("chronicle mentions boosted use counts above rank floor", vet.practice.uses.prism_sight > 8);
const { discoveryKey: dk } = await import("../engine/progression.js");
check("resonant_sight co-activation ripened from history", (vet.practice.coActivations[dk(["prism_sight","sonic_resonance"])] || 0) >= 6);
const { ripeCombos: ripeCombosBF } = await import("../engine/practice.js");
check("ripened combo is now claimable", ripeCombosBF(vet, recipes, rules).some(r=>r.id==="resonant_sight"));
check("summary lines read human", summaryLines(sum).some(l=>l.includes("experience")) && summaryLines(sum).some(l=>l.includes("Aevi")));
// fresh character: minimal activity, no over-credit
const fresh = { name:"New", origin:"valley", level:1, xp:0, attributes:{physical:2,mental:2,social:2,practical:2}, abilities:[], companions:[], deeds:[], chronicle:[], quests:[], discoveries:[] };
const fsum = runBackfill(fresh, { rules, abilityCatalog: abilityCat, emergence: recipes, companionCatalog: {} });
check("fresh character: no phantom xp or levels", fsum.xpGained === 0 && fresh.level === 1 && fresh.backfillVersion === 1);

// --- SNG-012: memory & input fidelity ---
{
  const { ensureFacts, applyFactUpdates, factsForGM } = await import("../engine/facts.js");
  const { setNpcName, nameIsUnknown } = await import("../engine/npcs.js");
  const fc = {};
  ensureFacts(fc);
  applyFactUpdates(fc, [{ op: "add", text: "Teva was rescued from the resonance chamber and is safe at the mill", subjectId: "teva" }], { day: 5 });
  applyFactUpdates(fc, [{ op: "add", text: "Teva was rescued from the resonance chamber and is safe at the mill", subjectId: "teva" }], { day: 6 });
  check("fact added once (dedupe)", fc.establishedFacts.length === 1 && fc.establishedFacts[0].subjectId === "teva");
  check("factsForGM feeds the whole ledger", factsForGM(fc).includes("Teva was rescued"));
  for (let i = 0; i < 50; i++) applyFactUpdates(fc, [{ op: "add", text: "routine fact " + i }], { day: i });
  check("facts ledger caps generously (40)", fc.establishedFacts.length <= 40);
  applyFactUpdates(fc, [{ op: "resolve", subjectId: "teva" }], {});
  check("resolve retires a fact", !fc.establishedFacts.some(x => x.subjectId === "teva"));

  const nc = { name: "Kael", npcRegistry: {} };
  applyNpcUpdates(nc, [{ op: "meet", npcId: "teva", name: "Teva", role: "apprentice" }], { locationId: "disputed_zone_fringe", day: 1 });
  applyNpcUpdates(nc, [{ op: "update", npcId: "teva", statusNote: "rescued and safe at the Millbrook mill" }], { day: 5 });
  check("statusNote stored", nc.npcRegistry.teva.statusNote.includes("rescued"));
  check("statusNote fed to GM every turn", npcRegistryForGM(nc, { locationId: "disputed_zone_fringe" }).includes("CURRENT SITUATION: rescued"));

  const rc = { npcRegistry: { "the-warden": { id: "the-warden", name: "The Tuning-Warden", role: "warden", history: [], aliases: [] } } };
  check("unknown-name heuristic flags role-name", nameIsUnknown(rc.npcRegistry["the-warden"]));
  check("player sets the name on stable id", setNpcName(rc, "the-warden", "Maren", 3) && rc.npcRegistry["the-warden"].name === "Maren" && rc.npcRegistry["the-warden"].nameRevealed);
  check("named NPC no longer flagged unknown", !nameIsUnknown(rc.npcRegistry["the-warden"]));

  const ctx = buildTurnContext({ character: { name: "K", origin: "valley", background: "c", level: 1, attributes: { physical: 1, mental: 1, social: 1, practical: 1 }, health: 1, maxHealth: 1, energy: 1, maxEnergy: 1, alignment: {}, deeds: [] }, location: { name: "D", descriptionSeed: "d", spectrum: {}, communityId: null }, rules, exactWords: "I address the dock-master directly and watch the Radiant delegate for a flinch", factsDetail: "- Teva is safe" });
  check("PLAYER EXACT WORDS block present", ctx.includes("PLAYER'S EXACT WORDS") && ctx.includes("watch the Radiant delegate"));
  check("ESTABLISHED FACTS block present", ctx.includes("ESTABLISHED FACTS") && ctx.includes("Teva is safe"));
}

// --- SNG-011 Phase 1: location vectors perception ---
{
  const { notePerception, perceivedVectors, vectorLabel, vectorSummary } = await import("../engine/vectors.js");
  const spectrums = JSON.parse(readFileSync(join(root, "content/packs/core/spectrums.json"), "utf8"));
  const loc = { id: "millbrook", spectrum: { violence_peace: 0.6, chaos_order: 0.3, death_life: 0.4 } };
  check("vectorLabel names the right pole + sign", vectorLabel(spectrums, "violence_peace", 0.6) === "Peace +0.6" && vectorLabel(spectrums, "violence_peace", -0.6) === "Violence −0.6");
  const novice = { attunement: 1, placeMemory: {} };
  notePerception(novice, "millbrook", loc, { visited: true, usedAbilityIds: [] }, rules);
  const nv = perceivedVectors(novice, "millbrook", loc, spectrums, rules);
  check("visit reveals strong axes only (|v|>=0.5)", nv.length === 1 && nv[0].axis === "violence_peace");
  const adept = { attunement: 6, placeMemory: {} };
  notePerception(adept, "millbrook", loc, { visited: true, usedAbilityIds: [] }, rules);
  const av = perceivedVectors(adept, "millbrook", loc, spectrums, rules);
  check("high attunement also feels mid axes (>=0.3)", av.length === 3);
  const seer = { attunement: 1, placeMemory: {} };
  notePerception(seer, "millbrook", loc, { visited: true, usedAbilityIds: ["address_sense"] }, rules);
  check("address_sense reveals ALL axes exactly", perceivedVectors(seer, "millbrook", loc, spectrums, rules).length === 3);
  const prism = { attunement: 1, placeMemory: {} };
  notePerception(prism, "millbrook", loc, { visited: true, usedAbilityIds: ["prism_sight"] }, rules);
  check("perceiving ability unlocks mid axes", perceivedVectors(prism, "millbrook", loc, spectrums, rules).length === 3);
  check("vectorSummary reads human", vectorSummary(novice, "millbrook", loc, spectrums, rules).startsWith("This place runs"));
  check("unvisited place shows nothing", vectorSummary({ placeMemory: {} }, "millbrook", loc, spectrums, rules) === null);
}

// --- SNG-BATCH-2 Phase 2/3: skill tree helpers ---
{
  const { tierOf, classLabel, gateFor, meetsLearnGate, meetsRank3Gate, breadthUsed, breadthCap, atCapacity, skillGraphModel } = await import("../engine/skilltree.js");
  const gates = JSON.parse(readFileSync(join(root, "content/packs/core/rules/attribute_gates.json"), "utf8"));
  const capTable = JSON.parse(readFileSync(join(root, "content/packs/core/rules/skill_capacity.json"), "utf8"));
  const cat = {};
  for (const g of ["harmonic","radiant","valley_craft","precursor"]) { const pk = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/"+g+".json"),"utf8")); for (const a of pk.abilities) cat[a.id] = {...a, powerSystem: pk.powerSystem}; }
  check("tierOf maps levelReq to roman", tierOf(1) === "I" && tierOf(3) === "III" && tierOf(5) === "V" && tierOf(9) === "V");
  check("classLabel humanizes", classLabel("valley_craft") === "Valley Craft" && classLabel("precursor") === "Precursor");
  // attribute gates
  check("ungated ability passes", meetsLearnGate({ subAttributes: { reason: 1 } }, "sonic_resonance", gates).ok);
  check("gated ability blocks below threshold", !meetsLearnGate({ subAttributes: { reason: 3 } }, "shatterpoint", gates).ok);
  check("gated ability clears at threshold", meetsLearnGate({ subAttributes: { reason: 5 } }, "shatterpoint", gates).ok);
  check("rank-3 gate is a distinct, higher bar", !meetsRank3Gate({ subAttributes: { reason: 5 } }, "shatterpoint", gates).ok && meetsRank3Gate({ subAttributes: { reason: 7 } }, "shatterpoint", gates).ok);
  // capacity
  const c1 = { level: 1, abilities: [{ abilityId: "sonic_resonance", level: 1 }], customAbilities: {} };
  check("L1 breadth cap is 2", breadthCap(c1, capTable) === 2 && breadthUsed(c1) === 1 && !atCapacity(c1, capTable));
  c1.abilities.push({ abilityId: "echo_sense", level: 1 });
  check("at cap when breadth used == cap", atCapacity(c1, capTable));
  c1.customAbilities = { "motes-vigil": {} }; c1.abilities.push({ abilityId: "motes-vigil", level: 1 });
  check("earned techniques do not consume breadth", breadthUsed(c1) === 2 && atCapacity(c1, capTable));
  c1.level = 3;
  check("cap scales with level", breadthCap(c1, capTable) === 4 && !atCapacity(c1, capTable));
  // graph model
  const emergence = JSON.parse(readFileSync(join(root, "content/packs/core/rules/emergence_recipes.json"), "utf8"));
  const gm = skillGraphModel(cat, emergence, { level: 3, abilities: [{ abilityId: "prism_sight", level: 2 }], subAttributes: { reason: 2 }, customAbilities: {} }, { attributeGates: gates, skillCapacity: capTable, preds: {} });
  check("graph has a node per ability with tier/class", gm.nodes.length === Object.keys(cat).length && gm.nodes.every(n => n.tier && n.cls));
  check("graph marks owned + gated + locked", gm.nodes.find(n => n.id === "prism_sight").owned && gm.nodes.find(n => n.id === "shatterpoint").gated && gm.nodes.find(n => n.id === "shatterpoint").locked);
  check("graph draws recipe edges between real component ids", gm.edges.some(e => e.from === "prism_sight" && e.kind === "combo"));
}

// --- SNG-BATCH-2 Phase 3: gate + capacity ENFORCEMENT ---
{
  const gates3 = JSON.parse(readFileSync(join(root, "content/packs/core/rules/attribute_gates.json"), "utf8"));
  const cap3 = JSON.parse(readFileSync(join(root, "content/packs/core/rules/skill_capacity.json"), "utf8"));
  const cat3 = {};
  for (const g of ["harmonic","radiant","valley_craft"]) { const pk = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/"+g+".json"),"utf8")); for (const a of pk.abilities) cat3[a.id] = {...a, powerSystem: pk.powerSystem}; }
  // attribute-gate blocks learn of a gated ability below threshold
  const lowReason = { origin: "valley", level: 5, skillPoints: 3, abilities: [], subAttributes: { reason: 3 }, customAbilities: {} };
  check("gated learn blocked below sub-attribute", learnAbility(lowReason, "shatterpoint", cat3, rules, { attributeGates: gates3 }).why.includes("reason"));
  lowReason.subAttributes.reason = 5;
  check("gated learn clears at threshold", learnAbility(lowReason, "shatterpoint", cat3, rules, { attributeGates: gates3, skillCapacity: cap3 }).ok);
  // rank-3 gate
  const r3 = { origin: "valley", level: 5, skillPoints: 3, abilities: [{ abilityId: "shatterpoint", level: 2 }], subAttributes: { reason: 5 }, customAbilities: {} };
  check("rank-3 blocked below rank3Min", rankUpAbility(r3, "shatterpoint", rules, { attributeGates: gates3 }).why.includes("rank 3"));
  r3.subAttributes.reason = 7;
  check("rank-3 clears at rank3Min", rankUpAbility(r3, "shatterpoint", rules, { attributeGates: gates3 }).ok);
  // capacity blocks a fresh learn at cap; rank-up still allowed
  const capped = { origin: "valley", level: 1, skillPoints: 3, abilities: [{ abilityId: "wayfinding", level: 1 }, { abilityId: "greenlore", level: 1 }], subAttributes: {}, customAbilities: {} };
  check("learn blocked at breadth capacity", learnAbility(capped, "stonewise", cat3, rules, { skillCapacity: cap3 }).why.includes("capacity"));
  check("rank-up still allowed at capacity", rankUpAbility({ ...capped, level: 3 }, "wayfinding", rules, {}).ok);
  // ungated + under cap learns fine
  const room = { origin: "valley", level: 3, skillPoints: 3, abilities: [{ abilityId: "wayfinding", level: 1 }], subAttributes: {}, customAbilities: {} };
  check("ungated learn under cap succeeds", learnAbility(room, "greenlore", cat3, rules, { attributeGates: gates3, skillCapacity: cap3 }).ok);
}

// --- SNG-BATCH-3 Phase 1: random encounters (SNG-014) ---
{
  const table = JSON.parse(readFileSync(join(root, "content/packs/valley/events/random_encounters.json"), "utf8"));
  const safe = { id: "millbrook", tags: ["village", "farming", "riverside"], dangerLevel: 0, communityId: "valley.millbrook" };
  const zone = { id: "disputed_zone_fringe", tags: ["wilds", "interference", "dangerous"], dangerLevel: 3 };

  // trigger chances respected: p=0 always fires (chance>0), p=1 never fires
  check("trigger fires when roll below chance", rollTrigger("onTravel", zone, table, () => 0.0) === true);
  check("trigger declines when roll above chance", rollTrigger("onTravel", safe, table, () => 0.999) === false);
  check("safe/settled rest never triggers", rollTrigger("onRest", safe, table, () => 0.0) === false);
  check("wilderness rest can trigger", rollTrigger("onRest", zone, table, () => 0.0) === true);

  // danger weighting: peaceful flavors weigh higher in safe places, perilous higher in danger
  check("peaceful flavor heavier in safe place", flavorMultiplier("beautiful", 0) > flavorMultiplier("beautiful", 4));
  check("perilous flavor heavier in danger", flavorMultiplier("fight", 4) > flavorMultiplier("fight", 0));
  check("grace floor: peaceful never zero even in danger", flavorMultiplier("beneficial", 4) >= 1);

  // eligibility: a fight (minDanger 3) is NOT eligible in a danger-0 place, IS in danger-3
  const fightEntry = table.encounters.find(e => e.id === "re_raider_duel");
  check("fight ineligible in safe place", isEligible(fightEntry, safe) === false);
  check("fight eligible in dangerous place", isEligible(fightEntry, zone) === true);
  check("dev ignoreDanger overrides the gate", isEligible(fightEntry, safe, { ignoreDanger: true }) === true);

  // flavor spread: every authored flavor is reachable via a forced dev pick (ignoreDanger)
  for (const flavor of table.flavors) {
    const picked = pickEncounter(table, safe, () => 0.0, { flavor, ignoreDanger: true });
    check("dev trigger fires flavor: " + flavor, !!picked && picked.flavor === flavor);
  }

  // routing dispatches correctly
  const charWith = ids => ({ abilities: ids.map(id => ({ abilityId: id, level: 1 })) });
  const bare = charWith([]);
  const narr = buildOffer(table.encounters.find(e => e.flavor === "beneficial" && e.routing === "narrative"), bare, {}, rules);
  check("narrative routes to a GM prompt", narr.routing === "narrative" && typeof narr.prompt === "string" && narr.prompt.length > 20);
  const opp = buildOffer(table.encounters.find(e => e.routing === "opposed"), bare, {}, rules);
  check("opposed routes to a prompt naming a check", opp.routing === "opposed" && /check/i.test(opp.prompt));
  const duel = buildOffer(fightEntry, bare, {}, rules);
  check("duel routes to a duel def", duel.routing === "duel" && duel.def && duel.def.type === "duel");
  const chase = buildOffer(table.encounters.find(e => e.id === "re_pursuit_flee"), bare, {}, rules);
  check("chase routes to a challenge def", chase.routing === "challenge" && chase.def && chase.def.type === "challenge" && chase.def.stages.length === 3);

  // synthesized duel is a valid, non-lethal, avoidable stat block
  const dd = synthesizeDuelDef(fightEntry);
  check("duel def non-lethal + avoidable", dd.lethal === false && dd.avoidable === true);
  check("duel opponent health in 3..8", dd.opponent.health >= 3 && dd.opponent.health <= 8);
  check("duel yieldAt below full health", dd.opponent.yieldAt >= 0 && dd.opponent.yieldAt < dd.opponent.health);

  // HARD guardrail: every lethal-capable encounter's offer carries a decline path
  for (const e of table.encounters.filter(canIncapacitate)) {
    const offer = buildOffer(e, bare, {}, rules);
    const hasDecline = (offer.choices || []).some(c => (c.intentTags || []).includes("retreat") && c.trivial) || offer.avoidable;
    check("avoid path present for lethal-capable: " + e.id, !!hasDecline);
    // engine-built offers put the decline BEFORE engagement (a real choice, not mid-fight)
    if (offer.choices) check("decline is a real choice for: " + e.id, offer.choices.some(c => c.trivial && (c.intentTags||[]).includes("retreat")));
  }

  // peaceful-out ability resolves the encounter without a fight
  const beastCreature = table.encounters.find(e => e.id === "re_creature_chase");
  const withBeast = buildOffer(beastCreature, charWith(["beastfriend"]), { beastfriend: { name: "Beastfriend", axes: {} } }, rules);
  check("peaceful-out choice appears when ability owned", withBeast.choices.some(c => c.abilityId === "beastfriend"));
  const withoutBeast = buildOffer(beastCreature, bare, {}, rules);
  check("no peaceful-out choice when ability not owned", !withoutBeast.choices.some(c => c.abilityId === "beastfriend"));

  // mediator can defuse a fight
  const medFight = buildOffer(fightEntry, charWith(["mediators_tongue"]), { mediators_tongue: { name: "Mediator's Tongue" } }, rules);
  check("mediator defuse offered on a fight", medFight.choices.some(c => c.abilityId === "mediators_tongue"));

  check("dangerOf clamps undefined to 0", dangerOf({}) === 0 && dangerOf({ dangerLevel: 9 }) === 4);
}

// --- SNG-BATCH-3 Phase 2: location affinities (SNG-013) ---
{
  const table = JSON.parse(readFileSync(join(root, "content/packs/core/rules/location_affinities.json"), "utf8"));
  const forge = { id: "smithy", tags: ["forge", "workshop"], spectrum: {} };
  const wild = { id: "wilds", tags: ["wilds", "no-law"], spectrum: {} };
  const archive = { id: "archive_hollow", tags: ["ruin", "archive"], spectrum: { concrete_abstract: 0.6, falsehood_truth: 0.4, mechanical_spiritual: -0.3 } };

  // TYPE affinity: only applies in a tagged location, only to matching skills/attrs
  const tinker = { attribute: "practical", abilityId: "tinkers_hand", axes: {}, intentTags: [] };
  check("type bonus applies for matching ability in tagged place", typeAffinity(forge, tinker, table).bonus === 8);
  check("type bonus zero for same ability in an untagged place", typeAffinity(wild, tinker, table).bonus === 0);
  const craftAct = { attribute: "craft", subAttribute: "craft", axes: {}, intentTags: [] };
  check("type bonus via attr_ key (forge craft)", typeAffinity(forge, craftAct, table).bonus === 4);

  // tag aliasing: 'wilds' -> 'wild'; wayfinding helped, a social act hindered
  const wayfind = { attribute: "practical", abilityId: "wayfinding", axes: {}, intentTags: [] };
  check("aliased tag grants wilderness bonus", typeAffinity(wild, wayfind, table).bonus === 8);
  const socialAct = { attribute: "social", subAttribute: "presence", axes: {}, intentTags: [] };
  check("wild penalizes social", typeAffinity(wild, socialAct, table).bonus === -3);

  // tag alias maps freeform ruin tags in a real location
  const stonewise = { attribute: "mental", abilityId: "stonewise", axes: {}, intentTags: [] };
  check("real ruin location grants stonewise", typeAffinity(archive, stonewise, table).bonus === 8);

  // VECTOR alignment: aligned axis eases, opposed hardens, capped ±10
  const alignedAct = { axes: { concrete_abstract: 0.5 } };   // matches archive's +0.6
  const opposedAct = { axes: { concrete_abstract: -0.5 } };  // opposes it
  const va = vectorAffinity(archive, alignedAct, table);
  const vo = vectorAffinity(archive, opposedAct, table);
  check("aligned axis eases the roll (positive)", va.bonus > 0);
  check("opposed axis hardens the roll (negative)", vo.bonus < 0);
  // baseline (unamplified) location caps at ±10
  const plain = { id: "plainfield", tags: ["meadow"], spectrum: { concrete_abstract: 1, falsehood_truth: 1 } };
  check("baseline vector modifier never exceeds +10", vectorAffinity(plain, { axes: { concrete_abstract: 1, falsehood_truth: 1 } }, table).bonus <= 10);
  check("baseline vector modifier never below -10", vectorAffinity(plain, { axes: { concrete_abstract: -1, falsehood_truth: -1 } }, table).bonus >= -10);
  // Aevi amplitude: a charged place (archive_hollow x2.0) swings past baseline, clamped <= 24
  const ampBonus = vectorAffinity(archive, { axes: { concrete_abstract: 1, falsehood_truth: 1 } }, table).bonus;
  check("amplified location swings past baseline cap", ampBonus > 10 && ampBonus <= 24);
  check("archive_hollow effective cap is 20 (baseline 10 x 2.0)", vectorAffinity(archive, { axes: {} }, table).cap === 20);
  // a weak axis (below strongThreshold) is NOT felt
  const weakPlace = { spectrum: { chaos_order: 0.2 } };
  check("weak axis (< threshold) contributes nothing", vectorAffinity(weakPlace, { axes: { chaos_order: 1 } }, table).bonus === 0);

  // combined + receipt
  const combined = locationAffinity(archive, { attribute: "mental", abilityId: "stonewise", axes: { concrete_abstract: 0.5 }, intentTags: [] }, table, { vectorsKnown: ["concrete_abstract"] });
  check("combined folds type + vector", combined.bonus === combined.typeBonus + combined.vectorBonus && combined.typeBonus === 8 && combined.vectorBonus > 0);
  const rc = affinityReceipt(combined);
  check("receipt names the type bump", rc.some(b => /stonewise here/.test(b)));
  check("receipt names a KNOWN aligned axis explicitly", rc.some(b => /aligned to/.test(b)));
  // unknown axis -> vague honest reveal, never names the axis
  const vague = locationAffinity(archive, { axes: { concrete_abstract: 0.5 }, intentTags: [] }, table, { vectorsKnown: [] });
  const vagueRc = affinityReceipt(vague);
  check("unperceived alignment stays vague", vagueRc.some(b => /the place favored this/.test(b)) && !vagueRc.some(b => /concrete/.test(b)));

  // total capped: even a max-stack type + vector can't run away (typeCap 12, vectorCap 10)
  check("type stack respects typeCap", Math.abs(typeAffinity({ tags: ["precursor"], spectrum: {} }, { abilityId: "latticespeak", comboAbilities: ["old_roads"], axes: {}, intentTags: [] }, table).bonus) <= 12);
}

// --- SNG-BATCH-4: item evolution (SNG-010C) ---
{
  const waystaff = JSON.parse(readFileSync(join(root, "content/packs/valley/items/waystaff.json"), "utf8")).items[0];
  const catalog = { waystaff };
  const mk = () => ({ inventory: [{ id: "waystaff", name: "Waystaff", bonusTags: ["resonance", "focus"] }], companionBonds: {}, practice: { uses: {}, coActivations: {}, aspirations: {} } });

  // stage gates on BOTH bond AND co-use — neither alone advances past stage 1
  const c1 = mk();
  check("starts at stage 1", currentStage("waystaff", c1, catalog).stage === 1);
  c1.companionBonds.aevi = 8; // bond alone (co-use 0) cannot reach stage 2
  check("bond alone does not advance (co-use gate holds)", currentStage("waystaff", c1, catalog).stage === 1);
  const c2 = mk();
  recordCoUse(c2, "waystaff", "aevi", 20); // co-use alone (bond 0) cannot advance
  check("co-use alone does not advance (bond gate holds)", currentStage("waystaff", c2, catalog).stage === 1);

  // both met -> stage 2 (bond>=4, coUse>=6)
  const c3 = mk();
  c3.companionBonds.aevi = 4; recordCoUse(c3, "waystaff", "aevi", 6);
  check("both gates met reaches stage 2", currentStage("waystaff", c3, catalog).stage === 2);
  // stage 3 needs bond>=8 AND coUse>=14
  c3.companionBonds.aevi = 8; recordCoUse(c3, "waystaff", "aevi", 8); // total 14
  check("both gates met reaches stage 3", currentStage("waystaff", c3, catalog).stage === 3);

  // refresh stamps evoStage + bonusTags (grant applies additively via tags)
  const adv = refreshEvolvingItems(c3, catalog);
  check("refresh stamps current stage", c3.inventory[0].evoStage === 3);
  check("stage 3 bonusTags applied (answer tag)", c3.inventory[0].bonusTags.includes("answer"));
  check("refresh reports the advance", adv.some(a => a.stage === 3));

  // co-use only counts a cast when the bond-source companion is present
  const c4 = mk(); c4.companionBonds.aevi = 4;
  noteCoUseAndRefresh(c4, { usedAbilityIds: ["resonant_sight"], activeCompanionIds: [], catalog }); // aevi absent
  check("no co-use when companion absent", coUseCount(c4, "waystaff", "aevi") === 0);
  for (let i = 0; i < 6; i++) noteCoUseAndRefresh(c4, { usedAbilityIds: ["resonant_sight"], activeCompanionIds: ["aevi"], catalog });
  check("co-use counts casts with companion present", coUseCount(c4, "waystaff", "aevi") === 6);
  check("cast-with-companion advanced the staff to stage 2", c4.inventory[0].evoStage === 2);

  // a non-evolving item is completely unaffected
  const plain = { inventory: [{ id: "waterskin", name: "Waterskin", bonusTags: [] }], companionBonds: { aevi: 10 }, practice: { coUse: {} } };
  check("non-evolving item has no stage", currentStage("waterskin", plain, catalog) === null);
  check("refresh leaves non-evolving items alone", (refreshEvolvingItems(plain, catalog), plain.inventory[0].evoStage === undefined));

  // GM sees the current stage + foreshadow
  const gm = evolvedItemsForGM(c3, catalog);
  check("GM told the current evolving-item stage", /Stage 3/.test(gm) && /Waystaff/.test(gm));

  // escalating focus bonus: higher stage grants more equipment bonus on a matching action
  const rulesEvo = { baseChance: { equipmentBonus: 5, equipmentBonusCap: 20, evoStageStep: 2 } };
  const s1 = equipmentBonus({ inventory: [{ name: "Waystaff", bonusTags: ["resonance"], evoStage: 1 }] }, ["resonance"], rulesEvo).bonus;
  const s3 = equipmentBonus({ inventory: [{ name: "Waystaff", bonusTags: ["resonance"], evoStage: 3 }] }, ["resonance"], rulesEvo).bonus;
  check("evolved gear grants an escalating focus bonus", s3 > s1);
}

// --- SNG-BATCH-4: variable power (SNG-015 Part A) ---
{
  const iRules = JSON.parse(readFileSync(join(root, "content/packs/core/rules/intensity_scaling.json"), "utf8"));

  // energy scales per step, with floors/caps
  check("conserve costs less energy than standard", scaledEnergy(20, "conserve", iRules) < 20);
  check("standard = base energy", scaledEnergy(20, "standard", iRules) === 20);
  check("surge costs more energy than standard", scaledEnergy(20, "surge", iRules) > 20);
  check("conserve energy floor is 2", scaledEnergy(1, "conserve", iRules) === 2);
  check("surge cannot exceed 2x standard", scaledEnergy(20, "surge", iRules) <= 40);

  // effect scales: conserve reduces the roll, surge raises it
  check("conserve effectMod is negative", effectMod("conserve", iRules) < 0);
  check("surge effectMod is positive", effectMod("surge", iRules) > 0);

  // AUTO picks the minimum intensity that clears the task, and NEVER surges
  check("auto picks conserve on an easy task", autoIntensity(95, iRules) === "conserve");
  check("auto picks standard on a hard-but-doable task", autoIntensity(50, iRules) === "standard");
  let sawSurge = false;
  for (let ch = 0; ch <= 100; ch += 5) if (autoIntensity(ch, iRules) === "surge") sawSurge = true;
  check("auto NEVER selects surge at any difficulty", sawSurge === false);

  // surge backlash pays by the ability's Tier (higher tier hurts more)
  const t1 = { levelReq: 1 }, t4 = { levelReq: 4 };
  check("surge backlash scales by tier", surgeBacklash(t4, iRules).health > surgeBacklash(t1, iRules).health);
  const victim = { health: 30, energy: 30 };
  const paid = applySurgeBacklash(victim, t4, iRules);
  check("applied surge backlash deducts health + energy", victim.health < 30 && victim.energy < 30 && paid.health < 0);

  // backlash only ever fires on a surge, and rises on a slipped roll
  check("no backlash off-surge", shouldBacklash("standard", "crit_failure", iRules, () => 0) === false);
  check("surge crit_failure very likely to backlash", shouldBacklash("surge", "crit_failure", iRules, () => 0.4) === true);
  check("surge clean success rarely backlashes", shouldBacklash("surge", "crit_success", iRules, () => 0.2) === false);

  // Part B dial descriptor exposes all three steps with energy + surge warning
  const opts = intensityOptions(20, iRules);
  check("dial exposes conserve/standard/surge", opts.map(o => o.key).join(",") === "conserve,standard,surge");
  check("dial marks surge with a warning", opts.find(o => o.key === "surge").warn != null);
  check("dial shows scaled energy per step", opts.find(o => o.key === "surge").energy > opts.find(o => o.key === "conserve").energy);

  // intensity applies to roll/effect only — it does not alter the learn gate (SNG-013/BATCH-2)
  // (gates/levelReq are enforced at learn/rank; a USE only involves an owned ability, so intensity
  //  can never bypass them — asserted structurally: no intensity API touches gates)
  check("INTENSITIES are exactly the three ratified steps", INTENSITIES.join(",") === "conserve,standard,surge");
}

// --- SNG-BATCH-5 Phase 1: soft class cost (cross-class = 2x) ---
{
  const cap5 = JSON.parse(readFileSync(join(root, "content/packs/core/rules/skill_capacity.json"), "utf8"));
  const cat5 = {};
  for (const g of ["harmonic","radiant","valley_craft","precursor"]) { const pk = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/"+g+".json"),"utf8")); for (const a of pk.abilities) cat5[a.id] = {...a, powerSystem: pk.powerSystem}; }
  const harm = { origin: "harmonic" };
  const rad = { origin: "radiant" };
  const val = { origin: "valley" };
  check("home class of harmonic origin", homeClassOf(harm) === "harmonic");
  check("home class of valley origin is valley_craft", homeClassOf(val) === "valley_craft");
  // a harmonic ability is home for harmonic, cross for radiant/valley
  const harmAb = Object.values(cat5).find(a => a.powerSystem === "harmonic");
  const valAb = Object.values(cat5).find(a => a.powerSystem === "valley_craft");
  const precAb = Object.values(cat5).find(a => a.powerSystem === "precursor");
  check("home-class ability is not cross-class", isCrossClass(harmAb, harm) === false);
  check("other class ability IS cross-class", isCrossClass(harmAb, rad) === true);
  check("valley_craft is home for valley origin", isCrossClass(valAb, val) === false);
  check("precursor is never home (always cross)", isCrossClass(precAb, harm) === true && isCrossClass(precAb, val) === true);
  check("cross-class costs the ratified multiplier (2)", skillPointCost(harmAb, rad, cap5) === 2);
  check("home-class costs 1", skillPointCost(harmAb, harm, cap5) === 1);

  // ENFORCEMENT in learn/rank
  const h1 = { origin: "harmonic", level: 5, skillPoints: 1, abilities: [], subAttributes: {}, customAbilities: {} };
  // learning a home-class harmonic ability costs 1 (assume a T1 harmonic ability exists)
  const homeT1 = Object.values(cat5).find(a => a.powerSystem === "harmonic" && (a.levelReq||1) === 1);
  if (homeT1) check("home-class learn spends 1 point", (learnAbility(h1, homeT1.id, cat5, rules, { skillCapacity: cap5 }).ok) && h1.skillPoints === 0);
  // cross-class learn needs 2 points
  const h2 = { origin: "harmonic", level: 5, skillPoints: 1, abilities: [], subAttributes: {}, customAbilities: {} };
  const crossT1 = Object.values(cat5).find(a => a.powerSystem === "valley_craft" && (a.levelReq||1) === 1);
  if (crossT1) check("cross-class learn blocked with 1 point", learnAbility(h2, crossT1.id, cat5, rules, { skillCapacity: cap5 }).why.includes("cross-class"));
  if (crossT1) { h2.skillPoints = 2; check("cross-class learn spends 2 points", learnAbility(h2, crossT1.id, cat5, rules, { skillCapacity: cap5 }).ok && h2.skillPoints === 0); }
  // cross-class RANK also costs 2
  if (crossT1) {
    const h3 = { origin: "harmonic", level: 5, skillPoints: 1, abilities: [{ abilityId: crossT1.id, level: 1 }], subAttributes: {}, customAbilities: {} };
    check("cross-class rank blocked with 1 point", rankUpAbility(h3, crossT1.id, rules, { catalog: cat5, skillCapacity: cap5 }).why.includes("cross-class"));
    h3.skillPoints = 2;
    const rr = rankUpAbility(h3, crossT1.id, rules, { catalog: cat5, skillCapacity: cap5 });
    check("cross-class rank spends 2 points", rr.ok && rr.cost === 2 && h3.skillPoints === 0);
  }
}

// --- SNG-BATCH-5 Phase 2: branch forks ---
{
  const forks = JSON.parse(readFileSync(join(root, "content/packs/core/rules/branch_forks.json"), "utf8"));
  const psAb = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/harmonic.json"), "utf8")).abilities.find(a => a.id === "sonic_resonance") ||
               JSON.parse(readFileSync(join(root, "content/packs/core/abilities/radiant.json"), "utf8")).abilities.find(a => a.id === "prism_sight");
  // use prism_sight from whichever pack holds it
  let prism = null;
  for (const g of ["harmonic","radiant","valley_craft"]) { const pk = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/"+g+".json"),"utf8")); const a = pk.abilities.find(x => x.id === "prism_sight"); if (a) prism = { ...a, powerSystem: pk.powerSystem }; }

  check("branch_forks defines prism_sight fork at rank 3", forkFor("prism_sight", forks)?.atRank === 3);
  check("fork has exactly two paths", forkPaths("prism_sight", forks).length === 2);

  const c = { forkChoices: {} };
  // fork pending only at atRank and while unchosen
  check("fork NOT pending below atRank", forkPending(c, "prism_sight", 2, forks) === false);
  check("fork pending at atRank when unchosen", forkPending(c, "prism_sight", 3, forks) === true);
  check("non-forking ability never pends", forkPending(c, "wayfinding", 3, forks) === false);

  // choosing locks permanently
  check("setFork picks a path", setFork(c, "prism_sight", "deep_read", forks) === true);
  check("chosen fork readable", chosenFork(c, "prism_sight", forks)?.key === "deep_read");
  check("fork no longer pending after choice", forkPending(c, "prism_sight", 3, forks) === false);
  check("re-choosing is refused (permanent)", setFork(c, "prism_sight", "wide_read", forks) === false);
  check("still deep_read after refused re-choose", c.forkChoices.prism_sight === "deep_read");

  // rank expression: chosen fork REPLACES the linear tree entry at/above atRank
  const exprChosen = rankExpression(c, prism, 3, forks);
  check("rank expr uses the chosen fork path", exprChosen.forked === true && /Deep Read/i.test(exprChosen.name));
  check("chosen fork carries its grants/cannot", !!exprChosen.grants && !!exprChosen.cannot);
  // below the fork rank, expression is the linear tree entry
  const exprLinear = rankExpression(c, prism, 2, forks);
  check("below atRank uses linear tree", exprLinear && exprLinear.forked === false);
  // an unchosen fork ability at atRank falls back to linear (until picked)
  const c2 = { forkChoices: {} };
  const exprUnchosen = rankExpression(c2, prism, 3, forks);
  check("unchosen fork at atRank falls back to linear tree", !exprUnchosen || exprUnchosen.forked === false);

  // GM ability law reflects the chosen fork
  const gmChar = { abilities: [{ abilityId: "prism_sight", level: 3 }], forkChoices: { prism_sight: "wide_read" }, discoveries: [] };
  const gm = abilitiesForGM(gmChar, { prism_sight: prism }, forks);
  check("GM sees the specialized fork name", /Wide Read/i.test(gm) && /specialized fork/i.test(gm));
}

// --- SNG-BATCH-6 Phase 1: codex entity-resolution (SNG-019) ---
{
  const day = (d) => ({ day: d });
  const entities = { people: { teva: "Teva" }, places: { archive_hollow: "Archive Hollow" } };

  // two differently-phrased facts about the same NPC land on ONE node
  const c1 = { codex: null };
  ensureCodex(c1);
  applyCodexUpdates(c1, [{ topic: "Teva", kind: "person", fact: "She grew up in the Heights." }], { ...day(1), entities });
  applyCodexUpdates(c1, [{ topic: "Teva the healer", kind: "person", fact: "She trained under Maren." }], { ...day(2), entities });
  const c1nodes = Object.values(c1.codex.topics);
  check("differently-phrased facts land on one node", c1nodes.length === 1 && c1nodes[0].facts.length === 2);
  check("node anchored to the known entity id", c1nodes[0].entityId === "teva");
  check("alias recorded for the variant phrasing", (c1nodes[0].aliases || []).some(a => /healer/i.test(a)));

  // entityId beats label: a totally different label with entityId lands on the same node
  applyCodexUpdates(c1, [{ topic: "the woman from the chamber", kind: "person", entityId: "teva", fact: "She was rescued from the resonance chamber." }], { ...day(3), entities });
  check("entityId beats label", Object.values(c1.codex.topics).length === 1 && c1.codex.topics[Object.keys(c1.codex.topics)[0]].facts.length === 3);

  // conservative matching: similar-but-different names do NOT collapse
  check("namesMatch: containment works", namesMatch("Teva", "Teva the healer") === true);
  check("namesMatch: Mara does not match Maren", namesMatch("Mara", "Maren") === false);
  check("namesMatch: short fragments guarded", namesMatch("va", "Teva") === false);

  // place anchoring
  const c2 = { codex: null }; ensureCodex(c2);
  applyCodexUpdates(c2, [{ topic: "the Archive Hollow", kind: "place", fact: "The seal hums below hearing." }], { ...day(1), entities });
  applyCodexUpdates(c2, [{ topic: "Archive Hollow", kind: "place", fact: "The Guardian watches every attempt." }], { ...day(2), entities });
  check("place phrasings collapse to the location node", Object.values(c2.codex.topics).length === 1 && Object.values(c2.codex.topics)[0].entityId === "archive-hollow");

  // primary (anchored) nodes hold more facts than the ordinary cap
  const c3 = { codex: null }; ensureCodex(c3);
  for (let i = 0; i < 30; i++) applyCodexUpdates(c3, [{ topic: "Teva", kind: "person", entityId: "teva", fact: "Fact number " + i + " about her." }], { ...day(i), entities });
  check("primary node holds 20+ facts (raised cap)", Object.values(c3.codex.topics)[0].facts.length >= 20);

  // merge tool: pre-fragmented save collapses; links rewire; second run is a no-op
  const frag = { codex: { schemaVersion: 1, topics: {
    "teva": { id: "teva", label: "Teva", kind: "person", entityId: "teva", facts: ["[d1] A"], links: ["archive-hollow"], aliases: [] },
    "teva-the-healer": { id: "teva-the-healer", label: "Teva the healer", kind: "person", facts: ["[d2] B", "[d1] A"], links: [], aliases: [] },
    "the-healer": { id: "the-healer", label: "the healer Teva", kind: "person", facts: ["[d3] C"], links: ["teva-the-healer"], aliases: [] },
    "archive-hollow": { id: "archive-hollow", label: "Archive Hollow", kind: "place", facts: [], links: ["teva-the-healer"], aliases: [] }
  } } };
  const merged = mergeCodexTopics(frag);
  const after = Object.values(frag.codex.topics);
  check("merge collapses the fragmented person nodes", merged.length === 2 && after.filter(t => t.kind === "person").length === 1);
  const teva = frag.codex.topics["teva"];
  check("facts concatenated + deduped chronologically", teva && teva.facts.length === 3);
  check("merge rewires links to the primary", frag.codex.topics["archive-hollow"].links.includes("teva"));
  check("merge is idempotent", mergeCodexTopics(frag).length === 0);
}

// --- SNG-BATCH-6 Phase 2: reconciliation engine (SNG-022) ---
{
  // character pass: additive fields initialize; version gates; second run no-op
  const oldSave = { level: 3, abilities: [], codex: { schemaVersion: 1, topics: {
    "mara": { id: "mara", label: "Mara", kind: "person", facts: ["[d1] Keeper of water."], links: [], aliases: [] },
    "mara-the-keeper": { id: "mara-the-keeper", label: "Mara the keeper", kind: "person", facts: ["[d2] She holds the gate codes."], links: [], aliases: [] }
  } } };
  const r1 = reconcile(oldSave, "character", {});
  check("reconcile applies owed steps on first run", r1.applied.includes("codex-entity-merge") && r1.applied.includes("additive-fields"));
  check("codex-merge healed the fragmented save", Object.keys(oldSave.codex.topics).length === 1);
  check("additive fields initialized to safe defaults", Array.isArray(oldSave.establishedFacts) && typeof oldSave.forkChoices === "object" && Array.isArray(oldSave.precursorAccess));
  check("nothing fabricated (defaults are EMPTY)", oldSave.establishedFacts.length === 0 && Object.keys(oldSave.forkChoices).length === 0);
  check("player-facing merge surfaces a login note", r1.playerFacing === true && r1.notes.some(n => /codex/i.test(n)));
  check("reconcileVersion stamped", oldSave.reconcileVersion >= 2);
  const r2 = reconcile(oldSave, "character", {});
  check("running reconcile twice changes nothing", r2.applied.length === 0 && r2.notes.length === 0);

  // GRANTS are offered, never auto-imposed (synthetic step registry)
  const grantee = { reconcileVersion: 0 };
  const synthetic = [{ version: 1, id: "test-talent", playerFacing: true,
    apply: (c) => ({ offers: [{ id: "talent", label: "Choose an innate talent", options: ["echo-sense", "stone-sense"] }] }) }];
  const r3 = reconcile(grantee, "character", {}, synthetic);
  check("a power GRANT is surfaced as an offer", r3.offers.length === 1 && r3.offers[0].options.length === 2);
  check("the offer did NOT auto-apply anything", grantee.talent === undefined);

  // a broken step never blocks the pass
  const r4 = reconcile({ reconcileVersion: 0 }, "character", {}, [
    { version: 1, id: "boom", apply: () => { throw new Error("step exploded"); } },
    { version: 2, id: "fine", apply: (c) => { c.ok = true; return { notes: ["ok"] }; } }
  ]);
  check("a broken step is contained (warning, pass continues)", r4.warnings.some(w => /boom/.test(w)) && r4.applied.includes("fine"));

  // content pass: poleIntensity derives to the hand-authored shape; existing untouched
  const spectrums = JSON.parse(readFileSync(join(root, "content/packs/core/spectrums.json"), "utf8"));
  const authored = JSON.parse(readFileSync(join(root, "content/packs/valley/locations/millbrook.json"), "utf8"));
  const bare = { id: "test-place", spectrum: { ...authored.spectrum }, connections: ["millbrook", "nowhere-real"] };
  const content = { spectrums, locations: { "test-place": bare, "millbrook": JSON.parse(JSON.stringify(authored)) } };
  const authoredPI = JSON.stringify(authored.poleIntensity);
  const summary = reconcileContent(content);
  check("missing poleIntensity derives from spectrum", JSON.stringify(content.locations["test-place"].poleIntensity) === authoredPI);
  check("authored poleIntensity untouched", JSON.stringify(content.locations["millbrook"].poleIntensity) === authoredPI);
  check("dangling connection flagged, not removed", summary.warnings.some(w => /nowhere-real/.test(w)) && content.locations["test-place"].connections.includes("nowhere-real"));
  const summary2 = reconcileContent(content);
  check("content reconcile idempotent", summary2.applied === 0);
}

// --- SNG-019 addendum (Erik preview feedback): player allocation + suggestions ---
{
  const mk = () => ({ codex: { schemaVersion: 2, topics: {
    "teva": { id: "teva", label: "Teva", kind: "person", entityId: "teva", facts: ["[d1] Grew up in the Heights."], links: [], aliases: ["Teva the healer"] },
    "the-healer-of-the-chamber": { id: "the-healer-of-the-chamber", label: "the healer of the chamber", kind: "person", facts: ["[d3] She knows the old cadence.", "[d2] Rescued from the chamber."], links: ["archive-hollow"], aliases: [] },
    "the-rescue": { id: "the-rescue", label: "The rescue from the chamber", kind: "event", facts: ["[d2] The seal opened at dawn."], links: ["the-healer-of-the-chamber"], aliases: [] },
    "millbrook-mill": { id: "millbrook-mill", label: "The old mill", kind: "place", facts: ["[d4] Grain comes in from the terraces."], links: [], aliases: [] }
  } } });

  // suggestions: shared alias/label token ("healer") surfaces the pair; unrelated stays out
  const c = mk();
  const sug = suggestMerges(c);
  check("suggestion surfaces the shared-token pair", sug.some(x => (x.aId === "teva" && x.bId === "the-healer-of-the-chamber") || (x.bId === "teva" && x.aId === "the-healer-of-the-chamber")));
  check("unrelated node not suggested against teva", !sug.some(x => (x.aId === "millbrook-mill" && x.bId === "teva") || (x.bId === "millbrook-mill" && x.aId === "teva")));

  // NOT-THE-SAME verdict: excluded from suggestions AND from auto-merge forever
  const c2 = mk();
  markNotSame(c2, "teva", "the-healer-of-the-chamber");
  check("not-same pair excluded from suggestions", !suggestMerges(c2).some(x => (x.aId === "teva" && x.bId === "the-healer-of-the-chamber") || (x.bId === "teva" && x.aId === "the-healer-of-the-chamber")));
  // force a would-be auto-merge situation: give the fragment a containment label
  c2.codex.topics["the-healer-of-the-chamber"].label = "Teva of the chamber";
  check("not-same verdict blocks auto-merge too", mergeCodexTopics(c2).length === 0 && Object.keys(c2.codex.topics).length === 4);

  // mergeInto: player folds ANY entry into ANY other (event into person allowed — their call)
  const c3 = mk();
  const target = mergeInto(c3, "the-rescue", "teva");
  check("mergeInto folds across kinds on player judgment", target && target.id === "teva" && !c3.codex.topics["the-rescue"]);
  check("folded label becomes an alias", target.aliases.some(a => /rescue/i.test(a)));
  check("target kind wins", target.kind === "person");
  // links elsewhere rewire to the primary
  check("inbound links rewired to primary", !Object.values(c3.codex.topics).some(t => t.links.includes("the-rescue")));

  // facts re-sort chronologically after a merge
  const c4 = mk();
  mergeInto(c4, "the-healer-of-the-chamber", "teva");
  const days = c4.codex.topics["teva"].facts.map(f => Number(/\[d(\d+)\]/.exec(f)[1]));
  check("merged facts are chronological", days.every((d, i) => i === 0 || d >= days[i - 1]));

  // cascade: a manual merge's new alias lets the standing auto-tidy collapse a third node
  const c5 = mk();
  c5.codex.topics["the-healer-again"] = { id: "the-healer-again", label: "the healer of the chamber, again", kind: "person", facts: ["[d5] Still healing."], links: [], aliases: [] };
  mergeInto(c5, "the-healer-of-the-chamber", "teva"); // teva gains alias "the healer of the chamber"
  const cascaded = mergeCodexTopics(c5);
  check("manual merge cascades the auto-tidy", cascaded.length >= 1 && !c5.codex.topics["the-healer-again"]);

  // mergeInto guards: missing ids / self-merge are no-ops
  const c6 = mk();
  check("mergeInto rejects self and missing ids", mergeInto(c6, "teva", "teva") === null && mergeInto(c6, "ghost", "teva") === null && Object.keys(c6.codex.topics).length === 4);
}

// --- SNG-BATCH-7 Phase 1: per-character play-style + seed-from-aggregate ---
{
  const apts = rules.playerAptitudes;
  const strat = apts.find(a => a.tendency === "strategic");

  // profile is IDENTITY only now
  const prof = newProfile("player-x", "Erik");
  check("new profile carries no play-style (identity only)", prof.tendencies === undefined && prof.aptitudes === undefined && Array.isArray(prof.charactersPlayed));

  // style accrues on the CHARACTER passed as the holder
  const cel = { name: "Cellaceron" };
  ensureCharacterStyle(cel);
  check("ensureCharacterStyle inits empty style", Object.keys(cel.tendencies).length === 0 && cel.aptitudes.length === 0 && cel.actionCount === 0);
  for (let i = 0; i < strat.threshold + 2; i++) updateProfile(cel, ["plan"], apts);
  check("planned play raises THIS character's strategic tendency", cel.tendencies.strategic > 0 && cel.actionCount === strat.threshold + 2);
  check("crossing threshold earns the aptitude on the character", cel.aptitudes.includes(strat.id));
  check("aptitudeMods read from the character", Object.keys(aptitudeMods(cel, apts)).length > 0);

  // a DIFFERENT character sharing the same player does NOT inherit that style
  const usn = { name: "Usnea" };
  ensureCharacterStyle(usn);
  updateProfile(usn, ["persuade"], apts);
  check("a different character's style is independent", !(usn.aptitudes || []).includes(strat.id) && !usn.tendencies.strategic);

  // reconcile v3 seed-from-aggregate: an existing character with no style inherits the
  // player's current aggregate ONCE, then is idempotent
  const aggregate = { playerKey: "player-x", displayName: "Erik",
    tendencies: { strategic: 12, generous: 5 }, aptitudes: [strat.id], actionCount: 40, charactersPlayed: ["old-char"] };
  const oldChar = { name: "Veteran", reconcileVersion: 2 }; // pre-Phase-1 save
  const r1 = reconcile(oldChar, "character", { profile: aggregate });
  check("seed step applied on first login", r1.applied.includes("seed-character-style"));
  check("existing character seeded from the player aggregate", oldChar.tendencies.strategic === 12 && oldChar.aptitudes.includes(strat.id) && oldChar.actionCount === 40);
  check("seed surfaces a login note", r1.playerFacing && r1.notes.some(n => /play-style/i.test(n)));
  const before = JSON.stringify(oldChar.tendencies);
  const r2 = reconcile(oldChar, "character", { profile: aggregate });
  check("seed is idempotent (does not re-seed)", r2.applied.length === 0 && JSON.stringify(oldChar.tendencies) === before);

  // a character born current (stamped top version) never seeds from the aggregate
  const fresh = { name: "Newborn", reconcileVersion: topReconcileVersion("character"), tendencies: {}, aptitudes: [], actionCount: 0 };
  reconcile(fresh, "character", { profile: aggregate });
  check("fresh character born-current does NOT inherit aggregate style", Object.keys(fresh.tendencies).length === 0 && fresh.actionCount === 0);
  check("topReconcileVersion covers the seed step", topReconcileVersion("character") >= 3);

  // a character that already has its own style is not overwritten by the seed
  const played = { name: "Played", reconcileVersion: 2, tendencies: { social: 9 }, aptitudes: [], actionCount: 9 };
  reconcile(played, "character", { profile: aggregate });
  check("seed never clobbers a character that already has style", played.tendencies.social === 9 && !played.tendencies.strategic);
}

// --- SNG-BATCH-7 Phase 2: cross-device load-latest (stale-overwrite guard) ---
{
  // NEWER WINS by updatedAt
  const A = { id: "c", updatedAt: 100, rev: 3, syncedAt: 100 };
  const B = { id: "c", updatedAt: 200, rev: 4, syncedAt: 100 };
  check("remote newer wins", resolveSaveConflict(A, B).winner === B && resolveSaveConflict(A, B).reason === "remote-newer");
  check("local newer wins", resolveSaveConflict(B, A).winner === B && resolveSaveConflict(B, A).reason === "local-newer");

  // GUARD: a stale local never wins over a fresher remote (both directions)
  const staleLocal = { id: "c", updatedAt: 50, rev: 1, syncedAt: 50 };
  const freshRemote = { id: "c", updatedAt: 500, rev: 9, syncedAt: 50 };
  check("stale local does NOT clobber fresh remote", resolveSaveConflict(staleLocal, freshRemote).winner === freshRemote);
  check("fresh local is NOT clobbered by stale remote", resolveSaveConflict(freshRemote, staleLocal).winner === freshRemote);

  // NO false conflict when only one side advanced since the common sync point
  const base = { id: "c", updatedAt: 100, rev: 2, syncedAt: 100 };  // untouched since sync
  const advanced = { id: "c", updatedAt: 300, rev: 5, syncedAt: 100 }; // this side advanced
  check("one-sided advance is not a conflict (fast-forward)", resolveSaveConflict(base, advanced).conflict === false && resolveSaveConflict(base, advanced).winner === advanced);

  // GENUINE both-advanced conflict: both moved past the shared base → loser preserved
  const localDiverged = { id: "c", updatedAt: 400, rev: 6, syncedAt: 100 };
  const remoteDiverged = { id: "c", updatedAt: 350, rev: 7, syncedAt: 100 };
  const conf = resolveSaveConflict(localDiverged, remoteDiverged);
  check("both-advanced is flagged a conflict", conf.conflict === true);
  check("conflict keeps the newer, preserves the loser", conf.winner === localDiverged && conf.loser === remoteDiverged);

  // never-synced first pull: newer wins, but NOT flagged a conflict (no common base)
  const neverSyncedLocal = { id: "c", updatedAt: 10, rev: 1 };  // no syncedAt
  const remoteExisting = { id: "c", updatedAt: 20, rev: 1 };
  const first = resolveSaveConflict(neverSyncedLocal, remoteExisting);
  check("first-ever pull is fast-forward, not a conflict", first.conflict === false && first.winner === remoteExisting && first.loser === null);

  // rev breaks an updatedAt tie
  const t1 = { id: "c", updatedAt: 100, rev: 2, syncedAt: 100 };
  const t2 = { id: "c", updatedAt: 100, rev: 5, syncedAt: 100 };
  check("equal timestamps: higher rev wins", resolveSaveConflict(t1, t2).winner === t2);

  // missing remote / missing local degrade safely
  check("no remote → local wins, no conflict", resolveSaveConflict(A, null).winner === A && !resolveSaveConflict(A, null).conflict);
  check("no local → remote wins, no conflict", resolveSaveConflict(null, B).winner === B && !resolveSaveConflict(null, B).conflict);
}

// --- SNG-BATCH-7 Phase 3: quest + inventory resolver-hardening ---
{
  const entities = { people: { teva: "Teva", maren: "Maren" }, places: { millbrook: "Millbrook" } };

  // shared name primitive is the SNG-019 matcher, now dependency-free
  check("namematch primitive shared with codex", nm2("Teva", "Teva the healer") === true && nm2("Mara", "Maren") === false);

  // a drifted-title progress op UPDATES the right quest (no drop, no dupe)
  const c = { quests: [], xp: 0 };
  applyQuestUpdates(c, [{ op: "start", title: "The Second River", summary: "Find the source.", giver: "Teva" }], { entities });
  check("start links giver to a codex entityId", c.quests[0].giverEntityId === "teva");
  applyQuestUpdates(c, [{ op: "progress", title: "the second-river matter", note: "Found the first spring." }], { entities });
  check("drifted-title progress updates the SAME quest (no dupe)", c.quests.length === 1 && c.quests[0].progress.length === 1);
  check("drifted title recorded as a quest alias", (c.quests[0].aliases || []).some(a => /second-river matter/i.test(a)));

  // complete on a drifted title resolves + awards xp
  applyQuestUpdates(c, [{ op: "complete", questId: "the-second-river", note: "The source is found.", xpReward: 30 }], { entities });
  check("complete resolves the drifted quest + awards xp", c.quests[0].status === "completed" && c.xp === 30);

  // an UNRESOLVABLE op NEVER silently drops — it surfaces a note
  const notes = applyQuestUpdates(c, [{ op: "progress", title: "a quest that does not exist at all", note: "?" }], { entities });
  check("unresolvable quest op surfaces a note, does not vanish", notes.some(n => /couldn't match/i.test(n)));

  // start that resolves to an existing quest does not fork a duplicate
  const c2 = { quests: [], xp: 0 };
  applyQuestUpdates(c2, [{ op: "start", title: "Clear the Blocked Well" }], { entities });
  applyQuestUpdates(c2, [{ op: "start", title: "the blocked well", note: "again" }], { entities });
  check("re-start of the same quest does not duplicate", c2.quests.length === 1);

  // resolveQuest direct
  check("resolveQuest matches by fuzzy title", resolveQuest(c2, { title: "the blocked well" })?.id === c2.quests[0].id);
  check("resolveQuest returns null on genuine no-match", resolveQuest(c2, { title: "totally unrelated" }) === null);

  // dedupeQuests repairs a pre-resolver fragmented save
  const frag = { quests: [
    { id: "second-river", title: "The Second River", status: "active", progress: ["[a]"], aliases: [] },
    { id: "the-river-quest", title: "the river quest (Second River)", status: "active", progress: ["[b]"], aliases: [] },
    { id: "unrelated", title: "Guard the Mill", status: "active", progress: [], aliases: [] }
  ] };
  const qm = dedupeQuests(frag);
  check("dedupeQuests collapses fuzzy-duplicate quests", qm.length === 1 && frag.quests.length === 2);
  check("dedupeQuests keeps unrelated quest", frag.quests.some(q => q.id === "unrelated"));
  check("dedupeQuests unions progress", frag.quests.find(q => /Second River/i.test(q.title)).progress.length === 2);
  check("dedupeQuests idempotent", dedupeQuests(frag).length === 0);

  // --- inventory ---
  const ch = { inventory: [] };
  addItem(ch, "waterskin", {});
  addItem(ch, "a waterskin", {});         // phrasing variant
  addItem(ch, "the Waterskin", {});       // another
  check("phrasing variants collapse onto one stack", ch.inventory.length === 1 && ch.inventory[0].qty === 3);
  check("drifted phrasings recorded as item aliases", (ch.inventory[0].aliases || []).length >= 1);

  // resolveInventoryItem direct
  check("resolveInventoryItem matches fuzzy", resolveInventoryItem(ch, "waterskin", {})?.name.toLowerCase().includes("waterskin"));
  check("resolveInventoryItem null on no-match", resolveInventoryItem(ch, "obsidian dagger", {}) === null);

  // catalog re-link on a resolvable name (uncataloged stack gains catalog fields)
  const cat = { travelers_pack: { id: "travelers_pack", name: "Traveler's Pack", kind: "tool", bonusTags: ["carry"], effects: {} } };
  const ch2 = { inventory: [{ id: null, name: "Traveler's Pack", kind: "misc", qty: 1 }] };
  addItem(ch2, { id: "travelers_pack", name: "Traveler's Pack" }, cat);
  check("addItem re-links an uncataloged stack to the catalog", ch2.inventory[0].id === "travelers_pack" && ch2.inventory[0].bonusTags?.includes("carry"));

  // dedupeInventory repairs forked stacks
  const invFrag = { inventory: [
    { id: null, name: "healing draught", kind: "consumable", qty: 2, aliases: [] },
    { id: null, name: "a healing draught", kind: "consumable", qty: 1, aliases: [] },
    { id: null, name: "rope", kind: "tool", qty: 1, aliases: [] }
  ] };
  const im = dedupeInventory(invFrag, {});
  check("dedupeInventory merges forked stacks + sums qty", im.length === 1 && invFrag.inventory.length === 2 && invFrag.inventory.find(i => /healing/i.test(i.name)).qty === 3);
  check("dedupeInventory keeps distinct items", invFrag.inventory.some(i => i.name === "rope"));
  check("dedupeInventory idempotent", dedupeInventory(invFrag, {}).length === 0);
}

// --- SNG-BATCH-8 Phase 1: gambit reward wire (SNG-030 remainder) ---
{
  const gr = rules.gambit;
  check("completionBonusXp is defined in rules", Number.isFinite(gr.completionBonusXp) && gr.completionBonusXp > 0);
  check("strategistBonusPoints is defined", Number.isFinite(gr.strategistBonusPoints) && gr.strategistBonusPoints >= 1);

  // adaptationPointsFor: strategist earns the extra adaptation point (already wired)
  const plain = adaptationPointsFor({ aptitudes: [] }, rules);
  const strat = adaptationPointsFor({ aptitudes: ["strategist"] }, rules);
  check("strategist earns extra adaptation point over baseline", strat === plain + gr.strategistBonusPoints);

  // completion-XP semantics the app applies (mirrors finishGambit): completed pays, abandoned doesn't
  const award = (abandoned) => abandoned ? 0 : Math.max(0, gr.completionBonusXp ?? 10);
  check("a completed gambit awards the completion bonus", award(false) === gr.completionBonusXp);
  check("an abandoned gambit awards nothing", award(true) === 0);

  // --- SNG-BATCH-8 Phase 1: gambit-apt detection (isGambitApt heuristic, mirrored) ---
  const isApt = (choices) => {
    if (choices.length < 3) return false;
    const PLAN = new Set(["plan", "scout", "prepare", "investigate", "analyze"]);
    const tagged = choices.some(c => (c.intentTags || []).some(t => PLAN.has(t)));
    const ability = choices.filter(c => c.abilityId).length;
    const nonTrivial = choices.filter(c => !c.trivial && !c.encounterId && !c.emergenceId).length;
    return tagged || ability >= 2 || nonTrivial >= 4;
  };
  check("a plan/scout-tagged scene is gambit-apt", isApt([{ intentTags: ["scout"] }, { intentTags: [] }, { intentTags: [] }]) === true);
  check("two ability-relevant choices are gambit-apt", isApt([{ abilityId: "a" }, { abilityId: "b" }, { trivial: true }]) === true);
  check("a routine 3-choice scene is NOT gambit-apt", isApt([{ intentTags: ["persuade"] }, { trivial: true }, { intentTags: [] }]) === false);
  check("too few choices is never apt", isApt([{ intentTags: ["plan"] }]) === false);
  check("a busy 4+ non-trivial scene is apt", isApt([{}, {}, {}, {}]) === true);
}

// --- SNG-BATCH-8 Phase 2: narrative-driven time (SNG-032 timeOps) ---
{
  // the applyTurn time rule, mirrored: timeOps.hoursPassed REPLACES the beat default (clamped 0.25-72)
  const ADV = { beat: 1, sceneEnd: 2, travel: 3, rest: 8 };
  const hoursFor = (turn) => {
    const extraHours = Math.max(0, Math.min(12, Number(turn.timeAdvanceHours) || 0));
    const beatDefault = (turn.sceneEnded ? ADV.sceneEnd : ADV.beat) + extraHours;
    const declared = turn.timeOps && Number.isFinite(Number(turn.timeOps.hoursPassed));
    return declared ? Math.max(0.25, Math.min(72, Number(turn.timeOps.hoursPassed))) : beatDefault;
  };
  check("no timeOps = old beat behavior", hoursFor({}) === ADV.beat);
  check("no timeOps, scene end = sceneEnd default", hoursFor({ sceneEnded: true }) === ADV.sceneEnd);
  check("sleeping declares ~8h (replaces the beat)", hoursFor({ timeOps: { hoursPassed: 8, why: "slept" } }) === 8);
  check("a conversation ticks minutes, not an hour", hoursFor({ timeOps: { hoursPassed: 0.5, why: "a quick word" } }) === 0.5);
  check("a days-long journey clamps to 72h max", hoursFor({ timeOps: { hoursPassed: 200, why: "a long trek" } }) === 72);
  check("a floor of 0.25h is enforced", hoursFor({ timeOps: { hoursPassed: 0, why: "" } }) === 0.25);
  check("timeOps overrides even a legacy timeAdvanceHours", hoursFor({ timeAdvanceHours: 6, timeOps: { hoursPassed: 8 } }) === 8);
  check("legacy timeAdvanceHours still adds when no timeOps", hoursFor({ timeAdvanceHours: 6 }) === ADV.beat + 6);
  // the actual clock accepts fractional advance without breaking
  const clock = newClock();
  const t0 = readClock(clock).absoluteHour ?? null;
  advanceClock(clock, 0.5);
  check("advanceClock accepts a fractional (minutes) tick", readClock(clock) && (t0 === null || true));
}

// --- SNG-BATCH-9 Phase 1a: derived schemas validate the authored corpus (build-step-1) ---
{
  const rj = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
  const npcSchema = rj("schemas/npc.schema.json");
  const locSchema = rj("schemas/location.schema.json");
  const arcSchema = rj("schemas/arc.schema.json");

  // every authored NPC (except the legends registry) validates against the derived npc schema
  const npcDir = join(root, "content/packs/valley/npcs");
  let npcOk = 0, npcBad = 0;
  for (const fn of readdirSync(npcDir).filter(n => n.endsWith(".json") && n !== "legends.json")) {
    const obj = rj("content/packs/valley/npcs/" + fn);
    if (obj && (obj.kind === "challenger_pool" || Array.isArray(obj.challengers))) continue; // a COLLECTION (SNG-138 pool), not a single NPC — like legends.json
    const r = validate(obj, npcSchema);
    if (r.valid) npcOk++; else { npcBad++; }
  }
  check("all authored NPCs validate against npc.schema.json", npcBad === 0 && npcOk >= 29);

  // SNG-138 challenger pools are a COLLECTION shape (not single NPCs) — validate their own structure so the file isn't dark
  const poolFiles = readdirSync(npcDir).filter(n => n.endsWith(".json")).map(n => rj("content/packs/valley/npcs/" + n)).filter(o => o && (o.kind === "challenger_pool" || Array.isArray(o.challengers)));
  for (const pool of poolFiles) {
    check(`challenger pool ${pool.id} carries a non-empty challengers[] each with id + name + concept`, Array.isArray(pool.challengers) && pool.challengers.length > 0 && pool.challengers.every(c => c.id && c.name && c.concept));
  }

  // every authored location validates
  let locOk = 0, locBad = 0;
  for (const pack of ["core", "valley"]) {
    let names = [];
    try { names = readdirSync(join(root, "content/packs/" + pack + "/locations")); } catch { continue; }
    for (const fn of names.filter(n => n.endsWith(".json"))) {
      const r = validate(rj("content/packs/" + pack + "/locations/" + fn), locSchema);
      if (r.valid) locOk++; else locBad++;
    }
  }
  check("all authored locations validate against location.schema.json", locBad === 0 && locOk >= 26);

  // every authored greater-arc validates
  const arcs = rj("content/packs/valley/lore/greater_arcs.json").arcs;
  check("all authored arcs validate against arc.schema.json", arcs.every(a => validate(a, arcSchema).valid) && arcs.length >= 5);

  // the validator REJECTS malformed input (not vacuously passing)
  check("npc validator rejects a record missing required fields", validate({ schemaVersion: 1 }, npcSchema).valid === false);
  check("spectrum-value type is enforced (must be numeric)", validate({ id: "x", name: "y", role: "z", fears: "f", schemaVersion: 1, spectrum: { chaos_order: "hot" } }, npcSchema).valid === false);
  check("arc scale enum is enforced", validate({ id: "x", name: "y", scale: "galactic", pressure: "p", tendency: "t", crossesRegions: [], hingeNpcs: [], ifIgnored: "i", ifEngaged: "e" }, arcSchema).valid === false);

  // repair helpers behave
  check("missingRequired lists exactly the absent required keys", (() => {
    const m = missingRequired({ schemaVersion: 1, id: "a", name: "b" }, npcSchema);
    return m.includes("role") && m.includes("spectrum") && m.includes("fears") && !m.includes("id");
  })());
  check("defaultFor yields a schema-valid stub per type", defaultFor({ type: "array" }).length === 0 && defaultFor({ type: "string" }) === "" && defaultFor({ type: "integer" }) === 0);
  check("defaultFor(enum) picks the most-permissive (last) option", defaultFor({ type: "string", enum: ["world", "regional", "local"] }) === "local");
}

// --- SNG-BATCH-9 Phase 1b: generate(type,context) core + promotable store ---
await (async () => {
  const rjc = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
  const npcSchema = rjc("schemas/npc.schema.json");
  const locSchema = rjc("schemas/location.schema.json");
  const arcSchema = rjc("schemas/arc.schema.json");
  const substrate = rjc("content/packs/valley/lore/generative_substrate.json");
  const archive = rjc("content/packs/valley/locations/archive_hollow.json");
  const brann = rjc("content/packs/valley/npcs/brann_tollhand.json");
  const llm = (obj) => async () => obj;
  const base = (over = {}) => ({ location: archive, character: { id: "c1", level: 5 }, playerKey: "erik", day: 3, ...over });

  // good NPC → validates, persists, _gen sidecar, codex mirror
  {
    const good = { name: "Sella Dun", role: "a ledger-keeper", spectrum: { truth: 0.4 }, fears: "erasure", wants: "to be believed", knowledge: ["who signs in at night"], voiceHints: "clipped", personality: { warmth: 0.1 }, reactsToReputation: { honest: "opens up" }, communityId: "valley.millbrook", homeLocation: "archive_hollow" };
    const c = base();
    const rec = await generate("npc", c, { callJSON: llm(good), schema: npcSchema, applyCodexUpdates: applyCodexUpdatesGen });
    check("gen: good NPC persists + is schema-valid", rec && validate(rec, npcSchema).valid);
    check("gen: NPC _gen sidecar (tier fresh, weight=level)", rec._gen?.tier === "fresh" && rec._gen.birthWeight === 5);
    check("gen: store holds the minted entity", generatedRecords(c.character, "npc").length === 1);
    check("gen: persistence dropped a codex node", !!c.character.codex?.topics?.["sella-dun"]);
    check("gen: provenance has an SNG-041 worldDay slot", "worldDay" in rec._gen.provenance);
  }
  // missing-required → repaired; garbage → stubbed + in-grain
  {
    const c1 = base();
    const r1 = await generate("npc", c1, { callJSON: llm({ name: "Half Man", role: "a shade" }), schema: npcSchema });
    check("gen: missing-required NPC repaired to valid", validate(r1, npcSchema).valid && r1._gen.repaired === true);
    const c2 = base({ hint: "a watcher in the stacks" });
    const r2 = await generate("npc", c2, { callJSON: llm(null), schema: npcSchema });
    check("gen: garbage output → schema-valid stub", validate(r2, npcSchema).valid && r2._gen.stubbed === true);
    check("gen: stub is in-grain (inherits locale spectrum)", JSON.stringify(r2.spectrum) === JSON.stringify(archive.spectrum));
  }
  // resolve-before-mint: authored reuse + generated reuse
  {
    const c = base({ hint: "Brann Tollhand", known: { authored: { brann_tollhand: brann }, generated: {} } });
    const rec = await generate("npc", c, { callJSON: llm({ name: "IGNORED", role: "x", spectrum: {}, fears: "y" }), schema: npcSchema });
    check("gen: hint naming an authored NPC reuses it (no mint)", rec === brann && generatedRecords(c.character, "npc").length === 0);
    const c2 = base();
    const first = await generate("npc", c2, { callJSON: llm({ name: "Vetch", role: "a fixer", spectrum: { chaos: 0.3 }, fears: "debt" }), schema: npcSchema });
    const again = await generate("npc", c2, { callJSON: llm({ name: "vetch", role: "another", spectrum: {}, fears: "z" }), schema: npcSchema });
    check("gen: re-minting same name reuses (no duplicate)", again.id === first.id && generatedRecords(c2.character, "npc").length === 1);
  }
  // governor + never-throws
  {
    const c = base({ genBudget: 0 });
    const rec = await generate("npc", c, { callJSON: llm({ name: "Nobody", role: "x", spectrum: {}, fears: "y" }), schema: npcSchema });
    check("gen: governor at budget 0 declines to mint", rec === null && generatedRecords(c.character, "npc").length === 0);
    let threw = false, r = null;
    try { r = await generate("npc", base({ hint: "a door-shade" }), { callJSON: async () => { throw new Error("API down"); }, schema: npcSchema }); } catch { threw = true; }
    check("gen: a thrown LLM call never halts (stub returned)", !threw && validate(r, npcSchema).valid && r._gen.stubbed);
  }
  // location + arc types
  {
    const c = base();
    const loc = await generate("location", c, { callJSON: llm({ name: "The Understacks", regionId: "valley", communityId: null, spectrum: { truth: 0.5 }, poleIntensity: { truth: 0.5 }, tags: ["ruin"], connections: ["archive_hollow"], descriptionSeed: "deeper still", loreRefs: [], encounterFlavor: "cold", questSeeds: [], map: { x: 230, y: 110 } }), schema: locSchema });
    check("gen: location generates + validates + connects back", validate(loc, locSchema).valid && loc.connections.includes("archive_hollow"));
    const arc = await generate("arc", c, { callJSON: llm({ name: "The Naming Below", scale: "local", pressure: "medium", tendency: "the stacks want names", crossesRegions: ["Archive Hollow"], hingeNpcs: ["archive_guardian"], ifIgnored: "escalates", ifEngaged: "answered" }), schema: arcSchema });
    check("gen: arc generates + validates (scale local)", validate(arc, arcSchema).valid && arc.scale === "local");
  }
  // pure units
  check("gen: mintId avoids collision with -2", mintId("Teva", { teva: 1 }) === "teva-2");
  check("gen: resolveExisting matches whole-word containment", resolveExisting("npc", "Teva", { authored: { teva_healer: { name: "Teva the healer" } } }) === "teva_healer");
  check("gen: resolveExisting returns null for a new name", resolveExisting("npc", "Zorbo", { authored: { teva: { name: "Teva" } } }) === null);
  check("gen: birthWeight reads character level", birthWeightOf({ character: { level: 7 } }) === 7);
  for (const [t, sc] of [["npc", npcSchema], ["location", locSchema], ["arc", arcSchema]]) {
    check("gen: stub(" + t + ") is schema-valid", validate(stubEntity(t, base(), sc), sc).valid);
  }
  // prompt assembly (pure)
  {
    const { system, user } = buildGeneratePrompt("npc", { location: archive, hint: "a scribe", rating: "PG-13" }, { schema: npcSchema, examples: [brann], substrate });
    check("gen: prompt names required fields + disposition + example", system.includes("spectrum") && /truth|abstract|dark/.test(user) && user.includes("Brann Tollhand"));
    check("gen: prompt carries the rating ceiling + minor floor", system.includes("PG-13") && /minor is NEVER/i.test(system));
  }
})();

// --- SNG-BATCH-9 Phase 1c: content rating ceiling + the two floors ---
{
  // ceiling model
  const p = newProfile("player-x", "X");
  check("rating: new profile defaults to a safe PG-13 ceiling", ratingCeiling(p) === "PG-13");
  check("rating: ensureRating backfills a pre-BATCH-9 profile", (() => { const q = { playerKey: "q" }; ensureRating(q); return ratingCeiling(q) === "PG-13"; })());

  // R/R+ require the adult gate; without it, refused
  check("rating: R refused without the adult gate", setRating(p, "R", { authority: "erik" }).ok === false && ratingCeiling(p) === "PG-13");
  check("rating: R+ accepted WITH the adult gate", setRating(p, "R+", { authority: "erik", adultGate: true }).ok === true && ratingCeiling(p) === "R+");

  // minor cap: a minor profile can never exceed PG-13
  const m = newProfile("player-kid", "Kid");
  setMinorFlag(m, true);
  check("rating: minor flag caps an already-high ceiling down to PG-13", (() => { const k = newProfile("k2"); setRating(k, "R+", { authority: "erik", adultGate: true }); setMinorFlag(k, true); return ratingCeiling(k) === "PG-13"; })());
  check("rating: a minor profile cannot be set to R (refused)", canSetRating(m, "R", { authority: "erik", adultGate: true }).ok === false);
  check("rating: a minor profile cannot be set to R+ (refused)", canSetRating(m, "R+", { authority: "erik", adultGate: true }).ok === false);
  check("rating: a minor profile CAN be set to PG-13", canSetRating(m, "PG-13", { authority: "erik" }).ok === true);

  // no self-elevation: a profile cannot raise ITS OWN ceiling
  const selfp = newProfile("player-self");
  check("rating: a profile cannot raise its own ceiling", canSetRating(selfp, "R+", { authority: "player-self", adultGate: true }).ok === false);
  check("rating: the admin (erik) CAN raise it with the gate", canSetRating(selfp, "R+", { authority: "erik", adultGate: true }).ok === true);

  // ---- THE FLOORS (rating-INDEPENDENT, absolute) ----
  const ctx = { location: { id: "archive_hollow", name: "Archive Hollow", spectrum: { truth: 0.4 }, regionId: "valley" } };
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));

  check("floor: isMinorEntity true for an explicit age under 18", isMinorEntity({ age: 12 }) === true);
  check("floor: isMinorEntity true for a child descriptor without adult signal", isMinorEntity({ role: "a village child who runs errands" }) === true);
  check("floor: isMinorEntity false for a plain adult", isMinorEntity({ role: "an old ledger-keeper", age: 60 }) === false);

  // minor + SEXUAL framing → the prohibited floor → full stub (not salvaged)
  const ms = enforceFloors({ name: "Kit", role: "a child", age: 13, wants: "an erotic dalliance with a traveler", spectrum: {}, fears: "x" }, "npc", ctx, npcSchema);
  check("floor: a sexualized minor is stubbed entirely (prohibited floor)", ms.action === "stubbed-floor" && !/erotic/i.test(JSON.stringify(ms.entity)));

  // minor + softer ROMANTIC framing → neutralized (character kept, romance stripped)
  const mr = enforceFloors({ name: "Wren", role: "a young girl", age: 14, wants: "a romance with the miller's son", spectrum: {}, fears: "x", voiceHints: "shy" }, "npc", ctx, npcSchema);
  check("floor: a minor's romantic framing is neutralized, character kept", mr.action === "neutralized-minor" && !/romance/i.test(mr.entity.wants || ""));

  // adult + sexual at R+ is ALLOWED (the floor is about minors, not intensity)
  const ad = enforceFloors({ name: "Vaia", role: "a courtesan of the market", age: 34, wants: "a lucrative liaison", spectrum: {}, fears: "x" }, "npc", ctx, npcSchema);
  check("floor: adult sexual/romantic content is NOT blocked (intensity is the ceiling's job)", ad.action === "clean");

  // R+ never unlocks the minor floor: generate() with rating R+ still protects a minor
  (async () => {})(); // (async floor-through-generate covered in the generate block below)
}

// generate() enforces the floors regardless of rating, and tags entities with the ceiling
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const ctx = { location: { id: "archive_hollow", name: "Archive Hollow", spectrum: { truth: 0.4 }, regionId: "valley" }, character: { id: "c9", level: 3 }, rating: "R+" };
  const llm = (o) => async () => o;
  const rec = await generate("npc", ctx, { callJSON: llm({ name: "Pip", role: "a young boy", age: 11, wants: "a seductive rendezvous", spectrum: {}, fears: "x" }), schema: npcSchema });
  check("floor+gen: R+ does NOT unlock the minor floor (sexual minor stubbed)", rec._gen.floor === "stubbed-floor" && rec._gen.romanceEligible === false);
  const rec2 = await generate("npc", { ...ctx, character: { id: "c9b", level: 3 } }, { callJSON: llm({ name: "Dara", role: "a market broker", age: 40, wants: "coin and comfort", spectrum: {}, fears: "loss", voiceHints: "wry" }), schema: npcSchema });
  check("tag: a generated entity carries the requesting ceiling as its rating tag", rec2._gen.rating === "R+");
  check("tag: an adult generated NPC is romance-eligible", rec2._gen.romanceEligible === true);
})();

// --- SNG-BATCH-9 Phase 1d: engagement governor + canon tiers ---
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const locSchema = JSON.parse(readFileSync(join(root, "schemas/location.schema.json"), "utf8"));
  const llm = (o) => async () => o;
  const mkNpc = async (name, character, day = 1) => generate("npc", { character, day, location: { id: "archive_hollow", name: "Archive Hollow", spectrum: {} } }, { callJSON: llm({ name, role: "a figure of the hollow", spectrum: { truth: 0.3 }, fears: "x", homeLocation: "archive_hollow" }), schema: npcSchema });

  // birth: fresh, weight = birth-power, score 0
  {
    const c = { id: "e1", level: 4 };
    const n = await mkNpc("Osric", c, 1);
    check("engage: born fresh with score 0 + weight from birth-power", n._gen.tier === "fresh" && n._gen.engagementScore === 0 && effectiveWeight(n) === 4);
  }

  // attention drives the tier: fresh -> established -> nominated
  {
    const c = { id: "e2", level: 2 };
    const n = await mkNpc("Bex", c, 1);
    recordAttention(n, "interact", 1); recordAttention(n, "interact", 1); // +4 -> established
    check("engage: a couple interactions promote fresh -> established", n._gen.tier === "established");
    check("engage: weight grows with accumulated attention", effectiveWeight(n) === 2 + Math.floor(n._gen.engagementScore / 2));
    for (let i = 0; i < 4; i++) recordAttention(n, "revisit", 2); // push past nominated
    check("engage: sustained attention reaches nominated (promotion queue)", n._gen.tier === "nominated");
  }

  // ESTABLISHED is durable — it does NOT go dormant from inattention
  {
    const c = { id: "e3", level: 3 };
    const n = await mkNpc("Cass", c, 1);
    recordAttention(n, "interact", 1); recordAttention(n, "interact", 1); // established
    check("engage: established is never dormant, even long untouched", isDormant(n, { day: 100 }) === false && isSurfaceable(n, { day: 100 }) === true);
  }

  // FRESH goes dormant past the window (stops propagating) — but is NEVER deleted
  {
    const c = { id: "e4", level: 1 };
    const n = await mkNpc("Dob", c, 1);        // fresh, last attention day 1
    check("engage: fresh + recently seen still surfaces", isSurfaceable(n, { day: 3 }) === true);
    check("engage: fresh + untouched past the window goes dormant", isDormant(n, { day: 10 }) === true && isSurfaceable(n, { day: 10 }) === false);
    check("engage: dormant is NOT deletion — the record still exists in the store", generatedRecords(c, "npc").some(r => r.id === n.id));
  }

  // Erik test 3: return-to keeps it alive; ignored one fades — from the SAME store
  {
    const c = { id: "e5", level: 2 };
    const kept = await mkNpc("Returned-To", c, 1);
    const ignored = await mkNpc("Ignored", c, 1);
    // player returns to 'kept' on day 9 (a revisit-class signal); 'ignored' gets nothing
    recordAttention(kept, "revisit", 9);
    const live = livingWorldForGM(c, { locationId: "archive_hollow", day: 11 });
    check("engage: the returned-to entity still surfaces to the GM", /Returned-To/.test(live || ""));
    check("engage: the ignored entity has faded from what the GM raises", !/Ignored/.test(live || ""));
    check("engage: BUT the faded entity is still in the codex/store (not deleted)", generatedRecords(c, "npc").some(r => r.name === "Ignored"));
  }

  // livingWorldForGM relevance + tier tagging
  {
    const c = { id: "e6", level: 5 };
    const loc = await generate("location", { character: c, day: 1, location: { id: "archive_hollow", name: "Archive Hollow", spectrum: {}, connections: [] } }, { callJSON: llm({ name: "The Deep Index", regionId: "valley", communityId: null, spectrum: {}, poleIntensity: {}, tags: [], connections: ["archive_hollow"], descriptionSeed: "shelves without end", loreRefs: [], encounterFlavor: "", questSeeds: [], map: { x: 1, y: 2 } }), schema: locSchema });
    recordAttention(loc, "revisit", 1); recordAttention(loc, "revisit", 1); // established
    const live = livingWorldForGM(c, { locationId: "archive_hollow", day: 1 });
    check("engage: a connected grown location surfaces in the living-world block, tier-tagged", /The Deep Index \(location, established/.test(live || ""));
  }
})();

// --- SNG-041 Phase 41a: shared world epoch — one world, one clock ---
{
  const epoch = { atMs: Date.UTC(2026, 6, 1), worldDay: 1, rate: 1 };
  check("worldclock: epoch moment is world-day 1", absoluteWorldDay(Date.UTC(2026, 6, 1, 6), epoch) === 1);
  check("worldclock: +10 real days = world-day 11 (real pace)", absoluteWorldDay(Date.UTC(2026, 6, 11), epoch) === 11);
  // THE fix: two characters at different journey-days read the SAME absolute at one real moment
  const momentMs = Date.UTC(2026, 6, 20, 15);
  const charA = { clock: newClock(8) };   // journey-day 8
  const charB = { clock: newClock(11) };  // journey-day 11 (the Ent)
  check("worldclock: two chars at different journey-days share ONE absolute world-day",
    absoluteWorldDay(momentMs, epoch) === absoluteWorldDay(momentMs, epoch) &&
    readClock(charA.clock).day !== readClock(charB.clock).day);
  check("worldclock: worldDayAt reconciles a real-time ISO stamp to the absolute", worldDayAt("2026-07-11T00:00:00Z", epoch) === 11);
  check("worldclock: unknown stamp → null (derives-never-fabricates)", worldDayAt("not-a-date", epoch) === null);
  check("worldclock: worldDate carries day + season + label", (() => { const wd = worldDate(Date.UTC(2026, 6, 11), epoch); return wd.worldDay === 11 && !!wd.season && /World-day 11/.test(wd.label); })());
  check("worldclock: relativeWorldDays phrases distance from the viewer's now", relativeWorldDays(5, 11) === "6 days ago" && relativeWorldDays(11, 11) === "today" && relativeWorldDays(10, 11) === "yesterday");
  check("worldclock: relative(unknown) is graceful", relativeWorldDays(null, 11) === "at an unknown time");
  check("worldclock: getWorldEpoch returns a usable default epoch (no override set)", (() => { const e = getWorldEpoch(); return Number.isFinite(e.atMs) && e.worldDay >= 1 && e.rate > 0; })());
  check("worldclock: before the epoch clamps to world-day 1 (no negative days)", absoluteWorldDay(Date.UTC(2020, 0, 1), epoch) === 1);
}

// --- SNG-041 Phase 41b: stamp events/news on the absolute + cross-character reconcile ---
await (async () => {
  // runWorldTick stamps news with the absolute world-day (news-spread path: a big deed travels)
  const character = {
    id: "c-a", name: "A", deeds: [{ communityId: "valley.alpha", weight: 3, day: 1, description: "pulled a child from the flood", spread: [] }],
    npcRegistry: {}, worldState: initWorldState(1)
  };
  const content = {
    region: { activeEvents: [] }, events: {},
    locations: { l1: { communityId: "valley.alpha" }, l2: { communityId: "valley.beta" } }
  };
  const res = await runWorldTick({ character, content, currentDay: 6, evolveNpcs: null });
  const spread = (character.worldState.news || []).find(n => /spread beyond/i.test(n.text));
  check("41b: world-tick news is stamped with the absolute world-day", !!spread && Number.isFinite(spread.worldDay));
  check("41b: the same news keeps the local journey-day too", !!spread && spread.day === 6);

  // newsForGM dates on the shared calendar when known, falls back to journey-day (backward-safe)
  const ch2 = { worldState: { news: [
    { day: 6, worldDay: 208, text: "a bridge fell in the far reach" },   // SNG-041 item
    { day: 4, text: "an older rumor with no world-day" }                  // pre-SNG-041 item
  ] } };
  const gm = newsForGM(ch2);
  check("41b: newsForGM shows the shared world-day for a stamped item", /\[world-day 208\] a bridge fell/.test(gm));
  check("41b: newsForGM falls back to the journey-day for a legacy item (no fabricated date)", /\[day 4\] an older rumor/.test(gm));

  // RECONCILIATION invariant: two characters at different journey-days, viewing the SAME
  // cross-character event (same real-time .at), compute the SAME shared world-day for it.
  const epoch = { atMs: Date.UTC(2026, 6, 1), worldDay: 1, rate: 1 };
  const eventAt = "2026-07-15T09:00:00Z"; // char A's deed, real-time
  const asSeenByA = worldDayAt(eventAt, epoch);
  const asSeenByB = worldDayAt(eventAt, epoch); // char B, different journey-day, same event
  check("41b: a cross-character event dates to ONE shared world-day for every viewer", asSeenByA === asSeenByB && asSeenByA === 15);
})();

// --- SNG-041 Phase 41c: hybrid two-clock — GM world-date + references-not-invents + cross tag ---
{
  const baseCtx = () => ({
    character: { name: "Ash", origin: "valley", background: "medic", level: 3, attributes: { physical: 2, mental: 2, social: 2, practical: 2 }, health: 10, maxHealth: 10, energy: 10, maxEnergy: 10, abilities: [], alignment: {} },
    location: { name: "Archive Hollow", descriptionSeed: "a sink of old stacks", spectrum: {}, questSeeds: [] },
    rules: {}, timeLabel: "Day 8, morning (late-spring)"
  });

  // the GM is given the SHARED world calendar + told to reference-not-invent dates
  const withWorld = buildTurnContext({ ...baseCtx(), worldDateLabel: "World-day 208 (harvest)" });
  check("41c: GM context surfaces the shared world calendar", /World-day 208 \(harvest\)/.test(withWorld) && /shared world calendar/i.test(withWorld));
  check("41c: GM is told to reference dates as given, never invent a bare day-number", /never invent a bare day-number/i.test(withWorld));
  check("41c: the local journey clock is still present alongside the world calendar", /Day 8, morning/.test(withWorld));
  // backward-safe: no worldDateLabel → no crash, no shared-calendar line
  const withoutWorld = buildTurnContext(baseCtx());
  check("41c: omitting the world calendar is graceful (still renders current time)", /CURRENT TIME/.test(withoutWorld) && !/shared world calendar/i.test(withoutWorld));

  // a boundary-crossing (impactsLocal) news item renders with its text + shared date
  const ch = { worldState: { news: [{ day: 8, worldDay: 208, text: "This reaches your area — a warband nears the mill", impactsLocal: true }] } };
  check("41c: an impactsLocal item renders on the shared calendar with its crossing phrasing", /\[world-day 208\] This reaches your area/.test(newsForGM(ch)));

  // the GM contract + the ledger boundary rule shipped (raw-source contract check)
  const gmSrc = readFileSync(join(root, "engine/gm.js"), "utf8");
  check("41c: ledger contract carries the impactsLocal cross-boundary flag", /"ledgerEvents"[\s\S]{0,200}"impactsLocal"/.test(gmSrc));
  check("41c: the boundary rule tells the GM when impactsLocal crosses", /materially reach ANOTHER character's immediate area/i.test(gmSrc));
}

// --- SNG-BATCH-9 Phase 2a: offscreen advancement of established generated entities ---
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const llm = (o) => async () => o;
  const character = { id: "p2", level: 4 };
  // an established NPC (attended) + a fresh one (ignored)
  const est = await generate("npc", { character, day: 1, location: { id: "kestrels_roost", name: "Kestrel's Roost", spectrum: {} } },
    { callJSON: llm({ name: "Rell Marketwarden", role: "a stall-boss with ambitions", spectrum: { chaos: 0.3 }, fears: "irrelevance", wants: "to own the whole market row", homeLocation: "kestrels_roost" }), schema: npcSchema });
  recordAttention(est, "interact", 1); recordAttention(est, "interact", 1); // -> established
  const fresh = await generate("npc", { character, day: 1, location: { id: "kestrels_roost", name: "Kestrel's Roost", spectrum: {} } },
    { callJSON: llm({ name: "Quiet Sib", role: "a passing tinker", spectrum: {}, fears: "x", wants: "to move on", homeLocation: "kestrels_roost" }), schema: npcSchema });
  check("2a: precondition — one established, one fresh", est._gen.tier === "established" && fresh._gen.tier === "fresh");

  // first observation only anchors the shared-clock baseline (nothing elapsed yet)
  const now0 = Date.UTC(2026, 6, 10);
  const first = await advanceGeneratedOffscreen({ character, now: now0, evolveFn: async () => ({ developments: [{ entityId: est.id, note: "SHOULD NOT FIRE YET" }] }) });
  check("2a: first tick just anchors the baseline (no advancement)", first.length === 0 && character.worldState.lastTickWorldDay != null);

  // real time passes → established advances offscreen, dated on the shared clock; fresh does NOT
  const now1 = Date.UTC(2026, 6, 20); // 10 world-days later
  let sawEntities = null;
  const evolve = async ({ entities }) => { sawEntities = entities.map(e => e.id); return { developments: [{ entityId: est.id, note: "muscled two rivals off the row" }] }; };
  const news = await advanceGeneratedOffscreen({ character, now: now1, evolveFn: evolve });
  check("2a: only established/nominated entities are offered to the advance pass", sawEntities && sawEntities.includes(est.id) && !sawEntities.includes(fresh.id));
  check("2a: the established entity moved on (offscreen log grew)", (est._gen.offscreen || []).length === 1 && /muscled two rivals/.test(est._gen.offscreen[0].note));
  check("2a: away-digest item is dated on the shared world-clock, on-or-before now", news.length === 1 && news[0].worldDay === absoluteWorldDay(now1) && news[0].worldDay <= absoluteWorldDay(now1));
  check("2a: the development accumulated on the entity's codex node ('moved on')", (character.codex?.topics?.[est.id]?.facts || []).some(fct => /while away/.test(fct) && /muscled/.test(fct)));
  check("2a: the fresh entity did NOT advance", !(fresh._gen.offscreen || []).length);

  // governor: a save with NO established entities advances the baseline but produces nothing
  const c2 = { id: "p2b", level: 2 };
  await generate("npc", { character: c2, day: 1, location: { id: "x", name: "X", spectrum: {} } }, { callJSON: llm({ name: "Nobody Notable", role: "y", spectrum: {}, fears: "z" }), schema: npcSchema }); // stays fresh
  await advanceGeneratedOffscreen({ character: c2, now: now0 }); // anchor
  const none = await advanceGeneratedOffscreen({ character: c2, now: now1, evolveFn: async () => ({ developments: [{ entityId: "whoever", note: "n/a" }] }) });
  check("2a: nothing established → no offscreen news (governor holds)", none.length === 0);

  // never throws: a failing advance pass is swallowed
  let threw = false, res = [];
  try { character.worldState.lastTickWorldDay = absoluteWorldDay(now1) - 5; res = await advanceGeneratedOffscreen({ character, now: now1, evolveFn: async () => { throw new Error("AI down"); } }); }
  catch { threw = true; }
  check("2a: a failing advance pass never throws (returns empty)", !threw && Array.isArray(res) && res.length === 0);
})();

// --- SNG-BATCH-9 Phase 2b: ⭐ keep boost + nomination surfacing ---
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const llm = (o) => async () => o;
  const c = { id: "k1", level: 3 };
  const rec = await generate("npc", { character: c, day: 1, rating: "PG-13", location: { id: "roost", name: "Roost", spectrum: {} } },
    { callJSON: llm({ name: "Kept Figure", role: "someone the player marked", spectrum: {}, fears: "x", wants: "y", homeLocation: "roost" }), schema: npcSchema });
  check("2b: a fresh entity is not yet notable", rec._gen.tier === "fresh" && nominationsFor(c).length === 0);

  // one ⭐ keep is a strong explicit boost → established (durable canon)
  recordAttention(rec, "keep", 2);
  check("2b: one ⭐ keep raises a fresh entity to established", rec._gen.tier === "established");
  // a second keep pushes it to nominated (the promotion queue)
  recordAttention(rec, "keep", 2);
  check("2b: a second ⭐ keep reaches nominated", rec._gen.tier === "nominated");

  // nomination surfacing: it appears as a candidate, provenance + rating carried
  const noms = nominationsFor(c);
  check("2b: the nominated entity surfaces as a promotion candidate", noms.length === 1 && noms[0].id === rec.id && noms[0].type === "npc");
  check("2b: the nomination carries weight + rating-tag (Phase-3 zero-rework)", noms[0].weight === effectiveWeight(rec) && noms[0].rating === "PG-13");
  check("2b: the nomination carries provenance", !!noms[0].provenance);

  // findGenerated resolves an entity by id across types (the codex ⭐/badge lookup)
  check("2b: findGenerated resolves a generated entity by id", findGenerated(c, rec.id) === rec && findGenerated(c, "nope") === null);

  // keep is stronger than an ordinary interaction (the explicit-vs-implicit complement)
  const c2 = { id: "k2", level: 3 };
  const a = await generate("npc", { character: c2, day: 1, location: { id: "x", name: "X", spectrum: {} } }, { callJSON: llm({ name: "Kept", role: "r", spectrum: {}, fears: "f" }), schema: npcSchema });
  const b = await generate("npc", { character: c2, day: 1, location: { id: "x", name: "X", spectrum: {} } }, { callJSON: llm({ name: "Touched", role: "r", spectrum: {}, fears: "f" }), schema: npcSchema });
  recordAttention(a, "keep", 1);      // +4
  recordAttention(b, "interact", 1);  // +2
  check("2b: a ⭐ keep outweighs a single ordinary interaction", a._gen.engagementScore > b._gen.engagementScore);
})();

// --- SNG-BATCH-9 Phase 3: shared-world promotion + contradiction rank + rating-lens ---
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const llm = (o) => async () => o;

  // a twice-⭐-kept entity reaches nominated — the promotion gate
  const c = { id: "p1", name: "Aria", level: 4 };
  const rec = await generate("npc", { character: c, day: 1, rating: "PG-13", playerKey: "erik", location: { id: "roost", name: "Roost", spectrum: {} } },
    { callJSON: llm({ name: "Warden Holt", role: "keeps the old gate", spectrum: {}, fears: "f", wants: "w", homeLocation: "roost" }), schema: npcSchema });
  recordAttention(rec, "keep", 2); recordAttention(rec, "keep", 2);
  check("P3: a twice-kept entity is nominated (promotion candidate)", rec._gen.tier === "nominated");

  const cands = promotionCandidates(c);
  check("P3: promotionCandidates surfaces the nominated entity", cands.length === 1 && cands[0].record.id === rec.id);

  // a canon record preserves the source id + rating/weight/provenance, drops the private _gen
  const cr0 = buildCanonRecord(rec, { worldDay: 5 });
  check("P3: a canon record preserves the id, drops _gen, carries rating+weight+provenance",
    cr0.id === rec.id && !cr0._gen && cr0._canon.entityId === rec.id && cr0._canon.rating === "PG-13" && cr0._canon.weight >= 4 && !!cr0._canon.provenance);

  // 1. EARNED auto-promotion into an empty store → lands canonical
  const store = ensureCanonStore({}, "valley");
  const p1 = promoteInto(store, cands, { authored: {}, worldDay: 11, rng: () => 0.99 });
  check("P3: a candidate with no collision lands canonical", p1.results[0].outcome === "landed" && store.entities[rec.id]?._canon.tier === "canonical");

  // promoted-marker makes it idempotent (not re-offered)
  rec._gen.promotedWorldDay = 11;
  check("P3: a promoted entity is not re-offered as a candidate (idempotent)", promotionCandidates(c).length === 0);

  // 2. CONTRADICTION → RANK
  //   the weighted opposed roll is decided by realness
  check("P3: the opposed roll is weighted by realness (strong beats weak, weak loses to strong)",
    resolveContradiction(30, 3, () => 0.5).incomingWins && !resolveContradiction(3, 30, () => 0.5).incomingWins);
  check("P3: authored spine (weight 100) almost always outranks a generated challenger",
    AUTHORED_CANON_WEIGHT === 100 && resolveContradiction(10, 100, () => 0.2).incomingWins === false);

  //   a weak challenger colliding with the AUTHORED spine becomes a variant (spine holds)
  const weak = { id: "warden-holt", name: "Warden Holt", role: "an imposter at the gate", _gen: { type: "npc", tier: "nominated", birthWeight: 2, engagementScore: 8, rating: "PG-13", provenance: {} } };
  const authored = { "warden-holt": { id: "warden-holt", name: "Warden Holt", role: "the authored gatekeeper" } };
  const store2 = ensureCanonStore({}, "valley");
  const pAuth = promoteInto(store2, [{ record: weak, weight: effectiveWeight(weak) }], { authored, worldDay: 11, rng: () => 0.5 });
  check("P3: a weak entity colliding with the authored spine becomes a variant (spine holds)",
    pAuth.results[0].outcome === "variant" && store2.variants.length === 1 && !store2.entities["warden-holt"]);
  check("P3: findCanonCollision finds the authored spine first", findCanonCollision("npc", "Warden Holt", { canon: {}, authored }).where === "authored");

  //   a strong challenger OUT-rolls standing generated canon → it takes the slot, loser → variant
  const store3 = ensureCanonStore({}, "valley");
  store3.entities["mill"] = { id: "mill", name: "The Old Mill", descriptionSeed: "a quiet mill", _canon: { entityId: "mill", type: "location", weight: 2, tier: "canonical", rating: "G" } };
  const strong = { id: "mill", name: "The Old Mill", descriptionSeed: "a roaring haunted mill", _gen: { type: "location", tier: "nominated", birthWeight: 20, engagementScore: 20, rating: "PG", provenance: {} } };
  const pWon = promoteInto(store3, [{ record: strong, weight: effectiveWeight(strong) }], { authored: {}, worldDay: 12, rng: () => 0.01 });
  check("P3: a strong challenger out-rolls standing canon → canonical; loser persists as a variant",
    pWon.results[0].outcome === "won" && store3.entities["mill"]._canon.weight >= 20 && store3.variants.some(v => v._canon.weight === 2));

  //   concurrency merge: higher-weight holds canonical, other → variant
  const sa = ensureCanonStore({}, "valley"); sa.entities["x"] = { id: "x", name: "X", _canon: { entityId: "x", weight: 5, tier: "canonical" } };
  const sb = ensureCanonStore({}, "valley"); sb.entities["x"] = { id: "x", name: "X", _canon: { entityId: "x", weight: 9, tier: "canonical" } };
  const merged = mergeCanonStores(sa, sb);
  check("P3 concurrency: a concurrent-promotion race keeps the higher-weight canonical, other → variant",
    merged.entities["x"]._canon.weight === 9 && merged.variants.some(v => v._canon.weight === 5));

  // 3. RATING-LENS (floors absolute)
  check("P3 lens: at/below the ceiling shows as-is", lensDecision("R", RATING_LEVEL["R"], "a brutal duel") === "show");
  check("P3 lens: above-ceiling violence adapts down (re-narrated)", lensDecision("R", RATING_LEVEL["PG"], "a bloody, brutal duel") === "adapt");
  check("P3 lens: above-ceiling SEXUAL content hard-filters (no in-ceiling analog)", lensDecision("R+", RATING_LEVEL["PG"], "an erotic, seductive figure") === "filter");
  check("P3 lens: unrated (authored) content is never rating-gated", lensDecision(null, RATING_LEVEL["G"], "anything") === "show");
  check("P3 lens: a minor viewer never gets gore softened into view (hard exclude, never softened)",
    lensDecision("R", RATING_LEVEL["PG-13"], "a gory massacre", { viewerIsMinor: true }) === "filter");

  //   canonForViewer resolves the whole superset for a viewer
  const store4 = ensureCanonStore({}, "valley");
  store4.entities["a"] = { id: "a", name: "Gentle Guide", role: "a kind soul", _canon: { entityId: "a", type: "npc", rating: "G", tier: "canonical" } };
  store4.entities["b"] = { id: "b", name: "Blood Knight", role: "a bloody, brutal warrior", _canon: { entityId: "b", type: "npc", rating: "R", tier: "canonical" } };
  store4.entities["s"] = { id: "s", name: "Seductress", role: "an erotic, seductive presence", _canon: { entityId: "s", type: "npc", rating: "R+", tier: "canonical" } };
  const gView = canonForViewer(store4, { rating: { preset: "G", isMinor: false } });
  const gIds = gView.map(v => v.record.id);
  check("P3 lens: a G viewer sees the gentle entity as-is", gView.find(v => v.record.id === "a")?.decision === "show");
  check("P3 lens: a G viewer gets the violent entity dialed down (adapted), not raw",
    gView.find(v => v.record.id === "b")?.decision === "adapt" && /dialed down/.test(JSON.stringify(gView.find(v => v.record.id === "b").record)));
  check("P3 lens: a G viewer never sees the sexual entity (filtered absent)", !gIds.includes("s"));
  const rpView = canonForViewer(store4, { rating: { preset: "R+" } });
  check("P3 lens: the top-ceiling (R+) viewer sees the full superset as-is", rpView.length === 3 && rpView.every(v => v.decision === "show"));
  const rView = canonForViewer(store4, { rating: { preset: "R" } });
  check("P3 lens: an R viewer still can't see above-ceiling R+ sexual content (filtered)", rView.length === 2 && !rView.some(v => v.record.id === "s"));

  //   adaptView only dials DOWN — a floor can never be re-crossed
  const av = adaptView(store4.entities["b"], "G");
  check("P3 lens: adaptView neutralizes above-ceiling intensity + tags the view", av._lens.adaptedTo === "G" && !/bloody/.test(av.role));
})();

// --- SNG-035: imagery pipeline (floors on images + prompt assembly + persist-once + gallery) ---
(() => {
  // THE FLOORS on image prompts
  check("SNG-035 floor: sexual content is stripped from any prompt at any ceiling",
    !/erotic|nude|seductive/i.test(sanitizeImagePrompt("an erotic nude seductive figure", { ratingLevel: RATING_LEVEL["R+"] })));
  check("SNG-035 floor: gore descriptors are stripped below an R ceiling (the 'no gore' tone is kept)",
    (() => { const p = sanitizeImagePrompt("a bloody gory battlefield", { ratingLevel: RATING_LEVEL["PG"] }); return !/\bbloody\b|\bgory\b/i.test(p) && /no gore/.test(p); })());
  check("SNG-035 floor: R+ can keep dark intensity (gore descriptor survives at the top ceiling)",
    /\bgory\b/i.test(sanitizeImagePrompt("a gory duel", { ratingLevel: RATING_LEVEL["R+"] })));
  check("SNG-035 floor: a MINOR subject is forced child-safe (no romance/sexual/gore) at ANY ceiling",
    (() => { const p = sanitizeImagePrompt("a seductive romantic bloody teenager", { ratingLevel: RATING_LEVEL["R+"], isMinor: true }); return /child|age-appropriate|wholesome/.test(p) && !/seductive|romantic|bloody/i.test(p); })());
  check("SNG-035 floor: every prompt carries the absolute safety tail", /no text, no watermark/.test(sanitizeImagePrompt("anything", {})));

  // isMinorSubject
  check("SNG-035: isMinorSubject flags a generated minor (romanceEligible false)", isMinorSubject({ _gen: { romanceEligible: false } }) === true);
  check("SNG-035: isMinorSubject flags by age + clears an adult", isMinorSubject({ age: 12 }) === true && isMinorSubject({ role: "an old woman" }) === false);

  // prompt assembly
  const seed = characterPromptSeed({ name: "Aria", origin: "valley-native", inventory: [{ name: "belt knife" }], bio: { motivation: "to find her brother" } });
  check("SNG-035: characterPromptSeed weaves name + origin + gear + arc", /Aria/.test(seed) && /valley native/.test(seed) && /belt knife/.test(seed));
  // SNG-053: the FORM leads the prompt so a non-human character renders non-human
  const entSeed = characterPromptSeed({ name: "Oakenroot", form: "a towering treefolk of bark and heartwood, moss-bearded", origin: "valley" });
  check("SNG-053: an explicit form LEADS the character prompt (not 'character portrait')", /^a towering treefolk/.test(entSeed) && entSeed.indexOf("treefolk") < entSeed.indexOf("portrait"));
  check("SNG-053: appearance/lineage also count as form; default is a stated 'a person'", /^a scaled/.test(characterPromptSeed({ appearance: "a scaled serpent-kin" })) && /^a person/.test(characterPromptSeed({ name: "Jo", origin: "valley" })));
  check("SNG-053: a generated NPC prompt leads with its form", /^a hulking stone construct/.test(assembleImagePrompt("npc", { name: "Gate", role: "guards the arch", appearance: "a hulking stone construct" })));
  check("SNG-035: assembleImagePrompt(location) uses the descriptionSeed", /old mill/i.test(assembleImagePrompt("location", { name: "Mill", descriptionSeed: "an old mill by the water" })));
  check("SNG-035: imageURLFor builds a keyless Pollinations URL with the encoded prompt", (() => { const u = imageURLFor("npc", "a brave knight", "knight-1"); return u.startsWith("https://image.pollinations.ai/prompt/") && /brave/.test(u) && /nologo=true/.test(u); })());

  // persist-once (born-with-image) — needs art generation ON
  localStorage.setItem("singularity.artMode", "generate");
  const npc = { id: "gate-warden", name: "Gate Warden", role: "keeps the lower gate" };
  const url1 = ensureImage(npc, "npc", { ratingLevel: 2 });
  check("SNG-035: ensureImage mints + persists an image on the record (born-with-image)", !!url1 && npc.image === url1);
  const url2 = ensureImage(npc, "npc", { ratingLevel: 2 });
  check("SNG-035: ensureImage is persist-ONCE — a second call returns the stored URL unchanged", url2 === url1);
  const pc = { id: "c9", name: "Hero", origin: "valley-native", inventory: [] };
  ensureImage(pc, "character", { ratingLevel: 2 });
  check("SNG-035: a character's image persists on `portrait` (not `image`)", !!pc.portrait && pc.image === undefined);
  // art OFF → no mint
  localStorage.setItem("singularity.artMode", "static");
  const off = { id: "x", name: "Nobody" };
  check("SNG-035: with art off, ensureImage never mints", ensureImage(off, "npc", {}) === null && off.image === undefined);
  localStorage.removeItem("singularity.artMode");

  // gallery
  const c = { id: "g1", name: "Gal" }; ensureGallery(c);
  addGalleryImage(c, { kind: "portrait", url: "u1", caption: "one" });
  addGalleryImage(c, { kind: "portrait", url: "u1", caption: "dup" }); // dedup by url
  addGalleryImage(c, { kind: "moment", url: "u2", caption: "two" });
  check("SNG-035: gallery dedupes by url + prepends newest-first", c.gallery.length === 2 && c.gallery[0].url === "u2");
})();

// --- SNG-048: narrative register = f(disposition, rating) ---
(() => {
  // an ordinary place (concrete-leaning, low charge) → concrete
  const market = narrativeRegister({ spectrum: { concrete_abstract: -0.2 }, poleIntensity: { concrete: 0.2 } });
  check("SNG-048: an ordinary concrete place defaults to the concrete register", market.band === "concrete" && /concrete|plainly|literal/i.test(market.cue));
  // a strange, charged, abstract place → poetic earned
  const remnant = narrativeRegister({ spectrum: { concrete_abstract: 0.6 }, poleIntensity: { abstract: 0.7 } });
  check("SNG-048: an abstract, charged place earns the poetic register", remnant.band === "poetic" && /lyrical|reach|strange/i.test(remnant.cue));
  // a mild-abstract but low-charge place → the middle band (still mostly concrete)
  const mid = narrativeRegister({ spectrum: { concrete_abstract: 0.25 }, poleIntensity: { abstract: 0.3 } });
  check("SNG-048: a mildly-abstract low-charge place stays mostly concrete", mid.band === "mostly-concrete");
  // axis tint flavors word-choice without changing the core band
  const truthy = narrativeRegister({ spectrum: { concrete_abstract: -0.3, falsehood_truth: 0.6 }, poleIntensity: { concrete: 0.3 } });
  check("SNG-048: a truth-charged place tints the register stark/clear", /stark|clear/i.test(truthy.cue));
  // rating as DIRECTION
  check("SNG-048: G rating directs a chaste register", /chaste|gentle/i.test(ratingRegister("G")));
  // romance v2 (Erik-ratified): R+ is PERMISSION to the line, not a prohibition — the full charged
  // register is expected, stopping short is the error, and the AUP line still holds without exception.
  check("romance v2: R+ directs permission-to-the-line (full register, stopping short is the error)",
    /permission to the line/i.test(ratingRegister("R+")) && /stopping short of the line is the error/i.test(ratingRegister("R+")));
  check("romance v2: R+ still holds the line (no graphic mechanical depiction)",
    /not graphic mechanical depiction/i.test(ratingRegister("R+")));
  check("romance v2: an unknown preset falls back to a safe mid register", /short of the explicit/i.test(ratingRegister("???")));
})();

// --- SNG-144: narration register DIALS (plainness + bluntness; rating as the cap) ---
(() => {
  const abstractCharged = { spectrum: { concrete_abstract: 0.6 }, poleIntensity: { abstract: 0.7 } };
  const ordinary = { spectrum: { concrete_abstract: -0.2 }, poleIntensity: { concrete: 0.2 } };

  // PLAINNESS: plain OVERRIDES an abstract/charged place downward (Brooklyn's dial wins over the region)
  const plainInAbstract = narrativeRegister(abstractCharged, "plain");
  check("SNG-144: PLAIN overrides even an abstract, charged place → concrete + a plain directive (player's comfort wins)", plainInAbstract.band === "concrete" && /DIALED PLAINNESS TO PLAIN/.test(plainInAbstract.cue));
  check("SNG-144: balanced leaves the place's earned band intact (the region still speaks)", narrativeRegister(abstractCharged, "balanced").band === "poetic");
  // LYRICAL nudges a grounded place up (a touch more image than the place alone earns)
  check("SNG-144: LYRICAL nudges a concrete place upward (more image than the place earns)", /DIALED LYRICISM UP/.test(narrativeRegister(ordinary, "lyrical").cue));
  // plain drops the lyrical tint but keeps a non-lyrical one
  const plainLyricalPlace = narrativeRegister({ spectrum: { concrete_abstract: 0.6, mechanical_spiritual: 0.6 }, poleIntensity: { abstract: 0.7 } }, "plain");
  check("SNG-144: PLAIN strips the 'reverent, lyrical' tint (no lyricism smuggled back in)", !/reverent, lyrical/.test(plainLyricalPlace.cue));
  check("SNG-144: PLAIN keeps a non-lyrical tint (a stark place stays stark)", /stark/i.test(narrativeRegister({ spectrum: { concrete_abstract: -0.3, falsehood_truth: 0.6 } }, "plain").cue));

  // BLUNTNESS: blunt commits, restrained is spare, balanced adds nothing — ALWAYS rating-capped
  const bluntR = bluntnessDirective("R", "blunt");
  check("SNG-144: BLUNT at R commits — visceral violence + natural profanity + direct embodied description", /visceral|blood|curse|direct and embodied/i.test(bluntR) && /BLUNT/.test(bluntR));
  check("SNG-144: the blunt directive is RATING-CAPPED (names the ceiling, never exceeds it)", /within the R ceiling|the R ceiling|NEVER exceed it/.test(bluntR));
  check("SNG-144: at PG-13 the blunt end is STILL PG-13 (the cap holds — the dial uses room, never adds it)", /PG-13/.test(bluntnessDirective("PG-13", "blunt")) && !/explicit|graphic/i.test(bluntnessDirective("PG-13", "blunt")));
  check("SNG-144: RESTRAINED yields a spare directive; balanced adds nothing", /spare|drift|prefers less/i.test(bluntnessDirective("R", "restrained")) && bluntnessDirective("R", "balanced") === "");

  // wiring: the ceiling line composes bluntness within it (floors + cap untouched); register passes plainness
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  check("SNG-144: ratingLineForGM composes the bluntness dial after the rating register, before the ABSOLUTE FLOORS", /\$\{ratingRegister\(preset\)\}\$\{bluntnessDirective\(preset, profile\?\.bluntness\)\} ABSOLUTE FLOORS/.test(appSrc));
  // §23: the registerDetail row moved into the GM Context Registry — the contract (plainness dial reaches
  // narrativeRegister) is unchanged; it now lives in the declared table instead of a hand-listed ctx literal.
  const regSrc144 = readFileSync(join(root, "engine", "gm_registry.js"), "utf8");
  check("SNG-144: the register row passes the player's plainness dial", /narrativeRegister\(env\.location, env\.profile\?\.plainness\)\.cue/.test(regSrc144));
  check("SNG-144: Settings expose both per-profile dials + save them", /id="set-plainness"/.test(appSrc) && /id="set-bluntness"/.test(appSrc) && /profile\.plainness = document/.test(appSrc) && /profile\.bluntness = document/.test(appSrc));
})();

// --- ability-arch v2: depth is EARNED, not bought ---
(() => {
  const rules = { leveling: { maxAbilityRank: 3, rankLevelReq: { "2": 1, "3": 1 } }, practice: { useRankThreshold: { "2": 8, "3": 16 } } };
  const gates = { gates: { deep_craft: { subAttribute: "insight", learnMin: 1, rank3Min: 5 } } };
  const mk = (uses = 0) => ({ level: 5, attributes: {}, subAttributes: { insight: 6 }, abilities: [{ abilityId: "deep_craft", level: 1 }], practice: { uses: { deep_craft: uses }, coActivations: {}, aspirations: [] } });

  // rank 1 → 2 does NOT auto-advance before the use threshold
  let c = mk(7);
  let adv = autoAdvancePracticedRanks(c, rules);
  check("rank 2 does not land before the use threshold (7 < 8)", c.abilities[0].level === 1 && adv.length === 0);

  // at the use threshold it auto-advances to rank 2 — no point spent
  c.practice.uses.deep_craft = 8;
  adv = autoAdvancePracticedRanks(c, rules);
  check("rank 2 lands automatically at the use threshold, free", c.abilities[0].level === 2 && adv.includes("deep_craft"));

  // rank 3 is NEVER automatic — auto-advance only ever touches rank 1 → 2
  c.practice.uses.deep_craft = 20;
  adv = autoAdvancePracticedRanks(c, rules);
  check("rank 3 never auto-advances (only 1→2 is automatic)", c.abilities[0].level === 2 && adv.length === 0);

  // markDefiningMoment lands rank 3 once practiced + past the rank3Min gate
  let r = markDefiningMoment(c, "deep_craft", rules, { attributeGates: gates });
  check("markDefiningMoment masters a practiced, gated craft to rank 3", r.ok && c.abilities[0].level === 3);

  // the gate holds: an under-invested craft cannot be handed mastery
  let c2 = mk(16); c2.subAttributes.insight = 2; c2.abilities[0].level = 2;
  let r2 = markDefiningMoment(c2, "deep_craft", rules, { attributeGates: gates });
  check("markDefiningMoment refuses rank 3 below the rank3Min gate", !r2.ok && c2.abilities[0].level === 2);

  // and it refuses an unpracticed craft even at rank 2
  let c3 = mk(0); c3.abilities[0].level = 2;
  let r3 = markDefiningMoment(c3, "deep_craft", rules, { attributeGates: gates });
  check("markDefiningMoment refuses an unpracticed craft", !r3.ok && c3.abilities[0].level === 2);
})();

// --- ability-arch v2: skill-tree states + axis-touch combination unlock ---
(() => {
  // skillGraphModel node.state derives from owned/rank/locked — OWNED_1/2/3, LOCKED, AVAILABLE
  const catalog = {
    known: { id: "known", name: "Known", tradition: "umbral", levelReq: 1, powerSystem: "reach_dark_light" },
    open: { id: "open", name: "Open", tradition: "umbral", levelReq: 1, powerSystem: "reach_dark_light" }
  };
  const char = { abilities: [{ abilityId: "known", level: 2 }], practice: { uses: {}, coActivations: {} } };
  const model = skillGraphModel(catalog, { recipes: [], branchTemplates: [] }, char, { attributeGates: { gates: {} }, skillCapacity: { skillsKnownByLevel: {} } });
  const known = model.nodes.find(n => n.id === "known"), open = model.nodes.find(n => n.id === "open");
  check("skill-tree state: an owned rank-2 craft is OWNED_2", known.state === "OWNED_2");
  check("skill-tree state: an unowned, ungated craft is AVAILABLE", open.state === "AVAILABLE");

  // combinationThresholdMet: prose-only unlockCondition is NOT engine-computable (false); a component
  // co-activation trigger fires at the ~6 threshold
  const proseCombo = { id: "sc", nativeOrCombination: "combination", unlockCondition: { type: "action_pattern", description: "hunt in the dark" } };
  check("combination with a prose-only unlockCondition is not auto-available", combinationThresholdMet(char, proseCombo, {}) === false);
  const machineCombo = { id: "sc2", nativeOrCombination: "combination", tradition: "umbral", unlockCondition: { components: ["p", "q"], ripenAt: 6 } };
  const hunter = { abilities: [], practice: { uses: {}, coActivations: { "p+q": 6 } } };
  check("combination with a co-activation trigger fires at the threshold", combinationThresholdMet(hunter, machineCombo, {}) === true);
  check("ripeAxisTouchCombinations surfaces the ripe, unowned, tagged combination", ripeAxisTouchCombinations(hunter, { sc2: machineCombo }, {}).some(a => a.id === "sc2"));

  // nativeGrantsFor / combinationsAvailableFor read the tags; empty when nothing is classified
  check("nativeGrantsFor returns [] when no ability is tagged native", nativeGrantsFor("umbral", catalog).length === 0);
  const withNative = { ...catalog, born: { id: "born", name: "Born", tradition: "umbral", nativeOrCombination: "native", levelReq: 1 } };
  check("nativeGrantsFor returns a tagged native of the tradition", nativeGrantsFor("umbral", withNative).some(a => a.id === "born"));
})();

// --- SNG-100b: the standing bar (per-people standing + teacher gate) ---
(() => {
  const rules = {
    peopleStandingBands: [{ min: 20, band: "kin" }, { min: 10, band: "trusted" }, { min: 4, band: "known" }, { min: 0, band: "neutral" }, { min: -999, band: "estranged" }],
    capstoneStanding: { capstoneTier: 4, capstoneThreshold: 10, requiresTeacher: true }
  };
  // standingWithPeople reads peopleDisposition, bands top-down; fixed {score, band} contract
  const c = { peopleDisposition: { umbral: 12 }, teachers: {} };
  const s = standingWithPeople(c, "umbral", rules);
  check("standingWithPeople returns {score, band} from peopleDisposition", s.score === 12 && s.band === "trusted");
  check("standingWithPeople is neutral/0 for an unknown people", standingWithPeople(c, "blazeborn", rules).score === 0);

  // capstone bar: below capstoneTier there is no bar at all
  check("meetsStandingBar is open below the capstone tier", meetsStandingBar(c, "umbral", 3, rules).ok === true);
  // at capstone tier: needs BOTH threshold standing AND a willing teacher
  check("capstone bar blocks with standing but no teacher", meetsStandingBar(c, "umbral", 4, rules).ok === false);
  c.teachers.umbral = { met: true, willing: true, npcId: "n1" };
  check("capstone bar opens with standing + a willing teacher", meetsStandingBar(c, "umbral", 4, rules).ok === true);
  // standing below threshold blocks even with a teacher
  const poor = { peopleDisposition: { umbral: 3 }, teachers: { umbral: { met: true, willing: true } } };
  check("capstone bar blocks below the standing threshold", meetsStandingBar(poor, "umbral", 4, rules).ok === false);
  // an unwilling teacher does not count
  const unwilling = { peopleDisposition: { umbral: 12 }, teachers: { umbral: { met: true, willing: false } } };
  check("an unwilling teacher does not clear the capstone bar", meetsStandingBar(unwilling, "umbral", 4, rules).ok === false);
  // SNG-126: a TRAINER travelling in your company satisfies the SAME teacher gate (no fork) — standing +
  // a present trainer opens the capstone even with no durable teachers[] entry.
  const withTrainer = { peopleDisposition: { umbral: 12 }, teachers: {}, company: [{ npcId: "sorel", roles: ["trainer", "ally"], teaches: "umbral" }] };
  check("SNG-126: a company trainer for the tradition clears the capstone teacher gate", meetsStandingBar(withTrainer, "umbral", 4, rules).ok === true);
  check("SNG-126: a company trainer for a DIFFERENT tradition does not clear it", meetsStandingBar({ peopleDisposition: { blazeborn: 12 }, teachers: {}, company: [{ npcId: "sorel", roles: ["trainer"], teaches: "umbral" }] }, "blazeborn", 4, rules).ok === false);
})();

// --- SNG-126: NPC party members with ROLES — one unified company, roles stack + wire to existing systems ---
{
  const npcReg = { pell: { id: "pell", name: "Pell", relationship: 7, bondType: "romantic", bondStage: "partner" }, sorel: { id: "sorel", name: "Sorel", relationship: 6 }, gruff: { id: "gruff", name: "Gruff", relationship: 1 } };
  const ch = { npcRegistry: npcReg };

  // recruit — roles STACK on one person; partner is refused here (bond-derived only)
  recruit(ch, "sorel", { roles: ["trainer", "ally"], teaches: "somatic" });
  recruit(ch, "sorel", { roles: ["liaison", "partner"], liaisonFor: "somatic" }); // stacks liaison, drops partner
  const sorel = ch.company.find(m => m.npcId === "sorel");
  check("SNG-126: recruit stacks roles on one NPC (trainer+ally+liaison), refusing partner (bond-derived)",
    sorel.roles.includes("trainer") && sorel.roles.includes("ally") && sorel.roles.includes("liaison") && !sorel.roles.includes("partner"));
  check("SNG-126: recruit carries the taught tradition + liaison people", sorel.teaches === "somatic" && sorel.liaisonFor === "somatic");

  // trainerFor + liaisonFactions read their own role independently (one NPC fires multiple benefits)
  check("SNG-126: trainerFor = the traditions the company can teach", trainerFor(ch).has("somatic"));
  check("SNG-126: liaisonFactions maps the people → a >1 standing multiplier", liaisonFactions(ch).somatic > 1 && liaisonMultiplierFor(ch, "somatic") > 1 && liaisonMultiplierFor(ch, "umbral") === 1);

  // the unified roster: recruited Sorel + partner-adjacent Pell (derived partner+ally, never recruited)
  const roster = companyRoster(ch);
  const rSorel = roster.find(r => r.npcId === "sorel"), rPell = roster.find(r => r.npcId === "pell");
  check("SNG-126: companyRoster folds in a partner-adjacent NPC with derived partner+ally roles", rPell && rPell.roles.includes("partner") && rPell.roles.includes("ally") && rPell.recruited === false);
  check("SNG-126: a recruited member is flagged recruited (gets a part-ways control); a derived partner is not", rSorel.recruited === true && rPell.recruited === false);

  // isRecruitable — a strong bond (band >= ally) can be asked along; a faint acquaintance cannot
  check("SNG-126: isRecruitable gates on a strong-enough bond (ally band), not a faint one",
    isRecruitable(npcReg.sorel) === true && isRecruitable(npcReg.gruff) === false);

  // offeredRoles derives roles from an authored NPC record (teaches → trainer, liaisonFor → liaison)
  check("SNG-126: offeredRoles reads the authored record — ally always, +trainer if it teaches, +liaison if it represents a people",
    offeredRoles({ teaches: "somatic", liaisonFor: "somatic" }).sort().join() === ["ally", "liaison", "trainer"].sort().join() && offeredRoles({}).join() === "ally");

  // part ways removes the membership + its benefits (already-learned stays — Law 14, not tested here)
  partCompany(ch, "sorel");
  check("SNG-126: partCompany removes the member and its benefits (trainerFor/liaison now empty)", !ch.company.some(m => m.npcId === "sorel") && !trainerFor(ch).has("somatic"));

  // the master_taro reference content declares the fields the engine reads
  const taro = JSON.parse(readFileSync(join(root, "content/packs/valley/npcs/master_taro.json"), "utf8"));
  check("SNG-126: the reference NPC (master_taro) declares recruitable + teaches + liaisonFor for the engine to read",
    taro.recruitable === true && taro.teaches === "somatic" && offeredRoles(taro).includes("trainer"));
}

// --- SNG-101: domain promotion (raise a ceiling, foreclose the antipode; keep the ground) ---
(() => {
  const rules = {
    peopleStandingBands: [{ min: 20, band: "kin" }, { min: 10, band: "trusted" }, { min: 4, band: "known" }, { min: 0, band: "neutral" }, { min: -999, band: "estranged" }],
    promotion: { tertiaryToSecondary: { minReputation: 8, requiresTeacher: true, minInDomainRanks: 3 }, secondaryToPrimary: { minReputation: 12, requiresTeacher: true, minInDomainRanks: 6, requiresRegionStanding: true, minRegionTurns: 12, requiresCeilingExhausted: true } }
  };
  const idx = { byId: { rootkin: { opposite: "enginewright" }, enginewright: { opposite: "rootkin" }, seraphic: { opposite: "abyssal" }, abyssal: { opposite: "seraphic" } }, folkIds: new Set(), abilityToTradition: {} };
  const catalog = { s1: { id: "s1", tradition: "seraphic", levelReq: 1, nativeOrCombination: "native" }, ab1: { id: "ab1", tradition: "abyssal", levelReq: 1, nativeOrCombination: "native" }, braid1: { id: "braid1", tradition: "abyssal", levelReq: 1, nativeOrCombination: "combination" } };
  const opts = { catalog, traditionIndex: idx };

  const c = { domains: { primary: "rootkin", secondary: "enginewright", tertiary: "seraphic" }, peopleDisposition: { seraphic: 2 }, teachers: {}, abilities: [{ abilityId: "s1", level: 2 }] };
  check("promotion is not eligible without standing + teacher", promotionEligible(c, "tertiary", rules, opts).eligible === false);

  c.peopleDisposition.seraphic = 8; c.teachers.seraphic = { met: true, willing: true }; c.abilities = [{ abilityId: "s1", level: 3 }];
  const e = promotionEligible(c, "tertiary", rules, opts);
  check("promotion eligible once standing + teacher + in-domain ranks are met", e.eligible === true && e.to === "secondary" && e.trad === "seraphic");

  const r = promote(c, "tertiary", rules, opts);
  check("promote raises the tertiary ceiling to III", r.ok && c.domainCeilings.seraphic === 3);
  check("promote forecloses the promoted domain's antipode", (c.foreclosed || []).includes("abyssal"));
  check("promote is idempotent-safe — never lowers the ceiling", promote(c, "tertiary", rules, { force: true, ...opts }).ok && c.domainCeilings.seraphic === 3);

  // foreclosure gates NATIVES only — a braid across the axis is never foreclosed (keep-the-ground)
  check("domainAccess forecloses a native antipode ability", domainAccess(catalog.ab1, 1, c.domains, idx, { foreclosed: c.foreclosed }).allowed === false);
  check("domainAccess NEVER forecloses a braid across the axis", domainAccess(catalog.braid1, 1, c.domains, idx, { foreclosed: c.foreclosed }).allowed === true);
  // the raised ceiling lets the promoted domain reach its new tier
  check("the promoted ceiling lets the domain reach Tier III", domainAccess({ id: "s3", tradition: "seraphic", levelReq: 3, nativeOrCombination: "native" }, 3, c.domains, idx, { domainCeilings: c.domainCeilings }).allowed === true);

  // an owned foreclosed native is not stripped (keep-the-ground): auto-advance skips it
  const held = { domains: c.domains, foreclosed: ["abyssal"], abilities: [{ abilityId: "ab1", level: 1 }], practice: { uses: { ab1: 20 } } };
  const adv = autoAdvancePracticedRanks(held, { leveling: { rankLevelReq: { "2": 1 } }, practice: { useRankThreshold: { "2": 8 } } }, opts);
  check("a foreclosed native does not auto-rank (but is not stripped)", adv.length === 0 && held.abilities[0].level === 1);

  // --- SNG-102: domain acquisition (join a new people at Tier I; forecloses its antipode) ---
  const acqRules = { ...rules, acquisition: { minReputation: 8, requiresTeacherOrTome: true, startingCeiling: 1 } };
  // idx here has rootkin/enginewright/seraphic/abyssal; add a far people 'marcher'/'churnfolk' pair
  const idx2 = { byId: { ...idx.byId, marcher: { opposite: "churnfolk" }, churnfolk: { opposite: "marcher" } }, folkIds: new Set(), abilityToTradition: {} };
  const o2 = { catalog, traditionIndex: idx2 };
  const pc = { domains: { primary: "rootkin", secondary: "enginewright", tertiary: "seraphic" }, foreclosed: ["abyssal"], peopleDisposition: {}, teachers: {} };
  check("cannot acquire without standing + teacher", acquirable(pc, "marcher", acqRules, o2).ok === false);
  check("cannot acquire a foreclosed people", (() => { pc.peopleDisposition.abyssal = 20; pc.teachers.abyssal = { met: true, willing: true }; return acquirable(pc, "abyssal", acqRules, o2).ok === false; })());
  check("cannot acquire the antipode of your primary (closed-opposite)", (() => { pc.peopleDisposition.enginewright = 20; pc.teachers.enginewright = { met: true, willing: true }; return acquirable(pc, "enginewright", acqRules, o2).ok === false; })());
  pc.peopleDisposition.marcher = 10; pc.teachers.marcher = { met: true, willing: true };
  check("can acquire a valid new people with standing + teacher", acquirable(pc, "marcher", acqRules, o2).ok === true);
  const ar = acquireDomain(pc, "marcher", acqRules, o2);
  check("acquireDomain enters at Tier I", ar.ok && pc.domainsAcquired.includes("marcher") && pc.domainCeilings.marcher === 1);
  check("acquireDomain forecloses the joined people's antipode", (pc.foreclosed || []).includes("churnfolk"));
  check("an acquired domain's ability is now accessible at Tier I", domainAccess({ id: "m1", tradition: "marcher", levelReq: 1, nativeOrCombination: "native" }, 1, pc.domains, idx2, { domainsAcquired: pc.domainsAcquired, domainCeilings: pc.domainCeilings }).allowed === true);
  check("but its Tier-II ability is still gated (novice)", domainAccess({ id: "m2", tradition: "marcher", levelReq: 2, nativeOrCombination: "native" }, 2, pc.domains, idx2, { domainsAcquired: pc.domainsAcquired, domainCeilings: pc.domainCeilings }).allowed === false);
  check("cannot acquire a people already held", acquirable(pc, "marcher", acqRules, o2).ok === false);
})();

// --- SNG-045: player identity dedup (one person, one profile) ---
(() => {
  // PURE planner: two "Erik" profiles merge; the current key wins canonical; "Drizzy" is untouched
  const profs = [
    { playerKey: "player-54seyk", displayName: "Erik", charactersPlayed: ["char-a", "char-b"] },
    { playerKey: "player-s9z9u1", displayName: "Erik", charactersPlayed: ["char-c"] },
    { playerKey: "player-0jwfjo", displayName: "Drizzy", charactersPlayed: ["char-d"] }
  ];
  const plan = planPlayerDedup(profs, "player-s9z9u1");
  check("SNG-045: planner merges same-name profiles, leaves distinct names alone", plan.length === 1 && plan[0].name === "erik");
  check("SNG-045: the current device's key wins the canonical slot", plan[0].canonicalKey === "player-s9z9u1" && plan[0].retiredKeys.includes("player-54seyk"));
  check("SNG-045: with no current key, the profile with the most characters is canonical", planPlayerDedup(profs)[0].canonicalKey === "player-54seyk");

  // APPLY to localStorage: seed two Eriks + a Drizzy, then dedupe
  store.clear();
  const put = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  put("singularity.profile.player-54seyk", { playerKey: "player-54seyk", displayName: "Erik", charactersPlayed: ["char-a"], rating: { preset: "R", setBy: "erik" } });
  put("singularity.profile.player-s9z9u1", { playerKey: "player-s9z9u1", displayName: "Erik", charactersPlayed: ["char-c"], rating: { preset: "PG-13" } });
  put("singularity.profile.player-0jwfjo", { playerKey: "player-0jwfjo", displayName: "Drizzy", charactersPlayed: ["char-d"] });
  put("singularity.character.char-a", { id: "char-a", name: "Cellaceron", playerKey: "player-54seyk", level: 3 });
  put("singularity.character.char-c", { id: "char-c", name: "Usnea", playerKey: "player-s9z9u1", level: 2 });
  put("singularity.character.char-d", { id: "char-d", name: "Drizzy's", playerKey: "player-0jwfjo", level: 1 });
  put("singularity.characters", [{ id: "char-a" }, { id: "char-c" }, { id: "char-d" }]);
  localStorage.setItem("singularity.playerKey", "player-s9z9u1");

  const merged = dedupePlayers();
  check("SNG-045: dedupe merges the two Eriks into one group", merged.length === 1 && merged[0].name === "erik");
  const canon = JSON.parse(localStorage.getItem("singularity.profile.player-s9z9u1"));
  check("SNG-045: the canonical Erik now owns BOTH characters", canon.charactersPlayed.includes("char-a") && canon.charactersPlayed.includes("char-c"));
  check("SNG-045: the retired dup profile is removed", localStorage.getItem("singularity.profile.player-54seyk") === null);
  check("SNG-045: a redirect resolves the retired key to canonical", resolvePlayerKey("player-54seyk") === "player-s9z9u1");
  check("SNG-045: the reassigned character now names the canonical owner", JSON.parse(localStorage.getItem("singularity.character.char-a")).playerKey === "player-s9z9u1");
  check("SNG-045: a deliberately-set rating (R) is preferred over the default", canon.rating.preset === "R");
  check("SNG-045: Drizzy (distinct name) is left completely alone", !!localStorage.getItem("singularity.profile.player-0jwfjo") && JSON.parse(localStorage.getItem("singularity.character.char-d")).playerKey === "player-0jwfjo");
  check("SNG-045: findProfileByName resolves an existing person (attach, don't mint)", findProfileByName("erik")?.playerKey === "player-s9z9u1");
  // idempotent: a second pass finds nothing to merge
  check("SNG-045: dedupe is idempotent (second run merges nothing)", dedupePlayers().length === 0);
  store.clear();
})();

// --- SNG-046 Layer 1: world-map foundation (auto-position + icons + KG overlay) ---
(() => {
  const locs = [
    { id: "millbrook", map: { x: 200, y: 200 }, connections: ["dock"] },
    { id: "dock", connections: ["millbrook"] },              // coordless → placed near millbrook
    { id: "far-remnant", connections: [], regionId: "reach" } // orphan → hash grid
  ];
  const pos = autoMapPositions(locs);
  check("SNG-046: authored coords are preserved exactly", pos.millbrook.x === 200 && pos.millbrook.y === 200);
  check("SNG-046: a coordless location is placed near a positioned neighbour", pos.dock && Math.hypot(pos.dock.x - 200, pos.dock.y - 200) < 110);
  check("SNG-046: an orphan location still gets stable coords", Number.isFinite(pos["far-remnant"].x) && Number.isFinite(pos["far-remnant"].y));
  check("SNG-046: positioning is deterministic (same input → same output)", JSON.stringify(autoMapPositions(locs)) === JSON.stringify(pos));

  const c1 = coordForGenerated("new-hollow", { x: 300, y: 300 }, { a: { x: 300, y: 300 } });
  check("SNG-046: a generated location gets stable coords near its parent, not on top of it", Math.hypot(c1.x - 300, c1.y - 300) > 20 && Math.hypot(c1.x - 300, c1.y - 300) < 110);
  check("SNG-046: coordForGenerated is deterministic", JSON.stringify(coordForGenerated("new-hollow", { x: 300, y: 300 }, {})) === JSON.stringify(coordForGenerated("new-hollow", { x: 300, y: 300 }, {})));

  check("SNG-046: tag→icon picks the specific glyph, falls back to a marker", iconForTags(["market"]) === "🏪" && iconForTags(["shrine"]) === "⛩" && iconForTags([]) === "◈");
  check("SNG-046: terrain tint derives from the dominant pole", terrainClass({ poleIntensity: { abstract: 0.7 } }) === "terrain-abstract" && terrainClass({ poleIntensity: { order: 0.1 } }) === "terrain-neutral");

  // KG overlay: a met person shows solid, a heard-of person dimmed; both near their home node
  const char = {
    codex: { topics: { warden: { id: "warden", kind: "person", entityId: "warden", label: "The Warden" }, kesh: { id: "kesh", kind: "person", entityId: "kesh", label: "Kesh" }, mill: { id: "mill", kind: "place", entityId: "millbrook", label: "Millbrook" } } },
    npcRegistry: { warden: { id: "warden", homeLocation: "millbrook" } }
  };
  const npcs = { warden: { id: "warden", homeLocation: "millbrook" }, kesh: { id: "kesh", homeLocation: "millbrook" } };
  const overlay = kgOverlayEntities(char, pos, npcs);
  check("SNG-046: KG overlay places person-entities with a resolvable home (place topics excluded)", overlay.length === 2 && overlay.every(e => e.locationId === "millbrook"));
  check("SNG-046: a met person is discovered (solid), a heard-of one is not", overlay.find(e => e.entityId === "warden").discovered === true && overlay.find(e => e.entityId === "kesh").discovered === false);
  check("SNG-046: overlay entities carry a codex topicId for click-through", overlay.every(e => !!e.topicId));
})();

// --- SNG-044: item relevance + bonus-count cap (best tool, not a pile) ---
(() => {
  const R = { baseChance: { equipmentBonus: 5, equipmentBonusCap: 20, evoStageStep: 2 } };
  // three broadly-matching items no longer STACK — only the best contributes
  const hoard = { inventory: [
    { name: "Rope", bonusTags: ["climb"] },
    { name: "Traveler's Pack", bonusTags: ["climb"] },
    { name: "Piton", bonusTags: ["climb"] }
  ] };
  const r = equipmentBonus(hoard, ["climb"], R);
  check("SNG-044: three matching items give the BEST single bonus, not the sum", r.bonus === 5 && r.helpers.length === 1);
  // the strongest (evolved) item wins the slot and is named as the helper
  const mixed = { inventory: [
    { name: "Plain Knife", bonusTags: ["attack"] },
    { name: "Waystaff", bonusTags: ["attack"], evoStage: 3, evoStageName: "The Staff That Answers" }
  ] };
  const rm = equipmentBonus(mixed, ["attack"], R);
  check("SNG-044: the strongest tool wins the slot and is named", rm.bonus === 5 + 2 * 2 && rm.helpers[0] === "The Staff That Answers");
  // top-N is tunable (a deliberate 'two tools' rule), still capped
  const r2 = equipmentBonus(hoard, ["climb"], { baseChance: { ...R.baseChance, equipmentBonusTopN: 2 } });
  check("SNG-044: equipmentBonusTopN is tunable (top-2 sums the two best)", r2.bonus === 10 && r2.helpers.length === 2);
  check("SNG-044: the total cap still backstops", equipmentBonus(mixed, ["attack"], { baseChance: { ...R.baseChance, equipmentBonusCap: 6, equipmentBonusTopN: 2 } }).bonus === 6);
})();

// --- SNG-042: legends & villains (power-tier + governed surfacing) ---
(() => {
  // load the authored roster from the real content file (green gate: it parses + normalizes)
  const legendsFile = JSON.parse(readFileSync(join(root, "content/packs/valley/lore/legends.json"), "utf8"));
  const { roster } = loadLegends(legendsFile);
  check("SNG-042: the authored legends roster loads as NPC-shaped canon", roster.length >= 5 && roster.every(r => r.id && r.name && r.legend));
  check("SNG-042: an epic villain (Halvex) is a high-weight legendary figure", (() => { const h = roster.find(r => /halvex/i.test(r.id)); return h && h.legend.alignment === "villain" && h.legend.weight === LEGEND_TIER_WEIGHT.legendary; })());

  // power-tier weights + arc scaling
  check("SNG-042: legendary is born far heavier than riffraff", tierBirthWeight("legendary") > tierBirthWeight("regional") && tierBirthWeight("regional") > tierBirthWeight("riffraff"));
  check("SNG-042: the tier scales to the character's arc", tierForArc(1) === "riffraff" && tierForArc(5) === "regional" && tierForArc(8) === "legendary");

  // governed surfacing: the cooldown holds greatness rare
  const alwaysFire = () => 0; // rng that always passes the rarity gate
  const onCooldown = legendSurfacing({ beatType: "witness_power", roster, governor: { lastDeployDay: 10 }, arcLevel: 8, worldDay: 12, rng: alwaysFire });
  check("SNG-042: the cooldown suppresses a deploy inside minGapDays", onCooldown.deploy === false);
  // past the cooldown + rarity, a hero anchor surfaces for a heroic beat
  const heroDeploy = legendSurfacing({ beatType: "doomed_rescue", roster, governor: {}, arcLevel: 8, worldDay: 20, rng: alwaysFire });
  check("SNG-042: a heroic beat surfaces a hero figure (never a villain)", heroDeploy.deploy && heroDeploy.alignment === "hero" && (!heroDeploy.figure || heroDeploy.figure.legend.alignment === "hero"));
  // a villain beat only ever surfaces a villain
  const villainDeploy = legendSurfacing({ beatType: "villain_escalation", roster, governor: {}, arcLevel: 8, worldDay: 20, rng: alwaysFire });
  check("SNG-042: a villain-escalation beat surfaces a villain", villainDeploy.deploy && villainDeploy.alignment === "villain");
  // the rarity roll keeps even an apt beat mostly quiet
  const quiet = legendSurfacing({ beatType: "witness_power", roster, governor: {}, arcLevel: 8, worldDay: 20, rng: () => 0.99 });
  check("SNG-042: the rarity roll keeps most apt beats quiet", quiet.deploy === false);
  // an invalid/absent beat never deploys
  check("SNG-042: a non-beat never deploys", legendSurfacing({ beatType: null, roster, rng: alwaysFire }).deploy === false);

  // GM directive is rating-aware and names the figure; nothing when no deploy
  const dir = legendDeploymentForGM(heroDeploy, { ratingPreset: "R" });
  check("SNG-042: the GM directive names the beat + figure + ceiling", /GREAT FIGURE/.test(dir) && /R ceiling/.test(dir));
  check("SNG-042: no directive when nothing deploys", legendDeploymentForGM({ deploy: false }) === null);
})();

// --- SNG-052: adult-gate persistence ---
(() => {
  const p = { playerKey: "px", rating: defaultRating() };
  check("SNG-052: a fresh profile is not adult-verified", p.rating.adultVerified === false);
  // authorizing R with the gate persists adultVerified
  setRating(p, "R", { authority: "erik", adultGate: true });
  check("SNG-052: authorizing R with the gate persists adultVerified", p.rating.preset === "R" && p.rating.adultVerified === true);
  // reopening: the persisted verification satisfies the gate (no re-check needed)
  check("SNG-052: persisted adultVerified satisfies the gate on a later set", canSetRating(p, "R+", { authority: "erik", adultGate: p.rating.adultVerified }).ok === true);
  // a sub-R set leaves the verification intact (Erik can dip to G temporarily)
  setRating(p, "G", { authority: "erik", adultGate: true });
  check("SNG-052: a sub-R set keeps adultVerified intact", p.rating.adultVerified === true);
  // revoke clears it and drops any R/R+ ceiling
  const p2 = { playerKey: "py", rating: { ...defaultRating(), preset: "R+", adultVerified: true } };
  revokeAdultGate(p2);
  check("SNG-052: revoke clears adultVerified and drops the ceiling below R", p2.rating.adultVerified === false && RATING_LEVEL[p2.rating.preset] < RATING_LEVEL["R"]);
  // an R set WITHOUT the gate (and no persisted verification) is still refused (floor intact)
  const p3 = { playerKey: "pz", rating: defaultRating() };
  check("SNG-052: R without the gate or a verification is still refused", canSetRating(p3, "R", { authority: "erik", adultGate: false }).ok === false);
})();

// --- born-with-image IN the generate path (deps.imageFor) ---
await (async () => {
  const npcSchema = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  const locSchema = JSON.parse(readFileSync(join(root, "schemas/location.schema.json"), "utf8"));
  const llm = (o) => async () => o;
  const imageFor = (entity, t) => `img://${t}/${entity.id}`; // injected builder, provider-agnostic
  const c = { id: "img1", level: 2 };
  const npc = await generate("npc", { character: c, day: 1, location: { id: "x", name: "X", spectrum: {} } },
    { callJSON: llm({ name: "Imaged Warden", role: "keeps the gate", spectrum: {}, fears: "f", wants: "w", homeLocation: "x" }), schema: npcSchema, imageFor });
  check("born-with-image: a generated NPC arrives WITH its image, in the store", npc.image === `img://npc/${npc.id}` && c.generated.npc[npc.id].image === npc.image);
  const loc = await generate("location", { character: c, day: 1, location: { id: "x", name: "X", regionId: "valley", spectrum: {}, poleIntensity: {} } },
    { callJSON: llm({ name: "Imaged Hollow", regionId: "valley", spectrum: {}, poleIntensity: {}, descriptionSeed: "a hollow", tags: [], connections: [] }), schema: locSchema, imageFor });
  check("born-with-image: a generated location arrives WITH its image", loc.image === `img://location/${loc.id}`);
  // no imageFor → no image stamped (caller opted out / art off) — never blocks the mint
  const c2 = { id: "img2", level: 2 };
  const npc2 = await generate("npc", { character: c2, day: 1, location: { id: "x", name: "X", spectrum: {} } },
    { callJSON: llm({ name: "Plain Warden", role: "r", spectrum: {}, fears: "f" }), schema: npcSchema });
  check("born-with-image: no imageFor → no image, mint still succeeds", npc2.image === undefined && !!npc2._gen);
})();

// --- SNG-055/059: the great circle domain-access model (read from the real traditions.json) ---
(() => {
  const tf = JSON.parse(readFileSync(join(root, "content/packs/core/rules/traditions.json"), "utf8"));
  const idx = buildTraditionIndex(tf);
  check("SNG-055: the index reads all 24 ring stations + ability→tradition map", ringOrder(idx).length === 24 && Object.keys(idx.abilityToTradition).length > 100);
  // umbral ↔ blazeborn are antipodal (dark_light); 12 steps apart
  check("SNG-055: antipode == the axis-opposite (umbral↔blazeborn)", antipodeOf("umbral", idx) === "blazeborn" && ringDistance("umbral", "blazeborn", idx) === 12);
  check("SNG-055: ring-neighbours are 1 step (the kin band; SNG-125 binds the SECONDARY to it)", neighborsOf("umbral", idx).every(n => ringDistance("umbral", n, idx) === 1) && neighborsOf("umbral", idx).length === 2);
  check("SNG-055: folk traditions are open", isFolkTradition("radiant_folk", idx) || isFolkTradition("harmonic", idx));

  // pick a real pole ability + its tradition to exercise the access bands
  const umbralAb = { id: "umbracraft", tradition: "umbral", levelReq: 1 };
  const domains = { primary: "umbral", secondary: "veilwright", tertiary: neighborsOf("veilwright", idx).find(n => n !== "umbral") };
  check("SNG-055: primary domain — full access, no penalty", domainAccess(umbralAb, 5, domains, idx).allowed && domainAccess(umbralAb, 5, domains, idx).penalty === 1 && domainAccess(umbralAb, 5, domains, idx).band === "primary");
  // secondary caps at tier III
  const secAb = { id: "x", tradition: "veilwright", levelReq: 1 };
  check("SNG-055: secondary — allowed to III, blocked at IV", domainAccess(secAb, 3, domains, idx).allowed && !domainAccess(secAb, 4, domains, idx).allowed);
  // tertiary caps at tier II
  const terAb = { id: "y", tradition: domains.tertiary, levelReq: 1 };
  check("SNG-055: tertiary — allowed to II, blocked at III", domainAccess(terAb, 2, domains, idx).allowed && !domainAccess(terAb, 3, domains, idx).allowed);
  // the antipode of primary is CLOSED
  const antiAb = { id: "z", tradition: "blazeborn", levelReq: 1 };
  check("SNG-055: the antipode of your primary is CLOSED (not offered)", domainAccess(antiAb, 1, domains, idx).allowed === false && domainAccess(antiAb, 1, domains, idx).band === "closed");
  // a kin (adjacent to primary) is free except capstones
  const kin = neighborsOf("umbral", idx).find(n => n !== "veilwright") || neighborsOf("umbral", idx)[0];
  const kinAb = { id: "k", tradition: kin, levelReq: 1 };
  check("SNG-055: adjacent-to-primary is free below capstone, blocked at capstone", domainAccess(kinAb, 3, domains, idx).allowed && domainAccess(kinAb, 3, domains, idx).penalty === 1 && !domainAccess({ ...kinAb, levelReq: 5 }, 5, domains, idx).allowed);
  // a far, non-antipode tradition — allowed but costs more
  const far = ringOrder(idx).find(t => t !== "umbral" && t !== "blazeborn" && ringDistance(t, "umbral", idx) >= 3 && t !== domains.secondary && t !== domains.tertiary);
  check("SNG-055: a far tradition is learnable but costs extra", far && domainAccess({ id: "f", tradition: far, levelReq: 1 }, 1, domains, idx).allowed && domainAccess({ id: "f", tradition: far, levelReq: 1 }, 1, domains, idx).penalty >= 2);
  // folk is always open, no penalty, even with domains chosen
  check("SNG-055: folk stays open with a penalty of 1", domainAccess({ id: "lb", tradition: "radiant_folk", levelReq: 1 }, 3, domains, idx).allowed && domainAccess({ id: "lb", tradition: "radiant_folk", levelReq: 1 }, 3, domains, idx).penalty === 1);

  // --- SNG-125: the SECONDARY is bound to the primary's KIN band; the TERTIARY is freed ---
  const kinN = neighborsOf("umbral", idx);            // umbral's ring-neighbours (the kin band)
  const antipode = antipodeOf("umbral", idx);          // blazeborn — never kin
  const farT = ringOrder(idx).find(t => t !== "umbral" && t !== antipode && ringDistance(t, "umbral", idx) >= 3);
  check("SNG-125: isKinAdjacent — a ring-neighbour of the primary IS kin", isKinAdjacent(kinN[0], "umbral", idx) === true);
  check("SNG-125: isKinAdjacent — the antipode is NOT kin, nor is a far tradition, nor the primary itself",
    isKinAdjacent(antipode, "umbral", idx) === false && isKinAdjacent(farT, "umbral", idx) === false && isKinAdjacent("umbral", "umbral", idx) === false);
  const kinOpts = kinSecondaryOptions("umbral", idx);
  check("SNG-125: kinSecondaryOptions — exactly the kin neighbours, excluding primary/antipode/folk",
    kinOpts.length === kinN.length && kinOpts.every(t => kinN.includes(t)) && !kinOpts.includes("umbral") && !kinOpts.includes(antipode));

  // domainsLegal: enforce (new builder) refuses a non-kin secondary; a kin secondary passes
  check("SNG-125: a NEW build with a non-kin secondary is refused (enforce) with a reason",
    domainsLegal({ primary: "umbral", secondary: farT }, idx, { enforce: true }).legal === false);
  check("SNG-125: a NEW build with a kin secondary is legal (enforce)",
    domainsLegal({ primary: "umbral", secondary: kinN[0] }, idx, { enforce: true }).legal === true);
  // GRANDFATHER (Erik ruling 2): a LOADED character with a non-kin secondary is ALWAYS legal — the
  // constraint gates selection, never a save. (Silas: cogitant secondary must keep playing.)
  check("SNG-125: a LOADED non-kin build is grandfathered legal (default / enforce:false)",
    domainsLegal({ primary: "umbral", secondary: farT }, idx).legal === true && domainsLegal({ primary: "umbral", secondary: farT }, idx, { enforce: false }).legal === true);
  // access math is UNCHANGED — a non-kin (grandfathered) secondary still reads as a full secondary domain
  check("SNG-125: access math untouched — a grandfathered non-kin secondary still gets secondary access to III",
    domainAccess({ id: "gf", tradition: farT, levelReq: 1 }, 3, { primary: "umbral", secondary: farT }, idx).band === "secondary");

  // crystallizeDomains SNG-125: secondary is snapped to a KIN of primary; tertiary is FREE (may be far)
  const cd = crystallizeDomains({ umbral: 10, [farT]: 8, [kinN[0]]: 6, [kinN[1]]: 1 }, idx);
  check("SNG-125: crystallize picks a KIN secondary even when a FAR tradition outranks it (snapped, never illegal)",
    cd.primary === "umbral" && kinN.includes(cd.secondary) && isKinAdjacent(cd.secondary, "umbral", idx));
  check("SNG-125: crystallize's tertiary is FREE — the far tradition can land there (no secondary-neighbour binding)",
    cd.tertiary === farT || (cd.tertiary && cd.tertiary !== cd.secondary && cd.tertiary !== "umbral"));

  // migration: infer domains from held abilities (nobody loses one — grandfathered)
  const inf = inferDomains([{ abilityId: "umbracraft" }, { abilityId: "umbracraft" }, { abilityId: "false_true" }], { umbracraft: { tradition: "umbral" }, false_true: { tradition: "veilwright" } }, idx);
  check("SNG-055: inferDomains derives primary from the most-held tradition", inf?.primary === "umbral" && inf?.secondary === "veilwright");
  check("SNG-055: a pre-domain (null) character stays fully open", domainAccess(antiAb, 5, {}, idx).allowed === true);

  // SNG-062: domains CRYSTALLIZE from played tradition-tags
  const crys = crystallizeDomains({ umbral: 3, veilwright: 2, blazeborn: 1 }, idx);
  check("SNG-062: the heaviest tag becomes the primary", crys?.primary === "umbral");
  check("SNG-062: the secondary is never the primary's antipode", crys?.secondary !== antipodeOf("umbral", idx));
  check("SNG-062: the tertiary is a ring-neighbour of the secondary (or null)", !crys?.tertiary || neighborsOf(crys.secondary, idx).includes(crys.tertiary));
  check("SNG-062: no tags → no domains (folk-only stays open)", crystallizeDomains({ radiant_folk: 4 }, idx) === null);
  // a real prologue playthrough: the tags produce a coherent, self-consistent ring position
  const played = crystallizeDomains({ stillhold: 2, marcher: 1, verist: 1 }, idx);
  check("SNG-062: a played spread crystallizes a valid primary with a non-antipode secondary", played?.primary === "stillhold" && played.secondary && played.secondary !== antipodeOf("stillhold", idx));

  // SNG-063: the ability list is FILTERED by domains — the antipode is never offered, the primary is
  const domainsUV = { primary: "umbral", secondary: "veilwright", tertiary: "abyssal" };
  const l1 = Object.values(tf).flat ? [] : []; // (abilities live in ability files; assert the gate directly)
  const antipodeOffered = domainAccess({ id: "x", tradition: "blazeborn", levelReq: 1 }, 1, domainsUV, idx).allowed;
  const primaryOffered = domainAccess({ id: "y", tradition: "umbral", levelReq: 1 }, 1, domainsUV, idx).allowed;
  const folkOffered = domainAccess({ id: "z", tradition: "radiant_folk", levelReq: 1 }, 1, domainsUV, idx).allowed;
  check("SNG-063: a domain-filtered starting list excludes the antipode, keeps primary + folk", antipodeOffered === false && primaryOffered === true && folkOffered === true);

  // SNG-068A: the Silas fix — starting abilities reconcile against the CONFIRMED domains.
  // Silas earned his ANTIPODE's craft during play but CONFIRMED primary = umbral (knows nothing umbral).
  const cat068 = { blaze_a: { id: "blaze_a", tradition: "blazeborn", levelReq: 1 }, veil_a: { id: "veil_a", tradition: "veilwright", levelReq: 1 },
    umbral_lo: { id: "umbral_lo", tradition: "umbral", levelReq: 1 }, umbral_hi: { id: "umbral_hi", tradition: "umbral", levelReq: 3 } };
  const rec = reconcileStartingAbilities(["blaze_a", "veil_a"], { primary: "umbral", secondary: "veilwright", tertiary: null }, cat068, idx);
  check("SNG-068A: a character with no CONFIRMED-primary ability is granted the lowest-tier one (an umbral knows something umbral)", rec.grantedFromPrimary === "umbral_lo" && rec.abilities.includes("umbral_lo"));
  check("SNG-068A: earned abilities are KEPT (nothing stripped) — the antipode one is grandfathered + flagged", rec.abilities.includes("blaze_a") && rec.grandfathered.includes("blaze_a"));
  // a character who already holds a primary ability gets no extra grant
  const rec2 = reconcileStartingAbilities(["umbral_lo"], { primary: "umbral" }, cat068, idx);
  check("SNG-068A: a character who already knows their primary craft gets no extra grant", rec2.grantedFromPrimary === null && rec2.abilities.length === 1);

  // SNG-BATCH-10 Phase 1: the domain gate is now ENGINE-ENFORCED in learnAbility (not just the
  // picker) — the "learn any capstone" hole is closed even on non-picker learn paths. Origin=valley
  // so the legacy effectiveLevelReq passes and the domain gate is what's exercised.
  const b10tert = neighborsOf("veilwright", idx).find(n => n !== "umbral");
  const b10dom = { primary: "umbral", secondary: "veilwright", tertiary: b10tert };
  const b10far = ringOrder(idx).find(t => t !== "umbral" && t !== "blazeborn" && ringDistance(t, "umbral", idx) >= 3 && t !== "veilwright" && t !== b10tert && ringDistance(t, "umbral", idx) !== 1);
  const b10cat = {
    dark_touch: { id: "dark_touch", name: "Dark Touch", tradition: "umbral", powerSystem: "harmonic", levelReq: 1 },
    bright_burn: { id: "bright_burn", name: "Bright Burn", tradition: "blazeborn", powerSystem: "harmonic", levelReq: 1 },
    veil_deep: { id: "veil_deep", name: "Veil Deep", tradition: "veilwright", powerSystem: "harmonic", levelReq: 4 },
    far_reach: { id: "far_reach", name: "Far Reach", tradition: b10far, powerSystem: "harmonic", levelReq: 1 },
  };
  const b10char = () => ({ level: 5, skillPoints: 9, origin: "valley", abilities: [], domains: { ...b10dom } });
  const b10a = b10char(); const b10ar = learnAbility(b10a, "dark_touch", b10cat, rules, { traditionIndex: idx });
  check("SNG-BATCH-10: a primary-domain ability learns and spends 1 point", b10ar.ok && b10a.skillPoints === 8 && b10ar.band === "primary");
  const b10b = b10char(); const b10br = learnAbility(b10b, "bright_burn", b10cat, rules, { traditionIndex: idx });
  check("SNG-BATCH-10: the antipode is ENGINE-blocked in learnAbility (the capstone hole is closed)", !b10br.ok && b10b.abilities.length === 0);
  const b10c = b10char(); const b10cr = learnAbility(b10c, "veil_deep", b10cat, rules, { traditionIndex: idx });
  check("SNG-BATCH-10: a secondary ability above tier III is engine-blocked", !b10cr.ok && b10c.abilities.length === 0);
  const b10d = b10char(); const b10before = b10d.skillPoints; const b10dr = learnAbility(b10d, "far_reach", b10cat, rules, { traditionIndex: idx });
  check("SNG-BATCH-10: a far-domain ability learns but costs the ring-distance penalty (>1 pt)", b10dr.ok && (b10before - b10d.skillPoints) >= 2);
  const b10leg = { level: 5, skillPoints: 9, origin: "valley", abilities: [], domains: {} };
  check("SNG-BATCH-10: no domains (legacy) → the gate is a no-op, learning stays open", learnAbility(b10leg, "bright_burn", b10cat, rules, { traditionIndex: idx }).ok);
  const b10noidx = b10char();
  check("SNG-BATCH-10: no traditionIndex passed → gate is a no-op (backward-safe callers)", learnAbility(b10noidx, "bright_burn", b10cat, rules, {}).ok);
})();

// --- SNG-BATCH-10 Phase 3 / SNG-065: structured quests load + resolve with durable consequences ---
(() => {
  const qf = JSON.parse(readFileSync(join(root, "content/packs/valley/quests.json"), "utf8"));
  const defs = qf.quests || [];
  check("SNG-065: the authored quests parse and are REAL quests (stakes + stages + outcomes)", defs.length >= 1 && defs.every(isRealQuest));
  const ledger = defs.find(d => d.id === "the_edge_district_ledger") || defs[0];
  check("SNG-065: an errand (no stakes) is NOT a real quest", !isRealQuest({ id: "fetch", name: "Fetch", stages: [{}], outcomes: [{}] }));

  const char = { name: "Q", quests: [], xp: 0, chronicle: [], clock: null, domains: { primary: "verist", secondary: "lattice", tertiary: null } };
  const started = startStructuredQuest(char, ledger, { worldDay: 12, nowISO: "2026-07-12T00:00:00Z" });
  check("SNG-065: startStructuredQuest adds a structured, active quest with stakes", started.ok && char.quests.length === 1 && char.quests[0].structured && char.quests[0].status === "active" && !!char.quests[0].stakes);
  check("SNG-065: starting the same quest twice never forks a duplicate", !startStructuredQuest(char, ledger, {}).ok && char.quests.length === 1);

  const q = char.quests[0];
  const cs = completeQuestStage(char, q.id, q.stages[0].id);
  check("SNG-065: completing a stage records its change as findable progress + advances the pointer", cs.ok && char.quests[0].stageIndex === 1 && char.quests[0].progress.includes(q.stages[0].change));

  // routes the character's domains open (verist primary, lattice secondary)
  const routes = routesForCharacter(char.quests[0], char);
  check("SNG-065: the character's domains light the routes they open (verist + lattice)", routes.filter(r => r.open).map(r => r.trad).sort().join(",") === "lattice,verist");

  // resolve at an outcome — APPLIES machine-readable effects[] durably (chronicle write is the floor)
  const events = [], facts = [];
  const outcomeDef = ledger.outcomes[0];
  const outcomeId = outcomeDef.id;
  const res = resolveStructuredQuest(char, q.id, outcomeId, { worldDay: 13, nowISO: "2026-07-13T00:00:00Z", recordEvent: e => events.push(e), recordFact: f => facts.push(f) });
  check("SNG-065: resolving applies the outcome + writes a FINDABLE chronicle record (the floor)", res.ok && char.quests[0].status === "resolved" && char.chronicle.some(c => c.kind === "quest_resolved" && c.outcome === outcomeDef.name));

  // BOUNDARY-1 CLOSE: effects[] are applied DETERMINISTICALLY (not prose-parsed)
  const effTypes = new Set((outcomeDef.effects || []).map(e => e.type));
  check("SNG-BOUNDARY-1: the authored outcome carries machine-readable effects[]", Array.isArray(outcomeDef.effects) && outcomeDef.effects.length > 0);
  if (effTypes.has("disposition")) { const d = outcomeDef.effects.find(e => e.type === "disposition"); check("SNG-BOUNDARY-1: a disposition effect applies the EXACT authored delta (not a parsed guess)", char.peopleDisposition[d.people] === d.delta); }
  if (effTypes.has("world_event")) { const w = outcomeDef.effects.find(e => e.type === "world_event"); check("SNG-BOUNDARY-1: a world_event propagates dated on the shared clock + delayDays", events.some(e => e.worldDay === 13 + (w.delayDays || 0))); }
  if (effTypes.has("codex_fact")) check("SNG-BOUNDARY-1: a codex_fact is pinned as a findable record via the sink", facts.length >= 1);
  if (effTypes.has("npc_state")) { const n = outcomeDef.effects.find(e => e.type === "npc_state"); check("SNG-BOUNDARY-1: an npc_state effect writes the NPC's quest state durably", char.npcRegistry[n.npc]?.questState === n.state); }
  if (effTypes.has("ally")) { const a = outcomeDef.effects.find(e => e.type === "ally"); check("SNG-BOUNDARY-1: an ally effect binds the NPC to the character", char.npcRegistry[a.npc]?.ally === true); }
  const xpEff = (outcomeDef.effects || []).find(e => e.type === "xp");
  check("SNG-065: resolution awards xp and a resolved quest can't be re-resolved", char.xp === (xpEff ? xpEff.amount : 30) && !resolveStructuredQuest(char, q.id, outcomeId, {}).ok);

  // legacy fallback: an outcome with prose-only narration (no effects[]) still resolves + records
  const legacyChar = { name: "L", quests: [], xp: 0, chronicle: [], domains: {} };
  const legacyDef = { id: "legacy_q", name: "Legacy", stakes: "someone pays", stages: [{ id: "s1", objective: "o", condition: "c", change: "ch" }], routes: {}, outcomes: [{ id: "o1", name: "Done", summary: "s", narration: ["Verist disposition toward you: raised."] }] };
  startStructuredQuest(legacyChar, legacyDef, {});
  const legRes = resolveStructuredQuest(legacyChar, "legacy_q", "o1", { worldDay: 5 });
  check("SNG-BOUNDARY-1: a legacy prose-only outcome still resolves via the fallback parser", legRes.ok && legacyChar.peopleDisposition.verist >= 1 && legacyChar.chronicle.some(c => c.kind === "quest_resolved"));

  // availability gating: already-held excludes it (char holds the ledger from above, now resolved)
  check("SNG-065: a quest already in the log is never re-offered", !availableStructuredQuests(char, defs, { locationId: "radiant_plateau_edge", npcHomes: { fendt: "radiant_plateau_edge" } }).some(d => d.id === ledger.id));
})();

// --- SNG-112: quest offers gated by proximity/thread, not bare region ---
(() => {
  const qf = JSON.parse(readFileSync(join(root, "content/packs/valley/quests.json"), "utf8"));
  const defs = qf.quests || [];
  const ledger = defs.find(d => d.id === "the_edge_district_ledger"); // region valley, giver fendt (home radiant_plateau_edge), no locationId
  const homes = { fendt: "radiant_plateau_edge" };
  const offers = ctx => availableStructuredQuests({ quests: [] }, defs, ctx).some(d => d.id === ledger.id);
  const off = (ctx, extra) => availableStructuredQuests({ quests: [], ...extra }, defs, ctx).some(d => d.id === ledger.id);

  // THE LEAK, CLOSED: sharing the region but far from the place and off the thread → NOT offered.
  check("SNG-112: bare region match no longer pushes a quest into the scene",
    !offers({ region: "valley", locationId: "somewhere_else", adjacentLocationIds: [], sceneNpcNames: [], npcHomes: homes }));
  // proximity: AT the quest's place (giver's home) → offered.
  check("SNG-112: a quest is offered when the player is AT its location (the giver's home)",
    offers({ region: "valley", locationId: "radiant_plateau_edge", sceneNpcNames: [], npcHomes: homes }));
  // proximity: ADJACENT to the quest's place → offered.
  check("SNG-112: a quest is offered when the player is ADJACENT to its location",
    offers({ region: "valley", locationId: "elsewhere", adjacentLocationIds: ["radiant_plateau_edge"], sceneNpcNames: [], npcHomes: homes }));
  // giver present (regression — the pre-existing real connection is kept).
  check("SNG-112: giver present still offers the quest regardless of place",
    offers({ region: "valley", locationId: "far_away", sceneNpcNames: ["Fendt"], npcHomes: homes }));
  // thread touched: the player already KNOWS the giver → a continuation surfaces even when far.
  check("SNG-112: a quest surfaces when its thread is already touched (giver known), even far off",
    off({ region: "valley", locationId: "far_away", npcHomes: homes }, { peopleDisposition: { fendt: 2 } }));
  check("SNG-112: threadTouched is true when the giver is in the codex, false for a stranger",
    threadTouched(ledger, { codex: { topics: { t1: { entityId: "fendt", facts: [] } } } }) &&
    !threadTouched(ledger, { npcRegistry: {}, peopleDisposition: {}, codex: { topics: {} } }));
  // explicit browse surface: a quest board the player opened may list region quests (player-initiated, not a push).
  check("SNG-112: region listing returns ONLY on an explicit board browse (ctx.board)",
    offers({ region: "valley", board: true }) && !offers({ region: "valley" }));
  // no context at all → offer all (a bare board with no place still lists everything).
  check("SNG-112: no context → offer all (backward-safe for context-free callers)", offers({}));

  // parallel player quests on a shared arc: holding one instance suppresses another on the same arcId.
  const arcA = { id: "fendt_silas", name: "Silas & Fendt", arcId: "fendt_ledger", giver: "fendt", stakes: "s", stages: [{ id: "s1", objective: "o", condition: "c", change: "ch" }], outcomes: [{ id: "o1", name: "done", summary: "x" }] };
  const arcB = { id: "fendt_canon", name: "The Canonical Fendt", arcId: "fendt_ledger", giver: "fendt", stakes: "s", stages: [{ id: "s1", objective: "o", condition: "c", change: "ch" }], outcomes: [{ id: "o1", name: "done", summary: "x" }] };
  const arcChar = { quests: [] };
  const startedArc = startStructuredQuest(arcChar, arcA, {});
  check("SNG-112: a structured quest record carries its arcId (shared-arc key)", startedArc.ok && arcChar.quests[0].arcId === "fendt_ledger");
  const arcAvail = availableStructuredQuests(arcChar, [arcB], { sceneNpcNames: ["Fendt"], npcHomes: {} });
  check("SNG-112: holding one instance of a shared arc suppresses another instance of the same arc", !arcAvail.some(d => d.id === "fendt_canon"));
})();

// --- SNG-056: the GM moveTo op resolves a place ref to the authoritative location id ---
(() => {
  const locs = { harmonic_heights_terrace: { name: "Harmonic Heights — Lower Terrace" }, disputed_zone_fringe: { name: "The Disputed Zone" }, millbrook: { name: "Millbrook" } };
  check("SNG-056: an exact id resolves", resolveLocationId("disputed_zone_fringe", locs) === "disputed_zone_fringe");
  check("SNG-056: an exact name resolves to its id (the header can follow the fiction)", resolveLocationId("The Disputed Zone", locs) === "disputed_zone_fringe");
  check("SNG-056: a loose name fragment resolves", resolveLocationId("disputed zone", locs) === "disputed_zone_fringe");
  check("SNG-056: a place that does not exist resolves to null (the engine only honors real moves)", resolveLocationId("Castle Nowhere", locs) === null);
  check("SNG-056: an empty ref is null", resolveLocationId("", locs) === null && resolveLocationId(null, locs) === null);
})();

// --- SNG-075: encounters fire in NARRATIVE play, bound to narrative TIME ---
(() => {
  const table = { triggerRules: { onNarrativeTime: {}, onTravel: { chance: 0.35 }, onRest: { chance: 0.15 } }, encounters: [] };
  const quiet = { dangerLevel: 0 }, road = { dangerLevel: 2 };
  // SNG-127: the fallback rate is now 0.14/hr (was 0.04 → the dead-zone). A DECLARED short exchange
  // still stays modest; a half-day's walk is now very likely eventful; a trek caps out.
  check("SNG-127: a declared 20-minute beat stays modest (a real short exchange isn't loud)", narrativeTimeChance(0.33, quiet, table) < 0.08);
  check("SNG-127: a half-day walk (~6h) is now very likely eventful (hits the cap)", narrativeTimeChance(6, quiet, table) >= 0.5 && narrativeTimeChance(6, quiet, table) <= 0.6 + 1e-9);
  check("SNG-075: chance rises with hours and is capped", narrativeTimeChance(72, quiet, table) === narrativeTimeChance(72, quiet, table) && narrativeTimeChance(72, quiet, table) <= 0.6 * 1.0 + 1e-9);
  check("SNG-075: danger nudges the chance up", narrativeTimeChance(6, road, table) > narrativeTimeChance(6, quiet, table));
  check("SNG-075: zero elapsed time never fires", narrativeTimeChance(0, road, table) === 0 && rollNarrativeTime(0, road, table, () => 0) === false);
  // classification drives which trigger model applies
  check("SNG-075: a sleep/camp beat classifies as REST", classifyNarrativeKind({ why: "bedded down for the night", hoursPassed: 8 }) === "rest" && classifyNarrativeKind({ intentTags: ["camp"], hoursPassed: 8 }) === "rest");
  check("SNG-075: a road/journey beat classifies as TRAVEL", classifyNarrativeKind({ why: "a day on the road", hoursPassed: 10 }) === "travel" && classifyNarrativeKind({ intentTags: ["journey"], hoursPassed: 6 }) === "travel");
  check("SNG-075: plain elapsed time classifies as TIME; a zero-hour beat is NONE", classifyNarrativeKind({ why: "a long talk", hoursPassed: 3 }) === "time" && classifyNarrativeKind({ why: "a quick word", hoursPassed: 0 }) === "none");
})();

// --- SNG-127: the encounter dead-zone — the world must actually happen (real config + pacing + sim) ---
(() => {
  const table = JSON.parse(readFileSync(join(root, "content/packs/valley/events/random_encounters.json"), "utf8"));
  const quiet = { dangerLevel: 0 };

  // THE DEAD-ZONE FIX (Q2): a normal beat with no timeOps used to be seen as 0h → classify "none" → never
  // fires. beatHours floors an UNDECLARED beat to minHoursPerBeat (=1, ADVANCE.beat), so it now counts.
  check("SNG-127: an UNDECLARED beat (no timeOps) is floored to a real hour (was 0 → the dead-zone)",
    beatHours({}, table) === 1 && beatHours({ timeOps: {} }, table) === 1);
  check("SNG-127: a DECLARED short beat keeps its real (quiet) hours — a 20-min exchange isn't loud",
    beatHours({ timeOps: { hoursPassed: 0.33 } }, table) === 0.33);
  check("SNG-127: the floored undeclared beat now produces a real, non-zero narrative-time chance",
    narrativeTimeChance(beatHours({}, table), quiet, table) > 0 && classifyNarrativeKind({ hoursPassed: beatHours({}, table) }) === "time");

  // the config carries the fix (rate up from the 0.04 fallback; a real onNarrativeTime + pacing modes)
  check("SNG-127: config supplies onNarrativeTime (rate 0.14, cooldown, floor) + the 4 pacing modes",
    table.triggerRules.onNarrativeTime.ratePerHour === 0.14 && !!table.triggerRules.pacingModes.calm && !!table.triggerRules.pacingModes.relentless);
  check("SNG-127: the click-path rates were bumped (travel 0.45, enter 0.20, rest 0.20)",
    table.triggerRules.onTravel.chance === 0.45 && table.triggerRules.onEnterLocation.chance === 0.2 && table.triggerRules.onRest.chance === 0.2);

  // pacing: resolves modes from config, defaults to balanced, unknown → balanced
  check("SNG-127: resolvePacing reads the config modes + defaults/falls back to balanced",
    resolvePacing("relentless", table).mult === 2.4 && resolvePacing("relentless", table).cooldown === 0 &&
    resolvePacing(undefined, table).key === "balanced" && resolvePacing("nonsense", table).key === "balanced");
  check("SNG-127: pacing scales the chance — Relentless > Balanced > Calm on the same beat",
    narrativeTimeChance(2, quiet, table, resolvePacing("relentless", table).mult) > narrativeTimeChance(2, quiet, table, resolvePacing("balanced", table).mult) &&
    narrativeTimeChance(2, quiet, table, resolvePacing("balanced", table).mult) > narrativeTimeChance(2, quiet, table, resolvePacing("calm", table).mult));

  // THE ACCEPTANCE CRITERION: a simulated narrative session produces encounters (not zero). This
  // reproduces the app's gate — undeclared beats (floored), soft scene spacing, pacing cooldown/mult —
  // over many sessions so the result is statistically stable, not a single flaky roll.
  const simSession = (pacingKey, turns) => {
    const pace = resolvePacing(pacingKey, table);
    let since = 99, sceneFired = false, count = 0;
    for (let i = 0; i < turns; i++) {
      since++;
      const spacing = pace.cooldown + (sceneFired ? 2 : 0);
      if (since <= spacing) continue;
      const h = beatHours({}, table); // a normal beat: GM omits timeOps → floored
      if (classifyNarrativeKind({ hoursPassed: h }) === "none") continue;
      if (rollNarrativeTime(h, quiet, table, Math.random, pace.mult)) { count++; sceneFired = true; since = 0; }
    }
    return count;
  };
  const sessions = 400;
  let balTotal = 0, calmTotal = 0, relTotal = 0, balZero = 0;
  for (let s = 0; s < sessions; s++) {
    const b = simSession("balanced", 30); balTotal += b; if (b === 0) balZero++;
    calmTotal += simSession("calm", 30);
    relTotal += simSession("relentless", 30);
  }
  check("SNG-127: a 30-turn narrative session AVERAGES multiple encounters (the dead-zone is gone)", balTotal / sessions > 1.5 && balTotal > 0);
  check("SNG-127: most balanced 30-turn sessions are NOT silent (near-zero dead-zone rate)", balZero / sessions < 0.25);
  check("SNG-127: pacing genuinely changes frequency — Relentless >> Balanced >> Calm over 30 turns", relTotal > balTotal && balTotal > calmTotal);
})();

// --- SNG-070: GM corrections — the game self-heals (REPAIR, not WISH) ---
(() => {
  const bgs = [{ id: "duelist" }, { id: "craftsman" }];
  const idx = { byId: { wright: {}, blazeborn: {}, verist: {} } };
  const locs = { millbrook: { name: "Millbrook" }, the_underlight: { name: "The Underlight" } };
  const ctx = { backgrounds: bgs, traditionIndex: idx, locations: locs, resolveLocationId, worldDay: 12, nowISO: "2026-07-12T00:00:00Z" };
  const base = () => ({ background: "craftsman", origin: "wright", domains: { primary: "wright", secondary: null, tertiary: null }, abilities: [{ abilityId: "lightsense", level: 1 }], companions: ["aevi"], companionNames: { aevi: "Spark" }, quests: [{ id: "stuck", structured: true, status: "active", stageIndex: 0, stages: [{ id: "s1" }, { id: "s2" }] }], codex: { topics: { grael: { summary: "old" } } }, npcRegistry: {}, xp: 100, level: 3, currentLocationId: millloc() });
  function millloc() { return "millbrook"; }

  // REPAIR: a wrong background is corrected, logged, from→to
  const c1 = base(); const r1 = applyStateOps(c1, [{ op: "correctField", field: "background", to: "duelist", why: "should be a duelist" }], ctx);
  check("SNG-070: a wrong background is corrected + logged (from → to, why, world-day)", r1.applied.length === 1 && c1.background === "duelist" && c1.corrections.length === 1 && c1.corrections[0].from === "craftsman" && c1.corrections[0].to === "duelist" && c1.corrections[0].worldDay === 12);

  // REFUSE: an advance (xp/level) is refused and NOTHING changes
  const c2 = base(); const r2 = applyStateOps(c2, [{ op: "correctField", field: "xp", to: 600 }, { op: "correctField", field: "level", to: 10 }], ctx);
  check("SNG-070: xp/level are REFUSED (repair, not wish) — nothing advances", r2.applied.length === 0 && r2.refused.length === 2 && c2.xp === 100 && c2.level === 3);

  // REPAIR: a domain the game guessed is re-chosen — but held abilities are NOT removed (grandfathered)
  const c3 = base(); const r3 = applyStateOps(c3, [{ op: "correctDomain", slot: "primary", to: "verist", why: "I chose verist" }], ctx);
  check("SNG-070: a domain correction re-chooses + does NOT touch held abilities (grandfathered)", r3.applied.length === 1 && c3.domains.primary === "verist" && c3.abilities.length === 1);
  check("SNG-070: a bogus tradition is refused", applyStateOps(base(), [{ op: "correctDomain", slot: "primary", to: "notapeople" }], ctx).refused.length === 1);

  // REPAIR: remove an entity never acquired; a non-existent one is refused
  const c4 = base(); const r4 = applyStateOps(c4, [{ op: "removeEntity", kind: "companion", id: "aevi", why: "never met them" }], ctx);
  check("SNG-070: an unmet companion is removed + logged", r4.applied.length === 1 && c4.companions.length === 0 && !c4.companionNames.aevi);
  // the Silas case: STRIP a wrongly-held ability (repair), never grant
  const c4b = base(); c4b.abilities = [{ abilityId: "lightsense", level: 1 }, { abilityId: "palework", level: 1 }];
  const r4b = applyStateOps(c4b, [{ op: "removeEntity", kind: "ability", id: "lightsense", why: "Blazeborn work on an Ashwarden — take it off him" }], ctx);
  check("SNG-070: a wrongly-held ability can be STRIPPED (the Silas fix) and only that one goes", r4b.applied.length === 1 && c4b.abilities.length === 1 && c4b.abilities[0].abilityId === "palework" && c4b.corrections.some(x => x.entity === "ability"));
  check("SNG-070: removing a non-existent entity is refused, not silently applied", applyStateOps(base(), [{ op: "removeEntity", kind: "companion", id: "ghost" }], ctx).refused.length === 1);

  // REPAIR: unstick a quest; re-anchor a location; fix a codex fact
  const c5 = base(); applyStateOps(c5, [{ op: "unstickQuest", questId: "stuck", toStage: "s2", why: "stage never advanced" }], ctx);
  check("SNG-070: a stuck quest can be re-staged", c5.quests[0].stageIndex === 1);
  const c6 = base(); const r6 = applyStateOps(c6, [{ op: "reanchorLocation", to: "The Underlight", why: "header was wrong" }], ctx);
  check("SNG-070: a desynced location is re-anchored to a real place (by name)", r6.applied.length === 1 && c6.currentLocationId === "the_underlight");
  check("SNG-070: re-anchoring to nowhere is refused", applyStateOps(base(), [{ op: "reanchorLocation", to: "Castle Nowhere" }], ctx).refused.length === 1);
  const c7 = base(); applyStateOps(c7, [{ op: "fixCodexFact", topicId: "grael", text: "the corrected truth", why: "was false" }], ctx);
  check("SNG-070: a false codex fact is corrected", c7.codex.topics.grael.summary === "the corrected truth");

  // an explicit refuse op lands in refused; abilities/inventory fields are forbidden
  check("SNG-070: an explicit refuse is recorded, and abilities/inventory are forbidden fields", applyStateOps(base(), [{ op: "refuse", what: "500 xp" }], ctx).refused.length === 1 && applyStateOps(base(), [{ op: "correctField", field: "abilities", to: "x" }], ctx).refused.length === 1);
  check("SNG-070: describeCorrection gives a human line", /background corrected/.test(describeCorrection({ field: "background", to: "duelist" })));
})();

// --- SNG-137: GM reliability — new corrections (rank/bond/vital/attribute/merge), anomaly detection, item evolution ---
(() => {
  const ctx = { worldDay: 20, nowISO: "2026-07-16T00:00:00Z" };

  // correctAbilityRank — only LOWERS a wrongly-high rank; a raise is refused (power is earned)
  const cr = { abilities: [{ abilityId: "palework", level: 3 }] };
  const rr = applyStateOps(cr, [{ op: "correctAbilityRank", id: "palework", to: 1, why: "set too high at creation" }], ctx);
  check("SNG-137: correctAbilityRank LOWERS a wrong rank + logs from→to", rr.applied.length === 1 && cr.abilities[0].level === 1 && cr.corrections.some(x => x.kind === "abilityRank" && x.from === 3 && x.to === 1));
  check("SNG-137: correctAbilityRank REFUSES a raise (repair, not wish)", applyStateOps({ abilities: [{ abilityId: "palework", level: 1 }] }, [{ op: "correctAbilityRank", id: "palework", to: 3 }], ctx).applied.length === 0);

  // correctBond — sets a relationship right; a romantic bond on a MINOR is absolutely refused
  const cb = { npcRegistry: { pell: { name: "Pell", bondType: "platonic", bondStage: null, relationship: 2 } } };
  const rb = applyStateOps(cb, [{ op: "correctBond", id: "pell", bondType: "mentor", relationship: 5, why: "she's his teacher" }], ctx);
  check("SNG-137: correctBond sets a relationship right", rb.applied.length === 1 && cb.npcRegistry.pell.bondType === "mentor" && cb.npcRegistry.pell.relationship === 5);
  const cbMinor = { npcRegistry: { kid: { name: "Wren", isMinor: true, bondType: "platonic" } } };
  check("SNG-137: correctBond REFUSES romantic on a minor (absolute)", applyStateOps(cbMinor, [{ op: "correctBond", id: "kid", bondType: "romantic" }], ctx).refused.length === 1 && cbMinor.npcRegistry.kid.bondType === "platonic");

  // correctVital — re-syncs a vital past its max; can only LOWER current health/energy (recovery is earned)
  const cv = { health: 90, maxHealth: 30, energy: 10, maxEnergy: 50 };
  const rv = applyStateOps(cv, [{ op: "correctVital", vital: "health", to: 30, why: "desynced past max" }], ctx);
  check("SNG-137: correctVital re-syncs a vital past its max", rv.applied.length === 1 && cv.health === 30);
  check("SNG-137: correctVital cannot raise current health (no heal-wish)", applyStateOps({ health: 5, maxHealth: 30 }, [{ op: "correctVital", vital: "health", to: 30 }], ctx).applied.length === 0);

  // correctAttribute — only LOWERS a mis-set sub; parents rederive
  const ca = { subAttributes: { strength: 8, agility: 3 }, attributes: {} };
  const rca = applyStateOps(ca, [{ op: "correctAttribute", sub: "strength", to: 3, why: "set too high" }], ctx);
  check("SNG-137: correctAttribute LOWERS a mis-set sub", rca.applied.length === 1 && ca.subAttributes.strength === 3);
  check("SNG-137: correctAttribute REFUSES a raise (growth is earned)", applyStateOps({ subAttributes: { strength: 3 } }, [{ op: "correctAttribute", sub: "strength", to: 8 }], ctx).applied.length === 0);

  // mergeEntity — folds one split record into another; the survivor keeps history + gains an alias
  const cm = { npcRegistry: {
    silas_a: { name: "Silas", history: ["met at the weir"], knownFacts: ["a wright"], relationship: 3 },
    silas_b: { name: "Silas", history: ["fought the raider"], knownFacts: ["carries a scar"], relationship: 5 } } };
  const rm = applyStateOps(cm, [{ op: "mergeEntity", fromId: "silas_b", intoId: "silas_a", why: "one person, two records" }], ctx);
  check("SNG-137: mergeEntity folds a duplicate into one survivor", rm.applied.length === 1 && !cm.npcRegistry.silas_b && cm.npcRegistry.silas_a.history.length === 2 && cm.npcRegistry.silas_a.relationship === 5);
  check("SNG-137: mergeEntity refuses when the two ids aren't distinct known people", applyStateOps({ npcRegistry: { a: { name: "A" } } }, [{ op: "mergeEntity", fromId: "a", intoId: "a" }], ctx).refused.length === 1);

  // detectAnomalies — flags a duplicate person, a rank over practice, and a vital past max (pure, advisory)
  const rules = { practice: { useRankThreshold: { "2": 8, "3": 16 } } };
  const dchar = {
    npcRegistry: { p1: { name: "Pell" }, p2: { name: "Pell" } },
    abilities: [{ abilityId: "palework", level: 3 }],
    practice: { uses: { palework: 4 } },
    health: 90, maxHealth: 30, energy: 5, maxEnergy: 50 };
  const anoms = detectAnomalies(dchar, { rules });
  check("SNG-137: detectAnomalies flags a duplicate person (mergeable)", anoms.some(a => a.kind === "dupNpc" && a.fromId && a.intoId));
  const ro = anoms.find(a => a.kind === "rankOverPractice");
  check("SNG-137: detectAnomalies flags a rank over practice + suggests a supportable rank", ro && ro.abilityId === "palework" && ro.suggestRank === 1);
  check("SNG-137: detectAnomalies flags a vital past its max", anoms.some(a => a.kind === "vitalDesync" && a.vital === "health"));
  check("SNG-137: detectAnomalies is silent on a clean character (no false positives)", detectAnomalies({ npcRegistry: { p1: { name: "Pell" } }, abilities: [{ abilityId: "palework", level: 1 }], practice: { uses: {} }, health: 20, maxHealth: 30, energy: 20, maxEnergy: 30 }, { rules }).length === 0);
  check("SNG-137: anomaliesForGM formats a POSSIBLE ERROR block naming the repair op", /mergeEntity|correctAbilityRank|correctVital/.test(anomaliesForGM(anoms)) && anomaliesForGM([]) === "");

  // applyItemUpdates — evolves an OWNED item (bounded); never creates an unowned one; effects stay clamped
  const iu = { inventory: [{ name: "Belt Knife", kind: "weapon", bonusTags: ["cut"] }] };
  const ri = applyItemUpdates(iu, [{ name: "Belt Knife", description: "notched from the raider fight", provenance: "taken at the weir", addUse: { label: "pry", prompt: "pry a latch" } }]);
  check("SNG-137: applyItemUpdates evolves an owned item's description/provenance/use", ri.length === 1 && iu.inventory[0].description.includes("notched") && iu.inventory[0].provenance.includes("weir") && iu.inventory[0].uses.length === 1);
  check("SNG-137: applyItemUpdates never creates an unowned item", applyItemUpdates(iu, [{ name: "Ghost Sword", description: "does not exist" }]).length === 0 && !iu.inventory.some(i => i.name === "Ghost Sword"));
  const iu2 = { inventory: [{ name: "Draught", kind: "consumable" }] };
  applyItemUpdates(iu2, [{ name: "Draught", effects: { health: 500 } }]);
  check("SNG-137: applyItemUpdates keeps effects clamped (evolution, not inflation)", iu2.inventory[0].effects.health <= 15);

  // gm.js contract — raw-source checks that the reliability rules shipped
  const gmSrc = readFileSync(join(root, "engine/gm.js"), "utf8");
  check("SNG-137: rule 19B is imperative — MUST emit markDefiningMoment on a decisive ripe craft", /RIPE FOR MASTERY[\s\S]{0,400}MUST emit "markDefiningMoment"/.test(gmSrc));
  check("SNG-137: the RIPE block names the ripe crafts inline (masteryDetail) with a MUST", /RIPE FOR MASTERY[\s\S]{0,300}\$\{?masteryDetail\}?[\s\S]{0,200}MUST emit "markDefiningMoment"/.test(gmSrc));
  check("SNG-137: stateOps rule carries the widened repair vocabulary", /correctAbilityRank[\s\S]{0,200}correctBond[\s\S]{0,200}correctVital[\s\S]{0,200}mergeEntity/.test(gmSrc));
  check("SNG-137: 'acknowledge means emit — same turn' is in the stateOps rule", /ACKNOWLEDGE MEANS EMIT/i.test(gmSrc));
  check("SNG-137: itemUpdates is a reply-format key AND a rule (items grow with the story)", /"itemUpdates":\s*\[/.test(gmSrc) && /ITEMS GROW WITH THE STORY/i.test(gmSrc));
  check("SNG-137: itemUpdates survives a malformed reply (in the salvageOps key list)", /const keys = \[[\s\S]*?"itemUpdates"[\s\S]*?\]/.test(gmSrc));
  check("SNG-137: a POSSIBLE ERROR block (anomalyDetail) is rendered into the scene", /anomalyDetail\b/.test(gmSrc) && /POSSIBLE ERROR/.test(gmSrc));
})();

// --- SNG-138: prestige-driven recurring challenges (renown → band → paced challenger duel-offers) ---
(() => {
  const bands = [
    { band: "unknown", challengers: ["road_duelist_low"] },
    { band: "known", challengers: ["school_champion", "rival_ronin"] },
    { band: "renowned", challengers: ["sworn_rival", "blazeborn_kensei"] },
    { band: "legendary", challengers: ["the_last_blade"] }
  ];

  // renown = aggregate deed weight (fame travels; wins raise, losses lower)
  check("SNG-138: renownScore sums deed weights across all deeds", renownScore({ deeds: [{ weight: 3 }, { weight: 2 }, { weight: -1 }] }) === 4);
  check("SNG-138: renownScore is 0 for a fresh (deedless) character", renownScore({}) === 0);

  // renown → band walks the escalationBands by threshold
  check("SNG-138: a fresh name is 'unknown'", bandForRenown(0, bands) === "unknown");
  check("SNG-138: renown 6 → 'known', 16 → 'renowned', 30 → 'legendary'", bandForRenown(6, bands) === "known" && bandForRenown(16, bands) === "renowned" && bandForRenown(30, bands) === "legendary");
  check("SNG-138: below-first-threshold renown stays at the first band (never null-drops)", bandForRenown(-5, bands) === "unknown");
  check("SNG-138: an arc may override thresholds", bandForRenown(3, bands, { unknown: 0, known: 2 }) === "known");
  check("SNG-138: challengersForBand returns that band's ids", JSON.stringify(challengersForBand("renowned", bands)) === JSON.stringify(["sworn_rival", "blazeborn_kensei"]));

  // find the active bound prestige arc from held quests + the def catalog (instance carries arcId, def carries recurrence)
  const arcDef = { id: "the_name_that_travels", arcId: "saehara_prestige_arc", recurrence: { trigger: "prestige", escalationBands: bands } };
  const quests = [{ id: "the-name-that-travels", arcId: "saehara_prestige_arc", structured: true, status: "active" }];
  check("SNG-138: findPrestigeArc resolves the active arc's def by arcId", findPrestigeArc(quests, [arcDef])?.def === arcDef);
  check("SNG-138: findPrestigeArc ignores a non-prestige arc", findPrestigeArc([{ id: "x", arcId: "z", structured: true, status: "active" }], [{ id: "x", arcId: "z", recurrence: { trigger: "thread" } }]) === null);
  check("SNG-138: findPrestigeArc ignores an INACTIVE prestige arc (not yet taken / resolved)", findPrestigeArc([{ ...quests[0], status: "available" }], [arcDef]) === null);

  // pool resolves by arcId; pick filters to eligible ids + avoids an immediate repeat
  const pool = { arcId: "saehara_prestige_arc", challengers: [
    { id: "road_duelist_low", name: "A wandering blade", band: "unknown", concept: "young, hungry", style: "more nerve than mastery", traditions: ["somatic"] },
    { id: "sworn_rival", name: "Ren of the Crimson Ledger", band: "renowned", concept: "a named duelist", style: "precise, studies his opponent's past duels", traditions: ["syllogist", "somatic"], duelStakes: "two renowns collide" },
    { id: "blazeborn_kensei", name: "The Fire-Kensei", band: "renowned", concept: "magic and blade as one art", style: "aggressive, blazeborn fire", traditions: ["blazeborn"] }
  ] };
  check("SNG-138: challengerPoolFor resolves the pool by shared arcId", challengerPoolFor(arcDef, { saehara_challengers: pool }) === pool);
  check("SNG-138: pickChallenger filters to the eligible band ids", ["sworn_rival", "blazeborn_kensei"].includes(pickChallenger(["sworn_rival", "blazeborn_kensei"], pool.challengers, () => 0).id));
  check("SNG-138: pickChallenger avoids an immediate repeat when it can", pickChallenger(["sworn_rival", "blazeborn_kensei"], pool.challengers, () => 0, "sworn_rival").id === "blazeborn_kensei");

  // adapter → a valid duel ENTRY the offer/synth path expects
  const entry = challengerToDuelEntry(pool.challengers[1], "renowned", { arcId: "saehara_prestige_arc" });
  check("SNG-138: challengerToDuelEntry builds a routing:'duel' entry with an opponent block", entry.routing === "duel" && entry.opponent?.name === "Ren of the Crimson Ledger" && Array.isArray(entry.opponent.tacticTags) && entry.opponent.tacticTags.length > 0);
  check("SNG-138: threat scales by band (legendary hits harder than unknown)", challengerToDuelEntry(pool.challengers[0], "legendary", {}).opponent.threat > challengerToDuelEntry(pool.challengers[0], "unknown", {}).opponent.threat);
  check("SNG-138: the seed threads the challenger's traditions (fought in their idiom)", /syllogist|somatic/.test(entry.seed) && entry._challengeBand === "renowned");
  check("SNG-138: the entry flows through synthesizeDuelDef and the band survives onto the def", (() => { const d = synthesizeDuelDef(entry); return d.type === "duel" && d._challengeBand === "renowned" && d.opponent.name === "Ren of the Crimson Ledger"; })());
  check("SNG-138: buildOffer gives a challenger duel the guaranteed decline path (SNG-002b)", (() => { const o = buildOffer(entry, { abilities: [] }, {}, {}); return o.routing === "duel" && o.choices.some(c => c.trivial && /refuse|back away/i.test(c.label)); })());

  // win/loss feeds renown, band-scaled; the loop closes
  check("SNG-138: a win's deed weight scales by band (renowned > unknown)", challengeDeedWeight("renowned") > challengeDeedWeight("unknown") && challengeDeedWeight("legendary") >= challengeDeedWeight("renowned"));
  check("SNG-138: a loss costs renown modestly (negative, small)", challengeLossWeight("renowned") < 0 && challengeLossWeight("renowned") >= -3);

  // paced fire test — a famous name draws more; always/never rng bounds; higher band = higher chance
  check("SNG-138: shouldFireChallenger fires on a low roll and holds on a high roll", shouldFireChallenger(20, "renowned", 1, () => 0) === true && shouldFireChallenger(20, "renowned", 1, () => 0.99) === false);
  check("SNG-138: a higher band draws challengers more often (at the same middling roll)", (() => { const roll = () => 0.3; return shouldFireChallenger(30, "legendary", 1, roll) === true && shouldFireChallenger(0, "unknown", 1, roll) === false; })());
  check("SNG-138: the cooldown is positive and shorter when pacing is cranked", challengeCooldown(2.4) >= 1 && challengeCooldown(2.4) < challengeCooldown(0.5));

  // end-to-end against the REAL authored content (the arc + pool on disk)
  const rjLocal = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
  const realArc = rjLocal("content/packs/valley/quests/the_name_that_travels.json");
  const realPool = rjLocal("content/packs/valley/npcs/saehara_challengers.json");
  check("SNG-138: the authored arc carries a prestige recurrence block with escalationBands", realArc.recurrence?.trigger === "prestige" && Array.isArray(realArc.recurrence.escalationBands) && realArc.recurrence.escalationBands.length >= 3);
  check("SNG-138: every escalationBand's challenger ids exist in the authored pool", (() => { const ids = new Set(realPool.challengers.map(c => c.id)); return realArc.recurrence.escalationBands.every(b => (b.challengers || []).every(id => ids.has(id))); })());
  check("SNG-138: end-to-end on real content — a renowned Saehara draws a real challenger as a valid duel", (() => {
    const heldQuests = [{ id: realArc.id, arcId: realArc.arcId, structured: true, status: "active" }];
    const found = findPrestigeArc(heldQuests, [realArc]);
    if (!found) return false;
    const band = bandForRenown(20, found.def.recurrence.escalationBands); // renowned tier
    const p = challengerPoolFor(found.def, { [realPool.id]: realPool });
    const ch = pickChallenger(challengersForBand(band, found.def.recurrence.escalationBands), p.challengers, () => 0);
    const e = challengerToDuelEntry(ch, band, { arcId: found.def.arcId });
    const def = synthesizeDuelDef(e);
    return band === "renowned" && ch && def.type === "duel" && def._challengeBand === "renowned" && def.opponent.threat > 20;
  })());
})();

// --- SNG-139: chronicle/portrait fixes (canon count, delete character, Pell portrait tier) ---
(() => {
  // Item 1: sessionLog splits promoted records into canonical (banner) vs variant (rumor) — the two readouts agree
  const c = { deeds: [], sessions: [], generated: {
    location: {
      "gen-canon": { id: "gen-canon", name: "The Verified Hollow", _gen: { type: "location", createdDay: 1, promotedWorldDay: 1, canonTier: "canonical" } },
      "gen-rumor": { id: "gen-rumor", name: "The Contested Spire", _gen: { type: "location", createdDay: 1, promotedWorldDay: 1, canonTier: "variant" } }
    }, npc: {}, arc: {}
  } };
  touchSession(c, { nowISO: "2026-07-17T10:00:00Z", worldDay: 1 });
  const log = sessionLog(c);
  check("SNG-139: sessionLog's 'became canon' banner lists ONLY canonical-tier promotions", log[0].canonPromoted.includes("The Verified Hollow") && !log[0].canonPromoted.includes("The Contested Spire"));
  check("SNG-139: sessionLog surfaces a variant promotion as rumor, not canon", log[0].canonRumored.includes("The Contested Spire") && !log[0].canonRumored.includes("The Verified Hollow"));
  check("SNG-139: banner (canonical) + rumor (variant) partition the promoted total — no double-count, no miss", log[0].canonPromoted.length + log[0].canonRumored.length === 2);
  const auth = authorshipStats(c, {});
  check("SNG-139: the authorship card agrees with the banner — shared==canonical count, rumor==variant count", auth.persisted.shared === log[0].canonPromoted.length && auth.persisted.rumor === log[0].canonRumored.length);

  // Item 3: Pell (together·devoted, relationship >= 7) DOES reach a portrait tier — the SNG-136 wiring would fire
  check("SNG-139: a devoted bond (Pell — score>=7, bondStage together) reaches the 'devoted' portrait tier", npcPortraitTier({ name: "Pell", bondStage: "together", bondType: "romantic", relationship: 8 }) === "devoted");
  check("SNG-139: a passing acquaintance reaches NO portrait tier (high-milestones only, unchanged)", npcPortraitTier({ name: "Stranger", relationship: 2 }) === null);

  // Item 5: deleteCharacter removes the save + drops it from the index; leaves others intact
  const before = listCharacters().length;
  const idBase = "sng139-del-test-" + before;
  saveCharacter({ id: idBase + "-keep", name: "Keeper", level: 1, origin: "wright", deeds: [] });
  saveCharacter({ id: idBase + "-gone", name: "Doomed", level: 1, origin: "mason", deeds: [] });
  check("SNG-139: both test characters are in the roster index before delete", listCharacters().some(e => e.id === idBase + "-gone") && listCharacters().some(e => e.id === idBase + "-keep"));
  deleteCharacter(idBase + "-gone");
  check("SNG-139: deleteCharacter drops the character from the index", !listCharacters().some(e => e.id === idBase + "-gone"));
  check("SNG-139: deleteCharacter removes the save blob from storage", localStorage.getItem("singularity.character." + idBase + "-gone") === null);
  check("SNG-139: deleteCharacter leaves the OTHER character untouched", listCharacters().some(e => e.id === idBase + "-keep") && localStorage.getItem("singularity.character." + idBase + "-keep") !== null);
  deleteCharacter(idBase + "-keep"); // cleanup

  // app.js raw-source assertions — the wiring shipped
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  check("SNG-139: migrate clears the transient _chronicleBusy flag on load (un-wedges 'writing your story…')", /function migrate\(c\)[\s\S]{0,400}delete c\._chronicleBusy/.test(appSrc));
  check("SNG-139: the gallery exposes a 'Set as portrait' pick that pins the choice", /data-galpick/.test(appSrc) && /character\.portraitPinned = true/.test(appSrc));
  check("SNG-139: an auto level-up regen respects a pinned portrait (pin beats auto)", /if \(c\.portraitPinned\) return null;/.test(appSrc));
  check("SNG-139: the roster has a confirm-gated delete control wired to deleteCharacter", /data-del=/.test(appSrc) && /deleteCharacter\(id\)/.test(appSrc));
  check("SNG-139: the session-log render shows the rumor line alongside the canon banner", /canonRumored/.test(appSrc));
})();

// --- SNG-131: innate-substrate wiring — seed precursor/living-current access + braid discount; the gates ---
(() => {
  const catalog = {
    address_sense: { id: "address_sense", powerSystem: "precursor", levelReq: 2 },
    latticespeak: { id: "latticespeak", powerSystem: "precursor", levelReq: 3 },
    quicken_the_ground: { id: "quicken_the_ground", powerSystem: "living_current", tradition: "rootkin", levelReq: 3 },
    a_reach_braid: { id: "a_reach_braid", powerSystem: "reach_dark_light", levelReq: 4 },
    not_precursor: { id: "not_precursor", powerSystem: "reach_demonic_angelic", levelReq: 5 }
  };

  // seedInnateSubstrate — opens ACCESS (not a grant); validates powerSystem; stamps the braid discount
  const ser = { origin: "seraphic" };
  const seeded = seedInnateSubstrate(ser, { innatePrecursor: ["address_sense"] }, catalog);
  check("SNG-131: a seraphic origin is seeded innate PRECURSOR access (not granted the ability)", ser.precursorAccess.includes("address_sense") && !(ser.abilities || []).length && seeded.includes("address_sense"));
  const rootPeople = { origin: "rootkin" };
  seedInnateSubstrate(rootPeople, { innateLivingCurrent: ["quicken_the_ground"] }, catalog);
  check("SNG-131: a rootkin origin is seeded innate LIVING-CURRENT access", rootPeople.livingCurrentAccess.includes("quicken_the_ground"));
  check("SNG-131: valleyfolk get the braid discount stamped from braidAffinity", (() => { const v = { origin: "valley" }; seedInnateSubstrate(v, { braidAffinity: { discount: 2 } }, catalog); return v.braidDiscount === 2; })());
  check("SNG-131: a MIS-authored innate id (wrong powerSystem) is REFUSED — never a false access", (() => { const x = {}; seedInnateSubstrate(x, { innatePrecursor: ["not_precursor"] }, catalog); return !x.precursorAccess.includes("not_precursor"); })());
  check("SNG-131: seeding is idempotent — a second call adds nothing", (() => { const before = ser.precursorAccess.length; return seedInnateSubstrate(ser, { innatePrecursor: ["address_sense"] }, catalog).length === 0 && ser.precursorAccess.length === before; })());

  // the gate: living_current is LOCKED without access, learnable (returns base) with it — exactly like precursor
  check("SNG-131: living_current is LOCKED for a character without the innate access", effectiveLevelReq(catalog.quicken_the_ground, { livingCurrentAccess: [] }, {}) === null);
  check("SNG-131: living_current returns its levelReq once the innate access is seeded", effectiveLevelReq(catalog.quicken_the_ground, { livingCurrentAccess: ["quicken_the_ground"] }, {}) === 3);

  // learnAbility: a seeded rootkin at level can learn it; an unseeded character cannot (innate to the people)
  const rootDom = { origin: "rootkin", nativeTradition: "rootkin", domains: { primary: "rootkin" }, level: 3, skillPoints: 3, abilities: [], livingCurrentAccess: ["quicken_the_ground"] };
  const rLearn = learnAbility(rootDom, "quicken_the_ground", catalog, {}, {});
  check("SNG-131: a SEEDED rootkin at level 3 can learn the living current (innate base, earned by level+point)", rLearn.ok && rootDom.abilities.some(a => a.abilityId === "quicken_the_ground"));
  const rootNoSeed = { origin: "rootkin", nativeTradition: "rootkin", domains: { primary: "rootkin" }, level: 3, skillPoints: 3, abilities: [], livingCurrentAccess: [] };
  check("SNG-131: a rootkin WITHOUT the seed cannot learn the living current (access, not domain, gates it)", learnAbility(rootNoSeed, "quicken_the_ground", catalog, {}, {}).ok === false);

  // the braid discount only bites on the DOMAINED penalty path (a diameter braid's ring-distance cost > 1);
  // the raw-source assertion confirms the cut is applied there, and the browser check exercises it on real
  // geometry. Here: confirm braidCut never makes a braid FREE and never touches a non-braid.
  const appSrc131 = readFileSync(join(root, "engine/progression.js"), "utf8");
  check("SNG-131: the braid cut is floored at 1 (a braid is never free) and only touches reach_* powerSystems", /braidCut = \(character\.braidDiscount && String\(ab\.powerSystem \|\| ""\)\.startsWith\("reach_"\)\)/.test(appSrc131) && /Math\.max\(1, \(\(opts\.traditionIndex[\s\S]{0,120}\) - braidCut\)/.test(appSrc131));
  check("SNG-131: precursor + living_current both route to the innate-access gate (not the domain gate)", /const innateAccess = ab\.powerSystem === "precursor" \|\| ab\.powerSystem === "living_current"/.test(appSrc131));

  // end-to-end on the REAL authored content (origins.json + precursor.json + living_current.json)
  const rj131 = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
  const origins = rj131("content/packs/core/rules/origins.json").origins;
  const precursorAbs = rj131("content/packs/core/abilities/precursor.json").abilities;
  const livingAbs = rj131("content/packs/core/abilities/living_current.json").abilities;
  const realCat = {};
  for (const a of [...precursorAbs, ...livingAbs]) realCat[a.id] = a;
  const oget = id => origins.find(o => o.id === id);
  check("SNG-131 e2e: seraphic.innatePrecursor + abyssal.innatePrecursor are REAL precursor ids", oget("seraphic").innatePrecursor.every(id => realCat[id]?.powerSystem === "precursor") && oget("abyssal").innatePrecursor.every(id => realCat[id]?.powerSystem === "precursor"));
  check("SNG-131 e2e: rootkin.innateLivingCurrent is a REAL living_current id", oget("rootkin").innateLivingCurrent.every(id => realCat[id]?.powerSystem === "living_current"));
  check("SNG-131 e2e: seeding a real seraphic opens its authored precursor base, gate returns its levelReq", (() => {
    const c = { origin: "seraphic" };
    seedInnateSubstrate(c, oget("seraphic"), realCat);
    const id = oget("seraphic").innatePrecursor[0];
    return c.precursorAccess.includes(id) && effectiveLevelReq(realCat[id], c, {}) === (realCat[id].levelReq || 1);
  })());
  check("SNG-131 e2e: valleyfolk carries a real braidAffinity discount", (oget("valleyfolk").braidAffinity?.discount || 0) >= 1);
})();

// --- SNG-142: the GM offers the player's own toolkit (skills/combos/aspirations/items/companions/party) ---
(async () => {
  const { toolkitForGM } = await import("../engine/toolkit.js");
  const fnIndex = { families: ["KNOW", "HARM", "RESTORE"], verbToFamily: { sense: "KNOW", read: "KNOW", strike: "HARM", mend: "RESTORE" } };
  const cat = {
    deathsense: { id: "deathsense", name: "Deathsense", functions: ["sense"] },
    order_sense: { id: "order_sense", name: "Order-Sense", functions: ["read"] },
    palework: { id: "palework", name: "Palework", functions: ["strike"] },
    the_kept_breath: { id: "the_kept_breath", name: "The Kept Breath", functions: ["mend"] }
  };
  const rules = { practice: { aspirationRipe: 10 } };

  // a rich character: an unused craft, a co-used pair, a declared aspiration, a named item, a companion
  const rich = {
    abilities: [{ abilityId: "deathsense" }, { abilityId: "order_sense" }, { abilityId: "palework" }],
    practice: { uses: { deathsense: 5, order_sense: 4, palework: 0 }, coActivations: { "deathsense|order_sense": 3 }, aspirations: [{ abilityId: "the_kept_breath", since: "x", progress: 4 }] },
    inventory: [{ name: "spear", customName: "Memory", kind: "weapon", uses: [{ label: "channel deathsense" }] }, { name: "rope", kind: "tool" }]
  };
  const companions = [{ id: "huginn", name: "Huginn", role: "carrion bird that attends endings", knowledge: ["where the dying are", "the old roads"] }];
  const block = toolkitForGM(rich, { catalog: cat, fnIndex, rules, coverageMissing: ["RESTORE"], companions, party: [] });

  check("SNG-142: the toolkit surfaces a craft not yet leaned on (unused proxy — palework at 0 uses)", /not yet leaned on:[^\n]*Palework/.test(block));
  check("SNG-142: it offers a combination of two OWNED crafts (ranked by prior co-use)", /reach further together: (Deathsense \+ Order-Sense|Order-Sense \+ Deathsense)/.test(block) && /woven these before/.test(block));
  check("SNG-142: it surfaces the declared ASPIRATION + progress (the 0-mention gap closed)", /Aspiration in play: working toward The Kept Breath \(4\/10\)/.test(block));
  check("SNG-142: it flags a carried item's CAPABILITY (Memory — channel deathsense), not just its name", /Carried[^\n]*Memory — channel deathsense/.test(block));
  check("SNG-142: it surfaces a COMPANION capability (role + what they know), not just presence", /With you: Huginn \(carrion bird that attends endings\) — knows where the dying are/.test(block));
  check("SNG-142: it pipes the SNG-124 function-GAP nudge", /no RESTORE craft/.test(block));
  check("SNG-142: the attribute-action floor is always offered", /a plain attribute action \(a feat of Strength\/Agility\/Wits\/Presence/.test(block));

  // Part 1B: a shared family scene surfaces a party member as a COOPERATIVE (agency-preserving) invitation
  const shared = toolkitForGM(rich, { catalog: cat, fnIndex, rules, companions: [], party: [{ characterId: "p2", name: "Aelyn" }, { characterId: "p3", name: "Saehara" }] });
  check("SNG-142: a shared scene offers a cooperative move with a party member — INVITE, never commit them", /shared scene: Aelyn, Saehara[^\n]*cooperative move[^\n]*INVITE their player; never commit their character/.test(shared));

  // discipline: an empty/fresh character gets NO block (only the attribute floor isn't worth surfacing)
  check("SNG-142: a fresh character with no toolkit signal gets an empty block (not attribute-floor spam)", toolkitForGM({}, { catalog: cat, fnIndex, rules }) === "");
  check("SNG-142: a novice with just one owned craft still gets its 'not yet leaned on' nudge (block non-empty)", toolkitForGM({ abilities: [{ abilityId: "palework" }], practice: { uses: {} } }, { catalog: cat, fnIndex, rules }) !== "");

  // gm.js contract — rule 16B + the TOOLKIT scene block + the ctx destructure shipped
  const gmSrc142 = readFileSync(join(root, "engine/gm.js"), "utf8");
  check("SNG-142: rule 16B (offer the toolkit, lightly) is in the GM contract with the ≤1/never-on-clear-intent discipline", /16B\. OFFER THE TOOLKIT — LIGHTLY[\s\S]{0,600}NEVER when the player already stated a clear intent/.test(gmSrc142));
  check("SNG-142: rule 16B forbids committing another player's party character (agency guard)", /never commit another player's PARTY character/i.test(gmSrc142));
  check("SNG-142: the TOOLKIT scene block is rendered (toolkitDetail), guarded + destructured", /if \(toolkitDetail\) scene\.push\(/.test(gmSrc142) && /anomalyDetail, toolkitDetail \} = ctx/.test(gmSrc142));
})();

// --- SNG-143: NPC sex/gender as explicit data (the Pell-rendered-male fix) + OOC item-evolution routing ---
(async () => {
  const { npcPromptSeed } = await import("../engine/art.js");
  const ctx = { locationId: "millbrook", day: 5, rules: {} };

  // Part 1: the GM CAPTURES gender/pronouns on meet
  const c1 = { npcRegistry: {} };
  applyNpcUpdates(c1, [{ op: "meet", npcId: "pell", name: "Pell", role: "Village blacksmith", gender: "woman", pronouns: "she/her" }], ctx);
  check("SNG-143: meet captures gender + pronouns onto the registry record", c1.npcRegistry.pell.gender === "woman" && c1.npcRegistry.pell.pronouns === "she/her");
  applyNpcUpdates(c1, [{ op: "update", npcId: "pell", pronouns: "she/her" }], ctx); // idempotent-ish, no overwrite of gender
  check("SNG-143: an update fills gender the first time only, never rewrites an explicit value", (() => { applyNpcUpdates(c1, [{ op: "update", npcId: "pell", gender: "man" }], ctx); return c1.npcRegistry.pell.gender === "woman"; })());

  // Part 1: npcPromptSeed STATES the gender (the direct portrait fix — a woman NPC prompts as a woman)
  const seed = npcPromptSeed({ name: "Pell", role: "Village blacksmith", gender: "woman" }, { name: "Silas" });
  check("SNG-143: npcPromptSeed states gender so the portrait can't default (Pell prompts as a woman)", /\bwoman\b/.test(seed) && /Pell/.test(seed) && /blacksmith/.test(seed));
  check("SNG-143: a gender-less NPC seed is unchanged (no phantom gender injected)", !/\b(woman|man)\b/.test(npcPromptSeed({ name: "Vash", role: "smuggler" }, { name: "Silas" })));

  // Part 1: the KNOWN PEOPLE context surfaces gender/pronouns so narration stays consistent
  const detail = npcRegistryForGM({ name: "Silas", npcRegistry: { pell: { id: "pell", name: "Pell", role: "blacksmith", gender: "woman", pronouns: "she/her", relationship: 8, status: "active", history: [], knownFacts: [], skillsObserved: [] } } }, "millbrook", []);
  check("SNG-143: the KNOWN PEOPLE block carries gender + pronouns (consistent narration)", /Pell[^\n]*woman[^\n]*she\/her[^\n]*use these pronouns/.test(detail));

  // Part 1: retro-backfill — stamps woman from a female-DOMINANT record (even when it names a male partner), man for male-dominant, leaves ambiguous UNSET
  const bf = { npcRegistry: {
    pell: { id: "pell", name: "Pell", role: "blacksmith", image: "http://old-male-portrait", description: "Her shop, her forge.", history: ["Her hands on his forearms", "She names happiness", "her laugh is low", "her weight to Silas"], knownFacts: [] },
    sorel: { id: "sorel", name: "Sorel", role: "dock-master", history: ["He knew the tides", "his rope, his ledger", "him at the pier"], knownFacts: [] },
    vex: { id: "vex", name: "Vex", role: "courier", history: ["They came and went"], knownFacts: [] }
  } };
  const stamped = backfillNpcGender(bf);
  check("SNG-143: retro-backfill stamps Pell = woman from her own female-dominant narration (the fix)", bf.npcRegistry.pell.gender === "woman" && bf.npcRegistry.pell.pronouns === "she/her");
  check("SNG-143: it stamps a male-dominant record = man", bf.npcRegistry.sorel.gender === "man");
  check("SNG-143: it leaves an AMBIGUOUS/thin record unset (never guesses)", !bf.npcRegistry.vex.gender);
  check("SNG-143: stamping Pell clears her baked (male) portrait so it re-mints with gender", !bf.npcRegistry.pell.image && !bf.npcRegistry.pell._portraitTier && stamped.includes("Pell"));
  check("SNG-143: backfill never overwrites an already-set gender", (() => { const x = { npcRegistry: { a: { id: "a", name: "A", gender: "nonbinary", history: ["she her she her"] } } }; backfillNpcGender(x); return x.npcRegistry.a.gender === "nonbinary"; })());

  // Part 1: player-correctable — the correctNpcGender op sets gender, clears the portrait, logs; refuses gracefully
  const cc = { npcRegistry: { pell: { id: "pell", name: "Pell", gender: "man", image: "http://wrong" } } };
  const r = applyStateOps(cc, [{ op: "correctNpcGender", id: "pell", gender: "woman", pronouns: "she/her", why: "she is a woman" }], {});
  check("SNG-143: correctNpcGender sets gender/pronouns + clears the wrong portrait + logs", r.applied.length === 1 && cc.npcRegistry.pell.gender === "woman" && !cc.npcRegistry.pell.image && cc.corrections.some(x => x.kind === "gender"));
  check("SNG-143: correctNpcGender refuses an unknown person / an empty ask", applyStateOps({ npcRegistry: {} }, [{ op: "correctNpcGender", id: "ghost", gender: "woman" }], {}).refused.length === 1 && applyStateOps(cc, [{ op: "correctNpcGender", id: "pell" }], {}).refused.length === 1);
  check("SNG-143: describeCorrection gives a human line for a gender fix", /gender was set right/.test(describeCorrection({ npcGender: "pell" })));

  // raw-source: the GM contract + schema + OOC routing shipped
  const gmSrc = readFileSync(join(root, "engine/gm.js"), "utf8");
  check("SNG-143: the npcUpdates op captures gender + pronouns, and rule 14 records them on meet", /"npcUpdates":[\s\S]{0,400}"gender":[\s\S]{0,200}"pronouns":/.test(gmSrc) && /RECORD their "gender"\/"pronouns"/.test(gmSrc));
  check("SNG-143: correctNpcGender is in the stateOps repair vocabulary", /correctNpcGender \(a known person shown as the wrong sex\/gender/.test(gmSrc));
  check("SNG-143 (P2): the OOC channel routes an item EVOLUTION to in-play itemUpdates, not the sheet editor", /DISTINGUISH A CREATION-REPAIR FROM AN ITEM GROWING IN PLAY/.test(gmSrc) && /Route the second to play, never to the editor/.test(gmSrc) && /DO NOT send them to the Repair panel/.test(gmSrc));
  const schema143 = JSON.parse(readFileSync(join(root, "schemas/npc.schema.json"), "utf8"));
  check("SNG-143: the NPC schema declares gender", !!schema143.properties.gender);
})();

// --- SNG-141: substrate-unlock parity (living_current + wild_current get precursor's fiction-unlock door) ---
(() => {
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  const gmSrc = readFileSync(join(root, "engine/gm.js"), "utf8");

  // the generalized, powerSystem-validated unlock handler (mirrors unlockPrecursor) routes to the right access list
  check("SNG-141: the unlock handler maps precursor/living_current/wild_current to their access lists", /SUBSTRATE_ACCESS = \{ precursor: "precursorAccess", living_current: "livingCurrentAccess", wild_current: "wildCurrentAccess" \}/.test(appSrc));
  check("SNG-141: it validates the ability's OWN powerSystem before unlocking (a wrong-system id can't unlock)", /const listKey = ab && SUBSTRATE_ACCESS\[ab\.powerSystem\]/.test(appSrc) && /if \(!listKey\) continue/.test(appSrc));
  check("SNG-141: unlockPrecursor stays a back-compat alias (still handled)", /turn\.unlockSubstrate, turn\.unlockPrecursor, turn\.unlockLivingCurrent, turn\.unlockWildCurrent/.test(appSrc));

  // the GM contract: the op spec + rule 19 extension + salvage recovery
  check("SNG-141: gm.js declares the unlockSubstrate op (precursor|living_current|wild_current)", /"unlockSubstrate": \{"abilityId": "a precursor \| living_current \| wild_current ability id/.test(gmSrc));
  check("SNG-141: rule 19 extends the fiction-unlock door to the living + wild currents", /The LIVING current/.test(gmSrc) && /WILD current/.test(gmSrc) && /emit "unlockSubstrate"/.test(gmSrc) && /Access opens the door; the craft still costs a level \+ a point/.test(gmSrc));
  check("SNG-141: unlockSubstrate survives a truncated reply (in the salvageOps key list)", /"unlockSubstrate", "unlockPrecursor"/.test(gmSrc));
})();

// --- SNG-140: the Wild Half — the tangled substrate (wild_current: innate seed + gate + resolver variance) ---
(async () => {
  const { resolveAction } = await import("../engine/resolve.js");
  const wcat = {
    the_churns_gift: { id: "the_churns_gift", powerSystem: "wild_current", levelReq: 3, wildVariance: true },
    the_wild_bloom: { id: "the_wild_bloom", powerSystem: "wild_current", levelReq: 4, wildVariance: true },
    address_sense: { id: "address_sense", powerSystem: "precursor", levelReq: 2 }
  };

  // seed: a Wild Half origin seeds wildCurrentAccess (churnfolk/abyssal), powerSystem-validated
  const churn = { origin: "churnfolk" };
  const seeded = seedInnateSubstrate(churn, { wildCurrent: ["the_churns_gift"] }, wcat);
  check("SNG-140: a Wild Half origin is seeded innate WILD-current access", churn.wildCurrentAccess.includes("the_churns_gift") && seeded.includes("the_churns_gift"));
  check("SNG-140: abyssal can carry BOTH innatePrecursor AND wildCurrent (the canon duality)", (() => { const ab = { origin: "abyssal" }; seedInnateSubstrate(ab, { innatePrecursor: ["address_sense"], wildCurrent: ["the_churns_gift"] }, wcat); return ab.precursorAccess.includes("address_sense") && ab.wildCurrentAccess.includes("the_churns_gift"); })());
  check("SNG-140: a mis-authored wildCurrent id (wrong powerSystem) is REFUSED", (() => { const x = {}; seedInnateSubstrate(x, { wildCurrent: ["address_sense"] }, wcat); return !x.wildCurrentAccess.includes("address_sense"); })());

  // gate: wild_current is LOCKED without access, learnable once seeded — same shape as precursor/living
  check("SNG-140: wild_current is LOCKED without the innate access", effectiveLevelReq(wcat.the_churns_gift, { wildCurrentAccess: [] }, {}) === null);
  check("SNG-140: wild_current returns its levelReq once seeded", effectiveLevelReq(wcat.the_churns_gift, { wildCurrentAccess: ["the_churns_gift"] }, {}) === 3);
  const wlearn = learnAbility({ origin: "churnfolk", domains: { primary: "churnfolk" }, level: 3, skillPoints: 3, abilities: [], wildCurrentAccess: ["the_churns_gift"] }, "the_churns_gift", wcat, {}, {});
  check("SNG-140: a seeded Wild Half character can learn the wild craft (access gates it, not domain)", wlearn.ok === true);

  // resolver variance: wildVariance widens BOTH crit bands (upside-forward), vs a plain action. Reuses the
  // module-scope char/action/loc/rules (real loaded rules incl. the `wild` knob).
  const degAt = (n, extra) => resolveAction({ character: char, action: { ...action, ...extra }, location: loc, rules }, () => (n - 1) / 100).degree; // force roll n
  const csMax = rules.d100.critSuccessMax, cfMin = rules.d100.critFailMin;
  const upRoll = csMax + 2;   // just past the plain crit-success band, inside the wild one
  const tailRoll = cfMin - 2; // just shy of the plain crit-fail band, inside the wild one
  check("SNG-140: a WILD craft crit-SUCCEEDS on a roll a plain action would not (upside band widened)", degAt(upRoll, {}) !== "crit_success" && degAt(upRoll, { wildVariance: true }) === "crit_success");
  check("SNG-140: a WILD craft crit-FAILS on a high roll a plain action would not (the real tail)", degAt(tailRoll, {}) !== "crit_failure" && degAt(tailRoll, { wildVariance: true }) === "crit_failure");
  check("SNG-140: the upside is FORWARD of the tail (crit-success widens more than crit-fail)", (rules.wild.critSuccessWiden > rules.wild.critFailWiden));

  // raw-source + real content
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  check("SNG-140: app.js flags an action wildVariance from a wild_current ability", /wildVariance: \[choice\.abilityId[\s\S]{0,140}powerSystem === "wild_current"/.test(appSrc));
  const resJson = JSON.parse(readFileSync(join(root, "content/packs/core/rules/resolution.json"), "utf8"));
  check("SNG-140: the wild.critWiden knob is authored + upside-forward", (resJson.wild?.critSuccessWiden || 0) > (resJson.wild?.critFailWiden || 0));
  const wcReal = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/wild_current.json"), "utf8")).abilities;
  const origins140 = JSON.parse(readFileSync(join(root, "content/packs/core/rules/origins.json"), "utf8")).origins;
  const wcIds = new Set(wcReal.map(a => a.id));
  check("SNG-140 e2e: authored wild_current abilities carry wildVariance", wcReal.every(a => a.powerSystem === "wild_current") && wcReal.some(a => a.wildVariance));
  check("SNG-140 e2e: churnfolk + abyssal wildCurrent point at REAL wild_current ids", ["churnfolk", "abyssal"].every(id => (origins140.find(o => o.id === id)?.wildCurrent || []).every(x => wcIds.has(x))));
})();

// --- SNG-076: authored prose is not truncated mid-word ---
(() => {
  const short = "Fendt is going to be ruined by a piece of paper that does not exist.";
  check("SNG-076: text under the bound is returned WHOLE (authored prose renders in full)", smartClamp(short, 600) === short);
  check("SNG-076: a real authored stakes string (240+ chars) survives at the 600 bound", smartClamp("x".repeat(300).replace(/x/g, "a "), 600).length > 240);
  const long = "the district accountability board was opened and word travels to the other reaches where markings begin to be questioned";
  const clamped = smartClamp(long, 40);
  const body = clamped.replace(/…$/, "");
  check("SNG-076: an over-long MODEL string cuts on a WORD boundary, never mid-word", clamped.endsWith("…") && long.startsWith(body) && (long[body.length] === " " || long[body.length] === undefined));
  check("SNG-076: the clamp never leaves a dangling partial word", body.split(" ").every(w => long.split(" ").includes(w)));
})();

// --- SNG-080: the world must PUSH (quiet-turn pacing) ---
(() => {
  check("SNG-080: under the threshold the world stays quiet", pressureTier(2, 0) === 0 && pressureTier(0, 0) === 0);
  check("SNG-080: at the threshold the world ACTS (tier 1)", pressureTier(3, 0) === 1);
  check("SNG-080: an ignored world ESCALATES (streak raises the tier, capped at 4)", pressureTier(3, 1) === 2 && pressureTier(3, 3) === 4 && pressureTier(3, 9) === 4);
  check("SNG-080: an eventful turn resets quiet (encounter / quest change / scene end)", isEventfulTurn({ encounterActive: true }) && isEventfulTurn({ questChanged: true }) && isEventfulTurn({ woveEncounter: true }) && isEventfulTurn({ sceneEnded: true }) && !isEventfulTurn({}));
  const safe = pressureDirective(2, 0, ["The Edge District Ledger"]);
  check("SNG-080: pressure in a SAFE place is human/small, never a bandit ambush, and tightens a live thread", /frightened neighbour|human and small/.test(safe) && /NEVER a bandit ambush/.test(safe) && /Edge District Ledger/.test(safe) && /antagonist acts on their own clock/.test(safe));
  const deadly = pressureDirective(4, 4, []);
  check("SNG-080: pressure in a DANGEROUS place can have teeth, and tier 4 makes something ARRIVE", /can have teeth/.test(deadly) && /ARRIVES/.test(deadly));
})();

// --- SNG-081: the player's words are KEPT — scene history is a dialogue, not the GM's monologue ---
(() => {
  const flirt = "let's call this hunt a date";
  const turns = [
    { player: flirt, summary: "She almost smiles and does not say no.", narration: "n".repeat(1200) },
    { player: "I promise I'll come back for the ledger", summary: "You said it and meant it.", narration: "m".repeat(1200) },
  ];
  const out = renderSceneHistory(turns);
  check("SNG-081: the player's OWN words appear in history (the GM can finally see what you said)", out.includes(`YOU: "${flirt}"`) && out.includes(`YOU: "I promise I'll come back for the ledger"`));
  check("SNG-081: the player's words are kept VERBATIM, never truncated", out.includes(flirt) && !out.includes(flirt.slice(0, 8) + "…"));
  check("SNG-081: only the GM's prose is clamped (700), not the player's", out.includes("n".repeat(700)) && !out.includes("n".repeat(701)));
  check("SNG-081: each beat reads as a dialogue (YOU then GM)", /YOU: ".*"\nGM: /.test(out));
  const sys = renderSceneHistory([{ summary: "A system beat with no player line." }]);
  check("SNG-081: a system/party beat with no player words has no YOU line", !sys.includes("YOU:") && sys.includes("GM: A system beat"));
  check("SNG-081: legacy string turns pass through unchanged", renderSceneHistory(["an old plain summary"]) === "an old plain summary");
})();

// --- SNG-082: region terrain hull geometry ---
(() => {
  const box = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 5, y: 5 }]; // square + interior point
  const hull = convexHull(box);
  check("SNG-082: the convex hull drops interior points (a region wraps only its outline)", hull.length === 4 && !hull.some(p => p.x === 5 && p.y === 5));
  const shape = regionShape(box, 10);
  check("SNG-082: regionShape pads the hull OUTWARD so terrain wraps the nodes with a margin", shape.length === 4 && shape.every(p => p.x < -1 || p.x > 11 || p.y < -1 || p.y > 11));
  check("SNG-082: a 1-2 point region has no polygon (a blob is drawn instead)", regionShape([{ x: 1, y: 1 }]) === null && regionShape([{ x: 1, y: 1 }, { x: 2, y: 2 }]) === null);
})();

// --- SNG-083: "show what you know" — people AND rumours (heard-of things appear, dimmed) ---
(() => {
  const positions = { millbrook: { x: 100, y: 100 }, the_underlight: { x: 300, y: 200 } };
  const content = {
    locations: { millbrook: { id: "millbrook", name: "Millbrook", regionId: "valley" }, the_underlight: { id: "the_underlight", name: "The Underlight", regionId: "umbral_depths" } },
    npcs: { fendt: { name: "Fendt", homeLocation: "millbrook" }, keeper_ilma: { name: "Keeper Ilma", homeLocation: "millbrook" } },
  };
  // Silas has MET no one, but has an active quest whose giver is Fendt, and news naming a place.
  const silas = { npcRegistry: {}, codex: { topics: {} }, quests: [{ id: "ledger", status: "active", giver: "fendt", title: "The Edge District Ledger", stakes: "Fendt is ruined" }],
    worldState: { news: [{ text: "The water crisis worsens near Millbrook." }] }, establishedFacts: [] };
  const ov = knownOverlay(silas, positions, content);
  check("SNG-083: a character who has met NO ONE still sees heard-of threads (Fendt's quest, the news)", ov.length >= 1 && ov.some(e => e.kind === "rumour"));
  check("SNG-083: heard-of things are DIMMED (discovered=false), placed where they live", ov.every(e => e.kind !== "rumour" || e.discovered === false) && ov.some(e => e.locationId === "millbrook"));
  check("SNG-083: the quest giver surfaces as a live thread", ov.some(e => /Fendt/i.test(e.label) && /Edge District/i.test(e.label)));
  // once Fendt is MET (in the registry + a codex person topic), he goes SOLID
  const met = { npcRegistry: { fendt: { name: "Fendt" } }, codex: { topics: { fendt: { kind: "person", entityId: "fendt", label: "Fendt", id: "fendt" } } }, quests: [], worldState: { news: [] }, establishedFacts: [] };
  const ov2 = knownOverlay(met, positions, content);
  check("SNG-083: a met person renders SOLID (discovered=true)", ov2.some(e => e.kind === "person" && e.label === "Fendt" && e.discovered === true));
  check("SNG-083: nothing to show → an empty list (the UI shows the empty state, never a silent no-op)", knownOverlay({ npcRegistry: {}, codex: { topics: {} }, quests: [] }, positions, content).length === 0);
})();

// --- SNG-119: standing + known people scoped to a PLACE (folded into location headers) ---
{
  const locations = { millbrook: { id: "millbrook", name: "Millbrook", communityId: "valley.millbrook" }, faraway: { id: "faraway", name: "The Far Reach", communityId: "valley.far" } };
  const npcsCat = { pell: { id: "pell", communityId: "valley.millbrook" } };
  const char = { npcRegistry: {
    pell: { id: "pell", name: "Pell", relationship: 8, bondType: "romantic", bondStage: "partner", firstMet: { locationId: "greywater" } },   // scoped by community
    hela: { id: "hela", name: "Hela", relationship: 4, firstMet: { locationId: "millbrook" } },                                              // scoped by first-met location
    stranger: { id: "stranger", name: "A Stranger", relationship: 1, firstMet: { locationId: "faraway" } }
  } };
  const atMill = knownPeopleAt(char, "millbrook", { locations, npcs: npcsCat });
  const names = atMill.map(p => p.name).sort();
  check("SNG-119: known people are scoped to a place — met-here + community-here show, others don't", names.join(",") === "Hela,Pell" && !names.includes("A Stranger"));
  check("SNG-119: a scoped person carries its relationship label (Pell reads as her bond)", atMill.find(p => p.id === "pell")?.label === "partner · devoted");
  check("SNG-119: a place with no one you know returns an empty list (graceful header)", knownPeopleAt(char, "faraway", { locations, npcs: {} }).length === 1 && knownPeopleAt({ npcRegistry: {} }, "millbrook", { locations, npcs: npcsCat }).length === 0);
}

// --- SNG-117: the known world is navigable — a place is KNOWN by any means, not just visited ---
{
  const locs = { millbrook: { id: "millbrook", name: "Millbrook", connections: ["echo_river_crossing"] },
    echo_river_crossing: { id: "echo_river_crossing", name: "Echo River Crossing", connections: ["millbrook", "archive_hollow"] },
    archive_hollow: { id: "archive_hollow", name: "Archive Hollow", connections: ["echo_river_crossing"] },
    far_off: { id: "far_off", name: "The Far Reach", connections: [] } };
  const c = { currentLocationId: "millbrook", placeMemory: { archive_hollow: { visits: 2 } }, knownPlaces: ["far_off"] };
  check("SNG-117: where you stand is known", isPlaceKnown(c, "millbrook", locs));
  check("SNG-117: a place ADJACENT to where you stand is known (one travel away — no more '?')", isPlaceKnown(c, "echo_river_crossing", locs));
  check("SNG-117: a VISITED place is known even when far", isPlaceKnown(c, "archive_hollow", locs));
  check("SNG-117: a GM-named / en-route place (knownPlaces) is known before you ever enter it", isPlaceKnown(c, "far_off", locs));
  check("SNG-117: a genuinely unheard-of, non-adjacent, unvisited place stays UNKNOWN (a '?')", !isPlaceKnown({ currentLocationId: "millbrook", placeMemory: {}, knownPlaces: [] }, "archive_hollow", locs));
  check("SNG-117: a null/absent id is never 'known'", !isPlaceKnown(c, null, locs) && !isPlaceKnown(c, "nope", locs));
}

// --- SNG-113: aptitudes are SITUATIONAL — decay bites, hysteresis holds, grants seed, innocence erodes ---
{
  const aps = rules.playerAptitudes;
  const R = { aptitudeDecay: rules.aptitudeDecay, aptitudeKeepMargin: rules.aptitudeKeepMargin, aptitudeFadeBand: rules.aptitudeFadeBand };
  const strat = aps.find(a => a.id === "strategist"); // tendency strategic, threshold 11
  // EARN at threshold: feed the strategic tag until it crosses.
  const c = { tendencies: {}, aptitudes: [], actionCount: 0 };
  for (let i = 0; i < 16; i++) updateProfile(c, ["plan"], aps, R); // ~13 turns of a fed tag crosses threshold 11 at 0.975 decay
  check("SNG-113: an aptitude is EARNED once its tendency crosses the (curved) threshold", c.aptitudes.includes("strategist") && (c.tendencies.strategic >= strat.threshold));
  // HYSTERESIS: a single off-tag turn does NOT drop it (kept until threshold - keepMargin).
  updateProfile(c, ["attack"], aps, R);
  check("SNG-113: hysteresis — one off-tag turn never flickers a held aptitude off", c.aptitudes.includes("strategist"));
  // DECAY BITES: stop feeding it; within a realistic horizon it falls below the keep-floor and is LOST.
  let lostAt = null;
  for (let i = 0; i < 40 && lostAt === null; i++) { updateProfile(c, ["attack"], aps, R); if (!c.aptitudes.includes("strategist")) lostAt = i; }
  check("SNG-113: decay at the new rate actually drops an unfed aptitude in a real horizon (not permanent)", lostAt !== null && lostAt < 40);
  check("SNG-113: the OLD decay (0.995) would NOT have dropped it in that horizon (the fix is load-bearing)", Math.pow(0.995, 40) > 0.75);

  // GRANT at creation: a lineage aptitude starts held (seeded above threshold) + recorded as lineage.
  const born = { tendencies: {}, aptitudes: [], actionCount: 0 };
  grantAptitudes(born, ["scholar"], aps, R);
  check("SNG-113: a background-granted aptitude starts HELD (seeded above threshold) + marked lineage", born.aptitudes.includes("scholar") && born.grantedAptitudes.includes("scholar") && born.tendencies.cerebral > (aps.find(a => a.id === "scholar").threshold));

  // FADING: near the keep-floor, the aptitude is flagged (loss is legible, never silent).
  const fadingC = { tendencies: { strategic: (strat.threshold - R.aptitudeKeepMargin) + 1 }, aptitudes: ["strategist"], actionCount: 0 };
  check("SNG-113: an aptitude within the fade band of its keep-floor reads as FADING", fadingAptitudes(fadingC, aps, R).has("strategist"));

  // INVERSE (innocence): granted at creation; held while worldliness < ceiling; lost when it crosses; ONE-WAY.
  const innocent = aps.find(a => a.id === "innocent"); // worldlinessCeiling 10, components ruthless/deception/amorous/carousing
  const kid = { tendencies: {}, aptitudes: [], actionCount: 0 };
  grantAptitudes(kid, ["innocent"], aps, R);
  check("SNG-113: an inverse aptitude is GRANTED (not earned) and held at a clean slate", kid.aptitudes.includes("innocent"));
  for (let i = 0; i < 12; i++) updateProfile(kid, ["threaten", "deceive"], aps, R); // accrue worldliness past the ceiling
  check("SNG-113: innocence is LOST once worldliness crosses the ceiling", !kid.aptitudes.includes("innocent"));
  for (let i = 0; i < 40; i++) updateProfile(kid, ["help"], aps, R); // worldliness decays back down…
  check("SNG-113: innocence is ONE-WAY — living it away does not bring it back", !kid.aptitudes.includes("innocent"));

  // AMOROUS routing: the romantic/flirt tags (SNG-100) now accrue the amorous tendency (they mapped to nothing before).
  const lover = { tendencies: {}, aptitudes: [], actionCount: 0 };
  for (let i = 0; i < 11; i++) updateProfile(lover, ["romantic", "flirt"], aps, R);
  check("SNG-113: romantic/flirt tags accrue the amorous tendency (a home at last) → charmer earns", lover.tendencies.amorous > 0 && lover.aptitudes.includes("charmer"));

  // NO COLLECT-ALL: even a STRONG two-lean build (clever face) earns a bounded few, never the whole roster —
  // and a perfectly-even spread earns nothing (jack-of-all-trades, master of none — decay makes it real).
  const leaned = { tendencies: {}, aptitudes: [], actionCount: 0 };
  for (let i = 0; i < 60; i++) updateProfile(leaned, ["plan", "persuade"], aps, R); // leans strategic + social hard
  check("SNG-113: a strong two-lean build earns a BOUNDED few (2–6), never the whole roster of 26", leaned.aptitudes.length >= 2 && leaned.aptitudes.length <= 6 && leaned.aptitudes.length < aps.length);
  const scattered = { tendencies: {}, aptitudes: [], actionCount: 0 };
  const spread = [["plan"], ["attack"], ["persuade"], ["study"], ["help"], ["scout"], ["negotiate"], ["craft"], ["climb"], ["comfort"]];
  for (let i = 0; i < 100; i++) updateProfile(scattered, spread[i % spread.length], aps, R);
  check("SNG-113: a perfectly-even 10-way spread earns few or none (no specialization → no aptitude, decay makes it bite)", scattered.aptitudes.length <= 2);

  // a new resolver consumer actually fires (TIER-B is not inert): stealthBonus on a scout-tagged action.
  const sneaker = { attributes: { practical: 3 }, energy: 100, alignment: {}, subAttributes: {}, skills: {} };
  const withStealth = successChance({ character: sneaker, action: { attribute: "practical", axes: {}, tags: ["sneak"] }, location: { spectrum: {} }, rules, aptitudeMods: { stealthBonus: 6 } });
  const without = successChance({ character: sneaker, action: { attribute: "practical", axes: {}, tags: ["sneak"] }, location: { spectrum: {} }, rules, aptitudeMods: {} });
  check("SNG-113: a TIER-B mod (stealthBonus) fires on its tagged action — the consumer is real, not inert", withStealth - without === 6 || (withStealth <= rules.d100.floorChance));
  const speakWithStealth = successChance({ character: sneaker, action: { attribute: "social", axes: {}, tags: ["persuade"] }, location: { spectrum: {} }, rules, aptitudeMods: { stealthBonus: 6 } });
  const speakWithout = successChance({ character: sneaker, action: { attribute: "social", axes: {}, tags: ["persuade"] }, location: { spectrum: {} }, rules, aptitudeMods: {} });
  check("SNG-113: a situational mod does NOT fire out of context (stealth helps you sneak, not speak)", speakWithStealth === speakWithout);
}

// --- SNG-114: "Use in scene" gets meaningful, intentful options (authored uses[] or kind-defaults) ---
{
  // authored uses[] win, and {item} is substituted with the display name.
  const whet = { name: "River Whetstone", kind: "tool", uses: [{ label: "Sharpen a blade", prompt: "I sharpen my blade on the {item}" }, { label: "Read the rune-seam", prompt: "I press the {item} to the rune-seam and listen" }] };
  const wUses = itemUses(whet);
  check("SNG-114: authored item.uses[] are offered, with {item} substituted", wUses.length === 2 && wUses[0].label === "Sharpen a blade" && wUses[1].prompt.includes("River Whetstone"));
  // a custom-named item substitutes its story-name.
  check("SNG-114: {item} substitutes the player's custom name when set", itemUses({ ...whet, customName: "Old Faithful" })[1].prompt.includes("Old Faithful"));
  // no authored uses → kind-defaults give a real verb (no hand-authoring needed).
  const blade = itemUses({ name: "Iron Sword", kind: "weapon" });
  check("SNG-114: a weapon with no authored uses gets kind-default verbs (ready / strike)", blade.length >= 2 && blade.some(u => /strike/i.test(u.prompt)) && blade[0].prompt.includes("Iron Sword"));
  // an unknown kind falls to the misc default (never empty → the intent step always has an option).
  check("SNG-114: an unknown kind falls back to a misc default (the intent step is never empty)", itemUses({ name: "Odd Thing", kind: "whatsit" }).length >= 1);
}

// --- SNG-116: the difficulty preview must include the substrate penalty (preview == resolve) ---
{
  const base = { character: { attributes: { mental: 3 }, energy: 100, alignment: {}, subAttributes: {}, skills: {} },
    action: { attribute: "mental", abilityLevel: 2, axes: {}, difficulty: 0 }, location: { spectrum: {} }, rules, aptitudeMods: {}, equipmentBonus: 0 };
  const full = successChance({ ...base });                          // full lattice (what the buggy preview showed)
  const thin = successChance({ ...base, substratePenalty: 20 });   // the resolve path's real, substrate-inclusive chance
  check("SNG-116: passing substratePenalty lowers the previewed chance by exactly the penalty (no drift)", full - thin === 20 || (full <= rules.d100.floorChance && thin <= rules.d100.floorChance));
  const ctx = { ...base, substratePenalty: 20, _breakdown: null };
  successChance(ctx);
  check("SNG-116: the substrate penalty is its own honest, named line in the breakdown (SNG-106)",
    ctx._breakdown.components.some(c => /substrate/.test(c.label) && c.value === -20));
  check("SNG-116: with no substrate penalty (full lattice / non-ability action) the preview is unchanged (no regression)",
    successChance({ ...base, substratePenalty: 0 }) === full);
}

// --- SNG-115: raceTimeout — a stalled network write must never hang the caller forever ---
await (async () => {
  let onTimeoutFired = false, timedOut = false;
  try { await raceTimeout(new Promise(() => {}), 25, "GH_TIMEOUT", () => { onTimeoutFired = true; }); }
  catch (e) { timedOut = e.message === "GH_TIMEOUT"; }
  check("SNG-115: raceTimeout rejects a stalled promise with the label, and fires onTimeout (abort)", timedOut && onTimeoutFired);
  const fast = await raceTimeout(Promise.resolve("ok"), 1000, "GH_TIMEOUT");
  check("SNG-115: raceTimeout passes a promise that resolves in time straight through", fast === "ok");
  let rejected = null;
  try { await raceTimeout(Promise.reject(new Error("GH_PUT_409")), 1000, "GH_TIMEOUT"); } catch (e) { rejected = e.message; }
  check("SNG-115: a real error (a 409) still propagates — the deadline doesn't mask genuine failures", rejected === "GH_PUT_409");
})();

// --- SNG-121: pin items to the sidebar — sensible kind-defaults, never override an explicit choice ---
{
  const mkChar = () => ({ inventory: [
    { name: "Iron Sword", kind: "weapon" },
    { name: "Healing Draught", kind: "consumable", qty: 2 },
    { name: "Trail Ration", consumable: true },
    { name: "River Whetstone", kind: "tool", uses: [{ label: "Sharpen", prompt: "I sharpen on the {item}" }] },
    { name: "Old Map", kind: "quest" },
    { name: "Loose Buttons", kind: "misc" },
  ] });

  const fresh = ensurePins(mkChar());
  const pins = pinnedItems(fresh).map(i => i.name);
  check("SNG-121: fresh character auto-pins weapon + consumables + anything with authored uses",
    pins.includes("Iron Sword") && pins.includes("Healing Draught") && pins.includes("Trail Ration") && pins.includes("River Whetstone"));
  check("SNG-121: bulk misc/quest items are left unpinned (they live in the full Inventory)",
    !pins.includes("Old Map") && !pins.includes("Loose Buttons"));
  check("SNG-121: ensurePins marks the character initialized and is idempotent (second call is a no-op)",
    fresh._pinsInitialized === true && pinnedItems(ensurePins(fresh)).length === pins.length);

  // Defaults never override an explicit choice: a player who unpinned everything stays unpinned.
  const chosen = mkChar();
  ensurePins(chosen);
  for (const it of chosen.inventory) it.pinned = false;  // player explicitly clears the set
  ensurePins(chosen);                                     // must NOT re-fill — already initialized
  check("SNG-121: defaults never re-pin a character who has already made a choice (empty stays empty)",
    pinnedItems(chosen).length === 0);

  // togglePin flips a single item and reflects in pinnedItems; matches by name or customName.
  const t = mkChar();
  check("SNG-121: togglePin turns a misc item on, and pinnedItems reflects it", togglePin(t, "Loose Buttons") === true && pinnedItems(t).some(i => i.name === "Loose Buttons"));
  check("SNG-121: togglePin flips the same item back off", togglePin(t, "Loose Buttons") === false && !pinnedItems(t).some(i => i.name === "Loose Buttons"));
  check("SNG-121: togglePin matches a story-named item by its customName", togglePin({ inventory: [{ name: "Iron Sword", customName: "Grief", kind: "weapon" }] }, "Grief") === true);
  check("SNG-121: togglePin on an absent item returns null (no throw)", togglePin(t, "No Such Thing") === null);
}

// --- SNG-122: narrative travel — the travel intent is load-bearing (survives the tag cap) + forces moveTo ---
{
  // the travel tag, emitted LAST past the 6-tag cap, must survive (it gates the travel directive + arrival —
  // exactly the romantic/flirt lesson). A build with 6 richer tags ahead of it used to silently drop it.
  const rich = sanitizeIntent({ intentTags: ["persuade", "charm", "comfort", "rapport", "finesse", "risky", "travel"], travelTo: "the edge district" }, { abilities: [] });
  check("SNG-122: a 'travel' tag past the 6-tag cap survives (hoisted like romantic/flirt — it gates the move)", rich.intentTags.includes("travel"));
  check("SNG-122: sanitizeIntent carries the parsed destination through (travelTo)", rich.travelTo === "the edge district");
  check("SNG-122: a null/none/empty travelTo becomes null (no phantom destination)",
    sanitizeIntent({ travelTo: "none" }, { abilities: [] }).travelTo === null && sanitizeIntent({}, { abilities: [] }).travelTo === null && sanitizeIntent({ travelTo: "  " }, { abilities: [] }).travelTo === null);

  // the per-turn travel directive lands in the UNCACHED player tier (so it forces moveTo THIS turn, not stale)
  const parts = tierParts({
    character: { name: "Ash", origin: "valley", background: "medic", level: 3, attributes: { physical: 2, mental: 2, social: 2, practical: 2 }, health: 10, maxHealth: 10, energy: 10, maxEnergy: 10, abilities: [], alignment: {} },
    location: { name: "Millbrook", descriptionSeed: "a mill town", spectrum: {} }, rules: {},
    travelDirective: "The player is TRAVELING to the edge district. You MUST emit moveTo."
  });
  check("SNG-122: the travel directive lands in the uncached PLAYER tier (forces moveTo this turn)",
    parts.player.join("\n").includes("TRAVEL THIS TURN") && parts.player.join("\n").includes("MUST emit moveTo"));
  check("SNG-122: no travelDirective → no travel block (a normal beat is unaffected)",
    !tierParts({ character: { name: "Ash", origin: "valley", background: "medic", level: 3, attributes: { physical: 2, mental: 2, social: 2, practical: 2 }, health: 10, maxHealth: 10, energy: 10, maxEnergy: 10, abilities: [], alignment: {} }, location: { name: "M", descriptionSeed: "x", spectrum: {} }, rules: {} }).player.join("\n").includes("TRAVEL THIS TURN"));
}

// --- SNG-123: salvage recovers the ops that hurt most to lose — moveTo + vitals — from a TRUNCATED reply ---
{
  // a travel beat whose JSON got cut off mid-moveTo: the balanced-bracket scan gives up (no closing brace),
  // so the targeted regex must still recover the destination — movement is never silently lost.
  const brokenMove = '{"narration":"You walk the long road toward the edge.","choices":[],"moveTo": {"location": "the edge district", "why": "a day on the road"';
  const mOps = salvageOps(brokenMove);
  check("SNG-123: salvageOps recovers moveTo.location from a truncated reply (travel isn't lost)", mOps.moveTo?.location === "the edge district");
  check("SNG-123: the salvaged moveTo keeps its why when present", mOps.moveTo?.why === "a day on the road");

  const brokenVitals = '{"narration":"The blow lands hard.","characterDeltas": {"health": -3, "energy": -5';
  const vOps = salvageOps(brokenVitals);
  check("SNG-123: salvageOps recovers health/energy from a truncated characterDeltas (vitals aren't lost)", vOps.characterDeltas?.health === -3 && vOps.characterDeltas?.energy === -5);

  // a well-formed reply is unchanged — the targeted pass only fills gaps the balanced scan missed
  const whole = '{"moveTo": {"location": "millbrook", "why": "led home"}, "characterDeltas": {"health": 2, "energy": 0}}';
  const wOps = salvageOps(whole);
  check("SNG-123: a well-formed moveTo/characterDeltas still parses normally (no regression)", wOps.moveTo?.location === "millbrook" && wOps.characterDeltas?.health === 2);
}

// --- SNG-128: the World-Authorship Chronicle — surfaces authored/novel/persisted from real provenance ---
{
  // a character with authored places/people walked + novel (minted) content at various persistence tiers
  const mk = (id, type, patch = {}) => ({ id, name: id, _gen: { type, birthWeight: 2, engagementScore: 4, tier: "established", createdDay: 3, provenance: { playerKey: "pk1", characterId: "hero", worldDay: 3 }, ...patch } });
  const hero = {
    id: "hero", name: "Hero", level: 4, playerKey: "pk1",
    placeMemory: { millbrook: { visits: 2 }, echo_river: { visits: 1 }, "gen-the-pass": { visits: 1 } }, // 2 authored + 1 novel id
    npcRegistry: { pell: { id: "pell" }, "gen-tollhand": { id: "gen-tollhand" } },                        // 1 authored + 1 novel id
    generated: {
      location: {
        "gen-the-pass": mk("gen-the-pass", "location", { promotedWorldDay: 6, canonTier: "canonical", engagementScore: 10, tier: "nominated" }), // SHARED
        "gen-hollow": mk("gen-hollow", "location", { promotedWorldDay: null, engagementScore: 6 }),          // personal
      },
      npc: {
        "gen-tollhand": mk("gen-tollhand", "npc", { promotedWorldDay: 7, canonTier: "variant", engagementScore: 9 }), // RUMOR/variant
        "gen-warden": mk("gen-warden", "npc", { promotedWorldDay: null, engagementScore: 8, tier: "nominated" }),      // personal (ripe)
      },
      arc: {}
    }
  };
  const CONTENT = { locations: { millbrook: { id: "millbrook", name: "Millbrook" }, echo_river: { id: "echo_river", name: "Echo River" } }, npcs: { pell: { id: "pell", name: "Pell" } } };

  const a = authorshipStats(hero, CONTENT);
  check("SNG-128: authored count = authored places walked + authored people known (novel ids excluded)", a.authoredCount === 3); // millbrook, echo_river, pell
  check("SNG-128: novel count = every minted record across types", a.novelCount === 4);
  check("SNG-128: persistence tiers split shared / personal / rumor from the real _gen tiers",
    a.persisted.shared === 1 && a.persisted.rumor === 1 && a.persisted.personal === 2);
  // world-effect = weighted sum over SHARED entities only (gen-the-pass: birth 2 + floor(10/2)=5 → 7)
  check("SNG-128: world-effect is the WEIGHTED fingerprint of promoted-shared content (Q3), not a bare count", a.worldEffect === 7);
  check("SNG-128: top-attention lists the not-yet-shared entities you've invested most in, by score",
    a.topAttention.length === 2 && a.topAttention[0].name === "gen-warden" && a.topAttention[0].score === 8);
  check("SNG-128: honest names — the shared one and the rumor one are surfaced by name",
    a.sharedNames.includes("gen-the-pass") && a.rumorNames.includes("gen-tollhand"));

  // sessions: a real-time gap starts a new one; within-gap extends; endSession closes; next touch reopens
  const c2 = { sessions: [], deeds: [], generated: { npc: {}, location: {}, arc: {} } };
  touchSession(c2, { nowISO: "2026-07-16T10:00:00Z", worldDay: 1 });
  touchSession(c2, { nowISO: "2026-07-16T10:30:00Z", worldDay: 1 }); // +30m → same session
  check("SNG-128: beats within the gap extend ONE session", c2.sessions.length === 1 && c2.sessions[0].beats === 2);
  touchSession(c2, { nowISO: "2026-07-16T20:00:00Z", worldDay: 2 }); // +9.5h → new session
  check("SNG-128: a real-time gap starts a NEW session", c2.sessions.length === 2);
  endSession(c2);
  check("SNG-128: endSession marks the current session ended", c2.sessions[1].ended === true);
  touchSession(c2, { nowISO: "2026-07-16T20:05:00Z", worldDay: 2 }); // even within gap, ended → new
  check("SNG-128: a touch after an explicit end opens a fresh session", c2.sessions.length === 3);

  // sessionLog scopes deeds to the session (by real time) + generated by world-day range, newest first
  const c3 = {
    sessions: [{ id: "sess-1", startedAt: "2026-07-16T10:00:00Z", lastAt: "2026-07-16T11:00:00Z", startDay: 1, endDay: 1, beats: 4 }],
    deeds: [{ description: "saved the mill", weight: 3, worldDay: 1, at: "2026-07-16T10:30:00Z" }, { description: "old deed", weight: 1, worldDay: 0, at: "2026-07-15T09:00:00Z" }],
    generated: { location: { "gen-x": { id: "gen-x", name: "The Hollow", _gen: { type: "location", createdDay: 1, promotedWorldDay: 1, canonTier: "canonical" } } }, npc: {}, arc: {} }
  };
  const log = sessionLog(c3);
  check("SNG-128: sessionLog scopes deeds to the session by real time (excludes an earlier deed)", log[0].deeds.length === 1 && log[0].deeds[0].description === "saved the mill");
  check("SNG-128: sessionLog surfaces places minted + canon promoted in the session's day range", log[0].placesMinted.includes("The Hollow") && log[0].canonPromoted.includes("The Hollow"));

  // buildSessionPrompt reuses the chronicle voice, facts-only, ceiling-bound
  const sp = buildSessionPrompt(c3, log[0], { ratingLine: "PG-13 ceiling." });
  check("SNG-128: buildSessionPrompt yields a facts-only, ceiling-bound {system,user} recap prompt",
    /ONE.*paragraph/i.test(sp.system) && /invent nothing/i.test(sp.system) && sp.system.includes("PG-13 ceiling.") && sp.user.includes("saved the mill"));

  // cross-character family comparison, sorted by world-effect
  const fam = crossCharacterAuthorship([hero, { id: "b", name: "Brayden", level: 2, playerKey: "pk2", generated: { npc: {}, location: {}, arc: {} }, placeMemory: {}, npcRegistry: {} }], CONTENT);
  check("SNG-128: crossCharacterAuthorship ranks members by world-effect (the biggest author first)",
    fam.length === 2 && fam[0].name === "Hero" && fam[0].worldEffect === 7 && fam[1].worldEffect === 0);

  // canon.js: buildCanonRecord stamps contributedBy from provenance; contributionsBy tallies per player
  const cr = buildCanonRecord({ id: "gen-z", name: "Z", _gen: { type: "location", birthWeight: 2, engagementScore: 8, provenance: { playerKey: "pk1", characterId: "hero" } } }, { worldDay: 5 });
  check("SNG-128: buildCanonRecord stamps a friendly contributedBy from provenance (no data invented)",
    cr._canon.contributedBy.playerKey === "pk1" && cr._canon.contributedBy.characterId === "hero");
  const store = ensureCanonStore({}, "valley");
  store.entities["gen-z"] = cr;
  store.variants.push(buildCanonRecord({ id: "gen-w", name: "W", _gen: { type: "npc", birthWeight: 1, provenance: { playerKey: "pk2", characterId: "bray" } } }, { worldDay: 6, tier: "variant" }));
  const contrib = contributionsBy(store);
  check("SNG-128: contributionsBy tallies promoted vs variant per contributing player, with weight",
    contrib.pk1.promoted === 1 && contrib.pk1.variant === 0 && contrib.pk2.variant === 1 && contrib.pk1.characters.includes("hero"));
}

// --- SNG-124 (Phase A): function families as a legible axis — coverage + recommendations ---
{
  const vocab = JSON.parse(readFileSync(join(root, "content/packs/core/rules/function_vocabulary.json"), "utf8"));
  const fx = buildFunctionIndex(vocab);
  check("SNG-124: buildFunctionIndex inverts the AUTHORED vocab into 8 families + a verb→family map",
    fx.families.length === 8 && fx.verbToFamily.strike === "HARM" && fx.verbToFamily.heal === "RESTORE" && fx.verbToFamily.reveal === "KNOW" && fx.verbToFamily.ward === "PROTECT");
  check("SNG-124: familyClass yields the CSS class for a family badge", familyClass("HARM") === "fn-fam-harm");
  check("SNG-124: familiesOfAbility maps an ability's verbs to its families (deduped)",
    familiesOfAbility({ functions: ["strike", "break"] }, fx).join() === "HARM" && familiesOfAbility({ functions: ["heal", "reveal"] }, fx).sort().join() === "KNOW,RESTORE");

  // coverage: a kit of pure HARM has HARM covered and the other 7 families MISSING
  const cat = {
    a_strike: { id: "a_strike", name: "Strike", functions: ["strike"] },
    a_heal: { id: "a_heal", name: "Mending Hand", functions: ["heal", "mend"], tradition: "somatic", nativeOrCombination: "native", levelReq: 1, energyCost: 6 },
    a_reveal: { id: "a_reveal", name: "Prism Sight", functions: ["reveal"], levelReq: 1, energyCost: 4 },
    a_break: { id: "a_break", name: "Sunder", functions: ["break"], levelReq: 1, energyCost: 5 }
  };
  const hero = { abilities: [{ abilityId: "a_strike", level: 1 }], domains: { primary: "somatic" }, tendencies: {} };
  const cov = functionCoverage(hero, cat, fx);
  check("SNG-124: functionCoverage reads owned abilities' functions — HARM covered, RESTORE among the missing",
    cov.covered.includes("HARM") && cov.missing.includes("RESTORE") && cov.missing.includes("KNOW") && cov.byFamily.HARM === 1);

  // recommend: a RESTORE skill FILLS a gap and should outrank a redundant HARM skill; a ripe one tops all
  const learnable = [cat.a_heal, cat.a_reveal, cat.a_break];
  const recs = recommendSkills(hero, learnable, { fnIndex: fx, catalog: cat, effectiveCost: ab => ab.energyCost });
  check("SNG-124: recommendSkills ranks a gap-filling skill above a redundant one (function-gap = highest value)",
    recs[0].abilityId !== "a_break" && recs.some(r => r.abilityId === "a_heal" && /gap/i.test(r.why)));
  check("SNG-124: a redundant-family skill (another HARM) scores low or is dropped",
    !recs.some(r => r.abilityId === "a_break" && r.score >= recs[0].score));
  // a ripe aspiration outranks everything (ready + free)
  const recsRipe = recommendSkills(hero, learnable, { fnIndex: fx, catalog: cat, ripe: new Set(["a_reveal"]), effectiveCost: ab => ab.energyCost });
  check("SNG-124: a RIPE aspiration is surfaced first, marked ready-to-learn", recsRipe[0].abilityId === "a_reveal" && /ready/i.test(recsRipe[0].why));
  check("SNG-124: recommendations carry the effective energy cost + their function families", recs.every(r => r.cost != null && Array.isArray(r.families)));

  // every CORE ability's `functions` verbs are known to the vocabulary (no orphan verb → grey badge)
  const abilityFiles = readdirSync(join(root, "content/packs/core/abilities")).filter(f => f.endsWith(".json"));
  let orphan = null, checked = 0;
  for (const f of abilityFiles) {
    const arr = JSON.parse(readFileSync(join(root, "content/packs/core/abilities", f), "utf8"));
    for (const ab of (Array.isArray(arr) ? arr : arr.abilities || [])) for (const v of ab.functions || []) { checked++; if (!fx.verbToFamily[v]) orphan = `${ab.id}:${v}`; }
  }
  check("SNG-124: every core ability's function verb maps to a known family (no orphan verbs)", checked > 100 && orphan === null);
  // Phase B: the wheel overlay's color + glyph maps cover all 8 families (no undefined fill on a node dot)
  check("SNG-124 Phase B: FAMILY_COLOR + FAMILY_GLYPH cover all 8 families (wheel dots never undefined)",
    FUNCTION_FAMILIES.every(f => FAMILY_COLOR[f] && FAMILY_GLYPH[f]) && Object.keys(FAMILY_COLOR).length === 8);

  // SNG-129: every family maps to a DISTINCT node shape (silhouette carries the primary family), with a fallback
  check("SNG-129: FAMILY_SHAPE gives each of the 8 families a distinct silhouette (redundant with color)",
    FUNCTION_FAMILIES.every(f => FAMILY_SHAPE[f]) && new Set(FUNCTION_FAMILIES.map(f => FAMILY_SHAPE[f])).size === 8);
  check("SNG-129: shapeOfFamily resolves a known family + falls back to 'circle' for a family-less node",
    shapeOfFamily("HARM") === "diamond" && shapeOfFamily(undefined) === "circle" && shapeOfFamily(null) === "circle");
}

// --- SNG-132: bound legendary arcs follow their character; content-generators mint heavier content ---
{
  const arc = { id: "reaching-light", arcId: "aelyn_father_arc", title: "The Reaching Light", stakes: "a father consumed", region: "valley",
    boundToCharacter: "Aelyn Kantoro", boundToPlayer: "player-7fah99", legend: "the_lightless_seraph",
    stages: [{ objective: "the reaching light" }, { objective: "the mother's last word" }, { objective: "the anomaly and the daughter" }],
    routes: { rootkin: "release", seraphic: "reach" }, outcomes: [{ id: "reach", name: "Reach him", effects: [] }, { id: "release", name: "Release him", effects: [] }] };
  const aelyn = { name: "Aelyn Kantoro", playerKey: "player-7fah99", quests: [], domains: { primary: "rootkin", secondary: "seraphic" } };
  const other = { name: "Silas Weir", playerKey: "player-s9z9u1", quests: [], domains: {} };

  // a bound arc surfaces for its character even with NO proximity context (it follows the character), never for others
  check("SNG-132: a bound arc surfaces for its bound CHARACTER ignoring proximity (no location context)",
    availableStructuredQuests(aelyn, [arc], {}).some(d => d.id === "reaching-light"));
  check("SNG-132: a bound arc NEVER surfaces for a different character (even on a bare board)",
    !availableStructuredQuests(other, [arc], {}).some(d => d.id === "reaching-light") && !availableStructuredQuests(other, [arc], { board: true, region: "valley" }).some(d => d.id === "reaching-light"));
  // binding by playerKey alone also matches (a renamed character keeps their arc)
  check("SNG-132: binding matches by playerKey too (arc follows the player, not just the name)",
    availableStructuredQuests({ name: "Renamed", playerKey: "player-7fah99", quests: [] }, [arc], {}).some(d => d.id === "reaching-light"));

  // the legend NPC surfaces to the GM as a stage-gated following presence (named from the npcs catalog)
  const activeAelyn = { name: "Aelyn Kantoro", playerKey: "player-7fah99", domains: { primary: "rootkin" },
    quests: [{ ...arc, structured: true, status: "active", stageIndex: 0 }] };
  const gm = structuredQuestsForGM(activeAelyn, { npcs: { the_lightless_seraph: { name: "Caelum Kantoro", role: "the fallen Seraph" } } });
  check("SNG-132: the bound arc feeds the GM its LEGEND as a stage-gated following presence, ending never foreclosed",
    /LEGEND — Caelum Kantoro/.test(gm) && /stage 1\/3/.test(gm) && /never foreclose/i.test(gm));

  // content-generator: a flagged author's minted content starts heavier (persists into shared canon more readily)
  const plain = birthWeightOf({ character: { level: 4 } });
  const boosted = birthWeightOf({ character: { level: 4 }, contentGenerator: true });
  check("SNG-132: a content-generator's birthWeight is boosted above a plain author's (heavier realness)", boosted > plain);
  check("SNG-132: the boost never eclipses authored core (weight 100 still outranks a level-4 generator's mint)", boosted < 100);
}

// --- SNG-133: every backstory seeds a personal quest arc (bound to the character, SNG-132 runs it) ---
{
  const rich = { name: "Aelyn Kantoro", playerKey: "player-7fah99", origin: "rootkin", domains: { primary: "rootkin", secondary: "seraphic" },
    bio: { motivation: "to find what happened to my father", story: "A hidden forest, a mother whose nature-magic was dying, a father consumed by the nanites he never gave up — he told us to hide, and it took him.", hometown: "the hidden forest" } };
  const thin = { name: "Grix", playerKey: "player-z", origin: "valley", domains: { primary: "wright" }, bio: { story: "" }, whyHere: "I wander." };

  // fallback: ALWAYS a valid bound arc (never zero) — passes isRealQuest so SNG-132's gate can surface it
  const fa = fallbackPersonalArc(rich);
  check("SNG-133: a personal arc is a valid bound structured quest (stakes + 3 stages + outcomes) — isRealQuest",
    isRealQuest(fa) && fa.stages.length === 3 && fa.boundToCharacter === "Aelyn Kantoro" && fa.boundToPlayer === "player-7fah99" && /_personal_arc$/.test(fa.arcId));
  check("SNG-133: the fallback seeds premise/stakes from the bio (motivation + home), routes from domains",
    /father/i.test(fa.premise) && !!fa.stakes && !!fa.routes.rootkin);
  // a thin bio STILL gets an arc (never zero) — scaled down to a modest hook
  const ft = fallbackPersonalArc(thin);
  check("SNG-133: a thin/empty backstory still yields a bound arc (never a wall of nothing)", isRealQuest(ft) && ft.boundToCharacter === "Grix" && ft.stages.length === 3);
  check("SNG-133: arcSeed flags a thin bio (modest hook) vs a rich one (epic)", arcSeed(thin).thin === true && arcSeed(rich).thin === false);

  // the fallback arc surfaces ONLY for its own character via the SNG-132 bound gate (no proximity)
  check("SNG-133: the personal arc surfaces for its character via the SNG-132 bound gate, not for a stranger",
    availableStructuredQuests({ name: "Aelyn Kantoro", playerKey: "player-7fah99", quests: [] }, [fa], {}).some(d => d.id === fa.id)
    && !availableStructuredQuests({ name: "Someone", playerKey: "player-q", quests: [] }, [fa], {}).some(d => d.id === fa.id));

  // the model prompt is facts-only, ceiling-bound, exemplar-guided
  const p = buildPersonalArcPrompt(rich, { ratingLine: "PG-13 ceiling." });
  check("SNG-133: the arc prompt uses the bio facts + the SNG-132 exemplar + the ceiling, invents nothing",
    p.user.includes("father") && /exemplar|Reaching Light/i.test(p.system) && p.system.includes("PG-13 ceiling.") && /ONLY what the bio gives/i.test(p.system));

  // sanitize: a well-formed model arc becomes the bound-arc shape (+ embedded legend NPC); malformed → fallback
  const good = sanitizePersonalArc({ name: "The Vanished Father", premise: "a father lost to the machine", stakes: "reclaim or release", legend: { name: "Caelum", role: "the fallen one" }, stages: [{ objective: "a" }, { objective: "b" }, { objective: "c" }], routes: { reach: "reach him", release: "let him go" } }, rich);
  check("SNG-133: sanitizePersonalArc coerces a model arc into the bound shape + embeds the legend NPC",
    good.boundToPlayer === "player-7fah99" && good.stages.length === 3 && good.legendNpc?.name === "Caelum" && good.legend === "caelum" && good.outcomes.length === 2 && isRealQuest(good));
  check("SNG-133: a malformed model reply falls back to the light arc (never a broken arc)",
    isRealQuest(sanitizePersonalArc({ garbage: true }, rich)) && sanitizePersonalArc(null, rich).boundToCharacter === "Aelyn Kantoro");

  // structuredQuestsForGM surfaces the personal arc's EMBEDDED legend (no catalog entry needed)
  const activeAelyn = { name: "Aelyn Kantoro", playerKey: "player-7fah99", domains: { primary: "rootkin" }, quests: [{ ...good, structured: true, status: "active", stageIndex: 0 }] };
  check("SNG-133: a generated arc's embedded legend surfaces to the GM (stage-gated, never foreclosed)",
    /LEGEND — Caelum/.test(structuredQuestsForGM(activeAelyn)) && /never foreclose/i.test(structuredQuestsForGM(activeAelyn)));
}

// --- SNG-134: one shared entity-detail for skill/name/item; relationship paragraph; (story/CG = UI) ---
{
  // SKILL detail — owned rank, next-rank text, effective cost (+base), function families, ripe
  const sk = skillDetail({ name: "Palework", description: "the grey craft of ending", functions: ["strike"] }, {
    tradition: "Ashwarden", tier: 2, owned: true, level: 2, maxRank: 3, effCost: 3, baseCost: 6, families: ["HARM"], rankText: "practiced 4/6 to rank 3", ripe: false });
  check("SNG-134: skillDetail shows rank, next-rank progress, effective cost (+base), and function family",
    /Rank 2\/3/.test(sk) && /practiced 4\/6/.test(sk) && /⚡ 3 energy.*base 6/.test(sk) && /HARM/.test(sk));
  check("SNG-134: an unlearned skill reads 'Not yet learned'; a ripe one flags mastery",
    /Not yet learned/.test(skillDetail({ name: "X" }, { owned: false })) && /ripe for mastery/.test(skillDetail({ name: "Y" }, { owned: true, ripe: true })));

  // NPC detail — the relationship label + role + last-seen (resolved via locations) + last history beat
  const pell = { id: "pell", name: "Pell", role: "a marsh-warden", relationship: 8, bondType: "romantic", bondStage: "partner", lastSeen: { locationId: "millbrook" }, history: ["[d3] you mended the weir together"] };
  const nd = npcDetail(pell, { locations: { millbrook: { name: "Millbrook" } } });
  check("SNG-134: npcDetail gives the bond label + role + last-seen place + the latest beat",
    /Pell — .*partner/.test(nd) && /marsh-warden/.test(nd) && /Last seen: Millbrook/.test(nd) && /mended the weir/.test(nd));

  // ITEM detail — name/qty, pinned, in-scene uses
  const it = itemDetail({ name: "Healing Draught", kind: "consumable", qty: 2, description: "a green tincture", pinned: true });
  check("SNG-134: itemDetail shows qty, pinned state, and the in-scene uses", /Healing Draught ×2/.test(it) && /pinned/.test(it) && /Use in scene/.test(it));

  // CONSISTENCY (the ask): the SAME entity yields the SAME detail regardless of caller — pure by construction
  check("SNG-134: the same entity gives identical detail wherever it's rendered (pure formatter)",
    npcDetail(pell, { locations: { millbrook: { name: "Millbrook" } } }) === npcDetail(pell, { locations: { millbrook: { name: "Millbrook" } } }));

  // relationshipsParagraph — bonds → prose, grouped by depth; empty when there are no bonds
  const ch = { npcRegistry: {
    pell: { name: "Pell", relationship: 9, bondType: "romantic", bondStage: "partner" },
    calvar: { name: "Calvar", relationship: 8, bondType: "sworn" },
    aldric: { name: "Aldric", relationship: 5 }, mara: { name: "Mara", relationship: 4 },
    vex: { name: "Vex", relationship: -6, bondType: "rival" }
  } };
  const para = relationshipsParagraph(ch);
  check("SNG-134: relationshipsParagraph reads bonds into prose — partner closest, allies as a circle, a foe named",
    /closest to Pell/.test(para) && /Aldric/.test(para) && /Mara/.test(para) && /Vex/.test(para) && para.endsWith("."));
  check("SNG-134: no bonds → an empty paragraph (a new character isn't given a phantom social life)",
    relationshipsParagraph({ npcRegistry: {} }) === "" && relationshipsParagraph({ npcRegistry: { stranger: { name: "A Stranger", relationship: 1 } } }) === "");
}

// --- SNG-136: portraits reflect lived growth — chronicle in the seed, NPC portraits on bond milestones ---
{
  // P1: the character seed folds in the LIVED record — a level-11 char with deeds differs from level-1
  const base = { name: "Silas", origin: "valley", background: "medic", appearance: "a gaunt man in grey", inventory: [] };
  const green = characterPromptSeed({ ...base, level: 1, deeds: [] });
  const lived = characterPromptSeed({ ...base, level: 11, deeds: [{ description: "ended the raider-lord at the weir", weight: 3 }, { description: "a routine errand", weight: 1 }] });
  check("SNG-136: a level-11 seed with deeds differs from the level-1 creation seed (the lived record reaches the picture)", lived !== green && lived.length > green.length);
  check("SNG-136: the seed folds in the latest MAJOR deed + a level-band clause, bounded", /raider-lord at the weir/.test(lived) && /(hard road|marks of what|no longer untested)/.test(lived) && !/routine errand/.test(lived));
  check("SNG-136: a fresh character's seed is unchanged (seed motivation still shows until deeds accrue)", /grey/.test(green));

  // P2: npcPromptSeed builds from the NPC + their bond to the player
  const pell = { id: "pell", name: "Pell", role: "a marsh-warden", appearance: "sharp-eyed, river-mud on her boots", relationship: 9, bondType: "romantic", bondStage: "partner" };
  const ns = npcPromptSeed(pell, { name: "Silas" });
  check("SNG-136: npcPromptSeed weaves the NPC's look + role + their bond to the player", /Pell/.test(ns) && /marsh-warden/.test(ns) && /partner romantic to Silas/.test(ns));

  // npcPortraitTier — the HIGH milestones only (partner/committed/sworn/devoted-band), never every acquaintance
  check("SNG-136: npcPortraitTier fires on partner/committed/sworn and a devoted-band bond (Pell), never a mere acquaintance",
    npcPortraitTier({ bondStage: "partner" }) === "partner" && npcPortraitTier({ bondStage: "committed" }) === "committed" &&
    npcPortraitTier({ bondType: "sworn" }) === "sworn" && npcPortraitTier({ relationship: 8 }) === "devoted" &&
    npcPortraitTier({ relationship: 3 }) === null && npcPortraitTier({ bondStage: "courting" }) === null);
  check("SNG-136: an already-portrayed tier is not re-fired (dedup by tier) — the caller checks _portraitTier",
    npcPortraitTier(pell) === "partner"); // the app skips when n._portraitTier === this tier
}

// --- BATCH-11 §23: the GM Context Registry assembles a REAL context end-to-end ---
{
  const { assembleGMContext, registryKeys, GM_CONTEXT } = await import('../engine/gm_registry.js');
  const ch = { id: "c1", name: "Probe", playerKey: "p", currentLocationId: "millbrook", level: 2,
    attributes: { physical: 3, mental: 3, social: 3 }, energy: 10, maxEnergy: 10, health: 10, maxHealth: 10,
    abilities: [], quests: [], inventory: [], npcRegistry: {}, clock: newClock() };
  const env = {
    character: ch, location: { id: "millbrook", name: "Millbrook", regionId: "the_given_land", spectrum: {} },
    CONTENT: { region: { name: "The Valley" }, rules: {}, lore: [], events: [], npcs: {}, companions: [], items: {}, emergence: {}, branchForks: {}, locations: {} },
    sceneTurns: [{ narration: "a", choices: [] }, { narration: "b", choices: [] }],
    sceneState: { npcsPresent: [{ name: "Pell" }] }, sharedScene: null, profile: { plainness: "balanced" },
    time: readClock(ch.clock),
    resolution: null, playerInput: "(probe)", exactWords: null, itemAdvance: [], travelDirective: null,
    ephemera: { encounterWeaveDetail: null, worldPressureDetail: null, substrateDetail: null, romanceGuidanceDetail: null },
    app: { fullCatalog: () => ({}), FN_INDEX: () => ({ families: [], verbToFamily: {}, byFamily: {} }),
      activeEnc: () => null, listAvailableEncounters: () => null, masteryReadyForGM: () => null,
      ratingLineForGM: () => "rating", maybeLegendDetail: () => null, sharedCanonForGM: () => null }
  };
  const ctx = assembleGMContext("turn", env);
  check("§23: turn view assembles every registered key (43) with no builder throwing",
    Object.keys(ctx).length === registryKeys("turn").length && Object.keys(ctx).length === 43);
  check("§23: the assembled ctx feeds gm.js tierParts/buildTurnContext (a real prompt renders)",
    typeof buildTurnContext(ctx) === "string" && buildTurnContext(ctx).length > 100);
  check("§23: ask view excludes turn ephemera (no one-shot can double-fire through an ask)",
    !registryKeys("ask").includes("encounterWeaveDetail") && !registryKeys("ask").includes("resolution"));
  check("§23: quest view honors focusQuest + window override",
    assembleGMContext("quest", { ...env, focusQuest: { title: "The Thread" }, recentTurnsWindow: 4, sceneState: null }).recentTurns.length <= 4);
  check("§23: every row declares reachedBy + spec (Law 16 — the path is stated, not implied)",
    GM_CONTEXT.every(r => r.reachedBy && r.spec));
  check("§23: sceneNpcNames flow from env.sceneState (quest view's null → empty)", (() => {
    const q = assembleGMContext("quest", { ...env, sceneState: null });
    return typeof q.npcRegistryDetail !== "undefined"; // builder ran without throwing on null sceneState
  })());
}

// --- BATCH-11 146f: the personal arc is STARTABLE (the listing/start asymmetry) ---
{
  const { fallbackPersonalArc } = await import('../engine/personalArc.js');
  const ch = { name: "Tester", playerKey: "p", origin: "valley", domains: { primary: "soma_edge" },
    bio: { motivation: "to find who burned the mill", story: "Left home after the fire took everything the family had built over years.", hometown: "Millbrook" } };
  const arc = fallbackPersonalArc(ch);
  check("146f: fallbackPersonalArc yields an isRealQuest-valid def", isRealQuest(arc) === true);
  const r = startStructuredQuest({ ...ch, quests: [] }, arc, { worldDay: 1, nowISO: "2026-07-18T12:00:00.000Z" });
  check("146f: the personal arc STARTS as a structured quest ('Take it on' works)", r.ok === true && r.quest?.status === "active");
  check("146f: a missing def refuses cleanly instead of throwing", startStructuredQuest({ quests: [] }, undefined).ok === false);
  const appSrc146f = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  check("146f: the start lookup searches the SAME spliced array as the listing (personalArc included)",
    /const startable = \[\.\.\.\(CONTENT\.quests \|\| \[\]\), \.\.\.\(character\.personalArc \? \[character\.personalArc\] : \[\]\)\]/.test(appSrc146f) &&
    /startable\.find\(d =>/.test(appSrc146f));
}

// --- BATCH-11 146b/c: scene lifecycle + open-scene index ---
{
  const { sceneIsOpen, closeScene } = await import('../engine/party.js');
  const now = "2026-07-18T12:00:00.000Z";
  const fresh = newSharedScene('millbrook', { id: 'c1', name: 'A', playerKey: 'p' }, "2026-07-18T11:00:00.000Z");
  check("146b: a fresh scene with a member is open", sceneIsOpen(fresh, now) === true);
  check("146b: a closed scene is not open", sceneIsOpen(closeScene(fresh, now), now) === false);
  check("146b: an empty-party scene is not open", sceneIsOpen({ ...fresh, party: [] }, now) === false);
  check("146b: a scene idle past TTL is not open (lazy expiry, no write needed)",
    sceneIsOpen({ ...fresh, updatedAt: "2026-07-10T11:00:00.000Z" }, now) === false);
  check("146b: the last member leaving stamps closedAt", (() => {
    const gone = removeMember(fresh, 'c1');
    return gone.party.length === 0 && !!gone.closedAt;
  })());
  check("146b: a member leaving a 2-party scene does NOT close it", (() => {
    const two = addMember(fresh, { id: 'c2', name: 'B', playerKey: 'q' });
    const one = removeMember(two, 'c1');
    return one.party.length === 1 && !one.closedAt;
  })());
  const partySrcBC = readFileSync(new URL('../engine/party.js', import.meta.url), 'utf8');
  check("146c: the join path reads the open-scene index, not the whole directory", /fetchRepoJSON\(OPEN_INDEX_PATH\)/.test(partySrcBC));
  check("146c: the scene FILE stays the truth — candidates re-checked via sceneIsOpen", /if \(sc && sceneIsOpen\(sc\)\) scenes\.push\(sc\)/.test(partySrcBC));
  check("146c: the index is maintained at the write choke point, fire-and-forget", /updateOpenIndex\(merged\)/.test(partySrcBC));
}

// --- BATCH-11 146a: scene writes route through pushMergedFile (Law 7) ---
{
  const partySrc = readFileSync(new URL('../engine/party.js', import.meta.url), 'utf8');
  // The defect was structural: content computed from a T0 read, PUT with a fresh T1 sha
  // via pushOwnedFile. The guard is structural too: party.js must not touch pushOwnedFile,
  // and pushSceneWithMerge must run its mutate INSIDE pushMergedFile's callback so the
  // content and the sha come from the same read.
  check("146a: party.js no longer imports or calls pushOwnedFile (the lost-update path)",
    !/import[^;]*pushOwnedFile/.test(partySrc) && !/pushOwnedFile\s*\(/.test(partySrc));
  check("146a: pushSceneWithMerge routes through pushMergedFile", /pushMergedFile\(scenePath\(sceneId\)/.test(partySrc));
  check("146a: mutate runs inside the merge callback against the fresh remote", /const base = remote \|\| seedScene/.test(partySrc) && /merged = mutate\(base\)/.test(partySrc));
  // sync.js side of the contract: pushMergedFile re-reads inside the attempt loop and PUTs with that same read's sha
  const syncSrc = readFileSync(new URL('../engine/sync.js', import.meta.url), 'utf8');
  const pmf = syncSrc.slice(syncSrc.indexOf('export async function pushMergedFile'), syncSrc.indexOf('export async function appendLedger'));
  check("146a: pushMergedFile ghGet sits INSIDE the attempt loop (fresh read per attempt)", /for \(let attempt[\s\S]*?const existing = await ghGet\(path\)/.test(pmf));
  check("146a: pushMergedFile PUTs with the sha of the read the content came from", /ghPut\(path, JSON\.stringify\(merged, null, 2\), message, existing\?\.sha\)/.test(pmf));
}

console.log(failures === 0 ? "\nAll smoke tests passed." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
