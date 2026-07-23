// wake.js — SNG-204: the WAKE ENGINE. A resolved SIGNIFICANT outcome leaves a wake — a structured,
// generation-ready trace of what changed and which way it pushes the world — and the world CONTINUES from
// it. Before this, consequences landed durably (chronicle, codex, arc stages) and then stopped: `quest_seed`
// pinned "A thread opens…" that nothing ever opened. This closes the loop.
//
// This module owns the wake RECORD + lifecycle + the cheap path (a wake leans on the arcs it connectsTo, so
// the substrate stirring nudges the manifestation storm — reusing the SNG-2B arc net-vector, no new arc
// machinery). The EXPENSIVE path (a model call minting a full new quest FROM a wake) is SNG-204 Phase 2 and
// reads these open wakes. Pure over character/worldState; never throws.

import { smartClamp } from "./namematch.js";

// Only significant outcomes wake — world/tradition/regional tiers, plus any arc move. Local/npc errands wake
// only if the content flags it. Rarity is the point (§GUARD): a world that wakes on everything means nothing.
const WAKE_TIERS = new Set(["world", "tradition", "regional"]);
const WAKE_CAP = 24;             // keep the newest N open+closed wakes
const WAKE_START_STRENGTH = 4;   // pressure at birth; fades one per world-day
const WAKE_DECAY_DAYS = 10;      // an unengaged wake closes after this — the world moves on (§4 decay)
const WAKE_ARC_CAP = 4;          // the most a wake's cheap-path lean can move a neighbouring arc
export const MAX_WAKE_DEPTH = 2; // registry:internal — the §4 depth throttle; default of eligibleWakes, exported for the test

function outcomeWakes(quest, applied) {
  if (WAKE_TIERS.has(quest?.tier)) return true;
  if ((applied || []).some(a => a?.type === "arc_stage")) return true; // an arc move always wakes
  return !!quest?.wakes; // a local/npc outcome wakes only if the content flags it
}

/** SNG-204 §2: promote a significant outcome's applied effects into a WAKE — provenance (`source`), the
 *  durable delta (`change` = the applied effects, kept), the inference seed (`pressure` = the moved arc's
 *  authored `pressureOnAdvance`), scale (from the SNG-203 tier), the neighbouring arcs it pushes
 *  (`connectsTo`), and the open/depth lifecycle. Stores on worldState.wakes, de-duped on (quest,outcome) so
 *  the same aftermath never re-spawns. Applies the CHEAP PATH immediately: a signed lean on each connected
 *  arc (an advance escalates its neighbours, a retreat calms them — the net-vector philosophy extends to the
 *  wake). Returns the wake, or null when the outcome doesn't wake / is a duplicate. */
export function createWake(character, quest, outcome, applied, content = {}, ctx = {}) {
  if (!quest || !outcome || !outcomeWakes(quest, applied)) return null;
  character.worldState = character.worldState || {};
  const ws = character.worldState;
  ws.wakes = ws.wakes || [];
  const id = `wake_${quest.id}_${outcome.id}`;
  if (ws.wakes.some(w => w.id === id)) return null; // idempotent — one wake per (quest, outcome)
  const arcEffect = (applied || []).find(a => a?.type === "arc_stage");
  const arcId = arcEffect?.arcId || quest.arcId || null;
  const arcs = content?.greaterArcs || [];
  const arc = arcId ? arcs.find(a => a.id === arcId) : null;
  // the stage the outcome moved the arc TO — the quest's authored target wins; else derive from base + push.
  const stageNum = Number.isFinite(quest.arcStageTo) ? quest.arcStageTo
    : Number.isFinite(arcEffect?.stage) ? arcEffect.stage
    : (arc ? Math.max(1, Math.min((arc.stages || []).length || 1, (arc.currentStage ?? 1) + (arcEffect?.push ?? 0))) : null);
  const stageDef = arc && Number.isFinite(stageNum) ? (arc.stages || []).find(s => s.stage === stageNum) : null;
  const pressure = stageDef?.pressureOnAdvance || arc?.tendency || outcome.summary || "the world shifts in the wake of it";
  const scale = WAKE_TIERS.has(quest.tier) ? quest.tier : (arcEffect ? "world" : "local");
  const connectsTo = arc ? (arc.connectsTo || []).filter(nid => arcs.some(a => a.id === nid)) : []; // only arcs that EXIST
  const wake = {
    id, source: { questId: quest.id, outcomeId: outcome.id, arcId, worldDay: ctx.worldDay ?? null },
    change: applied || [], pressure: smartClamp(String(pressure), 400), scale, connectsTo,
    open: true, depth: Math.max(0, ctx.parentWakeDepth ?? 0), worldDay: ctx.worldDay ?? null, strength: WAKE_START_STRENGTH,
  };
  ws.wakes.push(wake);
  if (ws.wakes.length > WAKE_CAP) ws.wakes = ws.wakes.slice(-WAKE_CAP);
  // §6.4 the cheap path — a wake leans on the arcs it connects to, in the direction the outcome pushed.
  const dir = arcEffect ? (Math.sign(arcEffect.delta ?? arcEffect.dir ?? 1) || 1) : 1;
  ws.wakeArcPushes = ws.wakeArcPushes || {};
  for (const nid of connectsTo) {
    const cur = ws.wakeArcPushes[nid] || { arcId: nid, push: 0 };
    cur.push = Math.max(-WAKE_ARC_CAP, Math.min(WAKE_ARC_CAP, cur.push + dir));
    ws.wakeArcPushes[nid] = cur;
  }
  return wake;
}

/** SNG-204 §4: open wakes DECAY over world-time — pressure fades, and one nobody engaged eventually closes
 *  unspawned (the world moves on, exactly as SNG-198's untended threads drift). Returns the wakes that closed
 *  this tick. Mutates. */
export function decayWakes(character, worldDay) {
  const ws = character?.worldState;
  if (!ws?.wakes?.length) return [];
  const closed = [];
  for (const w of ws.wakes) {
    if (!w.open) continue;
    const age = (worldDay ?? 0) - (w.worldDay ?? 0);
    if (age >= WAKE_DECAY_DAYS) { w.open = false; w.closedReason = "unengaged"; closed.push(w); }
    else w.strength = Math.max(0, WAKE_START_STRENGTH - Math.max(0, age));
  }
  return closed;
}

/** The wake pressure currently on an arc (worldtick.arcStageNow folds this into the net, so a wake's lean on
 *  a neighbour actually MOVES that arc). Pure read. */
export function wakeArcPush(ws, arcId) {
  const w = ws?.wakeArcPushes?.[arcId];
  return Number.isFinite(w?.push) ? w.push : 0;
}

/** SNG-204 §OQ1 (immediate aftermath): the open wakes surfaced to the GM as the "what comes next" seed — so
 *  the GM can weave the next thread OUT of a resolved consequence NOW, in-grain, inferred from the lore,
 *  even before the Phase-2 model-generation path mints a full quest. Only the public pressure surfaces; a
 *  wake's `change` may reference sealed truth, but `pressure` is the SNG-203 public-face register. */
export function wakesForGM(character, content = {}) {
  const open = (character?.worldState?.wakes || []).filter(w => w.open);
  if (!open.length) return null;
  const arcs = content?.greaterArcs || [];
  const lines = open.slice(-4).map(w => {
    const arc = w.source.arcId ? arcs.find(a => a.id === w.source.arcId) : null;
    const pushes = w.connectsTo.length ? ` — and it presses on ${w.connectsTo.map(n => String(n).replace(/^arc_/, "").replace(/_/g, " ")).join(", ")}` : "";
    return `- ${arc ? arc.name : "A resolved thread"} left a WAKE (${w.scale}): ${w.pressure}${pushes}. What follows from THIS is the next thread — a faction reacting, a place coping, a person seizing the moment — offer it in the fiction, inferred from the lore, never invented from nothing.`;
  });
  return `WAKES — the aftermath waiting to become the next thing (SNG-204). Open consequences the world has not yet continued from; weave the next quest or situation OUT of them, in-grain (do not force one every beat — a wake is an opportunity, not an obligation):\n${lines.join("\n")}`;
}

// ---------- SNG-204 Phase 2: reading open wakes and GENERATING the next thread ----------
const WAKE_GEN_SCALES = new Set(["world", "tradition", "regional"]);

/** Open wakes eligible to GENERATE a new thread from: significant scale, not yet spawned-from, within the
 *  DEPTH THROTTLE (a wake spawned from a wake past MAX_WAKE_DEPTH needs player engagement, so an unplayed
 *  corner can't self-propagate to infinity), still carrying pressure. Capped per pass — the COST GOVERNOR:
 *  generating a full thread is a model call, so most wakes resolve as pressure recorded (the cheap path) and
 *  only the strongest few spawn. Strongest first. Pure. */
export function eligibleWakes(character, worldDay, { maxDepth = MAX_WAKE_DEPTH, cap = 2 } = {}) {
  const wakes = character?.worldState?.wakes || [];
  return wakes
    .filter(w => w.open && !w.spawned && WAKE_GEN_SCALES.has(w.scale) && (w.depth ?? 0) <= maxDepth && (w.strength ?? 0) > 0)
    .sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))
    .slice(0, cap);
}

/** The generation context for a wake — what the generator authors the CONSEQUENCE from. Inference is
 *  LORE-BOUNDED (§GUARD): the wake's `pressure` (the seed) + the source arc + its connectsTo neighbours are
 *  the surface; the generator authors what the lore IMPLIES, never free invention. Rides the existing
 *  generate hooks (hint / why / arcPressure), so no new prompt plumbing. `parentWakeDepth` threads the
 *  throttle: a thread spawned from a depth-N wake resolves into a depth-(N+1) wake. Pure. */
export function wakeGenerationContext(wake, content = {}) {
  const arcs = content?.greaterArcs || [];
  const arc = wake?.source?.arcId ? arcs.find(a => a.id === wake.source.arcId) : null;
  const neighbours = (wake?.connectsTo || []).map(id => arcs.find(a => a.id === id)).filter(Boolean).map(a => a.name);
  return {
    hint: `a new thread that FOLLOWS FROM what just happened${arc ? ` to ${arc.name}` : ""} — the aftermath of it, not a fresh unrelated situation`,
    why: `A significant outcome left a wake: ${wake.pressure}. Author the consequence the LORE IMPLIES${neighbours.length ? ` (it presses on ${neighbours.join(", ")})` : ""} — a faction reacting, a place coping, a person seizing the moment — never arbitrary new content.`,
    arcPressure: wake.pressure,
    wake: { source: wake.source, pressure: wake.pressure, connectsTo: wake.connectsTo, scale: wake.scale },
    parentWakeDepth: (wake.depth ?? 0) + 1,
  };
}

/** Close a wake once it has been generated-from — so the world never re-spawns the same aftermath (the
 *  idempotency guard). Marked on ATTEMPT, not just success, so a transient generation failure never becomes
 *  an infinite per-tick retry (the pressure it left was already recorded via the cheap path). */
export function markWakeSpawned(wake, spawnedId = null, worldDay = null) { // registry:internal — used by runWakeGeneration; exported for the test
  if (!wake) return;
  wake.spawned = true; wake.open = false; wake.spawnedId = spawnedId; wake.spawnedWorldDay = worldDay;
}

/** SNG-204 Phase 2: read the open wakes and GENERATE the next thread from each — the loop, closed. The AI
 *  generator is INJECTED (same pattern as the offscreen evolveFn / arc-seed pass): testable with a fake,
 *  real in prod. `generateFn(wakeCtx) → the minted thread` (or null on stub/failure). Each eligible wake
 *  spawns at most once; bounded by eligibleWakes (count cap + depth throttle). Returns what the world grew. */
export async function runWakeGeneration({ character, content = {}, worldDay = 0, generateFn = null } = {}) {
  if (!generateFn) return { spawned: [], news: [] };
  const spawned = [], news = [];
  for (const wake of eligibleWakes(character, worldDay)) {
    let thread = null;
    try { thread = await generateFn(wakeGenerationContext(wake, content)); } catch { thread = null; }
    markWakeSpawned(wake, thread?.id || null, worldDay);
    if (thread) { spawned.push(thread); news.push(`A new thread grows from the aftermath: ${thread.name || thread.premise || "the world continues"}.`); }
  }
  return { spawned, news };
}
