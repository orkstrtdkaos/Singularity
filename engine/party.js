// party.js — SNG-001 phase 1: shared scenes. Two+ characters occupy one scene:
// same anchor, ordered beat log, round-robin turns, each player's GM turn carries
// the others' presence and actions.
//
// CONCURRENCY: the shared scene file is the deliberate exception to the
// owned-file law. Writes go through pushSceneWithMerge — on SHA conflict we
// REFETCH the remote scene, re-apply our beat via mergeBeat (idempotent by
// (by, at) key), and retry. Never a blind overwrite.

import { syncEnabled, fetchRepoJSON, pushOwnedFile, ghList } from "./sync.js";

const CAPS = { beats: 40, party: 6 };

// ---------- pure core (fully testable) ----------

export function newSharedScene(locationId, character, stamp) {
  return {
    schemaVersion: 1,
    sceneId: `${locationId}--${stamp}`,
    locationId,
    createdBy: character.id,
    party: [memberOf(character)],
    beats: [],
    turn: character.id,
    encounters: {},
    updatedAt: stamp
  };
}

function memberOf(c) {
  return { characterId: c.id, name: c.name, playerKey: c.playerKey, joinedAt: new Date().toISOString() };
}

export function addMember(scene, character) {
  if (scene.party.some(m => m.characterId === character.id)) return scene;
  if (scene.party.length >= CAPS.party) return scene;
  return { ...scene, party: [...scene.party, memberOf(character)], updatedAt: new Date().toISOString() };
}

export function removeMember(scene, characterId) {
  const party = scene.party.filter(m => m.characterId !== characterId);
  const turn = scene.turn === characterId ? (party[0]?.characterId ?? null) : scene.turn;
  return { ...scene, party, turn, updatedAt: new Date().toISOString() };
}

export function isMyTurn(scene, characterId) {
  return !scene || scene.turn === characterId || !scene.party.some(m => m.characterId === scene.turn);
}

export function nextTurn(scene, afterId) {
  const ids = scene.party.map(m => m.characterId);
  if (!ids.length) return null;
  const i = ids.indexOf(afterId);
  return ids[(i + 1) % ids.length];
}

/** Merge one beat into a scene — idempotent by (by, at); advances the turn. */
export function mergeBeat(scene, beat) {
  if (scene.beats.some(b => b.by === beat.by && b.at === beat.at)) return scene;
  const beats = [...scene.beats, {
    by: beat.by, name: String(beat.name || "").slice(0, 40),
    label: String(beat.label || "").slice(0, 120),
    degree: beat.degree || null,
    summary: String(beat.summary || "").slice(0, 200),
    at: beat.at
  }].slice(-CAPS.beats);
  return { ...scene, beats, turn: nextTurn(scene, beat.by), updatedAt: beat.at };
}

/** Serialize a member's active encounter so others WITNESS it (phase 1: no joint participation). */
export function setEncounterState(scene, characterId, receipt) {
  const encounters = { ...(scene.encounters || {}) };
  if (receipt) encounters[characterId] = String(receipt).slice(0, 600);
  else delete encounters[characterId];
  return { ...scene, encounters };
}

/** Party block for the GM: who else is here, what they last did, any encounter they're in. */
export function partyBlockForGM(scene, myCharacterId) {
  if (!scene) return null;
  const others = scene.party.filter(m => m.characterId !== myCharacterId);
  if (!others.length) return null;
  const lines = others.map(m => {
    const last = [...scene.beats].reverse().find(b => b.by === m.characterId);
    const enc = scene.encounters?.[m.characterId];
    return `- ${m.name} is HERE with the character (party member, another player). ` +
      (last ? `Their last action: ${last.label}${last.degree ? ` (${last.degree.replace("_", " ")})` : ""} — ${last.summary}` : "They just arrived.") +
      (enc ? `\n  ${m.name} is mid-encounter (witnessed, not joined): ${enc}` : "");
  });
  const recent = scene.beats.slice(-4).map(b => `[${b.name}] ${b.summary}`).join("\n");
  return `${lines.join("\n")}\n\nRecent party beats (all members, oldest first):\n${recent}\nWeave party members into the narration as present, active companions controlled by OTHER PLAYERS — never decide their actions, never voice major choices for them.`;
}

// ---------- transport (thin; every failure degrades to solo play) ----------

export function scenePath(sceneId) { return `world/scenes/${sceneId}.json`; }

export async function fetchScene(sceneId) {
  if (!syncEnabled()) return null;
  try { return await fetchRepoJSON(scenePath(sceneId)); } catch { return null; }
}

export async function listScenesAt(locationId) {
  if (!syncEnabled()) return [];
  try {
    const names = await ghList("world/scenes");
    const mine = names.filter(n => n.startsWith(locationId + "--") && n.endsWith(".json"));
    const scenes = [];
    for (const n of mine.slice(-5)) {
      const sc = await fetchRepoJSON(`world/scenes/${n}`);
      if (sc && sc.party?.length) scenes.push(sc);
    }
    return scenes;
  } catch { return []; }
}

/** Push a scene mutation with SHA-conflict merge-retry. mutate(freshScene) must be
 *  idempotent (mergeBeat/addMember/setEncounterState all are). */
export async function pushSceneWithMerge(sceneId, mutate, seedScene = null) {
  if (!syncEnabled()) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const remote = (await fetchRepoJSON(scenePath(sceneId))) || seedScene;
      if (!remote) return null;
      const next = mutate(remote);
      await pushOwnedFile(scenePath(sceneId), next, `scene: ${sceneId}`);
      return next;
    } catch (err) {
      if (attempt === 2) { console.warn("[party] scene push failed:", err.message); return null; }
    }
  }
  return null;
}
