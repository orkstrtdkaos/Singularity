// engine/worldevents.js — CCODE-354: A CRISIS ANOTHER TRAVELER ANSWERED READS AS ANSWERED, FOR EVERYONE.
//
// ⛔ ERIK 2026-09-16, on Adelheid replaying the Millbrook water crisis fifty world-days after Silas closed it: "IF the crisis
// somehow reset to that point, then I could see that... but the Intent is to have the world living and breathing and
// changing for everyone. So - her particular quest needs to morph into discovering that the water coming down the watershed
// IS clean now..."
//
// ⛔ AEVI, SNG-595, the same morning: "A stage is a STATE, and a state is overtaken by the most recent actor — never by the
// worst one." And: "THE MERGE MUST CARRY WHO."
//
// ⚑ MEASURED BEFORE A LINE OF THIS WAS WRITTEN:
//   · `syncSharedWorld` adopted a remote stage only `if (!local || st.stage > local.stage)`. Escalation crossed because it is
//     higher; easing was thrown away because it is lower. The content authors an easing path and the merge discarded it.
//   · NOTHING could mark a crisis answered. No quest effect writes `eventStages`, no author op does, and the four authored
//     stages of `water_crisis` end at "The Brink" (999 days). Silas resolved What the Water Remembers ("redirected") on
//     world-day 26, and every save plus the shared file still read stage 2, `sinceDay: 13`, fifty days later.
//   · And the region file went up through `pushOwnedFile` — an OVERWRITE of a file every client writes (Law 7 says merge).
//
// ⛑ SO: a state carries `rev` (who changed it last, and when), the merge keeps the LATEST, an ANSWER beats any question,
// and an answered crisis is read as answered — with who, when, and the aftermath its authors already wrote.
//
// ⚠️ PURE. The IO lives in `worldtick.syncSharedWorld`; this module only decides.

// A beat count, not forever: a directive that repeats every turn is a mechanism arguing with the story (the "Set right:
// pronouns" lesson). Three beats is enough for a busy scene not to swallow it.
export const WORLD_MOVED_ON_BEATS = 3;

/** Who acted, in the shape the shared record carries. */
export function actorOf(character) {
  return character?.id ? { id: String(character.id), name: String(character.name || character.id) } : null;
}

/** A quest id as both spellings meet: the authored `what_the_water_remembers` and the saved `what-the-water-remembers`. */
export function questKey(id) {
  return String(id ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** ⛔ STAMP A CHANGE. The merge compares `rev`, so a change nobody stamped is a change that cannot win. */
export function stampEventChange(st, { by = null, worldDay = null } = {}) {
  if (!st) return st;
  st.rev = (Number(st.rev) || 0) + 1;
  if (Number.isFinite(Number(worldDay)) && worldDay !== null) st.atWorldDay = Number(worldDay);
  if (by) st.by = by; else delete st.by;
  return st;
}

/** ⛔ WHICH OF TWO STATES OF ONE CRISIS IS TRUE.
 *
 *  1. ⛔ AN ANSWER BEATS A QUESTION, whatever the revisions say. A client that was offline while a crisis was answered can
 *     arrive with a higher `rev` from ticking its own copy upward — and letting that win would un-answer the world.
 *  2. Otherwise the LATEST — the higher `rev`.
 *  3. ⚠️ Two states NEITHER side ever stamped keep the old rule exactly (the higher stage), because that is the only rule both
 *     were written under; changing it retroactively would reorder history nobody can re-derive.
 *  4. The same revision written twice (two clients from one base): the later world-day, then the higher stage. */
export function latestEventState(local, remote) {
  const L = local || null, R = remote || null;
  if (!R) return { winner: L, from: "local" };
  if (!L) return { winner: R, from: "remote" };
  if (!!R.resolved !== !!L.resolved) return R.resolved ? { winner: R, from: "remote" } : { winner: L, from: "local" };
  const lr = Number(L.rev) || 0, rr = Number(R.rev) || 0;
  if (lr !== rr) return rr > lr ? { winner: R, from: "remote" } : { winner: L, from: "local" };
  if (!lr) return (Number(R.stage) || 0) > (Number(L.stage) || 0) ? { winner: R, from: "remote" } : { winner: L, from: "local" };
  const la = Number(L.atWorldDay) || 0, ra = Number(R.atWorldDay) || 0;
  if (la !== ra) return ra > la ? { winner: R, from: "remote" } : { winner: L, from: "local" };
  return (Number(R.stage) || 0) > (Number(L.stage) || 0) ? { winner: R, from: "remote" } : { winner: L, from: "local" };
}

// The same state, as far as anyone reading the world could tell — `sinceDay` is a character's own clock and differs by save.
function sameState(a, b) {
  return (Number(a?.stage) || 0) === (Number(b?.stage) || 0) && (Number(a?.rev) || 0) === (Number(b?.rev) || 0)
    && (a?.resolved?.outcome || null) === (b?.resolved?.outcome || null) && !!a?.resolved === !!b?.resolved;
}

/** Merge two `eventStages` maps. `adopted` lists every event where the REMOTE state won and differs — the caller turns
 *  those into news and resets the local timer; `merged` is the map to keep and to write. */
export function mergeEventStages(local = {}, remote = {}) {
  const merged = {};
  const adopted = [];
  for (const id of new Set([...Object.keys(local || {}), ...Object.keys(remote || {})])) {
    const { winner, from } = latestEventState(local?.[id], remote?.[id]);
    if (!winner) continue;
    merged[id] = { ...winner };
    if (from === "remote" && !sameState(local?.[id], remote?.[id])) adopted.push({ eventId: id, before: local?.[id] || null, after: remote[id] });
  }
  return { merged, adopted };
}

/** ⛔ AN ANSWERED CRISIS. Idempotent: a replayed resolution does not answer it twice, and the FIRST answer stands as the
 *  event's — a later traveler who takes the same quest up again changes the quest's record, not who closed the crisis. */
export function resolveEvent(ws, eventId, { outcome = null, outcomeName = null, questId = null, by = null, worldDay = null } = {}) {
  if (!ws || !eventId) return null;
  ws.eventStages = ws.eventStages || {};
  const st = ws.eventStages[eventId] || (ws.eventStages[eventId] = { stage: 1, sinceDay: Number(ws.lastTickDay) || 1 });
  if (st.resolved) return st;
  const wd = Number.isFinite(Number(worldDay)) && worldDay !== null ? Number(worldDay) : null;
  st.resolved = { outcome: outcome || null, outcomeName: outcomeName || null, questId: questId ? questKey(questId) : null, by: by || null, worldDay: wd };
  stampEventChange(st, { by, worldDay: wd });
  return st;
}

/** ⛔ A WORLD-TIER QUEST'S OUTCOME, ON THE SHARED RECORD. Keyed by quest; the latest resolution is the record and the
 *  earlier ones are kept as history, because "the first Wright fixed the harm, the second would make it hold" (Aevi's own
 *  board) is a story with two chapters, not an overwrite. */
export function recordQuestOutcome(ws, questId, { outcome = null, outcomeName = null, by = null, worldDay = null } = {}) {
  if (!ws || !questId || !outcome) return null;
  ws.questOutcomes = ws.questOutcomes || {};
  const key = questKey(questId);
  const prev = ws.questOutcomes[key] || null;
  const wd = Number.isFinite(Number(worldDay)) && worldDay !== null ? Number(worldDay) : null;
  const entry = { outcome, outcomeName: outcomeName || null, by: by || null, worldDay: wd };
  if (prev && prev.outcome === entry.outcome && prev.by?.id === entry.by?.id && prev.worldDay === entry.worldDay) return prev;
  const history = [...(prev?.history || []), ...(prev ? [{ outcome: prev.outcome, outcomeName: prev.outcomeName, by: prev.by, worldDay: prev.worldDay }] : [])].slice(-8);
  return (ws.questOutcomes[key] = { ...entry, rev: (Number(prev?.rev) || 0) + 1, ...(history.length ? { history } : {}) });
}

/** Merge two `questOutcomes` maps: the higher `rev` per quest, then the later world-day; histories union. */
export function mergeQuestOutcomes(local = {}, remote = {}) {
  const out = {};
  const sig = (h) => `${h?.outcome}|${h?.by?.id || ""}|${h?.worldDay ?? ""}`;
  for (const key of new Set([...Object.keys(local || {}), ...Object.keys(remote || {})])) {
    const L = local?.[key], R = remote?.[key];
    if (!L || !R) { out[key] = { ...(L || R) }; continue; }
    const lr = Number(L.rev) || 0, rr = Number(R.rev) || 0;
    const win = rr !== lr ? (rr > lr ? R : L) : ((Number(R.worldDay) || 0) > (Number(L.worldDay) || 0) ? R : L);
    const lose = win === R ? L : R;
    const seen = new Set([sig(win)]);
    const history = [];
    for (const h of [...(L.history || []), ...(R.history || []), lose]) {
      if (!h || seen.has(sig(h))) continue;
      seen.add(sig(h));
      history.push({ outcome: h.outcome, outcomeName: h.outcomeName || null, by: h.by || null, worldDay: h.worldDay ?? null });
    }
    history.sort((a, b) => (Number(a.worldDay) || 0) - (Number(b.worldDay) || 0));
    out[key] = { ...win, ...(history.length ? { history: history.slice(-8) } : {}) };
  }
  return out;
}

/** ⛔ WHAT THE WORLD LOOKS LIKE AFTER — AUTHORED, NEVER INVENTED.
 *
 *  Read in this order: the event's own `resolutions[outcome]`, which is the home for it, then the resolving quest's
 *  `priorOutcomeBoards[outcome]._theWorldNow`, which Aevi wrote in advance for exactly this reader (SNG-552 O4: "authored in
 *  advance so it is retrieved rather than invented") and which nothing had ever read.
 *
 *  ⛔ CCODE-392 — AND THE EVENT'S HOME CARRIES THREE THINGS, NOT ONE. SNG-601 authored all four of the water crisis's
 *  aftermaths a day after `summary` became readable, and `aftermath` (the concrete changes: the rationing ended, the guards
 *  not posted one morning) and `toneForGM` (the register: "relief with an open end… the valley has already half-forgotten
 *  how close it was") had no reader — the same shape as the 141 place looks CCODE-391 just connected. `changes` is what is
 *  TRUE now and may be stated as fact; `tone` is how it is said. */
export function aftermathOf(ev, resolved, { quests = [] } = {}) {
  const o = resolved?.outcome || null;
  const res = ev?.resolutions?.[o] || ev?.resolutions?.default || null;
  const list = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []).map(x => String(x).trim()).filter(Boolean);
  if (res?.summary) return { text: String(res.summary), source: "event", changes: list(res.aftermath), tone: res.toneForGM ? String(res.toneForGM) : null };
  const def = (Array.isArray(quests) ? quests : []).find(q => q && questKey(q.id) === questKey(resolved?.questId));
  const board = o ? def?.priorOutcomeBoards?.[o] : null;
  if (board?._theWorldNow) return { text: String(board._theWorldNow), source: "quest", board, changes: [], tone: null };
  return { text: null, source: null, changes: [], tone: null };
}

/** ⛔ THE GM'S LINE FOR ONE ANSWERED EVENT.
 *
 *  ⚠️ WITHOUT THE EVENT'S GM-EYES `truth`. That truth describes a danger still running, and handing it over beside
 *  "answered" is how a GM ends up narrating the river waking again. ⛑ WITH the stage it had reached, because that is the
 *  damage the aftermath is made of — "upstream fisher families fall ill" is who is still mending. */
export function answeredEventLine(ev, st, { quests = [], selfId = null } = {}) {
  const r = st?.resolved;
  if (!r) return null;
  const name = ev?.name || "A crisis";
  const who = r.by?.name ? `, by ${r.by.name}${r.by.id && r.by.id === selfId ? " — this character" : " — another traveler"}` : "";
  const when = r.worldDay != null ? ` on world-day ${r.worldDay}` : "";
  const reached = (ev?.stages || []).find(s => s.stage === Number(st.stage));
  const { text, changes, tone } = aftermathOf(ev, r, { quests });
  return `${name} — ANSWERED${when}${who}${r.outcomeName ? ` (${r.outcomeName})` : ""}. It is OVER: never narrate it as active, spreading or waking.`
    + `${reached ? ` Before it was answered it had reached ${reached.name}: ${reached.summary}` : ""}`
    + `${text ? ` The world now: ${text}` : " What remains is its aftermath — repair, recovery, and the people who lived through it."}`
    // ⛔ CCODE-392: the authored consequences are FACTS about the valley now — a GM may state them, and should not invent around them
    + `${(changes || []).length ? ` True here now, and yours to state plainly: ${changes.map(c => `— ${c}`).join(" ")}` : ""}`
    + `${tone ? ` The register of it: ${tone}` : ""}`;
}

/** ⛔ THE WORLD MOVED ON WHILE THIS CHARACTER WAS NOT LOOKING.
 *
 *  For a few beats after a character's world first carries an answer it did not make, the GM is told plainly — so a player
 *  whose own notes still describe the old danger (Adelheid's codex: "something beneath it is actively waking") meets the
 *  change in the story rather than never. Your OWN answer needs no announcing. Returns null when there is nothing to say. */
export function worldMovedOnForGM(character, { events = {}, quests = [] } = {}) {
  const ws = character?.worldState;
  if (!ws?.eventStages) return null;
  const lines = [];
  for (const [id, st] of Object.entries(ws.eventStages)) {
    const r = st?.resolved;
    if (!r || (r.by?.id && r.by.id === character.id)) continue;
    if ((Number(ws.worldMovedOnSeen?.[id]?.beats) || 0) >= WORLD_MOVED_ON_BEATS) continue;
    const line = answeredEventLine(events?.[id], st, { quests, selfId: character.id });
    if (line) lines.push(`- ${line}`);
  }
  return lines.length ? lines.join("\n") : null;
}

/** Count a beat on which the world-moved-on directive actually reached the GM. */
export function noteWorldMovedOnShown(character) {
  const ws = character?.worldState;
  if (!ws?.eventStages) return 0;
  let n = 0;
  for (const [id, st] of Object.entries(ws.eventStages)) {
    const r = st?.resolved;
    if (!r || (r.by?.id && r.by.id === character.id)) continue;
    ws.worldMovedOnSeen = ws.worldMovedOnSeen || {};
    const prev = Number(ws.worldMovedOnSeen[id]?.beats) || 0;
    if (prev >= WORLD_MOVED_ON_BEATS) continue;
    ws.worldMovedOnSeen[id] = { beats: prev + 1 };
    n++;
  }
  return n;
}

/** ⛔ A WORLD-TIER QUEST SOMEBODY ELSE ALREADY ENDED — the board for the next telling, read at last.
 *
 *  Aevi's convention (SNG-552 O4): "A world-tier quest already resolved by another actor must NOT simply close for the next
 *  one — the second player did their own work to reach the decision… THEY GET A DIFFERENT BOARD: the same situation, acting
 *  on the world as it now IS." It was keyed to a `location_state` that exists only in the resolver's own save; the shared
 *  outcome record is the key every save can read. Returns null unless another traveler ended it AND a board is authored. */
export function priorBoardFor(def, character) {
  const rec = character?.worldState?.questOutcomes?.[questKey(def?.id)];
  if (!rec || !def?.priorOutcomeBoards) return null;
  if (rec.by?.id && rec.by.id === character.id) return null;
  const board = def.priorOutcomeBoards[rec.outcome];
  return board ? { record: rec, board } : null;
}
