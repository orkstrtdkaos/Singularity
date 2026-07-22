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

// SNG-202 §1 general form (the weighted circular mean for schools + arbitrary composition — the Tether FCG
// meaning-gravity math) lands in 202B, WITH its consumer, when placement widens past braids. Not shipped
// here as a dead export (the wiring audit is right: an export that cannot fire in play is a false green).
