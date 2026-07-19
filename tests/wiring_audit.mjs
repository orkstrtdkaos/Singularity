// wiring_audit.mjs — BATCH-11 §23.3: THE WIRING GATE (Law 16).
//
// Every capability declares the path by which a player reaches it. This audit
// verifies the declared registry against the code, so "does the model know
// about X?" is answered by a build gate instead of archaeology.
//
// FAIL checks (exit 1):
//   1. Registry ↔ consumer parity — a key gm.js tierParts() destructures that no
//      registry row provides can never land; a registered row gm.js never reads
//      is a value with no reader. Both directions fail.
//   2. Call-site discipline — every play-loop gmTurn/gmAsk call assembles via
//      assembleGMContext; a hand-listed ctx literal is the §0 failure mode reborn.
//   3. SYSTEM_SPEC count freshness — the header's certified module/ability counts
//      must match HEAD (the 38/137-vs-49/285 drift must not recur silently).
//   4. Skill-integrity ratchet (§4 / SNG-147d) — lives in this file via
//      tests/wiring_baseline.json: known-offender counts may only go DOWN.
//      New abilities must carry harmRung, use canon challenge types, and teach
//      any combat they claim. (Run with UPDATE_WIRING_BASELINE=1 to re-baseline
//      after a deliberate content improvement.)
//
// ADVISORY (printed, never fails):
//   - Orphan-export sweep. Some exports are legitimately internal (e.g.
//     LEGEND_BEATS, a module-internal validation constant) — mark those with a
//     trailing `// registry:internal` comment on the export line to silence.
//
// ⚠ `// registry:internal` IS A LEVER ON A RATCHET — know this before you reach for it.
// The marker suppresses BOTH the orphan sweep AND the test-only ratchet. So marking an export
// lowers `testOnlyExports` without wiring anything: the number improves and the capability is
// still unreachable. That is the precise failure this whole audit exists to catch, available as a
// one-line edit to whoever is under time pressure and does not know the lever is here.
// It is being used correctly today — the PO checked all 11 markers added in CCODE-12 against the
// test-only classification with the marker ignored, and zero of them would have classified
// test-only unmarked, so the baseline of 8 is honest. Ratchets with levers get pulled eventually,
// so the audit now REPORTS any marker that is actually suppressing a would-be test-only finding
// (see "lever check" below) — a printed line cannot be missed the way this comment can.
// Use it for a genuine module-internal helper. Never to make a number go down.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const failureLabels = []; // CCODE-12: so the summary can separate an EXPECTED red from a regression
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) { failures++; failureLabels.push(label); }
};

const read = (p) => readFileSync(join(root, p), "utf8");

// ---------- 1. registry ↔ consumer parity ----------
const { GM_CONTEXT, registryKeys } = await import("../engine/gm_registry.js");
const gmSrc = read("engine/gm.js");

// The consumer's declared appetite: the tierParts() destructure.
const destructMatch = gmSrc.match(/export function tierParts\(ctx\) \{\s*const \{ ([^}]+) \} = ctx;/);
check("gm.js tierParts destructure found", !!destructMatch);
const consumed = new Set((destructMatch?.[1] || "").split(",").map(s => s.trim()).filter(Boolean));
const provided = new Set(registryKeys());

const unprovided = [...consumed].filter(k => !provided.has(k));
check(`every key gm.js consumes has a registry row (${consumed.size} keys)`, unprovided.length === 0,
  `consumed but NEVER provided — can never land: ${unprovided.join(", ")}`);

const unconsumed = [...provided].filter(k => !consumed.has(k));
check(`every registry row lands in gm.js (${provided.size} rows)`, unconsumed.length === 0,
  `registered but never read — a value with no reader: ${unconsumed.join(", ")}`);

// Registry row hygiene: every row declares its full chain.
for (const row of GM_CONTEXT) {
  const whole = row.key && row.builder && Array.isArray(row.carries) && row.carries.length && row.reachedBy && row.spec && Array.isArray(row.views) && row.views.length && typeof row.build === "function";
  if (!whole) check(`registry row "${row.key || "?"}" declares key/builder/carries/reachedBy/spec/views/build`, false);
}
check("all registry rows declare their full chain (builder/carries/reachedBy/spec/views/build)", true);

// ---------- 2. call-site discipline ----------
const appSrc = read("app.js");
const gmCalls = [...appSrc.matchAll(/gm(?:Turn|Ask)\(/g)].length;
const assembled = [...appSrc.matchAll(/gm(?:Turn|Ask)\(assembleGMContext\(/g)].length;
check(`all ${gmCalls} play-loop gmTurn/gmAsk call sites assemble via the registry`, gmCalls > 0 && gmCalls === assembled,
  `${gmCalls - assembled} call site(s) hand-list their ctx`);
const views = new Set([...appSrc.matchAll(/assembleGMContext\("(\w+)"/g)].map(m => m[1]));
check(`the four views are each exercised (turn/ask/quest/gambit)`, ["turn", "ask", "quest", "gambit"].every(v => views.has(v)));

// ---------- 3. SYSTEM_SPEC count freshness ----------
const specSrc = read("SYSTEM_SPEC.md");
const engineCount = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).length;

function walkAbilities(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walkAbilities(f, out);
    else if (e.name.endsWith(".json") && dir.endsWith("abilities")) out.push(f);
  }
  return out;
}
let abilityCount = 0;
const abilityRecords = [];
for (const f of walkAbilities(join(root, "content", "packs"))) {
  const j = JSON.parse(readFileSync(f, "utf8"));
  // Ability files are {schemaVersion, powerSystem, abilities: [...]} wrappers; count RECORDS.
  const arr = Array.isArray(j) ? j : (Array.isArray(j.abilities) ? j.abilities : [j]);
  abilityCount += arr.length;
  for (const a of arr) abilityRecords.push({ ...a, _file: f.slice(root.length + 1) });
}

const specModules = specSrc.match(/confirmed against origin: \*{0,2}(\d+) engine modules/);
const specAbilities = specSrc.match(/(\d+) abilities \/ \d+ traditions/);
check(`SYSTEM_SPEC header certifies the real engine-module count (${engineCount})`,
  specModules && Number(specModules[1]) === engineCount,
  `header says ${specModules?.[1] ?? "?"}, HEAD has ${engineCount}`);
check(`SYSTEM_SPEC header certifies the real ability count (${abilityCount})`,
  specAbilities && Number(specAbilities[1]) === abilityCount,
  `header says ${specAbilities?.[1] ?? "?"}, HEAD has ${abilityCount}`);

// CCODE-09 (PO finding A3): this gate covered engine modules and abilities ONLY, while the header
// also certifies locations, regions and rules files. The PO added three locations, a region and a
// rules file and the header drifted silently — 92→95, 24→25, 18→29 — under a check that reads as
// certification. HALF-GATED FRESHNESS IS WORSE THAN NONE: an unchecked number beside a checked one
// inherits its credibility. Either the gate covers every count the header asserts, or the header
// stops asserting it. Covering it.
const locFiles = (() => { try { return readdirSync(join(root, "content/packs/valley/locations")).filter(f => f.endsWith(".json")); } catch { return []; } })();
const locationCount = locFiles.length;
const regionCount = (() => {
  const ids = new Set();
  for (const f of locFiles) {
    try { const j = JSON.parse(readFileSync(join(root, "content/packs/valley/locations", f), "utf8")); if (j.regionId || j.region) ids.add(j.regionId || j.region); } catch { /* skip */ }
  }
  return ids.size;
})();
const rulesCount = (() => { try { return readdirSync(join(root, "content/packs/core/rules")).filter(f => f.endsWith(".json")).length; } catch { return 0; } })();

const specLocations = specSrc.match(/(\d+) locations \/ (\d+) regions/);
check(`SYSTEM_SPEC header certifies the real location count (${locationCount})`,
  specLocations && Number(specLocations[1]) === locationCount,
  `header says ${specLocations?.[1] ?? "?"}, HEAD has ${locationCount}`);
check(`SYSTEM_SPEC header certifies the real region count (${regionCount})`,
  specLocations && Number(specLocations[2]) === regionCount,
  `header says ${specLocations?.[2] ?? "?"}, HEAD has ${regionCount}`);
const specRules = specSrc.match(/(\d+) core rules files/);
check(`SYSTEM_SPEC header certifies the real core-rules count (${rulesCount})`,
  specRules && Number(specRules[1]) === rulesCount,
  `header says ${specRules?.[1] ?? "?"}, HEAD has ${rulesCount}`);

// ---------- 3b. version coherence (CCODE-07) ----------
// APP_VERSION stamps every feedback report; index.html's ?v= busts the cache. When they drift, bug
// reports are filed against a version that was never running — which is how a stale 1.8.104 label
// survived five ships. Cheap to check, expensive to debug without.
const indexSrc = read("index.html");
const stamps = [...indexSrc.matchAll(/\?v=([0-9.]+)/g)].map(m => m[1]);
const appVersion = appSrc.match(/const APP_VERSION = "([^"]+)"/)?.[1];
check("APP_VERSION matches index.html's cache stamp (feedback reports name the running version)",
  !!appVersion && stamps.length > 0 && stamps.every(s => s === appVersion),
  `APP_VERSION=${appVersion}, index.html stamps=${[...new Set(stamps)].join("/")}`);

// ---------- CCODE-12 / SNG-165 §6: the three standing guards ----------
// The reachability audit found eight capabilities built, tested, and unreachable — and then caught
// its own author 90 minutes later on code with eight passing tests. These convert that one-off
// report into checks that fire on the ninth instance instead of it surfacing in play.

// GUARD 1 — every encounterSeeds entry resolves to a real encounter def.
// SHIPS RED, DELIBERATELY. 10 seeds are authored as bare strings where the loader expects
// {encounterId, hint}: old_switchback (5), the_gralloch (4), the_redline (1). They are
// random-encounter ids in the wrong field and the content fix is the PO's lane — she asked to WATCH
// IT FAIL before repairing it, which is the honest way to prove a guard bites. Do not "fix" the
// content to make this green; the red IS the deliverable until she lands the repair.
{
  const encDir = "content/packs/valley/encounters";
  const defIds = new Set();
  try {
    for (const f of readdirSync(join(root, encDir))) {
      if (!f.endsWith(".json")) continue;
      try { defIds.add(JSON.parse(readFileSync(join(root, encDir, f), "utf8")).id); } catch { /* skip */ }
    }
  } catch { /* no encounters dir */ }
  const locDir = "content/packs/valley/locations";
  const dead = [];
  let seedTotal = 0;
  try {
    for (const f of readdirSync(join(root, locDir))) {
      if (!f.endsWith(".json")) continue;
      let loc; try { loc = JSON.parse(readFileSync(join(root, locDir, f), "utf8")); } catch { continue; }
      for (const s of loc.encounterSeeds || []) {
        seedTotal++;
        const id = typeof s === "string" ? null : s?.encounterId;   // a bare string has no encounterId
        if (!id || !defIds.has(id)) dead.push(`${loc.id} → ${typeof s === "string" ? `"${s}" (bare string, needs {encounterId,hint})` : id || "(no encounterId)"}`);
      }
    }
  } catch { /* no locations dir */ }
  check(`every encounterSeeds entry resolves to a real encounter def (${seedTotal - dead.length}/${seedTotal})`,
    dead.length === 0,
    `${dead.length} seed(s) can NEVER offer — listAvailableEncounters drops them silently:\n      ${dead.join("\n      ")}`);
}

// GUARD 2 — the GM contract and salvageOps may not drift.
// Widest blast radius of the three: a documented op absent from salvage is LOST to a stray comma in
// a long reply. newEncounter / newAbility / discovery / sceneEnded were all in that state.
{
  const salvageKeys = (() => { const m = gmSrc.match(/const keys = \[([^\]]+)\]/); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : []; })();
  // TOP-LEVEL reply keys only — a naive scan also collects each op's nested fields and invents gaps.
  const documented = (() => {
    const start = gmSrc.indexOf('"narration"');
    if (start < 0) return [];
    const block = gmSrc.slice(start, gmSrc.indexOf("\n}", start));
    return [...new Set([...block.matchAll(/^\s{0,2}"(\w+)":/gm)].map(m => m[1]))];
  })();
  // Three recovery paths exist and a key needs ANY of them:
  //   the op whitelist (balanced-bracket scan) · salvageNarration · the scalar pass.
  // Checking only the whitelist reports a scalar as unsalvageable when it is in fact covered —
  // the guard would then be crying wolf about the very thing it just verified. Read all three.
  const NARRATION_PATH = new Set(["narration", "choices", "sceneSummary"]);
  const scalarKeys = new Set([...gmSrc.matchAll(/\["(\w+)",\s*"(?:bool|string)"\]/g)].map(m => m[1]));
  const missing = documented.filter(k => !NARRATION_PATH.has(k) && !salvageKeys.includes(k) && !scalarKeys.has(k));
  check(`every documented contract op is salvageable (${documented.length} documented, ${salvageKeys.length} in salvage)`,
    missing.length === 0,
    `documented but UNSALVAGEABLE — a truncated reply loses these outright: ${missing.join(", ")}`);
  // A scalar can only be recovered by the dedicated pass, never the balanced-bracket scan.
  const scalarPass = /for \(const \[key, kind\] of \[\["sceneEnded", "bool"\]/.test(gmSrc);
  check("scalar ops (sceneEnded/gambitApt/imagePrompt) have a recovery path at all", scalarPass,
    "the balanced-bracket scan only opens on [ or { — a boolean or string needs the scalar pass");

  // SNG-183 L5 — THE THIRD LINK: DISPATCH. An op can have a schema entry, a prompt rule and a
  // salvage slot and STILL never do anything, because nothing in applyTurn reads it. That is exactly
  // the shape that hid the never-fired ops: markTeacher had all its wiring and did nothing until
  // SNG-179 found the vocabulary gap. The static half of the lens is cheaper and catches the plainer
  // case — an op the model is TOLD to emit that no code consumes. `turn.<op>` in app.js is the read.
  const dispatched = new Set([...appSrc.matchAll(/\bturn\.(\w+)/g)].map(m => m[1]));
  const NON_DISPATCH = new Set(["narration", "choices", "sceneSummary"]);   // consumed by the render, not applyTurn
  const undispatched = documented.filter(k => !NON_DISPATCH.has(k) && !dispatched.has(k));
  check(`every documented op is DISPATCHED — read by applyTurn, not merely described (${documented.length} ops)`,
    undispatched.length === 0,
    `documented to the model but NOTHING reads turn.<op> — dead on arrival: ${undispatched.join(", ")}`);
}

// ---------- 4. skill-integrity ratchet (SNG-147d) ----------
const CANON_TYPES = new Set(["FIGHT", "INVESTIGATE", "SOCIAL", "EXPLORE", "SURVIVE", "PUZZLE", "STEALTH", "CHASE", "DUEL", "CREATE", "DEFEND", "TRAVEL"]);
const HARM_RUNGS = new Set(["none", "damaging", "incapacitating", "lethal"]);

const missingHarm = abilityRecords.filter(a => a.harmRung === undefined);
const badHarm = abilityRecords.filter(a => a.harmRung !== undefined && !HARM_RUNGS.has(a.harmRung));
const nonCanonTypes = abilityRecords.filter(a => (a.challengeTypes || []).some(t => !CANON_TYPES.has(String(t))));
// combat claimed in metadata but no rank grants teach it.
// SNG-147d BUG (Aevi, PO, 2026-07-18): this read `a.ranks`, which ability records do not have —
// they carry `tree`. teachesCombat was therefore ALWAYS false and the metric counted every ability
// that CLAIMS combat, not those that fail to teach it. The gate could never pass. Fixed to `tree`.
// SNG-147d/A2: the verb list MUST carry the canon definitions from
// content/packs/core/rules/function_vocabulary.json — `hinder` is defined there as
// "WEAKEN, drain, impair, or slow" and `break` as "Harm or DESTROY a THING". Omitting those
// words made the gate contradict the canon it enforces and flag correct content (Aevi, PO). (147c's negation-aware core signal:
// strike/break/hinder function or FIGHT/DUEL/DEFEND type, with no offensive verb in any grants)
const claimsCombat = (a) => (a.functions || []).some(f => ["strike", "break", "hinder"].includes(String(f))) ||
  (a.challengeTypes || []).some(t => ["FIGHT", "DUEL", "DEFEND"].includes(String(t)));
const teachesCombat = (a) => (a.tree || a.ranks || []).some(r => /\b(strike|striking|attack|wound|fell|down(s|ing)?|disable|disarm|end(s|ing)? (a|the|an)\b|bring .{0,20}down|stop(s|ping)? (a|the|an)\b|break(s|ing)?|shatter|force|drive (back|off)|repel|bind|pin|stagger|fight|combat|offen[cs]|harm|weaken\w*|drain\w*|impair\w*|slow(s|ing)?|destroy\w*|dismantl\w*|unmak\w*)\b/i.test(String(r.grants || "")));
const combatUntaught = abilityRecords.filter(a => claimsCombat(a) && !teachesCombat(a));

// ---------- SNG-152 §5e: the gate that makes this the LAST truncation fix ----------
// The spec asked for this and I shipped without it, so corrections.js — listed in my own sweep
// table and simply not converted — kept severing GM prose at exactly 200 chars until Erik saw
// "…is meta-play instructio" on screen. SNG-076 and SNG-088 were also site-specific fixes to a
// systemic defect; without a gate this was always going to be the third, then the fourth.
// Counts RAW fixed-length caps at prose scale (>= 100) that are not smartClamp. Ratcheted rather
// than hard-zeroed: some are legitimately identifiers or diagnostics, and a decrease-only bound
// stops regression without demanding a perfect classifier.
const proseCapFiles = [...readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).map(f => `engine/${f}`), "app.js"];
const rawProseCaps = [];
for (const rel of proseCapFiles) {
  if (rel.endsWith("namematch.js")) continue; // smartClamp's own home
  const src = read(rel);
  for (const m of src.matchAll(/\.slice\(\s*0\s*,\s*(\d{3,})\s*\)/g)) {
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/smartClamp/.test(line)) continue;          // already clamped on this line
    if (/prose-cap-ok/.test(line)) continue;        // deliberate, declared at the site
    rawProseCaps.push(`${rel}:${src.slice(0, m.index).split("\n").length}`);
  }
}

// GUARD 3 — the test-only ratchet. An export reachable ONLY from a test passes CI while being
// unreachable in play; that is the exact mechanism behind all eight original findings.
// THE METHODOLOGY IS THE POINT: an export used inside its OWN module by a reachable caller is LIVE
// and merely exported so a test can see it. A naive scan calls ~85 exports test-only and buries the
// 9 that genuinely cannot fire — the false positives are what make an advisory unreadable, which is
// the same failure CCODE-01 fixed in the orphan sweep.
const { testOnlyExports, leverSuppressed } = (() => {
  const engFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
  const engSrc = Object.fromEntries(engFiles.map(f => [f, read(`engine/${f}`)]));
  const testSrc = (() => { try { return readdirSync(join(root, "tests")).filter(f => /\.(mjs|js)$/.test(f)).map(f => read(`tests/${f}`)).join("\n"); } catch { return ""; } })();
  const idx = read("index.html");
  const found = [], suppressed = [];
  for (const [file, src] of Object.entries(engSrc)) {
    for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)/gm)) {
      const name = m[1];
      const declLine = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
      const re = () => new RegExp(`\\b${name}\\b`, "g");
      const selfUses = (src.match(re()) || []).length - 1;                  // minus its own declaration
      if (selfUses > 0) continue;                                            // internal helper — LIVE
      const runtime = Object.entries(engSrc).some(([f, s]) => f !== file && re().test(s))
        || re().test(appSrc) || re().test(idx);
      if (runtime) continue;
      if (!re().test(testSrc)) continue;
      // THE LEVER CHECK: this export WOULD count as test-only. If a marker is hiding it, the
      // ratchet just went down without anything being wired — say so out loud. Marking a genuine
      // module-internal helper never lands here, because selfUses > 0 already returned above.
      if (/registry:internal/.test(declLine)) suppressed.push(`engine/${file}::${name}`);
      else found.push(`engine/${file}::${name}`);
    }
  }
  return { testOnlyExports: found.sort(), leverSuppressed: suppressed.sort() };
})();
check(`no // registry:internal marker is hiding a test-only export (${leverSuppressed.length} suppressed)`,
  leverSuppressed.length === 0,
  `these are marked internal but have NO same-module caller — the marker is lowering the ratchet, not describing the code:\n      ${leverSuppressed.join("\n      ")}`);

// ---------- shared consumer corpus (used by the ratchets below AND the orphan sweep) ----------
const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
const allSrc = engineFiles.map(f => ({ f, src: read(`engine/${f}`) }));
const readDirSrc = (dir, exts) => {
  try {
    return readdirSync(join(root, dir)).filter(f => exts.some(e => f.endsWith(e)))
      .map(f => read(`${dir}/${f}`)).join("\n");
  } catch { return ""; }
};

// ---------- CCODE-14: IMPORTED BUT NEVER CALLED ----------
// The orphan sweep counts an `import` statement as a consumer, so a capability that is imported and
// never invoked reads as fully wired. That is the ENTIRE built-and-unreached signature — the class
// this audit exists to catch — and the sweep reported 0 while instances accumulated. SNG-169 found
// `npcImage` this way, by hand, as the 11th of the batch. The instrument should have found it.
//
// Measured honestly: "imported, and the name never appears outside an import" is 12, but 10 of those
// are used INSIDE their own module — needless public surface, not dead capability. Excluding
// own-module use leaves the real 2 (art.js:npcImage, playerprofile.js:profileInsight). Shipping 12
// would have been a number that looked like a finding.
// Strip imports AND comments. Comments matter more than they look: this check first reported 3
// instead of 5 because the paragraph above — naming `npcImage` and `profileInsight` as examples —
// sits in tests/, which is part of the consumer corpus. The audit read its own documentation as
// evidence the capability was wired. An instrument that is silenced by describing it is not an
// instrument. (The original orphan sweep has the same flaw and now shares this corpus.)
const stripImports = s => s
  .replace(/^\s*import\s[\s\S]*?from\s*["'][^"']+["'];?\s*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");   // line comments, but not the // in https://
const consumerNoImports = [appSrc, read("index.html"), readDirSrc("tests", [".mjs", ".js"]), readDirSrc("scripts", [".mjs", ".js"])].map(stripImports).join("\n");
const importedNeverCalled = [];
for (const { f, src } of allSrc) {
  const othersNoImports = allSrc.filter(x => x.f !== f).map(x => stripImports(x.src)).join("\n");
  for (const m of src.matchAll(/^export (?:async )?(?:function|const|let) (\w+)/gm)) {
    const name = m[1];
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/registry:internal/.test(line)) continue;
    const importRe = new RegExp(`import[^;]*\\b${name}\\b[^;]*from`, "s");
    if (!importRe.test(appSrc) && !allSrc.some(x => x.f !== f && importRe.test(x.src))) continue; // orphan sweep owns that case
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(consumerNoImports) || re.test(othersNoImports)) continue;
    importedNeverCalled.push(`${f}:${name}`);
  }
}
importedNeverCalled.sort();
// Named EVERY run, not only on regression. The ratchet keeps the count from growing; printing the
// list is what keeps five known-dead exports from becoming scenery. Two of these are dead
// capability (npcImage — SNG-169; profileInsight); three are live code whose export is needless
// (ART_MODES, locationImage, TIME_MODES are each used only inside their own module).
// Three disjoint categories, together complete: never imported → orphan sweep · imported only by a
// test → testOnlyExports · imported by app/engine and never invoked → here.
if (importedNeverCalled.length) console.log(`note  ${importedNeverCalled.length} export(s) imported and never invoked (ratcheted below): ${importedNeverCalled.join(", ")}`);

const measured = {
  testOnlyExports: testOnlyExports.length,
  abilitiesMissingHarmRung: missingHarm.length,
  abilitiesInvalidHarmRung: badHarm.length,
  abilitiesNonCanonChallengeTypes: nonCanonTypes.length,
  abilitiesCombatClaimedNotTaught: combatUntaught.length,
  rawProseCaps: rawProseCaps.length,
  importedNeverCalled: importedNeverCalled.length
};

const baselinePath = join(root, "tests", "wiring_baseline.json");
if (process.env.UPDATE_WIRING_BASELINE === "1" || !existsSync(baselinePath)) {
  writeFileSync(baselinePath, JSON.stringify({
    note: "SNG-147d ratchet — known-offender counts may only DECREASE. Re-baseline deliberately with UPDATE_WIRING_BASELINE=1 after a content improvement; never hand-edit upward.",
    updatedAt: new Date().toISOString().slice(0, 10),
    ...measured
  }, null, 2) + "\n");
  console.log(`ok    ratchet baseline ${existsSync(baselinePath) ? "written" : "created"}: ${JSON.stringify(measured)}`);
}
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
for (const [k, v] of Object.entries(measured)) {
  const why = k === "abilitiesCombatClaimedNotTaught"
    ? `regressed — a new ability claims combat its grants never teach (147c rule: if it can fight, a rank grants says HOW)`
    : k === "rawProseCaps"
      ? `a new fixed-length cap on model prose — use smartClamp, or mark the line // prose-cap-ok if it is genuinely an identifier:\n      ${rawProseCaps.slice(0, 6).join(", ")}`
      : k === "testOnlyExports"
        ? `a NEW export reachable only from a test — it passes CI and CANNOT FIRE IN PLAY. Wire it or delete it:\n      ${testOnlyExports.join("\n      ")}`
        : k === "importedNeverCalled"
          ? `a NEW export that is imported and never invoked — built, shipped, and unreachable in play. Call it, surface it, or delete it:\n      ${importedNeverCalled.join("\n      ")}`
          : `regressed past baseline`;
  check(`ratchet: ${k} = ${v} (baseline ${baseline[k] ?? "unset"}) — may only go DOWN`, v <= (baseline[k] ?? v), why);
}
check("invalid harmRung values are always zero (enum is machine-checked from here)", badHarm.length === 0,
  badHarm.map(a => `${a.id}:${a.harmRung}`).join(", "));

// SNG-147a: challengeProfile is RETIRED (280 records carried it; zero runtime consumers, zero CI
// validation, an abandoned cognitive/physical/social triad on ~89). A retired field must STAY
// retired — a value with no reader teaches every future author that authoring it matters.
// (challengeTypes is HELD, not retired: content_ci.mjs's FIGHT/notFor lint is the only automated
// guard for the 147c failure class until the 147c grants-rewrite ships. Retire it after.)
const profileGhosts = abilityRecords.filter(a => "challengeProfile" in a);
check("147a: challengeProfile stays retired (zero records carry it)", profileGhosts.length === 0,
  profileGhosts.slice(0, 5).map(a => a.id).join(", "));

// ---------- advisory: orphan-export sweep (CCODE-01, RESTORED) ----------
// This had regressed to its pre-CCODE-01 form — omitting tests/ and scripts/ from the consumer
// corpus (97 "orphans" instead of 1, most of them exports whose only caller is a test I wrote) and
// dumping the whole list every run. That is the advisory that cries wolf, which the PO flagged as
// A2 and which I fixed once already. Restored, with the ratchet: the known set is silent and only
// what CHANGED is named.
// engineFiles / allSrc / readDirSrc are defined above with the ratchets — one corpus, two sweeps.
// A test IS a consumer, and so is a standing maintenance script.
const consumerCorpus = [appSrc, allSrc.map(x => x.src).join("\n"), read("index.html"),
  readDirSrc("tests", [".mjs", ".js"]), readDirSrc("scripts", [".mjs", ".js"])].join("\n");
const orphans = [];
for (const { f, src } of allSrc) {
  for (const m of src.matchAll(/^export (?:async )?(?:function|const|let) (\w+)/gm)) {
    const name = m[1];
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/registry:internal/.test(line)) continue;
    const refs = [...consumerCorpus.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    const selfRefs = [...src.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    if (refs <= selfRefs) orphans.push(`${f}:${name}`);
  }
}
orphans.sort();
const knownOrphans = baseline.orphanExports || [];
const newOrphans = orphans.filter(o => !knownOrphans.includes(o));
const goneOrphans = knownOrphans.filter(o => !orphans.includes(o));
if (newOrphans.length) console.log(`note  ${newOrphans.length} NEW export(s) with no consumer — wire it, test it, or mark it // registry:internal:\n      ${newOrphans.join(", ")}`);
if (goneOrphans.length) console.log(`ok    ${goneOrphans.length} previously-orphaned export(s) now have a consumer (re-baseline with UPDATE_WIRING_BASELINE=1)`);
if (!newOrphans.length && !goneOrphans.length) console.log(`ok    orphan-export sweep: ${orphans.length} known un-consumed export(s), no change (advisory)`);


// CCODE-12: the suite is INTENTIONALLY RED right now. The PO asked to watch the seed guard fail
// before repairing the content, and a deliberate red is only useful if it stays legible — otherwise
// the next real regression hides inside "the suite is red anyway", which is worse than no gate.
// This names the expected failure, so any OTHER failure is unmistakable.
// Empty by design. The seed guard's 10 bare-string offenders were repaired and it went 19/19, so
// its entry was removed the moment it went green — which is the discipline this list needs to keep
// working. A known-red entry that outlives its failure is how a suite ends up permanently red and
// stops being read at all. Add an entry ONLY alongside a deliberate, dated, someone-else's-lane
// failure, and delete it the same day it passes.
const KNOWN_RED = [];
if (failures > 0) {
  const expected = KNOWN_RED.filter(k => failureLabels.some(l => k.match.test(l)));
  const unexpected = failures - expected.length;
  console.log(`\nWiring audit: ${failures} FAILURE(S) — ${expected.length} expected, ${unexpected} NOT expected`);
  for (const e of expected) console.log(`  · ${e.note}`);
  if (unexpected > 0) console.log(`  ⚠ ${unexpected} failure(s) above are NOT on the known-red list — treat as a regression.`);
} else {
  console.log("\nWiring audit: all checks passed.");
  if (KNOWN_RED.length) console.log(`  note: ${KNOWN_RED.length} known-red entr${KNOWN_RED.length === 1 ? "y is" : "ies are"} now green — delete from KNOWN_RED.`);
}
process.exit(failures === 0 ? 0 : 1);
