// vectors.js — SNG-011 Phase 1: make a location's spectrum character legible to
// the PLAYER (the GM already gets the full vector). A place's strong axes are
// felt by anyone after a visit; subtler (mid) axes need attunement or a
// perceiving ability used there; precursor address_sense reveals ALL exactly.
// Awareness is stored per-place in placeMemory[id].vectorsKnown.

const DEFAULTS = {
  strongThreshold: 0.5,
  midThreshold: 0.3,
  attunementForMid: 6,
  perceivingAbilities: ["prism_sight", "old_roads"],
  fullRevealAbilities: ["address_sense"]
};

function cfg(rules) { return { ...DEFAULTS, ...(rules?.vectors || {}) }; }

/** Human label for one axis reading: "Truth +0.4" / "Chaos −0.6". */
export function vectorLabel(spectrums, axisId, value) {
  const def = (spectrums?.spectrums || []).find(s => s.id === axisId);
  const pole = value >= 0 ? (def?.posPole || axisId) : (def?.negPole || axisId);
  const name = pole.charAt(0).toUpperCase() + pole.slice(1);
  const sign = value >= 0 ? "+" : "−";
  return `${name} ${sign}${Math.abs(value).toFixed(1)}`;
}

/** Fill vectorsKnown as perception fires — on visit (strong axes) and when a
 *  perceiving ability is used here (mid axes; full-reveal → all). Returns count added. */
export function notePerception(character, locationId, location, { visited = false, usedAbilityIds = [] } = {}, rules) {
  const c = cfg(rules);
  character.placeMemory = character.placeMemory || {};
  const pm = character.placeMemory[locationId] || (character.placeMemory[locationId] = { visits: 0, notes: [], flags: {} });
  pm.vectorsKnown = pm.vectorsKnown || [];
  const spectrum = location.spectrum || {};
  const before = pm.vectorsKnown.length;
  const add = ax => { if (!pm.vectorsKnown.includes(ax)) pm.vectorsKnown.push(ax); };

  const full = usedAbilityIds.some(id => c.fullRevealAbilities.includes(id));
  const perceiving = usedAbilityIds.some(id => c.perceivingAbilities.includes(id))
    || (character.attunement || 0) >= c.attunementForMid;

  for (const [ax, v] of Object.entries(spectrum)) {
    const mag = Math.abs(v);
    if (full) add(ax);
    else if (visited && mag >= c.strongThreshold) add(ax);
    else if (perceiving && mag >= c.midThreshold) add(ax);
  }
  return pm.vectorsKnown.length - before;
}

/** The vectors the character is AWARE of at a place, for display. */
export function perceivedVectors(character, locationId, location, spectrums, rules) {
  const c = cfg(rules);
  const known = character.placeMemory?.[locationId]?.vectorsKnown || [];
  const spectrum = location.spectrum || {};
  return known
    .filter(ax => Math.abs(spectrum[ax] || 0) >= c.midThreshold)
    .map(ax => ({ axis: ax, value: spectrum[ax], label: vectorLabel(spectrums, ax, spectrum[ax]) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

/** One-line summary for the map/location panel, or null if nothing perceived. */
export function vectorSummary(character, locationId, location, spectrums, rules) {
  const v = perceivedVectors(character, locationId, location, spectrums, rules);
  if (!v.length) return null;
  return "This place runs " + v.map(x => x.label).join(", ") + ".";
}
