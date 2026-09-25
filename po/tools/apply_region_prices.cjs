// SNG-654 §2–§3: apply regional prices (po/staged_content/SNG-654_region_prices.json) to
// content/packs/core/rules/economy.json `regions`. Renames region ids, replaces a profile by its old id,
// and adds profiles (replacing any that already carry the same regionId). Keeps the file's own
// indentation and line endings. Idempotent. Run from the repo root: node po/tools/apply_region_prices.cjs
const fs = require("fs"), path = require("path");
const root = process.argv[2] || process.cwd();
const econPath = path.join(root, "content/packs/core/rules/economy.json");
const src = JSON.parse(fs.readFileSync(path.join(root, "po/staged_content/SNG-654_region_prices.json"), "utf8"));
const text = fs.readFileSync(econPath, "utf8");
const indent = (text.split("\n")[1].match(/^\s+/) || [" "])[0];
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const econ = JSON.parse(text);
const rows = econ.regions; const log = [];
for (const [from, to] of Object.entries(src.renames || {})) { const r = rows.find(x => x.regionId === from); if (r) { r.regionId = to; log.push(`renamed ${from} -> ${to}`); } }
for (const [oldId, prof] of Object.entries(src.replace || {})) {
  const i = rows.findIndex(x => x.regionId === oldId || x.regionId === prof.regionId);
  if (i >= 0) { rows[i] = prof; log.push(`replaced ${oldId} -> ${prof.regionId}`); } else { rows.push(prof); log.push(`added ${prof.regionId} (replacement had nothing to replace)`); }
}
for (const prof of src.add || []) {
  const i = rows.findIndex(x => x.regionId === prof.regionId);
  if (i >= 0) rows[i] = prof; else rows.push(prof);
}
log.push(`added or refreshed ${(src.add || []).length}`);
let s = JSON.stringify(econ, null, indent); if (eol === "\r\n") s = s.replace(/\n/g, "\r\n"); if (text.endsWith(eol)) s += eol;
fs.writeFileSync(econPath, s);
console.log(log.join("; "), "| profiles now", rows.length);