// party.js — SNG-001 phase 1: shared scenes. Two+ characters occupy one scene:
// same anchor, ordered beat log, round-robin turns, each player's GM turn carries
// the others' presence and actions.
//
// CONCURRENCY: the shared scene file is the deliberate exception to the
// owned-file law. Writes go through pushSceneWithMerge → sync.pushMergedFile,
// which re-reads the remote and RE-RUNS mutate against that fresh read on every
// attempt, PUTting with the sha of the very read the content was computed from.
// A concurrent write therefore raises a real SHA conflict and we re-merge onto
// the winner (mergeBeat is idempotent by (by, at) key). Never a blind overwrite.
// (BATCH-11 146a: the old path computed `next` from a T0 read but PUT with a
// fresh T1 sha via pushOwnedFile — a concurrent beat between the reads was
// silently lost with no conflict ever raised.)

import { syncEnabled, fetchRepoJSON, pushMergedFile, ghList } from "./sync.js";

const CAPS = { beats: 40, party: 6 };

// BATCH-11 146b/c — scene lifecycle + open-scene index.
// A scene is OPEN while it has members, isn't closed, and hasn't idled past TTL.
// The join path reads world/scenes/_open_index.json (one small file) instead of
// listing the whole directory; the index is maintained at the single write choke
// point (pushSceneWithMerge) and entries age out lazily, so it can't grow unbounded.
const SCENE_TTL_HOURS = 72;
export const OPEN_INDEX_PATH = "world/scenes/_open_index.json";

/** PURE. Is this scene joinable? closed/empty/idle-past-TTL scenes are not.
 *  Idle expiry is LAZY — no write is needed to retire an abandoned scene. */
export function sceneIsOpen(scene, nowISO = new Date().toISOString()) {
  if (!scene || scene.closedAt) return false;
  if (!scene.party?.length) return false;
  const idleMs = Date.parse(nowISO) - Date.parse(scene.updatedAt || 0);
  return !(Number.isFinite(idleMs) && idleMs > SCENE_TTL_HOURS * 3600 * 1000);
}

/** PURE. Stamp a scene closed (archives it out of the join path). */
export function closeScene(scene, stamp = new Date().toISOString()) {
  return { ...scene, closedAt: stamp, updatedAt: stamp };
}

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
    updatedAt: stamp,
    closedAt: null // 146b: stamped when the last member leaves or the scene is retired
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
  const now = new Date().toISOString();
  const out = { ...scene, party, turn, updatedAt: now };
  if (!party.length) out.closedAt = now; // 146b: the last member leaving closes the scene
  return out;
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
    // 146c: the index is the join path — one small read, cost independent of how
    // many scenes have ever existed, and the bound is applied AFTER the open-filter
    // (the old slice(-5)-before-filter could hide live scenes behind abandoned ones).
    const idx = await fetchRepoJSON(OPEN_INDEX_PATH);
    let candidates;
    if (idx?.scenes && typeof idx.scenes === "object") {
      const now = new Date().toISOString();
      candidates = Object.entries(idx.scenes)
        .filter(([, e]) => e && e.locationId === locationId && (e.party || 0) > 0)
        .filter(([, e]) => sceneIsOpen({ party: [1], updatedAt: e.updatedAt }, now))
        .sort((a, b) => String(a[1].updatedAt || "").localeCompare(String(b[1].updatedAt || "")))
        .slice(-8)
        .map(([id]) => `${id}.json`);
    } else {
      // Legacy fallback: pre-index worlds still list the directory (bounded) until
      // the first indexed write creates _open_index.json.
      const names = await ghList("world/scenes");
      candidates = names.filter(n => n.startsWith(locationId + "--") && n.endsWith(".json")).slice(-8);
    }
    const scenes = [];
    for (const n of candidates) {
      const sc = await fetchRepoJSON(`world/scenes/${n}`);
      if (sc && sceneIsOpen(sc)) scenes.push(sc); // the scene FILE is the truth; the index is a hint
    }
    return scenes.slice(-5);
  } catch { return []; }
}

/** 146c: upsert/remove this scene's index entry. Fire-and-forget from the push
 *  path — an index failure must never fail a beat. Concurrent-safe (merged write).
 *  Entries idle past TTL are swept in the same pass, so the index self-prunes. */
async function updateOpenIndex(scene) {
  try {
    await pushMergedFile(OPEN_INDEX_PATH, (remote) => {
      const idx = (remote && typeof remote === "object" && remote.scenes) ? remote : { schemaVersion: 1, scenes: {} };
      if (sceneIsOpen(scene)) {
        idx.scenes[scene.sceneId] = { locationId: scene.locationId, updatedAt: scene.updatedAt, party: scene.party.length };
      } else {
        delete idx.scenes[scene.sceneId];
      }
      for (const [id, e] of Object.entries(idx.scenes)) {
        if (!sceneIsOpen({ party: [1], updatedAt: e?.updatedAt }, scene.updatedAt)) delete idx.scenes[id];
      }
      return idx;
    }, `scene-index: ${scene.sceneId}`);
  } catch (err) {
    console.warn("[party] open-index update failed (non-blocking):", err.message);
  }
}

/** Push a scene mutation with SHA-conflict merge-retry. mutate(freshScene) must be
 *  idempotent (mergeBeat/addMember/setEncounterState all are). */
let _lastSceneError = null;
/** The reason the last shared-scene push failed (e.g. "GH_PUT_403"), or null. */
export function lastSceneError() { return _lastSceneError; }

export async function pushSceneWithMerge(sceneId, mutate, seedScene = null) {
  if (!syncEnabled()) { _lastSceneError = "sync not configured"; return null; }
  // Outer loop covers TRANSIENT failures (timeouts, 5xx). SHA conflicts are
  // handled INSIDE pushMergedFile, which re-reads + re-merges per attempt.
  // A GH_TIMEOUT that actually landed server-side is safe to retry: the retry
  // re-reads the applied state and mergeBeat/addMember are idempotent on it.
  for (let attempt = 0; attempt < 2; attempt++) {
    let merged = null;
    try {
      await pushMergedFile(scenePath(sceneId), (remote) => {
        const base = remote || seedScene;
        if (!base) return null;               // no scene and no seed — nothing to write
        merged = mutate(base);                // recomputed against the FRESH remote every attempt
        return merged;
      }, `scene: ${sceneId}`);
      if (!merged) { _lastSceneError = "no scene and no seed"; return null; }
      _lastSceneError = null;
      updateOpenIndex(merged); // 146c: fire-and-forget — the beat never waits on the index
      return merged;
    } catch (err) {
      if (attempt === 1) { _lastSceneError = err.message; console.warn("[party] scene push failed:", err.message); return null; }
    }
  }
  return null;
}
