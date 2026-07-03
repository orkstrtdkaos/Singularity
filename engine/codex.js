// codex.js — the character's knowledge graph: what they have LEARNED, cataloged
// as linked topics (mysteries, factions, lore, events, people, places) with
// accumulating facts. Same architecture instinct as Tether's knowledge graph:
// typed nodes + links, written only through clamped ops, surfaced contextually.
// The GM records durable knowledge via codexUpdates; each turn the codex feeds
// back the topics RELEVANT to where the character is and what they're pursuing.

import { slugify } from "./quests.js";

const KINDS = ["mystery", "faction", "lore", "event", "person", "place"];
const CAPS = { topics: 60, factsPerTopic: 12, linksPerTopic: 8 };

export function ensureCodex(character) {
  if (!character.codex) character.codex = { schemaVersion: 1, topics: {} };
  return character;
}

export function applyCodexUpdates(character, updates = [], ctx = {}) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const touched = [];
  for (const u of (updates || []).slice(0, 4)) {
    const id = slugify(u.topic || u.label || "");
    if (!id) continue;
    let t = topics[id];
    if (!t) {
      if (Object.keys(topics).length >= CAPS.topics) continue;
      t = topics[id] = {
        id,
        label: String(u.label || u.topic).slice(0, 60),
        kind: KINDS.includes(u.kind) ? u.kind : "lore",
        facts: [],
        links: [],
        createdDay: ctx.day ?? null
      };
    }
    if (u.fact) {
      const fact = `[d${ctx.day ?? "?"}] ${String(u.fact).slice(0, 200)}`;
      const isDup = t.facts.some(f => f.slice(f.indexOf("]") + 2) === fact.slice(fact.indexOf("]") + 2));
      if (!isDup) t.facts = [...t.facts, fact].slice(-CAPS.factsPerTopic);
    }
    for (const link of (Array.isArray(u.links) ? u.links : []).slice(0, 4)) {
      const lid = slugify(link);
      if (lid && lid !== id && !t.links.includes(lid)) t.links = [...t.links, lid].slice(-CAPS.linksPerTopic);
    }
    t.updatedDay = ctx.day ?? t.updatedDay ?? null;
    touched.push(t.label);
  }
  return touched;
}

/** Topics relevant right now: linked to this location, tied to active quests,
 *  or freshly updated. This is how "accumulated knowledge" comes BACK to you. */
export function codexForGM(character, { locationId = null, questTitles = [] } = {}) {
  const topics = Object.values(character.codex?.topics || {});
  if (!topics.length) return null;
  const locSlug = slugify(locationId || "");
  const questWords = questTitles.flatMap(t => slugify(t).split("-")).filter(w => w.length > 3);
  const scored = topics.map(t => {
    let score = 0;
    if (t.links.includes(locSlug) || t.id === locSlug) score += 3;
    if (questWords.some(w => t.id.includes(w) || t.links.some(l => l.includes(w)))) score += 2;
    score += Math.min(2, (t.updatedDay ?? 0) / 50); // gentle recency lean
    return { t, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
  const pick = scored.length ? scored.map(x => x.t) : topics.slice(-4); // fallback: newest few
  return pick.map(t =>
    `- ${t.label} (${t.kind}): ${t.facts.slice(-3).join(" | ") || "known of, little learned"}` +
    (t.links.length ? ` [linked: ${t.links.join(", ")}]` : "")
  ).join("\n");
}

/** Search the codex (for the UI): label, kind, facts, links. */
export function searchCodex(character, query) {
  const q = (query || "").toLowerCase().trim();
  const topics = Object.values(character.codex?.topics || {});
  if (!q) return topics.sort((a, b) => (b.updatedDay ?? 0) - (a.updatedDay ?? 0));
  return topics.filter(t =>
    t.label.toLowerCase().includes(q) || t.kind.includes(q) ||
    t.facts.some(f => f.toLowerCase().includes(q)) || t.links.some(l => l.includes(q))
  );
}
