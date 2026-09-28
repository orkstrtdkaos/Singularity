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
 *  ⛔ SAME SHAPE COMPARED, not a deep-equal on objects built in different orders — key order in the asset is
 *  whatever the last writer used. */
export function planRows(canon, terrain) {
  const want = locationRows(canon, terrain?.locations || {});
  const have = terrain?.locations || {};
  const added = [], changed = [], keptFields = [];
  const norm = (r) => JSON.stringify([r?.n ?? null, r?.r ?? null, r?.wg ?? 0, r?.t ?? null, r?.ro ?? null, r?.k ?? null]);
  // ⛔ A FIELD CANON CANNOT SUPPLY IS KEPT, exactly as a ROW canon no longer knows is kept. Measured when the
  // SNG-663 yards went in: `canon.kinds` holds 138 rows against canon's 158 locations, so a plain splice would have
  // replaced the Kindly Rest's "hall", the Null Stone's "monument", the Painter's Shelf's "hermitage" and two
  // "underplace" rows with null — five kinds deleted out of the frozen asset by the one command that promises to
  // touch nothing but the list. ⚠️ Where canon DIFFERS the row still moves: canon is the authority for what a place
  // is called, and freezing a stale name would be the opposite error.
  for (const [id, row] of Object.entries(want)) {
    for (const k of ["n", "r", "wg", "t", "ro", "k"]) {
      if ((row[k] === null || row[k] === undefined) && have[id] && have[id][k] !== null && have[id][k] !== undefined) {
        row[k] = have[id][k];
        keptFields.push(`${id}.${k}`);
      }
    }
  }
  for (const [id, row] of Object.entries(want)) {
    if (!have[id]) added.push(id);
    else if (norm(have[id]) !== norm(row)) changed.push(id);
  }
  // ⚠️ A ROW WITH NO CANON RECORD IS NOT SWEPT. Deleting is a different decision from adding, it is
  // destructive, and a place can be retired from the pack while the map still wants to remember it.
  // Named, never removed.
  const orphan = Object.keys(have).filter((id) => !want[id]).sort();
  return { want, added: added.sort(), changed: changed.sort(), orphan, keptFields: keptFields.sort() };
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
    if (plan.keptFields.length) console.log(`  ⬜ ${plan.keptFields.length} field(s) canon cannot supply, kept from the asset: ${plan.keptFields.slice(0, 8).join(", ")}${plan.keptFields.length > 8 ? ", …" : ""}`);
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
  // ⛑ WRITTEN AT THE INDENT THE ASSET ALREADY HAS, so the diff is the rows that moved and nothing else. A
  // `JSON.stringify(next)` here re-flowed 12,284 pretty-printed lines into one, over Erik's frozen ground — which
  // is why `noteCcode471` records five values "carried across by hand" instead of run through this door.
  const indent = /^\{\n (\S)/.test(readFileSync(join(root, TERRAIN_PATH), "utf8").slice(0, 40).replace(/\r/g, "")) ? 1 : 0;
  writeFileSync(join(root, TERRAIN_PATH), indent ? JSON.stringify(next, null, indent) : JSON.stringify(next));
  console.log(`wrote ${TERRAIN_PATH} — ${plan.added.length} added, ${plan.changed.length} updated, ` +
    `${Object.keys(next.locations).length} rows · layers, seeds, biomes, hydrology and seats untouched`);
}
