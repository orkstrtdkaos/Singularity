// codex.js — the character's knowledge graph: what they have LEARNED, cataloged
// as linked topics (mysteries, factions, lore, events, people, places) with
// accumulating facts. Same architecture instinct as Tether's knowledge graph:
// typed nodes + links, written only through clamped ops, surfaced contextually.
// The GM records durable knowledge via codexUpdates; each turn the codex feeds
// back the topics RELEVANT to where the character is and what they're pursuing.

import { slugify } from "./quests.js";
import { normName, namesMatch, smartClamp } from "./namematch.js"; // SNG-152
export { namesMatch }; // back-compat: callers/tests import namesMatch from codex.js

const KINDS = ["mystery", "faction", "lore", "event", "person", "place"];
// SNG-019: a PRIMARY node (anchored to a known entity via entityId) holds more facts —
// a major NPC warrants 20+; ordinary topics keep the original cap.
const CAPS = { topics: 60, factsPerTopic: 12, factsPerPrimary: 24, linksPerTopic: 8, aliasesPerTopic: 8 };

export function ensureCodex(character) {
  if (!character.codex) character.codex = { schemaVersion: 1, topics: {} };
  for (const t of Object.values(character.codex.topics)) if (!t.aliases) t.aliases = [];
  return character;
}

// ---------- SNG-019: entity resolution — facts collect under primary nodes ----------
// (normName + namesMatch live in namematch.js so quests/inventory share them.)

/** Resolve an incoming codexUpdate to an existing topic (or a canonical anchor).
 *  Order: explicit entityId → known-entity name anchor (ctx.entities) → label/alias scan.
 *  ctx.entities: { people: {id: name}, places: {id: name} } — known NPC/location ids. */
export function resolveTopic(character, u, ctx = {}) {
  const topics = character.codex.topics;
  const raw = String(u.label || u.topic || "").slice(0, 60);
  let entityId = u.entityId ? slugify(u.entityId) : null;

  // anchor a person/place label to a KNOWN entity id when the GM didn't pass one
  if (!entityId && raw && (!u.kind || u.kind === "person" || u.kind === "place")) {
    const pools = u.kind === "person" ? ["people"] : u.kind === "place" ? ["places"] : ["people", "places"];
    for (const pool of pools) {
      for (const [id, name] of Object.entries(ctx.entities?.[pool] || {})) {
        if (namesMatch(raw, name) || namesMatch(raw, id.replace(/-/g, " "))) { entityId = slugify(id); break; }
      }
      if (entityId) break;
    }
  }

  // 1) entityId beats everything: an existing node anchored to this entity
  if (entityId) {
    const hit = Object.values(topics).find(t => t.entityId === entityId) || topics[entityId];
    if (hit) return { topic: hit, entityId };
  }
  // 2) exact slug of the incoming topic
  const id = slugify(u.topic || u.label || "");
  if (id && topics[id]) return { topic: topics[id], entityId };
  // 3) label/alias scan (same-kind preferred; lore accepts any)
  if (raw) {
    const hit = Object.values(topics).find(t =>
      (namesMatch(t.label, raw) || (t.aliases || []).some(a => namesMatch(a, raw))) &&
      (!u.kind || t.kind === u.kind || t.kind === "lore" || u.kind === "lore"));
    if (hit) return { topic: hit, entityId };
  }
  return { topic: null, entityId };
}

/** Record what the GM called this entity, so future phrasings resolve here too. */
function recordAlias(t, raw) {
  if (!raw || normName(raw) === normName(t.label)) return;
  if (!(t.aliases || []).some(a => normName(a) === normName(raw))) {
    t.aliases = [...(t.aliases || []), String(raw).slice(0, 60)].slice(-CAPS.aliasesPerTopic);
  }
}

export function applyCodexUpdates(character, updates = [], ctx = {}) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const touched = [];
  for (const u of (updates || []).slice(0, 4)) {
    const raw = String(u.label || u.topic || "").slice(0, 60);
    // SNG-019: resolve against existing nodes (entityId → known-entity anchor → alias)
    const res = resolveTopic(character, u, ctx);
    let t = res.topic;
    if (t) {
      recordAlias(t, raw);
      if (res.entityId && !t.entityId) t.entityId = res.entityId; // late anchor upgrade
    } else {
      const id = res.entityId || slugify(u.topic || u.label || "");
      if (!id) continue;
      if (Object.keys(topics).length >= CAPS.topics) continue;
      const canonical = res.entityId
        ? (ctx.entities?.people?.[res.entityId] || ctx.entities?.places?.[res.entityId] || raw)
        : raw;
      t = topics[id] = {
        id,
        label: String(canonical || raw).slice(0, 60),
        kind: KINDS.includes(u.kind) ? u.kind : "lore",
        facts: [],
        links: [],
        aliases: [],
        createdDay: ctx.day ?? null
      };
      if (res.entityId) t.entityId = res.entityId;
      recordAlias(t, raw);
    }
    if (u.fact) {
      const fact = `[d${ctx.day ?? "?"}] ${smartClamp(String(u.fact), 300)}`; // SNG-152: the reported mid-word cut ("…specification and understo")
      const isDup = t.facts.some(f => f.slice(f.indexOf("]") + 2) === fact.slice(fact.indexOf("]") + 2));
      const cap = t.entityId ? CAPS.factsPerPrimary : CAPS.factsPerTopic;
      if (!isDup) t.facts = [...t.facts, fact].slice(-cap);
    }
    for (const link of (Array.isArray(u.links) ? u.links : []).slice(0, 4)) {
      const lid = slugify(link);
      if (lid && lid !== t.id && !t.links.includes(lid)) t.links = [...t.links, lid].slice(-CAPS.linksPerTopic);
    }
    t.updatedDay = ctx.day ?? t.updatedDay ?? null;
    touched.push(t.label);
  }
  return touched;
}

/** Absorb topic s into primary p: facts concatenate (deduped, re-sorted chronological),
 *  links + aliases union, inbound links elsewhere rewire to p, s is deleted. */
function absorb(topics, p, s) {
  const bare = f => f.slice(f.indexOf("]") + 2);
  for (const f of s.facts) if (!p.facts.some(x => bare(x) === bare(f))) p.facts.push(f);
  const dayOf = f => { const m = /^\[d(\d+)\]/.exec(f); return m ? Number(m[1]) : 0; };
  p.facts.sort((x, y) => dayOf(x) - dayOf(y)); // stable: same-day facts keep insertion order
  p.facts = p.facts.slice(-(p.entityId ? CAPS.factsPerPrimary : CAPS.factsPerTopic));
  for (const l of s.links) if (l !== p.id && !p.links.includes(l)) p.links.push(l);
  p.links = p.links.slice(-CAPS.linksPerTopic);
  recordAlias(p, s.label);
  for (const al of s.aliases || []) recordAlias(p, al);
  if (!p.entityId && s.entityId) p.entityId = s.entityId;
  if (s.createdDay != null) p.createdDay = Math.min(p.createdDay ?? s.createdDay, s.createdDay);
  if (s.updatedDay != null) p.updatedDay = Math.max(p.updatedDay ?? 0, s.updatedDay);
  delete topics[s.id];
  for (const t of Object.values(topics)) {
    t.links = t.links.map(l => (l === s.id ? p.id : l)).filter((l, k, arr) => l !== t.id && arr.indexOf(l) === k);
  }
}

const pairKey = (aId, bId) => [aId, bId].sort().join("::");

/** Player verdict: these two are NOT the same thing. Auto-merge and suggestions
 *  respect this forever (until one of the ids disappears). */
export function markNotSame(character, aId, bId) {
  ensureCodex(character);
  const list = character.codex.notSame || (character.codex.notSame = []);
  const key = pairKey(aId, bId);
  if (!list.includes(key)) list.push(key);
}
function isNotSame(codex, aId, bId) {
  return (codex.notSame || []).includes(pairKey(aId, bId));
}

/** SNG-019 player allocation: merge ANY topic into ANY other — the player's judgment
 *  overrides every heuristic. Source's label becomes an alias of the target; target's
 *  kind wins. Returns the target node, or null if either id is missing. */
export function mergeInto(character, sourceId, targetId) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const s = topics[sourceId], p = topics[targetId];
  if (!s || !p || sourceId === targetId) return null;
  absorb(topics, p, s);
  return p;
}

/** SNG-019 merge tool: collapse duplicate topics into their primary node — high-confidence
 *  only (same entityId, or matching label/alias with compatible kind). Respects the
 *  player's not-same verdicts. Idempotent. Returns [{into, absorbed}] for reporting. */
export function mergeCodexTopics(character) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const merged = [];
  const kindRank = { person: 3, place: 3, faction: 2, event: 2, mystery: 1, lore: 0 };
  const compatible = (a, b) => a.kind === b.kind || a.kind === "lore" || b.kind === "lore";
  const priOf = (x) => (x.entityId ? 1000 : 0) + (kindRank[x.kind] ?? 0) * 100 + Math.min(99, x.facts.length);

  let changed = true;
  while (changed) {
    changed = false;
    const list = Object.values(topics);
    outer:
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (isNotSame(character.codex, a.id, b.id)) continue;
        const sameEntity = a.entityId && b.entityId && a.entityId === b.entityId;
        const nameHit = (namesMatch(a.label, b.label) ||
          (a.aliases || []).some(x => namesMatch(x, b.label)) ||
          (b.aliases || []).some(x => namesMatch(x, a.label))) && compatible(a, b);
        if (!sameEntity && !nameHit) continue;
        // primary: anchored > higher-rank kind > more facts
        const [p, s] = priOf(a) >= priOf(b) ? [a, b] : [b, a];
        absorb(topics, p, s);
        merged.push({ into: p.label, absorbed: s.label });
        changed = true;
        break outer;
      }
    }
  }
  return merged;
}

/** SNG-019 suggestions: medium-confidence duplicate candidates for the PLAYER to judge —
 *  looser than auto-merge (shared substantial name-token via label/alias, mutual links,
 *  or link overlap), same-kind-compatible, not-same verdicts excluded. Sorted by score. */
export function suggestMerges(character, { max = 6 } = {}) {
  ensureCodex(character);
  const topics = Object.values(character.codex.topics);
  const STOP = new Set(["the", "a", "an", "of", "in", "at", "on", "from", "with", "and", "for", "to",
    "woman", "man", "girl", "boy", "person", "one", "who", "that", "this", "old", "young", "new"]);
  const tokensOf = t => {
    const out = new Set();
    for (const s of [t.label, ...(t.aliases || [])]) {
      for (const w of normNameTokens(s)) if (w.length >= 4 && !STOP.has(w)) out.add(w);
    }
    return out;
  };
  const compatible = (a, b) => a.kind === b.kind || a.kind === "lore" || b.kind === "lore";
  const toks = new Map(topics.map(t => [t.id, tokensOf(t)]));
  const out = [];
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const a = topics[i], b = topics[j];
      if (!compatible(a, b)) continue;
      if (isNotSame(character.codex, a.id, b.id)) continue;
      let score = 0;
      const shared = [...toks.get(a.id)].filter(w => toks.get(b.id).has(w));
      score += shared.length * 2;
      if (a.links.includes(b.id) || b.links.includes(a.id)) score += 2;
      score += a.links.filter(l => b.links.includes(l)).length;
      if (score >= 2) out.push({ aId: a.id, bId: b.id, a: a.label, b: b.label, score, shared });
    }
  }
  return out.sort((x, y) => y.score - x.score).slice(0, max);
}

function normNameTokens(s) {
  return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
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
