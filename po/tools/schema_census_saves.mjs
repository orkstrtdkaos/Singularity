import fs from "node:fs"; import path from "node:path";
const G = await import("../../engine/genschema.js");
const S = (n) => JSON.parse(fs.readFileSync(`schemas/${n}.schema.json`, "utf8"));
const ch = S("character"), npc = S("npc");
const files = []; for (const p of fs.readdirSync("characters")) { const d = path.join("characters", p); if (fs.statSync(d).isDirectory()) for (const f of fs.readdirSync(d)) if (/^char-.*\.json$/.test(f)) files.push(path.join(d, f)); }
let chBad = 0; const chErr = {}; const regErr = {}; let regN = 0, regBad = 0; const shapes = { company: 0, pledges: 0, holdings: 0, bands: 0 }; const noRecord = [];
const charProps = new Set(Object.keys(ch.properties || {}));
const undeclared = {};
for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
  const v = G.validate(j, ch); if (!v.valid) { chBad++; for (const e of v.errors.slice(0, 4)) { const k = e.slice(0, 80); chErr[k] = (chErr[k] || 0) + 1; } }
  for (const k of Object.keys(j)) if (!charProps.has(k) && !k.startsWith("_")) undeclared[k] = (undeclared[k] || 0) + 1;
  for (const k of Object.keys(shapes)) if (j[k] && (Array.isArray(j[k]) ? j[k].length : Object.keys(j[k]).length)) shapes[k]++;
  for (const m of j.company || []) if (!j.npcRegistry?.[m.npcId]) noRecord.push(`${j.name}:${m.npcId}`);
  for (const p of Object.values(j.npcRegistry || {})) { regN++; const vv = G.validate(p, npc); if (!vv.valid) { regBad++; for (const e of vv.errors.slice(0, 2)) { const k = e.slice(0, 70); regErr[k] = (regErr[k] || 0) + 1; } } }
}
const top = (o, n = 6) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => `  ${c}× ${k}`).join("\n");
console.log(`saves ${files.length} · character.schema invalid ${chBad}`); console.log(top(chErr));
console.log(`save keys the schema does not declare (${Object.keys(undeclared).length}):`, Object.entries(undeclared).sort((a,b)=>b[1]-a[1]).map(([k,c])=>`${k}(${c})`).join(" ").slice(0, 900));
console.log(`registry people ${regN} · npc.schema invalid ${regBad}`); console.log(top(regErr));
console.log("saves using:", JSON.stringify(shapes), "· company members with no person record:", noRecord.join(", "));