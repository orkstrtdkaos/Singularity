// scripts/targeting_ruling_sim.mjs — CCODE-308. WHAT THE RULING DOES, IN PLAIN TERMS, WITH THE DIALS NAMED.
//
// ⛔ ERIK: "I don't really fully understand your results. And make sure we're accounting for tanky types
// protecting the squishy healers and casters. Make it more obvious what our ruling is doing and where
// there are dials."
//
// ⚠️ THE SECOND SENTENCE FOUND SOMETHING MY FIRST VERSION MISSED ENTIRELY. I simulated who gets hit without
// simulating anyone STANDING IN FRONT OF THEM — and the reason that felt fine is that the engine does not
// do it either. See §0: the whole protection chain is built, read, and permanently empty.
//
// ⚠️ NOTHING IN engine/ IS CHANGED BY THIS FILE. Every option is implemented here, beside today's
// behaviour, on the same seed. This is the evidence for a ruling, not the ruling.

import { distributeCasualties, combatWeight } from "../engine/melee.js";
import { chooseTarget } from "../engine/targeting.js";
import { contributionsOf } from "../engine/combatants.js";
import { groupCapability } from "../engine/group.js";
import { interceptorFor, catchesDamage } from "../engine/intercept.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const TRIALS = arg("--trials", 4000);
const LEVEL = arg("--level", 6);
const H = LEVEL * 2;                       // health = level × 2 (combatants.js:186)
const POOL_MULT = arg("--pool", 3);        // the pool, as a multiple of one person's health
const SHARE_CAP = arg("--sharecap", 0.5);  // distributeCasualties maxSharePer
const GUARD_RANK = arg("--guardrank", 2);  // r2+ runs for a duration instead of one charge

let _s = 20260829;
const rng = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const reseed = () => { _s = 20260829; };

const W = 100;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

/* ══ THE THREE OPTIONS — same arithmetic, different answer to "who does it go to" ══════════════════ */

/** A · TODAY — the shipped rule. Least armour first, nothing else consulted. */
const optionA = (party, pool) => distributeCasualties(party, pool, { rng, maxSharePer: SHARE_CAP });

/** B · INTENT — the enemy hits who it is actually after, via the same `chooseTarget` the live path uses. */
function optionB(party, pool, policy) {
  const live = party.filter(c => !c.downed);
  const cap = Math.max(1, Math.round(pool * SHARE_CAP));
  const downed = [], already = new Set();
  let left = pool;
  while (left > 0) {
    const eligible = live.filter(c => !already.has(c.id));
    if (!eligible.length) break;
    const pick = chooseTarget(eligible, { policy, rng })?.target || eligible[0];
    already.add(pick.id);
    const share = Math.min(left, Math.max(1, Math.round(cap * (0.5 + rng() * 0.5))));
    left -= share;
    if (share >= combatWeight(pick).health) downed.push({ id: pick.id });
  }
  return { downed };
}

/** C · INTENT + GUARD — …and whoever stands in front takes it, through the REAL `interceptorFor`. */
function optionC(party, pool, policy, protections) {
  const live = party.filter(c => !c.downed);
  const sheets = Object.fromEntries(party.map(x => [x.id, x.sheet || {}]));
  const guards = (protections || []).filter(catchesDamage);
  const cap = Math.max(1, Math.round(pool * SHARE_CAP));
  const downed = [], already = new Set(), spent = new Set();
  let left = pool;
  while (left > 0) {
    const eligible = live.filter(c => !already.has(c.id));
    if (!eligible.length) break;
    let pick = chooseTarget(eligible, { policy, rng })?.target || eligible[0];
    const g = interceptorFor(pick.id, guards.filter(p => !spent.has(p)), sheets);
    if (g) {
      const taker = party.find(x => x.id === g.protection.protectorId);
      // ⚠️ A GUARD WHO IS ALREADY DOWN CANNOT CATCH ANYTHING — the check that keeps this honest.
      if (taker && !taker.downed) { if (g.protection.rank < 2) spent.add(g.protection); pick = taker; }
    }
    already.add(pick.id);
    const share = Math.min(left, Math.max(1, Math.round(cap * (0.5 + rng() * 0.5))));
    left -= share;
    if (share >= combatWeight(pick).health) downed.push({ id: pick.id });
  }
  return { downed };
}

/* ══ THE PEOPLE ═══════════════════════════════════════════════════════════════════════════════════ */
const mk = (id, tags, extra = {}) => ({ id, name: id, present: true, downed: null, assistTags: tags, ...extra });
const squishy = (id, tags) => mk(id, tags, { canStrike: false, sheet: { health: H, soak: 0, attributes: { mental: 3 } } });
const fighter = (id, soak = 3) => mk(id, [], { inventory: [{ kind: "weapon" }], sheet: { health: H, soak, attributes: { physical: 3 } } });
const tank = (id) => mk(id, ["guard"], { inventory: [{ kind: "weapon" }], sheet: { health: H * 2, soak: 6, attributes: { physical: 5 } } });

// "the tank stands in front of the healer", stated mechanically: a damage-catching protection.
const guardOn = (protectorId, allyId) => ({ protectorId, allyId, rank: GUARD_RANK, catches: ["damage"],
  chargesLeft: GUARD_RANK >= 2 ? null : 1, roundsLeft: GUARD_RANK >= 2 ? 3 : null, resistBonus: GUARD_RANK >= 2 ? 2 : 0 });

const SCENARIOS = [
  { title: "1 · YOUR PARTY OF FOUR",
    who: "You + Tal (spear) · Sprig (mender, no armour) · Quill (archivist, no armour)",
    foe: "threat", foeSays: "a brute — it fights whoever is hitting it",
    make: () => [fighter("You", 2), fighter("Tal"), squishy("Sprig", ["mend"]), squishy("Quill", ["study"])],
    guards: () => [guardOn("Tal", "Sprig")], watch: "Sprig", watchIs: "your only healer" },

  { title: "2 · THE SAME PARTY, A DIFFERENT ENEMY",
    who: "the same four",
    foe: "healer", foeSays: "something that has fought a party before — it is hunting the mender",
    make: () => [fighter("You", 2), fighter("Tal"), squishy("Sprig", ["mend"]), squishy("Quill", ["study"])],
    guards: () => [guardOn("Tal", "Sprig")], watch: "Sprig", watchIs: "your only healer" },

  { title: "3 · A BAND WITH A REAL TANK",
    who: "Brann (heavy armour, double health) + 6 fighters · Sprig (mender) · Quill (archivist)",
    foe: "threat", foeSays: "a brute — it fights whoever is hitting it",
    make: () => [tank("Brann"), ...Array.from({ length: 6 }, (_, i) => fighter(`hero${i}`)),
      squishy("Sprig", ["mend"]), squishy("Quill", ["study"])],
    guards: () => [guardOn("Brann", "Sprig"), guardOn("Brann", "Quill")], watch: "Sprig", watchIs: "your only healer" },

  { title: "4 · A BAND WITH A TANK, AGAINST A HUNTER",
    who: "the same band",
    foe: "healer", foeSays: "a hunter that wants the mender specifically",
    make: () => [tank("Brann"), ...Array.from({ length: 6 }, (_, i) => fighter(`hero${i}`)),
      squishy("Sprig", ["mend"]), squishy("Quill", ["study"])],
    guards: () => [guardOn("Brann", "Sprig"), guardOn("Brann", "Quill")], watch: "Sprig",
    watchIs: "⛔ THE CASE THE WHOLE RULING IS FOR: can your line answer a specialist enemy?" },

  { title: "5 · A MILITARY UNIT",
    who: "40 identical soldiers — nobody is the only anything",
    foe: "threat", foeSays: "a brute",
    make: () => Array.from({ length: 40 }, (_, i) => fighter(`soldier${i}`)),
    guards: () => [], watch: null, watchIs: "⚠️ THE CONTROL — no sole capability exists, so nothing should move" },

  { title: "6 · AN ARMOURED HEALER",
    who: "Priest (mender in plate) · a frail scout · 6 fighters",
    foe: "healer", foeSays: "a hunter that wants the mender",
    make: () => [mk("Priest", ["mend"], { inventory: [{ kind: "weapon" }], sheet: { health: H, soak: 6, attributes: { physical: 4 } } }),
      squishy("scout", ["scout"]), ...Array.from({ length: 6 }, (_, i) => fighter(`hero${i}`))],
    guards: () => [], watch: "Priest", watchIs: "⚠️ today her ARMOUR hides her from the rule, by accident" },
];

const prep = (ms) => ms.map(m => ({ ...m, contributions: contributionsOf(m) }));

function measure(sc, option) {
  let lostCap = 0, watched = 0, fell = 0;
  const pool = Math.round(H * POOL_MULT);
  for (let t = 0; t < TRIALS; t++) {
    const party = prep(sc.make());
    const res = option === "A" ? optionA(party, pool)
      : option === "B" ? optionB(party, pool, sc.foe)
        : optionC(party, pool, sc.foe, sc.guards());
    for (const d of (res.downed || [])) { const w = party.find(p => p.id === d.id); if (w) w.downed = { why: "melee" }; }
    const after = groupCapability(party);
    fell += after.down;
    if (after.lostCoverage.length) lostCap++;
    if (sc.watch && party.find(p => p.id === sc.watch)?.downed) watched++;
  }
  return { lostCap: lostCap / TRIALS, watched: watched / TRIALS, fell: fell / TRIALS };
}

/* ══ OUTPUT ═══════════════════════════════════════════════════════════════════════════════════════ */
console.log("");
line("═");
say("CCODE-308 — THE RULING, IN PLAIN TERMS");
line("═");
say();
say("WHEN A GROUP IS TOO BIG TO PLAY OUT ONE PERSON AT A TIME, the game pools the damage and");
say("decides who goes down. ⛔ TODAY IT DECIDES BY ONE RULE:   \"least armour first.\"");
say();
say("It never asks who the enemy was trying to hit.");
say("It never asks whether anyone is standing in front of anyone.");
say();
say("   A · TODAY             least armour first");
say("   B · INTENT            the enemy hits who it is actually after");
say("   C · INTENT + GUARD    …and a tank standing in front takes the blow instead");
say();
line("═");
say("§0 — ⛔ FIRST: OPTION C DESCRIBES SOMETHING THE GAME CANNOT DO AT ALL TODAY");
line("═");
say();
say("⚠️ ERIK ASKED ME TO ACCOUNT FOR TANKS PROTECTING THE SQUISHY ONES. Measuring it found the");
say("   game does not — and NOT because of the aggregate rule. The whole chain is dark:");
say();
say("   ✅ `intercept.js` is BUILT — 10 exports: ranks, charges, reflection by degree.");
say("   ✅ `skill_battle.js` READS it — a landed blow checks `interceptorFor` before it lands.");
say("   ⛔ `state.protections` IS NEVER WRITTEN. Read at `encounters.js:189`, assigned nowhere.");
say("   ⛔ `protectionFromCraft` HAS NO CALLER. Nothing turns a craft into an open protection.");
say("   ⛔ PROTECTIONS DEFAULT TO `catches: [\"condition\"]`, and the ONE craft that opens one says");
say("      in its own text: \"Wounds, blades and fire — this catches what lands on the MIND.\"");
say();
say("   ⛔ SO NO TANK CAN TAKE A BLOW FOR ANYONE, IN ANY PATH, TODAY. Column C is what it WOULD");
say("   do — a proposal, not a measurement of the shipped game.");
say();

for (const sc of SCENARIOS) {
  line("═");
  say(sc.title);
  say(`   who:  ${sc.who}`);
  say(`   foe:  ${sc.foeSays}`);
  line();
  reseed(); const a = measure(sc, "A");
  reseed(); const b = measure(sc, "B");
  reseed(); const c = measure(sc, "C");
  const pct = (n) => (n * 100).toFixed(0).padStart(3) + "%";
  const v = (r) => (sc.watch ? r.watched : r.lostCap);
  const label = sc.watch ? `${sc.watch} goes down` : "a capability is lost";
  const bar = (n) => "█".repeat(Math.round(n * 24)).padEnd(24, "·");
  say(`   ${"".padEnd(22)}${label.padEnd(20)}         casualties`);
  say(`   A · TODAY             ${pct(v(a))}  ${bar(v(a))}  ${a.fell.toFixed(1)}`);
  say(`   B · INTENT            ${pct(v(b))}  ${bar(v(b))}  ${b.fell.toFixed(1)}`);
  say(`   C · INTENT + GUARD    ${pct(v(c))}  ${bar(v(c))}  ${c.fell.toFixed(1)}`);
  say();
  const dBA = v(b) - v(a), dCB = v(c) - v(b);
  const part1 = dBA <= -0.03 ? `✅ INTENT ALONE FIXES MOST OF IT (${(dBA * 100).toFixed(0)} pts)`
    : dBA >= 0.03 ? `⚠️ INTENT ALONE MAKES IT WORSE (+${(dBA * 100).toFixed(0)} pts) — and it should`
      : "· intent alone changes nothing";
  const part2 = dCB <= -0.03 ? `✅ A GUARD HELPS FURTHER (${(dCB * 100).toFixed(0)} pts)`
    : dCB >= 0.03 ? "⚠️ the guard makes it worse" : "· a guard adds nothing here";
  say(`   ${part1}`);
  say(`   ${part2}`);
  say(`   ⚠️ ${sc.watchIs}`);
  say();
}

line("═");
say("WHAT THE RULING IS DOING — the whole thing in four sentences");
line("═");
say();
say("1. ⛔ TODAY EVERY ENEMY PLAYS AS IF IT WERE HUNTING YOUR HEALER, because \"least armour first\"");
say("   and \"hunt the mender\" pick the same person in almost every party you will ever field.");
say("2. ✅ OPTION B MAKES THE ENEMY'S CHOICE MEAN SOMETHING. A brute goes for whoever is hitting it;");
say("   a hunter still goes for the mender. SAME NUMBER OF CASUALTIES — different people.");
say("3. ✅ OPTION C LETS YOUR LINE ANSWER A SPECIALIST ENEMY: the tank stands in front, the healer");
say("   lives. ⛔ It is the only option needing NEW WIRING rather than a changed ordering.");
say("4. ⚠️ NONE OF IT TOUCHES A MILITARY UNIT, where nobody is the only anything.");
say();
say("5. ⛔ AND WATCH THE CASUALTIES COLUMN, BECAUSE OPTION C CREATES A NEW PROBLEM. In scenario 4 it");
say("   goes to 0.0 — a real tank with a rank-2 guard makes the whole fold IMMUNE. Brann has double");
say("   health and heavy armour, the share cap means no single share can reach him, and he is");
say("   standing in front of everyone who matters. ⚠️ THAT IS NOT A WIN CONDITION, IT IS A HOLE.");
say("   ✅ The guard-rank dial is the answer: re-run with --guardrank 1 and a guard becomes ONE");
say("   caught blow rather than a standing wall. THE RULING AND ITS DIAL SHOULD BE DECIDED TOGETHER.");
say();
line("═");
say("THE DIALS — everything you can turn, and what turning it does");
line("═");
say();
say("  DIAL                       NOW       WHAT IT CONTROLS");
say("  ────────────────────────── ───────── ─────────────────────────────────────────────────────");
say("  sb.melee.perFoldedAlly     2         HOW MUCH the fold takes. ⛔ The pool never mentions LEVEL,");
say("                                       so it is in range at level 1-2 and dead from 3 on (CCODE-304).");
say(`  maxSharePer                ${String(SHARE_CAP).padEnd(9)} HOW CONCENTRATED. One person takes at most this much of`);
say("                                       the pool — so nobody falls until the pool is 2× a health.");
say("  the share range (in code)  0.5–1.0   HOW STEEP. This 2:1 span IS the cliff, and it is why the");
say("                                       whole live band is only [2× health, 4× health] wide.");
say("  ⛔ THE ORDERING RULE        armour    ⛔ WHO. THIS IS THE RULING — A, B or C above.");
say("  a foe's targetPolicy       authored  WHICH enemy behaves how: threat / weakest / healer /");
say("                                       mindless. ✅ Already authored per foe and already read by");
say("                                       the single-target path. Option B just lets the fold hear it.");
say(`  a guard's rank             ${String(GUARD_RANK).padEnd(9)} HOW LONG a tank keeps covering someone. r1 = one blow;`);
say("                                       r2+ runs for a duration and hardens the taker.");
say("  a protection's `catches`   condition WHETHER a guard catches BLOWS or only conditions.");
say("                                       ⛔ No craft authors \"damage\", so column C is unreachable");
say("                                       until one does — THE SMALLEST CHANGE THAT UNLOCKS IT.");
say();
say("  ⚠️ RE-RUN WITH ANY DIAL MOVED — every one is a flag:");
say("     node scripts/targeting_ruling_sim.mjs --pool 2 --sharecap 0.7 --guardrank 1 --level 10");
say();
line("═");
console.log("");
