// places.js — location permanence. Each place remembers what happened there:
// durable changes, things left behind, discoveries, visit history. The GM proposes
// typed placeUpdates for changes that should OUTLIVE the scene; the engine stores
// them per-location and feeds them back on every return visit.

import { smartClamp, normName } from "./namematch.js"; // SNG-152 + SNG-176

// SNG-154: the sub-place cap was an inline 12. It is load-bearing (unbounded interiors would grow
// the save the way unbounded scene history did in CCODE-02), so it stays a cap — but it is named
// here, and raised: a real interior tier nests (Millbrook → the Edge District → the Inn → a booth)
// and Millbrook was ALREADY at 12 with the truncation bug hiding collisions behind shared slugs.
const CAPS = { notes: 12, flags: 10, subPlaces: 24 };

/** SNG-152/154: a sub-place's IDENTITY slug, derived from the FULL name — never
 *  from a truncated one (two long names sharing a 40-char prefix used to collapse
 *  into one record). A very long slug is bounded, but distinctness is preserved by
 *  a deterministic hash suffix of the full name — same name, same slug, forever. */
export function subPlaceSlug(fullName) { // registry:internal
  let slug = String(fullName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (slug.length > 60) {
    let h = 0;
    for (let i = 0; i < fullName.length; i++) h = (h * 31 + fullName.charCodeAt(i)) >>> 0;
    slug = slug.slice(0, 52).replace(/-$/, "") + "-" + h.toString(36);
  }
  return slug;
}

/** SNG-154. Find the place a name is a SUB-PLACE of, anywhere in placeMemory. This is what makes
 *  promotion parent-preserving: when the GM turns "the Low Lamp Inn" from a room inside the Edge
 *  District into a location of its own, the new location must remember it is still IN the Edge
 *  District. Returns { parentId, slug } or null. Pure. */
export function findSubPlaceParent(character, nameOrSlug) {
  const want = subPlaceSlug(String(nameOrSlug || ""));
  if (!want) return null;
  for (const [locId, p] of Object.entries(character?.placeMemory || {})) {
    const subs = p?.subPlaces || {};
    if (subs[want]) return { parentId: subs[want].parentId || locId, slug: want };
    for (const [slug, sp] of Object.entries(subs)) {
      if (subPlaceSlug(sp?.name || "") === want) return { parentId: sp.parentId || locId, slug };
    }
  }
  return null;
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
  const notes = []; // SNG-154: containment corrections, surfaced never silent
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
      // SNG-154 CONTAINMENT: a sub-place belongs to a place, and until now that was inferred
      // per-write from wherever the engine last believed the character was standing — which is how
      // the back booth (inside the Low Lamp Inn) got filed under the Old Switchback, and how four
      // cooperage places landed inside the Inn. The GM may now NAME the parent; a named parent that
      // isn't where we think we are means a moveTo was missed, so we honour the fiction and record
      // it under the named place, flagging it rather than silently trusting the stale location.
      const named = u.subPlace.parent ? String(u.subPlace.parent) : null;
      const namedId = named ? (ctx.resolveLocationId ? ctx.resolveLocationId(named, ctx.locations || {}) : null) : null;
      const mismatched = !!(named && namedId && namedId !== locationId);
      const host = mismatched
        ? (character.placeMemory[namedId] || (character.placeMemory[namedId] = { visits: 1, notes: [], flags: {} }))
        : p;
      const hostId = mismatched ? namedId : locationId;
      host.subPlaces = host.subPlaces || {};
      if (host.subPlaces[slug] || Object.keys(host.subPlaces).length < CAPS.subPlaces) {
        const prev = host.subPlaces[slug] || {};
        host.subPlaces[slug] = {
          name: prev.name || name,
          parentId: hostId,                       // EXPLICIT containment — never re-inferred
          day: prev.day ?? ctx.day ?? null,
          visited: prev.visited || u.subPlace.visited !== false,
          note: u.subPlace.note ? smartClamp(String(u.subPlace.note), 200) : prev.note || "", // SNG-152
          ...(named && !namedId ? { parentUnresolved: smartClamp(named, 60) } : {}) // named a place we don't know — keep the claim
        };
        if (mismatched) notes.push(`"${name}" was placed in ${namedId} (the fiction named it), not ${locationId}`);
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
  if (notes.length) p._containmentNotes = notes.slice(-4);
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

/** SNG-176: RECALL — the places the player's own words name, found anywhere in the save.
 *
 *  Erik asked where his mother's house was and the GM had nothing. The record almost certainly
 *  existed; it was simply out of scope from wherever he was standing. Every world block the GM gets
 *  is keyed to the CURRENT location, and present-location scoping is exactly wrong for memory — a
 *  mother's house, a hometown, a grave are precisely the places you are NOT standing in when you
 *  speak of them.
 *
 *  This is SELECTION, not volume (§3): the question says which records matter, so the block stays
 *  small. Deterministic name matching, no model call — `namematch` already resolves entities the
 *  same way everywhere, and a Haiku round-trip would add latency to buy worse recall.
 *
 *  Searches locations, their sub-places, and the character's place memory. Known places return with
 *  their remembered detail; a place the player NAMES that is REAL but unvisited returns marked
 *  route-unknown (RUNNING_FIXES A5), so the GM confirms it exists rather than denying authored content.
 *  Returns [] when the turn names nothing.
 */
export function recallPlaces(character, text, { locations = {}, limit = 3, isKnown = null } = {}) {
  const words = String(text || "").trim();
  if (words.length < 3) return [];
  const known = typeof isKnown === "function" ? isKnown : (() => true);
  const knownHits = [], subHits = [], farHits = [];
  const seen = new Set();

  // A phrase matches a record when the record's NAME appears in what the player said. Matching the
  // other way round would let a two-word place name swallow the sentence.
  const mentions = (name) => {
    const n = normName(name);
    if (!n || n.length < 4) return false;
    return normName(words).includes(n);
  };

  for (const [locId, loc] of Object.entries(locations)) {
    if (!loc?.name || seen.has(locId) || !mentions(loc.name)) continue;
    seen.add(locId);
    const mem = character?.placeMemory?.[locId];
    if (mem || known(locId)) {
      knownHits.push({ key: locId, kind: "location", name: loc.name, locationId: locId, known: true,
        detail: placeMemoryForGM(character, locId) || (mem ? null : "heard of, never visited") });
    } else {
      // RUNNING_FIXES A5: the player NAMED a place that EXISTS in the atlas but this character has not
      // been to. Whether they KNOW of it is a different question from whether it is REAL — and the two
      // were collapsed, so the GM answered "not in the world" for authored, manifested, connected
      // locations (The Blocklands). Surface it as real-but-route-unknown so the GM confirms it exists
      // and says the way is not yet known — never denies authored content the player already paid for.
      farHits.push({ key: locId, kind: "location", name: loc.name, locationId: locId, known: false, detail: null });
    }
  }

  for (const [locId, p] of Object.entries(character?.placeMemory || {})) {
    for (const sp of Object.values(p?.subPlaces || {})) {
      if (!sp?.name || !mentions(sp.name)) continue;
      const key = `${sp.parentId || locId}/${subPlaceSlug(sp.name)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const parentId = sp.parentId || locId;
      const parent = locations[parentId];
      subHits.push({ key, kind: "sub-place", name: sp.name, locationId: parentId, known: true,
        detail: `within ${parent?.name || parentId}${sp.visited ? "" : " (heard of only)"}${sp.note ? ` — ${sp.note}` : ""}` });
    }
  }
  // Known places (richer detail) and named sub-places first, then the real-but-unknown named places —
  // so a far place the player mentioned never crowds out somewhere they actually remember.
  return [...knownHits, ...subHits, ...farHits].slice(0, limit);
}

/** Render recalled places for the GM prompt. Empty string when the turn named nothing — a block
 *  that costs nothing on the turns that ask nothing is what makes §3's budget work. Places the
 *  character KNOWS render with their detail; places the player NAMED that are REAL but unvisited
 *  (RUNNING_FIXES A5) render under an explicit instruction so the GM confirms they exist and says the
 *  way is unknown — absence from the character's memory is never rendered as absence from the world. */
export function recallForGM(character, text, opts = {}) {
  const hits = recallPlaces(character, text, opts);
  if (!hits.length) return "";
  const lines = [];
  for (const h of hits.filter(h => h.known !== false)) lines.push(`- ${h.name} (${h.kind}): ${h.detail || "known of, nothing recorded yet"}`);
  const far = hits.filter(h => h.known === false);
  if (far.length) {
    lines.push(`NAMED BY THE PLAYER — REAL PLACES THIS CHARACTER HAS NOT BEEN TO. These EXIST in the world; the character does not know the way. Confirm each is real and that the route is not yet known (offer to seek it) — NEVER say it does not exist or is "not a named location":`);
    for (const h of far) lines.push(`- ${h.name}`);
  }
  return lines.join("\n");
}
