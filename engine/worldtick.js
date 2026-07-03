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
    const stamped = news.map(n => ({ day: currentDay, text: n }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { ticked: true, news };
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
  return news.slice(-8).map(n => `- [day ${n.day}] ${n.text}`).join("\n");
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
