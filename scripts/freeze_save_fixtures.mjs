// scripts/freeze_save_fixtures.mjs — ⛔ CCODE-527. A GATE MAY NOT READ A SAVE SOMEBODY IS PLAYING.
//
// ⛔ AEVI, BLOCKED BY IT: "a test broke in the last hour, and it now blocks every push that isn't a save,
// CCode's included. The nemesis check (§360) loads Silas's live save and assumes his nemesis hasn't been
// chosen yet. You chose it in play, so the check now fails. It's a test reading a live save, which CCode
// ruled out on 09-12. The fix is CCode's."
//
// ⚠️ SHE NAMED ONE AND THERE WERE ELEVEN, across §188, §190, §300, §310 and §360; `how_it_works.mjs` read a
// live save 38 times, 32 of them Silas's. Not one of the eleven is wrong about the engine. They are right
// about a world that moved under them — and a gate that reddens because the game was played correctly teaches
// everybody to re-baseline past it. §115 and §188 had each already been bitten once and written it down.
//
// ⛑ THE CLAIMS ARE ABOUT REAL PLAYED HISTORY, so the history is frozen rather than the claims weakened. A
// frozen save is still a real save — 1,788 turns of it — and it holds still while the suite reads it.
//
// ⛔ AND IT FREEZES FROM A COMMIT, NOT FROM THE WORKING TREE. My first run copied today's saves, which is a
// newer photograph of exactly the drift that broke the gates; they stayed red. `--from <rev>` takes the saves
// as they stood when the claims were written.
//
//   node scripts/freeze_save_fixtures.mjs --from a282ba430   # the state the current gates were written against
//   node scripts/freeze_save_fixtures.mjs                    # the working tree, when a gate SHOULD move on
//
// ⛑ `save_fixtures.mjs` STILL READS THE LIVE SAVES and it is the only suite that should: proving the real
// saves still load is its entire job, and it asserts nothing about what is IN them.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "tests", "fixtures", "saves");
const HOW = join(root, "tests", "how_it_works.mjs");
const FROM = (() => { const i = process.argv.indexOf("--from"); return i > 0 ? process.argv[i + 1] : null; })();

// ⛑ THE LIST IS DERIVED FROM WHAT THE GATES ACTUALLY READ, never typed: a save a gate starts reading tomorrow
// is frozen by the next run without anybody remembering to add it.
// ⚠️ Matched on the `savedSave(…)` CALL, not on the path anywhere in the file — my first cut matched the path
// and warned about `char-usnea.json`, which is a string in a sync test and not a file anybody opens.
const src = readFileSync(HOW, "utf8");
const wanted = [...new Set([...src.matchAll(/savedSave\("([a-z0-9-]+)\/(char-[a-z0-9]+\.json)"\)/g)].map(m => `${m[1]}/${m[2]}`))].sort();

mkdirSync(OUT, { recursive: true });
let wrote = 0;
const missing = [];
for (const rel of wanted) {
  const to = join(OUT, rel.replace("/", "__"));
  let raw = null;
  if (FROM) {
    try { raw = execFileSync("git", ["show", `${FROM}:characters/${rel}`], { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 }); }
    catch { missing.push(`${rel} (not in ${FROM})`); continue; }
  } else {
    const from = join(root, "characters", rel);
    if (!existsSync(from)) { missing.push(rel); continue; }
    raw = readFileSync(from, "utf8");
  }
  // ⚠️ RE-SERIALISED, NOT COPIED BYTE FOR BYTE: a save on disk carries the app's own formatting, and a fixture
  // whose shape changes when the app's writer changes is a diff nobody can read.
  writeFileSync(to, JSON.stringify(JSON.parse(raw), null, 1) + "\n");
  wrote++;
}
console.log(`frozen: ${wrote} save fixture(s) under tests/fixtures/saves — from ${FROM || "the working tree"}`);
for (const m of missing) console.log(`  ⚠️ a gate reads ${m} and it could not be read`);
