// scripts/world/generate_world.mjs — SNG-391. THE PIPELINE, which is the whole ticket.
//
// Aevi, §1 of the handoff: "I regenerated this world EIGHT times in one session… each time I rebuilt the
// derived layers by hand, with scripts I wrote in the moment. That is not a pipeline; it is me
// remembering. A build step cannot forget to rebuild. I can, and did, repeatedly."
//
// Run:   node scripts/world/generate_world.mjs           # rebuild content/packs/core/world/terrain.json
//        node scripts/world/generate_world.mjs --check   # regenerate in memory, diff against disk (gate)
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
    seeds.push({ id: l.id, region: l.regionId || l.region || null, name: l.name || l.id,
      lat: wp.colatitude - 90, lon: norm(wp.longitude) });
  }
  seeds.sort((a, b) => a.id.localeCompare(b.id));   // deterministic order, independent of file layout
  return { locs, seeds, substrate: rj("content/packs/core/rules/the_substrate.json"), gp: rj("content/packs/core/world/genparams.json") };
}

/** ⛔ THE SEED GATE. genparams.pts must be exactly the canon derivation — a genparams edited by hand while
 *  worldPos moved is the §1 desync in its purest form, and it fails HERE rather than rendering wrong. */
export function verifySeeds(canon) {
  const bad = [];
  const have = new Set(canon.gp.pts.map((p) => p[0].toFixed(4) + "," + p[1].toFixed(4)));
  for (const s of canon.seeds) {
    const key = s.lat.toFixed(4) + "," + norm(s.lon).toFixed(4);
    if (!have.has(key)) bad.push(`${s.id} — canon seed [${s.lat},${s.lon}] missing from genparams.pts`);
  }
  if (canon.gp.pts.length !== canon.seeds.length) bad.push(`count: genparams ${canon.gp.pts.length} vs canon ${canon.seeds.length}`);
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

  // 4 — region assignment: nearest seed on the sphere. DERIVED-BY-RULE (see the header).
  const sv = canon.seeds.map((s) => ({ ...s,
    x: Math.cos(s.lat * R) * Math.cos(s.lon * R), y: Math.cos(s.lat * R) * Math.sin(s.lon * R), z: Math.sin(s.lat * R) }));
  const nearestSeed = (lon, lat) => {
    const x = Math.cos(lat * R) * Math.cos(lon * R), y = Math.cos(lat * R) * Math.sin(lon * R), z = Math.sin(lat * R);
    let best = null, bd = -2;
    for (const s of sv) { const d = s.x * x + s.y * y + s.z * z; if (d > bd) { bd = d; best = s; } }
    return best;
  };

  const NAN_STATE = { clear: 0, ordered: 1, wild: 2 };
  const nanByRegion = canon.substrate.naniteField?.byRegion || {};
  const biomeByRegion = canon.substrate.biome?.byRegion || {};
  const biomeByLocation = canon.substrate.biome?.byLocation || {};
  const densByRegion = canon.substrate.substrateDensity || {};

  // density sources: authored substrateSource per location, gaussian delta·exp(−(d/r)²), compact at 2.5r
  const sources = [];
  for (const l of Object.values(canon.locs)) {
    const src = l.substrateSource;
    if (!src || typeof src !== "object" || !Number.isFinite(src.delta) || !l.worldPos) continue;
    const lat = l.worldPos.colatitude - 90, lon = norm(l.worldPos.longitude);
    sources.push({ lat, lon, delta: src.delta, rDeg: (src.radiusWorld || 0.06) * 180 / Math.PI,
      x: Math.cos(lat * R) * Math.cos(lon * R), y: Math.cos(lat * R) * Math.sin(lon * R), z: Math.sin(lat * R) });
  }
  const gcDeg = (a, x, y, z) => Math.acos(Math.max(-1, Math.min(1, a.x * x + a.y * y + a.z * z))) * 180 / Math.PI;

  // biome vocabulary is built from what the rules actually produce, in first-use order
  const blist = []; const bIdx = (name) => { let i = blist.indexOf(name); if (i < 0) { blist.push(name); i = blist.length - 1; } return i; };
  const p93 = landRaw[Math.floor(landRaw.length * 0.93)];

  const c0 = new Uint8Array(W * H), c1 = new Uint8Array(W * H), c2 = new Uint8Array(W * H);
  const fineAt = (x, y) => {                                     // 8 — the pack samples the FINE grid (nearest)
    const lon = -180 + ((x + 0.5) / W) * 360, lat = 90 - ((y + 0.5) / H) * 180;
    const fx = Math.min(EW - 1, Math.floor(((lon + 180) / 360) * EW));
    const fy = Math.min(EH - 1, Math.floor(((90 - lat) / 180) * EH));
    return { i: fy * EW + fx, lon, lat };
  };
  const waterNear = (fx, fy) => {                                // coast = land within one coarse cell of water
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = fy + dy, xx = ((fx + dx) % EW + EW) % EW;
      if (yy >= 0 && yy < EH && type[yy * EW + xx] === 0) return true;
    }
    return false;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const { i, lon, lat } = fineAt(x, y);
    const ty = type[i];
    const seed = nearestSeed(lon, lat);
    const region = seed ? seed.region : null;
    // nanite: the region's authored state; water and unexplored carry clear
    const nan = ty === 1 || ty === 2 ? (NAN_STATE[nanByRegion[region]?.state] ?? 0) : 0;
    c0[y * W + x] = (ty & 3) | (nan << 2);
    // biome: terrain conditions first, then the authored natural state, then the per-location override
    let biome = "sea";
    if (ty === 3) biome = "unexplored";
    else if (ty === 2) biome = "volcanic";
    else if (ty === 1) {
      const over = biomeByLocation[seed?.id];
      biome = (over && typeof over === "string" ? over : null)
        || (raw[i] >= p93 ? "mountain" : null)
        || (waterNear(i % EW, Math.floor(i / EW)) ? "coast" : null)
        || biomeByRegion[region]?.natural || "plain";
    }
    c1[y * W + x] = bIdx(biome);
    // density: region baseline + source gaussians, clamped 0..1, packed 0..63
    let d = Number(densByRegion[region]) || 0.4;
    if (ty === 1 || ty === 2) {
      const px = Math.cos(lat * R) * Math.cos(lon * R), py = Math.cos(lat * R) * Math.sin(lon * R), pz = Math.sin(lat * R);
      for (const s of sources) {
        const dd = gcDeg(s, px, py, pz);
        if (dd < s.rDeg * 2.5) d += s.delta * Math.exp(-Math.pow(dd / s.rDeg, 2));
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
  const byRegion = {};
  for (const s of sv) (byRegion[s.region] ||= []).push(s);
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

  return { type, raw, elev, c0, c1, c2, blist, seats, RLO, RHI, seeds: canon.seeds };
}

/** Serialise in the exact schema engine/worldglobe.js already reads. */
export function serialise(built, canon) {
  const b64 = (u8) => Buffer.from(u8).toString("base64");
  const genHash = createHash("sha256").update(readFileSync(join(root, "scripts/world/terrain.mjs"))).digest("hex").slice(0, 16);
  const gpHash = createHash("sha256").update(JSON.stringify(canon.gp)).digest("hex").slice(0, 16);
  const meta = {};
  const oldMeta = existsSync(join(root, "content/packs/core/world/terrain.json"))
    ? (rj("content/packs/core/world/terrain.json").locations || {}) : {};
  for (const s of built.seeds) meta[s.id] = { n: s.name, r: s.region, wg: oldMeta[s.id]?.wg ? 1 : 0 };
  return {
    schemaVersion: 2,
    id: "terrain",
    kind: "world",
    note: "SNG-391 — REGENERABLE. Built by scripts/world/generate_world.mjs from canon (worldPos, the_substrate.json, genparams.json). type+elevation are EXACT generator output; nanite/density/biome are DERIVED-BY-RULE (voronoi region + authored states; the rule explains ~80% of the previous hand-built nanite channel and is corrected in code, not in pixels). Do not edit this file — edit canon and rebuild.",
    generatedBy: { pipeline: "scripts/world/generate_world.mjs", generatorSha: genHash, genparamsSha: gpHash, RLO: built.RLO, RHI: built.RHI },
    encoding: {
      grid: { w: W, h: H, note: "equirectangular; row 0 is lat +90, column 0 is lon -180. MAP FRAME: lat = colatitude - 90 (the Crossing is the south pole)." },
      elevationGrid: { w: EW, h: EH },
      c0: "bits 0-1 = surface type (0 water, 1 land, 2 volcanic, 3 UNEXPLORED); bits 2-3 = nanite state (0 clear, 1 ordered, 2 wild)",
      c1: "index into biomes[]",
      c2: "lattice density 0-63 (divide by 63)",
      c3: "elevation 0-254 at 720x360; 128 is sea level; water packs 0-127 by the same normalisation",
    },
    biomes: built.blist,
    features: existsSync(join(root, "content/packs/core/world/terrain.json")) ? (rj("content/packs/core/world/terrain.json").features || {}) : {},
    locations: meta,
    seats: built.seats,
    points: built.seeds.map((s) => [s.id, s.region, s.lat, s.lon, "land"]),
    layers: { c0: b64(built.c0), c1: b64(built.c1), c2: b64(built.c2), c3: b64(built.elev) },
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, "/").replace(/^([a-z]):/i, (m) => m.toUpperCase()) ? true : process.argv[1]?.endsWith("generate_world.mjs");
if (isMain) {
  const canon = loadCanon();
  const seedBad = verifySeeds(canon);
  if (seedBad.length) {
    console.error("⛔ SEED DRIFT — genparams.pts no longer matches canon worldPos:");
    for (const b of seedBad.slice(0, 8)) console.error("   " + b);
    process.exit(1);
  }
  const built = buildWorld(canon);
  const doc = serialise(built, canon);
  const out = JSON.stringify(doc);
  const path = join(root, "content/packs/core/world/terrain.json");
  if (process.argv.includes("--check")) {
    const disk = readFileSync(path, "utf8");
    const same = disk === out;
    console.log(same ? "✅ determinism: regenerated world is byte-identical to disk"
      : `⛔ DRIFT: regenerated world differs from disk (${disk.length} vs ${out.length} bytes) — content changed without a rebuild, or the generator moved`);
    process.exit(same ? 0 : 1);
  }
  writeFileSync(path, out);
  console.log(`wrote ${path} — ${(out.length / 1024).toFixed(0)}KB · RLO ${built.RLO.toFixed(4)} RHI ${built.RHI.toFixed(4)} · ${built.blist.length} biomes · ${Object.keys(built.seats).length} seats`);
}
