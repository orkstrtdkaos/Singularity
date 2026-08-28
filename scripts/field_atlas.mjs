// scripts/field_atlas.mjs — CCODE-287. EVERY AUTHORED FIELD, WHERE IT LIVES, AND WHO ACTUALLY READS IT.
//
// ⛔ ERIK: "Make sure you document everything you find out about what things actually are and how they work
// extensively. We are DONE with forgetting what things are meant to do and how they actually work or not."
//
// ⚠️ THIS IS THE MACHINE HALF OF `docs/FIELD_REFERENCE.md`. The prose half says what a field MEANS; this
// says whether anything reads it, and it is re-derived on every run so the reference cannot go stale by
// sitting still. ⛔ A HAND-MAINTAINED LIST OF "WHICH FIELDS ARE READ" WOULD BE WRONG WITHIN A WEEK — that
// is the same stored-copy-of-a-derived-value failure the project keeps finding, committed in documentation.
//
// ⛔ THE FOUR WAYS "UNREAD" LIES — all four produced a false finding in this codebase within one day:
//   1. NAME-COLLISION — `operativeAxis` is a CRAFT field and a RULES DIAL. Two owners, one word. Matching
//      the bare name said the craft field was live on the strength of two reads of the dial.
//   2. COMMENT-ONLY — the name appears solely inside a comment, often the comment explaining its removal.
//   3. GENERIC ITERATION — a field consumed by Object.entries/spread is never named in source at all.
//   4. BROKEN READER — a reader exists and looks at the WRONG COPY. `damage_families.json` measured unread
//      and was correct content with a reader pointed at an older file.
//
// ⚠️ SO THIS SCRIPT REPORTS EVIDENCE, NOT VERDICTS, and `docs/FIELD_REFERENCE.md` carries the diagnosis a
// person made. Neither is sufficient alone. That division is the whole point.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(join(root, p), "utf8");

/* ── corpora ──────────────────────────────────────────────────────────────────────────────────── */
function walk(dir, exts, out = []) {
  let entries; try { entries = readdirSync(join(root, dir)); } catch { return out; }
  for (const e of entries) {
    const rel = `${dir}/${e}`;
    let st; try { st = statSync(join(root, rel)); } catch { continue; }
    if (st.isDirectory()) walk(rel, exts, out);
    else if (exts.includes(extname(e))) out.push({ f: rel, src: readFileSync(join(root, rel), "utf8") });
  }
  return out;
}

const DECL_RE = /\b(?:export|function|const|let|return|if|for|class)\b/g;
/** ⛔ STRIP COMMENTS, AND PROVE ONLY COMMENTS WERE EATEN. A ratio guard fires on a correct strip here —
 *  this codebase is legitimately 69% comments — so the guard is STRUCTURAL: count declarations, and fail
 *  only if they collapse. That is the difference between "this file is prose-heavy" and "the regex ran
 *  past its terminator and ate the code", which a character count cannot tell apart. */
function stripComments(src) {
  const out = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const before = (src.match(DECL_RE) || []).length, after = (out.match(DECL_RE) || []).length;
  if (before > 20 && after < before * 0.5) throw new Error(`stripComments ate CODE: ${before} -> ${after}`);
  return out;
}

// ⛔ A FILE THAT LISTS FIELD NAMES AS DATA IS NOT A CONSUMER. `safe_delete.mjs` carries a CANDIDATES array
// naming every field it is asked about, so an unfiltered sweep counted it as the reader of ten fields and
// promoted them from DARK to CI-ONLY — the exact self-reference bug that file was itself written to avoid,
// re-committed one file over. ⚠️ THE RULE GENERALISES: a candidate list, a vocabulary table and a migration
// map all MENTION names without CONSUMING them, and any of them will fake a reader.
const NOT_CONSUMERS = new Set([
  "scripts/field_atlas.mjs",     // this file — its own inventory names every field
  "scripts/safe_delete.mjs",     // a question, not an answer
  "tests/how_it_works.mjs",      // asserts ABOUT fields; naming one is not consuming it
]);
const playFiles = [...walk("engine", [".js"]),
  { f: "app.js", src: rd("app.js") }, { f: "index.html", src: rd("index.html") }];
const testFiles = [...walk("tests", [".mjs", ".js"]), ...walk("scripts", [".mjs", ".js"])]
  .filter(x => !NOT_CONSUMERS.has(x.f));
const playCode = playFiles.map(x => ({ f: x.f, body: stripComments(x.src) }));
const testCode = testFiles.map(x => ({ f: x.f, body: stripComments(x.src) }));

/* ── the authored inventory ───────────────────────────────────────────────────────────────────── */
const ABIL = "content/packs/core/abilities";
const inv = {};   // field -> { n, at: {loc:n} }
const note = (f, loc) => {
  const r = inv[f] || (inv[f] = { n: 0, at: {} });
  r.n++; r.at[loc] = (r.at[loc] || 0) + 1;
};
for (const file of readdirSync(join(root, ABIL)).filter(x => x.endsWith(".json"))) {
  const j = JSON.parse(rd(`${ABIL}/${file}`));
  for (const a of (j.abilities || [])) {
    for (const k of Object.keys(a)) if (!k.startsWith("_")) note(k, "root");
    for (const k of Object.keys(a.mechanic || {})) if (!k.startsWith("_")) note(k, "mechanic");
    for (const t of (a.tree || [])) {
      for (const k of Object.keys(t)) if (!k.startsWith("_")) note(k, "tree");
      for (const k of Object.keys(t.mechanic || {})) if (!k.startsWith("_")) note(k, "tree.mechanic");
    }
    for (const r of (a.rankDeltas || [])) for (const k of Object.keys(r)) if (!k.startsWith("_")) note(k, "rankDeltas");
  }
}

/* ── who reads it ─────────────────────────────────────────────────────────────────────────────── */
const esc = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CONFIGISH = /^(cfg|conf|config|opts|options|dials|rules|settings|params|c|o)$/i;

function readers(name, corpus) {
  const hits = [];
  const word = new RegExp(`\\b${esc(name)}\\b`, "g");
  const recv = new RegExp(`(\\w+)\\??\\.${esc(name)}\\b`, "g");
  for (const { f, body } of corpus) {
    const n = [...body.matchAll(word)].length;
    if (!n) continue;
    const rs = [...body.matchAll(recv)].map(m => m[1]);
    hits.push({ f, n, recvs: [...new Set(rs)], onConfig: rs.length > 0 && rs.every(r => CONFIGISH.test(r)) });
  }
  return hits;
}

const rows = [];
for (const [name, rec] of Object.entries(inv)) {
  const play = readers(name, playCode);
  const tests = readers(name, testCode);
  const configOnly = play.length > 0 && play.every(h => h.onConfig);
  const bucket = configOnly ? "COLLISION" : play.length ? "READ" : tests.length ? "CI-ONLY" : "DARK";
  rows.push({ name, n: rec.n, at: rec.at, bucket, play, tests });
}
rows.sort((a, b) => b.n - a.n);

/* ── report ───────────────────────────────────────────────────────────────────────────────────── */
const W = 112;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
const md = process.argv.includes("--md");

const tally = rows.reduce((a, r) => (a[r.bucket] = (a[r.bucket] || 0) + 1, a), {});

if (!md) {
  console.log("");
  line("═");
  console.log("  CCODE-287 — THE FIELD ATLAS. 107 authored fields, and who reads each one.");
  line("═");
  say();
  say(`  ${rows.length} distinct authored fields · ` + Object.entries(tally)
    .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · "));
  say();
  say("  ⚠️ 'DARK' MEANS NO LITERAL READER — NOT 'NO READER'. A field consumed by a generic iterator is");
  say("     never named in source. Read `docs/FIELD_REFERENCE.md` for the diagnosis a person made.");
  say();
  line();
  say("  field".padEnd(26) + "n".padStart(5) + "  bucket".padEnd(13) + "authored at".padEnd(28) + "read by");
  line();
  for (const r of rows) {
    const mark = r.bucket === "READ" ? "✅" : r.bucket === "DARK" ? "⛔" : "⚠️ ";
    const at = Object.entries(r.at).map(([l, c]) => `${l}:${c}`).join(" ");
    const by = r.bucket === "COLLISION" ? "only as " + r.play[0].recvs.slice(0, 2).map(x => `${x}.${r.name}`).join("/")
      : r.play.length ? r.play.slice(0, 2).map(h => h.f.replace("engine/", "")).join(", ") + (r.play.length > 2 ? ` +${r.play.length - 2}` : "")
      : r.tests.length ? r.tests.slice(0, 2).map(h => h.f).join(", ")
      : "—";
    say(`${mark} ${r.name.padEnd(24)}${String(r.n).padStart(5)}  ${r.bucket.padEnd(11)}${at.padEnd(28)}${by}`);
  }
  say();
  line("═");
  say("⛔ THE DARK LIST IS THE WORK QUEUE, AND EVERY ENTRY NEEDS A PERSON'S DIAGNOSIS BEFORE ANY DELETION:");
  say("   is it cruft, a broken reader, a stale migration, or content waiting on a surface nobody built?");
  line("═");
  console.log("");
} else {
  // ⚠️ MARKDOWN FOR THE REFERENCE DOC, so the table there is GENERATED and cannot drift from the corpus.
  console.log("| field | n | authored at | bucket | read by |");
  console.log("|---|---|---|---|---|");
  for (const r of rows) {
    const mark = r.bucket === "READ" ? "✅" : r.bucket === "DARK" ? "⛔" : "⚠️";
    const at = Object.entries(r.at).map(([l, c]) => `\`${l}\`×${c}`).join(" ");
    const by = r.bucket === "COLLISION" ? `only as \`${r.play[0].recvs[0]}.${r.name}\``
      : r.play.length ? r.play.slice(0, 3).map(h => `\`${h.f.replace("engine/", "")}\``).join(", ")
      : r.tests.length ? `_${r.tests.length} test/script only_` : "—";
    console.log(`| \`${r.name}\` | ${r.n} | ${at} | ${mark} ${r.bucket} | ${by} |`);
  }
}
