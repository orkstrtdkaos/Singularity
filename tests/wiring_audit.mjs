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

// ---------- 3b. version FRESHNESS (SNG-274) ----------
// The check above proves app.js and index.html AGREE. That is consistency, not freshness — both going stale
// together stays green forever, and that is exactly what happened: the version last moved 2026-08-01 and
// every commit since was green while the whole world-simulation chain shipped under a frozen label.
//
// So: if a commit touched the SOURCE THE VERSION DESCRIBES (app.js, engine/**, index.html), the version must
// have moved in that same commit. Content, specs, tests and docs do not require a bump — they do not change
// what a player is running, and a rule that cried wolf on every content commit would be turned off inside a
// week.
//
// ⚠️ SKIPS ITSELF rather than failing when it cannot know (no git, no parent commit, a merge). A gate that
// fails on a shallow clone teaches people to ignore gates.
{
  let verdict = null;   // null = cannot tell, so say nothing
  try {
    const { execFileSync } = await import("node:child_process");
    const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const parents = git("rev-list", "--parents", "-n", "1", "HEAD").split(/\s+/);
    if (parents.length === 2) {   // exactly one parent: an ordinary commit, not a merge or a root
      const touched = git("diff", "--name-only", "HEAD~1", "HEAD").split(/\r?\n/).filter(Boolean);
      const versioned = touched.filter(f => f === "app.js" || f === "index.html" || f.startsWith("engine/"));
      if (versioned.length) {
        const before = git("show", "HEAD~1:app.js").match(/const APP_VERSION = "([^"]+)"/)?.[1] || null;
        verdict = { moved: !!before && before !== appVersion, before, files: versioned.length, sample: versioned.slice(0, 3) };
      }
    }
  } catch { verdict = null; }

  if (verdict === null) {
    console.log("note  version freshness: not checkable here (no git, a merge, or no source change in HEAD)");
  } else {
    check(`the version MOVED with the source it describes (HEAD changed ${verdict.files} versioned file(s): ${verdict.sample.join(", ")})`,
      verdict.moved,
      `still ${appVersion} — run: node scripts/bump_version.mjs   (or "minor" / "--set X.Y.Z" for a milestone)`);
  }
}

// ---------- 3c. unread-writes: every gameplay control the Settings screen writes has a live reader ----------
// SNG-205 §3: the batch's recurring bug is a dial the UI writes that NOTHING reads — `encounterRate` was the
// cautionary tale (Erik maxed it, saw no change, because it had zero consumers; the real control is
// `pacing`). This extends the audit's "a value with no reader" principle (the gm-registry parity above) from
// the GM context to player-facing GAMEPLAY controls: each must be WRITTEN by the Settings screen AND reach
// the ENGINE, where gameplay consumes it. Pure-UI prefs (ttsVoice/readAloud) are app-side and excluded — this
// guards the "dial that should DO something" class. Add a new gameplay dial → add it here; if it has no
// engine reader it is not wired, and this fails instead of a player discovering it.
const engineSrc = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).map(f => read("engine/" + f)).join("\n");
const GAMEPLAY_CONTROLS = {
  pacing: "encounter frequency (resolvePacing)",
  plainness: "narration plainness (SNG-144)",
  bluntness: "narration bluntness (SNG-144)",
  contentGenerator: "canon-author weight boost (SNG-132)",
};
for (const [key, what] of Object.entries(GAMEPLAY_CONTROLS)) {
  const written = new RegExp("profile\\." + key + "\\s*=").test(appSrc);
  const readByEngine = new RegExp("\\b" + key + "\\b").test(engineSrc);
  check(`player control '${key}' is written by Settings AND read by the engine (${what})`, written && readByEngine,
    `${!written ? "not written by the Settings screen" : ""}${!readByEngine ? `${!written ? "; " : ""}no engine module reads it — an unwired dial (SNG-205 §2b, the encounterRate class)` : ""}`);
}
check("unread-writes guard can fail (encounterRate — a phantom control — reaches no engine reader)", !/\bencounterRate\b/.test(engineSrc));

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
  const salvageKeys = (() => { const m = gmSrc.match(/const SALVAGEABLE_OPS = \[([^\]]+)\]/); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : []; })();
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
// ---------- SNG-352a: what "claims combat" MEANS, derived from the canon that defines it ----------
//
// ⛔ THE GATE WAS ASSERTING SOMETHING FALSE ABOUT DEFENCE. `claimsCombat` fired on a FIGHT|DUEL|DEFEND
// challengeType, so a WARD tagged DEFEND "claimed combat" and was then failed for not teaching offence.
// Aevi: "the gate is asserting something false about what a defensive ability is" — and (b), fixing it by
// tagging wards with harm they should not have, would have been repairing a bad test by corrupting content.
// 23 of the 42 offenders were flagged by challengeType ALONE: prism_sight, darksight, resonant_anchor,
// perfect_motion — reveals, shields and wards, correctly tagged as USABLE in a fight.
//
// challengeTypes answers WHERE A CRAFT CAN BE USED. functions answer WHAT IT DOES. Only the second is a
// claim about harm, and the vocabulary already says which those are: the HARM family.
//
// ⚠️ DERIVED, NOT RETYPED. Aevi: "the verb list is hand-maintained and must agree with
// function_vocabulary.json — your own comment says it was already repaired once for exactly this drift.
// Derive it from the vocabulary file rather than fixing it a third time." So the HARM family and the verbs
// inside its own definitions are READ FROM THE FILE. Add a fourth harm verb to the canon and this audit
// picks it up on the next run, with no second place to remember.
const FN_VOCAB = JSON.parse(readFileSync(join(root, "content/packs/core/rules/function_vocabulary.json"), "utf8"));
const HARM_FAMILY = (FN_VOCAB.families?.HARM || []);
const HARM_FUNCTIONS = new Set(HARM_FAMILY.map(f => String(f.verb)));

// The canon verbs: each family member's own name, plus the words its DEFINITION uses to define it
// ("Harm a LIVING thing" → harm; "WEAKEN, drain, impair, or slow" → weaken/drain/impair/slow).
const canonVerbs = new Set();
for (const f of HARM_FAMILY) {
  canonVerbs.add(String(f.verb).toLowerCase());
  for (const w of String(f.definition || "").toLowerCase().match(/[a-z]{4,}/g) || []) {
    if (["thing", "living", "directly", "that", "this", "with", "without", "space", "debuff", "structure", "formation", "working", "object"].includes(w)) continue;
    canonVerbs.add(w);
  }
}
// \u26a0\ufe0f AND AN HONESTLY-LABELLED SUPPLEMENT. A rank's `grants` is PROSE, and prose reaches for synonyms the
// canon never enumerates \u2014 "disarm", "stagger", "drive back" are offensive by any reading and appear in no
// definition. Pretending the vocabulary could supply them would be the wrong kind of purity; the point of
// deriving the CANON half is that the half which CAN drift no longer does.
const PROSE_SYNONYMS = ["attack", "wound", "fell", "disable", "disarm", "shatter", "repel", "pin", "stagger",
  "fight", "combat", "dismantl", "unmak", "bring .{0,20}down", "drive (back|off)"];

// ⛔ SNG-352b — `\w*` SUFFIXING CATCHES CONJUGATIONS AND NEVER IRREGULARS, AND PROSE REACHES FOR THE PAST
// TENSE CONSTANTLY. Aevi hit this twice in one batch: she wrote "is struck by every door that closes" — a
// true statement about harm — and the gate structurally could not read it, because `strike\w*` does not
// match "struck". She fixed it by rewriting to the present form.
//
// ⚠️ THAT FIX IS THE PROBLEM, NOT THE RESOLUTION. She had already ruled out option (b) on exactly this
// principle — "that would have you fix a bad test by corrupting content" — and then a bad test quietly made
// her weaken a well-made line to satisfy a regex. A tool that costs the author their better phrasing is
// levying a tax, and the tax is invisible because the build goes green either way.
//
// She flagged it as a known blind spot rather than a request. It is cheap, it is MY gate, and the cost
// lands on HER, so it gets fixed: the irregular forms of the verbs actually in play, listed against their
// base so the pairing is inspectable. English has no rule to derive these from — that is what irregular
// means — so this is an enumeration by necessity, not by laziness.
const IRREGULAR_PAST = {
  strike: ["struck", "stricken"], break: ["broke", "broken"], fell: ["fell", "fallen"],
  drive: ["drove", "driven"], bring: ["brought"], tear: ["tore", "torn"], slay: ["slew", "slain"],
  bind: ["bound"], shake: ["shook", "shaken"], freeze: ["froze", "frozen"], bleed: ["bled"],
  rend: ["rent"], smite: ["smote", "smitten"], throw: ["threw", "thrown"], beat: ["beaten"],
  shoot: ["shot"], cut: ["cut"], hurt: ["hurt"], burn: ["burnt"],
};
const irregularsFor = (verbs) => {
  const out = new Set();
  for (const v of verbs) {
    const base = String(v).replace(/\\w\*$/, "");
    for (const form of IRREGULAR_PAST[base] || []) out.add(form);
  }
  return [...out];
};
const OFFENSIVE_TERMS = [...canonVerbs].concat(PROSE_SYNONYMS);
const OFFENSIVE_RE = new RegExp(String.raw`\b(`
  + OFFENSIVE_TERMS.map(v => v + String.raw`\w*`)
    .concat(irregularsFor(OFFENSIVE_TERMS))       // irregulars matched WHOLE — no suffixing, that is the point
    .join("|") + String.raw`)\b`, "i");

const claimsCombat = (a) => (a.functions || []).some(f => HARM_FUNCTIONS.has(String(f)));
const teachesCombat = (a) => (a.tree || a.ranks || []).some(r => OFFENSIVE_RE.test(String(r.grants || "")));
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

// ---------- unread RULE CONSTANTS (SNG-258) ----------
// The unread-writes guard above covers dials the SETTINGS SCREEN writes. It does not cover the much larger
// surface of authored TUNING CONSTANTS in the rules files — and a real instance slipped through on this very
// ticket. Moving crits to a second roll, the first draft COPIED SNG-140's `wild.critSuccessWiden` /
// `critFailWiden` into a new `crit` block instead of reading them, silently orphaning Aevi's authored dial.
// Erik would have turned it and seen nothing: the encounterRate class, one layer down, where nothing looked.
// Ratcheted, not absolute — resolution.json legitimately carries constants read by content or authored ahead
// of their consumer. The baseline pins today's count; a NEW orphan fails the build.
const ANNOTATION_KEYS = new Set(["note", "notes", "comment", "_comment", "schemaVersion", "label", "description", "band", "tier", "precision"]);
// ---------- 3d. UNAUTHORED RULES KEYS (SNG-279) ----------
// The MIRROR of `unreadRuleConstants` above, and the direction nothing had ever checked. That one catches an
// authored dial no module reads. This catches a dial a module READS THAT NOBODY AUTHORED — and that is the
// worse direction, because the failure is silent by construction: the whole job of `?? fallback` is to not
// complain, so an unauthored dial behaves exactly like one set to its default, and the only symptom is that
// turning it does nothing.
//
// Aevi (SNG-278) generalised it after counting THREE instances in one week — the encounters XP table, the
// background id, and `rules.arcResponse`, where all 21 world-simulation dials ran on hardcoded fallbacks
// while I told her and Erik "that's the dial, the number is your call."
//
// A RATCHET, not a gate: the known-pending ones stay (threat.js says in its own comment that it is awaiting
// Aevi's authored ladder, CCODE-52). It only refuses NEW ones.
//
// ⚠️ ONLY `CONTENT.rules.X` / `content.rules.X` COUNTS. A module parameter named `rules` is not necessarily
// the merged bag — `intensity.js` reads `rules.steps` and is passed `CONTENT.intensity`, where `steps` is
// authored and correct. Counting bare reads would make this cry wolf, and a noisy ratchet is one people
// learn to skip.
const unauthoredRulesKeys = (() => {
  const provided = new Set(Object.keys(JSON.parse(read("content/packs/core/rules/resolution.json"))));
  const stateSrc = read("engine/state.js");
  for (const m of stateSrc.matchAll(/\brules\.([A-Za-z_$][\w$]*)\s*=/g)) provided.add(m[1]);
  const all = engineSrc + "\n" + appSrc;
  const written = new Set([...all.matchAll(/\brules\.([A-Za-z_$][\w$]*)\s*=/g)].map(m => m[1]));
  const readKeys = new Set();
  for (const re of [/\bCONTENT\.rules\??\.([A-Za-z_$][\w$]*)/g, /\bcontent\.rules\??\.([A-Za-z_$][\w$]*)/g]) {
    for (const m of all.matchAll(re)) readKeys.add(m[1]);
  }
  return [...readKeys].filter(k => !provided.has(k) && !written.has(k)).sort();
})();
check("unauthored-rules-key guard can fail (a key read from the bag that no pack provides is detected)",
  !/CONTENT\.rules\.fabricatedPhantomBlock/.test(engineSrc + appSrc));
if (process.env.SHOW_UNAUTHORED_RULES_KEYS === "1" && unauthoredRulesKeys.length) {
  console.log(`note  ${unauthoredRulesKeys.length} unauthored rules key(s) read from the bag:\n      ${unauthoredRulesKeys.join("\n      ")}`);
}
const unreadRuleConstants = (() => {
  const consumers = engineSrc + "\n" + appSrc;
  const out = [];
  const walk = (node, path) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { for (const v of node) walk(v, path); return; }   // array entries are data, not dials
    for (const [k, v] of Object.entries(node)) {
      if (ANNOTATION_KEYS.has(k)) continue;
      // `_foo` is DOCUMENTATION FOR `foo`, sitting beside it so the dial explains itself where it is turned.
      // Exempt — but NARROWLY, or the underscore becomes a place to hide a dial: it must be a string, and the
      // key it documents must actually exist as a sibling. `foo` itself is still audited, so the only thing an
      // underscore can buy you is a comment.
      if (k.startsWith("_") && typeof v === "string" && Object.hasOwn(node, k.slice(1))) continue;
      if (v && typeof v === "object") { walk(v, path.concat(k)); continue; }
      if (!new RegExp(`\\b${k.replace(/[^\w]/g, "\\$&")}\\b`).test(consumers)) out.push(path.concat(k).join("."));
    }
  };
  walk(JSON.parse(read("content/packs/core/rules/resolution.json")), []);
  return out;
})();
check("unread-rule-constant guard can fail (a dial no module names is detected as unread)",
  !/\bfabricatedPhantomDial\b/.test(engineSrc + appSrc));

// …and the doc-key exemption must not become a hiding place. A `_foo` with no sibling `foo` is NOT
// documentation, it is an unread constant wearing an underscore, and it must still be caught.
check("the `_doc` exemption only covers a string documenting a REAL sibling dial", (() => {
  const probe = (node) => { const out = []; for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("_") && typeof v === "string" && Object.hasOwn(node, k.slice(1))) continue;
    out.push(k); } return out; };
  return probe({ realDial: 1, _realDial: "docs" }).join() === "realDial"
      && probe({ _orphanDial: "docs" }).join() === "_orphanDial"
      && probe({ numericHider: 1, _numericHider: 42 }).includes("_numericHider");
})());
// Naming them costs nothing and saves the next person writing a bespoke script (which is easy to point at
// the wrong directory and get a confidently wrong answer): SHOW_UNREAD_RULE_CONSTANTS=1 node tests/wiring_audit.mjs
if (process.env.SHOW_UNREAD_RULE_CONSTANTS === "1") {
  console.log(`note  ${unreadRuleConstants.length} unread resolution.json constant(s):\n      ${unreadRuleConstants.join("\n      ")}`);
}

const measured = {
  testOnlyExports: testOnlyExports.length,
  abilitiesMissingHarmRung: missingHarm.length,
  abilitiesInvalidHarmRung: badHarm.length,
  abilitiesNonCanonChallengeTypes: nonCanonTypes.length,
  abilitiesCombatClaimedNotTaught: combatUntaught.length,
  rawProseCaps: rawProseCaps.length,
  importedNeverCalled: importedNeverCalled.length,
  unreadRuleConstants: unreadRuleConstants.length,
  unauthoredRulesKeys: unauthoredRulesKeys.length
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
          : k === "unreadRuleConstants"
            ? `a NEW authored tuning constant in resolution.json that no engine/app module reads by name — a dial Erik can turn with nothing on the other end (SNG-258; the encounterRate class, one layer down). Read it, or delete it:\n      ${unreadRuleConstants.slice(0, 10).join("\n      ")}`
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


// ---------- 5. SNG-232: THE SEAM AUDITOR ----------
// Everything above answers "is each thing WIRED and SCHEMA-VALID?" — and does it well. What it does NOT catch:
// two individually-valid systems that DISAGREE about the same data. That seam-contract failure was ~80% of the
// 2026-07 session's bugs (_gen boolean-vs-object, null-field readers, pool-vs-seed sources, register-vs-engage).
// A "seam" = a producer writes data a consumer reads under an UNSTATED contract. tests/seams.json DECLARES the
// known contracts; this section gates on them. Grows by incident — a seam that broke once is a build gate
// forever. It EXTENDS this audit (one gate), it does not replace it.
//
// GUARD — a seam check that cannot fail is theater (the registry:internal lesson). Two teeth: (a) the matcher
// SELF-TESTS against a synthetic broken input before any real seam is trusted, and (b) a stale/renamed consumer
// region FAILS loud rather than passing vacuously.
{
  // Extract a function/region body by name via brace-balance. Tries declaration forms in order (never a bare
  // call site). Returns null if no declaration is found; returns to EOF if braces don't balance (a string with a
  // lone brace) — conservative: a larger region only makes `requires` easier to satisfy, never a false red.
  const sliceRegion = (src, name) => {
    if (!name) return src;
    let idx = -1;
    for (const re of [
      new RegExp(`function\\s+${name}\\s*\\(`),
      new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?(?:function|\\()`),
      new RegExp(`\\b${name}\\s*[:=]\\s*(?:async\\s*)?function`),
    ]) { const m = src.match(re); if (m) { idx = m.index; break; } }
    if (idx < 0) return null;
    // Find the BODY brace, not a brace inside the parameter list — default/destructured params carry braces
    // (`catalog = {}`, `{ at = null } = {}`). If params are in parens, balance the parens first, THEN take the
    // next `{`; only fall back to the first `{` when there's no param-paren before it (e.g. a bare-arg arrow).
    const firstBrace = src.indexOf("{", idx);
    const firstParen = src.indexOf("(", idx);
    let braceStart;
    if (firstParen >= 0 && (firstBrace < 0 || firstParen < firstBrace)) {
      let pd = 0, i = firstParen;
      for (; i < src.length; i++) { if (src[i] === "(") pd++; else if (src[i] === ")" && --pd === 0) break; }
      braceStart = src.indexOf("{", i);
    } else { braceStart = firstBrace; }
    if (braceStart < 0) return null;
    let depth = 0;
    for (let i = braceStart; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}" && --depth === 0) return src.slice(idx, i + 1);
    }
    return src.slice(idx);
  };

  // Run one seam's assert block against a scanned source → { ok, detail }.
  const runSeam = (regionSrc, assert = {}) => {
    const missing = (assert.requires || []).filter(p => !new RegExp(p).test(regionSrc));
    const present = (assert.forbids || []).filter(p => new RegExp(p).test(regionSrc));
    const bits = [];
    if (missing.length) bits.push(`missing required: ${missing.join(" | ")}`);
    if (present.length) bits.push(`forbidden present: ${present.join(" | ")}`);
    return { ok: missing.length === 0 && present.length === 0, detail: bits.join("; ") };
  };

  // corpus SCAN — concat named files/dirs into one searchable string (for a whole-of-engine forbids/requires).
  const corpusSrc = (list) => (list || []).map(entry => {
    if (/\.(mjs|js)$/.test(entry)) { try { return read(entry); } catch { return ""; } }
    try { return readdirSync(join(root, entry)).filter(f => f.endsWith(".js")).map(f => read(`${entry}/${f}`)).join("\n"); } catch { return ""; }
  }).join("\n");

  // content-presence — every JSON record in a dir must carry the required fields. `field` specs: a dotted path
  // ("worldPos.colatitude") asserts non-null; a "[N]" suffix ("axisVector[12]") asserts an array of that length.
  const walkField = (obj, spec) => {
    const arr = spec.match(/^(.+)\[(\d+)\]$/);
    if (arr) { const v = arr[1].split(".").reduce((o, k) => (o == null ? o : o[k]), obj); return Array.isArray(v) && v.length === Number(arr[2]); }
    return spec.split(".").reduce((o, k) => (o == null ? o : o[k]), obj) != null;
  };
  const contentPresence = (dir, fields) => {
    let files = [];
    try { files = readdirSync(join(root, dir)).filter(f => f.endsWith(".json")); } catch { return { ok: false, detail: `content dir ${dir} not found` }; }
    const bad = [];
    for (const f of files) { let j; try { j = JSON.parse(read(`${dir}/${f}`)); } catch { continue; } for (const spec of (fields || [])) if (!walkField(j, spec)) bad.push(`${f}:${spec}`); }
    return { ok: bad.length === 0, detail: bad.length ? `${bad.length} record(s) missing a required field: ${bad.slice(0, 6).join(", ")}${bad.length > 6 ? " …" : ""}` : "" };
  };

  // (a) SELF-TEST — the matcher must go RED on a missing-required pattern and GREEN on a present one, or every
  // seam verdict below is meaningless. This is the "can it actually fail?" tooth, run before trusting any green.
  const selfRed = runSeam("a = b + c;", { requires: ["THIS_PATTERN_IS_ABSENT"] });
  const selfGreen = runSeam("uses eligibleEncountersFor here", { requires: ["eligibleEncountersFor"] });
  check("SNG-232 seam matcher can go RED (self-test: missing-required fails, present-required passes)",
    !selfRed.ok && selfGreen.ok, "the seam matcher misbehaved — a green seam below would be theater");

  // (b) the declared ledger — each seam reads REAL code (or a REAL covering gate); a broken contract goes red.
  // Four modes, dispatched by which fields the entry declares:
  //   coveredBy → the seam is gated by ANOTHER check; assert that check's signature is still present (so a
  //               deleted covering gate turns THIS seam red — the seam is never silently un-gated).
  //   content   → iterate JSON records in a dir, assert each carries the required fields (catch at BUILD, not play).
  //   corpus    → concat named files/dirs, run assert.requires/forbids across the whole scan.
  //   (default) → scope to consumer.file [+ region], run assert.requires/forbids.
  let seams = null;
  try { seams = JSON.parse(read("tests/seams.json")).seams || []; }
  catch (e) { check("SNG-232 tests/seams.json parses", false, e.message); }
  if (seams) {
    check(`SNG-232 seam ledger loaded (${seams.length} declared seam${seams.length === 1 ? "" : "s"})`,
      seams.length > 0, "no seams declared — the auditor has nothing to gate (Aevi authors the full ledger)");
    for (const s of seams) {
      const label = `seam '${s.id}' (${s.incident} · ${s.kind}): ${s.contract}`;
      if (s.coveredBy) {
        let gsrc = null; try { gsrc = read(s.coveredBy.gate); } catch { /* handled next */ }
        if (gsrc == null) { check(`${label} [coveredBy ${s.coveredBy.gate}]`, false, "covering-gate file not found — stale seam"); continue; }
        const present = new RegExp(s.coveredBy.signature).test(gsrc);
        check(label, present, present ? "" : `the covering check's signature /${s.coveredBy.signature}/ is GONE from ${s.coveredBy.gate} — this seam is no longer gated anywhere`);
        continue;
      }
      if (s.content) { const { ok, detail } = contentPresence(s.content.dir, s.content.requireFields); check(label, ok, detail); continue; }
      if (s.corpus) { const { ok, detail } = runSeam(corpusSrc(s.corpus), s.assert); check(label, ok, detail); continue; }
      // default: scope to the consumer file [+ region]
      const file = s.consumer?.file;
      let src = null;
      try { src = read(file); } catch { /* handled next */ }
      if (src == null) { check(`${label} [consumer ${file}]`, false, "declared consumer file not found — stale seam"); continue; }
      const region = sliceRegion(src, s.consumer?.region);
      if (region == null) { check(`${label} [region ${s.consumer.region}]`, false, "declared region not found — renamed/removed function, stale seam"); continue; }
      const { ok, detail } = runSeam(region, s.assert);
      check(label, ok, detail);
    }
  }
}


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
// ---------- CCODE-90: every LEGEND BEAT must be reachable from the thing that selects beats ----------
// `passing_advice` was defined in LEGEND_BEATS, described in the GM directive table, authored into legend
// content, and deployable by legendSurfacing (215/400 apt moments) - and `detectLegendBeat` in app.js, the
// ONLY function that chooses a beat, never returned it. Both of its branches required an ACTIVE ENCOUNTER,
// and a passing legend is by definition a mundane crossing. The one deployment mode built for a wandering
// mentor was the one that could not happen, which is why Aevi's Ash - a figure whose whole character is
// restraint - had an unreachable primary mode.
//
// This is PromisedButUnread through a new door: not an unread field, but an unreachable VALUE of a read one.
{
  const legendsSrc = readFileSync(join(root, "engine/legends.js"), "utf8");
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  const beats = (legendsSrc.match(/LEGEND_BEATS\s*=\s*\[([^\]]*)\]/) || [])[1] || "";
  const names = [...beats.matchAll(/"([a-z_]+)"/g)].map(m => m[1]);
  // Extracted by index rather than regex: the function body spans lines and a multi-line pattern here is one
  // escaping mistake away from being silently wrong about what it read.
  const dStart = appSrc.indexOf("function detectLegendBeat()");
  const NL = String.fromCharCode(10);   // no backslash escapes: this line has been mangled twice already
  const detector = dStart < 0 ? "" : appSrc.slice(dStart, appSrc.indexOf(NL + "}", dStart) + 2);
  // villain_escalation is world-arc driven rather than moment-detected, and is exempted BY NAME so the
  // exemption is visible rather than a silent gap in the check.
  const worldDriven = new Set(["villain_escalation"]);
  const unreachable = names.filter(b => !worldDriven.has(b) && !detector.includes(`"${b}"`));
  check("CCODE-90: every moment-detected legend beat is actually returned by detectLegendBeat",
    unreachable.length === 0,
    `defined, described and deployable — but nothing can ever SELECT: ${unreachable.join(", ")}`);
}

process.exit(failures === 0 ? 0 : 1);
