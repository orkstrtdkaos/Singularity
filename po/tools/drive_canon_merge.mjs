/* ⛔ THE FORKED PERSON, driven end to end through the RUNNER — not by calling `apply` on a copy.
 *
 * ⛑ This file has twice recorded a step that could never run: one numbered below the runner, and one whose method was
 * named `run` where the runner calls `apply`. So the proof has to be `reconcile(entity, "character", ctx)` with
 * `reconcileVersion` observed to MOVE, on a copy of the save that actually carries the fork.
 *
 *   node po/tools/drive_canon_merge.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { reconcile } from "../../engine/reconcile.js";

const SAVE = "characters/player-54seyk/char-mr5ns3hh.json";
const live = JSON.parse(fs.readFileSync(SAVE, "utf8"));

console.log(`── ${live.name} (${path.basename(SAVE)}) ──`);
const before = Object.keys(live.npcRegistry || {}).filter(k => /vreni/i.test(k));
console.log(`   before            : ${before.join(", ")}`);
for (const k of before) {
  const n = live.npcRegistry[k];
  console.log(`      ${k.padEnd(14)} name "${n.name}" · role ${n.role ? `"${String(n.role).slice(0, 34)}"` : "null"} · met ${n.met ?? "null"} · questState ${n.questState ?? "—"}`);
}
console.log(`   reconcileVersion  : ${live.reconcileVersion}`);

/* ⚠️ A COPY. The live save is Courtney's and this is a measurement, not a migration. */
const copy = JSON.parse(JSON.stringify(live));
const res = reconcile(copy, "character", {});

const after = Object.keys(copy.npcRegistry || {}).filter(k => /vreni/i.test(k));
console.log(`\n   after             : ${after.join(", ")}`);
for (const k of after) {
  const n = copy.npcRegistry[k];
  console.log(`      ${k.padEnd(14)} name "${n.name}" · role ${n.role ? `"${String(n.role).slice(0, 34)}"` : "null"} · met ${n.met ?? "null"} · questState ${n.questState ?? "—"} · formerIds ${JSON.stringify(n.formerIds || [])}`);
}
console.log(`   reconcileVersion  : ${live.reconcileVersion} → ${copy.reconcileVersion}  ${copy.reconcileVersion > (live.reconcileVersion || 0) ? "✅ MOVED" : "❌ did not move — the step never ran"}`);

/* ⛔ THE CLAIMS, each stated rather than eyeballed */
const keep = copy.npcRegistry["sister-vreni"];
const say = (ok, what) => console.log(`   ${ok ? "✅" : "❌"} ${what}`);
say(after.length === 1 && after[0] === "sister-vreni", "one record survives, and it is the RICHER one (not the tidier id)");
say(!!keep && keep.name === "Sister Vreni", "the survivor keeps its real name, not the stub's id-as-a-name");
say(!!keep && keep.met === 23 && keep.relationship === 4, "and its met count and bond, which only it held");
say(!!keep && keep.questState === "allied", "⛔ AND THE ALLY MARKER MOVED ACROSS — the one thing only the stub held");
say(!!keep && (keep.formerIds || []).includes("sister_vreni"), "the old id is remembered, so a later meet under it lands here");

/* ⛑ IDEMPOTENT: running it again changes nothing, which is what lets every load run it. */
const twice = JSON.parse(JSON.stringify(copy));
reconcile(twice, "character", {});
say(JSON.stringify(twice.npcRegistry) === JSON.stringify(copy.npcRegistry), "running it a second time changes nothing");

/* ⚠️ AND IT TOUCHES NOBODY ELSE. A merge that quietly ate an unrelated person would pass every check above. */
const b = Object.keys(live.npcRegistry || {}).length, a = Object.keys(copy.npcRegistry || {}).length;
say(a === b - 1, `exactly one record went: ${b} people → ${a}`);
const lostFields = [];
for (const [id, n] of Object.entries(live.npcRegistry || {})) {
  if (id === "sister_vreni") continue;
  const now = copy.npcRegistry[id];
  if (!now) { lostFields.push(`${id} VANISHED`); continue; }
  for (const f of Object.keys(n)) if (JSON.stringify(now[f]) !== JSON.stringify(n[f])) lostFields.push(`${id}.${f}`);
}
say(lostFields.length === 0, `no other person changed in any field${lostFields.length ? ` — ${lostFields.slice(0, 5).join(", ")}` : ""}`);
console.log(`\n   (the live save on disk is untouched — this ran on a copy)`);
if (res?.notes?.length) console.log(`   runner notes: ${res.notes.join(" | ")}`);

/* ══ THE WHOLE CORPUS, which §364 forbids a gate to walk ═══════════════════════════════════════════
   ⛔ "No new gate may walk the live save directory — eleven already do and each is named; the list may shrink,
   never grow." §410 asserts the RULE over records it builds; this is the live sweep, run by hand. */
const canon = (x) => String(x || "").toLowerCase().replace(/_/g, "-");
let people = 0, saves = 0, forkedOnDisk = [], forkedAfterLoad = [];
for (const d of fs.readdirSync("characters")) {
  let files = [];
  try { files = fs.readdirSync(path.join("characters", d)); } catch { continue; }
  for (const f of files.filter(x => x.endsWith(".json"))) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join("characters", d, f), "utf8")); } catch { continue; }
    if (!j?.npcRegistry) continue;
    saves++;
    const forks = (reg) => {
      const seen = new Map(), out = [];
      for (const key of Object.keys(reg)) {
        const k = canon(key);
        if (seen.has(k)) out.push(`${j.name || f}: ${seen.get(k)} / ${key}`); else seen.set(k, key);
      }
      return out;
    };
    people += Object.keys(j.npcRegistry).length;
    forkedOnDisk.push(...forks(j.npcRegistry));
    /* ⚠️ on a COPY — these are other people's characters and this is a measurement, not a migration */
    const c = JSON.parse(JSON.stringify(j));
    try { reconcile(c, "character", {}); } catch { /* an unreconcilable save still counts above */ }
    forkedAfterLoad.push(...forks(c.npcRegistry));
  }
}
console.log(`
── the live corpus ──`);
console.log(`   ${people} registry people across ${saves} saves`);
console.log(`   forked on disk            : ${forkedOnDisk.length}${forkedOnDisk.length ? " — " + forkedOnDisk.join(", ") : ""}`);
console.log(`   still forked after a load : ${forkedAfterLoad.length}${forkedAfterLoad.length ? " ❌ " + forkedAfterLoad.join(", ") : " ✅ none — every fork the corpus holds is healed when the save is opened"}`);
