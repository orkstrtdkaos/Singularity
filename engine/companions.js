// companions.js — traveling companions: present in every scene, voiced by the GM,
// mechanically helpful where their nature fits. Companion definitions are content
// (content/packs/*/companions/); a character carries only the ids of who travels
// with them. Same law as everywhere: data describes, engine computes, GM narrates.

/** Assist bonus: +N once per companion whose assistTags intersect the action's
 *  intent tags (capped). Data-driven from rules.baseChance. */
export function companionBonus(activeCompanions, actionTags = [], rules) {
  const per = rules.baseChance.companionBonus ?? 5;
  const cap = rules.baseChance.companionBonusCap ?? 10;
  let bonus = 0;
  const helpers = [];
  for (const c of activeCompanions || []) {
    if ((c.assistTags || []).some(t => actionTags.includes(t))) {
      bonus += per;
      helpers.push(c.name);
    }
  }
  return { bonus: Math.min(cap, bonus), helpers };
}

/** Context block for the GM prompt describing everyone traveling with the character. */
export function companionsForGM(activeCompanions) {
  if (!activeCompanions?.length) return null;
  return activeCompanions.map(c =>
    `### ${c.name} — ${c.role}\nAppearance: ${c.appearance}\nPersona: ${c.persona}\nVoice: ${c.voiceHints}\nKnows: ${(c.knowledge || []).join("; ")}\nBoundaries: ${c.boundaries}\n${c.hooks || ""}`
  ).join("\n\n");
}

/** Resolve a character's companion ids against the loaded content. */
export function activeCompanions(character, companionCatalog = {}) {
  return (character.companions || []).map(id => companionCatalog[id]).filter(Boolean);
}
