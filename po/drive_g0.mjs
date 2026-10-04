// G0 — Aevi: "Before you fix G0, write the test that shows it red." This reproduces it headless first.
import { generate } from "../engine/generate.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { readFileSync } from "node:fs";
const C = await loadContentHeadless();
const contract = JSON.parse(readFileSync("content/packs/core/rules/consumer_required_subfields.json", "utf8"));
const schema = JSON.parse(readFileSync("schemas/location.schema.json", "utf8"));
const atlas = JSON.parse(readFileSync("content/packs/valley/lore/world_node_atlas.json", "utf8"));

// a FULLY FILLED response — nothing degraded, nothing truncated
const filled = {
  id: "gen-test-hollow", name: "Test Hollow",
  descriptionSeed: "A hollow below the ridge where the road bends and nobody hurries.",
  appearance: "Low stone, a wet path, lamps that are lit before dusk.",
  tags: ["settlement", "quiet"],
  connections: ["millbrook"],
  spectrum: { dark_light: -0.2, chaos_order: 0.1 },
  encounterFlavor: "Carters resting out of the wind.",
  questSeeds: ["Someone is counting the carts."],
};
let rejected = null;
const out = await generate("location", {
  character: {}, hint: "a hollow below the ridge",
  known: { authored: C.locations }, contract, axisOrder: atlas.axisOrder,
}, {
  schema, callJSON: async () => filled,
  onContractReject: (type, entity, born) => { rejected = born; globalThis.__whole = entity; },
});

console.log("generate('location') with a FULLY FILLED response ->", out === null ? "NULL" : `a record (${out.id})`);
if (rejected) {
  const crash = (rejected.missing || []).filter(m => m.severity === "CRASH" || m.sev === "CRASH");
  console.log("  verdict:", rejected.verdict, "| worst:", rejected.worst);
  console.log("  rejects:", (rejected.missing || []).map(m => `${m.field}:${m.severity || m.sev}`).join(", "));
}
if (globalThis.__whole) {
  const w = globalThis.__whole;
  console.log("  what the finisher produced:", JSON.stringify({ id: w.id, parentId: w.parentId, regionId: w.regionId, tier: w.tier, connections: w.connections, worldPos: w.worldPos, axisVector: Array.isArray(w.axisVector) ? w.axisVector.length + " values" : null, descriptionSeed: typeof w.descriptionSeed === "string" ? w.descriptionSeed.slice(0, 30) : w.descriptionSeed }));
}
console.log(out === null ? "\n⛔ REPRODUCED: every generateRequest for a location comes back empty." : "\n✅ a location was minted.");
