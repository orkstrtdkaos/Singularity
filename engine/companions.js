// companions.js — traveling companions: present in every scene, voiced by the GM,
// mechanically helpful where their nature fits. Companion definitions are content
// (content/packs/*/companions/); a character carries only the ids of who travels
// with them. Same law as everywhere: data describes, engine computes, GM narrates.

import { isPartnerAdjacent, relationshipLabel } from "./npcs.js";

/** SNG-108: romantic partners at the party-adjacent stage travel with you in all but the mechanics.
 *  They are NOT recruited companions (no catalog def / assistTags) — they're a companion by
 *  RELATIONSHIP, surfaced with their bond stage so "his woman, basically in the party" reads true. */
export function partnerAdjacentNpcs(character, rules = null) {
  return Object.values(character?.npcRegistry || {})
    .filter(n => isPartnerAdjacent(n, rules) && n.status !== "dead" && n.status !== "departed")
    .map(n => ({ id: n.id, name: n.name, label: relationshipLabel(n), status: n.status }));
}

/** Assist bonus: +N once per companion whose assistTags intersect the action's
 *  intent tags (capped). Data-driven from rules.baseChance. */
export function ensureBonds(character) {
  character.companionBonds = character.companionBonds || {};
  return character;
}

/** SNG-200 §1: how many milestone stages this companion's CONTENT authors (default 1). */
export function companionStageCount(stages) {
  return Array.isArray(stages) && stages.length ? stages.length : 1;
}

/** SNG-200 §1: the bond thresholds at which stages 2..n unlock. Before this the code knew exactly TWO
 *  stages — so Marrow's authored third stage was unreachable and a bond of 10 sat inert at stage 2 forever
 *  (Huginn). The final authored stage now reaches the TOP of the bond scale (`maxBond`); stage 2 stays at
 *  the authored `stage2At` so no existing save's stage regresses; middle stages spread linearly between.
 *  Returns thresholds for stages 2,3,…,n (length n-1). Pure. */
export function companionStageThresholds(stageCount, rules) {
  const n = Math.max(1, stageCount | 0);
  if (n <= 1) return [];
  const t = rules?.companions?.tiers || {};
  const s2 = t.stage2At ?? 8;
  const top = t.maxBond ?? 10;                 // the final authored stage lands here — the scale reaches it
  if (n === 2) return [s2];                     // one milestone — unchanged, no regression
  const out = [];
  for (let k = 2; k <= n; k++) out.push(Math.round(s2 + (top - s2) * (k - 2) / (n - 2)));
  return out;
}

/** SNG-200 §1: the stage a bond has reached against this companion's authored stage count. Pure. */
export function companionStageForBond(bond, stageCount, rules) {
  const th = companionStageThresholds(stageCount, rules);
  let stage = 1;
  for (let i = 0; i < th.length; i++) if ((bond ?? 0) >= th[i]) stage = i + 2;
  return Math.min(stage, Math.max(1, stageCount | 0));
}

/** SNG-200: current bond + the stage it has reached. Pass the companion's authored `stages` (the catalog
 *  def's) to use the full ladder; without it, a legacy 2-stage read so a caller lacking the def never breaks. */
export function bondOf(character, companionId, rules, stages = null) {
  const b = character.companionBonds?.[companionId] ?? 0;
  if (stages != null) {
    const n = companionStageCount(stages);
    return { bond: b, stage: companionStageForBond(b, n, rules), stageCount: n };
  }
  const stage2At = rules?.companions?.tiers?.stage2At ?? 8;
  return { bond: b, stage: b >= stage2At ? 2 : 1, stageCount: 2 };
}

/** SNG-200 §4: the codex payload for a companion — a person node that accumulates who they are and the
 *  stage the relationship has reached. ⛔ NEVER carries `hooks` (GM-eyes-only, §5) — only player-facing
 *  stage prose. entityId is companion-namespaced so it never collides with a same-named NPC. Pure. */
export function companionCodexUpdate(c, bondInfo = null) {
  const stageDef = bondInfo && Array.isArray(c?.stages) ? c.stages.find(st => st.stage === bondInfo.stage) : null;
  const fact = stageDef ? `${stageDef.name} — ${stageDef.narrationHints || ""}`.trim().replace(/ —\s*$/, "") : (c?.role || "travels with you");
  return { entityId: `companion-${c?.id || c?.canonicalName || c?.name || "unknown"}`, label: c?.name || "A companion", kind: "person", fact };
}

/** Grow a bond through shared life: deeds witnessed, assists used, encounters
 *  weathered. GM has NO op for this — engine-owned entirely. Returns events. */
export function growBond(character, companionId, kind, rules, stages = null) {
  ensureBonds(character);
  const g = rules?.companions?.bondGrowth?.[kind] ?? 0;
  const before = character.companionBonds[companionId] ?? 0;
  const after = Math.max(-10, Math.min(10, Math.round((before + g) * 100) / 100));
  character.companionBonds[companionId] = after;
  const t = rules?.companions?.tiers || {};
  const events = [];
  if (before < (t.grantAt ?? 6) && after >= (t.grantAt ?? 6)) events.push("grant");
  // SNG-200 §1: a stage event for EVERY authored stage the bond just crossed (was only ever "stage2").
  // The legacy "stage2" is kept alongside "stage:2" so any existing reader still fires.
  const n = stages != null ? companionStageCount(stages) : 2;
  const th = companionStageThresholds(n, rules);
  for (let i = 0; i < th.length; i++) {
    if (before < th[i] && after >= th[i]) {
      events.push(`stage:${i + 2}`);
      if (i + 2 === 2) events.push("stage2");
    }
  }
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
    const b = character && rules ? bondOf(character, c.id, rules, c.stages) : null;
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
