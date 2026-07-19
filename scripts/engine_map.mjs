// engine_map.mjs — BATCH-12 §5. What is each engine module FOR, and what breaks if I change it?
//
// The reachability audit (SNG-165) answered "can this be reached?". This answers the two questions
// after it. Mechanical columns are DERIVED — app.js contains zero dynamic imports, so the static
// import graph across every engine module is complete and trustworthy (verified in ROUND 2).
//
// TWO COLUMNS ARE NOT DERIVABLE AND MUST BE AUTHORED, by design:
//   purpose                 — one sentence. A module nobody can describe in one sentence is a
//                             design smell, and that is a finding worth having.
//   playerVisibleSurface    — the receipt line / control / overlay a player actually meets, or NONE.
//                             `NONE` is the flag that matters: it is how eight capabilities got
//                             built, tested and never reached, and it is a DIFFERENT question from
//                             reachability (skill_battle was reachable-in-principle and invisible
//                             in practice for months).
// Both live in engine_map.authored.json so a regeneration never overwrites human judgement.
//
// Usage: node scripts/engine_map.mjs            → writes ENGINE_MAP.md
//        node scripts/engine_map.mjs --json     → the raw table
//        node scripts/engine_map.mjs --check    → CI mode: exit 1 on a hard failure

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = p => { try { return readFileSync(join(root, p), "utf8"); } catch { return ""; } };

const engineFiles = readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).sort();
const src = Object.fromEntries(engineFiles.map(f => [f, read(`engine/${f}`)]));
const appSrc = read("app.js");
const authoredPath = join(root, "scripts", "engine_map.authored.json");
const authored = existsSync(authoredPath) ? JSON.parse(readFileSync(authoredPath, "utf8")) : {};

// ---- CONTENT SCHEMA FIELDS ----
// "which modules read the location/NPC schema" is what actually prices a content change (§1's
// substrateDensity, §3's peopleDisposition, SNG-166's regionId, SNG-167's loreRefs/questSeeds).
// Derived from the real corpus, not a hand-list, so a new authored field shows up automatically.
// Two exclusions, both stated in the doc so the column can't quietly under-report:
//   - JS collisions (`map`, `name`, `id`, …) — a content key that is also an Array/Object member
//     matches everywhere and means nothing.
//   - fields ≥9 modules touch — universal, so naming them discriminates nothing.
const COMMON_FIELD_CUTOFF = 9;
const JS_COLLISIONS = new Set(["map", "name", "id", "note", "notes", "tier", "kind", "role", "tags", "history", "image", "length", "size", "index", "type", "value", "key", "source", "text"]);
const schemaFields = (() => {
  const keys = new Set();
  for (const dir of ["content/packs/valley/locations", "content/packs/valley/npcs"]) {
    let files = []; try { files = readdirSync(join(root, dir)).filter(f => f.endsWith(".json")); } catch { }
    for (const f of files) { try { for (const k of Object.keys(JSON.parse(read(`${dir}/${f}`)))) keys.add(k); } catch { } }
  }
  const usable = [...keys].filter(k => !JS_COLLISIONS.has(k) && k !== "schemaVersion");
  const readerCount = Object.fromEntries(usable.map(k => [k, engineFiles.filter(f => new RegExp(`[.\\[]["']?${k}\\b`).test(src[f])).length]));
  return usable.filter(k => readerCount[k] > 0 && readerCount[k] < COMMON_FIELD_CUTOFF);
})();

const contentRefs = (s) => {
  const out = new Set();
  for (const m of s.matchAll(/["'`]([\w/-]+\.(?:json|md))["'`]/g)) out.add(m[1]);
  for (const m of s.matchAll(/\bCONTENT\.(\w+)/g)) out.add(`CONTENT.${m[1]}`);
  for (const k of schemaFields) if (new RegExp(`[.\\[]["']?${k}\\b`).test(s)) out.add(`.${k}`);
  return [...out];
};

// ---- GM VERBS ----
// NOT derivable from imports (ROUND 2 §4 Q4 caveat a): a module is imported for many reasons, only
// some of which serve a GM verb. The real link is app.js's applyTurn dispatch, so read THAT: for
// each `turn.<verb>`, walk forward through the block that handles it and attribute the verb to
// whichever module owns the functions called inside. Block-scoped by brace depth rather than a
// fixed line window, because the handler shape varies — `turn.itemUpdates` consumes on its own
// line, `turn.stageOps` consumes three lines down inside a for-loop.
let gmVerbsUnattributed = [];
const gmVerbs = (() => {
  const ownerOf = {};   // imported symbol -> engine module that exports it
  for (const m of appSrc.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']\.\/engine\/([\w-]+)\.js["']/g)) {
    for (const raw of m[1].split(",")) {
      const sym = raw.trim().split(/\s+as\s+/).pop().trim();
      if (sym) ownerOf[sym] = `${m[2]}.js`;
    }
  }
  const NON_OPS = new Set(["narration", "choices", "sceneSummary", "_opNote", "_applyFailed", "_raw", "id"]);
  const lines = appSrc.split("\n");
  const byModule = {};
  const allVerbs = new Set(), attributed = new Set();
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/\bturn\.(\w+)/g)) {
      const verb = m[1];
      if (NON_OPS.has(verb)) continue;
      allVerbs.add(verb);
      // Only a call that RECEIVES the op counts. A block-scoped sweep over-attributes every utility
      // that happens to be called inside the handler — `saveCharacter(character)` sitting in the
      // moveTo block does not make state.js a mover. So track what the op flows into first:
      // `turn.moveTo` directly, or a binding taken from it (`for (const op of turn.stageOps)`).
      const carriers = new Set([`turn.${verb}`]);
      let depth = 0;
      for (let j = i; j < Math.min(lines.length, i + 40); j++) {
        const L = lines[j];
        for (const b of L.matchAll(new RegExp(`(?:const|let|of|,)\\s*(\\w+)\\s*(?:=|\\))?[^\\n]*?turn\\.${verb}\\b`, "g"))) carriers.add(b[1]);
        for (const b of L.matchAll(new RegExp(`turn\\.${verb}[\\w.?\\[\\]]*\\s*\\.\\s*(?:map|forEach|filter|flatMap)\\s*\\(\\s*\\(?(\\w+)`, "g"))) carriers.add(b[1]);
        for (const call of L.matchAll(/\b([a-zA-Z_]\w*)\s*\(([^)]*)\)/g)) {
          const owner = ownerOf[call[1]];
          if (!owner) continue;
          // Strip string literals before matching, then require a whole-identifier hit: a carrier
          // named `deed` must not match the argument `"deed"`, and `op` must not match `options`.
          const args = call[2].replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, "");
          if (![...carriers].some(c => new RegExp(`(?:^|[^\\w.])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(args))) continue;
          (byModule[owner] = byModule[owner] || new Set()).add(verb);
          attributed.add(verb);
        }
        for (const ch of L) { if (ch === "{" || ch === "(") depth++; else if (ch === "}" || ch === ")") depth--; }
        if (j > i && depth <= 0) break;   // the handler block for this verb has closed
      }
    }
  }
  gmVerbsUnattributed = [...allVerbs].filter(v => !attributed.has(v)).sort();
  return Object.fromEntries(Object.entries(byModule).map(([k, v]) => [k, [...v].sort()]));
})();

const rows = engineFiles.map(file => {
  const s = src[file];
  const exports = [...s.matchAll(/^export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)/gm)].map(m => m[1]);
  const dependsOn = [...new Set([...s.matchAll(/from\s+["']\.\/(\w[\w-]*)\.js["']/g)].map(m => `${m[1]}.js`))].sort();
  const dependedOnBy = engineFiles.filter(f => f !== file && new RegExp(`from ["']\\./${file.replace(".js", "")}\\.js["']`).test(src[f]));
  const inApp = new RegExp(`from ["']\\./engine/${file.replace(".js", "")}\\.js["']`).test(appSrc);
  const a = authored[file] || {};
  return {
    module: `engine/${file}`,
    purpose: a.purpose || null,
    playerVisibleSurface: a.playerVisibleSurface || null,
    exportCount: exports.length,
    exports,
    dependsOn,
    dependedOnBy: [...dependedOnBy, ...(inApp ? ["app.js"] : [])],
    contentRead: contentRefs(s),
    gmVerbs: gmVerbs[file] || [],
    blastRadius: dependedOnBy.length + (inApp ? 1 : 0)
  };
});

// Transitive blast radius — what a change here can reach, not just its direct importers.
// app.js counts once when it is reachable AT ALL, directly or through a chain; genschema.js is
// only imported by generate.js but every change to it still lands in the app.
const byName = Object.fromEntries(rows.map(r => [r.module.replace("engine/", ""), r]));
for (const r of rows) {
  const seen = new Set(); const stack = [...r.dependedOnBy]; let hitsApp = false;
  while (stack.length) {
    const n = stack.pop();
    if (n === "app.js") { hitsApp = true; continue; }
    if (seen.has(n)) continue;
    seen.add(n);
    for (const up of byName[n]?.dependedOnBy || []) if (!seen.has(up)) stack.push(up);
  }
  r.reachCount = seen.size + (hitsApp ? 1 : 0);
  r.reachesApp = hitsApp;
}

if (process.argv.includes("--json")) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }

// ---- CI mode ----
if (process.argv.includes("--check")) {
  let fail = 0, warn = 0;
  // FRESHNESS FIRST. A map that silently stops covering the engine is worse than no map — it reads
  // as complete. Same failure the §23 count gate exists to catch: the document is only load-bearing
  // if going stale is loud.
  const doc = read("ENGINE_MAP.md");
  if (!doc) { console.log("  FAIL  ENGINE_MAP.md is missing — run: node scripts/engine_map.mjs"); process.exit(1); }
  const documented = new Set([...doc.matchAll(/^\| `engine\/([\w-]+\.js)`/gm)].map(m => m[1]));
  const missing = engineFiles.filter(f => !documented.has(f));
  const extra = [...documented].filter(f => !engineFiles.includes(f));
  if (missing.length || extra.length) {
    fail++;
    if (missing.length) console.log(`  FAIL  ${missing.length} module(s) exist but are NOT in ENGINE_MAP.md: ${missing.join(", ")}`);
    if (extra.length) console.log(`  FAIL  ${extra.length} module(s) in ENGINE_MAP.md no longer exist: ${extra.join(", ")}`);
    console.log(`        regenerate: node scripts/engine_map.mjs`);
  }
  // SYSTEM_SPEC's hand-written module map drifted the same way its header count did (BATCH-11 §0):
  // it said "all 38 engine modules" while 53 existed. The count is gone from the prose now; this
  // ratchet is what keeps the GAP from growing back. Down only, like every other ratchet.
  const specRows = new Set([...read("SYSTEM_SPEC.md").matchAll(/^\| `([\w-]+\.js)` \|/gm)].map(m => m[1]));
  const unspecced = engineFiles.filter(f => !specRows.has(f));
  let baseline = {}; try { baseline = JSON.parse(read("tests/wiring_baseline.json")); } catch { }
  const bar = baseline.modulesMissingFromSpecMap;
  if (typeof bar === "number") {
    if (unspecced.length > bar) {
      fail++;
      console.log(`  FAIL  ratchet: modulesMissingFromSpecMap = ${unspecced.length} (baseline ${bar}) — may only go DOWN`);
      console.log(`        new module(s) with no SYSTEM_SPEC row: ${unspecced.filter(f => !["chronicle.js", "company.js", "corrections.js", "entityDetail.js", "functions.js", "gm_registry.js", "intent.js", "narration_voice.js", "pacing.js", "personalArc.js", "recurrence.js", "skill_battle.js", "substrate.js", "toolkit.js", "waygate.js"].includes(f)).join(", ") || "(see full list)"}`);
    } else {
      console.log(`  ok    ratchet: modulesMissingFromSpecMap = ${unspecced.length} (baseline ${bar}) — may only go DOWN`);
    }
  }

  const noPurpose = rows.filter(r => !r.purpose);
  const noSurface = rows.filter(r => !r.playerVisibleSurface);
  // A module with NO content dependency AND no player-visible surface is the shape that produced
  // the original eight: pure machinery nothing feeds and nobody meets.
  const suspicious = rows.filter(r => r.playerVisibleSurface === "NONE" && !r.contentRead.length && !r.gmVerbs.length);
  console.log(`ENGINE_MAP: ${rows.length} modules`);
  console.log(`  authored purpose:  ${rows.length - noPurpose.length}/${rows.length}`);
  console.log(`  authored surface:  ${rows.length - noSurface.length}/${rows.length}`);
  if (noPurpose.length) { warn++; console.log(`  note  ${noPurpose.length} module(s) still need a purpose line (backfill in progress — warn, not fail):\n        ${noPurpose.map(r => r.module).join(", ")}`); }
  if (suspicious.length) { warn++; console.log(`  note  ${suspicious.length} module(s) have NO content dependency, NO GM verb and surface NONE — the shape that produced the original eight:\n        ${suspicious.map(r => r.module).join(", ")}`); }
  // HARD failure: a module that is authored must be authored COMPLETELY, and a new module may not
  // arrive with neither column. Warn on the backlog; fail on a regression.
  const halfAuthored = rows.filter(r => (r.purpose && !r.playerVisibleSurface) || (!r.purpose && r.playerVisibleSurface));
  if (halfAuthored.length) { fail++; console.log(`  FAIL  ${halfAuthored.length} module(s) are half-authored — a purpose without a surface (or vice versa) is worse than neither, it reads as complete:\n        ${halfAuthored.map(r => r.module).join(", ")}`); }
  console.log(fail ? `\nENGINE_MAP: ${fail} FAILURE(S)` : `\nENGINE_MAP: ok${warn ? ` (${warn} advisory)` : ""}`);
  process.exit(fail ? 1 : 0);
}

// ---- the document ----
const esc = s => String(s ?? "").replace(/\|/g, "\\|");
const authoredCount = rows.filter(r => r.purpose).length;
const out = [];
out.push(`# ENGINE MAP`);
out.push(``);
out.push(`> **Generated** by \`scripts/engine_map.mjs\` — re-run it rather than editing this file.`);
out.push(`> Mechanical columns are derived from the static import graph, which is complete: \`app.js\` contains **zero dynamic imports**.`);
out.push(`> **\`purpose\` and \`player-visible surface\` are AUTHORED** in \`scripts/engine_map.authored.json\` and are never overwritten by a regeneration.`);
out.push(``);
out.push(`**${rows.length} modules · ${authoredCount}/${rows.length} described.** \`player-visible surface: NONE\` is the flag that matters — it is a different question from reachability, and it is how a capability gets built, tested, and never met.`);
out.push(``);
out.push(`**How each derived column is measured** — so the columns can be trusted or corrected rather than believed:`);
out.push(``);
out.push(`- **depends on / depended on by** — static \`import\` statements. Complete: \`app.js\` has zero dynamic imports.`);
out.push(`- **reach** — transitive closure of *depended on by*. \`app.js\` counts once if reachable at all, directly or through a chain.`);
out.push(`- **content it reads** — literal \`*.json\`/\`*.md\` paths, \`CONTENT.*\` keys, and content-schema fields harvested from the real location and NPC corpus. **Excluded:** field names that collide with JS members (\`map\`, \`name\`, \`id\`, …) and fields ≥${COMMON_FIELD_CUTOFF} modules read, which discriminate nothing. ${schemaFields.length} fields qualify.`);
out.push(`- **GM verbs** — from \`applyTurn\`'s dispatch in \`app.js\`, *not* from imports: each \`turn.<verb>\` handler block is walked and the verb attributed to whichever module owns the functions called inside it.`);
out.push(``);
out.push(`| module | purpose | player surface | exports | depends on | depended on by | reach | content it reads | GM verbs |`);
out.push(`|---|---|---|---|---|---|---|---|---|`);
for (const r of rows.sort((a, b) => b.reachCount - a.reachCount || a.module.localeCompare(b.module))) {
  out.push(`| \`${r.module}\` | ${r.purpose ? esc(r.purpose) : "*— unstated —*"} | ${r.playerVisibleSurface ? esc(r.playerVisibleSurface) : "*—*"} | ${r.exportCount} | ${r.dependsOn.length ? r.dependsOn.map(d => `\`${d}\``).join(" ") : "—"} | ${r.dependedOnBy.length ? r.dependedOnBy.map(d => `\`${d}\``).join(" ") : "**nothing**"} | **${r.reachCount}** | ${r.contentRead.slice(0, 4).map(c => `\`${esc(c)}\``).join(" ") || "—"} | ${r.gmVerbs.map(v => `\`${v}\``).join(" ") || "—"} |`);
}
out.push(``);
out.push(`## GM verbs handled inside \`app.js\` itself`);
out.push(``);
out.push(`${gmVerbsUnattributed.length} of the reply contract's ops never reach an engine module — \`applyTurn\` handles them inline. Some of those are correct (a narration flag has nowhere else to live); some are engine logic sitting in the view layer, which is where it gets hard to test.`);
out.push(``);
out.push(gmVerbsUnattributed.map(v => `\`${v}\``).join(" · ") || "*none*");
out.push(``);
out.push(`## Blast radius — read this before changing a module`);
out.push(``);
out.push(`\`reach\` is the TRANSITIVE count: every module that can be affected by a change here, not just direct importers. A spec touching one of these should state the number before work starts.`);
out.push(``);
for (const r of rows.slice(0, 8)) out.push(`- \`${r.module}\` — **${r.reachCount}** modules downstream${r.gmVerbs.length ? `, serves \`${r.gmVerbs.join("` `")}\`` : ""}`);
out.push(``);
writeFileSync(join(root, "ENGINE_MAP.md"), out.join("\n") + "\n");
console.log(`wrote ENGINE_MAP.md — ${rows.length} modules, ${authoredCount} described`);
