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
import { journeyCraftsOf, mountedFrom } from "./journeyplan.js";   // CCODE-432: a team setting out from a stable rides
import { abilityTier } from "./skilltree.js";
import { payAt, earnAt, saidPaid, saidEarned, priceHere } from "./money.js";   // ⛔ CCODE-437: a job pays in the money of where it is done
import { addItem } from "./inventory.js";
import { recordDeed } from "./reputation.js";
import { applyLevelUps } from "./progression.js";
import { addContingent, contingentsOf, bloodBand, bloodUnit, bandDialsOf, bandCan, onMissionWith } from "./melee.js";   // CCODE-431: a band's hands go, and come back fewer if it cost them · CCODE-453: a band's mission
import { ensureJobs, dueJobs, landJob, JOB_FAMILIES, awayOnJob } from "./jobstate.js";
import { smartClamp } from "./namematch.js";
import { MISSION_KINDS, addAssignment, canSendOn } from "./assignments.js";   // ⛔ CCODE-428: an errand's kind names the family it wants · CCODE-453: a band sent
import { familiesFromEvidence } from "./combatants.js"; // …and a standing charge's own words name its family
import { workAt, workTable, postedAt } from "./holdwork.js";   // ⛔ CCODE-450: whoever is at standing work is nobody else's
import { applyRaise, returnRaiseGoods } from "./holdings.js";   // ⛔ CCODE-452: a raise done, or its materials back

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
  // ⛔ CCODE-431 — TROOPS ON A JOB. A contingent of hands rolls as a person at the middle of the levels its quality stands for (quality is
  // `1 + floor(level/10)`, so quality 1 is level 5), each family on the attribute it is done with; it works as `n` pairs of hands; and a
  // job that carries harm costs it heads by the band's own blood formula (`bloodBand`) at this tide for the degree.
  unitAttribute: { HARM: "physical", PROTECT: "physical", MOVE: "physical", SHAPE: "practical", SUSTAIN: "practical", RESTORE: "practical", KNOW: "mental", INFLUENCE: "social" },
  unitTide: { crit_success: 1, success: 0.5, partial: 0, failure: -0.5, crit_failure: -1.5 },
};

/** The job dials: the defaults, with `rules.jobs` over them (nested tables merged by key). Pure. */
export function jobRules(rules = {}) {
  const r = rules && typeof rules.jobs === "object" && rules.jobs ? rules.jobs : null;
  if (!r) return JOB_DEFAULTS;
  return { ...JOB_DEFAULTS, ...r,
    score: { ...JOB_DEFAULTS.score, ...(r.score || {}) }, worth: { ...JOB_DEFAULTS.worth, ...(r.worth || {}) },
    effect: { ...JOB_DEFAULTS.effect, ...(r.effect || {}) }, suggest: { ...JOB_DEFAULTS.suggest, ...(r.suggest || {}) },
    uncovered: { ...JOB_DEFAULTS.uncovered, ...(r.uncovered || {}) },
    unitAttribute: { ...JOB_DEFAULTS.unitAttribute, ...(r.unitAttribute || {}) }, unitTide: { ...JOB_DEFAULTS.unitTide, ...(r.unitTide || {}) } };
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
  // ⛔ CCODE-431: a band's hands bring no named crafts — they bring what the contingent DOES, each family at their quality, on the attribute
  // that family is done with. `tier: 0`, because a soldier digging is a pair of hands, not a Mason.
  if (person?.isUnit) {
    const R = jobRules(rules);
    return (person.does || []).map(family => {
      const { chance, odds } = craftOdds(person.sheet, { attribute: R.unitAttribute?.[family] || "practical", rank: person.quality, name: person.short },
        { rules, opposed, location, source: "the job" });
      return { id: `unit-${family}`, name: UNIT_CRAFT[family] || "their hands", verb: null, family, rank: Math.max(1, num(person.quality, 1)), tier: 0, chance, odds };
    });
  }
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
    return { id: p.id, rate: (best ? Math.pow(num(R.tierRate, 3), best.tier) * rankRate : 1) * (p.isUnit ? Math.max(1, num(p.n, 1)) : 1),   // CCODE-431: n pairs of hands
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
/** ⛔ CCODE-442 — SOLDIERS ON A JOB ARE PAID. Erik: "If soldiers are working or active on a job they get paid. If they're eating then part
 *  of that pay is in food. But the hold stores are meant to be for battles and journeys... so it might make sense to have the everyday food
 *  be something that happens narratively and explained through the pay they already get." ⛑ A band's hands and a hold's guards sent on a
 *  job cost `wagePerHand` a head for every pass (three days) they are away — the authored wage of a hand asked to come and work. People
 *  who are not soldiers are not paid here. ⚠️ No ration is kept and no store is drawn: their food is bought out of the wage, and the GM is
 *  told so. → { heads, units, guards, passes, perHead, value }. Pure. */
export function jobWages(character, team = [], plan = null, { wagePerHand = 3, nowHours = 0, passHours = 72 } = {}) {
  const guardIds = new Set((character?.holdings || []).flatMap(h => (h && Array.isArray(h.garrison) ? h.garrison.map(String) : [])));
  let units = 0, guards = 0;
  for (const m of Array.isArray(team) ? team : []) {
    const id = String(m?.id ?? m ?? "");
    if (m?.isUnit || /^unit:/.test(id)) units += Math.max(0, num(m?.n, 0));
    else if (guardIds.has(id)) guards += 1;
  }
  const heads = units + guards;
  const hours = Math.max(0, num(plan?.backAtHours, 0) - num(nowHours, 0));
  const passes = heads ? Math.max(1, Math.ceil(hours / Math.max(1, num(passHours, 72)) - 1e-9)) : 0;
  const perHead = Math.max(0, num(wagePerHand, 0));
  return { heads, units, guards, passes, perHead, value: heads * perHead * passes };
}

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
  const out = { degree, crystal: 0, xp: 0, recruits: 0, items: [], deed: null, standing: 0, hold: null, harmEach: 0, losses: 0, raise: null, refund: null };
  // ⚠️ an overrun rounds AWAY from zero — `Math.round(-7.5)` is −7, which would quietly shave the half a cost is owed
  if (num(s.crystal, 0)) out.crystal = s.crystal < 0 ? (degree === "crit_failure" ? -Math.round(-s.crystal * 0.5) : 0) : Math.round(s.crystal * e.gain);
  if (num(s.xp, 0) > 0) out.xp = Math.round(s.xp * Math.max(e.gain, degree === "failure" ? 0.25 : 0));
  if (num(s.recruits, 0) > 0) out.recruits = Math.max(0, Math.round(s.recruits * e.gain));
  if (Array.isArray(s.items) && e.gain >= 1) out.items = s.items.slice();
  if (s.hold && e.gain >= 1) out.hold = s.hold;
  // ⛔ CCODE-452: a success raises it; anything short of a critical failure gives the materials back; a critical failure spends them
  if (s.raise) { if (e.gain >= 1) out.raise = s.raise; else if (degree !== "crit_failure") out.refund = s.raise; }
  if (s.deed && e.deed) out.deed = s.deed;
  out.standing = (num(s.standing, 0) ? Math.round(s.standing * Math.max(0, e.gain)) : 0) + num(e.standing, 0);
  if (num(s.harm, 0) > 0 && e.harm) out.harmEach = Math.round(s.harm * e.harm);
  if (num(s.losses, 0) > 0 && e.losses) out.losses = Math.max(1, Math.round(s.losses * e.losses));
  return out;
}

const DEGREE_WORD = { crit_success: "a strong success", success: "a success", partial: "a partial success", failure: "a failure", crit_failure: "a critical failure" };
export const degreeWord = (k) => DEGREE_WORD[k] || String(k || "");

/** The effects as the lines a player and the GM read. Pure. */
export function sayEffects(fx, team = [], { money = null } = {}) {
  const out = [];
  // ⛔ CCODE-437: `money(value, earned)` says a value in the place's own money, rounded as it will be paid
  if (fx.crystal) out.push(`${fx.crystal > 0 ? "+" : "−"}${typeof money === "function" ? money(Math.abs(fx.crystal), fx.crystal > 0) : `${Math.abs(fx.crystal)} crystal`}${fx.crystal < 0 ? " (an overrun)" : ""}`);
  // xp is the character's only when they go; the people who went grow from a job done well instead (`applyJobEffects`)
  const youGo = !team.length || team.some(p => p.isYou);
  if (fx.xp && youGo) out.push(`+${fx.xp} xp`);
  // ⛔ CCODE-431: growth is for PEOPLE — a band's hands have no record to grow, and the forecast must not promise what nothing pays
  const growers = team.filter(p => !p.isYou && !p.isUnit);
  if ((fx.degree === "success" || fx.degree === "crit_success") && growers.length) out.push(`growth for ${growers.map(p => p.short || p.name).join(" and ")}`);
  if (fx.recruits) out.push(`+${fx.recruits} recruit${fx.recruits === 1 ? "" : "s"}`);
  if (fx.items?.length) out.push(fx.items.join(", "));
  if (fx.hold) out.push(fx.hold);
  if (fx.raise) out.push(`it stands at level ${fx.raise.level}`);   // CCODE-452
  if (fx.refund) out.push("the materials go back to the store");
  if (fx.deed) out.push(`deed: ${fx.deed}`);
  if (fx.standing) out.push(`standing ${fx.standing > 0 ? "+" : "−"}${Math.abs(fx.standing)}`);
  if (fx.harmEach) {
    // ⛔ CCODE-431: a person takes it as health; a band's hands take it as heads — what a fight would cost them at this degree
    const people = team.filter(p => !p.isUnit), units = team.filter(p => p.isUnit);
    if (people.length || !units.length) out.push(`−${fx.harmEach} health each (${people.map(p => (p.isYou ? "you" : p.short || p.name)).join(", ") || "whoever went"})`);
    if (units.length) out.push(`the hands may not all come back`);
  }
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
    // ⛔ R50 point 6 (Erik: "make sure those crafts don't show up as something a PC can learn") — A JOB IS NOT
    // A FIGHT. This borrows the fight menu to price what a person can bring to work, and the fight menu mints
    // "A plain strike" and "Raise a guard" for anyone whose crafts do not cover those functions. They are
    // fallbacks for a brawl, not crafts, and a job that offered them would be offering a skill nobody owns.
    const skills = battleSkillsForCharacter(character, { catalog: abilityCatalog, rules, fallbacks: false }).map(s => ({ ...s, rank: s.rank ?? 1, tier: s.tier || abilityTier(abilityCatalog[s.id] || {}) }));
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
    if (key !== "player" && workAt(character, key)) { seen.add(key); return; }   // ⛔ CCODE-450: at work at a hold — nobody else's
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
    // ⛔ CCODE-453: whoever went with their band on a mission is not here to send — those who stayed are
    if (onMissionWith(character?.bands, r.id || unitMemberId(r.unitId, r.contingentIndex))) continue;
    // ⛔ CCODE-431: a band's hands — one member of a team, `n` of them
    if (!r.id) { if (r.kind === "hands") { const u = jobUnitFor(character, r.unitId, r.contingentIndex, ctx); if (u && !seen.has(u.id) && !workAt(character, u.id)) { seen.add(u.id); out.push(u); } } continue; }
    // a keeper stands at the hold they keep — that is where a job would send them FROM
    const kept = (character?.holdings || []).find(h => h && String(h.steward) === String(r.id) && h.locationId);
    if (kept) { add(r.id, kept.locationId, `keeping ${kept.name || "a hold"}`); continue; }
    const w = wherePerson(r, { locations, generated: character?.generated?.location || {}, holdings: character?.holdings || [], hereId: here, worldDay });
    add(r.id, w.locationId || null, w.line);
  }
  // ⛔ CCODE-431: and a hold's GUARDS — "troops are not furniture": a garrison that could only be paid can be sent, from where it stands
  for (const h of character?.holdings || []) for (const g of (h && Array.isArray(h.garrison) ? h.garrison : [])) add(g, h.locationId || null, `on watch at ${h.name || "a hold"}`);
  return out;
}

const UNIT_CRAFT = { HARM: "their arms", PROTECT: "their shields", MOVE: "their legs", SHAPE: "their hands", SUSTAIN: "their stores",
  RESTORE: "their field-craft", KNOW: "their eyes", INFLUENCE: "their word" };

/** ⛔ CCODE-431 — A BAND'S HANDS AS ONE MEMBER OF A TEAM: `unit:<band id>:<contingent index>`. ⚠️ The index is stable: a contingent sent out
 *  keeps its slot with no heads in it (every reader of a band already skips an empty contingent), so an id never comes to name anyone
 *  else. */
export function unitMemberId(bandId, index) { return `unit:${bandId}:${index}`; }
export function parseUnitMemberId(id) {
  const m = /^unit:(.+):(\d+)$/.exec(String(id || ""));
  return m ? { bandId: m[1], index: Number(m[2]) } : null;
}

/** ⛔ CCODE-431 — TROOPS, NOT FURNITURE (SNG-627). Erik: "troops get fed and paid, but they can also be put to work and do jobs and
 *  missions." One contingent of a band's hands as a job sees it: `n` of them, at the level their quality stands for, with a sheet built as a
 *  person of that level is built, doing the families the contingent does. Where they stand: where the band was called, else the hold they
 *  were raised at, else the band's seat. Null for a named person (they go as themselves) or an empty contingent. Pure. */
export function jobUnitFor(character, bandId, index, ctx = {}) {
  const { content = {}, abilityCatalog = content.abilities || {}, day = null, worldDay = null } = ctx;
  const rules = content.rules || {};
  const band = (character?.bands || []).find(b => b && String(b.id) === String(bandId));
  const c = band ? contingentsOf(band)[index] : null;
  if (!c || c.npcId || !(num(c.n, 0) > 0)) return null;
  const quality = Math.max(1, num(c.quality, 1));
  const level = 10 * (quality - 1) + 5;
  const does = [...new Set((c.does || []).map(String).filter(f => JOB_FAMILIES.includes(f)))];
  const label = c.kind || (c.what && String(c.what).length <= 24 ? c.what : "hands");
  const sheetOf = typeof ctx.sheetOf === "function" ? ctx.sheetOf
    : (r) => personOpponentFor(r, { catalog: abilityCatalog, cfg: rules.npcStanding || {}, day: worldDay ?? day, traditionIndex: content.traditionIndex || null,
      items: content.items || null, leveling: rules.leveling || null });
  let sheet = null;
  try { sheet = sheetOf({ id: unitMemberId(bandId, index), name: label, level, role: label }); } catch { sheet = null; }
  const holdAt = (id) => (character?.holdings || []).find(h => h && String(h.id) === String(id))?.locationId || null;
  const locationId = (band.called && band.locationId) || holdAt(c.from) || holdAt(band.from) || (content.locations?.[band.from] ? band.from : null) || null;
  const name = `${num(c.n, 0)} ${label} of ${band.name || band.id}`;
  return { id: unitMemberId(bandId, index), isUnit: true, bandId: String(bandId), index, n: num(c.n, 0), quality, level, does, what: c.what || null,
    name, short: name, isYou: false, sheet: { attributes: sheet?.attributes || {}, subAttributes: sheet?.subAttributes || {} },
    skills: [], wits: num(sheet?.subAttributes?.wits, 2), regionsKnown: {}, abilities: [], loyalty: 0, locationId, from: `with ${band.name || "the band"}` };
}

/** ⛔ CCODE-450 — A WORKER'S CRAFTS ON AN ORDINARY DAY (no opposition): a person by id, or a band's hands as `unit:<band>:<i>`. Pure. */
export function workCraftsOf(character, id, ctx = {}) {
  const u = parseUnitMemberId(id);
  const m = u ? jobUnitFor(character, u.bandId, u.index, ctx) : jobPersonFor(character, id, ctx);
  return m ? jobCraftsOf(m, { rules: ctx.content?.rules || {}, fnIndex: ctx.fnIndex || null, opposed: 0 }) : [];
}
/** ⛔ A GOOD DAY OF STANDING WORK: the chance their best craft for any of the work's needs lands (a partial half) — the prototype's rule,
 *  read through the Jobs tab's own dice. The tick and the screen both ask this. Pure. */
export function workDayChance(crafts, kind, table = null) {
  const K = (table || workTable()).kinds[kind];
  if (!K) return 0;
  let best = 0;
  for (const c of crafts || []) if (K.needs.includes(c.family)) best = Math.max(best, num(c.odds?.crit_success, 0) + num(c.odds?.success, 0) + 0.5 * num(c.odds?.partial, 0));
  return best;
}
/** How many hands a worker is — a person one, a band's contingent its heads. Pure. */
export function workHeads(character, id) {
  const u = parseUnitMemberId(id);
  if (!u) return 1;
  const b = (character?.bands || []).find(x => x && String(x.id) === u.bandId);
  return Math.max(0, num(b?.contingents?.[u.index]?.n, 0));
}

/** ⛔ CCODE-431 — SENT OUT, THEY LEAVE. A band's hands on a job are not in the band: its strength, a fight and a call all see it without
 *  them. And a guard on a job is not on the watch, so the hold sees with fewer eyes and a raid finds fewer defenders. ⚠️ BY LEAVING, not by a
 *  flag every reader must learn: the heads come out of their contingent (the slot stays, empty) and the guard off the garrison, and the
 *  entry keeps what left, so `returnFromJob` can bring back whoever comes back. A person who stands in a band leaves their place in it too.
 *  Mutates `character` and `entry`; → what left. */
export function detachForJob(character, entry) {
  const out = { units: [], guards: [] };
  if (!character || !entry) return out;
  const bands = Array.isArray(character.bands) ? character.bands : [];
  const takeSlot = (band, index) => {
    // a flat band's implicit contingent is made real first, as `addContingent` makes it, or its people would vanish
    if (!Array.isArray(band.contingents) || !band.contingents.length) band.contingents = contingentsOf(band).map(c => ({ ...c }));
    const c = band.contingents[index];
    if (!c || !(num(c.n, 0) > 0)) return null;
    const took = { ...c };
    band.contingents = band.contingents.map((x, i) => (i === index ? { ...x, n: 0 } : x));
    band.count = band.contingents.reduce((a, x) => a + Math.max(0, num(x?.n, 0)), 0);
    return took;
  };
  for (const id of (entry.team || []).map(String)) {
    const u = parseUnitMemberId(id);
    if (u) {
      const band = bands.find(b => b && String(b.id) === u.bandId);
      const took = band ? takeSlot(band, u.index) : null;
      if (took && !took.npcId) out.units.push({ id, bandId: u.bandId, index: u.index, bandName: band.name || band.id, c: took });
      continue;
    }
    if (id === "player") continue;
    for (const band of bands) {
      const i = contingentsOf(band).findIndex(c => c.npcId === id && c.n > 0);
      if (i >= 0) { const took = takeSlot(band, i); if (took) out.units.push({ id, bandId: String(band.id), index: i, bandName: band.name || band.id, c: took, named: true }); }
    }
    for (const h of character.holdings || []) {
      if (h && Array.isArray(h.garrison) && h.garrison.includes(id)) {
        h.garrison = h.garrison.filter(x => x !== id);
        out.guards.push({ npcId: id, holdId: h.id, holdName: h.name || h.id });
      }
    }
  }
  entry.detached = out;
  return out;
}

/** ⛔ CCODE-431 — AND WHOEVER COMES BACK COMES BACK. The hands return to their slot — less what a job that carried harm cost them, by the
 *  band's own blood formula at the degree's tide (`unitTide`), so a failed job bleeds them as a lost fight would and a success barely
 *  does — and the band's losses and condition carry it, on `bloodBand`'s own thresholds. A guard goes back on the watch. A band that no
 *  longer stands, or a hold no longer yours, is SAID rather than quietly absorbing them. Mutates `character`; → the lines to say. */
export function returnFromJob(character, entry, fx, { rules = {}, cfg = {} } = {}) {
  const lines = [];
  const d = entry?.detached;
  if (!character || !d || d.returned) return lines;
  const R = jobRules(rules);
  const tide = num(R.unitTide?.[fx?.degree], 0);
  const harmful = num(fx?.harmEach, 0) > 0;
  for (const u of d.units || []) {
    const band = (character.bands || []).find(b => b && String(b.id) === String(u.bandId));
    const n = Math.max(0, num(u.c?.n, 0));
    const label = u.named ? (entry.names?.[u.id] || u.c?.what || "they") : (u.c?.kind || "hands");
    let lost = 0;
    if (harmful && !u.named && n > 0) {
      const r = bloodBand({ id: "detachment", contingents: [{ ...u.c }], losses: 0, condition: "fresh" }, tide, { cfg });
      lost = Math.min(n, Math.max(0, num(r?.lost, 0)));
    }
    const back = n - lost;
    if (!band) {
      lines.push(u.named ? `${label} came back to a band that no longer stands` : `${back} ${label} came back to find ${u.bandName} no longer stands, and went their own ways`);
      continue;
    }
    const cs = Array.isArray(band.contingents) ? band.contingents : [];
    const slot = cs[u.index];
    const same = !!slot && !(num(slot.n, 0) > 0) && String(slot.npcId || "") === String(u.c?.npcId || "")
      && String(slot.from || "") === String(u.c?.from || "") && String(slot.what || "") === String(u.c?.what || "");
    if (back > 0) band.contingents = same ? cs.map((x, i) => (i === u.index ? { ...x, n: back } : x)) : [...cs, { ...u.c, n: back }];
    band.count = (band.contingents || []).reduce((a, x) => a + Math.max(0, num(x?.n, 0)), 0);
    if (lost > 0) {
      band.losses = num(band.losses, 0) + lost;
      const head = band.count, hurt = (head + band.losses) ? band.losses / (head + band.losses) : 0;
      // ⚠️ `bloodBand`'s own thresholds, read from the same dials — a band that bled on a job is exactly as worn as one that bled in a fight
      band.condition = head === 0 || hurt > num(cfg.brokenAt, 0.5) ? "broken" : hurt > num(cfg.wornAt, 0.25) ? "worn" : "blooded";
      lines.push(`${lost} of the ${n} ${label} did not come back to ${u.bandName}`);
    }
  }
  for (const g of d.guards || []) {
    const h = (character.holdings || []).find(x => x && String(x.id) === String(g.holdId));
    const who = entry.names?.[g.npcId] || g.npcId;
    if (!h) { lines.push(`${who} came back, but ${g.holdName} is no longer yours to guard`); continue; }
    if (!(h.garrison || []).includes(g.npcId)) h.garrison = [...(Array.isArray(h.garrison) ? h.garrison : []), g.npcId];
    lines.push(`${who} is back on the watch at ${h.name || h.id}`);
  }
  entry.detached = { ...d, returned: true };
  return lines;
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
  // ⛔ CCODE-442 (Erik): soldiers out are PAID, and eat from it — never from a hold's store, which is for battles and journeys
  if (away.some(e => num(e?.wages?.heads, 0) > 0)) out.push(`SOLDIERS ON JOBS ARE PAID — their wage covers the time away, and their food is bought out of it; they carry no rations from a hold's store.`);
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
  // ⛔ CCODE-437: a job pays, and an overrun is paid, in the money of the place it was done
  const eco437 = rules.economy || null, reg437 = place?.regionId || null;
  if (fx.crystal > 0) { const e = earnAt(character, fx.crystal, reg437, eco437, { origin: "reward" }); if (e.ok && e.amount > 0) lines.push(`+${saidEarned(e)}`); }
  else if (fx.crystal < 0) {
    const r = payAt(character, -fx.crystal, reg437, eco437);
    lines.push(r.ok ? `−${saidPaid(r)} (an overrun)` : `an overrun of ${priceHere(-fx.crystal, reg437, eco437).label} nobody could pay`);
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
  if (fx.raise) { const r = applyRaise(character, fx.raise); if (r.said) lines.push(r.said); }   // ⛔ CCODE-452
  if (fx.refund) { const r = returnRaiseGoods(character, fx.refund); if (r.said) lines.push(r.said); }
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
export function settleDueJobs(character, { nowHours = 0, rng = Math.random, content = {}, itemCatalog = content.items || {}, day = null, bandCfg = null } = {}) {
  // ⚠️ THE BAND DIALS ARE THE CALLER'S BAG (app.js `meleeCfg`); this is the same two sources it merges, for a caller without one
  const cfgBand = bandCfg || { ...(content.skillBattle?.engine?.melee || {}), ...(content.rules?.martial || {}) };
  const settled = [];
  ensureJobs(character);
  for (const e of dueJobs(character, nowHours)) {
    const degree = rollJob(e.dist, rng);
    const fx = jobEffects(e.job, degree, content.rules || {});
    const applied = applyJobEffects(character, e, fx, { content, itemCatalog, day });
    // ⛔ CCODE-431: whoever was detached comes back — the hands to their band, less what a harmful job cost them; a guard to the watch
    const returned = returnFromJob(character, e, fx, { rules: content.rules || {}, cfg: cfgBand });
    applied.push(...returned);
    const team = (e.team || []).map(id => ({ id, isYou: id === "player", isUnit: !!parseUnitMemberId(id), short: id === "player" ? "you" : (e.names?.[id] || id) }));
    const cover = (e.cover || []).map(c => (c ? { personName: c.personId === "player" ? "you" : c.personName, craft: c.craft } : null));
    const directive = jobDirective(e.job, degree, fx, cover, team, { whereName: content.locations?.[e.job?.where]?.name || null })
      + (returned.length ? `\nWho came back: ${returned.join("; ")}.` : "");
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
  bandTroubleTide: -0.5,   // ⛔ CCODE-453: a band whose mission goes wrong bleeds as after a clash lost by this much (melee's tide)
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

/** ⛔ CCODE-453 — WHY ONE OF A BAND IS NOT WITH IT, or null when they are. A band's TURN asks what it always did: out on a job, or at
 *  standing work (hands too). A MISSION (`leaving`) asks more, because the band goes somewhere: whoever walks at your side stays there
 *  (send them back to the band first — nobody is parted from you in silence), whoever carries a charge of their own carries on, and a
 *  keeper, a guard or a crew hand keeps their post. ⚑ Measured on Silas: of the Fell Pell's six, Pell keeps two holds and walks with
 *  him, Calvar stands its garrison, Fendt keeps the Threshold Post and has his own charge — three go. Pure. */
export function bandMemberAway(character, band, c, i, { leaving = false } = {}) {
  if (!c) return "not there";
  if (!c.npcId) { const w = workAt(character, unitMemberId(band?.id, i)); return w ? `at work at ${w.holdName}` : null; }
  const id = String(c.npcId);
  if (awayOnJob(character, id)) return "out on a job";
  const w = workAt(character, id);
  if (w) return `at work at ${w.holdName}`;
  if (!leaving) return null;
  if (activeCompany(character).some(m => String(m.npcId) === id) || (character?.companions || []).some(x => String(x?.id || x) === id)) return "at your side";
  if (Object.values(character?.worldState?.assignments || {}).some(a => a && a.status !== "done" && String(a.npcId) === id)) return "on a charge of their own";
  const post = postedAt(character, id);
  return post ? `keeping their post at ${post.name || "a hold"}` : null;
}

/** ⛔ CCODE-453 — WHO OF A BAND IS WITH IT, as the Jobs tab's team members: `bandMemberAway` decides, so the band's turn on the Bands tab
 *  and a mission's roll in the world tick read ONE rule (the mission with `leaving`). People carry the families their place in the band
 *  names (`roleFams`); hands are labelled by what they are. Pure. */
export function bandTeamOf(character, band, ctx = {}, { leaving = false, only = null } = {}) {
  const out = [];
  (band?.contingents || []).forEach((c, i) => {
    if (!c) return;
    // `only`: exactly these (a mission's `went`); otherwise whoever is not away by the rule
    if (only ? !only.has(c.npcId ? String(c.npcId) : unitMemberId(band.id, i)) : bandMemberAway(character, band, c, i, { leaving })) return;
    try {
      if (c.npcId) {
        const p = jobPersonFor(character, c.npcId, ctx);
        if (p) out.push({ ...p, roleFams: (c.does || []).map(String) });
      } else {
        const u = jobUnitFor(character, band.id, i, ctx);
        if (u) out.push({ ...u, label: c.kind || "hands" });
      }
    } catch (err) { console.warn("[jobs] a band member could not be read, and is not counted present:", err?.message); }
  });
  return out;
}

/** ⛔ CCODE-453 — WHO GOES ON A MISSION AND WHO STAYS, said before anyone is sent: `goes` [{ id, label, n }], `stays` [{ id, label, why }],
 *  and `does` — what THOSE WHO GO can do (`bandCan` over their contingents, kit included), which is what the mission's kind is judged on:
 *  a band whose only knower walks at your side is not sent to seek. The labels are the caller's (`nameOf` a person's id); hands are
 *  "12 spears". Pure. */
export function bandMissionParty(character, band, { nameOf = (id) => id } = {}) {
  const goes = [], stays = [], going = [];
  contingentsOf(band).forEach((c, i) => {
    if (!(c.n > 0)) return;
    const label = c.npcId ? nameOf(c.npcId) : `${c.n} ${c.kind || "hands"}`;
    const id = c.npcId ? String(c.npcId) : unitMemberId(band.id, i);
    const why = bandMemberAway(character, band, c, i, { leaving: true });
    if (why) stays.push({ id, label, why }); else { goes.push({ id, label, n: c.n }); going.push(c); }
  });
  return { goes, stays, heads: goes.reduce((a, g) => a + g.n, 0), does: bandCan({ contingents: going }) };
}

/** ⛔ CCODE-453 — A BAND'S MISSION ROLLS AS A TEAM: its present people and its hands, on the mission kind's family (weighted two) and its
 *  second (one) — `planJob`, the Jobs tab's own roll, so whoever in the band covers each need best is the one who rolls it. Pure. */
export function bandMissionOdds(character, assignment, ctx = {}) {
  const { content = {}, fnIndex = null, worldDay = null } = ctx;
  const rules = content.rules || {};
  const E = errandRules(rules);
  const level = errandLevel(assignment, { worldState: character?.worldState, rules });
  const kind = MISSION_KINDS[String(assignment?.kind || "").toLowerCase()] || MISSION_KINDS.work;
  const steps = num(E.steps?.[assignment?.kind], 0) || null;
  const location = assignment?.destination ? content.locations?.[assignment.destination] || null : null;
  const band = (character?.bands || []).find(b => b && String(b.id) === String(assignment?.bandId));
  // those who WENT roll it — named when they were sent; a mission that names nobody is whoever is free to leave
  const went = Array.isArray(band?.mission?.went) ? new Set(band.mission.went.map(String)) : null;
  const team = band ? bandTeamOf(character, band, { content, worldDay }, went ? { only: went } : { leaving: true }) : [];
  if (!team.length) {
    const d = craftOdds({}, { attribute: "practical", rank: 1, name: "plain effort" }, { rules, opposed: jobOpposition(level, rules), location, source: "the mission" }).odds;
    return { dist: d, shares: sharesOf(d, E), level, family: kind.wants, craft: null, how: "effort", person: null, steps };
  }
  const job = { id: assignment?.id || null, level, effort: 1, where: assignment?.destination || null,
    needs: [{ family: kind.wants, weight: 2 }, ...(kind.also ? [{ family: kind.also, weight: 1 }] : [])] };
  const plan = planJob(job, team, { rules, fnIndex, location });
  return { dist: plan.dist, shares: sharesOf(plan.dist, E), level, family: kind.wants, craft: null, how: "band", person: null, steps };
}

/** ⛔ CCODE-453 — SEND A BAND ON A MISSION: one of the seven errand kinds, as a band. Refused, and says why, when there is no such band,
 *  it is already away, it is called into the field (stand it down first), it stands empty, nobody of it is free to go (`bandMissionParty`
 *  says who stays and why), the charge is unwritten, or what it can do does not fit the kind — `canSendOn`, the errand's own rule, on the
 *  families of those who GO (`bandMissionParty`'s `does`). Nobody is parted from your side: who walks with you stays with you. `placeName` is the
 *  destination as the player reads it. Mutates `character`. → { ok, assignment, said, party } | { ok: false, why } */
export function sendBandOnMission(character, bandId, { kind, charge, destination = null, stake = null, worldCount = null, placeName = null, nameOf = undefined } = {}) {
  const band = (character?.bands || []).find(b => b && String(b.id) === String(bandId));
  if (!band) return { ok: false, why: "there is no such band" };
  const name = band.name || String(bandId);
  if (band.mission) return { ok: false, why: `${name} is already away on a mission` };
  if (band.called) return { ok: false, why: `${name} is called into the field — stand them down first` };
  const kindId = String(kind || "").toLowerCase();
  const k = MISSION_KINDS[kindId];
  if (!k) return { ok: false, why: "that is not a mission anyone can be sent on" };
  const words = String(charge || "").trim();
  if (!words) return { ok: false, why: "say what they are to do — the charge is yours to write" };
  if (!(contingentsOf(band).reduce((a, c) => a + c.n, 0) > 0)) return { ok: false, why: `${name} stands empty — there is nobody to send` };
  const party = bandMissionParty(character, band, nameOf ? { nameOf } : {});
  if (!party.goes.length) return { ok: false, why: `nobody of ${name} is free to go — ${party.stays.map(s => `${s.label} is ${s.why}`).join("; ")}` };
  const fit = canSendOn({ npcName: name, does: party.does }, kindId);   // judged on those who go
  if (!fit.ok) return { ok: false, why: fit.why };
  character.worldState = character.worldState || {};
  const a = addAssignment(character.worldState, { bandId: band.id, npcName: name, charge: words, kind: kindId, destination: destination || null, stake: stake || null }, worldCount);
  if (!a) return { ok: false, why: "that could not be sent" };
  const said = `${k.verb}${destination ? ` to ${placeName || destination}` : ""} — ${smartClamp(words, 120)}`;
  band.mission = { assignmentId: a.id, kind: kindId, destination: destination || null, said, went: party.goes.map(g => g.id) };
  return { ok: true, assignment: a, said, party };
}

/** ⛔ CCODE-453 — WHAT A PASS OF A BAND'S MISSION DOES TO THE BAND. Done, it is home. In trouble it bleeds as a band does after a lost clash
 *  (`bandTroubleTide`, on the band dials the app uses) and stays out; what went with it is gone, once; bled to nobody, the mission ends
 *  there. Mutates `character`. → the lines the news says after the charge's own. */
export function bandMissionOutcome(character, assignment, outcome, { content = {} } = {}) {
  const band = (character?.bands || []).find(b => b && String(b.id) === String(assignment?.bandId));
  if (!band) return [];
  if (outcome === "done") { delete band.mission; return []; }
  if (outcome !== "problem") return [];
  const E = errandRules(content.rules || {});
  assignment.stake = null;   // the problem's cost line has said it is lost; it is not lost twice
  const bled = bloodUnit(character.bands, band.id, num(E.bandTroubleTide, -0.5), { cfg: bandDialsOf(content) });
  if (!bled.ok) return [];
  character.bands = bled.bands;
  const now = character.bands.find(b => b && String(b.id) === String(band.id)) || band;
  const left = contingentsOf(now).reduce((a, c) => a + c.n, 0);
  const name = band.name || "The band";
  const lines = [];
  if (num(bled.lost, 0) > 0) lines.push(`${name} lost ${bled.lost} on it${left > 0 ? `; ${left} still out` : ""}.`);
  if (left <= 0) {
    assignment.status = "done"; assignment.endedBy = "lost";
    delete now.mission;
    lines.push(`Nobody of ${name} is left to carry it. The charge ends there.`);
  }
  return lines;
}

/** ⛔ CCODE-428 — AN ERRAND IS A ONE-NEED JOB for the one person carrying it, rolled on the job's own dice (`planJob`). A MISSION's need
 *  is its kind's family, or the kind's second one; a STANDING charge's (most of them) is the family its own words name, read by the
 *  stems that tell what a person is good for. Someone with no craft for it — or whom the sheet cannot build — works by plain effort.
 *  → { dist, shares, level, family, craft, how: "craft"|"effort"|"uncovered", person, steps } — the five outcomes of ONE roll, which the
 *  tick makes once per three days away. Pure. */
export function errandOdds(character, assignment, ctx = {}) {
  if (assignment?.bandId) return bandMissionOdds(character, assignment, ctx);   // ⛔ CCODE-453: a band rolls as a band
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
    // ⛔ CCODE-432: from where you keep mounts they ride — the better of the ride and a craft's march, never both
    const march = Math.max(journeyCraftsOf({ abilities: person.abilities || [] }, rules, abilityCatalog).march?.share || 0,
      mountedFrom(character, from, rules)?.share || 0);
    const ways = r.options.map(o => ({ label: o.label, days: o.kind === "gate"
      ? (num(o.walkIn, 0) + num(o.walkOut, 0)) * (1 - march) + num(o.gate?.hours, 0) / 24
      : num(o.days, 0) * (1 - march) }));
    return ways.sort((a, b) => a.days - b.days)[0];
  };
}
