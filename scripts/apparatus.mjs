// scripts/apparatus.mjs — CCODE-301. EVERY HARNESS, WHAT IT IS FOR, AND WHETHER IT ACTUALLY RUNS.
//
// ⛔ ERIK: "those dev docs likely will have descriptions of all our test harnesses and routines as well.
// I want this to be a well oiled factory."
//
// ⚠️ A FACTORY YOU CANNOT SEE IS NOT WELL OILED. There are 44 files in `tests/` and 32 in `scripts/`, and
// before this ran nobody could say which were GATES, which were REPORTS, and which had quietly stopped
// being wired into anything. ⛔ THE ANSWER WAS THAT ONE GATE SUITE WITH ELEVEN CHECKS HAD NEVER RUN.
//
// ⛔ THE CLASSIFICATION IS DERIVED, NOT DECLARED. A hand-kept list of "which of these are gates" would be
// wrong within a week — the same stored-copy-of-a-derived-value failure, committed in documentation. What
// a file IS gets measured here; what it is FOR is prose in `docs/APPARATUS.md`, which only a person can write.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(join(root, p), "utf8");
const runner = rd("scripts/run_tests.mjs");

/** ⚠️ NEEDS A LIVE API KEY — cannot run in CI, and must not be counted as a missing gate. */
const NEEDS_API = /anthropic|ANTHROPIC_API_KEY|real Anthropic API/i;
/** A library other harnesses import, not a harness itself. */
const LIBRARY = /^(headless_content|lib)$/;

function classify(dir, file) {
  const src = rd(`${dir}/${file}`);
  const name = file.replace(/\.mjs$/, "");
  // ⛔ COUNT REAL ASSERTIONS, NOT THE WORD "check" IN PROSE. Comments are stripped first, because a file
  // that merely DISCUSSES gating would otherwise read as a gate — a scanner reading its own prose, which
  // this project has committed three times.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const gates = (code.match(/\bcheck\(|\bassert\w*\(|process\.exitCode\s*=|process\.exit\(1\)/g) || []).length;
  const inRunner = runner.includes(file);
  let kind;
  // ⛔ `tests/` IS THE SUITE; `scripts/` IS TOOLING. My first pass called any file with an assertion a gate
  // and reported ELEVEN unwired ones — but `safe_delete`'s five checks are its own SELF-TEST, which is
  // correct design rather than missing coverage, and `bump_version`'s are sanity checks on a tool.
  // ⚠️ A TOOL THAT CHECKS ITSELF IS NOT A SUITE NOBODY RUNS. Conflating the two would have sent me wiring
  // five demos into the runner to make a number go down — the exact dishonesty the ratchet forbids.
  // ⛔ THE CLASSIFIER EXCLUDES ITSELF. Its NEEDS_API pattern is CODE, not a comment, so stripping
  // comments does not hide it and this file reported itself as needing an API key. Same rule and same
  // reason as `field_atlas`'s NOT_CONSUMERS: a file that NAMES what it looks for is not an instance of it.
  if (name === "apparatus") kind = "TOOL+SELFTEST";
  else if (LIBRARY.test(name)) kind = "LIBRARY";
  // ⚠️ TESTED AGAINST STRIPPED CODE, NOT THE RAW FILE. Run against `src`, this classifier matched ITSELF:
  // the NEEDS_API pattern above literally contains the words it searches for, so apparatus.mjs reported
  // itself as needing an API key. A scanner reading its own prose — the fourth time in this project.
  else if (NEEDS_API.test(code)) kind = "LIVE-API";
  else if (dir === "scripts") kind = gates > 0 ? "TOOL+SELFTEST" : "TOOL";
  else if (gates > 0) kind = inRunner ? "GATE" : "GATE-UNWIRED";
  else kind = "REPORT";
  const why = (src.split("\n").slice(0, 6).join(" ").match(/—\s*([^.]{6,90})\./) || [])[1] || "";
  return { name, dir, kind, gates, inRunner, why: why.replace(/\s+/g, " ").trim() };
}

const rows = [];
for (const f of readdirSync(join(root, "tests")).filter(x => x.endsWith(".mjs"))) rows.push(classify("tests", f));
for (const f of readdirSync(join(root, "scripts")).filter(x => x.endsWith(".mjs"))) rows.push(classify("scripts", f));

const ORDER = { "GATE": 0, "GATE-UNWIRED": 1, "LIVE-API": 2, "REPORT": 3, "TOOL+SELFTEST": 4, "TOOL": 5, "LIBRARY": 6 };
rows.sort((a, b) => (ORDER[a.kind] - ORDER[b.kind]) || (b.gates - a.gates) || a.name.localeCompare(b.name));
const tally = rows.reduce((a, r) => (a[r.kind] = (a[r.kind] || 0) + 1, a), {});
const markOf = (k) => k === "GATE" ? "OK " : k === "GATE-UNWIRED" ? "!! " : k === "LIVE-API" ? "API"
  : k.startsWith("TOOL") ? "T  " : k === "LIBRARY" ? "-  " : "o  ";

if (process.argv.includes("--md")) {
  console.log("| harness | kind | assertions | purpose |");
  console.log("|---|---|---|---|");
  for (const r of rows) {
    const m = r.kind === "GATE" ? "✅" : r.kind === "GATE-UNWIRED" ? "⛔" : r.kind === "LIVE-API" ? "⚠️"
      : r.kind.startsWith("TOOL") ? "🔧" : r.kind === "LIBRARY" ? "·" : "○";
    console.log(`| \`${r.dir}/${r.name}\` | ${m} ${r.kind} | ${r.gates || "—"} | ${r.why || "—"} |`);
  }
} else {
  const W = 112;
  const line = (c = "─") => console.log("  " + c.repeat(W));
  const say = (s = "") => console.log("  " + s);
  console.log("");
  line("═");
  console.log("  CCODE-301 — THE APPARATUS. Every harness, and whether it runs.");
  line("═");
  say();
  say(`  ${rows.length} files · ` + Object.entries(tally).sort((a, b) => ORDER[a[0]] - ORDER[b[0]])
    .map(([k, v]) => `${k} ${v}`).join(" · "));
  say();
  const unwired = rows.filter(r => r.kind === "GATE-UNWIRED");
  if (unwired.length) {
    say("!! GATE SUITES THAT ARE NOT IN THE RUNNER — assertions nobody is running:");
    for (const r of unwired) say(`     ${(r.dir + "/" + r.name).padEnd(32)}${r.gates} check(s)   ${r.why.slice(0, 44)}`);
    say();
    say("   A GATE THAT DOES NOT RUN IS WORSE THAN NO GATE: it reads as coverage while sitting on the shelf.");
  } else {
    say("OK  every gate suite in tests/ is wired into the runner.");
  }
  say();
  line();
  say("  harness".padEnd(38) + "kind".padEnd(16) + "asserts   purpose");
  line();
  for (const r of rows) {
    say(`${markOf(r.kind)} ${(r.dir + "/" + r.name).padEnd(34)}${r.kind.padEnd(15)}${String(r.gates || "-").padStart(5)}   ${r.why.slice(0, 44)}`);
  }
  say();
  line("═");
  say("'REPORT' IS NOT A LESSER THING. A report answers a question a gate cannot ask — how often, how hard,");
  say("at what tier — and every balance ruling this month rested on one. THE DISTINCTION THAT MATTERS IS");
  say("WIRED vs NOT: a gate belongs in the runner, a report belongs in a person's hand.");
  line("═");
  console.log("");
}
