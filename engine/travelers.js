// engine/travelers.js — SNG-595: A FELLOW TRAVELER IS A PERSON THE WORLD HAS A RECORD OF.
//
// ⛔ ERIK 2026-09-16: "Courtney's PC Adelheid asked Edvar Crane about Silas and the gm doesn't seem to be able
// to follow the details of that story. How much crosses the worlds?"
//
// ⚑ MEASURED, ON THE LIVE STORES AND ON HER SAVE, BEFORE A LINE OF THIS WAS WRITTEN:
//   · WHAT CROSSES — region crisis stages (max-wins); one frozen canon card per person, clipped to 90 characters
//     in the prompt (Edvar Crane is one of the 15, and he is in the shared world at all because SILAS made him
//     real, on Silas's day 13); and news headlines — top five by band per pass, one hop at a time, last eight
//     shown.
//   · WHAT DOES NOT — relationships. Every person is a per-save copy. Edvar in Silas's save: bond +5, met twelve
//     times, commissioned as his agent. Edvar in Adelheid's: −1, met once, never heard of the cascade.
//   · AND THE LEDGER'S READER OPENED ONE FILE. `fetchLedger(0)` read `world/ledger/<this month>.json` and nothing
//     else, so 15 of Silas's 23 public deeds — all of July: Millbrook, Warden Coll, Edvar's commission, and
//     "downstream wells clear in a week or two" — had not been read by anyone since the first of August.
//   · AND NOTHING TOLD THE GM THAT "SILAS WEIR" IS A PLAYER.
//
// ⚠️ SO THE GM HAD NOTHING, AND BUILT HIM OUT OF WHAT WAS IN FRONT OF IT. A Halvex Coil murmur in her news block
// ("tuning instruments he does not play") became Silas "with tuning instruments at the sluice-turn"; her own
// Harmonic terrace became "a Harmonic stationed at the Heights"; and a contamination his own record says he
// helped CLOSE became one he may have CAUSED — written into her codex as fact and into Mara's errand as a manhunt.
//
// ⛑ THE PRODUCER EXISTED. The ledger IS the world's public record of what travelers did, and it was only ever
// read as NEWS — by month, by recency, by distance. Nothing read it BY PERSON, which is the one question a player
// is asking when they say a name. This module is that reader, and it carries the one fact no store carried at
// all: the name belongs to somebody else's character, and their story is not the GM's to invent.
//
// ⚠️ PURE. The IO lives in `worldtick.syncTravelers` and `sync.fetchLedgerAll`; the collapse of double-logged
// beats is injected (it lives in worldtick.js, and importing that here would make a cycle of a leaf).

import { normName, givenName, smartClamp } from "./namematch.js";
import { tierForArc, tierRank } from "./legends.js";
import { relationOf } from "./presence.js";

/** ⛔ WHAT A TRAVELER PUBLISHES ABOUT THEMSELVES — and it is deliberately small.
 *
 *  Enough to RECOGNISE the name and speak of them truthfully: who they are, what people they come from, how
 *  far along they are. ⚠️ NEVER where they are standing, what they carry, who they are bonded to, or anything
 *  else from the save. The save is theirs; the ledger is what the world saw; this card is only the key that
 *  joins a spoken name to the second. */
export function travelerCard(character, { playerKey = null, now = Date.now() } = {}) {
  if (!character?.id || !String(character?.name || "").trim()) return null;
  const card = {
    id: String(character.id),
    name: String(character.name).trim(),
    playerKey: playerKey || character.playerKey || null,
    level: Number(character.level) || 1,
  };
  if (character.origin) card.origin = String(character.origin);
  // ⛔ PRONOUNS ONLY WHEN SOMEONE SAID THEM. A player's character carries no pronoun field today, and the
  // SNG-594 rule stands: a person's pronouns are not the engine's to derive.
  if (character.pronouns) card.pronouns = String(character.pronouns);
  card.updatedAt = new Date(Number(now) || Date.now()).toISOString();
  return card;
}

/** ⚠️ A TICK THAT CHANGES NOTHING WRITES NOTHING. `updatedAt` is when the card was stamped, not a change. */
export function cardChanged(prev, next) {
  if (!next) return false;
  if (!prev) return true;
  return ["name", "playerKey", "level", "origin", "pronouns"].some(k => (prev[k] ?? null) !== (next[k] ?? null));
}

/** The merge body for `pushMergedFile`: ONE KEY PER CHARACTER, the same union-safe shape as `arcs.byActor`, so
 *  two travelers publishing at once re-merge rather than clobber. Idempotent. */
export function mergeTravelerCard(remote, card) {
  const travelers = (remote && remote.travelers && typeof remote.travelers === "object") ? { ...remote.travelers } : {};
  if (card?.id) travelers[card.id] = card;
  return { schemaVersion: 1, travelers };
}

/** The `YYYY-MM` a moment falls in — UTC, exactly as `appendLedger` names the file it writes. */
export function ledgerMonthOf(when) {
  const d = new Date(when);
  return Number.isFinite(+d) ? d.toISOString().slice(0, 7) : null;
}

/** ⛔ WHICH LEDGER FILES A READ "SINCE" MUST OPEN.
 *
 *  ⚠️ THE OLD READER OPENED ONLY THIS MONTH'S, whatever `since` said. A player who last looked at 23:00 on the
 *  31st and came back at 01:00 on the 1st had every row written in between filtered as "already read" — it was
 *  newer than `since` and sat in a file nobody opened — and `lastSharedReadAt` then moved past it forever.
 *
 *  ⛑ A character that has NEVER read keeps today's behaviour exactly: this month only. Handing a brand-new
 *  character a year of other people's history as fresh news is a different change, and not one anybody asked for. */
export function ledgerMonthsSince(since, now = new Date(), { maxMonths = 12 } = {}) {
  const cur = ledgerMonthOf(now);
  if (!cur) return [];
  const s = since ? new Date(since) : null;
  if (!s || !Number.isFinite(+s) || +s <= 0 || +s > +new Date(now)) return [cur];
  const out = [];
  let y = s.getUTCFullYear(), m = s.getUTCMonth();
  for (let guard = 0; guard < 600; guard++) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    out.push(key);
    if (key >= cur) break;
    m++; if (m > 11) { m = 0; y++; }
  }
  return out.slice(-Math.max(1, Number(maxMonths) || 12));
}

// A name appears in a text as WHOLE WORDS — "Mara" is never inside "Maren", "Coll" never inside "Collier".
function hasWords(haystack, needle) {
  if (!needle || needle.length < 4) return false;
  return new RegExp(`(^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`).test(haystack);
}

/** ⛔ THE OTHER TRAVELERS THESE WORDS NAME.
 *
 *  Full name as whole words, or the GIVEN name alone — because nobody says "Silas Weir" twice in a conversation.
 *  ⚠️ BUT A GIVEN NAME IS A WEAK KEY IN THIS WORLD, and SNG-166 measured why: Mara was met by four characters.
 *  So a given name counts only when it is UNIQUE among the travelers and belongs to NOBODY this character already
 *  knows — "Silas" means the traveler, unless there is a Silas in her own registry, in which case she means him.
 *  And a traveler whose full name is shared by someone she knows is that person, not a player. */
export function namedTravelers(text, index, { selfId = null, registry = null } = {}) {
  const words = normName(text);
  if (words.length < 4) return [];
  const cards = Object.values(index?.travelers || {}).filter(c => c?.id && c.name && c.id !== selfId);
  const known = Object.values(registry || {}).map(n => n?.name).filter(Boolean);
  const knownFull = new Set(known.map(normName));
  const knownGiven = new Set(known.map(givenName).filter(Boolean));
  const givenCount = new Map();
  for (const c of cards) { const g = givenName(c.name); givenCount.set(g, (givenCount.get(g) || 0) + 1); }
  const out = [];
  for (const c of cards) {
    const full = normName(c.name), g = givenName(c.name);
    if (knownFull.has(full)) continue;
    const byFull = hasWords(words, full);
    const byGiven = !byFull && g !== full && givenCount.get(g) === 1 && !knownGiven.has(g) && hasWords(words, g);
    if (byFull || byGiven) out.push(c);
  }
  return out;
}

/** ⛔ A TRAVELER'S PUBLIC RECORD — their deeds on the shared ledger, EVERY month, oldest first.
 *
 *  ⚠️ `hidden` never crosses, as it never has. ⚠️ AND NEITHER DOES `unseen`, and that is a new line, not an old
 *  one: an unseen deed happened with nobody watching, so while news may carry THAT it happened, nobody in the
 *  world can know WHO did it — and this is a record keyed by who. Attributing it would be the GM knowing what
 *  no person could. */
export function travelerDeeds(ledger, travelerId, { collapse = null, withhold = null } = {}) {
  const seen = new Set();
  const rows = [];
  for (const e of Array.isArray(ledger) ? ledger : []) {
    if (!e || e.who !== travelerId || !String(e.what || "").trim()) continue;
    if (e.visibility === "hidden" || e.visibility === "unseen") continue;
    // ⛑ THE FAMILY FLOOR, INJECTED: ledger rows carry no rating, so the caller that knows the viewer decides.
    if (typeof withhold === "function" && withhold(String(e.what))) continue;
    const key = `${e.at}::${e.what}`;               // one write read twice (the live July file has one) is one deed
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(e);
  }
  const collapsed = typeof collapse === "function" ? collapse(rows) : rows;
  const wd = (e) => Number.isFinite(Number(e.worldDay)) ? Number(e.worldDay) : Infinity;
  return [...collapsed].sort((a, b) => wd(a) - wd(b) || String(a.at).localeCompare(String(b.at)));
}

/** Where a deed happened, in words — the place's own name when this world has it, otherwise its id made
 *  readable. ⚠️ Never "gen-waygate": a slug in a sentence the GM will read aloud is a slug in the fiction. */
export function placeWords(where, locations = {}) {
  if (!where) return null;
  const named = locations?.[where]?.name;
  if (named) return named;
  const words = String(where).replace(/^gen-/, "").replace(/[-_]+/g, " ").trim();
  return words ? words.replace(/\b\w/g, c => c.toUpperCase()) : null;
}

/** ⛔ WHO IN THIS CHARACTER'S WORLD WAS PART OF THE TRAVELER'S STORY.
 *
 *  Two kinds of evidence, both public, neither guessed:
 *    · NAMED IN A DEED — the ledger row says their name.
 *    · MADE REAL THROUGH THEIR STORY — the shared canon record's provenance names the traveler as the one whose
 *      play promoted this person into the world. That is Edvar and Silas exactly: Edvar Crane exists in the shared
 *      world BECAUSE of Silas, and no store said so to anyone but the library page.
 *  People in the scene come first — they are the ones being asked. */
export function peopleInTheirStory(traveler, deeds, { sceneNames = [], registry = {}, canon = [] } = {}) {
  const scene = [...new Set((sceneNames || []).map(n => String(n || "").trim()).filter(Boolean))];
  const sceneSet = new Set(scene.map(normName));
  const people = new Map();   // normName -> { name, here, deeds: [], madeReal }
  const consider = (name, here) => {
    const k = normName(name);
    if (!k || k.length < 4 || k === normName(traveler?.name) || people.has(k)) return;
    people.set(k, { name: String(name).trim(), here, deeds: [], madeReal: false });
  };
  for (const n of scene) consider(n, true);
  for (const r of Object.values(registry || {})) if (r?.name) consider(r.name, sceneSet.has(normName(r.name)));
  for (const [k, p] of people) {
    for (const d of deeds) if (hasWords(normName(d.what), k)) p.deeds.push(d);
  }
  const ids = new Map(Object.values(registry || {}).filter(r => r?.id && r?.name).map(r => [r.id, normName(r.name)]));
  for (const v of Array.isArray(canon) ? canon : []) {
    const rec = v?.record || v;
    if (rec?._canon?.provenance?.characterId !== traveler?.id) continue;
    const k = ids.get(rec.id) || normName(rec.name);
    if (people.has(k)) people.get(k).madeReal = true;
  }
  return [...people.values()].filter(p => p.deeds.length || p.madeReal)
    .sort((a, b) => (b.here - a.here) || (b.madeReal - a.madeReal) || (b.deeds.length - a.deeds.length));
}

/** ⛔ THE BLOCK. Empty unless the words name another player's character — a block that costs nothing on the turns
 *  that ask nothing, which is the same bargain `recallForGM` made for places.
 *
 *  ⚠️ THE VIEW NAMES WHAT IT LEFT OUT (SNG-334). A traveler with sixty deeds does not get sixty lines; they get
 *  every deed that names somebody here, then the most recent, and a count of the rest — because a windowed record
 *  that reads as complete is how a GM decides a quiet stretch was empty. */
export function travelersForGM(text, { index = null, ledger = [], canon = [], character = null, sceneNames = [],
  locations = {}, origins = [], bands = null, collapse = null, withhold = null, limit = 2, maxDeeds = 12 } = {}) {
  const named = namedTravelers(text, index, { selfId: character?.id || null, registry: character?.npcRegistry || null }).slice(0, limit);
  if (!named.length) return "";
  const out = [];
  const myBand = character ? tierRank(tierForArc(character.level, bands), bands) : null;
  for (const t of named) {
    const deeds = travelerDeeds(ledger, t.id, { collapse, withhold });
    const tier = tierForArc(t.level, bands);
    const rel = relationOf(myBand, tierRank(tier, bands));
    const origin = (origins || []).find(o => o?.id === t.origin)?.name || null;
    out.push(`- ${t.name} — ANOTHER TRAVELER: a player's character, not one of yours. Level ${t.level} · ${tier}${rel ? ` — ${rel.say}` : ""}.`);
    out.push(`  ${origin ? `Of ${origin}. ` : ""}${t.pronouns ? `Pronouns: ${t.pronouns}.` : "Pronouns not recorded — use the name."}`);
    const people = peopleInTheirStory(t, deeds, { sceneNames, registry: character?.npcRegistry || {}, canon });
    if (people.length) {
      out.push(`  People in THIS story who were part of theirs:`);
      for (const p of people.slice(0, 6)) {
        const why = [p.madeReal ? `came into the wider world through ${t.name}'s story — they know each other` : null,
          p.deeds.length ? `named in ${p.deeds.length} of their deeds` : null].filter(Boolean).join("; ");
        out.push(`    · ${p.name} ${p.here ? "[IN THIS SCENE — first-hand]" : "[known to this character]"} — ${why}`);
      }
    }
    if (!deeds.length) {
      out.push(`  Their public record: EMPTY. The world has seen nothing of theirs — anyone here who has not met them does not know them.`);
      continue;
    }
    // every deed that names someone here, then the most recent, never more than maxDeeds
    const keep = new Set(people.flatMap(p => p.deeds));
    for (const d of [...deeds].reverse()) { if (keep.size >= maxDeeds) break; keep.add(d); }
    const shown = deeds.filter(d => keep.has(d)).slice(-maxDeeds);
    const left = deeds.length - shown.length;
    out.push(`  Their public record — ${deeds.length} deed${deeds.length === 1 ? "" : "s"} the world saw, oldest first${left ? ` (${left} not shown)` : ""}:`);
    for (const d of shown) {
      const when = Number.isFinite(Number(d.worldDay)) ? `world-day ${d.worldDay}` : "undated";
      const where = placeWords(d.where, locations);
      const who = people.filter(p => p.deeds.includes(d)).map(p => p.name);
      out.push(`    · [${when}${where ? ` · ${where}` : ""}] ${smartClamp(d.what, 220)}${who.length ? `  ← ${who.join(", ")}` : ""}`);
    }
    const last = deeds[deeds.length - 1];
    out.push(`  Last on record: ${Number.isFinite(Number(last.worldDay)) ? `world-day ${last.worldDay}` : "undated"}${placeWords(last.where, locations) ? `, near ${placeWords(last.where, locations)}` : ""}.`);
  }
  return out.join("\n");
}
