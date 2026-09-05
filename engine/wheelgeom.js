// wheelgeom.js — SNG-202: place a craft on the great circle by its COMPOSITION. The angular authority is
// the ONE great circle the world already carries — a tradition's ring position (0..n-1); nobody invents a
// second coordinate system. This module owns the deterministic geometry so the wheel render stays a thin
// projection of it: same composition → same position, every load, every player (⛔ never a force layout).
//
// The headline is the TWO-POINT case (a braid, between the two axes it braids): angle = the shorter-arc
// midpoint of its parents' ring positions; radius pulled inward proportional to how far apart they sit —
// adjacent parents sit near the rim, a cross-circle braid sinks toward the centre. The general weighted
// mean (schools, arbitrary composition) is the same math family, added when the placement widens past
// braids. Pure; headless-testable.

import { abilityTier } from "./skilltree.js";
/** Circular (shorter-arc) midpoint of two ring POSITIONS on a wheel of `n`. The antipodal case (exactly
 *  n/2 apart) has two equal midpoints — resolved deterministically CLOCKWISE FROM THE LOWER position, never
 *  an arbitrary tiebreak that looks meaningful (§1 ⚠️). Returns a fractional position in [0, n). */
export function ringMidpoint(a, b, n = 24) { // registry:internal — a primitive of braidPlacement, exported for unit tests
  const A = ((a % n) + n) % n, B = ((b % n) + n) % n;
  let cw = (B - A + n) % n;                 // clockwise arc from A to B, 0..n-1
  if (cw === n / 2) return (Math.min(A, B) + n / 4) % n;   // antipodal → deterministic quarter clockwise from the lower
  if (cw > n / 2) cw -= n;                   // shorter arc is counter-clockwise
  return ((A + cw / 2) % n + n) % n;
}

/** Circular distance between two ring positions (0..n/2). n/2 = antipodal. */
export function ringSeparation(a, b, n = 24) { // registry:internal — a primitive of braidPlacement, exported for unit tests
  const d = Math.abs((((a - b) % n) + n) % n);
  return Math.min(d, n - d);
}

/** SNG-202 §1: a braid's polar placement from its two parents' ring positions. `ang` is the radians angle
 *  (matching the render's `wheelAngle`: pos/n·2π − π/2). `rFactor` is 1 at the rim (adjacent parents) → 0 at
 *  the centre (antipodal): radius = rInner + (rOuter − rInner)·rFactor lands adjacent braids near the rim and
 *  cross-circle braids deep inside. `antipodal` flags the spans-the-circle case for the hover. Pure. */
export function braidPlacement(posA, posB, n = 24) {
  const mid = ringMidpoint(posA, posB, n);
  const sep = ringSeparation(posA, posB, n);
  const antipodal = sep === n / 2;
  return {
    ang: (mid / n) * Math.PI * 2 - Math.PI / 2,
    midPos: mid,
    sep,
    rFactor: 1 - sep / (n / 2),              // 0 sep → 1 (rim), n/2 sep → 0 (centre)
    antipodal,
  };
}

// SNG-202B §1 general form — the weighted circular mean of a craft's composition (the Tether FCG meaning-
// gravity math), now WITH its consumer (buildWheelModel rotates every ring-tradition craft by this). A
// craft's `axes` are weights in the 12-bipolar-axis space the ring projects; each axis maps to a diameter
// (its two poles, `axisPoles[axisKey] = {neg, pos}`). We sum a unit vector toward the leaning pole of each
// axis, magnitude = |weight|; the resultant's ANGLE is the craft's composition direction, its MAGNITUDE how
// coherently it leans (a craft pulling many ways has a short resultant — genuinely unaligned).

/** SNG-202B §1: the circular weighted mean of a craft's composition as a render-space angle. `axes` is the
 *  ability's weight map (axisKey → [-1,1]); `axisPoles` is `traditionIndex.axisPoles` (axisKey → {neg, pos}
 *  ring positions). Angle convention matches the render's wheelAngle (pos/n·2π − π/2). Returns {ang, mag,
 *  used} or null when no axis is ring-mappable (the 3 axes with no tradition anchor, or a balanced-to-zero
 *  resultant) — a null means "no composition signal; fall back to the bare spoke." Pure. */
export function compositionAngle(axes, axisPoles = {}, n = 24) {
  let vx = 0, vy = 0, used = 0;
  for (const [k, w] of Object.entries(axes || {})) {
    const m = axisPoles[k];
    if (!m || m.neg == null || m.pos == null || !w) continue;
    const polePos = w < 0 ? m.neg : m.pos;                 // sign picks the pole; |w| the pull
    const ang = (polePos / n) * Math.PI * 2 - Math.PI / 2; // render space (matches wheelAngle)
    vx += Math.abs(w) * Math.cos(ang);
    vy += Math.abs(w) * Math.sin(ang);
    used++;
  }
  if (!used) return null;
  const mag = Math.hypot(vx, vy);
  if (mag < 1e-9) return null;                             // perfectly balanced → no direction
  return { ang: Math.atan2(vy, vx), mag, used };
}

/** SNG-202B §1: the BOUNDED lean of a craft off its tradition spoke. The tradition ANCHORS (the spec's
 *  explicit degenerate guarantee: a pure craft renders on its ring-angle); composition ROTATES it toward
 *  where its `axes` lean, clamped to ±maxSwing positions so a "mostly-death craft that adopts order" sits
 *  NEAR the death axis rotated toward order — never teleported to the life side. Returns the signed radians
 *  offset to add to the spoke angle (0 when there's no composition signal). Pure, deterministic. */
export function leanOffset(spokeAng, comp, n = 24, maxSwingPos = 2) {
  if (!comp) return 0;
  let d = comp.ang - spokeAng;
  d = Math.atan2(Math.sin(d), Math.cos(d));               // shorter arc into [-π, π]
  const maxSwing = (maxSwingPos / n) * Math.PI * 2;
  return Math.max(-maxSwing, Math.min(maxSwing, d));
}

/** ⛔ CCODE-196 (Erik): "if i filter out skills have them disappear completely, not just dim... dimmed
 *  they still interfere with selection."
 *
 *  He is right, and the cause was one line: a dimmed node still emitted a 13px invisible hit circle. At 0.22
 *  opacity it READS as absent and BEHAVES as present, so a click meant for a craft that passed the filter
 *  could land on one the filter was supposed to remove. A filter that changes only the paint is not a filter.
 *
 *  ⚠️ A TRADITION CLICK ALONE IS NOT A FILTER. SNG-202B's related / adjacent / dim rings are how the
 *  wheel SHOWS ITS SHAPE; removing the far side would tell the player the circle is smaller than it is. So a
 *  bare tradition selection rejects nothing, and the moment a real filter joins it the two INTERSECT — which
 *  is the composition Erik asked for at SNG-218: "the death ones" + "which of those heal" + "which are
 *  suggested" resolve to one visible set.
 *
 *  Lives here, out of the render, because it decides what a player can CLICK and that deserves a test rather
 *  than a source regex. PURE.
 *
 *  @param node      {families, recommended, owned, reachable}
 *  @param tradRel   the SNG-202B relation of this node to the selected tradition ("related"|"adjacent"|"dim")
 *  @returns true when the node must not be drawn at all
 */
export function wheelRejects(node, { fnFilter = null, suggestOnly = false, buyableOnly = false, selTrads = null } = {}) {
  const nd = node || {};
  const trads = selTrads && selTrads.size ? selTrads : null;
  const fns = fnFilter && fnFilter.size ? fnFilter : null;
  if (!trads && !fns && !suggestOnly && !buyableOnly) return false;   // nothing is filtering; nothing hides
  if (trads && !inTraditions(nd, trads)) return true;
  if (fns && !matchesFunction(nd, fns)) return true;
  if (suggestOnly && !(nd.recommended && !nd.owned)) return true;
  if (buyableOnly && !(nd.reachable && !nd.owned)) return true;
  return false;
}

/** ⛔ CCODE-197 (Erik): "the bare tradition include the adjacent ones by mistake."
 *
 *  It did, and deliberately — SNG-202B lit a selected tradition's ring-NEIGHBOURS as "adjacent" to show the
 *  circle's structure. As a display of shape that is defensible; as a FILTER it is wrong, because the answer
 *  to "show me the death ones" must not include the two traditions either side of death. Now that a
 *  tradition click hides rather than dims, the distinction stopped being cosmetic: adjacency was quietly
 *  widening the set the player thought they had narrowed.
 *
 *  ⚠️ A BRAID BELONGS TO BOTH ITS PARENTS. It is not "adjacent" to them, it is made of them, so a
 *  selected tradition shows the braids built from it — which is the one inclusion that is not a widening. */
export function inTraditions(node, selected) {
  const nd = node || {};
  if (!selected || !selected.size) return true;
  if (nd.braid) return (nd.parentTrads || []).some(t => selected.has(t));
  return selected.has(nd.cls);
}

/** ⛔ CCODE-197 (Erik): "filter by ALL the skill functions, not just the primary families, so I can
 *  find very specific skill options."
 *
 *  The wheel filtered on the 8 FAMILIES — HARM, RESTORE, PROTECT, KNOW, SHAPE, INFLUENCE, MOVE, SUSTAIN —
 *  which are buckets the 24 authored function verbs fall into. Measured across the catalogue: 24 distinct
 *  verbs on 376 abilities (reveal 145, bind 73, strike 59, sustain 57, foresee 46, make 46 …). "HARM" cannot
 *  tell `strike` from `break`; a player hunting a specific option was being handed a third of the wheel.
 *
 *  ⚠️ ONE SET HOLDS BOTH. A family and a verb are different grains of the same question, and a filter
 *  that made the player choose which grain to think in would be a worse answer than the one it replaced. */
export function matchesFunction(node, chosen) {
  const nd = node || {};
  if (!chosen || !chosen.size) return true;
  return (nd.families || []).some(f => chosen.has(f)) || (nd.functions || []).some(f => chosen.has(f));
}

// ⛔ CCODE-224 — WHAT CREATION OFFERS, AS ONE RULE IN ONE PLACE. The create screen now has TWO surfaces for
// the same choice (the wheel and the list beneath it), and the failure that kind of pair invites is each
// growing its own copy of the rule until they quietly disagree about one craft.
//
// ⚠️ AND IT IS DELIBERATELY *NOT* `canLearnAbility`. That gate prices a craft in SKILL POINTS and charges
// more for an off-band pick; creation spends PICKS, all of which cost exactly one. Feeding the level-up
// gate a synthetic sheet would have let the cost-by-band rule silently forbid a craft the create list has
// always offered — the rule and the surface would still "agree", both being wrong together.
//
// The band still matters and is still shown: `domainAccess` decides ALLOWED, which is creation's whole
// question. What it must not do here is decide AFFORDABLE.
export function creationPickable(ability, { domains, grantIds = [], traditionIndex = null, domainAccess } = {}) {
  if (!ability) return false;
  if (abilityTier(ability) > 1) return false;                    // depth is earned in play, never bought at creation
  if ((grantIds instanceof Set ? grantIds.has(ability.id) : (grantIds || []).includes(ability.id))) return false; // already yours — a pick spent here is wasted
  if (typeof domainAccess !== "function") return false;
  // ⛔ CCODE-339b / ERIK: "I'm ok with having the antipodes L1 skills open during character creation."
  //
  // ⚠️ I STUBBED THIS THE OTHER WAY AND FLAGGED IT AS HIS TO OVERRULE. My reading was that "teachers and
  // standing" implied you could not BEGIN having crossed your own axis. He ruled the opposite, and his is
  // the better story: you may start having already touched the other side — you simply cannot use it.
  //
  // ✅ AND THE DEPTH LIMIT WAS ALREADY HERE: the `levelReq > 1` line above caps creation at rank 1, so
  // "antipode L1 open" is exactly what asking `allowed` gives. No new rule was needed to bound it.
  //
  // ⚠️ AND THAT PARAGRAPH USED TO END "IT IS STILL NOT CASTABLE — braid material only". ⛔ R16 RETIRED
  // THAT RULE and this comment outlived it by weeks, in the module that decides what a new character may
  // pick. ⚑ MEASURED 2026-09-05: `castable: false` has ZERO producers across the whole catalogue for any
  // primary — an antipode craft is expensive and shallow while you dabble (`leanSurcharge`, `tierCap`), and
  // it is CASTABLE. A comment that states a retired rule is read as the rule.
  return domainAccess(ability, null, domains, traditionIndex).allowed === true;
}

/** The whole creation pool, in ring-independent order. `catalog` is any {id: ability} map or array. */
export function creationPool(catalog, opts = {}) {
  const list = Array.isArray(catalog) ? catalog : Object.values(catalog || {});
  return list.filter(a => creationPickable(a, opts));
}
