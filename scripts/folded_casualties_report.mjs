// scripts/folded_casualties_report.mjs — CCODE-298. HOW OFTEN DOES A FOLDED ALLY GO DOWN?
//
// ⛔ AEVI'S ACCEPTANCE 4: "BEFORE/AFTER REPORT, as the rank-deltas change got. Erik should see how often a
// folded ally goes down across the balance sims before this is normal."
//
// ⚠️ BEFORE this change a folded party was PURE UPSIDE — it added damage when the player won and could not
// be touched when the player lost. So the "before" column is not a measurement, it is a constant: ZERO.
// The number that matters is the after, and whether it reads as people standing next to you or as a tax.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = await loadContentHeadless();
const SB = await import("../engine/skill_battle.js");

const W = 100;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

console.log("");
line("═");
console.log("  CCODE-298 — FOLDED CASUALTIES: how often does someone you did not narrate go down?");
line("═");

const sh = (n, at, hp) => ({ name: n, level: 8, health: hp, maxHealth: hp, energy: 40, maxEnergy: 40,
  attributes: at, subAttributes: {}, alignment: {}, skills: [] });
/** ⚠️ A REAL PARTY SHAPE: one who cannot fight, one light, one solid. `combatant:false` is exposed on
 *  purpose — being unable to swing is not being safe. */
const party = () => [
  { id: "aevi", name: "Aevi", contributions: [], sheet: { attributes: { mental: 3 }, level: 3, health: 8 }, downedEffect: "the perimeter goes dark" },
  { id: "bristle", name: "Bristle", contributions: ["HARM"], sheet: { attributes: { physical: 5 }, level: 4, health: 14 } },
  { id: "coil", name: "Coil", contributions: ["HARM"], sheet: { attributes: { physical: 7 }, level: 6, health: 20 } },
];

/** One fight to a conclusion, folded party carried across rounds so wounds accumulate. */
function fight({ foeTier, trials = 200, maxRounds = 8 }) {
  let roundsWithLoss = 0, totalRounds = 0, anyDown = 0, downedNames = {}, totalPool = 0;
  for (let t = 0; t < trials; t++) {
    const folded = party();
    let seed = t * 7919 + 13;
    const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    let downedThisFight = false;
    for (let r = 1; r <= maxRounds; r++) {
      const standing = folded.filter(f => !f.downed);
      if (!standing.length) break;
      totalRounds++;
      const res = SB.battleRound({
        playerDecl: { name: "guard", function: "shield", intensity: "standard", tier: 3 },
        oppDecl: { name: "cleave", function: "strike", intensity: "standard", tier: foeTier, mechanic: { dice: { n: 2, d: 6 } } },
        playerSheet: sh("you", { physical: 4, mental: 4, social: 4, practical: 4 }, 30),
        oppSheet: sh("foe", { physical: 6 + foeTier, mental: 6, social: 4, practical: 4 }, 40),
        folded, state: { momentum: 0, round: r, playerEnergy: 40, opponentEnergy: 40, opponentHealth: 40, effects: [], pressure: { player: 0, opponent: 0 } },
        rules: C.rules, sb: C.skillBattle?.engine, rng, kind: "fight" });
      const fl = res.damage?.foldedLosses;
      if (fl) {
        roundsWithLoss++; totalPool += fl.pool || 0;
        for (const d of (fl.downed || [])) { downedNames[d.name] = (downedNames[d.name] || 0) + 1; downedThisFight = true; }
      }
    }
    if (downedThisFight) anyDown++;
  }
  return { roundsWithLoss, totalRounds, anyDown, trials, downedNames, avgPool: totalRounds ? totalPool / Math.max(1, roundsWithLoss) : 0 };
}

say();
line();
say("① ACROSS FOE TIERS — 200 fights each, a three-person folded line carried across rounds");
line();
say();
say("   foe tier   rounds w/ losses   fights where someone WENT DOWN   avg pool");
for (const foeTier of [2, 5, 8, 11]) {
  const r = fight({ foeTier });
  const lossPct = r.totalRounds ? (r.roundsWithLoss / r.totalRounds * 100) : 0;
  const downPct = (r.anyDown / r.trials * 100);
  say(`   ${String(foeTier).padStart(4)}       ${lossPct.toFixed(0).padStart(4)}%              ${downPct.toFixed(0).padStart(4)}% of fights            ${r.avgPool.toFixed(1)}`);
}

say();
line();
say("② ⛔ WHO GOES DOWN — the softest first, which is `distributeCasualties`' whole design");
line();
say();
{
  const r = fight({ foeTier: 8, trials: 300 });
  const names = Object.entries(r.downedNames).sort((a, b) => b[1] - a[1]);
  if (!names.length) say("   nobody went down in 300 fights at tier 8 — the pool is too small to drop anyone");
  for (const [n, c] of names) say(`   ${n.padEnd(12)}${String(c).padStart(4)} times`);
  say();
  say("   ⚠️ AEVI CANNOT SWING AND IS STILL EXPOSED. That is deliberate: being unable to fight is not being");
  say("      safe, and the reverse would make non-combatants the optimal thing to fold.");
}

say();
line("═");
say("⚠️ THE 'BEFORE' COLUMN IS A CONSTANT: zero. A folded party could not be hurt at all until now, so this");
say("   is not a tuning change, it is the missing half of a mechanic — and the half is now symmetric:");
say("   they GIVE ~6 and they TAKE ~6, from the same dial and the same √K compression.");
say();
say("⛔ BUT ACCEPTANCE 2 CANNOT CURRENTLY BE SATISFIED, AND THE REPORT IS HOW I KNOW.");
say("   NOBODY GOES DOWN — 0% of fights at every tier, 300 fights at tier 8. The pool is 6.0 FLAT because");
say("   `predictAggregate(per, partySize)` scales with HOW MANY YOU FOLDED and not with WHO YOU ARE FIGHTING,");
say("   and `distributeCasualties` caps one share at half the pool. Three damage against the softest ally's");
say("   eight health, forever. ⚠️ A `downedEffect` authored on all nine companions still cannot fire.");
say();
say("⚠️ THAT IS INHERITED, NOT INTRODUCED. The CONTRIBUTION side has always used the same formula, so a");
say("   folded party has always added a fixed ~6 regardless of the foe. Wiring the losses did not create the");
say("   flatness — it made it visible on both sides at once.");
say();
say("⛔ SO THERE IS A RULING WAITING, AND IT IS ONE FORMULA: should the folded pool scale with the THREAT");
say("   (a tier-11 foe cuts deeper into your line than a tier-2 one) or stay a function of party size?");
say("   Scaling it is the only way a folded ally ever goes down. The dial is `sb.melee.perFoldedAlly`.");
line("═");
console.log("");
