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

const measured = {
  abilitiesMissingHarmRung: missingHarm.length,
  abilitiesInvalidHarmRung: badHarm.length,
  abilitiesNonCanonChallengeTypes: nonCanonTypes.length,
  abilitiesCombatClaimedNotTaught: combatUntaught.length,
  rawProseCaps: rawProseCaps.length
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

// ---------- advisory: orphan-export sweep ----------
const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js"));
const allSrc = engineFiles.map(f => ({ f, src: read(`engine/${f}`) }));
const appAndTests = appSrc + allSrc.map(x => x.src).join("\n") + read("index.html");
const orphans = [];
for (const { f, src } of allSrc) {
  for (const m of src.matchAll(/^export (?:async )?(?:function|const|let) (\w+)/gm)) {
    const name = m[1];
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/registry:internal/.test(line)) continue;
    // referenced anywhere outside its own defining line?
    const refs = [...appAndTests.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    const selfRefs = [...src.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
    if (refs <= selfRefs) orphans.push(`${f}:${name}`);
  }
}
if (orphans.length) console.log(`note  ${orphans.length} export(s) with no external reference (advisory — mark intentional ones with // registry:internal):\n      ${orphans.join(", ")}`);

console.log(failures === 0 ? "\nWiring audit: all checks passed." : `\nWiring audit: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
