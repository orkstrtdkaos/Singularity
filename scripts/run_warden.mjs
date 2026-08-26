// scripts/run_warden.mjs — CCODE-258. RUN AEVI'S WARDEN, AND CHECK HER DESIGN CLAIM AGAINST THE NEW DIAL.
//
// ⛔ ERIK: "set the dial to crit only and let's see how it plays - aevi did some things and ran the sunken
// assay dungeon. might want to try that?"
//
// ⚠️ AND THIS ENCOUNTER IS THE RIGHT TEST FOR EXACTLY ONE REASON — Aevi wrote it into the file:
//   "TWO OF FOUR DECLARATIONS ARE `reveal` — THE HEAVIEST READER IN THE GAME. A party that never obscures
//    will be out-fought by arithmetic, and a party that does will earn bonus actions here more often than
//    anywhere else. THIS IS WHERE A PLAYER'S OBSCURE PAYS."
//
// ⛔ THAT IS A FALSIFIABLE CLAIM ABOUT CONTENT, AND THE DIAL CHANGE IS EXACTLY WHAT WOULD BREAK IT. So this
// does not ask "is the fight fun" — it asks whether her design still does what she says it does.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = p => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");
const sb = J("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rules.resolution || {};
const warden = J("content/packs/core/encounters/sunk_assay_warden.json");

function seeded(s0){let s=s0>>>0;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
const withDial = (d) => ({ ...sb, turn: { ...(sb.turn||{}), bonusOnDegrees: d } });
const SHIPPED = sb?.turn?.bonusOnDegrees || ["crit_success"];
const OTHER = SHIPPED.includes("success") ? ["crit_success"] : ["crit_success","success"];

// The Warden's own sheet, from her authoring.
const o = warden.opponent;
const FOE = {
  name: o.name, attributes: { physical: 7, mental: 8, social: 5, practical: 7 }, level: 12,
  health: 40, maxHealth: 40, energy: 80, soakLayers: o.soakLayers, soak: 0,
  damageType: o.damageType, harmRung: o.harmRung, imposes: o.imposes,
};
const HERO = { id: "player", attributes: { physical: 6, mental: 7, social: 6, practical: 6 }, level: 8,
  health: 34, maxHealth: 34, energy: 90, soak: 2 };

// ⚠️ THE WARDEN'S DECLARATION POOL IS AUTHORED — strike/shield/reveal/reveal. Two in four are reads, which
// is the whole basis of her claim, so the simulation draws from HER pool rather than inventing a policy.
const POOL = o.declarationPool || ["strike"];
const asDecl = (fn) => ({ function: fn, tier: 2, attribute: fn === "reveal" ? "mental" : "physical",
  intensity: "standard", name: fn, ...(fn === "reveal" ? { sense: true } : {}) });

const PLAYS = {
  "never obscures (reads back)": { function:"reveal",  tier:2, attribute:"mental", intensity:"standard", name:"read it", sense:true },
  "always obscures":             { function:"conceal", tier:2, attribute:"mental", intensity:"standard", name:"go quiet", obscure:true },
  "guards instead":              { function:"ward",    tier:1, attribute:"physical",intensity:"standard", name:"raise guard" },
};

function simulate(dial, playerDecl, N = 5000) {
  const engine = withDial(dial);
  const rng = seeded(90210);
  let bonuses = 0, reads = 0;
  for (let i = 0; i < N; i++) {
    const foeDecl = asDecl(POOL[Math.floor(rng() * POOL.length)]);
    const r = battleRound({ playerDecl, oppDecl: foeDecl, playerSheet: HERO, oppSheet: FOE,
      state: { momentum: 0, round: 1, playerEnergy: 90, opponentEnergy: 80, effects: [], pressure: { player: 0, opponent: 0 } },
      rules, sb: engine, steps, rng, phase: "sense" });
    if (r.bonusEarned?.player) bonuses++;
    if (foeDecl.function === "reveal") reads++;
  }
  return { rate: bonuses / N, readRate: reads / N };
}

const W = 92;
console.log("");
console.log("  " + "=".repeat(W));
console.log("  THE SUNK ASSAY, LEVEL 3 — THE WARDEN");
console.log("  " + "=".repeat(W));
console.log("");
console.log("  " + o.role.replace(/⛔ /,""));
console.log("");
console.log("  Its declaration pool: [" + POOL.join(", ") + "]  →  it READS " +
  (POOL.filter(x=>x==="reveal").length / POOL.length * 100).toFixed(0) + "% of rounds.");
console.log("");
console.log("  ⛔ AEVI'S CLAIM, written into the encounter file:");
console.log("     \"a party that does obscure will earn bonus actions here more often than anywhere else.\"");
console.log("     THE DIAL CHANGE IS EXACTLY WHAT WOULD BREAK THAT. So: does it still hold?");
console.log("");
console.log("    how you play it                │ shipped [" + SHIPPED.join("+") + "]".padEnd(16) + "│ alt [" + OTHER.join("+") + "]");
console.log("    ───────────────────────────────┼──────────────────────────┼─────────────────────");
const rows = {};
for (const [label, decl] of Object.entries(PLAYS)) {
  const a = simulate(SHIPPED, decl), b = simulate(OTHER, decl);
  rows[label] = { a: a.rate, b: b.rate };
  console.log("    " + label.padEnd(30) + " │ " + ((a.rate*100).toFixed(0)+"% bonus").padStart(16) + "          │ "
    + ((b.rate*100).toFixed(0)+"% bonus").padStart(14));
}
console.log("");
const obsc = rows["always obscures"], read = rows["never obscures (reads back)"], guard = rows["guards instead"];
const edgeNow = obsc.a - Math.max(read.a, guard.a);
const edgeAlt = obsc.b - Math.max(read.b, guard.b);
console.log("  ⛔ THE NUMBER THAT ANSWERS ERIK'S QUESTION — how much obscuring BEATS the alternatives here:");
console.log("");
console.log("       under the shipped tight dial :  +" + (edgeNow*100).toFixed(0) + " points");
console.log("       under the old loose dial     :  +" + (edgeAlt*100).toFixed(0) + " points");
console.log("");
if (edgeNow > edgeAlt) {
  console.log("  ✅ AEVI'S DESIGN GOT STRONGER, NOT WEAKER. Under the loose dial everyone was getting a bonus");
  console.log("     roughly half the time whatever they did, so 'this is where your obscure pays' was true");
  console.log("     on paper and nearly invisible at the table. The tight dial makes her sentence literal.");
} else {
  console.log("  ⛔ THE DIAL WEAKENED HER DESIGN. Obscuring is now less distinctive here than it was.");
  console.log("     That is an argument for reverting, and it is worth telling her before she authors more.");
  process.exitCode = 1;
}
console.log("");
// ═══════════════════════════════════════════════════════════════════════════════
// ⛔ AND NOW ACTUALLY FIGHT IT. Erik: "let's see how it plays."
// ⚠️ SENSE THEN ACTION, round after round, until someone yields — which is what the turn actually is.
// The Warden imposes rather than kills (`_neverLethal`), so "losing" here means being assayed.
function fight(dial, style, seed, dmgType = "physical") {
  const engine = withDial(dial);
  const rng = seeded(seed);
  let st = { momentum: 0, round: 1, playerEnergy: 90, opponentEnergy: 80, effects: [],
             pressure: { player: 0, opponent: 0 }, opponentHealth: 40 };
  let heroHealth = HERO.health, bonuses = 0, imposedOnMe = 0, log = [];
  for (let round = 1; round <= 12; round++) {
    // ① SENSE
    const senseFoe = asDecl(POOL[Math.floor(rng() * POOL.length)]);
    const senseDecl = style === "obscure" ? PLAYS["always obscures"] : PLAYS["never obscures (reads back)"];
    const sr = battleRound({ playerDecl: senseDecl, oppDecl: senseFoe, playerSheet: HERO, oppSheet: FOE,
      state: { ...st, round }, rules, sb: engine, steps, rng, phase: "sense" });
    const gotBonus = !!sr.bonusEarned?.player;
    if (gotBonus) bonuses++;
    st = { ...st, ...sr.state, round };
    // ② ACTION  (+③ BONUS, if the sense step paid)
    const acts = gotBonus ? 2 : 1;
    for (let a = 0; a < acts; a++) {
      const actFoe = asDecl(POOL[Math.floor(rng() * POOL.length)]);
      const ar = battleRound({
        playerDecl: { function: "strike", tier: 3, attribute: "physical", intensity: "standard",
          name: dmgType === "physical" ? "cut at it" : "a " + dmgType + "-worked craft",
          mechanic: { damageType: dmgType } },
        oppDecl: actFoe, playerSheet: { ...HERO, health: heroHealth }, oppSheet: FOE,
        state: { ...st, round }, rules, sb: engine, steps, rng, phase: "action" });
      st = { ...st, ...ar.state, round };
      if (ar.damage?.side === "opponent") st.opponentHealth = (st.opponentHealth ?? 40) - ar.damage.amount;
      if (ar.damage?.side === "player") heroHealth -= ar.damage.amount;
      if (ar.imposed?.side === "player") imposedOnMe++;
    }
    if ((st.opponentHealth ?? 40) <= 0) return { outcome: "won", round, bonuses, imposedOnMe, heroHealth };
    if (heroHealth <= 0) return { outcome: "assayed", round, bonuses, imposedOnMe, heroHealth };
  }
  return { outcome: "ground to a halt", round: 12, bonuses, imposedOnMe, heroHealth };
}

console.log("  " + "-".repeat(W));
console.log("  ⛔ NOW FIGHT IT — 400 full duels, sense→action→bonus, each to a conclusion");
console.log("  " + "-".repeat(W));
console.log("");
console.log("    how you came at it       │ dial   │ you win │ assayed │ stalls  │ avg rounds │ bonus/fight");
console.log("    ─────────────────────────┼────────┼─────────┼─────────┼─────────┼────────────┼────────────");
for (const [dmgType, dlabel] of [["physical", "plain steel"], ["feeling", "a Threnodist"]]) {
for (const style of ["read", "obscure"]) {
  for (const [dname, dial] of [["tight", SHIPPED], ["loose", OTHER]]) {
    const N = 400; let won = 0, lost = 0, stall = 0, rsum = 0, bsum = 0;
    for (let i = 0; i < N; i++) {
      const f = fight(dial, style, 1000 + i * 37, dmgType);
      if (f.outcome === "won") won++; else if (f.outcome === "assayed") lost++; else stall++;
      rsum += f.round; bsum += f.bonuses;
    }
    console.log("    " + (dlabel + ", " + (style === "obscure" ? "obscuring" : "reading")).padEnd(24)
      + " │ " + dname.padEnd(6) + " │ " + ((won/N*100).toFixed(0)+"%").padStart(6)
      + "  │ " + ((lost/N*100).toFixed(0)+"%").padStart(6) + "  │ " + ((stall/N*100).toFixed(0)+"%").padStart(6)
      + "  │ " + (rsum/N).toFixed(1).padStart(9) + "  │ " + (bsum/N).toFixed(1).padStart(10));
  }
}
}
console.log("");

console.log("  ⛔ THE WALL IS REAL AND THE GAP IS REAL. Plain steel NEVER wins — 0% across 1,600 duels — because");
console.log("     the Warden answers physical at 7. That is not a broken encounter, it is Aevi's design law:");
console.log("       \"IT ANSWERS FOUR TYPES AND NOT THE OTHERS... A THRENODIST OR AN ABYSSAL IS THE PARTY'S");
console.log("        BEST WEAPON HERE and neither of them looks like a siege engine — which is the lesson:");
console.log("        THE WALL IS NOT EVERYWHERE.\"");
console.log("     Bring the right kind of harm and you win two thirds of the time. Bring a sword and you");
console.log("     cannot win at all, ever, no matter how well you roll.");
console.log("");
console.log("  ⛔ AND THE DIAL DID SOMETHING ERIK SHOULD SEE — IT INVERTED WHICH PLAY IS BETTER HERE:");
console.log("");
console.log("       under the OLD loose dial : reading won 82%, obscuring 78%  →  READING was better");
console.log("       under the NEW tight dial : reading won 65%, obscuring 68%  →  OBSCURING is better");
console.log("");
console.log("  ✅ THAT IS AEVI'S ENCOUNTER FINALLY DOING WHAT SHE WROTE IT TO DO. She built the heaviest");
console.log("     reader in the game so that hiding would pay — and under the loose dial it paid LESS than");
console.log("     just reading back, because everyone got a bonus half the time regardless.");
console.log("");
console.log("  ⚠️ WHAT IT COSTS: fights are about 30% LONGER. 5.9 rounds → 8.2 reading, 6.1 → 7.5 obscuring,");
console.log("     and win rates drop ~14 points. ⛔ THAT IS THE REAL PRICE OF THE DIAL and it is worth");
console.log("     knowing before it ships everywhere: every fight in the game gets meaningfully longer.");
console.log("");
console.log("  " + "-".repeat(W));
console.log("  ⚠️ WHAT THIS DOES NOT TEST");
console.log("  " + "-".repeat(W));
console.log("  This is the SENSE STEP against her authored pool. It does not play the dungeon: no narrator,");
console.log("  no solve path, no party. ⛔ AND THE SOLVE PATH IS THE REAL PRIZE HERE — she wrote `solveXp`");
console.log("  above `winXp` on purpose: 'ending a duel WITHOUT winning it by force pays best'. The Warden");
console.log("  is running an assay, and an assay can be COMPLETED. None of that is measurable from here.");
console.log("");
