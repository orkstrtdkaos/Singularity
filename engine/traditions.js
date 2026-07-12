// traditions.js — SNG-055/059: THE GREAT CIRCLE domain-access model. All geometry (the 24-station
// ring, neighbours, antipodes, distances) is READ from content/packs/core/rules/traditions.json —
// NEVER hardcoded here. Pure + headless-testable: build an index once, then ask it questions.
//
// The model (traditions.json → domainAccessModel), by ring distance steps = min(|i-j|, 24-|i-j|):
//   0  primary   — full access, all tiers, no penalty
//   1  adjacent to primary — free (no penalty) EXCEPT capstones (tier IV–V): near a people ≠ of it
//      secondary (chosen) — up to tier III
//      tertiary (chosen, must be a ring-neighbour of secondary) — up to tier II
//   1+ adjacent to a chosen (secondary/tertiary) or 2+ steps away — allowed, SKILL-POINT PENALTY
//   12 antipode of primary or secondary — CLOSED (you can't hold both ends of your own axis)
//   folk traditions — OPEN to anyone in the Valley (the near-centre holds a little of everything)
// Braids/artifacts are the only sanctioned crossings (handled as combinations elsewhere).

/** Build the query index from the loaded traditions.json. Reads the ring from `theGreatCircle`
 *  + per-tradition `ring`/`distances`/`opposite`, and the ability→tradition reverse map from each
 *  tradition's `abilities` list. Folk traditions are marked OPEN. */
export function buildTraditionIndex(file = {}) {
  const traditions = file.traditions || [];
  const folk = file.folkTraditions || [];
  const stations = file.theGreatCircle?.stations || [];
  const byId = {};
  const ringPos = {};
  const distances = {};
  const abilityToTradition = {};
  const folkIds = new Set(folk.map(f => f.traditionId));
  for (const s of stations) if (s.traditionId != null && Number.isFinite(s.position)) ringPos[s.traditionId] = s.position;
  for (const t of traditions) {
    byId[t.traditionId] = t;
    if (t.ring && Number.isFinite(t.ring.position)) ringPos[t.traditionId] = t.ring.position;
    if (t.distances) distances[t.traditionId] = t.distances;
    for (const ab of t.abilities || []) abilityToTradition[ab] = t.traditionId;
  }
  for (const f of folk) { byId[f.traditionId] = f; for (const ab of f.abilities || []) abilityToTradition[ab] = f.traditionId; }
  return { byId, ringPos, distances, abilityToTradition, folkIds, size: stations.length || 24, model: file.domainAccessModel || {}, stations };
}

/** The tradition an ability belongs to: its own `tradition` field wins; else the reverse map. */
export function traditionOf(ability, index) {
  return ability?.tradition || index?.abilityToTradition?.[ability?.id] || null;
}

export function isFolkTradition(traditionId, index) { return !!index?.folkIds?.has(traditionId); }

/** Ring distance in steps: `min(|i-j|, size-|i-j|)`. Prefers the authored per-tradition `distances`
 *  table, falls back to the ring positions. Unknown → null. */
export function ringDistance(a, b, index) {
  if (!a || !b) return null;
  if (a === b) return 0;
  const tbl = index?.distances?.[a];
  if (tbl && tbl[b] != null) return tbl[b];
  const pa = index?.ringPos?.[a], pb = index?.ringPos?.[b];
  if (pa == null || pb == null) return null;
  const d = Math.abs(pa - pb), size = index.size || 24;
  return Math.min(d, size - d);
}

/** The antipode (axis-opposite) of a tradition. */
export function antipodeOf(traditionId, index) {
  const t = index?.byId?.[traditionId];
  return t?.opposite || t?.ring?.antipode || null;
}

/** The ring-neighbours (steps === 1) of a tradition — used to constrain the tertiary pick. */
export function neighborsOf(traditionId, index) {
  const t = index?.byId?.[traditionId];
  if (t?.ring?.neighbors) return t.ring.neighbors;
  if (Array.isArray(t?.adjacent)) return t.adjacent.filter(a => a.steps === 1).map(a => a.traditionId);
  return [];
}

/** All non-folk tradition ids in ring order (for the great-circle picker). */
export function ringOrder(index) {
  return (index?.stations || []).slice().sort((a, b) => a.position - b.position).map(s => s.traditionId);
}

const CAPSTONE_TIER = 4; // tier IV–V are the single-mastery capstones

/** The access verdict for an ability of numeric tier T (1–5) given the character's chosen domains.
 *  Returns { allowed, penalty (skill-point multiplier), band, reason }. Pure. */
export function domainAccess(ability, tier, domains, index) {
  const trad = traditionOf(ability, index);
  const T = Math.max(1, Math.min(5, Number(tier) || 1));
  if (!trad || !index) return { allowed: true, penalty: 1, band: "open", reason: "ungoverned" };
  if (isFolkTradition(trad, index)) return { allowed: true, penalty: 1, band: "folk", reason: "folk tradition — open in the Valley" };
  const primary = domains?.primary, secondary = domains?.secondary, tertiary = domains?.tertiary;
  if (!primary) return { allowed: true, penalty: 1, band: "open", reason: "no domain chosen yet" }; // pre-domain / legacy

  // CLOSED — the antipode of a pole you've chosen an end of
  if (trad === antipodeOf(primary, index)) return { allowed: false, penalty: 1, band: "closed", reason: "closed — the far pole of your primary axis" };
  if (secondary && trad === antipodeOf(secondary, index)) return { allowed: false, penalty: 1, band: "closed", reason: "closed — the far pole of your secondary axis" };

  if (trad === primary) return { allowed: true, penalty: 1, band: "primary", reason: "your primary domain — all tiers" };
  if (trad === secondary) return T <= 3
    ? { allowed: true, penalty: 1, band: "secondary", reason: "secondary domain — to tier III" }
    : { allowed: false, penalty: 1, band: "secondary", reason: "your secondary tops out at tier III" };
  if (trad === tertiary) return T <= 2
    ? { allowed: true, penalty: 1, band: "tertiary", reason: "tertiary domain — to tier II" }
    : { allowed: false, penalty: 1, band: "tertiary", reason: "your tertiary tops out at tier II" };

  // adjacent to primary (kin): free, but not the capstones
  if (ringDistance(trad, primary, index) === 1) return T < CAPSTONE_TIER
    ? { allowed: true, penalty: 1, band: "adjacent", reason: "kin to your primary — free, no capstones" }
    : { allowed: false, penalty: 1, band: "adjacent", reason: "near a people is not being of them — no capstones" };

  // anything else reachable costs more (the existing cross-class penalty), scaling a little with distance
  const chosen = [primary, secondary, tertiary].filter(Boolean);
  const steps = Math.min(...chosen.map(d => { const s = ringDistance(trad, d, index); return s == null ? 99 : s; }));
  const penalty = steps <= 1 ? 2 : steps <= 4 ? 2 : 3;
  return { allowed: true, penalty, band: "far", reason: `${Number.isFinite(steps) ? steps : "many"} steps from your nearest domain — costs more` };
}

/** SNG-059 migration: infer a legacy character's domains from the traditions of the abilities they
 *  already hold. Most-represented tradition → primary; next distinct → secondary; a ring-neighbour
 *  of the secondary (if held) → tertiary. Folk-only characters get no domain (stay open). Nobody
 *  loses an ability — out-of-domain holdings are grandfathered by the gate's legacy branch. */
export function inferDomains(abilityRecords = [], catalog = {}, index) {
  if (!index) return null;
  const count = {};
  for (const rec of abilityRecords) {
    const ab = catalog[rec.abilityId] || rec;
    const trad = traditionOf(ab, index);
    if (!trad || isFolkTradition(trad, index)) continue;
    count[trad] = (count[trad] || 0) + 1;
  }
  const ranked = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  if (!ranked.length) return null; // folk-only / no pole abilities → open
  const primary = ranked[0];
  const secondary = ranked.find(t => t !== primary && t !== antipodeOf(primary, index)) || null;
  let tertiary = null;
  if (secondary) {
    const nbrs = new Set(neighborsOf(secondary, index));
    tertiary = ranked.find(t => t !== primary && t !== secondary && nbrs.has(t)) || nbrs.values().next().value || null;
  }
  return { primary, secondary, tertiary, inferred: true };
}
