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

import { smartClamp } from "./namematch.js"; // SNG-245: word-boundary clamp for the want/name in a hook (not a raw .slice)

export const PRESSURE_KINDS = ["villain-move", "npc-want", "arc-stir", "treasure-rumor", "threat-attack"];
export const PRESSURE_CAP = 6; // registry:internal — the queue never hoards; keep only the most-urgent handful

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
 *  that was coming to a holding you've since left is moot. Returns the entry, or null when nothing applies. */
export function pullTopPressure(queue, stillApplies = () => true) {
  if (!Array.isArray(queue) || !queue.length) return null;
  for (let i = queue.length - 1; i >= 0; i--) { if (!stillApplies(queue[i])) queue.splice(i, 1); }
  if (!queue.length) return null;
  queue.sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
  return queue.shift();
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
