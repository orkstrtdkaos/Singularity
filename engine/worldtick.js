// worldtick.js — the world moves while you're away. Runs whenever the character
// re-enters play and in-game days have passed since the last tick:
//   1. EVENT ADVANCEMENT — active events (water crisis) progress through their
//      stages on their own clocks. Ignore a crisis and it worsens.
//   2. NEWS SPREAD — significant witnessed deeds (|weight| >= 2) travel to the
//      region's other communities after a few days. Reputation follows you.
//   3. OFFSCREEN NPC EVOLUTION — an AI pass imagines what happened to known
//      people during the gap, applied through the same clamped npcUpdates ops.
// World state lives on the character (their campaign's world). When shared
// scenes land (v0.6), a consolidator replaces this with region-level state —
// the shapes here are designed to lift straight into that.

import { callClaudeJSON } from "./claude.js";
import { applyNpcUpdates } from "./npcs.js";
import { applyCodexUpdates } from "./codex.js";
import { smartClamp } from "./namematch.js"; // SNG-076: word-boundary clamp for the away-digest/news
import { generatedRecords } from "./generate.js";
import { syncEnabled, fetchRepoJSON, fetchLedger, pushOwnedFile, pushMergedFile } from "./sync.js";
import { absoluteWorldDay, worldDayAt, worldCount, readClock } from "./worldtime.js";
import { advanceAssignment, progressAgainst } from "./assignments.js"; // SNG-191 §4: the world advances delegated work
import { seedArc, fomentArc, surfaceableArcs, markSurfaced, seasonalPressure } from "./latentarcs.js"; // SNG-191 §7: the world's own agenda
import { ensureCanonStore, promotionCandidates, promoteInto, canonForViewer } from "./canon.js";

const NEWS_CAP = 20;
const NEWS_TRAVEL_DAYS = 3;

export function initWorldState(day = 1) {
  return { schemaVersion: 1, lastTickDay: day, eventStages: {}, spectrumDrift: {}, news: [], unseenNews: [] };
}

/** Region view for the GM: content events overlaid with this campaign's stages. */
export function buildRegionView(content, character) {
  const ws = character.worldState;
  const activeEvents = (content.region.activeEvents || []).map(({ eventId, stage }) => ({
    eventId,
    stage: ws?.eventStages?.[eventId]?.stage ?? stage
  }));
  return { ...content.region, activeEvents };
}

/** A location's spectrum as shifted by the world's drift (crisis pressure etc.). */
export function effectiveLocation(location, worldState) {
  const drift = worldState?.spectrumDrift;
  if (!drift || !Object.keys(drift).length) return location;
  const spectrum = { ...location.spectrum };
  for (const [ax, v] of Object.entries(drift)) {
    spectrum[ax] = Math.max(-1, Math.min(1, (spectrum[ax] || 0) + v));
  }
  return { ...location, spectrum };
}

/** Run the tick if days have passed. Mutates character.worldState (and deeds/npcs).
 *  evolveNpcs is injectable for tests; defaults to the AI pass. Never throws. */
export async function runWorldTick({ character, content, currentDay, advanceAssignments = aiAssignmentAdvancement }) {
  if (!character.worldState) character.worldState = initWorldState(currentDay);
  const ws = character.worldState;
  const elapsed = currentDay - (ws.lastTickDay ?? currentDay);
  if (elapsed <= 0) return { ticked: false, news: [] };
  const news = [];
  const clampDrift = v => Math.max(-0.5, Math.min(0.5, v));

  // 1. event advancement — and SNG-191 §4.2: a crisis RESPONDS to the delegated work. Ignoring a
  //    crisis worsens it (this always worked); the missing half is that DOING something measurably
  //    helps, and the mechanism is a charge set against it. A crisis nothing can affect is theatre.
  for (const { eventId, stage } of content.region.activeEvents || []) {
    const ev = content.events[eventId];
    if (!ev) continue;
    let st = ws.eventStages[eventId] || (ws.eventStages[eventId] = { stage, sinceDay: ws.lastTickDay });
    let guard = 0;
    while (guard++ < 10) {
      const def = ev.stages.find(s => s.stage === st.stage);
      if (!def || !def.days || def.days >= 900) break;
      if (currentDay - st.sinceDay < def.days) break;
      const helped = progressAgainst(ws, eventId).length; // charges making headway against THIS crisis
      if (helped >= 2 && st.stage > 1) {
        // eased — strong, sustained delegated work pushes the crisis a stage back toward resolution.
        st.sinceDay += def.days; st.stage = st.stage - 1;
        for (const [ax, v] of Object.entries(def.spectrumShift || {})) ws.spectrumDrift[ax] = clampDrift((ws.spectrumDrift[ax] || 0) - v); // unwind this stage's pressure
        const now = ev.stages.find(s => s.stage === st.stage);
        news.push(`${ev.name} has EASED — the delegated work held and pushed it back${now ? ` to ${now.name}` : ""}.`);
        continue;
      }
      if (helped >= 1) {
        // held — the crews bought this interval; the crisis does not worsen, but it does not recede.
        st.sinceDay += def.days;
        news.push(`${ev.name} was HELD at ${def.name} — the delegated work kept it from worsening.`);
        continue;
      }
      // untended — it worsens (UNGUARDRAILED, §4b: it runs as far as its own logic takes it).
      const next = ev.stages.find(s => s.stage === st.stage + 1);
      if (!next) break;
      st.sinceDay += def.days;
      st.stage = next.stage;
      for (const [ax, v] of Object.entries(next.spectrumShift || {})) ws.spectrumDrift[ax] = clampDrift((ws.spectrumDrift[ax] || 0) + v);
      news.push(`${ev.name} has worsened — ${next.name}: ${next.summary}`);
    }
  }

  // 2. news spread: big deeds travel to the region's other communities
  const communities = [...new Set(Object.values(content.locations).map(l => l.communityId).filter(Boolean))];
  for (const deed of character.deeds || []) {
    if (!deed.communityId || Math.abs(deed.weight) < 2) continue;
    const deedDay = deed.day ?? 0;
    if (currentDay - deedDay < NEWS_TRAVEL_DAYS) continue;
    const others = communities.filter(c => c !== deed.communityId && !(deed.spread || []).includes(c));
    if (!others.length) continue;
    deed.spread = [...(deed.spread || []), ...others];
    news.push(`Word has spread beyond ${deed.communityId.split(".").pop()}: ${deed.description}`);
  }

  // 3. SNG-191 §4 THE INVERSION — the world TURNS, it does not narrate. Advance the DELEGATED work
  //    (progress / stall / problem / done); never imagine what a worker was FEELING. News is DERIVED
  //    from what MOVED and only when it bears on the work (§4.3/§4.4); personal colour rides on the
  //    person's statusNote, not the news (§4.5). No assignments → no pass, and an empty news block is a
  //    legitimate result. UNGUARDRAILED (§4b): a problem may be real, a success real — not softened.
  const active = Object.values(ws.assignments || {}).filter(a => a.status !== "done");
  if (elapsed >= 3 && active.length && advanceAssignments) {
    try {
      const result = await advanceAssignments({ character, content, assignments: active.slice(0, 6), elapsed, currentDay });
      const statusUpdates = [];
      for (const adv of (result?.advancements || []).slice(0, 6)) {
        const a = ws.assignments[adv?.assignmentId];
        if (!a) continue;
        advanceAssignment(a, adv.outcome, worldCount());
        if (adv.outcome === "problem") news.push(`${a.npcName} has hit trouble with ${a.charge}${adv.note ? ` — ${smartClamp(adv.note, 200)}` : ""}.`);
        else if (adv.outcome === "done") news.push(`${a.npcName} has finished ${a.charge}.`);
        if (adv.note && a.npcId) statusUpdates.push({ op: "update", npcId: a.npcId, statusNote: smartClamp(adv.note, 200) });
      }
      if (statusUpdates.length) applyNpcUpdates(character, statusUpdates, { day: currentDay });
    } catch (err) { console.warn("[worldtick] assignment advancement skipped:", err.message); }
  }

  ws.lastTickDay = currentDay;
  if (news.length) {
    // SNG-041: stamp the absolute world-day (shared calendar) alongside the local journey-day.
    const wd = absoluteWorldDay();
    const stamped = news.map(n => ({ day: currentDay, worldDay: wd, text: n }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { ticked: true, news };
}

/** SNG-191 §7 — THE GENERATION TURN. The world has its own agenda, and it runs on the world COUNT, not
 *  the player's attention. Latent arcs foment whether or not anyone has seen them; some the world solves
 *  itself (§7.3, the fate that keeps it from being hero-dependent); some SURFACE as the player's first
 *  contact — a rumour now specific enough to repeat (§7.4, content not an alert). New arcs are seeded
 *  from the DISPOSITION of the regions the player knows, so every one has a cause that existed before it
 *  surfaced (§7 inv2 attributable). Runs alongside the return-tick. seedArcs injectable; never throws. */
export async function runGenerationTurn({ character, content, now = Date.now(), seedArcs = aiSeedArcs } = {}) {
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const count = worldCount(now);
  if (ws.lastGenCount == null) { ws.lastGenCount = count; return { news: [] }; } // first observation anchors the baseline
  const elapsed = count - ws.lastGenCount;
  if (elapsed <= 0) return { news: [] };
  ws.lastGenCount = count;
  const news = [];

  // §7.4 seasonal pressure — the conditions arcs happen in, and they recur. The season TILTS which
  // KINDS ferment (a shortage grows in deep-winter want, a feud in the working heat).
  const season = (() => { try { return readClock(character.clock).season; } catch { return null; } })();
  const tilts = new Set(seasonalPressure(season)?.tilts || []);
  // 1. foment existing arcs — they grow (unguardrailed), or the world quietly resolves one itself (§7.3);
  //    a growing arc the season leans on ferments a touch faster.
  for (const arc of Object.values(ws.latentArcs || {})) {
    const before = arc.fate;
    fomentArc(arc, elapsed, Math.random, count);
    if (arc.fate === "growing" && tilts.has(arc.kind)) arc.stage += 1; // the season pushes on this kind
    if (before === "growing" && arc.fate === "resolved") news.push(`Word reaches you that ${arc.premise} — settled, it seems, without you.`);
  }
  // 2. surface arcs that have fomented enough — first contact, as something now specific enough to repeat.
  for (const arc of surfaceableArcs(ws).slice(0, 2)) {
    markSurfaced(arc, count);
    news.push(`Something has been building${arc.regionId ? ` in ${String(arc.regionId).replace(/_/g, " ")}` : ""}: ${arc.premise}`);
  }
  // 3. seed NEW arcs from the disposition of the regions the player knows — attributable, regional (§7.5).
  if (elapsed >= 24 && seedArcs) {
    try {
      const seeded = await seedArcs({ character, content, count });
      for (const s of (seeded?.arcs || []).slice(0, 2)) seedArc(ws, s, count); // silent — an arc is not news until it surfaces
    } catch (err) { console.warn("[generation] seeding skipped:", err.message); }
  }

  if (news.length) {
    const stamped = news.map(t => ({ day: ws.lastTickDay ?? null, worldDay: absoluteWorldDay(now), text: smartClamp(t, 400) }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { news };
}

/** SNG-191 §7 — the seeding pass: what is fomenting in the regions the player knows, FROM their
 *  disposition. Every arc must follow from something already true of the place (§7 inv2) — never from
 *  nothing. Regional, not global (§7.5). */
async function aiSeedArcs({ character, content, count }) {
  const knownRegions = [...new Set((character.knownPlaces || []).map(id => content.locations?.[id]?.regionId || content.locations?.[id]?.region).filter(Boolean))].slice(0, 4);
  if (!knownRegions.length) return { arcs: [] };
  const existing = Object.values(character.worldState?.latentArcs || {}).map(a => a.premise).slice(0, 6).join("; ") || "none";
  const sys = `You seed LATENT ARCS in an RPG world — things quietly building in the background that no one has noticed yet. For AT MOST 2 of the regions, name ONE thing fomenting there and its CAUSE — something ALREADY TRUE of that place (its people, its tensions, its crisis). A feud, a shortage, a rot in a granary, someone's slow decision. It must FOLLOW from the place; never invent from nothing. Reply ONLY JSON: {"arcs":[{"id":"kebab-unique","regionId":"exact-region-id-from-the-list","kind":"feud|shortage|rot|decision|omen","premise":"one sentence: what is building","cause":"the thing already true that this grows from"}]}`;
  const content2 = `Regions the character knows:\n${knownRegions.map(r => `- ${r}`).join("\n")}\n\nAlready fomenting (do not duplicate): ${existing}\n\nWorld count now: ${count}.`;
  return callClaudeJSON([{ role: "user", content: content2 }], { task: "world-tick", system: sys, maxTokens: 900 });
}

/** SHARED WORLD consolidation (best-effort, never throws): when sync is on,
 *  one valley is true for everyone. Event stages merge to the furthest reached,
 *  spectrum drift to the strongest pressure, other characters' deeds arrive as
 *  news — and the consolidated region state is pushed back for the next player. */
export async function syncSharedWorld({ character, content }) {
  if (!syncEnabled() || !character.worldState) return { synced: false };
  const ws = character.worldState;
  const news = [];
  try {
    // 1. merge remote region state: the world is as far along as ANYONE has seen it
    const remote = await fetchRepoJSON("world/regions/valley.json");
    if (remote?.eventStages) {
      for (const [eventId, st] of Object.entries(remote.eventStages)) {
        const local = ws.eventStages[eventId];
        if (!local || st.stage > local.stage) {
          ws.eventStages[eventId] = { ...st };
          const ev = content.events[eventId];
          const def = ev?.stages.find(s => s.stage === st.stage);
          if (ev && def) news.push({ text: `${ev.name} stands at ${def.name} across the valley: ${def.summary}`, worldDay: absoluteWorldDay() });
        }
      }
    }
    if (remote?.spectrumDrift) {
      for (const [ax, v] of Object.entries(remote.spectrumDrift)) {
        if (Math.abs(v) > Math.abs(ws.spectrumDrift[ax] || 0)) ws.spectrumDrift[ax] = v;
      }
    }
    // 2. other characters' consequences reach you as news
    const since = ws.lastSharedReadAt || "1970";
    const ledger = await fetchLedger(0);
    const fromOthers = ledger.filter(e => e.who !== character.id && e.at > since && e.visibility !== "hidden").slice(-5);
    // SNG-041 RECONCILIATION: another character's event dates by the SHARED absolute world-day
    // (derived from its real-time .at, or its own worldDay stamp) — so their timeline and yours
    // share ONE calendar. This is the fix for the Day-8-vs-Day-11 drift.
    for (const e of fromOthers) news.push({
      text: `${e.impactsLocal ? "This reaches your area — " : "Word reaches you: "}${e.what}${e.where ? ` (near ${e.where.replace(/_/g, " ")})` : ""}`,
      worldDay: e.worldDay ?? worldDayAt(e.at),
      impactsLocal: !!e.impactsLocal // SNG-041: a boundary-crossing distant event (far-world → local frame)
    });
    ws.lastSharedReadAt = new Date().toISOString();
    // 3. push the consolidated region state back (SHA-retry inside pushOwnedFile)
    await pushOwnedFile("world/regions/valley.json", {
      schemaVersion: 1, regionId: "valley",
      calendar: remote?.calendar || { day: ws.lastTickDay, season: "late-spring", year: 15 },
      activeEvents: (content.region.activeEvents || []).map(({ eventId, stage }) => ({ eventId, stage: ws.eventStages[eventId]?.stage ?? stage })),
      eventStages: ws.eventStages, spectrumDrift: ws.spectrumDrift,
      worldFlags: remote?.worldFlags || {}, lastTick: new Date().toISOString()
    }, `world-tick: consolidated by ${character.name}`);
  } catch (err) {
    console.warn("[sharedworld] consolidation skipped:", err.message);
  }
  if (news.length) {
    // each item carries its OWN absolute world-day (a cross-character event keeps the date it
    // actually happened; a local merge stamps now) — so the shared calendar stays coherent.
    const stamped = news.map(n => ({ day: ws.lastTickDay, worldDay: n.worldDay ?? absoluteWorldDay(), text: smartClamp(n.text, 600), ...(n.impactsLocal ? { impactsLocal: true } : {}) }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { synced: true, news: news.map(n => n.text) };
}

// ---------- SNG-BATCH-9 Phase 3: shared-world promotion + rating-lens ----------

const CANON_PATH = (region = "valley") => `world/canon/${region}.json`;

/** EARNED auto-promotion + the rating-lens read (best-effort, never throws). When sync is on:
 *   1. PROMOTE — every local nominated-tier entity that hasn't landed yet is contended into the
 *      shared-canon store: no collision → lands canonical; a collision fires the weighted opposed
 *      roll (realness vs realness; authored spine at a high floor) → winner canonical, loser a
 *      persisting variant/rumor. The contest runs INSIDE the merge callback against the freshly-
 *      read remote, so concurrent promoters never clobber (SHA-retry re-contests).
 *   2. READ — the resulting store is resolved through THIS viewer's rating-lens (at/below their
 *      ceiling; above-ceiling adapts down or filters absent; floors absolute) and returned as the
 *      viewer's slice for GM surfacing + hydration.
 *  Marks promoted local records idempotently (`_gen.promotedWorldDay` + `_gen.canonTier`) so a
 *  landed entity never re-promotes. Gated: promotes whenever candidates exist; refreshes the
 *  view at most once per elapsed world-day when there's nothing to promote (network thrift).
 *  region + authoredFor + now injectable for tests. */
export async function syncSharedCanon({ character, profile, content, region = "valley", now = Date.now(), authoredFor = null } = {}) {
  if (!syncEnabled() || !character) return { synced: false, promoted: [], view: [] };
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const worldDay = absoluteWorldDay(now);
  const candidates = promotionCandidates(character);
  const dueForRead = ws.lastCanonWorldDay == null || (worldDay - ws.lastCanonWorldDay) >= 1;
  if (!candidates.length && !dueForRead) return { synced: false, promoted: [], view: [] };

  const authored = authoredFor || ((type) =>
    type === "npc" ? (content?.npcs || {}) :
    type === "location" ? (content?.locations || {}) :
    type === "arc" ? Object.fromEntries((content?.greaterArcs || []).map(a => [a.id, a])) : {});

  let store = null;
  let promoted = [];
  try {
    if (candidates.length) {
      // promote inside the merge: contest against the FRESHLY-read remote; a concurrent write
      // triggers a re-read + re-contest (pushMergedFile), so promoters never clobber.
      let lastResults = [];
      await pushMergedFile(CANON_PATH(region), (remote) => {
        const s = ensureCanonStore(remote || {}, region);
        const out = promoteInto(s, candidates, { authored, worldDay });
        lastResults = out.results;
        return out.store;
      }, `canon: ${candidates.length} promotion(s) from ${character.name || character.id}`);
      promoted = lastResults;
      // mark local records landed (idempotent) — buildCanonRecord keeps the source id, so a
      // result's entityId is exactly its local record's id — so it never re-promotes.
      for (const r of lastResults) {
        const target = candidates.find(c => c.record.id === r.entityId)?.record;
        if (target?._gen) { target._gen.promotedWorldDay = worldDay; target._gen.canonTier = r.outcome === "variant" ? "variant" : "canonical"; }
      }
      // re-read the consolidated store for the viewer slice
      store = await fetchRepoJSON(CANON_PATH(region));
    } else {
      store = await fetchRepoJSON(CANON_PATH(region));
    }
  } catch (err) {
    console.warn("[canon] shared-canon sync skipped:", err.message);
    return { synced: false, promoted, view: [] };
  }
  ws.lastCanonWorldDay = worldDay;
  const view = store ? canonForViewer(ensureCanonStore(store, region), profile) : [];
  return { synced: true, promoted, view };
}

// ---------- SNG-BATCH-9 Phase 2: living advancement (offscreen) ----------

/** Advance ESTABLISHED-tier generated entities while the player was away. Gated by the
 *  Phase-1 engagement governor (only established/nominated advance — fresh/dormant stay put)
 *  and by REAL-time elapsed world-days (the far world ages in real time, SNG-041). Each
 *  development is imagined per the entity's want/tension + disposition (derives-never-
 *  fabricates — no drastic/contradicting/future-dated turns), applied as an accumulated
 *  fact on the entity's codex node + an away-digest item DATED on the shared absolute clock
 *  (on-or-before now). Never throws. evolveFn + now injectable for tests. */
// SNG-198 §2: the missing HALF of SNG-021 (specced 2026-07-07, never built — `wantProgress` was 0 hits
// repo-wide). An offscreen figure's want now carries a COUNTER that persists between ticks, so a thread
// ripening across four ticks is measurably further along than after one, and the model can SEE how far it
// has travelled when it writes the fifth. The `progress|stall|problem|done` enum is Path A's proven shape
// (delegated work), extended to the generated population. A want that reaches the threshold RESOLVES —
// resolution is a legitimate end, not a loop that ripens forever. UNGUARDRAILED (§4b): a stall is a real
// stall, a problem real; nothing softened to keep the world tidy.
const WANT_OUTCOMES = ["progress", "stall", "problem", "done"];
const WANT_THRESHOLD = 4; // progress steps to resolve a want (tunable). "Four ticks of a thread ripening."

/** The persistent per-figure want state, keyed by entityId on worldState. Pure accessor + mutator. */
function wantState(ws, id) {
  ws.wantProgress = ws.wantProgress || {};
  return ws.wantProgress[id] || (ws.wantProgress[id] = { progress: 0, status: "active", updatedWorldDay: null });
}
/** Apply one offscreen outcome to a figure's want state. Returns { moved, resolved } — `moved` is whether
 *  the countable state changed (drives whether it is news vs pure colour). Pure but for the ws mutation. */
export function applyWantOutcome(ws, id, outcome, worldDay) {
  const st = wantState(ws, id);
  if (st.status === "resolved") return { moved: false, resolved: true };
  let moved = false;
  if (outcome === "progress") { st.progress += 1; moved = true; }
  else if (outcome === "done") { st.progress = WANT_THRESHOLD; moved = true; }
  // stall / problem: the note is real, the counter does not advance (a stall is a stall — §4b)
  if (st.progress >= WANT_THRESHOLD) st.status = "resolved";
  st.lastOutcome = outcome;
  st.updatedWorldDay = worldDay;
  return { moved, resolved: st.status === "resolved" };
}
/** A short read of how far a figure's want has travelled, for the NEXT tick's prompt — so tick N+1 can see
 *  tick N (the whole point). */
function wantProgressLine(ws, id) {
  const st = ws.wantProgress?.[id];
  if (!st || !st.progress) return "just beginning";
  if (st.status === "resolved") return "resolved";
  return `${st.progress}/${WANT_THRESHOLD} of the way there${st.lastOutcome === "problem" ? " (last tick: a problem)" : st.lastOutcome === "stall" ? " (last tick: stalled)" : ""}`;
}

/** SNG-198B §3: the offscreen POPULATION — everyone whose life plausibly moves while the player is away,
 *  across the sources §1 kept separate, unified into a common {id, name, kind, descriptor, source} the
 *  state machine advances. Generated figures + MET NPCs move on ordinary ticks; EPIC/LEGENDARY figures —
 *  the specific gap Erik named, `legend.tier` that worldtick has NEVER read — move RARELY (a cooldown + a
 *  rare roll, so the great become daily furniture if they tick every day: rarity is the point). Pure; rng
 *  and the epic cooldown injected. */
export function offscreenPopulation(character, content = {}, { worldDay = 0, rng = Math.random, lastEpicDay = null, minEpicGapDays = 6, epicRate = 0.34 } = {}) {
  const out = [];
  const seen = new Set();
  const add = (id, name, kind, descriptor, source) => { if (id && name && !seen.has(id)) { seen.add(id); out.push({ id, name, kind, descriptor: descriptor || "their own ends", source }); } };
  // 1. established/nominated generated figures + threads (the original Phase-2 population)
  for (const r of [...generatedRecords(character, "npc"), ...generatedRecords(character, "arc")]) {
    if (!r._gen || (r._gen.tier !== "established" && r._gen.tier !== "nominated")) continue;
    const isArc = r._gen.type === "arc";
    add(r.id, r.name, isArc ? "arc" : "npc", isArc ? (r.tendency || r.pressure) : (r.wants || r.role), "generated");
  }
  // 2. MET NPCs — anyone in the registry with a want the world can carry (their authored catalog want, else
  //    their role/standing). Authored-vs-generated is not a reason a person's life stops (§3.1).
  for (const n of Object.values(character?.npcRegistry || {})) {
    if (n.status === "dead" || n.status === "departed") continue;
    const want = content.npcs?.[n.id]?.wants || n.role || null;
    if (!want) continue;
    add(n.id, n.name, "npc", want, "met");
  }
  // 3. EPIC / LEGENDARY (§3.3). A cooldown + a rare roll → at most one great figure stirs, most ticks none.
  const coolOk = lastEpicDay == null || (worldDay - lastEpicDay) >= minEpicGapDays;
  if (coolOk && rng() < epicRate) {
    const greats = (content.legends?.roster || []).filter(f => f.tier === "legendary" || f.tier === "epic");
    if (greats.length) { const f = greats[Math.floor(rng() * greats.length)]; add(f.id, f.name, "npc", f.wants || f.signature, "legend"); }
  }
  // 4. HEARD OF, not met (§3.2) — a codex PERSON node with no registry entry is exactly "known of, not met."
  //    SNG-199 made MEETING write the registry, so this marker exists for free (met people were filtered out
  //    above by their registry entry; generated/legend already `seen`). Appended LAST + low priority so the
  //    batch cap prefers the people the player actually knows; their descriptor is what he knows of them.
  //    Companions (companion-*) are their own thing, not offscreen figures.
  for (const t of Object.values(character?.codex?.topics || {})) {
    if (t.kind !== "person") continue;
    const id = t.entityId || t.id;
    if (!id || seen.has(id) || String(id).startsWith("companion-") || character?.npcRegistry?.[id]) continue;
    const fact = (t.facts || []).slice(-1)[0] || t.label;
    add(id, t.label, "npc", `known of: ${String(fact).replace(/^\[[^\]]*\]\s*/, "")}`, "heardof");
  }
  return out;
}

export async function advanceGeneratedOffscreen({ character, content = {}, evolveFn = aiGeneratedEvolution, now = Date.now(), rng = Math.random } = {}) {
  if (!character) return [];
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const currentWorldDay = absoluteWorldDay(now);
  const elapsedWorldDays = currentWorldDay - (ws.lastTickWorldDay ?? currentWorldDay);
  // first observation just anchors the shared-clock baseline; nothing has elapsed yet
  if (ws.lastTickWorldDay == null) { ws.lastTickWorldDay = currentWorldDay; return []; }
  if (elapsedWorldDays <= 0) return [];

  // SNG-198B: the widened population, minus anyone whose want has already resolved (§2 — a resolved want
  // stops ripening). Batched (cap 4), never fanned out (§5 cost).
  const population = offscreenPopulation(character, content, { worldDay: currentWorldDay, rng, lastEpicDay: ws.lastEpicOffscreenDay })
    .filter(e => ws.wantProgress?.[e.id]?.status !== "resolved");
  ws.lastTickWorldDay = currentWorldDay; // advance the baseline even if nobody's in scope
  if (!population.length || !evolveFn) return [];
  const batch = population.slice(0, 4);

  const news = [];
  try {
    const result = await evolveFn({ character, entities: batch, elapsedWorldDays, currentWorldDay, progressOf: (id) => wantProgressLine(ws, id) });
    for (const dev of (result?.developments || []).slice(0, 4)) {
      const fig = batch.find(e => e.id === dev.entityId);
      if (!fig || !dev.note) continue;
      // SNG-198 §2: the outcome MOVES state (or honestly does not); the note is the colour on top of it.
      const outcome = WANT_OUTCOMES.includes(dev.outcome) ? dev.outcome : "progress";
      const { moved, resolved } = applyWantOutcome(ws, fig.id, outcome, currentWorldDay);
      if (fig.source === "legend" && moved) ws.lastEpicOffscreenDay = currentWorldDay; // stamp the epic cooldown
      const note = smartClamp(dev.note, 600);
      // keep the per-record offscreen log for generated figures (their existing surface); the codex node
      // carries the "moved on" fact for EVERYONE — generated, met, or legendary — all resolvable by id.
      const genRec = character.generated?.npc?.[fig.id] || character.generated?.arc?.[fig.id];
      if (genRec?._gen) genRec._gen.offscreen = [...(genRec._gen.offscreen || []), { worldDay: currentWorldDay, note, outcome }].slice(-8);
      try { applyCodexUpdates(character, [{ entityId: fig.id, label: fig.name, kind: fig.kind === "arc" ? "lore" : "person", fact: `[while away] ${note}` }], { day: ws.lastTickDay ?? null }); } catch { /* codex mirror is a convenience */ }
      // News is DERIVED from what MOVED / a real problem / a resolution — not from every sentence (§2, §4b).
      const headline = resolved ? `${fig.name}: ${note} — and that thread has run its course.`
        : outcome === "problem" ? `${fig.name} has hit trouble — ${note}`
        : `${fig.name}: ${note}`;
      if (moved || outcome === "problem") news.push({ text: headline, worldDay: currentWorldDay });
    }
  } catch (err) { console.warn("[offscreen-gen] skipped:", err.message); return []; }

  if (news.length) {
    const stamped = news.map(n => ({ day: ws.lastTickDay ?? null, worldDay: n.worldDay, text: smartClamp(n.text, 600) }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return news;
}

/** The AI pass: what an established generated figure/thread did offscreen, in-grain. SNG-198 §2: it is shown
 *  HOW FAR each want has already travelled (progressOf) and must return a countable OUTCOME, not just prose. */
async function aiGeneratedEvolution({ entities, elapsedWorldDays, currentWorldDay, progressOf = () => "just beginning" }) {
  const who = (e) => e.source === "legend" ? ", a GREAT FIGURE of the world — a rare, weighty stirring, not a small errand"
    : e.source === "met" ? ", someone the player has met"
    : e.source === "heardof" ? ", someone the player has only HEARD OF — a distant name; a small shift in it is how the world reads as alive when he finds it changed" : "";
  const list = entities.map(e =>
    `- ${e.id}: ${e.name} (${e.kind}${who(e)}) — ${e.kind === "arc" ? "tension" : "wants"}: ${e.descriptor || "?"}; progress so far: ${progressOf(e.id)}`
  ).join("\n");
  const sys = `You advance the OFFSCREEN lives of established figures and threads in an RPG while the player was away. ${elapsedWorldDays} world-days passed. Each figure has a want/tension and HOW FAR it has already travelled toward it. For AT MOST 4 of them, decide ONE small, grounded, IN-GRAIN development that follows from their want/tension + how far along they already are — no drastic turns, nothing that contradicts what's known, NOTHING set in the future. Choose an OUTCOME per figure: "progress" (moved closer), "stall" (no real movement this time), "problem" (a genuine setback — do not soften it), or "done" (the want is reached/resolved). Most figures move rarely — a "stall" is a fine, honest answer. Reply ONLY JSON: {"developments":[{"entityId":"exact-id","outcome":"progress|stall|problem|done","note":"one sentence: what moved (or didn't) for them while away"}]}`;
  const content = `World-days passed: ${elapsedWorldDays} (now world-day ${currentWorldDay}).\n\nESTABLISHED FIGURES & THREADS:\n${list}`;
  return callClaudeJSON([{ role: "user", content }], { task: "world-tick", system: sys, maxTokens: 1024 });
}

/** Pull (and clear) news the player hasn't seen — shown once on return to play. */
export function takeUnseenNews(character) {
  const items = character.worldState?.unseenNews || [];
  if (character.worldState) character.worldState.unseenNews = [];
  return items;
}

/** Recent news block for the GM prompt — rumors NPCs might repeat. */
export function newsForGM(character) {
  const news = character.worldState?.news || [];
  if (!news.length) return null;
  // SNG-041: date on the SHARED absolute world-day when known (so cross-character news lines up);
  // fall back to the local journey-day for pre-SNG-041 items (derives-never-fabricates).
  return news.slice(-8).map(n => `- [${Number.isFinite(n.worldDay) ? `world-day ${n.worldDay}` : `day ${n.day}`}] ${n.text}`).join("\n");
}

/** SNG-191 §4 — the AI pass, inverted. NOT "what happened to a person" (which writes colour) but "what
 *  PROGRESSED on the work they were delegated." Each assignment gets an OUTCOME (state) plus one line of
 *  what moved on the WORK — which becomes the person's status, never a news slot spent on a small day.
 *  Work set against a crisis should visibly bear on it. UNGUARDRAILED — no softening to keep things tidy. */
async function aiAssignmentAdvancement({ character, content, assignments, elapsed, currentDay }) {
  const list = assignments.map(a =>
    `- ${a.id}: ${a.npcName} holds "${a.charge}"${a.targetEventId ? ` (against ${a.targetEventId})` : ""} — currently ${a.status}, ${a.progress} step(s) in`
  ).join("\n");
  const crises = (content.region.activeEvents || []).map(({ eventId }) => {
    const ev = content.events[eventId];
    const st = character.worldState.eventStages[eventId];
    const def = ev?.stages.find(s => s.stage === (st?.stage ?? 1));
    return ev ? `- ${eventId}: ${ev.name} — ${def?.name}: ${def?.summary}` : null;
  }).filter(Boolean).join("\n");
  const sys = `You advance DELEGATED WORK in an RPG while the player was away — the WORK, not the workers' moods. ${elapsed} in-game days passed. For each assignment, decide what PROGRESSED: an OUTCOME (progress | stall | problem | done) and ONE grounded sentence of what actually MOVED on the work. Work against a crisis must visibly bear on that crisis. The world is UNGUARDRAILED — a problem may be serious, a success real; never soften an outcome to keep things tidy, and never invent work that was not delegated. Reply ONLY JSON: {"advancements":[{"assignmentId":"exact-id-from-the-list","outcome":"progress|stall|problem|done","note":"one sentence: what moved on the WORK (this becomes the person's current status)"}]}`;
  const content2 = `Days passed: ${elapsed} (now day ${currentDay}).\n\nDELEGATED WORK (advance these):\n${list}\n\nCRISES IN THE REGION (work may bear on these):\n${crises || "none active"}`;
  return callClaudeJSON([{ role: "user", content: content2 }], { task: "world-tick", system: sys, maxTokens: 1024 });
}
