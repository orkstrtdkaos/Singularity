// scripts/audit_images.mjs — SNG-435 §A4: how many stored pictures are already burned?
//
// ⛔ AEVI MEASURED THE BUG AND THIS COUNTS THE DAMAGE. A rate-limited Pollinations request answers HTTP 200
// with a ZERO-BYTE body; Cloudflare caches that under the canonical URL as `immutable, max-age=31536000` and
// serves it with `x-cache: HIT`, byte-identical in headers to a healthy hit. Persist-once plus a
// deterministic URL then makes it permanent. Nobody knows how many shipped records hold one.
//
// ⛔ REPORT ONLY. THIS SCRIPT WRITES NOTHING TO ANY SAVE. Erik and Aevi set the re-mint scope from the
// count; a script that both measures and repairs would have decided that for them.
//
// ⚠️ AND IT MUST NOT POISON WHAT IT IS AUDITING — Aevi's own warning, and she has already done it once by
// firing eight requests at once. Two defences, and the second is the one that matters:
//
//   1. SEQUENTIAL, SPACED. One request at a time, `--delay` ms apart (default 2000).
//   2. ⛔ IT NEVER CAUSES A GENERATION. `HEAD` reports no `content-length` here (measured: null), so size
//      needs a GET — but a GET against an entry Cloudflare already holds is served from cache and never
//      reaches the generator, so it cannot consume rate limit and cannot burn anything. So: HEAD first,
//      read `x-cache`, and GET **only on HIT**. Anything not already cached is reported as `unknown`
//      rather than fetched. A poisoned entry is by definition cached, so the population that can be
//      checked safely is exactly the population that matters.
//
// ⚠️ AND IT STOPS IF IT LOOKS LIKE THE STORM. If the early sample comes back mostly empty, the likeliest
// explanation is that WE are the rate limit, not that half the world is burned — so it halts and says so
// rather than producing a confident wrong number.
//
// Run: node scripts/audit_images.mjs [--delay 2000] [--limit N] [--out path.json]

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const DELAY = Number(arg("delay", 2000));
const LIMIT = Number(arg("limit", 0)) || Infinity;
const OUT = arg("out", "");
const MIN_BYTES = 1000;                 // the runtime's floor, from engine/art.js
const SAMPLE = 12, SAMPLE_ALARM = 6;    // ⚠️ 6 of the first 12 empty is a storm, not a finding

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- collect every persisted image URL, and WHERE it is stored ----------
const files = [];
const walkDir = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walkDir(p);
    else if (e.name.endsWith(".json")) files.push(p);
  }
};
try { walkDir(join(root, "characters")); } catch { /* no saves on this machine */ }

const IS_IMG = (v) => typeof v === "string" && v.includes("image.pollinations.ai");
const where = new Map();      // url -> [ "file :: a.b.c", … ]
const collect = (o, file, path, seen) => {
  if (!o || typeof o !== "object" || seen.has(o)) return;
  seen.add(o);
  for (const [k, v] of Object.entries(o)) {
    const at = path ? `${path}.${k}` : k;
    if (IS_IMG(v)) { if (!where.has(v)) where.set(v, []); where.get(v).push(`${file} :: ${at}`); }
    else if (v && typeof v === "object") collect(v, file, at, seen);
  }
};
for (const f of files) {
  try { collect(JSON.parse(readFileSync(f, "utf8")), relative(root, f).replace(/\\/g, "/"), "", new Set()); }
  catch { /* an unreadable save is not this script's problem */ }
}

const urls = [...where.keys()].slice(0, LIMIT);
console.log(`saves scanned      : ${files.length}`);
console.log(`unique image urls  : ${where.size}${urls.length < where.size ? ` (checking ${urls.length})` : ""}`);
console.log(`references to them : ${[...where.values()].reduce((n, a) => n + a.length, 0)}`);
console.log(`delay              : ${DELAY}ms, sequential, GET only on a cache HIT\n`);

// ---------- check ----------
const rows = [];
const tally = { ok: 0, empty: 0, unknown: 0 };
let stopped = null;

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  let row = { url, verdict: "unknown", why: "", bytes: null, at: where.get(url) };
  try {
    const head = await fetch(url, { method: "HEAD" });
    const cache = head.headers.get("x-cache") || "";
    if (!head.ok) { row.why = `http ${head.status}`; }
    else if (!/HIT/i.test(cache)) {
      // ⛔ NOT CACHED — checking it would mean generating it, and generating 200 pictures to find out
      // whether they exist is how the audit becomes the outage.
      row.why = `not cached (x-cache: ${cache || "absent"}) — not fetched`;
    } else {
      const res = await fetch(url);
      if (!res.ok) row.why = `http ${res.status}`;
      else {
        const blob = await res.blob();
        row.bytes = blob.size;
        row.verdict = blob.size < MIN_BYTES ? "empty" : "ok";
        row.why = `${blob.size} bytes`;
      }
    }
  } catch (e) { row.why = e?.message || "fetch failed"; }

  tally[row.verdict]++;
  rows.push(row);
  const mark = row.verdict === "empty" ? "BURNED " : row.verdict === "ok" ? "ok     " : "unknown";
  console.log(`${String(i + 1).padStart(4)}/${urls.length}  ${mark} ${row.why.padEnd(34)} ${row.at[0].slice(0, 70)}`);

  // ⚠️ THE STORM CHECK. A high early empty-rate is far more likely to be this script being rate-limited
  // than half a save being burned — and continuing would produce a confident wrong number.
  if (rows.length === SAMPLE && tally.empty >= SAMPLE_ALARM) {
    stopped = `halted after ${SAMPLE}: ${tally.empty} empty is the signature of THIS SCRIPT being rate-limited, not a finding. Re-run with --delay 10000.`;
    break;
  }
  if (i < urls.length - 1) await sleep(DELAY);
}

// ---------- report ----------
console.log(`\n${"—".repeat(78)}`);
if (stopped) console.log(`⛔ ${stopped}\n`);
console.log(`checked : ${rows.length}`);
console.log(`  ok      ${tally.ok}`);
console.log(`  BURNED  ${tally.empty}   (200 with < ${MIN_BYTES} bytes — cached empty, unrecoverable at this URL)`);
console.log(`  unknown ${tally.unknown}   (not in cache, or the request did not complete — NOT evidence of anything)`);

const burned = rows.filter(r => r.verdict === "empty");
if (burned.length) {
  console.log(`\nburned, and where they are stored:`);
  for (const b of burned) for (const at of b.at) console.log(`  ${at}`);
}
if (OUT) {
  writeFileSync(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), tally, stopped, rows }, null, 1));
  console.log(`\nwrote ${OUT}`);
}
console.log(`\n⛔ NOTHING WAS WRITTEN TO ANY SAVE. Re-mint scope is Erik's and Aevi's call from these numbers.`);
