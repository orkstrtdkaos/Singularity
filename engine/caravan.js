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
import { kitFor, personRecordFor } from "./npcsheet.js";   // SNG-659 §1: the DERIVED kit, the same one every duel fights with
import { contributionsOf } from "./combatants.js";   // SNG-541c / Erik: a defender is what they can DO, not one more body
import { unitWorth, producesPerPass, worthOfGoods, crewKeepPerPass, featuresOf, featureDef, raidChanceFor, sellShareFor, storeTotal , upkeepFor } from "./holdings.js";   // ⛑ SNG-654 A: a route's value is what the hold MAKES, priced where it is going — through the tick's own producer
import { earnAt, saidEarned, incomeHere } from "./money.js";   // ⛔ CCODE-437: sold for the market's own money — `earnAt` goes through `credit`   // ⛔ CCODE-437: a load is sold for the money of the market it reaches
import { enterDeathState } from "./death.js";
import { routeBetween, roadDistances, pathFrom } from "./journey.js";   // ⛑ SNG-654 B: ONE search from the hold answers every market at once — 38 regions for the cost of one route
import { storeWorth } from "./holdings.js";
import { marketFeeAt } from "./powers.js";   // ✅ SNG-663 §2d: the market held by a power charges for the right to sell   // §6b: the comparison prices the store through the one reader that prices it

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
/** ⛔ ERIK 2026-09-12: "raidable from where they currently are along the route… a simplified way to do this by day." The day's
 *  position on the road is the fraction of the journey elapsed, taken to the step of `path` it falls in; that step's own danger is
 *  what can reach them today. ⚠️ `roadDanger` (the worst on the whole road) STAYS — it is what a player is told before setting out,
 *  and it is the right number for that question. This is the other question: what is out there right now. Pure. */
export function positionOnRoad(car, day = null, locations = {}) {
  const path = Array.isArray(car?.path) && car.path.length ? car.path : [car?.to].filter(Boolean);
  const total = Math.max(0.0001, num(car?.days, 0));
  const started = num(car?.departedDay, num(car?.startedDay, num(car?.lastTickDay, num(day, 0))));   // `departedDay` is what sendCaravan writes
  const elapsed = Math.max(0, Math.min(total, num(day, started) - started));
  const f = total ? elapsed / total : 1;
  const i = Math.max(0, Math.min(path.length - 1, Math.floor(f * (path.length - 1) + 0.0001)));
  const placeId = path[i] || null;
  return { index: i, placeId, name: locations?.[placeId]?.name || placeId, danger: num(locations?.[placeId]?.dangerLevel, num(car?.danger, 0)), fraction: f, daysOut: elapsed, daysLeft: Math.max(0, total - elapsed) };
}

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
  company = null,   // ✅ SNG-652 §6 / C1: {id, cut, guards, knowsGates} — a hired company walks ITS roads, not yours
  carry = null,     // ✅ SNG-665: the pile a run has gathered — given, not scraped off the store
} = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!h.locationId) return { ok: false, why: "that holding is not anywhere yet — it has no road out" };
  if (!locations[h.locationId]) return { ok: false, why: "the hold's place is not on the map" };
  if (!locations[toId]) return { ok: false, why: "nowhere by that name" };
  if (toId === h.locationId) return { ok: false, why: "the load is already there" };

  // ⛔ THE ROUTE IS RESOLVED FOR WHOEVER WALKS IT. A hired company is not the player: one that knows the gates reads
  // the whole public network (`gatesUsableBy(null)`), and one that does not — the Keelmouth lighters "don't use the gates
  // and don't trust them" — must be gate-BLIND rather than merely unlucky. ⚠️ This exact line read `character` and made
  // the card's 1.6-day quote into a 135.3-day walk, priced per day for hazard the whole way. One reading for both.
  const carrier = company ? (company.knowsGates ? null : { knownPlaces: [], abilities: [] }) : (traveller || character);
  const route = routeBetween(h.locationId, toId, locations, { traveller: carrier });
  // ⛔ SNG-654 — THE FASTEST WAY, NOT THE FIRST ONE IN THE LIST, and this was a live defect: `options[0]` is the ROAD
  // and the gate leg comes after it, so a load out of the Made Gate walked 34.6 days to the Axis Gate while the
  // comparison card — which sorts by days — priced the same run at 1.7 through Silas's own waygate. ⚠️ A card and an
  // engine disagreeing about the same road, which is the defect I have repaired four times in this file's neighbours.
  // ⛑ Two named options are a decision for a TRAVELLER, who can weigh a gate's energy against a long walk. A cart has
  // nobody to weigh it, so the rule is the fastest road its carriers can actually use.
  const leg = (route?.options || []).slice().sort((a, b) => (a.days ?? 1e9) - (b.days ?? 1e9))[0];
  if (!leg) return { ok: false, why: "no way there from the hold" };

  // ⛔ TAKE THE LOAD OFF THE STORE NOW, and refuse rather than send an empty cart.
  // ✅ SNG-665 — OR CARRY A PILE THAT IS ALREADY GATHERED. A run draws its units a pass into its own pile (`gathered`),
  // and the cart carries THAT — not the hold's whole shelf, which is the rule Erik withdrew. `goods` filtered by KIND
  // and never by amount, so it could not express "four of the fourteen".
  const load = {};
  if (carry && typeof carry === "object") {
    for (const [g, n] of Object.entries(carry)) { const u = Math.floor(num(n)); if (u > 0) load[g] = u; }
  } else {
    for (const [g, n] of Object.entries(h.store || {})) {
      if (goods && g !== goods) continue;
      const units = Math.floor(num(n));
      if (units > 0) { load[g] = units; delete h.store[g]; }
    }
  }
  if (!Object.keys(load).length) return { ok: false, why: goods ? `the store holds no ${goods}` : "the store is empty" };

  // ⛔ AT THE RULED SPEED, THROUGH THE FUNCTION THE CARD READS. `carriageFor` had one caller — `routeValue`, the
  // comparison — so Erik's lever-C table ("a stable 2×, a lizard-den 2.5×, by water 3×, a hired company 2×") moved the
  // estimate and no cart ever went faster. ⚠️ It went unseen because the rule had no population: all 6 holds in the
  // world carry ×1 on foot, so card and cart agreed by coincidence until C1 hired somebody with animals, and then 6 of
  // 12 priced rows quoted half the journey. ⛑ One function, both readers — and because the hazard loop rolls once per
  // elapsed day, "a faster road is a safer one" is now true of the ROAD and not only of the quote.
  const carriage = carriageFor(character, h, { toId, locations, cfg, company: !!company });
  const walkDays = Math.round((num(leg.days, 0) / Math.max(0.1, num(carriage.mult, 1))) * 10) / 10;
  const car = {
    id: `car-${h.id}-${day ?? 0}-${Object.keys(load).join("+")}`.slice(0, 64),
    holdingId: h.id, from: h.locationId, to: toId,
    load, carriers: [...new Set(carriers.filter(Boolean))],
    routeKind: leg.kind, routeLabel: leg.label, days: walkDays, roadDays: leg.days,
    carriage: { mult: num(carriage.mult, 1), label: carriage.label },
    path: leg.path || [h.locationId, toId],
    danger: roadDanger(leg.path || [], locations),
    departedDay: day, arriveDay: day == null ? null : Math.round(num(day) + walkDays),
    lastTickDay: day, status: "travelling", events: [],
    // ✅ SNG-652 §6 / C1 — set HERE, where the route that produced it was chosen, so the road's hazard, the arrival's
    // cut and the news all read one record. `runStandingRoutes` used to stamp this on afterwards, which left the route
    // and the company decided in two different places.
    ...(company ? { company: { id: company.id, cut: clamp01(num(company.cut, 0)), guards: Math.max(0, num(company.guards, 0)) } } : {}),
  };
  ensureCaravans(character).push(car);
  return { ok: true, caravan: car, route };
}

/* ═════ SNG-654 A — A ROUTE IS A STANDING RUN ═════
 *
 * ✅ ERIK: *"yes on a-d."* ⛑ AEVI: *"once a route is set, each departure carries what accumulated since the last one."*
 *
 * ⚑ ONE LOAD ON THE ROAD AT A TIME, because there is one crew. They walk out, they sell, they walk back, and the next
 * departure leaves with everything the hold made while they were gone — which is exactly why distance is a delay and
 * not a divisor, and why the stock that waits is exposed.
 */

/** ⛔ SET THE ROUTE. Refuses for the same reasons `sendCaravan` refuses, because a route that cannot be walked is not
 *  a route — and it refuses BEFORE it writes, so a save never carries a standing run to nowhere. */
export function setRoute(character, holdingId, { toId = null, carriers = [], locations = {}, day = null } = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!h.locationId) return { ok: false, why: "that holding is not anywhere yet — it has no road out" };
  if (!locations[h.locationId]) return { ok: false, why: "the hold's place is not on the map" };
  if (!locations[toId]) return { ok: false, why: "nowhere by that name" };
  if (toId === h.locationId) return { ok: false, why: "the load is already there" };
  const route = routeBetween(h.locationId, toId, locations, { traveller: character });
  if (!(route?.options || []).length) return { ok: false, why: "no way there from the hold" };
  h.route = { toId, crew: [...new Set((carriers || []).filter(Boolean))], setDay: day, lastDepartureDay: null, runs: 0 };
  return { ok: true, route: h.route, to: locations[toId]?.name || toId };
}

/** ⛑ AND STOPPING IT IS ITS OWN ACT, because a keeper starts selling again the moment it stops. */
export function clearRoute(character, holdingId) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h || !h.route) return { ok: false, why: "no route stands there" };
  const was = h.route;
  delete h.route;
  return { ok: true, was };
}

/** ⛔ THE NEXT DEPARTURE, ON THE TICK. One load on the road at a time: while a caravan of this hold is walking out or
 *  walking home, nothing leaves. ⚑ And an empty store is not a departure — the cart waits rather than going empty,
 *  which is the same refusal `sendCaravan` already makes.
 *
 *  ⚠️ A CREW THAT IS ALL DEAD STOPS THE ROUTE and says so. A route that keeps sending carts nobody walks with would
 *  quietly turn a standing run into a standing robbery. Returns notes for the news. */
export function runStandingRoutes(character, { locations = {}, cfg = null, day = null, people = {},
  economy = null, powers = null, rules = null, density = null } = {}) {
  const out = [];
  for (const h of (character?.holdings || [])) {
    // ✅ SNG-665 — EVERY RUN ON THIS HOLD DRAWS ITS UNITS FIRST, through the same `allocatePass` the screen prints. The
    // draw happens whether or not a cart can leave: a run gathers while its last cart is still walking, which is what
    // makes "how much goes into it" a dial rather than an on/off switch.
    const runs = ensureRuns(h);
    // ⛑ THE DRAW ALREADY HAPPENED, in `tickStore` via `divertToRuns`, out of this pass's product and before the
    // keeper sold any of it. It used to happen HERE, scraped off the shelf afterwards, and it starved the hold:
    // Loki's Annex went THRIVING → HOLDING in one pass with its product halved. This loop only SENDS.
    for (const r of runs) {
      if (!r || !r.toId) continue;
      // ⛔ ONE CART PER RUN, not per hold — two runs out of one hold walk different roads and must not block each other.
      const busy = caravansOf(character).some(c => c && c.holdingId === h.id && c.runId === r.id && (c.status === "travelling" || c.status === "returning"));
      if (busy) continue;
      const gathered = Object.values(r.gathered || {}).reduce((a, n) => a + num(n), 0);
      if (gathered <= 0) continue;
      // ✅ §1.5 — THE CART LEAVES WHEN ITS LOAD IS GATHERED: its units a pass × the passes a round trip takes. ⚠️ The
      // spec also says "capped by what the carrier can carry" and NOTHING AUTHORS A CAPACITY yet, so there is no cap
      // here rather than one I chose — `trade.carryCap` is read the day it is written.
      // ⛔ THE TARGET IS MEASURED AGAINST WHAT THE RUN DRAWS, not what the shelf happened to allow — `lastDraw` is
      // the allocator's own figure for this run, stamped when it drew. Reading the realised take made the target
      // wobble pass to pass and sent a cart with two units against a target of eight.
      const target = runLoadTarget(character, h, r, { locations, cfg, day, perPass: r.lastDraw ?? null });
      if (gathered < target.units) continue;
      const crew = (r.crew || []).filter(id => {
        const p = people?.[id] || character?.npcRegistry?.[id] || null;
        return !p || p.status !== "dead";
      });
      if ((r.crew || []).length && !crew.length) {
        out.push({ kind: "route-stopped", holdingId: h.id, note: `The run out of ${h.name || "the hold"} to ${locations[r.toId]?.name || r.toId} has stopped — nobody who walked it is left to walk it again.` });
        removeRun(character, h.id, r.id);
        continue;
      }
      const byCo = r.by ? { id: r.by, cut: clamp01(num(r.cut, 0)), guards: Math.max(0, num(r.guards, 0)), knowsGates: !!r.knowsGates } : null;
      const carrying = { ...r.gathered };
      const sent = sendCaravan(character, { holdingId: h.id, toId: r.toId, carriers: crew, locations, cfg, day, traveller: character, company: byCo, carry: carrying });
      if (!sent.ok) { out.push({ kind: "route-refused", holdingId: h.id, note: null, why: sent.why }); continue; }
      r.gathered = {};
      r.lastDepartureDay = day;
      sent.caravan.standing = true;
      sent.caravan.runId = r.id;                                      // ⛑ so the next pass knows THIS run's cart is out
      const units = Object.values(sent.caravan.load || {}).reduce((a, n) => a + num(n), 0);
      const walking = byCo
        ? (byCo.guards ? `, ${byCo.guards} of their guards walking with it` : ", and they sent nobody to walk with it")
        : crew.length ? `, ${crew.length} walking with it` : ", and NOBODY walking with it";
      out.push({ kind: "departure", holdingId: h.id, caravanId: sent.caravan.id,
        note: `${units} unit(s) left ${h.name || "the hold"} for ${locations[r.toId]?.name || r.toId} — ${sent.caravan.days} days on the road${walking}.` });
    }
    // ⛑ AND THE OLD SINGLE `route`, for a save the migration has not reached yet. It is not removed here: reconcile
    // step 91 turns it into a run, and doing it in two places would be two answers to one question.
    const r = h?.route;
    if (!r || !r.toId) continue;
    const busy = caravansOf(character).some(c => c && c.holdingId === h.id && !c.runId && (c.status === "travelling" || c.status === "returning"));
    if (busy) continue;
    const crew = (r.crew || []).filter(id => {
      const p = people?.[id] || character?.npcRegistry?.[id] || null;
      return !p || p.status !== "dead";
    });
    if ((r.crew || []).length && !crew.length) {
      out.push({ kind: "route-stopped", holdingId: h.id, note: `The run out of ${h.name || "the hold"} has stopped — nobody who walked it is left to walk it again.` });
      delete h.route;
      continue;
    }
    if (!Object.keys(h.store || {}).length) continue;                  // nothing made yet: the cart waits
    // ✅ SNG-652 §6 / C1 — WHO IS CARRYING IT GOES IN WITH THE ASK, not onto the caravan afterwards: `sendCaravan`
    // chooses the ROAD, and a company that knows the gates walks a different one. Stamping it on after the route was
    // already picked is what made the card and the news disagree by 134 days.
    const byCo = r.by ? { id: r.by, cut: clamp01(num(r.cut, 0)), guards: Math.max(0, num(r.guards, 0)), knowsGates: !!r.knowsGates } : null;
    const sent = sendCaravan(character, { holdingId: h.id, toId: r.toId, carriers: crew, locations, cfg, day, traveller: character, company: byCo });
    if (!sent.ok) { out.push({ kind: "route-refused", holdingId: h.id, note: null, why: sent.why }); continue; }
    r.lastDepartureDay = day;
    sent.caravan.standing = true;                                      // ⛑ so arrival knows to walk them home
    const units = Object.values(sent.caravan.load || {}).reduce((a, n) => a + num(n), 0);
    // ⛔ AND THE NOTE SAYS WHO WALKS WITH IT. "and NOBODY walking with it" read `crew`, which a hired run empties by
    // construction — so the news said nobody was walking beside a load six of their guards had just fought for.
    const walking = byCo
      ? (byCo.guards ? `, ${byCo.guards} of their guards walking with it` : ", and they sent nobody to walk with it")
      : crew.length ? `, ${crew.length} walking with it` : ", and NOBODY walking with it";
    out.push({ kind: "departure", holdingId: h.id, caravanId: sent.caravan.id,
      note: `${units} unit(s) left ${h.name || "the hold"} for ${locations[r.toId]?.name || r.toId} — ${sent.caravan.days} days on the road${walking}.` });
  }
  return out;
}

/** ⚑ WHO IS STILL ON THEIR FEET. A carrier who died on an earlier leg does not defend the next one. */
/* ═════ SNG-654 §4 — THE FOUR LEVERS THAT MAKE A ROUTE WORTH RUNNING ═════
 *
 * ✅ ERIK 2026-09-25: *"yes on a-d."*
 *
 * ⛔ THE DEFECT THEY FIX, MEASURED AT HEAD ON SILAS'S OWN HOLDS. `storeExits` ranked markets by GROSS PRICE and then
 * divided the take by the days on the road. The Fell Pell's two offered routes were the Grand Lattice (146.6 days) and
 * the Unplanned Room (156.6) at 4 a pass, against 56 for selling at home — while the Crossing, 34 days away at ×1.8,
 * never appeared at all, because two ×3.6 markets 150 days out took the four candidate slots.
 *
 * ⚑ SO DISTANCE IS A DELAY AND A RISK, NOT A DIVISOR. A trade route is not one trip: it runs again and again, and each
 * departure carries what the hold has made since the last one. In steady state every unit produced makes exactly one
 * one-way journey — so the value of the route per pass is what the hold MAKES in a pass, sold THERE, less the crew's
 * keep and less the share the road is expected to take. Distance shows up twice, honestly: as `firstCoin` (the passes
 * before any coin comes back) and inside the expected loss (hazard is rolled per day).
 */

const tradeCfg = (cfg) => (cfg && typeof cfg.trade === "object" && cfg.trade ? cfg.trade : {});

/** ⛔ WHICH HOLDS ARE EARNING NOTHING AT HOME BECAUSE A CART IS COMING FOR THE STOCK.
 *
 *  ⚠️ Erik, in play 2026-09-28: *"even though it's thriving I have lost my income."* The estate board said **0 in, 24
 *  out** — which is SNG-654 working exactly as ruled (a standing run means the keeper holds the stock for the cart
 *  rather than selling it here) and reads exactly like a defect. His run is the Annex to Gearsflat: 75.7 days each way,
 *  a cart out since world-day 90, about 26 passes before the first coin comes back.
 *
 *  ⛑ The comparison card said "first coin in 26 passes" when he chose it. The BOARD, where he noticed the loss, said
 *  nothing — so this is the sentence that number needed. Returns one row per hold that is holding, with the cart if one
 *  is out. PURE. */
export function heldForRuns(character, { locations = {} } = {}) {
  const out = [];
  for (const h of (character?.holdings || [])) {
    if (!h?.route?.toId) continue;
    const car = caravansOf(character).find(c => c && c.holdingId === h.id && (c.status === "travelling" || c.status === "returning")) || null;
    out.push({
      holdId: h.id, name: h.name || h.id,
      toId: h.route.toId, toName: locations?.[h.route.toId]?.name || h.route.toId,
      by: h.route.by || null, runs: Math.max(0, num(h.route.runs, 0)),
      waiting: Object.values(h.store || {}).reduce((a, n) => a + num(n), 0),
      out: car ? { status: car.status, load: car.load, arriveDay: car.arriveDay ?? null, homeDay: car.homeDay ?? null,
        days: num(car.days, 0), departedDay: car.departedDay ?? null } : null,
    });
  }
  return out;
}

/* ═════ SNG-665 — MANY RUNS, AND THE KEEPER NEVER HOLDS EVERYTHING ═════
 *
 * ✅ ERIK 2026-09-29: *"No — a keeper does NOT hold the entire stock while a trade route runs… You can put more or less
 * into a run (of which you can have many different routes set up) and you should be able to see the effect on the $
 * expected to be brought in. You should have a toggle that lets you always hold enough product back to sell for
 * operating costs."*
 *
 * ⛔ THE WITHDRAWN RULE WAS MINE. `sellShareFor` answered 0 while a route stood — "the policy IS the route", which read
 * well and meant Loki's thriving Annex earned NOTHING for 26 passes while paying 24 a pass, because its cart is 75.7
 * days each way. One route, all the stock, and no way to send less.
 *
 * ⛑ THE SHAPE NOW: a hold has any number of runs, each asking for a number of units a pass. Before any of them draws,
 * the keeper keeps back enough to cover upkeep (a per-hold toggle, ON by default). What no run asked for stays in the
 * store and sells at home as it always did. A run can never starve the hold, and the hold can never hold everything.
 */

/** ⛑ THE RUNS ON A HOLD, always an array. PURE apart from creating it. */
export function ensureRuns(holding) {
  if (!holding) return [];
  if (!Array.isArray(holding.runs)) holding.runs = [];
  return holding.runs;
}

/** ⛔ WHETHER THE KEEPER COVERS THE KEEP FIRST. Erik's toggle, and §1.3 says ON by default — so `undefined` is ON, and
 *  only an explicit `false` turns it off. ⚠️ A default that behaves like a value is this project's most-repeated defect;
 *  written this way round, a save that predates the toggle behaves the way the ruling says. PURE. */
export function coversUpkeepFirst(holding) {
  return holding?.reserveUpkeep !== false;
}

/** ⛔ WHAT ONE PASS'S PRODUCT IS SPLIT INTO — THE ONE ANSWER THE SCREEN PRINTS AND THE TICK SPENDS.
 *
 *  ⛑ §3's gate is that the screen's total equals the sum of its rows and that the tick lands inside the card's forecast.
 *  That is only unbreakable if neither side computes the split, so both call this. Returns units, never money: what a
 *  unit fetches is `routeValue`'s job for a run and the market's for the home sale, and computing worth twice is how a
 *  card and an engine come to disagree.
 *
 *  ⚠️ THE RESERVE IS IN THE UNITS THE SPEC ASKS FOR — *"the keeper sells enough at home to pay the hold's upkeep that
 *  pass. The screen says how many units that takes."* So it is `upkeep ÷ what a unit fetches HERE, after this market's
 *  fee`, and it is capped by the pass's whole product: a hold that cannot cover its own keep says so rather than
 *  reserving a number it does not have. PURE. */
export function allocatePass(character, holding, { cfg = null, economy = null, locations = {}, density = null,
  powers = null, rules = null, day = null } = {}) {
  const made = producesPerPass(holding, cfg, { density });
  const total = made.reduce((a, y) => a + Math.max(0, num(y?.units)), 0);
  const homeRegion = locations?.[holding?.locationId]?.regionId ?? null;
  const basket = {};
  for (const y of made) if (num(y?.units) > 0) basket[y.goods] = num(basket[y.goods]) + num(y.units);
  const grossHome = total > 0 ? num(worthOfGoods(basket, { economy, regionId: homeRegion, cfg }), 0) : 0;
  const perUnit = total > 0 ? grossHome / total : 0;

  // ⛑ the market's own fee here, through the one reader — a stall fee is part of what a unit actually fetches
  const market = marketFeeAt(holding?.locationId, { content: { powers: powers || [], locations }, powers, character, rules, locations });
  const feePerPass = market && !market.waived && !market.closed ? Math.max(0, num(market.fee, 0)) : 0;
  const netHome = Math.max(0, grossHome - feePerPass);
  const netPerUnit = total > 0 ? netHome / total : 0;

  const upkeep = Math.max(0, num(upkeepFor(holding, cfg), 0));
  const wants = coversUpkeepFirst(holding);
  // ⛔ THE UNITS THAT WILL BE *SOLD*, NOT THE UNITS THAT ARE WORTH THE UPKEEP. A keeper sells a SHARE of the store each
  // pass — `sellShareFor`, and it is the same reader the tick sells with — so reserving `upkeep ÷ what a unit fetches`
  // keeps back half of what the keep actually needs. ⚠️ And a hold nobody sells at (no keeper, no hands) has a share of
  // zero: reserving its whole product for a sale that will not happen would be a default behaving like a value, so it
  // says it is short instead.
  const share = Math.max(0, Math.min(1, num(sellShareFor(holding, cfg), 0)));
  const canSell = share > 0 && netPerUnit > 0;
  const needed = wants && canSell ? Math.ceil(upkeep / (netPerUnit * share)) : 0;
  const reserve = Math.min(total, needed);
  // ⛔ AND IT SAYS SO WHEN IT CANNOT. §3: "unless its whole product is less than its upkeep (and then the row says that)."
  const shortOfKeep = wants && upkeep > 0 && (!canSell || needed > total);

  const free = Math.max(0, total - reserve);
  // ⛑ `wholeProduct` ASKS FOR WHATEVER IS SPARE — §3's migration shape ("one run carrying its whole product minus the
  // reserve"), and a useful setting in its own right: send the surplus, whatever the pass happened to make. A fixed
  // `units` is the dial the screen's ◀ ▶ moves; this is the run that does not want a dial.
  const runs = ensureRuns(holding).map(r => ({
    id: r.id, toId: r.toId, by: r.by || null, whole: !!r.wholeProduct,
    asked: r.wholeProduct ? free : Math.max(0, Math.round(num(r.units, 0))),
  }));
  const asked = runs.reduce((a, r) => a + r.asked, 0);
  // ⛔ PROPORTIONALLY WHEN SHORT — §1.4, "each takes its share proportionally, and the row says so". ⚠️ The remainders
  // are handed out largest-first rather than dropped, or a hold with three runs quietly loses units to rounding.
  let getting = runs.map(r => ({ ...r, getting: asked > 0 ? Math.min(r.asked, Math.floor(free * r.asked / asked)) : 0 }));
  if (asked > free && free > 0) {
    let left = free - getting.reduce((a, r) => a + r.getting, 0);
    const order = getting.map((r, i) => ({ i, frac: asked > 0 ? (free * r.asked / asked) % 1 : 0 })).sort((a, b) => b.frac - a.frac);
    for (const { i } of order) { if (left <= 0) break; if (getting[i].getting < getting[i].asked) { getting[i].getting++; left--; } }
  }
  const toRuns = getting.reduce((a, r) => a + r.getting, 0);
  return {
    made, total, basket, perUnit: Math.round(perUnit * 100) / 100, netPerUnit: Math.round(netPerUnit * 100) / 100,
    upkeep, reserve, reserveOn: wants, shortOfKeep, sellShare: share,
    runs: getting.map(r => ({ ...r, short: r.getting < r.asked })),
    toRuns, home: Math.max(0, total - reserve - toRuns), free, asked,
    market: market || null,
    // ⛑ the sentence the row needs, in the spec's own register
    // ⛔ AND IT NAMES *WHICH* REASON. "Nobody here sells anything" went out over a hold with a keeper and a 0.5 share,
    // because `canSell` is two conditions and the sentence only knew one of them: the Whistling Woman Post makes
    // nothing, which is a different problem with a different answer. A message is a claim about a mechanism.
    said: shortOfKeep
      ? (total <= 0 ? `This hold makes nothing a pass, so nothing can be held back against a keep of ${upkeep}.`
        : share <= 0 ? `Nobody here sells anything — no keeper and no hands — so no amount held back covers the keep of ${upkeep}.`
        : netPerUnit <= 0 ? `What this hold makes fetches nothing here, so holding it back cannot cover the keep of ${upkeep}.`
        : `This hold makes ${total} a pass and its keep is ${upkeep} — its whole product will not cover it.`)
      : `${total} a pass: ${reserve} to cover the keep, ${toRuns} into ${getting.filter(r => r.getting > 0).length} run(s), ${Math.max(0, total - reserve - toRuns)} sold here.`,
  };
}

/** ⛑ SET, ADD AND REMOVE A RUN. A run is a destination plus how much of a pass goes to it; the carrier is either your
 *  own people or a hired company, exactly as `setRoute`/`hireCompany` already decide. */
export function addRun(character, holdingId, { toId = null, units = 0, carriers = [], companyId = null,
  companies = null, locations = {}, cfg = null, day = null } = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!locations[toId]) return { ok: false, why: "nowhere by that name" };
  if (toId === h.locationId) return { ok: false, why: "the load is already there" };
  const route = routeBetween(h.locationId, toId, locations, { traveller: character });
  if (!(route?.options || []).length) return { ok: false, why: "no way there from the hold" };
  const runs = ensureRuns(h);
  if (runs.some(r => r?.toId === toId && (r.by || null) === (companyId || null))) return { ok: false, why: "a run already goes there with those carriers" };
  const co = companyId ? (Array.isArray(companies) ? companies : []).find(c => c && c.id === companyId) : null;
  if (companyId && !co) return { ok: false, why: "no company by that name" };
  if (co && !companyReaches(co, toId, { locations, cfg })) return { ok: false, why: `${co.name} does not carry into ${locations[toId]?.name || toId}` };
  const run = { id: `run-${toId}${co ? `-${co.id}` : ""}`.slice(0, 64), toId, units: Math.max(0, Math.round(num(units, 0))),
    crew: co ? [] : [...new Set((carriers || []).filter(Boolean))], setDay: day, lastDepartureDay: null, runs: 0, gathered: {} };
  if (co) { run.by = co.id; run.cut = clamp01(num(co.cut, 0)); run.guards = Math.max(0, num(co.guards, 0)); run.knowsGates = !!co.knowsGates; }
  runs.push(run);
  return { ok: true, run, to: locations[toId]?.name || toId };
}

export function setRunUnits(character, holdingId, runId, units) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  const r = ensureRuns(h).find(x => x && x.id === runId);
  if (!r) return { ok: false, why: "no such run" };
  r.units = Math.max(0, Math.round(num(units, 0)));
  return { ok: true, run: r };
}

/** ⛔ AND STOPPING ONE RETURNS WHAT IT HAD GATHERED TO THE STORE — it is the hold's product, and it never left. */
export function removeRun(character, holdingId, runId) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  const runs = ensureRuns(h);
  const i = runs.findIndex(x => x && x.id === runId);
  if (i < 0) return { ok: false, why: "no such run" };
  const [was] = runs.splice(i, 1);
  let back = 0;
  for (const [g, n] of Object.entries(was.gathered || {})) {
    if (!(num(n) > 0)) continue;
    h.store = h.store && typeof h.store === "object" ? h.store : {};
    h.store[g] = num(h.store[g]) + num(n);
    back += num(n);
  }
  return { ok: true, was, returned: back };
}

/** ✅ SNG-665 §1.1 — DRAW EACH RUN'S UNITS OUT OF **THIS PASS'S PRODUCT**, the moment it lands and before the keeper
 *  sells any of it. Handed to `tickStore` by the world tick, because this file imports `holdings.js` and importing it
 *  back would be a cycle.
 *
 *  ⛔ IT USED TO HAPPEN LATER, in `runStandingRoutes`, scraped off the shelf after the keeper had already sold. Measured
 *  on Loki's Annex: the hold went THRIVING → HOLDING in one pass with its product halved — a run starving the hold,
 *  which §1.4 forbids in as many words. Drawn from the product, the run and the keeper divide one pass's work instead
 *  of competing over a shelf. Returns the units drawn. */
export function divertToRuns(character, holding, { cfg = null, economy = null, locations = {}, density = null,
  powers = null, rules = null, day = null } = {}) {
  const runs = ensureRuns(holding);
  if (!runs.length) return 0;
  const split = allocatePass(character, holding, { cfg, economy, locations, density, powers, rules, day });
  let drawn = 0;
  for (const row of split.runs) {
    if (!(row.getting > 0)) continue;
    const run = runs.find(x => x && x.id === row.id);
    if (!run) continue;
    run.gathered = run.gathered && typeof run.gathered === "object" ? run.gathered : {};
    run.lastDraw = row.getting;                      // ⛑ what the cart's target is measured against, not what the shelf allowed
    let want = row.getting;
    for (const y of [...split.made].sort((a, b) => num(b?.units) - num(a?.units))) {
      if (want <= 0) break;
      const take = Math.min(want, Math.floor(num(holding.store?.[y.goods], 0)));
      if (take <= 0) continue;
      holding.store[y.goods] = num(holding.store[y.goods]) - take;
      if (!(num(holding.store[y.goods]) > 0)) delete holding.store[y.goods];
      run.gathered[y.goods] = num(run.gathered[y.goods]) + take;
      want -= take; drawn += take;
    }
  }
  return drawn;
}

/** ✅ SNG-665 §1.5 — THE LOAD A RUN GATHERS BEFORE ITS CART LEAVES: its units a pass × the passes a round trip takes, so
 *  the first coin still comes back when the cart does and a far market still departs rarely.
 *  ⚠️ The spec also says "capped by what the carrier can carry" and NOTHING AUTHORS A CAPACITY. There is no cap here
 *  rather than a number I chose — `trade.carryCap` is read the day Aevi writes one, and until then the cap is the road.
 *  PURE. */
export function runLoadTarget(character, holding, run, { locations = {}, cfg = null, day = null, perPass = null } = {}) {
  // ⛔ THE DRAW, NOT THE DIAL. A `wholeProduct` run has no `units` — it asks for whatever is spare — so reading the
  // dial gave it a target of zero and its cart would have left every pass with whatever was in the pile, however far
  // the market. `perPass` is the allocator's own `getting` for this run, which is the only place that number exists.
  const per = Math.max(0, Math.round(num(perPass != null ? perPass : run?.units, 0)));
  const passDays = Math.max(0.1, num(tradeCfg(cfg).passDays, 3));
  const co = run?.by ? { knowsGates: !!run.knowsGates } : null;
  const carrier = co ? (co.knowsGates ? null : { knownPlaces: [], abilities: [] }) : character;
  let days = 0;
  try {
    const rt = routeBetween(holding?.locationId, run?.toId, locations, { traveller: carrier });
    const leg = (rt?.options || []).slice().sort((a, b) => (a.days ?? 1e9) - (b.days ?? 1e9))[0];
    const carriage = carriageFor(character, holding, { toId: run?.toId, locations, cfg, company: !!run?.by });
    days = leg ? num(leg.days, 0) / Math.max(0.1, num(carriage.mult, 1)) : 0;
  } catch { days = 0; }
  const passes = Math.max(1, Math.ceil((days * 2) / passDays));
  const cap = num(tradeCfg(cfg).carryCap, 0);
  const units = cap > 0 ? Math.min(per * passes, cap) : per * passes;
  return { units: Math.max(0, units), per, passes, roundTripDays: Math.round(days * 2 * 10) / 10, cap: cap > 0 ? cap : null };
}

/** ⛑ WHO WALKS A STANDING RUN OUT OF THIS HOLD — the hold's own hands, capped by `trade.crew`.
 *
 *  ⛔ THIS DECISION LIVED IN `app.js` AS `carriers: (h.crew || []).slice(0, 2)` while the card forecast a flat two, so a
 *  hold with no hands was quoted two wages it will never pay and an escorted road it will never walk — and FOUR OF THE
 *  SIX HOLDS IN THE WORLD HAVE NO CREW. ⚠️ It also meant `unescortedTakeShare` was unreachable from any real hold: the
 *  card could not produce `walking === 0`, so the dial had no population and nothing could test it.
 *
 *  ⛑ One function, both readers — the same cure `crewKeepPerPass` names in its own docstring. A route that is already
 *  SET answers with the crew it was set with, because that is who is walking it. PURE. */
export function standingCrewFor(holding, cfg = null) {
  if (Array.isArray(holding?.route?.crew)) return [...holding.route.crew];
  const cap = Math.max(0, Math.round(num(tradeCfg(cfg).crew, 2)));
  return (Array.isArray(holding?.crew) ? holding.crew : []).filter(Boolean).slice(0, cap);
}

/** ⛔ WHAT A ROBBERY ON THE ROAD COSTS — THE ROAD'S OWN DIALS, NOT THE HOLD'S.
 *
 *  ⚠️ `resolveRoadHazard` and `routeValue` both read `raid.takeShare` for this, which is Erik's Q8 ruling about A RAID
 *  ON A HOLD — economy.json's own note: *"a raid takes takeShare and arrives as news"*. One dial was answering two
 *  different questions, so tuning a raid on a shed silently retuned every road in the world. Erik, 2026-09-28: *"unescorted
 *  loses shouldn't be 50%.. .not sure how that happened."* It happened through my own po table of 09-06, which printed the
 *  row as "Erik's ruling" when the only words he spoke there were about the wipe.
 *
 *  ⛑ THE LADDER, and only the middle two are dials:
 *      beat them off        → 0        (R46a: a won fight loses nothing, whatever it cost in people)
 *      lose the fight       → `roadTakeShare`
 *      nobody walking       → `unescortedTakeShare`   — strictly worse than losing, or bringing people is a penalty
 *      escort WIPED         → 1        (Erik: "especially if all your people get killed")
 *
 *  ⛔ The fallback chain keeps a save with no authored trade block on exactly today's behaviour. PURE. */
export function roadShares(cfg) {
  const t = tradeCfg(cfg);
  const hold = Number.isFinite(Number(cfg?.raid?.takeShare)) ? Number(cfg.raid.takeShare) : 0.5;
  const lost = Number.isFinite(Number(t.roadTakeShare)) ? Number(t.roadTakeShare) : hold;
  const alone = Number.isFinite(Number(t.unescortedTakeShare)) ? Number(t.unescortedTakeShare) : lost;
  // ⚠️ CLAMPED BELOW 1: a total loss is RULED to mean the people died, so no dial may reach it. Content that asks for
  // 1.0 here is asking for a wipe without a body, which is the one shape Erik's ruling forbids.
  return { lost: clamp01(lost), alone: Math.min(0.99, clamp01(alone)), wiped: 1 };
}

/** ⛑ LEVER C — HOW FAST THE LOAD TRAVELS, and it is the FASTEST MEANS THE HOLD HAS, never the product of them: a
 *  stable and a river do not make a load six times as fast. Erik's table: on foot 1×, a stable 2×, a lizard-den 2.5×,
 *  by water with BOTH ENDS water-tagged 3×, a hired company 2×.
 *
 *  ⚠️ KEYED BY FEATURE ID IN CONTENT (`trade.speedByFeature`), with a fallback by the feature's PROPERTY, so a new
 *  mounts-bearing feature carries a load faster instead of silently walking. ⛔ And "both ends water-tagged" is read
 *  from the places' own `tags` — measured, all 364 route edges are bare strings and no location carries a `water`
 *  field, while `tags` is on 135 of 135 places. PURE. */
export function carriageFor(character, holding, { toId = null, locations = {}, cfg = null, company = false } = {}) {
  const t = tradeCfg(cfg);
  const options = [{ mult: 1, label: "on foot", why: "foot" }];
  if (company) {
    options.push({ mult: num(t.companySpeed, 2), label: "a hired company's own animals", why: "company" });
  } else {
    for (const f of featuresOf(holding)) {
      const kind = String(f?.kind || f || "");
      if (!kind) continue;
      const def = featureDef(kind, cfg);
      const byId = Number(t.speedByFeature?.[kind]);
      const byProp = def?.property ? Number(t.speedByProperty?.[def.property]) : NaN;
      const m = Number.isFinite(byId) ? byId : (Number.isFinite(byProp) ? byProp : null);
      if (m != null && m > 1) options.push({ mult: m, label: def?.label || kind.replace(/_/g, " "), why: kind });
    }
    // ⛔ BOTH ENDS, because a river is only a road if it goes where you are going.
    const water = new Set((Array.isArray(t.waterTags) ? t.waterTags : []).map(x => String(x).toLowerCase()));
    const wet = (id) => (locations?.[id]?.tags || []).some(x => water.has(String(x).toLowerCase()));
    if (water.size && toId && holding?.locationId && wet(holding.locationId) && wet(toId)) {
      options.push({ mult: num(t.waterSpeed, 3), label: "by water", why: "water" });
    }
  }
  const best = options.slice().sort((a, b) => b.mult - a.mult)[0];
  return { mult: best.mult, label: best.label, why: best.why, options };
}

/** ⚑ A ROAD IS KNOWN IN BOTH DIRECTIONS — a road you have walked is known whichever end you start from, so the
 *  ledger is keyed on the pair and not on the direction. */
const roadKey = (a, b) => [String(a || ""), String(b || "")].sort().join("|");

/** ⛑ LEVER D — A KNOWN ROAD GETS SAFER. Each completed run cuts that road's hazard by `perRun`, to a floor of
 *  `floor`; a relay station OF YOURS on the route doubles the rate. Returns the multiplier the hazard is scaled by.
 *
 *  ⚠️ A HOLD WITH NO RUNS READS 1 — every road in every save today, so nothing already standing gets safer by
 *  accident. PURE over the save's own ledger. */
export function knownRoad(character, fromId, toId, { cfg = null, path = null } = {}) {
  const k = tradeCfg(cfg).knownRoad || {};
  const perRun = num(k.perRun, 0.1), floor = num(k.floor, 0.5), relayMult = num(k.relayMult, 2);
  const runs = Math.max(0, Math.floor(num(character?.roadsKnown?.[roadKey(fromId, toId)], 0)));
  const onRoute = new Set([String(fromId), String(toId), ...(Array.isArray(path) ? path.map(String) : [])]);
  const relay = (character?.holdings || []).some(h => h && onRoute.has(String(h.locationId))
    && featuresOf(h).some(f => featureDef(String(f?.kind || f || ""), cfg)?.facility === "relay"));
  const rate = perRun * (relay ? relayMult : 1);
  return { runs, relay, rate, floor, mult: Math.max(floor, 1 - rate * runs) };
}

/** ⛔ AND THE LEDGER IS WRITTEN WHERE A RUN COMPLETES, which is arrival — not departure, because a load that was
 *  taken on the road taught you nothing about walking it. */
export function markRoadRun(character, fromId, toId) {
  if (!character || !fromId || !toId) return 0;
  if (!character.roadsKnown || typeof character.roadsKnown !== "object") character.roadsKnown = {};
  const k = roadKey(fromId, toId);
  character.roadsKnown[k] = Math.max(0, Math.floor(num(character.roadsKnown[k], 0))) + 1;
  return character.roadsKnown[k];
}

/** ⛔ LEVER A's LAST CLAUSE — "STOCK WAITING FOR THE CARAVAN COUNTS TOWARD RAID EXPOSURE", priced.
 *
 *  ⚑ A STANDING RUN DEPARTS ONCE PER ROUND TRIP, so everything the hold makes between departures SITS IN THE SHED.
 *  A market 135 days out means ninety passes of stock standing there; `fullAt` is 40 units and these holds make 16–20
 *  a pass, so the store is past its own full line after two passes and stays there — at maximum raid fill, and a raid
 *  takes `takeShare` of all of it.
 *
 *  ⛑ THE CHANCE IS `raidChanceFor`, the same product the tick rolls, asked at the fill the waiting stock implies.
 *  Nothing here is a second raid model. ⚠️ Priced at the LOCAL price, because that is what the stock is worth while
 *  it is still standing here. Returns the cost PER PASS. PURE. */
export function waitingExposure(character, holding, { units = 0, basket = null, cfg = null, economy = null, regionId = null, dangerLevel = 0, people = {}, npcCfg = {}, day = null } = {}) {
  // ⛑ AND THIS ONE IS THE HOLD'S DIAL ON PURPOSE — NOT A LINE THAT WAS MISSED. The road was split off
  // `raid.takeShare` on 2026-09-28 (see `roadShares`), and stock standing in the shed waiting for the next departure is
  // exactly what Q8's 0.5 rules: a raid on a hold. ⚠️ Do not "fix" this to `roadShares`; the load is not on the road yet.
  const take = Number.isFinite(Number(cfg?.raid?.takeShare)) ? Number(cfg.raid.takeShare) : 0.5;
  const waiting = Math.max(0, num(units));
  if (!(waiting > 0) || !(num(dangerLevel) > 0)) {
    return { units: waiting, chance: 0, worth: 0, cost: 0, takeShare: take,
      why: !(waiting > 0) ? "nothing waiting" : "nowhere near trouble" };
  }
  const rc = raidChanceFor(character, holding, { cfg, dangerLevel: num(dangerLevel), people, npcCfg, day, total: waiting });
  // the produced basket, scaled up to the number of units that would be standing there
  const basketUnits = Object.values(basket || {}).reduce((a, n) => a + num(n), 0);
  const scaled = {};
  if (basketUnits > 0) for (const [g, n] of Object.entries(basket)) scaled[g] = num(n) * (waiting / basketUnits);
  const worth = num(worthOfGoods(scaled, { economy, regionId, cfg }), 0);
  return { units: Math.round(waiting), chance: rc.chance, fill: rc.fill ?? null, worth: Math.round(worth),
    takeShare: take, cost: Math.round(rc.chance * take * worth * 10) / 10 };
}

/** ⛑ LEVER A — WHAT A STANDING RUN TO ONE MARKET IS WORTH PER PASS.
 *
 *  `(what the hold makes in a pass × the price THERE) − the crew's keep − the road's expected loss`, and for a hired
 *  company their cut in place of the keep. ⚠️ Every term is READ: `producesPerPass` is the number the tick adds to the
 *  store, `worthOfGoods` is the pricing every other reader uses, `crewKeepPerPass` is the number `upkeepFor` charges,
 *  and the loss is `ROAD_HAZARD_PER_DANGER_DAY` — the road dial the tick actually rolls — times the share a lost fight
 *  takes.
 *
 *  ⚠️ THE EXPECTED LOSS PRICES EVERY ENCOUNTER AS A LOSS, because a forecast cannot know whether your escort wins a
 *  fight that has not happened. That is the same convention `raidRisk` uses for a hold (chance × takeShare × worth),
 *  and using a second one would make two cards disagree about the same road.
 *
 *  ⛔ AND A HOLD THAT MAKES NOTHING HAS NO ROUTE VALUE AT ALL — `ok: false`, not 0, because those are different
 *  answers and the card says the second one out loud. PURE. */
export function routeValue(character, holding, {
  toId = null, days = null, danger = 0, path = null, cfg = null, economy = null, locations = {},
  crew = null, companyCut = null, density = null, perDangerChance = ROAD_HAZARD_PER_DANGER_DAY,
  dangerLevel = null, people = {}, npcCfg = {}, day = null, baseWaitCost = 0,
  powers = null, rules = null,   // ⚠️ NOT `character`: it is already this function's first positional parameter, and node --check called that out
  companyGuards = null,           // ✅ SNG-652 §6 / C1: how many guards the hired company walks with — said, not priced
} = {}) {
  const t = tradeCfg(cfg);
  const passDays = Math.max(0.1, num(t.passDays, 3));
  const made = producesPerPass(holding, cfg, { density });
  const basket = {};
  for (const y of made) if (num(y?.units) > 0) basket[y.goods] = num(basket[y.goods]) + num(y.units);
  const dest = locations?.[toId] || null;
  const homeRegion = locations?.[holding?.locationId]?.regionId ?? null;
  const there = worthOfGoods(basket, { economy, regionId: dest?.regionId ?? null, cfg });
  const local = worthOfGoods(basket, { economy, regionId: homeRegion, cfg });
  if (!Object.keys(basket).length) return { ok: false, why: "this hold makes nothing in a pass, so there is no run to price", made, basket, local: null, there: null };
  if (there == null) return { ok: false, why: "what this hold makes has no price there", made, basket, local, there: null };

  const carriage = carriageFor(character, holding, { toId, locations, cfg, company: companyCut != null });
  const roadDays = num(days) > 0 ? Math.round((num(days) / carriage.mult) * 10) / 10 : num(days, 0);
  const known = knownRoad(character, holding?.locationId, toId, { cfg, path });
  // ⛔ THE SHARE FOR THE ARRANGEMENT BEING PRICED, through the one helper the ROAD reads. This was a flat
  // `raid.takeShare` for every row, so a run with nobody walking was quoted the same expected loss as a run with five of
  // your own people — the card could not show the difference it was asking the player to pay for. ⚠️ It still does not
  // model escort STRENGTH: two carriers and five are priced alike, and the wipe rate says they are not alike. That is
  // Erik's open question, and §389 gates the card/road agreement rather than guessing at it.
  const sh = roadShares(cfg);
  // ⛔ WHO WILL ACTUALLY WALK IT — `standingCrewFor`, the same answer the button uses. A flat `t.crew` here quoted every
  // crewless hold an escort it does not have, and made `unescortedTakeShare` unreachable from any real hold.
  const willWalk = crew != null ? crew : standingCrewFor(holding, cfg);
  const walking = companyGuards != null ? Math.max(0, num(companyGuards, 0))
    : Array.isArray(willWalk) ? willWalk.length : num(willWalk, 0);
  const takeShare = walking > 0 ? sh.lost : sh.alone;
  // ⚑ HAZARD IS PER DAY AND PER POINT OF THE ROAD'S DANGER, so a faster road is a safer one — which is Erik's own
  // note on lever C, and it falls out of the arithmetic rather than being added to it.
  const encounters = Math.max(0, num(danger)) * perDangerChance * Math.max(0, roadDays) * known.mult;
  // ⛔ "THEY CARRY THE ROAD RISK AND BRING THEIR OWN GUARDS" IS RESOLVED ON THE ROAD, NOT PREDICTED HERE. My first cut
  // subtracted `guards × a dial` from the expected loss, and measuring the real contest showed that dial would lie in
  // both directions: at danger 1–3 the guards lose NOTHING where an unescorted cart loses half, and at danger 5 three
  // guards lose EVERYTHING — because losing the fight takes the whole load while walking with nobody takes half.
  // ⚠️ THAT INVERSION IS NOT ABOUT COMPANIES: it is equally true of your own carriers, and it lives in
  // `resolveRoadHazard`, so it went to the PO as a measurement instead of into a number I chose. This line therefore
  // charges a hired run exactly what it charges your own crew — one rule for both — and the guards are SAID on the row.
  const lossShare = Math.min(1, encounters * takeShare);
  const keep = companyCut != null ? 0 : crewKeepPerPass(holding, cfg, { crew: willWalk }).keep;
  const cut = companyCut != null ? clamp01(Number(companyCut)) : 0;
  const fee = Math.round(there * cut * 10) / 10;
  const loss = Math.round(there * lossShare * 10) / 10;
  // ⛔ AND THE WAIT. A standing run departs once per ROUND TRIP, so the hold's production piles up between
  // departures — on average half of one load standing in the shed, exposed. ⚑ `baseWaitCost` is what the shed already
  // risks when you sell at home, so what a route costs is the DIFFERENCE: this is the road's own toll on the pile, not
  // a second charge for a risk the hold already ran.
  const madeUnits = Object.values(basket).reduce((a, n) => a + num(n), 0);
  // ⚠️ READ BEFORE THE STALL FEE USES IT. `node --check` cannot see a temporal-dead-zone read of a `const`; the first
  // draft divided by `perDeparture` three lines above its declaration and threw only when a market actually charged.
  const perDeparture = Math.max(1, Math.ceil((roadDays * 2) / passDays));
  const waiting = madeUnits * perDeparture / 2;
  // ⚠️ NOT `danger` — that parameter is the ROAD's worst danger, and this is the danger where the stock STANDS. Two
  // numbers about two different places; `node --check` caught the redeclaration, which is the only reason this is not
  // one name quietly answering both questions.
  const homeDanger = dangerLevel != null ? num(dangerLevel) : num(locations?.[holding?.locationId]?.dangerLevel, 0);
  const wait = waitingExposure(character, holding, { units: waiting, basket, cfg, economy, regionId: homeRegion, dangerLevel: homeDanger, people, npcCfg, day });
  const exposure = Math.max(0, Math.round((wait.cost - num(baseWaitCost)) * 10) / 10);
  // ✅ SNG-663 §2d — AND THE MARKET TAKES ITS STALL FEE, per load that sells. ⚠️ PER DEPARTURE, NOT PER PASS: a standing
  // run leaves once per round trip, so a fee charged every pass would bill a market the cart has not reached.
  // ⛔ AND A SHUT MARKET IS NOT A PRICE, IT IS A NO — the run cannot sell there at all, which is the thing that makes a
  // steep fee a real decision rather than a subtraction.
  const market = marketFeeAt(toId, { powers, character, rules, locations, worth: there });
  if (market?.closed && !market.bribe) {
    return { ok: false, why: `${market.powerName} will not let you sell at ${dest?.name || toId} — they think of you as ${market.band}`,
      made, basket, local, there, market };
  }
  // ⚠️ PER DEPARTURE BY DEFAULT — a fee per LOAD, which is what §2d authors. `markets.chargePerPass` turns it into a fee
  // per pass, which is what §2d's stated PURPOSE needs: measured, a flat per-load fee costs a far market 0.15% of its
  // rate and a near one 3.13%, so "a far market with a steep fee can lose to a near one" is not what the authored shape
  // does. Off, this line is the authored rule exactly.
  const perPassFee = !!(rules?.economy?.markets?.chargePerPass);
  const stall = market && market.fee > 0
    ? (perPassFee ? market.fee : Math.round((market.fee / Math.max(1, perDeparture)) * 10) / 10)
    : 0;
  const perPass = Math.round((there - keep - loss - fee - exposure - stall) * 10) / 10;
  return {
    ok: true, made, basket, there, local, keep, loss, fee, exposure, stall, perPass,
    companyGuards: companyGuards != null ? Math.max(0, num(companyGuards, 0)) : null,
    // ⛑ …and how many walk with it, plus the share that implies, so the row can SAY why a crewless hold loses more.
    walking, takeShare, unescorted: walking === 0,
    ...(market ? { market } : {}),
    wait: { ...wait, perDeparture, roundTrip: Math.round(roadDays * 2 * 10) / 10, atHomeDanger: homeDanger },
    firstCoin: Math.max(1, Math.ceil(Math.max(0, roadDays) / passDays)),
    days: num(days, 0), roadDays, speedMult: carriage.mult, speedLabel: carriage.label, carriage,
    encounters: Math.round(encounters * 1000) / 1000, lossShare: Math.round(lossShare * 1000) / 1000,
    runs: known.runs, hazardMult: known.mult, relay: known.relay, danger: num(danger, 0),
    gain: local == null ? null : Math.round((perPass - local) * 10) / 10,
  };
}

/** ⛔ CCODE-500 (SNG-652 §6b) — EVERY WAY THE STORE CAN LEAVE, PRICED SIDE BY SIDE.
 *
 *  Erik asked for this by name: *"cost vs benefits so you can compare against selling here."* ⚠️ And the
 *  reason it is one function rather than four numbers on a screen is that a comparison assembled at the
 *  surface is four derivations of one question — which is how a card and an engine come to disagree, the
 *  defect I have spent this week repairing in three other places.
 *
 *  Each row carries `gross`, `costs[]`, `net`, `days` and `risk`, all READ:
 *    · gross — `storeWorth` at the region whose prices apply (here, or the destination's);
 *    · the keeper's share — `keeperSells` / `handsSell`, which are SHARES OF THE STORE per pass and not
 *      prices (Erik corrected Aevi on exactly this: "if you want the keeper to sell the stock it gets the
 *      local prices");
 *    · the road — `routeBetween`'s own days, and `roadDanger` over its own path;
 *    · a company's cut — the only number a caller supplies, because no company exists in content yet.
 *
 *  ⬜ WHAT IS NOT HERE IS NOT PRICED: visiting traders and hired companies are unbuilt, so a hired-company row
 *  appears only when a caller passes a cut, and says plainly that it is a quote rather than an offer. Pure. */
export function storeExits(character, holding, { cfg = null, economy = null, locations = {}, regionId = null, companyCut = null, maxMarkets = null, density = null, dangerLevel = null, people = {}, npcCfg = {}, day = null, powers = null, rules = null, companies = null } = {}) {
  // ⚠️ `maxMarkets` WAS 4 AND THAT WAS THE DEFECT AEVI MEASURED: two 147-day markets at ×3.6 took both slots and the
  // Crossing, 33 days out at ×1.8, never appeared. It is now an override for a caller that wants one, and content
  // decides (`trade.showMarkets`, chosen over `trade.candidates` valued). ⛑ `density` is the ground under the hold —
  // null is UNMEASURED (×1), never 0, the same reading `yieldFor` gives it.
  const rows = [];
  const here = holding?.locationId ? locations[holding.locationId] : null;
  const homeRegion = regionId ?? here?.regionId ?? null;
  const worthAt = (reg) => storeWorth(holding, { economy, regionId: reg, cfg });
  const local = worthAt(homeRegion);
  const units = Object.values(holding?.store || {}).reduce((n, v) => n + (Number(v) || 0), 0);
  if (!units || local == null) return { rows, local, units, best: null, why: units ? "these goods have no price anywhere" : "the store is empty" };

  // 1 · YOU, IN PERSON — the baseline every other row is compared against.
  // ✅ SNG-663 §2d — AND SELLING HERE IS SELLING AT A MARKET TOO. A traveller pays the stall fee once per visit, so the
  // baseline every other row is compared against has to carry it, or a far market looks worse than it is.
  const hereFee = marketFeeAt(holding?.locationId, { powers, character, rules, locations, worth: local });
  rows.push({ id: "sell-here", who: "you, in person", where: here?.name || "here", price: "local",
    gross: local, market: hereFee || null,
    costs: hereFee && hereFee.fee > 0 ? [{ label: `${hereFee.powerName}'s fee to sell here (once per visit)`, value: hereFee.fee }] : [],
    net: Math.max(0, local - (hereFee?.fee || 0)), days: 0, risk: 0,
    ...(hereFee?.closed && !hereFee.bribe ? { shut: true } : {}),
    said: hereFee?.closed && !hereFee.bribe
      ? `${hereFee.powerName} will not let you sell here — they think of you as ${hereFee.band}`
      : `what this place makes, sold here, at the price it fetches here — and the store's ${local} today in one go if you want it`
        + `${hereFee && hereFee.fee > 0 ? `, less ${hereFee.fee} to ${hereFee.powerName} for the stall` : hereFee?.waived ? `, and ${hereFee.powerName} waives its stall fee for you` : ""}` });

  // 2 · THE KEEPER (or the hands, unkept) — a SHARE per pass, at the SAME price.
  const share = holding?.steward
    ? (Number.isFinite(Number(cfg?.keeperSells)) ? Number(cfg.keeperSells) : 0.5)
    : (Number.isFinite(Number(cfg?.handsSell)) ? Number(cfg.handsSell) : 0.25);
  const perPass = Math.round(local * share);
  rows.push({ id: "keeper-sells", who: holding?.steward ? "the keeper" : "the hands, with nobody keeping it",
    where: here?.name || "here", price: "local", gross: local, market: hereFee || null,
    // ✅ SNG-663 §2d: `tickStore` charges the keeper the stall fee every pass that sells, so the card must show it —
    // a card that quoted the keeper's rate without it would be the card and the tick disagreeing.
    costs: hereFee && hereFee.fee > 0 ? [{ label: `${hereFee.powerName}'s fee to sell here (each pass that sells)`, value: hereFee.fee }] : [],
    net: Math.max(0, local - (hereFee?.fee || 0)), days: share > 0 ? Math.ceil(1 / share) : null,
    perPass: Math.max(0, perPass - (hereFee?.fee || 0)), risk: 0,
    said: `${Math.round(share * 100)}% of the store a pass, at the same price — about ${perPass} next pass, settling at what the place makes, and it sits here while it waits` });

  // 3 · THE MARKETS — SNG-654 LEVER B. ⛔ RANKED BY WHAT THEY WOULD EARN, not by their gross price; ONE ROW PER
  // REGION, so the ten places of the Crossing are one market and not ten candidates; and every priced region is
  // valued before any is chosen, rather than the first four by price.
  //
  // ⚑ ONE SEARCH ANSWERS ALL OF THEM. `roadDistances` is a single Dijkstra from the hold's own place, so 38 regions
  // cost what one `routeBetween` used to — which is what makes "route more than 4 before choosing" affordable on a
  // card that renders every time the Holdings tab opens. ⚠️ Measured: all 703 region pairs in this world are
  // road-connected, so nothing is missed by ranking on roads; the gate leg is asked for the rows actually shown,
  // where it can only improve them.
  const t654 = tradeCfg(cfg);
  // the hold's own rate, at its own prices — the number every other row is compared against
  const madeBasket = (() => {
    const b = {};
    for (const y of producesPerPass(holding, cfg, { density })) if (num(y?.units) > 0) b[y.goods] = num(b[y.goods]) + num(y.units);
    return b;
  })();
  const madeUnits654 = Object.values(madeBasket).reduce((a, n) => a + num(n), 0);
  const localFlow = madeUnits654 > 0 ? worthOfGoods(madeBasket, { economy, regionId: homeRegion, cfg }) : null;
  // ⛔ WHAT THE SHED ALREADY RISKS WHEN YOU SELL AT HOME — the baseline a route's exposure is measured AGAINST, so a
  // route is not charged for a risk the hold was already running. ⚑ A keeper clears `keeperSells` of the store a pass,
  // so in steady state it holds production ÷ that share; with nobody selling, it holds whatever is actually in there.
  // ⚠️ AND THE DANGER IS THE HOLD'S OWN PLACE unless a caller overrides it: a default of 0 would have priced every
  // shed in the world as safe, which is the "a default that behaves like a value" defect exactly.
  const danger654 = dangerLevel != null ? num(dangerLevel) : num(locations?.[holding?.locationId]?.dangerLevel, 0);
  // ⚠️ IGNORING THE ROUTE ON PURPOSE: the baseline is what selling at home WOULD earn, and a standing route makes
  // `sellShareFor` zero. Reading it here would compare a route against itself.
  const localShare654 = sellShareFor(holding, cfg, { ignoreRoute: true });
  const base654 = waitingExposure(character, holding, {
    units: localShare654 > 0 ? madeUnits654 / localShare654 : storeTotal(holding),
    basket: madeBasket, cfg, economy, regionId: homeRegion, dangerLevel: danger654, people, npcCfg, day });
  const show = Math.max(1, Math.floor(Number(maxMarkets ?? t654.showMarkets ?? 3)));
  const consider = Math.max(show, Math.floor(num(t654.candidates, 12)));
  const dd = (() => { try { return roadDistances(holding.locationId, locations); } catch { return null; } })();
  const perRegion = new Map();
  for (const [id, loc] of Object.entries(locations || {})) {
    if (!loc || !loc.regionId || loc.regionId === homeRegion || id === holding.locationId) continue;
    const d = dd?.dist?.[id];
    if (!Number.isFinite(d)) continue;                       // no road from here: not an option, not a bad one
    const cur = perRegion.get(loc.regionId);
    if (!cur || d < cur.days) perRegion.set(loc.regionId, { id, loc, days: Math.round(d * 10) / 10 });
  }
  const scored = [];
  for (const m of perRegion.values()) {
    // ⚠️ `pathFrom` RETURNS `{ days, path, legs }`, NOT AN ARRAY — my first draft handed the object to `roadDanger`
    // and every hold with a market threw "path is not iterable". Read the shape; never assume it.
    const path = (() => { try { return pathFrom(dd, holding.locationId, m.id)?.path || []; } catch { return []; } })();
    const danger = roadDanger(path, locations);
    const v = routeValue(character, holding, { powers, rules, toId: m.id, days: m.days, danger, path, cfg, economy, locations, density, dangerLevel: danger654, people, npcCfg, day, baseWaitCost: base654.cost });
    if (!v.ok) continue;
    // ⛑ THE OLD FILTER'S CONTRACT, KEPT, in the new unit: a market that does not beat selling at home is not a
    // reason to travel. ⚠️ The old one compared the STORE's gross ("w <= local"), which is why a market that pays
    // better for what the hold MAKES could be excluded by what happened to be in the shed.
    if (localFlow != null && !(v.perPass > localFlow)) continue;
    scored.push({ ...m, path, danger, v });
  }
  // ⛑ AND THE REASON A HOLD SEES NO MARKETS IS SAID, not left as an empty table.
  const noFlow = scored.length === 0 && !perRegion.size;
  scored.sort((a, b) => (b.v.perPass ?? 0) - (a.v.perPass ?? 0) || a.days - b.days);
  const markets = scored.slice(0, consider).slice(0, show);

  for (const m of markets) {
    // ⚑ NOW ask the roads AND THE GATES for the rows that will be shown — a gate turns a 236-day walk into 3.9 days
    // for a traveller who has found it, and that is a real column on this card.
    const route = (() => { try { return routeBetween(holding.locationId, m.id, locations, { traveller: character }); } catch { return null; } })();
    const opt = (route?.options || []).slice().sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0] || null;
    const days = opt ? num(opt.days, m.days) : m.days;
    const path = opt?.path?.length ? opt.path : m.path;
    const danger = roadDanger(path, locations);
    const v = routeValue(character, holding, { powers, rules, toId: m.id, days, danger, path, cfg, economy, locations, density, dangerLevel: danger654, people, npcCfg, day, baseWaitCost: base654.cost });
    if (!v.ok) continue;
    const sped = v.speedMult > 1 ? `, ${v.speedLabel} rather than on foot (${v.roadDays} days instead of ${v.days})` : "";
    const road = v.runs > 0 ? `, and you have walked this road ${v.runs} time${v.runs === 1 ? "" : "s"} — ${Math.round((1 - v.hazardMult) * 100)}% less trouble on it${v.relay ? " (a relay station of yours stands on it)" : ""}` : "";
    rows.push({ id: `caravan:${m.id}`, who: "carriers from this hold", where: m.loc.name || m.id, price: "there",
      gross: worthAt(m.loc.regionId), net: worthAt(m.loc.regionId), days: v.roadDays, risk: danger,
      perPass: v.perPass, firstCoin: v.firstCoin, speedMult: v.speedMult, speedLabel: v.speedLabel,
      runs: v.runs, hazardMult: v.hazardMult, relay: v.relay, value: v, label: opt?.label || null,
      market: v.market || null,
      costs: [{ label: v.walking ? `the crew's keep (${v.walking} carrier${v.walking === 1 ? "" : "s"} from this hold)` : `nobody to pay — this hold has no hands to send`, value: v.keep },
              { label: v.unescorted
                ? `what the road is expected to take — ${Math.round(v.takeShare * 100)}%, because nobody walks with it`
                : `what the road is expected to take`, value: v.loss },
              { label: `the stock waiting for it, beyond what the shed already risks`, value: v.exposure },
              // ✅ SNG-663 §2d — the market's own stall fee, spread over the passes between departures, and it is the
              // number `routeValue` charged rather than a second reading of the same rule.
              ...(v.stall > 0 ? [{ label: `${v.market.powerName}'s fee to sell there (${v.market.fee} a load${v.market.doubled ? ", doubled — they think ill of you" : ""})`, value: v.stall }] : [])],
      said: `${v.perPass} a pass at ${m.loc.name || m.id} — what this hold makes, sold there${sped}`
        // ⛔ WHO WALKS IT, SAID. On a hold with no hands the cart goes out ALONE and the road takes a bigger share — which
        // is the real reason to hire somebody, and it was computed and never shown.
        + `${v.unescorted
            ? `. ⚠️ This hold has nobody to send, so the cart goes out alone and a robbing takes ${Math.round(v.takeShare * 100)}% rather than ${Math.round(roadShares(cfg).lost * 100)}%`
            : `, ${v.walking} of this hold's hands walking with it`}`
        + `. First coin in ${v.firstCoin} pass${v.firstCoin === 1 ? "" : "es"}${danger ? `, danger ${danger} on the way` : ", a quiet road"}${road}`
        + `${v.exposure > 0 ? `. It departs every ${v.wait.perDeparture} passes, so about ${v.wait.units} units stand waiting for it — ${v.exposure} a pass in raid risk beyond what the shed already carries` : ""}`
        + `${v.stall > 0 ? `. ${v.market.powerName} takes ${v.market.fee} a load for the right to sell there` : v.market?.waived ? `. ${v.market.powerName} waives its stall fee for you` : ""}` });
    // ✅ SNG-652 §6 / C1 — AND THE COMPANIES THAT WILL ACTUALLY CARRY THERE, each with its own cut and its own guards.
    // ⛔ This row has existed since SNG-654 and never rendered: it needed a `companyCut` from a caller, and no caller
    // passed one. `companies` is the content that was missing, and a row is now an OFFER rather than a quote.
    const coRows = [];
    for (const co of companiesFor(character, holding, { companies, locations, cfg, dist: dd?.dist || null })) {
      if (!companyReaches(co, m.id, { locations, cfg })) continue;
      // they know the gates or they do not, and that decides which road they take (`gatesUsableBy(null)` is every gate)
      const coRoute = (() => { try { return routeBetween(holding.locationId, m.id, locations, { traveller: co.knowsGates ? null : { knownPlaces: [], abilities: [] } }); } catch { return null; } })();
      const coOpt = (coRoute?.options || []).slice().sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0] || null;
      const coDays = coOpt ? num(coOpt.days, days) : days;
      const coPath = coOpt?.path?.length ? coOpt.path : path;
      const rv = routeValue(character, holding, { powers, rules, toId: m.id, days: coDays, danger: roadDanger(coPath, locations),
        path: coPath, cfg, economy, locations, density, companyCut: co.cut, companyGuards: co.guards,
        dangerLevel: danger654, people, npcCfg, day, baseWaitCost: base654.cost });
      if (!rv.ok) continue;
      const hired = holding?.route?.by === co.id && holding?.route?.toId === m.id;
      coRows.push({ id: `hire:${co.id}:${m.id}`, who: co.name, where: m.loc.name || m.id, price: "there",
        company: { id: co.id, name: co.name, cut: co.cut, guards: co.guards, knowsGates: !!co.knowsGates,
          depot: co.depotName, depotDays: co.depotDays, what: co.what || null, answersTo: co.answersTo || null },
        hired, gross: worthAt(m.loc.regionId), net: worthAt(m.loc.regionId), days: rv.roadDays, risk: rv.danger,
        perPass: rv.perPass, firstCoin: rv.firstCoin, speedMult: rv.speedMult, speedLabel: rv.speedLabel, value: rv,
        market: rv.market || null,
        costs: [{ label: `their cut (${Math.round(clamp01(Number(co.cut) || 0) * 100)}%)`, value: rv.fee },
                ...(rv.loss > 0 ? [{ label: `what the road is expected to take — their ${co.guards} guards walk it`, value: rv.loss }] : []),
                { label: `the stock waiting for them, beyond what the shed already risks`, value: rv.exposure },
                ...(rv.stall > 0 ? [{ label: `${rv.market.powerName}'s fee to sell there`, value: rv.stall }] : [])],
        said: `${rv.perPass} a pass after their ${Math.round(clamp01(Number(co.cut) || 0) * 100)}% — their people walk it and yours stay home`
          + `, and ${co.guards} of their guards walk with it${rv.danger ? ` against danger ${rv.danger} on that road` : " on a quiet road"}`
          + `${co.knowsGates && coOpt?.kind === "gate" ? `. They know the gates (${rv.roadDays} days)` : ""}`
          + `. First coin in ${rv.firstCoin} pass${rv.firstCoin === 1 ? "" : "es"}` });
    }
    // ⚠️ AT MOST TWO PER MARKET: the best rate, and the cheapest cut when that is somebody else — the two ends of the
    // real decision. Four companies across three markets was twelve rows on a card that had five, and a table nobody
    // reads is not the comparison §6b asks for. ⛑ A company already HIRED is always shown, whatever it costs.
    {
      const byRate = coRows.slice().sort((a, b) => (b.perPass ?? 0) - (a.perPass ?? 0));
      const cheapest = coRows.slice().sort((a, b) => (a.company.cut ?? 1) - (b.company.cut ?? 1))[0] || null;
      const keep = [];
      for (const r of coRows) if (r.hired) keep.push(r);
      for (const r of [byRate[0], cheapest]) if (r && !keep.includes(r)) keep.push(r);
      for (const r of keep) {
        if (coRows.length > keep.length) r.said += `. ${coRows.length} companies will carry to ${m.loc.name || m.id}`;
        r.alsoOffered = coRows.filter(x => x !== r).map(x => ({ id: x.company.id, name: x.company.name, cut: x.company.cut, perPass: x.perPass }));
        rows.push(r);
      }
    }
    if (companyCut != null) {
      const cv = routeValue(character, holding, { powers, rules, toId: m.id, days, danger, path, cfg, economy, locations, density, companyCut, dangerLevel: danger654, people, npcCfg, day, baseWaitCost: base654.cost });
      // ⛔ GATE-AWARE, which is lever C's last row: a company knows the gates whether or not YOU have found them, so
      // its route is asked with no traveller — which is exactly what `gatesUsableBy(null)` means.
      const cRoute = (() => { try { return routeBetween(holding.locationId, m.id, locations, { traveller: null }); } catch { return null; } })();
      const cOpt = (cRoute?.options || []).slice().sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0] || null;
      const cDays = cOpt ? num(cOpt.days, days) : days;
      const cv2 = cDays < days ? routeValue(character, holding, { powers, rules, toId: m.id, days: cDays, danger: roadDanger(cOpt?.path || path, locations), path: cOpt?.path || path, cfg, economy, locations, density, companyCut, dangerLevel: danger654, people, npcCfg, day, baseWaitCost: base654.cost }) : cv;
      if (cv2.ok) rows.push({ id: `company:${m.id}`, who: "a hired company", where: m.loc.name || m.id, price: "there",
        gross: worthAt(m.loc.regionId), net: worthAt(m.loc.regionId), days: cv2.roadDays, risk: 0, quote: true,
        perPass: cv2.perPass, firstCoin: cv2.firstCoin, speedMult: cv2.speedMult, speedLabel: cv2.speedLabel, value: cv2,
        costs: [{ label: `their cut (${Math.round(clamp01(Number(companyCut)) * 100)}%)`, value: cv2.fee }],
        said: `${cv2.perPass} a pass after their ${Math.round(clamp01(Number(companyCut)) * 100)}% — they carry the road and your people stay home${cOpt && cDays < days ? `, and they know the gates (${cv2.roadDays} days, not ${days})` : ""}. First coin in ${cv2.firstCoin} pass${cv2.firstCoin === 1 ? "" : "es"}` });
    }
  }

  // ⛔ AND NOW EVERY ROW IS IN THE SAME UNIT — WHAT IT EARNS IN A PASS, IN STEADY STATE.
  //
  // ⚠️ THE OLD ARITHMETIC RANKED A RATE AGAINST A PILE. `perPass` was `net ÷ passes`, so selling the store today
  // scored the WHOLE STORE (days 0 → 1 pass) while a route scored its takings divided by the road — and no route could
  // ever win, which is exactly the finding SNG-654 opens with: "long-haul trade is priced so it can never be worth it".
  // ⛑ A standing arrangement earns a RATE. Selling here, in person or through a keeper, turns what the hold makes into
  // coin at the local price. A route turns the same production into coin at the far price, less the keep and the road.
  // The pile is still answered — `net` is what it fetches today — but the comparison is between the arrangements.
  const passDays = Math.max(0.1, num(t654.passDays, 3));
  for (const r of rows) {
    const passes = Math.max(1, Math.ceil((Number(r.days) || 0) / passDays));
    r.passes = passes;
    if (r.id === "sell-here" || r.id === "keeper-sells") {
      // ⛔ THE SAME UNIT AS EVERY OTHER ROW: what this arrangement earns per pass, in steady state. Selling at home
      // — in person or through a keeper — turns what the hold MAKES into coin at the local price.
      // ⚑ A KEEPER'S FIRST PASS IS DIFFERENT FROM HER TENTH, and both are true: she sells `keeperSells` of the store
      // each pass, so a shed with one pass in it yields half of that pass, and a shed at rest yields the whole of it.
      // `thisPass` is what will actually be credited next pass (the number the Purse panel projects); `perPass` is the
      // rate the arrangement settles at, which is what a comparison between arrangements has to be in.
      // ⛑ A HOLD THAT MAKES NOTHING HAS NO RATE, so it keeps the old arithmetic — what the pile fetches, over the
      // passes it takes to sell. Measured: 1 of the 6 live holds is in that case.
      r.thisPass = r.perPass != null ? r.perPass : Math.round((Number(r.net) || 0) / passes);
      // ✅ SNG-663 §2d — LESS THE STALL FEE, which this block was overwriting. It normalises every row to the rate the
      // arrangement settles at, and `localFlow` is what the hold MAKES at the local price — which does not know about
      // the market's fee. The fee I had subtracted two hundred lines up was written over here, so the card showed the
      // cost on the receipt and the wrong total beside it.
      r.perPass = Math.max(0, (localFlow != null ? localFlow : r.thisPass) - (hereFee?.fee || 0));
      r.steady = localFlow;
    } else if (r.perPass == null) {
      r.perPass = Math.round((Number(r.net) || 0) / passes);
    }
    if (r.firstCoin == null) r.firstCoin = 1;
  }
  // ⚑ THE BEST ROW IS THE BEST RATE, and where two rates tie the one that pays SOONER wins — a keeper clearing the
  // shelves this pass is not the same offer as a road that pays in six, even at the same rate.
  const best = rows.slice().sort((a, b) => (b.perPass ?? 0) - (a.perPass ?? 0) || (a.firstCoin ?? 1) - (b.firstCoin ?? 1) || rows.indexOf(a) - rows.indexOf(b))[0] || null;
  // ⛑ AND WHAT IT COSTS, NAMED — the second half of the sentence Erik asked for. The comparison is always against
  // selling here, because that is the thing he said to compare against.
  const baseline = rows.find(r => r.id === "sell-here") || null;
  const costs = best && baseline && best.id !== baseline.id
    ? `${best.perPass} a pass against ${baseline.perPass} for selling it here yourself`
    : null;
  return { rows, local, units, best, bestCosts: costs, localFlow, makes: producesPerPass(holding, cfg, { density }),
    waiting: base654, madeUnits: madeUnits654,
    why: markets.length ? null
      : localFlow == null ? "this hold makes nothing in a pass, so there is no run to price — what is in the store is all there is"
      : noFlow ? "no road from here reaches a market in another region"
      : "no market in reach pays more for what this hold makes than it fetches at home" };
}

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
/** ⛑ SNG-659 §1 — THE SAME READER THE HOLD RAID USES: the DERIVED kit, plus whatever the stored lists add.
 *  Aevi's correction — "the level and the energy on the very same line are derived, because 0 of 132 people
 *  store either; crafts are the third leg of the same seam" — and `battleSkillsFor` has fought with `kitFor`
 *  in every duel since it shipped. Written here rather than imported because `holdings.js` imports
 *  `caravan.js` and not the other way round; the gate asserts the two copies are one text. */
function escortCraftIds(p, npcs = {}, kitDeps = null, { day = null, npcCfg = {} } = {}) {
  const ids = [];
  if (kitDeps && kitDeps.catalog) {
    try {
      const kit = kitFor(personRecordFor(p, { npcs }), { ...kitDeps, day, cfg: { ...npcCfg, ...(kitDeps.tierBands ? { tierUnlockBands: kitDeps.tierBands } : {}) } });
      for (const ab of (kit?.crafts || [])) if (ab?.id) ids.push(String(ab.id));
    } catch { /* a kit that will not draw is not a reason to lose the escort */ }
  }
  for (const rec of [p, npcs?.[p?.id]]) {
    for (const a of (Array.isArray(rec?.abilities) ? rec.abilities : [])) {
      const id = typeof a === "string" ? a : (a?.abilityId || a?.id || null);
      if (id) ids.push(String(id));
    }
  }
  return [...new Set(ids)];
}

export function resolveRoadHazard(character, car, { rng = Math.random, cfg = null, people = {}, day = null, where = null, kitDeps = null, meleeCfg = {}, npcCfg = {} } = {}) {
  // ✅ ERIK 2026-09-12: the hazard happened SOMEWHERE — `where` comes from positionOnRoad and is named in the event, so a player
  // reading the log knows which stretch of road took the load rather than only that the road did.
  const atWhere = where?.name ? ` near ${where.name}` : "";
  const raidCfg = cfg?.raid || {};
  // ⛔ THE ROAD'S OWN SHARES — see `roadShares`. This line read the HOLD's raid dial for both the lost fight and the
  // unescorted cart, which is how an unruled 50% ended up on every road in the world.
  const shares = roadShares(cfg);
  const escort = standingCarriers(car, people, character);
  // ✅ SNG-652 §6 / C1 — AND A HIRED COMPANY WALKS WITH ITS OWN GUARDS. Without this the hired run took the
  // nobody-walking-with-it branch and lost half the load, because "your people stay home" leaves `carriers` empty — so
  // the card quoted a rate the road would never pay. ⛑ They fight through the machinery an escort already fights
  // through, so a bad enough road still beats them: this is a better escort, not an insurance policy.
  const hiredGuards = Math.max(0, num(car.company?.guards, 0));

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
  if (!escort.length && !hiredGuards) {
    const taken = take(shares.alone);
    car.events.push({ at: day, what: `set upon${atWhere} with nobody walking beside it — ${describe(taken)} taken`, where: where?.placeId || null });
    return { fought: false, held: false, wiped: false, taken, fallen: [] };
  }

    // ⛔ ERIK 2026-09-14: "these aren't just bodies that can hit something — they have skills and abilities they
    // can bring to bear." ⛑ So the defenders are read for what they ACTUALLY DO, out of the GM's own prose about
    // them, and a filtration engineer on the watch stops counting as one more sword.
    // ⚠️ BEFORE THIS, NO CALLER INJECTED `contributionsOf` AT ALL — `does` fell through to `p.contributions`,
    // which a registry record has never carried, so EVERY defender landed in the anonymous block. The named/plain
    // split existed and nothing could ever reach the named half.
  const d = Math.max(1, Math.round(num(car.danger, 1)));
  const raiders = [{ n: d, quality: Math.max(1, Math.round(d / 2)), what: "raiders" }];
    // ⛔ SNG-659 §1 — AND WHAT THE ESCORT CAN DO WITH IT. Aevi's §1a names this caller by line number: "the
    // same function runs caravan escorts, so this fixes both." ⚠️ The raiders are counted FIRST here, because
    // the reach is capped by who is actually on the road — and a road party is small, so the cap does most of
    // the work: a craft reaching six against two raiders reaches two.
    const defenders = contingentsFromPeople(escort, { levelOf: (p) => num(p?.level, 1),
      contributionsOf: (p) => contributionsOf(p, { evidence: true }),
      craftsOf: (p) => escortCraftIds(p, people, kitDeps, { day, npcCfg }), energyOf: (p) => num(p?.energy, 0),
      catalogue: kitDeps?.catalog || {}, enemies: d, cfg: meleeCfg });
    // ⛑ …and the company's guards beside them, as a contingent of the shape `legionClash` already takes. Their
    // quality is a dial, not a guess at a number: `trade.companyGuardQuality`.
    if (hiredGuards) {
      defenders.push({ n: hiredGuards, quality: Math.max(1, num(tradeCfg(cfg).companyGuardQuality, 3)),
        what: `${car.company?.id ? "hired" : "hired"} guards` });
    }
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
  const share = wiped ? shares.wiped : shares.lost;
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
 *  ⛔ ARRIVAL SELLS AT THE DESTINATION'S PRICES, through `earnAt` and so `credit` — the purse's ONE door in, so trade moves
 *  coin and never mints it. Returns the receipts the news reads. */
export function tickCaravans(character, {
  day = null, locations = {}, economy = null, cfg = null, rng = Math.random, people = {}, perDangerChance = ROAD_HAZARD_PER_DANGER_DAY,
  kitDeps = null, meleeCfg = {},   // ⛔ SNG-659 §1: an escort whose kit nothing can draw fights as bodies
} = {}) {
  const out = [];
  for (const car of caravansOf(character)) {
    // ⛑ SNG-654 A — A STANDING CREW WALKING HOME. They carry nothing, so nothing can be taken from them; what the
    // return costs is TIME, and that time is why a far market departs once in ninety passes.
    if (car && car.status === "returning") {
      if (car.homeDay != null && num(day, 0) >= num(car.homeDay)) {
        car.status = "home";
        car.events.push({ at: num(day, 0), what: `the carriers are back at ${car.from}` });
        out.push({ kind: "home", caravanId: car.id, note: null });
      }
      continue;
    }
    if (!car || car.status !== "travelling") continue;
    const now = num(day, 0);
    const elapsed = Math.max(0, Math.min(num(car.days, 0), Math.round(now - num(car.lastTickDay, now))));
    car.lastTickDay = now;

    for (let i = 0; i < elapsed; i++) {
      if (!Object.keys(car.load || {}).length) break;    // nothing left to take
      // ✅ ERIK 2026-09-12: the danger WHERE THEY ARE on this day of the road, not the worst step of the whole route.
      const at = positionOnRoad(car, now - (elapsed - 1 - i), locations);
      if (rng() < clamp01(at.danger * perDangerChance)) {
        const r = resolveRoadHazard(character, car, { rng, cfg, people, day: now, where: at, kitDeps, meleeCfg });
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
  // ⛑ LEVER D — THE ROAD IS KNOWN NOW. Written at ARRIVAL, not departure: a load that was taken on the way taught you
  // nothing about walking this road safely.
  markRoadRun(character, car.from, car.to);
  // ✅ SNG-652 §6 / C1 — THEIR CUT, TAKEN WHERE THE COIN LANDS. Aevi asked whether a hired company is "a caravan whose
  // carriers are the company's people, with a cut taken on `arriveCaravan`" — it is, and taking it here means the card's
  // quote and the coin the player receives are one arithmetic rather than two.
  const cut = clamp01(num(car.company?.cut, 0));
  const theirs = cut > 0 ? Math.round(total * cut) : 0;
  const yours = Math.max(0, total - theirs);
  const cr = earnAt(character, yours, regionId, economy, { origin: "traded" });
  if (!cr.ok) { car.events.push({ at: day, what: `reached ${dest?.name || car.to}, but the coin would not settle` }); return { ok: false, why: cr.why, sold, crystal: 0, regionId }; }
  // ⛔ IN ONE CURRENCY. This line read "sold for 940 Lattice Cities scrip, after 80 to the carriers" — the 940 in the
  // market's money and the 80 in crystal, so the cut looked like 8% of a 22% share. `incomeHere` is the pure half of
  // `earnAt`: the same rate, the same rounding, the same label.
  const theirSaid = theirs ? incomeHere(theirs, regionId, economy).label : null;
  car.events.push({ at: day, what: `reached ${dest?.name || car.to} — ${describe(Object.fromEntries(Object.entries(sold).map(([g, s]) => [g, s.units])))} sold for ${saidEarned(cr)}${theirSaid ? `, after ${theirSaid} to the carriers` : ""}` });
  // ⛔ AND ON A STANDING RUN THEY WALK BACK, because the next departure needs them. ⚑ Nothing to take on the way home,
  // so no hazard is rolled for it — the road's risk in this game is a risk to the LOAD.
  if (car.standing) {
    car.status = "returning"; car.homeDay = day == null ? null : Math.round(num(day) + num(car.days));
    const h = (character?.holdings || []).find(x => x && x.id === car.holdingId);
    if (h?.route) h.route.runs = Math.max(0, Math.floor(num(h.route.runs, 0))) + 1;
  }
  return { ok: true, sold, crystal: yours, gross: total, said: saidEarned(cr), regionId, standing: !!car.standing,
    ...(theirs ? { company: { id: car.company.id, cut, took: theirs, tookSaid: theirSaid } } : {}) };
}

/** ⚑ WHAT THE GM IS TOLD, so a caravan is something the world MENTIONS rather than a number in a panel. */
export function caravansForGM(character, locations = {}) {
  const rows = caravansOf(character).filter(c => c && c.status === "travelling");
  // ⛑ SNG-654 A — AND A ROUTE THAT STANDS, even between departures, because "there is a run out of here every few
  // weeks" is a fact about the place the narrator should have.
  const standing = (character?.holdings || []).filter(h => h?.route?.toId).map(h =>
    `- a standing run out of ${h.name || h.id} to ${locations[h.route.toId]?.name || h.route.toId}`
    + `${h.route.runs ? `, walked ${h.route.runs} time${h.route.runs === 1 ? "" : "s"} so far` : ", not yet walked"}`
    + ` — its keeper holds the stock back for the cart rather than selling it here`);
  if (!rows.length) return standing.length ? standing.join("\n") : null;
  return rows.map(c => {
    const units = Object.values(c.load || {}).reduce((a, n) => a + num(n), 0);
    const who = (c.carriers || []).length;
    return `- ${units} unit(s) on the road from ${locations[c.from]?.name || c.from} to ${locations[c.to]?.name || c.to}`
      + ` — ${c.routeLabel}, ${c.days} days, ${who ? `${who} walking with it` : "⛔ NOBODY walking with it"}`
      + (c.danger ? ` · the worst of that road is danger ${c.danger}` : "");
  }).concat(standing).join("\n");
}

/* ═══ ✅ SNG-652 §6 / C1 — HIRE A TRADE COMPANY ═══
 *
 * ⛔ AEVI'S §6 TABLE: *"a company from Your People or a power's roster · the destination's price, minus their cut (e.g.
 * 15–25%) · they carry the road risk and bring their own guards; your people stay home."* And her work order: *"a row
 * you can accept on the hold's card; the load leaves with their people."*
 *
 * ⛑ THE ROW HAS BEEN IN `storeExits` SINCE SNG-654 AND HAS NEVER RENDERED, because `companyCut` had no caller anywhere
 * in app.js — its own comment said so: *"a hired-company row appears only when a caller passes a cut, and says plainly
 * that it is a quote rather than an offer."* Four authored companies are what was missing.
 *
 * ⚠️ `guards` IS READ, NOT DECORATION. "They carry the road risk" read absolutely would make a company a guaranteed
 * return and `guards` an unread field — the fourth door, on a number Aevi troubled to vary from 3 to 6. So the guards
 * ABSORB the road's expected loss: `guards × absorbPerGuard` of it, capped at all of it. At the authored default that
 * means the Keelmouth lighters (4) and the Hub Yard porters (6) carry the whole risk and the Hundred-Market carters (3)
 * leave a quarter of it with you — which is what "cheap, fast and not entirely honest" should cost. */

/** ⛔ WHICH COMPANIES CAN CARRY OUT OF THIS HOLD, and to where. A company works out of the places it `operatesFrom`, so
 *  it can take a load that starts within reach of one of them; `reaches` (a list of REGION ids) bounds where it will
 *  go, and a company with none goes anywhere the world does.
 *
 *  ⚠️ `withinDays` IS THE HOLD-TO-DEPOT LEG, and it is a real constraint rather than a flourish: the Keelmouth
 *  lighters cannot carry out of a hold in the Deepwood. Measured on the live holds: the Crossing's porters reach all
 *  six, the Keelmouth lighters reach none of them. PURE. */
export function companiesFor(character, holding, { companies = null, locations = {}, cfg = null, withinDays = null, dist = null } = {}) {
  const list = Array.isArray(companies) ? companies.filter(c => c && c.id) : [];
  if (!list.length || !holding?.locationId) return [];
  if (!locations[holding.locationId]) return [];
  const t = tradeCfg(cfg);
  // ⛔ NO BAR BY DEFAULT. §6's own line is that every way of moving the store is "available from anywhere by sending
  // word" — you do not walk to a porters' guild. At 30 days not one valley hold could hire anybody (34 to the nearest
  // depot), so a distance bar shipped the feature unreachable. `companyWithinDays` stays for content to bound one.
  const barRaw = withinDays != null ? withinDays : t.companyWithinDays;
  const bar = barRaw == null ? Infinity : num(barRaw, Infinity);
  // ⚠️ A ROAD, NOT A GEODESIC. The leg from a hold to a company's depot is one the load actually travels, and a
  // straight-line reading would have put the Keelmouth lighters eight days from a hold with no road to the coast at all.
  // ⛑ And `storeExits` already ran this Dijkstra, so it hands the map in: one search per card, not one per company.
  const dd = dist || (() => { try { return roadDistances(holding.locationId, locations)?.dist || {}; } catch { return {}; } })();
  const out = [];
  for (const c of list) {
    let best = null;
    for (const from of (Array.isArray(c.operatesFrom) ? c.operatesFrom : [])) {
      const d = dd[from];
      if (!Number.isFinite(d)) continue;                 // no road from here to their depot: not an option
      if (best == null || d < best.days) best = { from, days: Math.round(d * 10) / 10 };
    }
    if (best && best.days > bar) continue;
    // ⛔ AND THE HOLD'S OWN REGION MUST BE ONE THEY WORK. `reaches` gates BOTH ends — the Hundred-Market carters name
    // four regions and the Palelands is not among them, so Stillwater's Trouble can hire the other three and not the
    // cheapest. A company with no `reaches` works anywhere, which is three of the four.
    if (!companyReaches(c, holding.locationId, { locations, cfg })) continue;
    out.push({ ...c, depot: best?.from || (Array.isArray(c.operatesFrom) ? c.operatesFrom[0] : null) || null,
      depotName: best ? (locations[best.from]?.name || best.from) : null,
      depotDays: best ? best.days : null });
  }
  return out.sort((a, b) => (Number(a.cut) || 0) - (Number(b.cut) || 0) || (a.depotDays ?? 1e9) - (b.depotDays ?? 1e9));
}

/** ⛑ AND WILL THIS ONE CARRY TO THERE? `reaches` is a list of REGIONS, absent means anywhere, and a company that does
 *  not use the gates is bounded by the road. PURE. */
export function companyReaches(company, toId, { locations = {}, cfg = null } = {}) {
  if (!company || !toId) return false;
  const dest = locations[toId];
  if (!dest) return false;
  const regions = Array.isArray(company.reaches) ? company.reaches : null;
  if (regions && !regions.includes(dest.regionId)) return false;
  // ⛔ AND A WATER COMPANY GOES WHERE WATER GOES. `water: true` was authored and read by nothing, so the Keelmouth
  // lighters offered to carry a load 125 days inland over dry ground. Lever C's own test decides it — the place's own
  // `tags` against `trade.waterTags` — so a wharf and a river town are one rule in this file, not two.
  // ⚠️ AND LEVER C'S OWN NOTE IS NOW STALE: it recorded that no location carried a water tag. FOUR DO — keelmouth
  // (harbour, river), echo_river_crossing, firstsight and millbrook (riverside) — so the lighters serve the Fell Pell
  // and nothing else of Silas's, which is exactly the shape a water carrier should have.
  if (company.water) {
    const tags = new Set((Array.isArray(tradeCfg(cfg).waterTags) ? tradeCfg(cfg).waterTags : []).map(x => String(x).toLowerCase()));
    if (!tags.size) return false;
    return (dest.tags || []).some(x => tags.has(String(x).toLowerCase()));
  }
  return true;
}

/** ⛔ HIRE THEM — the accept. A standing run carried by their people: the hold's own crew stays home, and the route
 *  remembers WHO so every departure and every arrival reads the same company.
 *  ⚠️ IT REFUSES WITH A SENTENCE, never a bare null: every refusal here is something the player can act on. */
export function hireCompany(character, holdingId, { companyId = null, toId = null, companies = null, locations = {}, cfg = null, day = null } = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  const can = companiesFor(character, h, { companies, locations, cfg });
  const c = can.find(x => x.id === companyId);
  if (!c) {
    const named = (Array.isArray(companies) ? companies : []).find(x => x && x.id === companyId);
    return { ok: false, why: named
      ? `${named.name} does not work out of anywhere near ${h.name || "the hold"}`
      : "no company by that name" };
  }
  if (!companyReaches(c, toId, { locations, cfg })) {
    return { ok: false, why: `${c.name} does not carry into ${locations[toId]?.name || toId}` };
  }
  // ⛑ THROUGH `setRoute`, which already checks the road, the map and the hold's own place — one door for a standing run
  // whoever walks it, so a hired run and your own cannot drift apart.
  const r = setRoute(character, holdingId, { toId, carriers: [], locations, day });
  if (!r.ok) return r;
  h.route.by = c.id;
  h.route.cut = clamp01(Number(c.cut) || 0);
  h.route.guards = Math.max(0, Number(c.guards) || 0);
  // ⛔ AND WHETHER THEY USE THE GATES, because the ROAD has to be resolved the way the CARD priced it. Without this
  // the card quoted 1.6 days through a gate Silas does not know and `sendCaravan` walked his own roads for 135.3.
  h.route.knowsGates = !!c.knowsGates;
  return { ok: true, route: h.route, company: { id: c.id, name: c.name, cut: h.route.cut, guards: h.route.guards, depot: c.depotName },
    to: locations[toId]?.name || toId,
    said: `${c.name} will carry out of ${h.name || "the hold"} to ${locations[toId]?.name || toId} for ${Math.round(h.route.cut * 100)}% of what the load sells for. Your people stay home.` };
}

/** ⛑ THE COMPANY A HOLD HAS HIRED, resolved from the route. Null when the hold's own people walk it. PURE. */
export function routeCompany(holding, companies = null) {
  const id = holding?.route?.by;
  if (!id) return null;
  return (Array.isArray(companies) ? companies : []).find(c => c && c.id === id) || null;
}
