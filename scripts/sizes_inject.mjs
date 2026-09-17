#!/usr/bin/env node
// sizes_inject.mjs — ⛔ THE THIRD INSTANCE OF A DEFECT THIS REPO HAS ALREADY NAMED TWICE.
//
// ⛑ AEVI, 2026-09-13: "the size table at FIELD_REFERENCE:345 is hand-maintained and two of its ten rows were
// already more than 15% wrong... I corrected them by hand and said in the commit that this is the wrong fix.
// atlas_inject.mjs's own header is the argument: 'a hand-maintained table is wrong within a week — the
// stored-copy-of-a-derived-value failure, committed in documentation.'"
//
// ⚑ SHE IS RIGHT, AND SHE UNDERCOUNTED. Measured at HEAD, THREE rows were past 15%:
//     power_cosmology     doc  7.5 KB  ·  disk 27.5 KB   ⛔ 267% off
//     damage_types        doc  6.8 KB  ·  disk 13.1 KB   ⛔  93% off   (she did not flag this one)
//     energy_costs        doc  2.1 KB  ·  disk  2.4 KB       13% off   (drifting, not yet past the line)
// ⚠️ A TABLE THAT IS WRONG BY 267% IS NOT DOCUMENTATION, IT IS A CLAIM — and the whole point of this table is
// to argue about which unread files are big enough to matter. A wrong size argues for the wrong file.
//
// ⛔ THIS IS THE SAME DEFECT AEVI RULED ON TWICE THIS WEEK IN CONTENT — the energy counts, the damage-type
// counts — in her own words: "a stored copy of a derived number is a staleness generator." It does not stop
// being one because the copy lives in a document.
//
// ⛑ SO THE TABLE IS GENERATED FROM DISK, between markers, with `--check` for the ship. The PROSE around it is
// untouched: which files are unread, and why that matters, is a judgement and stays hers. Only the numbers move.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOC = join(ROOT, "docs/FIELD_REFERENCE.md");
const A = "<!-- SIZES:BEGIN -->", B = "<!-- SIZES:END -->";

// ⛔ THE ROSTER IS THE CLAIM AND STAYS AUTHORED. Which files are unread-but-large is Aevi's finding; this
// script only answers "how large". A name here that no longer exists on disk is itself worth failing on —
// a table row for a deleted file is the same staleness one layer over.
const FILES = ["ability_rename_map", "mechanic_effects", "tempo", "ability_distribution_target",
  "the_veil", "power_cosmology", "damage_types", "healing_intent", "nexuses", "death_domain",
  "companion_template", "energy_costs"];
// ⚑ the two the prose singles out, kept with their marks so regeneration never silently drops an author's emphasis
const MARKS = { ability_rename_map: ["~~`", "`~~ ✅ **WIRED**"], damage_types: ["⛔ `", "`"] };

function sizesOnDisk() {
  const found = {};
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) {
        const base = e.name.replace(/\.json$/, "");
        // ⚠️ LARGEST WINS when a name appears twice in the tree: the table is an argument about WEIGHT, and
        // quietly measuring the smaller copy would understate exactly the thing it exists to show.
        // ⛔ CCODE-357 — MEASURED WITH LF LINE ENDINGS, NOT RAW DISK BYTES. A Windows checkout writes CRLF, so the same file is
        // ~2.6% bigger on one machine than the other: every rebase on this one flipped the table (60.1 KB ↔ 61.7 KB), every push
        // from an LF client flipped it back, and the pre-push ratchet blocked a ship over a line ending twice in one hour.
        // The table is an argument about WEIGHT, and a carriage return is not weight.
        if (FILES.includes(base)) found[base] = Math.max(found[base] || 0, Buffer.byteLength(readFileSync(p, "utf8").replace(/\r\n/g, "\n"), "utf8"));
      }
    }
  })(join(ROOT, "content"));
  return found;
}

function render() {
  const sizes = sizesOnDisk();
  const missing = FILES.filter(f => !sizes[f]);
  const kb = (n) => (n / 1024).toFixed(1);
  const cell = (f) => { const m = MARKS[f]; return m ? `${m[0]}${f}${m[1]}` : `\`${f}\``; };
  // two columns, as the hand-written table had — ordered by size, biggest first, which is the argument
  const rows = FILES.filter(f => sizes[f]).sort((a, b) => sizes[b] - sizes[a]);
  const half = Math.ceil(rows.length / 2);
  const lines = ["| file | size | | file | size |", "|---|---|---|---|---|"];
  for (let i = 0; i < half; i++) {
    const l = rows[i], r = rows[i + half];
    lines.push(`| ${cell(l)} | ${kb(sizes[l])} KB | | ${r ? cell(r) : ""} | ${r ? kb(sizes[r]) + " KB" : ""} |`);
  }
  return { body: lines.join("\n"), missing, sizes };
}

const check = process.argv.includes("--check");
/* ⛔ CCODE-399b — A GENERATOR'S `--check` MAY NOT FAIL ON THE LINE ENDINGS GIT ITSELF CHOSE. This script writes `\n` and git checks
 * the file out with `\r\n` on Windows, so a whole-file `===` reported DRIFT on a table whose every number was right — and the diagnostic
 * loop underneath then printed nothing, because no number was off. ⚑ It has cost two ships: the red appears the moment anyone else
 * commits this file (the rebase re-checks it out) and never in CI, where the checkout is `\n`. The comparison is about CONTENT; the
 * endings are the checkout's business. ⚠️ And the writer keeps whatever the file already used, so a run does not dirty the tree. */
const NL_ = (s) => String(s).replace(/\r\n/g, "\n");
const keepEol_ = (s, like) => (/\r\n/.test(like) ? NL_(s).replace(/\n/g, "\r\n") : NL_(s));

const src = readFileSync(DOC, "utf8");
const { body, missing, sizes } = render();

if (missing.length) {
  console.log(`  FAIL  sizes_inject: ${missing.length} file(s) in the table no longer exist on disk: ${missing.join(", ")}`);
  console.log(`        A row for a deleted file is the same staleness this script exists to stop — remove it from FILES.`);
  process.exit(1);
}
if (!src.includes(A) || !src.includes(B)) {
  console.log(`  FAIL  sizes_inject: the markers ${A} / ${B} are not in docs/FIELD_REFERENCE.md — nothing to stamp into.`);
  process.exit(1);
}
const before = src.slice(0, src.indexOf(A) + A.length);
const after = src.slice(src.indexOf(B));
const next = `${before}\n${body}\n${after}`;

if (check) {
  if (NL_(next) === NL_(src)) { console.log(`  ok    sizes_inject: the size table matches disk (${FILES.length} files)`); process.exit(0); }
  console.log("  FAIL  sizes_inject: the size table has drifted from disk — run `node scripts/sizes_inject.mjs`");
  const cur = src.slice(src.indexOf(A) + A.length, src.indexOf(B));
  for (const f of FILES) {
    const m = cur.match(new RegExp(`${f}[^|]*\\|\\s*([\\d.]+) KB`));
    if (!m) { console.log(`        ${f}: not in the table`); continue; }
    const was = Number(m[1]), now = Number((sizes[f] / 1024).toFixed(1));
    if (Math.abs(was - now) >= 0.05) console.log(`        ${f}: says ${was} KB, disk is ${now} KB${Math.abs(now - was) / was > 0.15 ? "   ⛔ past 15%" : ""}`);
  }
  process.exit(1);
}
writeFileSync(DOC, keepEol_(next, src));
console.log(`  stamped sizes_inject: ${FILES.length} file sizes in docs/FIELD_REFERENCE.md, from disk`);
