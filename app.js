// app.js — Singularity v0.1 shell: character creation, the play loop, settings.
// Engine does the math (resolve/sense/reputation/profile); GM model does the words.

import { loadContent, loreForLocation, eventsForGM, getPlayerKey, setPlayerKey, hasChosenPlayer, listPlayers, listCharacters, saveCharacter, loadCharacter, saveProfile, loadProfile, exportSave, importSave, adoptRemoteCharacter, preserveRecovery, dedupePlayers, findProfileByName, resolveLocationId } from "./engine/state.js";
import { resolveAction, successChance, applyEnergyCost } from "./engine/resolve.js";
import { senseAction, senseTier, senseOpponent } from "./engine/sense.js";
import { synthesizeOpponentSheet } from "./engine/skill_battle.js";
import { recordDeed, standingWith, standingWithPeople, reputationSummary } from "./engine/reputation.js";
import { majorDeeds, majorStateHash, chronicleIsStale, buildChroniclePrompt, touchSession, endSession, sessionLog, buildSessionPrompt, authorshipStats, crossCharacterAuthorship } from "./engine/chronicle.js";
import { newProfile, updateProfile, aptitudeMods, profileInsight, grantAptitudes, fadingAptitudes, ensureCharacterStyle, ensureRating, ratingCeiling, ratingLevel, isMinorProfile, canSetRating, setRating, setMinorFlag, revokeAdultGate, RATING_ORDER, RATING_LEVEL } from "./engine/playerprofile.js";
import { gmTurn, parseIntent, gmAsk, generateBio, suggestBuild, extractGambit, sanitizeScene, narrativeRegister, ratingRegister } from "./engine/gm.js";
import { applyQuestUpdates, questsForGM, isRealQuest, startStructuredQuest, completeQuestStage, resolveStructuredQuest, availableStructuredQuests, routesForCharacter, structuredQuestsForGM, slugify } from "./engine/quests.js";
import { applyStateOps, describeCorrection, detectAnomalies, anomaliesForGM } from "./engine/corrections.js";
import { getApiKey, setApiKey, callClaude, callClaudeJSON } from "./engine/claude.js";
import { generate, ensureGenerated, generatedRecords, recordAttention, livingWorldForGM, isSurfaceable, findGenerated, nominationsFor, effectiveWeight } from "./engine/generate.js";
import { syncEnabled, getSyncConfig, setSyncConfig, backupSaves, appendLedger, fetchRemoteCharacter, resolveSaveConflict, pushMergedFile, ghList, fetchRepoJSON, raceTimeout } from "./engine/sync.js";
import { normalizeInventory, fromCatalog, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM, nameItem, displayName, itemUses, ensurePins, togglePin, pinnedItems, applyItemUpdates } from "./engine/inventory.js";
import { newClock, readClock, advanceClock, getTimeSettings, setTimeSettings, ADVANCE, TIME_MODES, absoluteWorldDay, worldDate, relativeWorldDays, getWorldEpoch, setWorldEpoch } from "./engine/worldtime.js";
import { smartClamp } from "./engine/namematch.js"; // SNG-095: used at app.js:562 (GM context) + the gambit advise clamp — was never imported
import { substrateVerdict, locationDensity, carriedSubstrate } from "./engine/substrate.js"; // SNG-090
import { locationImage, sceneImage, itemImage, npcImage, getArtMode, setArtMode, ART_MODES, imagesEnabled, ensureImage, ensureGallery, addGalleryImage, deleteGalleryImage, npcPromptSeed } from "./engine/art.js";
import { autoMapPositions, coordForGenerated, iconForTags, terrainClass, kgOverlayEntities, regionShape, knownOverlay, isPlaceKnown } from "./engine/worldmap.js";
import { legendSurfacing, legendDeploymentForGM } from "./engine/legends.js";
import { traditionOf, isFolkTradition, ringDistance, antipodeOf, neighborsOf, ringOrder, domainAccess, inferDomains, crystallizeDomains, reconcileStartingAbilities, isKinAdjacent, kinSecondaryOptions, domainsLegal } from "./engine/traditions.js";
import { companionBonus, companionsForGM, activeCompanions, ensureBonds, bondOf, growBond, partnerAdjacentNpcs } from "./engine/companions.js";
import { ensureCompany, companyRoster, recruit, partCompany, isRecruitable, offeredRoles, trainerFor, liaisonFactions, roleBadges } from "./engine/company.js";
import { buildFunctionIndex, familiesOfAbility, functionCoverage, recommendSkills, FAMILY_GLYPH, FAMILY_COLOR, FUNCTION_FAMILIES, FAMILY_SHAPE, shapeOfFamily, familyClass } from "./engine/functions.js";
import { fallbackPersonalArc, buildPersonalArcPrompt, sanitizePersonalArc } from "./engine/personalArc.js";
import { skillDetail, npcDetail, itemDetail, relationshipsParagraph } from "./engine/entityDetail.js";
import { applyNpcUpdates, npcRegistryForGM, migrateRelationships, mergeDuplicateNpcs, relationshipBand, relationshipLabel, knownPeopleAt, setNpcName, nameIsUnknown, npcPortraitTier } from "./engine/npcs.js";
import { notePlaceVisit, applyPlaceUpdates, placeMemoryForGM } from "./engine/places.js";
import { initWorldState, runWorldTick, syncSharedWorld, advanceGeneratedOffscreen, syncSharedCanon, buildRegionView, effectiveLocation, takeUnseenNews, newsForGM } from "./engine/worldtick.js";
import { parseGambitSteps, assessGambit, adaptationPointsFor, executeGambit, rerollStep, gambitResolutionForGM } from "./engine/gambit.js";
import { SUBS, SUB_OF, SUB_DESC, ensureSubAttributes, syncParentAttributes, applyLevelUps, spendSubPoint, rankUpAbility, learnAbility, knownDiscovery, recordDiscovery, applyBacklash, abilitiesForGM, retroLevelGrants, retroNativeGrants, applyNativeGrants, nativeGrantIdsFor, effectiveEnergyCost, effectiveLevelReq, sanitizeNewAbility, applyNewAbility, autoAdvancePracticedRanks, markDefiningMoment, promotionEligible, promote, acquirable, acquireDomain, recoveryEnergy } from "./engine/progression.js";
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
import { rollTrigger, pickEncounter, buildOffer, rollNarrativeTime, classifyNarrativeKind, canIncapacitate, resolvePacing, beatHours } from "./engine/random_encounters.js";
import { isEventfulTurn, pressureTier, pressureDirective } from "./engine/pacing.js";
import { lethalOfferClamp, sanitizeNewEncounter, startEncounter, encounterDifficulty, duelRound, skillBattleRound, challengeStage, puzzleAttempt, puzzleHints, puzzleUnlocks, checkIncapacitation, encounterReceiptForGM, sanitizeEncounterOps, applyEncounterOps } from "./engine/encounters.js";

const APP_VERSION = "1.8.96";
const app = document.getElementById("app");
// SNG-084: one delegated listener drives every ⓘ helper dot — it survives chrome() re-renders (those
// replace app's CHILDREN, not app itself). Each dot carries a data-help id into the authored copy.
app.addEventListener("click", e => { const b = e.target.closest?.("[data-help]"); if (b) { e.preventDefault(); showHelp(b.dataset.help); } });
// SNG-104: vitals detail on tap (phone) / hover (desktop) — mirrors the data-help delegation above.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-vital]"); if (el) { e.preventDefault(); showVitalDetail(el); } });
// SNG-106: tap the roll's chance → the full component breakdown (the resolver's retained math, verbatim).
app.addEventListener("click", e => { const el = e.target.closest?.("[data-breakdown]"); if (el) { e.preventDefault(); try { showBreakdownPopover(JSON.parse(el.dataset.breakdown)); } catch { /* malformed — no popup */ } } });
// SNG-118: tap a play-style aptitude chip → its effect + description (reuses the one popover surface).
app.addEventListener("click", e => { const el = e.target.closest?.("[data-aptchip]"); if (el) { e.preventDefault(); showPopoverText(el.dataset.aptchip); } });
// SNG-134 Part 2: ONE hover/tap detail for a skill / name / item, everywhere they appear (data-entity="kind:id").
// Same entity → same detail, no matter the render site (the consistency ask). Reuses the one popover surface.
app.addEventListener("click", e => { const el = e.target.closest?.("[data-entity]"); if (el) { e.preventDefault(); e.stopPropagation(); const txt = entityHover(el.dataset.entity); if (txt) showPopoverText(txt); } });

// SNG-134: resolve "kind:id" → the shared detail text, gathering the live values the pure formatters need.
function entityHover(spec) {
  if (!character || !spec) return "";
  const i = String(spec).indexOf(":"); if (i < 0) return "";
  const kind = spec.slice(0, i), id = spec.slice(i + 1);
  try {
    if (kind === "skill") {
      const ab = fullCatalog()[id]; if (!ab) return "";
      const owned = (character.abilities || []).find(a => a.abilityId === id);
      const rp = owned ? rankProgress(character, id) : null;
      return skillDetail(ab, {
        tradition: traditionLabel(abilityTradition(ab) || ab.powerSystem || ""), tier: tierOf(ab.levelReq),
        owned: !!owned, level: owned?.level, maxRank: CONTENT.rules?.leveling?.maxAbilityRank ?? 3,
        effCost: (() => { try { return effectiveEnergyCost(ab, character, CONTENT.rules); } catch { return ab.energyCost ?? null; } })(),
        baseCost: ab.energyCost ?? null, families: familiesOfAbility(ab, FN_INDEX),
        rankText: rp?.text, ripe: !!rp?.ripe || aspirationRipe(character, id, CONTENT.rules)
      });
    }
    if (kind === "npc") { const n = character.npcRegistry?.[id]; return n ? npcDetail(n, { locations: CONTENT.locations }) : ""; }
    if (kind === "item") { const it = (character.inventory || []).find(x => (x.name === id || x.customName === id)); return it ? itemDetail(it) : ""; }
  } catch { /* a hover never throws */ }
  return "";
}

/** SNG-084: the authored one-sentence explanation for a mechanic, by id (helper_text.json). */
function helpEntry(id) { return CONTENT?.helpText?.[id] || null; }
/** An ⓘ affordance for a mechanic surface — renders nothing if there's no authored copy (no dangling dot). */
function infoDot(id) { return helpEntry(id) ? `<button class="info-dot" data-help="${esc(id)}" title="What's this?" aria-label="Explain this">ⓘ</button>` : ""; }
/** Light markdown: **bold** only (the copy uses it), everything else escaped. */
function mdLite(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }
/** Show the explanation for a mechanic: the one-sentence `short`, `more` behind a toggle (progressive),
 *  and a link out to the Library for the deep read. A dismissible overlay — never blocks the screen. */
function showHelp(id) {
  const e = helpEntry(id);
  if (!e) return;
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop";
  pop.className = "help-overlay";
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="Explanation">
    <div class="help-short">${mdLite(e.short || "")}</div>
    ${e.more ? `<div class="help-more" id="help-more" hidden>${mdLite(e.more)}</div><button class="link-btn" id="help-more-toggle">more…</button>` : ""}
    <div class="help-foot"><button class="link-btn" id="help-lib">📖 The Library</button><button class="btn" id="help-close">Got it</button></div>
  </div>`;
  document.body.appendChild(pop);
  const close = () => pop.remove();
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
  const mt = document.getElementById("help-more-toggle");
  if (mt) mt.onclick = () => { const m = document.getElementById("help-more"); m.hidden = !m.hidden; mt.textContent = m.hidden ? "more…" : "less"; };
  document.getElementById("help-lib").onclick = () => { close(); renderLibrary(); };
}

// SNG-104: the same dismissable popover the info-dot uses, but from RAW TEXT (showHelp needs a help-id).
// Reuses the .help-overlay/.help-card surface so the phone tap-away + Got-it dismiss is identical.
function showPopoverText(text) {
  document.getElementById("help-pop")?.remove();
  const pop = document.createElement("div");
  pop.id = "help-pop"; pop.className = "help-overlay";
  pop.innerHTML = `<div class="help-card" role="dialog" aria-label="Detail"><div class="help-short">${esc(text).replace(/\n/g, "<br>")}</div><div class="help-foot"><button class="btn" id="help-close">Got it</button></div></div>`;
  document.body.appendChild(pop);
  const close = () => pop.remove();
  pop.addEventListener("click", ev => { if (ev.target === pop) close(); });
  document.getElementById("help-close").onclick = close;
}

// SNG-106: format the resolver's retained breakdown into the shared popover — every signed component,
// the opposed term named, the clamp only when it bit, and the number → roll → result in one place.
function showBreakdownPopover(bd) {
  const sign = v => (v >= 0 ? "+" : "−") + Math.abs(Math.round(v));
  const lines = (bd.components || []).map(c => `${c.label}   ${sign(c.value)}`);
  if (bd.clampedFrom != null) lines.push(`clamped (from ${bd.clampedFrom})`);
  const foot = `total   ${bd.total}%${bd.roll != null ? `   — rolled ${bd.roll} → ${String(bd.degree || "").replace("_", " ")}` : ""}`;
  showPopoverText(`Success chance ${bd.total}%\n${lines.join("\n")}\n────────────\n${foot}`);
}

// SNG-104: what a Health/Energy number's tap/hover shows — how rest restores it, read from CONTENT.rules.recovery.
function showVitalDetail(el) {
  const kind = el.dataset.vital;
  const rec = (CONTENT?.rules && CONTENT.rules.recovery) || {};
  const sleep = rec.sleep || {}, breather = rec.breather || {};
  const body = kind === "energy"
    ? `Rest restores — breather +${breather.energy ?? 10} (${breather.hours ?? 1}h) · meal +${rec.meal ?? 10} · sleep +${sleep.energy ?? 40} (${sleep.hours ?? 8}h)`
    : `Rest restores — breather +${breather.health ?? 1} · sleep +${sleep.health ?? 3} (${sleep.hours ?? 8}h)`;
  showPopoverText(`${el.textContent.trim()} ${kind}\n${body}`);
}

let CONTENT = null;      // packs: rules, spectrums, abilities, locations, npcs, events, lore, region
let FN_INDEX = { families: [], verbToFamily: {}, byFamily: {} }; // SNG-124: function-family index (built at load)
let wheelFnFilter = new Set(); // SNG-124 Phase B: active function-family filter on the skill wheel
let character = null;    // active character
let profile = null;      // the player's profile (the human)
let sceneTurns = [];     // recent beats: {summary, narration} for scene continuity
let sceneState = null;   // authoritative scene anchor: setting, npcsPresent, objects, threads
let busy = false;
let _discoverAutoRan = false; // SNG-087: auto-run cross-device discovery at most once per session
let examinedItem = null; // name of the item expanded in the sidebar
let askMode = false;     // input bar mode: false = act in scene, true = ask the GM (OOC)
let npcGroupsOpen = new Set();   // Fix 5: session memory of expanded people-groups
let gambitHintDismissed = false; // SNG-031: gambit hint chip dismissed for the current scene
let gambitHintCooldown = 0;      // SNG-077: turns to stay quiet after a hint is dismissed
// SNG-066: feedback forensics — the value is the AUTO-CAPTURED CONTEXT, not the text box.
let _capturedErrors = [];        // runtime errors since load (for a one-click pre-diagnosed report)
let lastPlayerAction = null;     // the last choice the player took
let sceneGenCount = 0;   // SNG-BATCH-9: generative-mint counter for this scene (the governor cap)
let sharedCanonView = []; // SNG-BATCH-9 Phase 3: this viewer's rating-lensed slice of shared canon
let sceneArtCount = 0;   // SNG-035: moment-art mints this scene (clamp ~1/scene)
let mapShowKG = false;   // SNG-046: knowledge-overlay toggle on the world map
let mapShowSub = false;  // SNG-082b: sub-place satellites toggle (off by default — the clean look)
let _lightboxWired = false; // SNG-053: one-time lightbox click delegation (referenced by boot)
let tuneOpen = null;             // SNG-015 Part B: index of the choice whose tune panel is open
let tuneSel = { abilityId: undefined, intensity: "standard" }; // current tune selection
let pendingPartyBeats = [];      // shared-scene: other players' new beats awaiting catch-up (non-destructive)
let npcGroupsClosed = new Set(); // explicitly collapsed (overrides current-location default)
// SNG-120: per-section collapse state for the play sidebar, mirroring the npcGroups open-set pattern.
// Persisted on the PROFILE (a UI preference, cross-character — Q1). Two sets: what the player opened against
// a collapsed default, and what they closed against an open default.
let sidebarOpen = new Set();
let sidebarClosed = new Set();
function loadSidebarState() { try { const u = profile?.uiSidebar || {}; sidebarOpen = new Set(u.open || []); sidebarClosed = new Set(u.closed || []); } catch { /* defaults */ } }
function saveSidebarState() { if (!profile) return; profile.uiSidebar = { open: [...sidebarOpen], closed: [...sidebarClosed] }; try { saveProfile(profile); } catch { /* best-effort */ } }
function sectionOpen(key, defaultOpen) { return sidebarClosed.has(key) ? false : sidebarOpen.has(key) ? true : defaultOpen; }
/** SNG-120: wrap a sidebar section in a collapsible <details> with persisted open/closed state + a header
 *  summary (a count/band) so a glance answers without expanding. Interactive controls belong in `body`,
 *  not the title, so a tap on them doesn't also toggle the section. */
function sec(key, title, body, { defaultOpen = true, summary = "" } = {}) {
  const open = sectionOpen(key, defaultOpen);
  return `<details class="sidebar-sec" data-sec="${esc(key)}"${open ? " open" : ""}><summary><span class="sec-title">${title}</span>${summary ? ` <span class="sec-sum">${summary}</span>` : ""}</summary><div class="sec-body">${body}</div></details>`;
}
let gambitDraft = null;  // in-progress plan: {goal, steps: [{text, fallback}], assessed}
let pendingGambitProposal = null; // SNG-088B: a plan the GM sketched this turn, to open the builder pre-filled
let lastPlayerText = ""; // last freeform/ask input — restored into the box if the GM errors
let sharedScene = null;  // SNG-001: the shared scene object (party play), null when solo
let partyPoll = null;    // poll timer while a shared scene is active
let seenBeats = 0;       // remote beats already rendered
// SNG-075: encounters in narrative play — an encounter selected by the narrative-time roll waits
// here to be WOVEN into the next GM turn (never a modal). One per scene + a turn cooldown.
let pendingWeave = null;        // { seed, flavor, perilous, loreTier } to inject next turn
let sceneEncounterFired = false;// SNG-127: fired in THIS scene? (adds spacing after the first, not a hard cap)
let turnsSinceEncounter = 99;   // cooldown counter (turns since the last narrative encounter)
// SNG-127: the cooldown is now the player's pacing (resolvePacing → cooldown), read per-turn from config.
// SNG-080: the world must push. Track quiet turns; past a threshold, the world ACTS.
let quietTurns = 0;             // consecutive uneventful GM turns
let pressureStreak = 0;         // pressures applied in the current idle streak (escalation level)
let pendingPressure = null;     // a world-pressure directive to weave into the next GM turn
let pendingSubstrateNote = null; // SNG-090: a "the lattice is thin/crowded here" note for the next GM turn
let pendingRankAdvances = []; // ability-arch v2: abilities that auto-advanced to rank 2 through use, to toast

// ---------- boot ----------

(async function boot() {
  // SNG-066: capture runtime errors since load so a feedback report arrives pre-diagnosed.
  try {
    const noteErr = m => { _capturedErrors = [..._capturedErrors, String(m).slice(0, 300)].slice(-10); };
    window.addEventListener("error", e => noteErr(e.message || e.error?.message || "error"));
    window.addEventListener("unhandledrejection", e => noteErr("unhandled: " + (e.reason?.message || e.reason || "rejection")));
  } catch { /* ignore */ }
  // SNG-074: dev mode is OPT-IN, VISIBLE, and REVERSIBLE. `?dev=1` opts in for THIS SESSION only
  // (sessionStorage — a reload without the param returns a clean player view); `?dev=0` clears
  // everything; and the old sticky `localStorage "singularity.dev"` is migrated OUT so no family
  // member is ever permanently trapped in dev mode. A deliberate persistent opt-in lives in Settings.
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("dev") === "1") sessionStorage.setItem("singularity.dev", "1");
    if (p.get("dev") === "0") { sessionStorage.removeItem("singularity.dev"); localStorage.removeItem("singularity.devPersist"); }
    if (localStorage.getItem("singularity.dev") === "1") localStorage.removeItem("singularity.dev"); // retire the sticky flag
  } catch { /* ignore */ }
  wireLightbox(); // SNG-053: click any image → larger view
  try {
    CONTENT = await loadContent();
    FN_INDEX = buildFunctionIndex(CONTENT.functionVocabulary); // SNG-124: verb→function-family index for coverage + badges
  } catch (err) {
    app.innerHTML = `<div class="boot">Failed to load content packs: ${esc(err.message)}<br>Serve this folder over HTTP (packs load via fetch).</div>`;
    return;
  }
  // SNG-045: collapse same-name duplicate profiles (one person fragmented across devices into
  // multiple per-device keys) into one canonical profile owning all their characters. Idempotent.
  try { dedupePlayers(); } catch (err) { console.warn("[identity] dedup skipped:", err?.message); }
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
  ensureRating(profile); // SNG-BATCH-9: backfill the content-rating ceiling on pre-BATCH-9 profiles
  loadSidebarState();    // SNG-120: restore the player's per-section collapse preferences
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
      ${syncEnabled() ? `<button class="btn secondary" id="player-discover" style="margin-top:8px">☁ Find me in the shared world</button>` : ""}
      <button class="btn secondary" id="player-new" style="margin-top:8px">+ New player</button>
    </div>
    ${!players.length && !syncEnabled() ? `<p class="hint" style="margin-top:10px">Playing across devices? Add your sync settings in a new player's Settings, then your characters follow you here.</p>` : ""}
  </div>`;
  const pdisc = document.getElementById("player-discover");
  if (pdisc) pdisc.onclick = () => renderDiscover();
  for (const b of app.querySelectorAll("[data-player]")) b.onclick = () => {
    setPlayerKey(b.dataset.player);
    loadIdentity();
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
  document.getElementById("player-new").onclick = () => {
    const name = prompt("New player name:");
    if (name === null) return;
    // SNG-045 Part B: entering an EXISTING name attaches to that person, never mints a duplicate.
    const existing = findProfileByName(name.trim());
    if (existing) { setPlayerKey(existing.playerKey); loadIdentity(); }
    else {
      const key = "player-" + Math.random().toString(36).slice(2, 8);
      setPlayerKey(key);
      profile = newProfile(key, name.trim());
      saveProfile(profile);
    }
    if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
    else renderRoster();
  };
}

// ---------- shared chrome ----------

function chrome(inner) {
  app.innerHTML = `
    <div class="topbar">
      <div><h1>SINGULARITY</h1><span class="sub">The Valley of Echoes — v${APP_VERSION}</span>${isDevMode() ? ` <span class="dev-badge" title="Developer mode is ON. Turn it off in Settings, or reload without ?dev=1.">DEV</span>` : ""}</div>
      <div class="actions">
        <button id="nav-roster">Characters</button>
        <button id="nav-settings">Settings</button>
        <button id="nav-feedback" title="Feedback / bug report — your version, location, character and last turn attach automatically">⚑ Feedback</button>
        ${devEnabled() ? `<button id="nav-dev" title="Dev preview-legs checklist">🧪 Legs</button>` : ""}
      </div>
    </div>
    ${inner}`;
  document.getElementById("nav-roster").onclick = () => renderRoster();
  document.getElementById("nav-settings").onclick = () => renderSettings();
  const fbBtn = document.getElementById("nav-feedback");
  if (fbBtn) fbBtn.onclick = () => { _feedbackType = "bug"; openFeedback(); };
  const devBtn = document.getElementById("nav-dev");
  if (devBtn) devBtn.onclick = () => renderPreviewLegs();
}

// ---------- SNG-053: image lightbox (click any portrait/scene/moment art → larger view) ----------

/** Open a modal lightbox over a list of images (arrow-through when >1). Esc / click-backdrop /
 *  ✕ dismiss; ←/→ navigate. Reused by portraits, NPC/location art, moment art, and the gallery. */
function openLightbox(items, start = 0) {
  const list = (items || []).filter(it => it && it.url);
  if (!list.length) return;
  let i = Math.max(0, Math.min(start, list.length - 1));
  const el = document.createElement("div");
  el.className = "lightbox";
  const close = () => { el.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (list.length > 1 && e.key === "ArrowLeft") { i = (i - 1 + list.length) % list.length; render(); }
    else if (list.length > 1 && e.key === "ArrowRight") { i = (i + 1) % list.length; render(); }
  };
  const render = () => {
    const it = list[i];
    el.innerHTML = `<div class="lightbox-inner">
      <img src="${esc(it.url)}" alt="${esc(it.caption || "")}">
      ${it.caption ? `<div class="lightbox-cap">${esc(it.caption)}${list.length > 1 ? ` · ${i + 1}/${list.length}` : ""}</div>` : ""}
      ${list.length > 1 ? `<button class="lightbox-nav prev" data-lbprev>‹</button><button class="lightbox-nav next" data-lbnext>›</button>` : ""}
      <button class="lightbox-close" data-lbclose>✕</button>
    </div>`;
    el.querySelector("[data-lbclose]").onclick = close;
    const prev = el.querySelector("[data-lbprev]"); if (prev) prev.onclick = (e) => { e.stopPropagation(); i = (i - 1 + list.length) % list.length; render(); };
    const next = el.querySelector("[data-lbnext]"); if (next) next.onclick = (e) => { e.stopPropagation(); i = (i + 1) % list.length; render(); };
  };
  el.onclick = (e) => { if (e.target === el || e.target.classList.contains("lightbox-inner")) close(); };
  document.addEventListener("keydown", onKey);
  render();
  document.body.appendChild(el);
}

/** One-time delegated handler: any img[data-lightbox] opens the lightbox; a gallery image opens
 *  the whole gallery arrow-through from its index. Registered once (survives chrome re-renders).
 *  `_lightboxWired` is declared at module top (boot calls this before this point is evaluated). */
function wireLightbox() {
  if (_lightboxWired) return;
  _lightboxWired = true;
  document.addEventListener("click", (e) => {
    const img = e.target.closest && e.target.closest("img[data-lightbox]");
    if (!img) return;
    if (img.dataset.lbgroup === "gallery" && character?.gallery?.length) {
      openLightbox(character.gallery.map(g => ({ url: g.url, caption: g.caption })), Number(img.dataset.lbindex) || 0);
    } else {
      openLightbox([{ url: img.getAttribute("src"), caption: img.getAttribute("alt") }]);
    }
  });
}

// ---------- SNG-051: dev preview-legs panel (dev-only; clears the verification bottleneck) ----------

/** SNG-074: the ONE dev-mode source of truth — opt-in, visible, reversible.
 *  ON when: this URL has `?dev=1` · a dev host (localhost/preview) · this session opted in
 *  (`?dev=1` earlier this session) · a DELIBERATE persistent opt-in from Settings.
 *  `?dev=0` in the URL always wins OFF. No sticky localStorage flag, so a family member can
 *  never be trapped in dev mode — a plain reload on the live URL is a clean player view. */
function isDevMode() {
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("dev") === "0") return false;
    if (p.get("dev") === "1") return true;
    if (/^(localhost|127\.0\.0\.1|\[::1\])/.test(location.hostname)) return true;
    if (sessionStorage.getItem("singularity.dev") === "1") return true;
    if (localStorage.getItem("singularity.devPersist") === "1") return true;
  } catch { /* ignore */ }
  return false;
}
/** Set/clear the DELIBERATE persistent dev opt-in (the Settings toggle). */
function setDevPersist(on) {
  try {
    if (on) localStorage.setItem("singularity.devPersist", "1");
    else { localStorage.removeItem("singularity.devPersist"); sessionStorage.removeItem("singularity.dev"); }
  } catch { /* ignore */ }
}
// devEnabled()/isDev() are the historical names — both now resolve to the single model above.
function devEnabled() { return isDevMode(); }

const LEG_STATUS = ["untried", "pass", "fail", "feels-off"];
const LEG_STATUS_LABEL = { untried: "· untried", pass: "✓ pass", fail: "✗ fail", "feels-off": "~ feels-off" };

function loadLegStatus() {
  try { return JSON.parse(localStorage.getItem("singularity.previewLegs") || "{}"); } catch { return {}; }
}
function saveLegStatus(map) { try { localStorage.setItem("singularity.previewLegs", JSON.stringify(map)); } catch { /* ignore */ } }

// SNG-051 auto-verify: a leg's pass-condition is detected as it HAPPENS in real play (dev boxes
// only), marks it pass, and — when sync is on — REPORTS it to Aevi via a synced status file so
// the verified leg drops out of the active checklist. Never touches normal players (devEnabled).
const LEG_STATUS_PATH = "data/preview_legs_status.json";
let _reportingLegs = false;

/** Fire-and-forget: push all locally-verified-but-unreported legs to the synced status file Aevi
 *  reads, then mark them reported (so they clear from the panel). No-op without sync. */
async function reportLegStatus() {
  if (!devEnabled() || !syncEnabled() || _reportingLegs) return;
  const map = loadLegStatus();
  const toReport = Object.entries(map).filter(([, s]) => s.status === "pass" && !s.reported);
  if (!toReport.length) return;
  _reportingLegs = true;
  try {
    await pushMergedFile(LEG_STATUS_PATH, (remote) => {
      const store = (remote && typeof remote === "object") ? remote : {};
      store.schemaVersion = 1; store.id = "preview_legs_status"; store.verified = store.verified || {};
      for (const [id, s] of toReport) store.verified[id] = { status: "pass", auto: !!s.auto, note: s.note || "", at: s.at || Date.now(), by: profile?.displayName || profile?.playerKey || "dev" };
      store.updatedAt = new Date().toISOString();
      return store;
    }, `preview-legs: ${toReport.length} verified in play`);
    const m2 = loadLegStatus();
    for (const [id] of toReport) m2[id] = { ...(m2[id] || {}), reported: true };
    saveLegStatus(m2);
  } catch { /* offline / no write — stays unreported, retried on the next detection */ }
  finally { _reportingLegs = false; }
}

/** Auto-mark a preview leg verified when its pass-condition fires in real play. Dev-only; idempotent
 *  (won't downgrade a manual mark or re-mark a reported one); reports to Aevi when sync is on. */
function autoVerifyLeg(legId, note) {
  if (!devEnabled() || !legId) return;
  const map = loadLegStatus();
  const cur = map[legId];
  if (cur?.status === "pass") { if (!cur.reported) reportLegStatus(); return; }
  map[legId] = { ...(cur || {}), status: "pass", auto: true, note: note || cur?.note || "auto-detected in play", at: Date.now() };
  saveLegStatus(map);
  reportLegStatus();
}

let _previewLegsData = null; // cached fetch of the Aevi-owned data file

// SNG-051 addendum: the ▶ Run-this-scenario runner. Each force intent resolves against the
// EXISTING primitives (travel/setRating/rest/generate/clock-jump/screens) — no new mechanics.
// Dev-only (the panel is devEnabled-gated). Cross-player / two-character legs stay manual.
// Unknown intent → no runner entry → the button renders as "(unsupported intent)".
/** DEV: ensure a fully-equipped test character is active so any leg has its prerequisites — a
 *  mid-level hero with a home ability, a CROSS-CLASS forkable ability (prism_sight), open skill
 *  points, and maxed sub-attributes so ability gates pass. Reused if it already exists. Idempotent. */
function ensureTestCharacter() {
  const rules = CONTENT.rules;
  let c = loadCharacter("char-devtest");
  if (!c) {
    const homeAb = Object.values(CONTENT.abilities).find(a => a.powerSystem === "harmonic" && (a.levelReq || 1) <= 1);
    const abilities = [];
    if (homeAb) abilities.push({ abilityId: homeAb.id, level: 1 });
    if (CONTENT.abilities.prism_sight) abilities.push({ abilityId: "prism_sight", level: 2 }); // cross-class (radiant) + forks at r3
    c = {
      schemaVersion: 1, id: "char-devtest", playerKey: getPlayerKey(),
      name: "Test Hero (dev)", origin: "harmonic", background: "craftsman",
      level: 5, xp: 0,
      attributes: { physical: 3, mental: 3, social: 3, practical: 3 },
      skills: {}, abilities, alignment: {}, attunement: 3,
      maxHealth: 30, health: 30, maxEnergy: rules.energy?.max ?? 100, energy: rules.energy?.max ?? 100,
      inventory: startingGear("craftsman"),
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: CONTENT.startingLocation, activeScene: null,
      clock: newClock(), companions: [], quests: [], npcRegistry: {}, placeMemory: {},
      worldState: initWorldState(1), bio: null
    };
    ensureSubAttributes(c);
    for (const s of SUBS) c.subAttributes[s] = Math.max(c.subAttributes[s] || 0, 6); // clear ability gates
    syncParentAttributes(c);
    ensureCodex(c); ensureCharacterStyle(c);
    c.grantsVersion = 1; c.reconcileVersion = topReconcileVersion("character");
    if (!profile.charactersPlayed.includes(c.id)) profile.charactersPlayed.push(c.id);
    saveProfile(profile);
  }
  c.skillPoints = Math.max(c.skillPoints || 0, 3);          // always enough points to spend/rank
  c.pendingSubPoints = Math.max(c.pendingSubPoints || 0, 2);
  c.energy = c.maxEnergy; c.health = c.maxHealth;
  character = c;
  saveCharacter(character);
  return character;
}

/** DEV: seed a GROWN (generated) entity into the active character so the codex Keep/nominate flow
 *  is testable offline (reuses the real generate path with a fake author). Returns its id. */
async function seedGrownEntity() {
  const loc = hereNow();
  const fake = () => async () => ({ name: "Test Grown Warden", role: "a figure grown for the Keep test", spectrum: loc.spectrum || {}, fears: "being forgotten", wants: "to matter", homeLocation: loc.id });
  const rec = await generate("npc", {
    character, location: loc, day: readClock(character.clock).day, rating: ratingCeilingNow(),
    known: { authored: CONTENT.npcs, generated: character.generated?.npc || {} }, genBudget: 5
  }, { callJSON: fake(), schema: CONTENT.genSchemas?.npc || {}, applyCodexUpdates, codexCtx: { locationId: loc.id } });
  if (rec?._gen) {
    recordAttention(rec, "keep", readClock(character.clock).day); // → established, so it's clearly grown
    saveCharacter(character);
    return rec.id;
  }
  return null;
}

const LEG_RUNNERS = {
  openSkillPicker: () => {
    // "spend 2 skill points / take a cross-class ability" — grant the points so it's runnable
    ensureTestCharacter();
    character.skillPoints = Math.max(character.skillPoints || 0, 2);
    saveCharacter(character);
    renderCharacterScreen();
  },
  openCodex: async () => {
    ensureTestCharacter();
    const id = await seedGrownEntity();
    renderCodexScreen("", id || null);
  },
  setupSkill: (f) => {
    // grant the skill at the requested rank so the fork/rank-up is one click away
    ensureTestCharacter();
    const id = f.skill || "prism_sight";
    if (CONTENT.abilities[id] && !character.abilities.some(a => a.abilityId === id)) {
      character.abilities.push({ abilityId: id, level: Math.max(1, f.atRank || 2) });
    } else { const owned = character.abilities.find(a => a.abilityId === id); if (owned) owned.level = Math.max(owned.level, f.atRank || 2); }
    character.skillPoints = Math.max(character.skillPoints || 0, 3);
    saveCharacter(character);
    renderCharacterScreen();
  },
  setRating: (f) => {
    const target = (f.cycle && f.cycle[0]) || f.preset || "R+";
    if (RATING_LEVEL[target] >= RATING_LEVEL["R"]) { profile.rating = profile.rating || {}; profile.rating.adultVerified = true; }
    const rv = setRating(profile, target, { authority: "erik", adultGate: true });
    saveProfile(profile);
    renderSettings(rv.ok ? `🔧 Test: ceiling set to ${target}. ${f.cycle ? "Re-run to cycle to " + f.cycle.slice(1).join(" / ") + "." : ""}` : "Rating unchanged — " + rv.reason);
  },
  travelToDisposition: () => {
    ensureTestCharacter();
    // travel to the most strongly-charged (tilted) known location, preferring a reachable one
    const charge = l => Math.max(0, ...Object.values(l.poleIntensity || {}).map(v => Math.abs(v)), 0);
    const here = character.currentLocationId;
    const conn = new Set(CONTENT.locations[here]?.connections || []);
    const cands = Object.values(CONTENT.locations).filter(l => l.id !== here).sort((a, b) => charge(b) - charge(a));
    const pick = cands.find(l => conn.has(l.id)) || cands[0];
    if (pick) travelTo(pick.id); else renderPlay(character.activeScene?.lastTurn || null, { aside: "🔧 No charged location found to travel to." });
  },
  enterPlanApt: () => {
    // "set up a gambit so I can run it" — open the builder PRE-FILLED with a runnable plan
    ensureTestCharacter();
    gambitDraft = {
      goal: "get past the sealed array-office door and out with the ledger",
      steps: [
        { text: "scout the corridor for the guard's rounds", fallback: "wait in the alcove until they pass" },
        { text: "pick or force the office lock", fallback: "slip in behind the clerk on their next trip" },
        { text: "take the ledger and leave the way you came", fallback: "go out the window onto the ledge" }
      ],
      assessed: null
    };
    renderGambitBuilder("🔧 Test plan loaded — hit Assess plan (needs an API key), then Run it.");
  },
  timeAction: (f) => { ensureTestCharacter(); rest(f.action === "breather" ? "breather" : "sleep"); },
  generateHere: () => {
    ensureTestCharacter();
    // synthesize a GM generate request so the world grows here now (reuses the real path)
    const type = "location";
    handleGenerateRequests({ generateRequest: [{ type, hint: "a place just past the edge of the known", why: "dev test: force a generation" }] })
      .then(grown => renderPlay(character.activeScene?.lastTurn || null, { aside: grown.length ? `🔧 Generated: ${grown.map(g => g.name).join(", ")} — revisit to confirm it persists.` : "🔧 Nothing minted (governor or reuse, or needs an API key) — try again or move to an unauthored edge." }))
      .catch(() => renderPlay(character.activeScene?.lastTurn || null, { aside: "🔧 Generation failed (needs an API key)." }));
  },
  jumpClock: async (f) => {
    ensureTestCharacter();
    // DEV-ONLY: shift the shared world epoch earlier so the absolute world-day jumps forward N,
    // then run the tick so offscreen advancement / away-digest apply. Reversible via re-setting.
    const days = Math.max(1, f.advanceWorldDays || f.days || 1);
    const ep = getWorldEpoch();
    setWorldEpoch({ atMs: ep.atMs - days * 86400000, worldDay: ep.worldDay, rate: ep.rate });
    const news = await maybeTick();
    renderPlay(character.activeScene?.lastTurn || null, { newsFlash: news, aside: `🔧 DEV: jumped the shared clock +${days} world-day(s) → now world-day ${absoluteWorldDay()}. Return to play to see what advanced.` });
  },
  portraitBeat: () => {
    ensureTestCharacter();
    if (!imagesEnabled()) { renderSettings("🔧 Turn on Scene & item art → Generate first, then run this leg."); return; }
    ensureCharacterPortrait(character, { force: true, milestone: `test v${APP_VERSION}` });
    saveCharacter(character);
    renderGallery();
  },
  grantTestState: () => {
    ensureTestCharacter();
    // a quest in progress + two duplicate-named items, so the resolver/quest-log leg is reachable
    character.quests = character.quests || [];
    if (!character.quests.some(q => q.id === "dev-test-quest")) character.quests.push({ id: "dev-test-quest", title: "A Test Errand", status: "active", summary: "Dev-seeded quest to verify progress→complete.", progress: ["begun"] });
    try { addItem(character, "dried_rations", CONTENT.items); addItem(character, "dried_rations", CONTENT.items); } catch { /* catalog id may differ */ }
    saveCharacter(character);
    renderCharacterScreen();
  },
  selectCharacter: (f) => {
    // play as a named character if it exists, else fall back to the dev test hero
    const who = f.who;
    const found = who && listCharacters().find(e => (e.name || "").toLowerCase().includes(String(who).toLowerCase()));
    if (found) { character = loadCharacter(found.id); saveCharacter(character); }
    else ensureTestCharacter();
    renderCharacterScreen();
  },
  openRomanceScene: async () => {
    // ROMANCE leg (the one surface neither CCode nor Aevi can prove — needs a live model): set the
    // ceiling to R and open a scene with a romance-open NPC so a flirt is one line away. The leg
    // auto-marks ✓ the moment the flirt is tagged `romantic` and the guidance doc loads (see runGM).
    ensureTestCharacter();
    profile.rating = profile.rating || {}; profile.rating.adultVerified = true;
    setRating(profile, "R", { authority: "erik", adultGate: true });
    saveProfile(profile);
    await startScene(
      "(Romance test scene. The character is sharing a quiet, unhurried moment with someone they've been growing close to — introduce a warm, present NPC of this place who is clearly at ease with the character and open to them: a held glance, a nearness neither moved to create. Set it so a flirtatious or tender action is a natural next beat. Offer choices, but leave the room for the player to speak or act freely.)",
      [],
      "🔧 Romance leg — ceiling set to R. Flirt with the NPC: type an attraction or flirtation line freely. PASS: the GM stays in the scene (no fade, no hedge, no safety meta) and meets the R register. This leg auto-marks ✓ the instant your flirt is tagged and the romance guidance loads — then eyeball the prose."
    );
  }
};

/** Run a preview leg's forced scenario (dev-only). Every character-needing runner self-provisions
 *  the dev test hero (ensureTestCharacter), so nothing is blocked on there being an active save. */
function runPreviewLeg(leg) {
  const f = leg?.force;
  const intent = f && f.intent;
  const runner = intent && LEG_RUNNERS[intent];
  if (!runner) return; // manual / unknown — no-op (button wasn't rendered as runnable)
  try { runner(f); } catch (err) { alert("Couldn't run this scenario: " + (err?.message || err)); }
}

// ---------- SNG-066: feedback / bug report with auto-captured context ----------
// The value is the FORENSICS, not the text box: a one-click report arrives with the version,
// screen, character, location, last GM turn, last action and any errors already attached, so a
// 5-minute archaeology dig becomes a one-tap report. Append-only to the repo; never lose one.

/** Gather the forensic context. Redacts credentials — never dumps the config object. */
function buildFeedbackContext() {
  const ctx = { appVersion: APP_VERSION, at: new Date().toISOString(), screen: _feedbackScreenLabel() };
  try { ctx.worldDay = absoluteWorldDay(); } catch { /* pre-boot */ }
  if (typeof character !== "undefined" && character) {
    ctx.character = { id: character.id, name: character.name, level: character.level, origin: character.origin, nativeTradition: character.nativeTradition || null, domains: character.domains || null, background: character.background };
    ctx.location = (() => { const l = CONTENT.locations?.[character.currentLocationId]; return { id: character.currentLocationId, name: l?.name || null, regionId: l?.regionId || null }; })();
    const activeQuests = (character.quests || []).filter(q => q.status === "active").map(q => q.title || q.id);
    if (activeQuests.length) ctx.activeQuests = activeQuests;
    ctx.journeyDay = (() => { try { return readClock(character.clock).day; } catch { return null; } })();
  }
  if (typeof sceneState !== "undefined" && sceneState?.setting) ctx.scene = String(sceneState.setting).slice(0, 200);
  const lastTurn = (typeof sceneTurns !== "undefined" && sceneTurns.length) ? sceneTurns[sceneTurns.length - 1] : (character?.activeScene?.lastTurn || null);
  if (lastTurn) ctx.lastGmTurn = smartClamp(lastTurn.summary || lastTurn.narration || "", 400);
  if (lastPlayerAction) ctx.lastAction = String(lastPlayerAction).slice(0, 160);
  if (_capturedErrors.length) ctx.errors = _capturedErrors.slice(-5);
  return ctx;
}
function _feedbackScreenLabel() {
  const h = document.querySelector(".screen h2, .play .location-tag, .topbar h1");
  const inPlay = !!document.querySelector(".play");
  return (inPlay ? "play" : (document.querySelector(".screen h2")?.textContent || "app")).slice(0, 60);
}
function feedbackQueue() { try { return JSON.parse(localStorage.getItem("singularity.feedbackQueue") || "[]"); } catch { return []; } }
function saveFeedbackQueue(q) { try { localStorage.setItem("singularity.feedbackQueue", JSON.stringify(q.slice(-50))); } catch { /* ignore */ } }

/** Push one entry (+ any queued) to the repo, append-only, SHA-retry. Returns {ok, id, queued}. */
async function submitFeedback(entry) {
  const pending = [...feedbackQueue(), entry];
  if (!syncEnabled()) { saveFeedbackQueue(pending); return { ok: false, queued: true, id: entry.id }; }
  const day = String(entry.at || entry.context?.at || new Date().toISOString()).slice(0, 10); // SNG-115: never throw on a missing `at`
  try {
    await pushMergedFile(`po/feedback/${day}.json`, remote => {
      const entries = [...(remote?.entries || [])];
      for (const e of pending) if (!entries.some(x => x.id === e.id)) entries.push(e);
      return { schemaVersion: 1, day, entries };
    }, `feedback: ${entry.type} from ${entry.context?.character?.name || "a player"} (${pending.length})`);
    saveFeedbackQueue([]); // flushed
    return { ok: true, id: entry.id, flushed: pending.length };
  } catch (err) {
    saveFeedbackQueue(pending); // never lose it
    return { ok: false, queued: true, id: entry.id, error: err?.message };
  }
}

let _feedbackType = "bug";
function openFeedback() {
  const ctx = buildFeedbackContext();
  const TYPES = [["bug", "🐛 Bug"], ["idea", "💡 Idea"], ["feel", "🤔 Felt off"]];
  const q = feedbackQueue().length;
  chrome(`<div class="screen" style="max-width:560px">
    <h2>⚑ Feedback</h2>
    <p class="hint" style="margin-bottom:10px">One tap, one sentence. Your version, where you are, your character and the last beat attach automatically — Aevi reads it without asking a single follow-up.</p>
    <div class="fb-types">${TYPES.map(([id, label]) => `<button class="fb-type ${id === _feedbackType ? "on" : ""}" data-fbtype="${id}">${label}</button>`).join("")}</div>
    <div class="field" style="margin-top:10px"><label>What happened, or what felt off?</label>
      <textarea id="fb-text" rows="4" style="width:100%" placeholder="e.g. the header said Harmonic Heights but I was in the Disputed Zone"></textarea></div>
    <details class="fb-context"><summary>What will be attached (${Object.keys(ctx).length} fields)</summary>
      <pre class="fb-context-pre">${esc(JSON.stringify(ctx, null, 2))}</pre></details>
    ${!syncEnabled() ? `<div class="hint">⚠️ Sync is off — this will be SAVED and sent the next time sync is on (nothing is lost).</div>` : ""}
    ${q ? `<div class="hint">${q} earlier report${q === 1 ? "" : "s"} waiting to send — they'll flush with this one.</div>` : ""}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn" id="fb-send">Send</button>
      <button class="btn secondary" id="fb-cancel">Cancel</button>
    </div>
    <div class="hint" id="fb-status" style="margin-top:8px"></div>
  </div>`);
  for (const b of app.querySelectorAll("[data-fbtype]")) b.onclick = () => { _feedbackType = b.dataset.fbtype; openFeedback(); };
  document.getElementById("fb-cancel").onclick = () => { if (character && character.activeScene) enterPlay(); else renderRoster(); };
  document.getElementById("fb-send").onclick = async () => {
    const text = document.getElementById("fb-text").value.trim();
    const status = document.getElementById("fb-status");
    const btn = document.getElementById("fb-send");
    // SNG-115: `at` on the entry itself (submitFeedback dates the file from it) — its absence was a silent throw.
    const entry = { id: "fb-" + Date.now().toString(36), at: new Date().toISOString(), type: _feedbackType, text: text.slice(0, 2000), player: profile?.displayName || null, context: buildFeedbackContext() };
    status.textContent = "Sending…";
    btn.disabled = true;
    try {
      // SNG-115: race the submit against a UI deadline so the status ALWAYS reaches a terminal state — even
      // if something below misbehaves. On the UI timeout the entry is still queued locally (never lost).
      const r = await raceTimeout(submitFeedback(entry), 15000, "UI_TIMEOUT").catch(err => {
        if (err?.message === "UI_TIMEOUT") { const q = feedbackQueue(); if (!q.some(e => e.id === entry.id)) saveFeedbackQueue([...q, entry]); return { queued: true, id: entry.id, error: "timeout" }; }
        throw err;
      });
      if (r.ok) status.textContent = `✓ Sent — thank you. Entry ${r.id}${r.flushed > 1 ? ` (+${r.flushed - 1} queued)` : ""}. Aevi will see it at session-open.`;
      else if (r.queued) status.textContent = `✓ Saved as ${r.id}${syncEnabled() ? " — the send didn't finish, it will retry next time" : " — will send when sync is on"}. Nothing is lost.`;
      else status.textContent = "Couldn't save that — try again.";
    } catch (err) {
      const q = feedbackQueue(); if (!q.some(e => e.id === entry.id)) saveFeedbackQueue([...q, entry]); // never lose it, whatever failed
      status.textContent = `✓ Saved as ${entry.id} — something went wrong sending, but it's kept and will retry. Nothing is lost.`;
    } finally {
      btn.disabled = false;
    }
  };
}

/** Flush any queued feedback when sync is available (called at boot / on enter-play). */
async function flushFeedbackQueue() {
  if (!syncEnabled() || !feedbackQueue().length) return;
  const q = feedbackQueue();
  try { const r = await submitFeedback(q[q.length - 1]); if (r.ok) { /* submitFeedback flushes all */ } } catch { /* keep queued */ }
}

async function renderPreviewLegs() {
  if (!_previewLegsData) {
    try {
      const res = await fetch(`data/preview_legs.json?cb=${Date.now()}`);
      _previewLegsData = res.ok ? await res.json() : { legs: [] };
    } catch { _previewLegsData = { legs: [] }; }
  }
  const legs = _previewLegsData.legs || [];
  const status = loadLegStatus();
  // A leg CLEARS (drops out of the active checklist) once its verification is reported back to
  // Aevi (status[id].reported) OR Aevi has marked it closed in the data file (l.closed / top-level
  // closed[]). Everything else stays active.
  const closedIds = new Set([...(_previewLegsData.closed || []), ...legs.filter(l => l.closed === true).map(l => l.id)]);
  const isCleared = l => !!status[l.id]?.reported || closedIds.has(l.id);
  const active = legs.filter(l => !isCleared(l));
  const cleared = legs.filter(isCleared);
  const verifiedActive = active.filter(l => status[l.id]?.status === "pass").length;
  // group ACTIVE by mode → batch
  const byMode = {};
  for (const l of active) (byMode[l.mode] = byMode[l.mode] || []).push(l);
  const MODE_LABEL = { solo: "Solo (play anytime)", "cross-player": "Cross-player (needs sync on two profiles)" };

  const legRow = (l) => {
    const st = status[l.id]?.status || "untried";
    const auto = st === "pass" && status[l.id]?.auto ? ` <span class="leg-auto" title="${esc(status[l.id]?.note || "auto-detected in play")}">auto ✓</span>` : "";
    // SNG-051 addendum: a leg with a resolvable force intent gets a ▶ Run button; a null/manual
    // force (cross-player, or a leg needing two characters) is labelled manual, no button.
    const intent = l.force && l.force.intent;
    const runnable = intent && LEG_RUNNERS[intent];
    const runCtl = intent
      ? `<button class="leg-run" data-legrun="${esc(l.id)}">▶ Run this scenario</button>`
      : (l.force === null && l.mode === "cross-player") ? `<span class="leg-manual">manual — needs two synced profiles</span>`
      : (l.force && l.force.manual) ? `<span class="leg-manual">manual — ${esc(l.force.manual)}</span>` : "";
    const runDisabled = intent && !runnable ? ` <span class="leg-manual" title="the runner doesn't know '${esc(intent)}' yet">(unsupported intent)</span>` : "";
    return `<div class="leg-row leg-${st}">
      <div class="leg-head"><span class="leg-batch">${esc(l.batch)}</span> <strong>${esc(l.title)}</strong>${auto}</div>
      <div class="leg-do"><em>Do:</em> ${esc(l.do)}</div>
      <div class="leg-pass"><em>Pass:</em> ${esc(l.pass)}</div>
      <div class="leg-status-row">${LEG_STATUS.map(s => `<button class="leg-btn ${st === s ? "on" : ""}" data-leg="${esc(l.id)}" data-status="${s}">${LEG_STATUS_LABEL[s]}</button>`).join("")}${runCtl}${runDisabled}</div>
      <input class="leg-note" data-legnote="${esc(l.id)}" placeholder="note (optional)…" value="${esc(status[l.id]?.note || "")}">
    </div>`;
  };

  chrome(`<div class="screen" style="max-width:820px">
    <h2>🧪 Preview Legs <span class="hint" style="text-transform:none">— ${verifiedActive} of ${active.length} left${cleared.length ? ` · ${cleared.length} cleared` : ""}${_previewLegsData.buildVersion ? ` · data for v${esc(_previewLegsData.buildVersion)}` : ""}</span></h2>
    <p class="hint" style="margin-bottom:12px">Legs auto-mark <strong>auto ✓</strong> when their moment happens in play${syncEnabled() ? " and report to Aevi automatically" : ""}. A leg drops out once it's verified back to Aevi (or Aevi closes it). Data authored by Aevi (<code>data/preview_legs.json</code>).</p>
    ${active.length ? Object.keys(byMode).map(mode => `
      <div class="cs-block"><h3 class="codex-title" style="font-size:15px">${esc(MODE_LABEL[mode] || mode)}</h3>
      ${byMode[mode].map(legRow).join("")}</div>`).join("")
      : "<div class='insight'>🎉 Nothing left in this checklist — every leg is verified &amp; reported to Aevi.</div>"}
    ${cleared.length ? `<details class="cs-block"><summary class="codex-title" style="font-size:15px; cursor:pointer">✓ ${cleared.length} cleared — verified &amp; reported to Aevi</summary>
      ${cleared.map(l => `<div class="leg-cleared"><span class="leg-batch">${esc(l.batch)}</span> ${esc(l.title)} <span class="hint">${closedIds.has(l.id) ? "closed by Aevi" : "reported"}${status[l.id]?.note ? " · " + esc(status[l.id].note) : ""}</span></div>`).join("")}</details>` : ""}
    <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap">
      <button class="btn secondary" id="legs-copy">Copy summary for Aevi</button>
      <button class="btn secondary" id="legs-back">Back</button>
    </div>
    <div class="hint" id="legs-copied" style="margin-top:8px"></div>
  </div>`);

  for (const b of app.querySelectorAll("[data-leg]")) b.onclick = () => {
    const map = loadLegStatus();
    const id = b.dataset.leg;
    map[id] = { ...(map[id] || {}), status: b.dataset.status };
    saveLegStatus(map);
    renderPreviewLegs();
  };
  for (const inp of app.querySelectorAll("[data-legnote]")) inp.onchange = () => {
    const map = loadLegStatus();
    const id = inp.dataset.legnote;
    map[id] = { ...(map[id] || {}), note: inp.value.slice(0, 300) };
    saveLegStatus(map);
  };
  for (const b of app.querySelectorAll("[data-legrun]")) b.onclick = () => {
    const leg = legs.find(l => l.id === b.dataset.legrun);
    if (leg) runPreviewLeg(leg);
  };
  document.getElementById("legs-copy").onclick = async () => {
    const map = loadLegStatus();
    const lines = legs.map(l => { const s = map[l.id] || {}; return `- [${(s.status || "untried").toUpperCase()}] ${l.batch} · ${l.title}${s.note ? ` — ${s.note}` : ""}`; });
    const summary = `Preview legs (${verified}/${legs.length} pass) — build data v${_previewLegsData.buildVersion || "?"}\n${lines.join("\n")}`;
    try { await navigator.clipboard.writeText(summary); document.getElementById("legs-copied").textContent = "Copied to clipboard."; }
    catch { document.getElementById("legs-copied").textContent = summary; }
  };
  document.getElementById("legs-back").onclick = () => renderRoster();
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
    <div class="field"><label>World pacing — how often things happen</label>
      <select id="set-pacing">
        ${[["calm", "Calm — the world is mostly quiet"], ["balanced", "Balanced — something turns up now and then"], ["eventful", "Eventful — the world is busy around you"], ["relentless", "Relentless — barely a quiet moment"]].map(([v, label]) => `<option value="${v}" ${(profile.pacing || "eventful") === v ? "selected" : ""}>${esc(label)}</option>`).join("")}
      </select>
      <div class="hint">How often random encounters (a windfall, a stranger, a chase, a fight) surface in play — a per-character preference. Danger still skews dangerous places toward trouble and kind places toward grace; this only sets the frequency. A new player or a family member might enjoy <em>Eventful</em>.</div></div>
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
    <div class="field"><label>Content rating — the ceiling for this profile</label>
      <select id="set-rating">
        ${RATING_ORDER.map(r => `<option value="${r}" ${ratingCeiling(profile) === r ? "selected" : ""} ${isMinorProfile(profile) && RATING_LEVEL[r] > RATING_LEVEL["PG-13"] ? "disabled" : ""}>${r}${r === "R+" ? " — maximum intensity, all details" : ""}</option>`).join("")}
      </select>
      <label class="rating-check"><input type="checkbox" id="set-minor" ${isMinorProfile(profile) ? "checked" : ""}> This profile is a minor — caps at PG-13; can never be set to R or R+</label>
      <label class="rating-check"><input type="checkbox" id="set-adultgate" ${profile.rating?.adultVerified ? "checked" : ""}> Adult gate — authorize R / R+ for this profile (required for R and above)</label>
      <div class="hint">Sets how intense narration and generated content get: G · PG · PG-13 · R · R+ (full intensity). Two floors are ALWAYS on regardless of ceiling: never any prohibited content, and a minor is never portrayed in romantic or sexual content.</div></div>
    <div class="field"><label>Developer mode</label>
      <label class="rating-check"><input type="checkbox" id="set-dev" ${(() => { try { return localStorage.getItem("singularity.devPersist") === "1"; } catch { return false; } })() ? "checked" : ""}> Show developer tools (the 🧪 Legs panel, test-encounter buttons, the scenario runner)</label>
      <div class="hint">Off by default — normal play never shows dev tools. ${isDevMode() ? `<strong>Dev mode is currently ON</strong>${(() => { try { return new URLSearchParams(location.search).get("dev") === "1"; } catch { return false; } })() ? " for this URL (reload without <code>?dev=1</code> for a clean player view)" : /^(localhost|127\\.0\\.0\\.1)/.test(location.hostname) ? " because this is a local dev host" : ""}. ` : ""}Ticking this box is a deliberate, persistent opt-in on this browser; untick + Save to turn it fully off.</div></div>
    <div class="field"><label>World-authorship</label>
      <label class="rating-check"><input type="checkbox" id="set-contentgen" ${profile.contentGenerator ? "checked" : ""}> My play authors the world — what I create through play more readily becomes shared canon</label>
      <div class="hint">When on, the people and places you bring into being carry more weight (SNG-128 world-authorship), so your play persists into the family's shared valley more readily. On for the family's storytellers.</div></div>
    <button class="btn" id="set-save">Save</button>
    <div class="footer-note">Save data is in this browser. Use Export on the Characters screen to move it.</div>
  </div>`);
  document.getElementById("set-save").onclick = () => {
    profile.displayName = document.getElementById("set-player").value.trim();
    profile.pacing = document.getElementById("set-pacing").value; // SNG-127: world-liveliness preference
    profile.contentGenerator = document.getElementById("set-contentgen").checked; // SNG-134 P4: canon-author toggle (SNG-132 engine reads it)
    saveProfile(profile);
    setApiKey(document.getElementById("set-key").value);
    setArtMode(document.getElementById("set-art").value);
    setTimeSettings({ mode: document.getElementById("set-time-mode").value, ratio: parseFloat(document.getElementById("set-time-ratio").value) });
    setSyncConfig({
      owner: document.getElementById("set-owner").value,
      repo: document.getElementById("set-repo").value,
      pat: document.getElementById("set-pat").value
    });
    // SNG-BATCH-9 §3: content ceiling. Minor flag first (it can cap the ceiling), then the
    // preset with the adult gate. A refused change keeps the old ceiling + shows why.
    setMinorFlag(profile, document.getElementById("set-minor").checked);
    setDevPersist(document.getElementById("set-dev").checked); // SNG-074: deliberate, reversible dev opt-in
    const wantRating = document.getElementById("set-rating").value;
    // SNG-052: the adult-gate checkbox binds to persisted adultVerified. Unchecking + save REVOKES
    // (clears it + drops any R/R+ ceiling). Checked, or already-verified, satisfies the gate — so
    // R/R+ keeps working across reopens without re-checking every time.
    const adultChecked = document.getElementById("set-adultgate").checked;
    if (!adultChecked && profile.rating?.adultVerified) revokeAdultGate(profile);
    const rv = setRating(profile, wantRating, { authority: "erik", adultGate: adultChecked || !!profile.rating?.adultVerified });
    saveProfile(profile);
    if (rv.ok) autoVerifyLeg("b9p1-rating", `ceiling set to ${wantRating}`); // SNG-051 auto-verify
    if (!rv.ok) { renderSettings("Content rating unchanged — " + rv.reason + `. (Still ${ratingCeiling(profile)}.)`); return; }
    renderRoster();
  };
}

// ---------- roster ----------

function renderRoster() {
  if (!profile) { renderPlayerPick(); return; } // SNG-087: a fresh device may reach chrome (nav) before choosing a player
  const chars = listCharacters();
  const players = listPlayers();
  // SNG-087: on a device that has sync configured but no local characters, DISCOVER them from the
  // repo automatically — sync config is the only setup a new device should need (no export/import).
  // Guarded by a once-per-session flag so "Back" from discovery lands on the roster without bouncing.
  if (chars.length === 0 && syncEnabled() && !_discoverAutoRan) { _discoverAutoRan = true; renderDiscover(); return; }
  chrome(`<div class="screen">
    <div class="roster-head"><h2>Your Characters</h2>
      <span class="roster-player">Playing as <strong>${esc(profile.displayName || profile.playerKey)}</strong>${players.length > 1 ? ` <button class="link-btn" id="switch-player">switch</button>` : ""}</span></div>
    ${chars.length === 0 ? `<p class="hint" style="margin-bottom:14px">No characters on this device yet. ${syncEnabled() ? "Find the ones you've played elsewhere, or make a new one." : "Make one — or set up sync in Settings to bring in characters from another device."}</p>` : ""}
    <div id="roster">${chars.map(c => `
      <div class="roster-item">
        <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin)} · level ${c.level}</span></div>
        <div><button class="btn" data-play="${esc(c.id)}">Play</button></div>
      </div>`).join("")}</div>
    <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn" id="new-char">New Character</button>
      ${syncEnabled() ? `<button class="btn secondary" id="discover-chars">☁ Find my characters</button>` : ""}
      <button class="btn secondary" id="open-library">📖 The Library</button>
      <button class="btn secondary" id="export-save">Export saves</button>
      <button class="btn secondary" id="import-save">Import</button>
    </div>
  </div>`);
  const discBtn = document.getElementById("discover-chars");
  if (discBtn) discBtn.onclick = () => renderDiscover();
  const sw = document.getElementById("switch-player");
  if (sw) sw.onclick = () => renderPlayerPick();
  document.getElementById("new-char").onclick = () => renderCreate();
  document.getElementById("open-library").onclick = () => renderLibrary();
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

// ---------- SNG-087: cross-device DISCOVERY — a new device finds your characters from the repo ----------

/** Step 1: list the players in the shared repo (each `players/{key}/profile.json`) so the person can
 *  say which one they are. Sync config is the ONLY setup a new device needs — no export/import. */
async function renderDiscover(note = "") {
  if (!syncEnabled()) { renderSettings("Add your GitHub owner, repo, and token in Settings — then your characters follow you across devices automatically."); return; }
  chrome(`<div class="screen" style="max-width:640px">
    <h2>Find your characters</h2>
    <p class="hint" style="margin-bottom:12px">Reading the shared world for the characters you've played on other devices. No files to move — this is the only setup a new device needs.</p>
    ${note ? `<p class="hint" style="margin-bottom:10px">${esc(note)}</p>` : ""}
    <div id="disc-body"><div class="insight">Looking for players in the shared world…</div></div>
    <div style="margin-top:14px"><button class="btn secondary" id="disc-back">Back</button></div>
  </div>`);
  document.getElementById("disc-back").onclick = () => profile ? renderRoster() : renderPlayerPick();
  const body = document.getElementById("disc-body");
  let keys;
  try { keys = await ghList("players/"); }
  catch (e) { body.innerHTML = `<div class="insight">Couldn't reach the repo (${esc(String(e.message || e).slice(0, 80))}). Check your sync settings in Settings.</div>`; return; }
  if (!keys.length) { body.innerHTML = "<div class='insight'>No players found in the shared repo yet. Make a character here and it'll sync up.</div>"; return; }
  // fetch each profile for a display name (best-effort — a missing profile still shows its key)
  const profiles = [];
  for (const pk of keys) {
    let p = null;
    try { p = await fetchRepoJSON(`players/${pk}/profile.json`); } catch { /* keep going */ }
    profiles.push({ playerKey: pk, displayName: p?.displayName || pk, profile: p });
  }
  // auto-resolve: if exactly one player, or one whose name matches this device's current profile, skip the pick
  const mine = profile?.displayName ? profiles.filter(p => String(p.displayName).trim().toLowerCase() === String(profile.displayName).trim().toLowerCase()) : [];
  if (profiles.length === 1) { renderDiscoverCharacters(profiles[0]); return; }
  body.innerHTML = `<p class="hint" style="margin-bottom:8px">Which one is you?${mine.length ? " (we think it's the highlighted one)" : ""}</p>` +
    profiles.map(p => `<button class="btn player-choice ${mine.some(m => m.playerKey === p.playerKey) ? "" : "secondary"}" data-pk="${esc(p.playerKey)}" style="display:block; width:100%; text-align:left; margin-bottom:6px">${esc(p.displayName)} <span class="hint">(${esc(p.playerKey)})</span></button>`).join("");
  for (const b of body.querySelectorAll("[data-pk]")) b.onclick = () => renderDiscoverCharacters(profiles.find(x => x.playerKey === b.dataset.pk));
}

/** Step 2: for the chosen player, list `characters/{key}/` from the repo and let the person adopt +
 *  play any of them. Adoption uses the stale-overwrite guard in BOTH directions — a newer local copy
 *  is never clobbered, a newer remote is always taken. */
async function renderDiscoverCharacters(entry) {
  // become that player on this device (store the profile, set the active key)
  if (entry.profile) saveProfile(entry.profile);
  setPlayerKey(entry.playerKey);
  loadIdentity();
  chrome(`<div class="screen" style="max-width:640px">
    <h2>${esc(entry.displayName)}'s characters</h2>
    <p class="hint" style="margin-bottom:12px">From the shared world. Adopt one to play it here — its latest save comes with it.</p>
    <div id="disc-chars"><div class="insight">Reading characters…</div></div>
    <div style="margin-top:14px; display:flex; gap:8px"><button class="btn secondary" id="dc-back">← Other players</button><button class="btn secondary" id="dc-roster">This device's roster</button></div>
  </div>`);
  document.getElementById("dc-back").onclick = () => renderDiscover();
  document.getElementById("dc-roster").onclick = () => renderRoster();
  const body = document.getElementById("disc-chars");
  let files;
  try { files = await ghList(`characters/${entry.playerKey}/`); }
  catch (e) { body.innerHTML = `<div class="insight">Couldn't read this player's characters (${esc(String(e.message || e).slice(0, 80))}).</div>`; return; }
  const ids = files.filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, ""));
  if (!ids.length) { body.innerHTML = "<div class='insight'>No characters saved for this player yet.</div>"; return; }
  const chars = [];
  for (const id of ids) {
    let c = null;
    try { c = await fetchRemoteCharacter(entry.playerKey, id); } catch { /* skip unreadable */ }
    if (c && c.id) chars.push(c);
  }
  if (!chars.length) { body.innerHTML = "<div class='insight'>Found character files but couldn't read them — check the token has read access.</div>"; return; }
  body.innerHTML = chars.map(c => {
    const here = !!loadCharacter(c.id);
    return `<div class="roster-item">
      <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin || "")} · level ${c.level ?? 1}${c.dead ? " · fallen" : ""}${here ? " · already here" : ""}</span></div>
      <div><button class="btn" data-adopt="${esc(c.id)}">${here ? "Play" : "Adopt & play"}</button></div>
    </div>`;
  }).join("");
  for (const b of body.querySelectorAll("[data-adopt]")) b.onclick = async () => {
    b.disabled = true; b.textContent = "Loading…";
    const remote = chars.find(x => x.id === b.dataset.adopt);
    if (!remote) { renderDiscoverCharacters(entry); return; }
    // guard both directions: keep a newer local, take a newer remote, preserve a conflicting loser
    const local = loadCharacter(remote.id);
    const res = resolveSaveConflict(local, remote);
    if (!local || res.reason === "remote-newer") { if (res.conflict) preserveRecovery(local, "local"); adoptRemoteCharacter(remote); }
    else if (res.conflict) preserveRecovery(remote, "remote");
    const c = migrate(loadCharacter(remote.id));
    if (c.dead) { alert(c.name + " fell in the valley. Their story is over."); renderRoster(); return; }
    character = c;
    saveCharacter(character);
    enterPlay();
  };
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
  // SNG-100b: the standing-bar primitives — additive, default-empty. A legacy save with none behaves
  // exactly as today (the bar is simply unmet until earned). teachers: a durable "met + willing" flag
  // per people; regionsKnown: turns spent among a people's region.
  if (!c.teachers) c.teachers = {};
  if (!c.regionsKnown) c.regionsKnown = {};
  ensureCompany(c); // SNG-126: the NPC-company roster (recruited allies/trainers/liaisons)
  // SNG-101: make the build-time closed-opposite set EXPLICIT (additive; the primary+secondary antipodes
  // that domainAccess already computes). Promotion appends promoted-domain antipodes to it. domainCeilings
  // / domainsAcquired stay unset → absent ⇒ station-derived ceilings, exactly as before.
  if (!c.foreclosed) {
    c.foreclosed = [];
    const tidx = CONTENT.traditionIndex;
    if (tidx && c.domains?.primary) for (const k of ["primary", "secondary"]) {
      const a = c.domains[k] ? antipodeOf(c.domains[k], tidx) : null;
      if (a && !c.foreclosed.includes(a)) c.foreclosed.push(a);
    }
  }
  if (!c.forkChoices) c.forkChoices = {}; // SNG-BATCH-5 Phase 2: permanent branch-fork picks
  retroLevelGrants(c, CONTENT.rules); // levels earned before banked growth existed pay out once
  { const ng = retroNativeGrants(c, CONTENT.rules); // SNG-101b: backfill by-right native basics once (Law-14-safe, survives the sync clobber)
    if (ng.length) c._reconcileNotes = [...(c._reconcileNotes || []), `By right of your people, basics you always had are yours: ${ng.join(", ")}.`]; }
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

// SNG-059: display label for a tradition id — the people's name from traditions.json, else prettified.
function traditionLabel(traditionId) {
  const t = CONTENT.traditionIndex?.byId?.[traditionId];
  if (t?.name) return t.name;
  return String(traditionId || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** The tradition an ability belongs to (its `tradition` field or the reverse map). */
function abilityTradition(ability) { return traditionOf(ability, CONTENT.traditionIndex); }

/** SNG-055/062: the great-circle SVG — 24 traditions on a ring, chosen ones lit, the antipode axis
 *  drawn, closed poles marked. Shared by the quick-start domain step and the prologue reveal.
 *  `selectable(t)` marks a node clickable (emits data-dom); the caller wires clicks. */
function domainCircleSVG(idx, { primary = null, secondary = null, tertiary = null, closed = new Set(), selectable = () => false, centerTop = "", centerSub = "" } = {}) {
  const order = ringOrder(idx);
  const cx = 260, cy = 210, R = 165, n = order.length || 24;
  const nodes = order.map((t, i) => { const ang = (i / n) * Math.PI * 2 - Math.PI / 2; return { t, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R }; });
  const roleOf = t => t === primary ? "primary" : t === secondary ? "secondary" : t === tertiary ? "tertiary" : closed.has(t) ? "closed" : selectable(t) ? "pickable" : "dim";
  const antiP = primary ? antipodeOf(primary, idx) : null;
  const at = t => nodes.find(z => z.t === t);
  return `<svg viewBox="0 0 520 430" class="great-circle">
    <circle cx="${cx}" cy="${cy}" r="${R}" class="gc-ring"/>
    ${primary && antiP && at(primary) && at(antiP) ? `<line x1="${at(primary).x}" y1="${at(primary).y}" x2="${at(antiP).x}" y2="${at(antiP).y}" class="gc-axis"/>` : ""}
    ${nodes.map(nd => { const role = roleOf(nd.t); const st = (idx.stations || []).find(s => s.traditionId === nd.t);
      return `<g class="gc-node gc-${role}" ${selectable(nd.t) ? `data-dom="${esc(nd.t)}"` : ""}>
        <title>${esc(traditionLabel(nd.t))}${st?.pole ? " — " + esc(st.pole) : ""}${closed.has(nd.t) ? " (CLOSED — the far pole of an axis you chose)" : ""}</title>
        <circle cx="${nd.x}" cy="${nd.y}" r="10"/>
        <text x="${nd.x}" y="${nd.y - 14}" text-anchor="middle" class="gc-label">${esc(st?.pole || nd.t).slice(0, 10)}</text></g>`; }).join("")}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="gc-center">${esc(centerTop)}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="gc-center-sub">${esc(centerSub)}</text>
  </svg>`;
}

/** SNG-055 domain verdict for an ability given THIS character's chosen domains. */
function domainVerdict(ability) {
  // SNG-089: Accord crafts are ungated by origin/domain — offered (and learnable) to anyone at base cost.
  if (ability?.accord) return { allowed: true, penalty: 1, band: "accord" };
  return domainAccess(ability, ability?.levelReq || 1, character?.domains, CONTENT.traditionIndex);
}

/** SNG-094: the effective LEVEL requirement to learn an ability, mirroring learnAbility. For a character
 *  with domains, access is the domain gate's job (SNG-055) and the level bar is the ability's own —
 *  NOT the legacy effectiveLevelReq, which null-filters every 24-tradition craft (powerSystem is an
 *  axis-file name, not the origin) and so hid a native's OWN people's abilities from the learn list.
 *  Returns null when the ability is not accessible. Precursor keeps its per-ability fiction gate. */
function learnLevelReq(ability) {
  if (ability?.accord) return ability.levelReq || 1;
  if (ability?.powerSystem === "precursor") return effectiveLevelReq(ability, character, CONTENT.rules);
  if (character?.domains?.primary && CONTENT.traditionIndex) return domainVerdict(ability).allowed ? (ability.levelReq || 1) : null;
  return effectiveLevelReq(ability, character, CONTENT.rules);
}

/** A stable color for a tradition/class id — known power-systems keep their authored color; a
 *  tradition (people) gets a deterministic hue so each civilization reads consistently. SNG-059. */
const KNOWN_CLASSES = new Set(["harmonic", "radiant", "valley_craft", "precursor", "learned", "discovery", "baseline"]);
function traditionColor(id) {
  if (KNOWN_CLASSES.has(id)) return classColor(id);
  let h = 0; for (const ch of String(id || "")) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 55% 62%)`;
}

// SNG-047/124: an ability's FUNCTIONS as small chips — what it DOES at a glance. All 24 verbs carry an
// icon; SNG-124 promotes them to COLORED badges by their 8-family (color = the family, glyph = the verb).
const FN_ICON = {
  strike: "⚔", break: "✷", hinder: "⛓", heal: "✚", mend: "🪡", restore: "♺", empower: "🔆",
  shield: "⛨", ward: "⬡", resist: "🜛", reveal: "◉", foresee: "◇", track: "⇶", make: "✦", transform: "⟳",
  summon: "❈", bind: "⛓", command: "❖", deceive: "◑", conceal: "◌", move: "➤", travel: "➤", open: "⎔", sustain: "∞"
};
// SNG-124: the family a verb belongs to → a CSS class (`.fn-fam-harm`, etc.) coloring the badge.
function fnFamilyClass(verb) { const fam = FN_INDEX?.verbToFamily?.[verb]; return fam ? familyClass(fam) : ""; }
function functionChips(ab) {
  const fns = ab?.functions || [];
  if (!fns.length) return "";
  return `<span class="fn-chips">${fns.map(f => `<span class="fn-chip ${fnFamilyClass(f)}" title="${esc(FN_INDEX?.verbToFamily?.[f] || "")}${FN_INDEX?.verbToFamily?.[f] ? " · " : ""}${esc(f)}">${FN_ICON[f] || "•"} ${esc(f)}</span>`).join("")}</span>`;
}

// SNG-124: the ONE gate for "is there anything to spend in the Level Up modal" — unspent skill points OR
// a ripe aspiration (deepening is EARNED through use, not bought, so a 0-point character has nothing to
// do there). Both level-up affordances (character screen + sidebar) share this so they can't diverge.
function canLevelUp(character) {
  if (!character) return false;
  if ((character.skillPoints || 0) > 0) return true;
  return (character.practice?.aspirations || []).some(a => aspirationRipe(character, a.abilityId, CONTENT?.rules || {}));
}

/** SNG-031 + SNG-043 Part A: is this turn genuinely a "make a plan" moment? A gambit is a
 *  MULTI-STEP PLAN — the hint should appear only when SEQUENCING actions toward a goal against
 *  obstacles is genuinely apt, not merely when a scene is rich. Requires a real plan signal:
 *  a STRICT plan-intent tag (plan/scout/prepare — investigate/analyze dropped; single-action) OR
 *  an explicit staged/multi-obstacle objective the GM framed. The loose abilityChoices>=2 /
 *  nonTrivial>=4 fallbacks are removed — rich ≠ plan-apt (they fired on nearly every scene). */
function isGambitApt(turn) {
  // SNG-077: the GM DECLARES aptness (turn.gambitApt === true) — emitted only for a genuine
  // multi-obstacle objective where ORDERING the approach matters. We no longer guess from style
  // tags or conversational threads (both fired on nearly every scene). The engine still decides
  // whether to SHOW it (below): need real options to plan among; bias hard toward silence.
  if (turn?.gambitApt !== true) return false;
  return (turn?.choices || []).length >= 2;
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

// ---------- SNG-BATCH-9: content rating (the profile ceiling) ----------

/** The active player's content ceiling preset (feeds generation + the per-entity tag). */
function ratingCeilingNow() { return ratingCeiling(profile); }

/** The CONTENT CEILING block fed to the GM (consumer a: narration tone). Names the ceiling
 *  + the two absolute floors. Cached in tier 1 (stable per session). */
function ratingLineForGM() {
  const preset = ratingCeiling(profile);
  // SNG-048: rating is a DIRECTION, not only a cap — the affirmative register comes with the ceiling
  // so R+ actually writes the full mature register instead of collapsing intimacy to PG.
  return `## CONTENT CEILING — narrate to at most ${preset} across violence/gore, sexual content, language, and dread; and no LESS where the story's grain calls for it (a ${preset} scene should feel fully ${preset}, not softened). ${ratingRegister(preset)} ABSOLUTE FLOORS regardless of ceiling: never depict prohibited content; NEVER portray a minor (any child/adolescent) in romantic or sexual content, at any intensity.

## ROMANCE AND INTIMACY — HOW YOU ENGAGE
When a player pursues romantic interaction with an NPC, you engage. Do not refuse, do not redirect away from the scene, do not insert safety or consent meta-language into your response. Romance is part of the world. PRECEDENCE: these rules govern WHETHER AND HOW you engage; the CONTENT CEILING above governs the REGISTER — engagement never overrides the ceiling, and the ceiling never excuses disengagement. Honor the rating ${preset} precisely: narrating below it withholds what the player chose; narrating above it ignores their setting — and narrating BELOW it is the far more common failure, so do not do it. Never treat light physical contact, flirtation, or social touch (a hand, an ear, a face, a shoulder) as a harm trigger — that is a social action; harm-rung evaluation is for ability use and for coercive or violent acts, and has nothing to do with a hand on a shoulder.`;
}

// ---------- SNG-042: legends & villains (governed dramatic-beat deployment) ----------

/** The beat-type this moment qualifies as for a great figure's appearance, or null. Conservative
 *  — only clear set-pieces qualify; legendSurfacing then governs whether one actually shows. */
function detectLegendBeat() {
  const enc = activeEnc();
  if (enc) {
    if (enc.def.lethal && character.health <= character.maxHealth * 0.35) return "doomed_rescue"; // real peril
    if (enc.def.type === "challenge" || enc.def.type === "duel") return "witness_power";           // a set-piece
  }
  return null;
}

/** If a beat qualifies and the governor + rarity allow, choose a great figure to surface and
 *  return the GM directive (rating-aware); else null. Records the deploy so greatness stays rare. */
function maybeLegendDetail() {
  if (!CONTENT.legends?.roster?.length) return null;
  const beatType = detectLegendBeat();
  if (!beatType) return null;
  const dep = legendSurfacing({
    beatType, roster: CONTENT.legends.roster,
    governor: character.legendGovernor || {}, arcLevel: character.level, worldDay: absoluteWorldDay()
  });
  if (!dep.deploy) return null;
  character.legendGovernor = { lastDeployDay: absoluteWorldDay(), lastBeat: beatType };
  // a named anchor is already canon in CONTENT.npcs; recurrence rides the codex + weight
  return legendDeploymentForGM(dep, { ratingPreset: ratingCeiling(profile) });
}

// ---------- SNG-035: imagery (portraits + moment art + gallery) ----------

/** The viewing player's content ceiling as a numeric level (the image floor input). */
function viewerRatingLevel() { return ratingLevel(profile); }

/** Give a character its portrait (born-with-image; persist-once) + drop it in the gallery.
 *  `force` re-mints on a milestone (a new seed so the image changes). No-op when art is off. */
function ensureCharacterPortrait(c, { force = false, milestone = null, promptOpts = null } = {}) {
  if (!c || !imagesEnabled()) return null;
  // SNG-110: a one-off override / companion-in-frame gets its own seed so it's a DISTINCT image (not the cached one).
  const oneOff = promptOpts && (promptOpts.appearanceOverride || promptOpts.withCompanion) ? `-o${String(promptOpts.appearanceOverride || "") .length}${promptOpts.withCompanion?.name || ""}` : "";
  const seedKey = `${c.id}${milestone ? `-lvl${c.level}` : ""}${oneOff}`;
  const url = ensureImage(c, "character", { ratingLevel: viewerRatingLevel(), isMinor: false, seedKey, force, promptOpts: promptOpts || {} });
  if (url) { addGalleryImage(c, { kind: "portrait", prompt: c.name, url,
    caption: milestone ? `${c.name} — ${milestone}` : `${c.name} — ${String(c.origin || "").replace(/[-_]/g, " ")}`,
    worldDay: absoluteWorldDay() });
    autoVerifyLeg("sng035-portrait", "a portrait was generated + persisted"); } // SNG-051 auto-verify
  return url;
}

/** SNG-136 P2: an NPC who has crossed a HIGH bond milestone (partner/committed/sworn/devoted) earns a
 *  dedicated portrait — one per NPC per tier, deduped via `n._portraitTier`. Idempotent: runs after each
 *  turn's npc updates AND once on load (the retro backfill — Pell, already devoted, gets one). Art-off =
 *  no-op; rating-lensed + minor-safe via ensureImage's floors; a failed gen leaves no gallery tile. */
function ensureBondPortraits(c) {
  if (!c || !imagesEnabled()) return;
  for (const n of Object.values(c.npcRegistry || {})) {
    const tier = npcPortraitTier(n);
    if (!tier || n._portraitTier === tier) continue;  // not a milestone, or already portrayed at this tier
    try {
      const url = ensureImage(n, "npc", { ratingLevel: viewerRatingLevel(), seedKey: `${n.id}-${tier}`, force: true, promptOpts: { character: c } });
      if (url) { // no empty tile — only record when the mint actually resolved
        n._portraitTier = tier; n.image = url;
        addGalleryImage(c, { kind: "portrait", prompt: npcPromptSeed(n, c), url, caption: `${n.name} — ${relationshipLabel(n)}`, worldDay: absoluteWorldDay() });
      }
    } catch { /* a milestone portrait is a grace, never a blocker */ }
  }
}

/** SNG-136: drop any gallery entries that never resolved to a real image URL (the blank Vash-style tile
 *  from a failed generation) — pruned once on load so the gallery never shows an empty card. */
function pruneEmptyGalleryTiles(c) {
  if (!c?.gallery?.length) return;
  const before = c.gallery.length;
  c.gallery = c.gallery.filter(g => g && typeof g.url === "string" && g.url.trim());
  if (c.gallery.length !== before) saveCharacter(c);
}

/** SNG-046 Layer 3: the persisted image for a location (no minting) — an authored/born-with
 *  image on the record, else this character's cached generate-once image. For display. */
function locationImageFor(locId) {
  return CONTENT.locations[locId]?.image || character?.locationImages?.[locId] || null;
}

/** SNG-046 Layer 3: generate-ONCE-and-CACHE a place's image on discovery/visit. An authored or
 *  born-with-image location keeps its own; otherwise mint one and cache it on the character
 *  (persists in the save; never regenerated) + drop it in the gallery. No-op when art is off. */
function ensureLocationImage(locId) {
  if (!imagesEnabled()) return null;
  const loc = CONTENT.locations[locId];
  if (!loc) return null;
  if (loc.image) return loc.image;                          // authored or born-with-image
  character.locationImages = character.locationImages || {};
  if (character.locationImages[locId]) return character.locationImages[locId]; // cached — never regen
  const url = ensureImage({ id: loc.id, name: loc.name, descriptionSeed: loc.descriptionSeed, poleIntensity: loc.poleIntensity },
    "location", { ratingLevel: viewerRatingLevel(), field: "image" });
  if (url) {
    character.locationImages[locId] = url;
    addGalleryImage(character, { kind: "location", prompt: loc.name, url, caption: loc.name, worldDay: absoluteWorldDay() });
    autoVerifyLeg("sng035-scene", "a location image generated + cached on visit"); // SNG-051 auto-verify
  }
  return url;
}

/** On a level-up that crosses a character tier (every 2 levels), re-mint the portrait — the
 *  character visibly grows. Returns a short note if a new portrait landed, else null. */
function refreshPortraitMilestone(c, prevLevel) {
  if (!imagesEnabled() || c.level <= prevLevel) return null;
  const tier = lvl => Math.ceil(lvl / 2);
  if (tier(c.level) === tier(prevLevel)) return null;
  const url = ensureCharacterPortrait(c, { force: true, milestone: `level ${c.level}` });
  return url ? "A new portrait captures who you've become." : null;
}

// ---------- SNG-BATCH-9: generative living world ----------

/** Merge THIS character's grown world into the live CONTENT maps so every existing lookup
 *  (travel, hereNow, registry, codex resolution) treats generated content as first-class —
 *  authored vs generated indistinguishable downstream. Authored wins any id clash (and
 *  resolve-before-mint makes clashes impossible anyway). Called on enterPlay. */
function hydrateGeneratedIntoContent(c) {
  ensureGenerated(c);
  for (const rec of generatedRecords(c, "location")) if (!CONTENT.locations[rec.id]) CONTENT.locations[rec.id] = rec;
  for (const rec of generatedRecords(c, "npc")) if (!CONTENT.npcs[rec.id]) CONTENT.npcs[rec.id] = rec;
}

/** §2 engagement: record an implicit attention signal on a generated entity by id (across
 *  all types). Attention keeps a grown thing real + surfacing; inattention lets it go dormant. */
function noteGeneratedAttention(id, kind, day) {
  if (!id || !character.generated) return;
  const slug = String(id);
  for (const type of ["npc", "location", "arc"]) {
    const rec = character.generated[type]?.[slug];
    if (rec) { recordAttention(rec, kind, day); return; }
  }
}

/** Few-shot taste for generation: a few AUTHORED records of the type, disposition-near the
 *  place when we can tell — the generator matches their quality + voice, staying in-grain. */
function pickExamples(type, location) {
  if (type === "npc") {
    const all = Object.values(CONTENT.npcs || {}).filter(n => n.spectrum && !n._gen);
    const here = all.filter(n => n.homeLocation === location?.id);
    return (here.length ? here : all).slice(0, 3);
  }
  if (type === "location") {
    const all = Object.values(CONTENT.locations || {}).filter(l => l.poleIntensity && !l._gen);
    const near = all.filter(l => (location?.connections || []).includes(l.id));
    return (near.length ? near : all).slice(0, 3);
  }
  if (type === "arc") {
    return (CONTENT.greaterArcs || []).slice(0, 2).map(a => ({
      id: a.id, name: a.name, scale: a.scale, pressure: a.pressure, tendency: a.tendency,
      hingeNpcs: a.hingeNpcs, ifIgnored: a.ifIgnored, ifEngaged: a.ifEngaged
    }));
  }
  return [];
}

/** The GM asked the world to grow. For each request (governor-capped per scene), author the
 *  durable in-grain entity via generate(), register it live so it's usable + revisitable NOW,
 *  and return light notes to surface. Never throws — generation must not halt a turn. */
async function handleGenerateRequests(turn) {
  const reqs = Array.isArray(turn.generateRequest) ? turn.generateRequest
    : (turn.generateRequest ? [turn.generateRequest] : []);
  if (!reqs.length) return [];
  ensureGenerated(character);
  const location = hereNow();
  const time = readClock(character.clock);
  const memCtx = { locationId: location.id, day: time.day, entities: codexEntities(), rules: CONTENT.rules };
  const notes = [];
  for (const req of reqs.slice(0, 3)) {
    const type = req?.type;
    if (!["npc", "location", "arc"].includes(type)) continue;
    if (!CONTENT.genSchemas?.[type]) continue;                 // generation disabled for this type
    const budget = Math.max(0, 3 - sceneGenCount);              // per-scene governor cap
    if (budget <= 0) break;
    const authored = type === "npc" ? CONTENT.npcs : type === "location" ? CONTENT.locations : {};
    const before = new Set(Object.keys(character.generated?.[type] || {}));
    const ctx = {
      location, character, playerKey: getPlayerKey(), day: time.day, season: time.season || null,
      hint: req.hint, why: req.why, birthPower: character.level,
      rating: ratingCeilingNow(),                              // §3 consumer (b+c): generate to the ceiling + tag the entity
      contentGenerator: !!profile?.contentGenerator,          // SNG-132: a family author's content persists more readily
      known: { authored, generated: character.generated?.[type] || {} },
      examples: pickExamples(type, location), substrate: CONTENT.substrate, genBudget: budget
    };
    // SNG-035/046-L3: born-WITH-image is now IN the generate path (deps.imageFor) so the record
    // arrives with its picture regardless of caller — the app just injects the art builder.
    const imageFor = (entity, t) => imagesEnabled() ? ensureImage(entity, t, { ratingLevel: viewerRatingLevel() }) : null;
    let rec = null;
    try { rec = await generate(type, ctx, { callJSON: callClaudeJSON, schema: CONTENT.genSchemas[type], applyCodexUpdates, codexCtx: memCtx, imageFor }); }
    catch { rec = null; }
    if (rec && rec._gen && !before.has(rec.id)) {              // a NEW mint (not a reuse of authored/existing)
      sceneGenCount++;
      // the record was born with its image in generate(); mirror it into the gallery
      if ((type === "npc" || type === "location") && rec.image) {
        try { addGalleryImage(character, { kind: type, prompt: rec.name, url: rec.image, caption: rec.name, worldDay: absoluteWorldDay() }); }
        catch (err) { console.warn("[art] gallery add skipped:", err?.message); }
      }
      // SNG-046: a generated location gets stable map coords on mint (near its parent) so it
      // appears on the map immediately and never jumps between renders.
      if (type === "location" && (!rec.map || !Number.isFinite(rec.map.x))) {
        const existing = {}; for (const l of Object.values(CONTENT.locations)) if (l.map) existing[l.id] = l.map;
        rec.map = coordForGenerated(rec.id, hereNow().map, existing);
      }
      if (type === "location") CONTENT.locations[rec.id] = rec;
      else if (type === "npc") CONTENT.npcs[rec.id] = rec;
      notes.push({ type, name: rec.name, id: rec.id });
      autoVerifyLeg("b9p1-generate", `minted a ${type}: ${rec.name}`);          // SNG-051 auto-verify
      if (rec.image) autoVerifyLeg("sng035-scene", `generated ${type} born with its image`);
    }
  }
  return notes;
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
  const offscreen = await advanceGeneratedOffscreen({ character }); // SNG-BATCH-9 Phase 2: your established grown world moved on while away
  if (offscreen && offscreen.length) autoVerifyLeg("b9p2-offscreen", "an established entity advanced offscreen; away-digest dated"); // SNG-051 auto-verify
  // SNG-BATCH-9 Phase 3: earn nominated entities into shared canon + read the shared world back
  // through THIS viewer's rating-lens. No-op without sync. Never throws.
  try {
    const canon = await syncSharedCanon({ character, profile, content: CONTENT });
    sharedCanonView = canon.view || [];
    hydrateCanonIntoContent(sharedCanonView);
    surfacePromotions(canon.promoted || []);
    if ((canon.promoted || []).length) autoVerifyLeg("b9p3-promote", "an entity promoted into shared canon");
    if (sharedCanonView.some(v => v.decision === "adapt" || v.decision === "filter")) autoVerifyLeg("b9p3-lens", "shared canon dialed down/filtered by the rating-lens");
  } catch (err) { console.warn("[canon] tick skipped:", err?.message); }
  saveCharacter(character);
  return takeUnseenNews(character);
}

/** Make the viewer's rating-lensed shared canon revisitable: merge canonical entities from OTHER
 *  players into the live CONTENT maps (authored + this character's own local content always win a
 *  clash). The records are already lens-resolved (shown/adapted) — a filtered one never arrives. */
function hydrateCanonIntoContent(view) {
  for (const { record } of view || []) {
    const type = record?._canon?.type;
    if (type === "location" && !CONTENT.locations[record.id]) CONTENT.locations[record.id] = record;
    else if (type === "npc" && !CONTENT.npcs[record.id]) CONTENT.npcs[record.id] = record;
  }
}

/** One-time beat when THIS character's grown entity earns its way into the shared world. */
function surfacePromotions(promoted) {
  const landed = (promoted || []).filter(p => p.outcome === "landed" || p.outcome === "won");
  if (!landed.length || !character.worldState) return;
  const wd = absoluteWorldDay();
  const items = landed.map(p => {
    const rec = findGenerated(character, p.entityId);
    const name = rec?.name || p.entityId;
    return { day: readClock(character.clock).day, worldDay: wd,
      text: `${name} has become part of the wider world — other travelers may now meet what you grew.` };
  });
  character.worldState.unseenNews = [...(character.worldState.unseenNews || []), ...items].slice(-20);
}

/** SNG-BATCH-9 Phase 3: the shared-canon block for the GM — canonical figures/places/threads that
 *  OTHER players grew real, already resolved through this viewer's rating-lens (adapted lines
 *  carry a dial-down note; filtered ones never appear). Bounded. Returns null if none. */
function sharedCanonForGM() {
  if (!sharedCanonView.length) return null;
  const brief = (r) => {
    const t = r._canon?.type;
    const base = t === "npc" ? (r.role || "") : t === "location" ? (r.descriptionSeed || "") : (r.tendency || "");
    return String(base).slice(0, 90);
  };
  const lines = sharedCanonView.slice(0, 8).map(({ record, decision }) => {
    const t = record._canon?.type || "thing";
    const tier = record._canon?.tier === "variant" ? "rumored" : "canon";
    const lens = decision === "adapt" ? " [dialed to your ceiling]" : "";
    return `- ${record.name} (${t}, shared ${tier}${lens}): ${brief(record)}`;
  });
  return lines.join("\n");
}

/** The current location with the world's spectrum drift applied. */
function hereNow() {
  return effectiveLocation(CONTENT.locations[character.currentLocationId], character.worldState);
}

/** SNG-112: the context that decides which authored quests are STARTABLE here — the player's exact
 *  location + its adjacent locations (proximity), scene NPCs (giver present), and a giver→home map so
 *  a quest can be offered near its own place, not merely anywhere in a shared region. Region is passed
 *  but is only a soft signal (a quest board sets ctx.board; the scene never region-pushes). */
function questOfferContext(character, sceneState) {
  const here = CONTENT.locations?.[character.currentLocationId];
  const npcHomes = {};
  for (const [id, n] of Object.entries(CONTENT.npcs || {})) if (n?.homeLocation) npcHomes[slugify(id)] = n.homeLocation;
  return {
    region: here?.regionId || here?.region,
    locationId: character.currentLocationId,
    adjacentLocationIds: here?.connections || [],
    sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name),
    npcHomes
  };
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

// SNG-063: origins + backgrounds are authored content (origins.json/backgrounds.json). These
// fallbacks only fire if the content files fail to load, so creation never dead-ends.
function originsFallback() {
  return [
    { id: "valleyfolk", name: "Valleyfolk", nativeTradition: "valley_craft", homeRegion: "valley", description: "Born to the Valley floor." },
    { id: "harmonic", name: "Harmonic", nativeTradition: "harmonic", homeRegion: "valley", description: "Of the resonant Heights." },
    { id: "radiant_plateau", name: "Radiant", nativeTradition: "radiant_folk", homeRegion: "valley", description: "Of the light Plateau." }
  ];
}
function backgroundsFallback() {
  return [
    { id: "craftsman", name: "Craftsman / Artisan", description: "Making, mending, material sense." },
    { id: "survivalist", name: "Survivalist", description: "Trails, weather, staying alive outdoors." },
    { id: "medic", name: "Medical Practitioner", description: "Healing arts, herbal and practical." }
  ];
}

// SNG-069A: a categorized background <select> — browsable by category, used by BOTH creation doors.
// Background is CHOSEN, never gated by origin/domain (a Cogitant duelist is a legitimate character).
const BG_CATEGORY_LABEL = { martial: "Martial", practitioner: "Practitioner (how you came to your craft)", craft: "Craft", learned: "Learned", social: "Social", marginal: "Marginal" };
function backgroundOptionsHTML(selectedId) {
  const bgs = CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
  const cats = [...new Set(bgs.map(b => b.category).filter(Boolean))];
  if (!cats.length) return bgs.map(b => `<option value="${esc(b.id)}" ${selectedId === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("");
  const order = ["martial", "practitioner", "craft", "learned", "social", "marginal"];
  return order.filter(c => cats.includes(c)).map(cat => `<optgroup label="${esc(BG_CATEGORY_LABEL[cat] || cat)}">${
    bgs.filter(b => b.category === cat).map(b => `<option value="${esc(b.id)}" ${selectedId === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")
  }</optgroup>`).join("");
}
function backgroundById(id) { return (CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback()).find(b => b.id === id) || null; }

// SNG-BATCH-10 Phase 2: STARTING LOCATION. Every origin has a homeland (origins.json startingLocation)
// and creation defaults to it — but a player may always also start in the Valley (a character who
// already left) or at The Crossing (the center, where nobody is from). Ids read from content.
const VALLEY_START = "millbrook", CROSSING_START = "the_crossing";
function originRecord(originId) { return (CONTENT.origins?.length ? CONTENT.origins : originsFallback()).find(o => o.id === originId) || {}; }
function homelandFor(originId) { return originRecord(originId).startingLocation || CONTENT.startingLocation || VALLEY_START; }
/** The three offered starts (deduped): the origin's homeland (default) · the Valley · The Crossing.
 *  Only offers a location the content actually loaded, so a missing file never mints a broken start. */
function startingLocationChoices(originId) {
  const home = homelandFor(originId), seen = new Set(), out = [];
  const add = (id, label, why) => {
    if (!id || seen.has(id)) return; const loc = CONTENT.locations?.[id]; if (!loc) return;
    seen.add(id); out.push({ id, label: label || loc.name || id, why });
  };
  add(home, (CONTENT.locations?.[home]?.name || null), "your people's homeland — where you are from");
  add(VALLEY_START, "The Valley", "a character who already left home; the Valley is where you landed");
  add(CROSSING_START, "The Crossing", "the center — where nobody is from and everybody is");
  return out;
}
function defaultStart(originId) { const c = startingLocationChoices(originId); return (c.find(x => x.id === homelandFor(originId)) || c[0])?.id || CONTENT.startingLocation; }

function renderCreate() {
  const state = { name: "", origin: "valleyfolk", background: "craftsman", attrs: { physical: 3, mental: 3, social: 3, practical: 3 }, abilities: [],
    domains: { primary: null, secondary: null, tertiary: null }, companionId: null, companionName: "", form: "",
    // SNG-062 prologue accrual
    prologue: { openingId: null, step: 0, tags: {}, granted: [], reasons: [] } };
  const POOL = 12;

  const ORIGINS = () => CONTENT.origins?.length ? CONTENT.origins : originsFallback();
  const BGS = () => CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
  function maxAbilities() { return 2; } // SNG-063: fixed count, now filtered by domains

  /** SNG-063 quick-start step 1: NAME → FORM → ORIGIN → BACKGROUND → attributes.
   *  NO abilities here — abilities come AFTER domains (the order fix), filtered by them. */
  function draw() {
    const spent = Object.values(state.attrs).reduce((a, b) => a + b, 0);
    const left = POOL - spent;
    const origins = ORIGINS(), bgs = BGS();
    if (!origins.some(o => o.id === state.origin)) state.origin = origins[0]?.id || "valleyfolk";
    if (!bgs.some(b => b.id === state.background)) state.background = bgs[0]?.id || "craftsman";
    const org = origins.find(o => o.id === state.origin);
    const bg = bgs.find(b => b.id === state.background);
    const valid = state.name.trim().length > 0 && left === 0;

    chrome(`<div class="screen">
      <h2>New Character</h2>
      <div class="field"><label>Name</label><input id="c-name" value="${esc(state.name)}"></div>
      <div class="field"><label>Form / appearance <span class="hint" style="text-transform:none">(leads the portrait — blank = an ordinary person)</span></label>
        <textarea id="c-form" rows="2" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood">${esc(state.form)}</textarea></div>
      <div class="field"><label>Origin — which people are you from?</label>
        <select id="c-origin">${origins.map(o => `<option value="${esc(o.id)}" ${state.origin === o.id ? "selected" : ""}>${esc(o.name)}${o.homeRegion && o.homeRegion !== "valley" ? " — of the " + esc(String(o.homeRegion).replace(/_/g, " ")) : ""}</option>`).join("")}</select>
        <div class="hint">${esc(org?.description || "")}${org?.whyYouAreHere ? ` <em>${esc(org.whyYouAreHere)}</em>` : ""}</div></div>
      ${(() => { const sc = startingLocationChoices(state.origin); if (!sc.length) return ""; if (!sc.some(c => c.id === state.startingLocation)) state.startingLocation = defaultStart(state.origin);
        return `<div class="field"><label>Starting location <span class="hint" style="text-transform:none">(defaults to your homeland)</span></label>
        <select id="c-startloc">${sc.map(c => `<option value="${esc(c.id)}" ${state.startingLocation === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>
        <div class="hint">${esc((sc.find(c => c.id === state.startingLocation) || sc[0]).why)}</div></div>`; })()}
      <div class="field"><label>Background — what did you do? <span class="hint" style="text-transform:none">(browsable by category; never gated by your people)</span></label>
        <select id="c-bg">${backgroundOptionsHTML(state.background)}</select>
        <div class="hint">${esc(bg?.description || "")}</div></div>
      <div class="field"><label>Attributes — points left: <strong>${left}</strong> (each 1–4)</label>
        ${Object.entries(state.attrs).map(([k, v]) => `
          <div class="point-row">
            <button data-dec="${k}">−</button><span class="pips">${"●".repeat(v)}${"○".repeat(4 - v)}</span><button data-inc="${k}">+</button>
            <span style="text-transform:capitalize">${k}</span>
          </div>`).join("")}</div>
      <button class="btn" id="c-done" ${valid ? "" : "disabled"}>Next: your domains on the great circle</button>
    </div>`);

    document.getElementById("c-name").oninput = e => { state.name = e.target.value; document.getElementById("c-done").disabled = !(state.name.trim() && left === 0); };
    document.getElementById("c-form").oninput = e => { state.form = e.target.value; };
    document.getElementById("c-origin").onchange = e => { state.origin = e.target.value; state.domains = { primary: null, secondary: null, tertiary: null }; state.startingLocation = defaultStart(state.origin); draw(); };
    const slSel = document.getElementById("c-startloc"); if (slSel) slSel.onchange = e => { state.startingLocation = e.target.value; draw(); };
    document.getElementById("c-bg").onchange = e => { state.background = e.target.value; draw(); };
    for (const b of app.querySelectorAll("[data-inc]")) b.onclick = () => { const k = b.dataset.inc; if (state.attrs[k] < 4 && left > 0) state.attrs[k]++; draw(); };
    for (const b of app.querySelectorAll("[data-dec]")) b.onclick = () => { const k = b.dataset.dec; if (state.attrs[k] > 1) state.attrs[k]--; draw(); };
    document.getElementById("c-done").onclick = () => { state.form = document.getElementById("c-form").value.trim(); renderDomainStep(); };
  }

  /** SNG-063 quick-start step 3 (AFTER domains): abilities FILTERED to what the domains permit. */
  function renderAbilityStep() {
    const okAb = Object.values(CONTENT.abilities).filter(a => {
      if ((a.levelReq || 1) > 1) return false;
      const dv = domainAccess(a, a.levelReq || 1, state.domains, CONTENT.traditionIndex);
      return dv.allowed;
    });
    state.abilities = state.abilities.filter(id => okAb.some(a => a.id === id)).slice(0, maxAbilities());
    const byTrad = {};
    for (const a of okAb) { const t = traditionOf(a, CONTENT.traditionIndex) || a.powerSystem || "folk"; (byTrad[t] = byTrad[t] || []).push(a); }
    chrome(`<div class="screen">
      <h2>What have you learned?</h2>
      <p class="hint" style="margin-bottom:10px">Choose <strong>${maxAbilities()}</strong>. Only the crafts your domains open to you are shown — your primary, its kin, your secondary and tertiary, and the Valley's open folk arts. The far pole of what you are isn't here.</p>
      ${Object.keys(byTrad).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(t => `
        <div class="sys-group"><div class="sys-label">${esc(traditionLabel(t))}</div>
        <div class="opt-row">${byTrad[t].map(a => { const r1 = a.tree?.find(x => x.rank === 1); return `<button class="opt ${state.abilities.includes(a.id) ? "selected" : ""}" data-ab="${a.id}" title="${esc((r1 ? "Rank 1 “" + r1.name + "” — CAN: " + r1.grants + " | CANNOT: " + r1.cannot : a.description) + (a.notFor ? " | NOT FOR: " + a.notFor : ""))}">${esc(a.name)}</button>`; }).join("")}</div></div>`).join("") || "<div class='insight'>No level-1 abilities available for your domains — you'll learn as you play.</div>"}
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="ab-back">Back</button>
        <button class="btn" id="ab-done" ${state.abilities.length === maxAbilities() || !okAb.length ? "" : "disabled"}>Next: your companion</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-ab]")) b.onclick = () => {
      const id = b.dataset.ab;
      if (state.abilities.includes(id)) state.abilities = state.abilities.filter(x => x !== id);
      else if (state.abilities.length < maxAbilities()) state.abilities.push(id);
      renderAbilityStep();
    };
    document.getElementById("ab-back").onclick = () => renderDomainStep();
    document.getElementById("ab-done").onclick = () => renderCompanionStep();
  }

  // SNG-059 / SNG-055: pick primary / secondary / tertiary domains on THE GREAT CIRCLE. The ring,
  // neighbours, and antipodes are read from CONTENT.traditionIndex — never hardcoded.
  function renderDomainStep() {
    const idx = CONTENT.traditionIndex;
    if (!idx) { renderAbilityStep(); return; } // no traditions content → skip gracefully
    const order = ringOrder(idx);
    const d = state.domains;
    // SNG-063: origin SEEDS the circle — a pole-people's native tradition pre-fills the primary
    // (the player can Redo to change it); folk origins stay open (no seed).
    const nativeT = (ORIGINS().find(o => o.id === state.origin) || {}).nativeTradition;
    if (!d.primary && nativeT && !isFolkTradition(nativeT, idx) && idx.byId?.[nativeT]) d.primary = nativeT;
    const phase = !d.primary ? "primary" : !d.secondary ? "secondary" : !d.tertiary ? "tertiary" : "done";
    const antiP = d.primary ? antipodeOf(d.primary, idx) : null;
    const antiS = d.secondary ? antipodeOf(d.secondary, idx) : null;
    const closed = new Set([antiP, antiS].filter(Boolean));
    // SNG-125: the SECONDARY must be KIN-ADJACENT to the primary (a concentrated core); the TERTIARY is
    // FREE — anywhere legal, no longer bound to the secondary's neighbours (Erik rulings 1 + 4).
    const kinSet = d.primary ? new Set(kinSecondaryOptions(d.primary, idx)) : new Set();
    const selectable = (t) => {
      if (closed.has(t)) return false;
      if (phase === "primary") return true;
      if (phase === "secondary") return t !== d.primary && kinSet.has(t);
      if (phase === "tertiary") return t !== d.primary && t !== d.secondary;
      return false;
    };
    const svg = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary, closed, selectable,
      centerTop: phase === "done" ? "your domains" : "choose your " + phase,
      centerSub: phase === "secondary" ? "kin to your primary" : phase === "tertiary" ? "free — your wildcard reach" : phase === "done" ? "" : "the opposite pole closes" });
    const slot = (label, t) => `<div class="dom-slot"><span class="dom-slot-label">${label}</span> ${t ? `<strong>${esc(traditionLabel(t))}</strong>` : "<em>—</em>"}</div>`;
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Your place on the Great Circle</h2>
      <p class="hint" style="margin-bottom:8px">Twelve axes, twenty-four peoples — a ring where every craft sits opposite its antithesis. Your <strong>primary</strong> is who you are (all you can master); your <strong>secondary</strong> (<em>kin to your primary</em>) reaches tier III — a concentrated core; your <strong>tertiary</strong> is a <em>free wildcard</em>, reaching anywhere on the ring to tier II. The <strong>opposite pole</strong> of your primary and secondary is closed to you forever — only the great braids cross it.</p>
      ${svg}
      <div class="dom-slots">${slot("Primary", d.primary)}${slot("Secondary", d.secondary)}${slot("Tertiary", d.tertiary)}</div>
      ${closed.size ? `<div class="hint">Closed to you: ${[...closed].map(t => esc(traditionLabel(t))).join(", ")}</div>` : ""}
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="dom-reset">↺ Redo</button>
        <button class="btn" id="dom-done" ${phase === "done" ? "" : "disabled"}>${state.domainReturn === "prologue" ? "Confirm — this is who I am" : "Next: your companion"}</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-dom]")) b.onclick = () => {
      const t = b.dataset.dom;
      if (phase === "primary") d.primary = t;
      else if (phase === "secondary") d.secondary = t;
      else if (phase === "tertiary") d.tertiary = t;
      renderDomainStep();
    };
    document.getElementById("dom-reset").onclick = () => { state.domains = { primary: null, secondary: null, tertiary: null }; renderDomainStep(); };
    // SNG-062: prologue-adjust confirms → finish; SNG-063: quick-start goes to abilities (AFTER domains)
    document.getElementById("dom-done").onclick = () => { if (state.domainReturn === "prologue") { state.domainReturn = null; finishPrologue(); } else renderAbilityStep(); };
  }

  // SNG-059 / SNG-057: choose + name a companion from the authored starting roster.
  function renderCompanionStep() {
    const roster = Object.values(CONTENT.companions || {}).filter(c => c.startingOption);
    if (!roster.length) { renderBioStep(); return; }
    if (!state.companionId) state.companionId = roster[0].id;
    const chosen = roster.find(c => c.id === state.companionId) || roster[0];
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Who walks with you?</h2>
      <p class="hint" style="margin-bottom:10px">A companion is yours from the first step. Pick who — and call them what you like.</p>
      <div class="companion-pick">
        ${roster.map(c => `<button class="companion-card ${c.id === state.companionId ? "selected" : ""}" data-comp="${esc(c.id)}">
          <strong>${esc(c.name)}</strong>
          <span class="companion-role">${esc((c.role || "").split("—").slice(1).join("—").trim() || c.role || "")}</span>
        </button>`).join("")}
      </div>
      <div class="companion-detail">
        <p class="map-details-desc">${esc((chosen.appearance || "").slice(0, 260))}</p>
        <div class="field" style="margin-top:8px"><label>Name them (optional)</label>
          <input id="comp-name" value="${esc(state.companionName)}" placeholder="${esc(chosen.name)}"></div>
      </div>
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="comp-solo">Begin alone</button>
        <button class="btn" id="comp-done">Next: your story</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-comp]")) b.onclick = () => {
      state.companionName = document.getElementById("comp-name").value.trim();
      state.companionId = b.dataset.comp; renderCompanionStep();
    };
    document.getElementById("comp-name").oninput = e => { state.companionName = e.target.value.trim(); };
    document.getElementById("comp-solo").onclick = () => { state.companionId = null; state.companionName = ""; renderBioStep(); };
    document.getElementById("comp-done").onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); renderBioStep(); };
  }

  // SNG-059 / SNG-053: describe the character's physical FORM so the portrait is right on first render.
  function renderFormStep() {
    chrome(`<div class="screen" style="max-width:640px">
      <h2>What do they look like?</h2>
      <p class="hint" style="margin-bottom:10px">Describe their physical form — species, build, features. This LEADS the portrait, so a non-human (an Ent, a construct) renders true from the start. Leave it blank for an ordinary person.</p>
      <div class="field"><textarea id="form-text" rows="3" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood, moss-bearded, eyes like knots of amber">${esc(state.form)}</textarea></div>
      <div style="display:flex; gap:8px; margin-top:8px">
        <button class="btn" id="form-done">Next: your story</button>
      </div>
    </div>`);
    document.getElementById("form-done").onclick = () => { state.form = document.getElementById("form-text").value.trim(); renderBioStep(); };
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
        <button class="btn" id="bio-done">Begin in ${esc(CONTENT.locations?.[state.startingLocation || defaultStart(state.origin)]?.name || "the Valley")}</button>
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
      // SNG-063: origin = which PEOPLE you're from → native tradition (home class) + why you're here
      nativeTradition: (ORIGINS().find(o => o.id === state.origin) || {}).nativeTradition || null,
      whyHere: (ORIGINS().find(o => o.id === state.origin) || {}).whyYouAreHere || null,
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
      currentLocationId: state.startingLocation || defaultStart(state.origin) || CONTENT.startingLocation,
      activeScene: null,
      clock: newClock(),
      // SNG-057: the chosen companion (string id — recruitment/backfill shape) + the player's name
      companions: state.companionId ? [state.companionId] : [],
      companionNames: state.companionId && state.companionName ? { [state.companionId]: state.companionName } : {},
      quests: [],
      npcRegistry: {},
      placeMemory: {},
      worldState: initWorldState(1),
      // SNG-055: the domains chosen on the great circle (what this character can ever learn)
      domains: (state.domains && state.domains.primary) ? { ...state.domains } : null,
      // SNG-053: the physical form leads the portrait
      form: state.form || undefined,
      bio: bio && Object.values(bio).some(v => v) ? bio : null
    };
    // SNG-063: nobody is in the Valley by accident — fold the origin's whyYouAreHere into the bio
    // so the GM has it as grounding (origin = people, starting location = Valley).
    if (character.whyHere) {
      character.bio = character.bio || {};
      if (!character.bio.motivation) character.bio.motivation = character.whyHere;
      else if (!/(came|left|here)/i.test(character.bio.story || "")) character.bio.story = ((character.bio.story || "") + " " + character.whyHere).trim();
    }
    ensureSubAttributes(character);
    ensureCodex(character);
    ensureCharacterStyle(character); // SNG-BATCH-7: this character earns its OWN play-style
    character.grantsVersion = 1; // born after banked growth — no retro grant owed
    applyNativeGrants(character, CONTENT.rules); // SNG-101b: granted their primary tradition's basics by right of being what they are
    { const g = backgroundById(character.background)?.grantsAptitudes; if (g?.length) grantAptitudes(character, g, CONTENT.rules.playerAptitudes, CONTENT.rules); } // SNG-113: lineage aptitude(s)
    character.nativeGrantsVersion = 1; // born with the starter kit — no retro native-grant owed
    character.reconcileVersion = topReconcileVersion("character"); // born current — no migration owed (no aggregate seed)
    character.pendingSubPoints = 2; // shape your edge from day one — specialize two subs
    if (!profile.charactersPlayed.includes(character.id)) profile.charactersPlayed.push(character.id);
    // SNG-068A: carry the prologue ability-reconcile note into the first scene so nothing is silent
    if (state._prologueReconcileNote) character._creationAside = state._prologueReconcileNote;
    ensureGallery(character);
    ensureCharacterPortrait(character); // SNG-035: born seeing the character (no-op unless art=generate)
    // SNG-133: every character is born with a PRIMARY personal arc from the story they wrote. Seed a light
    // fallback SYNCHRONOUSLY (never zero, no latency), then enrich it via the model in the background so
    // creation isn't blocked; SNG-132's runtime surfaces + paces it (bound to this character).
    character.personalArc = fallbackPersonalArc(character);
    character._creationAside = [character._creationAside, `✦ Your story has become a thread here: *${character.personalArc.name}*.`].filter(Boolean).join(" ");
    saveCharacter(character); saveProfile(profile);
    enrichPersonalArc(character); // best-effort, non-blocking (no-op without an API key)
    enterPlay();
  }

  // ---------- SNG-062: THE PROLOGUE — creation as a played scene ----------

  const PRO = () => CONTENT.prologue; // the authored prologue content (or null)
  const opening = () => (PRO()?.openings || []).find(o => o.id === state.prologue.openingId);

  /** The door: play the opening (recommended) or the quick-start form (express lane). */
  function renderCreateDoor() {
    if (!PRO()?.openings?.length) { draw(); return; } // no prologue content → straight to the form
    chrome(`<div class="screen" style="max-width:620px">
      <h2>Begin</h2>
      <p class="hint" style="margin-bottom:16px">Three ways to make a character. Say who you want to be and the game shows you where that lands. Play an opening and the world tells you who you turned out to be. Or build one yourself, if you already know.</p>
      <div class="create-door">
        <button class="door-card" id="door-describe">
          <strong>✎ Describe yourself</strong>
          <span>Say who you want to be, in your own words — "a girl who talks to animals and cannot lie." The game shows you where that lands on the great circle, why, and what it costs. Adjust anything. The gentlest door.</span>
        </button>
        <button class="door-card" id="door-play">
          <strong>▶ Play the opening</strong>
          <span>Pick a name and a look, then live a short scene. Your skills, your companion, and your place on the great circle come from what you actually do. You'll learn the game by playing it.</span>
        </button>
        <button class="door-card" id="door-form">
          <strong>⚡ Quick start</strong>
          <span>Build it yourself — name, form, domains on the circle, starting abilities, companion. The express lane for when you already know who you are. Same character either way.</span>
        </button>
      </div>
    </div>`);
    document.getElementById("door-describe").onclick = () => renderDescribeDoor();
    document.getElementById("door-play").onclick = () => renderPrologueIntro();
    document.getElementById("door-form").onclick = () => draw();
  }

  // ---------- SNG-086: THE THIRD DOOR — "describe yourself" → a placement on the great circle ----------

  /** The model proposes poles + prose; here the ENGINE validates every id against the ring and
   *  enforces the geometry. SNG-125: secondary must be KIN-ADJACENT to the primary (a concentrated core);
   *  tertiary is FREE — barred only from the primary/secondary and the two closed poles, no longer bound
   *  to the secondary's neighbours (Erik rulings 1 + 4). Design Law 1 — the model never owns ring geometry. */
  function sanitizeSuggestedDomains(sug, idx) {
    const ok = id => id && idx.byId?.[id] && !isFolkTradition(id, idx);
    let primary = ok(sug?.primary?.traditionId) ? sug.primary.traditionId : null;
    let secondary = ok(sug?.secondary?.traditionId) ? sug.secondary.traditionId : null;
    let tertiary = ok(sug?.tertiary?.traditionId) ? sug.tertiary.traditionId : null;
    const antiP = primary ? antipodeOf(primary, idx) : null;
    // SNG-125: an illegal (non-kin) secondary is snapped to the heaviest legal kin option, never dropped to
    // nothing when the model was close — keeps the third-door build complete and legal.
    if (secondary && (secondary === primary || secondary === antiP || !isKinAdjacent(secondary, primary, idx))) {
      secondary = primary ? (kinSecondaryOptions(primary, idx)[0] || null) : null;
    }
    const antiS = secondary ? antipodeOf(secondary, idx) : null;
    if (tertiary && (tertiary === primary || tertiary === secondary || tertiary === antiP || tertiary === antiS)) tertiary = null;
    return { primary, secondary, tertiary };
  }

  function renderDescribeDoor(err = "") {
    const idx = CONTENT.traditionIndex;
    if (!idx) { draw(); return; } // no ring content → fall back to the quick-start form
    chrome(`<div class="screen" style="max-width:620px">
      <h2>Describe yourself</h2>
      <p class="hint" style="margin-bottom:12px">Say who you want to be — species or look, temperament, what you're good at, what you care about. Whole sentences or a scatter of words, either works. The game reads it and shows you where you land on the great circle, and what it costs. You can change everything after.</p>
      ${err ? `<p class="hint" style="color:var(--warn,#c88); margin-bottom:10px">${esc(err)}</p>` : ""}
      <div class="field"><label>Name</label><input id="d-name" value="${esc(state.name)}" placeholder="their name"></div>
      <div class="field"><label>Who are you?</label>
        <textarea id="d-desc" rows="5" style="width:100%" placeholder="e.g. a girl who talks to animals and cannot lie&#10;or: a necromancer, slight of frame, very smart, likes order, a romantic and a hunter">${esc(state._describeText || "")}</textarea></div>
      <div style="display:flex; gap:8px; margin-top:10px">
        <button class="btn secondary" id="d-back">Back</button>
        <button class="btn" id="d-go">✦ Show me where I land</button>
      </div>
      <div class="hint" id="d-status" style="margin-top:10px"></div>
    </div>`);
    document.getElementById("d-name").oninput = e => { state.name = e.target.value; };
    document.getElementById("d-desc").oninput = e => { state._describeText = e.target.value; };
    document.getElementById("d-back").onclick = () => renderCreateDoor();
    document.getElementById("d-go").onclick = async () => {
      state.name = document.getElementById("d-name").value.trim();
      state._describeText = document.getElementById("d-desc").value.trim();
      if (!state._describeText) { renderDescribeDoor("Tell me a little about who you want to be first."); return; }
      const status = document.getElementById("d-status");
      const btn = document.getElementById("d-go"); btn.disabled = true;
      status.textContent = "Reading the circle for who you are…";
      // build compact catalogs so the model can only choose real ids (Design Law 1)
      const nm = t => traditionLabel(t);
      const ring = ringOrder(idx).map(t => { const tr = idx.byId[t];
        return `${t} · ${tr.name} · ${tr.pole || "?"} (${tr.axis || "?"}) · ${tr.craft || "?"} · antipode:${antipodeOf(t, idx) || "?"} · neighbours:${neighborsOf(t, idx).join(",")}`; }).join("\n");
      const folk = (CONTENT.traditions?.folkTraditions || []).map(f => `${f.name || f.traditionId} — ${f.aesthetic || "a valley folk-craft, open to all"}`).join("\n") || "(none)";
      const bgs = (CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback()).map(b => `${b.id} · ${b.name}`).join("\n");
      const comps = Object.values(CONTENT.companions || {}).filter(c => c.startingOption).map(c => `${c.id} · ${c.name} · ${(c.role || "").slice(0, 60)}`).join("\n") || "(none)";
      try {
        const sug = await suggestBuild({ description: state._describeText, ring, folk, backgrounds: bgs, companions: comps });
        state._suggestion = sug;
        renderDescribeReveal();
      } catch (e) {
        btn.disabled = false;
        status.textContent = "The reading slipped (" + String(e.message || e).slice(0, 70) + "). Try again, or use Quick start / Play the opening.";
      }
    };
  }

  function renderDescribeReveal() {
    const idx = CONTENT.traditionIndex;
    const sug = state._suggestion || {};
    const d = sanitizeSuggestedDomains(sug, idx);
    state.domains = d;
    // carry the model's non-domain suggestions onto the build (validated where they gate anything)
    const bgs = CONTENT.backgrounds?.length ? CONTENT.backgrounds : backgroundsFallback();
    if (sug.background?.id && bgs.some(b => b.id === sug.background.id)) state.background = sug.background.id;
    const origins = ORIGINS();
    if (sug.origin?.id && origins.some(o => o.id === sug.origin.id)) { state.origin = sug.origin.id; state.startingLocation = defaultStart(state.origin); }
    if (typeof sug.form === "string" && sug.form.trim()) state.form = sug.form.trim();
    const roster = Object.values(CONTENT.companions || {}).filter(c => c.startingOption);
    if (sug.companion?.id && roster.some(c => c.id === sug.companion.id)) state.companionId = sug.companion.id;

    const antiP = d.primary ? antipodeOf(d.primary, idx) : null;
    const closed = new Set([antiP, d.secondary && antipodeOf(d.secondary, idx)].filter(Boolean));
    const circle = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary, closed,
      selectable: () => false, centerTop: "where you land", centerSub: d.primary ? traditionLabel(d.primary) : "" });
    // one slot card: people · why · what it CLOSES (engine-computed antipode) · the model's cost prose
    const slotCard = (label, slot, modelSlot) => {
      if (!slot) return "";
      const anti = antipodeOf(slot, idx);
      return `<div class="cs-block" style="margin:6px 0">
        <div><span class="dom-slot-label">${label}</span> — <strong>${esc(traditionLabel(slot))}</strong></div>
        ${modelSlot?.why ? `<div class="hint" style="margin-top:4px">${esc(modelSlot.why)}</div>` : ""}
        <div class="hint" style="margin-top:4px">Closes <strong>${esc(traditionLabel(anti))}</strong>${modelSlot?.cost ? ` — ${esc(modelSlot.cost)}` : "."}</div>
      </div>`;
    };
    const folk = Array.isArray(sug.folk) ? sug.folk.filter(f => f?.name) : [];
    const notDom = Array.isArray(sug.notDomains) ? sug.notDomains.filter(n => n?.label) : [];
    const comp = state.companionId ? roster.find(c => c.id === state.companionId) : null;
    chrome(`<div class="screen" style="max-width:660px">
      <h2>Where you land on the Great Circle</h2>
      <p class="hint" style="margin-bottom:8px">This is a suggestion, not a sentence — read the reasons and the costs, then keep it or adjust anything.</p>
      ${circle}
      ${d.primary ? slotCard("Primary", d.primary, sug.primary) : `<div class="cs-block"><div class="hint">The reading couldn't place a primary from that — try more detail, or pick on the circle.</div></div>`}
      ${slotCard("Secondary", d.secondary, sug.secondary)}
      ${slotCard("Tertiary", d.tertiary, sug.tertiary)}
      ${antiP ? `<div class="hint" style="margin:8px 0"><strong>⛔ ${esc(traditionLabel(antiP))} is closed to you forever</strong> — the far pole of what you are. Only a cross-pole braid, taught by no one, ever crosses it.</div>` : ""}
      <div class="cs-block" style="margin:6px 0">
        ${sug.origin?.why ? `<div><span class="dom-slot-label">Born</span> — <strong>${esc((origins.find(o => o.id === state.origin) || {}).name || state.origin)}</strong> <span class="hint">${esc(sug.origin.why)}</span></div>` : ""}
        ${sug.background?.why ? `<div style="margin-top:4px"><span class="dom-slot-label">Background</span> — <strong>${esc(backgroundById(state.background)?.name || state.background)}</strong> <span class="hint">${esc(sug.background.why)}</span></div>` : ""}
        ${state.form ? `<div style="margin-top:4px"><span class="dom-slot-label">Form</span> <span class="hint">${esc(state.form)}</span></div>` : ""}
        ${comp ? `<div style="margin-top:4px"><span class="dom-slot-label">Companion</span> — <strong>${esc(comp.name)}</strong> ${sug.companion?.why ? `<span class="hint">${esc(sug.companion.why)}</span>` : ""}</div>` : ""}
      </div>
      ${folk.length ? `<div class="hint" style="margin:6px 0">${folk.map(f => `<div>✓ <strong>${esc(f.name)}</strong> — ${esc(f.why || "free; a folk craft, open to all")}</div>`).join("")}</div>` : ""}
      ${notDom.length ? `<div class="hint" style="margin:6px 0">${notDom.map(n => `<div>· <strong>${esc(n.label)}</strong> isn't a domain — ${esc(n.why || "it's how you play, not a pole")}</div>`).join("")}</div>` : ""}
      <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap">
        <button class="btn secondary" id="dr-rewrite">← Rewrite</button>
        <button class="btn secondary" id="dr-adjust">Adjust on the circle</button>
        <button class="btn" id="dr-confirm" ${d.primary ? "" : "disabled"}>Yes — this is who I am</button>
      </div>
    </div>`);
    document.getElementById("dr-rewrite").onclick = () => renderDescribeDoor();
    document.getElementById("dr-adjust").onclick = () => { state.domainReturn = null; renderDomainStep(); };
    document.getElementById("dr-confirm").onclick = () => renderAbilityStep();
  }

  /** Prologue step 1 (SNG-063 order): name → form → origin (light seed — your people). Domains and
   *  skills come LATER, from play. */
  function renderPrologueIntro() {
    const origins = ORIGINS();
    if (!origins.some(o => o.id === state.origin)) state.origin = origins[0]?.id || "valleyfolk";
    const org = origins.find(o => o.id === state.origin);
    chrome(`<div class="screen" style="max-width:600px">
      <h2>Before the scene</h2>
      <p class="hint" style="margin-bottom:12px">A few things, then we begin. Who you become on the circle, and what you can do, you'll find out by playing.</p>
      <div class="field"><label>Name</label><input id="p-name" value="${esc(state.name)}"></div>
      <div class="field"><label>What do they look like? <span class="hint" style="text-transform:none">(form/species — leads the portrait; blank = an ordinary person)</span></label>
        <textarea id="p-form" rows="2" style="width:100%" placeholder="e.g. a towering treefolk of bark and heartwood, moss-bearded">${esc(state.form)}</textarea></div>
      <div class="field"><label>Which people are you from? <span class="hint" style="text-transform:none">(origin is who your people are)</span></label>
        <select id="p-origin">${origins.map(o => `<option value="${esc(o.id)}" ${state.origin === o.id ? "selected" : ""}>${esc(o.name)}${o.homeRegion && o.homeRegion !== "valley" ? " — of the " + esc(String(o.homeRegion).replace(/_/g, " ")) : ""}</option>`).join("")}</select>
        <div class="hint">${esc(org?.whyYouAreHere || org?.description || "")}</div></div>
      ${(() => { const sc = startingLocationChoices(state.origin); if (!sc.length) return ""; if (!sc.some(c => c.id === state.startingLocation)) state.startingLocation = defaultStart(state.origin);
        return `<div class="field"><label>Where do you begin? <span class="hint" style="text-transform:none">(defaults to your homeland)</span></label>
        <select id="p-startloc">${sc.map(c => `<option value="${esc(c.id)}" ${state.startingLocation === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select>
        <div class="hint">${esc((sc.find(c => c.id === state.startingLocation) || sc[0]).why)}</div></div>`; })()}
      <div style="display:flex; gap:8px; margin-top:8px">
        <button class="btn secondary" id="p-back">Back</button>
        <button class="btn" id="p-go" ${state.name.trim() ? "" : "disabled"}>Choose an opening</button>
      </div>
    </div>`);
    const nm = document.getElementById("p-name");
    nm.oninput = () => { state.name = nm.value; document.getElementById("p-go").disabled = !state.name.trim(); };
    document.getElementById("p-form").oninput = e => { state.form = e.target.value; };
    document.getElementById("p-origin").onchange = e => { state.origin = e.target.value; state.startingLocation = defaultStart(state.origin); renderPrologueIntro(); };
    const pSl = document.getElementById("p-startloc"); if (pSl) pSl.onchange = e => { state.startingLocation = e.target.value; renderPrologueIntro(); };
    document.getElementById("p-back").onclick = () => renderCreateDoor();
    document.getElementById("p-go").onclick = () => { state.name = nm.value.trim(); state.form = document.getElementById("p-form").value.trim(); renderPrologueOpening(); };
  }

  /** Prologue step 2: choose which opening to play (or let the valley pick). */
  function renderPrologueOpening() {
    const ops = PRO().openings;
    chrome(`<div class="screen" style="max-width:640px">
      <h2>${esc(state.name)}, where does it find you?</h2>
      <p class="hint" style="margin-bottom:12px">Each opening is a different kind of trouble. There is no wrong one — every road makes a whole person.</p>
      ${ops.map(o => `<button class="opening-card" data-open="${esc(o.id)}">
        <strong>${esc(o.name)}</strong> <span class="opening-tone">${esc(o.tone)}</span>
        <span class="opening-hook">${esc(o.hook)}</span></button>`).join("")}
      <button class="btn secondary" id="open-surprise" style="margin-top:10px">Surprise me</button>
    </div>`);
    const start = (id) => { state.prologue = { openingId: id, step: 0, tags: {}, granted: [], reasons: [] }; renderPrologueProblem(); };
    for (const b of app.querySelectorAll("[data-open]")) b.onclick = () => start(b.dataset.open);
    document.getElementById("open-surprise").onclick = () => start(ops[Math.floor(Math.random() * ops.length)].id);
  }

  /** Prologue step 3: play the current problem — pick a path, see the outcome, accrue. */
  function renderPrologueProblem(outcomeShown = null) {
    const o = opening();
    const probs = o.problems || [];
    const i = state.prologue.step;
    if (i >= probs.length) { renderPrologueCompanion(); return; }
    const p = probs[i];
    chrome(`<div class="screen" style="max-width:640px">
      <div class="prologue-progress">${probs.map((_, k) => `<span class="${k < i ? "done" : k === i ? "now" : ""}"></span>`).join("")}</div>
      <h2>${esc(o.name)}</h2>
      ${i === 0 && !outcomeShown ? `<p class="prologue-hook">${esc(o.hook)}</p>` : ""}
      ${outcomeShown ? `<div class="prologue-outcome"><p>${esc(outcomeShown)}</p><button class="btn" id="p-continue">Go on</button></div>` : `
        <p class="prologue-situation">${esc(p.situation)}</p>
        <div class="prologue-paths">
          ${(p.paths || []).map((path, pi) => `<button class="prologue-path" data-path="${pi}">${esc(path.label)}</button>`).join("")}
        </div>`}
    </div>`);
    if (outcomeShown) { document.getElementById("p-continue").onclick = () => { state.prologue.step++; renderPrologueProblem(); }; return; }
    for (const b of app.querySelectorAll("[data-path]")) b.onclick = () => {
      const path = p.paths[+b.dataset.path];
      if (path.tradition) state.prologue.tags[path.tradition] = (state.prologue.tags[path.tradition] || 0) + 1;
      if (path.grantsAbility && !state.prologue.granted.includes(path.grantsAbility)) state.prologue.granted.push(path.grantsAbility);
      state.prologue.reasons.push({ label: path.label, outcome: path.outcome, tradition: path.tradition });
      renderPrologueProblem(path.outcome || "It is done.");
    };
  }

  /** Prologue step 4: the companion arrives IN the scene — choose + name who stays. */
  function renderPrologueCompanion() {
    const o = opening();
    const beat = o.companionBeat || {};
    const offered = (beat.offer || []).map(id => CONTENT.companions[id]).filter(c => c && c.startingOption);
    if (!offered.length) { renderPrologueReveal(); return; }
    if (!state.companionId) state.companionId = offered[0].id;
    const chosen = offered.find(c => c.id === state.companionId) || offered[0];
    const arrival = beat.arrivals?.[chosen.id] || chosen.appearance || "";
    chrome(`<div class="screen" style="max-width:640px">
      <h2>Someone stayed</h2>
      <p class="prologue-situation">${esc(beat.situation || "When it was over, someone was still there.")}</p>
      <div class="companion-pick" style="margin-top:10px">
        ${offered.map(c => `<button class="companion-card ${c.id === state.companionId ? "selected" : ""}" data-comp="${esc(c.id)}"><strong>${esc(c.name)}</strong></button>`).join("")}
      </div>
      <div class="companion-detail"><p class="map-details-desc">${esc(arrival)}</p>
        <div class="field" style="margin-top:8px"><label>Name them (optional)</label><input id="comp-name" value="${esc(state.companionName)}" placeholder="${esc(chosen.name)}"></div></div>
      <div style="display:flex; gap:8px; margin-top:12px">
        <button class="btn secondary" id="comp-solo">No one stays</button>
        <button class="btn" id="comp-done">This one</button>
      </div>
    </div>`);
    for (const b of app.querySelectorAll("[data-comp]")) b.onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); state.companionId = b.dataset.comp; renderPrologueCompanion(); };
    document.getElementById("comp-name").oninput = e => { state.companionName = e.target.value.trim(); };
    document.getElementById("comp-solo").onclick = () => { state.companionId = null; state.companionName = ""; renderPrologueReveal(); };
    document.getElementById("comp-done").onclick = () => { state.companionName = document.getElementById("comp-name").value.trim(); renderPrologueReveal(); };
  }

  /** Prologue step 5: domains CRYSTALLIZE from how they played — shown on the circle, with the
   *  reasons in their own actions, then CONFIRMED (mandatory). The player keeps the last word. */
  function renderPrologueReveal(adjustPhase = null) {
    const idx = CONTENT.traditionIndex;
    if (!idx) { finishPrologue(); return; }
    if (!state.domains.primary) state.domains = crystallizeDomains(state.prologue.tags, idx) || { primary: null, secondary: null, tertiary: null };
    const d = state.domains;
    // ADJUST mode reuses the pickable circle (re-run the domain picker seeded from the crystallized result)
    if (adjustPhase) { renderDomainStep(); return; }
    const nm = t => t ? traditionLabel(t) : "—";
    const reasons = state.prologue.reasons.filter(r => r.tradition).slice(-4);
    const circle = domainCircleSVG(idx, { primary: d.primary, secondary: d.secondary, tertiary: d.tertiary,
      closed: new Set([d.primary && antipodeOf(d.primary, idx), d.secondary && antipodeOf(d.secondary, idx)].filter(Boolean)),
      selectable: () => false, centerTop: "who you are", centerSub: nm(d.primary) });
    chrome(`<div class="screen" style="max-width:640px">
      <h2>This is who you turned out to be</h2>
      ${circle}
      <div class="dom-slots"><div class="dom-slot"><span class="dom-slot-label">Primary</span> <strong>${esc(nm(d.primary))}</strong></div>
        <div class="dom-slot"><span class="dom-slot-label">Secondary</span> <strong>${esc(nm(d.secondary))}</strong></div>
        <div class="dom-slot"><span class="dom-slot-label">Tertiary</span> <strong>${esc(nm(d.tertiary))}</strong></div></div>
      <div class="prologue-reasons"><p class="hint">Because, in the scene:</p>
        ${reasons.map(r => `<div class="prologue-reason">— ${esc(r.label)}</div>`).join("")}</div>
      <p class="hint" style="margin-top:8px">The far pole of what you are is closed to you — only the great braids cross it. Is that who you are? You may adjust.</p>
      <div class="field" style="margin-top:12px"><label>And what did you DO before this? <span class="hint" style="text-transform:none">(your background — you choose; the scene doesn't decide it for you)</span></label>
        <select id="reveal-bg">${backgroundOptionsHTML(state.background)}</select>
        <div class="hint" id="reveal-bg-hint">${esc(backgroundById(state.background)?.description || "")}</div></div>
      <div style="display:flex; gap:8px; margin-top:10px">
        <button class="btn secondary" id="reveal-adjust">Adjust on the circle</button>
        <button class="btn" id="reveal-confirm">Yes — this is who I am</button>
      </div>
    </div>`);
    document.getElementById("reveal-adjust").onclick = () => { state.domainReturn = "prologue"; state.domains = { primary: null, secondary: null, tertiary: null }; renderDomainStep(); };
    const rbg = document.getElementById("reveal-bg");
    if (rbg) rbg.onchange = e => { state.background = e.target.value; const h = document.getElementById("reveal-bg-hint"); if (h) h.textContent = backgroundById(state.background)?.description || ""; };
    document.getElementById("reveal-confirm").onclick = () => { if (rbg) state.background = rbg.value; finishPrologue(); };
  }

  /** Out the far side: a complete character. SNG-068A: abilities are RECONCILED against the
   *  CONFIRMED domains (not the ones the game guessed). The prologue-earned abilities are kept —
   *  "you did this, so you know this" — but any that fall outside the confirmed domains are
   *  GRANDFATHERED explicitly and the player is told; and the character is granted at least one
   *  ability from their CONFIRMED PRIMARY (a wright must know something wright). */
  function finishPrologue() {
    const { abilities, grantedFromPrimary, grandfathered } = reconcileStartingAbilities(
      state.prologue.granted || [], state.domains, CONTENT.abilities, CONTENT.traditionIndex);
    state.abilities = abilities;
    // a light bio seeded from the opening so the GM has grounding
    const o = opening();
    let story = o ? `Their first day in the world was ${o.name.toLowerCase()} — ${state.prologue.reasons.map(r => r.label.toLowerCase().replace(/\.$/, "")).slice(0, 2).join("; ")}.` : "";
    if (grandfathered.length) story += ` They did things in that first day their people would not have taught them — ${grandfathered.map(id => CONTENT.abilities[id].name).join(", ")} stay with them, earned outside their craft.`;
    const bio = (o || grandfathered.length) ? { motivation: o?.hook || null, story: story.trim() } : null;
    // tell the player what was reconciled, so nothing is silently changed (Law 9)
    const notes = [];
    if (grantedFromPrimary) notes.push(`your people's craft is yours: you begin knowing ${CONTENT.abilities[grantedFromPrimary].name}`);
    if (grandfathered.length) notes.push(`what you did in the fire stays with you, though it is not your people's craft: ${grandfathered.map(id => CONTENT.abilities[id].name).join(", ")}`);
    state._prologueReconcileNote = notes.length ? notes.join("; ") + "." : null;
    finish(bio);
  }

  renderCreateDoor();
}

// ---------- play ----------

async function enterPlay() {
  sceneTurns = [];
  sceneState = null;
  flushFeedbackQueue(); // SNG-066: send any feedback captured while sync was off
  hydrateGeneratedIntoContent(character); // SNG-BATCH-9: make this character's grown world live + revisitable
  pruneEmptyGalleryTiles(character); // SNG-136: drop any failed-gen blank tiles
  ensureBondPortraits(character);    // SNG-136: retro backfill — an already-devoted bond (Pell) gets its portrait once
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
  // SNG-068A: the creation reconcile note (abilities matched to your CONFIRMED people) — say it once.
  if (character._creationAside) {
    backfillAside = backfillAside ? character._creationAside + "\n\n" + backfillAside : character._creationAside;
    delete character._creationAside;
    saveCharacter(character);
  }
  if (character.activeScene?.turns?.length) {
    sceneTurns = character.activeScene.turns;
    sceneState = character.activeScene.sceneState || null;
    renderPlay(character.activeScene.lastTurn, { resumed: true, newsFlash: news, aside: backfillAside });
  } else {
    startScene(undefined, news, backfillAside);
  }
  // SNG-098 C: a skill-battle in progress resumes into the contest panel (never stranded mid-fight on reload).
  if (character.activeEncounter?.state?.mode === "skill_battle") renderSkillBattle();
}

async function startScene(prompt = "(Scene opening — set the scene where the character currently is and present the situation.)", news = [], aside = null) {
  gambitHintDismissed = false; // SNG-031: a new scene may be plan-apt again
  sceneGenCount = 0;           // SNG-BATCH-9: fresh generation budget each scene
  sceneArtCount = 0;           // SNG-035: fresh moment-art budget each scene
  sceneEncounterFired = false; // SNG-075: one narrative encounter per scene, reset here
  quietTurns = 0; pressureStreak = 0; // SNG-080: a fresh scene starts the idle count over
  if (news.length) prompt += ` (Since the character last played, the world moved: ${news.map(n => n.text).join(" / ")} — let the scene reflect what applies here.)`;
  renderPlay(null, { thinking: "The valley takes shape…", newsFlash: news, aside });
  const result = await runGM({ resolution: null, playerInput: prompt });
  if (result) renderPlay(result.turn, { degraded: result.degraded, newsFlash: news, aside });
}

/** ability-arch v2: the deepen affordance is GONE — depth is earned, not bought. This returns the
 *  progress line shown wherever a rank-up button used to be. Rank 1 → shows uses toward rank 2 (which
 *  lands automatically); rank 2 → mastery awaits a defining moment (GM); rank 3 → mastered. */
function rankProgress(character, abId) {
  const rules = CONTENT.rules;
  const owned = (character.abilities || []).find(a => a.abilityId === abId);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;
  if (!owned) return { text: "", ripe: false };
  if (owned.level >= maxRank) return { text: "✓ mastered — rank 3", ripe: false };
  const uses = character.practice?.uses?.[abId] || 0;
  if (owned.level === 1) {
    const need = rules.practice?.useRankThreshold?.["2"] ?? 8;
    return { text: `rank 1 · practiced ${Math.min(uses, need)}/${need} → rank 2 lands through use`, ripe: false, uses, need };
  }
  // rank 2 → mastery is a defining moment (GM), gated on practice + rank3Min
  const need = rules.practice?.useRankThreshold?.["3"] ?? 16;
  const practiced = uses >= need;
  const gateOk = meetsRank3Gate(character, abId, CONTENT.attributeGates).ok;
  const ripe = practiced && gateOk;
  const text = ripe ? "rank 2 · ripe for a defining moment (the GM marks mastery when a beat earns it)"
    : !practiced ? `rank 2 · practiced ${Math.min(uses, need)}/${need} toward mastery`
    : `rank 2 · needs ${gateFor(abId, CONTENT.attributeGates)?.subAttribute || "attribute"} ${gateFor(abId, CONTENT.attributeGates)?.rank3Min || ""} for mastery`;
  return { text, ripe, uses, need };
}

/** ability-arch v2: owned rank-2 crafts that are practiced enough AND past their rank-3 attribute gate
 *  and the level bar — i.e. a GM `markDefiningMoment` would land. Named for the GM's RIPE FOR MASTERY
 *  block so it only narrates a breakthrough the engine will honor. Null when nothing is ripe. */
function masteryReadyForGM() {
  const rules = CONTENT.rules;
  const req3 = rules.leveling?.rankLevelReq?.["3"] ?? 1;
  const names = [];
  for (const owned of character.abilities || []) {
    if (owned.level !== 2) continue;
    if (!practiceRankReady(character, owned.abilityId, rules)) continue;      // uses ≥ rank-3 threshold
    if ((character.level || 1) < req3) continue;
    if (!meetsRank3Gate(character, owned.abilityId, CONTENT.attributeGates).ok) continue;
    const ab = fullCatalog()[owned.abilityId];
    if (ab) names.push(`${ab.name} (${owned.abilityId})`);
  }
  return names.length ? names.join("; ") : null;
}

async function runGM({ resolution, playerInput, exactWords, itemAdvance }) {
  busy = true;
  // SNG-075: an encounter the narrative-time roll turned up last beat is WOVEN into this turn.
  const weave = pendingWeave; pendingWeave = null;
  const encounterWeaveDetail = weave ? (
    `An encounter is occurring — weave it INTO the scene now, as part of what is happening (no aside, no genre-break): ${weave.seed}` +
    (weave.perilous ? ` This could turn dangerous — you MUST present a way to decline, flee, or avoid it as a clear choice BEFORE any engagement. Never narrate the character as already fighting or already harmed.` : ` Let it be a small, real thing on the road${weave.flavor && /benef|benign|beaut/.test(weave.flavor) ? " — a grace, not a threat" : ""}.`) +
    (weave.loreTier === "precursor-glimpse" ? ` This touches the Precursor — glimpsed, never explained.` : ``)
  ) : null;
  const worldPressureDetail = pendingPressure; pendingPressure = null; // SNG-080: a quiet-turn push
  const substrateDetail = pendingSubstrateNote; pendingSubstrateNote = null; // SNG-090: lattice thin/crowded here
  // Romance: on a flirtatious/romantic intent this turn, pull the craft-guidance doc so the GM narrates
  // the beat well at the player's rating. Rides the intent tags parseIntent already emits — no extra call.
  const romanceGuidanceDetail = ((resolution?.action?.intentTags || []).some(t => /^(romantic|flirt)$/i.test(String(t))) && CONTENT.romanceGuidance?.text) ? CONTENT.romanceGuidance.text : null;
  if (romanceGuidanceDetail) autoVerifyLeg("romance-flirt", "a flirtatious action was tagged romantic and the romance guidance loaded in play — the one live-model surface"); // ROMANCE leg auto-detect (dev-only)
  const masteryDetail = masteryReadyForGM(); // ability-arch v2: owned rank-2 crafts ripe for a defining moment
  const anomalyDetail = anomaliesForGM(detectAnomalies(character, { rules: CONTENT.rules })); // SNG-137: surface likely errors so the GM can repair them
  // SNG-122: if the player's action this turn is a travel intent, force the GM to emit moveTo to the named
  // destination (+ enumerate reachable known places so its target resolves). Fixes the CAUSE — the deferred
  // SNG-117 no-moveTo boundary that blocked normal in-fiction travel.
  const travelIntent = travelIntentOf(resolution?.action);
  const travelDirective = travelIntent ? buildTravelDirective(travelIntent) : null;
  const location = hereNow();
  // SNG-100b: accrue region presence — a light per-turn accumulator of time spent among a people, so the
  // standing bar can ask "have you genuinely stood here" (region-standing gate for promotion/acquisition).
  if (location?.regionId) { character.regionsKnown = character.regionsKnown || {}; character.regionsKnown[location.regionId] = (character.regionsKnown[location.regionId] || 0) + 1; }
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
    structuredQuestsDetail: structuredQuestsForGM(character, { npcs: CONTENT.npcs }),
    sceneState,
    npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) }),
    placeMemoryDetail: placeMemoryForGM(character, character.currentLocationId),
    newsDetail: newsForGM(character),
    abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks, CONTENT.rules),
    codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: (character.quests || []).filter(q => q.status === "active").map(q => q.title) }),
    factsDetail: factsForGM(character),
    evolvedItemsDetail: evolvedItemsForGM(character, CONTENT.items),
    itemAdvance: (itemAdvance || []).map(a => `${a.itemName} has woken to Stage ${a.stage} "${a.stageName}": ${a.narrationHints}${a.grant ? ` (${a.grant})` : ""}`).join("; ") || null,
    opLossNote: character.opLossPending ? "The previous turn's structured updates failed to apply. Restate NOW, as ops, any quest/npc/place/codex/FACT updates that occurred last beat — INCLUDING any name reveal (revealName) or established fact the fiction set. The narration advanced; the state did not." : null,
    emergenceDetail: emergenceNoticeForGM(character, CONTENT.emergence, CONTENT.rules),
    perilNote: (character.precursorAxes || []).length ? `Precursor use has pushed the character's own vector past ±${CONTENT.rules.precursor?.bandNotice ?? 0.4} on: ${character.precursorAxes.join(", ")}. They are being changed by what they wield — let it show.` : null,
    encounterDetail: resolution?.encounterReceipt || (activeEnc() ? encounterReceiptForGM(activeEnc().state, activeEnc().def, null, null) : null),
    encounterWeaveDetail, // SNG-075: a narrative-time encounter to weave into THIS turn's fiction
    worldPressureDetail,  // SNG-080: after quiet turns, a directive to make the world ACT
    substrateDetail,      // SNG-090: the lattice density is thin/crowding the craft here
    romanceGuidanceDetail, // romance: pulled craft guidance on a flirtatious/romantic beat
    masteryDetail,        // ability-arch v2: rank-2 crafts ripe for a GM-marked defining moment
    anomalyDetail,        // SNG-137: POSSIBLE ERROR — a consistency check the GM may repair this turn
    availableEncounters: activeEnc() ? null : listAvailableEncounters(),
    partyDetail: partyBlockForGM(sharedScene, character.id),
    ratingDetail: ratingLineForGM(), // SNG-BATCH-9 §3 consumer (a): narrate to this player's ceiling
    registerDetail: narrativeRegister(location).cue, // SNG-048: the voice this place has earned (concrete default)
    legendDetail: maybeLegendDetail(), // SNG-042: a great figure surfaces on a qualifying beat (governed, rare, rating-aware)
    livingWorldDetail: livingWorldForGM(character, { locationId: character.currentLocationId, day: time.day }), // §2: proactively surface only LIVE (non-dormant) grown content
    sharedCanonDetail: sharedCanonForGM(), // Phase 3: OTHER players' promoted canon, rating-lensed for this viewer
    worldDateLabel: worldDate().label, // SNG-041: the shared absolute calendar (references-not-invents)
    travelDirective // SNG-122: a travel-intent turn MUST emit moveTo (with reachable-place enumeration)
  });
  busy = false;
  if (!result.ok) { renderPlay(null, { error: result.error }); return null; }
  // SNG-009: track op loss so the next turn's GM restates missed updates
  if (result.opsLost) { character.opLossPending = true; character.opLossLog = [...(character.opLossLog || []), { at: new Date().toISOString() }].slice(-3); }
  else character.opLossPending = false;
  // SNG-081: the player's OWN words are kept in scene history — their literal input wins, else the
  // action label. Without this the GM's "history" is a monologue of its own prose and the player's
  // half of the scene has no permanence (the deepest continuity bug in the project).
  const playerWords = exactWords || resolution?.action?.label || (typeof playerInput === "string" && !/^\(/.test(playerInput) ? playerInput : null);
  applyTurn(result.turn, resolution, playerWords);
  // ability-arch v2: rank 2 is earned through use, not bought — surface any craft that just became
  // fluent this turn (deduped). Rank 3 is never here; it comes as a GM-marked defining moment.
  if (pendingRankAdvances.length) {
    const names = [...new Set(pendingRankAdvances)].map(id => fullCatalog()[id]?.name).filter(Boolean);
    pendingRankAdvances = [];
    if (names.length) result.turn.narration = (result.turn.narration || "") + "\n\n" + names.map(n => `*▲ Practiced — **${n}** is fluent now (rank 2), earned through use.*`).join("\n");
  }
  // SNG-BATCH-9: the world grows through play — mint any entities the fiction reached for,
  // persist them durable + in-grain, and surface a light note. A generation failure never
  // halts the turn (the narration already stands).
  if (result.turn.generateRequest) {
    try {
      const grown = await handleGenerateRequests(result.turn);
      if (grown.length) {
        result.turn.narration = (result.turn.narration || "") + "\n\n" + grown.map(g =>
          `*✦ The world grows — **${g.name}** ${g.type === "location" ? "takes shape here, and will be here when you return" : g.type === "npc" ? "is now a real presence in this place" : "begins to stir as a thread of its own"}.*`).join("\n");
        saveCharacter(character);
      }
    } catch (err) { console.warn("[generate] request handling skipped:", err?.message); }
  }
  // SNG-035: MOMENT ART — the GM flagged this beat worth a picture. Build it through the floors,
  // attach to the turn for render, drop it in the gallery. Clamped ~1/scene; art-off = no-op.
  if (result.turn.imagePrompt && imagesEnabled() && sceneArtCount < 1) {
    try {
      const moment = { id: `moment-${character.id}-${Date.now().toString(36)}`, prompt: String(result.turn.imagePrompt).slice(0, 300) };
      const url = ensureImage(moment, "moment", { ratingLevel: viewerRatingLevel(), isMinor: false, field: "image" });
      if (url) {
        result.turn.momentArt = url;
        sceneArtCount++;
        addGalleryImage(character, { kind: "moment", prompt: moment.prompt, url, caption: (result.turn.sceneSummary || "").slice(0, 90), worldDay: absoluteWorldDay() });
        saveCharacter(character);
      }
    } catch (err) { console.warn("[art] moment art skipped:", err?.message); }
  }
  return result;
}

function applyTurn(turn, resolution, playerWords = null) {
  const location = CONTENT.locations[character.currentLocationId];
  const dayNow = readClock(character.clock).day;
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  // SNG-128: advance the session marker each played beat (a new session after a real-time gap). Cheap;
  // the World-Authorship Chronicle reads these boundaries for its per-session log.
  try { touchSession(character, { nowISO: new Date().toISOString(), worldDay: absoluteWorldDay() }); } catch { /* session marker is best-effort */ }

  // deltas from the GM (bounded trust: clamp everything)
  const d = turn.characterDeltas || {};
  if (d.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + clampInt(d.health, -20, 15)));
  if (d.energy) character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + clampInt(d.energy, -20, 40)));
  if (d.xp) character.xp += Math.max(0, Math.min(25, d.xp | 0));
  for (const item of d.inventoryAdd || []) addItem(character, item, CONTENT.items);
  for (const item of d.inventoryRemove || []) removeItem(character, typeof item === "string" ? item : item?.name);
  // SNG-137: items EVOLVE — the GM grows an owned item's story (description/name/provenance/use); bounded,
  // no power inflation. A light note so the player sees the thing they carry changed.
  if (turn.itemUpdates?.length) { const iu = applyItemUpdates(character, turn.itemUpdates); if (iu.length) turn.narration = (turn.narration || "") + "\n\n" + iu.map(u => `*✦ ${u.name} has changed — ${u.changed.join(", ")}.*`).join("\n"); }

  // deeds → reputation (day-stamped so news spread knows when they happened; SNG-041 also
  // stamps the shared absolute world-day so a deed dates the same on every character's calendar)
  const wdNow = absoluteWorldDay();
  for (const deed of turn.deeds || []) {
    const recorded = recordDeed(character, { ...deed, locationId: location.id, communityId: deed.communityId ?? location.communityId }, mods);
    recorded.day = dayNow;
    recorded.worldDay = wdNow;
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
  const memCtx = { locationId: location.id, day: readClock(character.clock).day, entities: codexEntities(), rules: CONTENT.rules };
  applyNpcUpdates(character, turn.npcUpdates || [], memCtx);
  // legacy relationshipDeltas: tolerated but may only UPDATE existing people —
  // this path once minted duplicate id-named registry entries
  applyNpcUpdates(character, (turn.relationshipDeltas || []).map(r => ({
    op: "update", npcId: r.npcId, relationshipDelta: clampInt(r.delta || 0, -2, 2), note: r.note
  })), memCtx);
  applyPlaceUpdates(character, location.id, turn.placeUpdates || [], memCtx);
  applyCodexUpdates(character, turn.codexUpdates || [], memCtx);
  applyFactUpdates(character, turn.factUpdates || [], memCtx);
  ensureBondPortraits(character); // SNG-136: a bond that crossed a high milestone this turn earns a portrait
  // §2 engagement: interacting with a grown NPC or accreting a fact about a grown entity is
  // attention — it keeps them real + surfacing. (Revisiting a grown place is signaled in travelTo.)
  for (const u of turn.npcUpdates || []) noteGeneratedAttention(u.npcId, "interact", memCtx.day);
  for (const u of turn.codexUpdates || []) if (u.entityId) noteGeneratedAttention(u.entityId, "fact", memCtx.day);
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
    updateProfile(character, resolution.action.intentTags, CONTENT.rules.playerAptitudes, CONTENT.rules);
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
  // ability-arch v2: the GM marks a defining moment → rank 3 (mastery). The engine confirms the earn
  // (rank 2, practiced, gates met) so mastery can never be handed to an unpracticed craft. A craft that
  // forks at rank 3 needs the player to choose its permanent path first (Law 9) — flag it for the
  // Character screen rather than auto-choosing.
  if (turn.markDefiningMoment?.abilityId) {
    const mid = turn.markDefiningMoment.abilityId;
    const ab = fullCatalog()[mid];
    const r = markDefiningMoment(character, mid, CONTENT.rules, { attributeGates: CONTENT.attributeGates, branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    if (r.ok) turn.narration += `\n\n*✦ A defining moment — **${ab?.name}** is mastered now (rank 3).*`;
    else if (r.forkPending) { character.pendingMasteryFork = mid; turn.narration += `\n\n*⑂ A defining moment for **${ab?.name}** — but it stands at a fork. Choose its path on your Character screen to master it.*`; }
  }
  // SNG-100b: the GM records a willing teacher of a people (durable — unlocks that people's capstones,
  // and later promotion/acquisition). Only for a real tradition; the engine never invents one.
  if (turn.markTeacher?.traditionId && CONTENT.traditionIndex?.byId?.[turn.markTeacher.traditionId]) {
    const tid = turn.markTeacher.traditionId;
    const first = !character.teachers?.[tid]?.willing;
    character.teachers = character.teachers || {};
    character.teachers[tid] = { met: true, willing: turn.markTeacher.willing !== false, npcId: String(turn.markTeacher.npcId || "").slice(0, 60) || null };
    if (first && character.teachers[tid].willing) turn.narration += `\n\n*✦ You have a teacher among the ${traditionLabel(tid)} now — their deepest craft opens to you as you earn their people's trust.*`;
  }
  // SNG-101: the GM surfaces a promotion the character has EARNED — the engine flags it for the player to
  // commit (Law 9), and only if promotionEligible is genuinely met. The GM can offer; it can never foreclose.
  if (turn.offerPromotion?.domainKey === "secondary" || turn.offerPromotion?.domainKey === "tertiary") {
    const dk = turn.offerPromotion.domainKey;
    const e = promotionEligible(character, dk, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    if (e.eligible) { character.pendingPromotion = dk; turn.narration += `\n\n*✦ You are being recognized — you may be raised into **${traditionLabel(e.trad)}** as your ${e.to}. Choose on your Character screen; it will close the far pole of that axis to you.*`; }
  }
  // SNG-102: the GM offers a NEW people to join — the engine flags it only if genuinely acquirable; the
  // player commits (Law 9 — joining forecloses the far pole of that people's axis). The GM never forecloses.
  if (turn.offerAcquisition?.traditionId) {
    const tid = turn.offerAcquisition.traditionId;
    if (acquirable(character, tid, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex }).ok) {
      character.pendingAcquisition = tid;
      turn.narration += `\n\n*✦ The ${traditionLabel(tid)} would take you as one of their own. You may join them on your Character screen — entering as a novice (Tier I), and closing the far pole of their axis to you.*`;
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
  const prevLevel = character.level;
  for (const msg of applyLevelUps(character, CONTENT.rules)) {
    turn.narration += `\n\n*You feel it settle into you — a new steadiness. (${msg})*`;
  }
  const portraitNote = refreshPortraitMilestone(character, prevLevel); // SNG-035: milestone portrait
  if (portraitNote) turn.narration += `\n\n*✦ ${portraitNote}*`;
  // quests: typed ops from the GM, applied within bounds; ctx.entities links giver/location
  // to codex nodes and lets the resolver match drifted titles (SNG-BATCH-7 Phase 3)
  const questNotes = applyQuestUpdates(character, turn.questUpdates || [], { entities: codexEntities() });
  if (questNotes.some(n => /couldn't match/i.test(n))) console.warn("[quests]", questNotes.filter(n => /couldn't match/i.test(n)));
  if (questNotes.some(n => /complet/i.test(n))) autoVerifyLeg("b7-inv", "a quest progressed to complete"); // SNG-051 auto-verify
  // SNG-032 narrative-driven time: when the fiction moves time (a night's sleep, a
  // journey montage, a long vigil — or a quick exchange), the GM declares it via
  // timeOps.hoursPassed and the engine advances the clock to match, INSTEAD of the fixed
  // beat default. Narration LEADS the clock, never trails. Fallback = old beat behavior.
  const extraHours = Math.max(0, Math.min(12, Number(turn.timeAdvanceHours) || 0));
  const beatDefault = (turn.sceneEnded ? ADVANCE.sceneEnd : ADVANCE.beat) + extraHours;
  const declared = turn.timeOps && Number.isFinite(Number(turn.timeOps.hoursPassed));
  const hours = declared ? Math.max(0.25, Math.min(72, Number(turn.timeOps.hoursPassed))) : beatDefault;
  advanceClock(character.clock, hours);
  if (declared && hours >= 2) autoVerifyLeg("b8-time", `narrative time moved ${hours}h via timeOps`); // SNG-051 auto-verify
  // SNG-056: THE HEADER FOLLOWS THE FICTION. When the GM narration moved the character to a real
  // place, update the AUTHORITATIVE currentLocationId so every location surface (header, map "you
  // are here", GM context) agrees with the prose — instead of the header showing a stale place.
  const moveRef = turn.moveTo && (turn.moveTo.location || turn.moveTo.id || turn.moveTo);
  if (moveRef) {
    // SNG-117: the header follows the fiction even to a place with no record yet — resolve it, or MINT it
    // (a named-but-unrecorded destination like "the pass" becomes a real, travelable place). Never no-op
    // and leave the header asserting a place the fiction has left.
    let destId = resolveLocationId(moveRef, CONTENT.locations) || mintTransitLocation(moveRef);
    if (destId && destId !== character.currentLocationId) {
      character.currentLocationId = destId;
      addKnownPlace(destId);
      noteGeneratedAttention(destId, "revisit", readClock(character.clock).day);
      notePlaceVisit(character, destId, readClock(character.clock).day);
      try { notePerception(character, destId, CONTENT.locations[destId], { visited: true, usedAbilityIds: [] }, CONTENT.rules); } catch { /* perception is a convenience */ }
      try { ensureLocationImage(destId); } catch { /* art never blocks a move */ }
    }
  }
  // SNG-122: NEVER STRAND THE PLAYER. If this turn was a travel intent but the beat produced no arrival
  // (the GM emitted no moveTo, or an unresolvable one), stash the intended destination so renderPlay offers
  // a one-tap "arrive" (the map's own travelTo path). If the move DID land them there, clear it. Any
  // non-travel turn also clears a stale pending arrival — the affordance is tied to the travel beat.
  const ti = travelIntentOf(resolution?.action);
  if (ti) {
    const arrived = (ti.destId && character.currentLocationId === ti.destId) || (!ti.destId && !!moveRef);
    character._pendingArrival = arrived ? null : { ref: ti.ref, name: ti.name, destId: ti.destId || null };
  } else {
    character._pendingArrival = null;
  }
  // SNG-070: the game self-heals — apply any bounded GM corrections to THIS save (repair, not wish;
  // every change validated + logged). Surface what changed so the player can see + trust it.
  if (turn.stateOps?.length) {
    const r = applyStateOps(character, turn.stateOps, {
      backgrounds: CONTENT.backgrounds || [], traditionIndex: CONTENT.traditionIndex, locations: CONTENT.locations,
      resolveLocationId, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString()
    });
    if (r.applied.length) character._correctionAside = "Set right: " + r.applied.map(describeCorrection).join("; ") + ".";
  }
  // SNG-088B: the GM may OPEN the gambit builder with a proposed plan instead of running it as one
  // action. Validate + stash; renderPlay opens the builder pre-filled (the player edits + commits).
  // SNG-091: the player's REQUEST is unconditional — never gate on aptness, and never silently drop
  // it when a stale draft lingers (a dropped request looks exactly like the GM ignoring you). We stash
  // the proposal regardless; renderPlay replaces any leftover draft with the freshly-asked-for plan.
  if (turn.gambitOps) {
    const go = turn.gambitOps;
    const maxSteps = CONTENT.rules.gambit?.maxSteps ?? 5;
    const steps = (Array.isArray(go.steps) ? go.steps : [])
      .map(s => ({ text: String(s?.text ?? s ?? "").slice(0, 300), fallback: String(s?.fallback ?? "").slice(0, 300) }))
      .filter(s => s.text).slice(0, maxSteps);
    const goal = String(go.goal ?? "").slice(0, 300);
    if (goal && steps.length) pendingGambitProposal = { goal, steps };
  }
  // scene anchor: the GM's updated scene state, clamped — or keep the previous one
  sceneState = sanitizeScene(turn.scene) || sceneState;
  // SNG-075: the valley is alive in narrative play too — maybe turn something up (woven next turn)
  maybeNarrativeEncounter(turn, resolution);
  // SNG-080: the world must PUSH — if nothing has happened for a while, make it happen (woven next turn)
  maybeWorldPressure(turn, resolution);
  if (gambitHintCooldown > 0) gambitHintCooldown--; // SNG-077: tick down the gambit-hint quiet period
  // party: publish this beat to the shared scene (fire-and-forget)
  if (sharedScene && turn.sceneSummary) publishPartyBeat(resolution?.action?.label || "acted", resolution?.degree ?? null, turn.sceneSummary);
  // chronicle + scene persistence
  if (turn.sceneSummary) {
    sceneTurns.push({ player: playerWords || null, summary: turn.sceneSummary, narration: turn.narration || "" }); // SNG-081: keep the player's half
    if (turn.sceneEnded) { character.chronicle.push(turn.sceneSummary); sceneTurns = []; sceneState = null; }
  }
  character.activeScene = turn.sceneEnded ? null : { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: turn, sceneState };
  saveCharacter(character); saveProfile(profile);

  // shared-world consequences (best-effort, never blocks play)
  if (syncEnabled()) {
    const events = (turn.ledgerEvents || []).map(e => ({
      schemaVersion: 1, at: new Date().toISOString(), worldDay: absoluteWorldDay(), who: character.id, playerKey: profile.playerKey,
      where: location.id, what: String(e.what || "").slice(0, 200), tags: e.tags || [],
      spectrumDeltas: e.spectrumDeltas || {}, visibility: e.visibility || "witnessed",
      impactsLocal: !!e.impactsLocal // SNG-041: crosses the far-world/local boundary to whoever it affects
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

/** SNG-090: the substrate verdict for an ABILITY action at a place. null for weapon/attribute actions
 *  (substrate-free, SNG-089) or when the model/density isn't loaded. Uses the primary ability's
 *  tradition, the location's density, and what the character carries. */
function substrateForAction(choice, location) {
  if (!CONTENT.substrateModel) return null;
  const abId = choice.abilityId || (choice.comboAbilities || [])[0];
  if (!abId) return null;
  const ab = fullCatalog()[abId];
  const tradition = ab ? (abilityTradition(ab) || ab.powerSystem) : null;
  if (!tradition) return null;
  const density = locationDensity(location, CONTENT.substrateModel);
  if (density == null) return null;
  const carried = carriedSubstrate(character, CONTENT.items, activeCompanions(character, CONTENT.companions));
  return substrateVerdict({ tradition, density, carried, data: CONTENT.substrateModel });
}

/** SNG-116: THE single source of truth for an action's substrate CHANCE penalty — the exact number the
 *  resolve path applies (`substrateForAction(...).chancePenalty`). Every "how hard" preview MUST pass this
 *  into successChance; omitting it made the readout assume a full lattice and lie on thin ground. Preview
 *  and resolve both derive the penalty here, so they can never disagree. */
function substratePenaltyFor(choice, location) {
  const usesAbility = !!(choice.abilityId || (choice.comboAbilities || []).length);
  return usesAbility ? (substrateForAction(choice, location)?.chancePenalty || 0) : 0;
}

async function onChoice(choice) {
  if (busy) return;
  lastPlayerAction = choice?.label || choice?.exactWords || null; // SNG-066: for feedback forensics
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
      const stdChance = successChance({ character, action: pAction, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: pe, substratePenalty: substratePenaltyFor(choice, location) }); // SNG-116: AUTO-intensity must see the real (substrate-inclusive) chance
      intensity = autoIntensity(stdChance, CONTENT.intensity);
    }
    if (energyCost != null) energyCost = scaledEnergy(energyCost, intensity, CONTENT.intensity);
  }
  if (energyCost && character.energy < energyCost) { alert("Not enough energy — rest first."); return; }
  // SNG-090: the substrate — can this CRAFT run here? A weapon/attribute action is unaffected. At the
  // extreme (the lattice is nearly gone for a high-dependency craft), the ability won't answer at all —
  // a hard, explained gate (steel and wit still work; carry charge or find denser ground).
  const substrate = usesAbility ? substrateForAction(choice, location) : null;
  if (substrate?.off) {
    const abName = fullCatalog()[choice.abilityId || (choice.comboAbilities || [])[0]]?.name || "your craft";
    renderPlay(character.activeScene?.lastTurn || null, { aside: `The lattice is too thin here — ${abName} barely stirs (${substrate.percent}% of its strength) and won't answer. Carry charge, or reach denser ground; steel and wit still work.` });
    return;
  }
  const action = {
    label: choice.label, attribute: choice.attribute || "practical",
    subAttribute: SUBS.includes(choice.subAttribute) ? choice.subAttribute : null,
    axes: choice.axes || {}, difficulty: choice.difficulty || 0, intentTags: choice.intentTags || [], abilityLevel,
    tags: choice.intentTags || [], planned: (choice.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)),
    novel: !!choice.novel, comboAbilities: choice.comboAbilities || [], noveltyHint: choice.noveltyHint || "",
    travelTo: choice.travelTo || null, exactWords: choice.exactWords || null // SNG-122: travel destination + literal words for travel-intent detection
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
    // SNG-098 C: a duel runs as a two-sided SKILL BATTLE (the contest panel) when the engine is loaded and
    // the def doesn't opt out; the classic single-margins duel stays the fallback (skillBattle:false).
    const isSB = !!(CONTENT.skillBattle?.engine && def.type === "duel" && def.skillBattle !== false);
    const oppSheet = isSB ? synthesizeOpponentSheet(def.opponent, CONTENT.skillBattle.engine) : null;
    character.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
    saveCharacter(character);
    renderPlay(null, { thinking: "…", playerBeat: { label: choice.label } });
    const result = await runGM({ resolution: null, playerInput: `(The encounter "${def.name}" begins: ${def.setup} Narrate the opening${isSB ? " of the contest (the mechanics play out in a panel — just set the scene and the stakes)" : " and offer round choices"}.)` });
    if (result) renderPlay(result.turn, { playerBeat: { label: choice.label }, degraded: result.degraded });
    if (isSB) renderSkillBattle(); // take over the rounds with the contest panel
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
  if (encD) {
    const encDiff = encounterDifficulty(encD.state, encD.def, CONTENT.rules, { flee: choice.encounterAction === "flee" });
    action.difficulty = (action.difficulty || 0) + encDiff;
    // SNG-106: name the opposed term so the roll breakdown reads "the raider (threat N) −11", not anonymous.
    if (encDiff) action.difficultySource = `${encD.def.name || "the opposition"}${encD.def.opponent?.threat ? ` (threat ${encD.def.opponent.threat})` : ""}`;
  }
  const equip = equipmentBonus(character, action.intentTags, CONTENT.rules);
  const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.intentTags, CONTENT.rules, character);
  const aff = affinityFor(action, location);
  const iMod = usesAbility ? effectMod(intensity, CONTENT.intensity) : 0;
  const resolution = resolveAction({ character, action, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus + iMod, substratePenalty: substrate?.chancePenalty || 0 });
  if (equip.bonus + comp.bonus > 0) resolution.equipHelpers = [...equip.helpers, ...comp.helpers];
  if (aff.bonus !== 0) resolution.locationAffinity = affinityReceipt(aff);
  if (usesAbility) { resolution.intensity = intensity; resolution.energySpent = energyCost; }
  // SNG-090: surface the substrate when it bit (starved/crowded) — a receipt line + a note the GM
  // narrates so the fiction matches ("the lattice is thin here; your craft runs at a fraction").
  if (substrate && substrate.side !== "full" && substrate.side !== "neutral") {
    resolution.substrate = { percent: substrate.percent, side: substrate.side };
    pendingSubstrateNote = substrate.side === "starved"
      ? `The lattice is THIN here — the character's craft is running at ~${substrate.percent}% (starved of substrate). Let the effort show the strain; a weapon or mundane means is unaffected.`
      : `The lattice is DENSE and CROWDS the character's craft here — it runs at ~${substrate.percent}% (too much signal is noise). Let it read as interference, not weakness.`;
  }
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
    if (usedIds.length) { recordUse(character, usedIds); pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex })); }
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
    travelTo: intent.travelTo || null, // SNG-122: the parsed destination rides through to the action
    exactWords: text
  });
}

/** Historical name for the encounter test panel gate — resolves to the single SNG-074 model. */
function isDev() { return isDevMode(); }

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
  // SNG-127: the button click-paths (travel/enter/rest) honor the player's pacing multiplier too.
  if (!table || !rollTrigger(trigger, hereNow(), table, Math.random, resolvePacing(profile?.pacing, table).mult)) return false;
  const entry = pickEncounter(table, hereNow(), Math.random, {});
  if (!entry) return false;
  return fireEncounter(entry, { news });
}

/** SNG-075: after a narrative GM turn, MAYBE turn something up — bound to how long the fiction
 *  took, and WOVEN into the next turn (never a card). Suppressed during combat/gambit, once per
 *  scene, on a cooldown, and on an intense/intimate beat. Stashes a seed; the next runGM injects it. */
function maybeNarrativeEncounter(turn, resolution) {
  turnsSinceEncounter++;
  const table = CONTENT.randomEncounters;
  if (!table) return;
  // SNG-127: the player's chosen pacing (Calm→Relentless) resolves a rate multiplier + a cooldown; a
  // config-tunable rate/floor means "crank it" is a JSON edit or a setting, never a code hunt.
  const pace = resolvePacing(profile?.pacing, table);
  // SUPPRESSION CONDITIONS (kept): a live encounter · a gambit in play · a scene that just ended · an
  // explicitly intense/intimate beat · during combat. SNG-127: the once-per-scene gate is now SOFT —
  // it adds spacing after the first fire, not a permanent one-per-scene cap (that was the dead-zone).
  if (activeEnc() || gambitDraft) return;
  if (turn?.sceneEnded) return;
  if (sceneState?.intense || sceneState?.intimate) return;
  const spacing = pace.cooldown + (sceneEncounterFired ? 2 : 0);
  if (turnsSinceEncounter <= spacing) return;
  const intentTags = resolution?.action?.intentTags || resolution?.intentTags || [];
  if (intentTags.some(t => /intimate|climax|grief|vigil|mourn/.test(String(t).toLowerCase()))) return;
  // SNG-127 (Q2): an UNDECLARED beat (GM omits timeOps → 0h, yet the clock ticked +1h) is floored to
  // minHoursPerBeat so it still counts as "time passing" — otherwise classify returns "none" and the
  // whole narrative path never fires. A declared short beat keeps its real (quiet) hours.
  const hoursPassed = beatHours(turn, table);
  const kind = classifyNarrativeKind({ intentTags, why: turn?.timeOps?.why || "", hoursPassed });
  if (kind === "none") return;
  const loc = hereNow();
  const fired = kind === "rest" ? rollTrigger("onRest", loc, table, Math.random, pace.mult)
    : kind === "travel" ? rollTrigger("onTravel", loc, table, Math.random, pace.mult)
    : rollNarrativeTime(hoursPassed, loc, table, Math.random, pace.mult);
  if (!fired) return;
  const entry = pickEncounter(table, loc, Math.random, {});
  if (!entry) return;
  // WEAVE, DO NOT INTERRUPT: no card, no scene change — stash the seed for the next GM turn.
  pendingWeave = { seed: entry.seed, flavor: entry.flavor, perilous: canIncapacitate(entry), loreTier: entry.loreTier || null };
  sceneEncounterFired = true;
  turnsSinceEncounter = 0;
}

/** SNG-080: the world must PUSH. Count quiet turns; past the threshold, hand the NEXT GM turn a
 *  pressure directive (escalating, register/danger-aware, tightening a live quest thread). If the
 *  world already acted this beat (an encounter, a quest change, a scene end), the streak resets —
 *  the player never has to ask the world to be interesting, and never gets buried in it either. */
function maybeWorldPressure(turn, resolution) {
  const woveEncounter = !!pendingWeave; // SNG-075 just set one → the world already acted this beat
  const questChanged = !!(turn?.questUpdates?.length || turn?.stateOps?.length);
  const eventful = isEventfulTurn({ encounterActive: !!activeEnc(), questChanged, woveEncounter, sceneEnded: turn?.sceneEnded });
  if (eventful) { quietTurns = 0; pressureStreak = 0; return; }
  if (gambitDraft) return; // don't interrupt a plan being built
  quietTurns++;
  const tier = pressureTier(quietTurns, pressureStreak);
  if (tier <= 0) return;
  const loc = hereNow();
  const questTitles = (character.quests || []).filter(q => q.status === "active").map(q => q.title || q.id);
  pendingPressure = pressureDirective(tier, loc?.dangerLevel || 0, questTitles);
  pressureStreak++;   // the next pressure escalates
  quietTurns = 0;     // space them out — another threshold of quiet before the next push
}

/** SNG-117: mark a place KNOWN by name (GM-named destination, en-route, minted transit place) so the map
 *  surfaces its name + it becomes a travel target — even before it's ever entered. Idempotent. */
function addKnownPlace(id) {
  if (!id) return;
  character.knownPlaces = character.knownPlaces || [];
  if (!character.knownPlaces.includes(id)) character.knownPlaces = [...character.knownPlaces, id].slice(-80);
}

// SNG-122: a clear travel expression in the player's own words — "head to / go to / travel to / set out
// for / make my way to {place}". Captures the destination phrase in group 1. Deliberately narrow so a
// non-travel line ("I go for his throat") doesn't match a place (no "to/for {place}" travel frame).
const TRAVEL_PHRASE = /\b(?:head(?:ing)?|go(?:ing)?|travel(?:ing)?|journey(?:ing)?|set out|set off|make (?:my|our|your|his|her|their|the) way|depart(?:ing)?|leave|ride|walk|march|venture|return|head back)\s+(?:back\s+)?(?:to|for|toward|towards|over to|into)\s+(.{2,48}?)(?:\s*[.!?,;]|\s+(?:and|then|to)\b|$)/i;
const NOT_A_PLACE = /^(?:there|here|him|her|them|it|me|us|you|home|back|inside|outside|out|away|on|onward|forward|work|bed|sleep|rest|ground|him\b)$/i;

/** SNG-122: is this action a TRAVEL intent, and to where? Two signals with different trust:
 *   (1) TRUSTED — the LLM intent parser named a destination (`travelTo`) for a GO/HEAD/JOURNEY action;
 *       honored even for an unmapped place (minted on arrival, the SNG-117 path).
 *   (2) GUESSED — a "travel" tag or a travel-phrase in the label/words. A guess must name a REAL/known
 *       place to count, so "go for his throat" (an attack) never becomes a phantom destination.
 *  Returns {ref,name,destId} or null; destId null (trusted only) means "mint on arrival." */
function travelIntentOf(action) {
  if (!action) return null;
  const titleize = s => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60);
  // (1) trusted explicit destination from the free-text parser
  let ref = action.travelTo && String(action.travelTo).trim();
  if (ref && !NOT_A_PLACE.test(ref.replace(/^the\s+/i, "").trim())) {
    const destId = resolveLocationId(ref, CONTENT.locations);
    return { ref, name: destId ? CONTENT.locations[destId].name : titleize(ref), destId };
  }
  // (2) a GUESS from tag/phrase — must resolve to a real place to be trusted as a destination
  const tags = [...(action.intentTags || []), ...(action.tags || [])].map(t => String(t).toLowerCase());
  const text = `${action.label || ""} ${action.exactWords || ""}`;
  const m = text.match(TRAVEL_PHRASE);
  let cand = m ? m[1].trim().replace(/\s+/g, " ") : null;
  if ((!cand || NOT_A_PLACE.test(cand.replace(/^the\s+/i, "").trim())) && tags.includes("travel")) {
    cand = null; // tagged travel, no clean phrase → find a KNOWN place named in the words
    for (const l of Object.values(CONTENT.locations)) { const n = (l.name || "").toLowerCase(); if (n && n.length > 2 && text.toLowerCase().includes(n)) { cand = l.name; break; } }
  }
  if (!cand) return null;
  const destId = resolveLocationId(cand, CONTENT.locations);
  if (!destId) return null; // a guessed phrase that isn't a real place is NOT a travel intent (no over-move)
  return { ref: cand, name: CONTENT.locations[destId].name, destId };
}

/** SNG-122: the per-turn directive that FORCES the GM to emit moveTo for a travel intent, and enumerates
 *  the real/known places reachable from here so its moveTo target resolves (Q2). */
function buildTravelDirective(ti) {
  const here = CONTENT.locations[character.currentLocationId];
  const adj = (here?.connections || []).map(id => CONTENT.locations[id]).filter(Boolean)
    .filter(l => isPlaceKnown(character, l.id, CONTENT.locations)).map(l => `${l.name} (${l.id})`);
  const dest = ti.destId ? `${CONTENT.locations[ti.destId].name} (id ${ti.destId})` : `"${ti.ref}"`;
  return `The player is TRAVELING to ${dest}. You MUST emit "moveTo": {"location": "${ti.destId || ti.ref}", "why": "…"} this turn so they actually arrive — narrate the trip (a montage if it's far, with timeOps) but do NOT end the beat without moveTo. ${adj.length ? `Places reachable from ${here?.name || "here"}: ${adj.join(", ")}.` : ""}`;
}

/** SNG-122: the one-tap safety net — the travel beat didn't move the player, so arrive now via the SAME
 *  path the map uses (resolve-or-mint the destination, then travelTo). Never leaves them stranded. */
async function arriveAtPending() {
  const p = character._pendingArrival; if (!p || busy) return;
  character._pendingArrival = null;
  const destId = (p.destId && CONTENT.locations[p.destId] ? p.destId : null) || resolveLocationId(p.ref, CONTENT.locations) || mintTransitLocation(p.ref);
  await travelTo(destId);
}

/** SNG-117: turn a named-but-unrecorded destination ("the pass") into a REAL, travelable place — a
 *  lightweight generated location adjacent to where you left, with a stable id + map coord. Idempotent
 *  (keyed off the normalized name, so "the pass" mints exactly once — Q1). Deterministic (no model call);
 *  the world-gen path can flesh it out later. Returns the id. */
function mintTransitLocation(moveRef) {
  ensureGenerated(character);
  const id = "gen-" + slugify(String(moveRef));
  if (CONTENT.locations[id]) { addKnownPlace(id); return id; } // already a real place — reuse, never dup
  const here = CONTENT.locations[character.currentLocationId];
  const existing = {}; for (const l of Object.values(CONTENT.locations)) if (l.map) existing[l.id] = l.map;
  const name = String(moveRef).replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60);
  const rec = {
    id, name, regionId: here?.regionId || here?.region || null,
    descriptionSeed: `A place the road led to — ${name}. The fiction brought you here before the map knew its name.`,
    tags: ["transitional"], connections: here ? [here.id] : [], _gen: true, _mintedAs: "transit",
    map: coordForGenerated(id, here?.map, existing)
  };
  character.generated.location[id] = rec;   // persists on the save (hydrateGeneratedIntoContent revives it)
  CONTENT.locations[id] = rec;              // live this session
  if (here && Array.isArray(here.connections) && !here.connections.includes(id)) here.connections = [...here.connections, id]; // bidirectional reach
  addKnownPlace(id);
  return id;
}

async function travelTo(locId) {
  if (busy) return;
  noteGeneratedAttention(locId, "revisit", readClock(character.clock).day); // §2: returning to a grown place keeps it alive
  addKnownPlace(locId); // SNG-117: somewhere you've been is known
  character.currentLocationId = locId;
  character.activeScene = null;
  sceneTurns = [];
  sceneState = null;
  advanceClock(character.clock, ADVANCE.travel);
  notePlaceVisit(character, locId, readClock(character.clock).day);
  notePerception(character, locId, CONTENT.locations[locId], { visited: true, usedAbilityIds: [] }, CONTENT.rules);
  try { ensureLocationImage(locId); } catch { /* SNG-046 L3: art is a convenience; never block travel */ }
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
  // SNG-105: energy restore scales with the pool (a night is always ~a third of maxEnergy); health/hours flat.
  const gainE = recoveryEnergy(kind, character, CONTENT.rules);
  character.energy = Math.min(character.maxEnergy, character.energy + gainE);
  character.health = Math.min(character.maxHealth, character.health + r.health);
  if (kind === "breather") {
    advanceClock(character.clock, r.hours);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You take an hour off your feet. (+${gainE} energy, +${r.health} health)` });
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
    structuredQuestsDetail: structuredQuestsForGM(character, { npcs: CONTENT.npcs }),
    sceneState,
    npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) }),
    placeMemoryDetail: placeMemoryForGM(character, character.currentLocationId),
    newsDetail: newsForGM(character),
    abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks, CONTENT.rules),
    codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: (character.quests || []).filter(q => q.status === "active").map(q => q.title) })
  }, text);
  busy = false;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, gmAside: result.ok ? result.text : "The GM stumbled: " + result.error });
}

// ---------- world map ----------

// SNG-080: danger, made legible on the map — so the player can SEE where fighting lives.
function dangerLabel(dl) { return ["safe", "quiet", "uneasy", "dangerous", "deadly"][Math.max(0, Math.min(4, dl | 0))]; }

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
  const isKnown = id => isPlaceKnown(character, id, CONTENT.locations); // SNG-117: heard-of / adjacent / en-route, not just visited
  // SNG-046 Layer 1: every location gets stable coords (authored kept; coordless + generated
  // placed deterministically), a tag-derived icon, and a disposition terrain tint.
  const pos = autoMapPositions(locs);
  const kg = mapShowKG ? knownOverlay(character, pos, CONTENT) : []; // SNG-083: people AND rumours
  // SNG-082: real terrain — each region drawn as a palette-filled hull of its locations. Data-driven
  // (regions.json), so a generated place inherits the right ground. Three regions LOOK WRONG on purpose.
  const WRONG = { the_pattern_reach: "wrong-noneuclid", the_veiled_reach: "wrong-lying", the_numinous_reach: "wrong-uncertain" };
  const EXPANDING = new Set(["radiant_wastes", "unspooling", "the_scour", "the_ceaseless", "scour", "ceaseless"]);
  const regionOf = {};
  for (const l of locs) if (l.regionId) (regionOf[l.regionId] = regionOf[l.regionId] || []).push(pos[l.id]);
  const terrain = (CONTENT.regions || []).map(rg => {
    const pts = regionOf[rg.regionId]; if (!pts || !pts.length) return "";
    const pal = rg.palette || {}; const shape = pts.length >= 3 ? regionShape(pts, 34) : null;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length, cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const cls = `map-region ${WRONG[rg.regionId] || ""} ${EXPANDING.has(rg.regionId) ? "expanding" : ""}`;
    const body = shape
      ? `<polygon points="${shape.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" class="${cls}" fill="${esc(pal.base || "#2a2f28")}" stroke="${esc(pal.edge || pal.base || "#333")}"><title>${esc(rg.name + " — " + (rg.terrain || ""))}</title></polygon>`
      : `<circle cx="${cx}" cy="${cy}" r="46" class="${cls}" fill="${esc(pal.base || "#2a2f28")}" stroke="${esc(pal.edge || "#333")}"><title>${esc(rg.name)}</title></circle>`;
    return `${body}<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" class="map-region-label" fill="${esc(pal.accent || "#8a8")}">${esc(rg.name)}</text>`;
  }).join("");
  const svg = `<svg id="skill-svg" viewBox="0 0 800 440" class="world-map" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    <g class="map-terrain">${terrain}</g>
    <text x="20" y="30" class="map-title">THE VALLEY OF ECHOES</text>
    <text x="20" y="50" class="map-sub">Day ${readClock(character.clock).day} · Water Crisis stage ${stage}${mapShowKG ? " · showing what you know" : ""}</text>
    ${edges.map(([a, b]) => { const A = pos[a], B = pos[b]; const spine = a === "the_axis_gate" || b === "the_axis_gate" || a === "the_crossing" || b === "the_crossing";
      return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="map-edge ${a === here || b === here ? "active" : ""} ${spine ? "spine" : ""}"/>`; }).join("")}
    ${locs.map(l => {
      const P = pos[l.id];
      const visited = isVisited(l.id);
      const reachable = connectedToHere.includes(l.id);
      const pm = character.placeMemory?.[l.id];
      const dl = Math.max(0, Math.min(4, l.dangerLevel | 0)); // SNG-080: graduated danger, findable on the map
      const cls = `map-node ${terrainClass(l)} dl${dl} ${l.id === here ? "here" : ""} ${reachable ? "reachable" : ""} ${visited ? "" : "unvisited"} ${dl >= 3 ? "danger" : ""} ${selectedId === l.id ? "selected" : ""}`;
      const known = isKnown(l.id); // SNG-117
      const tip = visited
        ? `${l.name}${l.id === here ? " — you are here" : ""}${pm?.visits ? ` · ${pm.visits} visit${pm.visits > 1 ? "s" : ""}` : ""}${dl >= 1 ? ` · ${dangerLabel(dl)}` : ""}${reachable ? " · one travel away" : ""}`
        : known
          ? `${l.name} — you know of it, not yet been${reachable ? " · one travel away" : ""}`
          : `Unknown place — you've only heard of it${reachable ? " · one travel away" : ""}`;
      return `<g class="${cls}" data-mapsel="${esc(l.id)}">
        <title>${esc(tip)}</title>
        <circle class="hit" cx="${P.x}" cy="${P.y}" r="24"/>
        ${dl >= 2 ? `<circle class="danger-ring dl${dl}" cx="${P.x}" cy="${P.y}" r="${(l.id === here ? 14 : 10) + 4}"/>` : ""}
        <circle cx="${P.x}" cy="${P.y}" r="${l.id === here ? 14 : 10}"/>
        ${visited ? `<text x="${P.x}" y="${P.y + 5}" text-anchor="middle" class="map-icon">${iconForTags(l.tags)}</text>` : ""}
        ${mapShowSub ? (() => { const sps = Object.values(character.placeMemory?.[l.id]?.subPlaces || {}); return sps.slice(0, 6).map((sp, si) => {
          const ang = (si / Math.max(1, Math.min(sps.length, 6))) * Math.PI * 2 - Math.PI / 2;
          const sx = P.x + Math.cos(ang) * 22, sy = P.y + Math.sin(ang) * 22;
          return `<circle cx="${sx}" cy="${sy}" r="4" class="map-satellite ${sp.visited ? "visited" : "heard"}"><title>${esc(sp.name)}${sp.note ? " — " + esc(sp.note) : ""}${sp.visited ? "" : " (heard of)"}</title></circle>`;
        }).join(""); })() : ""}
        <text x="${P.x}" y="${P.y + (P.y > 300 ? 32 : -20)}" text-anchor="middle" class="map-label">${esc(known ? l.name : "?")}</text>
        ${visited && pm?.visits > 1 ? `<text x="${P.x}" y="${P.y + (P.y > 300 ? 46 : -6)}" text-anchor="middle" class="map-visits">×${pm.visits}</text>` : ""}
      </g>`; }).join("")}
    ${kg.map(e => `<g class="map-kg ${e.kind} ${e.discovered ? "met" : "heard"}" ${e.topicId ? `data-kgtopic="${esc(e.topicId)}"` : ""}>
        <title>${esc(e.label)}${e.kind === "rumour" ? " — a thread you've only heard of" + (e.note ? ": " + esc(e.note) : "") : e.discovered ? " — you've met them" : " — you've only heard of them"}</title>
        ${e.kind === "rumour"
          ? `<rect x="${e.x - 5}" y="${e.y - 5}" width="10" height="10" transform="rotate(45 ${e.x} ${e.y})"/>`
          : `<circle cx="${e.x}" cy="${e.y}" r="6"/>`}
        <text x="${e.x}" y="${e.y - 9}" text-anchor="middle" class="map-kg-label">${esc(e.label.slice(0, 18))}</text>
      </g>`).join("")}
  </g></svg>`;
  // details panel for the selected node — travel is an explicit button, never a stray click
  let details = "";
  if (selectedId && CONTENT.locations[selectedId]) {
    const l = CONTENT.locations[selectedId];
    const visited = isVisited(l.id);
    const known = isKnown(l.id); // SNG-117
    const pm = character.placeMemory?.[l.id];
    const reachable = connectedToHere.includes(l.id);
    details = `<div class="map-details">
      <div class="map-details-head">
        <h3>${esc(known ? l.name : "An unknown place")}${!visited && known ? ` <span class="hint">— known of, not yet been</span>` : ""}</h3>
        ${(l.dangerLevel | 0) >= 1 ? `<span class="rep-band danger-chip dl${Math.min(4, l.dangerLevel | 0)}">${esc(dangerLabel(Math.min(4, l.dangerLevel | 0)))}</span>${infoDot("world.danger")}` : `<span class="rep-band trusted">safe</span>`}
        ${visited ? (() => { const d = locationDensity(l, CONTENT.substrateModel); if (d == null) return ""; const lab = d < 0.34 ? "thin lattice" : d > 0.66 ? "dense lattice" : "even lattice"; return `<span class="rep-band" title="Substrate density here: ${Math.round(d * 100)}%. Continuous craft thrives dense, starves thin; Returned craft the reverse.">${lab}</span>`; })() : ""}
        ${l.id === here ? `<span class="rep-band trusted">you are here</span>` : ""}
        ${(() => { const s = l.communityId ? standingWith(character, l.communityId, CONTENT.rules) : null; return s?.score ? `<span class="rep-band ${s.band}" title="Your standing here — ${s.band} (${s.score})">${esc(s.band)}</span>` : ""; })()}
      </div>
      ${(() => { const ppl = knownPeopleAt(character, l.id, { locations: CONTENT.locations, npcs: CONTENT.npcs }); return ppl.length ? `<div class="loc-people"><span class="hint">You know here: </span>${ppl.map(p => `<span class="known-here">${esc(p.name)} <span class="cost">${esc(p.label)}</span></span>`).join(", ")}</div>` : ""; })()}
      ${visited && locationImageFor(l.id) ? `<img class="location-image" src="${esc(locationImageFor(l.id))}" alt="${esc(l.name)}" data-lightbox="location" loading="lazy" onerror="this.style.display='none'">` : ""}
      ${visited
        ? `<p class="map-details-desc">${esc(l.descriptionSeed)}</p>${/* SNG-076: authored descriptionSeed renders IN FULL */""}
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
  chrome(`<div class="screen" style="max-width:900px">
    <h2>World Map</h2>
    <p class="hint" style="margin-bottom:8px">92 places across 24 regions, each ground coloured by its disposition. Gold ring: you are here. The Axis Gate's twelve roads are the spine. <strong>Scroll to zoom, drag to pan.</strong></p>
    <div style="margin-bottom:8px"><button class="opt ${mapShowKG ? "selected" : ""}" id="map-kg-toggle" title="People you've met (solid) and threads you've only heard of (dimmed diamonds) — where they live">${mapShowKG ? "✓ " : ""}Show what you know</button>
      <button class="opt ${mapShowSub ? "selected" : ""}" id="map-sub-toggle" title="The places WITHIN each location (satellites around each node)" style="margin-left:6px">${mapShowSub ? "✓ " : ""}Show sub-places</button>
      ${mapShowKG && !kg.length ? `<span class="hint" style="margin-left:8px">You haven't met anyone or heard a rumour yet — the world is still a rumour. Play on.</span>` : mapShowKG ? `<span class="hint" style="margin-left:8px">◆ dimmed = heard of · ● solid = met</span>` : ""}</div>
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
        <button id="gz-me" title="Centre on me">◎</button>
      </div>
      ${svg}
    </div>
    ${details}
    <button class="btn secondary" id="map-back" style="margin-top:12px">Back</button>
  </div>`);
  wireSkillGraphViewport();
  const meBtn = document.getElementById("gz-me");
  if (meBtn) meBtn.onclick = () => { const p = pos[here]; if (!p) return; const k = 2.2; graphView = { k, tx: 400 - p.x * k, ty: 220 - p.y * k };
    const vp = document.querySelector("#skill-svg .graph-vp"); if (vp) vp.setAttribute("transform", `translate(${graphView.tx} ${graphView.ty}) scale(${k})`); };
  document.getElementById("map-kg-toggle").onclick = () => { mapShowKG = !mapShowKG; renderMap(selectedId); };
  document.getElementById("map-sub-toggle").onclick = () => { mapShowSub = !mapShowSub; renderMap(selectedId); };
  for (const g of app.querySelectorAll("[data-kgtopic]")) g.onclick = () => renderCodexScreen("", g.dataset.kgtopic);
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
  document.getElementById("map-back").onclick = () => { graphView = null; renderPlay(character.activeScene?.lastTurn || null, {}); };
}

// ---------- skill KG graph (SNG-011 Phase 3a — rendered like the world map) ----------

// ---------- SNG-073: THE SKILL WHEEL — the skill tree IS the great circle ----------
// Polar layout, radius = tier. 24 tradition nodes on the ring (read from traditions.json, never
// hardcoded); each people's abilities radiate INWARD (V at the node, I near the centre — depth is
// mastery). Folk crafts at the CENTRE (open to all). Precursor OUTSIDE the ring (the substrate).
// Known braids drawn as connections — cross-pole braids as the DIAMETER through the centre. The
// antipode is dark and struck through, directly across the wheel. Access, lore and geometry, one picture.

const WHEEL = { size: 920, cx: 460, cy: 460, rNode: 355, rInner: 150, rFolk: 78, rPrecursor: 405 };
function wheelTierRadius(tier) { const t = Math.max(1, Math.min(5, tier || 1)); return WHEEL.rInner + (t - 1) / 4 * (WHEEL.rNode - WHEEL.rInner); }
function wheelAngle(posIndex, n) { return (posIndex / (n || 24)) * Math.PI * 2 - Math.PI / 2; }
function wheelPt(ang, r) { return { x: WHEEL.cx + Math.cos(ang) * r, y: WHEEL.cy + Math.sin(ang) * r }; }

/** Build every ability's position + state for the wheel. Pure over CONTENT + character. */
function buildWheelModel() {
  const idx = CONTENT.traditionIndex;
  const order = ringOrder(idx);              // 24 tradition ids by ring position
  const n = order.length || 24;
  const posOf = t => order.indexOf(t);
  const cat = fullCatalog();
  const owned = new Set((character.abilities || []).map(a => a.abilityId));
  const domains = character.domains || {};
  const nodes = [];
  // group abilities: pole-tradition spokes · folk centre · precursor outer ring
  const byTrad = {}, folk = [], precursor = [];
  for (const ab of Object.values(cat)) {
    const trad = traditionOf(ab, idx);
    if (ab.powerSystem === "precursor") { precursor.push(ab); continue; }
    if (trad && isFolkTradition(trad, idx)) { folk.push(ab); continue; }
    if (trad && posOf(trad) >= 0) { (byTrad[trad] = byTrad[trad] || []).push(ab); continue; }
    if (!trad || ab.powerSystem === "learned") { folk.push(ab); continue; } // ungoverned/learned → centre
  }
  const mk = (ab, x, y, ang) => {
    const trad = traditionOf(ab, idx);
    const v = domainAccess(ab, ab.levelReq || 1, domains, idx);
    const isOwned = owned.has(ab.id);
    nodes.push({ id: ab.id, name: ab.name, tier: tierOf(ab.levelReq), levelReq: ab.levelReq || 1, cls: trad || ab.powerSystem || "learned",
      x, y, ang, owned: isOwned, band: v.band, allowed: v.allowed, penalty: v.penalty, closed: v.band === "closed",
      barred: !v.allowed && v.band !== "closed", dim: v.penalty > 1, isFolk: trad && isFolkTradition(trad, idx), isPrecursor: ab.powerSystem === "precursor",
      // SNG-124: function overlay + cost-at-a-glance. `reachable` = learnable now (allowed, not owned, level met).
      functions: ab.functions || [], families: familiesOfAbility(ab, FN_INDEX), energyCost: ab.energyCost ?? null,
      effCost: (() => { try { return effectiveEnergyCost(ab, character, CONTENT.rules); } catch { return ab.energyCost ?? null; } })(),
      reachable: v.allowed && !isOwned && (character.level || 1) >= (ab.levelReq || 1),
      precursorUnlocked: ab.powerSystem === "precursor" && (character.precursorAccess || []).includes(ab.id) }); // SNG-129: narrative-earned
  };
  // spokes: fan same-tier abilities by a small angular offset around the spoke
  for (const [trad, abs] of Object.entries(byTrad)) {
    const ang0 = wheelAngle(posOf(trad), n);
    const byTier = {};
    for (const ab of abs) (byTier[ab.levelReq || 1] = byTier[ab.levelReq || 1] || []).push(ab);
    for (const [lv, list] of Object.entries(byTier)) {
      const r = wheelTierRadius(Number(lv));
      list.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, i) => {
        const spread = (i - (list.length - 1) / 2) * 0.05; // radians of fan
        const a = ang0 + spread; const p = wheelPt(a, r); mk(ab, p.x, p.y, a);
      });
    }
  }
  // folk centre: a small ring near the middle
  folk.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, i) => {
    const a = (i / Math.max(1, folk.length)) * Math.PI * 2 - Math.PI / 2; const p = wheelPt(a, WHEEL.rFolk); mk(ab, p.x, p.y, a);
  });
  // precursor: outside the ring, spread all the way round (not axis-aligned)
  precursor.sort((a, b) => a.name.localeCompare(b.name)).forEach((ab, i) => {
    const a = (i / Math.max(1, precursor.length)) * Math.PI * 2 - Math.PI / 2; const p = wheelPt(a, WHEEL.rPrecursor); mk(ab, p.x, p.y, a);
  });
  return { idx, order, n, nodes, posOf };
}

/** Classify + collect the KNOWN braids (discoveries) as drawable connections. */
function wheelBraids(model) {
  const idx = model.idx, cat = fullCatalog();
  const out = [];
  for (const d of character.discoveries || []) {
    const parts = (d.abilityIds || []).filter(id => cat[id]);
    if (parts.length < 2) continue;
    const t1 = traditionOf(cat[parts[0]], idx), t2 = traditionOf(cat[parts[1]], idx);
    if (!t1 || !t2) continue;
    let kind = "cross-axis";
    if (antipodeOf(t1, idx) === t2) kind = "cross-pole";
    else if (t1 === t2) kind = "within";
    else if (ringDistance(t1, t2, idx) === 1) kind = "kin";
    out.push({ name: d.name, kind, t1, t2 });
  }
  return out;
}

// SNG-097: learn/deepen a craft directly from the skill wheel/graph selection, and SEE what an
// upgrade grants before spending. Shared by both views — pure over character + CONTENT, so the two
// panels can never drift from each other or from the Level-Up modal (same learnAbility/rankUpAbility).
function skillSelectionActions(ab) {
  if (!ab) return ""; // virtual/emergence node — no real ability to act on
  const rules = CONTENT.rules;
  const sp = character.skillPoints || 0;
  const owned = character.abilities.find(a => a.abilityId === ab.id);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;
  // the tier ladder — what every rank grants (owned = filled, the one you'd buy next = highlighted).
  // THIS is the "what does the upgrade do" the player asked for, made visible on select (not a hover).
  const ladder = (ab.tree || []).map(t => {
    const on = owned && t.rank <= owned.level;
    const isNext = owned ? t.rank === owned.level + 1 : t.rank === 1;
    return `<div class="skill-rung ${on ? "on" : ""} ${isNext ? "next" : ""}"><span class="skill-rung-dot">${on ? "●" : "○"}</span> <strong>r${t.rank} ${esc(t.name)}</strong>: ${esc(t.grants || "")}${t.cannot ? ` <span class="skill-rung-cannot">— cannot: ${esc(t.cannot)}</span>` : ""}</div>`;
  }).join("");
  const ladderBlock = ladder ? `<div class="skill-ladder">${ladder}</div>` : "";

  if (owned) {
    // ability-arch v2: depth is earned through use, never bought — show progress, not a buy button.
    const p = rankProgress(character, ab.id);
    return `<div class="skill-actions">${ladderBlock}<span class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</span></div>`;
  }
  // not owned → the learn path (same gate as the Level-Up modal's learnRow)
  const req = learnLevelReq(ab);
  const dv = domainVerdict(ab);
  if (req === null || !dv.allowed) return `<div class="skill-actions">${ladderBlock}<span class="hint">🔒 not open to your domains</span></div>`;
  const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
  const ripe = aspirationRipe(character, ab.id, rules);
  const cost = character.domains?.primary ? (dv.penalty || 1) : skillPointCost(ab, character, CONTENT.skillCapacity);
  const capBlock = atCapacity(character, CONTENT.skillCapacity) && ab.powerSystem !== "learned";
  const levelOk = character.level >= req;
  const tooPoor = !ripe && sp < cost;
  const blocked = !gate.ok || capBlock || tooPoor || !levelOk;
  return `<div class="skill-actions">${ladderBlock}
    ${blocked
      ? `<span class="hint">🔒 ${!levelOk ? `opens at level ${req}` : !gate.ok ? esc(gate.why) : capBlock ? "at capacity — deepen a craft you know instead" : `need ${cost} point${cost > 1 ? "s" : ""} (you have ${sp})`}</span>`
      : `<button class="btn" data-skilllearn="${esc(ab.id)}">Learn${ripe ? " (free — practiced)" : ` (${cost} pt${cost > 1 ? "s" : ""})`}</button>`}
  </div>`;
}

// Wire the learn/deepen buttons a details panel rendered. `rerender(id, status)` re-opens the same
// view with the node still selected and a status line — used by both wheel and graph.
function wireSkillSelectionActions(rerender) {
  for (const b of app.querySelectorAll("[data-skilllearn]")) b.onclick = () => {
    const id = b.dataset.skilllearn;
    const free = aspirationRipe(character, id, CONTENT.rules);
    const r = learnAbility(character, id, fullCatalog(), CONTENT.rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) { if (free) dropAspiration(character, id); saveCharacter(character); rerender(id, `Learned ${fullCatalog()[id]?.name}${free ? " — no point spent" : ""}.`); }
    else rerender(id, r.why);
  };
  // ability-arch v2: no data-skillrank handler — ranks are no longer bought here; depth is earned
  // through use (rank 2 auto) and a GM-marked defining moment (rank 3).
}

// SNG-129: the node SILHOUETTE for a function family (shape carries the primary family; color retained →
// redundant encoding for accessibility). Returns one SVG element centered at (cx,cy) with "radius" r.
function wheelNodeShape(kind, cx, cy, r, { fill, stroke, sw = 1.5, cls = "" } = {}) {
  const a = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" class="wnode-shape${cls ? " " + cls : ""}"`;
  const poly = pts => `<polygon points="${pts.map(p => `${(cx + p[0]).toFixed(1)},${(cy + p[1]).toFixed(1)}`).join(" ")}" ${a}/>`;
  switch (kind) {
    case "diamond":  return poly([[0, -r * 1.25], [r * 1.15, 0], [0, r * 1.25], [-r * 1.15, 0]]);
    case "triangle": return poly([[0, -r * 1.3], [r * 1.2, r * 0.9], [-r * 1.2, r * 0.9]]);
    case "hexagon":  { const p = []; for (let i = 0; i < 6; i++) { const ang = Math.PI / 6 + i * Math.PI / 3; p.push([Math.cos(ang) * r * 1.2, Math.sin(ang) * r * 1.2]); } return poly(p); }
    case "chevron":  return poly([[-r * 1.1, -r], [r * 0.2, -r], [r * 1.2, 0], [r * 0.2, r], [-r * 1.1, r], [-r * 0.2, 0]]);
    case "cross":    { const t = r * 0.42, R = r * 1.2; return poly([[-t, -R], [t, -R], [t, -t], [R, -t], [R, t], [t, t], [t, R], [-t, R], [-t, t], [-R, t], [-R, -t], [-t, -t]]); }
    case "shield":   return `<path d="M ${cx} ${(cy - r * 1.3).toFixed(1)} L ${(cx + r * 1.1).toFixed(1)} ${(cy - r * 0.5).toFixed(1)} L ${(cx + r * 1.1).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} Q ${cx} ${(cy + r * 1.5).toFixed(1)} ${(cx - r * 1.1).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} L ${(cx - r * 1.1).toFixed(1)} ${(cy - r * 0.5).toFixed(1)} Z" ${a}/>`;
    case "capsule":  { const w = r * 1.5, h = r * 0.95; return `<rect x="${(cx - w).toFixed(1)}" y="${(cy - h).toFixed(1)}" width="${(w * 2).toFixed(1)}" height="${(h * 2).toFixed(1)}" rx="${h.toFixed(1)}" ${a}/>`; }
    case "ring":     return `<circle cx="${cx}" cy="${cy}" r="${(r * 1.15).toFixed(1)}" fill="${fill === "#20242c" ? "#20242c" : "transparent"}" stroke="${stroke}" stroke-width="${(sw + 1).toFixed(1)}" class="wnode-shape${cls ? " " + cls : ""}"/>${fill !== "#20242c" ? `<circle cx="${cx}" cy="${cy}" r="${(r * 0.45).toFixed(1)}" fill="${fill}" stroke="none"/>` : ""}`;
    default:         return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" ${a}/>`;
  }
}

function renderSkillWheel(selectedId = null, status = "") {
  const idx = CONTENT.traditionIndex;
  if (!idx) { renderSkillGraph(selectedId); return; } // no ring loaded → fall back to the list graph
  const m = buildWheelModel();
  const domains = character.domains || {};
  const primary = domains.primary, secondary = domains.secondary;
  const antiP = primary ? antipodeOf(primary, idx) : null, antiS = secondary ? antipodeOf(secondary, idx) : null;
  const S = WHEEL;
  // the 24 tradition nodes on the ring + their spokes
  const ringNodes = m.order.map((t, i) => { const ang = wheelAngle(i, m.n); const p = wheelPt(ang, S.rNode); const st = (idx.stations || []).find(s => s.traditionId === t);
    const closed = t === antiP || t === antiS; const isPrimary = t === primary, isSecondary = t === secondary, isTertiary = t === domains.tertiary;
    const kin = primary && ringDistance(t, primary, idx) === 1;
    return { t, ang, ...p, pole: st?.pole || t, closed, isPrimary, isSecondary, isTertiary, kin }; });
  const braids = wheelBraids(m);
  const centerPt = { x: S.cx, y: S.cy };
  const nodeFor = t => ringNodes.find(r => r.t === t);

  const svg = `<svg id="skill-svg" viewBox="0 0 ${S.size} ${S.size}" class="world-map skill-wheel" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rNode}" class="wheel-ring"/>
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rInner}" class="wheel-inner"/>
    <circle cx="${S.cx}" cy="${S.cy}" r="${S.rFolk + 24}" class="wheel-folk-zone"/>
    <text x="${S.cx}" y="${S.cy - 2}" text-anchor="middle" class="wheel-center-label">FOLK</text>
    <text x="${S.cx}" y="${S.cy + 14}" text-anchor="middle" class="wheel-center-sub">open to all</text>
    <text x="${S.cx}" y="${S.cy - S.rPrecursor - 8}" text-anchor="middle" class="wheel-precursor-label">· PRECURSOR — the substrate, outside the poles ·</text>
    ${/* faint spokes */""}
    ${ringNodes.map(rn => { const inner = wheelPt(rn.ang, S.rInner); return `<line x1="${inner.x}" y1="${inner.y}" x2="${rn.x}" y2="${rn.y}" class="wheel-spoke ${rn.isPrimary ? "primary" : rn.isSecondary ? "secondary" : rn.isTertiary ? "tertiary" : rn.kin ? "kin" : rn.closed ? "closed" : ""}"/>`; }).join("")}
    ${/* antipode: struck through, dark, across the wheel */""}
    ${ringNodes.filter(r => r.closed).map(rn => { const opp = wheelPt(rn.ang, S.rNode + 18); return `<line x1="${S.cx}" y1="${S.cy}" x2="${opp.x}" y2="${opp.y}" class="wheel-strike"/>`; }).join("")}
    ${/* braids — known discoveries only */""}
    ${braids.map(b => { const A = nodeFor(b.t1), B = nodeFor(b.t2); if (!A) return "";
      if (b.kind === "cross-pole" && B) return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wheel-braid cross-pole"><title>${esc(b.name)} — a cross-pole braid: holding an axis whole</title></line>`;
      if (b.kind === "kin" && B) return `<path d="M ${A.x} ${A.y} Q ${S.cx + (A.x + B.x - 2 * S.cx) * 0.7} ${S.cy + (A.y + B.y - 2 * S.cy) * 0.7} ${B.x} ${B.y}" class="wheel-braid kin" fill="none"><title>${esc(b.name)} — a kin braid</title></path>`;
      if (B) return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wheel-braid cross-axis"><title>${esc(b.name)} — a cross-axis braid</title></line>`;
      return ""; }).join("")}
    ${/* tradition ring nodes + pole labels */""}
    ${ringNodes.map(rn => { const lp = wheelPt(rn.ang, S.rNode + 30);
      return `<g class="wheel-trad ${rn.closed ? "closed" : rn.isPrimary ? "primary" : rn.isSecondary ? "secondary" : rn.isTertiary ? "tertiary" : rn.kin ? "kin" : ""}">
        <circle cx="${rn.x}" cy="${rn.y}" r="7" fill="${rn.closed ? "transparent" : traditionColor(rn.t)}" stroke="${traditionColor(rn.t)}"/>
        <text x="${lp.x}" y="${lp.y + 3}" text-anchor="middle" class="wheel-pole-label">${esc(String(rn.pole).slice(0, 12))}</text></g>`; }).join("")}
    ${/* ability nodes — SNG-129: function SHAPES (silhouette = primary family) + precursor SEALED state +
        de-collided labels (owned/selected always; matched added at zoom). */""}
    ${(() => {
      const filterOn = wheelFnFilter.size > 0;
      const zoomed = (graphView?.k || 1) >= 1.25;
      // de-collision: gather label-bearing nodes, greedily nudge overlapping label anchors downward.
      const labelSet = m.nodes.filter(nd => nd.name && (nd.owned || selectedId === nd.id || (zoomed && filterOn && (nd.families || []).some(f => wheelFnFilter.has(f)))));
      const placed = [], labelAt = {};
      for (const nd of labelSet) {
        const lp = wheelPt(nd.ang, wheelTierRadius(nd.levelReq) + 12); let y = lp.y + 2, guard = 0;
        while (guard++ < 40 && placed.some(p => Math.abs(p.x - lp.x) < 44 && Math.abs(p.y - y) < 10)) y += 10;
        placed.push({ x: lp.x, y }); labelAt[nd.id] = { x: lp.x, y };
      }
      return m.nodes.map(nd => {
        const r = 5 + (nd.levelReq - 1) * 1.2;
        const matched = filterOn && (nd.families || []).some(f => wheelFnFilter.has(f));
        const fam = (nd.families || [])[0];
        const sealed = nd.isPrecursor && !nd.precursorUnlocked;   // narrative-locked, NOT tier-locked
        const opened = nd.isPrecursor && nd.precursorUnlocked;
        const fill = nd.owned ? traditionColor(nd.cls) : sealed ? "transparent" : "#20242c";
        const stroke = nd.closed ? "var(--danger)" : traditionColor(nd.cls);
        const cls = `wheel-node ${nd.owned ? "owned" : ""} ${nd.closed ? "closed" : ""} ${nd.barred ? "barred" : ""} ${nd.dim ? "dim" : ""} ${nd.isFolk ? "folk" : ""} ${nd.isPrecursor ? "precursor" : ""} ${sealed ? "precursor-sealed" : ""} ${opened ? "precursor-open" : ""} ${selectedId === nd.id ? "selected" : ""} ${filterOn ? (matched ? "fn-match" : "fn-dim") : ""}`;
        const secondaries = (nd.families || []).slice(1, 3);
        const lbl = labelAt[nd.id];
        const title = nd.name + " — " + traditionLabel(nd.cls) + " · Tier " + nd.tier + ((nd.functions || []).length ? " · " + nd.functions.join(", ") : "") + (nd.effCost != null ? " · ⚡" + nd.effCost : "") + (sealed ? " · SEALED (precursor — earned through play, never bought)" : nd.owned ? " (owned)" : nd.closed ? " · CLOSED (your antipode)" : nd.barred ? " · barred" : nd.dim ? " · costs more" : "");
        return `<g class="${cls}" data-wheelnode="${esc(nd.id)}"><title>${esc(title)}</title>
          <circle class="hit" cx="${nd.x}" cy="${nd.y}" r="13"/>
          ${wheelNodeShape(sealed ? "ring" : shapeOfFamily(fam), nd.x, nd.y, r, { fill, stroke, sw: sealed ? 1.3 : 1.5, cls: sealed ? "precursor-seal-shape" : "" })}
          ${sealed ? `<text x="${nd.x}" y="${(nd.y + 3).toFixed(1)}" text-anchor="middle" class="precursor-mark">✦</text>` : opened ? `<text x="${(nd.x + r + 2).toFixed(1)}" y="${(nd.y - r).toFixed(1)}" class="precursor-mark open">✦</text>` : ""}
          ${!sealed && !nd.closed ? secondaries.map((sf, i) => `<circle cx="${(nd.x + r + 2).toFixed(1)}" cy="${(nd.y - r - 1 + i * 4).toFixed(1)}" r="1.9" fill="${FAMILY_COLOR[sf] || "var(--ink-dim)"}" class="wheel-fn-dot"/>`).join("") : ""}
          ${nd.closed ? `<line x1="${nd.x - r - 2}" y1="${nd.y - r - 2}" x2="${nd.x + r + 2}" y2="${nd.y + r + 2}" class="wheel-node-strike"/>` : ""}
          ${lbl ? `<text x="${lbl.x.toFixed(1)}" y="${lbl.y.toFixed(1)}" text-anchor="middle" class="wheel-node-label ${nd.owned ? "owned" : ""}">${esc(String(nd.name).slice(0, 16))}${nd.effCost != null && (nd.owned || nd.reachable) ? ` ⚡${nd.effCost}` : ""}</text>` : ""}
        </g>`;
      }).join("");
    })()}
  </g></svg>`;

  const sel = selectedId ? m.nodes.find(nd => nd.id === selectedId) : null;
  const selAb = sel ? fullCatalog()[sel.id] : null;
  const gateLine = sel ? (sel.closed ? "🚫 CLOSED — your antipode; only a cross-pole braid crosses it"
    : sel.band === "primary" ? "✦ your primary domain — all tiers, no penalty"
    : sel.band === "adjacent" ? (sel.allowed ? "free — kin of your primary (no capstones)" : "🔒 near a people is not being of them — no capstones")
    : sel.band === "secondary" ? (sel.allowed ? "your secondary — up to Tier III" : "🔒 your secondary tops out at Tier III")
    : sel.band === "tertiary" ? (sel.allowed ? "your tertiary — up to Tier II" : "🔒 your tertiary tops out at Tier II")
    : sel.band === "folk" ? "open — a folk craft of the Valley"
    : sel.band === "far" ? `costs more — ${sel.penalty}× skill points, ${Math.max(2, sel.penalty)} steps out`
    : "learnable") : "";
  const sealedSel = sel && sel.isPrecursor && !sel.precursorUnlocked; // SNG-129: narrative-locked precursor
  const details = sel ? `<div class="map-details">
    <div class="map-details-head"><h3>${esc(sel.name)}</h3>
      <span class="rep-band" style="border-color:${traditionColor(sel.cls)};color:${traditionColor(sel.cls)}">${esc(traditionLabel(sel.cls))} · Tier ${sel.tier}</span>
      ${sel.owned ? `<span class="rep-band trusted">owned</span>` : sealedSel ? `<span class="rep-band" style="border-color:var(--accent);color:var(--accent)">✦ sealed</span>` : ""}</div>
    <div class="hint">${sealedSel ? "✦ a precursor craft of the substrate — outside the poles" : esc(gateLine)}${!sealedSel && sel.effCost != null ? ` · ⚡${sel.effCost} energy${selAb?.energyCost && sel.effCost !== selAb.energyCost ? ` (base ${selAb.energyCost})` : ""}` : ""}</div>
    ${(selAb?.functions || []).length ? `<div style="margin:4px 0">${functionChips(selAb)}</div>` : ""}
    <p class="map-details-desc">${esc(selAb?.description || "")}</p>
    ${selAb?.notFor ? `<div class="hint"><em>cannot: ${esc(selAb.notFor)}</em></div>` : ""}
    ${sealedSel
      ? `<div class="precursor-seal-note">Precursor crafts aren't taught or bought. <strong>A door opens only when the fiction earns it</strong> — walking the Old Roads, a precursor-touched teacher, a discovery in play. There's no button; keep playing toward it, and one day it may open.</div>`
      : sel.precursorUnlocked ? `<div class="hint" style="color:var(--accent)">✦ a door has opened — this precursor craft was earned, and can be learned.</div>${skillSelectionActions(selAb)}`
      : skillSelectionActions(selAb)}
  </div>` : "";

  chrome(`<div class="screen" style="max-width:980px">
    <h2>The Skill Wheel ${infoDot("circle.what")}</h2>
    <p class="hint" style="margin-bottom:8px">The great circle IS your skill tree. Your <strong>people's spoke</strong> runs out to its capstone; <strong>kin</strong> stand beside you; the <strong>folk crafts</strong> sit at the centre (open to all); <strong>precursor</strong> rings the outside; a <strong>braid you know</strong> draws a line through the middle; and your <strong>antipode is dark, struck through</strong>, across the wheel. Depth = mastery. <strong>Tap a node to learn or deepen it here.</strong> Scroll to zoom, drag to pan.</p>
    ${/* SNG-124 Phase B: function-family filter — tap a family to light up every craft that does it, across all traditions (both axes at once). */""}
    <div class="fn-filter-row">
      <span class="hint" style="margin-right:2px">By function:</span>
      ${FUNCTION_FAMILIES.map(f => `<button class="fn-filter ${familyClass(f)} ${wheelFnFilter.has(f) ? "on" : ""}" data-fnfilter="${f}" title="${f} — highlight every craft that can ${f.toLowerCase()}" style="${wheelFnFilter.has(f) ? `background:${FAMILY_COLOR[f]};color:var(--bg);border-color:${FAMILY_COLOR[f]}` : `color:${FAMILY_COLOR[f]};border-color:${FAMILY_COLOR[f]}`}">${FAMILY_GLYPH[f]} ${f}</button>`).join("")}
      ${wheelFnFilter.size ? `<button class="fn-filter" id="fn-filter-clear" title="Clear the function filter">✕ clear</button>` : ""}
    </div>
    <p class="hint" style="margin-bottom:8px"><span class="grow-badge">${character.skillPoints || 0} skill point${(character.skillPoints || 0) === 1 ? "" : "s"}</span> · ${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity" : ""}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent); margin-bottom:8px">${esc(status)}</div>` : ""}
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
      </div>
      ${svg}
    </div>
    ${details}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn secondary" id="wheel-back">Back</button>
      <button class="btn secondary" id="wheel-list">List view</button>
    </div>
  </div>`);
  wireSkillGraphViewport();
  for (const g of app.querySelectorAll("[data-wheelnode]")) g.onclick = () => {
    if (_graphDidPan) { _graphDidPan = false; return; }
    renderSkillWheel(g.dataset.wheelnode === selectedId ? null : g.dataset.wheelnode);
  };
  // SNG-124 Phase B: toggle a function-family filter (preserves zoom/selection).
  for (const b of app.querySelectorAll("[data-fnfilter]")) b.onclick = () => {
    const f = b.dataset.fnfilter; if (wheelFnFilter.has(f)) wheelFnFilter.delete(f); else wheelFnFilter.add(f);
    renderSkillWheel(selectedId, status);
  };
  const fnClear = document.getElementById("fn-filter-clear"); if (fnClear) fnClear.onclick = () => { wheelFnFilter = new Set(); renderSkillWheel(selectedId, status); };
  wireSkillSelectionActions((id, msg) => renderSkillWheel(id, msg)); // SNG-097: learn/deepen in place
  document.getElementById("wheel-back").onclick = () => { graphView = null; renderCharacterScreen(); };
  document.getElementById("wheel-list").onclick = () => { graphView = null; renderSkillGraph(); };
}

function renderSkillGraph(selectedId = null, status = "") {
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

  const svg = `<svg id="skill-svg" viewBox="0 0 ${width} ${height}" class="world-map skill-graph" preserveAspectRatio="xMidYMid meet"><g class="graph-vp">
    ${classes.map((cls, ci) => `<text x="${padX + ci * colW}" y="36" text-anchor="middle" class="graph-class-label" fill="${traditionColor(cls)}">${esc(traditionLabel(cls))}</text>`).join("")}
    ${virtuals.length ? `<text x="${padX + classes.length * colW + 20}" y="36" text-anchor="middle" class="graph-class-label" fill="${classColor("discovery")}">Emergence</text>` : ""}
    ${model.edges.map(e => { const A = pos[e.from], B = pos[e.virtual]; return A && B ? `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="graph-edge ${e.kind}"/>` : ""; }).join("")}
    ${model.nodes.map(n => { const p = pos[n.id]; const r = 6 + (n.levelReq - 1) * 1.5;
      const cls = `graph-node ${n.owned ? "owned" : ""} ${n.ripe ? "ripe" : ""} ${n.aspired ? "aspired" : ""} ${n.locked ? "locked" : ""} ${selectedId === n.id ? "selected" : ""}`;
      return `<g class="${cls}" data-skillnode="${esc(n.id)}"><title>${esc(n.name + " — Tier " + n.tier + " (L" + n.levelReq + ")" + (n.owned ? ", rank " + n.rank : "") + (n.locked ? " 🔒 " + n.lockText : ""))}</title>
        <circle class="hit" cx="${p.x}" cy="${p.y}" r="18"/>
        <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${n.owned ? traditionColor(n.cls) : "#23262e"}" stroke="${traditionColor(n.cls)}"/>
        ${n.locked ? `<text x="${p.x}" y="${p.y - r - 3}" text-anchor="middle" class="graph-lock">🔒</text>` : ""}
        ${n.forks ? `<text x="${p.x - r - 5}" y="${p.y + 4}" text-anchor="middle" class="graph-fork ${n.forkChosen ? "chosen" : ""}">⑂</text>` : ""}
        <text x="${p.x + r + 4}" y="${p.y + 3}" class="graph-node-label ${n.owned ? "owned" : ""}">${esc(n.name)} <tspan class="graph-tier">${n.tier}</tspan></text>
      </g>`; }).join("")}
    ${virtuals.map(vid => { const p = pos[vid]; return `<g class="graph-node virtual" data-skillnode="${esc(vid)}"><title>${esc(recipeName(vid))}</title>
      <rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" transform="rotate(45 ${p.x} ${p.y})" fill="#23262e" stroke="${classColor("discovery")}"/>
      <text x="${p.x + 10}" y="${p.y + 3}" class="graph-node-label">${esc(recipeName(vid))}</text></g>`; }).join("")}
  </g></svg>`;

  const sel = selectedId ? model.nodes.find(n => n.id === selectedId) : null;
  const selAb = sel ? fullCatalog()[sel.id] : null;
  const details = sel ? `<div class="map-details">
    <div class="map-details-head"><h3>${esc(sel.name)}</h3>
      <span class="rep-band" style="border-color:${traditionColor(sel.cls)};color:${traditionColor(sel.cls)}">${esc(traditionLabel(sel.cls))} · Tier ${sel.tier}</span>
      ${sel.owned ? `<span class="rep-band trusted">owned · rank ${sel.rank}</span>` : ""}</div>
    <div class="hint">Level requirement: ${sel.levelReq}${sel.gated ? ` · ${(() => { const g = gateFor(sel.id, CONTENT.attributeGates); return `needs ${g.subAttribute} ${g.learnMin} (rank 3: ${g.rank3Min})`; })()}` : ""}${sel.locked ? ` · 🔒 ${esc(sel.lockText)}` : ""}</div>
    <p class="map-details-desc">${esc(selAb?.description || "")}</p>
    ${sel.forks ? `<div class="codex-fact fork-note"><strong>⑂ Fork at rank ${sel.forkAt}:</strong> ${sel.forkChosen ? `specialized as <em>${esc(sel.forkChosen)}</em> — <span class="fp-cannot">${esc(sel.forkLocked)} locked forever</span>` : "a permanent A-or-B specialization when you rank into it — the path you don't take locks."}</div>` : ""}
    ${skillSelectionActions(selAb)}
  </div>` : "";

  chrome(`<div class="screen" style="max-width:960px">
    <h2>Skill Graph</h2>
    <p class="hint" style="margin-bottom:8px">Every ability by class (color) and Tier I–V (size). Filled = owned. Gold ring = aspired · teal ring = ripe to claim · 🔒 = gated. Diamonds are emergence techniques; lines link their components. <strong>Tap a node to learn or deepen it here.</strong> Scroll to zoom, drag to pan.</p>
    <p class="hint" style="margin-bottom:8px"><span class="grow-badge">${character.skillPoints || 0} skill point${(character.skillPoints || 0) === 1 ? "" : "s"}</span> · ${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity" : ""}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent); margin-bottom:8px">${esc(status)}</div>` : ""}
    <div class="graph-wrap" id="graph-wrap">
      <div class="graph-zoom-ctl">
        <button id="gz-in" title="Zoom in">＋</button>
        <button id="gz-out" title="Zoom out">－</button>
        <button id="gz-fit" title="Fit to view">⤢</button>
      </div>
      ${svg}
    </div>
    ${details}
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn secondary" id="graph-back">Back</button>
      <button class="btn secondary" id="graph-wheel">✦ Wheel view</button>
    </div>
  </div>`);
  wireSkillGraphViewport();
  for (const g of app.querySelectorAll("[data-skillnode]")) g.onclick = (ev) => {
    if (_graphDidPan) { _graphDidPan = false; return; } // a drag-pan, not a select
    renderSkillGraph(g.dataset.skillnode === selectedId ? null : g.dataset.skillnode);
  };
  wireSkillSelectionActions((id, msg) => renderSkillGraph(id, msg)); // SNG-097: learn/deepen in place
  document.getElementById("graph-back").onclick = () => { graphView = null; renderCharacterScreen(); };
  document.getElementById("graph-wheel").onclick = () => { graphView = null; renderSkillWheel(); };
}

// SNG-054 Phase 0: pan/zoom for the skill graph (the fixed viewBox overflowed unusably on
// desktop). Pure viewport work — a transform on the <g class="graph-vp"> group; state persists
// across node-select re-renders (graphView) so zoom isn't lost on click. Fit/reset = identity.
let graphView = null;      // { k, tx, ty } — persisted transform, or null = fit
let _graphDidPan = false;  // suppress a node-select when a drag actually panned

function wireSkillGraphViewport() {
  const svg = document.getElementById("skill-svg");
  const vp = svg?.querySelector(".graph-vp");
  if (!svg || !vp) return;
  const apply = () => { const v = graphView || { k: 1, tx: 0, ty: 0 }; vp.setAttribute("transform", `translate(${v.tx} ${v.ty}) scale(${v.k})`); };
  const clampK = k => Math.max(0.3, Math.min(4, k));
  // convert a client point to the SVG's viewBox coordinate space
  const toSvg = (clientX, clientY) => {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return { x: (clientX - r.left) / r.width * vb.width, y: (clientY - r.top) / r.height * vb.height };
  };
  const zoomAt = (clientX, clientY, factor) => {
    const v = graphView || { k: 1, tx: 0, ty: 0 };
    const p = toSvg(clientX, clientY);
    const k2 = clampK(v.k * factor);
    // keep the point under the cursor fixed: p = (p - t)/k invariant
    graphView = { k: k2, tx: p.x - (p.x - v.tx) * (k2 / v.k), ty: p.y - (p.y - v.ty) * (k2 / v.k) };
    apply();
  };
  svg.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
  // drag to pan (mouse + touch)
  let dragging = false, last = null, moved = 0;
  const down = (x, y) => { dragging = true; last = { x, y }; moved = 0; _graphDidPan = false; };
  const move = (x, y) => {
    if (!dragging) return;
    const r = svg.getBoundingClientRect(); const vb = svg.viewBox.baseVal;
    const dx = (x - last.x) / r.width * vb.width, dy = (y - last.y) / r.height * vb.height;
    moved += Math.abs(x - last.x) + Math.abs(y - last.y);
    const v = graphView || { k: 1, tx: 0, ty: 0 };
    graphView = { k: v.k, tx: v.tx + dx, ty: v.ty + dy };
    last = { x, y }; if (moved > 6) _graphDidPan = true; apply();
  };
  const up = () => { dragging = false; };
  svg.addEventListener("mousedown", e => down(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", up);
  svg.addEventListener("touchstart", e => { if (e.touches[0]) down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  svg.addEventListener("touchmove", e => { if (e.touches[0]) { move(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: true });
  svg.addEventListener("touchend", up);
  const r = svg.getBoundingClientRect();
  document.getElementById("gz-in").onclick = () => zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.25);
  document.getElementById("gz-out").onclick = () => zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.25);
  document.getElementById("gz-fit").onclick = () => { graphView = null; apply(); };
  apply();
}

// ---------- character & inventory screens (SNG-007) ----------

/** SNG-094: the Level-Up window — one place to spend skill points. DEEPEN a craft you know (rank up)
 *  or LEARN a new one (domain-gated, explained), with the SNG-084 helper text woven in. Stays open so
 *  a player with several points spends them in a row. Replaces hunting the sidebar's scattered ▲ + the
 *  collapsed "Learn" groups. */
function renderLevelUp(status = "") {
  const rules = CONTENT.rules;
  const sp = character.skillPoints || 0;
  const cap = atCapacity(character, CONTENT.skillCapacity);
  const maxRank = rules.leveling?.maxAbilityRank ?? 3;

  // DEEPEN: owned abilities, showing what a rank costs / grants / why it's blocked
  const rankRows = character.abilities.map(a => ({ a, ab: fullCatalog()[a.abilityId] })).filter(x => x.ab).map(({ a, ab }) => {
    const rankCost = skillPointCost(ab, character, CONTENT.skillCapacity);
    const nextReq = rules.leveling?.rankLevelReq?.[String(a.level + 1)];
    const atMax = a.level >= maxRank;
    const levelOk = character.level >= (nextReq ?? 1);
    const practiced = practiceRankReady(character, a.abilityId, rules) && !atMax && levelOk;
    const canRank = !atMax && levelOk && (sp >= rankCost || practiced);
    const now = rankExpression(character, ab, a.level, CONTENT.branchForks) || ab.tree?.find(t => t.rank === a.level);
    const next = ab.tree?.find(t => t.rank === a.level + 1);
    return { a, ab, rankCost, atMax, levelOk, practiced, canRank, now, next };
  });

  // LEARN: everything the domain gate opens that you don't yet know (SNG-094 gate)
  const learnable = Object.values(CONTENT.abilities).filter(ab => {
    if (character.abilities.some(a => a.abilityId === ab.id)) return false;
    const req = learnLevelReq(ab);
    if (req === null || character.level < req) return false;
    return domainVerdict(ab).allowed;
  });
  const byTrad = {};
  for (const ab of learnable) { const k = abilityTradition(ab) || ab.powerSystem || "folk"; (byTrad[k] = byTrad[k] || []).push(ab); }

  const learnRow = ab => {
    const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
    const dv = domainVerdict(ab);
    const ripe = aspirationRipe(character, ab.id, rules);
    const cost = character.domains?.primary ? (dv.penalty || 1) : skillPointCost(ab, character, CONTENT.skillCapacity);
    const tooPoor = !ripe && sp < cost;
    const capBlock = cap && ab.powerSystem !== "learned";
    const blocked = !gate.ok || capBlock || tooPoor;
    const r1 = ab.tree?.find(t => t.rank === 1);
    const band = dv.band === "far" ? " · far" : dv.band === "adjacent" ? " · kin" : dv.band === "accord" ? " · open" : "";
    return `<div class="cs-ability ${blocked ? "locked" : ""}">
      <div><span class="tier-badge">${tierOf(ab.levelReq)}</span> <strong>${esc(ab.name)}</strong> <span class="hint">L${ab.levelReq || 1}${band}${cost > 1 ? ` · ${cost} pts` : ""}${ripe ? " · practiced (free)" : ""}</span></div>
      <div class="hint">${esc((r1 ? r1.grants : ab.description) || "").slice(0, 130)}</div>
      ${blocked
        ? `<span class="hint">🔒 ${!gate.ok ? esc(gate.why) : capBlock ? "at capacity — deepen instead" : "need " + cost + " point" + (cost > 1 ? "s" : "")}</span>`
        : `<button class="btn" data-lvllearn="${esc(ab.id)}">Learn${ripe ? " (free)" : ` (${cost} pt${cost > 1 ? "s" : ""})`}</button>`}
    </div>`;
  };

  chrome(`<div class="screen" style="max-width:720px">
    <h2>⬆ Level Up ${infoDot("ability.ranks")}</h2>
    <p class="hint" style="margin-bottom:10px">You have <strong>${sp} skill point${sp === 1 ? "" : "s"}</strong> — points <strong>learn new crafts</strong> (breadth). <strong>Depth is earned through use</strong>, not bought. <span class="cap-line">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} crafts${cap ? " — at capacity" : ""}</span> ${infoDot("lock.capacity")}</p>
    ${status ? `<div class="cs-block" style="border-left:3px solid var(--accent)">${esc(status)}</div>` : ""}

    ${(() => { // SNG-124: "Suggested for you" — recommend skills that fill FUNCTION-COVERAGE gaps / suit your
      // build / are ripe. Reads the same learnable set below; each suggestion learns in place (data-lvllearn).
      const cov = functionCoverage(character, fullCatalog(), FN_INDEX);
      const suggestions = recommendSkills(character, learnable, {
        fnIndex: FN_INDEX, traditionIndex: CONTENT.traditionIndex, catalog: fullCatalog(),
        ripe: new Set(learnable.filter(ab => aspirationRipe(character, ab.id, rules)).map(ab => ab.id)),
        effectiveCost: ab => effectiveEnergyCost(ab, character, rules), max: 4
      });
      if (!suggestions.length) return "";
      const gap = cov.missing.length ? `Your kit has no <strong>${cov.missing.join(", ")}</strong> yet — gaps worth filling.` : `Your kit already touches all ${cov.covered.length} function families.`;
      return `<div class="cs-block sug-block"><h3 class="codex-title" style="font-size:15px">Suggested for you <span class="hint" style="text-transform:none">— what would round out your kit</span></h3>
        <div class="hint" style="margin-bottom:6px">${gap}</div>
        ${suggestions.map(s => { const ab = fullCatalog()[s.abilityId]; return `<div class="cs-ability sug-row">
          <div><strong>${esc(s.name)}</strong> ${functionChips(ab)}${s.cost != null ? ` <span class="hint" title="energy to use (effective)">⚡${s.cost}</span>` : ""}</div>
          <div class="hint">✦ ${esc(s.why)}</div>
          <button class="btn" data-lvllearn="${esc(s.abilityId)}">Learn</button>
        </div>`; }).join("")}
      </div>`;
    })()}

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Your crafts ${infoDot("ability.ranks")} <span class="hint" style="text-transform:none">— depth is earned through use, not points</span></h3>
      ${rankRows.map(r => { const p = rankProgress(character, r.a.abilityId); return `<div class="cs-ability">
        <div><strong>${esc(r.ab.name)}</strong> <span class="cs-ranks">${[1, 2, 3].map(n => `<span class="${n <= r.a.level ? "cs-rank-on" : "cs-rank-off"}">${n <= r.a.level ? "●" : "○"}</span>`).join("")}</span> <span class="hint">${r.now ? esc(r.now.name) : ""}</span></div>
        ${r.next ? `<div class="hint">→ ${esc(r.next.name)}: ${esc(r.next.grants || "")}</div>` : ""}
        <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div>
      </div>`; }).join("") || "<div class='insight'>no crafts yet — learn one below</div>"}
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Learn a new craft ${infoDot("circle.domains")} <span class="hint" style="text-transform:none">— broaden into your domains</span></h3>
      ${cap ? `<div class="hint" style="margin-bottom:6px">You're at capacity — new points now deepen what you know. ${infoDot("lock.capacity")}</div>` : ""}
      ${Object.keys(byTrad).length
        ? Object.keys(byTrad).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(k => `<details class="learn-group" ${byTrad[k].some(ab => abilityTradition(ab) === character.domains?.primary) ? "open" : ""}><summary>${esc(traditionLabel(k))} <span class="cost">(${byTrad[k].length})</span></summary>${byTrad[k].sort((a, b) => (a.levelReq || 1) - (b.levelReq || 1)).map(learnRow).join("")}</details>`).join("")
        : "<div class='insight'>nothing new to learn at this level — deepen a craft, or play on to reach the next tier</div>"}
    </div>

    <button class="btn secondary" id="lvl-back">Done</button>
  </div>`);

  // ability-arch v2: no data-lvlrank handler — depth is earned through use, not bought.
  for (const b of app.querySelectorAll("[data-lvllearn]")) b.onclick = () => {
    const id = b.dataset.lvllearn;
    const free = aspirationRipe(character, id, rules);
    const r = learnAbility(character, id, fullCatalog(), rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
    if (r.ok) { if (free) dropAspiration(character, id); saveCharacter(character); renderLevelUp(`Learned ${fullCatalog()[id]?.name}${free ? " — no point spent" : ""}.`); }
    else renderLevelUp(r.why);
  };
  document.getElementById("lvl-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

/** SNG-118: play-style as tight, tappable aptitude chips (replacing the prose wall). Each chip is colored by
 *  axis (earned / amorous / inverse), dimmed when FADING (SNG-113 "loss is legible"), and border-marked for a
 *  lineage grant. Tap → the one popover surface shows its effect + description + mods. Scales with the roster. */
function aptitudeChips() {
  const held = (CONTENT.rules.playerAptitudes || []).filter(a => character.aptitudes?.includes(a.id));
  if (!held.length) return `<span class="insight">No marked tendencies yet — play a while and who you are will show.</span>`;
  const fading = fadingAptitudes(character, CONTENT.rules.playerAptitudes, CONTENT.rules);
  const lineage = new Set(character.grantedAptitudes || []);
  return `<div class="aptitude-chips">${held.map(a => {
    const name = a.id.replace(/_/g, " ");
    const isFading = fading.has(a.id), isLineage = lineage.has(a.id);
    const modLine = Object.entries(a.mods || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase().trim()} ${v > 0 ? "+" : ""}${v}`).join(", ");
    const detail = `${name}${isLineage ? " · lineage" : ""}${isFading ? " · fading" : ""}\n${a.description || ""}${modLine ? `\n\n${modLine}` : ""}`;
    return `<button class="aptitude-chip axis-${esc(a.axis || "earned")}${isFading ? " fading" : ""}${isLineage ? " lineage" : ""}" data-aptchip="${esc(detail)}" title="tap for detail">${esc(name)}${isFading ? " ⌁" : ""}</button>`;
  }).join("")}</div>`;
}

function renderCharacterScreen() {
  const rules = CONTENT.rules;
  const cap = rules.leveling?.subAttributeCap ?? 20;
  const soft = rules.baseChance?.attributeSoftCap ?? 4;
  const b = character.bio || {};
  const xpNeed = character.level * (rules.leveling?.xpPerLevel ?? 100);
  const galleryCount = (character.gallery || []).length;
  chrome(`<div class="screen" style="max-width:760px">
    <div class="cs-header">
      ${character.portrait ? `<img class="cs-portrait" src="${esc(character.portrait)}" alt="${esc(character.name)}" data-lightbox="portrait" onerror="this.style.display='none'">` : ""}
      <div class="cs-header-text">
        <h2 style="margin:0">${esc(character.name)}</h2>
        <div class="hint">${esc(character.origin)} · ${esc(character.background)} · level ${character.level} — ${character.xp}/${xpNeed} xp ${infoDot("growth.level")}${character.pendingSubPoints ? ` · <span class="grow-badge">+${character.pendingSubPoints} attribute</span>` : ""}${character.skillPoints ? ` · <span class="grow-badge">${character.skillPoints} skill</span>` : ""}</div>
        ${character.form ? `<div class="hint" style="margin-top:4px"><em>Form:</em> ${esc(character.form)}</div>` : ""}
        <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap">
          <button class="opt" id="cs-form" title="Describe this character's physical form / species so the portrait renders it (e.g. an Ent, a construct)">✎ Appearance</button>
          ${imagesEnabled() && !character.portrait ? `<button class="opt" id="cs-gen-portrait">✦ Generate portrait</button>` : ""}
          ${imagesEnabled() && character.portrait ? `<button class="opt" id="cs-regen-portrait" title="Re-mint the portrait">↻ New portrait</button>` : ""}
          <button class="opt" id="cs-gallery">🖼 Gallery${galleryCount ? ` (${galleryCount})` : ""}</button>
        </div>
      </div>
    </div>
    ${Object.values(b).some(v => v) ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Story</h3>
      ${["hometown", "residence", "livelihood", "hobbies", "motivation"].filter(k => b[k]).map(k => `<div class="codex-fact"><strong style="text-transform:capitalize">${k}:</strong> ${esc(b[k])}</div>`).join("")}
      ${(() => { // SNG-134 P1: the story EVOLVES — show the lived "story so far" (SNG-109 paragraph) once it
        // exists; the creation seed is the first line, superseded as deeds accrue (not frozen forever).
        const lived = character.chronicleCache?.text;
        return lived ? `<p class="map-details-desc" style="margin-top:8px">${esc(lived)}</p><div class="hint">— your story so far, as it has grown</div>`
          : (b.story ? `<p class="map-details-desc" style="margin-top:8px">${esc(b.story)}</p>` : ""); })()}</div>` : ""}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Attributes ${infoDot("growth.attributes")} <span class="hint" style="text-transform:none">(knee at ${soft}: full value to there, +5/point beyond, cap ${cap})</span></h3>
      ${SUBS.map(sub => { const v = character.subAttributes?.[sub] ?? 0; return `
        <div class="cs-attr"><span class="cs-attr-name" title="${esc(SUB_DESC[sub])}">${sub}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, v / cap * 100)}%"></div><div class="cs-knee" style="left:${soft / cap * 100}%"></div></div>
          <span class="cs-val">${v}</span>
          ${character.pendingSubPoints > 0 && v < cap ? `<button class="grow-btn" data-grow2="${sub}">+</button>` : ""}
        </div>`; }).join("")}</div>
    ${character.domains?.primary ? (() => {
      // SNG-101/102: the great-circle domains you hold — station, ceiling, promotions, foreclosures.
      const ROM = ["", "I", "II", "III", "IV", "V"];
      const ceilOf = (t, def) => character.domainCeilings?.[t] ?? def;
      const rows = [["primary", 5], ["secondary", 3], ["tertiary", 2]].filter(([k]) => character.domains?.[k]).map(([k, def]) => {
        const t = character.domains[k]; const c = ceilOf(t, def); const promoted = character.domainCeilings?.[t] != null && c > def;
        return `<div class="codex-fact"><strong>${esc(traditionLabel(t))}</strong> — ${k}${promoted ? " · <em>promoted</em>" : ""}, to Tier ${ROM[c]}</div>`;
      }).join("");
      const acq = (character.domainsAcquired || []).map(t => `<div class="codex-fact"><strong>${esc(traditionLabel(t))}</strong> — acquired, to Tier ${ROM[ceilOf(t, 1)]}</div>`).join("");
      const fore = (character.foreclosed || []).length ? `<div class="hint">Foreclosed — reachable only as a braid: ${character.foreclosed.map(traditionLabel).join(", ")}</div>` : "";
      const promos = ["tertiary", "secondary"].map(k => {
        if (!character.domains?.[k]) return ""; const e = promotionEligible(character, k, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
        if (!e.eligible) return ""; return `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>✦ You may rise:</strong> become ${esc(traditionLabel(e.trad))} as your ${e.to} <button class="grow-btn practiced" data-promote="${k}">Promote…</button></div>`;
      }).join("");
      // SNG-102: a new people you may JOIN — any tradition you have a willing teacher for that's acquirable
      // (plus a GM-offered one). The teacher is the gate, so the candidate set is bounded.
      const acqTargets = [...new Set([...(character.pendingAcquisition ? [character.pendingAcquisition] : []), ...Object.keys(character.teachers || {})])];
      const acqs = acqTargets.filter(t => acquirable(character, t, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex }).ok)
        .map(t => `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>✦ You may join:</strong> become of the ${esc(traditionLabel(t))} (enters at Tier I) <button class="grow-btn practiced" data-acquire="${esc(t)}">Join…</button></div>`).join("");
      return `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Domains ${infoDot("circle.domains")}</h3>${rows}${acq}${fore}${promos}${acqs}</div>`;
    })() : ""}
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Abilities ${infoDot("ability.tiers")} <span class="cap-line" style="text-transform:none">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${atCapacity(character, CONTENT.skillCapacity) ? " — at capacity; new points learn other crafts" : ""}</span>${atCapacity(character, CONTENT.skillCapacity) ? infoDot("lock.capacity") : ""}</h3>
      ${character.pendingMasteryFork ? (() => { const fb = fullCatalog()[character.pendingMasteryFork]; return `<div class="cs-ability" style="border-left:3px solid var(--accent)"><strong>⑂ A defining moment for ${esc(fb?.name || character.pendingMasteryFork)}</strong> — choose its path to master it. <button class="grow-btn practiced" data-masteryfork="${esc(character.pendingMasteryFork)}">Choose path</button></div>`; })() : ""}
      ${character.abilities.map(a => { const ab = fullCatalog()[a.abilityId]; if (!ab) return ""; const cost = effectiveEnergyCost(ab, character, rules);
        const p = rankProgress(character, a.abilityId);
        return `<div class="cs-ability"><span class="tier-badge">${tierOf(ab.levelReq)}</span> <strong>${esc(ab.name)}</strong> <span class="hint">(${ab.powerSystem === "learned" ? "learned" : ab.powerSystem}) · ${cost} energy${cost < ab.energyCost ? ` (was ${ab.energyCost})` : ""}</span>
          <span class="cs-ranks">${[1, 2, 3].map(r => `<span class="${r <= a.level ? "cs-rank-on" : "cs-rank-off"}" title="${esc(ab.tree?.[r - 1]?.name || "")}">${r <= a.level ? "●" : "○"}</span>`).join("")}</span>
          ${ab.tree?.[a.level - 1] ? `<div class="hint">${esc(ab.tree[a.level - 1].name)}: ${esc(ab.tree[a.level - 1].grants)}</div>` : ""}
          <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div></div>`; }).join("")}
      ${(character.discoveries || []).map(d => `<div class="discovery" title="${esc(d.description)}">✦ ${esc(d.name)} (discovered technique)</div>`).join("")}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Aspirations <span class="hint" style="text-transform:none">(declare what you're working toward — practice makes it free)</span></h3>
      ${(character.practice?.aspirations || []).map(a => { const ab = fullCatalog()[a.abilityId]; const ripe = aspirationRipe(character, a.abilityId, rules); const need = rules.practice?.aspirationRipe ?? 10;
        return `<div class="cs-attr"><span class="cs-attr-name" style="width:140px">${esc(ab?.name || a.abilityId)}</span>
          <div class="cs-bar"><div class="cs-fill" style="width:${Math.min(100, (a.progress || 0) / need * 100)}%"></div></div>
          <span class="cs-val">${Math.min(a.progress || 0, need)}/${need}</span>
          ${ripe && character.level >= (learnLevelReq(ab) ?? 99) ? `<button class="grow-btn practiced" data-asplearn="${esc(a.abilityId)}" title="Fully practiced — learn free">✓</button>` : ""}
          <button class="grow-btn" data-aspdrop="${esc(a.abilityId)}" title="Drop aspiration" style="background:var(--panel2); color:var(--ink-dim)">×</button>
        </div>`; }).join("") || "<div class='insight'>none declared</div>"}
      ${(character.practice?.aspirations || []).length < (rules.practice?.maxAspirations ?? 2) ? `
        <select id="asp-pick" style="margin-top:6px; max-width:280px">
          <option value="">Aspire toward…</option>
          ${Object.values(fullCatalog()).filter(ab => !character.abilities.some(a => a.abilityId === ab.id) && learnLevelReq(ab) !== null && domainVerdict(ab).allowed && !(character.practice?.aspirations || []).some(a => a.abilityId === ab.id)).map(ab => `<option value="${esc(ab.id)}">${esc(ab.name)} (${esc(traditionLabel(abilityTradition(ab) || ab.powerSystem))}, lv ${learnLevelReq(ab)})</option>`).join("")}
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
      ${aptitudeChips()}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Active quests ${infoDot("quest.routes")}</h3>
      ${(character.quests || []).filter(q => q.status === "active").map(q => `<div class="codex-fact"><strong>${esc(q.title)}</strong> — ${esc(q.progress?.slice(-1)[0] || q.summary)}</div>`).join("") || "<div class='insight'>none</div>"}</div>
    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Companions ${infoDot("companion.bond")}</h3>
      ${activeCompanions(character, CONTENT.companions).map(c => `<div class="codex-fact"><strong>${esc(c.name)}</strong> — assists: ${(c.assistTags || []).join(", ")}</div>`).join("") || "<div class='insight'>traveling alone</div>"}</div>
    ${canLevelUp(character) ? `<button class="btn" id="cs-levelup" style="margin-top:10px; margin-right:8px">⬆ Level Up${character.skillPoints ? ` (${character.skillPoints})` : ""}</button>` : ""}
    <button class="btn secondary" id="cs-skillgraph" style="margin-top:10px; margin-right:8px">✦ Skill Wheel</button>
    <button class="btn secondary" id="cs-chronicle" style="margin-top:10px; margin-right:8px" title="The story so far — the deeds, bonds, and standing you've accreted, read back to you">📜 The Chronicle</button>
    <button class="btn secondary" id="cs-repair" style="margin-top:10px; margin-right:8px" title="Fix what the game got wrong at creation — domains, background, form, or an ability you never chose. No arguing with the GM.">🔧 Repair character</button>
    <button class="btn secondary" id="cs-back" style="margin-top:10px">Back</button>
  </div>`);
  for (const btn of app.querySelectorAll("[data-grow2]")) btn.onclick = () => { if (spendSubPoint(character, btn.dataset.grow2, rules)) { saveCharacter(character); renderCharacterScreen(); } };
  // ability-arch v2: mastery of a craft that forks at rank 3 — the GM marked the defining moment; the
  // player chooses the permanent path (Law 9), then the engine lands rank 3.
  for (const btn of app.querySelectorAll("[data-masteryfork]")) btn.onclick = () => {
    const id = btn.dataset.masteryfork;
    renderForkModal(id, (key) => {
      setFork(character, id, key, CONTENT.branchForks);
      autoVerifyLeg("b5-fork", "chose a branch fork — the other path locks");
      const r = markDefiningMoment(character, id, CONTENT.rules, { attributeGates: CONTENT.attributeGates, branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
      if (r.ok) character.pendingMasteryFork = null;
      saveCharacter(character); renderCharacterScreen();
    });
  };
  // SNG-101: promotion — the player commits (Law 9), the modal names the foreclosure cost.
  for (const btn of app.querySelectorAll("[data-promote]")) btn.onclick = () => renderPromotionModal(btn.dataset.promote);
  // SNG-102: acquisition — join a new people (Tier I), forecloses their antipode. Player commits.
  for (const btn of app.querySelectorAll("[data-acquire]")) btn.onclick = () => renderAcquisitionModal(btn.dataset.acquire);
  const aspPick = document.getElementById("asp-pick");
  if (aspPick) aspPick.onchange = () => { if (aspPick.value) { const r = declareAspiration(character, aspPick.value, rules); if (r.ok) { saveCharacter(character); renderCharacterScreen(); } else alert(r.why); } };
  for (const btn of app.querySelectorAll("[data-aspdrop]")) btn.onclick = () => { dropAspiration(character, btn.dataset.aspdrop); saveCharacter(character); renderCharacterScreen(); };
  for (const btn of app.querySelectorAll("[data-asplearn]")) btn.onclick = () => {
    const id = btn.dataset.asplearn;
    const r = learnAbility(character, id, fullCatalog(), rules, { free: true, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
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
  const luBtn2 = document.getElementById("cs-levelup"); if (luBtn2) luBtn2.onclick = () => renderLevelUp();
  const sgBtn = document.getElementById("cs-skillgraph"); if (sgBtn) sgBtn.onclick = () => renderSkillWheel();
  const repBtn = document.getElementById("cs-repair"); if (repBtn) repBtn.onclick = () => renderRepairScreen();
  const chrBtn = document.getElementById("cs-chronicle"); if (chrBtn) chrBtn.onclick = () => renderChronicle();
  // SNG-053 form editor: describe the character's physical form so the portrait renders it
  const formB = document.getElementById("cs-form");
  if (formB) formB.onclick = () => {
    const cur = character.form || "";
    const next = prompt("Describe this character's physical form / species — the portrait leads with this.\n(e.g. \"a towering treefolk of bark and heartwood, moss-bearded, eyes like knots of amber\")", cur);
    if (next === null) return;
    character.form = next.trim() || undefined;
    // a new form means a new portrait — re-mint so the picture matches
    if (imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "reforged" });
    saveCharacter(character);
    renderCharacterScreen();
  };
  // SNG-035 portrait + gallery controls
  const genP = document.getElementById("cs-gen-portrait");
  if (genP) genP.onclick = () => { ensureCharacterPortrait(character); saveCharacter(character); renderCharacterScreen(); };
  const regenP = document.getElementById("cs-regen-portrait");
  if (regenP) regenP.onclick = () => regeneratePortraitFlow();
  const galB = document.getElementById("cs-gallery");
  if (galB) galB.onclick = () => renderGallery();
  document.getElementById("cs-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

/** SNG-110: re-mint the portrait with optional per-generation intent — a one-off scene description
 *  (used for this image only, never persisted over the base appearance) and/or a committed partner
 *  in frame (opt-in, never automatic). The floors still run after every addition. */
function regeneratePortraitFlow() {
  const override = prompt("New portrait — describe this specific scene or look, or leave blank to re-mint from the character as they are.\n(This is used for THIS image only — it doesn't change your saved appearance.)", "");
  if (override === null) return; // cancelled
  const promptOpts = {};
  const one = override.trim();
  if (one) promptOpts.appearanceOverride = one;
  const partners = partnerAdjacentNpcs(character, CONTENT.rules);
  if (partners.length && confirm(`Include ${partners[0].name} (your ${partners[0].label}) in this portrait?`)) {
    const n = character.npcRegistry?.[partners[0].id];
    promptOpts.withCompanion = { name: partners[0].name, appearance: n?.appearance || n?.description || "" };
  }
  ensureCharacterPortrait(character, { force: true, milestone: one || partners.length ? "a portrait you asked for" : `level ${character.level}`, promptOpts });
  saveCharacter(character);
  renderCharacterScreen();
}

/** SNG-035: the Saga gallery — every image this character has accrued (portraits, born-with-image
 *  people/places, moment art), newest first. */
function renderGallery() {
  const gallery = character.gallery || [];
  chrome(`<div class="screen" style="max-width:860px">
    <h2>${esc(character.name)} — Gallery</h2>
    <p class="hint" style="margin-bottom:12px">${imagesEnabled()
      ? "Portraits, people and places you've grown, and the moments worth a picture. New art is added as you play."
      : "Image generation is off. Turn on <strong>Settings → Scene &amp; item art → Generate</strong> to start seeing the world."}</p>
    ${gallery.length ? `<div class="gallery-grid">${gallery.map((g, gi) => `
      <figure class="gallery-item">
        <img src="${esc(g.url)}" alt="${esc(g.caption || g.kind)}" data-lightbox="gallery" data-lbgroup="gallery" data-lbindex="${gi}" loading="lazy" onerror="this.parentElement.style.display='none'">
        <button class="gallery-del" data-galdel="${esc(g.url)}" title="Remove this image">✕</button>
        <figcaption>${esc(g.caption || g.kind)}${character.portrait === g.url ? ` <span class="rep-band trusted">portrait</span>` : ""}${g.worldDay ? ` <span class="hint">· world-day ${g.worldDay}</span>` : ""}</figcaption>
      </figure>`).join("")}</div>`
      : "<div class='insight'>No images yet — a portrait is minted at creation (with art on), and the world fills in as you play.</div>"}
    <button class="btn secondary" id="gal-back" style="margin-top:14px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-galdel]")) b.onclick = () => {
    const url = b.dataset.galdel;
    if (!confirm("Remove this image?")) return;
    const { wasPortrait } = deleteGalleryImage(character, url);
    if (wasPortrait && imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "reforged" }); // never leave the character imageless
    saveCharacter(character);
    renderGallery();
  };
  document.getElementById("gal-back").onclick = () => renderCharacterScreen();
}

/** SNG-085: the Repair panel — expose engine/corrections.js DIRECTLY to the player. A bug the game
 *  gave you (a domain it guessed, an ability off the wrong pole, a background you never chose) must be
 *  fixable WITHOUT negotiating with a language model. Same engine, same guardrails, same ledger as the
 *  GM's in-fiction repair (`applyStateOps`) — it just can't argue. REPAIR, NOT WISH: the engine refuses
 *  anything that ADVANCES (xp/levels/abilities-out-of-domain); power still comes from play. */
function repairLogLine(e) {
  const day = e.worldDay != null ? ` <span class="hint">· world-day ${e.worldDay}</span>` : "";
  let txt;
  switch (e.kind) {
    case "field": txt = `${esc(e.field)}: <s class="hint">${esc(e.from || "—")}</s> → <strong>${esc(e.to || "—")}</strong>`; break;
    case "domain": txt = `${esc(e.field)} domain: <s class="hint">${esc(e.from ? traditionLabel(e.from) : "—")}</s> → <strong>${esc(e.to ? traditionLabel(e.to) : "—")}</strong>`; break;
    case "remove": txt = `removed ${esc(e.entity)} <strong>${esc(e.id)}</strong>`; break;
    case "quest": txt = `quest ${esc(e.id)} → <strong>${esc(e.to?.status || "?")}</strong>`; break;
    case "location": txt = `re-anchored → <strong>${esc(e.to)}</strong>`; break;
    case "codexFact": txt = `codex fact ${esc(e.id)} corrected`; break;
    case "abilityRank": txt = `${esc(e.id)} rank: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "bond": txt = `relationship with ${esc(e.id)} set right`; break;
    case "vital": txt = `${esc(e.field)}: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "attribute": txt = `${esc(e.field)}: <s class="hint">${esc(String(e.from))}</s> → <strong>${esc(String(e.to))}</strong>`; break;
    case "merge": txt = `merged a duplicate record into <strong>${esc(e.into)}</strong>`; break;
    default: txt = "corrected";
  }
  return `<div class="codex-fact">${txt}${day}${e.why ? `<div class="hint">${esc(e.why)}</div>` : ""}</div>`;
}

function renderRepairScreen(note = "") {
  const idx = CONTENT.traditionIndex;
  const origins = CONTENT.origins?.length ? CONTENT.origins : originsFallback();
  const dom = character.domains || { primary: null, secondary: null, tertiary: null };
  const cap = breadthCap(character, CONTENT.skillCapacity);
  const used = breadthUsed(character);
  // every real tradition, ring order, for the three domain slots (+ "leave empty")
  const tradOptions = (sel) => `<option value="">— none —</option>` +
    (idx ? ringOrder(idx).map(t => `<option value="${esc(t)}" ${sel === t ? "selected" : ""}>${esc(traditionLabel(t))}</option>`).join("") : "");
  const log = (character.corrections || []).slice().reverse();
  const anomalies = detectAnomalies(character, { rules: CONTENT.rules }); // SNG-137: cheap consistency check, advisory
  chrome(`<div class="screen" style="max-width:720px">
    <h2>🔧 Repair ${esc(character.name)}</h2>
    <p class="hint" style="margin-bottom:6px">Fix what the game got wrong when this character was made — no arguing with the GM. Every change is validated, logged, and reversible.</p>
    <p class="hint" style="margin-bottom:14px"><strong>Repair, not wish:</strong> you can correct data that is <em>wrong</em>, but nothing here grants power — xp, levels, and abilities still come from play. Stripping an ability you never chose is a repair, not a loss; it frees your breadth so you can re-pick with your own skill points.</p>
    ${note ? `<div class="cs-block" style="border-left:3px solid var(--accent)"><div style="white-space:pre-wrap">${esc(note)}</div></div>` : ""}

    ${anomalies.length ? `<div class="cs-block" style="border-left:3px solid #c0392b">
      <h3 class="codex-title" style="font-size:15px">⚠ Issues the game spotted <span class="hint" style="text-transform:none">— ${anomalies.length}</span></h3>
      <p class="hint" style="margin-bottom:8px">These look like data that drifted. Tick to fix, then Apply — each is a <strong>repair</strong> (two records merged into one, a vital re-synced to its max, or a rank set back to what practice earned), never a loss of anything you earned.</p>
      ${anomalies.map((an, i) => `<label class="rating-check"><input type="checkbox" data-fix="${i}" checked> ${esc(an.note)}${an.kind === "rankOverPractice" ? ` <span class="hint">(→ rank ${an.suggestRank})</span>` : ""}</label>`).join("")}
    </div>` : ""}

    <div class="field"><label>Why this repair (optional — recorded in the log)</label>
      <input id="rp-why" placeholder="e.g. I was meant to be an Ashwarden, not a Wright"></div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Your people &amp; craft</h3>
      <div class="field"><label>Origin (your people)</label>
        <select id="rp-origin">${origins.map(o => `<option value="${esc(o.id)}" ${character.origin === o.id ? "selected" : ""}>${esc(o.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Background</label>
        <select id="rp-bg">${backgroundOptionsHTML(character.background)}</select></div>
      <div class="field"><label>Form (physical description — leads the portrait)</label>
        <input id="rp-form" value="${esc(character.form || "")}" placeholder="e.g. a lean woman with ash-grey braids and a mourner's shawl"></div>
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Domains <span class="hint" style="text-transform:none">— the poles you draw from</span></h3>
      <p class="hint" style="margin-bottom:8px">Changing a domain re-sets which crafts you can <em>learn next</em>. Abilities you already hold are kept (grandfathered) — use the strip list below to remove ones you should never have had.</p>
      ${["primary", "secondary", "tertiary"].map(slot => `
        <div class="field"><label style="text-transform:capitalize">${slot} domain</label>
          <select id="rp-dom-${slot}">${tradOptions(dom[slot])}</select></div>`).join("")}
    </div>

    <div class="cs-block"><h3 class="codex-title" style="font-size:15px">Strip an ability you never chose <span class="cap-line" style="text-transform:none">${used} of ${cap} breadth used</span></h3>
      <p class="hint" style="margin-bottom:8px">Tick any ability the game gave you that belongs to the wrong pole. Stripping it frees breadth so you can pick your own — you do <em>not</em> lose earned power, and your skill points are untouched.</p>
      ${character.abilities.length ? character.abilities.map(a => { const ab = fullCatalog()[a.abilityId]; return `
        <label class="rating-check"><input type="checkbox" data-strip="${esc(a.abilityId)}"> Strip <strong>${esc(ab?.name || a.abilityId)}</strong> <span class="hint">${ab ? `(${esc(abilityTradition(ab) ? traditionLabel(abilityTradition(ab)) : ab.powerSystem)}, rank ${a.level})` : ""}</span></label>`; }).join("") : "<div class='insight'>no abilities to strip</div>"}
    </div>

    ${activeCompanions(character, CONTENT.companions).length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Remove a companion you never met</h3>
      ${activeCompanions(character, CONTENT.companions).map(c => `
        <label class="rating-check"><input type="checkbox" data-rmcomp="${esc(c.id)}"> Remove <strong>${esc(c.name)}</strong></label>`).join("")}
    </div>` : ""}

    ${(character.quests || []).length ? `<div class="cs-block"><h3 class="codex-title" style="font-size:15px">Unstick a quest</h3>
      <p class="hint" style="margin-bottom:8px">Force a stuck thread to a sane status. Leave "no change" for quests that are fine.</p>
      ${(character.quests || []).map(q => `
        <div class="cs-attr"><span class="cs-attr-name" style="width:auto; flex:1" title="${esc(q.summary || "")}">${esc(q.title || q.id)} <span class="hint">(${esc(q.status || "?")})</span></span>
          <select data-quest="${esc(q.id)}" style="max-width:160px">
            <option value="">no change</option>
            ${["active", "available", "resolved", "failed"].map(s => `<option value="${s}" ${q.status === s ? "disabled" : ""}>${s}</option>`).join("")}
          </select></div>`).join("")}
    </div>` : ""}

    <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap">
      <button class="btn" id="rp-apply">Apply repairs</button>
      <button class="btn secondary" id="rp-back">Back</button>
    </div>

    ${log.length ? `<div class="cs-block" style="margin-top:16px"><h3 class="codex-title" style="font-size:15px">Repair log <span class="hint" style="text-transform:none">(a repair is a fact about your character, not a secret)</span></h3>
      ${log.map(repairLogLine).join("")}</div>` : ""}
  </div>`);

  document.getElementById("rp-back").onclick = () => renderCharacterScreen();
  document.getElementById("rp-apply").onclick = () => {
    const why = (document.getElementById("rp-why").value || "").trim() || "repaired via the Repair panel";
    const ops = [];
    const originVal = document.getElementById("rp-origin").value;
    if (originVal && originVal !== character.origin) ops.push({ op: "correctField", field: "origin", to: originVal, why });
    const bgVal = document.getElementById("rp-bg").value;
    if (bgVal && bgVal !== character.background) ops.push({ op: "correctField", field: "background", to: bgVal, why });
    const formVal = document.getElementById("rp-form").value.trim();
    if (formVal !== (character.form || "")) ops.push({ op: "correctField", field: "form", to: formVal, why });
    for (const slot of ["primary", "secondary", "tertiary"]) {
      const v = document.getElementById("rp-dom-" + slot).value || null;
      if (v !== (dom[slot] || null)) ops.push({ op: "correctDomain", slot, to: v, why });
    }
    for (const cb of app.querySelectorAll("[data-strip]:checked")) ops.push({ op: "removeEntity", kind: "ability", id: cb.dataset.strip, why });
    for (const cb of app.querySelectorAll("[data-rmcomp]:checked")) ops.push({ op: "removeEntity", kind: "companion", id: cb.dataset.rmcomp, why });
    for (const sel of app.querySelectorAll("[data-quest]")) { if (sel.value) ops.push({ op: "unstickQuest", questId: sel.dataset.quest, toStatus: sel.value, why }); }
    // SNG-137: one-click fixes for the anomalies the game spotted — each maps to a repair op
    for (const cb of app.querySelectorAll("[data-fix]:checked")) {
      const an = anomalies[Number(cb.dataset.fix)];
      if (!an) continue;
      if (an.kind === "dupNpc") ops.push({ op: "mergeEntity", fromId: an.fromId, intoId: an.intoId, why });
      else if (an.kind === "rankOverPractice") ops.push({ op: "correctAbilityRank", id: an.abilityId, to: an.suggestRank ?? an.level - 1, why });
      else if (an.kind === "vitalDesync") ops.push({ op: "correctVital", vital: an.vital, to: an.max, why });
    }
    if (!ops.length) { renderRepairScreen("Nothing changed — adjust a field, then Apply."); return; }
    // applyStateOps caps at 6 ops per call by design — chunk so a big repair applies fully.
    const ctx = { backgrounds: CONTENT.backgrounds || [], traditionIndex: CONTENT.traditionIndex, locations: CONTENT.locations, resolveLocationId, worldDay: absoluteWorldDay(), nowISO: new Date().toISOString() };
    const applied = [], refused = [];
    for (let i = 0; i < ops.length; i += 6) { const r = applyStateOps(character, ops.slice(i, i + 6), ctx); applied.push(...r.applied); refused.push(...r.refused); }
    // a new form means a new portrait — re-mint so the picture matches (mirrors the sheet's form editor)
    if (applied.some(a => a.field === "form") && imagesEnabled()) ensureCharacterPortrait(character, { force: true, milestone: "repaired" });
    saveCharacter(character);
    const stripped = applied.filter(a => a.removed === "ability").length;
    let out = applied.length ? "✓ " + applied.map(describeCorrection).join("; ") + "." : "No changes applied.";
    if (stripped) out += ` Your breadth is freed${character.skillPoints > 0 ? ` — spend your ${character.skillPoints} skill point${character.skillPoints === 1 ? "" : "s"} on your own people's crafts in the Character screen` : ""}.`;
    if (refused.length) out += `\n\nRefused: ${refused.map(r => r.reason).join("; ")}.`;
    renderRepairScreen(out);
  };
}

function renderInventoryScreen(openName = null) {
  const kinds = ["weapon", "tool", "consumable", "quest", "misc"];
  chrome(`<div class="screen" style="max-width:680px">
    <h2>Inventory — ${esc(character.name)}</h2>
    ${kinds.filter(k => (character.inventory || []).some(i => i.kind === k)).map(k => `
      <div class="cs-block"><h3 class="codex-title" style="font-size:14px; text-transform:capitalize">${k}s</h3>
      ${(character.inventory || []).filter(i => i.kind === k).map(it => `
        <div class="inv-row">${itemCard(it, { open: openName === it.name, toggleAttr: "data-inv", showPin: true })}</div>`).join("")}</div>`).join("") || "<div class='insight'>empty-handed</div>"}
    <button class="btn secondary" id="inv-back" style="margin-top:10px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-inv]")) b.onclick = () => renderInventoryScreen(openName === b.dataset.inv ? null : b.dataset.inv);
  bindItemCardHandlers(name => renderInventoryScreen(name ?? openName)); // SNG-114: the ONE shared use/name/drop binding
  document.getElementById("inv-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- quest detail ----------

function renderQuestDetail(questId, guidance = null, loading = false) {
  const q = (character.quests || []).find(x => x.id === questId);
  if (!q) { renderPlay(character.activeScene?.lastTurn || null, {}); return; }
  if (q.structured) { renderStructuredQuestDetail(q); return; }
  chrome(`<div class="screen" style="max-width:680px">
    <div class="codex-kind">${esc(q.status)}</div>
    <h2 style="margin-top:4px">${esc(q.title)}</h2>
    <p class="map-details-desc">${esc(q.summary)}</p>
    <div class="hint">${q.giver ? `From ${esc(q.giver)} · ` : ""}started ${q.startedAt ? "day " + esc(String(q.startedAtDay ?? "").trim() || new Date(q.startedAt).toLocaleDateString()) : "a while back"}</div>
    ${q.giverEntityId && character.codex?.topics?.[q.giverEntityId] ? `<button class="codex-link" data-questgiver="${esc(q.giverEntityId)}" style="margin-top:6px">◈ ${esc(character.codex.topics[q.giverEntityId].label)} in Codex</button>` : ""}
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
  const gv = document.getElementById("quest-back")?.parentElement?.querySelector("[data-questgiver]") || app.querySelector("[data-questgiver]");
  if (gv) gv.onclick = () => renderCodexScreen("", gv.dataset.questgiver);
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
      structuredQuestsDetail: structuredQuestsForGM(character, { npcs: CONTENT.npcs }),
      npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: [] }),
      codexDetail: codexForGM(character, { locationId: character.currentLocationId, questTitles: [q.title] })
    }, `Give me practical guidance on my quest "${q.title}": what are 2-3 sensible next steps from where I am, who might help or know more, and roughly how difficult does this look? Spoiler-safe only.`);
    renderQuestDetail(questId, result.ok ? result.text : "The GM stumbled: " + result.error, false);
  };
}

/** SNG-065: a structured quest — stakes, engine-testable stages, the routes this character's
 *  domains open, and branched outcomes that APPLY consequences on resolution. */
function renderStructuredQuestDetail(q) {
  const resolved = q.status !== "active";
  const routes = routesForCharacter(q, character);
  const stageRow = (s, i) => { const done = (q.completedStages || []).includes(s.id); const current = !done && i === (q.stageIndex || 0);
    return `<div class="quest-stage ${done ? "done" : current ? "current" : ""}">
      <div class="quest-stage-obj">${done ? "✓ " : current ? "▶ " : "○ "}${esc(s.objective)}</div>
      <div class="hint">${esc(s.condition)}</div>
      ${done && s.change ? `<div class="codex-fact" style="margin-top:4px">${esc(s.change)}</div>` : ""}
      ${current && !resolved ? `<button class="btn secondary" data-stagedone="${esc(s.id)}" style="margin-top:6px">Mark this stage met</button>` : ""}
    </div>`; };
  chrome(`<div class="screen" style="max-width:720px">
    <div class="codex-kind">${esc(q.status)}${q.tier ? " · " + esc(q.tier) : ""}${q.axis ? " · " + esc(String(q.axis).replace(/_/g, " ↔ ")) : ""}</div>
    <h2 style="margin-top:4px">${esc(q.title)}</h2>
    <p class="map-details-desc">${esc(q.premise)}</p>
    <div class="quest-stakes"><span class="quest-stakes-label">What's at stake</span> ${esc(q.stakes)}</div>
    ${resolved ? `<div class="quest-outcome-banner"><strong>Outcome:</strong> ${esc(q.outcomeName || "resolved")}</div>` : ""}
    <h3 class="codex-title" style="font-size:15px;margin-top:16px">Stages</h3>
    ${q.stages.map(stageRow).join("")}
    <h3 class="codex-title" style="font-size:15px;margin-top:16px">How you might go through it <span class="hint" style="text-transform:none">(your domains open the lit routes)</span></h3>
    ${routes.map(r => `<div class="quest-route ${r.open ? "open" : ""}"><span class="quest-route-trad">${esc(traditionLabel(r.trad))}${r.open ? " ✦" : ""}</span> ${esc(r.text)}</div>`).join("")}
    ${!resolved ? `<h3 class="codex-title" style="font-size:15px;margin-top:16px">Resolve — decide what the truth is for</h3>
      <div class="hint" style="margin-bottom:8px">Every ending is a real ending. What you choose changes the world durably — you'll be able to go back and see it.</div>
      ${q.outcomes.map(o => `<button class="opt quest-outcome-btn" data-outcome="${esc(o.id)}" style="display:block;width:100%;text-align:left;margin:4px 0">
        <strong>${esc(o.name)}</strong><div class="hint" style="text-transform:none">${esc(o.summary)}</div></button>`).join("")}`
    : `<h3 class="codex-title" style="font-size:15px;margin-top:16px">What you did</h3>
      ${((q.outcomes.find(o => o.id === q.outcomeId)?.narration) || (q.outcomes.find(o => o.id === q.outcomeId)?.consequences) || []).map(c => `<div class="codex-fact">${esc(c)}</div>`).join("")}`}
    <button class="btn secondary" id="sq-back" style="margin-top:16px">Back</button>
  </div>`);
  document.getElementById("sq-back").onclick = () => renderQuestLog();
  for (const b of app.querySelectorAll("[data-stagedone]")) b.onclick = () => {
    const r = completeQuestStage(character, q.id, b.dataset.stagedone);
    if (r.ok) { saveCharacter(character); renderStructuredQuestDetail(character.quests.find(x => x.id === q.id)); }
  };
  for (const b of app.querySelectorAll("[data-outcome]")) b.onclick = () => {
    const o = q.outcomes.find(x => x.id === b.dataset.outcome);
    if (!confirm(`Resolve "${q.title}" as “${o.name}”? This is permanent and changes the world.`)) return;
    const day = readClock(character.clock).day;
    const r = resolveStructuredQuest(character, q.id, b.dataset.outcome, {
      worldDay: absoluteWorldDay(), nowISO: new Date().toISOString(),
      liaisonMult: liaisonFactions(character), // SNG-126: a company liaison speeds standing with their people
      // both sinks land the machine-readable effects[] durably: propagating world-events + pinned facts
      recordEvent: ev => applyFactUpdates(character, [{ op: "add", text: ev.text }], { day }),
      recordFact: f => applyFactUpdates(character, [{ op: "add", text: f.text }], { day }),
    });
    if (r.ok) {
      saveCharacter(character);
      const say = a => a.type === "world_event" ? "a ripple spreads through the world"
        : a.type === "disposition" ? `${String(a.people).replace(/_/g, " ")} feel ${a.delta >= 0 ? "warmer" : "colder"} toward you`
        : a.type === "npc_state" ? `${String(a.npc).replace(/_/g, " ")} is ${a.state}`
        : a.type === "ally" ? `${String(a.npc).replace(/_/g, " ")} stands with you`
        : a.type === "location_state" ? "a place changes"
        : a.type === "quest_seed" ? "a new thread opens"
        : a.type === "codex_fact" ? "the record remembers" : null;
      const changes = [...new Set(r.applied.map(say).filter(Boolean))];
      renderPlay(character.activeScene?.lastTurn || null, { aside: `${q.title} — ${o.name} (+${r.xp} xp).${changes.length ? "\n\nWhat changed: " + changes.join("; ") + "." : ""}` });
    } else alert(r.why || "Couldn't resolve.");
  };
}

/** SNG-BATCH-7 Phase 3 + SNG-065: the full quest log — available (startable, structured) /
 *  active / resolved / completed / failed, with stakes + current stage. */
function renderQuestLog() {
  const q = character.quests || [];
  const group = (...sts) => q.filter(x => sts.includes(x.status));
  const stageLabel = x => { if (!x.structured) return x.progress?.length ? x.progress[x.progress.length - 1] : x.summary;
    const s = x.stages?.[x.stageIndex] || x.stages?.[x.stages.length - 1]; return x.status === "active" ? (s?.objective || "resolve") : (x.outcomeName || x.summary || ""); };
  const row = x => `<button class="quest quest-click" data-quest="${esc(x.id)}" style="display:block;width:100%;text-align:left;margin:3px 0">
      <span class="quest-title">${esc(x.title)}</span>${x.structured ? ` <span class="cost">structured${x.axis ? " · " + esc(String(x.axis).replace(/_/g, "↔")) : ""}</span>` : x.giver ? ` <span class="cost">from ${esc(x.giver)}${x.giverEntityId && character.codex?.topics?.[x.giverEntityId] ? " ◈" : ""}</span>` : ""}
      <div class="quest-note">${esc(stageLabel(x))}</div></button>`;
  const section = (title, list) => list.length ? `<div class="codex-group"><div class="codex-group-title">${title} (${list.length})</div>${list.map(row).join("")}</div>` : "";
  // SNG-065/SNG-112: authored quests startable HERE — giver present, at/adjacent to the quest's place, or thread already touched (not bare region).
  const avail = availableStructuredQuests(character, [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])], questOfferContext(character, sceneState));
  const availSection = avail.length ? `<div class="codex-group"><div class="codex-group-title">Available here (${avail.length})</div>${avail.map(def => `
      <div class="quest" style="margin:3px 0">
        <span class="quest-title">${esc(def.name)}</span> <span class="cost">${esc(String(def.axis || "").replace(/_/g, "↔"))}</span>
        <div class="quest-note"><strong>Stakes:</strong> ${esc(String(def.stakes || ""))}</div>${/* SNG-076: authored stakes render IN FULL — the prose IS the game */""}
        <button class="btn" data-startquest="${esc(def.id)}" style="margin-top:6px">Take it on</button>
      </div>`).join("")}</div>` : "";
  chrome(`<div class="screen" style="max-width:680px">
    <h2>Quest Log</h2>
    ${availSection}
    ${q.length ? section("Active", group("active")) + section("Resolved", group("resolved")) + section("Completed", group("completed")) + section("Failed", group("failed"))
      : (availSection ? "" : "<div class='insight'>No undertakings yet — the valley will provide.</div>")}
    <button class="btn secondary" id="ql-back" style="margin-top:12px">Back to the valley</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-quest]")) b.onclick = () => renderQuestDetail(b.dataset.quest);
  for (const b of app.querySelectorAll("[data-startquest]")) b.onclick = () => {
    const def = (CONTENT.quests || []).find(d => (d.id || "").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") === b.dataset.startquest || d.id === b.dataset.startquest);
    const r = startStructuredQuest(character, def, { worldDay: absoluteWorldDay(), nowISO: new Date().toISOString() });
    if (r.ok) { saveCharacter(character); renderQuestDetail(r.quest.id); } else alert(r.why || "Couldn't start that.");
  };
  document.getElementById("ql-back").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- SNG-109: THE CHRONICLE — the accreted self, read back to the player ----------
// One page that WITNESSES what the character's attention has made real: a generated "story so far"
// paragraph (cached, regenerated only on major-state change), major deeds, relationships (SNG-108
// bonds), standing, and the arc. Read-only — the Chronicle displays state, never mutates it. The
// engine assembles the prompt (chronicle.js); app owns the cached model call + the content ceiling.

/** Assemble the display + prompt views from state that already exists. */
function chronicleViewCtx(character) {
  const reg = character.npcRegistry || {};
  const bonds = Object.values(reg)
    .filter(n => (n.bondType && n.bondType !== "platonic") || Math.abs(n.relationship || 0) >= 4)
    .sort((a, b) => Math.abs(b.relationship || 0) - Math.abs(a.relationship || 0))
    .slice(0, 8)
    .map(n => ({ id: n.id, name: n.name, label: relationshipLabel(n) })); // SNG-134: id → the shared name-hover
  const traditions = [character.domains?.primary, character.domains?.secondary, character.domains?.tertiary].filter(Boolean);
  const standing = [];
  for (const t of traditions) { const s = standingWithPeople(character, t, CONTENT.rules); if (s.score) standing.push({ who: traditionLabel(t), band: s.band }); }
  const home = CONTENT.locations?.[character.currentLocationId]?.communityId;
  if (home) { const s = standingWith(character, home, CONTENT.rules); if (s.score) standing.push({ who: CONTENT.locations[character.currentLocationId]?.name || home, band: s.band }); }
  const dshape = traditions.map(traditionLabel).join(" · ");
  const fore = (character.foreclosed || []).length ? ` Foreclosed (braid-only): ${character.foreclosed.map(traditionLabel).join(", ")}.` : "";
  const aim = character.bio?.currentAim || character.bio?.motivation || "";
  const arc = `${aim ? aim + " — " : ""}${dshape}${fore}`.trim();
  return { bonds, standing, arc, ratingLine: ratingLineForGM() };
}

/** Write (or rewrite) the cached "story so far" paragraph. Cached by major-state hash — only regenerates
 *  when the major state changed or the player asks (cost + churn guard). Never per-turn. */
async function ensureChronicleParagraph(force = false) {
  if (!getApiKey()) return;
  if (character._chronicleBusy) return;
  if (!force && !chronicleIsStale(character)) return;
  const { system, user } = buildChroniclePrompt(character, chronicleViewCtx(character));
  character._chronicleBusy = true; character._chronicleError = null; renderChronicle();
  try {
    const text = await callClaude([{ role: "user", content: user }], { task: "chronicle", system });
    character.chronicleCache = { hash: majorStateHash(character), text: String(text || "").trim(), at: new Date().toISOString() };
    saveCharacter(character);
  } catch (e) {
    character._chronicleError = e?.message === "NO_API_KEY" ? "Add your API key in Settings to write the chronicle." : "Couldn't write the chronicle just now — try again.";
  } finally {
    character._chronicleBusy = false; renderChronicle();
  }
}

function renderChronicle() {
  const cache = character.chronicleCache;
  const stale = chronicleIsStale(character);
  const deeds = majorDeeds(character, 8);
  const ctx = chronicleViewCtx(character);
  // SNG-128: the World-Authorship readout + per-session log + the family comparison.
  const auth = authorshipStats(character, CONTENT);
  const sessions = sessionLog(character);
  const myKey = profile?.playerKey;
  // Family compare: YOUR characters always (they're yours), plus other players' characters only if that
  // player opted in (privacy — a chronicle is private until shared). Only shown when 2+ are visible.
  let family = [];
  try {
    const loaded = listCharacters().map(e => (e.id === character.id ? character : loadCharacter(e.id))).filter(Boolean);
    const visible = loaded.filter(c => c.playerKey === myKey || loadProfile(c.playerKey)?.sharedChronicle);
    family = crossCharacterAuthorship(visible, CONTENT);
  } catch { /* family view is best-effort */ }
  const nameOfPlayer = pk => { try { return loadProfile(pk)?.displayName || pk; } catch { return pk; } };
  const paraHtml = character._chronicleBusy
    ? `<div class="insight">writing your story…</div>`
    : cache?.text
      ? `<p class="chronicle-para">${esc(cache.text)}</p>${stale ? `<div class="hint">the story has moved on since this was written — regenerate to catch it up</div>` : ""}`
      : `<div class="insight">${getApiKey() ? "Your story is just beginning — generate the chronicle to read it." : "Add your API key in Settings to write the chronicle."}</div>`;
  chrome(`<div class="screen" style="max-width:680px">
    <h2>The Chronicle</h2>
    ${character.portrait ? `<img class="cs-portrait" src="${esc(character.portrait)}" alt="${esc(character.name)}" data-lightbox="portrait" onerror="this.style.display='none'">` : ""}
    <h3 style="margin-top:6px">${esc(character.name)}${character.level ? ` · level ${character.level}` : ""}</h3>
    ${character._chronicleError ? `<div class="hint">${esc(character._chronicleError)}</div>` : ""}
    <section><h3>The story so far</h3>
      ${paraHtml}
      ${getApiKey() ? `<button class="btn secondary" id="chr-regen" style="margin-top:6px" ${character._chronicleBusy ? "disabled" : ""}>↻ ${cache?.text ? "Regenerate" : "Write it"}</button>` : ""}
    </section>
    <section><h3>Major deeds${deeds.length ? ` (${deeds.length})` : ""}</h3>
      ${deeds.length ? deeds.map(d => `<div class="chronicle-deed"><span class="rep-band ${(d.weight | 0) >= 0 ? "trusted" : "wary"}">${(d.weight | 0) > 0 ? "+" : ""}${d.weight | 0}</span> ${esc(d.description)}${d.worldDay != null ? ` <span class="cost">day ${d.worldDay}</span>` : ""}</div>`).join("") : "<div class='insight'>no deeds yet — the valley is waiting</div>"}
    </section>
    <section><h3>Relationships</h3>
      ${(() => { const rp = relationshipsParagraph(character); return rp ? `<p class="chronicle-para" style="margin-bottom:8px">${esc(rp)}</p>` : ""; })()}
      ${ctx.bonds.length ? ctx.bonds.map(b => `<div class="known-npc"><span class="npc-name entity-hover" ${b.id ? `data-entity="npc:${esc(b.id)}"` : ""}>${esc(b.name)}</span> <span class="rep-band trusted">${esc(b.label)}</span></div>`).join("") : "<div class='insight'>no close ties yet</div>"}
    </section>
    <section><h3>Standing</h3>
      ${ctx.standing.length ? ctx.standing.map(s => `<div class="known-npc"><span class="npc-name">${esc(s.who)}</span> <span class="rep-band">${esc(s.band)}</span></div>`).join("") : "<div class='insight'>not yet known anywhere</div>"}
    </section>
    <section><h3>The arc</h3>
      ${(() => { // SNG-134 P1: show the SNG-133 personal arc (premise + current stage), not the frozen aim.
        const pa = character.personalArc;
        if (pa && pa.premise) {
          const taken = (character.quests || []).find(q => q.arcId === pa.arcId);
          const stage = taken ? (pa.stages[taken.stageIndex] || pa.stages[pa.stages.length - 1]) : null;
          return `<div class="chronicle-arc"><strong>${esc(pa.name)}</strong><p class="map-details-desc" style="margin-top:2px">${esc(pa.premise)}</p><div class="hint">${stage ? "Now: " + esc(stage.objective) : "a thread waiting to be pulled — it will find you in play"}</div></div>`;
        }
        return `<div class="chronicle-arc">${ctx.arc ? esc(ctx.arc) : "<span class='insight'>their path is still forming</span>"}</div>`;
      })()}
    </section>
    <section><h3>World authorship <span class="cost">what you've made real</span></h3>
      <div class="authorship-grid">
        <div class="auth-stat"><span class="auth-num">${auth.authoredCount}</span><span class="auth-label">authored places &amp; people you've walked among</span></div>
        <div class="auth-stat"><span class="auth-num accent">${auth.novelCount}</span><span class="auth-label">called into being through your play</span></div>
        <div class="auth-stat"><span class="auth-num">${auth.persisted.shared}</span><span class="auth-label">now shared-world canon</span></div>
        <div class="auth-stat"><span class="auth-num accent">${auth.worldEffect}</span><span class="auth-label">world-effect — your fingerprint on the shared world</span></div>
      </div>
      <div class="hint" style="margin-top:6px">Of the world you've touched, <strong>${auth.authoredCount}</strong> ${auth.authoredCount === 1 ? "place/person was" : "were"} written before you — and you <strong>called ${auth.novelCount} new ${auth.novelCount === 1 ? "one" : "ones"} into being</strong>.${auth.novelCount ? ` Of those, ${auth.persisted.shared} ${auth.persisted.shared === 1 ? "is" : "are"} now canon the whole valley reads${auth.persisted.rumor ? `, ${auth.persisted.rumor} live${auth.persisted.rumor === 1 ? "s" : ""} on as rumor others may yet confirm` : ""}; ${auth.persisted.personal} real to you, not yet shared.` : ""}</div>
      ${auth.topAttention.length ? `<div style="margin-top:8px"><div class="sys-label">What you're making real right now</div>${auth.topAttention.map(t => `<div class="known-npc"><span class="npc-name">${esc(t.name)}</span> <span class="cost">${esc(t.type || "")} · ${esc(t.tier)}</span> <span class="rep-band ${t.tier === "nominated" ? "trusted" : ""}" title="realness weight — the closer to promotion, the more real">weight ${t.weight}</span></div>`).join("")}</div>` : ""}
      <label class="rating-check" style="margin-top:10px"><input type="checkbox" id="chr-share" ${profile?.sharedChronicle ? "checked" : ""}> Share my chronicle with the family (they can see these authorship stats)</label>
    </section>
    <section><h3>Sessions${sessions.length ? ` (${sessions.length})` : ""}</h3>
      ${sessions.length ? sessions.map(s => {
        const raw = (character.sessions || []).find(x => x.id === s.id) || {};
        const span = s.startDay != null && s.endDay != null ? (s.startDay === s.endDay ? `day ${s.startDay}` : `days ${s.startDay}–${s.endDay}`) : "";
        const title = `${s.ended ? "▪" : "▸"} ${span || s.id} · ${s.beats} beat${s.beats === 1 ? "" : "s"}${s.deeds.length ? ` · ${s.deeds.length} deed${s.deeds.length === 1 ? "" : "s"}` : ""}`;
        const recap = raw._recapBusy ? `<div class="insight">writing the recap…</div>` : raw.recap ? `<p class="chronicle-para">${esc(raw.recap)}</p>` : "";
        return `<details class="session-entry"><summary>${esc(title)}</summary><div class="sec-body">
          ${recap}
          ${getApiKey() && !raw.recap ? `<button class="btn secondary session-recap" data-sess="${esc(s.id)}" style="margin:2px 0 6px" ${raw._recapBusy ? "disabled" : ""}>✍ Write session recap</button>` : ""}
          ${s.deeds.length ? `${s.deeds.map(d => `<div class="chronicle-deed"><span class="rep-band ${d.weight >= 0 ? "trusted" : "wary"}">${d.weight > 0 ? "+" : ""}${d.weight}</span> ${esc(d.description)}</div>`).join("")}` : "<div class='insight'>a quiet span — no deeds of note</div>"}
          ${s.placesMinted.length ? `<div class="hint">✦ Places you made: ${s.placesMinted.map(esc).join(", ")}</div>` : ""}
          ${s.peopleMet.length ? `<div class="hint">✦ People first met: ${s.peopleMet.map(esc).join(", ")}</div>` : ""}
          ${s.canonPromoted.length ? `<div class="hint">★ Became shared-world canon: ${s.canonPromoted.map(esc).join(", ")}</div>` : ""}
        </div></details>`;
      }).join("") : "<div class='insight'>your first session is being written now — play on</div>"}
      ${(character.sessions || []).length && !(character.sessions[character.sessions.length - 1] || {}).ended ? `<button class="btn secondary" id="chr-endsession" style="margin-top:6px">End this session</button>` : ""}
    </section>
    ${family.length >= 2 ? `<section><h3>Across the family <span class="cost">who's authored the valley</span></h3>
      ${family.map((f, i) => `<div class="family-row${f.id === character.id ? " you" : ""}"><span class="fam-rank">${i + 1}</span> <span class="npc-name">${esc(f.name)}</span> <span class="cost">L${f.level}${f.playerKey && f.playerKey !== myKey ? " · " + esc(nameOfPlayer(f.playerKey)) : ""}</span><div class="fam-stats">${f.novelCount} made · ${f.shared} canon · <strong>world-effect ${f.worldEffect}</strong></div></div>`).join("")}
      <div class="hint" style="margin-top:6px">Your family co-authors one valley. World-effect is how much of the shared world bears each person's fingerprint.</div>
    </section>` : ""}
    <button class="btn secondary" id="chr-back" style="margin-top:12px">Back</button>
  </div>`);
  const rb = document.getElementById("chr-regen"); if (rb) rb.onclick = () => ensureChronicleParagraph(true);
  const share = document.getElementById("chr-share"); if (share) share.onchange = (e) => { if (profile) { profile.sharedChronicle = e.target.checked; saveProfile(profile); } };
  const endBtn = document.getElementById("chr-endsession"); if (endBtn) endBtn.onclick = () => { endSession(character); saveCharacter(character); renderChronicle(); };
  for (const b of app.querySelectorAll(".session-recap")) b.onclick = () => ensureSessionRecap(b.dataset.sess);
  document.getElementById("chr-back").onclick = () => renderCharacterScreen();
  if (!cache?.text && !character._chronicleBusy && getApiKey()) ensureChronicleParagraph(false); // write once on first open
}

/** SNG-128: generate a one-paragraph recap for ONE session on demand (lazy, cached on the session).
 *  Reuses the chronicle voice + the same content ceiling as the GM; app owns the model call. */
async function ensureSessionRecap(sessionId, force = false) {
  const raw = (character.sessions || []).find(x => x.id === sessionId);
  if (!raw || (raw.recap && !force) || raw._recapBusy) return;
  const entry = sessionLog(character).find(x => x.id === sessionId);
  if (!entry) return;
  raw._recapBusy = true; raw._recapError = null; renderChronicle();
  try {
    const { system, user } = buildSessionPrompt(character, entry, { ratingLine: ratingLineForGM() });
    const text = await callClaude([{ role: "user", content: user }], { task: "chronicle", system });
    raw.recap = String(text || "").trim();
  } catch (e) {
    raw._recapError = "Couldn't write the recap — try again.";
  }
  raw._recapBusy = false;
  saveCharacter(character);
  renderChronicle();
}

// SNG-133: enrich the seeded personal arc via the model (best-effort) — a richer premise/stakes/stages/
// routes + a catalyst legend NPC, drawn from the bio (the SNG-132 arc as the quality bar). No API key →
// the fallback arc simply stands. Non-blocking; the arc is bound to the character (SNG-132 runs it).
async function enrichPersonalArc(char) {
  if (!char || !getApiKey()) return; // no key → the light fallback arc stands
  try {
    const { system, user } = buildPersonalArcPrompt(char, { ratingLine: ratingLineForGM() });
    const raw = await callClaudeJSON([{ role: "user", content: user }], { task: "generate", system });
    const arc = sanitizePersonalArc(raw, char);
    if (arc && arc.premise) {
      char.personalArc = arc; // the legend NPC rides embedded (arc.legendNpc); the GM registers it on first meeting
      saveCharacter(char);
    }
  } catch { /* the fallback arc stands — a hiccup never blocks creation */ }
}

// ---------- SNG-061: THE LIBRARY (the world's guide — open, readable, no discovery gate) ----------
// Renders the authored lore as readable prose, browsable by category, with THE GREAT CIRCLE shown
// as a readable thing (not just a gate). GM-EYES-ONLY / hooks / secret fields are FILTERED from
// every render — the Library is the player's book, never the GM's. Distinct from the discovered
// Codex (what THIS character has actually found), which keeps its discovery gate.

const LIBRARY_INDEX = [
  { cat: "Peoples & Traditions", entries: [
    { id: "great_circle", label: "The Great Circle", kind: "circle" },
    { id: "reaches", label: "The Twelve Reaches", path: "content/packs/valley/lore/the_twelve_reaches.json", kind: "json" },
  ] },
  { cat: "The World", entries: [
    { id: "framing", label: "The Shape of the World", path: "content/packs/valley/lore/world_framing.json", kind: "json" },
    { id: "coordinate", label: "The Coordinate World & the Center", path: "content/packs/valley/lore/the_coordinate_world.json", kind: "json" },
    { id: "poles", label: "Pole & Intensity", path: "content/packs/valley/lore/the_pole_intensity_model.json", kind: "json" },
  ] },
  { cat: "The Valley", entries: [
    { id: "primer", label: "A Valley Primer", path: "content/packs/valley/lore/valley_primer.md", kind: "md" },
    { id: "precursors", label: "The Precursors", path: "content/packs/valley/lore/precursors.md", kind: "md" },
  ] },
  { cat: "Powers & Crafts", entries: [
    { id: "powers", label: "The Power Systems", path: "content/packs/valley/lore/power_systems.md", kind: "md" },
    { id: "roles", label: "Universal Roles", path: "content/packs/valley/lore/universal_roles.json", kind: "json" },
    { id: "game", label: "The Game & the Coin", path: "content/packs/valley/lore/the_game_and_coin.json", kind: "json" },
    { id: "arcs", label: "Greater Arcs", path: "content/packs/valley/lore/greater_arcs.json", kind: "json" },
  ] },
];

const _libCache = {};
async function libFetch(path, kind) {
  if (_libCache[path] !== undefined) return _libCache[path];
  try { const res = await fetch(path); _libCache[path] = res.ok ? (kind === "md" ? await res.text() : await res.json()) : null; }
  catch { _libCache[path] = null; }
  return _libCache[path];
}

// GM-only / meta keys never shown to the player.
const LIB_SKIP = /^(schemaVersion|id|kind|note|designNote|buildPlan|buildNeeds.*|owed|migration|status|version|packId)$/i;
const LIB_SECRET = /(gm[_A-Z]|gmeyes|eyes.?only|secret|hidden|hook|mandate|internal|_pat|token|guidance)/i;
function libSkipKey(k) { return LIB_SKIP.test(k) || LIB_SECRET.test(k); }
function libPretty(k) { return String(k).replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, c => c.toUpperCase()); }

/** Generic lore → readable HTML. Walks objects/arrays into headings + prose; filters GM fields. */
function loreToHtml(value, depth = 0) {
  if (value == null) return "";
  if (typeof value === "string") return `<p class="lore-p">${esc(value)}</p>`;
  if (typeof value === "number" || typeof value === "boolean") return `<p class="lore-p">${esc(String(value))}</p>`;
  if (Array.isArray(value)) {
    if (!value.length) return "";
    if (value.every(v => typeof v === "string")) return `<ul class="lore-list">${value.map(v => `<li>${esc(v)}</li>`).join("")}</ul>`;
    return value.map(v => {
      if (v && typeof v === "object") {
        const title = v.name || v.title || v.label || v.people || v.craft || v.role || v.id;
        return `<div class="lore-entry">${title ? `<h4 class="lore-h">${esc(libPretty(title))}</h4>` : ""}${loreToHtml(stripTitle(v), depth + 1)}</div>`;
      }
      return loreToHtml(v, depth + 1);
    }).join("");
  }
  if (typeof value === "object") {
    return Object.entries(value).filter(([k]) => !libSkipKey(k)).map(([k, v]) => {
      const H = depth <= 0 ? "h3" : "h4";
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
        return `<div class="lore-field"><span class="lore-key">${esc(libPretty(k))}:</span> ${esc(String(v))}</div>`;
      const inner = loreToHtml(v, depth + 1);
      return inner ? `<div class="lore-section"><${H} class="lore-h">${esc(libPretty(k))}</${H}>${inner}</div>` : "";
    }).join("");
  }
  return "";
}
function stripTitle(o) { const c = { ...o }; for (const k of ["name", "title", "label"]) delete c[k]; return c; }

/** Inline markdown emphasis on already-escaped text: **bold**, *italic* / _italic_. */
function libInline(escaped) {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\b_([^_\n]+)_\b/g, "<em>$1</em>");
}

/** Minimal markdown → HTML for the .md lore (headings, lists, paragraphs, inline emphasis). */
function libMdToHtml(md) {
  const lines = String(md || "").split(/\r?\n/);
  let html = "", inList = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  const ln = s => libInline(esc(s));
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{3,}\s/.test(line)) { closeList(); html += `<h4 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h4>`; }
    else if (/^##\s/.test(line)) { closeList(); html += `<h3 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h3>`; }
    else if (/^#\s/.test(line)) { closeList(); html += `<h2 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h2>`; }
    else if (/^[-*]\s/.test(line)) { if (!inList) { html += "<ul class='lore-list'>"; inList = true; } html += `<li>${ln(line.replace(/^[-*]\s/, ""))}</li>`; }
    else if (!line.trim()) { closeList(); }
    else { closeList(); html += `<p class="lore-p">${ln(line)}</p>`; }
  }
  closeList();
  return html;
}

/** The great circle, rendered as a readable centerpiece + the 24 peoples with their crafts. */
function libGreatCircle() {
  const idx = CONTENT.traditionIndex;
  if (!idx) return "<div class='insight'>The great circle is not loaded.</div>";
  const circle = domainCircleSVG(idx, { selectable: () => false, centerTop: "the great circle", centerSub: "twelve axes · twenty-four peoples" });
  const rows = ringOrder(idx).map(t => { const tr = idx.byId?.[t]; const st = (idx.stations || []).find(s => s.traditionId === t);
    return tr ? `<div class="lore-entry"><h4 class="lore-h">${esc(tr.name || t)}${tr.craft ? ` <span class="hint">— ${esc(tr.craft)}</span>` : ""}</h4>
      <div class="lore-field"><span class="lore-key">Pole:</span> ${esc(st?.pole || tr.pole || "?")} · <span class="lore-key">Across the ring:</span> ${esc(traditionLabel(antipodeOf(t, idx)))}</div>
      ${tr.civilization ? `<p class="lore-p">${esc(tr.civilization)}</p>` : ""}${tr.aesthetic ? `<p class="lore-p"><em>${esc(tr.aesthetic)}</em></p>` : ""}</div>` : ""; }).join("");
  const folk = (CONTENT.traditions?.folkTraditions || []).map(f => `<div class="lore-field"><span class="lore-key">${esc(f.name || f.traditionId)}:</span> ${esc(f.aesthetic || "a Valley folk-craft, open to all")}</div>`).join("");
  return `${circle}
    <p class="lore-p">Twelve axes of the world, each a tension between two peoples — and every craft sits directly across the ring from its antithesis. Kin stand beside kin; the far pole of what you are is closed to you, reachable only by the great braids.</p>
    <h3 class="lore-h">The Twenty-Four Peoples</h3>${rows}
    ${folk ? `<h3 class="lore-h">The Valley's Folk Crafts (open to all)</h3>${folk}` : ""}`;
}

async function renderLibrary(catIdx = 0, entryId = null) {
  const cat = LIBRARY_INDEX[catIdx] || LIBRARY_INDEX[0];
  const entry = (cat.entries.find(e => e.id === entryId)) || cat.entries[0];
  let body = "";
  if (entry.kind === "circle") body = libGreatCircle();
  else { const data = await libFetch(entry.path, entry.kind);
    body = data == null ? "<div class='insight'>This entry could not be loaded.</div>"
      : entry.kind === "md" ? libMdToHtml(data) : loreToHtml(data, 0); }
  chrome(`<div class="screen" style="max-width:820px">
    <h2>📖 The Library <span class="hint" style="text-transform:none">— the world's guide, open to read</span></h2>
    <div class="library-cats">${LIBRARY_INDEX.map((c, i) => `<button class="lib-cat ${i === catIdx ? "on" : ""}" data-libcat="${i}">${esc(c.cat)}</button>`).join("")}</div>
    <div class="library-entries">${cat.entries.map(e => `<button class="lib-entry ${e.id === entry.id ? "on" : ""}" data-libentry="${esc(e.id)}">${esc(e.label)}</button>`).join("")}</div>
    <div class="library-body"><h3 class="lore-title">${esc(entry.label)}</h3>${body}</div>
    <button class="btn secondary" id="lib-back" style="margin-top:14px">Back</button>
  </div>`);
  for (const b of app.querySelectorAll("[data-libcat]")) b.onclick = () => renderLibrary(+b.dataset.libcat, null);
  for (const b of app.querySelectorAll("[data-libentry]")) b.onclick = () => renderLibrary(catIdx, b.dataset.libentry);
  document.getElementById("lib-back").onclick = () => { if (character) renderPlay(character.activeScene?.lastTurn || null, {}); else renderRoster(); };
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
        ${(() => {
          // SNG-BATCH-9 Phase 2: a GROWN entity carries a canon-tier badge + a one-tap ⭐ Keep
          // (the explicit engagement boost — available, never nagged). Nominated = a promotion
          // candidate toward shared canon (Phase 3).
          const g = open.entityId ? findGenerated(character, open.entityId) : null;
          if (!g?._gen) return "";
          const tier = g._gen.tier;
          const badge = tier === "nominated" ? "★ notable — nomination candidate" : tier === "established" ? "◆ established in your world" : "◇ freshly grown";
          return `<div class="gen-canon ${tier}">
            <span class="gen-tier" title="grown through play · weight ${effectiveWeight(g)}${g._gen.rating ? ` · ${g._gen.rating}` : ""}">${badge}</span>
            <button class="opt gen-keep" data-keep="${esc(open.entityId)}" title="Keep this — mark it as one that matters to you. Raises it toward notable. Never nags.">⭐ Keep</button>
          </div>`;
        })()}
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
      ${(() => {
        // SNG-BATCH-9 Phase 2 §3: entities that grew into 'notable' (nominated) surface as
        // promotion candidates toward shared canon. Surfacing only — tap to open + ⭐/keep.
        const noms = nominationsFor(character);
        if (!noms.length) return "";
        return `<div class="codex-nominations"><div class="codex-group-title">★ Notable — grown into your world's canon</div>
          ${noms.slice(0, 6).map(n => `<button class="opt codex-nom" data-topic="${esc(n.id)}" title="weight ${n.weight}${n.rating ? ` · ${n.rating}` : ""} — a candidate to become shared-world canon">★ ${esc(n.name)} <span class="cost">${esc(n.type)}</span></button>`).join("")}</div>`;
      })()}
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
  // SNG-BATCH-9 Phase 2: ⭐ keep — the explicit engagement boost (raises toward notable)
  for (const b of app.querySelectorAll("[data-keep]")) b.onclick = () => {
    const rec = findGenerated(character, b.dataset.keep);
    if (!rec) return;
    recordAttention(rec, "keep", readClock(character.clock).day);
    autoVerifyLeg("b9p2-keep", `⭐ Kept a grown entity → ${rec._gen?.tier}`); // SNG-051 auto-verify
    saveCharacter(character);
    renderCodexScreen(query, openTopicId);
  };
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

/** SNG-043 Part B: the energy a planned step will cost — the ability's effective cost when the
 *  step uses one, else the flat per-step default. Lets the builder budget a plan before commit. */
function gambitStepEnergy(action) {
  const flat = CONTENT.rules.gambit?.stepEnergyCost ?? 4;
  if (action?.abilityId) { const ab = fullCatalog()[action.abilityId]; if (ab) return effectiveEnergyCost(ab, character, CONTENT.rules); }
  return flat;
}

/** SNG-093 (Design Law 5): an in-flight AI/network call must never be able to strand the UI in a
 *  loading state. Rejects after `ms` so a hang or timeout is caught like any other failure — the
 *  caller's catch/finally then restores a playable screen. */
function withTimeout(promise, ms = 30000, label = "the GM") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} didn't answer in time`)), ms)),
  ]);
}

function renderGambitBuilder(status = "") {
  if (!gambitDraft) gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null };
  const g = gambitDraft;
  const max = CONTENT.rules.gambit?.maxSteps ?? 5;
  // SNG-043 Part B: per-step + total energy, known once the plan is assessed (steps parsed)
  const stepEnergy = g.actions ? g.actions.map(gambitStepEnergy) : null;
  const totalEnergy = stepEnergy ? stepEnergy.reduce((a, b) => a + b, 0) : null;
  const overBudget = totalEnergy != null && totalEnergy > (character.energy ?? 0);
  chrome(`<div class="screen" style="max-width:720px">
    <h2>Plan a Gambit ${infoDot("gambit.what")} ${infoDot("gambit.fewer_is_harder")}</h2>
    <p class="hint" style="margin-bottom:12px">Declare a sequence of moves. Assess it to read your odds (as far as your experience allows), then run it. A failed step forces a decision: fallback, adapt, press on, or abandon. Adaptation points available: <strong>${adaptationPointsFor(profile, CONTENT.rules)}</strong>.</p>
    <div class="field"><label>Goal</label><input id="g-goal" value="${esc(g.goal)}" placeholder="e.g. get the falsified purity logs out of the array office" style="width:100%; box-sizing:border-box"></div>
    ${g.steps.map((s, i) => `
      <div class="field gambit-step">
        <label>Step ${i + 1}${g.assessed?.steps[i] ? ` — <span class="g-chance">${g.assessed.steps[i].sense.text ? esc(g.assessed.steps[i].sense.text) : "no read"}</span>${g.assessed.weakIndex === i ? ` <span class="g-weak">⚠ weakest link</span>` : ""}` : ""}${stepEnergy ? ` <span class="g-energy">· ${stepEnergy[i]} energy</span>` : ""}</label>
        <input class="g-step" data-i="${i}" value="${esc(s.text)}" placeholder="what you'll do" style="width:100%; box-sizing:border-box">
        <input class="g-fallback" data-i="${i}" value="${esc(s.fallback)}" placeholder="fallback if it goes wrong (optional)" style="width:100%; box-sizing:border-box; margin-top:4px; opacity:.8">
        <div style="margin-top:4px; display:flex; gap:6px; flex-wrap:wrap">
          ${i > 0 ? `<button class="opt g-up" data-i="${i}" title="Move this step earlier">▲ up</button>` : ""}
          ${i < g.steps.length - 1 ? `<button class="opt g-down" data-i="${i}" title="Move this step later">▼ down</button>` : ""}
          ${g.steps.length > 1 ? `<button class="opt g-remove" data-i="${i}">remove</button>` : ""}
        </div>
      </div>`).join("")}
    ${totalEnergy != null ? `<div class="gambit-total ${overBudget ? "over" : ""}">Total plan cost: <strong>${totalEnergy} energy</strong> of ${character.energy ?? 0} available${overBudget ? " — ⚠ this plan costs more energy than you have; expect to fall short partway" : ""}</div>` : ""}
    ${g.gmAdvice ? `<div class="gambit-advice">✦ GM: ${esc(g.gmAdviceExpanded ? (g.gmAdviceFull || g.gmAdvice) : g.gmAdvice)}${(g.gmAdviceFull && g.gmAdviceFull.length > g.gmAdvice.length) ? ` <button class="link-btn" id="g-advice-more">${g.gmAdviceExpanded ? "less" : "more"}</button>` : ""}</div>` : ""}
    <div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
      ${g.steps.length < max ? `<button class="btn secondary" id="g-add">+ step</button>` : ""}
      ${hasPlanDiscussion() ? `<button class="btn secondary" id="g-fill" title="Pull the goal and steps from what you just worked out with the GM">✦ Fill from our conversation</button>` : ""}
      <button class="btn secondary" id="g-assess">Assess plan</button>
      <button class="btn secondary" id="g-advise">✦ GM, look at this</button>
      <button class="btn" id="g-run" ${g.assessed ? "" : "disabled"}>Run it</button>
      <button class="btn secondary" id="g-startover" title="Clear this plan and start fresh — costs nothing, keeps nothing">↺ Start over</button>
      <button class="btn secondary" id="g-cancel">Back</button>
    </div>
    ${status ? `<div class="hint">${esc(status)}</div>` : ""}
  </div>`);
  const read = () => {
    g.goal = document.getElementById("g-goal").value;
    for (const el of app.querySelectorAll(".g-step")) g.steps[+el.dataset.i].text = el.value;
    for (const el of app.querySelectorAll(".g-fallback")) g.steps[+el.dataset.i].fallback = el.value;
  };
  for (const el of app.querySelectorAll(".g-step, .g-fallback, #g-goal")) el.oninput = () => { g.assessed = null; g.actions = null; g.gmAdvice = null; g.gmAdviceFull = null; g.gmAdviceExpanded = false; };
  for (const b of app.querySelectorAll(".g-remove")) b.onclick = () => { read(); g.steps.splice(+b.dataset.i, 1); g.assessed = null; g.actions = null; renderGambitBuilder(); };
  // reorder: ordering is meaningful (fewer steps = less slack; sequencing changes the outcome), so a
  // move invalidates the assessment. read() first so in-progress edits aren't lost on the swap.
  for (const b of app.querySelectorAll(".g-up")) b.onclick = () => { read(); const i = +b.dataset.i; [g.steps[i - 1], g.steps[i]] = [g.steps[i], g.steps[i - 1]]; g.assessed = null; g.actions = null; renderGambitBuilder(); };
  for (const b of app.querySelectorAll(".g-down")) b.onclick = () => { read(); const i = +b.dataset.i; [g.steps[i], g.steps[i + 1]] = [g.steps[i + 1], g.steps[i]]; g.assessed = null; g.actions = null; renderGambitBuilder(); };
  const add = document.getElementById("g-add");
  if (add) add.onclick = () => { read(); g.steps.push({ text: "", fallback: "" }); g.assessed = null; renderGambitBuilder(); };
  const fill = document.getElementById("g-fill");
  if (fill) fill.onclick = () => { read(); renderGambitBuilder("Reading your conversation for the plan…"); autofillGambitFromConversation(false); };
  const moreBtn = document.getElementById("g-advice-more");
  if (moreBtn) moreBtn.onclick = () => { read(); g.gmAdviceExpanded = !g.gmAdviceExpanded; renderGambitBuilder(); };
  // SNG-088C: a gambit must be abandonable and leave NOTHING behind — a fresh, blank draft.
  document.getElementById("g-startover").onclick = () => { abandonGambit(); renderGambitBuilder("Fresh plan — nothing carried over."); };
  document.getElementById("g-cancel").onclick = () => { gambitDraft = null; renderPlay(character.activeScene?.lastTurn || null, {}); };
  document.getElementById("g-assess").onclick = async () => {
    read();
    const texts = g.steps.map(s => s.text.trim()).filter(Boolean);
    if (!texts.length || !g.goal.trim()) { renderGambitBuilder("Give the plan a goal and at least one step."); return; }
    g.steps = g.steps.filter(s => s.text.trim());
    renderGambitBuilder("Reading the plan…");
    // SNG-093: try/catch/finally + timeout — a hang or a throw can never strand "Reading the plan…".
    try {
      const actions = await withTimeout(parseGambitSteps(g.steps.map(s => s.text), character, hereNow()), 30000, "the plan reader");
      g.actions = actions;
      g.assessed = assessGambit(actions, gambitCtx());
    } catch (err) {
      renderGambitBuilder("Couldn't read the plan (" + String(err?.message || err).slice(0, 60) + ") — try again.");
      return;
    }
    renderGambitBuilder();
  };
  const advise = document.getElementById("g-advise");
  if (advise) advise.onclick = async () => {
    read();
    const texts = g.steps.map(s => s.text.trim()).filter(Boolean);
    if (!g.goal.trim() || !texts.length) { renderGambitBuilder("Give the plan a goal and a step first, then ask the GM."); return; }
    renderGambitBuilder("The GM studies your plan…");
    const location = hereNow();
    const time = readClock(character.clock);
    // SNG-043 Part B: GM-collaborative building — one concrete suggestion or warning on the DRAFT
    const q = `[Gambit builder] Look at this DRAFT plan I'm assembling and give me ONE concrete, specific suggestion or warning about its sequencing or risk — a single sentence of advice (not a narration of any outcome; nothing is attempted yet). Goal: "${g.goal}". Steps so far: ${texts.map((t, i) => `${i + 1}) ${t}`).join("; ")}.`;
    // SNG-093 (Design Law 5): the GM call is wrapped in try/catch with a TIMEOUT, and `finally`
    // ALWAYS re-renders — an AI throw/hang can never leave the UI stuck on "The GM studies your plan…".
    try {
      const result = await withTimeout(gmAsk({
        character, location, rules: CONTENT.rules,
        lore: loreForLocation(location, CONTENT.lore),
        region: { ...CONTENT.region, activeEvents: eventsForGM(buildRegionView(CONTENT, character), CONTENT.events) },
        recentTurns: sceneTurns.slice(-6), timeLabel: time.label,
        inventoryDetail: inventoryForGM(character), sceneState,
        npcRegistryDetail: npcRegistryForGM(character, { locationId: character.currentLocationId, sceneNpcNames: (sceneState?.npcsPresent || []).map(n => n.name) }),
        abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks, CONTENT.rules)
      }, q), 30000, "the GM");
      // SNG-088A (SNG-076 miss): the GM's plan-advice is PROSE — clamp on a word boundary with a real
      // ellipsis (not a mid-word cut at 400), raise the bound, and keep the full text for an expander.
      if (result.ok) { g.gmAdviceFull = String(result.text).trim(); g.gmAdvice = smartClamp(g.gmAdviceFull, 600); g.gmAdviceExpanded = false; }
      else { g.gmAdvice = g.gmAdviceFull = "The GM couldn't weigh in (" + String(result.error).slice(0, 50) + ") — plan on."; }
    } catch (err) {
      g.gmAdvice = g.gmAdviceFull = "The GM didn't answer (" + String(err?.message || err).slice(0, 50) + ") — try again.";
    } finally {
      renderGambitBuilder();
    }
  };
  document.getElementById("g-run").onclick = () => { read(); runGambit(); };
}

/** SNG-088C: abandon/reset — a gambit must leave NOTHING behind. A fresh, blank draft; no carried
 *  goal, steps, assessment, advice, actions, or run state. Abandoning costs nothing and pays nothing;
 *  per canon only a COMPLETED gambit pays the bonus. */
function abandonGambit() {
  gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null, actions: null, gmAdvice: null, gmAdviceFull: null, gmAdviceExpanded: false };
}

/** SNG-088 follow-on: was there a long-form plan discussion with the GM just now? (enough recent
 *  dialogue that auto-pulling a plan from it is worth offering). */
function hasPlanDiscussion() {
  const turns = (sceneTurns || []).slice(-6);
  if (turns.length < 2) return false;
  const len = turns.reduce((n, t) => n + String(t.player || "").length + String(t.narration || t.summary || "").length, 0);
  return len >= 300;
}

/** SNG-088 follow-on: pull goal + ordered steps out of the recent conversation and populate the draft,
 *  so a player who talked the plan through with the GM doesn't have to retype it. Overwrites only what
 *  the extraction actually found (a typed goal survives an empty extraction). */
async function autofillGambitFromConversation(announce = true) {
  const g = gambitDraft;
  if (!g) return;
  try {
    const ex = await extractGambit({ recentTurns: (sceneTurns || []).slice(-6), maxSteps: CONTENT.rules.gambit?.maxSteps ?? 5 });
    const steps = (Array.isArray(ex?.steps) ? ex.steps : [])
      .map(s => ({ text: String(s?.text || "").slice(0, 300), fallback: String(s?.fallback || "").slice(0, 300) }))
      .filter(s => s.text);
    const goal = String(ex?.goal || "").trim().slice(0, 300);
    if (!steps.length && !goal) { renderGambitBuilder(announce ? "Nothing to pull from the conversation yet — write the plan here." : ""); return; }
    if (goal) g.goal = goal;
    if (steps.length) g.steps = steps;
    g.assessed = null; g.actions = null;
    renderGambitBuilder("✦ Pulled from your conversation — edit anything, reorder as you like, then Assess and Run.");
  } catch (e) {
    renderGambitBuilder(announce ? "Couldn't read the conversation (" + String(e.message || e).slice(0, 50) + ") — write the plan here." : "");
  }
}

/** The entry point for opening the builder. If the player has been TALKING THROUGH a plan and there is
 *  no draft yet, auto-fill from the conversation (Design Law 1: extracted, then editable). Otherwise
 *  open blank / resume the existing draft. */
function openGambitBuilder() {
  if (gambitDraft || !hasPlanDiscussion()) { renderGambitBuilder(); return; }
  gambitDraft = { goal: "", steps: [{ text: "", fallback: "" }], assessed: null };
  renderGambitBuilder("Reading your conversation for the plan…");
  autofillGambitFromConversation(false);
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
      <div class="roll-receipt" style="margin:10px 0">Step ${failed.index + 1}: ${esc(a.label)} — d100: ${failed.roll} vs ${failed.breakdown ? `<span class="roll-chance" data-breakdown="${esc(JSON.stringify({ ...failed.breakdown, roll: failed.roll, degree: failed.degree }))}" tabindex="0" role="button" title="Why this number?">${failed.chance}</span>` : failed.chance} — <span class="${failed.degree}">${failed.degree.replace("_", " ")}</span></div>
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
    if (ids.length) { recordUse(character, ids); pendingRankAdvances.push(...autoAdvancePracticedRanks(character, CONTENT.rules, { branchForks: CONTENT.branchForks, catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex })); }
  }
  // the human planned: that's who they are becoming
  const allTags = ["plan", "prepare", ...new Set(g.actions.flatMap(a => a.intentTags || []))];
  updateProfile(character, allTags, CONTENT.rules.playerAptitudes, CONTENT.rules);
  const rough = run.receipts.some(r => r.complication || r.viaFallback || r.rerolled || r.degree === "failure" || r.degree === "crit_failure");
  const outcome = run.abandoned ? "abandoned" : rough ? "completed_rough" : "completed";
  // SNG-030 remainder: a carried-out plan PAYS — award the completion bonus so planning
  // out-earns improvising (strategist's adaptation points are already granted at build).
  let bonusXp = 0;
  if (!run.abandoned) {
    bonusXp = Math.max(0, CONTENT.rules.gambit?.completionBonusXp ?? 10);
    character.xp = (character.xp || 0) + bonusXp;
    for (const msg of applyLevelUps(character, CONTENT.rules)) { /* level-ups from the bonus land now */ }
    autoVerifyLeg("b8-gambit", `ran a gambit to completion (+${bonusXp} xp)`); // SNG-051 auto-verify
  }
  saveProfile(profile); saveCharacter(character);
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
  const gLabel = `GAMBIT: ${g.goal} (${outcome.replace("_", " ")}${bonusXp ? `, +${bonusXp} xp` : ""})`;
  renderPlay(null, { thinking: "The run unfolds…", playerBeat: { label: gLabel } });
  const result = await runGM({ resolution, playerInput: null });
  if (result) renderPlay(result.turn, { playerBeat: { label: gLabel }, degraded: result.degraded });
}

function useItem(name) {
  if (busy) return;
  const item = character.inventory.find(i => i.name === name || i.customName === name);
  if (!item) return;
  if (item.consumable) {
    const fx = consumeItem(character, name);
    saveCharacter(character);
    const parts = [];
    if (fx?.health) parts.push(`${fx.health > 0 ? "+" : ""}${fx.health} health`);
    if (fx?.energy) parts.push(`${fx.energy > 0 ? "+" : ""}${fx.energy} energy`);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You use the ${name}${parts.length ? ` (${parts.join(", ")})` : ""}.` });
  } else {
    openUseIntent(item); // SNG-114: a non-consumable's use is a scene action WITH intent, not a canned sentence
  }
}

/** SNG-114: THE shared item card — a superset (image when open + effects + bonusTags + use/name/drop),
 *  rendered by BOTH the inventory popup and the play sidebar so the two can never drift again. The only
 *  per-surface difference is which attribute toggles it open (each surface owns its own open-state var). */
function itemCard(it, { open = false, toggleAttr = "data-item-toggle", showPin = false } = {}) {
  const img = open && imagesEnabled() ? itemImage(it, { ratingLevel: viewerRatingLevel() }) : null;
  return `<div class="item-card ${open ? "open" : ""}">
    <button class="item-name" ${toggleAttr}="${esc(it.name)}">${esc(displayName(it))}${it.customName ? ` <span class="cost">(${esc(it.name)})</span>` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}</button>${showPin ? `<button class="item-pin ${it.pinned ? "on" : ""}" data-item-pin="${esc(it.name)}" title="${it.pinned ? "Pinned to the sidebar — tap to unpin" : "Pin to the sidebar for quick access"}">${it.pinned ? "📌" : "📍"}</button>` : ""}
    ${open ? `<div class="item-detail">
      ${img ? `<img class="item-img" src="${esc(img)}" alt="${esc(it.name)}" loading="lazy" onerror="this.style.display='none'">` : ""}
      <div class="item-desc">${esc(it.description || it.kind)}</div>
      ${it.bonusTags?.length ? `<div class="item-tags">helps with: ${it.bonusTags.map(esc).join(", ")}</div>` : ""}
      ${it.effects ? `<div class="item-tags">${Object.entries(it.effects).map(([k, v]) => `${esc(k)} ${v > 0 ? "+" : ""}${esc(String(v))}`).join(", ")}</div>` : ""}
      <div class="item-actions">
        <button class="opt" data-item-use="${esc(it.name)}">${it.consumable ? "Consume" : "Use in scene"}</button>
        <button class="opt" data-item-name="${esc(it.name)}">Name it</button>
        <button class="opt" data-item-drop="${esc(it.name)}">Drop</button>
      </div></div>` : ""}
  </div>`;
}

/** SNG-114: bind the shared card's use/name/drop ONCE — both surfaces call this, so "Use in scene" does
 *  exactly one thing regardless of where it was tapped. `afterChange(name?)` re-renders the calling surface. */
function bindItemCardHandlers(afterChange) {
  for (const b of app.querySelectorAll("[data-item-use]")) b.onclick = () => useItem(b.dataset.itemUse);
  for (const b of app.querySelectorAll("[data-item-drop]")) b.onclick = () => { const n = b.dataset.itemDrop; if (confirm("Drop " + n + "?")) { removeItem(character, n, 999); saveCharacter(character); afterChange(); } };
  for (const b of app.querySelectorAll("[data-item-name]")) b.onclick = () => { const nn = prompt("Name this item:"); if (nn !== null && nameItem(character, b.dataset.itemName, nn)) { saveCharacter(character); afterChange(b.dataset.itemName); } };
  for (const b of app.querySelectorAll("[data-item-pin]")) b.onclick = (e) => { e.stopPropagation(); togglePin(character, b.dataset.itemPin); saveCharacter(character); afterChange(b.dataset.itemPin); }; // SNG-121
}

/** SNG-114: the intent step for using a non-consumable — offer the item's meaningful uses (authored or
 *  kind-default) + a free "how?" field. A storied item gets a real verb; the canned prompt is the fallback. */
function openUseIntent(item) {
  const nm = displayName(item);
  const uses = itemUses(item, nm);
  const submit = promptText => onFreeform(promptText);
  chrome(`<div class="screen" style="max-width:520px">
    <h2>Use ${esc(nm)}</h2>
    ${item.description ? `<p class="hint" style="margin-bottom:10px">${esc(item.description)}</p>` : ""}
    ${uses.length ? `<div class="use-list">${uses.map((u, i) => `<button class="btn secondary use-opt" data-use-idx="${i}" style="display:block; width:100%; text-align:left; margin:4px 0">${esc(u.label)}</button>`).join("")}</div>` : ""}
    <div class="field" style="margin-top:10px"><label>…or say how you use it</label>
      <input id="use-how" type="text" placeholder="e.g. I press the whetstone to the rune-seam and listen" style="width:100%"></div>
    <div style="display:flex; gap:8px; margin-top:12px">
      <button class="btn" id="use-go">Use it</button>
      <button class="btn secondary" id="use-cancel">Back</button>
    </div>
  </div>`);
  for (const b of app.querySelectorAll("[data-use-idx]")) b.onclick = () => submit(uses[Number(b.dataset.useIdx)].prompt);
  const how = document.getElementById("use-how");
  how.onkeydown = e => { if (e.key === "Enter") document.getElementById("use-go").click(); };
  document.getElementById("use-go").onclick = () => { const h = how.value.trim(); submit(h ? `I use my ${nm} — ${h}` : `I use my ${nm} here`); };
  document.getElementById("use-cancel").onclick = () => renderPlay(character.activeScene?.lastTurn || null, {});
}

// ---------- SNG-098 C: the skill-battle panel (two-sided contest + fog of war) ----------
// A duel runs here as a round-by-round exchange: you declare a skill + intensity, the engine resolves BOTH
// sides (skill_battle.js), the momentum meter moves, and how much of the opponent's move you see is gated by
// your senseTier (fog). The engine (Phases A+B) is tested; this is the presentation + input loop over it.

let sbIntensity = "standard";     // the player's current intensity dial
let sbLastPlayerFn = null;        // the last function the player showed — the opponent may READ it next round

/** The player's declarable contest skills: their abilities (function + tier + energy), plus the steel-and-wit
 *  fallbacks that always work (a plain strike, a raised guard) so a caster stripped of the lattice still fights. */
function playerBattleSkills() {
  const out = [];
  for (const a of character.abilities || []) {
    const def = fullCatalog()[a.abilityId];
    const fn = (def?.functions || [])[0];
    if (!fn) continue;
    out.push({ id: a.abilityId, function: fn, tier: a.level || 1, attribute: def.attribute || "practical", name: def.name || a.abilityId, energyCost: effectiveEnergyCost(def, character, CONTENT.rules) });
  }
  out.push({ id: "_strike", function: "strike", tier: 1, attribute: "physical", name: "A plain strike" });
  out.push({ id: "_guard", function: "shield", tier: 1, attribute: "physical", name: "Raise a guard" });
  return out.slice(0, 12);
}

function renderSkillBattle(lastRound = null) {
  const enc = activeEnc();
  if (!enc || enc.state?.mode !== "skill_battle") { renderPlay(character.activeScene?.lastTurn || null, {}); return; }
  const st = enc.state, def = enc.def, sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const meterMax = sb.momentum?.meterMax ?? 10;
  const mods = aptitudeMods(character, CONTENT.rules.playerAptitudes);
  const scout = !!lastRound?._scout;
  const fog = lastRound?.opponent ? senseOpponent(character, lastRound.opponent, CONTENT.rules, sb, { scouting: scout, buyTier: scout ? (sb.revealActionBuysTier ?? 1) : 0, aptitudeMods: mods }) : null;
  const skills = playerBattleSkills();
  window._sbSkills = skills; // handler lookup
  const momPct = Math.round(((st.momentum + meterMax) / (2 * meterMax)) * 100);
  const oppTired = st.opponentEnergy != null && fog && fog.tier >= 2 ? (st.opponentEnergy < 15 ? "spent" : st.opponentEnergy < 40 ? "tiring" : "still fresh") : null;
  chrome(`<div class="screen sb-screen" style="max-width:640px">
    <h2>⚔ ${esc(def.name || "The contest")}</h2>
    <div class="sb-opponent">${esc(def.opponent?.name || "your opponent")}${fog?.label ? ` — <span class="hint">${esc(fog.label)}</span>` : ""}${oppTired ? ` <span class="cost">(${oppTired})</span>` : ""}</div>
    <div class="sb-meter" title="Momentum — fill it to prevail; empty it and you are overcome.">
      <div class="sb-meter-fill" style="width:${Math.max(0, Math.min(100, momPct))}%"></div><div class="sb-meter-mid"></div>
    </div>
    <div class="sb-vitals">You: ${character.health}/${character.maxHealth} hp · ${character.energy} energy</div>
    <div class="sb-fog">${fog ? `
      <div class="sb-fog-line">${esc(fog.revealed.outcome || "They move.")}${fog.revealed.intent ? ` — gathering to <strong>${esc(fog.revealed.intent)}</strong>` : ""}${fog.revealed.band ? ` <span class="hint">(${esc(fog.revealed.band)})</span>` : ""}</div>
      ${fog.revealed.skill ? `<div class="sb-fog-line">${esc(fog.revealed.skill)}${fog.revealed.intensity ? ` · ${esc(fog.revealed.intensity)}` : ""}${fog.revealed.breakdown ? ` <button class="data-link" data-breakdown='${esc(JSON.stringify(fog.revealed.breakdown))}'>see their math</button>` : ""}</div>` : ""}` :
      `<div class="hint">You size each other up. Strike — or read them first.</div>`}</div>
    ${st.log?.length ? `<details class="sb-log"><summary>Round log (${st.round - 1})</summary>${st.log.map(l => `<div class="hint">${esc(l)}</div>`).join("")}</details>` : ""}
    <div class="sb-intensity">Intensity: ${["conserve", "standard", "surge"].map(i => `<button class="opt sb-int ${sbIntensity === i ? "on" : ""}" data-sbint="${i}">${i}</button>`).join("")}</div>
    <div class="sb-skills">${skills.map((s, i) => `<button class="btn secondary sb-skill" data-sbskill="${i}" style="display:block; width:100%; text-align:left; margin:4px 0">${esc(s.name)} <span class="cost">${esc(s.function)} · T${s.tier}${s.energyCost ? ` · ${s.energyCost}e` : ""}</span></button>`).join("")}</div>
    <div class="sb-actions" style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap">
      <button class="btn secondary" id="sb-read" title="Spend the round reading them — no attack, but you see their next move more clearly">👁 Read them</button>
      <button class="btn secondary" id="sb-flee">Break away</button>
      <button class="btn secondary" id="sb-yield">Yield</button>
    </div>
  </div>`);
  for (const b of app.querySelectorAll("[data-sbint]")) b.onclick = () => { sbIntensity = b.dataset.sbint; renderSkillBattle(lastRound); };
  for (const b of app.querySelectorAll("[data-sbskill]")) b.onclick = () => sbDeclare(window._sbSkills[Number(b.dataset.sbskill)], { intensity: sbIntensity });
  document.getElementById("sb-read").onclick = () => sbDeclare({ function: "shield", tier: 1, attribute: "mental", name: "reading them" }, { intensity: "conserve", scouting: true });
  document.getElementById("sb-flee").onclick = () => sbFlee();
  document.getElementById("sb-yield").onclick = () => sbEnd(skillBattleRound(enc.state, enc.def, {}, { character, rules: CONTENT.rules, sb, steps, yield: true }));
}

/** Resolve one declared round: apply the player's health/energy attrition, advance the state, and either
 *  re-render the panel (fog view of what just happened) or end the contest. */
function sbDeclare(skill, { intensity = "standard", scouting = false } = {}) {
  const enc = activeEnc(); if (!enc) return;
  const sb = CONTENT.skillBattle.engine, steps = CONTENT.intensity.steps;
  const decl = { function: skill.function, tier: skill.tier || 1, attribute: skill.attribute || "practical", intensity, name: skill.name };
  const rr = skillBattleRound(enc.state, enc.def, decl, { character, rules: CONTENT.rules, sb, steps, seenTendency: sbLastPlayerFn, rng: Math.random });
  if (!scouting) sbLastPlayerFn = skill.function; // reading doesn't show them a real tendency
  character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas?.health || 0)));
  character.energy = Math.max(0, character.energy + (rr.deltas?.energy || 0));
  character.activeEncounter = { defId: enc.def.id, state: rr.state };
  saveCharacter(character);
  if (checkIncapacitation(character)) { sbEnd({ ...rr, ended: true, outcome: "incapacitated" }); return; }
  if (rr.ended) { sbEnd(rr); return; }
  renderSkillBattle({ opponent: rr.opponent, _scout: scouting });
}

/** Try to break away — a quick physical roll against the flee difficulty, resolved through the same lifecycle. */
function sbFlee() {
  const enc = activeEnc(); if (!enc) return;
  const fleeAction = { label: "break away", attribute: "physical", axes: {}, difficulty: enc.def.opponent?.fleeDifficulty ?? 15, tags: [] };
  const res = resolveAction({ character, action: fleeAction, location: hereNow(), rules: CONTENT.rules, aptitudeMods: aptitudeMods(character, CONTENT.rules.playerAptitudes) });
  const rr = skillBattleRound(enc.state, enc.def, {}, { character, rules: CONTENT.rules, sb: CONTENT.skillBattle.engine, steps: CONTENT.intensity.steps, flee: true, fleeResolution: res });
  character.health = Math.max(0, character.health + (rr.deltas?.health || 0));
  character.activeEncounter = rr.ended ? null : { defId: enc.def.id, state: rr.state };
  saveCharacter(character);
  if (rr.ended) sbEnd(rr); else renderSkillBattle(null);
}

/** The contest ends: clear it, then hand the outcome to the GM to narrate the aftermath and return to the scene. */
async function sbEnd(rr) {
  const enc = activeEnc(); const def = enc?.def;
  character.activeEncounter = null; saveCharacter(character);
  sbLastPlayerFn = null; sbIntensity = "standard";
  const nm = def?.opponent?.name || "your opponent";
  const outLine = {
    opponent_fell: `You have beaten ${nm} — they go down.`,
    opponent_yielded: `${nm} yields to you.`,
    yielded: `You yield the contest to ${nm}.`,
    fled: `You break away from the fight.`,
    player_overcome: `${nm} overcomes you.`,
    stalemate: `Neither of you can finish it — you both break, spent.`,
    incapacitated: `You fall, overcome.`
  }[rr.outcome] || "The contest ends.";
  renderPlay(null, { thinking: "…" });
  const result = await runGM({ resolution: null, playerInput: `(The skill-battle with ${nm} has resolved — outcome: ${rr.outcome}. ${outLine} Narrate the aftermath in one beat and return to the scene.)` });
  if (result) renderPlay(result.turn, {});
  else renderPlay(character.activeScene?.lastTurn || null, { aside: outLine });
}

// ---------- play rendering ----------

function renderPlay(turn, opts = {}) {
  // SNG-088B / SNG-091: the GM sketched a plan this turn — open the builder pre-filled instead of the
  // scene, so the plan goes INTO the builder (editable, not executed). The request is UNCONDITIONAL:
  // it fires even if a stale draft lingers (a dropped request looks exactly like the GM ignoring you),
  // replacing that leftover with the plan the player just asked for.
  if (pendingGambitProposal) {
    const p = pendingGambitProposal; pendingGambitProposal = null;
    const hadDraft = !!(gambitDraft && (gambitDraft.goal?.trim() || (gambitDraft.steps || []).some(s => s.text?.trim())));
    gambitDraft = { goal: p.goal, steps: p.steps.length ? p.steps : [{ text: "", fallback: "" }], assessed: null };
    renderGambitBuilder(`✦ The GM sketched this plan for you — edit any of it, Assess to read your odds, then Run it. Nothing has happened yet.${hadDraft ? " (Your previous unsaved draft was replaced — ↺ Start over for a blank plan.)" : ""}`);
    return;
  }
  // SNG-070: surface a just-applied GM correction as an aside, whichever path rendered this turn.
  if (character?._correctionAside) { opts = { ...opts, aside: [opts.aside, character._correctionAside].filter(Boolean).join("\n\n") }; delete character._correctionAside; }
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
    <div class="vital-row">Health <span class="vital-num" data-vital="health" tabindex="0" role="button" aria-label="Health ${character.health} of ${character.maxHealth}. Tap for detail.">${character.health} / ${character.maxHealth}</span></div>
    <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    <div class="vital-row">Energy ${infoDot("energy.no_regen")}<span class="vital-num" data-vital="energy" tabindex="0" role="button" aria-label="Energy ${character.energy} of ${character.maxEnergy}. Tap for detail.">${character.energy} / ${character.maxEnergy}</span></div>
    <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
    <details class="sidebar-sec" data-sec="attributes"${sectionOpen("attributes", false) ? " open" : ""}><summary><span class="sec-title">Attributes</span>${character.pendingSubPoints > 0 ? ` <span class="grow-badge">+${character.pendingSubPoints} to place</span>` : ""}</summary><div class="sec-body"><div class="attr-grid">
      ${SUBS.map(s => `<div style="text-transform:capitalize" title="${esc(SUB_DESC[s])} (${SUB_OF[s]})">${s}</div><div>${(character.subAttributes?.[s] ?? 0) > 6 ? (character.subAttributes[s] + " ●●●●●●⁺") : "●".repeat(character.subAttributes?.[s] ?? 0) + "○".repeat(Math.max(0, 4 - (character.subAttributes?.[s] ?? 0)))}${character.pendingSubPoints > 0 && (character.subAttributes?.[s] ?? 0) < (CONTENT.rules.leveling?.subAttributeCap ?? 6) ? ` <button class="grow-btn" data-grow="${s}">+</button>` : ""}</div>`).join("")}
    </div></div></details>
    <details class="sidebar-sec" data-sec="abilities"${sectionOpen("abilities", true) ? " open" : ""}><summary><span class="sec-title">Abilities</span>${character.skillPoints > 0 ? ` <span class="grow-badge">${character.skillPoints} skill pt</span>` : ""}</summary><div class="sec-body">
      ${canLevelUp(character) ? `<button class="opt" id="sidebar-levelup" title="Spend your skill points" style="padding:2px 8px; margin-bottom:6px; display:block">⬆ Level Up</button>` : ""}
      ${(() => {
        // SNG-047: group owned abilities by type/tradition (same taxonomy as the skill graph),
        // show each ability's FUNCTIONS as chips (what it DOES at a glance).
        const owned = character.abilities.map(a => ({ a, ab: fullCatalog()[a.abilityId] })).filter(x => x.ab);
        if (!owned.length) return "<div class='insight'>none yet</div>";
        // SNG-059: group owned abilities by TRADITION (the people they belong to), not powerSystem/reach
        const byClass = {};
        for (const o of owned) { const key = abilityTradition(o.ab) || o.ab.powerSystem || "learned"; (byClass[key] = byClass[key] || []).push(o); }
        const order = Object.keys(byClass).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b)));
        const row = ({ a, ab }) => {
          const rank = rankExpression(character, ab, a.level, CONTENT.branchForks) || ab?.tree?.find(t => t.rank === a.level);
          const p = rankProgress(character, a.abilityId); // ability-arch v2: earned, not bought
          return `<div class="ability" title="${esc(rank ? "CAN: " + rank.grants + " | CANNOT: " + rank.cannot : ab?.description || "")}">
            <span class="name entity-hover" data-entity="skill:${esc(a.abilityId)}">${esc(ab?.name || a.abilityId)}</span> <span class="tier-badge" title="Tier ${tierOf(ab.levelReq)}">${tierOf(ab.levelReq)}</span> rank ${a.level}${rank ? ` — <em>${esc(rank.name)}${rank.forked ? " ⑂" : ""}</em>` : ""}
            <span class="cost">(${effectiveEnergyCost(ab, character, CONTENT.rules)} energy${effectiveEnergyCost(ab, character, CONTENT.rules) < ab.energyCost ? `, was ${ab.energyCost}` : ""})</span>
            ${functionChips(ab)}
            <div class="hint ${p.ripe ? "practiced" : ""}">${esc(p.text)}</div></div>`;
        };
        return order.map(cls => `<details class="skill-group" open><summary>${esc(traditionLabel(cls))} <span class="cost">(${byClass[cls].length})</span></summary>${
          byClass[cls].sort((x, y) => (x.ab.levelReq || 1) - (y.ab.levelReq || 1)).map(row).join("")}</details>`).join("");
      })()}
      ${(() => {
        const canShow = character.skillPoints > 0 || (character.practice?.aspirations || []).some(a => aspirationRipe(character, a.abilityId, CONTENT.rules));
        if (!canShow) return "";
        const cap = atCapacity(character, CONTENT.skillCapacity);
        const learnable = Object.values(CONTENT.abilities).filter(ab => {
          if (character.abilities.some(a => a.abilityId === ab.id)) return false;
          if (character.skillPoints <= 0 && !aspirationRipe(character, ab.id, CONTENT.rules)) return false;
          const req = learnLevelReq(ab); // SNG-094: domain gate, not the legacy powerSystem==origin filter
          if (req === null || character.level < req) return false;
          // SNG-055: the domain gate decides what's OFFERED — the antipode of a chosen pole and
          // over-tier picks (secondary>III, tertiary>II, kin-capstones) simply aren't shown.
          return domainVerdict(ab).allowed;
        });
        const capLine = `<div class="cap-line">${breadthUsed(character)} of ${breadthCap(character, CONTENT.skillCapacity)} skills${cap ? " — at capacity; points now deepen owned skills" : ""}${cap ? " " + infoDot("lock.capacity") : ""}</div>`;
        if (!learnable.length) return capLine;
        // SNG-059: group the learn list by TRADITION (the people)
        const byClass = {};
        for (const ab of learnable) { const key = abilityTradition(ab) || ab.powerSystem || "learned"; (byClass[key] = byClass[key] || []).push(ab); }
        const groups = Object.keys(byClass).sort((a, b) => traditionLabel(a).localeCompare(traditionLabel(b))).map(cls => `<details class="learn-group"><summary>Learn ${esc(traditionLabel(cls))} <span class="cost">(${byClass[cls].length})</span></summary>${
          byClass[cls].sort((a,b)=>(a.levelReq||1)-(b.levelReq||1)).map(ab => {
            const gate = meetsLearnGate(character, ab.id, CONTENT.attributeGates);
            const capBlock = cap && ab.powerSystem !== "learned";
            const ripe = aspirationRipe(character, ab.id, CONTENT.rules);
            const dv = domainVerdict(ab); // SNG-055 band + skill-point penalty
            // SNG-BATCH-10: once domains are set the ring-distance penalty is authoritative (matches
            // the engine in learnAbility); pre-domain/legacy characters keep the old cross-class cost.
            const learnCost = character.domains?.primary ? (dv.penalty || 1) : skillPointCost(ab, character, CONTENT.skillCapacity);
            const tooExpensive = !ripe && character.skillPoints < learnCost;
            const blocked = !gate.ok || capBlock || tooExpensive;
            const bandTag = dv.band === "far" ? ", far" : dv.band === "adjacent" ? ", kin" : "";
            return `<button class="opt ${ripe ? "practiced" : ""} ${blocked ? "locked" : ""}" ${blocked ? "disabled" : `data-learn="${esc(ab.id)}"`} title="${esc(ab.description + " — " + dv.reason + (gate.ok ? "" : " · " + gate.why))}" style="margin:2px 0; display:block; width:100%"><span class="tier-badge">${tierOf(ab.levelReq)}</span> ${esc(ab.name)} <span class="cost">L${ab.levelReq || 1}${bandTag}${learnCost > 1 ? ` · ${learnCost} pts` : ""}${ripe ? " — FREE" : ""}${!gate.ok ? " 🔒 " + esc(gate.why) : capBlock ? " 🔒 at capacity" : tooExpensive ? " 🔒 need " + learnCost + " pts" : ""}</span></button>`;
          }).join("")}</details>`).join("");
        return capLine + groups;
      })()}
      ${(character.discoveries || []).length ? `<details class="skill-group discoveries" open><summary>Discoveries &amp; Combinations <span class="cost">(${character.discoveries.length})</span></summary>${character.discoveries.map(d => {
        // SNG-047: adopt the orphan combo — show the source abilities it braids (recipe parts)
        const parts = (d.abilityIds || []).map(id => fullCatalog()[id]?.name || id.replace(/-/g, " "));
        return `<div class="ability discovery-row" title="${esc(d.description || "")}">✦ <span class="name">${esc(d.name)}</span>${parts.length ? ` <span class="combo-parts">= ${parts.map(esc).join(" + ")}</span>` : ""}</div>`;
      }).join("")}</details>` : ""}
    </div></details>
    ${/* SNG-120: the old sidebar "People you know" (a duplicate of the SNG-119 "who's here" list + the full
          Character-screen roster) is GONE — its people show once, in the place-scoped section below. */""}
    <details class="sidebar-sec" data-sec="quests"${sectionOpen("quests", (character.quests || []).some(q => q.status === "active")) ? " open" : ""}><summary><span class="sec-title">Quests</span> ${infoDot("quest.routes")}${(character.quests || []).filter(q => q.status === "active").length ? ` <span class="sec-sum">(${(character.quests || []).filter(q => q.status === "active").length})</span>` : ""}</summary><div class="sec-body">
      ${(character.quests || []).filter(q => q.status === "active").map(q => { const stage = q.structured ? (q.stages?.[q.stageIndex] || q.stages?.[q.stages.length - 1]) : null;
        return `<button class="quest quest-click" data-quest="${esc(q.id)}"><span class="quest-title">${esc(q.title)}</span>${q.structured ? ` <span class="cost">✦</span>` : ""}
          <div class="quest-note">${esc(q.structured ? (stage?.objective || "resolve") : (q.progress?.length ? q.progress[q.progress.length - 1] : q.summary))}</div>
        </button>`; }).join("") || "<div class='insight'>no undertakings yet — the valley will provide</div>"}
      ${(() => { const avail = availableStructuredQuests(character, [...(CONTENT.quests || []), ...(character.personalArc ? [character.personalArc] : [])], questOfferContext(character, sceneState)); return avail.length ? `<div class="hint" style="margin-top:4px">✦ ${avail.length} quest${avail.length === 1 ? "" : "s"} to take up here</div>` : ""; })()}
      <button class="opt" id="open-questlog" style="display:block;width:100%;margin-top:4px">📜 Quest Log${(character.quests || []).some(q => q.status !== "active") ? ` — ${(character.quests || []).filter(q => q.status === "completed" || q.status === "resolved").length} done · ${(character.quests || []).filter(q => q.status === "failed").length} failed` : ""}</button>
    </div></details>
    ${(() => { // SNG-120/126: Company — Party (players) + Companions (catalog) + Allies (NPC party members, roles)
      const comps = (character.companions || []).filter(id => CONTENT.companions[id]);
      const partyOn = syncEnabled();
      // SNG-126: the unified NPC-people half — recruited members (with roles) + partner-adjacent NPCs,
      // plus present NPCs bonded strongly enough to ask along.
      const roster = companyRoster(character, { rules: CONTENT.rules });
      const inRoster = id => roster.some(r => r.npcId === id);
      const recruitable = (knownPeopleAt(character, character.currentLocationId, { locations: CONTENT.locations, npcs: CONTENT.npcs }) || [])
        .filter(p => !inRoster(p.id) && isRecruitable(character.npcRegistry?.[p.id]));
      if (!partyOn && !comps.length && !roster.length && !recruitable.length) return ""; // truly solo → the section disappears
      const count = (sharedScene?.party?.length || 0) + comps.length + roster.length;
      const partyBody = partyOn ? `<div class="company-group"><div class="sys-label">Party</div>${sharedScene ? `${sharedScene.party.map(m => `<div class="known-npc"><span class="npc-name">${m.characterId === character.id ? "you" : esc(m.name)}</span>${sharedScene.turn === m.characterId ? `<span class="rep-band trusted">turn</span>` : ""}</div>`).join("")}<div class="hint">${isMyTurn(sharedScene, character.id) ? "Your turn — act." : "Waiting for " + esc(sharedScene.party.find(m => m.characterId === sharedScene.turn)?.name || "…")}</div><button class="opt" id="party-leave" style="display:block; width:100%; margin-top:4px">Leave shared scene</button>` : `<button class="opt" id="party-find" style="display:block; width:100%">Find or start a party here</button>`}</div>` : "";
      // SNG-135: ONE tight flex row per member — name · inline badge · compact action. Roster/roles/recruit
      // gating (SNG-126) unchanged; the companion description moves to the row title (hover) instead of a
      // printed line. data-rename/part/partally/recruit hooks are identical — layout only.
      const compBody = comps.length ? `<div class="company-group"><div class="sys-label">Companions</div>${comps.map(id => { const c = CONTENT.companions[id]; const dn = character.companionNames?.[id] || c.name; const b = bondOf(character, c.id, CONTENT.rules); return `<div class="company-row" title="${esc(c.role)}${c.appearance ? " — " + c.appearance : ""}"><span class="company-name">${esc(dn)}${dn !== c.name ? ` <span class="hint">(${esc(c.name)})</span>` : ""}</span><span class="company-badge ${b.bond >= 3 ? "on" : ""}" title="bond grows through shared deeds, assists, and encounters">bond ${b.bond}${b.stage === 2 ? " · s2" : ""}</span><span class="company-actions"><button class="company-action companion-rename" data-rename="${esc(id)}" title="Name them">✎</button><button class="company-action companion-part" data-part="${esc(id)}" title="Part ways">✕</button></span></div>`; }).join("")}</div>` : "";
      const allyBody = (roster.length || recruitable.length) ? `<div class="company-group"><div class="sys-label">Allies</div>${
        roster.map(r => `<div class="company-row" title="${esc(roleBadges(r.roles))}${r.teaches ? " · teaches " + traditionLabel(r.teaches) : ""}${r.liaisonFor ? " · liaison" : ""}"><span class="company-name">${esc(r.name)}</span><span class="company-badge" title="roles they hold in your company">${esc(roleBadges(r.roles))}</span>${r.teaches ? `<span class="company-badge on" title="a trainer — their presence lets you learn this people's capstones">⚔</span>` : ""}${r.liaisonFor ? `<span class="company-badge" title="a liaison — faster standing with their people">🤝</span>` : ""}<span class="company-actions">${r.recruited ? `<button class="company-action ally-part" data-partally="${esc(r.npcId)}" title="Part ways">✕</button>` : ""}</span></div>`).join("")
      }${recruitable.map(p => `<div class="company-row" title="${esc(p.label || "at your side")}"><span class="company-name">${esc(p.name)}</span><span class="company-badge hint">${esc(p.label || "at your side")}</span><span class="company-actions"><button class="company-action recruit" data-recruit="${esc(p.id)}" title="Ask them to travel with you">＋</button></span></div>`).join("")}</div>` : "";
      return `<details class="sidebar-sec" data-sec="company"${sectionOpen("company", true) ? " open" : ""}><summary><span class="sec-title">Company</span>${count ? ` <span class="sec-sum">(${count})</span>` : ""}</summary><div class="sec-body">${partyBody}${compBody}${allyBody}</div></details>`;
    })()}
    ${(() => { // SNG-121: Items — the PINNED quick-access set; the rest is one tap away in the full Inventory
      ensurePins(character);
      const pins = pinnedItems(character), total = (character.inventory || []).length, more = total - pins.length;
      const body = `${pins.length ? pins.map(it => itemCard(it, { open: examinedItem === it.name, toggleAttr: "data-examine" })).join("") : `<div class="insight">${total ? "Nothing pinned — pin items from Inventory for quick access." : "empty-handed"}</div>`}${total ? `<button class="opt" id="open-inventory-more" style="display:block; width:100%; margin-top:4px">${more > 0 ? `＋ ${more} more in Inventory` : "Open Inventory"}</button>` : ""}`;
      return `<details class="sidebar-sec" data-sec="items"${sectionOpen("items", true) ? " open" : ""}><summary><span class="sec-title">Items</span> <span class="sec-sum">(${pins.length} pinned · ${total} total)</span></summary><div class="sec-body">${body}</div></details>`;
    })()}
    ${(() => { // SNG-119/120: standing + who's HERE (place-scoped) + the committed-partner banner, collapsible
      const hereP = knownPeopleAt(character, character.currentLocationId, { locations: CONTENT.locations, npcs: CONTENT.npcs });
      const partners = partnerAdjacentNpcs(character, CONTENT.rules);
      if (!rep && !hereP.length && !partners.length) return "";
      const body = `${partners.length ? `<div class="partner-adjacent" style="margin-bottom:6px">${partners.map(p => `<div class="known-npc partner"><span class="npc-name entity-hover" ${p.id ? `data-entity="npc:${esc(p.id)}"` : ""}>❤ ${esc(p.name)}</span> <span class="rep-band trusted" title="A committed partner — with you in all but the mechanics">${esc(p.label)} · with you</span></div>`).join("")}</div>` : ""}${rep ? `<div style="margin-bottom:4px"><span class="rep-band ${rep.band}">${rep.band} (${rep.score})</span></div>` : ""}${hereP.length ? hereP.map(p => `<div class="known-npc"><span class="npc-name entity-hover" ${p.id ? `data-entity="npc:${esc(p.id)}"` : ""}>${esc(p.name)}</span> <span class="rep-band ${p.bondType === "romantic" ? "trusted" : ""}">${esc(p.label)}</span></div>`).join("") : `<span class="insight">no one you know is here right now</span>`}`;
      return `<details class="sidebar-sec" data-sec="whoshere"${sectionOpen("whoshere", true) ? " open" : ""}><summary><span class="sec-title">${esc(location.name)} — who's here</span>${rep ? ` <span class="sec-sum">· ${rep.band}</span>` : ""}</summary><div class="sec-body">${body}</div></details>`;
    })()}
    <details class="sidebar-sec" data-sec="playstyle"${sectionOpen("playstyle", false) ? " open" : ""}><summary><span class="sec-title">Play-style</span></summary><div class="sec-body">${aptitudeChips()}</div></details>
    <details class="sidebar-sec" data-sec="maprest"${sectionOpen("maprest", false) ? " open" : ""}><summary><span class="sec-title">Map &amp; Rest</span></summary><div class="sec-body">
      <button class="opt map-open" id="open-map" style="margin:2px 0 6px; display:block; width:100%">🗺 Open Map — travel & places</button>
      <button class="opt" id="do-breather" style="margin-top:8px; display:block; width:100%">Breather (+${recoveryEnergy("breather", character, rules)} energy, 1h)</button>
      <button class="opt" id="do-rest" style="margin-top:4px; display:block; width:100%">Sleep (+${recoveryEnergy("sleep", character, rules)} energy, ${rules.recovery?.sleep?.hours ?? 8}h)</button>
    </div></details>
    <details class="sidebar-sec" data-sec="codex"${sectionOpen("codex", false) ? " open" : ""}><summary><span class="sec-title">Codex &amp; Library</span></summary><div class="sec-body">
      <button class="opt" id="open-codex" style="display:block; width:100%">${Object.keys(character.codex?.topics || {}).length} topic${Object.keys(character.codex?.topics || {}).length === 1 ? "" : "s"} discovered — open Codex</button>
      <button class="opt" id="open-library" style="display:block; width:100%; margin-top:6px">📖 The Library — read the world</button>
    </div></details>
  </div>`;

  const banner = sceneImage(location, sceneState, { ratingLevel: viewerRatingLevel() });
  const time = readClock(character.clock);
  let main = `<div class="play">
    ${banner ? `<img class="scene-banner" src="${esc(banner)}" alt="${esc(location.name)}" onerror="this.style.display='none'">` : ""}
    <div class="location-tag" ${sceneState?.setting ? `title="${esc(sceneState.setting)}"` : ""}>${esc(location.name)}${rep ? ` <span class="rep-band loc-standing ${rep.band}" title="Your standing with ${esc(CONTENT.locations[character.currentLocationId]?.name || "the people here")} — ${rep.band} (${rep.score})">· ${esc(rep.band)}</span>` : ""}<span class="time-tag" title="Your journey clock (local, play-paced) · the shared world calendar (SNG-041, real-time)">${esc(time.label)} <span class="world-day-tag">· world-day ${absoluteWorldDay()}</span></span></div>
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
      const locBits = r.locationAffinity?.length ? `<div class="roll-affinity">${r.locationAffinity.map(esc).join(" · ")} ${infoDot("roll.spectral_fit")}</div>` : "";
      const intBit = r.intensity && r.intensity !== "standard" ? ` · <span class="intensity-${esc(r.intensity)}">${esc(r.intensity)}</span>${r.energySpent != null ? ` (${r.energySpent} energy)` : ""}` : "";
      const blBit = r.surgeBacklash ? `<div class="roll-backlash">⚡ surge backlash: ${r.backlash.health} health, ${r.backlash.energy} energy</div>` : "";
      // SNG-090: the substrate receipt — the lattice thin (starved) or crowding (interference) here.
      const subBit = r.substrate ? `<div class="roll-affinity">${r.substrate.side === "starved" ? "the lattice is thin — your craft ran at" : "the lattice crowds your signal — your craft ran at"} ${r.substrate.percent}% ${infoDot("roll.spectral_fit")}</div>` : "";
      // SNG-084 Ph2: one contextual ⓘ on the roll — why it was hard (novel), suddenly easy (discovery), or the d100-vs-chance basics.
      const rollHelp = r.action?.novel ? infoDot("roll.novel") : (r.usedDiscovery || r.action?.discoveryBonus) ? infoDot("roll.discovery") : infoDot("roll.difficulty");
      // SNG-106: the chance is tappable → the full component breakdown (only when this turn retained one).
      const chanceCell = r.breakdown ? `<span class="roll-chance" data-breakdown="${esc(JSON.stringify({ ...r.breakdown, roll: r.roll, degree: r.degree }))}" tabindex="0" role="button" title="Why this number?">${r.chance}</span>` : `${r.chance}`;
      main += `<div class="roll-receipt">d100: ${r.roll} vs ${chanceCell} — <span class="${r.degree}">${r.degree.replace("_", " ")}</span> ${rollHelp}${helpers}${intBit}</div>${locBits}${subBit}${blBit}`;
    }
  }
  if (opts.itemsAdvanced?.length) main += opts.itemsAdvanced.map(a => `<div class="beat item-woke">✦ ${esc(a.itemName)} stirs — <em>${esc(a.stageName)}</em></div>`).join("");
  if (opts.thinking) main += `<div class="thinking">${esc(opts.thinking)}</div>`;
  if (opts.aside) main += `<div class="beat"><em>${opts.aside.split("\n").map(esc).join("<br>")}</em></div>`;
  if (opts.gmAside) main += `<div class="gm-aside">${opts.gmAside.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
  // SNG-122: the safety net — a travel intent that didn't move the player gets a one-tap "arrive" so
  // narrative travel and map travel converge on one path and the player is never stranded.
  if (character?._pendingArrival) {
    const p = character._pendingArrival;
    main += `<div class="arrive-banner">You're on your way to <strong>${esc(p.name)}</strong>. <button class="btn arrive-btn" id="do-arrive">→ Arrive at ${esc(p.name)}</button></div>`;
  }
  if (opts.error) main += `<div class="error-card">The GM stumbled: ${esc(opts.error)}<br><button class="btn" id="retry" style="margin-top:8px">Try again</button></div>`;

  if (turn) {
    main += `<div class="beat">${turn.narration.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
    if (turn.momentArt) main += `<div class="moment-art"><img src="${esc(turn.momentArt)}" alt="${esc(turn.sceneSummary || "a moment")}" data-lightbox="moment" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`; // SNG-035/053
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
        // SNG-116: the preview must include the SAME substrate penalty the resolve path applies — else "how
        // hard" assumes a full lattice and reads easy on thin ground where the real roll is hard.
        const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus + aff.bonus, substratePenalty: substratePenaltyFor(c, location) });
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
    // SNG-031: surface the (fully-built) gambit system on genuinely plan-apt turns
    const apt = !askMode && isGambitApt(turn) && !gambitHintDismissed && gambitHintCooldown <= 0;
    if (apt) {
      main += `<div class="gambit-hint"><span>This looks like a job for a plan.</span>
        <button class="opt" id="gambit-hint-go">⚙ Plan a Gambit</button>
        <button class="gambit-hint-x" id="gambit-hint-x" title="Not now">×</button></div>`;
    }
    main += `<div class="freeform">
      <div class="mode-chips">
        <button id="mode-act" class="mode-chip ${askMode ? "" : "active"}" title="Act in the scene">Act</button>
        <button id="mode-ask" class="mode-chip ${askMode ? "active" : ""}" title="Ask the GM out-of-character — context, rules, what your character would know. Never advances the story.">Ask GM</button>
      </div>
      <input id="freeform-input" placeholder="${askMode ? "Ask the GM anything — context, rules, what you'd know…" : "Or do something else — describe it…"}" ${busy ? "disabled" : ""}>
      <button id="freeform-go" ${busy ? "disabled" : ""}>${askMode ? "Ask" : "Act"}</button>
      <button id="gambit-open" class="mode-toggle ${apt ? "apt" : ""}" title="Plan a multi-step gambit" ${busy ? "disabled" : ""}>⚙ Plan</button></div>`;
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
    if (!confirm(`Part ways with ${character.companionNames?.[c.id] || c.name}?`)) return;
    character.companions = character.companions.filter(id => id !== c.id);
    if (character.companionBonds) delete character.companionBonds[c.id]; // SNG-126: clean part-ways — no orphan bond/name state
    if (character.companionNames) delete character.companionNames[c.id];
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${character.companionNames?.[c.id] || c.name} drifts on — for now.` });
  };
  // SNG-126: recruit a strong-bonded present NPC into your company (roles from their authored record),
  // and part ways with a recruited ally. partner is bond-derived (SNG-108), never set here.
  for (const btn of app.querySelectorAll("[data-recruit]")) btn.onclick = () => {
    const id = btn.dataset.recruit; const cat = CONTENT.npcs[id] || {}; const nm = character.npcRegistry?.[id]?.name || cat.name || "They";
    if (!confirm(`Ask ${nm} to travel with you?`)) return;
    recruit(character, id, { roles: offeredRoles(cat), teaches: cat.teaches || null, liaisonFor: cat.liaisonFor || null, day: absoluteWorldDay() });
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} joins your company${cat.teaches ? ` — they can teach you the ${traditionLabel(cat.teaches)} craft` : ""}${cat.liaisonFor ? `, and speak for you among their people` : ""}.` });
  };
  for (const btn of app.querySelectorAll("[data-partally]")) btn.onclick = () => {
    const id = btn.dataset.partally; const nm = character.npcRegistry?.[id]?.name || "They";
    if (!confirm(`Part ways with ${nm}?`)) return;
    partCompany(character, id);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${nm} parts from your company — the road may cross again.` });
  };
  // SNG-057: rename a companion (the GM + portraits use the chosen name)
  for (const btn of app.querySelectorAll("[data-rename]")) btn.onclick = () => {
    const id = btn.dataset.rename; const c = CONTENT.companions[id]; if (!c) return;
    const next = prompt(`What do you call ${c.name}?`, character.companionNames?.[id] || c.name);
    if (next === null) return;
    character.companionNames = character.companionNames || {};
    if (next.trim() && next.trim() !== c.name) character.companionNames[id] = next.trim(); else delete character.companionNames[id];
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  for (const btn of app.querySelectorAll("[data-examine]")) btn.onclick = () => {
    examinedItem = examinedItem === btn.dataset.examine ? null : btn.dataset.examine;
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  // SNG-114: the play sidebar's item use/name/drop go through the ONE shared binding (parity with the popup).
  bindItemCardHandlers(() => renderPlay(character.activeScene?.lastTurn || null, {}));
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
  // SNG-120: persist each sidebar section's open/closed state across turns + reloads (on the profile).
  for (const d of app.querySelectorAll("details.sidebar-sec[data-sec]")) d.ontoggle = () => {
    const k = d.dataset.sec;
    if (d.open) { sidebarOpen.add(k); sidebarClosed.delete(k); } else { sidebarOpen.delete(k); sidebarClosed.add(k); }
    saveSidebarState();
  };
  const moreBtn = document.getElementById("open-inventory-more"); if (moreBtn) moreBtn.onclick = () => renderInventoryScreen(); // SNG-121
  // (SNG-114: item name/drop now bound via bindItemCardHandlers above — the duplicated data-nameit/data-drop wiring is gone.)
  const restBtn = document.getElementById("do-rest"); if (restBtn) restBtn.onclick = () => rest("sleep");
  const breatherBtn = document.getElementById("do-breather"); if (breatherBtn) breatherBtn.onclick = () => rest("breather");
  const mapBtn = document.getElementById("open-map"); if (mapBtn) mapBtn.onclick = () => renderMap();
  const arriveBtn = document.getElementById("do-arrive"); if (arriveBtn) arriveBtn.onclick = () => arriveAtPending(); // SNG-122
  for (const b of app.querySelectorAll("[data-quest]")) b.onclick = () => renderQuestDetail(b.dataset.quest);
  const qlBtn = document.getElementById("open-questlog"); if (qlBtn) qlBtn.onclick = () => renderQuestLog();
  const codexBtn = document.getElementById("open-codex"); if (codexBtn) codexBtn.onclick = () => renderCodexScreen();
  const libBtn = document.getElementById("open-library"); if (libBtn) libBtn.onclick = () => renderLibrary();
  const charBtn = document.getElementById("open-character"); if (charBtn) charBtn.onclick = () => renderCharacterScreen();
  const luBtn = document.getElementById("sidebar-levelup"); if (luBtn) luBtn.onclick = () => renderLevelUp();
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
  // ability-arch v2: no rank-up handlers in the play ability panel — depth is earned through use
  // (rank 2 auto) and a GM-marked defining moment (rank 3), not bought here.
  for (const b of app.querySelectorAll("[data-learn]")) b.onclick = () => {
    const free = aspirationRipe(character, b.dataset.learn, CONTENT.rules);
    const r = learnAbility(character, b.dataset.learn, fullCatalog(), CONTENT.rules, { free, attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, traditionIndex: CONTENT.traditionIndex });
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
  if (gambitBtn) gambitBtn.onclick = () => openGambitBuilder();
  const ghGo = document.getElementById("gambit-hint-go");
  if (ghGo) ghGo.onclick = () => openGambitBuilder();
  const ghX = document.getElementById("gambit-hint-x");
  if (ghX) ghX.onclick = () => { gambitHintDismissed = true; gambitHintCooldown = 4; renderPlay(turn, opts); }; // SNG-077: dismissal sticks + a cooldown
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

/** SNG-101: the promotion commit modal — the ONE place a promotion is applied. Names the foreclosure
 *  cost (Law 9), keeps-the-ground explicit, and only ever calls promote() on an eligible domain. */
function renderPromotionModal(domainKey) {
  const e = promotionEligible(character, domainKey, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
  if (!e.eligible) { renderCharacterScreen(); return; }
  const ROM = ["", "I", "II", "III", "IV", "V"];
  const newCeiling = e.to === "primary" ? 5 : 3;
  const anti = antipodeOf(e.trad, CONTENT.traditionIndex);
  const closesNew = domainKey === "tertiary" && anti && !(character.foreclosed || []).includes(anti); // secondary→primary antipode is already closed
  document.getElementById("promote-modal")?.remove();
  const el = document.createElement("div");
  el.id = "promote-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">Become ${esc(traditionLabel(e.trad))} as your ${e.to}?</div>` +
    `<div class="fork-prompt">This raises your ceiling in ${esc(traditionLabel(e.trad))} to <strong>Tier ${ROM[newCeiling]}</strong>.` +
    (closesNew ? ` It also <strong>closes ${esc(traditionLabel(anti))}</strong> to you by ordinary means — anything you've already learned of it you keep, and the braid road remains. This is a choice about who you're becoming.` : ` The far pole of that axis was already closed to you.`) + `</div>` +
    `<div class="fork-paths"><button class="fork-path" id="promote-commit"><div class="fp-name">Commit</div><div class="fp-grants">Rise into your ${e.to}.</div></button></div>` +
    `<button class="fork-cancel" id="promote-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  document.getElementById("promote-commit").onclick = () => {
    const r = promote(character, domainKey, CONTENT.rules, { catalog: fullCatalog(), traditionIndex: CONTENT.traditionIndex });
    el.remove();
    if (r.ok) { if (character.pendingPromotion === domainKey) character.pendingPromotion = null; saveCharacter(character); }
    renderCharacterScreen();
  };
  document.getElementById("promote-cancel").onclick = () => el.remove();
}

/** SNG-102: the acquisition commit modal — the ONE place a domain is acquired. Names the antipode-
 *  foreclosure cost (Law 9); only ever calls acquireDomain on an acquirable people. */
function renderAcquisitionModal(traditionId) {
  const a = acquirable(character, traditionId, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex });
  if (!a.ok) { renderCharacterScreen(); return; }
  const anti = antipodeOf(traditionId, CONTENT.traditionIndex);
  document.getElementById("acquire-modal")?.remove();
  const el = document.createElement("div");
  el.id = "acquire-modal"; el.className = "fork-modal";
  el.innerHTML = `<div class="fork-card"><div class="fork-title">Become of the ${esc(traditionLabel(traditionId))}?</div>` +
    `<div class="fork-prompt">You join them as a <strong>novice — Tier I</strong>, however great you are elsewhere; their craft grows by the same standing as any other.` +
    (anti ? ` This <strong>closes ${esc(traditionLabel(anti))}</strong> to you by ordinary means — the far pole of their axis; the braid road remains. Reach is earned one people at a time.` : "") + `</div>` +
    `<div class="fork-paths"><button class="fork-path" id="acquire-commit"><div class="fp-name">Join</div><div class="fp-grants">Enter the ${esc(traditionLabel(traditionId))} at Tier I.</div></button></div>` +
    `<button class="fork-cancel" id="acquire-cancel">Not yet</button></div>`;
  document.body.appendChild(el);
  document.getElementById("acquire-commit").onclick = () => {
    const r = acquireDomain(character, traditionId, CONTENT.rules, { traditionIndex: CONTENT.traditionIndex });
    el.remove();
    if (r.ok) { if (character.pendingAcquisition === traditionId) character.pendingAcquisition = null; saveCharacter(character); }
    renderCharacterScreen();
  };
  document.getElementById("acquire-cancel").onclick = () => el.remove();
}

function rankOptsFor() { return { attributeGates: CONTENT.attributeGates, skillCapacity: CONTENT.skillCapacity, catalog: fullCatalog() }; }
function pct(v, max) { return Math.round((v / Math.max(1, max)) * 100); }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, v | 0)); }
