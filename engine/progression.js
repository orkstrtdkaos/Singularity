// progression.js — character growth with numbers you can point at.
//   SUB-ATTRIBUTES: physical→strength/agility, mental→reason/insight,
//     social→presence/rapport, practical→craft/wits. Rolls target the sub.
//   LEVELING: each level banks a sub-attribute point (you place it) and a skill
//     point (rank up an ability or learn a new one), plus attunement/reserves.
//   DISCOVERIES: intentionally novel or combined ability use is riskier — harder
//     roll, wider crit-fail band, engine-applied backlash on crit failure — but a
//     critical success mints a permanent named technique with a standing bonus.

import { slugify } from "./quests.js";
import { meetsLearnGate, meetsRank3Gate, atCapacity, skillPointCost, rankExpression, forkPending } from "./skilltree.js";
import { domainAccess } from "./traditions.js";

// Practiced enough for `targetRank`? Inlined (not imported from practice.js) to avoid a circular
// import — practice.js already imports discoveryKey from here. Mirrors practice.js practiceRankReady.
function practicedForRank(character, abilityId, targetRank, rules) {
  const need = rules.leveling?.useRankThreshold?.[String(targetRank)] ?? rules.practice?.useRankThreshold?.[String(targetRank)];
  if (!need) return false;
  return (character.practice?.uses?.[abilityId] || 0) >= need;
}

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

/** Rank up an owned ability (1 skill point, or FREE via practice). Level-gated. */
export function rankUpAbility(character, abilityId, rules, opts = {}) {
  const owned = character.abilities.find(a => a.abilityId === abilityId);
  if (!owned) return { ok: false, why: "not known" };
  const max = rules.leveling?.maxAbilityRank ?? 3;
  if (owned.level >= max) return { ok: false, why: "already mastered" };
  const req = rules.leveling?.rankLevelReq?.[String(owned.level + 1)] ?? 1;
  if (character.level < req) return { ok: false, why: `requires level ${req}` };
  if (owned.level + 1 >= 3 && opts.attributeGates) {
    const g = meetsRank3Gate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why };
  }
  // SNG-BATCH-5: affordability last — cross-class abilities cost 2x (opts.catalog resolves the class)
  const ab = (opts.catalog || {})[abilityId];
  const cost = opts.viaPractice ? 0 : skillPointCost(ab, character, opts.skillCapacity);
  if (!opts.viaPractice && (character.skillPoints || 0) < cost) return { ok: false, why: cost > 1 ? `costs ${cost} points (cross-class)` : "no points" };
  owned.level++;
  if (!opts.viaPractice) character.skillPoints -= cost;
  return { ok: true, newRank: owned.level, viaPractice: !!opts.viaPractice, cost };
}

// ---------- ability-arch v2: depth is EARNED, not bought ----------

/** Rank 2 (Practiced) lands AUTOMATICALLY the moment an ability has been used enough (and the level
 *  bar is met) — no skill point, no player click. Call after recordUse(). Returns the abilityIds that
 *  advanced this call, so the caller can toast them. Rank 3 is never automatic (see markDefiningMoment):
 *  it is a defining moment the GM marks. A pending branch fork blocks the auto-advance — a fork is a
 *  permanent A-xor-B choice (Law 9), so the player must pick it; the fork chooser then advances. */
export function autoAdvancePracticedRanks(character, rules, opts = {}) {
  const advanced = [];
  for (const owned of character.abilities || []) {
    if (owned.level !== 1) continue;                       // only rank 1 → 2 is automatic
    if (!practicedForRank(character, owned.abilityId, 2, rules)) continue;
    const req = rules.leveling?.rankLevelReq?.["2"] ?? 1;
    if ((character.level || 1) < req) continue;            // the level bar still holds
    if (opts.branchForks && forkPending(character, owned.abilityId, 2, opts.branchForks)) continue;
    owned.level = 2;
    advanced.push(owned.abilityId);
  }
  return advanced;
}

/** Rank 3 (Mastered) — the defining moment. GM-driven only (the markDefiningMoment op), never
 *  automatic. The engine guards it so mastery can never be handed to an unpracticed craft: the
 *  ability must be at rank 2, practiced to the rank-3 use threshold, past its rank3Min attribute gate,
 *  and past the level bar. The GM narrates the breakthrough; the engine decides whether it lands. */
export function markDefiningMoment(character, abilityId, rules, opts = {}) {
  const owned = (character.abilities || []).find(a => a.abilityId === abilityId);
  if (!owned) return { ok: false, why: "not known" };
  const max = rules.leveling?.maxAbilityRank ?? 3;
  if (owned.level >= max) return { ok: false, why: "already mastered" };
  if (owned.level < 2) return { ok: false, why: "not yet practiced — rank 2 comes first" };
  if (!practicedForRank(character, abilityId, owned.level + 1, rules)) return { ok: false, why: "not practiced enough for mastery yet" };
  const req = rules.leveling?.rankLevelReq?.[String(owned.level + 1)] ?? 1;
  if ((character.level || 1) < req) return { ok: false, why: `requires level ${req}` };
  if (opts.attributeGates) {
    const g = meetsRank3Gate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why };
  }
  if (opts.branchForks && forkPending(character, abilityId, owned.level + 1, opts.branchForks)) {
    return { ok: false, why: "fork", forkPending: true }; // caller resolves the fork, then re-calls
  }
  owned.level++;
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
  if (sys === "precursor") {
    // SNG-011: the Precursor tier is never offered at creation or ordinary
    // level-up — access is unlocked per-ability in fiction (remnant, quest,
    // Old Roads mastery, a teacher). See character.precursorAccess.
    return (character.precursorAccess || []).includes(ab.id) ? base : null;
  }
  if (origin === "valley") return base;
  if (sys === origin) return base;
  if (sys === "valley_craft") return base + (rules?.leveling?.crossTraditionLevelPenalty ?? 1);
  return null; // harmonic <-> radiant: closed
}

/** SNG-BATCH-10 Phase 1: the domain gate — enforced in the ENGINE, not just the picker.
 *  Reads the great-circle geometry via domainAccess (traditions.json). Only applies once a
 *  character has crystallized/picked domains; legacy (no domains) stays open. Braid combinations
 *  and artifact grants never route through learnAbility, so those crossings are unaffected. */
export function domainGateFor(ab, character, traditionIndex) {
  // SNG-089: an Accord craft is FREELY ACCESSED — ungated by origin/domain/ring-distance. It still
  // costs a point (base 1); the tuition is the journey to the waygate, not a domain gate.
  if (ab?.accord) return { allowed: true, penalty: 1, band: "accord" };
  if (!traditionIndex || !character?.domains?.primary) return { allowed: true, penalty: 1, band: "open" };
  return domainAccess(ab, ab?.levelReq || 1, character.domains, traditionIndex);
}

/** Learn a new ability (1 skill point), gated by effectiveLevelReq + the SNG-055 domain gate. */
export function learnAbility(character, abilityId, catalog, rules, opts = {}) {
  if (character.abilities.some(a => a.abilityId === abilityId)) return { ok: false, why: "already known" };
  const ab = catalog[abilityId];
  if (!ab) return { ok: false, why: "unknown ability" };
  // SNG-094: the DOMAIN gate (SNG-055) is authoritative for a character with domains — the legacy
  // effectiveLevelReq gates by `powerSystem === origin`, which returns null for every 24-tradition
  // ability whose powerSystem is an axis-file name (e.g. "reach_death_life"), so a native Ashwarden
  // could not learn their OWN people's craft at level-up. Here the domain gate decides access and the
  // ability's own levelReq is the level bar. Precursor keeps its per-ability fiction gate; accord open.
  const idx = opts.traditionIndex;
  const req = ab.accord ? (ab.levelReq || 1)
    : ab.powerSystem === "precursor" ? effectiveLevelReq(ab, character, rules)
    : (character?.domains?.primary && idx) ? (domainGateFor(ab, character, idx).allowed ? (ab.levelReq || 1) : null)
    : effectiveLevelReq(ab, character, rules);
  if (req === null) return { ok: false, why: character?.domains?.primary ? "outside your domains" : "wrong tradition" };
  if (character.level < req) return { ok: false, why: `requires level ${req}${req !== (ab.levelReq || 1) ? " (cross-training)" : ""}` };
  // SNG-BATCH-10: the great-circle domain gate — antipode closed, tier caps, capstone rule.
  const verdict = domainGateFor(ab, character, opts.traditionIndex);
  if (!verdict.allowed) return { ok: false, why: verdict.reason || "outside your domains" };
  if (opts.attributeGates) {
    const g = meetsLearnGate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why };
  }
  if (opts.skillCapacity && atCapacity(character, opts.skillCapacity)) {
    return { ok: false, why: "at skill capacity — deepen an owned skill instead of learning a new one" };
  }
  // Affordability last. When domains are set, the ring-distance penalty is the cost multiplier
  // (supersedes the legacy home-class 2x); otherwise fall back to the legacy cross-class cost.
  const cost = opts.free ? 0
    : (opts.traditionIndex && character?.domains?.primary) ? (verdict.penalty || 1)
    : skillPointCost(ab, character, opts.skillCapacity);
  if (!opts.free && (character.skillPoints || 0) < cost) return { ok: false, why: cost > 1 ? `costs ${cost} points (${verdict.band === "far" ? "distant domain" : "cross-class"})` : "no points" };
  character.abilities.push({ abilityId, level: 1 });
  if (!opts.free) character.skillPoints -= cost;
  return { ok: true, free: !!opts.free, cost, band: verdict.band };
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
/** SNG-089: how a craft harms, in words the GM can narrate to. "Can fight" ≠ "can harm" — an
 *  incapacitating craft STOPS a threat without wounding it; a `none` craft (Stillhold peace-working)
 *  wounds nothing at all. Feeding this stops the GM inventing a wound a craft cannot cause. */
export function harmRungGloss(rung) {
  switch (rung) {
    case "lethal": return "this craft CAN end a life — in its own idiom (never a generic wound); narrate a real death when the fiction earns it";
    case "damaging": return "this craft WOUNDS but does not slay — a weakened thing is still a thing; it hurts, it does not kill";
    case "incapacitating": return "this craft STOPS a threat; it does not wound it — bind, hold, turn aside, unmake the footing; never a cut or a break";
    case "none": return "this craft HARMS NOTHING — it works through peace, making, or reading; NEVER invent a wound from it. If the foe cannot be turned this way, they run, borrow, or take up a weapon like anyone else";
    default: return String(rung);
  }
}

export function abilitiesForGM(character, catalog, branchForks = null) {
  const lines = [];
  for (const owned of character.abilities || []) {
    const ab = catalog[owned.abilityId];
    if (!ab) continue;
    // SNG-BATCH-5: a chosen fork path REPLACES the linear rank expression for the GM too
    const rank = (branchForks && rankExpression(character, ab, owned.level, branchForks)) || ab.tree?.find(t => t.rank === owned.level);
    lines.push(`### ${ab.name} — rank ${owned.level}${rank ? ` "${rank.name}"${rank.forked ? " (specialized fork)" : ""}` : ""} (${ab.energyCost} energy)` +
      (rank ? `\nCAN: ${rank.grants}\nCANNOT (at this rank): ${rank.cannot}` : `\n${ab.description}`) +
      (ab.notFor ? `\nNOT FOR: ${ab.notFor}` : "") +
      (ab.harmRung ? `\nHARM: ${harmRungGloss(ab.harmRung)}` : ""));
  }
  for (const d of character.discoveries || []) {
    lines.push(`### ✦ Discovered technique: ${d.name}\n${d.description} (combines: ${d.abilities.join(" + ")}; earned through play — no novelty penalty, +bonus)`);
  }
  return lines.length ? lines.join("\n\n") : null;
}
