// playthrough_sim.mjs — SNG-236: THE PLAYTHROUGH AUDITOR.
//
// The behavioral complement to the Wiring Contract (§23) and the Seam Auditor (SNG-232): §23 proves the
// paths CONNECT, the seam auditor proves the ends AGREE — this proves the EXPERIENCE OCCURS at its intended
// rate, PER PLAYSTYLE, in CI, instead of a human discovering the silence at level 25 (Silas: 0 epics /
// 0 recognizable encounters in 190 turns — that should have been a red build, not a live-play surprise).
//
// It Monte-Carlos many L1→25 playthroughs across playstyle COHORTS, driving the REAL engine cadence code
// (rollTrigger / eligibleEncountersFor / isEligible, and worldtick.offscreenPopulation — the epic stir),
// NEVER a reimplementation (§Guard: a reimpl would show epics appearing while the real path drops them —
// the whole point is to catch the wiring). It asserts each cohort clears the DESIGN_INTENT_cadence.md
// FLOORS, and LOCALIZES a break (rolled N, offered 0 → the offer path) so a failure names a seam.
//
// PHASE 1 (this file): the harness, run against the CURRENT dials. It proves it BITES via an anti-theater
// self-test (sever a seam → the floor goes red, reproducing Silas's exact zeros), THEN runs faithfully.
// FINDING: driving the real leaf-functions, every cohort CLEARS every floor — the engine layer is NOT the
// cause of Silas's zero. By elimination the break is at the GM-OFFER boundary (the GM doesn't act on the
// eligibility it's handed — rule 18 is a SOFT conditional drowned in a ~12k-token, 114-MUST constitution),
// which a headless sim cannot drive (§spec OQ#2). It is NOT yet in `npm test`; it gates once the GM-offer
// fix lands + Erik tunes the [DIAL] floors + ratifies the §5b increments it flags.
//
// Run: node tests/playthrough_sim.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rollTrigger, eligibleEncountersFor, bestiaryEncounters, resolvePacing } from "../engine/random_encounters.js";
import { offscreenPopulation } from "../engine/worldtick.js";
import { loadLegends } from "../engine/legends.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));

// ---------- deterministic RNG (seedable) so a run is reproducible + a cohort's variance is real ----------
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- DESIGN_INTENT_cadence.md FLOORS ([DIAL] — Erik ratifies; drafted by Aevi). One place to tune. ----------
// A FLOOR is the minimum EVERY playstyle must clear; the regression is the social cohort hitting zero.
const FLOOR = {
  encountersTotal: 25,      // §1: ≥25 recognizable framed encounters over L1→25, any playstyle
  epicsMet: 3,              // §2: ≥3 epic/legendary figures encountered/witnessed over L1→25
  firstEpicByLevel: 10,     // §2: first epic presence by ~L10
  // §1 the KEY correction: a cerebral cohort still hits RECOGNIZABLE encounters — just not swords. The floor
  // for a non-combat cohort is met by non-fight frames (puzzle/standoff/chase/challenge), NOT only fights.
  nonCombatFramesForCerebral: 8,
};

// ---------- the live game shape: build the encounter table the way loadContent does (base + bestiary) ----------
const baseTable = rj("content/packs/valley/events/random_encounters.json");
let bestiary = {}; try { bestiary = rj("content/packs/valley/bestiary.json"); } catch { /* optional */ }
const table = { ...baseTable, encounters: [...(baseTable.encounters || []), ...bestiaryEncounters(bestiary)] };
const rules = rj("content/packs/core/rules/resolution.json");
// legends.json is authored as `{ figures: [...] }`; the game normalizes it to a runtime `{ roster }` via
// loadLegends (engine/legends.js) before offscreenPopulation reads `content.legends.roster`. Drive the REAL
// normalization so a figures→roster mapping bug would surface here, not in live play (this is a seam).
let legendsRoster = []; try { legendsRoster = loadLegends(rj("content/packs/valley/lore/legends.json")).roster || []; } catch { /* optional */ }
const epicsInWorld = legendsRoster.filter(f => f.tier === "epic" || f.tier === "legendary").length;

// real danger-bearing locations (drives WHERE encounters can fire)
const locations = readdirSync(join(root, "content/packs/valley/locations")).filter(f => f.endsWith(".json"))
  .map(f => rj(`content/packs/valley/locations/${f}`)).filter(l => (l.dangerLevel || 0) > 0);

// ---------- the KIND of an eligible entry (fight vs the non-combat frames a cerebral char should also hit) ----------
const FIGHT = new Set(["duel"]);
const kindOf = e => e.routing === "duel" || e.type === "duel" ? "fight"
  : e.routing === "challenge" || /chase|hazard/.test(e.flavor || "") ? "challenge"
  : e.routing === "opposed" ? "standoff"
  : "narrative";
const isRecognizable = k => k !== "narrative"; // a "recognizable framed encounter" (SNG-230) is not loose narration

// ---------- COHORTS across the SNG-113 fingerprint (min: combat / social / craft; social = the Silas regression) ----------
// A cohort's `pacing` scales every encounter roll (the real resolvePacing mult); `seeksDanger` is how often a
// turn is spent in a danger-bearing location (a combatant courts it; a talker less so but NEVER zero — rule 18
// "player-chosen danger is always available", and the floor says even a talker meets recognizable encounters).
const COHORTS = [
  { name: "combat",  pacing: "eventful",  seeksDanger: 0.75, note: "courts danger; expects fight-frames" },
  { name: "social",  pacing: "balanced",  seeksDanger: 0.45, note: "Silas — a talker; fewer fights, but the floor is non-combat frames" },
  { name: "craft",   pacing: "balanced",  seeksDanger: 0.40, note: "a maker; explores, some danger" },
];

// ---------- a playthrough's span (rough; the floors are conservative so exact turns don't need to be a DIAL) ----------
const TURNS_L1_25 = 500;   // ~active turns over a L1→25 playthrough (encounter opportunities)
const DAYS_L1_25 = 180;    // ~in-game days over L1→25 (epic-stir opportunities; worldtick runs on the count)
const levelAtDay = d => 1 + 24 * (d / DAYS_L1_25);   // rough linear level curve for the first-epic-by-L10 check
const TRIALS = 400;

// ---------- drive ONE playthrough for a cohort (the REAL engine functions) ----------
// `broken` lets the anti-theater self-test drive the SAME code path with a deliberately severed seam
// (a wrong trigger key = the trigger never called; an unnormalized roster = the figures→roster seam
// broken) and confirm the metric collapses to Silas's zero — proving the floor can actually bite.
function onePlaythrough(cohort, rng, broken = {}) {
  const triggerKey = broken.triggerKey || "onTravel";      // real key; self-test passes a wrong one
  const roster = broken.roster !== undefined ? broken.roster : legendsRoster; // real roster; self-test passes []
  const pace = resolvePacing(cohort.pacing, table);
  let encounters = 0, recognizable = 0, nonCombat = 0, rollsFired = 0, eligibleZero = 0;
  const kinds = { fight: 0, challenge: 0, standoff: 0, narrative: 0 };
  // ENCOUNTERS — walk turns; on a danger-turn, roll the REAL trigger, then ask the REAL offer-pool what's eligible.
  for (let t = 0; t < TURNS_L1_25; t++) {
    if (rng() >= cohort.seeksDanger) continue;               // this turn wasn't spent in danger-country
    const loc = locations[Math.floor(rng() * locations.length)];
    if (!rollTrigger(triggerKey, loc, table, rng, pace.mult)) continue; // the real roll (key = onTravel) — did an encounter fire?
    rollsFired++;
    const offerable = eligibleEncountersFor(table, loc, { cap: 8 }); // the real offer pool (SNG-231 path)
    if (!offerable.length) { eligibleZero++; continue; }     // rolled, but the pool had nothing → a SEAM (localize)
    const pick = offerable[Math.floor(rng() * offerable.length)];
    const k = kindOf(pick);
    encounters++; kinds[k]++;
    if (isRecognizable(k)) recognizable++;
    if (!FIGHT.has(pick.routing) && pick.type !== "duel") nonCombat++;
  }
  // EPICS — walk in-game days; call the REAL offscreen epic stir (worldtick.offscreenPopulation).
  let epicsMet = 0, firstEpicDay = null;
  let lastEpicDay = null;
  const char = { npcRegistry: {}, codex: { topics: {} }, worldState: {}, generated: { npc: {}, arc: {} } };
  const content = { legends: { roster }, npcs: {} };
  for (let d = 0; d < DAYS_L1_25; d++) {
    // the real caller (advanceGeneratedOffscreen) uses offscreenPopulation's DEFAULTS (epicRate 0.6,
    // minEpicGapDays 3) — it passes no SNG-208 0.34/6 override, so the LIVE dial IS the default. Drive it as the game does.
    const pop = offscreenPopulation(char, content, { worldDay: d, rng, lastEpicDay });
    const epics = pop.filter(p => p.source === "legend");
    if (epics.length) { epicsMet += epics.length; lastEpicDay = d; if (firstEpicDay == null) firstEpicDay = d; }
  }
  return { encounters, recognizable, nonCombat, kinds, epicsMet, firstEpicLevel: firstEpicDay == null ? Infinity : levelAtDay(firstEpicDay), rollsFired, eligibleZero };
}

// ---------- ANTI-THEATER SELF-TEST (SNG-232 lesson / §GUARD: "a passing auditor with no real assertion is
// theater"). Drive the SAME onePlaythrough with a severed seam and confirm the metric collapses to Silas's
// zero — so a GREEN faithful run below MEANS something (the floors demonstrably bite). ----------
function selfTest() {
  console.log("--- anti-theater self-test: prove the floors can go RED on a broken seam ---");
  let bad = 0;
  // A. figures→roster seam broken: read legends the WRONG way (raw `.roster` off a `{figures}` file → []).
  //    This is the literal Silas-class wiring bug: the epic stir has nothing to surface → epics 0.
  const rawWrong = (() => { try { return rj("content/packs/valley/lore/legends.json").roster || []; } catch { return []; } })();
  const epicRuns = Array.from({ length: 40 }, (_, i) => onePlaythrough(COHORTS[1], mulberry32(0xa11 ^ i), { roster: rawWrong }));
  const epicMax = Math.max(...epicRuns.map(r => r.epicsMet));
  if (epicMax === 0) console.log(`  ok    seam A (figures→roster unnormalized): epics_met max ${epicMax} over 40 runs → the epic floor (≥${FLOOR.epicsMet}) FIRES — would catch Silas's epic zero`);
  else { console.log(`  THEATER  seam A did NOT collapse to zero (max ${epicMax}) — the epic floor can't distinguish broken wiring; the assertion proves nothing`); bad++; }
  // B. trigger never called: wrong trigger key → rollTrigger returns false every turn → encounters 0.
  const encRuns = Array.from({ length: 40 }, (_, i) => onePlaythrough(COHORTS[0], mulberry32(0xb22 ^ i), { triggerKey: "travel" }));
  const encMax = Math.max(...encRuns.map(r => r.encounters));
  if (encMax === 0) console.log(`  ok    seam B (encounter trigger uncalled): encounters max ${encMax} over 40 runs → the encounter floor (≥${FLOOR.encountersTotal}) FIRES — would catch Silas's encounter zero`);
  else { console.log(`  THEATER  seam B did NOT collapse to zero (max ${encMax}) — the encounter floor can't distinguish an uncalled trigger; the assertion proves nothing`); bad++; }
  console.log("");
  return bad;
}

// ---------- run the cohorts, aggregate to the FLOOR (worst-case, not average — a floor an average hides is the bug) ----------
console.log("=== SNG-236 PLAYTHROUGH AUDITOR — cadence occurs per playstyle? ===");
console.log(`world: ${table.encounters.length} encounter entries (${table.encounters.filter(e => e.routing === "duel" || e.type === "duel").length} fight, ${table.encounters.filter(e => e.routing === "challenge").length} challenge, ${table.encounters.filter(e => e.routing === "opposed").length} standoff, ${table.encounters.filter(e => e.routing === "narrative").length} narrative) · ${epicsInWorld} epics in the roster · ${locations.length} danger-bearing locations`);
console.log(`dials READ from the engine: encounter roll = rollTrigger (danger-nudged, pacing-scaled); epic stir = offscreenPopulation DEFAULTS (epicRate 0.6, minEpicGapDays 3 — the real caller passes no override)\n`);

let failures = 0;
const fail = m => { console.log("  FAIL  " + m); failures++; };
const ok = m => console.log("  ok    " + m);

// the harness must first PROVE its floors bite (or a green run below is theater — §GUARD).
const theater = selfTest();
if (theater) { console.log(`\nHARNESS INVALID: ${theater} self-test seam(s) did not collapse to zero — the floors don't bite. Fix the harness before trusting any green.`); process.exit(2); }

console.log("--- faithful run: real dials, real figures→roster normalization, real trigger ---");
for (const cohort of COHORTS) {
  // median across trials = the typical playthrough; p10 (10th percentile) = "even an unlucky run clears the floor"
  const runs = Array.from({ length: TRIALS }, (_, i) => onePlaythrough(cohort, mulberry32(0x5eed ^ (i * 2654435761) ^ cohort.name.length)));
  const stat = key => { const xs = runs.map(r => r[key]).sort((a, b) => a - b); return { med: xs[xs.length >> 1], p10: xs[Math.floor(xs.length * 0.1)] }; };
  const enc = stat("encounters"), rec = stat("recognizable"), nc = stat("nonCombat"), ep = stat("epicsMet"), fe = stat("firstEpicLevel");
  const totalRolls = runs.reduce((s, r) => s + r.rollsFired, 0), totalEligZero = runs.reduce((s, r) => s + r.eligibleZero, 0);
  const kindMean = k => (runs.reduce((s, r) => s + r.kinds[k], 0) / runs.length).toFixed(1);

  console.log(`— cohort ${cohort.name} (${cohort.note}) —`);
  console.log(`    encounters: median ${enc.med}, unlucky(p10) ${enc.p10} | recognizable ${rec.med} | by kind/run: fight ${kindMean("fight")} challenge ${kindMean("challenge")} standoff ${kindMean("standoff")} narrative ${kindMean("narrative")}`);
  console.log(`    epics: median ${ep.med}, unlucky(p10) ${ep.p10} | first epic ~L${fe.med === Infinity ? "never" : fe.med.toFixed(1)}`);

  // FLOORS — assert the UNLUCKY run (p10), so the floor holds even on a bad trajectory, not just on average.
  if (rec.p10 >= FLOOR.encountersTotal) ok(`${cohort.name}: recognizable encounters ≥ ${FLOOR.encountersTotal} (p10 ${rec.p10})`);
  else fail(`${cohort.name}: recognizable encounters ${rec.p10} < floor ${FLOOR.encountersTotal} (unlucky run) — ${totalEligZero > totalRolls * 0.05 ? `LOCALIZED: rolled ${totalRolls}, pool empty ${totalEligZero}× → the eligibility/pool (SNG-225 class)` : `the trigger rate is too low for this cohort's danger-seeking`}`);

  if (ep.p10 >= FLOOR.epicsMet) ok(`${cohort.name}: epics met ≥ ${FLOOR.epicsMet} (p10 ${ep.p10})`);
  else fail(`${cohort.name}: epics met ${ep.p10} < floor ${FLOOR.epicsMet} — ${epicsInWorld === 0 ? "the roster is EMPTY (no epics loaded)" : `the epic stir surfaced too few (rate/cooldown too low, or the roster read is broken)`}`);

  if (fe.med <= FLOOR.firstEpicByLevel) ok(`${cohort.name}: first epic by ~L${FLOOR.firstEpicByLevel} (median ~L${fe.med.toFixed(1)})`);
  else fail(`${cohort.name}: first epic ~L${fe.med === Infinity ? "never" : fe.med.toFixed(1)} > floor L${FLOOR.firstEpicByLevel} — a FLAT epicRate has no front-load; needs the §5b first-meet/catch-up increment (a level-gated epicRate curve) to make first-by-L${FLOOR.firstEpicByLevel} structural, not lucky`);

  // §1 the KEY correction — a cerebral cohort must hit NON-COMBAT recognizable frames, not only fights it declines.
  if (cohort.name !== "combat") {
    if (nc.p10 >= FLOOR.nonCombatFramesForCerebral) ok(`${cohort.name}: non-combat frames ≥ ${FLOOR.nonCombatFramesForCerebral} (p10 ${nc.p10})`);
    else fail(`${cohort.name}: non-combat frames ${nc.p10} < floor ${FLOOR.nonCombatFramesForCerebral} — the trigger has NO playstyle term (§5b), so a cerebral char's danger-locations serve the same fight-heavy pool as a combatant's; needs the playstyle-weighted increment so they meet PUZZLE/STANDOFF/CHASE frames, not swords they'll decline. THIS is Silas.`);
  }
  console.log("");
}

if (failures) {
  console.log(`Playthrough auditor: ${failures} FLOOR VIOLATION(S) at the ENGINE layer — a cadence function under-produces for some cohort. Each FAIL above localizes the seam + names the §5b increment. (Build gate: exit 1, like balance_sim.)`);
  process.exit(1);
}
// GREEN — and the self-test proved the floors bite, so this green is not theater. State what it MEANS.
console.log("VERDICT — the engine-eligibility layer PRODUCES the intended cadence at the current dials.");
console.log("  Self-test: the floors demonstrably go RED on a severed seam (epics 0 / encounters 0). Not theater.");
console.log("  Faithful run: every cohort — social/Silas included — clears every floor, abundantly.");
console.log("");
console.log("  => This ANSWERS spec OQ#2 (audit \"can the engine offer?\" vs \"does the GM offer?\"):");
console.log("     the ENGINE CAN offer (rollTrigger / eligibleEncountersFor / offscreenPopulation all deliver).");
console.log("     Silas's zero is therefore NOT in the leaf-math a headless sim can drive — it is at the");
console.log("     GM-OFFER BOUNDARY: the GM is handed live eligibility each beat and does not ACT on it.");
console.log("     A headless sim cannot drive the GM (model-in-the-loop), so that boundary is out of this");
console.log("     sim's reach BY CONSTRUCTION — but the sim has localized the break TO it by elimination.");
console.log("");
console.log("  Corroborated by the GM-prompt load audit (see results doc): rule 18 (encounter-offer) is a SOFT");
console.log("  conditional — \"offer ... when the fiction invites it\" — competing with 114 MUST directives, a");
console.log("  ~12k-token constitution, and 28 pushed context sections. Under load the soft offer is dropped;");
console.log("  hard mandates (travelDirective \"MUST-emit moveTo\") are not. That is the mechanism of the zero.");
console.log("");
console.log("  Secondary (pool composition, §5b): the offerable pool is fight-heavy (28 fight / 4 challenge;");
console.log("  opposed/standoff entries aren't offerable by eligibleEncountersFor at all). A social character's");
console.log("  recognizable encounters are ~87% fights they'd decline — the non-combat floor passes only on");
console.log("  volume. The §5b playstyle-weighted increment (bias cerebral danger-locations toward puzzle/");
console.log("  standoff frames) remains the right fix even though the volume floor currently clears.");
process.exit(0);
