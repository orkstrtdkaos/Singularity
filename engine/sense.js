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

/** SNG-098: FOG OF WAR against an opponent's skill-battle round. senseTier is a function of the VIEWER
 *  (attunement + Strategist-on-scout + a bought tier from a "read them" action), never of the thing sensed —
 *  so it points at the adversary unchanged. Returns exactly the slice of the opponent's TRUE round the
 *  viewer's tier earns (per sb.senseVisibility): tier 0 outcome-only, tier 3 the full SNG-106 breakdown.
 *  THE ENGINE ALREADY KNOWS THE WHOLE ROUND — this gates DISPLAY only; it never fabricates a number.
 *  `oppRound` is the `opponent` receipt from battleRound. Pure. */
export function senseOpponent(viewer, oppRound, rules, sb, { scouting = false, buyTier = 0, aptitudeMods = {} } = {}) {
  const maxTier = (rules?.senseTiers || []).reduce((m, t) => Math.max(m, t.tier), 0);
  let tier = senseTier({ character: viewer, action: { planned: scouting }, location: null, rules, aptitudeMods });
  tier = Math.max(0, Math.min(maxTier, tier + (buyTier || 0)));
  const vis = (sb?.senseVisibility && sb.senseVisibility[String(tier)]) || { reveals: ["outcome"] };
  const reveals = new Set(vis.reveals || ["outcome"]);
  const revealed = {};
  if (reveals.has("outcome")) revealed.outcome = (oppRound?.margin ?? 0) >= 0 ? "pressed the advantage" : "faltered";
  if (reveals.has("intent")) revealed.intent = oppRound?.function || null;
  if (reveals.has("band")) revealed.band = marginBand(oppRound?.margin ?? 0);
  if (reveals.has("skill")) revealed.skill = oppRound?.name || oppRound?.function || null;
  if (reveals.has("intensity")) revealed.intensity = oppRound?.intensity || null;
  if (reveals.has("breakdown")) revealed.breakdown = oppRound?.breakdown || null; // the tier-3 "see their math" view (SNG-106 popup)
  return { tier, label: vis.label || null, revealed };
}

/** A qualitative band on a contest roll's margin — never the number (that's tier 3 only). */
function marginBand(margin) {
  if (margin >= 25) return "a crushing move";
  if (margin >= 10) return "a strong move";
  if (margin >= -5) return "an even move";
  if (margin >= -20) return "a weak move";
  return "a faltering move";
}
