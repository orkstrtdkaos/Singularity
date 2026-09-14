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
export function addAssignment(worldState, { npcId, npcName, charge, targetEventId = null, kind = null, destination = null, stake = null } = {}, worldCount = null) {
  if (!npcId || !charge) return null;
  const a = ensureAssignments(worldState);
  const id = `${npcId}::${slugCharge(charge)}`;
  const prev = a[id];
  a[id] = {
    id, npcId, npcName: npcName || prev?.npcName || npcId,
    charge: smartClamp(String(charge), 120),
    targetEventId: targetEventId || prev?.targetEventId || null,
    // ⛔ SNG-541 §2 — WHAT A MISSION NEEDS THAT AN ASSIGNMENT DOES NOT HAVE. `kind` is the mechanism (one of the
    // seven, each keyed to a function family the contingent already carries); `destination` is a place id so
    // `walkingDays` makes the time real; `stake` is what went out with them and is the first thing a `problem`
    // costs. ⚠️ `charge` stays free text and stays the thing the PLAYER writes — the kind is the mechanism,
    // the charge is the sentence.
    kind: (kind && MISSION_KINDS[String(kind).toLowerCase()]) ? String(kind).toLowerCase() : (prev?.kind || null),
    destination: destination || prev?.destination || null,
    stake: stake ? smartClamp(String(stake), 60) : (prev?.stake || null),
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
export function delegationRefusal(worldState, npcId, { ladder = null, character = null, capacity = null, kind = null, who = null } = {}) {
  if (!npcId) return null;
  // ⛔ SNG-541 §3.3 (Aevi): "DO NOT BUILD A SECOND REFUSAL PATH — widen that one to carry a `why: 'would not'`
  // beside its `why: 'delegation is full'`." ⚠️ And it comes FIRST, because a person who will not take the
  // charge does not care whether you had a seat free: telling them the roster is full would be the wrong
  // sentence about the right refusal.
  if (kind && who) {
    const fit = canSendOn(who, kind);
    if (!fit.ok) return { why: "would not", kind: String(kind), note: fit.why };
  }
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

/** ⛔ SNG-541 §2 (Aevi) — THE SEVEN MISSION KINDS, EACH WANTING ONE OF THE EIGHT FAMILIES THAT ARE ALREADY ON
 *  EVERY CONTINGENT.
 *
 *  ⛑ HER KEYING PRINCIPLE IS THE WHOLE ECONOMY OF IT: `does` is authored, live in Silas's save today, and is
 *  exactly the field Erik asked to see on the roster — so "what someone is good for" already decides what you
 *  may send them to do, and the panel's most useful column becomes its eligibility rule FOR FREE. No new
 *  "skills" concept, no second taxonomy to keep in step with the first.
 *
 *  ⚠️ EVERY FAMILY HAS A DOOR, and HARM and RESTORE are second choices rather than first — "which is the point
 *  and not an oversight: an errand is rarely a fight, and a Fellowship whose only use is violence is a
 *  war-band." A person whose only family is HARM is a soldier by `contingentsFromPeople`'s own rule, and a
 *  soldier can escort. */
export const MISSION_KINDS = {
  trade:   { label: "Trade trip",   wants: "SUSTAIN",  also: "INFLUENCE", verb: "trading" },
  escort:  { label: "Escort",       wants: "PROTECT",  also: "HARM",      verb: "escorting" },
  word:    { label: "Carry word",   wants: "MOVE",     also: null,        verb: "carrying word" },
  watch:   { label: "Watch",        wants: "KNOW",     also: "PROTECT",   verb: "watching" },
  seek:    { label: "Seek",         wants: "KNOW",     also: "MOVE",      verb: "seeking" },
  work:    { label: "Work a place", wants: "SHAPE",    also: "RESTORE",   verb: "working" },
  treat:   { label: "Treat with",   wants: "INFLUENCE", also: null,       verb: "treating" },
};
export const MISSION_KIND_IDS = Object.keys(MISSION_KINDS);

/** ⛑ THE FAMILIES A PERSON ACTUALLY CARRIES, read off the same `does` the roster row prints. Accepts a
 *  contingent, a roster row or a bare list, because all three reach this from different surfaces. PURE. */
export function familiesOf(who) {
  const raw = Array.isArray(who) ? who
    : Array.isArray(who?.does) ? who.does
    : Array.isArray(who?.families) ? who.families
    : typeof who?.does === "string" ? String(who.does).split(/[\/,\s]+/)
    : [];
  return [...new Set(raw.map(f => String(f || "").trim().toUpperCase()).filter(Boolean))];
}

/** ⛔ WHO MAY BE SENT TO THIS, and WHY NOT when they may not.
 *
 *  ⚠️ AEVI'S §3.2, WHICH IS THE HALF THAT MAKES THIS CONTENT RATHER THAN A LOCK: "a person refuses a charge
 *  their record argues against — the refusal is the CHARACTER, not a gate, and it should say why in their own
 *  voice, because a refusal that explains itself is content and a refusal that does not is a locked door."
 *  ⛑ So this returns a REASON, never a bare false, and the reason names the person and what they are.
 *
 *  ⛑ AND SWORN IS CONSENT TO BE SENT (her §3.1): someone who has thrown in with you and is not at your side is
 *  already somewhere doing something. An errand is not a greater imposition than absence; it is absence with a
 *  purpose. So there is no second consent to ask for. PURE. */
export function canSendOn(who, kindId) {
  const kind = MISSION_KINDS[String(kindId || "").toLowerCase()];
  if (!kind) return { ok: false, why: "that is not an errand anyone can be sent on" };
  const fams = familiesOf(who);
  const name = who?.npcName || who?.name || "They";
  if (!fams.length) return { ok: true, fit: "unproven",
    why: `${name} has never shown you what they are good for — this is a guess on both sides` };
  if (fams.includes(kind.wants)) return { ok: true, fit: "apt", why: `${name} is exactly who you send ${kind.verb}` };
  if (kind.also && fams.includes(kind.also)) return { ok: true, fit: "second", why: `${name} can do this, though it is not what they are best at` };
  // ⛔ THE REFUSAL IS THE PERSON, IN THEIR OWN TERMS — "a warden does not run contraband."
  return { ok: false, fit: "refused",
    why: `${name} will not take that on. What they do is ${sayFamilies(fams)}, and this is not it.` };
}

/** ⛑ FAMILIES READ AS VERBS, NOT TAGS (her §4.4). `SHAPE/HARM` on a card is a database; "shapes and harms" is
 *  a person. ⚠️ Two is the limit in a row, because a row that lists everything ranks nothing. */
const FAMILY_VERB = { SHAPE: "shapes", HARM: "harms", PROTECT: "protects", KNOW: "knows",
  RESTORE: "restores", MOVE: "moves", INFLUENCE: "sways", SUSTAIN: "sustains" };
export function sayFamilies(fams, max = 2) {
  const words = familiesOf(fams).map(f => FAMILY_VERB[f]).filter(Boolean).slice(0, Math.max(1, max));
  if (!words.length) return "not yet shown";
  return words.length === 1 ? words[0] : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** ⛔ SNG-541 §2 — WHAT A `problem` COSTS, WHICH IS THE STATE THAT MAKES SENDING SOMEONE MEAN SOMETHING.
 *
 *  ⚠️ AEVI MEASURED THAT NOTHING CONSUMED IT: `advanceAssignment` sets `status = "problem"` and the only
 *  reader — `progressAgainst` — merely EXCLUDES those assignments from a count. So an errand could go wrong
 *  and the world was exactly as it had been. ⛔ "A 'problem' that only prints a line is the theatre we keep
 *  catching."
 *
 *  ⛑ SO THE COST LANDS ON SOMETHING THE PLAYER ALREADY TRACKS — the stake they sent, or standing, or a debt
 *  in their name. ⚠️ IT RETURNS THE BILL AND DOES NOT APPLY IT: the purse, the ledger and the disposition
 *  store each have exactly one door in, and this module is not any of them. The caller pays through those.
 *  PURE. */
export function problemCost(assignment, { rng = Math.random } = {}) {
  const kind = MISSION_KINDS[String(assignment?.kind || "").toLowerCase()];
  if (!kind) return null;
  const who = assignment?.npcName || "They";
  const stake = assignment?.stake || null;
  const where = assignment?.destination || null;
  // ⛔ A STAKE THAT WENT OUT AND DID NOT COME BACK IS THE FIRST AND TRUEST COST, for any kind that carried one.
  if (stake) {
    return { kind: assignment.kind, lost: stake, standing: 0,
      line: `${who} is back. ${stake} is not.${where ? ` They say it went at ${where}.` : ""}` };
  }
  // ⚠️ OTHERWISE THE COST IS THE ONE THE TABLE NAMES FOR THAT ERRAND — and each is a thing already tracked.
  switch (assignment.kind) {
    case "escort":  return { kind: "escort", hurt: true, standing: -1,
      line: `${who} arrived. Not everyone they were seeing there did.` };
    case "word":    return { kind: "word", standing: -1,
      line: `${who} carried it, and it reached the wrong ear${where ? ` at ${where}` : ""}. What was said in your name is not what you said.` };
    case "watch":   return { kind: "watch", seen: true, standing: 0,
      line: `${who} was seen. Whatever is at ${where || "that place"} knows someone is watching, and knows whose.` };
    case "seek":    return { kind: "seek", found: true, standing: 0,
      line: `${who} found something. It was not what you sent them for, and it noticed them back.` };
    case "work":    return { kind: "work", debt: true, standing: 0,
      line: `The work at ${where || "the place"} was done wrong. Undoing it will cost more than doing it would have.` };
    case "treat":   return { kind: "treat", standing: -2,
      line: `${who} spoke for you and gave offence${where ? ` at ${where}` : ""}. You cannot take it back, because it was said in your name.` };
    case "trade":   return { kind: "trade", debt: true, standing: 0,
      line: `${who} paid a price that was a lie rather than come home empty. It is the price now.` };
    default: return null;
  }
}
