// Node smoke test for the pure engine modules (no browser needed).
// Run: node tests/smoke.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveAction, successChance, spectrumAlignment, applyEnergyCost } from "../engine/resolve.js";
import { senseTier, renderSense } from "../engine/sense.js";
import { recordDeed, standingWith, reputationSummary, knownTags } from "../engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, deriveAptitudes } from "../engine/playerprofile.js";

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

console.log(failures === 0 ? "\nAll smoke tests passed." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
