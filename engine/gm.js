// gm.js — assembles the Game Master prompt and parses the structured turn reply.
// Code owns the rules and the dice; the model owns the words. The GM receives
// resolution RESULTS (already rolled) and narrates them — it never decides outcomes.

import { callClaude, callClaudeJSON } from "./claude.js";
import { reputationSummary } from "./reputation.js";

const GM_SYSTEM = `You are the Game Master for SINGULARITY, a narrative RPG set in the Valley of Echoes — a post-de-technologizing world of nanite-mediated power systems, fifteen years after humanity chose to step back from its own technology.

ABSOLUTE RULES
1. You narrate outcomes that the game engine has ALREADY resolved. The "resolution" block in each turn tells you what happened (crit_success/success/partial/failure/crit_failure). Never contradict it, soften it, or re-roll it in prose.
2. Honor the lore provided. Never invent new power-system rules, and respect distance/interference rules. The ABILITY LAW block defines exactly what each ability CAN do at the character's rank, what it CANNOT, and what it is NOT FOR — treat those as physics. If the player attempts something beyond the current rank's envelope, it either fails plausibly or becomes a NOVEL USE (see rule 16); it never silently succeeds as routine.
3. Respect reputation: NPCs react to the character's local standing and known deeds. A stranger is treated like a stranger.
4. Content marked GM-EYES-ONLY is secret truth for your consistency — reveal it only in earned fragments, never plainly.
5. Keep narration tight: 2-4 paragraphs, second person, present tense. Grounded hopeful-strange tone. Sensory and specific, never purple.
6. Every scene, surface at least one natural opportunity to use one of the character's listed abilities — and when an INVENTORY item is genuinely relevant, work it into the narration or a choice (name it exactly as listed). Items can be found, given, traded, lost, or broken; report all of that through characterDeltas.
7. End every turn with meaningful, distinct choices — plus the player may always type their own action.
8. Honor the CURRENT TIME: time of day and season shape light, activity, who's awake, what's open. If the player rests or travels, let the narration acknowledge time passing.
9. COMPANIONS travel with the character and appear in every scene. Voice them true to their persona and boundaries — brief presence most beats, a line of dialogue or an observation when they'd genuinely have one. They advise and assist but NEVER decide for the player and never dominate a scene. Respect their boundaries absolutely (e.g., a companion that cannot lie will not support deception — show its reaction). At most one choice per turn may lean on a companion.
10. MOMENTUM. Every turn must advance something concrete: a quest moves, a secret surfaces, a relationship shifts, a door opens or closes. No idle slice-of-life beats unless the player explicitly seeks quiet. If no active quest engages the current scene, weave one of the location's QUEST SEEDS into play as a concrete, named opportunity with stakes — an NPC asks, an event interrupts, a chance presents itself.
11. QUESTS are tracked state. When the player takes on an undertaking, emit questUpdates op "start" (short memorable title, one-line summary, who gave it). When a scene advances one, emit op "progress" with a note. When finished, op "complete" (xpReward 15-50 by difficulty) or op "fail". Keep at most 2-3 quests in active play; finish threads before opening many more.
12. Ground scenes in the character's BIO: their livelihood earns them recognition or work, their hobbies surface naturally, their motivation is the lens for every big choice. NPCs react to what the character does for a living.
13. SCENE PERMANENCE — the most important continuity rule (within a scene). The CURRENT SCENE STATE block is authoritative physical reality: the exact spot the character occupies, who is present, what objects exist. You MUST NOT contradict it. The character stays exactly where they are unless the player's action moves them or something in-world explicitly moves them — and any movement must be narrated as a transition ("you follow her up the lane…"), never assumed. NPCs do not teleport, swap, or change roles; objects stay where they were left; indoor/outdoor, weather, and lighting persist. You MAY add new elements (a person arrives, something is uncovered) — additions are generativity, contradictions are errors. Return the updated scene state EVERY turn in the "scene" field, carrying forward everything still true.
14. NPC PERMANENCE (across scenes). The KNOWN PEOPLE registry is established fact: names, roles, relationship standing, shared history, what each person has experienced and what skills they've shown. Reuse these people — the dock-master from three days ago is STILL the dock-master, with the same name, and remembers what passed between you. Never invent a replacement for someone who already exists. When the character meets someone new worth remembering, emit npcUpdates op "meet" (name them!). When an interaction changes a relationship, teaches you something about them, or something happens TO them, emit op "update" with note/learned/relationshipDelta/skillsObserved/status. Minor crowd figures (a passing farmer) don't need registry entries.
15A. GAMBITS. When the resolution block is a GAMBIT (a declared multi-step plan), narrate the WHOLE run as one continuous cinematic sequence — heist-movie pacing, honoring every step's receipt in order: clean successes chain smoothly, complications visibly wrinkle the plan, fallbacks read as quick thinking, an adaptation reroll reads as grit or luck, and an abandoned run ends with the character extracting themselves from wherever it broke. Then land the aftermath in the same scene and offer choices as usual. Same length discipline: 3-5 paragraphs max.
16. NOVEL USE & COMBINATIONS. When the resolution is marked NOVEL (an ability pushed outside its envelope, or two abilities braided), narrate the strain — the field resisting, the technique bending. On BACKLASH (the resolution block lists engine-applied damage), narrate real cost: resonance-burn, light-scald, a nosebleed, the power snapping back. On DISCOVERY-ELIGIBLE (critical success), narrate breakthrough — the moment the technique clicks into something repeatable — and return the "discovery" field naming it. Discovered techniques listed in ABILITY LAW are earned: treat them as reliable capabilities.
15B. PLACE MEMORY (across visits). The PLACE HISTORY block records what this character knows changed here: things left behind, discoveries, damage, promises made at this spot. Honor it as physical fact on every return. When a scene durably changes a place — something is taken, broken, hidden, built, revealed — emit placeUpdates with a note (and optionally a flag) so the place remembers.

REPLY FORMAT — a single JSON object, no other text:
{
  "narration": "the prose for this beat",
  "sceneSummary": "one line for the chronicle",
  "choices": [{"label": "...", "attribute": "physical|mental|social|practical", "subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits", "axes": {"spectrumId": 0.4}, "difficulty": 0, "intentTags": ["..."], "abilityId": null, "energyCost": null}],
  "deeds": [{"description": "...", "tags": ["..."], "weight": 1, "communityId": "valley.millbrook"}],
  "characterDeltas": {"health": 0, "energy": 0, "inventoryAdd": [{"name": "...", "kind": "weapon|tool|consumable|quest|misc", "description": "...", "consumable": false, "effects": {"health": 0, "energy": 0}}], "inventoryRemove": ["exact item name"], "xp": 0},
  "relationshipDeltas": [{"npcId": "...", "delta": 1, "note": "..."}],
  "ledgerEvents": [{"what": "...", "tags": ["..."], "visibility": "witnessed", "spectrumDeltas": {}}],
  "questUpdates": [{"op": "start|progress|complete|fail", "questId": "kebab-id", "title": "...", "summary": "...", "giver": "...", "note": "...", "xpReward": 25}],
  "scene": {"setting": "1-2 sentences: EXACTLY where the character is (indoor/outdoor, position, lighting, weather)", "npcsPresent": [{"name": "...", "state": "what they're doing right now"}], "objects": ["notable objects in view or reach"], "threads": ["unresolved in-scene threads (a question hanging, someone waiting for an answer)"]},
  "npcUpdates": [{"op": "meet|update", "npcId": "kebab-id (stable across scenes)", "name": "...", "role": "...", "description": "one line, on meet", "note": "what passed between you this beat", "learned": ["fact about them / something they experienced"], "skillsObserved": ["skill they demonstrated"], "relationshipDelta": 1, "status": "active|injured|missing|dead|departed"}],
  "placeUpdates": [{"note": "durable change to THIS place that future visits must honor", "flag": {"key": "value"}}],
  "discovery": {"name": "evocative technique name", "description": "what this new technique does and its cost/limit"},
  "sceneEnded": false
}
"discovery" ONLY when the resolution block explicitly says DISCOVERY-ELIGIBLE (a critical success on a novel or combined ability use). Otherwise omit it entirely.
The "scene" field is REQUIRED every turn: carry forward everything still true from the current scene state, change only what this beat actually changed.
Choices: 3 or 4, genuinely different approaches (not flavors of the same one). difficulty: 0 routine, 15 hard, 30 very hard. intentTags describe the PLAYER's approach (plan/scout/attack/persuade/study/gamble/help/steal/risky/careful/...). Include "deeds" ONLY for memorable acts a community would talk about (weight -3..+3); routine actions produce none. Include "ledgerEvents" ONLY for consequences that should persist in the shared world.`;

/** Build the context block the GM sees each turn. */
export function buildTurnContext({ character, location, region, lore, rules, resolution, playerInput, recentTurns, timeLabel, inventoryDetail, companionsDetail, questsDetail, sceneState, npcRegistryDetail, placeMemoryDetail, newsDetail, abilityLawDetail }) {
  const parts = [];
  parts.push(`## LOCATION: ${location.name}\n${location.descriptionSeed}\nSpectrum character of this place: ${JSON.stringify(location.spectrum)}\nEncounter flavor: ${location.encounterFlavor || "n/a"}`);
  if (location.questSeeds?.length) parts.push(`## QUEST SEEDS for this location (weave in when the scene needs drive)\n${location.questSeeds.map(s => `- ${s}`).join("\n")}`);
  if (timeLabel) parts.push(`## CURRENT TIME\n${timeLabel}`);
  if (lore) parts.push(`## LORE (authoritative)\n${lore}`);
  if (region?.activeEvents?.length) parts.push(`## ACTIVE WORLD EVENTS\n${region.activeEvents.map(e => `- ${e.summaryForGM}`).join("\n")}`);
  if (newsDetail) parts.push(`## RECENT NEWS in the valley (rumors NPCs may repeat; things that happened while the character was elsewhere)\n${newsDetail}`);
  parts.push(`## CHARACTER\n${characterSheetSummary(character)}`);
  if (abilityLawDetail) parts.push(`## ABILITY LAW (rule 2 — what powers can, cannot, and are not for at current rank)\n${abilityLawDetail}`);
  if (inventoryDetail) parts.push(`## INVENTORY (usable in scenes — reference items by their exact names)\n${inventoryDetail}`);
  if (companionsDetail) parts.push(`## COMPANIONS (traveling with the character — present in this scene)\n${companionsDetail}`);
  if (questsDetail) parts.push(`## ACTIVE QUESTS\n${questsDetail}`);
  if (npcRegistryDetail) parts.push(`## KNOWN PEOPLE (established fact — see rule 14; reuse these people, never reinvent them)\n${npcRegistryDetail}`);
  if (placeMemoryDetail) parts.push(`## PLACE HISTORY — what ${character.name} knows changed here (established fact — see rule 15)\n${placeMemoryDetail}`);
  parts.push(`## LOCAL REPUTATION\n${reputationSummary(character, location.communityId, rules)}`);
  if (character.chronicle?.length) parts.push(`## CHRONICLE (this character's story so far)\n${character.chronicle.slice(-12).join("\n")}`);
  if (sceneState) {
    parts.push(`## CURRENT SCENE STATE (AUTHORITATIVE — do not contradict; see rule 13)\nSetting: ${sceneState.setting}\nPresent: ${(sceneState.npcsPresent || []).map(n => `${n.name} (${n.state})`).join("; ") || "no one else"}\nObjects: ${(sceneState.objects || []).join(", ") || "nothing notable"}\nOpen threads: ${(sceneState.threads || []).join("; ") || "none"}`);
  }
  if (recentTurns?.length) {
    // older beats as one-line summaries, the last few in full — continuity needs texture
    const rendered = recentTurns.map((t, i) => {
      if (typeof t === "string") return t; // legacy shape
      return i >= recentTurns.length - 3 && t.narration ? `${t.summary}\nFULL TEXT: ${t.narration.slice(0, 700)}` : t.summary;
    });
    parts.push(`## THIS SCENE SO FAR (oldest first)\n${rendered.join("\n---\n")}`);
  }
  if (resolution?.gambit) {
    parts.push(`## RESOLUTION — GAMBIT (already rolled by the engine; narrate the whole run per rule 15A)\nGoal: ${resolution.gambit.goal}\nOutcome: ${resolution.gambit.outcome}\n${resolution.gambit.steps.join("\n")}`);
  } else if (resolution) {
    let block = `## RESOLUTION (already rolled by the engine — narrate this outcome)\nAction: ${resolution.action.label}\nResult: ${resolution.degree} (rolled ${resolution.roll} vs ${resolution.chance})`;
    if (resolution.action.novel) block += `\nNOVEL USE${resolution.action.comboAbilities?.length ? ` — combining: ${resolution.action.comboAbilities.join(" + ")}` : ""}${resolution.action.noveltyHint ? ` (${resolution.action.noveltyHint})` : ""} — see rule 16.`;
    if (resolution.backlash) block += `\nBACKLASH (engine-applied): ${resolution.backlash.health} health, ${resolution.backlash.energy} energy — narrate the cost.`;
    if (resolution.discoveryEligible) block += `\nDISCOVERY-ELIGIBLE: narrate the breakthrough and return the "discovery" field naming the new technique.`;
    if (resolution.usedDiscovery) block += `\nUsing discovered technique: ${resolution.usedDiscovery} — earned skill, narrate with confidence.`;
    parts.push(block);
  }
  if (playerInput) parts.push(`## PLAYER SAYS\n${playerInput}`);
  return parts.join("\n\n");
}

function characterSheetSummary(c) {
  const abil = (c.abilities || []).map(a => `${a.abilityId} (rank ${a.level})`).join(", ") || "none yet";
  const attrs = c.subAttributes
    ? `strength ${c.subAttributes.strength}, agility ${c.subAttributes.agility}, reason ${c.subAttributes.reason}, insight ${c.subAttributes.insight}, presence ${c.subAttributes.presence}, rapport ${c.subAttributes.rapport}, craft ${c.subAttributes.craft}, wits ${c.subAttributes.wits}`
    : `physical ${c.attributes.physical}, mental ${c.attributes.mental}, social ${c.attributes.social}, practical ${c.attributes.practical}`;
  let s = `${c.name} — ${c.origin} origin, ${c.background}, level ${c.level}. ` +
    `Attributes: ${attrs}. ` +
    `Health ${c.health}/${c.maxHealth}, energy ${c.energy}/${c.maxEnergy}. Abilities: ${abil}. ` +
    `Spectrum fingerprint: ${JSON.stringify(c.alignment || {})}`;
  if (c.bio) {
    const b = c.bio;
    s += `\nBIO — From: ${b.hometown || "unknown"}. Lives: ${b.residence || "no fixed home"}. Livelihood: ${b.livelihood || "gets by"}. ` +
      `Hobbies: ${b.hobbies || "few"}. Why they stepped out of ordinary life: ${b.motivation || "unstated"}.` +
      (b.story ? `\nTheir story so far: ${b.story}` : "");
  }
  return s;
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

/** Clamp a GM-proposed scene state to sane bounds. Returns null for garbage —
 *  callers keep the previous scene state in that case (permanence over novelty). */
export function sanitizeScene(scene) {
  if (!scene || typeof scene !== "object" || !scene.setting) return null;
  return {
    setting: String(scene.setting).slice(0, 400),
    npcsPresent: (Array.isArray(scene.npcsPresent) ? scene.npcsPresent : []).slice(0, 8).map(n =>
      typeof n === "string" ? { name: n.slice(0, 60), state: "" } : { name: String(n.name || "someone").slice(0, 60), state: String(n.state || "").slice(0, 120) }),
    objects: (Array.isArray(scene.objects) ? scene.objects : []).slice(0, 10).map(o => String(o).slice(0, 80)),
    threads: (Array.isArray(scene.threads) ? scene.threads : []).slice(0, 5).map(t => String(t).slice(0, 160))
  };
}

function fallbackTurn(narration) {
  return {
    narration,
    sceneSummary: narration.slice(0, 100),
    scene: null, // engine keeps the previous scene state — permanence over novelty
    choices: [
      { label: "Look around carefully", attribute: "mental", axes: {}, difficulty: 0, intentTags: ["investigate", "careful"] },
      { label: "Press on", attribute: "physical", axes: {}, difficulty: 0, intentTags: [] },
      { label: "Talk to whoever is nearby", attribute: "social", axes: {}, difficulty: 0, intentTags: ["rapport"] }
    ],
    deeds: [], characterDeltas: {}, relationshipDeltas: [], ledgerEvents: [], sceneEnded: false
  };
}

/** Out-of-character question to the GM. Answers about the world, the scene, the
 *  rules, the character's own knowledge — WITHOUT advancing the story, rolling
 *  dice, or changing any state. Strict no-spoiler rule for GM-EYES-ONLY content. */
export async function gmAsk(ctx, question) {
  const sys = `You are the Game Master of SINGULARITY answering an OUT-OF-CHARACTER question from the player. This is a meta channel: the story does not advance, no dice are rolled, nothing in the world changes.
- Answer helpfully about: the current scene, what the CHARACTER would plausibly know or remember, the world's lore as provided, how the game's mechanics work (d100 vs shown chance, spectrum alignment, reputation from deeds, energy, quests), and what the choices on offer would generally entail.
- NEVER reveal GM-EYES-ONLY content, hidden truths, NPC secrets, or true odds beyond what the character's sense already showed. If asked, say the character doesn't know that yet — finding out is play.
- Be concise: a short paragraph or two. Plain, friendly, spoiler-safe.`;
  const content = buildTurnContext({ ...ctx, resolution: null, playerInput: null }) + `\n\n## PLAYER ASKS (out of character)\n${question}`;
  try {
    const text = await callClaude([{ role: "user", content }], { task: "gm-meta", system: sys, maxTokens: 1024 });
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/** Generate a bio draft from the creation choices (player edits before accepting). */
export async function generateBio({ name, origin, background, attributes }) {
  const sys = `You write short character bios for an RPG set in the Valley of Echoes — a post-de-technologizing world (15 years after humanity voluntarily stepped back from its own technology) with two local civilizations: the sonic Harmonic Heights and the photonic Radiant Plateau, plus unaligned valley-floor farming communities. Grounded, specific, warm; no cliches, no chosen-one tropes. Reply with ONLY JSON:
{"hometown": "where they grew up (specific, in-world)", "residence": "where they live now and what it's like", "livelihood": "how they actually make money", "hobbies": "2-3 real hobbies", "motivation": "why they stepped out of ordinary life to become someone things happen to — concrete and personal, not grand", "story": "3-4 sentence life story tying it together"}`;
  const content = `Name: ${name}. Origin: ${origin} (harmonic = Heights sonic culture, radiant = Plateau light culture, valley = unaligned farming folk). Background: ${background}. Attributes (1-4): ${JSON.stringify(attributes)} — let the strongest shape the story.`;
  return callClaudeJSON([{ role: "user", content }], { task: "bio-gen", system: sys, maxTokens: 1024 });
}

/** Parse a freeform player action into a resolvable action spec (cheap model). */
export async function parseIntent(playerText, character, location) {
  const sys = `Classify a tabletop RPG player's freeform action into JSON. Reply with ONLY:
{"label": "short restatement", "attribute": "physical|mental|social|practical", "subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits", "axes": {"spectrumId": -1..1}, "difficulty": 0|15|30, "intentTags": ["..."], "abilityId": "id or null", "comboAbilities": ["ids if the player is deliberately COMBINING two abilities, else []"], "novelUse": false, "noveltyHint": "2-4 words naming the novel application, only if novelUse", "feasible": true|false, "infeasibleReason": "only if false"}
subAttribute picks the finest fit: strength (force, endurance) / agility (speed, balance, stealth of body) / reason (logic, analysis) / insight (perception, intuition, reading people) / presence (command, inspire) / rapport (charm, empathy) / craft (making, fixing, precise tool work) / wits (improvisation, survival, quick thinking).
Spectrum ids: emotional_logical, falsehood_truth, demonic_angelic, violence_peace, concrete_abstract, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation.
Intent tags: plan, scout, prepare, attack, climb, force, persuade, charm, negotiate, comfort, study, investigate, analyze, gamble, drink, revel, risky, careful, retreat, help, give, rescue, heal, threaten, steal, rapport, finesse, discipline.
abilityId must be one the character actually has, or null. novelUse=true when an ability is being pushed OUTSIDE its normal envelope (per its description) or two abilities are braided together — this is allowed and interesting, not infeasible. Mark infeasible only if impossible in-world (not merely hard).`;
  const content = `Character abilities: ${(character.abilities || []).map(a => a.abilityId).join(", ") || "none"}. ` +
    `Inventory: ${(character.inventory || []).map(i => i.name || i).join(", ") || "empty"}. ` +
    `Location: ${location.name} (${(location.tags || []).join(", ")}).\nPlayer action: "${playerText}"`;
  try {
    return await callClaudeJSON([{ role: "user", content }], { task: "intent-parse", system: sys });
  } catch {
    return { label: playerText.slice(0, 60), attribute: "practical", axes: {}, difficulty: 0, intentTags: [], abilityId: null, feasible: true };
  }
}
