// tests/wiring_shape.mjs — SNG-303: the wiring is checkable, so it does not have to be remembered.
//
// Erik: *"seems like the ways to wire code correctly needs to be documented and followed."*
//
// The same six lines of content wiring have now failed THREE distinct ways:
//
//   1. NOT REGISTERED    — `rules/encounters.json` existed for weeks; the manifest never listed it, so
//                          `CONTENT.rules.encounters` was undefined and every encounter paid ZERO XP.
//   2. REGISTERED, NOT LOADED — `rules/economy.json` was whitelisted and reached nothing. (Aevi caught this
//                          one herself, with the check, in under a minute.)
//   3. LOADED INTO THE WRONG ARRAY — `economyRule` was destructured from the FIRST `Promise.all` while
//                          `loadRule("economy")` was added to the SECOND. The name resolved to `undefined`
//                          and the merge silently did nothing. Every prose check passed.
//
// ⚠️ THE THIRD IS THE ONE PROSE CANNOT PREVENT, because positional destructuring has no names in it: the
// array and the name list are matched by COUNTING, and nothing in the source says so. I made the same mistake
// myself earlier, appending `loadRule("encounters")` to an array without adding a name — it took
// `coliseumGrid`'s slot and pushed the grid off the end, with a green suite.
//
// So this checks the SHAPE rather than the intent: in every `const [...] = await Promise.all([...])`, the
// number of destructured names must equal the number of array entries. A mismatch is exactly what "added an
// entry over here and a name over there" produces, and it cannot be argued with.
//
// ⛔ NOT CHECKED HERE, deliberately: whether each name is bound to the RIGHT entry. Nothing in the source
// records the intended pairing, so any such check would be guessing. The count is the part that is knowable,
// and it is the part that catches the real bug.
//
// Run: node tests/wiring_shape.mjs   (also runs inside npm test via smoke)

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 1-based line number of the end of `prefix`. */
function countLines(prefix) {
  let n = 1;
  for (const ch of prefix) if (ch === "\n") n++;
  return n;
}

/** Split a destructuring list on top-level commas, so `{ a, b }` and `[x, y]` count as ONE name each. */
function splitNames(src) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of src) {
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

/** ⚠️ STRIP COMMENTS FIRST. These arrays are heavily commented and the comments contain commas — my first
 *  version counted comment fragments as entries and reported both blocks mismatched, which was the CHECKER
 *  being wrong, not the code. A measuring tool that fires on correct input teaches people to ignore it. */
function stripComments(src) {
  let out = "", i = 0, inStr = null;
  while (i < src.length) {
    const ch = src[i], nx = src[i + 1];
    if (inStr) { out += ch; if (ch === inStr && src[i - 1] !== "\\") inStr = null; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; out += ch; i++; continue; }
    // ⚠️ EMIT A NEWLINE FOR EVERY LINE SWALLOWED, so line numbers survive the strip. Without that, the
    //    reported line was 40-odd rows off and the message pointed at innocent code.
    if (ch === "/" && nx === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (ch === "/" && nx === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") out += "\n"; i++; }
      i += 2; continue;
    }
    out += ch; i++;
  }
  return out;
}

/** Split the Promise.all argument list on top-level commas — each element is one awaited entry. */
function splitEntries(rawSrc) {
  const src = stripComments(rawSrc);
  const out = [];
  let depth = 0, cur = "", inStr = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) { cur += ch; if (ch === inStr && src[i - 1] !== "\\") inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; cur += ch; continue; }
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

/** ⚠️ TAKES SOURCE, NOT A PATH, so the checker itself can be FALSIFIED — smoke feeds it a snippet with a
 *  known mismatch and asserts it goes red. A checker that has never been shown to fail is a green light with
 *  nothing behind it; that is the exact failure this whole file exists to prevent. */
export function shapesOfSource(raw) {
  // ⚠️ SCAN THE COMMENT-FREE COPY. These arrays are heavily annotated, and a single `[` inside a comment
  //    opened a bracket depth that never closed — the forward walk ran off the end of the file and reported
  //    71 entries against 22 names. Stripping first (newlines preserved) makes the brackets mean what they say.
  const src = stripComments(raw);
  const shapes = [];
  // ⚠️ FIND THE `Promise.all([` FIRST, THEN WALK BACKWARD to the destructuring bracket. A forward regex
  //    like /const \[([\s\S]*?)\] = await Promise.all\(\[/ matches `for (const [k, l] of …)` thirty lines
  //    earlier and swallows everything between — my first version reported 5 names against 22 entries on a
  //    block that is perfectly fine. Anchoring on the unambiguous token and reading outward cannot do that.
  const NEEDLE = "= await Promise.all([";
  let at = 0;
  while ((at = src.indexOf(NEEDLE, at)) !== -1) {
    // backward: the `]` immediately before, then its matching `[`
    let k = at - 1;
    while (k >= 0 && /\s/.test(src[k])) k--;
    if (src[k] !== "]") { at += NEEDLE.length; continue; }
    const close = k;
    let depth = 0, open = -1;
    for (let x = close; x >= 0; x--) {
      if (src[x] === "]") depth++;
      else if (src[x] === "[") { depth--; if (!depth) { open = x; break; } }
    }
    if (open < 0) { at += NEEDLE.length; continue; }
    const names = splitNames(stripComments(src.slice(open + 1, close)));
    // forward: from `([` to its matching `])`, skipping brackets that live inside strings
    let y = at + NEEDLE.length, d = 1, body = "", str = null;
    while (y < src.length && d > 0) {
      const ch = src[y];
      if (str) { if (ch === str && src[y - 1] !== "\\") str = null; }
      else if (ch === '"' || ch === "'" || ch === "`") str = ch;
      else if (ch === "[") d++;
      else if (ch === "]") { d--; if (!d) break; }
      body += ch; y++;
    }
    const entries = splitEntries(body);
    shapes.push({
      line: countLines(src.slice(0, open)),
      names: names.length, entries: entries.length,
      sampleName: names[names.length - 1], sampleEntry: entries[entries.length - 1]?.slice(0, 48),
    });
    at = y;
  }
  return shapes;
}

export function promiseAllShapes(file = "engine/state.js") {
  return shapesOfSource(readFileSync(join(root, file), "utf8")).map(s => ({ ...s, file }));
}

/** Every engine module, because positional destructuring is not a content-loading problem — it is a JS
 *  problem, and `state.js` is only where it has bitten us so far. */
export function scanEngine() {
  const dir = join(root, "engine");
  const files = readdirSync(dir).filter(f => f.endsWith(".js")).sort();
  return files.flatMap(f => promiseAllShapes(`engine/${f}`));
}

// ── run standalone ────────────────────────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("wiring_shape.mjs")) {
  const shapes = scanEngine();
  console.log("WIRING SHAPE (SNG-303) — destructured names must pair 1:1 with awaited entries\n");
  let bad = 0;
  for (const s of shapes) {
    const ok = s.names === s.entries;
    if (!ok) bad++;
    console.log(`  ${s.file.replace("engine/", "")}:${String(s.line).padStart(4)}  ${String(s.names).padStart(3)} names / ${String(s.entries).padStart(3)} entries  ${ok ? "ok" : "⚠️ MISMATCH"}`);
    if (!ok) console.log(`      last name: ${s.sampleName}\n      last entry: ${s.sampleEntry}`);
  }
  console.log(bad ? `\n${bad} MISMATCH(ES) — a name and its entry are in different arrays.` : "\nAll Promise.all blocks pair cleanly.");
  process.exit(bad ? 1 : 0);
}
