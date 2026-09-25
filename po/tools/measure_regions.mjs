const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const J = await import("../../engine/journey.js");
const C = await loadContentHeadless(); const L = C.locations; const econ = C.rules.economy;
const prof = new Set(econ.regions.map(r => r.regionId));
const byReg = {}; for (const [id, l] of Object.entries(L)) if (l?.regionId) (byReg[l.regionId] ||= []).push(id);
const locRegs = Object.keys(byReg);
console.log("location regions WITHOUT a price profile:", locRegs.filter(r => !prof.has(r)).map(r => `${r}(${byReg[r].length})`).join(", "));
console.log("price profiles no location uses:", [...prof].filter(r => !byReg[r]).join(", "));
// nearest neighbours: for each region, min road days to each other region (from any of its places)
const near = {};
for (const a of locRegs) {
  const best = {};
  for (const p of byReg[a]) { const d = J.roadDistances(p, L).dist || {}; for (const [q, dd] of Object.entries(d)) { const b = L[q]?.regionId; if (!b || b === a) continue; if (!(b in best) || dd < best[b]) best[b] = dd; } }
  near[a] = Object.entries(best).sort((x, y) => x[1] - y[1]);
}
for (const a of locRegs) console.log(`${a.padEnd(24)} ${prof.has(a) ? "P" : "-"} ` + near[a].slice(0, 5).map(([b, d]) => `${b}${prof.has(b) ? "*" : ""} ${d.toFixed(0)}`).join(" | "));