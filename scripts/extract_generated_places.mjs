// scripts/extract_generated_places.mjs — SNG-396 §3.1: the site tier that PLAY authored, collected
// from the saves and staged for Aevi's review. ⛔ NEVER auto-promoted — several are duplicates or
// scene-dressing, and one (gen-object-object) is a bug artifact, not a place.
//
// "The fiction brought you here before the map knew its name." Every generated place a character
// has stood in, with the only record of what it IS: the descriptionSeed it was born with and the
// placeMemory notes play left behind. Same handoff shape as the hierarchy staging: I collect,
// Aevi reviews, ratification applies.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function extractGeneratedPlaces() {
  const byId = {};
  const charDir = join(root, "characters");
  if (!existsSync(charDir)) return { places: [] };
  for (const player of readdirSync(charDir).filter((d) => d.startsWith("player-"))) {
    for (const f of readdirSync(join(charDir, player)).filter((x) => x.endsWith(".json"))) {
      let c; try { c = JSON.parse(readFileSync(join(charDir, player, f), "utf8")); } catch { continue; }
      const gen = c.generated?.location || {};
      const mem = c.placeMemory || {};
      // a place exists for this census if the save GENERATED it or remembers standing in it
      const ids = new Set([...Object.keys(gen), ...Object.keys(mem).filter((k) => gen[k] || k.startsWith("gen-"))]);
      for (const id of ids) {
        const rec = gen[id] || null;
        const m = mem[id] || null;
        const row = byId[id] || (byId[id] = {
          id, name: null, descriptionSeed: null, regionId: null, communityId: null,
          parentId: null, placeEdges: [], tags: [],
          visits: 0, notes: [], seenBy: [],
          // ⚠️ the known SNG-329 residue is LABELLED, not silently dropped — Aevi asked for review, not filtration
          artifact: id === "gen-object-object" ? "id minted from a stringified object — pre-SNG-329 residue (engine/state.js:27); real memories, defective identity" : null,
        });
        if (rec) {
          row.name = row.name || rec.name || null;
          row.descriptionSeed = row.descriptionSeed || rec.descriptionSeed || null;
          row.regionId = row.regionId || rec.regionId || null;
          row.communityId = row.communityId || rec.communityId || null;
          row.parentId = row.parentId || rec.parentId || null;
          for (const e of rec.connections || []) if (!row.placeEdges.includes(e)) row.placeEdges.push(e);
          for (const t2 of rec.tags || []) if (!row.tags.includes(t2)) row.tags.push(t2);
        }
        if (m) {
          row.visits += Number(m.visits) || 0;
          for (const n of m.notes || []) if (!row.notes.includes(n)) row.notes.push(n);
        }
        const who = `${player}/${f.replace(/\.json$/, "")}`;
        if (!row.seenBy.includes(who)) row.seenBy.push(who);
      }
    }
  }
  const places = Object.values(byId).sort((a, b) => b.visits - a.visits || String(a.id).localeCompare(String(b.id)));
  return {
    generatedBy: "scripts/extract_generated_places.mjs — SNG-396 §3.1",
    note: "Play authored these one room at a time and content never learned. Review, then promote the real ones placed properly (§4): parent from the FICTION, worldPos from the parent, tier: site. The Made Gate is a WORLD EVENT and goes to canon separately.",
    counts: { places: places.length, withMemory: places.filter((p) => p.visits > 0).length, artifacts: places.filter((p) => p.artifact).length },
    places,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const out = extractGeneratedPlaces();
  const path = join(root, "po/staged_content/generated_places.json");
  writeFileSync(path, JSON.stringify(out, null, 1) + String.fromCharCode(10));
  console.log(`staged ${out.counts.places} generated places (${out.counts.withMemory} with memory, ${out.counts.artifacts} artifact) → po/staged_content/generated_places.json`);
  for (const p of out.places.slice(0, 20)) console.log(`  ${String(p.visits).padStart(3)}× ${p.id}${p.artifact ? "  ⚠️ artifact" : ""}${p.name ? " — " + p.name : ""}`);
}
