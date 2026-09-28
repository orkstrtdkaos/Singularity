// ⛔ SNG-663 §2b / B1 — THE GATE YARDS, MEASURED. Run it and read it; nothing is written.
//
// Aevi: *"The `waygate` flag moves to the yard, and the town keeps a short leg to it. CCode: the reader, i.e. gate
// legs land at the yard, and a save standing IN a moved city is not stranded."*
//
// ⚑ THIS WAS A BEFORE-AND-AFTER TOOL FIRST. It built the after-world in memory and asked the shipped readers the same
// questions in both, and every difference was a reader that had to be taught the yard. Those differences are recorded
// below as the BEFORE column — they are history now, and each line says what it cost.
//
// ⛑ WHAT IT DOES NOW: asks the live world the same questions and answers them, so the numbers in
// po/CCODE_20260928_the_yards.md can be re-derived rather than believed.
import { readFileSync, readdirSync } from "node:fs";

const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const WG = await import("../../engine/waygate.js");
const J = await import("../../engine/journey.js");
const WM = await import("../../engine/worldmap.js");
const H = await import("../../engine/holdings.js");
const RC = await import("../../engine/reconcile.js");

const C = await loadContentHeadless();
const L = C.locations;
const hours = (a, b) => { const d = WM.walkingDays(a, b); return d == null ? null : Math.round(d * 24 * 10) / 10; };
const yards = Object.values(L).filter(WG.isGateYard);

console.log(`\n══ SNG-663 §2b — the fifteen gate yards ══\n`);

console.log(`── 1 · the walk out ──`);
console.log(`   BEFORE: every staged record declared \`_yardLeg: { hours: 1.5 }\` beside a \`worldPos\` 0.3° from its town.`);
console.log(`           At 300/π days per radian that is 12.0h — an 8× disagreement, and the road graph reads the POSITION.`);
console.log(`           the_crossing_gate_yard was authored AT the Crossing (colatitude 0 is the pole, where a longitude`);
console.log(`           offset is no offset), so its walk out was 0.0h: a yard you arrive in without leaving the city.`);
const legs = yards.map(y => ({ id: y.id, town: y.gateYardFor, h: hours(y, L[y.gateYardFor]) })).sort((a, b) => a.h - b.h);
console.log(`   NOW:    ${legs.length} yards, ${legs[0].h}h to ${legs[legs.length - 1].h}h, and nothing stores the number —`);
console.log(`           the distance between two placed locations is already the one answer to that question.`);

console.log(`\n── 2 · who holds a gate ──`);
const powers = C.powers || [];
const gateIds = new Set(Object.values(L).filter(l => l.waygate).map(l => l.id));
const holders = powers.filter(p => (p.holds || []).some(h => gateIds.has(h?.at)));
console.log(`   BEFORE: 9 powers held a location carrying a waygate — five in the wild, four in a town.`);
console.log(`   NOW:    ${holders.length} — ${holders.map(p => p.id.replace(/^power_/, "")).join(", ")}`);
console.log(`   ⛑ §2c's PREMISE LANDS HERE: the four that held a gate held the TOWN it stood in, and the gate moved`);
console.log(`      out from under them. "Holding a gate" is an act now, not an address.`);

console.log(`\n── 3 · the live saves ──`);
const step = RC.CHARACTER_STEPS.find(s => s.id === "the-gate-that-moved-out-of-town");
let repaired = 0;
for (const dir of readdirSync(new URL("../../characters", import.meta.url))) {
  let files = []; try { files = readdirSync(new URL(`../../characters/${dir}`, import.meta.url)); } catch { continue; }
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    let c; try { c = JSON.parse(readFileSync(new URL(`../../characters/${dir}/${f}`, import.meta.url), "utf8")); } catch { continue; }
    const idsOnly = (c.knownPlaces || []).filter(p => L[p]?.waygate).length;
    const withYards = WG.knownWaygates(c, L).length;
    const gained = step.apply(JSON.parse(JSON.stringify(c)), { content: { locations: L } });
    if (withYards !== idsOnly || (gained.notes || []).length) {
      repaired++;
      console.log(`   ${String(c.name).padEnd(18)} at ${String(c.currentLocationId).padEnd(26)} gates by id ${String(idsOnly).padStart(2)} · with the yard rule ${String(withYards).padStart(2)}`);
    }
  }
}
console.log(`   BEFORE: matching ids alone took HALF the discovered gates in the world away — Loki 18 → 9, Silas 4 → 2,`);
console.log(`           Brynjar 3 → 1 — and three saves were STANDING in a city whose gate had just walked out of it.`);
console.log(`   NOW:    ${repaired} saves are answered, by one rule (\`knowsGate\`) read by all four gate readers, and the`);
console.log(`           reconcile step writes the yard into the discovery ledger the map and travel read.`);

console.log(`\n── 4 · the two gates whose DEFAULT endpoint is a moved town ──`);
for (const l of Object.values(L)) {
  if (!l.waygateDefaultTo) continue;
  const arr = WG.gateArrivalFor(l.waygateDefaultTo, L);
  console.log(`   ${l.id.padEnd(22)} default → ${String(l.waygateDefaultTo).padEnd(14)} lands at ${arr.at}${arr.moved ? `  (${hours(arr.yard, arr.town)}h walk in)` : ""}`);
}
const made = { currentLocationId: "gen-the-made-gate", knownPlaces: ["gen-the-made-gate", "the_crossing"], subAttributes: { wits: 4 } };
console.log(`   BEFORE: \`resolveWaygateTransit\` returned NULL for this — ordinary travel, a 34-day walk standing in for`);
console.log(`           a gate, on Erik's own save. That is the exact bug §297 exists to forbid.`);
console.log(`   NOW:    ${JSON.stringify(WG.resolveWaygateTransit({ character: made, destId: "the_crossing", locations: L }))}`);

console.log(`\n── 5 · the hub ──`);
const hub = WG.hubWaygate(L);
console.log(`   ${hub.id} → "${WG.gateLabel(hub, L)}"`);
console.log(`   ⚠️ every GM sentence that names the hub reads the label, so canon stays canon: a yard is a PART of its town.`);

console.log(`\n── 6 · the journey is untouched ──`);
const r = J.routeBetween("millbrook", "the_crossing", L);
const g = (r?.options || []).find(o => o.kind === "gate"), road = (r?.options || []).find(o => o.kind === "road");
console.log(`   millbrook → the_crossing:  gate ${g?.days}d (walk ${g?.walkIn}d in, ${g?.gate.hours}h through to ${g?.gate.to}, walk ${g?.walkOut}d out) · road ${road?.days}d`);
console.log(`   ⛑ §99 asserts the gate is inside a week, the walk over a fortnight, an order of magnitude between them.`);

console.log(`\n── 7 · a raid by gate ──`);
const raiders = powers.filter(p => ((p.verbs || []).includes("raid") || (p.verbs || []).includes("toll")));
const reachYardTown = raiders.filter(p => (p.reach || []).some(a => L[a]?.gateYardId));
const holdWild = raiders.filter(p => (p.holds || []).some(h => gateIds.has(h?.at)));
console.log(`   ${raiders.length} of ${powers.length} powers raid or toll at all.`);
console.log(`   ⛔ ${reachYardTown.length} of them reach any of the ${yards.length} towns with a yard, and ${raiders.filter(p => p.gateHeld).length} hold a gate as an ACT —`);
console.log(`      so the arrival reader fires for NOBODY today. It is built, driven by §383's fixture, and goes live with`);
console.log(`      §2c's \`gateHeld\` or the day a grown power is authored with a yard in its reach.`);
console.log(`   ⛑ ${holdWild.length} hold a gate in the wild (${holdWild.map(p => p.id.replace(/^power_/, "")).join(", ")}) — the likeliest first.`);
const probe = { id: "power_probe", name: "The Probe", verbs: ["raid"], reach: ["bedrock_gate_yard"] };
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures || null };
const hold = { id: "h", name: "The Weigh Shed", locationId: "bedrock", condition: "kept", store: { stone: 20 }, garrison: ["w1", "w2"], crew: [] };
const ch = { holdings: [], npcRegistry: { w1: { id: "w1", name: "Watcher One", role: "warden" }, w2: { id: "w2", name: "Watcher Two" } } };
const odds = (byGate) => H.watchOdds(ch, hold, { cfg, rules: C.rules, dangerLevel: 3, people: ch.npcRegistry, npcs: ch.npcRegistry, day: 10, raiders: [{ n: 12, quality: 3, what: "raiders" }], byGate });
const byRoad = odds(null), byGate = odds(WG.comesByGate(probe, "bedrock", L));
console.log(`   driven: a watch of two against twelve raiders — up the road ${byRoad.pct}% to see them, out of the arch ${byGate.pct}%`);
console.log(`           (their stealth ${byRoad.stealth} → ${byGate.stealth}; the yard takes their surprise, not the watch's eyesight)`);
console.log(`   ⛑ and with nobody on watch it is ${odds(null) && H.watchOdds(ch, { ...hold, garrison: [] }, { cfg, rules: C.rules, dangerLevel: 3, people: ch.npcRegistry, day: 10 }).pct}% either way — R46a's floor is above this rule, never through it.`);
