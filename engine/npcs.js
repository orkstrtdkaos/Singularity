// npcs.js — NPC permanence. Every person the character meets — authored in content
// packs OR invented by the GM mid-scene — gets a durable registry entry: who they
// are, where you met, what has passed between you, what they've experienced, what
// they can do. The GM proposes typed npcUpdates; the engine applies them clamped.
// The registry is fed back every turn so people stay THE SAME PEOPLE.
// (Offscreen NPC evolution — them growing while you're away — is world-tick work, v0.4.)

import { slugify } from "./quests.js";

const CAPS = { registry: 40, history: 10, knownFacts: 8, skills: 6 };

export function applyNpcUpdates(character, updates = [], ctx = {}) {
  character.npcRegistry = character.npcRegistry || {};
  const reg = character.npcRegistry;
  for (const u of (updates || []).slice(0, 5)) {
    const id = u.npcId ? slugify(u.npcId) : slugify(u.name || "");
    if (!id) continue;
    let n = reg[id];
    if (!n) {
      if (Object.keys(reg).length >= CAPS.registry) continue; // registry full — keep the people who matter
      n = reg[id] = {
        id,
        name: String(u.name || id).slice(0, 60),
        role: String(u.role || "").slice(0, 100),
        description: String(u.description || "").slice(0, 240),
        firstMet: { locationId: ctx.locationId || null, day: ctx.day ?? null },
        relationship: 0,
        history: [],
        knownFacts: [],
        skillsObserved: [],
        status: "active"
      };
    }
    // updates are additive/evolving — never silently rewrite identity
    if (u.name && !n.name) n.name = String(u.name).slice(0, 60);
    if (u.role) n.role = String(u.role).slice(0, 100);
    if (u.description && !n.description) n.description = String(u.description).slice(0, 240);
    if (u.note) n.history = [...n.history, `[d${ctx.day ?? "?"}] ${String(u.note).slice(0, 180)}`].slice(-CAPS.history);
    if (u.learned) {
      const facts = Array.isArray(u.learned) ? u.learned : [u.learned];
      for (const f of facts.slice(0, 3)) {
        const fact = String(f).slice(0, 160);
        if (!n.knownFacts.includes(fact)) n.knownFacts = [...n.knownFacts, fact].slice(-CAPS.knownFacts);
      }
    }
    if (u.skillsObserved) {
      const skills = Array.isArray(u.skillsObserved) ? u.skillsObserved : [u.skillsObserved];
      for (const s of skills.slice(0, 3)) {
        const skill = String(s).slice(0, 60);
        if (!n.skillsObserved.includes(skill)) n.skillsObserved = [...n.skillsObserved, skill].slice(-CAPS.skills);
      }
    }
    if (typeof u.relationshipDelta === "number") {
      n.relationship = Math.max(-10, Math.min(10, n.relationship + Math.max(-2, Math.min(2, u.relationshipDelta))));
    }
    if (u.status && ["active", "injured", "missing", "dead", "departed"].includes(u.status)) n.status = u.status;
    n.lastSeen = { locationId: ctx.locationId || null, day: ctx.day ?? null };
  }
  return character.npcRegistry;
}

export function relationshipBand(score) {
  if (score >= 7) return "devoted";
  if (score >= 4) return "ally";
  if (score >= 1) return "friendly";
  if (score <= -7) return "enemy";
  if (score <= -4) return "hostile";
  if (score <= -1) return "wary";
  return "neutral";
}

/** Registry block for the GM: people relevant to this scene/location first, then
 *  the strongest other bonds. The GM must treat these as established fact. */
export function npcRegistryForGM(character, { locationId = null, sceneNpcNames = [] } = {}) {
  const reg = character.npcRegistry || {};
  const all = Object.values(reg);
  if (!all.length) return null;
  const sceneNames = sceneNpcNames.map(s => s.toLowerCase());
  const relevant = all.filter(n =>
    n.lastSeen?.locationId === locationId || n.firstMet?.locationId === locationId ||
    sceneNames.some(s => s.includes(n.name.toLowerCase()) || n.name.toLowerCase().includes(s))
  );
  const rest = all.filter(n => !relevant.includes(n))
    .sort((a, b) => Math.abs(b.relationship) - Math.abs(a.relationship))
    .slice(0, Math.max(0, 12 - relevant.length));
  const pick = [...relevant, ...rest].slice(0, 12);
  if (!pick.length) return null;
  return pick.map(n =>
    `- ${n.name}${n.role ? ` (${n.role})` : ""} — ${relationshipBand(n.relationship)} (${n.relationship}), status: ${n.status}.` +
    (n.description ? ` ${n.description}` : "") +
    (n.skillsObserved.length ? ` Skills seen: ${n.skillsObserved.join(", ")}.` : "") +
    (n.knownFacts.length ? ` What they know/have experienced: ${n.knownFacts.join("; ")}.` : "") +
    (n.history.length ? ` History with ${character.name}: ${n.history.slice(-4).join(" | ")}` : "")
  ).join("\n");
}

/** One-time migration: fold the old shallow relationships map into the registry. */
export function migrateRelationships(character, npcCatalog = {}) {
  if (!character.relationships || character.npcRegistry) {
    character.npcRegistry = character.npcRegistry || {};
    return character;
  }
  character.npcRegistry = {};
  for (const [npcId, rel] of Object.entries(character.relationships)) {
    const cat = npcCatalog[npcId];
    character.npcRegistry[slugify(npcId)] = {
      id: slugify(npcId),
      name: cat?.name || npcId,
      role: cat?.role || "",
      description: "",
      firstMet: { locationId: cat?.homeLocation || null, day: null },
      relationship: Math.max(-10, Math.min(10, rel.score || 0)),
      history: (rel.notes || []).map(x => String(x).slice(0, 180)).slice(-CAPS.history),
      knownFacts: [],
      skillsObserved: [],
      status: "active"
    };
  }
  return character;
}
