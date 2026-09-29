// ⛑ SNG-665 — DRIVE IT ON LOKI'S OWN SAVE, ON A CLONE. The migration, the allocation, and twenty passes of the real
// tick, so §3's gate ("the tick's actual earnings land within the card's forecast band") is measured rather than hoped.
// Nothing writes to characters/.
import { readFileSync } from "node:fs";
const CV = await import("../../engine/caravan.js");
const H = await import("../../engine/holdings.js");
const R = await import("../../engine/reconcile.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
const L = C.locations;
const deps = { cfg, economy: econ, locations: L, powers: C.powers, rules: C.rules };

const src = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const ch = JSON.parse(JSON.stringify(src));
ch.caravans = [];   // ⛑ the cart that has been walking since day 90 would (correctly) block its own run all twenty passes
const h0 = ch.holdings[0];
console.log(`\n── ${ch.name} / ${h0.name}: keeper ${h0.steward || "none"}, store ${JSON.stringify(h0.store)}, route ${JSON.stringify(h0.route)}`);

/* ── 1 · THE MIGRATION, THROUGH THE RUNNER ────────────────────────────────────────────── */
console.log(`\n1 · THE MIGRATION (reconcile, version ${ch.reconcileVersion} →)`);
const res = R.reconcile(ch, "character", {});
for (const n of res.notes) console.log(`   ${n}`);
if (res.warnings.length) console.log(`   ⛔ ${res.warnings.join(" | ")}`);
const h = ch.holdings[0];
console.log(`   reconcileVersion → ${ch.reconcileVersion}`);
console.log(`   route gone? ${h.route ? "⛔ still there" : "yes"} · runs ${JSON.stringify(h.runs)}`);
console.log(`   the cart already walking claimed? ${(ch.caravans || []).map(c => `${c.id.slice(0, 28)} runId=${c.runId || "⛔ none"}`).join(", ") || "no carts"}`);

/* ── 2 · WHAT THE SCREEN WOULD SAY ────────────────────────────────────────────────────── */
const split = CV.allocatePass(ch, h, deps);
console.log(`\n2 · THE SPLIT — the one answer the screen prints and the tick spends`);
console.log(`   ${split.said}`);
console.log(`   makes ${split.total} · a unit fetches ${split.perUnit} here (${split.netPerUnit} after the fee) · keeper sells ${split.sellShare} of the store`);
console.log(`   reserve ${split.reserve} (toggle ${split.reserveOn ? "on" : "off"}) · runs ${JSON.stringify(split.runs)} · home ${split.home}`);
const tgt = CV.runLoadTarget(ch, h, h.runs[0], { locations: L, cfg });
console.log(`   the run's cart leaves at ${tgt.units} unit(s) — ${tgt.per}/pass × ${tgt.passes} pass(es), a ${tgt.roundTripDays}-day round trip${tgt.cap ? `, capped at ${tgt.cap}` : " (no authored carry cap)"}`);

/* ── 3 · TURN THE TOGGLE OFF, AND SET A SMALLER RUN ───────────────────────────────────── */
console.log(`\n3 · THE DIAL — what Erik asked for: "put more or less into a run… see the effect"`);
h.runs[0].wholeProduct = false;
for (const units of [0, 2, 4, 8, 20]) {
  CV.setRunUnits(ch, h.id, h.runs[0].id, units);
  const s = CV.allocatePass(ch, h, deps);
  console.log(`   asking ${String(units).padStart(2)} → getting ${String(s.runs[0].getting).padStart(2)}${s.runs[0].short ? " (short)" : "      "} · reserve ${s.reserve} · sold here ${s.home}`);
}
h.reserveUpkeep = false;
const off = CV.allocatePass(ch, h, deps);
console.log(`   toggle OFF, asking 20 → getting ${off.runs[0].getting}, reserve ${off.reserve}, sold here ${off.home}`);
h.reserveUpkeep = true;
CV.setRunUnits(ch, h.id, h.runs[0].id, 4);

/* ── 4 · TWENTY PASSES OF THE REAL TICK ───────────────────────────────────────────────── */
console.log(`\n4 · TWENTY PASSES — does the keeper sell at home every pass now?`);
const people = { ...(C.npcs || {}), ...(ch.npcRegistry || {}) };
let sold = 0, passes = 0, departures = 0;
const purse0 = JSON.stringify(ch.purse);
for (let p = 1; p <= 20; p++) {
  // ⛑ exactly what `worldtick` passes — including `divert`, or the runs never draw and the driver measures an engine
  // the game does not run.
  const st = H.tickStore(ch, h, { cfg, economy: econ, regionId: L[h.locationId]?.regionId || null, rng: () => 0.99,
    day: 1000 + p * 3, people, locations: L, rules: C.rules, powers: C.powers, divert: CV.divertToRuns });
  const notes = CV.runStandingRoutes(ch, { locations: L, cfg, economy: econ, powers: C.powers, rules: C.rules, day: 1000 + p * 3, people });
  CV.tickCaravans(ch, { locations: L, cfg, economy: econ, day: 1000 + p * 3, people, rng: () => 0.99 });   // ⛑ or the cart never comes home and its run is busy forever
  passes++;
  if (st?.sold || st?.earned) sold++;
  departures += notes.filter(n => n.kind === "departure").length;
  if (p <= 3 || p === 20 || notes.some(n => n.kind === "departure")) console.log(`   pass ${String(p).padStart(2)}: ${h.condition} · store ${JSON.stringify(h.store)} · gathered ${JSON.stringify(h.runs[0].gathered)} · ${notes.map(n => n.kind).join(",") || "—"}`);
}
console.log(`   ${passes} passes · ${departures} departure(s) · purse ${purse0} → ${JSON.stringify(ch.purse)}`);
console.log(`   ⛑ the old rule earned NOTHING at home for 26 passes; this is the test of the ruling.`);

/* ── 5 · THE CONTROL: the same twenty passes with NO runs, because "the condition fell" is only a finding if it does
   not fall anyway. ── */
const ctl = JSON.parse(JSON.stringify(src)); ctl.caravans = [];
R.reconcile(ctl, "character", {});
const ch2 = ctl, h2 = ch2.holdings[0];
h2.runs = [];
const ppl2 = { ...(C.npcs || {}), ...(ch2.npcRegistry || {}) };
for (let p = 1; p <= 20; p++) H.tickStore(ch2, h2, { cfg, economy: econ, regionId: L[h2.locationId]?.regionId || null, rng: () => 0.99, day: 1000 + p * 3, people: ppl2, locations: L, rules: C.rules, powers: C.powers, divert: CV.divertToRuns });
console.log(`
5 · CONTROL, no runs at all: condition ${h2.condition}, store ${JSON.stringify(h2.store)}, purse ${JSON.stringify(ch2.purse)}`);
console.log(`   ⛑ if the run version ends in the same condition, the runs are not starving the hold — §1.4's own gate.`);
