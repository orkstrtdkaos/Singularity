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
import { spreadDeeds } from "./reputation.js";
import { titleFor } from "./titles.js";   // SNG-287: a name from the material, not from a menu   // SNG-281: news travels, and that is a promotion source
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
export async function runWorldTick({ character, content, currentDay, advanceAssignments = aiAssignmentAdvancement, rng = Math.random }) {
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

  // 2. NEWS SPREAD — ONE MODEL, GRADED BY WEIGHT (Erik, SNG-289: "i like grading deeds by weight,
  //    reconcile the two that way").
  //
  //    This block used to send every weight-≥2 deed to EVERY community in the world at once. That is why
  //    Silas Weir's real save shows deeds known in 91 communities out of 90 — everywhere — and why `spread`
  //    could not carry information: if every recorded deed reaches all of them, the field distinguishes
  //    nothing. `spreadDeeds` now owns it for the player exactly as it does for figures: ONE HOP PER PASS,
  //    reach capped by the deed's weight, so a small deed stays in the settlement that saw it and a large
  //    one crosses regions once it has been heard everywhere near.
  //
  //    ⛔ Magnitude, never merit (DIRECTIVE SNG-280): an atrocity travels exactly as far as a rescue of the
  //    same size. ⚠️ Existing saves keep their over-spread deeds — rewriting a player's history to match a
  //    new model is a retcon, not a migration.
  {
    const commsByRegion = {}, regionOfComm = {};
    for (const loc of Object.values(content.locations || {})) {
      const c = loc?.communityId, r = loc?.regionId || loc?.region || (loc?.communityId ? String(loc.communityId).split(".")[0] : null);
      if (!c || !r) continue;
      (commsByRegion[r] ||= []).includes(c) || commsByRegion[r].push(c);
      regionOfComm[c] = r;
    }
    const ready = (character.deeds || []).filter(d => (currentDay - (d.day ?? 0)) >= NEWS_TRAVEL_DAYS);
    const hops = spreadDeeds({ deeds: ready }, {
      communitiesByRegion: commsByRegion, regionOfCommunity: regionOfComm, rng, rate: 1,
    });
    for (const h of hops) {
      news.push(`Word has spread beyond its own valley, as far as ${String(h.to).split(".").pop()}: ${h.description}`);
    }
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

/** SNG-298: a figure's cares as they are NOW — the evolved list if the world has moved them, else what was
 *  authored. ⚠️ Every reader must come through here or an evolved care is a record nothing acts on: the
 *  shift would be written, reported in the news, and then ignored by the next pass. */
export function currentCares(ws, figure) {
  // SNG-303b — A CRUSADE IS PAID IN COMMITMENT, AND THIS IS WHERE THE BILL LANDS. Aevi's spec: "a crusader
  // abandons their other arcs entirely for the duration — the attention budget goes to ZERO on everything
  // else. So a crusade CREATES VACANCIES on the crusader's own side."
  //
  // ⚠️ The price is not a penalty bolted on beside the mechanic — it is the ORDINARY cost of attention,
  // charged in full, through machinery that already existed. A figure on crusade cares about exactly one
  // thing; every other front they held falls out as `unattended`, which the attention pass already counts as
  // a vacated seat. Nothing new had to learn what a crusade is.
  //
  // ⚠️ BOTH `arcId` AND `dir`, or `affinitiesOf` filters it straight back out and the crusade is a record
  // nothing acts on. That exact shape has been got wrong three times in this file.
  const crusade = ws?.crusades?.[figure?.id];
  if (crusade?.arcId && crusade?.dir) return [{ arcId: crusade.arcId, dir: crusade.dir }];
  const evolved = ws?.figureCares?.[figure?.id];
  return Array.isArray(evolved) && evolved.length ? evolved : affinitiesOf(figure);
}

export function affinitiesOf(figure) {
  const many = Array.isArray(figure?.arcAffinities) ? figure.arcAffinities : null;
  const list = (many && many.length ? many : [figure?.arcAffinity]).filter(a => a?.arcId && a?.dir);
  return list;
}

/** SNG-306 — THE PRICE OF STANDING HIGH. Erik: *"striking isn't just about the back line… between arc pushes
 *  there are ever present assassination risks — duel to the death challenges etc. we can use these to keep
 *  the Mythicals under control."*
 *
 *  THE MEASURED PROBLEM (BRIEF_world_presets, 2026-08-05): mythics go 1.0 → 1.8 → 13.5 → 20.3 across 1/2/4/8
 *  world-years. Nothing applied pressure at the top — deeds only accumulate, and the only way down was to
 *  stop caring entirely. The ladder had a floor and no ceiling.
 *
 *  This is the ceiling, and it is not a decay term. Erik's shape is better than a decay because it is a
 *  STORY: standing high is what draws people who want what you have. A challenge is a duel with a name on
 *  each side, it resolves through the same injury model as everything else, and losing it can kill you.
 *
 *  ⛔ DIRECTIVE SNG-280 — PROMINENCE, NOT MERIT. The rate is keyed to the RUNG and nothing else. A mythic of
 *  the Maw and a mythic who has spent forty years mending the same wall are challenged at exactly the same
 *  rate, because what draws a challenger is that you are worth beating. Nothing here reads alignment,
 *  tradition, or what the standing was earned doing.
 *
 *  Pure: reads the field and the dials, returns the pairing. Every mutation stays with the caller. */
export function planChallenge({ figure, pool = [], tierOf: tierFn = (f) => f?.tier, cfg = {}, rng = Math.random } = {}) {
  const rung = tierRank(tierFn(figure));
  const byTier = cfg.challengeByTier || {};
  const t = tierFn(figure);
  const chance = Number(byTier[t === "regional" ? "heroic" : t]);
  if (!Number.isFinite(chance) || chance <= 0) return null;
  if (rng() >= chance) return null;

  // ⚠️ THE CHALLENGER COMES FROM BELOW, AND NOT FROM FAR BELOW. Someone must have something to gain (so not a
  // peer or better) and a reason to think they can (so not four rungs down). `reach` is the window.
  const reach = Number.isFinite(cfg.challengerReach) ? cfg.challengerReach : 2;
  const candidates = pool.filter(c => {
    if (!c || c.id === figure?.id) return false;
    const r = tierRank(tierFn(c));
    return r < rung && r >= rung - reach;
  });
  if (!candidates.length) return null;
  // The hungriest of those who could: the closest below, since they have the least distance to make up.
  const best = candidates.sort((a, b) => tierRank(tierFn(b)) - tierRank(tierFn(a)));
  const band = best.filter(c => tierRank(tierFn(c)) === tierRank(tierFn(best[0])));
  return { defender: figure, challenger: band[Math.floor(rng() * band.length)] || band[0], rung };
}

/** SNG-310 — SOMEBODY IS OUT TO GET YOU. Erik: *"yes the player can be struck, but that event is a GM
 *  narrated encounter. The fact that someone is out to get you triggers it though."*
 *
 *  ⛔ SO THE WORLD ENGINE MARKS, AND NEVER RESOLVES. That is Design Law 1 exactly — the GM narrates and
 *  proposes; the engine never advances a scene on the player's behalf. Every other strike in the valley
 *  settles offscreen through `resolveEpicClash` because both parties are offscreen. One aimed at the PLAYER
 *  cannot: resolving it would decide a fight the player never got to be in, which is the one thing this
 *  codebase does not do.
 *
 *  What the engine produces instead is a THREAT — a named sender, an arc, a kind, a day. That is the trigger.
 *  The encounter is the GM's to narrate, and everything needed to make it COST something already exists:
 *  `aggressorKind: assassin` decides what happens if the player goes down (finishing them was the errand, at
 *  8× a duelist's rate), the threat band puts a warning and a forced Decline in front of it, and the
 *  incapacitation ladder catches them if it goes badly.
 *
 *  ⚠️ THE TWO KINDS DIVERGE HERE, AND IT FALLS OUT OF THE MODEL RATHER THAN BEING INVENTED FOR THE PLAYER.
 *  A CRUSADE IS DECLARED — the player is told, because being told is what a crusade IS. A QUIET strike is
 *  not: they learn it when it arrives. `announced` carries exactly that difference. */
/** The id the player wears when they stand in a strike pool. Never a real figure id, and never added to
 *  `living` — the player must be REACHABLE by a strike without being dragged into melee, casualties or
 *  promotion, none of which the offscreen world may decide for them. */
export const PLAYER_MARK_ID = "__player__";

export function threatToPlayer(ws) {
  const pending = (ws?.pendingStrikes || []).filter(t => t && !t.resolved);
  if (!pending.length) return null;
  const declared = pending.filter(t => t.announced);
  return {
    marked: true,
    count: pending.length,
    // What the player may be TOLD. A quiet strike counts toward `unseen` and names nobody.
    known: declared.map(t => ({ sender: t.senderName || t.sender, arcId: t.arcId, since: t.worldDay })),
    unseen: pending.length - declared.length,
    // ⛔ AN ENCOUNTER SEED, NOT AN ENCOUNTER. The GM decides when and how this comes to a head.
    seed: {
      aggressorKind: "assassin",
      threat: "grave",
      why: declared.length
        ? `${declared[0].senderName || "someone"} has declared against you over ${declared[0].arcId}`
        : "someone has been sent, and they did not announce it",
    },
  };
}

/** SNG-311 — AND SOMEONE MAY STAND OVER YOU. Erik: *"if you get marked for a strike, you can also be chosen
 *  as warranting a guardian, or several… plus it gives a lot of use of the various hiding and warding
 *  skills. Feels very VIP and end game, but could be mid game too."*
 *
 *  ⛔ THE SYMMETRY WAS ALREADY IN THE MODEL AND THE PLAYER WAS THE ONE EXCEPTION. A marked FIGURE gets a
 *  guard — `guardIntercept`, weight 3, and "standing still is its own cost: they are not pushing while they
 *  watch." The player was the only marked party nobody could stand over. This closes that with the rule the
 *  rest of the valley already runs on: somebody who shares your care comes, and they pay a front to do it.
 *
 *  ⚠️ IT IS THE RETRIEVAL RULE, NOT A NEW ONE. `attemptRetrievals` picks who goes into the dark for you by
 *  "someone who stood on the same side of something", highest rung first. A guardian is that same sentence
 *  pointed at the living — which means a guardian is never a stranger the engine invented, but someone whose
 *  stake the world can already name.
 *
 *  ⛔ AND IT RESOLVES NOTHING. Like the threat itself (SNG-310) this MARKS: it says who has put themselves
 *  between the player and what is coming. Whether they arrive in time, whether the player hid well enough,
 *  whether a ward held — that is the encounter, and the encounter is the GM's. Erik's "use of the hiding and
 *  warding skills" lives exactly there, in a scene the player plays rather than a roll the world makes. */
export function guardiansFor(ws, roster = [], worldDay = 0, cfg = {}) {
  if (!threatToPlayer(ws)) return null;                    // nobody stands over an unmarked person
  const arcs = new Set((ws.pendingStrikes || []).filter(t => t && !t.resolved).map(t => t.arcId).filter(Boolean));
  if (!arcs.size) return null;

  // Someone who stood on the same side of something — the retrieval rule, pointed at the living.
  const able = (roster || []).filter(f => f?.id && f.id !== PLAYER_MARK_ID
    && effectiveEpicStatus(ws, f.id, worldDay) === "active"
    && currentCares(ws, f).some(c => arcs.has(c.arcId)));
  if (!able.length) return { marked: true, guardians: [], note: "nobody who shares this fight is free to stand over you" };

  // ⚠️ HIGHEST RUNG FIRST, AND THAT IS WHERE "VERY VIP" COMES FROM — it is arithmetic, not flavour. A legend
  // choosing to stand still for you costs exactly what a legend standing still ever costs: they hold two
  // fronts (`attentionByTier`), and one of them is now you.
  const ranked = able.slice().sort((a, b) => tierRank(tierOf(ws, b)) - tierRank(tierOf(ws, a)));
  const many = Math.max(1, Math.min(Number(cfg.guardiansMax) || 3, ranked.length));
  return {
    marked: true,
    guardians: ranked.slice(0, many).map(f => ({
      id: f.id, name: f.name || f.id, tier: tierOf(ws, f),
      // WHY THEM — so a narrator can say the reason rather than assert the fact.
      shares: currentCares(ws, f).map(c => c.arcId).find(a => arcs.has(a)) || null,
    })),
    // ⛔ THE COST, NAMED. A guardian is not free protection; it is a front they are not pushing, the same
    // price `guardIntercept` has always carried. A player who accepts one is spending someone.
    cost: "each of them is standing still to do it — a front they are not pushing while they watch",
  };
}

/** SNG-304 — THE HOLDING STREAK. Erik: "a streak of holding could give an edge… something that builds to a
 *  point. It would get dropped down if interrupted."
 *
 *  Holding the SAME care across consecutive passes builds a counter; the counter adds to the push that care
 *  gets. It BUILDS TO A POINT — capped — so a long hold is strong, never unbounded.
 *
 *  ⚠️ THE EDGE IS ON PUSH ONLY, not on urgency. Urgency also decides who steps into a fight and who a striker
 *  aims at; folding the streak into it would quietly make constant people more warlike and more targeted,
 *  which is not what Erik asked for and not what the mechanic is about. */
export function holdEdge(streak, holdCfg = {}) {
  const per = Number.isFinite(holdCfg.perPass) ? holdCfg.perPass : 0.10;
  const cap = Number.isFinite(holdCfg.cap) ? holdCfg.cap : 0.50;
  return 1 + Math.min(cap, Math.max(0, Number(streak) || 0) * per);
}

/** Is this pass the one that pays? ⚠️ EXTRACTED because the answer is a DESIGN CHOICE with a measured cost,
 *  and a choice buried inside a 400-line loop is one nobody can check or change. Aevi's spec is once per hold
 *  (`crossing 5 consecutive passes credits heldTheLine`); `deedRepeats` pays every 5 instead, which is far
 *  stronger than it sounds — see `node tests/holding_effect.mjs` for both numbers. */
export function holdDeedDue(streak, threshold = 5, repeats = false) {
  const n = Number(streak) || 0, t = Number(threshold) || 5;
  if (n <= 0 || t <= 0) return false;
  return repeats ? n % t === 0 : n === t;
}

/** How many consecutive passes this figure has held this care. */
export function holdStreak(ws, figureId, arcId) {
  return Number(ws?.careHeld?.[figureId]?.[arcId]) || 0;
}

/** ⚠️ TWO DIFFERENT LOSSES, TWO DIFFERENT PRICES. Aevi: "RESET TO ZERO on abandoning the care; HALVE on being
 *  driven off (wounded/struck). Losing a front you were forced off is not the same as leaving it."
 *
 *  This is the driven-off half, and it lives at the ONE place every wound in the world passes through
 *  (`applyEpicClashOutcome`) — melee casualties and strikes alike. Putting it at the call sites would mean
 *  every future way of hurting somebody has to remember to call it, which is how a rule quietly stops
 *  applying to the newest thing in the game. */
export function halveHold(ws, figureId) {
  const held = ws?.careHeld?.[figureId];
  if (!held) return;
  for (const k of Object.keys(held)) held[k] = Math.floor((Number(held[k]) || 0) / 2);
}

/** SNG-303b — HOW READILY THIS FIGURE REACHES PAST A FRONT LINE. Aevi's spec: "a figure with a `strikes`
 *  disposition > 0". A multiplier on `strikeRate`, exactly parallel to `engages`.
 *
 *  ⛔ DIRECTIVE SNG-280: this describes METHOD, not merit — the same rule that governs `engages`. A tradition
 *  at 2.0 is not worse than one at 0.2; it is one whose crafts are about reaching what is guarded. Aevi's own
 *  spec says it plainly: "a declared campaign to destroy someone who was tending a wood is not obviously
 *  better than a knife in the dark." Nothing here ranks the two. */
export function strikeDispositionOf(figure, strikeCfg = {}) {
  const t = figure?.tradition || figure?.legend?.tradition || null;
  const m = (t && strikeCfg?.byTradition?.[t] != null) ? Number(strikeCfg.byTradition[t]) : 1;
  return Number.isFinite(m) && m >= 0 ? m : 1;
}

/** SNG-303b — THE TWO KINDS. Same effect, opposite method, opposite price.
 *
 *  · `quiet`   — stealth. The target does not know. Pays in EXPOSURE: a failure identifies the striker.
 *  · `crusade` — declared. Everyone knows. Pays in COMMITMENT: every other front is abandoned outright.
 *
 *  ⚠️ WHICH TRADITION DOES WHICH IS CONTENT, NOT ENGINE. Deciding that umbral knifes and blazeborn declares
 *  is a characterisation judgement about a people — it is Aevi's to make, and an engine that hardcoded the
 *  lists would be encoding exactly the values SNG-280 forbids. Unauthored falls back to `quiet`, which is the
 *  behaviour that already shipped, so an empty table changes nothing rather than silently inventing crusades. */
/** ⚠️ THE READER MOVES, NOT THE CONTENT. Aevi authored the kinds as `{ quiet: [...], crusade: [...],
 *  either: [...] }` at `arcResponse.kindByTradition`, while this module read `{ tradition: "quiet" }` at
 *  `arcResponse.strikes.kindByTradition` — a miss on BOTH path and shape, so the crusade never fired despite
 *  being fully authored. Fifth time this week that a writer and a reader have failed to meet.
 *
 *  ⛔ AND HER SHAPE IS THE BETTER ONE, so this bends to it rather than asking her to re-key a file. A
 *  list-per-kind is how a person naturally writes this, and it can express `either` — a tradition that does
 *  BOTH — which a tradition→kind map cannot say at all. Accepts either shape, from either path. */
export function normalizeStrikeKinds(cfg = {}) {
  const raw = cfg?.strikes?.kindByTradition || cfg?.kindByTradition || {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith("_")) continue;                        // authoring notes, not data
    if (Array.isArray(v)) { for (const t of v) if (typeof t === "string") out[t] = k; }   // kind -> [traditions]
    else if (typeof v === "string") out[k] = v;                                           // tradition -> kind
  }
  return out;
}

/** Which kind THIS figure uses on THIS arc.
 *
 *  `either` is a real third value, resolved by circumstance rather than by a coin: a tradition that does both
 *  DECLARES over the thing they most want and goes quiet everywhere else. That reuses the crusade's own gate
 *  (`wantArcId`) instead of inventing a second rule, and it makes "either" a character — open about what they
 *  care most about, discreet about the rest — rather than a shrug. */
export function strikeKindFor(figure, kinds = {}, { arcId = null } = {}) {
  const t = figure?.tradition || figure?.legend?.tradition || null;
  // Tolerate a raw cfg block as well as a normalized map — not every call site is mine.
  const map = (kinds && (kinds.kindByTradition || kinds.strikes)) ? normalizeStrikeKinds(kinds) : kinds;
  const k = t ? map?.[t] : null;
  if (k === "crusade") return "crusade";
  if (k === "either") return (arcId != null && (figure?.wantArcId || null) === arcId) ? "crusade" : "quiet";
  return "quiet";
}

/** SNG-303b — WHO IS SENT AT WHOM, AND WHETHER ANYONE STANDS IN THE WAY.
 *
 *  ⚠️ EXTRACTED SO IT CAN BE EXECUTED. The two gates that covered this before were SOURCE-PATTERN checks —
 *  regexes matched against worldtick.js — and they passed happily while the sender was drawn from the wrong
 *  pool for the mechanic's whole life. That is the same failure as the ten whois/worldtab gates that went
 *  green over a template which crashed the moment it ran. A decision this branchy has to be CALLED.
 *
 *  Pure: reads the two sides and the dials, returns the plan. Every mutation stays with the caller. */
export function planStrike({ attackers, defenders, arcId, strikeCfg = {}, strikeKinds = null, strikeRate = 0.12,
                             guardInterceptChance = 0.45, exposure = {}, rng = Math.random,
                             weightOf = e => (Number(e?.f?.legend?.weight ?? e?.f?.weight) || 5) * (e?.share ?? 1) } = {}) {
  const aWorking = attackers?.working || [], dWorking = defenders?.working || [];
  // ⚠️ BOTH POOLS ARE `working`. The striker is NOT in the melee — that is the point of the third action, and
  // drawing them from `engaged` gave a figure a duel and a knife in the same pass.
  if (!aWorking.length || !dWorking.length) return null;

  const candidates = aWorking
    .map(e => ({ e, disp: strikeDispositionOf(e.f, strikeCfg) }))
    .filter(c => c.disp > 0)
    .sort((a, b) => (b.disp - a.disp) || ((b.e.urgency ?? 0) - (a.e.urgency ?? 0)));
  if (!candidates.length) return null;                       // a side of pure non-strikers sends nobody

  const sender = candidates[0].e, disp = candidates[0].disp;
  const kind = strikeKindFor(sender.f, strikeKinds || strikeCfg, { arcId });
  // ⛔ "THE MOST HATED WORKER" IS NOT A MORAL RANKING, and building it as one would be VALUE-AS-COEFFICIENT
  // wearing a different hat. Aevi's selection rule is POSITIONAL: "the enemy worker with the highest weight ON
  // THE ARC THE CRUSADER MOST WANTS, i.e. the one doing the thing they cannot bear." So offence is distance
  // from what you want — symmetric, every tradition can feel it, and none is rated for feeling it.
  if (kind === "crusade" && (sender.f?.wantArcId || null) !== arcId) return null;
  if (rng() >= strikeRate * disp) return null;

  // An EXPOSED striker is a known one. Aevi: a failed quiet strike "raises the rate at which they are
  // targeted in return" — being identified is what makes you worth reaching for.
  const bonus = Number.isFinite(strikeCfg.exposedTargetBonus) ? strikeCfg.exposedTargetBonus : 2;
  const mult = e => (exposure?.[e.f?.id] ? bonus : 1);
  // QUIET picks by VALUE (who is actually moving the arc). CRUSADE picks by WEIGHT on the wanted arc (the
  // biggest thing standing where they cannot bear it) — efficiency against offence.
  const valueOf = e => weightOf(e) * (e.urgency ?? 1) * mult(e);
  const mark = kind === "crusade"
    ? dWorking.slice().sort((a, b) => (weightOf(b) * mult(b)) - (weightOf(a) * mult(a)))[0]
    : dWorking.slice().sort((a, b) => valueOf(b) - valueOf(a))[0];

  const guard = dWorking.find(e => e !== mark) || defenders?.engaged?.[0] || null;
  // ⚠️ THE METHOD HAS TO MEAN SOMETHING MECHANICAL, or "stealth" and "declared" are decorative prose — a
  // content field the engine cannot read, which is the fifth door of the PromisedButUnread family. You can
  // stand in front of what you see coming: a DECLARED crusade is easier to intercept. That is the only
  // advantage stealth gets, and it is the whole of what "the target does not know" buys.
  const declaredMult = Number.isFinite(strikeCfg.declaredInterceptMult) ? strikeCfg.declaredInterceptMult : 1.6;
  const interceptChance = kind === "crusade"
    ? Math.min(0.95, guardInterceptChance * declaredMult) : guardInterceptChance;
  const guarded = !!guard && rng() < interceptChance;
  return { sender, mark, guard, kind, interceptChance, guarded };
}

/** ⚠️ IS IT AUTHORED YET? Neither table exists in content today, so every tradition strikes at the same rate
 *  and every strike is quiet. That is not a defect — it is the shipped behaviour, unchanged — but it must be
 *  a REPORTED number rather than a silence, or "the two kinds are built" reads as "the two kinds happen".
 *  Named the way `economyCoverage` names the economy's unreachable second axis. */
export function strikeCoverage(cfg = {}, roster = []) {
  const traditions = [...new Set(roster.map(f => f?.tradition || f?.legend?.tradition).filter(Boolean))];
  const strikeCfg = cfg?.strikes || cfg || {};
  const withDisp = traditions.filter(t => strikeCfg?.byTradition?.[t] != null).length;
  // ⚠️ ASK THE SAME NORMALIZER THE ENGINE ASKS. This read `strikeCfg.kindByTradition[t] === "crusade"`
  // directly — the old path AND the old shape — so after SNG-303c moved the reader it went on reporting
  // "no tradition is authored as a crusader, the declared kind never fires" while 279 crusades per run
  // were firing. A coverage report that contradicts the mechanic it reports on is worse than no report:
  // it is the stale-claim failure aimed squarely at the person deciding whether to author something.
  const kinds = normalizeStrikeKinds(cfg?.strikes ? cfg : { strikes: strikeCfg, kindByTradition: cfg?.kindByTradition });
  const crusaders = traditions.filter(t => kinds[t] === "crusade");
  const eithers = traditions.filter(t => kinds[t] === "either");
  return {
    traditions: traditions.length, withDisposition: withDisp,
    crusadeTraditions: crusaders.length, eitherTraditions: eithers.length,
    crusades: crusaders, bothKindsLive: crusaders.length + eithers.length > 0,
    note: crusaders.length + eithers.length === 0
      ? "every strike is QUIET — no tradition is authored as a crusader, so the declared kind never fires"
      : `both kinds reachable — ${crusaders.length} declare, ${eithers.length} do either`,
  };
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
  // SNG-304 — DRIVEN OFF HALVES THE HOLD; only walking away resets it. Aevi: "losing a front you were forced
  // off is not the same as leaving it." This sits at the one place EVERY wound in the world passes through —
  // melee casualties and strikes both land here — so a future way of hurting somebody cannot forget to pay it.
  // ⛔ NOT on stalemate: nobody was driven anywhere. That is the line above, and it returns before this.
  halveHold(ws, loser.id);
  if (kind === "killed") {
    const tooSoon = ws.lastEpicDeathDay != null && (worldDay - ws.lastEpicDeathDay) < deathCooldownDays;
    if (tooSoon) finalKind = "stopped"; // GATE: a second death too soon is downgraded — deaths stay landmarks
  }
  if (finalKind === "killed") {
    st.status = "dead"; st.diedWorldDay = worldDay; st.killedBy = winner.id;
    career(ws, loser.id).deaths++;   // SNG-288: THE SURVIVOR asks for zero of these across a whole life
    // SNG-294 {FOE} (Aevi: "cheapest — resolveEpicClash already holds winner, loser and both weights").
    // The BEST foe, by their rung, so "the Ashen Wyrm's End" names the hardest thing they ever put down
    // rather than the most recent. Makes the roster part of the naming system.
    {
      const c = career(ws, winner.id);
      const band = tierRank(loser.tier ?? loser.legend?.tier);
      if (!c.bestFoe || band > (c.bestFoe.band ?? -1)) c.bestFoe = { name: loser.name || null, band };
    }
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
 *  figures I authored, forever." Deaths were one-way — a world run long enough empties out, and the
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
export function mintFigure(ws, { tier = "notable", name = null, epithet = null, origin = "", originKind = "_default",
                                 region = null, arcAffinity = null, secondArc = null, worldDay = 0, weight = null,
                                 cap = 140, pools = null, rng = Math.random } = {}) {
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
    // ⚠️ WHY THEY EXIST, KEPT. `originKind` was used only to pick a verb pool and then thrown away, so
    // nothing downstream could tell a successor from a survivor — and a gate asserting "nobody is born of
    // the killing field" PASSED VACUOUSLY, because `m.originKind` was undefined on every figure and
    // `undefined !== "casualty_survivor"` is true. A field that does not exist satisfies every test that
    // asks what it is not. It is also the thing a narrator needs to say "this is the one the abyssal sent".
    originKind,
    region: region || null,
    // ⚠️ THE SHAPE MATTERS: `living` filters on `f.arcAffinity?.arcId`, so a bare string here silently
    // excludes a minted figure from the ENTIRE world — no contests, no standing, no promotion. They existed
    // in the roster and were invisible to every mechanic that reads a care. Same failure as a field with no
    // reader, wearing a type mismatch instead.
    // ⚠️ `dir`, NOT `lean` — `affinitiesOf` filters on `a?.arcId && a?.dir`, so a care with the wrong key
    // is no care at all. I guessed the field name instead of reading the function that consumes it, and the
    // figures were in the roster, in `living`, and contributed NOTHING to any arc: no push, no contest, no
    // lean. Twice now on this same object (the shape, then the key). The reader owns the contract.
    arcAffinity: arcAffinity ? { arcId: arcAffinity, dir: 1 } : null,

    // SNG-297 — A MINTED FIGURE IS BORN WITH A LIFE, OR THE WORLD THINS AS IT AGES.
    //
    // Aevi's audit: a minted figure had exactly ONE care, no `wantArcId`, and nothing to be doing off-arc —
    // while being fully promotable to mythic, because `worldRoster` concats them and `advanceStandings` walks
    // that roster. The 66 authored figures die at ~2.4 per world-year and are replaced by figures who CANNOT
    // hold two fronts and CANNOT abandon one. The valley gets quieter every year it runs.
    //
    // ⛔ AND THE POOLS DO NOT INVENT A LIFE — the same rule the engine already holds itself to. They are keyed
    // on what the mint actually KNOWS: the origin event. A verb drawn from "survived a casualty" is honest;
    // a brother is not.
    //
    // THE SECOND CARE IS DERIVED, NOT ROLLED (Aevi): their primary is the arc that produced them; their second
    // is the argument already loudest around them. That is how a successor actually works — they inherit the
    // local fight rather than picking one.
    arcAffinities: [
      ...(arcAffinity ? [{ arcId: arcAffinity, dir: 1, weight: 2 }] : []),
      ...(secondArc && secondArc !== arcAffinity ? [{ arcId: secondArc, dir: -1, weight: 1 }] : []),
    ],
    // The want is the arc their own origin names — what they are FOR when nothing is on fire.
    wantArcId: arcAffinity || secondArc || null,
    personalVerbs: (() => {
      const byOrigin = pools?.personalVerbsByOrigin || {};
      const pool = byOrigin[originKind] || byOrigin._default || [];
      if (!pool.length) return [];
      // Two, so a figure is not one line repeated; drawn rather than authored.
      const a = pool[Math.floor(rng() * pool.length)];
      const b = pool[Math.floor(rng() * pool.length)];
      return a === b ? [a] : [a, b];
    })(),
    region,
    mintedWorldDay: worldDay,
    origin,                       // WHY they exist — the event that made them, kept so the world can tell it
    legend: { tier, weight: weight ?? tierBirthWeight(tier) },
  };
  ws.mintedFigures.push(fig);
  return fig;
}

/** SNG-298 — PEOPLE CHANGE THEIR MINDS. Erik: *"I want NPCs to be able to grow and evolve too — their cares
 *  and wants might shift or they might gain new ones, especially if they are interacting with the player or
 *  get a strike attempted against them."*
 *
 *  Until now a figure's cares were fixed at authoring and never moved again. Everything else about them could
 *  change — their rung, their record, their title, whether they were alive — but not what they wanted, which
 *  is the one thing that would actually make them feel like a person rather than a position.
 *
 *  THREE MOVEMENTS, and the third is what keeps the other two honest:
 *
 *   · HARDENING — something happens to you over an arc you already care about, and you dig in. Weight up.
 *   · ACQUISITION — something happens to you over an arc you had no opinion on, and now you do. Somebody
 *     tried to have you removed from a front; that is how a front becomes YOUR front.
 *   · EROSION — a care you never spend attention on fades, and eventually drops. Without this, cares only
 *     ever accumulate: every figure ends up caring about everything, which makes the attention budget
 *     meaningless (there is nothing to choose between) and makes them all the same person.
 *
 *  ⛔ DIRECTIVE SNG-280 — NO APPROVAL ANYWHERE IN HERE. A strike does not make its target VIRTUOUS, it makes
 *  them INVESTED: the new care opposes whoever acted on them, which is causal rather than moral, and works
 *  identically for the Maw and for the Rootkin. And a figure who takes the player's side does so because of
 *  the relationship they already have with that player — a player the world dislikes recruits opposition just
 *  as reliably as a liked one recruits allies. Nothing here rewards being agreeable.
 *
 *  Pure: takes a figure and what happened to them, returns the new care list and why. Mutates nothing.
 */
export function evolveCares(figure, { struckOnArcs = [], playerArcs = [], relationship = 0, idleArcs = [], cfg = {} } = {}) {
  const maxCares = Number.isFinite(cfg.maxCares) ? cfg.maxCares : 4;
  const hardenBy = Number.isFinite(cfg.hardenBy) ? cfg.hardenBy : 1;
  const maxWeight = Number.isFinite(cfg.maxCareWeight) ? cfg.maxCareWeight : 4;
  const erodeBy = Number.isFinite(cfg.erodeBy) ? cfg.erodeBy : 1;

  const cares = affinitiesOf(figure).map(c => ({ ...c }));
  const byArc = new Map(cares.map(c => [c.arcId, c]));
  const changes = [];

  // 1 + 2 — what was DONE TO THEM. An attempt on your life over an arc is the strongest opinion-former in
  //         the model, which is why Erik named it: it is the moment a front stops being abstract.
  for (const { arcId, byDir } of struckOnArcs) {
    if (!arcId) continue;
    const have = byArc.get(arcId);
    if (have) {
      const before = Number(have.weight) || 1;
      have.weight = Math.min(maxWeight, before + hardenBy);
      if (have.weight !== before) changes.push({ kind: "hardened", arcId, to: have.weight });
    } else if (cares.length < maxCares) {
      // ⛔ The direction OPPOSES whoever came for them. Not a judgement — you push back on the people who
      // pushed you, whichever side either of you is on.
      const c = { arcId, dir: byDir ? -Math.sign(byDir) : -1, weight: 1 };
      cares.push(c); byArc.set(arcId, c);
      changes.push({ kind: "acquired", arcId, why: "an attempt was made on them over it" });
    }
  }

  // 3 — the PLAYER. Proximity makes an argument salient; the RELATIONSHIP decides which way they take it.
  //     A player the world has cause to dislike recruits opposition exactly as reliably as a liked one
  //     recruits allies, so this cannot be farmed by being pleasant.
  for (const { arcId, dir } of playerArcs) {
    if (!arcId || !dir) continue;
    const have = byArc.get(arcId);
    const side = relationship >= 0 ? Math.sign(dir) : -Math.sign(dir);
    if (have) {
      if (Math.sign(have.dir) === side) {
        const before = Number(have.weight) || 1;
        have.weight = Math.min(maxWeight, before + hardenBy);
        if (have.weight !== before) changes.push({ kind: "hardened", arcId, to: have.weight, why: "the player has been at it with them" });
      }
      // ⚠️ A figure who ALREADY leans the other way is NOT flipped by knowing the player. People do not
      //    change sides because someone they know is on the other one — that would make the player a
      //    persuasion machine and every NPC weather.
    } else if (cares.length < maxCares) {
      const c = { arcId, dir: side, weight: 1 };
      cares.push(c); byArc.set(arcId, c);
      changes.push({ kind: "acquired", arcId, why: relationship >= 0 ? "they have been in it alongside the player" : "they have been on the other side of the player" });
    }
  }

  // 4 — EROSION. What you never tend, you stop holding.
  for (const arcId of idleArcs) {
    const have = byArc.get(arcId);
    if (!have) continue;
    have.weight = (Number(have.weight) || 1) - erodeBy;
    if (have.weight <= 0) changes.push({ kind: "let go", arcId });
  }
  const kept = cares.filter(c => (Number(c.weight) || 0) > 0);

  // ⚠️ NEVER LEAVE THEM WITH NOTHING. A figure with no cares is invisible to `living` and drops out of the
  //    world entirely — erosion is meant to narrow someone, not delete them.
  const final = kept.length ? kept : cares.slice(0, 1).map(c => ({ ...c, weight: 1 }));
  return { cares: final, changes };
}
/** SNG-288 — A CAREER, NOT A RUNG.
 *
 *  ⚠️ `figureTenure.deeds` and `.losses` RESET ON PROMOTION — they measure progress toward the NEXT rung,
 *  which is exactly right for the ladder and exactly wrong for the mythic paths. Aevi's THE SURVIVOR is
 *  "beaten again and again and never once killed": a whole life, not one rung of it. Read per-rung, a figure
 *  who lost forty times across four rungs would show ten, and the path that is about a long bad record would
 *  be unreachable by the very figures it describes.
 *
 *  So the career record is kept ALONGSIDE tenure and never cleared. It costs one object per figure.
 */
export function career(ws, id) {
  ws.figureCareer = ws.figureCareer || {};
  return (ws.figureCareer[id] ||= {
    deeds: 0, losses: 0, wins: 0, deaths: 0, retrieved: 0,
    stageMoves: 0, guards: 0, protectedDeaths: 0,
    negWeight: 0, totalWeight: 0, spread: 0,
  });
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
  // SNG-304 (Aevi): "the deed ledger had seven sources, six combat-shaped, and the only non-combat one fires
  // ONLY when holding COST YOU YOUR PERSONAL TIME — you were paid for sacrifice, never for work. Meanwhile
  // `applyEpicArcPush` shows that LEANING is what actually moves arcs, every pass, for every figure. THE
  // LEDGER REWARDED THE AMPLIFIER AND IGNORED THE ENGINE." Weight 3, the same as a contest won, because
  // holding a front for five straight passes is what moves an arc and nothing was paying for it.
  //
  // ⛔ NOT A PEACEFUL-FIGURE PRIZE, per DIRECTIVE SNG-280 and Aevi's own guard on it: a marcher who holds one
  // front for five passes earns it identically. It rewards CONSTANCY — available to everyone, characteristic
  // of nobody — and the figures who chase every fire will never have it. That is the trade, and it is
  // symmetric. This is the answer to SNG-300's finding that every deed source but one needed a fight.
  heldTheLine:    3,
};

/** Credit a figure for something the world already recorded. `by` is a source key from DEED_WEIGHTS.
 *  `playerInvolved` marks a deed the PLAYER had a hand in, so a rise it later causes can say so by name. */
export function creditDeed(ws, figureId, by, { worldDay = 0, times = 1, playerInvolved = false } = {}) {
  if (!figureId || !DEED_WEIGHTS[by]) return 0;
  ws.figureTenure = ws.figureTenure || {};
  const t = (ws.figureTenure[figureId] ||= { tier: null, sinceDay: worldDay, wins: 0, losses: 0 });
  const gained = DEED_WEIGHTS[by] * (Number(times) || 1);
  t.deeds = (t.deeds || 0) + gained;
  // SNG-288: the same credit, kept for life. The rung forgets; the career does not.
  const c = career(ws, figureId);
  c.deeds += gained;
  if (by === "stageMoved") c.stageMoves += (Number(times) || 1);
  if (by === "guardIntercept") c.guards += (Number(times) || 1);
  // WHAT they did, kept for attribution — Aevi: "a rank that arrives without a reason is a number."
  t.deedLog = (t.deedLog || []).slice(-11).concat([{ by, worldDay, playerInvolved }]);
  if (playerInvolved) t.playerTouched = true;
  return gained;
}
/** SNG-288 — SEVEN ROADS TO MYTHIC. Erik overturned the single condition: *"losses isn't the right metric —
 *  you could become mythical after suffering hundreds of losses but not dying. Mythical for a variety of
 *  reasons is the right thrust."*
 *
 *  Aevi is right that this is the modes-and-tails insight applied to the top rung: `unbeaten` did not define
 *  mythic, it defined ONE KIND of mythic and silently ruled out every other. And the arithmetic made it
 *  unsatisfiable — at the measured 81% favourite win rate, forty contests without a loss is 0.02%.
 *
 *  ANY ONE PATH QUALIFIES. The rung stops being evaluative ("the best") and becomes descriptive ("the world
 *  has a story about this person") — and WHICH road they walked is recorded, because "she was never brought
 *  down" and "he has been brought down forty times and is still standing" are different people.
 *
 *  ⛔ DIRECTIVE SNG-280: THE FEARED exists so the top rung does not silently select for virtue. A figure
 *  known widely for harm reaches mythic by that road, at the same order of difficulty as THE KEPT. Neither is
 *  the real one.
 *
 *  Reads the CAREER, never the rung — see `career()` for why.
 */
export function mythicPathFor(ws, figureId, paths, bearer = null) {
  const c = ws?.figureCareer?.[figureId];
  if (!c || !Array.isArray(paths)) return null;
  // Deed shape, for THE FEARED and its counterweight. Read off the bearer's own deed record when there is
  // one; a figure with no recorded deeds simply cannot walk the roads that ask about their character.
  const deeds = Array.isArray(bearer?.deeds) ? bearer.deeds : [];
  const totalW = deeds.reduce((a, d) => a + Math.abs(Number(d.weight) || 0), 0);
  const negW = deeds.reduce((a, d) => a + (Number(d.weight) < 0 ? Math.abs(Number(d.weight)) : 0), 0);
  const negShare = totalW > 0 ? negW / totalW : 0;
  const reach = new Set(deeds.flatMap(d => d.spread || [])).size;

  for (const path of paths) {
    const k = path?.condition || {};
    if ((c.deeds || 0) < (k.deeds ?? 0)) continue;
    if (k.maxLosses != null && (c.losses || 0) > k.maxLosses) continue;
    if (k.minLosses != null && (c.losses || 0) < k.minLosses) continue;
    if (k.deaths != null && (c.deaths || 0) > k.deaths) continue;
    if (k.retrievedFromDeath != null && (c.retrieved || 0) < k.retrievedFromDeath) continue;
    if (k.arcStagesMoved != null && (c.stageMoves || 0) < k.arcStagesMoved) continue;
    if (k.guardsHeld != null && (c.guards || 0) < k.guardsHeld) continue;
    if (k.protectedDeaths != null && (c.protectedDeaths || 0) > k.protectedDeaths) continue;
    if (k.negativeWeightShare != null && negShare < k.negativeWeightShare) continue;
    if (k.spread != null && reach < k.spread) continue;
    return { id: path.id, name: path.name, why: path.whatItMeans || null };
  }
  return null;
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
    // SNG-288: the top rung is not one condition. Any of the seven roads qualifies, and which one is
    // RECORDED — the distribution across paths is the thing worth knowing, and "never brought down" and
    // "brought down forty times and still standing" must not read as the same person.
    let viaPath = null;
    if (rule.paths) {
      viaPath = mythicPathFor(ws, f.id, cfg.mythicPaths || [], f);
      if (!viaPath) continue;
    } else if (rule.unbeaten && t.losses > 0) continue;
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
    out.push({ id: f.id, name: f.name, from: tier, to: rule.to, deeds, causedByPlayer, path: viaPath?.id || null,
      why: viaPath?.name ? `— ${viaPath.name}` : (top ? PHRASE[top[0]] || "what they have been doing" : "what they have been doing") });
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
    const cares = new Set(currentCares(ws, dead).map(c => c.arcId));   // SNG-298: as they are NOW
    // Someone who stood on the same side of something. Failing that, nobody comes.
    const kin = living.filter(f => f.id !== id && effectiveEpicStatus(ws, f.id, worldDay) === "active"
      && currentCares(ws, f).some(c => cares.has(c.arcId)));
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
    if (won) career(ws, id).retrieved++;   // SNG-288: THE RETURNED — ties the death ladder to the tier ladder
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
  // ⚠️ SNG-309 — AND THE PLAYER. This pass walked the roster and the NPC registry and stopped there, so a
  // dead player would sit at their starting depth FOREVER: never sinking, never sealing, permanently
  // retrievable. Putting the player on the death ladder is only half the job — the clock has to reach them
  // too, or "your party can still come for you" is not a race against anything.
  if (character?.status === "dead" && character.deathState) deathNames.set(character, character.name || "You");
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
    // SNG-304 — the holding streak's dials, read once per pass.
    const holdCfg = cfg.holding || {};
    const holdThreshold = Number.isFinite(holdCfg.deedAtPasses) ? holdCfg.deedAtPasses : 5;
    const holdRepeats = holdCfg.deedRepeats === true;   // Aevi's spec is once per hold; see the note below
    const wonThisPass = {};         // SNG-295: arcId -> Set(ids) who won a contest on it this pass
    const removedDefender = {};     // SNG-295: arcId -> Set(ids) whose strike emptied a front holding it
    const heldNothing = new Set();  // SNG-279: figures who spent their attention on no front at all
    const personalBeats = [];      // figures whose own life is ON THE PAGE this pass
    const neglectedLives = [];     // …and the ones who spent it on a crisis instead
    let livesLived = 0, livesOnThePage = 0;

    // SNG-303b — CRUSADES AND EXPOSURE END, and they must end HERE, before attention is spent. A crusade
    // whose term ran out but is still sitting in `ws.crusades` keeps collapsing that figure's cares to one
    // arc forever — a figure permanently reduced to a single front by an event twelve world-years ago. Aevi
    // left the duration question open ("one pass, or until resolved? … probably a content dial"), so it IS a
    // dial: `crusadeDays`, defaulting to a season, expired in exactly one place.
    for (const [id, c] of Object.entries(ws.crusades || {})) {
      if (!c || !(Number(c.untilDay) > currentWorldDay)) delete ws.crusades[id];
    }
    for (const [id, x] of Object.entries(ws.figureExposure || {})) {
      if (!x || !(Number(x.untilDay) > currentWorldDay)) delete ws.figureExposure[id];
    }

    const vacated = {};
    const leaning = {};   // CCODE-113: arcId -> who is pushing which way this pass
    for (const f of living) {
      const wantArc = f.wantArcId || f.legend?.wantArcId || null;
      // ⚠️ THE EVOLVED CARES, NOT THE AUTHORED ONES. `spendAttention` is where a care becomes behaviour, so
      // if it reads the authored list the whole of SNG-298 is inert: the shift gets written, announced in the
      // news, and then ignored by the very next pass. `spendAttention` keeps taking a plain figure — the
      // substitution happens here, at the one place that knows the world state.
      const fNow = { ...f, arcAffinities: currentCares(ws, f) };
      const { spent, unattended, personal, neglected } = spendAttention(fNow, { arcNetPush: netBefore },
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
      // SNG-298: a care left untended, PASS AFTER PASS, is one they are letting go of. Tracked as a streak
      // rather than acted on immediately — skipping a front for one week is a choice, not a change of heart.
      ws.careIdle = ws.careIdle || {};
      const idle = (ws.careIdle[f.id] ||= {});
      for (const arcId of unattended) idle[arcId] = (idle[arcId] || 0) + 1;
      for (const s of spent) if (idle[s.care.arcId]) idle[s.care.arcId] = 0;
      // SNG-304 — THE HOLDING STREAK, the mirror image of `careIdle`. Consecutive passes on the SAME care.
      ws.careHeld = ws.careHeld || {};
      const held = (ws.careHeld[f.id] ||= {});
      for (const arcId of unattended) held[arcId] = 0;      // ⚠️ ABANDONING RESETS TO ZERO — see halveHold
      for (const s of spent) {
        const n = (held[s.care.arcId] = (held[s.care.arcId] || 0) + 1);
        // ⚠️ ONCE PER HOLD BY DEFAULT — Aevi's spec, literally: "crossing 5 consecutive passes credits
        // `heldTheLine`". I built the repeating version first (pay every 5) on the argument that a one-shot
        // stops noticing the thing it was added to notice, and MEASURED IT: repeating made heldTheLine 41%
        // of all deed credits against arcContestWon's 11%, and pushed the mean rise rate to 78% across the
        // board — a streak of 185 passes pays 37 times. That is a real design choice with a real cost, so it
        // is a DIAL set to what she actually wrote, not to what I inferred. `holdRepeats` turns it back on.
        if (holdDeedDue(n, holdThreshold, holdRepeats)) creditDeed(ws, f.id, "heldTheLine", { worldDay: currentWorldDay, arcId: s.care.arcId, passes: n });
      }
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
    const engageCfg = content.rules?.engagement || {};   // SNG-300: per-tradition disposition
    const workMult = Number.isFinite(cfg.indirectPushMult) ? cfg.indirectPushMult : 0.8;
    const wOf = e => (Number(e.f.legend?.weight ?? e.f.weight) || 5) * e.share;
    const arcOutcomes = {};
    const casualties = [];   // CCODE-117: who was hurt or killed over an arc this pass
    const strikes = [];      // CCODE-121: the quiet work — who was sent at whom, and who stood over them
    for (const [arcId, sides] of Object.entries(leaning)) {
      // The most urgent seek a fight; the rest get on with their work.
      // SNG-300 — WHO SEEKS A FIGHT IS A PROPERTY OF THE PERSON, not a quota on the side.
      //
      // This took a flat share of each side by urgency, so THE WAR-ENDER and a stillhold peacemaker were
      // equally likely to be in the fighting — the roster had 27 traditions and one temperament.
      //
      // ⛔ DIRECTIVE SNG-280: the multiplier describes METHOD, not merit. Stillhold at 0.15 is not a weak
      // marcher, it is a tradition whose crafts put an unarmoured body between harm and someone else. Every
      // figure still keeps their urgency ordering; what changes is how readily each one steps forward.
      const engageOf = (f) => {
        const t = f?.tradition || f?.legend?.tradition || null;
        const mult = (t && engageCfg.byTradition?.[t] != null) ? Number(engageCfg.byTradition[t]) : 1;
        const lo = Number.isFinite(engageCfg.min) ? engageCfg.min : 0.05;
        const hi = Number.isFinite(engageCfg.max) ? engageCfg.max : 0.9;
        return Math.max(lo, Math.min(hi, engageRate * (Number.isFinite(mult) ? mult : 1)));
      };
      const split = list => {
        const byUrgency = list.slice().sort((a, b) => b.urgency - a.urgency);
        const engaged = [], working = [];
        for (const e of byUrgency) (rng() < engageOf(e.f) ? engaged : working).push(e);
        return { engaged, working };
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
          for (const e of won) { if (ws.figureTenure[e.f.id]) ws.figureTenure[e.f.id].wins++; career(ws, e.f.id).wins++; }
          for (const e of lost) { if (ws.figureTenure[e.f.id]) ws.figureTenure[e.f.id].losses++; career(ws, e.f.id).losses++; }
          // SNG-279: a contest won is a DEED, credited to everyone who was in it — the allies were in the
          // same fight. `playerInvolved` when the player is pushing this same arc: their weight is part of
          // what made the win possible, and a rise it causes should be able to say so.
          for (const e of won) creditDeed(ws, e.f.id, "arcContestWon", { worldDay: currentWorldDay, playerInvolved: playerOnArc(arcId) });
          // SNG-295: WHO won, per arc, this pass. A turning is credited to the people who WON on the side it
          // moved toward — not to everyone who was standing nearby, which is what made it a presence test.
          for (const e of won) (wonThisPass[arcId] ||= new Set()).add(e.f.id);
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
        // SNG-304: the holding streak is an edge on PUSH. A figure who has held this front for five passes
        // leans half again as hard as one who arrived this week — that is the whole of Erik's "builds to a point".
        for (const e of aSide) applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * (res ? res.proMult : 1) * holdEdge(holdStreak(ws, e.f.id, arcId), holdCfg));
        for (const e of bSide) applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * (res ? res.conMult : 1) * holdEdge(holdStreak(ws, e.f.id, arcId), holdCfg));
      }
      // An engaged figure with nobody left to face is not in a fight after all — they push like a worker.
      const unfought = [...pq, ...qq];
      for (const e of [...P.working, ...Q.working, ...unfought]) {
        applyEpicArcPush(ws, { ...e.f, arcAffinity: e.care }, currentWorldDay, e.urgency * e.share * workMult * holdEdge(holdStreak(ws, e.f.id, arcId), holdCfg));
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
      // SNG-303b — THE RECONCILE PASS AGAINST AEVI'S STAGED SPEC. Four divergences, and the first inverted the
      // mechanic's entire purpose:
      //
      // ⚠️ 1. THE STRIKER WAS DRAWN FROM THE **ENGAGED** POOL. The spec is explicit — "drawn from the WORKING
      //       pool of their own side (a striker is not in the melee — that is the point)". Taking the sender
      //       from `engaged` meant a figure FOUGHT A DUEL AND SENT A KNIFE IN THE SAME PASS: two actions for
      //       one, which is precisely the "MUST NOT BE FREE, or everyone strikes" the spec warns about.
      //
      //       And it defeated the reason the mechanic exists. Erik closed a hole where pacifism was dominant;
      //       Aevi's fix gives the concealment traditions "a world-scale role… without ever winning a duel."
      //       But a side had to HAVE someone in the melee to strike at all — so umbral, veilwright and
      //       stillhold, at engage rates of 0.4/0.4/0.15, were the LEAST able to use the mechanic built for
      //       them, while the marchers who already dominated the fighting got it as a free extra action.
      //
      //    2. `strikes` disposition existed in the spec and nowhere else — every tradition struck alike.
      //    3. Only one of the two kinds was built (quiet targeting), so `crusade` was inert.
      //    4. Neither cost existed. A strike was free in both currencies.
      const strikeRate = Number.isFinite(cfg.strikeRate) ? cfg.strikeRate : 0.12;
      const strikeCfg = cfg.strikes || {};
      // ⚠️ NORMALIZED FROM THE WHOLE `arcResponse` BLOCK, not from `cfg.strikes`, because Aevi's kinds live
      // at `arcResponse.kindByTradition` in a list-per-kind shape. Reading only `cfg.strikes.kindByTradition`
      // is what made 910 strikes produce 0 crusades against a fully authored table.
      const strikeKinds = normalizeStrikeKinds(cfg);
      for (const [attackers, defenders] of [[P, Q], [Q, P]]) {
        // SNG-310 — ⚠️ THE PLAYER STANDS IN THE POOL, AND ONLY IN THIS POOL. They are added to the defending
        // side's WORKING list purely so `planStrike` can choose them as a mark; they are never in `living`,
        // never in `leaning`, and so never in a melee, a casualty table or a promotion. Standing on a front
        // is what makes someone worth sending a knife at — that logic now applies to the player too, which
        // is Erik's ruling, without the offscreen world deciding anything else about them.
        const playerHere = playerOnArc(arcId);
        const dSide = playerHere
          ? { ...defenders, working: [...defenders.working, {
              f: { id: PLAYER_MARK_ID, name: character?.name || "you",
                   weight: Math.max(1, Number(character?.level) || 1) },
              care: { arcId, dir: "pro" }, urgency: 1, share: 1 }] }
          : defenders;
        const plan = planStrike({ attackers, defenders: dSide, arcId, strikeCfg, strikeKinds, strikeRate, rng, weightOf: wOf,
          exposure: ws.figureExposure || {},
          guardInterceptChance: Number.isFinite(cfg.guardInterceptChance) ? cfg.guardInterceptChance : 0.45 });
        if (!plan) continue;
        const { sender, mark, guard, kind, guarded } = plan;
        // ⚠️ COMMITMENT IS PAID UP FRONT — before the roll, not on success. Aevi: "the price is paid up front,
        // and it is visible." A crusade that is turned aside at the door still emptied the fronts behind it.
        if (kind === "crusade" && sender.care?.dir) {
          const days = Number.isFinite(strikeCfg.crusadeDays) ? strikeCfg.crusadeDays : 90;
          (ws.crusades ||= {})[sender.f.id] =
            { arcId, dir: sender.care.dir, target: mark.f.id, untilDay: currentWorldDay + days, since: currentWorldDay };
        }
        if (guarded) {
          // ⚠️ EXPOSURE IS THE QUIET WORK'S PRICE, AND ONLY THE QUIET WORK'S. Aevi: "a failed strike does not
          // wound the striker — it IDENTIFIES them." A crusader cannot be exposed; they announced it.
          if (kind === "quiet") {
            const days = Number.isFinite(strikeCfg.exposureDays) ? strikeCfg.exposureDays : 180;
            (ws.figureExposure ||= {})[sender.f.id] =
              { arcId, knownTo: mark.f.id, worldDay: currentWorldDay, untilDay: currentWorldDay + days };
          }
          strikes.push({ arcId, kind, target: mark.f.id, sender: sender.f.id, outcome: "guarded", guard: guard.f.id });
          // SNG-279 / ⛔ DIRECTIVE SNG-280: the guard and the survivor score the SAME as the striker. Standing
          // over someone and reaching past someone are both contested things won; nothing here ranks them.
          creditDeed(ws, guard.f.id, "guardIntercept", { worldDay: currentWorldDay });
          creditDeed(ws, mark.f.id, "strikeSurvived", { worldDay: currentWorldDay });
          continue;
        }
        const clash = resolveEpicClash(sender.f, mark.f, rng);
        // SNG-310 — ⛔ IS THE MARK THE PLAYER? Then the engine MARKS and does not resolve.
        //
        // Erik: "yes the player can be struck, but that event is a GM narrated encounter. The fact that
        // someone is out to get you triggers it though." Every other strike settles here because both
        // parties are offscreen; this one cannot, because resolving it would decide a fight the player was
        // never in. So it becomes a pending threat and the loop moves on.
        //
        // The player is reachable only when they are actually HOLDING this front — `playerOnArc` is the same
        // test that decides whether a deed is player-touched. Standing on an arc is what makes you worth
        // sending someone at, which is the whole logic of the mechanic applied evenly to the player.
        if (mark.f.id === PLAYER_MARK_ID) {
          (ws.pendingStrikes ||= []).push({
            arcId, kind, sender: sender.f.id, senderName: sender.f.name || null,
            // A CRUSADE IS DECLARED AND A KNIFE IS NOT — the player is told about one and not the other,
            // which is the difference between the two kinds, not a rule written for the player's benefit.
            announced: kind === "crusade",
            worldDay: currentWorldDay, resolved: false,
          });
          news.push({ text: kind === "crusade"
            ? `${sender.f.name || "Someone"} has declared against you over ${arcId}. They are not hiding it.`
            : `Word reaches you that someone has been sent. No name, no face — only that it has been done.`,
            worldDay: currentWorldDay, tier: "event" });
          creditDeed(ws, sender.f.id, "strikeLanded", { worldDay: currentWorldDay });
          continue;
        }
        const outcome = applyEpicClashOutcome(ws, sender.f, mark.f, clash.kind, currentWorldDay);
        if (outcome?.finalKind && outcome.finalKind !== "already_dead") {
          strikes.push({ arcId, kind, target: mark.f.id, sender: sender.f.id, outcome: outcome.finalKind,
            targetTier: mark.f.tier ?? mark.f.legend?.tier ?? null });
          creditDeed(ws, sender.f.id, "strikeLanded", { worldDay: currentWorldDay });
          // SNG-295 ruling 3 (Erik: "striking defenders is a good mechanic to credit"). Removing the people
          // who were holding a front IS turning it — by subtraction rather than by pushing. The nastiest
          // route in the system: a campaign of strikes can turn an arc you never once contested.
          (removedDefender[arcId] ||= new Set()).add(sender.f.id);
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
    // SNG-306 — BETWEEN THE ARC PUSHES: the challenges. Erik: "striking isn't just about the back line —
    // between arc pushes there are ever present assassination risks, duel to the death challenges etc."
    //
    // ⚠️ THIS IS NOT PART OF AN ARC. That is the point of it. Everything else in this pass happens BECAUSE
    // two people want the valley to go different ways; a challenge happens because somebody is worth beating.
    // It reaches figures who held no front at all this pass, which is exactly the population that was
    // accumulating standing with nothing able to touch it.
    const challenges = [];
    {
      const cRate = cfg.challenges || {};
      const field = living.filter(f => (ws.epicStatus?.[f.id]?.status || "active") === "active");
      for (const f of field) {
        const plan = planChallenge({ figure: f, pool: field, tierOf: (x) => tierOf(ws, x), cfg: cRate, rng });
        if (!plan) continue;
        const { challenger } = plan;
        // ⚠️ THE SAME INJURY MODEL AS EVERYTHING ELSE. A wound taken in a duel over the valley, a wound taken
        // from a knife in the dark, and a wound taken in a challenge all mean the same thing — one model, so
        // a death is a death wherever it came from and `deathCooldownDays` still keeps them landmarks.
        const clash = resolveEpicClash(challenger, f, rng);
        const outcome = applyEpicClashOutcome(ws, clash.kind === "killed" || clash.kind === "wounded" ? challenger : f,
                                              clash.kind === "killed" || clash.kind === "wounded" ? f : challenger,
                                              clash.kind, currentWorldDay);
        if (!outcome?.finalKind || outcome.finalKind === "already_dead") continue;
        challenges.push({ defender: f.id, defenderName: f.name, challenger: challenger.id,
          challengerName: challenger.name, outcome: outcome.finalKind, tier: tierOf(ws, f) });
        // ⛔ NO DEED FOR THE DEFENDER SIMPLY FOR SURVIVING BEING FAMOUS, and none for the challenger just
        // for trying. Beating someone above you is a contest won and scores as one; that is the existing
        // source and it does not need a second name.
        if (outcome.finalKind !== "stalemate") {
          const won = (outcome.finalKind === "killed" || outcome.finalKind === "wounded") ? challenger : f;
          creditDeed(ws, won.id, "arcContestWon", { worldDay: currentWorldDay });
          career(ws, won.id).wins++;
          career(ws, won.id === challenger.id ? f.id : challenger.id).losses++;
        }
        for (const line of (outcome.news || [])) news.push({ text: line, worldDay: currentWorldDay, tier: "event" });
      }
    }
    ws.arcChallenges = challenges;

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

      // SNG-295 — WHO TURNED IT. Erik decided all four questions; this is the assembled rule.
      //
      // The bug being fixed: this credited EVERY figure leaning on the arc, both sides, so a turning banked
      // ~30 stage-moves at once and THE TURNER became a presence test — 20 of 21 mythics arrived by it.
      //
      // (1) REVERSING COUNTS AS TURNING. Pushing an arc back earns credit exactly as advancing does, and the
      //     title does not disambiguate: "Who Turned the Bleed" says you moved it, the stories say which way.
      //     That keeps the Feared and the Kept on identical footing, which DIRECTIVE SNG-280 requires.
      // (2) SHARED, BUT ONLY THE WINNERS. Every figure on the side it moved toward who WON a contest on this
      //     arc this pass. A turning is genuinely collective, so naming one figure would be false — but
      //     having been present is not the same as having done it.
      // (3) THE VACANCY ROUTE. A figure whose strike removed a defender counts too: they turned it by taking
      //     away the people who were holding it.
      // (4) ⛔ NOBODY WHO LEANED AGAINST IT, whatever else they did. That was the whole bug.
      const wentUp = now > before;
      const movers = wentUp ? (leaning[arcId]?.pro || []) : (leaning[arcId]?.con || []);
      const winners = wonThisPass[arcId] || new Set();
      const strikers = removedDefender[arcId] || new Set();
      const credited = new Set();
      for (const e of movers) {
        if (!winners.has(e.f.id)) continue;
        credited.add(e.f.id);
        creditDeed(ws, e.f.id, "stageMoved", { worldDay: currentWorldDay, playerInvolved: playerOnArc(arcId) });
      }
      for (const id of strikers) {
        if (credited.has(id)) continue;
        credited.add(id);
        creditDeed(ws, id, "stageMoved", { worldDay: currentWorldDay, playerInvolved: playerOnArc(arcId) });
      }
      // …and the ones who leaned WITH it and won nothing were the weight the winners were adding to. They
      // did not turn it, and the record should say the difference — `heldThroughCrisis` already exists.
      for (const e of movers) {
        if (credited.has(e.f.id)) continue;
        creditDeed(ws, e.f.id, "heldThroughCrisis", { worldDay: currentWorldDay });
      }
      ws.arcTurnings = (ws.arcTurnings || []).slice(-19).concat([{ arcId, from: before, to: now, by: [...credited] }]);
    }
    // SNG-275 — THE COVERAGE IS THE ASK. `lived` is how many figures kept their own time this pass;
    // `onThePage` is how many of those had anything AUTHORED to spend it on. The gap between the two is
    // exactly the content Aevi has yet to write, stated as a number rather than left as a silence.
    ws.personalCoverage = { lived: livesLived, onThePage: livesOnThePage, neglected: neglectedLives.length };
    // SNG-303b — THE SAME TREATMENT FOR THE TWO KINDS. `kindByTradition` is empty, so every strike in the
    // valley is quiet and the crusade path never fires. That is a fact about the CONTENT, not a defect, and
    // it is stated here as a number for the same reason: "the two kinds are built" and "the two kinds happen"
    // are different claims, and the second one is currently false.
    // ⚠️ THE WHOLE `arcResponse` BLOCK, not `cfg.strikes` — the kinds live at `arcResponse.kindByTradition`,
    // so handing this the inner block is what made the coverage report contradict the running mechanic.
    ws.strikeCoverage = strikeCoverage(cfg || {}, living);
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
    // ⛔ THE PLAYER IS NOT SPREAD HERE, AND THAT IS A CORRECTION TO MY OWN WORK.
    //
    // `runWorldTick` has spread the PLAYER's deeds since v0.5.0 ("big deeds spread between communities"),
    // and three tests gate it. I did not find it: I looked in `reputation.js`, which only READS `spread`,
    // and grepped for `recordDeed` rather than for `deed.spread` in this file. So CCODE-134 reported the
    // field had never had a writer, and for two commits the game ran TWO models on the player 14 lines apart
    // in app.js — the old one spreading a deed everywhere at once, mine spreading it a hop at a time.
    //
    // The figures below genuinely had no writer, so that half stands. The player half was already built.
    // ⚠️ WHICH MODEL SHOULD OWN THE PLAYER IS A DESIGN CALL, NOT MINE TO TAKE QUIETLY — the old one is
    // shipped, gated and in every save; the graded one matches Erik's "big news travels further". Reported.
    for (const f of living) {
      const bearer = character?.npcRegistry?.[f.id];
      if (!bearer?.deeds?.length) continue;
      const hops = spreadDeeds(bearer, { communitiesByRegion: commsByRegion, regionOfCommunity: regionOfComm, rng, rate: spreadRate });
      // SNG-279: 2 per hop — SCALE, not merit. A name that reached four settlements counts twice a name that
      // reached two, whatever the name is known for.
      if (hops.length) creditDeed(ws, f.id, "spreadPerHop", { worldDay: currentWorldDay, times: hops.length });
    }
    // SNG-298 — PEOPLE CHANGE THEIR MINDS. Run AFTER the pass, so it reads what actually happened: who was
    // struck at and over what, where the player has been spending themselves, and which cares went untended
    // long enough to be let go of.
    {
      const careCfg = content.rules?.careShift || {};
      const erodeAfter = Number.isFinite(careCfg.erodeAfterPasses) ? careCfg.erodeAfterPasses : 6;
      const struckBy = {};
      for (const s of strikes) {
        if (!s.target || s.outcome === "guarded") continue;   // a turned-aside strike is a fright, not a lesson
        (struckBy[s.target] ||= []).push({ arcId: s.arcId, byDir: null });
      }
      // Where the PLAYER is pushing, by arc — the same reader the arcs themselves use.
      const playerPush = [];
      for (const arcId of Object.keys(leaning)) {
        let mine = 0;
        try { mine = arcPushes(character, arcId)?.mine || 0; } catch { mine = 0; }
        if (mine) playerPush.push({ arcId, dir: Math.sign(mine) });
      }
      const shifted = [];
      for (const f of living) {
        const idle = ws.careIdle?.[f.id] || {};
        const idleArcs = Object.entries(idle).filter(([, n]) => n >= erodeAfter).map(([a]) => a);
        const struck = struckBy[f.id] || [];
        // Only figures something HAPPENED to. A quiet season changes nobody, which is the point.
        const known = character?.npcRegistry?.[f.id];
        const near = known ? playerPush : [];
        if (!struck.length && !near.length && !idleArcs.length) continue;
        const { cares, changes } = evolveCares(f, {
          struckOnArcs: struck, playerArcs: near, relationship: Number(known?.relationship) || 0,
          idleArcs, cfg: careCfg,
        });
        if (!changes.length) continue;
        // The care list lives on the WORLD, not on content — content is read-only and shared, and a figure
        // who changed their mind in this world has not changed it in anyone else's.
        (ws.figureCares ||= {})[f.id] = cares;
        for (const a of idleArcs) if (idle[a]) idle[a] = 0;
        shifted.push({ id: f.id, name: f.name, changes });
      }
      ws.careShifts = shifted;
      // ⚠️ NAMES, NOT IDS. "dug in over arc_what_wakes_beneath" is the machine talking — Aevi's rule for
      // the World tab applies to the news just as much.
      const arcTitle = Object.fromEntries((content.greaterArcs || []).map(a => [a.id, a.name]));
      const nameOfArc = (id) => arcTitle[id] || String(id).replace(/^arc_/, "").replace(/_/g, " ");
      for (const s of shifted.slice(0, 3)) {
        const got = s.changes.find(c => c.kind === "acquired");
        const hard = s.changes.find(c => c.kind === "hardened");
        const let_go = s.changes.find(c => c.kind === "let go");
        const line = got ? `${s.name || "Someone"} has taken an interest in ${nameOfArc(got.arcId)} — ${got.why}.`
          : hard ? `${s.name || "Someone"} has dug in over ${nameOfArc(hard.arcId)}.`
          : let_go ? `${s.name || "Someone"} has stopped spending themselves on ${nameOfArc(let_go.arcId)}.` : null;
        if (line) news.push({ text: line, worldDay: currentWorldDay, tier: "murmur" });
      }
    }
    ws.arcStandings = { risen, fallen };
    // SNG-279 PART 3 — SEE AND FEEL IT, the requirement rather than the garnish. Aevi: "a promotion the
    // player does not witness is a database write", and "a rank that arrives without a reason is a number."
    // So every rise says WHAT they did — and when the player had a hand in it, it says so BY NAME, which is
    // the moment the world engine stops being weather and becomes consequence.
    // SNG-287: a rise is when the world finds a name for someone. The title is only spoken if the RECORD can
    // fill every slot — most rises carry no title, which is what keeps one meaning something.
    const arcNames = Object.fromEntries((content.greaterArcs || []).map(a => [a.id, a.name]));
    // ⚠️ NOT `rules.traditionNames` — I reached for a key nobody authors, which is precisely what the
    // unauthoredRulesKeys ratchet exists to catch, and it caught me one commit after I built it. The
    // tradition index is already loaded and already carries the display names.
    const tradNames = Object.fromEntries(Object.entries(content.traditionIndex?.byId || {})
      .map(([id, t]) => [id, t?.name || t?.title || null]).filter(([, n]) => n));
    for (const r of risen) {
      const bearer = character?.npcRegistry?.[r.id] || worldRoster(ws, content).find(f => f.id === r.id) || null;
      const named = bearer ? titleFor({ ...bearer, id: r.id }, { ws, patterns: content.rules?.titles?.patterns || [], arcNames, traditionNames: tradNames, tagEpithets: content.rules?.titles?.tagEpithets || {} }) : null;
      if (named) { r.title = named.title; (ws.figureTitles ||= {})[r.id] = named; }
      const line = `${r.name || "Someone"}${named ? `, ${named.title},` : ""} is called ${r.to} this season — ${r.why}.`;
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
    // SNG-297: the argument already loudest around them, from what this pass measured. `arcContests` counts
    // duels per arc, so "most contested" needs no new recording — Aevi's point exactly.
    const mintPools = content.rules?.mintedFigures || null;
    const loudestArc = (exclude) => {
      const ranked = Object.entries(arcOutcomes)
        .filter(([id, o]) => id !== exclude && (o?.duels || 0) > 0)
        .sort((a, b) => (b[1].duels || 0) - (a[1].duels || 0));
      return ranked.length ? ranked[0][0] : null;
    };
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
        originKind: "vacancy_filled", secondArc: loudestArc(arcId), pools: mintPools, rng,
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
    // ⚠️ SNG-306b — ERIK'S CORRECTION, AND THEN HIS CORRECTION OF MY CORRECTION.
    //
    // He said the killing fields should not be the population producers: *"they don't COME from the field
    // they died in, they come from the home places."* I read that as "delete the battlefield mint" and cut
    // `casualty_survivor` outright. Wrong: *"I didn't mean that no one is minted in the battle as a new NPC
    // or role — they should be. I meant that the successors have home lands; it's just that the MOMENT mints
    // them in the game."*
    //
    // ⚠️ THAT IS A DISTINCTION BETWEEN TWO DIFFERENT THINGS, AND I COLLAPSED THEM:
    //
    //     MINTING IS WHEN THEY ENTER THE STORY. It is not when they come into existence.
    //
    // Everyone the world mints was already alive somewhere, living an ordinary life in the place they are
    // from. A death is the MOMENT that makes them matter — the one who stood beside it and walked away is
    // now somebody the valley has a name for, and the one who takes the empty chair was sent for. Both are
    // real births-into-the-story. What was wrong was never the second mint; it was that neither of them
    // came from anywhere.
    //
    // So both mints stay, and BOTH carry a homeland. Population size is a separate question with its own
    // dial (`mintRate`) — conflating "where are they from" with "how many are there" is what produced my
    // over-correction, and they should be turned independently.
    //
    // ⛔ TRADITION IS STANDING IN FOR HOME, AND THAT IS A STOPGAP. `homeLocation` is the right key and it is
    // authored on 5 of 66 figures, only one of which resolves to a real location — so keying on it today
    // would mean 61 figures who come from nowhere. Tradition is on 66 of 66 and IS a people with places in
    // the fiction. When homes are authored this becomes the finer grain, not a rewrite.
    // ⚠️ `casualties[].loser` IS AN ID, NOT A NAME. I wrote `c.loserId ?? null` looking for an id field that
    // does not exist, so every battlefield death resolved to no origin and its heirs came from nowhere —
    // caught by the homeland gate, which is the whole reason to assert a POSITIVE rather than an absence.
    // The same slip has been printing raw ids into epithets ("the one who outlived sister_alder") since the
    // mint was written; the name is looked up now.
    // ⚠️ AND THE ORIGIN LINE SAYS **HOW**. Erik: *"'walked away from it' is ambiguous."* He is right, and in
    // this world it is ambiguous in a specific and bad way — abandoning a front is a real mechanic here
    // (`careIdle`, `vacated`), so "walked away" reads as DESERTION rather than survival. The engine already
    // knows which of the three ways this person died; the line should just say so.
    const deaths = [...casualties.filter(c => c.kind === "killed").map(c => ({ arcId: c.arcId, id: c.loser, how: "melee" })),
                    ...strikes.filter(s => s.outcome === "killed").map(s => ({ arcId: s.arcId, id: s.target, how: s.kind === "crusade" ? "crusade" : "strike" })),
                    ...challenges.filter(c => c.outcome === "killed").map(c => ({ arcId: null, id: c.defender, how: "challenge" }))];
    /** What the survivor lived through, in the plainest words that are still true. */
    const survivedWhat = (how, who) => ({
      melee:     `survived the fighting that killed ${who}`,
      strike:    `was standing beside ${who} when they were cut down`,
      crusade:   `was with ${who} when they were hunted down`,
      challenge: `watched ${who} called out, and outlived them`,
    }[how] || `outlived ${who}`);
    /** Who they were and where they were FROM: their authored home if there is one, else their people. Both
     *  are returned so the origin line can name the truest thing it has, and so `homeland` stops being a
     *  stand-in the day Aevi authors the field. */
    const originOf = (id) => {
      const f = worldRoster(ws, content).find(x => x?.id === id);
      const people = f?.tradition || f?.legend?.tradition || null;
      const home = f?.homeLocation || f?.legend?.homeLocation || null;
      return { name: f?.name || id || "someone", people, home, where: home || people || null };
    };
    for (const d of deaths) {
      const from = originOf(d.id);
      d.who = from.name;
      if (rng() < mintRate) {
        // THE ONE WHO SURVIVED IT. They were not made by the battle — the battle is simply where the valley
        // first heard of them. They went home afterwards, and home is a place they already had.
        const f = mintFigure(ws, { tier: "riffraff", worldDay: currentWorldDay, arcAffinity: d.arcId ?? null,
          originKind: "casualty_survivor", secondArc: loudestArc(d.arcId), pools: mintPools, rng,
          region: from.home || null,
          epithet: `the one who outlived ${d.who}`,
          origin: from.where
            ? `of the ${from.where}; ${survivedWhat(d.how, d.who)}`
            : survivedWhat(d.how, d.who),
          cap: mintCap });
        if (f) { f.tradition = from.people || null; f.homeland = from.where || null; born.push(f); }
      }
      if (rng() < mintRate) {
        // THE ONE WHO TAKES THE CHAIR. Sent for, from the same place, because that is who sends a successor.
        const f = mintFigure(ws, { tier: "notable", worldDay: currentWorldDay, arcAffinity: d.arcId ?? null,
          originKind: "faction_leaderless", secondArc: loudestArc(d.arcId), pools: mintPools, rng,
          region: from.home || null,
          epithet: `the one who took ${d.who}'s place`,
          origin: from.where
            ? `sent by the ${from.where} to take up what ${d.who} left unfinished`
            : `took up what ${d.who} left unfinished`,
          cap: mintCap });
        if (f) { f.tradition = from.people || null; f.homeland = from.where || null; born.push(f); }
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
