// names.js — SNG-182. One name, one home. Everything else resolves it.
//
// Erik: "a variable being called so that it pulls the name once it knows the ID, that way you don't
// have to update a shit ton of prose… most of our entire game here would benefit from using
// functions and variables such as this."
//
// The renames exposed it; the defect is general. IDS ARE STABLE AND NAMES ARE NOT, and every place
// prose spells a name instead of resolving it is a copy that will drift. Measured before building:
// **57 ad-hoc "look the record up by id, take .name, fall back to the id" sites** across app.js and
// engine/ — 52 of them for traditions alone, and the region lookup written out twice verbatim. There
// was no resolver; there were fifty-seven of them.
//
// ANSWERING THE PO'S Q3 — resolution belongs at RENDER/ASSEMBLY, not at content load. Load is
// simpler, but SNG-111's progressive naming is PER-CHARACTER: the same NPC id is "the dock-master"
// to someone who has not learned the name and "Sorel" to someone who has. Baking a name at load
// throws that away permanently. Assembly also happens to be exactly where §2.5 needs it — the model
// is handed resolved names and never sees a token.
//
// NOT a template language (§4). Name resolution only. The moment it grows conditionals it becomes a
// second program nobody can test.

const KINDS = ["loc", "region", "npc", "tradition", "item", "ability"];

/** Where each kind's records live in the CONTENT bag, and how to read a name off one. Kept as data
 *  so adding a kind is a row, not a branch. */
const SOURCES = {
  loc: (c) => c?.locations || {},
  region: (c) => Object.fromEntries((c?.regions || []).map(r => [r.regionId || r.id, r])),
  npc: (c) => c?.npcs || {},
  tradition: (c) => c?.traditionIndex?.byId || {},
  item: (c) => c?.items || {},
  ability: (c) => c?.abilities || {}
};

/** The display name for one id. Returns null when the id resolves to nothing — the caller decides
 *  whether that is a loud failure (authored prose) or a quiet fallback (a generated reference). */
export function nameOf(kind, id, content = {}, opts = {}) {
  if (!KINDS.includes(kind) || !id) return null;
  const rec = SOURCES[kind](content)[id];
  if (!rec) return null;
  // SNG-111: a per-character override — what THIS character calls them, if they have learned it.
  // This is why resolution cannot happen at load time.
  const known = opts.character?.npcRegistry?.[id];
  if (kind === "npc" && known && !known.nameUnknown && known.name) return known.name;
  return rec.name || rec.label || null;
}

const TOKEN = /\{\{\s*(\w+)\s*:\s*([\w.-]+)\s*\}\}/g;

/** Replace every `{{kind:id}}` token in a string with the current display name.
 *
 *  An unresolvable token is the `loreRefs` lesson applied in advance: `.filter(Boolean)` swallowed
 *  every miss there and 84 of 95 locations delivered nothing for months. So a miss is NEVER silently
 *  blanked and NEVER shown raw to a player — it is reported to `onMissing` (CI fails on it) and, at
 *  runtime, degrades to the id in a readable form so the sentence still means something.
 */
export function renderNames(text, content = {}, opts = {}) {
  if (typeof text !== "string" || !text.includes("{{")) return text;
  const onMissing = typeof opts.onMissing === "function" ? opts.onMissing : null;
  return text.replace(TOKEN, (raw, kind, id) => {
    const name = nameOf(kind, id, content, opts);
    if (name) return name;
    if (onMissing) onMissing({ kind, id, raw });
    // readable degradation — never the raw token, never an empty hole
    return String(id).replace(/_/g, " ");
  });
}

/** Every token in a string, for CI and for tooling. Pure. */
export function tokensIn(text) {
  const out = [];
  if (typeof text !== "string") return out;
  for (const m of text.matchAll(TOKEN)) out.push({ kind: m[1], id: m[2], raw: m[0] });
  return out;
}

/** Walk any authored structure and collect its tokens with a path, so a CI failure can say WHERE. */
export function collectTokens(value, path = "") {
  const out = [];
  if (typeof value === "string") { for (const t of tokensIn(value)) out.push({ ...t, path }); return out; }
  if (Array.isArray(value)) { value.forEach((v, i) => out.push(...collectTokens(v, `${path}[${i}]`))); return out; }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) out.push(...collectTokens(v, path ? `${path}.${k}` : k));
  }
  return out;
}

/** Resolve every string in a structure. Used at prompt assembly so the model is handed names and
 *  never token syntax (§2.5), and by any render surface that shows authored prose. */
export function renderNamesDeep(value, content = {}, opts = {}) {
  if (typeof value === "string") return renderNames(value, content, opts);
  if (Array.isArray(value)) return value.map(v => renderNamesDeep(v, content, opts));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = renderNamesDeep(v, content, opts);
    return out;
  }
  return value;
}

export const NAME_KINDS = KINDS;
