// gm_registry.js — BATCH-11 §23: THE GM CONTEXT REGISTRY (Law 16).
//
// One declared table — the single source of truth for what the model is told.
// app.js assembles the GM context by ITERATING this registry, never by
// hand-listing keys at call sites. "Does the GM know about X?" is answered by
// reading this file, not by archaeology across app.js.
//
// Each row: { key, builder, carries, reachedBy, spec, views, build(env) }
//   key      — the ctx key gm.js tierParts() destructures
//   builder  — where the value comes from (documentation; the truth is build())
//   carries  — what capability/data the row surfaces to the model
//   reachedBy— the player-facing path that makes the capability REACHABLE
//              ("always" = ambient context; otherwise a control or GM offer)
//   spec     — SYSTEM_SPEC section that CONTRACTS it
//   views    — which call sites include the row:
//              "turn"   = the play loop (runGM → gmTurn)
//              "ask"    = ask-the-GM (onAsk → gmAsk)
//              "quest"  = quest guidance button (gmAsk)
//              "gambit" = gambit-builder advise (gmAsk)
//   build(env) — the closure that produces the value. Entries are NOT assumed
//              pure; site-A ephemera arrive pre-consumed via env.ephemera so a
//              row can never double-fire a one-shot.
//
// The env bag (assembled by app.js gmEnv()):
//   character, location, CONTENT, sceneTurns, sceneState, sharedScene, profile,
//   time, resolution, playerInput, exactWords, itemAdvance, travelDirective,
//   focusQuest, recentTurnsWindow, ephemera{...}, app{ fullCatalog, FN_INDEX,
//   activeEnc, listAvailableEncounters, masteryReadyForGM, ratingLineForGM,
//   maybeLegendDetail, sharedCanonForGM }
//
// ADDING A BUILDER WITHOUT A ROW FAILS THE BUILD (tests/wiring_audit.mjs):
// a key gm.js consumes that no row provides can never land — that is the exact
// failure §23 exists to stop (challengeTypes: 45 values, read by nothing).

import { loreForLocation, eventsForGM } from "./state.js";
import { buildRegionView, newsForGM } from "./worldtick.js";
import { inventoryForGM } from "./inventory.js";
import { companionsForGM, activeCompanions } from "./companions.js";
import { questsForGM, structuredQuestsForGM } from "./quests.js";
import { npcRegistryForGM, npcQuestSeedBlock } from "./npcs.js";
import { placeMemoryForGM, recallForGM } from "./places.js";
import { assignmentsForGM } from "./assignments.js"; // SNG-191 §4: delegated commitments the world is honouring
import { abilitiesForGM } from "./progression.js";
import { codexForGM } from "./codex.js";
import { factsForGM } from "./facts.js";
import { evolvedItemsForGM } from "./evolution.js";
import { emergenceNoticeForGM } from "./practice.js";
import { detectAnomalies, anomaliesForGM } from "./corrections.js";
import { toolkitForGM } from "./toolkit.js";
import { combinationsAvailableFor } from "./skilltree.js";
import { teachersForGM } from "./company.js";
import { functionCoverage } from "./functions.js";
import { partyBlockForGM } from "./party.js";
import { narrativeRegister } from "./gm.js";
import { livingWorldForGM } from "./generate.js";
import { standingForGM } from "./standing.js"; // BATCH-12 §3
import { renderNamesDeep } from "./names.js"; // SNG-182
import { worldCount, worldCountLabel } from "./worldtime.js";
import { encounterReceiptForGM } from "./encounters.js";
import { waygateBlockForGM } from "./waygate.js";
import { readAloudDirective } from "./narration_voice.js";

const ALL = ["turn", "ask", "quest", "gambit"];

export const GM_CONTEXT = [
  // ---- core: present in every view ----
  { key: "character", builder: "env passthrough", carries: ["identity", "attributes", "state"],
    reachedBy: "always", spec: "§7", views: ALL,
    build: (env) => env.character },
  { key: "location", builder: "app.hereNow → worldtick.effectiveLocation", carries: ["place", "spectrum", "regionId"],
    reachedBy: "always", spec: "§9", views: ALL,
    build: (env) => env.location },
  { key: "region", builder: "worldtick.buildRegionView + state.eventsForGM", carries: ["region facts", "active events"],
    reachedBy: "always", spec: "§9", views: ALL,
    build: (env) => ({ ...env.CONTENT.region, activeEvents: eventsForGM(buildRegionView(env.CONTENT, env.character), env.CONTENT.events) }) },
  { key: "lore", builder: "state.loreForLocation", carries: ["local lore"],
    reachedBy: "always", spec: "§9", views: ALL,
    build: (env) => loreForLocation(env.location, env.CONTENT.lore) },
  { key: "rules", builder: "CONTENT.rules", carries: ["world rules", "recovery", "precursor bands"],
    reachedBy: "always", spec: "§7", views: ALL,
    build: (env) => env.CONTENT.rules },
  { key: "recentTurns", builder: "app.sceneTurns window", carries: ["scene history"],
    reachedBy: "always", spec: "§11", views: ALL,
    build: (env) => env.sceneTurns.slice(-(env.recentTurnsWindow ?? 6)) },
  { key: "timeLabel", builder: "worldtime.readClock", carries: ["time of day"],
    reachedBy: "always", spec: "§10", views: ALL,
    build: (env) => env.time.label },
  { key: "npcRegistryDetail", builder: "npcs.npcRegistryForGM", carries: ["known people", "bonds", "gender/pronouns"],
    reachedBy: "always", spec: "§13", views: ALL,
    build: (env) => npcRegistryForGM(env.character, { locationId: env.character.currentLocationId, sceneNpcNames: (env.sceneState?.npcsPresent || []).map(n => n.name) }) },

  // SNG-167 §2: a LOCATION can start an arc and a PERSON cannot — rule 10 weaves the location's
  // questSeeds and there is no equivalent for anyone you meet. That is backwards: the memorable arcs
  // start with someone, not somewhere. 0 of 47 authored NPCs carry seeds and 45 carry `wants`, so
  // the want is the fallback premise rather than a reason to wait for a content pass.
  { key: "npcSeedDetail", builder: "npcs.npcQuestSeedBlock (SNG-167 §2)", carries: ["quest seeds carried by the PEOPLE present"],
    reachedBy: "GM offer (rule 10b)", spec: "SNG-167 §2", views: ["turn", "ask"],
    build: (env) => npcQuestSeedBlock(env.character, {
      npcs: env.CONTENT.npcs, locationId: env.character.currentLocationId,
      sceneNpcNames: (env.sceneState?.npcsPresent || []).map(n => n.name)
    }) },

  // SNG-179: the id vocabulary itself. World tier — it is stable for the whole game, so it caches
  // once and costs nothing per turn. ~27 ids and their names.
  { key: "traditionVocab", builder: "CONTENT.traditionIndex ids + names (SNG-179)", carries: ["the valid traditionId enum"],
    reachedBy: "always", spec: "SNG-179", views: ALL,
    build: (env) => {
      const by = env.CONTENT.traditionIndex?.byId || {};
      const rows = Object.values(by).filter(t => t?.traditionId).map(t => `${t.traditionId} = ${t.name || t.traditionId}`);
      return rows.length ? rows.join(" · ") : "";
    } },

  // BATCH-12 §3: who regards you how, across BOTH holder kinds. Without this the GM could describe a
  // people's welcome only from the settlement deed-reputation it already had, so a character the
  // Radiants counted as kin was met by strangers.
  { key: "standingDetail", builder: "standing.standingForGM", carries: ["people standing", "settlement standing", "bands"],
    reachedBy: "always", spec: "BATCH-12 §3", views: ALL,
    build: (env) => standingForGM(env.character, env.CONTENT.rules, { settlements: [env.location?.communityId].filter(Boolean) }) },

  // SNG-176: every other world block is keyed to where the character is STANDING, which is exactly
  // wrong for memory — a mother's house, a hometown, a grave are the places you are not standing in
  // when you speak of them. This row is keyed to the QUESTION instead, and costs nothing on a turn
  // that names nowhere.
  { key: "recalledDetail", builder: "places.recallForGM (SNG-176)", carries: ["places the question named, from anywhere in the save"],
    reachedBy: "always (empty unless the player names a known place)", spec: "SNG-176", views: ALL,
    build: (env) => recallForGM(env.character, `${env.playerInput || ""} ${env.exactWords || ""}`, {
      locations: env.CONTENT.locations, isKnown: env.app.isPlaceKnown || null
    }) },

  // ---- shared by turn + ask + gambit ----
  { key: "inventoryDetail", builder: "inventory.inventoryForGM", carries: ["carried items", "uses"],
    reachedBy: "always", spec: "§12", views: ["turn", "ask", "gambit"],
    build: (env) => inventoryForGM(env.character) },
  { key: "sceneState", builder: "app scene state", carries: ["who/what is present now"],
    reachedBy: "always", spec: "§11", views: ["turn", "ask", "gambit"],
    build: (env) => env.sceneState },
  { key: "abilityLawDetail", builder: "progression.abilitiesForGM", carries: ["abilities", "ranks", "energy", "harmRung"],
    reachedBy: "always", spec: "§7", views: ["turn", "ask", "gambit"],
    build: (env) => abilitiesForGM(env.character, env.app.fullCatalog(), env.CONTENT.branchForks, env.CONTENT.rules) },

  // ---- shared by turn + ask + quest ----
  { key: "questsDetail", builder: "quests.questsForGM", carries: ["quest log"],
    reachedBy: "quest log screen", spec: "§14", views: ["turn", "ask", "quest"],
    build: (env) => questsForGM(env.character) },
  { key: "structuredQuestsDetail", builder: "quests.structuredQuestsForGM", carries: ["active structured quests", "stages", "personalArc once taken"],
    reachedBy: "quest log 'Take it on'", spec: "§14", views: ["turn", "ask", "quest"],
    build: (env) => structuredQuestsForGM(env.character, { npcs: env.CONTENT.npcs }) },
  { key: "codexDetail", builder: "codex.codexForGM", carries: ["codex topics", "known facts"],
    reachedBy: "codex screen", spec: "§13", views: ["turn", "ask", "quest"],
    build: (env) => codexForGM(env.character, { playerInput: env.playerInput || env.exactWords || "", locationId: env.character.currentLocationId, questTitles: env.focusQuest ? [env.focusQuest.title] : (env.character.quests || []).filter(q => q.status === "active").map(q => q.title) }) },

  // ---- shared by turn + ask ----
  { key: "companionsDetail", builder: "companions.companionsForGM", carries: ["companion capabilities"],
    reachedBy: "company section", spec: "§13", views: ["turn", "ask"],
    build: (env) => companionsForGM(activeCompanions(env.character, env.CONTENT.companions), env.character, env.CONTENT.rules) },
  { key: "placeMemoryDetail", builder: "places.placeMemoryForGM", carries: ["what happened here before"],
    reachedBy: "always", spec: "§9", views: ["turn", "ask"],
    build: (env) => placeMemoryForGM(env.character, env.character.currentLocationId) },
  { key: "newsDetail", builder: "worldtick.newsForGM", carries: ["world-tick news"],
    reachedBy: "always", spec: "§19", views: ["turn", "ask"],
    build: (env) => newsForGM(env.character) },

  // ---- turn-only: pass-throughs from runGM's own parameters ----
  { key: "resolution", builder: "runGM param (resolve.resolveAction)", carries: ["this action's mechanical outcome"],
    reachedBy: "action choice", spec: "§8", views: ["turn"],
    build: (env) => env.resolution },
  { key: "playerInput", builder: "runGM param", carries: ["the player's words/synthetic beat"],
    reachedBy: "input box", spec: "§11", views: ["turn"],
    build: (env) => env.playerInput },
  { key: "exactWords", builder: "runGM param", carries: ["the player's literal input"],
    reachedBy: "input box", spec: "§11", views: ["turn"],
    build: (env) => env.exactWords },
  { key: "travelDirective", builder: "app.buildTravelDirective", carries: ["MUST-emit moveTo + reachable places"],
    reachedBy: "travel intent", spec: "§9", views: ["turn"],
    build: (env) => env.travelDirective },
  { key: "itemAdvance", builder: "evolution stage advance (runGM param)", carries: ["an item just woke a stage"],
    reachedBy: "item use", spec: "§12", views: ["turn"],
    build: (env) => (env.itemAdvance || []).map(a => `${a.itemName} has woken to Stage ${a.stage} "${a.stageName}": ${a.narrationHints}${a.grant ? ` (${a.grant})` : ""}`).join("; ") || null },

  // ---- turn-only: one-shot ephemera (consumed by runGM BEFORE assembly) ----
  { key: "encounterWeaveDetail", builder: "app pendingWeave (SNG-075)", carries: ["an encounter to weave into THIS beat"],
    reachedBy: "narrative-time roll", spec: "§15", views: ["turn"],
    build: (env) => env.ephemera?.encounterWeaveDetail ?? null },
  { key: "worldPressureDetail", builder: "app pendingPressure (SNG-080)", carries: ["quiet-turn world push"],
    reachedBy: "always (paced)", spec: "§19", views: ["turn"],
    build: (env) => env.ephemera?.worldPressureDetail ?? null },
  { key: "substrateDetail", builder: "app pendingSubstrateNote (SNG-090)", carries: ["lattice density here"],
    reachedBy: "always (location)", spec: "§6", views: ["turn"],
    build: (env) => env.ephemera?.substrateDetail ?? null },
  { key: "romanceGuidanceDetail", builder: "CONTENT.romanceGuidance on tagged intent", carries: ["romance craft guidance at rating"],
    reachedBy: "flirtatious intent", spec: "§17", views: ["turn"],
    build: (env) => env.ephemera?.romanceGuidanceDetail ?? null },

  // ---- turn-only: built fresh each turn ----
  { key: "factsDetail", builder: "facts.factsForGM", carries: ["pinned findable facts"],
    reachedBy: "always", spec: "§13", views: ["turn"],
    build: (env) => factsForGM(env.character) },
  { key: "evolvedItemsDetail", builder: "evolution.evolvedItemsForGM", carries: ["evolving items' stages"],
    reachedBy: "item use", spec: "§12", views: ["turn"],
    build: (env) => evolvedItemsForGM(env.character, env.CONTENT.items) },
  { key: "opLossNote", builder: "character.opLossPending (SNG-009)", carries: ["restate lost ops directive"],
    reachedBy: "always (self-heal)", spec: "§11", views: ["turn"],
    build: (env) => env.character.opLossPending ? "The previous turn's structured updates failed to apply. Restate NOW, as ops, any quest/npc/place/codex/FACT updates that occurred last beat — INCLUDING any name reveal (revealName) or established fact the fiction set. The narration advanced; the state did not." : null },
  { key: "emergenceDetail", builder: "practice.emergenceNoticeForGM", carries: ["ripe combos/branches"],
    reachedBy: "practice", spec: "§7", views: ["turn"],
    build: (env) => emergenceNoticeForGM(env.character, env.CONTENT.emergence, env.CONTENT.rules) },
  { key: "perilNote", builder: "character.precursorAxes band", carries: ["precursor is changing them"],
    reachedBy: "precursor use", spec: "§6", views: ["turn"],
    build: (env) => (env.character.precursorAxes || []).length ? `Precursor use has pushed the character's own vector past ±${env.CONTENT.rules.precursor?.bandNotice ?? 0.4} on: ${env.character.precursorAxes.join(", ")}. They are being changed by what they wield — let it show.` : null },
  { key: "encounterDetail", builder: "encounters.encounterReceiptForGM", carries: ["active encounter receipt"],
    reachedBy: "encounter offer", spec: "§15", views: ["turn"],
    build: (env) => env.resolution?.encounterReceipt || (env.app.activeEnc() ? encounterReceiptForGM(env.app.activeEnc().state, env.app.activeEnc().def, null, null) : null) },
  { key: "masteryDetail", builder: "app.masteryReadyForGM (ability-arch v2)", carries: ["rank-2 crafts ripe for a defining moment"],
    reachedBy: "practice", spec: "§7", views: ["turn"],
    build: (env) => env.app.masteryReadyForGM() },
  { key: "anomalyDetail", builder: "corrections.detectAnomalies→anomaliesForGM (SNG-137)", carries: ["POSSIBLE ERROR repairs"],
    reachedBy: "Repair panel", spec: "§11", views: ["turn"],
    build: (env) => anomaliesForGM(detectAnomalies(env.character, { rules: env.CONTENT.rules })) },
  // SNG-175 §3.3: teachers appeared in NONE of the 48 rows. The teacher GATE existed — it decided
  // what a player was permitted to learn — but nothing ever made a teacher ACT. Erik held a Radiant
  // teacher and a bound Ashwarden teacher and was taught nothing, because permission is not
  // initiative. This is the row that lets them offer the next step themselves.
  { key: "teacherDetail", builder: "company.teachersForGM (SNG-175)", carries: ["what each bonded teacher can teach", "the next step THEY would choose", "braids that tradition opens"],
    reachedBy: "GM offer in the fiction (rule 16B)", spec: "SNG-175 §3", views: ["turn", "ask"],
    build: (env) => teachersForGM(env.character, {
      catalog: env.app.fullCatalog(), traditionIndex: env.CONTENT.traditionIndex, npcs: env.CONTENT.npcs,
      combosFor: (t) => combinationsAvailableFor(t, env.character, env.app.fullCatalog())
    }) },

  { key: "toolkitDetail", builder: "toolkit.toolkitForGM (SNG-142)", carries: ["what the player COULD reach for"],
    reachedBy: "GM offer (rule 16B)", spec: "§7", views: ["turn"],
    build: (env) => toolkitForGM(env.character, {
      catalog: env.app.fullCatalog(), fnIndex: env.app.FN_INDEX(), rules: env.CONTENT.rules,
      coverageMissing: functionCoverage(env.character, env.app.fullCatalog(), env.app.FN_INDEX()).missing,
      companions: activeCompanions(env.character, env.CONTENT.companions),
      party: env.sharedScene ? env.sharedScene.party.filter(m => m.characterId !== env.character.id) : [],
      day: env.worldDay ?? null   // SNG-173: recency needs a clock, or the quiet-craft pool cannot judge
    }) },
  { key: "availableEncounters", builder: "app.listAvailableEncounters", carries: ["encounters the GM may fire"],
    reachedBy: "GM offer + decline path", spec: "§15", views: ["turn"],
    build: (env) => env.app.activeEnc() ? null : env.app.listAvailableEncounters() },
  { key: "partyDetail", builder: "party.partyBlockForGM", carries: ["co-present players", "their last beats"],
    reachedBy: "shared scene join", spec: "§18", views: ["turn"],
    build: (env) => partyBlockForGM(env.sharedScene, env.character.id) },
  { key: "ratingDetail", builder: "app.ratingLineForGM (rating + bluntness)", carries: ["content ceiling + register"],
    reachedBy: "settings", spec: "§17", views: ["turn"],
    build: (env) => env.app.ratingLineForGM() },
  { key: "registerDetail", builder: "gm.narrativeRegister (SNG-048/144)", carries: ["place voice, plainness-dialed"],
    reachedBy: "settings", spec: "§17", views: ["turn"],
    build: (env) => narrativeRegister(env.location, env.profile?.plainness).cue },
  { key: "legendDetail", builder: "app.maybeLegendDetail (SNG-042)", carries: ["a great figure surfaces (governed)"],
    reachedBy: "qualifying beat", spec: "§16", views: ["turn"],
    build: (env) => env.app.maybeLegendDetail() },
  { key: "livingWorldDetail", builder: "generate.livingWorldForGM", carries: ["live grown content"],
    reachedBy: "always", spec: "§19", views: ["turn"],
    build: (env) => livingWorldForGM(env.character, { locationId: env.character.currentLocationId, day: env.time.day }) },
  { key: "assignmentsDetail", builder: "assignments.assignmentsForGM (SNG-191 §4)", carries: ["delegated commitments the world is honouring while away"],
    reachedBy: "the player putting a known person in charge of ongoing work (delegateOps)", spec: "§4", views: ["turn"],
    build: (env) => assignmentsForGM(env.character.worldState) },
  { key: "sharedCanonDetail", builder: "app.sharedCanonForGM", carries: ["other players' promoted canon"],
    reachedBy: "always (rating-lensed)", spec: "§18", views: ["turn"],
    build: (env) => env.app.sharedCanonForGM() },
  { key: "worldCountLabel", builder: "worldtime.worldCount + worldCountLabel (SNG-191)", carries: ["the world count in the LOCAL people's idiom — a shared ordering mark, never a date"],
    reachedBy: "always", spec: "§2/§10", views: ["turn"],
    build: (env) => {
      // SNG-191 §2: the count is one number underneath, spoken in the idiom of the people whose region
      // the character stands in. Resolve that people from the location's region (region → home tradition).
      const loc = env.CONTENT?.locations?.[env.character?.currentLocationId];
      const regionId = loc?.regionId || loc?.region || null;
      const byId = env.CONTENT?.traditionIndex?.byId || {};
      const people = regionId ? (Object.values(byId).find(t => t?.region === regionId)?.traditionId || null) : null;
      return worldCountLabel(worldCount(), env.CONTENT?.worldClock, people);
    } },
  { key: "waygateDetail", builder: "waygate.waygateBlockForGM (SNG-148)", carries: ["gate here", "aimable gates", "hub routing"],
    reachedBy: "map ◈ Waygate control + GM offer", spec: "§9", views: ["turn"],
    build: (env) => waygateBlockForGM(env.character, env.CONTENT.locations) },
  // CCODE-03: scenes were never closing (a real save ran 169 beats in ONE scene), so the chronicle
  // stayed thin and the save bloated. The contract now tells the GM when to close; this tells it
  // that THIS scene has run long. Silent until it matters — pressure, not nagging (the SNG-080 shape).
  // SNG-155 §3a: read-aloud is a PROSE CONSTRAINT, not only an output channel — so it belongs in
  // the context the model writes from, not in the audio layer. Rides SNG-144's per-profile dials
  // rather than inventing a second style system. Null (and free) in a silent session.
  { key: "readAloudDetail", builder: "narration_voice.readAloudDirective (SNG-155)", carries: ["spoken at a table", "write for the ear"],
    reachedBy: "Settings → read aloud + the ▶ speak control", spec: "§16b", views: ["turn"],
    build: (env) => readAloudDirective(env.profile?.readAloud) },
  { key: "scenePacingDetail", builder: "gm_registry (scene length pressure)", carries: ["scene has run long", "find its close"],
    reachedBy: "always (paced)", spec: "§11", views: ["turn"],
    build: (env) => {
      const n = env.sceneTurns?.length || 0;
      if (n < 18) return null;
      return n >= 30
        ? `THIS SCENE HAS RUN ${n} BEATS — far past a natural length. Bring it to an honest close THIS BEAT unless the character is mid-action: let the moment finish, and emit "sceneEnded": true with a sceneSummary covering the whole scene. A new scene opens on the next beat.`
        : `This scene has run ${n} beats. Start looking for its natural close — when the current exchange resolves, end it ("sceneEnded": true) with a summing-up. Do not force it mid-action.`;
    } },
];

/** Assemble the GM context for a view by ITERATING the registry (Law 16 / §23.2).
 *  This is the ONLY sanctioned way to build a gmTurn/gmAsk ctx. */
export function assembleGMContext(view, env) {
  const ctx = {};
  for (const row of GM_CONTEXT) {
    if (!row.views.includes(view)) continue;
    ctx[row.key] = row.build(env);
  }
  // SNG-182 §2.5: THE GM GETS NAMES, NOT TOKENS. This is the single choke point every view already
  // passes through, so resolving here means no builder has to remember to — and the model can never
  // see token syntax and start inventing it. Per-character, because SNG-111's progressive naming
  // makes the same id read differently to someone who has learned it (which is also why this cannot
  // happen at content load). A no-op on the overwhelming majority of blocks: renderNames returns the
  // string untouched unless it actually contains "{{".
  return renderNamesDeep(ctx, env.CONTENT || {}, { character: env.character });
}

/** The keys a view produces — for the wiring audit's parity check. */
export function registryKeys(view = null) {
  return GM_CONTEXT.filter(r => !view || r.views.includes(view)).map(r => r.key);
}
