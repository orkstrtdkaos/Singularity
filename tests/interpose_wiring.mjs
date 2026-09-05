// tests/interpose_wiring.mjs — CCODE-311. THE TANK ACTUALLY TAKES THE BLOW.
//
// ⛔ THE FOUR DOORS, ALL FOUR, FOR ONE MECHANIC. `intercept.js` shipped its reader in CCODE-260 with a note
// saying "build the reader, default the dial to a no-op, LET CONTENT TURN IT ON". Aevi turned it on with
// `step_between` on 2026-08-29 — the first craft in the game to author `interceptDamage`.
//
// ⚠️ AND THE CHAIN STILL DID NOT RUN. `protectionFromCraft` had NO CALLER; `state.protections` was READ at
// `encounters.js:189` and ASSIGNED NOWHERE; `tickProtections` was CALLED BY NOTHING, so a rank-2 guard with
// `rounds: 3` would have stood forever. AUTHORED → REGISTERED → LOADED → and dead at the fourth door.
//
// ⛔ THIS IS A WIRING GATE, NOT A MODULE GATE, and the distinction is the whole point: `interceptorFor` and
// `protectionFromCraft` both passed their own tests the entire time they were unreachable. §4 runs a REAL
// ROUND and asks who is holding the wound afterwards.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { battleRound } from "../engine/skill_battle.js";
import { protectionFromCraft, interceptorFor, tickProtections, catchesDamage } from "../engine/intercept.js";
import { authoredBlock } from "../engine/craftmechanics.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rd = (p) => readFileSync(join(root, p), "utf8");

let pass = 0; const fails = [];
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`ok    ${name}`); }
  else { fails.push(name); console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
};

const abilities = rj("content/packs/core/abilities/reach_violence_peace.json").abilities || [];
const step = abilities.find(a => a.id === "step_between");

/* ══ §1 — THE CONTENT DOOR ═══════════════════════════════════════════════════════════════════════ */
check("§1: `step_between` exists and authors interceptDamage", !!step && !!authoredBlock(step, "interceptDamage", 1));
// ⛔ ERIK 2026-08-29 STRUCK `costsAction`: "I don't think it needs costs action on top of the fact that
// you're using your action to use the skill." Declaring a craft ALREADY spends the action.
check("§1: no rung re-charges the action — declaring the craft already spends it",
  (step?.tree || []).every(r => !(r.interceptDamage && "costsAction" in r.interceptDamage)));
// ⚠️ NON-VACUITY, AND IT CAUGHT A REAL GAP. When Erik struck `costsAction` it was the ONLY difference
// between r2 and r3, so both rungs became `{allies:2, rounds:3}` and the third rank bought NOTHING. Aevi
// reshaped the ladder on 2026-08-29 — one blow → duration → reach. ⛔ THIS ASSERTS EVERY RUNG STILL BUYS
// SOMETHING, generally, so the gap cannot quietly reopen the next time a flag is struck.
const rungs = [1, 2, 3].map(r => JSON.stringify(authoredBlock(step, "interceptDamage", r)));
check("§1: every rank buys something the one below it did not",
  rungs[0] !== rungs[1] && rungs[1] !== rungs[2], rungs.join("  |  "));

/* ══ §2 — THE READER DOOR ════════════════════════════════════════════════════════════════════════ */
const prot = protectionFromCraft(step, 2, { protectorId: "brann", allyId: "sprig", authoredBlock });
check("§2: it opens a protection that CATCHES BLOWS, not only bindings", !!prot && catchesDamage(prot));
check("§2: …carrying the authored duration rather than a rank guess", prot?.roundsLeft === 3, String(prot?.roundsLeft));
check("§2: …and naming the craft it came from", prot?.fromCraft === "step_between");
// ✅ AEVI'S RESHAPED LADDER, LOCKED: one blow → duration → REACH. r3's whole point is covering more than
// one person, and it is the number `sbOpenGuards` slices the pick to — so if it stops arriving, a player
// who paid for r3 silently gets r2.
{
  const r1 = protectionFromCraft(step, 1, { protectorId: "brann", allyId: "sprig", authoredBlock });
  const r3 = protectionFromCraft(step, 3, { protectorId: "brann", allyId: "sprig", authoredBlock });
  check("§2: r1 is ONE blow for ONE ally", r1.allies === 1 && r1.chargesLeft === 1 && r1.roundsLeft == null);
  check("§2: r3 buys REACH — the number the pick is sliced to", r3.allies > r1.allies, `r1=${r1.allies} r3=${r3.allies}`);
}

/* ══ §3 — THE WRITER DOOR, which is the one that did not exist ═══════════════════════════════════ */
const appSrc = rd("app.js") + "\n" + rd("engine/battle_turn.js");   // §71 (2026-09-05): openGuards lives in the engine; app.js delegates
check("§3: app.js CALLS protectionFromCraft — the caller it never had",
  appSrc.includes("protectionFromCraft(g.ability"));
check("§3: …and WRITES state.protections — the assignment that existed nowhere",
  appSrc.includes("encState.protections = list") && appSrc.includes("openGuards(character, enc?.state, decl"));
// ⛔ AND THE DECAY, or a rank-2 guard stands forever and becomes the wall the action cost prevents.
check("§3: tickProtections is called each round", appSrc.includes("tickProtections(enc.state.protections)"));
// ⚠️ DISPATCHED ON THE AUTHORED BLOCK, NOT A CRAFT NAME — `step_between` has no single `function`, and a
// name-based branch would have worked for one craft and silently ignored the next Aevi writes.
check("§3: the dispatch reads the authored block, never a hardcoded craft id",
  !/["']step_between["']/.test(appSrc), "app.js must not name the craft");
// ⛔ THE PICK IS SPENT. Leaving it set would re-place the guard free every round.
check("§3: the pick is cleared once the guard opens", appSrc.includes("enc.state.guardPick = []"));
// ✅ AND THE MISSING QUESTION IS ASKED — the affordance this mechanic could not work without.
check("§3: the interface asks WHO you are stepping in front of", appSrc.includes("data-sbguard"));

/* ══ §4 — THE BEHAVIOUR. A real round, and who is holding the wound. ═════════════════════════════ */
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;
const rng = () => 0.5;
const sheet = (o = {}) => ({ attributes: { physical: 3, mental: 3, social: 3, practical: 3 }, energy: 100, health: 30, skills: [], ...o });
const allies = [
  { id: "char-me", name: "You", isPlayer: true, present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet() },
  { id: "brann", name: "Brann", present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet({ health: 40, soak: 5 }) },
  { id: "sprig", name: "Sprig", present: true, contributions: ["RESTORE"], sheet: sheet({ health: 10, soak: 0, attributes: { physical: 1 } }) },
];
const swing = (protections) => battleRound({
  playerDecl: { function: "reveal", tier: 1, attribute: "mental", intensity: "standard", name: "look" },
  oppDecl: { function: "strike", tier: 8, attribute: "physical", intensity: "surge", name: "a heavy swing" },
  playerSheet: sheet(), oppSheet: sheet({ attributes: { physical: 7, mental: 7, social: 7, practical: 7 } }),
  state: { momentum: 0, round: 1 }, rules, sb, steps, rng, allies,
  targetPolicy: "weakest", protections,
});

const bare = swing(null);
const guarded = swing([protectionFromCraft(step, 2, { protectorId: "brann", allyId: "sprig", authoredBlock })]);

// ⛔ NON-VACUITY FIRST: without a guard the blow must actually reach Sprig, or §4 asserts nothing at all.
check("§4: WITHOUT a guard the blow lands on Sprig (non-vacuity)",
  bare?.damage?.onId === "sprig", `onId=${bare?.damage?.onId ?? "none"}`);
check("§4: WITH a guard, Brann is holding the wound instead",
  guarded?.damage?.onId === "brann", `onId=${guarded?.damage?.onId ?? "none"}`);
check("§4: …and the receipt says on whose behalf",
  guarded?.damage?.intercepted?.onBehalfOf === "sprig", JSON.stringify(guarded?.damage?.intercepted || null));

/* ══ §5 — DECAY. A guard that never lapses is the wall the action cost is meant to prevent. ══════ */
{
  let live = [protectionFromCraft(step, 2, { protectorId: "brann", allyId: "sprig", authoredBlock })];
  for (let i = 0; i < 3; i++) live = tickProtections(live);
  const stillGuarding = interceptorFor("sprig", live.filter(catchesDamage), {});
  check("§5: a rank-2 guard lapses after its authored rounds", !stillGuarding,
    `rounds left: ${live[0]?.roundsLeft}`);
}

console.log("\n" + "═".repeat(92));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S)`);
if (fails.length) { console.log("\n  ⛔ THE INTERPOSE CHAIN IS BROKEN:"); fails.forEach(f => console.log("     " + f)); }
console.log("═".repeat(92) + "\n");
process.exitCode = fails.length ? 1 : 0;
