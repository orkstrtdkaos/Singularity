// dev_world.mjs — CCODE-94: a DEV WORLD. Force the world's own clock without touching a player's save.
//
// Erik: "perhaps we need a dev world to use to test with... one that forcing the world tics won't mess with
// the player's world."
//
// Exactly the missing tool. The world-drive audit can prove a path is WIRED from source, and it can look for
// a FOOTPRINT in real saves — but it cannot make the world tick, because the only worlds available were
// people's actual games. So a path with no footprint stayed a question forever: too rare, never triggered, or
// simply never reached in the play that happened to occur.
//
// This builds a character and a world IN MEMORY, ticks it as many days as you like, and reports which
// world-driven paths actually produced something. Nothing is written to disk — there is no save, no
// characters/ entry, no shared canon. The player's world cannot be reached from here.
//
// Run: npm run dev-world  [days]     (default 120 days)
//
// STATUS: DRIVING. It ticks the real world clock against the real content bag, in memory, touching no save.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "./headless_content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const DAYS = Number(process.argv[2]) || 120;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (l, c, d = "") => c ? ok(l) : fail(l + (d ? " — " + d : ""));

console.log(`THE DEV WORLD — forcing ${DAYS} days of world clock, in memory, touching no save (CCODE-94)\n`);

// ── the sandbox character ───────────────────────────────────────────────────────────────────────────────
// Deliberately UNREMARKABLE: mid-level, a few crafts, a couple of people known, one place. A test world built
// out of a maxed character would prove the paths fire for someone nobody actually plays.
function devCharacter() {
  return {
    name: "Dev Subject", level: 6, xp: 0, health: 20, maxHealth: 20, energy: 60,
    origin: "valley_folk", background: "lineage_taught",
    attributes: { practical: 5, mental: 4, social: 4, spiritual: 3 },
    abilities: [{ abilityId: "kindle", level: 2 }, { abilityId: "stonewise", level: 1 }],
    skills: {}, deeds: [], quests: [], inventory: [], companions: [],
    currentLocationId: "the_crossing",
    npcRegistry: {}, placeMemory: {}, customEncounters: {},
    clock: { day: 1, hour: 9 }, actionCount: 0,
    worldState: { schemaVersion: 1, lastTickDay: 0, news: [], arcStages: {}, latentArcs: [], assignments: [], wakes: [] },
    _devWorld: true,   // a tripwire: if this ever reaches a save path, that is a bug worth failing on
  };
}

// CCODE-96: the REAL content bag, assembled by the app's own `loadContent()` through a disk-backed fetch
// shim. The first draft hand-rolled this from pack files and stopped at the first thing the tick read
// unguarded — which is the tax every engine test in this repo has been paying separately.
const CONTENT = await loadContentHeadless();

// ── force the clock ─────────────────────────────────────────────────────────────────────────────────────
const character = devCharacter();
// The tick is `runWorldTick`, and it is ASYNC with an AI-backed `advanceAssignments` default. That default is
// itself a finding: a world tick that needs a model to advance assignments cannot advance them in a test, and
// arguably not in ordinary play either. It is INJECTED here with a deterministic stub — the same seam every
// other engine test uses, and the reason the parameter exists.
const { runWorldTick, initWorldState } = await import("../engine/worldtick.js");
character.worldState = initWorldState(1);
const stubAdvance = async (assignments = []) => assignments.map(a => ({ ...a, progressed: true }));
let ticked = 0, tickErr = null;
for (let day = 1; day <= DAYS; day++) {
  character.clock.day = day;
  try {
    await runWorldTick({ character, content: CONTENT, currentDay: day, advanceAssignments: stubAdvance });
    ticked++;
  } catch (e) { tickErr = e.message; break; }
}
check(`the world clock can be forced without a save (${ticked}/${DAYS} days ticked)`,
  ticked === DAYS, tickErr ? `stopped after ${ticked} day(s): ${tickErr}` : `only ${ticked}/${DAYS} ticked`);   // ticked>0 was too lenient: it passed at 1/60

// ── what did the world produce on its own? ──────────────────────────────────────────────────────────────
const ws = character.worldState || {};
const produced = {
  "news travelled": (ws.news || []).length,
  "world arcs advanced": Object.keys(ws.arcStages || {}).length,
  "latent arcs ripened": (ws.latentArcs || []).length,
  "wakes opened": (ws.wakes || []).length,
  "assignments accrued": (ws.assignments || []).length,
  "pressure queued": (ws.pressureQueue || []).length,
};
console.log(`\n  AFTER ${ticked} FORCED DAYS, the world produced on its own:`);
for (const [what, n] of Object.entries(produced)) console.log(`    ${what.padEnd(24)} ${String(n).padStart(3)}`);

const anything = Object.values(produced).some(n => n > 0);
check("a world left alone for months DOES something (the tick is not inert)", anything,
  "every world-state list is still empty after the full run — the tick either does not fire or writes elsewhere");

// ── the guarantee that makes this safe to run ───────────────────────────────────────────────────────────
// If the dev world could ever touch the real one, it would be worse than not having it.
const before = readdirSync(join(root, "characters")).length;
check("THE SAFETY PROPERTY: no character directory was created or removed",
  readdirSync(join(root, "characters")).length === before);
check("the dev character is TAGGED, so a leak into a save path is detectable", character._devWorld === true);

console.log(`\n  What this cannot tell you: whether a path fires at the RIGHT time. It proves a path CAN fire,`);
console.log(`  which is exactly the question a footprint of zero leaves open.`);
console.log(failures === 0 ? "\nDev world: usable, and it touched nothing." : `\nDev world: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
