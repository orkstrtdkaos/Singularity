// state.js — content loading and save/load.
// v0.1: saves live in localStorage (instant, offline-safe); optional GitHub sync
// via sync.js pushes character + player profile to the shared repo when a PAT is
// configured. Content packs always load from the served repo files.

import { reconcileContent } from "./reconcile.js";
import { loadLegends } from "./legends.js";
import { buildTraditionIndex } from "./traditions.js";

const LS = {
  character: id => `singularity.character.${id}`,
  characterIndex: "singularity.characters",
  profile: key => `singularity.profile.${key}`,
  playerKey: "singularity.playerKey",
  redirect: key => `singularity.profileRedirect.${key}` // SNG-045: retired dup key → canonical
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
  // SNG-055/059: the great-circle traditions map (domain-access model). Fetched directly (not yet
  // in the manifest). Optional — absence leaves the domain gates ungoverned (open), never breaks load.
  let traditions = null, traditionIndex = null;
  try {
    const tradPath = (index.provides.rules || []).find(r => r.includes("traditions"));
    traditions = await fetchJSON(tradPath ? `content/packs/core/${tradPath}` : "content/packs/core/rules/traditions.json");
    traditionIndex = buildTraditionIndex(traditions);
  } catch { /* domains ungoverned */ }

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
  // SNG-BATCH-10 Phase 3 / SNG-065: structured quests. The manifest listed provides.quests but the
  // loader had no branch — the authored quests silently did not load. Now they do. Optional: a miss
  // leaves quests empty (freeform GM quests still work), never breaks load.
  let quests = [];
  for (const path of valley.provides.quests || []) {
    try { const qf = await fetchJSON(`content/packs/valley/${path}`); quests = quests.concat(qf.quests || (Array.isArray(qf) ? qf : [])); }
    catch { /* quests optional */ }
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
  // SNG-063: origins (27 peoples) + backgrounds (15) — authored content (were hardcoded). Fetched
  // directly; optional (creation falls back to a minimal set if absent).
  let origins = [], backgrounds = [];
  try { origins = (await fetchJSON("content/packs/core/rules/origins.json")).origins || []; } catch { /* fallback in-app */ }
  try { backgrounds = (await fetchJSON("content/packs/core/rules/backgrounds.json")).backgrounds || []; } catch { /* fallback in-app */ }
  // SNG-062: the Prologue — character creation as a played opening. Fetched directly. Optional
  // (absence falls back to the quick-start form; never breaks load).
  let prologue = null;
  try { prologue = await fetchJSON("content/packs/valley/prologue.json"); } catch { /* no prologue → form only */ }
  // SNG-042: the world's great figures. Authored anchors load as high-weight reusable canon
  // (hydrated into npcs so SNG-019 resolves them by name + the GM reuses, never reinvents).
  let legends = { roster: [], beats: {}, tiers: {} };
  try { legends = loadLegends(await fetchJSON("content/packs/valley/lore/legends.json")); } catch { /* no legends */ }
  for (const fig of legends.roster) if (fig.id && !npcs[fig.id]) npcs[fig.id] = fig;

  const content = { spectrums, rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks, abilities, items, locations, npcs, events, companions, encounters, randomEncounters, lore, region, substrate, greaterArcs, genSchemas, legends, traditions, traditionIndex, prologue, origins, backgrounds, quests, startingLocation: valley.startingLocation };
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
  // SNG-045: if this device's key was retired into a canonical profile, follow the redirect
  const canon = resolvePlayerKey(k);
  if (canon !== k) { localStorage.setItem(LS.playerKey, canon); k = canon; }
  return k;
}
export function setPlayerKey(k) { localStorage.setItem(LS.playerKey, resolvePlayerKey(k.trim())); }

// ---------- SNG-045: player identity dedup (one person, one profile) ----------

/** Follow the retired-key → canonical redirect chain (cycle-guarded). A key with no redirect
 *  resolves to itself. */
export function resolvePlayerKey(key, guard = 0) {
  if (!key || guard > 20) return key;
  const to = localStorage.getItem(LS.redirect(key));
  return to && to !== key ? resolvePlayerKey(to, guard + 1) : key;
}

/** PURE: given the list of profiles, decide which same-displayName groups merge and which key
 *  is canonical. currentKey (if in a group) wins the canonical slot; else the profile with the
 *  most characters, tie-broken by playerKey (deterministic). Returns [{ name, canonicalKey,
 *  retiredKeys[] }] for groups of size >= 2 only. */
export function planPlayerDedup(profiles, currentKey = null) {
  const groups = {};
  for (const p of profiles) {
    const name = String(p.displayName || p.playerKey || "").trim().toLowerCase();
    if (!name) continue;
    (groups[name] = groups[name] || []).push(p);
  }
  const out = [];
  for (const [name, members] of Object.entries(groups)) {
    if (members.length < 2) continue;
    const score = (p) => (p.playerKey === currentKey ? 1e9 : 0) + (p.charactersPlayed?.length || 0);
    const sorted = [...members].sort((a, b) => score(b) - score(a) || String(a.playerKey).localeCompare(String(b.playerKey)));
    const canonical = sorted[0];
    out.push({ name, canonicalKey: canonical.playerKey, retiredKeys: sorted.slice(1).map(p => p.playerKey) });
  }
  return out;
}

/** Apply the dedup plan to localStorage: union charactersPlayed, reassign each retired profile's
 *  characters to the canonical key, keep a set rating over a default one, write a redirect for
 *  each retired key, delete the retired profile. Idempotent (a second run finds no duplicates).
 *  Repoints this device's key if it was retired. Returns a summary of what merged. */
export function dedupePlayers() {
  const profiles = listPlayerProfiles();
  const currentRaw = localStorage.getItem(LS.playerKey);
  const plan = planPlayerDedup(profiles, currentRaw);
  const merged = [];
  for (const g of plan) {
    const canonical = loadProfile(g.canonicalKey);
    if (!canonical) continue;
    canonical.charactersPlayed = canonical.charactersPlayed || [];
    for (const retiredKey of g.retiredKeys) {
      const dup = loadProfile(retiredKey);
      if (!dup) continue;
      // reassign the duplicate's characters to the canonical owner
      for (const id of (dup.charactersPlayed || [])) {
        const c = loadCharacter(id);
        if (c) { c.playerKey = g.canonicalKey; saveCharacter(c); }
        if (!canonical.charactersPlayed.includes(id)) canonical.charactersPlayed.push(id);
      }
      // also catch any device-local characters that name the retired key but weren't listed
      for (const entry of listCharacters()) {
        const c = loadCharacter(entry.id);
        if (c && c.playerKey === retiredKey) { c.playerKey = g.canonicalKey; saveCharacter(c); if (!canonical.charactersPlayed.includes(c.id)) canonical.charactersPlayed.push(c.id); }
      }
      // prefer a deliberately-set rating over a default one
      if (dup.rating && !dup.rating.isMinor && dup.rating.preset && dup.rating.setBy && (!canonical.rating || !canonical.rating.setBy)) canonical.rating = dup.rating;
      // a minor flag on either side is preserved (protective)
      if (dup.rating?.isMinor) { canonical.rating = canonical.rating || {}; canonical.rating.isMinor = true; }
      localStorage.setItem(LS.redirect(retiredKey), g.canonicalKey);
      localStorage.removeItem(LS.profile(retiredKey));
    }
    saveProfile(canonical);
    merged.push({ name: g.name, canonicalKey: g.canonicalKey, retired: g.retiredKeys });
  }
  // repoint this device if its raw key was retired
  if (currentRaw) { const canon = resolvePlayerKey(currentRaw); if (canon !== currentRaw) localStorage.setItem(LS.playerKey, canon); }
  return merged;
}

/** Full profile objects on this device (not just {playerKey,displayName}). */
export function listPlayerProfiles() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("singularity.profile.")) continue;
    try { const p = JSON.parse(localStorage.getItem(key)); if (p?.playerKey) out.push(p); } catch { /* skip */ }
  }
  return out;
}

/** SNG-045 Part B: find an existing profile by display name (case-insensitive) — so entering a
 *  name that already exists ATTACHES to that person instead of minting a new per-device key. */
export function findProfileByName(displayName) {
  const target = String(displayName || "").trim().toLowerCase();
  if (!target) return null;
  return listPlayerProfiles().find(p => String(p.displayName || "").trim().toLowerCase() === target) || null;
}

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
