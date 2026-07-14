// practice.js — SNG-010: competency is the residue of attention over time.
// An engine-owned ledger counts ability uses and co-activations; aspirations
// declare what you're working toward; thresholds unlock ranks and learning at
// zero skill-point cost. Emergence (Phase B) reads this ledger against AUTHORED
// recipe/branch templates — the engine mints, the model only offers words.

import { discoveryKey, knownDiscovery, recordDiscovery } from "./progression.js";

export function ensurePractice(character) {
  if (!character.practice) character.practice = { schemaVersion: 1, uses: {}, coActivations: {}, aspirations: [] };
  return character;
}

/** Single counting site: call once per validated ability resolution.
 *  2+ abilities in one action increments every pair's co-activation. */
export function recordUse(character, abilityIds = []) {
  ensurePractice(character);
  const ids = [...new Set(abilityIds.filter(Boolean))];
  for (const id of ids) character.practice.uses[id] = (character.practice.uses[id] || 0) + 1;
  if (ids.length >= 2) {
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const key = discoveryKey([ids[i], ids[j]]);
      character.practice.coActivations[key] = (character.practice.coActivations[key] || 0) + 1;
    }
  }
  return character.practice;
}

// ---------- aspirations ----------

export function declareAspiration(character, abilityId, rules) {
  ensurePractice(character);
  const max = rules.practice?.maxAspirations ?? 2;
  if (character.practice.aspirations.some(a => a.abilityId === abilityId)) return { ok: false, why: "already aspired" };
  if ((character.abilities || []).some(a => a.abilityId === abilityId)) return { ok: false, why: "already known" };
  if (character.practice.aspirations.length >= max) return { ok: false, why: `at most ${max} aspirations` };
  character.practice.aspirations.push({ abilityId, since: new Date().toISOString(), progress: 0 });
  return { ok: true };
}

export function dropAspiration(character, abilityId) {
  ensurePractice(character);
  character.practice.aspirations = character.practice.aspirations.filter(a => a.abilityId !== abilityId);
}

/** Relevant activity feeds an aspiration: using a component/same-tradition
 *  ability, or acting into the target's effectTags. Called once per resolution. */
export function recordAspirationProgress(character, action, catalog) {
  ensurePractice(character);
  for (const asp of character.practice.aspirations) {
    const target = catalog[asp.abilityId];
    if (!target) continue;
    const usedIds = [action.abilityId, ...(action.comboAbilities || [])].filter(Boolean);
    const sameSystem = usedIds.some(id => catalog[id]?.powerSystem === target.powerSystem);
    const intoTags = (action.tags || action.intentTags || []).some(t => (target.effectTags || []).includes(t));
    if (sameSystem || intoTags) asp.progress = (asp.progress || 0) + 1;
  }
}

/** Fully practiced aspiration + levelReq met → learning is FREE (100% discount). */
export function aspirationRipe(character, abilityId, rules) {
  const asp = character.practice?.aspirations?.find(a => a.abilityId === abilityId);
  return !!asp && (asp.progress || 0) >= (rules.practice?.aspirationRipe ?? 10);
}

// ---------- use-ranking ----------

/** Practiced enough for the next rank? (levelReq still gates via rankUpAbility.) */
export function practiceRankReady(character, abilityId, rules) {
  const owned = (character.abilities || []).find(a => a.abilityId === abilityId);
  if (!owned) return false;
  const next = owned.level + 1;
  const need = rules.practice?.useRankThreshold?.[String(next)];
  if (!need) return false;
  return (character.practice?.uses?.[abilityId] || 0) >= need;
}

// ---------- emergence (Phase B): the rarity gradient, read from the ledger ----------

/** Tier 2 (common): authored combo recipes whose co-activation has ripened. */
export function ripeCombos(character, recipesFile, rules) {
  const out = [];
  for (const r of recipesFile?.recipes || []) {
    if (r.tier !== "combo") continue;
    const key = discoveryKey(r.components);
    if ((character.practice?.coActivations?.[key] || 0) < (r.ripenAt ?? 6)) continue;
    const ranksOk = Object.entries(r.requires || {}).every(([id, rank]) =>
      (character.abilities || []).some(a => a.abilityId === id && a.level >= rank));
    if (!ranksOk) continue;
    if (knownDiscovery(character, r.components) || (character.discoveries || []).some(d => d.recipeId === r.id)) continue;
    out.push(r);
  }
  return out;
}

/** Tier 1 (most common): branch templates whose use-count has ripened. */
export function ripeBranches(character, recipesFile) {
  const out = [];
  for (const t of recipesFile?.branchTemplates || []) {
    const owned = (character.abilities || []).find(a => a.abilityId === t.growsAbility);
    if (!owned || owned.level < (t.requiresRank ?? 1)) continue;
    if ((character.practice?.uses?.[t.growsAbility] || 0) < (t.ripenAt ?? 8)) continue;
    if ((owned.branches || []).some(b => b.id === t.id)) continue;
    out.push(t);
  }
  return out;
}

// ---------- ability-arch v2: axis-touch combination unlock (action-pattern) ----------

/** Has the narrative threshold for an axis-touch combination been met? Reuses the live co-activation
 *  model (~6, like a combo recipe's ripenAt). The combination's `unlockCondition` carries the machine
 *  trigger: `components` (ability ids whose co-activation counts) or `viaAbilities` (ids whose combined
 *  uses count). A prose-only `unlockCondition` (schema default) is NOT engine-computable — returns false
 *  so the GM or character-creation surfaces it instead. Proximity is intentionally absent (no counter). */
export function combinationThresholdMet(character, abilityDef, rules) {
  const uc = abilityDef?.unlockCondition;
  if (!uc) return false;
  const need = uc.ripenAt ?? rules?.practice?.combinationRipenAt ?? 6;
  if (Array.isArray(uc.components) && uc.components.length >= 2) {
    return (character.practice?.coActivations?.[discoveryKey(uc.components)] || 0) >= need;
  }
  if (Array.isArray(uc.viaAbilities) && uc.viaAbilities.length) {
    const total = uc.viaAbilities.reduce((s, id) => s + (character.practice?.uses?.[id] || 0), 0);
    return total >= need;
  }
  return false;
}

/** Pre-authored axis-touch combinations whose action-pattern threshold is now met and which the
 *  character doesn't yet own — the GM may surface these as available to claim (a point spend walks the
 *  door the narrative opened). Empty until combinations are authored + tagged. */
export function ripeAxisTouchCombinations(character, catalog, rules) {
  const owned = new Set((character.abilities || []).map(a => a.abilityId));
  const out = [];
  for (const ab of Object.values(catalog || {})) {
    if (!ab || ab.nativeOrCombination !== "combination" || owned.has(ab.id)) continue;
    if (combinationThresholdMet(character, ab, rules)) out.push(ab);
  }
  return out;
}

/** One-line RIPE notice for the GM — it may OFFER these in-fiction and nothing else. */
export function emergenceNoticeForGM(character, recipesFile, rules) {
  const combos = ripeCombos(character, recipesFile, rules).map(r => `- RIPE combo "${r.id}": ${r.name} (${r.components.join(" + ")}) — ${r.discoveredBlurb || r.description.slice(0, 100)}`);
  const branches = ripeBranches(character, recipesFile).map(t => `- RIPE branch "${t.id}": ${t.name} (grows ${t.growsAbility}) — ${t.grants.slice(0, 100)}`);
  const lines = [...combos, ...branches];
  return lines.length ? lines.join("\n") : null;
}

/** Accept a ripe combo: mint via the existing discovery path. Engine-validated. */
export function acceptCombo(character, recipe, customName = null, day = null) {
  const d = recordDiscovery(character, {
    name: customName || recipe.name,
    description: recipe.description,
    abilityIds: recipe.components,
    noveltyHint: recipe.id,
    day
  });
  if (d) {
    d.recipeId = recipe.id;
    d.energyCost = recipe.energyCost;
    d.notFor = recipe.notFor;
  }
  return d;
}

/** Accept a ripe branch: attach the specialization to the owned ability. Free. */
export function acceptBranch(character, template) {
  const owned = (character.abilities || []).find(a => a.abilityId === template.growsAbility);
  if (!owned) return null;
  owned.branches = owned.branches || [];
  if (owned.branches.some(b => b.id === template.id)) return null;
  const b = { id: template.id, name: template.name, grants: template.grants, cannot: template.cannot };
  owned.branches.push(b);
  return b;
}

/** Clamp an emergence reference: only engine-flagged-ripe ids are actionable. */
export function validEmergenceId(character, recipesFile, rules, id) {
  return ripeCombos(character, recipesFile, rules).find(r => r.id === id) ||
         ripeBranches(character, recipesFile).find(t => t.id === id) || null;
}
