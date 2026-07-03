// progression.js — character growth with numbers you can point at.
//   SUB-ATTRIBUTES: physical→strength/agility, mental→reason/insight,
//     social→presence/rapport, practical→craft/wits. Rolls target the sub.
//   LEVELING: each level banks a sub-attribute point (you place it) and a skill
//     point (rank up an ability or learn a new one), plus attunement/reserves.
//   DISCOVERIES: intentionally novel or combined ability use is riskier — harder
//     roll, wider crit-fail band, engine-applied backlash on crit failure — but a
//     critical success mints a permanent named technique with a standing bonus.

import { slugify } from "./quests.js";

export const SUB_OF = {
  strength: "physical", agility: "physical",
  reason: "mental", insight: "mental",
  presence: "social", rapport: "social",
  craft: "practical", wits: "practical"
};
export const SUBS = Object.keys(SUB_OF);

/** Migrate a character to sub-attributes (both subs start at the parent value). */
export function ensureSubAttributes(character) {
  if (character.subAttributes) return character;
  character.subAttributes = {};
  for (const [sub, parent] of Object.entries(SUB_OF)) {
    character.subAttributes[sub] = character.attributes?.[parent] ?? 2;
  }
  character.pendingSubPoints = character.pendingSubPoints || 0;
  character.skillPoints = character.skillPoints || 0;
  character.discoveries = character.discoveries || [];
  return character;
}

/** Keep the parent attributes as the derived average of their subs (back-compat + display). */
export function syncParentAttributes(character) {
  for (const parent of ["physical", "mental", "social", "practical"]) {
    const subs = SUBS.filter(s => SUB_OF[s] === parent).map(s => character.subAttributes[s]);
    character.attributes[parent] = Math.round(subs.reduce((a, b) => a + b, 0) / subs.length);
  }
  return character;
}

/** Level-up: bank growth choices instead of auto-spending them. Returns messages. */
export function applyLevelUps(character, rules) {
  const per = rules.leveling?.xpPerLevel ?? 100;
  const msgs = [];
  while (character.xp >= character.level * per) {
    character.level++;
    character.attunement = (character.attunement || 0) + 1;
    character.maxHealth += 5; character.maxEnergy += 5;
    character.health = character.maxHealth; character.energy = character.maxEnergy;
    character.pendingSubPoints = (character.pendingSubPoints || 0) + (rules.leveling?.subPointPerLevel ?? 1);
    character.skillPoints = (character.skillPoints || 0) + (rules.leveling?.skillPointPerLevel ?? 1);
    msgs.push(`Level ${character.level}: +1 attunement, +5 reserves, and growth to choose — a sub-attribute point and a skill point.`);
  }
  return msgs;
}

export function spendSubPoint(character, sub, rules) {
  const cap = rules.leveling?.subAttributeCap ?? 6;
  if (!SUBS.includes(sub) || (character.pendingSubPoints || 0) < 1) return false;
  if (character.subAttributes[sub] >= cap) return false;
  character.subAttributes[sub]++;
  character.pendingSubPoints--;
  syncParentAttributes(character);
  return true;
}

/** Rank up an owned ability (1 skill point). Ranks are level-gated. */
export function rankUpAbility(character, abilityId, rules) {
  const owned = character.abilities.find(a => a.abilityId === abilityId);
  if (!owned || (character.skillPoints || 0) < 1) return { ok: false, why: "no points" };
  const max = rules.leveling?.maxAbilityRank ?? 3;
  if (owned.level >= max) return { ok: false, why: "already mastered" };
  const req = rules.leveling?.rankLevelReq?.[String(owned.level + 1)] ?? 1;
  if (character.level < req) return { ok: false, why: `requires level ${req}` };
  owned.level++;
  character.skillPoints--;
  return { ok: true, newRank: owned.level };
}

/** Learn a new ability (1 skill point). Origin-gated: harmonic/radiant learn their
 *  system; valley folk may learn from either (their flexibility). */
export function learnAbility(character, abilityId, catalog, rules) {
  if ((character.skillPoints || 0) < 1) return { ok: false, why: "no points" };
  if (character.abilities.some(a => a.abilityId === abilityId)) return { ok: false, why: "already known" };
  const ab = catalog[abilityId];
  if (!ab) return { ok: false, why: "unknown ability" };
  if (character.origin !== "valley" && ab.powerSystem !== character.origin) return { ok: false, why: "wrong tradition" };
  if (character.level < (ab.levelReq || 1)) return { ok: false, why: `requires level ${ab.levelReq}` };
  character.abilities.push({ abilityId, level: 1 });
  character.skillPoints--;
  return { ok: true };
}

// ---------- novel use & discoveries ----------

export function discoveryKey(abilityIds = [], noveltyHint = "") {
  return [...abilityIds].sort().join("+") + (noveltyHint ? ":" + slugify(noveltyHint).slice(0, 24) : "");
}

/** If the character already discovered this technique, return it (novelty is
 *  no longer novel — it's earned skill, with a standing bonus). */
export function knownDiscovery(character, abilityIds, noveltyHint = "") {
  const key = discoveryKey(abilityIds, noveltyHint);
  return (character.discoveries || []).find(d => d.key === key) ||
         (character.discoveries || []).find(d => d.abilities.length > 1 && d.abilities.slice().sort().join("+") === [...abilityIds].sort().join("+")) || null;
}

/** Record a freshly minted technique (only ever called after a validated
 *  crit-success on a novel/combo action). */
export function recordDiscovery(character, { name, description, abilityIds, noveltyHint, day }) {
  character.discoveries = character.discoveries || [];
  const key = discoveryKey(abilityIds, noveltyHint);
  if (character.discoveries.some(d => d.key === key)) return null;
  const d = {
    key,
    id: slugify(name),
    name: String(name).slice(0, 60),
    description: String(description || "").slice(0, 240),
    abilities: abilityIds,
    discoveredDay: day ?? null
  };
  character.discoveries.push(d);
  return d;
}

/** Engine-applied backlash for a crit-failed novel/combo attempt. Returns what happened. */
export function applyBacklash(character, rules) {
  const hp = rules.novel?.backlashHealth ?? 4;
  const en = rules.novel?.backlashEnergy ?? 10;
  character.health = Math.max(0, character.health - hp);
  character.energy = Math.max(0, character.energy - en);
  return { health: -hp, energy: -en };
}

/** Ability detail block for the GM: exactly what each rank grants, what it cannot
 *  do, what it's not for — plus earned techniques. This is the GM's law for powers. */
export function abilitiesForGM(character, catalog) {
  const lines = [];
  for (const owned of character.abilities || []) {
    const ab = catalog[owned.abilityId];
    if (!ab) continue;
    const rank = ab.tree?.find(t => t.rank === owned.level);
    lines.push(`### ${ab.name} — rank ${owned.level}${rank ? ` "${rank.name}"` : ""} (${ab.energyCost} energy)` +
      (rank ? `\nCAN: ${rank.grants}\nCANNOT (at this rank): ${rank.cannot}` : `\n${ab.description}`) +
      (ab.notFor ? `\nNOT FOR: ${ab.notFor}` : ""));
  }
  for (const d of character.discoveries || []) {
    lines.push(`### ✦ Discovered technique: ${d.name}\n${d.description} (combines: ${d.abilities.join(" + ")}; earned through play — no novelty penalty, +bonus)`);
  }
  return lines.length ? lines.join("\n\n") : null;
}
