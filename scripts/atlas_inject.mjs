// scripts/atlas_inject.mjs — regenerate the §13 table inside docs/FIELD_REFERENCE.md, in place.
// ⛔ A HAND-MAINTAINED "WHICH FIELDS ARE READ" TABLE IS WRONG WITHIN A WEEK — the stored-copy-of-a-derived
// -value failure, committed in documentation. So the table is generated between two markers and never typed.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = join(root, "docs/FIELD_REFERENCE.md");
const table = execFileSync(process.execPath, [join(root, "scripts/field_atlas.mjs"), "--md"], { encoding: "utf8" });
let s = readFileSync(p, "utf8");
const A = "<!-- ATLAS:BEGIN -->", B = "<!-- ATLAS:END -->";
const i = s.indexOf(A), j = s.indexOf(B);
if (i < 0 || j < 0) throw new Error("atlas markers missing from docs/FIELD_REFERENCE.md");
const rows = table.split("\n").filter(l => l.startsWith("|")).length;
if (rows < 50) throw new Error(`atlas collapsed to ${rows} rows — refusing to write a truncated table`);
let out = s.slice(0, i + A.length) + "\n" + table.trim() + "\n" + s.slice(j);

// ⛔ AEVI, 2026-08-29: "atlas_inject regenerates the table and not the summary row above it — three
// different READ counts after one field was added." She is right, and the bug is in THIS file: the
// markers wrap only the TABLE, so the SUMMARY a reader actually looks at was left to be typed by hand.
//
// ⚠️ A GENERATOR THAT REGENERATES HALF OF WHAT IT OWNS IS THE STORED-COPY FAILURE WEARING A TOOL'S NAME.
// The whole reason the table is generated is that a hand-kept count is wrong within a week — and the
// summary row is a hand-kept count OF THE GENERATED TABLE, which is the same defect one line higher up.
const counts = {};
for (const row of table.split("\n")) {
  if (!row.startsWith("|")) continue;
  for (const label of ["READ", "DARK", "CI-ONLY", "COLLISION"]) {
    // ⚠️ MATCH THE CELL, NOT A WINDOW AROUND AN EMOJI — the mistake the gate itself already records:
    // an emoji is not two characters, so a two-dot wildcard silently counted zero.
    if (row.includes(" " + label + " |")) { counts[label] = (counts[label] || 0) + 1; break; }
  }
}
let fixed = 0;
for (const [label, n] of Object.entries(counts)) {
  const marker = "**" + label + "** | **";
  const at = out.indexOf(marker);
  if (at < 0) continue;
  const from = at + marker.length;
  const to = out.indexOf("**", from);
  if (to < 0) continue;
  const had = out.slice(from, to);
  if (Number(had) === n) continue;
  out = out.slice(0, from) + n + out.slice(to);
  fixed++;
  console.log("  summary " + label + ": " + had + " -> " + n);
}
writeFileSync(p, out);
console.log("atlas injected: " + (rows - 2) + " fields" + (fixed ? " · " + fixed + " summary count(s) corrected" : ""));