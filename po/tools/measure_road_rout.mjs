// ⛑ AEVI'S RULING 2 (REPLY_aevi_ccode_558_561), AND HER GATE, IN HER OWN WORDS:
//   *"Gate: in expectation, sending people is never worse for the load than sending nobody, at every escort size and
//    danger 1–5 (your 2,000-run table, as the gate). If 0.35 doesn't clear it, lower it until it does and report the
//    number."*
//
// ⛔ THE INVERSION THIS CLOSES: an escort that ALL DIES loses the whole load (Erik's wipe rule). A SMALL escort is the
// easiest to wipe entirely — so without a cap, sending two guards can be worse for the load than sending nobody, which
// is the opposite of what an escort is for. Driven through `resolveRoadHazard`, the engine's own road path.
// Nothing is written.
import { readFileSync } from "node:fs";
const CV = await import("../../engine/caravan.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const econ = C.rules.economy;
const RUNS = 2000;

// ⛑ SEEDED, so the table is the same table whenever anybody re-runs it.
const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; };

const cfgWith = (cap) => {
  const base = JSON.parse(JSON.stringify({ ...econ.holdStore, features: econ.holdFeatures }));
  base.trade = { ...(base.trade || {}), ...(cap == null ? {} : { roadRoutRisk: cap }) };
  return base;
};

const UNITS = 20;
/** one road hazard, through the engine's own path → units that survived it */
function oneRun(escortSize, danger, seed, cfg) {
  const rng = mulberry(seed);
  const people = {};
  const crew = Array.from({ length: escortSize }, (_, i) => `g${i}`);
  for (const id of crew) people[id] = { id, name: `Guard ${id}`, level: 2, health: 20, maxHealth: 20 };
  const ch = { name: "T", level: 10, purse: { crystal: 9999, scrip: {} }, npcRegistry: { ...people } };
  // ⚠️ `load`, NOT `goods`. My first version of this file set `goods` and read `goods`, while the engine takes from
  // `car.load` — so every one of the 70,000 runs reported 20.00 of 20 arriving and the table agreed with every rule I
  // could have written. A fixture that makes nothing agrees with everything.
  const car = { id: "c1", from: "millbrook", toId: "the_axis_gate", fromId: "millbrook",
    units: UNITS, load: { raw_material: UNITS }, carriers: [...crew], crew: [...crew], events: [], danger };
  try {
    const r = CV.resolveRoadHazard(ch, car, { rng, cfg, people, day: 1, where: null,
      meleeCfg: C.rules?.death?.melee || {}, npcCfg: C.rules?.npcStanding || {} });
    const left = Object.values(car.load || {}).reduce((a, n) => a + (Number(n) || 0), 0);
    // ⛑ the driver reports WHETHER A FIGHT HAPPENED, so a table of identical numbers can never again be mistaken
    // for a rule. `carriers` is the field the engine reads — `crew` is not, and that cost me a whole run of this table.
    return { left: Number.isFinite(left) ? left : Number(car.units) || 0, fought: !!r?.fought, wiped: !!r?.wiped, fell: (r?.fallen || []).length };
  } catch (e) { return { err: e.message }; }
}

/* ══ THE TABLE ═══════════════════════════════════════════════════════════════════════════ */
function table(cap) {
  const rows = [];
  const fights = {};
  for (let danger = 1; danger <= 5; danger++) {
    const byEscort = {};
    for (const size of [0, 1, 2, 3, 4, 6, 8]) {
      let kept = 0, bad = 0;
      for (let i = 0; i < RUNS; i++) {
        const r = oneRun(size, danger, danger * 100000 + size * 1000 + i, cfgWith(cap));
        if (r && r.err) return { err: r.err };
        kept += r.left; if (r.fought) bad++;
      }
      byEscort[size] = kept / RUNS;
      fights[size] = (fights[size] || 0) + bad;
    }
    rows.push({ danger, byEscort });
  }
  return { rows, fights };
}

const show = (cap, label) => {
  const t = table(cap);
  if (t.err) { console.log(`  ⛔ ${t.err}`); return null; }
  console.log(`\n══ ${label}  — mean units of ${UNITS} that arrive, over ${RUNS} runs each\n`);
  console.log(`  danger   ` + [0, 1, 2, 3, 4, 6, 8].map(s => `esc ${s}`.padStart(8)).join(""));
  let worst = null;
  for (const r of t.rows) {
    const none = r.byEscort[0];
    console.log(`  ${String(r.danger).padEnd(9)}` + [0, 1, 2, 3, 4, 6, 8].map(s => r.byEscort[s].toFixed(2).padStart(8)).join(""));
    for (const s of [1, 2, 3, 4, 6, 8]) {
      const delta = r.byEscort[s] - none;
      if (worst === null || delta < worst.delta) worst = { danger: r.danger, size: s, delta, with: r.byEscort[s], none };
    }
  }
  console.log(`\n  ⛑ the WORST case for her gate: danger ${worst.danger}, escort ${worst.size} — ${worst.with.toFixed(2)} arrive with them, ${worst.none.toFixed(2)} with nobody (${worst.delta >= 0 ? "+" : ""}${worst.delta.toFixed(2)})`);
  console.log(`  ${worst.delta >= 0 ? "✅ sending people is never worse for the load than sending nobody" : "⛔ SENDING PEOPLE IS WORSE — the gate does not clear"}`);
  return worst;
};

console.log(`\n⛑ Erik's wipe rule is unchanged: an escort that ALL dies loses the whole load. The cap is on a ROUT's personal`);
console.log(`   risk, on a road only, and \`legionClash\` is untouched — a legion's soldiers do not get to run.`);
const before = show(1, "WITHOUT the cap (as it shipped)");
const at035 = show(0.35, "WITH Aevi's 0.35");

if (at035 && at035.delta < 0) {
  console.log(`\n⚠️ 0.35 DOES NOT CLEAR HER GATE. She said: "lower it until it does and report the number." Sweeping:`);
  for (const cap of [0.30, 0.25, 0.20, 0.15, 0.10]) {
    const w = show(cap, `WITH ${cap}`);
    if (w && w.delta >= 0) { console.log(`\n✅ THE NUMBER IS ${cap} — the lowest tried that clears her gate at every escort size and danger 1–5.`); break; }
  }
} else if (at035) {
  console.log(`\n✅ 0.35 CLEARS HER GATE as written — no lowering needed, and the number stays hers.`);
}
