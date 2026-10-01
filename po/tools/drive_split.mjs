// ⛑ ITEM 10, driven on the real bands. ⛔ ERIK: *"The raised hands need to be individual units I can apply to various
// tasks (split or combined)"* and *"I don't want raised hands or soldiers to have names in general. Not even when they
// get assigned to a job."* Nothing is written back.
import { readFileSync, readdirSync } from "node:fs";
const M = await import("../../engine/melee.js");
const J = await import("../../engine/jobs.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
const pick = (n) => JSON.parse(JSON.stringify(saves.filter(s => s.name === n).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0]));
let fails = 0;
const check = (ok) => { if (!ok) fails++; return ok ? "ok" : "⛔ FAIL"; };

/* ══ 1 · WHAT IS A LEVY AND WHAT IS A PERSON, IN THE REAL BANDS ══════════════════════════ */
console.log(`\n══ 1 · what the live bands are made of\n`);
let levies = 0, named = 0;
for (const ch of saves) for (const b of [...(ch.bands || []), ...(ch.warbands || [])]) {
  const cs = b.contingents || [];
  const mine = cs.filter(c => c?.npcId), anon = cs.filter(c => c && !c.npcId);
  named += mine.length; levies += anon.length;
  console.log(`  ${String(ch.name).padEnd(12)} ${String(b.name || b.id).slice(0, 28).padEnd(30)} ${mine.length} named · ${anon.length} levy/levies`);
  for (const c of anon) console.log(`      ${M.unitLabel(c, { holdings: ch.holdings || [], locations: C.locations || {} })}`);
}
console.log(`\n  ${named} named contingent(s), ${levies} levy/levies — ${check(levies > 0 && named > 0)} both kinds are present`);

/* ══ 2 · A SPLIT NAMES NOBODY ════════════════════════════════════════════════════════════ */
console.log(`\n══ 2 · splitting a real levy\n`);
const silas = pick("Silas Weir");
const band = (silas.bands || [])[0];
const i = (band.contingents || []).findIndex(c => c && !c.npcId && Number(c.n) > 1);
const before = JSON.parse(JSON.stringify(band.contingents[i]));
console.log(`  before: ${M.unitLabel(before, { holdings: silas.holdings || [], locations: C.locations || {} })}`);
const namesBefore = Object.keys(silas.npcRegistry || {}).length;
const r = M.splitContingent(band, i, { take: 2 });
console.log(`  split 2 off  -> ${r.ok ? r.said : "refused: " + r.why}`);
console.log(`  rows now: ${band.contingents.slice(i, i + 2).map(c => M.unitLabel(c, { holdings: silas.holdings || [], locations: C.locations || {} })).join("   |   ")}`);
console.log(`  ${check(r.ok)} — it split`);
// ⛔ THE RULE ERIK STATED TWICE: no name, anywhere, for either piece.
console.log(`  ${check(Object.keys(silas.npcRegistry || {}).length === namesBefore)} — NO new person in the registry (${namesBefore} before, ${Object.keys(silas.npcRegistry || {}).length} after)`);
console.log(`  ${check(band.contingents.slice(i, i + 2).every(c => !c.npcId))} — and neither piece carries an npcId`);
console.log(`  ${check(band.count === (silas.bands || [])[0].contingents.reduce((a, c) => a + (Number(c.n) || 0), 0))} — and the band's count still adds up`);

/* ══ 3 · THE GEAR DIVIDES RATHER THAN DOUBLING ═══════════════════════════════════════════ */
console.log(`\n══ 3 · a levy carrying kit\n`);
const kitted = { id: "k", count: 10, contingents: [{ n: 10, quality: 2, does: ["HARM", "MARTIAL"], from: "the-fell-pell",
  kit: { sword: { gear: "sword", one: "sword", many: "swords", n: 10 } } }] };
const swordsBefore = M.kitSummary(kitted.contingents).reduce((a, k) => a + k.n, 0);
M.splitContingent(kitted, 0, { take: 3 });
const swordsAfter = M.kitSummary(kitted.contingents).reduce((a, k) => a + k.n, 0);
console.log(`  10 hands with 10 swords, split 3 off -> ${kitted.contingents.map(c => `${c.n} with ${c.kit?.sword?.n ?? 0}`).join(" + ")}`);
console.log(`  ${check(swordsBefore === swordsAfter && swordsAfter === 10)} — ${swordsBefore} swords before, ${swordsAfter} after: the gear divided, it did not double`);

/* ══ 4 · AND IT GOES BACK ════════════════════════════════════════════════════════════════ */
console.log(`\n══ 4 · combining them again\n`);
const round = { id: "r", count: 9, contingents: [{ n: 9, quality: 1, does: ["HARM", "MARTIAL"], from: "fp" }] };
const orig = JSON.stringify(round.contingents[0]);
M.splitContingent(round, 0, { take: 4 });
const back = M.combineContingents(round, 0, 1);
console.log(`  split 4 off 9, then combine -> ${back.ok ? back.said : back.why}`);
console.log(`  ${check(JSON.stringify(round.contingents[0]) === orig && round.contingents.length === 1)} — the original row, exactly`);
console.log(`  ${check(!M.combineContingents({ contingents: [{ n: 2, quality: 1 }, { n: 2, quality: 5 }] }, 0, 1).ok)} — and two UNLIKE groups refuse to merge`);

/* ══ 5 · A SPLIT PIECE CAN BE PUT TO WORK, UNNAMED ═══════════════════════════════════════ */
console.log(`\n══ 5 · posting one to a hold's work, with no name\n`);
const ch5 = pick("Silas Weir");
const b5 = (ch5.bands || [])[0];
const i5 = (b5.contingents || []).findIndex(c => c && !c.npcId && Number(c.n) > 1);
M.splitContingent(b5, i5, { take: 1 });
const unitId = `unit:${b5.id}:${i5 + 1}`;
console.log(`  the piece's worker id: ${unitId}`);
console.log(`  workHeads says: ${J.workHeads(ch5, unitId)} head(s)`);
console.log(`  ${check(J.workHeads(ch5, unitId) === 1)} — one head, addressable as a worker without ever being named`);

console.log(`\n${fails ? `⛔ ${fails} check(s) FAILED` : "✅ every check passed"}\n`);
process.exit(fails ? 1 : 0);
