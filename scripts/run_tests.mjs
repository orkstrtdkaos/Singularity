#!/usr/bin/env node
// ⛔ CCODE-226 — EVERY SUITE RUNS, EVEN AFTER ONE GOES RED.
//
// `npm test` chained 18 suites with `&&`. `content_ci` sits fourth and exits 1, so THE FOURTEEN AFTER IT
// NEVER RAN — balance_sim, tradition_matrix, craft_crit, damage_sensitivity, wiring_audit and
// engine_map --check among them. Aevi ran `tradition_matrix` by hand and it reported a failure nobody had
// seen, because nothing had reached it in weeks.
//
// ⚠️ THIS IS THE SAME LESSON THIS REPO HAS LEARNED THREE TIMES, ONE LAYER UP: a run that stops early looks
// exactly like a run that passed. Inside smoke.mjs a thrown reference deletes every gate after it and
// reports zero failures; here a non-zero exit deletes every SUITE after it and reports one failure. The
// tell is identical — the count of things that ran drops, and the count of failures does not rise.
//
// So: run all of them, always. Report a table. Exit 1 if ANY failed, naming every one.
import { spawnSync } from "node:child_process";

const SUITES = [
  ["import_integrity", "node", ["tests/import_integrity.mjs"]],
  ["smoke", "node", ["tests/smoke.mjs"]],
  ["parse_probe", "node", ["tests/parse_probe.mjs"]],
  ["content_ci", "node", ["tests/content_ci.mjs"]],
  ["balance_sim", "node", ["tests/balance_sim.mjs"]],
  ["skill_battle_sim", "node", ["tests/skill_battle_sim.mjs"]],
  ["contest_sim", "node", ["tests/contest_sim.mjs"]],
  ["growth_sim", "node", ["tests/growth_sim.mjs"]],
  ["tradition_matrix", "node", ["tests/tradition_matrix.mjs"]],
  ["roll_sensitivity", "node", ["tests/roll_sensitivity.mjs"]],
  ["breadth_currency_sweep", "node", ["tests/breadth_currency_sweep.mjs"]],
  ["endgame_scaling", "node", ["tests/endgame_scaling.mjs"]],
  ["damage_sensitivity", "node", ["tests/damage_sensitivity.mjs"]],
  ["staged_crafts_check", "node", ["tests/staged_crafts_check.mjs"]],
  ["craft_crit", "node", ["tests/craft_crit.mjs"]],
  ["world_drive_audit", "node", ["tests/world_drive_audit.mjs"]],
  ["wiring_audit", "node", ["tests/wiring_audit.mjs"]],
  // ⛔ CCODE-285 — docs/HOW_IT_WORKS.md EXECUTED. The doc states what the game does in present tense and
  // marks every claim BUILT or PROPOSED, which makes it a specification. This asserts the BUILT claims
  // against the live engine AND asserts the PROPOSED ones are still unbuilt — a two-way ratchet, because a
  // feature shipping without the doc moving is the same silent drift as a field authored and never read.
  ["how_it_works", "node", ["tests/how_it_works.mjs"]],
  // ⛔ CCODE-288 — THE REAL SAVES. 1,788 turns of played history that cannot be regenerated, reconciled on
  // every run so a vocabulary rename cannot quietly drop an ability out of somebody's character.
  ["save_fixtures", "node", ["tests/save_fixtures.mjs"]],
  // ⛔ CCODE-301 — FOUR GATE SUITES WERE SITTING ON THE SHELF. `scripts/apparatus.mjs` classifies every
  // harness and found these: assertions that existed, passed, and were run by nobody. ⚠️ A GATE THAT DOES
  // NOT RUN IS WORSE THAN NO GATE — it reads as coverage. All four verified green before wiring.
  ["changeset_check", "node", ["tests/changeset_check.mjs"]],
  ["dev_world", "node", ["tests/dev_world.mjs"]],
  ["playthrough_sim", "node", ["tests/playthrough_sim.mjs"]],
  ["verification_ledger", "node", ["tests/verification_ledger.mjs"]],
  // ⛔ CCODE-306 — THE TAUNT REACHES THE PICK. A wiring gate, not a module gate: both halves were green
  // and the live path connected neither. It asserts where the blow ACTUALLY LANDS across two real rounds.
  ["taunt_wiring", "node", ["tests/taunt_wiring.mjs"]],
  ["engine_map --check", "node", ["scripts/engine_map.mjs", "--check"]],
];

const only = process.argv.slice(2).filter(a => !a.startsWith("-"));
const quiet = process.argv.includes("--quiet");
const run = only.length ? SUITES.filter(s => only.some(o => s[0].includes(o))) : SUITES;

const results = [];
for (const [name, cmd, args] of run) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const ok = r.status === 0;
  // ⚠️ THE FAILURE COUNT IS READ FROM THE SUITE'S OWN OUTPUT where it prints one, so the table says HOW
  // BADLY rather than just "red" — one red suite among eighteen is a very different morning from six.
  // ⚠️ THE LAST ONE, NOT THE FIRST. A suite prints a per-section "N FAILURE(S)" as it goes and its TOTAL
  // at the end; taking the first match reported content_ci as 24 when the suite's own total was 19, and I
  // repeated that 24 to Erik. A runner that restates a suite's number must restate the number the suite
  // ends on. Cross-checked against the FAIL lines so the two can never quietly disagree again.
  const all = [...out.matchAll(/(\d+)\s+FAILURE\(S\)/gi)];
  const lineCount = (out.match(/^FAIL/gm) || []).length;
  const fails = all.length ? Number(all[all.length - 1][1]) : (ok ? 0 : lineCount || null);
  results.push({ name, ok, fails, lineCount, ms: Date.now() - t0, out });
  // ⛔ AND IF THE SUITE'S TOTAL DISAGREES WITH ITS OWN FAIL LINES, SAY SO rather than picking one.
  if (fails != null && lineCount && fails !== lineCount && !quiet)
    process.stdout.write(`      ⚠ ${name}: reported total ${fails} ≠ ${lineCount} FAIL lines — read the suite directly
`);
  if (!quiet) process.stdout.write(`${ok ? "ok  " : "FAIL"}  ${name}${fails ? ` — ${fails} failure(s)` : ""}\n`);
}

/* ══ CCODE-288b — THE RATCHET. ⛔ MY FIRST PRE-PUSH HOOK DEMANDED ALL-GREEN AND BLOCKED EVERY PUSH FOREVER,
   including its own author's, on its first run. This suite carries ~22 KNOWN-RED assertions — content_ci
   17, wiring 4, damage_sensitivity 1, smoke 1 — which are the project's open gaps, tracked deliberately.
   ⚠️ A GATE THAT CAN NEVER PASS IS A GATE EVERYONE LEARNS TO BYPASS, which is worse than no gate: it trains
   the habit of --no-verify. So it blocks on REGRESSION, never on the standing count — the same one-way
   ratchet `wiring_audit` already uses, applied to the whole suite. ══ */
const ratchet = process.argv.includes("--ratchet");
const rebase = process.argv.includes("--rebaseline");
const BASELINE = new URL("../tests/suite_baseline.json", import.meta.url);
const countOf = (r) => (r.ok ? 0 : (r.fails ?? r.lineCount ?? 1));
if (rebase) {
  const { writeFileSync } = await import("node:fs");
  const out = {
    _note: "⛔ KNOWN-RED COUNTS PER SUITE. `run_tests --ratchet` blocks only when a count RISES or a new suite goes red. ⚠️ Numbers may only go DOWN — lower one by FIXING something, then re-baseline deliberately with `--rebaseline` so the improvement lands as a visible commit.",
    _updatedAt: new Date().toISOString().slice(0, 10),
    suites: Object.fromEntries(results.map(r => [r.name, countOf(r)])),
  };
  writeFileSync(BASELINE, JSON.stringify(out, null, 1) + "\n");
  console.log(`\nbaseline written — known red: ${Object.entries(out.suites).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(" · ") || "none, all green"}`);
  process.exit(0);
}
if (ratchet) {
  const { readFileSync, existsSync } = await import("node:fs");
  if (!existsSync(BASELINE)) {
    console.log("\n⛔ no tests/suite_baseline.json — run: node scripts/run_tests.mjs --rebaseline");
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(BASELINE, "utf8")).suites || {};
  const worse = [], better = [];
  for (const r of results) {
    const now = countOf(r), was = base[r.name];
    if (was === undefined) { if (now > 0) worse.push(`${r.name}: NEW red suite (${now})`); continue; }
    if (now > was) worse.push(`${r.name}: ${was} → ${now}`);
    else if (now < was) better.push(`${r.name}: ${was} → ${now}`);
  }
  console.log("\n" + "-".repeat(64));
  if (better.length) {
    console.log("✅ IMPROVED — re-baseline to lock it in (node scripts/run_tests.mjs --rebaseline):");
    better.forEach(b => console.log("   " + b));
  }
  if (worse.length) {
    console.log("\n⛔ REGRESSION — a count went UP:");
    worse.forEach(w => console.log("   " + w));
    console.log("\n   Fix it, or push with --no-verify if you know why.");
    process.exit(1);
  }
  console.log(`✅ no regression against the baseline · ${results.length} suites ran.`);
  process.exit(0);
}

const bad = results.filter(r => !r.ok);
console.log("\n" + "-".repeat(64));
console.log(`${results.length} suites ran · ${results.length - bad.length} green · ${bad.length} red`);
if (bad.length) {
  console.log("\n⛔ RED, AND EVERY ONE OF THEM RAN — no suite was skipped because an earlier one failed:");
  for (const b of bad) {
    console.log(`\n=== ${b.name}${b.fails ? ` (${b.fails} failure(s))` : ""} ===`);
    const lines = b.out.split("\n").filter(l => /^(FAIL|✗|\s*⚠|Error|.*FAILURE\(S\))/.test(l));
    console.log(lines.slice(0, 12).map(l => "  " + l.slice(0, 160)).join("\n") || "  (exit " + "non-zero" + ", no FAIL lines — read the suite directly)");
    if (lines.length > 12) console.log(`  … and ${lines.length - 12} more`);
  }
  process.exit(1);
}
console.log("All suites green.");
