// Node smoke test for the pure engine modules (no browser needed).
// Run: node tests/smoke.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveAction, successChance, spectrumAlignment, applyEnergyCost } from "../engine/resolve.js";
import { senseTier, renderSense } from "../engine/sense.js";
import { recordDeed, standingWith, reputationSummary, knownTags } from "../engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, deriveAptitudes } from "../engine/playerprofile.js";
import { normalizeInventory, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM } from "../engine/inventory.js";
import { newClock, readClock, advanceClock } from "../engine/worldtime.js";
import { companionBonus, companionsForGM, activeCompanions } from "../engine/companions.js";
import { applyQuestUpdates, questsForGM, slugify } from "../engine/quests.js";
import { sanitizeScene, buildTurnContext, sanitizeIntent } from "../engine/gm.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, mergeDuplicateNpcs, findExistingNpc, prettifyNpcName, relationshipBand } from "../engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM } from "../engine/places.js";
import { initWorldState, runWorldTick, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM } from "../engine/worldtick.js";
import { assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "../engine/gambit.js";
import { SUBS, ensureSubAttributes, syncParentAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, knownDiscovery, recordDiscovery, applyBacklash, abilitiesForGM } from "../engine/progression.js";
import { ensureCodex, applyCodexUpdates, codexForGM, searchCodex } from "../engine/codex.js";
import { sceneImage, locationImage } from "../engine/art.js";

// stub localStorage for worldtime settings in Node
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };

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
for (let i = 0; i < 10; i++) updateProfile(prof, ["plan", "scout"], rules.playerAptitudes);
check("strategist earned after 10 planned actions", prof.aptitudes.includes("strategist"));
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

// --- novel use & discoveries ---
const novelAction = { attribute: "practical", subAttribute: "craft", axes: {}, difficulty: 0, novel: true };
const plainChance = successChance({ character: hero2, action: { ...novelAction, novel: false }, location: { spectrum: {} }, rules });
const novelChance = successChance({ character: hero2, action: novelAction, location: { spectrum: {} }, rules });
check("novel use pays the surcharge", novelChance === plainChance - rules.novel.difficultySurcharge);
const rNovel = resolveAction({ character: hero2, action: novelAction, location: { spectrum: {} }, rules }, () => 0.93); // roll 94
check("novel crit-fail band widens (94 crit-fails)", rNovel.degree === "crit_failure");
const rPlain = resolveAction({ character: hero2, action: { ...novelAction, novel: false, difficulty: -50 }, location: { spectrum: {} }, rules }, () => 0.93);
check("same roll is not a crit-fail when routine", rPlain.degree !== "crit_failure");
const before = { h: hero2.health, e: hero2.energy };
const bl = applyBacklash(hero2, rules);
check("backlash costs health and energy", hero2.health === before.h + bl.health && hero2.energy === before.e + bl.energy);
const minted = recordDiscovery(hero2, { name: "Echo-Guided Push", description: "Sonic push aimed by echo-sense through a wall.", abilityIds: ["sonic_resonance", "echo_sense"], noveltyHint: "push through wall", day: 4 });
check("discovery mints once", minted && recordDiscovery(hero2, { name: "Echo-Guided Push", abilityIds: ["sonic_resonance", "echo_sense"], noveltyHint: "push through wall" }) === null);
check("known combo found regardless of hint", !!knownDiscovery(hero2, ["echo_sense", "sonic_resonance"]));
const discChance = successChance({ character: hero2, action: { ...novelAction, novel: true, discoveryBonus: rules.novel.discoveryBonus }, location: { spectrum: {} }, rules });
check("discovered technique earns bonus instead of surcharge", discChance === plainChance + rules.novel.discoveryBonus);
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
check('catalog is 28+ abilities with trees', Object.keys(fullCat).length >= 28 && Object.values(fullCat).every(a => a.tree?.length === 3 && a.notFor));
const hChar = { origin: 'harmonic', level: 1 };
check('own tradition at face value', effectiveLevelReq(fullCat.stillness_field, hChar, rules) === 1);
check('cross-training into valley_craft costs +1', effectiveLevelReq(fullCat.wayfinding, hChar, rules) === 2);
check('other civ tradition closed', effectiveLevelReq(fullCat.light_well, hChar, rules) === null);
check('valley takes everything natively', effectiveLevelReq(fullCat.light_well, { origin: 'valley', level: 1 }, rules) === 1 && effectiveLevelReq(fullCat.wayfinding, { origin: 'valley', level: 1 }, rules) === 1);
const crossLearner = { origin: 'radiant', level: 1, skillPoints: 1, abilities: [] };
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

console.log(failures === 0 ? "\nAll smoke tests passed." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
