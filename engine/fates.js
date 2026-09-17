// fates.js — ⛔ CCODE-381, shared lives (second stage): A LEGEND'S FATE IS THE WORLD'S.
//
// Erik 2026-09-16: "The world changes for everyone." — and of the people in it, "they must, they do… careers, do deeds, and die."
//
// ⚑ MEASURED across every save with a world: 33 legends appear in two or more of them, and the saves disagree about 29. The Undefeated
// is stopped in two worlds, active in one and wounded in two. Each save ran its own simulation of the same people, and nothing ever
// carried an outcome from one to another — so a legend could die for Silas and walk into Adelheid's scene.
//
// ⛑ ONE RECORD PER LEGEND in `world/people/valley.json` (`fates`), and ONE RULE that every client folds the same way:
//   · two deaths — the EARLIEST stands, because nobody dies twice; their death states merge (sealed if either sealed, the deeper depth);
//   · a death against anything else — the death stands, unless the other is a RETURN from death on or after it;
//   · otherwise the LATEST event stands — a tie goes to the heavier (wounded over checked), then to the world that recorded it, so
//     every client, in any order, picks the same one.
// Each save still runs its own pass. Before it runs it adopts the world's fates; after, it publishes what it changed.
//
// ⛔ CCODE-384 — AND THE PEOPLE THE WORLD MAKES ARE SHARED TOO (Erik: "Yes people could be shared"). A person minted from an event takes
// an id DERIVED FROM THE EVENT (`personIdFor`): the survivor of the Undefeated's death is the same `person-…` in every world, so two
// worlds that saw the death meet one survivor, not two, and the population grows with what happens rather than with how many players
// there are. The first world to publish a person sets who they are (`people`); every world adopts them into its roster, and their fates
// fold with everyone else's. The five people minted before this, under per-world counters (`minted-1` was three different people),
// keep their lives under ids of their own world (`scopeLegacyMintedIds`).
// ⚠️ THE STATE, NOT THE STORY. A career, a deed log, a crusade stay each world's own; what is shared is what a person IS now.

import { clashLine, newsVoiceOf } from "./newsvoice.js";

export const FATES_PATH = "world/people/valley.json";
/** How long a wound keeps a legend off the board, and a check — `applyEpicClashOutcome` writes both from here. */
export const WOUND_DAYS = 8;
export const STOP_DAYS = 3;
const SEVERITY = { dead: 3, wounded: 2, stopped: 1, active: 0 };
const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v))) ? null : Number(v);

/** The world-day a status BEGAN: the death, the wound or check (stamped `sinceWorldDay`, or read back from its end for a record written
 *  before the stamp), the return from death. Null for a legend nothing has happened to — there is nothing to share. Pure. */
export function fateDay(st) {
  if (!st || typeof st !== "object") return null;
  if (st.status === "dead") return num(st.diedWorldDay) ?? num(st.deathState?.diedDay);
  if (st.status === "wounded") return num(st.sinceWorldDay) ?? (num(st.woundedUntilDay) != null ? num(st.woundedUntilDay) - WOUND_DAYS : null);
  if (st.status === "stopped") return num(st.sinceWorldDay) ?? (num(st.stoppedUntilDay) != null ? num(st.stoppedUntilDay) - STOP_DAYS : null);
  return num(st.returnedFromDeath?.day);
}

/** A status as a shareable fate: the record, the day it began, and the world that recorded it (a record adopted from another world keeps
 *  that world's name). Null when there is nothing to say. Pure. */
export function fateOf(st, { by = null } = {}) {
  const day = fateDay(st);
  if (day == null) return null;
  const who = st.fateBy || by || null;
  return { ...st, atWorldDay: day, ...(who ? { fateBy: { characterId: who.characterId ?? null, name: who.name ?? null } } : {}) };
}

const byKey = (f) => String(f?.fateBy?.characterId ?? "");
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
/** The same order from either side: -1 when `a` goes first. */
function tiebreak(a, b) {
  return cmp(byKey(a), byKey(b)) || cmp(JSON.stringify(a), JSON.stringify(b));
}

/** Two deaths of one legend: the earlier is the death, and the two records of the dark merge — sealed if either world sealed it, as deep
 *  as the deeper, held open if either holds it. Pure. */
function mergeDeaths(a, b) {
  const [first, second] = (a.atWorldDay - b.atWorldDay || tiebreak(a, b)) <= 0 ? [a, b] : [b, a];
  const d1 = first.deathState, d2 = second.deathState;
  if (!d1 && !d2) return first;
  const depth = [num(d1?.depthOverride), num(d2?.depthOverride)].filter(v => v != null);
  const heldOpenBy = d1?.heldOpenBy || d2?.heldOpenBy || null;
  return { ...first, deathState: { ...(d2 || {}), ...(d1 || {}),
    sealed: !!(d1?.sealed || d2?.sealed), depthOverride: depth.length ? Math.max(...depth) : null,
    ...(heldOpenBy ? { heldOpenBy } : {}) } };
}

/** Which of two fates for one legend stands. Symmetric — `mergeFate(a, b)` and `mergeFate(b, a)` are the same record — so every client
 *  folding the same records reaches the same world whatever order they arrive in. Pure. */
export function mergeFate(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  const deadA = a.status === "dead", deadB = b.status === "dead";
  if (deadA && deadB) return mergeDeaths(a, b);
  if (deadA || deadB) {
    const dead = deadA ? a : b, other = deadA ? b : a;
    const back = num(other.returnedFromDeath?.day);
    return back != null && back >= dead.atWorldDay ? other : dead;
  }
  const order = (b.atWorldDay - a.atWorldDay) || ((SEVERITY[b.status] ?? 0) - (SEVERITY[a.status] ?? 0)) || tiebreak(a, b);
  return order <= 0 ? a : b;
}

/** Whether two fates say the same thing — the status, when it began, who recorded it, who did it, and how deep a death has gone. Pure. */
export function sameFate(a, b) {
  if (!a || !b) return !a && !b;
  const key = (f) => JSON.stringify([f.status, f.atWorldDay, byKey(f), f.killedBy ?? null, f.woundedBy ?? null, f.stoppedBy ?? null,
    num(f.woundedUntilDay), num(f.stoppedUntilDay), num(f.returnedFromDeath?.day),
    !!f.deathState?.sealed, num(f.deathState?.depthOverride), f.deathState?.heldOpenBy ?? null]);
  return key(a) === key(b);
}

/** Every authored legend's fate in one save's world, recorded as that world's. Pure. */
export function fatesOfWorld(ws, ids = [], { by = null } = {}) {
  const out = {};
  for (const id of ids) {
    const f = fateOf(ws?.epicStatus?.[id], { by });
    if (f) out[id] = f;
  }
  return out;
}

/** The shared store after folding one world's fates into it, and which legends' records moved. Pure. */
export function foldFates(store, fates = {}, { regionId = "valley" } = {}) {
  const next = { schemaVersion: 1, regionId, ...(store && typeof store === "object" ? store : {}), fates: { ...(store?.fates || {}) } };
  const changed = [];
  for (const [id, f] of Object.entries(fates || {})) {
    const merged = mergeFate(next.fates[id] || null, f);
    if (!sameFate(merged, next.fates[id] || null)) { next.fates[id] = merged; changed.push(id); }
  }
  return { store: next, changed };
}

/** Adopt the world's fates into a save's world, for the authored legends. A record that loses to the world's is replaced by it (keeping
 *  who recorded it, so it is never re-published as this world's); one that wins is left for the publish. Mutates `ws.epicStatus`.
 *  Returns [{ id, before, after, atWorldDay }] for the records that changed. */
export function adoptFates(ws, fates = {}, ids = [], { by = null } = {}) {
  if (!ws) return [];
  ws.epicStatus = ws.epicStatus || {};
  const known = new Set(ids);
  const adopted = [];
  for (const [id, remote] of Object.entries(fates || {})) {
    if (!known.has(id) || !remote) continue;
    const local = fateOf(ws.epicStatus[id], { by });
    const winner = mergeFate(local, remote);
    if (sameFate(winner, local)) continue;
    const before = ws.epicStatus[id] ? { ...ws.epicStatus[id] } : null;
    const { atWorldDay, ...record } = winner;
    ws.epicStatus[id] = record;
    adopted.push({ id, before, after: record, atWorldDay });
  }
  return adopted;
}

/** What a player hears of a fate their own world did not see: the authored clash line where there is one, each item carrying the ids a
 *  clash line carries. Only what happened since `sinceWorldDay` (the last time this save read the world's fates) and within
 *  `windowDays`, and at most `max`, the gravest first — a death, a return, a wound, a check.
 *  ⚑ MEASURED on the rollout: a save's first fold would have recited 14 to 20 other worlds' clashes at once, and the news keeps 20, so
 *  a player's own news would have been pushed out by a backlog. The caller passes no news at all on a save's first read. Pure. */
const NEWS_ORDER = { dead: 0, active: 1, wounded: 2, stopped: 3 };
export function fateNews(adopted = [], { roster = [], content = null, worldDay = null, windowDays = 10, sinceWorldDay = null, max = 3 } = {}) {
  const byId = new Map((roster || []).map(f => [f?.id, f]));
  const voice = newsVoiceOf(content);
  const out = [];
  const ranked = [...(adopted || [])].sort((x, y) => ((NEWS_ORDER[x.after?.status] ?? 9) - (NEWS_ORDER[y.after?.status] ?? 9))
    || ((y.atWorldDay ?? 0) - (x.atWorldDay ?? 0)) || String(x.id).localeCompare(String(y.id)));
  for (const a of ranked) {
    if (out.length >= max) break;
    if (worldDay != null && a.atWorldDay != null && worldDay - a.atWorldDay > windowDays) continue;
    if (sinceWorldDay != null && a.atWorldDay != null && a.atWorldDay < sinceWorldDay) continue;
    const before = a.before?.status || "active", after = a.after?.status;
    if (after === "dead" && before === "dead") continue;                    // a death gone deeper, or the same death another world kept
    if (after === "active" && before !== "dead") continue;                  // nothing happened to tell
    if (after === before && fateDay(a.before) === a.atWorldDay) continue;   // the same wound or check, recorded by another world
    const loser = byId.get(a.id);
    if (!loser?.name) continue;
    const winnerId = after === "dead" ? a.after.killedBy : after === "wounded" ? a.after.woundedBy : after === "stopped" ? a.after.stoppedBy : null;
    const winner = winnerId ? (byId.get(winnerId) || null) : null;
    if (after === "active") {
      out.push({ text: `${loser.name} has come back from death. The valley has one of its own again.`, worldDay: a.atWorldDay, tier: "event" });
      continue;
    }
    if (!winner?.name) {
      // a killer this world cannot name (a figure minted in another world) still leaves a death; a wound with nobody to name is state
      if (after === "dead") out.push({ text: `A legend has fallen: ${loser.name} is dead.`, kind: "death", victimId: loser.id, worldDay: a.atWorldDay, tier: "event" });
      continue;
    }
    const outcome = after === "dead" ? "killed" : after;
    const said = clashLine({ templates: voice.templates, outcome, winner, loser });
    const fallback = outcome === "killed" ? `A legend has fallen: ${winner.name} has killed ${loser.name}.`
      : outcome === "wounded" ? `${winner.name} bested ${loser.name} — ${loser.name} withdraws to lick their wounds.`
      : `${winner.name} checked ${loser.name} — for now, ${loser.name}'s designs are held.`;
    out.push(outcome === "killed"
      ? { text: said || fallback, kind: "death", victimId: loser.id, killerId: winner.id, worldDay: a.atWorldDay, tier: "event" }
      : { text: said || fallback, kind: "clash", outcome, winnerId: winner.id, loserId: loser.id, worldDay: a.atWorldDay, tier: "event" });
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ⛔ CCODE-384 — THE PEOPLE THE WORLD MAKES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Two FNV-1a passes over a string, as hex — stable across every client and every run. */
function fnvHex(str) {
  const run = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, "0");
  };
  const t = String(str);
  return run(t) + run([...t].reverse().join(""));
}

/** ⛔ A person's id, from the event that made them. The same event gives the same id in every world. Pure. */
export function personIdFor(key) {
  return `person-${fnvHex(String(key || ""))}`;
}

/** A person minted by a world's own counter, before ids were shared. */
export const LEGACY_MINTED_ID = /^minted-\d+$/;

/** How long an arc must stand empty, in world-days, before a second taker could be sent for it — one per arc per window, however
 *  many worlds noticed the empty seat. */
export const VACANCY_WINDOW_DAYS = 14;

/** The event a person is minted from, as a key: a death's survivor and successor are keyed by who died (nobody's death makes two
 *  survivors, whichever worlds saw it); a taker of an empty arc by the arc and the window. Pure. */
export function mintKey({ originKind = "_default", deadId = null, arcId = null, worldDay = 0, windowDays = VACANCY_WINDOW_DAYS } = {}) {
  if (originKind === "vacancy_filled") return `vacancy_filled|${arcId}|${Math.floor((Number(worldDay) || 0) / Math.max(1, windowDays))}`;
  return `${originKind}|${deadId}`;
}

/** ⛔ The one-time move of a save's legacy people onto ids of their own world: every KEY and every string TOKEN equal to an old id,
 *  anywhere in the save (world state, codex topics, a battle picture's key), in place — so nothing holding the character goes stale.
 *  `minted-12` is never touched by renaming `minted-1`. Idempotent: a save with no legacy people renames nothing. Returns the renames. */
export function scopeLegacyMintedIds(character) {
  const figures = character?.worldState?.mintedFigures || [];
  const map = new Map();
  for (const f of figures) if (f && LEGACY_MINTED_ID.test(String(f.id))) map.set(f.id, personIdFor(`${character.id || "world"}|${f.id}`));
  if (!map.size) return [];
  const token = /\bminted-\d+\b/g;
  const swap = (text) => String(text).replace(token, (m) => map.get(m) || m);
  const seen = new Set();
  const walk = (node) => {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string") { const v = swap(node[i]); if (v !== node[i]) node[i] = v; }
        else walk(node[i]);
      }
      return;
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      // ⚠️ A KEY CAN CARRY THE ID INSIDE IT, not only be it — a battle picture is keyed "minted-1|prodigal_gearheart|…|stalemate"
      const nextKey = swap(key);
      const nextValue = typeof value === "string" ? swap(value) : value;
      if (nextKey !== key) { delete node[key]; node[nextKey] = nextValue; }
      else if (nextValue !== value) node[key] = nextValue;
      if (nextValue && typeof nextValue === "object") walk(nextValue);
    }
  };
  walk(character);
  return [...map].map(([from, to]) => ({ from, to }));
}

/** The world's people as this world holds them: the shareable ones (an event-derived id). Pure. */
export function sharedPeopleOf(ws) {
  return (ws?.mintedFigures || []).filter(f => f && typeof f.id === "string" && f.id.startsWith("person-"));
}

/** Who a person IS, as the store keeps it — set by the first world to publish them, never rewritten by a later one. Pure. */
const IDENTITY = ["id", "name", "epithet", "provisional", "tier", "weight", "wants", "originKind", "region", "arcAffinity", "arcAffinities",
  "wantArcId", "personalVerbs", "mintedWorldDay", "origin", "legend", "tradition", "homeland"];
export function personIdentity(fig) {
  const out = {};
  for (const k of IDENTITY) if (fig?.[k] !== undefined) out[k] = JSON.parse(JSON.stringify(fig[k]));
  return out;
}

/** The store after adding a world's people: a person already there keeps who they are. Returns the ids added. Pure. */
export function foldPeople(store, people = [], { regionId = "valley" } = {}) {
  const next = { schemaVersion: 1, regionId, ...(store && typeof store === "object" ? store : {}), people: { ...(store?.people || {}) } };
  const added = [];
  for (const f of people || []) {
    if (!f?.id || next.people[f.id]) continue;
    next.people[f.id] = personIdentity(f);
    added.push(f.id);
  }
  return { store: next, added };
}

/** Adopt the world's people into a save's roster: a person this world has not met in its own passes joins it; one it minted under the
 *  same event keeps its own life but takes the world's account of who they are. Respects the roster cap. Mutates `ws.mintedFigures`.
 *  Returns [{ id, joined }] for the people who changed. */
export function adoptPeople(ws, people = {}, { cap = 140 } = {}) {
  if (!ws) return [];
  ws.mintedFigures = ws.mintedFigures || [];
  const out = [];
  for (const [id, who] of Object.entries(people || {})) {
    if (!who?.id) continue;
    const mine = ws.mintedFigures.find(f => f?.id === id);
    if (!mine) {
      if (ws.mintedFigures.length >= cap) continue;
      ws.mintedFigures.push(JSON.parse(JSON.stringify(who)));
      out.push({ id, joined: true, person: who });
      continue;
    }
    const drift = IDENTITY.some(k => k !== "tier" && k !== "weight" && k !== "legend" && JSON.stringify(mine[k]) !== JSON.stringify(who[k]));
    if (!drift) continue;
    for (const k of IDENTITY) if (k !== "tier" && k !== "weight" && k !== "legend" && who[k] !== undefined) mine[k] = JSON.parse(JSON.stringify(who[k]));
    out.push({ id, joined: false, person: who });
  }
  return out;
}

/** What a player hears of a person who came into the story in another world: the line the pass itself says at a birth. Only those
 *  born since `sinceWorldDay` and within `windowDays`, at most `max`, newest first. Pure. */
export function birthNews(adopted = [], { worldDay = null, sinceWorldDay = null, windowDays = 10, max = 2 } = {}) {
  const out = [];
  const joined = (adopted || []).filter(a => a?.joined && a.person)
    .sort((x, y) => (Number(y.person.mintedWorldDay) || 0) - (Number(x.person.mintedWorldDay) || 0) || String(x.id).localeCompare(String(y.id)));
  for (const a of joined) {
    if (out.length >= max) break;
    const f = a.person, day = num(f.mintedWorldDay);
    if (worldDay != null && day != null && worldDay - day > windowDays) continue;
    if (sinceWorldDay != null && day != null && day < sinceWorldDay) continue;
    const origin = f.origin || null;
    out.push({ text: f.provisional || !f.name
        ? `Someone new is being spoken of${origin ? ` — they ${origin}` : ""}.`
        : `A new name is being spoken of — ${f.name}${origin ? `, ${origin}` : ""}.`,
      worldDay: day ?? worldDay, tier: "murmur", kind: "birth", figureId: f.id });
  }
  return out;
}
