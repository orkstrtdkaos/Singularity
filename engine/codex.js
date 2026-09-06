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
const CAPS = { topics: 60, factsPerTopic: 12, factsPerPrimary: 24, linksPerTopic: 8, aliasesPerTopic: 8,
  // SPEC_codex §3a — Aevi's read: summarise at 6 facts and re-summarise every 6 after, so a topic is a
  // paragraph long before it is a wall. `keepFacts` is how many stay in `facts` as live evidence after a
  // summary; the rest retire to `archive` so the topic drops under its ceiling and accepts again.
  summariseEvery: 6, keepFacts: 8, archivePerTopic: 48, summaryChars: 700 };

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

/** ⛔ THE TOPIC ID FOLLOWS THE ENTITY, ALWAYS (SPEC_codex §3b). A topic born from a label and anchored LATER
 *  kept the label's id — five on Silas's save: a player looking up Mara finds *the Edge District Ledger*.
 *  ⚑ Re-keys `t` to its entityId when that id is free: the old id becomes an alias (so old links and old
 *  phrasings still resolve), and every other topic's links are rewritten. A rename, not a merge — lossless,
 *  so it records no undo. ⚠️ Idempotent: id === entityId does nothing, which is what lets the standing tidy
 *  call it every load. Returns the new id, or null when nothing moved. */
export function rekeyToEntity(topics, t, entities = null) {
  if (!t || !t.entityId || t.id === t.entityId) return null;
  const to = t.entityId;
  if (topics[to] && topics[to] !== t) return null;          // occupied — the merger's job, not a rename's
  const from = t.id;
  delete topics[from];
  t.id = to;
  topics[to] = t;
  // ⚠️ THE LABEL FOLLOWS TOO, when the entity has a canonical name — "the Edge District Ledger" is what the
  // first fact was called, not who the topic is about. ⛔ AND IT CHANGES FIRST: `recordAlias` refuses a name
  // equal to the CURRENT label, so recording the old name before the label moved skipped it silently and
  // "the Edge District Ledger" stopped resolving to anything. Measured, then fixed.
  const oldLabel = t.label;
  const canonical = entities?.people?.[to] || entities?.places?.[to] || null;
  if (canonical && normName(canonical) !== normName(t.label)) t.label = String(canonical).slice(0, 60);
  recordAlias(t, oldLabel);                                  // what it used to be called still resolves here
  recordAlias(t, from.replace(/-/g, " "));                   // and so does the old id, spoken as words
  // ⛑ an alias equal to the NEW label is no longer an alias — drop it rather than carry "Mara Wells" twice
  t.aliases = (t.aliases || []).filter(a => normName(a) !== normName(t.label));
  for (const o of Object.values(topics)) {
    if (!Array.isArray(o.links)) continue;
    o.links = o.links.map(l => (l === from ? to : l)).filter((l, k, arr) => l !== o.id && arr.indexOf(l) === k);
  }
  return to;
}

/** ⚠️ 3d — A KNOWN ENTITY'S NATURE IS AUTHORITATIVE OVER WHAT THE GM FIRST CALLED IT. `millbrook` was
 *  `kind: event`, and because `compatibleKinds` gates merging, a wrong kind is a PERMANENT barrier to
 *  tidying rather than a cosmetic one. A topic anchored to a known place is a place; to a known person, a
 *  person. Returns true when the kind moved. */
export function kindFromEntity(t, entities = null) {
  if (!t || !t.entityId || !entities) return false;
  const want = entities.places?.[t.entityId] ? "place" : entities.people?.[t.entityId] ? "person" : null;
  if (!want || t.kind === want) return false;
  t.kind = want;
  return true;
}

/** ⚠️ 3c — ALIASES ARE THE MERGE KEY, AND NOTHING FED THEM. `revealName` already writes the old name into the
 *  NPC record's `aliases`; three authored figures carry them; the codex read none of it. Seeds a topic's
 *  aliases from its entity's, so "the water-keeper" resolves to Mara Wells once her record says so. */
export function seedAliasesFromEntity(t, entities = null) {
  if (!t || !t.entityId) return 0;
  const list = entities?.aliases?.[t.entityId];
  if (!Array.isArray(list)) return 0;
  const n = (t.aliases || []).length;
  for (const a of list) if (a) recordAlias(t, String(a).replace(/[_-]/g, " "));
  return (t.aliases || []).length - n;
}

/** R49 — does this update attach to a story that already exists? A link to a quest the character holds or
 *  an arc the world has is a story; a bare kebab id the GM coined is not. */
function linksToStory(u, ctx = {}) {
  const links = (Array.isArray(u.links) ? u.links : []).map(l => slugify(String(l)));
  const q = ctx.questIds instanceof Set ? ctx.questIds : new Set(ctx.questIds || []);
  const a = ctx.arcIds instanceof Set ? ctx.arcIds : new Set(ctx.arcIds || []);
  return links.some(l => q.has(l) || a.has(l));
}

export function applyCodexUpdates(character, updates = [], ctx = {}) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const touched = [];
  const extra = [];                       // R49: facts re-filed under a place, applied once after the loop
  for (const u of [...(updates || []).slice(0, 4)]) {
    const raw = String(u.label || u.topic || "").slice(0, 60);
    // SNG-019: resolve against existing nodes (entityId → known-entity anchor → alias)
    const res = resolveTopic(character, u, ctx);
    let t = res.topic;
    if (t) {
      recordAlias(t, raw);
      if (res.entityId && !t.entityId) {
        // ⛔ THE LATE ANCHOR IS WHERE EVERY MISFILE CAME FROM. Stamping the entityId and keeping the label's
        // id is how `the-edge-district-ledger` ended up anchored to `mara-wells` — so the id follows too.
        t.entityId = res.entityId;
        rekeyToEntity(topics, t, ctx.entities);
        kindFromEntity(t, ctx.entities);
        seedAliasesFromEntity(t, ctx.entities);
      }
    } else {
      // ⛔ R49 — A MYSTERY MAY NOT BE MINTED WITHOUT A STORY BEHIND IT. A bare one — anchored to nothing,
      // linked to no known quest or arc — is a promise the codex cannot keep. The FACT is filed under the
      // place it happened (Erik's own ruling for the seven edge-district hooks), and the STORY is requested.
      if (u.kind === "mystery" && !res.entityId && !linksToStory(u, ctx)) {
        const placeId = ctx.locationId ? slugify(ctx.locationId) : null;
        // ⚠️ THE FACT IS NEVER DROPPED. With a place, it is filed there; with none, it is minted as LORE — a fact
        // without a story is lore, not a mystery — and the story is requested either way.
        if (!placeId && u.fact) extra.push({ ...u, kind: "lore" });
        if (placeId && u.fact) extra.push({ topic: placeId, label: ctx.entities?.places?.[placeId] || placeId, kind: "place", entityId: placeId,
          fact: `${raw ? raw + " — " : ""}${u.fact}`, links: u.links });
        const q = character.codex.deferredMysteries || (character.codex.deferredMysteries = []);
        q.push({ label: raw, hint: smartClamp(String(u.fact || raw), 240), filedUnder: placeId, day: ctx.day ?? null });
        character.codex.deferredMysteries = q.slice(-6);
        continue;
      }
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
      if (res.entityId) {
        t.entityId = res.entityId;
        kindFromEntity(t, ctx.entities);
        seedAliasesFromEntity(t, ctx.entities);
      }
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
  // ⚑ the re-filed facts land on their place — one pass, never a mystery, never recursive
  if (extra.length && !ctx._r49) applyCodexUpdates(character, extra, { ...ctx, _r49: true });
  return touched;
}

/** Absorb topic s into primary p: facts concatenate (deduped, re-sorted chronological),
 *  links + aliases union, inbound links elsewhere rewire to p, s is deleted. */
const UNDO_CAP = 10; // SNG-153: bounded merge history — measured ~1.2KB/receipt on a real 58-topic codex

/** SNG-153. Record enough to UNDO one absorb exactly, then bound the log.
 *  Absorb is lossy in four ways (fact-cap truncation, link-cap truncation, a discarded entityId
 *  when the target already has one, and the source record deleted with its link topology
 *  rewritten), so "just re-split them" cannot restore the original. Snapshotting BOTH sides of the
 *  mutation is the only exact reversal — and at ~2KB a merge, capped at 10, it costs ~0.6% of a
 *  character. That is the "reversible only if it's free" bar met with a measurement, not a hope. */
function recordUndo(character, p, s, relinked) {
  const cx = character?.codex;
  if (!cx) return;
  const log = cx.mergeUndo || (cx.mergeUndo = []);
  log.push({
    at: new Date().toISOString(),
    source: JSON.parse(JSON.stringify(s)),
    targetId: p.id,
    targetBefore: { facts: [...(p.facts || [])], links: [...(p.links || [])], aliases: [...(p.aliases || [])], entityId: p.entityId ?? null },
    relinked
  });
  if (log.length > UNDO_CAP) cx.mergeUndo = log.slice(-UNDO_CAP);
}

/** SNG-153. Undo the most recent merge (or a specific one by index). Restores the absorbed topic
 *  verbatim, rewinds the target's absorbed fields, and puts the rewritten links back. Returns
 *  { restored, into } or null when there is nothing to undo. */
export function undoLastMerge(character, index = -1) {
  ensureCodex(character);
  const log = character.codex.mergeUndo || [];
  if (!log.length) return null;
  const i = index < 0 ? log.length + index : index;
  const rec = log[i];
  if (!rec) return null;
  const topics = character.codex.topics;
  const p = topics[rec.targetId];
  topics[rec.source.id] = JSON.parse(JSON.stringify(rec.source));
  if (p) {
    p.facts = [...rec.targetBefore.facts];
    p.links = [...rec.targetBefore.links];
    p.aliases = [...rec.targetBefore.aliases];
    if (rec.targetBefore.entityId == null) delete p.entityId; else p.entityId = rec.targetBefore.entityId;
  }
  for (const id of rec.relinked || []) {
    const t = topics[id];
    if (t) t.links = (t.links || []).map(l => (l === rec.targetId ? rec.source.id : l));
  }
  character.codex.mergeUndo = log.filter((_, k) => k !== i);
  return { restored: rec.source.label, into: p?.label || rec.targetId };
}

function absorb(topics, p, s, character = null) {
  // SNG-153: snapshot BEFORE mutating — the undo receipt needs the target's pre-merge state and
  // the set of topics whose links are about to be rewritten from s → p.
  const relinked = Object.values(topics).filter(t => t.id !== s.id && (t.links || []).includes(s.id)).map(t => t.id);
  if (character) recordUndo(character, p, s, relinked);
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
  // ⚑ a merge adds facts the summary never saw — mark it due, and carry the absorbed archive as evidence
  if (s.archive?.length) p.archive = [...(p.archive || []), ...s.archive].slice(-CAPS.archivePerTopic);
  if (p.summary) p.summarisedAt = 0;
  if (s.createdDay != null) p.createdDay = Math.min(p.createdDay ?? s.createdDay, s.createdDay);
  if (s.updatedDay != null) p.updatedDay = Math.max(p.updatedDay ?? 0, s.updatedDay);
  delete topics[s.id];
  for (const t of Object.values(topics)) {
    t.links = t.links.map(l => (l === s.id ? p.id : l)).filter((l, k, arr) => l !== t.id && arr.indexOf(l) === k);
  }
}

const pairKey = (aId, bId) => [aId, bId].sort().join("::");

/** SNG-153. Kinds that may merge. `lore` used to be a UNIVERSAL WILDCARD here — and because this
 *  predicate is shared with the AUTO-merge tier, a lore topic could be silently absorbed into a
 *  person on a name hit alone ("The Ashwarden Rite" swallowed into "Aldric"). Lore now merges only
 *  with lore. Pure. */
export function compatibleKinds(a, b) {
  const ka = a?.kind || "lore", kb = b?.kind || "lore";
  return ka === kb;
}

/** SNG-153 GATE 1 — STRUCTURAL NO, decided for free, before any model call.
 *  Returns a reason string when the pair CANNOT be the same thing, else null.
 *  On Erik's live codex this retires half the queue without a single token:
 *  «Pell»(entityId=pell) ↔ «Calvar»(entityId=calvar) are provably two anchored people, and were
 *  being asked about anyway because the scorer read shared LINKS as evidence of identity. */
export function structuralNo(codex, a, b) {
  if (!a || !b || a.id === b.id) return "same topic";
  if (a.entityId && b.entityId && a.entityId !== b.entityId) return `different anchored entities (${a.entityId} ≠ ${b.entityId})`;
  if (isNotSame(codex, a.id, b.id)) return "you already said these are not the same";
  if (!compatibleKinds(a, b)) return `different kinds (${a.kind} ≠ ${b.kind})`;
  return null;
}

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
  absorb(topics, p, s, character); // SNG-153: the player's own merge is undoable too
  return p;
}

/** SNG-019 merge tool: collapse duplicate topics into their primary node — high-confidence
 *  only (same entityId, or matching label/alias with compatible kind). Respects the
 *  player's not-same verdicts. Idempotent. Returns [{into, absorbed}] for reporting. */
export function mergeCodexTopics(character, { entities = null } = {}) {
  ensureCodex(character);
  const topics = character.codex.topics;
  // ⚑ REPAIR BEFORE MERGE, AND ON EVERY PASS. This runs at every load, so the five misfiled topics on a real
  // save heal here with no reconcile step — and a wrong kind stops being a permanent barrier. ⚠️ Not counted
  // in `merged`: a re-key is a rename, and smoke pins a second pass as returning nothing.
  for (const t of Object.values(topics)) {
    if (!t || !t.entityId) continue;
    rekeyToEntity(topics, t, entities);
    kindFromEntity(t, entities);
    seedAliasesFromEntity(t, entities);
  }
  const merged = [];
  const kindRank = { person: 3, place: 3, faction: 2, event: 2, mystery: 1, lore: 0 };
  const compatible = compatibleKinds;
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
        absorb(topics, p, s, character);
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
  const compatible = compatibleKinds;
  const toks = new Map(topics.map(t => [t.id, tokensOf(t)]));
  const out = [];
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const a = topics[i], b = topics[j];
      if (structuralNo(character.codex, a, b)) continue;   // SNG-153 gate 1 — free, before anything else
      // SNG-153: A SHARED LINK IS EVIDENCE OF RELATIONSHIP, NOT OF IDENTITY. Two people who know
      // each other link to each other; two topics in one arc share links to the same places and
      // events. The old scorer counted both as sameness, and either signal ALONE cleared the
      // threshold — so in a dense storyline every pair surfaced, with no name similarity at all.
      // Name overlap is now NECESSARY; link signals may only reinforce it.
      const shared = [...toks.get(a.id)].filter(w => toks.get(b.id).has(w));
      if (!shared.length) continue;
      let score = shared.length * 2;
      if (a.links.includes(b.id) || b.links.includes(a.id)) score += 1;
      score += Math.min(2, a.links.filter(l => b.links.includes(l)).length);
      if (score >= 2) out.push({ aId: a.id, bId: b.id, a: a.label, b: b.label, score, shared });
    }
  }
  return out.sort((x, y) => y.score - x.score).slice(0, max);
}

/** SNG-153 GATE 3 — the middle band gets a JUDGE. Erik: "it's really smart AI, just do it."
 *  ONE batched call for every surviving pair; the model returns same | different | unsure.
 *  - same      → merged automatically, with a receipt (reversible — see undoLastMerge)
 *  - different → recorded as a not-same verdict, so it is never asked again
 *  - unsure    → the ONLY thing that reaches the player
 *  Pure prompt builder; the caller owns the model call so this module stays dependency-free. */
export function buildMergeAdjudicationPrompt(character, pairs) {
  const topics = character.codex.topics;
  const describe = (id) => {
    const t = topics[id];
    if (!t) return `${id}: (missing)`;
    const facts = (t.facts || []).slice(-4).map(f => f.replace(/^\[d\d+\]\s*/, "")).join(" · ");
    return `"${t.label}" [kind ${t.kind}${t.entityId ? `, anchored to ${t.entityId}` : ", not anchored"}]${(t.aliases || []).length ? ` (also called ${t.aliases.join(", ")})` : ""}${facts ? ` — known: ${facts}` : ""}`;
  };
  const lines = pairs.map((p, i) => `${i + 1}. A = ${describe(p.aId)}\n   B = ${describe(p.bId)}`).join("\n");
  return `You are tidying a player's knowledge journal. For each numbered pair, decide whether A and B are RECORDS OF THE SAME THING written down twice, or two different things.

${lines}

Judge on IDENTITY, not association. Two people who know each other, appear in the same events, or share a cause are DIFFERENT — that they are linked is not evidence they are one. Say "same" only for one thing recorded twice: a person under a description and then their name, a place under two phrasings, an event named two ways.
Prefer "different" when unsure of the world; use "unsure" only when it genuinely could go either way and a careful reader would hesitate.

Reply with ONLY a JSON array, one entry per pair, in order:
[{"n":1,"verdict":"same|different|unsure","why":"under 12 words"}]`;
}

/** SNG-153. Apply adjudicated verdicts. Returns { merged:[{into,absorbed}], rejected:n, unsure:[pairs] }.
 *  Every merge here is structurally re-gated first — a model verdict never bypasses gate 1. */
export function applyMergeVerdicts(character, pairs, verdicts) {
  ensureCodex(character);
  const topics = character.codex.topics;
  const merged = [], unsure = [];
  let rejected = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const v = (verdicts || []).find(x => Number(x?.n) === i + 1)?.verdict;
    const a = topics[pair.aId], b = topics[pair.bId];
    if (!a || !b) continue;
    if (structuralNo(character.codex, a, b)) { rejected++; continue; } // re-gate: the model never overrides structure
    if (v === "same") {
      const kindRank = { person: 3, place: 3, faction: 2, event: 2, mystery: 1, lore: 0 };
      const priOf = x => (x.entityId ? 1000 : 0) + (kindRank[x.kind] ?? 0) * 100 + Math.min(99, (x.facts || []).length);
      const [p, s] = priOf(a) >= priOf(b) ? [a, b] : [b, a];
      absorb(topics, p, s, character);
      merged.push({ into: p.label, absorbed: s.label });
    } else if (v === "different") {
      markNotSame(character, pair.aId, pair.bId); rejected++;
    } else {
      unsure.push(pair);
    }
  }
  return { merged, rejected, unsure };
}

/** SNG-153. The player gets a RECEIPT, not a queue — generalising the reconcile note that already
 *  reads right ("Your codex has gathered itself — 3 scattered entries merged under Pell, Calvar"). */
export function mergeDigest(merged) {
  if (!merged?.length) return null;
  const intos = [...new Set(merged.map(m => m.into))];
  return `Your codex has gathered itself — ${merged.length} scattered entr${merged.length === 1 ? "y" : "ies"} merged under ${intos.slice(0, 3).join(", ")}${intos.length > 3 ? ` and ${intos.length - 3} more` : ""}.`;
}

function normNameTokens(s) {
  return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
}

/** Topics relevant right now: linked to this location, tied to active quests,
 *  or freshly updated. This is how "accumulated knowledge" comes BACK to you. */
/** ⚑ WHICH TOPICS HAVE EARNED A SUMMARY. A topic qualifies when it has `summariseEvery` facts it has not yet
 *  been summarised over — first at 6, then every 6 after — so this fires at a threshold and never every turn.
 *  Biggest first, because the wall of 24 is the one the player is actually suffering. PURE. */
export function topicsNeedingSummary(character, { every = CAPS.summariseEvery, max = 8 } = {}) {
  const topics = Object.values(character?.codex?.topics || {});
  const due = topics.filter(t => t && Array.isArray(t.facts)
    && t.facts.length >= every
    && (t.facts.length - (Number(t.summarisedAt) || 0)) >= every);
  return due.sort((a, b) => b.facts.length - a.facts.length).slice(0, max).map(t => t.id);
}

/** ⛔ WHAT THE MODEL IS ASKED — one batched call, numbered like the merge adjudicator so answers match by
 *  `n`, never by name. It sees EVERY fact, because the summary is REDERIVED from all of them, never grown
 *  from the last one. ⚠️ And it is told the one thing that matters: no new claims. A summary is a compression
 *  of the record, not a continuation of it. PURE. */
export function buildSummaryPrompt(character, ids = []) {
  const topics = character?.codex?.topics || {};
  const bare = (f) => String(f).replace(/^\[d\d+\]\s*/, "");
  const rows = ids.map((id, i) => {
    const t = topics[id];
    if (!t) return `${i + 1}. (missing)`;
    const all = [...(t.archive || []), ...(t.facts || [])].map(bare);
    return `${i + 1}. "${t.label}" [${t.kind}${t.entityId ? `, anchored to ${t.entityId}` : ""}]${(t.aliases || []).length ? ` (also called ${t.aliases.join(", ")})` : ""}` +
      `\n   facts, oldest first:\n` + all.map(f => `   - ${f}`).join("\n");
  });
  return [
    "You are compressing a character's codex — what they KNOW about each subject below — into a summary a player will read.",
    "For each numbered subject, write 2 to 4 sentences in present tense that a reader could take as the whole of what is known.",
    "⛔ RULES: state only what the facts state — no new claims, no speculation, no softening. Keep every name. If the facts contradict each other, say so in one clause rather than choosing.",
    "The facts remain on record beneath the summary as evidence; your job is the reading, not the archive.",
    "Reply with JSON only: {\"summaries\": [{\"n\": 1, \"summary\": \"...\"}, ...]} — one entry per number, in order.",
    "",
    ...rows,
  ].join("\n");
}

/** ⚑ THE ANSWER LANDS. Sets `summary`, remembers how many facts it covered (`summarisedAt`) so the next one
 *  is due after `summariseEvery` more, and RETIRES the oldest facts beyond `keepFacts` into `archive`.
 *  ⛔ Retired, not deleted: "a summary the player cannot audit is a claim." The archive is capped so a
 *  subject that lives for a year does not grow without bound. Returns the ids it wrote. PURE. */
export function applySummaries(character, ids = [], verdicts = [], { keepFacts = CAPS.keepFacts, day = null } = {}) {
  const topics = character?.codex?.topics || {};
  const written = [];
  const list = Array.isArray(verdicts) ? verdicts : (verdicts?.summaries || []);
  for (let i = 0; i < ids.length; i++) {
    const t = topics[ids[i]];
    const v = list.find(x => Number(x?.n) === i + 1);
    const text = String(v?.summary || "").trim();
    if (!t || !text) continue;
    t.summary = smartClamp(text, CAPS.summaryChars);
    t.summarisedAt = (t.facts || []).length;
    if (day != null) t.summaryDay = day;
    if ((t.facts || []).length > keepFacts) {
      const retire = t.facts.slice(0, t.facts.length - keepFacts);
      t.archive = [...(t.archive || []), ...retire].slice(-CAPS.archivePerTopic);
      t.facts = t.facts.slice(-keepFacts);
      t.summarisedAt = t.facts.length;        // due again after `every` NEW facts, not `every` total
    }
    written.push(t.id);
  }
  return written;
}

/** What the player reads for a topic: the summary if it has one, else the facts. The facts are always the
 *  evidence beneath it. */
export function topicReading(t) {
  if (!t) return { summary: null, evidence: [], archived: 0 };
  return { summary: t.summary || null, evidence: t.facts || [], archived: (t.archive || []).length };
}

export function codexForGM(character, { locationId = null, questTitles = [], playerInput = "" } = {}) {
  const topics = Object.values(character.codex?.topics || {});
  if (!topics.length) return null;
  const locSlug = slugify(locationId || "");
  const questWords = questTitles.flatMap(t => slugify(t).split("-")).filter(w => w.length > 3);
  // SNG-176: the codex was ALREADY global — location is a +3 boost, not a filter, and there is a
  // newest-few fallback. The gap was never scope; it was that the scorer never saw the QUESTION.
  // A topic the player just named outranks the one they happen to be standing on.
  const askWords = slugify(String(playerInput || "")).split("-").filter(w => w.length > 3);
  const scored = topics.map(t => {
    let score = 0;
    if (t.links.includes(locSlug) || t.id === locSlug) score += 3;
    if (questWords.some(w => t.id.includes(w) || t.links.some(l => l.includes(w)))) score += 2;
    if (askWords.length && (askWords.some(w => t.id.includes(w)) || askWords.some(w => slugify(t.label || "").includes(w)))) score += 4;
    score += Math.min(2, (t.updatedDay ?? 0) / 50); // gentle recency lean
    return { t, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
  const pick = scored.length ? scored.map(x => x.t) : topics.slice(-4); // fallback: newest few
  // ⛔ SNG-360 — THE ID WAS NEVER SHOWN. This emitted the LABEL only, while the op contract asks the GM for
  // a "topic (stable kebab id)". It was asked to reuse an identifier it was never given, and did the only
  // thing it could: invent a fresh one every beat. Erik's codex grew "The Veil's Tiring Hold", "The Veil's
  // Breaking Choice" and "Veil as Boundary-Agent" — three topics, one Veil — and then asked HIM to
  // reconcile them, six pairs at a time.
  //
  // ⚠️ THE MERGE QUEUE WAS NEVER THE BUG. It is the symptom of an allocation that never happened, and no
  // amount of judging pairs downstream repairs a writer that mints a new subject per sentence.
  return pick.map(t =>
    // ⚑ SPEC_codex Q3 — FEED THE SUMMARY, NOT THE FACTS. A summarised topic hands the GM its reading plus
    // only the facts newer than that reading; an unsummarised one still hands the last three.
    `- [${t.id}] ${t.label} (${t.kind}): ${t.summary
      ? `${t.summary}${(t.facts || []).length > (Number(t.summarisedAt) || 0) ? " | since: " + t.facts.slice(Number(t.summarisedAt) || 0).slice(-2).join(" | ") : ""}`
      : (t.facts.slice(-3).join(" | ") || "known of, little learned")}` +
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
