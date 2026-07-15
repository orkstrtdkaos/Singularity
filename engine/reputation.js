// reputation.js — deeds are the source of truth; reputation is a VIEW over deeds.
// A community's opinion of you = sum of the deeds it knows about. News spread
// between communities is the world-tick's job (v0.3); the deed schema already
// carries `spread` so nothing here changes when that lands.

/** Record a deed on the character (append-only). Returns the deed as stored. */
export function recordDeed(character, deed, aptitudeMods = {}) {
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
  character.deeds = character.deeds || [];
  character.deeds.push(d);
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
