// Which durable-record ops actually FIRE in a long playthrough? The scene-driving ops obviously do
// (the game is playable). The question is whether the ops whose only job is to RECORD a relationship
// are systematically skipped — because narration succeeds without them, so nothing complains.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
const R = join(dirname(new URL(import.meta.url).pathname.slice(1)), "..");
let best = null;
for (const p of readdirSync(join(R, "characters"))) {
  const d = join(R, "characters", p);
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d)) { try { const c = JSON.parse(readFileSync(join(d, f), "utf8")); if (!best || (c.level || 0) > (best.level || 0)) best = c; } catch { } }
}
const n = o => Object.keys(o || {}).length;
const rows = [
  ["npcUpdates", "npcRegistry entries", n(best.npcRegistry)],
  ["placeUpdates", "placeMemory places", n(best.placeMemory)],
  ["codexUpdates", "codex topics", n(best.codex?.topics)],
  ["factUpdates", "establishedFacts", (best.establishedFacts || []).length],
  ["deeds", "deeds recorded", (best.deeds || []).length],
  ["itemUpdates", "inventory items", (best.inventory || []).length],
  ["questUpdates", "quests", (best.quests || []).length],
  ["discovery", "discoveries", (best.discoveries || []).length],
  ["markTeacher", "teachers bound", n(best.teachers)],
  ["markDefiningMoment", "defining moments", (best.definingMoments || best.chronicle || []).length && (best.definingMoments || []).length],
];
console.log(`${best.name}, level ${best.level} — evidence that each durable op has EVER fired:\n`);
for (const [op, what, count] of rows) {
  const flag = count === 0 ? "   <-- NEVER FIRED" : "";
  console.log(`  ${op.padEnd(20)} ${String(count).padStart(4)}  ${what}${flag}`);
}
console.log(`\nchronicle entries: ${(best.chronicle || []).length}  (the scenes these ops had the chance to fire in)`);
