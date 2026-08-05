// tests/strike_mix.mjs — SNG-303b: WHO actually strikes, now that the striker comes from the working pool?
//
// I claimed, in the reconcile, that drawing the sender from `engaged` "locked the concealment traditions out
// of the mechanic built for them, while the marchers who already dominated the fighting got it as a free
// extra action." That is a claim about a distribution, and a claim about a distribution has to be MEASURED —
// otherwise it is exactly the kind of remembered number that had me telling Aevi her verbs were unauthored
// for four turns after she had written them.
//
// ⚠️ MY FIRST ATTEMPT MONKEYPATCHED `planStrike` to record both rules from inside a live run. ES module
// namespaces are frozen, so it threw — which is the good outcome: the patch would not have taken effect on
// worldtick's own internal call either (that resolves the local binding, not the namespace), so a "working"
// version would have silently reported the new rule twice and I would have believed it.
//
// So this measures the two things that are actually knowable:
//
//   PART 1 — THE POOLS, EXACTLY. The old rule drew from `engaged`, the new one from `working`, and membership
//            is one Bernoulli trial per figure per pass at `engageOf(f)`. That is not a re-implementation of
//            the split; it is the split's definition, so the expected composition of each pool is arithmetic.
//   PART 2 — THE LIVE STRIKERS. Who `ws.arcStrikes` actually names across real seeded runs.
//
// A REPORT. Reads content, writes nothing, gates nothing. The right rates are Erik's and Aevi's.
//
// Run: node tests/strike_mix.mjs [runs] [worldDays]

import { loadContentHeadless } from "./headless_content.mjs";

const RUNS = Number(process.argv[2]) || 4;
const DAYS = Number(process.argv[3]) || 1460;      // ~4 world years
// ⚠️ REAL DAYS. World time is derived from wall-clock (`absoluteWorldDay`), not from character.clock.day —
// stepping by hours simulates 1/24th of the labelled span and reports the stillness as a finding. Done that.
const DAY_MS = 24 * 3600000;

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState } = await import("../engine/worldtick.js");

const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const cfg = CONTENT.rules?.arcResponse || {};
const eng = cfg.engagement || CONTENT.rules?.engagement || {};
const MULT = eng.byTradition || {};
const RATE = Number.isFinite(cfg.directEngagementRate) ? cfg.directEngagementRate : 0.35;
const LO = Number.isFinite(eng.min) ? eng.min : 0.05, HI = Number.isFinite(eng.max) ? eng.max : 0.9;
const tradOf = f => f?.tradition || f?.legend?.tradition || null;
const engageOf = t => Math.max(LO, Math.min(HI, RATE * (Number.isFinite(Number(MULT[t])) ? Number(MULT[t]) : 1)));

console.log(`WHO STRIKES (SNG-303b) — the striker pool moved from \`engaged\` to \`working\`\n`);

// ── PART 1 — THE POOLS, EXACTLY ───────────────────────────────────────────────────────────────────────────
const byTrad = {};
for (const f of ROSTER) { const t = tradOf(f); if (t) (byTrad[t] ||= []).push(f); }
const trads = Object.keys(byTrad).sort();
let engTot = 0, workTot = 0;
const rows = trads.map(t => {
  const n = byTrad[t].length, p = engageOf(t);
  const inEngaged = n * p, inWorking = n * (1 - p);
  engTot += inEngaged; workTot += inWorking;
  return { t, n, p, inEngaged, inWorking };
});

console.log(`  PART 1 — POOL COMPOSITION (exact: membership is one roll per figure per pass at engageOf)\n`);
console.log(`    ${"tradition".padEnd(18)} roster  engages   share of ENGAGED   share of WORKING   shift`);
for (const r of rows.sort((a, b) => (b.inWorking / workTot) - (a.inWorking / workTot))) {
  const e = (100 * r.inEngaged) / engTot, w = (100 * r.inWorking) / workTot;
  const arrow = w - e > 1 ? "↑" : e - w > 1 ? "↓" : " ";
  console.log(`    ${r.t.padEnd(18)} ${String(r.n).padStart(5)}   ${r.p.toFixed(2)}    ${e.toFixed(1).padStart(6)}%            ${w.toFixed(1).padStart(6)}%         ${arrow} ${(w - e >= 0 ? "+" : "")}${(w - e).toFixed(1)}`);
}

const low = rows.filter(r => Number(MULT[r.t]) < 1);
const lowE = low.reduce((s, r) => s + r.inEngaged, 0), lowW = low.reduce((s, r) => s + r.inWorking, 0);
console.log(`\n  ⛔ THIS IS POOL COMPOSITION, NOT THE SENDER DISTRIBUTION. Both rules take the TOP of their pool by`);
console.log(`     urgency (the new one by disposition first), so neither draws uniformly. Part 2 is the real`);
console.log(`     answer for the rule that now ships; Part 1 is why it changed, and it is exact.`);
console.log(`\n  THE CLAIM UNDER TEST — the ${low.length} traditions that rarely seek a fight (engages < 1):`);
console.log(`    under the OLD rule (striker drawn from ENGAGED) they were ${((100 * lowE) / engTot).toFixed(1)}% of the pool a striker came from`);
console.log(`    under the NEW rule (striker drawn from WORKING) they are  ${((100 * lowW) / workTot).toFixed(1)}%`);

// ── PART 2 — THE LIVE STRIKERS ────────────────────────────────────────────────────────────────────────────
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
const byId = new Map(ROSTER.map(f => [f.id, f]));
const seen = {}; let strikes = 0, quiet = 0, crusade = 0, guarded = 0, killed = 0;
let crusadesDeclared = 0, exposedEver = 0;

for (let run = 0; run < RUNS; run++) {
  const rng = seeded(4000 + run * 7919);
  const character = { name: `W${run}`, level: 6, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [], worldState: initWorldState(1) };
  delete character.worldState.lastTickWorldDay;
  const stub = async ({ entities }) => ({ developments: entities.map(e => ({ entityId: e.id, note: "the world turned", outcome: "progress" })) });
  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += 7) {
    await advanceGeneratedOffscreen({ character, content: CONTENT, evolveFn: stub, rng, now: t0 + d * DAY_MS });
    for (const s of character.worldState?.arcStrikes || []) {
      strikes++;
      if (s.kind === "crusade") crusade++; else quiet++;
      if (s.outcome === "guarded") guarded++;
      if (s.outcome === "killed") killed++;
      const t = tradOf(byId.get(s.sender)) || "(minted — no tradition)";
      seen[t] = (seen[t] || 0) + 1;
    }
    crusadesDeclared = Math.max(crusadesDeclared, Object.keys(character.worldState?.crusades || {}).length);
    exposedEver = Math.max(exposedEver, Object.keys(character.worldState?.figureExposure || {}).length);
  }
}

console.log(`\n  PART 2 — WHO WAS ACTUALLY SENT, over ${RUNS} worlds × ${DAYS} world-days\n`);
console.log(`    ${strikes} strikes · ${quiet} quiet · ${crusade} crusade · ${guarded} turned aside · ${killed} killed`);
console.log(`    crusades running at once (peak): ${crusadesDeclared} · figures exposed at once (peak): ${exposedEver}\n`);
const tot = Object.values(seen).reduce((a, b) => a + b, 0) || 1;
for (const [t, n] of Object.entries(seen).sort((a, b) => b[1] - a[1])) {
  const m = MULT[t] != null ? Number(MULT[t]).toFixed(2) : "  — ";
  console.log(`    ${t.padEnd(28)} ${String(n).padStart(4)}  ${((100 * n) / tot).toFixed(1).padStart(5)}%   (engages ${m})`);
}

console.log(`\n  ⚠️ CRUSADES: ${crusade} of ${strikes}. \`kindByTradition\` is unauthored, so every strike is QUIET and`);
console.log(`     the declared kind is unreachable until Aevi names which traditions declare — see strikeCoverage().`);
console.log(`\n  A REPORT — reads content, writes nothing. Quote it WITH the date you ran it.`);
