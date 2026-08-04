// tests/save_history_audit.mjs — SNG-288: does a REAL character have the history for any of this to fire?
//
// Erik's direct ask, relayed by Aevi: run the deed/tier analysis against the ACTUAL SAVES.
//
// ⚠️ AEVI — THE SAVES ARE IN THE TREE. `characters/<playerKey>/<charId>.json`, committed, 13 of them. You
// wrote "they live in browser localStorage with no exported fixtures anywhere in the tree" and asked me to
// reach them because you could not. They are right here, and `world_drive_audit.mjs` has been reading them
// since v1.1.0 — that is where its "10 saves / 1,788 turns of real play" line comes from. You could have run
// this yourself, and the next thing that needs real play data should not wait on me.
//
// THE QUESTION THE SIM CANNOT ANSWER, which is the right question: promotion, titles and mythic paths all
// read a HISTORY. If the recording only began at some recent commit, every existing character starts
// rung-less and title-less no matter what they have actually done — and that is a MIGRATION problem, not a
// tuning one. A sweep over synthetic careers cannot see it, because synthetic careers are recorded from
// their first beat.
//
// A REPORT. It reads saves; it writes nothing.
//
// Run: node tests/save_history_audit.mjs

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const charsDir = join(root, "characters");

if (!existsSync(charsDir)) {
  console.log("no characters/ directory — nothing to audit.");
  process.exit(0);
}

const saves = [];
for (const d of readdirSync(charsDir)) {
  const dir = join(charsDir, d);
  let files = [];
  try { files = readdirSync(dir).filter(f => f.endsWith(".json")); } catch { continue; }
  for (const f of files) {
    try { saves.push({ playerKey: d, file: f, c: JSON.parse(readFileSync(join(dir, f), "utf8")) }); } catch { /* unreadable save */ }
  }
}

const num = (v) => Number(v) || 0;
const rows = saves.map(({ playerKey, file, c }) => {
  const deeds = Array.isArray(c.deeds) ? c.deeds : [];
  const ws = c.worldState || {};
  const tenure = ws.figureTenure || {};
  // The player is not in figureTenure — that tracks FIGURES. A player's own record is their deeds, their
  // chronicle and their quests, which is exactly the asymmetry worth reporting.
  const spreadTo = new Set();
  for (const d of deeds) for (const s of (d.spread || [])) spreadTo.add(s);
  const communities = new Set(deeds.map(d => d.communityId).filter(Boolean));
  const quests = Array.isArray(c.quests) ? c.quests : [];
  return {
    who: `${c.name || "?"} (${file.replace(/\.json$/, "")})`,
    playerKey,
    level: num(c.level),
    turns: (c.chronicle || []).length,
    deeds: deeds.length,
    deedWeightSum: deeds.reduce((a, d) => a + Math.abs(num(d.weight)), 0),
    communities: communities.size,
    spread: spreadTo.size,
    questsResolved: quests.filter(q => q.status === "resolved").length,
    figuresTracked: Object.keys(tenure).length,
    figureDeeds: Object.values(tenure).reduce((a, t) => a + num(t.deeds), 0),
    losses: Object.values(tenure).reduce((a, t) => a + num(t.losses), 0),
    deaths: Object.values(ws.epicStatus || {}).filter(s => s?.status === "dead").length,
    retrievals: (ws.arcRetrievals || []).length,
    stageMoves: Object.keys(ws.arcStageSeen || {}).length,
    promoted: Object.keys(ws.figureTier || {}).length,
  };
});

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

console.log("SAVE HISTORY AUDIT (SNG-288) — is there enough recorded history for the ladder to fire?\n");
console.log(`  ${saves.length} save file(s) across ${new Set(saves.map(s => s.playerKey)).size} player(s), read from characters/ in the tree.\n`);

console.log(`  ${pad("character", 34)} ${rpad("lvl", 3)} ${rpad("beats", 5)} ${rpad("deeds", 5)} ${rpad("comm", 4)} ${rpad("spread", 6)} ${rpad("quests", 6)}`);
for (const r of rows.sort((a, b) => b.turns - a.turns)) {
  console.log(`  ${pad(r.who.slice(0, 34), 34)} ${rpad(r.level, 3)} ${rpad(r.turns, 5)} ${rpad(r.deeds, 5)} ${rpad(r.communities, 4)} ${rpad(r.spread, 6)} ${rpad(r.questsResolved, 6)}`);
}

const played = rows.filter(r => r.turns > 0 || r.deeds > 0);
const deepest = rows.slice().sort((a, b) => b.deeds - a.deeds)[0];
const totalDeeds = rows.reduce((a, r) => a + r.deeds, 0);
const anySpread = rows.some(r => r.spread > 0);
const anyWorld = rows.some(r => r.figuresTracked > 0);

console.log("\n  THE WORLD SIDE — figure records these saves carry:\n");
console.log(`  ${pad("character", 34)} ${rpad("figures", 7)} ${rpad("fig.deeds", 9)} ${rpad("promoted", 8)} ${rpad("deaths", 6)}`);
for (const r of rows.filter(r => r.figuresTracked || r.deaths).sort((a, b) => b.figuresTracked - a.figuresTracked)) {
  console.log(`  ${pad(r.who.slice(0, 34), 34)} ${rpad(r.figuresTracked, 7)} ${rpad(r.figureDeeds, 9)} ${rpad(r.promoted, 8)} ${rpad(r.deaths, 6)}`);
}

console.log("\n  READING IT:\n");
console.log(`    · ${played.length} of ${rows.length} saves have any play recorded at all.`);
console.log(`    · deepest deed record: ${deepest ? `${deepest.deeds} deed(s) — ${deepest.who}` : "none"}.`);
console.log(`    · total deeds across every save in the tree: ${totalDeeds}.`);
console.log(`    · any deed has SPREAD to another community: ${anySpread ? "yes" : "NO"}.`);
console.log(`    · any save carries figure tenure (the world ran): ${anyWorld ? "yes" : "NO"}.`);

// The verdict Erik actually asked for.
console.log("");
if (totalDeeds < 10) {
  console.log("  ⚠️ VERDICT: THERE IS NO DEED HISTORY TO PROMOTE ANYONE ON.");
  console.log("     Not a tuning problem and not a migration problem either — the recording is too young for");
  console.log("     these saves to have used it. Every existing character starts rung-less and title-less");
  console.log("     because there is nothing recorded to rank them by, and a backfill has nothing to read.");
  console.log("     The ladder will only ever describe play that happens FROM NOW ON.");
} else {
  console.log("  VERDICT: there is a deed record to work from; see the deepest row for what a real career looks like.");
}
console.log("\n  A REPORT — reads saves, writes nothing.");
