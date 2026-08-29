// tests/save_fixtures.mjs — CCODE-288. THE REAL SAVES STILL LOAD, AND NOTHING IS LOST ON THE WAY IN.
//
// ⛔ ERIK'S SAVES ARE THE ONE ARTEFACT IN THIS PROJECT THAT CANNOT BE REGENERATED. Content can be
// re-authored and the engine can be rewritten; 1,788 turns of played history cannot.
//
// ⚠️ AND WE CHANGE VOCABULARY REGULARLY. On 2026-08-28 alone the `blind` targeting policy was renamed to
// `mindless` and needed an alias, `schoolAffinityNote` became `_schoolAffinityNote`, and the damage-family
// table changed shape. ⛔ EACH OF THOSE COULD HAVE DROPPED SOMETHING OUT OF A SAVE SILENTLY — a renamed
// value that no longer resolves does not throw, it just stops meaning anything, and the loss shows up as a
// character who quietly cannot do a thing they used to do.
//
// ⛔ SO THIS IS A GOLDEN-FILE TEST WITH ONE RULE: reconcile every real save and assert NOTHING SHRANK.
// It never writes. It never mutates a save on disk. It reads, reconciles a COPY, and counts.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const charsDir = join(root, "characters");

let pass = 0; const fails = [];
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`ok    ${name}`); }
  else { fails.push(name); console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
};

console.log("");
console.log("═".repeat(92));
console.log("  CCODE-288 — REAL SAVE FIXTURES. Nothing may shrink on load.");
console.log("═".repeat(92) + "\n");

if (!existsSync(charsDir)) {
  console.log("no characters/ directory — nothing to check.");
  process.exit(0);
}

/* ── collect ─────────────────────────────────────────────────────────────────────────────────── */
const saves = [];
for (const player of readdirSync(charsDir)) {
  const pdir = join(charsDir, player);
  let files; try { files = readdirSync(pdir); } catch { continue; }
  for (const f of files.filter(x => x.endsWith(".json"))) {
    try { saves.push({ path: `characters/${player}/${f}`, obj: JSON.parse(readFileSync(join(pdir, f), "utf8")) }); }
    catch (e) { check(`parse ${player}/${f}`, false, String(e.message)); }
  }
}

// ⛔ NON-VACUITY FIRST. An empty characters/ directory would pass every check below by having nothing to
// check — the failure mode this project names most often, and the cheapest place to forget it.
check("there are real saves to test against", saves.length >= 10, `${saves.length} found`);
if (!saves.length) { console.log("\nno saves — nothing proved.\n"); process.exit(1); }

/* ── the counts that must not shrink ─────────────────────────────────────────────────────────── */
const countOf = (c) => ({
  abilities: (c.abilities || []).length,
  custom: (c.customAbilities || []).length,
  items: (c.inventory || c.items || []).length,
  companions: (c.companions || []).length,
  quests: (c.quests || []).length,
});

const { reconcile } = await import("../engine/reconcile.js");
const { loadContentHeadless } = await import("./headless_content.mjs");
const CONTENT = await loadContentHeadless();

let reconciled = 0, threw = 0, shrank = 0;
const losses = [];
for (const { path, obj } of saves) {
  const before = countOf(obj);
  // ⚠️ A DEEP COPY, ALWAYS. This test must never be the reason a save changes on disk, and `reconcile`
  // mutates the entity it is given by design.
  const copy = JSON.parse(JSON.stringify(obj));
  let out = null;
  try {
    out = reconcile(copy, "character", { content: CONTENT, rules: CONTENT.rules, ...CONTENT });
    reconciled++;
  } catch (e) {
    threw++;
    check(`reconcile ${path}`, false, `THREW: ${e.message}`);
    continue;
  }
  const after = countOf(copy);
  for (const k of Object.keys(before)) {
    if (after[k] < before[k]) { shrank++; losses.push(`${path}: ${k} ${before[k]} -> ${after[k]}`); }
  }
  // ⚠️ AND THE IDENTITY MUST SURVIVE. A migration that renames a character is not a migration.
  if (obj.id && copy.id !== obj.id) losses.push(`${path}: id changed ${obj.id} -> ${copy.id}`);
}

check(`all ${saves.length} real saves reconcile without throwing`, threw === 0, `${threw} threw`);
check("⛔ nothing SHRANK — no ability, item, companion or quest was dropped on load",
  shrank === 0, losses.slice(0, 8).join("\n      "));

/* ── ⛔ RESOLUTION, NOT JUST COUNT. This is the check that was missing. ─────────────────────────── */
{
  // ⛔ CCODE-294 — THIS FILE SAID "NOTHING SHRANK" WHILE 22 ABILITY REFERENCES POINTED AT NOTHING.
  // It counted array LENGTHS. The arrays were intact; the ENTRIES were dangling, because
  // `ability_rename_map.json` (377 old→new ids) was registered and never loaded. ⚠️ COUNTING THE
  // CONTAINER INSTEAD OF THE CONTENTS — the same shape as every other finding this week, in the test
  // written to catch exactly this.
  //
  // ⚠️ AND AN ID HAS THREE LEGITIMATE HOMES, which is why this took measuring twice: the CATALOGUE, a
  // GM-MINTED entry in `customAbilities`, or a runtime BRAID. My first pass knew only the first and
  // called six minted abilities "lost". A check that does not know all three manufactures alarm.
  const cat = new Set(Object.keys(CONTENT.abilities || {}));
  let refs = 0, dangling = 0; const bad = [];
  for (const { path, obj } of saves) {
    const ca = obj.customAbilities || {};
    const custom = new Set(Array.isArray(ca) ? ca.map(x => x?.id || x?.abilityId).filter(Boolean) : Object.keys(ca));
    const copy = JSON.parse(JSON.stringify(obj));
    try { reconcile(copy, "character", { content: CONTENT, rules: CONTENT.rules, ...CONTENT }); } catch { /* counted above */ }
    for (const a of (copy.abilities || [])) {
      const id = typeof a === "string" ? a : a?.abilityId;
      if (!id) continue;
      refs++;
      if (cat.has(id) || custom.has(id) || /^braid_/.test(id)) continue;
      dangling++; if (bad.length < 8) bad.push(`${path}: ${id}`);
    }
  }
  check("there are ability references to resolve (non-vacuity)", refs > 100, `${refs} refs`);
  check("⛔ every ability a real save carries RESOLVES after reconcile — catalogue, minted, or braid",
    dangling === 0, `${dangling} dangling of ${refs} — ` + bad.join(" · "));
}

/* ── vocabulary: a renamed value from an old save must still resolve ─────────────────────────── */
{
  // ⛔ THE 2026-08-28 CASE, KEPT AS A STANDING GUARD. `blind` was renamed to `mindless`; a save or an
  // encounter still carrying the old word must resolve through the alias, NOT fall through to `threat` —
  // which would silently hand a mindless thing a preference it must not have.
  const T = await import("../engine/targeting.js");
  check("a retired policy name from an old save still resolves (blind -> mindless)",
    T.canonPolicy("blind") === "mindless");
  check("…and an unknown policy degrades to the default rather than throwing",
    T.canonPolicy("nonsense_from_the_future") === "nonsense_from_the_future"
    && T.chooseTarget([{ id: "a", name: "A" }], { policy: "nonsense_from_the_future", rng: () => 0 })?.target?.id === "a");
}

/* ── report ──────────────────────────────────────────────────────────────────────────────────── */
console.log("\n" + "═".repeat(92));
console.log(`  ${saves.length} saves · ${reconciled} reconciled · ${pass} ok · ${fails.length} FAILURE(S)`);
if (fails.length) { console.log("\n  ⛔ A REAL SAVE WAS DAMAGED BY A CHANGE:"); fails.forEach(f => console.log("     " + f)); }
console.log("═".repeat(92) + "\n");
process.exitCode = fails.length ? 1 : 0;
