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
writeFileSync(p, s.slice(0, i + A.length) + "\n" + table.trim() + "\n" + s.slice(j));
console.log(`atlas injected: ${rows - 2} fields`);
