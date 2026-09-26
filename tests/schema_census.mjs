// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA CENSUS — SNG-658 §3 · CCODE-513
//
// ✅ ERIK, 2026-09-25: "I don't like that we're still finding examples of types of things with schemas that are
// not complete. We need to check every single type of thing against the latest schema and fill in gaps, then
// make the checks standard and able to drive generative engine updates."
//
// ⛔ WHAT THIS IS. One gate over EVERY TYPE OF THING THE GAME STORES, in BOTH layers — the authored files and
// the runtime records the game actually plays. For each type it reports how many records exist, which schema
// governs them, how many fail it, and why. Types with no schema are named. Save keys no schema declares are
// counted.
//
// ⚠️ WHY IT IS A RATCHET AND NOT A CLIFF. Today 57 authored NPCs, 441 crafts, 8 items and 16 of 16 saves fail
// their own schema, and 12 types have no schema at all. A gate that went red on that would be switched off in a
// day. Every count below may only go DOWN; today's numbers are the baseline, so nothing reds today and
// everything we fix stays fixed.
//
// ⛑ AND THE HARD HALF, which is what makes it more than a report:
//   · a type that reaches ZERO invalid is LOCKED at zero;
//   · a type that appears here with no schema and no baseline entry FAILS OUTRIGHT — a new kind of thing
//     cannot be added without a contract;
//   · and every WRITER of a type must import its validator, because "a schema that validates and a writer that
//     never calls it" is the whole lesson of `craftIds: []` on 44 of 44 features.
//
// ⚠️ A `_draft` SCHEMA IS A THIRD STATE, AND THE DISTINCTION MATTERS. Aevi derived seven schemas FROM the
// corpus today, so by construction almost every record passes them. Locking those at zero would turn her next
// step — tightening the enums and writing each field's purpose — into a red build for doing the right thing.
// That is a gate reddening when the thing gets FIXED, which this project has shipped six times. So a draft's
// invalid count is REPORTED and ratcheted, and never locked, until `_draft` comes off.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(join(root, p), "utf8");
const G = await import("../engine/genschema.js");
const { loadContentHeadless } = await import("./headless_content.mjs");

let failures = 0, checks = 0;
function check(label, ok, why = "") {
  checks++;
  if (ok) { console.log(`ok    ${label}`); return; }
  failures++;
  console.log(`FAIL  ${label}${why ? `\n      ${why}` : ""}`);
}

const schemaOf = (name) => {
  const p = join(root, "schemas", `${name}.schema.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// The saves, read once. ⚠️ THE RUNTIME LAYER IS THE ONE THE GAME PLAYS, and several of today's failures are
// fields a LOADER adds that the schema never declared — which is still a gap, because the schema is supposed
// to describe what the game actually holds.
const saveFiles = (() => {
  const out = [];
  const dir = join(root, "characters");
  if (!existsSync(dir)) return out;
  for (const p of readdirSync(dir)) {
    const d = join(dir, p);
    if (!statSync(d).isDirectory()) continue;
    for (const f of readdirSync(d)) if (/^char-.*\.json$/.test(f)) out.push(join(d, f));
  }
  return out;
})();
const saves = saveFiles.map(f => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return null; } }).filter(Boolean);
const C = await loadContentHeadless();

const values = (x) => (Array.isArray(x) ? x : Object.values(x || {})).filter(v => v && typeof v === "object");

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ EVERY TYPE OF THING THE GAME STORES. A type missing from this list is a type nobody is counting, so the
// list itself is the census — adding a kind of record means adding a row here, and the gate refuses a row with
// no schema that has never been declared before.
const TYPES = [
  // ── authored content ──
  { key: "npc",            label: "authored NPCs",          schema: "npc",           layer: "content", of: () => C.npcs },
  { key: "location",       label: "locations",              schema: "location",      layer: "content", of: () => C.locations },
  { key: "ability",        label: "crafts",                 schema: "ability",       layer: "content", of: () => C.abilities },
  { key: "item",           label: "items",                  schema: "item",          layer: "content", of: () => C.items },
  { key: "creature",       label: "bestiary",               schema: "creature",      layer: "content", of: () => C.bestiary },
  { key: "power",          label: "powers",                 schema: "power",         layer: "content", of: () => C.powers },
  { key: "companion",      label: "companions",             schema: "companion",     layer: "content", of: () => C.companions },
  { key: "encounter",      label: "encounters",             schema: "encounter",     layer: "content", of: () => C.encounters },
  { key: "quest",          label: "quests",                 schema: "quest",         layer: "content", of: () => C.quests },
  { key: "legend",         label: "legends",                schema: "legend",        layer: "content", of: () => C.legends?.roster },
  { key: "hold_feature",   label: "hold feature kinds",     schema: "hold_feature",  layer: "content", of: () => C.rules?.economy?.holdFeatures?.kinds },
  { key: "region_prices",  label: "region price profiles",  schema: "region_prices", layer: "content", of: () => C.rules?.economy?.regions },

  // ── saves ──
  { key: "character",      label: "character saves",        schema: "character",     layer: "save", of: () => saves },
  // ⚠️ A REGISTRY PERSON IS NOT AN AUTHORED NPC, and validating one against the other is how 133 of 133 "fail":
  // `spectrum` and `schemaVersion` are authored-NPC fields a person you met in play never has. SNG-658 §2 splits
  // them; until `person.schema.json` exists this is a type WITHOUT a schema, and the npc misfit is its evidence.
  { key: "person",         label: "registry people",        schema: "person",        layer: "save",
    of: () => saves.flatMap(s => values(s.npcRegistry)) },
  { key: "company_member", label: "company members",        schema: "company_member", layer: "save",
    of: () => saves.flatMap(s => values(s.company)) },
  { key: "holding",        label: "holdings",               schema: "holding",       layer: "save",
    of: () => saves.flatMap(s => values(s.holdings)) },
  { key: "holding_feature", label: "holding features",      schema: "holding_feature", layer: "save",
    of: () => saves.flatMap(s => values(s.holdings).flatMap(h => values(h.features))) },
  { key: "improvement",    label: "improvements",           schema: "improvement",   layer: "save",
    of: () => saves.flatMap(s => values(s.holdings).flatMap(h => values(h.improvements))) },
  { key: "band",           label: "bands",                  schema: "band",          layer: "save",
    of: () => saves.flatMap(s => values(s.bands)) },
  { key: "pledge",         label: "pledges",                schema: "pledge",        layer: "save",
    of: () => saves.flatMap(s => values(s.pledges)) },
  { key: "caravan",        label: "caravans",               schema: "caravan",       layer: "save",
    of: () => saves.flatMap(s => values(s.caravans)) },
  { key: "job",            label: "jobs",                   schema: "job",           layer: "save",
    of: () => saves.flatMap(s => [...values(s.jobs?.board), ...values(s.jobs?.out)]) },
  { key: "death_state",    label: "death states",           schema: "death_state",   layer: "save",
    of: () => saves.flatMap(s => values(s.npcRegistry).map(p => p?.deathState).filter(Boolean)) },
  { key: "codex_topic",    label: "codex topics",           schema: "codex_topic",   layer: "save",
    of: () => saves.flatMap(s => values(s.codex)) },
];

console.log("── the census · every type of thing, both layers ──\n");
console.log("type                 layer    records  schema             invalid  top reasons");

const census = [];
for (const t of TYPES) {
  let recs = [];
  try { recs = values(t.of()); } catch { recs = []; }
  const sch = schemaOf(t.schema);
  const draft = !!(sch && sch._draft);
  let bad = 0; const errs = {};
  if (sch) {
    for (const r of recs) {
      const v = G.validate(r, sch);
      if (!v.valid) {
        bad++;
        for (const e of v.errors.slice(0, 3)) {
          const k = String(e).replace(/^[^:]*?(\w+):/, "$1:").slice(0, 62);
          errs[k] = (errs[k] || 0) + 1;
        }
      }
    }
  }
  const top = Object.entries(errs).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, n]) => `${n}× ${k}`).join(" | ");
  census.push({ ...t, records: recs.length, has: !!sch, draft, invalid: bad, top });
  console.log(`${t.key.padEnd(20)} ${t.layer.padEnd(8)} ${String(recs.length).padStart(7)}  ${(sch ? (draft ? `${t.schema} (draft)` : t.schema) : "— NONE —").padEnd(18)} ${String(sch ? bad : "—").padStart(7)}  ${top}`);
}

// ⛔ SAVE KEYS NO SCHEMA DECLARES — "the schema describes almost nothing a save holds" (Aevi, §1).
const charSchema = schemaOf("character");
const declared = new Set(Object.keys(charSchema?.properties || {}));
const undeclaredKeys = new Set();
for (const s of saves) for (const k of Object.keys(s)) if (!declared.has(k) && !k.startsWith("_")) undeclaredKeys.add(k);

// ⛔ COMPANY MEMBERS WITH NO PERSON RECORD — §4.3's first generator-wiring target, counted here so the fix is
// visible when it lands. A party member with no person behind them cannot be read for crafts in a fight.
const orphanMembers = [];
for (const s of saves) {
  for (const m of values(s.company)) {
    if (m.leftDay) continue;
    const id = String(m.npcId || "");
    if (!id) continue;
    if (!s.npcRegistry?.[id] && !C.npcs?.[id] && !C.companions?.[id]) orphanMembers.push(`${s.name}:${id}`);
  }
}

console.log(`\nsave keys no schema declares: ${undeclaredKeys.size}`);
console.log(`  ${[...undeclaredKeys].sort().join(" ")}`);
console.log(`company members with no person record: ${orphanMembers.length}${orphanMembers.length ? ` — ${orphanMembers.join(", ")}` : ""}`);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// THE RATCHET. ⚠️ Counts may only go DOWN; lower one by FIXING something, then re-baseline deliberately.
const baselinePath = join(root, "tests", "schema_baseline.json");
const prior = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
const base = prior.counts || {};

const now = {};
for (const c of census) now[`invalid:${c.key}`] = c.has ? c.invalid : null;
now.typesWithoutSchema = census.filter(c => !c.has).length;
now.typesUnratified = census.filter(c => c.has && c.draft).length;
now.undeclaredSaveKeys = undeclaredKeys.size;
now.orphanCompanyMembers = orphanMembers.length;

console.log("\n── the ratchet ──");

// ⛔ A NEW TYPE WITH NO SCHEMA FAILS OUTRIGHT (§3's hard half). A type the baseline has never seen, arriving
// without a contract, is exactly what Erik asked us to stop shipping.
for (const c of census) {
  if (c.has) continue;
  const known = Object.hasOwn(base, `invalid:${c.key}`);
  check(`a new type may not arrive without a schema — ${c.key}`, known,
    `${c.key} (${c.records} records) has no schemas/${c.schema}.schema.json and no baseline entry. Every type of thing the game stores needs one (SNG-658 §2).`);
}

for (const c of census) {
  const k = `invalid:${c.key}`;
  const b = base[k];
  if (!c.has) continue;
  if (b == null) continue;              // first sight of a newly-schema'd type; the rebaseline records it
  if (b === 0 && !c.draft) {
    // ⛑ LOCKED. A type that reached zero stays at zero — that is the whole point of getting there.
    check(`${k} is LOCKED at 0 — ${c.label}`, c.invalid === 0,
      `${c.invalid} of ${c.records} ${c.label} now fail ${c.schema}.schema. ${c.top}`);
  } else {
    check(`${k} = ${c.invalid} (baseline ${b})${c.draft ? " — draft, ratchet only" : ""} — may only go DOWN`,
      c.invalid <= b, `${c.invalid} of ${c.records} ${c.label} fail ${c.schema}.schema — was ${b}. ${c.top}`);
  }
}

for (const k of ["typesWithoutSchema", "typesUnratified", "undeclaredSaveKeys", "orphanCompanyMembers"]) {
  const b = base[k];
  if (b == null) continue;
  const why = k === "typesWithoutSchema"
    ? `types with no schema: ${census.filter(c => !c.has).map(c => c.key).join(", ")}`
    : k === "typesUnratified"
      ? `drafts awaiting ratification: ${census.filter(c => c.has && c.draft).map(c => c.key).join(", ")} (SNG-658 §4.2)`
      : k === "orphanCompanyMembers"
        ? `party members with no person record: ${orphanMembers.join(", ")} — a join must point at a person (SNG-658 §4.3)`
        : `save keys no schema declares: ${[...undeclaredKeys].sort().slice(0, 12).join(", ")}…`;
  check(`${k} = ${now[k]} (baseline ${b}) — may only go DOWN`, now[k] <= b, why);
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ AND THE HALF THAT PASSES ON PAPER: "a schema that validates and a writer that never calls it."
// Aevi, §4's last line — and it is the lesson of `craftIds: []` on 44 of 44 hold features: the schema was
// right, the writer never asked it. So every type whose records are CREATED by the generative pipeline must
// have its schema reachable there, and the pipeline's own list is derived from `genSchemas` rather than typed.
{
  const state = rd("engine/state.js");
  const app = rd("app.js");
  const wired = [...state.matchAll(/genSchemas\.(\w+)\s*=/g)].map(m => m[1]);
  check(`the generator's schema set is DERIVED, never a literal list (${wired.length} wired: ${wired.join(", ")})`,
    wired.length >= 4 && /GENERATABLE_TYPES = new Set\(Object\.keys\(CONTENT\.genSchemas/.test(app),
    "a hand-typed list of generatable types drifts from the schemas the moment one is added");
  check("…and `generate` is handed the schema for the type it is writing, never a bare {}",
    /generate\(type, ctx, \{ callJSON: callClaudeJSON, schema: CONTENT\.genSchemas\[type\]/.test(app),
    "a writer that validates against nothing is the craftIds defect with a different field name");
}

console.log(`\n${checks} checks · ${failures} FAILURE(S)`);
if (process.env.SCHEMA_CENSUS_REBASELINE === "1") {
  const out = { _note: "⛔ SNG-658 §3 — per-type schema failures. Counts may only go DOWN. A type at 0 is LOCKED at 0; a `_draft` schema is ratcheted but never locked, because Aevi derived it FROM the corpus and tightening it must not red the build. Re-baseline deliberately with SCHEMA_CENSUS_REBASELINE=1.", _updatedAt: new Date().toISOString().slice(0, 10), counts: now };
  const { writeFileSync } = await import("node:fs");
  writeFileSync(baselinePath, JSON.stringify(out, null, 1) + "\n");
  console.log(`re-baselined → tests/schema_baseline.json`);
}
process.exit(failures ? 1 : 0);
