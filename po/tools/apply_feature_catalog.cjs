// SNG-652 §9: apply the feature catalogue (po/staged_content/SNG-652_feature_catalog.json) to
// content/packs/core/rules/economy.json holdFeatures. Adds category/what/flavor to every kind and the
// `categories` label map beside `kinds`. Preserves the file's own indentation and line endings.
// Idempotent. Run from the repo root:  node po/tools/apply_feature_catalog.cjs
const fs = require("fs"), path = require("path");
const root = process.argv[2] || process.cwd();
const econPath = path.join(root, "content/packs/core/rules/economy.json");
const catPath = path.join(root, "po/staged_content/SNG-652_feature_catalog.json");
const text = fs.readFileSync(econPath, "utf8");
const indent = (text.split("\n")[1].match(/^\s+/) || [" "])[0];
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const econ = JSON.parse(text), cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
const hf = econ.holdFeatures, missing = []; let n = 0;
for (const [k, v] of Object.entries(cat.kinds)) {
  if (!hf.kinds[k]) { missing.push(k); continue; }
  if (/\d/.test(v.what)) throw new Error(`what for ${k} states a number; the engine says numbers (featureDoes)`);
  Object.assign(hf.kinds[k], { category: v.category, what: v.what, flavor: v.flavor }); n++;
}
const note = "SNG-652 §9 (Aevi 2026-09-25): category, what and flavor on every kind, and the category labels. ⛔ `what` is WORDS ONLY — every number a player sees about a feature is composed by `featureDoes` from the kind's own fields and `yieldsFor`, so the prose cannot drift from the rules. Applied by po/tools/apply_feature_catalog.cjs.";
const out = {};
for (const [k, v] of Object.entries(hf)) { if (k === "categories" || k === "_catalog_20260925") continue; out[k] = v; if (k === "kinds") { out.categories = cat.categories; out._catalog_20260925 = note; } }
econ.holdFeatures = out;
let s = JSON.stringify(econ, null, indent); if (eol === "\r\n") s = s.replace(/\n/g, "\r\n"); if (text.endsWith(eol)) s += eol;
fs.writeFileSync(econPath, s);
console.log("applied", n, "of", Object.keys(cat.kinds).length, "missing", missing,
  "live kinds without an entry", Object.keys(hf.kinds).filter(k => !k.startsWith("_") && !cat.kinds[k]));