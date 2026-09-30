// ⛑ AEVI, group 3 item 10: *"⬜ Measure first: which readers take a hand COUNT today, and bring me the list before
// changing the record."* This is that list. Nothing is written.
//
// ⛔ ERIK: *"The raised hands need to be individual units I can apply to various tasks (split or combined)."*
//
// ⚠️ A NUMBER HANDED TO THE PO HAS TO BE THE NUMBER SHE THINKS IT IS. My first pass matched `perPass` and reported 69
// "per-hand rate" sites — almost all of them caravan.js's GOODS per pass, nothing to do with hands. The pattern below
// is narrowed to rates that are actually per HAND.
import { readFileSync, readdirSync } from "node:fs";

const files = [
  ...readdirSync("engine").filter(f => f.endsWith(".js")).map(f => `engine/${f}`),
  "app.js",
];
const src = new Map(files.map(f => [f, readFileSync(f, "utf8").replace(/\r\n/g, "\n")]));
const codeOnly = (s) => s.split("\n").map(l => (/^\s*(\/\/|\*|\/\*)/.test(l) ? "" : l)).join("\n");

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}

/* ══ 1 · WHAT SHAPE IS A HAND TODAY, IN THE LIVE SAVES ═══════════════════════════════════ */
console.log(`\n══ 1 · what shape each "hands" field actually has\n`);
const shape = (v) => v == null ? "absent" : Array.isArray(v) ? "array[]" : typeof v === "number" ? "NUMBER" : typeof v;
const tally = {};
const note = (field, v) => { const k = `${field} = ${shape(v)}`; tally[k] = (tally[k] || 0) + 1; };
let holds = 0, bands = 0;
const bandRows = [];
for (const ch of saves) {
  for (const h of ch.holdings || []) { holds++; note("holding.crew", h.crew); note("holding.garrison", h.garrison); }
  for (const b of [...(ch.bands || []), ...(ch.warbands || [])]) {
    bands++;
    note("band.members", b.members); note("band.size", b.size); note("band.count", b.count);
    bandRows.push(`${String(ch.name).padEnd(14)} ${String(b.name || b.id || "a band").slice(0, 26).padEnd(28)} count=${JSON.stringify(b.count)} members=${JSON.stringify(b.members ?? null)}`);
  }
}
console.log(`  ${holds} holding(s) and ${bands} band(s) across ${saves.length} save(s)`);
for (const [k, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}×  ${k}`);

/* ══ 2 · WHO TAKES A COUNT ══════════════════════════════════════════════════════════════ */
// ⛔ A READER THAT TAKES `.length` IS ALREADY PERSON-SHAPED and only wants its rows drawn. A reader that takes a bare
// NUMBER is one that would have to change. That is the line Aevi asked me to draw, and it is not where she expected.
console.log(`\n══ 2 · readers that take a hand COUNT\n`);
const COUNTY = [
  [/\bhands\s*=\s*null/, "a `hands` parameter that overrides a count"],
  [/\.crew \|\| \[\]\)\.length \+ .*garrison \|\| \[\]\)\.length/, "crew.length + garrison.length, summed to one number"],
  [/atHands|wagePerHand|garrisonUpkeepPerHand|perHand\b/, "a per-HAND rate multiplied by a count"],
  [/Number\((?:h|holding)\.(?:crew|garrison)\)/, "a crew/garrison read AS a number"],
];
const hits = [];
for (const [f, s] of src) {
  codeOnly(s).split("\n").forEach((line, i) => {
    for (const [re, why] of COUNTY) if (re.test(line)) hits.push({ f, n: i + 1, why, line: line.trim().slice(0, 104) });
  });
}
const byWhy = {};
for (const h of hits) (byWhy[h.why] ||= []).push(h);
for (const [why, rows] of Object.entries(byWhy)) {
  console.log(`  ▸ ${why} — ${rows.length} site(s)`);
  for (const r of rows.slice(0, 8)) console.log(`      ${r.f}:${r.n}  ${r.line}`);
  if (rows.length > 8) console.log(`      …and ${rows.length - 8} more`);
}

/* ══ 3 · WHO ALREADY HOLDS THE PEOPLE ═══════════════════════════════════════════════════ */
console.log(`\n══ 3 · readers that already hold the PEOPLE — these only want rows drawing\n`);
const PERSONY = [/\(h\.crew \|\| \[\]\)\.map\(/, /holding\.crew\b[^\n]*\.map\(/, /setCrew\(|setGarrison\(/, /\.crew\.includes\(/];
let personSites = 0;
for (const [f, s] of src) {
  const n = codeOnly(s).split("\n").filter(l => PERSONY.some(re => re.test(l))).length;
  if (n) { personSites += n; console.log(`  ${f.padEnd(26)} ${n} site(s)`); }
}

/* ══ 3b · THE ONE FIELD THAT REALLY IS A NUMBER ═════════════════════════════════════════ */
console.log(`\n══ 3b · a band's soldiers — the half of item 10 that is real\n`);
for (const r of bandRows) console.log(`  ${r}`);
if (!bandRows.length) console.log(`  (no band in any save)`);
const readsBandCount = [];
for (const [f, s] of src) codeOnly(s).split("\n").forEach((l, i) => {
  if (/\b(?:band|unit|u)\.count\b/.test(l) || /\bbandCount\b/.test(l)) readsBandCount.push(`${f}:${i + 1}  ${l.trim().slice(0, 96)}`);
});
console.log(`\n  readers of a band's \`count\`: ${readsBandCount.length}`);
for (const r of readsBandCount.slice(0, 12)) console.log(`    ${r}`);
if (readsBandCount.length > 12) console.log(`    …and ${readsBandCount.length - 12} more`);

/* ══ 4 · THE VERDICT ════════════════════════════════════════════════════════════════════ */
console.log(`\n══ 4 · what item 10 actually costs\n`);
console.log(`  readers that take a hand COUNT and would have to change : ${hits.length}`);
console.log(`  readers that already hold the people                    : ${personSites}`);
console.log(`  a HOLD stores its hands as a bare number                : ${Object.keys(tally).some(k => /^holding\.(crew|garrison) = NUMBER/.test(k)) ? "YES" : "no"}`);
console.log(`  a BAND stores its soldiers as a bare number             : ${Object.keys(tally).some(k => /^band\.count = NUMBER/.test(k)) ? "YES" : "no"} (${readsBandCount.length} reader(s))`);
console.log(`\n  ⛑ THE PREMISE IS HALF WRONG, WHICH IS WHY SHE ASKED ME TO MEASURE. A hold's \`crew\` and \`garrison\` are`);
console.log(`     ALREADY arrays of person ids in every live holding in every save — they are person-rows today and want`);
console.log(`     only DRAWING as rows, plus a per-person assignment control. What is genuinely a bare number is a BAND's`);
console.log(`     soldiers, which is the second half of her item and the only part that needs the record to change.`);

/* ══ 5 · AND WHAT A BAND IS ACTUALLY MADE OF ════════════════════════════════════════════ */
// ⛑ THE FINDING THAT CHANGES THE ITEM. `band.count` is not stored — it is DERIVED, three times over
// (jobs.js:532, jobs.js:589, melee.js:920), from `band.contingents`. And a contingent is already a row.
console.log(`\n══ 5 · what a band is made of, in the live saves\n`);
let named = 0, levy = 0, levyHeads = 0, namedHeads = 0;
for (const ch of saves) for (const b of [...(ch.bands || []), ...(ch.warbands || [])]) {
  const cs = b.contingents || [];
  const mine = cs.filter(c => c && c.npcId);
  const anon = cs.filter(c => c && !c.npcId);
  named += mine.length; levy += anon.length;
  namedHeads += mine.reduce((a, c) => a + (Number(c.n) || 0), 0);
  levyHeads += anon.reduce((a, c) => a + (Number(c.n) || 0), 0);
  console.log(`  ${String(b.name || b.id).slice(0, 30).padEnd(32)} ${cs.length} contingent(s): ${mine.length} named person/people, ${anon.length} raised levy/levies`);
  for (const c of anon) console.log(`      n=${c.n} quality=${c.quality} — ${String(c.what || "").slice(0, 52)}`);
}
console.log(`\n  named people, already one row each : ${named} contingent(s), ${namedHeads} head(s)`);
console.log(`  anonymous levies raised at a hold  : ${levy} contingent(s), ${levyHeads} head(s)`);
console.log(`\n  ⛑ SO ITEM 10's REAL TARGET IS NARROW AND EXACT: a named person is ALREADY an individual row with an`);
console.log(`     \`npcId\`, a quality and what they do. The only thing that is a COUNT is a levy raised at a hold —`);
console.log(`     \`{ n: 3, quality: 1, does: ["HARM","MARTIAL"], from: <holdId> }\` — and those are ${levyHeads} of the`);
console.log(`     ${namedHeads + levyHeads} heads in play. Splitting and combining is a change to THOSE rows and nothing else.`);
