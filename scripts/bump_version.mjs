// scripts/bump_version.mjs — SNG-274: the version moves, and it moves in ONE step.
//
// Erik: "the game has also sat at version 1.8.330 for a long time… none of this is bumping the game version
// (which itself is stuck incrementing in 1.8.xxx)."
//
// Both halves of that are true and they have different causes:
//
//  1. IT STOPPED MOVING because bumping was a HAND-EDIT IN TWO FILES — `APP_VERSION` in app.js and every
//     `?v=` cache stamp in index.html — with nothing anywhere asking for it. The wiring audit checks the two
//     agree, which is a CONSISTENCY check, not a FRESHNESS one: both going stale together stays green
//     forever. The version last moved 2026-08-01 and every commit since has been green.
//
//  2. IT NEVER LEAVES 1.8.x because the rule for the minor roll lives in SPEC §25.7 as prose. It is PM-
//     approved, it names its own trigger, and it even says "both bumps are CCode actions taken on this
//     standing approval" — an instruction addressed to the engine builder that no engine could read.
//     ~180 point releases under a line the spec itself says "no longer signals scale."
//
// ⛔ CCODE-438 — AND NOW THE RULE DECIDES, and the notes move with it (Erik: "Set something that will tell us when we go to 2.1.0
// and 3.0.0 etc as the rule that we can follow"). The rule is `scripts/version_rule.mjs`: patch every update; minor on the update
// that brings the fifth new feature since the minor last moved; major only by Erik's call, with the reason in words. And every
// update says what it did for players: the entries waiting in `release_notes.json` → `next` move under the version cut here.
//
// Usage:  node scripts/bump_version.mjs                     → what the rule says (patch, or minor on the fifth feature)
//         node scripts/bump_version.mjs --major "<why>"     → X+1.0.0 — Erik's call, for a change that makes the game a different game
//         node scripts/bump_version.mjs --set 2.1.0         → exactly this, for a milestone cut the rule did not make
//         node scripts/bump_version.mjs --no-notes          → an update with nothing for players (recorded as internal, never shown)
//         node scripts/bump_version.mjs --check             → the current version, the notes waiting, and what the rule would cut

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { decideBump, featuresSinceMinor, entryProblem } from "./version_rule.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(root, "app.js");
const INDEX = join(root, "index.html");
const NOTES = join(root, "release_notes.json");

const read = (p) => readFileSync(p, "utf8");
const current = () => read(APP).match(/const APP_VERSION = "([^"]+)"/)?.[1] || null;

const argv = process.argv.slice(2);
const now = current();
if (!now) { console.error("could not find APP_VERSION in app.js"); process.exit(1); }

const notes = JSON.parse(read(NOTES));
notes.next = Array.isArray(notes.next) ? notes.next : [];
notes.releases = Array.isArray(notes.releases) ? notes.releases : [];
const majorIdx = argv.indexOf("--major");
const decided = decideBump(now, notes, { major: majorIdx !== -1 ? (argv[majorIdx + 1] || "") : null });

if (argv.includes("--check")) {
  console.log(now);
  console.log(`  notes waiting: ${notes.next.length} (${notes.next.map(e => `${e.kind}: ${e.title}`).join("; ") || "none"})`);
  console.log(`  the rule would cut: ${decided.error ? decided.error : `${decided.version} — ${decided.why}`}`);
  process.exit(0);
}

// ⛔ AN UPDATE SAYS WHAT IT DID FOR PLAYERS, or says it did nothing they will meet — never silence
if (!notes.next.length) {
  if (!argv.includes("--no-notes")) {
    console.error("release_notes.json has nothing in `next` — say what this update did for players (kind feature | fix | change),\n"
      + "  or run with --no-notes for an update no player will meet (it is recorded as internal and never shown).");
    process.exit(1);
  }
  notes.next = [{ kind: "internal", title: "Maintenance", summary: "" }];
}
const bad = notes.next.map(entryProblem).filter(Boolean);
if (bad.length) { console.error(`release_notes.json \`next\` is not fit for a player: ${bad.join("; ")}`); process.exit(1); }

const setIdx = argv.indexOf("--set");
let next, why;
if (setIdx !== -1) {
  next = argv[setIdx + 1];
  if (!/^\d+\.\d+\.\d+$/.test(next || "")) { console.error("--set needs a MAJOR.MINOR.PATCH version"); process.exit(1); }
  why = `set by hand (the rule would have cut ${decided.version || "?"})`;
} else if (["patch", "minor", "major"].includes(argv[0])) {
  console.error(`the rule decides the bump now — run with no kind (it says ${decided.version || decided.error}), --major "<why>" for Erik's call, or --set X.Y.Z for a milestone`);
  process.exit(1);
} else {
  if (decided.error) { console.error(decided.error); process.exit(1); }
  next = decided.version; why = decided.why;
}

if (next === now) { console.log(`already at ${now} — nothing to do`); process.exit(0); }

// ⛔ CCODE-438 — the notes waiting move under the version this cuts, newest first, and `next` empties
notes.releases.unshift({ version: next, date: new Date().toISOString().slice(0, 10), ...(majorIdx !== -1 ? { majorWhy: decided.why } : {}), entries: notes.next });
notes.next = [];
writeFileSync(NOTES, `${JSON.stringify(notes, null, 2)}\n`, "utf8");

// ⚠️ BOTH FILES, ALWAYS. app.js's constant names the running build in every feedback report; index.html's
// `?v=` busts the browser cache. Moving one without the other ships a build that reports a version it is not
// running, or a version bump nobody's browser ever fetches — which is how a stale label survived five ships.
const appNext = read(APP).replace(/const APP_VERSION = "[^"]+"/, `const APP_VERSION = "${next}"`);
writeFileSync(APP, appNext, "utf8");

const idxSrc = read(INDEX);
const stamps = [...idxSrc.matchAll(/\?v=([0-9.]+)/g)].map(m => m[1]);
writeFileSync(INDEX, idxSrc.replace(/\?v=[0-9.]+/g, `?v=${next}`), "utf8");

// ⛔ 2026-09-12 — AND THE THIRD FILE, which is now the SOURCE the other two are checked against:
// `engine/version.js`. It exists because `state.js` loads the whole content pack and cannot reach a const
// declared in app.js, so every authored file was fetched unversioned and a browser served them from cache —
// a new app.js reading last release's rules and signals. ⚠️ Leaving it out here would be the very
// two-files-kept-in-step-by-hand defect this script was written to end, one file wider.
const VERSION_MOD = join(root, "engine", "version.js");
writeFileSync(VERSION_MOD, read(VERSION_MOD).replace(/export const APP_VERSION = "[^"]+"/, `export const APP_VERSION = "${next}"`), "utf8");

// ⛔ CCODE-394 (Erik: "any browser running the game would have an auto reload on next action… minimize the risk of having an old
// version written") — AND THE FOURTH FILE, the only one a RUNNING TAB can read: `version.json`. A tab knows its own build from
// `engine/version.js`, baked in when it loaded; it cannot know what is deployed without asking, and this is what it asks.
// ⚠️ Written by the bump and nowhere else, so it cannot drift from the three files above.
const BUILD_JSON = join(root, "version.json");
writeFileSync(BUILD_JSON, `${JSON.stringify({ version: next, at: new Date().toISOString().slice(0, 10) }, null, 2)}\n`, "utf8");

console.log(`${now} → ${next}   (app.js + engine/version.js + version.json + ${stamps.length} cache stamp${stamps.length === 1 ? "" : "s"} in index.html + release_notes.json)`);
console.log(`  why: ${why}`);
if (!argv.includes("--set") && decided.kind !== "minor") console.log(`  ${featuresSinceMinor(next, notes)} of ${decided.minorAt} new features toward ${next.split(".")[0]}.${Number(next.split(".")[1]) + 1}.0`);
console.log(`  run: node scripts/module_map.mjs   (it re-pins the ${stamps.length > 1 ? "import map" : "modules"} and fails if the three disagree)`);
