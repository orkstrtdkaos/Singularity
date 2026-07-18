#!/usr/bin/env node
/**
 * function_integrity.mjs — SNG-147d · does each ability TEACH the functions it declares?
 *
 * WHY v2 EXISTS. v1 asked "does the grant text contain strike/hit/wound?" and reported
 * 71 offenders. Hand-review of six found ONE. It missed `the_grey_hand` ("weaken a living
 * thing by touch"), `the_dread`, `wither` — because it encoded ONE tradition's way of
 * fighting and every other tradition fights in its own idiom. A detector built on generic
 * English combat vocabulary systematically misjudges exactly the design principle it was
 * written to serve.
 *
 * v2 TAKES ITS VOCABULARY FROM THE WORLD, NOT FROM ENGLISH. Two canon-derived sources:
 *   1. function_vocabulary.json DEFINITIONS — `hinder` is literally defined as
 *      "WEAKEN, drain, impair, or slow". Those words are canon, not my guess.
 *   2. The canon's own EXEMPLARS per verb ("The Grey Hand. Wither. The Dread.") — their
 *      grant text is by definition a correct teaching of that verb, so its distinctive
 *      idiom is harvested as lexicon.
 *
 * AND IT RESPECTS THE FAMILY DISTINCTIONS v1 FLATTENED:
 *   strike = harm a LIVING thing · break = destroy a THING · hinder = weaken WITHOUT wounding
 * A Wright declaring `break` is not claiming to fight. v1 counted them all as combat.
 *
 * PER-RANK AWARE (SNG-147c). Where a rank declares its own `functions`, the rank is judged
 * on the verbs IT grants. Otherwise the ability is judged whole and flagged for migration.
 *
 * Run: node function_integrity.mjs [--verb strike] [--json]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.argv.find(a => a.startsWith("--root="))?.slice(7) || ".";
const ONLY_VERB = process.argv.includes("--verb") ? process.argv[process.argv.indexOf("--verb") + 1] : null;
const JSON_OUT = process.argv.includes("--json");

// ---------- load the corpus ----------

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === ".git" || n === "node_modules") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (extname(p) === ".json") out.push(p);
  }
  return out;
}

const abilityFiles = walk(ROOT).filter(f => /content\/packs\/.*\/abilities\/.*\.json$/.test(f));
const abilities = [];
for (const f of abilityFiles) {
  let d; try { d = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
  for (const a of (d.abilities || (Array.isArray(d) ? d : []))) {
    if (a && a.id) abilities.push({ ...a, _file: f });
  }
}

const CANON = JSON.parse(readFileSync(join(ROOT, "content/packs/core/rules/function_vocabulary.json"), "utf8"));

// ---------- build the lexicon FROM CANON ----------

const STOP = new Set(`a an the and or of to in on at by for with from as is are was be been it its their them they
this that these those you your yours not no nor but if then than so such can cannot could may might must will would
what which who whom whose when where why how all any both each few more most other some only own same too very s t
one two three thing things something anything into out up down over under again further once here there`.split(/\s+/));

const words = s => (s || "").toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];

/** corpus baseline: how common is each word across ALL grant text? Used to keep only
 *  DISTINCTIVE idiom, so "living" or "target" don't become evidence of striking. */
const baseline = new Map();
let baselineDocs = 0;
for (const a of abilities) {
  const t = (a.tree || []).map(r => r.grants || "").join(" ");
  if (!t) continue;
  baselineDocs++;
  for (const w of new Set(words(t))) baseline.set(w, (baseline.get(w) || 0) + 1);
}

const lexicon = {};   // verb -> Set(words)
const exemplarsOf = {};
for (const [family, verbs] of Object.entries(CANON.families)) {
  for (const v of verbs) {
    const lex = new Set();

    // SOURCE 1 — the canon's own DEFINITION of the verb
    for (const w of words(v.definition)) if (!STOP.has(w)) lex.add(w);

    // SOURCE 2 — the canon's EXEMPLAR abilities: their grant idiom, kept if distinctive
    const names = (v.example || "").split(/[.·]/).map(s => s.trim()).filter(Boolean);
    const found = [];
    for (const nm of names) {
      const clean = nm.replace(/^⛔.*?\*\*/, "").replace(/[*]/g, "").trim();
      if (!clean || clean.length < 3) continue;
      const hit = abilities.find(a =>
        (a.name || "").toLowerCase() === clean.toLowerCase() ||
        (a.name || "").toLowerCase().includes(clean.toLowerCase()));
      if (!hit) continue;
      found.push(hit.id);
      const gt = (hit.tree || []).map(r => r.grants || "").join(" ");
      for (const w of new Set(words(gt))) {
        if (STOP.has(w)) continue;
        const df = baseline.get(w) || 0;
        if (df / baselineDocs < 0.12) lex.add(w);  // distinctive, not corpus-wide filler
      }
    }
    exemplarsOf[v.verb] = found;
    lexicon[v.verb] = lex;
    lexicon[v.verb]._family = family;
    lexicon[v.verb]._definition = v.definition;
  }
}

// ---------- the check ----------

// A declared verb is TAUGHT when the grant text contains a canon/idiom word for it that is
// not inside a negation ("cannot kill", "not killing", "never raises").
const NEG = /\b(not|never|cannot|can't|without|refus\w*|instead of|rather than|nor)\b[^.;]{0,40}$/i;

function teaches(text, verb) {
  const lex = lexicon[verb];
  if (!lex || !lex.size) return null;              // no lexicon — cannot judge
  const low = (text || "").toLowerCase();
  for (const w of lex) {
    let i = -1;
    while ((i = low.indexOf(w, i + 1)) !== -1) {
      const before = low.slice(Math.max(0, i - 60), i);
      if (!NEG.test(before)) return w;             // taught, and not as a refusal
    }
  }
  return false;
}

const findings = [];
let migrated = 0, unmigrated = 0, rankChecks = 0;

for (const a of abilities) {
  const tree = a.tree || [];
  const perRank = tree.some(r => Array.isArray(r.functions));
  perRank ? migrated++ : unmigrated++;

  if (perRank) {
    // judge each rank on the verbs IT grants
    let prev = [];
    for (const r of tree) {
      const fns = r.functions || [];
      const gained = fns.filter(v => !prev.includes(v));
      for (const v of (ONLY_VERB ? gained.filter(x => x === ONLY_VERB) : gained)) {
        rankChecks++;
        const t = teaches(r.grants, v);
        if (t === false) {
          findings.push({ severity: "FAIL", check: "rank-declares-untaught", id: a.id, rank: r.rank,
            verb: v, family: lexicon[v]?._family,
            detail: `${a.id} r${r.rank} "${r.name}" gains \`${v}\` (${lexicon[v]?._definition}) but its grants never say how` });
        }
      }
      // meaningfulness: every rank must broaden or deepen, and declare which
      if (r.rank > 1 && !r.gains) {
        findings.push({ severity: "WARN", check: "rank-no-gains-field", id: a.id, rank: r.rank,
          detail: `${a.id} r${r.rank} declares no \`gains\` (broaden|deepen) — meaningfulness unverifiable` });
      }
      if (r.rank > 1 && r.gains === "broaden" && !gained.length) {
        findings.push({ severity: "FAIL", check: "rank-claims-broaden-adds-nothing", id: a.id, rank: r.rank,
          detail: `${a.id} r${r.rank} claims gains:"broaden" but adds no new function verb` });
      }
      prev = fns;
    }
  } else {
    // un-migrated: judge the ability whole, and flag it for the per-rank model
    const all = (tree.map(r => r.grants || "").join(" ") + " " + (a.description || ""));
    for (const v of (a.functions || [])) {
      if (ONLY_VERB && v !== ONLY_VERB) continue;
      const t = teaches(all, v);
      if (t === false) {
        findings.push({ severity: "FAIL", check: "declares-untaught", id: a.id, verb: v,
          family: lexicon[v]?._family,
          detail: `${a.id} declares \`${v}\` (${lexicon[v]?._definition}) but no rank grant says how` });
      }
    }
    findings.push({ severity: "INFO", check: "awaiting-per-rank-migration", id: a.id,
      detail: `${a.id} has no per-rank functions — judged whole; migrate to the SNG-147c model` });
  }
}

// ---------- report ----------

if (JSON_OUT) {
  console.log(JSON.stringify({ findings, migrated, unmigrated, rankChecks,
    lexiconSizes: Object.fromEntries(Object.entries(lexicon).map(([k, v]) => [k, v.size])),
    exemplarsOf }, null, 2));
} else {
  const fail = findings.filter(f => f.severity === "FAIL");
  const byVerb = {};
  for (const f of fail) if (f.verb) (byVerb[f.verb] ||= []).push(f);

  console.log(`\n  FUNCTION INTEGRITY — ${abilities.length} abilities · ${migrated} per-rank · ${unmigrated} awaiting migration\n`);
  console.log(`  lexicon harvested from canon definitions + exemplars:`);
  for (const [v, l] of Object.entries(lexicon)) {
    if (!l.size) continue;
    const ex = exemplarsOf[v]?.length ? ` ← ${exemplarsOf[v].join(", ")}` : " ← (no exemplar resolved)";
    console.log(`     ${v.padEnd(10)} ${String(l.size).padStart(3)} terms${ex}`);
  }
  console.log(`\n  DECLARED BUT NOT TAUGHT — ${fail.length} total\n`);
  for (const [v, list] of Object.entries(byVerb).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${lexicon[v]?._family}/${v} — ${list.length}`);
    for (const f of list.slice(0, 8)) console.log(`     ${f.detail}`);
    if (list.length > 8) console.log(`     …and ${list.length - 8} more`);
    console.log("");
  }
  const warns = findings.filter(f => f.severity === "WARN");
  if (warns.length) {
    console.log(`  WARN — ${warns.length}`);
    for (const w of warns.slice(0, 6)) console.log(`     ${w.detail}`);
    console.log("");
  }
}

process.exit(findings.some(f => f.severity === "FAIL") ? 1 : 0);
