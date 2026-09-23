import { loadContentHeadless } from "./tests/headless_content.mjs";
import { resolveSubstrateField } from "./engine/substrate.js";
import { writeFileSync } from "node:fs";
const C = await loadContentHeadless();
const out = {};
for (const [id, l] of Object.entries(C.locations || {})) {
  out[id] = { d: l.substrateDensity ?? null, n: l.naniteDensity ?? null, f: l.fieldValue ?? null,
              keys: Object.keys(l).filter(k => /substrate|nanite|field/i.test(k)).sort().join(",") };
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 0));
const k = out["the_axis_gate"];
console.log("axis gate field keys:", k.keys);
console.log("sample:", JSON.stringify(out["the_axis_gate"]), JSON.stringify(out["the_null_stone"]));
const vals = Object.values(out).map(o => o.d).filter(v => typeof v === "number");
console.log(`resolved density on ${vals.length}/143 locations · min ${Math.min(...vals).toFixed(3)} max ${Math.max(...vals).toFixed(3)}`);
