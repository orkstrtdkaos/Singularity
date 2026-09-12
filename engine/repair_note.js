// engine/repair_note.js — ✅ ERIK 2026-09-11: "the GM still reports not being able to do things... although they seem to be able to."
//
// The ask channel lets the GM REPAIR state (Logana's charge corrected, a post recorded, a debt forgiven) and then tells the player
// whether the repair took. It measured that by four COUNTS — holdings, quests, NPCs, facts — before and after applyTurn, so a repair
// that changed an EXISTING record (an NPC's charge, a quest's status, a holding's owner) moved no count and read "NOTHING MOVED"
// while the narration said done. ⛔ A note that calls an applied change a failure is the refusal failure wearing a third coat.
//
// The ruler here is the state itself: a fingerprint of every collection the op families write, with volatile bookkeeping dropped
// (underscore keys, timestamps), and the isolated failures `applyStep` already records. Three outcomes, each true:
//   changed        — the fingerprint moved
//   did not take   — an op family threw (isolated; the rest of the turn ran)
//   nothing differed — applied without error and the state is byte-identical: it was already so

/** The collections applyTurn's op families write. Add a field here when a family gains one; §171 holds the list against app.js. */
export const REPAIR_FIELDS = ["npcRegistry", "holdings", "quests", "facts", "codex", "bands", "party", "companions", "worldState",
  "projects", "inventory", "crystal", "generated", "relationships", "status", "conditions", "activeEncounter", "debts"];

/** A stable serialization of the repairable state. Pure. */
export function repairFingerprint(character) {
  const pick = {};
  for (const k of REPAIR_FIELDS) if (character && character[k] !== undefined) pick[k] = character[k];
  return JSON.stringify(pick, (key, v) => (typeof key === "string" && (key.startsWith("_") || key === "at" || key === "updatedAt" || key === "savedAt")) ? undefined : v);
}

/** The note under the GM's answer. `failures` is `character._applyFailures` after the call. Pure. */
export function repairNote(opKeys, { before, after, failures = [] } = {}) {
  const keys = (opKeys || []).join(", ") || "something";
  const failed = (failures || []).filter(Boolean);
  if (failed.length) {
    const rest = before !== after ? " The rest was written." : "";
    return `— *the GM changed ${keys}, but ${failed.map(f => f.op).join(", ")} did not take: ${String(failed[0].message || "").slice(0, 90)}.${rest} Say so and I will look.*`;
  }
  if (before === after) return `— *the GM asked to change ${keys}, and nothing was different afterwards — it may already have been so. Say so if it should have moved.*`;
  return `— *the GM changed: ${keys}*`;
}
