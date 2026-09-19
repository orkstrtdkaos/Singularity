// money.js — ⛔ CCODE-437: MONEY BY PLACE.
//
// Erik 2026-09-19: "The world has several kinds and so far we've just been using crystal... let's fix that." His pick of the three
// offered: LOCAL FIRST, ELSE A WORSE RATE — a place earns and charges in its own money, and if you hold none, the other money it takes is
// accepted at that place's worse rate.
//
// ⚑ WHAT WAS THERE. `economy.json` authors five currencies (crystal the reference, old coin, outland paper, per-Reach scrip, marks), an
// acceptance table (the Crossing takes everything at a 15% bite; the foothills four of them; a Reach its own scrip and "crystal (some)")
// and a conversion formula — and `purse.js` models all five honestly. ⛔ NOTHING READ THE TABLE: every flow the engine runs (a keep, a
// keeper's sale, runner fees, a build, a caravan, a trade between holds, a job, a call, quartering) was hardcoded to crystal, and in 16
// saves no currency but crystal ever held a value.
//
// ⛔ THE SHAPE. Every price in this world is quoted in SHARDS — crystal's unit, and the authored reference ("all rates below are quoted
// in shards because the world itself would quote them that way"). So a VALUE stays in shards everywhere it is computed, and only the
// purse's movement is by place: `payAt` pays a value in what the place takes, local money first; `earnAt` pays a value out in the
// place's own money. The purse keeps counts, never worth (purse.js's rule), so paper can still betray you after you are paid in it.
//
// ⚠️ THE CLASSES ARE STAND-INS UNTIL AEVI AUTHORS THEM. No record says which of the three acceptance classes a region is in; she authors
// `economy.regions[].money` and the stand-in below steps aside for it.

import { ensurePurse, held, credit, debit, currencyDefs, baseValueOf, INDIVISIBLE } from "./purse.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const round2 = (x) => Math.round(x * 100) / 100;
const EPS = 0.005;

/** ⛔ EACH MONEY'S SMALLEST PIECE, as `economy.json` authors it in words: crystal "shard / half / quarter-cut", coin "coin / half",
 *  paper "notes come in 1 / 5 / 20", marks not divisible at all, scrip "yes, locally". A cost rounds UP to the piece and an income DOWN —
 *  nobody hands over 0.37 of a coin, and a trader keeps the crumb. Pure. */
export const MONEY_STEP = { crystal: 0.25, coin: 0.5, paper: 1, marks: 1, scrip: 0.01 };
const stepOf = (currency) => num(MONEY_STEP[currency], 0.01) || 0.01;
const ceilTo = (x, step) => round2(Math.ceil(x / step - 1e-9) * step);
const floorTo = (x, step) => round2(Math.floor(x / step + 1e-9) * step);

/** ⚠️ UNAUTHORED stand-ins, one place: what crystal counts for in a Reach ("crystal (some)"), and the foothills' authored paper rate. */
export const MONEY_DEFAULTS = { reachCrystalRate: 0.7, foothillPaperRate: 0.5 };

/** ⛔ WHICH OF THE THREE ACCEPTANCE CLASSES A REGION IS IN. Authored: `economy.regions[].money.class`. ⚠️ Stand-in until it is: the
 *  Crossing's own region is the clearing house; the valley, the Echo Vale, the foothills and a place nobody has classed take foothill
 *  money; every other region is a Reach, which pays in its own scrip. Pure. */
export function moneyClassOf(regionId, economy = null) {
  const rid = regionId == null ? "" : String(regionId);
  const authored = (economy?.regions || []).find(r => r && r.regionId === rid)?.money?.class;
  if (authored === "the_crossing" || authored === "foothills" || authored === "reaches") return authored;
  if (rid === "the_center" || rid === "the_crossing") return "the_crossing";
  if (!rid || rid === "valley" || rid === "the_echo_vale" || rid.startsWith("foothill_")) return "foothills";
  return "reaches";
}

/** A region's name as a player reads it: "the_palelands" → "Palelands", "foothill_plainstead" → "Plainstead". Pure. */
export function regionName(regionId) {
  const s = String(regionId || "").replace(/^foothill_/, "").replace(/^the_/, "").replace(/_/g, " ").trim();
  return s ? s.replace(/\b\w/g, c => c.toUpperCase()) : "these parts";
}

/** A region as a sentence names it: "the Palelands", "the valley", "Plainstead", "the Crossing". Pure. */
export function placeName(regionId) {
  const rid = String(regionId || "");
  if (!rid) return "these parts";
  if (rid === "the_center" || rid === "the_crossing") return "the Crossing";
  if (rid === "valley") return "the valley";
  return rid.startsWith("the_") ? `the ${regionName(rid)}` : regionName(rid);
}

/** A money's authored worth against crystal's, with crystal's own reference standing when no economy is loaded. */
const bvOf = (currency, economy, worldState) => num(baseValueOf(currency, currencyDefs(economy), worldState), 0) || (currency === "crystal" ? 10 : 0);

/** How a sum of one money reads: "14 crystal", "46.67 Palelands scrip", "3 marks". Pure. */
export function moneyLabel(amount, currency, regionId = null) {
  const n = round2(num(amount, 0));
  const shown = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
  if (currency === "scrip") return `${shown} ${regionName(regionId)} scrip`;
  if (currency === "paper") return `${shown} in outland paper`;
  if (currency === "coin") return `${shown} old coin`;
  return `${shown} ${currency}`;
}

/** ⛔ WHAT A PLACE PAYS IN AND WHAT IT TAKES, and at what rate — the acceptance table read for one region. `purse` is only consulted to
 *  list the scrip the Crossing will take, since it takes every Reach's. → { cls, regionId, pays: {currency, regionId}, takes:
 *  [{currency, regionId, rate, local}], spread }. ⚠️ CHANGING money is NOT here: Erik ruled mid-build that a Reach does change money,
 *  at better rates for the money it wants (superseding the authored "mostly will not convert"), and the Crossing is the universal and
 *  cheaper changer — built as its own door, never claimed by a line before it exists. Pure. */
export function moneyHere(regionId, economy = null, { purse = null } = {}) {
  const cls = moneyClassOf(regionId, economy);
  const table = economy?.acceptance?.acceptanceTable || {};
  const dials = { ...MONEY_DEFAULTS, ...(economy?.money || {}) };
  const rid = regionId == null ? null : String(regionId);
  if (cls === "the_crossing") {
    const spread = num(table.the_crossing?.spread, 0.15);
    const others = ["coin", "paper", "marks"].map(c => ({ currency: c, regionId: null, rate: 1 - spread, local: false }));
    const scrip = Object.keys(purse?.scrip || {}).map(r => ({ currency: "scrip", regionId: r, rate: 1 - spread, local: false }));
    return { cls, regionId: rid, pays: { currency: "crystal", regionId: null }, spread,
      takes: [{ currency: "crystal", regionId: null, rate: 1, local: true }, ...others, ...scrip] };
  }
  if (cls === "foothills") {
    const spread = num(table.foothills?.spread, 0.25);
    const paperRate = (() => { const m = String(table.foothills?.paper || "").match(/([\d.]+)/); return m ? Number(m[1]) : dials.foothillPaperRate; })();
    // "local scrip" is taken — but only a tally someone actually holds is named, or every foothill would be said to issue one
    const takes = [{ currency: "crystal", regionId: null, rate: 1, local: true },
      { currency: "coin", regionId: null, rate: 1 - spread, local: false },
      ...(rid && num(purse?.scrip?.[rid], 0) > 0 ? [{ currency: "scrip", regionId: rid, rate: 1 - spread, local: false }] : []),
      { currency: "paper", regionId: null, rate: paperRate, local: false },
      { currency: "marks", regionId: null, rate: 1 - spread, local: false }];
    return { cls, regionId: rid, pays: { currency: "crystal", regionId: null }, spread, takes };
  }
  // a Reach: its own scrip, and crystal at the Reach's worse rate — nothing else
  return { cls, regionId: rid, pays: { currency: "scrip", regionId: rid }, spread: null,
    takes: [{ currency: "scrip", regionId: rid, rate: 1, local: true },
      { currency: "crystal", regionId: null, rate: num(dials.reachCrystalRate, 0.7), local: false }] };
}

/** ⛔ A COST AT A PLACE. `value` is in shards; it is paid in the place's own money first, and what that does not cover in the other money
 *  the place takes, each at its rate (the least lost first, marks last because they only go whole). ALL OR NOTHING: a cost the purse
 *  cannot meet moves nothing and says how short it is. `dry: true` answers without moving anything. → { ok, paid: [{currency,
 *  regionId, amount, rate, local}], value, short?, why?, here }. Mutates the purse on success unless dry. */
export function payAt(character, value, regionId, economy = null, { worldState = null, dry = false } = {}) {
  const V = round2(num(value, 0));
  const purse = ensurePurse(character);
  const here = moneyHere(regionId, economy, { purse });
  if (!(V > 0)) return { ok: true, paid: [], value: 0, here };
  if (!purse) return { ok: false, why: "no purse", value: V, here };
  const ref = bvOf("crystal", economy, worldState);
  const order =[...here.takes.filter(t => t.local), ...here.takes.filter(t => !t.local && !INDIVISIBLE.has(t.currency)).sort((a, b) => b.rate - a.rate),
    ...here.takes.filter(t => !t.local && INDIVISIBLE.has(t.currency))];
  let left = V;
  const plan = [];
  for (const t of order) {
    if (left <= EPS) break;
    const perUnit = (bvOf(t.currency, economy, worldState) / ref) * num(t.rate, 0);   // what one unit of this money settles here, in shards
    if (!(perUnit > 0)) continue;
    const have = num(held(purse, t.currency, t.regionId), 0);
    if (!(have > 0)) continue;
    const step = INDIVISIBLE.has(t.currency) ? 1 : stepOf(t.currency);
    const need = ceilTo(left / perUnit, step);
    const use = Math.min(floorTo(have, step), need);
    if (!(use > 0)) continue;
    plan.push({ currency: t.currency, regionId: t.regionId || null, amount: use, rate: t.rate, local: !!t.local });
    left = round2(left - use * perUnit);
  }
  if (left > EPS) {
    const own = priceHere(V, regionId, economy, { worldState }).label;
    return { ok: false, value: V, short: round2(left), here,
      why: `${own} is owed, and what you carry that ${placeName(regionId)} will take does not cover it` };
  }
  if (!dry) for (const p of plan) debit(character, p.currency, p.amount, { regionId: p.regionId });
  return { ok: true, paid: plan, value: V, here, dry: !!dry };
}

/** ⛔ INCOME AT A PLACE. `value` in shards, paid out in the place's own money: a Reach pays its scrip, everywhere else crystal.
 *  → credit()'s receipt plus { currency, regionId, amount, value }. Mutates the purse. */
export function earnAt(character, value, regionId, economy = null, { origin = "traded", worldState = null } = {}) {
  const V = round2(num(value, 0));
  const here = moneyHere(regionId, economy);
  if (!(V > 0)) return { ok: true, amount: 0, value: 0, currency: here.pays.currency, regionId: here.pays.regionId, here };
  const amount = incomeHere(V, regionId, economy, { worldState }).amount;
  if (!(amount > 0)) return { ok: true, amount: 0, value: V, currency: here.pays.currency, regionId: here.pays.regionId, here, crumb: true };
  const r = credit(character, here.pays.currency, amount, { origin, regionId: here.pays.regionId });
  return { ...r, currency: here.pays.currency, regionId: here.pays.regionId, amount, value: V, here };
}

/** What a value costs here in the place's own money, for a card or a button: { amount, currency, regionId, label }. Pure. */
export function priceHere(value, regionId, economy = null, { worldState = null } = {}) {
  const here = moneyHere(regionId, economy);
  const ref = bvOf("crystal", economy, worldState);
  const bv = bvOf(here.pays.currency, economy, worldState) || ref;
  const amount = ceilTo(num(value, 0) * ref / bv, stepOf(here.pays.currency));   // a price shown is a price paid: rounded as a cost
  return { amount, currency: here.pays.currency, regionId: here.pays.regionId, label: moneyLabel(amount, here.pays.currency, here.pays.regionId) };
}

/** What a value EARNS here, in the place's own money, rounded as an income — the number `earnAt` will pay, for a card. Pure. */
export function incomeHere(value, regionId, economy = null, { worldState = null } = {}) {
  const here = moneyHere(regionId, economy);
  const ref = bvOf("crystal", economy, worldState);
  const bv = bvOf(here.pays.currency, economy, worldState) || ref;
  const amount = floorTo(num(value, 0) * ref / bv, stepOf(here.pays.currency));
  return { amount, currency: here.pays.currency, regionId: here.pays.regionId, label: moneyLabel(amount, here.pays.currency, here.pays.regionId) };
}

/** How a payment reads: "14 crystal", "30 Palelands scrip and 5.72 crystal". Pure. */
export function saidPaid(receipt) {
  const parts = (receipt?.paid || []).map(p => moneyLabel(p.amount, p.currency, p.regionId));
  return parts.length ? parts.join(" and ") : moneyLabel(0, "crystal");
}

/** How an earning reads. Pure. */
export function saidEarned(receipt) { return moneyLabel(receipt?.amount || 0, receipt?.currency || "crystal", receipt?.regionId || null); }

/** ⛔ THE LINE THE GM AND THE PLAYER READ ABOUT MONEY HERE — what the place pays in, and what else it takes and how dear. ⚠️ Nothing about
 *  changing money until the exchange exists. Pure. */
export function moneyLine(regionId, economy = null) {
  const here = moneyHere(regionId, economy);
  const pays = here.pays.currency === "scrip" ? `${regionName(here.pays.regionId)} scrip` : here.pays.currency;
  const others = here.takes.filter(t => !t.local).map((t, i) => {
    const what = t.currency === "scrip" ? (t.regionId ? `${regionName(t.regionId)} scrip` : "scrip") : t.currency === "paper" ? "outland paper" : t.currency === "coin" ? "old coin" : t.currency;
    return `${what} (${Math.round(t.rate * 100)}%${i === 0 ? " of its worth" : ""})`;
  });
  return `Money in ${placeName(regionId)}: paid out in ${pays}${others.length ? `; also taken: ${others.join(", ")}` : ""}.`;
}

/** ⛔ CCODE-443 — THE STARTING PURSE BY BACKGROUND, as Aevi authored it (`po/SPEC_aevi_starting_purse.md` §2–§3, ruled by Erik 2026-09-19).
 *  The quantity is LIQUIDITY — how much of a prior life converted to portable value when it was left — never approval (DIRECTIVE_SNG-280):
 *  "contraband is portable by definition; a temple's wealth belongs to the temple." On the `worthBands` rungs: L0 0 · L1 4 · L2 15 · L3 50
 *  shards, every one below `well-found`. ⚠️ This is her table transcribed; `economy.startingPurse` (her content, when she moves it there)
 *  wins. The background sets HOW MUCH; the place sets WHICH MONEY (`earnAt`) — never summed. */
export const STARTING_PURSE_SPEC = {
  rungs: { L0: 0, L1: 4, L2: 15, L3: 50 },
  byBackground: Object.fromEntries([
    ...["trader", "broker", "smuggler"].map(b => [b, "L3"]),
    ...["duelist", "arena_fighter", "bodyguard", "war_leader", "mechanist", "smith", "craftsman", "physician", "envoy", "performer", "spy",
      "ruin_picker", "former_professional"].map(b => [b, "L2"]),
    ...["line_soldier", "skirmisher", "warden", "hunter", "builder", "farmer", "river_runner", "survivalist", "cartographer", "lawspeaker",
      "organizer", "self_taught", "battlefield_taught", "found_it_by_accident", "lineage_taught", "apprenticed_to_a_legend", "precursor_marked"].map(b => [b, "L1"]),
    ...["orphan", "exile", "drifter", "devotee", "scholar", "archivist", "temple_trained"].map(b => [b, "L0"]),
  ]),
};

/** The worth (shards) a background left its old life with — or null when the table does not name it: ⛔ a background is ASKED, never
 *  assigned (`playerChooses`), so an unnamed one is paid nothing until it is placed. Pure. */
export function startingPurseFloor(background, economy = null) {
  const spec = economy?.startingPurse && typeof economy.startingPurse === "object" ? economy.startingPurse : STARTING_PURSE_SPEC;
  const rung = spec.byBackground?.[String(background || "")];
  if (!rung) return null;
  const v = Number(spec.rungs?.[rung]);
  return Number.isFinite(v) ? Math.max(0, v) : null;
}
