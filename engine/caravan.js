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
import { contributionsOf } from "./combatants.js";   // SNG-541c / Erik: a defender is what they can DO, not one more body
import { unitWorth } from "./holdings.js";
import { earnAt, saidEarned } from "./money.js";   // ⛔ CCODE-437: sold for the market's own money — `earnAt` goes through `credit`   // ⛔ CCODE-437: a load is sold for the money of the market it reaches
import { enterDeathState } from "./death.js";
import { routeBetween } from "./journey.js";
import { storeWorth } from "./holdings.js";   // §6b: the comparison prices the store through the one reader that prices it

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
export function storeExits(character, holding, { cfg = null, economy = null, locations = {}, regionId = null, companyCut = null, maxMarkets = 4 } = {}) {
  const rows = [];
  const here = holding?.locationId ? locations[holding.locationId] : null;
  const homeRegion = regionId ?? here?.regionId ?? null;
  const worthAt = (reg) => storeWorth(holding, { economy, regionId: reg, cfg });
  const local = worthAt(homeRegion);
  const units = Object.values(holding?.store || {}).reduce((n, v) => n + (Number(v) || 0), 0);
  if (!units || local == null) return { rows, local, units, best: null, why: units ? "these goods have no price anywhere" : "the store is empty" };

  // 1 · YOU, IN PERSON — the baseline every other row is compared against.
  rows.push({ id: "sell-here", who: "you, in person", where: here?.name || "here", price: "local",
    gross: local, costs: [], net: local, days: 0, risk: 0,
    said: "all of it, at once, at the price it fetches here" });

  // 2 · THE KEEPER (or the hands, unkept) — a SHARE per pass, at the SAME price.
  const share = holding?.steward
    ? (Number.isFinite(Number(cfg?.keeperSells)) ? Number(cfg.keeperSells) : 0.5)
    : (Number.isFinite(Number(cfg?.handsSell)) ? Number(cfg.handsSell) : 0.25);
  const perPass = Math.round(local * share);
  rows.push({ id: "keeper-sells", who: holding?.steward ? "the keeper" : "the hands, with nobody keeping it",
    where: here?.name || "here", price: "local", gross: local, costs: [], net: local, days: share > 0 ? Math.ceil(1 / share) : null,
    perPass, risk: 0,
    said: `${Math.round(share * 100)}% of the store a pass, at the same price — about ${perPass} a pass, and it sits here while it waits` });

  // 3 · A CARAVAN, to the market that pays best after the road.
  // ⚠️ THE ROADS ARE ASKED, NOT GUESSED. Every place with a region is priced, and only the ones a route
  // actually reaches make the list — a market with no road to it is not an option.
  const seen = new Set([holding?.locationId]);
  const cand = [];
  for (const [id, loc] of Object.entries(locations || {})) {
    if (!loc || seen.has(id) || !loc.regionId || loc.regionId === homeRegion) continue;
    const w = worthAt(loc.regionId);
    if (w == null || w <= local) continue;                       // no better than home: not a reason to travel
    cand.push({ id, loc, worth: w });
  }
  cand.sort((a, b) => b.worth - a.worth);
  const markets = [];
  for (const c of cand) {
    if (markets.length >= maxMarkets) break;
    const route = routeBetween(holding.locationId, c.id, locations, { traveller: character });
    const opt = (route?.options || []).slice().sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0];
    if (!opt) continue;                                          // no road: not an option, not a bad one
    markets.push({ ...c, days: opt.days, path: opt.path || [], label: opt.label });
  }
  for (const m of markets.slice(0, 2)) {
    const risk = roadDanger(m.path, locations);
    rows.push({ id: `caravan:${m.id}`, who: "carriers from this hold", where: m.loc.name || m.id, price: "there",
      gross: m.worth, costs: [{ label: "your people are away", value: null }], net: m.worth, days: m.days, risk,
      said: `${m.worth} at ${m.loc.name || m.id} — ${m.days} day${m.days === 1 ? "" : "s"} on the road, ${risk ? `danger ${risk} on the way` : "a quiet road"}, and the carriers are off their jobs until they are back` });
    if (companyCut != null) {
      const cut = Math.max(0, Math.min(1, Number(companyCut)));
      const fee = Math.round(m.worth * cut);
      rows.push({ id: `company:${m.id}`, who: "a hired company", where: m.loc.name || m.id, price: "there",
        gross: m.worth, costs: [{ label: `their cut (${Math.round(cut * 100)}%)`, value: fee }], net: m.worth - fee, days: m.days, risk: 0,
        quote: true,
        said: `${m.worth - fee} after their ${Math.round(cut * 100)}% — they carry the road and your people stay home` });
    }
  }
  // ⛔ AND THE CLOCK IS A COST. Measured on real content the first time this ran: the best NET from Archive
  // Hollow was a caravan to Choir-Height — 368 against 120 at home, and **151.7 days on the road**. Ranking on
  // net alone would have named half a year with your people gone as the thing to do.
  // ⚠️ So every row carries what it returns PER PASS — 72 hours, the unit every other number on the card is
  // in — and the best row is chosen on that. A sale that happens now is compared against itself: `days: 0`
  // means it is done this pass, not that it is infinitely good.
  const passDays = 3;                                     // 72 hours, the pass the whole card is priced in
  for (const r of rows) {
    const passes = Math.max(1, Math.ceil((Number(r.days) || 0) / passDays));
    r.passes = passes;
    r.perPass = r.perPass != null ? r.perPass : Math.round((Number(r.net) || 0) / passes);
  }
  const best = rows.slice().sort((a, b) => (b.perPass ?? 0) - (a.perPass ?? 0) || (a.passes ?? 0) - (b.passes ?? 0))[0] || null;
  // ⛑ AND WHAT IT COSTS, NAMED — the second half of the sentence Erik asked for. The comparison is always
  // against selling here, because that is the thing he said to compare against.
  const baseline = rows.find(r => r.id === "sell-here") || null;
  const costs = best && baseline && best.id !== baseline.id
    ? `${best.perPass} a pass against ${baseline.perPass} for selling it here yourself`
    : null;
  return { rows, local, units, best, bestCosts: costs,
    why: markets.length ? null : "no road from here reaches a market that pays better" };
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
/** ⛑ SNG-659 §1 — THE SAME MERGE THE HOLD RAID MAKES, for the same measured reason: a save's registry entry
 *  for a person EXISTS and carries an empty craft list, so `registry[id] || npcs[id]` reaches nobody. Written
 *  here rather than imported because `holdings.js` imports `caravan.js` and not the other way round — a second
 *  copy of four lines beats a cycle, and the gate asserts they agree. */
function escortCraftIds(p, npcs = {}) {
  const ids = [];
  for (const rec of [p, npcs?.[p?.id]]) {
    for (const a of (Array.isArray(rec?.abilities) ? rec.abilities : [])) {
      const id = typeof a === "string" ? a : (a?.abilityId || a?.id || null);
      if (id) ids.push(String(id));
    }
  }
  return [...new Set(ids)];
}

export function resolveRoadHazard(character, car, { rng = Math.random, cfg = null, people = {}, day = null, where = null, catalogue = {}, meleeCfg = {}, npcCfg = {} } = {}) {
  // ✅ ERIK 2026-09-12: the hazard happened SOMEWHERE — `where` comes from positionOnRoad and is named in the event, so a player
  // reading the log knows which stretch of road took the load rather than only that the road did.
  const atWhere = where?.name ? ` near ${where.name}` : "";
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
      craftsOf: (p) => escortCraftIds(p, people), energyOf: (p) => num(p?.energy, 0),
      catalogue, enemies: d, cfg: meleeCfg });
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
 *  ⛔ ARRIVAL SELLS AT THE DESTINATION'S PRICES, through `earnAt` and so `credit` — the purse's ONE door in, so trade moves
 *  coin and never mints it. Returns the receipts the news reads. */
export function tickCaravans(character, {
  day = null, locations = {}, economy = null, cfg = null, rng = Math.random, people = {}, perDangerChance = ROAD_HAZARD_PER_DANGER_DAY,
  catalogue = {}, meleeCfg = {},   // ⛔ SNG-659 §1: an escort whose crafts nothing can see fights as bodies
} = {}) {
  const out = [];
  for (const car of caravansOf(character)) {
    if (!car || car.status !== "travelling") continue;
    const now = num(day, 0);
    const elapsed = Math.max(0, Math.min(num(car.days, 0), Math.round(now - num(car.lastTickDay, now))));
    car.lastTickDay = now;

    for (let i = 0; i < elapsed; i++) {
      if (!Object.keys(car.load || {}).length) break;    // nothing left to take
      // ✅ ERIK 2026-09-12: the danger WHERE THEY ARE on this day of the road, not the worst step of the whole route.
      const at = positionOnRoad(car, now - (elapsed - 1 - i), locations);
      if (rng() < clamp01(at.danger * perDangerChance)) {
        const r = resolveRoadHazard(character, car, { rng, cfg, people, day: now, where: at, catalogue, meleeCfg });
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
  const cr = earnAt(character, total, regionId, economy, { origin: "traded" });
  if (!cr.ok) { car.events.push({ at: day, what: `reached ${dest?.name || car.to}, but the coin would not settle` }); return { ok: false, why: cr.why, sold, crystal: 0, regionId }; }
  car.events.push({ at: day, what: `reached ${dest?.name || car.to} — ${describe(Object.fromEntries(Object.entries(sold).map(([g, s]) => [g, s.units])))} sold for ${saidEarned(cr)}` });
  return { ok: true, sold, crystal: total, said: saidEarned(cr), regionId };
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
