// Live GM turn test — calls the real Anthropic API (costs a few cents).
// Run: ANTHROPIC_API_KEY=... node tests/live_gm.mjs
// Proves: prompt assembly → Sonnet → structured turn JSON parses and validates.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// stub browser localStorage so engine/claude.js works in Node
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
if (!process.env.ANTHROPIC_API_KEY) { console.error("Set ANTHROPIC_API_KEY"); process.exit(1); }
localStorage.setItem("singularity.anthropicKey", process.env.ANTHROPIC_API_KEY);

const { gmTurn, parseIntent } = await import("../engine/gm.js");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = p => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = load("content/packs/core/rules/resolution.json");
const location = load("content/packs/valley/locations/millbrook.json");
const lore = readFileSync(join(root, "content/packs/valley/lore/valley_primer.md"), "utf8");

const character = {
  schemaVersion: 1, id: "test-char", playerKey: "test", name: "Kaelen", origin: "valley",
  background: "craftsman", level: 1, xp: 0,
  attributes: { physical: 3, mental: 3, social: 3, practical: 3 },
  skills: {}, abilities: [{ abilityId: "sonic_resonance", level: 1 }],
  alignment: {}, attunement: 1, health: 30, maxHealth: 30, energy: 100, maxEnergy: 100,
  inventory: ["traveler's pack"], deeds: [], relationships: {}, chronicle: [], currentLocationId: "millbrook"
};

console.log("1) Opening scene turn (Sonnet, structured)…");
const result = await gmTurn({
  character, location, rules, lore,
  region: { activeEvents: [{ summaryForGM: "The Water Crisis — stage 1 (Discoloration): the Echo River runs gray-green on bad mornings." }] },
  resolution: null,
  playerInput: "(Scene opening — set the scene and present the situation.)",
  recentTurns: []
});
if (!result.ok) { console.error("FAIL: gmTurn errored:", result.error); process.exit(1); }
const t = result.turn;
console.log(result.degraded ? "  (degraded fallback used)" : "  structured JSON parsed cleanly");
console.log("  narration:", t.narration.slice(0, 200).replace(/\n/g, " ") + "…");
console.log("  choices:", t.choices.map(c => `[${c.attribute}] ${c.label}`).join(" | "));
const ok = t.narration.length > 100 && t.choices.length >= 3 && t.choices.every(c => c.attribute && c.label);
console.log(ok ? "PASS: turn shape valid" : "FAIL: turn shape invalid");

console.log("\n2) Freeform intent parse (Haiku)…");
const intent = await parseIntent("I use my sonic resonance to listen through the mill wall for whoever is arguing inside", character, location);
console.log("  parsed:", JSON.stringify(intent));
const ok2 = intent.attribute && Array.isArray(intent.intentTags) && intent.abilityId === "sonic_resonance";
console.log(ok2 ? "PASS: intent maps to owned ability" : "FAIL: intent parse wrong");

process.exit(ok && ok2 ? 0 : 1);
