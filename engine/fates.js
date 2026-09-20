// fates.js — ⛔ CCODE-381, shared lives (second stage): A LEGEND'S FATE IS THE WORLD'S.
import { smartClamp } from "./namematch.js";   // CCODE-463: the public record is clamped at a word, never sliced mid-word

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
import { normName } from "./namematch.js";   // CCODE-385: one person, one full name

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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ⛔ CCODE-385 — WHAT IS TRUE OF A PERSON IS THE WORLD'S; WHAT A PLAYER KNOWS OF THEM STAYS THEIRS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// Erik (SNG-595 §6): people "grow, have careers, do deeds, and die" — and a shared person frozen where one world last saw them is a
// defect. ⚑ MEASURED: 21 people sit in two or more saves' registries; the 4 with a shared identity (Mara Wells, Edvar Crane, Deni
// Cors, Pell) have a different role in EVERY save — Edvar is a "mill resident and water-reader" to Adelheid and an "agent of
// Stillwater's Trouble; filtration engineer" to Silas.
//
// ⛑ THE SPLIT. A registry entry keeps what THIS character knows — their relationship, their history, the role they know the person
// by. What happened TO the person — a new role, a death, a return — is stamped with the world-day when a world records it (`roleSince`,
// `statusSince`, written by `applyNpcUpdates`), published as a LIFE in `world/people/valley.json`, and folded by the latest day.
//   · a death is adopted into every registry that knows them (nobody the world buried walks into a story), with a line of news;
//   · a new role, or a lesser status, is held beside what the character knows (`worldLife`), for the GM to let surface — it is not
//     written over the character's knowledge, because they have not learned it yet.
// ⚠️ ONE PERSON, ONE FULL NAME. A life is shared only between records with the same full name: Usnea's "Pell", a cord seller, shares an
// id with Silas's "Pell Ran Marsh" and is somebody else. The first world to publish an id's life holds it.
// ⚠️ NOTHING IS BACKFILLED. A role written before the stamp stays that save's own; lives travel from the next change on.

const personKey = (who) => String(who?.characterId ?? "");
/** The same person, by full name — never by a given name or an alias. */
export function sameName(a, b) {
  const x = normName(String(a || "")), y = normName(String(b || ""));
  return !!x && x === y;
}

/** The ids whose lives can be shared: authored people and shared canon (a grown record this world has not promoted is its own), and
 *  the people the world made. Pure. */
export function sharedPersonIds(content = {}, character = null) {
  const ids = new Set();
  for (const [id, r] of Object.entries(content?.npcs || {})) if (r && (!r._gen || r._gen.promotedWorldDay != null)) ids.add(id);
  for (const f of character?.worldState?.mintedFigures || []) if (String(f?.id || "").startsWith("person-")) ids.add(f.id);
  return ids;
}

/** ⛔ WHO THE SHARED WORLD SHOULD KNOW ABOUT. Aevi's spec §3, and the numbers made her case: 100 authored
 *  people, 14 quest givers across the live saves, and NOT ONE of them in shared `people` or `fates`. Sister
 *  Vreni had been met seventeen times, with a full local record, and not one byte of it reached the world —
 *  so the next GM to see her in a ledger row invented a second Vreni.
 *
 *  ⛑ TWO WAYS IN, WHICHEVER FIRES FIRST, and they are Aevi's:
 *    · they GAVE a quest — a multi-stage relationship is the world caring
 *    · `met >= 3` — three separate meetings is a person, not a passerby
 *
 *  ⚠️ AND THE BAR ONLY WORKS BECAUSE EVERYBODY NOW HAS A NAME. Measured before CCODE-462: `met >= 3` took in
 *  68 people, and the bottom of that list held "The Messenger", "Hostel-keeper", "Waystation morning runner"
 *  — roles sitting in the name field, which promotion would have published as people, permanently. Erik's
 *  ruling closed that at the door: a person met in play is named from the first beat, so the third meeting
 *  is a person with a name. ⛔ The guard stays anyway, because a save that predates the repair or a record
 *  built by some path nobody has thought of yet must not put a job title into the world's canon.
 *  ⛑ A giver is resolved through the SAME ladder that decides whether to credit them, so
 *  "Warden Council bulletin (Lower Terrace)" resolves to nobody and is published as nobody. PURE. */
export function promotableIds(character, { giverIds = null, atMet = 3, isRole = null } = {}) {
  const reg = character?.npcRegistry || {};
  const givers = giverIds instanceof Set ? giverIds : new Set(giverIds || []);
  const out = new Set();
  for (const [id, n] of Object.entries(reg)) {
    if (!n || !n.id) continue;
    const nameForWorld = n.trueName || n.name;
    if (!nameForWorld) continue;
    // ⛔ a job title is not a person, whoever put it there
    if (typeof isRole === "function" && !n.trueName && isRole(nameForWorld, n.role || "")) continue;
    if (givers.has(id) || (Number(n.met) || 0) >= atMet) out.add(id);
  }
  return out;
}

/** ⛔ WHO THIS PERSON IS — the record `lives` was always for, against `fates`' "what became of them".
 *
 *  ⚠️ THE PERSON, NEVER THE KNOWING. Aevi: *"A life is public; what Adelheid privately learned, suspects or
 *  feels about Vreni is hers."* So: who they are, where and when they were first seen, and who met them —
 *  and NOT `knownFacts`, NOT `relationship`, NOT `history`, NOT a private status note. ⛑ `canonForViewer`
 *  could not have done this job: it filters on CONTENT RATING and knows nothing about privacy, so the lens
 *  she reached for would have passed every private fact straight through.
 *
 *  ⛔ AND THE NAME IT PUBLISHES IS THE ONE THE WORLD KNOWS — `trueName` when this character has not learned
 *  it yet (CCODE-462). The world is not ignorant of a person because one traveler has not been introduced;
 *  and `adoptLives` will not hand that name back to a character who calls them something else, because it
 *  folds only on a matching full name. They still have to earn it. PURE. */
export function introductionOf(n, { by = null } = {}) {
  if (!n?.id) return null;
  const name = n.trueName || n.name;
  if (!name) return null;
  const who = (x) => (x ? { characterId: x.characterId ?? null, name: x.name ?? null } : null);
  const first = n.firstMet && typeof n.firstMet === "object" ? n.firstMet : null;
  return {
    id: n.id, name,
    canonId: String(n.id).toLowerCase().replace(/-/g, "_"),   // the key `fates` and content use, so the two halves join
    intro: {
      // CLAMPED, NOT SLICED. `.slice` cuts mid-word, and this text is the PUBLIC record of who a person is —
      // the one place a severed sentence is read back to somebody else's GM as the whole of what is known.
      role: n.role ? smartClamp(String(n.role), 120) : null,
      description: n.description ? smartClamp(String(n.description), 240) : null,
      firstSeenDay: num(first?.day),
      where: first?.locationId || null,
      metBy: who(by),
    },
  };
}

/** What this world has seen change in a person's life, stamped. Null when nothing is stamped. Pure. */
export function lifeOf(n, { by = null } = {}) {
  if (!n?.id) return null;
  const rs = num(n.roleSince), ss = num(n.statusSince);
  if (rs == null && ss == null) return null;
  const who = (x) => (x ? { characterId: x.characterId ?? null, name: x.name ?? null } : null);
  return { id: n.id, name: n.name || null,
    ...(rs != null ? { role: n.role || null, roleSince: rs, roleBy: who(n.roleBy || by) } : {}),
    ...(ss != null ? { status: n.status || "active", statusNote: n.statusNote || null, statusSince: ss, statusBy: who(n.statusBy || by),
      ...(n.returnedFromDeath ? { returnedFromDeath: { day: num(n.returnedFromDeath.day) } } : {}) } : {}) };
}

const ROLE_FIELDS = ["role", "roleSince", "roleBy"];
const STATUS_FIELDS = ["status", "statusNote", "statusSince", "statusBy", "returnedFromDeath"];
const pickFields = (x, fields) => { const o = {}; for (const f of fields) if (x?.[f] !== undefined) o[f] = x[f]; return o; };

/** Which account of one aspect of a life stands: the later day; on a day, a death; then the world that recorded it. A death stands against
 *  a later status unless that status is a return from it. Pure, symmetric. */
function laterAspect(a, b, since, by, fields, { dies = false } = {}) {
  const ha = num(a?.[since]) != null, hb = num(b?.[since]) != null;
  if (!ha && !hb) return {};
  if (!hb) return pickFields(a, fields);
  if (!ha) return pickFields(b, fields);
  if (dies) {
    const deadA = a.status === "dead", deadB = b.status === "dead";
    if (deadA !== deadB) {
      const dead = deadA ? a : b, other = deadA ? b : a;
      const back = num(other.returnedFromDeath?.day);
      return pickFields(back != null && back >= num(dead[since]) ? other : dead, fields);
    }
  }
  const order = (num(b[since]) - num(a[since])) || cmp(personKey(a[by]), personKey(b[by])) * -1 || cmp(JSON.stringify(pickFields(b, fields)), JSON.stringify(pickFields(a, fields)));
  return pickFields(order > 0 ? b : a, fields);
}

/** Two accounts of one person's life, folded aspect by aspect. Pure, symmetric. */
export function mergeLife(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  // ⛔ THE EARLIEST INTRODUCTION STANDS, which is the opposite rule to every other aspect here and is the
  // right one: a life's role and status are answered by the LATEST account, because they change — but who
  // introduced a person to the world is a thing that happened once, and the first traveler to meet them is
  // the one it happened to. ⚠️ A day-less introduction never displaces a dated one.
  const ia = a.intro, ib = b.intro;
  const da = num(ia?.firstSeenDay), db = num(ib?.firstSeenDay);
  const intro = (!ia && !ib) ? null
    : (!ib ? ia : (!ia ? ib : (db == null ? ia : (da == null ? ib : (da <= db ? ia : ib)))));
  return { id: a.id || b.id, name: a.name || b.name,
    ...(a.canonId || b.canonId ? { canonId: a.canonId || b.canonId } : {}),
    ...(intro ? { intro } : {}),
    ...laterAspect(a, b, "roleSince", "roleBy", ROLE_FIELDS),
    ...laterAspect(a, b, "statusSince", "statusBy", STATUS_FIELDS, { dies: true }) };
}

/** Whether two lives say the same thing. Pure. */
export function sameLife(a, b) {
  if (!a || !b) return !a && !b;
  // ⚠️ THE INTRODUCTION IS PART OF THE KEY. Without it `foldLives` compares a life carrying one against a
  // life without, decides they say the same thing, and never writes — which is a promotion that silently
  // does nothing, the exact shape of the bug this whole pass exists to end.
  const key = (x) => JSON.stringify([normName(String(x.name || "")), x.role ?? null, num(x.roleSince), personKey(x.roleBy), x.status ?? null,
    x.statusNote ?? null, num(x.statusSince), personKey(x.statusBy), num(x.returnedFromDeath?.day),
    x.intro?.role ?? null, x.intro?.description ?? null, num(x.intro?.firstSeenDay), x.intro?.where ?? null, personKey(x.intro?.metBy)]);
  return key(a) === key(b);
}

/** The store after folding a world's lives in. A life under an id already held by a different full name is somebody else's, and is not
 *  folded. Returns the ids that moved. Pure. */
export function foldLives(store, lives = [], { regionId = "valley" } = {}) {
  const next = { schemaVersion: 1, regionId, ...(store && typeof store === "object" ? store : {}), lives: { ...(store?.lives || {}) } };
  const changed = [];
  for (const l of lives || []) {
    if (!l?.id) continue;
    const cur = next.lives[l.id] || null;
    if (cur && !sameName(cur.name, l.name)) continue;
    const merged = mergeLife(cur, l);
    if (!sameLife(merged, cur)) { next.lives[l.id] = merged; changed.push(l.id); }
  }
  return { store: next, changed };
}

/** Every stamped life this world holds, for the people whose lives can be shared. Pure. */
export function livesOfWorld(character, ids = new Set(), { by = null, introduce = null } = {}) {
  const intro = introduce instanceof Set ? introduce : new Set(introduce || []);
  const out = [];
  for (const [id, n] of Object.entries(character?.npcRegistry || {})) {
    if (!ids.has(id) && !intro.has(id)) continue;
    const l = lifeOf(n, { by });
    // ⛔ AND THIS IS THE SECOND GATE THAT STARVED `lives` TO ZERO. It published only STAMPED CHANGES — a role
    // or a status with a `since` day — so a person nobody's role had changed was never published at all,
    // however many times they had been met. Sister Vreni at seventeen meetings has no `roleSince`.
    const i = intro.has(id) ? introductionOf(n, { by }) : null;
    if (l && i) out.push({ ...i, ...l, canonId: i.canonId, intro: i.intro });
    else if (l) out.push(l);
    else if (i) out.push(i);
  }
  return out;
}

/** Adopt the world's lives into a character's registry: a death or a return is written onto the record; a new role or a lesser status
 *  is held beside what the character knows, as `worldLife`, and cleared once what they know has caught up. Only the same full name.
 *  Mutates. Returns [{ id, kind: "died"|"returned"|"role"|"status", name, note }]. */
export function adoptLives(character, lives = {}, { ids = new Set(), by = null } = {}) {
  const reg = character?.npcRegistry || {};
  const out = [];
  for (const [id, life] of Object.entries(lives || {})) {
    const n = reg[id];
    if (!n || !life || !ids.has(id) || !sameName(n.name, life.name)) continue;
    const mine = lifeOf(n, { by });
    const merged = mergeLife(mine, life);
    // the status: a death or a return is the person's, and every world holds it
    const statusWon = num(merged.statusSince) != null && JSON.stringify(pickFields(merged, STATUS_FIELDS)) !== JSON.stringify(pickFields(mine, STATUS_FIELDS));
    if (statusWon) {
      if (merged.status === "dead" && n.status !== "dead") {
        n.status = "dead"; n.statusNote = merged.statusNote || n.statusNote || null; n.statusSince = merged.statusSince; n.statusBy = merged.statusBy || null;
        if (n.worldLife) { delete n.worldLife.status; delete n.worldLife.statusNote; delete n.worldLife.statusSince; }
        out.push({ id, kind: "died", name: n.name, note: merged.statusNote || null, worldDay: merged.statusSince });
      } else if (n.status === "dead" && merged.status !== "dead" && merged.returnedFromDeath) {
        n.status = merged.status; n.statusNote = merged.statusNote || null; n.statusSince = merged.statusSince; n.statusBy = merged.statusBy || null;
        n.returnedFromDeath = { ...(n.returnedFromDeath || {}), day: merged.returnedFromDeath.day };
        out.push({ id, kind: "returned", name: n.name, worldDay: merged.statusSince });
      } else if (merged.status !== n.status) {
        n.worldLife = { ...(n.worldLife || {}), status: merged.status, statusNote: merged.statusNote || null, statusSince: merged.statusSince };
        out.push({ id, kind: "status", name: n.name, worldDay: merged.statusSince });
      }
    }
    // the role: held beside what the character knows, never over it
    if (num(merged.roleSince) != null && merged.role && merged.role !== n.role && (num(mine?.roleSince) == null || num(merged.roleSince) > num(mine.roleSince))) {
      if (n.worldLife?.role !== merged.role) {
        n.worldLife = { ...(n.worldLife || {}), role: merged.role, roleSince: merged.roleSince };
        out.push({ id, kind: "role", name: n.name, worldDay: merged.roleSince });
      }
    } else if (n.worldLife?.role && (n.worldLife.role === n.role || num(mine?.roleSince) >= num(n.worldLife.roleSince))) {
      delete n.worldLife.role; delete n.worldLife.roleSince;   // what the character knows has caught up
    }
    if (n.worldLife && !Object.keys(n.worldLife).length) delete n.worldLife;
  }
  return out;
}

/** What a player hears of a life: a death or a return, since `sinceWorldDay`, at most `max`. A new role is not news — it surfaces in a
 *  scene, when someone says it. Pure. */
export function lifeNews(adopted = [], { sinceWorldDay = null, max = 2 } = {}) {
  const out = [];
  for (const a of adopted || []) {
    if (out.length >= max) break;
    if (a.kind !== "died" && a.kind !== "returned") continue;
    if (sinceWorldDay != null && num(a.worldDay) != null && num(a.worldDay) < sinceWorldDay) continue;
    out.push(a.kind === "died"
      ? { text: `Word reaches you: ${a.name} has died${a.note ? ` — ${a.note}` : ""}.`, worldDay: a.worldDay, tier: "event", kind: "death", victimId: a.id }
      : { text: `Word reaches you: ${a.name} is back among the living.`, worldDay: a.worldDay, tier: "event" });
  }
  return out;
}
