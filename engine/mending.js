// engine/mending.js — SNG-679 PART R · R4 + R6: A PLAYER MENDS WHAT IS BROKEN, AND IS REWARDED; MENDING IS A JOB ON THE JOB LIST.
//
// ✅ ERIK: *"One world. If you burn a bridge someone must repair or rebuild it. Either the locals — and they'll try to track you
// down — or a player (who may be rewarded)."* And: *"You could have local jobs like that show up on the job list — they're like
// quests you can delegate or assign people to, or just do yourself."*
// ✅ AEVI (R4): *"Every game shows the job at the place, drawn from the shared record: `wanted` … It appears on the SNG-677 card,
// and on the character's job list (R6). … everyone who worked is paid `playerReward.share` × the repair value × their share: in
// the Reach's scrip or crystal, never coin; with origin `reward` … plus `standingSteps[state]` with the community."*
// `mapStates.jobs`: *"One job brings a thing up one rung … At most three mending jobs on a board at once, nearest first, from things
// the character knows of within two days of where they are or of one of their holds. The place card lists them all."*
//
// ⛔ NO NEW MACHINERY FOR WHO GOES (R6): a mend is a job like any other — posted to the board `jobstate.js` holds, planned and rolled
// by `jobs.js`, sent by whoever the player sends — with one stake, `mend`, that the job's own effects path applies through the one
// door (`applyMapChange`, by the character). ⛑ PAID AS EACH RUNG IS DONE, through the job's own `crystal` stake and `earnAt`
// (origin "reward", the place's own money — a Reach's scrip or crystal; no region pays in coin): the same total as "paid when it is
// whole", and the share a player is owed when the locals finish first is exactly what they were already paid.
import { parseMapKey, mapStateOf, rungOf, ladderOf, localsWillMend, mapThingOf, repairFraction, applyMapChange, localRepairAt, eventsFor, sortEvents, mapStateWord } from "./mapstate.js";
import { personIdFor } from "./fates.js";   // ✅ R3: a holder minted from the event that made the debt — the same person in every game
import { mintedName } from "./names.js";
import { priceHere } from "./money.js";
import { worthOfGoods } from "./holdings.js";
import { walkingDays } from "./worldmap.js";
import { postJob, dropJob, ensureJobs } from "./jobstate.js";
import { smartClamp } from "./namematch.js";

const cap = (s) => String(s || "").replace(/^./, (c) => c.toUpperCase());
const fill = (t, vals) => Object.entries(vals).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v ?? "")), String(t || ""));
const wordsOf = (content) => content?.mapStates?.reckoning?.words || {};
const jobsOf = (content) => content?.mapStates?.jobs || {};

/** The places a key is at — a road has two ends; a hold, a feature and a region are nobody's place to mend. */
export function keyPlaces(key) {
  const p = parseMapKey(key);
  if (!p || p.row.onRecord || p.cls === "region") return [];
  return p.cls === "road" ? p.rest.split("|") : [p.id];
}
/** A site key's own kind and name, from the place's layout (authored, or the one this save drew). */
export function siteOfKey(key, { content = null, character = null } = {}) {
  const p = parseMapKey(key);
  if (!p || p.cls !== "site") return null;
  const sites = content?.rules?.localLayouts?.[p.id]?.sites || character?.localLayouts?.[p.id]?.sites || [];
  return sites.find((s) => s?.id === p.sub) || null;
}
/** ⛔ WHO BROKE IT — the last change that DAMAGED it, not the last that changed it: after a player mends a rung the record's `by` is
 *  the mender, and reading that made the mender the culprit (measured: "Make good the Water Wheels", offered to the one who had
 *  just restored them). */
export function culpritOf(record) {
  const hit = (record?.history || []).filter((h) => h && ["damaged", "ruined", "destroyed"].includes(h.change)).pop();
  return hit?.by ?? null;
}
/** Every world key this save holds an event for. */
function heldKeys(character) {
  return [...new Set([...(character?.mapEvents || []).map((e) => e?.key), ...Object.keys(character?.worldMapStore?.keys || {})].filter(Boolean))];
}

/** ⛔ WHAT A BROKEN THING IS WORTH — R3/R4's *"`repairCost` × the thing's build value"*. A world thing has no build of its own; the
 *  hold feature that draws as the same site kind does (a mill is a mill, a gate a gate), and its build goods are priced the way a
 *  store is. Null when nothing prices it — a road, a river — and the job then pays by its level. Pure. */
export function mendValue(key, { content = null, regionId = null, siteKind = null } = {}) {
  const p = parseMapKey(key);
  if (!p) return null;
  /* ✅ AEVI 2026-10-09: *"What a road, a river or a place is worth: `mapStates.buildWorth`, in crystal, scaled against your Water
   * Wheels' 40: road 30; water 60; ground 25; gate 300; a place by its `dwellings`: none 20, few 30, hamlet 60, village 150, town
   * 400, city 1000. A Reach pays the same figure in scrip."* ⛔ A SITE IS STILL PRICED AS THE FEATURE IT IS (the Wheels are a mill);
   * everything with no hold feature reads the table. ⚠️ This priced a waygate as a hold's door (40) and a road, a river and a place
   * at nothing, so no job was ever posted for them and no damages were ever owed. A place grown in play has no `dwellings` entry
   * and stays unpriced, rather than taking a size it was never given. */
  const BW = content?.mapStates?.buildWorth || null;
  if (!siteKind && BW && p.cls !== "site") {
    if (p.cls === "place") {
      const d = content?.rules?.localGround?.places?.[p.id]?.dwellings;
      const v = d ? Number(BW.place?.[d]) : NaN;
      return Number.isFinite(v) ? v : null;
    }
    const v = Number(BW[p.cls]);
    if (Number.isFinite(v)) return v;
  }
  const want = siteKind || ({ gate: "gate", ground: "field" }[p.cls] || null);
  if (!want) return null;
  const kinds = content?.rules?.economy?.holdFeatures?.kinds || {};
  const def = Object.values(kinds).find((d) => d && d.siteKind === want && d.build?.goods);
  if (!def) return null;
  const cfg = { ...(content?.rules?.economy?.holdStore || {}), features: kinds };
  return worthOfGoods(def.build.goods, { economy: content?.rules?.economy || null, regionId, cfg });
}
/** One rung's share of a repair's value: from `state` one rung toward whole, × `playerReward.share`. */
export function rungValue(state, value, content) {
  const l = ladderOf(content);
  const to = l[Math.max(0, rungOf(content, state) - 1)];
  const share = Number(content?.mapStates?.repair?.playerReward?.share ?? 1);
  const part = repairFraction(content, state) - (rungOf(content, to) ? repairFraction(content, to) : 0);
  return Math.max(0, part * (Number(value) || 0) * share);
}

/** ⛔ WHAT IS BROKEN AT A PLACE, as the place card shows it (R4: *"The place card lists them all"*): each thing, its state, the
 *  `wanted` line, and the locals' `mending` line while they are at it. Pure. */
export function brokenAt(character, placeId, { content = null, worldDay = null } = {}) {
  const W = wordsOf(content);
  const out = [];
  for (const key of heldKeys(character)) {
    if (!keyPlaces(key).includes(placeId)) continue;
    const p = parseMapKey(key);
    if (!p || !p.row.allows.includes("repaired")) continue;
    const rec = mapStateOf(character, key, { content });
    const state = String(rec.state || "whole");
    if (rungOf(content, state) === 0) continue;
    const t = mapThingOf(key, content, { siteName: siteOfKey(key, { content, character })?.name || null, from: placeId });
    if (!t) continue;
    const rep = worldDay != null ? localRepairAt(rec, key, worldDay, content) : null;
    out.push({ key, state, thing: t.thing, place: t.place,
      wanted: W.wanted ? fill(W.wanted, { place: t.place, mend: (W.mend || {})[state] || "mend", thing: t.thing }) : null,
      mending: rep?.mending && W.mending ? fill(W.mending, { place: t.place, thing: t.thing }) : null,
      localsWill: localsWillMend(key, state, content) });
  }
  return out;
}

/** ⛔ THE MENDING JOBS A CHARACTER IS OFFERED (R6): `jobs.onBoardMax` of them, nearest first, from broken things within
 *  `jobs.withinDays` of where they are or of one of their holds. ⛑ S7 is not built, so "the things the character knows of" is
 *  everything — Aevi's *"ship with learned = everything"*. The CULPRIT is offered the chance to make good, once and first; their
 *  work earns nothing (it counts against what they owe, R3). ⚠️ What the locals will not mend — a gate to be made again, a razed
 *  place to resettle — goes through their own doors and is not offered here yet. Returns job specs for `postJob`. Pure. */
export function mendingJobsFor(character, { content = null } = {}) {
  const J = jobsOf(content), W = wordsOf(content), L = content?.locations || {};
  const within = Number(J.withinDays ?? 2), max = Number(J.onBoardMax ?? 3);
  const steps = content?.mapStates?.repair?.playerReward?.standingSteps || {};
  const anchors = [...new Set([character?.currentLocationId, ...(character?.holdings || []).map((h) => h?.locationId)].filter((id) => id && L[id]))];
  const found = [];
  for (const key of heldKeys(character)) {
    const p = parseMapKey(key);
    if (!p || p.row.onRecord || !p.row.allows.includes("repaired")) continue;
    const rec = mapStateOf(character, key, { content });
    const state = String(rec.state || "whole");
    const rung = rungOf(content, state);
    if (rung === 0 || !localsWillMend(key, state, content)) continue;
    const places = keyPlaces(key).filter((id) => L[id]);
    if (!places.length) continue;
    let near = Infinity;
    for (const a of anchors) for (const b of places) { const d = a === b ? 0 : walkingDays(L[a], L[b]); if (Number.isFinite(d) && d < near) near = d; }
    if (!(near <= within)) continue;
    const site = siteOfKey(key, { content, character });
    const where = places.find((id) => anchors.includes(id)) || places[0];
    const t = mapThingOf(key, content, { siteName: site?.name || null, from: where });
    if (!t) continue;
    const culprit = !!character?.id && culpritOf(rec) === character.id;
    if (culprit && character?.mendDeclined?.[key]) continue;   // the make-good is offered once; declined, it is gone
    const mend = (W.mend || {})[state] || "mend";
    const label = culprit ? fill(J.labels?.makeGood || "Make good the {thing} at {place}", { thing: t.thing, place: t.place })
      : fill(J.labels?.mend || "{Mend} the {thing} at {place}", { Mend: cap(mend), mend, thing: t.thing, place: t.place });
    const value = mendValue(key, { content, regionId: L[where]?.regionId || null, siteKind: site?.kind || null });
    const level = 4 + 6 * rung;
    const pay = culprit ? 0 : Math.round(value != null ? rungValue(state, value, content) : level);
    const last = rung === 1;   // this rung brings it to whole
    found.push({ near, culprit, spec: {
      id: `mend:${key}`.slice(0, 80),   // prose-cap-ok: an identifier
      label: smartClamp(label, 120), where, level,
      effort: Number(J.effortDays?.[state]) || 4,
      // ⛑ CCODE-693: the key's own class first; content still keys a gate's needs `waygate`, read until it is renamed
      needs: (J.needs?.[p.cls] || (p.cls === "gate" ? J.needs?.waygate : null) || J.needs?.default || [{ family: "RESTORE", weight: 2 }]).map((n) => ({ family: n.family, weight: n.weight })),
      from: smartClamp(fill(J.from || "the people of {place}", { place: t.place }), 60),
      stakes: { mend: { key, from: state, culprit },
        ...(pay > 0 ? { crystal: Math.min(pay, 4 * level) } : {}),
        ...(!culprit && last ? { standing: Math.min(2, Number(steps[state]) || 1), deed: smartClamp(fill(W.thanked || "", { place: t.place, mend, thing: t.thing }), 120) } : {}) },
    } });
  }
  return found.sort((a, b) => (Number(b.culprit) - Number(a.culprit)) || (a.near - b.near)).slice(0, max).map((x) => x.spec);
}

/** Put them on the board: a mend whose thing is no longer broken (or no longer near) comes off; a new one goes on; one already
 *  there for the same rung stays as it is. Mutates `character.jobs`. → `{ posted, dropped }` */
export function postMendingJobs(character, { content = null, day = null } = {}) {
  const specs = mendingJobsFor(character, { content });
  const B = ensureJobs(character).board;
  const want = new Map(specs.map((s) => [s.id, s]));
  let dropped = 0;
  for (const j of [...B]) {
    if (!String(j?.id || "").startsWith("mend:")) continue;
    const s = want.get(j.id);
    if (!s || s.stakes.mend.from !== j.stakes?.mend?.from) { dropJob(character, j.id); dropped++; }
  }
  const posted = [];
  for (const s of specs) {
    if (ensureJobs(character).board.some((j) => j?.id === s.id)) continue;
    const r = postJob(character, s, { day });
    if (r.ok) posted.push(r.job);
  }
  return { posted, dropped };
}

/** ⛔ A MEND DONE — a job's success: one rung, through the one door, by the character; the rungs they did kept on the save for R3
 *  (a culprit's work counts against what they owe). Mutates. → `{ ok, state, whole, said }` */
export function applyMend(character, mend, { content = null, worldDay = null } = {}) {
  if (!character || !mend?.key) return { ok: false, said: null };
  const before = mapStateOf(character, mend.key, { content }).state;
  const site = siteOfKey(mend.key, { content, character });
  // ✅ AEVI 2026-10-09: a place mended reads `mendedPlace` — "{place} is whole again." It has no "{thing} at {place}" form, and the
  // fallback read "the it at there".
  const placeId = String(mend.key).startsWith("place:") ? String(mend.key).slice(6) : null;
  const placeName = placeId ? (content?.locations?.[placeId]?.name || placeId.replace(/^gen-/, "").replace(/[-_]+/g, " ")) : null;
  const t = mapThingOf(mend.key, content, { siteName: site?.name || null }) || { thing: "it", place: "there" };
  const r = applyMapChange(character, { key: mend.key, change: "repaired", by: character.id || "player",
    cause: mend.culprit ? "making good what they did" : "hands sent to mend it" }, { content, worldDay });
  if (!r.ok) return { ok: false, said: `${placeName || `the ${t.thing} at ${t.place}`} was past this mending by the time they got there — ${r.why}` };
  character.mendWork = character.mendWork && typeof character.mendWork === "object" ? character.mendWork : {};
  const w = character.mendWork[mend.key] || { rungs: 0, culprit: !!mend.culprit };
  w.rungs += 1; w.lastDay = Math.floor(Number(worldDay) || 0);
  character.mendWork[mend.key] = w;
  const whole = rungOf(content, r.state) === 0;
  const W = wordsOf(content);
  const stateWord = (s) => (placeId ? mapStateWord(content, "place", s, { name: placeName }) : null) || s;
  const said = placeId
    ? (whole && W.mendedPlace ? fill(W.mendedPlace, { place: placeName }) : `${placeName} is ${stateWord(r.state)} now, no longer ${stateWord(before)}`)
    : (whole && W.mended ? fill(W.mended, { thing: t.thing, place: t.place }) : `the ${t.thing} at ${t.place} is ${r.state} now, no longer ${before}`);
  return { ok: true, state: r.state, whole, said };
}

/* ═════ PART R · R3: AND THEY GO AFTER WHOEVER DID IT ═════
 * ✅ AEVI: *"This happens when the mending costs the locals anything (their own work or a reward they pay) and the change was
 * `named` or `described`: A debt of kind `damages` goes on the culprit's save … Holder: a named local. Use the place's own people
 * (`npcsPresent`) when there are any. Otherwise mint one with an id derived from the event, so every game meets the same person.
 * Amount: what the locals actually spent … recomputed as the work goes on. … this holder always acts … Someone is sent … The
 * culprit's news reads `asking`, then `sent`. When they arrive it is a scene: `found`. The outcomes are `reckoning.outcomes`."*
 * ⛔ IT RUNS IN THE CULPRIT'S OWN GAME, from the shared events: every game holds the same events, and only the one whose character
 * did it owes. ⛑ `unseen` damage is not traced here — the locals mend it and remember (R7's investigation can still find out). */
const DAMAGE = new Set(["damaged", "ruined", "destroyed"]);
/** The fold replayed event by event, in the fold's own order: `[{ e, before, after }]`. */
function replay(events, content) {
  const l = ladderOf(content);
  let st = l[0];
  const out = [];
  for (const e of sortEvents(events, content)) {
    const before = st;
    if (e?.change === "repaired") st = l[Math.max(0, rungOf(content, st) - 1)];
    else if (DAMAGE.has(e?.change)) st = l[Math.max(rungOf(content, st), rungOf(content, e.change))];
    else if (e?.change === "added" && st === "destroyed") st = l[0];
    out.push({ e, before, after: st });
  }
  return out;
}
const rungPay = (state, value, content) => (value != null ? rungValue(state, value, content) : 4 + 6 * rungOf(content, state));
/** ⛔ WHAT THE LOCALS HAVE SPENT on a key since it was last whole — their own rungs, and the rewards they paid players who were not
 *  the culprit. The culprit's own rungs cost them nothing and come OFF what is owed (*"work it off … the debt falls by its value"*).
 *  → `{ damage, culprit, seen, value, spent, workedOff, rungs }`, or null when it is whole. Pure. */
export function localsSpentOn(character, key, { content = null } = {}) {
  const steps = replay(eventsFor(character, key), content);
  const l0 = ladderOf(content)[0];
  let start = -1;
  steps.forEach((s, i) => { if (s.before === l0 && s.after !== l0) start = i; });
  if (start < 0) return null;
  const cycle = steps.slice(start);
  const damage = [...cycle].reverse().find((s) => DAMAGE.has(s.e?.change))?.e || null;
  if (!damage) return null;
  const culprit = damage.by || null;
  const place = keyPlaces(key)[0];
  const site = siteOfKey(key, { content, character });
  const value = mendValue(key, { content, regionId: content?.locations?.[place]?.regionId || null, siteKind: site?.kind || null });
  let spent = 0, workedOff = 0, worst = 0, hunted = null, revealed = null;
  const rungs = { locals: 0, players: 0, culprit: 0 };
  for (const s of cycle) {
    worst = Math.max(worst, rungOf(content, s.after));
    // ✅ R7: a `revealed` change after the damage is someone finding out — by investigation, or by the hunt (its cause says which)
    if (s.e?.change === "revealed" && Number(s.e.day) >= Number(damage.day)) { revealed = revealed || { by: s.e.by, day: s.e.day, seen: s.e.seen || "named" }; if (s.e.cause === "hunted" && !hunted) hunted = { by: s.e.by, day: s.e.day }; }
    if (s.e?.change !== "repaired") continue;
    const v = rungPay(s.before, value, content);
    if (s.e.by === "locals") { spent += v; rungs.locals++; }
    else if (culprit && s.e.by === culprit) { workedOff += v; rungs.culprit++; }
    else { spent += v; rungs.players++; }
  }
  // ⛑ the bounty the locals pay a hunter is theirs to recover too: *"a share of the repair value, paid by the locals, so it adds to what the culprit owes"*
  const ladder = ladderOf(content);
  const full = value != null ? repairFraction(content, ladder[worst]) * value : 4 + 6 * worst;
  const bounty = Math.round(Number(content?.mapStates?.jobs?.hunt?.bountyShare ?? 0.25) * full);
  // an `unseen` breaking that someone has since found out is `named` from then on
  const seen = revealed && damage.seen === "unseen" ? (revealed.seen || "named") : (damage.seen || null);
  return { damage, culprit, seen, value, spent: Math.round(spent), workedOff: Math.round(workedOff), rungs, revealed, hunted, bounty };
}
function seededRng(text) {
  let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** ⛔ WHO IS OWED — *"a named local"*: the place's own people first, else one minted from the event (id and name both derived from
 *  it, so every game meets the same person). → `{ id, name, minted, communityId, placeId }` */
export function damagesHolder(key, damage, { content = null, character = null } = {}) {
  const placeId = keyPlaces(key)[0] || null;
  const loc = content?.locations?.[placeId] || null;
  const gone = new Set(["dead", "departed"]);
  const present = (loc?.npcsPresent || []).find((id) => content?.npcs?.[id] && !gone.has(String(character?.npcRegistry?.[id]?.status || "")));
  if (present) return { id: present, name: content.npcs[present].name || present, minted: false, communityId: loc?.communityId || null, placeId };
  const id = personIdFor(`damages|${damage?.id || key}`);
  // ⛑ a local owed for a broken mill is nobody's legend: the plain name (given and family), not a byname — `personName`'s own rule
  const m = mintedName({ pools: content?.rules?.mintedNames || null, originKind: "_default", rng: seededRng(id) });
  const plain = m ? ([m.given, m.surname].filter(Boolean).join(" ").trim() || m.name || null) : null;
  const name = character?.npcRegistry?.[id]?.name || plain || `one of the people of ${loc?.name || "the place"}`;
  return { id, name, minted: true, communityId: loc?.communityId || null, placeId };
}
export function ensureReckonings(character) {
  if (!character) return {};
  if (!character.reckonings || typeof character.reckonings !== "object") character.reckonings = {};
  return character.reckonings;
}
/** ⛔ THE RECKONING PASS — the world tick's, in the culprit's game. For each thing this character broke (named or described) that
 *  the locals have spent on: the `damages` debt to its holder, recomputed; and the search — `asking` once it begins, `sent` when
 *  someone sets out (after `searchBeginsAfterDays[seen]`, at the latest `jobs.hunt.localsSendAfterDays`), `found` when they arrive
 *  (`findWithinDays[seen]` + the walk to where the culprit is). Mutates the save. → `{ news }` */
export function reckoningPass(character, { content = null, worldDay = null } = {}) {
  const news = [];
  if (!character?.id || worldDay == null || !Number.isFinite(Number(worldDay))) return { news };
  const R = content?.mapStates?.reckoning || {}, Jh = content?.mapStates?.jobs?.hunt || {}, W = R.words || {};
  const L = content?.locations || {};
  const RK = ensureReckonings(character);
  const debts = (() => { if (!character.worldState || typeof character.worldState !== "object") character.worldState = {};
    if (!character.worldState.debts || typeof character.worldState.debts !== "object") character.worldState.debts = {}; return character.worldState.debts; })();
  const wd = Number(worldDay);
  for (const key of heldKeys(character)) {
    const s = localsSpentOn(character, key, { content });
    if (!s || s.culprit !== character.id) continue;
    if (!["named", "described"].includes(s.seen)) continue;
    let rk = RK[key];
    if (!rk || rk.damageId !== s.damage.id) rk = RK[key] = { damageId: s.damage.id, since: Math.floor(Number(s.damage.day) || 0), seen: s.seen, state: "owed", paidValue: 0 };
    if (rk.state === "forgiven" || rk.state === "settled") continue;
    const owed = Math.max(0, s.spent + (s.hunted ? s.bounty : 0) - (Number(rk.paidValue) || 0) - s.workedOff);
    const holder = damagesHolder(key, s.damage, { content, character });
    const site = siteOfKey(key, { content, character });
    const t = mapThingOf(key, content, { siteName: site?.name || null, from: holder.placeId }) || { thing: "it", place: "there" };
    const did = (W.did || {})[s.damage.change] || s.damage.change;
    if (owed <= 0) {
      // nothing spent on it yet, or all of it worked off: no debt stands — but a debt that did stand comes off
      if (debts[holder.id]?.mapKey === key) delete debts[holder.id];
      continue;
    }
    if (holder.minted) {
      character.npcRegistry = character.npcRegistry && typeof character.npcRegistry === "object" ? character.npcRegistry : {};
      if (!character.npcRegistry[holder.id]) character.npcRegistry[holder.id] = { id: holder.id, name: holder.name, status: "active",
        locationId: holder.placeId, communityId: holder.communityId, role: `owed for the ${t.thing} at ${t.place}`, mintedFor: "damages" };
    }
    const price = priceHere(owed, L[holder.placeId]?.regionId || null, content?.rules?.economy || null);
    const prev = debts[holder.id]?.mapKey === key ? debts[holder.id] : null;
    debts[holder.id] = { kind: R.debtKind || "damages", amount: price.amount, currency: price.currency, ...(price.currency === "scrip" ? { regionId: price.regionId } : {}),
      valueOwed: owed, reason: `the ${t.thing} at ${t.place}, ${did}`, heldBy: holder.id, communityId: holder.communityId, mapKey: key,
      // ⛔ *"this holder always acts: damages are not a matter of temperament"*
      alwaysActs: true, sinceDay: prev?.sinceDay ?? rk.since, lastMovedDay: prev?.lastMovedDay ?? rk.since, escalation: prev?.escalation || 0,
      history: prev?.history || [{ day: rk.since, note: `owed: damages — the ${t.thing} at ${t.place}` }] };
    const vals = { name: holder.name, place: t.place, did, thing: t.thing };
    if (rk.state === "owed") { rk.state = "asking"; if (W.asking) news.push(fill(W.asking, vals)); }
    const sendAfter = Math.min(Number(R.searchBeginsAfterDays?.[s.seen] ?? 7), Number(Jh.localsSendAfterDays ?? 7));
    if (rk.state === "asking" && wd >= rk.since + sendAfter) {
      const target = character.currentLocationId && L[character.currentLocationId] ? character.currentLocationId : null;
      const walk = target && holder.placeId && L[holder.placeId] ? (target === holder.placeId ? 0 : walkingDays(L[holder.placeId], L[target])) : 0;
      rk.state = "sent"; rk.sentDay = Math.floor(wd); rk.seeker = holder.id; rk.seekerName = holder.name;
      rk.arriveDay = rk.sentDay + Math.ceil((Number(R.findWithinDays?.[s.seen]) || 6) + (Number.isFinite(walk) ? walk : 0));
      if (W.sent) news.push(fill(W.sent, vals));
    }
    if (rk.state === "sent" && wd >= rk.arriveDay) { rk.state = "found"; rk.foundDay = Math.floor(wd); if (W.found) news.push(fill(W.found, vals)); }
    // ✅ R7: a player took the hunt and found them — the holder comes with what the hunter learned, whatever the search had reached
    if (s.hunted && ["owed", "asking", "sent"].includes(rk.state)) { rk.state = "found"; rk.foundDay = Math.floor(wd); rk.huntedBy = s.hunted.by; if (W.found) news.push(fill(W.found, vals)); }
  }
  return { news };
}
/** The GM's reckoning lines: who has come, about what, and the five ways it can go — each through the channel that does it. */
export function reckoningsForGM(character, { content = null } = {}) {
  const RK = character?.reckonings || {}, debts = character?.worldState?.debts || {};
  const out = [];
  for (const d of Object.values(debts)) {
    if (!d?.mapKey || RK[d.mapKey]?.state !== "found") continue;
    const who = character?.npcRegistry?.[d.heldBy]?.name || content?.npcs?.[d.heldBy]?.name || d.heldBy;
    out.push(`⚑ RECKONING — ${who} (${d.heldBy}) has come about ${d.reason}: they want what their people spent on it, ${d.amount} ${d.currency}. `
      + `PLAY IT AS A SCENE; the choice is the character's: pay (debtOps "settle"), work it off (debtOps "work" — they mend it themselves and what that is worth comes off), `
      + `refuse (debtOps "refuse" — word goes round and they are refused there), fight (an ordinary fight; their standing there falls with it), `
      + `or flee (debtOps "flee" — the search starts again from where they went).`);
  }
  return out;
}

/* ═════ PART R · R7: THE HUNT IS A LOCAL JOB TOO ═════
 * ✅ ERIK: *"The hunt for the culprit is a local quest/job."* ✅ `mapStates.jobs._hunt`: *"The locals post it to nearby boards; anyone
 * but the culprit may take it. The bounty is a share of the repair value, paid by the locals, so it adds to what the culprit owes.
 * … Unseen damage posts an investigation instead; finding the culprit turns it into a hunt."*
 * ⛔ A SUCCESS IS A SHARED CHANGE, so it reaches the culprit's game without a channel of its own: the hunter (or the investigator) writes
 * `revealed` on the broken thing, by themselves — `cause` "hunted" or "investigated". Every game folds it; the culprit's reads a hunt
 * as being FOUND (and the bounty as owed), and an investigation turns an `unseen` breaking into a named one, so the reckoning starts. */
export function huntJobsFor(character, { content = null, max = 2 } = {}) {
  const J = jobsOf(content), W = wordsOf(content), L = content?.locations || {};
  const within = Number(J.withinDays ?? 2);
  const anchors = [...new Set([character?.currentLocationId, ...(character?.holdings || []).map((h) => h?.locationId)].filter((id) => id && L[id]))];
  const found = [];
  for (const key of heldKeys(character)) {
    const s = localsSpentOn(character, key, { content });
    if (!s || !s.culprit || s.culprit === character?.id) continue;   // anyone but the culprit
    if (["locals", "the world"].includes(String(s.culprit))) continue;
    if (s.hunted) continue;                                            // already found
    const investigate = s.seen === "unseen";
    if (!investigate && !(s.spent > 0)) continue;                      // nobody has spent anything yet: nothing to recover
    const places = keyPlaces(key).filter((id) => L[id]);
    if (!places.length) continue;
    let near = Infinity;
    for (const a of anchors) for (const b of places) { const d = a === b ? 0 : walkingDays(L[a], L[b]); if (Number.isFinite(d) && d < near) near = d; }
    if (!(near <= within)) continue;
    const where = places.find((id) => anchors.includes(id)) || places[0];
    const site = siteOfKey(key, { content, character });
    const t = mapThingOf(key, content, { siteName: site?.name || null, from: where });
    if (!t) continue;
    const did = (W.did || {})[s.damage.change] || s.damage.change;
    const label = fill(investigate ? (J.labels?.investigate || "Learn who {did} the {thing} at {place}") : (J.labels?.hunt || "Find whoever {did} the {thing} at {place}"), { did, thing: t.thing, place: t.place });
    const level = 6 + 6 * rungOf(content, s.damage.change);
    found.push({ near, spec: {
      id: `hunt:${key}`.slice(0, 80),   // prose-cap-ok: an identifier
      label: smartClamp(label, 120), where, level,
      effort: investigate ? Number(J.hunt?.investigateEffortDays) || 5 : Number(J.hunt?.effortDays?.[s.seen]) || 4,
      needs: (J.needs?.[investigate ? "investigate" : "hunt"] || [{ family: "KNOW", weight: 2 }]).map((n) => ({ family: n.family, weight: n.weight })),
      from: smartClamp(fill(J.from || "the people of {place}", { place: t.place }), 60),
      stakes: { hunt: { key, damageId: s.damage.id, kind: investigate ? "investigate" : "hunt" },
        ...(!investigate && s.bounty > 0 ? { crystal: Math.min(s.bounty, 4 * level) } : {}) },
    } });
  }
  return found.sort((a, b) => a.near - b.near).slice(0, max).map((x) => x.spec);
}
/** Put the hunts on the board beside the mends (their own cap), and take off any whose thing is found or whole. Mutates. */
export function postHuntJobs(character, { content = null, day = null } = {}) {
  const specs = huntJobsFor(character, { content });
  const B = ensureJobs(character).board;
  const want = new Map(specs.map((s) => [s.id, s]));
  for (const j of [...B]) if (String(j?.id || "").startsWith("hunt:") && (!want.has(j.id) || want.get(j.id).stakes.hunt.kind !== j.stakes?.hunt?.kind)) dropJob(character, j.id);
  const posted = [];
  for (const s of specs) { if (ensureJobs(character).board.some((j) => j?.id === s.id)) continue; const r = postJob(character, s, { day }); if (r.ok) posted.push(r.job); }
  return { posted };
}
/** ⛔ A HUNT OR AN INVESTIGATION DONE — the one shared change that carries it to every game. Mutates. → `{ ok, said }` */
export function applyHunt(character, hunt, { content = null, worldDay = null } = {}) {
  if (!character || !hunt?.key) return { ok: false, said: null };
  const s = localsSpentOn(character, hunt.key, { content });
  const site = siteOfKey(hunt.key, { content, character });
  const t = mapThingOf(hunt.key, content, { siteName: site?.name || null }) || { thing: "it", place: "there" };
  if (!s || !s.culprit || ["locals", "the world"].includes(String(s.culprit))) return { ok: false, said: `nobody could say who broke the ${t.thing} at ${t.place} — no one did; it fell` };
  const investigate = hunt.kind === "investigate";
  const r = applyMapChange(character, { key: hunt.key, change: "revealed", by: character.id || "player", seen: "named", cause: investigate ? "investigated" : "hunted" }, { content, worldDay });
  if (!r.ok) return { ok: false, said: `what was learned about the ${t.thing} at ${t.place} could not be told — ${r.why}` };
  return { ok: true, said: investigate ? `whoever broke the ${t.thing} at ${t.place} is known now, and named to its people` : `whoever broke the ${t.thing} at ${t.place} has been found, and its people are told where` };
}
