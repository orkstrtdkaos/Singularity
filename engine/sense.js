// sense.js — the graduated "sense of success" filter.
// The engine always knows the true odds; the CHARACTER only perceives what
// their attunement earns them. Pure functions; no I/O.

import { spectrumAlignment } from "./resolve.js";

/** Determine the character's sense tier for this action.
 *  Attunement grows with level/ability use; matching the local spectrum sharpens the read;
 *  the Strategist aptitude grants +1 tier on planned actions. */
export function senseTier({ character, action, location, rules, aptitudeMods = {} }) {
  let att = character.attunement || 0;
  // Reading a place whose energies match your own fingerprint is easier
  if (spectrumAlignment(character.alignment, location?.spectrum) > 0.3) att += 1;
  if (action?.planned && aptitudeMods.senseTierBonus) att += aptitudeMods.senseTierBonus * 3;

  let tier = 0;
  for (const t of rules.senseTiers) if (att >= t.minAttunement) tier = t.tier;
  return tier;
}

/** Render what the character perceives about their odds. Returns { tier, text }.
 *  text is diegetic — a feeling, not a number — until mastery. */
export function renderSense(trueChance, tier) {
  if (tier <= 0) return { tier, text: null }; // no read at all — flying blind
  if (tier === 1) {
    return { tier, text: trueChance >= 50 ? "Something in you settles — this feels doable." : "A prickle of doubt — this feels risky." };
  }
  if (tier === 2) {
    const bands = [
      [80, "You can all but feel it succeeding already."],
      [60, "This feels within your reach."],
      [40, "This could go either way."],
      [20, "This feels reckless."],
      [0,  "Every instinct says this will fail."]
    ];
    for (const [min, text] of bands) if (trueChance >= min) return { tier, text };
  }
  // tier 3: near-precise, with the confidence of mastery
  const approx = Math.round(trueChance / 10) * 10;
  return { tier, text: `Your practiced sense reads this at roughly ${approx} in a hundred.` };
}

/** Convenience: full sense pass in one call. */
export function senseAction(ctx, trueChance) {
  return renderSense(trueChance, senseTier(ctx));
}
