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

/** ⛔ CCODE-245 / SPEC_rank_zero — DOES THIS TIER ADD SOMETHING OVER THE ACCUMULATION BELOW IT?
 *
 *  ⚠️ MY FIRST VERSION ASKED "does this node carry fields", WITH NOTHING TO COMPARE AGAINST — so r1, which
 *  has no tier beneath it, answered NO on 294 of 383 crafts and was FILTERED OUT OF THE MENU. The narrator
 *  could not pick the r1 use of three quarters of the corpus.
 *
 *  ⛔ AEVI'S r0 IS WHY THIS FUNCTION IS NOW CORRECT AS WRITTEN RATHER THAN SPECIAL-CASED. The additive
 *  model folds tiers 1..N, and a fold needs an IDENTITY ELEMENT. r0 is it: the empty capability. r1 adds
 *  over r0, so r1 declares EVERYTHING and "learning a craft gains you all its r1 stuff" is true by
 *  construction. A guard saying `if (rank <= 1) return true` would have said "r1 is weird"; r0 says the
 *  rule was always right and the base case was missing. */
export function tierDeclaresSomething(rankNode, belowRanks = null) {
  if (!rankNode) return false;
  // the base case: nothing beneath this tier means everything it does is new
  if (belowRanks != null && belowRanks.length === 0) return true;
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
  // ⛔ NO FLOOR OF ONE. `Math.max(1, …)` made `ownedRank: 0` INDISTINGUISHABLE FROM r1 — and the engine
  // then GRANTED the craft: `resolveTier(craft, 1, 0)` returned ok. That is the absent-vs-explicit trap
  // this project has hit four times (`mix: null`, `wired: false`, `band: null`, `gainAxes: []`) except the
  // collapsed state was a PERMISSION. r0 means NOT LEARNED and must stay representable.
  const owned = Math.max(0, num(ownedRank, 1));
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
      distinct: tierDeclaresSomething(node, tree.filter(x => num(x?.rank, 0) < r && num(x?.rank, 0) >= 1)),
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
  const owned = Math.max(0, num(ownedRank, 1));
  const want = Math.max(1, num(wantRank, 1));
  // ⛔ r0 IS THE UNLEARNED STATE AND IT REFUSES. Before this, owning 0 resolved as owning 1 and the engine
  // said yes — a permission granted by a floor.
  if (owned < 1) {
    return { ok: false, unlearned: true, rank: null, ownedRank: 0, wanted: want,
      why: `you have not learned ${ability?.name || ability?.id || "this craft"}` };
  }
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
/** ⛔ CCODE-266 / AEVI's SPEC_typed_soak_and_free_touch §2 — THE TOUCH THAT COSTS NOTHING.
 *
 *  Erik: *"so we should allow a zero energy use of certain crafts? Not a bad idea."* Aevi's case: a warden
 *  at 4 health and 0 energy putting a bare hand on a body, because the craft IS the contact.
 *
 *  ⚠️ RIGHT NOW A CHARACTER AT ZERO ENERGY IS A CHARACTER WITH NO TRADITION — everything that made them who
 *  they are switches off at exactly the moment it should matter most. THE FLOOR OF A CRAFT SHOULD BE FREE
 *  AND NEARLY USELESS, NOT ABSENT. With `rankReachSurcharge` the ladder now reads r0 nothing → touch free →
 *  r1 full price → r2/r3 + surcharge, and every step of that is a real state rather than a gap.
 *
 *  ⛔ ALWAYS AVAILABLE, NOT GATED ON BEING AT ZERO. Aevi left this open and leaned always-available; I agree,
 *  and the reason is mechanical rather than aesthetic — a tier that only appears at 0 energy is a tier the
 *  narrator meets for the first time IN A CRISIS, which is the worst moment to introduce an option.
 *
 *  ⚠️ AND IT IS STRIPPED, NOT SCALED DOWN. The identity with no power behind it: one target, at contact, no
 *  dice, no ongoing, no area. A touch tier that kept a die would be r1 at a discount, which is a different
 *  and much worse idea.
 */
/** ✅ R47 CORRECTED (Erik via Aevi, 2026-09-05 — po/CORRECTION_R47_touch_tier.md). Two errors, both hers, both reported by
 *  the census this reader's own gate printed:
 *
 *  ⛔ **IT WAS OPT-IN AND NOTHING OPTED IN.** `touchTier` was authored on 0 of 421 crafts, so *"every craft already offers a
 *  free move"* was a ladder with no rungs. ⚑ **The floor is DERIVED:** 153 crafts are T1 and 120 carry a contact-plausible
 *  function, and Erik's words were *"the zero-cost fallbacks of his T1 skills"* — broad, not curated. An opt-in field 120
 *  records must each restate is a stored copy of a derivable fact, which this project has ruled against twice
 *  (`ringDistance`, `meaningDensity`). An authored block OVERRIDES and carries the prose; `false` excludes outright.
 *
 *  ⛔ **AND `contactOnly` WAS IN THE MECHANISM FROM CCODE-266 AND WAS NEVER QUESTIONED.** ⚑ **THE FLOOR STRIPS FORCE, NOT
 *  REACH:** it keeps the craft's native reach and its native form and one target; it loses the dice, ongoing harm, area, and
 *  everything the ranks added. ⚠️ *"What makes it free is that it does almost nothing — not that you are adjacent."* Under
 *  the old rule Silas — mental 15, `deathsense` reaching 20 — had to walk up and touch someone to use his own tradition at
 *  zero cost. `contactOnly` now survives ONLY where a craft authors it, because that craft IS the contact (`kept_vigil`).
 *
 *  ⚠️ **THE FIELD IS `freeTier`.** `touchTier` named the delivery, and the delivery is the exception; the old name is read
 *  as a deprecated alias so the blocks authored this morning keep working. */
export function freeTierOf(ability, { cfg = {} } = {}) {
  const declared = ability?.freeTier ?? ability?.touchTier;
  if (declared === false) return null;                       // authored OUT — a craft whose whole act is range or scale
  const spec = (declared === true || typeof declared === "string") ? {} : (declared || {});
  if (!declared) {
    // the derived default: a T1 craft whose verb can be done with almost nothing behind it
    const f = cfg?.freeFloor || {};
    const at = Number(f.tierAtMost);
    const verbs = new Set((f.functions || []).map(String));
    if (!verbs.size || !Number.isFinite(at)) return null;    // no dials, no floor — the content decides this
    if ((Number(ability?.tier) || 1) > at) return null;
    const fns = Array.isArray(ability?.functions) ? ability.functions : (ability?.function ? [ability.function] : []);
    if (!fns.some(v => verbs.has(String(v)))) return null;
  }
  const contactOnly = spec.contactOnly === true;             // ⛔ the exception, never the default
  return {
    rank: 0.5,                       // beneath r1 and above r0 — it is LEARNED, unlike the unlearned state
    name: spec.name || `${ability?.name || "it"}, with nothing behind it`,
    energyCost: 0,
    ...(contactOnly ? { contactOnly: true } : {}),
    derived: !declared,
    targets: 1,
    // ⛔ THE STRIPPING IS THE MECHANIC. Named explicitly so a reader can SEE that a touch carries none of it,
    // rather than inferring absence from a missing field — this project has shipped that mistake repeatedly.
    dice: null, ongoingHarm: null, area: null, range: null,
    why: spec.why || "the craft with no power behind it — the shape of the thing and none of the force",
    ...(typeof declared === "string" ? { why: declared } : {}),
  };
}

/** The old name, kept so nothing that already calls it breaks. ⚠️ Deprecated: the floor is not a touch. */
export function touchTierOf(ability, opts = {}) { return freeTierOf(ability, opts); }   // registry:internal

/** ✅ R47 step 2: does this KIT yield a free floor? A sheet that has one is not handed "A plain strike" or "Raise a guard";
 *  a bare sheet still is, which is what Erik kept them for. ⚑ Derived, so it is true for most kits the moment R47 lands —
 *  which is the point of the correction: the opt-in version would have been true for nobody. */
export function offersFreeFloor(abilities = [], { cfg = {} } = {}) {
  for (const ab of abilities) if (ab && freeTierOf(ab, { cfg })) return true;
  return false;
}

/** ✅ R47 (Erik 2026-09-05: "eliminating the universal fallbacks… he should just rely on the zero-cost fallbacks of his T1
 *  skills as we designed. Only keeping them if needed for an NPC with the most basic sheet"): does this KIT already offer a
 *  move that costs nothing? The free touch (CCODE-266) is that move, and a sheet that has one needs no bare strike.
 *
 *  ⛔ MEASURED 2026-09-05: `touchTier` is authored on **0 of 421 crafts**. The ladder was built and the rungs were never
 *  written, so today this answers false for every character in the game and the fallbacks stay — which is the safe end of
 *  the ruling, not a defeat of it. The moment a craft authors a touch, its bearer stops being handed a bare strike, with
 *  no further code. ⚠️ Reader before field, and the field is Aevi's. */
export function offersFreeTouch(abilities = [], opts = {}) { return offersFreeFloor(abilities, opts); }   // registry:internal

export function capabilityMenu(ability, ownedRank = 1, opts = {}) {
  // ⚠️ CCODE-266: the free floor sits BELOW r1 in the menu, so a player meets it before they need it.
  const touch = freeTierOf(ability, opts);
  const all = capabilitiesOf(ability, ownedRank, opts);
  const distinct = all.filter(c => c.distinct);
  // ⛔ ALWAYS OFFER AT LEAST ONE. A craft whose ranks declare nothing mechanical still has a rank-1 use,
  // and dropping it from the menu would delete the craft from play — the failure mode this whole file is
  // meant to prevent, committed by the filter meant to keep it small.
  const tiers = distinct.length ? distinct : all.slice(0, 1);
  // ⛔ CCODE-266: prepended, never appended — a free floor listed AFTER the paid tiers reads as a footnote.
  return { tiers: touch ? [touch, ...tiers] : tiers, all, ...(touch ? { touch } : {}) };
}
