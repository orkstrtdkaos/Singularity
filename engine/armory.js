// ⛔ CCODE-445 — THE ARMORY. Erik, 2026-09-19: "we need an armory to store the weapons and armor for different troop types. Without
// getting too in depth about it, I could see swords, shields, axes, bows, crossbows, leather, plate, chain mail etc. These are probably
// something the hold can produce at the forge smithy etc. And would allow you to outfit units up to the quantity you have. You could sell
// them and send them to other holds, etc."
//
// ⚑ HOW IT HANGS TOGETHER, and why it is this small ("without getting too in depth"):
//  · a hold's `armory` is COUNTS by kind of gear — a sword is a sword; nobody names the fortieth one.
//  · a forge or smithy standing at the hold MAKES the gear its order names, each pass, from the hold's store (raw material; a
//    crossbow's lock also takes a part). What it cannot make for want of material it says ONCE, not every pass.
//  · a body of hands is OUTFITTED up to the stock, one weapon, one shield and one armour a head. The kit entry carries its own worth,
//    stamped from this table when it is handed out, because `melee.js` stands on no other module — and `kitLift` rides the contingents' QUALITY in
//    `resolvedContingents`, exactly where a leader's bonus rides (CCODE-406), so strength, threat and a clash read it with no new argument.
//  · shields on at least half of a body of hands let it PROTECT — the gap `bandGaps` names ("the same tide takes more of them").
//  · gear SELLS as arms, at the place's price for arms, in the place's money.
//  · "send them to other holds" rides the trade routes, which wait on Erik's answers (po/CCODE_20260919_the_vault_and_the_route_questions.md).
// ⚠️ EVERY NUMBER HERE IS A STAND-IN until Aevi authors `economy.armory`, which wins gear by gear and field by field.
import { featuresOf, featureDef, levelMult } from "./holdings.js";
import { earnAt, saidEarned } from "./money.js";
import { priceOf } from "./economy.js";

export const ARMORY_SLOTS = ["weapon", "shield", "armor"];
export const SLOT_WORDS = { weapon: "weapons", shield: "shields", armor: "armour" };

export const ARMORY_DEFAULTS = {
  _standIn: "CCode's stand-ins until Aevi authors economy.armory — which wins gear by gear and field by field",
  // `quality` is what one piece adds to the head that carries it (a body of hands is quality 1–3; a leader adds at most its own quality)
  gear: {
    sword: { slot: "weapon", one: "sword", many: "swords", quality: 0.1, materials: { raw_material: 1 }, worth: "useful" },
    axe: { slot: "weapon", one: "axe", many: "axes", quality: 0.1, materials: { raw_material: 1 }, worth: "useful" },
    bow: { slot: "weapon", one: "bow", many: "bows", quality: 0.08, materials: { raw_material: 1 }, worth: "useful" },
    crossbow: { slot: "weapon", one: "crossbow", many: "crossbows", quality: 0.12, materials: { raw_material: 1, mech_parts: 1 }, worth: "valuable" },
    shield: { slot: "shield", one: "shield", many: "shields", quality: 0.05, materials: { raw_material: 1 }, worth: "useful", gives: "PROTECT" },
    leather: { slot: "armor", one: "leather coat", many: "leather coats", quality: 0.04, materials: { raw_material: 1 }, worth: "useful" },
    chain: { slot: "armor", one: "chain mail shirt", many: "chain mail shirts", quality: 0.08, materials: { raw_material: 2 }, worth: "valuable" },
    plate: { slot: "armor", one: "suit of plate", many: "suits of plate", quality: 0.12, materials: { raw_material: 3 }, worth: "valuable" },
  },
  makers: { forge: 4, smithy: 2 },   // pieces a standing forge / smithy makes each pass (three days), times how many stand
  givesAt: 0.5,                      // a shield's PROTECT counts once at least half the heads carry one
};

const n0 = (v) => Math.max(0, Math.floor(Number(v) || 0));

/** The table in force: the stand-ins, with whatever Aevi authored laid over them. Pure. */
export function armoryTable(authored = null) {
  const a = authored && typeof authored === "object" ? authored : {};
  const gear = {};
  for (const [k, v] of Object.entries(ARMORY_DEFAULTS.gear)) gear[k] = { ...v };
  for (const [k, v] of Object.entries(a.gear || {})) if (v && typeof v === "object") gear[k] = { ...(gear[k] || {}), ...v };
  const givesAt = Number(a.givesAt);
  return { gear, makers: { ...ARMORY_DEFAULTS.makers, ...(a.makers || {}) }, givesAt: Number.isFinite(givesAt) ? givesAt : ARMORY_DEFAULTS.givesAt };
}

export function armoryOf(holding) { return holding?.armory && typeof holding.armory === "object" ? holding.armory : {}; }
export function gearCount(holding, gear) { return n0(armoryOf(holding)[gear]); }
const tidy = (holding) => {
  const a = { ...armoryOf(holding) };
  for (const k of Object.keys(a)) if (!n0(a[k])) delete a[k];
  if (Object.keys(a).length) holding.armory = a; else delete holding.armory;
};
const holdOf = (character, holdId) => (character?.holdings || []).find(x => x && String(x.id) === String(holdId)) || null;
const standingIn = (h, hereId) => !!(h?.locationId && String(hereId || "") === String(h.locationId));

/** What the hold's standing forges and smithies make in a pass — a forge 4, a smithy 2 (stand-ins), times how many stand — and which
 *  they are. A build in progress makes nothing (`featuresOf`). Pure. */
export function makersAt(holding, cfg = null, A = armoryTable()) {
  let cap = 0;
  const by = [];
  for (const f of featuresOf(holding)) {
    const def = featureDef(f.kind, cfg);
    const k = A.makers[f.kind] != null ? f.kind : (def?.variantOf && A.makers[def.variantOf] != null ? def.variantOf : null);
    if (!k) continue;
    const c = Math.round(n0(A.makers[k]) * (Number(f.count) || 1) * levelMult(f, def || { family: "craft" }, "rate"));   // CCODE-452: a raised forge makes more
    if (c > 0) { cap += c; by.push(f.name || f.kind); }
  }
  return { cap, by };
}

/** Order the hold's forges to make `count` of `gear`; no gear or 0 stops the order. From anywhere — word reaches the keeper, as the
 *  trade toggle does. → { ok, why, order }. Mutates. */
export function setForgeOrder(character, holdId, gear, count, { cfg = null, armory = null } = {}) {
  const A = armoryTable(armory);
  const h = holdOf(character, holdId);
  if (!h) return { ok: false, why: "no such holding" };
  const n = n0(count);
  if (!gear || !n) { delete h.forgeOrder; return { ok: true, order: null }; }
  const g = A.gear[gear];
  if (!g) return { ok: false, why: "nobody there knows how to make that" };
  if (!makersAt(h, cfg, A).cap) return { ok: false, why: `nothing stands at ${h.name || "the hold"} that can make ${g.many} — a forge or a smithy` };
  h.forgeOrder = { gear: String(gear), left: Math.min(999, n) };
  return { ok: true, order: h.forgeOrder };
}

/** ONE PASS OF THE FORGE: as many of the ordered gear as the makers can make, the order still wants and the store has material for.
 *  → { made, gear, said } or null when there is no order. A stall is said once, until work resumes. Mutates the hold. */
export function tickArmory(holding, { cfg = null, armory = null } = {}) {
  const A = armoryTable(armory);
  const o = holding?.forgeOrder;
  if (!o) return null;
  const g = A.gear[o.gear];
  if (!g || !n0(o.left)) { delete holding.forgeOrder; return null; }
  const name = holding.name || "your hold";
  const { cap } = makersAt(holding, cfg, A);
  if (!cap) {
    if (o.said === "no-maker") return { made: 0, said: null };
    o.said = "no-maker";
    return { made: 0, said: `${name} has nothing standing that can make ${g.many} — the order waits for a forge or a smithy.` };
  }
  const store = holding.store && typeof holding.store === "object" ? holding.store : {};
  let can = Math.min(cap, n0(o.left));
  const short = [];
  for (const [good, per] of Object.entries(g.materials || {})) {
    const p = Math.max(1, n0(per)), have = n0(store[good]);
    can = Math.min(can, Math.floor(have / p));
    if (have < p) short.push(String(good).replace(/_/g, " "));
  }
  if (can <= 0) {
    if (o.said === "short") return { made: 0, stalled: true, said: null };
    o.said = "short";
    return { made: 0, stalled: true, said: `Nothing is being made at ${name}: the store has no ${short.join(" or ") || "material"} left for ${g.many}.` };
  }
  for (const [good, per] of Object.entries(g.materials || {})) store[good] = n0(store[good]) - can * Math.max(1, n0(per));
  holding.store = store;
  holding.armory = { ...armoryOf(holding), [o.gear]: gearCount(holding, o.gear) + can };
  o.left = n0(o.left) - can;
  delete o.said;
  const done = o.left <= 0;
  if (done) delete holding.forgeOrder;
  return { made: can, gear: o.gear, said: `${name} made ${can} ${can === 1 ? g.one : g.many}${done ? " — the order is filled" : ` — ${o.left} to go`}.` };
}

/** HAND GEAR TO A BODY OF HANDS, from the armory of the hold you stand in, up to its stock and one a head. `gear: null` takes the slot's
 *  gear back into this armory; a different kind in the slot goes back first. A named person is refused — they carry their own kit.
 *  → { ok, why, given, short, returned }. Mutates. */
export function outfitContingent(character, { unitId, index, slot, gear = null, n = null, holdId, hereId = null, armory = null } = {}) {
  const A = armoryTable(armory);
  if (!ARMORY_SLOTS.includes(slot)) return { ok: false, why: "no such kind of kit" };
  const h = holdOf(character, holdId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!standingIn(h, hereId)) return { ok: false, why: "gear is handed out at the armory — stand in the hold" };
  const band = (character?.bands || []).find(b => b && String(b.id) === String(unitId));
  const i = Math.round(Number(index));
  const c = Array.isArray(band?.contingents) ? band.contingents[i] : null;
  if (!c) return { ok: false, why: "no such body of hands" };
  if (c.npcId) return { ok: false, why: "a named person carries their own kit" };
  const kit = { ...(c.kit && typeof c.kit === "object" ? c.kit : {}) };
  const had = kit[slot] || null;
  const giveBack = () => { if (had?.gear && n0(had.n)) h.armory = { ...armoryOf(h), [had.gear]: gearCount(h, had.gear) + n0(had.n) }; };
  if (!gear) {
    if (!had) return { ok: false, why: `they carry no ${SLOT_WORDS[slot]} to take back` };
    giveBack();
    delete kit[slot];
    band.contingents[i] = Object.keys(kit).length ? { ...c, kit } : (({ kit: _k, ...rest }) => rest)(c);
    tidy(h);
    return { ok: true, given: 0, short: 0, returned: { gear: had.gear, n: n0(had.n) } };
  }
  const g = A.gear[gear];
  if (!g || g.slot !== slot) return { ok: false, why: `${g?.many || gear} are not ${SLOT_WORDS[slot]}` };
  const heads = n0(c.n);
  const want = Math.min(heads, n === null || n === undefined ? heads : n0(n));
  const stock = gearCount(h, gear) + (had?.gear === gear ? n0(had.n) : 0);   // what they carry of the same kind counts toward it
  const give = Math.min(want, stock);
  if (give <= 0) return { ok: false, why: want ? `the armory at ${h.name || "the hold"} holds no ${g.many}` : "nobody to hand them to" };
  giveBack();
  h.armory = { ...armoryOf(h), [gear]: gearCount(h, gear) - give };
  kit[slot] = { gear: String(gear), n: give, q: Number(g.quality) || 0, one: g.one, many: g.many, ...(g.gives ? { gives: String(g.gives), givesAt: A.givesAt } : {}) };
  band.contingents[i] = { ...c, kit };
  tidy(h);
  return { ok: true, given: give, short: want - give, returned: had && had.gear !== gear ? { gear: had.gear, n: n0(had.n) } : null };
}

/** What one piece fetches here — sold as arms, at the place's price for arms. 0 where nobody wants arms. Pure. */
export function gearPrice(gear, regionId, { economy = null, armory = null } = {}) {
  const g = armoryTable(armory).gear[gear];
  if (!g) return 0;
  const p = priceOf({ name: g.one, worth: g.worth || "useful", goods: "arms" }, regionId, { economy });
  return Math.max(0, Number(p?.price) || 0);
}

/** SELL GEAR from the armory of the hold you stand in, paid in the place's money. `counts` is { gear: n }. Mutates. */
export function sellGear(character, holdId, counts = {}, { hereId = null, regionId = null, economy = null, armory = null } = {}) {
  const A = armoryTable(armory);
  const h = holdOf(character, holdId);
  if (!h) return { ok: false, why: "no such holding" };
  if (!standingIn(h, hereId)) return { ok: false, why: "gear is sold where the armory stands — at the hold" };
  const sold = [];
  let value = 0;
  for (const [gear, n] of Object.entries(counts || {})) {
    const g = A.gear[gear];
    const k = Math.min(gearCount(h, gear), n0(n));
    if (!g || !k) continue;
    const each = gearPrice(gear, regionId, { economy, armory });
    sold.push({ gear, n: k, one: g.one, many: g.many, each });
    value += k * each;
  }
  if (!sold.length) return { ok: false, why: "nothing picked to sell" };
  if (value <= 0) return { ok: false, why: "nobody here buys arms" };
  for (const s of sold) h.armory = { ...armoryOf(h), [s.gear]: gearCount(h, s.gear) - s.n };
  tidy(h);
  const earned = earnAt(character, value, regionId, economy, { origin: "arms" });
  return { ok: true, sold, value, earned, said: saidEarned(earned) };
}

/** The armory in words, for the hold card: "12 swords · 8 shields — making swords, 8 to go". Pure. */
export function armoryLine(holding, A = armoryTable()) {
  const stock = Object.entries(armoryOf(holding)).filter(([, n]) => n0(n) > 0)
    .map(([g, n]) => `${n0(n)} ${n0(n) === 1 ? (A.gear[g]?.one || g) : (A.gear[g]?.many || g)}`);
  const o = holding?.forgeOrder, og = o ? A.gear[o.gear] : null;
  const making = og && n0(o.left) ? `making ${og.many}, ${n0(o.left)} to go` : "";
  return [stock.join(" · "), making].filter(Boolean).join(" — ");
}

/** The same, for the GM's line about the hold: " — its armory holds 12 swords, 8 shields; its forge is making swords, 8 to go". Pure. */
export function armorySaid(holding, A = armoryTable()) {
  const stock = Object.entries(armoryOf(holding)).filter(([, n]) => n0(n) > 0)
    .map(([g, n]) => `${n0(n)} ${n0(n) === 1 ? (A.gear[g]?.one || g) : (A.gear[g]?.many || g)}`);
  const o = holding?.forgeOrder, og = o ? A.gear[o.gear] : null;
  const parts = [];
  if (stock.length) parts.push(`its armory holds ${stock.join(", ")}`);
  if (og && n0(o.left)) parts.push(`its forge is making ${og.many}, ${n0(o.left)} to go`);
  return parts.length ? ` — ${parts.join("; ")}` : "";
}
