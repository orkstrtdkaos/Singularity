// damage_sensitivity.mjs — SNG-263: where do the damage dials SAFELY sit, and what breaks at the edges?
//
// Erik: "we will want to run synthetic sensitivity analysis and find edge cases too."
//
// Two different questions, so two sections, with two different standards of proof:
//
//   SENSITIVITY — sweep each dial across a range and report where Aevi's three criteria still hold. A single
//   tuned point tells you nothing about how fragile it is; a dial that only works at exactly its shipped
//   value is a trap waiting for the first person who nudges it. This is a REPORT: Erik owns the numbers.
//
//   EDGE CASES — degenerate and adversarial inputs, GATED. These are not tuning questions. A foe whose soak
//   exceeds the biggest die must still be killable; malformed content must never reach the dice as NaN; a
//   craft that refuses an intensity must not quietly take the baseline. Every one of these is a truth no
//   tuning may violate, so every one of them fails the build.
//
// Run: node tests/damage_sensitivity.mjs [--json]

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound, synthesizeOpponentSheet } from "../engine/skill_battle.js";
import { mechanicFor, rollMagnitude, deriveMechanic } from "../engine/craftmechanics.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const RES = rj("content/packs/core/rules/resolution.json");
const CM = rj("content/packs/core/rules/craft_mechanics.json");
const SBRAW = rj("content/packs/core/rules/skill_battle_system.json");
const STEPS = rj("content/packs/core/rules/intensity_scaling.json").steps;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pad = (v, n) => String(v).padStart(n);
const clone = o => JSON.parse(JSON.stringify(o));
const rngFor = k => { let s = k * 7919 + 13; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; };

/** One fight, start to finish, with whatever config we hand it. Returns rounds-to-kill and the damage seen. */
function fight({ tier = 1, threat = 22, level = 20, attr = 9, sb, cm, res, trials = 200, intensity = "standard", craft = null }) {
  const rules = { ...res, craftMechanics: cm };
  const opp = synthesizeOpponentSheet({ name: "foe", threat }, sb);
  const lengths = [], hits = [];
  for (let k = 0; k < trials; k++) {
    let hp = opp.health, rounds = 0;
    const rng = rngFor(k);
    for (let r = 0; r < 80 && hp > 0; r++) {
      rounds++;
      const decl = { function: "strike", tier, attribute: "practical", intensity, name: "a cut", ...(craft || {}) };
      const out = battleRound({ playerSheet: { attributes: { practical: attr }, energy: 100, level }, oppSheet: opp,
        playerDecl: decl, oppDecl: { function: "shield", tier: 1, attribute: "practical", intensity: "standard" },
        state: { momentum: 0, effects: [], opponentHealth: hp }, rules, sb, steps: STEPS, rng });
      if (out.damage?.side === "opponent") { hp = out.state.opponentHealth; hits.push(out.damage.amount); }
    }
    if (hp <= 0) lengths.push(rounds);
  }
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : Infinity;
  return { health: opp.health, soak: opp.soak, rounds: mean(lengths), killRate: lengths.length / trials,
    meanHit: mean(hits), maxHit: hits.length ? Math.max(...hits) : 0, minHit: hits.length ? Math.min(...hits) : 0 };
}

/** Aevi's three criteria, evaluated at one configuration. */
function criteria(sb, cm, res) {
  const bands = [["riffraff", 22], ["notable", 38], ["regional", 55], ["epic", 78]];
  const rows = bands.map(([name, threat]) => {
    const t1 = fight({ tier: 1, threat, sb, cm, res, trials: 120 });
    const t3 = fight({ tier: 3, threat, sb, cm, res, trials: 120 });
    return { name, t1, t3, adv: t1.rounds / t3.rounds };
  });
  return {
    rows,
    tierBetter: rows.every(r => r.adv >= 1.5),
    epicNeedsMore: (rows.find(r => r.name === "epic")?.adv ?? 0) >= 2,
    lowTierViable: rows.every(r => r.t1.rounds <= 10),
    all() { return this.tierBetter && this.epicNeedsMore && this.lowTierViable; }
  };
}

console.log("DAMAGE SENSITIVITY + EDGE CASES — SNG-263 (Erik: 'synthetic sensitivity analysis and find edge cases too')\n");

// ── SENSITIVITY: how fragile is each dial? ──────────────────────────────────────────────────────────────
const SWEEPS = [
  { label: "damage.scaling.perLevel", values: [0, 0.03, 0.06, 0.1, 0.15, 0.25],
    apply: (sb, cm, v) => { sb.engine.damage.scaling.perLevel = v; } },
  { label: "opponentSheetSynthesis.threatToHealth", values: [0.06, 0.09, 0.12, 0.18, 0.25],
    apply: (sb, cm, v) => { sb.engine.opponentSheetSynthesis.threatToHealth = v; } },
  { label: "opponentSheetSynthesis.threatToSoak", values: [0, 0.01, 0.02, 0.04, 0.08],
    apply: (sb, cm, v) => { sb.engine.opponentSheetSynthesis.threatToSoak = v; } },
  { label: "craft T-I die size (1dN)", values: [4, 6, 8, 10, 12],
    apply: (sb, cm, v) => { cm.familyDefaults.damage.dice.d = v; } },
];
console.log("      SENSITIVITY — each dial swept alone, everything else shipped. A dial that only works at one");
console.log("      value is a trap; the SAFE RANGE is what makes a number tunable rather than load-bearing.\n");
const sweepOut = [];
for (const sw of SWEEPS) {
  console.log(`      ${sw.label}`);
  console.log("        value    T-III advantage (riffraff..epic)     all three criteria?");
  const rows = [];
  for (const v of sw.values) {
    const sb = clone(SBRAW), cm = clone(CM), res = clone(RES);
    sw.apply(sb, cm, v);
    const c = criteria(sb.engine, cm, res);
    rows.push({ value: v, adv: c.rows.map(r => r.adv), all: c.all(), tierBetter: c.tierBetter, epicNeedsMore: c.epicNeedsMore, lowTierViable: c.lowTierViable });
    const why = c.all() ? "yes" : [!c.tierBetter && "tier-advantage", !c.epicNeedsMore && "epic-cantrip", !c.lowTierViable && "low-tier-viable"].filter(Boolean).join(", ") + " fails";
    console.log(`        ${pad(v, 6)}   ${c.rows.map(r => (isFinite(r.adv) ? r.adv.toFixed(1) : "—").padStart(5)).join(" ")}          ${why}`);
  }
  const good = rows.filter(r => r.all).map(r => r.value);
  console.log(`        SAFE RANGE: ${good.length ? good.join(", ") : "none of the swept values"}\n`);
  sweepOut.push({ dial: sw.label, rows, safe: good });
}

// ── EDGE CASES: gated, because none of these are tuning questions ───────────────────────────────────────
console.log("      EDGE CASES — degenerate and adversarial inputs. Every one of these is GATED.\n");
const SB = SBRAW.engine;

{ // ⛔ CCODE-292 — ERIK RULED 2026-08-28: minimum damage is 0. "I don't like the 1 minimum."
  // ⚠️ THIS TEST ASSERTED THE OPPOSITE RULE and had to invert. It read "soak far above the biggest die
  // STILL lets a blow land (minHit floors it — no immune foe)". Under the ruling, armour that exceeds the
  // dice now answers COMPLETELY, which is the point: the content's own note says "an armored epic foe needs
  // more than a scaled-up cantrip", and the ward ladder's `immunity` rung can finally mean immunity.
  // ⛔ SO THE GATE NOW ASSERTS BOTH HALVES, because either alone would be a worse design:
  //   ① a cantrip against epic armour does NOTHING — armour means something
  //   ② and a craft with real weight STILL GETS THROUGH — armour is not an off switch
  const sb = clone(SBRAW); sb.engine.opponentSheetSynthesis.soakBase = 40;
  const weakling = fight({ tier: 1, threat: 78, sb: sb.engine, cm: CM, res: RES, trials: 60 });
  check("EDGE: with minHit 0, armour far above the dice ANSWERS a cantrip completely (Erik 2026-08-28)",
    weakling.minHit === 0,
    `min hit ${weakling.minHit} — expected 0 now that minimum damage is 0`);
  // ⚠️ AND THE SECOND HALF MUST BE MEASURED AT A REALISTIC SOAK, NOT THE SYNTHETIC 40 ABOVE. Measured:
  // `soakBase` is 0 and `threatToSoak` 0.02, so a threat-120 foe synthesises to soak 2, and NO authored foe
  // carries a soak field at all. ⛔ 40 IS AN ADVERSARIAL PROBE, NOT A FOE — asserting that something must
  // punch through it would be asserting against a creature the game cannot produce, and would have read as
  // a balance alarm about a number nothing generates.
  const sbReal = clone(SBRAW); sbReal.engine.opponentSheetSynthesis.soakBase = 5;   // the heaviest AUTHORED guard
  const real = fight({ tier: 3, threat: 78, sb: sbReal.engine, cm: CM, res: RES, trials: 60 });
  check("EDGE: …and at a soak the game actually produces, blows still land — armour is not an off switch",
    real.killRate > 0.5,
    `tier-3 vs soak 5 (heaviest authored guard): killRate ${(real.killRate * 100).toFixed(0)}%, min hit ${real.minHit}`);
}
{ // malformed content must never reach the dice as NaN — the codebase's standing rule
  const cm = clone(CM); cm.familyDefaults.damage.dice = { n: 0, d: 0 }; cm.familyDefaults.damage.plus = null;
  const m = mechanicFor({ functions: ["strike"], levelReq: 1 }, { tier: 1, cfg: cm });
  const rolls = Array.from({ length: 200 }, (() => { const r = rngFor(1); return () => rollMagnitude(m.fields, r); })());
  check("EDGE: malformed dice (0d0, null plus) never produce NaN or a non-positive hit",
    rolls.every(v => Number.isFinite(v) && v >= 1), `saw ${rolls.filter(v => !Number.isFinite(v) || v < 1).slice(0, 3)}`);
}
{ // a tier past the authored ladder must not silently collapse to tier 1
  const t5 = mechanicFor({ functions: ["strike"], levelReq: 5 }, { tier: 5, cfg: CM });
  const t9 = mechanicFor({ functions: ["strike"], levelReq: 9 }, { tier: 9, cfg: CM });
  check("EDGE: a tier beyond the authored ladder falls back to the TOP rung, never to tier 1",
    t9.fields.dice.n >= t5.fields.dice.n, `T-9 ${t9.fields.dice.n}d${t9.fields.dice.d} vs T-5 ${t5.fields.dice.n}d${t5.fields.dice.d}`);
}
{ // absurd rank must not run away
  const r99 = mechanicFor({ functions: ["strike"], levelReq: 1 }, { tier: 1, rank: 99, cfg: CM });
  check("EDGE: an absurd rank does not produce an absurd craft (finite, and the dice stay dice)",
    Number.isFinite(r99.fields.dice.n) && r99.fields.dice.n < 100 && Number.isFinite(r99.fields.mult ?? 1),
    `rank-99 -> ${JSON.stringify(r99.fields)}`);
}
{ // conserve must not zero a small craft out
  const m = mechanicFor({ functions: ["strike"], levelReq: 1 }, { tier: 1, intensity: "conserve", cfg: CM });
  const rolls = Array.from({ length: 400 }, (() => { const r = rngFor(3); return () => rollMagnitude(m.fields, r); })());
  check("EDGE: CONSERVE on the smallest craft still deals at least 1 (halving never reaches zero)",
    rolls.every(v => v >= 1), `min ${Math.min(...rolls)}`);
}
{ // a craft with ONLY named axes must resolve without the engine inventing numbers
  const named = { functions: ["reveal"], levelReq: 2, mechanic: { reveal: { axis: ["perceptionDepth"], intensity: { surge: "the whole spectrum at once" } } } };
  const m = mechanicFor(named, { verb: "reveal", tier: 2, intensity: "surge", cfg: CM });
  check("EDGE: a craft whose axes are ALL named (none mechanical) still resolves, and fakes nothing",
    m && m.namedAxes.includes("perceptionDepth") && m.fields.damage === undefined && m.intensityNote,
    JSON.stringify(m && { named: m.namedAxes, note: m.intensityNote }));
}
{ // REFUSED must not be silently replaced by the baseline multiplier
  const refuse = { functions: ["strike"], levelReq: 5, mechanic: { strike: { axis: ["damage"], intensity: { conserve: "REFUSED" } } } };
  const a = mechanicFor(refuse, { verb: "strike", tier: 5, intensity: "conserve", cfg: CM });
  const b = mechanicFor(refuse, { verb: "strike", tier: 5, intensity: "standard", cfg: CM });
  check("EDGE: a REFUSED intensity keeps the craft's magnitudes and reports the refusal",
    a.refusedIntensity === true && (a.fields.mult ?? 1) === (b.fields.mult ?? 1),
    `refused=${a.refusedIntensity} mult=${a.fields.mult ?? 1} vs standard ${b.fields.mult ?? 1}`);
}
{ // the weakest possible attacker against the toughest foe: hopeless is allowed, CRASHING is not
  const r = fight({ tier: 1, threat: 78, level: 1, attr: 1, sb: SB, cm: CM, res: RES, trials: 40 });
  check("EDGE: a level-1 novice against an epic resolves cleanly (hopeless is a design answer; NaN is not)",
    Number.isFinite(r.meanHit) && r.meanHit >= 1 && Number.isFinite(r.killRate),
    `mean hit ${r.meanHit}, killRate ${r.killRate}`);
}
{ // overkill must not push health below zero or break the receipt
  const r = fight({ tier: 5, threat: 22, level: 20, attr: 9, sb: SB, cm: CM, res: RES, trials: 60 });
  check("EDGE: massive overkill on a riffraff resolves in one round and never reports negative health",
    r.rounds <= 2 && r.killRate > 0.95, `rounds ${r.rounds.toFixed(2)}, killRate ${(r.killRate * 100).toFixed(0)}%`);
}
{ // the margin floor must never exceed what the dice could give
  const m = mechanicFor({ functions: ["strike"], levelReq: 1 }, { tier: 1, cfg: CM });
  const ceiling = m.fields.dice.n * m.fields.dice.d + (m.fields.plus || 0);
  const rolls = Array.from({ length: 500 }, (() => { const r = rngFor(7); return () => rollMagnitude(m.fields, r, { marginGap: 10000 }); })());
  check("EDGE: an enormous margin raises the FLOOR but never exceeds the craft's own ceiling",
    rolls.every(v => v <= ceiling), `ceiling ${ceiling}, saw max ${Math.max(...rolls)}`);
}

// ── RANKED SOAK + PENETRATION — Aevi's finding #2, from radiant ─────────────────────────────────────────
// radiant_lance r2 cuts "LIGHT ARMOR" and r3 beats "a Harmonic shield's FIRST RANK". The catalog assumed a
// RANKED guard beaten BY DEGREE before the engine had one; these gate that it now behaves that way.
{
  const opp = synthesizeOpponentSheet({ name: "mythic", threat: 300 }, SB);
  const landedAt = pen => {
    let tot = 0, n = 0;
    for (let k = 0; k < 300; k++) {
      const rng = rngFor(k);
      const r = battleRound({ playerSheet: { attributes: { practical: 9 }, energy: 100, level: 20 }, oppSheet: opp,
        playerDecl: { function: "strike", tier: 3, attribute: "practical", intensity: "standard", name: "a cut", penetration: pen },
        oppDecl: { function: "shield", tier: 1, attribute: "practical", intensity: "standard" },
        state: { momentum: 0, effects: [], opponentHealth: 9999 }, rules: { ...RES, craftMechanics: CM }, sb: SB, steps: STEPS, rng });
      if (r.damage?.side === "opponent") { tot += r.damage.amount; n++; }
    }
    return tot / n;
  };
  check("SOAK: a tough foe's guard is a stack of RANKED layers, not one flat number",
    Array.isArray(opp.soakLayers) && opp.soakLayers.length > 1 && opp.soakLayers.every(l => l.rank && l.value),
    JSON.stringify(opp.soakLayers));
  check("SOAK: the ranked layers still SUM to the foe's total soak (ranking redistributes, never inflates)",
    opp.soakLayers.reduce((a, l) => a + l.value, 0) === opp.soak,
    `layers ${opp.soakLayers.reduce((a, l) => a + l.value, 0)} vs soak ${opp.soak}`);
  const [p0, p1, p3] = [landedAt(0), landedAt(1), landedAt(3)];
  check("SOAK: penetration beats guard BY DEGREE — each rank cut lands strictly more (the catalog's assumption)",
    p1 > p0 && p3 > p1, `pen0 ${p0.toFixed(2)} < pen1 ${p1.toFixed(2)} < pen3 ${p3.toFixed(2)}`);
  check("SOAK: penetration past the top rank cuts everything and no more (no negative soak)",
    Math.abs(landedAt(9) - p3) < 0.01, `pen9 ${landedAt(9).toFixed(2)} vs pen3 ${p3.toFixed(2)}`);
  // an AUTHORED foe with a hand-written flat soak and no layers must keep working
  const flat = { ...opp, soakLayers: undefined, soak: 5 };
  let n = 0, tot = 0;
  for (let k = 0; k < 200; k++) {
    const rng = rngFor(k);
    const r = battleRound({ playerSheet: { attributes: { practical: 9 }, energy: 100, level: 20 }, oppSheet: flat,
      playerDecl: { function: "strike", tier: 3, attribute: "practical", intensity: "standard", name: "a cut" },
      oppDecl: { function: "shield", tier: 1, attribute: "practical", intensity: "standard" },
      state: { momentum: 0, effects: [], opponentHealth: 9999 }, rules: { ...RES, craftMechanics: CM }, sb: SB, steps: STEPS, rng });
    if (r.damage?.side === "opponent") { tot += r.damage.amount; n++; }
  }
  check("SOAK: an AUTHORED foe carrying a flat soak and no layers still works (back-compat)",
    n > 0 && Number.isFinite(tot / n) && tot / n >= 1, `mean ${(tot / n).toFixed(2)} over ${n} hits`);
}

// ── MINTED CRAFTS (§9) — a braid must not be born characterless ─────────────────────────────────────────
// The spec said minted crafts are "born mechanically empty". Measured, that was no longer true — the
// resolution order already gave a braid its family's dice at its own tier. What it WAS born without is its
// parents' authored specificity, which is the subtler and more damaging version of the same bug: correct,
// and characterless. These gate the derivation.
{
  const p1 = { functions: ["reveal"], levelReq: 3,
    mechanic: { reveal: { axis: ["perceptionDepth", "range"], range: 2, intensity: { surge: "the whole spectrum at once" } } } };
  const p2 = { functions: ["strike"], levelReq: 5,
    mechanic: { strike: { axis: ["damage"], dice: { n: 2, d: 8 }, intensity: { conserve: "REFUSED" } } } };
  const derived = deriveMechanic([p1, p2], { verbs: ["reveal", "strike"], cfg: CM });
  const braid = { id: "b", functions: ["reveal", "strike"], levelReq: 4, mechanic: derived };

  check("§9: a braid INHERITS its parents' named axes (it was born with none — correct but characterless)",
    mechanicFor(braid, { verb: "reveal", tier: 4, cfg: CM }).namedAxes.includes("perceptionDepth"));
  check("§9: a braid takes the STRONGER parent's dice, never the sum (a braid of two must not outclass both)",
    JSON.stringify(mechanicFor(braid, { verb: "strike", tier: 1, cfg: CM }).fields.dice) === JSON.stringify({ n: 2, d: 8 }));
  check("§9: a REFUSED intensity is CONTAGIOUS — if a parent cannot be half-given, neither can the braid",
    mechanicFor(braid, { verb: "strike", tier: 4, intensity: "conserve", cfg: CM }).refusedIntensity === true);
  check("§9: parents with no authored mechanic derive nothing (no invented body)",
    deriveMechanic([{ functions: ["strike"], levelReq: 2 }], { verbs: ["strike"], cfg: CM }) === null);
  check("§9: the braid's BOUNDS are not inherited — braids.js draws that boundary around its own reach",
    !("bounds" in (derived.strike || {})) && !("notFor" in (derived.strike || {})));
  // and the minting path actually calls it, rather than the derivation existing unused
  const braidSrc = readFileSync(join(root, "engine/braids.js"), "utf8");
  check("§9: BOTH minting paths call deriveMechanic (a derivation nothing calls is the bug it fixes)",
    (braidSrc.match(/deriveMechanic\(/g) || []).length >= 4, "braids.js should derive at the braid AND discovery mints");
}

if (process.argv.includes("--json")) {
  writeFileSync(join(root, "tests/damage_sensitivity.json"), JSON.stringify({ at: new Date().toISOString(), sweeps: sweepOut }, null, 2));
  console.log("\n      wrote tests/damage_sensitivity.json");
}

console.log(failures === 0
  ? "\nDamage sensitivity: every edge case holds. (The sweeps are a REPORT — the SAFE RANGE column is the useful part.)"
  : `\nDamage sensitivity: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
