// npcs.js — NPC permanence. Every person the character meets — authored in content
// packs OR invented by the GM mid-scene — gets a durable registry entry: who they
// are, where you met, what has passed between you, what they've experienced, what
// they can do. The GM proposes typed npcUpdates; the engine applies them clamped.
// The registry is fed back every turn so people stay THE SAME PEOPLE.
// (Offscreen NPC evolution — them growing while you're away — is world-tick work, v0.4.)

import { slugify } from "./quests.js";
import { isMinorSubject } from "./art.js";

const CAPS = { registry: 40, history: 10, knownFacts: 8, skills: 6 };

// SNG-108: relationship KIND + arc, orthogonal to the −10..+10 score. The score is INTENSITY; the
// bondType is the NATURE of the bond; a romantic bond additionally carries a growth STAGE tended by
// play (courting → together → committed → partner). Stage is set by GM op on a real relational beat,
// never auto-inferred, never leaping past what the score supports, and never romantic for a minor.
export const BOND_TYPES = ["platonic", "mentor", "student", "rival", "family", "romantic", "sworn"];
export const ROMANTIC_STAGES = ["courting", "together", "committed", "partner"];
const DEFAULT_STAGE_FLOORS = { courting: 2, together: 4, committed: 6, partner: 8 };

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
    if (u.revealName) {
      const newName = prettifyNpcName(String(u.revealName).slice(0, 60));
      const curTokens = new Set(String(n.name || "").toLowerCase().split(/\s+/).filter(Boolean));
      const newTokens = String(newName || "").toLowerCase().split(/\s+/).filter(Boolean);
      // SNG-111: a fuller name that CONTAINS the known one ("Pell Marsh" when we know "Pell") is a surname
      // EXTENSION — compose it, don't shunt it to aliases and lose the composition.
      const isExtension = n.nameRevealed && newName && newName !== n.name && curTokens.size && newTokens.length > curTokens.size && [...curTokens].every(t => newTokens.includes(t));
      if (!n.nameRevealed && newName && newName !== n.name) {
        n.aliases = [...(n.aliases || []), n.name].slice(-4);
        n.history = [...n.history, `[d${ctx.day ?? "?"}] Their name is revealed: ${newName} (was known as "${n.name}")`].slice(-CAPS.history);
        n.name = newName;
        n.nameRevealed = true;
      } else if (isExtension) {
        n.aliases = [...new Set([...(n.aliases || []), n.name])].slice(-4); // keep the given name for match continuity
        n.history = [...n.history, `[d${ctx.day ?? "?"}] You learn more of their name — ${newName}`].slice(-CAPS.history);
        n.name = newName;
      } else if (n.nameRevealed && newName && newName !== n.name && !(n.aliases || []).includes(newName)) {
        n.aliases = [...(n.aliases || []), newName].slice(-4); // a genuinely different later name → alias
      }
    }
    // SNG-111: learn MORE of a known name — append only the new token(s) ("Pell" + "Marsh" → "Pell Marsh").
    // Idempotent (learning "Marsh" twice doesn't double it); keeps the given name as an alias.
    if (u.nameExtend && n.name) {
      const have = new Set(String(n.name).toLowerCase().split(/\s+/).filter(Boolean));
      const add = prettifyNpcName(String(u.nameExtend).slice(0, 60)).split(/\s+/).filter(t => t && !have.has(t.toLowerCase()));
      if (add.length) {
        const composed = `${n.name} ${add.join(" ")}`.slice(0, 60).trim();
        n.aliases = [...new Set([...(n.aliases || []), n.name])].slice(-4);
        n.history = [...n.history, `[d${ctx.day ?? "?"}] You learn more of their name: ${add.join(" ")} — ${composed}`].slice(-CAPS.history);
        n.name = composed;
        n.nameRevealed = true;
      }
    }
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
    // SNG-108: bond KIND + romantic STAGE — applied AFTER the score so the stage floor sees the fresh value.
    if (u.bondType || u.bondStage) advanceBond(n, { bondType: u.bondType, bondStage: u.bondStage }, ctx.rules, ctx.day);
    if (u.status && ["active", "injured", "missing", "dead", "departed"].includes(u.status)) n.status = u.status;
    if (u.statusNote) n.statusNote = String(u.statusNote).slice(0, 160);
    n.lastSeen = { locationId: ctx.locationId || null, day: ctx.day ?? null };
  }
  return character.npcRegistry;
}

/** SNG-012 Part C: player names an unnamed NPC directly (parallel to item naming).
 *  Sets display name on the stable id, records the old name as an alias, logs it. */
export function setNpcName(character, npcId, name, day = null) {
  const n = character.npcRegistry?.[npcId];
  if (!n) return false;
  const newName = prettifyNpcName(String(name).slice(0, 60));
  if (!newName || newName === n.name) return false;
  n.aliases = [...(n.aliases || []), n.name].slice(-4);
  n.history = [...n.history, `[d${day ?? "?"}] You know this person's name now: ${newName} (was "${n.name}")`].slice(-CAPS.history);
  n.name = newName;
  n.nameRevealed = true;
  return true;
}

/** Heuristic: does this registry entry read as name-unknown (a role/placeholder)? */
export function nameIsUnknown(n) {
  if (n.nameRevealed) return false;
  const name = (n.name || "").toLowerCase();
  return /unknown|unnamed|\bthe\b|warden|keeper|stranger|figure|man|woman|guard|clerk|scout|elder|apprentice|dock-?master/.test(name);
}

/** SNG-119: the people you know who belong to a PLACE — registry NPCs first-met/last-seen there, or whose
 *  authored home/community matches it. So a location's header shows who you'd actually find there (Pell under
 *  her community), not everyone you've ever met. Pure. */
export function knownPeopleAt(character, locId, { locations = {}, npcs = {} } = {}) {
  if (!locId) return [];
  const community = locations[locId]?.communityId || null;
  const out = [];
  for (const n of Object.values(character?.npcRegistry || {})) {
    const cat = npcs[n.id];
    const here = n.firstMet?.locationId === locId || n.lastSeen?.locationId === locId
      || cat?.homeLocation === locId || (community && cat?.communityId === community);
    if (here) out.push({ id: n.id, name: n.name, label: relationshipLabel(n), status: n.status, bondType: n.bondType || null });
  }
  return out;
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

/** SNG-136: has this NPC crossed a HIGH bond milestone that earns a dedicated portrait? Returns the tier
 *  name (a person who MATTERS) or null. Romantic committed/partner, a sworn tie, or a devoted-band bond
 *  (score ≥ 7 — Pell). The higher milestones only, never every acquaintance. Pure. */
export function npcPortraitTier(n) {
  if (!n) return null;
  if (n.bondStage === "partner") return "partner";
  if (n.bondStage === "committed") return "committed";
  if (n.bondType === "sworn") return "sworn";
  if (relationshipBand(Number(n.relationship) || 0) === "devoted") return "devoted";
  return null;
}

/** SNG-108: set/advance an NPC bond's KIND (bondType) and — for a romantic bond — its STAGE, gated:
 *  romantic is REFUSED for a minor (same floor as art/romance); a stage may advance at most one step
 *  per beat and only if the relationship score meets that stage's floor (no leaping to "partner" at
 *  relationship 2). Additive + logged; never silently rewrites. Returns {changed, refused?}. */
export function advanceBond(n, { bondType, bondStage } = {}, rules = null, day = null) {
  if (!n) return { changed: false };
  const floors = rules?.bond?.stageFloors || DEFAULT_STAGE_FLOORS;
  let changed = false;
  if (bondType === "romantic" && isMinorSubject(n)) { // absolute minor-protection
    n.history = [...(n.history || []), `[d${day ?? "?"}] (a romantic turn was declined — protected)`].slice(-CAPS.history);
    return { changed: false, refused: "minor" };
  }
  if (bondType && BOND_TYPES.includes(bondType) && bondType !== n.bondType) {
    n.bondType = bondType; changed = true;
    n.history = [...(n.history || []), `[d${day ?? "?"}] Your bond becomes ${bondType}.`].slice(-CAPS.history);
  }
  if (bondStage && (n.bondType || bondType) === "romantic" && ROMANTIC_STAGES.includes(bondStage)) {
    const wantIdx = ROMANTIC_STAGES.indexOf(bondStage);
    const curIdx = n.bondStage ? ROMANTIC_STAGES.indexOf(n.bondStage) : -1;
    const cappedIdx = Math.min(wantIdx, curIdx + 1); // never leap past the next stage
    if (cappedIdx > curIdx) {
      const target = ROMANTIC_STAGES[cappedIdx];
      if ((n.relationship ?? 0) >= (floors[target] ?? 0)) { // score must support the stage
        n.bondStage = target; changed = true;
        n.history = [...(n.history || []), `[d${day ?? "?"}] Your bond deepens — ${target}.`].slice(-CAPS.history);
      }
    }
  }
  return { changed };
}

/** SNG-108: human label combining the bond's KIND, romantic STAGE, and score band — "committed
 *  partner · devoted", "rival · wary", or just the band for a plain acquaintance. */
export function relationshipLabel(n) {
  const band = relationshipBand(n?.relationship ?? 0);
  const type = n?.bondType && n.bondType !== "platonic" ? n.bondType : null;
  if (type === "romantic" && n.bondStage) {
    const word = { courting: "courting", together: "together", committed: "committed partner", partner: "partner" }[n.bondStage] || n.bondStage;
    return `${word} · ${band}`;
  }
  return type ? `${type} · ${band}` : band;
}

/** SNG-108: a romantic bond at the party-adjacent stage — a companion by relationship, not recruitment. */
export function isPartnerAdjacent(n, rules = null) {
  return n?.bondType === "romantic" && n?.bondStage === (rules?.bond?.partyAdjacentStage || "partner");
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
    (n.bondType && n.bondType !== "platonic" ? ` BOND: ${relationshipLabel(n)} — established fact; honor the KIND of this relationship.` : "") +
    (n.description ? ` ${n.description}` : "") +
    (n.statusNote ? ` CURRENT SITUATION: ${n.statusNote}.` : "") +
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
