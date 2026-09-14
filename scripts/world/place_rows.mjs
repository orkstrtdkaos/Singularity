// scripts/world/place_rows.mjs — SNG-582. THE WORLD IS FROZEN; ITS PLACE LIST IS NOT.
//
// ⛔ ERIK 2026-09-14: "i've already ruled that I don't intend to ever regenerate the world again… so the new
// normal are authored locations and mods to what we have."
//
// ⚠️ THAT RULING HAS A CONSEQUENCE THE RULING DOES NOT STATE, and it was already live when he made it:
// `terrain.json` was last built 2026-08-10 and carries 135 location rows, while canon has 138 placed
// locations. Firstsight, Keelmouth and The Mountain Pass exist in the fiction, carry real coordinates, and
// have **no row in the asset the world map reads** — so they have no pin and no metadata on the map. Under
// the old rule the next rebuild folded them in. Under this one there is no next rebuild.
//
// ⛑ SO THE PLACE LIST GETS ITS OWN DOOR. This splices location rows into the frozen file and touches
// NOTHING ELSE: not a layer byte, not a seed, not a biome, not the hydrology, not the seats. The ground is
// Erik's frozen ground; only the list of who stands on it moves.
//
// ⚠️ ONE DERIVATION, TWO CALLERS. The rows come from `locationRows` in generate_world.mjs — the same
// function the (now-retired) build used — because two copies of it would drift the day a field is added,
// and the map would then disagree with itself about places nobody touched.
//
// Run:   node scripts/world/place_rows.mjs           # splice missing/changed rows into terrain.json
//        node scripts/world/place_rows.mjs --check    # name what is missing, change nothing (gate)

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadCanon, locationRows, readTerrain, TERRAIN_PATH } from "./generate_world.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** What would change, without changing it: rows the asset lacks, and rows whose fields have moved.
 *  ⛔ SAME SHAPE COMPARED, not a deep-equal on objects built in different orders — the asset is minified
 *  JSON and key order is whatever the last writer used. */
export function planRows(canon, terrain) {
  const want = locationRows(canon, terrain?.locations || {});
  const have = terrain?.locations || {};
  const added = [], changed = [];
  const norm = (r) => JSON.stringify([r?.n ?? null, r?.r ?? null, r?.wg ?? 0, r?.t ?? null, r?.ro ?? null, r?.k ?? null]);
  for (const [id, row] of Object.entries(want)) {
    if (!have[id]) added.push(id);
    else if (norm(have[id]) !== norm(row)) changed.push(id);
  }
  // ⚠️ A ROW WITH NO CANON RECORD IS NOT SWEPT. Deleting is a different decision from adding, it is
  // destructive, and a place can be retired from the pack while the map still wants to remember it.
  // Named, never removed.
  const orphan = Object.keys(have).filter((id) => !want[id]).sort();
  return { want, added: added.sort(), changed: changed.sort(), orphan };
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("place_rows.mjs");
if (isMain) {
  const canon = loadCanon();
  const terrain = readTerrain();
  if (!terrain) { console.error("⛔ no terrain.json — there is nothing to patch, and under the frozen-world ruling nothing may rebuild it"); process.exit(1); }
  const plan = planRows(canon, terrain);

  const say = () => {
    if (plan.added.length) console.log(`  ⛔ ${plan.added.length} placed location(s) the frozen world does not know: ${plan.added.join(", ")}`);
    if (plan.changed.length) console.log(`  ⚠️ ${plan.changed.length} row(s) whose canon has moved: ${plan.changed.join(", ")}`);
    if (plan.orphan.length) console.log(`  ⬜ ${plan.orphan.length} row(s) with no canon record, kept: ${plan.orphan.slice(0, 6).join(", ")}${plan.orphan.length > 6 ? ", …" : ""}`);
  };

  if (process.argv.includes("--check")) {
    say();
    const clean = !plan.added.length && !plan.changed.length;
    console.log(clean
      ? `✅ place rows: all ${Object.keys(plan.want).length} placed locations have a current row in the frozen world`
      : "⛔ the frozen world's place list is behind canon — run: node scripts/world/place_rows.mjs");
    process.exit(clean ? 0 : 1);
  }

  say();
  // ⛑ ORPHANS FIRST, then the derived rows over them: every existing row survives unless canon replaces it.
  const next = { ...terrain, locations: { ...terrain.locations, ...plan.want } };
  writeFileSync(join(root, TERRAIN_PATH), JSON.stringify(next));
  console.log(`wrote ${TERRAIN_PATH} — ${plan.added.length} added, ${plan.changed.length} updated, ` +
    `${Object.keys(next.locations).length} rows · layers, seeds, biomes, hydrology and seats untouched`);
}
