// po/tools/measure_opening.mjs — SNG-680. WHAT THE FILM CAN ACTUALLY DRAW, measured against the real content.
//
// Every number in my reply to Aevi comes from here. The film is pure render, so the suite cannot prove any of
// it; what the suite CAN prove is the half that is arithmetic over content — and that is the half where her
// spec and my build can each be wrong in ways nobody would see by watching the film once.
//
// Run: node po/tools/measure_opening.mjs

import { loadContentHeadless } from "../../tests/headless_content.mjs";
import { ringOrder } from "../../engine/traditions.js";
import { walkingDays } from "../../engine/worldmap.js";
import { openingReel, shotSeconds, codaShots, codaArc, codaRegionLine } from "../../engine/films.js";
import { arcReachesRegion } from "../../engine/arceffects.js";
import { decodeTerrain, sampleAt, colorAt, unproject } from "../../engine/worldglobe.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const line = (s) => console.log(s);
const CONTENT = await loadContentHeadless();

line("═════ SNG-680 · WHAT THE OPENING CAN DRAW ═════\n");

/* ── 1 · the reel ── */
const reel = openingReel(CONTENT);
if (!reel) { line("⛔ CONTENT.opening is absent — the loader does not reach opening.json"); process.exit(1); }
const tokens = new Set(reel.shots.map((s) => s.visual));
line(`reel: ${reel.shots.length} shots · ${reel.movements.length} movements · ${tokens.size} distinct visual tokens`);
const runSeconds = reel.shots.reduce((n, s) => n + shotSeconds(s, reel.pacing), 0) + (reel.title ? shotSeconds(reel.title, reel.pacing) : 0);
line(`run:  ${(runSeconds / 60).toFixed(2)} min  (title card ${shotSeconds(reel.title, reel.pacing).toFixed(1)}s)`);
const authored = Object.keys(reel.visuals || {}).filter((k) => !k.startsWith("_"));
const unused = authored.filter((k) => !tokens.has(k));
line(`visuals authored: ${authored.length}; used by a shot: ${authored.length - unused.length}; unused: ${unused.join(", ") || "none"}`);

/* ── 2 · the ring, which G5 says the poles ARE ── */
const ring = ringOrder(CONTENT.traditionIndex);
const aesth = CONTENT.traditionVisualAesthetics || {};
const withAxis = ring.filter((t) => aesth[t]?.axis);
const withHex = ring.filter((t) => /#[0-9a-f]{3,8}/i.test(JSON.stringify(aesth[t] || {})));
line(`\nring: ${ring.length} stations in position order`);
line(`  with an authored \`axis\`:  ${withAxis.length}/${ring.length}`);
line(`  with ANY authored hex colour: ${withHex.length}/${ring.length}   ← G5 asks for "the tradition colours"`);
const axes = [...new Set(ring.map((t) => aesth[t]?.axis).filter(Boolean))];
line(`  distinct axes: ${axes.length} (${axes.slice(0, 4).join(", ")}…)`);
const css = readFileSync(join(root, "style.css"), "utf8");
const gc = (css.match(/\.gc-[a-z]+[^{]*\{[^}]*\}/g) || []).filter((r) => /fill:/.test(r));
line(`  \`domainCircleSVG\` colour rules in style.css: ${gc.length} — ${gc.map((r) => r.slice(0, r.indexOf("{")).trim()).join(", ")}`);

/* ── 3 · the arcs the film sweeps ── */
const arcs = (CONTENT.greaterArcs || []).filter(Boolean);
const world = arcs.filter((a) => String(a.scale || "").toLowerCase() === "world");
const cosmic = arcs.filter((a) => String(a.scale || "").toLowerCase() === "cosmic");
line(`\narcs: ${arcs.length} authored · ${world.length} scale "world" · ${cosmic.length} "cosmic" · ${arcs.length - world.length - cosmic.length} other`);
const scoped = arcs.filter((a) => Array.isArray(a.regions) && a.regions.length);
line(`  with a machine-readable \`regions\` list: ${scoped.length}/${arcs.length}`);
// what the coda's "nearest arc" rule can actually reach: a hinge, front or connection with a PLACE
const fields = {};
for (const a of arcs) for (const st of (a.stages || [])) for (const k of Object.keys(st)) fields[k] = (fields[k] || 0) + 1;
line(`  stage fields present: ${Object.entries(fields).map(([k, n]) => `${k}×${n}`).join(" ")}`);
const placeLike = (v) => typeof v === "string" && !!CONTENT.locations?.[v];
let hingeWithPlace = 0, frontWithPlace = 0, anyPlaceRef = 0;
for (const a of arcs) for (const st of (a.stages || [])) {
  for (const h of (st.hingeNpcs || [])) { const id = typeof h === "string" ? h : h?.npcId; const p = typeof h === "object" ? (h.locationId || h.where || h.place) : null; if (p && placeLike(p)) hingeWithPlace++; if (id && CONTENT.npcs?.[id]) { /* a person, with no place of their own */ } }
  for (const f of (st.fronts || [])) { const p = typeof f === "string" ? f : (f?.locationId || f?.where || f?.place || f?.regionId); if (p && (placeLike(p) || CONTENT.regions?.some?.((r) => r.regionId === p))) frontWithPlace++; }
  const flat = JSON.stringify(st);
  for (const id of Object.keys(CONTENT.locations || {})) if (flat.includes(`"${id}"`)) { anyPlaceRef++; break; }
}
line(`  stages whose hinge carries a place: ${hingeWithPlace} · whose front carries a place/region: ${frontWithPlace} · mentioning ANY location id: ${anyPlaceRef}`);

/* ── 4 · the coda, on the two starts G4 names ── */
const daysFrom = (a, b) => walkingDays(CONTENT.locations?.[a], CONTENT.locations?.[b]);
const startsOf = () => {
  const out = [];
  for (const id of Object.keys(CONTENT.locations || {})) {
    const w = CONTENT.locations[id]?.worldPos;
    if (Number.isFinite(Number(w?.colatitude)) && Number.isFinite(Number(w?.longitude))) out.push(id);
  }
  return out;
};
const placed = startsOf();
line(`\nlocations: ${Object.keys(CONTENT.locations || {}).length} · with a world position: ${placed.length}   ← what \`many\` has to draw with`);
const crossingish = placed.filter((id) => Math.abs(Number(CONTENT.locations[id].worldPos.colatitude)) <= 0.1);
line(`  at the Crossing (colatitude ≤ 0.1°): ${crossingish.length} — ${crossingish.slice(0, 6).join(", ")}`);
for (const id of ["millbrook", crossingish[0]].filter(Boolean)) {
  const shots = codaShots(CONTENT, { startId: id, locations: CONTENT.locations, regions: CONTENT.regions, daysFrom, reaches: arcReachesRegion });
  const arc = codaArc(CONTENT, { startId: id, locations: CONTENT.locations, reaches: arcReachesRegion });
  const d = daysFrom("the_crossing", id);
  line(`\n  start ${id}:`);
  line(`    days from the Crossing: ${d == null ? "null" : d.toFixed(1)} → rounded ${d == null ? "—" : Math.round(d)}   ← G4 says 34 for Millbrook`);
  line(`    regionLine: ${JSON.stringify(codaRegionLine(CONTENT, { startId: id, locations: CONTENT.locations, regions: CONTENT.regions, daysFrom }))}`);
  line(`    arc: ${arc?.arc?.id || "none"} (${arc?.arcBy || "—"}) stage ${JSON.stringify(arc?.stage?.name || null)}`);
  line(`    face: ${JSON.stringify((arc?.face || "").slice(0, 70))}`);
  line(`    shots: ${shots.length}`);
}

/* ── 5 · the raster, which is the whole performance question ── */
const terrain = decodeTerrain(JSON.parse(readFileSync(join(root, "content/packs/core/world/terrain.json"), "utf8")));
const timeFrame = (w, h, r, label) => {
  const view = { yaw: 20, pitch: -14, r, cx: w / 2, cy: h / 2 };
  const x0 = Math.max(0, Math.floor(view.cx - r)), x1 = Math.min(w, Math.ceil(view.cx + r));
  const y0 = Math.max(0, Math.floor(view.cy - r)), y1 = Math.min(h, Math.ceil(view.cy + r));
  const gw = x1 - x0, gh = y1 - y0;
  const step = Math.max(2, Math.min(4, Math.ceil(Math.sqrt((gw * gh) / 52000))));
  let n = 0, t0 = process.hrtime.bigint();
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const p = unproject(x + 0.5, y + 0.5, view);
    if (!p) continue;
    const s = sampleAt(terrain, p.lon, p.lat);
    if (s) { colorAt(terrain, p.lon, p.lat, { layer: "topo" }); n++; }
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  line(`  ${label}: ${gw}×${gh} px, step ${step} → ${n} samples in ${ms.toFixed(1)}ms (${(1000 / Math.max(0.01, ms)).toFixed(0)} such frames/s)`);
  return ms;
};
line(`\nraster cost (node, one core — a browser's canvas work is on top of this):`);
timeFrame(900, 560, 210, "the capped globe      (r=210)");
timeFrame(900, 560, 246, "an uncapped globe     (r=246)");
timeFrame(900, 560, (900 / 2) / Math.sin(13 * Math.PI / 180), "the coda's region     (26° span)");

/* ── 6 · the cities the net is drawn on ── */
let land = 0, buckets = new Map();
for (let lat = -78; lat <= 78; lat += 2) for (let lon = -180; lon < 180; lon += 2) {
  const s = sampleAt(terrain, lon, lat);
  if (!s || s.type !== 1) continue;
  land++;
  const cell = `${Math.floor((lat + 90) / 12)}|${Math.floor((lon + 180) / 12)}`;
  const was = buckets.get(cell);
  if (!was || s.density > was.d) buckets.set(cell, { lat, lon, d: s.density });
}
const picked = [...buckets.values()].sort((a, b) => b.d - a.d).slice(0, 190);
const spread = new Set(picked.map((p) => `${Math.floor((p.lat + 90) / 30)}|${Math.floor((p.lon + 180) / 60)}`));
line(`\nthe net: ${land} land samples → ${buckets.size} 12° cells → ${picked.length} cities drawn, across ${spread.size} coarse quadrants`);
line(`  density of the cities: min ${Math.min(...picked.map((p) => p.d)).toFixed(2)} · max ${Math.max(...picked.map((p) => p.d)).toFixed(2)}`);
const topOnly = [];
for (let lat = -78; lat <= 78; lat += 2) for (let lon = -180; lon < 180; lon += 2) {
  const s = sampleAt(terrain, lon, lat);
  if (s && s.type === 1) topOnly.push({ lat, lon, d: s.density });
}
topOnly.sort((a, b) => b.d - a.d);
const naive = new Set(topOnly.slice(0, 190).map((p) => `${Math.floor((p.lat + 90) / 30)}|${Math.floor((p.lon + 180) / 60)}`));
line(`  (a plain "top 190 by density" would sit in ${naive.size} quadrants — which is why the cells are there)`);
