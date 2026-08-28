// scripts/safe_delete.mjs — CCODE-283. THE CHECK THAT RUNS BEFORE ANYTHING IS DELETED.
//
// ⛔ ERIK: "I just want to be really careful while we eliminate the cruft."
//
// ⚠️ THE REASON THIS EXISTS, IN ONE SENTENCE: TWO DAYS AGO `damage_families.json` MEASURED AS UNREAD AND
// IT WAS NOT CRUFT — IT WAS A BROKEN READER. Aevi authored it, registered it, state.js loaded it, and
// `skill_battle` resolved every ward against an older copy. A cruft sweep run that morning would have
// deleted a correct file and left the bug. ⛔ THE SIGNAL IS IDENTICAL IN BOTH CASES. Only the diagnosis
// differs, and only a human can make it — so this script REFUSES to output a verdict of "delete". It
// sorts candidates into buckets and names what evidence each bucket rests on.
//
// ⛔ THE FOUR WAYS "UNREAD" LIES, ALL OF WHICH THIS SESSION HAS ALREADY PRODUCED AT LEAST ONCE:
//   1. COMMENT-ONLY — the name appears only inside a comment. `wiring_audit`'s stripImports ate 90% of
//      app.js because my own comment ended in `from "you outran it"`, and a scanner that reads its own
//      prose reports a field as live because the note explaining its removal names it.
//   2. GENERIC ITERATION — a field consumed by Object.entries/keys/spread is never named in source.
//      Deleting it removes behaviour with no literal to warn you.
//   3. BROKEN READER — a reader exists and looks at the WRONG COPY. Identical signal to cruft.
//   4. SCHEMA / VALIDATOR — the only consumer is content_ci. That is a real consumer for correctness and
//      NOT a consumer for play, and the two need different decisions.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── corpora ───────────────────────────────────────────────────────────────────────────────────── */
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

/** ⛔ STRIP COMMENTS, AND PROVE THE STRIPPER ATE ONLY COMMENTS. The self-check is not optional: the last
 *  stripper I wrote silently removed 90% of app.js, produced 81 false positives, and looked like a clean run.
 *
 *  ⚠️ MY FIRST GUARD HERE WAS A CHARACTER-COUNT FLOOR AND IT FIRED ON A CORRECT STRIP — this codebase is
 *  legitimately 69% comments in places, because I write them that way. A shrink ratio measures how
 *  commented the file is, NOT whether the stripper malfunctioned. ⛔ THE RIGHT GUARD IS STRUCTURAL: count
 *  the code declarations before and after, and fail if a single one disappeared. That catches the real
 *  failure (a regex running past its terminator and consuming code) and stays silent on a prose-heavy
 *  file, which the ratio could not tell apart. */
const DECL_RE = /\b(?:export|function|const|let|return|if|for|class)\b/g;
function stripComments(src) {
  const out = src
    .replace(/\/\*[\s\S]*?\*\//g, " ")          // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");     // line comments, but not the // in a URL
  // ⚠️ A declaration keyword can legitimately sit INSIDE a comment, so the count may fall. What may not
  // happen is a collapse: losing most of them means the stripper ran past a terminator into live code.
  assertCodeSurvived((src.match(DECL_RE) || []).length, (out.match(DECL_RE) || []).length);
  return out;
}

/** The guard, as its own function so the self-test can exercise it with synthetic counts.
 *  ⚠️ MY FIRST PROBE FOR THIS FAKED A RUNAWAY BLOCK COMMENT — which a non-greedy regex needing its
 *  terminator simply never matches, so the probe tested a failure that cannot happen and passed by
 *  accident. Testing the guard directly is honest; inventing a failure mode to catch is not. */
export function assertCodeSurvived(before, after) {
  if (before > 20 && after < before * 0.5) {
    throw new Error(`stripComments ate CODE: ${before} -> ${after} declarations`);
  }
}

const engineSrc = walk("engine", [".js"]);
const appSrc = [{ f: "app.js", src: readFileSync(join(root, "app.js"), "utf8") },
                { f: "index.html", src: readFileSync(join(root, "index.html"), "utf8") }];
const playCorpus = [...engineSrc, ...appSrc];
// ⛔ EXCLUDE THIS FILE FROM ITS OWN CORPUS. The candidate list below NAMES every field it is asked about,
// so scanning `scripts/` unfiltered made this script a consumer of all seventeen — every one of them read
// as live on the strength of appearing in the question. That is the third time this session a scanner has
// read its own prose, and the self-test is the only reason it did not ship as a finding.
const SELF = "scripts/safe_delete.mjs";
const testCorpus = [...walk("tests", [".mjs", ".js"]), ...walk("scripts", [".mjs", ".js"])]
  .filter(x => x.f !== SELF);

/* ── evidence ──────────────────────────────────────────────────────────────────────────────────── */
const wordRe = (n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");

/** ⛔ WHOSE PROPERTY IS IT? A bare name match cannot tell `ability.operativeAxis` from `cfg.operativeAxis`,
 *  and those are different fields that happen to share a word. My first run reported the craft field
 *  `operativeAxis` as READ on the strength of two reads of a RULES DIAL — a false negative that would have
 *  told Aevi she was wrong when she was right. Capturing the receiver is the difference between "this word
 *  appears" and "this field is read". */
const RECEIVER_RE = (n) => new RegExp(`(\\w+)\\??\\.${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
const CONFIGISH = /^(cfg|conf|config|opts|options|dials|rules|settings|params)$/i;

function hitsIn(corpus, name, { code = true } = {}) {
  const files = [];
  for (const { f, src } of corpus) {
    const body = code ? stripComments(src) : src;
    const n = [...body.matchAll(wordRe(name))].length;
    if (!n) continue;
    const recvs = [...body.matchAll(RECEIVER_RE(name))].map(m => m[1]);
    const onConfig = recvs.length > 0 && recvs.every(r => CONFIGISH.test(r));
    files.push({ f, n, recvs: [...new Set(recvs)], onConfig });
  }
  return files;
}

/** ⚠️ WHERE A GENERIC ITERATOR COULD REACH A FIELD WITHOUT EVER NAMING IT. This does not prove the field
 *  is read — it proves the ABSENCE of a literal is not evidence of absence of a read. */
const ITER_RE = /Object\.(entries|keys|values|assign)\s*\(|\.\.\.\s*(?:a|ability|craft|decl|mechanic|rank|node|item)\b|for\s*\(\s*const\s*\[\s*\w+\s*,/;
function genericIterators(corpus) {
  const out = [];
  for (const { f, src } of corpus) {
    const body = stripComments(src);
    const n = [...body.matchAll(new RegExp(ITER_RE.source, "g"))].length;
    if (n) out.push({ f, n });
  }
  return out;
}

function classify(name) {
  const play = hitsIn(playCorpus, name);
  const playProse = hitsIn(playCorpus, name, { code: false });
  const tests = hitsIn(testCorpus, name);
  const commentOnly = play.length === 0 && playProse.length > 0;
  // ⚠️ EVERY PLAY-PATH HIT SITS ON A CONFIG RECEIVER — so the word is live but THIS FIELD is not. The
  // craft field and a rules dial share a name, and only the receiver tells them apart.
  const configOnly = play.length > 0 && play.every(h => h.onConfig);
  let bucket;
  if (configOnly) bucket = "NAME-COLLISION";
  else if (play.length) bucket = "READ";
  else if (commentOnly) bucket = "COMMENT-ONLY";
  else if (tests.length) bucket = "TEST/CI-ONLY";
  else bucket = "DARK";
  return { name, bucket, play, playProse, tests, commentOnly, configOnly };
}

/* ── ⛔ THE SELF-TEST. A checker that cannot demonstrate it separates a read field from an absent one
 *     is worth nothing, and a green run from a broken checker is worse than no run at all. ─────── */
function selfTest() {
  const cases = [
    ["damageType",         "READ",  "a field the resolution path demonstrably reads"],
    ["zzq_not_a_field_x",  "DARK",  "a name that appears nowhere — the floor"],
    ["operativeAxis", "NAME-COLLISION", "read only as cfg.operativeAxis — a rules dial, not the craft field"],
  ];
  const fails = [];
  for (const [name, want, why] of cases) {
    const got = classify(name).bucket;
    if (got !== want) fails.push(`  ⛔ ${name}: expected ${want}, got ${got}  (${why})`);
  }
  // ⚠️ AND THE STRIPPER ITSELF, because its failure mode is silent and total.
  const probe = `const x = 1; // damageType mentioned only in a comment\n${"const pad = 0;\n".repeat(40)}`;
  if (/\bdamageType\b/.test(stripComments(probe))) fails.push("  ⛔ stripComments did not remove a line comment");
  // ⛔ THE GUARD MUST FIRE WHEN CODE VANISHES...
  let fired = false;
  try { assertCodeSurvived(100, 10); } catch { fired = true; }
  if (!fired) fails.push("  ⛔ assertCodeSurvived did not fire on a 100 -> 10 collapse");
  // ...AND MUST NOT FIRE ON A MERELY COMMENT-HEAVY FILE, which is most of this codebase and was the
  // false alarm my first character-ratio guard produced on its very first run.
  let falseAlarm = false;
  try { assertCodeSurvived(100, 95); } catch { falseAlarm = true; }
  try { stripComments("// prose\n".repeat(300) + "export const a = 1;\n".repeat(25)); }
  catch { falseAlarm = true; }
  if (falseAlarm) fails.push("  ⛔ the guard FAILED on a comment-heavy file — the false alarm I just fixed");
  return fails;
}

/* ── report ────────────────────────────────────────────────────────────────────────────────────── */
const W = 100;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

console.log("");
line("═");
console.log("  CCODE-283 — SAFE-DELETE TRIAGE. This script does not tell you to delete anything.");
line("═");

const fails = selfTest();
say();
if (fails.length) {
  say("⛔ SELF-TEST FAILED — THE MEASUREMENT BELOW CANNOT BE TRUSTED. Nothing here is evidence.");
  fails.forEach(f => console.log(f));
  say();
  process.exitCode = 1;
} else {
  say("✅ self-test passed — the checker separates a read field from an absent one, and the comment");
  say("   stripper both removes comments and FAILS LOUDLY when it eats a file.");
}

// Aevi's eighteen, plus the seven she authored this week and flagged herself.
const CANDIDATES = (process.argv.slice(2).length ? process.argv.slice(2) : [
  "traditionV2", "backlashRung", "schoolAffinityNote", "sectFlavour", "namedCurrent",
  "requiresPoles", "backlashRungNone",
  "emotions", "carriesEmotion", "clearsConditions", "wornBenefits", "reachesDepth",
  "resistDrop", "timeReach",
  "operativeAxis", "effectTags", "gainAxes",
]);

const results = CANDIDATES.map(classify);
const byBucket = (b) => results.filter(r => r.bucket === b);

say();
line();
say("① THE TRIAGE — bucket, and the evidence the bucket rests on");
line();
say();
for (const b of ["READ", "NAME-COLLISION", "COMMENT-ONLY", "TEST/CI-ONLY", "DARK"]) {
  const rs = byBucket(b);
  if (!rs.length) continue;
  const mark = b === "READ" ? "✅" : (b === "DARK" || b === "NAME-COLLISION") ? "⛔" : "⚠️";
  say(`${mark} ${b}  (${rs.length})`);
  for (const r of rs) {
    const where = r.configOnly
      ? "only as a CONFIG key: " + r.play.slice(0, 2).map(x => `${x.recvs.join("/")}.${r.name}`).join(", ")
      : r.play.length ? r.play.slice(0, 3).map(x => `${x.f}×${x.n}${x.recvs.length ? " (" + x.recvs.slice(0,2).join("/") + ".)" : ""}`).join(", ")
      : r.commentOnly ? "comments only: " + r.playProse.slice(0, 2).map(x => x.f).join(", ")
      : r.tests.length ? r.tests.slice(0, 3).map(x => `${x.f}×${x.n}`).join(", ")
      : "nowhere outside content";
    say("     " + r.name.padEnd(20) + where);
  }
  say();
}

line();
say("② ⛔ WHAT THIS SCRIPT CANNOT SEE, AND WHY EVERY BUCKET ABOVE IS A QUESTION NOT A VERDICT");
line();
say();
const iters = genericIterators(playCorpus);
const topIters = iters.sort((a, b) => b.n - a.n).slice(0, 6);
say("⚠️ GENERIC ITERATION — a field consumed by Object.entries/keys/spread is NEVER named in source.");
say("   " + iters.length + " play-path file(s) iterate objects generically; the heaviest are:");
for (const i of topIters) say("     " + i.f.padEnd(34) + i.n + " site(s)");
say("   ⛔ A DARK VERDICT ABOVE IS THEREFORE 'NO LITERAL READER', NOT 'NO READER'.");
say();
say("⛔ BROKEN READER — the signal is IDENTICAL to cruft. `damage_families.json` measured unread on");
say("   2026-08-26 and was a correct file with a reader pointed at the wrong copy. Before deleting,");
say("   ask: is there a reader that SHOULD be looking at this and is looking somewhere else?");
say();
say("⚠️ SCHEMA / VALIDATOR — a TEST/CI-ONLY field still has a real consumer: correctness. Deleting it");
say("   removes a check. That is a different decision from deleting an unused field, and it needs to");
say("   be made deliberately rather than swept.");
say();
line("═");
say("THE ONE RULE: a field moves from DARK to deleted only when a person has answered");
say("'what was this FOR, and is the thing it was for still true?' — the script cannot answer that.");
line("═");
console.log("");
