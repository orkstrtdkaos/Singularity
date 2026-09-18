// pressure.js — SNG-245: THE PRESSURE QUEUE. A registry of driven things that WANT to happen to the player,
// fed by the agendas already in the game (a bonded NPC's unmet want; a threat that comes to you; later:
// villain-moves, arc-stirs, treasure-rumors), that SNG-080's quiet-turn "THE WORLD ACTS" trigger PULLS FROM —
// so when the world acts, it acts with a REAL, SPECIFIC, AIMED thing, not a generic "invent something."
//
// Pure: no I/O, no globals. The app gathers the live inputs (npcRegistry + wants, the eligible beast pool at
// the player's location, the clock day, the pacing pref) and passes them in; these shape the entries + order
// the queue. The consumer (app maybeWorldPressure) pulls the top entry and hands the GM its hook + teeth.
//
// Entry shape: { source, kind, subjectId, aimedAtPlayer, urgency (1-4), oneLineHook, becomes, addedDay, locationId? }
//   becomes: { type: "encounter", encounterId, name }  → teeth: the SNG-236 hard-frame presents a defend-encounter
//          | { type: "scene", who }                     → teeth: a real driven scene beat (the NPC arrives)

import { smartClamp, namesMatch } from "./namematch.js"; // SNG-245: word-boundary clamp for the want/name in a hook (not a raw .slice)

export const PRESSURE_KINDS = ["villain-move", "npc-want", "arc-stir", "treasure-rumor", "threat-attack", "invitation"];
export const PRESSURE_CAP = 6; // registry:internal — the queue never hoards; keep only the most-urgent handful

// ⛔ CCODE-410: one spelling of "the same quest", shared by the producer and by the reader that asks whether it is still owed.
const questKey = (id) => String(id ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

/** Ensure the queue array exists on a worldState (lazy — old saves predate it). Returns the array. */
export function ensurePressureQueue(ws) {
  if (ws && !Array.isArray(ws.pressureQueue)) ws.pressureQueue = [];
  return (ws && ws.pressureQueue) || [];
}

/** Add an entry, DE-DUPED by (kind, subjectId) — the same NPC/threat is never queued twice; a fresher copy
 *  (>= urgency) replaces the stale one. Keeps the queue urgency-sorted and capped (the lowest-urgency tail is
 *  dropped past PRESSURE_CAP). Mutates + returns the array. A malformed entry (no kind/subjectId) is ignored —
 *  the "aimed, not random" guard: an entry without a real subject is generic noise, not a driven push. */
export function enqueuePressure(queue, entry) {
  if (!Array.isArray(queue) || !entry || !entry.kind || !entry.subjectId) return queue;
  const at = queue.findIndex(e => e.kind === entry.kind && e.subjectId === entry.subjectId);
  if (at >= 0) { if ((entry.urgency || 0) >= (queue[at].urgency || 0)) queue[at] = entry; }
  else queue.push(entry);
  queue.sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
  if (queue.length > PRESSURE_CAP) queue.length = PRESSURE_CAP;
  return queue;
}

/** Pull the highest-urgency entry that STILL APPLIES (removes it, and prunes any stale entries in passing).
 *  `stillApplies(entry)` lets the caller drop location-bound entries the player has walked away from — a threat
 *  that was coming to a holding you've since left is moot. Returns the entry, or null when nothing applies.
 *  ⛔ CCODE-410: `leave(entry)` names entries this pull neither TAKES nor PRUNES. An invitation is said through its own door
 *  (`nextInvitation`, read by the GM call, then `invitationSaid`), and the quiet-turn push must never spend one. */
export function pullTopPressure(queue, stillApplies = () => true, leave = () => false) {
  if (!Array.isArray(queue) || !queue.length) return null;
  for (let i = queue.length - 1; i >= 0; i--) { if (!leave(queue[i]) && !stillApplies(queue[i])) queue.splice(i, 1); }
  if (!queue.length) return null;
  queue.sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
  const at = queue.findIndex(e => !leave(e));
  return at < 0 ? null : queue.splice(at, 1)[0];
}

/** ⛔ CCODE-410 — DOES A QUEUED ENTRY STILL APPLY where the character stands now? One rule for every reader of the queue. A
 *  location-bound entry applies only where it was aimed (SNG-245: a threat coming to a place you have left is moot); and while
 *  threats are PAUSED for this character (Erik, of Courtney's game: "remove the swarm attack for now"), no threat-attack does —
 *  so a queued one cannot fire, and the pull prunes it. A person's want is not a threat and is untouched. Pure. */
export function pressureApplies(e, character) {
  if (!e) return false;
  if (e.locationId && e.locationId !== character?.currentLocationId) return false;
  if (e.kind === "threat-attack" && character?.worldState?.threatsPaused) return false;
  return true;
}

// ---------- Producer: NPC unmet want (SNG-233) — a bonded NPC, long unseen, comes TO the player ----------

/** The absence (in journey-clock days) after which an unmet want becomes a KNOCK, scaled by the aggression
 *  pref: Calm waits long, Relentless barely waits. Balanced ≈ 11 days; floored at 3 so it never nags. */
export function wantStalenessThreshold(pacingMult = 1) {
  return Math.max(3, Math.round(11 / Math.max(0.4, Number(pacingMult) || 1)));
}

/** Build npc-want pressure candidates: bonded NPCs (a real bondType, or devoted/ally standing) who are NOT
 *  currently with the player, whose want is authored, and whom the player hasn't seen in longer than the
 *  staleness threshold. Pure. Inputs: `npcs` (registry entries[]), `wantFor(id)→string|null`, `bandOf(score)→
 *  band label, `nowDay` (journey-clock day), `hereId` (an NPC last seen HERE isn't absent), `pacingMult`. */
export function npcWantPressures({ npcs = [], wantFor = () => null, bandOf = () => "", nowDay = 0, hereId = null, pacingMult = 1 } = {}) {
  const threshold = wantStalenessThreshold(pacingMult);
  const out = [];
  for (const n of npcs) {
    if (!n || !n.id || !n.name) continue;
    if (n.status && n.status !== "active") continue;                       // not the dead or departed
    const band = bandOf(n.relationship || 0);
    const bonded = (n.bondType && n.bondType !== "platonic") || band === "devoted" || band === "ally";
    if (!bonded) continue;
    const seenDay = n.lastSeen?.day;
    if (seenDay == null) continue;                                         // never really met — no absence to feel
    const absent = (n.lastSeen?.locationId && n.lastSeen.locationId === hereId) ? 0 : (nowDay - seenDay);
    if (absent < threshold) continue;
    const want = wantFor(n.id);
    if (!want) continue;                                                   // no authored want → nothing to drive on
    const urgency = Math.min(4, 1 + Math.floor(absent / threshold) + (band === "devoted" ? 1 : 0));
    out.push({
      source: "npc-want", kind: "npc-want", subjectId: n.id, aimedAtPlayer: true, urgency,
      oneLineHook: `${n.name}, unseen for ${absent} days, has come looking for you — driven by an unmet want: ${smartClamp(String(want), 160)}. They arrive now, not content to keep waiting.`,
      becomes: { type: "scene", who: n.id }, addedDay: nowDay
    });
  }
  return out;
}

// ---------- Producer: an invitation — a quest bound to THIS character brings its giver to the door (CCODE-357) ----------

/** ⛔ CCODE-357 — AN INVITATION IS A PERSON AT THE DOOR.
 *
 *  Erik: "She likes spirituality - perhaps send someone who invites her to help attend a monastery and work as the healer
 *  she is?"
 *
 *  ⚑ A quest BOUND to a character (`boundToCharacter` / `boundToPlayer`) surfaced as one line under "Available here" in a
 *  quest log a new player may never open — nobody ever came. So its giver comes looking, through the SAME driven arrival
 *  the queue already stages for a bonded NPC's want, and says it in person; taking it up stays the player's choice.
 *
 *  ⚠️ ONCE. An invitation a player heard and let pass is not nagged at them every few quiet turns: the caller says which
 *  have been delivered (`delivered(id)`), and the quest itself stays in the log either way. Pure. */
export function invitationPressures({ quests = [], character = null, nowDay = 0, nameOf = () => null, delivered = () => false } = {}) {
  const out = [];
  if (!character) return out;
  const key = questKey;
  const held = new Set((character.quests || []).map(q => key(q?.id)));
  for (const def of quests || []) {
    if (!def?.id || !def.giver) continue;
    const mine = (def.boundToCharacter && character.name && namesMatch(character.name, def.boundToCharacter))
      || (def.boundToPlayer && character.playerKey && character.playerKey === def.boundToPlayer);
    if (!mine || held.has(key(def.id)) || delivered(def.id)) continue;
    const who = nameOf(def.giver) || String(def.giver);
    const what = smartClamp(String(def.premise || def.name || "").trim(), 220);
    out.push({
      source: "invitation", kind: "invitation", subjectId: def.id, aimedAtPlayer: true, urgency: 3,
      oneLineHook: `${who} has come looking for ${character.name} with an invitation: ${what} They ask in person, warmly — whether to take it up is the player's choice, and saying no is a real answer.`,
      becomes: { type: "scene", who: def.giver }, addedDay: nowDay,
    });
  }
  return out;
}

/** ⛔ CCODE-410 (Erik, of Courtney's Adelheid: "ship it") — THE INVITATION WAITING FOR THIS CHARACTER, IF ONE IS, READ BY THE GM CALL.
 *  ⚑ Measured on her save: Sister Vreni's invitation sat first in the queue from day 2 and never arrived. The quiet-turn push it
 *  waited on needs three quiet beats IN A ROW; her GM filed a quest update on 19 of 22 beats and each one resets the count; and the
 *  count is not saved, so every reload started it over.
 *  Returns the first invitation that still applies WITHOUT removing it — it leaves the queue through `invitationSaid`, once a beat
 *  that carried it has come back. ⚠️ Prunes in passing an invitation whose quest the character has since taken up from the log, or
 *  one already said: neither is owed. Mutates only the queue. */
export function nextInvitation(queue, character, stillApplies = () => true) {
  if (!Array.isArray(queue)) return null;
  const held = new Set((character?.quests || []).map(q => questKey(q?.id)));
  const said = character?.worldState?.invitationsDelivered || {};
  for (let i = queue.length - 1; i >= 0; i--) {
    const e = queue[i];
    if (e?.kind === "invitation" && (held.has(questKey(e.subjectId)) || Object.prototype.hasOwnProperty.call(said, e.subjectId))) queue.splice(i, 1);
  }
  return queue.find(e => e?.kind === "invitation" && stillApplies(e)) || null;
}

/** ⛔ CCODE-410 — THE BEAT THAT CARRIED IT CAME BACK: now it has been said, once. Out of the queue and onto `invitationsDelivered`,
 *  which the producer reads, so nobody knocks again. ⚠️ Called only after a GM call returned — never when the directive is merely
 *  SET, which is how CCODE-357's first version could lose one to a closed tab or a failed call. The day is recorded as a truthy
 *  value even when it is 0, because the producer asks `!!delivered[id]` (a default that behaves like a value). */
export function invitationSaid(ws, subjectId, day = null) {
  if (!ws || !subjectId) return;
  const q = ensurePressureQueue(ws);
  for (let i = q.length - 1; i >= 0; i--) if (q[i]?.kind === "invitation" && q[i].subjectId === subjectId) q.splice(i, 1);
  ws.invitationsDelivered = { ...(ws.invitationsDelivered || {}), [subjectId]: Number(day) > 0 ? Number(day) : true };
}

// ---------- Producer: threat-attack — a REAL beast/threat comes to the player, becomes a defend-encounter ----------

/** Build a threat-attack pressure from the eligible duel pool at the player's location — a REAL subject (a
 *  bestiary/seed encounter id), never invented. Rolls on the aggression pref × local danger, so a safe place
 *  rarely turns one up and a dangerous one often does. Pure (rng injected). `pool` = eligibleEncountersFor(...)
 *  entries; `danger` 0-4; returns one candidate or null. The entry.id is a valid pendingEncounterOffer id (the
 *  SNG-236 hard-frame path), so the push BECOMES a real defend-encounter — teeth, not theatre. */
export function threatAttackPressure({ pool = [], danger = 0, hereId = null, nowDay = 0, pacingMult = 1, rng = () => 0.5 } = {}) {
  const duels = (pool || []).filter(e => e && e.id && (e.routing === "duel" || e.opponent));
  if (!duels.length || (Number(danger) || 0) <= 0) return null;
  const chance = Math.min(0.85, 0.10 * (Number(danger) || 0) * Math.max(0.4, Number(pacingMult) || 1));
  if (rng() >= chance) return null;
  const pick = duels[Math.min(duels.length - 1, Math.floor(rng() * duels.length))];
  const name = pick.opponent?.name || pick.name || String(pick.id).replace(/^(beast_|re-)/, "").replace(/_/g, " ");
  return {
    source: "threat-attack", kind: "threat-attack", subjectId: pick.id, aimedAtPlayer: true,
    urgency: Math.min(4, 2 + Math.floor((Number(danger) || 0) / 2)),
    oneLineHook: `A ${name} has come down onto the character here — not stumbled into, but ARRIVED, hunting. Defend, or drive it off.`,
    becomes: { type: "encounter", encounterId: pick.id, name: smartClamp(String(name), 80) },
    addedDay: nowDay, locationId: hereId
  };
}
