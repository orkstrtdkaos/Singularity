// ⛑ ERIK 2026-09-29: *"we can choose a name and have them work the holding, or guard it… then we also have the jobs
// list below. These should probably be one and the same. In addition, the expansion work should be on the list too."*
//
// This prints the rows the card will draw, from the same readers it uses — so the list can be checked without the app,
// and so a row that silently has no people or no door shows up here.
import { readFileSync } from "node:fs";
const H = await import("../../engine/holdings.js");
const HW = await import("../../engine/holdwork.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };
const T = HW.workTable(C.rules?.holdWork || null);

const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const h = ch.holdings[0];
const nameOf = (id) => ch.npcRegistry?.[id]?.name || C.npcs?.[id]?.name || id;

console.log(`\n── ${h.name}: "Who does what here"\n`);
console.log("  job".padEnd(26) + "who is on it".padEnd(34) + "what it gives");
const row = (label, who, gain) => console.log("  " + label.slice(0, 24).padEnd(26) + (who || "—").slice(0, 32).padEnd(34) + (gain || ""));

const gD = C.rules?.economy?.holdStore?.growth || {};
row("Keeper", h.steward ? nameOf(h.steward) : "", h.steward ? `a rung every ${gD.passesPerClimb || 4} passes` : "it cannot climb unkept");
row("Hands", (h.crew || []).map(nameOf).join(", "), "");
const alsoWatch = [...((HW.workOf(h).guard) || []), ...((HW.workOf(h).patrol) || [])];
row("The watch", (h.garrison || []).map(nameOf).join(", "), alsoWatch.length ? `${alsoWatch.length} more from Guarding/Patrolling` : "");
for (const [k, K] of Object.entries(T.kinds)) {
  const ids = (HW.workOf(h)[k] || []).map(String);
  row(K.label, ids.map(nameOf).join(", "), ids.length ? `${ids.length} at it` : "");
}
const q = H.clearingQuote(h, cfg);
if (q.ok) row(q.label, h.clearing ? `${Math.round((h.clearing.progress || 0) * 100)}% done` : "", `${Object.entries(q.goods).map(([g, n]) => `${n} ${g}`).join(" + ")} · ~${q.passes} passes`);

console.log(`\n  ⛑ the three roles at the top used to be a person-picker with three buttons ABOVE this table;`);
console.log(`     the last row used to be on the Build tab. Each still writes where it always wrote.`);
console.log(`\n  ⚠️ the watch is fed from TWO places by design — \`garrison\` and the Guarding/Patrolling jobs both reach`);
console.log(`     \`workMods().watch\`, which is why Erik saw two controls for one thing.`);
