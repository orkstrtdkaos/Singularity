// places.js — location permanence. Each place remembers what happened there:
// durable changes, things left behind, discoveries, visit history. The GM proposes
// typed placeUpdates for changes that should OUTLIVE the scene; the engine stores
// them per-location and feeds them back on every return visit.

const CAPS = { notes: 12, flags: 10 };

export function notePlaceVisit(character, locationId, day = null) {
  character.placeMemory = character.placeMemory || {};
  const p = character.placeMemory[locationId] || (character.placeMemory[locationId] = { visits: 0, notes: [], flags: {} });
  p.visits += 1;
  p.lastVisit = day;
  return p;
}

export function applyPlaceUpdates(character, locationId, updates = [], ctx = {}) {
  character.placeMemory = character.placeMemory || {};
  const p = character.placeMemory[locationId] || (character.placeMemory[locationId] = { visits: 1, notes: [], flags: {} });
  for (const u of (updates || []).slice(0, 4)) {
    if (u.note) {
      const note = `[d${ctx.day ?? "?"}] ${String(u.note).slice(0, 200)}`;
      if (!p.notes.includes(note)) p.notes = [...p.notes, note].slice(-CAPS.notes);
    }
    if (u.flag && typeof u.flag === "object") {
      for (const [k, v] of Object.entries(u.flag).slice(0, 2)) {
        if (Object.keys(p.flags).length < CAPS.flags || k in p.flags) {
          p.flags[String(k).slice(0, 40)] = typeof v === "boolean" ? v : String(v).slice(0, 80);
        }
      }
    }
  }
  return p;
}

/** History block for the GM on arrival/each turn: what THIS character knows
 *  changed here. The GM must honor these as established fact. */
export function placeMemoryForGM(character, locationId) {
  const p = character.placeMemory?.[locationId];
  if (!p || (!p.notes.length && !Object.keys(p.flags).length && p.visits <= 1)) return null;
  const parts = [`Visits: ${p.visits}${p.lastVisit != null ? ` (last: day ${p.lastVisit})` : ""}`];
  if (p.notes.length) parts.push(`Durable changes & discoveries:\n${p.notes.map(n => `  - ${n}`).join("\n")}`);
  const flags = Object.entries(p.flags);
  if (flags.length) parts.push(`Standing facts: ${flags.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  return parts.join("\n");
}
