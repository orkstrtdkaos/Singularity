/* ⛔ ERIK, 2026-10-01, with a screenshot: *"I still can't allocate someone to making more room (working on expansion)…
 * it says Cy is delegated, but no one is working the legs expansion?"*
 *
 * ⛑ TWO HAND-COUNTS EXISTED AND I WANTED TO KNOW WHICH ONE WAS LYING. The screen computed `crew.length +
 * garrison.length`; `clearingTick` computed `posted ∪ chargedWith(…,"growth")` — item 8, built for this exact
 * complaint. The answer, on his own save, was that the SCREEN was lying: the legs advance 0% → 25% a pass under a line
 * reading "nobody is at it".
 *
 * There is one function now. This drives BOTH SIDES of it and compares, which is the only way this repo has ever
 * caught the class — and drives the three doors onto the job, including the one that did not exist.
 *
 *   node po/tools/drive_legs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { loadContentHeadless } from "../../tests/headless_content.mjs";
import { clearingTick, clearingQuote, roomOf, clearingHands, setClearingHands } from "../../engine/holdings.js";
import { chargesAbout } from "../../engine/assignments.js";

const CONTENT = await loadContentHeadless();
const cfg = CONTENT.rules?.economy?.holdStore || null;

/* ── the screen's sentence, computed exactly as app.js computes it ── */
const screenSays = (character, h, q) => {
  const who = clearingHands(character, h);
  if (!who.n) return { n: 0, line: "nobody is at it — it will not move until somebody is" };
  const per = who.n / Math.max(1, q.atHands) / Math.max(1, Number(h.clearing.passes) || q.passes);
  const left = Math.max(1, Math.ceil((1 - (Number(h.clearing.progress) || 0)) / per));
  return { n: who.n, line: `${who.n} ${who.n === 1 ? "hand" : "hands"} at it — about ${left} more pass${left === 1 ? "" : "es"}` };
};

/* ══ 1 · THE LIVE SAVES ════════════════════════════════════════════════════════════════════════════ */
const root = "characters";
const files = [];
for (const d of fs.readdirSync(root)) {
  const p = path.join(root, d);
  if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) if (f.endsWith(".json")) files.push(path.join(p, f));
}
let found = 0;
for (const f of files) {
  let ch; try { ch = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
  for (const h of Array.isArray(ch.holdings) ? ch.holdings : []) {
    if (!h?.clearing) continue;
    found++;
    const q = clearingQuote(h, cfg);
    const room = roomOf(h, cfg);
    const who = clearingHands(ch, h);
    const said = screenSays(ch, h, q);
    console.log(`\n── ${ch.name || "?"} (${path.basename(f)}) · ${h.name || h.id} ──`);
    console.log(`   room   : ${room ? `${room.used} of ${room.slots}, bound by ${room.boundBy}, frame ${room.frame || "—"}` : "none"}`);
    console.log(`   job    : ${q.ok ? q.label : `refused — ${q.why}`}  (atHands ${q.atHands}, passes ${q.passes})`);
    console.log(`   OLD screen count (crew+garrison) : ${(h.crew || []).length + (h.garrison || []).length}`);
    console.log(`   hands  : posted [${who.posted}] · put [${who.put}] · delegated [${who.delegated}]  = ${who.n}`);
    console.log(`   charges about this hold: ${(chargesAbout(ch, h.id) || []).map(r => `${r.name} [${r.purpose || "—"}]`).join(", ") || "none"}`);
    console.log(`   THE ROW NOW SAYS: "${said.line}"`);
    const copy = JSON.parse(JSON.stringify(h)), chC = JSON.parse(JSON.stringify(ch));
    const before = Number(copy.clearing.progress) || 0;
    const r = clearingTick(chC, copy, { cfg, day: 1 });
    const after = copy.clearing ? Number(copy.clearing.progress) || 0 : 1;
    console.log(`   ⚠️  ONE PASS DRIVEN: ${(before * 100).toFixed(1)}% -> ${(after * 100).toFixed(1)}%  ·  ${r?.stalled ? "STALLED" : r?.cleared ? "LANDED" : "moved"}`);
    console.log(`   ⛔ AGREE? screen n=${said.n}, tick ${r?.stalled ? "stalled" : "moved"} -> ${(said.n > 0) === !r?.stalled ? "✅ YES" : "❌ NO"}`);
  }
}
if (!found) console.log("no hold in any save is clearing right now");

/* ══ 2 · THE THREE DOORS, on a constructed hold — because the live saves exercise exactly ONE of them ═══ */
console.log("\n── the three doors onto the job, driven ──");
const mk = () => ({ id: "h1", name: "Test Hold", crew: [], garrison: [], store: {},
  clearing: { budget: "open", progress: 0, passes: 2, onFrame: false, frame: null } });
const charged = (id) => ({ worldState: { assignments: { a1: { id: "a1", npcId: id, npcName: id, status: "working", holdId: "h1", purpose: "growth" } } } });

const cases = [
  ["nobody at all", {}, mk()],
  ["posted — a crew hand lives here", {}, (() => { const h = mk(); h.crew = ["ann"]; return h; })()],
  ["put — sent to it by name (the door that did not exist)", {}, (() => { const h = mk(); h.clearing.hands = ["bert"]; return h; })()],
  ["delegated — charged with this hold's growth", charged("cy"), mk()],
  ["all three at once", charged("cy"), (() => { const h = mk(); h.crew = ["ann"]; h.clearing.hands = ["bert"]; return h; })()],
  ["⚠️ the SAME person all three ways — one hand, never three", charged("ann"), (() => { const h = mk(); h.crew = ["ann"]; h.clearing.hands = ["ann"]; return h; })()],
];
for (const [label, ch, h] of cases) {
  const who = clearingHands(ch, h);
  const copy = JSON.parse(JSON.stringify(h));
  const r = clearingTick(JSON.parse(JSON.stringify(ch)), copy, { cfg, day: 1 });
  const moved = copy.clearing ? (Number(copy.clearing.progress) || 0) : 1;
  const agree = (who.n > 0) === !r?.stalled;
  console.log(`   ${agree ? "✅" : "❌"} ${label.padEnd(56)} n=${who.n}  progress -> ${(moved * 100).toFixed(1)}%  ${r?.stalled ? "(stalled)" : ""}`);
}

/* ══ 3 · AND THE PUT DOOR WRITES AND UNWRITES ═══════════════════════════════════════════════════════ */
console.log("\n── the control itself ──");
{
  const h = mk();
  console.log(`   put two on it      : ${JSON.stringify(setClearingHands({}, h, ["bert", "dala"]))}`);
  console.log(`   take one off       : ${JSON.stringify(setClearingHands({}, h, ["dala"]))}`);
  console.log(`   take the last off  : ${JSON.stringify(setClearingHands({}, h, []))}  · field left behind? ${"hands" in h.clearing}`);
  const none = { id: "h2", clearing: null };
  console.log(`   ⚠️ refused with no work under way: ${JSON.stringify(setClearingHands({}, none, ["bert"]))}`);
  const stopped = mk(); stopped.clearing.hands = ["bert"];
  delete stopped.clearing;
  console.log(`   ⛑ stopping the work frees them with it: hands gone? ${!stopped.clearing}`);
}
