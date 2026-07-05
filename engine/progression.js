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

export const SUB_DESC = {
  strength: "Force and endurance — breaking, lifting, carrying, holding on",
  agility: "Speed and balance — climbing, dodging, sneaking, slipping past",
  reason: "Logic and analysis — puzzles, mechanisms, deduction, planning details",
  insight: "Perception and intuition — noticing things, reading people, sensing wrongness",
  presence: "Command and inspiration — leading, being heeded, holding a room",
  rapport: "Charm and empathy — befriending, soothing, negotiating, fitting in",
  craft: "Making and fixing — tools, repairs, precise handwork, quality judgment",
  wits: "Improvisation and survival — quick thinking, reacting, making do"
};

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

/** One-time retro grant for characters who leveled before banked growth existed
 *  (v0.7.0). Grants (level-1) sub and skill points, once, flagged. */
export function retroLevelGrants(character, rules) {
  if (character.grantsVersion >= 1) return false;
  character.grantsVersion = 1;
  const owed = Math.max(0, (character.level || 1) - 1);
  if (owed > 0) {
    character.pendingSubPoints = (character.pendingSubPoints || 0) + owed * (rules.leveling?.subPointPerLevel ?? 1);
    character.skillPoints = (character.skillPoints || 0) + owed * (rules.leveling?.skillPointPerLevel ?? 1);
  }
  return owed > 0;
}

/** Practiced power costs less: -1 energy per two character levels and -1 per
 *  ability rank above 1, floored at half the base cost (data-driven). */
export function effectiveEnergyCost(abilityDef, character, rules) {
  const base = abilityDef?.energyCost ?? rules.energy?.defaultActionCost ?? 5;
  const lv = rules.leveling || {};
  const owned = (character.abilities || []).find(a => a.abilityId === abilityDef?.id);
  const levelDiscount = Math.floor(((character.level || 1) - 1) / 2) * (lv.energyEfficiencyPerTwoLevels ?? 1);
  const rankDiscount = Math.max(0, (owned?.level ?? 1) - 1) * (lv.rankEnergyDiscount ?? 1);
  const floor = Math.max(1, Math.ceil(base * (lv.minEnergyCostFraction ?? 0.5)));
  return Math.max(floor, base - levelDiscount - rankDiscount);
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

/** SNG-003 access rule: own tradition at face value; valley folk take any system
 *  natively (their flexibility); harmonic/radiant may cross-train into
 *  valley_craft at +crossTraditionLevelPenalty levelReq; the OTHER civilization's
 *  tradition stays closed. Returns effective levelReq, or null if forbidden. */
export function effectiveLevelReq(ab, character, rules) {
  if (!ab) return null;
  const sys = ab.powerSystem, origin = character.origin;
  const base = ab.levelReq || 1;
  if (sys === "learned") return base; // GM-granted, already personal
  if (origin === "valley") return base;
  if (sys === origin) return base;
  if (sys === "valley_craft") return base + (rules?.leveling?.crossTraditionLevelPenalty ?? 1);
  return null; // harmonic <-> radiant: closed
}

/** Learn a new ability (1 skill point), gated by effectiveLevelReq. */
export function learnAbility(character, abilityId, catalog, rules) {
  if ((character.skillPoints || 0) < 1) return { ok: false, why: "no points" };
  if (character.abilities.some(a => a.abilityId === abilityId)) return { ok: false, why: "already known" };
  const ab = catalog[abilityId];
  if (!ab) return { ok: false, why: "unknown ability" };
  const req = effectiveLevelReq(ab, character, rules);
  if (req === null) return { ok: false, why: "wrong tradition" };
  if (character.level < req) return { ok: false, why: `requires level ${req}${req !== (ab.levelReq || 1) ? " (cross-training)" : ""}` };
  character.abilities.push({ abilityId, level: 1 });
  character.skillPoints--;
  return { ok: true };
}

// ---------- GM-generated abilities (earned in fiction, clamped by engine) ----------

/** Validate a GM-proposed new ability. Returns a safe def or null. */
export function sanitizeNewAbility(raw) {
  if (!raw || !raw.name || !raw.description) return null;
  const id = slugify(raw.id || raw.name);
  if (!id) return null;
  const axes = {};
  for (const [k, v] of Object.entries(raw.axes || {}).slice(0, 3)) {
    const n = Number(v);
    if (Number.isFinite(n)) axes[String(k)] = Math.max(-1, Math.min(1, n));
  }
  return {
    id,
    name: String(raw.name).slice(0, 60),
    description: String(raw.description).slice(0, 300),
    energyCost: Math.max(4, Math.min(15, Number(raw.energyCost) || 8)),
    attribute: ["physical", "mental", "social", "practical"].includes(raw.attribute) ? raw.attribute : "practical",
    axes,
    notFor: raw.notFor ? String(raw.notFor).slice(0, 200) : "Anything beyond its described envelope.",
    narrationHints: String(raw.description).slice(0, 200),
    levelReq: 1,
    powerSystem: "learned",
    taughtBy: raw.taughtBy ? String(raw.taughtBy).slice(0, 60) : null,
    effectTags: []
  };
}

/** Grant a new ability the fiction earned. Capped: floor(level/2)+1 learned
 *  abilities total, no duplicates of anything known. */
export function applyNewAbility(character, def, rules) {
  if (!def) return { ok: false, why: "invalid" };
  character.customAbilities = character.customAbilities || {};
  const cap = Math.floor((character.level || 1) / 2) + 1;
  if (Object.keys(character.customAbilities).length >= cap) return { ok: false, why: "learned-ability cap for this level" };
  if (character.customAbilities[def.id] || (character.abilities || []).some(a => a.abilityId === def.id)) return { ok: false, why: "already known" };
  character.customAbilities[def.id] = def;
  character.abilities.push({ abilityId: def.id, level: 1 });
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
