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
