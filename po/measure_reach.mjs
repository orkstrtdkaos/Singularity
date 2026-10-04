// R4.4 — what the proposed reach curve actually does to every power's ground, against the one we shipped.
// Erik's line ("I'm good with the power reach for now") carries two readings; these are the numbers.
import { readFileSync } from "node:fs";
import * as INF from "../engine/influence.js";
const AS_BUILT = { base: 1.2, k: 0.32, e: 0.5, floor: 10 };  // B2's curve, documented beside REACH
import * as WG from "../engine/worldglobe.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const RM = JSON.parse(readFileSync("content/packs/core/world/region_maps.json", "utf8"));
const terr = WG.decodeTerrain(JSON.parse(readFileSync("content/packs/core/world/terrain.json", "utf8")));

const share = (regionId, curve) => {
  const ext = WG.regionExtent(regionId, C.locations, { authored: RM[regionId] || null });
  if (!ext || ext.polar) return null;
  const W = 400, H = 210;
  const G = WG.makeGroundCost(terr, { ...WG.GROUND_COST.territory, extent: ext });
  const ts = (lon, lat, w, h) => ({ x: ((lon - ext.lo0) / (ext.lo1 - ext.lo0)) * w, y: (1 - (lat - ext.la0) / (ext.la1 - ext.la0)) * h });
  const tw = (x, y, w, h) => ({ lon: ext.lo0 + (x / w) * (ext.lo1 - ext.lo0), lat: ext.la0 + (1 - y / h) * (ext.la1 - ext.la0) });
  const T = INF.territoryByGround(C.powers, C.locations, { W, H, step: G.step, toScreen: ts, toWorld: tw, cell: 4, extent: ext, curve });
  if (!T) return null;
  const cells = T.gw * T.gh;
  const out = {};
  for (const [id, n] of Object.entries(T.area)) out[id] = 100 * n / cells;
  return out;
};

for (const rid of ["valley", "the_echo_vale", "unspooling"]) {
  const a = share(rid, AS_BUILT), b = share(rid, INF.REACH);
  if (!a || !b) { console.log(`${rid}: no frame`); continue; }
  const ids = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort((x, y) => (b[y] || 0) - (b[x] || 0));
  console.log(`\n== ${rid} ==`);
  console.log(`  ${"power".padEnd(30)} ${"heads".padStart(6)}  as built -> proposed`);
  for (const id of ids.slice(0, 7)) {
    const p = C.powers.find?.((q) => q.id === id) || Object.values(C.powers).find((q) => q?.id === id);
    const heads = INF.headsOf(p);
    console.log(`  ${id.padEnd(30)} ${String(heads).padStart(6)}  ${(a[id] || 0).toFixed(1).padStart(5)}% -> ${(b[id] || 0).toFixed(1).padStart(5)}%`);
  }
  const ta = Object.values(a).reduce((s, v) => s + v, 0), tb = Object.values(b).reduce((s, v) => s + v, 0);
  console.log(`  ${"— held at all —".padEnd(30)} ${"".padStart(6)}  ${ta.toFixed(1).padStart(5)}% -> ${tb.toFixed(1).padStart(5)}%`);
}
