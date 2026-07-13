// balance_sim.mjs — the headless balance harness (owed since SNG-078; required before SNG-090's
// substrate curves are trusted). Two jobs:
//   (1) SNG-090 — validate the substrate BAND curves against the design anchors (a real pass/fail
//       gate: the numbers are tuned HERE, never eyeballed in the engine), and print the factor table.
//   (2) SNG-078 — report the success-chance ceiling by attribute × difficulty so the level-5
//       flattening is visible (a report, not yet a gate — Erik's balance call is pending).
//
// Run: node tests/balance_sim.mjs   (exit 1 if a substrate anchor drifts)

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { substrateVerdict, SUBSTRATE_TUNING } from "../engine/substrate.js";
import { successChance } from "../engine/resolve.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const substrate = rj("content/packs/core/rules/the_substrate.json");
const rules = rj("content/packs/core/rules/resolution.json");
const D = substrate.substrateDensity;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const near = (v, lo, hi, label) => (v >= lo && v <= hi) ? ok(`${label}: ${v}% (in ${lo}–${hi})`) : fail(`${label}: ${v}% — expected ${lo}–${hi}`);

const pct = (tradition, region, carried = 0) =>
  substrateVerdict({ tradition, density: D[region], carried, data: substrate }).percent;

// ---------- (1) SNG-090 substrate anchors ----------
console.log("\n=== SNG-090 substrate — design anchors ===");
near(pct("seraphic", "the_quickwood"), 5, 20, "Seraph in the Quickwood (starved, near-off)");
near(pct("rootkin", "the_gearlands"), 60, 78, "Rootkin in the Gearlands (crowded, impaired not off)");
near(pct("rootkin", "the_quickwood"), 100, 100, "Rootkin in the Quickwood (tuned to thin ground — full)");
near(pct("seraphic", "the_lattice_cities"), 100, 100, "Seraph in the Lattice-Cities (at home — full)");
near(pct("mason", "the_given_land"), 100, 100, "Mason in the Given Land (at home — full)");

console.log("\n--- carried substrate: rescues the starved, worsens the crowded ---");
{
  const seraphAlone = pct("seraphic", "the_quickwood", 0);
  const seraphCarry = pct("seraphic", "the_quickwood", 0.6); // a charged Waystaff
  (seraphCarry > seraphAlone) ? ok(`Seraph+Waystaff in Quickwood: ${seraphAlone}% → ${seraphCarry}% (battery rescues)`) : fail(`carried charge did not rescue a starved Seraph (${seraphAlone}→${seraphCarry})`);
  const rootAlone = pct("rootkin", "the_gearlands", 0);
  const rootCarry = pct("rootkin", "the_gearlands", 0.3);
  (rootCarry <= rootAlone) ? ok(`Rootkin+charge in Gearlands: ${rootAlone}% → ${rootCarry}% (battery cannot help — worsens)`) : fail(`carried charge helped a crowded Rootkin (${rootAlone}→${rootCarry}) — should not`);
}

// ---------- factor table (tuning visibility) ----------
console.log("\n--- substrate factor table (tradition × place) ---");
const traditions = ["seraphic", "enginewright", "cogitant", "wright", "ashwarden", "rootkin"];
const places = ["the_gearlands", "the_center", "valley", "the_given_land", "the_quickwood"];
console.log("tradition".padEnd(14) + places.map(p => p.replace("the_", "").slice(0, 9).padStart(10)).join(""));
for (const t of traditions) {
  console.log(t.padEnd(14) + places.map(p => {
    const v = substrateVerdict({ tradition: t, density: D[p], data: substrate });
    return `${v.percent}%${v.off ? "✗" : v.side === "starved" ? "↓" : v.side === "crowded" ? "↑" : " "}`.padStart(10);
  }).join(""));
}
console.log(`(tuning: starveExp ${SUBSTRATE_TUNING.starveExp}, crowdSlope ${SUBSTRATE_TUNING.crowdSlope}, crowdFloor ${SUBSTRATE_TUNING.crowdFloor}; ↓ starved ↑ crowded ✗ off)`);

// ---------- (2) SNG-078 ceiling report ----------
console.log("\n=== SNG-078 — success-chance ceiling (report; Erik's balance call pending) ===");
const mkChar = attr => ({ attributes: { practical: Math.min(4, attr) }, subAttributes: { craft: attr }, alignment: {}, energy: 40, skills: {} });
const diffs = [0, 15, 30];
console.log("attr".padEnd(6) + diffs.map(d => `diff ${d}`.padStart(9)).join(""));
for (const attr of [2, 3, 4, 5, 6]) {
  console.log(String(attr).padEnd(6) + diffs.map(diff => {
    const c = successChance({ character: mkChar(attr), action: { subAttribute: "craft", attribute: "practical", axes: {}, difficulty: diff }, location: {}, rules });
    return `${c}%`.padStart(9);
  }).join(""));
}
console.log("(a 'very hard' (diff 30) roll should still bite a maxed character — if attr 4–6 all sit ≥90% at diff 30, the game has ceilinged: SNG-078.)");

console.log(failures === 0 ? "\nBalance sim: substrate anchors hold." : `\nBalance sim: ${failures} ANCHOR FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
