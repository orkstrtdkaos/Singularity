#!/usr/bin/env node
// scripts/interface_counts.mjs — STAMP THE THREE INTERFACE NUMBERS IN docs/HOW_IT_WORKS.md §12 FROM app.js ITSELF.
//
// ⛔ WHY THIS EXISTS: §12's sentence carries three derived numbers — app.js's line count, its `render*` function count, and the
// number of sites that call the shell `chrome()`. Only the middle one was gated, so the line count drifted 981 lines (the doc said
// 14,928 while the file had grown to 15,909) with the check beside it green the whole way. ⚠️ THE UNGATED HALF OF A GATED SENTENCE
// IS WHERE A STALE NUMBER LIVES.
//
// ⛔ AND THEN GATING ALL THREE WAS NOT ENOUGH: I stamped them by hand, edited app.js twice more in the same session, and the ratchet
// caught the sentence stale again within the hour. A number a human restamps is a number that goes stale between two edits — so it
// is GENERATED, here, and the ship runs this with the other doc generators before the suite.
//
// `--check` verifies without writing (the same contract as certify_counts.mjs and engine_map.mjs).
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const rd = (p) => readFileSync(ROOT + p, "utf8");
const check = process.argv.includes("--check");

const app = rd("app.js");
const lines = app.split(/\r?\n/).length - (app.endsWith("\n") ? 1 : 0);
const fns = [...app.matchAll(/^\s*(?:async )?function (render[A-Za-z]+)/gm)].length;
// ⚠️ THE DEFINITION IS NOT A CALL SITE — `function chrome(` is excluded, so the number is what §12 claims it is: places that paint.
const sites = [...app.matchAll(/(?<!function )\bchrome\(/g)].length;
const fmt = (n) => n.toLocaleString("en-US");

const DOC = "docs/HOW_IT_WORKS.md";
const doc = rd(DOC);
const SENT = /whole interface is \*\*`app\.js`, [\d,]+ lines\*\*, and there are \*\*\d+ `render\*` functions\*\* that paint into one\r?\nshell function, `chrome\(\)`, called from \*\*\d+ sites\*\*\./;
const m = doc.match(SENT);
if (!m) {
  console.error(`  FAIL  interface_counts: §12's sentence in ${DOC} does not match the shape this script stamps — it was reworded, and a generator that silently writes nothing is worse than a red.`);
  process.exit(2);
}
const eol = m[0].includes("\r\n") ? "\r\n" : "\n";
const next = `whole interface is **\`app.js\`, ${fmt(lines)} lines**, and there are **${fns} \`render*\` functions** that paint into one${eol}shell function, \`chrome()\`, called from **${sites} sites**.`;

if (m[0] === next) { console.log(`  ok    interface_counts: ${fmt(lines)} lines · ${fns} render* · ${sites} chrome() sites`); process.exit(0); }
if (check) {
  console.error(`  FAIL  interface_counts: §12 is stale — it says ${m[0].replace(/\r?\n/g, " ")} and app.js is ${fmt(lines)} lines with ${fns} render* functions and ${sites} chrome() sites.`);
  process.exit(1);
}
writeFileSync(ROOT + DOC, doc.replace(SENT, next));
console.log(`  stamped interface_counts: ${fmt(lines)} lines · ${fns} render* · ${sites} chrome() sites`);
