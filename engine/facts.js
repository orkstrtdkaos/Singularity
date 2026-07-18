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
  // keep the newest CAP; the ledger never drops on a fixed window like the chronicle
  if (character.establishedFacts.length > CAP) {
    character.establishedFacts = character.establishedFacts.slice(-CAP);
  }
  return notes;
}

/** The full active ledger for the GM — fed every turn, never windowed. */
export function factsForGM(character) {
  const facts = character.establishedFacts || [];
  if (!facts.length) return null;
  return facts.map(f => `- ${f.text}${f.day != null ? ` (day ${f.day})` : ""}`).join("\n");
}
