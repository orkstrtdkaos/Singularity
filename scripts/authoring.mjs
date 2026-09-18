#!/usr/bin/env node
/** ⛔ SNG-626 — HOW TO WRITE ONE OF THESE, READ OFF THE CORPUS RATHER THAN REMEMBERED. Erik 2026-09-18: "make sure
 *  you document how to write and update objects — you made errors on writing skills, you shouldn't. Everything
 *  exists for you to be able to read and know how to author properly. Document it and follow it."
 *  ⚠️ HE IS RIGHT AND THE COUNT IS NINE: authoring four crafts I got `harmRung` as a number instead of its enum,
 *  `axes` as an array instead of an object, authored `rankProgression` which the engine STAMPS, missed that `tier`
 *  must equal `levelReq`, missed per-rank `functions`, put a rank verb the top level did not declare, used
 *  `reachesDepth` (the death ladder's ordinal) as a unit scope, put GLYPHS in player-facing fields after driving
 *  A1 to zero the day before, and quoted Erik by name inside a card a player reads.
 *  ⛑ A PROSE GUIDE WOULD GO STALE. This reads the schema, the enums, the gates and a live exemplar, so it cannot.
 *      node scripts/authoring.mjs ability
 *      node scripts/authoring.mjs npc drawn_bow     — any id as the exemplar
 */
import { readFileSync, readdirSync } from "fs";
const root = new URL("..", import.meta.url).pathname;
const rj = p => JSON.parse(readFileSync(root + p, "utf8"));
const [type = "", exemplarId = ""] = process.argv.slice(2);

const SCHEMA = { ability: "ability", npc: "npc", location: "location", arc: "arc", quest: "quest" };
if (!SCHEMA[type]) {
  console.log("usage: node scripts/authoring.mjs <ability|npc|location|arc|quest> [exemplarId]");
  process.exit(2);
}
const s = rj(`schemas/${SCHEMA[type]}.schema.json`);
const { loadContentHeadless } = await import(root + "tests/headless_content.mjs");
const C = await loadContentHeadless();
const BAG = { ability: C.abilities, npc: C.npcs, location: C.locations, quest: C.quests, arc: C.arcs }[type] || {};
const rows = Array.isArray(BAG) ? BAG : Object.values(BAG);
const ex = exemplarId ? rows.find(r => r?.id === exemplarId) : rows.find(r => r?.id);

console.log(`\n══ AUTHORING A ${type.toUpperCase()} — read off the corpus, not remembered\n`);
console.log(`REQUIRED        ${JSON.stringify(s.required || [])}`);
console.log(`CLOSED SCHEMA   additionalProperties: ${s.additionalProperties} ${s.additionalProperties === false ? "— an undeclared key is REFUSED; prefix a note with _" : ""}`);

const enums = Object.entries(s.properties || {}).filter(([, v]) => v.enum);
if (enums.length) {
  console.log(`\nCLOSED ENUMS — these are the only legal values:`);
  for (const [k, v] of enums) console.log(`  ${k.padEnd(16)} ${JSON.stringify(v.enum)}`);
}

const shaped = Object.entries(s.properties || {}).filter(([, v]) => v.type && v.type !== "string");
if (shaped.length) {
  console.log(`\nSHAPES THAT ARE NOT STRINGS — getting one of these wrong is the commonest error:`);
  for (const [k, v] of shaped) console.log(`  ${k.padEnd(20)} ${JSON.stringify(v.type)}`);
}

if (ex) {
  const declared = new Set(Object.keys(s.properties || {}));
  const stamped = Object.keys(ex).filter(k => !declared.has(k) && !k.startsWith("_"));
  if (stamped.length) console.log(`\n⛔ STAMPED BY THE ENGINE — PRESENT ON A LOADED RECORD AND NEVER AUTHORED:\n  ${stamped.join(", ")}`);
  console.log(`\nEXEMPLAR — ${ex.name || ex.id}. Match its shape, not its content:`);
  const trim = v => { const t = JSON.stringify(v); return t.length > 150 ? t.slice(0, 147) + "…" : t; };
  for (const [k, v] of Object.entries(ex)) if (!k.startsWith("_")) console.log(`  ${k.padEnd(20)} ${trim(v)}`);
}

// ⛔ VOCABULARIES THAT ARE CLOSED BY A GATE RATHER THAN BY THE SCHEMA — and these are the ones that bit me.
// `harmRung` is not a schema enum; content_ci refuses anything outside its four words, so a schema read alone
// says nothing about it. Read from the gate's own source so this cannot drift from what actually enforces it.
function gateVocab(label, file, rx) {
  try {
    const m = readFileSync(root + file, "utf8").match(rx);
    if (m) console.log(`  ${label.padEnd(16)} ${m[1].trim()}`);
  } catch {}
}
console.log(`\nCLOSED BY A GATE, NOT BY THE SCHEMA — a schema read alone will not tell you these:`);
gateVocab("harmRung", "tests/content_ci.mjs", /must be (lethal \| damaging \| incapacitating \| none)/);
try {
  const fam = rj("content/packs/core/rules/damage_families.json").families || {};
  const types = [...new Set(Object.values(fam).flatMap(v => v.types || []))].sort();
  console.log(`  damageType       ${types.join(" ")}`);
} catch {}
try {
  const cb = readFileSync(root + "engine/combatants.js", "utf8");
  const m = cb.match(/DEFAULT_TAG_FAMILIES\s*=\s*\{([\s\S]*?)\n\};/);
  if (m) {
    const tags = [...new Set([...m[1].matchAll(/"([a-z-]+)"/g)].map(x => x[1]))].sort();
    console.log(`  assistTags       ${tags.join(" ")}`);
  }
} catch {}
try {
  const voc = rj("schemas/npc.schema.json").properties?.vocation?.enum;
  if (voc) console.log(`  vocation         ${voc.join(" ")}`);
} catch {}

if (type === "ability") {
  console.log(`\n⛔ GATES THAT WILL CATCH YOU, AND WHAT EACH WANTS:`);
  console.log(`  A1              NO GLYPHS AND NO SHOUTED CLAUSES in description, notFor, plainly, grants, cannot.`);
  console.log(`                  The house notation belongs in _authoredWhy. The count is pinned at zero and may only fall.`);
  console.log(`  CCODE-224       tier MUST EQUAL levelReq. A ratchet; it may only go down.`);
  console.log(`  147c            if it claims combat, a RANK carries functions + harmRung — the ability-level ones do not count.`);
  console.log(`  §88             a rank may not declare a verb the top level does not. Ratchet.`);
  console.log(`  §182            the schema is closed both ways: an undeclared key is refused, and so is a key the engine only stamps.`);
  console.log(`  §216            do not author a craft a NEGATIVE FIXTURE has claimed as "unknown" — check tests/ first.`);
  console.log(`\n⛑ AND THE RULE UNDER ALL OF THEM: run \`node scripts/exists.mjs <name>\` FIRST, then open the nearest`);
  console.log(`  authored craft and match it field for field. Every answer is already in the corpus.`);
}
console.log("");
