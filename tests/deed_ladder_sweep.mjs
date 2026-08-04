// tests/deed_ladder_sweep.mjs — SNG-279: what deed thresholds make promotion VISIBLE?
//
// Aevi: "CCODE: these want a sim sweep. Target — a 40-hour-equivalent run (≈105 world-days) shows ≥3 rises
// and ≥1 fall; a 180-hour-equivalent run produces a mythic in some worlds and not others."
//
// ⚠️ SWEEP BY OUTCOME, NOT BY RECONSTRUCTING THE CURVE. My first attempt derived thresholds from a measured
// deed distribution and was wrong twice over: `deedLog` is capped at 12 entries so prolific figures were
// undercounted, and `deeds` RESETS on promotion so a figure who rises twice reads as one who barely rose.
// Running the actual sim at candidate ladders has neither problem — the number it reports is the number the
// player would experience.
//
// A REPORT. The right ladder is Erik's and Aevi's; this says what each one does.
//
// Run: node tests/deed_ladder_sweep.mjs

import { loadContentHeadless } from "./headless_content.mjs";
import { advanceGeneratedOffscreen, tierOf } from "../engine/worldtick.js";

const CONTENT = await loadContentHeadless();
// ⚠️ STEP BY A REAL DAY, NOT AN HOUR. `absoluteWorldDay` scales elapsed REAL DAYS by `epoch.rate`, so a
// one-hour step advances the world by ~1/24 of what the loop counter claims. My first three runs of this
// sweep reported 0 rises at every ladder, and the reason was that "105 world-days" was really about five.
// world_endgame.mjs had it right all along; my ad-hoc probes did not.
const DAY_MS = 24 * 3600e3;
const WORLDS = Number(process.argv[2]) || 6;

// Aevi's floors are fixed (she chose them); only the deed GATE is swept.
const FLOORS = { riffraff: 0.05, notable: 0.10, heroic: 0.20, epic: 0.35, legendary: 0.60 };
// ⚠️ MY FIRST CANDIDATE SET ALL RETURNED ZERO, and the reason was not the ladder: a heroic accrues about 7
// deeds in 105 world-days and every candidate I had chosen started at 12 or above. I picked the numbers
// before measuring what a figure actually earns, which is the same mistake as tuning without a sim.
// Re-derived AFTER the clock fix. On the true timescale a heroic clears a dozen deeds easily, so the low
// ladders flood: 15-21 of 28 heroics become epic inside 105 days, which is not a promotion system, it is a
// tier rename. These reach for Aevi's target of a HANDFUL.
const CANDIDATES = [
  { name: "4/10/22/70/150",  deeds: [4, 10, 22, 70, 150] },
  { name: "4/10/22/70/170",  deeds: [4, 10, 22, 70, 170] },
  { name: "4/10/22/60/170",  deeds: [4, 10, 22, 60, 170] },
  { name: "4/10/22/70/190",  deeds: [4, 10, 22, 70, 190] },
];
const RUNGS = ["riffraff", "notable", "heroic", "epic", "legendary"];
const TO = { riffraff: "notable", notable: "heroic", heroic: "epic", epic: "legendary", legendary: "mythic" };

// ⚠️ THE TOP RUNG IS NOT A DEED GATE ANY MORE. This used to stamp `unbeaten: true` on legendary, which
// silently overrode the authored seven paths — the sweep printed mythics and an EMPTY path distribution,
// because it was measuring the old single condition it had injected itself. The legendary rung now defers
// to `paths`, so the sweep measures what the game actually runs.
const ladderOf = (deeds) => Object.fromEntries(RUNGS.map((r, i) =>
  [r, r === "legendary"
    ? { to: TO[r], years: FLOORS[r], paths: true }
    : { to: TO[r], years: FLOORS[r], deeds: deeds[i] }]));

async function run(days, seed, promotion) {
  const character = { id: "sweep", name: "Sweep", currentLocationId: Object.keys(CONTENT.locations)[0],
    clock: { day: 1 }, worldState: null, npcRegistry: {}, codex: { topics: {} } };
  // inject the candidate ladder without touching authored content
  // SNG-288: carry the authored mythic paths through, or the top rung has no roads and the sweep measures a
  // ladder that stops at legendary.
  const content = { ...CONTENT, rules: { ...CONTENT.rules, tierLadder: { ...(CONTENT.rules.tierLadder || {}), promotion } } };
  let s = seed;
  const rng = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const t0 = Date.now();
  for (let d = 0; d < days; d += 7) {
    await advanceGeneratedOffscreen({ character, content, evolveFn: async () => ({}), rng, now: t0 + d * DAY_MS });
    // Aevi: "report WHICH PATH fired — the distribution IS the real result." A rise is reported once, in the
    // pass it happens, so it has to be collected here rather than read off the end state.
    for (const r of (character.worldState?.arcStandings?.risen || [])) {
      if (r.path) (character.worldState._mythicPaths ||= {})[r.path] = ((character.worldState._mythicPaths || {})[r.path] || 0) + 1;
    }
  }
  const ws = character.worldState;
  const tiers = {};
  for (const t of Object.values(ws.figureTier || {})) tiers[t] = (tiers[t] || 0) + 1;
  return { rises: Object.keys(ws.figureTier || {}).length, tiers, fell: (ws.arcStandings?.fallen || []).length,
    paths: ws._mythicPaths || {} };
}

const line = (label, rows) => {
  const mean = k => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(1);
  const tiers = {};
  for (const r of rows) for (const [t, n] of Object.entries(r.tiers)) tiers[t] = (tiers[t] || 0) + n / rows.length;
  const shape = Object.entries(tiers).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n.toFixed(1)}`).join(" · ");
  console.log(`  ${label.padEnd(19)} ${mean("rises").padStart(5)} rises  ${mean("fell").padStart(4)} falls   ${shape || "—"}`);
};

console.log("DEED LADDER SWEEP (SNG-279) — what does each gate do to a world? (floors fixed at Aevi's numbers)\n");
console.log("A. THE 40-HOUR TEST — 105 world-days. Aevi's target: ≥3 rises, and the pyramid not flattened.\n");
for (const c of CANDIDATES) {
  const rows = [];
  for (let w = 0; w < WORLDS; w++) rows.push(await run(105, 7 + w * 13, ladderOf(c.deeds)));
  line(c.name, rows);
}

console.log("\nB. THE 180-HOUR TEST — 470 world-days. Target: a mythic in SOME worlds and not others.\n");
for (const c of CANDIDATES) {
  const rows = [];
  for (let w = 0; w < WORLDS; w++) rows.push(await run(470, 3 + w * 17, ladderOf(c.deeds)));
  const myth = rows.filter(r => r.tiers.mythic).length;
  line(`${c.name}`, rows);
  const byPath = {};
  for (const r of rows) for (const [k, n] of Object.entries(r.paths || {})) byPath[k] = (byPath[k] || 0) + n;
  const dist = Object.entries(byPath).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ");
  console.log(`  ${" ".repeat(19)} → mythic in ${myth}/${rows.length} worlds${myth > 0 && myth < rows.length ? "  ← SOME AND NOT OTHERS" : ""}`);
  if (dist) console.log(`  ${" ".repeat(19)}   paths fired: ${dist}`);
}

console.log("\nA REPORT — the ladder is Erik's and Aevi's to choose. This only says what each one does.");
