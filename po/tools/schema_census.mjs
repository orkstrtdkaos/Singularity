import fs from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const G = await import("../../engine/genschema.js");
const C = await loadContentHeadless();
const S = (n) => JSON.parse(fs.readFileSync(`schemas/${n}.schema.json`, "utf8"));
const out = [];
const run = (label, schemaName, records) => {
  const arr = Object.values(records || {}).filter(x => x && typeof x === "object");
  if (!schemaName) { out.push([label, arr.length, "NO SCHEMA", "", ""]); return; }
  const sch = S(schemaName); let bad = 0; const errs = {};
  for (const x of arr) { const v = G.validate(x, sch); if (!v.valid) { bad++; for (const e of v.errors.slice(0, 3)) { const k = e.replace(/^[^:]*?(\w+):/, "$1:").slice(0, 70); errs[k] = (errs[k] || 0) + 1; } } }
  const top = Object.entries(errs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${n}× ${k}`).join(" | ");
  out.push([label, arr.length, schemaName, bad, top]);
};
console.log("CONTENT keys:", Object.keys(C).join(","));
run("npcs", "npc", C.npcs);
run("locations", "location", C.locations);
run("abilities", "ability", C.abilities || C.catalog);
run("items", "item", C.items);
run("bestiary", "creature", C.bestiary);
run("powers", null, C.powers);
run("companions", null, C.companions);
run("encounters", null, C.encounters);
run("quests", null, C.quests);
run("legends", null, C.legends?.roster);
run("holdFeatures.kinds", null, C.rules?.economy?.holdFeatures?.kinds);
run("economy.regions", null, C.rules?.economy?.regions);
for (const r of out) console.log(r.map(String).join("  ·  "));