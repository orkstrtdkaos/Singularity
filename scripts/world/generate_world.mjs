// scripts/world/generate_world.mjs — SNG-391. THE PIPELINE, which is the whole ticket.
//
// Aevi, §1 of the handoff: "I regenerated this world EIGHT times in one session… each time I rebuilt the
// derived layers by hand, with scripts I wrote in the moment. That is not a pipeline; it is me
// remembering. A build step cannot forget to rebuild. I can, and did, repeatedly."
//
// ⛔ RETIRED AS A BUILD, 2026-09-14 (Erik): "I don't intend to ever regenerate the world again … so the new
// normal are authored locations and mods to what we have." The write path REFUSES without an explicit
// override; `terrain.json` is ground truth now, not a derived artifact, and this file is kept as the
// documented derivation behind it rather than as a step anyone runs.
//
// Run:   node scripts/world/generate_world.mjs --check   # is the frozen asset intact, and does it know every place?
//        node scripts/world/place_rows.mjs               # THE OPEN DOOR: splice a place's row into the frozen world
//
// ⛔ CANON IN, TERRAIN OUT. The 118 seeds are DERIVED from worldPos at build time (map lat = colatitude
// − 90 — the Crossing sits at the map frame's south pole, which is why the generator's three pole fixes
// are load-bearing). genparams.pts turned out to be a byte-exact cache of that derivation, 118 of 118 —
// so this pipeline derives the seeds itself and FAILS if genparams disagrees with canon, which makes
// seed drift impossible rather than merely detected. The genuinely authored inputs are the belts,
// bridges, umbral carvings, northern masses, and the landwant/road SELECTIONS.
//
// ⚠️ TWO KINDS OF LAYER, AND THE FILE SAYS WHICH IS WHICH:
//   EXACT   — type + elevation come from the generator; re-running reproduces them byte-identically.
//   DERIVED-BY-RULE — nanite / density / biome are produced by documented rules over authored content
//   (voronoi region assignment + the_substrate.json's states). ⛔ Validated against the previous baked
//   asset, nearest-seed voronoi explains ~80% of its nanite channel — so these rules are an HONEST
//   RECONSTRUCTION, not a reproduction of Aevi's hand-built layers, and the reproduction ratio is
//   reported rather than hidden. The rule being IN CODE is the point: she corrects the rule once, not
//   the pixels eight times.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { makeTerrain } from "./terrain.mjs";
import { buildHydrology } from "./hydrology.mjs";
import { resolvePlaceNames } from "./reanchor.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const rj = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const W = 480, H = 240, EW = 720, EH = 360;
const norm = (x) => ((x + 180) % 360 + 360) % 360 - 180;
const R = Math.PI / 180;

/** Canon: every location, its map-frame seed, region, name. */
export function loadCanon() {
  const locs = {};
  const dir = join(root, "content/packs/valley/locations");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const l of (d.locations ? Object.values(d.locations) : [d])) if (l && l.id) locs[l.id] = l;
  }
  const seeds = [];
  for (const l of Object.values(locs)) {
    const wp = l.worldPos;
    if (!wp || !Number.isFinite(wp.colatitude) || !Number.isFinite(wp.longitude)) continue;
    // ⛔ AN INHERITED POSITION IS NOT A SEED. SNG-396 promoted 17 places play authored, and a room
    // sits at its building's coordinates — so seeding on them would put a SECOND vote at a point that
    // already has one, quietly doubling that building's pull on the biome/density/nanite fields and
    // moving terrain that no one authored. The Cogitarium would have voted three times for having two
    // rooms. `worldPosInherited` is written by the promotion, so the rule is machine-readable rather
    // than a guess from a prose note — and the seed census gate holds the count at the places that
    // genuinely OCCUPY ground.
    if (l.worldPosInherited) continue;
    seeds.push({ id: l.id, region: l.regionId || l.region || null, name: l.name || l.id,
      lat: wp.colatitude - 90, lon: norm(wp.longitude) });
  }
  seeds.sort((a, b) => a.id.localeCompare(b.id));   // deterministic order, independent of file layout
  // ⚠️ WATERAUTH IS CANON AND IS NOT IN THE REPO YET — rebuild.py read it from Aevi's sandbox. The
  // pipeline runs without it (derived hydrology only) and says so; when the file lands, the authored digs
  // and kinds apply on the next rebuild with no code change.
  let waterAuth = null;
  try { waterAuth = rj("content/packs/core/world/waterauth.json"); } catch { /* not yet shipped */ }
  let placenames = null;
  try { placenames = rj("content/packs/core/world/placenames.json"); } catch { /* naming is optional */ }
  // ⚠️ KIND IS AUTHORED CANON (SNG-406, all 135) and rides into the asset so the map can draw a pole
  // differently from a village. It is read, never derived — Aevi read every row by hand precisely
  // because deriving it from names was ~50% wrong.
  let kinds = null;
  try { kinds = rj("content/packs/core/world/location_kinds.json"); } catch { /* kinds are optional */ }
  return { locs, seeds, waterAuth, placenames, kinds, substrate: rj("content/packs/core/rules/the_substrate.json"), gp: rj("content/packs/core/world/genparams.json") };
}

/** ⛔ THE SEED GATE. genparams.pts must be exactly the canon derivation — a genparams edited by hand while
 *  worldPos moved is the §1 desync in its purest form, and it fails HERE rather than rendering wrong. */
/** ⛔ THIS GATE ENCODED A MODEL ERIK HAS SINCE OVERTURNED, AND KEEPING IT WOULD HAVE INVERTED HIS RULING.
 *  It asserted that `genparams.pts` EQUALS the canon worldPos derivation — i.e. that positions define the
 *  land. SNG-407 then moved eleven locations onto real coast and river, and Erik ruled: **the land is
 *  ground truth, so positions serve the terrain and travel follows position.**
 *
 *  ⚠️ Under that ruling the equality is not merely unnecessary, it is HARMFUL: `pts` is the generator's
 *  input, so syncing it to the moved positions would RESHAPE THE COAST those locations were just snapped
 *  onto. The land would chase the towns that were placed to sit on it. Aevi measured the same mechanism
 *  from the other side in SNG-405 — "the pts sigma making continent wherever locations cluster."
 *
 *  ⛔ So `pts` is FROZEN AUTHORED INPUT and position drift is expected. The build was already correct:
 *  `makeTerrain(canon.gp)` draws the land from pts, while the biome/density/nanite votes and the region
 *  medoids read current worldPos. Only this check was still arguing.
 *
 *  ⚠️ What replaces it is a CENSUS, not silence. Drift is legitimate but it should never be invisible: a
 *  location that has wandered far from the ground that was generated around it is a thing to look at, and
 *  a MASS move would show up here as a changed count rather than as a surprise in the picture. */
export function seedDrift(canon) {
  const pts = canon.gp.pts.map((p) => [p[0], norm(p[1])]);
  const rows = [];
  for (const s of canon.seeds) {
    let best = Infinity;
    for (const q of pts) {
      const d = Math.hypot(s.lat - q[0], ((norm(s.lon) - q[1] + 540) % 360 - 180) * Math.cos(s.lat * R));
      if (d < best) best = d;
    }
    if (best > 0.001) rows.push({ id: s.id, movedDeg: Math.round(best * 100) / 100 });
  }
  rows.sort((a, b) => b.movedDeg - a.movedDeg);
  return { moved: rows, ptsCount: canon.gp.pts.length, seedCount: canon.seeds.length };
}

/** The one thing still worth FAILING on: the generator's own input must not change size underneath the
 *  asset. A pts list that gained or lost points is a different world, not a moved town. */
export function verifySeeds(canon) {
  const bad = [];
  if (canon.gp.pts.length !== 118) bad.push(`genparams.pts is ${canon.gp.pts.length}, not the authored 118 — the LAND changed, which is not a position move`);
  return bad;
}

export function buildWorld(canon) {
  const T = makeTerrain(canon.gp, null);

  // 1 — type + raw over the fine grid
  const type = new Uint8Array(EW * EH), raw = new Float64Array(EW * EH);
  for (let y = 0; y < EH; y++) {
    const lat = 90 - ((y + 0.5) / EH) * 180;
    for (let x = 0; x < EW; x++) {
      const lon = -180 + ((x + 0.5) / EW) * 360;
      const r = T(lon, lat);
      type[y * EW + x] = r.type; raw[y * EW + x] = r.raw;
    }
  }

  // 2 — RLO/RHI: 2nd and 98.5th percentile of LAND raw. ⚠️ GLOBAL and recomputed every build — the spec's
  //     own warning: normalising to the visible range made lowlands render white.
  const landRaw = [];
  for (let i = 0; i < type.length; i++) if (type[i] !== 0) landRaw.push(raw[i]);
  landRaw.sort((a, b) => a - b);
  const RLO = landRaw[Math.floor(landRaw.length * 0.02)];
  const RHI = landRaw[Math.floor(landRaw.length * 0.985)];

  // 3 — elevation: land → 128..254; water → 0..127 by the same normalisation, clamped. Monotone in raw,
  //     documented, and deliberately the ONE formula for both sides.
  const elev = new Uint8Array(EW * EH);
  for (let i = 0; i < type.length; i++) {
    const t01 = (raw[i] - RLO) / (RHI - RLO);
    elev[i] = Math.max(0, Math.min(254, Math.round(128 + t01 * 126)));
    if (type[i] === 0 && elev[i] >= 128) elev[i] = 127;   // water never reads as land elevation
  }

  // 4 — biome / nanite / density, PORTED FROM rebuild.py (a7692575) rather than my earlier voronoi:
  // an inverse-distance-weighted VOTE, w = 1/((d²+6)^1.6), over all 118 seeds — softer than voronoi at
  // region boundaries, which is where my nearest-seed rule lost ~20% of her nanite channel. Each seed
  // votes its own biome (byLocation override, else its region's `natural` state) and its region.
  // ⚠️ HER NANITE TABLE MAPS clear→3; THIS PIPELINE KEEPS clear→0 — the shipped decode and the
  // banner already read 0 as clear, both render grey, and one vocabulary is better than two.
  const NAN_STATE = { clear: 0, ordered: 1, wild: 2 };
  const nanByRegion = canon.substrate.naniteField?.byRegion || {};
  const biomeByRegion = canon.substrate.biome?.byRegion || {};
  const biomeByLocation = canon.substrate.biome?.byLocation || {};
  const densByRegion = canon.substrate.substrateDensity || {};
  const voters = canon.seeds.map((s2) => ({
    lat: s2.lat, lon: s2.lon, region: s2.region,
    biome: (typeof biomeByLocation[s2.id] === "string" ? biomeByLocation[s2.id] : null)
      || biomeByRegion[s2.region]?.natural || "plain",
  }));
  const sources = [];
  for (const l of Object.values(canon.locs)) {
    const src = l.substrateSource;
    if (!src || typeof src !== "object" || !Number.isFinite(src.delta) || !l.worldPos) continue;
    sources.push({ lat: l.worldPos.colatitude - 90, lon: norm(l.worldPos.longitude),
      delta: src.delta, rw: src.radiusWorld || 0.05 });
  }
  const p85 = landRaw[Math.floor(landRaw.length * 0.85)];      // her mountain threshold — 85th, not my 93rd

  // 5–6 — HYDROLOGY on the fine grid, before the pack, because it ADJUSTS elevation (authored digs,
  // smoothing, pit fill) and c3 must ship the adjusted DEM exactly as rebuild.py wrote B_ELEV back.
  const seedPos = {}; for (const s2 of canon.seeds) seedPos[s2.id] = { lat: s2.lat, lon: s2.lon };
  const hyd = buildHydrology({ type, elev, W: EW, H: EH, seedPos, waterAuth: canon.waterAuth });
  for (let i = 0; i < elev.length; i++) elev[i] = Math.max(0, Math.min(255, Math.round(hyd.E[i])));

  const blist = []; const bIdx = (name) => { let i = blist.indexOf(name); if (i < 0) { blist.push(name); i = blist.length - 1; } return i; };
  const c0 = new Uint8Array(W * H), c1 = new Uint8Array(W * H), c2 = new Uint8Array(W * H);
  const fineAt = (x, y) => {
    const lon = -180 + ((x + 0.5) / W) * 360, lat = 90 - ((y + 0.5) / H) * 180;
    const fx = Math.min(EW - 1, Math.floor(((lon + 180) / 360) * EW));
    const fy = Math.min(EH - 1, Math.floor(((90 - lat) / 180) * EH));
    return { i: fy * EW + fx, lon, lat };
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const { i, lon, lat } = fineAt(x, y);
    const ty = type[i];
    // her weighted vote, her flat-lat metric kept for fidelity at this granularity
    let bw = {}, rw2 = {};
    if (ty === 1 || ty === 2) {
      const cl = Math.cos(lat * R);
      for (const v of voters) {
        let dl = Math.abs(lon - v.lon); if (dl > 180) dl = 360 - dl;
        const d2 = (lat - v.lat) ** 2 + (dl * cl) ** 2;
        const w = 1 / Math.pow(d2 + 6, 1.6);
        bw[v.biome] = (bw[v.biome] || 0) + w; rw2[v.region] = (rw2[v.region] || 0) + w;
      }
    }
    const region = (ty === 1 || ty === 2) ? Object.keys(rw2).reduce((a, b) => (rw2[a] >= rw2[b] ? a : b)) : null;
    const nan = region ? (NAN_STATE[nanByRegion[region]?.state] ?? 0) : 0;
    const wa = hyd.WA[i] & 3;                                   // ⚠️ NEW: water kind rides c0 bits 4-5, as rebuild.py packs it
    c0[y * W + x] = (ty & 3) | (nan << 2) | (wa << 4);
    let biome = "sea";
    if (ty === 3) biome = "unexplored";
    else if (ty === 2) biome = "volcanic";
    else if (ty === 1) biome = raw[i] >= p85 ? "mountain" : Object.keys(bw).reduce((a, b) => (bw[a] >= bw[b] ? a : b));
    c1[y * W + x] = bIdx(biome);
    let d = region ? (Number(densByRegion[region]) || 0.5) : 0;
    if (ty === 1 || ty === 2) {
      const cl = Math.cos(lat * R);
      for (const s2 of sources) {
        let dl = Math.abs(lon - s2.lon); if (dl > 180) dl = 360 - dl;
        const dist = Math.hypot(lat - s2.lat, dl * cl) / 57.3;   // her radians conversion, kept
        if (dist < s2.rw * 2.5) d += s2.delta * Math.exp(-Math.pow(dist / s2.rw, 2));
      }
    }
    c2[y * W + x] = Math.max(0, Math.min(63, Math.round(Math.max(0, Math.min(1, d)) * 63)));
  }

  // 7 — region seats: the MEDOID over members that are on land in THIS terrain — the spec's exact wording,
  //     from the bug where a centroid of a scattered network landed in the ocean.
  const landAtSeed = (s) => {
    const fx = Math.min(EW - 1, Math.floor(((s.lon + 180) / 360) * EW));
    const fy = Math.min(EH - 1, Math.floor(((90 - s.lat) / 180) * EH));
    const t = type[fy * EW + fx]; return t === 1 || t === 2;
  };
  // seats carry their own unit vectors — the voronoi table they used to share left with the vote port
  const sv2 = canon.seeds.map((s2) => ({ ...s2,
    x: Math.cos(s2.lat * R) * Math.cos(s2.lon * R), y: Math.cos(s2.lat * R) * Math.sin(s2.lon * R), z: Math.sin(s2.lat * R) }));
  const byRegion = {};
  for (const s of sv2) (byRegion[s.region] ||= []).push(s);
  const seats = {};
  for (const [region, members] of Object.entries(byRegion)) {
    const on = members.filter(landAtSeed);
    if (!on.length) continue;                                   // reported by the gate, never guessed here
    let best = null, bs = Infinity;
    for (const a of on) {
      let sum = 0;
      for (const b of on) sum += Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)));
      if (sum < bs) { bs = sum; best = a; }
    }
    seats[region] = [best.lat, best.lon, best.id];
  }

  // SNG-393 rev 3 — re-anchor the names by polar signature; drift goes to the LOG, never the asset.
  let placeNames = null;
  if (canon.placenames) {
    // ⛔ read-only on canon — the write-back clause is WITHDRAWN (Aevi, 89a035ea). Drift is the row's
    // score in the asset; unresolved names go to the log and the census, never silently dropped.
    const res = resolvePlaceNames(canon.placenames, hyd.hydrology, { seedPos });
    placeNames = res.placeNames;
    for (const r of [...placeNames.rivers, ...placeNames.fens]) if (r.score > 1) console.log(`  name drift: ${r.name} sits ${r.score}° from its authored address (via ${r.via})`);
    for (const u of placeNames.unresolved) console.log(`  ⚠️ UNRESOLVED NAME: ${u.name} — ${u.reason} (its feature genuinely restructured; do not widen the threshold to hide it)`);
  }
  // ⛔ SNG-409 §1 — THE VOTE'S INPUTS SHIP WITH THE ASSET so nanite and density can resolve at any zoom.
  // They were baked at 480×240 like everything else, which is ~10 cells across a 5° view; but unlike the
  // terrain they are not noise fields — they are a WEIGHTED VOTE over region seeds, which is a closed
  // form the browser can evaluate anywhere. ⚠️ Shipping the INPUTS rather than a finer bake is what makes
  // Aevi's constraint hold by construction: the client cannot disagree with the bake because it runs the
  // same expression over the same numbers, so there is no seam to measure.
  const fields = {
    note: "the region vote's inputs — evaluate, do not interpolate. w = 1/((d²+6)^1.6) over voters; nanite is the winning region's state, density its base plus the authored sources.",
    voters: voters.map((v) => [Math.round(v.lat * 1000) / 1000, Math.round(v.lon * 1000) / 1000, v.region]),
    nanByRegion: Object.fromEntries(Object.keys(nanByRegion).map((r) => [r, NAN_STATE[nanByRegion[r]?.state] ?? 0])),
    densByRegion: Object.fromEntries(Object.entries(densByRegion).map(([r, d]) => [r, Number(d) || 0.5])),
    sources: sources.map((s2) => [Math.round(s2.lat * 1000) / 1000, Math.round(s2.lon * 1000) / 1000,
      Math.round(s2.delta * 1000) / 1000, Math.round(s2.rw * 10000) / 10000]),
  };
  return { type, raw, elev, c0, c1, c2, blist, seats, RLO, RHI, seeds: canon.seeds, hydrology: hyd.hydrology, authoredWaterPresent: hyd.authoredWaterPresent, placeNames, fields };
}

/** Serialise in the exact schema engine/worldglobe.js already reads. */
export const TERRAIN_PATH = "content/packs/core/world/terrain.json";

/** The frozen asset, or null if it has never been written. */
export function readTerrain() {
  return existsSync(join(root, TERRAIN_PATH)) ? rj(TERRAIN_PATH) : null;
}

/** ⛔ THE MAP'S LOCATION ROWS — name, region, waygate, tier, role, kind — for every PLACED location.
 *
 *  ⚠️ TIER AND ROLE RIDE THE ASSET so the map can draw a hold differently from a room differently from
 *  a gate. They are CANON (SNG-396/398 ratified them) and the viewer must not re-derive them — it reads
 *  what the pipeline stamped, the same rule that keeps worldPos the sole authority on position.
 *
 *  ⛔ THE MAP'S LOCATION LIST IS NOT THE TERRAIN'S SEED LIST, and conflating them silently deleted
 *  fourteen places from the map. Seeds exclude `worldPosInherited` because a room must not cast a
 *  second biome vote at its building's point (SNG-402) — but a room is still somewhere a player
 *  STANDS, and it still needs a pin. Iterate every placed location, not the seeds.
 *
 *  ⛑ EXPORTED SINCE SNG-582, because under Erik's frozen-world ruling this is the ONE part of the asset
 *  that still has to move: a place authored today needs its row today, and there will never be another
 *  rebuild to fold it in. `scripts/world/place_rows.mjs` splices the output of this same function into the
 *  frozen file — ⚠️ ONE derivation with two callers, because two copies of it would drift the day a field
 *  is added and the map would disagree with itself about places nobody touched. */
export function locationRows(canon, oldMeta = {}) {
  const meta = {};
  for (const l of Object.values(canon.locs)) {
    const wp = l.worldPos;
    if (!wp || !Number.isFinite(wp.colatitude) || !Number.isFinite(wp.longitude)) continue;
    const kRow = (canon.kinds?.kinds || canon.kinds || {})[l.id];
    meta[l.id] = { n: l.name || l.id, r: l.regionId || l.region || null,
      wg: (l.waygate || oldMeta[l.id]?.wg) ? 1 : 0, t: l.tier || null, ro: l.role || null,
      k: (typeof kRow === "string" ? kRow : kRow?.kind) || null };
  }
  return meta;
}

/** ⛔ WHICH PLACED LOCATIONS THE FROZEN WORLD DOES NOT KNOW. Under the old rule this was always zero on
 *  the next rebuild; under the frozen-world ruling it is a real, permanent hole until somebody splices the
 *  row in — a place with no row has no pin and no metadata on the world map, while existing in the fiction. */
export function rowsMissing(canon, terrain) {
  const have = terrain?.locations || {};
  return Object.keys(locationRows(canon)).filter((id) => !have[id]).sort();
}

export function serialise(built, canon) {
  const b64 = (u8) => Buffer.from(u8).toString("base64");
  // ⚠️ NORMALISED BEFORE HASHING — the determinism gate's first red was this hash catching ITSELF:
  // git's autocrlf rewrites the generator's line endings on checkout, so hashing raw working-copy bytes
  // made the provenance stamp machine-dependent. Same code, different sha, "drift" with no drift.
  const genHash = createHash("sha256").update(readFileSync(join(root, "scripts/world/terrain.mjs"), "utf8").split(String.fromCharCode(13)).join("")).digest("hex").slice(0, 16);
  const gpHash = createHash("sha256").update(JSON.stringify(canon.gp)).digest("hex").slice(0, 16);
  const meta = locationRows(canon, readTerrain()?.locations || {});
  return {
    schemaVersion: 2,
    id: "terrain",
    kind: "world",
    note: "SNG-391 — REGENERABLE. Built by scripts/world/generate_world.mjs from canon (worldPos, the_substrate.json, genparams.json). type+elevation are EXACT generator output; nanite/density/biome are DERIVED-BY-RULE (voronoi region + authored states; the rule explains ~80% of the previous hand-built nanite channel and is corrected in code, not in pixels). Do not edit this file — edit canon and rebuild.",
    generatedBy: { pipeline: "scripts/world/generate_world.mjs", generatorSha: genHash, genparamsSha: gpHash, RLO: built.RLO, RHI: built.RHI },
    encoding: {
      grid: { w: W, h: H, note: "equirectangular; row 0 is lat +90, column 0 is lon -180. MAP FRAME: lat = colatitude - 90 (the Crossing is the south pole)." },
      elevationGrid: { w: EW, h: EH },
      c0: "bits 0-1 = surface type (0 water, 1 land, 2 volcanic, 3 UNEXPLORED); bits 2-3 = nanite state (0 clear, 1 ordered, 2 wild); bits 4-5 = water kind (0 none, 1 river, 2 lake, 3 marsh) — rebuild.py's packing, rev 2",
      c1: "index into biomes[]",
      c2: "lattice density 0-63 (divide by 63)",
      c3: "elevation 0-254 at 720x360; 128 is sea level; water packs 0-127 by the same normalisation",
    },
    biomes: built.blist,
    features: readTerrain()?.features || {},
    locations: meta,
    seats: built.seats,
    hydrology: built.hydrology,
    fields: built.fields,
    placeNames: built.placeNames,
    authoredWater: built.authoredWaterPresent ? "applied" : "⚠️ ABSENT — content/packs/core/world/waterauth.json has not shipped; derived hydrology only. The authored digs and kinds apply on the next rebuild once the canon lands.",
    points: built.seeds.map((s) => [s.id, s.region, s.lat, s.lon, "land"]),
    layers: { c0: b64(built.c0), c1: b64(built.c1), c2: b64(built.c2), c3: b64(built.elev) },
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, "/").replace(/^([a-z]):/i, (m) => m.toUpperCase()) ? true : process.argv[1]?.endsWith("generate_world.mjs");
if (isMain) {
  const canon = loadCanon();
  // ⚠️ the drift census prints on every build — legitimate under Erik's ruling, never invisible
  const drift = seedDrift(canon);
  if (drift.moved.length) console.log(`  seed drift: ${drift.moved.length} location(s) have moved off the ground generated around them — ` +
    drift.moved.slice(0, 5).map((r) => r.id + ' ' + r.movedDeg + '°').join(', ') + (drift.moved.length > 5 ? ', …' : '') +
    ' (land is ground truth: positions serve the terrain — Erik, SNG-407)');
  const seedBad = verifySeeds(canon);
  if (seedBad.length) {
    console.error("⛔ SEED DRIFT — genparams.pts no longer matches canon worldPos:");
    for (const b of seedBad.slice(0, 8)) console.error("   " + b);
    process.exit(1);
  }
  const path = join(root, TERRAIN_PATH);

  // ⛔ ERIK 2026-09-14 — THE WORLD IS FROZEN: "i've already ruled that I don't intend to ever regenerate the
  // world again… so the new normal are authored locations and mods to what we have."
  //
  // ⚠️ SO THE --check ABOVE THIS LINE USED TO ASSERT DETERMINISM — that regenerating reproduces disk byte for
  // byte — and under the ruling that question can only ever answer NO and can never be worth fixing. Every
  // authored place changes what a rebuild WOULD produce while the committed asset correctly stays put, so
  // the gate went permanently red for doing the right thing. ⛑ A gate that fails for the ruled behaviour
  // trains people to ignore it, and it had already been baselined as an accepted failure, which is the same
  // thing more quietly.
  //
  // ⚑ WHAT REPLACES IT IS THE QUESTION THE RULING MAKES REAL: the asset is now ground truth, so is it INTACT,
  // and does it still know every place canon has? The second half was already broken when he ruled — three
  // placed locations had no row and therefore no pin on the map. `place_rows.mjs` is the door that moves it.
  if (process.argv.includes("--check")) {
    const t = readTerrain();
    const problems = [];
    if (!t) problems.push("terrain.json is absent — and nothing may rebuild it");
    else {
      // ⛑ INTACT: the shape a half-written or truncated asset would fail. The layer sizes are the encoding's
      // own numbers, not retyped constants — a grid change would have to move them together.
      const g = t.encoding?.grid || {}, eg = t.encoding?.elevationGrid || {};
      const want = { c0: g.w * g.h, c1: g.w * g.h, c2: g.w * g.h, c3: eg.w * eg.h };
      for (const [k, n] of Object.entries(want)) {
        const got = Math.floor(String(t.layers?.[k] || "").length / 4) * 3;   // base64 → bytes, less padding
        if (!Number.isFinite(n) || n <= 0 || Math.abs(got - n) > 3) problems.push(`layer ${k} is ${got} bytes, not the ${n} its own encoding declares`);
      }
      if ((t.points || []).length !== 118) problems.push(`points is ${(t.points || []).length}, not the frozen 118`);
      if (!(t.biomes || []).length) problems.push("biomes list is empty");
      // ⛔ COMPLETE: every placed location has a row, or it has no pin and no metadata on the map.
      const missing = rowsMissing(canon, t);
      if (missing.length) problems.push(`${missing.length} placed location(s) have no row — ${missing.join(", ")} — run: node scripts/world/place_rows.mjs`);
    }
    if (problems.length) { console.error("⛔ THE FROZEN WORLD IS NOT WHOLE:"); for (const p of problems) console.error("   " + p); process.exit(1); }
    console.log(`✅ frozen world intact: ${(t.points || []).length} seeds · ${Object.keys(t.locations || {}).length} place rows · ${(t.biomes || []).length} biomes · 4 layers at their declared sizes`);
    process.exit(0);
  }

  // ⛔ AND THE WRITE PATH REFUSES. Running this would replace Erik's frozen ground with a fresh derivation
  // — silently, in one command, with no diff a reader could check, because the layers are base64. ⚠️ THE
  // RULING IS THE REASON, so the refusal quotes it rather than inventing a policy of its own, and it names
  // the door that IS open. A ruling that lives only in a transcript gets re-broken by whoever did not read it.
  if (!process.argv.includes("--i-am-regenerating-the-world")) {
    console.error("⛔ REFUSED — the world is frozen (Erik, 2026-09-14): \"I don't intend to ever regenerate the");
    console.error("   world again… so the new normal are authored locations and mods to what we have.\"");
    console.error("");
    console.error("   To add or correct a PLACE:  node scripts/world/place_rows.mjs");
    console.error("   To check the asset:         node scripts/world/generate_world.mjs --check");
    console.error("   To override anyway (his call, not yours): --i-am-regenerating-the-world");
    process.exit(1);
  }

  const built = buildWorld(canon);
  const out = JSON.stringify(serialise(built, canon));
  writeFileSync(path, out);
  console.log(`wrote ${path} — ${(out.length / 1024).toFixed(0)}KB · RLO ${built.RLO.toFixed(4)} RHI ${built.RHI.toFixed(4)} · ${built.blist.length} biomes · ${Object.keys(built.seats).length} seats`);
  console.log("⚠️ the frozen world was overwritten on an explicit override — check the place rows and the map before shipping");
}
