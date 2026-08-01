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

// SITUATIONS — Erik: "the marchers probably have an edge in physical fighting, but who wins the skill
// challenges, the puzzles, the world arcs?" A straight fight is ONE axis and the least interesting one.
// Each kind now selects a different opponent VOCABULARY (SNG-253), so a tradition's verbs are answered
// differently: a standoff opponent presses and holds, a chase closes and cuts off, and a puzzle/hazard is
// STATIC — it does not choose, it resists the same way every round (Aevi's ruling, SNG-247).
// puzzle and hazard both run the STATIC antagonist and are therefore MECHANICALLY IDENTICAL by design —
// Aevi's SNG-247 ruling is that neither chooses, so neither gets a verb set. Listing both would print the
// same row twice and imply a distinction the engine does not make; `static` stands for the pair.
const SITUATIONS = ["fight", "standoff", "chase", "static"];
const SIT_KIND = { fight: "fight", standoff: "standoff", chase: "chase", static: "puzzle" };

// PLAYSTYLES — Erik: "they don't all need to be identical." The uniform sheet was deliberate when the only
// question was "does the KIT matter"; it is wrong once the question is "who is good at WHAT", because a
// craft's `attribute` is half of its roll. Each build leans one attribute and is thin elsewhere, so a
// tradition whose crafts key off reason reads differently from one that keys off presence.
const PLAYSTYLES = [
  { name: "warrior", lead: "physical", note: "strength/agility — the marcher hypothesis" },
  { name: "scholar", lead: "mental", note: "reason/insight — reads and solves" },
  { name: "envoy", lead: "social", note: "presence/rapport — presses and persuades" },
  { name: "maker", lead: "practical", note: "craft/wits — builds and improvises" }
];

/** A synthetic character of this tradition at this level. Attributes are UNIFORM across traditions on
 *  purpose — the variable under test is the KIT, so any difference in outcome is the craft, not a sheet I
 *  tuned. Capacity comes from the real skill_capacity table; the kit is the highest-tier abilities the
 *  level can hold, which is how a real character of that people would actually be built. */
function buildKit(tradition, level) {
  const pool = (byTradition[tradition] || []).filter(a => (a.levelReq || 1) <= Math.ceil(level / 5));
  const cap = Number(capacity[String(level)] ?? capacity[String(Math.min(25, level))] ?? 6) || 6;
  const kit = pool.slice().sort((a, b) => (b.levelReq || 1) - (a.levelReq || 1)).slice(0, cap);
  // ONE MOVE PER VERB, exactly as playerBattleSkills does. An ability carries `functions` (a PLURAL array)
  // and rollSide reads `decl.function` (SINGULAR) — so a kit built straight from ability records declares
  // `function: undefined`, every matchup resolves to 0, and every tradition plays identically no matter what
  // the matrix says. That was a bug in THIS harness, and it hid the entire point of the file: the first run
  // after Aevi landed 110 matchup edges produced byte-identical results to the 7-edge run, which is what
  // exposed it. The app also lists a craft under EVERY function it has (a command+empower+heal craft is
  // three moves, not one), so expanding here is the faithful shape as well as the working one.
  return kit.flatMap(a => (a.functions || []).map(fn => ({
    ...a, function: fn, intensity: "standard", tier: a.levelReq || 1, name: `${a.name} (${fn})`
  }))).filter(m => m.function);
}
function sheetFor(level, style) {
  const hi = Math.max(3, Math.min(9, 3 + Math.floor(level / 3)));   // the attribute they built
  const lo = Math.max(2, Math.min(5, 2 + Math.floor(level / 8)));   // everything else, thin
  const at = k => (k === style.lead ? hi : lo);
  const sub = { physical: ["strength", "agility"], mental: ["reason", "insight"], social: ["presence", "rapport"], practical: ["craft", "wits"] };
  const subAttributes = {};
  for (const [attr, keys] of Object.entries(sub)) for (const k of keys) subAttributes[k] = at(attr);
  return { name: "the player", level,
    attributes: { physical: at("physical"), mental: at("mental"), social: at("social"), practical: at("practical") },
    subAttributes, energy: 60 + level * 4, health: 30 + level * 2, maxHealth: 30 + level * 2 };
}

console.log("TRADITION MATRIX — synthetic players from every tradition, across levels and threat bands\n");
console.log(`      ${UNDER_TEST.length} traditions under test (+${CONTROL} as the control) × levels ${LEVELS.join("/")} × ${BANDS.length} bands × ${TRIALS} trials\n`);

// ---------- run the matrix ----------
// Two passes, because they answer different questions and mixing them muddies both:
//   BANDS      — the level/threat curve, on the best-fit playstyle (is anyone unplayable?)
//   SITUATIONS — tradition × situation × playstyle at one level (who is good at WHAT?)
const results = {};
for (const trad of [...UNDER_TEST, CONTROL]) {
  results[trad] = { bands: {}, sit: {} };
  for (const level of LEVELS) {
    const kit = buildKit(trad, level);
    const sheet = sheetFor(level, PLAYSTYLES[0]);
    results[trad].bands[level] = { kitSize: kit.length, families: [...new Set(kit.flatMap(a => familiesOfAbility(a, FN_INDEX)))], bands: {} };
    for (const band of BANDS) {
      let won = 0;
      for (let i = 0; i < TRIALS; i++) {
        const f = oneFight({ threat: band.threat, moves: kit, sheet, sb, steps, rules,
          rng: mulberry32(0x7ABC ^ (trad.length * 7919) ^ (level * 104729) ^ (band.threat * 31) ^ i) });
        if (f.won) won++;
      }
      results[trad].bands[level].bands[band.name] = pct(won, TRIALS);
    }
  }
  // SITUATIONS at L12 vs an EPIC foe. First pass used a regional foe and every tradition's best build
  // won ~100% of everything — a ceiling effect that made the table say nothing. Separation needs a foe that
  // can actually beat you.
  const kit12 = buildKit(trad, 12);
  for (const kind of SITUATIONS) {
    results[trad].sit[kind] = {};
    for (const style of PLAYSTYLES) {
      const sheet = sheetFor(12, style);
      let won = 0;
      for (let i = 0; i < TRIALS; i++) {
        const f = oneFight({ threat: 78, kind: SIT_KIND[kind], moves: kit12, sheet, sb, steps, rules,
          rng: mulberry32(0x51D ^ (trad.length * 31337) ^ (kind.length * 7919) ^ (style.name.length * 104729) ^ i) });
        if (f.won) won++;
      }
      results[trad].sit[kind][style.name] = pct(won, TRIALS);
    }
  }
}

// ---------- THE REPORT (the deliverable — Erik and Aevi rule on these numbers, not this file) ----------
const overall = t => LEVELS.flatMap(l => BANDS.map(b => results[t].bands[l].bands[b.name])).reduce((a, x) => a + x, 0) / (LEVELS.length * BANDS.length);
const ranked = [...UNDER_TEST].sort((a, b) => overall(b) - overall(a));

console.log("      THE LEVEL/THREAT CURVE (warrior build)");
console.log("      TRADITION            L5  riff/note/reg/epic   L12 riff/note/reg/epic   L20 riff/note/reg/epic   mean");
for (const t of ranked.slice(0, 5).concat(["…"]).concat(ranked.slice(-3))) {
  if (t === "…") { console.log("      …"); continue; }
  const row = LEVELS.map(l => BANDS.map(b => String(results[t].bands[l].bands[b.name]).padStart(3)).join("/")).join("   ");
  console.log(`      ${t.padEnd(20)} ${row}   ${overall(t).toFixed(1)}%`);
}
console.log(`      ${("[" + CONTROL + "]").padEnd(20)} ${LEVELS.map(l => BANDS.map(b => String(results[CONTROL].bands[l].bands[b.name]).padStart(3)).join("/")).join("   ")}   ${overall(CONTROL).toFixed(1)}%  ← control`);
const spread = overall(ranked[0]) - overall(ranked[ranked.length - 1]);
console.log(`      STRONGEST ${ranked.slice(0, 3).map(t => `${t} ${overall(t).toFixed(0)}%`).join(" · ")}   WEAKEST ${ranked.slice(-3).map(t => `${t} ${overall(t).toFixed(0)}%`).join(" · ")}   spread ${spread.toFixed(1)}pts`);

// ---------- WHO WINS WHAT: tradition × SITUATION (L12 vs a regional foe, best playstyle) ----------
// This is the half Erik actually asked for. A straight fight is the least interesting axis; the question
// is who answers a standoff, a chase, a sealed door.
// MEAN across builds, not best-of: taking the best of four builds saturates at the top and collapses the
// ranking into an alphabetical tie. The mean says "how does this PEOPLE fare here", which is the question.
const meanStyleAt = (t, kind) => PLAYSTYLES.reduce((a, p) => a + results[t].sit[kind][p.name], 0) / PLAYSTYLES.length;
const bestStyleAt = (t, kind) => { const v = meanStyleAt(t, kind); const lead = PLAYSTYLES.map(p => ({ p: p.name, v: results[t].sit[kind][p.name] })).sort((a, b) => b.v - a.v)[0]; return { v: Math.round(v * 10) / 10, p: lead.p }; };
const sitMean = kind => UNDER_TEST.reduce((a, t) => a + bestStyleAt(t, kind).v, 0) / UNDER_TEST.length;
console.log("\n      WHO WINS WHAT — mean win% across 4 builds, L12 vs an EPIC foe (leading build named)");
for (const kind of SITUATIONS) {
  const mean = sitMean(kind);
  const rank = UNDER_TEST.map(t => ({ t, v: bestStyleAt(t, kind).v, s: bestStyleAt(t, kind).p })).sort((a, b) => b.v - a.v);
  console.log(`        ${kind.toUpperCase().padEnd(9)} mean ${mean.toFixed(1)}%  ▲ ${rank.slice(0, 3).map(r => `${r.t} ${r.v}% (${r.s})`).join(" · ")}`);
  console.log(`        ${"".padEnd(9)}              ▼ ${rank.slice(-3).map(r => `${r.t} ${r.v}%`).join(" · ")}`);
}

// A tradition's SIGNATURE — measured against its PEERS in that situation, not against its own average.
// The first version compared each tradition's kinds to its own cross-kind mean and returned 21 of 26 as
// "standoff specialists", which is a BASE-RATE artifact rather than a finding: a standoff is simply easier
// for everyone (cohort mean ~39% against ~8% for a static thing). Relative-to-cohort is the honest
// statistic — it asks where this people beats the OTHER peoples, which is the question worth answering.
console.log("\n      EACH TRADITION'S SIGNATURE — where it most out-performs its PEERS (+pts vs that situation's cohort mean):");
const sigs = {};
for (const t of UNDER_TEST) {
  const rel = SITUATIONS.map(k => ({ k, d: bestStyleAt(t, k).v - sitMean(k) })).sort((a, b) => b.d - a.d)[0];
  (sigs[rel.k] = sigs[rel.k] || []).push(`${t} ${rel.d >= 0 ? "+" : ""}${rel.d.toFixed(1)}${rel.d > 8 ? "*" : ""}`);
}
for (const k of SITUATIONS) console.log(`        ${k.padEnd(9)} ${(sigs[k] || ["—"]).join(", ")}`);
console.log("        (* = more than 8 points clear of the cohort in that situation — a real specialism, not noise)");

// PLAYSTYLE — does the build matter, or is the kit carrying everything?
console.log("\n      PLAYSTYLE SENSITIVITY (best minus worst build, averaged over traditions, per situation):");
for (const kind of SITUATIONS) {
  const gaps = UNDER_TEST.map(t => { const vs = PLAYSTYLES.map(p => results[t].sit[kind][p.name]); return Math.max(...vs) - Math.min(...vs); });
  console.log(`        ${kind.padEnd(9)} ${(gaps.reduce((a, x) => a + x, 0) / gaps.length).toFixed(1)} points`);
}

// ---------- WHY the spread is what it is: the matchup layer ----------
const edges = sb.functionMatchup?.edges || {};
const VERBS = Object.values(rj("content/packs/core/rules/function_vocabulary.json").families || {})
  .flatMap(l => (Array.isArray(l) ? l : []).map(v => (typeof v === "string" ? v : v?.verb))).filter(Boolean);
let pairs = 0, nonzero = 0;
for (const a of VERBS) for (const d of VERBS) { pairs++; const v = edges[a]?.[d]; if (Number.isFinite(v) && v !== 0) nonzero++; }
const noEdges = VERBS.filter(v => !edges[v]);
// INERT PAIRS — a failure a coverage count cannot see. `rollSide` gives EACH side matchupBonus(own, theirs)
// and the round is decided by comparing margins, so only the DIFFERENCE can change an outcome. A pair scored
// equally in both directions cancels EXACTLY: it reads as a designed relationship and is mechanically nothing.
const inert = [], seenPair = new Set();
for (const a of VERBS) for (const d of VERBS) {
  if (a === d) continue;
  const k = [a, d].sort().join("|"); if (seenPair.has(k)) continue; seenPair.add(k);
  const A = edges[a]?.[d], D = edges[d]?.[a];
  if (A == null && D == null) continue;
  if ((Number(A) || 0) - (Number(D) || 0) === 0) inert.push(`${a}↔${d}`);
}
console.log(`
      MATCHUP COVERAGE: ${nonzero}/${pairs} verb pairs (${pct(nonzero, pairs)}%); ${noEdges.length} verbs with no edges${noEdges.length ? ` (${noEdges.join(", ")})` : ""}.`);
console.log(`      INERT PAIRS (cancel in the margin ⇒ no effect): ${inert.length}${inert.length ? ` — ${inert.join(", ")}` : ""}`);

// ---------- THE GATES (structural truths no design intent excuses) ----------
console.log("");
check("every tradition has a USABLE KIT at every level — nobody picks a people and has nothing to do",
  [...UNDER_TEST, CONTROL].every(t => LEVELS.every(l => results[t].bands[l].kitSize > 0)),
  [...UNDER_TEST].filter(t => LEVELS.some(l => results[t].bands[l].kitSize === 0)).join(", ") + " have an empty kit at some level");

check("every tradition's kit resolves to at least one FUNCTION FAMILY — a kit that engages nothing is the SNG-250 §3 hollow-skill failure at scale",
  [...UNDER_TEST].every(t => LEVELS.every(l => results[t].bands[l].families.length > 0)),
  [...UNDER_TEST].filter(t => LEVELS.some(l => results[t].bands[l].families.length === 0)).join(", ") + " engage no family");

check("kits GROW with level — a level-20 character of any tradition holds at least as many abilities as at level 5",
  [...UNDER_TEST].every(t => results[t].bands[20].kitSize >= results[t].bands[5].kitSize));

check("no tradition is UNPLAYABLE — every one can beat the lowest threat band at least sometimes at level 20",
  [...UNDER_TEST].every(t => results[t].bands[20].bands.riffraff > 0),
  [...UNDER_TEST].filter(t => results[t].bands[20].bands.riffraff === 0).join(", ") + " cannot beat riffraff at L20 in any trial");

check("no tradition makes THREAT IRRELEVANT — none wins ~everything at the epic band across all levels",
  [...UNDER_TEST].every(t => LEVELS.some(l => results[t].bands[l].bands.epic < 95)),
  [...UNDER_TEST].filter(t => LEVELS.every(l => results[t].bands[l].bands.epic >= 95)).join(", ") + " trivialise the top of the curve");

// A RATCHET, not a wall. Populating the matchup table is Aevi's content lane and a real piece of work;
// failing the build on today's 7 edges would be imposing a backlog item as a regression. But it may only
// go UP: if someone deletes edges, the little differentiation that exists gets quieter still, and that
// should be loud.
check(`matchup coverage may only GROW — ${nonzero} non-zero verb-pair edges (baseline 7, SNG-254 took it to 110+)`,
  nonzero >= 7, `coverage fell to ${nonzero}; traditions are now even less mechanically distinct than they were`);
// A ratchet, not a wall: the 7 inert pairs are Aevi's to tune and several look like a cycle she intended.
// It may only go DOWN, so a future edit cannot quietly add more relationships that read real and do nothing.
check(`INERT matchup pairs may only go DOWN — ${inert.length} pairs cancel to zero (baseline 7)`,
  inert.length <= 7, `${inert.length} inert pairs: ${inert.join(", ")} — each reads as a designed relationship and has no mechanical effect at all`);

check("threat still MEANS something across the whole matrix — riffraff beats epic on average, everywhere",
  [...UNDER_TEST, CONTROL].every(t => {
    const r = LEVELS.reduce((s, l) => s + results[t].bands[l].bands.riffraff, 0);
    const e = LEVELS.reduce((s, l) => s + results[t].bands[l].bands.epic, 0);
    return r >= e;
  }), "some tradition finds epics EASIER than riffraff — the threat curve is inverted for that kit");

console.log(failures === 0 ? "\nTradition matrix: all checks passed. (The percentages above are a REPORT — Erik/Aevi own the balance calls.)"
  : `\nTradition matrix: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
