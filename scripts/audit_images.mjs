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
//   1. SEQUENTIAL, SPACED. One request at a time, `--delay` ms apart (default 10000).
//   2. ⛔ ONE CONTACT PER URL, AND IT IS A GET.
//
// ⛔ MY FIRST VERSION OF THIS SCRIPT WAS WRONG IN THE EXACT PLACE IT CLAIMED TO BE SAFE, AND IT
// PROBABLY BURNED TWO OF ERIK'S PICTURES. It reasoned: `HEAD` first, read `x-cache`, and GET only on a
// HIT, because a cached read never reaches the generator. The GET half of that is true. The HEAD half is
// NOT: measured directly on a URL nobody had ever requested —
//
//     HEAD #1  200  x-cache: MISS
//     HEAD #2  200  x-cache: HIT      ← the first HEAD generated the image
//     GET      200  16,272 bytes
//
// ⚠️ A BARE HEAD ON AN UNCACHED URL CAUSES A GENERATION. So the "safe" probe was doing precisely what
// it was written to avoid, and the two URLs the first full run reported as burned are the same two a
// twelve-URL trial had reported as MISS ten minutes earlier. Two of two flipped from MISS to
// cached-and-empty between the runs. That is not proof, but it is the only explanation on offer, and
// reporting them as pre-existing damage would have been reporting my own footprint as a finding.
//
// ⛔ SO: NO HEAD, EVER. One GET per URL, and `x-cache` on the response ATTRIBUTES the result instead of
// leaving it ambiguous:
//     HIT  + under the floor  →  BURNED BEFORE THIS RUN. The finding.
//     MISS + under the floor  →  BURNED BY THIS RUN — we generated it and the endpoint answered empty,
//                                which is a live rate-limit signal. The run HALTS.
//     MISS + real bytes       →  fine. It was evicted; we have restored it.
//
// ⚠️ THE INVASIVENESS CANNOT BE DESIGNED AWAY, only owned. There is no way to ask whether a URL is
// cached without making a request, and any request to an uncached URL generates. What CAN be done is to go
// slowly enough that the generation succeeds, and to say honestly which side of the line each result fell.
//
// Run: node scripts/audit_images.mjs [--delay 2000] [--limit N] [--out path.json]

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const DELAY = Number(arg("delay", 10000));
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

// ⛔ A `composedImages` KEY IS A SUPERSEDED ADDRESS, NOT A PICTURE. CCODE-193 records the composed
// re-mint against the URL it replaced, so those keys are the OLD address of something already swapped away
// from — nothing renders them. Checking them spends a request and, on an evicted one, a generation, for a
// picture no player can ever see. Four of the seven "burned" urls in the first clean run were exactly this.
// ⚠️ Only when a URL appears NOWHERE ELSE. The same address is often also a live gallery row.
const supersededOnly = (at) => at.every(a => /:: composedImages\./.test(a));
const skipped = [...where.keys()].filter(u => supersededOnly(where.get(u)));
for (const u of skipped) where.delete(u);
if (skipped.length) console.log(`skipping           : ${skipped.length} superseded composedImages key(s) — replaced addresses, rendered by nothing`);

const urls = [...where.keys()].slice(0, LIMIT);
console.log(`saves scanned      : ${files.length}`);
console.log(`unique image urls  : ${where.size}${urls.length < where.size ? ` (checking ${urls.length})` : ""}`);
console.log(`references to them : ${[...where.values()].reduce((n, a) => n + a.length, 0)}`);
console.log(`delay              : ${DELAY}ms, sequential, ONE GET per url (no HEAD — a HEAD on a miss generates)\n`);

// ---------- check ----------
const rows = [];
const tally = { ok: 0, empty: 0, "burned-now": 0, unknown: 0 };
let stopped = null;

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  let row = { url, verdict: "unknown", why: "", bytes: null, cache: "", at: where.get(url) };
  try {
    // ⛔ ONE CONTACT. No HEAD — see the header. `x-cache` on this response is what makes the verdict
    // attributable rather than merely true.
    const res = await fetch(url);
    row.cache = res.headers.get("x-cache") || "";
    if (!res.ok) row.why = `http ${res.status}`;
    else {
      const blob = await res.blob();
      row.bytes = blob.size;
      const cached = /HIT/i.test(row.cache);
      if (blob.size >= MIN_BYTES) { row.verdict = "ok"; row.why = `${blob.size} bytes${cached ? "" : " (regenerated — had been evicted)"}`; }
      else if (cached) { row.verdict = "empty"; row.why = `${blob.size} bytes, cached before this run`; }
      else { row.verdict = "burned-now"; row.why = `${blob.size} bytes on a MISS — THIS RUN generated it and got nothing`; }
    }
  } catch (e) { row.why = e?.message || "fetch failed"; }

  tally[row.verdict]++;
  rows.push(row);
  const mark = row.verdict === "empty" ? "BURNED " : row.verdict === "burned-now" ? "BY-US!!" : row.verdict === "ok" ? "ok     " : "unknown";
  console.log(`${String(i + 1).padStart(4)}/${urls.length}  ${mark} ${row.why.padEnd(34)} ${row.at[0].slice(0, 70)}`);

  // ⚠️ THE STORM CHECK. A high early empty-rate is far more likely to be this script being rate-limited
  // than half a save being burned — and continuing would produce a confident wrong number.
  // ⛔ HALT ON THE FIRST ONE WE CAUSED. A MISS that comes back empty means the endpoint is rate-limiting
  // US, right now, and every further request burns another of the player's pictures.
  if (row.verdict === "burned-now") {
    stopped = `halted at ${i + 1}: a MISS returned ${row.bytes} bytes — THIS RUN is being rate-limited and is burning urls. Wait, then re-run with a larger --delay.`;
    break;
  }
  if (rows.length === SAMPLE && tally.empty >= SAMPLE_ALARM) {
    stopped = `halted after ${SAMPLE}: ${tally.empty} empty is the signature of a storm, not a finding. Re-run with a larger --delay.`;
    break;
  }
  if (i < urls.length - 1) await sleep(DELAY);
}

// ---------- report ----------
console.log(`\n${"—".repeat(78)}`);
if (stopped) console.log(`⛔ ${stopped}\n`);
console.log(`checked : ${rows.length}`);
console.log(`  ok      ${tally.ok}`);
console.log(`  BURNED  ${tally.empty}   (200 with < ${MIN_BYTES} bytes on a CACHE HIT — burned before this run: the finding)`);
console.log(`  BY US   ${tally["burned-now"]}   (200 with < ${MIN_BYTES} bytes on a MISS — THIS RUN caused it; not evidence about the save)`);
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
