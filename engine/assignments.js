// assignments.js — SNG-191 §4, the world-tick inversion. The world honours DELEGATED COMMITMENTS
// while the player is away. An ASSIGNMENT is STATE: a named person put in charge of ongoing work — a
// repair, a supply line, a watch, the accounts — optionally set AGAINST a crisis. Silas delegated four
// roles at the Fell Pell (Calvar → the repair crews, Dara → logistics, Mara → supply, Aldric → the
// accounts); the world should honour those while he is gone.
//
// The inversion this enables: the tick stops asking "what did Calvar FEEL" and asks "did the repair
// crews make PROGRESS." A person's situation becomes an OUTCOME, not a mood, and news is DERIVED from
// what MOVED — never authored beside it. Pure: no DOM, no fetch, no clock (the caller passes the count).

import { delegationCapacity, serviceStates } from "./ladder.js";
import { smartClamp } from "./namematch.js"; // SNG-152: model text clamps on a word boundary
const slugCharge = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

export function ensureAssignments(worldState) {
  if (!worldState.assignments) worldState.assignments = {};
  return worldState.assignments;
}

/** Record a delegation. Keyed by npcId + charge so re-delegating the same charge UPDATES rather than
 *  duplicating (idempotent). A charge with no person, or no charge, is not an assignment. */
export function addAssignment(worldState, { npcId, npcName, charge, targetEventId = null } = {}, worldCount = null) {
  if (!npcId || !charge) return null;
  const a = ensureAssignments(worldState);
  const id = `${npcId}::${slugCharge(charge)}`;
  const prev = a[id];
  a[id] = {
    id, npcId, npcName: npcName || prev?.npcName || npcId,
    charge: smartClamp(String(charge), 120),
    targetEventId: targetEventId || prev?.targetEventId || null,
    progress: prev?.progress || 0,
    status: prev?.status && prev.status !== "done" ? prev.status : "working",
    stampedAtWorldCount: prev?.stampedAtWorldCount ?? worldCount,
    lastMovedWorldCount: worldCount
  };
  return a[id];
}

/** ⛔ R25b — THE PEOPLE CURRENTLY CARRYING SOMETHING FOR YOU. ⚠️ DISTINCT PEOPLE, NOT CHARGES: Silas's
 *  Edvar Crane holds two and is ONE delegate. Capacity is attention, and a second errand for someone you
 *  already trust does not cost a new relationship.
 *
 *  ⚠️ A FINISHED CHARGE FREES THE PERSON. `done` is terminal — they are not running anything for you any
 *  more, and counting them forever would mean a character who delegates well is punished for it. */
export function activeDelegates(worldState) {
  const a = worldState?.assignments || {};
  return [...new Set(Object.values(a).filter(x => x && x.status !== "done").map(x => x.npcId).filter(Boolean))];
}

/** ⛔ R25b — WHY A NEW DELEGATION CANNOT BE TAKEN ON, or null when it can.
 *
 *  ⚠️ THE COMPANY PRECEDENT, DELIBERATELY: refuse a NEW one, never drop an existing one. A save already
 *  over capacity keeps every delegate it has — dropping someone a player entrusted with real work to
 *  satisfy a rule introduced afterwards is the cruellest possible reading of a cap.
 *
 *  ⚠️ AND IT SAYS WHY. `applyPartyOps` learned this already: an unexplained refusal is indistinguishable
 *  from a bug, and the player cannot act on what they are not told.
 *
 *  ⛔ NO LADDER MEANS NO CAP. A caller that has not adopted this sees exactly the behaviour it saw
 *  yesterday, which is the gate on shipping it. */
export function delegationRefusal(worldState, npcId, { ladder = null, character = null, capacity = null } = {}) {
  if (!npcId) return null;
  const cap = Number.isFinite(capacity) ? capacity : (ladder && character ? delegationCapacity(ladder, character) : null);
  if (cap === null) return null;                       // ⚠️ absent means today
  const current = activeDelegates(worldState);
  if (current.includes(npcId)) return null;            // ⛔ ALREADY YOURS — another charge, not another person
  if (current.length < cap) return null;
  return { why: "delegation is full", capacity: cap, current: current.length,
    note: cap === 0
      ? "There is nobody who would carry this for you while you are elsewhere — that comes with standing, and standing comes with the years."
      : `You can keep ${cap} ${cap === 1 ? "person" : "people"} running things in your name, and ${cap === 1 ? "that place is" : "those places are"} taken. Someone would have to finish first.` };
}
/** Apply the outcome the tick decided for one assignment. UNGUARDRAILED (§4b) — progress and problems
 *  may run as far as their own logic takes them; this records the step, it does not cap it. */
export function advanceAssignment(assignment, outcome, worldCount = null) {
  if (!assignment) return null;
  switch (outcome) {
    case "progress": assignment.progress = (assignment.progress || 0) + 1; assignment.status = "working"; break;
    case "done": assignment.progress = (assignment.progress || 0) + 1; assignment.status = "done"; break;
    case "problem": assignment.status = "problem"; break;
    case "stall": assignment.status = "stalled"; break;
    default: return assignment; // unknown outcome — leave it untouched rather than corrupt the state
  }
  assignment.lastMovedWorldCount = worldCount;
  return assignment;
}

/** §4.2 — the delegated work is the mechanism a crisis can be affected by. Returns the assignments
 *  pushing AGAINST a given crisis that are genuinely making headway (not stalled or in trouble), so
 *  the tick can let their progress COUNTER the crisis's own worsening. Delegation that can't move a
 *  crisis is theatre; this is what makes it real. */
export function progressAgainst(worldState, eventId) {
  if (!eventId) return [];
  return Object.values(worldState?.assignments || {})
    .filter(a => a.targetEventId === eventId && a.status !== "problem" && a.status !== "stalled");
}

/** The GM's view: the commitments the player left running, so the GM can speak to them and the return
 *  is about the work, not colour. Null when nothing is delegated (costs nothing on those turns). */
export function assignmentsForGM(worldState, { ladder = null, character = null } = {}) {
  const list = Object.values(worldState?.assignments || {});
  if (!list.length) return null;
  const lines = list.map(a =>
    `- ${a.npcName} — ${a.charge} (${a.status}${a.progress ? `, ${a.progress} step${a.progress === 1 ? "" : "s"} in` : ""})${a.targetEventId ? ` [working the ${String(a.targetEventId).replace(/_/g, " ")}]` : ""}`
  );
  // ⛔ R25c — THE STANDING THAT GOVERNS THE WORK, WHERE THE WORK IS. Rapport 18 and 20 are STATES, and a
  // state nobody is told about does nothing: these change how the GM narrates a delegate's absence, which
  // means they have to reach the GM. ⚠️ THEY ARE PROSE ON PURPOSE — the ruling forbids them becoming a
  // number, and a line the GM reads is exactly as strong as a household should be.
  if (ladder && character) {
    const st = serviceStates(ladder, character);
    if (st.householdEndures) lines.push(`- ⚑ Their household holds without you. Work in your name continues through your absence — nobody is waiting to be told again.`);
    if (st.loyaltyUnbought) lines.push(`- ⚑ They are yours and would not be talked out of it. Pressure, bribery and a better offer do not move these people.`);
  }
  return lines.join("\n");
}
