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
import { generatedRecords } from "./generate.js";
import { syncEnabled, fetchRepoJSON, fetchLedger, pushOwnedFile } from "./sync.js";
import { absoluteWorldDay, worldDayAt } from "./worldtime.js";

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
export async function runWorldTick({ character, content, currentDay, evolveNpcs = aiNpcEvolution }) {
  if (!character.worldState) character.worldState = initWorldState(currentDay);
  const ws = character.worldState;
  const elapsed = currentDay - (ws.lastTickDay ?? currentDay);
  if (elapsed <= 0) return { ticked: false, news: [] };
  const news = [];

  // 1. event advancement
  for (const { eventId, stage } of content.region.activeEvents || []) {
    const ev = content.events[eventId];
    if (!ev) continue;
    let st = ws.eventStages[eventId] || (ws.eventStages[eventId] = { stage, sinceDay: ws.lastTickDay });
    let guard = 0;
    while (guard++ < 10) {
      const def = ev.stages.find(s => s.stage === st.stage);
      if (!def || !def.days || def.days >= 900) break;
      if (currentDay - st.sinceDay < def.days) break;
      const next = ev.stages.find(s => s.stage === st.stage + 1);
      if (!next) break;
      st.sinceDay += def.days;
      st.stage = next.stage;
      // stage's pressure seeps into the region's spectrum
      for (const [ax, v] of Object.entries(next.spectrumShift || {})) {
        ws.spectrumDrift[ax] = Math.max(-0.5, Math.min(0.5, (ws.spectrumDrift[ax] || 0) + v));
      }
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

  // 3. offscreen npc evolution (AI pass — skipped gracefully on any failure)
  if (elapsed >= 3 && Object.keys(character.npcRegistry || {}).length && evolveNpcs) {
    try {
      const result = await evolveNpcs({ character, content, elapsed, currentDay });
      if (result?.npcUpdates?.length) {
        applyNpcUpdates(character, result.npcUpdates.slice(0, 3).map(u => ({ ...u, op: "update" })), { day: currentDay });
        for (const n of (result.news || []).slice(0, 3)) news.push(String(n).slice(0, 200));
      }
    } catch (err) {
      console.warn("[worldtick] npc evolution skipped:", err.message);
    }
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
    const stamped = news.map(n => ({ day: ws.lastTickDay, worldDay: n.worldDay ?? absoluteWorldDay(), text: String(n.text).slice(0, 220), ...(n.impactsLocal ? { impactsLocal: true } : {}) }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { synced: true, news: news.map(n => n.text) };
}

// ---------- SNG-BATCH-9 Phase 2: living advancement (offscreen) ----------

/** Advance ESTABLISHED-tier generated entities while the player was away. Gated by the
 *  Phase-1 engagement governor (only established/nominated advance — fresh/dormant stay put)
 *  and by REAL-time elapsed world-days (the far world ages in real time, SNG-041). Each
 *  development is imagined per the entity's want/tension + disposition (derives-never-
 *  fabricates — no drastic/contradicting/future-dated turns), applied as an accumulated
 *  fact on the entity's codex node + an away-digest item DATED on the shared absolute clock
 *  (on-or-before now). Never throws. evolveFn + now injectable for tests. */
export async function advanceGeneratedOffscreen({ character, evolveFn = aiGeneratedEvolution, now = Date.now() } = {}) {
  if (!character?.generated) return [];
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const currentWorldDay = absoluteWorldDay(now);
  const elapsedWorldDays = currentWorldDay - (ws.lastTickWorldDay ?? currentWorldDay);
  // first observation just anchors the shared-clock baseline; nothing has elapsed yet
  if (ws.lastTickWorldDay == null) { ws.lastTickWorldDay = currentWorldDay; return []; }
  if (elapsedWorldDays <= 0) return [];

  const established = [...generatedRecords(character, "npc"), ...generatedRecords(character, "arc")]
    .filter(r => r._gen && (r._gen.tier === "established" || r._gen.tier === "nominated"));
  ws.lastTickWorldDay = currentWorldDay; // advance the baseline even if nothing's established yet
  if (!established.length || !evolveFn) return [];

  const news = [];
  try {
    const result = await evolveFn({ character, entities: established.slice(0, 4), elapsedWorldDays, currentWorldDay });
    for (const dev of (result?.developments || []).slice(0, 4)) {
      const rec = established.find(r => r.id === dev.entityId);
      if (!rec || !dev.note) continue;
      const note = String(dev.note).slice(0, 200);
      rec._gen.offscreen = [...(rec._gen.offscreen || []), { worldDay: currentWorldDay, note }].slice(-8);
      // accumulate the development on the entity's codex node so it "moved on" + surfaces
      try { applyCodexUpdates(character, [{ entityId: rec.id, label: rec.name, kind: rec._gen.type === "npc" ? "person" : "lore", fact: `[while away] ${note}` }], { day: ws.lastTickDay ?? null }); } catch { /* codex mirror is a convenience */ }
      news.push({ text: `${rec.name}: ${note}`, worldDay: currentWorldDay });
    }
  } catch (err) { console.warn("[offscreen-gen] skipped:", err.message); return []; }

  if (news.length) {
    const stamped = news.map(n => ({ day: ws.lastTickDay ?? null, worldDay: n.worldDay, text: String(n.text).slice(0, 220) }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return news;
}

/** The AI pass: what an established generated figure/thread did offscreen, in-grain. */
async function aiGeneratedEvolution({ entities, elapsedWorldDays, currentWorldDay }) {
  const list = entities.map(e => e._gen.type === "npc"
    ? `- ${e.id}: ${e.name} (npc) — wants: ${e.wants || "?"}; role: ${e.role || "?"}; disposition: ${JSON.stringify(e.spectrum || e.poleIntensity || {})}`
    : `- ${e.id}: ${e.name} (arc) — tension: ${e.tendency || "?"}; pressure: ${e.pressure || "?"}`
  ).join("\n");
  const sys = `You advance the OFFSCREEN lives of established figures and threads in an RPG while the player was away. ${elapsedWorldDays} world-days passed. For AT MOST 4 of them, decide ONE small, grounded, IN-GRAIN development that follows from their want/tension + disposition — no drastic turns, nothing that contradicts what's known, NOTHING set in the future. Reply ONLY JSON: {"developments":[{"entityId":"exact-id-from-the-list","note":"one sentence: what moved for them while away"}]}`;
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

/** The AI pass: what happened to known people while the character was away. */
async function aiNpcEvolution({ character, content, elapsed, currentDay }) {
  const reg = Object.values(character.npcRegistry).slice(0, 12).map(n =>
    `- ${n.id}: ${n.name} (${n.role}) — ${n.status}, relationship ${n.relationship}. Knows: ${n.knownFacts.join("; ") || "little"}. Last: ${n.history.slice(-2).join(" | ") || "n/a"}`
  ).join("\n");
  const events = (content.region.activeEvents || []).map(({ eventId }) => {
    const ev = content.events[eventId];
    const st = character.worldState.eventStages[eventId];
    const def = ev?.stages.find(s => s.stage === (st?.stage ?? 1));
    return ev ? `${ev.name} — stage ${st?.stage ?? 1} (${def?.name}): ${def?.summary}` : null;
  }).filter(Boolean).join("\n");
  const sys = `You advance the offscreen lives of RPG NPCs. ${elapsed} in-game days passed while the player was away. Given the known people and world events, decide what plausibly happened to AT MOST 3 of them — small, grounded developments (work, family, the crisis touching them, something they learned). No deaths or drastic turns unless the world events strongly imply it. Reply ONLY JSON:
{"npcUpdates": [{"npcId": "exact-id-from-list", "note": "what happened to them (1 sentence)", "learned": ["new fact they now know, if any"], "status": "active|injured|missing|departed (only if changed)"}], "news": ["short rumor the player might hear about it, if it would travel"]}`;
  const content2 = `Days passed: ${elapsed} (now day ${currentDay}).\n\nKNOWN PEOPLE:\n${reg}\n\nWORLD EVENTS:\n${events || "quiet"}`;
  return callClaudeJSON([{ role: "user", content: content2 }], { task: "world-tick", system: sys, maxTokens: 1024 });
}
