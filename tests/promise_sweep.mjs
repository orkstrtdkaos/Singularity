// promise_sweep.mjs — CCODE-91: the GENERAL sweep behind every PromisedButUnread finding.
//
// Erik: "every one of these surfaced something that should also be swept for in the game. What else is asked
// for but empty, or exists for a reason but never consumed?"
//
// Six doors were found one at a time, each by accident, each while doing something else:
//   1. a manifest key no loader reads                    (SNG-040/064 — gated in content_ci)
//   2. a rules CONSTANT no module reads                  (CCODE-60 — ratcheted in wiring_audit)
//   3. a record TYPE no seeder reads                     (CCODE-62 — gated in content_ci)
//   4. a reader with no writer                           (oppSheet.health — found by measuring)
//   5. a content FIELD the engine cannot read            (craft crit blocks — gated per-type)
//   6. an unreachable VALUE of a field that IS read      (CCODE-90 passing_advice — gated in wiring_audit)
//
// Every one of those is the same shape at a different altitude: SOMETHING IS DECLARED AND ONE END OF IT IS
// MISSING. The named gates above each catch one door. This sweeps for the SHAPE, so door seven is found by
// the build rather than by someone tripping over it in play.
//
// IT IS A REPORT, NOT A GATE, and deliberately so: a general sweep over a 74-module codebase produces real
// findings AND real false positives, and a noisy gate is one people learn to skip (the SNG-250 lesson). It
// prints what it finds and ranks by how confident it is. Promoting a finding to a gate is a decision someone
// makes after looking, which is what happened with all six above.
//
// Run: npm run sweep

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const read = rel => readFileSync(join(root, rel), "utf8");

const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
const ENGINE = Object.fromEntries(engineFiles.map(f => [f, read(`engine/${f}`)]));
const APP = read("app.js");
const ALL_CODE = Object.values(ENGINE).join("\n") + "\n" + APP;

let findings = 0;
const say = (rank, what, detail) => { findings++; console.log(`  ${rank}  ${what}${detail ? `\n       ${detail}` : ""}`); };

console.log("THE PROMISE SWEEP — what is asked for but empty, or exists but is never consumed? (CCODE-91)\n");

// ── DOOR 6, GENERALISED: an enumerated VALUE that nothing can ever produce ──────────────────────────────
// This is the door that caught `passing_advice` (defined, described, deployable, never selected) and the
// `physical` damage type (authored as an immunity, produced by nothing). A closed list whose members are only
// ever COMPARED AGAINST is a list of promises with no producer.
console.log("A. ENUM MEMBERS NOTHING PRODUCES — a closed list whose values are only ever compared against\n");
{
  // exported const arrays of string literals: the codebase's closed enums
  const enums = [];
  for (const [file, src] of Object.entries(ENGINE)) {
    for (const m of src.matchAll(/export const ([A-Z][A-Z0-9_]*)\s*=\s*\[([^\]]{2,400})\]/g)) {
      const members = [...m[2].matchAll(/"([a-z][a-z0-9_]{2,40})"/g)].map(x => x[1]);
      if (members.length >= 2 && members.length <= 24) enums.push({ file, name: m[1], members });
    }
  }
  for (const e of enums) {
    const orphans = e.members.filter(v => {
      // PRODUCED = assigned, returned, or pushed as a literal somewhere other than the enum declaration itself.
      const produced = new RegExp(`(?:return|=|:|push\\(|\\?)\\s*"${v}"`).test(ALL_CODE);
      return !produced;
    });
    if (orphans.length) say("REPORT", `${e.file} ${e.name}: ${orphans.length}/${e.members.length} member(s) nothing ever produces`,
      `${orphans.join(", ")} — declared and matched against, but no code path returns or assigns them`);
  }
  if (!enums.length) console.log("  (no closed enums matched the shape)");
}

// ── DOOR 4, GENERALISED: a field READ off a shared record that nothing ever WRITES ──────────────────────
// `oppSheet.health` was read by the damage path and written by nobody, so every foe had the same hardcoded
// hit points. That was found by measuring rounds-to-kill, which is a slow way to find a missing assignment.
console.log("\nB. FIELDS READ BUT NEVER WRITTEN — a consumer expecting something no producer supplies\n");
{
  const SHEETS = ["oppSheet", "playerSheet", "targetSheet", "winDecl", "oppDecl", "playerDecl", "def", "state"];
  const seen = new Map();
  for (const [file, src] of Object.entries(ENGINE)) {
    for (const m of src.matchAll(/\b(oppSheet|playerSheet|targetSheet|winDecl|oppDecl|playerDecl)\??\.([a-zA-Z][\w]{2,28})\b/g)) {
      const key = `${m[1]}.${m[2]}`;
      if (!seen.has(key)) seen.set(key, { field: m[2], where: file, reads: 0 });
      seen.get(key).reads++;
    }
  }
  const written = f => new RegExp(`\\b${f}\\s*[:=]`).test(ALL_CODE) || new RegExp(`\\.\\.\\.[a-zA-Z]*[Ss]heet`).test(ALL_CODE);
  const orphans = [...seen.entries()].filter(([, v]) => !written(v.field));
  for (const [key, v] of orphans.slice(0, 12)) say("REPORT", `${key} is read (${v.reads}×, ${v.where}) and nothing assigns it`);
  if (!orphans.length) console.log("  none — every field read off a passed record is written somewhere");
}

// ── DOOR 1/2, RE-RUN ACROSS PACKS: a registered rules file no module names ──────────────────────────────
console.log("\nC. REGISTERED RULES FILES NO MODULE NAMES — the original door, swept across every pack\n");
{
  // ADJUDICATED ALREADY, by Aevi on 2026-08-01 when the SNG-253 ratchet surfaced them. Re-reporting a
  // question someone has already answered is how a sweep becomes noise, so her ruling is encoded WITH her
  // reasoning rather than silently filtered: the DESIGN DOCS are reference that happens to live in rules/,
  // and the DATA files load through dedicated modules (recipes.js and friends) rather than by stem name.
  const ADJUDICATED = {
    challenge_design: "design doc (Aevi 2026-08-01) — reference living in rules/",
    gambit_design: "design doc (Aevi 2026-08-01)",
    skill_utility_audit: "audit doc (Aevi 2026-08-01)",
    quest_structure: "authoring guidance, not engine-consumed (Aevi)",
    power_sources: "loads via a dedicated module, not by stem name (Aevi)",
    combination_recipes: "loads via recipes.js (Aevi)",
    emergence_recipes: "loads via recipes.js (Aevi)",
    martial_paths: "loads via a dedicated module (Aevi)",
    cross_axis_modifiers: "loads via a dedicated module (Aevi)",
    pole_signatures: "loads via a dedicated module (Aevi)",
  };
  let checked = 0, adjudicated = 0;
  const packs = readdirSync(join(root, "content/packs")).filter(p => existsSync(join(root, `content/packs/${p}/manifest.json`)));
  for (const pack of packs) {
    const man = rj(`content/packs/${pack}/manifest.json`);
    // The manifest lists files under `provides`, not `rules`/`files`. The first draft guessed and checked
    // ZERO files while printing a tidy "(0 checked)" — a sweep reporting nothing because it looked nowhere
    // is the exact failure it exists to find, so the count is printed and asserted non-zero below.
    const files = Object.values(man.provides || {}).flat().concat(man.rules || [], man.files || [])
      .filter(f => typeof f === "string" && f.startsWith("rules/"));
    for (const f of files) {
      checked++;
      const stem = f.replace(/^rules\//, "").replace(/\.json$/, "");
      const camel = stem.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (ADJUDICATED[stem]) { adjudicated++; continue; }
      if (!ALL_CODE.includes(`"${stem}"`) && !ALL_CODE.includes(camel)) {
        say("REPORT", `${pack}/${f} is registered and NO module names it (neither "${stem}" nor ${camel})`);
      }
    }
  }
  console.log(`  (${checked} registered rules file(s) checked; ${adjudicated} already adjudicated and skipped)`);
  if (!checked) say("SWEEP BUG", "this section checked NOTHING — the manifest shape moved and the sweep looked in the wrong place");
}

// ── DOOR 5, GENERALISED: a GM-contract op the salvage list forgets ──────────────────────────────────────
// The gm.js contract tells the model what it may emit; SALVAGEABLE_OPS decides what survives a partial reply.
// An op in one and not the other is a promise kept only when nothing goes wrong.
console.log("\nD. GM OPS THE SALVAGE LIST FORGETS — emitted by contract, dropped on a degraded reply\n");
{
  const gm = ENGINE["gm.js"] || "";
  const salv = (gm.match(/SALVAGEABLE_OPS\s*=\s*\[([^\]]*)\]/) || [])[1] || "";
  const salvaged = new Set([...salv.matchAll(/"([a-zA-Z]+)"/g)].map(m => m[1]));
  const contractOps = new Set();
  for (const m of gm.matchAll(/^\s*"([a-zA-Z]+)":\s*[[{]/gm)) contractOps.add(m[1]);
  const missing = [...contractOps].filter(op => !salvaged.has(op) && ALL_CODE.includes(`turn.${op}`));
  for (const op of missing) say("LIKELY", `"${op}" is in the GM contract and READ as turn.${op}, but is not in SALVAGEABLE_OPS`,
    "a degraded or truncated reply drops it silently");
  if (!missing.length) console.log("  none — every contract op the engine reads is salvageable");
}

// -- DOOR 7: A LIST BUILT UP IN PRIORITY ORDER, THEN TRUNCATED AS IF IT WERE NOT --------------------------
// CCODE-99: `offscreenPopulation` appends generated entities, then met NPCs, then - LAST - the legend that
// passed a cooldown AND a rate roll to be there. `advanceGeneratedOffscreen` then took `slice(0, 4)`. On a
// real save the population is 47 long and the legend sits at index 36, so it was cut EVERY TIME. The
// machinery behind it was flawless; it was simply never asked. Nothing here was declared-and-unread - it was
// COLLECTED AND THEN SILENTLY DISCARDED, which is the same family through a seventh door.
//
// A slice after a SORT is principled: the sort decides what survives. A slice on a list that was appended to
// in meaningful order is a truncation overruling an ordering nobody wrote down.
console.log("\nE. LISTS TRUNCATED WITHOUT A SORT - a flat slice overruling the order a list was built in\n");
{
  let flagged = 0;
  for (const [file, src] of Object.entries(ENGINE)) {
    for (const m of src.matchAll(/(\w+)\.slice\(0,\s*(\d+)\)/g)) {
      const name = m[1], n = Number(m[2]);
      if (n > 24) continue;                                  // a generous cap is a guard, not a policy
      const before = src.slice(Math.max(0, m.index - 700), m.index);
      if (/\.sort\(/.test(before.slice(-220))) continue;      // sorted just before the cut = principled
      if (!new RegExp(name + "\\.push\\(").test(before)) continue;   // only lists this scope APPENDED to
      flagged++;
      say("REPORT", file + ": `" + name + ".slice(0, " + n + ")` truncates a list that was PUSHED to, with no sort",
        "if later entries earned their place, this cut discards exactly them (the CCODE-99 shape)");
    }
  }
  if (!flagged) console.log("  none - every bounded list is either sorted first or not built by appending");
}

console.log(`\n${findings} finding(s). This is a REPORT: each one is a question, not a verdict.`);
console.log("A finding worth gating gets promoted to a named check, the way all six known doors were.");
process.exit(0);
