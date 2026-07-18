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

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) failures++;
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

// ---------- 3b. version coherence (SNG-155) ----------
// APP_VERSION stamps every feedback report; index.html's ?v= busts the cache. When they drift, bug
// reports are filed against a version that was never running — which is how a stale 1.8.104 label
// survived five ships. Cheap to check, expensive to debug without.
const indexSrc = read("index.html");
const stamps = [...indexSrc.matchAll(/\?v=([0-9.]+)/g)].map(m => m[1]);
const appVersion = appSrc.match(/const APP_VERSION = "([^"]+)"/)?.[1];
check("APP_VERSION matches index.html's cache stamp (feedback reports name the running version)",
  !!appVersion && stamps.length > 0 && stamps.every(s => s === appVersion),
  `APP_VERSION=${appVersion}, index.html stamps=${[...new Set(stamps)].join("/")}`);

// ---------- 4. skill-integrity ratchet (SNG-147d) ----------
const CANON_TYPES = new Set(["FIGHT", "INVESTIGATE", "SOCIAL", "EXPLORE", "SURVIVE", "PUZZLE", "STEALTH", "CHASE", "DUEL", "CREATE", "DEFEND", "TRAVEL"]);
const HARM_RUNGS = new Set(["none", "damaging", "incapacitating", "lethal"]);

const missingHarm = abilityRecords.filter(a => a.harmRung === undefined);
const badHarm = abilityRecords.filter(a => a.harmRung !== undefined && !HARM_RUNGS.has(a.harmRung));
const nonCanonTypes = abilityRecords.filter(a => (a.challengeTypes || []).some(t => !CANON_TYPES.has(String(t))));
// combat claimed in metadata but no rank grants teach it (147c's negation-aware core signal:
// strike/break/hinder function or FIGHT/DUEL/DEFEND type, with no offensive verb in any grants)
const claimsCombat = (a) => (a.functions || []).some(f => ["strike", "break", "hinder"].includes(String(f))) ||
  (a.challengeTypes || []).some(t => ["FIGHT", "DUEL", "DEFEND"].includes(String(t)));
// ⚠️ CORRECTED (SNG-156). This read `a.ranks[]` — a field NO ability carries. `teachesCombat` was
// therefore ALWAYS false, so this metric was silently measuring "claims combat" and nothing else:
// it could never fall by authoring better grant text, which is exactly what the 147c content lane
// was doing. Rank data lives in `a.tree[]` ({rank, name, grants, cannot, harmRung, functions,
// gains}) — the shape `progression.js:602` actually reads. Law 11 applied to my own gate.
const OFFENSIVE = /\b(strike|striking|attack|wound|fell|kill|slay|disable|disarm|bring .{0,20}down|break(s|ing)?|shatter|force|drive (back|off)|repel|bind|pin|stagger|fight|combat|offen[cs]|harm|blow|cut|sever)\b/i;
const teachesCombat = (a) => (a.tree || []).some(r =>
  OFFENSIVE.test(String(r.grants || "")) ||
  (r.functions || []).some(f => ["strike", "break", "hinder"].includes(String(f))));
const combatUntaught = abilityRecords.filter(a => claimsCombat(a) && !teachesCombat(a));

const measured = {
  abilitiesMissingHarmRung: missingHarm.length,
  abilitiesInvalidHarmRung: badHarm.length,
  abilitiesNonCanonChallengeTypes: nonCanonTypes.length,
  abilitiesCombatClaimedNotTaught: combatUntaught.length
};

const baselinePath = join(root, "tests", "wiring_baseline.json");
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
for (const [k, v] of Object.entries(measured)) {
  check(`ratchet: ${k} = ${v} (baseline ${baseline[k]}) — may only go DOWN`, v <= baseline[k],
    k === "abilitiesCombatClaimedNotTaught" ? `regressed — a new ability claims combat its grants never teach (147c rule: if it can fight, a rank grants says HOW)` : `regressed past baseline`);
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

// ---------- advisory: orphan-export sweep (SNG-156) ----------
// PO amendment A2 was right and the first cut of this was wrong twice over:
//   (1) the reference corpus omitted tests/ and scripts/ — a test IS a consumer, so every export
//       whose only caller was a smoke test read as an orphan (all six waygate.js exports had ten
//       tests each; GM_CONTEXT was flagged by the very audit that iterates it).
//   (2) it dumped the whole list on every run. 113 lines of standing noise is an advisory nobody
//       reads — the same "a hint that fires every turn is a hint nobody reads" failure this batch
//       cited elsewhere. It now RATCHETS: the known set is baselined and silent; only what CHANGED
//       is named.
const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
const allSrc = engineFiles.map(f => ({ f, src: read(`engine/${f}`) }));
const readDirSrc = (dir, exts) => {
  try {
    return readdirSync(join(root, dir)).filter(f => exts.some(e => f.endsWith(e)))
      .map(f => read(`${dir}/${f}`)).join("\n");
  } catch { return ""; }
};
// The full consumer corpus: runtime, markup, the test suite, and the standing helper scripts.
const consumerCorpus = [
  appSrc, allSrc.map(x => x.src).join("\n"), read("index.html"),
  readDirSrc("tests", [".mjs", ".js"]), readDirSrc("scripts", [".mjs", ".js"])
].join("\n");

const orphans = [];
for (const { f, src } of allSrc) {
  for (const m of src.matchAll(/^export (?:async )?(?:function|const|let) (\w+)/gm)) {
    const name = m[1];
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/registry:internal/.test(line)) continue; // declared module-internal on purpose
    const refs = [...consumerCorpus.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    const selfRefs = [...src.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    if (refs <= selfRefs) orphans.push(`${f}:${name}`);
  }
}
orphans.sort();
const knownOrphans = baseline.orphanExports || [];
const newOrphans = orphans.filter(o => !knownOrphans.includes(o));
const goneOrphans = knownOrphans.filter(o => !orphans.includes(o));
if (newOrphans.length) {
  console.log(`note  ${newOrphans.length} NEW export(s) with no consumer — wire it, test it, or mark it // registry:internal:\n      ${newOrphans.join(", ")}`);
}
if (goneOrphans.length) {
  console.log(`ok    ${goneOrphans.length} previously-orphaned export(s) now have a consumer (re-baseline with UPDATE_WIRING_BASELINE=1): ${goneOrphans.slice(0, 6).join(", ")}${goneOrphans.length > 6 ? " …" : ""}`);
}
if (!newOrphans.length && !goneOrphans.length) {
  console.log(`ok    orphan-export sweep: ${orphans.length} known un-consumed export(s), no change (advisory)`);
}

// Baseline write happens LAST so it can capture the orphan set alongside the ratchet counts.
if (process.env.UPDATE_WIRING_BASELINE === "1" || !existsSync(baselinePath)) {
  writeFileSync(baselinePath, JSON.stringify({
    note: "SNG-147d ratchet — known-offender counts may only DECREASE. orphanExports is the KNOWN un-consumed set (SNG-156): it is silent when unchanged, and only NEW entries are named. Re-baseline deliberately with UPDATE_WIRING_BASELINE=1; never hand-edit a count upward.",
    updatedAt: new Date().toISOString().slice(0, 10),
    ...measured,
    orphanExports: orphans
  }, null, 2) + "\n");
  console.log(`ok    ratchet baseline written: ${JSON.stringify(measured)} + ${orphans.length} known orphan export(s)`);
}

console.log(failures === 0 ? "\nWiring audit: all checks passed." : `\nWiring audit: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
