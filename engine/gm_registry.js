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

import { loreForLocation, eventsForGM, traditionMotivationsForGM } from "./state.js";
import { buildRegionView, newsForGM, worldArcsForGM } from "./worldtick.js";
import { inventoryForGM } from "./inventory.js";
import { companionsForGM, activeCompanions } from "./companions.js";
import { questsForGM, structuredQuestsForGM, traditionArcForGM, npcQuestsForGM, practicedTraditions } from "./quests.js";
import { legendsForGM } from "./legends.js"; // SNG-208 wiring: legends pursuable as teachers + wants-as-quests
import { wakesForGM } from "./wake.js"; // SNG-204: the aftermath waiting to become the next thread
import { priceLine } from "./economy.js";   // SNG-302: what a thing fetches HERE, so the GM can be honest about it
import { reachableDeadForGM } from "./death.js"; // SNG-209: the dead who are NOT gone — reachable in the death state, latent hooks
import { threatToPlayer, guardiansFor, worldRoster } from "./worldtick.js"; // SNG-310: the mark the world engine leaves for the GM to narrate
import { npcRegistryForGM, npcQuestSeedBlock } from "./npcs.js";
import { placeMemoryForGM, recallForGM } from "./places.js";
import { assignmentsForGM } from "./assignments.js"; // SNG-191 §4: delegated commitments the world is honouring
import { arcsForGM, seasonalDetailForGM } from "./latentarcs.js"; // SNG-191 §7: surfaced arcs + §7.4 seasonal pressure
import { schoolsDetailForGM } from "./substrate.js"; // SNG-193b §3.6: the GM knows a character's school, not just their tradition
import { abilitiesForGM } from "./progression.js";
import { codexForGM } from "./codex.js";
import { factsForGM } from "./facts.js";
import { evolvedItemsForGM } from "./evolution.js";
import { emergenceNoticeForGM } from "./practice.js";
import { detectAnomalies, anomaliesForGM, repairPanelForGM } from "./corrections.js";
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
  { key: "traditionMotiveDetail", builder: "state.traditionMotivationsForGM", carries: ["why the in-play traditions act", "what their craft dreads (bestiary fear)"],
    reachedBy: "when tradition_motivations is loaded + a tradition is in play", spec: "§9 / SNG-229 §2c", views: ALL,
    build: (env) => {
      const doc = env.CONTENT.traditionMotivations;
      if (!doc) return "";
      const d = env.character?.domains || {};
      const ids = [d.primary, d.secondary, d.tertiary, ...(env.character?.domainsAcquired || [])];
      const npcs = env.CONTENT.npcs || {};
      for (const n of (env.sceneState?.npcsPresent || [])) {                 // the people in the scene: their craft's motive too
        const rec = (n.id && npcs[n.id]) || Object.values(npcs).find(x => x && x.name === n.name);
        if (rec?.domains?.primary) ids.push(rec.domains.primary);
      }
      const by = env.CONTENT.traditionIndex?.byId || {};
      return traditionMotivationsForGM(doc, ids, { bestiary: env.CONTENT.bestiary, labelOf: id => by[id]?.name || by[id]?.label || null });
    } },
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
    build: (env) => npcRegistryForGM(env.character, { locationId: env.character.currentLocationId, sceneNpcNames: (env.sceneState?.npcsPresent || []).map(n => n.name), interiority: env.CONTENT?.npcInteriority, communityId: env.location?.communityId ?? null, rules: env.CONTENT?.rules }) }, // SNG-233 §2b: drives fold into the NPC block

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
  // SNG-302 — WHAT IT FETCHES HERE. Aevi: "traders are NPCs not shops — the price model exists so the GM has
  // a number to be honest about, not so a UI can render a catalogue." So this hands the GM the numbers for
  // what the player is actually carrying, in the region they are actually in, and lets them say it in
  // character. ⛔ An irreplaceable thing comes through as a REFUSAL, never a big number.
  { key: "worthHereDetail", builder: "economy.priceLine (SNG-302)", carries: ["what a carried thing fetches here", "why"],
    reachedBy: "carrying anything, anywhere with an economy", spec: "§15", views: ["turn"],
    build: (env) => {
      const economy = env.CONTENT?.rules?.economy;
      const region = env.location?.regionId || env.location?.region || null;
      if (!economy || !region) return null;
      const lines = [];
      for (const it of (env.character?.inventory || []).slice(0, 8)) {
        const l = priceLine(it, region, { economy, effects: env.arcEffects || [] });
        if (l) lines.push(`${it.name}: ${l.text}`);
      }
      return lines.length ? lines.join(" · ") : null;
    } },
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
  // SNG-203 tier-2: the character's live tradition arc (finding→proving→ultimate), gated on teacher standing.
  { key: "traditionArcDetail", builder: "quests.traditionArcForGM", carries: ["tradition arc beat", "teacher", "the beat's quest", "capstone-is-a-scene"],
    reachedBy: "always (a practiced tradition with an authored arc)", spec: "SNG-203 §4", views: ["turn", "ask", "quest"],
    build: (env) => traditionArcForGM(env.character, env.CONTENT) },
  // SNG-203 tier-6: offerable NPC errands whose giver the character already knows (in the registry).
  { key: "npcErrandsDetail", builder: "quests.npcQuestsForGM", carries: ["offerable errands", "giver want/task/reward"],
    reachedBy: "always (a known errand-giver)", spec: "SNG-203 §5", views: ["turn", "ask"],
    build: (env) => npcQuestsForGM(env.character, env.CONTENT, { knownGivers: new Set(Object.keys(env.character.npcRegistry || {})) }) },
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
  // SNG-203 §3: the shared, public state of the valley's greater arcs (truth sealed) — so the GM weaves the moving world.
  { key: "worldArcsDetail", builder: "worldtick.worldArcsForGM", carries: ["greater arcs' public stage", "what has moved on the shared clock"],
    reachedBy: "always", spec: "SNG-203 §3", views: ["turn", "ask"],
    build: (env) => worldArcsForGM(env.CONTENT, env.character) },
  // SNG-208 wiring: the great figures the character can PURSUE — legendary teachers of a craft they practice, and near-by wants to aid/oppose.
  { key: "legendsPursuableDetail", builder: "legends.legendsForGM (SNG-208)", carries: ["legendary teachers to seek", "great figures' wants as quest hooks"],
    reachedBy: "always (a practiced tradition or a legend at hand)", spec: "SNG-208 wiring", views: ["turn", "ask"],
    build: (env) => legendsForGM(env.character, env.CONTENT, {
      practiced: practicedTraditions(env.character, env.CONTENT),
      deadIds: new Set(Object.entries(env.character?.worldState?.epicStatus || {}).filter(([, s]) => s?.status === "dead").map(([id]) => id))
    }) },
  // SNG-204: the open WAKES — resolved consequences waiting to become the next thread; the GM weaves them out.
  { key: "wakesDetail", builder: "wake.wakesForGM (SNG-204)", carries: ["open wakes", "the pressure each pushes", "the next thread to weave"],
    reachedBy: "always (a significant outcome recently resolved)", spec: "SNG-204 §OQ1", views: ["turn", "ask"],
    build: (env) => wakesForGM(env.character, env.CONTENT) },
  // SNG-209 §1: the reachable DEAD — figures in the death state at a depth the roads back still reach. A killed
  // figure is a latent hook, not a void; the GM narrates them so death reads as a hard wall, never a delete.
  // SNG-273: an advanced arc is felt in how PEOPLE are, not only in what things cost. Prose, not a number —
  // the GM reads it as the mood of the room rather than a modifier.
  { key: "arcMoodDetail", builder: "arceffects.npcMoodLines (SNG-273)", carries: ["how people are carrying themselves", "why"],
    reachedBy: "a greater arc at a stage that changes mood", spec: "§25.3", views: ["turn"],
    build: (env) => (env.arcMoods?.length ? env.arcMoods : null) },
  { key: "reachableDeadDetail", builder: "death.reachableDeadForGM (SNG-209)", carries: ["the dead still within reach", "how deep each has sunk (the wall)"],
    reachedBy: "always (a figure has died and is not yet sealed)", spec: "SNG-209 §1", views: ["turn", "ask"],
    build: (env) => reachableDeadForGM(env.character, env.CONTENT, env.character?.worldState?.lastTickWorldDay ?? null) },

  // SNG-310 — ⚠️ SOMEBODY IS OUT TO GET YOU, AND THE GM HAS TO KNOW OR IT NEVER HAPPENS. Erik: "yes the
  // player can be struck, but that event is a GM narrated encounter. The fact that someone is out to get you
  // triggers it though." The world engine MARKS and never resolves; this is the seam where the mark becomes
  // something a scene can be made of. Without this entry the whole mechanic is a field nobody reads — the
  // PromisedButUnread family aimed at the sharpest consequence in the game.
  { key: "threatToPlayer", builder: "worldtick.threatToPlayer (SNG-310)",
    carries: ["that someone has been sent for the player", "who, WHEN THEY DECLARED IT", "how many have not"],
    reachedBy: "the offscreen world chose the player as a strike target while they held a contested front",
    spec: "SNG-310", views: ["turn", "ask"],
    build: (env) => threatToPlayer(env.character?.worldState) },

  // SNG-311 — ⛔ AND WHO IS STANDING OVER THEM. The symmetric half of SNG-310: a marked FIGURE has always
  // been able to draw a guard, and the player was the one marked party nobody could stand over. Same rule as
  // retrieval — somebody who shares the care comes — and the same cost: a front they are not pushing.
  { key: "guardiansDetail", builder: "worldtick.guardiansFor (SNG-311)",
    carries: ["who has put themselves between the player and what is coming", "what they share with the player", "what it is costing them"],
    reachedBy: "the player is marked for a strike and someone alive shares the care it is about",
    spec: "SNG-311", views: ["turn", "ask"],
    build: (env) => guardiansFor(env.character?.worldState, worldRoster(env.character?.worldState || {}, env.CONTENT || {}),
                                 env.character?.worldState?.lastTickWorldDay ?? 0,
                                 env.CONTENT?.rules?.arcResponse || {}) },

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
  { key: "encounterOfferDetail", builder: "app pendingEncounterOffer (SNG-236 fix A)", carries: ["a STRUCTURED encounter the roll turned up — the GM MUST present it THIS beat as a framed encounterId choice (hard, not the soft rule-18 offer)"],
    reachedBy: "the narrative-time roll picking a STRUCTURED (duel/challenge) entry — the engine decides, the model no longer judges 'when the fiction invites it' (the Silas fix)", spec: "SNG-236", views: ["turn"],
    build: (env) => env.ephemera?.encounterOfferDetail ?? null },
  { key: "fightFramingDetail", builder: "app pendingFightFraming (SNG-246 Fix A, fallback b)", carries: ["the player COMMITTED a killing blow the engine could not attribute to a named person — the GM MUST frame it as a bounded fight and emit newEncounter for whoever it already narrated"],
    reachedBy: "a confirmed harm-rung intent with NO active encounter AND no target resolvable from the choice (harmTargetFor returned null). When the target DOES resolve, the engine mints and enters the duel itself and this never fires — the directive is only for the case where inventing a person would be the alternative", spec: "SNG-246 Fix A", views: ["turn"],
    build: (env) => env.ephemera?.fightFramingDetail ?? null },
  { key: "abilityGrantDetail", builder: "app abilityGrantDetail (live finding 2026-08-01)", carries: ["a craft was TAUGHT TO COMPLETION this beat — the GM MUST emit newAbility, with a `functions` array from the closed verb vocabulary"],
    reachedBy: "the player's own input carrying BOTH a teaching word and a completion word (narrow on purpose — mid-lesson must not fire). Found by the live GM suite: newAbility never fired, on a meta-instruction OR a clean in-fiction beat, because it had no hard directive anywhere — a SOFT rule against 114 MUSTs, exactly where itemUpdates was before SNG-251 §2a. Without it, sanitizeNewAbility (and its functions fix) effectively never runs in play", spec: "SNG-251 §2a pattern", views: ["turn"],
    build: (env) => env.ephemera?.abilityGrantDetail ?? null },
  { key: "stageRevealDetail", builder: "app pendingStageReveal (SNG-239)", carries: ["a quest stage's EARNED reveal (change) the GM MUST state PLAINLY this beat — the earned truth paid out, not withheld"],
    reachedBy: "a stageOp completing a stage last beat — the engine knows the reveal is EARNED and hands it hard, so the QUEST CLARITY rule isn't left soft under the 114-MUST load (the SNG-237 lesson)", spec: "SNG-239", views: ["turn"],
    build: (env) => env.ephemera?.stageRevealDetail ?? null },
  { key: "itemEvolveDetail", builder: "app itemEvolveDetail (SNG-251 §2a)", carries: ["the player did real WORK on an item they HOLD, in their own words — the GM MUST emit itemUpdates this turn (prose + imagePrompt + explicit `grants` when the fiction earned power), and deriveItem if the work split it"],
    reachedBy: "the player's own input naming a carried item AND a verb of MAKING (bind/seat/reforge/inscribe/temper/seal/split…). Deliberately narrow: this is a HARD directive and a false positive spends one on an ordinary turn. Erik bound rune-threads into a spear and the GM never fired the op — itemUpdates is one of 114 MUSTs and drops under saturation (the SNG-237/246 class), so the ENGINE decides the beat happened rather than hoping the model remembers", spec: "SNG-251 §2a", views: ["turn"],
    build: (env) => env.ephemera?.itemEvolveDetail ?? null },
  { key: "worldPressureDetail", builder: "app pendingPressure (SNG-080)", carries: ["quiet-turn world push"],
    reachedBy: "always (paced)", spec: "§19", views: ["turn"],
    build: (env) => env.ephemera?.worldPressureDetail ?? null },
  { key: "offerDetail", builder: "pacing.roomForAnOffer + npcs.npcFearsForGM (SNG-194 §4b)", carries: ["a room-computed invitation to introduce ONE unprompted thing this beat, with present people's FEARS as material"],
    reachedBy: "the ENGINE finding room this beat (a lull or arrival, no encounter/gambit/intent grip, off cooldown) — the model never judges it", spec: "SNG-194", views: ["turn"],
    build: (env) => env.ephemera?.offerDetail ?? null },
  { key: "teacherOfferDetail", builder: "pacing.roomForATeacherOffer + company.teacherOfferReady (SNG-195 G2)", carries: ["a present teacher's reachable next step, engine-gated to fire as initiative — the fix for teachers that teach nothing"],
    reachedBy: "the ENGINE finding a present teacher with a reachable next step + room this beat (not the same beat as the general offer) — the model no longer judges 'when the moment fits'", spec: "SNG-195 G2", views: ["turn"],
    build: (env) => env.ephemera?.teacherOfferDetail ?? null },
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
  // SNG-207 §6.2: the authoritative Repair-panel capability — so the GM never hallucinates a fix-screen control or deflects to a missing one.
  { key: "repairPanelDetail", builder: "corrections.repairPanelForGM (SNG-207)", carries: ["exact fix-screen capability", "act-don't-deflect rule"],
    reachedBy: "always (any state-fix ask)", spec: "SNG-207 §6.2", views: ["turn"],
    build: (env) => repairPanelForGM(env.CONTENT.repairPanelManifest) },
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
  { key: "latentArcsDetail", builder: "latentarcs.arcsForGM (SNG-191 §7)", carries: ["latent arcs that have SURFACED — the world's own agenda, now in front of the player"],
    reachedBy: "the generation turn surfacing an arc that fomented on the world count", spec: "§7", views: ["turn"],
    build: (env) => arcsForGM(env.character.worldState) },
  { key: "seasonalDetail", builder: "latentarcs.seasonalDetailForGM (SNG-191 §7.4)", carries: ["the season's conditions — the cyclical pressure a scene sits in"],
    reachedBy: "always (the character clock always has a season)", spec: "§7.4", views: ["turn"],
    build: (env) => seasonalDetailForGM(env.time?.season) },
  { key: "schoolsDetail", builder: "substrate.schoolsDetailForGM (SNG-193b §3.6)", carries: ["the character's SCHOOL per practised domain — what each craft is joined to, and its best-ground"],
    reachedBy: "always when schools.json is loaded and the character practises a domain", spec: "§3.6", views: ["turn"],
    build: (env) => schoolsDetailForGM(env.character, env.CONTENT.schools) },
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
      // SNG-266/1d — COUNT BEATS, NOT MEMORY. This read `sceneTurns.length`, which is BOUNDED STORAGE
      // (`slice(-40)`): a scene that ran 200 beats reported 40 forever, so the pressure to close plateaued
      // exactly when it should have become irresistible. `sceneBeats` is the real count and never trims.
      const soft = env.rules?.scene?.softCloseBeats ?? 8;
      const hard = env.rules?.scene?.hardCloseBeats ?? 14;
      const n = env.sceneBeats ?? env.sceneTurns?.length ?? 0;
      if (n < soft) return null;
      return n >= hard
        ? `THIS SCENE HAS RUN ${n} BEATS — past its length. Bring it to an honest close THIS BEAT unless the character is mid-action — IF YOU DO NOT, THE ENGINE CLOSES IT FOR YOU and your sceneSummary becomes the chronicle entry as-is, so write that summary as if it were the last thing you say about this scene: let the moment finish, and emit "sceneEnded": true with a sceneSummary covering the whole scene. A new scene opens on the next beat.`
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
