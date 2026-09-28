// ⛔ SNG-664 §1 — ONE PERSON, MINTED THREE TIMES. Erik, playing Loki: *"we aren't crisp on our minted people not
// being duplicated yet… we need to make it so that the person gets minted ONCE and correctly."*
//
// Aevi measured two pairs on his save. This re-derives them, scans every save for the same shape, and — because
// `mergePeople` has to re-point EVERY reference — walks each save for every path that holds either id, so the
// merge is written against what is actually there rather than a list of the fields somebody thought of.
//
// Nothing is written.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "C:/Users/orkst/Desktop/Singularity";
const { loadContentHeadless } = await import(`file:///${ROOT}/tests/headless_content.mjs`);
const C = await loadContentHeadless();

const saves = [];
for (const d of readdirSync(join(ROOT, "characters"))) {
  const dir = join(ROOT, "characters", d);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter(x => x.endsWith(".json"))) {
    try { saves.push({ key: `${d}/${f}`, c: JSON.parse(readFileSync(join(dir, f), "utf8")) }); } catch { /* skip */ }
  }
}

/** every path in a save that holds one of these ids — as a string value, or as an object KEY */
function walkForIds(node, ids, path, out) {
  if (node == null) return;
  if (typeof node === "string") { if (ids.includes(node)) out.set(path || "(root)", (out.get(path || "(root)") || 0) + 1); return; }
  if (Array.isArray(node)) { for (const v of node) walkForIds(v, ids, `${path}[]`, out); return; }
  if (typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (ids.includes(k)) out.set(`${path}.{id}`, (out.get(`${path}.{id}`) || 0) + 1);
    walkForIds(v, ids, `${path}.${k}`, out);
  }
}

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

console.log(`\n══ SNG-664 §1 — duplicate people across ${saves.length} saves ══\n`);

let pairs = 0;
for (const { key, c } of saves) {
  const reg = c.npcRegistry || {};
  const rows = Object.entries(reg).map(([id, n]) => ({ id, n }));
  const seen = new Map();          // normalised name → the ids that answer to it
  for (const { id, n } of rows) {
    for (const nm of [n?.name, n?.trueName, ...(n?.aliases || [])]) {
      if (!nm || /^unmet|^unknown/i.test(String(nm))) continue;
      const k = norm(nm);
      if (!k) continue;
      if (!seen.has(k)) seen.set(k, new Set());
      seen.get(k).add(id);
    }
  }
  const dupes = [...seen.entries()].filter(([, ids]) => ids.size > 1);
  if (!dupes.length) continue;
  console.log(`── ${key} · ${c.name} ──`);
  for (const [nm, ids] of dupes) {
    pairs++;
    console.log(`   ⛔ "${nm}" answers to ${ids.size} records:`);
    for (const id of ids) {
      const n = reg[id];
      console.log(`      ${id.padEnd(34)} name "${n?.name || "?"}"${n?.trueName ? `  trueName "${n.trueName}"` : ""}`
        + `${n?.nameUnknown ? "  (nameUnknown)" : ""}  bond ${n?.relationship ?? "-"}  met ${n?.metDay ?? n?.met ?? "?"}`);
    }
    // where a merge would have to reach
    const found = new Map();
    walkForIds(c, [...ids], "", found);
    const paths = [...found.entries()].sort((a, b) => b[1] - a[1]);
    console.log(`      the merge must re-point ${paths.reduce((s, p) => s + p[1], 0)} reference(s) across ${paths.length} shape(s):`);
    for (const [p, n] of paths.slice(0, 14)) console.log(`        ${String(n).padStart(3)} × ${p || "(root)"}`);
    if (paths.length > 14) console.log(`        …and ${paths.length - 14} more shapes`);
  }
  console.log("");
}
console.log(`   ${pairs === 0 ? "⛑ 0" : "⛔ " + pairs} name/trueName duplicate group(s) across every save.`);

console.log(`\n── the two Aevi named, by id ──`);
for (const id of ["radiant-agent-whistling-woman", "radiant-agent-seraphine-s-hand", "syllogist-of-the-margins", "orla-yardley"]) {
  for (const { key, c } of saves) {
    const n = (c.npcRegistry || {})[id];
    if (!n) continue;
    console.log(`   ${id.padEnd(34)} ${key.padEnd(34)} name "${n.name}"${n.trueName ? ` · trueName "${n.trueName}"` : ""}`
      + `${n.nameUnknown ? " · nameUnknown" : ""} · bond ${n.relationship ?? "-"} · met ${n.metDay ?? n.met ?? "?"}`
      + `${n.formerIds ? ` · formerIds ${JSON.stringify(n.formerIds)}` : ""}`);
  }
}
console.log(`\n   ⚠️ NOTHING IN THE ENGINE COULD HAVE JOINED THE FIRST PAIR: \`findExistingNpc\` matches id, name, aliases,`);
console.log(`      trueName and former ids, and "Radiant authority sent to intercept", "Corm Whitlock" and "Vail Langley"`);
console.log(`      share none of those. The second pair IS an exact trueName match — the CCODE-514 rule — and was never`);
console.log(`      merged because the matcher was fixed going forward and nothing repaired what was already there.`);
