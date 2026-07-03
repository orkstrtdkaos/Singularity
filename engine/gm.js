// gm.js — assembles the Game Master prompt and parses the structured turn reply.
// Code owns the rules and the dice; the model owns the words. The GM receives
// resolution RESULTS (already rolled) and narrates them — it never decides outcomes.

import { callClaude, callClaudeJSON } from "./claude.js";
import { reputationSummary } from "./reputation.js";

const GM_SYSTEM = `You are the Game Master for SINGULARITY, a narrative RPG set in the Valley of Echoes — a post-de-technologizing world of nanite-mediated power systems, fifteen years after humanity chose to step back from its own technology.

ABSOLUTE RULES
1. You narrate outcomes that the game engine has ALREADY resolved. The "resolution" block in each turn tells you what happened (crit_success/success/partial/failure/crit_failure). Never contradict it, soften it, or re-roll it in prose.
2. Honor the lore provided. Never invent new power-system rules, never let abilities exceed the character's level, and respect distance/interference rules.
3. Respect reputation: NPCs react to the character's local standing and known deeds. A stranger is treated like a stranger.
4. Content marked GM-EYES-ONLY is secret truth for your consistency — reveal it only in earned fragments, never plainly.
5. Keep narration tight: 2-4 paragraphs, second person, present tense. Grounded hopeful-strange tone. Sensory and specific, never purple.
6. Every scene, surface at least one natural opportunity to use one of the character's listed abilities — and when an INVENTORY item is genuinely relevant, work it into the narration or a choice (name it exactly as listed). Items can be found, given, traded, lost, or broken; report all of that through characterDeltas.
7. End every turn with meaningful, distinct choices — plus the player may always type their own action.
8. Honor the CURRENT TIME: time of day and season shape light, activity, who's awake, what's open. If the player rests or travels, let the narration acknowledge time passing.
9. COMPANIONS travel with the character and appear in every scene. Voice them true to their persona and boundaries — brief presence most beats, a line of dialogue or an observation when they'd genuinely have one. They advise and assist but NEVER decide for the player and never dominate a scene. Respect their boundaries absolutely (e.g., a companion that cannot lie will not support deception — show its reaction). At most one choice per turn may lean on a companion.

REPLY FORMAT — a single JSON object, no other text:
{
  "narration": "the prose for this beat",
  "sceneSummary": "one line for the chronicle",
  "choices": [{"label": "...", "attribute": "physical|mental|social|practical", "axes": {"spectrumId": 0.4}, "difficulty": 0, "intentTags": ["..."], "abilityId": null, "energyCost": null}],
  "deeds": [{"description": "...", "tags": ["..."], "weight": 1, "communityId": "valley.millbrook"}],
  "characterDeltas": {"health": 0, "energy": 0, "inventoryAdd": [{"name": "...", "kind": "weapon|tool|consumable|quest|misc", "description": "...", "consumable": false, "effects": {"health": 0, "energy": 0}}], "inventoryRemove": ["exact item name"], "xp": 0},
  "relationshipDeltas": [{"npcId": "...", "delta": 1, "note": "..."}],
  "ledgerEvents": [{"what": "...", "tags": ["..."], "visibility": "witnessed", "spectrumDeltas": {}}],
  "sceneEnded": false
}
Choices: 3 or 4, genuinely different approaches (not flavors of the same one). difficulty: 0 routine, 15 hard, 30 very hard. intentTags describe the PLAYER's approach (plan/scout/attack/persuade/study/gamble/help/steal/risky/careful/...). Include "deeds" ONLY for memorable acts a community would talk about (weight -3..+3); routine actions produce none. Include "ledgerEvents" ONLY for consequences that should persist in the shared world.`;

/** Build the context block the GM sees each turn. */
export function buildTurnContext({ character, location, region, lore, rules, resolution, playerInput, recentTurns, timeLabel, inventoryDetail, companionsDetail }) {
  const parts = [];
  parts.push(`## LOCATION: ${location.name}\n${location.descriptionSeed}\nSpectrum character of this place: ${JSON.stringify(location.spectrum)}\nEncounter flavor: ${location.encounterFlavor || "n/a"}`);
  if (timeLabel) parts.push(`## CURRENT TIME\n${timeLabel}`);
  if (lore) parts.push(`## LORE (authoritative)\n${lore}`);
  if (region?.activeEvents?.length) parts.push(`## ACTIVE WORLD EVENTS\n${region.activeEvents.map(e => `- ${e.summaryForGM}`).join("\n")}`);
  parts.push(`## CHARACTER\n${characterSheetSummary(character)}`);
  if (inventoryDetail) parts.push(`## INVENTORY (usable in scenes — reference items by their exact names)\n${inventoryDetail}`);
  if (companionsDetail) parts.push(`## COMPANIONS (traveling with the character — present in this scene)\n${companionsDetail}`);
  parts.push(`## LOCAL REPUTATION\n${reputationSummary(character, location.communityId, rules)}`);
  if (character.chronicle?.length) parts.push(`## CHRONICLE (this character's story so far)\n${character.chronicle.slice(-12).join("\n")}`);
  if (recentTurns?.length) parts.push(`## THIS SCENE SO FAR\n${recentTurns.join("\n---\n")}`);
  if (resolution) parts.push(`## RESOLUTION (already rolled by the engine — narrate this outcome)\nAction: ${resolution.action.label}\nResult: ${resolution.degree} (rolled ${resolution.roll} vs ${resolution.chance})`);
  if (playerInput) parts.push(`## PLAYER SAYS\n${playerInput}`);
  return parts.join("\n\n");
}

function characterSheetSummary(c) {
  const abil = (c.abilities || []).map(a => `${a.abilityId} (lv${a.level})`).join(", ") || "none yet";
  return `${c.name} — ${c.origin} origin, ${c.background}, level ${c.level}. ` +
    `Attributes: physical ${c.attributes.physical}, mental ${c.attributes.mental}, social ${c.attributes.social}, practical ${c.attributes.practical}. ` +
    `Health ${c.health}/${c.maxHealth}, energy ${c.energy}/${c.maxEnergy}. Abilities: ${abil}. ` +
    `Spectrum fingerprint: ${JSON.stringify(c.alignment || {})}`;
}

/** Run one GM turn. Returns the parsed turn object, or a safe fallback shape. */
export async function gmTurn(ctx) {
  const content = buildTurnContext(ctx);
  try {
    const turn = await callClaudeJSON([{ role: "user", content }], { task: "gm-narrate", system: GM_SYSTEM });
    if (!turn.narration || !Array.isArray(turn.choices)) throw new Error("BAD_SHAPE");
    return { ok: true, turn };
  } catch (err) {
    console.warn("[gmTurn] structured parse failed, falling back to plain narration:", err.message);
    // Graceful degradation (project law): one pass failing yields a partial-but-valid
    // result, never a hard error. Plain prose + generic choices keeps play moving.
    try {
      const prose = await callClaude(
        [{ role: "user", content: content + "\n\n(Reply with narration prose only, no JSON.)" }],
        { task: "gm-narrate", system: GM_SYSTEM }
      );
      return { ok: true, degraded: true, turn: fallbackTurn(prose) };
    } catch (err2) {
      return { ok: false, error: err2.message };
    }
  }
}

function fallbackTurn(narration) {
  return {
    narration,
    sceneSummary: narration.slice(0, 100),
    choices: [
      { label: "Look around carefully", attribute: "mental", axes: {}, difficulty: 0, intentTags: ["investigate", "careful"] },
      { label: "Press on", attribute: "physical", axes: {}, difficulty: 0, intentTags: [] },
      { label: "Talk to whoever is nearby", attribute: "social", axes: {}, difficulty: 0, intentTags: ["rapport"] }
    ],
    deeds: [], characterDeltas: {}, relationshipDeltas: [], ledgerEvents: [], sceneEnded: false
  };
}

/** Parse a freeform player action into a resolvable action spec (cheap model). */
export async function parseIntent(playerText, character, location) {
  const sys = `Classify a tabletop RPG player's freeform action into JSON. Reply with ONLY:
{"label": "short restatement", "attribute": "physical|mental|social|practical", "axes": {"spectrumId": -1..1}, "difficulty": 0|15|30, "intentTags": ["..."], "abilityId": "id or null", "feasible": true|false, "infeasibleReason": "only if false"}
Spectrum ids: emotional_logical, falsehood_truth, demonic_angelic, violence_peace, concrete_abstract, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation.
Intent tags: plan, scout, prepare, attack, climb, force, persuade, charm, negotiate, comfort, study, investigate, analyze, gamble, drink, revel, risky, careful, retreat, help, give, rescue, heal, threaten, steal, rapport, finesse, discipline.
abilityId must be one the character actually has, or null. Mark infeasible only if impossible in-world (not merely hard).`;
  const content = `Character abilities: ${(character.abilities || []).map(a => a.abilityId).join(", ") || "none"}. ` +
    `Inventory: ${(character.inventory || []).map(i => i.name || i).join(", ") || "empty"}. ` +
    `Location: ${location.name} (${(location.tags || []).join(", ")}).\nPlayer action: "${playerText}"`;
  try {
    return await callClaudeJSON([{ role: "user", content }], { task: "intent-parse", system: sys });
  } catch {
    return { label: playerText.slice(0, 60), attribute: "practical", axes: {}, difficulty: 0, intentTags: [], abilityId: null, feasible: true };
  }
}
