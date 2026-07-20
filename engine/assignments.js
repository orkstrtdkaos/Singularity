// assignments.js — SNG-191 §4, the world-tick inversion. The world honours DELEGATED COMMITMENTS
// while the player is away. An ASSIGNMENT is STATE: a named person put in charge of ongoing work — a
// repair, a supply line, a watch, the accounts — optionally set AGAINST a crisis. Silas delegated four
// roles at the Fell Pell (Calvar → the repair crews, Dara → logistics, Mara → supply, Aldric → the
// accounts); the world should honour those while he is gone.
//
// The inversion this enables: the tick stops asking "what did Calvar FEEL" and asks "did the repair
// crews make PROGRESS." A person's situation becomes an OUTCOME, not a mood, and news is DERIVED from
// what MOVED — never authored beside it. Pure: no DOM, no fetch, no clock (the caller passes the count).

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
export function assignmentsForGM(worldState) {
  const list = Object.values(worldState?.assignments || {});
  if (!list.length) return null;
  return list.map(a =>
    `- ${a.npcName} — ${a.charge} (${a.status}${a.progress ? `, ${a.progress} step${a.progress === 1 ? "" : "s"} in` : ""})${a.targetEventId ? ` [working the ${String(a.targetEventId).replace(/_/g, " ")}]` : ""}`
  ).join("\n");
}
