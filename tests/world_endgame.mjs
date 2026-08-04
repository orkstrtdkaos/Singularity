// world_endgame.mjs — CCODE-108: what does the world look like after a long time, many times over?
//
// Erik: "run some end of world simulations... NPCs can kill each other and new NPCs can be minted into
// legends... what does this look like in the long game after many distinct world runs?"
//
// Every measurement so far has been ONE world for a few passes. This runs MANY INDEPENDENT WORLDS a long way
// forward and asks the questions you can only ask at that scale:
//   · does the legend population COLLAPSE? (they can kill each other; nothing obviously refills them)
//   · do the arcs reach the SAME place every run, or does each world find its own shape?
//   · is the endgame STABLE, or does something run away?
//
// It is a REPORT, not a gate. There is no correct number of dead legends — what matters is whether the
// distribution is a world Erik wants to live in, which is his call and needs the numbers in front of him.
//
// Every run is in memory against the app's real content. No save is written, read or touched.
//
// Run: npm run endgame-world [runs] [worldDays]

import { readFileSync } from "node:fs";
import { loadContentHeadless } from "./headless_content.mjs";

const RUNS = Number(process.argv[2]) || 12;
const DAYS = Number(process.argv[3]) || 720;      // ~2 world years
const HOUR = 3600000, DAY_MS = 24 * HOUR;

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState, effectiveEpicStatus } = await import("../engine/worldtick.js");

const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const ARCS = [...new Set(ROSTER.map(f => f.arcAffinity?.arcId).filter(Boolean))];

console.log(`END OF WORLD — ${RUNS} independent worlds, ${DAYS} world-days each (CCODE-108)\n`);
console.log(`  roster: ${ROSTER.length} legends · contested arcs: ${ARCS.length}\n`);

/** One world, run forward. Seeded so a run is reproducible; each run gets its own seed. */
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

const results = [];
for (let run = 0; run < RUNS; run++) {
  const rng = seeded(1000 + run * 7919);
  const character = {
    name: `World ${run + 1}`, level: 6, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [],
    worldState: initWorldState(1),
  };
  delete character.worldState.lastTickWorldDay;

  // The evolver is stubbed deterministically: a real model would colour these, but the MECHANICS are what an
  // endgame is made of, and a stub keeps 12 worlds affordable and reproducible.
  const stub = async ({ entities }) => ({
    developments: entities.map(e => ({ entityId: e.id, note: "the world turned", outcome: rng() < 0.15 ? "resolved" : "progress" })),
  });

  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += 7) {   // a pass a week of world time
    await advanceGeneratedOffscreen({ character, content: CONTENT, evolveFn: stub, rng, now: t0 + d * DAY_MS });
  }

  const ws = character.worldState;
  const status = {};
  // SNG-269/2a: BY TIER. An aggregate death count hid the thing worth knowing — whether the pyramid loses
  // its top or its base. Erik: "a legend might kill 3-4 heroes and 1-2 epics per battle", so the tiers are
  // supposed to die at different rates, and one number cannot show that.
  const byTier = {};
  for (const f of ROSTER) {
    const s = effectiveEpicStatus(ws, f.id, DAYS) || "alive";
    status[s] = (status[s] || 0) + 1;
    const t = f.legend?.tier || f.tier || "untiered";
    (byTier[t] ||= { n: 0, dead: 0, wounded: 0 }).n++;
    if (s === "dead") byTier[t].dead++;
    if (s === "wounded") byTier[t].wounded++;
  }
  results.push({
    run: run + 1,
    dead: status.dead || 0, wounded: status.wounded || 0, stopped: status.stopped || 0,
    alive: ROSTER.length - (status.dead || 0),
    arcs: Object.fromEntries(ARCS.map(a => [a, Math.round((ws.arcNetPush?.[a] ?? 0) * 10) / 10])),
    resolvedWants: Object.values(ws.wantProgress || {}).filter(w => w?.status === "resolved").length,
    news: (ws.news || []).length,
    minted: (ws.mintedFigures || []).length,
    mintedByTier: (ws.mintedFigures || []).reduce((m, f) => ((m[f.tier] = (m[f.tier] || 0) + 1), m), {}),
    byTier,
  });
}

// ── the shape of an endgame ─────────────────────────────────────────────────────────────────────────────
console.log("  run   legends dead   wounded   wants resolved   news");
for (const r of results) {
  console.log(`  ${String(r.run).padStart(3)}   ${String(r.dead).padStart(12)}   ${String(r.wounded).padStart(7)}   ${String(r.resolvedWants).padStart(14)}   ${String(r.news).padStart(4)}`);
}

const mean = k => results.reduce((a, r) => a + r[k], 0) / results.length;
const spread = k => { const v = results.map(r => r[k]).sort((a, b) => a - b); return `${v[0]}–${v[v.length - 1]}`; };
console.log(`\n  ACROSS ${RUNS} WORLDS, after ${DAYS} days each:`);
console.log(`    legends dead      mean ${mean("dead").toFixed(1)} of ${ROSTER.length}   range ${spread("dead")}`);
console.log(`    legends wounded   mean ${mean("wounded").toFixed(1)}              range ${spread("wounded")}`);
console.log(`    wants resolved    mean ${mean("resolvedWants").toFixed(1)}              range ${spread("resolvedWants")}`);
{
  // SNG-269/2a — THE PER-TIER TABLE. This is the one that was STALE: the old run sampled ONE `regional`
  // figure and reported 66.7% for the whole rung. There are 28 in that band now.
  const tiers = [...new Set(results.flatMap(r => Object.keys(r.byTier)))]
    .sort((a, b) => (results[0].byTier[b]?.n || 0) - (results[0].byTier[a]?.n || 0));
  console.log("");
  console.log("  BY TIER — does the pyramid lose its top or its base?");
  console.log("    tier          roster   dead/run   death rate   wounded/run");

  // COUNT AND RATE ANSWER DIFFERENT QUESTIONS, and conflating them is how you tune the wrong knob.
  //   · COUNT says who the world is losing MOST OF — the design intent ("more lower power ones die").
  //   · RATE says which rung is most DANGEROUS TO BE — and legends sit highest there no matter how
  //     survivable a single loss is, because the attention model puts them in four times the fights.
  // That is not a bug to tune out: a legend holds 2 fronts to a heroic's half. Being in every fight IS
  // what being a legend costs. The knob, if Erik wants the rate flattened, is `attentionByTier` — not
  // lethality.
  for (const t of tiers) {
    const n = results[0].byTier[t]?.n || 0;
    const d = results.reduce((s, r) => s + (r.byTier[t]?.dead || 0), 0) / results.length;
    const w = results.reduce((s, r) => s + (r.byTier[t]?.wounded || 0), 0) / results.length;
    const rate = n ? (100 * d / n).toFixed(1) + "%" : "—";
    console.log("    " + t.padEnd(12) + "  " + String(n).padStart(6) + "   " + d.toFixed(1).padStart(8) + "   " + rate.padStart(10) + "   " + w.toFixed(1).padStart(11));
  }
}
// DO THE ARCS CONVERGE? The question that decides whether every world tells the same story.
{
  // SNG-269/2b — THE INFLOW. Before this, the roster only ever shrank.
  const m = results.reduce((s, r) => s + r.minted, 0) / results.length;
  const tiers = {};
  for (const r of results) for (const [t, n] of Object.entries(r.mintedByTier)) tiers[t] = (tiers[t] || 0) + n / results.length;
  console.log("");
  console.log("  THE INFLOW — does the world refill what it loses?");
  console.log("    minted per world   " + m.toFixed(1) + "   (" + Object.entries(tiers).map(([t, n]) => t + " " + n.toFixed(1)).join("  ·  ") + ")");
  const lost = results.reduce((s, r) => s + r.dead, 0) / results.length;
  console.log("    lost per world     " + lost.toFixed(1) + "   → net " + (m - lost >= 0 ? "+" : "") + (m - lost).toFixed(1) + " figures per " + DAYS + " days");
}
console.log(`\n  WHERE THE ARCS LANDED — does every world end the same way?`);
for (const a of ARCS) {
  const vals = results.map(r => r.arcs[a]);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const avg = vals.reduce((x, y) => x + y, 0) / vals.length;
  const sameSign = vals.every(v => Math.sign(v) === Math.sign(vals[0]));
  console.log(`    ${a.replace(/^arc_/, "").replace(/_/g, " ").padEnd(24)} mean ${avg.toFixed(1).padStart(6)}   range ${String(lo).padStart(5)}…${String(hi).padEnd(5)}  ${sameSign ? "← every world leans the SAME way" : "← worlds DIVERGE"}`);
}

const deadMean = mean("dead");
console.log(`\n  READING IT:`);
console.log(`    · legend attrition: ${(100 * deadMean / ROSTER.length).toFixed(0)}% of the roster dies in ${DAYS} days.`);
console.log(`      ${deadMean === 0 ? "NOBODY dies — the clash path never reaches a kill, so the roster is immortal." :
  deadMean / ROSTER.length > 0.5 ? "OVER HALF the world's great figures die — the endgame empties itself." :
  "a minority die — the world loses figures without emptying."}`);
console.log(`    · the world now MINTS at the bottom (SNG-269/2b), so attrition is no longer one-way — see`);
console.log(`      the inflow table above. Whether the RATE is right is Erik's call; the mechanism exists now.`);
console.log(`\nEnd of world: ${RUNS} worlds run, nothing written. (A REPORT — the right numbers are Erik's.)`);
