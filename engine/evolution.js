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
/** ✅ R45c (2026-09-05) — EVERY FUNCTION HERE TAKES A BEARER, NOT A CHARACTER. It always read exactly three fields
 *  (`practice.coUse`, `inventory`, `companionBonds`) so it was bearer-shaped from the day it was written; what it lacked
 *  was anyone else who had them. A registry entry now can (`npcs.ensureBearer`), so a spear in Pell's hands is a record.
 *
 *  ⚑ AND THE BOND IS READ WHERE THE BOND LIVES. Memory answers to Huginn, and Huginn is SILAS's companion — the bond is
 *  his, not Pell's. `bonds` defaults to the bearer, so every existing player call is byte-identical; an NPC bearer is
 *  passed the player, which is the fiction: she carries it, and it answers to the bond he holds. */
export function recordCoUse(bearer, itemId, companionId, n = 1) {
  ensurePractice(bearer);
  if (!bearer.practice.coUse) bearer.practice.coUse = {};
  const k = coUseKey(itemId, companionId);
  bearer.practice.coUse[k] = (bearer.practice.coUse[k] || 0) + n;
  return bearer.practice.coUse[k];
}

export function coUseCount(bearer, itemId, companionId) {
  return bearer?.practice?.coUse?.[coUseKey(itemId, companionId)] || 0;
}

function bondValue(bonds, companionId) {
  return bonds?.companionBonds?.[companionId] ?? 0;
}

export function evolutionOf(itemId, catalog = {}) { // registry:internal
  return catalog[itemId]?.evolution || null;
}

/** The highest currently-unlocked stage object for an evolving item, or null. A stage
 *  unlocks only when BOTH the bond band AND the co-use count are met. */
export function currentStage(itemId, bearer, catalog = {}, { bonds = bearer } = {}) {
  const evo = evolutionOf(itemId, catalog);
  if (!evo || !Array.isArray(evo.stages) || !evo.stages.length) return null;
  const companionId = evo.bondSource;
  const bond = bondValue(bonds, companionId);
  const co = coUseCount(bearer, itemId, companionId);
  let best = evo.stages[0];
  for (const s of evo.stages) {
    if (bond >= (s.unlockBond || 0) && co >= (s.unlockCoUse || 0) && (s.stage || 0) >= (best.stage || 0)) best = s;
  }
  return best;
}

/** Stamp each evolving inventory item with its current stage + effective bonusTags.
 *  Idempotent. Returns the items that ADVANCED this pass (for a waking narration). */
export function refreshEvolvingItems(bearer, catalog = {}, { bonds = bearer } = {}) {
  const advanced = [];
  for (const item of bearer?.inventory || []) {
    const evo = evolutionOf(item.id, catalog);
    if (!evo) continue;
    const stage = currentStage(item.id, bearer, catalog, { bonds });
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
/** ⚑ CO-USE IS A FACT ABOUT A SCENE, NOT A SEAT (R45c). The item was used and the bond source was present — that is the
 *  fact, and it is true of everyone in the company. `bearers` is who else was there holding things; absent, this is the
 *  player alone and byte-identical to before. Returns the advances across every bearer, each naming who carried it. */
export function noteCoUseAndRefresh(character, { usedAbilityIds = [], activeCompanionIds = [], catalog = {}, bearers = [] }) {
  const all = [character, ...(bearers || []).filter(b => b && b !== character)];
  const cast = (usedAbilityIds || []).length > 0;
  const out = [];
  for (const b of all) {
    ensurePractice(b);
    if (cast) {
      for (const item of b.inventory || []) {
        const evo = evolutionOf(item.id, catalog);
        if (evo && activeCompanionIds.includes(evo.bondSource)) recordCoUse(b, item.id, evo.bondSource);
      }
    }
    for (const a of refreshEvolvingItems(b, catalog, { bonds: character })) {
      out.push(b === character ? a : { ...a, bearerId: b.id || null, bearerName: b.name || null });
    }
  }
  return out;
}

/** GM context: the current stage + narration for each evolving item the character holds,
 *  including how close it is to waking further (so the GM can foreshadow). */
export function evolvedItemsForGM(character, catalog = {}, { bearers = [] } = {}) {
  const lines = [];
  for (const b of [character, ...(bearers || []).filter(x => x && x !== character)])
  for (const item of b.inventory || []) {
    const evo = evolutionOf(item.id, catalog);
    if (!evo) continue;
    const stage = currentStage(item.id, b, catalog, { bonds: character });
    if (!stage) continue;
    const companionId = evo.bondSource;
    const bond = bondValue(character, companionId);
    const co = coUseCount(b, item.id, companionId);
    const held = b === character ? "" : ` (carried by ${b.name || b.id})`;
    const next = (evo.stages || []).find(s => (s.stage || 0) > (stage.stage || 0));
    lines.push(
      `${item.name}${held} — Stage ${stage.stage} "${stage.name}": ${stage.narrationHints || stage.description}` +
      (stage.grant ? ` GRANT: ${stage.grant}` : "") +
      (next ? ` [waking toward "${next.name}" when ${companionId}'s bond reaches ${next.unlockBond} and you've cast through it together ${next.unlockCoUse}× — now bond ${bond}, ${co} shared casts]` : " [fully awake]")
    );
  }
  return lines.length ? lines.join("\n") : null;
}
