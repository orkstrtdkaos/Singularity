// jobs.js — CCODE-420: JOBS. A job is sent, takes time, and is decided by the dice the people sent would roll.
//
// Erik (2026-09-18): "Each task needs to come in with a level reference and a difficulty of some sort, derived from what it takes to
// accomplish... move, sense, harm... shape... feed into a roll to determine the outcome of the task for the GM to narrate. the outcome
// should have concrete effects - this much crystal, this many hp lost, this many losses, these items gained, xp, deeds, recruits, etc."
// And: "we should have the ability to select people instead of only taking the best. Plus giving someone a job or task needs to take
// time for them to complete... We need to be very sensitive to and credit the crafts people have when figuring out the jobs."
//
// ⛔ ONE ROLL, THE FIGHT'S. A need is covered by whoever on the team is best at it, with their best craft of that family, at the job's
// opposition — and the chance is `successChance` with the opposition passed as a NUMERIC difficulty, the door a fight's own opposition
// uses (SNG-346), so the odds a job shows ARE the dice. The crit dials are `critProfile`'s; the five outcomes are `outcomeOdds`'. Nothing
// here re-derives a probability the resolver already owns.
// ⛔ ONE SCALE. A level-L job opposes you as a level-L person does in a fight: `personThreatForLevel` × the duel's threatToDifficulty.
// ⚠️ PURE BY INJECTION, EXCEPT AT ONE DOOR. The sheets (`sheetOf`), the roads (`routeBetween` over the locations handed in) and the random
// draw (`rng`) come from the caller, and everything up to the roll is pure. Only `applyJobEffects` / `settleDueJobs` write — and they write
// through the game's own doors (purse, inventory, deeds, level-ups, bands). The app and the tests call the same functions.
//
// ⚑ THE KNOBS ARE `JOB_DEFAULTS`, overridable by `rules.jobs` — every one a question for Erik, as the prototype said on its face.

import { successChance, critProfile, outcomeOdds } from "./resolve.js";
import { familyOfVerb } from "./functions.js";
import { battleSkillsForCharacter, personOpponentFor, personThreatForLevel } from "./battle_turn.js";
import { personRecordFor } from "./npcsheet.js";
import { levelOfPerson, poolRows, atSideRows, wherePerson } from "./fellowship.js";
import { activeCompany } from "./company.js";
import { routeBetween } from "./journey.js";
import { journeyCraftsOf } from "./journeyplan.js";
import { abilityTier } from "./skilltree.js";
import { credit, debit } from "./purse.js";
import { addItem } from "./inventory.js";
import { recordDeed } from "./reputation.js";
import { applyLevelUps } from "./progression.js";
import { addContingent } from "./melee.js";
import { ensureJobs, dueJobs, landJob } from "./jobstate.js";
import { smartClamp } from "./namematch.js";
import { MISSION_KINDS } from "./assignments.js";   // ⛔ CCODE-428: an errand's kind names the family it wants
import { familiesFromEvidence } from "./combatants.js"; // …and a standing charge's own words name its family

/** The five ways a roll lands, in the resolver's own words, best first. */
export const OUTCOMES = ["crit_success", "success", "partial", "failure", "crit_failure"];

export const JOB_DEFAULTS = {
  // how a job's needs combine: each need's outcome scores this much, weighted by the need; the weighted mean lands on a degree
  score: { crit_success: 2, success: 1, partial: 0.5, failure: 0, crit_failure: -1 },
  grade: [[1.5, "crit_success"], [0.85, "success"], [0.4, "partial"], [0, "failure"]],          // below the last → crit_failure
  // what an outcome is worth to whoever acts — how the best craft for a need, and a suggested team, are weighed
  worth: { crit_success: 100, success: 75, partial: 40, failure: 0, crit_failure: -40 },
  // per degree: what the stakes pay (gain ×), what they cost (harm × to each who went; losses × among hands), a deed or not, standing ±
  effect: {
    crit_success: { gain: 1.5, harm: 0, losses: 0, deed: true, standing: 1 },
    success: { gain: 1, harm: 0.25, losses: 0, deed: true, standing: 0 },
    partial: { gain: 0.5, harm: 0.5, losses: 0, deed: false, standing: 0 },
    failure: { gain: 0, harm: 1, losses: 0.5, deed: false, standing: 0 },
    crit_failure: { gain: -0.5, harm: 2, losses: 1, deed: false, standing: -1 },
  },
  // ⛔ WORK, crediting the crafts: a job's `effort` is hand-days — what one willing pair of hands with no craft for it would take. Each
  // tier of craft in the job's MAIN need works `tierRate` times the tier below it; its rank ×1 / ×1.5 / ×2. A hand-day is 8 hours of work.
  tierRate: 3, rankRate: [1, 1.5, 2], hoursPerHandDay: 8,
  // a need nobody on the team can do at all is rolled as a near-certain failure — never skipped, or a one-craft team could not fail
  uncovered: { crit_success: 0, success: 0, partial: 0, failure: 0.95, crit_failure: 0.05 },
  // someone whose way to the place cannot be measured is this many days out — an unknown road is never a short one
  unmeasuredDays: 20,
  // how a suggested team is weighed: its odds, its members' level and loyalty, and the days out
  suggest: { odds: 1, level: 0.3, loyalty: 1.5, distance: 1 },
};

/** The job dials: the defaults, with `rules.jobs` over them (nested tables merged by key). Pure. */
export function jobRules(rules = {}) {
  const r = rules && typeof rules.jobs === "object" && rules.jobs ? rules.jobs : null;
  if (!r) return JOB_DEFAULTS;
  return { ...JOB_DEFAULTS, ...r,
    score: { ...JOB_DEFAULTS.score, ...(r.score || {}) }, worth: { ...JOB_DEFAULTS.worth, ...(r.worth || {}) },
    effect: { ...JOB_DEFAULTS.effect, ...(r.effect || {}) }, suggest: { ...JOB_DEFAULTS.suggest, ...(r.suggest || {}) },
    uncovered: { ...JOB_DEFAULTS.uncovered, ...(r.uncovered || {}) } };
}

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** ⛔ A level-L job opposes you as a level-L person does in a fight — their threat, through the duel's own threatToDifficulty. Pure. */
export function jobOpposition(level, rules = {}) {
  return Math.round(personThreatForLevel(level) * num(rules?.encounters?.duel?.threatToDifficulty ?? 0.3, 0.3));
}

/** ⛔ A CRAFT'S DICE AT A JOB — `successChance` with the job's opposition as a numeric difficulty (the door a fight uses), then the crit
 *  dials and the five outcomes, exactly as `resolveAction` would grade that roll. `sheet` is the body (attributes, subAttributes);
 *  `skill` is a battle skill (attribute, subAttribute, rank). Pure. */
export function craftOdds(sheet, skill, { rules = {}, opposed = 0, location = null, source = "the job" } = {}) {
  const character = { attributes: sheet?.attributes || {}, subAttributes: sheet?.subAttributes || {}, energy: 100 };
  const action = { attribute: skill?.attribute || "practical", subAttribute: skill?.subAttribute || null,
    abilityLevel: Math.max(1, num(skill?.rank ?? skill?.level, 1)), difficulty: Math.max(0, num(opposed, 0)), difficultySource: source,
    label: skill?.name || skill?.id || "a craft" };
  const ctx = { character, action, location, rules, aptitudeMods: {} };
  const chance = successChance(ctx);
  const crit = critProfile({ rules, action, character, aptitudeMods: {} });
  const odds = outcomeOdds({ chance, critSuccess: crit.successChance, critFail: crit.failChance, partialBand: num(rules?.d100?.partialBand, 15) });
  return { chance, odds };
}

/** A person's crafts as a job sees them — each battle skill's family and its dice at this opposition. Pure. */
export function jobCraftsOf(person, { fnIndex = null, rules = {}, opposed = 0, location = null } = {}) {
  const out = [];
  for (const s of person?.skills || []) {
    if (!s || s.id === "_strike") continue;
    const family = familyOfVerb(s.function, fnIndex);
    if (!family) continue;
    const { chance, odds } = craftOdds(person.sheet || person, s, { rules, opposed, location });
    out.push({ id: s.id, name: s.name || s.id, verb: s.function, family, rank: Math.max(1, num(s.rank ?? s.level, 1)), tier: Math.max(1, num(s.tier, 1)), chance, odds });
  }
  return out;
}

/** What a set of outcome odds is worth, by `worth`. Pure. */
export function oddsWorth(odds, rules = {}) {
  const W = jobRules(rules).worth;
  return OUTCOMES.reduce((a, k) => a + num(odds?.[k], 0) * num(W[k], 0), 0);
}

/** The best craft a person has for a family — the one whose outcomes are worth the most. Null when they have none of that family. Pure. */
export function bestCraftFor(crafts, family, rules = {}) {
  let best = null;
  for (const c of crafts || []) {
    if (c.family !== family) continue;
    const w = oddsWorth(c.odds, rules);
    if (!best || w > best.w) best = { ...c, w };
  }
  return best;
}

/** ⛔ WHO COVERS EACH NEED: per need, the member whose best craft for that family is worth the most — `null` when nobody can. `crafts`
 *  is a Map of person id → `jobCraftsOf`. Pure. */
export function coverOf(job, team, crafts, rules = {}) {
  return (job?.needs || []).map(need => {
    let best = null;
    for (const p of team || []) {
      const c = bestCraftFor(crafts.get(p.id) || [], need.family, rules);
      if (c && (!best || c.w > best.craft.w)) best = { need, personId: p.id, personName: p.short || p.name || p.id, craft: c, odds: c.odds };
    }
    return best;
  });
}

/** The degree a combined score lands on. Pure. */
export function gradeOf(score, rules = {}) {
  for (const [t, k] of jobRules(rules).grade) if (score >= t) return k;
  return "crit_failure";
}

/** ⛔ THE JOB'S FIVE OUTCOMES, EXACTLY: every need's outcome combined by weight into one score, graded — enumerated over every
 *  combination, never sampled, so the bar a player is shown is the job's true odds. Pure. */
export function jobDistribution(job, cover, rules = {}) {
  const R = jobRules(rules);
  const needs = job?.needs || [];
  const ws = needs.map(n => Math.max(0, num(n.weight, 1)));
  const wsum = ws.reduce((a, b) => a + b, 0) || 1;
  const dist = Object.fromEntries(OUTCOMES.map(k => [k, 0]));
  const walk = (i, prob, score) => {
    if (i === needs.length) { dist[gradeOf(score / wsum, R)] += prob; return; }
    const o = cover?.[i]?.odds || R.uncovered;
    for (const k of OUTCOMES) {
      const p = num(o[k], 0);
      if (p > 0) walk(i + 1, prob * p, score + ws[i] * num(R.score[k], 0));
    }
  };
  walk(0, 1, 0);
  return dist;
}

/** The family a job most needs — its heaviest need. Pure. */
export function mainNeedOf(job) {
  const needs = (job?.needs || []).slice().sort((a, b) => num(b.weight, 1) - num(a.weight, 1));
  return needs[0]?.family || null;
}

/** ⛔ WORK, CREDITING THE CRAFTS. The job's effort in hand-days, shared by the team at the rate each person's best craft in the MAIN need
 *  gives: `tierRate` per tier, ×rank. Erik: "If Silas went to build something, he could use the raised thing and all his building skills to
 *  do it in an hour." → { family, rates: [{ id, rate, by }], workDays, hours, days } — `days` is calendar time: working days when there is a
 *  day or more of it, else the hours as a share of a day. Pure. */
export function workOf(job, team, crafts, rules = {}) {
  const R = jobRules(rules);
  const family = mainNeedOf(job);
  const rates = (team || []).map(p => {
    const best = (crafts.get(p.id) || []).filter(c => c.family === family).sort((a, b) => b.tier - a.tier || b.rank - a.rank)[0] || null;
    const rankRate = R.rankRate[Math.min(R.rankRate.length - 1, Math.max(0, (best?.rank || 1) - 1))] || 1;
    return { id: p.id, rate: best ? Math.pow(num(R.tierRate, 3), best.tier) * rankRate : 1,
      by: best ? { id: best.id, name: best.name, tier: best.tier, rank: best.rank } : null };
  });
  const workDays = Math.max(0, num(job?.effort, 1)) / Math.max(1, rates.reduce((a, r) => a + r.rate, 0));
  const hours = workDays * num(R.hoursPerHandDay, 8);
  return { family, rates, workDays, hours, days: workDays >= 1 ? workDays : hours / 24 };
}

/** ⛔ THE ROAD: each member's own way to the place (`routeOf(person, whereId)` → `{ days, label }`, or null when it cannot be measured);
 *  the team sets out at the pace of the farthest, and comes back the same way. Pure. */
export function tripOf(job, team, { routeOf = null, rules = {} } = {}) {
  const R = jobRules(rules);
  const legs = (team || []).map(p => {
    const r = typeof routeOf === "function" ? routeOf(p, job?.where) : null;
    const days = r && Number.isFinite(Number(r.days)) ? Math.max(0, Number(r.days)) : null;
    return { id: p.id, days, way: r?.label || null };
  });
  const there = legs.length ? Math.max(0, ...legs.map(l => (l.days == null ? num(R.unmeasuredDays, 20) : l.days))) : 0;
  return { there, back: there, legs };
}

/** ⛔ THE WHOLE PLAN for a team on a job: who covers what, the job's true odds, the work, the road, and when they are back. `nowHours`
 *  is the clock in absolute hours; `backAtHours` is when the team is home. Pure. */
export function planJob(job, team, { rules = {}, fnIndex = null, routeOf = null, location = null, nowHours = 0 } = {}) {
  const opposed = jobOpposition(job?.level, rules);
  const crafts = new Map((team || []).map(p => [p.id, jobCraftsOf(p, { fnIndex, rules, opposed, location })]));
  const cover = coverOf(job, team, crafts, rules);
  const dist = jobDistribution(job, cover, rules);
  const work = workOf(job, team, crafts, rules);
  const trip = tripOf(job, team, { routeOf, rules });
  const days = trip.there + work.days + trip.back;
  // ⚠️ THE CLOCK KEEPS WHOLE HOURS (`advanceClock` floors the hour), so a return is rounded UP to the next whole hour — at least one. A
  // job due at a fraction of an hour was due at a time the clock can never read, and a sub-hour job never came home.
  return { jobId: job?.id || null, opposed, cover, dist, work, trip, days, backAtHours: num(nowHours, 0) + Math.max(1, Math.ceil(days * 24 - 1e-9)) };
}

/** ⛔ A SUGGESTION, NEVER A DECISION — Erik: "select people instead of only taking the best". Greedy over the free pool: each step adds
 *  whoever raises the team's worth most (its odds, its level and loyalty, less its days out). The player's own pick overrides it. Pure. */
export function suggestTeam(job, pool, k, ctx = {}) {
  const R = jobRules(ctx.rules);
  const W = R.suggest;
  const scoreOf = (team) => {
    const plan = planJob(job, team, ctx);
    const mean = (f) => team.reduce((a, p) => a + num(f(p), 0), 0) / Math.max(1, team.length);
    return { plan, team, total: W.odds * oddsWorth(plan.dist, ctx.rules) + W.level * mean(p => p.level) + W.loyalty * mean(p => p.loyalty)
      - W.distance * plan.trip.there };
  };
  let team = [];
  for (let i = 0; i < Math.max(0, num(k, 1)); i++) {
    let best = null;
    for (const p of pool || []) {
      if (team.includes(p)) continue;
      const s = scoreOf([...team, p]);
      if (!best || s.total > best.total) best = s;
    }
    if (!best) break;
    team = best.team;
  }
  return team.length ? scoreOf(team) : null;
}

/** Roll one of the five outcomes from a job's odds. `rng` → [0, 1). An outcome with no chance is never drawn. Pure. */
export function rollJob(dist, rng = Math.random) {
  let x = num(rng(), 0);
  let last = "failure";
  for (const k of OUTCOMES) {
    const p = num(dist?.[k], 0);
    if (p <= 0) continue;
    last = k;
    x -= p;
    if (x < 0) return k;
  }
  return last;
}

/** ⛔ WHAT A JOB COSTS TO SEND — a negative crystal stake is its materials and wages, paid when the team sets out, whatever comes of it.
 *  Pure. */
export function jobCost(job) {
  const c = num(job?.stakes?.crystal, 0);
  return c < 0 ? -Math.round(c) : 0;
}

/** ⛔ WHAT THE OUTCOME PAYS, in the concrete terms Erik named — crystal, xp, recruits, items, a deed, standing, a hold's step, hp and
 *  losses — each the job's stake scaled by the degree. A job's COST (`jobCost`) was paid when it left; the only crystal a costed job
 *  moves on its return is a disaster's overrun, half the cost again. Returns numbers only; `applyJobEffects` applies them. Pure. */
export function jobEffects(job, degree, rules = {}) {
  const R = jobRules(rules);
  const e = R.effect[degree] || R.effect.failure;
  const s = job?.stakes || {};
  const out = { degree, crystal: 0, xp: 0, recruits: 0, items: [], deed: null, standing: 0, hold: null, harmEach: 0, losses: 0 };
  // ⚠️ an overrun rounds AWAY from zero — `Math.round(-7.5)` is −7, which would quietly shave the half a cost is owed
  if (num(s.crystal, 0)) out.crystal = s.crystal < 0 ? (degree === "crit_failure" ? -Math.round(-s.crystal * 0.5) : 0) : Math.round(s.crystal * e.gain);
  if (num(s.xp, 0) > 0) out.xp = Math.round(s.xp * Math.max(e.gain, degree === "failure" ? 0.25 : 0));
  if (num(s.recruits, 0) > 0) out.recruits = Math.max(0, Math.round(s.recruits * e.gain));
  if (Array.isArray(s.items) && e.gain >= 1) out.items = s.items.slice();
  if (s.hold && e.gain >= 1) out.hold = s.hold;
  if (s.deed && e.deed) out.deed = s.deed;
  out.standing = (num(s.standing, 0) ? Math.round(s.standing * Math.max(0, e.gain)) : 0) + num(e.standing, 0);
  if (num(s.harm, 0) > 0 && e.harm) out.harmEach = Math.round(s.harm * e.harm);
  if (num(s.losses, 0) > 0 && e.losses) out.losses = Math.max(1, Math.round(s.losses * e.losses));
  return out;
}

const DEGREE_WORD = { crit_success: "a strong success", success: "a success", partial: "a partial success", failure: "a failure", crit_failure: "a critical failure" };
export const degreeWord = (k) => DEGREE_WORD[k] || String(k || "");

/** The effects as the lines a player and the GM read. Pure. */
export function sayEffects(fx, team = []) {
  const out = [];
  if (fx.crystal) out.push(`${fx.crystal > 0 ? "+" : "−"}${Math.abs(fx.crystal)} crystal${fx.crystal < 0 ? " (an overrun)" : ""}`);
  // xp is the character's only when they go; the people who went grow from a job done well instead (`applyJobEffects`)
  const youGo = !team.length || team.some(p => p.isYou);
  if (fx.xp && youGo) out.push(`+${fx.xp} xp`);
  if ((fx.degree === "success" || fx.degree === "crit_success") && team.some(p => !p.isYou)) out.push(`growth for ${team.filter(p => !p.isYou).map(p => p.short || p.name).join(" and ")}`);
  if (fx.recruits) out.push(`+${fx.recruits} recruit${fx.recruits === 1 ? "" : "s"}`);
  if (fx.items?.length) out.push(fx.items.join(", "));
  if (fx.hold) out.push(fx.hold);
  if (fx.deed) out.push(`deed: ${fx.deed}`);
  if (fx.standing) out.push(`standing ${fx.standing > 0 ? "+" : "−"}${Math.abs(fx.standing)}`);
  if (fx.harmEach) out.push(`−${fx.harmEach} health each (${team.map(p => (p.isYou ? "you" : p.short || p.name)).join(", ") || "whoever went"})`);
  if (fx.losses) out.push(`${fx.losses} lost`);
  return out.length ? out : ["nothing gained, nothing lost"];
}

/** ⛔ THE GM TELLS IT, AND DOES NOT DECIDE IT. The directive for the beat after a job comes back: the outcome and what it brought are
 *  already applied; who did what is named by craft; the GM gives it a shape. Pure. */
export function jobDirective(job, degree, fx, cover, team = [], { whereName = null } = {}) {
  const who = team.map(p => (p.isYou ? "you" : p.short || p.name)).join(", ") || "nobody";
  const did = (job?.needs || []).map((n, i) => {
    const c = cover?.[i];
    return c ? `${c.personName} with ${c.craft.name} on ${n.what || n.family}` : `nobody on ${n.what || n.family}`;
  });
  return `THE JOB CAME BACK — ${job?.label || "a job"} (${who}${whereName ? `, at ${whereName}` : ""}): ${degreeWord(degree).toUpperCase()}.\n`
    + `What it brought, already applied: ${sayEffects(fx, team).join("; ")}.\n`
    + `Who did what: ${did.join("; ")}.\n`
    + `Tell how it went when they report back — the result is decided; give it a shape, and do not change what it brought.`;
}

// ── THE PEOPLE A JOB CAN SEND, built from the same records a fight uses ───────────────────────────────────────────────────────────────

/** ⛔ ONE PERSON AS A JOB SEES THEM — their sheet and crafts from the records a fight reads (the player's own abilities through
 *  `battleSkillsForCharacter`; anyone else's through `personOpponentFor`, the sheet the champion read uses), their level from
 *  `levelOfPerson`, where they stand, their wayfaring wits and the crafts that carry a road. Null when they have nothing to act with.
 *  `ctx`: { content, abilityCatalog, day, worldDay, sheetOf? } — `sheetOf(rec)` defaults to `personOpponentFor` with the content's own
 *  dials. ⚠️ `abilityCatalog` is the CRAFTS; the item catalog is a different bag and never passes through here. */
export function jobPersonFor(character, id, ctx = {}) {
  const { content = {}, abilityCatalog = content.abilities || {}, day = null, worldDay = null } = ctx;
  const rules = content.rules || {};
  if (!character || !id) return null;
  if (String(id) === "player") {
    const skills = battleSkillsForCharacter(character, { catalog: abilityCatalog, rules }).map(s => ({ ...s, rank: s.rank ?? 1, tier: s.tier || abilityTier(abilityCatalog[s.id] || {}) }));
    return { id: "player", name: character.name || "you", short: "you", isYou: true, level: num(character.level, 1),
      sheet: { attributes: character.attributes || {}, subAttributes: character.subAttributes || {} }, skills,
      wits: num(character.subAttributes?.wits, 2), regionsKnown: character.regionsKnown || {},
      abilities: (character.abilities || []).filter(a => a?.abilityId), loyalty: 10, locationId: character.currentLocationId || null };
  }
  const reg = character.npcRegistry?.[id] || null;
  const authored = content.npcs?.[id] || null;
  const comp = content.companions?.[id] || null;
  const rec = reg ? personRecordFor({ ...reg, id }, { npcs: content.npcs || {} }) : authored ? { ...authored, id } : comp ? { ...comp, id } : null;
  if (!rec) return null;
  const sheetOf = typeof ctx.sheetOf === "function" ? ctx.sheetOf
    : (r) => personOpponentFor(r, { catalog: abilityCatalog, cfg: rules.npcStanding || {}, day: worldDay ?? day, traditionIndex: content.traditionIndex || null,
      items: content.items || null, leveling: rules.leveling || null });
  let sheet = null;
  try { sheet = sheetOf(rec); } catch { sheet = null; }
  const skills = (sheet?.skills || []).filter(s => s && s.id !== "_strike");
  if (!skills.length) return null;
  const bond = Number(character.companionBonds?.[id]);
  const name = rec.name || id;
  return { id: String(id), name, short: String(name).split(" (")[0].split(",")[0], isYou: false,
    level: levelOfPerson(character, id, { content, worldDay }) || num(sheet?.level, 1),
    sheet: { attributes: sheet.attributes || {}, subAttributes: sheet.subAttributes || {} }, skills,
    wits: num(sheet.subAttributes?.wits, 2), regionsKnown: {},
    abilities: skills.map(s => ({ abilityId: s.id, level: Math.max(1, num(s.rank, 1)) })).filter((a, i, all) => all.findIndex(b => b.abilityId === a.abilityId) === i),
    loyalty: Number.isFinite(bond) ? bond : num(reg?.relationship, 0), locationId: null };
}

/** ⛔ EVERYONE A JOB CAN SEND: you; the people at your side (companions and company); and everyone standing in your bands, each where
 *  the roster says they are (`wherePerson`) — the same rows the Bands tab prints. Deduplicated; the ones with nothing to act with are
 *  left out rather than faked. `ctx` as `jobPersonFor`, plus `locations`. Pure. */
export function jobPoolOf(character, ctx = {}) {
  const { content = {}, worldDay = null, locations = content.locations || {} } = ctx;
  const here = character?.currentLocationId || null;
  const out = [];
  const seen = new Set();
  const add = (id, locationId, from) => {
    const key = String(id);
    if (seen.has(key)) return;
    seen.add(key);
    const p = jobPersonFor(character, key, ctx);
    if (p) out.push({ ...p, locationId: key === "player" ? here : locationId, from });
  };
  add("player", here, "you");
  for (const c of character?.companions || []) add(c?.id || c, here, "at your side");
  for (const m of activeCompany(character)) add(m.npcId || m.id, here, "at your side");
  const opts = { content, worldDay };
  for (const r of atSideRows(character, opts)) if (r.id) add(r.id, here, "at your side");
  for (const r of poolRows(character, opts)) {
    if (!r.id) continue;
    // a keeper stands at the hold they keep — that is where a job would send them FROM
    const kept = (character?.holdings || []).find(h => h && String(h.steward) === String(r.id) && h.locationId);
    if (kept) { add(r.id, kept.locationId, `keeping ${kept.name || "a hold"}`); continue; }
    const w = wherePerson(r, { locations, generated: character?.generated?.location || {}, holdings: character?.holdings || [], hereId: here, worldDay });
    add(r.id, w.locationId || null, w.line);
  }
  return out;
}

// ── WHAT THE GM IS TOLD ──────────────────────────────────────────────────────────────────────────────────────────────────────────────

/** ⛔ THE GM'S JOBS BLOCK: what came back and has not been told (the directives, first — decided, applied, to be given a shape); who
 *  is OUT and therefore cannot walk into a scene; and what is offered and not yet taken, which the GM must never resolve itself. Null
 *  when there is nothing to say. Pure. */
export function jobsForGM(character, { content = {} } = {}) {
  const J = character?.jobs;
  if (!J) return null;
  const place = (id) => content.locations?.[id]?.name || character?.generated?.location?.[id]?.name || id;
  const who = (e) => (e.team || []).map(id => (id === "player" ? "the character" : e.names?.[id] || id)).join(", ");
  const out = [];
  for (const e of (J.back || []).filter(x => x && !x.told)) out.push(e.directive || `THE JOB CAME BACK — ${e.job?.label}: ${degreeWord(e.degree)}.`);
  const away = (J.out || []).filter(Boolean);
  if (away.length) out.push(`OUT ON JOBS — these people are away and must not appear in a scene until they are back: `
    + away.map(e => `${who(e)} on "${e.job?.label}" at ${place(e.job?.where)}, back on day ${Math.floor(num(e.backAtHours, 0) / 24)}`).join("; ") + ".");
  const board = (J.board || []).filter(Boolean);
  if (board.length) out.push(`OFFERED, NOT YET TAKEN — the player chooses who to send from the Jobs tab, and the dice decide it when they are back; never resolve one yourself: `
    + board.map(j => `"${j.label}" (level ${j.level}, at ${place(j.where)}${j.from ? `, for ${j.from}` : ""})`).join("; ") + ".");
  return out.length ? out.join("\n") : null;
}

// ── APPLYING WHAT CAME BACK, through the game's own doors ─────────────────────────────────────────────────────────────────────────────

/** ⛔ WHAT A JOB BROUGHT, APPLIED — every effect through the door the rest of the game uses for it: crystal through the purse (`credit`,
 *  origin "reward"; an overrun through `debit`), xp to the character WHEN THEY WENT and level-ups through `applyLevelUps`, a completion to
 *  each person who went when it went well (their growth, as `derivedLevel` reads it), items through `addItem`, the deed and the standing
 *  as ONE deed at the job's place (a community's standing IS the deeds it knows — nothing here reads it), health off the character when they went,
 *  and recruits into the first band as hands (`addContingent`). ⚠️ A person's own health is not tracked off-screen, so their hurt is
 *  written on their record rather than invented as a number. Returns the lines applied. Mutates `character`. */
export function applyJobEffects(character, entry, fx, { content = {}, itemCatalog = content.items || {}, day = null } = {}) {
  const lines = [];
  if (!character || !entry || !fx) return lines;
  const rules = content.rules || {};
  const team = (entry.team || []).map(String);
  const went = team.includes("player");
  const place = content.locations?.[entry.job?.where] || null;
  if (fx.crystal > 0) { if (credit(character, "crystal", fx.crystal, { origin: "reward" }).ok) lines.push(`+${fx.crystal} crystal`); }
  else if (fx.crystal < 0) {
    const r = debit(character, "crystal", -fx.crystal);
    lines.push(r.ok ? `−${-fx.crystal} crystal (an overrun)` : `an overrun of ${-fx.crystal} crystal nobody could pay`);
  }
  if (fx.xp > 0 && went) {
    character.xp = num(character.xp, 0) + fx.xp;
    lines.push(`+${fx.xp} xp`);
    for (const m of applyLevelUps(character, rules) || []) lines.push(String(m));
  }
  const good = fx.degree === "success" || fx.degree === "crit_success";
  const grew = [];
  for (const id of team) {
    if (id === "player") continue;
    const rec = character.npcRegistry?.[id];
    if (!rec) continue;
    if (good) { rec.completions = num(rec.completions, 0) + 1; grew.push(entry.names?.[id] || rec.name || id); }
    if (fx.harmEach > 0) rec.statusNote = smartClamp(`back from "${entry.job?.label}" hurt${fx.degree === "crit_failure" ? " badly" : ""} (−${fx.harmEach})`, 240);
  }
  // ⚠️ `addItem` hands the item back even when a full pack (30) did not take it — so what is said is what the pack now holds
  if (grew.length) lines.push(`${grew.join(" and ")} grow${grew.length === 1 ? "s" : ""} from it`);
  for (const it of fx.items || []) {
    if (!Array.isArray(character.inventory)) character.inventory = [];
    const r = addItem(character, it, itemCatalog);
    lines.push(character.inventory.includes(r) ? `${it} to your pack` : `${it} — no room in your pack, left behind`);
  }
  const weight = Math.max(-3, Math.min(3, (fx.deed ? 1 : 0) + num(fx.standing, 0)));
  if (weight) {
    const names = team.map(id => (id === "player" ? character.name : entry.names?.[id] || id));
    recordDeed(character, { description: fx.deed || `${entry.job?.label} — ${degreeWord(fx.degree)}`, locationId: entry.job?.where || null,
      communityId: place?.communityId || null, weight, tags: ["job", ...(went ? [] : ["sent"])] });
    lines.push(fx.deed ? `deed: ${fx.deed}` : `standing ${weight > 0 ? "+" : "−"}${Math.abs(weight)} at ${place?.name || "the place"}`);
  }
  if (fx.harmEach > 0 && went) {
    const was = num(character.health, 0);
    character.health = Math.max(0, was - fx.harmEach);
    lines.push(`−${was - character.health} health`);
  }
  if (fx.recruits > 0) {
    const band = (character.bands || []).find(b => b && !(Array.isArray(b.formedFrom) && b.formedFrom.length));
    const r = band ? addContingent(band, { n: fx.recruits, quality: 1, does: ["HARM", "MARTIAL"], what: `raised by "${entry.job?.label}"`, from: "job" }) : null;
    lines.push(r?.ok ? `+${fx.recruits} hands in ${band.name}` : `${fx.recruits} would have joined, but you have no band to take them`);
  }
  return lines;
}

/** ⛔ EVERY TEAM WHOSE TIME IS UP, SETTLED: the roll made from the odds they left with, what it brought applied through the doors, the
 *  GM's directive written, and the entry moved to `back` untold. Returns the settled entries. Mutates `character`. */
export function settleDueJobs(character, { nowHours = 0, rng = Math.random, content = {}, itemCatalog = content.items || {}, day = null } = {}) {
  const settled = [];
  ensureJobs(character);
  for (const e of dueJobs(character, nowHours)) {
    const degree = rollJob(e.dist, rng);
    const fx = jobEffects(e.job, degree, content.rules || {});
    const applied = applyJobEffects(character, e, fx, { content, itemCatalog, day });
    const team = (e.team || []).map(id => ({ id, isYou: id === "player", short: id === "player" ? "you" : (e.names?.[id] || id) }));
    const cover = (e.cover || []).map(c => (c ? { personName: c.personId === "player" ? "you" : c.personName, craft: c.craft } : null));
    const directive = jobDirective(e.job, degree, fx, cover, team, { whereName: content.locations?.[e.job?.where]?.name || null });
    const back = landJob(character, e.id, { degree, fx, applied, directive, backDay: day });
    if (back) settled.push(back);
  }
  return settled;
}

// ── ERRANDS, BY THE SAME ROLL (CCODE-428) ───────────────────────────────────────────────────────────────────────────────────

/** ⛔ CCODE-428 — THE ERRAND DIALS, beside the job's, and overridable the same way (`rules.jobs.errand`). `level` is what a delegated
 *  charge opposes you at on the job scale (a village chore 5, a dangerous hunt 20); a charge set against a crisis opposes at `perStage` more
 *  for each stage the crisis has reached. `steps` is how many steps of headway finish a MISSION — ⚠️ a charge with no kind (a watch kept, the
 *  accounts run, a post rebuilt) has none, because the dice cannot know when a standing duty is over; the fiction ends those. `maxRolls`
 *  caps the rolls one tick makes for a long absence, and `outcome` is what each of the five degrees does to the charge. */
export const ERRAND_DEFAULTS = {
  level: 10, perStage: 5, maxRolls: 10,
  steps: { word: 1, escort: 2, trade: 2, treat: 2, watch: 3, seek: 3, work: 3 },
  outcome: { crit_success: "progress", success: "progress", partial: "progress", failure: "stall", crit_failure: "problem" },
};
function errandRules(rules = {}) {
  const e = rules?.jobs?.errand;
  if (!e || typeof e !== "object") return ERRAND_DEFAULTS;
  return { ...ERRAND_DEFAULTS, ...e, steps: { ...ERRAND_DEFAULTS.steps, ...(e.steps || {}) }, outcome: { ...ERRAND_DEFAULTS.outcome, ...(e.outcome || {}) } };
}
/** What one roll does to a charge, as three shares — headway, a stall, trouble — by the dial's `outcome` map, so a card never says a
 *  number the mapping does not pay. Pure. */
function sharesOf(dist, E) {
  const s = { headway: 0, stall: 0, trouble: 0 };
  for (const k of OUTCOMES) {
    const o = E.outcome?.[k];
    s[o === "progress" ? "headway" : o === "problem" ? "trouble" : "stall"] += num(dist?.[k], 0);
  }
  return s;
}
function errandLevel(assignment, { worldState = null, rules = {} } = {}) {
  const E = errandRules(rules);
  const st = assignment?.targetEventId ? worldState?.eventStages?.[assignment.targetEventId] : null;
  const stage = st && !st.resolved ? Math.max(1, num(st.stage, 1)) : 0;
  return Math.max(1, Math.round(num(E.level, 10) + stage * num(E.perStage, 5)));
}

/** ⛔ CCODE-428 — AN ERRAND IS A ONE-NEED JOB for the one person carrying it, rolled on the job's own dice (`planJob`). A MISSION's need
 *  is its kind's family, or the kind's second one; a STANDING charge's (most of them) is the family its own words name, read by the
 *  stems that tell what a person is good for. Someone with no craft for it — or whom the sheet cannot build — works by plain effort.
 *  → { dist, shares, level, family, craft, how: "craft"|"effort"|"uncovered", person, steps } — the five outcomes of ONE roll, which the
 *  tick makes once per three days away. Pure. */
export function errandOdds(character, assignment, ctx = {}) {
  const { content = {}, fnIndex = null, worldDay = null } = ctx;
  const rules = content.rules || {};
  const E = errandRules(rules);
  const level = errandLevel(assignment, { worldState: character?.worldState, rules });
  const opposed = jobOpposition(level, rules);
  const kind = MISSION_KINDS[String(assignment?.kind || "").toLowerCase()] || null;
  const steps = kind ? (num(E.steps?.[assignment.kind], 0) || null) : null;
  const location = assignment?.destination ? content.locations?.[assignment.destination] || null : null;
  let person = null;
  try { person = assignment?.npcId ? jobPersonFor(character, assignment.npcId, { content, worldDay }) : null; } catch { person = null; }
  const effort = (sheet) => craftOdds(sheet || {}, { attribute: "practical", rank: 1, name: "plain effort" }, { rules, opposed, location, source: "the errand" }).odds;
  const jobFor = (family) => ({ id: assignment?.id || null, level, needs: [{ family, weight: 1 }], effort: 1, where: assignment?.destination || null });
  if (!person) { const d = effort(null); return { dist: d, shares: sharesOf(d, E), level, family: null, craft: null, how: "effort", person: null, steps }; }
  const crafts = jobCraftsOf(person, { fnIndex, rules, opposed, location });
  const bestOf = (fams) => fams.map(f => ({ f, c: bestCraftFor(crafts, f, rules) })).filter(x => x.c).sort((a, b) => b.c.w - a.c.w)[0] || null;
  if (kind) {
    // a MISSION: its kind's family or its second — and a kind they carry neither of is rolled as a need nobody covers (near-certain to fail)
    const pick = bestOf([kind.wants, kind.also].filter(Boolean));
    const plan = planJob(jobFor(pick?.f || kind.wants), [person], { rules, fnIndex, location });
    return { dist: plan.dist, shares: sharesOf(plan.dist, E), level, family: pick?.f || kind.wants, craft: pick?.c?.name || null,
      how: pick ? "craft" : "uncovered", person, steps };
  }
  // ⛔ A STANDING CHARGE ROLLS ON WHAT IT SAYS. "…forge…" is SHAPE, "warden" is PROTECT, "delegate to the committee" is INFLUENCE — ⚑ with
  // the best-family rule alone every one of Silas's four charges rolled on HARM, a reconstruction included. ⚠️ Someone with no craft for
  // what it names does it by PLAIN EFFORT: the stems are a heuristic, and a heuristic's miss must not doom a charge the GM gave them.
  // Words that name nothing fall to the family they are best at.
  const named = familiesFromEvidence({ role: assignment?.charge || "" });
  const pick = bestOf(named.length ? named : [...new Set(crafts.map(c => c.family))]);
  if (!pick) { const d = effort(person.sheet); return { dist: d, shares: sharesOf(d, E), level, family: named[0] || null, craft: null, how: "effort", person, steps }; }
  const plan = planJob(jobFor(pick.f), [person], { rules, fnIndex, location });
  return { dist: plan.dist, shares: sharesOf(plan.dist, E), level, family: pick.f, craft: pick.c.name || null, how: "craft", person, steps };
}

/** The line a person's record carries after the dice — what moved, true to the rolls, and nothing the dice did not decide. Pure. */
function errandNote(a, sequence = []) {
  const who = a?.npcName || "They";
  const what = smartClamp(String(a?.charge || "the work"), 90);
  const ahead = sequence.filter(o => o === "progress" || o === "done").length;
  const last = sequence[sequence.length - 1];
  if (last === "done") return `${who} has finished it: ${what}.`;
  if (last === "problem") return `${who} ran into trouble${ahead ? " after making headway" : ""}: ${what}.`;
  if (last === "stall") return ahead ? `${who} made headway, then stalled: ${what}.` : `${who} has stalled: ${what}.`;
  return `${who} is making headway${ahead > 1 ? ` (${ahead} steps)` : ""}: ${what}.`;
}

/** ⛔ CCODE-428 — THE WORLD TICK'S DELEGATED WORK, BY THE DICE. It was a model call (`aiAssignmentAdvancement`) deciding each charge's
 *  outcome and writing its line; the order of battle Erik approved puts errands on the job's roll. For each charge due, ONE roll per
 *  interval since it last moved (`intervalHours`, at most `maxRolls`), each degree an outcome by `outcome`, stopping at trouble or at the
 *  end of a mission — a mission is done on the step that reaches its kind's `steps`; a charge with no kind never is. → the shape the model
 *  returned, so the tick applies it through the same doors: `{ advancements: [{ assignmentId, outcome, sequence, degrees, level,
 *  family, note, rolled: true }] }`. Pure given `rng`. */
export function rollErrands({ character, content = {}, assignments = [], worldCount = 0, intervalHours = 72, rng = Math.random, fnIndex = null, worldDay = null } = {}) {
  const E = errandRules(content.rules || {});
  const advancements = [];
  for (const a of assignments || []) {
    if (!a || a.status === "done") continue;
    const since = num(a.lastMovedWorldCount ?? a.stampedAtWorldCount ?? 0, 0);
    const intervals = Math.max(1, Math.min(num(E.maxRolls, 10), Math.floor((num(worldCount, 0) - since) / Math.max(1, num(intervalHours, 72)))));
    const { dist, level, family, steps } = errandOdds(character, a, { content, fnIndex, worldDay });
    let progress = num(a.progress, 0);
    const sequence = [], degrees = [];
    for (let i = 0; i < intervals; i++) {
      const degree = rollJob(dist, rng);
      let outcome = E.outcome?.[degree] || "stall";
      if (outcome === "progress" && steps && progress + 1 >= steps) outcome = "done";
      degrees.push(degree);
      sequence.push(outcome);
      if (outcome === "progress" || outcome === "done") progress++;
      if (outcome === "done" || outcome === "problem") break;
    }
    advancements.push({ assignmentId: a.id, outcome: sequence[sequence.length - 1], sequence, degrees, level, family,
      odds: dist, note: errandNote(a, sequence), rolled: true });
  }
  return { advancements };
}

/** ⛔ EACH PERSON'S OWN ROAD — the journey planner's, from where they stand, at their own wayfaring (their wits; the gates the character
 *  has found), with the crafts that carry a road shortening the walked part as a journey's march does. `routeOf(person, whereId)`. Pure. */
export function jobRouteOf(character, { locations = {}, rules = {}, abilityCatalog = {} } = {}) {
  return (person, whereId) => {
    const from = person?.locationId;
    if (!from || !whereId || !locations[from] || !locations[whereId]) return null;
    if (from === whereId) return { days: 0, label: "already there" };
    const traveller = { knownPlaces: character?.knownPlaces || [], regionsKnown: person.regionsKnown || {}, subAttributes: { wits: person.wits },
      abilities: person.abilities || [] };
    const r = routeBetween(from, whereId, locations, { traveller, rules });
    if (!r?.options?.length) return null;
    const march = journeyCraftsOf({ abilities: person.abilities || [] }, rules, abilityCatalog).march?.share || 0;
    const ways = r.options.map(o => ({ label: o.label, days: o.kind === "gate"
      ? (num(o.walkIn, 0) + num(o.walkOut, 0)) * (1 - march) + num(o.gate?.hours, 0) / 24
      : num(o.days, 0) * (1 - march) }));
    return ways.sort((a, b) => a.days - b.days)[0];
  };
}
