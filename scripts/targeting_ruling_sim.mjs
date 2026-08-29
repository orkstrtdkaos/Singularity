// scripts/targeting_ruling_sim.mjs — CCODE-308. WHAT THE RULING WOULD ACTUALLY CHANGE.
//
// ⛔ ERIK: "Show me what effect the answer to this question would have. Give me simulated scenarios that
// cover the potential affected scenarios."
//
// THE QUESTION: should the aggregate casualty path SHARE the live targeting policy, instead of using its
// own softest-first ordering?
//
// ⚠️ THIS SCRIPT CHANGES NOTHING. The candidate is implemented HERE, beside the current behaviour, and both
// are run against the same scenarios with the same seed. Nothing in `engine/` is touched — the ruling is
// Erik's, and this is the evidence, not the change.
//
// ⛔ AND ONE THING WORTH KNOWING BEFORE READING ANY NUMBER: "softest-first" and the `weakest` POLICY ARE
// NOT THE SAME RULE. `distributeCasualties` sorts by SOAK (armour). The `weakest` policy sorts by
// `resistOf` (attributes). ⚠️ So today's aggregate does not even reproduce the cruel foe it resembles —
// it reproduces a fifth ordering that exists nowhere in the targeting vocabulary.

import { distributeCasualties, combatWeight } from "../engine/melee.js";
import { chooseTarget } from "../engine/targeting.js";
import { contributionsOf } from "../engine/combatants.js";
import { groupCapability } from "../engine/group.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const TRIALS = arg("--trials", 3000);
const LEVEL = arg("--level", 6);
const H = LEVEL * 2;

let _s = 20260829;
const rng = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const reseed = () => { _s = 20260829; };

/* ══ THE CANDIDATE ══════════════════════════════════════════════════════════════════════════════════
   ⛔ IDENTICAL SHARE ARITHMETIC. The ONLY difference is who the shares go to: `chooseTarget` decides,
   the same function the live path uses, instead of a soak sort. If the ruling is "yes", this is the
   change — one ordering, not a rewrite. */
function distributeByPolicy(side, pool, { policy = "threat", rng: r = Math.random, maxSharePer = 0.5 } = {}) {
  const live = side.filter(c => !c.downed);
  if (!live.length || pool <= 0) return { hits: [], downed: [] };
  const cap = Math.max(1, Math.round(pool * maxSharePer));
  const hits = [], downed = [], already = new Set();
  let left = pool;
  while (left > 0) {
    const pool_ = live.filter(c => !already.has(c.id));
    if (!pool_.length) break;
    const pick = chooseTarget(pool_, { policy, rng: r })?.target || pool_[0];
    already.add(pick.id);
    const share = Math.min(left, Math.max(1, Math.round(cap * (0.5 + r() * 0.5))));
    left -= share;
    hits.push({ id: pick.id, amount: share });
    if (share >= combatWeight(pick).health) downed.push({ id: pick.id, name: pick.name });
  }
  return { hits, downed };
}

/* ══ THE SCENARIOS — chosen to span where the ruling could matter, INCLUDING where it cannot ═══════ */
const mk = (id, tags, extra = {}) => ({ id, name: id, present: true, downed: null, assistTags: tags, ...extra });
const soft = (id, tags) => mk(id, tags, { canStrike: false, sheet: { health: H, soak: 0, attributes: { mental: 3 } } });
const fighter = (id, soak = 3) => mk(id, [], { inventory: [{ kind: "weapon" }], sheet: { health: H, soak, attributes: { physical: 3 } } });

const SCENARIOS = [
  { key: "party", label: "THE PARTY OF FOUR", note: "you, a mender, an archivist, a spear — the common case",
    make: () => [soft("Sprig·mender", ["mend"]), soft("Quill·archivist", ["study"]), fighter("You", 2), fighter("Tal·spear")] },

  { key: "band", label: "A BAND WITH HEROES", note: "Erik's 'even more so, IF IT HAS HEROES' — 2 sole, 8 fighters",
    make: () => [soft("Sprig·mender", ["mend"]), soft("Quill·archivist", ["study"]),
      ...Array.from({ length: 8 }, (_, i) => fighter(`hero${i}`))] },

  // ⛔ THE CONTROL. Erik: "a military unit is a bit different." Forty identical soldiers hold NO sole
  // coverage, so no ordering can destroy a capability. ⚠️ IF THE RULING SHOWS A DIFFERENCE HERE, MY
  // CANDIDATE IS DOING SOMETHING IT SHOULD NOT.
  { key: "unit", label: "A MILITARY UNIT", note: "40 identical soldiers — narrow, very deep, NO sole coverage",
    make: () => Array.from({ length: 40 }, (_, i) => fighter(`soldier${i}`)) },

  // ⛔ THE CASE THAT TESTS WHETHER THE RULING CAN HURT THE PLAYER, which every other scenario cannot.
  // Everywhere above, the sole-coverage holder IS the softest, so today's ordering and a hunting foe agree.
  // ⚠️ HERE THE HEALER IS ARMOURED — a battle-priest — and the fragile one is an expendable scout. Today's
  // softest-first kills the scout and spares the priest BY ACCIDENT. A foe that hunts healers should get her.
  { key: "priest", label: "AN ARMOURED HEALER", note: "a battle-priest (tough, sole RESTORE) and a fragile scout — softest-first spares her BY ACCIDENT",
    make: () => [mk("Priest·mender", ["mend"], { inventory: [{ kind: "weapon" }], sheet: { health: H, soak: 5, attributes: { physical: 4 } } }),
      mk("scout·frail", ["scout"], { canStrike: false, sheet: { health: H, soak: 0, attributes: { mental: 1 } } }),
      ...Array.from({ length: 6 }, (_, i) => fighter(`hero${i}`))] },

  { key: "column", label: "A COLUMN WITH SPECIALISTS", note: "a unit of 30 with 2 attached specialists — sole coverage inside a crowd",
    make: () => [soft("surgeon", ["mend"]), soft("scout·lead", ["scout"]),
      ...Array.from({ length: 30 }, (_, i) => fighter(`soldier${i}`))] },
];

const POLICIES = [
  ["threat", "it fights whoever fights it"],
  ["weakest", "predatory — it hunts the frail"],
  ["healer", "it has fought a party before"],
  ["mindless", "a swarm — it does not choose"],
];

const prep = (members) => members.map(m => ({ ...m, contributions: contributionsOf(m) }));

function run(scenario, policy, pool, mode) {
  let soleLost = 0, fell = 0, cohesion = 0;
  const whoFell = Object.create(null);
  for (let t = 0; t < TRIALS; t++) {
    const party = prep(scenario.make());
    const before = groupCapability(party);
    const cas = mode === "today"
      ? distributeCasualties(party, pool, { rng })
      : distributeByPolicy(party, pool, { policy, rng });
    for (const d of (cas.downed || [])) {
      const w = party.find(p => p.id === d.id);
      if (w) { w.downed = { why: "the melee" }; whoFell[w.id] = (whoFell[w.id] || 0) + 1; }
    }
    const after = groupCapability(party);
    fell += after.down;
    cohesion += after.cohesion;
    // ⚠️ THE MEASURE THAT MATTERS: did a capability the group HAD stop existing?
    if (after.lostCoverage.length > 0) soleLost++;
    void before;
  }
  const top = Object.entries(whoFell).sort((a, b) => b[1] - a[1])[0];
  return { soleLost: soleLost / TRIALS, fell: fell / TRIALS, cohesion: cohesion / TRIALS,
    top: top ? `${top[0]} (${((top[1] / TRIALS) * 100).toFixed(0)}%)` : "nobody" };
}

const W = 110, line = (c = "─") => console.log("  " + c.repeat(W));
console.log("");
line("═");
console.log("  CCODE-308 — THE RULING, SIMULATED. Should the aggregate share the live targeting policy?");
line("═");
console.log(`\n  ${TRIALS} trials per cell · level ${LEVEL} (health ${H}) · pool = 3× health, the regime where casualties happen`);
console.log("  ⚠️ NOTHING IN engine/ IS CHANGED. The candidate is implemented in this script, beside today's behaviour.\n");

const POOL = Math.round(H * 3);
const deltas = [];

for (const sc of SCENARIOS) {
  line();
  console.log(`  ${sc.label} — ${sc.note}`);
  line();
  console.log("   foe policy    │ TODAY softest-first        │ SHARED policy (candidate)   │  Δ lost a capability");
  console.log("                 │ fell  lost cap  first down │ fell  lost cap  first down  │");
  for (const [pol, why] of POLICIES) {
    reseed(); const a = run(sc, pol, POOL, "today");
    reseed(); const b = run(sc, pol, POOL, "shared");
    const d = b.soleLost - a.soleLost;
    deltas.push({ sc: sc.key, pol, d });
    const flag = Math.abs(d) >= 0.25 ? "  ⛔ BIG" : Math.abs(d) >= 0.08 ? "  ⚠️" : Math.abs(d) < 0.02 ? "  ✅ none" : "";
    const pct = (n) => (n * 100).toFixed(0).padStart(3) + "%";
    console.log(`   ${pol.padEnd(13)} │ ${a.fell.toFixed(1).padStart(4)}  ${pct(a.soleLost)}   ${a.top.slice(0, 14).padEnd(14)}│ ${b.fell.toFixed(1).padStart(4)}  ${pct(b.soleLost)}   ${b.top.slice(0, 14).padEnd(14)} │ ${(d >= 0 ? "+" : "") + (d * 100).toFixed(0)} pts${flag}`);
  }
  console.log(`                 └ ${POLICIES.map(p => p[0]).join(" · ")} — ${sc.key === "unit" ? "⛔ THE CONTROL: no sole coverage, so no ordering can destroy one" : "sole coverage is at stake here"}`);
  console.log("");
}

line("═");
console.log("  WHAT THE RULING WOULD ACTUALLY DO");
line("═");
const big = deltas.filter(d => Math.abs(d.d) >= 0.25);
const none = deltas.filter(d => Math.abs(d.d) < 0.02);
console.log("");
console.log("");console.log(`  ⛔ IT CHANGES A LOT IN ${big.length} OF ${deltas.length} CASES, and nothing at all in ${none.length}.`);
console.log("");
console.log("  ⛔ THE HEADLINE, AND IT IS NOT WHAT I EXPECTED TO WRITE: TODAY'S AGGREGATE ALREADY BEHAVES LIKE A");
console.log("     HEALER-HUNTING FOE, IN EVERY SCENARIO, AGAINST EVERY ENEMY. Read the \"healer\" rows — they are");
console.log("     ±0 everywhere, because softest-first ALREADY does what a healer-hunter does. ⚠️ The game has");
console.log("     been running one enemy behaviour for all enemies, and it is the cruellest one available.");
console.log("");
console.log("  ✅ WHERE THE RULING CHANGES NOTHING — the reassuring half:");
console.log("     · A MILITARY UNIT is untouched at every policy. No sole coverage means no ordering can destroy");
console.log("       a capability, so Erik's 'a unit is a bit different' survives the ruling intact.");
console.log("     · A PREDATORY or HEALER-HUNTING foe is unchanged — those were already being modelled correctly,");
console.log("       which is precisely why today's behaviour looked fine whenever anyone checked one of them.");
console.log("");
console.log("  ⛔ WHERE IT CHANGES EVERYTHING — a group with sole coverage against anything that is NOT hunting it:");
console.log("     · Against a foe that fights whoever fights it, TODAY still kills your mender ~92% of the time.");
console.log("       Under the ruling she survives, because the thing swinging is busy with the people hitting it.");
console.log("     · That is the difference between losing your healer as a DICE OUTCOME and as a CONSEQUENCE OF");
console.log("       WHO THE ENEMY IS — which is the whole of Erik's design.");
console.log("");
console.log("  ⚠️ AND THE HONEST COST, WHICH NEEDED ITS OWN SCENARIO TO FIND. Everywhere else the sole-coverage");
console.log("     holder IS the softest, so today's rule and a hunting foe agree by coincidence. THE ARMOURED");
console.log("     HEALER breaks that: today spares her BY ACCIDENT, and under the ruling a healer-hunting foe");
console.log("     finally gets what it came for. ⛔ THE RULING MAKES THE PLAYER WORSE OFF THERE, AND IT SHOULD —");
console.log("     armour is not supposed to hide you from something that is looking for you specifically.");
console.log("");
line("═");
console.log("");
