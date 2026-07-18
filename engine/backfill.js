// backfill.js — one-time retroactive credit for characters created before
// engine-XP, companion bonds, and the practice ledger existed. An exact
// action-replay is impossible by design (only summaries persist), so this is a
// PRINCIPLED, CAPPED reconstruction derived from each character's own durable
// state: chronicle, deeds, npc history, quests, abilities, discoveries,
// companions. Idempotent — flagged by character.backfillVersion.

import { applyLevelUps, discoveryKey } from "./progression.js";
import { ensureBonds } from "./companions.js";
import { ensurePractice } from "./practice.js";

export const BACKFILL_VERSION = 1; // registry:internal

export function needsBackfill(character) {
  return (character?.backfillVersion || 0) < BACKFILL_VERSION;
}

/** Estimate "beats lived" — the activity spine everything else scales from. */
export function activitySpine(character) {
  const chronicle = (character.chronicle || []).length;
  const deeds = (character.deeds || []).length;
  const npcHistory = Object.values(character.npcRegistry || {})
    .reduce((n, npc) => n + (npc.history?.length || 0), 0);
  const questsDone = (character.quests || []).filter(q => q.status === "completed").length;
  return { chronicle, deeds, npcHistory, questsDone, beats: chronicle + deeds * 2 + npcHistory + questsDone * 3 };
}

/** Count case-insensitive ability-name mentions across the durable text log. */
function mentionCount(text, name) {
  if (!name) return 0;
  const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return (text.match(re) || []).length;
}

/** Run the backfill in place. Returns a human summary, or null if already done. */
export function runBackfill(character, { rules = {}, abilityCatalog = {}, emergence = {}, companionCatalog = {} } = {}) {
  if (!needsBackfill(character)) return null;
  const bf = rules.backfill || {};
  const spine = activitySpine(character);
  ensureBonds(character);
  ensurePractice(character);

  // ---- 1. XP catch-up (capped; never resets, only credits; re-levels) ----
  const perBeat = bf.xpPerBeat ?? (rules.xp?.success ?? 5) - 1; // ~4
  const maxLevels = bf.maxLevels ?? 3;
  const xpGained = Math.min(maxLevels * (rules.leveling?.xpPerLevel ?? 100), spine.beats * perBeat);
  const levelBefore = character.level;
  character.xp = (character.xp || 0) + xpGained;
  const levelMsgs = applyLevelUps(character, rules);
  const levelsGained = character.level - levelBefore;

  // ---- 2. Companion bonds ----
  const bonds = [];
  const grantCap = bf.bondCap ?? (rules.companions?.tiers?.grantAt ?? 6); // unlock the grant, leave stage-2 to live play
  const bg = rules.companions?.bondGrowth || {};
  for (const cid of character.companions || []) {
    // a companion travels with you through every scene — time-together
    // (chronicle beats) is the strongest signal a bond deepened.
    const estBond = Math.min(grantCap, Math.round(
      spine.deeds * (bg.deed ?? 0.5) + spine.questsDone * (bg.encounter ?? 1.5) + spine.chronicle * (bf.bondPerBeat ?? 0.1)));
    const before = character.companionBonds[cid] || 0;
    if (estBond <= before) { bonds.push({ id: cid, bond: before, granted: false }); continue; }
    character.companionBonds[cid] = estBond;
    // fire the bond-grant ability if the estimate crosses the grant tier
    let granted = false;
    const cdef = companionCatalog[cid];
    const grantAt = rules.companions?.tiers?.grantAt ?? 6;
    if (estBond >= grantAt && cdef?.bondGrants && !(character.abilities || []).some(a => a.abilityId === cdef.bondGrants.id)) {
      const g = cdef.bondGrants;
      character.customAbilities = character.customAbilities || {};
      character.customAbilities[g.id] = { ...g, powerSystem: "learned", levelReq: 1, tree: g.tree || [] };
      character.abilities.push({ abilityId: g.id, level: 1 });
      granted = true;
    }
    bonds.push({ id: cid, name: cdef?.name || cid, bond: estBond, granted });
  }

  // ---- 3. Practice ledger ----
  const textLog = [
    ...(character.chronicle || []),
    ...Object.values(character.npcRegistry || {}).flatMap(n => n.history || []),
    character.bio?.story || ""
  ].join(" \n ");
  let abilitiesSeeded = 0;
  for (const owned of character.abilities || []) {
    const ab = abilityCatalog[owned.abilityId];
    // a reached rank implies its use-threshold was crossed
    const rankSeed = owned.level >= 3 ? (rules.practice?.useRankThreshold?.["3"] ?? 16)
      : owned.level >= 2 ? (rules.practice?.useRankThreshold?.["2"] ?? 8)
      : Math.min(spine.beats, 4);
    const mentions = ab ? mentionCount(textLog, ab.name) : 0;
    const seed = rankSeed + mentions;
    if (seed > (character.practice.uses[owned.abilityId] || 0)) {
      character.practice.uses[owned.abilityId] = seed;
      abilitiesSeeded++;
    }
  }

  // ---- 4. Co-activations: owned discoveries prove braiding; owned-component
  //         recipes get activity-scaled seed so genuinely-used combos ripen ----
  const ripenedCombos = [];
  for (const recipe of emergence.recipes || []) {
    if (recipe.tier !== "combo") continue;
    const bothOwned = (recipe.components || []).every(id =>
      (character.abilities || []).some(a => a.abilityId === id && a.level >= (recipe.requires?.[id] || 1)));
    if (!bothOwned) continue;
    const key = discoveryKey(recipe.components);
    const alreadyMinted = (character.discoveries || []).some(d => d.recipeId === recipe.id) ||
      (character.discoveries || []).some(d => (d.abilities || []).slice().sort().join("+") === [...recipe.components].sort().join("+"));
    const est = alreadyMinted ? recipe.ripenAt : Math.min(recipe.ripenAt, Math.round(spine.beats / (bf.comboBeatsPer ?? 3)));
    const prev = character.practice.coActivations[key] || 0;
    character.practice.coActivations[key] = Math.max(prev, est);
    if (!alreadyMinted && character.practice.coActivations[key] >= recipe.ripenAt) ripenedCombos.push(recipe.name);
  }

  character.backfillVersion = BACKFILL_VERSION;
  return {
    beats: spine.beats,
    xpGained, levelsGained, levelMsgs,
    bonds: bonds.filter(b => b.bond > 0),
    abilitiesSeeded, ripenedCombos
  };
}

/** One-line-per-item human summary for the "catching up" aside. */
export function summaryLines(summary) {
  if (!summary) return [];
  const lines = [];
  if (summary.xpGained > 0) lines.push(`Tallied your past deeds: +${summary.xpGained} experience${summary.levelsGained ? ` (${summary.levelsGained} level${summary.levelsGained > 1 ? "s" : ""} — spend the new points on your sheet)` : ""}.`);
  for (const b of summary.bonds) lines.push(`Your bond with ${b.name} has grown to ${b.bond}${b.granted ? " — deep enough to unlock a new ability together" : ""}.`);
  if (summary.abilitiesSeeded) lines.push(`Your practice with ${summary.abilitiesSeeded} ${summary.abilitiesSeeded > 1 ? "abilities is" : "ability is"} now on the ledger — earned ranks reflect the work you've already done.`);
  if (summary.ripenedCombos.length) lines.push(`Techniques ripe to claim from what you've braided: ${summary.ripenedCombos.join(", ")}.`);
  return lines;
}
