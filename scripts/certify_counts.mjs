// scripts/certify_counts.mjs — CCODE-327. EVERY CERTIFIED COUNT IN THE DOCS HAS ONE SOURCE.
//
// ⛔ THREE TIMES IN ONE SESSION a green suite went red because an author added a craft and the numbers in
// `SYSTEM_SPEC.md` still described the corpus before it. Each repair was a HAND-EDIT of a number the suite
// had just measured. Then it happened twice more inside twenty minutes, on Aevi's `Grown Guardian` and
// `Carried Weight`, while this file was being written.
//
// ⚠️ THE GATES ARE RIGHT AND THEY ARE NOT THE PROBLEM. The spec header's whole purpose is machine-gated
// freshness. The defect is that the numbers they police had NO SOURCE: stored copies of a derived value,
// this project's most-repeated defect, sitting in the documents whose entire job is to be true. The tooling
// built to catch it had the same hole — `apparatus_inject` restated its own measured total in prose and
// never stamped it.
//
// ⛔ A GATE ON A HAND-KEPT NUMBER DOES NOT MAKE IT FRESH — IT MAKES THE STALENESS NOISY.
//
// ⚠️ AND THE UNGATED ONES ARE WORSE THAN THE GATED ONES. `docs/HOW_IT_WORKS.md` and `docs/PLAYERS_GUIDE.md`
// carry craft counts that NOTHING checked — only their version string was gated — so they could drift
// silently and forever. Those are stamped here too, and `how_it_works` now gates them.
//
// ⛔ THE TWO DOCS CARRY DIFFERENT CRAFT COUNTS AND BOTH ARE RIGHT. `HOW_IT_WORKS` counts AUTHORED records;
// `PLAYERS_GUIDE` counts what a player can actually LOAD, which is authored plus the nine-craft MARTIAL
// FLOOR that `engine/martial.js` synthesizes and `state.js` merges into the catalogue. Reconciling them to
// one number would make one of the two claims false, so the difference is DERIVED here — the floor is asked
// of the engine, never hardcoded as "+9".
//
// ⚠️ IT REFUSES RATHER THAN GUESSES, in both directions:
//   · a claim whose row it cannot find → writes nothing, exits non-zero. A certification that silently skips
//     what it could not locate is worse than a stale one; the stale one at least fails loudly.
//   · a number it cannot DERIVE → left exactly as authored. `people` in the player's guide is the live case:
//     41 solo NPC files + 11 nested = 52 unique records, and the guide says 111. Until someone names the
//     derivation, stamping a number I cannot justify would be inventing a fact in the document that exists
//     to be trusted. It is preserved verbatim and reported as unowned on every run.
//
// Usage:  node scripts/certify_counts.mjs            → stamp every claim
//         node scripts/certify_counts.mjs --check     → report drift, change nothing (exit 1 if stale)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { martialAbilityRecords } from "../engine/martial.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const rd = (p) => readFileSync(join(root, p), "utf8");
const rj = (p) => JSON.parse(rd(p));

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
const t = rj("content/packs/core/rules/traditions.json");
// ⛔ ASKED OF THE ENGINE, NOT COUNTED BY HAND. `state.js` merges exactly these into the catalogue at load,
// so if the floor ever grows the player's guide follows it without anyone noticing it had to.
const martialFloor = Object.keys(martialAbilityRecords(rj("content/packs/core/rules/martial_paths.json"))).length;
const dirCount = (p) => readdirSync(join(root, p)).filter(f => f.endsWith(".json")).length;

const counts = {
  authored: records.length,
  loaded: records.length + martialFloor,
  traditions: (t.traditions || []).length,
  folk: (t.folkTraditions || []).length,
  engine: readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).length,
  places: dirCount("content/packs/valley/locations"),
  companions: dirCount("content/packs/valley/companions"),
  // ⚠️ THE SAME PREDICATES `smoke.mjs` USES, character for character. If these diverge, this script would
  // certify a number its own checker rejects — a generator arguing with its gate.
  crit: records.filter(a => a.mechanic?.crit || a.crit).length,
  wardTypes: records.filter(a => JSON.stringify(a).includes('"wardTypes"')).length,
};
const version = (rd("app.js").match(/APP_VERSION\s*=\s*"([^"]+)"/) || [])[1] || "?";
const today = new Date().toISOString().slice(0, 10);

/* ── the claims, each naming its file and the pattern that finds it ─────────────────────────── */
const CLAIMS = [
  { file: "SYSTEM_SPEC.md", name: "spec header · abilities + traditions",
    re: /\d+ abilities \/ \d+ traditions \(\+\d+ folk\)/,
    to: () => `${counts.authored} abilities / ${counts.traditions} traditions (+${counts.folk} folk)` },

  { file: "SYSTEM_SPEC.md", name: "spec header · engine modules",
    re: /\*\*\d+ engine modules\*\*/, to: () => `**${counts.engine} engine modules**` },

  { file: "SYSTEM_SPEC.md", name: "spec §39 · crit",
    re: /(\| `mechanic\.crit` \/ `crit` \|[^\n]*\| \*\*)\d+(\*\* \|)/,
    to: (_m, a, b) => `${a}${counts.crit}${b}` },

  { file: "SYSTEM_SPEC.md", name: "spec §39 · wardTypes",
    re: /(\| `wardTypes` \|[^\n]*\| \*\*)\d+(\*\* \|)/,
    to: (_m, a, b) => `${a}${counts.wardTypes}${b}` },

  // ⚠️ AUTHORED. This doc describes what has been written, so it counts records.
  { file: "docs/HOW_IT_WORKS.md", name: "how-it-works · crafts (AUTHORED)",
    re: /\*\*Last verified: [\d-]+ · v[\d.]+ · \d+ crafts\.\*\*/,
    to: () => `**Last verified: ${today} · v${version} · ${counts.authored} crafts.**` },

  // ⛔ LOADED, and `people` CARRIED THROUGH UNTOUCHED — see the header. A player counts what they can reach,
  // which includes the martial floor; the number I cannot derive is preserved rather than invented.
  { file: "docs/PLAYERS_GUIDE.md", name: "player's guide · crafts (LOADED) · places · companions",
    re: /\*\*Last verified: [\d-]+ · v[\d.]+ · \d+ crafts · \d+ places · (\d+) people · \d+ companions\.\*\*/,
    to: (_m, people) => `**Last verified: ${today} · v${version} · ${counts.loaded} crafts · ${counts.places} places · ${people} people · ${counts.companions} companions.**` },
];

/* ── stamp, or report ───────────────────────────────────────────────────────────────────────── */
const byFile = new Map();
for (const c of CLAIMS) if (!byFile.has(c.file)) byFile.set(c.file, rd(c.file));

const missing = CLAIMS.filter(c => !c.re.test(byFile.get(c.file)));
if (missing.length) {
  console.error(`⛔ REFUSING TO STAMP: ${missing.length} claim(s) not found — ${missing.map(c => `${c.file} :: ${c.name}`).join(" · ")}`);
  console.error("   A certification that skips the claim it could not find is worse than a stale one.");
  process.exit(1);
}

let changed = 0;
for (const c of CLAIMS) {
  const before = byFile.get(c.file);
  const after = before.replace(c.re, c.to);
  if (after !== before) { changed++; byFile.set(c.file, after); console.log(`  ${CHECK ? "STALE " : "stamped"}  ${c.file} :: ${c.name}`); }
}

console.log("  ⚠️ not owned: PLAYERS_GUIDE 'people' — no derivation names it (41 solo + 11 nested = 52 records vs 111 claimed). Preserved as authored.");

if (CHECK) {
  console.log(changed ? `⚠️ ${changed} certified claim(s) are STALE — run without --check` : "✅ every certified count is fresh");
  process.exit(changed ? 1 : 0);
}
for (const [f, s] of byFile) writeFileSync(join(root, f), s);
console.log(changed
  ? `certified: ${changed} claim(s) refreshed across ${byFile.size} file(s) — ${counts.authored} authored / ${counts.loaded} loaded (floor ${martialFloor})`
  : "already certified — nothing to change");
