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
const codeLines = app.split(/\r?\n/).filter(l => {
  const t = l.trim();
  return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*"));
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
const code = codeLines.join("\n").replace(/\/\*[\s\S]*?\*\//g, " ");

const strings = [];
for (const re of [/"((?:[^"\\]|\\.){25,300})"/g, /'((?:[^'\\]|\\.){25,300})'/g, /`((?:[^`\\$]|\\.){25,300})`/g]) {
  for (const m of code.matchAll(re)) {
    const s = m[1];
    if (!/\s/.test(s)) continue;                       // an identifier, not a sentence
    if (/^[A-Za-z-]+:\s*[\d.]+/.test(s)) continue;     // a css declaration
    if (/[<>]{1}[a-z]/.test(s) && !/[.!?]/.test(s)) continue;  // markup fragment with no prose
    strings.push(s);
  }
}
const seen = new Set();
const uniq = strings.filter(s => (seen.has(s) ? false : (seen.add(s), true)));

// ---------- apply the coupling test ----------
const findings = [];
for (const s of uniq) {
  const low = s.toLowerCase();
  const hits = [];
  for (const [file, words] of Object.entries(CONCEPTS)) {
    if (words.some(w => low.includes(w))) hits.push(file);
  }
  if (!hits.length) continue;
  const claims = CLAIM.test(s), numeric = NUMBER.test(s);
  if (!claims && !numeric) continue;                   // names a concept but asserts nothing → chrome
  findings.push({ s, files: hits, tier: claims && numeric ? "high" : "medium" });
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

console.log("\n" + "─".repeat(96));
console.log("⚠️ HEURISTIC, AND THE FALSE POSITIVES ARE REAL. A string naming a concept and using a claim verb");
console.log("   may still be chrome — the test asks whether it could go FALSE, and only a reader can settle");
console.log("   the borderline ones. The number is a SCOPE, not a work order.");
console.log("⛔ NOTHING WAS MOVED OR REWRITTEN. Aevi: \"Count it, author nothing. The copy half is mine.\"");
console.log("─".repeat(96));
