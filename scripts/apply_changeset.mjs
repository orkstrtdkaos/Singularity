// scripts/apply_changeset.mjs — APPLY A CHANGE SET'S `added` RECORDS TO CONTENT, AND REGISTER THEM.
//
// ⛔ WHY A TOOL AND NOT TWENTY-TWO HAND-WRITTEN FILES. SNG-634 and SNG-637 together add eleven powers and
// twelve people across fourteen files; SNG-636's hierarchy is staged behind them and more will follow. Every
// one of those files is already authored, in full, inside the change set — copying them out by hand is a
// transcription job, and a transcription job is where a record quietly loses a field.
//
// ⚠️ IT READS THE CHANGE SET AS THE AUTHORITY AND NEVER EDITS IT. The change set is Aevi's; this writes
// content and manifests from it, and the change set moves to `applied/` by hand afterwards so that move is a
// deliberate act rather than a side effect.
//
// ⛑ SAME CONTRACT AS EVERY OTHER GENERATOR HERE: a DIFF by default, `--write` to apply. A dry run that reads
// like the real thing is the only reason anybody ever trusts the real thing.
//
// ⛔ WHAT IT WILL NOT DO, ON PURPOSE:
//   · it will not overwrite an existing single-record file. A change set that wants to REPLACE a record says
//     so through `modified`, which is a different verb with a different validator check behind it.
//   · it will not invent a manifest key. A new content KIND needs a loader branch written by a person, and a
//     `provides` entry with nothing reading it is the readerless shape this project keeps closing — so an
//     unknown kind is reported and refused rather than registered into silence.
//
// Run:  node scripts/apply_changeset.mjs po/staged_content/changesets/SNG-634_powers_on_the_ground.json
//       node scripts/apply_changeset.mjs <path> --write
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const path = args.find(a => !a.startsWith("--"));
if (!path) { console.error("usage: node scripts/apply_changeset.mjs <changeset.json> [--write]"); process.exit(2); }

const cs = JSON.parse(readFileSync(join(root, path), "utf8"));
const added = Array.isArray(cs.added) ? cs.added : [];
if (!added.length) { console.log(`${cs.id}: nothing in \`added\` — nothing to apply`); process.exit(0); }

// ⛔ THE COLLECTION KINDS THIS TOOL KNOWS, and the key each wraps its array in. A file that takes MANY
// records needs to know what to call them; a file that takes ONE is written as the record itself, which is
// how every npc, location and encounter in the corpus is already shaped.
const COLLECTION = { "powers.json": { key: "powers", kind: "powers" } };

const bookkeeping = new Set(["_file", "_kind"]);   // ⚠️ authored `_`-notes (`_fromPlay`, `_correction_*`) SURVIVE: they are provenance
const clean = (rec) => {
  const out = {};
  for (const [k, v] of Object.entries(rec)) if (!bookkeeping.has(k)) out[k] = v;
  return out;
};

const byFile = new Map();
for (const rec of added) {
  const f = rec?._file;
  if (!f) { console.error(`⛔ a record with no \`_file\`: ${rec?.id || "(no id)"}`); process.exit(1); }
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f).push(rec);
}

const plan = [];
let refused = 0;
for (const [rel, recs] of byFile) {
  const abs = join(root, rel);
  const base = basename(rel);
  const coll = COLLECTION[base];
  if (recs.length > 1 && !coll) {
    console.error(`⛔ ${rel} takes ${recs.length} records and this tool does not know what a collection of them is called. Add it to COLLECTION with the key its loader reads.`);
    refused++; continue;
  }
  if (coll) {
    let doc;
    if (existsSync(abs)) {
      doc = JSON.parse(readFileSync(abs, "utf8"));
      const have = new Set((doc[coll.key] || []).map(r => r?.id));
      const fresh = recs.filter(r => !have.has(r.id));
      const dupes = recs.filter(r => have.has(r.id));
      if (dupes.length) console.log(`   ⚠️ already present, left alone: ${dupes.map(d => d.id).join(", ")}`);
      doc[coll.key] = [...(doc[coll.key] || []), ...fresh.map(clean)];
      plan.push({ rel, abs, doc, what: `+${fresh.length} into an existing ${coll.key} file (${doc[coll.key].length} total)`, register: null });
    } else {
      doc = { schemaVersion: 1, id: base.replace(/\.json$/, ""), kind: coll.key,
              note: `${cs.id} — ${cs._title || "applied from a change set"}. Written by scripts/apply_changeset.mjs; the change set is the authority.`,
              [coll.key]: recs.map(clean) };
      plan.push({ rel, abs, doc, what: `NEW file, ${recs.length} ${coll.key}`, register: coll.kind });
    }
    continue;
  }
  // a single record IS the file
  if (existsSync(abs)) {
    console.error(`⛔ ${rel} already exists and this tool will not overwrite a record. Replacing one is \`modified\`, not \`added\`.`);
    refused++; continue;
  }
  plan.push({ rel, abs, doc: clean(recs[0]), what: `NEW file, ${recs[0].id}`, register: guessKind(rel) });
}

/** ⚠️ THE DIRECTORY NAMES THE KIND, because that is how every `provides` block in this repo is already
 *  organised. An unrecognised directory is reported, never guessed at. */
function guessKind(rel) {
  const m = /content\/packs\/[^/]+\/([^/]+)\//.exec(rel);
  return m ? m[1] : null;
}

console.log(`\n── APPLY ${cs.id} ${WRITE ? "(WRITING)" : "(dry run — pass --write to apply)"} ──`);
for (const p of plan) console.log(`  ${p.what.padEnd(46)} ${p.rel}`);

// ── the manifest, per pack ──────────────────────────────────────────────────────────────────────────────
const manifestEdits = new Map();
for (const p of plan) {
  if (!p.register) continue;
  const m = /^content\/packs\/([^/]+)\/(.+)$/.exec(p.rel);
  if (!m) continue;
  const [, pack, rest] = m;
  if (!manifestEdits.has(pack)) manifestEdits.set(pack, new Map());
  const byKind = manifestEdits.get(pack);
  if (!byKind.has(p.register)) byKind.set(p.register, []);
  byKind.get(p.register).push(rest);
}
const manifestPlan = [];
for (const [pack, byKind] of manifestEdits) {
  const mAbs = join(root, "content", "packs", pack, "manifest.json");
  const doc = JSON.parse(readFileSync(mAbs, "utf8"));
  doc.provides = doc.provides || {};
  let touched = 0;
  for (const [kind, paths] of byKind) {
    const known = Object.prototype.hasOwnProperty.call(doc.provides, kind);
    if (!known) {
      // ⛔ A NEW KIND NEEDS A READER. `provides.powers` with nothing loading it is a field authored into
      // silence — so it is registered only when the loader already names it, and otherwise said out loud.
      const loader = readFileSync(join(root, "engine", "state.js"), "utf8");
      if (!loader.includes(`provides.${kind}`)) {
        console.log(`   ⛔ ${pack}/manifest.json would need a NEW kind \`${kind}\`, and engine/state.js does not load it yet. Write the loader branch first — a \`provides\` entry nothing reads is the readerless shape.`);
        refused++;
        continue;
      }
    }
    const list = Array.isArray(doc.provides[kind]) ? doc.provides[kind] : [];
    const fresh = paths.filter(x => !list.includes(x));
    if (!fresh.length) continue;
    doc.provides[kind] = [...list, ...fresh].sort();
    touched += fresh.length;
    console.log(`  manifest ${pack}: provides.${kind} +${fresh.length}`);
  }
  if (touched) manifestPlan.push({ abs: mAbs, doc, pack, touched });
}

if (refused) { console.log(`\n⛔ ${refused} refusal(s) — nothing written.`); process.exit(1); }
if (!WRITE) { console.log(`\n(dry run — ${plan.length} file(s) and ${manifestPlan.length} manifest(s) would change)`); process.exit(0); }

for (const p of plan) {
  mkdirSync(dirname(p.abs), { recursive: true });
  writeFileSync(p.abs, JSON.stringify(p.doc, null, 1) + "\n", "utf8");
}
for (const m of manifestPlan) writeFileSync(m.abs, JSON.stringify(m.doc, null, 1) + "\n", "utf8");
console.log(`\n✅ ${plan.length} file(s) written, ${manifestPlan.length} manifest(s) updated. Move the change set to applied/ when the suite is green.`);
