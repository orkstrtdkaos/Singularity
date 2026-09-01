// skilltree.js — SNG-BATCH-2 Phases 2+3: skill legibility and gating.
// Pure helpers over the ability catalog + character state:
//  - TIERS (I–V from levelReq) for display everywhere
//  - ATTRIBUTE GATES (some high-tier abilities need a governing sub-attribute)
//  - BROAD-VS-DEEP CAPACITY (a breadth cap on distinct chosen abilities per level)
//  - a GRAPH MODEL for rendering the catalog like the world map.
// Engine owns the rules; the app renders. No content specifics live here.

const ROMAN = ["", "I", "II", "III", "IV", "V"];

/** Tier I–V derived from levelReq (1→I … 5→V, clamped). */
export function tierOf(levelReq) {
  return ROMAN[Math.max(1, Math.min(5, levelReq || 1))];
}

export const CLASS_COLOR = { // registry:internal
  harmonic: "#5aa8a0", radiant: "#d4a24a", valley_craft: "#7ba05b",
  precursor: "#a678c8", learned: "#8b8778", discovery: "#c99"
};
export function classColor(sys) { return CLASS_COLOR[sys] || "#8b8778"; }
export function classLabel(sys) {
  return sys === "valley_craft" ? "Valley Craft" : sys === "precursor" ? "Precursor" : sys.charAt(0).toUpperCase() + sys.slice(1);
}

// ---------- attribute gates (Phase 3) ----------

/** The gate for an ability, or null if ungated. */
export function gateFor(abilityId, attributeGates) {
  return attributeGates?.gates?.[abilityId] || null;
}

/** Can the character LEARN a gated ability (sub-attribute >= learnMin)? Returns
 *  { ok, why } — ok:true when ungated or met. */
export function meetsLearnGate(character, abilityId, attributeGates) {
  const g = gateFor(abilityId, attributeGates);
  if (!g) return { ok: true };
  const have = character.subAttributes?.[g.subAttribute] ?? 0;
  return have >= g.learnMin
    ? { ok: true }
    : { ok: false, why: `needs ${g.subAttribute} ${g.learnMin} — you have ${have}` };
}

/** Can the character reach RANK 3 of a gated ability (sub-attribute >= rank3Min)? */
export function meetsRank3Gate(character, abilityId, attributeGates) {
  const g = gateFor(abilityId, attributeGates);
  if (!g) return { ok: true };
  const have = character.subAttributes?.[g.subAttribute] ?? 0;
  return have >= g.rank3Min
    ? { ok: true }
    : { ok: false, why: `rank 3 needs ${g.subAttribute} ${g.rank3Min} — you have ${have}` };
}

// ---------- broad-vs-deep capacity (Phase 3) ----------

/** Distinct CHOSEN abilities (breadth). Earned techniques — discoveries, branches,
 *  bond grants — are free growth and don't count against the cap. */
export function breadthUsed(character) {
  // customAbilities are engine-granted (bond/learned); count only point/practice-chosen ones.
  // CCODE-22: `native:true` grants are BY-RIGHT anchors given at creation (applyNativeGrants) — free
  // growth that must NOT count as chosen breadth (progression.js docstring + skill_capacity.json note).
  // The flag was written and never read, so a ≥3-anchor tradition (harmonic/radiant_folk 5, churnfolk/
  // mason 3) blew past the level-1 cap of 2 → atCapacity → could learn NOTHING new until level 5.
  // ⛔ SNG-345: `baseline` JOINS `native` HERE, AND OMITTING IT WOULD HAVE BEEN CATASTROPHIC. The martial
  // floor grants 4 free abilities; the level-1 breadth cap is 2. Counted as chosen breadth, EVERY NEW
  // CHARACTER WOULD BE BORN AT DOUBLE CAPACITY — able to learn nothing at all until level 5 — which is the
  // exact failure the paragraph above describes for `native`, one flag later. A floor that consumes the
  // build it exists to underwrite is worse than no floor at all.
  const custom = new Set(Object.keys(character.customAbilities || {}));
  return (character.abilities || []).filter(a => !custom.has(a.abilityId) && !a.native && !a.baseline).length;
}

export function breadthCap(character, skillCapacity) {
  const table = skillCapacity?.skillsKnownByLevel || {};
  const lvl = character.level || 1;
  return table[String(lvl)] ?? (lvl + 1);
}

export function atCapacity(character, skillCapacity) {
  return breadthUsed(character) >= breadthCap(character, skillCapacity);
}

// ---------- graph model (Phase 2) ----------

/** Build a render-ready node/edge model of the whole catalog for a character.
 *  preds: { isRipe(id), isAspired(id) } supplied by the app (practice-aware). */
export function skillGraphModel(catalog, emergence, character, { attributeGates, skillCapacity, branchForks = null, preds = {} } = {}) {
  const owned = new Map((character.abilities || []).map(a => [a.abilityId, a.level]));
  const cap = atCapacity(character, skillCapacity);
  const nodes = Object.values(catalog).map(ab => {
    const gate = gateFor(ab.id, attributeGates);
    const learnGate = meetsLearnGate(character, ab.id, attributeGates);
    // SNG-BATCH-5 Phase 2: fork state for the node badge/detail
    const fork = forkFor(ab.id, branchForks);
    const chosen = fork ? chosenFork(character, ab.id, branchForks) : null;
    const lockedPath = fork && chosen ? forkPaths(ab.id, branchForks).find(p => p.key !== chosen.key) : null;
    const isOwned = owned.has(ab.id), rank = owned.get(ab.id) || 0;
    const locked = !isOwned && (!learnGate.ok || (cap && ab.powerSystem !== "learned"));
    // SNG-101: a foreclosed antipode's NATIVE nodes read FORECLOSED ("you chose otherwise" — distinct from
    // LOCKED's "not yet"). Owned ground is kept (foreclosure is directional), and braids are never foreclosed.
    const foreclosed = !isOwned && ab.nativeOrCombination !== "combination" && (character?.foreclosed || []).includes(ab.tradition);
    // ⛔ SNG-348 — THE MODEL KNEW WHETHER A NODE WAS OPEN AND NOT WHETHER IT WAS BUYABLE, and those are
    // different questions. `AVAILABLE` means the gates are met and you are under capacity — it says nothing
    // about the price, so the wheel showed Erik a field of open crafts he could not afford. Cost now rides
    // on the node, from `learnPointCost` — THE SAME FUNCTION THE PURCHASE CHARGES, never a second opinion,
    // because a filter that computes its own price will eventually disagree with the button.
    const cost = isOwned ? 0 : learnPointCost(ab, character, skillCapacity, preds.verdictFor ? preds.verdictFor(ab) : null);
    const affordable = isOwned || (character.skillPoints || 0) >= cost;
    return {
      id: ab.id, name: ab.name, cls: ab.tradition || ab.powerSystem, tier: tierOf(ab.levelReq), levelReq: ab.levelReq || 1,
      cost, affordable,
      // BUYABLE = open AND affordable. Erik: "add a filter for buyable so I can see what I can get."
      buyable: !isOwned && !locked && !foreclosed && affordable,
      owned: isOwned, rank,
      ripe: preds.isRipe ? !!preds.isRipe(ab.id) : false,
      aspired: preds.isAspired ? !!preds.isAspired(ab.id) : false,
      gated: !!gate,
      forks: !!fork, forkAt: fork?.atRank || null,
      forkChosen: chosen?.name || null, forkLocked: lockedPath?.name || null,
      locked: locked || foreclosed, foreclosed,
      lockText: foreclosed ? "foreclosed — you chose the other end of this axis; only a braid crosses" : !learnGate.ok ? learnGate.why : (cap ? "at skill capacity — this waits until your next level widens it" : ""),
      // ability-arch v2 + SNG-101: the display states, DERIVED from the flags above (no new computation).
      state: isOwned ? `OWNED_${Math.min(3, rank || 1)}` : foreclosed ? "FORECLOSED" : locked ? "LOCKED" : "AVAILABLE"
    };
  });
  const ids = new Set(nodes.map(n => n.id));
  const edges = [];
  for (const r of emergence?.recipes || []) {
    for (const c of r.components || []) if (ids.has(c)) edges.push({ from: c, to: r.id, kind: "combo", virtual: r.id });
  }
  for (const t of emergence?.branchTemplates || []) {
    if (ids.has(t.growsAbility)) edges.push({ from: t.growsAbility, to: t.id, kind: "branch", virtual: t.id });
  }
  return { nodes, edges };
}

// ---------- ability-arch v2: native grants & axis-touch combinations ----------

/** The native abilities of a tradition — what being of this people simply IS. Granted at rank 1, free,
 *  at primary-domain selection (attribute-gated per attribute_gates.json). Reads `nativeOrCombination`;
 *  returns [] for a tradition whose abilities aren't classified yet (the engine never guesses). */
export function nativeGrantsFor(tradition, catalog = {}) {
  return Object.values(catalog).filter(ab =>
    ab && ab.nativeOrCombination === "native" && (ab.tradition || ab.powerSystem) === tradition);
}

/** The axis-touch combinations a tradition can currently claim: `nativeOrCombination === "combination"`,
 *  of this tradition, not already owned, and whose narrative threshold is met. `thresholdMet(ab)` is
 *  injected (from practice.js) so skilltree.js takes no practice dependency. At character creation pass
 *  `() => true` — background justifies the exposure (§7.4). Empty until combinations are authored. */
export function combinationsAvailableFor(tradition, character, catalog = {}, thresholdMet = () => false) {
  const owned = new Set((character?.abilities || []).map(a => a.abilityId));
  return Object.values(catalog).filter(ab =>
    ab && ab.nativeOrCombination === "combination" && (ab.tradition || ab.powerSystem) === tradition
    && !owned.has(ab.id) && thresholdMet(ab));
}

// ---------- SNG-BATCH-5 Phase 1: soft class cost (cross-class = 2x points) ----------

/** The character's HOME power system, derived from origin. Valley folk are
 *  valley_craft natives; harmonic/radiant origins are their own class. Precursor
 *  is never home (learned-only), so it always pays the cross-class multiplier. */
export function homeClassOf(character) {
  // SNG-063: a character's people is authored (character.nativeTradition from origins.json). Prefer
  // it; fall back to the legacy origin ids so old saves and the domain model both keep working.
  if (character?.nativeTradition) return character.nativeTradition;
  const o = character?.origin;
  if (o === "harmonic") return "harmonic";
  if (o === "radiant") return "radiant";
  return "valley_craft"; // valley (and any default)
}

const CLASS_SYSTEMS = ["harmonic", "radiant", "valley_craft", "precursor"];

/** Is this ability outside the character's home class? Only the four class systems
 *  count; learned/discovery (earned techniques) are never "cross-class". */
export function isCrossClass(ability, character) {
  const sys = ability?.powerSystem;
  if (!sys || !CLASS_SYSTEMS.includes(sys)) return false;
  return sys !== homeClassOf(character);
}

/** Skill-point cost to learn or rank an ability: 1 normally, ×multiplier cross-class.
 *  DISTANCE ONLY — see learnPointCost for the composed price a player actually pays. */
export function skillPointCost(ability, character, skillCapacity) {
  const mult = skillCapacity?.crossClass?.costMultiplier ?? 2;
  return isCrossClass(ability, character) ? mult : 1;
}

/** SNG-260 §D / SNG-261 §A — WHAT A CRAFT IS WORTH, by tier. Erik: "a Tier-II costs 2, a Tier-III costs 3.
 *  Power costs more." Tier was previously UNPRICED, so a Tier-III cost exactly what a Tier-I did and there
 *  was no reason to buy shallow — one of the two drivers of Silas's 36 crafts.
 *
 *  Data-driven from skill_capacity.tierPrice so Erik owns the ladder, including the question SNG-261 §A
 *  raises: the catalog holds 28 abilities at levelReq 4 and 26 at levelReq 5, so a 1/2/3 ladder stops two
 *  tiers short. Default here is LINEAR (a tier-N craft costs N); whether T-IV/V accelerate is Erik's dial. */
export function tierPrice(ability, skillCapacity) {
  const table = skillCapacity?.tierPrice;
  // ⛔ CCODE-340 — TIER IS WHAT THE CRAFT IS; `levelReq` IS WHEN YOU MAY LEARN IT. They were the same
  // field until now, so an unlock level could not be moved without re-pricing the craft. Erik: "we need a
  // dedicated Tier for the skills — that was intended all along."
  // ⚠️ `?? levelReq` KEEPS EVERY CRAFT AT ITS CURRENT PRICE until content says otherwise.
  const tier = Math.max(1, Number(ability?.tier ?? ability?.levelReq) || 1);
  if (Array.isArray(table)) return Number(table[tier - 1]) || tier;
  if (table && typeof table === "object") return Number(table[String(tier)]) || tier;
  return tier;
}

/** THE ONE SITE that answers "what does this craft cost me?".
 *
 *  It exists because that answer was previously computed in SIX places, and the two shapes disagreed: with
 *  `character.domains.primary` set — the normal case — every caller used `domainVerdict(ab).penalty || 1`
 *  and never called skillPointCost at all. A tier price added there alone would have been DEAD for real
 *  characters while looking correct in isolation. Distance and tier now compose here, once.
 *
 *  cost = tierPrice × distance, where distance is the domain ring penalty when domains are set (braids
 *  already discount that upstream) and the cross-class multiplier otherwise. A far Tier-III is genuinely
 *  dear; a near Tier-I stays 1. Never below 1 — and nothing EARNED comes through here at all: practice,
 *  braids and discoveries route around this function by design, and must keep doing so (SNG-260 §D item 5). */
export function learnPointCost(ability, character, skillCapacity, verdict = null) {
  const distance = (character?.domains?.primary && verdict)
    ? (Number(verdict.penalty) || 1)
    : skillPointCost(ability, character, skillCapacity);
  return Math.max(1, Math.round(tierPrice(ability, skillCapacity) * distance));
}

// ---------- SNG-BATCH-5 Phase 2: branch forks ----------

export function forkFor(abilityId, branchForks) {
  return branchForks?.forks?.[abilityId] || null;
}

/** The two paths of a fork as [{key, name, grants, cannot}, …], or [] if none. */
export function forkPaths(abilityId, branchForks) {
  const f = forkFor(abilityId, branchForks);
  return f ? Object.entries(f.paths || {}).map(([key, v]) => ({ key, ...v })) : [];
}

/** The character's chosen fork path for an ability, or null if unchosen/none. */
export function chosenFork(character, abilityId, branchForks) {
  const key = character?.forkChoices?.[abilityId];
  if (!key) return null;
  const path = forkFor(abilityId, branchForks)?.paths?.[key];
  return path ? { key, ...path } : null;
}

/** True when ranking this ability TO targetRank hits a fork that isn't resolved yet. */
export function forkPending(character, abilityId, targetRank, branchForks) {
  const f = forkFor(abilityId, branchForks);
  if (!f || targetRank !== f.atRank) return false;
  return !character?.forkChoices?.[abilityId];
}

/** Lock in a fork path — permanent once set. Returns false if none / already chosen / bad key. */
export function setFork(character, abilityId, pathKey, branchForks) {
  const f = forkFor(abilityId, branchForks);
  if (!f || !f.paths?.[pathKey]) return false;
  character.forkChoices = character.forkChoices || {};
  if (character.forkChoices[abilityId]) return false; // permanent
  character.forkChoices[abilityId] = pathKey;
  return true;
}

/** Effective rank-expression for display: the chosen fork path REPLACES the linear
 *  tree entry once the ability is at/past the fork rank; otherwise the linear entry. */
export function rankExpression(character, ability, level, branchForks) {
  const f = forkFor(ability?.id, branchForks);
  if (f && level >= f.atRank) {
    const chosen = chosenFork(character, ability.id, branchForks);
    if (chosen) return { name: chosen.name, grants: chosen.grants, cannot: chosen.cannot, forked: true, pathKey: chosen.key };
  }
  const t = ability?.tree?.find(x => x.rank === level);
  return t ? { name: t.name, grants: t.grants, cannot: t.cannot, forked: false } : null;
}
