// tradition_matrix.mjs — WHICH KITS PERFORM, AND WHERE? A tradition × level × threat matrix.
//
// Erik: "a nice matrix of various leveled synthetic players from each tradition... find which traditions
// are underpowered or where each performs best."
//
// Every character in the valley is a TRADITION plus a level, and the 27 traditions were authored
// independently over months. Nothing has ever compared them. A tradition whose kit cannot answer a fight
// is not a balance nuance — it is a player who chose a people and quietly cannot play, and they discover
// it at level 20 rather than in CI.
//
// WHAT THIS IS AND IS NOT. It builds a real kit from the REAL ability catalog (levelReq-gated, capacity-
// capped by skill_capacity.json) and drives the REAL contest engine through the shared harness. But a
// simulated fight is ONE axis of a craft — a tradition built for knowing, mending or moving is SUPPOSED to
// lose a straight fight, and calling that "underpowered" would be exactly the wrong reading. So:
//   · the per-tradition win rates are a REPORT, printed for Erik and Aevi to rule on. Not gates.
//   · the ASSERTIONS are only structural truths no design intent can excuse — every tradition must have a
//     usable kit at every level, and no tradition may be so dominant that threat stops mattering to it.
// The report is the deliverable; the gates are the floor beneath it.
//
// Run: node tests/tradition_matrix.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { oneFight, mulberry32 } from "./lib/fightharness.mjs";
import { familiesOfAbility, buildFunctionIndex } from "../engine/functions.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const rules = rj("content/packs/core/rules/resolution.json");
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;
const capacity = rj("content/packs/core/rules/skill_capacity.json").skillsKnownByLevel || {};
const FN_INDEX = buildFunctionIndex(rj("content/packs/core/rules/function_vocabulary.json"));
const TRADITIONS = rj("content/packs/core/rules/traditions.json").traditions || [];

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;

// ---------- the real ability catalog, indexed by tradition ----------
const byTradition = {};
for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) {
    if (a?.tradition) (byTradition[a.tradition] = byTradition[a.tradition] || []).push(a);
  }
}
// `valley_craft` is the universal folk kit everyone can reach, not a people — it is the CONTROL row, not a
// tradition under test. `precursor`/`cross_pole_braid` are late/cross-tradition sets, not a starting path.
const CONTROL = "valley_craft";
const UNDER_TEST = Object.keys(byTradition).filter(t => !["valley_craft", "precursor", "cross_pole_braid"].includes(t)).sort();

const LEVELS = [5, 12, 20];
const BANDS = [{ name: "riffraff", threat: 22 }, { name: "notable", threat: 38 }, { name: "regional", threat: 55 }, { name: "epic", threat: 78 }];
const TRIALS = 40;

/** A synthetic character of this tradition at this level. Attributes are UNIFORM across traditions on
 *  purpose — the variable under test is the KIT, so any difference in outcome is the craft, not a sheet I
 *  tuned. Capacity comes from the real skill_capacity table; the kit is the highest-tier abilities the
 *  level can hold, which is how a real character of that people would actually be built. */
function buildKit(tradition, level) {
  const pool = (byTradition[tradition] || []).filter(a => (a.levelReq || 1) <= Math.ceil(level / 5));
  const cap = Number(capacity[String(level)] ?? capacity[String(Math.min(25, level))] ?? 6) || 6;
  const kit = pool.slice().sort((a, b) => (b.levelReq || 1) - (a.levelReq || 1)).slice(0, cap);
  return kit.map(a => ({ ...a, intensity: "standard", tier: a.levelReq || 1 }));
}
function sheetFor(level) {
  const attr = Math.max(2, Math.min(8, 2 + Math.floor(level / 4)));
  return { name: "the player", level,
    attributes: { physical: attr, mental: attr, social: attr, practical: attr },
    subAttributes: { strength: attr, agility: attr, reason: attr, insight: attr, presence: attr, rapport: attr, craft: attr, wits: attr },
    energy: 60 + level * 4, health: 30 + level * 2, maxHealth: 30 + level * 2 };
}

console.log("TRADITION MATRIX — synthetic players from every tradition, across levels and threat bands\n");
console.log(`      ${UNDER_TEST.length} traditions under test (+${CONTROL} as the control) × levels ${LEVELS.join("/")} × ${BANDS.length} bands × ${TRIALS} trials\n`);

// ---------- run the matrix ----------
const results = {};   // tradition -> level -> band -> winRate
for (const trad of [...UNDER_TEST, CONTROL]) {
  results[trad] = {};
  for (const level of LEVELS) {
    const kit = buildKit(trad, level), sheet = sheetFor(level);
    results[trad][level] = { kitSize: kit.length, families: [...new Set(kit.flatMap(a => familiesOfAbility(a, FN_INDEX)))], bands: {} };
    for (const band of BANDS) {
      let won = 0;
      for (let i = 0; i < TRIALS; i++) {
        const f = oneFight({ threat: band.threat, moves: kit, sheet, sb, steps, rules,
          rng: mulberry32(0x7ABC ^ (trad.length * 7919) ^ (level * 104729) ^ (band.threat * 31) ^ i) });
        if (f.won) won++;
      }
      results[trad][level].bands[band.name] = pct(won, TRIALS);
    }
  }
}

// ---------- THE REPORT (the deliverable — Erik and Aevi rule on these numbers, not this file) ----------
const overall = t => LEVELS.flatMap(l => BANDS.map(b => results[t][l].bands[b.name])).reduce((a, x) => a + x, 0) / (LEVELS.length * BANDS.length);
const ranked = [...UNDER_TEST].sort((a, b) => overall(b) - overall(a));

console.log("      TRADITION            L5  riff/note/reg/epic   L12 riff/note/reg/epic   L20 riff/note/reg/epic   mean");
for (const t of ranked) {
  const row = LEVELS.map(l => BANDS.map(b => String(results[t][l].bands[b.name]).padStart(3)).join("/")).join("   ");
  console.log(`      ${t.padEnd(20)} ${row}   ${overall(t).toFixed(1)}%`);
}
const ctrl = overall(CONTROL);
console.log(`      ${("[" + CONTROL + "]").padEnd(20)} ${LEVELS.map(l => BANDS.map(b => String(results[CONTROL][l].bands[b.name]).padStart(3)).join("/")).join("   ")}   ${ctrl.toFixed(1)}%  ← control`);

console.log(`\n      STRONGEST: ${ranked.slice(0, 3).map(t => `${t} ${overall(t).toFixed(0)}%`).join(" · ")}`);
console.log(`      WEAKEST:   ${ranked.slice(-3).map(t => `${t} ${overall(t).toFixed(0)}%`).join(" · ")}`);
console.log(`      SPREAD:    ${(overall(ranked[0]) - overall(ranked[ranked.length - 1])).toFixed(1)} points between the strongest and weakest kit in a straight fight`);

// Where a tradition beats its PEERS, not where it beats the easiest foe — "everyone's best band is
// riffraff" is true and useless. Relative to the cohort mean at each band, so the line says something.
console.log("\n      where each tradition OUT-performs the cohort (band-relative, +pts vs the mean):");
for (const b of BANDS) {
  const mean = UNDER_TEST.reduce((s, t) => s + LEVELS.reduce((q, l) => q + results[t][l].bands[b.name], 0) / LEVELS.length, 0) / UNDER_TEST.length;
  const lead = UNDER_TEST.map(t => ({ t, d: LEVELS.reduce((q, l) => q + results[t][l].bands[b.name], 0) / LEVELS.length - mean }))
    .sort((x, y) => y.d - x.d).slice(0, 3).filter(x => x.d > 0.5);
  console.log(`        ${b.name.padEnd(9)} mean ${mean.toFixed(1)}%  ${lead.length ? lead.map(x => `${x.t} +${x.d.toFixed(1)}`).join(" · ") : "— nobody leads by more than half a point"}`);
}

// ---------- WHY THE SPREAD IS FLAT: the matchup table is almost entirely unpopulated ----------
// This is the finding the matrix exists to surface. `functionMatchup` is the rock-paper-scissors layer that
// would make a tradition's CHOSEN VERBS matter against what the opponent is doing. Erik's own live combat
// log shows "matchup 0" on every single round, and here is why.
const edges = sb.functionMatchup?.edges || {};
const VERBS = Object.values(rj("content/packs/core/rules/function_vocabulary.json").families || {})
  .flatMap(l => (Array.isArray(l) ? l : []).map(v => (typeof v === "string" ? v : v?.verb))).filter(Boolean);
let pairs = 0, nonzero = 0;
for (const a of VERBS) for (const d of VERBS) { pairs++; const v = edges[a]?.[d]; if (Number.isFinite(v) && v !== 0) nonzero++; }
const noEdges = VERBS.filter(v => !edges[v]);
console.log(`\n      MATCHUP COVERAGE: ${nonzero} of ${pairs} verb pairs (${pct(nonzero, pairs)}%) carry a non-zero edge; ${noEdges.length} of ${VERBS.length} verbs have NO edges at all.`);
console.log(`      Verbs with no matchup at all: ${noEdges.join(", ")}`);
console.log(`      ⇒ a tradition's chosen VERBS barely change a fight, which is why ${UNDER_TEST.length} independently-authored kits`);
console.log(`        land within ${(overall(ranked[0]) - overall(ranked[ranked.length - 1])).toFixed(1)} points of each other. The differentiation is authored in the FICTION but not yet in the MATH.`);

// ---------- THE GATES (structural truths no design intent excuses) ----------
console.log("");
check("every tradition has a USABLE KIT at every level — nobody picks a people and has nothing to do",
  [...UNDER_TEST, CONTROL].every(t => LEVELS.every(l => results[t][l].kitSize > 0)),
  [...UNDER_TEST].filter(t => LEVELS.some(l => results[t][l].kitSize === 0)).join(", ") + " have an empty kit at some level");

check("every tradition's kit resolves to at least one FUNCTION FAMILY — a kit that engages nothing is the SNG-250 §3 hollow-skill failure at scale",
  [...UNDER_TEST].every(t => LEVELS.every(l => results[t][l].families.length > 0)),
  [...UNDER_TEST].filter(t => LEVELS.some(l => results[t][l].families.length === 0)).join(", ") + " engage no family");

check("kits GROW with level — a level-20 character of any tradition holds at least as many abilities as at level 5",
  [...UNDER_TEST].every(t => results[t][20].kitSize >= results[t][5].kitSize));

check("no tradition is UNPLAYABLE — every one can beat the lowest threat band at least sometimes at level 20",
  [...UNDER_TEST].every(t => results[t][20].bands.riffraff > 0),
  [...UNDER_TEST].filter(t => results[t][20].bands.riffraff === 0).join(", ") + " cannot beat riffraff at L20 in any trial");

check("no tradition makes THREAT IRRELEVANT — none wins ~everything at the epic band across all levels",
  [...UNDER_TEST].every(t => LEVELS.some(l => results[t][l].bands.epic < 95)),
  [...UNDER_TEST].filter(t => LEVELS.every(l => results[t][l].bands.epic >= 95)).join(", ") + " trivialise the top of the curve");

// A RATCHET, not a wall. Populating the matchup table is Aevi's content lane and a real piece of work;
// failing the build on today's 7 edges would be imposing a backlog item as a regression. But it may only
// go UP: if someone deletes edges, the little differentiation that exists gets quieter still, and that
// should be loud.
check(`matchup coverage may only GROW — ${nonzero} non-zero verb-pair edges (baseline 7)`,
  nonzero >= 7, `coverage fell to ${nonzero}; traditions are now even less mechanically distinct than they were`);

check("threat still MEANS something across the whole matrix — riffraff beats epic on average, everywhere",
  [...UNDER_TEST, CONTROL].every(t => {
    const r = LEVELS.reduce((s, l) => s + results[t][l].bands.riffraff, 0);
    const e = LEVELS.reduce((s, l) => s + results[t][l].bands.epic, 0);
    return r >= e;
  }), "some tradition finds epics EASIER than riffraff — the threat curve is inverted for that kit");

console.log(failures === 0 ? "\nTradition matrix: all checks passed. (The percentages above are a REPORT — Erik/Aevi own the balance calls.)"
  : `\nTradition matrix: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
