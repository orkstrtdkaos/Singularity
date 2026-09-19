// market.js — ⛔ CCODE-440: A HOLD IS A LOCAL MARKET.
//
// Erik 2026-09-19: "I want to be able to trade/sell random items and cruft from my pack in at my holding for money... there's no reason
// to keep them around so we can use that as a way to keep our packs tidy." And of money: "A hold should transact and act as a local
// exchange as well." "The Crossing is obvious and likely the most universal and relatively inexpensive. You can find better rates in the
// reaches but only for the money they want vs the ones they don't."
//
// ⛑ NOTHING HERE INVENTS A PRICE. An item fetches `economy.priceOf` — its worth band × the place's need × its scarcity, the number the GM
// is already honest with — and is paid through `earnAt` in the place's own money. ⚠️ MOST PACK ITEMS CARRY NO WORTH OR GOODS (the GM mints
// them bare), so a stand-in by KIND fills the gap and says so (`ITEM_WORTH_BY_KIND`, Aevi's to author as `economy.itemWorthByKind`).
// ⛔ A thing the story is carrying (`kind: "quest"`) is never sold, and the irreplaceable has no price at all (economy.json's own rule).
//
// ⛑ CHANGING MONEY follows Erik's words, and supersedes the authored "a Reach mostly will not convert": the Crossing changes anything for
// anything at its bite; the foothills change the monies they take (never scrip — only the Crossing does that); a Reach changes its own
// scrip against the money it WANTS — brought in at a better rate than the Crossing, taken out at a worse one — and will not touch money
// it does not want. ⚠️ Which money each Reach wants is Aevi's to author (`economy.regions[].money.wants`); crystal stands in.

import { priceOf } from "./economy.js";
import { earnAt, payAt, saidPaid, saidEarned, moneyClassOf, moneyLabel, placeName } from "./money.js";
import { ensurePurse, held, credit, debit, currencyDefs, baseValueOf } from "./purse.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const round2 = (x) => Math.round(x * 100) / 100;

/** ⚠️ UNAUTHORED — what a pack item with no worth of its own is taken for, by kind. Aevi's to author (`economy.itemWorthByKind`). */
export const ITEM_WORTH_BY_KIND = {
  weapon: { worth: "useful", goods: "arms" }, armor: { worth: "useful", goods: "arms" },
  tool: { worth: "useful", goods: "instruments" }, focus: { worth: "useful", goods: "instruments" },
  relic: { worth: "valuable", goods: "luxuries" }, consumable: { worth: "trivial", goods: null }, misc: { worth: "trivial", goods: null },
};

/** ⚠️ UNAUTHORED stand-ins for changing money in a Reach, in one place: what it wants, and the bite each way. Aevi authors the wants. */
export const EXCHANGE_DEFAULTS = { reachWants: ["crystal"], reachWantedIn: 0.05, reachWantedOut: 0.35 };

/** ⛔ WHAT A PACK ITEM FETCHES HERE — the whole stack, in shards. → { sellable, value, each, qty, why, name }. Pure. */
export function sellQuote(item, regionId, { economy = null, catalog = {}, effects = [] } = {}) {
  const it = typeof item === "string" ? { name: item } : (item || {});
  const name = it.customName || it.name || "that";
  const qty = Math.max(1, Math.floor(num(it.qty, 1)) || 1);
  if (String(it.kind || "") === "quest") return { sellable: false, name, qty, value: 0, why: "the story is carrying it — it is not sold" };
  const base = { ...((it.id && catalog?.[it.id]) || {}), ...it };
  const byKind = { ...ITEM_WORTH_BY_KIND, ...(economy?.itemWorthByKind || {}) }[String(base.kind || "misc")] || ITEM_WORTH_BY_KIND.misc;
  const priced = { ...base, worth: base.worth || byKind.worth, goods: base.goods || base.goodsCategory || byKind.goods || null };
  const p = priceOf(priced, regionId, { economy, effects });
  if (!p) return { sellable: false, name, qty, value: 0, why: "nobody can put a price on it" };
  if (p.refused) return { sellable: false, name, qty, value: 0, why: "not for sale — there is no price for a thing like this" };
  if (p.unwanted || !(p.price > 0)) return { sellable: false, name, qty, value: 0, why: `nobody in ${placeName(regionId)} wants it` };
  return { sellable: true, name, qty, each: p.price, value: p.price * qty, band: priced.worth, need: p.need, scarcity: p.scarcity,
    guessed: !base.worth };
}

/** ⛔ SELL FROM THE PACK, where you stand at a hold of yours: the whole stack of each thing named, paid ONCE in the place's own money.
 *  A thing that cannot be sold stays in the pack and says why. Mutates; → { ok, sold: [{name, qty, value}], kept: [{name, why}], value,
 *  earned (earnAt's receipt), why }. */
export function sellFromPack(character, names = [], { regionId = null, economy = null, catalog = {}, effects = [] } = {}) {
  const inv = Array.isArray(character?.inventory) ? character.inventory : [];
  const want = new Set((Array.isArray(names) ? names : [names]).map(n => String(n || "").toLowerCase()).filter(Boolean));
  const sold = [], kept = [], gone = new Set();
  let value = 0;
  for (const it of inv) {
    const nm = String(it?.customName || it?.name || "").toLowerCase();
    if (!it || !want.has(nm) || gone.has(it)) continue;
    const q = sellQuote(it, regionId, { economy, catalog, effects });
    if (!q.sellable) { kept.push({ name: q.name, why: q.why }); continue; }
    gone.add(it); sold.push({ name: q.name, qty: q.qty, value: q.value }); value += q.value;
  }
  if (!sold.length) return { ok: false, sold, kept, value: 0, why: kept.length ? kept.map(k => `${k.name}: ${k.why}`).join("; ") : "nothing named is in the pack" };
  character.inventory = inv.filter(it => !gone.has(it));   // the whole stack goes — a stack with no count is still a stack
  const earned = earnAt(character, value, regionId, economy, { origin: "traded" });
  return { ok: true, sold, kept, value, earned };
}

/** ⛔ WHICH MONEY CAN BE CHANGED FOR WHICH, HERE, AND AT WHAT BITE. → [{ from: {currency, regionId}, to: {currency, regionId}, spread }].
 *  `purse` names the scrip the Crossing will change (every Reach's) and what you could bring. Pure. */
export function exchangeRatesHere(regionId, economy = null, { purse = null } = {}) {
  const cls = moneyClassOf(regionId, economy);
  const table = economy?.acceptance?.acceptanceTable || {};
  const dials = { ...EXCHANGE_DEFAULTS, ...(economy?.exchange || {}) };
  const m = (currency, rid = null) => ({ currency, regionId: currency === "scrip" ? rid : null });
  const out = [];
  if (cls === "the_crossing") {
    const spread = num(table.the_crossing?.spread, 0.15);
    // ⛔ EVERY Reach's scrip, not only the tallies you hold — "a party heading into a Reach CONVERTS AT THE CROSSING FIRST" (acceptance)
    const reaches = new Set([...(economy?.regions || []).map(r => r?.regionId).filter(r => r && moneyClassOf(r, economy) === "reaches"), ...Object.keys(purse?.scrip || {})]);
    const monies = [m("crystal"), m("coin"), m("paper"), m("marks"), ...[...reaches].map(r => m("scrip", r))];
    for (const a of monies) for (const b of monies) if (a.currency !== b.currency || a.regionId !== b.regionId) out.push({ from: a, to: b, spread });
    return out;
  }
  if (cls === "foothills") {
    const spread = num(table.foothills?.spread, 0.25);
    const monies = [m("crystal"), m("coin"), m("marks")];
    for (const a of monies) for (const b of monies) if (a.currency !== b.currency) out.push({ from: a, to: b, spread });
    out.push({ from: m("paper"), to: m("crystal"), spread: 0.5 });   // "paper at 0.5" — and nobody here sells paper
    return out;
  }
  // a Reach: its own scrip, against the money it wants — and nothing it does not want
  const rid = regionId == null ? null : String(regionId);
  const wants = (economy?.regions || []).find(r => r && r.regionId === rid)?.money?.wants || dials.reachWants;
  for (const w of (Array.isArray(wants) ? wants : [])) {
    if (w === "scrip") continue;
    out.push({ from: m(w), to: m("scrip", rid), spread: num(dials.reachWantedIn, 0.05) });   // bring what they want: better than the Crossing
    out.push({ from: m("scrip", rid), to: m(w), spread: num(dials.reachWantedOut, 0.35) });  // take what they want out: dear
  }
  return out;
}

const STEP = { crystal: 0.25, coin: 0.5, paper: 1, marks: 1, scrip: 0.01 };
const floorTo = (x, step) => round2(Math.floor(x / step + 1e-9) * step);

/** ⛔ CHANGE MONEY HERE, by the place's own rates: `amount` of `from` for `to`. The out is floored to `to`'s piece; an amount that does not
 *  reach one piece moves nothing. Mutates the purse; → { ok, paid: {currency, regionId, amount}, got: {currency, regionId, amount}, spread,
 *  said, why }. */
export function exchangeAt(character, { from, to, amount } = {}, regionId = null, economy = null, { worldState = null, dry = false } = {}) {
  const purse = ensurePurse(character);
  if (!purse) return { ok: false, why: "no purse" };
  const a = round2(num(amount, 0));
  if (!(a > 0)) return { ok: false, why: "an amount to change is needed" };
  const same = (x, y) => x?.currency === y?.currency && (x?.currency !== "scrip" || String(x?.regionId) === String(y?.regionId));
  const rate = exchangeRatesHere(regionId, economy, { purse }).find(r => same(r.from, from) && same(r.to, to));
  if (!rate) return { ok: false, why: `nobody in ${placeName(regionId)} will change ${moneyLabel(1, from?.currency, from?.regionId).replace(/^1 /, "")} for ${moneyLabel(1, to?.currency, to?.regionId).replace(/^1 /, "")}` };
  const have = num(held(purse, from.currency, from.regionId), 0);
  if (have < a) return { ok: false, why: `you hold ${moneyLabel(have, from.currency, from.regionId)}` };
  const defs = currencyDefs(economy);
  const bvIn = num(baseValueOf(from.currency, defs, worldState), 0) || (from.currency === "crystal" ? 10 : 0);
  const bvOut = num(baseValueOf(to.currency, defs, worldState), 0) || (to.currency === "crystal" ? 10 : 0);
  if (!(bvIn > 0) || !(bvOut > 0)) return { ok: false, why: "one of these monies has no worth written down" };
  const got = floorTo(a * (bvIn / bvOut) * (1 - rate.spread), STEP[to.currency] || 0.01);
  if (!(got > 0)) return { ok: false, why: `${moneyLabel(a, from.currency, from.regionId)} does not come to a single piece of ${moneyLabel(1, to.currency, to.regionId).replace(/^1 /, "")} here` };
  if (dry) return { ok: true, dry: true, spread: rate.spread, paid: { ...from, amount: a }, got: { ...to, amount: got },
    said: `${moneyLabel(a, from.currency, from.regionId)} for ${moneyLabel(got, to.currency, to.regionId)}` };
  const d = debit(character, from.currency, a, { regionId: from.regionId });
  if (!d.ok) return { ok: false, why: d.why };
  const c = credit(character, to.currency, got, { origin: "exchange", regionId: to.regionId });
  if (!c.ok) { credit(character, from.currency, a, { origin: "exchange", regionId: from.regionId }); return { ok: false, why: c.why }; }
  return { ok: true, spread: rate.spread, paid: { ...from, amount: a }, got: { ...to, amount: got },
    said: `${moneyLabel(a, from.currency, from.regionId)} for ${moneyLabel(got, to.currency, to.regionId)}` };
}

/** ⛔ CCODE-441 — THE GM'S DOOR INTO THE PURSE, BY PLACE. The GM was never shown the purse and never given these ops — in no contract, ever —
 *  so nothing bought in the story cost anything and no payment ever arrived. Every op settles through the same doors as the rest of the
 *  engine and returns a receipt, refusals included; a refused op moves nothing, goods included.
 *    {op:"pay", amount, currency?, regionId?, to}          money out — with no money named, `amount` is a VALUE in shards paid here (local first)
 *    {op:"receive", amount, currency?, regionId?, origin}  money in — with none named, a value paid in the place's money (coin: only found/traded)
 *    {op:"buy"|"exchange", price, currency?, take, give, with, bargain}   a purchase — the goods move only if the price was paid
 *    {op:"sell", price, give, with}                         a sale — the goods leave, the price comes in the place's money
 *    {op:"change", amount, from:{currency, regionId}, into:{currency, regionId}}   changing money at the place's rates
 *  → [{ op, ok, settled?, said?, why? }]. Mutates the character. */
export function applyMoneyOps(character, ops = [], { regionId = null, economy = null, worldState = null, bargainOutcome = null } = {}) {
  const out = [];
  const inv = () => (character.inventory = Array.isArray(character.inventory) ? character.inventory : []);
  const nameOf = (x) => String(x?.customName || x?.name || x || "").toLowerCase();
  for (const o of (Array.isArray(ops) ? ops : []).slice(0, 6)) {
    const op = String(o?.op || "").toLowerCase();
    try {
      if (op === "pay") {
        if (o.currency) { const d = debit(character, o.currency, num(o.amount, 0), { regionId: o.regionId || regionId });
          out.push({ op, ...d, settled: !!d.ok, said: d.ok ? `Paid ${moneyLabel(o.amount, o.currency, o.regionId || regionId)}${o.to ? ` to ${o.to}` : ""}` : undefined }); continue; }
        const p = payAt(character, num(o.amount, 0), regionId, economy, { worldState });
        out.push({ op, ok: p.ok, why: p.why, settled: p.ok, said: p.ok ? `Paid ${saidPaid(p)}${o.to ? ` to ${o.to}` : ""}` : undefined }); continue;
      }
      if (op === "receive") {
        if (o.currency) { const c = credit(character, o.currency, num(o.amount, 0), { origin: o.origin || "traded", regionId: o.regionId || regionId });
          out.push({ op, ...c, settled: !!c.ok, said: c.ok ? `Received ${moneyLabel(o.amount, o.currency, o.regionId || regionId)}` : undefined }); continue; }
        const e = earnAt(character, num(o.amount, 0), regionId, economy, { origin: o.origin || "traded", worldState });
        out.push({ op, ok: e.ok, why: e.why, settled: !!e.ok && e.amount > 0, said: e.ok && e.amount > 0 ? `Received ${saidEarned(e)}` : undefined }); continue;
      }
      if (op === "buy" || op === "exchange") {
        let price = num(o.price, 0), haggled = null;
        if (o.bargain && typeof bargainOutcome === "function") { haggled = bargainOutcome({ price, rank: o.bargain.rank, margin: o.bargain.margin, economy }); if (haggled?.ok) price = haggled.newPrice; }
        const give = Array.isArray(o.give) ? o.give : [], take = Array.isArray(o.take) ? o.take : [];
        const missing = give.filter(g => !inv().some(x => nameOf(x) === nameOf(g)));
        if (missing.length) { out.push({ op, ok: false, why: `${missing.map(m => m?.name || m).join(", ")} is not in the pack` }); continue; }
        let paidSaid = "";
        if (price > 0) {
          if (o.currency) { const d = debit(character, o.currency, price * 10 / (num(baseValueOf(o.currency, currencyDefs(economy), worldState), 0) || 10), { regionId: o.regionId || regionId });
            if (!d.ok) { out.push({ op, ok: false, why: d.why }); continue; } paidSaid = moneyLabel(d.amount, o.currency, o.regionId || regionId); }
          else { const p = payAt(character, price, regionId, economy, { worldState }); if (!p.ok) { out.push({ op, ok: false, why: p.why }); continue; } paidSaid = saidPaid(p); }
        }
        for (const g of give) { const i = inv().findIndex(x => nameOf(x) === nameOf(g)); if (i >= 0) inv().splice(i, 1); }
        for (const t of take) if (t) inv().push(typeof t === "string" ? { name: t, kind: "misc", qty: 1 } : { qty: 1, kind: "misc", ...t });
        out.push({ op, ok: true, settled: true, bargain: haggled, said: `Paid ${paidSaid || "nothing"}${take.length ? ` for ${take.map(t => t?.name || t).join(", ")}` : ""}${o.with ? ` (${o.with})` : ""}` }); continue;
      }
      if (op === "sell") {
        const give = Array.isArray(o.give) ? o.give : [];
        const missing = give.filter(g => !inv().some(x => nameOf(x) === nameOf(g)));
        if (!give.length || missing.length) { out.push({ op, ok: false, why: missing.length ? `${missing.map(m => m?.name || m).join(", ")} is not in the pack` : "nothing named to sell" }); continue; }
        for (const g of give) { const i = inv().findIndex(x => nameOf(x) === nameOf(g)); if (i >= 0) inv().splice(i, 1); }
        const e = earnAt(character, num(o.price, 0), regionId, economy, { origin: "traded", worldState });
        out.push({ op, ok: true, settled: true, said: `Sold ${give.map(g => g?.name || g).join(", ")} for ${e.amount > 0 ? saidEarned(e) : "nothing"}${o.with ? ` (${o.with})` : ""}` }); continue;
      }
      if (op === "change") {
        const r = exchangeAt(character, { from: o.from, to: o.into || o.to, amount: o.amount }, regionId, economy, { worldState });
        out.push({ op, ok: r.ok, why: r.why, settled: r.ok, said: r.ok ? `Changed ${r.said}` : undefined }); continue;
      }
      out.push({ op, ok: false, why: `"${op}" is not a money op` });
    } catch (err) { out.push({ op, ok: false, why: String(err?.message || err).slice(0, 120) }); }
  }
  return out;
}
