// random_encounters.js — SNG-014. The valley is alive: on travel / rest / entering
// a place / world-tick, the engine MAY roll one flavored encounter, weighted by the
// location's dangerLevel + tags. Tonal spectrum (beneficial…fight), never grim.
//
// Design law 1 holds absolutely: this module DECIDES *whether* and *which*, and
// synthesizes typed encounter defs for the existing encounters engine to run. It
// never rolls resolution and never advances state — routing reuses resolve.js /
// encounters.js unchanged. Any lethal-capable encounter is OFFERED with a decline
// path built HERE (SNG-002b), not left to the model.

import { sampleThreat, isRelevantThreat } from "./threat.js"; // SNG-249: the player power the pool revolves around
import { smartClamp } from "./namematch.js"; // SNG-229: word-boundary clamp for a synthesized creature's seed prose

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

// SNG-229 §2b: tier → the danger gate + the opponent's threat + how often it turns up. A riffraff is a common
// low-danger nuisance; an epic is a rare, deadly, danger-4 thing. Tunable-shaped (a plain table).
const BEAST_TIER = {
  riffraff: { minDanger: 1, threat: 22, weight: 3 },
  notable:  { minDanger: 2, threat: 38, weight: 2 },
  regional: { minDanger: 3, threat: 55, weight: 1 },
  epic:     { minDanger: 4, threat: 78, weight: 1 }
};

/** SNG-229 §2b: turn each bestiary creature into a danger-gated ENCOUNTER entry — the generative hook that
 *  gives the fight/dangerous pool an actual SOURCE of monsters (it had none; ties SNG-225). Tier sets the
 *  danger gate + the opponent's threat; region-free (SNG-225 §4c) so a creature turns up anywhere its danger
 *  admits; offered as a DUEL with a decline/flee path (SNG-002b — a hazard is a CHOICE to fight, not a trap).
 *  The creature's look/danger/pressures ride on the entry so the GM narrates it and the player knows which
 *  crafts answer it. A hazard, not a villain (the bestiary design law). Pure. */
export function bestiaryEncounters(bestiary = {}) {
  const roster = Array.isArray(bestiary.roster) ? bestiary.roster : [];
  return roster.filter(c => c && c.id).map(c => {
    const t = BEAST_TIER[c.tier] || BEAST_TIER.notable;
    return {
      id: `beast_${c.id}`, flavor: "dangerous", weight: t.weight, minDanger: t.minDanger,
      regions: ["*"], tags: [], routing: "duel", avoidable: true,
      opponent: { threat: t.threat, yieldAt: 0.25 },
      creatureId: c.id, creatureClass: c.class || null, tier: c.tier || null, pressures: c.pressures || [],
      seed: smartClamp(`${c.name || c.id} — ${c.look || ""}${c.danger ? " " + c.danger : ""}`.trim(), 400)
    };
  });
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
/** SNG-231 §3: the OFFERABLE eligible pool for a location — the SAME danger+tag gate pickEncounter rolls
 *  against, but the FULL list, so the GM-offered path (listAvailableEncounters) can surface real pool ids to
 *  INVITE, not just the hand-authored encounterSeeds. Only STRUCTURED entries (routing duel/challenge — which
 *  synthesize a real def, incl. the SNG-229 beast_ duels) are offerable by id; loose narrative/opposed rows have
 *  no def to start, so they stay ambient narration (not offered). Weight-ordered + capped so the prompt isn't
 *  flooded. Pure. */
export function eligibleEncountersFor(table, location, { cap = 8, power = null, rng = Math.random, threatCfg = {} } = {}) {
  const danger = dangerOf(location);
  // SNG-249 (Erik): "your level sets the mean about which the encounters revolve." When the caller knows the
  // player's power, the pool is drawn AROUND it: a target threat is sampled (a body plus a real upper tail), foes
  // you have outgrown are RETIRED unless something makes them special, and what is left is ordered by how near it
  // sits to the draw. Absent `power` this is the old danger-weighted pool, unchanged — so every existing caller
  // keeps working, and the REGION supplies the cast either way. That is the whole model in one function.
  const draw = Number.isFinite(power) ? sampleThreat(power, rng, threatCfg) : null;
  if (draw) {
    const threatOf = e => Number(e.opponent?.threat ?? e.threat) || 0;
    const near = (table?.encounters || [])
      .filter(e => (e.routing === "duel" || e.routing === "challenge" || e.routing === "opposed") && isEligible(e, location))
      // "a boar at lvl 20 isn't really an encounter anymore, unless it's a special encounter"
      .filter(e => !threatOf(e) || isRelevantThreat(power, threatOf(e), { special: !!e.special, cfg: threatCfg }))
      .map(e => ({ e, d: Math.abs(threatOf(e) - draw.threat) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, Math.max(0, cap))
      .map(x => x.e);
    // A thin local cast can leave nothing near the draw — fall through to the danger-weighted pool rather than
    // handing back an empty list, so a quiet region still offers its own beasts.
    if (near.length) return near;
  }
  return (table?.encounters || [])
    // SNG-247: "opposed" is a real routing (the toll-keeper) and mints a standoff — without it here the one
    // exemplar Aevi routed that way could never be offered, which is how it stayed invisible.
    .filter(e => (e.routing === "duel" || e.routing === "challenge" || e.routing === "opposed") && isEligible(e, location))
    .map(e => ({ e, w: Math.max(0.01, (e.weight || 1) * flavorMultiplier(e.flavor, danger)) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, Math.max(0, cap))
    .map(x => x.e);
}

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

/** SNG-247: a readable name from an authored encounter id — `enc_the_stopped_mechanism` -> "The Stopped
 *  Mechanism". Used where the FLAVOR title would be wrong (a puzzle's flavor is "dangerous", which the flavor map
 *  turns into "Hard Ground"), and so each authored encounter carries its own name rather than a shared kind label. */
function nameFromId(id) {
  const core = String(id || "").replace(/^(enc_|re-)/, "").replace(/[_-]+/g, " ").trim();
  if (!core) return null;
  return core.split(" ").map((w, i) => (i && ["the", "of", "a", "an", "and"].includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

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
    // CCODE-23: carry the CREATURE's tier/minDanger so the SNG-230 finisher/collapse is judged by the FOE, not
    // the location — encounterFrame collapseFloor/frameCollapsible/frameSize read def.tier/minDanger. Without
    // this a riffraff pest at a danger-4 frontier read "too great to end in one stroke," and Aevi's tier-keyed
    // collapseEligibility applied to no random/bestiary duel. Undefined when the entry has none (unchanged).
    ...(entry.tier != null ? { tier: entry.tier } : {}), ...(entry.minDanger != null ? { minDanger: entry.minDanger } : {}),
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

/** SNG-247 Tier 2a: a STANDOFF def. The kind existed in FRAME_KINDS, `encounterKind` mapped it, and Aevi authored
 *  both an exemplar (`enc_the_toll_keeper`) and a per-kind receipt format — and NOTHING EVER MINTED ONE. A
 *  `routing:"opposed"` entry fell through to synthesizeChallengeDef and read as "hard ground": a contest of wills
 *  rendered as terrain. It is structurally a DUEL (two wills, two rolls, a meter between them); only what is being
 *  contested differs, which is what `flavor` now names. The engine's exit rule (sb.kinds.standoff) makes the
 *  costs composure rather than blood — a standoff cannot hurt you; pressing one until it draws is a MORPH into a
 *  fight, which is a different mechanic. Pure. */
export function synthesizeStandoffDef(entry) {
  const base = synthesizeDuelDef(entry);
  const who = entry.opponent?.name || "the one standing in your way";
  return {
    ...base,
    flavor: "standoff",
    name: entry.name || nameFromId(entry.id) || "The Standoff",
    lethal: false,
    opponent: {
      ...base.opponent, name: who,
      // their "health" is RESOLVE — how many times their certainty can be pressed before they stand aside
      tacticTags: (entry.opponent?.tacticTags || ["hold-the-line", "name-a-price", "read-you"]).slice(0, 4),
      notes: "Contests by will, not by blade — wants something from you and is certain of the right to it. Yields the point when their certainty cracks.",
    },
    stakes: "Losing costs you the point — you pay, you turn back, or it becomes a fight on their terms. It does not cost you blood.",
  };
}

/** SNG-247 promotion: the frame-kind EXEMPLARS as encounter-pool entries.
 *
 *  `exemplarEncounters` had been authored since SNG-230 and read by NOTHING — loadContent takes `frameKinds` off
 *  that doc and drops the exemplars on the floor, so the sealed door and the toll-keeper have never been reachable
 *  in play. Aevi's 2026-07-31 library took it from 2 to 8, all equally unreachable. Moving the file into
 *  content/packs/ alone would have changed nothing; the promotion is the file AND the path.
 *
 *  Same shape and same merge point as `bestiaryEncounters` (SNG-229) — one precedent, not a second mechanism.
 *  `minDanger` comes from the authored tier so a regional puzzle doesn't surface on a quiet road. Pure. */
export function frameExemplarEncounters(doc) {
  const tierDanger = { riffraff: 0, notable: 1, regional: 2, epic: 3 };
  return (doc?.exemplarEncounters || []).map(e => ({
    id: e.id,
    // `kind` is what routes it (buildOffer reads kind first) — carried through verbatim so a standoff stays a
    // standoff and a puzzle stays a puzzle rather than falling to the challenge default.
    kind: e.kind || null,
    routing: e.routing || "challenge",
    flavor: e.flavor || "dangerous",
    seed: e.seed, name: e.name || null,
    ...(e.tier != null ? { tier: e.tier } : {}),
    minDanger: Number.isFinite(e.minDanger) ? e.minDanger : (tierDanger[e.tier] ?? 1),
    weight: e.weight ?? 1,
    stages: e.stages || [], premise: e.premise || null, failStakes: e.failStakes || null,
    ...(e.opponent ? { opponent: e.opponent } : {}),
    ...(e.hintTiers ? { hintTiers: e.hintTiers } : {}),
    fromFrameExemplar: true,
  }));
}

/** SNG-247 Tier 3: a PUZZLE def from a table entry. Aevi's puzzle exemplars carry `kind:"puzzle"` with
 *  `routing:"challenge"` (2026-07-31: four of them), which fell through to synthesizeChallengeDef and rendered as
 *  HARD GROUND — the same gap the toll-keeper had, with four real encounters behind it. Its other side is a STATIC
 *  antagonist (contestSheetFor supplies the sheet), so it runs the contest engine with the SENSE step carrying the
 *  weight. Her stage BEATS become the hint ladder: a beat is exactly "what you'd understand at this layer", so the
 *  authored understanding survives without her having to write hintTiers twice. Pure. */
export function synthesizePuzzleDef(entry) {
  const tierResist = { riffraff: 8, notable: 18, regional: 30, epic: 42 };
  return {
    // NOT titleFromFlavor: Aevi's puzzles carry flavor "dangerous", which that map turns into "Hard Ground" — so a
    // sealed precursor mechanism rendered under a hazard's name (caught by clicking the dev button, 2026-08-01).
    // The authored ID is the best name available and gives each puzzle its OWN, rather than four "Sealed Thing"s.
    schemaVersion: 1, id: "re-" + entry.id, type: "puzzle", name: entry.name || nameFromId(entry.id) || "The Sealed Thing",
    setup: entry.seed, lethal: false, avoidable: true, fromRandom: true,
    ...(entry.tier != null ? { tier: entry.tier } : {}), ...(entry.minDanger != null ? { minDanger: entry.minDanger } : {}),
    resist: Number.isFinite(entry.resist) ? entry.resist : (tierResist[entry.tier] ?? 18),
    holdName: entry.holdName || "it holds its order",
    // SNG-250: the craft chip rendered "ward tnotable" because `tier` here is the BESTIARY tier (a word:
    // riffraff/notable/regional/epic) while the sheet wants a NUMBER. Carry a numeric craft tier separately
    // rather than overloading one field with two vocabularies.
    holdTier: { riffraff: 1, notable: 2, regional: 3, epic: 4 }[entry.tier] || 2,
    hintTiers: entry.hintTiers?.length ? entry.hintTiers : (entry.stages || []).map(s => s.beat).filter(Boolean),
    codexUnlocks: entry.codexUnlocks || [],
    ...(entry.premise ? { premise: entry.premise } : {}), ...(entry.wards ? { wards: entry.wards } : {}),
    stakes: entry.failStakes || "It stays sealed — and what it guards notices you tried.",
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
export function buildOffer(entry, character, catalog = {}, rules = {}, opts = {}) {
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
  // SNG-247 Tier 2a: an OPPOSED entry (or one Aevi tagged kind:"standoff") mints a STANDOFF, not a staged
  // challenge. Routing it to synthesizeChallengeDef was why the toll-keeper read as terrain.
  const isStandoff = entry.kind === "standoff" || entry.routing === "opposed";
  // SNG-247 Tier 3: and a PUZZLE entry mints a puzzle. Aevi's puzzle exemplars carry kind:"puzzle" with
  // routing:"challenge", so without this they read as hard ground — a sealed precursor mechanism shown as terrain.
  const isPuzzle = !isStandoff && entry.kind === "puzzle";
  const def = isStandoff ? synthesizeStandoffDef(entry)
    : isPuzzle ? synthesizePuzzleDef(entry)
    : entry.routing === "duel" ? synthesizeDuelDef(entry) : synthesizeChallengeDef(entry);
  // SNG-246 (Erik: "I'm the one moving forward to attack — the button shouldn't say 'stand and meet it'"): the
  // engage label reads as an ACTION and names the foe, and swings to the aggressor's voice when the PLAYER is the
  // one closing in (opts.aggressor). The old flat defensive "Stand and meet it" only fit the it-comes-to-you case.
  const foeName = def?.opponent?.name || "them";
  // SNG-247 Tier 2a: a standoff engages by WILL, so neither its verb nor its roll is physical — a contest of who
  // yields first is pressed with presence, and refusing it is paying rather than fleeing.
  const engageLabel = isStandoff
    ? `🗣 Face ${foeName} down — hold your ground`
    : isPuzzle ? "🧩 Work it — read what it is"
    : entry.routing === "duel"
    ? (opts.aggressor ? `⚔ Press the attack on ${foeName}` : `⚔ Meet ${foeName} — take the fight`)
    : (entry.flavor === "chase" ? "Commit to the chase" : "Take the crossing on");
  const choices = [
    { label: engageLabel, encounterId: def.id,
      attribute: isStandoff ? "social" : isPuzzle ? "mental" : "physical",
      subAttribute: isStandoff ? "presence" : isPuzzle ? "insight" : def.type === "duel" ? "strength" : "agility",
      axes: {}, difficulty: 0, intentTags: ["risky", "commit"] },
    { label: isStandoff ? "Give them what they want — pay the price and move on"
      : isPuzzle ? "Leave it sealed — it has kept this long"
      : entry.routing === "duel" ? "Back away — refuse the fight" : "Turn back — find another way",
      attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["careful", "retreat"], trivial: true }
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
