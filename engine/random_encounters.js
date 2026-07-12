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

/** A location's danger, clamped 0..4 (undefined → 0: the quiet places). */
export function dangerOf(location) {
  return Math.max(0, Math.min(4, location?.dangerLevel | 0));
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

/** Does this encounter entry fit the location? minDanger gate + region + tag match. */
export function isEligible(entry, location, { ignoreDanger = false } = {}) {
  if (!ignoreDanger && (entry.minDanger || 0) > dangerOf(location)) return false;
  const regions = entry.regions || ["*"];
  if (!regions.includes("*")) {
    const locRegion = location?.regionId || location?.id || "";
    const locCommunity = location?.communityId || "";
    if (!regions.some(r => locRegion.includes(r) || locCommunity.includes(r) || (location?.id || "").includes(r))) return false;
  }
  // entry.tags, when present, are a *preference* not a hard gate unless it also
  // named regions — a cutpurse wants a crowd. Soft-match: if tags listed and NONE
  // overlap the location's tags, it's ineligible ONLY for tag-anchored flavors.
  if (entry.tags && entry.tags.length) {
    const locTags = (location?.tags || []).map(t => String(t).toLowerCase());
    const overlap = entry.tags.some(t => locTags.some(lt => lt.includes(t) || t.includes(lt)));
    if (!overlap && !ignoreDanger) return false;
  }
  return true;
}

/** Should a trigger fire at all this moment? Pure; rng injectable. */
export function rollTrigger(trigger, location, table, rng = Math.random) {
  const tr = table?.triggerRules?.[trigger];
  if (!tr) return false;
  if (trigger === "onRest" && isSafeRest(location)) return false;
  // danger nudges the base chance up a little — dangerous roads are eventful roads
  const chance = Math.min(0.9, (tr.chance || 0) * (1 + dangerOf(location) * 0.1));
  return rng() < chance;
}

// ---------- SNG-075: encounters fire in NARRATIVE play, bound to narrative TIME ----------
// The engine already knows how long the fiction took (timeOps.hoursPassed). Narrative time IS
// the encounter window: a quick exchange stays quiet; a half-day's walk is likely eventful.
// Rates default here (a mechanic, not content) but a content pack MAY override via
// triggerRules.onNarrativeTime {ratePerHour, maxChance}.

/** Probability that a stretch of narrative time turns something up. ~ratePerHour × hours,
 *  danger-weighted, clamped. Pure. */
export function narrativeTimeChance(hoursPassed, location, table) {
  const tr = table?.triggerRules?.onNarrativeTime || {};
  const ratePerHour = Number.isFinite(tr.ratePerHour) ? tr.ratePerHour : 0.04; // ~4%/hr (spec)
  const cap = Number.isFinite(tr.maxChance) ? tr.maxChance : 0.6;
  const h = Math.max(0, Number(hoursPassed) || 0);
  const base = Math.min(cap, ratePerHour * h);
  return Math.min(0.9, base * (1 + dangerOf(location) * 0.1));
}
export function rollNarrativeTime(hoursPassed, location, table, rng = Math.random) {
  return rng() < narrativeTimeChance(hoursPassed, location, table);
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
