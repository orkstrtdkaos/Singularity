// scripts/skills_inject.mjs — regenerate the derived half of docs/SKILLS.md from the live corpus.
//
// ⛔ THE FILE SAID "GENERATED — DO NOT HAND-EDIT, REGENERATE IT" AND NOTHING REGENERATED IT. A derived
// document with no deriver is a stale document carrying a promise: its own instruction could not be
// followed, and the first craft added made it quietly wrong while it still claimed to be the source of
// truth.
//
// ⛔ IT DOES NOT WRITE UNLESS YOU PASS `--write`. Default is a diff. Aevi may be regenerating this file by
// hand at the same time, and a generator that clobbers a file someone is editing is worse than no generator.
//
// ═══ R33 (SNG-443) — LINEAGE AND ACCESS ARE TWO AXES, AND THE GENERATOR MUST NOT CONFUSE THEM ═══
//
// ⚠️ `tradition` IS THE LINEAGE — permanent, keys the wheel position, the power source, the aesthetic.
// `learnedAt` IS THE ACCESS — situational, names WHERE a person can be taught it: a foothill, a school, a
// place, the wilds. ⛔ A FOOTHILL IS A PLACE OF ACCESS, NOT A NEW ANCESTRY — "Hardline teaches the Edge; it
// does not own it." Grouping crafts by treating a foothill as if it were a lineage is the exact error R33
// exists to correct, and this generator committed it once already: my first version filed `radiant_folk`'s
// 15 crafts under Radiance as if the tradition field itself named a pole, producing blazeborn 16 + 15 = 31 —
// which is what the doc said before the correction, and exactly what the correction undoes.
//
// ⛔ MY SECOND VERSION THEN MADE THE OPPOSITE ERROR, ALSO NAMED IN R33: it pulled every non-pole tradition
// into a "Foothills — no ring position, no domain" section and asserted that absence was correct. R33 says
// the reverse — "A foothill CRAFT has a lineage and therefore a domain. It is the PLACE that has no ring
// position." Declaring a craft domain-less because its `tradition` field was momentarily a place-name was
// asserting a fact about the CONTENT that only an author can settle, which is exactly the trap
// SPEC_associativity.md names: "a hand-declared line will rot exactly like the stored counts this file
// already forbade and then carried once."
//
// ✅ SO THE GENERATOR DOES THE MINIMUM IT IS ENTITLED TO DO, AND NO MORE:
//   1. Group strictly by `tradition`. A pole tradition gets its domain section, same as always.
//   2. Surface `learnedAt` on the row as an access marker — the field R33 names, never invented.
//   3. NEVER GUESS A LINEAGE. `foothills.json`'s blends (harmonic: threnodist 0.5 · lattice 0.3 · mason
//      0.2, radiant_folk: blazeborn 0.5 · wright 0.3 · lattice 0.2, and so on) are WEIGHTS ACROSS A WHOLE
//      FOOTHILL, not a per-craft assignment — deciding which of three parents ONE craft actually descends
//      from is authoring, and it is Aevi's, not a formula this file can run.
//   4. A `tradition` that is not (yet) a real pole is placed honestly, in a section that says what it is —
//      pending R33 migration, or genuinely something else — never in a section that asserts the absence is
//      correct. ⚠️ ONCE AEVI RE-AUTHORS `tradition` TO THE REAL LINEAGE POLE (with `learnedAt` carrying the
//      foothill), those crafts fall out of that section and into their domain automatically, on the next
//      run. NOTHING IN THIS FILE NEEDS TO CHANGE WHEN SHE DOES.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// ⚠️ `--out <path>` WRITES A PREVIEW ELSEWHERE, so this can be checked without ever touching the real file.
const outArg = process.argv.indexOf("--out");
const DOC = outArg > -1 && process.argv[outArg + 1] ? process.argv[outArg + 1] : join(root, "docs/SKILLS.md");
const BEGIN = "<!-- BEGIN skills-generated -->";
const END = "<!-- END skills-generated -->";
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");

const C = await loadContentHeadless();
const idx = C.traditionIndex;
const abilities = Object.values(C.abilities);

const isPole = (t) => t && idx.ringPos?.[t] !== undefined;

// ⚠️ `foothills.json` names which non-pole tradition VALUES are places Erik has already ruled on, so the
// pending section can say "this is a known foothill awaiting its per-craft lineage" rather than leaving an
// author to wonder whether it is tracked at all.
let foothillPlaces = {};
try {
  const fj = JSON.parse(readFileSync(join(root, "content/packs/core/rules/foothills.json"), "utf8"));
  foothillPlaces = fj.foothills || {};
} catch { /* absent means unknown — the pending section still lists everything honestly */ }

// ── every craft under its OWN tradition. Nothing is re-filed, nothing is guessed. ──
const byTrad = {};
for (const a of abilities) if (a.tradition) (byTrad[a.tradition] ||= []).push(a);

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const tierOf = (a) => Math.max(1, Math.min(5, Number(a.tier) || 1));
const sorted = (l) => l.slice().sort((x, y) => (tierOf(x) - tierOf(y)) || String(x.id).localeCompare(String(y.id)));

function rowFor(a) {
  const ranks = (a.tree || []).map(t => t?.name).filter(Boolean).join(" · ");
  const marks = [];
  if (a.folkAccessible) marks.push("folk");
  // ⚠️ R33 — THE ACCESS FIELD, SURFACED, NEVER INVENTED. Six crafts carry it today (thrown_edge,
  // drawn_bow, …), each already on a real pole; this is what lets a reader see "learned at: hardline" on
  // a craft whose lineage is `marcher`, which is the whole point of separating the two axes.
  if (a.learnedAt) marks.push("learnedAt:" + a.learnedAt);
  if (a.harmRung && a.harmRung !== "none") marks.push("harm:" + a.harmRung);
  if (a.backlashRung && a.backlashRung !== "none") marks.push("backlash:" + a.backlashRung);
  const tail = marks.length ? "  ⚑ " + marks.join(" · ") : "";
  return `| \`${a.id}\` | **${esc(a.name || a.id)}** | ${a.energyCost ?? "—"} | ${esc(a.attribute || "—")} | `
    + `${esc((a.functions || []).join(","))} | ${esc(ranks)}${tail} |`;
}

function tierTables(list) {
  const out = [];
  for (const tier of [1, 2, 3, 4, 5]) {
    const rows = sorted(list).filter(a => tierOf(a) === tier);
    if (!rows.length) continue;
    out.push(`**Tier ${tier}**`, "");
    out.push("| id | name | energy | attr | functions | ranks |", "|---|---|---|---|---|---|");
    for (const a of rows) out.push(rowFor(a));
    out.push("");
  }
  return out;
}

const out = [];
const domains = Object.entries(idx.domainById || {}).sort((a, b) => a[1].pos - b[1].pos);

// ── the summary: domains only. Poles are lineages; only a lineage has a domain. ──
out.push("## Summary", "");
out.push("| pos | domain | antipode | sects | crafts | T1 | T2 | T3 | T4 | T5 |");
out.push("|---|---|---|---|---|---|---|---|---|---|");
for (const [name, d] of domains) {
  const sects = d.sects || [];
  const crafts = sects.flatMap(s => byTrad[s[1]] || []);
  const t = [1, 2, 3, 4, 5].map(n => crafts.filter(a => tierOf(a) === n).length);
  out.push(`| ${d.pos} | **${name}** | ${d.anti} | ${sects.map(s => s[0]).join(", ")} | **${crafts.length}** | ${t.join(" | ")} |`);
}
out.push("", "---", "");

for (const [name, d] of domains) {
  const sects = d.sects || [];
  const all = sects.flatMap(s => byTrad[s[1]] || []);
  out.push(`## ${name} — ring ${d.pos}, opposite **${d.anti}** · ${all.length} crafts`, "");
  for (const [label, sectId] of sects) {
    const list = byTrad[sectId] || [];
    out.push(`### ${label} (\`${sectId}\`) — ${list.length} crafts`, "");
    out.push(...tierTables(list));
  }
  out.push("---", "");
}

// ── ⛔ R33 — CRAFTS AWAITING THEIR PER-CRAFT LINEAGE. This is NOT "correctly absent"; it is a queue. ──
const pending = Object.keys(byTrad).filter(t => !isPole(t)).sort();
if (pending.length) {
  const total = pending.reduce((n, t) => n + byTrad[t].length, 0);
  out.push(`## Pending R33 lineage assignment · ${total} crafts`, "");
  out.push("⛔ **R33 (SNG-443): `tradition` is LINEAGE, `learnedAt` is ACCESS.** Every craft below still");
  out.push("carries a PLACE (or an unresolved value) in its `tradition` field where a real pole belongs.");
  out.push("⚠️ **This is not a corrected state — it is the error R33 names, not yet re-authored.** A foothill");
  out.push("craft has a lineage and therefore a domain; only the PLACE has no ring position. ⛔ **This");
  out.push("generator does not assign the lineage** — `foothills.json`'s blends are weights across a whole");
  out.push("foothill, and which parent one craft actually descends from is authoring, not arithmetic. Once");
  out.push("`tradition` is corrected to the real pole (with `learnedAt` carrying the place), these crafts");
  out.push("fall into their domain section automatically on the next run.", "");
  for (const t of pending) {
    const blend = foothillPlaces[t];
    const known = blend?.parents
      ? `known foothill — blend: ${Object.entries(blend.parents).map(([p, w]) => `${p} ${w}`).join(" · ")}`
      : "not in foothills.json — genuinely unresolved, not a place-lineage confusion";
    out.push(`### \`${t}\` — ${byTrad[t].length} crafts (${known})`, "");
    out.push(...tierTables(byTrad[t]));
  }
  out.push("---", "");
}

// ⛔ NOTHING MAY BE LOST. A generator that drops a craft is worse than a stale file.
const placed = Object.values(byTrad).reduce((n, l) => n + l.length, 0);
const withTrad = abilities.filter(a => a.tradition).length;
if (placed !== withTrad) {
  console.log(`⛔ ${withTrad - placed} craft(s) with a tradition were not placed — REFUSING to write`);
  process.exit(1);
}

const existingRaw = readFileSync(DOC, "utf8");
// ⚠️ MATCH THE FILE’S OWN LINE ENDING, or every line reads as changed on Windows and the diff is noise.
const eol = existingRaw.includes("\r\n") ? "\r\n" : "\n";
const generated = out.join(eol).trimEnd();
const existing = existingRaw;
const hasMarkers = existing.includes(BEGIN) && existing.includes(END);
let next;
if (hasMarkers) {
  const a = existing.indexOf(BEGIN) + BEGIN.length, b = existing.indexOf(END);
  next = existing.slice(0, a) + eol + generated + eol + existing.slice(b);
} else {
  const at = existing.indexOf("## Summary");
  if (at < 0) { console.log("⛔ `## Summary` not found — REFUSING to guess where the authored header ends"); process.exit(1); }
  next = existing.slice(0, at) + BEGIN + eol + generated + eol + END + eol;
}

// THE HEADER IS DERIVED TOO, AND NOTHING DERIVED IT. Five numbers sat ABOVE the generated markers in a
// file whose second line reads "This file is DERIVED. Do not hand-edit — regenerate it." They were kept
// by hand, they went stale the moment a craft landed, and `how_it_works` §55 gates all five — so the
// staleness was noisy rather than prevented. That is this project's most-repeated defect, sitting in the
// document that calls itself the source of truth. The generator that computes these numbers now writes them.
const headerLine = `**${placed} crafts · ${domains.length} domains · ${Object.keys(idx.ringPos || {}).length} poles · `
  + `${abilities.filter(a => a.folkAccessible).length} folk-accessible`
  + (pending.length ? ` · ${pending.reduce((n, t) => n + byTrad[t].length, 0)} pending R33` : "") + "**";
const HEADER_RE = /^\*\*\d+ crafts · \d+ domains · \d+ poles · \d+ folk-accessible[^\n]*\*\*$/m;
if (!HEADER_RE.test(next)) { console.log("⛔ the header claim line was not found — REFUSING to guess where it is"); process.exit(1); }
next = next.replace(HEADER_RE, () => headerLine);

const noTrad = abilities.filter(a => !a.tradition).length;
const summary = `${domains.length} domains · ${Object.keys(idx.ringPos || {}).length} poles · `
  + `${pending.length} lineage(s) pending R33 (${pending.reduce((n, t) => n + byTrad[t].length, 0)} crafts) · ${placed} crafts placed`
  + (noTrad ? ` · ⚠️ ${noTrad} craft(s) carry no tradition and are not listed` : "");

if (CHECK) {
  const same = next === existing;
  console.log(same ? `✅ docs/SKILLS.md is fresh — ${summary}`
    : `⚠️ docs/SKILLS.md is STALE — ${summary}\n   run: node scripts/skills_inject.mjs --write`);
  process.exit(same ? 0 : 1);
}
if (!WRITE) {
  const a = existing.split("\n"), b = next.split("\n");
  let first = -1; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { first = i; break; }
  console.log(`DRY RUN — nothing written. ${summary}`);
  console.log(first < 0 ? "  identical to the file on disk"
    : `  first difference at line ${first + 1}\n    on disk:   ${JSON.stringify(a[first] ?? "(eof)").slice(0, 120)}\n    generated: ${JSON.stringify(b[first] ?? "(eof)").slice(0, 120)}`);
  console.log(`  lines: ${a.length} on disk → ${b.length} generated`);
  console.log("  pass --write to apply.");
  process.exit(0);
}
writeFileSync(DOC, next);
console.log(`skills injected: ${summary}`);
