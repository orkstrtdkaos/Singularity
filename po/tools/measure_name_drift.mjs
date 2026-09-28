// ⛔ THE GM SPELLED ONE MAN'S NAME TWO WAYS IN ONE BEAT — Erik, 2026-09-28, with a screenshot: "Halvex" in the first
// paragraph and "Halfvex" in the last.
//
// ⛑ THE MECHANISM, FOUND BEFORE ANY FIX. In Loki's save "Halfvex" appears in exactly two places and they are the same
// text twice — `activeScene.turns[0].narration` and `activeScene.lastTurn.narration` (a copy of the latest turn). The
// correct "Halvex" appears 91 times, INCLUDING that same turn's `summary`, its `player` line and its choice labels. So
// the model drifted inside one generation, the drifted half was stored as narration, and the scene's turns go back into
// the prompt every beat — so the model now reads its own misspelling back and echoes it. A single drift became permanent.
//
// ⚠️ THIS TOOL ASKS THE POPULATION QUESTION FIRST: how many near-miss spellings of known people sit in stored narration
// across every save? A repair aimed at one name is a hand-patch; a rule needs to know how many it is for. It compares
// every capitalised word in stored prose against the registry's own names by edit distance, and reports only words that
// are CLOSE to a real name and are not that name and are not any other known word.
import { readFileSync, readdirSync } from "node:fs";

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) {
    try { saves.push({ who: `${d}/${f}`, ch: JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8")) }); } catch {}
  }
}

function dist(a, b) {                       // Levenshtein, small strings only
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// ⛑ every stored string in the save, with the path that holds it — so a hit names the field to repair
function strings(o, path, out) {
  if (!o || typeof o !== "object") return out;
  for (const [k, v] of Object.entries(o)) {
    const p = `${path}.${k}`;
    if (typeof v === "string") { if (v.length > 40) out.push([p, v]); }
    else if (v && typeof v === "object") strings(v, p, out);
  }
  return out;
}

let totalHits = 0, savesWith = 0, inNarration = 0;
const byField = {};
for (const { who, ch } of saves) {
  const reg = ch.npcRegistry || {};
  // the vocabulary of REAL name-words this character knows, so a hit is a word matching no real word
  const real = new Set();
  const nameWords = [];
  for (const p of Object.values(reg)) {
    for (const n of [p?.name, p?.trueName, ...(Array.isArray(p?.aliases) ? p.aliases : [])]) {
      if (typeof n !== "string") continue;
      for (const w of n.split(/[\s'’-]+/)) if (/^[A-Z][a-z]{3,}$/.test(w)) { real.add(w); nameWords.push({ w, person: p.name || p.id }); }
    }
  }
  const hits = [];
  for (const [path, s] of strings(ch, "save", [])) {
    for (const w of new Set(s.match(/\b[A-Z][a-z]{3,}\b/g) || [])) {
      if (real.has(w)) continue;
      for (const { w: rw, person } of nameWords) {
        if (w === rw) continue;
        // ⛔ A MISSPELLING, NOT A DIFFERENT WORD. My first cut took distance ≤2 with no prefix test and returned 616
        // hits, nearly all of them ordinary words ("Valen" against "Taken"). A drift of a proper noun is ONE character
        // off, opens the same way, and is RARE against a name the save uses constantly.
        const d = dist(w, rw);
        if (d !== 1) continue;
        let pre = 0; while (pre < w.length && pre < rw.length && w[pre] === rw[pre]) pre++;
        if (pre < 3 || Math.min(w.length, rw.length) < 5) continue;
        hits.push({ path, w, rw, person, d }); break;
      }
    }
  }
  if (!hits.length) continue;
  // ⛑ how often each spelling occurs in the WHOLE save — a drift is rare, a real name is everywhere
  const all = JSON.stringify(ch);
  const freq = (w) => (all.match(new RegExp(`\b${w}\b`, "g")) || []).length;
  for (const h of hits) { h.nWrong = freq(h.w); h.nRight = freq(h.rw); }
  const kept = hits.filter(h => h.nWrong <= h.nRight);
  if (!kept.length) continue;
  hits.length = 0; hits.push(...kept);
  savesWith++;
  totalHits += hits.length;
  console.log(`\n── ${ch.name} (${who}) — ${hits.length} near-miss spelling(s)`);
  for (const h of hits.slice(0, 12)) {
    const narr = /narration|sceneSummary|summary|chronicle/.test(h.path);
    if (narr) inNarration++;
    byField[h.path.replace(/\.\d+/g, "[]")] = (byField[h.path.replace(/\.\d+/g, "[]")] || 0) + 1;
    console.log(`   "${h.w}" ×${h.nWrong} vs "${h.rw}" ×${h.nRight} (${h.person})${narr ? "  ⛔ IN STORED PROSE" : ""}`);
    console.log(`      ${h.path}`);
  }
}
console.log(`\n${totalHits} near-miss spelling(s) across ${savesWith} of ${saves.length} saves; ${inNarration} of them in stored prose.`);
console.log("\nfields that hold them:");
for (const [f, n] of Object.entries(byField).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)} × ${f}`);
console.log("\n⛑ A field in `activeScene.turns[]` is the one that matters: the scene's turns go BACK into the prompt each");
console.log("   beat, so a drift stored there is read back and repeated. A drift in `chronicle` is a record, not an input.");
