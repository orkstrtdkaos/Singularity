// player_impact.mjs — CCODE-109: can a player make a difference?
//
// Erik: "build the scenarios and play out a player's story. you can do 1 player or perhaps up to 6 players in
// each world... are they able to make a difference?"
//
// CCODE-108 found that eight player-less worlds all ended in the SAME arc configuration — the world lives
// without the player and lives the same life every time. The obvious candidate for breaking that symmetry is
// the player, who was absent from every one of those runs by construction. So: put them in.
//
// THE MEASUREMENT IS THE STAGE, NOT THE PUSH. `arcStageNow` is `base + mine + others + epic`, CLAMPED to the
// arc's authored stage count. That clamp is the whole question: if the epic census already pins an arc at its
// ceiling or floor, a player's push is arithmetically real and narratively invisible — the stage they see
// never moves. A player who cannot change the STAGE has not changed the world, whatever the ledger says.
//
// Run: npm run player-impact [worlds] [worldDays]

import { loadContentHeadless } from "./headless_content.mjs";

const WORLDS = Number(process.argv[2]) || 6;
const DAYS = Number(process.argv[3]) || 720;
const DAY_MS = 24 * 3600000;
const PARTY_SIZES = [0, 1, 3, 6];

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState, worldArcsPublic } = await import("../engine/worldtick.js");
const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const ARCS = [...new Set(ROSTER.map(f => f.arcAffinity?.arcId).filter(Boolean))];

const seeded = s => { let x = s >>> 0; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; };

/** One world, `players` of them acting on the arcs, run forward. */
async function runWorld(seed, players) {
  const rng = seeded(seed);
  const character = {
    name: "Protagonist", level: 8, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [],
    worldState: initWorldState(1),
  };
  delete character.worldState.lastTickWorldDay;
  const ws = character.worldState;
  const stub = async ({ entities }) => ({ developments: entities.map(e => ({ entityId: e.id, note: "turned", outcome: rng() < 0.15 ? "resolved" : "progress" })) });

  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += 7) {
    // THE PLAYERS ACT. One of the party leans on a random contested arc each week — a party that quests,
    // resolves things, and takes sides. `mine` is THIS player; `othersPush` is the rest of the party, which is
    // exactly how the shared world already models other people (syncSharedWorld writes othersPush).
    if (players > 0) {
      const arcId = ARCS[Math.floor(rng() * ARCS.length)];
      ws.arcStages = ws.arcStages || {};
      const cur = ws.arcStages[arcId] || { push: 0, othersPush: 0 };
      const dir = rng() < 0.5 ? 1 : -1;
      cur.push = (cur.push || 0) + dir;                                  // the player themselves
      if (players > 1) cur.othersPush = (cur.othersPush || 0) + dir * (players - 1); // the rest of the party
      ws.arcStages[arcId] = cur;
    }
    await advanceGeneratedOffscreen({ character, content: CONTENT, evolveFn: stub, rng, now: t0 + d * DAY_MS });
  }
  // The fields are arcId / stageNum / total / contested. My first probe read `a.stage`, got undefined for
  // every arc, and printed a tidy column of zeros - a broken probe reporting a confident "no difference".
  // Third time this session; the probe now mirrors the real return shape.
  const stages = {}, contested = {};
  for (const a of worldArcsPublic(CONTENT, character) || []) { stages[a.arcId] = a.stageNum; contested[a.arcId] = !!a.contested; }
  return { stages, contested, ws };
}

console.log(`CAN A PLAYER MAKE A DIFFERENCE? ${WORLDS} worlds × ${DAYS} days, party sizes ${PARTY_SIZES.join("/")} (CCODE-109)\n`);

const byParty = {};
for (const players of PARTY_SIZES) {
  byParty[players] = [];
  for (let w = 0; w < WORLDS; w++) byParty[players].push(await runWorld(2000 + w * 7919, players));
}

// Do the STAGES differ from the player-less baseline?
console.log("  arc                        party 0    party 1    party 3    party 6");
const arcIds = Object.keys(byParty[0][0]?.stages || {});
  // CONTESTED is the other half of the answer: an arc can sit at the same stage and still be visibly pushed
  // against. A world where players never contest anything is a different failure from one where they contest
  // and lose.
  const contestedCount = p => byParty[p].reduce((n, r) => n + Object.values(r.contested).filter(Boolean).length, 0);
let anyDiff = false;
for (const id of arcIds) {
  const cell = p => {
    const vals = byParty[p].map(r => r.stages[id]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return lo === hi ? String(lo) : `${lo}-${hi}`;
  };
  const base = cell(0);
  const row = PARTY_SIZES.map(cell);
  if (row.some(v => v !== base)) anyDiff = true;
  console.log(`  ${String(id).replace(/^arc_/, "").replace(/_/g, " ").padEnd(24)} ${row.map(v => v.padStart(9)).join("  ")}`);
}

console.log(`\n  ARCS VISIBLY CONTESTED (the player and the valley pushing opposite ways):`);
for (const p of PARTY_SIZES) console.log(`    party ${p}: ${contestedCount(p)} arc-instances contested across ${WORLDS} worlds`);

console.log(`\n  READING IT:`);
if (!anyDiff) {
  console.log(`    ⚠️  NO PARTY SIZE CHANGED ANY ARC'S STAGE. A party of six, acting every week for two years,`);
  console.log(`       leaves the world in exactly the configuration it reaches on its own. The players' pushes are`);
  console.log(`       real in the ledger and INVISIBLE in the world: the epic census has the stage pinned at its`);
  console.log(`       clamp, and ±6 cannot move something already past its ceiling by 30.`);
} else {
  console.log(`    Party size DOES move the world — the stages above differ by party. The player is not noise.`);
}
console.log(`\n    The comparison that matters is party 0 vs party 6: if those columns are identical, the world`);
console.log(`    has a destiny rather than a history, and no amount of play changes it.`);
console.log(`\nPlayer impact: ${WORLDS * PARTY_SIZES.length} worlds run, nothing written. (A REPORT.)`);
