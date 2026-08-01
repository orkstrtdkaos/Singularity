// threat.js — SNG-249: the threat balance system.
//
// ERIK'S RULING (2026-08-01), which this module exists to implement:
//   "A region should never really be only one level range... All of these things exist everywhere in the world —
//    but areas have their own beasts and villains — it's just that your level sets the mean about which the
//    encounters revolve. A boar at lvl 20 isn't really an encounter anymore, unless it's a special encounter."
//
// So difficulty is a DISTRIBUTION, not a gate. The region supplies the CAST (which beasts and villains live here);
// the player's power supplies the MEAN. Both tails always exist:
//   • an UPPER tail you must avoid or escape — which is only fair because fleeing is a real, playable move
//     (SNG-247 made a fled fight become a chase), and because the band tells you BEFORE you commit;
//   • a LOWER tail that falls below a relevance floor and stops being an encounter at all — unless something
//     makes it special again (a variant, a quest, a swarm).
//
// Everything here is PURE and dial-driven. The band LABELS and the variant FICTION are Aevi's (SNG-249 authoring);
// the defaults below are deliberately plain so they read as placeholders rather than as decisions.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ---------- what the player is worth, on the same scale as threat ----------

/** SNG-249 (Erik's call: "built power for the band readout, level for the world's mean"): an HONEST power number
 *  from what the character actually IS — their sharpest attribute, their breadth, and the depth of their craft —
 *  not from their XP total. Two level-6 characters who built differently are different threats to take on, and the
 *  readout should say so. Returns a number on the THREAT scale, so power 55 ≈ an even fight with a threat-55 foe.
 *  Pure; every weight is a content dial. */
export function characterPower(character = {}, cfg = {}) {
  const w = cfg.powerWeights || {};
  const attrs = Object.values(character.attributes || {}).map(num).filter(n => n > 0);
  const attrPeak = attrs.length ? Math.max(...attrs) : 0;
  const attrRest = attrs.reduce((a, b) => a + b, 0) - attrPeak;
  // craft depth: the best rank you can bring, plus what else you can bring behind it
  const tiers = (character.abilities || []).map(a => num(a.level ?? a.tier ?? a.rank)).filter(n => n > 0);
  const tierPeak = tiers.length ? Math.max(...tiers) : 0;
  const tierRest = tiers.reduce((a, b) => a + b, 0) - tierPeak;
  const raw = attrPeak * (w.attributePeak ?? 8)
    + attrRest * (w.attributeBreadth ?? 1.5)
    + tierPeak * (w.craftPeak ?? 6)
    + tierRest * (w.craftDepth ?? 2);
  return Math.max(cfg.powerFloor ?? 8, Math.round(raw));
}

// ---------- the band: how this foe reads AGAINST YOU ----------

// Plain defaults, awaiting Aevi's authored ladder (SNG-249). `atRatio` is threat/power — the point at or above
// which a foe reads as this rung. Ordered hardest-first so the first match wins.
export const DEFAULT_BANDS = [
  { key: "flee",     atRatio: 2.50, label: "beyond you",        counsel: "Do not fight this. Run, hide, or find another road." },
  { key: "dire",     atRatio: 1.75, label: "far above you",     counsel: "This will most likely kill you. Escape is the sane move." },
  { key: "hard",     atRatio: 1.25, label: "above you",         counsel: "Winnable only if everything goes right, and it will cost." },
  { key: "even",     atRatio: 0.80, label: "a real fight",      counsel: "A true contest — your choices decide it." },
  { key: "trivial",  atRatio: 0.45, label: "beneath you",       counsel: "You should win this, but it can still cost you." },
  { key: "beneath",  atRatio: 0.00, label: "beneath notice",    counsel: "Not a fight. Something else would have to make this matter." },
];

/** SNG-249: which rung this foe sits on FOR THIS CHARACTER. Relative by construction — the same warpling is a
 *  real fight at level 5 and beneath notice at level 20, which is the whole point of Erik's model. `bands` comes
 *  from content when authored (Aevi), else the plain defaults. Pure. */
export function threatBand(power, threat, bands = null) {
  const ladder = (bands && bands.length) ? bands : DEFAULT_BANDS;
  const ratio = num(threat) / Math.max(1, num(power));
  const rung = ladder.find(b => ratio >= (b.atRatio ?? 0)) || ladder[ladder.length - 1];
  return { ...rung, ratio: Math.round(ratio * 100) / 100, power: num(power), threat: num(threat) };
}

/** SNG-249: is this foe worth being an encounter at all? Erik: "a boar at lvl 20 isn't really an encounter
 *  anymore, UNLESS it's a special encounter." So the floor RETIRES a foe that has fallen far below you — and
 *  `special` (a variant, a quest hook, a swarm) is exactly what puts it back on the table. Pure. */
export function isRelevantThreat(power, threat, { special = false, cfg = {} } = {}) {
  if (special) return true;
  const floor = cfg.relevanceFloorRatio ?? 0.35;
  return num(threat) / Math.max(1, num(power)) >= floor;
}

// ---------- the distribution: level sets the MEAN, both tails are real ----------

/** SNG-249: draw a threat for an encounter around the player's power. Not a gate and not a ladder — a spread,
 *  with a deliberately LONG upper tail so the thing you must run from genuinely turns up, and a lower bound at
 *  the relevance floor so the draw never wastes itself on a boar you have outgrown.
 *
 *  `rng` is injectable so the world stays reproducible and testable. Two uniforms are combined into a rough
 *  bell (a cheap Bates draw) for the body of the distribution, then a separate roll decides whether this is an
 *  UPPER-TAIL event — because a tail you reach by luck-of-the-bell is too rare to shape play, and Erik wants the
 *  epic villain taking an interest to be a thing that HAPPENS. Pure. */
export function sampleThreat(power, rng = Math.random, cfg = {}) {
  const p = Math.max(1, num(power));
  const spread = cfg.spreadRatio ?? 0.45;          // the body: power × (1 ± spread)
  const tailChance = cfg.upperTailChance ?? 0.12;  // how often the world sends something above your weight
  const tailMin = cfg.upperTailMinRatio ?? 1.4, tailMax = cfg.upperTailMaxRatio ?? 3.2;
  const floor = cfg.relevanceFloorRatio ?? 0.35;

  if (rng() < tailChance) {
    const t = tailMin + rng() * (tailMax - tailMin);
    return { threat: Math.round(p * t), tail: "upper", ratio: Math.round(t * 100) / 100 };
  }
  const bell = (rng() + rng()) / 2;                 // 0..1, centred on 0.5
  const ratio = clamp(1 + (bell - 0.5) * 2 * spread, floor, 1 + spread);
  return { threat: Math.round(p * ratio), tail: null, ratio: Math.round(ratio * 100) / 100 };
}

// ---------- variants: what makes an outgrown thing matter again ----------

// Plain defaults awaiting Aevi's fiction (SNG-249). WHAT makes a thing warped in the Valley is lore, not code —
// this is the mechanism, deliberately thin, so her axes drop straight in.
export const DEFAULT_VARIANTS = {
  greater: { threatMultiplier: 1.8, healthMultiplier: 1.6, namePrefix: "Greater", note: "larger, older, and harder to put down" },
  // `rebaseToPowerRatio` is the "it is not really that creature any more" option — see applyVariant. Aevi decides
  // which axes rebase and which merely multiply; these numbers are placeholders awaiting SNG-249 authoring.
  warped:  { threatMultiplier: 2.2, healthMultiplier: 1.3, rebaseToPowerRatio: 0.9, namePrefix: "Warped", note: "changed into something it was not meant to be" },
  swarm:   { threatMultiplier: 1.5, healthMultiplier: 2.0, namePrefix: "A press of", note: "not one of them — many" },
};

/** SNG-249: apply a variant AXIS to a base creature. The mechanism only — Aevi authors which axes exist, what they
 *  mean, and which creatures take them. Returns a NEW entry (pure), tagged so downstream can tell a variant from
 *  a base creature, and marked `special` so the relevance floor lets it through however far you have outgrown the
 *  base. That is Erik's "unless it's a special encounter", made mechanical. */
export function applyVariant(entry = {}, axis, variants = null, { power = null } = {}) {
  const table = variants || DEFAULT_VARIANTS;
  const v = table[axis];
  if (!v) return entry;
  // SNG-249: a variant can work TWO ways, and which one is Aevi's call per axis.
  //   • MULTIPLY the base — a greater boar is a bigger boar. It becomes special (so it appears at all) but stays
  //     roughly a boar, which is right for "the same creature, more of it".
  //   • REBASE toward the player's power — the thing has been made into something else, and what it WAS barely
  //     constrains what it IS. That is the option Erik's "a warped version" needs to be a real threat again at
  //     level 20; without it a warped boar is still beneath notice, which was true of the first cut of this.
  // Absent `power` (no character in context) a rebasing axis falls back to multiplying, so it is never worse.
  const baseThreat0 = num(entry.opponent?.threat ?? entry.threat ?? 20);
  const rebase = v.rebaseToPowerRatio && Number.isFinite(power)
    ? Math.round(num(power) * v.rebaseToPowerRatio)
    : null;
  const baseThreat = rebase != null ? Math.max(baseThreat0, rebase) / (v.threatMultiplier ?? 1.5) : baseThreat0;
  const baseName = entry.opponent?.name || entry.name || "the creature";
  return {
    ...entry,
    name: v.namePrefix ? `${v.namePrefix} ${baseName}` : baseName,
    special: true,                       // a variant is exactly what makes an outgrown thing an encounter again
    variant: { axis, note: v.note || null, of: baseName },
    ...(entry.opponent ? {
      opponent: { ...entry.opponent,
        name: v.namePrefix ? `${v.namePrefix} ${baseName}` : baseName,
        threat: Math.round(baseThreat * (v.threatMultiplier ?? 1.5)),
        ...(entry.opponent.health != null ? { health: Math.round(num(entry.opponent.health) * (v.healthMultiplier ?? 1.4)) } : {}),
      },
    } : { threat: Math.round(baseThreat * (v.threatMultiplier ?? 1.5)) }),
  };
}
