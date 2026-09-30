// ⛑ WORK ORDER 2026-09-30, group 1 — the three bugs Erik is playing on, measured before anything is built.
// Aevi's readings are in `po/LIST_erik_20260930_ui_and_mechanics.md`; this checks each against the live corpus so the
// fix is aimed at what is actually there. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";
const H = await import("../../engine/holdings.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}

/* ══ 12 · ARREARS ONLY GROW ══════════════════════════════════════════════════════════ */
console.log(`\n══ ITEM 12 — "I can't seem to do anything about it"\n`);
const src = readFileSync("engine/holdings.js", "utf8");
const adds = [...src.matchAll(/arrears[^\n]*[+]=|arrears = [^\n]*\+/g)].length;
const clears = [...src.matchAll(/arrears[^\n]*-=|arrears = Math\.max\(0, [^\n]*-/g)].length;
console.log(`  engine/holdings.js: ${adds} place(s) ADD to arrears, ${clears} place(s) take any away`);
for (const f of ["engine", "app.js"]) {
  const files = f === "app.js" ? ["app.js"] : readdirSync("engine").filter(x => x.endsWith(".js")).map(x => `engine/${x}`);
  for (const p of files) {
    const s = readFileSync(p, "utf8");
    if (/arrears/.test(s)) {
      const a = [...s.matchAll(/[^\n]*arrears[^\n]*/g)].map(m => m[0].trim());
      const pays = a.filter(l => /-=|Math\.max\(0[^)]*-|= 0|delete /.test(l));
      console.log(`  ${p.padEnd(24)} ${a.length} mention(s), ${pays.length} that could REDUCE it${pays.length ? ": " + pays[0].slice(0, 80) : ""}`);
    }
  }
}
let owed = 0, owing = [];
for (const ch of saves) for (const h of ch.holdings || []) {
  const n = Number(h.arrears) || 0;
  if (n > 0) { owed += n; owing.push(`${ch.name}/${h.name} owes ${n}`); }
}
console.log(`  in the live saves: ${owing.length} hold(s) in arrears — ${owing.join(", ") || "none"}`);
console.log(`  ⛑ and a door to pay it: ${/data-arrears|payArrears|clearArrears/.test(readFileSync("app.js", "utf8")) ? "exists" : "⛔ NONE"}`);

/* ══ 8 + 13 · CY, THE CHARGE, AND THE GROWTH JOB ═════════════════════════════════════ */
console.log(`\n══ ITEMS 8 + 13 — Cy's charge, twice, and not on the legs\n`);
const loki = saves.find(s => s.name === "Loki");
const asg = Object.entries(loki?.worldState?.assignments || {});
console.log(`  Loki carries ${asg.length} assignment(s):`);
for (const [key, a] of asg) {
  console.log(`    ${String(key).slice(0, 22).padEnd(24)} ${String(a?.npcName || a?.npcId || "?").padEnd(16)} ${String(a?.status || "").padEnd(10)} ${String(a?.charge || "").slice(0, 60)}`);
}
const byPurpose = {};
for (const [, a] of asg) {
  const k = `${a?.npcId}|${String(a?.charge || "").toLowerCase().slice(0, 40)}`;
  byPurpose[k] = (byPurpose[k] || 0) + 1;
}
const dupes = Object.entries(byPurpose).filter(([, n]) => n > 1);
console.log(`  duplicate (person + purpose): ${dupes.length ? dupes.map(([k, n]) => `${n}× ${k.split("|")[0]}`).join(", ") : "none"}`);
const annex = (loki?.holdings || [])[0];
console.log(`  the Annex's growth job: ${JSON.stringify(annex?.clearing) || "none running"}`);
console.log(`  who clearingTick counts: crew ${(annex?.crew || []).length} + garrison ${(annex?.garrison || []).length} = ${(annex?.crew || []).length + (annex?.garrison || []).length} hand(s)`);
console.log(`  ⛔ a delegated person is NOT in either list, so the job says nobody is at it.`);

/* ══ 9 · hullable ═══════════════════════════════════════════════════════════════════ */
console.log(`\n══ ITEM 9 — "It said I can't have a keep on a moving hold"\n`);
const feats = C.rules?.economy?.holdFeatures?.kinds || C.rules?.economy?.holdFeatures || {};
const hullable = Object.entries(feats).filter(([k, v]) => v && typeof v === "object" && v.hullable === false);
console.log(`  feature kinds authored: ${Object.keys(feats).filter(k => !k.startsWith("_")).length}`);
console.log(`  kinds marked \`hullable: false\`: ${hullable.length} — ${hullable.map(([k]) => k).join(", ")}`);
const frames = C.rules?.economy?.holdStore?.slots?.frames?.kinds || {};
console.log(`  frames: ${Object.keys(frames).filter(k => !k.startsWith("_")).join(", ")}`);
const appSrc = readFileSync("app.js", "utf8") + readFileSync("engine/holdings.js", "utf8");
const usedAs = [...appSrc.matchAll(/[^\n]*hullable[^\n]*/g)].map(m => m[0].trim());
console.log(`  how it is READ (${usedAs.length} site(s)):`);
for (const l of usedAs.slice(0, 4)) console.log(`    ${l.slice(0, 130)}`);
