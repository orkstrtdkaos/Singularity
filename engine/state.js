// state.js — content loading and save/load.
// v0.1: saves live in localStorage (instant, offline-safe); optional GitHub sync
// via sync.js pushes character + player profile to the shared repo when a PAT is
// configured. Content packs always load from the served repo files.

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

  const abilities = {};
  for (const path of index.provides.abilities) {
    const pack = await fetchJSON(`content/packs/core/${path}`);
    for (const a of pack.abilities) abilities[a.id] = { ...a, powerSystem: pack.powerSystem };
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
  for (const path of valley.provides.events) {
    const ev = await fetchJSON(`content/packs/valley/${path}`);
    events[ev.id] = ev;
  }
  const lore = {};
  for (const path of valley.provides.lore) {
    const name = path.split("/").pop().replace(".md", "");
    lore[name] = await fetchText(`content/packs/valley/${path}`);
  }
  const region = await fetchJSON("world/regions/valley.json");

  return { spectrums, rules, abilities, locations, npcs, events, lore, region, startingLocation: valley.startingLocation };
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

export function listCharacters() {
  try { return JSON.parse(localStorage.getItem(LS.characterIndex) || "[]"); } catch { return []; }
}

export function saveCharacter(c) {
  localStorage.setItem(LS.character(c.id), JSON.stringify(c));
  const idx = listCharacters().filter(e => e.id !== c.id);
  idx.push({ id: c.id, name: c.name, level: c.level, origin: c.origin });
  localStorage.setItem(LS.characterIndex, JSON.stringify(idx));
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
