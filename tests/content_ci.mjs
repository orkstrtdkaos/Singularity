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

// Subdirs that are PURELY manifest-driven (every .json must be listed). SNG-092: core/rules and
// core/abilities are now whitelists too — every rules + abilities file is in provides.* and the loader
// reads ONLY through the manifest (no hardcoded paths, no positional rules[0]). This is the check that
// was missing: it used to cover the VALLEY manifest only, so an unlisted core rules or ability file
// (attribute_gates jumping to rules[0]; 4 reach_* files never loading) sailed straight through.
const STRICT_DIRS = { core: ["rules", "abilities"], valley: ["locations", "npcs", "events", "companions", "encounters", "items", "lore"] };

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

// (3b) SNG-089 — THE notFor LAW + harm-rung validity. A `notFor` may constrain HOW an ability serves
// a need; it may NEVER forbid the need itself. An ability tagged FIGHT whose notFor forbids harm/
// fighting outright is the palework-boar bug (the GM reads the prose, so the prose wins). Patterns are
// CONSERVATIVE — clear need-negations only, never degree-caps ("does not slay/smite" = a legal cap) —
// so a legitimate cap can never false-fail the build. And a harmRung, when set, must be a real rung.
{
  const HARM_RUNGS = new Set(["lethal", "damaging", "incapacitating", "none"]);
  // "forbid the need" phrasings that are ILLEGAL on a FIGHT-tagged craft (not degree-caps):
  const forbidsHarm = nf => {
    const s = String(nf || "").toLowerCase();
    return /\bcannot\s+(be\s+used\s+to\s+)?(fight|harm|hurt|injure|damage)\b/.test(s)
      || /\b(cannot|will\s+not|does\s+not)\s+(be\s+used\s+)?(on|against)\s+(the\s+)?living\b/.test(s)
      || /\bforce\s+(the\s+living|.{0,15}?)\bto\s+die\b/.test(s)
      || /\b(cannot|does\s+not)\s+help\s+you\s+(escape|flee|get\s+away)\b/.test(s);
  };
  const abFiles = (rj("content/packs/core/manifest.json").provides?.abilities) || [];
  let total = 0;
  for (const rel of abFiles) {
    let doc; try { doc = rj(`content/packs/core/${rel}`); } catch { continue; }
    const abs = Array.isArray(doc) ? doc : Array.isArray(doc.abilities) ? doc.abilities : [doc];
    for (const a of abs) {
      if (!a || !a.id) continue;
      total++;
      const cts = (a.challengeTypes || []).map(String);
      if (cts.includes("FIGHT")) {
        check(`ability "${a.id}" FIGHT + notFor obeys the notFor LAW`, !forbidsHarm(a.notFor),
          `notFor forbids the NEED, not just the HOW: "${String(a.notFor || "").slice(0, 80)}" — a FIGHT craft may cap HOW it harms, never forbid harm itself (SNG-089)`);
      }
      if (a.harmRung != null) {
        check(`ability "${a.id}" harmRung "${a.harmRung}" is a real rung`, HARM_RUNGS.has(a.harmRung),
          "must be lethal | damaging | incapacitating | none");
      }
    }
  }
  ok(`the notFor LAW checked ${total} abilities across ${abFiles.length} files`);
}

// (3c) SNG-090 — every location must resolve an effective substrate density (per-location override or
// its region's density in the_substrate.json). A place with no density can't compute the substrate
// factor — a silent hole in the second difficulty map.
{
  const sub = rj("content/packs/core/rules/the_substrate.json");
  const D = sub.substrateDensity || {};
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const noDensity = [];
  for (const f of files) {
    const l = rj(`${locDir}/${f}`);
    const region = l.regionId || l.region;
    if (typeof l.substrateDensity !== "number" && !(region in D)) noDensity.push(l.id || f);
  }
  check("every location resolves a substrate density", noDensity.length === 0,
    `${noDensity.length} with no density (region not in the_substrate.json): ${noDensity.slice(0, 8).join(", ")}`);
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

// (6) quest integrity (SNG-065 + BOUNDARY-1): real quests, resolvable giver/region, and every
// outcome carries machine-readable effects[] — prose alone is not a durable consequence.
{
  const qf = existsSync(join(root, "content/packs/valley/quests.json")) ? rj("content/packs/valley/quests.json") : { quests: [] };
  const defs = qf.quests || [];
  const npcIds = new Set(readdirSync(join(root, "content/packs/valley/npcs")).filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")));
  const regionIds = [];
  for (const f of readdirSync(join(root, "content/packs/valley/locations")).filter(x => x.endsWith(".json"))) { const j = rj(`content/packs/valley/locations/${f}`); if (j.regionId && !regionIds.includes(j.regionId)) regionIds.push(j.regionId); }
  for (const q of defs) {
    check(`quest ${q.id} names its stakes + stages + outcomes (is a quest, not an errand)`, !!(q.stakes && (q.stages || []).length && (q.outcomes || []).length), "the schema's THE RULE");
    if (q.giver) check(`quest ${q.id} giver "${q.giver}" resolves to an authored NPC`, npcIds.has(q.giver), "no such npc file");
    if (q.region && regionIds.length) check(`quest ${q.id} region "${q.region}" is a real region`, regionIds.includes(q.region), "no location carries that regionId");
    for (const o of q.outcomes || []) {
      check(`quest ${q.id} outcome "${o.id}" carries machine-readable effects[]`, Array.isArray(o.effects) && o.effects.length > 0, "prose alone is not a consequence the engine can apply (BOUNDARY-1)");
      const durable = (o.effects || []).some(e => ["npc_state", "disposition", "codex_fact", "world_event", "location_state", "ally"].includes(e.type));
      check(`quest ${q.id} outcome "${o.id}" has at least one DURABLE, findable effect`, durable, "xp/quest_seed alone changes nothing you can go back and see");
    }
  }
}

console.log(failures === 0 ? "\nContent CI: all checks passed." : `\nContent CI: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
