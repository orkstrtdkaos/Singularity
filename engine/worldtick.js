// worldtick.js — the world moves while you're away. Runs whenever the character
// re-enters play and in-game days have passed since the last tick:
//   1. EVENT ADVANCEMENT — active events (water crisis) progress through their
//      stages on their own clocks. Ignore a crisis and it worsens.
//   2. NEWS SPREAD — significant witnessed deeds (|weight| >= 2) travel to the
//      region's other communities after a few days. Reputation follows you.
//   3. OFFSCREEN NPC EVOLUTION — an AI pass imagines what happened to known
//      people during the gap, applied through the same clamped npcUpdates ops.
// World state lives on the character (their campaign's world). When shared
// scenes land (v0.6), a consolidator replaces this with region-level state —
// the shapes here are designed to lift straight into that.

import { callClaudeJSON } from "./claude.js";
import { battleRound, synthesizeOpponentSheet } from "./skill_battle.js";   // CCODE-113: an arc is CONTESTED with the same dice the player rolls
import { applyNpcUpdates } from "./npcs.js";
import { spreadDeeds } from "./reputation.js";   // SNG-281: news travels, and that is a promotion source
import { applyCodexUpdates } from "./codex.js";
import { tierRank, tierBirthWeight } from "./legends.js";
const KNOWN_TIERS = new Set(["mythic", "legendary", "epic", "heroic", "regional", "notable", "riffraff"]);   // SNG-269: ONE ladder — worldtick had its own copy and it drifted
import { smartClamp } from "./namematch.js"; // SNG-076: word-boundary clamp for the away-digest/news
import { generatedRecords } from "./generate.js";
import { syncEnabled, fetchRepoJSON, fetchLedger, pushOwnedFile, pushMergedFile } from "./sync.js";
import { decayWakes, wakeArcPush } from "./wake.js"; // SNG-204: wakes decay on the tick + lean on connected arcs
import { enterDeathState, deepenDeaths, deathDepth, isRetrievable, resolveRetrieval } from "./death.js"; // SNG-209: a killed figure ENTERS the death state; the clock sinks untended deaths toward sealed
import { absoluteWorldDay, worldDayAt, worldCount, readClock } from "./worldtime.js";
import { advanceAssignment, progressAgainst } from "./assignments.js"; // SNG-191 §4: the world advances delegated work
import { seedArc, fomentArc, surfaceableArcs, markSurfaced, seasonalPressure } from "./latentarcs.js"; // SNG-191 §7: the world's own agenda
import { ensureCanonStore, promotionCandidates, promoteInto, canonForViewer } from "./canon.js";

const NEWS_CAP = 20;
const NEWS_TRAVEL_DAYS = 3;

export function initWorldState(day = 1) {
  return { schemaVersion: 1, lastTickDay: day, eventStages: {}, arcStages: {}, spectrumDrift: {}, news: [], unseenNews: [] };
}

// ---------- SNG-203 Phase 2: the shared world-arc clock ----------
// A greater arc (greater_arcs.json) carries an authored `currentStage` and a numbered `stages[]` ladder,
// each stage with a `publicFace` (what everyone sees) and a GM-EYES `pressureOnAdvance`/`tendency` (sealed).
// A tier-1 world_arc_quest's `arc_stage` effect advances the arc on the SHARED clock — the same forward-only
// eventStages machinery, so one player moving an arc is a world event every other player's next load sees.

/** The greater arc def by id (content.greaterArcs is the arcs array). Module-internal. */
function findGreaterArc(content, arcId) {
  return (content?.greaterArcs || []).find(a => a.id === arcId) || null;
}

/** SNG-203 Phase 2B: this actor's own net signed push on an arc (advance +, retreat −), + what everyone
 *  ELSE has pushed as of the last sync. SNG-208 §3a: `epic` = the ambient pressure the legends lean on this
 *  arc from offstage (local — offscreen developments are per-player). Old 2A saves stored a forward-only
 *  `stage`; read it as a +push. */
function arcPushes(character, arcId) {
  const ws = character?.worldState;
  const epic = Object.values(ws?.epicArcPushes || {}).filter(e => e.arcId === arcId).reduce((s, e) => s + (Number.isFinite(e.push) ? e.push : 0), 0)
    + wakeArcPush(ws, arcId); // SNG-204: a wake's lean on a connected arc is part of the ambient (non-player) pressure
  const local = ws?.arcStages?.[arcId];
  if (!local) return { mine: 0, others: 0, epic, legacyStage: null };
  const mine = Number.isFinite(local.push) ? local.push
    : (Number.isFinite(local.stage) ? null : 0);          // a 2A save: fall back to its cached stage
  return { mine: mine ?? 0, others: Number.isFinite(local.othersPush) ? local.othersPush : 0, epic, legacyStage: mine == null ? local.stage : null };
}

/** This world's EFFECTIVE stage for an arc: the authored base moved by the NET of every actor's signed
 *  pushes — this actor's + everyone else's (from the last sync) + the EPICS leaning on it from offstage
 *  (SNG-208) — clamped to the arc's real stage range. Not forward-only — a net-negative push pulls the arc
 *  BACK. Module-internal; covered through worldArcsPublic. */
export function arcStageNow(content, character, arcId) {
  const arc = findGreaterArc(content, arcId);
  const base = arc?.currentStage ?? 1;
  const total = (arc?.stages || []).length || base;
  const { mine, others, epic, legacyStage } = arcPushes(character, arcId);
  if (legacyStage != null) return Math.max(1, Math.min(total, legacyStage)); // 2A back-compat
  // CCODE-116: ROUND. A stage is a DISCRETE, NAMED rung ("Drift", "The Widening") that content indexes by
  // number — but pushes became fractional the moment attention shares, urgency and contest margins started
  // scaling them (CCODE-111/113/115), and this returned 2.3513513513513513. That is not a stage; it is a
  // stage-shaped number, and it would have reached the player as "Stage 2.35" and broken every lookup keyed
  // on the rung. The PUSH stays continuous — that is where the nuance belongs — and only the READOUT rounds.
  return Math.max(1, Math.min(total, Math.round(base + mine + others + epic)));
}

/** SNG-203 §3: the PUBLIC face of where the world arcs stand — the readable "state of the world" every
 *  player sees. Only the current stage's `publicFace` + stage name/number surface; the arc's `tendency`,
 *  `ifIgnored`, and per-stage `pressureOnAdvance` (GM-EYES / the wake seed) NEVER leak here. Carries the
 *  DIRECTION the world has moved (advanced / receded / held) and whether it is CONTESTED (this actor and the
 *  rest of the valley pushing opposite ways) — a receding or contested arc is a feature of a shared world,
 *  not a bug. Structured data reused by the GM block and the player-facing world-map readout. */
export function worldArcsPublic(content, character) {
  return (content?.greaterArcs || []).map(arc => {
    const base = arc.currentStage ?? 1;
    const total = (arc.stages || []).length || 1;
    const stageNum = arcStageNow(content, character, arc.id);
    const def = (arc.stages || []).find(s => s.stage === stageNum) || (arc.stages || [])[Math.max(0, stageNum - 1)] || null;
    const { mine, others, epic } = arcPushes(character, arc.id);
    const net = mine + others + epic; // SNG-208: the epics' offstage lean is part of the net pressure
    // direction is the NET PRESSURE on the arc, not its stage-vs-base — so downward pressure reads "receded"
    // even while the stage is clamped at its authored floor (a base-1 arc can't sit below stage 1, but the
    // valley can still be pulling it back). The actual backward MOVE surfaces as the stage number dropping +
    // the "pushed back to…" news when the canonical stage falls between syncs.
    const direction = net > 0 ? "advanced" : net < 0 ? "receded" : "held";
    // contested: the player and the rest of the world (other players + epics) pulling opposite ways.
    const contested = (mine > 0 && (others + epic) < 0) || (mine < 0 && (others + epic) > 0);
    return {
      arcId: arc.id, name: arc.name, stageNum, total,
      stageName: def?.name || `Stage ${stageNum}`,
      publicFace: def?.publicFace || arc.tendency || "", // tendency is the authored fallback surface line (not the sealed truth)
      moved: stageNum !== base, direction, contested,
    };
  });
}

/** SNG-276 — THE WORLD TAB: who is doing what to your arcs.
 *
 *  Erik: *"they have the arcs on their chronicle, but not who's doing what to them."* Aevi: *"the sim
 *  already knows the story. Nothing surfaces it."* Both true — `arcContests` has known who won and by how
 *  much, `arcCasualties` who died on which arc, `arcVacancies` which seats emptied, since the day each was
 *  written, and no reader has ever asked. Collected-then-never-read is the seventh door and this is a
 *  five-system-wide instance of it.
 *
 *  It becomes urgent the moment the third action ships: a player asked to GUARD someone, STRIKE someone, or
 *  who is themselves struck, needs to know who is standing on their arc first.
 *
 *  ⛔ SPOILER DISCIPLINE IS INHERITED, NOT RE-DECIDED. This composes `worldArcsPublic`, which already
 *  withholds each arc's sealed `truth` and surfaces only its `publicFace`. Nothing here reaches past that
 *  line — it adds PEOPLE to a public surface, and every name it carries has already been broadcast as news.
 *
 *  `known` marks whoever the player has actually met, so the UI can tell "someone you know is in this" from
 *  "a name you have heard", which is the difference between a fact and a hook.
 *
 *  Pure. Reads world state, writes nothing. */
export function arcPeopleView(character, content = {}) {
  const ws = character?.worldState || {};
  const roster = worldRoster(ws, content);
  const byId = new Map(roster.map(f => [f.id, f]));
  const nameOf = (id) => byId.get(id)?.name || id || "someone";
  const knows = (id) => !!(character?.npcRegistry?.[id] || character?.codex?.topics?.[id]);
  const who = (id) => ({ id, name: nameOf(id), known: knows(id) });

  // "Show the state, not the machine" (Aevi). A push is a float; a reader wants a WEIGHT, not 2.351351.
  // ⚠️ BANDED AGAINST THE CAP, not against absolute numbers. Pushes ACCUMULATE toward `EPIC_PUSH_CAP`, so
  // fixed thresholds put the entire valley in the top band within a season and the word stops meaning
  // anything — which is exactly what a first pass of this did: every figure read "leaning hard".
  // ⛔ DO NOT BAND THE PUSH. `push` is a SATURATED CUMULATIVE total — it climbs to `EPIC_PUSH_CAP` and
  // stops, so within a world-year every figure on an arc holds exactly the same number. I tried an absolute
  // scale, then a cap-relative one, then one ranked against the strongest mover, and read the rendered page
  // each time: all three printed the identical phrase beside every single name. A word that applies to
  // everyone is not a word, and no amount of rescaling fixes a value that has no variance left.
  //
  // What DOES differ, and is authored rather than derived, is how much the figure CARES: `arcAffinity.weight`
  // is Aevi's statement of what this arc is to this person. That is the honest thing to print beside a name.
  const careBand = (f, arcId) => {
    const w = affinitiesOf(f).find(c => c.arcId === arcId)?.weight || 1;
    return w >= 3 ? "their life’s work" : w >= 2 ? "close to the bone" : "a stake in it";
  };

  return worldArcsPublic(content, character).map(arc => {
    const raw = Object.entries(ws.epicArcPushes || {})
      .filter(([, r]) => r?.arcId === arc.arcId && Number(r.push))
      .map(([id, r]) => ({ ...who(id), push: Number(r.push), dir: Number(r.push) > 0 ? 1 : -1 }))
      .sort((a, b) => Math.abs(b.push) - Math.abs(a.push));
    const movers = raw.map(m => ({ ...m, lean: careBand(byId.get(m.id), arc.arcId) }));
    const onArc = (list) => (Array.isArray(list) ? list : []).filter(e => e?.arcId === arc.arcId);
    return {
      ...arc,
      movers,
      forIt: movers.filter(m => m.dir > 0),
      againstIt: movers.filter(m => m.dir < 0),
      contest: ws.arcContests?.[arc.arcId] || null,
      vacancy: ws.arcVacancies?.[arc.arcId] || 0,
      casualties: onArc(ws.arcCasualties).map(c => ({ winner: who(c.winner), loser: who(c.loser), kind: c.kind })),
      strikes: onArc(ws.arcStrikes).map(s => ({ target: who(s.target), sender: who(s.sender), outcome: s.outcome, guard: s.guard ? who(s.guard) : null })),
      births: onArc(ws.arcBirths).map(b => ({ ...b, name: nameOf(b.id) })),
      retrievals: onArc(ws.arcRetrievals).map(r => ({ dead: who(r.deadId), by: who(r.byId), outcome: r.outcome, sealed: !!r.sealed })),
    };
  });
}

/** SNG-276 — the world-level facts that belong to no single arc: who came back, who is not going home, and
 *  what people did with their own time. Kept separate because attaching them to an arc would be a lie. */
export function worldPeopleFooter(character, content = {}) {
  const ws = character?.worldState || {};
  const roster = worldRoster(ws, content);
  const byId = new Map(roster.map(f => [f.id, f]));
  const nameOf = (id) => byId.get(id)?.name || id || "someone";
  return {
    neglected: (ws.neglectedLives || []).map(n => ({ id: n.id, name: n.name || nameOf(n.id) })),
    living: (ws.personalBeats || []).map(b => ({ id: b.id, name: b.name || nameOf(b.id), pursuit: b.pursuit })),
    wanted: (ws.retrievalWanted || []).map(w => ({ dead: w.deadName || nameOf(w.deadId), by: w.byName || nameOf(w.byId), depth: w.depth, waiting: !!w.waiting })),
    coverage: ws.personalCoverage || null,
  };
}
/** SNG-203 §3: the shared world-arc progress surface as a GM block — the world's public state, so the GM can
 *  weave "the arcs are moving" into play without inventing it. Truth stays sealed (see worldArcsPublic). */
export function worldArcsForGM(content, character) {
  const arcs = worldArcsPublic(content, character);
  if (!arcs.length) return null;
  const mark = a => a.contested ? " ⚔ CONTESTED (pushed both ways)" : a.direction === "advanced" ? " ⤴ ADVANCED on the shared clock" : a.direction === "receded" ? " ⤵ RECEDED — pushed back on the shared clock" : "";
  const lines = arcs.map(a => `- ${a.name} — ${a.stageName} (stage ${a.stageNum}/${a.total})${mark(a)}: ${a.publicFace}`);
  return `THE WORLD'S GREATER ARCS — the shared, public state of the valley (every traveler knows this much; the arcs' hidden direction is yours alone to know). Reference them as the weather of the wider world; when one has ADVANCED, RECEDED, or is CONTESTED, the change is felt everywhere — an arc pulled backward is as real as one pushed forward:\n${lines.join("\n")}`;
}

/** Region view for the GM: content events overlaid with this campaign's stages. */
export function buildRegionView(content, character) {
  const ws = character?.worldState;
  // CCODE-95: `content.region` was read UNGUARDED, so a world with no region could not tick AT ALL — it threw
  // on the first day. Every other consumer in this codebase tolerates absent content (SNG-055/059: "absence
  // leaves the gates ungoverned, never breaks load"); this one did not, and it is on the world clock's path,
  // which is the worst place for the exception. Found by the dev world, which is a world with deliberately
  // little in it — exactly the case this guard is for.
  const region = content?.region || null;
  if (!region) return { activeEvents: [] };
  const activeEvents = (region.activeEvents || []).map(({ eventId, stage }) => ({
    eventId,
    stage: ws?.eventStages?.[eventId]?.stage ?? stage
  }));
  return { ...region, activeEvents };
}

/** A location's spectrum as shifted by the world's drift (crisis pressure etc.). */
export function effectiveLocation(location, worldState) {
  const drift = worldState?.spectrumDrift;
  if (!drift || !Object.keys(drift).length) return location;
  const spectrum = { ...location.spectrum };
  for (const [ax, v] of Object.entries(drift)) {
    spectrum[ax] = Math.max(-1, Math.min(1, (spectrum[ax] || 0) + v));
  }
  return { ...location, spectrum };
}

/** Run the tick if days have passed. Mutates character.worldState (and deeds/npcs).
 *  evolveNpcs is injectable for tests; defaults to the AI pass. Never throws. */
export async function runWorldTick({ character, content, currentDay, advanceAssignments = aiAssignmentAdvancement }) {
  if (!character.worldState) character.worldState = initWorldState(currentDay);
  const ws = character.worldState;
  const elapsed = currentDay - (ws.lastTickDay ?? currentDay);
  if (elapsed <= 0) return { ticked: false, news: [] };
  const news = [];
  const clampDrift = v => Math.max(-0.5, Math.min(0.5, v));

  // 1. event advancement — and SNG-191 §4.2: a crisis RESPONDS to the delegated work. Ignoring a
  //    crisis worsens it (this always worked); the missing half is that DOING something measurably
  //    helps, and the mechanism is a charge set against it. A crisis nothing can affect is theatre.
  for (const { eventId, stage } of content.region.activeEvents || []) {
    const ev = content.events[eventId];
    if (!ev) continue;
    let st = ws.eventStages[eventId] || (ws.eventStages[eventId] = { stage, sinceDay: ws.lastTickDay });
    let guard = 0;
    while (guard++ < 10) {
      const def = ev.stages.find(s => s.stage === st.stage);
      if (!def || !def.days || def.days >= 900) break;
      if (currentDay - st.sinceDay < def.days) break;
      const helped = progressAgainst(ws, eventId).length; // charges making headway against THIS crisis
      if (helped >= 2 && st.stage > 1) {
        // eased — strong, sustained delegated work pushes the crisis a stage back toward resolution.
        st.sinceDay += def.days; st.stage = st.stage - 1;
        for (const [ax, v] of Object.entries(def.spectrumShift || {})) ws.spectrumDrift[ax] = clampDrift((ws.spectrumDrift[ax] || 0) - v); // unwind this stage's pressure
        const now = ev.stages.find(s => s.stage === st.stage);
        news.push(`${ev.name} has EASED — the delegated work held and pushed it back${now ? ` to ${now.name}` : ""}.`);
        continue;
      }
      if (helped >= 1) {
        // held — the crews bought this interval; the crisis does not worsen, but it does not recede.
        st.sinceDay += def.days;
        news.push(`${ev.name} was HELD at ${def.name} — the delegated work kept it from worsening.`);
        continue;
      }
      // untended — it worsens (UNGUARDRAILED, §4b: it runs as far as its own logic takes it).
      const next = ev.stages.find(s => s.stage === st.stage + 1);
      if (!next) break;
      st.sinceDay += def.days;
      st.stage = next.stage;
      for (const [ax, v] of Object.entries(next.spectrumShift || {})) ws.spectrumDrift[ax] = clampDrift((ws.spectrumDrift[ax] || 0) + v);
      news.push(`${ev.name} has worsened — ${next.name}: ${next.summary}`);
    }
  }

  // 2. news spread: big deeds travel to the region's other communities
  const communities = [...new Set(Object.values(content.locations).map(l => l.communityId).filter(Boolean))];
  for (const deed of character.deeds || []) {
    if (!deed.communityId || Math.abs(deed.weight) < 2) continue;
    const deedDay = deed.day ?? 0;
    if (currentDay - deedDay < NEWS_TRAVEL_DAYS) continue;
    const others = communities.filter(c => c !== deed.communityId && !(deed.spread || []).includes(c));
    if (!others.length) continue;
    deed.spread = [...(deed.spread || []), ...others];
    news.push(`Word has spread beyond ${deed.communityId.split(".").pop()}: ${deed.description}`);
  }

  // 3. SNG-191 §4 THE INVERSION — the world TURNS, it does not narrate. Advance the DELEGATED work
  //    (progress / stall / problem / done); never imagine what a worker was FEELING. News is DERIVED
  //    from what MOVED and only when it bears on the work (§4.3/§4.4); personal colour rides on the
  //    person's statusNote, not the news (§4.5). No assignments → no pass, and an empty news block is a
  //    legitimate result. UNGUARDRAILED (§4b): a problem may be real, a success real — not softened.
  const active = Object.values(ws.assignments || {}).filter(a => a.status !== "done");
  if (elapsed >= 3 && active.length && advanceAssignments) {
    try {
      const result = await advanceAssignments({ character, content, assignments: active.slice(0, 6), elapsed, currentDay });
      const statusUpdates = [];
      for (const adv of (result?.advancements || []).slice(0, 6)) {
        const a = ws.assignments[adv?.assignmentId];
        if (!a) continue;
        advanceAssignment(a, adv.outcome, worldCount());
        if (adv.outcome === "problem") news.push(`${a.npcName} has hit trouble with ${a.charge}${adv.note ? ` — ${smartClamp(adv.note, 200)}` : ""}.`);
        else if (adv.outcome === "done") news.push(`${a.npcName} has finished ${a.charge}.`);
        if (adv.note && a.npcId) statusUpdates.push({ op: "update", npcId: a.npcId, statusNote: smartClamp(adv.note, 200) });
      }
      if (statusUpdates.length) applyNpcUpdates(character, statusUpdates, { day: currentDay });
    } catch (err) { console.warn("[worldtick] assignment advancement skipped:", err.message); }
  }

  ws.lastTickDay = currentDay;
  if (news.length) {
    // SNG-041: stamp the absolute world-day (shared calendar) alongside the local journey-day.
    const wd = absoluteWorldDay();
    const stamped = news.map(n => ({ day: currentDay, worldDay: wd, text: n, tier: "event" })); // SNG-211: delegated-work outcomes are real, not ambient
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { ticked: true, news };
}

/** SNG-191 §7 — THE GENERATION TURN. The world has its own agenda, and it runs on the world COUNT, not
 *  the player's attention. Latent arcs foment whether or not anyone has seen them; some the world solves
 *  itself (§7.3, the fate that keeps it from being hero-dependent); some SURFACE as the player's first
 *  contact — a rumour now specific enough to repeat (§7.4, content not an alert). New arcs are seeded
 *  from the DISPOSITION of the regions the player knows, so every one has a cause that existed before it
 *  surfaced (§7 inv2 attributable). Runs alongside the return-tick. seedArcs injectable; never throws. */
export async function runGenerationTurn({ character, content, now = Date.now(), seedArcs = aiSeedArcs } = {}) {
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const count = worldCount(now);
  if (ws.lastGenCount == null) { ws.lastGenCount = count; return { news: [] }; } // first observation anchors the baseline
  const elapsed = count - ws.lastGenCount;
  if (elapsed <= 0) return { news: [] };
  ws.lastGenCount = count;
  const news = [];

  // §7.4 seasonal pressure — the conditions arcs happen in, and they recur. The season TILTS which
  // KINDS ferment (a shortage grows in deep-winter want, a feud in the working heat).
  const season = (() => { try { return readClock(character.clock).season; } catch { return null; } })();
  const tilts = new Set(seasonalPressure(season)?.tilts || []);
  // 1. foment existing arcs — they grow (unguardrailed), or the world quietly resolves one itself (§7.3);
  //    a growing arc the season leans on ferments a touch faster.
  for (const arc of Object.values(ws.latentArcs || {})) {
    const before = arc.fate;
    fomentArc(arc, elapsed, Math.random, count);
    if (arc.fate === "growing" && tilts.has(arc.kind)) arc.stage += 1; // the season pushes on this kind
    if (before === "growing" && arc.fate === "resolved") news.push(`Word reaches you that ${arc.premise} — settled, it seems, without you.`);
  }
  // 2. surface arcs that have fomented enough — first contact, as something now specific enough to repeat.
  for (const arc of surfaceableArcs(ws).slice(0, 2)) {
    markSurfaced(arc, count);
    news.push(`Something has been building${arc.regionId ? ` in ${String(arc.regionId).replace(/_/g, " ")}` : ""}: ${arc.premise}`);
  }
  // 3. seed NEW arcs from the disposition of the regions the player knows — attributable, regional (§7.5).
  if (elapsed >= 24 && seedArcs) {
    try {
      const seeded = await seedArcs({ character, content, count });
      for (const s of (seeded?.arcs || []).slice(0, 2)) seedArc(ws, s, count); // silent — an arc is not news until it surfaces
    } catch (err) { console.warn("[generation] seeding skipped:", err.message); }
  }

  if (news.length) {
    const stamped = news.map(t => ({ day: ws.lastTickDay ?? null, worldDay: absoluteWorldDay(now), text: smartClamp(t, 400), tier: "event" })); // SNG-211: an arc surfacing/resolving is a real event
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { news };
}

/** SNG-191 §7 — the seeding pass: what is fomenting in the regions the player knows, FROM their
 *  disposition. Every arc must follow from something already true of the place (§7 inv2) — never from
 *  nothing. Regional, not global (§7.5). */
async function aiSeedArcs({ character, content, count }) {
  const knownRegions = [...new Set((character.knownPlaces || []).map(id => content.locations?.[id]?.regionId || content.locations?.[id]?.region).filter(Boolean))].slice(0, 4);
  if (!knownRegions.length) return { arcs: [] };
  const existing = Object.values(character.worldState?.latentArcs || {}).map(a => a.premise).slice(0, 6).join("; ") || "none";
  const sys = `You seed LATENT ARCS in an RPG world — things quietly building in the background that no one has noticed yet. For AT MOST 2 of the regions, name ONE thing fomenting there and its CAUSE — something ALREADY TRUE of that place (its people, its tensions, its crisis). A feud, a shortage, a rot in a granary, someone's slow decision. It must FOLLOW from the place; never invent from nothing. Reply ONLY JSON: {"arcs":[{"id":"kebab-unique","regionId":"exact-region-id-from-the-list","kind":"feud|shortage|rot|decision|omen","premise":"one sentence: what is building","cause":"the thing already true that this grows from"}]}`;
  const content2 = `Regions the character knows:\n${knownRegions.map(r => `- ${r}`).join("\n")}\n\nAlready fomenting (do not duplicate): ${existing}\n\nWorld count now: ${count}.`;
  return callClaudeJSON([{ role: "user", content: content2 }], { task: "world-tick", system: sys, maxTokens: 900 });
}

/** SHARED WORLD consolidation (best-effort, never throws): when sync is on,
 *  one valley is true for everyone. Event stages merge to the furthest reached,
 *  spectrum drift to the strongest pressure, other characters' deeds arrive as
 *  news — and the consolidated region state is pushed back for the next player. */
export async function syncSharedWorld({ character, content }) {
  if (!syncEnabled() || !character.worldState) return { synced: false };
  const ws = character.worldState;
  const news = [];
  try {
    // 1. merge remote region state: the world is as far along as ANYONE has seen it
    const remote = await fetchRepoJSON("world/regions/valley.json");
    if (remote?.eventStages) {
      for (const [eventId, st] of Object.entries(remote.eventStages)) {
        const local = ws.eventStages[eventId];
        if (!local || st.stage > local.stage) {
          ws.eventStages[eventId] = { ...st };
          const ev = content.events[eventId];
          const def = ev?.stages.find(s => s.stage === st.stage);
          if (ev && def) news.push({ text: `${ev.name} stands at ${def.name} across the valley: ${def.summary}`, worldDay: absoluteWorldDay() });
        }
      }
    }
    if (remote?.spectrumDrift) {
      for (const [ax, v] of Object.entries(remote.spectrumDrift)) {
        if (Math.abs(v) > Math.abs(ws.spectrumDrift[ax] || 0)) ws.spectrumDrift[ax] = v;
      }
    }
    // 2. other characters' consequences reach you as news
    const since = ws.lastSharedReadAt || "1970";
    const ledger = await fetchLedger(0);
    const fromOthers = ledger.filter(e => e.who !== character.id && e.at > since && e.visibility !== "hidden").slice(-5);
    // SNG-041 RECONCILIATION: another character's event dates by the SHARED absolute world-day
    // (derived from its real-time .at, or its own worldDay stamp) — so their timeline and yours
    // share ONE calendar. This is the fix for the Day-8-vs-Day-11 drift.
    for (const e of fromOthers) news.push({
      text: `${e.impactsLocal ? "This reaches your area — " : "Word reaches you: "}${e.what}${e.where ? ` (near ${e.where.replace(/_/g, " ")})` : ""}`,
      worldDay: e.worldDay ?? worldDayAt(e.at),
      impactsLocal: !!e.impactsLocal // SNG-041: a boundary-crossing distant event (far-world → local frame)
    });
    ws.lastSharedReadAt = new Date().toISOString();
    // 3. push the consolidated region state back (SHA-retry inside pushOwnedFile)
    await pushOwnedFile("world/regions/valley.json", {
      schemaVersion: 1, regionId: "valley",
      calendar: remote?.calendar || { day: ws.lastTickDay, season: "late-spring", year: 15 },
      activeEvents: (content.region.activeEvents || []).map(({ eventId, stage }) => ({ eventId, stage: ws.eventStages[eventId]?.stage ?? stage })),
      eventStages: ws.eventStages, spectrumDrift: ws.spectrumDrift,
      worldFlags: remote?.worldFlags || {}, lastTick: new Date().toISOString()
    }, `world-tick: consolidated by ${character.name}`);
    // SNG-203 Phase 2B: greater arcs are a NET VECTOR of per-actor pushes, in their own shared file. Each
    // actor owns byActor[characterId]; the canonical stage is base + Σ pushes, so an arc moves BOTH ways —
    // one player countering another pulls it BACK. pushMergedFile re-merges the loser onto the winner, so
    // concurrent pushes never clobber (a per-actor key makes the union safe). A no-push player just reads.
    const me = character.id;
    let mergedArcs = null;
    if (me && ws.arcStages && Object.values(ws.arcStages).some(s => Number.isFinite(s.push))) {
      await pushMergedFile("world/arcs/valley.json", (remoteArcs) => {
        const arcs = remoteArcs?.arcs ? { ...remoteArcs.arcs } : {};
        for (const [arcId, st] of Object.entries(ws.arcStages)) {
          if (!Number.isFinite(st.push)) continue;
          arcs[arcId] = { byActor: { ...(arcs[arcId]?.byActor || {}), [me]: st.push } };
        }
        mergedArcs = arcs;
        return { schemaVersion: 1, region: "valley", arcs, lastTick: new Date().toISOString() };
      }, `arcs: ${character.name || me} pushed the world`);
    } else {
      mergedArcs = (await fetchRepoJSON("world/arcs/valley.json"))?.arcs || null;
    }
    // learn what everyone ELSE has pushed → update othersPush; news when the CANONICAL stage shifts (either way).
    if (mergedArcs) {
      ws.arcStages = ws.arcStages || {};
      for (const [arcId, entry] of Object.entries(mergedArcs)) {
        const others = Object.entries(entry.byActor || {}).filter(([id]) => id !== me).reduce((s, [, v]) => s + (Number.isFinite(v) ? v : 0), 0);
        const before = arcStageNow(content, character, arcId);
        ws.arcStages[arcId] = { ...(ws.arcStages[arcId] || {}), othersPush: others };
        const after = arcStageNow(content, character, arcId);
        if (after !== before) {
          const arc = findGreaterArc(content, arcId);
          const def = arc && (arc.stages || []).find(s => s.stage === after);
          const verb = after > before ? "moved forward to" : "was pushed back to";
          if (arc && def) news.push({ text: `Across the valley, ${arc.name} ${verb} ${def.name || `stage ${after}`}: ${def.publicFace || ""}`.trim(), worldDay: absoluteWorldDay() });
        }
      }
    }
  } catch (err) {
    console.warn("[sharedworld] consolidation skipped:", err.message);
  }
  if (news.length) {
    // each item carries its OWN absolute world-day (a cross-character event keeps the date it
    // actually happened; a local merge stamps now) — so the shared calendar stays coherent.
    const stamped = news.map(n => ({ day: ws.lastTickDay, worldDay: n.worldDay ?? absoluteWorldDay(), text: smartClamp(n.text, 600), tier: n.tier || "event", ...(n.impactsLocal ? { impactsLocal: true } : {}) })); // SNG-211: a cross-character arc move is a real event
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return { synced: true, news: news.map(n => n.text) };
}

// ---------- SNG-BATCH-9 Phase 3: shared-world promotion + rating-lens ----------

const CANON_PATH = (region = "valley") => `world/canon/${region}.json`;

/** EARNED auto-promotion + the rating-lens read (best-effort, never throws). When sync is on:
 *   1. PROMOTE — every local nominated-tier entity that hasn't landed yet is contended into the
 *      shared-canon store: no collision → lands canonical; a collision fires the weighted opposed
 *      roll (realness vs realness; authored spine at a high floor) → winner canonical, loser a
 *      persisting variant/rumor. The contest runs INSIDE the merge callback against the freshly-
 *      read remote, so concurrent promoters never clobber (SHA-retry re-contests).
 *   2. READ — the resulting store is resolved through THIS viewer's rating-lens (at/below their
 *      ceiling; above-ceiling adapts down or filters absent; floors absolute) and returned as the
 *      viewer's slice for GM surfacing + hydration.
 *  Marks promoted local records idempotently (`_gen.promotedWorldDay` + `_gen.canonTier`) so a
 *  landed entity never re-promotes. Gated: promotes whenever candidates exist; refreshes the
 *  view at most once per elapsed world-day when there's nothing to promote (network thrift).
 *  region + authoredFor + now injectable for tests. */
export async function syncSharedCanon({ character, profile, content, region = "valley", now = Date.now(), authoredFor = null } = {}) {
  if (!syncEnabled() || !character) return { synced: false, promoted: [], view: [] };
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const worldDay = absoluteWorldDay(now);
  const candidates = promotionCandidates(character);
  const dueForRead = ws.lastCanonWorldDay == null || (worldDay - ws.lastCanonWorldDay) >= 1;
  if (!candidates.length && !dueForRead) return { synced: false, promoted: [], view: [] };

  const authored = authoredFor || ((type) =>
    type === "npc" ? (content?.npcs || {}) :
    type === "location" ? (content?.locations || {}) :
    type === "arc" ? Object.fromEntries((content?.greaterArcs || []).map(a => [a.id, a])) : {});

  let store = null;
  let promoted = [];
  try {
    if (candidates.length) {
      // promote inside the merge: contest against the FRESHLY-read remote; a concurrent write
      // triggers a re-read + re-contest (pushMergedFile), so promoters never clobber.
      let lastResults = [];
      await pushMergedFile(CANON_PATH(region), (remote) => {
        const s = ensureCanonStore(remote || {}, region);
        const out = promoteInto(s, candidates, { authored, worldDay });
        lastResults = out.results;
        return out.store;
      }, `canon: ${candidates.length} promotion(s) from ${character.name || character.id}`);
      promoted = lastResults;
      // mark local records landed (idempotent) — buildCanonRecord keeps the source id, so a
      // result's entityId is exactly its local record's id — so it never re-promotes.
      for (const r of lastResults) {
        const target = candidates.find(c => c.record.id === r.entityId)?.record;
        if (target?._gen && typeof target._gen === "object") { target._gen.promotedWorldDay = worldDay; target._gen.canonTier = r.outcome === "variant" ? "variant" : "canonical"; } // SNG-216: never write onto a malformed (boolean) _gen
      }
      // re-read the consolidated store for the viewer slice
      store = await fetchRepoJSON(CANON_PATH(region));
    } else {
      store = await fetchRepoJSON(CANON_PATH(region));
    }
  } catch (err) {
    console.warn("[canon] shared-canon sync skipped:", err.message);
    return { synced: false, promoted, view: [] };
  }
  ws.lastCanonWorldDay = worldDay;
  const view = store ? canonForViewer(ensureCanonStore(store, region), profile) : [];
  return { synced: true, promoted, view };
}

// ---------- SNG-BATCH-9 Phase 2: living advancement (offscreen) ----------

/** Advance ESTABLISHED-tier generated entities while the player was away. Gated by the
 *  Phase-1 engagement governor (only established/nominated advance — fresh/dormant stay put)
 *  and by REAL-time elapsed world-days (the far world ages in real time, SNG-041). Each
 *  development is imagined per the entity's want/tension + disposition (derives-never-
 *  fabricates — no drastic/contradicting/future-dated turns), applied as an accumulated
 *  fact on the entity's codex node + an away-digest item DATED on the shared absolute clock
 *  (on-or-before now). Never throws. evolveFn + now injectable for tests. */
// SNG-198 §2: the missing HALF of SNG-021 (specced 2026-07-07, never built — `wantProgress` was 0 hits
// repo-wide). An offscreen figure's want now carries a COUNTER that persists between ticks, so a thread
// ripening across four ticks is measurably further along than after one, and the model can SEE how far it
// has travelled when it writes the fifth. The `progress|stall|problem|done` enum is Path A's proven shape
// (delegated work), extended to the generated population. A want that reaches the threshold RESOLVES —
// resolution is a legitimate end, not a loop that ripens forever. UNGUARDRAILED (§4b): a stall is a real
// stall, a problem real; nothing softened to keep the world tidy.
const WANT_OUTCOMES = ["progress", "stall", "problem", "done"];
const WANT_THRESHOLD = 4; // progress steps to resolve a want (tunable). "Four ticks of a thread ripening."

/** The persistent per-figure want state, keyed by entityId on worldState. Pure accessor + mutator. */
function wantState(ws, id) {
  ws.wantProgress = ws.wantProgress || {};
  return ws.wantProgress[id] || (ws.wantProgress[id] = { progress: 0, status: "active", updatedWorldDay: null });
}
/** Apply one offscreen outcome to a figure's want state. Returns { moved, resolved } — `moved` is whether
 *  the countable state changed (drives whether it is news vs pure colour). Pure but for the ws mutation. */
export function applyWantOutcome(ws, id, outcome, worldDay) {
  const st = wantState(ws, id);
  if (st.status === "resolved") return { moved: false, resolved: true };
  let moved = false;
  if (outcome === "progress") { st.progress += 1; moved = true; }
  else if (outcome === "done") { st.progress = WANT_THRESHOLD; moved = true; }
  // stall / problem: the note is real, the counter does not advance (a stall is a stall — §4b)
  if (st.progress >= WANT_THRESHOLD) st.status = "resolved";
  st.lastOutcome = outcome;
  st.updatedWorldDay = worldDay;
  return { moved, resolved: st.status === "resolved" };
}
// ---------- SNG-208: legends as living actors — they move the arcs, and each other ----------

/** A figure's EFFECTIVE epic status, with expiry: a `wounded` epic recovers after `woundedUntilDay`, a
 *  `stopped` one after `stoppedUntilDay`; `dead` is permanent. Pure read (does not mutate). */
export function effectiveEpicStatus(ws, id, worldDay) {
  const st = ws?.epicStatus?.[id];
  if (!st || st.status === "active") return "active";
  if (st.status === "dead") return "dead";
  if (st.status === "wounded") return (st.woundedUntilDay != null && worldDay >= st.woundedUntilDay) ? "active" : "wounded";
  if (st.status === "stopped") return (st.stoppedUntilDay != null && worldDay >= st.stoppedUntilDay) ? "active" : "stopped";
  return "active";
}

const EPIC_PUSH_CAP = 6;
/** SNG-208 §3a: an epic's offscreen action leans on its `arcAffinity` arc — the ambient pressure the arcs
 *  breathe even in a session where the player never touches an arc quest. Accumulated LOCALLY (offscreen
 *  developments are already per-player-generated, so folding this into the local arcStageNow keeps it
 *  consistent and works offline — no cross-player double-count). A `stopped` epic pushes nothing this cycle;
 *  a `wounded` one pushes at half. Returns the applied push or null. */
/** CCODE-111 — A LEGEND HAS LIMITED ATTENTION AND MORE THAN ONE THING THEY CARE ABOUT.
 *
 *  Erik: "legends and epics also have limited attention — if they get pulled from one arc to help another,
 *  that gives the opposite side an advantage on the one they left. They should care about more than one of
 *  course, but every time is a decision about where they spend their attention, and they have primary
 *  driving wants and needs."
 *
 *  A fixed `arcAffinity` is a POSITION, not a person: it made every legend push the same arc forever, which
 *  is why the census was a standoff that only a player could break. Attention turns each pass into a CHOICE,
 *  and the choice has a cost — the arc you left is a seat you vacated, and the other side gains it for free.
 *
 *  Reads `arcAffinities: [{arcId, dir, weight}]` when authored, and falls back to the single `arcAffinity`,
 *  so existing content behaves exactly as before: one care, all attention, every pass. */
/** CCODE-113 — AN ARC IS CONTESTED WITH THE GAME'S OWN DICE.
 *
 *  Erik: "I want there to be some stochastic element... that should be some sort of simulated battle that
 *  uses the game mechanics with rolls so the outcomes are not predetermined."
 *
 *  Right, and it is the piece that makes worlds DIVERGE. Until now an arc was arithmetic: the same figures
 *  with the same weights produced the same equilibrium in every world, because nothing was ever rolled. Now
 *  the leading figure on each side of a contested arc fights a REAL `battleRound` — the same function, the
 *  same margins, the same rails the player's own contests run on. A legend can lose to someone weaker on a
 *  bad night, and that is the whole point.
 *
 *  Using the real engine rather than a bespoke die-roll is deliberate: a second combat model would drift from
 *  the one players learn, and the first time it disagreed nobody would know which was right.
 *
 *  Returns a signed multiplier for the winner's push and the loser's — the MARGIN decides how decisive the
 *  exchange was, so a near-thing barely moves the arc and a rout moves it hard. Pure; rng injected. */
export function contestArc({ pro, con, sb, rules, steps, rng = Math.random }) {
  if (!pro || !con || !sb) return null;
  const sheetFor = f => synthesizeOpponentSheet({
    name: f.name || f.id,
    threat: 30 + (Number(f.legend?.weight ?? f.weight) || 5) * 8,   // a legend's standing IS their threat
    tacticTags: f.tacticTags || [],
  }, sb);
  const declFor = f => ({ function: "strike", tier: Math.max(1, Math.round((Number(f.legend?.weight ?? f.weight) || 5) / 2)),
    attribute: "practical", intensity: "standard", name: f.name || f.id });
  let out = null;
  try {
    out = battleRound({
      playerSheet: sheetFor(pro), oppSheet: sheetFor(con),
      playerDecl: declFor(pro), oppDecl: declFor(con),
      state: { momentum: 0, effects: [], opponentHealth: 99 },
      rules, sb, steps, rng,
    });
  } catch { return null; }   // a contest that cannot roll must never break the world clock
  if (!out?.roundWinner) return { proMult: 1, conMult: 1, drawn: true };
  // The margin is the story: a hair-thin win nudges, a decisive one shoves. Bounded so one bad night for a
  // legend cannot erase an arc.
  const gap = Math.abs((out.player?.margin || 0) - (out.opponent?.margin || 0));
  const swing = Math.max(0.4, Math.min(2.2, 1 + gap / 25));
  return out.roundWinner === "player"
    ? { proMult: swing, conMult: 1 / swing, winner: pro.id, margin: gap }
    : { proMult: 1 / swing, conMult: swing, winner: con.id, margin: gap };
}

export function affinitiesOf(figure) {
  const many = Array.isArray(figure?.arcAffinities) ? figure.arcAffinities : null;
  const list = (many && many.length ? many : [figure?.arcAffinity]).filter(a => a?.arcId && a?.dir);
  return list;
}

/** SNG-275 — WHAT A FIGURE DOES WITH THEIR OWN TIME.
 *
 *  ⛔ THE ENGINE DOES NOT INVENT A LIFE. Giving Neth a brother the author never wrote is the same class of
 *  error as naming a minted figure: it is authorship, and an invented family member becomes canon the moment
 *  a narrator says it aloud. So this reads ONLY authored fields and returns null when there are none — the
 *  attention is still withheld from the arcs (the mechanic works on day one), there is simply nothing to say
 *  about where it went.
 *
 *  The gap is MEASURED rather than papered over: `ws.personalCoverage` counts how many living figures have a
 *  life on the page and how many do not, so the hole is a number Aevi can work from instead of a silence.
 */
export function personalPursuitOf(figure, rng = Math.random) {
  const pool = [
    ...(Array.isArray(figure?.personalVerbs) ? figure.personalVerbs : []),
    ...(Array.isArray(figure?.interests) ? figure.interests : []),
    ...(Array.isArray(figure?.kin) ? figure.kin.map(k => typeof k === "string" ? k : k?.line).filter(Boolean) : []),
  ].filter(v => typeof v === "string" && v.trim());
  if (!pool.length) return null;
  return pool[Math.floor(rng() * pool.length)];
}
/** CCODE-111 — WHERE THIS FIGURE SPENDS ITSELF THIS PASS.
 *
 *  Urgency per care is the CCODE-106 term: how far that arc has run AGAINST them. Their PRIMARY want breaks
 *  ties — a figure whose want names an arc leans there when nothing is on fire, which is what "primary
 *  driving wants" means when nothing is urgent.
 *
 *  Returns the cares they will act on, each with the share of attention it gets. Everything else is a seat
 *  they left, and `unattended` names those so the caller can report the cost of the choice rather than
 *  leaving it invisible. */
export function spendAttention(figure, ws, { budget = 1, perPoint = 0.12, wantArcId = null,
                                            personalShare = 0.4, crisisPull = 1.5 } = {}) {
  const cares = affinitiesOf(figure);
  if (!cares.length) return { spent: [], unattended: [] };
  const net = ws?.arcNetPush || {};
  const scored = cares.map(c => {
    const standing = Number(net[c.arcId]) || 0;
    const against = -Math.sign(c.dir) * standing;            // positive = it is running away from them
    const pull = against * perPoint
      + (c.arcId === wantArcId ? 0.5 : 0)                    // their driving want, when nothing is urgent
      + (Number(c.weight) || 1) * 0.05;                      // how much they cared to begin with
    return { care: c, pull };
  }).sort((a, b) => b.pull - a.pull);
  // CCODE-112 — ATTENTION IS TIERED, AND THE LAST SLICE OF IT CAN BE PARTIAL.
  //
  // Erik: "a Legend can probably push a couple fronts — so they likely have more budget by default. Average
  // is 2, an epic's average is 1, heroic could have .5 or so. If a lot of NPCs of lower level gang up on a
  // legend they can push effectively against it."
  //
  // So a budget is a REACH, not a count: 2.5 means two fronts held whole and a third held at half. The whole
  // fronts come first (a legend does not half-fight the thing most urgent to them), and the remainder buys a
  // diminished presence on the next one down — which is exactly how a heroic figure at 0.5 works: present
  // everywhere they choose, decisive nowhere. Four of them together outweigh a legend, which is Erik's
  // ganging-up: it falls out of the arithmetic rather than needing a rule.
  // SNG-275 — THE ARCS DO NOT GET ALL OF SOMEBODY.
  //
  // Erik: "the Arcs don't necessarily consume all the attention for the NPCs. They probably spend a fair
  // amount of time just living their lives or pursuing their own interests — hobbies, interests, their own
  // relationships or family to attend to."
  //
  // Until now every point of every figure's budget went to arcs, which quietly said that a person IS their
  // position on the valley's five arguments. Neth is a teacher who buries the unmourned; she also, presumably,
  // eats dinner with someone. A PERSONAL CLAIM is held back before the arcs are served.
  //
  // ⚠️ AND A CRISIS CAN BORROW IT — which is the part that makes this a story rather than a subtraction.
  // When one care has run hard enough against a figure, they spend their own life on it: they stop going home.
  // That is recorded (`neglected`), because a legend who has not been home in a season is a fact the world
  // should be able to say out loud, and it is the kind of cost that cannot be paid twice without someone
  // noticing.
  const b = Math.max(0, Number(budget) || 0);
  const claim = Math.max(0, Math.min(1, Number(personalShare) || 0)) * b;
  const crisis = scored.length > 0 && scored[0].pull >= crisisPull;
  const forArcs = crisis ? b : Math.max(0, b - claim);

  const whole = Math.floor(forArcs);
  const partial = forArcs - whole;
  const spent = scored.slice(0, whole).map(s => ({ ...s, share: 1 }));
  if (partial > 0.001 && scored.length > whole) spent.push({ ...scored[whole], share: partial });
  const unattended = scored.slice(spent.length).map(s => s.care.arcId);
  return { spent, unattended, personal: crisis ? 0 : claim, neglected: crisis };
}

export function applyEpicArcPush(ws, figure, worldDay, urgency = 1) {
  const aff = figure?.arcAffinity;
  if (!aff?.arcId || !aff.dir) return null;
  const status = effectiveEpicStatus(ws, figure.id, worldDay);
  if (status === "dead") return null;
  const blunt = status === "stopped" ? 0 : status === "wounded" ? 0.5 : 1;
  if (blunt === 0) return null;
  ws.epicArcPushes = ws.epicArcPushes || {};
  const cur = ws.epicArcPushes[figure.id] || { arcId: aff.arcId, push: 0 };
  // CCODE-106: `urgency` is how hard THIS figure is leaning right now — 1 when the arc is where they can live
  // with it, higher when it is running away from them. The CAP still holds, so responsiveness changes the
  // RATE a figure closes on their limit, never the limit itself.
  const lean = aff.dir * Math.max(1, aff.weight || 1) * blunt * (Number.isFinite(urgency) ? urgency : 1);
  cur.push = Math.max(-EPIC_PUSH_CAP, Math.min(EPIC_PUSH_CAP, cur.push + lean));
  ws.epicArcPushes[figure.id] = cur;
  return { arcId: aff.arcId, push: cur.push, dir: aff.dir };
}

/** SNG-208 §3b: resolve an epic-vs-rival clash into one of Erik's outcomes. Pure — relative legend weight
 *  sets the odds, a roll decides, the MARGIN sets how decisive (a near-toss-up stalemates; only a decisive,
 *  rare roll is a `killed` CANDIDATE — the death GATE itself lives in applyEpicClashOutcome). `a` is the one
 *  who stirred, `b` the rival. Returns {winnerId, loserId, winnerName, loserName, kind, margin}. */
export function resolveEpicClash(a, b, rng = Math.random) {
  const wa = a?.legend?.weight ?? 5, wb = b?.legend?.weight ?? 5;
  const pA = wa / (wa + wb);
  const roll = rng();
  const aWins = roll < pA;
  const winner = aWins ? a : b, loser = aWins ? b : a;
  const margin = Math.abs(roll - pA);
  const r2 = rng();
  // SNG-269/2a — WHAT LOSING COSTS DEPENDS ON WHO BEAT YOU.
  //
  // Weight decided who WINS; severity was then rolled FLAT, with no reference to tier at all. So a legend
  // who lost to a heroic died at exactly the rate a heroic did. Pair that with the attention model — a
  // legend holds 2 fronts to a heroic's half, so she shows up in four times the fights — and the top of
  // the pyramid died FASTEST: measured at legendary 10.6% / epic 8.6% / heroic 4.5% over 720 days, which is
  // the exact inverse of the design ("more lower power ones should die than legends").
  //
  // Erik's rule — "a legend might kill 3-4 heroes and 1-2 epics per battle" — is a statement about the GAP.
  // Going down the ladder is lethal; going UP it is how you get checked, not how you kill. So the kill roll
  // scales with the rank gap and collapses when a lesser figure somehow prevails: they stopped her, they
  // wounded her at best. Killing far above your rung should take the story, not the dice.
  const gap = tierRank(winner.tier ?? winner.legend?.tier) - tierRank(loser.tier ?? loser.legend?.tier);
  const lethal = gap >= 0 ? 0.12 * (1 + gap) : 0.12 / (1 + 3 * Math.abs(gap));
  let kind;
  if (margin < 0.08) kind = "stalemate";
  else if (margin > 0.30 && r2 < lethal) kind = "killed";   // decisive + rare → a KILLED candidate (still gated on apply)
  else if (r2 < 0.45) kind = "wounded";
  else kind = "stopped";
  return { winnerId: winner.id, loserId: loser.id, winnerName: winner.name, loserName: loser.name, kind, margin };
}

/** SNG-208 §3b: apply a clash outcome durably. `wounded` → the loser acts at half for 8 days; `stopped` →
 *  blunted for 3; `killed` → dead + a broadcast world_event + a codex graveyard record (WHO, by WHOM, so the
 *  player can seek the killer — §3d). ⛔ Death is a LANDMARK: gated behind a long cooldown (a `killed`
 *  candidate too soon after the last epic death is DOWNGRADED to `stopped`), so a legend never quietly
 *  vanishes. Mutates ws.epicStatus. Returns { finalKind, news:[], event|null, codex|null }. */
export function applyEpicClashOutcome(ws, winner, loser, kind, worldDay, { deathCooldownDays = 20 } = {}) {
  ws.epicStatus = ws.epicStatus || {};
  const st = ws.epicStatus[loser.id] || { status: "active" };
  if (st.status === "dead") return { finalKind: "already_dead", news: [], event: null, codex: null };
  let finalKind = kind, event = null, codex = null;
  const news = [];
  if (kind === "stalemate") { news.push(`${winner.name} and ${loser.name} met — and neither could break the other.`); ws.epicStatus[loser.id] = st; return { finalKind: "stalemate", news, event, codex }; }
  if (kind === "killed") {
    const tooSoon = ws.lastEpicDeathDay != null && (worldDay - ws.lastEpicDeathDay) < deathCooldownDays;
    if (tooSoon) finalKind = "stopped"; // GATE: a second death too soon is downgraded — deaths stay landmarks
  }
  if (finalKind === "killed") {
    st.status = "dead"; st.diedWorldDay = worldDay; st.killedBy = winner.id;
    // SNG-209: a killed legend ENTERS the death state (depth 0, fresh) — reachable, for a time — not deleted.
    // The clock (deepenDeaths) will sink them toward sealed if no one goes after them.
    enterDeathState(st, { diedDay: worldDay, cause: `killed by ${winner.name}` });
    ws.lastEpicDeathDay = worldDay;
    event = { kind: "epic_death", figureId: loser.id, killerId: winner.id, worldDay, propagates: true,
      text: `A legend has fallen: ${winner.name} has killed ${loser.name}. The world is one great figure lighter, and ${winner.name} the more feared for it.` };
    codex = { entityId: loser.id, label: loser.name, kind: "person", fact: `[fell offscreen] Killed by ${winner.name}. Their unfinished work is loose in the world — and they are freshly in the death state, still within reach of the roads back, for now.` };
    news.push(event.text);
  } else if (finalKind === "wounded") {
    st.status = "wounded"; st.woundedUntilDay = worldDay + 8; st.woundedBy = winner.id;
    news.push(`${winner.name} bested ${loser.name} — ${loser.name} withdraws to lick their wounds.`);
  } else { // stopped
    st.status = "stopped"; st.stoppedUntilDay = worldDay + 3; st.stoppedBy = winner.id;
    news.push(`${winner.name} checked ${loser.name} — for now, ${loser.name}'s designs are held.`);
  }
  ws.epicStatus[loser.id] = st;
  return { finalKind, news, event, codex };
}

/** A short read of how far a figure's want has travelled, for the NEXT tick's prompt — so tick N+1 can see
 *  tick N (the whole point). */
function wantProgressLine(ws, id) {
  const st = ws.wantProgress?.[id];
  if (!st || !st.progress) return "just beginning";
  if (st.status === "resolved") return "resolved";
  return `${st.progress}/${WANT_THRESHOLD} of the way there${st.lastOutcome === "problem" ? " (last tick: a problem)" : st.lastOutcome === "stall" ? " (last tick: stalled)" : ""}`;
}

/** SNG-198B §3: the offscreen POPULATION — everyone whose life plausibly moves while the player is away,
 *  across the sources §1 kept separate, unified into a common {id, name, kind, descriptor, source} the
 *  state machine advances. Generated figures + MET NPCs move on ordinary ticks; EPIC/LEGENDARY figures —
 *  the specific gap Erik named, `legend.tier` that worldtick has NEVER read — move RARELY (a cooldown + a
 *  rare roll, so the great become daily furniture if they tick every day: rarity is the point). Pure; rng
 *  and the epic cooldown injected. */
/** SNG-269/2b — THE LIVING ROSTER: the figures the world authored PLUS the ones it has since minted.
 *
 *  Aevi (ASSESSMENT_npc_progression, Gap 2): "No `figures.push` anywhere. The world has exactly the 66
 *  figures I authored, forever." Deaths were one-way — a world simulated long enough empties out, and the
 *  tier pyramid decays in precisely the way the re-tier was meant to fix.
 *
 *  Minted figures live in WORLD STATE, not content: content is read-only and shared, while a minted figure
 *  belongs to the world that produced them. ⚠️ EVERY roster read goes through here. Six places read
 *  `content.legends.roster` directly, and a figure who exists to some of them and not others is the same
 *  half-wired failure as a field with no reader — they would fight in contests but never be surfaced, or
 *  be killable but never mournable.
 */
export function worldRoster(ws, content = {}) {
  const authored = content.legends?.roster || [];
  const minted = ws?.mintedFigures || [];
  return minted.length ? authored.concat(minted) : authored;
}

/** Mint ONE new figure into the world from an event the world actually produced. Returns the figure, or
 *  null if the roster is at its cap. Entry is at the BOTTOM (`notable`/`riffraff`) — those rungs are empty
 *  by design because they are the inflow, not a place anybody was authored into. A minted figure is REAL
 *  immediately: an id, a tier, a weight, a want, and an arc they care about, which is everything the tick
 *  needs to let them push, fight, be struck at, and die. */
export function mintFigure(ws, { tier = "notable", name = null, epithet = null, origin = "", region = null, arcAffinity = null, worldDay = 0, weight = null, cap = 140 } = {}) {
  ws.mintedFigures = ws.mintedFigures || [];
  if (ws.mintedFigures.length >= cap) return null;
  const n = (ws.mintedCounter = (ws.mintedCounter || 0) + 1);
  const fig = {
    id: `minted-${n}`,
    // ⚠️ THE NAME IS AN EPITHET, NOT A NAME. The engine mints the slot and the story; naming is authorship.
    // But it cannot be NULL — a figure with no name is skipped by every `add()` in `offscreenPopulation`,
    // and would be born into the roster and then never act. An epithet drawn from the event that made them
    // is honest, distinguishable, and reads as what it is until content gives them a real name.
    name: name || epithet || "someone newly spoken of",
    provisional: !name,
    tier,
    weight: weight ?? tierBirthWeight(tier),
    wants: origin || "to be counted among those who matter",
    // ⚠️ THE SHAPE MATTERS: `living` filters on `f.arcAffinity?.arcId`, so a bare string here silently
    // excludes a minted figure from the ENTIRE world — no contests, no standing, no promotion. They existed
    // in the roster and were invisible to every mechanic that reads a care. Same failure as a field with no
    // reader, wearing a type mismatch instead.
    // ⚠️ `dir`, NOT `lean` — `affinitiesOf` filters on `a?.arcId && a?.dir`, so a care with the wrong key
    // is no care at all. I guessed the field name instead of reading the function that consumes it, and the
    // figures were in the roster, in `living`, and contributed NOTHING to any arc: no push, no contest, no
    // lean. Twice now on this same object (the shape, then the key). The reader owns the contract.
    arcAffinity: arcAffinity ? { arcId: arcAffinity, dir: 1 } : null,
    region,
    mintedWorldDay: worldDay,
    origin,                       // WHY they exist — the event that made them, kept so the world can tell it
    legend: { tier, weight: weight ?? tierBirthWeight(tier) },
  };
  ws.mintedFigures.push(fig);
  return fig;
}

/** SNG-279 — DEEDS, NOT YEARS. Aevi measured the thing that mattered: the old ladder needed 15.5 world-years
 *  riffraff-to-mythic, which at ~3.14 world-hours per beat is roughly 2,200 player-hours. **No player would
 *  ever have seen a single promotion.** I built an entire earned-tier system that was, in play, invisible.
 *
 *  So time-in-rank becomes a FLOOR and the gate becomes DEEDS — and Aevi is right that it answers Erik's
 *  framing better than years did: surviving eight years of a world nobody is playing is not staying;
 *  surviving eight contests is.
 *
 *  ⛔ DIRECTIVE SNG-280 — NO MORAL WEIGHTING. Every contested thing WON scores the same, whichever direction
 *  it points. A Maw who levers three rivals rises exactly as fast as a guard who stops three knives. Aevi's
 *  first draft weighted guard 4 and a landed strike 2 and justified it as "the behaviour most worth having";
 *  Erik caught it as protection-over-aggression installed as physics, which would have locked the Maw, the
 *  Silencers and the Grave-Callers out of legendary and then reported that back as a finding about the world.
 *  The weights below reflect COST, DIFFICULTY, RISK and SCALE. Never approval.
 */
export const DEED_WEIGHTS = {
  arcContestWon:  3,   // you were in a contest and it went your way
  strikeLanded:   3,   // you reached someone the fighting could not — same price as stopping one
  strikeSurvived: 3,   // you were the mark and you are still here
  guardIntercept: 3,   // you stood over someone and it held
  stageMoved:     3,   // the arc itself moved while you were holding it
  spreadPerHop:   2,   // a deed that travelled: 2 per hop, so scale sets the score
  heldThroughCrisis: 1, // you kept a front on a pass that cost you your own time
};

/** Credit a figure for something the world already recorded. `by` is a source key from DEED_WEIGHTS.
 *  `playerInvolved` marks a deed the PLAYER had a hand in, so a rise it later causes can say so by name. */
export function creditDeed(ws, figureId, by, { worldDay = 0, times = 1, playerInvolved = false } = {}) {
  if (!figureId || !DEED_WEIGHTS[by]) return 0;
  ws.figureTenure = ws.figureTenure || {};
  const t = (ws.figureTenure[figureId] ||= { tier: null, sinceDay: worldDay, wins: 0, losses: 0 });
  const gained = DEED_WEIGHTS[by] * (Number(times) || 1);
  t.deeds = (t.deeds || 0) + gained;
  // WHAT they did, kept for attribution — Aevi: "a rank that arrives without a reason is a number."
  t.deedLog = (t.deedLog || []).slice(-11).concat([{ by, worldDay, playerInvolved }]);
  if (playerInvolved) t.playerTouched = true;
  return gained;
}
/** SNG-269/2c — TIER IS EARNED, NOT AUTHORED. Erik: "the ones that stay the longest are the true legends."
 *
 *  Aevi calls this the biggest reframe in the system, and it has one hard consequence for the engine: a
 *  figure's tier can no longer be read off content, because content is READ-ONLY and SHARED. A legend made
 *  in this world is not a legend in anyone else's. So the earned rung lives in world state as an OVERRIDE,
 *  and `tierOf` is the ONE place anything asks what rung somebody is on.
 *
 *  ⛔ Do not confuse this with `promotionCandidates`/`promoteInto` in the generated-canon system. That is a
 *  locally-generated entity becoming shared world-truth. Same word, unrelated machinery — Aevi flagged the
 *  collision and wiring one to the other would be a genuine mess.
 */
export function tierOf(ws, f) {
  return ws?.figureTier?.[f?.id] || f?.tier || f?.legend?.tier || null;
}

/** Advance every living figure's standing one pass. Rising takes TIME AT RUNG plus the thing that rung is
 *  about; falling takes giving up. Returns [{ id, from, to, why }] so the world can say who rose. */
export function advanceStandings(ws, roster, worldDay, cfg = {}) {
  const YEAR = Number.isFinite(cfg.worldYearDays) ? cfg.worldYearDays : 365;
  // Aevi's proposedRule, made mechanical. Each rung: how long you must hold it, and what else it asks.
  // SNG-279: `years` is now a FLOOR, and `deeds` is the gate. Aevi's compressed floors put the full ladder at
  // 1.30 world-years instead of 15.5 — a mythic reachable in a long campaign instead of never. A busy figure
  // clears a floor on deeds; a quiet one waits. That asymmetry is the point: the world's risers are the ones
  // who were DOING something.
  const RUNGS = cfg.promotion || {
    riffraff:  { to: "notable",   years: 0.05, deeds: 4 },
    notable:   { to: "heroic",    years: 0.10, deeds: 10 },
    heroic:    { to: "epic",      years: 0.20, deeds: 22 },
    epic:      { to: "legendary", years: 0.35, deeds: 70 },
    legendary: { to: "mythic",    years: 0.60, deeds: 170, unbeaten: true },
  };
  ws.figureTenure = ws.figureTenure || {};
  ws.figureTier = ws.figureTier || {};
  const out = [];
  for (const f of roster) {
    const tier = tierOf(ws, f);
    if (!tier) continue;
    const t = (ws.figureTenure[f.id] ||= { tier, sinceDay: worldDay, wins: 0, losses: 0 });
    // A NEW RUNG restarts the clock — but only a REAL one. `creditDeed` may have opened this record first,
    // with no tier on it, and treating that placeholder as "the rung changed" wiped the figure's deeds and
    // reset their floor timer on the very next pass. Nobody could ever cross a floor: every scored deed
    // silently cancelled the tenure that deed was supposed to count toward.
    if (t.tier == null) { t.tier = tier; }                       // adopt, do not reset
    else if (t.tier !== tier) { t.tier = tier; t.sinceDay = worldDay; t.wins = 0; t.losses = 0; t.deeds = 0; t.deedLog = []; }
    if (effectiveEpicStatus(ws, f.id, worldDay) === "dead") continue;
    const rule = RUNGS[tier];
    if (!rule) continue;
    const heldFor = (worldDay - t.sinceDay) / YEAR;
    const deeds = t.deeds || 0;
    if (heldFor < (rule.years ?? 0)) continue;                    // the floor
    if (deeds < (rule.deeds ?? rule.wins ?? 0)) continue;         // the gate (`wins` kept for old configs)
    if (rule.unbeaten && t.losses > 0) continue;
    // WHAT THEY DID, not just that it happened. Attribution is the requirement, not the garnish.
    const counts = {};
    for (const d of (t.deedLog || [])) counts[d.by] = (counts[d.by] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const PHRASE = {
      arcContestWon: "winning what they contested", strikeLanded: "reaching people others could not",
      strikeSurvived: "surviving what was sent at them", guardIntercept: "standing over people who lived because of it",
      stageMoved: "being there when it turned", spreadPerHop: "a name that travelled",
      heldThroughCrisis: "holding a front at their own cost",
    };
    const causedByPlayer = !!t.playerTouched;
    ws.figureTier[f.id] = rule.to;
    ws.figureTenure[f.id] = { tier: rule.to, sinceDay: worldDay, wins: 0, losses: 0, deeds: 0, deedLog: [] };
    out.push({ id: f.id, name: f.name, from: tier, to: rule.to, deeds, causedByPlayer,
      why: top ? PHRASE[top[0]] || "what they have been doing" : "what they have been doing" });
  }
  return out;
}

/** Aevi: "a wounded figure who abandons every front should fall a rung — if lasting is what makes a legend,
 *  failing to last should cost the title." Demotion is the same ladder run downward, and it is what keeps
 *  the pyramid a pyramid: without it, promotion alone would eventually make everyone mythic. */
export function demoteFigure(ws, f, worldDay) {
  const DOWN = { mythic: "legendary", legendary: "epic", epic: "heroic", heroic: "notable", notable: "riffraff" };
  const tier = tierOf(ws, f);
  const to = DOWN[tier];
  if (!to) return null;
  ws.figureTier = ws.figureTier || {};
  ws.figureTier[f.id] = to;
  ws.figureTenure = ws.figureTenure || {};
  ws.figureTenure[f.id] = { tier: to, sinceDay: worldDay, wins: 0, losses: 0 };
  return { id: f.id, name: f.name, from: tier, to };
}

/** SNG-209/SNG-270 — GOING AFTER YOUR OWN DEAD. Erik: "death isn't permanent necessarily. Both NPCs and
 *  players should be able to quest to resurrect... there are levels of death written in the lore. We need
 *  to use them."
 *
 *  `resolveRetrieval` has existed since SNG-209 and only AUTHOR MODE ever called it — a whole death ladder
 *  with a road back that no inhabitant of the world had ever walked. So the dead simply sank: every legend
 *  killed offscreen deepened on a timer until they sealed, and nobody ever came for them.
 *
 *  THE COST IS ATTENTION, which is what makes it a decision rather than a free wish. A figure who goes
 *  after their dead spends a front doing it — the arc they would have been pushing goes unheld this pass,
 *  and the other side gains it for nothing. That is exactly the trade Erik described for attention
 *  generally, applied to the most human thing a person can spend it on.
 *
 *  WHO GOES: someone who shared a care with the dead. Not the strongest figure available — the one who was
 *  on their side of something. Depth sets the odds (the threshold is nearly free; the deep dark rarely
 *  works), rank helps, and FAILING SINKS THEM FURTHER — a failed reach at the deep dark seals them for
 *  good. Trying is the risk; that is what makes leaving someone in the dark a real choice too.
 *
 *  Returns { attempts, retrievers } — retrievers is a Set of ids that owe a front to the dead this pass. */
export function attemptRetrievals(ws, roster, living, worldDay, rules = {}, cfg = {}, rng = Math.random) {
  const attempts = [];
  const wanted = [];
  const retrievers = new Set();
  const rate = Number.isFinite(cfg.retrievalRate) ? cfg.retrievalRate : 0.25;
  const byDepth = cfg.retrievalOddsByDepth || { 0: 0.7, 1: 0.45, 2: 0.2, 3: 0 };   // the threshold → the sealed
  for (const [id, st] of Object.entries(ws.epicStatus || {})) {
    if (st?.status !== "dead" || !isRetrievable(st, worldDay, rules)) continue;
    const onCooldown = ws.retrievalTried?.[id] && worldDay - ws.retrievalTried[id] < (cfg.retrievalCooldownDays ?? 30);
    // ⛔ LOOK THEM UP IN THE FULL ROSTER, NOT `living` — `living` excludes the dead BY DEFINITION, so the
    // dead figure resolved to a bare `{ id }` with no cares, nobody shared a care with them, and not one
    // retrieval was ever attempted. Searching for a dead person in the list of the living: it returns
    // nothing, forever, and never once errors.
    const dead = roster.find(f => f.id === id) || { id };
    const cares = new Set(affinitiesOf(dead).map(c => c.arcId));
    // Someone who stood on the same side of something. Failing that, nobody comes.
    const kin = living.filter(f => f.id !== id && effectiveEpicStatus(ws, f.id, worldDay) === "active"
      && affinitiesOf(f).some(c => cares.has(c.arcId)));
    if (!kin.length) continue;
    const who = kin.sort((a, b) => tierRank(tierOf(ws, b)) - tierRank(tierOf(ws, a)))[0];
    // WHO WANTS THEM BACK — recorded for EVERY reachable dead with living kin, not only the ones somebody
    // reaches for this pass. That is the difference between a corpse and a QUEST: the GM can only offer
    // "go get them back for me" if it knows there is a someone doing the asking. Erik: "we should have
    // quests to retrieve for NPCs."
    wanted.push({ deadId: id, deadName: dead.name || null, byId: who.id, byName: who.name || null,
      depth: deathDepth(st, worldDay, rules), waiting: !!onCooldown });
    if (onCooldown || rng() >= rate) continue;
    retrievers.add(who.id);
    (ws.retrievalTried ||= {})[id] = worldDay;
    const depth = deathDepth(st, worldDay, rules);
    const odds = Math.min(0.95, (byDepth[depth] ?? 0) + 0.05 * tierRank(tierOf(ws, who)));
    const won = rng() < odds;
    const res = resolveRetrieval(st, won ? "return" : "fail", { currentDay: worldDay, changed: won ? "came back changed" : null });
    attempts.push({ deadId: id, byId: who.id, byName: who.name, depth, odds: Math.round(odds * 100) / 100,
      outcome: res.ok ? res.outcome : "refused", sealed: !!st.deathState?.sealed });
  }
  ws.retrievalWanted = wanted;
  return { attempts, retrievers, wanted };
}

export function offscreenPopulation(character, content = {}, { worldDay = 0, rng = Math.random, lastEpicDay = null, minEpicGapDays = 3, epicRate = 0.6 } = {}) {
  const out = [];
  const seen = new Set();
  const add = (id, name, kind, descriptor, source) => { if (id && name && !seen.has(id)) { seen.add(id); out.push({ id, name, kind, descriptor: descriptor || "their own ends", source }); } };
  // 1. established/nominated generated figures + threads (the original Phase-2 population)
  for (const r of [...generatedRecords(character, "npc"), ...generatedRecords(character, "arc")]) {
    if (!r._gen || (r._gen.tier !== "established" && r._gen.tier !== "nominated")) continue;
    const isArc = r._gen.type === "arc";
    add(r.id, r.name, isArc ? "arc" : "npc", isArc ? (r.tendency || r.pressure) : (r.wants || r.role), "generated");
  }
  // 2. MET NPCs — anyone in the registry with a want the world can carry (their authored catalog want, else
  //    their role/standing). Authored-vs-generated is not a reason a person's life stops (§3.1).
  for (const n of Object.values(character?.npcRegistry || {})) {
    if (n.status === "dead" || n.status === "departed") continue;
    const want = content.npcs?.[n.id]?.wants || n.role || null;
    if (!want) continue;
    add(n.id, n.name, "npc", want, "met");
  }
  // 3. EPIC / LEGENDARY (§3.3 / SNG-208 §3c). Their OWN rate — leaning toward presence now (Erik: "make sure
  //    their actions show up fairly frequently"), still a cooldown so it is felt, not a flood. Dead epics
  //    (SNG-208 §3b) are gone from the world and never stir again.
  const coolOk = lastEpicDay == null || (worldDay - lastEpicDay) >= minEpicGapDays;
  if (coolOk && rng() < epicRate) {
    const greats = worldRoster(character?.worldState, content).filter(f => (f.tier === "legendary" || f.tier === "epic") && effectiveEpicStatus(character?.worldState, f.id, worldDay) !== "dead");
    if (greats.length) { const f = greats[Math.floor(rng() * greats.length)]; add(f.id, f.name, "npc", f.wants || f.signature, "legend"); }
  }
  // 3b. MINTED (SNG-269/2b) — the figures this world made for itself. ⚠️ They must be HERE, not merely in
  //     `worldRoster`: a figure who is born into the roster but never enters the population exists on paper
  //     and never acts. That was the bug that made the vacancy streak re-fire forever — the newly minted
  //     figure could not hold the arc that produced them, so the seat stayed empty and minted another.
  for (const f of (character?.worldState?.mintedFigures || [])) {
    if (effectiveEpicStatus(character?.worldState, f.id, worldDay) === "dead") continue;
    add(f.id, f.name, "npc", f.wants || f.origin, "minted");
  }
  // 4. HEARD OF, not met (§3.2) — a codex PERSON node with no registry entry is exactly "known of, not met."
  //    SNG-199 made MEETING write the registry, so this marker exists for free (met people were filtered out
  //    above by their registry entry; generated/legend already `seen`). Appended LAST + low priority so the
  //    batch cap prefers the people the player actually knows; their descriptor is what he knows of them.
  //    Companions (companion-*) are their own thing, not offscreen figures.
  for (const t of Object.values(character?.codex?.topics || {})) {
    if (t.kind !== "person") continue;
    const id = t.entityId || t.id;
    if (!id || seen.has(id) || String(id).startsWith("companion-") || character?.npcRegistry?.[id]) continue;
    const fact = (t.facts || []).slice(-1)[0] || t.label;
    add(id, t.label, "npc", `known of: ${String(fact).replace(/^\[[^\]]*\]\s*/, "")}`, "heardof");
  }
  return out;
}

export async function advanceGeneratedOffscreen({ character, content = {}, evolveFn = aiGeneratedEvolution, now = Date.now(), rng = Math.random, model = null } = {}) {
  if (!character) return [];
  if (!character.worldState) character.worldState = initWorldState(1);
  const ws = character.worldState;
  const currentWorldDay = absoluteWorldDay(now);
  const elapsedWorldDays = currentWorldDay - (ws.lastTickWorldDay ?? currentWorldDay);
  // first observation just anchors the shared-clock baseline; nothing has elapsed yet
  if (ws.lastTickWorldDay == null) { ws.lastTickWorldDay = currentWorldDay; return []; }
  if (elapsedWorldDays <= 0) return [];

  // SNG-198B: the widened population, minus anyone whose want has already resolved (§2 — a resolved want
  // stops ripening). Batched (cap 4), never fanned out (§5 cost).
  const population = offscreenPopulation(character, content, { worldDay: currentWorldDay, rng, lastEpicDay: ws.lastEpicOffscreenDay })
    .filter(e => ws.wantProgress?.[e.id]?.status !== "resolved");
  ws.lastTickWorldDay = currentWorldDay; // advance the baseline even if nobody's in scope
  const news = [];
  // SNG-204: open wakes decay over world-time; one nobody engaged closes unspawned (the world moves on). This
  // runs every tick, even when no figure is in scope — so a wake left unacted-on still fades on schedule.
  for (const w of decayWakes(character, currentWorldDay)) news.push({ text: `The moment to act on ${w.source.arcId ? String(w.source.arcId).replace(/^arc_/, "").replace(/_/g, " ") : "a passing consequence"} has closed — the world moved on.`, worldDay: currentWorldDay, tier: "ambient" }); // SNG-211: a fade is texture, not a headline
  // SNG-209 THE CLOCK: a death left untended sinks toward SEALED over world-time — a retrievable death is a
  // latent hook; a sealed one is beyond the roads back. Only deathState-bearing deaths are on the clock (epic
  // kills, wired in applyEpicClashOutcome); a pre-209 death without a state reads as "near dark" and is left
  // alone until someone stamps it. Names resolved for the news line; the seal itself is a real event.
  const deathNames = new Map();
  for (const f of worldRoster(ws, content)) { const st = ws.epicStatus?.[f.id]; if (st) deathNames.set(st, f.name); }
  for (const n of Object.values(character.npcRegistry || {})) if (n && typeof n === "object") deathNames.set(n, n.name);
  for (const e of deepenDeaths([...deathNames.keys()], currentWorldDay, content.rules || {})) {
    const name = deathNames.get(e);
    if (name) news.push({ text: `${name} has passed beyond the roads back — the dark has closed over them, and no return remains.`, worldDay: currentWorldDay, tier: "event" });
  }
  if (!population.length || !evolveFn) {
    if (news.length) { const stamped = news.map(n => ({ day: ws.lastTickDay ?? null, worldDay: n.worldDay, text: smartClamp(n.text, 600), tier: n.tier || "event" })); ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP); ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP); }
    return news;
  }
  // CCODE-99 — A LEGEND KEEPS A SEAT. Erik: "the epic and legendary NPCs should be doing things in the world
  // — the player is just one of many." Measured on his own most-played save: the population is 47 entries,
  // the legend sits at INDEX 36, and this batch was a flat `slice(0, 4)` — so generated entities and met NPCs
  // filled every seat and the legend was CUT BEFORE THE EVOLVER EVER SAW IT. Not sometimes: every turn, for
  // anyone who knows more than four people. `epicArcPushes` is empty in all 10 real saves for exactly this
  // reason, while the chain behind it — want outcome, arc push, rival clash — works perfectly when reached.
  //
  // So one seat is RESERVED. `offscreenPopulation` already paid for the cooldown and the rate roll before a
  // legend is offered at all, so if one is in the list it has earned its place; the flat slice was silently
  // overruling that. The other three seats are unchanged, and a population with no legend is untouched.
  // CCODE-102 — THE WINDOW ROTATES. Erik: "it seems dumb to slice any content if it isn't a big deal to keep
  // it and fully move things." The cap itself is real — each entity in the batch costs a generative call, and
  // this population is 47 long on his own save. What was NOT defensible is that the window never MOVED:
  // `offscreenPopulation` builds in a stable order, so `slice(0, 4)` handed the model THE SAME FOUR PEOPLE on
  // every pass, forever. Measured across five successive passes: identical. 43 of 47 could never move at all.
  //
  // So the batch is a ROTATING window over the whole population, advanced by one batch each pass and
  // persisted on the world state. Everyone comes round eventually, the cost per pass is unchanged, and the
  // reserved legend seat still overrides the rotation — a legend that earned its cooldown and rate roll is
  // never rotated past.
  const BATCH_N = 4;
  const legendAt = population.findIndex(e => e.source === "legend");
  const cursor = Number(ws.offscreenCursor) || 0;
  const rotated = population.length ? population.slice(cursor % population.length).concat(population.slice(0, cursor % population.length)) : [];
  const window = rotated.slice(0, BATCH_N);
  const batch = legendAt >= 0 && !window.some(e => e.source === "legend")
    ? [population[legendAt], ...window.slice(0, BATCH_N - 1)]
    : window;
  ws.offscreenCursor = population.length ? (cursor + BATCH_N) % population.length : 0;

  // CCODE-103 — THE WORLD KEEPS HAPPENING TO EVERYONE; ONLY THE TELLING WAITS ITS TURN.
  // Erik: "I don't want to lose the tick content on the npcs who aren't in the current update pass — those
  // should stack in a log for each, then get their full update when their window comes."
  //
  // Right, and it is what makes a rotating window honest rather than merely fair. Without it, a person 15
  // passes from their turn simply has 15 passes of nothing happen to them — the rotation would spread the
  // silence around instead of ending it. So every entity OFF the window accrues its elapsed days here, and
  // the entity whose turn comes is developed against the WHOLE span it waited, not just the last tick.
  //
  // Bounded on purpose: days accumulate as a number, not a transcript. The backlog is how LONG it has been
  // and what was pending, not a second history of the world — that already exists, and duplicating it here
  // would grow every save forever.
  // CCODE-105 — EVERY LEGEND ACTS EVERY PASS. THE BATCH ONLY DECIDES WHO GETS TOLD.
  //
  // Erik: "every NPC is acting every day... there needs to be some way to reconcile the actions — a legend
  // pushing an arc one way on day 5, then on day 15 we realize another legend countered that push THE SAME
  // DAY but did not get to have it told until day 15. We need a bit more coherency. Maybe a larger slice?"
  //
  // A larger slice makes the incoherence RARER, not absent — it is a sampling fix for a causality bug. The
  // actual fault is that MECHANICAL RESOLUTION and NARRATION were the same pass, so an arc only moved when
  // its mover happened to be in the window. Two counter-pushes on the same day could then be told a fortnight
  // apart, and the second would have to contradict a story the player already heard.
  //
  // So they are separated. The mechanical pass below runs over EVERY living legend, EVERY time, and it is
  // free: pure arithmetic, no generative call. Arc pushes NET — A at +3 and B at −2 on the same day is +1 on
  // that day, settled before anyone narrates anything. The generative batch is now purely a question of WHOM
  // TO TELL ABOUT, and telling something late can no longer contradict it, because the arithmetic already
  // happened on time.
  //
  // This also answers "is 4 enough for the world?" — 4 was never the world's reach, only its VOICE. The world
  // now moves at full population; 4 is how many of those movements get words this pass.
  {
    const living = worldRoster(ws, content).filter(f =>
      f?.arcAffinity?.arcId && effectiveEpicStatus(ws, f.id, currentWorldDay) !== "dead");
    // CCODE-106 — THEY RESPOND TO WHAT IS HAPPENING. Erik: "if it's heard that something is moving forward,
    // other NPCs will become more motivated to try to stop or help it — where does that come in?"
    //
    // It did not. Every legend pushed a fixed `dir × weight` every pass forever, so an arc was the SUM OF A
    // CENSUS rather than a contest: whichever side had more figures won by arithmetic, at a constant rate,
    // and nobody ever reacted to losing. That is a world of people with opinions and no eyes.
    //
    // So the push is now scaled by how the arc stands AGAINST the pusher. Someone watching the thing they
    // fear gain ground leans in HARDER; someone whose side is already carrying it eases off. That single term
    // turns a tug-of-war into a RESTORING one — arcs still move, and decisively when one side is genuinely
    // stronger, but a runaway rallies its opposition instead of simply completing.
    //
    // Deliberately NOT modelled: who has HEARD what. Erik said "if it's heard", and a figure reacting to news
    // that has not reached them would be the reputation-outruns-news bug (CCODE-85) in a new place. Every
    // legend here reacts to the arc's own state, which is the thing they all live inside. Per-figure
    // knowledge is a real next step and it is named in the ALERT rather than faked here.
    const cfg = content.rules?.arcResponse || {};
    const sbCfg = content.skillBattle?.engine || content.rules?.skillBattle?.engine || null;
    const perPoint = Number.isFinite(cfg.perPoint) ? cfg.perPoint : 0.12;   // urgency gained per point against you
    const maxMult = Number.isFinite(cfg.maxMult) ? cfg.maxMult : 2.0;       // nobody pushes infinitely hard
    const minMult = Number.isFinite(cfg.minMult) ? cfg.minMult : 0.4;       // and a winning side never fully stops
    const netBefore = ws.arcNetPush || {};
    // CCODE-111: each figure now DECIDES where to spend itself. A care they leave gets no push from them at
    // all this pass — which is the vacancy Erik named: the other side gains that seat for free, without
    // winning anything. `attentionBudget` is a content dial; at 1 (the default) a legend fights one front.
    // CCODE-112: budget by TIER. A legend holds a couple of fronts; an epic one; a heroic figure half of one.
    // Content-dialled, and the fallback keeps a figure of unknown tier at the old single front.
    // SNG-269: BOTH tier strings. The roster re-tier renamed this rung `heroic`; `regional` survives as an
    // alias because authored content and `encounterFrame` still say it. A table carrying only one name
    // silently drops 28 figures to the unknown-tier fallback.
    const tierBudget = cfg.attentionByTier || { mythic: 3, legendary: 2, epic: 1, heroic: 0.5, regional: 0.5, notable: 0.5 };
    const budgetFor = f => {
      const t = tierOf(ws, f);        // SNG-269/2c: the EARNED rung, not the authored one
      const v = tierBudget[t];
      return Number.isFinite(v) ? v : (Number.isFinite(cfg.attentionBudget) ? cfg.attentionBudget : 1);
    };
    // SNG-270 — SOMEBODY GOES AFTER THE DEAD, and pays a front to do it. Run BEFORE attention is spent,
    // because the whole point is that this competes with the arcs: an ally in the dark and a front that
    // needs holding draw on the same budget, and choosing one is choosing against the other.
    const { attempts: retrievals, retrievers } =
      attemptRetrievals(ws, worldRoster(ws, content), living, currentWorldDay, content.rules, cfg, rng);
    ws.arcRetrievals = retrievals;
    for (const r of retrievals) {
      if (r.outcome === "return") news.push({ text: `${r.byName || "Someone"} went into the dark and came back with them. The valley has one of its own again — changed, but back.`, worldDay: currentWorldDay, tier: "event" });
      else if (r.sealed) news.push({ text: `${r.byName || "Someone"} reached too deep and lost them for good. That road is closed now.`, worldDay: currentWorldDay, tier: "event" });
    }

    // SNG-279 — IS THE PLAYER PUSHING THIS ARC? Aevi: when a player act crossed the threshold, the rise must
    // say so by name. This is the ONE causation path the offscreen tick can honestly see: the player's own
    // push on the same arc. (A player who killed a legend or struck a worker is a second path and is NOT
    // wired — those acts are recorded on the character, not in the tick, and claiming them here would be a
    // guess wearing an attribution.)
    const playerOnArc = (arcId) => { try { return (arcPushes(character, arcId)?.mine || 0) !== 0; } catch { return false; } };

    // SNG-275 — the personal claim. Dials live in content beside the rest of the attention model.
    const personalShare = Number.isFinite(cfg.personalShare) ? cfg.personalShare : 0.4;
    const crisisPull = Number.isFinite(cfg.crisisPull) ? cfg.crisisPull : 1.5;
    const heldNothing = new Set();  // SNG-279: figures who spent their attention on no front at all
    const personalBeats = [];      // figures whose own life is ON THE PAGE this pass
    const neglectedLives = [];     // …and the ones who spent it on a crisis instead
    let livesLived = 0, livesOnThePage = 0;

    const vacated = {};
    const leaning = {};   // CCODE-113: arcId -> who is pushing which way this pass
    for (const f of living) {
      const wantArc = f.wantArcId || f.legend?.wantArcId || null;
      const { spent, unattended, personal, neglected } = spendAttention(f, { arcNetPush: netBefore },
        // A front spent in the dark is a front not spent on an arc — the cost that makes it a decision.
        { budget: Math.max(0, budgetFor(f) - (retrievers.has(f.id) ? 1 : 0)), perPoint, wantArcId: wantArc,
          // SNG-275: and a share is not the arcs' to spend at all — a person is not only their position on
          // the valley's five arguments. A crisis can borrow it; that borrowing is recorded, not free.
          personalShare, crisisPull });
      if (!spent.length) heldNothing.add(f.id);   // SNG-279: put themselves nowhere this pass
      if (personal > 0) {
        const pursuit = personalPursuitOf(f, rng);
        livesLived++;
        if (pursuit) { livesOnThePage++; personalBeats.push({ id: f.id, name: f.name, pursuit }); }
      } else if (neglected) {
        // the care they are spending themselves on is the one they actually took this pass
        neglectedLives.push({ id: f.id, name: f.name, arcId: spent[0]?.care?.arcId ?? null });
        // SNG-279: holding a front on a pass that cost you your own life is a deed. Weight 1 — it is real
        // but it is not a contest; scale and risk are lower, which is the only reason it scores less.
        creditDeed(ws, f.id, "heldThroughCrisis", { worldDay: currentWorldDay });
      }
      for (const arcId of unattended) vacated[arcId] = (vacated[arcId] || 0) + 1;
      for (const s of spent) {
        const against = -Math.sign(s.care.dir) * (Number(netBefore[s.care.arcId]) || 0);
        const urgency = Math.max(minMult, Math.min(maxMult, 1 + against * perPoint));
        // CCODE-113: record who is leaning on what, so the arcs can be CONTESTED below rather than merely
        // summed. Attention decided WHERE they stand; the dice decide how the standing goes.
        const side = s.care.dir > 0 ? "pro" : "con";
        (leaning[s.care.arcId] = leaning[s.care.arcId] || { pro: [], con: [] })[side]
          .push({ f, care: s.care, urgency, share: s.share ?? 1 });
      }
    }
    // CCODE-113 — THE ARC IS FOUGHT OVER, NOT ADDED UP. Erik: "some sort of simulated battle that uses the
    // game mechanics with rolls so the outcomes are not predetermined." For each arc where both sides showed
    // up, the LEADING figure on each side fights a real `battleRound`; the margin scales both sides' pushes.
    // An unopposed arc is not a fight and is not rolled — nobody wins a contest they were alone in.
    // CCODE-114 — EVERYONE WHO SHOWED UP FIGHTS. Erik: "only the leading figure fights??? seems like all
    // should fight somehow." Correct, and the first version was a DUEL standing in for a WAR — one champion
    // deciding an arc that 55 figures have a stake in, with everyone else's push merely scaled by how their
    // champion did. That is a tournament, not a world.
    //
    // Now the two sides PAIR OFF strongest-against-strongest and every pair fights its own real battleRound.
    // Two things fall out that nobody has to write as rules:
    //  · GANGING UP WORKS. The larger side runs out of opponents, and its surplus pushes UNOPPOSED — four
    //    heroics against one legend means the legend fights one of them and three lean on the arc untouched.
    //  · VARIANCE SCALES WITH STAKES. One duel is a coin-flip; twenty pairings average out, so a heavily
    //    contested arc moves steadily and a thinly contested one is volatile. That is the right way round.
    // CCODE-115 — MOST PEOPLE WORK AT A THING; SOME PEOPLE FIGHT OVER IT.
    //
    // Erik: "legends can probably take on more than one epic or heroic, so there is some cancellation to the
    // pure 1-1... plus I would imagine a lot of people getting hurt or dying this way — not everything is a
    // direct fight. So let us figure out how many fought vs pushed in their own way, and how effective each is."
    //
    // Both true, and the second is the one that was making the valley a bloodbath: pairing EVERYONE meant
    // every committed figure was in a duel every pass. Most of them are not fighting anybody — they are
    // building, arguing, tending, refusing. That is still pushing an arc; it is just not a battle.
    //
    // So each pass splits into two populations:
    //  · THE ENGAGED (a minority, and the most URGENT go first — you seek a confrontation over the thing you
    //    cannot bear losing): they fight real battleRounds. Decisive, and the only place injury lives.
    //  · THE WORKERS (everyone else): no roll against a person, a steady push. Reliable but modest.
    //
    // THE TRADE, which is the interesting part: a won fight moves an arc more than a season of work; a lost
    // one moves it less than doing nothing would have. Working is the safe, small, certain option. That is a
    // real decision and it is legible in the numbers.
    //
    // WEIGHT-MATCHED PAIRING, not index-matched: a legend at weight 9 holds off lesser figures until their
    // COMBINED weight matches hers. Three heroics can pin a legend; one cannot. Erik's cancellation.
    const engageRate = Number.isFinite(cfg.directEngagementRate) ? cfg.directEngagementRate : 0.35;
    const workMult = Number.isFinite(cfg.indirectPushMult) ? cfg.indirectPushMult : 0.8;
    const wOf = e => (Number(e.f.legend?.weight ?? e.f.weight) || 5) * e.share;
    const arcOutcomes = {};
    const casualties = [];   // CCODE-117: who was hurt or killed over an arc this pass
    const strikes = [];      // CCODE-121: the quiet work — who was sent at whom, and who stood over them
    for (const [arcId, sides] of Object.entries(leaning)) {
      // The most urgent seek a fight; the rest get on with their work.
      const split = list => {
        const byUrgency = list.slice().sort((a, b) => b.urgency - a.urgency);
        const n = Math.min(byUrgency.length, Math.max(0, Math.round(byUrgency.length * engageRate)));
        return { engaged: byUrgency.slice(0, n), working: byUrgency.slice(n) };
      };
      const P = split(sides.pro), Q = split(sides.con);
      let duels = 0, proWins = 0, conWins = 0;

      // WEIGHT-MATCHED MELEE. Strongest engaged figure on each side; the lighter one draws in allies until
      // the two sides of THIS confrontation are comparable. Everyone drawn in shares the outcome.
      const pq = P.engaged.slice().sort((a, b) => wOf(b) - wOf(a));
      const qq = Q.engaged.slice().sort((a, b) => wOf(b) - wOf(a));
      while (pq.length && qq.length) {
        const aSide = [pq.shift()], bSide = [qq.shift()];
        let aw = wOf(aSide[0]), bw = wOf(bSide[0]);
        while (bw < aw * 0.75 && qq.length) { const n = qq.shift(); bSide.push(n); bw += wOf(n); }   // they gang up
        while (aw < bw * 0.75 && pq.length) { const n = pq.shift(); aSide.push(n); aw += wOf(n); }
        const champ = (side, w) => ({ ...side[0].f, legend: { ...(side[0].f.legend || {}), weight: w } });
        const res = sbCfg ? contestArc({ pro: champ(aSide, aw), con: champ(bSide, bw), sb: sbCfg, rules: content.rules, steps: content.steps, rng }) : null;
        duels++;
        if (res && !res.drawn) (res.winner === aSide[0].f.id ? proWins++ : conWins++);
        // SNG-269/2c: a contest is the thing "win contests on an arc they drive or defend" refers to.
        // Recorded on every participant, not just the leader — the allies were in the same fight.
        if (res && !res.drawn) {
          ws.figureTenure = ws.figureTenure || {};
          const won = res.winner === aSide[0].f.id ? aSide : bSide, lost = won === aSide ? bSide : aSide;
          for (const e of won) if (ws.figureTenure[e.f.id]) ws.figureTenure[e.f.id].wins++;
          for (const e of lost) if (ws.figureTenure[e.f.id]) ws.figureTenure[e.f.id].losses++;
          // SNG-279: a contest won is a DEED, credited to everyone who was in it — the allies were in the
          // same fight. `playerInvolved` when the player is pushing this same arc: their weight is part of
          // what made the win possible, and a rise it causes should be able to say so.
          for (const e of won) creditDeed(ws, e.f.id, "arcContestWon", { worldDay: currentWorldDay, playerInvolved: playerOnArc(arcId) });
        }
        // CCODE-117 — A FIGHT CAN COST SOMETHING. Erik: "what if more get killed or injured? what knob would
        // we turn to do that?" The knob was a DISCONNECTED WIRE: 28 duels a pass across the valley and not
        // one could hurt anybody, because `contestArc` returned multipliers and never touched `epicStatus`.
        // The only path to a wound was the separate NARRATED clash, gated three ways.
        //
        // Now a decisive arc-fight resolves through the SAME `resolveEpicClash` + `applyEpicClashOutcome`
        // that the narrated path uses — one injury model, not two, so a wound taken over an arc and a wound
        // taken in a story mean the same thing. `casualtyRate` is the knob (0 = arcs are bloodless).
        //
        // ONLY THE LEADERS ARE AT RISK: the figures who drew allies in are the ones who met each other. The
        // allies pushed; they did not duel. Putting everyone on the casualty table is how a roster empties.
        // CCODE-118 — CASUALTIES ARE TIERED, AND A LEGEND CUTS DOWN SEVERAL.
        //
        // Erik: "I would expect more lower power ones to die than legends. A legend might be able to kill 3-4
        // heroes and 1-2 epics per battle."
        //
        // The first version risked only the two LEADERS at a flat rate, which made a legend and the heroic who
        // helped pin her equally likely to fall. That is not a battle, it is a coin-flip between equals who
        // are not equals. Now the TIER GAP decides both how many the winner can cut down and how badly each
        // one suffers — so a legend wading through heroics is lethal, and two legends meeting mostly is not.
        //
        // The winner reaches into the LOSING SIDE, not just its leader: the allies who ganged up are exactly
        // who a legend goes through. Ganging up on someone far above you should be dangerous, or it is a free
        // action and everyone would always do it.
        // CCODE-119 — THE LADDER HAS SIX RUNGS AND A NEW TOP. SNG-269 adds `mythic` ABOVE legendary and
        // renames rung 2 to `heroic`. My map knew neither, and its `?? 2` fallback made both of them rank as
        // EPIC — so a MYTHIC would have ranked BELOW a legendary, and every tier-gap casualty involving one
        // would have been computed backwards. A silent mid-tier default is the worst possible fallback for a
        // LADDER: it does not fail, it just quietly puts strangers in the middle.
        //
        // Unknown tiers now resolve to the FLOOR and are recorded, so a rung nobody taught this map about is
        // visible rather than average. `regional` is kept as an alias for `heroic` while the rename lands.
        // SNG-269: the ladder now has ONE definition (`tierRank`, exported from legends.js). This module
        // kept its own copy, which is how it came to be missing `mythic` and `heroic` in the first place.
        // The unknown-tier RECORD stays here — a rung nobody taught the ladder about must stay visible.
        const rankOf = f => {
          const t = tierOf(ws, f);    // SNG-269/2c: earned rung — a promoted figure fights at their new weight
          if (t && !KNOWN_TIERS.has(t)) (ws.unknownTiers = ws.unknownTiers || {})[t] = (ws.unknownTiers?.[t] || 0) + 1;
          return tierRank(t);
        };
        const casualtyRate = Number.isFinite(cfg.casualtyRate) ? cfg.casualtyRate : 0.15;
        if (res && !res.drawn && rng() < casualtyRate) {
          const winSide = res.winner === aSide[0].f.id ? aSide : bSide;
          const loseSide = winSide === aSide ? bSide : aSide;
          const wf = winSide[0].f;
          // How many the victor can go through. A legend over heroics reaches 3-4; over epics 1-2; a peer, one.
          const reachByGap = cfg.casualtyReachByGap || { "2": 4, "1": 2, "0": 1 };
          const gapTo = lf => Math.max(0, rankOf(wf) - rankOf(lf));
          let budget = reachByGap[String(gapTo(loseSide[0].f))] ?? 1;
          for (const e of loseSide) {
            if (budget <= 0) break;
            const gap = gapTo(e.f);
            // A wider gap is not just more casualties — it is worse ones. Peers wound each other; a legend
            // ends a heroic. `resolveEpicClash` still owns the roll and the death GATE; this only weights it.
            const severity = Math.min(1, 0.25 + gap * 0.35);
            if (rng() > severity) continue;
            const clash = resolveEpicClash(wf, e.f, rng);
            const outcome = applyEpicClashOutcome(ws, wf, e.f, clash.kind, currentWorldDay);
            if (outcome?.finalKind && outcome.finalKind !== "already_dead") {
              casualties.push({ arcId, winner: wf.id, loser: e.f.id, kind: outcome.finalKind,
                winnerTier: wf.tier ?? wf.legend?.tier ?? null, loserTier: e.f.tier ?? e.f.legend?.tier ?? null });
              for (const line of (outcome.news || [])) news.push({ text: line, worldDay: currentWorldDay, tier: "event" });
            }
            budget--;
          }
        }
        for (const e of aSide) applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * (res ? res.proMult : 1));
        for (const e of bSide) applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * (res ? res.conMult : 1));
      }
      // An engaged figure with nobody left to face is not in a fight after all — they push like a worker.
      const unfought = [...pq, ...qq];
      for (const e of [...P.working, ...Q.working, ...unfought]) {
        applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * workMult);
      }
      // CCODE-121 — THE QUIET WORK. Aevi/Erik (SNG-270): "a player becomes both a target, and can be sent on
      // a strike mission... or to guard someone under threat."
      //
      // AND IT ANSWERS THE HEROIC-MORTALITY QUESTION EXACTLY. CCODE-120 measured heroes as the SAFEST rung
      // (0.5% vs a legend's 7.4%) because they never show up to a duel — they are in the WORKING population,
      // and the casualty table only ever reached people who fought. A strike targets precisely those people.
      // Aevi: "the most valuable worker on an arc is, statistically, a heroic-tier figure quietly tending
      // something." So the mechanic that kills heroes is not a better fight — it is a knife in the dark, and
      // the population it reaches is the one combat structurally cannot.
      //
      // A strike is aimed at the OTHER side's best worker — value, not rank, which is what makes the target
      // usually not a villain. A GUARD on that side intercepts: someone who chose to stand still is the reason
      // the strike fails, and standing still is its own cost (they are not pushing while they watch).
      const strikeRate = Number.isFinite(cfg.strikeRate) ? cfg.strikeRate : 0.12;
      for (const [attackers, defenders] of [[P, Q], [Q, P]]) {
        if (!attackers.engaged.length || !defenders.working.length) continue;   // someone must send it, someone must be exposed
        if (rng() >= strikeRate) continue;
        const valueOf = e => (Number(e.f.legend?.weight ?? e.f.weight) || 5) * e.share * e.urgency;
        const mark = defenders.working.slice().sort((a, b) => valueOf(b) - valueOf(a))[0];
        const sender = attackers.engaged[0];
        // A GUARD is a defender who spent attention here and is NOT the mark — someone standing over them.
        const guard = defenders.working.find(e => e !== mark) || defenders.engaged[0] || null;
        const guarded = guard && rng() < (Number.isFinite(cfg.guardInterceptChance) ? cfg.guardInterceptChance : 0.45);
        if (guarded) {
          strikes.push({ arcId, target: mark.f.id, sender: sender.f.id, outcome: "guarded", guard: guard.f.id });
          // SNG-279 / ⛔ DIRECTIVE SNG-280: the guard and the survivor score the SAME as the striker. Standing
          // over someone and reaching past someone are both contested things won; nothing here ranks them.
          creditDeed(ws, guard.f.id, "guardIntercept", { worldDay: currentWorldDay });
          creditDeed(ws, mark.f.id, "strikeSurvived", { worldDay: currentWorldDay });
          continue;
        }
        const clash = resolveEpicClash(sender.f, mark.f, rng);
        const outcome = applyEpicClashOutcome(ws, sender.f, mark.f, clash.kind, currentWorldDay);
        if (outcome?.finalKind && outcome.finalKind !== "already_dead") {
          strikes.push({ arcId, target: mark.f.id, sender: sender.f.id, outcome: outcome.finalKind,
            targetTier: mark.f.tier ?? mark.f.legend?.tier ?? null });
          creditDeed(ws, sender.f.id, "strikeLanded", { worldDay: currentWorldDay });
          if (outcome.finalKind !== "killed") creditDeed(ws, mark.f.id, "strikeSurvived", { worldDay: currentWorldDay });
          for (const line of (outcome.news || [])) news.push({ text: line, worldDay: currentWorldDay, tier: "event" });
        }
      }

      arcOutcomes[arcId] = { duels, proWins, conWins,
        fought: P.engaged.length + Q.engaged.length - unfought.length,
        worked: P.working.length + Q.working.length + unfought.length };
    }
    // Per arc: how many FOUGHT, how many WORKED, and who won — so a narrator can say "two of them came to
    // blows over it and thirty quietly got on with it", which is what a year in a valley actually looks like.
    ws.arcContests = arcOutcomes;
    // Recorded so a narrator can say who paid for the line holding, and so the endgame sims can measure
    // whether the valley is bleeding at a rate anyone wants.
    ws.arcCasualties = casualties;
    // Strikes are the world's QUEST SEED: a single named target, a sender, and a deadline. Aevi is right that
    // nothing new is needed to carry it — a generated quest def is as valid as an authored one.
    ws.arcStrikes = strikes;

    // Reported, not just computed: a seat left empty is a fact about the world this pass, and the GM block
    // (and any future readout) should be able to say WHY an arc moved when nobody won anything.
    ws.arcVacancies = vacated;

    // SNG-279 — THE ARC ITSELF TURNED WHILE THEY WERE HOLDING IT. The rarest and largest of the six sources:
    // it takes the whole valley leaning one way for a season. Credited to everyone who leaned on it, not to a
    // leader — a stage does not move because one person pushed.
    ws.arcStageSeen = ws.arcStageSeen || {};
    for (const arcId of Object.keys(leaning)) {
      let now = null;
      try { now = arcStageNow(content, character, arcId); } catch { now = null; }
      if (now == null) continue;
      const before = ws.arcStageSeen[arcId];
      ws.arcStageSeen[arcId] = now;
      if (before == null || now === before) continue;
      const held = [...(leaning[arcId]?.pro || []), ...(leaning[arcId]?.con || [])];
      for (const e of held) creditDeed(ws, e.f.id, "stageMoved", { worldDay: currentWorldDay, playerInvolved: playerOnArc(arcId) });
    }
    // SNG-275 — THE COVERAGE IS THE ASK. `lived` is how many figures kept their own time this pass;
    // `onThePage` is how many of those had anything AUTHORED to spend it on. The gap between the two is
    // exactly the content Aevi has yet to write, stated as a number rather than left as a silence.
    ws.personalCoverage = { lived: livesLived, onThePage: livesOnThePage, neglected: neglectedLives.length };
    ws.personalBeats = personalBeats;
    ws.neglectedLives = neglectedLives;
    for (const b of personalBeats.slice(0, 3)) {
      news.push({ text: `${b.name} ${b.pursuit}`, worldDay: currentWorldDay, tier: "murmur" });
    }
    for (const n of neglectedLives.slice(0, 2)) {
      news.push({ text: `${n.name} has not been seen at home in a long while — whatever is happening has all of them.`, worldDay: currentWorldDay, tier: "murmur" });
    }

    // SNG-269/2c — WHO ROSE. Erik: "the ones that stay the longest are the true legends." Run after the
    // pass's contests so this year's wins count toward this year's standing.
    const risen = advanceStandings(ws, living, currentWorldDay, content.rules?.tierLadder || {});
    // A wounded figure holding NOTHING has stopped being what their title says. Aevi: failing to last
    // should cost the title — and without a way DOWN, promotion alone eventually makes everyone mythic.
    const fallen = [];
    for (const f of living) {

      // ⚠️ WHAT "ABANDONS EVERY FRONT" HAS TO MEAN MECHANICALLY. Two readings failed: "cares about
      // nothing" can never be true of an authored figure, and "spent nothing this pass" can never be true
      // either, because a fractional budget always buys a share of something. Both produced 0.0 falls
      // across every ladder in the sweep, which reads exactly like a tuning result and is not one.
      //
      // Aevi's framing is "failing to last should cost the title". The measurable version of not lasting is
      // being OUT OF ACTION — wounded or stopped, pass after pass, while the front they hold goes on without
      // them. That is a figure the world stops calling what it used to call them.
      ws.outOfAction = ws.outOfAction || {};
      const st = effectiveEpicStatus(ws, f.id, currentWorldDay);
      ws.outOfAction[f.id] = (st === "wounded" || st === "stopped") ? (ws.outOfAction[f.id] || 0) + 1 : 0;
      if (ws.outOfAction[f.id] < (Number.isFinite(cfg.fallAfterPasses) ? cfg.fallAfterPasses : 2)) continue;
      ws.outOfAction[f.id] = 0;       // they still put themselves somewhere → still holding on
      const d = demoteFigure(ws, f, currentWorldDay);
      if (d) fallen.push(d);
    }
    // ⚠️ WHICH SOURCES ACTUALLY FIRE. A weight in the table with nothing writing it is the bug family this
    // repo keeps finding, so the engine COUNTS its own sources rather than trusting the table.
    // KNOWN GAP: `spreadPerHop` cannot fire — `reputation.js` carries a `spread` field and its own header says
    // nothing populates it yet ("carries `spread` so nothing here changes when that lands"). Aevi's spec lists
    // that source as "already exists"; it does not. Recorded here rather than left to look like a tuning
    // problem the first time somebody wonders why nobody scores for a name that travelled.
    ws.deedSourcesSeen = ws.deedSourcesSeen || {};
    for (const t of Object.values(ws.figureTenure || {})) {
      for (const d of (t.deedLog || [])) ws.deedSourcesSeen[d.by] = (ws.deedSourcesSeen[d.by] || 0) + 0;
    }
    // SNG-281 — NEWS TRAVELS. Aevi's deed table lists "a deed that SPREAD" as a promotion source marked
    // "already exists"; it did not, because `recordDeed` initialised `spread: []` and nothing ever appended
    // to it. Every reputation query in the game answered from the one community where a deed happened.
    //
    // Built once per pass and reused: the community graph is content, not state.
    const commsByRegion = {}, regionOfComm = {};
    for (const loc of Object.values(content.locations || {})) {
      const c = loc?.communityId, r = loc?.regionId || loc?.region || null;
      if (!c || !r) continue;
      (commsByRegion[r] ||= []).includes(c) || commsByRegion[r].push(c);
      regionOfComm[c] = r;
    }
    const spreadRate = Number.isFinite(cfg.deedSpreadRate) ? cfg.deedSpreadRate : 0.35;
    // SNG-282 (Erik): "the player's deeds and quest resolutions spread just like NPCs." The player is a
    // bearer like any other — `spreadDeeds` never cared what kind of thing it was handed, and reading the
    // roster only was the reason a player could be famous in one valley town and unheard of in the next.
    if (character?.deeds?.length) {
      spreadDeeds(character, { communitiesByRegion: commsByRegion, regionOfCommunity: regionOfComm, rng, rate: spreadRate });
    }
    for (const f of living) {
      const bearer = character?.npcRegistry?.[f.id];
      if (!bearer?.deeds?.length) continue;
      const hops = spreadDeeds(bearer, { communitiesByRegion: commsByRegion, regionOfCommunity: regionOfComm, rng, rate: spreadRate });
      // SNG-279: 2 per hop — SCALE, not merit. A name that reached four settlements counts twice a name that
      // reached two, whatever the name is known for.
      if (hops.length) creditDeed(ws, f.id, "spreadPerHop", { worldDay: currentWorldDay, times: hops.length });
    }
    ws.arcStandings = { risen, fallen };
    // SNG-279 PART 3 — SEE AND FEEL IT, the requirement rather than the garnish. Aevi: "a promotion the
    // player does not witness is a database write", and "a rank that arrives without a reason is a number."
    // So every rise says WHAT they did — and when the player had a hand in it, it says so BY NAME, which is
    // the moment the simulation stops being weather and becomes consequence.
    for (const r of risen) {
      const line = `${r.name || "Someone"} is called ${r.to} this season — ${r.why}.`;
      news.push({ text: r.causedByPlayer ? `${line} You are why.` : line,
        worldDay: currentWorldDay, tier: "event", causedByPlayer: !!r.causedByPlayer });
    }
    // And the inverse is the sharper one. Aevi: "Nobody stood over him."
    for (const f of fallen) {
      news.push({ text: `${f.name || "Someone"} is not spoken of as ${f.from} any more. They stopped holding anything.`,
        worldDay: currentWorldDay, tier: "event" });
    }

    // SNG-269/2b — THE WORLD REFILLS ITSELF. Aevi (Gap 2): "the roster never grows — a world simulated
    // long enough empties out, and the tier pyramid decays in exactly the way the re-tier was meant to fix."
    //
    // The birth events are ones the world ALREADY PRODUCES; nothing new has to be invented to carry them:
    //   · A VACANCY — an arc NOBODY was minding this pass, because everyone who cares about it was spending
    //     their attention somewhere they cared about more. An unheld front is an opening: somebody local
    //     steps into it. They enter at `notable` — stepping into an empty room is not the same as winning it.
    //   · A CASUALTY — someone was standing next to the person who fell. Surviving a thing that killed a
    //     greater figure is exactly how an unknown becomes known; they enter at `riffraff`.
    // Entry is at the BOTTOM on purpose. `notable` and `riffraff` were empty by design — not an oversight,
    // but the inflow, waiting for something to flow into them. Promotion (2c) carries them up from here;
    // this only opens the door.
    //
    // ⚠️ THE ENGINE MINTS THE SLOT, NOT THE PERSON. A minted figure gets an id, a rung, a weight, an arc
    // they care about, and the reason they exist — everything the tick needs to let them push, fight, be
    // struck at, and die. It does NOT get a name, because naming is authorship and the engine has no
    // business doing it: they are flagged `provisional` until content names them.
    const mintRate = Number.isFinite(cfg.mintRate) ? cfg.mintRate : 0.5;
    const mintCap = Number.isFinite(cfg.mintCap) ? cfg.mintCap : 140;
    const born = [];
    // ⚠️ A SINGLE-PASS VACANCY IS NOT RARE — it fires for most arcs most passes, because attention is
    // scarce by design. Minting on it produced 140 new figures against 6 deaths per world: the cap, every
    // run. What is actually rare, and actually means something, is a SUSTAINED vacancy — an arc nobody has
    // held for weeks running. That is when a local steps in, and the fiction is truer for it.
    const streakForMint = Number.isFinite(cfg.vacancyStreakForMint) ? cfg.vacancyStreakForMint : 8;
    ws.arcUnheldStreak = ws.arcUnheldStreak || {};
    // ⛔ NOT `vacated` — that counts ABANDONMENTS ("somebody who cares about this walked away from it"),
    // which gets MORE common as the roster grows. Minting on it is a positive feedback loop: mint → more
    // carers → more abandonments → more mints. It produced 55 figures against 8 deaths.
    // The real signal is an arc NOBODY leaned on at all this pass. That is rare, and it is self-correcting:
    // the figure minted into it is then holding it, so the seat is no longer empty and the clock stops.
    for (const arcId of Object.keys(leaning)) {
      const held = (leaning[arcId]?.pro?.length || 0) + (leaning[arcId]?.con?.length || 0);
      if (!held) ws.arcUnheldStreak[arcId] = (ws.arcUnheldStreak[arcId] || 0) + 1;
      else { ws.arcUnheldStreak[arcId] = 0; continue; }
      if (ws.arcUnheldStreak[arcId] < streakForMint || rng() >= mintRate) continue;
      ws.arcUnheldStreak[arcId] = 0;   // the seat is taken; the clock restarts
      const f = mintFigure(ws, { tier: "notable", worldDay: currentWorldDay, arcAffinity: arcId,
        epithet: `the one who took up ${arcId}`,
        origin: `stepped into ${arcId} after a long season when nobody was holding it`, cap: mintCap });
      if (f) born.push(f);
    }
    // A DEATH OPENS A SEAT — Aevi's second birth event, read correctly this time. "A faction that just lost
    // its leader" is a DEATH, not an unheld arc; the arc-vacancy door above turns out to fire almost never
    // (with 66 figures over 5 arcs, somebody is always leaning on something), so deaths carry the inflow.
    //
    // And that is the right shape: the world refills in proportion to what it LOSES, without a rate anyone
    // has to tune to keep the pyramid standing. One death can produce two kinds of person — the one who
    // was standing next to it (`riffraff`, they merely survived) and the one who takes the empty chair
    // (`notable`, they inherited something). Neither has earned the name yet. That is what 2c is for.
    const deaths = [...casualties.filter(c => c.kind === "killed").map(c => ({ who: c.loser, arcId: c.arcId })),
                    ...strikes.filter(s => s.outcome === "killed").map(s => ({ who: s.target, arcId: s.arcId }))];
    for (const d of deaths) {
      if (rng() < mintRate) {
        const f = mintFigure(ws, { tier: "riffraff", worldDay: currentWorldDay, arcAffinity: d.arcId ?? null,
          epithet: `the one who outlived ${d.who}`,
          origin: `stood beside ${d.who} and walked away from it`, cap: mintCap });
        if (f) born.push(f);
      }
      if (rng() < mintRate) {
        const f = mintFigure(ws, { tier: "notable", worldDay: currentWorldDay, arcAffinity: d.arcId ?? null,
          epithet: `the one who took ${d.who}'s place`,
          origin: `took up what ${d.who} left unfinished`, cap: mintCap });
        if (f) born.push(f);
      }
    }
    if (born.length) {
      ws.arcBirths = born.map(f => ({ id: f.id, tier: f.tier, origin: f.origin, arcId: f.arcAffinity }));
      for (const f of born) news.push({ text: `Someone new is being spoken of — they ${f.origin}.`, worldDay: currentWorldDay, tier: "murmur" });
    } else ws.arcBirths = [];
    // The NET position per arc, so a reader (and the GM block) sees the settled truth rather than one side.
    const net = {};
    for (const rec of Object.values(ws.epicArcPushes || {})) {
      if (!rec?.arcId) continue;
      net[rec.arcId] = (net[rec.arcId] || 0) + (Number(rec.push) || 0);
    }
    ws.arcNetPush = net;
  }

  ws.offscreenBacklog = ws.offscreenBacklog || {};
  const inWindow = new Set(batch.map(e => e.id));
  for (const e of population) {
    if (inWindow.has(e.id)) continue;
    const b = ws.offscreenBacklog[e.id] || { days: 0, since: currentWorldDay, want: e.want || null };
    b.days += elapsedWorldDays;
    b.want = e.want || b.want;
    ws.offscreenBacklog[e.id] = b;
  }
  // What each entity in THIS window has been waiting through — handed to the evolver so one development can
  // honestly cover a season rather than pretending only three days passed.
  const backlogOf = (id) => {
    const b = ws.offscreenBacklog?.[id];
    return b && b.days > 0 ? { waitedDays: b.days, since: b.since, want: b.want } : null;
  };

  try {
    // CCODE-103: `backlogOf` lets a development cover the whole span this entity waited. `elapsedWorldDays`
    // stays the TICK's elapsed time — the two are different questions and collapsing them would make a
    // long-waiting entity look like a fast-moving world.
    const result = await evolveFn({ character, entities: batch, elapsedWorldDays, currentWorldDay,
      progressOf: (id) => wantProgressLine(ws, id), backlogOf, model });
    for (const dev of (result?.developments || []).slice(0, 4)) {
      const fig = batch.find(e => e.id === dev.entityId);
      if (!fig || !dev.note) continue;
      // SNG-198 §2: the outcome MOVES state (or honestly does not); the note is the colour on top of it.
      const outcome = WANT_OUTCOMES.includes(dev.outcome) ? dev.outcome : "progress";
      // CCODE-103: their turn came and was spent — the wait is discharged whether or not the want moved,
      // because the development covered it either way. Leaving it would double-count the next time round.
      if (ws.offscreenBacklog) delete ws.offscreenBacklog[fig.id];
      const { moved, resolved } = applyWantOutcome(ws, fig.id, outcome, currentWorldDay);
      if (fig.source === "legend" && moved) {
        ws.lastEpicOffscreenDay = currentWorldDay; // stamp the epic cooldown
        const def = worldRoster(ws, content).find(f => f.id === fig.id);
        if (def) {
          // SNG-208 §3a: this epic leans on its arc from offstage — ALREADY APPLIED by the mechanical pass
          // above (CCODE-105), for every living legend, on time. Pushing again here would double-count
          // exactly the figures that happened to get narrated, which is the old sampling bug wearing the
          // costume of a fix.
          // SNG-208 §3b: sometimes the stir IS a clash with a living rival — resolved into a durable outcome.
          const liveRivals = (def.rivals || []).filter(rid => effectiveEpicStatus(ws, rid, currentWorldDay) !== "dead");
          if (liveRivals.length && rng() < 0.4) {
            const rid = liveRivals[Math.floor(rng() * liveRivals.length)];
            const rivalDef = worldRoster(ws, content).find(f => f.id === rid);
            if (rivalDef) {
              const clash = resolveEpicClash(def, rivalDef, rng);
              const winner = clash.winnerId === def.id ? def : rivalDef, loser = clash.loserId === def.id ? def : rivalDef;
              const res = applyEpicClashOutcome(ws, winner, loser, clash.kind, currentWorldDay);
              for (const line of res.news) news.push({ text: line, worldDay: currentWorldDay, tier: "event" }); // SNG-211: an epic clash/death is a real event
              if (res.event) { character.worldEvents = character.worldEvents || []; character.worldEvents.push(res.event); }
              if (res.codex) { try { applyCodexUpdates(character, [res.codex], { day: ws.lastTickDay ?? null }); } catch { /* graveyard record is a convenience */ } }
            }
          }
        }
      }
      const note = smartClamp(dev.note, 600);
      // keep the per-record offscreen log for generated figures (their existing surface); the codex node
      // carries the "moved on" fact for EVERYONE — generated, met, or legendary — all resolvable by id.
      const genRec = character.generated?.npc?.[fig.id] || character.generated?.arc?.[fig.id];
      if (genRec?._gen && typeof genRec._gen === "object") genRec._gen.offscreen = [...(genRec._gen.offscreen || []), { worldDay: currentWorldDay, note, outcome }].slice(-8); // SNG-216: never write onto a malformed (boolean) _gen
      try { applyCodexUpdates(character, [{ entityId: fig.id, label: fig.name, kind: fig.kind === "arc" ? "lore" : "person", fact: `[while away] ${note}` }], { day: ws.lastTickDay ?? null }); } catch { /* codex mirror is a convenience */ }
      // News is DERIVED from what MOVED / a real problem / a resolution — not from every sentence (§2, §4b).
      const headline = resolved ? `${fig.name}: ${note} — and that thread has run its course.`
        : outcome === "problem" ? `${fig.name} has hit trouble — ${note}`
        : `${fig.name}: ${note}`;
      // SNG-211: a legend acting, a thread RESOLVING, or a real setback is an EVENT; an ordinary want-move
      // ("Vash re-grinds a lens") is AMBIENT texture — it fills the remainder of the surface, never crowds
      // the real event out of it (§2, GUARD: rank ambient, don't kill it).
      const tier = (fig.source === "legend" || resolved || outcome === "problem") ? "event" : "ambient";
      if (moved || outcome === "problem") news.push({ text: headline, worldDay: currentWorldDay, tier });
    }
  } catch (err) { console.warn("[offscreen-gen] skipped:", err.message); return []; }

  if (news.length) {
    const stamped = news.map(n => ({ day: ws.lastTickDay ?? null, worldDay: n.worldDay, text: smartClamp(n.text, 600), tier: n.tier || "event" }));
    ws.news = [...ws.news, ...stamped].slice(-NEWS_CAP);
    ws.unseenNews = [...(ws.unseenNews || []), ...stamped].slice(-NEWS_CAP);
  }
  return news;
}

/** The AI pass: what an established generated figure/thread did offscreen, in-grain. SNG-198 §2: it is shown
 *  HOW FAR each want has already travelled (progressOf) and must return a countable OUTCOME, not just prose. */
async function aiGeneratedEvolution({ entities, elapsedWorldDays, currentWorldDay, progressOf = () => "just beginning", model = null }) {
  const who = (e) => e.source === "legend" ? ", a GREAT FIGURE of the world — a rare, weighty stirring, not a small errand"
    : e.source === "met" ? ", someone the player has met"
    : e.source === "heardof" ? ", someone the player has only HEARD OF — a distant name; a small shift in it is how the world reads as alive when he finds it changed" : "";
  const list = entities.map(e =>
    `- ${e.id}: ${e.name} (${e.kind}${who(e)}) — ${e.kind === "arc" ? "tension" : "wants"}: ${e.descriptor || "?"}; progress so far: ${progressOf(e.id)}`
  ).join("\n");
  const sys = `You advance the OFFSCREEN lives of established figures and threads in an RPG while the player was away. ${elapsedWorldDays} world-days passed. Each figure has a want/tension and HOW FAR it has already travelled toward it. For AT MOST 4 of them, decide ONE small, grounded, IN-GRAIN development that follows from their want/tension + how far along they already are — no drastic turns, nothing that contradicts what's known, NOTHING set in the future. Choose an OUTCOME per figure: "progress" (moved closer), "stall" (no real movement this time), "problem" (a genuine setback — do not soften it), or "done" (the want is reached/resolved). Most figures move rarely — a "stall" is a fine, honest answer. Reply ONLY JSON: {"developments":[{"entityId":"exact-id","outcome":"progress|stall|problem|done","note":"one sentence: what moved (or didn't) for them while away"}]}`;
  const content = `World-days passed: ${elapsedWorldDays} (now world-day ${currentWorldDay}).\n\nESTABLISHED FIGURES & THREADS:\n${list}`;
  return callClaudeJSON([{ role: "user", content }], { task: "world-tick", system: sys, maxTokens: 1024, model }); // SNG-242: model override (A/B + in-play switch)
}

/** SNG-242: A/B the world-tick across models on the SAME input (dev tool). Builds the current offscreen batch
 *  exactly as advanceGeneratedOffscreen does, then runs the evolve ONCE PER MODEL on that IDENTICAL batch — the
 *  only variable is the model, so the comparison is honest. READ-ONLY: never applies wantOutcomes or mutates
 *  worldState (it's a comparison, not a real tick). Returns { batch, runs:[{model, developments, ms, error}] }.
 *  Per-call token/latency also land in See-the-Machine (each is a real world-tick capture). */
export async function worldTickABCompare({ character, content = {}, models = [], now = Date.now(), rng = Math.random } = {}) {
  const ws = character?.worldState || {};
  const currentWorldDay = absoluteWorldDay(now);
  const batch = offscreenPopulation(character, content, { worldDay: currentWorldDay, rng, lastEpicDay: ws.lastEpicOffscreenDay })
    .filter(e => ws.wantProgress?.[e.id]?.status !== "resolved")
    .slice(0, 4);
  const runs = [];
  for (const model of models) {
    const t0 = now; let developments = [], error = null, ms = 0;
    try {
      const started = Date.now();
      const result = await aiGeneratedEvolution({ entities: batch, elapsedWorldDays: 3, currentWorldDay, progressOf: (id) => wantProgressLine(ws, id), model });
      ms = Date.now() - started;
      developments = (result?.developments || []).slice(0, 4);
    } catch (e) { error = e?.message || "call failed"; }
    runs.push({ model, developments, ms, error });
  }
  return { batch: batch.map(e => ({ id: e.id, name: e.name, kind: e.kind, source: e.source, descriptor: e.descriptor })), runs };
}

/** SNG-211: rank the "while you were away" surface by STAKES so a real world event (an arc move, a crisis
 *  escalation, an epic's deed or death, a resolution) always outranks ambient offscreen texture ("Vash
 *  re-grinds a lens") for the scarce slots. Events first, in the order they happened; ambient fills only the
 *  REMAINDER, capped — the lived-in feel stays a touch, never a feed (GUARD: rank ambient, don't kill it).
 *  Items with no tier are treated as events (never capped) — conservative: nothing meaningful is dropped.
 *  Does not mutate the persistent `ws.news` log; only shapes what surfaces on return. */
function rankNews(items = [], { maxAmbient = 2, maxTotal = 8 } = {}) {
  const list = Array.isArray(items) ? items : [];
  const isAmbient = n => n?.tier === "ambient";
  const events = list.filter(n => !isAmbient(n));   // real events keep their order, and their slots first
  const ambient = list.filter(isAmbient).slice(0, maxAmbient);
  return [...events, ...ambient].slice(0, maxTotal); // events fill first; ambient is dropped before any event is
}

/** Pull (and clear) news the player hasn't seen — shown once on return to play, ranked by stakes (SNG-211). */
export function takeUnseenNews(character, opts = {}) {
  const items = character.worldState?.unseenNews || [];
  if (character.worldState) character.worldState.unseenNews = [];
  return rankNews(items, opts);
}

/** Recent news block for the GM prompt — rumors NPCs might repeat. */
export function newsForGM(character) {
  const news = character.worldState?.news || [];
  if (!news.length) return null;
  // SNG-041: date on the SHARED absolute world-day when known (so cross-character news lines up);
  // fall back to the local journey-day for pre-SNG-041 items (derives-never-fabricates).
  return news.slice(-8).map(n => `- [${Number.isFinite(n.worldDay) ? `world-day ${n.worldDay}` : `day ${n.day}`}] ${n.text}`).join("\n");
}

/** SNG-191 §4 — the AI pass, inverted. NOT "what happened to a person" (which writes colour) but "what
 *  PROGRESSED on the work they were delegated." Each assignment gets an OUTCOME (state) plus one line of
 *  what moved on the WORK — which becomes the person's status, never a news slot spent on a small day.
 *  Work set against a crisis should visibly bear on it. UNGUARDRAILED — no softening to keep things tidy. */
async function aiAssignmentAdvancement({ character, content, assignments, elapsed, currentDay }) {
  const list = assignments.map(a =>
    `- ${a.id}: ${a.npcName} holds "${a.charge}"${a.targetEventId ? ` (against ${a.targetEventId})` : ""} — currently ${a.status}, ${a.progress} step(s) in`
  ).join("\n");
  const crises = (content.region.activeEvents || []).map(({ eventId }) => {
    const ev = content.events[eventId];
    const st = character.worldState.eventStages[eventId];
    const def = ev?.stages.find(s => s.stage === (st?.stage ?? 1));
    return ev ? `- ${eventId}: ${ev.name} — ${def?.name}: ${def?.summary}` : null;
  }).filter(Boolean).join("\n");
  const sys = `You advance DELEGATED WORK in an RPG while the player was away — the WORK, not the workers' moods. ${elapsed} in-game days passed. For each assignment, decide what PROGRESSED: an OUTCOME (progress | stall | problem | done) and ONE grounded sentence of what actually MOVED on the work. Work against a crisis must visibly bear on that crisis. The world is UNGUARDRAILED — a problem may be serious, a success real; never soften an outcome to keep things tidy, and never invent work that was not delegated. Reply ONLY JSON: {"advancements":[{"assignmentId":"exact-id-from-the-list","outcome":"progress|stall|problem|done","note":"one sentence: what moved on the WORK (this becomes the person's current status)"}]}`;
  const content2 = `Days passed: ${elapsed} (now day ${currentDay}).\n\nDELEGATED WORK (advance these):\n${list}\n\nCRISES IN THE REGION (work may bear on these):\n${crises || "none active"}`;
  return callClaudeJSON([{ role: "user", content: content2 }], { task: "world-tick", system: sys, maxTokens: 1024 });
}
