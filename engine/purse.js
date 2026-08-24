// engine/purse.js — CCODE-234 / §3 of the purse-and-exchange work order.
//
// ⛔ THE WHOLE GAP WAS THE PURSE. `economy.js` could quote an honest price and nothing in the game could
// pay it: 42 items carry `worth`, five currencies are authored, `priceOf` works — and no character held
// money. This is the missing half.
//
// ⚠️ AND A PURSE OF FIVE INTEGERS IS THE WRONG SHAPE, which is Aevi's load-bearing note and the reason
// this file is longer than `{crystal: 12}`. Each currency is a different KIND of thing:
//
//   crystal  the reference. everything converts through it.
//   coin     ⛔ FIXED SUPPLY — found, never minted. no path may create one.
//   paper    ⚠️ the only one with ISSUER RISK. `baseValue` is a WORLD-STATE VARIABLE, so a purse holds
//            NOTES, never a worth — the worth is computed at the moment you ask, and it can fall while
//            the notes sit there.
//   scrip    ⛔ PER-REACH, fungible only inside its own Reach. keyed by `regionId`, never one number.
//   marks    ⛔ NOT DIVISIBLE. a settled obligation is whole or it is nothing.
//
// ⛔ SO THE STORED SHAPE IS COUNTS, NOT VALUE. Storing worth would freeze paper at the rate it was earned
// and silently defeat the one currency whose whole character is that it can betray you.

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** The five, and what each one refuses. Read from content where possible; these are the invariants. */
export const INDIVISIBLE = new Set(["marks"]);
/** ⛔ COIN CANNOT BE CREATED. It moves between purses and it is found in the world; it is never minted. */
export const UNMINTABLE = new Set(["coin"]);
/** Provenances that MOVE existing money rather than making new money. */
export const TRANSFER_ORIGINS = new Set(["found", "traded", "paid", "gift", "reward", "loot", "exchange"]);

export function emptyPurse() {
  return { crystal: 0, coin: 0, paper: 0, marks: 0, scrip: {} };
}

export function ensurePurse(character) {
  if (!character) return null;
  if (!character.purse) character.purse = emptyPurse();
  if (!character.purse.scrip || typeof character.purse.scrip !== "object") character.purse.scrip = {};
  return character.purse;
}

/** What the purse holds of one currency. `scrip` needs a Reach; without one it is not a number at all. */
export function held(purse, currency, regionId = null) {
  if (!purse) return 0;
  if (currency === "scrip") {
    if (regionId == null) return null;              // ⚠️ NOT ZERO. "how much scrip" has no answer.
    return num(purse.scrip?.[regionId], 0);
  }
  return num(purse[currency], 0);
}

/** ⛔ EVERY REFUSAL IS LEGIBLE. `{ok:false, why}` and never a silent zero — Aevi's acceptance 2 is about
 *  the player being TOLD their scrip is the wrong Reach's, not about the number coming back small. */
const refuse = (why, extra = {}) => ({ ok: false, why, ...extra });
const allow = (extra = {}) => ({ ok: true, ...extra });

/** Can this amount even exist in this currency? */
export function validAmount(currency, amount) {
  const a = Number(amount);
  if (!Number.isFinite(a) || a <= 0) return refuse("an amount must be a positive number");
  // ⛔ NO FRACTIONAL MARK, EVER. A settled obligation is whole or it is nothing.
  if (INDIVISIBLE.has(currency) && !Number.isInteger(a)) {
    return refuse(`${currency} cannot be split — a settled obligation is whole or it is nothing`, { indivisible: true });
  }
  return allow();
}

/** Money INTO the purse. ⚠️ `origin` is required and it is not bookkeeping: it is how the coin rule is
 *  enforced. A credit with no provenance is exactly "a coin from nowhere". */
export function credit(character, currency, amount, { origin = null, regionId = null } = {}) {
  const purse = ensurePurse(character);
  if (!purse) return refuse("no character");
  const v = validAmount(currency, amount);
  if (!v.ok) return v;
  if (currency === "scrip" && !regionId) {
    return refuse("scrip belongs to a Reach — it cannot be credited without one", { needsRegion: true });
  }
  // ⛔ THE FIXED-SUPPLY RULE, ENFORCED AT THE ONLY DOOR IN. Coin may be MOVED or FOUND; it may not be made.
  if (UNMINTABLE.has(currency) && !TRANSFER_ORIGINS.has(String(origin))) {
    return refuse(`${currency} has a fixed supply — it can be found or taken in trade, never minted`
      + (origin ? ` (origin "${origin}" would create it)` : " (no origin given)"), { unmintable: true });
  }
  if (currency === "scrip") purse.scrip[regionId] = num(purse.scrip[regionId], 0) + Number(amount);
  else purse[currency] = num(purse[currency], 0) + Number(amount);
  return allow({ currency, amount: Number(amount), regionId: regionId || null, origin });
}

/** Money OUT of the purse. */
export function debit(character, currency, amount, { regionId = null } = {}) {
  const purse = ensurePurse(character);
  if (!purse) return refuse("no character");
  const v = validAmount(currency, amount);
  if (!v.ok) return v;
  if (currency === "scrip") {
    if (!regionId) return refuse("scrip belongs to a Reach — say which", { needsRegion: true });
    const have = num(purse.scrip[regionId], 0);
    if (have < amount) return refuse(`not enough ${regionId} scrip — ${have} of ${amount}`, { short: amount - have });
    purse.scrip[regionId] = have - Number(amount);
    return allow({ currency, amount: Number(amount), regionId });
  }
  const have = num(purse[currency], 0);
  if (have < amount) return refuse(`not enough ${currency} — ${have} of ${amount}`, { short: amount - have });
  purse[currency] = have - Number(amount);
  return allow({ currency, amount: Number(amount) });
}

/** ⛔ SCRIP DOES NOT TRAVEL, AND THE REFUSAL SAYS SO. Acceptance 2: the player is told their tally is the
 *  wrong Reach's, rather than handed a silent zero and left to wonder. */
export function canSpendHere(purse, currency, regionId, { acceptance = null, hereKey = null } = {}) {
  if (currency !== "scrip") return allow();
  const holdings = Object.entries(purse?.scrip || {}).filter(([, n]) => num(n, 0) > 0);
  if (!holdings.length) return refuse("you hold no scrip at all");
  const mine = num(purse?.scrip?.[regionId], 0);
  if (mine > 0) return allow({ regionId, amount: mine });
  // ⚠️ NAME WHERE IT *IS* GOOD. "This is Ashlands scrip and you are in the Fen" is a fact the player can
  // act on; "0" is not.
  return refuse(`scrip is good only in the Reach that issued it — yours is ${holdings.map(([r, n]) => `${n} of ${r}`).join(", ")}`
    + (regionId ? `, not ${regionId}` : ""), { wrongReach: true, holds: Object.fromEntries(holdings) });
}

/** ⚠️ THE WORTH OF WHAT YOU HOLD, COMPUTED NOW — never stored. `paper.baseValue` is a world-state variable,
 *  so a purse that cached its worth would be lying the moment an issuer moved. That is the whole point of
 *  paper and the reason worth is a function and not a field. */
export function worthOf(purse, economy, { regionId = null, worldState = null } = {}) {
  const defs = currencyDefs(economy);
  const ref = num(defs.crystal?.baseValue, 10) || 10;
  const lines = [];
  let total = 0;
  for (const cur of ["crystal", "coin", "paper", "marks"]) {
    const n = num(purse?.[cur], 0);
    if (!n) continue;
    const bv = baseValueOf(cur, defs, worldState);
    const worth = n * bv / ref;
    lines.push({ currency: cur, count: n, baseValue: bv, worthInCrystal: worth });
    total += worth;
  }
  for (const [rid, n] of Object.entries(purse?.scrip || {})) {
    if (!num(n, 0)) continue;
    const bv = baseValueOf("scrip", defs, worldState);
    // ⛔ SCRIP OUTSIDE ITS REACH IS WORTH NOTHING HERE, and the line says so rather than omitting it.
    const usable = regionId == null || rid === regionId;
    const worth = usable ? n * bv / ref : 0;
    lines.push({ currency: "scrip", regionId: rid, count: n, baseValue: bv, worthInCrystal: worth, usableHere: usable });
    total += worth;
  }
  return { totalInCrystal: total, lines };
}

/** The authored issuer risk: `paper`'s baseValue can be moved by world state. Everything else is stable. */
export function baseValueOf(currency, defs, worldState = null) {
  const authored = num(defs?.[currency]?.baseValue, 0);
  if (currency !== "paper") return authored;
  // ⚠️ A MULTIPLIER, NOT A REPLACEMENT — the authored number stays the reference so a drift is readable
  // against it. Absent world state means "nothing has happened to the issuer", not "worthless".
  const drift = worldState?.economy?.paperValue ?? worldState?.paperValue ?? null;
  if (drift == null) return authored;
  return Number.isFinite(Number(drift)) ? Number(drift) : authored;
}

export function currencyDefs(economy) {
  const list = economy?.currencies || [];
  const out = {};
  for (const c of (Array.isArray(list) ? list : Object.values(list))) if (c?.id) out[c.id] = c;
  return out;
}

/** ⛔ CONVERSION, INSPECTABLE — the authored formula, with every term returned so a player can see the
 *  bite. `amount_out = floor(amount_in × (baseValue_in / baseValue_out) × (1 − spread))`. */
export function convert(amountIn, fromCur, toCur, { economy, spread = null, at = "the_crossing", worldState = null } = {}) {
  const defs = currencyDefs(economy);
  const v = validAmount(fromCur, amountIn);
  if (!v.ok) return v;
  const table = economy?.acceptance?.acceptanceTable || {};
  const spr = spread != null ? Number(spread) : num(table[at]?.spread, 0.15);
  const bvIn = baseValueOf(fromCur, defs, worldState), bvOut = baseValueOf(toCur, defs, worldState);
  if (!bvIn || !bvOut) return refuse(`no authored baseValue for ${!bvIn ? fromCur : toCur}`);
  const raw = Number(amountIn) * (bvIn / bvOut) * (1 - spr);
  // ⛔ AND THE INDIVISIBLE RULE SURVIVES CONVERSION. Floor is the authored rounding; for marks it is also
  // the only legal answer, and converting INTO a fraction of a mark must produce nothing rather than 0.5.
  const out = Math.floor(raw);
  if (out <= 0) {
    return refuse(`${amountIn} ${fromCur} does not reach one ${toCur} at a ${Math.round(spr * 100)}% spread`,
      { raw, spread: spr });
  }
  return allow({ amountOut: out, amountIn: Number(amountIn), from: fromCur, to: toCur,
    baseValueIn: bvIn, baseValueOut: bvOut, spread: spr, raw,
    // the worked line Erik's visibility rule asks for: precise, visible, and not narration
    math: `${amountIn} × (${bvIn}/${bvOut}) × ${(1 - spr).toFixed(2)} = ${raw.toFixed(2)} → ${out}`,
    bite: Number((raw / (1 - spr) - raw).toFixed(2)) });
}

/** A one-line purse readout. ⚠️ Erik's visibility rule: the interface says the number; the trader says
 *  "ten for those, and I'm being generous". This is the interface half. */
export function purseLine(purse, { regionId = null } = {}) {
  const bits = [];
  for (const cur of ["crystal", "coin", "paper", "marks"]) {
    const n = num(purse?.[cur], 0);
    if (n) bits.push(`${n} ${cur}`);
  }
  for (const [rid, n] of Object.entries(purse?.scrip || {})) {
    if (!num(n, 0)) continue;
    bits.push(`${n} ${rid} scrip${regionId && rid !== regionId ? " (not good here)" : ""}`);
  }
  return bits.length ? bits.join(" · ") : "empty";
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// §4 — THE EXCHANGE. ⛔ NOT A SHOP, AND `economy.json` SAYS SO IN ITS OWN VOICE:
//
//   "There is no shop screen and there should not be one. A trader is an NPC with wants, and buying is a
//    conversation. The price model exists so the GM has a number to be honest about, not so a UI can
//    render a catalogue."
//
// ⚠️ SO THIS IS A TRANSACTION PRIMITIVE THE GM INVOKES, NOT A SCREEN. `priceLine` already gives the GM the
// honest number; what was missing was the SETTLING.
//
// ⛔ AND ERIK'S RULING REMOVES THE HARD HALF: "the price is paid and the goods exchanged, even if those
// goods are a month's worth of work." The exchange RESOLVES AND CLOSES. Nothing is escrowed, nothing is
// owed, no contract state persists — a month's labour is a thing GIVEN at the moment of the deal, not an
// obligation the engine tracks. There is deliberately no `openTrades` anywhere in this file.

/** ⚠️ CAN THIS PURSE PAY THIS PRICE, IN THIS CURRENCY, HERE? Answered BEFORE anything moves, so a failed
 *  trade cannot leave a half-settled state — which is the only way "no open state" can be guaranteed. */
export function canSettle(character, price, { currency = "crystal", regionId = null, economy = null, worldState = null } = {}) {
  const purse = ensurePurse(character);
  if (!purse) return refuse("no character");
  if (!(Number(price) > 0)) return refuse("a price must be a positive number");
  const here = canSpendHere(purse, currency, regionId);
  if (!here.ok) return here;
  const defs = currencyDefs(economy);
  // the price is quoted in CRYSTAL (the reference); what it costs in this currency is the conversion
  const bv = baseValueOf(currency, defs, worldState) || 1;
  const ref = num(defs.crystal?.baseValue, 10) || 10;
  const owed = (Number(price) * ref) / bv;
  // ⛔ AN INDIVISIBLE CURRENCY ROUNDS UP TO A WHOLE UNIT — you cannot hand over four fifths of a mark, so
  // paying in marks costs the whole one. That is a real cost of using them and it must be visible.
  const due = INDIVISIBLE.has(currency) ? Math.ceil(owed) : owed;
  const have = held(purse, currency, regionId) ?? 0;
  if (have < due) {
    return refuse(`${due} ${currency} needed, ${have} held`, { due, have, short: due - have, currency });
  }
  return allow({ due, have, currency, regionId: regionId || null,
    overpay: Number((due - owed).toFixed(3)),   // what indivisibility costs you, stated
    math: `${price} crystal × (${ref}/${bv}) = ${owed.toFixed(2)}${due !== owed ? ` → ${due} (whole ${currency} only)` : ""}` });
}

/** ⛔ THE SETTLING. Goods move, purse moves, by the same number `priceLine` showed — and the call either
 *  completes or changes NOTHING. Checked first, then applied; there is no partial path. */
export function settleExchange(character, { price, currency = "crystal", regionId = null, economy = null,
  worldState = null, give = [], take = [], counterparty = null } = {}) {
  const can = canSettle(character, price, { currency, regionId, economy, worldState });
  if (!can.ok) return can;
  const paid = debit(character, currency, can.due, { regionId });
  if (!paid.ok) return paid;                       // cannot happen after canSettle; a refusal beats a guess
  // goods move in both directions at the moment of the deal — nothing is owed afterwards
  const inv = (character.inventory = character.inventory || []);
  const moved = { gained: [], given: [] };
  for (const it of (take || [])) { inv.push(it); moved.gained.push(it?.id || it?.name || String(it)); }
  for (const it of (give || [])) {
    const ix = inv.findIndex(x => (x?.id || x?.name || x) === (it?.id || it?.name || it));
    if (ix >= 0) { inv.splice(ix, 1); moved.given.push(it?.id || it?.name || String(it)); }
  }
  return allow({ settled: true, paid: can.due, currency, regionId: regionId || null, counterparty,
    ...moved, math: can.math,
    // ⚠️ THE RECEIPT IS THE WHOLE RECORD. If anything here needed to be remembered, the deal would not
    // have closed — and Erik ruled that it always closes.
    open: false });
}

/** ⛔ THE GM'S DOOR IN. Aevi's §4: "a TRANSACTION PRIMITIVE THE GM CAN INVOKE, NOT A SCREEN" — so the
 *  caller is the turn's op stream, the same shape as `npcUpdates` and `placeUpdates`, and there is
 *  deliberately no shop UI anywhere.
 *
 *  Ops:  {op:"pay", currency, amount, regionId, to}      money out, no goods
 *        {op:"receive", currency, amount, regionId, origin}   money in — `origin` enforces the coin rule
 *        {op:"exchange", price, currency, regionId, give:[], take:[], with, bargain:{rank, margin}}
 *
 *  ⚠️ EVERY OP RETURNS A RECEIPT, INCLUDING THE REFUSALS. A trade that could not be paid must tell the GM
 *  why, or the narration will describe a purchase that did not happen — the one failure mode that turns a
 *  bookkeeping bug into a lie in the fiction. */
export function applyExchangeOps(character, ops = [], { economy = null, worldState = null, bargainOutcome = null } = {}) {
  const receipts = [];
  for (const o of (Array.isArray(ops) ? ops : [])) {
    if (!o?.op) continue;
    if (o.op === "receive") {
      receipts.push({ op: "receive", ...credit(character, o.currency, o.amount, { origin: o.origin || "traded", regionId: o.regionId }) });
      continue;
    }
    if (o.op === "pay") {
      receipts.push({ op: "pay", to: o.to || null, ...debit(character, o.currency, o.amount, { regionId: o.regionId }) });
      continue;
    }
    if (o.op === "exchange") {
      let price = Number(o.price);
      let haggled = null;
      // ⛔ THE BARGAIN RESOLVES INTO THE PRICE, then the exchange settles it. Erik: "once done with the
      // bargain the price is paid and the goods exchanged" — so there is no offer state between them.
      if (o.bargain && typeof bargainOutcome === "function") {
        haggled = bargainOutcome({ price, rank: o.bargain.rank, margin: o.bargain.margin, economy });
        if (haggled?.ok) price = haggled.newPrice;
      }
      const r = settleExchange(character, { price, currency: o.currency || "crystal", regionId: o.regionId,
        economy, worldState, give: o.give || [], take: o.take || [], counterparty: o.with || null });
      receipts.push({ op: "exchange", quoted: Number(o.price), settledAt: price, bargain: haggled, ...r });
      continue;
    }
  }
  return receipts;
}
