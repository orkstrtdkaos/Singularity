// copy_coupling.mjs — SNG-350 step 2. AN INVENTORY. It counts; it authors nothing.
//
// Aevi's test, applied mechanically:
//
//   > Could this string become FALSE if a value or rule in content/packs/core/rules/*.json changed,
//   > without the string itself being touched?    Yes → it is content.  No → it is chrome, and stays.
//
// "Learn" / "Level Up" / "at capacity" as a state label → chrome. "points learn new crafts; depth is
// earned through use" → content, and it WENT false when the rule changed.
//
// ⛔ REPORT ONLY, AND DELIBERATELY NOT A GATE. Aevi: "Count it, author nothing. The copy half is mine."
// A gate here would force me to decide what is content, which is the half that is hers. It exists to give
// her a NUMBER before she scopes the migration — her words: "I expect this to be larger than seven and I
// want the number before scoping."
//
// ⚠️ A HEURISTIC, AND HONEST ABOUT IT. It cannot read intent, so it reports in confidence tiers and shows
// its work: a string is flagged only when it names a RULE CONCEPT and makes a CLAIM about it. Grouped by
// the rules file whose change would falsify it, because that is the migration order — not alphabetical,
// not by screen.
//
// Run: node tests/copy_coupling.mjs [--all]

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOW_ALL = process.argv.includes("--all");
const app = readFileSync(join(root, "app.js"), "utf8");

// ---------- what the rules files actually talk about ----------
// Derived from the rules corpus rather than a list I invented, so a new rules file widens the sweep
// without anyone remembering to update this.
const RULE_FILES = readdirSync(join(root, "content/packs/core/rules")).filter(f => f.endsWith(".json"));
const CONCEPTS = {
  "skill_capacity.json": ["skill point", "skill points", "capacity", "breadth", "crafts known", "learn a new"],
  "resolution.json": ["success chance", "difficulty", "roll", "crit", "critical", "very easy", "very hard", "d100"],
  "sub_attribute_ladder.json": ["sub-attribute", "rank", "max health", "max energy", "attribute point"],
  "companions.json": ["bond", "companion", "stage"],
  "leveling": ["level up", "level ", "xp", "attunement", "sub-attribute point"],
  "energy.json": ["energy", "exhausted", "rest", "recover"],
  "martial_paths.json": ["baseline", "brace", "break away"],
  "standing.json": ["standing", "renown", "reputation"],
  "emergence": ["braid", "emergence", "discovery", "combine"],
};

// A CLAIM is a statement that could be true or false — a cost, a threshold, a rule, a guarantee.
const CLAIM = /\b(cost|costs|grant|grants|require|requires|unlock|unlocks|earn|earned|earns|buy|buys|bought|spend|spends|gain|gains|raise|raises|per |each |every |never|always|only |at least|up to|more than|less than|instead of|rather than|no longer|can be|cannot|can't|must|will|becomes?|turns? into|deepen|deepens)\b/i;
// A NUMBER in player copy is very often a content value restated.
const NUMBER = /(?:^|[^\w#])\d{1,3}(?:%|\s*(?:point|pt|rank|stage|level|day|craft|bond))/i;

// ---------- pull the player-facing strings ----------
// Comments are excluded: this is about what the PLAYER is told, and a comment that describes a rule is
// documentation, not a claim on screen. (It is also where the gate-authoring commentary lives.)
// ⚠️ BLANKED, NOT DROPPED — SNG-350 step 3 needs LINE NUMBERS. Filtering comment lines out shifted every
// index after the first comment, which for a 12,000-line file means every line number in the inventory
// would have been wrong by a growing amount while looking perfectly plausible. Blanking keeps 1:1.
const codeLines = app.split(/\r?\n/).map(l => {
  const t = l.trim();
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return "";
  return l;
}).map(l => {
  // A TRAILING comment survives a line-based strip, and this codebase annotates heavily at end-of-line.
  // Those leaked in as "copy" — `; // SNG-197 p2: in-play braid mint…` was reported as player-facing text.
  // Cut at an unquoted `//` that is not part of a URL; crude, and it only ever removes commentary.
  const i = l.search(/(^|[^:"'`])\/\//);
  return i === -1 ? l : l.slice(0, i);
});
// ⚠️ AND INLINE BLOCK COMMENTS TOO. A line-based strip misses `${/* … */""}` INSIDE a template literal,
// which this codebase uses constantly to annotate markup — and the very first HIGH-confidence finding was
// exactly that: my own commentary ABOUT a rule, reported as copy that STATES one. The inventory has to be
// able to tell those apart, or it inflates its own number with the notes explaining the problem.
// ⚠️ AND THE BLOCK STRIP PRESERVES NEWLINE COUNT, for the same reason: collapsing a 20-line block comment
// to one space would silently renumber everything below it.
const NL350 = String.fromCharCode(10);
const code = codeLines.join(NL350).replace(/\/\*[\s\S]*?\*\//g, (m) => " " + NL350.repeat((m.match(/\n/g) || []).length));

// ---------- THE SURFACE INDEX ----------
// ⛔ AEVI: "`surface` MATTERS MORE THAN `line`." A line number tells her where to look; the surface tells
// her what the player was doing when they read it, which is what she has to write for. So every finding
// carries the enclosing top-level function — the renderer — not just an offset into a 12,000-line file.
const surfaces = [];
codeLines.forEach((l, i) => {
  // ⚠️ TOP-LEVEL DATA TABLES COUNT AS SURFACES TOO, and leaving them out produced a WRONG attribution
  // rather than a missing one: a `const DEV_DIALS = [ … ]` at line 800 inherited `wireLightbox` from 40
  // lines above it, so the inventory said "this sentence is in the lightbox" about a dev dial table.
  // A confidently misfiled row costs the reader more than an unfiled one — it sends them to the wrong screen.
  const m = l.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/)
    || l.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[([{]/);
  if (m) surfaces.push({ line: i + 1, name: m[1] });
});
const surfaceAt = (line) => {
  let best = null;
  for (const s of surfaces) { if (s.line <= line) best = s; else break; }
  return best ? best.name : "(top level)";
};

const strings = [];
for (const re of [/"((?:[^"\\]|\\.){25,300})"/g, /'((?:[^'\\]|\\.){25,300})'/g, /`((?:[^`\\$]|\\.){25,300})`/g]) {
  for (const m of code.matchAll(re)) {
    const s = m[1];
    if (!/\s/.test(s)) continue;                       // an identifier, not a sentence
    if (/^[A-Za-z-]+:\s*[\d.]+/.test(s)) continue;     // a css declaration
    if (/[<>]{1}[a-z]/.test(s) && !/[.!?]/.test(s)) continue;  // markup fragment with no prose
    // ⛔ A BACKTICK PAIR IS NOT A STRING. The template-literal pattern happily matched from the CLOSING
    // backtick of one literal to the OPENING backtick of the next — so live code came back as copy, and
    // the emitted inventory's very first row read `); if (held && !evolutionBudget(held, wd, character)`.
    // An inventory whose top entry is source makes a reader distrust the other 57, which costs more than
    // the row itself. Reject anything carrying tokens player copy does not contain.
    if (/=>|&&|\|\||\)\s*\{|===|!==|\.length\b|\bconst\s|\breturn\s/.test(s)) continue;
    // …and the quieter plumbing the same way: a fragment that begins mid-expression, or carries an array
    // method or a nullish default, is the seam between two template literals rather than a sentence.
    if (/\.(?:join|map|filter|slice|push)\(|\?\?\s/.test(s)) continue;
    if (/^\s*[:}]\s/.test(s)) continue;
    const line = code.slice(0, m.index).split(NL350).length;
    strings.push({ s, line, surface: surfaceAt(line) });
  }
}
// Deduped by STRING AND SURFACE — the same sentence rendered in two panels is two pieces of work for
// Aevi, not one, and collapsing them would hide half the migration.
const seen = new Set();
const uniq = strings.filter(r => { const k = r.surface + " " + r.s; return seen.has(k) ? false : (seen.add(k), true); });

// ---------- apply the coupling test ----------
const findings = [];
for (const rec of uniq) {
  const s = rec.s;
  const low = s.toLowerCase();
  const hits = [];
  for (const [file, words] of Object.entries(CONCEPTS)) {
    if (words.some(w => low.includes(w))) hits.push(file);
  }
  if (!hits.length) continue;
  const claims = CLAIM.test(s), numeric = NUMBER.test(s);
  if (!claims && !numeric) continue;                   // names a concept but asserts nothing → chrome
  findings.push({ s, files: hits, tier: claims && numeric ? "high" : "medium", line: rec.line, surface: rec.surface });
}

// ---------- report ----------
console.log("═".repeat(96));
console.log("SNG-350 step 2 — RULE-COUPLED COPY IN app.js.  AN INVENTORY. Nothing here is authored or moved.");
console.log("═".repeat(96));
console.log(`\nscanned ${uniq.length} distinct player-facing strings (comments excluded) against ${RULE_FILES.length} rules files.\n`);

const high = findings.filter(f => f.tier === "high");
const med = findings.filter(f => f.tier === "medium");
console.log(`  HIGH confidence  (names a rule concept AND makes a claim AND carries a number): ${high.length}`);
console.log(`  MEDIUM           (names a rule concept and makes a claim, no number):           ${med.length}`);
console.log(`  ── TOTAL rule-coupled strings: ${findings.length}`);

const byFile = {};
for (const f of findings) for (const file of f.files) (byFile[file] ||= []).push(f);
console.log("\nBY THE RULES FILE WHOSE CHANGE WOULD FALSIFY THEM — this is the migration order:\n");
for (const [file, list] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(3)}  ${file}`);
}

const show = SHOW_ALL ? findings : high;
console.log(`\n${SHOW_ALL ? "EVERY FINDING" : "THE HIGH-CONFIDENCE SET"} (run with --all for the rest):\n`);
for (const f of show.slice(0, SHOW_ALL ? 999 : 25)) {
  console.log(`  [${f.files.join(", ")}]`);
  console.log(`    ${f.s.replace(/\s+/g, " ").slice(0, 150)}`);
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// SNG-350 step 3 — EMIT THE INVENTORY.  `node tests/copy_coupling.mjs --emit`
// ══════════════════════════════════════════════════════════════════════════════════════════════
//
// ⛔ AEVI AUTHORS FROM THIS FILE; I WIRE THE READER AND DELETE THE INLINES IN THE SAME CHANGE. Both
// halves in one commit is the whole discipline — a promoted string with the inline still in place is two
// sources of truth that agree today, and the SNG-350 defect is exactly what happens when they stop.
//
// ⚠️ THE ORDER IS HERS, NOT THE COUNT'S: energy (14) FIRST, `sub_attribute_ladder` (8) LAST because it
// changed twice today and copy authored against a moving rule is copy authored twice.
if (process.argv.includes("--emit")) {
  const { writeFileSync, mkdirSync } = await import("fs");
  const FIRST = "energy.json", LAST = "sub_attribute_ladder.json";
  // ⚠️ `-1` PUT ENERGY SIXTH. The middle tier ranks by NEGATIVE count, so `emergence` at 13 scored −13 and
  // sorted ahead of the file Aevi explicitly asked for first. A sort key that quietly loses to its own
  // tie-breaker is the same shape as a gate that cannot go red — it looks ordered and obeys nobody.
  const rank = (f) => (f === FIRST ? -1e6 : f === LAST ? 1e6 : (byFile[f]?.length ? -byFile[f].length : 0));
  const rows = findings
    .map(f => ({
      // ⚠️ `falsifiedBy` IS THE FIELD THAT MAKES THIS ACTIONABLE — not "where does this live" but "what
      // change would make this sentence a lie", which is the test Aevi wrote and the reason a string is
      // here at all. A string coupled to two rules files carries both.
      surface: f.surface,
      line: f.line,
      text: f.s.replace(/\s+/g, " ").trim(),
      falsifiedBy: f.files,
      confidence: f.tier,
      // ⛔ NOT AUTHORED, NOT GUESSED. The replacement key is Aevi's to choose; emitting one here would be
      // me authoring copy structure under the label of an inventory.
      promoteTo: null,
    }))
    .sort((a, z) => rank(a.falsifiedBy[0]) - rank(z.falsifiedBy[0]) || a.surface.localeCompare(z.surface) || a.line - z.line);
  const out = {
    note: "SNG-350 step 3 — RULE-COUPLED COPY IN app.js, INVENTORIED. Aevi authors `promoteTo` and the replacement text; CCode wires the reader and deletes the inline IN THE SAME CHANGE. Nothing here has been rewritten or moved.",
    test: "Could this string become FALSE if a value in content/packs/core/rules/*.json changed, without the string itself being touched?",
    order: `energy.json first (Aevi); ${LAST} LAST — it changed twice on 2026-08-07 and copy authored against a moving rule is copy authored twice.`,
    caveat: "A HEURISTIC. It flags a string that names a rule concept AND makes a claim; a claim verb in chrome still lands here. `confidence` is the tier, not a verdict — only a reader settles the borderline ones.",
    countCorrection: "⚠️ THE HEADLINE NUMBER CAME DOWN FROM 56 WHEN THIS WAS EMITTED, and the reason is a defect in my extractor, not a change in the code. The template-literal pattern matched from the CLOSING backtick of one literal to the OPENING backtick of the next, so live source was counted as copy — the first row of the first emit read `); if (held && !evolutionBudget(held, wd, character)`. Fragments carrying tokens player copy never contains (=>, &&, ===, .join(, ?? and a mid-expression opener) are now rejected. The scope is still far larger than the seven Aevi expected; it is 30 rather than 56, and the earlier figure should not be quoted.",
    generatedFrom: "node tests/copy_coupling.mjs --emit",
    counts: { total: rows.length, high: high.length, medium: med.length, byRulesFile: Object.fromEntries(Object.entries(byFile).map(([k, v]) => [k, v.length])) },
    strings: rows,
  };
  try { mkdirSync(join(root, "po/staged_content"), { recursive: true }); } catch { /* already there */ }
  const path = join(root, "po/staged_content/rule_copy_inventory.json");
  writeFileSync(path, JSON.stringify(out, null, 2) + NL350, "utf8");
  console.log(`\n✅ EMITTED ${rows.length} rows → po/staged_content/rule_copy_inventory.json`);
  console.log(`   ordered: ${FIRST} first, ${LAST} last. Every row carries surface, line, falsifiedBy and a null promoteTo for Aevi.`);
  const bySurface = {};
  for (const r of rows) (bySurface[r.surface] ||= 0), bySurface[r.surface]++;
  console.log("\n   BY SURFACE — where the player actually reads them (this is the authoring order within a file):");
  for (const [s, n] of Object.entries(bySurface).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`     ${String(n).padStart(3)}  ${s}`);
  }
}

console.log("\n" + "─".repeat(96));
console.log("⚠️ HEURISTIC, AND THE FALSE POSITIVES ARE REAL. A string naming a concept and using a claim verb");
console.log("   may still be chrome — the test asks whether it could go FALSE, and only a reader can settle");
console.log("   the borderline ones. The number is a SCOPE, not a work order.");
console.log("⛔ NOTHING WAS MOVED OR REWRITTEN. Aevi: \"Count it, author nothing. The copy half is mine.\"");
console.log("─".repeat(96));
