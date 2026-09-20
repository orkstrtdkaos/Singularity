// scripts/map_convergence_check.mjs — ⛔ ONE PROJECTION, ONE TERRAIN, ONE FIELD, ONE DISTANCE, ONE MAP.
//
// ⛔ WHY THIS EXISTS. The world is drawn by three programs. `engine/worldglobe.js` is the one the game loads;
// `exesa_field.html` and `singularity_world.html` each carry their OWN projection, their OWN terrain generator and
// their OWN baked copy of the world's coordinates — and the copies have drifted (41 of 44 authored field sources
// have a baked twin within half a degree; Archive Hollow and Waystone are missing from the bake; Raven's Home is
// four degrees out). ⚠️ A second implementation of a thing that already exists is how a map stops agreeing with
// the game, and a THIRD is how it stops agreeing with itself. Aevi: "a convergence audit that does not enumerate
// every renderer is not an audit" — `read.html` linked the third planet, which is how it survived a month.
//
// ⛑ RED ON ARRIVAL, BY DESIGN (Aevi, `po/REPLY_aevi_map_convergence.md` §5). A check that is green the day it
// lands has not been pointed at anything. It goes green as the convergence work lands, in this order:
//   1. this check · 2. extract `engine/field.js` from exesa (the field engine, per REPLY_aevi_exesa_field_engine)
//   3. delete the two pages · 4. the field as a layer at all three tiers · 5. the P5 tiers · 6. miles everywhere
//
// ⚠️ IT IS NOT IN `run_tests.mjs` YET, AND THAT IS DELIBERATE. The ratchet blocks a push when a suite's failure
// count rises, so a suite built to be red would wall the repo off from every other piece of work. It joins the
// suite the day the deletions make it green. Until then: `node scripts/map_convergence_check.mjs`.
//
// Exit code is the number of failed assertions, so a caller can gate on it later without parsing words.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SKIP = new Set([".git", "node_modules", "characters", "chronicle", "players", "err", "po", "docs", "data"]);
const read = (p) => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return ""; } };
const walk = (d, out = []) => {
  for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = d ? `${d}/${e.name}` : e.name;
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const FILES = walk("");
const CODE = FILES.filter(f => /\.(js|mjs|html)$/.test(f));
const ROOT_PAGES = FILES.filter(f => /^[^/]+\.html$/.test(f));

let failed = 0, passed = 0;
const lines = [];
function check(name, ok, detail = "") {
  if (ok) { passed++; lines.push(`ok    ${name}`); }
  else { failed++; lines.push(`FAIL  ${name}${detail ? `\n      ${detail}` : ""}`); }
}

// ── 1 · ONE PROJECTION ───────────────────────────────────────────────────────────────────────────────────────
// ⚠️ `project(` and not `projectThreshold(` — `engine/projects.js` is about a character's undertakings and has
// nothing to do with the globe. A word is not a namespace.
{
  const defs = [];
  for (const f of CODE) for (const m of read(f).matchAll(/(?:export\s+)?function\s+(un)?project\s*\(/g)) defs.push(`${f}:${(m[1] || "") + "project"}`);
  const exported = CODE.filter(f => /export\s+function\s+project\s*\(/.test(read(f)));
  check("1 · ONE PROJECTION — exactly one exported `project`, and nothing re-implements it",
    exported.length === 1 && exported[0] === "engine/worldglobe.js" && defs.filter(d => !d.startsWith("engine/worldglobe.js")).length === 0,
    `exported by: ${exported.join(", ") || "nobody"} · other definitions: ${defs.filter(d => !d.startsWith("engine/worldglobe.js")).join(" · ") || "none"}`);
}

// ── 2 · NO BAKED COORDINATES IN A RENDERER ───────────────────────────────────────────────────────────────────
// ⛔ The drift IS the baked copies. A renderer reads the world; it does not carry one. Counted as literal rows of
// numbers — `[-68,-164,0.2,0.054]` and `["millbrook","valley",-64,-112,"land"]` are both rows.
{
  // ⚠️ ASKED OF WORLD RENDERERS ONLY, AND OF ROWS THAT ARE PLACES. The first cut counted every pair of numbers and
  // accused Aevi's colour ramps in `worldglobe`, the icon path data in `mapicons` and a feature table in
  // `holdings` — none of which is a baked world. A place row names itself: `["millbrook","valley",-64,-112,"land"]`.
  const PLACE_ROW = /\[\s*"[a-z0-9_-]+"\s*,\s*"[a-z0-9_-]+"\s*,\s*-?\d/gi;
  const NUM_ROW = /\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*[,\]]/g;
  const renderers = CODE.filter(f => (/^[^/]+\.html$/.test(f) && f !== "index.html") || /function\s+(un)?project\s*\(/.test(read(f)));
  const baked = [];
  for (const f of renderers) {
    const src = read(f);
    const places = (src.match(PLACE_ROW) || []).length;
    const rows = (src.match(NUM_ROW) || []).length;
    if (places > 0 || rows >= 40) baked.push(`${f} (${places} place rows, ${rows} numeric rows)`);
  }
  check("2 · NO BAKED COORDINATES IN A RENDERER — the world is read, never carried",
    baked.length === 0, `looked at ${renderers.length} world renderer(s)${baked.length ? `: ${baked.join(" · ")}` : ""}`);
}

// ── 3 · ONE TERRAIN GENERATOR ────────────────────────────────────────────────────────────────────────────────
// ⚑ AEVI'S WORDING, CORRECTED BY MEASUREMENT: she wrote "zero calls to a terrain generator outside `scripts/world/`
// and the gates", but `app.js` deliberately IMPORTS the one generator — its own note says "shared rather than
// duplicated — two copies of a deterministic generator is two chances to drift", which is this check's whole
// thesis. So the rule is: exactly one generator EXISTS, and everyone else imports it.
{
  const makers = CODE.filter(f => /function\s+makeTerrain\s*\(|makeTerrain\s*=\s*function|function\s+(gen|build)Terrain\s*\(/.test(read(f)));
  const invented = CODE.filter(f => f !== "scripts/world/terrain.mjs" && /function\s+(valueNoise|fbm|noise2|hash2)\s*\(/.test(read(f)) && /elev|height|land|terrain/i.test(read(f)));
  check("3 · ONE TERRAIN GENERATOR — one module makes the ground; every other reader imports it",
    makers.length === 1 && makers[0] === "scripts/world/terrain.mjs" && invented.length === 0,
    `generators: ${makers.join(", ") || "none"} · files inventing their own ground: ${invented.join(" · ") || "none"}`);
}

// ── 4 · ONE DISTANCE DOOR ────────────────────────────────────────────────────────────────────────────────────
// ⛔ SNG-424: the world's physical size lives in `content/packs/core/world/scale.json`, and `walkingDays`/`milesFor`
// are how anything asks. A file that types the number itself is a second scale, and the reason a region once read
// as 1,600 miles across.
{
  // ⚠️ EVERY NUMBER THE FILE DECLARES, read from the file rather than named from memory — the first cut asked for
  // `milesPerDay` and `daysPerDegree`, which scale.json does not call them, so it checked ONE key of five and
  // passed on the strength of it. A check that can pass because it looked for nothing is not a check.
  const scale = JSON.parse(read("content/packs/core/world/scale.json") || "{}");
  const numbers = Object.entries(scale).filter(([k, v]) => !k.startsWith("_") && Number.isFinite(v) && Math.abs(v) > 1).map(([, v]) => String(v));
  const typed = [];
  for (const f of CODE) {
    if (f === "engine/worldmap.js" || f.startsWith("tests/") || f.startsWith("scripts/world/")) continue;
    const src = read(f);
    for (const n of numbers) if (src.includes(n)) typed.push(`${f} types ${n}`);
  }
  check("4 · ONE DISTANCE DOOR — miles and walking days come from `scale.json` through `walkingDays`/`milesFor`",
    numbers.length >= 3 && typed.length === 0,
    `${numbers.length ? `checked ${numbers.length} scale numbers (${numbers.join(", ")})` : "⛔ scale.json declares no numbers — this check would pass on nothing"}${typed.length ? ` · ${typed.join(" · ")}` : ""}`);
}

// ── 5 · NO RADIAL LAYOUT IN A MAP ────────────────────────────────────────────────────────────────────────────
// ⛔ `interiorLayout` arranges children on a circle of radius 150; `autoMapPositions` scatters by
// `anchor + cos(angle) × distance`. Aevi: "force-directed node diagrams wearing map clothes — nothing is where it
// is because of where it IS." When P5's location tier lands, these must not creep back in behind it.
{
  const callers = [];
  for (const f of CODE) {
    if (f === "engine/worldmap.js" || f.startsWith("tests/")) continue;   // the definition, and the gates that test it
    const src = read(f).split("\n").filter(l => !/^\s*(\/\/|\*)/.test(l)).join("\n");
    for (const fn of ["interiorLayout", "autoMapPositions"]) {
      const n = (src.match(new RegExp(`\\b${fn}\\s*\\(`, "g")) || []).length;
      if (n) callers.push(`${f} calls ${fn} ×${n}`);
    }
  }
  check("5 · NO RADIAL LAYOUT IN A MAP — a place is drawn where it IS",
    callers.length === 0, callers.join(" · "));
}

// ── 6 · EVERY ROOT PAGE IS REACHABLE FROM THE RUNNING GAME ───────────────────────────────────────────────────
// ⚑ Mine, widened by Aevi: not "linked from something" — reachable from the game the player runs. `read.html`
// linked the third planet, and a page nobody can reach is a page nobody maintains.
{
  const reachable = new Set(["index.html"]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const page of [...reachable]) {
      const src = read(page) + (page === "index.html" ? read("app.js") : "");
      for (const m of src.matchAll(/["'(]([A-Za-z0-9_\-.]+\.html)/g)) {
        if (!reachable.has(m[1]) && ROOT_PAGES.includes(m[1])) { reachable.add(m[1]); grew = true; }
      }
    }
  }
  const orphans = ROOT_PAGES.filter(p => !reachable.has(p));
  check("6 · EVERY ROOT PAGE IS REACHABLE FROM THE RUNNING GAME, or it is deleted",
    orphans.length === 0, `unreachable: ${orphans.join(" · ") || "none"}`);
}

// ── 7 · ONE FIELD EVALUATOR ──────────────────────────────────────────────────────────────────────────────────
// ⛔ AEVI'S SEVENTH, AND THE SHARPEST: "the failure we are fixing is a second implementation of something that
// already existed — it would be absurd to fix it by creating a third." The field is EVALUATED per texel and never
// interpolated between markers; when `engine/field.js` is extracted from exesa it is the only place that may do it.
{
  // ⚠️ A POWER FIELD, NOT ANY FUNCTION WITH "FIELD" IN ITS NAME. The first cut counted `areaFieldAt`, which is the
  // contested-area ELLIPSE (SNG-409 §5: "a contested territory currently looks like a village") — a different
  // question about a different thing, and accusing it would have pushed someone to merge two unrelated ideas.
  const evaluators = [];
  for (const f of CODE) {
    if (f.startsWith("tests/")) continue;
    const src = read(f);
    // a per-texel evaluator walks a texture and sums source contributions
    if (/Uint8ClampedArray\s*\(/.test(src) && /exp\s*\(\s*-/.test(src)) evaluators.push(`${f} (per-texel accumulation)`);
  }
  check("7 · ONE FIELD EVALUATOR — the field is a surface, evaluated once, read by every tier",
    evaluators.length === 1, `evaluators: ${evaluators.join(" · ") || "none"}`);
}

console.log("\n── map convergence ──");
console.log(lines.join("\n"));
console.log(`\n  ${passed} ok · ${failed} FAILURE(S)`);
console.log(failed
  ? "  ⛔ not converged yet — this is the work, in the order set in po/REPLY_aevi_exesa_field_engine.md §4."
  : "  ⛑ converged: one projection, one ground, one field, one distance door, one map.");
process.exit(Math.min(failed, 120));
