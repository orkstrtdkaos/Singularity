// B5 — does each power's OWN claim give a border, and do two neighbours' borders overlap?
import { readFileSync } from "node:fs";
import * as WG from "../engine/worldglobe.js";
import * as INF from "../engine/influence.js";
import * as LN from "../engine/lenses.js";
import * as RE from "../engine/realms.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrhs8286.json", "utf8"));
const RM = JSON.parse(readFileSync("content/packs/core/world/region_maps.json", "utf8"));
const terr = WG.decodeTerrain(JSON.parse(readFileSync("content/packs/core/world/terrain.json", "utf8")));
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };
const locs = { ...C.locations, ...(ch.generated?.location || {}) };
const holders = RE.groundHolders(ch, C, locs, cfg);
console.log(`ground holders: ${holders.length} (${holders.filter(h => h.yours).length} yours)`);

const ext = WG.regionExtent("valley", locs, { authored: RM.valley || null });
const W = 800, H = 420, cell = 4;
const G = WG.makeGroundCost(terr, { ...WG.GROUND_COST.territory, extent: ext });
const ts = (lon, lat, w, h) => ({ x: ((lon - ext.lo0) / (ext.lo1 - ext.lo0)) * w, y: (1 - (lat - ext.la0) / (ext.la1 - ext.la0)) * h });
const tw = (x, y, w, h) => ({ lon: ext.lo0 + (x / w) * (ext.lo1 - ext.lo0), lat: ext.la0 + (1 - y / h) * (ext.la1 - ext.la0) });
const T = INF.territoryByGround(holders, locs, { W, H, step: G.step, toScreen: ts, toWorld: tw, cell, extent: ext });
const N = T.gw * T.gh;
console.log(`\n${T.powers.length} powers in the valley frame, grid ${T.gw}x${T.gh}`);
console.log(`own masks kept: ${Object.keys(T.own).length}`);
const rows = [];
for (const p of T.powers) {
  const mask = T.own[p.id];
  const blurred = LN.blurGrid(mask, T.gw, T.gh, 2);
  const lines = LN.isoLines(blurred, T.gw, T.gh, 0.5);
  const ownCells = [...mask].filter(v => v >= INF.CLAIM_FLOOR).length;
  let wonCells = 0;
  for (let i = 0; i < N; i++) if (T.cellAt(i).owner === p.id) wonCells++;
  const rel = holders.find(h => h.yours) ? RE.powerRelation(holders.find(h => h.yours), p.p || p, ch, { allPowers: holders }) : "-";
  rows.push({ id: p.id, name: (p.p || p).name || p.id, claims: ownCells, wins: wonCells, border: lines.length, rel });
}
rows.sort((a, b) => b.claims - a.claims);
console.log(`\n  ${"power".padEnd(34)} ${"claims".padStart(6)} ${"wins".padStart(6)}  borders  relation`);
for (const r of rows) console.log(`  ${r.name.padEnd(34)} ${String(r.claims).padStart(6)} ${String(r.wins).padStart(6)}  ${String(r.border).padStart(7)}  ${r.rel}`);
const overlap = rows.reduce((n, r) => n + r.claims, 0) - rows.reduce((n, r) => n + r.wins, 0);
console.log(`\n  claimed-but-not-won cells: ${overlap} — the overlap a winner-takes-the-cell grid cannot show`);
