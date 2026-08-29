// scripts/apparatus_inject.mjs — write the generated inventory into docs/APPARATUS.md §5, in place.
// ⛔ Same contract as atlas_inject: a hand-kept list of "which harnesses are gates" is wrong within a week.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = join(root, "docs/APPARATUS.md");
const table = execFileSync(process.execPath, [join(root, "scripts/apparatus.mjs"), "--md"], { encoding: "utf8" });
const s = readFileSync(p, "utf8");
const A = "<!-- APPARATUS:BEGIN -->", B = "<!-- APPARATUS:END -->";
const i = s.indexOf(A), j = s.indexOf(B);
if (i < 0 || j < 0) throw new Error("apparatus markers missing");
const rows = table.split("\n").filter(l => l.startsWith("|")).length;
if (rows < 40) throw new Error(`inventory collapsed to ${rows} rows — refusing to write a truncated table`);
writeFileSync(p, s.slice(0, i + A.length) + "\n" + table.trim() + "\n" + s.slice(j));
console.log(`apparatus injected: ${rows - 2} harnesses`);
