// tests/holding_effect.mjs — SNG-304: does `heldTheLine` fire, and does it close the gap it was built for?
//
// Aevi's diagnosis (engagement_and_holding.json): "the deed ledger had seven sources, six combat-shaped, and
// the only non-combat one fires ONLY when holding COST YOU YOUR PERSONAL TIME — you were paid for sacrifice,
// never for work. Meanwhile `applyEpicArcPush` shows that LEANING is what actually moves arcs, every pass,
// for every figure. THE LEDGER REWARDED THE AMPLIFIER AND IGNORED THE ENGINE."
//
// That is a claim with two testable halves, and BOTH have to be checked:
//
//   1. DOES IT FIRE AT ALL? A streak that never reaches its threshold in a real world is an unreachable
//      VALUE of a field the engine reads — the sixth door of the PromisedButUnread family, and the kind that
//      passes every unit test ever written for it. `holdEdge(5) === 1.5` proves arithmetic, not reachability.
//   2. DOES IT CLOSE THE GAP? SNG-300 measured marcher figures rising 50% of the time against stillhold's 8%
//      under a contest-weighted deed table. If constancy pays, that gap should narrow — and if it does not,
//      the mechanic is real and the diagnosis was wrong, which is worth knowing either way.
//
// ⛔ AND THE GUARD ON IT (DIRECTIVE SNG-280): `heldTheLine` must NOT be a peaceful-figure prize. A marcher
// who holds one front for five passes must earn it identically. So this also reports WHO earns it — if the
// list is all one temperament, the mechanic is encoding a value and Aevi and I both need to see that.
//
// A REPORT. Reads content, writes nothing, gates nothing.
//
// Run: node tests/holding_effect.mjs [runs] [worldDays]

import { loadContentHeadless } from "./headless_content.mjs";

const RUNS = Number(process.argv[2]) || 6;
const DAYS = Number(process.argv[3]) || 1460;      // ~4 world years
const DAY_MS = 24 * 3600000;                       // ⚠️ REAL DAYS — world time is wall-clock-derived

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState, DEED_WEIGHTS } = await import("../engine/worldtick.js");

const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const byId = new Map(ROSTER.map(f => [f.id, f]));
const tradOf = id => byId.get(id)?.tradition || byId.get(id)?.legend?.tradition || "(minted)";
const LADDER = ["riffraff", "notable", "heroic", "epic", "legendary", "mythic"];
const rungOf = t => LADDER.indexOf(t === "regional" ? "heroic" : t);

function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

const sources = {};                       // deed source -> times credited
const earners = {};                       // tradition -> heldTheLine credits
const roseBy = {}, sawBy = {};            // tradition -> rises / figures observed
let peakStreak = 0, everHeld = 0;

for (let run = 0; run < RUNS; run++) {
  const rng = seeded(9000 + run * 7919);
  const character = { name: `W${run}`, level: 6, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [], worldState: initWorldState(1) };
  delete character.worldState.lastTickWorldDay;
  const stub = async ({ entities }) => ({ developments: entities.map(e => ({ entityId: e.id, note: "the world turned", outcome: "progress" })) });

  const startTier = new Map(ROSTER.map(f => [f.id, f.tier || f.legend?.tier || null]));
  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += 7) {
    await advanceGeneratedOffscreen({ character, content: CONTENT, evolveFn: stub, rng, now: t0 + d * DAY_MS });
    const w = character.worldState;
    for (const held of Object.values(w?.careHeld || {}))
      for (const n of Object.values(held)) { if (n > peakStreak) peakStreak = n; if (n > 0) everHeld++; }
  }

  // The deed LOG is bounded (last 12), so it undercounts a long run — but it is the only per-source record
  // there is, and it is honest about being a sample. Stated rather than quietly presented as a total.
  const w = character.worldState;
  for (const [id, t] of Object.entries(w?.figureTenure || {})) {
    for (const d of t.deedLog || []) {
      sources[d.by] = (sources[d.by] || 0) + 1;
      if (d.by === "heldTheLine") earners[tradOf(id)] = (earners[tradOf(id)] || 0) + 1;
    }
    const trad = tradOf(id);
    if (!byId.has(id)) continue;                       // minted figures have no starting rung to rise from
    sawBy[trad] = (sawBy[trad] || 0) + 1;
    const from = rungOf(startTier.get(id)), to = rungOf(t.tier);
    if (from >= 0 && to > from) roseBy[trad] = (roseBy[trad] || 0) + 1;
  }
}

console.log(`HOLDING EFFECT (SNG-304) — ${RUNS} worlds × ${DAYS} world-days\n`);

console.log(`  1. DOES IT FIRE?  longest streak seen: ${peakStreak} consecutive passes`);
console.log(`     (threshold is ${CONTENT.rules?.arcResponse?.holding?.deedAtPasses ?? 5}; a streak that never reaches it is an unreachable value, not a mechanic)\n`);

console.log(`  DEED SOURCES CREDITED (from the bounded per-figure log — a SAMPLE of the last 12 each, not a total)\n`);
const tot = Object.values(sources).reduce((a, b) => a + b, 0) || 1;
for (const [k, n] of Object.entries(sources).sort((a, b) => b[1] - a[1])) {
  const combat = !["heldTheLine", "heldThroughCrisis"].includes(k);
  console.log(`    ${k.padEnd(20)} ${String(n).padStart(5)}  ${((100 * n) / tot).toFixed(1).padStart(5)}%  weight ${DEED_WEIGHTS[k]}   ${combat ? "(needs a fight)" : "← does NOT need a fight"}`);
}
const nonCombat = (sources.heldTheLine || 0) + (sources.heldThroughCrisis || 0);
console.log(`\n    deeds earnable WITHOUT a fight: ${((100 * nonCombat) / tot).toFixed(1)}% of all credits`);
console.log(`    (before SNG-304 the only such source was heldThroughCrisis at weight 1 — paid for sacrifice, never for work)`);

console.log(`\n  2. ⛔ WHO EARNS IT — the SNG-280 check. If this list is one temperament, it is a value in a coefficient.\n`);
const eTot = Object.values(earners).reduce((a, b) => a + b, 0) || 1;
const eng = CONTENT.rules?.arcResponse?.engagement?.byTradition || CONTENT.rules?.engagement?.byTradition || {};
for (const [t, n] of Object.entries(earners).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${t.padEnd(28)} ${String(n).padStart(4)}  ${((100 * n) / eTot).toFixed(1).padStart(5)}%   (engages ${eng[t] != null ? Number(eng[t]).toFixed(2) : "  — "})`);
}

console.log(`\n  3. RISE RATES BY TRADITION — SNG-300 measured marcher 50% against stillhold 8%\n`);
const rows = Object.keys(sawBy).map(t => ({ t, saw: sawBy[t], rose: roseBy[t] || 0, pct: (100 * (roseBy[t] || 0)) / sawBy[t] }))
  .sort((a, b) => b.pct - a.pct);
for (const r of rows) {
  console.log(`    ${r.t.padEnd(28)} ${String(r.rose).padStart(3)}/${String(r.saw).padEnd(3)}  ${r.pct.toFixed(0).padStart(3)}%   (engages ${eng[r.t] != null ? Number(eng[r.t]).toFixed(2) : "  — "})`);
}
const warlike = rows.filter(r => Number(eng[r.t]) >= 1), peaceful = rows.filter(r => Number(eng[r.t]) < 0.5);
const mean = a => a.length ? a.reduce((s, r) => s + r.pct, 0) / a.length : 0;
console.log(`\n    mean rise rate — traditions that seek fights (engages ≥ 1): ${mean(warlike).toFixed(0)}%`);
console.log(`    mean rise rate — traditions that rarely do  (engages < 0.5): ${mean(peaceful).toFixed(0)}%`);
console.log(`\n  A REPORT — reads content, writes nothing. Quote it WITH the date you ran it.`);
