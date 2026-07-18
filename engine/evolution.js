// evolution.js — SNG-010C. Some items wake through a companion bond. An item may
// carry evolution:{bondSource, coUseTag, stages[]}; a stage unlocks when the linked
// companion's bond >= stage.unlockBond AND the item×companion co-activation count
// (channeling a cast through the item with that companion present) >= stage.unlockCoUse.
//
// Design law 1: the engine gates the stage entirely from durable state; the GM only
// narrates the waking. Stage definitions live in the CONTENT catalog (never copied
// into saves) — the save holds just the co-use tally + the current evoStage stamp.

import { ensurePractice } from "./practice.js";

export function coUseKey(itemId, companionId) { return `${itemId}+${companionId}`; } // registry:internal

/** Count a shared cast (item × companion co-activation) in the practice ledger. */
export function recordCoUse(character, itemId, companionId, n = 1) {
  ensurePractice(character);
  if (!character.practice.coUse) character.practice.coUse = {};
  const k = coUseKey(itemId, companionId);
  character.practice.coUse[k] = (character.practice.coUse[k] || 0) + n;
  return character.practice.coUse[k];
}

export function coUseCount(character, itemId, companionId) {
  return character.practice?.coUse?.[coUseKey(itemId, companionId)] || 0;
}

function bondValue(character, companionId) {
  return character.companionBonds?.[companionId] ?? 0;
}

export function evolutionOf(itemId, catalog = {}) { // registry:internal
  return catalog[itemId]?.evolution || null;
}

/** The highest currently-unlocked stage object for an evolving item, or null. A stage
 *  unlocks only when BOTH the bond band AND the co-use count are met. */
export function currentStage(itemId, character, catalog = {}) {
  const evo = evolutionOf(itemId, catalog);
  if (!evo || !Array.isArray(evo.stages) || !evo.stages.length) return null;
  const companionId = evo.bondSource;
  const bond = bondValue(character, companionId);
  const co = coUseCount(character, itemId, companionId);
  let best = evo.stages[0];
  for (const s of evo.stages) {
    if (bond >= (s.unlockBond || 0) && co >= (s.unlockCoUse || 0) && (s.stage || 0) >= (best.stage || 0)) best = s;
  }
  return best;
}

/** Stamp each evolving inventory item with its current stage + effective bonusTags.
 *  Idempotent. Returns the items that ADVANCED this pass (for a waking narration). */
export function refreshEvolvingItems(character, catalog = {}) {
  const advanced = [];
  for (const item of character.inventory || []) {
    const evo = evolutionOf(item.id, catalog);
    if (!evo) continue;
    const stage = currentStage(item.id, character, catalog);
    if (!stage) continue;
    const prev = item.evoStage || 0;
    if ((stage.stage || 0) !== prev) {
      if ((stage.stage || 0) > prev) {
        advanced.push({ itemId: item.id, itemName: item.name, stage: stage.stage, stageName: stage.name, narrationHints: stage.narrationHints, grant: stage.grant, description: stage.description });
      }
      item.evoStage = stage.stage;
      item.evoStageName = stage.name;
      if (Array.isArray(stage.bonusTags)) item.bonusTags = [...stage.bonusTags];
    } else if (!item.bonusTags && Array.isArray(stage.bonusTags)) {
      item.bonusTags = [...stage.bonusTags];
      item.evoStageName = stage.name;
    }
  }
  return advanced;
}

/** On a cast (any ability use), count a co-use for every evolving item whose bond-source
 *  companion is currently travelling with the character, then refresh stages. Returns
 *  the items that advanced. */
export function noteCoUseAndRefresh(character, { usedAbilityIds = [], activeCompanionIds = [], catalog = {} }) {
  ensurePractice(character);
  const cast = (usedAbilityIds || []).length > 0;
  if (cast) {
    for (const item of character.inventory || []) {
      const evo = evolutionOf(item.id, catalog);
      if (evo && activeCompanionIds.includes(evo.bondSource)) recordCoUse(character, item.id, evo.bondSource);
    }
  }
  return refreshEvolvingItems(character, catalog);
}

/** GM context: the current stage + narration for each evolving item the character holds,
 *  including how close it is to waking further (so the GM can foreshadow). */
export function evolvedItemsForGM(character, catalog = {}) {
  const lines = [];
  for (const item of character.inventory || []) {
    const evo = evolutionOf(item.id, catalog);
    if (!evo) continue;
    const stage = currentStage(item.id, character, catalog);
    if (!stage) continue;
    const companionId = evo.bondSource;
    const bond = bondValue(character, companionId);
    const co = coUseCount(character, item.id, companionId);
    const next = (evo.stages || []).find(s => (s.stage || 0) > (stage.stage || 0));
    lines.push(
      `${item.name} — Stage ${stage.stage} "${stage.name}": ${stage.narrationHints || stage.description}` +
      (stage.grant ? ` GRANT: ${stage.grant}` : "") +
      (next ? ` [waking toward "${next.name}" when ${companionId}'s bond reaches ${next.unlockBond} and you've cast through it together ${next.unlockCoUse}× — now bond ${bond}, ${co} shared casts]` : " [fully awake]")
    );
  }
  return lines.length ? lines.join("\n") : null;
}
