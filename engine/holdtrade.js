// holdtrade.js — ⛔ CCODE-388: TRADING WITH ANOTHER PLAYER'S HOLD.
//
// Erik's "yes" to the rules proposed after CCODE-383: the owner opens each hold to trade (nothing is for sale by default); goods sell
// at the hold's own Reach's price; the visitor pays and carries the goods away at once; the owner's next tick takes the goods out of
// the store and puts the money in their purse — and pays the visitor back for anything the store had sold out of in between.
//
// ⛔ AND IT IS NOT A SHOP. `economy.json` says so in Aevi's and Erik's words: "There is no shop screen and there should not be one. A
// trader is an NPC with wants, and buying is a conversation." So the hold's card carries what its keeper has and what it costs, the
// visitor's GM sells it in the keeper's voice, and a `holdTrades` op records the sale — which the engine checks against the card, the
// stock and the purse before a single crystal moves.
//
// ⚠️ THE MONEY IS MOVED, NEVER MADE. The buyer is debited at the sale; the owner is credited only for what the store could fill; the
// buyer is credited back for the rest. Credits equal the debit, every time. Coin's fixed supply is untouched: trade is in crystal.
// ⚠️ AND EACH SIDE ACTS ONCE. A settlement or a refund is written on the character that made it (`tradeSettled`, `tradeRefunded`)
// before it is published, so a push that fails and retries — or a merge callback run twice — can never pay anyone twice.

import { unitWorth } from "./holdings.js";
import { debit, credit } from "./purse.js";
import { addItem, removeItem } from "./inventory.js";

export const TRADES_PATH = "world/trades/valley.json";
/** A keeper sells this many of a thing at a time — no more than a stack a traveler can carry away in one hand-over. */
export const MAX_UNITS_PER_SALE = 10;

const cap1 = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

/** What an OPENED hold offers: every stored good with units on hand and a price at the hold's own Reach. Null when the hold is not open to
 *  trade. An open hold with nothing stored offers an empty list, and says so. Pure. */
export function tradeOffer(h, { economy = null, cfg = null, regionId = null, goodsNames = {} } = {}) {
  if (!h || h.trade !== true) return null;
  const goods = [];
  for (const [g, n] of Object.entries(h.store || {})) {
    const units = Math.floor(Number(n) || 0);
    if (units <= 0) continue;
    const w = unitWorth(g, { economy, regionId, cfg });
    if (!w || !(Number(w.each) > 0)) continue;
    goods.push({ goods: g, name: goodsNames[g] || g.replace(/_/g, " "), units, each: Math.max(1, Math.round(Number(w.each))) });
  }
  return { goods };
}

/** The names the economy gives each kind of goods. Pure. */
export function goodsNamesOf(economy = null) {
  return Object.fromEntries((economy?.goodsCategories || []).filter(g => g?.id).map(g => [g.id, g.name || g.id]));
}

/** How many of a good are already spoken for on a hold — orders paid and not yet filled. Pure. */
export function pendingUnits(orders = [], holdKey, goods) {
  return (orders || []).filter(o => o && o.holdKey === holdKey && o.goods === goods && o.status === "paid")
    .reduce((n, o) => n + (Number(o.units) || 0), 0);
}

/** ⛔ A SALE, recorded when the keeper sells. Checked against the hold's card (does it trade in this, how many are left once what is
 *  already spoken for is counted), paid from the buyer's crystal, and delivered as goods the buyer can sell on at any Reach's price.
 *  Mutates the buyer on success only. Returns { ok, order, why }. */
export function buyFromHold(buyer, card, { goods = null, units = 1, pending = [], worldDay = null, nowISO = null, worthBand = "useful" } = {}) {
  if (!buyer?.id) return { ok: false, why: "nobody to buy" };
  if (!card?.trades) return { ok: false, why: `${card?.name || "that hold"} is not open to trade` };
  if (card.ownerId === buyer.id) return { ok: false, why: "a hold of your own is not bought from — its store is yours" };
  const line = (card.trades.goods || []).find(x => x && x.goods === goods);
  if (!line) return { ok: false, why: `${card.name} has none of that to sell` };
  const want = Math.floor(Number(units) || 0);
  if (want < 1) return { ok: false, why: "a sale is of at least one" };
  if (want > MAX_UNITS_PER_SALE) return { ok: false, why: `a keeper sells ${MAX_UNITS_PER_SALE} at a time` };
  const left = line.units - pendingUnits(pending, card.key, goods);
  if (want > left) return { ok: false, why: left > 0 ? `only ${left} ${line.name} to be had at ${card.name}` : `${card.name} has no ${line.name} left to sell` };
  const total = want * line.each;
  const paid = debit(buyer, "crystal", total);
  if (!paid.ok) return { ok: false, why: paid.why };
  addItem(buyer, { name: cap1(line.name), kind: "misc", qty: want, goods, worth: worthBand,
    description: `Bought at ${card.name}${card.keeperName ? ` from ${card.keeperName}` : ""}.` }, {}, { distinct: false });
  const order = { id: `${card.key}|${buyer.id}|${nowISO || worldDay || Date.now()}|${goods}`, holdKey: card.key, holdId: card.id, holdName: card.name,
    ownerId: card.ownerId, ownerName: card.ownerName || null, buyerId: buyer.id, buyerName: buyer.name || null, goods, goodsName: line.name,
    units: want, each: line.each, total, worldDay, status: "paid" };
  return { ok: true, order };
}

const STAGE = { paid: 0, settled: 1, short: 1, refunded: 2 };

/** The merge: one record per order, and a status only ever moves forward. Pure. */
export function mergeOrders(remote, orders = [], { regionId = "valley" } = {}) {
  const next = { schemaVersion: 1, regionId, ...(remote && typeof remote === "object" ? remote : {}), orders: { ...(remote?.orders || {}) } };
  for (const o of orders || []) {
    if (!o?.id) continue;
    const cur = next.orders[o.id];
    if (!cur || (STAGE[o.status] ?? -1) > (STAGE[cur.status] ?? -1)) next.orders[o.id] = { ...(cur || {}), ...o };
  }
  return next;
}

/** ⛔ THE OWNER'S SIDE — fill each paid order on their holds from the store; what the store cannot fill goes back to the buyer. Written on
 *  the owner (`tradeSettled`) before it is published, so it is never paid twice. Mutates the owner. Returns { moved, news }. */
export function settleOrders(owner, orders = [], { worldDay = null } = {}) {
  const moved = [], news = [];
  owner.tradeSettled = owner.tradeSettled || {};
  for (const o of orders || []) {
    if (!o || o.ownerId !== owner.id) continue;
    const done = owner.tradeSettled[o.id];
    if (done) { if (o.status === "paid") moved.push({ ...o, ...done }); continue; }   // settled here before; the world has not heard yet
    if (o.status !== "paid") continue;
    const h = (owner.holdings || []).find(x => x && x.id === o.holdId);
    const have = Math.floor(Number(h?.store?.[o.goods]) || 0);
    const filled = Math.min(have, Number(o.units) || 0);
    if (filled > 0) {
      h.store[o.goods] = have - filled;
      credit(owner, "crystal", filled * o.each, { origin: "traded" });
    }
    const short = (Number(o.units) || 0) - filled;
    const result = { status: short ? "short" : "settled", filled, refund: short * o.each, settledWorldDay: worldDay };
    owner.tradeSettled[o.id] = result;
    moved.push({ ...o, ...result });
    if (filled) news.push({ text: `${o.buyerName || "Another traveler"} bought ${filled} ${o.goodsName} at ${o.holdName} — ${filled * o.each} crystal to you.`, worldDay, tier: "event", section: "yours" });
    if (short) news.push({ text: `${o.holdName} could not fill ${short} of the ${o.goodsName} ${o.buyerName || "a traveler"} paid for — the store had sold out, and they are paid back.`, worldDay, tier: "event", section: "yours" });
  }
  return { moved, news };
}

/** ⛔ THE BUYER'S SIDE — an order the store could not fill is paid back, and the goods that were never there are taken back if still
 *  carried. Written on the buyer (`tradeRefunded`) first. Mutates the buyer. Returns { moved, news }. */
export function refundOrders(buyer, orders = [], { worldDay = null } = {}) {
  const moved = [], news = [];
  buyer.tradeRefunded = buyer.tradeRefunded || {};
  for (const o of orders || []) {
    if (!o || o.buyerId !== buyer.id || o.status !== "short") continue;
    if (buyer.tradeRefunded[o.id]) { moved.push({ ...o, status: "refunded" }); continue; }
    const short = (Number(o.units) || 0) - (Number(o.filled) || 0);
    if (Number(o.refund) > 0) credit(buyer, "crystal", Number(o.refund), { origin: "traded" });
    const stack = (buyer.inventory || []).find(it => it && it.goods === o.goods && String(it.name).toLowerCase() === cap1(o.goodsName).toLowerCase());
    if (stack && short > 0) removeItem(buyer, stack.name, Math.min(short, Number(stack.qty) || 0));
    buyer.tradeRefunded[o.id] = { refundedWorldDay: worldDay };
    moved.push({ ...o, status: "refunded" });
    news.push({ text: `${o.holdName} could not fill ${short} of your ${o.goodsName}: ${o.refund} crystal comes back to you.`, worldDay, tier: "event", section: "yours" });
  }
  return { moved, news };
}

/** What the GM is told a near hold trades in — the line under its card. Pure. */
export function tradeLine(card, pending = []) {
  const goods = card?.trades?.goods;
  if (!Array.isArray(goods)) return null;
  const open = goods.map(g => ({ ...g, left: g.units - pendingUnits(pending, card.key, g.goods) })).filter(g => g.left > 0);
  if (!open.length) return "open to trade, and its store is empty";
  return `trades — ${open.map(g => `${g.left} ${g.name} (${g.goods}) at ${g.each} crystal each`).join("; ")}`;
}
