// namematch.js — the shared SNG-019 name-resolution primitive. Extracted so codex,
// quests, and inventory all resolve entities the SAME way without a circular import
// (codex imports slugify from quests, so quests can't import back from codex). No deps.

/** SNG-076: clamp MODEL output on a WORD BOUNDARY with a real ellipsis — never mid-word, never
 *  losing a word's tail like `slice()` does. AUTHORED content is never clamped (it is finite and
 *  meant to be read); this exists only to bound untrusted model strings, and generously. */
/** ⛔ Aevi 2026-09-11 (BUG_authoring_markup_in_player_text): her PO emphasis glyphs (⛔ ⚠️ ⚑ ⛑ ⬜ ✅ ➡️) are a convention for
 *  Erik and CCode, and 438 crafts carried them into what a player reads. Every craft-prose surface passes through this.
 *  GLYPHS ONLY — the shouted capitals often carry a line's weight, and rewriting them is hers, not a regex's. */
export const AUTHORING_GLYPHS = /[⛔⚠⚑⛑⬜✅➡❌]\uFE0F? ?/gu;
export function playerText(text) {
  return String(text ?? "").replace(AUTHORING_GLYPHS, "").replace(/ {2,}/g, " ").trim();
}

export function smartClamp(text, max = 600) {
  const s = String(text ?? "");
  if (s.length <= max) return s;
  // SNG-152: `max` is a HARD ceiling on the RETURNED string — the ellipsis is reserved for, not
  // appended past it. (It previously returned up to max+1, so every caller that believed "clamp to
  // N" — a storage cap, a prompt budget, a layout width — was quietly off by one. With ~20 call
  // sites routing through here, the bound has to mean what it says.)
  const room = Math.max(1, max - 1);
  const cut = s.slice(0, room);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > room * 0.6 ? cut.slice(0, lastSpace) : cut;
  return body.replace(/[\s,;:.!?—-]+$/, "") + "…";
}

/** Normalize a name for matching: lowercase, strip punctuation + a leading article. */
export function normName(s) {
  return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()
    .replace(/^(the|a|an) /, "");
}

/** Conservative name match: normalized equality, or whole-word containment where the
 *  contained name is substantial (>=4 chars) — "Teva" matches "Teva the healer",
 *  never "va", and "Mara" never matches "Maren". */
export function namesMatch(a, b) {
  const na = normName(a), nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const [short, long] = na.length <= nb.length ? [na, nb] : [nb, na];
  if (short.length < 4) return false;
  return new RegExp(`(^| )${short.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`).test(long);
}

/** Resolve a raw name to an entry in `list`, using each entry's label + aliases.
 *  getLabel/getAliases pull those fields; returns the matching entry or null. */
export function resolveByName(raw, list, { getLabel = e => e.name, getAliases = e => e.aliases || [] } = {}) {
  if (!raw) return null;
  for (const e of list) {
    if (namesMatch(getLabel(e), raw)) return e;
    if (getAliases(e).some(a => namesMatch(a, raw))) return e;
  }
  return null;
}

/** SNG-166 §3: THE GIVEN NAME, and who has already met one.
 *
 *  There is no naming system — zero hits for nameSeed / namePool / generateName / nameBank anywhere
 *  in the engine or content. So generated people are named by the model with no memory of who it has
 *  named before, and the result is what Erik reported: he keeps meeting Mara.
 *
 *  THE MEASUREMENT SETTLES WHERE THE GUARD BELONGS. Across the 10 characters on this device: 52
 *  distinct given names, and 6 of them met by more than one character — Mara by FOUR. Within any one
 *  save there is exactly one Mara, so a per-character repetition check would read GREEN forever.
 *  It has to count across the device, which is the PO's own correction to the spec.
 */
export function givenName(full) {
  const first = String(full || "").trim().split(/[\s,(—–-]+/)[0] || "";
  return normName(first);
}

/** ⛔ CCODE-400 (Erik) — "When the GM narrates first name only, but the context tells you who it is fully, there should still be an
 *  underline." ⚑ MEASURED across the 16 saves: 1,184 people are in the click index and 1,160 of them are known by a multi-word name —
 *  "Halvex Coil, the Rewriter", "Vessin Tallow-bark" — so a narrator writing *Halvex* or *Vessin* wrote a name the index does not hold.
 *
 *  ⚠️ THIS IS NOT `givenName`, WHICH TAKES THE FIRST WORD AND IS RIGHT TO. A LINK is a claim that a word IS somebody, and three classes
 *  of first word are not names — the measurement found all three rather than my guessing at them:
 *    · an HONORIFIC: "Sister Alder" and "Overseer Grael" are Alder and Grael, so the honorific is stepped over, not linked.
 *    · what is left may be a CONNECTIVE — "Seeker of the Lost Chord" has no given name at all, and gets no alias.
 *    · a LOWERCASE word is not a name: "Unknown (east bank traveler)" would otherwise have handed a link to the word *east*.
 *  ⛔ And a single-word name needs no alias: it is already the whole name. Returns "" when there is nothing safe to link. Pure. */
// ⚠️ AN ARTICLE IS NOT AN HONORIFIC, and my own gate caught me treating it as one: stepping over "the" in "the Starless One" produced
// *Starless*, which is half an epithet and not a name anybody is called. A name that OPENS with an article is an epithet all the way
// through — "The Unravelled Mind", "The Starless One" — and has no first name inside it to offer.
const ALIAS_EPITHET_OPENER = new Set(["the", "a", "an", "unknown", "someone", "somebody"]);
const ALIAS_HONORIFIC = new Set(["sister", "brother", "elder", "overseer", "warden", "keeper", "master", "mistress",
                                 "seeker", "lady", "lord", "sir", "captain", "old", "young"]);
const ALIAS_CONNECTIVE = new Set(["of", "the", "who", "whom", "she", "he", "they", "that", "and", "in", "at", "from", "which", "with"]);
export function givenNameAlias(full) {
  const words = String(full || "").trim().split(/[\s,(—–-]+/).filter(Boolean);
  if (ALIAS_EPITHET_OPENER.has((words[0] || "").toLowerCase())) return "";
  let i = 0;
  while (i < words.length && ALIAS_HONORIFIC.has(words[i].toLowerCase())) i++;
  const w = words[i] || "";
  if (words.length <= i + 1) return "";                    // nothing after it: the whole name, not an alias
  if (w.length < 4) return "";                             // a short word matches too much ordinary prose
  if (ALIAS_CONNECTIVE.has(w.toLowerCase())) return "";
  if (w[0] !== w[0].toUpperCase() || w[0] === w[0].toLowerCase()) return "";   // a name is capitalised where a narrator writes it
  return w;
}

/** Every given name any character on this device has already met. Pure over the saves passed in —
 *  the caller supplies them, so this stays testable and storage-agnostic. */
export function usedGivenNames(characters = []) {
  const seen = new Map();   // name -> Set(characterName)
  for (const c of characters) {
    if (!c) continue;
    const who = c.name || c.id || "?";
    for (const n of Object.values(c.npcRegistry || {})) {
      const g = givenName(n?.name);
      if (g.length > 2 && g !== "unknown") (seen.get(g) || seen.set(g, new Set()).get(g)).add(who);
    }
  }
  return seen;
}

/** The names a newly-minted person must not be given, strongest-avoid first. A name already met by
 *  SEVERAL characters is the one that most breaks the world's size, so it sorts first — if the list
 *  has to be truncated for the prompt, the worst offenders survive the cut. */
export function namesToAvoid(characters = [], limit = 24) {
  return [...usedGivenNames(characters).entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, limit)
    .map(([name]) => name);
}
