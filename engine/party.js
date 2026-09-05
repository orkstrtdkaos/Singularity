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
import { smartClamp } from "./namematch.js"; // SNG-152: these strings cross into OTHER players' GM prompts — never sever mid-word

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

/** WHAT A MEMBER CARRIES INTO SOMEONE ELSE'S SEAT.
 *
 *  A member record used to be a name and a key. That is enough to show a roster and nothing like enough to
 *  STAND IN A FIGHT — and `alliesOf`'s party branch, which decides what an ally contributes, read a field
 *  no code in this repo ever wrote. This is the missing producer.
 *
 *  Each player writes their OWN presence at join time, from their own save; nobody reads anybody else's
 *  file. It is deliberately the minimum a combatant needs: what you resist with, what you can lose, and
 *  the IDS of your crafts, which is what says whether you are a warder or a healer or a striker. No prose,
 *  no inventory, no history — a sheet, not a save.
 */
function presenceOf(c) {
  const a = c?.attributes || {};
  const lvl = Math.max(1, Number(c?.level) || 1);
  const half = Math.max(1, Math.round(lvl / 2));
  const n = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    level: lvl,
    attributes: {
      physical: n(a.physical, half), mental: n(a.mental, half),
      social: n(a.social, half), practical: n(a.practical, half),
    },
    subAttributes: c?.subAttributes || {},
    health: n(c?.health, lvl * 2), maxHealth: n(c?.maxHealth, lvl * 2),
    // ids only — the other player's seat resolves them against its own catalogue, so a craft they own and
    // you do not still reads correctly, and nothing about their sheet has to be trusted as a number.
    abilities: (c?.abilities || []).map(x => x?.abilityId || x).filter(v => typeof v === "string").slice(0, 40),
    // WHETHER THEY CARRY A WEAPON, and nothing else about what they own. `contributionsOf` already decides
    // MARTIAL from exactly this — a weapon in the pack, a fighting role, or an authored `combatant` — and it
    // has decided it for every companion since CCODE-259. A human ally used to be handed MARTIAL outright,
    // which said a bare-handed scholar looked as dangerous as Pell with her spear. Bare kinds, no names, no
    // prose: these records cross into another player's prompts and only the fact is needed.
    inventory: (c?.inventory || []).filter(i => String(i?.kind || "").toLowerCase() === "weapon").map(() => ({ kind: "weapon" })).slice(0, 1),
  };
}

function memberOf(c) {
  return { characterId: c.id, name: c.name, playerKey: c.playerKey, joinedAt: new Date().toISOString(), presence: presenceOf(c) };
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
    label: smartClamp(String(beat.label || ""), 120), // SNG-152
    degree: beat.degree || null,
    summary: smartClamp(String(beat.summary || ""), 200), // SNG-152
    at: beat.at
  }].slice(-CAPS.beats);
  return { ...scene, beats, turn: nextTurn(scene, beat.by), updatedAt: beat.at };
}

// ═══ THE SHARED POOL IS A LEDGER, NEVER A COUNTER (Aevi's ruling, 2026-09-05) ═══
//
// ⛔ THE CASE THAT FORCED IT is not a lost WRITE — `pushMergedFile`'s CAS already handles those. It is a
// LOST RESPONSE: the PUT succeeds on the server and the reply dies on the way back. From the client that is
// indistinguishable from a failure, so the retry re-reads a remote that ALREADY HAS the change and applies
// it again. ⚠️ `hp -= 12` runs twice and the opponent takes 24. Measured: 100 − 12 lands as 76 (§82).
//
// ⚑ SO THE POOL IS DERIVED AND NEVER STORED: `hp = max − sum(strikes)`. A row that arrives twice is
// recognised by `(by, at)` — the same key `mergeBeat` has always used — and a derived value cannot
// double-apply because there is nothing to apply. A HEAL IS A NEGATIVE ROW.
//
// ⛔ AEVI RULED THE GENERAL FORM AND IT IS WIDER THAN HEALTH: *"ANY SHARED MUTABLE NUMBER IN THIS SYSTEM
// MUST BE A DERIVED SUM OVER AN IDEMPOTENT LEDGER. Momentum, pressure, energy — every one, not only
// health."* Hence `ledgerSum` is generic and the pool is one caller of it.

// ⚠️ AND ONE CORRECTION TO THE RULING, MEASURED. She wrote: *"Cap it at `CAPS.beats` (40) with the same
// slice."* ⛔ THE SAME SLICE IS A BUG HERE, AND BEATS ARE WHY IT LOOKS SAFE: a beat log is a DISPLAY, so
// dropping the oldest costs a line of history. A ledger is the STATE, so dropping the oldest changes the
// number it derives. Measured: sixty strikes of 1 against a pool of 100 leaves 40 rows and reads **60 —
// the opponent silently heals 20**.
// ⚑ SO IT COMPACTS INSTEAD OF TRUNCATING: the overflow folds into ONE row carrying their SUM. The file
// stays bounded, the derived number is identical, and the fold is a PURE FUNCTION OF THE ROW LIST — two
// clients that see the same list produce the same folded row, so it merges by `(by, at)` like any other.
const LEDGER_FOLD_KEY = "__folded";

/** PURE. The sum of a ledger. Non-numeric amounts are zero — a malformed row must not poison the total. */
export function ledgerSum(rows) {
  return (Array.isArray(rows) ? rows : []).reduce((n, r) => n + (Number.isFinite(Number(r?.amount)) ? Number(r.amount) : 0), 0);
}

/** PURE. Fold everything past the cap into one row that carries their sum. ⛔ SUM-CONSERVING BY
 *  CONSTRUCTION — that is the property the gate asserts, because it is the only one that matters. */
export function compactLedger(rows, cap = CAPS.beats) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length <= cap) return list;
  const keep = list.slice(-(cap - 1));            // one slot reserved for the fold
  const folded = list.slice(0, list.length - keep.length);
  return [{
    by: LEDGER_FOLD_KEY,
    // ⚠️ DETERMINISTIC KEY: the newest row it swallowed. Two clients folding the same prefix agree, so the
    // folded row itself dedupes through `mergeStrike` exactly like a real one.
    at: folded[folded.length - 1]?.at || "0",
    amount: ledgerSum(folded),
    // ⚠️ THE RUNNING TOTAL, not this fold's length. Compaction runs on every merge past the cap, so it
    // usually folds [the previous fold row, one new row] — and reporting 2 for a row standing in for twenty-one
    // is a field that lies to whoever reads it. A count is a measurement like any other.
    folded: folded.reduce((n, r) => n + (Number(r?.folded) || 1), 0),
  }, ...keep];
}

/** PURE + IDEMPOTENT. Add one row unless `(by, at)` is already present. Compacts past the cap. */
export function mergeStrike(scene, strike) {
  if (!scene || !scene.encounter || !strike?.by || !strike?.at) return scene;
  const rows = Array.isArray(scene.encounter.strikes) ? scene.encounter.strikes : [];
  if (rows.some(r => r.by === strike.by && r.at === strike.at)) return scene;   // the same key mergeBeat uses
  const row = {
    by: strike.by, at: strike.at,
    amount: Number.isFinite(Number(strike.amount)) ? Number(strike.amount) : 0,   // a HEAL is a negative row
    name: String(strike.name || "").slice(0, 40),
    label: smartClamp(String(strike.label || ""), 120),   // SNG-152: this crosses into another player's prompt
  };
  return {
    ...scene,
    encounter: { ...scene.encounter, strikes: compactLedger([...rows, row]) },
    updatedAt: strike.at,
  };
}

/** PURE. What the shared opponent has left — DERIVED, never stored. Null when no shared encounter is open. */
export function sharedPool(scene) {
  const e = scene?.encounter;
  if (!e || !Number.isFinite(Number(e.max))) return null;
  const max = Number(e.max);
  const spent = ledgerSum(e.strikes);
  return { max, spent, remaining: Math.max(0, max - spent), down: max - spent <= 0, rows: (e.strikes || []).length };
}

/** PURE. Open the one shared encounter a scene may carry. ⚠️ IDEMPOTENT on `defId` — a second opener
 *  joining the same fight must not reset the pool someone has already spent against. */
export function openSharedEncounter(scene, { defId, name = null, max, at = new Date().toISOString() }) {
  if (!scene || !defId || !Number.isFinite(Number(max))) return scene;
  if (scene.encounter?.defId === defId) return scene;
  return { ...scene, encounter: { defId, name: String(name || defId).slice(0, 60), max: Number(max), strikes: [], openedAt: at }, updatedAt: at };
}

/** PURE. Close it. ⛔ The ledger goes with it — a finished fight is not state anyone should still derive from. */
export function closeSharedEncounter(scene, at = new Date().toISOString()) {
  if (!scene?.encounter) return scene;
  const { encounter, ...rest } = scene;
  return { ...rest, updatedAt: at };
}

// ═══ THE SIMULTANEOUS LOCK (SPEC_party_mode_phase2 §4b) ═══
//
// ⛔ THE MECHANICAL REASON IS BETTER THAN THE PACING ONE, and it is the spec's own argument: because every
// declaration is known before anything happens, A WARD DECLARED IN THE SAME INSTANT ACTUALLY CATCHES THE
// BLOW. Under rotating turns it cannot — the blow has already landed by the time the warder's turn comes.
//
// ⚠️ A LOCK IS A ROW, NOT A BOOLEAN ANYONE CAN FLIP. Aevi's ledger ruling applies here exactly as it does
// to the pool: keyed `(by, round)`, first write wins, a retry after a lost response changes nothing. ⛔ A
// lock that could be overwritten would let a player see the others' declarations and then change theirs,
// which is the one thing simultaneity exists to prevent.

// ⛔ THE RULED ORDER (Aevi, BUILD_LIST §2b): PROTECT and wards first, then KNOW, then HARM, then RESTORE.
// ⚠️ IT IS A RULING ABOUT FICTION, NOT A TUNING: a guard has to be up before the blow, what you learn has
// to be known before you act on it, and mending answers harm that has already happened. ⚑ Anything whose
// family is none of the four resolves after the four, in declaration order — an unknown verb must not
// silently sort first.
export const RESOLVE_ORDER = ["PROTECT", "KNOW", "HARM", "RESTORE"];

/** PURE + IDEMPOTENT. Lock one member's declaration for a round. ⛔ FIRST WRITE WINS — see above. */
export function lockDeclaration(scene, characterId, decl, { round = null, at = new Date().toISOString() } = {}) {
  if (!scene?.encounter || !characterId || !decl) return scene;
  if (!(scene.encounter.fighting || []).includes(characterId)) return scene;   // you are not in this fight
  // ⚠️ AN EXPLICIT NULL CHECK, NOT `Number.isFinite`. `Number(null)` is 0 AND FINITE, so the default
  // branch never ran and every lock was filed under round 0 while `allLocked` looked at round 1 — nobody was
  // ever all-locked. ⛔ The same coercion that scaled every unmeasured hold's yield by ×0.75 in §74.
  const n = round == null ? (Number(scene.encounter.round) || 1) : (Number(round) || 1);
  const locks = { ...(scene.encounter.locks || {}) };
  if (locks[characterId] && Number(locks[characterId].round) === n) return scene;   // keyed (by, round)
  locks[characterId] = {
    round: n, at,
    family: String(decl.family || "").toUpperCase() || null,
    name: String(decl.name || "").slice(0, 40),
    label: smartClamp(String(decl.label || ""), 120),   // SNG-152: this crosses into another player's prompt
    abilityId: decl.abilityId || null,
  };
  return { ...scene, encounter: { ...scene.encounter, round: n, locks }, updatedAt: at };
}

/** PURE. Have all the fighters locked in for this round? ⚠️ An empty fight is NOT 'all locked' — a round
 *  with nobody in it must never resolve, or a stray tick would advance a fight nobody is having. */
export function allLocked(scene) {
  const on = scene?.encounter?.fighting || [];
  if (!on.length) return false;
  const n = Number(scene.encounter.round) || 1;
  const locks = scene.encounter.locks || {};
  return on.every(id => locks[id] && Number(locks[id].round) === n);
}

/** PURE. Who has not declared yet — the straggler list §5 acts on. */
export function unlockedFighters(scene) {
  const on = scene?.encounter?.fighting || [];
  const n = Number(scene?.encounter?.round) || 1;
  const locks = scene?.encounter?.locks || {};
  return on.filter(id => !(locks[id] && Number(locks[id].round) === n));
}

/** PURE. This round's locks in the RULED order. ⚠️ Ties inside a family keep DECLARATION order (`at`), so
 *  the result is total and deterministic — two clients resolving the same round agree on the sequence. */
export function resolveOrder(scene) {
  const n = Number(scene?.encounter?.round) || 1;
  const locks = Object.entries(scene?.encounter?.locks || {})
    .filter(([, l]) => Number(l.round) === n)
    .map(([by, l]) => ({ by, ...l }));
  const rank = (f) => { const i = RESOLVE_ORDER.indexOf(String(f || "").toUpperCase()); return i < 0 ? RESOLVE_ORDER.length : i; };
  return locks.sort((a, b) => (rank(a.family) - rank(b.family)) || String(a.at).localeCompare(String(b.at)) || String(a.by).localeCompare(String(b.by)));
}

/** PURE. Clear the locks and step to the next round. ⛔ THE LEDGER IS NOT TOUCHED — a round ends, a fight
 *  does not, and what was taken off the opponent stays off. */
export function advanceRound(scene, at = new Date().toISOString()) {
  if (!scene?.encounter) return scene;
  const n = (Number(scene.encounter.round) || 1) + 1;
  return { ...scene, encounter: { ...scene.encounter, round: n, locks: {} }, updatedAt: at };
}

/** PURE + IDEMPOTENT. Step into the shared fight. ⛔ THIS IS WHAT THE LEDGER IS FOR — until two people can
 *  be on one opponent, a shared pool has one writer and `activeEncounter` already does that correctly.
 *  ⚠️ A member not in the SCENE cannot join its fight; joining twice is a no-op, which the retry loop needs. */
export function joinFight(scene, characterId, at = new Date().toISOString()) {
  if (!scene?.encounter || !characterId) return scene;
  if (!scene.party?.some(m => m.characterId === characterId)) return scene;   // you are not in this scene
  const on = Array.isArray(scene.encounter.fighting) ? scene.encounter.fighting : [];
  if (on.includes(characterId)) return scene;
  return { ...scene, encounter: { ...scene.encounter, fighting: [...on, characterId] }, updatedAt: at };
}

/** PURE + IDEMPOTENT. Step out. ⚠️ THE FIGHT DOES NOT END WHEN YOU LEAVE IT — the others are still in it,
 *  and the pool is theirs. Only `closeSharedEncounter` ends a fight, and the last one out is the caller's
 *  decision to make, not this function's: withdrawing is not the same as winning. */
export function leaveFight(scene, characterId, at = new Date().toISOString()) {
  if (!scene?.encounter || !characterId) return scene;
  const on = (scene.encounter.fighting || []).filter(id => id !== characterId);
  if (on.length === (scene.encounter.fighting || []).length) return scene;
  return { ...scene, encounter: { ...scene.encounter, fighting: on }, updatedAt: at };
}

/** PURE. Who is on the shared opponent right now. */
export function fightersOf(scene) {
  const ids = (scene?.encounter?.fighting || []);
  return ids.map(id => scene.party?.find(m => m.characterId === id) || { characterId: id, name: id });
}

/** Serialize a member's active encounter so others WITNESS it (phase 1: no joint participation). */
export function setEncounterState(scene, characterId, receipt) {
  const encounters = { ...(scene.encounters || {}) };
  if (receipt) encounters[characterId] = smartClamp(String(receipt), 600); // SNG-152
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
  // ⛔ THE SHARED FIGHT, IF ONE IS OPEN. The pool is DERIVED here the way it is derived everywhere —
  // `sharedPool` reads the ledger — so this paragraph can never disagree with the number the strikes say.
  const pool = sharedPool(scene);
  const onIt = fightersOf(scene).filter(m => m.characterId !== myCharacterId);
  const sharedLine = pool
    ? `\n\nA SHARED FIGHT IS OPEN: ${scene.encounter.name} — ${pool.remaining} of ${pool.max} left`
      + (onIt.length ? `, and ${onIt.map(m => m.name).join(", ")} ${onIt.length === 1 ? "is" : "are"} on it.` : ", and nobody is on it yet.")
      + (pool.down ? " IT IS DOWN." : "")
    : "";
  const recent = scene.beats.slice(-4).map(b => `[${b.name}] ${b.summary}`).join("\n");
  return `${lines.join("\n")}${sharedLine}\n\nRecent party beats (all members, oldest first):\n${recent}\nWeave party members into the narration as present, active companions controlled by OTHER PLAYERS — never decide their actions, never voice major choices for them.`;
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
