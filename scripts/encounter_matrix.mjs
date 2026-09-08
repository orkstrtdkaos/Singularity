// scripts/encounter_matrix.mjs — EVERY ENCOUNTER × EVERY CRAFT, PLAYED THROUGH.
//
// ⛔ ERIK: "run a simulator of each encounter and play through each to use every combination skill we have to
// prove things out."
//
// ⚑ IT DRIVES THE PRODUCTION PATH AND NOTHING ELSE. `battleSkillsForCharacter` builds the menu the panel builds,
// `declFromSelection` builds the declaration the panel builds (including the WOVEN second craft), and `playTurn`
// resolves the turn the app resolves. ⚠️ Erik's rule, 2026-09-05: *harnesses simulate the real game — move play
// logic into the engine, and let app.js and the tests call the same functions.* A harness with its own combat loop
// proves things about the harness.
//
// ⛔ WHAT IT IS LOOKING FOR — and the fourth is the one that matters most:
//   1 · CRASHES              — any craft × encounter pairing that throws
//   2 · UNFINISHABLE fights  — a bout that never ends inside the round cap
//   3 · DEGENERATE fights    — 0% or 100% win rate: a fight with no question in it
//   4 · GENERIC RESOLUTIONS  — a craft that resolves EXACTLY as any craft of that verb would.
//        ⚠️ `battle_test_crafts.mjs` named this and it is the sharpest idea in the repo: *a generic resolution is
//        worse than an inert one, because it looks like it worked.* A craft whose prose promises something
//        specific and whose numbers are its family's default is a lie the gates cannot see.
//   5 · DEAD BRAIDS          — a woven pair that resolves identically to its lead craft alone
//
// USAGE:  node scripts/encounter_matrix.mjs [--fast] [--encounter <id>] [--verbose]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { battleSkillsForCharacter, declFromSelection, playTurn } from "../engine/battle_turn.js";
import { startEncounter, contestSheetFor, skillBattleRound } from "../engine/encounters.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const FAST = argv.includes("--fast");
const VERBOSE = argv.includes("--verbose");
const ONLY = argv.includes("--encounter") ? argv[argv.indexOf("--encounter") + 1] : null;
const MAX_ROUNDS = 14;                     // a fight longer than this is the finding, not the sample
const STALL_AT = 4;                        // ⛑ rounds with NOTHING moving — their pool, the effects, your health
const SAMPLES = FAST ? 3 : 9;              // per craft × encounter — odd, so a majority is never a tie

const CONTENT = await loadContentHeadless();
const sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps, rules = CONTENT.rules;
const catalog = CONTENT.abilities || {};

/** A deterministic stream per (craft, encounter, sample), so a finding can be reproduced exactly. */
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s % 100000) / 100000; };
}
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/** ⚑ A CHARACTER WHO OWNS EVERYTHING — this is a COVERAGE sweep, so the menu must contain every craft. Attributes
 *  are a capable-but-not-absurd mid character, because the question is "does this craft do its thing", not "can a
 *  god win". Energy is topped up between fights: a sweep that runs everyone out of energy measures attrition. */
function makeSweeper() {
  return {
    id: "sim-sweeper", name: "The Sweeper", level: 12,
    attributes: { practical: 5, physical: 5, mental: 5, social: 5 },
    subAttributes: { wits: 5, reason: 5, insight: 5, strength: 5, grace: 5, vitality: 5, presence: 5, will: 5 },
    alignment: {}, health: 80, maxHealth: 80, energy: 200, maxEnergy: 200,
    abilities: Object.keys(catalog).map(id => ({ abilityId: id, level: 2 })),
    inventory: [], codex: { schemaVersion: 1, topics: {} },
  };
}

// ⛔ ASK THE ENGINE WHAT IT CAN RUN, don't infer it from a field. Requiring `e.opponent` silently dropped both
// PUZZLES and both CHALLENGES — the two modes most worth measuring, since only one of the four resolvers reads
// which craft you declared. A puzzle with a STATIC sheet (SNG-247) runs the same contest core a duel does.
const skipped = [];
const runnable = Object.entries(CONTENT.encounters || {})
  .filter(([id, e]) => {
    if (!e || !e.type) { skipped.push([id, "no type — a design note, not an encounter"]); return false; }
    if (ONLY && id !== ONLY) return false;
    if (!contestSheetFor(e, { content: CONTENT })) { skipped.push([id, `type ${e.type} gets no contest sheet — it runs the classic margins path, where the craft you declare is not read`]); return false; }
    return true;
  });

const skillsOf = (c) => battleSkillsForCharacter(c, { catalog, rules, sb });
/** ⚑ BUILT ONCE. Every sweeper is identical, so the menu is too. */
const MENU = skillsOf(makeSweeper());

/** One full bout: declare `skill` (optionally braided with `weave`) every round until it ends or the cap. */
function fight(encId, def, skill, weave, seed) {
  const c = makeSweeper();
  const oppSheet = contestSheetFor(def, { content: CONTENT });
  c.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
  const rng = makeRng(seed);
  // ⚠️ NO MENU REBUILD HERE. `declFromSelection` indexes the menu only when the selection holds NUMBERS; ours
  // holds the skill objects themselves, so a per-fight rebuild was pure cost — O(438) × 46,000 fights.
  const sel = [skill, ...(weave ? [weave] : [])];
  const decl = declFromSelection(sel, MENU, "standard", { character: c, sb });
  if (!decl) return { error: "no declaration" };
  let rounds = 0, ended = false, outcome = null, effectsSeen = new Set(), damageDealt = 0;
  // ⛑ A FIGHT THAT CANNOT MOVE IS THE RESULT, NOT A SAMPLE TO GRIND. Track rounds since anything changed.
  let sinceChange = 0, stalled = false;
  const startHp = c.activeEncounter.state.opponentHealth ?? 0;
  let fxCount = (c.activeEncounter.state.effects || []).length, hpCount = c.health ?? 0;
  try {
    while (rounds < MAX_ROUNDS && !ended) {
      const before = c.activeEncounter.state.opponentHealth ?? 0;
      const played = playTurn(c, def, { action: decl, intensity: "standard", content: CONTENT, rules, sb, steps,
        rng, day: 100, catalog, party: null });
      rounds++;
      const rr = played.rr;
      // ⚠ THE SIGNATURE MUST BE ABLE TO SEE A DIFFERENCE OR IT MANUFACTURES "GENERIC". Recording only side:kind
      // could not distinguish two crafts of one verb — the effect KIND is per-verb, so every persuade looked alike
      // even though `persuade` has crafts at tiers 1, 2 and 4 with authored mechanics. CCODE-77 scales an effect's
      // ROUNDS from the craft's own duration, so carrying value and rounds is what makes tier visible here.
      for (const fx of (rr?.state?.effects || [])) effectsSeen.add(`${fx.side}:${fx.kind}:${fx.value}:${fx.roundsLeft}`);
      damageDealt += Math.max(0, before - (c.activeEncounter.state.opponentHealth ?? 0));
      if (rr?.ended) { ended = true; outcome = rr.outcome || "ended"; }
      if ((c.health ?? 0) <= 0) { ended = true; outcome = outcome || "player_down"; }
      // ⛔ NOTHING MOVED: their pool untouched, no new effect standing, and you are not being worn down either.
      const moved = (c.activeEncounter.state.opponentHealth ?? 0) !== before
        || (rr?.state?.effects || []).length !== fxCount || (c.health ?? 0) !== hpCount;
      fxCount = (rr?.state?.effects || []).length; hpCount = c.health ?? 0;
      sinceChange = moved ? 0 : sinceChange + 1;
      if (sinceChange >= STALL_AT) { stalled = true; break; }
    }
  } catch (err) {
    return { error: String(err?.message || err).slice(0, 160), rounds, stack: String(err?.stack || "").split("\n")[1]?.trim() };
  }
  return { rounds, ended, outcome, stalled, effects: [...effectsSeen], damageDealt, startHp,
    won: /yield|fell|overcome|solved|fled/.test(String(outcome || "")), hpLeft: c.health };
}

/** The signature of a resolution — what actually happened, stripped of prose. Two crafts with the same signature
 *  in the same fight resolved as the SAME MOVE, whatever their names promise. */
const sigOf = (r) => `${r.ended ? 1 : 0}|${r.outcome || "-"}|${r.damageDealt}|${[...r.effects].sort().join(",")}`;

console.log(`ENCOUNTER MATRIX — ${runnable.length} encounter(s) × the full craft menu, ${SAMPLES} sample(s) each`);
console.log(`(driving battleSkillsForCharacter → declFromSelection → playTurn: the production path)\n`);

const crashes = [], unfinished = [], degenerate = [], generics = [], perEnc = [];
const sweeper0 = makeSweeper();
const menu0 = MENU;
console.log(`craft menu: ${menu0.length} declarable rows across ${new Set(menu0.map(s => s.function)).size} functions`);
if (skipped.length) {
  console.log(`⚠️ NOT SWEPT (${skipped.length}) — named rather than quietly absent:`);
  for (const [id, why] of skipped) console.log(`     ${id.padEnd(30)} ${why}`);
}
console.log();

let encN = 0;
for (const [encId, def] of runnable) {
  encN++;
  const t0 = Date.now();
  process.stdout.write(`  [${encN}/${runnable.length}] ${encId} …`);
  const rows = [];
  for (const skill of menu0) {
    let wins = 0, ends = 0, roundsSum = 0, dmg = 0, err = null, stalls = 0;
    const sigs = new Map();
    for (let s = 0; s < SAMPLES; s++) {
      const r = fight(encId, def, skill, null, hash(`${encId}|${skill.id}|${skill.function}|${s}`));
      if (r.error) { err = r; break; }
      if (r.won) wins++;
      if (r.ended) ends++;
      if (r.stalled) stalls++;
      roundsSum += r.rounds; dmg += r.damageDealt;
      const sig = sigOf(r); sigs.set(sig, (sigs.get(sig) || 0) + 1);
    }
    if (err) { crashes.push({ encId, craft: skill.id, fn: skill.function, ...err }); continue; }
    rows.push({ craft: skill.id, fn: skill.function, name: skill.name,
      winRate: wins / SAMPLES, endRate: ends / SAMPLES, stallRate: stalls / SAMPLES, avgRounds: roundsSum / SAMPLES, avgDmg: dmg / SAMPLES,
      sig: [...sigs.entries()].sort((a, b) => b[1] - a[1])[0][0] });
  }
  if (!rows.length) continue;
  // ⛔ TWO DIFFERENT THINGS, AND CONFLATING THEM HIDES BOTH: a fight that runs long, and a declaration that
  // cannot TOUCH the other side. ⚠️ My first form asked whether ANYTHING moved — but the foe hits you every
  // round, so your health always moved and the check could never fire. The real question is one-sided.
  const cannotMove = rows.filter(r => r.avgDmg === 0 && r.endRate === 0);
  if (cannotMove.length) unfinished.push({ encId, n: cannotMove.length, of: rows.length,
    byFn: [...cannotMove.reduce((m, r) => m.set(r.fn, (m.get(r.fn) || 0) + 1), new Map()).entries()].sort((a, b) => b[1] - a[1]) });
  const winRates = rows.map(r => r.winRate);
  const avgWin = winRates.reduce((a, b) => a + b, 0) / rows.length;
  if (avgWin === 0 || avgWin === 1) degenerate.push({ encId, avgWin, n: rows.length });
  // ⛔ GENERIC: crafts of the SAME verb that produced the SAME signature are indistinguishable in play.
  const byFn = new Map();
  for (const r of rows) { const k = r.fn; if (!byFn.has(k)) byFn.set(k, []); byFn.get(k).push(r); }
  for (const [fn, list] of byFn) {
    if (list.length < 2) continue;
    const uniq = new Set(list.map(r => r.sig));
    if (uniq.size === 1) generics.push({ encId, fn, n: list.length, sig: list[0].sig });
  }
  perEnc.push({ encId, crafts: rows.length, avgWin, avgRounds: rows.reduce((a, r) => a + r.avgRounds, 0) / rows.length,
    ended: rows.reduce((a, r) => a + r.endRate, 0) / rows.length });
  console.log(` ${rows.length} crafts · win ${(avgWin * 100).toFixed(0)}% · ends ${(perEnc.at(-1).ended * 100).toFixed(0)}% · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

console.log("── PER ENCOUNTER ──");
console.log("encounter".padEnd(32) + "crafts  avg win  avg rounds  ends within cap");
for (const p of perEnc)
  console.log(p.encId.padEnd(32) + String(p.crafts).padStart(6) + `${(p.avgWin * 100).toFixed(0)}%`.padStart(9)
    + p.avgRounds.toFixed(1).padStart(12) + `${(p.ended * 100).toFixed(0)}%`.padStart(17));

console.log(`\n── FINDINGS ──`);
console.log(`⛔ crashes                : ${crashes.length}`);
for (const c of crashes.slice(0, 10)) console.log(`     ${c.encId} × ${c.craft} (${c.fn}) — ${c.error}  ${c.stack || ""}`);
if (crashes.length > 10) console.log(`     … and ${crashes.length - 10} more`);
console.log(`⛔ encounters carrying a declaration that never TOUCHED them and never ended a bout : ${unfinished.length}`);
for (const u of unfinished) console.log(`     ${u.encId}: ${u.n}/${u.of} declarations — by verb: ${u.byFn.map(([f, n]) => `${f}×${n}`).join(", ")}`);
console.log(`⛔ degenerate encounters (0% or 100% across every craft) : ${degenerate.length}`);
for (const d of degenerate) console.log(`     ${d.encId}: win ${(d.avgWin * 100).toFixed(0)}% over ${d.n} crafts`);
console.log(`⚠️ GENERIC verb groups (every craft of that verb resolved identically) : ${generics.length}`);
const genByFn = new Map();
for (const g of generics) genByFn.set(g.fn, (genByFn.get(g.fn) || 0) + 1);
for (const [fn, n] of [...genByFn.entries()].sort((a, b) => b[1] - a[1]))
  console.log(`     ${fn.padEnd(12)} identical in ${n} encounter(s)`);

/* ═════ THE BRAID PASS — every COMBINATION, played ═════ */
// ⛔ CCODE-37 IS THE PAYOFF AND THIS IS WHERE IT IS PROVED: "a woven round lands the SECOND craft's effect too, so
// one turn leaves two things standing… turn-by-turn forces one move per turn, and a weave is how a practised
// pairing beats that limit." ⚠️ If a braid resolves exactly as its lead craft alone, that payoff is not landing.
const braidFindings = { dead: [], ran: 0, pairs: 0 };
{
  const byFn = new Map();
  for (const sk of menu0) if (!byFn.has(sk.function)) byFn.set(sk.function, sk);   // one representative per verb
  const verbs = [...byFn.keys()].sort();
  const arena = runnable.find(([id]) => id === "duel_redline_challenge") || runnable[0];
  if (arena) {
    const [arenaId, arenaDef] = arena;
    console.log(`\n── BRAID PASS — ${verbs.length} verbs × ${verbs.length} in ${arenaId} ──`);

    // ⛔ SEVERAL INDEPENDENT STREAMS, AND THE WEAVE MUST CHANGE NOTHING IN ALL OF THEM. One sample cannot tell a
    // dead braid from a coincidence, and a harness that manufactures findings is worse than one that misses them.
    const BRAID_SAMPLES = 3;
    const soloSigs = new Map();
    for (const v of verbs) soloSigs.set(v, Array.from({ length: BRAID_SAMPLES },
      (_, i) => { const r = fight(arenaId, arenaDef, byFn.get(v), null, hash(`solo|${v}|${i}`)); return r.error ? `ERR:${r.error}` : sigOf(r); }));
    for (const lead of verbs) for (const second of verbs) {
      if (lead === second) continue;
      braidFindings.pairs++;
      let identicalEvery = true, failed = false;
      for (let i = 0; i < BRAID_SAMPLES; i++) {
        const r = fight(arenaId, arenaDef, byFn.get(lead), byFn.get(second), hash(`braid|${lead}|${second}|${i}`));
        if (r.error) { crashes.push({ encId: arenaId, craft: `${lead}⋈${second}`, fn: "braid", error: r.error, stack: r.stack }); failed = true; break; }
        if (sigOf(r) !== soloSigs.get(lead)[i]) { identicalEvery = false; break; }   // ⚑ one difference is enough to live
      }
      if (failed) continue;
      braidFindings.ran++;
      if (identicalEvery) braidFindings.dead.push({ lead, second });
    }
    const deadByLead = new Map();
    for (const d of braidFindings.dead) deadByLead.set(d.lead, (deadByLead.get(d.lead) || 0) + 1);
    console.log(`   braids played: ${braidFindings.ran} of ${braidFindings.pairs}`);
    console.log(`   ⛔ DEAD BRAIDS (the weave resolved exactly as the lead craft alone): ${braidFindings.dead.length}`);
    for (const [lead, n] of [...deadByLead.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12))
      console.log(`      lead ${lead.padEnd(12)} the weave changed nothing for ${n}/${verbs.length - 1} partners`);
  }
}

writeFileSync(join(root, "tests/encounter_matrix.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), samples: SAMPLES, maxRounds: MAX_ROUNDS,
    perEnc, crashes, unfinished, degenerate, generics: [...genByFn.entries()], braids: braidFindings }, null, 1));
console.log(`\nwrote tests/encounter_matrix.json`);
