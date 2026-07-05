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

export const CLASS_COLOR = {
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
  const custom = new Set(Object.keys(character.customAbilities || {}));
  return (character.abilities || []).filter(a => !custom.has(a.abilityId)).length;
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
export function skillGraphModel(catalog, emergence, character, { attributeGates, skillCapacity, preds = {} } = {}) {
  const owned = new Map((character.abilities || []).map(a => [a.abilityId, a.level]));
  const cap = atCapacity(character, skillCapacity);
  const nodes = Object.values(catalog).map(ab => {
    const gate = gateFor(ab.id, attributeGates);
    const learnGate = meetsLearnGate(character, ab.id, attributeGates);
    return {
      id: ab.id, name: ab.name, cls: ab.powerSystem, tier: tierOf(ab.levelReq), levelReq: ab.levelReq || 1,
      owned: owned.has(ab.id), rank: owned.get(ab.id) || 0,
      ripe: preds.isRipe ? !!preds.isRipe(ab.id) : false,
      aspired: preds.isAspired ? !!preds.isAspired(ab.id) : false,
      gated: !!gate,
      locked: !owned.has(ab.id) && (!learnGate.ok || (cap && ab.powerSystem !== "learned")),
      lockText: !learnGate.ok ? learnGate.why : (cap ? "at skill capacity — deepen owned skills" : "")
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
