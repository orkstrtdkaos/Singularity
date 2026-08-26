// scripts/scale_fidelity.mjs — CCODE-251. DOES THE SHORTCUT PRODUCE THE FIGHT IT REPLACES?
//
// ⛔ ERIK ASKED FOR THIS SPECIFICALLY: "we should think this through and test it." This is the test.
//
// The claim under examination: when a party crosses 3 and the extra members drop into an aggregate melee
// flow, THE FIGHT SHOULD NOT CHANGE. ⚠️ If the aggregate kills allies at a different rate than resolving all
// of them individually would have, the threshold is not a performance optimisation — it is a cliff, and the
// party that recruits a fourth member is playing a different game than the party of three.
//
// ⛔ THE FIRST VERSION OF THIS HARNESS WAS WORTHLESS AND I ALMOST SHIPPED IT. Its "ground truth" was a
// formula I wrote in the same file as the compression, out of the same pieces — so it agreed to 0.1% and
// proved nothing except that I can add. That is the defect this project has caught in me repeatedly: a check
// that agrees with itself. THE GROUND TRUTH HERE IS `battleRound`. Real declarations, real rolls, real soak,
// real degree ladder — the engine that runs in play, called once per combatant, exactly as Erik's "everyone
// doing full turns mechanically behind the scenes" would.
//
// ⚠️ AND THE COMPRESSION IS NOT ALLOWED TO PEEK. It is calibrated from ONE combatant measured against the
// engine, then asked to PREDICT K. If the √K reasoning is wrong, the prediction misses and this prints so.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";
import { resolutionTier, predictAggregate } from "../engine/melee.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");
const sb = J("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rules.resolution || {};

const TRIALS = 4000;
function seeded(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

const ATTACKER = { attributes: { physical: 6 }, level: 5, health: 30, maxHealth: 30, soak: 0 };
const DEFENDER = { attributes: { physical: 4 }, level: 3, health: 30, maxHealth: 30, soak: 0 };

/** ⛔ GROUND TRUTH — the engine that actually runs in play, once per combatant. */
function oneRealRound(rng) {
  const r = battleRound({
    playerDecl: { function: "strike", tier: 2, attribute: "physical", intensity: "standard", name: "swing" },
    oppDecl: { function: "defend", tier: 1, attribute: "physical", intensity: "standard", name: "guard" },
    playerSheet: ATTACKER, oppSheet: DEFENDER,
    state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 100, effects: [], pressure: { player: 0, opponent: 0 } },
    rules, sb, steps, rng });
  return (r.damage && r.damage.side === "opponent") ? r.damage.amount : 0;
}

function stats(xs) {
  const n = xs.length, mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  const s = xs.slice().sort((a, b) => a - b);
  return { mean, sd, p05: s[Math.floor(n * 0.05)], p95: s[Math.floor(n * 0.95)] };
}

console.log("=".repeat(100));
console.log("CCODE-251 — SCALE FIDELITY: does the melee compression produce the fight it replaces?");
console.log("  GROUND TRUTH = engine/skill_battle.js battleRound, called once per combatant.");
console.log("=".repeat(100));
console.log("");

// ── step 1: measure ONE combatant against the real engine. This is the only thing the compression is told.
const r0 = seeded(4242);
const single = stats(Array.from({ length: TRIALS * 4 }, () => oneRealRound(r0)));
const zeroRate = (() => { const r = seeded(777); let z = 0; for (let i = 0; i < TRIALS; i++) if (oneRealRound(r) === 0) z++; return z / TRIALS; })();
console.log(`  CALIBRATION (one combatant, ${TRIALS * 4} real rounds):`);
console.log(`    mean ${single.mean.toFixed(2)}   sd ${single.sd.toFixed(2)}   rounds dealing nothing: ${(zeroRate * 100).toFixed(0)}%`);
console.log("");
console.log("  ⚠️ THAT 37%-ISH ZERO RATE IS NOT NOISE — it is a third of all rounds where a combatant simply");
console.log("     does not connect, and any aggregate that quietly smooths it away has removed the swinginess");
console.log("     the small-party game is built on.");
console.log("");
console.log("  K  │ tier      │      GROUND TRUTH (K real rounds)   │      COMPRESSION (predicted)   │  divergence");
console.log("     │           │    mean      sd     p05     p95     │    mean      sd                │  mean    sd");
console.log("  ───┼───────────┼─────────────────────────────────────┼────────────────────────────────┼──────────────");

let worstMean = 0, worstSd = 0; const rows = [];
for (const k of [1, 2, 3, 4, 6, 8, 12, 20, 50]) {
  const rg = seeded(31337);
  const truth = stats(Array.from({ length: TRIALS }, () => {
    let s = 0; for (let i = 0; i < k; i++) s += oneRealRound(rg); return s; }));
  // ── the compression sees ONLY the single-combatant calibration and the count.
  const pred = predictAggregate(single, k);
  const dMean = Math.abs(pred.mean - truth.mean) / Math.max(1e-9, truth.mean) * 100;
  const dSd = Math.abs(pred.sd - truth.sd) / Math.max(1e-9, truth.sd) * 100;
  worstMean = Math.max(worstMean, dMean); worstSd = Math.max(worstSd, dSd);
  const t = resolutionTier(k, 1); rows.push({ k, tier: t.id, dMean, dSd });
  const f = (x, w = 7) => x.toFixed(1).padStart(w);
  console.log(`  ${String(k).padStart(2)} │ ${t.id.padEnd(9)} │ ${f(truth.mean)} ${f(truth.sd)} ${f(truth.p05)} ${f(truth.p95)}     │ ${f(pred.mean)} ${f(pred.sd)}                │ ${f(dMean, 5)}% ${f(dSd, 5)}%`);
}

console.log("");
console.log(`  WORST DIVERGENCE vs THE REAL ENGINE:  mean ${worstMean.toFixed(1)}%   sd ${worstSd.toFixed(1)}%`);
console.log("");
const at3 = rows.find(r => r.k === 3), at4 = rows.find(r => r.k === 4);
console.log("  ── THE CLIFF AT ERIK'S THRESHOLD (\"more than 3 party members\") ──");
console.log(`    3 allies (${at3.tier}, full turns):  ${at3.dMean.toFixed(1)}% mean / ${at3.dSd.toFixed(1)}% sd`);
console.log(`    4 allies (${at4.tier}, compressed):  ${at4.dMean.toFixed(1)}% mean / ${at4.dSd.toFixed(1)}% sd`);
console.log("");
if (worstSd > 15) {
  console.log("  ⛔ VERDICT: THE COMPRESSION IS NOT THE FIGHT IT REPLACES. Spread diverges >15% — crossing the");
  console.log("     threshold changes how often a party gets wiped, not how long the round takes. A cliff.");
  process.exitCode = 1;
} else if (worstSd > 8) {
  console.log("  ⚠️ VERDICT: USABLE, NOT FREE. Centre holds, tails drift. Fine for nameless combatants;");
  console.log("     NOT fine for anyone the player would grieve.");
} else {
  console.log("  ✅ VERDICT: the compression reproduces the REAL ENGINE in centre and spread. Crossing Erik's");
  console.log("     threshold costs narration detail and nothing else — the only honest basis for a shortcut.");
}
console.log("");
console.log("  ⚠️ WHAT THIS DOES NOT SETTLE: it measures arithmetic, not feel. Whether being folded into an");
console.log("     aggregate makes a named companion feel like equipment is Erik's question at the table.");
console.log("=".repeat(100));
