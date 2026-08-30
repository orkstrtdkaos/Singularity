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
let out = s.slice(0, i + A.length) + "\n" + table.trim() + "\n" + s.slice(j);

// ⛔ THE GENERATOR MUST OWN EVERYTHING IT OWNS. The table between the markers was generated; the two prose
// numbers that state the same total — "N harnesses across" and the "Last measured" stamp — were HAND-KEPT
// COPIES OF A DERIVED VALUE, this project's most-repeated defect. `how_it_works` asserts them, so adding a
// harness turned a green suite red and the repair was to hand-edit two numbers in a third file.
//
// ⚠️ A GATE ON A HAND-KEPT NUMBER DOES NOT MAKE IT FRESH — it makes the staleness noisy. The fix is for the
// number to have ONE source, which is the measurement itself.
const head = execFileSync(process.execPath, [join(root, "scripts/apparatus.mjs")], { encoding: "utf8" });
const files = Number((head.match(/(\d+) files ·/) || [])[1] || 0);
if (!files) throw new Error("could not read the harness count from apparatus.mjs — refusing to stamp a zero");
const version = (readFileSync(join(root, "app.js"), "utf8").match(/APP_VERSION\s*=\s*"([^"]+)"/) || [])[1] || "?";
const today = new Date().toISOString().slice(0, 10);
out = out.replace(/\b\d+ harnesses across\b/, `${files} harnesses across`);
out = out.replace(/\*\*Last measured: [^*]*\*\*/, `**Last measured: ${today} · v${version} · ${files} files.**`);

writeFileSync(p, out);
console.log(`apparatus injected: ${rows - 2} harnesses · stamped ${files} files at v${version}`);
