// scripts/certify_counts.mjs — CCODE-327. THE CERTIFIED COUNTS IN SYSTEM_SPEC HAVE A GENERATOR.
//
// ⛔ THREE TIMES IN ONE SESSION a green suite went red because an author added a craft and three numbers in
// `SYSTEM_SPEC.md` still described the corpus before it: the header's ability count, and the §39 rows for
// `crit` and `wardTypes`. Each time the repair was a HAND-EDIT of a number the suite had just measured.
//
// ⚠️ THE GATES ARE RIGHT AND THEY ARE NOT THE PROBLEM. `wiring_audit` and `smoke` are doing exactly their
// job — the header's whole purpose is machine-gated freshness. The defect is that the numbers they police
// have NO SOURCE: they are stored copies of a derived value, which is this project's most-repeated defect,
// and the tooling built to catch it had it too (`apparatus_inject` had the same hole, fixed alongside).
//
// ⛔ A GATE ON A HAND-KEPT NUMBER DOES NOT MAKE IT FRESH — IT MAKES THE STALENESS NOISY. This is the source.
// Aevi authors a craft, runs this, and the spec certifies the corpus that actually exists.
//
// ⚠️ IT REFUSES RATHER THAN GUESSES. Every count is read from the same place the gate reads it; if a row it
// must stamp is missing, it exits non-zero and writes nothing, because a certification that silently skips
// the claim it could not find is worse than one that is stale — the stale one at least fails loudly.
//
// Usage:  node scripts/certify_counts.mjs            → stamp the spec
//         node scripts/certify_counts.mjs --check     → report drift, change nothing (exit 1 if stale)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const SPEC = join(root, "SYSTEM_SPEC.md");

/* ── the corpus, read the way the gates read it ─────────────────────────────────────────────── */
function walkAbilities(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walkAbilities(f, out);
    else if (e.name.endsWith(".json") && dir.endsWith("abilities")) out.push(f);
  }
  return out;
}
const records = [];
for (const f of walkAbilities(join(root, "content", "packs"))) {
  const j = JSON.parse(readFileSync(f, "utf8"));
  const arr = Array.isArray(j) ? j : (Array.isArray(j.abilities) ? j.abilities : [j]);
  for (const a of arr) records.push(a);
}
const t = JSON.parse(readFileSync(join(root, "content/packs/core/rules/traditions.json"), "utf8"));
const counts = {
  abilities: records.length,
  traditions: (t.traditions || []).length,
  folk: (t.folkTraditions || []).length,
  engine: readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).length,
  // ⚠️ THE SAME PREDICATES THE GATES USE, character for character. If these ever diverge from `smoke.mjs`
  // this script would certify a number the gate rejects — a generator arguing with its own checker.
  crit: records.filter(a => a.mechanic?.crit || a.crit).length,
  wardTypes: records.filter(a => JSON.stringify(a).includes('"wardTypes"')).length,
};

/* ── the claims, each with the pattern that finds it ────────────────────────────────────────── */
const CLAIMS = [
  { name: "header · abilities", re: /(\d+) abilities \/ \d+ traditions/, val: counts.abilities,
    sub: (m) => m.replace(/^\d+/, String(counts.abilities)) },
  { name: "header · traditions", re: /\d+ abilities \/ (\d+) traditions \(\+(\d+) folk\)/, val: `${counts.traditions}+${counts.folk}`,
    sub: () => `${counts.abilities} abilities / ${counts.traditions} traditions (+${counts.folk} folk)` },
  { name: "header · engine modules", re: /\*\*(\d+) engine modules\*\*/, val: counts.engine,
    sub: () => `**${counts.engine} engine modules**` },
  { name: "§39 · crit", re: /(\| `mechanic\.crit` \/ `crit` \|[^\n]*\| \*\*)(\d+)(\*\* \|)/, val: counts.crit,
    sub: (_m, a, _b, c) => `${a}${counts.crit}${c}` },
  { name: "§39 · wardTypes", re: /(\| `wardTypes` \|[^\n]*\| \*\*)(\d+)(\*\* \|)/, val: counts.wardTypes,
    sub: (_m, a, _b, c) => `${a}${counts.wardTypes}${c}` },
];

let s = readFileSync(SPEC, "utf8");
const missing = CLAIMS.filter(c => !c.re.test(s));
if (missing.length) {
  console.error(`\u26d4 REFUSING TO STAMP: ${missing.length} claim(s) not found in SYSTEM_SPEC.md \u2014 ${missing.map(c => c.name).join(", ")}`);
  console.error("   A certification that skips the claim it could not find is worse than a stale one.");
  process.exit(1);
}
let changed = 0;
for (const c of CLAIMS) {
  const before = s;
  s = s.replace(c.re, c.sub);
  if (s !== before) { changed++; console.log(`  ${CHECK ? "STALE" : "stamped"}  ${c.name} \u2192 ${c.val}`); }
}
if (CHECK) {
  console.log(changed ? `\u26a0\ufe0f ${changed} certified count(s) are STALE \u2014 run without --check` : "\u2705 every certified count is fresh");
  process.exit(changed ? 1 : 0);
}
if (changed) writeFileSync(SPEC, s);
console.log(changed ? `SYSTEM_SPEC certified: ${changed} count(s) refreshed` : "SYSTEM_SPEC already certified \u2014 nothing to change");
