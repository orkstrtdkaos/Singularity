// scripts/skills_inject.mjs — regenerate the derived half of docs/SKILLS.md from the live corpus.
//
// ⛔ THE FILE SAID "GENERATED — DO NOT HAND-EDIT, REGENERATE IT" AND NOTHING REGENERATED IT. A derived
// document with no deriver is a stale document carrying a promise: its own instruction could not be
// followed, and the first craft added made it quietly wrong while it still claimed to be the source of
// truth.
//
// ⛔ IT DOES NOT WRITE UNLESS YOU PASS `--write`. Default is a diff. Aevi regenerates this file by hand
// today, and a generator that clobbers a file someone is editing is worse than no generator.
//
// ═══ THE PLACEMENT RULE, WHICH IS THE WHOLE REASON THIS TOOK TWO ATTEMPTS ═══
//
// ⚠️ ERIK, 2026-09-02 — SETTLED: "harmonic (16) and radiant_folk (15) ARE FOOTHILLS, THEY ARE NOT GOING ON
// THE RING." A foothill craft is placed by its OWN `axes` vector, its access is the band `folk`, and
// `domainOfTradition()` returning null is CORRECT, not a gap — a folk craft does not need a domain because
// it is not domain-gated, and a ring position would GATE what is meant to be ungated.
//
// ⛔ SO A FOOTHILL IS NOT FILED UNDER A POLE. My first attempt filed `radiant_folk`'s 15 crafts under
// Radiance and would have produced blazeborn 16 + 15 = 31 — which is what the file said before the revert,
// and what the revert is undoing. ⚠️ THE RESOLUTION IS CRAFT-LEVEL, NOT TRADITION-LEVEL: a craft's axes
// place it on the wheel; its tradition is still its own.
//
// ⚠️ GROUPING IS THEREFORE BY TRADITION, and the ring decides which traditions are DOMAIN sections. The
// foothills and the small non-ring lineages get their own sections after the domains, so nothing is
// dropped and nothing is filed somewhere it does not belong.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// ⚠️ `--out <path>` WRITES A PREVIEW ELSEWHERE. Aevi regenerates this file by hand today, so being able to
// see what the generator WOULD produce, without touching hers, is the difference between a tool she can
// check and one that fights her.
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
const isFolk = (t) => !!idx.folkIds?.has?.(t);

// ── every craft under its OWN tradition. Nothing is re-filed. ──
const byTrad = {};
for (const a of abilities) if (a.tradition) (byTrad[a.tradition] ||= []).push(a);

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const tierOf = (a) => Math.max(1, Math.min(5, Number(a.tier) || 1));
const sorted = (l) => l.slice().sort((x, y) => (tierOf(x) - tierOf(y)) || String(x.id).localeCompare(String(y.id)));

function rowFor(a) {
  const ranks = (a.tree || []).map(t => t?.name).filter(Boolean).join(" · ");
  const marks = [];
  if (a.folkAccessible) marks.push("folk");
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

// ── the summary: domains only. A foothill has no domain, by ruling. ──
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

// ── ⛔ THE FOOTHILLS, IN THEIR OWN SECTION AND NOT UNDER A POLE. ──
const foothills = Object.keys(byTrad).filter(t => isFolk(t)).sort();
if (foothills.length) {
  const total = foothills.reduce((n, t) => n + byTrad[t].length, 0);
  out.push(`## Foothills — no ring position, no domain · ${total} crafts`, "");
  out.push("⛔ **Erik, 2026-09-02 — settled.** A foothill craft is placed by its own `axes` vector, its access");
  out.push("is the band `folk`, and having no domain is CORRECT rather than missing: **a folk craft is not");
  out.push("domain-gated, and a ring position would gate what is meant to be ungated.**", "");
  for (const t of foothills) {
    const label = idx.byId?.[t]?.name || t;
    out.push(`### ${label} (\`${t}\`) — ${byTrad[t].length} crafts`, "");
    out.push(...tierTables(byTrad[t]));
  }
  out.push("---", "");
}

// ── and anything else with a tradition that is neither pole nor foothill, so nothing is silently dropped ──
const other = Object.keys(byTrad).filter(t => !isPole(t) && !isFolk(t)).sort();
if (other.length) {
  const total = other.reduce((n, t) => n + byTrad[t].length, 0);
  out.push(`## Outside the ring · ${total} crafts`, "");
  out.push("⚠️ **Lineages that are neither a pole nor a foothill.** Listed so nothing in the corpus is absent");
  out.push("from the source of truth.", "");
  for (const t of other) {
    const label = idx.byId?.[t]?.name || t;
    out.push(`### ${label} (\`${t}\`) — ${byTrad[t].length} crafts`, "");
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

const generated = out.join("\n").trimEnd();
const existing = readFileSync(DOC, "utf8");
const hasMarkers = existing.includes(BEGIN) && existing.includes(END);
let next;
if (hasMarkers) {
  const a = existing.indexOf(BEGIN) + BEGIN.length, b = existing.indexOf(END);
  next = existing.slice(0, a) + "\n" + generated + "\n" + existing.slice(b);
} else {
  const at = existing.indexOf("## Summary");
  if (at < 0) { console.log("⛔ `## Summary` not found — REFUSING to guess where the authored header ends"); process.exit(1); }
  next = existing.slice(0, at) + BEGIN + "\n" + generated + "\n" + END + "\n";
}

const noTrad = abilities.filter(a => !a.tradition).length;
const summary = `${domains.length} domains · ${Object.keys(idx.ringPos || {}).length} poles · `
  + `${foothills.length} foothill(s) · ${other.length} other lineage(s) · ${placed} crafts placed`
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
