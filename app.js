// app.js — Singularity v0.1 shell: character creation, the play loop, settings.
// Engine does the math (resolve/sense/reputation/profile); GM model does the words.

import { loadContent, loreForLocation, eventsForGM, getPlayerKey, setPlayerKey, hasChosenPlayer, listPlayers, listCharacters, saveCharacter, loadCharacter, saveProfile, loadProfile, exportSave, importSave, adoptRemoteCharacter, preserveRecovery } from "./engine/state.js";
import { resolveAction, successChance, applyEnergyCost } from "./engine/resolve.js";
import { senseAction, senseTier } from "./engine/sense.js";
import { recordDeed, standingWith, reputationSummary } from "./engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, profileInsight, ensureCharacterStyle } from "./engine/playerprofile.js";
import { gmTurn, parseIntent, gmAsk, generateBio, sanitizeScene } from "./engine/gm.js";
import { applyQuestUpdates, questsForGM } from "./engine/quests.js";
import { getApiKey, setApiKey } from "./engine/claude.js";
import { syncEnabled, getSyncConfig, setSyncConfig, backupSaves, appendLedger, fetchRemoteCharacter, resolveSaveConflict } from "./engine/sync.js";
import { normalizeInventory, fromCatalog, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM, nameItem, displayName } from "./engine/inventory.js";
import { newClock, readClock, advanceClock, getTimeSettings, setTimeSettings, ADVANCE, TIME_MODES } from "./engine/worldtime.js";
import { locationImage, sceneImage, itemImage, getArtMode, setArtMode, ART_MODES } from "./engine/art.js";
import { companionBonus, companionsForGM, activeCompanions, ensureBonds, bondOf, growBond } from "./engine/companions.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, mergeDuplicateNpcs, relationshipBand, setNpcName, nameIsUnknown } from "./engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM } from "./engine/places.js";
import { initWorldState, runWorldTick, syncSharedWorld, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM } from "./engine/worldtick.js";
import { parseGambitSteps, assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "./engine/gambit.js";
import { SUBS, SUB_OF, SUB_DESC, ensureSubAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, knownDiscovery, recordDiscovery, applyBacklash, abilitiesForGM, retroLevelGrants, effectiveEnergyCost, effectiveLevelReq, sanitizeNewAbility, applyNewAbility } from "./engine/progression.js";
import { ensureCodex, applyCodexUpdates, codexForGM, searchCodex, mergeInto, mergeCodexTopics, suggestMerges, markNotSame } from "./engine/codex.js";
import { reconcile, topReconcileVersion } from "./engine/reconcile.js";
import { ensurePractice, recordUse, declareAspiration, dropAspiration, recordAspirationProgress, aspirationRipe, practiceRankReady, ripeCombos, ripeBranches, emergenceNoticeForGM, acceptCombo, acceptBranch, validEmergenceId } from "./engine/practice.js";
import { needsBackfill, runBackfill, summaryLines } from "./engine/backfill.js";
import { ensureFacts, applyFactUpdates, factsForGM } from "./engine/facts.js";
import { notePerception, perceivedVectors, vectorSummary } from "./engine/vectors.js";
import { tierOf, classColor, classLabel, gateFor, meetsLearnGate, meetsRank3Gate, breadthUsed, breadthCap, atCapacity, skillGraphModel, skillPointCost, forkPending, forkPaths, chosenFork, setFork, rankExpression } from "./engine/skilltree.js";
import { newSharedScene, addMember, removeMember, isMyTurn, mergeBeat, setEncounterState, partyBlockForGM, fetchScene, listScenesAt, pushSceneWithMerge, scenePath, lastSceneError } from "./engine/party.js";
import { INTENSITIES, scaledEnergy, effectMod, autoIntensity, shouldBacklash, applySurgeBacklash, intensityOptions } from "./engine/intensity.js";
import { noteCoUseAndRefresh, refreshEvolvingItems, evolvedItemsForGM, currentStage } from "./engine/evolution.js";
import { locationAffinity, affinityReceipt } from "./engine/affinities.js";
import { rollTrigger, pickEncounter, buildOffer } from "./engine/random_encounters.js";
import { lethalOfferClamp, sanitizeNewEncounter, startEncounter, encounterDifficulty, duelRound, challengeStage, puzzleAttempt, puzzleHints, puzzleUnlocks, checkIncapacitation, encounterReceiptForGM, sanitizeEncounterOps, applyEncounterOps } from "./engine/encounters.js";

const APP_VERSION = "1.7.4";
const app = document.getElementById("app");

let CONTENT = null;      // packs: rules, spectrums, abilities, locations, npcs, events, lore, region
let character = null;    // active character
let profile = null;      // the player's profile (the human)
let sceneTurns = [];     // recent beats: {summary, narration} for scene continuity
let sceneState = null;   // authoritative scene anchor: setting, npcsPresent, objects, threads
let busy = false;
let examinedItem = null; // name of the item expanded in the sidebar
let askMode = false;     // input bar mode: false = act in scene, true = ask the GM (OOC)
let npcGroupsOpen = new Set();   // Fix 5: session memory of expanded people-groups
let tuneOpen = null;             // SNG-015 Part B: index of the choice whose tune panel is open
let tuneSel = { abilityId: undefined, intensity: "standard" }; // current tune selection
let pendingPartyBeats = [];      // shared-scene: other players' new beats awaiting catch-up (non-destructive)
let npcGroupsClosed = new Set(); // explicitly collapsed (overrides current-location default)
let gambitDraft = null;  // in-progress plan: {goal, steps: [{text, fallback}], assessed}
let lastPlayerText = ""; // last freeform/ask input — restored into the box if the GM errors
let sharedScene = null;  // SNG-001: the shared scene object (party play), null when solo
let partyPoll = null;    // poll timer while a shared scene is active
let seenBeats = 0;       // remote beats already rendered

// ---------- boot ----------

(async function boot() {
  try {
    CONTENT = await loadContent();
  } catch (err) {
    app.innerHTML = `<div class="boot">Failed to load content packs: ${esc(err.message)}<br>Serve this folder over HTTP (packs load via fetch).</div>`;
    return;
  }
  // SNG-BATCH-7 Phase 1: identity first. If this device hasn't chosen a player but
  // knows more than one, ask who's playing (path-a family devices); otherwise proceed.
  if (!hasChosenPlayer() && listPlayers().length > 1) { renderPlayerPick(); return; }
  loadIdentity();
  if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
  else renderRoster();
})();

/** Resolve the active profile from the chosen (or auto-created) player key. */
function loadIdentity() {
  profile = loadProfile(getPlayerKey()) || newProfile(getPlayerKey());
}

/** SNG-BATCH-7 Phase 2: reconcile a local character against the sync repo's authoritative
 *  copy — NEWER WINS, a stale local is never used, and a genuine both-advanced conflict
 *  preserves the losing copy as a recovery file + surfaces a note. Never blocks play. */
async function syncPullCharacter(local) {
  if (!local || !syncEnabled()) return { character: local, note: null };
  let remote = null;
  try { remote = await fetchRemoteCharacter(local.playerKey, local.id); }
  catch (err) { console.warn("[sync] pull failed — using local:", err.message); return { character: local, note: null }; }
  if (!remote) return { character: local, note: null };
  const res = resolveSaveConflict(local, remote);
  if (res.reason === "remote-newer") {
    if (res.conflict) preserveRecovery(local, "local"); // both advanced — don't lose local work
    adoptRemoteCharacter(remote);
    return { character: remote, note: res.conflict
      ? "Loaded the newer version from another device — this device's local changes were kept as a recovery copy."
      : "Loaded your latest from another device." };
  }
  if (res.conflict) { preserveRecovery(remote, "remote"); return { character: local, note: "Kept this device's newer version — the other device's copy was saved as a recovery copy." }; }
  return { character: local, note: null };
}

/** "Who's playing?" — pick an existing player on this device, or start a new one. */
function renderPlayerPick(msg = "") {
  const players = listPlayers();
  app.innerHTML = `<div class="app-boot"><div class="screen" style="max-width:460px;margin:40px auto">
    <h2>Who's playing?</h2>
    ${msg ? `<p class="hint">${esc(msg)}</p>` : ""}
    <div class="player-pick">
      ${players.map(p => `<button class="btn player-choice" data-player="${esc(p.playerKey)}">${esc(p.displayName)}</button>`).join("")}
      <button class="btn secondary" id="player-new" style="margin-top:8px">+ New player</button>
    </div>
  </div>`;
  for (const b of app.querySelectorAll("[data-player]")) b.onclick = () => {
    setPlayerKey(b.dataset.player);
    loadIdentity();
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
  document.getElementById("player-new").onclick = () => {
    const name = prompt("New player name:");
    if (name === null) return;
    const key = "player-" + Math.random().toString(36).slice(2, 8);
    setPlayerKey(key);
    profile = newProfile(key, name.trim());
    saveProfile(profile);
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
}

// ---------- shared chrome ----------

function chrome(inner) {
  app.innerHTML = `
    <div class="topbar">
      <div><h1>SINGULARITY</h1><span class="sub">The Valley of Echoes — v${APP_VERSION}</span></div>
      <div class="actions">
        <button id="nav-roster">Characters</button>
        <button id="nav-settings">Settings</button>
      </div>
    </div>
    ${inner}`;
  document.getElementById("nav-roster").onclick = () => renderRoster();
  document.getElementById("nav-settings").onclick = () => renderSettings();
}

// ---------- settings ----------

function renderSettings(note = "") {
  const sc = getSyncConfig();
  const ts = getTimeSettings();
  const artMode = getArtMode();
  chrome(`<div class="screen">
    <h2>Settings</h2>
    ${note ? `<p class="hint" style="margin-bottom:12px">${esc(note)}</p>` : ""}
    <div class="field"><label>Your name (player, not character)</label>
      <input id="set-player" value="${esc(profile.displayName || "")}" placeholder="e.g. Erik"></div>
    <div class="field"><label>Anthropic API key</label>
      <input id="set-key" type="password" value="${esc(getApiKey())}" placeholder="sk-ant-...">
      <div class="hint">Stored in this browser's localStorage only. Never written to any file or repo.</div></div>
    <div class="field"><label>Scene &amp; item art</label>
      <select id="set-art">
        <option value="off" ${artMode === "off" ? "selected" : ""}>Off — text only</option>
        <option value="static" ${artMode === "static" ? "selected" : ""}>Static — bundled image files only</option>
        <option value="generate" ${artMode === "generate" ? "selected" : ""}>Generate — also create missing art (Pollinations, free)</option>
      </select>
      <div class="hint">Generated art builds from each location/item's own description with a fixed seed, so places look consistent between visits.</div></div>
    <div class="field"><label>Time passage</label>
      <select id="set-time-mode">
        <option value="story" ${ts.mode === "story" ? "selected" : ""}>Story time — the clock moves with play</option>
        <option value="real" ${ts.mode === "real" ? "selected" : ""}>Real time — the world's clock runs even while you're away</option>
      </select>
      <input id="set-time-ratio" type="number" min="1" max="168" value="${ts.ratio}" style="margin-top:6px; width:120px"> <span class="hint" style="display:inline">game-hours per real hour (24 = one game day per real hour)</span>
      <div class="hint">Story: +1h per beat, +3h travel, +8h rest. Real: in-game time keeps flowing between sessions — the world will feel like it moved without you.</div></div>
    <div class="field"><label>Shared world sync (optional — GitHub)</label>
      <input id="set-owner" value="${esc(sc.owner)}" placeholder="GitHub owner (e.g. orkstrtdkaos)" style="margin-bottom:6px">
      <input id="set-repo" value="${esc(sc.repo)}" placeholder="Repo (e.g. Singularity)" style="margin-bottom:6px">
      <input id="set-pat" type="password" value="${esc(sc.pat)}" placeholder="GitHub PAT with contents:write">
      <div class="hint">When set, your character, player profile, and world events back up to the shared repo. Leave empty for local-only play.</div></div>
    <button class="btn" id="set-save">Save</button>
    <div class="footer-note">Save data is in this browser. Use Export on the Characters screen to move it.</div>
  </div>`);
  document.getElementById("set-save").onclick = () => {
    profile.displayName = document.getElementById("set-player").value.trim();
    saveProfile(profile);
    setApiKey(document.getElementById("set-key").value);
    setArtMode(document.getElementById("set-art").value);
    setTimeSettings({ mode: document.getElementById("set-time-mode").value, ratio: parseFloat(document.getElementById("set-time-ratio").value) });
    setSyncConfig({
      owner: document.getElementById("set-owner").value,
      repo: document.getElementById("set-repo").value,
      pat: document.getElementById("set-pat").value
    });
    renderRoster();
  };
}

// ---------- roster ----------

function renderRoster() {
  const chars = listCharacters();
  const players = listPlayers();
  chrome(`<div class="screen">
    <div class="roster-head"><h2>Your Characters</h2>
      <span class="roster-player">Playing as <strong>${esc(profile.displayName || profile.playerKey)}</strong>${players.length > 1 ? ` <button class="link-btn" id="switch-player">switch</button>` : ""}</span></div>
    ${chars.length === 0 ? `<p class="hint" style="margin-bottom:14px">No characters yet. The valley is waiting.</p>` : ""}
    <div id="roster">${chars.map(c => `
      <div class="roster-item">
        <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin)} · level ${c.level}</span></div>
        <div><button class="btn" data-play="${esc(c.id)}">Play</button></div>
      </div>`).join("")}</div>
    <div style="margin-top:16px; display:flex; gap:8px;">
      <button class="btn" id="new-char">New Character</button>
      <button class="btn secondary" id="export-save">Export saves</button>
      <button class="btn secondary" id="import-save">Import</button>
    </div>
  </div>`);
  const sw = document.getElementById("switch-player");
  if (sw) sw.onclick = () => renderPlayerPick();
  document.getElementById("new-char").onclick = () => renderCreate();
  document.getElementById("export-save").onclick = () => {
    const chars2 = listCharacters();
    const blob = new Blob([exportSave(chars2[0]?.id, profile.playerKey)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "singularity-save.json"; a.click();
  };
  document.getElementById("import-save").onclick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async () => {
      const text = await input.files[0].text();
      try { importSave(text); renderRoster(); } catch (e) { alert("Import failed: " + e.message); }
    };
    input.click();
  };
  for (const btn of app.querySelectorAll("[data-play]")) {
    btn.onclick = async () => {
      btn.disabled = true; btn.textContent = "Loading…";
      // SNG-BATCH-7 Phase 2: pull the authoritative latest from the sync repo BEFORE
      // migrate/play, so a stale local copy is replaced (never re-stamped as "fresh").
      const pull = await syncPullCharacter(loadCharacter(btn.dataset.play));
      const c = migrate(pull.character);
      if (c.dead) { alert(c.name + " fell in the valley. Their story is over."); renderRoster(); return; }
      character = c;
      if (pull.note) character._reconcileNotes = [...(character._reconcileNotes || []), pull.note];
      saveCharacter(character); enterPlay();
    };
  }
}

/** Additive-schema migration for pre-v0.2 saves: string inventories become item
 *  objects (re-linked to the catalog), and characters gain a clock. */
function migrate(c) {
  if (!c) return c;
  normalizeInventory(c, CONTENT.items);
  if (!c.clock) c.clock = newClock();
  if (!c.companions) c.companions = [];
  if (!c.quests) c.quests = [];
  migrateRelationships(c, CONTENT.npcs);
  mergeDuplicateNpcs(c, Object.keys(CONTENT.locations)); // heal duplicate/id-named people
  if (!c.placeMemory) c.placeMemory = {};
  if (!c.worldState) c.worldState = initWorldState(readClock(c.clock).day);
  ensureSubAttributes(c);
  ensureCodex(c);
  ensureCharacterStyle(c); // SNG-BATCH-7: per-character play-style fields
  mergeCodexTopics(c); // standing high-confidence tidy — idempotent; player's not-same verdicts respected; manual merges cascade via their new aliases
  if (!c.customAbilities) c.customAbilities = {};
  ensureBonds(c);
  ensurePractice(c);
  ensureFacts(c);
  refreshEvolvingItems(c, CONTENT.items); // SNG-010C: stamp current evolution stage on held evolving items
  if (!c.precursorAccess) c.precursorAccess = [];
  if (!c.forkChoices) c.forkChoices = {}; // SNG-BATCH-5 Phase 2: permanent branch-fork picks
  retroLevelGrants(c, CONTENT.rules); // levels earned before banked growth existed pay out once
  // one-time retroactive credit for pre-XP/bonds/practice characters (idempotent)
  if (needsBackfill(c)) {
    c._backfillSummary = runBackfill(c, {
      rules: CONTENT.rules,
      abilityCatalog: { ...CONTENT.abilities, ...(c.customAbilities || {}) },
      emergence: CONTENT.emergence,
      companionCatalog: CONTENT.companions
    });
  }
  // SNG-022: versioned reconciliation — bring the character up to everything now built.
  // Idempotent (reconcileVersion gate); player-facing results surface as a login moment.
  // profile passed so the Phase-1 seed step can copy the player's aggregate style once.
  const rec = reconcile(c, "character", { content: CONTENT, profile });
  if (rec.playerFacing && (rec.notes.length || rec.offers.length)) c._reconcileNotes = rec.notes;
  if (rec.warnings.length) console.warn("[reconcile] character:", rec.warnings);
  return c;
}

/** Fix 5: group registry people by where they are known (lastSeen, else firstMet, else elsewhere). */
function groupNpcsByLocation(registry) {
  const groups = {};
  for (const n of Object.values(registry)) {
    const k = n.lastSeen?.locationId || n.firstMet?.locationId || "elsewhere";
    (groups[k] = groups[k] || []).push(n);
  }
  for (const k of Object.keys(groups)) groups[k].sort((a, b) => Math.abs(b.relationship) - Math.abs(a.relationship));
  return groups;
}

/** Ability catalog including GM-granted learned abilities on this character. */
function fullCatalog() {
  return { ...CONTENT.abilities, ...(character?.customAbilities || {}) };
}

/** SNG-019: known-entity id→name maps for codex entity resolution — the ids the GM
 *  sees in context (met people from the registry, authored NPCs, world locations). */
function codexEntities() {
  const people = {};
  for (const [id, n] of Object.entries(CONTENT.npcs || {})) people[id] = n.name || id;
  for (const [id, n] of Object.entries(character?.npcRegistry || {})) people[id] = n.name || id;
  const places = {};
  for (const [id, l] of Object.entries(CONTENT.locations || {})) places[id] = l.name || id;
  return { people, places };
}

function senseTierFor() {
  return senseTier({ character, action: {}, location: hereNow(), rules: CONTENT.rules, aptitudeMods: aptitudeMods(character, CONTENT.rules.playerAptitudes) });
}

/** Active encounter def + state, or null. */
function activeEnc() {
  const e = character?.activeEncounter;
  if (!e) return null;
  const def = CONTENT.encounters?.[e.defId] || character.customEncounters?.[e.defId];
  return def ? { def, state: e.state } : null;
}

function listAvailableEncounters() {
  const loc = CONTENT.locations[character.currentLocationId];
  return (loc.encounterSeeds || []).map(seed => {
    const def = CONTENT.encounters?.[seed.encounterId];
    return def ? `- id "${def.id}" (${def.type}): ${def.name} — ${seed.hint}. Setup: ${def.setup}` : null;
  }).filter(Boolean).join("\n") || null;
}

/** End an encounter: outcome XP, clear state, incapacitation floor. */
function endEncounter(outcome) {
  const enc = activeEnc();
  if (!enc) return;
  const t = CONTENT.rules.encounters?.[enc.def.type] || {};
  const xpMap = { opponent_fell: t.winXp, opponent_yielded: t.winXp, fled: t.fleeXp, yielded: t.yieldXp, completed: t.completeXp, abandoned: t.abandonXp, solved: t.solveXp, walked_away: t.walkAwayXp, incapacitated: 0 };
  character.xp += Math.max(0, xpMap[outcome] ?? 0);
  for (const c of activeCompanions(character, CONTENT.companions)) growBond(character, c.id, "encounter", CONTENT.rules);
  character.activeEncounter = null;
  if (outcome === "incapacitated") {
    if (enc.def.lethal) { character.dead = true; }
    else { character.health = Math.max(1, character.health); character.energy = Math.max(5, character.energy); }
  }
  saveCharacter(character);
}

// ---------- party (SNG-001 phase 1) ----------

/** Turn a raw GitHub transport error into an actionable sentence for the player. */
function syncErrorMessage(prefix) {
  const e = lastSceneError() || "";
  if (/403/.test(e)) return `${prefix}: your GitHub token can't WRITE to this repo. In GitHub → token settings, give it Contents: Read and write on the ${getSyncConfig().repo || "Singularity"} repo (classic tokens need the "repo" scope), then re-paste it in Settings.`;
  if (/404/.test(e)) return `${prefix}: repo or path not found — check the owner and repo names in Settings.`;
  if (/401/.test(e)) return `${prefix}: your GitHub token was rejected (expired or mistyped) — paste a fresh one in Settings.`;
  if (/not configured/.test(e)) return `${prefix}: shared-world sync isn't set up — add your GitHub owner/repo/token in Settings first.`;
  return `${prefix}${e ? " (" + e + ")" : ""}.`;
}

async function startPartyScene() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const scene = newSharedScene(character.currentLocationId, character, stamp);
  const pushed = await pushSceneWithMerge(scene.sceneId, s => s, scene);
  if (!pushed) { alert(syncErrorMessage("Could not create the shared scene")); return; }
  enterPartyScene(pushed);
}

async function joinPartyScene(sceneId) {
  const joined = await pushSceneWithMerge(sceneId, s => addMember(s, character));
  if (!joined) { alert(syncErrorMessage("Could not join the shared scene")); return; }
  enterPartyScene(joined);
}

function enterPartyScene(scene) {
  sharedScene = scene;
  seenBeats = scene.beats.length;
  character.sharedSceneId = scene.sceneId;
  saveCharacter(character);
  if (partyPoll) clearInterval(partyPoll);
  partyPoll = setInterval(pollPartyScene, 20000);
  renderPlay(character.activeScene?.lastTurn || null, { aside: `Shared scene: ${scene.party.map(m => m.name).join(", ")}. Turns rotate — act when it's yours.` });
}

async function leavePartyScene() {
  const id = character.sharedSceneId;
  if (partyPoll) { clearInterval(partyPoll); partyPoll = null; }
  hidePartyBanner(true);
  sharedScene = null; character.sharedSceneId = null; saveCharacter(character);
  if (id) pushSceneWithMerge(id, s => removeMember(s, character.id));
  renderPlay(character.activeScene?.lastTurn || null, { aside: "You part ways with the party — solo play resumes." });
}

async function pollPartyScene() {
  if (!character?.sharedSceneId || busy) return;
  const remote = await fetchScene(character.sharedSceneId);
  if (!remote) return;
  const hadNew = remote.beats.length > seenBeats;
  const newBeats = remote.beats.slice(seenBeats).filter(b => b.by !== character.id);
  sharedScene = remote;
  if (hadNew) {
    seenBeats = remote.beats.length;
    for (const b of newBeats) sceneTurns.push({ summary: `${b.name}: ${b.summary}` });
    if (newBeats.length) {
      // NON-DESTRUCTIVE: never re-render from a poll (it would wipe the input + current
      // beat). Stash the new beats and show a catch-up banner the player folds in when ready.
      pendingPartyBeats.push(...newBeats);
      showPartyBanner();
    }
  }
  // an empty poll (no new beats) does NOTHING to the DOM — your text + scene stay put.
}

/** Non-destructive toast: another player has acted. Injected directly into the DOM,
 *  never through renderPlay, so the input box and current response are untouched. */
function showPartyBanner() {
  if (!pendingPartyBeats.length) return;
  let el = document.getElementById("party-banner");
  if (!el) { el = document.createElement("div"); el.id = "party-banner"; el.className = "party-banner"; document.body.appendChild(el); }
  const names = [...new Set(pendingPartyBeats.map(b => b.name))].join(", ");
  const yourTurn = sharedScene && isMyTurn(sharedScene, character.id);
  el.innerHTML = `<span class="pb-dot"></span><span class="pb-text">${esc(names)} acted — ${pendingPartyBeats.length} update${pendingPartyBeats.length > 1 ? "s" : ""} ready${yourTurn ? " · your turn" : ""}</span><button class="pb-btn" id="pb-catchup">Catch up</button><button class="pb-x" id="pb-dismiss" title="Dismiss">×</button>`;
  el.style.display = "flex";
  document.getElementById("pb-catchup").onclick = catchUpParty;
  document.getElementById("pb-dismiss").onclick = () => hidePartyBanner();
}

function hidePartyBanner(clear = false) {
  const el = document.getElementById("party-banner");
  if (el) el.style.display = "none";
  if (clear) pendingPartyBeats = [];
}

/** Fold the pending party beats into the view — the ONE place a party update re-renders,
 *  and it preserves whatever the player was typing. */
function catchUpParty() {
  const beats = pendingPartyBeats.slice();
  pendingPartyBeats = [];
  hidePartyBanner();
  const draft = document.getElementById("freeform-input")?.value || "";
  renderPlay(character.activeScene?.lastTurn || null, {
    aside: beats.map(b => `${b.name}: ${b.label}${b.degree ? ` (${b.degree.replace("_", " ")})` : ""} — ${b.summary}`).join("; ")
  });
  if (draft) { const fi = document.getElementById("freeform-input"); if (fi) fi.value = draft; }
}

/** Publish my beat to the shared scene (fire-and-forget; solo play never blocks). */
function publishPartyBeat(label, degree, summary) {
  if (!sharedScene || !character.sharedSceneId) return;
  const beat = { by: character.id, name: character.name, label, degree, summary, at: new Date().toISOString() };
  const encReceipt = activeEnc() ? encounterReceiptForGM(activeEnc().state, activeEnc().def, null, null) : null;
  pushSceneWithMerge(character.sharedSceneId, s => setEncounterState(mergeBeat(s, beat), character.id, encReceipt))
    .then(next => { if (next) { sharedScene = next; seenBeats = next.beats.length; } });
}

/** World-tick choke point: run whenever the character (re)enters play or the
 *  clock jumps. Returns fresh news to show the player once. */
async function maybeTick() {
  const currentDay = readClock(character.clock).day;
  await runWorldTick({ character, content: CONTENT, currentDay });
  await syncSharedWorld({ character, content: CONTENT }); // one valley for everyone (no-op without sync)
  saveCharacter(character);
  return takeUnseenNews(character);
}

/** The current location with the world's spectrum drift applied. */
function hereNow() {
  return effectiveLocation(CONTENT.locations[character.currentLocationId], character.worldState);
}

// ---------- character creation ----------

const GEAR_BY_BACKGROUND = {
  "former-professional": ["prism_chip", "trade_tokens"],
  "community-organizer": ["trade_tokens", "dried_rations"],
  "craftsman": ["belt_knife", "hemp_rope"],
  "survivalist": ["hemp_rope", "dried_rations"],
  "medic": ["medics_satchel", "healing_draught"]
};

function startingGear(background) {
  const ids = ["travelers_pack", "waterskin", ...(GEAR_BY_BACKGROUND[background] || [])];
  return ids.map(id => CONTENT.items[id]).filter(Boolean).map(it => fromCatalog(it));
}

const BACKGROUNDS = [
  ["former-professional", "Former Professional", "Pre-Transition career skills and connections"],
  ["community-organizer", "Community Organizer", "Conflict resolution, trust networks"],
  ["craftsman", "Craftsman / Artisan", "Making, mending, material sense"],
  ["survivalist", "Survivalist", "Trails, weather, staying alive outdoors"],
  ["medic", "Medical Practitioner", "Healing arts, herbal and practical"]
];

function renderCreate() {
  const state = { name: "", origin: "valley", background: "craftsman", attrs: { physical: 3, mental: 3, social: 3, practical: 3 }, abilities: [] };
  const POOL = 12;

  function abilityChoices() {
    const fake = { origin: state.origin, level: 1 };
    return Object.values(CONTENT.abilities).filter(a => {
      const req = effectiveLevelReq(a, fake, CONTENT.rules);
      return req !== null && req <= 1;
    });
  }
  function maxAbilities() { return state.origin === "valley" ? 1 : 2; }

  function draw() {
    const spent = Object.values(state.attrs).reduce((a, b) => a + b, 0);
    const left = POOL - spent;
    const okAb = abilityChoices();
    state.abilities = state.abilities.filter(id => okAb.some(a => a.id === id)).slice(0, maxAbilities());
    const valid = state.name.trim().length > 0 && left === 0 && state.abilities.length === maxAbilities();

    chrome(`<div class="screen">
      <h2>New Character</h2>
      <div class="field"><label>Name</label><input id="c-name" value="${esc(state.name)}"></div>
      <div class="field"><label>Origin</label>
        <div class="opt-row">
          ${[["harmonic", "Harmonic Heights (sonic)"], ["radiant", "Radiant Plateau (light)"], ["valley", "Valley floor (unaligned)"]]
            .map(([v, l]) => `<button class="opt ${state.origin === v ? "selected" : ""}" data-origin="${v}">${l}</button>`).join("")}
        </div>
        <div class="hint">${state.origin === "valley" ? "Unaligned: start with 1 ability from either system; more options open later through play." : "Start with 2 abilities of your civilization's system."}</div></div>
      <div class="field"><label>Background</label>
        <div class="opt-row">${BACKGROUNDS.map(([v, l]) => `<button class="opt ${state.background === v ? "selected" : ""}" data-bg="${v}">${l}</button>`).join("")}</div>
        <div class="hint">${esc(BACKGROUNDS.find(b => b[0] === state.background)[2])}</div></div>
      <div class="field"><label>Attributes — points left: <strong>${left}</strong> (each 1–4)</label>
        ${Object.entries(state.attrs).map(([k, v]) => `
          <div class="point-row">
            <button data-dec="${k}">−</button><span class="pips">${"●".repeat(v)}${"○".repeat(4 - v)}</span><button data-inc="${k}">+</button>
            <span style="text-transform:capitalize">${k}</span>
          </div>`).join("")}</div>
      <div class="field"><label>Abilities — choose ${maxAbilities()}</label>
        ${["harmonic", "radiant", "valley_craft"].filter(sys => okAb.some(a => a.powerSystem === sys)).map(sys => `
          <div class="sys-group"><div class="sys-label">${sys === "valley_craft" ? "Valley Craft" : sys[0].toUpperCase() + sys.slice(1)}</div>
          <div class="opt-row">${okAb.filter(a => a.powerSystem === sys).map(a => { const r1 = a.tree?.find(t => t.rank === 1); return `<button class="opt ${state.abilities.includes(a.id) ? "selected" : ""}" data-ab="${a.id}" title="${esc((r1 ? "Rank 1 “" + r1.name + "” — CAN: " + r1.grants + " | CANNOT: " + r1.cannot : a.description) + (a.notFor ? " | NOT FOR: " + a.notFor : ""))}">${esc(a.name)}</button>`; }).join("")}</div></div>`).join("")}
        <div class="hint">${state.abilities.map(id => { const a = CONTENT.abilities[id]; const r1 = a.tree?.find(t => t.rank === 1); return r1 ? `<strong>${esc(a.name)}</strong> — rank 1 “${esc(r1.name)}”: ${esc(r1.grants)}` : esc(a.description); }).join("<br>") || "Hover an ability to see exactly what its first rank can and cannot do."}</div></div>
      <button class="btn" id="c-done" ${valid ? "" : "disabled"}>Next: your story</button>
    </div>`);

    document.getElementById("c-name").oninput = e => { state.name = e.target.value; document.getElementById("c-done").disabled = !(state.name.trim() && left === 0 && state.abilities.length === maxAbilities()); };
    for (const b of app.querySelectorAll("[data-origin]")) b.onclick = () => { state.origin = b.dataset.origin; state.abilities = []; draw(); };
    for (const b of app.querySelectorAll("[data-bg]")) b.onclick = () => { state.background = b.dataset.bg; draw(); };
    for (const b of app.querySelectorAll("[data-inc]")) b.onclick = () => { const k = b.dataset.inc; if (state.attrs[k] < 4 && left > 0) state.attrs[k]++; draw(); };
    for (const b of app.querySelectorAll("[data-dec]")) b.onclick = () => { const k = b.dataset.dec; if (state.attrs[k] > 1) state.attrs[k]--; draw(); };
    for (const b of app.querySelectorAll("[data-ab]")) b.onclick = () => {
      const id = b.dataset.ab;
      if (state.abilities.includes(id)) state.abilities = state.abilities.filter(x => x !== id);
      else if (state.abilities.length < maxAbilities()) state.abilities.push(id);
      draw();
    };
    document.getElementById("c-done").onclick = () => renderBioStep();
  }

  function renderBioStep(bio = { hometown: "", residence: "", livelihood: "", hobbies: "", motivation: "", story: "" }) {
    const FIELDS = [
      ["hometown", "Where are they from?", "e.g. a fishing hamlet two days upriver"],
      ["residence", "Where do they live now?", "e.g. a rented loft over the Millbrook cooperage"],
      ["livelihood", "How do they make money?", "e.g. repairs water-wheels; takes carving commissions in winter"],
      ["hobbies", "What do they do for joy?", "e.g. night fishing, dice, collecting pre-Transition buttons"],
      ["motivation", "Why step out of ordinary life?", "What makes them someone things HAPPEN to — a debt, a loss, a question, an itch"]
    ];
    chrome(`<div class="screen">
      <h2>${esc(state.name)}'s Story</h2>
      <p class="hint" style="margin-bottom:14px">This is what makes them a character and not a bystander. The GM grounds every scene in it. Fill it in, or let the valley weave a draft you can edit.</p>
      ${FIELDS.map(([k, label, ph]) => `<div class="field"><label>${label}</label><input id="bio-${k}" value="${esc(bio[k])}" placeholder="${esc(ph)}"></div>`).join("")}
      <div class="field"><label>Their story so far</label><textarea id="bio-story" rows="4" style="width:100%" placeholder="A few sentences tying it together">${esc(bio.story)}</textarea></div>
      <div style="display:flex; gap:8px;">
        <button class="btn secondary" id="bio-weave">✦ Weave it for me</button>
        <button class="btn" id="bio-done">Begin in Millbrook</button>
      </div>
      <div class="hint" id="bio-status" style="margin-top:8px"></div>
    </div>`);
    const read = () => Object.fromEntries([...FIELDS.map(([k]) => [k, document.getElementById(`bio-${k}`).value.trim()]), ["story", document.getElementById("bio-story").value.trim()]]);
    document.getElementById("bio-weave").onclick = async () => {
      const status = document.getElementById("bio-status");
      status.textContent = "The valley considers who you might be…";
      try {
        const draft = await generateBio({ name: state.name, origin: state.origin, background: state.background, attributes: state.attrs });
        renderBioStep({ ...read(), ...Object.fromEntries(Object.entries(draft).filter(([, v]) => v)) });
      } catch (err) {
        status.textContent = "The weave slipped (" + err.message.slice(0, 60) + ") — write it by hand or try again.";
      }
    };
    document.getElementById("bio-done").onclick = () => finish(read());
  }

  function finish(bio = null) {
    const rules = CONTENT.rules;
    character = {
      schemaVersion: 1,
      id: "char-" + Date.now().toString(36),
      playerKey: profile.playerKey,
      name: state.name.trim(),
      origin: state.origin,
      background: state.background,
      level: 1, xp: 0,
      attributes: { ...state.attrs },
      skills: {},
      abilities: state.abilities.map(id => ({ abilityId: id, level: 1 })),
      alignment: {},
      attunement: 1,
      maxHealth: 15 + state.attrs.physical * 5, health: 15 + state.attrs.physical * 5,
      maxEnergy: rules.energy.max, energy: rules.energy.max,
      inventory: startingGear(state.background),
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: CONTENT.startingLocation,
      activeScene: null,
      clock: newClock(),
      companions: [],
      quests: [],
      npcRegistry: {},
      placeMemory: {},
      worldState: initWorldState(1),
      bio: bio && Object.values(bio).some(v => v) ? bio : null
    };
    ensureSubAttributes(character);
    ensureCodex(character);
    ensureCharacterStyle(character); // SNG-BATCH-7: this character earns its OWN play-style
    character.grantsVersion = 1; // born after banked growth — no retro grant owed
    character.reconcileVersion = topReconcileVersion("character"); // born current — no migration owed (no aggregate seed)
    character.pendingSubPoints = 2; // shape your edge from day one — specialize two subs
    if (!profile.charactersPlayed.includes(character.id)) profile.charactersPlayed.push(character.id);
    saveCharacter(character); saveProfile(profile);
    enterPlay();
  }

  draw();
}

// ---------- play ----------

async function enterPlay() {
  sceneTurns = [];
  sceneState = null;
  if (character.sharedSceneId && syncEnabled()) {
    fetchScene(character.sharedSceneId).then(sc => {
      if (sc && sc.party.some(m => m.characterId === character.id)) { sharedScene = sc; seenBeats = sc.beats.length; if (!partyPoll) partyPoll = setInterval(pollPartyScene, 20000); }
      else { character.sharedSceneId = null; saveCharacter(character); }
    });
  }
  const news = await maybeTick();
  // one-time "catching up" tally from the backfill migration
  let backfillAside = null;
  if (character._backfillSummary) {
    const lines = summaryLines(character._backfillSummary);
    delete character._backfillSummary;
    saveCharacter(character);
    if (lines.length) backfillAside = "Catching up on all you've done:\n• " + lines.join("\n• ");
  }
  // SNG-022: the login moment — if reconciliation applied anything player-facing, say so
  if (character._reconcileNotes?.length) {
    const growth = "The world has grown:\n• " + character._reconcileNotes.join("\n• ");
    backfillAside = backfillAside ? backfillAside + "\n\n" + growth : growth;
    delete character._reconcileNotes;
    saveCharacter(character);
  }
  if (character.activeScene?.turns?.length) {
    sceneTurns = character.activeScene.turns;
    sceneState = character.activeScene.sceneState || null;
    renderPlay(character.activeScene.lastTurn, { resumed: true, newsFlash: news, aside: backfillAside });
  } else {
    startScene(undefined, news, backfillAside);
  }
}

async function startScene(prompt = "(Scene opening — set the scene where the character currently is and present the situation.)", news = [], aside = null) {
  if (news.length) prompt += ` (Since the character last played, the world moved: ${news.map(n => n.text).join(" / ")} — let the scene reflect what applies here.)`;
  renderPlay(null, { thinking: "The valley takes shape…", newsFlash: news, aside });
  const result = await runGM({ resolution: null, playerInput: prompt });
  if (result) renderPlay(result.turn, { degraded: result.degraded, newsFlash: news, aside });
}

async function runGM({ resolution, playerInput, exactWords, itemAdvance }) {
  busy = true;
  const location = hereNow();
  const region = { ...CONTENT.region, activeEvents: eventsForGM(buildRegionView(CONTENT, character), CONTENT.events) };
  const time = readClock(character.clock);
  const result = await gmTurn({
    character, location, region,
    lore: loreForLocation(location, CONTENT.lore),
    rules: CONTENT.rules,
    resolution, playerInput, exactWords,
    recentTurns: sceneTurns.slice(-6),
    timeLabel: time.label,
    inventoryDetail: inventoryForGM(character),
    companionsDetail: companionsForGM(activeCompanions(character, CONTENT.companions), character, CONTENT.rules),
    questsDetail: questsForGM(character),
    sceneState,
    npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) }),
    placeMemoryDetail: placeMemoryForGM(character, character.currentLocationId),
    newsDetail: newsForGM(character),
    abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks),
    codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: (character.quests || []).filter(q => q.status === "active").map(q => q.title) }),
    factsDetail: factsForGM(character),
    evolvedItemsDetail: evolvedItemsForGM(character, CONTENT.items),
    itemAdvance: (itemAdvance || []).map(a => `${a.itemName} has woken to Stage ${a.stage} "${a.stageName}": ${a.narrationHints}${a.grant ? ` (${a.grant})` : ""}`).join("; ") || null,
    opLossNote: character.opLossPending ? "The previous turn's structured updates failed to apply. Restate NOW, as ops, any quest/npc/place/codex/FACT updates that occurred last beat — INCLUDING any name reveal (revealName) or established fact the fiction set. The narration advanced; the state did not." : null,
    emergenceDetail: emergenceNoticeForGM(character, CONTENT.emergence, CONTENT.rules),
    perilNote: (character.precursorAxes || []).length ? `Precursor use has pushed the character's own vector past ±${CONTENT.rules.precursor?.bandNotice ?? 0.4} on: ${character.precursorAxes.join(", ")}. They are being changed by what they wield — let it show.` : null,
    encounterDetail: resolution?.encounterReceipt || (activeEnc() ? encounterReceiptForGM(activeEnc().state, activeEnc().def, null, null) : null),
    availableEncounters: activeEnc() ? null : listAvailableEncounters(),
    partyDetail: partyBlockForGM(sharedScene, character.id)
  });
  busy = false;
  if (!result.ok) { renderPlay(null, { error: result.error }); return null; }
  // SNG-009: track op loss so the next turn's GM restates missed updates
  if (result.opsLost) { character.opLossPending = true; character.opLossLog = [...(character.opLossLog || []), { at: new Date().toISOString() }].slice(-3); }
  else character.opLossPending = false;
  applyTurn(result.turn, resolution);
  return result;
}

function applyTurn(turn, resolution) {
  const location = CONTENT.locations[character.currentLocationId];
  const dayNow = readClock(character.clock).day;
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);

  // deltas from the GM (bounded trust: clamp everything)
  const d = turn.characterDeltas || {};
  if (d.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + clampInt(d.health, -20, 15)));
  if (d.energy) character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + clampInt(d.energy, -20, 40)));
  if (d.xp) character.xp += Math.max(0, Math.min(25, d.xp | 0));
  for (const item of d.inventoryAdd || []) addItem(character, item, CONTENT.items);
  for (const item of d.inventoryRemove || []) removeItem(character, typeof item === "string" ? item : item?.name);

  // deeds → reputation (day-stamped so news spread knows when they happened)
  for (const deed of turn.deeds || []) {
    const recorded = recordDeed(character, { ...deed, locationId: location.id, communityId: deed.communityId ?? location.communityId }, mods);
    recorded.day = dayNow;
  }
  // companion bonds grow through shared life (engine-owned; GM has no op)
  {
    const comps = activeCompanions(character, CONTENT.companions);
    for (const c of comps) {
      const unlocked = [];
      if ((turn.deeds || []).length) unlocked.push(...growBond(character, c.id, "deed", CONTENT.rules).events);
      if (resolution?.equipHelpers?.includes(c.name)) unlocked.push(...growBond(character, c.id, "assist", CONTENT.rules).events);
      if (unlocked.includes("grant") && c.bondGrants) {
        const def = sanitizeNewAbility(c.bondGrants);
        if (def && !character.abilities.some(a => a.abilityId === def.id)) {
          character.customAbilities = character.customAbilities || {};
          character.customAbilities[def.id] = def;
          character.abilities.push({ abilityId: def.id, level: 1 });
          turn.narration += `

*✦ Your bond with ${c.name} deepens into something new: **${def.name}**.*`;
        }
      }
      if (unlocked.includes("stage2")) {
        const st = (c.stages || []).find(x => x.stage === 2);
        if (st) turn.narration += `

*✦ ${c.name} has changed — ${st.name}.*`;
      }
    }
  }
  // people & places remember (typed ops, clamped)
  const memCtx = { locationId: location.id, day: readClock(character.clock).day, entities: codexEntities() };
  applyNpcUpdates(character, turn.npcUpdates || [], memCtx);
  // legacy relationshipDeltas: tolerated but may only UPDATE existing people —
  // this path once minted duplicate id-named registry entries
  applyNpcUpdates(character, (turn.relationshipDeltas || []).map(r => ({
    op: "update", npcId: r.npcId, relationshipDelta: clampInt(r.delta || 0, -2, 2), note: r.note
  })), memCtx);
  applyPlaceUpdates(character, location.id, turn.placeUpdates || [], memCtx);
  applyCodexUpdates(character, turn.codexUpdates || [], memCtx);
  applyFactUpdates(character, turn.factUpdates || [], memCtx);
  if (character.activeEncounter && turn.encounterOps) {
    const encA = activeEnc();
    if (encA) applyEncounterOps(encA.state, sanitizeEncounterOps(turn.encounterOps, encA.def, encA.state));
  }
  if (turn.newEncounter) {
    const nd = sanitizeNewEncounter(turn.newEncounter);
    if (nd) { character.customEncounters = character.customEncounters || {}; character.customEncounters[nd.id] = nd; }
  }
  // spectrum fingerprint drifts toward the axes of what you actually did (EWMA)
  if (resolution?.action?.axes) {
    for (const [ax, v] of Object.entries(resolution.action.axes)) {
      const cur = character.alignment[ax] || 0;
      character.alignment[ax] = Math.max(-1, Math.min(1, cur * 0.95 + v * 0.05));
    }
  }
  // the HUMAN's profile learns from the intent tags of the chosen action
  if (resolution?.action?.intentTags?.length) {
    updateProfile(character, resolution.action.intentTags, CONTENT.rules.playerAptitudes);
  }
  // discoveries: only mintable when the engine flagged this resolution eligible
  if (turn.discovery && resolution?.discoveryEligible) {
    const minted = recordDiscovery(character, {
      name: turn.discovery.name, description: turn.discovery.description,
      abilityIds: resolution.discoveryAbilities || [], noveltyHint: resolution.action?.noveltyHint || "", day: dayNow
    });
    if (minted) turn.narration += `\n\n*✦ New technique discovered: **${minted.name}** — it's yours now.*`;
  }
  // earned xp: every meaningful resolved action teaches something (trivial acts don't)
  if (resolution && resolution.degree && resolution.degree !== "auto") {
    const xpT = CONTENT.rules.xp || {};
    let gain = xpT[resolution.degree] ?? 0;
    if (resolution.action?.novel && gain) gain += xpT.novelBonus ?? 0;
    character.xp += gain;
  }
  // SNG-011: precursor access unlock — only when the fiction earns it
  if (turn.unlockPrecursor?.abilityId && turn.unlockPrecursor?.via) {
    const pid = turn.unlockPrecursor.abilityId;
    const ab = fullCatalog()[pid];
    if (ab?.powerSystem === "precursor" && !(character.precursorAccess || []).includes(pid)) {
      character.precursorAccess = [...(character.precursorAccess || []), pid];
      turn.narration += `\n\n*✦ A door opens that was never on any list: **${ab.name}** may now be learned (${String(turn.unlockPrecursor.via).slice(0, 80)}).*`;
    }
  }
  // GM-granted new ability: earned in fiction, clamped by engine
  if (turn.newAbility) {
    const def = sanitizeNewAbility(turn.newAbility);
    const granted = def ? applyNewAbility(character, def, CONTENT.rules) : { ok: false };
    if (granted.ok) turn.narration += `

*✦ New ability learned: **${def.name}**${def.taughtBy ? ` (from ${def.taughtBy})` : ""} — ${def.description.slice(0, 120)}*`;
  }
  // level up: banked growth the player chooses to spend
  for (const msg of applyLevelUps(character, CONTENT.rules)) {
    turn.narration += `\n\n*You feel it settle into you — a new steadiness. (${msg})*`;
  }
  // quests: typed ops from the GM, applied within bounds
  applyQuestUpdates(character, turn.questUpdates || []);
  // time passes with the story (story mode; real mode advances itself) — plus
  // any in-scene hours the GM reported (sleep, waits, long work)
  const extraHours = Math.max(0, Math.min(12, Number(turn.timeAdvanceHours) || 0));
  advanceClock(character.clock, (turn.sceneEnded ? ADVANCE.sceneEnd : ADVANCE.beat) + extraHours);
  // scene anchor: the GM's updated scene state, clamped — or keep the previous one
  sceneState = sanitizeScene(turn.scene) || sceneState;
  // party: publish this beat to the shared scene (fire-and-forget)
  if (sharedScene && turn.sceneSummary) publishPartyBeat(resolution?.action?.label || "acted", resolution?.degree ?? null, turn.sceneSummary);
  // chronicle + scene persistence
  if (turn.sceneSummary) {
    sceneTurns.push({ summary: turn.sceneSummary, narration: turn.narration || "" });
    if (turn.sceneEnded) { character.chronicle.push(turn.sceneSummary); sceneTurns = []; sceneState = null; }
  }
  character.activeScene = turn.sceneEnded ? null : { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: turn, sceneState };
  saveCharacter(character); saveProfile(profile);

  // shared-world consequences (best-effort, never blocks play)
  if (syncEnabled()) {
    const events = (turn.ledgerEvents || []).map(e => ({
      schemaVersion: 1, at: new Date().toISOString(), who: character.id, playerKey: profile.playerKey,
      where: location.id, what: String(e.what || "").slice(0, 200), tags: e.tags || [],
      spectrumDeltas: e.spectrumDeltas || {}, visibility: e.visibility || "witnessed"
    }));
    if (events.length) appendLedger(events, character.id).catch(err => console.warn("[ledger]", err.message));
    backupSaves(character, profile);
  }
}

/** SNG-013: the current location's flat + vector modifier for an action, plus its
 *  player-facing receipt strings. Perceived-axis detail respects SNG-011 vectorsKnown. */
function affinityFor(action, location = hereNow()) {
  const vectorsKnown = character.placeMemory?.[location?.id]?.vectorsKnown || [];
  return locationAffinity(location, action, CONTENT.locationAffinities, { vectorsKnown });
}

async function onChoice(choice) {
  if (busy) return;
  let itemsAdvanced = [];
  const location = hereNow();
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);

  // ability gating + energy (combos draw from every ability involved; practiced
  // power costs less — effectiveEnergyCost scales with level and rank)
  let abilityLevel = 0, energyCost = choice.energyCost;
  if (choice.abilityId) {
    const owned = character.abilities.find(a => a.abilityId === choice.abilityId);
    if (!owned) { choice.abilityId = null; }
    else {
      abilityLevel = owned.level;
      energyCost = energyCost ?? effectiveEnergyCost(fullCatalog()[choice.abilityId], character, CONTENT.rules);
    }
  }
  if ((choice.comboAbilities || []).length > 1) {
    energyCost = choice.comboAbilities.reduce((sum, id) => sum + effectiveEnergyCost(fullCatalog()[id], character, CONTENT.rules), 0);
    abilityLevel = Math.min(...choice.comboAbilities.map(id => character.abilities.find(a => a.abilityId === id)?.level ?? 1));
  }
  // SNG-015 variable power: only ability/combo uses scale. Player may set choice.intensity
  // via the tune dial; otherwise AUTO picks the minimum intensity the task needs (never surge).
  const usesAbility = !!(choice.abilityId || (choice.comboAbilities || []).length);
  let intensity = "standard";
  if (usesAbility) {
    intensity = INTENSITIES.includes(choice.intensity) ? choice.intensity : null;
    if (!intensity) {
      const pAction = { label: choice.label, attribute: choice.attribute || "practical", subAttribute: SUBS.includes(choice.subAttribute) ? choice.subAttribute : null, axes: choice.axes || {}, difficulty: choice.difficulty || 0, tags: choice.intentTags || [], abilityLevel };
      const pe = equipmentBonus(character, pAction.tags, CONTENT.rules).bonus + companionBonus(activeCompanions(character, CONTENT.companions), pAction.tags, CONTENT.rules, character).bonus + affinityFor(pAction, location).bonus;
      const stdChance = successChance({ character, action: pAction, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: pe });
      intensity = autoIntensity(stdChance, CONTENT.intensity);
    }
    if (energyCost != null) energyCost = scaledEnergy(energyCost, intensity, CONTENT.intensity);
  }
  if (energyCost && character.energy < energyCost) { alert("Not enough energy — rest first."); return; }
  const action = {
    label: choice.label, attribute: choice.attribute || "practical",
    subAttribute: SUBS.includes(choice.subAttribute) ? choice.subAttribute : null,
    axes: choice.axes || {}, difficulty: choice.difficulty || 0, intentTags: choice.intentTags || [], abilityLevel,
    tags: choice.intentTags || [], planned: (choice.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)),
    novel: !!choice.novel, comboAbilities: choice.comboAbilities || [], noveltyHint: choice.noveltyHint || ""
  };
  // accepting ripe emergence (GM-offered choice carrying an engine-verified emergenceId)
  if (choice.emergenceId) {
    const tpl = validEmergenceId(character, CONTENT.emergence, CONTENT.rules, choice.emergenceId);
    if (tpl) {
      let minted = null;
      if (tpl.tier === "combo") {
        const nn = prompt(`Name your new technique (or leave as "${tpl.name}"):`, tpl.name);
        minted = acceptCombo(character, tpl, (nn || tpl.name).slice(0, 60), readClock(character.clock).day);
      } else {
        minted = acceptBranch(character, tpl);
      }
      saveCharacter(character);
      if (minted) {
        renderPlay(null, { thinking: "…", playerBeat: { label: choice.label } });
        const result = await runGM({ resolution: null, playerInput: `(Practice has ripened into breakthrough: the character accepts "${minted.name}" — ${tpl.tier === "combo" ? tpl.discoveredBlurb || tpl.description : tpl.grants}. Narrate the moment it clicks into something repeatable, then continue the scene.)` });
        if (result) renderPlay(result.turn, { playerBeat: { label: choice.label }, degraded: result.degraded });
        return;
      }
    }
  }
  // starting an encounter (GM-offered choice carrying a real encounterId)
  if (choice.encounterId && (CONTENT.encounters?.[choice.encounterId] || character.customEncounters?.[choice.encounterId]) && !character.activeEncounter) {
    const def = CONTENT.encounters?.[choice.encounterId] || character.customEncounters[choice.encounterId];
    character.activeEncounter = { defId: def.id, state: startEncounter(def) };
    saveCharacter(character);
    renderPlay(null, { thinking: "…", playerBeat: { label: choice.label } });
    const result = await runGM({ resolution: null, playerInput: `(The encounter "${def.name}" begins: ${def.setup} Narrate the opening and offer round choices.)` });
    if (result) renderPlay(result.turn, { playerBeat: { label: choice.label }, degraded: result.degraded });
    return;
  }
  // trivial actions — no real chance of failure, no cost: no dice, no energy
  if (choice.trivial && !choice.abilityId && !(choice.comboAbilities || []).length && !action.novel) {
    const resolution = { action, degree: "auto", roll: null, chance: null };
    renderPlay(null, { thinking: "…", playerBeat: { label: choice.label } });
    const result = await runGM({ resolution, playerInput: null, exactWords: choice.exactWords || null });
    if (result) renderPlay(result.turn, { playerBeat: { label: choice.label }, degraded: result.degraded });
    return;
  }
  // a technique already discovered isn't novel anymore — it's earned skill
  const abilityIds = [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean);
  const disc = action.novel ? knownDiscovery(character, abilityIds, action.noveltyHint) : null;
  if (disc) { action.novel = false; action.discoveryBonus = CONTENT.rules.novel?.discoveryBonus ?? 10; }
  const encD = activeEnc();
  if (encD) action.difficulty = (action.difficulty || 0) + encounterDifficulty(encD.state, encD.def, CONTENT.rules, { flee: choice.encounterAction === "flee" });
  const equip = equipmentBonus(character, action.intentTags, CONTENT.rules);
  const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.intentTags, CONTENT.rules, character);
  const aff = affinityFor(action, location);
  const iMod = usesAbility ? effectMod(intensity, CONTENT.intensity) : 0;
  const resolution = resolveAction({ character, action, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus + iMod });
  if (equip.bonus + comp.bonus > 0) resolution.equipHelpers = [...equip.helpers, ...comp.helpers];
  if (aff.bonus !== 0) resolution.locationAffinity = affinityReceipt(aff);
  if (usesAbility) { resolution.intensity = intensity; resolution.energySpent = energyCost; }
  if (disc) resolution.usedDiscovery = disc.name;
  // novel use: breakthrough or backlash — the engine decides, the GM narrates
  if (action.novel) {
    if (resolution.degree === "crit_success") {
      resolution.discoveryEligible = true;
      resolution.discoveryAbilities = abilityIds;
    } else if (resolution.degree === "crit_failure") {
      resolution.backlash = applyBacklash(character, CONTENT.rules);
    }
  }
  // SNG-015: a Surge that slips can bite — pay by the ability's Tier
  if (usesAbility && intensity === "surge" && shouldBacklash("surge", resolution.degree, CONTENT.intensity, Math.random)) {
    const surgedAb = fullCatalog()[choice.abilityId] || fullCatalog()[(choice.comboAbilities || [])[0]];
    resolution.backlash = applySurgeBacklash(character, surgedAb, CONTENT.intensity);
    resolution.surgeBacklash = true;
  }
  character.energy = applyEnergyCost(character, (choice.abilityId || (choice.comboAbilities || []).length > 1) ? energyCost : undefined, CONTENT.rules);
  // SNG-010: practice ledger — the single counting site
  {
    const usedIds = [choice.abilityId, ...(choice.comboAbilities || [])].filter(Boolean);
    if (usedIds.length) recordUse(character, usedIds);
    // SNG-010C: a cast channeled with a bond-source companion present wakes evolving gear
    itemsAdvanced = noteCoUseAndRefresh(character, { usedAbilityIds: usedIds, activeCompanionIds: activeCompanions(character, CONTENT.companions).map(c => c.id), catalog: CONTENT.items });
    if (usedIds.length) notePerception(character, character.currentLocationId, hereNow(), { visited: true, usedAbilityIds: usedIds }, CONTENT.rules);
    recordAspirationProgress(character, action, fullCatalog());
    // SNG-011: precursor peril — using these changes you (extra alignment drift along the ability's axes)
    for (const id of usedIds) {
      const ab = fullCatalog()[id];
      if (ab?.powerSystem === "precursor") {
        const drift = CONTENT.rules.precursor?.perilDrift ?? 0.05;
        const band = CONTENT.rules.precursor?.bandNotice ?? 0.4;
        character.precursorAxes = character.precursorAxes || [];
        for (const [ax, v] of Object.entries(ab.axes || {})) {
          const cur = character.alignment[ax] || 0;
          character.alignment[ax] = Math.max(-1, Math.min(1, cur + Math.sign(v) * drift));
          if (Math.abs(character.alignment[ax]) >= band && !character.precursorAxes.includes(ax)) character.precursorAxes.push(ax);
        }
      }
    }
  }
  // meditation: engine-owned recovery, scaled by attunement — the centered refill faster
  if ((action.intentTags || []).includes("meditate") && ["crit_success", "success", "partial"].includes(resolution.degree)) {
    const rec = CONTENT.rules.recovery || {};
    let gain = (rec.meditationBase ?? 10) + (rec.meditationPerAttunement ?? 2) * (character.attunement || 0);
    if (resolution.degree === "partial") gain = Math.ceil(gain / 2);
    character.energy = Math.min(character.maxEnergy, character.energy + gain);
    resolution.meditation = { energy: gain };
  }

  // active encounter: map the receipt onto encounter state (engine-owned)
  const enc = activeEnc();
  if (enc) {
    const opts = { flee: choice.encounterAction === "flee", yield: choice.encounterAction === "yield", abandon: choice.encounterAction === "abandon", walkAway: choice.encounterAction === "walkAway" };
    let rr = null;
    if (enc.def.type === "duel") rr = duelRound(enc.state, enc.def, resolution, CONTENT.rules, opts);
    else if (enc.def.type === "challenge") rr = challengeStage(enc.state, enc.def, resolution, CONTENT.rules, opts);
    else if (enc.def.type === "puzzle") rr = puzzleAttempt(enc.state, enc.def, resolution, CONTENT.rules, opts);
    if (rr) {
      character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas.health || 0)));
      character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + (rr.deltas.energy || 0)));
      if (rr.hours) advanceClock(character.clock, rr.hours);
      character.activeEncounter = { defId: enc.def.id, state: rr.state };
      let outcome = rr.ended ? rr.outcome : null;
      if (!rr.ended && checkIncapacitation(character)) { outcome = "incapacitated"; rr.state.status = "ended"; }
      resolution.encounterReceipt = encounterReceiptForGM(rr.state, enc.def, resolution, { ...rr, outcome });
      if (outcome) endEncounter(outcome); else saveCharacter(character);
    }
  }
  renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, resolution } });
  const result = await runGM({ resolution, playerInput: null, exactWords: choice.exactWords || null, itemAdvance: itemsAdvanced });
  if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, resolution }, degraded: result.degraded, itemsAdvanced });
}

async function onFreeform(text) {
  if (busy || !text.trim()) return;
  lastPlayerText = text;
  renderPlay(null, { thinking: "Reading your intent…", playerBeat: { label: text } });
  const location = CONTENT.locations[character.currentLocationId];
  const intent = await parseIntent(text, character, location);
  if (intent.feasible === false) {
    renderPlay(character.activeScene?.lastTurn || null, { aside: intent.infeasibleReason || "That isn't possible here." });
    return;
  }
  await onChoice({
    label: intent.label || text, attribute: intent.attribute, subAttribute: intent.subAttribute,
    axes: intent.axes, difficulty: intent.difficulty, intentTags: intent.intentTags,
    abilityId: intent.abilityId, energyCost: null,
    novel: !!intent.novelUse || (intent.comboAbilities || []).length > 1,
    comboAbilities: (intent.comboAbilities || []).filter(id => character.abilities.some(a => a.abilityId === id)),
    noveltyHint: intent.noveltyHint || "",
    trivial: !!intent.trivial,
    exactWords: text
  });
}

/** Dev/test flag: ?dev=1 in the URL or localStorage singularity.dev="1". Gates the
 *  encounter test panel — never shown in normal play. */
function isDev() {
  try { return new URLSearchParams(location.search).has("dev") || localStorage.getItem("singularity.dev") === "1"; }
  catch { return false; }
}

/** Fire a specific random encounter (entry object) or a forced flavor (dev). Registers
 *  any synthesized encounter def, then either opens a GM scene (narrative/opposed) or
 *  renders an engine-built OFFER beat with a guaranteed decline path (challenge/duel). */
async function fireEncounter(entryOrFlavor, { dev = false, news = [] } = {}) {
  const table = CONTENT.randomEncounters;
  if (!table) return false;
  const entry = typeof entryOrFlavor === "string"
    ? pickEncounter(table, hereNow(), Math.random, { flavor: entryOrFlavor, ignoreDanger: dev })
    : entryOrFlavor;
  if (!entry) { if (dev) renderPlay(character.activeScene?.lastTurn || null, { aside: `No ${entryOrFlavor} encounter fits here.` }); return false; }
  const offer = buildOffer(entry, character, fullCatalog(), CONTENT.rules);
  if (offer.def) {
    character.customEncounters = character.customEncounters || {};
    character.customEncounters[offer.def.id] = offer.def;
    saveCharacter(character);
  }
  if (offer.routing === "narrative" || offer.routing === "opposed") {
    await startScene(offer.prompt, news, dev ? `🔧 test: ${entry.flavor} (${entry.id})` : null);
    return true;
  }
  // deterministic offer beat — decline/flee is on the table BEFORE engagement (SNG-002b)
  const offerTurn = { narration: offer.narration, choices: offer.choices, sceneEnded: false };
  if (character.activeScene) { character.activeScene.lastTurn = offerTurn; saveCharacter(character); }
  renderPlay(offerTurn, { newsFlash: news, playerBeat: dev ? { label: `🔧 test encounter: ${entry.flavor} (${entry.id})` } : null });
  return true;
}

/** On a trigger (travel/rest/enter/tick), maybe roll one encounter. Returns true if
 *  one fired (so the caller skips the normal arrival/rest scene). */
async function maybeRandomEncounter(trigger, news = []) {
  const table = CONTENT.randomEncounters;
  if (!table || !rollTrigger(trigger, hereNow(), table, Math.random)) return false;
  const entry = pickEncounter(table, hereNow(), Math.random, {});
  if (!entry) return false;
  return fireEncounter(entry, { news });
}

async function travelTo(locId) {
  if (busy) return;
  character.currentLocationId = locId;
  character.activeScene = null;
  sceneTurns = [];
  sceneState = null;
  advanceClock(character.clock, ADVANCE.travel);
  notePlaceVisit(character, locId, readClock(character.clock).day);
  notePerception(character, locId, CONTENT.locations[locId], { visited: true, usedAbilityIds: [] }, CONTENT.rules);
  saveCharacter(character);
  const news = await maybeTick();
  if (await maybeRandomEncounter("onTravel", news)) return; // the road had something to say
  if (await maybeRandomEncounter("onEnterLocation", news)) return; // arrival itself had something waiting
  startScene(`(The character has just arrived here, traveling from elsewhere in the valley. Open the scene with the arrival.)`, news);
}

async function rest(kind = "sleep") {
  if (busy) return;
  const rec = CONTENT.rules.recovery || {};
  const r = kind === "breather" ? (rec.breather || { energy: 10, health: 1, hours: 1 }) : (rec.sleep || { energy: 40, health: 3, hours: 8 });
  character.energy = Math.min(character.maxEnergy, character.energy + r.energy);
  character.health = Math.min(character.maxHealth, character.health + r.health);
  if (kind === "breather") {
    advanceClock(character.clock, r.hours);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You take an hour off your feet. (+${r.energy} energy, +${r.health} health)` });
    return;
  }
  sceneTurns = [];
  sceneState = null; // hours pass — the old scene has dissolved
  advanceClock(character.clock, r.hours);
  saveCharacter(character);
  const news = await maybeTick();
  if (await maybeRandomEncounter("onRest", news)) return; // the night was not quiet
  startScene(`(The character takes a real night's rest here — camp, inn, or quiet corner. Narrate the rest briefly, then present what's happening when they get up. ${r.hours} hours have passed; do not grant additional energy — the engine already restored them.)`, news);
}

async function onAsk(text) {
  if (busy || !text.trim()) return;
  lastPlayerText = text;
  busy = true;
  const lastTurn = character.activeScene?.lastTurn || null;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, thinking: "The GM leans back…" });
  const location = hereNow();
  const time = readClock(character.clock);
  const result = await gmAsk({
    character, location, rules: CONTENT.rules,
    lore: loreForLocation(location, CONTENT.lore),
    region: { ...CONTENT.region, activeEvents: eventsForGM(buildRegionView(CONTENT, character), CONTENT.events) },
    recentTurns: sceneTurns.slice(-6),
    timeLabel: time.label,
    inventoryDetail: inventoryForGM(character),
    companionsDetail: companionsForGM(activeCompanions(character, CONTENT.companions), character, CONTENT.rules),
    questsDetail: questsForGM(character),
    sceneState,
    npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) }),
    placeMemoryDetail: placeMemoryForGM(character, character.currentLocationId),
    newsDetail: newsForGM(character),
    abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks),
    codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: (character.quests || []).filter(q => q.status === "active").map(q => q.title) })
  }, text);
  busy = false;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, gmAside: result.ok ? result.text : "The GM stumbled: " + result.error });
}

// ---------- world map ----------

function renderMap(selectedId = null) {
  const locs = Object.values(CONTENT.locations);
  const here = character.currentLocationId;
  const connectedToHere = CONTENT.locations[here]?.connections || [];
  // dedupe edges
  const edges = [];
  const seen = new Set();
  for (const l of locs) for (const c of l.connections || []) {
    const key = [l.id, c].sort().join("~");
    if (!seen.has(key) && CONTENT.locations[c]) { seen.add(key); edges.push([l.id, c]); }
  }
  const stage = character.worldState?.eventStages?.water_crisis?.stage ?? 1;
  const isVisited = id => (character.placeMemory?.[id]?.visits || 0) > 0 || id === here;
  const svg = `<svg viewBox="0 0 800 440" class="world-map">
    <text x="20" y="30" class="map-title">THE VALLEY OF ECHOES</text>
    <text x="20" y="50" class="map-sub">Day ${readClock(character.clock).day} · Water Crisis stage ${stage}</text>
    ${edges.map(([a, b]) => { const A = CONTENT.locations[a].map, B = CONTENT.locations[b].map;
      return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="map-edge ${a === here || b === here ? "active" : ""}"/>`; }).join("")}
    ${locs.map(l => {
      const visited = isVisited(l.id);
      const reachable = connectedToHere.includes(l.id);
      const pm = character.placeMemory?.[l.id];
      const cls = `map-node ${l.id === here ? "here" : ""} ${reachable ? "reachable" : ""} ${visited ? "" : "unvisited"} ${l.dangerLevel >= 3 ? "danger" : ""} ${selectedId === l.id ? "selected" : ""}`;
      const tip = visited
        ? `${l.name}${l.id === here ? " — you are here" : ""}${pm?.visits ? ` · ${pm.visits} visit${pm.visits > 1 ? "s" : ""}` : ""}${l.dangerLevel >= 3 ? " · DANGEROUS" : ""}${reachable ? " · one travel away" : ""}`
        : `Unknown place — you've only heard of it${reachable ? " · one travel away" : ""}`;
      return `<g class="${cls}" data-mapsel="${esc(l.id)}">
        <title>${esc(tip)}</title>
        <circle class="hit" cx="${l.map.x}" cy="${l.map.y}" r="24"/>
        <circle cx="${l.map.x}" cy="${l.map.y}" r="${l.id === here ? 14 : 10}"/>
        ${(() => { const sps = Object.values(character.placeMemory?.[l.id]?.subPlaces || {}); return sps.slice(0, 6).map((sp, si) => {
          const ang = (si / Math.max(1, Math.min(sps.length, 6))) * Math.PI * 2 - Math.PI / 2;
          const sx = l.map.x + Math.cos(ang) * 22, sy = l.map.y + Math.sin(ang) * 22;
          return `<circle cx="${sx}" cy="${sy}" r="4" class="map-satellite ${sp.visited ? "visited" : "heard"}"><title>${esc(sp.name)}${sp.note ? " — " + esc(sp.note) : ""}${sp.visited ? "" : " (heard of)"}</title></circle>`;
        }).join(""); })()}
        <text x="${l.map.x}" y="${l.map.y + (l.map.y > 300 ? 32 : -20)}" text-anchor="middle" class="map-label">${esc(visited ? l.name : "?")}</text>
        ${visited && pm?.visits > 1 ? `<text x="${l.map.x}" y="${l.map.y + (l.map.y > 300 ? 46 : -6)}" text-anchor="middle" class="map-visits">×${pm.visits}</text>` : ""}
      </g>`; }).join("")}
  </svg>`;
  // details panel for the selected node — travel is an explicit button, never a stray click
  let details = "";
  if (selectedId && CONTENT.locations[selectedId]) {
    const l = CONTENT.locations[selectedId];
    const visited = isVisited(l.id);
    const pm = character.placeMemory?.[l.id];
    const reachable = connectedToHere.includes(l.id);
    details = `<div class="map-details">
      <div class="map-details-head">
        <h3>${esc(visited ? l.name : "An unknown place")}</h3>
        ${l.dangerLevel >= 3 ? `<span class="rep-band wary">dangerous</span>` : ""}
        ${l.id === here ? `<span class="rep-band trusted">you are here</span>` : ""}
      </div>
      ${visited
        ? `<p class="map-details-desc">${esc(l.descriptionSeed.slice(0, 260))}${l.descriptionSeed.length > 260 ? "…" : ""}</p>
           ${(() => { const vs = vectorSummary(character, l.id, l, CONTENT.spectrums, CONTENT.rules); return vs ? `<div class="place-vectors">${esc(vs)}</div>` : ""; })()}
           ${pm?.visits ? `<div class="hint">${pm.visits} visit${pm.visits > 1 ? "s" : ""}${pm.lastVisit != null ? ` · last on day ${pm.lastVisit}` : ""}</div>` : ""}
           ${pm?.notes?.length ? `<div class="map-details-notes">${pm.notes.slice(-3).map(n => `<div class="codex-fact">${esc(n)}</div>`).join("")}</div>` : ""}
           ${Object.keys(pm?.subPlaces || {}).length ? `<div class="sub-places"><span class="hint">Places within: </span>${Object.entries(pm.subPlaces).map(([slug, sp]) => `<button class="codex-link ${sp.visited ? "" : "dead"}" data-subgo="${esc(slug)}" data-subloc="${esc(l.id)}" title="${esc(sp.note || (sp.visited ? "you have been here" : "heard of only"))}">${esc(sp.name)}</button>`).join(" ")}</div>` : ""}`
        : `<p class="map-details-desc">You've heard travelers mention it, nothing more. Someone would have to go and see.</p>`}
      ${l.id !== here ? (reachable
        ? `<button class="btn" id="map-travel" data-dest="${esc(l.id)}" style="margin-top:8px">Travel here (+${ADVANCE.travel}h)</button>`
        : `<div class="hint" style="margin-top:6px">Not directly reachable from ${esc(CONTENT.locations[here]?.name || "here")} — travel via a connected place.</div>`) : ""}
    </div>`;
  }
  chrome(`<div class="screen" style="max-width:860px">
    <h2>World Map</h2>
    <p class="hint" style="margin-bottom:8px">Gold ring: you are here. Hover a place for a quick read; click it for details and travel.</p>
    ${svg}
    ${details}
    <button class="btn secondary" id="map-back" style="margin-top:12px">Back</button>
  </div>`);
  for (const g of app.querySelectorAll("[data-mapsel]")) g.onclick = () => renderMap(g.dataset.mapsel === selectedId ? null : g.dataset.mapsel);
  const travelBtn = document.getElementById("map-travel");
  if (travelBtn) travelBtn.onclick = () => travelTo(travelBtn.dataset.dest);
  for (const b of app.querySelectorAll("[data-subgo]")) b.onclick = () => {
    const pm = character.placeMemory?.[b.dataset.subloc];
    const sp = pm?.subPlaces?.[b.dataset.subgo];
    if (!sp) return;
    if (b.dataset.subloc !== character.currentLocationId) { alert("Travel to " + (CONTENT.locations[b.dataset.subloc]?.name || "that place") + " first — then head to the " + sp.name + "."); return; }
    renderPlay(character.activeScene?.lastTurn || null, {});
    onFreeform(`Head to the ${sp.name}`);
  };
  document.getElementById("map-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- skill KG graph (SNG-011 Phase 3a — rendered like the world map) ----------

function renderSkillGraph(selectedId = null) {
  const model = skillGraphModel(fullCatalog(), CONTENT.emergence, character, {
    attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, branchForks: CONTENT.branchForks,
    preds: {
      isRipe: id => ripeCombos(character, CONTENT.emergence, CONTENT.rules).some(r => r.id === id) || ripeBranches(character, CONTENT.emergence).some(t => t.id === id),
      isAspired: id => (character.practice?.aspirations || []).some(a => a.abilityId === id)
    }
  });
  const classes = [...new Set(model.nodes.map(n => n.cls))];
  const colW = 150, rowH = 46, padX = 70, padY = 70;
  // layout: class column, tier→name order within column
  const pos = {};
  classes.forEach((cls, ci) => {
    const col = model.nodes.filter(n => n.cls === cls).sort((a, b) => a.levelReq - b.levelReq || a.name.localeCompare(b.name));
    col.forEach((n, ri) => { pos[n.id] = { x: padX + ci * colW, y: padY + ri * rowH }; });
  });
  const virtuals = [...new Set(model.edges.map(e => e.virtual))];
  virtuals.forEach((vid, vi) => { pos[vid] = { x: padX + classes.length * colW + 20, y: padY + vi * rowH * 1.6 }; });
  const width = padX + (classes.length + 1) * colW + 60;
  const height = Math.max(padY + 8 * rowH, padY + virtuals.length * rowH * 1.6 + 40,
    ...classes.map(cls => padY + model.nodes.filter(n => n.cls === cls).length * rowH + 40));
  const recipeName = id => (CONTENT.emergence.recipes || []).find(r => r.id === id)?.name || (CONTENT.emergence.branchTemplates || []).find(t => t.id === id)?.name || id;

  const svg = `<svg viewBox="0 0 ${width} ${height}" class="world-map skill-graph">
    ${classes.map((cls, ci) => `<text x="${padX + ci * colW}" y="36" text-anchor="middle" class="graph-class-label" fill="${classColor(cls)}">${esc(classLabel(cls))}</text>`).join("")}
    ${virtuals.length ? `<text x="${padX + classes.length * colW + 20}" y="36" text-anchor="middle" class="graph-class-label" fill="${classColor("discovery")}">Emergence</text>` : ""}
    ${model.edges.map(e => { const A = pos[e.from], B = pos[e.virtual]; return A && B ? `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="graph-edge ${e.kind}"/>` : ""; }).join("")}
    ${model.nodes.map(n => { const p = pos[n.id]; const r = 6 + (n.levelReq - 1) * 1.5;
      const cls = `graph-node ${n.owned ? "owned" : ""} ${n.ripe ? "ripe" : ""} ${n.aspired ? "aspired" : ""} ${n.locked ? "locked" : ""} ${selectedId === n.id ? "selected" : ""}`;
      return `<g class="${cls}" data-skillnode="${esc(n.id)}"><title>${esc(n.name + " — Tier " + n.tier + " (L" + n.levelReq + ")" + (n.owned ? ", rank " + n.rank : "") + (n.locked ? " 🔒 " + n.lockText : ""))}</title>
        <circle class="hit" cx="${p.x}" cy="${p.y}" r="18"/>
        <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${n.owned ? classColor(n.cls) : "#23262e"}" stroke="${classColor(n.cls)}"/>
        ${n.locked ? `<text x="${p.x}" y="${p.y - r - 3}" text-anchor="middle" class="graph-lock">🔒</text>` : ""}
        ${n.forks ? `<text x="${p.x - r - 5}" y="${p.y + 4}" text-anchor="middle" class="graph-fork ${n.forkChosen ? "chosen" : ""}">⑂</text>` : ""}
        <text x="${p.x + r + 4}" y="${p.y + 3}" class="graph-node-label ${n.owned ? "owned" : ""}">${esc(n.name)} <tspan class="graph-tier">${n.tier}</tspan></text>
      </g>`; }).join("")}
    ${virtuals.map(vid => { const p = pos[vid]; return `<g class="graph-node virtual" data-skillnode="${esc(vid)}"><title>${esc(recipeName(vid))}</title>
      <rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" transform="rotate(45 ${p.x} ${p.y})" fill="#23262e" stroke="${classColor("discovery")}"/>
      <text x="${p.x + 10}" y="${p.y + 3}" class="graph-node-label">${esc(recipeName(vid))}</text></g>`; }).join("")}
  </svg>`;

  const sel = selectedId ? model.nodes.find(n => n.id === selectedId) : null;
  const selAb = sel ? fullCatalog()[sel.id] : null;
  const details = sel ? `<div class="map-details">
    <div class="map-details-head"><h3>${esc(sel.name)}</h3>
      <span class="rep-band" style="border-color:${classColor(sel.cls)};color:${classColor(sel.cls)}">${esc(classLabel(sel.cls))} · Tier ${sel.tier}</span>
      ${sel.owned ? `<span class="rep-band trusted">owned · rank ${sel.rank}</span>` : ""}</div>
    <div class="hint">Level requirement: ${sel.levelReq}${sel.gated ? ` · ${(() => { const g = gateFor(sel.id, CONTENT.attributeGates); return `needs ${g.subAttribute} ${g.learnMin} (rank 3: ${g.rank3Min})`; })()}` : ""}${sel.locked ? ` · 🔒 ${esc(sel.lockText)}` : ""}</div>
    <p class="map-details-desc">${esc(selAb?.description || "")}</p>
    ${sel.forks ? `<div class="codex-fact fork-note"><strong>⑂ Fork at rank ${sel.forkAt}:</strong> ${sel.forkChosen ? `specialized as <em>${esc(sel.forkChosen)}</em> — <span class="fp-cannot">${esc(sel.forkLocked)} locked forever</span>` : "a permanent A-or-B specialization when you rank into it — the path you don't take locks."}</div>` : ""}
    ${(selAb?.tree || []).map(t => `<div class="codex-fact"><strong>${tierOf(sel.levelReq)}·r${t.rank} ${esc(t.name)}:</strong> ${esc(t.grants)} <em>(cannot: ${esc(t.cannot)})</em></div>`).join("")}
  </div>` : "";

  chrome(`<div class="screen" style="max-width:960px">
    <h2>Skill Graph</h2>
    <p class="hint" style="margin-bottom:8px">Every ability by class (color) and Tier I–V (size). Filled = owned. Gold ring = aspired · teal ring = ripe to claim · 🔒 = gated. Diamonds are emergence techniques; lines link their components.</p>
    <div style="overflow:auto; max-height:70vh">${svg}</div>
    ${details}
    <button class="btn secondary" id="graph-back" style="margin-top:12px">Back</button>
  </div>`);
  for (const g of app.querySelectorAll("[data-skillnode]")) g.onclick = () => renderSkillGraph(g.dataset.skillnode === selectedId ? null : g.dataset.skillnode);
  document.getElementById("graph-back").onclick = () => renderCharacterScreen();
}

// ---------- character & inventory screens (SNG-007) ----------

function renderCharacterScreen() {
  const rules = CONTENT.rules;
  const cap = rules.leveling?.subAttributeCap ?? 20;
  const soft = rules.baseChance?.attributeSoftCap ?? 4;
  const b = character.bio || {};
  const xpNeed = character.level * (rules.leveling?.xpPerLevel ?? 100);
  chrome(`<div class="screen" style="max-width:760px">
    <h2>${esc(character.name)}</h2>
    <div class="hint">${esc(character.origin)} · ${esc(character.background)} · level ${character.level} — ${character.xp}/${xpNeed} xp${character.pendingSubPoints ? ` · <span class="grow-badge">+${character.pendingSubPoints} attribute</span>` : ""}${character.skillPoints ? ` · <span class="grow-badge">${character.skillPoints} skill</span>` : ""}</div>
    ${Object.values(b).some(v => v) ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Story</h3>
      ${["hometown", "residence", "livelihood", "hobbies", "motivation"].filter(k => b[k]).map(k => `<div class="codex-fact"><strong style="text-transform:capitalize">${k}:</strong> ${esc(b[k])}</div>`).join("")}
      ${b.story ? `<p class="map-details-desc" style="margin-top:8px">${esc(b.story)}</p>` : ""}</div>` : ""}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Attributes <span class="hint" style="text-transform:none">(knee at ${soft}: full value to there, +5/point beyond, cap ${cap})</span></h3>
      ${SUBS.map(sub => { const v = character.subAttributes?.[sub] ?? 0; return `
        <div class="cs-attr"><span class="cs-attr-name" title="${esc(SUB_DESC[sub])}">${sub}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, v / cap * 100)}%"></div><div class="cs-knee" style="left:${soft / cap * 100}%"></div></div>
          <span class="cs-val">${v}</span>
          ${character.pendingSubPoints > 0 && v < cap ? `<button class="grow-btn" data-grow2="${sub}">+</button>` : ""}
        </div>`; }).join("")}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Abilities <span class="cap-line" style="text-transform:none">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity; points deepen owned skills" : ""}</span></h3>
      ${character.abilities.map(a => { const ab = fullCatalog()[a.abilityId]; if (!ab) return ""; const cost = effectiveEnergyCost(ab, character, rules);
        const nextReq = rules.leveling?.rankLevelReq?.[String(a.level + 1)];
        const canRank = character.skillPoints > 0 && a.level < (rules.leveling?.maxAbilityRank ?? 3) && character.level >= (nextReq ?? 1);
        return `<div class="cs-ability"><span class="tier-badge">${tierOf(ab.levelReq)}</span> <strong>${esc(ab.name)}</strong> <span class="hint">(${ab.powerSystem === "learned" ? "learned" : ab.powerSystem}) · ${cost} energy${cost < ab.energyCost ? ` (was ${ab.energyCost})` : ""}</span>
          <span class="cs-ranks">${[1, 2, 3].map(r => `<span class="${r <= a.level ? "cs-rank-on" : "cs-rank-off"}" title="${esc(ab.tree?.[r - 1]?.name || "")}">${r <= a.level ? "●" : "○"}</span>`).join("")}</span>
          ${canRank ? `<button class="grow-btn" data-rank2="${esc(a.abilityId)}">▲</button>` : ""}
          ${ab.tree?.[a.level - 1] ? `<div class="hint">${esc(ab.tree[a.level - 1].name)}: ${esc(ab.tree[a.level - 1].grants)}</div>` : ""}</div>`; }).join("")}
      ${(character.discoveries || []).map(d => `<div class="discovery" title="${esc(d.description)}">✦ ${esc(d.name)} (discovered technique)</div>`).join("")}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Aspirations <span class="hint" style="text-transform:none">(declare what you're working toward — practice makes it free)</span></h3>
      ${(character.practice?.aspirations || []).map(a => { const ab = fullCatalog()[a.abilityId]; const ripe = aspirationRipe(character, a.abilityId, rules); const need = rules.practice?.aspirationRipe ?? 10;
        return `<div class="cs-attr"><span class="cs-attr-name" style="width:140px">${esc(ab?.name || a.abilityId)}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, (a.progress || 0) / need * 100)}%"></div></div>
          <span class="cs-val">${Math.min(a.progress || 0, need)}/${need}</span>
          ${ripe && character.level >= (effectiveLevelReq(ab, character, rules) ?? 99) ? `<button class="grow-btn practiced" data-asplearn="${esc(a.abilityId)}" title="Fully practiced — learn free">✓</button>` : ""}
          <button class="grow-btn" data-aspdrop="${esc(a.abilityId)}" title="Drop aspiration" style="background:var(--panel2); color:var(--ink-dim)">×</button>
        </div>`; }).join("") || "<div class='insight'>none declared</div>"}
      ${(character.practice?.aspirations || []).length < (rules.practice?.maxAspirations ?? 2) ? `
        <select id="asp-pick" style="margin-top:6px; max-width:280px">
          <option value="">Aspire toward…</option>
          ${Object.values(fullCatalog()).filter(ab => !character.abilities.some(a => a.abilityId === ab.id) && effectiveLevelReq(ab, character, rules) !== null && !(character.practice?.aspirations || []).some(a => a.abilityId === ab.id)).map(ab => `<option value="${esc(ab.id)}">${esc(ab.name)} (${ab.powerSystem}, lv ${effectiveLevelReq(ab, character, rules)})</option>`).join("")}
        </select>` : ""}
    </div>
    ${(() => {
      const combos = ripeCombos(character, CONTENT.emergence, rules);
      const branches = ripeBranches(character, CONTENT.emergence);
      if (!combos.length && !branches.length) return "";
      return `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Ripe to claim <span class="hint" style="text-transform:none">(practice has ripened these — claim now or let the GM offer them in play)</span></h3>
        ${combos.map(r => `<div class="cs-ability"><strong>${esc(r.name)}</strong> <span class="hint">(combo: ${r.components.join(" + ")})</span> <button class="grow-btn practiced" data-claimcombo="${esc(r.id)}">claim</button><div class="hint">${esc(r.description.slice(0, 120))}</div></div>`).join("")}
        ${branches.map(t => `<div class="cs-ability"><strong>${esc(t.name)}</strong> <span class="hint">(branch: grows ${t.growsAbility})</span> <button class="grow-btn practiced" data-claimbranch="${esc(t.id)}">claim</button><div class="hint">${esc(t.grants.slice(0, 120))}</div></div>`).join("")}
      </div>`;
    })()}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Play-style (${esc(character.name)}'s own)</h3>
      <div class="insight">${esc(profileInsight(character, rules.playerAptitudes))}</div></div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Active quests</h3>
      ${(character.quests || []).filter(q => q.status === "active").map(q => `<div class="codex-fact"><strong>${esc(q.title)}</strong> — ${esc(q.progress?.slice(-1)[0] || q.summary)}</div>`).join("") || "<div class='insight'>none</div>"}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Companions</h3>
      ${activeCompanions(character, CONTENT.companions).map(c => `<div class="codex-fact"><strong>${esc(c.name)}</strong> — assists: ${(c.assistTags || []).join(", ")}</div>`).join("") || "<div class='insight'>traveling alone</div>"}</div>
    <button class="btn secondary" id="cs-skillgraph" style="margin-top:10px; margin-right:8px">🗺 Skill Graph</button>
    <button class="btn secondary" id="cs-back" style="margin-top:10px">Back</button>
  </div>`);
  for (const btn of app.querySelectorAll("[data-grow2]")) btn.onclick = () => { if (spendSubPoint(character, btn.dataset.grow2, rules)) { saveCharacter(character); renderCharacterScreen(); } };
  for (const btn of app.querySelectorAll("[data-rank2]")) btn.onclick = () => {
    const id = btn.dataset.rank2;
    const owned = character.abilities.find(a => a.abilityId === id);
    const doRank = () => { const r = rankUpAbility(character, id, rules, rankOptsFor()); if (r.ok) { saveCharacter(character); renderCharacterScreen(); } else alert(r.why); };
    if (owned && forkPending(character, id, owned.level + 1, CONTENT.branchForks)) {
      renderForkModal(id, (key) => { setFork(character, id, key, CONTENT.branchForks); doRank(); });
    } else doRank();
  };
  const aspPick = document.getElementById("asp-pick");
  if (aspPick) aspPick.onchange = () => { if (aspPick.value) { const r = declareAspiration(character, aspPick.value, rules); if (r.ok) { saveCharacter(character); renderCharacterScreen(); } else alert(r.why); } };
  for (const btn of app.querySelectorAll("[data-aspdrop]")) btn.onclick = () => { dropAspiration(character, btn.dataset.aspdrop); saveCharacter(character); renderCharacterScreen(); };
  for (const btn of app.querySelectorAll("[data-asplearn]")) btn.onclick = () => {
    const id = btn.dataset.asplearn;
    const r = learnAbility(character, id, fullCatalog(), rules, { free: true, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity });
    if (r.ok) { dropAspiration(character, id); saveCharacter(character); renderCharacterScreen(); } else alert(r.why);
  };
  for (const btn of app.querySelectorAll("[data-claimcombo]")) btn.onclick = () => {
    const tpl = validEmergenceId(character, CONTENT.emergence, rules, btn.dataset.claimcombo);
    if (!tpl) return renderCharacterScreen();
    const nn = prompt(`Name your new technique (or leave as "${tpl.name}"):`, tpl.name);
    acceptCombo(character, tpl, (nn || tpl.name).slice(0, 60), readClock(character.clock).day);
    saveCharacter(character); renderCharacterScreen();
  };
  for (const btn of app.querySelectorAll("[data-claimbranch]")) btn.onclick = () => {
    const tpl = validEmergenceId(character, CONTENT.emergence, rules, btn.dataset.claimbranch);
    if (tpl) { acceptBranch(character, tpl); saveCharacter(character); }
    renderCharacterScreen();
  };
  const sgBtn = document.getElementById("cs-skillgraph"); if (sgBtn) sgBtn.onclick = () => renderSkillGraph();
  document.getElementById("cs-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

function renderInventoryScreen(openName = null) {
  const kinds = ["weapon", "tool", "consumable", "quest", "misc"];
  chrome(`<div class="screen" style="max-width:680px">
    <h2>Inventory — ${esc(character.name)}</h2>
    ${kinds.filter(k => (character.inventory || []).some(i => i.kind === k)).map(k => `
      <div class="cs-block"><h3 class="codex-title" style="font-size:14px; text-transform:capitalize">${k}s</h3>
      ${(character.inventory || []).filter(i => i.kind === k).map(it => `
        <div class="inv-row">
          <button class="item-name" data-inv="${esc(it.name)}">${esc(displayName(it))}${it.customName ? ` <span class="cost">(${esc(it.name)})</span>` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}</button>
          ${openName === it.name ? `<div class="item-detail">
            <div class="item-desc">${esc(it.description || it.kind)}</div>
            ${it.bonusTags?.length ? `<div class="item-tags">helps with: ${it.bonusTags.map(esc).join(", ")}</div>` : ""}
            ${it.effects ? `<div class="item-tags">${Object.entries(it.effects).map(([k2, v]) => `${k2} ${v > 0 ? "+" : ""}${v}`).join(", ")}</div>` : ""}
            <div class="item-actions">
              <button class="opt" data-invuse="${esc(it.name)}">${it.consumable ? "Consume" : "Use in scene"}</button>
              <button class="opt" data-invname="${esc(it.name)}">Name it</button>
              <button class="opt" data-invdrop="${esc(it.name)}">Drop</button>
            </div></div>` : ""}
        </div>`).join("")}</div>`).join("") || "<div class='insight'>empty-handed</div>"}
    <button class="btn secondary" id="inv-back" style="margin-top:10px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-inv]")) b.onclick = () => renderInventoryScreen(openName === b.dataset.inv ? null : b.dataset.inv);
  for (const b of app.querySelectorAll("[data-invuse]")) b.onclick = () => { const n = b.dataset.invuse; renderPlay(character.activeScene?.lastTurn || null, {}); useItem(n); };
  for (const b of app.querySelectorAll("[data-invdrop]")) b.onclick = () => { if (confirm("Drop " + b.dataset.invdrop + "?")) { removeItem(character, b.dataset.invdrop, 999); saveCharacter(character); renderInventoryScreen(); } };
  for (const b of app.querySelectorAll("[data-invname]")) b.onclick = () => { const nn = prompt("Name this item:"); if (nn !== null && nameItem(character, b.dataset.invname, nn)) { saveCharacter(character); renderInventoryScreen(b.dataset.invname); } };
  document.getElementById("inv-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- quest detail ----------

function renderQuestDetail(questId, guidance = null, loading = false) {
  const q = (character.quests || []).find(x => x.id === questId);
  if (!q) { renderPlay(character.activeScene?.lastTurn || null, {}); return; }
  chrome(`<div class="screen" style="max-width:680px">
    <div class="codex-kind">${esc(q.status)}</div>
    <h2 style="margin-top:4px">${esc(q.title)}</h2>
    <p class="map-details-desc">${esc(q.summary)}</p>
    <div class="hint">${q.giver ? `From ${esc(q.giver)} · ` : ""}started ${q.startedAt ? "day " + esc(String(q.startedAtDay ?? "").trim() || new Date(q.startedAt).toLocaleDateString()) : "a while back"}</div>
    ${q.progress?.length ? `<div style="margin-top:12px"><h3 class="codex-title" style="font-size:15px">The story so far</h3>${q.progress.map(p => `<div class="codex-fact">${esc(p)}</div>`).join("")}</div>` : ""}
    <div style="margin-top:14px">
      ${guidance ? `<div class="gm-aside">${guidance.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
      ${loading ? `<div class="thinking">The GM considers your situation…</div>` : `<button class="btn secondary" id="quest-guidance">Ask the GM for guidance</button>`}
      <div class="hint" style="margin-top:6px">Spoiler-safe: possible next steps, who might help, how hard it looks — never the hidden truth.</div>
    </div>
    ${q.status === "active" ? `<button class="btn secondary" id="quest-resolve" style="margin-top:14px; margin-right:8px" title="Repair: if the story completed this but the tracker missed it">Mark complete (repair)</button>` : ""}
    <button class="btn secondary" id="quest-back" style="margin-top:14px">Back</button>
  </div>`);
  document.getElementById("quest-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
  const rBtn = document.getElementById("quest-resolve");
  if (rBtn) rBtn.onclick = () => {
    if (!confirm(`Mark "${q.title}" complete? Use this when the story finished it but the tracker missed it.`)) return;
    applyQuestUpdates(character, [{ op: "complete", questId: q.id, xpReward: 25, note: "(resolved by player — tracker repair)" }]);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${q.title} marked complete (+25 xp).` });
  };
  const gBtn = document.getElementById("quest-guidance");
  if (gBtn) gBtn.onclick = async () => {
    renderQuestDetail(questId, null, true);
    const location = hereNow();
    const time = readClock(character.clock);
    const result = await gmAsk({
      character, location, rules: CONTENT.rules,
      lore: loreForLocation(location, CONTENT.lore),
      region: { ...CONTENT.region, activeEvents: eventsForGM(buildRegionView(CONTENT, character), CONTENT.events) },
      recentTurns: sceneTurns.slice(-4), timeLabel: time.label,
      questsDetail: questsForGM(character),
      npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: [] }),
      codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: [q.title] })
    }, `Give me practical guidance on my quest "${q.title}": what are 2-3 sensible next steps from where I am, who might help or know more, and roughly how difficult does this look? Spoiler-safe only.`);
    renderQuestDetail(questId, result.ok ? result.text : "The GM stumbled: " + result.error, false);
  };
}

// ---------- codex: the character's knowledge graph ----------

function renderCodexScreen(query = "", openTopicId = null, mergeMode = false) {
  const results = searchCodex(character, query);
  const open = openTopicId ? character.codex?.topics?.[openTopicId] : null;
  const suggestions = !open ? suggestMerges(character) : [];
  chrome(`<div class="screen" style="max-width:720px">
    <h2>Codex — what ${esc(character.name)} knows</h2>
    <div class="field"><input id="codex-search" value="${esc(query)}" placeholder="Search topics, facts, factions, mysteries…"></div>
    ${open ? `
      <div class="codex-topic-page">
        <div class="codex-kind">${esc(open.kind)}${open.entityId ? ` <span class="codex-anchor" title="anchored to a known entity">◈ ${esc(open.entityId)}</span>` : ""}</div>
        <h3 class="codex-title">${esc(open.label)}</h3>
        ${(open.aliases || []).length ? `<div class="codex-aliases">also called: ${open.aliases.map(esc).join(" · ")}</div>` : ""}
        ${mergeMode ? (() => {
          // SNG-019 allocation: fold THIS entry into the one it really belongs to
          const others = Object.values(character.codex.topics).filter(t => t.id !== open.id);
          const sug = suggestMerges(character, { max: 12 }).filter(s => s.aId === open.id || s.bId === open.id)
            .map(s => (s.aId === open.id ? s.bId : s.aId));
          const rank = t => (sug.includes(t.id) ? 0 : t.kind === open.kind ? 1 : 2);
          const sorted = others.sort((a, b) => rank(a) - rank(b) || b.facts.length - a.facts.length);
          return `<div class="codex-merge-pick"><div class="hint">Everything here (facts, links) moves onto the entry you pick; "${esc(open.label)}" becomes one of its names. Permanent.</div>
            ${sorted.map(t => `<button class="opt codex-merge-target ${sug.includes(t.id) ? "suggested" : ""}" data-mergetarget="${esc(t.id)}">
              ${sug.includes(t.id) ? "◈ " : ""}${esc(t.label)} <span class="cost">${esc(t.kind)} · ${t.facts.length} fact${t.facts.length === 1 ? "" : "s"}</span></button>`).join("")}
            <button class="btn secondary" id="codex-merge-cancel" style="margin-top:8px">Cancel</button></div>`;
        })() : `
        ${open.facts.length ? open.facts.map(f => `<div class="codex-fact">${esc(f)}</div>`).join("") : "<div class='insight'>known of, little learned yet</div>"}
        ${open.links.length ? `<div class="codex-links">linked: ${open.links.map(l => {
          const t = character.codex.topics[l];
          return t ? `<button class="codex-link" data-topic="${esc(l)}">${esc(t.label)}</button>` : `<span class="codex-link dead">${esc(l)}</span>`;
        }).join(" ")}</div>` : ""}
        <button class="opt" id="codex-merge-mode" style="margin-top:10px">⇆ This is the same as another entry…</button>`}
        <button class="btn secondary" id="codex-close-topic" style="margin-top:12px">All topics</button>
      </div>` : `
      ${suggestions.length ? `<div class="codex-suggestions"><div class="codex-group-title">These look like the same thing — your call</div>
        ${suggestions.map((s, i) => `<div class="codex-sug-row"><span class="codex-sug-pair">«${esc(s.a)}» ↔ «${esc(s.b)}»</span>
          <button class="opt codex-sug-btn" data-sugmerge="${i}">Merge</button>
          <button class="opt codex-sug-btn dim" data-sugnot="${i}">Not the same</button></div>`).join("")}</div>` : ""}
      <div class="codex-list">
        ${results.length ? (() => {
          // SNG-019: group by kind — primary entities first, facts nested under their node
          const KIND_ORDER = ["person", "place", "faction", "event", "mystery", "lore"];
          const KIND_LABEL = { person: "People", place: "Places", faction: "Factions", event: "Events", mystery: "Mysteries", lore: "Lore" };
          const byKind = {};
          for (const t of results) (byKind[t.kind] = byKind[t.kind] || []).push(t);
          return KIND_ORDER.filter(k => byKind[k]?.length).map(k => `
            <div class="codex-group"><div class="codex-group-title">${KIND_LABEL[k]}</div>
            ${byKind[k].sort((a, b) => (b.entityId ? 1 : 0) - (a.entityId ? 1 : 0) || b.facts.length - a.facts.length).map(t => `
              <div class="codex-node">
                <button class="codex-item" data-topic="${esc(t.id)}">
                  <strong>${esc(t.label)}</strong>${t.entityId ? ` <span class="codex-anchor" title="known entity">◈</span>` : ""}
                  ${(t.aliases || []).length ? `<span class="codex-aliases-inline">· also: ${t.aliases.slice(0, 2).map(esc).join(", ")}${t.aliases.length > 2 ? "…" : ""}</span>` : ""}
                  <span class="hint">${t.facts.length} fact${t.facts.length === 1 ? "" : "s"}</span>
                </button>
                ${t.facts.slice(-3).map(f => `<div class="codex-fact nested">${esc(f)}</div>`).join("")}
                ${t.links.length ? `<div class="codex-links nested">${t.links.slice(0, 5).map(l => {
                  const lt = character.codex.topics[l];
                  return lt ? `<button class="codex-link" data-topic="${esc(l)}">${esc(lt.label)}</button>` : "";
                }).join(" ")}</div>` : ""}
              </div>`).join("")}</div>`).join("");
        })() : "<div class='insight'>Nothing cataloged yet — knowledge accumulates as you learn things that matter.</div>"}
      </div>`}
    <button class="btn secondary" id="codex-back" style="margin-top:12px">Back to the valley</button>
  </div>`);
  const search = document.getElementById("codex-search");
  search.oninput = () => renderCodexScreen(search.value, null);
  if (search.value) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  for (const b of app.querySelectorAll("[data-topic]")) b.onclick = () => renderCodexScreen(query, b.dataset.topic);
  const closeT = document.getElementById("codex-close-topic");
  if (closeT) closeT.onclick = () => renderCodexScreen(query, null);
  // SNG-019 allocation handlers: merge mode, target pick, suggestion verdicts
  const mm = document.getElementById("codex-merge-mode");
  if (mm) mm.onclick = () => renderCodexScreen(query, openTopicId, true);
  const mc = document.getElementById("codex-merge-cancel");
  if (mc) mc.onclick = () => renderCodexScreen(query, openTopicId, false);
  for (const b of app.querySelectorAll("[data-mergetarget]")) b.onclick = () => {
    const target = character.codex.topics[b.dataset.mergetarget];
    if (!target || !open) return;
    if (!confirm(`Fold "${open.label}" into "${target.label}"? Its facts and links move there, and "${open.label}" becomes one of its names. This can't be undone.`)) return;
    mergeInto(character, open.id, target.id);
    mergeCodexTopics(character); // the new alias may cascade more duplicates together
    saveCharacter(character);
    renderCodexScreen(query, target.id);
  };
  for (const b of app.querySelectorAll("[data-sugmerge]")) b.onclick = () => {
    const s = suggestions[parseInt(b.dataset.sugmerge)];
    if (!s) return;
    const A = character.codex.topics[s.aId], B = character.codex.topics[s.bId];
    if (!A || !B) return;
    // primary: anchored entity first, then the fuller node
    const [into, from] = (B.entityId && !A.entityId) || (!A.entityId === !B.entityId && B.facts.length > A.facts.length) ? [B, A] : [A, B];
    if (!confirm(`Merge "${from.label}" into "${into.label}"?`)) return;
    mergeInto(character, from.id, into.id);
    mergeCodexTopics(character);
    saveCharacter(character);
    renderCodexScreen(query, null);
  };
  for (const b of app.querySelectorAll("[data-sugnot]")) b.onclick = () => {
    const s = suggestions[parseInt(b.dataset.sugnot)];
    if (!s) return;
    markNotSame(character, s.aId, s.bId); // remembered — never suggested or auto-merged again
    saveCharacter(character);
    renderCodexScreen(query, null);
  };
  document.getElementById("codex-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- gambits: declared multi-step plans ----------

function gambitCtx() {
  const location = hereNow();
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  const comps = activeCompanions(character, CONTENT.companions);
  return {
    character, location, rules: CONTENT.rules, aptitudeMods: mods,
    bonuses: (action) => equipmentBonus(character, action.tags || [], CONTENT.rules).bonus +
                         companionBonus(comps, action.tags || [], CONTENT.rules, character).bonus
  };
}

function renderGambitBuilder(status = "") {
  if (!gambitDraft) gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null };
  const g = gambitDraft;
  const max = CONTENT.rules.gambit?.maxSteps ?? 5;
  chrome(`<div class="screen" style="max-width:720px">
    <h2>Plan a Gambit</h2>
    <p class="hint" style="margin-bottom:12px">Declare a sequence of moves. Assess it to read your odds (as far as your experience allows), then run it. A failed step forces a decision: fallback, adapt, press on, or abandon. Adaptation points available: <strong>${adaptationPointsFor(profile, CONTENT.rules)}</strong>.</p>
    <div class="field"><label>Goal</label><input id="g-goal" value="${esc(g.goal)}" placeholder="e.g. get the falsified purity logs out of the array office"></div>
    ${g.steps.map((s, i) => `
      <div class="field gambit-step">
        <label>Step ${i + 1}${g.assessed?.steps[i] ? ` — <span class="g-chance">${g.assessed.steps[i].sense.text ? esc(g.assessed.steps[i].sense.text) : "no read"}</span>${g.assessed.weakIndex === i ? ` <span class="g-weak">⚠ weakest link</span>` : ""}` : ""}</label>
        <input class="g-step" data-i="${i}" value="${esc(s.text)}" placeholder="what you'll do">
        <input class="g-fallback" data-i="${i}" value="${esc(s.fallback)}" placeholder="fallback if it goes wrong (optional)" style="margin-top:4px; opacity:.8">
        ${g.steps.length > 1 ? `<button class="opt g-remove" data-i="${i}" style="margin-top:4px">remove</button>` : ""}
      </div>`).join("")}
    <div style="display:flex; gap:8px; margin-bottom:14px;">
      ${g.steps.length < max ? `<button class="btn secondary" id="g-add">+ step</button>` : ""}
      <button class="btn secondary" id="g-assess">Assess plan</button>
      <button class="btn" id="g-run" ${g.assessed ? "" : "disabled"}>Run it</button>
      <button class="btn secondary" id="g-cancel">Back</button>
    </div>
    ${status ? `<div class="hint">${esc(status)}</div>` : ""}
  </div>`);
  const read = () => {
    g.goal = document.getElementById("g-goal").value;
    for (const el of app.querySelectorAll(".g-step")) g.steps[+el.dataset.i].text = el.value;
    for (const el of app.querySelectorAll(".g-fallback")) g.steps[+el.dataset.i].fallback = el.value;
  };
  for (const el of app.querySelectorAll(".g-step, .g-fallback, #g-goal")) el.oninput = () => { g.assessed = null; };
  for (const b of app.querySelectorAll(".g-remove")) b.onclick = () => { read(); g.steps.splice(+b.dataset.i, 1); g.assessed = null; renderGambitBuilder(); };
  const add = document.getElementById("g-add");
  if (add) add.onclick = () => { read(); g.steps.push({ text: "", fallback: "" }); g.assessed = null; renderGambitBuilder(); };
  document.getElementById("g-cancel").onclick = () => { gambitDraft = null; renderPlay(character.activeScene?.lastTurn || null, {}); };
  document.getElementById("g-assess").onclick = async () => {
    read();
    const texts = g.steps.map(s => s.text.trim()).filter(Boolean);
    if (!texts.length || !g.goal.trim()) { renderGambitBuilder("Give the plan a goal and at least one step."); return; }
    g.steps = g.steps.filter(s => s.text.trim());
    renderGambitBuilder("Reading the plan…");
    try {
      const actions = await parseGambitSteps(g.steps.map(s => s.text), character, hereNow());
      g.actions = actions;
      g.assessed = assessGambit(actions, gambitCtx());
      renderGambitBuilder();
    } catch (err) {
      renderGambitBuilder("Couldn't read the plan (" + err.message.slice(0, 60) + ") — try again.");
    }
  };
  document.getElementById("g-run").onclick = () => { read(); runGambit(); };
}

async function runGambit() {
  const g = gambitDraft;
  const ctx = gambitCtx();
  const run = { receipts: [], adaptLeft: adaptationPointsFor(profile, CONTENT.rules), fallbackUsed: {} , abandoned: false };
  let index = 0;
  const step = () => {
    const res = executeGambit(g.actions, ctx, Math.random, index);
    run.receipts.push(...res.receipts.filter(r => r.degree !== "failure" && r.degree !== "crit_failure"));
    if (res.blockedAt === null) return finishGambit(run);
    const failed = res.receipts[res.receipts.length - 1];
    renderComplication(failed);
  };
  const renderComplication = (failed) => {
    const a = g.actions[failed.index];
    chrome(`<div class="screen" style="max-width:640px">
      <h2>The plan hits a wall</h2>
      <div class="roll-receipt" style="margin:10px 0">Step ${failed.index + 1}: ${esc(a.label)} — d100: ${failed.roll} vs ${failed.chance} — <span class="${failed.degree}">${failed.degree.replace("_", " ")}</span></div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        ${g.steps[failed.index]?.fallback && !run.fallbackUsed[failed.index] ? `<button class="choice" id="c-fallback">Fallback: ${esc(g.steps[failed.index].fallback)}</button>` : ""}
        ${run.adaptLeft > 0 ? `<button class="choice" id="c-adapt">Adapt — force another try (${run.adaptLeft} adaptation point${run.adaptLeft > 1 ? "s" : ""} left)</button>` : ""}
        <button class="choice" id="c-presson">Accept the failure and press on with the rest</button>
        <button class="choice" id="c-abandon">Abandon the plan — get out of it</button>
      </div>
    </div>`);
    const fb = document.getElementById("c-fallback");
    if (fb) fb.onclick = async () => {
      run.fallbackUsed[failed.index] = true;
      const [fbAction] = await parseGambitSteps([g.steps[failed.index].fallback], character, ctx.location);
      const r = rerollStep(fbAction, ctx);
      if (r.degree === "failure" || r.degree === "crit_failure") {
        renderComplication({ ...r, index: failed.index });
      } else {
        run.receipts.push({ index: failed.index, ...r, viaFallback: fbAction.label });
        index = failed.index + 1; step();
      }
    };
    const ad = document.getElementById("c-adapt");
    if (ad) ad.onclick = () => {
      run.adaptLeft--;
      const r = rerollStep(g.actions[failed.index], ctx);
      if (r.degree === "failure" || r.degree === "crit_failure") {
        renderComplication({ ...r, index: failed.index });
      } else {
        run.receipts.push({ index: failed.index, ...r, rerolled: true });
        index = failed.index + 1; step();
      }
    };
    document.getElementById("c-presson").onclick = () => {
      run.receipts.push(failed);
      index = failed.index + 1;
      if (index >= g.actions.length) finishGambit(run); else step();
    };
    document.getElementById("c-abandon").onclick = () => { run.receipts.push(failed); run.abandoned = true; finishGambit(run); };
  };
  step();
}

async function finishGambit(run) {
  const g = gambitDraft;
  gambitDraft = null;
  // energy: each executed step costs; ability steps cost their ability's energy
  const per = CONTENT.rules.gambit?.stepEnergyCost ?? 4;
  let cost = 0;
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    cost += a.abilityId ? effectiveEnergyCost(fullCatalog()[a.abilityId], character, CONTENT.rules) : per;
  }
  character.energy = Math.max(0, character.energy - cost);
  // practice ledger: each executed step with abilities counts once
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    const ids = [a?.abilityId, ...(a?.comboAbilities || [])].filter(Boolean);
    if (ids.length) recordUse(character, ids);
  }
  // the human planned: that's who they are becoming
  const allTags = ["plan", "prepare", ...new Set(g.actions.flatMap(a => a.intentTags || []))];
  updateProfile(character, allTags, CONTENT.rules.playerAptitudes);
  saveProfile(profile); saveCharacter(character);
  const rough = run.receipts.some(r => r.complication || r.viaFallback || r.rerolled || r.degree === "failure" || r.degree === "crit_failure");
  const outcome = run.abandoned ? "abandoned" : rough ? "completed_rough" : "completed";
  const resolution = gambitResolutionForGM(g.goal, run.receipts, g.actions, outcome);
  // novel steps inside a gambit carry the same stakes: backlash on crit failure,
  // a mintable technique on crit success
  for (const r of run.receipts) {
    const a = g.actions[r.index];
    if (!a?.novel) continue;
    if (r.degree === "crit_failure") resolution.backlash = applyBacklash(character, CONTENT.rules);
    if (r.degree === "crit_success") {
      resolution.discoveryEligible = true;
      resolution.discoveryAbilities = [a.abilityId, ...(a.comboAbilities || [])].filter(Boolean);
      resolution.action.noveltyHint = a.noveltyHint || "";
    }
  }
  renderPlay(null, { thinking: "The run unfolds…", playerBeat: { label: `GAMBIT: ${g.goal} (${outcome.replace("_", " ")})` } });
  const result = await runGM({ resolution, playerInput: null });
  if (result) renderPlay(result.turn, { playerBeat: { label: `GAMBIT: ${g.goal} (${outcome.replace("_", " ")})` }, degraded: result.degraded });
}

function useItem(name) {
  if (busy) return;
  const item = character.inventory.find(i => i.name === name);
  if (!item) return;
  if (item.consumable) {
    const fx = consumeItem(character, name);
    saveCharacter(character);
    const parts = [];
    if (fx?.health) parts.push(`${fx.health > 0 ? "+" : ""}${fx.health} health`);
    if (fx?.energy) parts.push(`${fx.energy > 0 ? "+" : ""}${fx.energy} energy`);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You use the ${name}${parts.length ? ` (${parts.join(", ")})` : ""}.` });
  } else {
    // non-consumable: using it IS a scene action — route through the normal loop
    onFreeform(`I use my ${name} here`);
  }
}

// ---------- play rendering ----------

function renderPlay(turn, opts = {}) {
  const location = hereNow();
  const rules = CONTENT.rules;
  const mods = aptitudeMods(character, rules.playerAptitudes);
  const rep = location.communityId ? standingWith(character, location.communityId, rules) : null;

  const sheet = `<div class="sheet">
    <h2>${esc(character.name)}</h2>
    <div class="meta">${esc(character.origin)} · ${esc(character.background)} · level ${character.level} (${character.xp} xp)</div>
    <div style="display:flex; gap:6px; margin:6px 0">
      <button class="opt" id="open-character" style="flex:1">Character</button>
      <button class="opt" id="open-inventory" style="flex:1">Inventory</button>
    </div>
    Health <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    Energy <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
    <section><h3>Attributes${character.pendingSubPoints > 0 ? ` <span class="grow-badge">+${character.pendingSubPoints} to place</span>` : ""}</h3><div class="attr-grid">
      ${SUBS.map(s => `<div style="text-transform:capitalize" title="${esc(SUB_DESC[s])} (${SUB_OF[s]})">${s}</div><div>${(character.subAttributes?.[s] ?? 0) > 6 ? (character.subAttributes[s] + " ●●●●●●⁺") : "●".repeat(character.subAttributes?.[s] ?? 0) + "○".repeat(Math.max(0, 4 - (character.subAttributes?.[s] ?? 0)))}${character.pendingSubPoints > 0 && (character.subAttributes?.[s] ?? 0) < (CONTENT.rules.leveling?.subAttributeCap ?? 6) ? ` <button class="grow-btn" data-grow="${s}">+</button>` : ""}</div>`).join("")}
    </div></section>
    <section><h3>Abilities${character.skillPoints > 0 ? ` <span class="grow-badge">${character.skillPoints} skill pt</span>` : ""}</h3>
      ${character.abilities.map(a => {
        const ab = fullCatalog()[a.abilityId];
        const rank = rankExpression(character, ab, a.level, CONTENT.branchForks) || ab?.tree?.find(t => t.rank === a.level);
        const rankCost = skillPointCost(ab, character, CONTENT.skillCapacity);
        const nextReq = CONTENT.rules.leveling?.rankLevelReq?.[String(a.level + 1)];
        const canRank = character.skillPoints >= rankCost && a.level < (CONTENT.rules.leveling?.maxAbilityRank ?? 3) && character.level >= (nextReq ?? 1);
        return `<div class="ability" title="${esc(rank ? "CAN: " + rank.grants + " | CANNOT: " + rank.cannot : ab?.description || "")}">
          <span class="name">${esc(ab?.name || a.abilityId)}</span> <span class="tier-badge" title="Tier ${ab ? tierOf(ab.levelReq) : "?"}">${ab ? tierOf(ab.levelReq) : "?"}</span> rank ${a.level}${rank ? ` — <em>${esc(rank.name)}${rank.forked ? " ⑂" : ""}</em>` : ""}
          ${canRank ? `<button class="grow-btn" data-rankup="${esc(a.abilityId)}" title="Spend ${rankCost} skill point${rankCost > 1 ? "s (cross-class)" : ""}">▲${rankCost > 1 ? "×" + rankCost : ""}</button>` : ""}
          ${practiceRankReady(character, a.abilityId, CONTENT.rules) && a.level < (CONTENT.rules.leveling?.maxAbilityRank ?? 3) && character.level >= (CONTENT.rules.leveling?.rankLevelReq?.[String(a.level + 1)] ?? 1) ? `<button class="grow-btn practiced" data-rankpractice="${esc(a.abilityId)}" title="Practiced enough — rank up free">▲free</button>` : ""}
          <span class="cost">(${ab ? effectiveEnergyCost(ab, character, CONTENT.rules) : "?"} energy${ab && effectiveEnergyCost(ab, character, CONTENT.rules) < ab.energyCost ? `, was ${ab.energyCost}` : ""})</span></div>`;
      }).join("") || "<div class='insight'>none yet</div>"}
      ${(() => {
        const canShow = character.skillPoints > 0 || (character.practice?.aspirations || []).some(a => aspirationRipe(character, a.abilityId, CONTENT.rules));
        if (!canShow) return "";
        const cap = atCapacity(character, CONTENT.skillCapacity);
        const learnable = Object.values(CONTENT.abilities).filter(ab => {
          if (character.abilities.some(a => a.abilityId === ab.id)) return false;
          if (character.skillPoints <= 0 && !aspirationRipe(character, ab.id, CONTENT.rules)) return false;
          const req = effectiveLevelReq(ab, character, CONTENT.rules);
          return req !== null && character.level >= req;
        });
        const capLine = `<div class="cap-line">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${cap ? " — at capacity; points now deepen owned skills" : ""}</div>`;
        if (!learnable.length) return capLine;
        const byClass = {};
        for (const ab of learnable) (byClass[ab.powerSystem] = byClass[ab.powerSystem] || []).push(ab);
        const groups = Object.keys(byClass).sort().map(cls => `<details class="learn-group"><summary>Learn ${esc(classLabel(cls))} <span class="cost">(${byClass[cls].length})</span></summary>${
          byClass[cls].sort((a,b)=>(a.levelReq||1)-(b.levelReq||1)).map(ab => {
            const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
            const capBlock = cap && ab.powerSystem !== "learned";
            const ripe = aspirationRipe(character, ab.id, CONTENT.rules);
            const cross = effectiveLevelReq(ab, character, CONTENT.rules) !== (ab.levelReq || 1);
            const learnCost = skillPointCost(ab, character, CONTENT.skillCapacity);
            const tooExpensive = !ripe && character.skillPoints < learnCost;
            const blocked = !gate.ok || capBlock || tooExpensive;
            return `<button class="opt ${ripe ? "practiced" : ""} ${blocked ? "locked" : ""}" ${blocked ? "disabled" : `data-learn="${esc(ab.id)}"`} title="${esc(ab.description + (gate.ok ? "" : " — " + gate.why))}" style="margin:2px 0; display:block; width:100%"><span class="tier-badge">${tierOf(ab.levelReq)}</span> ${esc(ab.name)} <span class="cost">L${ab.levelReq || 1}${cross ? ", cross" : ""}${learnCost > 1 ? ` · ${learnCost} pts` : ""}${ripe ? " — FREE" : ""}${!gate.ok ? " 🔒 " + esc(gate.why) : capBlock ? " 🔒 at capacity" : tooExpensive ? " 🔒 need " + learnCost + " pts" : ""}</span></button>`;
          }).join("")}</details>`).join("");
        return capLine + groups;
      })()}
      ${(character.discoveries || []).length ? `<div class="discoveries">${character.discoveries.map(d => `<div class="discovery" title="${esc(d.description)}">✦ ${esc(d.name)}</div>`).join("")}</div>` : ""}
    </section>
    <section><h3>People you know</h3>
      ${(() => {
        const groups = groupNpcsByLocation(character.npcRegistry || {});
        const keys = Object.keys(groups);
        if (!keys.length) return "<div class='insight'>no one yet — introduce yourself</div>";
        keys.sort((a, b) => (a === character.currentLocationId ? -1 : b === character.currentLocationId ? 1 : a === "elsewhere" ? 1 : b === "elsewhere" ? -1 : 0));
        return keys.map(k => {
          const open = npcGroupsOpen.has(k) || (k === character.currentLocationId && !npcGroupsClosed.has(k));
          const label = k === "elsewhere" ? "Elsewhere" : (CONTENT.locations[k]?.name || k);
          return `<details class="npc-group" data-npcgroup="${esc(k)}" ${open ? "open" : ""}><summary>${esc(label)} <span class="cost">(${groups[k].length})</span></summary>
            ${groups[k].map(n => `<div class="known-npc" title="${esc((n.statusNote ? "Now: " + n.statusNote + " | " : "") + ((n.history || []).slice(-2).join(" | ") || n.description || ""))}"><span class="npc-name">${esc(n.name)}${nameIsUnknown(n) ? ` <button class="npc-setname" data-setname="${esc(n.id)}" title="You know their name — set it">✎ name</button>` : ""}</span> <span class="rep-band ${["ally", "devoted", "friendly"].includes(relationshipBand(n.relationship)) ? "trusted" : ["hostile", "enemy", "wary"].includes(relationshipBand(n.relationship)) ? "wary" : ""}">${relationshipBand(n.relationship)}</span></div>`).join("")}
          </details>`;
        }).join("");
      })()}
    </section>
    <section><h3>Quests</h3>
      ${(character.quests || []).filter(q => q.status === "active").map(q => `
        <button class="quest quest-click" data-quest="${esc(q.id)}"><span class="quest-title">${esc(q.title)}</span>
          <div class="quest-note">${esc(q.progress?.length ? q.progress[q.progress.length - 1] : q.summary)}</div>
        </button>`).join("") || "<div class='insight'>no undertakings yet — the valley will provide</div>"}
      ${(character.quests || []).some(q => q.status !== "active") ? `<div class="quest-done">${(character.quests || []).filter(q => q.status === "completed").length} completed · ${(character.quests || []).filter(q => q.status === "failed").length} failed</div>` : ""}
    </section>
    ${syncEnabled() ? `<section><h3>Party</h3>
      ${sharedScene ? `
        ${sharedScene.party.map(m => `<div class="known-npc"><span class="npc-name">${m.characterId === character.id ? "you" : esc(m.name)}</span>${sharedScene.turn === m.characterId ? `<span class="rep-band trusted">turn</span>` : ""}</div>`).join("")}
        <div class="hint">${isMyTurn(sharedScene, character.id) ? "Your turn — act." : "Waiting for " + esc(sharedScene.party.find(m => m.characterId === sharedScene.turn)?.name || "…")}</div>
        <button class="opt" id="party-leave" style="display:block; width:100%; margin-top:4px">Leave shared scene</button>`
      : `<button class="opt" id="party-find" style="display:block; width:100%">Find or start a party here</button>`}
    </section>` : ""}
    <section><h3>Companions</h3>
      ${(character.companions || []).map(id => {
        const c = CONTENT.companions[id];
        return c ? `<div class="companion"><span class="companion-name">${esc(c.name)}</span> <span class="rep-band ${bondOf(character, c.id, CONTENT.rules).bond >= 3 ? "trusted" : ""}" title="bond grows through shared deeds, assists, and encounters">bond ${bondOf(character, c.id, CONTENT.rules).bond}${bondOf(character, c.id, CONTENT.rules).stage === 2 ? " · stage 2" : ""}</span> <span class="cost">${esc(c.role)}</span>
          <button class="opt companion-part" data-part="${esc(id)}">Part ways</button></div>` : "";
      }).join("")}
      ${Object.values(CONTENT.companions).filter(c => !(character.companions || []).includes(c.id)).map(c =>
        `<button class="opt" data-join="${esc(c.id)}" style="margin:2px 0; display:block; width:100%" title="${esc(c.persona.slice(0, 140))}">Travel with ${esc(c.name)}</button>`
      ).join("")}
      ${!Object.keys(CONTENT.companions).length ? "<div class='insight'>you travel alone</div>" : ""}
    </section>
    <section><h3>Items</h3>
      ${(character.inventory || []).map(it => {
        const open = examinedItem === it.name;
        const img = open ? itemImage(it) : null;
        return `<div class="item ${open ? "open" : ""}">
          <button class="item-name" data-examine="${esc(it.name)}">${esc(displayName(it))}${it.customName ? ` <span class="cost">(${esc(it.name)})</span>` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}</button>
          ${open ? `<div class="item-detail">
            ${img ? `<img class="item-img" src="${esc(img)}" alt="${esc(it.name)}" loading="lazy">` : ""}
            <div class="item-desc">${esc(it.description || it.kind)}</div>
            ${it.bonusTags?.length ? `<div class="item-tags">helps with: ${it.bonusTags.map(esc).join(", ")}</div>` : ""}
            <div class="item-actions">
              <button class="opt" data-use="${esc(it.name)}">${it.consumable ? "Consume" : "Use in scene"}</button>
              <button class="opt" data-nameit="${esc(it.name)}">Name it</button>
              <button class="opt" data-drop="${esc(it.name)}">Drop</button>
            </div></div>` : ""}
        </div>`;
      }).join("") || "<div class='insight'>empty-handed</div>"}
    </section>
    <section><h3>Standing here</h3>
      ${rep ? `<span class="rep-band ${rep.band}">${rep.band} (${rep.score})</span>` : `<span class="insight">no community claims this place</span>`}
    </section>
    <section><h3>Play-style</h3><div class="insight">${esc(profileInsight(character, rules.playerAptitudes))}</div></section>
    <section><h3>Map & Rest</h3>
      <button class="opt map-open" id="open-map" style="margin:2px 0 6px; display:block; width:100%">🗺 Open Map — travel & places</button>
      <button class="opt" id="do-breather" style="margin-top:8px; display:block; width:100%">Breather (+${rules.recovery?.breather?.energy ?? 10} energy, 1h)</button>
      <button class="opt" id="do-rest" style="margin-top:4px; display:block; width:100%">Sleep (+${rules.recovery?.sleep?.energy ?? 40} energy, ${rules.recovery?.sleep?.hours ?? 8}h)</button>
    </section>
    <section><h3>Codex</h3>
      <button class="opt" id="open-codex" style="display:block; width:100%">${Object.keys(character.codex?.topics || {}).length} topic${Object.keys(character.codex?.topics || {}).length === 1 ? "" : "s"} cataloged — open</button>
    </section>
  </div>`;

  const banner = sceneImage(location, sceneState);
  const time = readClock(character.clock);
  let main = `<div class="play">
    ${banner ? `<img class="scene-banner" src="${esc(banner)}" alt="${esc(location.name)}" onerror="this.style.display='none'">` : ""}
    <div class="location-tag" ${sceneState?.setting ? `title="${esc(sceneState.setting)}"` : ""}>${esc(location.name)}<span class="time-tag">${esc(time.label)}</span></div>
    ${(() => { const e = activeEnc(); if (!e) return ""; const st = e.state, d = e.def;
      let status = "";
      if (d.type === "duel") status = `${esc(d.opponent.name)}: ${"▮".repeat(Math.max(0, st.opponentHealth))}${"▯".repeat(Math.max(0, d.opponent.health - st.opponentHealth))} · you: ${character.health}/${character.maxHealth}${st.tactic ? ` · tactic: ${esc(st.tactic)}` : ""}`;
      if (d.type === "challenge") status = `stage ${Math.min(st.stageIndex + 1, d.stages.length)}/${d.stages.length}: ${esc(d.stages[st.stageIndex]?.name || "complete")}`;
      if (d.type === "puzzle") {
        const tier = senseTierFor();
        const revealed = puzzleHints(d, Math.max(tier, st.hintsRevealed));
        status = `attempts: ${st.attempts} · understanding: ${revealed.length}/${(d.hintTiers || []).length}` +
          (revealed.length ? `<div class="enc-hints">${revealed.map(h => `<div>◈ ${esc(h)}</div>`).join("")}</div>` : "");
      }
      return `<div class="encounter-bar"><span class="enc-name">⚔ ${esc(d.name)}</span> <span class="enc-round">round ${st.round}</span><div class="enc-status">${status}</div></div>`;
    })()}<div class="transcript">`;
  if (opts.newsFlash?.length) {
    main += `<div class="news-flash"><div class="news-title">While you were away…</div>${opts.newsFlash.map(n => `<div class="news-item">◈ ${esc(n.text)}</div>`).join("")}</div>`;
  }
  if (opts.playerBeat) {
    main += `<div class="beat player-action">▸ ${esc(opts.playerBeat.label)}</div>`;
    if (opts.playerBeat.resolution) {
      const r = opts.playerBeat.resolution;
      const helpers = r.equipHelpers?.length ? ` · aided by ${r.equipHelpers.map(esc).join(", ")}` : "";
      const locBits = r.locationAffinity?.length ? `<div class="roll-affinity">${r.locationAffinity.map(esc).join(" · ")}</div>` : "";
      const intBit = r.intensity && r.intensity !== "standard" ? ` · <span class="intensity-${esc(r.intensity)}">${esc(r.intensity)}</span>${r.energySpent != null ? ` (${r.energySpent} energy)` : ""}` : "";
      const blBit = r.surgeBacklash ? `<div class="roll-backlash">⚡ surge backlash: ${r.backlash.health} health, ${r.backlash.energy} energy</div>` : "";
      main += `<div class="roll-receipt">d100: ${r.roll} vs ${r.chance} — <span class="${r.degree}">${r.degree.replace("_", " ")}</span>${helpers}${intBit}</div>${locBits}${blBit}`;
    }
  }
  if (opts.itemsAdvanced?.length) main += opts.itemsAdvanced.map(a => `<div class="beat item-woke">✦ ${esc(a.itemName)} stirs — <em>${esc(a.stageName)}</em></div>`).join("");
  if (opts.thinking) main += `<div class="thinking">${esc(opts.thinking)}</div>`;
  if (opts.aside) main += `<div class="beat"><em>${opts.aside.split("\n").map(esc).join("<br>")}</em></div>`;
  if (opts.gmAside) main += `<div class="gm-aside">${opts.gmAside.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
  if (opts.error) main += `<div class="error-card">The GM stumbled: ${esc(opts.error)}<br><button class="btn" id="retry" style="margin-top:8px">Try again</button></div>`;

  if (turn) {
    main += `<div class="beat">${turn.narration.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
    if (opts.degraded) main += `<div class="degraded-note">(${esc(turn._opNote || "The GM's structured reply failed — plain narration mode this turn.")})</div>`;
    turn.choices = lethalOfferClamp(turn.choices, { ...(CONTENT.encounters || {}), ...(character.customEncounters || {}) });
    for (const c of turn.choices || []) {
      if (c.emergenceId && !validEmergenceId(character, CONTENT.emergence, CONTENT.rules, c.emergenceId)) c.emergenceId = null;
    }
    main += `<div class="choices">${(turn.choices || []).map((c, i) => {
      let senseHtml = "", abilityHtml = "";
      const action = { label: c.label, attribute: c.attribute || "practical", axes: c.axes || {}, difficulty: c.difficulty || 0, tags: c.intentTags || [], abilityLevel: 0, planned: (c.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)) };
      if (c.abilityId && character.abilities.some(a => a.abilityId === c.abilityId)) {
        action.abilityLevel = character.abilities.find(a => a.abilityId === c.abilityId).level;
        abilityHtml = `<span class="ability-tag"> ✦ ${esc(fullCatalog()[c.abilityId]?.name || c.abilityId)}</span>`;
      }
      if (c.trivial && !c.abilityId) {
        senseHtml = `<span class="sense trivial-tag">no roll — just do it</span>`;
      } else {
        action.subAttribute = SUBS.includes(c.subAttribute) ? c.subAttribute : null;
        const equip = equipmentBonus(character, action.tags, rules);
        const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.tags, rules, character);
        const aff = affinityFor(action, location);
        const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus });
        const sense = senseAction({ character, action, location, rules, aptitudeMods: mods }, chance);
        if (sense.text) senseHtml = `<span class="sense">${esc(sense.text)}</span>`;
      }
      // SNG-015 Part B: fast tap = auto intensity + default ability; ⚙ expand-to-tune
      const canTune = !(c.trivial && !c.abilityId) && !c.encounterId && !c.emergenceId;
      const gear = canTune ? `<button class="tune-toggle" data-tune="${i}" title="Tune which ability + how hard (Conserve / Standard / Surge)">⚙</button>` : "";
      let panel = "";
      if (canTune && tuneOpen === i) {
        const owned = character.abilities.map(a => fullCatalog()[a.abilityId]).filter(Boolean);
        const sel = tuneSel.abilityId;
        const abChips = [`<button class="tune-ab ${!sel ? "sel" : ""}" data-tuneab="">raw (no ability)</button>`]
          .concat(owned.map(ab => `<button class="tune-ab ${sel === ab.id ? "sel" : ""}" data-tuneab="${esc(ab.id)}">${esc(ab.name)}</button>`)).join("");
        const baseCost = sel ? effectiveEnergyCost(fullCatalog()[sel], character, rules) : 0;
        const intBtns = intensityOptions(baseCost, CONTENT.intensity).map(o =>
          `<button class="tune-int intensity-${o.key} ${tuneSel.intensity === o.key ? "sel" : ""}" data-tunint="${o.key}">${o.label}${sel ? ` · ${o.energy}e` : ""}${o.warn ? " ⚠" : ""}</button>`).join("");
        panel = `<div class="tune-panel"><div class="tune-row"><span class="tune-lbl">Apply</span>${abChips}</div>` +
          `<div class="tune-row"><span class="tune-lbl">Intensity</span>${intBtns}</div>` +
          (tuneSel.intensity === "surge" ? `<div class="tune-warn">⚡ Surge amplifies the effect but can backlash — the cost scales with the ability's Tier.</div>` : "") +
          `<button class="tune-commit" data-tunecommit="${i}">Commit — ${esc(tuneSel.intensity)}${sel ? " " + esc(fullCatalog()[sel]?.name || sel) : ""}</button></div>`;
      }
      return `<div class="choice-wrap"><button class="choice" data-choice="${i}">${esc(c.label)}${abilityHtml}${senseHtml}</button>${gear}${panel}</div>`;
    }).join("")}${(() => { const e = activeEnc(); if (!e) return ""; const d = e.def;
      const mk = (label, act, extra = "") => `<button class="choice enc-choice" data-encact="${act}"${extra}>${label}</button>`;
      let btns = "";
      if (d.type === "duel") btns = mk("⚑ Try to flee", "flee") + mk("Yield", "yield");
      if (d.type === "challenge") btns = mk(`Attempt: ${esc(d.stages[e.state.stageIndex]?.name || "")}`, "stage") + mk("Abandon the attempt", "abandon");
      if (d.type === "puzzle") {
        btns = mk("Work the mechanism", "attempt");
        for (const [ui, u] of puzzleUnlocks(d, character).entries()) btns += mk(`◈ ${esc(u.note.slice(0, 80))}`, "unlock", ` data-unlock="${ui}"`);
        btns += mk("Walk away", "walkAway");
      }
      return btns;
    })()}</div>`;
  }
  main += `</div>`;
  if (turn || opts.error || opts.gmAside || opts.aside || (!busy && !opts.thinking)) {
    main += `<div class="freeform">
      <div class="mode-chips">
        <button id="mode-act" class="mode-chip ${askMode ? "" : "active"}" title="Act in the scene">Act</button>
        <button id="mode-ask" class="mode-chip ${askMode ? "active" : ""}" title="Ask the GM out-of-character — context, rules, what your character would know. Never advances the story.">Ask GM</button>
      </div>
      <input id="freeform-input" placeholder="${askMode ? "Ask the GM anything — context, rules, what you'd know…" : "Or do something else — describe it…"}" ${busy ? "disabled" : ""}>
      <button id="freeform-go" ${busy ? "disabled" : ""}>${askMode ? "Ask" : "Act"}</button>
      <button id="gambit-open" class="mode-toggle" title="Plan a multi-step gambit" ${busy ? "disabled" : ""}>⚙ Plan</button></div>`;
  }
  if (isDev()) {
    const flavors = ["beneficial", "benign", "beautiful", "dangerous", "theft", "chase", "fight"];
    main += `<div class="dev-panel"><div class="dev-title">🔧 Test encounters (dev only)</div><div class="dev-btns">${
      flavors.map(f => `<button class="dev-fire" data-fire="${f}">${f}</button>`).join("")
    }</div><div class="dev-hint">Fires the flavor here (danger gate bypassed for testing). Fight/chase/dangerous show a decline/flee choice before anything starts.</div></div>`;
  }
  main += `</div>`;

  chrome(`<div class="layout">${sheet}${main}</div>`);

  if (turn) {
    for (const btn of app.querySelectorAll("[data-choice]")) {
      btn.onclick = () => onChoice(turn.choices[parseInt(btn.dataset.choice)]);
    }
    // SNG-015 Part B: tune panel (ability + intensity) — re-renders to reflect selection
    for (const btn of app.querySelectorAll("[data-tune]")) btn.onclick = (e) => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.tune);
      if (tuneOpen === i) { tuneOpen = null; }
      else { tuneOpen = i; const c = turn.choices[i]; tuneSel = { abilityId: c.abilityId || undefined, intensity: "standard" }; }
      renderPlay(turn, opts);
    };
    for (const btn of app.querySelectorAll("[data-tuneab]")) btn.onclick = () => { tuneSel.abilityId = btn.dataset.tuneab || undefined; renderPlay(turn, opts); };
    for (const btn of app.querySelectorAll("[data-tunint]")) btn.onclick = () => { tuneSel.intensity = btn.dataset.tunint; renderPlay(turn, opts); };
    for (const btn of app.querySelectorAll("[data-tunecommit]")) btn.onclick = () => {
      const c = turn.choices[parseInt(btn.dataset.tunecommit)];
      const merged = { ...c, abilityId: tuneSel.abilityId || null, intensity: tuneSel.intensity };
      if (!tuneSel.abilityId) merged.comboAbilities = c.comboAbilities; // raw keeps any combo intent
      tuneOpen = null;
      onChoice(merged);
    };
  }
  for (const btn of app.querySelectorAll("[data-encact]")) {
    btn.onclick = () => {
      const e = activeEnc(); if (!e) return;
      const d = e.def, act = btn.dataset.encact;
      if (act === "flee") onChoice({ label: "Break away and flee", attribute: "physical", subAttribute: "agility", axes: {}, difficulty: 0, intentTags: ["retreat", "risky"], encounterAction: "flee" });
      else if (act === "yield") onChoice({ label: "Yield", trivial: false, attribute: "social", subAttribute: "presence", axes: {}, difficulty: 0, intentTags: ["careful"], encounterAction: "yield" });
      else if (act === "abandon") onChoice({ label: "Abandon the attempt", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["retreat", "careful"], encounterAction: "abandon" });
      else if (act === "walkAway") onChoice({ label: "Walk away from the puzzle", attribute: "mental", subAttribute: "reason", axes: {}, difficulty: 0, intentTags: ["careful"], encounterAction: "walkAway" });
      else if (act === "stage") { const st = d.stages[e.state.stageIndex]; onChoice({ label: `Attempt: ${st.name}`, attribute: st.attribute, subAttribute: st.subAttribute, axes: st.axes || {}, difficulty: 0, intentTags: ["risky"] }); }
      else if (act === "attempt") onChoice({ label: "Work the mechanism", attribute: d.attribute || "mental", subAttribute: d.subAttribute, axes: d.axes || {}, difficulty: 0, intentTags: ["study", "analyze"] });
      else if (act === "unlock") { const u = puzzleUnlocks(d, character)[+btn.dataset.unlock]; if (u) onChoice({ label: u.note.slice(0, 80), attribute: d.attribute || "mental", subAttribute: d.subAttribute, axes: d.axes || {}, difficulty: -(u.difficultyBonus || 10), intentTags: ["study", "analyze"] }); }
    };
  }
  for (const btn of app.querySelectorAll("[data-travel]")) btn.onclick = () => travelTo(btn.dataset.travel);
  for (const btn of app.querySelectorAll("[data-fire]")) btn.onclick = () => { if (!busy) fireEncounter(btn.dataset.fire, { dev: true }); };
  for (const btn of app.querySelectorAll("[data-join]")) btn.onclick = async () => {
    if (busy) return;
    const c = CONTENT.companions[btn.dataset.join];
    character.companions = [...(character.companions || []), c.id];
    saveCharacter(character);
    renderPlay(null, { thinking: `${c.name} arrives…` });
    const result = await runGM({ resolution: null, playerInput: `(${c.name} has just joined the character as a traveling companion. Introduce them into the current scene naturally — their arrival, how they read the situation — then continue the scene.)` });
    if (result) renderPlay(result.turn, { degraded: result.degraded });
  };
  for (const btn of app.querySelectorAll("[data-part]")) btn.onclick = () => {
    const c = CONTENT.companions[btn.dataset.part];
    if (!confirm(`Part ways with ${c.name}?`)) return;
    character.companions = character.companions.filter(id => id !== c.id);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${c.name} drifts on — for now.` });
  };
  for (const btn of app.querySelectorAll("[data-examine]")) btn.onclick = () => {
    examinedItem = examinedItem === btn.dataset.examine ? null : btn.dataset.examine;
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  for (const btn of app.querySelectorAll("[data-use]")) btn.onclick = () => useItem(btn.dataset.use);
  for (const b of app.querySelectorAll("[data-setname]")) b.onclick = (e) => {
    e.stopPropagation();
    const nn = prompt("What is their name?");
    if (nn && setNpcName(character, b.dataset.setname, nn, readClock(character.clock).day)) { saveCharacter(character); renderPlay(character.activeScene?.lastTurn || null, {}); }
  };
  for (const d of app.querySelectorAll("[data-npcgroup]")) d.ontoggle = () => {
    const k = d.dataset.npcgroup;
    if (d.open) { npcGroupsOpen.add(k); npcGroupsClosed.delete(k); }
    else { npcGroupsOpen.delete(k); npcGroupsClosed.add(k); }
  };
  for (const btn of app.querySelectorAll("[data-nameit]")) btn.onclick = () => {
    const nn = prompt("Name this item (their story-name; the original stays as subtitle):");
    if (nn !== null && nameItem(character, btn.dataset.nameit, nn)) { saveCharacter(character); renderPlay(character.activeScene?.lastTurn || null, {}); }
  };
  for (const btn of app.querySelectorAll("[data-drop]")) btn.onclick = () => {
    if (!confirm(`Drop ${btn.dataset.drop}?`)) return;
    removeItem(character, btn.dataset.drop, 999);
    examinedItem = null;
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You leave the ${btn.dataset.drop} behind.` });
  };
  const restBtn = document.getElementById("do-rest"); if (restBtn) restBtn.onclick = () => rest("sleep");
  const breatherBtn = document.getElementById("do-breather"); if (breatherBtn) breatherBtn.onclick = () => rest("breather");
  const mapBtn = document.getElementById("open-map"); if (mapBtn) mapBtn.onclick = () => renderMap();
  for (const b of app.querySelectorAll("[data-quest]")) b.onclick = () => renderQuestDetail(b.dataset.quest);
  const codexBtn = document.getElementById("open-codex"); if (codexBtn) codexBtn.onclick = () => renderCodexScreen();
  const charBtn = document.getElementById("open-character"); if (charBtn) charBtn.onclick = () => renderCharacterScreen();
  const invBtn = document.getElementById("open-inventory"); if (invBtn) invBtn.onclick = () => renderInventoryScreen();
  const ff = document.getElementById("freeform-input");
  const go = document.getElementById("freeform-go");
  const setMode = (mode) => {
    if (askMode === mode) return;
    askMode = mode;
    const val = ff?.value || "";
    renderPlay(turn || character.activeScene?.lastTurn || null, { ...opts, thinking: null });
    const ff2 = document.getElementById("freeform-input");
    if (ff2) { ff2.value = val; ff2.focus(); }
  };
  const actBtn = document.getElementById("mode-act");
  const askBtn = document.getElementById("mode-ask");
  if (actBtn) actBtn.onclick = () => setMode(false);
  if (askBtn) askBtn.onclick = () => setMode(true);
  if (ff && go) {
    if (opts.error && lastPlayerText) ff.value = lastPlayerText; // never lose what they wrote
    const submit = () => askMode ? onAsk(ff.value) : onFreeform(ff.value);
    go.onclick = submit;
    ff.onkeydown = e => { if (e.key === "Enter") submit(); };
  }
  for (const b of app.querySelectorAll("[data-grow]")) b.onclick = () => {
    if (spendSubPoint(character, b.dataset.grow, CONTENT.rules)) { saveCharacter(character); renderPlay(turn || character.activeScene?.lastTurn || null, {}); }
  };
  const afterRank = (abilityId, r) => {
    if (abilityId === "old_roads" && r.newRank === 3 && !(character.precursorAccess || []).includes("address_sense")) {
      character.precursorAccess = [...(character.precursorAccess || []), "address_sense"];
    }
    saveCharacter(character);
    // rank-up highlight: show exactly what the new rank grants (fork-aware) and its new limit
    const ab = fullCatalog()[abilityId];
    const gained = rankExpression(character, ab, r.newRank, CONTENT.branchForks);
    const spent = r.viaPractice ? " — earned by practice, no point spent" : (r.cost > 1 ? ` — ${r.cost} skill points (cross-class)` : "");
    let aside = `${ab?.name} advances to rank ${r.newRank}${spent}.`;
    if (gained) aside += `\n✦ Now: ${gained.name}${gained.forked ? " (specialized)" : ""} — ${gained.grants}\n△ New limit: ${gained.cannot}`;
    if (abilityId === "old_roads" && r.newRank === 3) aside += "\nThe old roads remember you now: Address-Sense may be learned.";
    renderPlay(turn || character.activeScene?.lastTurn || null, { aside });
  };
  // SNG-BATCH-5 Phase 2: fork chooser — the player picks A xor B; the other locks permanently.
  const offerFork = (abilityId, viaPractice) => renderForkModal(abilityId, (key) => {
    setFork(character, abilityId, key, CONTENT.branchForks);
    const r = rankUpAbility(character, abilityId, CONTENT.rules, viaPractice ? { viaPractice: true, ...rankOpts() } : rankOpts());
    if (r.ok) afterRank(abilityId, r); else alert(r.why);
  });
  const rankOpts = () => ({ attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, catalog: fullCatalog() });
  for (const b of app.querySelectorAll("[data-rankup]")) b.onclick = () => {
    const id = b.dataset.rankup;
    // SNG-BATCH-5 Phase 2: a fork blocks the linear rank — the player must choose a path first
    const owned = character.abilities.find(a => a.abilityId === id);
    if (owned && forkPending(character, id, owned.level + 1, CONTENT.branchForks)) { offerFork(id, false); return; }
    const r = rankUpAbility(character, id, CONTENT.rules, rankOpts());
    if (r.ok) afterRank(id, r); else alert(r.why);
  };
  for (const b of app.querySelectorAll("[data-rankpractice]")) b.onclick = () => {
    const id = b.dataset.rankpractice;
    const owned = character.abilities.find(a => a.abilityId === id);
    if (owned && forkPending(character, id, owned.level + 1, CONTENT.branchForks)) { offerFork(id, true); return; }
    const r = rankUpAbility(character, id, CONTENT.rules, { viaPractice: true, ...rankOpts() });
    if (r.ok) afterRank(id, r); else alert(r.why);
  };
  for (const b of app.querySelectorAll("[data-learn]")) b.onclick = () => {
    const free = aspirationRipe(character, b.dataset.learn, CONTENT.rules);
    const r = learnAbility(character, b.dataset.learn, fullCatalog(), CONTENT.rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity });
    if (r.ok) {
      if (free) dropAspiration(character, b.dataset.learn);
      saveCharacter(character);
      renderPlay(turn || character.activeScene?.lastTurn || null, { aside: `You ${free ? "have practiced your way into" : "begin learning"} ${fullCatalog()[b.dataset.learn]?.name}${free ? " — no point spent" : ""}.` });
    } else alert(r.why);
  };
  const findBtn = document.getElementById("party-find");
  if (findBtn) findBtn.onclick = async () => {
    findBtn.textContent = "Looking…";
    const scenes = await listScenesAt(character.currentLocationId);
    const open = scenes.find(sc => !sc.party.some(m => m.characterId === character.id));
    if (open && confirm(`Join ${open.party.map(m => m.name).join(", ")} in their scene?`)) joinPartyScene(open.sceneId);
    else if (confirm("No party found here. Start a shared scene others can join?")) startPartyScene();
    else renderPlay(character.activeScene?.lastTurn || null, {});
  };
  const leaveBtn = document.getElementById("party-leave");
  if (leaveBtn) leaveBtn.onclick = () => leavePartyScene();
  // turn gate: not your turn → choices and Act wait (Ask GM stays open)
  if (sharedScene && !isMyTurn(sharedScene, character.id)) {
    for (const b of app.querySelectorAll("[data-choice], [data-encact], #gambit-open")) b.disabled = true;
    const goBtn = document.getElementById("freeform-go");
    if (goBtn && !askMode) goBtn.disabled = true;
  }
  const gambitBtn = document.getElementById("gambit-open");
  if (gambitBtn) gambitBtn.onclick = () => renderGambitBuilder();
  const retry = document.getElementById("retry");
  if (retry) retry.onclick = () => startScene("(Retry the previous beat — pick up smoothly from where the story last stood.)");
}

// ---------- utils ----------

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/** SNG-BATCH-5 Phase 2: shared fork-choice modal. Renders the two paths; calls
 *  onPick(pathKey) after the player confirms. The caller locks the fork + ranks. */
function renderForkModal(abilityId, onPick) {
  const ab = fullCatalog()[abilityId];
  const f = CONTENT.branchForks?.forks?.[abilityId];
  if (!f) return;
  const paths = forkPaths(abilityId, CONTENT.branchForks);
  document.getElementById("fork-modal")?.remove();
  const el = document.createElement("div");
  el.id = "fork-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">${esc(ab?.name || abilityId)} — Rank ${f.atRank}: choose a path</div>` +
    `<div class="fork-prompt">${esc(f.prompt)}</div><div class="fork-paths">${paths.map(p =>
      `<button class="fork-path" data-forkpick="${esc(p.key)}"><div class="fp-name">${esc(p.name)}</div><div class="fp-grants">${esc(p.grants)}</div><div class="fp-cannot">△ ${esc(p.cannot)}</div></button>`).join("")}</div>` +
    `<div class="fork-warn">Permanent — the path you don't take locks forever for this ability.</div>` +
    `<button class="fork-cancel" id="fork-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  for (const btn of el.querySelectorAll("[data-forkpick]")) btn.onclick = () => {
    const key = btn.dataset.forkpick;
    if (!confirm(`Lock in "${f.paths[key].name}"? The other path is gone for good.`)) return;
    el.remove();
    onPick(key);
  };
  document.getElementById("fork-cancel").onclick = () => el.remove();
}

function rankOptsFor() { return { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, catalog: fullCatalog() }; }
function pct(v, max) { return Math.round((v / Math.max(1, max)) * 100); }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, v | 0)); }
