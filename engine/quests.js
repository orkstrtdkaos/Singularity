// quests.js — quests are typed state the GM drives through clamped ops, same law
// as every other delta: the model proposes {op, questId, ...}, the engine applies
// within bounds. Quests are what keep the game MOVING — the GM is instructed to
// weave a location's questSeeds into play whenever the scene idles.
//
// SNG-BATCH-7 Phase 3: RESOLVE before mint/drop. A progress/complete op on a drifted
// title used to `find` by exact id/title and SILENTLY DROP on mismatch (quest progress
// lost). Now the SNG-019 name-resolution primitive matches id → title/alias fuzzy, an
// unresolvable op SURFACES a note instead of vanishing, and a "start" that resolves to an
// existing quest doesn't fork a duplicate. Giver/location tie to codex entityIds.

import { namesMatch, resolveByName } from "./namematch.js";

/** Resolve an incoming quest op to an existing quest: exact id → slugified-title id →
 *  title/alias fuzzy. Returns the quest or null. */
export function resolveQuest(character, u) {
  const quests = character.quests || [];
  const id = u.questId ? slugify(u.questId) : null;
  if (id) { const byId = quests.find(q => q.id === id); if (byId) return byId; }
  const title = u.title || "";
  if (title) {
    const st = slugify(title);
    const byTitleId = quests.find(q => q.id === st);
    if (byTitleId) return byTitleId;
    const byName = resolveByName(title, quests, { getLabel: q => q.title, getAliases: q => q.aliases || [] });
    if (byName) return byName;
  }
  return null;
}

function recordQuestAlias(q, title) {
  if (!title || namesMatch(q.title, title) && title.toLowerCase() === q.title.toLowerCase()) return;
  if (title.toLowerCase() === q.title.toLowerCase()) return;
  q.aliases = q.aliases || [];
  if (!q.aliases.some(a => a.toLowerCase() === title.toLowerCase())) q.aliases = [...q.aliases, String(title).slice(0, 80)].slice(-6);
}

/** Resolve a giver/location name to a codex entity id (ctx.entities: {people, places}). */
function entityIdFor(name, pool) {
  if (!name || !pool) return null;
  for (const [id, label] of Object.entries(pool)) {
    if (namesMatch(name, label) || namesMatch(name, id.replace(/-/g, " "))) return slugify(id);
  }
  return null;
}

export function applyQuestUpdates(character, updates = [], ctx = {}) {
  character.quests = character.quests || [];
  const notes = [];
  const clampNote = n => String(n).slice(0, 200);
  for (const u of updates.slice(0, 4)) {
    const op = u.op;
    const existing = resolveQuest(character, u);
    if (op === "start") {
      if (existing) { // resolves to a quest we already have — progress it, never fork a dupe
        recordQuestAlias(existing, u.title);
        if (u.note && existing.status === "active") existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        continue;
      }
      if (character.quests.filter(q => q.status === "active").length >= 5) continue; // focus, not a checklist
      const id = u.questId ? slugify(u.questId) : slugify(u.title || "quest");
      character.quests.push({
        id,
        title: String(u.title || "A new undertaking").slice(0, 80),
        summary: String(u.summary || u.note || "").slice(0, 240),
        giver: u.giver ? String(u.giver).slice(0, 60) : null,
        giverEntityId: entityIdFor(u.giver, ctx.entities?.people),
        locationId: u.locationId || null,
        locationEntityId: u.locationId ? slugify(u.locationId) : entityIdFor(u.giver, ctx.entities?.places),
        status: "active",
        progress: u.note ? [clampNote(u.note)] : [],
        aliases: [],
        startedAt: new Date().toISOString()
      });
      notes.push(`New quest: ${u.title}`);
    } else {
      if (!existing) { notes.push(`(couldn't match a quest for "${u.title || u.questId || "?"}" — not applied)`); continue; } // NEVER silently drop
      if (existing.status !== "active") continue; // resolved quests don't re-open
      recordQuestAlias(existing, u.title);
      if (op === "progress") {
        if (u.note) existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        notes.push(`Quest updated: ${existing.title}`);
      } else if (op === "complete" || op === "fail") {
        existing.status = op === "complete" ? "completed" : "failed";
        existing.resolvedAt = new Date().toISOString();
        if (u.note) existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        if (op === "complete") {
          const xp = Math.max(0, Math.min(50, u.xpReward | 0 || 25));
          character.xp = (character.xp || 0) + xp;
          notes.push(`Quest complete: ${existing.title} (+${xp} xp)`);
        } else {
          notes.push(`Quest failed: ${existing.title}`);
        }
      }
    }
  }
  return notes;
}

/** SNG-BATCH-7 Phase 3 reconcile: collapse duplicate quests a pre-resolver save minted
 *  (same slug-title, or fuzzy title/alias match). Keeps the most-progressed/most-resolved
 *  as primary; unions progress (deduped) + aliases. Idempotent. Returns [{into,absorbed}]. */
export function dedupeQuests(character) {
  const quests = character.quests || [];
  const merged = [];
  const statusRank = { active: 0, completed: 2, failed: 1 };
  let changed = true;
  while (changed) {
    changed = false;
    outer:
    for (let i = 0; i < quests.length; i++) {
      for (let j = i + 1; j < quests.length; j++) {
        const a = quests[i], b = quests[j];
        const match = a.id === b.id || namesMatch(a.title, b.title) ||
          (a.aliases || []).some(x => namesMatch(x, b.title)) || (b.aliases || []).some(x => namesMatch(x, a.title));
        if (!match) continue;
        // primary: resolved beats active, then more progress, then earlier start
        const pri = q => (statusRank[q.status] ?? 0) * 100 + (q.progress?.length || 0);
        const [p, s] = pri(a) >= pri(b) ? [a, b] : [b, a];
        for (const pr of s.progress || []) if (!(p.progress || []).includes(pr)) p.progress = [...(p.progress || []), pr].slice(-8);
        recordQuestAlias(p, s.title);
        for (const al of s.aliases || []) recordQuestAlias(p, al);
        p.giverEntityId = p.giverEntityId || s.giverEntityId;
        p.locationEntityId = p.locationEntityId || s.locationEntityId;
        if (s.status !== "active" && p.status === "active") { p.status = s.status; p.resolvedAt = s.resolvedAt; }
        quests.splice(quests.indexOf(s), 1);
        merged.push({ into: p.title, absorbed: s.title });
        changed = true;
        break outer;
      }
    }
  }
  return merged;
}

/** Active-quest block for the GM prompt. */
export function questsForGM(character) {
  const active = (character.quests || []).filter(q => q.status === "active");
  if (!active.length) return null;
  return active.map(q =>
    `- [${q.id}] ${q.title}: ${q.summary}${q.giver ? ` (from ${q.giver})` : ""}${q.progress?.length ? ` | latest: ${q.progress[q.progress.length - 1]}` : ""}`
  ).join("\n");
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "quest";
}
