// C1+C2 driven: the Crossing on a pole-centred base — members, roads, ground cost, territory.
import { readFileSync } from "node:fs";
import * as WG from "../engine/worldglobe.js";
import * as INF from "../engine/influence.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const RM = JSON.parse(readFileSync("content/packs/core/world/region_maps.json", "utf8"));
const terr = WG.decodeTerrain(JSON.parse(readFileSync("content/packs/core/world/terrain.json", "utf8")));
const ext = WG.regionExtent("the_center", C.locations, { authored: RM.the_center || null });
const gen = (lon, lat) => { const s = WG.sampleAt(terr, lon, lat); return { raw: s ? s.elevation : 0, type: s ? s.type : 1 }; };
const B = WG.makePolarBase(terr, gen, ext);
const W = 800, H = 420;
console.log(`polar base: R=${ext.poleRadiusDeg.toFixed(3)}deg  pole=${ext.pole}  samples=${B.samples}`);

const mem = Object.keys(C.locations).filter(id => (C.locations[id]?.regionId || C.locations[id]?.region) === "the_center" && C.locations[id]?.worldPos);
let on = 0; for (const id of mem) { const l = C.locations[id]; const s = B.toScreen(l.worldPos.longitude, l.worldPos.colatitude - 90, W, H); if (B.insideDisc(s.x, s.y, W, H)) on++; }
console.log(`members on frame: ${on}/${mem.length}`);

const G = WG.makeGroundCost(terr, { ...WG.GROUND_COST.road, extent: ext });
console.log(`ground cost: slopeRef=${G.slopeRef.toFixed(4)} typical=${G.typical.toFixed(4)}  (finite: ${Number.isFinite(G.slopeRef) && Number.isFinite(G.typical)})`);

const net = WG.roadNetwork(C.locations, { k: 1.1 });
const intra = net.roads.filter(e => mem.includes(e.a) && mem.includes(e.b));
const R = WG.routeRoads(net.roads, C.locations, { W, H, step: G.step, toScreen: B.toScreen, toWorld: B.toWorld, extent: ext, cell: 2 });
console.log(`roads: ${R.roads.length} drawn (${intra.length} network edges are internal), ${R.exits.length} exits, unrouted ${R.unrouted}, ${R.ms}ms`);

const terrW = INF.territoryByGround(C.powers, C.locations, { W, H, step: G.step, toScreen: B.toScreen, toWorld: B.toWorld, cell: 4, extent: ext });
if (!terrW) console.log("territory: null (no power in frame)");
else {
  const cells = terrW.gw * terrW.gh;
  const rows = Object.entries(terrW.area).sort((a,b)=>b[1]-a[1]).slice(0,4);
  console.log(`territory: ${terrW.powers.length} powers in frame — ` + rows.map(([id,n]) => `${id} ${(100*n/cells).toFixed(1)}%`).join(", "));
}
