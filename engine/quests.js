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

import { namesMatch, resolveByName, smartClamp } from "./namematch.js";
import { traditionOf } from "./traditions.js";
import { createWake } from "./wake.js"; // SNG-204: a significant outcome leaves a wake the world continues from

/** SNG-217: models often "type" \n / \t as the literal two-character escape inside their JSON strings.
 *  Valid JSON parses that as backslash-n (two chars), which then renders verbatim — literal `\n` on screen
 *  (Erik's Second Thread bug). Normalize a prose field on WRITE so every consumer — render, GM context,
 *  search, export — sees real line breaks. Targets the formatting escapes ONLY: a real newline is never
 *  matched, and a legitimately backslashed literal in prose is rare (and safe to leave). Markdown (`**bold**`)
 *  is intentionally LEFT for the render layer, not stripped here — the intent is preserved, rendered on display. */
export function normalizeProse(s) {
  if (typeof s !== "string" || s.indexOf("\\") === -1) return s; // fast path: no backslash → nothing to normalize
  return s.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

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
  const clampNote = n => smartClamp(normalizeProse(n), 600); // SNG-076: model note — bound generously, on a word boundary; SNG-217: literal \n → real break
  // SNG-162 §3: PARTITION BEFORE CAPPING. `updates.slice(0, 4)` dropped by ARRAY ORDER, so a busy
  // turn emitting three `progress` ops and one `complete` could lose the complete — arbitrarily,
  // depending on where the model happened to put it. That is a second, independent cause of "the
  // quest didn't close". Terminal ops go first and are never dropped; start/progress fill the rest.
  // Same total work per turn.
  const terminal = updates.filter(u => u?.op === "complete" || u?.op === "fail");
  const rest = updates.filter(u => u?.op !== "complete" && u?.op !== "fail");
  const budgeted = [...terminal, ...rest].slice(0, Math.max(4, terminal.length));
  for (const u of budgeted) {
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
        summary: smartClamp(normalizeProse(u.summary || u.note || ""), 600), // SNG-076: model quest summary — word-boundary clamp; SNG-217: literal \n → real break
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
        // SNG-162 §6.4: dedupe merges NAMED fields only, so a flag added later is silently lost in
        // a merge. awaitingResolution is the gate on the outcome buttons — drop it and a quest that
        // reached its decision point quietly stops offering one.
        if (s.awaitingResolution) p.awaitingResolution = true;
        p.stageIndex = Math.max(p.stageIndex || 0, s.stageIndex || 0);
        for (const cs of s.completedStages || []) if (!(p.completedStages || []).includes(cs)) p.completedStages = [...(p.completedStages || []), cs];
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

// ---------- SNG-BATCH-10 Phase 3 / SNG-065: STRUCTURED quests ----------
// Authored quests (content/packs/valley/quests.json) carry stakes, engine-testable stages,
// multiple routes across the great circle, branched outcomes, and a consequences block the
// engine APPLIES on resolution. They coexist with the freeform GM-driven quests above; a
// structured quest record carries structured:true + stages/routes/outcomes/stageIndex.
// The schema's rule: IF YOU CANNOT NAME THE COST OF IGNORING IT, IT IS NOT A QUEST.

/** The schema's real-quest test: stakes named + at least one stage + at least one outcome. */
export function isRealQuest(def) {
  return !!(def && def.stakes && Array.isArray(def.stages) && def.stages.length && Array.isArray(def.outcomes) && def.outcomes.length);
}

/** Normalize an authored quest into a not-yet-started character-quest record. Outcomes carry both
 *  `narration` (authored prose, the chronicle voice) and `effects[]` (machine-readable deltas the
 *  engine applies). Legacy outcomes with only `consequences[]` are still honored (prose fallback). */
export function structuredQuestRecord(def) { // registry:internal
  return {
    id: slugify(def.id), title: def.name || def.id, structured: true, status: "available",
    premise: normalizeProse(def.premise || ""), stakes: normalizeProse(def.stakes || ""), axis: def.axis || null, // SNG-217: literal \n → real break on write
    traditions: def.traditions || [], giver: def.giver || null, legend: def.legend || null,
    region: def.region || null, tier: def.tier || null,
    arcId: def.arcId || null, locationId: def.locationId || null,   // SNG-112: shared-arc key + own place (parallel player quests)
    stages: (def.stages || []).map(s => ({ id: s.id, objective: normalizeProse(s.objective), condition: normalizeProse(s.condition), change: normalizeProse(s.change) })),
    routes: def.routes || {},
    outcomes: (def.outcomes || []).map(o => {
      const narr = o.narration || o.consequences || [];
      return {
        id: o.id, name: o.name, summary: normalizeProse(o.summary),
        narration: Array.isArray(narr) ? narr.map(normalizeProse) : normalizeProse(narr),   // prose for the chronicle (legacy: consequences)
        effects: o.effects || null                          // machine-readable deltas (null → legacy prose parse)
      };
    }),
    stageIndex: 0, completedStages: [], progress: [], aliases: []
  };
}

/** Start a structured quest (idempotent — never forks a duplicate). */
export function startStructuredQuest(character, def, ctx = {}) {
  if (!def || !def.id) return { ok: false, why: "unknown quest" }; // 146f: a missing def refuses cleanly, never throws
  character.quests = character.quests || [];
  const id = slugify(def.id);
  const existing = character.quests.find(q => q.id === id);
  if (existing) return { ok: false, why: "already in your log", quest: existing };
  if (!isRealQuest(def)) return { ok: false, why: "not a structured quest" };
  const rec = structuredQuestRecord(def);
  rec.status = "active"; rec.startedAt = ctx.nowISO || null; rec.startedWorldDay = ctx.worldDay ?? null;
  character.quests.push(rec);
  return { ok: true, quest: rec };
}

/** Mark a stage complete (its engine-testable condition met), applying the stage `change`
 *  as a findable progress note and advancing the stage pointer. */
/** SNG-162. THE TRIGGER, not a second adjudicator.
 *
 *  The engine half was already correct — `completeQuestStage` and `resolveStructuredQuest` do the
 *  right thing and are untouched. What did not exist was a way for the FICTION to reach them: their
 *  only callers were two button handlers, so a player could spend three scenes satisfying a stage's
 *  condition and the quest would not move until they left the narrative and clicked. "When the
 *  player acts" had been implemented as "when the player clicks", which is why two players
 *  independently adopted `unstickQuest` — a REPAIR op — as the normal way to finish a quest.
 *
 *  The model OBSERVES; the engine ADJUDICATES (same shape as SNG-153's gating). The GM reports that
 *  something happened and names the stage; every check here is free and structural, and the model
 *  never selects an outcome, picks a branch, or sets XP.
 *
 *  Deliberately NOT matching `evidence` against the stage's authored `condition` prose (PO ruling,
 *  §6.3): prose-matching prose is the judgement the model is already making, and re-checking it in
 *  the engine buys precision we cannot verify. Check 2 is what actually protects the player.
 *
 *  Returns { ok, why?, change?, stage?, awaitingResolution? }. A rejection is RECORDED, never silent. */
export function advanceStructuredQuest(character, op = {}, ctx = {}) {
  const qid = op.questId ? slugify(op.questId) : null;
  const q = (character.quests || []).find(x => x.id === qid && x.structured);
  if (!q || q.status !== "active") return { ok: false, why: "no-such-quest", questId: qid };
  const stages = q.stages || [];
  const current = stages[q.stageIndex || 0];
  // ALREADY-DONE IS CHECKED FIRST, ahead of the stage-order gate. Once a stage completes the index
  // has moved past it, so a re-report would otherwise come back "not-current-stage" — true, but the
  // wrong diagnosis: it reads as the model misbehaving when it is simply repeating itself on a
  // retry. Both still refuse; only the recorded reason differs, and these reasons are surfaced.
  if ((q.completedStages || []).includes(op.stageId)) return { ok: false, why: "already-done", questId: qid };
  // THE LOAD-BEARING CHECK: the named stage must be the CURRENT one. A model naming a later stage
  // may not skip ahead, whatever it claims happened — stage order is un-jumpable structurally.
  if (!current || op.stageId !== current.id) {
    return { ok: false, why: "not-current-stage", questId: qid, named: op.stageId || null, expected: current?.id || null };
  }
  const evidence = smartClamp(String(op.evidence || "").trim(), 200);
  if (!evidence) return { ok: false, why: "no-evidence", questId: qid };

  const r = completeQuestStage(character, q.id, op.stageId);   // the EXISTING applier, unchanged
  if (!r.ok) return { ok: false, why: r.why, questId: qid };
  // The reason the stage advanced is visible to the player, beside the authored change note.
  q.progress = [...(q.progress || []), `↳ ${evidence}`].slice(-12);

  // THE FINAL STAGE NEVER AUTO-RESOLVES. Progress is automatic; RESOLUTION is always the player's
  // explicit choice — "how I want to resolve it until it's time".
  const done = (q.completedStages || []).length >= stages.length || (q.stageIndex || 0) >= stages.length;
  if (done && !q.awaitingResolution) q.awaitingResolution = true;
  return { ok: true, questId: q.id, title: q.title, change: r.change, stage: r.stage, nextStage: r.nextStage, awaitingResolution: !!q.awaitingResolution };
}

export function completeQuestStage(character, questId, stageId) {
  const q = (character.quests || []).find(x => x.id === slugify(questId) && x.structured);
  if (!q || q.status !== "active") return { ok: false, why: "no active structured quest" };
  const si = q.stages.findIndex(s => s.id === stageId);
  if (si < 0) return { ok: false, why: "unknown stage" };
  q.completedStages = q.completedStages || [];
  if (!q.completedStages.includes(stageId)) q.completedStages.push(stageId);
  q.stageIndex = Math.max(q.stageIndex || 0, Math.min(si + 1, q.stages.length));
  const change = q.stages[si].change;
  if (change && !(q.progress || []).includes(change)) q.progress = [...(q.progress || []), change].slice(-12);
  // CCODE-16: the invariant "every stage behind you → the decision opens" lives HERE, in the one applier
  // BOTH write paths go through (the GM-op path via advanceStructuredQuest, and the manual "Mark this stage
  // met" button in the UI). The button path used to skip it, so a hand-completed quest could reach the final
  // stage yet never surface its endings — it read "This isn't finished yet" with nothing left to do. This is
  // NOT auto-resolve: awaitingResolution only unlocks the outcome menu; choosing the ending stays the player's.
  const done = (q.completedStages.length >= q.stages.length) || (q.stageIndex >= q.stages.length);
  if (done && !q.awaitingResolution) q.awaitingResolution = true;
  return { ok: true, change, stage: q.stages[si], nextStage: q.stages[q.stageIndex] || null };
}

/** SNG-BATCH-10 BOUNDARY-1 CLOSE: apply an outcome's MACHINE-READABLE effects[] deterministically.
 *  Every effect type from quest_structure.json is handled and lands somewhere durable + findable.
 *  ctx.recordEvent is an optional sink (dated propagating events) so the engine stays decoupled
 *  from sync; ctx.recordFact pins a findable fact. Returns the list of applied changes + total xp. */
function applyQuestEffects(character, quest, effects, ctx = {}) {
  const applied = [];
  character.peopleDisposition = character.peopleDisposition || {};
  character.worldEvents = character.worldEvents || [];
  character.npcRegistry = character.npcRegistry || {};
  character.locationState = character.locationState || {};
  let xp = 0;
  const pinFact = (text, secret) => { if (typeof ctx.recordFact === "function") { try { ctx.recordFact({ text, secret: !!secret }); } catch { /* sink optional */ } } };
  for (const e of effects || []) {
    if (!e || !e.type) continue;
    switch (e.type) {
      // NPC + people keys are authored content ids (underscores intact) — never slugify them.
      case "npc_state": {
        if (e.npc) { const k = e.npc; character.npcRegistry[k] = { ...(character.npcRegistry[k] || {}), name: character.npcRegistry[k]?.name || e.npc, questState: e.state, questNote: e.note || null }; }
        applied.push({ type: "npc_state", npc: e.npc, state: e.state });
        break;
      }
      case "disposition": {
        // SNG-126: a company LIAISON for this people speeds reputation while they travel with you
        // (ctx.liaisonMult is { [people]: multiplier }, supplied by the app from liaisonFactions).
        if (e.people && Number.isFinite(e.delta)) { const gain = Math.round(e.delta * (ctx.liaisonMult?.[e.people] || 1)); character.peopleDisposition[e.people] = (character.peopleDisposition[e.people] || 0) + gain; applied.push({ type: "disposition", people: e.people, delta: gain }); }
        break;
      }
      case "codex_fact": {
        if (e.text) { pinFact(e.text, e.secret); applied.push({ type: "codex_fact", text: e.text, secret: !!e.secret }); }
        break;
      }
      case "world_event": {
        if (e.text) {
          const day = (ctx.worldDay ?? null); const at = day == null ? null : day + (Number.isFinite(e.delayDays) ? e.delayDays : 0);
          const ev = { kind: "quest_consequence", questId: quest.id, questTitle: quest.title, text: smartClamp(e.text, 800), worldDay: at, propagates: e.propagates !== false }; // SNG-076: authored effect text — render whole (generous safety bound only)
          character.worldEvents.push(ev);
          if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
          applied.push({ type: "world_event", text: ev.text, worldDay: at });
        }
        break;
      }
      case "location_state": {
        if (e.location) { const l = e.location; character.locationState[l] = { ...(character.locationState[l] || {}), change: e.change || null, questId: quest.id }; applied.push({ type: "location_state", location: e.location, change: e.change }); }
        break;
      }
      // SNG-203 §3 / Phase 2B: a world_arc_quest is a signed PUSH on a greater arc — not a forward-only
      // ratchet. Direction comes from `to − from` (advance +, retreat −, hold 0) or an explicit `push`;
      // `weight` (1–3) scales it, so a legend/epic-driven action moves the world harder. The push accumulates
      // into this actor's contribution; the arc's canonical stage is the NET of every actor's pushes (Erik's
      // "structural directionality as net resultant of vector fields"), so an arc can be pushed BACKWARD when
      // one player counters another. Any non-zero push broadcasts as a propagating world_event; the arc's
      // hidden direction (pressureOnAdvance/tendency) never rides along — only the authored public `note`.
      case "arc_stage": {
        if (e.arcId && (Number.isFinite(e.to) || Number.isFinite(e.push))) {
          character.worldState = character.worldState || {};
          character.worldState.arcStages = character.worldState.arcStages || {};
          const prev = character.worldState.arcStages[e.arcId] || {};
          const weight = Math.max(1, Math.min(3, Math.round(Math.abs(e.weight)) || 1));
          const dir = Number.isFinite(e.push) ? Math.sign(e.push)
            : (Number.isFinite(e.from) && Number.isFinite(e.to)) ? Math.sign(e.to - e.from) : 0;
          const delta = dir * weight;
          const push = (Number.isFinite(prev.push) ? prev.push : 0) + delta;
          character.worldState.arcStages[e.arcId] = { ...prev, push, sinceDay: ctx.worldDay ?? null, byQuest: quest.id };
          if (delta !== 0) {
            const moved = delta > 0 ? "advanced" : "receded";
            const ev = { kind: "arc_stage", arcId: e.arcId, questId: quest.id, questTitle: quest.title, dir: Math.sign(delta), weight,
              text: smartClamp(e.note || `A greater arc of the valley ${moved} — and everyone can see it.`, 800),
              worldDay: ctx.worldDay ?? null, propagates: e.propagates !== false };
            character.worldEvents.push(ev);
            if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
          }
          applied.push({ type: "arc_stage", arcId: e.arcId, push, delta });
        }
        break;
      }
      case "quest_seed": {
        if (e.text) { pinFact(`A thread opens: ${e.text}`, false); applied.push({ type: "quest_seed", text: e.text }); }
        break;
      }
      case "ally": {
        if (e.npc) { const k = e.npc; character.npcRegistry[k] = { ...(character.npcRegistry[k] || {}), name: character.npcRegistry[k]?.name || e.npc, ally: true, allyNote: e.note || null }; applied.push({ type: "ally", npc: e.npc }); }
        break;
      }
      case "xp": {
        xp += Math.max(0, Math.min(60, e.amount | 0)); applied.push({ type: "xp", amount: e.amount | 0 });
        break;
      }
      default: applied.push({ type: "unknown", raw: e.type });
    }
  }
  return { applied, xp };
}

/** Legacy fallback: parse tagged-prose consequences when an outcome has no effects[] (old saves /
 *  pre-effects content). Best-effort; the chronicle write is still the findable floor. */
function applyQuestProse(character, quest, prose, ctx = {}) {
  const applied = [];
  character.peopleDisposition = character.peopleDisposition || {};
  character.worldEvents = character.worldEvents || [];
  for (const raw of prose || []) {
    const c = String(raw);
    if (/world[-\s]?event/i.test(c)) {
      const text = c.replace(/^[^:]*world[-\s]?event[^:]*:\s*/i, "").trim() || c;
      const ev = { kind: "quest_consequence", questId: quest.id, questTitle: quest.title, text: smartClamp(text, 800), worldDay: ctx.worldDay ?? null, propagates: true }; // SNG-076: authored/derived consequence — word-boundary
      character.worldEvents.push(ev);
      if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
      applied.push({ type: "world_event", text: ev.text });
    }
    const dm = c.match(/([A-Za-z][\w'-]*(?:\s+[A-Za-z][\w'-]*)?)\s+disposition[^.]*?\b(strongly\s+raised|raised|lowered|wary\s+respect)/i);
    if (dm) {
      const who = slugify(dm[1].trim()); const word = dm[2].toLowerCase();
      const base = /lower/.test(word) ? -1 : /strong/.test(word) ? 2 : 1;
      const delta = base < 0 ? base : Math.round(base * (ctx.liaisonMult?.[who] || 1)); // SNG-126: a liaison speeds gains, not penalties
      character.peopleDisposition[who] = (character.peopleDisposition[who] || 0) + delta;
      applied.push({ type: "disposition", people: who, delta });
    }
  }
  return applied;
}

/** Resolve a structured quest at a chosen outcome — APPLIES its consequences. Prefers the authored
 *  machine-readable effects[]; falls back to prose parsing for legacy outcomes. The floor either way:
 *  a findable chronicle entry so the player can always go back and SEE what they did. */
export function resolveStructuredQuest(character, questId, outcomeId, ctx = {}) {
  const q = (character.quests || []).find(x => x.id === slugify(questId) && x.structured);
  if (!q || q.status !== "active") return { ok: false, why: "not an active structured quest" };
  const outcome = q.outcomes.find(o => o.id === outcomeId);
  if (!outcome) return { ok: false, why: "unknown outcome" };
  q.status = "resolved";
  q.outcomeId = outcome.id; q.outcomeName = outcome.name;
  q.resolvedAt = ctx.nowISO || null; q.resolvedWorldDay = ctx.worldDay ?? null;
  let applied, xp;
  if (Array.isArray(outcome.effects) && outcome.effects.length) {
    ({ applied, xp } = applyQuestEffects(character, q, outcome.effects, ctx));
    if (!xp) xp = Math.max(0, Math.min(60, ctx.xpReward | 0 || 30)); // effects[] with no xp effect → default award
  } else {
    applied = applyQuestProse(character, q, outcome.narration || [], ctx);
    xp = Math.max(0, Math.min(60, ctx.xpReward | 0 || 30));
  }
  character.chronicle = character.chronicle || [];
  character.chronicle.push({
    kind: "quest_resolved", questId: q.id, title: q.title, outcome: outcome.name,
    summary: outcome.summary, narration: outcome.narration || [],
    worldDay: ctx.worldDay ?? null, at: ctx.nowISO || null
  });
  character.xp = (character.xp || 0) + xp;
  // SNG-204: a significant outcome leaves a WAKE the world continues from — provenance + the applied change +
  // the arc's pressure-seed + a lean on the arcs it connects to. Never throws; a wake is additive to the resolve.
  let wake = null;
  try { wake = createWake(character, q, outcome, applied, ctx.content || {}, ctx); } catch { /* wake is additive — never block a resolve */ }
  return { ok: true, outcome, applied, xp, wake };
}

/** SNG-112: has the player already TOUCHED this quest's thread? True when they already KNOW one
 *  of its people (its giver or legend is in their npc registry, disposition, or codex), or another
 *  quest they hold references the same people. A continuation surfaces; a cold unrelated arc does not.
 *  Region is deliberately NOT a thread signal — a shared region is not a shared story. */
export function threadTouched(def, character) {
  const ids = [def.giver, def.legend, ...(def.entities || [])].filter(Boolean).map(x => slugify(x));
  if (!ids.length) return false;
  const known = new Set();
  for (const k of Object.keys(character.npcRegistry || {})) known.add(slugify(k));
  for (const k of Object.keys(character.peopleDisposition || {})) known.add(slugify(k));
  for (const t of Object.values(character.codex?.topics || {})) { if (t.entityId) known.add(slugify(t.entityId)); if (t.id) known.add(slugify(t.id)); }
  if (ids.some(id => known.has(id))) return true;
  // another quest already on the same thread's people (giver/legend by id or resolved entity id)
  for (const q of character.quests || []) {
    const qref = [q.giver, q.giverEntityId, q.legend].filter(Boolean).map(x => slugify(x));
    if (qref.some(r => ids.includes(r))) return true;
  }
  return false;
}

/** Which authored quests are STARTABLE for a character here. SNG-112: sharing a REGION is no longer
 *  enough — a region holds many places and threads, so a bare region match used to push an unrelated
 *  arc into the scene (Cellaceron's Fendt quest surfaced to off-thread, far-away Silas). A real
 *  connection must hold: the giver is present, the player is AT or ADJACENT to the quest's location
 *  (its own locationId, else the giver's home via ctx.npcHomes), or the player has already TOUCHED the
 *  quest's thread. Region is a soft signal ONLY on an explicit browse surface (ctx.board — a quest
 *  board the player chose to open), never an automatic interruption. Parallel arcs: a player already
 *  holding a quest on a shared def.arcId is not offered a second instance of the same arc. */
export function availableStructuredQuests(character, catalog = [], ctx = {}) {
  const have = new Set((character.quests || []).map(q => q.id));
  const heldArcs = new Set((character.quests || []).map(q => q.arcId).filter(Boolean));
  const sceneNames = (ctx.sceneNpcNames || []).map(n => String(n).toLowerCase());
  const near = new Set([ctx.locationId, ...(ctx.adjacentLocationIds || [])].filter(Boolean)); // at OR adjacent
  const npcHomes = ctx.npcHomes || {};
  const noContext = !ctx.region && !ctx.locationId && !ctx.sceneNpcNames && !ctx.board; // e.g. a bare board → offer all
  return (catalog || []).filter(isRealQuest).filter(def => {
    if (have.has(slugify(def.id))) return false;
    if (def.arcId && heldArcs.has(def.arcId)) return false;                 // one instance per shared arc
    // SNG-132: a BOUND legendary arc follows its CHARACTER, not a location — it ignores the proximity gate
    // and surfaces ONLY for the character/player it's bound to (never anyone else, even on a bare board).
    if (def.boundToCharacter || def.boundToPlayer) {
      return (def.boundToCharacter && character?.name && namesMatch(character.name, def.boundToCharacter))
        || (def.boundToPlayer && character?.playerKey && character.playerKey === def.boundToPlayer);
    }
    if (noContext) return true;
    if (def.giver && sceneNames.some(n => namesMatch(n, def.giver))) return true;   // (1) giver present
    const questLoc = def.locationId || (def.giver ? npcHomes[slugify(def.giver)] : null); // (2) proximity
    if (questLoc && near.has(questLoc)) return true;
    if (threadTouched(def, character)) return true;                          // (3) thread touched
    if (ctx.board && ctx.region && def.region && def.region === ctx.region) return true; // (4) explicit browse only
    return false;
  });
}

/** The routes a character's domains open through a structured quest — so the player sees how
 *  WHO THEY ARE changes the approach (spec: routes fan across the great circle). */
export function routesForCharacter(quest, character) {
  const domains = [character?.domains?.primary, character?.domains?.secondary, character?.domains?.tertiary].filter(Boolean);
  const routes = quest.routes || {};
  const open = [], other = [];
  for (const [trad, text] of Object.entries(routes)) (domains.includes(trad) ? open : other).push({ trad, text, open: domains.includes(trad) });
  return [...open, ...other];
}

/** GM block for structured quests: stakes + current stage + the routes the character's domains open.
 *  SNG-132: for a BOUND legendary arc, also surface its `legend` NPC as a distant, turning-toward-this-
 *  character presence — escalating ONLY as stages complete (pass `opts.npcs` to name the legend). */
export function structuredQuestsForGM(character, opts = {}) {
  const active = (character.quests || []).filter(q => q.structured && q.status === "active");
  if (!active.length) return null;
  const npcs = opts.npcs || {};
  return active.map(q => {
    const stage = q.stages[q.stageIndex] || q.stages[q.stages.length - 1];
    const open = routesForCharacter(q, character).filter(r => r.open).map(r => r.trad);
    let line = `- [${q.id}] ${q.title} (axis: ${q.axis || "?"}) — STAKES: ${q.stakes}\n  Now: ${stage?.objective || "resolve"}${stage?.condition ? ` (${stage.condition})` : ""}${open.length ? `\n  This character's domains open: ${open.join(", ")}` : ""}`;
    // SNG-162 §1: the stage the model may report against, named explicitly. Without the id in the
    // prompt the GM cannot emit a stageOp that passes the current-stage gate.
    if (stage?.id && !q.awaitingResolution) line += `\n  CURRENT STAGE ID: "${stage.id}" — if the character's actions THIS BEAT satisfy that condition, emit stageOps for it.`;
    // SNG-162 §2: at the decision point the GM brings the choice into the FICTION rather than
    // leaving it to a panel the player may never open.
    if (q.awaitingResolution) {
      line += `\n  ⚑ AT ITS DECISION POINT — every stage is done. Bring the choice into the fiction THIS BEAT: put the moment in front of the character and let them choose how it ends. Do NOT pick an outcome, do NOT narrate a resolution, and do NOT emit stageOps for it — the player resolves it themselves.`;
    }
    if ((q.legend || q.legendNpc) && (q.boundToCharacter || q.boundToPlayer)) {
      const leg = q.legendNpc || npcs[q.legend] || null; // SNG-133: a generated arc carries its legend inline
      const legName = leg?.name || q.legend || "a distant force";
      const si = (q.stageIndex || 0) + 1, n = q.stages.length;
      line += `\n  LEGEND — ${legName}: a distant, turning-toward-this-character presence (${leg?.role || "a legendary force"}). This arc FOLLOWS ${character.name || "them"}; make ${legName} felt as a slow gravity, escalating ONLY as stages complete (now stage ${si}/${n}) — never dump the whole arc. The ending is HERS to decide; never foreclose it.`;
    }
    return line;
  }).join("\n");
}

/** SNG-203 tier-2 (Tradition Arc): the traditions a character actually practices — the union of the
 *  teachers they've engaged and the traditions of the abilities they own. Foreclosed traditions drop out.
 *  This is the interest signal that decides which tradition arcs are worth surfacing at all. */
export function practicedTraditions(character, content = {}) {
  const set = new Set(Object.keys(character?.teachers || {}));
  const catalog = content.abilities || {};
  const index = content.traditionIndex;
  for (const o of (character?.abilities || [])) {
    const ab = catalog[o.abilityId];
    const t = ab ? traditionOf(ab, index) : (index?.abilityToTradition?.[o.abilityId] || null);
    if (t) set.add(t);
  }
  for (const f of (character?.foreclosed || [])) set.delete(f);
  return set;
}

/** SNG-203 §4: the tradition arc's CURRENT beat, chosen from the character's standing with its teacher.
 *  finding → they practice the craft but haven't found the deep teacher · proving → teacher met, not yet
 *  committed · ultimate → teacher willing, the capstone is learnable · complete → capstone owned. The
 *  gate mirrors the arc's own authored gate language (teachers[trad] = {met, willing}) exactly. */
export function traditionArcBeat(arc, character) {
  if (!arc || !Array.isArray(arc.beats)) return null;
  const beatBy = (name) => arc.beats.find(b => b.beat === name) || null;
  const owns = arc.capstoneAbility && (character?.abilities || []).some(a => a.abilityId === arc.capstoneAbility);
  if (owns) return { beat: "complete", def: null };
  const t = character?.teachers?.[arc.traditionId] || null;
  if (t && t.met && t.willing) return { beat: "ultimate", def: beatBy("ultimate") };
  if (t && t.met) return { beat: "proving", def: beatBy("proving") };
  return { beat: "finding", def: beatBy("finding") };
}

/** GM block for the character's live tradition arcs: for each tradition they practice that has an authored
 *  arc, name the teacher, the beat they're on, its gate, and the one quest that beat hands the player. The
 *  ultimate beat carries the SNG-197 doctrine — the capstone is learned in a SCENE, never a menu unlock. */
export function traditionArcForGM(character, content = {}, opts = {}) {
  const arcs = content.traditionArcs || {};
  if (!arcs || !Object.keys(arcs).length) return null;
  const practiced = opts.traditions || practicedTraditions(character, content);
  const lines = [];
  for (const trad of practiced) {
    const arc = arcs[trad];
    if (!arc) continue;
    const at = traditionArcBeat(arc, character);
    if (!at || at.beat === "complete") continue;
    const teacher = arc.teacher || {};
    const q = at.def?.quest || null;
    let line = `- TRADITION ARC [${trad}] — teacher: ${teacher.name || "unfound"}. This character is on the ${at.beat.toUpperCase()} beat`;
    if (at.def?.name) line += ` ("${at.def.name}")`;
    line += ".";
    if (at.def?.gate) line += `\n  GATE (how the beat opens): ${at.def.gate}`;
    if (q) line += `\n  THE QUEST it hands: [${q.id}] ${q.name || q.title || "?"} — ${q.premise || q.stakes || ""}`;
    if (at.beat === "ultimate") line += `\n  ⚑ CAPSTONE DOCTRINE: learning ${arc.capstoneAbility} is a SCENE the teacher gives, not a menu unlock (SNG-197). Bring the giving into the fiction; the weight is the point.`;
    lines.push(line);
  }
  return lines.length ? lines.join("\n") : null;
}

/** SNG-203 tier-6 (NPC Quest / errand): the offerable errands whose giver the character can actually reach —
 *  the giver is present in the scene or already known (in the codex/registry). Skips errands already taken
 *  or done. Deliberately light: an errand names a want and a task, not stakes — it is texture, not spine. */
export function npcQuestsForGM(character, content = {}, opts = {}) {
  const pool = content.npcQuests || [];
  if (!Array.isArray(pool) || !pool.length) return null;
  const known = opts.knownGivers instanceof Set ? opts.knownGivers : null;
  const present = new Set([opts.locationGiver, ...(opts.presentNpcIds || [])].filter(Boolean));
  const takenIds = new Set((character?.quests || []).map(q => q.id).filter(Boolean));
  const npcqState = character?.npcQuests || {}; // { [id]: "offered"|"active"|"done" }
  const lines = [];
  for (const nq of pool) {
    if (!nq || !nq.id || !nq.giver) continue;
    if (takenIds.has(nq.id) || npcqState[nq.id] === "done") continue;
    const reachable = present.has(nq.giver) || (known ? known.has(nq.giver) : true);
    if (!reachable) continue;
    lines.push(`- ERRAND [${nq.id}] from ${nq.giver}: ${nq.want}\n  TASK: ${nq.task}  →  REWARD: ${nq.reward}${nq.promotable ? "  (may grow into a real quest — promotable)" : ""}`);
  }
  return lines.length ? `NPC ERRANDS the GM may offer (light texture — not logged as real quests unless promoted):\n${lines.join("\n")}` : null;
}
