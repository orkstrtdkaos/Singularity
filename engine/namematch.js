// namematch.js — the shared SNG-019 name-resolution primitive. Extracted so codex,
// quests, and inventory all resolve entities the SAME way without a circular import
// (codex imports slugify from quests, so quests can't import back from codex). No deps.

/** SNG-076: clamp MODEL output on a WORD BOUNDARY with a real ellipsis — never mid-word, never
 *  losing a word's tail like `slice()` does. AUTHORED content is never clamped (it is finite and
 *  meant to be read); this exists only to bound untrusted model strings, and generously. */
export function smartClamp(text, max = 600) {
  const s = String(text ?? "");
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
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
