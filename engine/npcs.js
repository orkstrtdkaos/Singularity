// npcs.js — NPC permanence. Every person the character meets — authored in content
// packs OR invented by the GM mid-scene — gets a durable registry entry: who they
// are, where you met, what has passed between you, what they've experienced, what
// they can do. The GM proposes typed npcUpdates; the engine applies them clamped.
// The registry is fed back every turn so people stay THE SAME PEOPLE.
// (Offscreen NPC evolution — them growing while you're away — is world-tick work, v0.4.)

import { slugify } from "./quests.js";

const CAPS = { registry: 40, history: 10, knownFacts: 8, skills: 6 };

/** Fuzzy-find an existing person before ever creating a new one — the GM refers
 *  to the same human as "davan", "davan-channel-worker", or "Davan" across turns. */
export function findExistingNpc(reg, id, name = "") {
  if (reg[id]) return reg[id];
  const nameNorm = slugify(name);
  for (const n of Object.values(reg)) {
    if (nameNorm && slugify(n.name) === nameNorm) return n;
    const a = n.id.split("-")[0], b = id.split("-")[0];
    if (a === b && (n.id.startsWith(id) || id.startsWith(n.id) || a === id || b === n.id)) return n;
  }
  return null;
}

/** Names that are really ids ("davan_channel_worker", "millbrook.elder_woman")
 *  become readable ("Davan Channel Worker", "Elder Woman"). */
export function prettifyNpcName(name, dropTokens = []) {
  if (!/[._]/.test(name) && /[A-Z]/.test(name)) return name; // already human-shaped
  const words = String(name).split(/[._\-\s]+/).filter(w => w && !dropTokens.includes(w.toLowerCase()));
  if (!words.length) return name;
  return words.map(w => w[0].toUpperCase() + w.slice(1)).join(" ").slice(0, 60);
}

export function applyNpcUpdates(character, updates = [], ctx = {}) {
  character.npcRegistry = character.npcRegistry || {};
  const reg = character.npcRegistry;
  for (const u of (updates || []).slice(0, 5)) {
    const id = u.npcId ? slugify(u.npcId) : slugify(u.name || "");
    if (!id) continue;
    let n = findExistingNpc(reg, id, u.name || "");
    if (!n) {
      // only a "meet" may create a person; updates for unknown people are dropped
      // (this is what let the legacy path spawn duplicate id-named entries)
      if (u.op && u.op !== "meet") continue;
      if (Object.keys(reg).length >= CAPS.registry) continue; // registry full — keep the people who matter
      n = reg[id] = {
        id,
        name: prettifyNpcName(String(u.name || id)).slice(0, 60),
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

/** Cleanup migration: merge duplicate registry entries (same person under
 *  different ids), and prettify names that are really ids. Community-id tokens
 *  (e.g. "millbrook") are dropped from prettified names. */
export function mergeDuplicateNpcs(character, dropTokens = []) {
  const reg = character.npcRegistry || {};
  const ids = Object.keys(reg);
  for (const id of ids) {
    const n = reg[id];
    if (!n) continue;
    for (const otherId of Object.keys(reg)) {
      if (otherId === id || !reg[otherId]) continue;
      const other = reg[otherId];
      const sameName = slugify(n.name) === slugify(other.name);
      const a = id.split(/[.-]/)[0], b = otherId.split(/[.-]/)[0];
      const tokenKin = a === b && (id.startsWith(otherId) || otherId.startsWith(id) || a === id || b === otherId);
      if (!sameName && !tokenKin) continue;
      // merge the shorter-history entry into the richer one
      const [keep, drop] = (n.history.length + n.knownFacts.length) >= (other.history.length + other.knownFacts.length) ? [n, other] : [other, n];
      keep.history = [...new Set([...drop.history, ...keep.history])].slice(-10);
      keep.knownFacts = [...new Set([...drop.knownFacts, ...keep.knownFacts])].slice(-8);
      keep.skillsObserved = [...new Set([...drop.skillsObserved, ...keep.skillsObserved])].slice(-6);
      keep.relationship = Math.abs(drop.relationship) > Math.abs(keep.relationship) ? drop.relationship : keep.relationship;
      if (!keep.role && drop.role) keep.role = drop.role;
      if (!keep.description && drop.description) keep.description = drop.description;
      delete reg[drop.id];
    }
  }
  for (const n of Object.values(reg)) n.name = prettifyNpcName(n.name, dropTokens);
  return character;
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
