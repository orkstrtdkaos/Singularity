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

import { abilityTier } from "./skilltree.js";
/** Build the query index from the loaded traditions.json. Reads the ring from `theGreatCircle`
 *  + per-tradition `ring`/`distances`/`opposite`, and the ability→tradition reverse map from each
 *  tradition's `abilities` list. Folk traditions are marked OPEN. */
// ⛔ CCODE-333 — THE DOMAIN LAYER, AND `traditionOf` DOES NOT MOVE. Erik ruled READING B: the POLES REMAIN
// THE TRADITIONS and the 14 domains sit ABOVE them. So this is ADDITIVE — a Cogitant is still a Cogitant,
// and Cogitant is in the Mind domain. Nothing a content file names stops existing.
//
// ⚠️ `v2` DEFAULTS TO NULL AND EVERY EXISTING CALLER IS UNCHANGED. The reader ships before the field is
// depended on: with no v2 doc the index carries an empty domain map and `domainOf` returns null, which is
// exactly what every consumer written before today already handles.
export function buildTraditionIndex(file = {}, v2 = null) {
  const traditions = file.traditions || [];
  const folk = file.folkTraditions || [];
  const stations = file.theGreatCircle?.stations || [];
  const byId = {};
  const ringPos = {};
  const distances = {};
  const abilityToTradition = {};
  const folkIds = new Set(folk.map(f => f.traditionId));
  // SNG-202B: the ring is a projection of 12 bipolar axes — a tradition at position p and p+12 are the two
  // poles of one axis (umbral/dark at 0, blazeborn/light at 12). This map lets a craft's `axes` composition
  // (weights in that same abstract space) be projected onto the great circle: axisKey → the ring position of
  // each pole. `neg` = the FIRST-named pole (dark_light → dark), `pos` = the second (→ light).
  const axisPoles = {};
  for (const s of stations) if (s.traditionId != null && Number.isFinite(s.position)) ringPos[s.traditionId] = s.position;
  for (const t of traditions) {
    byId[t.traditionId] = t;
    if (t.ring && Number.isFinite(t.ring.position)) ringPos[t.traditionId] = t.ring.position;
    if (t.distances) distances[t.traditionId] = t.distances;
    for (const ab of t.abilities || []) abilityToTradition[ab] = t.traditionId;
    const pos = t.ring?.position ?? ringPos[t.traditionId];
    if (typeof t.axis === "string" && t.axis.includes("_") && typeof t.pole === "string" && Number.isFinite(pos)) {
      const [A, B] = t.axis.split("_");
      axisPoles[t.axis] = axisPoles[t.axis] || {};
      if (t.pole === A) axisPoles[t.axis].neg = pos;
      else if (t.pole === B) axisPoles[t.axis].pos = pos;
    }
  }
  for (const f of folk) { byId[f.traditionId] = f; for (const ab of f.abilities || []) abilityToTradition[ab] = f.traditionId; }
  // ⚠️ THE SECT TABLE IS THE ONE SOURCE. `traditions_v2.json` names each domain's sects as
  // [sectName, poleTraditionId, powerSource], so tradition→domain is DERIVED from it and never stored
  // per-ability. ⛔ 412 copies of a lookup is the defect this project pays for most; the 21 abilities that
  // carry `traditionV2` are a CROSS-CHECK against this table, not a second source of truth.
  const domainOfTrad = {}, domainById = {}, sectName = {};
  for (const [dom, rec] of Object.entries(v2?.traditions || {})) {
    domainById[dom] = rec;
    for (const s of (rec.sects || [])) {
      const [name, pole] = Array.isArray(s) ? s : [s?.name, s?.tradition];
      if (!pole) continue;
      domainOfTrad[pole] = dom;
      sectName[pole] = name || null;
    }
  }
  return { byId, ringPos, distances, abilityToTradition, folkIds, axisPoles, size: stations.length || 24, model: file.domainAccessModel || {}, stations,
    domainOfTrad, domainById, sectName, domainCount: Object.keys(domainById).length };
}

/** The tradition an ability belongs to: its own `tradition` field wins; else the reverse map. */
export function traditionOf(ability, index) {
  return ability?.tradition || index?.abilityToTradition?.[ability?.id] || null;
}

/** CCODE-333: the DOMAIN a tradition belongs to — the layer above the pole. Null when unmapped, which is
 *  the honest answer for the five records outside the wheel (god_named, bargainers, and the folk kits). */
// ⛔ CCODE-339b — `canCast` WAS DELETED, NOT WIRED. I exported it as a named reader and then every call
// site used `domainVerdict(ability).castable` instead, because the app already holds the character and
// the extra helper only re-asked what the verdict had answered. The `testOnlyExports` ratchet caught it
// at 18 and it was MINE.
//
// ⚠️ THE RATCHET SAYS "wire it or delete it" AND DELETE WAS THE HONEST ANSWER. Wiring a redundant helper
// to clear a ratchet is how a codebase grows two ways to ask one question. `castable` is read straight
// off the verdict — see `domainAccess`.
export function domainOfTradition(traditionId, index) { return index?.domainOfTrad?.[traditionId] || null; }

/** The domain an ABILITY belongs to, via its tradition. ⚠️ DERIVED THROUGH `traditionOf` ON PURPOSE, so a
 *  craft can never disagree with its own people about which domain it is in. */
export function domainOf(ability, index) { return domainOfTradition(traditionOf(ability, index), index); }

/** The sect NAME a pole carries inside its domain — `cogitant` is "Noesis" of Mind. */
export function sectOf(traditionId, index) { return index?.sectName?.[traditionId] || null; }

/** Every pole in a domain. */
export function polesInDomain(domain, index) {
  return Object.keys(index?.domainOfTrad || {}).filter(t => index.domainOfTrad[t] === domain);
}

export function isFolkTradition(traditionId, index) { return !!index?.folkIds?.has(traditionId); }

/** Ring distance in steps: `min(|i-j|, size-|i-j|)`. Prefers the authored per-tradition `distances`
 *  table, falls back to the ring positions. Unknown → null. */
// ⛔ CCODE-334 — THE RING IS THE SOURCE. This preferred the AUTHORED `distances` table and fell back to the
// ring, which made 552 stored entries the primary answer to a question the ring already answers.
//
// ⚠️ MEASURED BEFORE CHANGING IT: the derivation `min(|i−j|, size−|i−j|)` reproduces ALL 552 stored entries
// EXACTLY — zero mismatches. So this cannot alter behaviour: the derived value already IS the stored value
// everywhere. ⛔ THAT PROOF IS WHAT MAKES THIS SAFE, and `how_it_works` keeps it standing.
//
// ⚠️ THE TABLE IS STILL READ — as a FALLBACK for a tradition with no ring position, which is the one case
// the ring genuinely cannot answer. It is no longer the authority, so a stale entry can no longer quietly
// close a door that should be open.
export function ringDistance(a, b, index) {
  if (!a || !b) return null;
  if (a === b) return 0;
  const pa = index?.ringPos?.[a], pb = index?.ringPos?.[b];
  if (pa != null && pb != null) {
    const d = Math.abs(pa - pb), size = index.size || 24;
    return Math.min(d, size - d);
  }
  const tbl = index?.distances?.[a];
  if (tbl && tbl[b] != null) return tbl[b];
  return null;
}

/** The antipode (axis-opposite) of a tradition. */
export function antipodeOf(traditionId, index) {
  const t = index?.byId?.[traditionId];
  return t?.opposite || t?.ring?.antipode || null;
}

/** The ring-neighbours (steps === 1) of a tradition — the kin band (SNG-125 secondary), and historically
 *  the tertiary constraint (now freed). */
export function neighborsOf(traditionId, index) {
  const t = index?.byId?.[traditionId];
  if (t?.ring?.neighbors) return t.ring.neighbors;
  if (Array.isArray(t?.adjacent)) return t.adjacent.filter(a => a.steps === 1).map(a => a.traditionId);
  return [];
}

/** SNG-125: is `candidate` KIN-ADJACENT to `primary` — the existing ring-neighbour / step-1 band the
 *  access model already uses (domainAccess "adjacent"). A secondary domain must be kin to the primary,
 *  giving a build a concentrated CORE (primary + kin secondary) rather than three free picks. Reuses the
 *  ring geometry; invents no second distance (Erik ruling 1). Pure. */
export function isKinAdjacent(candidate, primary, index) {
  if (!candidate || !primary || candidate === primary) return false;
  return ringDistance(candidate, primary, index) === 1 || (neighborsOf(primary, index) || []).includes(candidate);
}

/** SNG-125: the legal SECONDARY options for a primary — kin-adjacent, non-folk, not the primary or its
 *  antipode. (Tertiary stays free — anywhere legal — so it isn't enumerated here.) Pure. */
export function kinSecondaryOptions(primary, index) {
  if (!primary || !index) return [];
  const anti = antipodeOf(primary, index);
  return ringOrder(index).filter(t => t !== primary && t !== anti && !isFolkTradition(t, index) && isKinAdjacent(t, primary, index));
}

/** SNG-125: are these built domains legal under the new axis model? GRANDFATHER-TOLERANT (Erik ruling 2):
 *  the adjacency constraint gates a NEW builder selection only (`enforce:true`); loaded saves are never
 *  re-validated, so an existing non-adjacent secondary (Silas: cogitant) stays fully legal. Access math
 *  (caps/foreclosure/promotion) is untouched — this is a SELECTION predicate, not an access rewrite. Pure. */
export function domainsLegal(domains = {}, index, { enforce = false } = {}) {
  if (!enforce) return { legal: true, reason: "grandfathered — the kin constraint gates new selection only" };
  const { primary, secondary } = domains || {};
  if (primary && secondary && !isKinAdjacent(secondary, primary, index))
    return { legal: false, reason: "your secondary must be kin-adjacent to your primary" };
  return { legal: true, reason: "" };
}

/** All non-folk tradition ids in ring order (for the great-circle picker). */
export function ringOrder(index) {
  return (index?.stations || []).slice().sort((a, b) => a.position - b.position).map(s => s.traditionId);
}

const CAPSTONE_TIER = 4; // tier IV–V are the single-mastery capstones

/** The access verdict for an ability of numeric tier T (1–5) given the character's chosen domains.
 *  Returns { allowed, penalty (skill-point multiplier), band, reason }. Pure. */
/** SNG-101: `opts` (all optional, absent-tolerant — absent ⇒ exactly today's behaviour):
 *   foreclosed: [traditionId]      — antipodes closed by promotion/acquisition (NATIVES only; braids cross)
 *   domainCeilings: {[trad]: tier} — per-domain ceiling override (promotion raises it); else station default
 *   domainsAcquired: [traditionId] — SNG-102 domains beyond the built three, entering at Tier I */
// ⚠️ THE PUBLIC ENTRY MARKS THE VERDICT. `domainAccess` has a dozen return points and the antipode rule cuts
// across all of them, so the mark is applied ONCE here rather than at each `return` — which is how one of
// them would eventually be added without it.
function num(v, d) { const n = Number(v); return Number.isFinite(n) ? n : d; }

/** ⛔ R9/R16 — HOW FAR THIS CHARACTER HAS LEANED ALONG ONE AXIS, from the weights domainOpts supplies.
 *  weight = Σ (tier × rank) per tradition — breadth as the number of terms, depth as tier and rank.
 *  ⚠️ ABSENT WEIGHTS READ AS 1.0, which is not a guess: it is the true value for a character who has
 *  never touched the far pole, and the conservative reading if the catalog was not supplied. */
export function antipodeLean(homeTrad, antiTrad, opts = {}) {
  const w = opts.axisWeights;
  if (!w) return 1;
  const h = num(w[homeTrad], 0), a = num(w[antiTrad], 0);
  // ⛔ BALANCE MUST BE EARNED. `lean` is a RATIO, so at low weight it is noise: one home craft and one
  // antipode craft reads as PERFECT balance and would hand a level-1 character the primary's own
  // ceiling in their far pole. ⚠️ The CCODE-224 gate warned of this before R16 existed. Below the
  // authored floor the character is a novice on this axis and the far pole stays far.
  const floor = num(opts.skillCapacity?.minAxisWeight, 20);
  if (h + a < floor) return 1;
  return Math.max(0, Math.min(1, (h - a) / (h + a)));
}

/** ⛔ R16 — the ceiling the lean has earned. The table is AUTHORED (`skill_capacity.antipodeCeilingByLean`)
 *  so the curve is Erik's to move without a code change. Defaults mirror the authored table. */
export function antipodeCeiling(lean, skillCapacity) {
  const table = skillCapacity?.antipodeCeilingByLean
    || [{ maxLean: 0.15, ceiling: 5 }, { maxLean: 0.45, ceiling: 4 }, { maxLean: 0.75, ceiling: 3 }, { maxLean: 1, ceiling: 2 }];
  for (const row of table) if (lean <= num(row.maxLean, 1)) return num(row.ceiling, 2);
  return num(table[table.length - 1]?.ceiling, 2);
}

export function domainAccess(ability, tier, domains, index, opts = {}) {
  const v = domainAccessInner(ability, tier, domains, index, opts);
  // ⛔ `castable` is TRUE unless the verdict says otherwise, so every existing caller that ignores it reads
  // exactly as it did. A craft you cannot reach at all is not "uncastable" — it is unreachable, and the two
  // must not be confused: `allowed` answers "may I hold this", `castable` answers "may I use it".
  return { castable: v.castable !== false, ...v, castable: v.castable !== false };
}

function domainAccessInner(ability, tier, domains, index, opts = {}) {
  const trad = traditionOf(ability, index);
  // ⛔ CCODE-341c — THE TIER ARGUMENT WAS A TRAP. Four callers passed `ability.levelReq` here, because
  // the parameter is called `tier` and the two fields were the same thing until CCODE-340. A caller
  // that must restate a fact the ability already carries WILL eventually restate it wrongly.
  // ⚠️ NOW OPTIONAL: pass null/undefined and the craft's own tier is used. An explicit tier still wins,
  // which the probes and §36 rely on.
  const T = tier == null ? abilityTier(ability) : Math.max(1, Math.min(5, Number(tier) || 1));
  if (!trad || !index) return { allowed: true, penalty: 1, band: "open", reason: "ungoverned" };
  if (isFolkTradition(trad, index)) return { allowed: true, penalty: 1, band: "folk", reason: "folk tradition — open in the Valley" };
  const primary = domains?.primary, secondary = domains?.secondary, tertiary = domains?.tertiary;
  if (!primary) return { allowed: true, penalty: 1, band: "open", reason: "no domain chosen yet" }; // pre-domain / legacy
  const acquired = opts.domainsAcquired || [];
  const cap = def => opts.domainCeilings?.[trad] ?? def; // promotion raises the station's default ceiling

  // SNG-101 FORECLOSED — a pole you committed against by promoting its opposite. NATIVES only; a braid
  // (nativeOrCombination === "combination") is the sanctioned road across the axis and is NEVER foreclosed.
  // ⛔ R9/R16 REMOVED THE FORECLOSURE. Promotion used to CLOSE the antipode of the domain you raised, and
  // this branch enforced it. The axis is now governed by a price and a ceiling that both move with `lean`,
  // so nothing needs to be shut. ⚠️ `opts.foreclosed` IS STILL READ NOWHERE ELSE — old saves may carry the
  // array and it is simply ignored, which is deliberate: they must not keep a restriction new characters
  // never get.

  // ⛔ CCODE-339 / ERIK’S RULING: "we need to rework the domain access model SO WE NO LONGER LOSE ACCESS TO
  // THE ANTIPOLES… you can't use the skill itself, ONLY THE BRAIDABLE PART."
  //
  // ⛔ LEARNABLE, NOT CASTABLE. The antipode used to return `allowed: false` — a WALL, and the only gate in
  // the model that was not a price. Measured before removing it (CCODE-332): it accounted for **67% of all
  // access denials in the game**, and it was not even-handed — stillhold lost 50 crafts to it and threnodist
  // 17, because a pole’s antipode may be richly authored or thin. An ACCESS rule was doing BALANCE work.
  //
  // ⚠️ IT IS NOW A MARK, NOT A RETURN. The craft falls through to the ordinary bands — `far` at the
  // cross-class penalty — so it is reached by the gates that already exist (a teacher, or standing in their
  // region). What it CANNOT do is be cast, and that is carried on the verdict for the caller to honour.
  //
  // ⚠️ AND THE DESIGN NOTE SURVIVES WORD FOR WORD: "holding an axis WHOLE is forbidden to you by ordinary
  // means and reachable only by braiding." You may learn it; you still cannot use it. ✅ THE BRAID IS STILL
  // THE ONLY WAY TO SPEND WHAT YOU LEARNED — and it is now the thing that turns dead knowledge into a craft,
  // which is a better reason to carry one than "it is the only road".
  //
  // ⛔ THE STAIRS ARE DELIBERATELY NOT BUILT. Erik: "we can figure out the stairs later." What tier it counts
  // as, whether ranks can be bought in it, and what exactly a braid needs from it are OPEN — and building a
  // ladder against stub text is how a stub becomes load-bearing.
  const antipodal = trad === antipodeOf(primary, index)
    || (secondary && trad === antipodeOf(secondary, index));

  if (trad === primary) return T <= cap(5)
    ? { allowed: true, penalty: 1, band: "primary", reason: "your primary domain — all tiers" }
    : { allowed: false, penalty: 1, band: "primary", reason: "beyond this domain's ceiling" };
  if (trad === secondary) return T <= cap(3)
    ? { allowed: true, penalty: 1, band: "secondary", reason: `secondary domain — to tier ${cap(3)}` }
    : { allowed: false, penalty: 1, band: "secondary", reason: `your secondary tops out at tier ${cap(3)}` };
  if (trad === tertiary) return T <= cap(2)
    ? { allowed: true, penalty: 1, band: "tertiary", reason: `tertiary domain — to tier ${cap(2)}` }
    : { allowed: false, penalty: 1, band: "tertiary", reason: `your tertiary tops out at tier ${cap(2)}` };
  // SNG-102: an acquired domain — a people you joined mid-play, entering at Tier I, promotable like any other
  if (acquired.includes(trad)) return T <= cap(1)
    ? { allowed: true, penalty: 1, band: "acquired", reason: `an acquired people — to tier ${cap(1)}` }
    : { allowed: false, penalty: 1, band: "acquired", reason: `you are still a novice of this acquired people (tier ${cap(1)})` };

  // adjacent to primary (kin): free, but not the capstones
  if (ringDistance(trad, primary, index) === 1) return T < CAPSTONE_TIER
    ? { allowed: true, penalty: 1, band: "adjacent", reason: "kin to your primary — free, no capstones" }
    : { allowed: false, penalty: 1, band: "adjacent", reason: "near a people is not being of them — no capstones" };

  // anything else reachable costs more (the existing cross-class penalty), scaling a little with distance
  const chosen = [primary, secondary, tertiary, ...acquired].filter(Boolean);
  const steps = Math.min(...chosen.map(d => { const s = ringDistance(trad, d, index); return s == null ? 99 : s; }));
  const penalty = steps <= 1 ? 2 : steps <= 4 ? 2 : 3;
  // ⚠️ THE ANTIPODE IS A `far` CRAFT THAT CANNOT BE CAST. It is reached the ordinary way and priced the
  // ordinary way; the only thing that differs is what you may do with it once held.
  // ⛔ R16 (ERIK 2026-09-01) — THE ANTIPODE'S CEILING RISES WITH LEAN, and R9 prices it by the same lean.
  //
  // ⚠️ R9 AND R10 CANCELLED EACH OTHER. R10 capped `far` at tier II; R9 said sustained balance earns
  // price parity. If the antipode were merely `far`, a balanced cross-pole character would pay parity for
  // crafts they could never take past novice depth — R9 would buy nothing. Erik: make them ONE mechanism.
  //
  // ✅ So the lean a character earns buys BOTH: the price relief AND the depth. Dabble and you are capped
  // shallow and pay the surcharge; commit and both barriers recede together. The barrier is to DABBLING.
  //
  // ⚠️ `castable: false` IS GONE. CCODE-339 made the antipode learnable-but-not-castable as a halfway
  // step; R9/R16 replace that with a price and a ceiling, which is what Erik asked for: "I'd like to allow
  // the use of the learned skills in the antipole."
  if (antipodal) {
    const home = trad === antipodeOf(primary, index) ? primary : secondary;
    const lean = antipodeLean(home, trad, opts);
    const ceiling = opts.domainCeilings?.[trad] ?? antipodeCeiling(lean, opts.skillCapacity);
    const surcharge = Math.round((num(opts.skillCapacity?.antipodeLeanSurcharge, 2)) * lean);
    return T <= ceiling
      ? { allowed: true, penalty, band: "antipode", lean, leanSurcharge: surcharge,
          reason: `the far pole of your own axis — to tier ${ceiling} at your present balance` }
      : { allowed: false, penalty, band: "antipode", lean, leanSurcharge: surcharge,
          reason: `the far pole of your own axis — you have leaned too far from it to reach tier ${T} (yours tops out at ${ceiling}; carry more of that pole and it rises)` };
  }
  return { allowed: true, penalty, band: "far", reason: `${Number.isFinite(steps) ? steps : "many"} steps from your nearest domain — costs more` };
}

/** SNG-062 + SNG-125: crystallize domains from the tradition-tags a player ACCRUED by how they played
 *  the prologue. The heaviest tag is the PRIMARY; the SECONDARY is the heaviest tag that is KIN-ADJACENT
 *  to the primary (Erik ruling 1 — a concentrated core), snapped to a kin option so the prologue never
 *  produces an illegal build; the TERTIARY is now FREE (ruling 4) — the heaviest remaining legal pole
 *  (not the primary/secondary or a closed antipode), no longer bound to the secondary.
 *  Pure. Returns { primary, secondary, tertiary } or null if no pole tags. */
export function crystallizeDomains(tags = {}, index) {
  if (!index) return null;
  const ranked = Object.entries(tags)
    .filter(([t]) => !isFolkTradition(t, index) && index.byId?.[t])
    .sort((a, b) => b[1] - a[1]).map(([t]) => t);
  if (!ranked.length) return null;
  const primary = ranked[0];
  const antiP = antipodeOf(primary, index);
  // SNG-125: secondary must be KIN-ADJACENT to primary — the heaviest-tagged kin, else the first kin option.
  const kin = kinSecondaryOptions(primary, index);
  const kinSet = new Set(kin);
  let secondary = ranked.find(t => t !== primary && kinSet.has(t)) || kin[0] || null;
  // SNG-125: tertiary is FREE — the heaviest remaining legal pole, not bound to the secondary's neighbours.
  let tertiary = null;
  if (secondary) {
    const antiS = antipodeOf(secondary, index);
    tertiary = ranked.find(t => t !== primary && t !== secondary && t !== antiP && t !== antiS && !isFolkTradition(t, index)) || null;
  }
  return { primary, secondary, tertiary };
}

/** SNG-068A: reconcile a prologue character's STARTING abilities against their CONFIRMED domains.
 *  Keeps every earned ability ("you did this, so you know this") — nothing is stripped — but:
 *   - flags any that fall OUTSIDE the confirmed domains as `grandfathered` (the player is told),
 *   - grants ONE ability from the CONFIRMED PRIMARY if the character has none there (a wright must
 *     know something wright — the missing step that produced the Silas bug).
 *  Pure. Returns { abilities:[ids], grantedFromPrimary:id|null, grandfathered:[ids] }. */
export function reconcileStartingAbilities(earnedIds = [], domains = {}, catalog = {}, index) {
  const earned = earnedIds.filter(id => catalog[id]);
  if (!index || !domains?.primary) return { abilities: [...earned], grantedFromPrimary: null, grandfathered: [] };
  const grandfathered = earned.filter(id => !domainAccess(catalog[id], abilityTier(catalog[id]), domains, index).allowed);
  const hasPrimary = earned.some(id => traditionOf(catalog[id], index) === domains.primary);
  let grantedFromPrimary = null;
  if (!hasPrimary) {
    const cand = Object.values(catalog)
      .filter(ab => traditionOf(ab, index) === domains.primary && !earned.includes(ab.id))
      .sort((a, b) => abilityTier(a) - abilityTier(b))[0];
    if (cand) grantedFromPrimary = cand.id;
  }
  return { abilities: [...earned, ...(grantedFromPrimary ? [grantedFromPrimary] : [])], grantedFromPrimary, grandfathered };
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
