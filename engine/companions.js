// companions.js — traveling companions: present in every scene, voiced by the GM,
// mechanically helpful where their nature fits. Companion definitions are content
// (content/packs/*/companions/); a character carries only the ids of who travels
// with them. Same law as everywhere: data describes, engine computes, GM narrates.

/** Assist bonus: +N once per companion whose assistTags intersect the action's
 *  intent tags (capped). Data-driven from rules.baseChance. */
export function ensureBonds(character) {
  character.companionBonds = character.companionBonds || {};
  return character;
}

export function bondOf(character, companionId, rules) {
  const b = character.companionBonds?.[companionId] ?? 0;
  const stage2At = rules?.companions?.tiers?.stage2At ?? 8;
  return { bond: b, stage: b >= stage2At ? 2 : 1 };
}

/** Grow a bond through shared life: deeds witnessed, assists used, encounters
 *  weathered. GM has NO op for this — engine-owned entirely. Returns events. */
export function growBond(character, companionId, kind, rules) {
  ensureBonds(character);
  const g = rules?.companions?.bondGrowth?.[kind] ?? 0;
  const before = character.companionBonds[companionId] ?? 0;
  const after = Math.max(-10, Math.min(10, Math.round((before + g) * 100) / 100));
  character.companionBonds[companionId] = after;
  const t = rules?.companions?.tiers || {};
  const events = [];
  if (before < (t.grantAt ?? 6) && after >= (t.grantAt ?? 6)) events.push("grant");
  if (before < (t.stage2At ?? 8) && after >= (t.stage2At ?? 8)) events.push("stage2");
  return { bond: after, events };
}

export function companionBonus(activeCompanions, actionTags = [], rules, character = null) {
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
  let effCap = cap;
  if (character) {
    const t = rules?.companions?.tiers || {};
    if ((activeCompanions || []).some(c => (character.companionBonds?.[c.id] ?? 0) >= (t.assistCapBonusAt ?? 3))) {
      effCap = cap + (t.assistCapBonus ?? 3);
    }
  }
  return { bonus: Math.min(effCap, bonus), helpers };
}

/** Context block for the GM prompt describing everyone traveling with the character. */
export function companionsForGM(activeCompanions, character = null, rules = null) {
  if (!activeCompanions?.length) return null;
  return activeCompanions.map(c => {
    const b = character && rules ? bondOf(character, c.id, rules) : null;
    const stageDef = b && c.stages ? c.stages.find(st => st.stage === b.stage) : null;
    const bondLine = b ? `\nBond with the character: ${b.bond} (${b.bond >= 6 ? "deep" : b.bond >= 3 ? "grown" : b.bond <= -3 ? "strained" : "forming"}), stage ${b.stage}${stageDef ? ` "${stageDef.name}" — ${stageDef.narrationHints}` : ""}` : "";
    return companionLine(c) + bondLine;
  }).join("\n\n");
}

function companionLine(c) {
  return (c =>
    `### ${c.name} — ${c.role}\nAppearance: ${c.appearance}\nPersona: ${c.persona}\nVoice: ${c.voiceHints}\nKnows: ${(c.knowledge || []).join("; ")}\nBoundaries: ${c.boundaries}\n${c.hooks || ""}`
  )(c);
}

/** Resolve a character's companion ids against the loaded content. */
export function activeCompanions(character, companionCatalog = {}) {
  // SNG-057: entries are string ids (recruitment/backfill shape); the player's chosen name lives in
  // character.companionNames[id] (an object entry with displayName is also honored, defensively).
  // A renamed companion presents as `name` (GM + portraits use it); its authored name is kept.
  const names = character.companionNames || {};
  return (character.companions || []).map(entry => {
    const id = typeof entry === "string" ? entry : entry?.id;
    const base = companionCatalog[id];
    if (!base) return null;
    const dn = names[id] || (typeof entry === "object" ? entry.displayName : null);
    return dn ? { ...base, name: dn, canonicalName: base.name } : base;
  }).filter(Boolean);
}
