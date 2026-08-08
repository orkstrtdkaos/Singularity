// circuit_sim.mjs — SNG-366. THE UNFIRED CIRCUITS. Erik: "run some player sims that can fire all the
// unfired circuits so far… to test them out."
//
// ⛔ THE FAILURE THIS EXISTS FOR IS SILENCE, NOT ERROR. Silas's op-emission panel shows FOURTEEN ops never
// emitted in 287 turns, and Aevi measured the matching thing on the engine side: all three of his delegated
// charges have `lastMovedWorldCount === stampedAtWorldCount` and `progress: 0` — not one has ever advanced
// across 915 actions and 22 sessions. Nothing errored. Nothing was reported. The code simply never ran.
//
// ⚠️ A GREEN SUITE CANNOT SEE THIS. Every gate we own asks "does this behave correctly when invoked?" —
// none asks "is it ever invoked at all?" A path with a perfect unit test and no caller passes CI forever.
//
// ⛔ AND IT SEPARATES TWO KINDS OF SILENCE, because they have different owners:
//   ENGINE circuit — the engine decides when it fires. Silence is a DEFECT and this harness proves it.
//   GM op         — the model decides. The engine can only make it REACHABLE; whether it is chosen is a
//                   prompt question, and calling that a bug here would be blaming the narrator for a door
//                   nobody built. Those are reported separately and NOT failed.
//
// Run: node tests/circuit_sim.mjs

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadContentHeadless } from "./headless_content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = await loadContentHeadless();
const rules = C.rules;

const results = [];
const circuit = async (name, why, fn) => {
  try {
    const r = await fn();
    results.push({ name, why, ...r });
  } catch (e) {
    results.push({ name, why, fired: false, detail: `threw: ${e.message}` });
  }
};

// ══════════════════════════════════════════════════════════════════════════════════════════════
// 1 — THE WORLD TICK, and the two gates Aevi found stacked in front of it
// ══════════════════════════════════════════════════════════════════════════════════════════════
const { runWorldTick } = await import("../engine/worldtick.js");
const { advanceAssignment } = await import("../engine/assignments.js");

await circuit("world tick fires at all", "runWorldTick returns {ticked:false} when elapsed <= 0", async () => {
  const ch = { worldState: { lastTickDay: 14, eventStages: {}, spectrumDrift: {}, assignments: {} }, clock: { day: 14 } };
  const same = await runWorldTick({ character: ch, content: C, currentDay: 14, advanceAssignments: async () => ({ advancements: [] }) });
  const later = await runWorldTick({ character: ch, content: C, currentDay: 18, advanceAssignments: async () => ({ advancements: [] }) });
  return { fired: later.ticked === true, detail: `day14→day14 ticked=${same.ticked} (Silas's live state) · day14→day18 ticked=${later.ticked}` };
});

await circuit("delegated work advances", "assignments need a tick AND elapsed >= 3 CHARACTER days", async () => {
  const a = { id: "x", npcId: "n", npcName: "Cassiel Ord", charge: "rebuild the post", status: "working", progress: 0, stampedAtWorldCount: 566, lastMovedWorldCount: 566 };
  const ch = { worldState: { lastTickDay: 10, eventStages: {}, spectrumDrift: {}, assignments: { x: a } }, clock: { day: 10 }, npcRegistry: {} };
  await runWorldTick({ character: ch, content: C, currentDay: 14,
    advanceAssignments: async () => ({ advancements: [{ assignmentId: "x", outcome: "progress", note: "the frame is up" }] }) });
  return { fired: a.progress > 0, detail: `progress ${a.progress}, status ${a.status} (live: 3 of 3 charges sit at progress 0)` };
});

await circuit("delegated work can COMPLETE", "the `done` path — nothing in play has ever reached it", async () => {
  const a = { id: "y", status: "working", progress: 2 };
  advanceAssignment(a, "done", 900);
  return { fired: a.status === "done", detail: `status ${a.status} — reachable in code; UNREACHED in 915 actions` };
});

// ══════════════════════════════════════════════════════════════════════════════════════════════
// 2 — CIRCUITS BUILT THIS SESSION. Each shipped green; none has fired in a real save yet.
// ══════════════════════════════════════════════════════════════════════════════════════════════
const { applyLadderGrants } = await import("../engine/ladder.js");
const { grantMartialKit } = await import("../engine/martial.js");
const { applyPartyOps, activeCompany } = await import("../engine/company.js");
const { newsReach, collapseLedgerEvents } = await import("../engine/worldtick.js");
const { incapacitationOutcome } = await import("../engine/incapacitation.js");

await circuit("ladder derived grants (SNG-356)", "pays maxHealth/maxEnergy from the authored ladder", async () => {
  const ch = { subAttributes: { strength: 5, reason: 5 }, maxHealth: 50, health: 50, maxEnergy: 100, energy: 100 };
  const g = applyLadderGrants(ch, rules.subAttributeLadder);
  return { fired: g.length > 0 && ch.maxHealth > 50, detail: `${g.length} grant(s), maxHealth 50→${ch.maxHealth}` };
});

await circuit("martial floor (SNG-345)", "four free abilities at creation and on login", async () => {
  const ch = { abilities: [] };
  const g = grantMartialKit(ch, rules.martialPaths);
  return { fired: g.granted.length === 4, detail: `granted ${g.granted.join(", ") || "nothing"}` };
});

await circuit("party depart op (SNG-355)", "partyOps — emitted 0 times in 287 turns (it is NEW)", async () => {
  const ch = { npcRegistry: { calvar: { name: "Calvar" } }, company: [{ npcId: "calvar", roles: ["ally"], joinedDay: 18 }] };
  const r = applyPartyOps(ch, [{ op: "depart", npcId: "calvar", why: "turned back" }], { day: 34 });
  return { fired: r.departed.length === 1 && activeCompany(ch).length === 0, detail: `departed ${r.departed.length}, active ${activeCompany(ch).length}` };
});

await circuit("news distance gate (SNG-363)", "a small far event must NOT reach you", async () => {
  const R = { "march.redline": "march" };
  const far = newsReach({ whereCommunity: "march.redline" }, { myCommunity: "valley.millbrook", myRegion: "valley", regionOfCommunity: R, weight: 0.05 });
  return { fired: far.heard === false, detail: `far/small heard=${far.heard} (${far.why})` };
});

await circuit("ledger collapse (SNG-363 §3)", "two tellings of one beat, minutes apart", async () => {
  const out = collapseLedgerEvents([
    { who: "a", where: "w", worldDay: 37, at: "2026-08-06T18:06:00Z", what: "the sealed veil opened and a messenger crossed", tags: [] },
    { who: "a", where: "w", worldDay: 37, at: "2026-08-06T18:10:00Z", what: "the sealed veil opened by choice and allowed safe passage", tags: [] },
  ]);
  return { fired: out.length === 1, detail: `2 → ${out.length}` };
});

await circuit("player incapacitation (SNG-309)", "health <= 0 must produce an OUTCOME, not a game over", async () => {
  const o = incapacitationOutcome({ aggressor: { kind: "raider" }, companions: [], rules });
  return { fired: !!o && !!o.outcome, detail: `outcome ${o?.outcome ?? "none"} — has this ever fired in play?` };
});

// ══════════════════════════════════════════════════════════════════════════════════════════════
// 3 — WHAT THE LIVE SAVES SAY: which of these has ever actually happened
// ══════════════════════════════════════════════════════════════════════════════════════════════
const saves = [];
if (existsSync(join(root, "characters"))) {
  for (const d of readdirSync(join(root, "characters"))) {
    let fs2 = []; try { fs2 = readdirSync(join(root, "characters", d)).filter(f => f.endsWith(".json")); } catch { continue; }
    for (const f of fs2) { try { saves.push(JSON.parse(readFileSync(join(root, "characters", d, f), "utf8"))); } catch {} }
  }
}
const played = saves.filter(s => Number(s.actionCount) > 0);

// ---------- report ----------
console.log("═".repeat(98));
console.log("SNG-366 — UNFIRED CIRCUITS.  Which engine paths have never run, and which gate holds them shut.");
console.log("═".repeat(98));
console.log("\nENGINE CIRCUITS — the engine decides when these fire, so silence here is a DEFECT.\n");
for (const r of results) {
  console.log(`  ${r.fired ? "FIRES " : "SILENT"}  ${r.name}`);
  console.log(`          ${r.why}`);
  console.log(`          → ${r.detail}`);
}

console.log("\n" + "─".repeat(98));
console.log("IN THE LIVE SAVES — has it ever actually happened?\n");
const stat = (label, n, of, note = "") => console.log(`  ${String(n).padStart(3)}/${String(of).padEnd(3)} ${label}${note ? "   " + note : ""}`);
let everTicked = 0, everAdvanced = 0, anyAssign = 0, ladderPaid = 0, baseline = 0, departed = 0;
for (const s of played) {
  const ws = s.worldState || {};
  const asg = Object.values(ws.assignments || {});
  if (asg.length) anyAssign++;
  if (asg.some(a => (a.progress || 0) > 0)) everAdvanced++;
  if ((ws.lastTickDay ?? 0) > 1) everTicked++;
  if (s.ladderPaid && Object.keys(s.ladderPaid).length) ladderPaid++;
  if ((s.abilities || []).some(a => a.baseline)) baseline++;
  if ((s.company || []).some(m => m.leftDay)) departed++;
}
stat("characters with delegated work", anyAssign, played.length);
stat("…whose work has EVER advanced", everAdvanced, anyAssign, everAdvanced === 0 ? "⛔ not one, ever" : "");
stat("characters whose world tick has moved", everTicked, played.length);
stat("characters paid by the ladder", ladderPaid, played.length, ladderPaid === 0 ? "(new — expected until next login)" : "");
stat("characters holding the martial floor", baseline, played.length, baseline === 0 ? "(new — expected until next login)" : "");
stat("characters with a recorded departure", departed, played.length, departed === 0 ? "(new — the op has never been emitted)" : "");

console.log("\n" + "─".repeat(98));
console.log("⛔ THE TWO GATES IN FRONT OF EVERYTHING (Aevi, measured, and reproduced here):");
console.log("   1. runWorldTick returns {ticked:false} when elapsed <= 0. Silas: clock day 14, lastTickDay 14.");
console.log("   2. assignments additionally need elapsed >= 3 CHARACTER days.");
console.log("   His clock moved 14 days across 915 actions — roughly 65 actions per in-game day — while the");
console.log("   shared world day reached 28+. ⚠️ THE TICK IS GATED ON THE SLOWEST CLOCK IN THE GAME.");
console.log("");
console.log("⛔ AND THE DIAL, NAMED PRECISELY — app.js maybeTick():");
console.log("     const currentDay = readClock(character.clock).day;   // the CHARACTER's clock");
console.log("   The world tick — the machinery whose whole purpose is the world moving WITHOUT the player —");
console.log("   is gated on the player's own clock. `absoluteWorldDay()` exists and reached 28+ while this");
console.log("   read 14. A world that only turns when you sleep is not turning on its own.");
console.log("   ⚠️ REPORTED, NOT CHANGED: which clock drives the world is a design decision (Erik), and");
console.log("      sim-before-tweak is the standing rule. The one-line shape of the fix is above.");
console.log("\n⚠️ GM-EMITTED OPS ARE NOT JUDGED HERE. 14 never emitted in 287 turns (adoptSchool, arcOps,");
console.log("   deriveItem, gambitOps, markDefiningMoment, markTeacher, newAbility, offerAcquisition,");
console.log("   offerIntent, offerPromotion, partyOps, stateOps, unlockPrecursor, unlockSubstrate). The");
console.log("   engine can only make those REACHABLE; whether the model chooses one is a prompt question,");
console.log("   and failing the narrator here would be blaming it for a door nobody built.");
console.log("─".repeat(98));

const silent = results.filter(r => !r.fired);
console.log(silent.length ? `\n${silent.length} engine circuit(s) SILENT: ${silent.map(r => r.name).join(", ")}` : "\nevery engine circuit under test fires when driven.");
