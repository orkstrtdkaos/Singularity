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
import { spawnSync, spawn } from "node:child_process";

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
  // ⛔ CCODE-307 — A GROUP IS A CAPABILITY SET, NOT A POOL. §5 is the load-bearing one: it invents a
  // family the module has never heard of and asserts it flows through UNTOUCHED — Erik's "easily updated
  // as we evolve the game" made mechanical, so a sixth capability cannot require an engine edit.
  ["group_capability", "node", ["tests/group_capability.mjs"]],
  // ⛔ CCODE-311 — THE TANK ACTUALLY TAKES THE BLOW. A WIRING gate: `interceptorFor` and
  // `protectionFromCraft` both passed their own tests the whole time the chain was unreachable, so §4 runs a
  // real round and asks who is holding the wound afterwards.
  ["interpose_wiring", "node", ["tests/interpose_wiring.mjs"]],
  ["engine_map --check", "node", ["scripts/engine_map.mjs", "--check"]],
  // ⛔ WORK ORDER 2026-09-07 — the roster is DERIVED, and a derived doc with no gate is a stale doc carrying a promise.
  ["roster --check", "node", ["scripts/roster.mjs", "--check"]],
  // ⛔ ERIK 2026-09-08: "document HOW to pipeline new NPCs (authored and game generated) through to full in game
  // capability." ⚠️ The doc is DRIVEN — every row calls the production function — so it goes stale the moment a
  // door moves, and a pipeline doc that lies is worse than none.
  ["npc_pipeline --check", "node", ["scripts/npc_pipeline.mjs", "--check"]],
  // ⛔ ERIK: "Spec a review of the world power source distribution." ⚠️ The atlas is a document Erik
  // DECIDES FROM — whether veil working in 5 of 39 regions is design or accident is his ruling — so a stale
  // one is worse than none: it would be a table of numbers that no longer describe the world.
  ["substrate_atlas --check", "node", ["scripts/substrate_atlas.mjs", "--check"]],
  // ⛔ THE DRIFT GATE THE WORLD README SAYS TO RUN IN CI, AND NOBODY DID. "A red --check means the
  // committed terrain no longer matches the generator that claims to produce it." ⚠️ Measured 2026-09-09:
  // terrain.json was last rebuilt 2026-08-10 and its INPUTS have moved since, so the world has been stale
  // for a month with nothing saying so. ⛑ Nine seconds to run — it was never a cost question.
  ["world --check", "node", ["scripts/world/generate_world.mjs", "--check"]],
];

const only = process.argv.slice(2).filter(a => !a.startsWith("-"));
const quiet = process.argv.includes("--quiet");
const run = only.length ? SUITES.filter(s => only.some(o => s[0].includes(o))) : SUITES;

const results = [];
// ✅ 2026-09-12 (Erik: "please explain the 5 minute ratchet necessity... this seems to be slowing us down quite a bit" — "do the plan"):
// the 31 suites ran ONE AFTER ANOTHER, so five minutes was their sum. They run in a pool now — bounded by the slowest suite, not the
// total — and the report is printed in SUITES order once every one has finished, so nothing about what is checked, or how it reads,
// changes. RUN_TESTS_SERIAL=1 restores the old loop (kept verbatim below) for a flaky-in-parallel suspicion; RUN_TESTS_JOBS=n sets the pool.
const runOne = ([name, cmd, args]) => new Promise((resolve) => {
  const t0 = Date.now(); let out = "", done = false;
  const finish = (status, err) => {
    if (done) return; done = true;
    if (err) out += "\n" + String(err);
    const ok = status === 0 && !err;
    const all = [...out.matchAll(/(\d+)\s+FAILURE\(S\)/gi)];
    const lineCount = (out.match(/^FAIL/gm) || []).length;
    const fails = all.length ? Number(all[all.length - 1][1]) : (ok ? 0 : lineCount || null);
    resolve({ name, ok, fails, lineCount, ms: Date.now() - t0, out });
  };
  let p;
  try { p = spawn(cmd, args, { shell: false, windowsHide: true }); } catch (err) { return finish(1, err); }
  p.stdout.on("data", (d) => { out += d; }); p.stderr.on("data", (d) => { out += d; });
  p.on("error", (err) => finish(1, err));
  p.on("close", (status) => finish(status ?? 1));
});
const serial = process.env.RUN_TESTS_SERIAL === "1";
const jobs = serial ? 1 : Math.max(1, Math.min(Number(process.env.RUN_TESTS_JOBS) || 8, run.length));
if (!serial) {
  const tAll = Date.now();
  const pooled = new Array(run.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: jobs }, async () => { while (cursor < run.length) { const i = cursor++; pooled[i] = await runOne(run[i]); } }));
  results.push(...pooled);
  for (const { name, ok, fails, lineCount, ms } of results) {
    if (fails != null && lineCount && fails !== lineCount && !quiet)
      process.stdout.write(`      ⚠ ${name}: reported total ${fails} ≠ ${lineCount} FAIL lines — read the suite directly\n`);
    if (!quiet) process.stdout.write(`${ok ? "ok  " : "FAIL"}  ${name}${fails ? ` — ${fails} failure(s)` : ""}${process.env.RUN_TESTS_TIMES ? ` (${(ms / 1000).toFixed(1)}s)` : ""}\n`);
  }
  const longest = results.reduce((a, b) => (b.ms > a.ms ? b : a), results[0]);
  if (!quiet) process.stdout.write(`      ${results.length} suites · pool of ${jobs} · ${((Date.now() - tAll) / 1000).toFixed(0)}s wall (longest ${longest?.name} ${((longest?.ms || 0) / 1000).toFixed(0)}s)\n`);
}
for (const [name, cmd, args] of (serial ? run : [])) {
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
// ⛔ A CRASH COUNTED AS ZERO. `tradition_matrix` died on a null at HEAD for a day: a suite that throws prints no
// "N FAILURE(S)" and no FAIL line, so `fails` was null, `lineCount` was 0, and `null ?? 0 ?? 1` is 0 — a dead suite
// read as a green one, and the ratchet waved it through. A non-zero exit is AT LEAST one failure, whatever it printed.
const countOf = (r) => (r.ok ? 0 : Math.max(1, r.fails ?? r.lineCount ?? 0));
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
