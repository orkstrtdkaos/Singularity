// engine/capabilities.js — CCODE-244. WHAT A CRAFT CAN ACTUALLY DO, TIER BY TIER.
//
// ⛔ ERIK'S ASK: "I want the player to just say use X skill this way and the engine should know which rank
// it takes to do that." ⚠️ THAT IS ONLY POSSIBLE BECAUSE OF AEVI'S ADDITIVE MODEL. If a rank REPLACED the
// one below, the r1 effect would be gone at r3 and there would be nothing to choose between; because a
// rank only ever ADDS, every tier at or below what you own is a live option and "which rank does this
// take" has a real answer: THE LOWEST TIER WHOSE CAPABILITY COVERS WHAT WAS ASKED.
//
// Aevi's worked case, and the whole reason this file exists:
//
//   keening r1 — 6 in earshot lose their next action
//   keening r2 — 3 fall unconscious          ⛔ PLUS the 6, still running
//   keening r3 — 12 fall unconscious         ⛔ PLUS everything above
//
// ⛔ SO `targets: 6 → 3 → 12` IS NOT A CURVE. It is three capabilities with three counts, all live at
// once, and any reader that treats a per-rank field as one value moving over time gets this craft wrong
// SILENTLY — because the numbers look like a sequence. `authoredBlock` picks the highest authored rank and
// stops, which is right for "what is this field now" and WRONG for "what can this character do".
//
// ⚠️ THIS FILE ADDS NO NUMBERS AND CHANGES NO AUTHORED VALUE. It reads what is already written and
// presents it as a menu. The step rule — how much a tier adds when it does not say — is Erik's, is not set,
// and is deliberately not here.

// ⚠️ `null` IS NOT ZERO HERE, and the obvious helper says it is. `Number(null) === 0`, which is finite,
// so the usual `Number.isFinite(Number(v)) ? Number(v) : d` accepts a null as a real 0 and swallows the
// fallback. That is how `reachCost` returned 1 for a craft whose authored energyCost is 4: `baseCost`
// defaults to null, null became 0, and the default never ran. An absent value has to stay absent.
const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
const txt = (v) => (typeof v === "string" ? v.trim() : "");

/** The fields a tier can declare that make it MECHANICALLY distinct from the one below. ⚠️ Prose alone is
 *  not enough — every rank has prose, and a menu with an entry per rank is three times the size for no
 *  new choice (measured: 1,056 ranks, only 508 declare anything of their own). */
export const TIER_MARKERS = ["imposes", "antisoakImposed", "pierce", "penetration", "ongoingHarm",
  "persistUntilHealed", "dice", "targets", "scope", "range", "duration", "magnitude"];

/** Does this rank declare something of its own, or is it prose over the tier below? */
export function tierDeclaresSomething(rankNode) {
  if (!rankNode) return false;
  for (const k of TIER_MARKERS) {
    if (rankNode[k] != null) return true;
    if (rankNode.mechanic && rankNode.mechanic[k] != null) return true;
  }
  return (rankNode.gainAxes || []).length > 0;
}

/** ⛔ WHAT THE CHARACTER CAN DO WITH THIS CRAFT, AS A MENU. Every tier from 1 to `owned`, each carrying the
 *  prose that describes it and the rank it takes. The player never sees a rank; this is what lets the
 *  narrator match an intent to one.
 *
 *  ⚠️ `distinct` marks the tiers that add a real choice. The caller decides whether to show the rest —
 *  a sheet wants all of them (you can still do the r1 thing), a battle menu wants only the choices. */
export function capabilitiesOf(ability, ownedRank = 1, { cfg = {}, character = null, costFn = null } = {}) {
  if (!ability) return [];
  const owned = Math.max(1, num(ownedRank, 1));
  const tree = (ability.tree || []).slice().sort((a, b) => num(a.rank, 0) - num(b.rank, 0));
  const out = [];
  for (const node of tree) {
    const r = num(node?.rank, 0);
    if (r < 1 || r > owned) continue;
    out.push({
      rank: r,
      // ⚠️ THE PROSE IS THE DESCRIPTION AND AEVI ALREADY AUTHORS IT. No new authoring for this half.
      does: txt(node.grants) || txt(node.name) || `${ability.name || ability.id} at rank ${r}`,
      cannot: txt(node.cannot) || null,
      distinct: tierDeclaresSomething(node),
      // what this tier itself declares — never the accumulation, per §4: an authored value on a rank is
      // THAT TIER'S own number, not an override of the craft
      imposes: node.imposes ?? node.mechanic?.imposes ?? null,
      gainAxes: node.gainAxes || [],
      cost: typeof costFn === "function" ? costFn(ability, r) : reachCost(ability, r, { cfg, character }),
    });
  }
  return out;
}

/** ⛔ WHAT REACHING A TIER COSTS. Two terms, pulling opposite ways, and both are real:
 *
 *   PRACTICE makes a craft cheaper — that is `effectiveEnergyCost`'s existing rank discount, and it is
 *   right: someone who has drilled to r3 spends less on the r1 thing than a novice does.
 *
 *   ⚠️ REACH makes a tier dearer — and nothing in the game charges it today. Measured: "knock six down"
 *   and "knock twelve unconscious" are currently the SAME PRICE, because rank only ever discounted.
 *
 *  ⛔ THE SURCHARGE DEFAULTS TO ZERO, DELIBERATELY. Erik has not set this dial and I am not inventing a
 *  balance number: with no dial authored, every price is exactly what it is today, and the mechanism sits
 *  ready. Reader before field — the moment `energy.rankReachSurcharge` is authored, reaching costs. */
export function reachCost(ability, rank = 1, { cfg = {}, character = null, baseCost = null } = {}) {
  const base = num(baseCost, num(ability?.energyCost, num(cfg?.defaultActionCost, 5)));
  const per = num(cfg?.rankReachSurcharge, 0);
  const reach = Math.max(0, num(rank, 1) - 1);
  return Math.max(1, Math.round(base + reach * per));
}

/** ⛔ WHICH TIER ANSWERS THIS? Given a rank the narrator picked, the honest verdict — and a refusal that
 *  says WHY, because "you cannot do that" without a reason is the cruellest possible message when the
 *  player has just described something their character plainly could do one tier down. */
export function resolveTier(ability, wantRank, ownedRank = 1) {
  const owned = Math.max(1, num(ownedRank, 1));
  const want = Math.max(1, num(wantRank, 1));
  const caps = capabilitiesOf(ability, owned);
  if (!caps.length) return { ok: false, why: "this craft has no ranks authored", rank: null };
  if (want > owned) {
    // ⚠️ NAME WHAT THEY CAN DO INSTEAD. The tiers below are still live — that is the additive model — so a
    // refusal here always has an alternative to offer.
    const best = caps[caps.length - 1];
    return { ok: false, overreach: true, rank: best.rank, ownedRank: owned, wanted: want,
      why: `that is rank ${want} of ${ability.name || ability.id} and you have rank ${owned}`,
      insteadCan: best.does };
  }
  const tier = caps.find(c => c.rank === want) || caps[caps.length - 1];
  return { ok: true, rank: tier.rank, tier, ownedRank: owned };
}

/** The battle-menu shape: one entry per craft, carrying only the tiers that offer a real choice.
 *  ⚠️ MEASURED REASON FOR THE FILTER: one option per craft × function × rank takes a 6-craft kit from 14
 *  options to 42, and two thirds of those ranks declare nothing of their own. The menu must be a list of
 *  CHOICES, not a list of rows. */
export function capabilityMenu(ability, ownedRank = 1, opts = {}) {
  const all = capabilitiesOf(ability, ownedRank, opts);
  const distinct = all.filter(c => c.distinct);
  // ⛔ ALWAYS OFFER AT LEAST ONE. A craft whose ranks declare nothing mechanical still has a rank-1 use,
  // and dropping it from the menu would delete the craft from play — the failure mode this whole file is
  // meant to prevent, committed by the filter meant to keep it small.
  return { tiers: distinct.length ? distinct : all.slice(0, 1), all };
}
