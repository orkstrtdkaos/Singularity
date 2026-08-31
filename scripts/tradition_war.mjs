// scripts/tradition_war.mjs — CCODE-331. THE TOURNAMENT, RUN THE WAY THE GAME RUNS.
//
// ⛔ ERIK: "this test needs to become more complex… you need to use CHARACTER SHEETS for these npcs and have
// them CHOOSE SKILLS. The skill use is what will provide the differences. You need to run it like the real
// battle systems run."
//
// ⚠️ WHAT `tradition_melee.mjs` DOES AND WHY IT IS NOT THIS: it picks ONE harm craft per tradition and
// declares it every round. That measures a catalogue row. It is kept as the FIXED-CRAFT BASELINE — the
// controlled comparison where nothing varies but the craft — and this file is the real thing. ⛔ TWO
// HARNESSES ANSWERING THE SAME QUESTION IS DRIFT; two answering DIFFERENT ones is a control and a treatment.
//
// WHAT "LIKE THE REAL BATTLE SYSTEM" MEANS HERE, concretely:
//   · every combatant is a SHEET — attributes, level, health, energy, soak, wards — not a bare number
//   · every combatant carries a LOADOUT of its tradition's authored crafts across several functions
//   · ⛔ `opponentPolicy` CHOOSES for BOTH sides every round — the same engine function `encounters.js`
//     uses — scoring matchup, pressing when behind, protecting a lead, and refusing to repeat itself
//   · intensity is chosen by MOMENTUM (behind → surge, ahead → conserve) and refused on an empty pool
//   · `res.state` is fed back in, so momentum, energy, pressure and standing effects all carry round to round
//   · when a unit's actor falls, THE NEXT MEMBER STEPS UP — which is what makes the other sheets matter
//
// ⚠️ AND IT ONLY BECAME POSSIBLE TODAY. `opponentPolicy` built its declaration from four fields and dropped
// the craft's `mechanic`, so a 1d6 skill and a 12d6 skill dealt an identical 8.64. The policy was choosing
// between weapons that were all the same weapon. CCODE-331 carries the craft through; §30 gates it.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound, opponentPolicy, synthesizeOpponentSheet } from "../engine/skill_battle.js";
import { groupCapability } from "../engine/group.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rulesBase = rj("content/packs/core/rules/resolution.json");
const cm = rj("content/packs/core/rules/craft_mechanics.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;

// ⛔ THE CRAFT PATH IS GATED ON `rules.craftMechanics`. `tradition_melee.mjs` omitted this for three
// revisions and every unit fought on the generic fallback — damage was a CONSTANT across 25 traditions and
// "soak dominates" fell out of it. The live app has always passed it. Never build a `rules` bag without it.
const rules = { ...rulesBase, craftMechanics: cm };

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const ROUNDS = arg("--rounds", 20);
const BOUTS = arg("--bouts", 6);
const SIZE = arg("--size", 5);
const LEVEL = arg("--level", 8);
const CRAFT_CAP = arg("--craftcap", 5);
const FIGHT_TIER = arg("--tier", 5);
const LOADOUT = arg("--loadout", 6);          // crafts each combatant carries
const VERBOSE = process.argv.includes("--verbose");

/* ── the corpus ─────────────────────────────────────────────────────────────────────────────── */
const byTrad = {};
for (const fn of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${fn}`).abilities || [])) {
    const t = a.tradition || a.powerSystem;
    if (!t || t === "combination" || t === "cross_pole_braid") continue;
    (byTrad[t] = byTrad[t] || []).push(a);
  }
}

// ⚠️ THE FUNCTION FAMILIES THE POLICY ACTUALLY SCORES ON. `opponentPolicy` reads `attackFunctions` and
// `defensiveFunctions` off the same config the live game uses, so a loadout is built to give it real
// choices in both — a combatant with only strikes has no tactics, it has a habit.
const ATTACKS = sb?.persistentEffects?.attackFunctions || ["strike", "break"];
const DEFENSIVE = sb?.functionMatchup?.defensiveFunctions || ["shield", "ward", "resist"];
const MENDS = ["heal", "mend", "restore"];

// ⛔ ROLES MAKE THE MEMBERS DIFFER, which is the whole reason to give five people five sheets instead of
// multiplying one by five. A line where everybody carries the same thing has no coverage to lose.
const ROLES = [
  { id: "champion", want: ATTACKS, lean: "physical" },
  { id: "warder", want: DEFENSIVE, lean: "physical" },
  { id: "striker", want: ATTACKS, lean: "physical" },
  { id: "mender", want: MENDS, lean: "mental" },
  { id: "adept", want: ["bind", "hinder", "reveal", "command", "empower"], lean: "mental" },
];

const craftsOf = (trad) => (byTrad[trad] || []).filter(a => (a.levelReq || 1) <= CRAFT_CAP);
const hasAny = (a, fns) => (a.functions || []).some(f => fns.includes(f));

/** One craft becomes one SKILL on a sheet — carrying its identity, which is the part that used to be lost. */
const skillOf = (a, fn) => ({
  function: fn, name: a.name, tier: FIGHT_TIER, rank: 2,
  attribute: a.attribute || "physical",
  abilityId: a.id, mechanic: a.mechanic || undefined,
});

/** A loadout: the role's own specialism first, then breadth, so the policy has something to choose BETWEEN. */
function loadoutFor(list, role) {
  const out = [], seen = new Set();
  const take = (pool, fns) => {
    for (const a of pool) {
      if (out.length >= LOADOUT) return;
      const fn = (a.functions || []).find(f => fns.includes(f));
      if (!fn || seen.has(a.id)) continue;
      seen.add(a.id); out.push(skillOf(a, fn));
    }
  };
  const byLevel = [...list].sort((x, y) => (y.levelReq || 0) - (x.levelReq || 0));
  take(byLevel.filter(a => hasAny(a, role.want)), role.want);   // what this role is for
  take(byLevel.filter(a => hasAny(a, ATTACKS)), ATTACKS);       // everyone can hurt something
  take(byLevel.filter(a => hasAny(a, DEFENSIVE)), DEFENSIVE);   // and answer a blow
  take(byLevel, [...ATTACKS, ...DEFENSIVE, ...MENDS, "bind", "hinder", "empower", "command", "reveal"]);
  return out;
}

/* ── a unit ─────────────────────────────────────────────────────────────────────────────────── */
function raise(trad) {
  const list = craftsOf(trad);
  if (!list.some(a => hasAny(a, ATTACKS))) return null;         // cannot fight — not a combat tradition
  const ward = [...list].sort((x, y) => (y.levelReq || 0) - (x.levelReq || 0))
    .find(a => hasAny(a, DEFENSIVE) && a.mechanic?.soak != null);
  const H = LEVEL * 2;
  const members = [];
  for (let i = 0; i < SIZE; i++) {
    const role = ROLES[i % ROLES.length];
    const skills = loadoutFor(list, role);
    if (!skills.length) continue;
    // ⚠️ ATTRIBUTES LEAN BY ROLE rather than being flat 6s. A scholar and a soldier reaching the same total
    // by different routes is Erik's "scholars are just as deadly many times" expressed in the sheet.
    const attrs = { physical: 5, mental: 5, social: 4, practical: 5 };
    attrs[role.lean] += 2;
    const sheet = {
      name: `${trad} ${role.id}`, level: LEVEL,
      attributes: attrs, energy: 120, maxEnergy: 120,
      health: H, maxHealth: H,
      soak: Number(ward?.mechanic?.soak) || 2,
      ...(ward?.mechanic?.wardTypes ? { wardTypes: ward.mechanic.wardTypes, wardRank: 3 } : {}),
      skills,
    };
    members.push({
      id: `${trad}-${role.id}`, name: sheet.name, present: true, downed: null,
      ...(i === 0 ? { tier: "heroic" } : {}),
      contributions: role.want === MENDS ? ["RESTORE"] : ["HARM", "MARTIAL"],
      sheet,
    });
  }
  return members.length ? { trad, members, ward } : null;
}

const units = Object.keys(byTrad).map(raise).filter(Boolean)
  .filter(u => (byTrad[u.trad] || []).filter(a => hasAny(a, ATTACKS)).length >= 2);

/* ── a bout: the real loop ──────────────────────────────────────────────────────────────────── */
// ⚠️ `opponentPolicy` READS MOMENTUM AS +PLAYER AND MIRRORS IT INTERNALLY. Calling it for the A side means
// handing it a state whose momentum is negated, or A would press exactly when it should pace. The same is
// true of `opponentEnergy` and `lastOppFn` — each side must see its OWN pool and its OWN last verb.
const viewFor = (state, side, lastA, lastB, eA, eB) => side === "B"
  ? { ...state, lastOppFn: lastB, opponentEnergy: eB }
  : { ...state, momentum: -(state.momentum || 0), lastOppFn: lastA, opponentEnergy: eA };

function bout(A, B, seed) {
  let z = seed;
  const rng = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const aM = A.members.map(m => ({ ...m, sheet: { ...m.sheet }, downed: null }));
  const bM = B.members.map(m => ({ ...m, sheet: { ...m.sheet }, downed: null }));
  let aIdx = 0, bIdx = 0;
  let state = { momentum: 0, round: 1, playerEnergy: 120, opponentEnergy: 120 };
  let lastA = null, lastB = null;
  const picks = { A: [], B: [] };

  for (let r = 0; r < ROUNDS; r++) {
    // ⛔ WHEN THE ACTOR FALLS, THE NEXT MEMBER STEPS UP. Without this the other four sheets are scenery and
    // the unit is one person with a crowd behind them.
    while (aIdx < aM.length && aM[aIdx].sheet.health <= 0) { aM[aIdx].downed = { why: "fell" }; aIdx++; }
    while (bIdx < bM.length && bM[bIdx].sheet.health <= 0) { bM[bIdx].downed = { why: "fell" }; bIdx++; }
    if (aIdx >= aM.length || bIdx >= bM.length) break;

    const aSheet = aM[aIdx].sheet, bSheet = bM[bIdx].sheet;
    const aDecl = opponentPolicy(aSheet, viewFor(state, "A", lastA, lastB, aSheet.energy, bSheet.energy), lastB, sb);
    const bDecl = opponentPolicy(bSheet, viewFor(state, "B", lastA, lastB, aSheet.energy, bSheet.energy), lastA, sb);
    picks.A.push(aDecl.function); picks.B.push(bDecl.function);
    lastA = aDecl.function; lastB = bDecl.function;

    const res = battleRound({
      playerDecl: aDecl, oppDecl: bDecl,
      playerSheet: aSheet, oppSheet: bSheet,
      state: { ...state, playerEnergy: aSheet.energy, opponentEnergy: bSheet.energy },
      rules, sb, steps, rng,
      folded: aM.filter((_, i) => i !== aIdx), targetPolicy: "threat",
    });
    // ⚠️ THE ENGINE'S OWN STATE CARRIES FORWARD — momentum, standing effects, pressure. Rebuilding a fresh
    // state each round would throw away everything the system is FOR.
    state = { ...res.state, round: r + 2 };
    aSheet.energy = res.state?.playerEnergy ?? aSheet.energy;
    bSheet.energy = res.state?.opponentEnergy ?? bSheet.energy;
    const d = res?.damage;
    if (d && d.amount > 0) {
      if (d.side === "opponent") bSheet.health -= d.amount; else aSheet.health -= d.amount;
    }
    const h = res?.healing;
    if (h && h.amount > 0) {
      const t = h.side === "opponent" ? bSheet : aSheet;
      t.health = Math.min(t.maxHealth, t.health + h.amount);
    }
  }
  const aLeft = aM.reduce((s, m) => s + Math.max(0, m.sheet.health), 0);
  const bLeft = bM.reduce((s, m) => s + Math.max(0, m.sheet.health), 0);
  const variety = (p) => new Set(p).size;
  return { win: aLeft === bLeft ? "draw" : (aLeft > bLeft ? "A" : "B"), varietyA: variety(picks.A), varietyB: variety(picks.B) };
}

/* ── report ─────────────────────────────────────────────────────────────────────────────────── */
const W = 104, line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
console.log("");
line("═");
say(`CCODE-331 — ${units.length} TRADITIONS, ${SIZE}-PERSON UNITS, EVERY ROUND CHOSEN BY \`opponentPolicy\``);
line("═");
say();
say("⚠️ Real sheets · loadouts from each tradition's own crafts · momentum, energy and effects carried forward.");

/* ── the instrument proves itself before it measures anything ───────────────────────────────── */
// ⛔ THE CHECK WHOSE ABSENCE COST TWO PUBLISHED CONCLUSIONS. Here it must prove TWO things, because this
// harness has two ways to be disconnected: the fight must hear a craft's dice, AND the policy must carry the
// chosen craft to the fight. Either one silently broken makes every number below a statement about nothing.
{
  const mkSkill = (n) => ({ function: "strike", name: "probe", tier: FIGHT_TIER, rank: 2, attribute: "physical",
    abilityId: "probe" + n, mechanic: { dice: { n, d: 6 }, damageType: "physical" } });
  const probeSheet = (n) => synthesizeOpponentSheet(
    { name: "probe", threat: 40, health: 999, soak: 0, energy: 400, skills: [mkSkill(n)] }, sb);
  const meanFor = (n) => {
    const sh = probeSheet(n);
    let tot = 0;
    for (let s = 0; s < 300; s++) {
      let z = s * 7919 + 13;
      const rng = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const d = opponentPolicy(sh, { momentum: 0, round: 1 }, null, sb);
      const r = battleRound({ playerDecl: { ...d, function: "ward", name: "hold" }, oppDecl: d,
        playerSheet: sh, oppSheet: sh, state: { momentum: 0, round: 1 }, rules, sb, steps, rng });
      if (r?.damage?.amount > 0) tot += r.damage.amount;
    }
    return tot / 300;
  };
  const small = meanFor(1), large = meanFor(12);
  if (!(large > small * 1.5)) {
    console.log("");
    console.log("  ⛔ THE CHOSEN CRAFT IS NOT REACHING THE FIGHT — refusing to print a table.");
    console.log(`     A 1d6 loadout delivers ${small.toFixed(2)} and a 12d6 loadout delivers ${large.toFixed(2)}.`);
    console.log("     Either `rules.craftMechanics` is missing, or `opponentPolicy` has gone back to dropping");
    console.log("     the craft's `mechanic`. Every spread below would be about wards and soak alone.");
    console.log("");
    process.exit(1);
  }
  say(`✅ instrument: a chosen 1d6 → ${small.toFixed(1)} · a chosen 12d6 → ${large.toFixed(1)} — the choice reaches the fight`);
}
say();

const score = Object.fromEntries(units.map(u => [u.trad, { w: 0, l: 0, d: 0, variety: 0, n: 0, vWon: 0, nWon: 0, vLost: 0, nLost: 0 }]));
for (let i = 0; i < units.length; i++) {
  for (let k = i + 1; k < units.length; k++) {
    for (let b = 0; b < BOUTS; b++) {
      const r = bout(units[i], units[k], 1000 + b * 7919 + i * 31 + k);
      if (r.win === "A") { score[units[i].trad].w++; score[units[k].trad].l++; }
      else if (r.win === "B") { score[units[k].trad].w++; score[units[i].trad].l++; }
      else { score[units[i].trad].d++; score[units[k].trad].d++; }
      // ⛔ VARIETY IS TALLIED AGAINST THAT UNIT'S OWN RESULT IN THAT BOUT. Comparing variety BETWEEN
      // traditions cannot separate "switching verbs loses" from "losing makes you switch verbs" — and the
      // policy presses when behind and paces when ahead, so a unit in trouble is PUSHED off its best verb.
      // ⚠️ WITHIN a tradition, won-bouts vs lost-bouts, the tradition is held constant and only the outcome
      // varies. That is the only version of this number that can mean anything.
      const tally = (t, v, won) => { const c = score[t]; c.variety += v; c.n++;
        if (won === true) { c.vWon += v; c.nWon++; } else if (won === false) { c.vLost += v; c.nLost++; } };
      tally(units[i].trad, r.varietyA, r.win === "draw" ? null : r.win === "A");
      tally(units[k].trad, r.varietyB, r.win === "draw" ? null : r.win === "B");
    }
  }
}

const table = units.map(u => {
  const s = score[u.trad];
  const cap = groupCapability(u.members, { tierWeights: rules.capabilityByTier });
  const skills = u.members[0].sheet.skills;
  return { ...u, ...s, rate: s.w / Math.max(1, s.w + s.l + s.d), cap, skills,
    varietyWon: s.nWon ? s.vWon / s.nWon : null, varietyLost: s.nLost ? s.vLost / s.nLost : null,
    verbs: new Set(u.members.flatMap(m => m.sheet.skills.map(k => k.function))).size,
    avgVariety: s.variety / Math.max(1, s.n) };
}).sort((a, b) => b.rate - a.rate);

line();
say("  tradition        win%   W-L-D     verbs  used/bout  cohesion  the champion's opening choice");
line();
for (const r of table) {
  say(`  ${r.trad.padEnd(16)}${(r.rate * 100).toFixed(0).padStart(4)}%  ${String(r.w).padStart(3)}-${String(r.l).padStart(3)}-${String(r.d).padStart(2)}  ${String(r.verbs).padStart(5)}  ${r.avgVariety.toFixed(1).padStart(9)}  ${String(r.cap.cohesion).padStart(8)}  ${String(r.skills[0]?.name || "?").slice(0, 28)}`);
}
say();
line("═");

/* ── what moved it ──────────────────────────────────────────────────────────────────────────── */
function r_of(f) {
  const pairs = table.map(row => [Number(f(row)) || 0, row.rate]);
  const n = pairs.length, sx = pairs.reduce((a, [x]) => a + x, 0), sy = pairs.reduce((a, [, y]) => a + y, 0);
  const sxy = pairs.reduce((a, [x, y]) => a + x * y, 0), sxx = pairs.reduce((a, [x]) => a + x * x, 0), syy = pairs.reduce((a, [, y]) => a + y * y, 0);
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return den ? (n * sxy - sx * sy) / den : 0;
}
const ev = (d) => (d && d.n && d.d) ? d.n * (d.d + 1) / 2 : 0;
const bestDice = (r) => Math.max(0, ...r.members.flatMap(m => m.sheet.skills.map(k => ev(k.mechanic?.dice))));
const DRIVERS = [
  ["the unit's BEST authored dice", bestDice],
  ["how many distinct VERBS it fields", r => r.verbs],
  ["how many it actually USED per bout", r => r.avgVariety],
  ["carrying a typed WARD", r => r.ward?.mechanic?.wardTypes ? 1 : 0],
  ["the ward's SOAK", r => Number(r.ward?.mechanic?.soak) || 2],
  ["how many CRAFTS the tradition has at all", r => craftsOf(r.trad).length],
  ["the craft's LEVEL REQUIREMENT (the confound)", r => Math.max(0, ...r.members.flatMap(m => m.sheet.skills.map(k => (byTrad[r.trad].find(a => a.id === k.abilityId)?.levelReq) || 0)))],
];
say("WHAT MOVED IT");
line("═");
say();
say("    input a unit carries in                       r vs win%");
line("·");
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
// ⚠️ THE POINT OF THE WHOLE EXERCISE, MEASURED: did the units actually make CHOICES, or did the policy settle
// into one verb? A tournament of metronomes would look exactly like a tournament of tacticians in the table
// above, and only this line tells them apart.
// ⛔ THE REVERSE-CAUSATION CHECK, AND IT IS NOT OPTIONAL. Between traditions, "verbs used per bout"
// correlated NEGATIVELY with winning — which reads as "switching verbs loses fights" and would be a wrong
// and expensive thing to tell an author. ⚠️ BUT `opponentPolicy` CHANGES BEHAVIOUR WHEN IT IS BEHIND: it
// presses, it paces, it refuses to repeat itself. A unit losing a long fight is MADE to use more verbs.
//
// ⚠️ SO THE COMPARISON IS WITHIN A TRADITION: the same unit's variety in the bouts it WON against the
// bouts it LOST. The tradition, the loadout and the sheets are identical on both sides of that line, so the
// only thing that differs is the outcome. If lost-bouts carry more variety, variety is a SYMPTOM.
const wl = table.filter(r => r.varietyWon != null && r.varietyLost != null);
const mWon = wl.reduce((a, r) => a + r.varietyWon, 0) / Math.max(1, wl.length);
const mLost = wl.reduce((a, r) => a + r.varietyLost, 0) / Math.max(1, wl.length);
const symptom = mLost > mWon;
say(`  ${symptom ? "\u26a0\ufe0f" : "\u2705"} VARIETY IS ${symptom ? "A SYMPTOM, NOT A CAUSE" : "NOT MERELY A SYMPTOM"}: within a tradition, ${mWon.toFixed(2)} verbs per WON bout vs ${mLost.toFixed(2)} per LOST bout`);
say(`     ${symptom ? "A losing unit is PUSHED off its best verb by the policy's own press-when-behind rule, so the negative" : "Lost bouts do not carry more variety, so the negative"} r above must NOT be read as \"switching verbs loses\".`);
say();
const meanUsed = table.reduce((a, r) => a + r.avgVariety, 0) / table.length;
const meanHeld = table.reduce((a, r) => a + r.verbs, 0) / table.length;
say(`  ${meanUsed > 2 ? "✅" : "⛔"} VARIETY: a unit fields ${meanHeld.toFixed(1)} distinct verbs and uses ${meanUsed.toFixed(1)} per bout${meanUsed > 2 ? "" : " — ⛔ THE POLICY IS A METRONOME; the skill choice is not doing anything"}`);
say();
say("     ⚠️ Loadouts, roles and step-up order are MODEL CHOICES, not canon. This says where mechanical");
say("     weight sits when units fight the way the engine fights — not how a tradition plays in a story.");
say();
line("═");
console.log("");
