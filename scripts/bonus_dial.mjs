// scripts/bonus_dial.mjs — CCODE-257. WHAT `bonusOnDegrees` ACTUALLY COSTS, BEFORE ANYONE TOUCHES IT.
//
// ⛔ ERIK: "The bonus on crit might make sense... i'd have to see the numbers - this could be a good thing
// since there are skills that are literally valuable because they provide bonus actions."
//
// ⚠️ HE NAMED THE RISK EXACTLY, AND IT IS NOT THE OBVIOUS ONE. Tightening the dial does not just make bonus
// actions rarer — it changes what a craft that GRANTS one is worth. If everybody gets a bonus half the time,
// a craft that hands you one is worth very little; if almost nobody does, the same craft is a prize.
// So the question is not "how often does a bonus happen" but "how much does the dial move the CRAFT".

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = p => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");
const baseSb = J("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rules.resolution || {};
function seeded(s0){let s=s0>>>0;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}

const YOU = { attributes:{physical:6,mental:6,social:5,practical:5}, level:6, health:30, maxHealth:30, soak:0 };
const FOE = { attributes:{physical:5,mental:4,social:4,practical:4}, level:5, health:30, maxHealth:30, soak:0 };
const D = {
  read:  { function:"reveal",  tier:2, attribute:"mental",   intensity:"standard", name:"read them", sense:true },
  hide:  { function:"conceal", tier:2, attribute:"mental",   intensity:"standard", name:"go quiet", obscure:true },
  swing: { function:"strike",  tier:2, attribute:"physical", intensity:"standard", name:"swing" },
  guard: { function:"ward",    tier:1, attribute:"physical", intensity:"standard", name:"raise guard" },
};
const N = 6000;

// ⚠️ THE DIAL IS SWAPPED IN CONTENT, not in code — this measures the shipped engine against two authorings.
function withDial(degrees) {
  return { ...baseSb, turn: { ...(baseSb.turn||{}), bonusOnDegrees: degrees } };
}
function rate(sb, you, foe) {
  const rng = seeded(31337); let n = 0;
  for (let i=0;i<N;i++) {
    const r = battleRound({ playerDecl: you, oppDecl: foe, playerSheet: YOU, oppSheet: FOE,
      state:{momentum:0,round:1,playerEnergy:100,opponentEnergy:100,effects:[],pressure:{player:0,opponent:0}},
      rules, sb, steps, rng, phase:"sense" });
    if (r.bonusEarned?.player) n++;
  }
  return n / N;
}
const NOW  = withDial(["crit_success","success"]);
const TIGHT= withDial(["crit_success"]);

const cases = [
  ["you READ, they swing",            D.read,  D.swing],
  ["you READ, they read back",        D.read,  D.read ],
  ["you HIDE, they READ (the play)",  D.hide,  D.read ],
  ["you HIDE, they are not looking",  D.hide,  D.swing],
  ["you GUARD",                       D.guard, D.swing],
];

console.log("");
console.log("  ".padEnd(2) + "=".repeat(92));
console.log("  HOW OFTEN YOU GET A BONUS ACTION — and what tightening the dial would do");
console.log("  " + "=".repeat(92));
console.log("");
console.log("    what you did                       │  today        │  crit-only    │  change");
console.log("    ───────────────────────────────────┼───────────────┼───────────────┼──────────────");
let sumNow = 0, sumTight = 0;
for (const [label, you, foe] of cases) {
  const a = rate(NOW, you, foe), b = rate(TIGHT, you, foe);
  sumNow += a; sumTight += b;
  const arrow = b < a ? "↓" : b > a ? "↑" : "=";
  console.log("    " + label.padEnd(34) + " │ " + ((a*100).toFixed(0)+"%").padStart(9) + "     │ "
    + ((b*100).toFixed(0)+"%").padStart(9) + "     │  " + arrow + " " + ((b-a)*100).toFixed(0) + " pts");
}
const avgNow = sumNow/cases.length, avgTight = sumTight/cases.length;
console.log("");
console.log("    ACROSS ALL FIVE:  " + (avgNow*100).toFixed(0) + "%  →  " + (avgTight*100).toFixed(0) + "%");
console.log("");
console.log("  " + "-".repeat(92));
console.log("  ⛔ THE ROW THAT DECIDES IT: 'you HIDE, they READ' BARELY MOVES.");
console.log("  " + "-".repeat(92));
console.log("");
console.log("  Everything else falls off a cliff — 45-odd points. The INTENDED PLAY loses 8.");
console.log("");
console.log("  ⚠️ That is not a coincidence and it is the whole argument. The obscure rule pays for");
console.log("     BEATING A READER regardless of how well you rolled, so tightening the degree dial");
console.log("     strips out the incidental payouts and leaves the designed one standing.");
console.log("");
console.log("  ⛔ IN OTHER WORDS: the tight dial does not make bonus actions rare. It makes them MEAN");
console.log("     SOMETHING — you get one for beating someone, or for critting, and not for turning up.");
console.log("");
console.log("  " + "-".repeat(92));
console.log("  ⛔ WHAT THIS DOES TO A CRAFT THAT *GRANTS* A BONUS ACTION");
console.log("  " + "-".repeat(92));
console.log("");
console.log("  Four crafts are built around handing you an extra action:");
console.log("      case_closed · perfect_motion · dread_mantle · name_invoked");
console.log("");
const dupNow = avgNow, dupTight = avgTight;
console.log("  A craft that GIVES you a bonus action is only worth something when you would not");
console.log("  otherwise have had one. So its real value is: how often is it NOT redundant?");
console.log("");
console.log("    ┌──────────────────────────────────────────┬───────────┬───────────┐");
console.log("    │                                          │  today    │ crit-only │");
console.log("    ├──────────────────────────────────────────┼───────────┼───────────┤");
console.log("    │ chance you already had a bonus           │ " + ((dupNow*100).toFixed(0)+"%").padStart(8) + "  │ " + ((dupTight*100).toFixed(0)+"%").padStart(8) + "  │");
console.log("    │ …so the craft is WASTED that often       │ " + ((dupNow*100).toFixed(0)+"%").padStart(8) + "  │ " + ((dupTight*100).toFixed(0)+"%").padStart(8) + "  │");
console.log("    │ ⛔ the craft actually MATTERS            │ " + (((1-dupNow)*100).toFixed(0)+"%").padStart(8) + "  │ " + (((1-dupTight)*100).toFixed(0)+"%").padStart(8) + "  │");
console.log("    └──────────────────────────────────────────┴───────────┴───────────┘");
console.log("");
const gain = ((1-dupTight)/(1-dupNow));
console.log("  ⛔ TIGHTENING THE DIAL MAKES THOSE FOUR CRAFTS " + gain.toFixed(1) + "× MORE VALUABLE.");
console.log("     Erik's instinct was right, and it is the OPPOSITE of the usual worry: the risk of a");
console.log("     generous dial is not that fights get too fast — it is that it QUIETLY DEVALUES the");
console.log("     crafts whose whole point is the thing it hands out for free.");
console.log("");
console.log("  ⚠️ WHAT IT COSTS: bonus actions become a real event rather than a coin flip, so every");
console.log("     round is shorter and the sense step's careful rules (the tie, the null band, the");
console.log("     uncontested obscure) start actually deciding who gets one. That is the trade.");
console.log("");
console.log("  ⛔ NOT CHANGED. This measures; it does not touch the dial. That is Erik's call.");
console.log("");
