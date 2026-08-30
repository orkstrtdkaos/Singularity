// scripts/tradition_melee.mjs — CCODE-326. ONE COMBAT UNIT PER TRADITION, FIGHTING EACH OTHER.
//
// ⛔ ERIK: "raise a combat unit from each tradition and have them fight each other to simulate how things
// are so far."
//
// ⚠️ EVERY UNIT IS BUILT FROM THE TRADITION'S OWN AUTHORED CRAFTS — its best harm craft, its best ward, its
// mender if it has one — so this measures THE CORPUS, not a fixture. A tradition with no ward fights without
// one. A tradition whose harm is untyped meets a warded foe untyped.
//
// ⛔ IT RUNS THROUGH `battleRound`, WHICH MEANS IT EXERCISES EVERYTHING SHIPPED THIS WEEK AT ONCE: damage
// types and partial warding (CCODE-281), the affinity path, the folded party's contribution scaled by
// COHESION (CCODE-323), command from an officer's rung (CCODE-324/325), the fold answering the enemy's
// INTENT (CCODE-318), and the casualty pool that can finally fire (CCODE-319).
//
// ⚠️ WHAT IT IS NOT: a balance verdict. A round-robin of five-person units says which traditions currently
// hit hardest against each other, and NOTHING about how a tradition plays in a story. Read it as a map of
// where the mechanical weight sits today.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";
import { groupCapability } from "../engine/group.js";
// ⚠️ THE HARNESS RESOLVES CRAFTS THE SAME WAY THE FIGHT DOES — asking the engine rather than the JSON.
import { mechanicFor } from "../engine/craftmechanics.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;
const cm = rj("content/packs/core/rules/craft_mechanics.json");

// ⛔ THE FOURTH CONFOUND, AND THE ONE THAT INVALIDATED THE DRIVER TABLE. `battleRound` gates its entire
// craft-damage path on `if (cmCfg?.families)` where `cmCfg = rules.craftMechanics` — and this harness read
// `craft_mechanics.json` at the top of the file and NEVER PASSED IT. Authored, loaded, and unread, in my
// own tool, which is the exact defect this project was built to catch.
//
// ⚠️ SO EVERY UNIT FOUGHT ON THE GENERIC FALLBACK: `base + tier*0.5 + marginGap*0.06`. Measured, 1d6 and
// 30d6 both dealt a mean of 5.00. ⛔ DAMAGE WAS CONSTANT ACROSS ALL 25 TRADITIONS — which is why "soak
// dominates" fell out at r = 0.75: soak was the only thing that varied. The conclusion was an artefact of
// the measurement, not a fact about the game.
//
// ⚠️ THE LIVE APP HAS ALWAYS PASSED IT (`state.js`: `rules.craftMechanics = craftMechanics`). The engine
// was right; the harness was lying. `--nocraft` keeps the old fallback reachable so the difference stays
// measurable rather than becoming a thing I merely assert.
const RULES_WITH_MECHANICS = process.argv.includes("--nocraft") ? rules : { ...rules, craftMechanics: cm };

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const ROUNDS = arg("--rounds", 12);      // rounds per bout
const BOUTS = arg("--bouts", 8);         // bouts per pairing, different seeds
const SIZE = arg("--size", 5);           // members per unit
const LEVEL = arg("--level", 8);
// ⚠️ `--flatsoak N` GIVES EVERY UNIT THE SAME SOAK — the control experiment. If the field collapses when
// soak is held equal, then soak was the fight and the traditions were decoration. Run it both ways.
const FLAT_SOAK = arg("--flatsoak", 0);
const CRAFT_CAP = arg("--craftcap", 5);   // the highest craft level a unit of this standing carries

/* ── the corpus ─────────────────────────────────────────────────────────────────────────────── */
const byTrad = {};
for (const fn of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${fn}`).abilities || [])) {
    const t = a.tradition || a.powerSystem;
    if (!t || t === "combination" || t === "cross_pole_braid") continue;
    (byTrad[t] = byTrad[t] || []).push(a);
  }
}
const hasVerb = (a, re) => (a.functions || []).some(v => re.test(v));
// ⚠️ AND THE CRAFT IS THE ONE A UNIT OF THIS STANDING WOULD ACTUALLY CARRY — the best at or below the
// field's level, rather than the tradition's capstone. Picking capstones compared a level-5 craft against
// a level-1 one and called the difference a tradition.
const pick = (list, re, cap = 99) => list.filter(a => hasVerb(a, re) && (a.levelReq || 1) <= cap)
  .sort((x, y) => (y.levelReq || 0) - (x.levelReq || 0))[0] || null;

/* ── a unit ─────────────────────────────────────────────────────────────────────────────────── */
function raise(trad) {
  const list = byTrad[trad] || [];
  const harm = pick(list, /strike|break/, CRAFT_CAP);
  if (!harm) return null;                       // no way to fight — not a combat tradition
  const ward = pick(list, /ward|shield|guard/, CRAFT_CAP);
  const mend = pick(list, /mend|heal|restore/, CRAFT_CAP);
  const H = LEVEL * 2;
  const sheet = (extra = {}) => ({
    attributes: { physical: 6, mental: 6, social: 6, practical: 6 },
    energy: 400, health: H, maxHealth: H, level: LEVEL, skills: [],
    // ⛔ THE WARD IS THE TRADITION'S OWN. A tradition with no ward craft carries no wardTypes, and meets a
    // typed blow with nothing but soak — which is the honest state of the corpus, not a handicap I chose.
    ...(ward?.mechanic?.wardTypes ? { wardTypes: ward.mechanic.wardTypes, wardRank: 3 } : {}),
    soak: FLAT_SOAK || Number(ward?.mechanic?.soak) || 2,
    ...extra,
  });
  const members = [];
  // ⚠️ ONE OFFICER PER UNIT, at the same rung for everyone, so command is a constant across the field and
  // the comparison is between TRADITIONS rather than between commissions.
  members.push({ id: `${trad}-officer`, name: `${trad} captain`, present: true, downed: null,
    tier: "heroic", contributions: ["HARM", "MARTIAL"], sheet: sheet() });
  for (let i = 1; i < SIZE; i++) {
    const isMender = mend && i === SIZE - 1;
    members.push({ id: `${trad}-${i}`, name: `${trad} ${i}`, present: true, downed: null,
      contributions: isMender ? ["RESTORE"] : ["HARM", "MARTIAL"], sheet: sheet() });
  }
  return { trad, harm, ward, mend, members, sheet: sheet() };
}

const units = Object.keys(byTrad).map(raise).filter(Boolean)
  .filter(u => (byTrad[u.trad] || []).filter(a => hasVerb(a, /strike|break/)).length >= 2);

/* ── a bout ─────────────────────────────────────────────────────────────────────────────────── */
// ⛔ EVERY UNIT DECLARES AT THE SAME TIER, AND MY FIRST VERSION DID NOT. I derived the tier from the
// craft's own `levelReq`, which made the whole tournament a measurement of WHICH TRADITION AUTHORED THE
// HIGHEST-LEVEL HARM CRAFT: win rate correlated with levelReq at r = 0.891, and I nearly reported that
// spread as if it said something about the traditions.
//
// ⚠️ A UNIT IS A UNIT. Raising one from each tradition means comparable standing, so the thing that varies
// is what the craft DOES — its damage type, its dice, whether anything wards it — not what it costs to
// learn. `--tier` moves the whole field together.
const FIGHT_TIER = arg("--tier", 6);
function declOf(u) {
  return { ...u.harm, function: (u.harm.functions || []).find(v => /strike|break/.test(v)),
    tier: FIGHT_TIER, rank: 2, attribute: u.harm.attribute || "physical",
    intensity: "standard", name: u.harm.name, abilityId: u.harm.id };
}

function bout(A, B, seed) {
  let z = seed;
  const rng = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const state = { momentum: 0, round: 1 };
  let aHealth = LEVEL * 2 * SIZE, bHealth = LEVEL * 2 * SIZE;
  const aFold = A.members.map(m => ({ ...m })), bFold = B.members.map(m => ({ ...m }));
  for (let r = 0; r < ROUNDS && aHealth > 0 && bHealth > 0; r++) {
    const res = battleRound({
      playerDecl: declOf(A), oppDecl: declOf(B),
      playerSheet: A.sheet, oppSheet: B.sheet,
      state: { ...state, round: r + 1 }, rules: RULES_WITH_MECHANICS, sb, steps, rng,
      folded: aFold, targetPolicy: "threat",
    });
    const d = res?.damage;
    if (d && d.amount > 0) { if (d.side === "opponent") bHealth -= d.amount; else aHealth -= d.amount; }
    // the other side's fold answers in the same exchange
    const res2 = battleRound({
      playerDecl: declOf(B), oppDecl: declOf(A),
      playerSheet: B.sheet, oppSheet: A.sheet,
      state: { ...state, round: r + 1 }, rules: RULES_WITH_MECHANICS, sb, steps, rng,
      folded: bFold, targetPolicy: "threat",
    });
    const d2 = res2?.damage;
    if (d2 && d2.amount > 0) { if (d2.side === "opponent") aHealth -= d2.amount; else bHealth -= d2.amount; }
  }
  if (aHealth === bHealth) return "draw";
  return aHealth > bHealth ? "A" : "B";
}

/* ── the round robin ────────────────────────────────────────────────────────────────────────── */
const W = 104, line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
console.log("");
line("═");
say(`CCODE-326 — ${units.length} TRADITIONS, ONE UNIT EACH, ROUND ROBIN (${SIZE} per unit · level ${LEVEL})${FLAT_SOAK ? ` · ⚠️ SOAK FLATTENED TO ${FLAT_SOAK}` : ""}`);
line("═");
say();
say("⚠️ Every unit fights with its OWN authored crafts. A tradition with no ward craft carries no ward.");
/* ── the harness proves the fight can hear a craft, before it measures anything ──────────────── */
// ⛔ THIS IS THE CHECK WHOSE ABSENCE COST TWO PUBLISHED CONCLUSIONS. `battleRound` gates its whole craft
// path on `if (cmCfg?.families)`, and for three revisions this file never passed `craftMechanics` — so every
// unit fought on `base + tier*0.5 + marginGap*0.06`, DAMAGE WAS A CONSTANT ACROSS ALL 25 TRADITIONS, and
// "soak dominates at r = 0.75" fell out because soak was the only input that varied.
//
// ⚠️ IT LOOKED EXACTLY LIKE A FINDING. The correlation was strong, stable, and survived a control — because
// the control flattened soak and left the constant alone. ⛔ A CONTROL CANNOT SAVE YOU FROM AN INPUT THAT
// IS NOT CONNECTED; only asking whether the instrument responds at all can.
//
// ⚠️ SO THE TOURNAMENT NOW PROVES ITS OWN INSTRUMENT FIRST: two declarations identical but for their dice
// must produce different damage. If they do not, this refuses to print a table.
{
  const probeDecl = (n) => ({ functions: ["strike"], shape: "damage", levelReq: 1, function: "strike",
    tier: FIGHT_TIER, rank: 2, attribute: "physical", intensity: "standard", name: "probe", abilityId: "probe",
    mechanic: { dice: { n, d: 6 }, damageType: "physical" } });
  const probeSheet = { attributes: { physical: 6, mental: 6, social: 6, practical: 6 },
    energy: 400, health: 999, maxHealth: 999, level: LEVEL, skills: [], soak: 0 };
  const probeMean = (n) => {
    let tot = 0;
    for (let s = 0; s < 300; s++) {
      let z = s * 7919 + 13;
      const rng = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const r = battleRound({ playerDecl: probeDecl(n), oppDecl: probeDecl(2),
        playerSheet: probeSheet, oppSheet: probeSheet, state: { momentum: 0, round: 1 },
        rules: RULES_WITH_MECHANICS, sb, steps, rng });
      if (r?.damage?.amount > 0) tot += r.damage.amount;
    }
    return tot / 300;
  };
  const small = probeMean(1), large = probeMean(12);
  if (!(large > small * 1.5)) {
    console.log("");
    console.log("  ⛔ THE FIGHT CANNOT HEAR THE CRAFT — refusing to print a table.");
    console.log(`     1d6 delivers ${small.toFixed(2)} and 12d6 delivers ${large.toFixed(2)}: the craft's dice are not`);
    console.log("     reaching the damage, so every tradition is fighting with the same numbers and any spread");
    console.log("     below would be about soak and wards alone. Check that `craftMechanics` reaches `battleRound`.");
    console.log("");
    process.exit(1);
  }
  console.log(`  ✅ instrument check: 1d6 → ${small.toFixed(1)} · 12d6 → ${large.toFixed(1)} — the fight hears the craft`);
}

say();

const score = Object.fromEntries(units.map(u => [u.trad, { w: 0, l: 0, d: 0 }]));
for (let i = 0; i < units.length; i++) {
  for (let k = i + 1; k < units.length; k++) {
    for (let b = 0; b < BOUTS; b++) {
      const r = bout(units[i], units[k], 1000 + b * 7919 + i * 31 + k);
      if (r === "A") { score[units[i].trad].w++; score[units[k].trad].l++; }
      else if (r === "B") { score[units[k].trad].w++; score[units[i].trad].l++; }
      else { score[units[i].trad].d++; score[units[k].trad].d++; }
    }
  }
}

const table = units.map(u => {
  const s = score[u.trad];
  const cap = groupCapability(u.members, { tierWeights: rules.capabilityByTier });
  return { ...u, ...s, rate: s.w / Math.max(1, s.w + s.l + s.d), cap };
}).sort((a, b) => b.rate - a.rate);

line();
say("  tradition        win%   W-L-D     harm craft                 typed as     ward         cohesion");
line();
for (const r of table) {
  const dmgType = r.harm?.mechanic?.damageType
    || (r.harm?.mechanic?.damageMix || []).map(x => x.type).join("+") || "—";
  const ward = r.ward?.mechanic?.wardTypes ? r.ward.mechanic.wardTypes.join("/").slice(0, 11) : "⛔ none";
  say(`  ${r.trad.padEnd(16)}${(r.rate * 100).toFixed(0).padStart(4)}%  ${String(r.w).padStart(3)}-${String(r.l).padStart(3)}-${String(r.d).padStart(2)}  ${String(r.harm?.name || "?").slice(0, 25).padEnd(26)}${String(dmgType).slice(0, 12).padEnd(13)}${ward.padEnd(13)}${r.cap.cohesion}`);
}
say();
line("═");

/* ── what the shape of it says ──────────────────────────────────────────────────────────────── */
const untyped = table.filter(r => !r.harm?.mechanic?.damageType && !(r.harm?.mechanic?.damageMix || []).length);
const noWard = table.filter(r => !r.ward?.mechanic?.wardTypes);
/* ── where the spread comes from ────────────────────────────────────────────────────────────── */
// ⛔ A RANKING IS NOT AN ANSWER. Knowing seraphic beats wright says nothing Erik can turn a dial on.
// These are the measurable inputs a unit carries into the fight, each correlated against win rate, so the
// table below names WHAT IS DOING THE WORK rather than only who won.
//
// ⚠️ AND IT IS ALSO THE SECOND CONFOUND CHECK. If one input scores near ±1, the tournament is that input
// wearing 25 different names — which is exactly how the first version of this script scored r = 0.891 on
// the craft's LEVEL and looked like a finding about traditions.
// ⛔ EFFECTIVE DICE, NOT AUTHORED DICE. My first driver table read `harm.mechanic.dice` and scored the seven
// unauthored crafts as ZERO — so it reported "offense contributes nothing", which was my own column being
// wrong rather than a fact about the game. `mechanicFor` is what the fight actually resolves through, so the
// table asks IT.
//
// ⚠️ AND ASKING IT SURFACED THE REAL FINDING: `craftmechanics` resolves `diceAuthored ? {nMult:1} : rung.dice`
// — AUTHORED WINS, deliberately, so an author who tiers their own dice is not doubled. The consequence nobody
// had measured is the other half: a craft that authors NOTHING inherits the tier rung, which at this standing
// is 1d6 × 5 + 8 = 5d6+8, mean 25.5. valley_craft authored 1d6 and fights at mean 3.5. ⛔ NOT AUTHORING DICE
// IS CURRENTLY THE STRONGEST DAMAGE CHOICE IN THE GAME, by a factor of seven, and it is invisible in the JSON.
const effDice = (u) => {
  try {
    const m = mechanicFor(declOf(u), { verb: declOf(u).function, tier: FIGHT_TIER, rank: 2, intensity: "standard", cfg: cm });
    if (!m || !m.fields) return 0;
    const d = m.fields.dice;
    return (d && d.n && d.d ? d.n * (d.d + 1) / 2 : 0) + (Number(m.fields.plus) || 0);
  } catch { return 0; }
};
const DRIVERS = [
  ["the harm craft's EFFECTIVE damage roll", r => effDice(r)],
  ["whether those dice are AUTHORED at all", r => r.harm?.mechanic?.dice ? 1 : 0],
  ["how many it TARGETS",                   r => r.harm?.mechanic?.targets || 1],
  ["carrying a TYPED WARD at all",          r => r.ward?.mechanic?.wardTypes ? 1 : 0],
  // ⛔ THE SOAK THE FIGHT USED, not the soak the JSON authored. Under `--flatsoak` those differ, and a row
  // reporting the authored number would be correlating a value that never entered the battle — the same
  // mistake the dice column made one revision ago.
  ["the ward's SOAK (as fought)",            r => FLAT_SOAK || Number(r.ward?.mechanic?.soak) || 2],
  ["harm being UNTYPED",                    r => (!r.harm?.mechanic?.damageType && !(r.harm?.mechanic?.damageMix || []).length) ? 1 : 0],
  ["having a MENDER in the five",           r => r.mend ? 1 : 0],
];
say("WHERE THE SPREAD COMES FROM");
line("═");
say();
say("    input a unit carries in                       r vs win%");
line("·");
// ⛔ A CONSTANT IS NOT A WEAK DRIVER, AND REPORTING r ON ONE IS A LIE OF PRESENTATION. `targets` scored a
// clean 0.00 and read as "measured, contributes nothing" — when all 25 crafts carry the same value, so
// there was never anything to correlate. ⚠️ THE TWO CASES LOOK IDENTICAL IN A NUMBER AND MEAN OPPOSITE
// THINGS: one says the dial does not matter, the other says the dial was never turned.
for (const [label, f] of DRIVERS) {
  const vals = table.map(r => Number(f(r)) || 0);
  if (new Set(vals).size <= 1) {
    say("    " + label.padEnd(45) + "    —  " + "".padEnd(20) + " ⬜ CONSTANT (" + vals[0] + ") — no variance to measure");
    continue;
  }
  const rr = r_of(f), mag = Math.abs(rr);
  const mark = mag > 0.7 ? "⛔ dominates" : mag > 0.4 ? "⚠️ real" : mag > 0.2 ? "·  slight" : "   ~none";
  say("    " + label.padEnd(45) + (rr >= 0 ? "+" : "") + rr.toFixed(2).padStart(5) + "  " + "█".repeat(Math.round(mag * 20)).padEnd(20) + " " + mark);
}
say();
// ⚠️ THE CORPUS GAP THIS EXPOSED, and it is not about balance: crafts with no authored `dice` still
// resolve, because the engine falls back — which makes them the crafts NOBODY CAN TUNE. Their damage is
// not authored, it is inherited, and no reader will ever tell you so.
const inherited = table.filter(r => !r.harm?.mechanic?.dice).map(r => effDice(r));
const authoredD = table.filter(r => r.harm?.mechanic?.dice).map(r => effDice(r));
const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
if (inherited.length && authoredD.length) {
  say("  ⛔ AUTHORED " + mean(authoredD).toFixed(1) + " mean damage · INHERITED " + mean(inherited).toFixed(1)
    + "  — a craft that authors NO dice hits " + (mean(inherited) / Math.max(0.01, mean(authoredD))).toFixed(1) + "× harder than one that does.");
  say("     The engine is right to let AUTHORED WIN (it stops double-tiering). The cost is that SILENCE INHERITS");
  say("     THE TIER RUNG — so the strongest damage choice in the catalogue is to leave `dice` unwritten.");
  say();
}
const noDice = table.filter(r => !r.harm?.mechanic?.dice);
if (noDice.length) {
  say("  ⚠️ " + noDice.length + " of " + table.length + " units fight with a harm craft carrying NO authored dice: " + noDice.map(r => r.trad).slice(0, 8).join(", "));
  say("     Their damage is INHERITED from the engine fallback, not authored — invisible to any balance pass.");
  say();
}
line("═");

say("WHAT THE FIELD LOOKS LIKE");
line("═");
say();
say(`  ⚠️ ${untyped.length} of ${table.length} units fight with an UNTYPED harm craft — invisible to every`);
say(`     affinity and every ward in the game: ${untyped.map(r => r.trad).slice(0, 8).join(", ") || "none"}`);
say();
say(`  ⚠️ ${noWard.length} of ${table.length} carry NO typed ward at all: ${noWard.map(r => r.trad).slice(0, 8).join(", ") || "none"}`);
say();
// ⛔ THE HARNESS CHECKS ITSELF. If win rate ever tracks the craft's LEVEL again, this line says so — the
// first version of this script scored r = 0.891 and was measuring the catalogue rather than the fight.
// ⚠️ ONE CORRELATOR, so the level check and the driver table below cannot drift apart into two answers.
function r_of(f) {
  const pairs = table.map(row => [Number(f(row)) || 0, row.rate]);
  const n = pairs.length, sx = pairs.reduce((a, [x]) => a + x, 0), sy = pairs.reduce((a, [, y]) => a + y, 0);
  const sxy = pairs.reduce((a, [x, y]) => a + x * y, 0), sxx = pairs.reduce((a, [x]) => a + x * x, 0), syy = pairs.reduce((a, [, y]) => a + y * y, 0);
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return den ? (n * sxy - sx * sy) / den : 0;
}
const corr = r_of(r => r.harm?.levelReq || 0);

const top = table[0], bottom = table[table.length - 1];
say(`  ⛔ SPREAD: ${top.trad} ${(top.rate * 100).toFixed(0)}% → ${bottom.trad} ${(bottom.rate * 100).toFixed(0)}%.`);
say(`  ${Math.abs(corr) > 0.6 ? "⛔" : "✅"} win rate vs the craft's LEVEL REQUIREMENT: r = ${corr.toFixed(3)} ${Math.abs(corr) > 0.6 ? "— THE HARNESS IS MEASURING THE CATALOGUE, NOT THE FIGHT" : "— level is controlled, so the spread is about what the crafts DO"}`);
say();
say("     ⚠️ A ROUND ROBIN OF FIVE-PERSON UNITS SAYS WHERE THE MECHANICAL WEIGHT SITS TODAY, and nothing");
say("     about how a tradition plays in a story. Read it as a map, not a verdict.");
say();
line("═");
console.log("");
