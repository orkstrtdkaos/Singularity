// journeyroad.js — ⛔ CCODE-390: THE ROAD, WALKED LEG BY LEG — a dangerous leg is a gambit, and a journey stopped on the road is taken up again.
//
// Erik's "Proceed" (2026-09-16) on the two stages CCODE-387 left open. Aevi's SNG-333: "navigating a leg or passing through a dangerous area
// can include a gambit … you either play out of a failure or pass the way you intended." And her `theQuestShape` (staged journey_skills):
// "a journey that is a tracked object CAN BE INTERRUPTED AND RESUMED. An encounter mid-leg does not cancel it; a route that closes behind you
// re-plans it; and a party that turns back has a record of how far they got."
//
// ⚑ MEASURED FIRST — every road between 60 settlements on the shipped world (141 places): a journey is 4.45 legs, and a leg is long (median
// 29 days, p90 139). SNG-333 proposed a gambit at danger 2 or more: that is 66% of legs, and 97% of journeys would have one. Its own guard
// rules that out — "If every leg is a gambit, the gambit stops meaning 'this one is dangerous.'" At danger 3 or more (perilous and deadly)
// it is 17% of legs and 55% of journeys. So the line is 3, and it is a dial (`rules.journey.legGambit.minDanger`).
//
// ⛑ THE ROAD:
//   · SETTING OUT walks the chosen way's legs in order. A leg's days pass on the character's clock; its rations are eaten a day at a time
//     (`walkRoadDays`, the same model the whole road is priced by, so the legs cost exactly what the road does); hunger is paid as it is
//     walked, under the whole road's caps; the traveller stands at the leg's end, a real place, and it becomes known.
//   · THE ROAD ASKS WHAT IT HELD after every leg walked — the authored `onTravel` roll, whose own note says "per travel leg". An encounter
//     stops the journey where it happened; it waits.
//   · A LEG INTO PERILOUS COUNTRY IS A GAMBIT (SNG-333): the way, the danger, the camp — each taken with the craft the character holds that
//     gives it the best chance among those claiming the step's challenge (`challengeTypes`, authored on the crafts and read by nothing
//     until now), rolled as that craft rolls (CCODE-379) and at its rank; assessed exactly as a declared gambit; the weak link shown at a
//     real read, or to anyone holding a craft that reads the way (Aevi: "that visibility IS wayfinding and pattern_sense doing their job").
//     Every step carries the fallbacks the character can actually take — another craft of the same challenge, then another way at it, then
//     the plain way through — so no step is a dead end. Or the player GOES AROUND, when a real way round exists.
//   · A STEP THAT BREAKS DOES NOT END THE JOURNEY: the failure is played out where it happened, and the journey waits.
//   · A JOURNEY STOPPED is taken up again from wherever the character stands — re-planned from there if they have moved, with what was walked
//     kept (`logJourneyOn`) — or ended there, with the record of how far it got.

import { roadRoute } from "./journey.js";
import { journeyRules, chosenWay, provisionsCarried, journeyCraftsOf, legsOfWay, forageChanceOf, walkRoadDays, hungerCost, eatProvisionsOn,
  rationsFor } from "./journeyplan.js";
import { assessGambit } from "./gambit.js";
import { rollForChoice, effectiveEnergyCost } from "./progression.js";
import { successChance } from "./resolve.js";

export const ROAD_DEFAULTS = Object.freeze({
  legGambit: {
    minDanger: 3,                                              // perilous and deadly country; see the measurement above
    readers: ["wayfinding", "way_sense", "pattern_sense"],     // Aevi's planning crafts: holding one shows where the leg will break
    lostWayShare: 0.25,                                        // a way lost costs this share of the leg's days again
    bands: { 3: "hard", 4: "very_hard" },                      // the danger step's band by the place's danger; the way and the camp are lighter
    // ⚠️ THE STEP WORDS ARE AEVI'S TO AUTHOR (SNG-333 "MINE TO AUTHOR": the step vocabulary, which crafts answer which step, and "the
    // mundane-fallback lines, which are the ones that must never sound like failure"). These stand until `rules.journey.legGambit` says.
    steps: {
      // a step is named by how its craft meets it — the challenge the craft claims — so the plan says HOW, not only what
      way: { challengeTypes: ["TRAVEL", "EXPLORE"], attribute: "practical", subAttribute: "wits", tags: ["scout", "careful"], lighter: 1,
        label: "Find the way to {to}", plain: "keep to the road and ask the way at every fire",
        approaches: { EXPLORE: "Scout a way to {to}" },
        failed: "They lost the way before {to} — the road was not where it should have been, and days went with it." },
      danger: { challengeTypes: ["STEALTH", "CHASE", "SOCIAL", "DEFEND", "FIGHT"], attribute: "physical", subAttribute: "agility", tags: ["risky"], lighter: 0,
        label: "Get through {to}", plain: "keep your head down and push on through",
        approaches: { STEALTH: "Get through {to} unseen", CHASE: "Outpace whatever watches {to}", SOCIAL: "Talk your way through {to}",
          DEFEND: "Hold together through {to}", FIGHT: "Fight your way through {to}" },
        failed: "{to} was not passed the way they meant to pass it — they were noticed, and what noticed them is here now." },
      camp: { challengeTypes: ["SURVIVE"], attribute: "practical", subAttribute: "craft", tags: ["prepare", "careful"], lighter: 1,
        label: "Make camp beyond {to}", plain: "sleep rough, with one eye open",
        failed: "The camp beyond {to} was found in the night." },
    },
  },
});

const BANDS = ["very_easy", "easy", "normal", "hard", "very_hard"];
const round1 = (n) => Math.round(Number(n) * 10) / 10;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const fill = (s, leg) => String(s || "").replace(/\{to\}/g, leg?.toName || "the road ahead").replace(/\{from\}/g, leg?.fromName || "here");
export const dangerWord = (lvl) => lvl >= 4 ? "deadly" : lvl >= 3 ? "perilous" : lvl >= 2 ? "dangerous" : "uneasy";

/** The leg-gambit dials in force: authored `rules.journey.legGambit` over the defaults, step by step. Pure. */
export function roadRules(rules = {}) {
  const D = ROAD_DEFAULTS.legGambit;
  const A = journeyRules(rules).legGambit || {};
  const steps = {};
  for (const k of new Set([...Object.keys(D.steps), ...Object.keys(A.steps || {})])) steps[k] = { ...(D.steps[k] || {}), ...((A.steps || {})[k] || {}) };
  return { ...D, ...A, bands: { ...D.bands, ...(A.bands || {}) }, steps };
}

/** A plan saved before its ways carried legs is given them now, by the same measure. Mutates the plan. */
export function ensureLegsOn(plan, { locations = {}, character = null, rules = {}, abilities = {} } = {}) {
  if (!plan) return plan;
  const march = journeyCraftsOf(character, rules, abilities).march?.share || 0;
  for (const o of plan.options || []) if (!Array.isArray(o.legs)) o.legs = legsOfWay(o, locations, { march });
  return plan;
}

/** ⛔ SETTING OUT: the road's record begins on the plan — where from, which way, nothing walked yet. Once only. Mutates the plan. */
export function beginRoadOn(plan, { worldDay = null } = {}) {
  if (!plan) return null;
  if (!plan.underway) plan.underway = { startedWorldDay: worldDay, fromId: plan.fromId, fromName: plan.fromName, wayKey: plan.chosenKey, legIndex: 0,
    daysWalked: 0, countedDays: 0, foodDaysLeft: 0, rationsEaten: 0, foraged: 0, hungryDays: 0, healthTaken: 0, legs: [], stops: [], pending: null, inGambit: null };
  return plan.underway;
}

/** The leg the road is on — null once every leg of the way is walked. Pure. */
export function currentLeg(plan) {
  return (chosenWay(plan)?.legs || [])[Number(plan?.underway?.legIndex) || 0] || null;
}

/** Where the traveller should be standing to walk on: the start of the leg the road is on, or where the plan was made. Pure. */
export function roadStandsAt(plan) {
  if (!plan) return null;
  return plan.underway ? (currentLeg(plan)?.fromId || plan.destId) : plan.fromId;
}

/** Does this leg earn a gambit: perilous country or worse — never a gate's hop, which is hours through a made thing. Pure. */
export function legEarnsGambit(leg, rules = {}) {
  return !!leg && !leg.gate && (Number(leg.danger) || 0) >= (Number(roadRules(rules).minDanger) || 3);
}

/** ⛔ DAYS ON THE ROAD — a leg's, or the days a lost way costs: eaten a day at a time from what is carried, hunger paid as it is walked
 *  under the whole road's caps, a gate's toll. A stretch with nights in it rests the body back to what hunger leaves; a stretch of hours
 *  only pays its toll. Mutates the character and the road's record. */
export function spendRoadOn(character, plan, days, { rules = {}, catalog = {}, abilities = {}, rng = Math.random, toll = 0 } = {}) {
  const u = plan?.underway;
  if (!u || !character) return null;
  const R = journeyRules(rules);
  const crafts = journeyCraftsOf(character, rules, abilities);
  const d = Math.max(0, Number(days) || 0);
  const ate = walkRoadDays(u, d, { rations: provisionsCarried(character, rules, catalog), daysPerProvision: R.daysPerProvision,
    forageChance: forageChanceOf(character, rules, crafts), rng });
  eatProvisionsOn(character, ate.rations, rules, catalog);
  const cost = hungerCost(u.hungryDays, character, rules, crafts);
  const healthLoss = Math.max(0, cost.healthLoss - (Number(u.healthTaken) || 0));
  u.healthTaken = Math.max(Number(u.healthTaken) || 0, cost.healthLoss);
  if (healthLoss) character.health = Math.max(1, (Number(character.health) || 1) - healthLoss);
  const maxE = Number(character.maxEnergy) || Number(character.energy) || 0;
  const rested = Math.round(maxE * cost.energyShare);
  character.energy = Math.max(0, (d >= 1 ? rested : Math.min(Number(character.energy) || 0, rested)) - (Number(toll) || 0));
  return { days: d, hours: Math.max(1, Math.round(d * 24)), rations: ate.rations, foraged: ate.foraged, hungry: ate.hungry, healthLoss };
}

/** The energy the traveller will stand with at the end of the leg the road is on — what a plan for that leg can afford. Pure. */
export function energyAfterLeg(character, plan, { rules = {}, abilities = {} } = {}) {
  const leg = currentLeg(plan), u = plan?.underway;
  const crafts = journeyCraftsOf(character, rules, abilities);
  const share = hungerCost(Number(u?.hungryDays) || 0, character, rules, crafts).energyShare;
  const rested = Math.round((Number(character?.maxEnergy) || Number(character?.energy) || 0) * share);
  return Math.max(0, ((Number(leg?.days) || 0) >= 1 ? rested : Math.min(Number(character?.energy) || 0, rested)) - (Number(leg?.gate?.energy) || 0));
}

/** ⛔ A LEG WALKED: its days spent (`spendRoadOn`), and the road moves on to the next. The app moves the traveller, turns the clock and asks
 *  what the road held. Mutates. Returns `{ leg, days, hours, rations, foraged, hungry, healthLoss, arrived }`. */
export function walkLegOn(character, plan, { rules = {}, catalog = {}, abilities = {}, rng = Math.random } = {}) {
  const u = plan?.underway, leg = currentLeg(plan);
  if (!u || !leg) return null;
  const spent = spendRoadOn(character, plan, leg.days, { rules, catalog, abilities, rng, toll: leg.gate?.energy || 0 });
  u.legs = [...(u.legs || []), { i: leg.i, fromName: leg.fromName, toId: leg.toId, toName: leg.toName, days: leg.days, danger: leg.danger, roof: !!leg.roof }];
  u.legIndex = (Number(u.legIndex) || 0) + 1;
  u.pending = null;
  return { leg, ...spent, arrived: leg.toId === plan.destId || !currentLeg(plan) };
}

/** The band a step of a perilous leg is taken at: the danger step at the place's own band, the way and the camp `lighter` bands easier. Pure. */
export function legBand(leg, stepDef, rules = {}) {
  const G = roadRules(rules);
  const keys = Object.keys(G.bands).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const d = Number(leg?.danger) || 0;
  const key = keys.filter(k => k <= d).pop();
  const at = key != null ? G.bands[key] : "normal";
  const i = BANDS.indexOf(String(at).replace(/[\s-]+/g, "_"));
  return BANDS[Math.max(0, (i < 0 ? 2 : i) - (Number(stepDef?.lighter) || 0))];
}

/** ⛔ THE CRAFTS THAT ANSWER A STEP: every craft the character holds that claims one of the step's challenges — or that the step's own
 *  authored `crafts` list names (Aevi's mapping, SNG-333 "which crafts answer which step kind"; answering by "LISTED") — with its rank, what
 *  it costs now, and which challenge it answers by. Pure. */
export function answersFor(stepDef, character, { abilities = {}, rules = {} } = {}) {
  const types = (stepDef?.challengeTypes || []).map(x => String(x).toUpperCase());
  const listed = new Set(stepDef?.crafts || []);
  const out = [];
  for (const a of character?.abilities || []) {
    const def = abilities?.[a?.abilityId];
    if (!def) continue;
    const claims = (def.challengeTypes || []).map(x => String(x).toUpperCase());
    const by = types.find(x => claims.includes(x)) || (listed.has(def.id || a.abilityId) ? "LISTED" : null);
    if (!by) continue;
    out.push({ id: def.id || a.abilityId, name: def.name || a.abilityId, rank: Math.max(1, Number(a.level) || 1), by, cost: effectiveEnergyCost(def, character, rules) });
  }
  return out;
}

/** One step of a perilous leg as the resolver takes it — a craft's step rolls what the craft rolls, at its rank; the plain way rolls the
 *  step's own. Pure. */
function stepAction(kind, def, leg, answer, { abilities = {}, table = null, band = "normal", flat = 4 } = {}) {
  const base = { attribute: def.attribute || "practical", subAttribute: def.subAttribute || null };
  const roll = answer ? rollForChoice([abilities[answer.id]].filter(Boolean), base, table) : base;
  const named = (answer && def.approaches?.[answer.by]) || def.label;
  return { label: `${fill(named, leg)} — ${answer ? answer.name : fill(def.plain, leg)}`, ...roll, axes: {}, difficulty: band,
    tags: [...(def.tags || [])], intentTags: [...(def.tags || [])], abilityId: answer?.id || null, abilityLevel: answer?.rank || 0, comboAbilities: [],
    novel: false, planned: true, legStep: kind, plain: !answer, approach: answer?.by || null, energy: answer ? answer.cost : flat };
}

/** ⛔ A PERILOUS LEG AS A GAMBIT (SNG-333). `ctx` is a declared gambit's own — `{ character, location (the leg's end), rules, aptitudeMods,
 *  bonuses }` — so the steps are assessed and run exactly as one is. `energy` is what the traveller will stand with (`energyAfterLeg`): a
 *  craft that cannot be paid for is never offered, because "a suggestion the player cannot take is worse than a blank field". Pure. */
export function legGambitFor(leg, ctx, { abilities = {}, energy = null } = {}) {
  if (!leg || !ctx?.character) return null;
  const { character, rules = {} } = ctx;
  const G = roadRules(rules);
  const table = rules?.craftSubAttributes || null;
  const flat = Number(rules?.gambit?.stepEnergyCost ?? 4);
  let budget = Number.isFinite(Number(energy)) && energy !== null ? Number(energy) : Number(character.energy) || 0;
  const kinds = ["way", "danger", ...((Number(leg.days) || 0) >= 1 ? ["camp"] : [])].filter(k => G.steps[k]);
  const chanceOf = (action) => successChance({ ...ctx, action, equipmentBonus: ctx.bonuses ? ctx.bonuses(action) : 0 });
  const steps = kinds.map(kind => {
    const def = G.steps[kind];
    const band = legBand(leg, def, rules);
    const plain = { ans: null, action: stepAction(kind, def, leg, null, { abilities, table, band, flat }) };
    const answers = answersFor(def, character, { abilities, rules })
      .map(ans => { const action = stepAction(kind, def, leg, ans, { abilities, table, band, flat }); return { ans, action, chance: chanceOf(action) }; })
      .sort((a, b) => b.chance - a.chance || (def.challengeTypes || []).indexOf(a.ans.by) - (def.challengeTypes || []).indexOf(b.ans.by) || b.ans.rank - a.ans.rank);
    const affordable = answers.filter(o => o.ans.cost <= budget);
    const lead = affordable[0] || plain;
    budget -= lead.ans ? lead.ans.cost : flat;
    // the fallbacks, in SNG-333's order: another craft of the same challenge, then one that meets it another way, then the plain way through
    const rest = affordable.filter(o => o !== lead);
    const same = lead.ans ? rest.find(o => o.ans.by === lead.ans.by) : null;
    const other = rest.find(o => o !== same && (!lead.ans || o.ans.by !== lead.ans.by));
    return { kind, action: lead.action, fallbacks: [same, other, lead.ans ? plain : null].filter(Boolean).map(o => o.action),
      answers: answers.map(o => o.ans.name) };
  });
  const assessed = assessGambit(steps.map(s => s.action), ctx);
  let weakIndex = assessed.weakIndex, readBy = weakIndex != null ? "read" : null;
  if (weakIndex == null && assessed.steps.length) {
    const reader = (character.abilities || []).map(a => a?.abilityId).find(id => (G.readers || []).includes(id));
    if (reader) {
      weakIndex = assessed.steps.reduce((m, s, i) => s.chance < assessed.steps[m].chance ? i : m, 0);
      readBy = abilities?.[reader]?.name || reader;
    }
  }
  return { legIndex: leg.i, fromId: leg.fromId, fromName: leg.fromName, toId: leg.toId, toName: leg.toName, danger: leg.danger, days: round1(leg.days),
    steps: steps.map((s, i) => ({ ...s, chance: assessed.steps[i].chance, sense: assessed.steps[i].sense })), weakIndex, readBy };
}

/** ⛔ GO AROUND — the road to the journey's end that does not pass through the perilous place, offered only when it is a real way round
 *  (no more than `altFactor` of what is left) and never when the perilous place IS the journey's end. `option` is a way as `planJourney` takes
 *  one; `days` is what it will take this traveller. Null otherwise. Pure. */
export function aroundLeg(plan, leg, locations = {}, { altFactor = 1.6, march = 0 } = {}) {
  if (!plan || !leg || leg.toId === plan.destId) return null;
  const r = roadRoute(leg.fromId, plan.destId, locations, { banned: [leg.toId] });
  if (!r?.path?.length || r.path.includes(leg.toId)) return null;
  const ahead = (chosenWay(plan)?.legs || []).slice(Number(plan.underway?.legIndex) || 0).reduce((n, l) => n + (Number(l.days) || 0), 0);
  const days = r.days * (1 - (Number(march) || 0));
  if (!(ahead > 0) || days > ahead * altFactor) return null;
  return { days: round1(days), avoids: leg.toId, option: { kind: "road", label: `around ${leg.toName}`, days: r.days, energy: 0, legs: r.legs, path: r.path, avoids: leg.toId } };
}

/** The leg's gambit, as the road remembers it: how it came through, step by step. Mutates the plan. */
export function noteLegGambitOn(plan, gambit, receipts = [], outcome = "clean") {
  const u = plan?.underway;
  if (!u || !gambit) return null;
  const note = { outcome, steps: (receipts || []).map(r => `${r.viaFallback || r.action?.label || gambit.steps[r.index]?.action?.label || `step ${r.index + 1}`} — ${String(r.degree || "").replace("_", " ")}`) };
  const rec = [...(u.legs || [])].reverse().find(l => l.toId === gambit.toId);
  if (rec) rec.gambit = note;
  return note;
}

/** The road stopped where the traveller stands — `why`: "encounter", "step" (a step of a perilous leg broke) or "chose". Mutates the plan. */
export function stopRoadOn(plan, { atId = null, atName = null, why = "encounter", note = null, worldDay = null } = {}) {
  const u = plan?.underway;
  if (!u) return null;
  const stop = { atId, atName, why, note, worldDay, daysWalked: round1(u.daysWalked), legsWalked: (u.legs || []).length };
  u.stops = [...(u.stops || []), stop].slice(-12);
  return stop;
}

/** The road so far and what is left of it, in counts — legs, days, rations, the worst ahead. Pure. */
export function roadProgress(plan, { rules = {} } = {}) {
  const u = plan?.underway || null;
  const ahead = (chosenWay(plan)?.legs || []).slice(u ? Number(u.legIndex) || 0 : 0);
  const daysAhead = ahead.reduce((n, l) => n + (Number(l.days) || 0), 0);
  const worst = ahead.reduce((w, l) => (Number(l.danger) || 0) > (Number(w?.danger) || 0) ? l : w, null);
  const walked = (u?.legs || []).length;
  // "days out" counts a day the road has reached into, as hunger does — so the hungry days can never read more than the days walked
  return { walked, total: walked + ahead.length, legsAhead: ahead.length, daysWalked: round1(u?.daysWalked || 0), daysOut: Number(u?.countedDays) || 0, daysAhead: round1(daysAhead),
    // a stretch under a tenth of a day (a place inside a place) is a step: it asks for no ration and reads as no days
    rationsAhead: daysAhead < 0.1 ? 0 : rationsFor(Math.max(0, daysAhead - (Number(u?.foodDaysLeft) || 0)), rules), hungryDays: Number(u?.hungryDays) || 0,
    at: (u?.legs || []).slice(-1)[0]?.toName || u?.fromName || plan?.fromName || null,
    worstAhead: worst && (Number(worst.danger) || 0) >= 2 ? { name: worst.toName, danger: worst.danger } : null,
    perilousAhead: ahead.filter(l => legEarnsGambit(l, rules)).map(l => l.toName) };
}

/** The road in one line — the card and the quest log read it. Pure. */
export function roadLine(plan, { carried = null, rules = {} } = {}) {
  const p = roadProgress(plan, { rules });
  const bits = [`${p.walked} of ${plural(p.total, "leg")} walked, ${plural(p.daysOut, "day")} out`, `you are at ${p.at}`];
  if (p.legsAhead && p.daysAhead < 0.1) bits.push(`${plan?.destName || "the end of it"} is a step from here`);
  else if (p.legsAhead) bits.push(`about ${p.daysAhead} days ahead${p.rationsAhead ? `, ${plural(p.rationsAhead, "ration")} for it — you carry ${carried ?? "?"}${carried != null && carried < p.rationsAhead ? ` (${p.rationsAhead - carried} short)` : ""}` : ""}`);
  if (p.hungryDays) bits.push(`${plural(p.hungryDays, "day")} walked hungry so far`);
  if (p.perilousAhead.length) bits.push(p.perilousAhead.length === 1 ? `a leg ahead into perilous country (${p.perilousAhead[0]}), taken as a plan`
    : `${p.perilousAhead.length} legs ahead into perilous country (${p.perilousAhead.join(", ")}), each taken as a plan`);
  return bits.join(" · ");
}

/** The perilous legs of a way not yet walked — the plan's card warns of them. Pure. */
export function perilousLegsOf(plan, rules = {}) {
  return (chosenWay(plan)?.legs || []).filter(l => legEarnsGambit(l, rules)).map(l => ({ toName: l.toName, danger: l.danger }));
}

/** A line on the journey's quest, and the quest's summary follows the road. Mutates. */
export function noteRoadOn(character, plan, text, { carried = null, rules = {} } = {}) {
  const q = plan && (character?.quests || []).find(x => x && x.id === plan.id);
  if (!q) return null;
  if (text) q.progress = [...(q.progress || []), text].slice(-8);
  if (plan.underway && q.status === "active") q.summary = `On the road: ${roadLine(plan, { carried, rules })}.`;
  return q;
}

/** ⛔ END THE JOURNEY HERE — the quest settled with how far it got, and the plan spent. Mutates. Returns the record line. */
export function endJourneyOn(character, { atName = null } = {}) {
  const plan = character?.journey;
  if (!plan?.underway) return null;
  const p = roadProgress(plan);
  const line = `Ended at ${atName || p.at} — ${p.walked} of ${plural(p.total, "leg")} walked, ${plural(p.daysOut, "day")} on the road.`;
  const q = (character.quests || []).find(x => x && x.id === plan.id);
  if (q && q.status === "active") { q.status = "resolved"; q.progress = [...(q.progress || []), line].slice(-8); }
  character.journey = null;
  return line;
}

/** What the whole road was, for the arrival scene: the days, the path walked, the food, the nights, how each perilous leg came through and
 *  where the road stopped. Pure. */
export function roadOutcome(plan, character, { rules = {}, abilities = {} } = {}) {
  const u = plan?.underway || {};
  const legs = u.legs || [];
  const crafts = journeyCraftsOf(character, rules, abilities);
  const nights = Math.floor(Number(u.daysWalked) || 0);
  const roofs = Math.min(nights, legs.slice(0, -1).filter(l => l.roof).length);
  return { destId: plan?.destId, days: round1(u.daysWalked), path: [u.fromId, ...legs.map(l => l.toId)].filter(Boolean),
    rationsEaten: Number(u.rationsEaten) || 0, rationsShort: (Number(u.foraged) || 0) + (Number(u.hungryDays) || 0),
    foraged: Number(u.foraged) || 0, hungryDays: Number(u.hungryDays) || 0, nights, roofs, camps: nights - roofs,
    legGambits: legs.filter(l => l.gambit).map(l => ({ toName: l.toName, outcome: l.gambit.outcome })),
    stops: (u.stops || []).map(s => ({ atName: s.atName, why: s.why })),
    carriedBy: Object.fromEntries(Object.entries(crafts).filter(([, v]) => v.by.length).map(([k, v]) => [k, v.by.map(b => b.name)])) };
}

/** ⛔ A STEP THAT BREAKS DOES NOT END THE JOURNEY — the scene the failure implies, where it happened; the road waits (or, when the perilous
 *  place was the journey's end, they have arrived into it). Pure. */
export function legFailurePrompt(plan, gambit, step, receipt, { rules = {}, arrived = false } = {}) {
  const G = roadRules(rules);
  const u = plan?.underway || {};
  const def = G.steps[step?.kind] || {};
  const leg = { toName: gambit?.toName, fromName: gambit?.fromName };
  const label = receipt?.action?.label || step?.action?.label || "a step of the plan";
  return `(The character is on a journey from ${u.fromName || plan?.fromName} to ${plan?.destName}, ${round1(u.daysWalked || 0)} days on the road, and stands at ${gambit?.toName}. `
    + `The leg into ${gambit?.toName} — ${dangerWord(gambit?.danger)} country — was taken as a plan, and a step broke: "${label}" — ${String(receipt?.degree || "failure").replace("_", " ")}. `
    + `${fill(def.failed, leg)} Open the scene INSIDE that failure: it is happening now, here. `
    + (arrived
      ? "This place was the journey's end: they have arrived, into this."
      : "The journey is not over and not lost — it waits, and the player takes it up again from the journey card once this is played out. Never move them on, and never walk the rest of the road for them.")
    + ")";
}

/** What the GM is told while a journey is on the road and stopped: where it stands, why, and what is left. Null otherwise. Pure. */
export function journeyUnderwayForGM(character, { rules = {} } = {}) {
  const plan = character?.journey, u = plan?.underway;
  if (!u) return null;
  const p = roadProgress(plan, { rules });
  const stop = (u.stops || []).slice(-1)[0] || null;
  const why = !stop ? "it has not gone on yet"
    : stop.why === "encounter" ? "what the road held stopped it there"
    : stop.why === "step" ? `a step of the leg in broke there${stop.note ? ` (${stop.note})` : ""}`
    : "the player stopped there";
  return `- ${u.fromName} → ${plan.destName}: ${p.walked} of ${plural(p.total, "leg")} walked and ${plural(p.daysOut, "day")} on the road; the character stands at ${stop?.atName || p.at} — ${why}. `
    + (p.daysAhead < 0.1 ? `${plan.destName} is a step from there.` : `About ${p.daysAhead} days remain${p.worstAhead ? `, the worst of it ${p.worstAhead.name} (${dangerWord(p.worstAhead.danger)})` : ""}.`);
}
