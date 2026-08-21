// tests/changeset_check.mjs — CCODE-204 · SNG-505 Layer 2: a change set is CHECKED, not trusted.
//
// ⛔ THE PROBLEM THIS EXISTS FOR. Aevi's SNG-505 proposes that a content rework author a CHANGE SET naming
// every id it touches and every referrer that must move with it. That is the right shape. But as proposed,
// the referrer list is REMEMBERED — and a remembered list has exactly the reach of whoever wrote it. The
// sense cull's 88 referrers were not in anyone's head; they turned up in a failure log three days later.
//
// So: she declares the referrers, and this DERIVES them from the tree and diffs the two. A change set that
// missed a file fails HERE, naming the file, before a single ability is edited.
//
// ⚠️ IT READS. IT NEVER WRITES. Not to content, not to saves, not to the change set itself.
//
// Run:  node tests/changeset_check.mjs [path/to/changeset.json]
//       with no argument it checks every change set in po/staged_content/changesets/
//
// A CHANGE SET, minimally:
//   { "id": "SNG-506_sense_restore",
//     "removed":  { "attunement": "CUT" | "replacement_id" },
//     "renamed":  { "old_id": "new_id" },
//     "added":    [ { "id": "prism_sight", ... } ],          // full schema, or at least an id
//     "referrers": [ "rules/native_grants.json", ... ],       // ⛔ what THIS checks
//     "expectedGates": [ { "name": "…substring of a gate name…", "to": "green" | "red" } ] }

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CORE = join(root, "content", "packs", "core");

let failures = 0, checks = 0;
const check = (name, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok && detail) console.log(`        ↳ ${detail}`);
};

// ---------- the tree, as it stands BEFORE the change set is applied ----------

/** Every JSON file under content/, relative to the pack root, with its raw text. */
function contentFiles() {
  const out = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".json")) out.push({ rel: relative(CORE, p).split(sep).join("/"), text: readFileSync(p, "utf8") });
    }
  };
  walk(CORE);
  return out;
}

/** Where an id is NAMED as a quoted string. The change set must move every one of these. */
function referrersOf(ids, files) {
  const hits = new Map();
  for (const { rel, text } of files) {
    for (const id of ids) {
      if (text.includes(`"${id}"`)) hits.set(rel, [...(hits.get(rel) || []), id]);
    }
  }
  return hits;
}

/** ⛔ The namespace intersection — SYSTEM_SPEC §43.2. An ability id that is ALSO a place id cannot be
 *  swept blindly, because `region` / `regionId` / `homeRegion` / `startingRegion` name the place. */
function placeIds() {
  const out = new Set();
  const add = (o) => { for (const k of Object.keys(o || {})) out.add(k); };
  try { add(JSON.parse(readFileSync(join(CORE, "rules/regions.json"), "utf8")).regions); } catch { /* absent */ }
  for (const { text } of contentFiles()) {
    for (const m of text.matchAll(/"(?:region|regionId|homeRegion|startingRegion)"\s*:\s*"([a-z][a-z0-9_]*)"/g)) out.add(m[1]);
  }
  return out;
}

/** The save side, which SNG-505's referrer list omitted entirely. Seven shapes, 325 entries today. */
function saveImpact(ids) {
  const charsDir = join(root, "characters");
  if (!existsSync(charsDir)) return null;
  const shapes = { "abilities[].abilityId": 0, "practice.uses{}": 0, "practice.coActivations{} (PAIRED)": 0,
                   "aspirations": 0, "customAbilities{} (braids EMBED ids)": 0, "discoveries[].recipeId": 0,
                   "precursorAccess[]": 0, "wildCurrentAccess[]": 0, "forkChoices{}": 0 };
  let saves = 0;
  const has = (s) => ids.some(id => typeof s === "string" && (s === id || s.includes(id)));
  for (const d of readdirSync(charsDir)) {
    const dir = join(charsDir, d);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir).filter(x => x.endsWith(".json"))) {
      let c; try { c = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch { continue; }
      saves++;
      shapes["abilities[].abilityId"] += (c.abilities || []).filter(a => ids.includes(a?.abilityId || a)).length;
      shapes["practice.uses{}"] += Object.keys(c.practice?.uses || {}).filter(k => ids.includes(k)).length;
      shapes["practice.coActivations{} (PAIRED)"] += Object.keys(c.practice?.coActivations || {}).filter(has).length;
      shapes["aspirations"] += (c.practice?.aspirations || c.aspirations || []).filter(a => ids.includes(a?.abilityId || a)).length;
      shapes["customAbilities{} (braids EMBED ids)"] += Object.keys(c.customAbilities || {}).filter(has).length;
      shapes["discoveries[].recipeId"] += (c.discoveries || []).filter(x => ids.includes(x?.recipeId)).length;
      shapes["precursorAccess[]"] += (c.precursorAccess || []).filter(x => ids.includes(x)).length;
      shapes["wildCurrentAccess[]"] += (c.wildCurrentAccess || []).filter(x => ids.includes(x)).length;
      shapes["forkChoices{}"] += Object.keys(c.forkChoices || {}).filter(k => ids.includes(k)).length;
    }
  }
  return { saves, shapes, total: Object.values(shapes).reduce((a, b) => a + b, 0) };
}

// ---------- the check ----------

export function checkChangeSet(cs, label = cs.id || "(unnamed)") {
  console.log(`\n── CHANGE SET: ${label} ─────────────────────────────────────`);
  const files = contentFiles();

  const removed = Object.keys(cs.removed || {});
  const renamedFrom = Object.keys(cs.renamed || {});
  const leaving = [...new Set([...removed, ...renamedFrom])];
  const arriving = [...new Set([...(cs.added || []).map(a => a?.id || a), ...Object.values(cs.renamed || {})])].filter(Boolean);

  check(`${label}: the change set declares what it touches`,
    leaving.length > 0 || arriving.length > 0, "nothing in removed / renamed / added");

  // 1 · ⛔ THE CENTRAL CHECK. Every file that names a departing id must be declared as a referrer.
  const derived = referrersOf(leaving, files);
  const declared = new Set(cs.referrers || []);
  const missed = [...derived.keys()].filter(rel => !declared.has(rel));
  check(`${label}: every file naming a departing id is declared as a referrer (${derived.size} derived)`,
    missed.length === 0,
    missed.map(f => `${f} [${[...new Set(derived.get(f))].slice(0, 4).join(", ")}]`).join(" · "));

  // ⚠️ and the other direction — a declared referrer that names nothing is stale, not dangerous.
  const idle = [...declared].filter(rel => !derived.has(rel));
  if (idle.length) console.log(`      note: ${idle.length} declared referrer(s) name no departing id: ${idle.join(", ")}`);

  // 2 · ⚠️ REFERENCES THAT HEAL. Files already naming an ARRIVING id are dangling today and become valid
  // when this lands. She would not think to declare these; they are the change set's free win, and they
  // are also the proof it is aimed at real debt.
  const healing = referrersOf(arriving, files);
  if (healing.size) {
    console.log(`      heals ${healing.size} file(s) that already name an arriving id:`);
    for (const [rel, ids] of healing) console.log(`        ${rel} [${[...new Set(ids)].slice(0, 5).join(", ")}]`);
  }

  // 3 · ⛔ THE NAMESPACE INTERSECTION — SYSTEM_SPEC §43.2.
  const places = placeIds();
  const collisions = leaving.concat(arriving).filter(id => places.has(id));
  check(`${label}: no id in this change set is ALSO a place id`,
    collisions.length === 0,
    `${collisions.join(", ")} — a blind sweep would rewrite region/regionId/homeRegion/startingRegion too (§43.2)`);

  // 4 · ⛔ THE SAVE SIDE. Never a failure — a declaration. Deleting a player's earned craft to make a gate
  // green is the one outcome this whole method exists to prevent (reconcile.js CONTENT_STEPS.location v2:
  // dangling references are FLAGGED, never removed).
  const impact = saveImpact(leaving);
  if (impact) {
    const hit = Object.entries(impact.shapes).filter(([, n]) => n > 0);
    console.log(`      SAVES: ${impact.total} entr(ies) across ${impact.saves} save(s) carry a departing id`);
    for (const [shape, n] of hit) console.log(`        ${String(n).padStart(4)}  ${shape}`);
    check(`${label}: a change set touching live saves declares its migration`,
      impact.total === 0 || !!cs.migration,
      `${impact.total} save entries affected and no "migration" declared — register a CHARACTER_STEPS entry in engine/reconcile.js`);
  }

  // 5 · expectedGates must name gates that actually exist, or the prediction cannot be scored.
  if (cs.expectedGates?.length) {
    const suite = readFileSync(join(root, "tests/smoke.mjs"), "utf8");
    const unknown = cs.expectedGates.filter(g => !suite.includes(g.name));
    check(`${label}: every expectedGate names a gate present in the suite (${cs.expectedGates.length} predicted)`,
      unknown.length === 0, unknown.map(g => g.name).join(" · "));
  }
  return failures;
}

// ---------- entry ----------

const arg = process.argv[2];
const dir = join(root, "po", "staged_content", "changesets");
const targets = arg ? [arg]
  : existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".json")).map(f => join(dir, f)) : [];

if (!targets.length) {
  console.log("no change sets found — nothing to check.");
  console.log(`(author one at ${relative(root, dir).split(sep).join("/")}/<id>.json — see the header of this file for the shape)`);
  process.exit(0);
}
for (const t of targets) {
  let cs; try { cs = JSON.parse(readFileSync(t, "utf8")); }
  catch (e) { check(`${t}: parses as JSON`, false, e.message); continue; }
  checkChangeSet(cs, cs.id || relative(root, t));
}
console.log(`\n${failures ? `${failures} FAILURE(S)` : "change set(s) OK"} — ${checks} check(s)`);
process.exit(failures ? 1 : 0);
