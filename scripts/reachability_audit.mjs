// reachability_audit.mjs — SNG-165. For every engine export: what actually triggers it?
//
// A normal dead-code scan answers "is it called". That is the scan that let eight capabilities ship
// unreachable: `battleRound` has callers, imports and a passing test, and could not fire in play
// because ZERO encounter definitions carry an opponent. The question that matters is the third one:
//   1. is it exported          2. does anything call it          3. DOES THE CONTENT THAT FEEDS IT EXIST
//
// Emits the raw table for po/REACHABILITY_AUDIT.md. Judgement (DEFERRED vs DEAD, authoring cost)
// is added by hand on top — this does the counting, not the deciding.
//
// Usage: node scripts/reachability_audit.mjs [--json]

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const root = join(import.meta.dirname, "..");
const read = p => { try { return readFileSync(join(root, p), "utf8"); } catch { return ""; } };
const lsJson = d => { try { return readdirSync(join(root, d)).filter(f => f.endsWith(".json")); } catch { return []; } };

// ---------- content census: the counts the verdicts hang on ----------
function loadAll(dir) {
  return lsJson(dir).map(f => { try { return JSON.parse(readFileSync(join(root, dir, f), "utf8")); } catch { return null; } }).filter(Boolean);
}
const locations = loadAll("content/packs/valley/locations");
const encounters = loadAll("content/packs/valley/encounters");
const quests = (() => { const q = loadAll("content/packs/valley/quests"); if (q.length) return q.flatMap(x => x.quests || [x]);
  try { return JSON.parse(readFileSync(join(root, "content/packs/valley/quests.json"), "utf8")).quests || []; } catch { return []; } })();
const npcs = loadAll("content/packs/valley/npcs");
const items = loadAll("content/packs/valley/items");
const abilities = (() => {
  const out = [];
  const walk = d => { for (const e of readdirSync(join(root, d), { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".json") && basename(d) === "abilities") {
      try { const j = JSON.parse(readFileSync(join(root, p), "utf8")); out.push(...(Array.isArray(j) ? j : (j.abilities || [j]))); } catch { /* skip */ }
    } } };
  try { walk("content/packs"); } catch { /* none */ }
  return out;
})();

const CONTENT_COUNTS = {
  "encounters (any)": encounters.length,
  "encounters with an opponent (skill_battle/duel)": encounters.filter(e => e.opponent).length,
  "encounters type=challenge": encounters.filter(e => e.type === "challenge").length,
  "encounters type=puzzle": encounters.filter(e => e.type === "puzzle").length,
  "encounters type=duel": encounters.filter(e => e.type === "duel").length,
  "locations offering encounterIds": locations.filter(l => (l.encounterIds || []).length).length,
  "locations": locations.length,
  "locations flagged waygate": locations.filter(l => l.waygate).length,
  "structured quests (stages[])": quests.filter(q => (q.stages || []).length).length,
  "quests with branched outcomes": quests.filter(q => (q.outcomes || []).length).length,
  "authored NPCs": npcs.length,
  "authored items": items.length,
  "abilities": abilities.length,
  "abilities with a tree[]": abilities.filter(a => (a.tree || []).length).length
};

// ---------- exports + call sites ----------
const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
const engineSrc = Object.fromEntries(engineFiles.map(f => [f, read(`engine/${f}`)]));
const appSrc = read("app.js");
const indexSrc = read("index.html");
const testSrc = (() => { try { return readdirSync(join(root, "tests")).filter(f => /\.(mjs|js)$/.test(f)).map(f => read(`tests/${f}`)).join("\n"); } catch { return ""; } })();
const scriptSrc = (() => { try { return readdirSync(join(root, "scripts")).filter(f => /\.(mjs|js)$/.test(f)).map(f => read(`scripts/${f}`)).join("\n"); } catch { return ""; } })();

const rows = [];
for (const [file, src] of Object.entries(engineSrc)) {
  for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)/gm)) {
    const name = m[1];
    const declLine = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    const re = new RegExp(`\\b${name}\\b`, "g");
    const selfUses = (src.match(re) || []).length - 1;                     // minus the declaration
    const otherEngine = Object.entries(engineSrc)
      .filter(([f]) => f !== file)
      .filter(([, s]) => re.test(s) && (s.match(re) || []).length > 0)
      .map(([f]) => `engine/${f}`);
    const inApp = (appSrc.match(re) || []).length > 0;
    const inIndex = (indexSrc.match(re) || []).length > 0;
    const inTests = (testSrc.match(re) || []).length > 0;
    const inScripts = (scriptSrc.match(re) || []).length > 0;
    const runtimeCallers = [...otherEngine, ...(inApp ? ["app.js"] : []), ...(inIndex ? ["index.html"] : [])];
    // An export used INSIDE its own module by a function that is itself reachable is LIVE in play —
    // it is merely exported so a test can reach it. Lumping those in with "test-only" would have
    // reported ~85 unreachable capabilities when most are ordinary internal helpers, and buried the
    // handful that genuinely cannot fire. The distinction is the whole value of this audit.
    const moduleImported = Object.entries(engineSrc).some(([f, s]) => f !== file && s.includes(`./${file}`))
      || appSrc.includes(`./engine/${file}`);
    rows.push({
      module: `engine/${file}`, export: name,
      internal: /registry:internal/.test(declLine),
      selfUses, runtimeCallers, moduleImported,
      internalLive: !runtimeCallers.length && selfUses > 0 && moduleImported,
      testOnly: !runtimeCallers.length && selfUses <= 0 && inTests,
      scriptsOnly: !runtimeCallers.length && selfUses <= 0 && !inTests && inScripts
    });
  }
}

// ---------- GM contract vs salvageOps vs prompt ----------
const gmSrc = read("engine/gm.js");
const salvage = (() => { const m = gmSrc.match(/const keys = \[([^\]]+)\]/); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : []; })();
// TOP-LEVEL reply keys only. A naive scan for `"key":` also collects the NESTED fields of each op
// (secondary, origin, form, companion…) and inflates the gap — those are properties of an op, not
// ops the salvager could ever recover on their own. Take the keys at one indent inside the reply
// template block, which is what the model is actually contracted to emit.
const documented = (() => {
  const start = gmSrc.indexOf('"narration"');
  if (start < 0) return [];
  const block = gmSrc.slice(start, gmSrc.indexOf("\n}", start));
  return [...new Set([...block.matchAll(/^\s{0,2}"(\w+)":/gm)].map(m => m[1]))];
})();
const missingFromSalvage = documented.filter(k => !salvage.includes(k));
const salvageNotDocumented = salvage.filter(k => !documented.includes(k));

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  contentCounts: CONTENT_COUNTS,
  exportTotal: rows.length,
  dead: rows.filter(r => !r.runtimeCallers.length && !r.testOnly && !r.scriptsOnly && !r.internal && r.selfUses <= 0),
  testOnly: rows.filter(r => r.testOnly && !r.internal),
  scriptsOnly: rows.filter(r => r.scriptsOnly && !r.internal),
  internalOnly: rows.filter(r => r.internal),
  internalLive: rows.filter(r => r.internalLive && !r.internal),
  salvage: { documented: documented.length, inSalvage: salvage.length, missingFromSalvage, salvageNotDocumented },
  rows
};

if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }

console.log(`ENGINE EXPORTS: ${rows.length} across ${engineFiles.length} modules\n`);
console.log("CONTENT CENSUS (the column a dead-code scan misses):");
for (const [k, v] of Object.entries(CONTENT_COUNTS)) console.log(`  ${String(v).padStart(4)}  ${k}${v === 0 ? "   <-- ZERO" : ""}`);
console.log(`\nGM CONTRACT vs salvageOps: ${documented.length} documented keys, ${salvage.length} in salvage`);
if (missingFromSalvage.length) console.log(`  MISSING FROM SALVAGE (${missingFromSalvage.length}): ${missingFromSalvage.join(", ")}`);
if (salvageNotDocumented.length) console.log(`  IN SALVAGE, NOT DOCUMENTED (${salvageNotDocumented.length}): ${salvageNotDocumented.join(", ")}`);
console.log(`\nNO RUNTIME CALLER (${out.dead.length}):`);
for (const r of out.dead) console.log(`  ${r.module} :: ${r.export}`);
console.log(`\nTEST-ONLY — passes CI, unreachable in play (${out.testOnly.length}):`);
for (const r of out.testOnly) console.log(`  ${r.module} :: ${r.export}`);
console.log(`\nSCRIPTS-ONLY — a maintenance helper, not play (${out.scriptsOnly.length}):`);
for (const r of out.scriptsOnly) console.log(`  ${r.module} :: ${r.export}`);
