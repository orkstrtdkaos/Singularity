// scripts/casualty_sim.mjs — CCODE-304. THE FOLDED PARTY AND THE CASUALTY POOL, MEASURED.
//
// ⛔ ERIK 2026-08-29: "We need to take a look at the folded party and damage and casualty pool so we
// structure it well. This will require some simulation to get right."
//
// ⚠️ THE OLD REPORT SAID "THE POOL IS 6.0 FLAT". True, and not the structure. Writing both curves down
// next to each other is what shows the real shape:
//
//     health = level × 2                 (combatants.js:186 — presenceSheet)
//     pool   = perFoldedAlly × K         (skill_battle.js:1313 — predictAggregate's MEAN is linear in K)
//     share  = (pool × maxSharePer) × (0.5 … 1.0)      (melee.js:202/208)
//     a fall requires  share ≥ health
//
// ⛔ SO THE MECHANIC HAS A HARD WINDOW, AND IT IS NARROW:
//
//        pool < 2 × health   →   NOBODY can fall, ever, at any roll
//        pool > 4 × health   →   EVERYONE the pool reaches falls
//
//    ⚠️ THE WHOLE DYNAMIC RANGE IS A FACTOR OF TWO. Outside it the mechanic is not "rare" or "common",
//    it is OFF or TOTAL. A pool that does not track health lands outside the window and stays there.
//
// ⛔ AND THAT IS EXACTLY WHAT SHIPS. `pool = 2K` does not mention level; `health` is 2×level. They diverge
// immediately: the window at level 6 is [24, 48] and the pool is 8. ⚠️ NOT UNDER-TUNED — OUT OF RANGE.
// No value of `perFoldedAlly` fixes it, because one constant cannot track a curve.
//
// ✅ WHAT THIS MEANS FOR THE RULING: the pool must be PROPORTIONAL TO HEALTH, and where it sits inside
// the window is the design choice. Near the bottom (~2.1×) a fall is occasional and usually singular;
// near the top (~4×) the fold is wiped. THREAT is what should move it within the window — which is the
// fiction Erik has argued for all along, and it now has somewhere to live.

import { distributeCasualties, predictAggregate } from "../engine/melee.js";
import { presenceSheet } from "../engine/combatants.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const TRIALS = arg("--trials", 3000);
const SHARE = arg("--share", 0.5);

/** ⚠️ DETERMINISTIC — a ruling made on these numbers can be re-made on them tomorrow. */
let _s = 20260829;
const rng = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const party = (k, level) => Array.from({ length: k }, (_, i) =>
  ({ id: `f${i}`, name: `ally${i}`, present: true, downed: null, sheet: presenceSheet({ id: `f${i}` }, { level }) }));

function measure(pool, k, level) {
  let any = 0, total = 0, wipe = 0;
  for (let t = 0; t < TRIALS; t++) {
    const c = distributeCasualties(party(k, level), Math.max(0, Math.round(pool)), { rng, maxSharePer: SHARE });
    const d = (c.downed || []).length;
    if (d) any++; total += d; if (d >= k) wipe++;
  }
  return { p: any / TRIALS, per: total / TRIALS, wipe: wipe / TRIALS };
}

const W = 104, line = (c = "─") => console.log("  " + c.repeat(W));
console.log("");
line("═");
console.log("  CCODE-304 — THE CASUALTY POOL. The real engine functions, " + TRIALS + " trials per cell.");
line("═");
console.log(`\n  maxSharePer = ${SHARE} · health = level × 2 · a fall needs one share ≥ health\n`);

/* ── ① THE WINDOW ─────────────────────────────────────────────────────────────────────────────────── */
line();
console.log("  ① ⛔ THE MECHANIC IS A CLIFF, NOT A CURVE — the pool as a MULTIPLE OF HEALTH (level 6, fold of 4)");
line();
console.log("     pool ÷ health    pool    P(someone falls)         falls/round");
for (const mult of [1.0, 1.5, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 5.0]) {
  const level = 6, health = level * 2, pool = health * mult;
  const r = measure(pool, 4, level);
  const bar = "█".repeat(Math.round(r.p * 28));
  console.log(`     ${mult.toFixed(1).padStart(9)}×   ${String(Math.round(pool)).padStart(5)}   ${(r.p * 100).toFixed(1).padStart(6)}%  ${bar.padEnd(28, "·")}  ${r.per.toFixed(2)}`);
}
console.log("\n     ⚠️ EVERYTHING HAPPENS BETWEEN 2× AND 4×. Below 2× the mechanic cannot fire at all; above 4×");
console.log("        it takes everyone the pool reaches. THE USABLE BAND IS 2.0–2.6×, where a fall is");
console.log("        occasional and usually SINGULAR — which is the only regime that reads as a wound.");

/* ── ② WHAT SHIPS ─────────────────────────────────────────────────────────────────────────────────── */
line();
console.log("  ② ⛔ WHAT SHIPS TODAY — pool = 2K, which never mentions level");
line();
console.log("     level   health   window [2×, 4×]   pool (K=4)   in range?   P(falls)");
for (const level of [1, 2, 3, 4, 6, 8, 10]) {
  const health = level * 2, pool = predictAggregate({ mean: 2, sd: 1 }, 4).mean;
  const r = measure(pool, 4, level);
  const inRange = pool >= 2 * health && pool <= 4 * health;
  const verdict = pool < 2 * health ? "⛔ BELOW — dead" : inRange ? "✅ in band" : "⚠️ ABOVE — massacre";
  console.log(`     ${String(level).padStart(4)}   ${String(health).padStart(5)}   ${`[${2 * health}, ${4 * health}]`.padStart(13)}   ${String(pool).padStart(9)}   ${verdict.padEnd(19)}  ${(r.p * 100).toFixed(1).padStart(6)}%`);
}
console.log("\n     ⛔ IT IS IN RANGE FOR EXACTLY ONE LEVEL AND FALLS OUT OF IT PERMANENTLY. At level 1 the fold is");
console.log("        slaughtered; by level 4 nothing can ever happen again. ⚠️ THAT IS THE WHOLE BUG, and no");
console.log("        value of `perFoldedAlly` repairs it — a constant cannot track a curve.");

/* ── ③ THE PROPOSAL ───────────────────────────────────────────────────────────────────────────────── */
line();
console.log("  ③ ✅ POOL PROPORTIONAL TO HEALTH — and the rate then has a CLOSED FORM, independent of level");
line();
console.log("     Write BASE = pool ÷ health. A share is cap × (0.5…1.0) with cap = BASE × health ÷ 2, so");
console.log("     one ally falls when  r ≥ 4/BASE − 1.  ⛔ HEALTH CANCELS. The rate is a property of BASE alone,");
console.log("     which is exactly why proportionality is the fix and a constant pool never could be.");
console.log("");
console.log("     BASE   per-ally   P(someone falls, fold of 4)             reads as");
for (const base of [2.0, 2.2, 2.4, 2.6, 3.0, 3.5]) {
  const cells = [4, 6, 8, 10, 12].map(level => (measure(level * 2 * base, 4, level).p * 100).toFixed(0).padStart(3) + "%");
  const closed = Math.max(0, Math.min(1, 2 - 4 / base));
  const mid = measure(8 * 2 * base, 4, 8).p;
  const reads = mid < 0.12 ? "rare — a scare" : mid < 0.35 ? "occasional, usually one"
    : mid < 0.7 ? "expect to lose someone" : "the line breaks";
  console.log(`     ${base.toFixed(1).padStart(4)}   ${(closed * 100).toFixed(0).padStart(7)}%   L4..L12: ${cells.join(" ")}   ${reads}`);
}
console.log("");
console.log("     ⚠️ THE COLUMNS ARE FLAT ACROSS LEVELS, WHICH IS THE POINT — the same BASE means the same risk");
console.log("        at level 4 and level 12. ⛔ THE ONE EXCEPTION IS LOW LEVEL: at level 1–2 health is 2–4 and");
console.log("        INTEGER ROUNDING dominates the fraction, so the rate is noisy and runs hot. If the ruling");
console.log("        lands near 2.0, a floor of health ≥ 4 (level 2) is worth setting at the same time.");
console.log("");
console.log("     ✅ AND THREAT IS NOW A MULTIPLIER ON BASE, not a second curve — it moves you along this table:");
console.log("        far under you 0.9× · an even fight 1.0× · over your head 1.15× · a rout 1.3×");
console.log("        ⚠️ A SMALL RANGE, because the whole usable band is 2.0–3.5. Threat swings of ±60% would");
console.log("        push straight past both ends — which is the trap a tier multiplier invites.");

/* ── ④ THE OTHER LEVER ────────────────────────────────────────────────────────────────────────────── */
line();
console.log("  ④ ⚠️ AND ONE LEVER IS NOT THE POOL AT ALL — `maxSharePer` decides SPREAD vs CONCENTRATION");
line();
console.log("     maxSharePer   P(falls)   falls/round   P(whole fold lost)     (level 6, pool = 2.1 × health)");
for (const s of [0.34, 0.5, 0.7, 1.0]) {
  let any = 0, total = 0, wipe = 0;
  for (let t = 0; t < TRIALS; t++) {
    const c = distributeCasualties(party(4, 6), Math.round(12 * 2.1), { rng, maxSharePer: s });
    const d = (c.downed || []).length; if (d) any++; total += d; if (d >= 4) wipe++;
  }
  console.log(`     ${s.toFixed(2).padStart(11)}   ${((any / TRIALS) * 100).toFixed(1).padStart(6)}%   ${(total / TRIALS).toFixed(2).padStart(11)}   ${((wipe / TRIALS) * 100).toFixed(1).padStart(16)}%`);
}
console.log("\n     ⛔ A LOWER CAP SPREADS THE POOL AND NOBODY FALLS; A HIGHER ONE CONCENTRATES IT ON ONE PERSON.");
console.log("        ⚠️ THESE TWO DIALS ARE NOT INDEPENDENT — raising the cap is another way to cross the 2×");
console.log("        threshold, so they must be ruled on TOGETHER or one will silently undo the other.");
console.log("");
line("═");
line();
console.log("  ⑤ ⛔ THE NARROW SHARE RANGE IS WHY THE WINDOW IS NARROW — and it is one line in melee.js:208");
line();
console.log("     share = cap × (0.5 + r × 0.5)   →   share only ever spans cap/2 … cap, a 2:1 range.");
console.log("     That 2:1 IS the [2×, 4×] window: nothing else makes the cliff steep. ⚠️ THE REGIME ERIK");
console.log("     ACTUALLY WANTS — occasional, usually a single casualty — sits at BASE 2.0–2.15, which is");
console.log("     EXACTLY where integer rounding makes the rate level-dependent (see the 2.0 row: 22%…7%).");
console.log("");
console.log("     ✅ SO THERE IS A SECOND, BETTER LEVER: widen the share range. `cap × (0.15 + r × 0.85)`");
console.log("     spans 0.15…1.0 of cap, and the transition becomes gradual instead of a cliff:");
console.log("");
console.log("        BASE   narrow (0.5…1.0, today)   wide (0.15…1.0, proposed)");
for (const base of [2.0, 2.5, 3.0, 4.0, 5.0]) {
  const level = 8, health = level * 2, pool = Math.round(health * base);
  const sim = (lo) => {
    let any = 0; const T = TRIALS;
    for (let t = 0; t < T; t++) {
      const cap = Math.max(1, Math.round(pool * SHARE));
      let left = pool, fell = false;
      for (let i = 0; i < 4 && left > 0; i++) {
        const sh = Math.min(left, Math.max(1, Math.round(cap * (lo + rng() * (1 - lo)))));
        left -= sh; if (sh >= health) fell = true;
      }
      if (fell) any++;
    }
    return any / T;
  };
  console.log(`        ${base.toFixed(1).padStart(4)}   ${(sim(0.5) * 100).toFixed(0).padStart(20)}%   ${(sim(0.15) * 100).toFixed(0).padStart(23)}%`);
}
console.log("");
console.log("     ⛔ THE WIDE FORM HELPS, BUT LESS THAN I EXPECTED — 75%→60% at 2.5, 98%→86% at 3.0. It softens");
console.log("        the edge; it does not remove it. ⚠️ REPORTED AS MEASURED, not as the cleaner story I wanted.");
console.log("     ⚠️ IT ALSO MAKES LOSSES LUMPIER — sometimes a graze, sometimes the one who was standing");
console.log("        wrong. That is a FICTION choice, not only a maths one, which is why it is Erik's.");
console.log("");
line("═");
console.log("  ⛔ THE RULING ERIK IS BEING ASKED FOR — four questions, not one:");
console.log("     1. Should the pool be PROPORTIONAL TO HEALTH? (without this nothing else matters)");
console.log("     2. Where in the 2.0–4.0 band should an EVEN fight sit? (2.1 = occasional, single losses)");
console.log("     3. Should THREAT move it inside the band, and how far? (0.9 … 1.3 is all there is room for)");
console.log("     4. ⛔ AND: widen the share range so the dial is a curve instead of a cliff? (⑤)");
line("═");
console.log("");
