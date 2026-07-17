// company.js — SNG-126: NPC party members with ROLES, unified into one "company." Erik ruled UNIFY:
// companion / trainer / liaison / partner / ally are ROLES a person in your company holds, and roles
// STACK freely on one NPC. Each role wires to the system that ALREADY implements it — companionBonus,
// the SNG-100b teacher gate, standingWithPeople, the SNG-108 partner bond — so this SURFACES + BINDS
// what exists rather than forking a second party system. Pure (reads the npc registry).
//
// Catalog companions (Huginn) stay in `character.companions` and keep their existing path (role
// = companion, beast). THIS module owns the NPC-people half: a `character.company` roster of recruited
// registry NPCs, each `{ npcId, roles[], teaches, liaisonFor, joinedDay }`.

import { relationshipBand, isPartnerAdjacent } from "./npcs.js";

export const COMPANY_ROLES = ["companion", "trainer", "liaison", "partner", "ally"];
const RECRUIT_BANDS = ["devoted", "ally"]; // a bond this strong is willing to travel with you (relationshipBand)
const LIAISON_MULT = 1.5;                  // a liaison speeds reputation with their people

export function ensureCompany(character) {
  if (character && !Array.isArray(character.company)) character.company = [];
  return character;
}

/** Is this registry NPC bonded strongly enough to recruit? (band ≥ ally.) Consent + earned is the guard;
 *  the recruiter still checks the fiction, but the bond is the mechanical floor. Pure. */
export function isRecruitable(npcEntry) {
  return !!npcEntry && RECRUIT_BANDS.includes(relationshipBand(Number(npcEntry.relationship) || 0));
}

/** The roles an NPC's authored record offers when recruited: always `ally`; `trainer` if it teaches a
 *  tradition; `liaison` if it represents a people. (partner is NEVER offered here — it is derived from
 *  the SNG-108 bond, which enforces the minor floor.) Pure over a catalog record. */
export function offeredRoles(npcCatalog = {}) {
  const roles = ["ally"];
  if (npcCatalog.teaches) roles.push("trainer");
  if (npcCatalog.liaisonFor) roles.push("liaison");
  return roles;
}

/** Recruit a known NPC into the company with one or more roles (they STACK). `partner` is refused here
 *  (bond-derived only). Returns the company entry. */
export function recruit(character, npcId, { roles = ["ally"], teaches = null, liaisonFor = null, day = null } = {}) {
  ensureCompany(character);
  const clean = [...new Set(roles.map(String).filter(r => COMPANY_ROLES.includes(r) && r !== "partner"))];
  let entry = character.company.find(m => m.npcId === npcId);
  if (!entry) { entry = { npcId, roles: [], teaches: null, liaisonFor: null, joinedDay: day }; character.company.push(entry); }
  entry.roles = [...new Set([...entry.roles, ...clean])];
  if (teaches) entry.teaches = teaches;
  if (liaisonFor) entry.liaisonFor = liaisonFor;
  return entry;
}

/** Leave the company — remove the membership and, with it, its benefits (the teacher gate closes for
 *  high tiers not yet taken; a liaison's speed ends). Already-learned crafts stay (Law 14). Returns true
 *  if a member was removed. */
export function partCompany(character, npcId) {
  ensureCompany(character);
  const before = character.company.length;
  character.company = character.company.filter(m => m.npcId !== npcId);
  return character.company.length < before;
}

/** The unified NPC-company roster: each recruited member with its roles + benefits, PLUS partner-adjacent
 *  NPCs (SNG-108) folded in with derived partner/ally roles even if never formally recruited — they are
 *  already at your side. Pure over the npc registry. Returns [{npcId,name,roles,teaches,liaisonFor,bond,band,bondType}]. */
export function companyRoster(character, { rules = null } = {}) {
  ensureCompany(character);
  const reg = character?.npcRegistry || {};
  const byId = {};
  const mk = (id, n) => ({ npcId: id, name: n.name || id, roles: [], teaches: null, liaisonFor: null, bond: Number(n.relationship) || 0, band: relationshipBand(Number(n.relationship) || 0), bondType: n.bondType || null, recruited: false });
  for (const m of character.company) {
    const n = reg[m.npcId] || {};
    const e = byId[m.npcId] = mk(m.npcId, n);
    e.roles = [...m.roles]; e.teaches = m.teaches || null; e.liaisonFor = m.liaisonFor || null; e.recruited = true;
  }
  for (const [id, n] of Object.entries(reg)) {
    if (!isPartnerAdjacent(n, rules)) continue;
    const e = byId[id] || (byId[id] = mk(id, n));
    if (!e.roles.includes("partner")) e.roles.unshift("partner");
    if (!e.roles.includes("ally")) e.roles.push("ally");
  }
  return Object.values(byId);
}

/** The traditions the company can TEACH — the trainer role wired to the teacher gate (SNG-100b). A Set. */
export function trainerFor(character) {
  ensureCompany(character);
  const set = new Set();
  for (const m of character.company) if (m.roles.includes("trainer") && m.teaches) set.add(m.teaches);
  return set;
}

/** The liaison factions → their standing-gain multiplier while they travel with you. { [people]: mult }. */
export function liaisonFactions(character, { multiplier = LIAISON_MULT } = {}) {
  ensureCompany(character);
  const out = {};
  for (const m of character.company) if (m.roles.includes("liaison") && m.liaisonFor) out[m.liaisonFor] = multiplier;
  return out;
}

/** The standing-gain multiplier for a given people (1 if no liaison for them). */
export function liaisonMultiplierFor(character, people, opts = {}) {
  return liaisonFactions(character, opts)[people] || 1;
}

const ROLE_BADGE = { companion: "🐾", trainer: "⚔", liaison: "🤝", partner: "♥", ally: "🫂" };
/** A short badge string for a role list (UI convenience; pure). */
export function roleBadges(roles = []) {
  return roles.map(r => ROLE_BADGE[r] ? `${ROLE_BADGE[r]} ${r}` : r).join(" · ");
}
