// substrate.js — SNG-090. The SECOND difficulty map. Pure, no I/O, fully testable.
//
// All craft in this world is nanite-mediated. The lattice varies in DENSITY by place, and each
// tradition is TUNED to a BAND of density (center ± width) — Amendment 1 (Erik, via CCode's Round 2):
// it is a BAND, not a fuel gauge. You can have too much.
//   • INSIDE the band  → full output.
//   • BELOW the band   → STARVATION, steep: a Continuous craft in thin ground is nearly OFF
//                        (a Seraph in the Quickwood ≈ 13%).
//   • ABOVE the band   → INTERFERENCE, mild: a Returned craft in dense ground is impaired, never off
//                        (a Rootkin in the Gearlands floors ~60–75%). "Equivalent, not equal."
//   • CARRIED charge adds to local density — it rescues the STARVED and WORSENS the CROWDED
//                        (why the Rootkin find the Waystaff trade ridiculous).
//
// ⛔ Substrate is a SEPARATE resolve term from spectral fit (SNG-079). Never fold them — a place can
//    suit you dispositionally and still starve your craft.
// ⛔ Ability actions ONLY. A weapon swing is substrate-free (SNG-089's narrative baseline).
//
// The curves are TUNABLE CONSTANTS, validated against the design anchors by tests/balance_sim.mjs.
// Do NOT eyeball them — re-run the sim after any change (CCode's Round-2 blocker, accepted).

import { geodesic } from "./worldmap.js";   // SNG-180: the substrate field measures direct geodesic distance

export const SUBSTRATE_TUNING = {
  starveExp: 1.15,      // below-band falloff steepness (Seraph@Quickwood → ≈13%)
  starveFloor: 0.0,     // a starved craft can reach ~0
  crowdSlope: 0.75,     // above-band falloff rate
  crowdFloor: 0.6,      // interference never drops a craft below this
  maxChancePenalty: 65, // factor 0 → −65 to success chance (drives to the d100 floor)
  energyK: 0.6,         // thin/crowded substrate strains: energy × (1 + energyK·(1−factor))
  gateBelow: 0.18,      // factor under this → the craft is effectively OFF (a hard, explained gate)
};

/** A tradition's band {center, width}, or null for the untuned (folk/learned) — substrate-neutral. */
export function bandFor(tradition, data) { // registry:internal
  const b = data?.substrateBand?.[tradition];
  return b && b.center != null ? { center: b.center, width: b.width ?? 0.18 } : null;
}

/** A place's effective density for a wielder carrying `carried` charge, clamped to [0,1]. */
export function effectiveDensity(density, carried = 0) { // registry:internal
  return Math.max(0, Math.min(1, (Number(density) || 0) + (Number(carried) || 0)));
}

/** The output factor [0,1] for a craft of `band` at effective density `eff`. Two-sided: full inside
 *  the band, steep starvation below, mild floored interference above. */
export function bandFactor(band, eff, t = SUBSTRATE_TUNING) { // registry:internal
  if (!band) return 1; // untuned tradition — substrate-neutral
  const lo = band.center - band.width, hi = band.center + band.width;
  if (eff >= lo && eff <= hi) return 1;
  if (eff < lo) {
    const x = lo <= 0 ? 1 : Math.max(0, eff / lo); // 1 at the band edge → 0 at true nature
    return Math.max(t.starveFloor, Math.min(1, Math.pow(x, t.starveExp)));
  }
  return Math.max(t.crowdFloor, 1 - t.crowdSlope * (eff - hi)); // interference — mild, floored
}

/** The full substrate verdict for a craft at a place. `data` = the_substrate.json. Pure. */
export function substrateVerdict({ tradition, density, carried = 0, data, tuning = SUBSTRATE_TUNING }) {
  const band = bandFor(tradition, data);
  const eff = effectiveDensity(density, carried);
  const factor = bandFactor(band, eff, tuning);
  const side = !band ? "neutral"
    : eff < band.center - band.width ? "starved"
    : eff > band.center + band.width ? "crowded" : "full";
  return {
    factor,
    side,
    percent: Math.round(factor * 100),
    chancePenalty: Math.round((1 - factor) * tuning.maxChancePenalty),
    energyMult: 1 + tuning.energyK * (1 - factor),
    off: factor < tuning.gateBelow, // the lattice is too thin (or too loud) for this craft to work
  };
}

/** SNG-090: the charge a character CARRIES — summed from inventory items with a `substrateCharge`
 *  (the Waystaff, charged reservoirs) plus any companion `substrateAura` (Aevi, a living mote-swarm).
 *  Adds to local density: rescues the starved, worsens the crowded. 0 until such content is authored.
 *  `itemCatalog` maps id→def for items stored as ids; inline item objects carry the field directly. */
// BATCH-13: NEGATIVES NOW COUNT. This guarded `c > 0` and floored at `Math.max(0, …)`, so a
// suppressor — an Ent-embassy ward, a dampening focus — was discarded twice over and could not
// exist. Two are now authored (Stillhold veil −0.10, truce token −0.05) plus Sprig's −0.08 aura.
// A suppressor is a legitimate weapon: carried into the Gearlands it shelters a Rootkin and
// cripples an Enginewright, and that falls out of the band model rather than being bolted on.
// The result is clamped to ±1 — it is a shift applied to density, not a density itself.
export function carriedSubstrate(character, itemCatalog = {}, companions = []) {
  let carried = 0;
  for (const entry of (character?.inventory || [])) {
    const def = (entry && typeof entry === "object") ? entry : (itemCatalog[entry] || null);
    const c = Number(def?.substrateCharge);
    if (Number.isFinite(c)) carried += c;
  }
  for (const comp of (companions || [])) {
    const a = Number(comp?.substrateAura);
    if (Number.isFinite(a)) carried += a;
  }
  return Math.max(-1, Math.min(1, carried));
}

/** What the player is CARRYING that moves the ground, itemised — so a receipt can name the cause.
 *  §9b invariant 5: when a carried source is why the lattice reads differently, saying so is the
 *  difference between a mechanic and "the cruellest possible bug". Returns strongest first. */
export function carriedSubstrateSources(character, itemCatalog = {}, companions = []) {
  const out = [];
  for (const entry of (character?.inventory || [])) {
    const def = (entry && typeof entry === "object") ? entry : (itemCatalog[entry] || null);
    const c = Number(def?.substrateCharge);
    if (Number.isFinite(c) && c !== 0) out.push({ name: def?.customName || def?.name || String(entry), delta: c, kind: "item" });
  }
  for (const comp of (companions || [])) {
    const a = Number(comp?.substrateAura);
    if (Number.isFinite(a) && a !== 0) out.push({ name: comp?.name || comp?.id, delta: a, kind: "companion" });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

/** The effective substrate density at a location: a per-location override, else its region's density.
 *  Returns null when neither resolves (the CI flags that). Pure over the loaded content. */
export function locationDensity(location, data) {
  if (!location || !data) return null;
  if (typeof location.substrateDensity === "number") return location.substrateDensity;
  const region = location.regionId || location.region;
  const d = data.substrateDensity?.[region];
  return typeof d === "number" ? d : null;
}

// ---------- BATCH-13: THE GEOGRAPHIC FIELD ----------
// Density is not a table of regional averages — it is a field with causes. The lattice POOLED where
// the Transition never took and WITHDREW where the Returned completed it, and 26 sites carry an
// authored ±delta saying so.
//
// DISTANCE IS THE GEODESIC ON THE SPHERE (SNG-180), and it is DIRECT — not shortest-path over the
// travel graph. That distinction is the correction to my first two attempts, and the PO's reply
// settled it: the lattice pooled and withdrew in SPACE, and its influence radiates through space,
// not along roads. Travel distance (walkingDays) is path-over-connections because walking follows
// roads; the substrate FIELD is direct geodesic because the lattice does not care whether there is a
// path. My path-over-connections instinct was right for travel and wrong for the field. Verified:
// direct geodesic reproduces the PO's published drift (0.0515) to the digit; path-over-connections
// does not.
//
// NO CALIBRATION STEP. §9b invariant 2 asks regional means to stay NEAR their authored values AS A
// CONSEQUENCE of the field, never by a correction applied to make them match — the PO's corrected
// wording after I read "the authored table is the target" as "hit the target" and renormalised. That
// forcing broke invariant 1 at the tight `radiusWorld` scale: making every local lift pay itself back
// within the region pushes a source onto the wrong side of its own baseline. Over-satisfying
// invariant 2 ate invariant 1. The ~0.05 residual drift is emergent and healthy. `pools rise / sinks
// fall` is now STRUCTURAL — a source keeps its own signed delta and nothing can flip it.

const FIELD_SUPPORT = 2.5;   // compact support: nothing past radius × this

/** Resolve the geographic substrate field. Returns Map<locationId, density>. Pure — no I/O, no
 *  mutation. `locations` is the id→record map; `data` is the_substrate.json. */
export function resolveSubstrateField(locations = {}, data = {}) {
  const base = data?.substrateDensity || {};
  const all = Object.values(locations).filter(l => l && l.id);
  const sources = all.filter(l => l.substrateSource);
  const pool = new Map(), sink = new Map();

  for (const s of sources) {
    const src = s.substrateSource;
    // radiusWorld is RADII on the sphere and is what mechanics use; `radius` (legacy map units) is
    // only a fallback for any source not yet re-authored.
    const radius = Number.isFinite(Number(src?.radiusWorld)) ? Number(src.radiusWorld) : Number(src?.radius) / 309;
    const peak = Number(src?.delta);
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(peak) || peak === 0) continue;
    for (const l of all) {
      const g = geodesic(s, l);
      if (g == null || g > radius * FIELD_SUPPORT) continue;   // compact support; unplaced → skip
      const delta = peak * Math.exp(-g / radius);
      // kind follows the SIGN — a "pool" authored below the background is unrepresentable
      if (delta < 0) sink.set(l.id, Math.max(sink.get(l.id) || 0, -delta));
      else pool.set(l.id, Math.max(pool.get(l.id) || 0, delta));
    }
  }

  // The field IS the density — no normalisation step. Each location is its region's baseline plus
  // the strongest positive delta reaching it minus the strongest negative one (the `max` above, not
  // a sum, so overlapping sources do not stack). §9b's invariant 2 asks regional means to stay NEAR
  // their authored values AS A CONSEQUENCE of the field, never by a correction applied to make them
  // match — the PO's corrected wording after I got this exactly wrong.
  //
  // I previously renormalised per region to force the mean to its authored value, and it broke
  // invariant 1 at the tight radiusWorld scale: forcing drift to zero means every local lift is paid
  // back somewhere in the same region, which pushes a source back onto the wrong side of its own
  // baseline. Over-satisfying invariant 2 ate invariant 1. The residual drift (~0.05) is emergent
  // and healthy; drift forced to zero was the symptom. `pools rise / sinks fall` is now STRUCTURAL —
  // a source keeps its own signed delta and nothing can flip it.
  const out = new Map();
  for (const l of all) {
    const b = base[l.regionId || l.region];
    if (typeof b !== "number") continue;              // no ambient → locationDensity's own fallback handles it
    out.set(l.id, clamp01(b + (pool.get(l.id) || 0) - (sink.get(l.id) || 0)));
  }
  return out;
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

/** Write the resolved field onto the in-memory location records, so `locationDensity`'s existing
 *  per-location branch picks it up with no change to it or to any call site. The authored FILES are
 *  never touched — the table stays the calibration target. Returns how many locations were stamped. */
export function applySubstrateField(locations = {}, data = {}) {
  const field = resolveSubstrateField(locations, data);
  let n = 0;
  for (const [id, density] of field) {
    const loc = locations[id];
    if (!loc || typeof loc.substrateDensity === "number") continue;   // an authored override always wins
    loc.substrateDensity = density;
    n++;
  }
  return n;
}
