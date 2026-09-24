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

/** ⛔ EVERY JSON FILE IN EVERY PACK, relative to `content/packs/` so the pack is part of the path
 *  (`core/abilities/x.json`, `valley/npcs/y.json`).
 *  ⚠️ IT WALKED ONLY `core`, AND THAT WAS NOT A SCOPE LIMIT — IT WAS UNDER-COVERAGE IN THE TOOL'S PRIMARY
 *  JOB. 319 of the 445 content files live in `valley`: 72% of the corpus, never opened. `referrersOf`
 *  exists to answer "does anything still name this id", and it was answering it over a quarter of the
 *  world — so a change set removing a craft the valley pack referred to would have passed clean and
 *  applied to a dangling reference. Found via Aevi's SPEC_SNG-634 §10a, which reported the symptom (her
 *  valley paths reading as unregistered) rather than this. */
function contentFiles() {
  const out = [];
  const packRoot = join(root, "content", "packs");
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".json")) out.push({ rel: relative(packRoot, p).split(sep).join("/"), text: readFileSync(p, "utf8") });
    }
  };
  if (existsSync(packRoot)) walk(packRoot);
  return out;
}

/** ⛔ WHAT KIND OF THING A CONTENT PATH HOLDS — Aevi's ask, and the tool's own blind spot: `modified` was
 *  assumed to be abilities, so `re_toll_bandits` (an encounter) read as a craft that does not exist.
 *  ⚠️ Derived from the PATH rather than authored twice, so a new directory needs no second declaration. */
function kindOfPath(rel) {
  if (/(^|\/)abilities\//.test(rel)) return "craft";
  if (/(^|\/)encounters\//.test(rel) || /random_encounters\.json$/.test(rel)) return "encounter";
  if (/(^|\/)npcs\//.test(rel)) return "npc";
  if (/(^|\/)powers\.json$/.test(rel)) return "power";
  if (/(^|\/)locations\//.test(rel)) return "location";
  if (/(^|\/)items?\//.test(rel) || /items\.json$/.test(rel)) return "item";
  return "other";
}

/** ⛔ EVERY ID THE CORPUS DECLARES, WITH ITS KIND AND ITS RECORD. One index, built once, so `modified`
 *  can be checked against the thing it actually names instead of against the ability catalogue.
 *  ⚠️ Both shapes: a file that IS a record (`{ id, … }`) and a file that holds a collection of them. */
function idIndex(files) {
  const out = new Map();
  const put = (id, rel, rec) => { if (typeof id === "string" && id && !out.has(id)) out.set(id, { rel, kind: kindOfPath(rel), rec }); };
  for (const { rel, text } of files) {
    let j; try { j = JSON.parse(text); } catch { continue; }
    if (Array.isArray(j)) { for (const r of j) put(r?.id, rel, r); continue; }
    if (j && typeof j === "object") {
      put(j.id, rel, j);
      for (const v of Object.values(j)) {
        if (Array.isArray(v)) for (const r of v) { if (r && typeof r === "object") put(r.id, rel, r); }
        else if (v && typeof v === "object" && typeof v.id === "string") put(v.id, rel, v);
      }
    }
  }
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
  // ⛔ A CHANGE SET NEED NOT MOVE AN ID. SNG-510 rewrites 67 rank GRANTS and touches no id, no mechanic
  // and no file - and this tool rejected it as declaring nothing, which would have pushed a well-formed
  // change set back at its author for the tool's convenience. `modified` is the third way to declare what
  // you touch, and it gets its own checks below rather than a pass.
  const modified = Array.isArray(cs.modified) ? cs.modified : [];

  check(`${label}: the change set declares what it touches`,
    leaving.length > 0 || arriving.length > 0 || modified.length > 0,
    "nothing in removed / renamed / added / modified");

  // 1 · ⛔ THE CENTRAL CHECK. Every file that names a departing id must be declared as a referrer.
  const derived = referrersOf(leaving, files);
  // ⚠️ `referrers` may be a bare array, or an object that also records what was CHECKED AND FOUND
  // UNAFFECTED - which is worth more than a bare list, because it says the author looked.
  const declaredList = Array.isArray(cs.referrers) ? cs.referrers
    : Array.isArray(cs.referrers?._declared) ? cs.referrers._declared : [];
  const declared = new Set(declaredList.filter(f => /\.json$/.test(f)));
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

  // 2b · ⛔ A MODIFICATION MUST NAME A CRAFT THAT EXISTS AND A FIELD IT ACTUALLY HAS. A prose change set
  // has no referrers to derive, so the check that earns its keep is the other one: is the thing you say you
  // are editing there at all? 67 rewrites aimed at a mistyped id would apply cleanly to nothing.
  if (modified.length) {
    const catalogue = new Map();
    for (const { rel, text } of files) {
      if (kindOfPath(rel) !== "craft") continue;   // CCODE-475: `rel` now carries its pack
      let pk; try { pk = JSON.parse(text); } catch { continue; }
      for (const ab of (pk.abilities || [])) catalogue.set(ab.id, ab);
    }
    // ⛔ CCODE-475 — A MODIFICATION IS NOT ALWAYS A CRAFT. Aevi's ask: `modified[].kind` — `encounter`,
    // `npc`, `power`, craft by default. ⛑ And the kind is INFERRED when it is not declared, because the
    // point of the check is "is the thing you say you are editing there at all" and the corpus can answer
    // that without being told where to look. Her change set then files unchanged, which is what she asked
    // for; declaring `kind` narrows the search and catches an id that exists as the WRONG sort of thing.
    const index = idIndex(files);
    const wrongKind = modified.filter(m => m?.id && m?.kind && index.has(m.id) && index.get(m.id).kind !== m.kind);
    const unknown = [...new Set(modified.map(m => m?.id).filter(Boolean))].filter(id => !catalogue.has(id) && !index.has(id));
    check(`${label}: every modified id names something that exists (${modified.length} edit(s), kind declared or inferred)`,
      unknown.length === 0 && wrongKind.length === 0,
      [...unknown.slice(0, 8), ...wrongKind.map(m => `${m.id} declared ${m.kind}, corpus says ${index.get(m.id).kind}`)].join(", "));

    // the field path, for the shapes a change set actually uses
    const badField = modified.filter(m => {
      const ab = catalogue.get(m?.id);
      if (!ab || !m?.field) return false;                 // unknown id is reported above, not twice
      // ⚠️ CCODE-475: `tree[]`/`rank` is an ABILITY shape. A non-craft edit is field-checked against its
      // own record below, never against a rank it does not have.
      if (/^tree\[\]\./.test(m.field)) {
        const key = m.field.replace(/^tree\[\]\./, "");
        const rank = (ab.tree || []).find(r => r.rank === m.rank);
        return !rank || rank[key] === undefined;
      }
      return m.field.split(".")[0] in ab ? false : true;
    });
    check(`${label}: every modified field exists on the craft at the rank named`,
      badField.length === 0, badField.slice(0, 6).map(m => `${m.id} r${m.rank} ${m.field}`).join(" · "));

    // ⛑ CCODE-475 — and a NON-craft edit is checked against its own record. `add:` in the change text is a
    // field that is not there YET and must not be required to be; anything else must already exist.
    const badOther = modified.filter(m => {
      if (!m?.id || !m?.field || catalogue.has(m.id)) return false;
      const hit = index.get(m.id);
      if (!hit || !hit.rec || typeof hit.rec !== "object") return false;
      if (/^\s*add\b/i.test(String(m.change || ""))) return false;
      return !(m.field.split(".")[0] in hit.rec);
    });
    check(`${label}: every modified field on a non-craft record exists, unless the edit says \`add:\``,
      badOther.length === 0, badOther.slice(0, 6).map(m => `${m.id} (${index.get(m.id)?.kind}) ${m.field}`).join(" · "));
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
  const impact = leaving.length ? saveImpact(leaving) : null;
  if (impact) {
    const hit = Object.entries(impact.shapes).filter(([, n]) => n > 0);
    console.log(`      SAVES: ${impact.total} entr(ies) across ${impact.saves} save(s) carry a departing id`);
    for (const [shape, n] of hit) console.log(`        ${String(n).padStart(4)}  ${shape}`);
    check(`${label}: a change set touching live saves declares its migration`,
      impact.total === 0 || !!cs.migration,
      `${impact.total} save entries affected and no "migration" declared — register a CHARACTER_STEPS entry in engine/reconcile.js`);
  }

  // 4b · ⛔ EVERY FILE THE CHANGE SET NAMES MUST ACTUALLY LOAD. Added because SNG-506 shipped
  // `rules/first_gift_template.json` — the file the whole restore inherits from — in NO MANIFEST, and this
  // tool passed it as a merely-idle referrer. SYSTEM_SPEC §42: a file not in a manifest DOES NOT EXIST, and
  // a change set whose keystone is invisible applies to nothing. The tool that exists to catch a missed
  // referrer had no business missing an unloadable one.
  {
    // \u26d4 CCODE-475 \u2014 EVERY PACK'S MANIFEST, NOT CORE'S. This read `core/manifest.json` alone and stripped
    // only the `content/packs/core/` prefix, so every valley path \u2014 319 of the 445 content files \u2014 read as
    // unregistered and a correct change set touching the valley could not be filed at all. Aevi's
    // SPEC_SNG-634 \u00a710a, and she did the right thing: she left it outside `changesets/` rather than edit the
    // gate to pass, on the SNG-505 \u00a74.4 rule that a gate a correct change turns red trains you to ignore it.
    const manifests = new Map();
    for (const pack of (existsSync(join(root, "content", "packs")) ? readdirSync(join(root, "content", "packs")) : [])) {
      try { manifests.set(pack, readFileSync(join(root, "content", "packs", pack, "manifest.json"), "utf8")); } catch { /* a pack may have none */ }
    }
    const asPackPath = (f) => {
      const s = String(f).replace(/^content\/packs\//, "");
      const i = s.indexOf("/");
      return i < 0 ? { pack: "core", rest: s } : { pack: s.slice(0, i), rest: s.slice(i + 1) };
    };
    const registered = (f) => {
      const { pack, rest } = asPackPath(f);
      const m = manifests.get(pack);
      if (m && m.includes('"' + rest + '"')) return true;
      // a bare path with no pack segment is core's, the shape every earlier change set used
      return (manifests.get("core") || "").includes('"' + String(f).replace(/^content\/packs\/core\//, "") + '"');
    };
    const created = new Set((cs.added || []).map(a => a?._file).filter(Boolean));
    const named = [...new Set([...declaredList, ...created, cs._designDecisions?.template?.file].filter(Boolean))]
      .filter(f => String(f).endsWith(".json"));
    // \u26a0\ufe0f A RETIRED FILE IS NOT AN UNREGISTERED ONE. A change set that removes a craft deregisters its
    // file on purpose; requiring it to stay in the manifest would forbid the very thing being applied.
    // The evidence that a removal was deliberate is a record of it in po/staged_content/.
    const retired = existsSync(join(root, "po/staged_content"))
      ? readdirSync(join(root, "po/staged_content")).filter(f => f.startsWith("retired_"))
      : [];
    const isRetired = (f) => retired.some(r => r.endsWith(String(f).split("/").pop()));
    // \u26d1 AND A FILE THE CHANGE SET CREATES CANNOT ALREADY BE REGISTERED \u2014 that is what `added` MEANS. But
    // SNG-506's lesson stands and is the reason this check exists: it shipped `rules/first_gift_template.json`,
    // the keystone the whole restore inherits from, in NO manifest, and this tool passed it. \u26a0\ufe0f So a
    // to-be-created file is accepted only when the change set SAYS HOW IT GETS LOADED \u2014 `_manifest` must name
    // it, or its directory. A new file with no manifest story still fails, which is the case that bit us.
    const manifestPlan = String(cs._manifest || "");
    const plannedFor = (f) => {
      if (!manifestPlan) return false;
      const { rest } = asPackPath(f);
      const dir = rest.includes("/") ? rest.slice(0, rest.lastIndexOf("/")) : "";
      return manifestPlan.includes(rest) || manifestPlan.includes(String(f))
        || (!!dir && manifestPlan.includes(dir));
    };
    // ⚠️ AND A MANIFEST IS NOT A CONTENT FILE — it is the register, so it can never appear in itself. A
    // change set that adds files names its pack's manifest as a referrer BECAUSE it edits it, and requiring
    // that to be registered is the tool asking a list to contain its own name.
    const isManifest = (f) => /(^|\/)manifest\.json$/.test(String(f));
    const unloadable = named.filter(f => !isManifest(f) && !registered(f) && !isRetired(f) && !(created.has(f) && plannedFor(f)));
    check(`${label}: every content file this change set names is manifest-registered, or is one it creates with a declared \`_manifest\` plan (${named.length} named, ${created.size} created)`,
      unloadable.length === 0,
      `${unloadable.join(", ")} \u2014 on disk is not loaded (SYSTEM_SPEC \u00a742); a file in \`added[]._file\` needs \`_manifest\` to say where it registers`);
  }

  // 4c · ⛔ CCODE-476 — A NEW PERSON MUST MEET THE RULES THE CORPUS ALREADY ENFORCES. Found the hard way:
  // SNG-634 and SNG-637 passed every check this tool had, applied cleanly, and turned FOUR gates red the
  // moment the suite ran — §59 and §146 (every authored non-legend person carries `domains`) and §148 (a
  // record whose authored level sits below its tier's floor, a ratchet that may only FALL). Thirteen people
  // carried no domains and four sat under their floor.
  // ⚠️ THE POINT IS WHERE THE FINDING LANDS, not that it was found. Those gates caught it after the content
  // was on disk and the manifests were edited — the validator exists so an author hears it while the change
  // set is still a file they own. A rule enforced only downstream is a rule the author meets as a surprise.
  // ⛑ THE FLOORS ARE READ FROM `resolution.json`, never retyped: a second copy of the tier ladder is the
  // drift this project has closed four times.
  {
    const people = (cs.added || []).filter(a => a?._kind === "npc" || /\/npcs\//.test(String(a?._file || "")));
    if (people.length) {
      let floors = {};
      try { floors = JSON.parse(readFileSync(join(CORE, "rules/resolution.json"), "utf8"))?.npcStanding?.tierFloor || {}; } catch { /* no ladder, no check */ }
      // ⚠️ THE SAME EXEMPTION §59 AND §146 CARRY: domains feed the kit draw, so a legend or a record declared
      // out of the fight path is allowed none. Anything else with a role in the world needs them.
      const exempt = (n) => n?.isLegend || n?.legend || n?.notAnOpponent || n?.declaredNotAnOpponent;
      // ⛔ CCODE-480 — AND THIS PREDICATE WAS WRONG, WHICH AEVI CAUGHT BY RUNNING IT. I wrote
      // `Array.isArray(n.domains) && n.domains.length`. Measured: ZERO of the 95 authored non-legend people
      // store an array; all 95 store an OBJECT — `{primary, secondary, tertiary}` ×90, `{primary, secondary}`
      // ×4, `{primary}` ×1. So the check refused thirteen records that were correct and would have gone on
      // refusing every correct one after them.
      // ⛑ AND THE FIX IS NOT A BETTER ARRAY TEST. This tool exists to say, at authoring time, exactly what
      // §146 will say at suite time — so it must use §146's OWN predicate, not a second reading of the same
      // question. A validator that disagrees with the gate it pre-empts is worse than no validator: it
      // teaches an author to distrust it, which is the SNG-505 §4.4 rule pointed at me.
      // ⚠️ SHAPE-AGNOSTIC ON PURPOSE, exactly as §146 is: an object or an array both answer "do they have
      // any", and the day the corpus changes shape neither of us moves.
      const hasDomains = (n) => !!(n.domains && Object.keys(n.domains).length);   // §146's predicate, verbatim
      const noDomains = people.filter(n => !exempt(n) && !hasDomains(n));
      check(`${label}: every person this change set adds carries \`domains\` (${people.length} person(s))`,
        noDomains.length === 0,
        `${noDomains.map(n => n.id).join(", ")} — domains feed the kit draw; §59 and §146 assert every authored non-legend person has them, and this uses §146's own predicate so the two can never disagree`);

      const underFloor = people.filter(n => n.tier && n.level != null && floors[n.tier] != null
        && Number(n.level) < Number(floors[n.tier]));
      check(`${label}: no person this change set adds sits below their own tier's floor`,
        underFloor.length === 0,
        `${underFloor.map(n => `${n.id} is ${n.tier} at level ${n.level}, floor ${floors[n.tier]}`).join(" · ")} — §148 is a ratchet that may only FALL, and it is the author's call which way to settle it: the level climbs to the tier's floor, or the tier drops to the level's rung`);
    }
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
// ⛔ A CHANGE SET HAS A LIFECYCLE. Its `expectedGates` describe the tree AT APPLY TIME; re-scoring them
// forever against a moving tree turns a finished, correct change set into a permanent false red - which is
// exactly what happened to SNG-506 the moment a gate it named was legitimately re-baselined.
// PENDING change sets are validated. APPLIED ones live in `applied/` and only have to still parse, so an
// unreadable record of what was done is still caught.
const appliedDir = join(dir, "applied");
const targets = arg ? [arg]
  : existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".json")).map(f => join(dir, f)) : [];
if (!arg && existsSync(appliedDir)) {
  const bad = readdirSync(appliedDir).filter(f => f.endsWith(".json")).filter(f => {
    try { JSON.parse(readFileSync(join(appliedDir, f), "utf8")); return false; } catch { return true; }
  });
  check(`applied/: every applied change set is still readable (${readdirSync(appliedDir).filter(f => f.endsWith(".json")).length} on the shelf)`,
    bad.length === 0, bad.join(", "));
}

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
