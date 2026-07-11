// state.js — content loading and save/load.
// v0.1: saves live in localStorage (instant, offline-safe); optional GitHub sync
// via sync.js pushes character + player profile to the shared repo when a PAT is
// configured. Content packs always load from the served repo files.

import { reconcileContent } from "./reconcile.js";

const LS = {
  character: id => `singularity.character.${id}`,
  characterIndex: "singularity.characters",
  profile: key => `singularity.profile.${key}`,
  playerKey: "singularity.playerKey"
};

// ---------- content packs ----------

export async function loadContent() {
  const index = await fetchJSON("content/packs/core/manifest.json");
  const valley = await fetchJSON("content/packs/valley/manifest.json");

  const spectrums = await fetchJSON(`content/packs/core/${index.provides.spectrums}`);
  const rules = await fetchJSON(`content/packs/core/${index.provides.rules[0]}`);
  let emergence = { recipes: [], branchTemplates: [] };
  const emergencePath = (index.provides.rules || []).find(r => r.includes("emergence"));
  if (emergencePath) { try { emergence = await fetchJSON(`content/packs/core/${emergencePath}`); } catch { /* optional */ } }
  let attributeGates = { gates: {} }, skillCapacity = { skillsKnownByLevel: {} };
  const gatesPath = (index.provides.rules || []).find(r => r.includes("attribute_gates"));
  if (gatesPath) { try { attributeGates = await fetchJSON(`content/packs/core/${gatesPath}`); } catch { /* optional */ } }
  const capPath = (index.provides.rules || []).find(r => r.includes("skill_capacity"));
  if (capPath) { try { skillCapacity = await fetchJSON(`content/packs/core/${capPath}`); } catch { /* optional */ } }
  let locationAffinities = { typeAffinity: {}, tagAliases: {}, vectorAlignment: {} };
  const affPath = (index.provides.rules || []).find(r => r.includes("location_affinities"));
  if (affPath) { try { locationAffinities = await fetchJSON(`content/packs/core/${affPath}`); } catch { /* optional */ } }
  let intensity = { steps: {} };
  const intPath = (index.provides.rules || []).find(r => r.includes("intensity_scaling"));
  if (intPath) { try { intensity = await fetchJSON(`content/packs/core/${intPath}`); } catch { /* optional */ } }
  let branchForks = { forks: {} };
  const forkPath = (index.provides.rules || []).find(r => r.includes("branch_forks"));
  if (forkPath) { try { branchForks = await fetchJSON(`content/packs/core/${forkPath}`); } catch { /* optional */ } }

  const abilities = {};
  for (const path of index.provides.abilities) {
    const pack = await fetchJSON(`content/packs/core/${path}`);
    for (const a of pack.abilities) abilities[a.id] = { ...a, powerSystem: pack.powerSystem };
  }

  const items = {};
  for (const path of index.provides.items || []) {
    const pack = await fetchJSON(`content/packs/core/${path}`);
    for (const it of pack.items) items[it.id] = it;
  }

  const locations = {};
  for (const path of valley.provides.locations) {
    const loc = await fetchJSON(`content/packs/valley/${path}`);
    locations[loc.id] = loc;
  }
  const npcs = {};
  for (const path of valley.provides.npcs) {
    const npc = await fetchJSON(`content/packs/valley/${path}`);
    npcs[npc.id] = npc;
  }
  const events = {};
  let randomEncounters = null;
  for (const path of valley.provides.events) {
    const ev = await fetchJSON(`content/packs/valley/${path}`);
    if (ev.id) events[ev.id] = ev;
    else if (path.includes("random_encounters")) randomEncounters = ev; // SNG-014 table (no id)
  }
  const companions = {};
  for (const path of valley.provides.companions || []) {
    const c = await fetchJSON(`content/packs/valley/${path}`);
    companions[c.id] = c;
  }
  const encounters = {};
  for (const path of valley.provides.encounters || []) {
    const e = await fetchJSON(`content/packs/valley/${path}`);
    encounters[e.id] = e;
  }
  const lore = {};
  for (const path of valley.provides.lore) {
    const name = path.split("/").pop().replace(".md", "");
    lore[name] = await fetchText(`content/packs/valley/${path}`);
  }
  const region = await fetchJSON("world/regions/valley.json");

  // SNG-BATCH-9: the generative substrate grammar + the derived validation schemas that
  // generate(type, context) authors against. Optional — a fetch miss disables generation
  // (the GM's generateRequest is simply ignored) but never breaks content load.
  let substrate = null;
  try { substrate = await fetchJSON("content/packs/valley/lore/generative_substrate.json"); } catch { /* generation off */ }
  let greaterArcs = [];
  try { greaterArcs = (await fetchJSON("content/packs/valley/lore/greater_arcs.json")).arcs || []; } catch { /* no arc few-shot */ }
  const genSchemas = {};
  for (const t of ["npc", "location", "arc"]) {
    try { genSchemas[t] = await fetchJSON(`schemas/${t}.schema.json`); } catch { /* type ungeneratable */ }
  }

  const content = { spectrums, rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks, abilities, items, locations, npcs, events, companions, encounters, randomEncounters, lore, region, substrate, greaterArcs, genSchemas, startingLocation: valley.startingLocation };
  // SNG-022: bring every loaded record up to current (derive missing additive fields,
  // flag dangling cross-refs). In-memory only — Pages files are static.
  try { reconcileContent(content); } catch (err) { console.warn("[loadContent] reconcile skipped:", err.message); }
  return content;
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}
async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

/** Assemble the lore text relevant to a location (only what this turn needs). */
export function loreForLocation(location, loreMap) {
  return (location.loreRefs || []).map(ref => loreMap[ref]).filter(Boolean).join("\n\n");
}

/** Active-event summaries for the GM, including the GM-eyes-only truth. */
export function eventsForGM(region, eventMap) {
  return (region.activeEvents || []).map(({ eventId, stage }) => {
    const ev = eventMap[eventId];
    if (!ev) return null;
    const st = ev.stages?.find(s => s.stage === stage);
    return { eventId, stage, summaryForGM: `${ev.name} — stage ${stage} (${st?.name}): ${st?.summary} ${ev.truth || ""}` };
  }).filter(Boolean);
}

// ---------- character & profile persistence ----------

export function getPlayerKey() {
  let k = localStorage.getItem(LS.playerKey);
  if (!k) { k = "player-" + Math.random().toString(36).slice(2, 8); localStorage.setItem(LS.playerKey, k); }
  return k;
}
export function setPlayerKey(k) { localStorage.setItem(LS.playerKey, k.trim()); }

/** SNG-BATCH-7 Phase 1: has THIS device chosen a player yet? (non-creating). */
export function hasChosenPlayer() { return !!localStorage.getItem(LS.playerKey); }

/** All players known on this device — every stored profile. (Phase 2 syncs more down.) */
export function listPlayers() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("singularity.profile.")) continue;
    try {
      const p = JSON.parse(localStorage.getItem(key));
      if (p?.playerKey) out.push({ playerKey: p.playerKey, displayName: p.displayName || p.playerKey });
    } catch { /* skip corrupt */ }
  }
  return out;
}

export function listCharacters() {
  try { return JSON.parse(localStorage.getItem(LS.characterIndex) || "[]"); } catch { return []; }
}

export function saveCharacter(c, { stamp = true } = {}) {
  // SNG-BATCH-7 Phase 2: stamp last-write time + a monotonic rev so cross-device
  // load-latest can tell which copy is fresher. Adopting a remote copy passes
  // stamp:false to preserve the remote's own timestamps.
  if (stamp) { c.updatedAt = Date.now(); c.rev = (c.rev || 0) + 1; }
  localStorage.setItem(LS.character(c.id), JSON.stringify(c));
  const idx = listCharacters().filter(e => e.id !== c.id);
  idx.push({ id: c.id, name: c.name, level: c.level, origin: c.origin });
  localStorage.setItem(LS.characterIndex, JSON.stringify(idx));
}

/** SNG-BATCH-7 Phase 2: write a version pulled from the sync repo to local storage,
 *  preserving its updatedAt/rev and marking THIS as the last synced point. */
export function adoptRemoteCharacter(remote) {
  remote.syncedAt = remote.updatedAt || 0;
  saveCharacter(remote, { stamp: false });
  return remote;
}

/** Preserve a losing copy under a recovery key so a both-advanced conflict never
 *  destroys work. Returns the recovery key. */
export function preserveRecovery(c, tag = "") {
  const key = `singularity.recovery.${c.id}.${c.updatedAt || 0}${tag ? "." + tag : ""}`;
  localStorage.setItem(key, JSON.stringify(c));
  return key;
}

export function loadCharacter(id) {
  try { return JSON.parse(localStorage.getItem(LS.character(id))); } catch { return null; }
}

export function saveProfile(p) { localStorage.setItem(LS.profile(p.playerKey), JSON.stringify(p)); }
export function loadProfile(playerKey) {
  try { return JSON.parse(localStorage.getItem(LS.profile(playerKey))); } catch { return null; }
}

/** Export/import for moving saves between machines until GitHub sync is configured. */
export function exportSave(characterId, playerKey) {
  return JSON.stringify({ character: loadCharacter(characterId), profile: loadProfile(playerKey) }, null, 2);
}
export function importSave(json) {
  const data = JSON.parse(json);
  if (data.character) saveCharacter(data.character);
  if (data.profile) saveProfile(data.profile);
  return data;
}
