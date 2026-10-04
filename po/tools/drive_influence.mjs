/* B2 driven: whose ground is this, asked of the real world through both readers.
 *
 *   node po/tools/drive_influence.mjs
 */
import fs from "node:fs";
import { loadContentHeadless } from "../../tests/headless_content.mjs";
import * as I from "../../engine/influence.js";
import { decodeTerrain, regionExtent, makeGroundCost, GROUND_COST } from "../../engine/worldglobe.js";

const CONTENT = await loadContentHeadless();
const terrain = decodeTerrain(JSON.parse(fs.readFileSync("content/packs/core/world/terrain.json", "utf8")));
const REGION_MAPS = JSON.parse(fs.readFileSync("content/packs/core/world/region_maps.json", "utf8"));

console.log("");
console.log("== 1. the crow-flies reader (the globe's, and the GM's) ==");
const inf = I.makeInfluence(CONTENT.powers, CONTENT.locations);
console.log(`   territorial powers with anchors: ${inf.powers.length} of ${CONTENT.powers.length}`);
{
  const tally = {};
  let held = 0, contested = 0, n = 0;
  for (let la = -80; la <= 80; la += 2) {
    for (let lo = -180; lo < 180; lo += 3) {
      n++;
      const r = inf.at(la, lo);
      if (r.owner) { held++; tally[r.owner] = (tally[r.owner] || 0) + 1; }
      if (r.contested) contested++;
    }
  }
  console.log(`   sampled ${n} points: held ${held} (${(100 * held / n).toFixed(1)}%), contested ${contested}`);
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6);
  for (const [id, c] of top) console.log(`      ${id.padEnd(32)} ${String(c).padStart(5)} points`);

  // a power's own seat must be its own ground, or the model says nothing
  let seatsOwn = 0, seatsTested = 0;
  for (const q of inf.powers) {
    const seat = I.anchorsOf(q.p, CONTENT.locations).find((a) => a.kind === "seat");
    if (!seat) continue;
    seatsTested++;
    if (inf.at(seat.lat, seat.lon).owner === q.id) seatsOwn++;
  }
  console.log(`   a power holds its OWN seat: ${seatsOwn} of ${seatsTested}`);
}

console.log("");
console.log("== 2. the travel-cost reader (the region's, over B1) ==");
for (const regionId of ["valley", "the_center", "the_unspooling", "the_echo_vale"]) {
  const ext = regionExtent(regionId, CONTENT.locations, { authored: REGION_MAPS[regionId] || null });
  if (!ext) continue;
  const W = 1068, H = 561;
  const G = makeGroundCost(terrain, { ...GROUND_COST.territory, extent: ext });
  const toScreen = (lon, lat, w, h) => ({
    x: ((lon - ext.lo0) / (ext.lo1 - ext.lo0)) * w,
    y: (1 - (lat - ext.la0) / (ext.la1 - ext.la0)) * h,
  });
  const toWorld = (x, y, w, h) => ({
    lon: ext.lo0 + (x / w) * (ext.lo1 - ext.lo0),
    lat: ext.la0 + (1 - y / h) * (ext.la1 - ext.la0),
  });
  const t0 = Date.now();
  const T = I.territoryByGround(CONTENT.powers, CONTENT.locations, { W, H, step: G.step, toScreen, toWorld, cell: 3, extent: ext });
  const ms = Date.now() - t0;
  if (!T) { console.log(`   ${regionId.padEnd(16)} no territorial power reaches here`); continue; }
  const cells = T.gw * T.gh;
  const ownedCells = Object.values(T.area).reduce((a, b) => a + b, 0);
  let contested = 0;
  for (let i = 0; i < cells; i++) if (T.cellAt(i).contested) contested++;
  const top = Object.entries(T.area).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([id, c]) => `${id.replace(/^power_/, "")} ${(100 * c / cells).toFixed(0)}%`).join(", ");
  console.log(`   ${regionId.padEnd(16)} ${String(ms).padStart(5)}ms  ${T.gw}x${T.gh} cells  held ${(100 * ownedCells / cells).toFixed(0)}%  contested ${(100 * contested / cells).toFixed(0)}%   ${top}`);
}

console.log("");
console.log("== 3. the two readers agree about who is where ==");
{
  const ext = regionExtent("valley", CONTENT.locations, { authored: REGION_MAPS.valley || null });
  const W = 1068, H = 561;
  const G = makeGroundCost(terrain, { ...GROUND_COST.territory, extent: ext });
  const toScreen = (lon, lat, w, h) => ({ x: ((lon - ext.lo0) / (ext.lo1 - ext.lo0)) * w, y: (1 - (lat - ext.la0) / (ext.la1 - ext.la0)) * h });
  const toWorld = (x, y, w, h) => ({ lon: ext.lo0 + (x / w) * (ext.lo1 - ext.lo0), lat: ext.la0 + (1 - y / h) * (ext.la1 - ext.la0) });
  const T = I.territoryByGround(CONTENT.powers, CONTENT.locations, { W, H, step: G.step, toScreen, toWorld, cell: 3, extent: ext });
  /* ⚠️ They do NOT have to match everywhere — one walks the ground and one flies — but where the GROUND reader is
     confident, the crow-flies one should name the same power, or the GM and the map would disagree about who holds
     the camp the player is standing in. */
  let strong = 0, agree = 0;
  for (let y = 0; y < T.gh; y += 2) for (let x = 0; x < T.gw; x += 2) {
    const g = T.cellAt(y * T.gw + x);
    if (!g.owner || g.strength < 0.6 || g.contested) continue;
    strong++;
    const w = toWorld(x * T.cell, y * T.cell, W, H);
    if (inf.at(w.lat, w.lon).owner === g.owner) agree++;
  }
  console.log(`   where the ground reader is confident (${strong} cells), the crow-flies reader names the same power ${agree} times (${(100 * agree / Math.max(1, strong)).toFixed(0)}%)`);
}
