// companions.js — traveling companions: present in every scene, voiced by the GM,
// mechanically helpful where their nature fits. Companion definitions are content
// (content/packs/*/companions/); a character carries only the ids of who travels
// with them. Same law as everywhere: data describes, engine computes, GM narrates.

import { isPartnerAdjacent, relationshipLabel } from "./npcs.js";
import { smartClamp } from "./namematch.js"; // SNG-200B §2c: a companion's witnessed-deed memory is model prose

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
  // ⛔ SNG-361 — THE HONEST MARK ON A SAVE THAT PREDATES THE LOG. Silas has bond 10 with three
  // companions and no record of how or when he got there, and there is no reconstruction that would not be
  // a guess wearing a number's clothes. So the save is STAMPED rather than backfilled:
  //   bondLogFrom: null  → this character's bond history is UNKNOWABLE; every derived figure is a bound.
  //   bondLogFrom: <n>   → logging began at action n; figures after it are founded.
  // ⚠️ A character with existing bonds gets `null` even though logging starts now, because the part
  // that matters — how long they have been at 10 — is exactly the part that was never written down.
  if (character.bondLogFrom === undefined) {
    const hadBonds = Object.values(character.companionBonds).some(v => Number(v) !== 0);
    character.bondLogFrom = hadBonds ? null : (Number.isFinite(character.actionCount) ? character.actionCount : 0);
  }
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

const COMPANION_MEMORY_CAP = 12;
/** SNG-200B §2c: a companion GAINS MEMORY — it carries the deeds it witnessed at your side, so it can refer
 *  to your shared history in character ("it did not leave, and it did not lie to you"). Erik named this: a
 *  companion that cannot refer to what it has been through is being relabelled, not evolving. Each active
 *  companion witnesses each deed of the turn; the memory keeps the most SIGNIFICANT (by |weight|, oldest
 *  dropped first) up to a cap, in chronological order for narration. Deduped on text. Returns the entry or null. */
export function noteCompanionWitnessed(character, companionId, deed) {
  if (!companionId || !deed?.description) return null;
  character.companionMemory = character.companionMemory || {};
  const mem = character.companionMemory[companionId] || (character.companionMemory[companionId] = []);
  const entry = { text: smartClamp(String(deed.description), 200), weight: Math.max(-3, Math.min(3, deed.weight | 0)), day: deed.day ?? null };
  if (mem.some(m => m.text === entry.text)) return null; // already remembered
  mem.push(entry);
  if (mem.length > COMPANION_MEMORY_CAP) {
    // drop the LEAST significant (lowest |weight|, oldest on a tie) — keep what mattered, stay chronological
    let worst = 0;
    for (let i = 1; i < mem.length; i++) {
      const less = Math.abs(mem[i].weight) < Math.abs(mem[worst].weight);
      const tie = Math.abs(mem[i].weight) === Math.abs(mem[worst].weight) && (mem[i].day ?? 0) < (mem[worst].day ?? 0);
      if (less || tie) worst = i;
    }
    mem.splice(worst, 1);
  }
  return entry;
}

/** SNG-200B §2c: the companion's remembered shared history, for the GM — so it speaks to what it lived
 *  through with the character, not just what it can do. The most recent few, in the companion's voice-frame. */
export function companionMemoryForGM(character, companionId) {
  const mem = character?.companionMemory?.[companionId];
  if (!mem?.length) return null;
  return mem.slice(-4).map(m => m.text).join("; ");
}

/** Grow a bond through shared life: deeds witnessed, assists used, encounters
 *  weathered. GM has NO op for this — engine-owned entirely. Returns events. */
export function growBond(character, companionId, kind, rules, stages = null, opts = {}) {
  ensureBonds(character);
  const g = rules?.companions?.bondGrowth?.[kind] ?? 0;
  const before = character.companionBonds[companionId] ?? 0;
  const after = Math.max(-10, Math.min(10, Math.round((before + g) * 100) / 100));
  character.companionBonds[companionId] = after;
  // ⛔ SNG-361 — THE APPEND-ONLY BOND LOG. `companionBonds` is a SCALAR: {marrow: 10}. No history, no
  // timestamps, no per-source counter. Encounters (+1.5, the dominant source) and assists (+0.25) mutated
  // it and vanished, so the question "what fraction of the campaign was spent at max bond" had no
  // answerable form — and both of us answered it anyway. Aevi's 83% was inferred and labelled measured;
  // my rebuild on deed timestamps got ≥30%, founded but a LOWER BOUND on an unmeasurable, because deeds
  // are the slowest of the three sources and the only one that leaves a trace.
  //
  // ⚠️ `actionCount` IS THE LOAD-BEARING FIELD (her words, and she is right): it is the unit the
  // harness plots against and the unit Erik feels. Day alone cannot answer "what fraction of the campaign."
  //
  // ⚠️ ONE LOG FOR ONE MEASUREMENT. Explicitly not event-sourcing character state — this exists
  // because a single figure was declared load-bearing and turned out unreadable. If the same gap appears
  // for standing or aptitudes that is its own finding, not a licence to generalise from here.
  if (g) {
    character.bondLog = Array.isArray(character.bondLog) ? character.bondLog : [];
    character.bondLog.push({ companionId, kind, delta: Math.round(g * 100) / 100,
      day: character.clock?.day ?? null, worldDay: opts.worldDay ?? null, actionCount: character.actionCount ?? null });
  }
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
    // SNG-200B §2c: the companion's MEMORY — what it has been through with you, to speak to as shared history.
    const memory = character ? companionMemoryForGM(character, c.id) : null;
    const memLine = memory ? `\nWhat it has witnessed at your side (its memory — let it refer to this as shared history, in character; never as a list): ${memory}` : "";
    return companionLine(c) + bondLine + memLine;
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

/** SNG-361 — IS THIS CHARACTER'S BOND HISTORY FOUNDED, OR A BOUND?
 *
 *  ⛔ EXISTING SAVES CANNOT BE BACKFILLED AND MUST NOT BE FAKED. A character who played before the log
 *  existed has a real bond and no record of how it got there; reconstructing one would produce exactly the
 *  kind of authoritative-looking inference this ticket exists to correct. So the harness is told which it
 *  is holding, and reports them differently.
 *
 *  Returns { founded, events, firstActionCount } — `founded: false` means every figure derived from this
 *  character is a LOWER BOUND, and should be printed as one. */
export function bondLogStatus(character) {
  const log = Array.isArray(character?.bondLog) ? character.bondLog : null;
  // ⚠️ A LOG THAT STARTED MID-CAMPAIGN IS NOT A FOUNDED HISTORY. `bondLogFrom === null` means this
  // character was already bonded when logging began, so entries exist but the interval that answers the
  // question does not. Having SOME data is the most dangerous version of having none.
  //
  // ⛔ AND THE STAMP IS NOT THE ONLY EVIDENCE — the first version of this trusted `bondLogFrom` alone and
  // reported Silas, who sits at bond 10 with three companions, as "no bond has ever grown". The stamp is
  // written by `ensureBonds` at load; a save read cold off disk has never been through it. So the bond
  // values themselves are the second witness: BONDED WITH NO LOG means the history is gone, whatever the
  // stamp says. A diagnostic that mislabels its own worst case is worse than no diagnostic.
  const bonded = Object.values(character?.companionBonds || {}).some(v => Number(v) !== 0);
  if (character?.bondLogFrom === null || (bonded && !log?.length)) {
    return { founded: false, events: log?.length || 0, firstActionCount: null, why: "bonded before the log existed — history unrecoverable" };
  }
  if (!log || !log.length) return { founded: false, events: 0, firstActionCount: null, why: "no bond has ever grown" };
  const first = log.find(e => Number.isFinite(e?.actionCount));
  return { founded: true, events: log.length, firstActionCount: first ? first.actionCount : null };
}

/** The share of the campaign spent at or above a bond level — the figure SNG-354 asserted and could not
 *  source. ⚠️ Returns null rather than a number when the log cannot answer, which is the whole point:
 *  a metric that cannot be measured must say so instead of producing something plausible. */
export function shareAtOrAbove(character, companionId, level, { actionCount = null } = {}) {
  const st = bondLogStatus(character);
  const total = Number.isFinite(actionCount) ? actionCount : character?.actionCount;
  if (!st.founded || !Number.isFinite(total) || total <= 0) return null;
  let running = 0, reachedAt = null;
  for (const e of character.bondLog) {
    if (e.companionId !== companionId) continue;
    running += Number(e.delta) || 0;
    if (running >= level && reachedAt === null) reachedAt = Number.isFinite(e.actionCount) ? e.actionCount : null;
  }
  if (reachedAt === null) return { reached: false, share: 0, reachedAtAction: null };
  return { reached: true, reachedAtAction: reachedAt, share: Math.max(0, (total - reachedAt) / total) };
}
