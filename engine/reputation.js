// reputation.js — deeds are the source of truth; reputation is a VIEW over deeds.
import { renownScore } from "./recurrence.js";   // CCODE-85: the ladder's score, so the two views cannot drift
// A community's opinion of you = sum of the deeds it knows about.
//
// ⚠️ "News spread between communities is the world-tick's job (v0.3); the deed schema already carries
// `spread` so nothing here changes when that lands." — THAT COMMENT SAT HERE WHILE NOTHING EVER LANDED.
// `recordDeed` initialised `spread: []` and no line of code in the repo ever appended to it, so every
// reputation query in the game answered from the ONE community where a deed happened. A field with a reader
// and no writer: the fourth door, wearing a promissory note.
//
// It surfaced from the other end: SNG-279's deed table lists "a deed that SPREAD" as a promotion source
// marked "already exists". It does not, and could not — which is one of six ways up the ladder dark.
// `spreadDeeds` below is that writer.

/** SNG-281 — NEWS TRAVELS, AND BIG NEWS TRAVELS FURTHER.
 *
 *  One hop per pass, outward from where the deed happened. REACH IS SET BY WEIGHT: a weight-1 kindness stays
 *  in the settlement that saw it; a weight-3 deed crosses into neighbouring regions. That is the whole model,
 *  and it is deliberately about SCALE rather than kind — ⛔ DIRECTIVE SNG-280: a deed does not travel further
 *  for being admirable. A massacre and a rescue of the same magnitude are heard about equally far.
 *
 *  Pure: takes the community graph and an rng, mutates only the deeds it is given, returns the hops made so a
 *  caller can credit them.
 */
export function spreadDeeds(bearer, { communitiesByRegion = {}, regionOfCommunity = {}, rng = Math.random, rate = 0.35, maxAgeDays = null, worldDay = null } = {}) {
  const deeds = bearer?.deeds;
  if (!Array.isArray(deeds) || !deeds.length) return [];
  const hops = [];
  for (const d of deeds) {
    if (!d?.communityId) continue;
    d.spread = Array.isArray(d.spread) ? d.spread : [];
    // How far this deed can ever get. Magnitude, not merit.
    const reach = Math.min(3, Math.max(1, Math.abs(Number(d.weight) || 1)));
    const capBy = { 1: 2, 2: 5, 3: 12 }[reach];
    if (d.spread.length >= capBy) continue;
    if (rng() >= rate) continue;
    const home = regionOfCommunity[d.communityId] || null;
    const near = (communitiesByRegion[home] || []).filter(c => c !== d.communityId && !d.spread.includes(c));
    // A deed only leaves its region once it has been heard everywhere near, and only if it is big enough.
    const far = reach >= 3 && !near.length
      ? Object.entries(communitiesByRegion).filter(([r]) => r !== home).flatMap(([, cs]) => cs).filter(c => !d.spread.includes(c))
      : [];
    const pool = near.length ? near : far;
    if (!pool.length) continue;
    const to = pool[Math.floor(rng() * pool.length)];
    d.spread.push(to);
    hops.push({ to, weight: d.weight, description: d.description });
  }
  return hops;
}
/** Record a deed on a BEARER (append-only). Returns the deed as stored.
 *
 *  CCODE-85 (Erik: "NPCs should have deeds too"). Nothing in this module was ever character-SPECIFIC — every
 *  function here reads only `X.deeds`, so it has always been able to carry an NPC's record. What did not exist
 *  was any CALLER that passed one, and any READER that surfaced it. That is the same shape as the bestiary gap:
 *  a mechanism that works, pointed at exactly one kind of thing.
 *
 *  Aevi's arena finding is what this is for: an epic stops being a threat number and becomes a person with a
 *  record you have been hearing about for twenty sessions. The parameter is named `bearer` now because that is
 *  what it always was. */
export function recordDeed(bearer, deed, aptitudeMods = {}) {
  const d = {
    at: new Date().toISOString(),
    locationId: deed.locationId ?? null,
    communityId: deed.communityId ?? null,
    description: deed.description,
    tags: deed.tags || [],
    weight: Math.max(-3, Math.min(3, deed.weight | 0)),
    spread: []
  };
  // Good Samaritan aptitude: kindnesses are remembered a little harder
  if (d.weight > 0 && aptitudeMods.reputationGainBonus) {
    d._bonusApplied = aptitudeMods.reputationGainBonus;
  }
  bearer.deeds = bearer.deeds || [];
  bearer.deeds.push(d);
  return d;
}

/** Compute standing with one community from the deeds it knows about. */
export function standingWith(character, communityId, rules) {
  let score = 0;
  for (const d of character.deeds || []) {
    const knows = d.communityId === communityId || (d.spread || []).includes(communityId);
    if (!knows) continue;
    let w = d.weight * 5;
    if (d._bonusApplied && d.weight > 0) w *= 1 + d._bonusApplied;
    score += w;
  }
  score = Math.round(score);
  let band = "neutral";
  for (const b of rules.reputationBands) { if (score >= b.min) { band = b.band; break; } }
  return { score, band };
}

/** SNG-100b: standing with a PEOPLE (a tradition/pole), distinct from settlement reputation. Source is
 *  `character.peopleDisposition[traditionId]` — durable per-tradition integers accrued from quest work
 *  with that people (quests.js). Banded against `rules.peopleStandingBands` (a smaller scale than the
 *  settlement `reputationBands` — these deltas are ±1/±2, not ±5/deed). Fixed contract `{score, band}`
 *  so SNG-101/102 read one shape regardless of the source. 0 / lowest band for an unknown people. */
export function standingWithPeople(character, traditionId, rules) {
  const score = Math.round(character?.peopleDisposition?.[traditionId] || 0);
  const bands = rules?.peopleStandingBands || [{ min: 0, band: "neutral" }];
  let band = bands[bands.length - 1].band;
  for (const b of bands) { if (score >= b.min) { band = b.band; break; } }
  return { score, band };
}

/** Dominant deed tags a community associates with this character (for NPC reactions). */
export function knownTags(character, communityId, limit = 4) {
  const counts = {};
  for (const d of character.deeds || []) {
    const knows = d.communityId === communityId || (d.spread || []).includes(communityId);
    if (!knows) continue;
    for (const t of d.tags || []) counts[t] = (counts[t] || 0) + Math.abs(d.weight);
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

/** One-paragraph reputation summary for the GM prompt: how THIS place sees you. */
export function reputationSummary(character, communityId, rules) {
  if (!communityId) return "No community claims this place; you are judged only by what people see right now.";
  const { score, band } = standingWith(character, communityId, rules);
  const tags = knownTags(character, communityId);
  if (band === "neutral" && tags.length === 0) return "The people here don't know you yet.";
  const tagText = tags.length ? ` They know of: ${tags.join(", ")}.` : "";
  return `Local standing: ${band} (${score}).${tagText}`;
}

/** CCODE-85 — WHAT THIS PERSON IS KNOWN FOR, from their own deeds.
 *
 *  `standingWith` answers "how does this community feel about the bearer"; this answers a different question
 *  the arena needs — "what has this person DONE, and is any of it famous enough to have reached me?" Renown is
 *  the weight of their deeds that SPREAD beyond where they happened: a brawl nobody talks about is not renown,
 *  which is why `spread` (already on the schema since v0.3) is the thing measured rather than raw weight.
 *
 *  Returns null for someone with no record, so a nobody stays a nobody rather than getting a "renown: 0" line
 *  that reads like a stat block. */
export function renownOf(bearer, rules) {
  const deeds = (bearer?.deeds || []).filter(d => d && d.description);
  if (!deeds.length) return null;
  // ONE SCORE, TWO VIEWS. `renownScore` already existed in recurrence.js, where it drives the challenger
  // ladder, and it is bearer-agnostic in exactly the same way this module always was. The first draft of this
  // function re-derived its own sum — a second number also called renown, free to drift from the one the
  // ladder uses, which is how a person ends up "renowned" to the narrator and unranked to the arena.
  // So the SCORE is imported, and what this function adds is the separate question it was written for: REACH,
  // how far the stories travelled, which is a different thing from how much was done.
  const score = renownScore(bearer);
  let reach = 0;
  for (const d of deeds) reach += (Number(d.weight) || 0) * (1 + (d.spread || []).length);
  const bands = rules?.renownBands || rules?.reputationBands || [];
  let band = "unknown";
  // the BAND is read off REACH, not the raw score: fame is what TRAVELLED, not what was done.
  for (const b of bands) { if (reach >= b.min) { band = b.band; break; } }
  const notable = deeds.slice().sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, 3);
  const tags = {};
  for (const d of deeds) for (const t of (d.tags || [])) tags[t] = (tags[t] || 0) + Math.abs(Number(d.weight) || 0);
  return { score: Math.round(score), reach: Math.round(reach), band, deeds: deeds.length,
    knownFor: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t),
    notable: notable.map(d => d.description) };
}

/** CCODE-85 — the one line the narrator needs: has this person's record reached where we are standing?
 *  A deed only counts as HEARD here if it happened here or spread here — the same knows-about test standing
 *  already uses, so a legend is local until the world tick carries it, and reputation cannot outrun news. */
export function renownHeardAt(bearer, communityId, rules) {
  const r = renownOf(bearer, rules);
  if (!r) return null;
  const heard = (bearer.deeds || []).filter(d => d.communityId === communityId || (d.spread || []).includes(communityId));
  if (!heard.length) return { ...r, heardHere: false, here: 0 };
  return { ...r, heardHere: true, here: heard.length,
    localNotable: heard.slice().sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, 2).map(d => d.description) };
}
