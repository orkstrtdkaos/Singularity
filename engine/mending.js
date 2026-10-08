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
import { parseMapKey, mapStateOf, rungOf, ladderOf, localsWillMend, mapThingOf, repairFraction, applyMapChange, localRepairAt } from "./mapstate.js";
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
      needs: (J.needs?.[p.cls === "gate" ? "waygate" : p.cls] || J.needs?.default || [{ family: "RESTORE", weight: 2 }]).map((n) => ({ family: n.family, weight: n.weight })),
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
  const t = mapThingOf(mend.key, content, { siteName: site?.name || null }) || { thing: "it", place: "there" };
  const r = applyMapChange(character, { key: mend.key, change: "repaired", by: character.id || "player",
    cause: mend.culprit ? "making good what they did" : "hands sent to mend it" }, { content, worldDay });
  if (!r.ok) return { ok: false, said: `the ${t.thing} at ${t.place} was past this mending by the time they got there — ${r.why}` };
  character.mendWork = character.mendWork && typeof character.mendWork === "object" ? character.mendWork : {};
  const w = character.mendWork[mend.key] || { rungs: 0, culprit: !!mend.culprit };
  w.rungs += 1; w.lastDay = Math.floor(Number(worldDay) || 0);
  character.mendWork[mend.key] = w;
  const whole = rungOf(content, r.state) === 0;
  const W = wordsOf(content);
  const said = whole && W.mended ? fill(W.mended, { thing: t.thing, place: t.place }) : `the ${t.thing} at ${t.place} is ${r.state} now, no longer ${before}`;
  return { ok: true, state: r.state, whole, said };
}
