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

/** SNG-056: resolve a GM `moveTo` reference (an id or a place name) to a real loaded location id,
 *  or null if it names nowhere that exists. Exact id → slugified id → exact name → loose name. Pure. */
export function resolveLocationId(ref, locations = {}) {
  if (!ref) return null;
  const raw = String(ref).trim();
  if (locations[raw]) return raw;
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  if (locations[slug]) return slug;
  const lc = raw.toLowerCase();
  for (const [k, l] of Object.entries(locations)) if ((l.name || "").toLowerCase() === lc) return k;
  for (const [k, l] of Object.entries(locations)) { const n = (l.name || "").toLowerCase(); if (n && (n.includes(lc) || lc.includes(n))) return k; }
  return null;
}

export async function loadContent() {
  const index = await fetchJSON("content/packs/core/manifest.json");
  const valley = await fetchJSON("content/packs/valley/manifest.json");

  const spectrums = await fetchJSON(`content/packs/core/${index.provides.spectrums}`);
  // SNG-092: ONE loading mechanism. Every core rules file resolves through the manifest's
  // provides.rules by NAME — never by array position (rules[0] silently became attribute_gates.json
  // when the manifest was re-registered, which nulls baseChance/d100/energy) and never by a hardcoded
  // path (origins/backgrounds/regions/accords used to bypass the manifest entirely). rulePath finds the
  // entry by the file's distinctive stem; the array's ORDER never matters again.
  const rulePath = name => { const p = (index.provides.rules || []).find(r => r.includes(name)); return p ? `content/packs/core/${p}` : null; };
  const resPath = rulePath("resolution");
  if (!resPath) throw new Error("manifest: core provides.rules is missing resolution.json (the base rules)");
  const rules = await fetchJSON(resPath);
  // Every optional core rule loads the same way: found by name in the manifest, fetched, fallback on
  // a miss. No inline .find(), no hardcoded path, no positional index.
  const loadRule = async (name, fallback) => { const p = rulePath(name); if (!p) return fallback; try { return await fetchJSON(p); } catch { return fallback; } };
  const emergence = await loadRule("emergence", { recipes: [], branchTemplates: [] });
  const attributeGates = await loadRule("attribute_gates", { gates: {} });
  const skillCapacity = await loadRule("skill_capacity", { skillsKnownByLevel: {} });
  const locationAffinities = await loadRule("location_affinities", { typeAffinity: {}, tagAliases: {}, vectorAlignment: {} });
  const intensity = await loadRule("intensity_scaling", { steps: {} });
  const branchForks = await loadRule("branch_forks", { forks: {} });
  const romanceGuidance = await loadRule("romance_guidance", null); // pulled into the GM prompt on romantic intent
  // SNG-055/059: the great-circle traditions map (domain-access model). Optional — absence leaves the
  // domain gates ungoverned (open), never breaks load.
  let traditions = await loadRule("traditions", null), traditionIndex = null;
  if (traditions) { try { traditionIndex = buildTraditionIndex(traditions); } catch { traditions = null; } }

  const abilities = {};
  for (const path of index.provides.abilities) {
    const pack = await fetchJSON(`content/packs/core/${path}`);
    // ability-arch v2: tolerant defaults so the engine can read the new fields before the content
    // classification pass tags every ability. rankProgression defaults to "use" (depth is earned, not
    // bought); nativeOrCombination stays null until authored (consumers treat null as unclassified).
    for (const a of pack.abilities) abilities[a.id] = {
      ...a, powerSystem: pack.powerSystem,
      rankProgression: a.rankProgression || "use",
      nativeOrCombination: a.nativeOrCombination || null,
      combinationAxis: a.combinationAxis ?? null,
      rankThresholds: a.rankThresholds || { rank1: "given", rank2: "practiced_use", rank3: "defining_moment" }
    };
  }

  const items = {};
  for (const path of index.provides.items || []) {
    const pack = await fetchJSON(`content/packs/core/${path}`);
    for (const it of pack.items) items[it.id] = it;
  }
  // SNG-BATCH-10 Phase 4: valley.provides.items was declared but the loader never read it — the
  // Waystaff, riven-gear and valley-kit item defs (19 items) silently did not load, the same class
  // of bug as quests. Now they do. Optional; a miss leaves the core items intact.
  for (const path of valley.provides.items || []) {
    try { const pack = await fetchJSON(`content/packs/valley/${path}`); for (const it of pack.items || []) items[it.id] = it; }
    catch { /* valley items optional */ }
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
  // SNG-063: origins (27 peoples) + backgrounds (15). SNG-092: via the manifest, not a hardcoded path.
  const origins = (await loadRule("origins", {})).origins || [];
  const backgrounds = (await loadRule("backgrounds", {})).backgrounds || [];
  // SNG-082: authored terrain — regions with palette/terrain/elevation/features. Data-driven so a
  // generated location inherits the right ground. Optional (a miss = the map renders without terrain).
  const regions = (await loadRule("regions", {})).regions || [];
  // SNG-089: the Accords — 7 crafts FREELY ACCESSED (not free to learn: you still spend the point;
  // simply ungated by origin/domain/ring-penalty; the tuition is the JOURNEY to a waygate). Tag each
  // signatory ability with `accord` so the learn-gate lets anyone take it.
  const accords = await loadRule("the_accords", null);
  if (accords) for (const sig of (accords.signatories || [])) { const ab = abilities[sig.opens]; if (ab) ab.accord = sig.tradition || true; }
  // SNG-084: in-context helper text — every mechanic explains itself where it bites. Authored copy
  // (id → {short, more}); indexed by id for O(1) lookup at the surface. Optional (a miss = no ⓘ).
  const helpDoc = await loadRule("helper_text", { entries: [] });
  const helpText = {};
  for (const e of (helpDoc.entries || [])) if (e.id) helpText[e.id] = e;
  // SNG-090: the substrate model (the second difficulty map) — per-tradition bands + per-region density.
  // Loaded now; the resolve-chain factor is wired in Phase B. Optional (a miss = substrate-neutral).
  const substrateModel = await loadRule("the_substrate", null);
  // SNG-062: the Prologue — character creation as a played opening. Fetched directly. Optional
  // (absence falls back to the quick-start form; never breaks load).
  let prologue = null;
  try { prologue = await fetchJSON("content/packs/valley/prologue.json"); } catch { /* no prologue → form only */ }
  // SNG-042: the world's great figures. Authored anchors load as high-weight reusable canon
  // (hydrated into npcs so SNG-019 resolves them by name + the GM reuses, never reinvents).
  let legends = { roster: [], beats: {}, tiers: {} };
  try { legends = loadLegends(await fetchJSON("content/packs/valley/lore/legends.json")); } catch { /* no legends */ }
  for (const fig of legends.roster) if (fig.id && !npcs[fig.id]) npcs[fig.id] = fig;

  const content = { spectrums, rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks, abilities, items, locations, npcs, events, companions, encounters, randomEncounters, lore, region, substrate, greaterArcs, genSchemas, legends, traditions, traditionIndex, prologue, origins, backgrounds, quests, regions, accords, helpText, substrateModel, romanceGuidance, startingLocation: valley.startingLocation };
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
