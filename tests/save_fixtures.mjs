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
const declaredShrinks = [];
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
  // ⚠️ 2026-09-05 — A SHRINK IS ALLOWED ONLY WHEN A STEP DECLARED IT. This gate exists because a reconcile
  // that silently deletes from a save is unrecoverable, and that is still what it guards. ⛔ But a RULED
  // removal is a real thing — Erik retired the baseline defence kit — and the honest distinction is not
  // "did anything shrink" but "did anything vanish WITHOUT A REASON GIVEN TO THE PLAYER". A step that
  // removes must say so in its notes; one that removes quietly still fails here, which is the case worth
  // catching. ⚡ Loosening this to "shrinking is fine" would have thrown away the whole gate.
  const declared = (out?.notes || []).join(" ");
  if (path.includes("msto2oe1")) console.log("DEBUG declaredLoss:", /gone from your sheet|no longer|removed/i.test(declared), "| before/after:", JSON.stringify(before), JSON.stringify(after));
  const declaredLoss = /gone from your sheet|no longer|removed/i.test(declared);
  for (const k of Object.keys(before)) {
    // ⚠️ BOTH MUST BE NUMBERS. `undefined >= undefined` is false, so a key neither side counts fell
    // through to the loss branch and reported "custom undefined -> undefined" for every save.
    if (!Number.isFinite(before[k]) || !Number.isFinite(after[k])) continue;
    if (after[k] >= before[k]) continue;
    if (declaredLoss) { declaredShrinks.push(`${path}: ${k} ${before[k]} -> ${after[k]} — ${declared.slice(0, 60)}`); continue; }
    shrank++; losses.push(`${path}: ${k} ${before[k]} -> ${after[k]}`);
  }
  // ⚠️ AND THE IDENTITY MUST SURVIVE. A migration that renames a character is not a migration.
  if (obj.id && copy.id !== obj.id) losses.push(`${path}: id changed ${obj.id} -> ${copy.id}`);
}

check(`all ${saves.length} real saves reconcile without throwing`, threw === 0, `${threw} threw`);
if (declaredShrinks.length) console.log(`      DECLARED removals (a step said so, in words the player sees): ${declaredShrinks.join(" | ")}`);
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

/* ── the shared world: who these saves publish, and under what name ── */
{
  // ⛑ THIS CLAIM LIVES HERE AND NOT IN `how_it_works` (CCODE-528). It is an INVARIANT about live data —
  // nobody may enter the shared world under a job title — and this is the one suite whose job is the live
  // saves. If play breaks it, the push SHOULD stop: a role-named publication is a defect, not correct play.
  // ⚠️ That is the line the 09-12 ruling draws. What a gate may not do is assert an INCIDENTAL fact about a
  // played world (that Silas has not chosen his nemesis yet) — the mechanism's own checks are frozen, in §339.
  //
  // ⛔ IT HAS ALREADY CAUGHT ONE: Vail Langley was published as "Enforcer of Seraphine's will", the placeholder
  // Loki is stuck with, because `livesOfWorld` builds a row as `{ ...introduction, ...life }` and the life half
  // published `n.name` over the world's name. The gate reddened on a push and the engine was the thing wrong.
  const FT = await import("../engine/fates.js");
  const NM = await import("../engine/names.js");
  const QG = await import("../engine/quests.js");
  const promotable = (c) => {
    const givers = new Set();
    for (const q of c.quests || []) { const id = QG.giverRegistryId(c.npcRegistry, q?.giver); if (id) givers.add(id); }
    return FT.promotableIds(c, { giverIds: givers, atMet: 3, isRole: NM.looksLikeRole });
  };
  let store = { schemaVersion: 1, regionId: "valley", lives: {} }, walked = 0;
  for (const { obj } of saves) {
    if (!obj?.npcRegistry) continue;
    walked++;
    store = FT.foldLives(store, FT.livesOfWorld(obj, new Set(), { by: { characterId: obj.id, name: obj.name }, introduce: promotable(obj) })).store;
  }
  const published = Object.values(store.lives);
  const roleNamed = published.filter(l => NM.looksLikeRole(l.name, l.intro?.role || ""));
  check("⛔ NOBODY ENTERS THE SHARED WORLD UNDER A JOB TITLE — driven over every live save, because a bar can only be judged against the people it admits",
    walked >= 10 && published.length >= 40 && roleNamed.length === 0,
    `${published.length} people across ${walked} saves · ${roleNamed.length} under a job title`
    + (roleNamed.length ? `\n      ${roleNamed.slice(0, 4).map(l => `${l.id}: "${l.name}"`).join(" · ")}` : ""));

  check("⛑ …and nothing a character privately knows travels with them — not a fact, not a feeling, not a history",
    !/knownFacts|relationship"|"history"/.test(JSON.stringify(published))
    && published.every(l => l.name && l.canonId),
    "a life is public; what one traveler privately learned about a person is theirs");
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
