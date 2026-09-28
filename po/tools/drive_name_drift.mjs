// ⛑ DRIVE THE CORRECTOR ON THE REAL SAVE AND THE REAL DRIFT — and, just as importantly, on the cases it must REFUSE.
// Loki knows two Vessins; a corrector that rewrote every near-miss would merge people. Nothing is written here.
import { readFileSync, readdirSync } from "node:fs";
const N = await import("../../engine/npcs.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();

const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const vocab = N.knownNameWords(ch, { content: C });
console.log(`\nLoki's name vocabulary: ${vocab.size} word(s). Words more than one person answers to (the ambiguous ones, never corrected):`);
for (const [w, who] of vocab) if (who.size > 1) console.log(`   "${w}" → ${who.size} different people: ${[...who].join(" / ")}`);

// ── 1 · the real drift, from the real save
const drifted = ch.activeScene?.turns?.[0]?.narration || "";
const r = N.correctKnownNames(drifted, ch, { content: C, introduced: (ch.activeScene?.lastTurn?.npcUpdates || []).map(u => u?.name) });
console.log(`\n1 · THE REAL BEAT (activeScene.turns[0].narration):`);
console.log(`   fixed: ${JSON.stringify(r.fixed)}`);
const i = r.text.indexOf("Coil");
console.log(`   before: …${drifted.slice(Math.max(0, i - 24), i + 6)}…`);
console.log(`   after:  …${r.text.slice(Math.max(0, i - 24), i + 6)}…`);
console.log(`   the rest of the prose is untouched: ${r.text.length === drifted.length - 1 ? "yes (one character shorter, exactly the f)" : "⛔ NO — length moved by " + (r.text.length - drifted.length)}`);

// ── 2 · the refusals, which are the whole design
const cases = [
  ["a name this turn is MINTING", "Vestin came down the road.", ["Vestin Aro"]],
  ["a word one letter from TWO known names", "The Vessin waited.", []],
  ["an ordinary word that happens to be near a name", "The Taken stood in the doorway.", []],
  ["a name spelled correctly", "Halvex Coil poured the coffee.", []],
  ["a short word", "Then Cy spoke.", []],
];
console.log(`\n2 · WHAT IT REFUSES TO TOUCH:`);
for (const [why, text, introduced] of cases) {
  const c = N.correctKnownNames(text, ch, { content: C, introduced });
  const changed = c.text !== text;
  console.log(`   ${changed ? "⛔ CHANGED" : "ok  left alone"}  ${why}`);
  if (changed) console.log(`        "${text}" → "${c.text}"  ${JSON.stringify(c.fixed)}`);
}

// ── 3 · what it WOULD fix across every save's live scene window (the only prose the GM reads back)
console.log("\n3 · ACROSS EVERY SAVE'S LIVE SCENE WINDOW — the prose gm.js feeds back:");
let saves = 0, withDrift = 0, total = 0;
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) {
    if (!f.endsWith(".json")) continue;
    let c; try { c = JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8")); } catch { continue; }
    saves++;
    const v = N.knownNameWords(c, { content: C });
    const mint = (c.activeScene?.lastTurn?.npcUpdates || []).map(u => u?.name);
    const hits = [];
    for (const t of (c.activeScene?.turns || [])) {
      const g = N.correctKnownNames(t?.narration || "", c, { content: C, introduced: mint, vocab: v });
      hits.push(...g.fixed);
    }
    const lt = N.correctKnownNames(c.activeScene?.lastTurn?.narration || "", c, { content: C, introduced: mint, vocab: v });
    hits.push(...lt.fixed);
    if (!hits.length) continue;
    withDrift++; total += hits.length;
    console.log(`   ${c.name}: ${hits.map(h => `"${h.was}" → "${h.now}" (${h.person})`).join(", ")}`);
  }
}
console.log(`\n   ${total} slip(s) in the live scene window across ${withDrift} of ${saves} saves.`);
