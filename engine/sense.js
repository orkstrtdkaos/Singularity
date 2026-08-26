// sense.js — the graduated "sense of success" filter.
// The engine always knows the true odds; the CHARACTER only perceives what
// their attunement earns them. Pure functions; no I/O.

import { spectrumAlignment } from "./resolve.js";
import { characterPower, threatBand } from "./threat.js"; // CCODE-52: the band is RELATIVE — the same foe reads differently at level 5 and level 20

/** Determine the character's sense tier for this action.
 *  Attunement grows with level/ability use; matching the local spectrum sharpens the read;
 *  the Strategist aptitude grants +1 tier on planned actions. */
import { rateValue } from "./ladder.js";   // SNG-365
import { revealTarget, canInterveneFor } from "./targeting.js";   // CCODE-250: who the blow is aimed at is a tiered reveal like any other

export function senseTier({ character, action, location, rules, aptitudeMods = {} }) {
  let att = character.attunement || 0;
  // ⛔ SNG-365 — `insight` SUMS WITH EARNED ATTUNEMENT. Erik ratified the addition rather than a max:
  // attunement is what practice gave you and insight is what you are, and a character who has both should
  // read a room better than one with either. A max() would have made the smaller of the two free.
  att += rateValue(rules?.subAttributeLadder, character, "insight");
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
export function senseOpponent(viewer, oppRound, rules, sb, { scouting = false, buyTier = 0, aptitudeMods = {}, earnedTier = null } = {}) {
  const maxTier = (rules?.senseTiers || []).reduce((m, t) => Math.max(m, t.tier), 0);
  // CCODE-51 (Erik's ladder): when a READ was actually rolled, its DEGREE sets what you learned — fail 0, partial
  // 1, success 2, crit/decisive 3. It REPLACES the stat-derived tier rather than adding to it: a read is a thing
  // you DO, and a botched one should leave you blinder than not looking — which a floor would hide.
  let tier;
  if (Number.isFinite(earnedTier)) tier = Math.max(0, Math.min(maxTier, earnedTier));
  else {
    tier = senseTier({ character: viewer, action: { planned: scouting }, location: null, rules, aptitudeMods });
    tier = Math.max(0, Math.min(maxTier, tier + (buyTier || 0)));
  }
  const vis = (sb?.senseVisibility && sb.senseVisibility[String(tier)]) || { reveals: ["outcome"] };
  const reveals = new Set(vis.reveals || ["outcome"]);
  const revealed = {};
  if (reveals.has("outcome")) revealed.outcome = (oppRound?.margin ?? 0) >= 0 ? "pressed the advantage" : "faltered";
  if (reveals.has("intent")) revealed.intent = oppRound?.function || null;
  if (reveals.has("band")) revealed.band = marginBand(oppRound?.margin ?? 0);
  if (reveals.has("skill")) revealed.skill = oppRound?.name || oppRound?.function || null;
  if (reveals.has("intensity")) revealed.intensity = oppRound?.intensity || null;
  // CCODE-250 (Erik): "you need to sense who's getting attacked so you can intervene if you want.... if you
  // obscure yourself you aren't going to know that information." WHO A BLOW IS AIMED AT is one more thing on
  // this ladder, and it is the one that makes interception a decision rather than a coin flip. The GRANULARITY
  // is the tier itself, exactly as `band` and `breakdown` already work: a weak read tells you it is not you, a
  // real read names them, a decisive read says WHY — which is what lets you bait it next round.
  // The obscurer earns tier 0, whose authored reveals do NOT include "target", so they learn nothing.
  if (reveals.has("target") && oppRound?.targetChoice) {
    revealed.target = revealTarget(oppRound.targetChoice, tier, { viewerId: viewer?.id ?? "player", cfg: sb?.targetReveal || {} });
    // ⚠️ AND THE ANSWER THE UI ACTUALLY NEEDS, computed here rather than re-derived at the call site: may
    // this viewer step in front of what they just saw? A read that names the mark earns the option; a read
    // that does not, and the obscurer's non-read, do not.
    revealed.target.canIntervene = canInterveneFor(revealed.target);
  }
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

// ---------- CCODE-44: sizing up a fight BEFORE you take it ----------
// Erik: "When a fight offer is given… stand and fight, or run away. You should be able to tell something about how
// hard the opponent will be to beat - perhaps even a breakdown of why (relative skill level to yours = high, same,
// low, - relative Physical prowess = high, same, low, - disposition: out to kill/steal/harm/flee - overall threat
// level)." Rule 18 OFFERS a lethal fight rather than imposing it — but a decline you cannot inform is not really a
// choice. This is the read that makes "back away" a decision instead of a coin flip.
//
// RELATIVE, always: every line is measured against THIS character, so the same raider reads "outmatches you" to a
// novice and "beneath you" to a veteran. Pure — no I/O, no rng; app.js owns where it renders.

const APPR_REL = (mine, theirs, tol) => {
  const d = (theirs || 0) - (mine || 0);
  if (d > tol) return "high";
  if (d < -tol) return "low";
  return "same";
};
const APPR_WORD = { high: "outmatches you", same: "a match for you", low: "beneath you" };
const apprPeak = (attrs = {}, keys) => Math.max(0, ...keys.map(k => Number(attrs[k]) || 0));

/** What is this opponent AFTER? Read from the def's own tags — never invented. */
export function dispositionOf(def = {}, content = {}) {
  const tags = (def.opponent?.tacticTags || []).map(t => String(t).toLowerCase());
  const map = content.dispositionByTag || {};
  for (const t of tags) if (map[t]) return map[t];
  if (def.lethal) return "out to kill";
  if (def.flavor === "theft" || tags.includes("thief")) return "out to take what you carry";
  if (def.type === "chase") return "looking to run you down";
  return "out to hurt you";
}

/** The pre-fight read: relative craft, relative prowess, disposition, and an overall threat band.
 *  `oppSheet` is the synthesized battle sheet, so the numbers are the ones the fight will actually use. */
export function appraiseOpponent(character, def, oppSheet, rules, sb, content = {}) {
  const tol = content.relativeTolerance ?? 1;
  const prowess = APPR_REL(apprPeak(character?.attributes || {}, ["physical", "practical"]),
                           apprPeak(oppSheet?.attributes || {}, ["physical", "practical"]), tol);
  // "craft" is depth: the best rank you can bring vs the best tier they can.
  const myTier = Math.max(0, ...(character?.abilities || []).map(a => Number(a.level) || 0));
  const theirTier = Math.max(0, ...((oppSheet?.skills || []).map(s => Number(s.tier) || 0)));
  const skill = APPR_REL(myTier, theirTier, tol);
  const threat = Number(def?.opponent?.threat) || 0;
  // CCODE-52 (Erik's model): the band is RELATIVE, not absolute. The old ladder read `threat >= 80 = deadly` for
  // everyone — so the same warpling was "deadly" to a level-20 character, and the world could never tell you that
  // you had outgrown a thing, nor that what is in front of you is far beyond you. "Your level sets the mean about
  // which the encounters revolve": the rung is threat ÷ YOUR power. Labels are Aevi's once authored (CCODE-52).
  const power = characterPower(character, content.power || {});
  const rung = threatBand(power, threat, content.threatBands || null);
  const band = rung.label;
  const against = [skill, prowess].filter(r => r === "high").length;
  const counsel = against === 2 ? "They have the better of you on both counts — this is a fight you may not win."
    : against === 1 ? "They have an edge on you. Winnable, but it will cost."
    : (skill === "low" && prowess === "low") ? "You have the better of them on both counts."
    : "An even contest.";
  // CCODE-52: on the hard rungs the BAND's counsel wins — "do not fight this" outranks a craft-vs-prowess compare,
  // and this is the line that has to stop a player walking into a death.
  const finalCounsel = ["flee", "dire"].includes(rung.key) ? (rung.counsel || counsel) : counsel;
  return { skill, prowess, disposition: dispositionOf(def, content), threat: band, threatScore: threat,
    power, band: rung, counsel: finalCounsel,
    lines: [{ label: "how they stand to you", rel: rung.key, text: `${rung.label} — threat ${threat} against your ${power}` },
            { label: "craft", rel: skill, text: `Their craft ${APPR_WORD[skill]}` },
            { label: "prowess", rel: prowess, text: `Their physical prowess ${APPR_WORD[prowess]}` }] };
}
