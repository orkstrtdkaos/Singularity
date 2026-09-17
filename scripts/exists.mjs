#!/usr/bin/env node
/** ⛔ SNG-611 — DOES THIS ALREADY EXIST? Aevi resumed on 2026-09-17 intending to author a craft she had authored
 *  HERSELF SIX MINUTES EARLIER, because the answer lived in recall across a compaction boundary rather than in the
 *  corpus. ⚠️ The check on 09-14 was correct and the corpus moved; nothing was stale except her memory of it.
 *  ⛑ THE FIX IS NOT BETTER RECALL, IT IS MAKING THE QUESTION CHEAPER TO ASK THAN TO REMEMBER.
 *      node scripts/exists.mjs unfinished
 *      node scripts/exists.mjs "reclamation site"
 *  Searches every authored kind by id and name, substring, case-insensitive. */
const term = process.argv.slice(2).join(" ").trim();
if (!term) { console.log("usage: node scripts/exists.mjs <name or id fragment>"); process.exit(2); }
const { loadContentHeadless } = await import("../tests/headless_content.mjs");
const C = await loadContentHeadless();
const q = term.toLowerCase();
const KINDS = [
  ["craft",    C.abilities],
  ["npc",      C.npcs],
  ["location", C.locations],
  ["item",     C.items],
  ["quest",    C.quests],
  ["event",    C.events],
  ["companion",C.companions],
];
let hits = 0;
for (const [kind, bag] of KINDS) {
  if (!bag) continue;
  const rows = Array.isArray(bag) ? bag : Object.values(bag);
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    const id = String(r.id || ""), name = String(r.name || "");
    if (!id.toLowerCase().includes(q) && !name.toLowerCase().includes(q)) continue;
    hits++;
    const extra = [r.tier, r.tradition, r.levelReq != null ? "L" + r.levelReq : null, r.regionId]
      .filter(Boolean).join(" · ");
    console.log(`  ${kind.padEnd(10)} ${id.padEnd(34)} ${name}${extra ? "   [" + extra + "]" : ""}`);
  }
}
console.log(hits ? `\n${hits} match(es) — IT EXISTS. Read it before authoring anything near it.`
                 : `\nno match for "${term}" in ${KINDS.filter(k=>k[1]).length} authored kinds.`);
