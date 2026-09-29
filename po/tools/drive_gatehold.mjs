// ⛑ SNG-663 §2c — DRIVE THE WHOLE ARC: take a gate, feel the stigma, watch the clock climb through four seasons, and
// let it go. On a CLONE; nothing here writes to characters/.
//
// ⛔ THE FIRST THING IT CHECKS IS THAT IT DOES NOTHING. Aevi's design turns on "holding the ground is not holding the
// gate", and the measurement said why: five powers hold a place that still carries an arch, and TWO PLAYERS keep a
// garrisoned holding at `gen-the-made-gate`. A rule derived from holds-or-garrisons would wake seven holders on day one,
// two of them explicitly exempt.
import { readFileSync, readdirSync } from "node:fs";
const G = await import("../../engine/gatehold.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const rules = C.rules;
const per = G.seasonDays(rules);
console.log(`\na season here is ${per} days, derived from the world's own ${C.rules?.worldClock?.calendar?.yearDays || 144}-day year`);
console.log(`the Lattice laid ${G.latticeGates(C.locations).length} arches; the made ones are nobody's inheritance`);

/* ── 0 · IT WAKES NOBODY ────────────────────────────────────────────────────────────────── */
console.log(`\n0 · ON DAY ONE, WHO IS HOLDING AN ARCH?`);
let holders = 0;
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) {
    if (!f.endsWith(".json")) continue;
    let ch; try { ch = JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8")); } catch { continue; }
    const held = Object.keys(G.gatesHeldBy(ch));
    const pass = G.gateHoldPass(JSON.parse(JSON.stringify(ch)), { content: C, rules, day: 400 });
    if (held.length || pass.news.length || pass.keepers.length) { holders++; console.log(`   ⛔ ${ch.name}: ${JSON.stringify(held)} · ${pass.news.length} line(s)`); }
  }
}
console.log(`   ${holders === 0 ? "nobody — the feature is silent until somebody acts, which is §2c's whole point" : "⛔ " + holders + " woke"}`);
for (const p of (C.powers || [])) if (G.gateHeldByPower(p)) console.log(`   power holding: ${p.name} at ${G.gateHeldByPower(p)}`);

/* ── 1 · THE EXEMPTION ──────────────────────────────────────────────────────────────────── */
const silas = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
console.log(`\n1 · THE MADE GATE IS EXEMPT (§2c.3) — Silas holds a garrisoned holding there:`);
const made = G.takeGate(silas, "gen-the-made-gate", { how: "garrisoned", content: { ...C, locations: { ...C.locations, ...(silas.generated?.location || {}) } }, rules, day: 100 });
console.log(`   takeGate → ok=${made.ok}  ${made.why || made.said}`);

/* ── 2 · TAKING ONE OF THE LATTICE'S ────────────────────────────────────────────────────── */
const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
const before = Object.entries(ch.powerState || {}).filter(([, s]) => Number.isFinite(Number(s?.standing))).length;
console.log(`\n2 · TAKING THE AXIS GATE — he knows ${before} power(s) well enough to have a standing with them:`);
const took = G.takeGate(ch, "the_axis_gate", { how: "tolled", content: C, rules, day: 100 });
console.log(`   takeGate → ok=${took.ok}`);
console.log(`   said: ${took.said}`);
console.log(`   stigma landed on ${took.moved.length} power(s): ${took.moved.slice(0, 4).map(m => `${m.name} ${m.from}→${m.to}`).join(", ")}${took.moved.length > 4 ? ", …" : ""}`);
console.log(`   the record: ${JSON.stringify(ch.gatesHeld)}`);
const again = G.takeGate(ch, "the_axis_gate", { how: "tolled", content: C, rules, day: 101 });
console.log(`   taking it twice → ok=${again.ok}, ${again.why}`);

/* ── 3 · THE CLOCK ──────────────────────────────────────────────────────────────────────── */
console.log(`\n3 · FOUR SEASONS OF HOLDING IT — one pass per season, and the rungs climb:`);
console.log(`   day       rung        what came through`);
for (const day of [100, 110, 100 + per, 100 + per * 2, 100 + per * 3, 100 + per * 4, 100 + per * 5]) {
  const out = G.gateHoldPass(ch, { content: C, rules, day });
  const k = out.keepers[0];
  console.log(`   ${String(day).padStart(4)}   ${String(G.keeperRungAt(100, day, { rules })).padStart(2)} ${G.GATE_HOLD.rungs[G.keeperRungAt(100, day, { rules })].padEnd(10)} ${k ? `${k.creature.name} (${k.tier})` : out.news.find(n => /hummed/.test(n)) ? "the signs" : "—"}${out.stigma.length ? `   · stigma drifted on ${out.stigma.length}` : ""}`);
}
console.log(`\n   the readout a card would show: ${JSON.stringify(G.gateHoldReadout(ch, { content: C, rules, day: 100 + per * 2 })[0], null, 1).slice(0, 420)}`);

/* ── 4 · LETTING IT GO STOPS IT ─────────────────────────────────────────────────────────── */
console.log(`\n4 · LETTING IT GO — §2c's own escape:`);
const let_go = G.releaseGate(ch, "the_axis_gate", { content: C, day: 100 + per * 5 });
console.log(`   releaseGate → ok=${let_go.ok}  ${let_go.said}`);
const after = G.gateHoldPass(ch, { content: C, rules, day: 100 + per * 9 });
console.log(`   four more seasons later: ${after.news.length} line(s), ${after.keepers.length} keeper(s) — ${after.keepers.length ? "⛔ STILL COMING" : "it stopped"}`);
