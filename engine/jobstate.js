// jobstate.js — CCODE-420: WHERE A JOB LIVES ON THE CHARACTER, and who is away on one.
//
// ⚑ A LEAF — ONE IMPORT, ITSELF A LEAF — on purpose. The one question every other system must be able to ask is "is this person out on a
// job?", and the first asker is the fight's ally list (`combatants.js`). If that answer lived beside the dice it would drag the resolver,
// the sheets and the roads into the fight's import graph, and a cycle. So the record and its questions live here; `jobs.js` holds the dice.
// (`smartClamp` comes from `namematch.js`, which imports nothing: posted prose is clamped at a word, never sliced mid-word.)
//
// `character.jobs = { board: [job], out: [entry], back: [entry] }` —
//   board: jobs posted and not yet taken (the GM offers them; the player may post one), newest last, capped;
//   out:   a team sent — the job, who went, the plan's odds as they left, when they are back (absolute clock hours);
//   back:  what came back — the degree, what it brought, the GM's directive, and whether the GM has told it yet. Capped.

import { smartClamp } from "./namematch.js";

export const JOB_FAMILIES = ["HARM", "PROTECT", "RESTORE", "KNOW", "SHAPE", "MOVE", "SUSTAIN", "INFLUENCE"];
// ✅ SNG-657 §1 (ERIK 2026-09-25): "Levels go to 100 — so make sure everything in the game knows that."
// ⚠️ `levelMax` WAS 60, and a job's level is what its crystal, its xp and its harm all scale from — so a
// level-70 character's work was priced as a level-60's, with no error and nothing on the screen to say so.
// ⛑ 100 is the ladder's own top (`legends.DEFAULT_RUNGS`: mythic is 85–100), and `npcsheet` calls it "a door,
// not a ceiling" — past it is the Veil, not a bigger number.
export const JOB_LIMITS = { board: 12, back: 12, needs: 4, items: 3, levelMax: 100 };

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clampInt = (v, lo, hi, d = lo) => Math.max(lo, Math.min(hi, Math.round(num(v, d))));
const text = (v, n) => smartClamp(String(v ?? "").replace(/\s+/g, " ").trim(), n);

/** The character's job record, made if absent. Null without a character. */
export function ensureJobs(character) {
  if (!character) return null;
  const j = character.jobs && typeof character.jobs === "object" && !Array.isArray(character.jobs) ? character.jobs : (character.jobs = {});
  for (const k of ["board", "out", "back"]) if (!Array.isArray(j[k])) j[k] = [];
  return j;
}

/** ⛔ IS THIS PERSON OUT ON A JOB? The entry they are on, or null. `"player"` is the character. Pure. */
export function awayOnJob(character, personId) {
  const id = String(personId ?? "");
  if (!id) return null;
  for (const e of character?.jobs?.out || []) if ((e?.team || []).map(String).includes(id)) return e;
  return null;
}

/** ⛔ CCODE-431 — HOW MANY OF A HOLD'S RAISED HANDS ARE OUT ON JOBS. Sent out, their contingent reads empty, so the capacity the hold feeds
 *  would look free while they are gone and a player could raise its full count again — and be over it when they came home. A head out on a
 *  job still eats that hold's bread. Pure. */
export function detachedFrom(character, holdId) {
  const want = String(holdId ?? "");
  if (!want) return 0;
  let n = 0;
  for (const e of character?.jobs?.out || []) {
    if (!e?.detached || e.detached.returned) continue;
    for (const u of e.detached.units || []) if (!u.named && String(u.c?.from || "") === want) n += Math.max(0, num(u.c?.n, 0));
  }
  return n;
}

/** Everyone out on a job, as a Set of ids. Pure. */
export function jobAwayIds(character) {
  const s = new Set();
  for (const e of character?.jobs?.out || []) for (const id of e?.team || []) s.add(String(id));
  return s;
}

/** ⛔ A JOB AS POSTED — clamped to the scale its level gives it, whoever posts it. The GM prices a job from the fiction; the engine holds
 *  the price inside what a job of that level can honestly pay and cost, so a single offer cannot mint a fortune or ask the impossible.
 *  → { ok: true, job } or { ok: false, why }. Pure. */
export function normalizeJob(spec = {}, { day = null } = {}) {
  const label = text(spec.label, 120);
  if (!label) return { ok: false, why: "a job needs saying what is to be done" };
  const where = text(spec.where, 80);
  if (!where) return { ok: false, why: "a job needs a place to be done at" };
  const level = clampInt(spec.level, 1, JOB_LIMITS.levelMax, 10);
  const needs = (Array.isArray(spec.needs) ? spec.needs : [])
    .map(n => ({ family: String(n?.family || "").toUpperCase(), weight: clampInt(n?.weight, 1, 3, 1), what: text(n?.what, 80) || null }))
    .filter(n => JOB_FAMILIES.includes(n.family))
    .slice(0, JOB_LIMITS.needs);
  if (!needs.length) return { ok: false, why: "a job needs to say what it takes — harm, protect, mend, know, shape, move, sustain or sway" };
  const s = spec.stakes && typeof spec.stakes === "object" ? spec.stakes : {};
  const stakes = {};
  const crystal = clampInt(s.crystal, -3 * level, 4 * level, 0);
  if (crystal) stakes.crystal = crystal;
  const xp = clampInt(s.xp, 0, 3 * level, 0);
  if (xp) stakes.xp = xp;
  const items = (Array.isArray(s.items) ? s.items : []).map(x => text(x, 60)).filter(Boolean).slice(0, JOB_LIMITS.items);
  if (items.length) stakes.items = items;
  const deed = text(s.deed, 120);
  if (deed) stakes.deed = deed;
  const standing = clampInt(s.standing, -2, 2, 0);
  if (standing) stakes.standing = standing;
  const harm = clampInt(s.harm, 0, level, 0);
  if (harm) stakes.harm = harm;
  const recruits = clampInt(s.recruits, 0, 12, 0);
  if (recruits) stakes.recruits = recruits;
  // ⛔ CCODE-452: a raise — the feature, the level it goes to, and the materials set aside for it
  const rs = s.raise && typeof s.raise === "object" ? s.raise : null;
  if (rs && text(rs.holdId, 80) && text(rs.kind, 40)) stakes.raise = { holdId: text(rs.holdId, 80), index: clampInt(rs.index, 0, 99, 0), kind: text(rs.kind, 40), level: clampInt(rs.level, 2, 3, 2),
    goods: Object.fromEntries(Object.entries(rs.goods && typeof rs.goods === "object" ? rs.goods : {}).filter(([g]) => /^[a-z][a-z_]{1,39}$/.test(g)).map(([g, n]) => [g, clampInt(n, 0, 999, 0)]).filter(([, n]) => n > 0)) };
  const job = {
    id: text(spec.id, 80) || `job-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)}-${day ?? "x"}`,
    label, where, level,
    effort: Math.max(0.5, Math.min(200, num(spec.effort, 4))),
    needs, stakes,
    from: text(spec.from, 60) || null,
    postedDay: day,
  };
  return { ok: true, job };
}

/** Post a job to the board. A job already posted under the same id is replaced (the GM re-offering it is the same job). Pure over
 *  `character.jobs`. → { ok, job } or { ok: false, why }. */
export function postJob(character, spec, { day = null } = {}) {
  const r = normalizeJob(spec, { day });
  if (!r.ok) return r;
  const J = ensureJobs(character);
  if (J.out.some(e => e?.job?.id === r.job.id)) return { ok: false, why: "that job is already under way" };
  J.board = J.board.filter(j => j?.id !== r.job.id);
  J.board.push(r.job);
  if (J.board.length > JOB_LIMITS.board) J.board = J.board.slice(-JOB_LIMITS.board);
  return r;
}

/** Take a job off the board without sending anyone. */
export function dropJob(character, jobId) {
  const J = ensureJobs(character);
  const before = J.board.length;
  J.board = J.board.filter(j => j?.id !== jobId);
  return { ok: J.board.length < before };
}

/** ⛔ SEND A TEAM. The job leaves the board; the team is out until `plan.backAtHours`; the odds they left with are kept, because the
 *  roll that decides it is made from THEM when they return — not from whoever is around then. Refuses an empty team, a job not on the
 *  board, and anyone already out. `names` maps id → the name to print. Pure over `character.jobs`. */
export function sendOnJob(character, jobId, team, plan, { nowHours = 0, day = null, names = {} } = {}) {
  const J = ensureJobs(character);
  const job = J.board.find(j => j?.id === jobId);
  if (!job) return { ok: false, why: "that job is not on offer" };
  const ids = [...new Set((team || []).map(String).filter(Boolean))];
  if (!ids.length) return { ok: false, why: "nobody to send" };
  const busy = ids.map(id => ({ id, e: awayOnJob(character, id) })).filter(x => x.e);
  if (busy.length) return { ok: false, why: `${busy.map(x => names[x.id] || x.id).join(" and ")} ${busy.length === 1 ? "is" : "are"} already out on "${busy[0].e.job?.label}"` };
  if (!plan || !plan.dist) return { ok: false, why: "no plan to send them on" };
  const entry = {
    id: `${job.id}@${Math.round(num(nowHours, 0))}`,
    job, team: ids, names: Object.fromEntries(ids.map(id => [id, names[id] || id])),
    leftAtHours: num(nowHours, 0), backAtHours: num(plan.backAtHours, num(nowHours, 0)), leftDay: day,
    dist: plan.dist,
    cover: (plan.cover || []).map(c => (c ? { personId: c.personId, personName: c.personName, craft: { id: c.craft?.id, name: c.craft?.name }, chance: c.craft?.chance ?? null } : null)),
    work: plan.work ? { family: plan.work.family, hours: plan.work.hours, days: plan.work.days } : null,
    there: plan.trip ? plan.trip.there : null,
  };
  J.board = J.board.filter(j => j?.id !== jobId);
  J.out.push(entry);
  return { ok: true, entry };
}

/** The teams whose time is up at `nowHours`, earliest first. Pure. */
export function dueJobs(character, nowHours) {
  return (character?.jobs?.out || []).filter(e => num(e?.backAtHours, Infinity) <= num(nowHours, -Infinity))
    .sort((a, b) => num(a.backAtHours) - num(b.backAtHours));
}

/** A team is home: the entry moves from `out` to `back` with what it brought. Pure over `character.jobs`. */
export function landJob(character, entryId, result = {}) {
  const J = ensureJobs(character);
  const i = J.out.findIndex(e => e?.id === entryId);
  if (i < 0) return null;
  const [entry] = J.out.splice(i, 1);
  const back = { ...entry, ...result, told: false };
  J.back.push(back);
  if (J.back.length > JOB_LIMITS.back) J.back = J.back.slice(-JOB_LIMITS.back);
  return back;
}

/** What came back and the GM has not yet told. Pure. */
export function untoldJobs(character) {
  return (character?.jobs?.back || []).filter(e => e && !e.told);
}

/** ⛔ MARKED TOLD ONLY AFTER THE GM'S CALL RETURNS — a directive queued is not a directive delivered. */
export function markJobsTold(character, ids = []) {
  const want = new Set(ids.map(String));
  let n = 0;
  for (const e of character?.jobs?.back || []) if (e && want.has(String(e.id)) && !e.told) { e.told = true; n++; }
  return n;
}
