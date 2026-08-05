// engine/economy.js — SNG-302: what is this worth HERE, and why.
//
// Erik: *"I want the value and money economy implemented."* Aevi authored the model and wired it live; this is
// the consumer. It is also the module `priceShift` has been waiting for — 11 of the 54 arc-stage effects have
// been inert since SNG-273 because **no module in this engine could compute a price**, so a demand shift had
// nothing to move.
//
// THE MODEL IS AEVI'S AND ERIK'S CORRECTION IS THE HEART OF IT:
//
//     price = worthBand × need × scarcity     — and NEED DOMINATES.
//
// `need: none` is a HARD ZERO. If a place does not want a thing, scarcity is irrelevant: nobody bids on what
// nobody uses. Scarcity only MODULATES an existing need, never creates one. The one-axis version priced engine
// parts high in the Quickwood because they are rare there — and they are rare there BECAUSE nobody wants them.
//
// ⛔ TWO THINGS THIS DELIBERATELY DOES NOT DO:
//   · It does not price the IRREPLACEABLE. That band carries `value: null` and a note saying the engine should
//     refuse — so it returns a refusal, not a number. A price on the unfinished spear would be a lie with a
//     decimal point on it.
//   · It is not a shop. Aevi: *"traders are NPCs not shops — the price model exists so the GM has a number to
//     be honest about, not so a UI can render a catalogue."* Hence `priceLine`, which hands the GM the number
//     AND the reason, and lets them say "ten for those and I'm being generous."
//
// Pure. Reads rules + a region + the arc effects in force; writes nothing.

const NEED_ORDER = ["none", "little", "ordinary", "high"];

/** Look up a region's [need, scarcity] for a goods category. Regions are an ARRAY of records here, not a map
 *  keyed by id — read the shape rather than assuming it, since guessing that has cost this project weeks. */
export function regionDemand(economy, regionId, goods) {
  const rows = Array.isArray(economy?.regions) ? economy.regions : Object.values(economy?.regions || {});
  const row = rows.find(r => r?.regionId === regionId);
  const pair = row?.goods?.[goods];
  if (!Array.isArray(pair)) return null;
  return { need: pair[0] ?? "ordinary", scarcity: pair[1] ?? "ordinary" };
}

/** SNG-273 → SNG-302: an arc stage that shifts demand finally lands somewhere.
 *  `demandDelta` moves need along its own ladder — it cannot invent a market where there is none unless the
 *  shift is positive, and it cannot push below `none`. */
export function shiftNeed(need, effects = [], goods = null) {
  let idx = NEED_ORDER.indexOf(need);
  if (idx < 0) idx = NEED_ORDER.indexOf("ordinary");
  const why = [];
  for (const e of effects) {
    if (e?.kind !== "priceShift") continue;
    if (e.goods && goods && e.goods !== goods) continue;
    const d = Number(e.demandDelta);
    if (!Number.isFinite(d) || d === 0) continue;
    idx = Math.max(0, Math.min(NEED_ORDER.length - 1, idx + d));
    why.push({ arcName: e.arcName || null, why: e.why || null, delta: d });
  }
  return { need: NEED_ORDER[idx], why };
}

/** What this item fetches in this region right now.
 *  Returns { price, band, need, scarcity, refused?, why[] } — `price` is null when the answer is a refusal. */
export function priceOf(item, regionId, { economy, effects = [] } = {}) {
  if (!economy || !item) return null;
  const band = item.worth || economy.defaultWorth || null;
  const bandValue = economy.worthBands?.[band];

  // ⛔ THE IRREPLACEABLE HAS NO PRICE. Not a high one — none. The band says so itself.
  if (bandValue && typeof bandValue === "object" && bandValue.value === null) {
    return { price: null, refused: true, band, need: null, scarcity: null,
      why: [{ why: bandValue.note || "not for sale" }] };
  }
  const base = Number(bandValue);
  if (!Number.isFinite(base)) return null;

  const goods = item.goods || item.goodsCategory || null;
  const local = goods ? regionDemand(economy, regionId, goods) : null;
  // No local record is NOT no market — it is no information. Treat it as ordinary on both axes and say so,
  // rather than pricing at zero and implying the place refuses the thing.
  const rawNeed = local?.need ?? "ordinary";
  const scarcityKey = local?.scarcity ?? "ordinary";

  const shifted = shiftNeed(rawNeed, effects, goods);
  const needMult = Number(economy.priceModel?.need?.[shifted.need]);
  const scarcityMult = Number(economy.priceModel?.scarcity?.[scarcityKey]);
  if (!Number.isFinite(needMult) || !Number.isFinite(scarcityMult)) return null;

  // ⚠️ NEED DOMINATES: at `none` the product is zero however scarce the thing is, and that is the point.
  const price = Math.round(base * needMult * scarcityMult);
  return {
    price, band, need: shifted.need, scarcity: scarcityKey,
    baseNeed: rawNeed, unwanted: shifted.need === "none",
    why: shifted.why,
  };
}

/** The line a GM can be honest with. Aevi's visibility rule: the numbers are VISIBLE AND PRECISE and the
 *  narration does not recite them — the trader says "ten for those and I'm being generous", the interface
 *  says 10. This returns the interface half, plus the REASON when the world is why. */
export function priceLine(item, regionId, ctx) {
  const p = priceOf(item, regionId, ctx);
  if (!p) return null;
  if (p.refused) return { text: "not for sale", price: null, reason: p.why[0]?.why || null };
  if (p.unwanted) return { text: "nobody here wants it", price: 0, reason: p.why[0]?.why || "no market for it here" };
  const moved = p.why.length ? ` (${p.why.map(w => w.arcName).filter(Boolean).join(", ")})` : "";
  return { text: `${p.price}${moved}`, price: p.price, reason: p.why[0]?.why || null };
}

/** ⚠️ THE SECOND AXIS IS NOT REACHABLE YET, and it must be visible rather than silently flat.
 *
 *  Aevi authored 12 goods categories and need/scarcity for all 25 regions — richly, including the dead lists.
 *  But NO ITEM CARRIES A GOODS CATEGORY, and nothing maps `kind` to one. So `regionDemand` finds nothing for
 *  every item in the game, both axes fall back to `ordinary`, and the model collapses to `price = band`: the
 *  same number in the Crossing and the Quickwood.
 *
 *  The prices are not WRONG — a Traveler’s Pack at 4 is the band doing its job — they are just not yet
 *  LOCAL, which is the whole point of a two-axis model. Assigning goods to items is authorship (deciding a
 *  focus is `worked_light` rather than `precursor_salvage` is a content judgement, not a lookup), so this
 *  names the gap the way `EFFECT_CONSUMERS` names the effect kind with no consumer.
 *
 *  The moment items carry `goods`, every region table Aevi wrote becomes live with no engine change. */
export function economyCoverage(economy, items = []) {
  const withWorth = items.filter(i => i?.worth).length;
  const withGoods = items.filter(i => i?.goods || i?.goodsCategory).length;
  const cats = (economy?.goodsCategories || []).length;
  const rows = Array.isArray(economy?.regions) ? economy.regions : Object.values(economy?.regions || {});
  return {
    items: items.length, withWorth, withGoods, categories: cats, regionsPriced: rows.length,
    secondAxisLive: withGoods > 0,
    note: withGoods === 0
      ? "price = band only — no item carries a goods category, so no region table can be reached"
      : "price = band × need × scarcity",
  };
}
