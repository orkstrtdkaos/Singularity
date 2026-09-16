// scripts/seed_travelers.mjs — SNG-595: seed `world/travelers.json` from the saves already in the repo.
//
// ⛔ WHY. A client publishes its OWN card on its next world-tick — so until every player has played once after the ship,
// the index would know only whoever ticked first, and "Do you know Silas Weir?" would still find nobody. This writes
// the card every existing save WOULD publish, through the same `travelerCard` the tick uses (one producer, not two).
//
// ⚠️ IDEMPOTENT AND NEVER BACKWARDS: a card already in the file is replaced only by a save that is NEWER than it, so
// re-running this after clients have started publishing cannot roll anyone's level back.
//
//   node scripts/seed_travelers.mjs          write the file
//   node scripts/seed_travelers.mjs --check  print what would change, write nothing

import { readdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { travelerCard, mergeTravelerCard } from "../engine/travelers.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "world/travelers.json");
const check = process.argv.includes("--check");

let store = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { schemaVersion: 1, travelers: {} };
const changes = [];
for (const playerKey of readdirSync(join(root, "characters"))) {
  const dir = join(root, "characters", playerKey);
  let files = [];
  try { files = readdirSync(dir).filter(f => f.endsWith(".json")); } catch { continue; }
  for (const f of files) {
    let save;
    try { save = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch { continue; }
    const stamped = Number(save.updatedAt) || 0;
    const card = travelerCard(save, { playerKey, now: stamped || Date.now() });
    if (!card) continue;
    // ⛔ A SAVE WITH NO `updatedAt` IS THE OLDEST THING HERE, NOT THE NEWEST. My first run stamped it "now", and the
    // stale copy of Adelheid left under Erik's key — level 1, no chronicle, never played — outranked Courtney's real
    // save from last night. An undated copy may fill a gap; it may never speak over a dated one.
    if (!stamped) card.updatedAt = new Date(0).toISOString();
    const prev = store.travelers?.[card.id];
    // ⚠️ the same character can sit under two player keys (a retired profile's copy) — the NEWER save speaks for it
    if (prev && +new Date(prev.updatedAt) >= +new Date(card.updatedAt)) continue;
    changes.push(`${prev ? "update" : "add"} ${card.id} ${card.name} (level ${card.level}, ${playerKey})`);
    store = mergeTravelerCard(store, card);
  }
}
store.travelers = Object.fromEntries(Object.entries(store.travelers).sort(([a], [b]) => a.localeCompare(b)));
console.log(changes.length ? changes.join("\n") : "no changes");
if (!check && changes.length) {
  writeFileSync(OUT + ".tmp", JSON.stringify(store, null, 2) + "\n", "utf8");
  renameSync(OUT + ".tmp", OUT);
  console.log(`wrote ${Object.keys(store.travelers).length} traveler card(s) to world/travelers.json`);
}
