// repair_minted_transit.mjs — CCODE-10 data repair.
//
// Before CCODE-10, a GM-narrated waygate transit fell through to mintTransitLocation, so the WORDS
// of the transit became places: a location literally named "Waygate", another named "Center". The
// player then stands in a room that was never authored and has no connections.
//
// This finds transit-minted locations whose names are generic transit/hub words, re-points the
// character at the real hub if they are stranded in one, and removes the junk records. It touches
// ONLY `_mintedAs: "transit"` records matching that vocabulary — a legitimately minted place (a
// named pass, a real side-road the fiction invented) is left exactly alone.
//
// Usage:
//   node scripts/repair_minted_transit.mjs <character.json>            # dry run
//   node scripts/repair_minted_transit.mjs <character.json> --write

import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--"));
const write = args.includes("--write");
if (!file) { console.error("usage: node scripts/repair_minted_transit.mjs <character.json> [--write]"); process.exit(2); }

// The vocabulary of a transit, not of a destination. Deliberately narrow.
const JUNK = /^(the\s+)?(way ?gate|gate|centre|center|crossing point|portal|threshold|transit|the way)$/i;
const HUB_ID = "the_crossing";

const c = JSON.parse(readFileSync(file, "utf8"));
const gen = c.generated?.location || {};
const junk = Object.entries(gen).filter(([, r]) => r?._mintedAs === "transit" && JUNK.test(String(r.name || "").trim()));

if (!junk.length) { console.log("nothing to repair — no generic transit-minted places found."); process.exit(0); }

console.log(`found ${junk.length} transit-minted place(s) whose name is a transit word, not a destination:\n`);
for (const [id, r] of junk) console.log(`  ${id.padEnd(18)} "${r.name}"  region=${r.regionId || "-"}`);

const strandedIn = junk.find(([id]) => id === c.currentLocationId);
if (strandedIn) {
  console.log(`\n  → the character is STANDING IN "${strandedIn[1].name}" — re-anchoring to ${HUB_ID} (the hub they should have arrived at)`);
  c.currentLocationId = HUB_ID;
}

for (const [id] of junk) {
  delete gen[id];
  if (Array.isArray(c.knownPlaces)) c.knownPlaces = c.knownPlaces.filter(k => k !== id);
  if (c.placeMemory) delete c.placeMemory[id];
}
if (!Array.isArray(c.knownPlaces)) c.knownPlaces = [];
if (!c.knownPlaces.includes(HUB_ID)) c.knownPlaces.push(HUB_ID); // they did reach the hub, in fiction

console.log(`\n${write ? "WRITING" : "DRY RUN"}: ${junk.length} junk place(s) removed${strandedIn ? `, character re-anchored to ${HUB_ID}` : ""}.`);
if (write) { writeFileSync(file, JSON.stringify(c, null, 2) + "\n"); console.log(`wrote ${file}`); }
else console.log("re-run with --write to apply.");
