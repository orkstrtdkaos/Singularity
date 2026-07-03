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
import { sanitizeScene, buildTurnContext } from "../engine/gm.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, relationshipBand } from "../engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM } from "../engine/places.js";
import { initWorldState, runWorldTick, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM } from "../engine/worldtick.js";
import { assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "../engine/gambit.js";

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

console.log(failures === 0 ? "\nAll smoke tests passed." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
