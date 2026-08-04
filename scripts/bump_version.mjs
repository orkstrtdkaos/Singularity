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
// Usage:  node scripts/bump_version.mjs                → patch (1.9.0 → 1.9.1)
//         node scripts/bump_version.mjs minor          → 1.9.4 → 1.10.0
//         node scripts/bump_version.mjs major          → 1.9.4 → 2.0.0
//         node scripts/bump_version.mjs --set 1.9.0    → exactly this, for a milestone cut
//         node scripts/bump_version.mjs --check        → print the current version, change nothing

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(root, "app.js");
const INDEX = join(root, "index.html");

const read = (p) => readFileSync(p, "utf8");
const current = () => read(APP).match(/const APP_VERSION = "([^"]+)"/)?.[1] || null;

const argv = process.argv.slice(2);
const now = current();
if (!now) { console.error("could not find APP_VERSION in app.js"); process.exit(1); }

if (argv.includes("--check")) { console.log(now); process.exit(0); }

const setIdx = argv.indexOf("--set");
let next;
if (setIdx !== -1) {
  next = argv[setIdx + 1];
  if (!/^\d+\.\d+\.\d+$/.test(next || "")) { console.error("--set needs a MAJOR.MINOR.PATCH version"); process.exit(1); }
} else {
  const kind = argv[0] || "patch";
  const [maj, min, pat] = now.split(".").map(Number);
  if (kind === "major") next = `${maj + 1}.0.0`;
  else if (kind === "minor") next = `${maj}.${min + 1}.0`;
  else if (kind === "patch") next = `${maj}.${min}.${pat + 1}`;
  else { console.error(`unknown bump kind "${kind}" — use patch | minor | major | --set X.Y.Z`); process.exit(1); }
}

if (next === now) { console.log(`already at ${now} — nothing to do`); process.exit(0); }

// ⚠️ BOTH FILES, ALWAYS. app.js's constant names the running build in every feedback report; index.html's
// `?v=` busts the browser cache. Moving one without the other ships a build that reports a version it is not
// running, or a version bump nobody's browser ever fetches — which is how a stale label survived five ships.
const appNext = read(APP).replace(/const APP_VERSION = "[^"]+"/, `const APP_VERSION = "${next}"`);
writeFileSync(APP, appNext, "utf8");

const idxSrc = read(INDEX);
const stamps = [...idxSrc.matchAll(/\?v=([0-9.]+)/g)].map(m => m[1]);
writeFileSync(INDEX, idxSrc.replace(/\?v=[0-9.]+/g, `?v=${next}`), "utf8");

console.log(`${now} → ${next}   (app.js + ${stamps.length} cache stamp${stamps.length === 1 ? "" : "s"} in index.html)`);
