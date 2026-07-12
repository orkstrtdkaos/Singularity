// content_ci.mjs — SNG-BATCH-10 Phase 4 / SNG-040/064: the content integrity gate.
// The manifest bug ran the live game on SIX locations for weeks, silently — a load whitelist
// out of sync with the files on disk, and a provides.* key (quests) the loader never read. This
// FAILS THE BUILD on that whole class of bug so content can never silently not-exist again.
//
// Run: node tests/content_ci.mjs   (exit 1 on any violation)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../engine/genschema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));

let failures = 0;
const fail = msg => { console.log("FAIL  " + msg); failures++; };
const ok = msg => console.log("ok    " + msg);
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));

// The provides.* keys each pack's loader (engine/state.js) actually READS. A manifest key not in
// this set is content the engine cannot see — exactly what bit quests. Keep in sync with state.js.
const HANDLED = {
  core: new Set(["spectrums", "rules", "abilities", "items"]),
  valley: new Set(["locations", "npcs", "events", "companions", "lore", "encounters", "items", "quests"]),
};

const PACKS = [
  { key: "core", dir: "content/packs/core", manifest: "content/packs/core/manifest.json" },
  { key: "valley", dir: "content/packs/valley", manifest: "content/packs/valley/manifest.json" },
];

// Valley subdirs that are PURELY manifest-driven (every .json must be listed). Excludes dirs with
// files the loader fetches directly (core/rules holds traditions/origins/backgrounds/quest_structure;
// valley root holds prologue.json) — those are not manifest whitelists.
const STRICT_DIRS = { valley: ["locations", "npcs", "events", "companions", "encounters", "items", "lore"] };

for (const pack of PACKS) {
  const m = rj(pack.manifest);
  const provides = m.provides || {};

  // (1) every provides.* key is one the loader handles
  for (const key of Object.keys(provides)) {
    check(`[${pack.key}] provides.${key} is a key the loader reads`, HANDLED[pack.key].has(key),
      "the loader never reads it — this content silently does not load (see quests, SNG-065)");
  }

  // (2) every manifest path points to a file that exists
  const listed = {};
  for (const [key, val] of Object.entries(provides)) {
    const paths = Array.isArray(val) ? val : [val];
    listed[key] = new Set();
    for (const p of paths) {
      const abs = `${pack.dir}/${p}`;
      check(`[${pack.key}] manifest ${key} → ${p} exists`, existsSync(join(root, abs)), "manifest path with no file");
      listed[key].add(p.split("/").pop());
    }
  }

  // (3) every file in a strictly-manifest-driven dir is listed (no silent unlisted content)
  for (const sub of (STRICT_DIRS[pack.key] || [])) {
    const dirAbs = join(root, pack.dir, sub);
    if (!existsSync(dirAbs)) continue;
    const onDisk = readdirSync(dirAbs).filter(f => f.endsWith(".json") || f.endsWith(".md"));
    // the manifest key for a subdir is the plural (locations/npcs/…); lore/items match by dir name
    const key = Object.keys(provides).find(k => (Array.isArray(provides[k]) ? provides[k] : [provides[k]]).some(p => String(p).startsWith(sub + "/")));
    const listedSet = key ? listed[key] : new Set();
    for (const f of onDisk) check(`[${pack.key}] ${sub}/${f} is listed in the manifest`, listedSet.has(f), "on disk but not a manifest whitelist entry (SNG-064)");
  }
}

// (4) location connectivity: dangling connections, one-way edges, unreachable locations
{
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const locs = {};
  for (const f of files) { const l = rj(`${locDir}/${f}`); locs[l.id] = l; }
  const ids = new Set(Object.keys(locs));
  const edges = {};
  let dangling = 0, oneway = 0;
  for (const [id, l] of Object.entries(locs)) {
    edges[id] = (l.connections || []).filter(Boolean);
    for (const t of edges[id]) if (!ids.has(t)) { dangling++; if (dangling <= 5) fail(`dangling connection: ${id} → ${t} (no such location)`); }
  }
  for (const [id, tos] of Object.entries(edges)) for (const t of tos) {
    if (ids.has(t) && !(edges[t] || []).includes(id)) { oneway++; if (oneway <= 5) fail(`one-way edge: ${id} → ${t} but not back (a player who walks in is trapped)`); }
  }
  check("no dangling connections", dangling === 0, `${dangling} found`);
  check("no one-way edges", oneway === 0, `${oneway} found`);
  // reachability from the hub (The Crossing / the world center)
  const rootId = ids.has("the_crossing") ? "the_crossing" : ids.has("the_axis_gate") ? "the_axis_gate" : Object.keys(locs)[0];
  const seen = new Set([rootId]); const queue = [rootId];
  while (queue.length) { const n = queue.shift(); for (const t of edges[n] || []) if (ids.has(t) && !seen.has(t)) { seen.add(t); queue.push(t); } }
  const unreachable = [...ids].filter(id => !seen.has(id));
  check(`all ${ids.size} locations reachable from ${rootId}`, unreachable.length === 0, `${unreachable.length} unreachable: ${unreachable.slice(0, 8).join(", ")}`);
}

// (5) authored content validates against its derived schema (would have caught the poleIntensity bug)
{
  const locSchema = rj("schemas/location.schema.json");
  const npcSchema = rj("schemas/npc.schema.json");
  const arcSchema = rj("schemas/arc.schema.json");
  const runDir = (dir, schema, label, skip = () => false) => {
    let bad = 0, total = 0;
    for (const f of readdirSync(join(root, dir)).filter(n => n.endsWith(".json"))) {
      if (skip(f)) continue; total++;
      const r = validate(rj(`${dir}/${f}`), schema);
      if (!r.valid) { bad++; if (bad <= 5) fail(`${label} schema: ${f} — ${(r.errors || []).join("; ")}`); }
    }
    check(`all ${total} ${label} validate against the schema`, bad === 0, `${bad} invalid`);
  };
  runDir("content/packs/valley/locations", locSchema, "locations");
  runDir("content/packs/valley/npcs", npcSchema, "NPCs", f => f === "legends.json");
  const arcsFile = "content/packs/valley/lore/greater_arcs.json";
  if (existsSync(join(root, arcsFile))) {
    const arcs = rj(arcsFile).arcs || [];
    let bad = 0; for (const a of arcs) { const r = validate(a, arcSchema); if (!r.valid) { bad++; if (bad <= 5) fail(`arc schema: ${a.id} — ${(r.errors || []).join("; ")}`); } }
    check(`all ${arcs.length} greater-arcs validate against the schema`, bad === 0, `${bad} invalid`);
  }
}

console.log(failures === 0 ? "\nContent CI: all checks passed." : `\nContent CI: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
