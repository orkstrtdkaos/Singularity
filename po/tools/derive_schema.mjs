// Derive a DRAFT schema for a content type from its own corpus: a field present on every record is required;
// types are unioned; enums are proposed for low-cardinality strings. Output is a starting point for review.
import fs from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const typeOf = v => v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
function derive(records, title) {
  const arr = Object.values(records || {}).filter(x => x && typeof x === "object" && !Array.isArray(x));
  const fields = {};
  for (const r of arr) for (const [k, v] of Object.entries(r)) { if (k.startsWith("_")) continue; const f = (fields[k] ||= { n: 0, types: new Set(), vals: new Set() }); f.n++; f.types.add(typeOf(v)); if (typeof v === "string" && f.vals.size < 12) f.vals.add(v); }
  const props = {}, required = [];
  for (const [k, f] of Object.entries(fields)) {
    const t = [...f.types]; const p = { type: t.length === 1 ? t[0] : t };
    if (t.length === 1 && t[0] === "string" && f.vals.size > 1 && f.vals.size <= 8 && arr.length >= 8 && f.n >= arr.length * 0.8) p.enum = [...f.vals];
    p.description = `present on ${f.n} of ${arr.length}`;
    props[k] = p; if (f.n === arr.length) required.push(k);
  }
  return { $schema: "https://json-schema.org/draft/2020-12/schema", title, _draft: `SNG-658: DERIVED FROM THE CORPUS (${arr.length} records) on 2026-09-25 — required = present on every record. Aevi reviews and tightens; do not treat as ratified until _draft is removed.`, type: "object", required, properties: props, patternProperties: { "^_": {} }, additionalProperties: false };
}
const targets = { power: C.powers, hold_feature: C.rules?.economy?.holdFeatures?.kinds, region_prices: C.rules?.economy?.regions, companion: C.companions, encounter: C.encounters, quest: C.quests, legend: C.legends?.roster };
for (const [name, recs] of Object.entries(targets)) { const s = derive(recs, name); fs.writeFileSync(`schemas/${name}.schema.json`, JSON.stringify(s, null, 1) + "\n"); console.log(name, "records", Object.keys(recs||{}).length, "required", s.required.length, "fields", Object.keys(s.properties).length); }