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
export function bandFor(tradition, data) {
  const b = data?.substrateBand?.[tradition];
  return b && b.center != null ? { center: b.center, width: b.width ?? 0.18 } : null;
}

/** A place's effective density for a wielder carrying `carried` charge, clamped to [0,1]. */
export function effectiveDensity(density, carried = 0) {
  return Math.max(0, Math.min(1, (Number(density) || 0) + (Number(carried) || 0)));
}

/** The output factor [0,1] for a craft of `band` at effective density `eff`. Two-sided: full inside
 *  the band, steep starvation below, mild floored interference above. */
export function bandFactor(band, eff, t = SUBSTRATE_TUNING) {
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

/** The effective substrate density at a location: a per-location override, else its region's density.
 *  Returns null when neither resolves (the CI flags that). Pure over the loaded content. */
export function locationDensity(location, data) {
  if (!location || !data) return null;
  if (typeof location.substrateDensity === "number") return location.substrateDensity;
  const region = location.regionId || location.region;
  const d = data.substrateDensity?.[region];
  return typeof d === "number" ? d : null;
}
