// contest_math_report.mjs — SNG-247 / Erik 2026-08-01:
// "Show me exactly what the base success of an action would be (with a given test character) against the
//  aggressor enemy. Show the player's chance of success and the aggressor's... then show every modifier that
//  might come into play, then the potential effect of the modifier. I want to see if these +1 and +3 reads are
//  really useful or noise, and if the actions I'm taking have any real effect."
//
// This is a REPORT, not a gate — it prints, it never fails a build. It reads the real content and calls the real
// engine, so what it prints is what the game does; nothing here is a model of the game written twice.
//
// Run: node tests/contest_math_report.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { synthesizeOpponentSheet, opponentPolicy, battleRound, estimateExchange, pDiffExceeds, momentumModifier, wovenBonus } from "../engine/skill_battle.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;

const pct = n => `${(n * 100).toFixed(1)}%`;
const sign = n => (n >= 0 ? `+${n}` : `${n}`);
const rule = (t) => console.log(`\n${"=".repeat(78)}\n${t}\n${"=".repeat(78)}`);

// ---------- the two sides ----------
// A mid-tier test character: the shape Erik's dev hero has (a couple of real attributes, tier-3 crafts).
const player = {
  attributes: { physical: 4, mental: 3, practical: 4, social: 2 },
  subAttributes: { physical: { strength: 3, agility: 3 }, mental: { reason: 2, insight: 3 } },
  alignment: {}, skills: {}, energy: 100,
};
// "the aggressor" — the pooled duel entry the dev Fight button actually mints.
const aggressorEntry = { name: "the aggressor", threat: 40, tacticTags: ["press-in", "circle", "feint"] };
const opp = synthesizeOpponentSheet(aggressorEntry, sb);

rule("THE TWO SIDES");
console.log(`PLAYER   attrs ${JSON.stringify(player.attributes)}  energy ${player.energy}`);
console.log(`AGGRESSOR threat ${aggressorEntry.threat} → attrs ${JSON.stringify(opp.attributes)}  energy ${opp.energy}`);
console.log(`AGGRESSOR crafts: ${(opp.skills || []).map(s => `${s.name} (${s.function}, tier ${s.tier})`).join(" · ") || "(none)"}`);
console.log(`AGGRESSOR tactics: ${(opp.tacticTags || []).join(", ") || "(none)"}`);

// ---------- base: one exchange, no modifiers ----------
// The engine decides the exchange on MARGIN (chance − roll), both d100. So the win-chance is closed-form over the
// difference of the two stacks — that's `pDiffExceeds`, the same function the in-play odds preview uses.
const declFor = (fn, tier, attr, intensity = "standard") => ({ function: fn, tier, attribute: attr, intensity, name: `${fn} t${tier}` });

function stackOf(decl, sheet, oppDecl, extraMods = []) {
  // run ONE round with a fixed rng and read the side's raw pre-clamp stack — the number the contest is decided on
  const r = battleRound({
    playerDecl: decl, oppDecl,
    playerSheet: sheet, oppSheet: opp,
    state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: opp.energy, effects: extraMods, pressure: { player: 0, opponent: 0 } },
    rules, sb, steps, rng: () => 0.5,
  });
  return { you: r.player.rawChance, them: r.opponent.rawChance, r };
}

const oppDecl = opponentPolicy(opp, {}, null, sb);
const baseDecl = declFor("strike", 3, "physical");
const base = stackOf(baseDecl, player, oppDecl);

rule("BASE EXCHANGE — a tier-3 strike, standard intensity, nothing else in play");
console.log(`their move this round: ${oppDecl.name} (${oppDecl.function}, tier ${oppDecl.tier}, ${oppDecl.intensity})`);
console.log(`YOUR raw stack   : ${base.you}`);
console.log(`THEIR raw stack  : ${base.them}`);
console.log(`gap (you − them) : ${sign(base.you - base.them)}`);
console.log(`YOUR chance to WIN THE EXCHANGE : ${pct(pDiffExceeds(base.them - base.you))}`);
console.log(`THEIR chance to win it          : ${pct(pDiffExceeds(base.you - base.them))}`);
console.log(`\n(Note: "your roll 13/95" in the panel is your SOLO success against your own difficulty — a different`);
console.log(` question from who wins the exchange. The contest is decided on the raw stacks above.)`);

// ---------- how much is a point worth? ----------
// The honest way to price a modifier: how many percentage points of WIN CHANCE does +N buy, at this gap?
rule("WHAT ONE POINT OF MODIFIER IS WORTH (at this matchup's gap)");
const gap = base.them - base.you;
const at = n => pDiffExceeds(gap - n);
console.log(` modifier   your win chance   Δ vs base`);
for (const n of [0, 1, 2, 3, 4, 5, 8, 10, 15, 20, 30]) {
  const d = at(n) - at(0);
  console.log(`  ${sign(n).padStart(4)}      ${pct(at(n)).padStart(7)}          ${(d >= 0 ? "+" : "") + (d * 100).toFixed(1)} pts`);
}
console.log(`\nA point is worth about ${((at(10) - at(0)) / 10 * 100).toFixed(2)} percentage points of win chance near this gap.`);

// ---------- every modifier that can enter the roll ----------
rule("EVERY MODIFIER THAT CAN ENTER THE CONTEST — and what it is actually worth");
const mods = [];
const push = (name, value, note) => mods.push({ name, value, note });

// matchup
const mt = sb.functionMatchup?.edges || {};
const mtVals = new Set();
for (const a of Object.keys(mt)) for (const d of Object.keys(mt[a])) mtVals.add(mt[a][d]);
push("matchup (function vs function)", `${Math.min(...mtVals)}…${Math.max(...mtVals)}`, "content: functionMatchup.edges — the biggest single lever you control by CHOOSING the right verb");

// intensity
for (const [k, v] of Object.entries(steps)) if (v.effectMod) push(`intensity: ${k}`, v.effectMod, `energy ×${v.energyMult}${v.backlashChance ? `, ${pct(v.backlashChance)} backlash` : ""}`);

// momentum-as-modifier
const mm = sb.momentum?.asModifier || {};
push("momentum (per point)", mm.perPoint ?? 0.5, `capped at ±${mm.max ?? 8} — so a full meter is worth ${sign(mm.max ?? 8)}`);

// the sense step
const turn = sb.turn || {};
push("sense step (setup bonus)", `±${turn.setupBonusMax ?? 12}`, `= round((yourMargin − theirMargin) × ${turn.setupBonusScale ?? 0.3}), capped`);

// weave
push("woven second craft", `+${(sb.weave?.bonusPerTier ?? 2)}/tier, cap ${sb.weave?.bonusCap ?? 8}`, `costs ×${sb.weave?.energyMultiplier ?? 1.8} energy`);

// wielded items
push("wielded gear", `+${sb.items?.wieldBonusPerItem ?? 2} each, cap ${sb.items?.wieldBonusCap ?? 8}`, "only when the item's tags suit the verb");

// persistent effects
for (const [fn, e] of Object.entries(sb.persistentEffects?.byFunction || {})) {
  if (e.value) push(`effect: ${e.label} (from ${fn})`, e.value, `${e.rounds ?? "?"} rounds, applies ${e.applies || "always"}`);
}

const W = Math.max(...mods.map(m => m.name.length));
for (const m of mods) console.log(`  ${m.name.padEnd(W)}  ${String(m.value).padStart(9)}   ${m.note}`);

// ---------- the question Erik actually asked ----------
rule("ARE THE +1 / +3 READS USEFUL, OR NOISE?");
const readVals = [1, 2, 3, 4, 8, 12];
console.log(`A read's payoff is the SETUP BONUS, which scales with how much you out-read them:`);
console.log(`  setupBonus = round((yourSenseMargin − theirSenseMargin) × ${turn.setupBonusScale ?? 0.3}), capped at ±${turn.setupBonusMax ?? 12}\n`);
for (const v of readVals) {
  const d = (at(v) - at(0)) * 100;
  const verdict = d < 1 ? "NOISE — under a point of win chance"
    : d < 3 ? "marginal — visible only over many rounds"
    : d < 8 ? "real — worth a step"
    : "decisive — worth spending the turn on";
  console.log(`  a ${sign(v).padStart(3)} read → ${(d >= 0 ? "+" : "") + d.toFixed(1)} pts of win chance   ${verdict}`);
}
const senseMarginNeeded = Math.ceil(3 / (turn.setupBonusScale ?? 0.3));
console.log(`\nTo earn even a +3 you must out-read them by ${senseMarginNeeded} margin. Below that, a read buys`);
console.log(`information (the fog tier) rather than arithmetic — which is the honest way to judge it.`);

// ---------- do my ACTIONS matter? ----------
rule("DO THE ACTIONS MATTER? — the same character, same foe, different choices");
const variants = [
  ["tier-1 strike, conserve", declFor("strike", 1, "physical", "conserve")],
  ["tier-3 strike, standard", declFor("strike", 3, "physical")],
  ["tier-3 strike, SURGE", declFor("strike", 3, "physical", "surge")],
  ["tier-5 strike, standard", declFor("strike", 5, "physical")],
  ["tier-3 REVEAL vs their strike (matchup)", declFor("reveal", 3, "mental")],
  ["tier-3 SHIELD vs their strike", declFor("shield", 3, "physical")],
];
console.log(` choice                                     your stack   win chance`);
for (const [label, d] of variants) {
  const s = stackOf(d, player, oppDecl);
  console.log(`  ${label.padEnd(40)} ${String(s.you).padStart(5)}     ${pct(pDiffExceeds(s.them - s.you)).padStart(7)}`);
}

// ---------- is this foe even a contest? ----------
rule("IS THE AGGRESSOR EVEN A CONTEST? — the same character across threat levels");
console.log(` foe threat   their stack   your win chance per exchange   fights won (1500 sims)`);
for (const threat of [20, 40, 55, 70, 85, 100]) {
  const foe = synthesizeOpponentSheet({ name: "foe", threat, tacticTags: ["press-in"] }, sb);
  const od2 = opponentPolicy(foe, {}, null, sb);
  const r0 = battleRound({ playerDecl: baseDecl, oppDecl: od2, playerSheet: player, oppSheet: foe,
    state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: foe.energy, effects: [], pressure: { player: 0, opponent: 0 } },
    rules, sb, steps, rng: () => 0.5 });
  const per = pDiffExceeds(r0.opponent.rawChance - r0.player.rawChance);
  // an honest fight needs BOTH exits — the player folds on their own pressure too (health is the app's job here)
  let wins = 0; const n = 1500;
  for (let i = 0; i < n; i++) {
    let st = { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: foe.energy, effects: [], pressure: { player: 0, opponent: 0 } };
    for (let k = 0; k < 60; k++) {
      const d2 = opponentPolicy(foe, st, null, sb);
      const out = battleRound({ playerDecl: baseDecl, oppDecl: d2, playerSheet: player, oppSheet: foe, state: st, rules, sb, steps });
      st = out.state;
      if (out.resolved === "player") { wins++; break; }
      if (st.pressure.player >= (sb.momentum?.pressure?.breakAtPressure ?? 2)) break;
    }
  }
  console.log(`   ${String(threat).padStart(4)}         ${String(r0.opponent.rawChance).padStart(5)}          ${pct(per).padStart(7)}                 ${pct(wins / n)}`);
}
console.log(`\nThis is the real answer to "do my actions matter": they matter exactly where the fight is CLOSE.`);
console.log(`Read the row where your win chance sits near 50% — that is the threat this character should face`);
console.log(`for a read or a matchup choice to be worth spending a step on.`);

// ---------- and over a whole fight ----------
rule("OVER A WHOLE FIGHT — does a per-round edge compound? (vs a CONTESTED foe, threat 55)");
// Measured against a CONTESTED foe (threat 55, the ~50/50 row above). Against the aggressor (threat 40) the
// player wins ~96% at every edge level, so the table would have measured nothing — a per-round edge can only
// show up in a fight that isn't already decided.
const rival = synthesizeOpponentSheet({ name: "rival", threat: 55, tacticTags: ["press-in"] }, sb);
const BREAK = sb.momentum?.pressure?.breakAtPressure ?? 2;
function simulate(bonusPerRound, n = 4000) {
  let wins = 0;
  for (let i = 0; i < n; i++) {
    let st = { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: rival.energy, effects: [], pressure: { player: 0, opponent: 0 } };
    for (let r = 0; r < 60; r++) {
      const od = opponentPolicy(rival, st, null, sb);
      const out = battleRound({ playerDecl: baseDecl, oppDecl: od, playerSheet: player, oppSheet: rival, state: st, rules, sb, steps, setupBonus: bonusPerRound });
      st = out.state;
      if (out.resolved === "player") { wins++; break; }
      if (st.pressure.player >= BREAK) break;   // the player folds too — both exits, or the number is meaningless
    }
  }
  return wins / n;
}
console.log(` per-round edge   fights won (4000 sims, to a pressure break)`);
for (const b of [0, 1, 3, 6, 12]) console.log(`   ${sign(b).padStart(4)}            ${pct(simulate(b))}`);

console.log(`\n${"-".repeat(78)}`);
console.log(`Report only — this file never fails a build. Regenerate: node tests/contest_math_report.mjs`);
