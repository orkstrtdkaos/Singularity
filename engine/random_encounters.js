// random_encounters.js — SNG-014. The valley is alive: on travel / rest / entering
// a place / world-tick, the engine MAY roll one flavored encounter, weighted by the
// location's dangerLevel + tags. Tonal spectrum (beneficial…fight), never grim.
//
// Design law 1 holds absolutely: this module DECIDES *whether* and *which*, and
// synthesizes typed encounter defs for the existing encounters engine to run. It
// never rolls resolution and never advances state — routing reuses resolve.js /
// encounters.js unchanged. Any lethal-capable encounter is OFFERED with a decline
// path built HERE (SNG-002b), not left to the model.

const PEACEFUL = ["beneficial", "benign", "beautiful"];
const PERILOUS = ["dangerous", "theft", "chase", "fight"];
const RISKY_TAGS = ["disputed", "wild", "frontier", "march", "ruin", "raid", "contested", "border", "wilds", "deep", "dark", "waste", "broken", "haunt"];
const SAFE_TAGS = ["sanctuary", "haven", "hearth", "temple", "market", "settled", "home", "refuge", "village"];
const DANGER_FLOOR = 1; // SNG-225 §4b: a place in the world is never "safest possible" by accident of a missing field

/** A location's danger, clamped 0..4. SNG-225 §4b: a MISSING dangerLevel is NOT 0 (the safest possible, which
 *  silently disqualifies every minDanger>0 encounter and STARVES the eligible pool at generated locations) —
 *  a null/undefined danger floors to DANGER_FLOOR so a road can still hold a threat. An explicit 0 is honoured
 *  (a deliberate haven); only the absence of the field is floored. */
export function dangerOf(location) {
  const raw = location?.dangerLevel;
  if (raw == null) return DANGER_FLOOR;
  return Math.max(0, Math.min(4, raw | 0));
}

/** SNG-225 §4a: a real dangerLevel for a MINTED location, so it is never null (null guts encounter eligibility,
 *  §3). Inherits the neighbourhood's danger (the place it was reached from), nudged by its own tags — a road
 *  near a danger-2 town is ~danger 2, a "wild"/"disputed"/"ruin"-tagged place lifts, a hearth/haven lowers.
 *  Low-but-nonzero floor of 1 (a transit waypost is not danger 0). Pure, clamped 1..4. */
export function deriveDangerLevel(location, { baseDanger = null } = {}) {
  const tags = (location?.tags || []).map(t => String(t).toLowerCase());
  let d = baseDanger != null ? Math.max(0, Math.min(4, baseDanger | 0)) : DANGER_FLOOR;
  if (tags.some(t => RISKY_TAGS.some(r => t.includes(r)))) d += 1;
  if (tags.some(t => SAFE_TAGS.some(s => t.includes(s)))) d -= 1;
  return Math.max(1, Math.min(4, d));
}

/** Settled/hearth rests are safe — wilderness rests are where the night has teeth. */
function isSafeRest(location) {
  const tags = (location?.tags || []).join(" ").toLowerCase();
  return /village|town|city|inn|hearth|hall|settled|farming/.test(tags);
}

/** Flavor bias by danger: peaceful flavors always present (grace floor); perilous
 *  ones scale up with danger. Keeps "every place keeps a chance of beauty." */
export function flavorMultiplier(flavor, danger) {
  const d = Math.max(0, Math.min(4, danger | 0));
  if (PEACEFUL.includes(flavor)) return 1 + (4 - d) * 0.35; // 2.4 (safe) … 1.0 (deadly)
  return 0.15 + d * 0.6;                                    // 0.15 (safe) … 2.55 (deadly)
}

/** Does this encounter entry fit the location? DANGER gate + tag match. SNG-225 §4c (Erik's call): the
 *  region-lock is DROPPED — "the world is full of wonders and dangers; let each location have them as they
 *  come." Region-anchoring was disqualifying 44/58 encounters and starving every location's pool; now an
 *  encounter's fitness is its DANGER threshold (severity by the place's danger) + its TAG context, not its
 *  geography. A dangerous encounter can find any place whose danger admits it — Millbrook defends itself when
 *  the threat is near. (The entry's `regions` field is kept as data, no longer a hard gate.) */
export function isEligible(entry, location, { ignoreDanger = false } = {}) {
  if (!ignoreDanger && (entry.minDanger || 0) > dangerOf(location)) return false;
  // entry.tags, when present, are a *preference* not a hard gate — a cutpurse wants a crowd. Soft-match: if
  // tags listed and NONE overlap the location's tags, it's ineligible ONLY for tag-anchored flavors.
  if (entry.tags && entry.tags.length) {
    const locTags = (location?.tags || []).map(t => String(t).toLowerCase());
    const overlap = entry.tags.some(t => locTags.some(lt => lt.includes(t) || t.includes(lt)));
    if (!overlap && !ignoreDanger) return false;
  }
  return true;
}

/** Should a trigger fire at all this moment? Pure; rng injectable. */
export function rollTrigger(trigger, location, table, rng = Math.random, mult = 1) {
  const tr = table?.triggerRules?.[trigger];
  if (!tr) return false;
  if (trigger === "onRest" && isSafeRest(location)) return false;
  // danger nudges the base chance up a little — dangerous roads are eventful roads. SNG-127: `mult` is
  // the player's pacing multiplier (Calm→Relentless), applied uniformly to every click-path rate.
  const chance = Math.min(0.9, (tr.chance || 0) * (1 + dangerOf(location) * 0.1) * (mult || 1));
  return rng() < chance;
}

// ---------- SNG-127: player-selectable pacing (profile.pacing) ----------
/** Resolve a pacing key → { mult, cooldown } from the content table's `pacingModes` (with a safe
 *  hardcoded fallback). `mult` scales every encounter roll; `cooldown` is the quiet-beats gate.
 *  Default `balanced` (mult 1, cooldown 1). Pure. */
export function resolvePacing(key, table) {
  const modes = table?.triggerRules?.pacingModes || {};
  const fallback = { calm: { mult: 0.5, cooldown: 3 }, balanced: { mult: 1, cooldown: 1 }, eventful: { mult: 1.6, cooldown: 1 }, relentless: { mult: 2.4, cooldown: 0 } };
  const k = (typeof key === "string" && (modes[key] || fallback[key])) ? key : "balanced";
  const m = modes[k] || fallback[k];
  return { key: k, mult: Number.isFinite(m?.mult) ? m.mult : 1, cooldown: Number.isFinite(m?.cooldown) ? m.cooldown : 1 };
}

// ---------- SNG-075: encounters fire in NARRATIVE play, bound to narrative TIME ----------
// The engine already knows how long the fiction took (timeOps.hoursPassed). Narrative time IS
// the encounter window: a quick exchange stays quiet; a half-day's walk is likely eventful.
// Rates default here (a mechanic, not content) but a content pack MAY override via
// triggerRules.onNarrativeTime {ratePerHour, maxChance}.

/** Probability that a stretch of narrative time turns something up. ~ratePerHour × hours,
 *  danger-weighted, clamped. Pure. */
export function narrativeTimeChance(hoursPassed, location, table, mult = 1) {
  const tr = table?.triggerRules?.onNarrativeTime || {};
  const ratePerHour = Number.isFinite(tr.ratePerHour) ? tr.ratePerHour : 0.14; // SNG-127: 0.14/hr (was 0.04 fallback → the dead-zone)
  const cap = Number.isFinite(tr.maxChance) ? tr.maxChance : 0.6;
  // Honors the hours as given — the caller floors an UNDECLARED beat to minHoursPerBeat (a declared
  // short exchange stays quiet). SNG-127: `mult` is the player's pacing multiplier.
  const h = Math.max(0, Number(hoursPassed) || 0);
  const base = Math.min(cap, ratePerHour * h);
  return Math.min(0.9, base * (1 + dangerOf(location) * 0.1) * (mult || 1));
}
/** SNG-127: what a beat's hours are worth for the narrative-time roll. A DECLARED timeOps value is
 *  honored as-is (a 20-min exchange stays quiet); an UNDECLARED beat (the GM omits timeOps, yet the
 *  clock still ticks ~1h) is floored to `minHoursPerBeat` so the whole path isn't silently seeing 0h. */
export function beatHours(turn, table) {
  const declared = turn?.timeOps && Number.isFinite(Number(turn.timeOps.hoursPassed));
  if (declared) return Math.max(0, Number(turn.timeOps.hoursPassed));
  return Number(table?.triggerRules?.onNarrativeTime?.minHoursPerBeat) || 0;
}
export function rollNarrativeTime(hoursPassed, location, table, rng = Math.random, mult = 1) {
  return rng() < narrativeTimeChance(hoursPassed, location, table, mult);
}

/** Classify what a GM turn's elapsed fiction was — a rest, a journey, or just time passing —
 *  from intent tags + the timeOps `why`. Drives which trigger model applies. Pure. */
export function classifyNarrativeKind({ intentTags = [], why = "", hoursPassed = 0 } = {}) {
  const tags = (intentTags || []).map(t => String(t).toLowerCase());
  const w = String(why || "").toLowerCase();
  if (tags.some(t => /rest|sleep|camp/.test(t)) || /sleep|slept|camp|rest|the night|bed down|made camp/.test(w)) return "rest";
  if (tags.some(t => /travel|journey|road|trek|march/.test(t)) || /road|journey|travel|trek|march|walk|rode|a day.*(?:road|country)|on foot/.test(w)) return "travel";
  return (Number(hoursPassed) || 0) > 0 ? "time" : "none";
}

/** Choose one encounter for this location. If a flavor is forced (dev trigger),
 *  restrict to it; ignoreDanger lets a dev fire a fight anywhere for testing. */
export function pickEncounter(table, location, rng = Math.random, { flavor = null, ignoreDanger = false } = {}) {
  let pool = (table?.encounters || []).filter(e => isEligible(e, location, { ignoreDanger }));
  if (flavor) pool = pool.filter(e => e.flavor === flavor);
  if (!pool.length) return null;
  const danger = dangerOf(location);
  const weights = pool.map(e => Math.max(0.01, (e.weight || 1) * (flavor ? 1 : flavorMultiplier(e.flavor, danger))));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// ---------- routing: synthesize typed defs for the encounters engine ----------

function titleFromFlavor(entry) {
  const map = {
    fight: "A Hostile Meeting", chase: "The Chase", dangerous: "Hard Ground",
    theft: "Light Fingers", beautiful: "A Grace on the Road", benign: "A Moment on the Road", beneficial: "A Gift of the Country"
  };
  return entry.name || map[entry.flavor] || "An Encounter";
}

/** Build a duel def from a table entry's light opponent block (threat + fractional
 *  yieldAt) into the full encounters.js duel schema. Never lethal — avoidable. */
export function synthesizeDuelDef(entry) {
  const o = entry.opponent || {};
  const threat = Math.max(10, Math.min(70, o.threat | 0 || 40));
  const health = Math.max(3, Math.min(8, 3 + Math.round(threat / 15)));
  const yieldAt = Math.max(0, Math.min(health - 1, Math.round(health * (o.yieldAt || 0.2))));
  return {
    schemaVersion: 1, id: "re-" + entry.id, type: "duel", name: titleFromFlavor(entry),
    setup: entry.seed, lethal: false, avoidable: true, fromRandom: true, flavor: entry.flavor,
    // SNG-138: a prestige-challenge entry carries these so the resolved duel can feed renown (harmless when absent)
    _challengeBand: entry._challengeBand || undefined, _challenger: entry._challenger || undefined,
    opponent: {
      name: o.name || "the aggressor", health, threat, yieldAt,
      fleeDifficulty: Math.max(0, Math.min(30, o.fleeDifficulty | 0 || 15)),
      spectrum: o.spectrum || { violence_peace: -0.3, chaos_order: -0.3 },
      tacticTags: (o.tacticTags || ["press-in", "circle", "feint"]).slice(0, 4),
      notes: "Fights for gain or ground, not to kill — yields when badly hurt, honors a yield."
    },
    stakes: "Losing means waking bruised and lighter, not dead. Victory or a clean break keeps everything."
  };
}

const STAGE_NAMES = {
  chase: ["Read the ground and pick a line", "A burst through the broken country", "Close it out — catch or shake free"],
  dangerous: ["Read the hazard", "Commit to the crossing", "Clear the last of it"],
  default: ["First push", "The hard middle", "The far side"]
};

/** Build a staged challenge def (chase / hazard) from an entry's stage count. */
export function synthesizeChallengeDef(entry) {
  const n = Math.max(2, Math.min(4, entry.stages | 0 || 2));
  const names = STAGE_NAMES[entry.flavor] || STAGE_NAMES.default;
  const subByFlavor = entry.flavor === "chase" ? ["agility", "agility", "wits"] : ["insight", "agility", "strength"];
  const stages = Array.from({ length: n }, (_, i) => ({
    name: names[Math.min(i, names.length - 1)],
    attribute: entry.flavor === "chase" ? "physical" : (i === 0 ? "mental" : "physical"),
    subAttribute: subByFlavor[Math.min(i, subByFlavor.length - 1)],
    axes: {}, difficulty: 5 + i * 5,
    failureCost: { health: entry.flavor === "chase" ? 2 : 3, energy: 4, hours: entry.flavor === "chase" ? 0 : 1 }
  }));
  return {
    schemaVersion: 1, id: "re-" + entry.id, type: "challenge", name: titleFromFlavor(entry),
    setup: entry.seed, fromRandom: true, flavor: entry.flavor, stages
  };
}

// ---------- the offer the app dispatches ----------

/** Given a chosen entry, produce a dispatch object for the app:
 *  - narrative / opposed → { routing, prompt } (runs through the GM scene + resolve.js)
 *  - challenge / duel     → { routing, def, narration, choices } (engine-built OFFER with
 *    a guaranteed decline path BEFORE engagement, plus any peaceful-out the player owns).
 */
export function buildOffer(entry, character, catalog = {}, rules = {}) {
  const owns = id => (character?.abilities || []).some(a => a.abilityId === id);
  if (entry.routing === "narrative" || entry.routing === "opposed") {
    let prompt = `(A ${entry.flavor} encounter arises: ${entry.seed}`;
    if (entry.routing === "opposed" && entry.check) {
      const skills = (entry.check.anyOf || []).join(" or ");
      prompt += ` Present it and offer a single skill check (${skills}, difficulty ~${entry.check.difficulty}) as a choice — success and failure both lead somewhere.`;
    }
    if (entry.avoidable) prompt += " Always offer a way through that isn't blood — pay, talk it down, or slip past.";
    if (entry.loreTier === "precursor-glimpse") prompt += " This touches the Precursor — glimpsed, never explained.";
    prompt += ")";
    return { routing: entry.routing, flavor: entry.flavor, prompt, avoidable: true };
  }

  // challenge / duel — build the def and a deterministic offer beat
  const def = entry.routing === "duel" ? synthesizeDuelDef(entry) : synthesizeChallengeDef(entry);
  const engageLabel = entry.routing === "duel"
    ? "Stand and meet it"
    : (entry.flavor === "chase" ? "Commit to the chase" : "Take the crossing on");
  const choices = [
    { label: engageLabel, encounterId: def.id, attribute: "physical", subAttribute: def.type === "duel" ? "strength" : "agility", axes: {}, difficulty: 0, intentTags: ["risky", "commit"] },
    { label: entry.routing === "duel" ? "Back away — refuse the fight" : "Turn back — find another way", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["careful", "retreat"], trivial: true }
  ];
  // peaceful out: an owned ability can END the encounter instead of engaging it
  const peaceful = entry.peacefulOut;
  if (peaceful && owns(peaceful)) {
    const ab = catalog[peaceful];
    choices.splice(1, 0, {
      label: `Try to ${ab?.name || peaceful} — turn it aside`, abilityId: peaceful,
      attribute: "social", subAttribute: "presence", axes: ab?.axes || {}, difficulty: 5,
      intentTags: ["parley", "careful"], noveltyHint: "resolve without a fight"
    });
  }
  // mediator's out for a fight the player can talk down
  if (entry.flavor === "fight" && owns("mediators_tongue")) {
    choices.splice(1, 0, {
      label: "Try to talk it down (Mediator's Tongue)", abilityId: "mediators_tongue",
      attribute: "social", subAttribute: "rapport", axes: {}, difficulty: 10,
      intentTags: ["parley", "careful"], noveltyHint: "defuse before it starts"
    });
  }
  return { routing: entry.routing, flavor: entry.flavor, def, narration: entry.seed, choices, avoidable: true };
}

/** True if this entry can incapacitate — used to assert the avoid-path guarantee. */
export function canIncapacitate(entry) {
  return entry.routing === "duel" || (entry.routing === "challenge" && entry.flavor !== "chase") || entry.flavor === "fight" || entry.flavor === "dangerous";
}
