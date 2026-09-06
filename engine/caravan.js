// caravan.js — R49 / the journey build §4: TRADE, WHICH IS NOT A NEW ECONOMY BUT A ROAD TO PRICES THIS GAME
// ALREADY HAS.
//
// ⛔ THE FINDING THIS EXISTS FOR. The same 8 units of raw material, sold at the hold, is worth 32 in the valley
// and 115 in the Gearlands — a 3.6x differential, authored, live, and gated behind ONE line in `sellStore`:
// *"the store is at the hold; you sell where it stands, and nothing moves it yet."* ⚑ This is the thing that
// moves it. Nothing here invents an economy; four built things are joined.
//
// ⚑ A CARAVAN IS A DELEGATE + A ROUTE + A LOAD. `activeDelegates` already models the person who runs something
// while you are elsewhere, `routeBetween` gives the road, `holding.store` is the load, and `sellStore`'s
// regional pricing is the payoff. ⛔ AND IT IS WHERE THE TRAVEL CRAFTS FINALLY PAY — for someone who is not
// the player, which was Erik's whole ask: *"finally USE the travel skills for more than PC or party travel."*
//
// ⛔ WHAT A ROBBED CARAVAN COSTS — ERIK'S RULING (2026-09-06): *"seems like a caravan should lose a share from
// a normal raid, but I could see a special circumstance, like a crit failure where you lose it all —
// especially if all your people get killed."*
//
// ⚑ SO THE TOTAL LOSS FOLLOWS THE FICTION RATHER THAN A SECOND DIE: you lose everything when the escort is
// WIPED IN A FIGHT YOU LOST, because there is nobody left to carry it and nobody left to argue. ⚠️ Measured,
// his two clauses are one event: at a rout the personal risk is 0.95, so an escort of two is wiped 90% of the
// time and one of five 77% — a crit failure USUALLY kills everyone, and where it does not, someone walked out
// with a share of the load, which is exactly right.
//
// ⛔ AND WINNING PROTECTS THE LOAD, WHATEVER IT COST. Measured: `personalRisk` has a FLOOR of 0.12 — Erik's own
// rule that you can die in a battle you are winning — so "wiped means total loss" on its own would take the
// whole load off a caravan that WON, 12% of the time with a single carrier. The hold model already answers
// this: beat them off and they take NOTHING. A carrier can die on a won road and the goods still arrive.

import { legionClash, contingentsFromPeople } from "./melee.js";
import { unitWorth } from "./holdings.js";
import { credit } from "./purse.js";
import { enterDeathState } from "./death.js";
import { routeBetween } from "./journey.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/** Every caravan on the road, plus the ones that have finished and not yet been read. */
export function caravansOf(character) {
  return Array.isArray(character?.caravans) ? character.caravans : [];
}
function ensureCaravans(character) {
  if (!Array.isArray(character.caravans)) character.caravans = [];
  return character.caravans;
}

/** ⚠️ THE DANGER OF A ROAD IS THE ROAD'S OWN, not the region's average. 127 of 135 places carry a
 *  `dangerLevel` (0-5, mean 2.28), and a route through the Unmade should not read like a route through the
 *  valley because they share a Reach. ⛑ The WORST place on the path sets it: a road is as safe as its
 *  ugliest mile, which is what makes the two named options a real decision rather than a preference. */
export function roadDanger(path = [], locations = {}) {
  let worst = 0;
  for (const id of path) worst = Math.max(worst, num(locations[id]?.dangerLevel, 0));
  return worst;
}

/** ⛔ THE LOAD COMES OFF THE STORE AT DEPARTURE. A load that stayed on the hold until arrival could be sold
 *  twice — once where it stands and once where it is going — which is the shape of every duplication bug this
 *  project has had. ⚑ It is on the road or it is at the hold; never both.
 *
 *  ⚠️ AND THE CARRIERS ARE NAMED PEOPLE, because Erik ruled they can die and an anonymous loss is not a
 *  consequence. `carriers` are npcIds; an empty escort is allowed and is its own answer — see `tickCaravans`. */
export function sendCaravan(character, {
  holdingId, toId, goods = null, carriers = [], locations = {}, cfg = null, day = null, traveller = null,
} = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!h.locationId) return { ok: false, why: "that holding is not anywhere yet — it has no road out" };
  if (!locations[h.locationId]) return { ok: false, why: "the hold's place is not on the map" };
  if (!locations[toId]) return { ok: false, why: "nowhere by that name" };
  if (toId === h.locationId) return { ok: false, why: "the load is already there" };

  const route = routeBetween(h.locationId, toId, locations, { traveller: traveller || character });
  const leg = route?.options?.[0];
  if (!leg) return { ok: false, why: "no way there from the hold" };

  // ⛔ TAKE THE LOAD OFF THE STORE NOW, and refuse rather than send an empty cart.
  const load = {};
  for (const [g, n] of Object.entries(h.store || {})) {
    if (goods && g !== goods) continue;
    const units = Math.floor(num(n));
    if (units > 0) { load[g] = units; delete h.store[g]; }
  }
  if (!Object.keys(load).length) return { ok: false, why: goods ? `the store holds no ${goods}` : "the store is empty" };

  const car = {
    id: `car-${h.id}-${day ?? 0}-${Object.keys(load).join("+")}`.slice(0, 64),
    holdingId: h.id, from: h.locationId, to: toId,
    load, carriers: [...new Set(carriers.filter(Boolean))],
    routeKind: leg.kind, routeLabel: leg.label, days: leg.days,
    path: leg.path || [h.locationId, toId],
    danger: roadDanger(leg.path || [], locations),
    departedDay: day, arriveDay: day == null ? null : Math.round(num(day) + num(leg.days)),
    lastTickDay: day, status: "travelling", events: [],
  };
  ensureCaravans(character).push(car);
  return { ok: true, caravan: car, route };
}

/** ⚑ WHO IS STILL ON THEIR FEET. A carrier who died on an earlier leg does not defend the next one. */
export function standingCarriers(car, people = {}, character = null) {
  return (car?.carriers || [])
    .map(id => people?.[id] || character?.npcRegistry?.[id] || null)
    .filter(p => p && p.status !== "dead");
}

/** ⛔ ONE HAZARD ON THE ROAD, RESOLVED THE WAY A RAID ON A HOLD IS — a FIGHT, unattended, at band scale. Not a
 *  subtraction, because R46a settled that a raid is a fight and a caravan is a store that moved.
 *
 *  ⚑ ERIK'S RULING, ENCODED: a normal loss takes a SHARE; the escort being wiped in a LOST fight takes it ALL.
 *  ⛔ Winning takes nothing, whatever it cost in people — the floor on `personalRisk` means a won fight can
 *  still kill a carrier, and a model where that lost the load would punish victory.
 *
 *  ⚠️ AND `personalRisk` HAS NEVER BEEN READ BY ANYTHING. `legionClash` has computed and returned it since it
 *  was written, with a comment arguing hard for why it must have a floor, and no module in the engine ever
 *  looked at it. This is its first consumer, and it is the thing that makes Erik's ruling mean something. */
export function resolveRoadHazard(character, car, { rng = Math.random, cfg = null, people = {}, day = null } = {}) {
  const raidCfg = cfg?.raid || {};
  const baseShare = Number.isFinite(Number(raidCfg.takeShare)) ? Number(raidCfg.takeShare) : 0.5;
  const escort = standingCarriers(car, people, character);

  const take = (share) => {
    const taken = {};
    for (const [g, n] of Object.entries(car.load || {})) {
      const t = share >= 1 ? num(n) : Math.floor(num(n) * share);
      if (t > 0) { car.load[g] = num(n) - t; taken[g] = t; }
      if (!(num(car.load[g]) > 0)) delete car.load[g];
    }
    return taken;
  };

  // ⛔ NOBODY WALKING WITH IT IS ITS OWN ANSWER — the same shape as a hold with no watch: they take what they
  // came for, and there is no fight to have. ⚠️ Not a total loss: Erik's total loss is people DYING, and an
  // unescorted cart has nobody to kill. It is simply a bad way to move goods.
  if (!escort.length) {
    const taken = take(baseShare);
    car.events.push({ at: day, what: `set upon with nobody walking beside it — ${describe(taken)} taken` });
    return { fought: false, held: false, wiped: false, taken, fallen: [] };
  }

  const defenders = contingentsFromPeople(escort, { levelOf: (p) => num(p?.level, 1) });
  const d = Math.max(1, Math.round(num(car.danger, 1)));
  const raiders = [{ n: d, quality: Math.max(1, Math.round(d / 2)), what: "raiders" }];
  const clash = legionClash(defenders, raiders, { rng, cfg: raidCfg.clash || {} });
  const held = clash.tide > 0.05;

  // ⚑ WHO FELL — a function of the tide, not of their own roll. This is `personalRisk`'s first reader.
  const fallen = [];
  for (const p of escort) {
    if (rng() < clamp01(clash.personalRisk)) {
      fallen.push(p.id || p.name || "someone");
      const rec = people?.[p.id] || character?.npcRegistry?.[p.id] || p;
      if (rec) enterDeathState(rec, { diedDay: day, cause: `killed on the road, escorting a load out of ${car.from}` });
    }
  }
  const wiped = fallen.length >= escort.length;

  if (held) {
    // ⛔ BEATEN OFF — they take NOTHING, even if it cost you everyone. R46a's rule, and the reason a won fight
    // does not lose the load: a caravan that wins and buries its dead still arrives with what it carried.
    car.events.push({ at: day, what: fallen.length
      ? `raiders beaten off on the road — ${fallen.length} did not walk on, and not one crate was taken`
      : `raiders beaten off on the road` });
    return { fought: true, held: true, wiped, taken: {}, fallen, outcome: clash.outcome };
  }

  // ⛔ ERIK'S RULING. Wiped in a fight you lost — nobody left to carry it, nobody left to argue.
  const share = wiped ? 1 : baseShare;
  const taken = take(share);
  car.events.push({ at: day, what: wiped
    ? `taken on the road — every hand that walked with it fell, and the whole load went with them`
    : `robbed on the road — ${describe(taken)} taken${fallen.length ? `, and ${fallen.length} did not walk on` : ""}` });
  return { fought: true, held: false, wiped, taken, fallen, outcome: clash.outcome };
}

function describe(taken) {
  const parts = Object.entries(taken || {}).map(([g, n]) => `${n} ${g}`);
  return parts.length ? parts.join(", ") : "nothing";
}

/** ⛑ THE ROAD DIAL, MEASURED RATHER THAN CHOSEN. One hazard roll per day travelled, per point of the road's
 *  worst danger. ⚠️ My first value was 0.04 and it made trade impossible: a 236-day road at danger 4 gets
 *  ~38 encounters, and the load is gone after four. At 0.003 the same road gets ~2.8 — still a near-certain
 *  robbing, which is the honest answer for a 236-day trek through bad country — while a 4-day gate route at
 *  danger 2 gets 0.024, so it is nearly safe.
 *
 *  ⚑ AND THAT GAP IS THE WHOLE DESIGN, measured end to end on the real world with a load worth 115:
 *      a greenhorn walking it   → 236 days, arrives with coin 8-17%, escort wiped 83-92%, ~11 crystal
 *      a wayfarer with the gate →   4 days, arrives with coin 99-100%, escort wiped ~0%, ~114 crystal
 *  ⛔ TRADE IS GATED BEHIND WAYFARING, and that is Erik's ask in one number: *"finally USE the travel skills
 *  for more than PC or party travel."* The crafts do not merely shorten the trip — they are what makes trade
 *  possible at all. A long road through bad country is not a trade route, and the game should say so. */
export const ROAD_HAZARD_PER_DANGER_DAY = 0.003;

/** ⚑ IT RUNS ITSELF WHILE YOU ARE NOT LOOKING — the same promise a hold's growth makes, and the reason a
 *  caravan is worth having rather than a trip you take. One hazard check per day travelled, then arrival.
 *
 *  ⚠️ HAZARD IS PER DAY AND PER THE ROAD'S OWN DANGER, so a long road through bad country is genuinely worse
 *  than a short one — which is the whole reason `routeBetween` returns two options instead of one.
 *
 *  ⛔ ARRIVAL SELLS AT THE DESTINATION'S PRICES, through `credit` — the purse's ONE door in, so trade moves
 *  coin and never mints it. Returns the receipts the news reads. */
export function tickCaravans(character, {
  day = null, locations = {}, economy = null, cfg = null, rng = Math.random, people = {}, perDangerChance = ROAD_HAZARD_PER_DANGER_DAY,
} = {}) {
  const out = [];
  for (const car of caravansOf(character)) {
    if (!car || car.status !== "travelling") continue;
    const now = num(day, 0);
    const elapsed = Math.max(0, Math.min(num(car.days, 0), Math.round(now - num(car.lastTickDay, now))));
    car.lastTickDay = now;

    for (let i = 0; i < elapsed; i++) {
      if (!Object.keys(car.load || {}).length) break;    // nothing left to take
      if (rng() < clamp01(num(car.danger, 0) * perDangerChance)) {
        const r = resolveRoadHazard(character, car, { rng, cfg, people, day: now });
        // ⚑ EACH EVENT CARRIES ITS OWN NOTE. The caller used to reach back for the caravan's latest event,
        // which duplicated an arrival and swallowed the robbing that happened on the way to it.
        out.push({ kind: "hazard", caravanId: car.id, note: car.events[car.events.length - 1]?.what || null, ...r });
      }
    }

    // ⛔ NOTHING LEFT AND NOBODY LEFT IS THE END OF IT. A caravan whose load is gone and whose every carrier
    // is dead is not "on the road" — nobody is walking it and nobody is coming back. Leaving it travelling
    // would have it limp toward an arrival two hundred days away that nothing can reach.
    if (!Object.keys(car.load || {}).length && (car.carriers || []).length && !standingCarriers(car, people, character).length) {
      car.status = "lost";
      car.events.push({ at: now, what: `the road took all of it — nothing of that load, and nobody who carried it, came back` });
      out.push({ kind: "lost", caravanId: car.id, note: car.events[car.events.length - 1].what });
      continue;
    }
    if (car.arriveDay != null && now >= car.arriveDay) {
      const arrival = arriveCaravan(character, car, { locations, economy, cfg, day: now });
      out.push({ kind: "arrival", caravanId: car.id, note: car.events[car.events.length - 1]?.what || null, ...arrival });
    }
  }
  return out;
}

/** ⛔ SOLD WHERE IT STANDS — but it now stands somewhere else, which is the entire point. The differential is
 *  real and authored: 8 raw material is 32 in the valley and 115 in the Gearlands. */
export function arriveCaravan(character, car, { locations = {}, economy = null, cfg = null, day = null } = {}) {
  const dest = locations[car.to];
  const regionId = dest?.regionId || dest?.region || null;
  const sold = {}; let total = 0;
  for (const [g, n] of Object.entries(car.load || {})) {
    const units = num(n);
    if (!(units > 0)) continue;
    const w = unitWorth(g, { economy, regionId, cfg });
    if (!w) continue;
    const val = Math.round(units * w.each);
    if (val <= 0) continue;
    sold[g] = { units, crystal: val, need: w.need, scarcity: w.scarcity };
    total += val;
  }
  car.load = {};
  car.status = total > 0 ? "arrived" : (Object.keys(sold).length ? "arrived" : "robbed");
  car.arrivedDay = day;
  if (!total) {
    car.events.push({ at: day, what: `reached ${dest?.name || car.to} with nothing left to sell` });
    return { ok: false, why: "it arrived empty", sold: {}, crystal: 0, regionId };
  }
  const cr = credit(character, "crystal", total, { origin: "traded", regionId });
  if (!cr.ok) { car.events.push({ at: day, what: `reached ${dest?.name || car.to}, but the coin would not settle` }); return { ok: false, why: cr.why, sold, crystal: 0, regionId }; }
  car.events.push({ at: day, what: `reached ${dest?.name || car.to} — ${describe(Object.fromEntries(Object.entries(sold).map(([g, s]) => [g, s.units])))} sold for ${total} crystal` });
  return { ok: true, sold, crystal: total, regionId };
}

/** ⚑ WHAT THE GM IS TOLD, so a caravan is something the world MENTIONS rather than a number in a panel. */
export function caravansForGM(character, locations = {}) {
  const rows = caravansOf(character).filter(c => c && c.status === "travelling");
  if (!rows.length) return null;
  return rows.map(c => {
    const units = Object.values(c.load || {}).reduce((a, n) => a + num(n), 0);
    const who = (c.carriers || []).length;
    return `- ${units} unit(s) on the road from ${locations[c.from]?.name || c.from} to ${locations[c.to]?.name || c.to}`
      + ` — ${c.routeLabel}, ${c.days} days, ${who ? `${who} walking with it` : "⛔ NOBODY walking with it"}`
      + (c.danger ? ` · the worst of that road is danger ${c.danger}` : "");
  }).join("\n");
}
