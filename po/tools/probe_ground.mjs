// po/tools/probe_ground.mjs — Aevi, 2026-10-07. What the ground is at a point, before a place is put there.
// Run: node po/tools/probe_ground.mjs <colat> <lon> [radiusDeg=3] [stepDeg=0.5]
// Prints the centre's sample, the region vote, the nearest authored places in walking days, the nearest water,
// and a small grid of land/water/elevation around it so a coast or a shelf can be read.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const url = (p) => join(root, p).replace(/\\/g, "/").replace(/^([A-Z]):/, "file:///$1:");
const WG = await import(url("engine/worldglobe.js"));
const { loadContentHeadless } = await import(url("tests/headless_content.mjs"));
const C = await loadContentHeadless();
const t = WG.decodeTerrain(JSON.parse(readFileSync(join(root, "content/packs/core/world/terrain.json"), "utf8")));
const colat = Number(process.argv[2]), lon0 = Number(process.argv[3]);
const rad = Number(process.argv[4] || 3), stp = Number(process.argv[5] || 0.5);
const R = Math.PI / 180, DAYS_PER_DEG = 300 / 180;
const norm = (lo) => { while (lo > 180) lo -= 360; while (lo < -180) lo += 360; return lo; };
const S = (cl, lo) => WG.sampleAt(t, norm(lo), cl - 90);
const gc = (a, b) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a[0]*R)*Math.sin(b[0]*R) + Math.cos(a[0]*R)*Math.cos(b[0]*R)*Math.cos((a[1]-b[1])*R)))) / R;
const s = S(colat, lon0);
const land = (x) => x && (x.type & 3) !== 0;
console.log("centre", { colat, lon: lon0, land: land(s), elev: s?.elev ?? s?.e, biome: s?.biome, type: s?.type });
let vote = null; try { vote = WG.regionVoteAt(t, norm(lon0), colat - 90); } catch (e) { vote = String(e.message); }
console.log("region vote", JSON.stringify(vote)?.slice(0, 400));
const here = [colat - 90, lon0];
const near = Object.entries(C.locations).filter(([, l]) => l?.worldPos).map(([id, l]) => [id, gc(here, [l.worldPos.colatitude - 90, l.worldPos.longitude]), l.regionId, l.tier, l.worldPos.depth || 0]).sort((a, b) => a[1] - b[1]).slice(0, 8);
for (const [id, d, r, tier, depth] of near) console.log(`  ${id.padEnd(30)} ${d.toFixed(2)}°  ${(d * DAYS_PER_DEG).toFixed(1)} days  ${r}  ${tier}${depth ? "  depth " + depth : ""}`);
let water = null;
for (let rr = stp; rr <= 12 && !water; rr += stp) for (let a = 0; a < 360; a += 10) { const cl = colat + rr * Math.cos(a * R), lo = lon0 + rr * Math.sin(a * R) / Math.max(0.05, Math.sin(colat * R)); const x = S(cl, lo); if (x && !land(x)) { water = { colat: +cl.toFixed(2), lon: +lo.toFixed(2), deg: rr }; break; } }
console.log("nearest water", water);
const rows = [];
for (let dc = -rad; dc <= rad + 1e-9; dc += stp) { let line = `${(colat + dc).toFixed(1).padStart(6)} `; for (let dl = -rad; dl <= rad + 1e-9; dl += stp) { const x = S(colat + dc, lon0 + dl / Math.max(0.05, Math.sin((colat + dc) * R))); line += !x ? "?" : !land(x) ? "~" : (dc === 0 && Math.abs(dl) < 1e-9) ? "@" : "#"; } rows.push(line); }
console.log("grid (colat down, lon across; ~ water, # land, @ centre):\n" + rows.join("\n"));
