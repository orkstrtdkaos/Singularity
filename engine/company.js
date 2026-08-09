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
import { companyPlaces } from "./ladder.js";

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
/** ⛔ SNG-355 — THE ONE PLACE "WHO IS WITH ME" IS ANSWERED. Departure stopped being deletion (a member
 *  who travelled with you for twenty days and left should be REMEMBERED as having left, not erased), which
 *  means `character.company` now holds history as well as present. Aevi named the consequence as the one
 *  real regression risk in the ticket: "companyRoster() must then filter on active membership, or every
 *  past ally comes back as a current one."
 *
 *  ⚠️ FIVE CALL SITES READ THIS ARRAY — the roster, the trainer set, the liaison map, the teacher
 *  block, and standing's drip. Filtering at each would be five chances to forget; a SIXTH reader added
 *  later would be a certainty. So every one goes through here, and a former member cannot leak into a
 *  present-tense answer by omission. */
export function activeCompany(character) {
  return (character?.company || []).filter(m => m && !m.leftDay);
}

/** Those who travelled with you and no longer do — history, kept. This is what makes "the road may cross
 *  again" (already in the copy) a statement the system can act on: rejoining reads the old record rather
 *  than minting a stranger. */
export function formerCompany(character) {
  return (character?.company || []).filter(m => m && m.leftDay);
}

/** ⛔ SNG-390 — THE CAPACITY CHECK LIVES HERE, and the comment thirty lines down is why: "the fallback
 *  lives here, not at the call site, because there are now two callers and a fallback written at one of
 *  them is a fallback the other lacks." I put this in `applyPartyOps` first, which was the wrong door —
 *  measured, `recruit()` has exactly ONE caller (the button) and the GM's `join` op writes
 *  `pendingCompanyOffers`, which NOTHING READS. A cap on the path nobody travels is not a cap.
 *
 *  ⚠️ REFUSES A NEW JOIN, NEVER EJECTS. A save whose rapport no longer covers its company keeps
 *  everyone: removing someone a player has travelled with, to satisfy a rule introduced afterwards, is the
 *  cruellest reading of a cap. Returns null on refusal so the caller can say why.
 *
 *  ⚠️ AND A REJOIN IS NOT A NEW PLACE — someone walking back into a party they already belong to is
 *  not taking a seat, they are returning to one. */
export function recruit(character, npcId, { roles = ["ally"], teaches = null, liaisonFor = null, day = null, ladder = null } = {}) {
  ensureCompany(character);
  if (ladder) {
    const existing = character.company.find(m => m.npcId === npcId);
    const rejoining = !!(existing && existing.leftDay);
    const isNew = !existing || rejoining;
    if (isNew && !rejoining && activeCompany(character).length >= companyPlaces(ladder, character)) return null;
  }
  const clean = [...new Set(roles.map(String).filter(r => COMPANY_ROLES.includes(r) && r !== "partner"))];
  let entry = character.company.find(m => m.npcId === npcId);
  if (!entry) { entry = { npcId, roles: [], teaches: null, liaisonFor: null, joinedDay: day }; character.company.push(entry); }
  // ⚠️ REJOINING READS THE OLD RECORD. The departure is cleared but `joinedDay` and any prior roles
  // stand, so someone who walks back into the party is the person you knew, not a stranger with their name.
  if (entry.leftDay) { entry.rejoinedDay = day; delete entry.leftDay; delete entry.departedWhy; }
  entry.roles = [...new Set([...entry.roles, ...clean])];
  // ⛔ SNG-355 §1c — THE FALLBACK LIVES HERE, NOT AT THE CALL SITE, because there are now two callers
  // (the button and the GM op) and a fallback written at one of them is a fallback the other lacks.
  //
  // The caller reads `teaches` from CONTENT.npcs — the AUTHORED catalog — so a GENERATED NPC returns {}
  // and the teacher role is silently dropped at the moment of joining. Erik calls Veth-Ondra his teacher;
  // his save says `teaches: null` and `character.teachers` is `{}`. ⚠️ THE CURRICULUM MACHINERY IS REAL
  // AND REACHES NOTHING: curriculumFor, teachersForGM and teacherOfferReady all read a field nothing ever
  // populated for the people who actually travel with you. Generated NPCs live in the character's own
  // registry, so that is the second place to look.
  const fromRegistry = character?.npcRegistry?.[npcId]?.teaches || null;
  if (teaches || fromRegistry) entry.teaches = teaches || fromRegistry;
  if (!teaches && fromRegistry) entry.roles = [...new Set([...entry.roles, "trainer"])];
  if (liaisonFor) entry.liaisonFor = liaisonFor;
  return entry;
}

/** Leave the company — remove the membership and, with it, its benefits (the teacher gate closes for
 *  high tiers not yet taken; a liaison's speed ends). Already-learned crafts stay (Law 14). Returns true
 *  if a member was removed. */
export function partCompany(character, npcId, { day = null, why = null } = {}) {
  ensureCompany(character);
  // ⛔ SNG-355 — DEPARTURE IS A STATUS, NOT A DELETE. This was `filter(m => m.npcId !== npcId)`: the
  // history went with them. Erik: "the story had let some of them depart while still remaining in my
  // party." The state could not hear a departure, and when it finally did, it erased the person instead of
  // recording that they left. Both halves are the same missing idea — that leaving is an EVENT.
  const entry = (character.company || []).find(m => m.npcId === npcId && !m.leftDay);
  if (!entry) return false;
  entry.leftDay = day ?? entry.leftDay ?? null;
  entry.departedWhy = why || entry.departedWhy || null;
  return true;
}

/** The unified NPC-company roster: each recruited member with its roles + benefits, PLUS partner-adjacent
 *  NPCs (SNG-108) folded in with derived partner/ally roles even if never formally recruited — they are
 *  already at your side. Pure over the npc registry. Returns [{npcId,name,roles,teaches,liaisonFor,bond,band,bondType}]. */
export function companyRoster(character, { rules = null } = {}) {
  ensureCompany(character);
  const reg = character?.npcRegistry || {};
  const byId = {};
  const mk = (id, n) => ({ npcId: id, name: n.name || id, roles: [], teaches: null, liaisonFor: null, bond: Number(n.relationship) || 0, band: relationshipBand(Number(n.relationship) || 0), bondType: n.bondType || null, recruited: false });
  for (const m of activeCompany(character)) {
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
  for (const m of activeCompany(character)) if (m.roles.includes("trainer") && m.teaches) set.add(m.teaches);
  return set;
}

/** The liaison factions → their standing-gain multiplier while they travel with you. { [people]: mult }. */
export function liaisonFactions(character, { multiplier = LIAISON_MULT } = {}) {
  ensureCompany(character);
  const out = {};
  for (const m of activeCompany(character)) if (m.roles.includes("liaison") && m.liaisonFor) out[m.liaisonFor] = multiplier;
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

/** SNG-175 §3: THE TEACHER'S CURRICULUM — what they can teach, and the order THEY would teach it.
 *
 *  Erik has held a Radiant teacher and a bound Ashwarden teacher and been taught nothing. `teaches`
 *  was authored on exactly ONE NPC as a bare tradition string, so "what can my teacher teach me?"
 *  had no answer in the data — only "which tradition are they of."
 *
 *  ANSWERING THE PO'S Q4 BEFORE AUTHORING ANYTHING: the ordering is already implied and needs no
 *  content pass. All 285 abilities carry `levelReq`, every tradition declares its own `abilities`,
 *  `tierOf` turns one into the other, and `combinationsAvailableFor` already answers the braid
 *  question. So the DEFAULT curriculum is derived, and a teacher authors only their DEVIATIONS —
 *  which is exactly the part that is characterisation. Two teachers of one tradition walk it
 *  differently because they disagree about what comes first, not because someone typed out two
 *  full syllabi.
 *
 *  Pure. `teacherOrder` is the NPC's optional authored path (ability ids, best first).
 */
export function curriculumFor(character, traditionId, { catalog = {}, traditionIndex = null, teacherOrder = null, known = null } = {}) {
  if (!traditionId) return null;
  const trad = traditionIndex?.byId?.[traditionId];
  const ids = (trad?.abilities || []).filter(id => catalog[id]);
  if (!ids.length) return null;

  const held = known || new Set((character?.abilities || []).map(a => a.abilityId));
  const level = character?.level || 1;
  const order = Array.isArray(teacherOrder) ? teacherOrder.filter(id => ids.includes(id)) : [];
  // The teacher's own path first, then everything else by tier — the derived spine.
  const rank = (id) => {
    const i = order.indexOf(id);
    if (i >= 0) return i;                                   // the teacher's declared judgement wins
    return order.length + (catalog[id]?.levelReq || 1);
  };
  const sorted = [...ids].sort((a, b) => rank(a) - rank(b));

  const shape = (id) => ({
    id, name: catalog[id]?.name || id, tier: catalog[id]?.levelReq || 1,
    held: held.has(id),
    reachable: !held.has(id) && (catalog[id]?.levelReq || 1) <= level + 1   // within reach, not merely listed
  });
  const all = sorted.map(shape);
  // What they would offer NEXT: the first thing not yet held that the character could actually take.
  const next = all.find(x => !x.held && x.reachable) || all.find(x => !x.held) || null;
  return {
    tradition: traditionId,
    traditionName: trad?.name || traditionId,
    all,
    taught: all.filter(x => x.held).length,
    remaining: all.filter(x => !x.held).length,
    next,
    // §3.2: the path is the TEACHER'S. Say so, so the player reads a character rather than a shop.
    pathIsTheirs: order.length > 0
  };
}

/** SNG-175 §3.3 + §3.6: what the GM needs to have a teacher OFFER the next step, and to name the
 *  braids that tradition opens. Teachers appeared in NONE of the 47 GM context rows before this —
 *  the gate existed, the initiative did not, which is why two bonded teachers taught nothing.
 *  `combosFor(traditionId)` is injected so this stays pure and skilltree-agnostic. */
export function teachersForGM(character, { catalog = {}, traditionIndex = null, npcs = {}, combosFor = null } = {}) {
  ensureCompany(character);
  const seen = new Set();
  const lines = [];
  const consider = (traditionId, whoName, npcId) => {
    if (!traditionId || seen.has(traditionId)) return;
    seen.add(traditionId);
    const c = curriculumFor(character, traditionId, {
      catalog, traditionIndex, teacherOrder: npcs[npcId]?.curriculum || null
    });
    if (!c) return;
    const braids = typeof combosFor === "function" ? (combosFor(traditionId) || []).slice(0, 2) : [];
    const bits = [`${whoName} can teach ${c.traditionName} — ${c.taught} of ${c.all.length} already yours.`];
    if (c.next) bits.push(c.next.reachable
      ? `The next step they would choose: ${c.next.name} (tier ${c.next.tier})${c.pathIsTheirs ? " — their own ordering" : ""}. OFFER it when the moment fits; a "not yet" from them is a real answer.`
      : `Nothing they teach is within reach yet — ${c.next.name} needs more growing.`);
    if (braids.length) bits.push(`Braids this opens: ${braids.map(b => b.name || b.id || b).join(", ")}.`);
    lines.push("- " + bits.join(" "));
  };
  // a bound, willing teacher (markTeacher) and a company trainer are both teachers
  for (const [tid, t] of Object.entries(character?.teachers || {})) {
    if (t && t.met && t.willing) consider(tid, npcs[t.npcId]?.name || "Your teacher", t.npcId);
  }
  for (const m of activeCompany(character)) {
    if (m.roles.includes("trainer") && m.teaches) consider(m.teaches, npcs[m.npcId]?.name || "A trainer with you", m.npcId);
  }
  return lines.length ? lines.join("\n") : "";
}

/** SNG-195 G2: the ONE present teacher whose next step is within reach right now — a company trainer
 *  (always travelling with you) or a bonded, willing teacher present in THIS scene — as structured data
 *  for the engine gate (roomForATeacherOffer) and the flip-to-instruction block. Returns null when no
 *  present teacher has a REACHABLE next step: a "not yet" is a real answer, so an out-of-reach next step
 *  does not count as room. This is what makes the teacher initiate instead of waiting to be asked. */
export function teacherOfferReady(character, { catalog = {}, traditionIndex = null, npcs = {}, combosFor = null, sceneNpcNames = [] } = {}) {
  ensureCompany(character);
  const present = sceneNpcNames.map(n => String(n).toLowerCase());
  const here = (npcId) => { const nm = String(npcs[npcId]?.name || "").toLowerCase(); return !!nm && present.some(s => s.includes(nm) || nm.includes(s)); };
  const candidates = [];
  for (const m of character.company) { // company trainers travel WITH the character — always present
    if (m.roles.includes("trainer") && m.teaches) candidates.push({ tid: m.teaches, npcId: m.npcId });
  }
  for (const [tid, t] of Object.entries(character?.teachers || {})) { // a bonded, willing teacher counts only when in THIS scene
    if (t && t.met && t.willing && here(t.npcId)) candidates.push({ tid, npcId: t.npcId });
  }
  for (const cand of candidates) {
    const c = curriculumFor(character, cand.tid, { catalog, traditionIndex, teacherOrder: npcs[cand.npcId]?.curriculum || null });
    if (c && c.next && c.next.reachable) {
      const braids = typeof combosFor === "function" ? (combosFor(cand.tid) || []).slice(0, 2).map(b => b.name || b.id || b) : [];
      return { name: npcs[cand.npcId]?.name || "Your teacher", traditionName: c.traditionName, nextStep: c.next.name, tier: c.next.tier, pathIsTheirs: !!c.pathIsTheirs, braids };
    }
  }
  return null;
}

/** ⛔ SNG-355 §1a — THE GM CAN FINALLY SAY IT. `recruit()` and `partCompany()` both worked and were
 *  called from exactly two places, both `btn.onclick` behind a `confirm()`. So the entity that NARRATES the
 *  story — the one that says "Calvar clasps your arm and turns back toward the March" — had no mechanism
 *  to record that it happened. Erik: "the story had let some of them depart while still remaining in my
 *  party." This is not a new story capability; it is letting the state hear one already being spoken.
 *
 *  ⚠️ ENTRY NEEDS CONSENT, EXIT DOES NOT, AND THE ASYMMETRY IS DELIBERATE. Joining is a commitment the
 *  player assents to, so a GM-proposed join returns a PENDING offer the button path confirms. Leaving is
 *  the story's to decide — Aevi: "a departure that requires the player's permission is not a departure."
 *
 *  Returns { departed:[], proposed:[], notes:[] }. Departures are applied; joins are only proposed. */
/** ⛔ SNG-390 — HOW MANY PLACES ARE AT YOUR SIDE, and the ladder has said so since it shipped:
 *  rapport 1 "Someone will travel with you", 4 "⚑ COMPANY: a second place at your side", 7 a third,
 *  10 a fourth. Nothing enforced it, so `companyCapacity` was a pool the ladder PAID INTO and no reader
 *  ever spent — the same finding as SNG-380 §1c, one field over.
 *
 *  ⚠️ ENFORCED ON JOIN, NEVER RETROACTIVELY. An existing save with more companions than its rapport
 *  now allows keeps every one of them: ejecting someone a player has travelled with to satisfy a rule
 *  introduced after the fact is the cruellest possible reading of a cap. It only ever refuses a NEW one,
 *  and it says why — an unexplained refusal is indistinguishable from a bug. */
export function applyPartyOps(character, ops = [], { day = null, registry = null, ladder = null } = {}) {
  ensureCompany(character);
  const out = { departed: [], proposed: [], notes: [] };
  const reg = registry || character?.npcRegistry || {};
  const nameOf = (id) => reg[id]?.name || id;
  for (const raw of Array.isArray(ops) ? ops : []) {
    const op = String(raw?.op || "").toLowerCase();
    const npcId = String(raw?.npcId || raw?.id || "").trim();
    if (!npcId) continue;
    if (op === "depart") {
      // ⚠️ ONLY SOMEONE ACTUALLY WITH YOU CAN LEAVE. Without this a GM can "depart" a stranger and mint
      // a departure record for a person who was never in the party — history invented rather than kept.
      const active = activeCompany(character).some(m => m.npcId === npcId);
      if (!active) continue;
      if (partCompany(character, npcId, { day, why: raw?.why || null })) {
        out.departed.push({ npcId, why: raw?.why || null });
        out.notes.push(`${nameOf(npcId)} is no longer travelling with you${raw?.why ? ` — ${raw.why}` : ""}.`);
      }
    } else if (op === "join") {
      if (activeCompany(character).some(m => m.npcId === npcId)) continue;   // already with you
      // ⚠️ THE CAP COUNTS PROPOSALS TOO. Two joins in one turn against one free place would both pass
      // a check against the CURRENT roster and put the player one over without either op being wrong.
      const places = ladder ? companyPlaces(ladder, character) : Infinity;
      if (activeCompany(character).length + out.proposed.length >= places) {
        out.notes.push(`${nameOf(npcId)} would travel with you, but you can keep ${places} at your side${places === 1 ? "" : " at once"} — rapport is what widens that.`);
        out.refused = [...(out.refused || []), { npcId, name: nameOf(npcId), why: "company is full", places }];
        continue;
      }
      out.proposed.push({ npcId, name: nameOf(npcId), roles: Array.isArray(raw?.roles) ? raw.roles : ["ally"], why: raw?.why || null });
    }
  }
  return out;
}
