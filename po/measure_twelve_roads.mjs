// po/measure_twelve_roads.mjs — verifying Aevi's SNG-676 diagnosis against the data, not against her table.
// ⛑ A PO's RULE CAN BE MEASURABLY WRONG IN ITS OWN TERMS, so the hypothesis gets tested on the real records:
// her claim is that every foothill sits at `wrap(pole)/2`, which would make a midpoint-with-the-pole the cause.
import { loadContentHeadless } from "../tests/headless_content.mjs";

const C = await loadContentHeadless();
const L = C.locations || {};
const wrap = (d) => { let x = Number(d); while (x > 180) x -= 360; while (x < -180) x += 360; return x; };
const to360 = (d) => ((Number(d) % 360) + 360) % 360;
const lonOf = (id) => L[id]?.worldPos?.longitude;
const colatOf = (id) => L[id]?.worldPos?.colatitude;

// ---- 1 · who are the foothills, and what does each say it sits between? ----
const foothills = Object.values(L).filter((l) => l?.betweenCrossingAnd);
console.log(`\n── 1 · the population: ${foothills.length} place(s) authored with \`betweenCrossingAnd\` ──`);

const crossing = Object.values(L).find((l) => /crossing/i.test(l.id) && l.tier === "region")
  || L["the_crossing"] || Object.values(L).find((l) => l.id === "the_crossing");
console.log(`  the Crossing: ${crossing?.id} — lon ${lonOf(crossing?.id)} colat ${colatOf(crossing?.id)}`);

// ---- 2 · the hypothesis, tested per record ----
console.log(`\n── 2 · Aevi's hypothesis: foothill longitude === wrap(pole longitude) / 2 ──`);
console.log("  foothill            pole                 pole°   foot°   half°   |err|   colat   her table");
let fits = 0, n = 0;
const rows = [];
for (const f of foothills) {
  const poleId = String(f.betweenCrossingAnd);
  const pl = lonOf(poleId), fl = lonOf(f.id);
  if (pl == null || fl == null) { console.log(`  ${f.id} — ⛔ missing a longitude (pole ${poleId})`); continue; }
  const half = wrap(pl) / 2;
  const err = Math.abs(wrap(fl - half));
  n++; if (err <= 2) fits++;
  rows.push({ id: f.id, name: f.name, poleId, pole360: to360(pl), foot360: to360(fl), half360: to360(half), err, colat: colatOf(f.id) });
}
rows.sort((a, b) => b.err - a.err);
for (const r of rows) {
  console.log(`  ${String(r.name || r.id).slice(0, 19).padEnd(20)}${String(r.poleId).slice(0, 20).padEnd(21)}${String(Math.round(r.pole360)).padStart(5)}${String(Math.round(r.foot360)).padStart(8)}${String(Math.round(r.half360)).padStart(8)}${r.err.toFixed(1).padStart(8)}${String(Math.round(r.colat)).padStart(8)}`);
}
console.log(`\n  ⛔ ${fits} of ${n} fit wrap(pole)/2 within 2° — ${fits === n ? "the hypothesis HOLDS on every record" : "it does NOT hold on all of them"}`);

// how far off the TRUE bearing is each one? (the true midpoint lies on the pole's own meridian)
const offTrue = rows.map((r) => Math.abs(wrap(r.foot360 - r.pole360)));
console.log(`  off its pole's bearing: worst ${Math.max(...offTrue).toFixed(0)}° · median ${offTrue.slice().sort((a, b) => a - b)[Math.floor(offTrue.length / 2)].toFixed(0)}° · best ${Math.min(...offTrue).toFixed(0)}°`);
console.log(`  how many leave on the Valley side (bearing 0–180°): ${rows.filter((r) => r.foot360 <= 180).length} of ${n}`);

// ---- 3 · ⛔ IS THE GENERATOR STILL WRONG? That is a different question from whether the seats should move. ----
console.log(`\n── 3 · the generator: would a NEW place "between the Crossing and X" land in the same wrong spot? ──`);
const fs = await import("node:fs");
const src = ["engine/worldmap.js", "engine/borncontract.js", "engine/generate.js", "engine/places.js"]
  .map((f) => ({ f, t: (() => { try { return fs.readFileSync(f, "utf8"); } catch { return ""; } })() }));
for (const { f, t } of src) {
  const hits = [...t.matchAll(/betweenCrossingAnd/g)];
  if (hits.length) console.log(`  ${f}: ${hits.length} reference(s) to betweenCrossingAnd`);
}
const midpointish = src.filter(({ t }) => /longitude.*\+.*longitude.*\/\s*2|\(\s*a\.lon.*\+.*b\.lon/s.test(t));
console.log(`  files averaging two longitudes: ${midpointish.map((x) => x.f).join(", ") || "none found by that shape"}`);

// ---- 4 · is the pole's stored longitude really 0/absent? that is the root of her explanation ----
console.log(`\n── 4 · the root of the explanation: what does the Crossing store for longitude? ──`);
for (const id of ["the_crossing", "the_center", crossing?.id].filter(Boolean)) {
  if (!L[id]) continue;
  console.log(`  ${id}: lon ${JSON.stringify(lonOf(id))} colat ${JSON.stringify(colatOf(id))} tier ${L[id].tier}`);
}
// and the poles themselves
const poles = [...new Set(rows.map((r) => r.poleId))];
console.log(`  the twelve poles' own longitudes: ${poles.map((p) => `${p}=${Math.round(to360(lonOf(p)))}`).join(" · ")}`);

// ---- 5 · option A's feasibility: is there LAND on the true bearing at her distances? ----
console.log(`\n── 5 · option A's table: the four she says must move nearer ──`);
const target = { longshore: 27, gearsflat: 31.5, kindlerow: 30.5, thinwater: 20 };
for (const r of rows) {
  const key = String(r.id).toLowerCase().replace(/[^a-z]/g, "");
  const want = Object.entries(target).find(([k]) => key.includes(k));
  if (want) console.log(`  ${String(r.name || r.id).padEnd(20)} now colat ${Math.round(r.colat)} on bearing ${Math.round(r.foot360)}° → her target colat ${want[1]} on ${Math.round(r.pole360)}°`);
}
console.log(`\n  ⚠️ whether those targets are LAND is a terrain question — the field is regenerated from seats, so a seat on water is the gate she names.`);
console.log("");
