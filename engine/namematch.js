// namematch.js — the shared SNG-019 name-resolution primitive. Extracted so codex,
// quests, and inventory all resolve entities the SAME way without a circular import
// (codex imports slugify from quests, so quests can't import back from codex). No deps.

/** SNG-076: clamp MODEL output on a WORD BOUNDARY with a real ellipsis — never mid-word, never
 *  losing a word's tail like `slice()` does. AUTHORED content is never clamped (it is finite and
 *  meant to be read); this exists only to bound untrusted model strings, and generously. */
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

/** How often a given name has been reused ACROSS characters — the number the ratchet watches. */
export function nameRepetitionCount(characters = []) {
  let repeats = 0;
  for (const [, who] of usedGivenNames(characters)) if (who.size > 1) repeats++;
  return repeats;
}
