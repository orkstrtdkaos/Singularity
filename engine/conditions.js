// engine/conditions.js — SNG-522 §3 / CCODE-216: PERSIST-UNTIL-HEALED IS A DIFFERENT CLOCK.
//
// ⛔ NOT A LONGER DURATION. Durations are ROUNDS, capped at `craftDurationMax` (5), and they tick down
// whether or not anyone does anything about them. Erik on Grey Hand: *"it doesn't come back immediately
// upon stopping — it would have to be healed/restored."* A thing that waits out is not that. A thing that
// **a night's sleep does not touch** is.
//
// ⚠️ SO THE RULE IS ONE SENTENCE: rest clears what rest can clear, and a persist-until-healed condition
// survives any amount of rest. There is no number of nights that fixes a hand that has stopped working —
// somebody has to mend it.
//
// The record, on the character: `character.conditions = [ … ]`
//   { id, kind, by, magnitude?, type?, persistUntilHealed?, sinceDay? }
//
// ⚠️ CONDITIONS ARE APPLIED BY THE CALLER, NOT BY A ROUND. `battleRound` emits `imposed` / `inflicted` the
// same way it emits `damage`; this is what turns those into something that outlives the contest. An engine
// that reaches into a character sheet from inside a round is the thing every branch there avoids.

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** ⛔ RANK-FIRST, AND WALKING DOWN — the CCODE-214 rule, because this flag will be authored on a rank the
 *  same way `imposes` and `ongoingHarm` were, and reading the ability level would miss all of it again. */
export function authoredFlag(ability, key, rank = 1) {
  const tree = (ability?.tree || []).filter(r => num(r?.rank, 1) <= num(rank, 1))
    .sort((a, b) => num(b.rank, 1) - num(a.rank, 1));
  for (const t of tree) { const v = t?.[key] ?? t?.mechanic?.[key]; if (v != null) return v; }
  return ability?.mechanic?.[key] ?? ability?.[key] ?? null;
}

/** ⛔ HER SHAPE NAMES WHAT PERSISTS, AND THAT IS BETTER THAN MINE. I asked for `persistUntilHealed: true`
 *  and Aevi authored `{ "condition": "enfeeblement" }` — `bleeding`, `decay`, `vulnerability`. The boolean
 *  answers *whether*; hers answers *what*, which is what a receipt needs to say and what a heal needs to
 *  clear by name. ⚠️ THIRD TIME THIS PATTERN HAS RUN: `{type:"decay"}` on ongoingHarm, the rank-level
 *  blocks, and now this — every time, she answered the more useful question and my reader tested for the
 *  narrower one. Both shapes are accepted; the truthy object wins because it carries more. */
export function persistsUntilHealed(ability, rank = 1) {
  const v = authoredFlag(ability, "persistUntilHealed", rank);
  return v === true || (!!v && typeof v === "object");
}

/** What the persistence is CALLED, when the author said so. Null when it was authored as a bare flag. */
export function persistedConditionName(ability, rank = 1) {
  const v = authoredFlag(ability, "persistUntilHealed", rank);
  return (v && typeof v === "object" && v.condition) ? String(v.condition) : null;
}

/** Put a condition on someone. Returns the stored record, or the existing one if it is already there —
 *  ⚠️ a condition is a STATE, not a stack: being greyed twice is being greyed. */
export function applyCondition(character, cond, { day = 0 } = {}) {
  if (!character || !cond?.id) return null;
  const list = character.conditions || (character.conditions = []);
  const had = list.find(c => c.id === cond.id);
  if (had) {
    // the worse of the two magnitudes stands, and persistence is contagious: once a condition is the kind
    // that needs mending, a second lighter application does not make it sleep-offable again.
    had.magnitude = Math.max(num(had.magnitude, 0), num(cond.magnitude, 0));
    if (cond.persistUntilHealed) had.persistUntilHealed = true;
    return had;
  }
  const rec = { sinceDay: day, ...cond };
  list.push(rec);
  return rec;
}

/** ⛔ WHAT A REST CAN AND CANNOT TOUCH. Returns `{ cleared, persisted }` — and `persisted` is the point:
 *  the caller can tell the player *why* they woke up still broken, which is the difference between a rule
 *  and a mystery. */
export function clearOnRest(character, { kind = "sleep" } = {}) {
  const list = character?.conditions || [];
  const cleared = [], persisted = [];
  character.conditions = list.filter(c => {
    if (c.persistUntilHealed) { persisted.push(c); return true; }
    // ⚠️ A BREATHER IS NOT A NIGHT. An hour off your feet does not clear a condition a night would; only
    // a real rest does. Without this, "take a breather" becomes a universal cure with a smaller number.
    if (kind === "breather" && c.kind !== "momentary") { persisted.push(c); return true; }
    cleared.push(c); return false;
  });
  return { cleared, persisted };
}

/** ⛔ AND THIS IS THE OTHER HALF OF THE CLOCK. A heal clears what rest could not — by id, because a mend
 *  answers a particular wrong and not everything at once. */
export function clearOnHeal(character, ids = null) {
  const list = character?.conditions || [];
  const want = ids == null ? null : new Set(Array.isArray(ids) ? ids : [ids]);
  const cleared = [];
  character.conditions = list.filter(c => {
    if (want && !want.has(c.id)) return true;
    cleared.push(c); return false;
  });
  return { cleared };
}

/** Everything standing, and the ones a night will not fix — the shape a sheet or a receipt wants. */
export function activeConditions(character) {
  const list = character?.conditions || [];
  return { all: list, needMending: list.filter(c => c.persistUntilHealed) };
}

/** The ANTISOAK a target is carrying, summed — what `antisoakLanded` reads off the sheet. ⚠️ Summed rather
 *  than max'd on purpose: two different crafts each opening a different weakness is worse than one. */
export function antisoakOn(character) {
  return (character?.conditions || [])
    .filter(c => c.kind === "antisoak")
    .reduce((t, c) => t + Math.max(0, num(c.magnitude, 0)), 0);
}
