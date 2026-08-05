// tests/player_lives.mjs — SNG-308: run a lot of lives and see what happens to them.
//
// Erik: *"a potential run through of a simulated player… it would be interesting to see what happens — how
// many die at what levels, how many had big impacts on the world, all the things we're counting."*
//
// ⚠️ THE FIRST ANSWER IS A DESIGN LAW, NOT A NUMBER: **the engine never kills a player.** `encounters.js`
// line 6 — *"Incapacitation, never engine-imposed death."* Losing takes you to `health <= 0` and
// `checkIncapacitation` returns `"incapacitated"`; nothing in the engine turns that into a death. So "how
// many die at what levels" has the structural answer ZERO, and the honest version of the question is **how
// often does the world put a player on the floor, and at what level does it stop being able to.**
//
// The two halves this reports are different questions and they are measured differently:
//
//   A. LIVES — real `battleRound` calls against level-appropriate opposition, tracking health across a
//      lifetime. Answers: how often is a player floored, at what levels, and when does it stop happening?
//   B. MARKS ON THE WORLD — the same players acting on arcs while the WORLD ENGINE runs. Answers: how much
//      of the world's history has this player's fingerprints on it?
//
// ⛔ THE IMPACT MEASURE IS THE ENGINE'S OWN, NOT ONE I INVENTED FOR THE REPORT. `creditDeed` already stamps
// `playerTouched` on a figure's tenure when the player was pushing the same arc as the deed that raised them
// (SNG-279). Counting those is asking the world engine what it already believes, rather than scoring the
// player against a yardstick this file made up.
//
// ⛔ A REPORT. Runs throwaway worlds in memory, writes no save, gates nothing.
//
// Run: node tests/player_lives.mjs [lives] [worldDays]

import { loadContentHeadless } from "./headless_content.mjs";

const LIVES = Number(process.argv[2]) || 40;
const DAYS = Number(process.argv[3]) || 1460;
const DAY_MS = 24 * 3600000;                 // ⚠️ REAL DAYS — world time is wall-clock-derived

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState, worldArcsPublic } = await import("../engine/worldtick.js");
const { battleRound } = await import("../engine/skill_battle.js");
const { checkIncapacitation } = await import("../engine/encounters.js");

const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const ARCS = [...new Set(ROSTER.flatMap(f => [f.arcAffinity?.arcId, ...(f.arcAffinities || []).map(a => a?.arcId)]).filter(Boolean))];
const sb = CONTENT.skillBattle, rules = CONTENT.rules, steps = CONTENT.steps;
const seeded = s => { let x = s >>> 0; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; };
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const sd = a => { const m = mean(a); return a.length < 2 ? 0 : Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

// ── A. LIVES ──────────────────────────────────────────────────────────────────────────────────────────────
/** A sheet at a level. Kept deliberately plain: this measures what the ROUND MODEL does to a player over a
 *  lifetime, and dressing the sheet in gear would measure the gear instead. */
const sheetAt = (level) => ({
  level, energy: 100,
  attributes: { physical: 8 + level * 0.4, mental: 8 + level * 0.4, social: 8 + level * 0.3, practical: 8 + level * 0.3 },
});
/** Opposition that scales WITH the player, so the question is "does the round model floor people" rather
 *  than "did I pick a hard monster". A flat-difficulty opponent would answer a different question. */
const oppAt = (level, edge) => ({
  level: level + edge, energy: 100,
  attributes: { physical: 8 + (level + edge) * 0.4, mental: 8 + (level + edge) * 0.4,
    social: 8 + (level + edge) * 0.3, practical: 8 + (level + edge) * 0.3 },
});

const FUNCS = ["strike", "guard", "reveal", "conceal", "press", "endure"];
function fightOne(level, edge, rng) {
  const playerSheet = sheetAt(level), oppSheet = oppAt(level, edge);
  let state = { momentum: 0 }, health = 100, rounds = 0;
  while (rounds < 12 && health > 0) {
    rounds++;
    const r = battleRound({
      playerDecl: { function: FUNCS[Math.floor(rng() * FUNCS.length)], tier: 2 + Math.floor(rng() * 2),
        attribute: ["physical", "mental", "social", "practical"][Math.floor(rng() * 4)], intensity: "standard", name: "a move" },
      oppDecl: { function: FUNCS[Math.floor(rng() * FUNCS.length)], tier: 2 + Math.floor(rng() * 2),
        attribute: ["physical", "mental", "social", "practical"][Math.floor(rng() * 4)], intensity: "standard", name: "a move" },
      playerSheet, oppSheet, state, rules, sb, steps, rng,
    });
    state = r.state || state;
    // ⚠️ THE ENGINE DOES NOT WRITE PLAYER HEALTH — skill_battle.js:901 is explicit that "the PLAYER's health
    // is the app's to apply (checkIncapacitation owns that exit)". So the harness plays the app's part, and
    // that is a MODELLING CHOICE this report has to own: a lost round costs health. If the real app costs a
    // different amount, this whole section moves with it.
    if (r.roundWinner && r.roundWinner !== "player") health -= 12;
    // ⛔ NO INVENTED EXIT. My first version broke the loop at |momentum| >= 10 and printed a "rounds to
    // settle" column — which reported nothing but my own round cap (11.9 of 12, every level, every gap) and
    // read like a finding about indecisive fights. There IS no momentum threshold in `battleRound`; the real
    // exit is the ENCOUNTER's, `sb.kinds[kind]` (SNG-247), one layer up from what this measures. A number
    // produced entirely by a constant I chose is not a measurement, and printing it beside real ones borrows
    // their credibility.
  }
  return { health, incapacitated: checkIncapacitation({ health }) === "incapacitated", rounds };
}

console.log(`SIMULATED LIVES (SNG-308) — ${LIVES} players\n`);
console.log(`  ⚠️ THE ENGINE NEVER KILLS A PLAYER. \`encounters.js\`: "Incapacitation, never engine-imposed`);
console.log(`     death." So "how many die" is structurally ZERO, and what follows is how often the world`);
console.log(`     puts a player on the floor instead.\n`);
console.log(`  A. BEING FLOORED, BY LEVEL — real battleRound calls, opposition scaled to the player\n`);
console.log(`    ${"level".padStart(5)}  ${"even fight".padStart(11)}  ${"+3 over you".padStart(12)}  ${"+6 over you".padStart(12)}   median health left`);
const FIGHTS = 200;
for (const level of [1, 5, 10, 15, 20, 25]) {
  const rate = (edge) => {
    const rng = seeded(4242 + level * 31 + edge);
    let n = 0; const left = [];
    for (let i = 0; i < FIGHTS; i++) { const f = fightOne(level, edge, rng); if (f.incapacitated) n++; left.push(f.health); }
    left.sort((a, b) => a - b);
    // How much of a player is left at the end of a fixed exchange — a real output of the round model,
    // unlike a round count that only ever reports the cap this harness imposes.
    return { pct: (100 * n) / FIGHTS, health: left[Math.floor(left.length / 2)] };
  };
  const a = rate(0), b = rate(3), c = rate(6);
  console.log(`    ${String(level).padStart(5)}  ${a.pct.toFixed(1).padStart(10)}%  ${b.pct.toFixed(1).padStart(11)}%  ${c.pct.toFixed(1).padStart(11)}%   ${String(a.health).padStart(10)}`);
}

// ── B. MARKS ON THE WORLD ─────────────────────────────────────────────────────────────────────────────────
console.log(`\n  B. MARKS ON THE WORLD — the same lives, lived alongside the world engine (${DAYS} world-days each)\n`);

async function liveOne(seed, style) {
  const rng = seeded(seed);
  const character = { name: `P${seed}`, level: 8, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [], worldState: initWorldState(1) };
  delete character.worldState.lastTickWorldDay;
  const ws = character.worldState;
  const stub = async ({ entities }) => ({ developments: entities.map(e => ({ entityId: e.id, note: "turned", outcome: "progress" })) });
  const touchedArcs = new Set();
  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += 7) {
    // ⚠️ `ws.arcStages[arcId].push` IS THE REAL FIELD the world engine reads for the player's own weight
    // (`arcPushes(...).mine`), which is how `playerOnArc` decides whether to stamp a deed as player-touched.
    // Writing anything else here would measure a field nobody reads.
    if (style.actsPerWeek > 0 && rng() < style.actsPerWeek) {
      const arcId = style.focused
        ? ARCS[seed % ARCS.length]                                  // a player with ONE cause
        : ARCS[Math.floor(rng() * ARCS.length)];                    // a player who goes where the trouble is
      ws.arcStages = ws.arcStages || {};
      const cur = ws.arcStages[arcId] || { push: 0, othersPush: 0 };
      cur.push = (cur.push || 0) + (style.focused ? 1 : (rng() < 0.5 ? 1 : -1));
      ws.arcStages[arcId] = cur;
      touchedArcs.add(arcId);
    }
    await advanceGeneratedOffscreen({ character, content: CONTENT, evolveFn: stub, rng, now: t0 + d * DAY_MS });
  }
  const tenure = ws.figureTenure || {};
  // ⛔ THE ENGINE'S OWN VERDICT, not a yardstick invented here: `playerTouched` is stamped by `creditDeed`
  // when the player was pushing the same arc as the deed that raised somebody (SNG-279).
  const touchedFigures = Object.values(tenure).filter(t => t.playerTouched).length;
  const arcs = worldArcsPublic(CONTENT, character) || [];
  const contestedTouched = arcs.filter(a => touchedArcs.has(a.arcId) && a.contested).length;
  return {
    touchedFigures, arcsTouched: touchedArcs.size, contestedTouched,
    stageSum: arcs.reduce((s, a) => s + (a.stageNum || 0), 0),
    mythics: Object.values(tenure).filter(t => t.tier === "mythic").length,
  };
}

const STYLES = [
  ["a bystander (never acts)", { actsPerWeek: 0, focused: false }],
  ["one cause, every week", { actsPerWeek: 1, focused: true }],
  ["one cause, now and then", { actsPerWeek: 0.25, focused: true }],
  ["wherever trouble is", { actsPerWeek: 1, focused: false }],
];

console.log(`    ${"playstyle".padEnd(26)} ${"figures they touched".padStart(20)}  ${"arcs".padStart(6)}  ${"contested".padStart(10)}  ${"world mythics".padStart(13)}`);
const results = {};
for (const [label, style] of STYLES) {
  const runs = [];
  for (let i = 0; i < Math.max(4, Math.round(LIVES / 4)); i++) runs.push(await liveOne(7000 + i * 7919, style));
  results[label] = runs;
  const tf = runs.map(r => r.touchedFigures);
  console.log(`    ${label.padEnd(26)} ${mean(tf).toFixed(1).padStart(12)} ±${sd(tf).toFixed(1).padEnd(6)} ${mean(runs.map(r => r.arcsTouched)).toFixed(1).padStart(6)}  ${mean(runs.map(r => r.contestedTouched)).toFixed(1).padStart(10)}  ${mean(runs.map(r => r.mythics)).toFixed(1).padStart(13)}`);
}

// The distribution Erik asked for: how many lives left a big mark, and how many left none?
const active = results["wherever trouble is"] || [];
const all = Object.entries(results).filter(([k]) => k !== "a bystander (never acts)").flatMap(([, v]) => v);
const none = all.filter(r => r.touchedFigures === 0).length;
const big = all.filter(r => r.touchedFigures >= 10).length;
console.log(`\n    of ${all.length} lives that ACTED: ${none} left no mark on any figure · ${big} touched 10 or more`);
console.log(`    bystanders touched ${mean((results["a bystander (never acts)"] || []).map(r => r.touchedFigures)).toFixed(1)} figures — the control, and it should be 0`);

console.log(`\n  ⛔ A REPORT — throwaway worlds in memory, no save written. Quote it WITH the date you ran it.`);
console.log(`  ⚠️ Part A models the APP's health rule (a lost round costs 12), because the engine deliberately`);
console.log(`     does not write player health — skill_battle.js:901. If the app costs differently, A moves.`);
