// scripts/version_rule.mjs — ⛔ CCODE-438: THE RULE THE VERSION NUMBER FOLLOWS, where the script that applies it and the suite that
// checks it can both read it.
//
// Erik 2026-09-19: "so far we just keep racking up the smallest increment. Set something that will tell us when we go to 2.1.0 and
// 3.0.0 etc as the rule that we can follow." ⚠️ The last rule (SPEC §25.7) was prose that named its own trigger and no script could
// read, which is how 1.8.x ran to ~180 point releases and 2.0.x to 100. So this one is code.
//
//   PATCH  x.y.Z  every update.
//   MINOR  x.Y.0  the update that brings the FIFTH new feature since the minor last moved (`rule.minorAt` in release_notes.json).
//                 The x.y.0 release's own features are the ones that made it, so the count starts again after it.
//   MAJOR  X.0.0  only by Erik's call, for a change that makes the game a different game for someone already playing — a save that
//                 cannot carry forward, a change to how every roll, fight or advance works, or a new era of the world. The script
//                 refuses a major without the reason in words.

export const KINDS = ["feature", "fix", "change", "internal"];

/** "2.1.3" → [2, 1, 3]; anything else → null. Pure. */
export function parseVersion(v) {
  const m = String(v || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? m.slice(1).map(Number) : null;
}

/** −1, 0 or 1, by major, then minor, then patch. An unparseable version sorts first. Pure. */
export function cmpVersion(a, b) {
  const x = parseVersion(a), y = parseVersion(b);
  if (!x || !y) return !x && !y ? 0 : !x ? -1 : 1;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}

/** How many new features have landed since the minor last moved — the releases after x.y.0 in this line, plus the ones waiting. Pure. */
export function featuresSinceMinor(current, notes) {
  const cur = parseVersion(current);
  if (!cur) return 0;
  const [maj, min] = cur;
  const since = (Array.isArray(notes?.releases) ? notes.releases : []).filter(r => {
    const v = parseVersion(r?.version);
    return v && v[0] === maj && v[1] === min && v[2] > 0;
  });
  const waiting = Array.isArray(notes?.next) ? notes.next : [];
  return [...since.flatMap(r => Array.isArray(r.entries) ? r.entries : []), ...waiting].filter(e => e && e.kind === "feature").length;
}

/** ⛔ THE RULE. → { kind, version, features, minorAt, why } — or { error }. Pure. */
export function decideBump(current, notes, { major = null } = {}) {
  const cur = parseVersion(current);
  if (!cur) return { error: `"${current}" is not a MAJOR.MINOR.PATCH version` };
  const [maj, min, pat] = cur;
  const minorAt = Math.max(1, Number(notes?.rule?.minorAt) || 5);
  if (major != null) {
    const why = String(major).trim();
    if (!why) return { error: "a major is Erik's call, for a change that makes the game a different game — say why: --major \"<why>\"" };
    return { kind: "major", version: `${maj + 1}.0.0`, features: 0, minorAt, why };
  }
  const features = featuresSinceMinor(current, notes);
  if (features >= minorAt) return { kind: "minor", version: `${maj}.${min + 1}.0`, features, minorAt, why: `${features} new features since ${maj}.${min}.0 — the minor moves` };
  return { kind: "patch", version: `${maj}.${min}.${pat + 1}`, features, minorAt, why: `${features} of ${minorAt} new features toward ${maj}.${min + 1}.0` };
}

/** Is a notes entry fit for a player to read? — a known kind, a title and a summary, and no ticket number anywhere in what is shown. Pure. */
export function entryProblem(e) {
  if (!e || typeof e !== "object") return "not an entry";
  if (!KINDS.includes(e.kind)) return `unknown kind "${e.kind}"`;
  if (!String(e.title || "").trim()) return "no title";
  if (e.kind !== "internal" && !String(e.summary || "").trim()) return `"${e.title}" has no summary`;
  if (e.kind !== "internal" && /\b(?:CCODE|SNG|BATCH)-?\d+/i.test(`${e.title} ${e.summary} ${e.detail || ""}`)) return `"${e.title}" names a ticket — a ticket number never reaches a player`;
  return null;
}
