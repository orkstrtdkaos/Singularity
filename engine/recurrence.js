// recurrence.js — SNG-138: prestige-driven recurring challenges. A bound arc carrying a
// `recurrence: { trigger: "prestige", escalationBands: [...] }` block draws duel challengers as the
// character's renown (deeds-driven reputation) rises — the swordsman's paradox as an arc engine:
// prestige feeds challengers feeds prestige. The duel itself runs as an ordinary SNG-098 skill
// battle with the guaranteed decline/flee path (SNG-002b) — this module only decides WHO rises,
// WHEN, and what a win/loss is worth. A REUSABLE arc type: any "the world keeps testing you as you
// rise" arc (a duelist, a wanted name, a feared mage) can carry the same recurrence block.
// Pure over plain data (character / arc def / challenger pool); never throws.

const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Default renown thresholds per band NAME (an arc may override via recurrence.bandThresholds).
const DEFAULT_THRESHOLDS = { unknown: 0, known: 6, renowned: 16, legendary: 30 };
// Fallback thresholds by band INDEX when a band name isn't in the default map (reusable pools).
const INDEX_THRESHOLDS = [0, 6, 16, 30, 48];

/** Aggregate renown — the deeds-driven reputation summed across ALL communities (a name travels;
 *  fame is not local). Wins raise it, losses (negative-weight deeds) lower it. Chosen for legibility
 *  (SNG-138 OQ1): the loop is self-contained — each challenger win records a band-scaled deed here. */
export function renownScore(character) {
  let s = 0;
  for (const d of character?.deeds || []) s += Number(d?.weight) || 0;
  return s;
}

/** The current prestige band for a renown score, walking the arc's escalationBands in order.
 *  Returns the highest band whose threshold is met (never below the first band). */
export function bandForRenown(renown, escalationBands = [], thresholds = null) {
  const bands = (escalationBands || []).map(b => b?.band).filter(Boolean);
  if (!bands.length) return null;
  let current = bands[0];
  bands.forEach((band, i) => {
    const t = (thresholds && Number.isFinite(thresholds[band])) ? thresholds[band]
      : Number.isFinite(DEFAULT_THRESHOLDS[band]) ? DEFAULT_THRESHOLDS[band]
        : (INDEX_THRESHOLDS[i] ?? INDEX_THRESHOLDS[INDEX_THRESHOLDS.length - 1]);
    if (renown >= t) current = band;
  });
  return current;
}

/** The challenger ids eligible at a band (from the arc's escalationBands). */
export function challengersForBand(band, escalationBands = []) {
  const row = (escalationBands || []).find(b => b?.band === band);
  return (row?.challengers || []).slice();
}

/** Find the character's ACTIVE bound prestige-recurrence arc. The held quest instance does not carry
 *  the recurrence block, so resolve the DEF from the catalog by arcId/id. Returns { q, def } or null. */
export function findPrestigeArc(quests = [], defs = []) {
  const active = (quests || []).filter(q => q?.structured && q.status === "active");
  for (const q of active) {
    const def = (defs || []).find(d => d && (
      (q.arcId && d.arcId && q.arcId === d.arcId) || slug(d.id) === slug(q.id)
    ));
    if (def?.recurrence?.trigger === "prestige" && Array.isArray(def.recurrence.escalationBands)) return { q, def };
  }
  return null;
}

/** Resolve the challenger pool for an arc from a challengerPools map (keyed by pool id), matching by
 *  shared arcId (the arc carries no explicit pool-id field). */
export function challengerPoolFor(def, challengerPools = {}) {
  if (!def) return null;
  return Object.values(challengerPools || {}).find(p => p?.arcId && p.arcId === def.arcId) || null;
}

/** Pick a challenger record from the pool, filtered to the eligible ids, avoiding an immediate repeat. */
export function pickChallenger(ids = [], challengers = [], rng = Math.random, avoidId = null) {
  let pool = (challengers || []).filter(c => ids.includes(c?.id));
  if (!pool.length) return null;
  if (pool.length > 1 && avoidId) { const f = pool.filter(c => c.id !== avoidId); if (f.length) pool = f; }
  return pool[Math.floor(rng() * pool.length)] || pool[0];
}

// A rising name draws harder hands — threat + fire-chance scale by band.
const BAND_THREAT = { unknown: 22, known: 34, renowned: 48, legendary: 62 };
const BAND_INDEX = { unknown: 0, known: 1, renowned: 2, legendary: 3 };
const BAND_CHANCE = { unknown: 0.16, known: 0.26, renowned: 0.38, legendary: 0.5 };

/** A light tactic-tag read from a challenger's authored `style` (the record carries no mechanical
 *  block — only narrative fields), threaded so the duel reads in the challenger's idiom. */
function tacticsFor(style = "", traditions = []) {
  const s = String(style).toLowerCase();
  const tags = [];
  if (/precise|studie?s?|counter|ledger|record|prepared|method/.test(s)) tags.push("feint", "counter");
  if (/aggress|press|overwhelm|fire|blaze|fury|relentless|storm/.test(s)) tags.push("press-in", "overwhelm");
  if (/patient|still|water|wait|calm|defensive|guard/.test(s)) tags.push("circle", "read");
  if ((traditions || []).includes("blazeborn")) tags.push("burst");
  return [...new Set(tags.length ? tags : ["press-in", "circle", "feint"])].slice(0, 4);
}

/** Adapt a challenger content record → a duel encounter ENTRY (the shape buildOffer/synthesizeDuelDef
 *  expect). Threat scales by band; traditions/style thread into the seed for the GM's aftermath narration.
 *  Carries `_challengeBand` + `_challenger` so the resolved duel can feed renown (see challengeDeedWeight). */
export function challengerToDuelEntry(challenger, band, opts = {}) {
  if (!challenger) return null;
  const threat = BAND_THREAT[band] ?? 30;
  const trads = (challenger.traditions || []).join(", ");
  const seed = `${challenger.name} — ${challenger.concept || "a rising blade come to measure your name"}`
    + `${trads ? ` (fights in the idiom of ${trads})` : ""}.${challenger.duelStakes ? ` ${challenger.duelStakes}.` : ""}`;
  return {
    id: `challenger-${challenger.id}`,
    routing: "duel", flavor: "fight", avoidable: true, seed,
    opponent: {
      name: challenger.name, threat,
      tacticTags: tacticsFor(challenger.style, challenger.traditions),
      fleeDifficulty: 12 + (BAND_INDEX[band] ?? 0) * 4,
      yieldAt: 0.25
    },
    _challengeBand: band,
    _challenger: { id: challenger.id, arcId: opts.arcId || null, traditions: challenger.traditions || [] }
  };
}

// A resolved challenger duel feeds renown — beating a higher band raises it more; a loss costs the
// name modestly (never death; yield/flee exist). recordDeed clamps to +-3, so these stay in range.
const WIN_WEIGHT = { unknown: 1, known: 2, renowned: 3, legendary: 3 };
export function challengeDeedWeight(band) { return WIN_WEIGHT[band] ?? 1; }
export function challengeLossWeight(_band) { return -1; }

/** The paced fire test — a famous name draws more hands, scaled by the player's pacing, capped so it
 *  is "regularly challenged" not "constantly forced to fight". */
export function shouldFireChallenger(renown, band, paceMult = 1, rng = Math.random) {
  const base = BAND_CHANCE[band] ?? 0.2;
  const p = Math.min(0.75, base * (paceMult || 1));
  return rng() < p;
}

/** Cooldown (in qualifying moves) after a challenger fires — shorter when pacing is cranked. */
export function challengeCooldown(paceMult = 1) {
  return Math.max(1, Math.round(4 / Math.max(0.5, paceMult || 1)));
}
