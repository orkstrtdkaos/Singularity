// facts.js — SNG-012 Part B: a durable, NON-SCROLLING ledger of load-bearing
// facts (a rescue, a death, a promise, a relocation, a major change). Unlike the
// chronicle (windowed to the last N beats), the whole active ledger is fed to
// the GM every turn as authoritative, persistent truth it must never contradict.
// Engine-owned: the GM emits typed factUpdates ops; the engine clamps and stores.

import { smartClamp } from "./namematch.js"; // SNG-152

const CAP = 40;

export function ensureFacts(character) {
  if (!character.establishedFacts) character.establishedFacts = [];
  return character;
}

/** Apply GM factUpdates ops. op "add" pins a fact; op "resolve" retires one
 *  (matched by id or fuzzy text). Clamped and deduped. Returns notes. */
export function applyFactUpdates(character, updates = [], ctx = {}) {
  ensureFacts(character);
  const notes = [];
  for (const u of (updates || []).slice(0, 5)) {
    if (u.op === "resolve") {
      const before = character.establishedFacts.length;
      const key = (u.subjectId || u.text || "").toLowerCase().slice(0, 40);
      character.establishedFacts = character.establishedFacts.filter(f =>
        !(f.id === u.subjectId || (key && f.text.toLowerCase().includes(key))));
      if (character.establishedFacts.length < before) notes.push("fact resolved");
      continue;
    }
    // default: add
    const text = smartClamp(String(u.text || "").trim(), 300); // SNG-152: authoritative truth fed every turn — never severed mid-word
    if (!text) continue;
    const norm = text.toLowerCase();
    if (character.establishedFacts.some(f => f.text.toLowerCase() === norm)) continue;
    character.establishedFacts.push({
      id: u.subjectId ? String(u.subjectId).slice(0, 40) : "f" + (character.establishedFacts.length + 1),
      text,
      day: ctx.day ?? null,
      subjectId: u.subjectId ? String(u.subjectId).slice(0, 40) : null
    });
    notes.push(`established: ${text}`);
  }
  // SNG-334 — ⛔ THE STORE IS UNBOUNDED NOW. Erik: "it seems good that we want the ability to reach any TRUE
  // thing, but what gets sent each turn needs a reasonable cap."
  //
  // This used to `slice(-CAP)` at 40, silently dropping the OLDEST CANON THE GM EVER ESTABLISHED — so a long
  // game could contradict itself about its own early events and nothing would report it. Same bug as
  // `knownPlaces`, in a second place: a cap on a LOG is housekeeping; a cap on WHAT IS TRUE is amnesia.
  //
  // The cost the cap was paying for is real — these are rendered into the prompt every turn — but it belongs
  // to the VIEW, not the store. Nothing is forgotten; `factsForGM` decides what gets said.
  return notes;
}

/** SNG-334 — THE VIEW, WHICH IS WHERE THE CAP BELONGS.
 *
 *  The store never forgets; this decides what is worth the prompt's room THIS TURN. Two rules, in order:
 *
 *   1. ⛔ PINNED FACTS ARE ALWAYS SENT. A tie to a person — "my player's mother", "Pell's father" — is not a
 *      fact that ages out. Erik asked for exactly those to be saved as facts, and a fact you cannot rely on
 *      being told is not saved in any sense that matters.
 *   2. Then the most recent, up to the budget. Recency is the right default for the rest because the GM is
 *      being reminded rather than taught — and nothing here is lost, only unsaid.
 *
 *  ⚠️ IT SAYS HOW MUCH IT LEFT OUT. A silently-windowed view reads exactly like a complete one, which is how
 *  a GM comes to believe the ledger is short. Naming the remainder keeps "what is true" and "what I was told
 *  this turn" as separate claims. */
export function factsForGM(character, budget = CAP) {
  const facts = character.establishedFacts || [];
  if (!facts.length) return null;
  const pinned = facts.filter(f => f?.pinned);
  const rest = facts.filter(f => !f?.pinned);
  const room = Math.max(0, budget - pinned.length);
  const shown = [...pinned, ...rest.slice(-room)];
  const hidden = facts.length - shown.length;
  const line = f => `- ${f.text}${f.day != null ? ` (day ${f.day})` : ""}`;
  return shown.map(line).join("\n") + (hidden > 0
    ? `\n- (…and ${hidden} more you established earlier — still true; ask if it matters)` : "");
}

/** ⛔ A FACT THAT NAMES A RELATIONSHIP IS PINNED. Erik: "ones that tie to people should be saved as facts —
 *  like my player's mother, or Pell's father." Kin do not age out of what the GM is told. */
export function pinFact(character, text, ctx = {}) {
  ensureFacts(character);
  const t = smartClamp(String(text || ""), 300);
  if (!t) return null;
  const existing = character.establishedFacts.find(f => f.text === t);
  if (existing) { existing.pinned = true; return existing; }
  const rec = { text: t, day: ctx.day ?? null, subjectId: ctx.subjectId ? String(ctx.subjectId).slice(0, 40) : null, pinned: true };
  character.establishedFacts.push(rec);
  return rec;
}
