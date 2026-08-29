// scripts/group_fidelity.mjs — CCODE-307. DOES THE AGGREGATE LOSE THE HEALER AT THE RATE THE FIGHT DOES?
//
// ⛔ AEVI'S §4, quoting `melee.js`' own header back at me: "An abstraction is only a SIMPLIFICATION if it
// produces what the full simulation produces… otherwise IT IS A DIFFERENT GAME WEARING A SHORTCUT'S NAME."
// And her sharpening of it: "compare NOT just how many fell but WHAT THE SURVIVORS COULD STILL DO. If the
// aggregate loses the healer at a different rate than the full sim does, the abstraction is lying in the
// way that matters most."
//
// ⚠️ THIS IS A SEPARATE HARNESS FROM `scale_fidelity.mjs`, DELIBERATELY. That one asks whether the melee
// compression produces the right NUMBER of casualties, and it still does. This asks whether it produces
// them in the right PEOPLE — a question the casualty count cannot answer and never could, because two runs
// that both drop three allies can leave one group with a healer and the other without.
//
// ⛔ THE HYPOTHESIS UNDER TEST, AND IT IS NOT A NEUTRAL ONE. `distributeCasualties` sorts by soak ASCENDING
// — softest first, which is a sensible melee rule. ⚠️ BUT CAPABILITY IS UNCORRELATED WITH SOAK, AND IN THIS
// CORPUS IT IS ANTI-CORRELATED: the menders and archivists who hold sole coverage are exactly the soft
// ones. If that is true, the aggregate does not merely differ from the fight — IT SYSTEMATICALLY EATS
// COVERAGE FIRST, and every group would lose its healer sooner under the shortcut than under the game.
//
// ⚠️ THE GROUND TRUTH IS NOT A FORMULA I WROTE. It is per-member targeting through `chooseTarget` — the
// same function the live path uses to decide who gets hit — applied one blow at a time. `scale_fidelity`
// records that its first version compared a formula against itself and "proved nothing except that I can
// add"; this one takes the same warning.

import { distributeCasualties, combatWeight } from "../engine/melee.js";
import { chooseTarget } from "../engine/targeting.js";
import { groupCapability, groupMatchup } from "../engine/group.js";
import { contributionsOf } from "../engine/combatants.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const TRIALS = arg("--trials", 2000);
const SIZE = arg("--size", 20);
const LEVEL = arg("--level", 6);

let _s = 20260829;
const rng = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ══ A BAND WITH THE SHAPE THE CORPUS ACTUALLY HAS ═══════════════════════════════════════════════════
// ⚠️ SOLE COVERAGE ON SOFT PEOPLE IS NOT A RIGGED FIXTURE — it is the roster. Of the nine authored
// companions, the ones holding RESTORE and KNOW are the ones who cannot swing, and `presenceSheet` gives
// a non-combatant the same health as anyone else but authored soak is what separates them.
function band(size, level) {
  const out = [];
  const H = level * 2;
  // one mender and one archivist: SOLE coverage, soft. Everyone else: MARTIAL/HARM, tougher.
  out.push({ id: "mender", name: "Sprig", assistTags: ["mend"], canStrike: false, present: true, sheet: { health: H, soak: 0, attributes: { physical: 1 } } });
  out.push({ id: "archivist", name: "Quill", assistTags: ["study"], canStrike: false, present: true, sheet: { health: H, soak: 0, attributes: { mental: 4 } } });
  out.push({ id: "scout", name: "Hush", assistTags: ["scout", "guard"], present: true, sheet: { health: H, soak: 1, attributes: { practical: 3 } } });
  for (let i = out.length; i < size; i++) {
    // ⛔ SPEARS CARRY SPEARS. Without an inventory weapon they get no MARTIAL, so scoreThreat put them
    // level with the scout and the stable sort decided by ARRAY POSITION — which made the ground truth
    // report the SCOUT dying every single time. ⚠️ THE SECOND ORDER ARTIFACT IN THIS HARNESS, found the
    // same way as the first: a number that was suspiciously exactly 100%.
    out.push({ id: `spear${i}`, name: `Spear ${i}`, assistTags: [], present: true,
      inventory: [{ kind: "weapon" }],
      sheet: { health: H, soak: 3, attributes: { physical: 3 } } });
  }
  return out;
}

// ⛔ MEMBERS MUST CARRY `contributions`, THE WAY `alliesOf` BUILDS THEM. My first fixture passed raw
// records, and `scoreThreat` reads `a.contributions` — so EVERY member scored an identical level/4, the
// sort was stable, and the "threat" policy returned WHOEVER I LISTED FIRST. That was the mender.
//
// ⚠️ THE HARNESS THEREFORE REPORTED THE HEALER DYING 100% OF THE TIME IN THE GROUND TRUTH, and I nearly
// published it as evidence the FULL SIM was the brutal one. It was my array order. ⛔ A GROUND TRUTH THAT
// DOES NOT BUILD ITS ACTORS THE WAY THE ENGINE DOES IS NOT A GROUND TRUTH — the exact warning
// `scale_fidelity.mjs` already carries about comparing a formula with itself, in a new costume.
const fresh = () => band(SIZE, LEVEL).map(m => ({ ...m, downed: null, contributions: contributionsOf(m) }));

/* ── GROUND TRUTH — blows land one at a time, through the real targeting ─────────────────────────── */
// ⛔ EACH BLOW PICKS A TARGET THE WAY THE LIVE PATH PICKS ONE, then applies the same magnitude the pool
// would have spent on it. Same total damage, distributed by the game's own rule instead of by soak order.
function fullSim(pool, policy = "threat") {
  const party = fresh();
  let left = pool;
  const blow = Math.max(1, Math.round(LEVEL * 2 * 0.6));   // several blows make up the pool
  let guard = 0;
  while (left > 0 && guard++ < 200) {
    const live = party.filter(p => !p.downed);
    if (!live.length) break;
    const pick = chooseTarget(live, { policy, rng });
    const t = pick?.target || live[0];
    const amt = Math.min(left, blow);
    left -= amt;
    t._taken = (t._taken || 0) + amt;
    if (t._taken >= combatWeight(t).health) t.downed = { why: "the melee" };
  }
  return party;
}

/* ── THE SHORTCUT — one pool, distributed softest-first ──────────────────────────────────────────── */
function aggregate(pool) {
  const party = fresh();
  const cas = distributeCasualties(party, pool, { rng });
  for (const d of (cas.downed || [])) {
    const who = party.find(p => p.id === d.id);
    if (who) who.downed = { why: "the melee" };
  }
  return party;
}

const W = 104, line = (c = "─") => console.log("  " + c.repeat(W));
console.log("");
line("═");
console.log(`  CCODE-307 — GROUP FIDELITY. Does the shortcut lose the same PEOPLE? ${TRIALS} trials · band of ${SIZE} · level ${LEVEL}`);
line("═");
console.log("");
console.log("  A band of " + SIZE + ": one mender (sole RESTORE), one archivist (sole KNOW), a scout, and spears.");
console.log("  ⚠️ The two sole-coverage holders are the SOFT ones, which is the shape the real roster has.");
console.log("");
line();
console.log("   pool    │      FULL SIM (targeting)      │     AGGREGATE (softest-first)   │  ⛔ coverage gap");
console.log("           │  fell   lost RESTORE  lost KNOW│  fell   lost RESTORE  lost KNOW │");
line();

const rows = [];
for (const mult of [1.5, 2.0, 2.5, 3.0, 4.0]) {
  const pool = Math.round(LEVEL * 2 * mult);
  let fF = 0, fR = 0, fK = 0, aF = 0, aR = 0, aK = 0;
  for (let t = 0; t < TRIALS; t++) {
    const f = groupCapability(fullSim(pool));
    const a = groupCapability(aggregate(pool));
    fF += f.down; fR += f.lostCoverage.includes("RESTORE") ? 1 : 0; fK += f.lostCoverage.includes("KNOW") ? 1 : 0;
    aF += a.down; aR += a.lostCoverage.includes("RESTORE") ? 1 : 0; aK += a.lostCoverage.includes("KNOW") ? 1 : 0;
  }
  const pct = (n) => ((n / TRIALS) * 100).toFixed(0).padStart(4) + "%";
  const gap = Math.abs(aR - fR) / TRIALS;
  rows.push({ pool, gap });
  console.log(`   ${String(pool).padStart(5)}   │ ${(fF / TRIALS).toFixed(2).padStart(6)}  ${pct(fR)}      ${pct(fK)}   │ ${(aF / TRIALS).toFixed(2).padStart(6)}  ${pct(aR)}      ${pct(aK)}    │  ${(gap * 100).toFixed(0).padStart(3)} pts`);
}
line();

/* ── THE CAVEAT, MEASURED RATHER THAN ASSERTED ───────────────────────────────────────────────────── */
// ⛔ "0% AT EVERY POOL" IS NOT "THE HEALER IS SAFE" — IT IS "THIS FOE WAS NOT HUNTING HER". `threat`
// aims at whoever is doing it harm, and 17 spears stand between the pool and the mender. ⚠️ THE ENGINE
// HAS TWO OTHER POLICIES AND THEY EXIST PRECISELY FOR PREDATORS: `weakest` and `healer`.
// A conclusion drawn from one policy would be a conclusion about one kind of enemy.
console.log("");
console.log("  ⚠️ AND THE GROUND TRUTH DEPENDS ON WHAT THE FOE IS HUNTING — so all three policies, same pool:");
console.log("");
console.log("     foe policy      fell    lost RESTORE   vs AGGREGATE     what it means");
const POOL = Math.round(LEVEL * 2 * 3.0);
let aggR = 0, aggFell = 0;
for (let t = 0; t < TRIALS; t++) { const a = groupCapability(aggregate(POOL)); aggFell += a.down; aggR += a.lostCoverage.includes("RESTORE") ? 1 : 0; }
for (const [pol, note] of [["threat", "it fights whoever fights it"], ["weakest", "it is cruel — softest first"], ["healer", "it is hunting the mender"]]) {
  let fell = 0, lostR = 0;
  for (let t = 0; t < TRIALS; t++) {
    const f = groupCapability(fullSim(POOL, pol));
    fell += f.down; lostR += f.lostCoverage.includes("RESTORE") ? 1 : 0;
  }
  const mine = (lostR / TRIALS) * 100, agg = (aggR / TRIALS) * 100;
  const delta = Math.abs(mine - agg);
  const verdict = delta < 10 ? "✅ the shortcut matches" : "⛔ the shortcut diverges";
  console.log(`     ${pol.padEnd(14)} ${(fell / TRIALS).toFixed(2).padStart(5)}    ${mine.toFixed(0).padStart(8)}%   ${verdict.padEnd(24)} ${note}`);
}
console.log(`     ${"(aggregate)".padEnd(14)} ${(aggFell / TRIALS).toFixed(2).padStart(5)}    ${((aggR / TRIALS) * 100).toFixed(0).padStart(8)}%   ${"—".padEnd(24)} softest-first, always`);
console.log("");
console.log("  ⛔ SO THE SHORTCUT IS NOT UNIFORMLY WRONG — IT IS PERMANENTLY PREDATORY. It reproduces a foe that");
console.log("     hunts the softest, and applies that behaviour to EVERY foe, including one that has no interest");
console.log("     in the mender at all. ⚠️ The bug is not the arithmetic; it is that the aggregate has a targeting");
console.log("     policy BAKED IN, while the live path takes one as an argument.");

/* ── AND WHAT THE DIVERGENCE IS WORTH, IN CAPABILITY RATHER THAN IN PERCENTAGES ──────────────────── */
// ⛔ `groupMatchup` IS AEVI'S §5.4 — "group stats that can be put up against another group's" — and this
// is its first honest use: put the FULL SIM's survivors against the AGGREGATE's survivors and read the
// edge. ⚠️ If the shortcut were a simplification, the two bands would be the same band and every edge
// would be zero. What it prints instead is the size of the lie, per capability.
console.log("");
console.log("  ⛔ THE SURVIVORS OF THE SAME FIGHT, PUT AGAINST EACH OTHER (pool " + POOL + "):");
console.log("  ⚠️ ONE TRIAL, not a rate — it shows the SHAPE of the divergence. The table above carries the rates.");
console.log("");
{
  const A = groupCapability(fullSim(POOL, "threat"));
  const B = groupCapability(aggregate(POOL));
  const m = groupMatchup(A, B);
  console.log("     family        full-sim   aggregate     edge");
  for (const [fam, v] of Object.entries(m.byFamily)) {
    const flag = Math.abs(v.edge) > 0.3 ? "  ⛔" : Math.abs(v.edge) > 0.1 ? "  ⚠️" : "";
    console.log(`     ${fam.padEnd(12)} ${String(v.us).padStart(8)} ${String(v.them).padStart(11)} ${String(v.edge).padStart(8)}${flag}`);
  }
  if (m.uncontested.length) console.log(`     ⛔ the aggregate has LOST ENTIRELY: ${m.uncontested.join(", ")}`);
  console.log(`     overall edge ${m.edge} — ✅ zero would mean the shortcut produced the fight it replaced`);
}
console.log("");

const worst = rows.reduce((a, b) => (b.gap > a.gap ? b : a), rows[0]);
console.log("");
if (worst.gap >= 0.15) {
  console.log("  ⛔ THE ABSTRACTION IS LYING IN THE WAY THAT MATTERS MOST.");
  console.log(`     At pool ${worst.pool} the two paths disagree by ${(worst.gap * 100).toFixed(0)} POINTS on whether the band still has a healer.`);
  console.log("     ⚠️ THE CAUSE IS NOT MAGNITUDE — both paths spend the same total. IT IS ORDER.");
  console.log("     `distributeCasualties` sorts by soak ASCENDING; `chooseTarget` sorts by THREAT DESCENDING.");
  console.log("     ⛔ THOSE TWO RULES DISAGREE ABOUT EXACTLY THE PEOPLE WHO HOLD SOLE COVERAGE: a mender has no");
  console.log("     MARTIAL and no HARM, so the fight's own rule aims AWAY from her — and the shortcut aims AT her.");
  console.log("");
  console.log("  ✅ AND THE FIX IS NOT TO ABANDON THE SHORTCUT. `distributeCasualties` already takes an ordering.");
  console.log("     THE AGGREGATE SHOULD SHARE THE TARGETING RULE rather than invent a second one — one seam,");
  console.log("     one policy, and the abstraction starts producing the fight it replaces.");
} else {
  console.log("  ✅ THE TWO PATHS AGREE ON CAPABILITY, not only on headcount — the shortcut is a simplification.");
}
console.log("");
line("═");
console.log("  ⚠️ THIS IS AEVI'S §5.5 GATE: the casualty pool should not be tuned until this reads green, because");
console.log("     tuning a pool that destroys the wrong people only calibrates HOW FAST it does that.");
line("═");
console.log("");
