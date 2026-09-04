// scripts/subject.mjs — SPEC_associativity: ONE SUBJECT, EVERY LAYER, AND THE ABSENCES.
//
// ⛔ THE FAILURE THIS ANSWERS: foothills were described in seven places that could not see each other, and
// three wrong reports came from three different layers in one day. This is the join Erik asked for — not a
// wiki, a report: given a subject, list every layer that mentions it and, more usefully, every layer that does
// NOT, with the two flags that cost the most time (ruled-but-not-enacted, enacted-but-not-built).
//
// ⚠️ DERIVED, NOT DECLARED (Aevi §3, and she was right that a declared `subjects:` line rots like a stored
// count). The only hand-kept part is SYNONYMS — a short map from a subject to the words it goes by, because
// synonymy is the one thing a scan cannot derive (`foothillOf` and `foothills.json` are one subject; no grep
// knows that). Everything else is measured on every run. ⛔ §63 gates that every synonym still resolves
// somewhere, so the map cannot rot silently either.
//
// Run:  node scripts/subject.mjs foothills          (a subject key, or any bare term)
//       node scripts/subject.mjs foothills --json   (for the gate)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => relative(root, p).replace(/\\/g, "/");

/** ⚠️ THE HAND-KEPT PART. A subject → the terms it goes by across layers. Keep it short; §63 checks every term
 *  still hits at least one layer, so a dead synonym is red rather than quietly wrong. */
export const SYNONYMS = {
  "foothills":          ["foothill", "foothillOf", "learnedAt", "_twoAxes", "lineage", "R33"],
  "lineage-vs-access":  ["learnedAt", "lineage", "access", "R33", "_twoAxes"],
  "folk-traditions":    ["folkAccessible", "folk tradition", "isFolkTradition", "isPoleTradition", "valley_craft"],
  "npc-sheets":         ["sheetFor", "npcsheet", "growthFor", "npcStanding", "tierFloor", "R30", "R31", "R32"],
  "holdings":           ["holding", "releaseHolding", "transferHolding", "holdingOps", "unstewarded"],
  "ground":             ["substrateBand", "sourceBands", "craftSource", "groundCardFor", "bandFactor", "powerSystem"],
  "battle-declaration": ["enrichDecl", "playerDecl", "sbDeclare", "battleSkillsFor", "energyCost"],
  "backlash":           ["backlash", "backlashRung", "shouldBacklash", "applyBacklash", "R5", "R18"],
  // ⚠️ NARROW ON PURPOSE: `sacred`/`locus` are location tags with their own readers and would make a spec-only
  // idea look built. The report should say ORPHAN until an engine reader names the field.
  "meaning-density":    ["meaningDensity", "meaningCharge", "meaningAura"],
  // ✅ 2026-09-04 — the combat floor (R34/R35): the tick's four dials, the level break, the death save and its seal.
  "combat-pressure":    ["pressureEvent", "breakAtLevelFraction", "breakAtPressure", "opponentHealthLoss", "deathSave", "killCost", "saveBonus", "craftSealedUntilRest", "R34", "R35"],
  "lethal-harm":        ["deathSave", "killCost", "harmRung", "saveBonus", "R35"],
};

const esc = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const word = (t) => new RegExp("(^|[^A-Za-z0-9_])" + esc(t) + "(?![A-Za-z0-9_])", "i");

function walk(dir, exts, out = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { if (!/node_modules|\.git|characters/.test(e)) walk(p, exts, out); }
    else if (exts.some(x => e.endsWith(x))) out.push(p);
  }
  return out;
}
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** The LAYERS, each a list of { file, body }. ⚠️ ENGINE and UI are scanned with comments stripped — a comment
 *  naming a thing is not a reader of it (FIELD_REFERENCE §1, the sixth way "unread" lies). */
function layers() {
  const hiw = read(join(root, "docs/HOW_IT_WORKS.md")).split("\n");
  let lastRow = -1; hiw.forEach((l, i) => { if (/^\|\s*\d\d-\d\d\s*\|/.test(l)) lastRow = i; });
  const L = {
    TRUTH:    [{ file: "docs/HOW_IT_WORKS.md (body)", body: hiw.slice(lastRow + 1).join("\n") }],
    LOG:      [{ file: "docs/HOW_IT_WORKS.md (log)", body: hiw.slice(0, lastRow + 1).join("\n") }],
    RULING:   walk(join(root, "po"), [".md"]).filter(p => /RULING_/.test(p)).map(p => ({ file: rel(p), body: read(p) })),
    SPEC:     walk(join(root, "po"), [".md"]).filter(p => /SPEC_|DESIGN_|AUDIT_|POSTMORTEM_/.test(p)).map(p => ({ file: rel(p), body: read(p) })),
    CONTENT:  walk(join(root, "content"), [".json"]).map(p => ({ file: rel(p), body: read(p) })),
    ENGINE:   walk(join(root, "engine"), [".js"]).map(p => ({ file: rel(p), body: stripComments(read(p)) })),
    UI:       [{ file: "app.js", body: stripComments(read(join(root, "app.js"))) }],
    TESTS:    walk(join(root, "tests"), [".mjs"]).map(p => ({ file: rel(p), body: stripComments(read(p)) })),
    DOCS:     ["FIELD_REFERENCE", "PLAYERS_GUIDE", "SKILLS", "RULINGS", "BALANCE", "PIPELINE", "ARCS", "APPARATUS", "ROSTER"].map(n => ({ file: `docs/${n}.md`, body: read(join(root, `docs/${n}.md`)) })),
  };
  return L;
}

/** Rulings index: R-number → { subject, enacted } from docs/RULINGS.md (the index, not the authority). */
function rulingsIndex() {
  const out = {};
  for (const line of read(join(root, "docs/RULINGS.md")).split("\n")) {
    const m = line.match(/^\|\s*\*\*(R\d{1,2})\*\*\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/);
    if (m) out[m[1]] = { subject: m[2].trim(), enacted: /✅/.test(m[4]) };
  }
  return out;
}

export function report(subject) {
  const terms = SYNONYMS[subject] || [subject];
  const L = layers();
  const hits = {};
  for (const [layer, files] of Object.entries(L)) {
    hits[layer] = [];
    for (const { file, body } of files) {
      const found = terms.filter(t => word(t).test(body));
      if (found.length) hits[layer].push({ file, terms: found });
    }
  }
  // content-file `_`-key rulings: a `_key` whose value states a rule about one of the terms (Q2 of the spec —
  // the shape that hid R33: an underscore key holding prose that contains the term AND a ruling word)
  const contentRulings = [];
  for (const { file, body } of L.CONTENT) {
    let j; try { j = JSON.parse(body); } catch { continue; }
    const scan = (o, path) => {
      if (!o || typeof o !== "object") return;
      for (const [k, v] of Object.entries(o)) {
        const p = path ? path + "." + k : k;
        if (k.startsWith("_") && typeof v === "string" && terms.some(t => word(t).test(v)) && /RULED|ruling|Erik|⛔|must|never/i.test(v)) contentRulings.push({ file, key: p });
        else if (typeof v === "object") scan(v, p);
      }
    };
    scan(j, "");
  }
  const idx = rulingsIndex();
  const rNums = terms.filter(t => /^R\d{1,2}$/.test(t));
  const ruled = rNums.map(r => ({ id: r, ...(idx[r] || { subject: null, enacted: null, indexed: false }), indexed: !!idx[r] }));
  const flags = [];
  for (const r of ruled) {
    if (!r.indexed) flags.push(`RULED BUT NOT INDEXED — ${r.id} is a term of this subject and docs/RULINGS.md has no row for it`);
    else if (!r.enacted) flags.push(`RULED BUT NOT ENACTED — ${r.id} (${r.subject}) is indexed ⬜; the TRUTH layer does not carry it`);
  }
  if (contentRulings.length && !hits.RULING.length) flags.push(`RULING IN A CONTENT FILE ONLY — ${contentRulings.map(c => c.file + " → " + c.key).join(", ")} states a rule and no po/RULING_ carries the subject`);
  if (hits.TRUTH.length && !hits.ENGINE.length && !hits.UI.length) flags.push("ENACTED BUT NOT BUILT — the truth layer describes it and no engine or UI reader names it");
  if ((hits.ENGINE.length || hits.UI.length) && !hits.TRUTH.length) flags.push("BUILT BUT NOT IN THE TRUTH — engine/UI carry it and HOW_IT_WORKS's body never says so");
  if (hits.TESTS.length && !hits.ENGINE.length && !hits.UI.length) flags.push("TESTED, NOT BUILT — only the suite names it (a fixture that production never builds)");
  const orphan = Object.values(hits).filter(v => v.length).length === 1;
  if (orphan) flags.push("ORPHAN — exactly one layer mentions it: either the only source, or dead");
  return { subject, terms, hits, contentRulings, ruled, flags };
}

// ── CLI ──
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const subject = process.argv[2];
  if (!subject) { console.log("usage: node scripts/subject.mjs <subject|term> [--json]\nsubjects: " + Object.keys(SYNONYMS).join(", ")); process.exit(2); }
  const r = report(subject);
  if (process.argv.includes("--json")) { console.log(JSON.stringify(r)); process.exit(0); }
  console.log(`\n  SUBJECT ${r.subject}  ·  terms: ${r.terms.join(" · ")}\n`);
  for (const [layer, list] of Object.entries(r.hits)) {
    console.log(`  ${list.length ? "✅" : "⛔"} ${layer.padEnd(8)} ${list.length ? list.length + " file(s)" : "— nothing"}`);
    for (const h of list.slice(0, 8)) console.log(`       ${h.file}  [${h.terms.join(", ")}]`);
    if (list.length > 8) console.log(`       … and ${list.length - 8} more`);
  }
  if (r.contentRulings.length) { console.log("\n  ⚑ rulings living in content-file _keys:"); for (const c of r.contentRulings) console.log(`       ${c.file} → ${c.key}`); }
  if (r.ruled.length) { console.log("\n  R-numbers of this subject:"); for (const x of r.ruled) console.log(`       ${x.id}  ${x.indexed ? (x.enacted ? "✅ enacted" : "⬜ indexed, NOT enacted") : "⛔ not in the index"}${x.subject ? "  (" + x.subject + ")" : ""}`); }
  console.log("\n  " + (r.flags.length ? "⛔ THE ABSENCES:" : "✅ no absences flagged"));
  for (const f of r.flags) console.log("     " + f);
  console.log("");
}
