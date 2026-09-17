// journeyplan.js — ⛔ CCODE-387 (Erik 2026-09-16): A JOURNEY IS AGREED, THEN READIED, THEN WALKED.
//
// Erik: "setting up a journey, or agreeing to travel somewhere needs to not be instantaneous all the time - it should be that you can
// agree to go on a journey and it logs it as a task... like a one step quest... that gives you time to stock up, collect your people,
// organize the trip, then begin the journey." — the plan he and Aevi specced as SNG-331 (the journey panel, "a plan you accept") and
// SNG-333 (a leg as a gambit).
//
// ⚑ MEASURED: every trip cost `ADVANCE.travel` — THREE HOURS — whatever the distance. The map printed "about 74 days on foot" under a
// "Travel here (+3h)" button; `routeBetween` measured the real ways there and only a note to the GM ever read it; `dried_rations` were
// eaten by nothing.
//
// ⛑ A TRIP OF A DAY'S WALK OR MORE IS A JOURNEY:
//   · agreeing to it LOGS A PLAN (`planJourney`) — a one-step quest and a card on the play screen: the ways there as `routeBetween`
//     measures them (never invented), the days, the rations it needs against what is carried, the nights under a roof and in the open,
//     the worst of the road, and who walks with them;
//   · the character STAYS where they are — to buy rations, gather their people, settle what they are leaving;
//   · SETTING OUT (`journeyOutcome`) spends the road: the days pass on the character's own clock, the rations are eaten, a shortfall costs
//     energy and health on arrival — a forage roll finds some of it, and running out costs, it never kills (SNG-331 §2) — a gate's toll
//     is paid, and every place on the path becomes known.
// A shorter walk stays a step, as it was. ⬜ A dangerous leg played as a gambit (SNG-333) is the next stage.
//
// The dials sit in `rules.journey` when authored; the fallbacks below are the item's own words ("Two days if you're honest with
// yourself") and SNG-331's rule that hunger is attrition.

import { routeBetween } from "./journey.js";

export const JOURNEY_DEFAULTS = Object.freeze({
  minDays: 1,                          // under a day's walk is a step, not a journey
  daysPerProvision: 2,                 // dried_rations: "Two days if you're honest with yourself"
  provisionItems: ["dried_rations"],
  hungryEnergyPerDay: 0.08,            // each day with nothing to eat takes this share off the energy you arrive with…
  hungryEnergyMax: 0.6,                // …never more than this
  hungryHealthGraceDays: 2,            // and after this many hungry days, a point of health a day…
  hungryHealthMaxShare: 0.3,           // …never more than this share of the body: running out COSTS, it never kills (SNG-331 §2)
  forageBase: 0.15, foragePerWits: 0.05, forageMax: 0.6,
  // ⛔ ERIK, on hunger: "there are travel and gathering skills that would be more useful with it." AEVI's staged `journey_skills`
  // (SNG-331) says what each one DOES on the road; these read it, by the rank the character holds. The ids are hers.
  crafts: {
    forage: { greenlore: 0.15, lifesense: 0.1, beastfriend: 0.08 },   // + to each hungry day's forage roll, per rank — "forage on the move"
    march: { long_road: 0.08 },                                         // − a share of the road's days, per rank — "marches further per day"
    endureHealth: { staunch: 0.25 },                                    // − a share of what hunger takes from the body, per rank — "the road hurts you"
    endureEnergy: { second_wind: 0.25 },                                // − a share of what hunger takes from energy, per rank — "one more leg"
    shelter: { wildcraft: 1, safe_ground: 1, the_laid_ground: 1 },      // a night in the open made into a camp worth the name — told, not yet counted
  },
  craftCeiling: { forage: 0.9, march: 0.3, endureHealth: 0.75, endureEnergy: 0.75 },
});

/** The journey dials in force: authored `rules.journey` over the defaults. Pure. */
export function journeyRules(rules = {}) {
  return { ...JOURNEY_DEFAULTS, ...((rules && rules.journey && typeof rules.journey === "object") ? rules.journey : {}) };
}

const round1 = (n) => Math.round(Number(n) * 10) / 10;
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** How many rations a stretch of days eats. Pure. */
export function rationsFor(days, rules = {}) {
  const d = Math.max(0, Number(days) || 0);
  return d <= 0 ? 0 : Math.ceil(d / Math.max(0.1, Number(journeyRules(rules).daysPerProvision) || 2));
}

/** Is this inventory stack a ration for the road: its id is a provision, or — for an item with no id — its name is one. Pure. */
export function isProvision(it, rules = {}, catalog = {}) {
  if (!it) return false;
  const ids = new Set(journeyRules(rules).provisionItems || []);
  if (it.id) return ids.has(it.id);
  const names = new Set([...ids].map(id => norm(catalog?.[id]?.name || id.replace(/_/g, " "))));
  return names.has(norm(it.name));
}

/** The rations a character carries. Pure. */
export function provisionsCarried(character, rules = {}, catalog = {}) {
  let n = 0;
  for (const it of character?.inventory || []) if (isProvision(it, rules, catalog)) n += Math.max(0, Number(it.qty) || 1);
  return n;
}

/** ⛔ THE CRAFTS THAT CARRY A ROAD — the character's own, by what they do on it: `{ forage, march, endureHealth, endureEnergy, shelter }`,
 *  each `{ share, by: [{ id, name, rank }] }` with the share capped. `abilities` names them. Pure. */
export function journeyCraftsOf(character, rules = {}, abilities = {}) {
  const R = journeyRules(rules);
  const held = new Map((character?.abilities || []).filter(a => a?.abilityId).map(a => [a.abilityId, Math.max(1, Number(a.level) || 1)]));
  const out = {};
  for (const [use, table] of Object.entries(R.crafts || {})) {
    const by = [];
    let share = 0;
    for (const [id, per] of Object.entries(table || {})) {
      if (!held.has(id)) continue;
      const rank = held.get(id);
      share += (Number(per) || 0) * rank;
      by.push({ id, name: abilities?.[id]?.name || id.replace(/_/g, " "), rank });
    }
    const cap = Number(R.craftCeiling?.[use]);
    out[use] = { share: Number.isFinite(cap) ? Math.min(cap, share) : share, by };
  }
  return out;
}

/** Is a measured route a journey — its quickest way a day's walk or more? Pure. */
export function isJourneyRoute(route, rules = {}) {
  const quickest = (route?.options || [])[0];
  return !!quickest && Number(quickest.days) >= (Number(journeyRules(rules).minDays) || 1);
}

/** A way there, as the plan shows it: the days, the worst danger on the path, and the nights — under a roof where a stop on the way is
 *  a place people live, in the open otherwise. Pure. */
function wayOf(o, i, locations) {
  const path = Array.isArray(o.path) ? o.path : [];
  let worst = null;
  for (const id of path.slice(1)) {
    const l = locations?.[id];
    const dl = Number(l?.dangerLevel) || 0;
    if (dl > 0 && (!worst || dl > worst.level)) worst = { id, name: l?.name || id, level: dl };
  }
  const nights = Math.max(0, Math.floor(Number(o.days) || 0));
  const stops = path.slice(1, -1).filter(id => !!locations?.[id]?.communityId).length;
  const roofs = Math.min(nights, stops);
  return { key: `${o.kind}-${i}`, kind: o.kind, label: o.label, days: round1(o.days), energy: Number(o.energy) || 0, path, gate: o.gate || null,
    worst, nights, roofs, camps: nights - roofs };
}

/** ⛔ AGREEING TO A JOURNEY: the plan it logs. Null when the way cannot be measured, or the trip is a step rather than a journey. Pure. */
export function planJourney({ character, destId, locations = {}, rules = {}, catalog = {}, worldDay = null, route = null, companyNames = [], abilities = {} } = {}) {
  const fromId = character?.currentLocationId;
  if (!fromId || !destId || fromId === destId || !locations[fromId] || !locations[destId]) return null;
  const r = route || routeBetween(fromId, destId, locations, { traveller: character });
  if (!isJourneyRoute(r, rules)) return null;
  // a marcher's road is shorter: the WALKED days shrink, a gate's hours do not
  const crafts = journeyCraftsOf(character, rules, abilities);
  const march = crafts.march?.share || 0;
  const options = r.options.map((o, i) => wayOf(march ? { ...o, days: o.kind === "gate"
    ? (Number(o.walkIn || 0) + Number(o.walkOut || 0)) * (1 - march) + (Number(o.gate?.hours) || 0) / 24
    : Number(o.days) * (1 - march) } : o, i, locations));
  const chosen = options[0];
  return {
    id: `journey-${destId}-${worldDay ?? "x"}`, destId, destName: locations[destId]?.name || destId, fromId, fromName: locations[fromId]?.name || fromId,
    createdWorldDay: worldDay, options, chosenKey: chosen.key, soleWay: !!r.soleOption,
    rations: { needed: rationsFor(chosen.days, rules), carried: provisionsCarried(character, rules, catalog) },
    company: (companyNames || []).filter(Boolean),
    // who carries the road, by name — the card and the arrival both say it
    crafts: Object.fromEntries(Object.entries(crafts).filter(([, v]) => v.by.length).map(([k, v]) => [k, v.by.map(b => b.name)])),
  };
}

/** The way the plan is set to take. Pure. */
export function chosenWay(plan) {
  return (plan?.options || []).find(o => o.key === plan.chosenKey) || (plan?.options || [])[0] || null;
}

/** Choose another of the plan's ways; the rations it needs follow. Returns the plan. */
export function chooseWay(plan, key, rules = {}) {
  if (!plan || !(plan.options || []).some(o => o.key === key)) return plan;
  plan.chosenKey = key;
  plan.rations = { ...(plan.rations || {}), needed: rationsFor(chosenWay(plan).days, rules) };
  return plan;
}

const dangerWord = (lvl) => lvl >= 4 ? "deadly" : lvl >= 3 ? "perilous" : lvl >= 2 ? "dangerous" : "uneasy";
const listed = (xs) => xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs.join("");

/** The plan in one line — the card, the quest log and the GM all read this. Pure. */
export function journeyLine(plan, { carried = null } = {}) {
  const w = chosenWay(plan);
  if (!w) return "";
  const have = carried ?? plan.rations?.carried ?? 0, need = plan.rations?.needed ?? 0;
  const bits = [`about ${w.days} day${w.days === 1 ? "" : "s"} ${w.label}${w.energy ? ` (${w.energy} energy at the gate)` : ""}`];
  bits.push(need ? `${need} ration${need === 1 ? "" : "s"} for the road — you carry ${have}${have < need ? ` (${need - have} short)` : ""}` : "no rations needed");
  if (w.nights) bits.push(w.roofs ? `${w.camps} night${w.camps === 1 ? "" : "s"} in the open, ${w.roofs} under a roof` : `${w.nights} night${w.nights === 1 ? "" : "s"} in the open`);
  if (w.worst) bits.push(`the worst of the road: ${w.worst.name} (${dangerWord(w.worst.level)})`);
  bits.push(plan.company?.length ? `with ${listed(plan.company)}` : "alone");
  const c = plan.crafts || {};
  const carriedBy = [c.march?.length ? `${listed(c.march)} shortens the road` : null, c.forage?.length ? `${listed(c.forage)} forages on the move` : null,
    c.shelter?.length ? `${listed(c.shelter)} makes camp` : null, c.endureHealth?.length || c.endureEnergy?.length ? `${listed([...(c.endureHealth || []), ...(c.endureEnergy || [])])} bears the hunger` : null].filter(Boolean);
  if (carriedBy.length) bits.push(carriedBy.join("; "));
  return bits.join(" · ");
}

/** ⛔ THE ONE-STEP QUEST a journey is logged as. Pure. */
export function journeyQuest(plan, { nowISO = null, day = null, carried = null } = {}) {
  return { id: plan.id, kind: "journey", structured: false, status: "active", title: `Journey to ${plan.destName}`,
    summary: `${journeyLine(plan, { carried })}. Ready yourself — rations, your people, what you leave behind — and set out when you are ready.`,
    progress: [], giver: null, startedAt: nowISO, startedAtDay: day, journeyDestId: plan.destId };
}

/** ⛔ THE QUEST'S DOORS, in one place — the app never reaches into the quest list (§189 counts that). Log a journey: the plan on the
 *  character and its one-step quest; a new plan replaces the active one. Mutates. */
export function logJourneyOn(character, plan, { nowISO = null, day = null, carried = null } = {}) {
  if (!character || !plan) return null;
  const quests = Array.isArray(character.quests) ? character.quests : (character.quests = []);
  for (let i = quests.length - 1; i >= 0; i--) if (quests[i]?.kind === "journey" && quests[i].status === "active") quests.splice(i, 1);
  quests.push(journeyQuest(plan, { nowISO, day, carried }));
  character.journey = plan;
  character._pendingArrival = null;
  return plan;
}

/** The quest's line follows the plan — a way chosen, rations bought. Mutates. */
export function refreshJourneyOn(character, { carried = null } = {}) {
  const plan = character?.journey;
  const q = plan && (character.quests || []).find(x => x && x.id === plan.id);
  if (q) q.summary = journeyQuest(plan, { carried }).summary;
  return q || null;
}

/** Stay: the plan and its quest go. Returns the plan that was dropped. Mutates. */
export function dropJourneyOn(character) {
  const plan = character?.journey || null;
  if (!plan) return null;
  character.journey = null;
  if (Array.isArray(character.quests)) character.quests = character.quests.filter(q => !(q && q.id === plan.id));
  return plan;
}

/** Arrived: the quest is completed with what the road was, and the plan is spent. Mutates. */
export function completeJourneyOn(character, plan, note = null) {
  const q = plan && (character?.quests || []).find(x => x && x.id === plan.id);
  if (q) { q.status = "completed"; if (note) q.progress = [...(q.progress || []), note]; }
  if (character) character.journey = null;
  return q || null;
}

/** ⛔ SETTING OUT: what the road costs. `rng` for the forage rolls. Pure. */
export function journeyOutcome(plan, character, { rules = {}, catalog = {}, rng = Math.random, abilities = {} } = {}) {
  const w = chosenWay(plan);
  if (!w) return null;
  const R = journeyRules(rules);
  const crafts = journeyCraftsOf(character, rules, abilities);
  const needed = rationsFor(w.days, rules);
  const carried = provisionsCarried(character, rules, catalog);
  const eaten = Math.min(needed, carried);
  const shortDays = Math.min(Math.ceil(w.days), Math.max(0, (needed - eaten) * (Number(R.daysPerProvision) || 2)));
  const wits = Number(character?.subAttributes?.wits ?? character?.attributes?.practical ?? 2) || 0;
  // the wits of the one who walks, and — above what wits alone can find — the gathering crafts they hold
  const byWits = Math.min(Number(R.forageMax) || 0.6, (Number(R.forageBase) || 0) + (Number(R.foragePerWits) || 0) * wits);
  const chance = Math.max(0, Math.min(Number(R.craftCeiling?.forage) || 0.9, byWits + (crafts.forage?.share || 0)));
  let foraged = 0;
  for (let i = 0; i < shortDays; i++) if (rng() < chance) foraged++;
  const hungryDays = shortDays - foraged;
  return {
    destId: plan.destId, wayKey: w.key, days: w.days, hours: Math.round(w.days * 24), gateEnergy: w.energy || 0, path: w.path,
    rationsEaten: eaten, rationsShort: needed - eaten, foraged, hungryDays,
    energyShare: 1 - Math.min(Number(R.hungryEnergyMax) || 0.6, (Number(R.hungryEnergyPerDay) || 0) * hungryDays) * (1 - (crafts.endureEnergy?.share || 0)),
    healthLoss: Math.floor(Math.min(Math.max(0, hungryDays - (Number(R.hungryHealthGraceDays) || 0)),
      Number(character?.maxHealth) > 0 ? Math.floor(Number(character.maxHealth) * (Number(R.hungryHealthMaxShare) || 0.3)) : Infinity) * (1 - (crafts.endureHealth?.share || 0))),
    forageChance: Math.round(chance * 100) / 100,
    carriedBy: Object.fromEntries(Object.entries(crafts).filter(([, v]) => v.by.length).map(([k, v]) => [k, v.by.map(b => b.name)])),
  };
}

/** What the GM is told while a journey is planned and the character has not set out. Null with none. Pure. */
export function journeyForGM(character) {
  const plan = character?.journey;
  if (!plan?.destId) return null;
  return `- ${plan.fromName} → ${plan.destName}: ${journeyLine(plan)}.`;
}

/** The instruction that opens the arrival scene, with what the road was. Pure. */
export function journeyArrivalPrompt(plan, outcome, { names = [] } = {}) {
  const w = chosenWay(plan);
  const via = (outcome?.path || []).slice(1, -1).map(id => names[id] || null).filter(Boolean);
  const food = outcome?.rationsShort
    ? ` The rations ran short: ${outcome.foraged ? `foraging found ${outcome.foraged} day${outcome.foraged === 1 ? "" : "s"} of food, and ` : ""}${outcome.hungryDays} day${outcome.hungryDays === 1 ? " was" : "s were"} walked hungry — let it show in how they arrive; the engine has already taken its cost.`
    : " They ate on the road as they planned.";
  const cb = outcome?.carriedBy || {};
  const crafts = [cb.march?.length ? `${listed(cb.march)} kept the pace` : null, cb.forage?.length && outcome?.foraged ? `${listed(cb.forage)} found food along the way` : null,
    cb.shelter?.length ? `${listed(cb.shelter)} made the camps` : null].filter(Boolean);
  return `(The character has arrived at the end of a journey: ${outcome.days} days from ${plan.fromName} to ${plan.destName}, ${w?.label || "on foot"}${via.length ? `, through ${listed(via)}` : ""}${plan.company?.length ? `, with ${listed(plan.company)}` : ""}. ${w?.nights ? `${w.camps} night${w.camps === 1 ? "" : "s"} were spent in the open${w.roofs ? ` and ${w.roofs} under a roof` : ""}.` : ""}${food}${crafts.length ? ` Their crafts carried the road: ${crafts.join("; ")}.` : ""} Open the scene with the arrival; the road itself can be a short passage, never a new danger — the engine has already asked what the road held.)`;
}
