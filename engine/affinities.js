// affinities.js — SNG-013. A place shapes the roll two ways, both surfaced to the
// player (legible-world law): (1) TYPE affinity — a location's tag grants a flat
// situational bump to matching skills/attributes (content, location_affinities.json);
// (2) VECTOR alignment — an ability whose axes agree with the place's STRONG spectrum
// axes eases the roll, opposed hardens it, capped ±cap on the d100.
//
// Pure functions, no I/O. The engine computes; the GM narrates the "why". This is the
// one capped location modifier SNG-BATCH-3 introduces — no other new resolution math.

const DEFAULT_VECTOR = { strongThreshold: 0.4, cap: 10, scale: 12 };

/** Map a location's freeform tags to canonical affinity tag-types via tagAliases. */
function canonTags(location, aliases = {}) {
  const out = new Set();
  for (const t of location?.tags || []) {
    const key = String(t).toLowerCase();
    out.add(aliases[key] || key);
  }
  return out;
}

/** Does the action engage this affinity key? attr_<x> matches attribute/sub-attribute;
 *  otherwise the key is an ability/skill/intent id the action is using. */
function actionMatchesKey(action, key) {
  if (key.startsWith("attr_")) {
    const a = key.slice(5);
    return action.attribute === a || action.subAttribute === a || (action.intentTags || []).includes(a);
  }
  if (action.abilityId === key) return true;
  if ((action.comboAbilities || []).includes(key)) return true;
  if ((action.intentTags || []).includes(key)) return true;
  return false;
}

/** Flat, capped tag bumps for the skills/attributes this action uses. */
export function typeAffinity(location, action, table = {}) {
  const affs = table.typeAffinity || {};
  const tags = canonTags(location, table.tagAliases || {});
  let bonus = 0;
  const notes = [];
  for (const tag of tags) {
    const entry = affs[tag];
    if (!entry) continue;
    for (const [key, val] of Object.entries(entry.bonus || {})) {
      if (actionMatchesKey(action, key)) { bonus += val; notes.push({ key, val, tag }); }
    }
    for (const [key, val] of Object.entries(entry.penalty || {})) {
      if (actionMatchesKey(action, key)) { bonus -= val; notes.push({ key, val: -val, tag }); }
    }
  }
  const cap = table.typeCap ?? 12;
  return { bonus: Math.max(-cap, Math.min(cap, bonus)), notes };
}

/** A location's amplitude multiplies its vector cap so charged places swing wider
 *  (Aevi-authored: precursor 2.0, ruin/shrine 1.5, …). Per-location id override wins,
 *  else the strongest matching tag amplitude, else 1.0. Cap clamped 8..24. */
export function effectiveVectorCap(location, table = {}) { // registry:internal
  const va = table.vectorAlignment || {};
  const baseline = va.baselineCap ?? va.params?.cap ?? DEFAULT_VECTOR.cap;
  const amp = va.amplitude;
  let amplitude = 1.0;
  if (amp) {
    if (amp.byLocationId && amp.byLocationId[location?.id] != null) {
      amplitude = amp.byLocationId[location.id];
    } else if (amp.byTag) {
      for (const tag of canonTags(location, table.tagAliases || {})) {
        if (amp.byTag[tag] != null) amplitude = Math.max(amplitude, amp.byTag[tag]);
      }
    }
  }
  return Math.max(8, Math.min(24, Math.round(baseline * amplitude)));
}

/** Capped alignment between the action's axes and the place's STRONG spectrum axes.
 *  Sign match eases (+), opposition hardens (−); weighted by how strongly the place tilts.
 *  The cap is the location's amplitude-scaled effective cap (Aevi tuning). */
export function vectorAffinity(location, action, table = {}, { vectorsKnown = [] } = {}) {
  const params = { ...DEFAULT_VECTOR, ...(table.vectorAlignment?.params || {}) };
  const spec = location?.spectrum || {};
  const axes = action?.axes || {};
  let raw = 0;
  const alignedAxes = [];
  for (const [ax, lv] of Object.entries(spec)) {
    if (Math.abs(lv) < params.strongThreshold) continue; // only STRONG axes are felt
    const av = axes[ax];
    if (!av) continue;
    const match = Math.sign(av) === Math.sign(lv);
    raw += (match ? 1 : -1) * Math.abs(lv);
    alignedAxes.push({ ax, match, known: (vectorsKnown || []).includes(ax) });
  }
  const cap = effectiveVectorCap(location, table);
  const bonus = Math.max(-cap, Math.min(cap, Math.round(raw * params.scale)));
  return { bonus, alignedAxes, params, cap };
}

/** Combined location modifier + the pieces needed to explain it. */
export function locationAffinity(location, action, table = {}, ctx = {}) {
  const t = typeAffinity(location, action, table);
  const v = vectorAffinity(location, action, table, ctx);
  return {
    bonus: t.bonus + v.bonus,
    typeBonus: t.bonus, vectorBonus: v.bonus,
    typeNotes: t.notes, vectorAxes: v.alignedAxes
  };
}

/** Short player-facing strings for the roll receipt. Vector detail only names axes the
 *  player has PERCEIVED (SNG-011 vectorsKnown); otherwise it's the honest-but-vague
 *  "the place favored/resisted this." */
export function affinityReceipt(aff) {
  const bits = [];
  for (const n of aff.typeNotes || []) {
    const label = n.key.startsWith("attr_") ? n.key.slice(5) : n.key.replace(/_/g, " ");
    bits.push(`${n.val > 0 ? "+" : ""}${n.val} ${label} here`);
  }
  if (aff.vectorBonus) {
    const known = (aff.vectorAxes || []).filter(a => a.known);
    if (known.length) {
      bits.push(`${aff.vectorBonus > 0 ? "+" : ""}${aff.vectorBonus} aligned to ${known.map(a => a.ax.replace(/_/g, "/")).join(", ")}`);
    } else {
      bits.push(`the place ${aff.vectorBonus > 0 ? "favored" : "resisted"} this (${aff.vectorBonus > 0 ? "+" : ""}${aff.vectorBonus})`);
    }
  }
  return bits;
}
