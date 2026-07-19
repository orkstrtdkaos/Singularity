// World geometry prototype — project the authored 12D disposition space onto the plane.
// READ-ONLY: writes a preview SVG + a derived-coordinate JSON. Touches no content.
// Run: node scripts/world_projection.mjs [outDir]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || ".";
const rd = p => JSON.parse(readFileSync(p, "utf8"));
const TRADS = rd("content/packs/core/rules/traditions.json").traditions;
// ⚠️ canonical axis order lives HERE, not in traditions.json. Getting this wrong yields a
// plausible-looking and entirely wrong map.
const AXES = rd("content/packs/valley/lore/world_node_atlas.json").axisOrder;

const bearing = {};                        // axis -> ring degrees of its POSITIVE pole
for (const ax of AXES) {
  const pos = ax.split("_").pop();
  const t = TRADS.find(t => t.axis === ax && t.pole === pos);
  bearing[ax] = t.ring.degrees;
}
const POLE = {};                           // pole word -> [axis, sign]
for (const ax of AXES) { const [n, ...r] = ax.split("_"); POLE[n] = [ax, -1]; POLE[r.join("_")] = [ax, +1]; }
const IDX = Object.fromEntries(AXES.map((a, i) => [a, i]));

const vectorFor = loc => {
  if (Array.isArray(loc.axisVector) && loc.axisVector.length === 12) return { v: loc.axisVector, derived: false };
  const v = Array(12).fill(0);              // fall back: rebuild from poleIntensity
  let any = false;
  for (const [pole, mag] of Object.entries(loc.poleIntensity || {})) {
    const p = POLE[pole]; if (!p) continue;
    v[IDX[p[0]]] = p[1] * Number(mag); any = true;
  }
  return any ? { v, derived: true } : null;
};

const dir = "content/packs/valley/locations";
const rows = [];
for (const f of readdirSync(dir).filter(f => f.endsWith(".json"))) {
  const loc = rd(join(dir, f));
  const got = vectorFor(loc); if (!got) { rows.push({ id: loc.id, region: loc.regionId, unplaced: true }); continue; }
  let x = 0, y = 0;
  got.v.forEach((val, i) => { const th = bearing[AXES[i]] * Math.PI / 180; x += val * Math.cos(th); y += val * Math.sin(th); });
  rows.push({ id: loc.id, name: loc.name, region: loc.regionId, x: +x.toFixed(4), y: +y.toFixed(4),
              r: +Math.hypot(x, y).toFixed(4), theta: +(((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360).toFixed(2),
              derivedVector: got.derived, waygateTier: loc.waygateTier || null });
}

// ---- scale: Erik's "a year to walk across". 20 mi/day x 300 travel days = 6000 mi rim-to-rim.
const RMAX = Math.max(...rows.filter(r => !r.unplaced).map(r => r.r));
const MILES_PER_UNIT = 3000 / RMAX;                 // centre->rim = 3000 mi
const DAYS = mi => Math.round(mi / 20);

// ---- SVG preview
const S = 900, C = S / 2, PAD = 78, K = (C - PAD) / RMAX;
const px = p => [C + p.x * K, C - p.y * K];
const REGCOL = {}; let h = 0;
[...new Set(rows.map(r => r.region))].forEach(r => { REGCOL[r] = `hsl(${(h += 137.5) % 360} 55% 62%)`; });
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" font-family="system-ui,sans-serif">
<rect width="${S}" height="${S}" fill="#12141a"/>`;
for (const f of [0.25, 0.5, 0.75, 1]) svg += `<circle cx="${C}" cy="${C}" r="${(C - PAD) * f}" fill="none" stroke="#2a2f3a" stroke-dasharray="${f === 1 ? "" : "3 5"}"/>`;
for (const t of TRADS) {                              // 12 axes as diameters + 24 rim labels
  const a = t.ring.degrees * Math.PI / 180, R = C - PAD;
  const [ex, ey] = [C + Math.cos(a) * R, C - Math.sin(a) * R];
  svg += `<line x1="${C}" y1="${C}" x2="${ex}" y2="${ey}" stroke="#20242d"/>`;
  const [lx, ly] = [C + Math.cos(a) * (R + 30), C - Math.sin(a) * (R + 30)];
  svg += `<text x="${lx}" y="${ly}" fill="#8b93a5" font-size="10" text-anchor="middle" dominant-baseline="middle">${t.traditionId}</text>`;
}
for (const r of rows) {
  if (r.unplaced) continue;
  const [cx, cy] = px(r);
  const gate = r.waygateTier ? `<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="#d9b06a" stroke-width="1.2"/>` : "";
  svg += `${gate}<circle cx="${cx}" cy="${cy}" r="3.4" fill="${REGCOL[r.region]}" opacity=".92"><title>${r.name || r.id} — ${r.region} (r=${r.r}, ${r.theta}°)</title></circle>`;
}
const hub = rows.find(r => r.id === "the_crossing");
if (hub) { const [hx, hy] = px(hub); svg += `<circle cx="${hx}" cy="${hy}" r="10" fill="none" stroke="#e8c98a" stroke-width="2"/><text x="${hx + 14}" y="${hy + 4}" fill="#e8c98a" font-size="11">the_crossing (origin)</text>`; }
svg += `<text x="20" y="28" fill="#e8c98a" font-size="15">The world, projected from 12D disposition space</text>
<text x="20" y="48" fill="#8b93a5" font-size="11">${rows.filter(r => !r.unplaced).length} places · rim ≈ ${Math.round(RMAX * MILES_PER_UNIT)} mi ≈ ${DAYS(RMAX * MILES_PER_UNIT)} walking days · gold rings = waygates</text></svg>`;

writeFileSync(join(OUT, "world_projection.svg"), svg);
writeFileSync(join(OUT, "world_projection.json"), JSON.stringify({
  note: "PROTOTYPE. Derived, not authored. Nothing in content/ was modified.",
  axisOrderSource: "content/packs/valley/lore/world_node_atlas.json :: axisOrder",
  scale: { milesPerUnit: +MILES_PER_UNIT.toFixed(1), rimToRimMiles: Math.round(2 * RMAX * MILES_PER_UNIT),
           rimToRimWalkingDays: DAYS(2 * RMAX * MILES_PER_UNIT), centreToRimDays: DAYS(RMAX * MILES_PER_UNIT) },
  placed: rows.filter(r => !r.unplaced).length, unplaced: rows.filter(r => r.unplaced).map(r => r.id),
  derivedFromPoleIntensity: rows.filter(r => r.derivedVector).length, locations: rows }, null, 2));

// ---- console report + the falsifiable check
const byReg = {};
for (const r of rows) if (!r.unplaced) (byReg[r.region] ||= []).push(r.theta);
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
console.log(`placed ${rows.filter(r => !r.unplaced).length}/${rows.length}  (${rows.filter(r => r.derivedVector).length} vectors derived from poleIntensity)`);
console.log(`scale: rim-to-rim ${Math.round(2 * RMAX * MILES_PER_UNIT)} mi ≈ ${DAYS(2 * RMAX * MILES_PER_UNIT)} walking days\n`);
console.log("REGION BEARING vs its tradition's authored bearing (the falsifiable check):");
const checks = [];
for (const t of TRADS) {
  if (!byReg[t.region]) continue;
  const m = med(byReg[t.region]), a = t.ring.degrees;
  const off = Math.min(Math.abs(m - a), 360 - Math.abs(m - a));
  checks.push({ region: t.region, trad: t.traditionId, off });
}
checks.sort((p, q) => p.off - q.off);
for (const c of checks.slice(0, 6)) console.log(`   ✅ ${c.region.padEnd(20)} ${c.trad.padEnd(14)} off ${c.off.toFixed(1)}°`);
console.log("   ...");
for (const c of checks.slice(-4)) console.log(`   ⚠️  ${c.region.padEnd(20)} ${c.trad.padEnd(14)} off ${c.off.toFixed(1)}°`);
const good = checks.filter(c => c.off < 30).length;
console.log(`\n${good}/${checks.length} regions land within 30° of their own tradition's authored bearing.`);
if (hub) console.log(`the_crossing r = ${hub.r} (0 = exact origin)`);
