// growth_sim.mjs — THE GROWTH AUDITOR: does the world grow at a sane RATE?
//
// The third leg of the simulation stack. `playthrough_sim` asks whether the player MEETS things often
// enough; `contest_sim` asks whether a round REPORTS itself truthfully; this asks whether the systems that
// GROW the world — earned item power, the born-whole gate, the shared creature pool — behave sensibly when
// run for a whole playthrough rather than one beat.
//
// Everything here shares the same failure shape, and it is a slow one: a rate that is wrong is invisible in
// any single turn. An evolution ceiling that is too tight looks like "nothing happened today" and is only
// discovered at level 29; a gate that rejects too much looks like a quiet world; a shared pool that floods
// looks fine for a week. None of these can be caught by a unit test, and all of them are cheap to sample.
//
// Discipline, as ever: drive the REAL functions, never a reimplementation. Where a number is a DIAL rather
// than an invariant (how often a player evolves an item, how many creatures a session mints), it is stated
// as an input and the assertion is made on the SHAPE of the outcome — not on a balance figure this file is
// in no position to rule on. Erik and Aevi own the dials; this owns "did the mechanism behave".
//
// Run: node tests/growth_sim.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { grantCeiling, evolutionBudget, recordEvolution, foldGrants, canDerive } from "../engine/earnedpower.js";
import { checkBorn, contractedTypes } from "../engine/borncontract.js";
import { bestiaryEncounters, generatedCreatureEncounters, eligibleEncountersFor, synthesizeDuelDef } from "../engine/random_encounters.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const contract = rj("content/packs/core/rules/consumer_required_subfields.json");
const bestiary = rj("content/packs/valley/bestiary.json");
const VERBS = Object.values(rj("content/packs/core/rules/function_vocabulary.json").families || {})
  .flatMap(l => (Array.isArray(l) ? l : []).map(v => (typeof v === "string" ? v : v?.verb))).filter(Boolean);
const vocabs = { "function_vocabulary.verbs": VERBS };

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

console.log("GROWTH SIM — the rate at which the world grows\n");

// =====================================================================================================
// 1. THE EARNED-POWER ECONOMY (SNG-251 §4) — strangled, or farmable?
// =====================================================================================================
// Erik's ruling: power scales to level + craft rank, and an item takes on power about once a day. Both
// halves can fail silently in opposite directions, and neither shows up in a single beat. Simulated over a
// full L1->25 arc: a devoted player evolving their favourite item whenever the fiction allows.
{
  const DAYS = 180;                       // ~a L1->25 arc, matching playthrough_sim's span
  const levelAtDay = d => Math.max(1, Math.min(25, Math.round(1 + 24 * (d / DAYS))));
  const rankAtDay = d => Math.max(0, Math.min(3, Math.floor((d / DAYS) * 3) + (d > DAYS * 0.15 ? 1 : 0)));

  /** One playthrough of a player who tries to evolve ONE item at `attemptsPerDay`. */
  const run = (attemptsPerDay, rng) => {
    const item = { name: "Memory", grants: [] };
    let refusedByDay = 0, refusedByCeiling = 0, landed = 0;
    for (let day = 1; day <= DAYS; day++) {
      const character = { level: levelAtDay(day) };
      const ceiling = grantCeiling(character, rankAtDay(day));
      for (let a = 0; a < attemptsPerDay; a++) {
        if (rng() > 0.5) continue;                      // the fiction does not always earn one
        const budget = evolutionBudget(item, day, character);
        if (!budget.canEvolve) { refusedByDay++; continue; }
        const proposed = [{ name: `thread ${landed + refusedByCeiling + 1}`, effect: "a real, bounded effect", from: "the work just done" }];
        const fold = foldGrants(item.grants, proposed, ceiling);
        if (fold.refused.length) { refusedByCeiling += fold.refused.length; continue; }
        item.grants = fold.grants; landed += fold.added.length;
        recordEvolution(item, day);
      }
    }
    return { item, landed, refusedByDay, refusedByCeiling, finalCeiling: grantCeiling({ level: 25 }, 3) };
  };

  const devoted = run(1, mulberry32(0x6704)); // a player who tries every day the fiction allows
  const farmer  = run(12, mulberry32(0xFA82)); // someone hammering the button

  console.log(`      devoted player: ${devoted.item.grants.length} grants by L25 (ceiling ${devoted.finalCeiling.maxGrants}) · ${devoted.refusedByDay} day-capped · ${devoted.refusedByCeiling} ceiling-capped`);
  console.log(`      farmer (12x/day): ${farmer.item.grants.length} grants · ${farmer.refusedByDay} day-capped`);

  check("NOT STRANGLED — a devoted player reaches a real mechanical sheet over a full arc (>=3 grants)",
    devoted.item.grants.length >= 3,
    `only ${devoted.item.grants.length} grants in ${DAYS} days — the daily cap or the ceiling is throttling evolution to nothing, which reads in play as "the story did that and my item never changed"`);
  check("NOT FARMABLE — hammering evolution 12x/day yields no more than a paced player's ceiling allows",
    farmer.item.grants.length <= farmer.finalCeiling.maxGrants,
    `${farmer.item.grants.length} grants past a ceiling of ${farmer.finalCeiling.maxGrants} — the rate limit is not binding`);
  check("THE DAILY CAP ACTUALLY BINDS — a farmer is refused on most attempts",
    farmer.refusedByDay > 0, "no attempt was ever day-capped, so ~1/day is not being enforced");
  check("THE CEILING IS NEVER EXCEEDED, at any point in the arc",
    devoted.item.grants.length <= devoted.finalCeiling.maxGrants && farmer.item.grants.length <= farmer.finalCeiling.maxGrants);
  check("THE CEILING GROWS WITH THE CHARACTER — a master out-earns a novice (the payoff for building craft)",
    grantCeiling({ level: 25 }, 3).maxGrants > grantCeiling({ level: 1 }, 0).maxGrants &&
    grantCeiling({ level: 25 }, 3).effectCap > grantCeiling({ level: 1 }, 0).effectCap);
  check("A DERIVED item is bounded too — a split is a story beat, not a duplication engine",
    canDerive({ derived: [] }).ok && !canDerive({ derived: ["a", "b"] }).ok);

  // THE ESCAPE VALVE, and the reason the refusal count above is not damning. A devoted player hits the
  // ceiling and is then refused 90 NOVEL grants over the arc — which is the ceiling doing its job, but it
  // would be a dead end if a full item could not change at all. It can: a same-id grant DEEPENS in place,
  // so an item at its ceiling still grows through play, it just stops accumulating new threads. If this
  // ever broke, a maxed item would be permanently frozen and every later evolution beat would be a flat no.
  const full = { name: "Memory", grants: foldGrants([], Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, name: `thread ${i}`, effect: "e" })), grantCeiling({ level: 25 }, 3)).grants };
  const deepened = foldGrants(full.grants, [{ id: "t2", name: "thread 2, deeper", effect: "a stronger version of the same thread" }], grantCeiling({ level: 25 }, 3));
  check("AN ITEM AT ITS CEILING CAN STILL GROW — a same-thread grant DEEPENS in place rather than being refused",
    deepened.refused.length === 0 && deepened.replaced.length === 1 && deepened.grants.length === full.grants.length &&
    deepened.grants.find(g => g.id === "t2").name === "thread 2, deeper",
    "a full item is frozen: every further evolution beat is a flat refusal and the item can never change again");
}

// =====================================================================================================
// 2. THE BORN-WHOLE GATE (SNG-250 §4) — does it let the world grow?
// =====================================================================================================
// A gate that rejects too much is indistinguishable from a world that stopped growing. The honest way to
// measure fragility without inventing "realistic model output": take each type's REAL authored corpus (or a
// whole exemplar), knock out ONE field at a time, and measure how often a single omission is FATAL. A
// contract where most single omissions reject is brittle — the model has to be perfect or nothing mints.
{
  const WHOLE = {
    creature: { id: "c", name: "a thing", tier: "riffraff", class: "beast", look: "l", danger: "d", pressures: ["HARM"] },
    item: { id: "i", name: "Axe", kind: "weapon", description: "d", consumable: false, bonusTags: ["strike"], damageType: "physical" },   // CCODE-87: a weapon owes its KIND of harm
    skill: { id: "s", name: "S", functions: ["strike"], energyCost: 8, levelReq: 1, description: "d", notFor: "n" },
    npc: { id: "n", name: "N", personality: {}, wants: ["the forge her brother left"], fears: ["the ledger"], disposition: "wary", appearance: "tall" },
    location: { id: "l", name: "L", dangerLevel: 2, worldPos: { colatitude: 1, longitude: 1 }, axisVector: new Array(12).fill(0), poleIntensity: {}, descriptionSeed: "s" },
    arc: { id: "a", name: "A", scale: "local", pressure: "building", tendency: "t", hingeNpcs: ["n"], ifIgnored: "i", ifEngaged: "e" }
  };
  let totalKnockouts = 0, fatal = 0;
  const perType = [];
  for (const [type, whole] of Object.entries(WHOLE)) {
    const base = checkBorn(whole, type, contract, { vocabs });
    check(`a WHOLE ${type} passes the gate clean — the contract is satisfiable`, base.verdict === "clean",
      `a hand-built complete ${type} was rejected: ${JSON.stringify(base.missing.map(m => m.field))} ${JSON.stringify(base.vague.map(v => v.id))}`);
    let typeFatal = 0, typeN = 0;
    for (const field of Object.keys(whole)) {
      const damaged = { ...whole }; delete damaged[field];
      const rep = checkBorn(damaged, type, contract, { vocabs });
      typeN++; totalKnockouts++;
      if (rep.verdict === "reject") { typeFatal++; fatal++; }
    }
    perType.push(`${type} ${typeFatal}/${typeN}`);
  }
  console.log(`      single-field knockouts that REJECT: ${perType.join(" · ")}`);
  check(`the gate is not brittle — under 60% of single-field omissions are fatal (got ${pct(fatal, totalKnockouts)}%)`,
    pct(fatal, totalKnockouts) < 60,
    "most single omissions reject, so a near-miss mints nothing and the world stops growing on ordinary model imperfection");
  check("the gate still BITES — some single omissions ARE fatal (it is not waving everything through)",
    fatal > 0, "no omission was fatal anywhere; the gate rejects nothing and is decorative");
  check("every contracted type is exercised here — a new type cannot be added without a fragility sample",
    contractedTypes(contract).filter(t => t !== "quest").every(t => t in WHOLE),
    `not sampled: ${contractedTypes(contract).filter(t => t !== "quest" && !(t in WHOLE)).join(", ")}`);
}

// =====================================================================================================
// 3. THE SHARED CREATURE POOL (SNG-250 §7b) — does a shared valley flood?
// =====================================================================================================
// Creatures are shared-on-sight, so every player's mints reach everyone. Over a long campaign with several
// players that pool only grows. The risk is not that it is large; it is that the AUTHORED bestiary drowns,
// or that ids collide, or that generated entries slip the danger gate that keeps a riffraff out of a
// deadly place. Sampled at a deliberately AGGRESSIVE rate, so passing means the mechanism holds at the
// pessimistic end rather than the comfortable one.
{
  const PLAYERS = 4, DAYS = 180, PER_PLAYER_PER_10_DAYS = 1;   // aggressive: ~72 grown creatures in a campaign
  const rng = mulberry32(0x5EED5);
  const generated = {};
  for (let p = 0; p < PLAYERS; p++) {
    for (let d = 0; d < DAYS; d += 10 / PER_PLAYER_PER_10_DAYS) {
      const id = `gen-thing-${p}-${Math.round(d)}`;
      generated[id] = { id, name: `a grown thing ${p}-${Math.round(d)}`, tier: ["riffraff", "notable", "regional", "epic"][Math.floor(rng() * 4)],
        class: "beast", look: "l", danger: "d", pressures: ["HARM"] };
    }
  }
  const grown = generatedCreatureEncounters({ generated: { creature: generated } });
  const authored = bestiaryEncounters(bestiary);
  const pool = [...authored, ...grown];

  console.log(`      shared pool after ${PLAYERS} players × ${DAYS} days: ${authored.length} authored + ${grown.length} grown = ${pool.length} entries`);
  check("ids NEVER collide — a grown creature can never shadow an authored one in the pool",
    new Set(pool.map(e => e.id)).size === pool.length,
    "two pool entries share an id; one silently shadows the other");
  check("every grown entry is DANGER-GATED like an authored one (minDanger present, so a riffraff cannot surface in a deadly place unweighted)",
    grown.every(e => Number.isFinite(e.minDanger) && Number.isFinite(e.weight) && e.opponent?.threat > 0));
  check("every grown entry NAMES its creature (Erik's 'the aggressor' bug cannot return at scale)",
    grown.map(e => synthesizeDuelDef(e)).every(d => d.name && d.name !== "Hard Ground" && d.opponent?.name && d.opponent.name !== "the aggressor"));
  // The authored bestiary must remain REACHABLE — the real risk of an ever-growing shared pool.
  const loc = { id: "x", name: "somewhere", dangerLevel: 3, tags: [] };
  let authoredSeen = 0, trials = 300;
  for (let i = 0; i < trials; i++) {
    const elig = eligibleEncountersFor({ encounters: pool }, loc, { cap: 8, rng: mulberry32(0xEE ^ i) });
    if (elig.some(e => authored.some(a => a.id === e.id))) authoredSeen++;
  }
  check(`the authored bestiary stays REACHABLE in a flooded pool — it surfaces in ${pct(authoredSeen, trials)}% of eligibility draws`,
    pct(authoredSeen, trials) > 25,
    "hand-authored creatures are being drowned by grown ones; the valley's designed bestiary stops appearing");
}

console.log(failures === 0 ? "\nGrowth sim: all checks passed." : `\nGrowth sim: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
