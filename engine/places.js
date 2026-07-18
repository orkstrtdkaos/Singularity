// places.js — location permanence. Each place remembers what happened there:
// durable changes, things left behind, discoveries, visit history. The GM proposes
// typed placeUpdates for changes that should OUTLIVE the scene; the engine stores
// them per-location and feeds them back on every return visit.

import { smartClamp } from "./namematch.js"; // SNG-152

const CAPS = { notes: 12, flags: 10 };

/** SNG-152/154: a sub-place's IDENTITY slug, derived from the FULL name — never
 *  from a truncated one (two long names sharing a 40-char prefix used to collapse
 *  into one record). A very long slug is bounded, but distinctness is preserved by
 *  a deterministic hash suffix of the full name — same name, same slug, forever. */
export function subPlaceSlug(fullName) { // registry:internal
  let slug = String(fullName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (slug.length > 60) {
    let h = 0;
    for (let i = 0; i < fullName.length; i++) h = (h * 31 + fullName.charCodeAt(i)) >>> 0;
    slug = slug.slice(0, 52).replace(/-$/, "") + "-" + h.toString(36);
  }
  return slug;
}

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
      const note = `[d${ctx.day ?? "?"}] ${smartClamp(String(u.note), 300)}`; // SNG-152
      if (!p.notes.includes(note)) p.notes = [...p.notes, note].slice(-CAPS.notes);
    }
    if (u.subPlace && (u.subPlace.name || typeof u.subPlace === "string")) {
      // SNG-152/154: IDENTITY comes from the FULL name — deriving the slug from a
      // truncated name made two long names collapse into one record (truncation was
      // MANUFACTURING duplicate places). Display name clamps on a word boundary;
      // an over-long slug keeps distinctness via a deterministic hash suffix.
      const fullName = String(u.subPlace.name || u.subPlace);
      const name = smartClamp(fullName, 120);
      const slug = subPlaceSlug(fullName);
      p.subPlaces = p.subPlaces || {};
      if (p.subPlaces[slug] || Object.keys(p.subPlaces).length < 12) {
        const prev = p.subPlaces[slug] || {};
        p.subPlaces[slug] = {
          name: prev.name || name,
          day: prev.day ?? ctx.day ?? null,
          visited: prev.visited || u.subPlace.visited !== false,
          note: u.subPlace.note ? smartClamp(String(u.subPlace.note), 200) : prev.note || "" // SNG-152
        };
      }
    }
    if (u.flag && typeof u.flag === "object") {
      for (const [k, v] of Object.entries(u.flag).slice(0, 2)) {
        if (Object.keys(p.flags).length < CAPS.flags || k in p.flags) {
          p.flags[String(k).slice(0, 40)] = typeof v === "boolean" ? v : smartClamp(String(v), 120); // SNG-152
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
  if (!p || (!p.notes.length && !Object.keys(p.flags).length && !Object.keys(p.subPlaces || {}).length && p.visits <= 1)) return null;
  const parts = [`Visits: ${p.visits}${p.lastVisit != null ? ` (last: day ${p.lastVisit})` : ""}`];
  if (p.notes.length) parts.push(`Durable changes & discoveries:\n${p.notes.map(n => `  - ${n}`).join("\n")}`);
  const flags = Object.entries(p.flags);
  if (flags.length) parts.push(`Standing facts: ${flags.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  const subs = Object.values(p.subPlaces || {});
  if (subs.length) parts.push(`Known places within: ${subs.map(sp => `${sp.name}${sp.visited ? "" : " (heard of only)"}${sp.note ? ` — ${sp.note}` : ""}`).join("; ")}`);
  return parts.join("\n");
}
