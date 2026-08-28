// engine/death.js — SNG-209: death is a STATE, not a terminus.
//
// A dead entity is not removed from the world — it is IN THE DEATH STATE at a DEPTH, still on the board,
// potentially retrievable. Depth grades the wall (0 the threshold · 1 the near dark · 2 the deep dark ·
// 3 the sealed) and is COMPUTED from time-dead + body-status + fate-binding, with a GM override. The
// world-tick's clock sinks untended deaths toward sealed — freshly dead is cheap, waiting deepens them,
// long neglect seals them (permanent, and what makes the returnable ones matter). Pure over the entity +
// the current world-day + rules. This is the substrate; the roads BACK (per-tradition method, the retrieval
// quests, player-death UX) are content/design that build ON this model (SNG-209 §3/§4, ROUND 2).

const DEFAULTS = { thresholdDays: 1, nearDarkDays: 30, sealAfterDays: 120 };
export const DEATH_DEPTH_NAMES = ["the threshold", "the near dark", "the deep dark", "the sealed"];

/** Put an entity INTO the death state — a STATUS extension, never a delete. Preserves an existing state
 *  (won't un-seal, keeps the original diedDay); fills what's missing. `bodyStatus`: intact | lost | unmade.
 *  `sealed`/`depthOverride`: fate-binding a death one-way, or a GM-set depth. Returns the entity. */
export function enterDeathState(entity, { diedDay = null, bodyStatus = null, sealed = false, depthOverride = null, cause = null } = {}) {
  if (!entity) return entity;
  entity.status = "dead";
  const prev = entity.deathState || {};
  entity.deathState = {
    diedDay: prev.diedDay ?? diedDay,
    bodyStatus: bodyStatus || prev.bodyStatus || "intact",
    sealed: prev.sealed || !!sealed,
    depthOverride: depthOverride ?? prev.depthOverride ?? null,
    cause: cause || prev.cause || null
  };
  return entity;
}

/** The DEPTH of a death: 0 threshold · 1 near dark · 2 deep dark · 3 SEALED (one-way). Sealed → 3; a GM
 *  override wins next; else computed from days-dead (threshold → near → deep) with body-loss forcing the
 *  deep dark. A dead entity with no state record reads as near-dark (a pre-SNG-209 death, retrievable). */
export function deathDepth(entity, currentDay = null, rules = {}) {
  const ds = entity?.deathState;
  if (!ds) return entity?.status === "dead" ? 1 : 0;
  if (ds.sealed) return 3;
  if (ds.depthOverride != null) return Math.max(0, Math.min(3, ds.depthOverride));
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const rawDays = (currentDay != null && ds.diedDay != null) ? Math.max(0, currentDay - ds.diedDay) : 0;
  // ⛔ CCODE-269 — A HELD-OPEN WAY STOPS THE CLOCK, and a slowed one lengthens every span. Both are read
  // HERE rather than in `deepenDeaths`, because depth is COMPUTED — a hold honoured only by the sealing
  // pass would stop them being sealed while still letting them sink, which is not what holding means.
  if (ds.heldOpenBy) return Math.max(0, Math.min(3, ds.depthOverride ?? 0));
  const days = rawDays / Math.max(1, Number(ds.sinkFactor) || 1);
  let depth = days <= cfg.thresholdDays ? 0 : days <= cfg.nearDarkDays ? 1 : 2;
  if (ds.bodyStatus === "lost" || ds.bodyStatus === "unmade") depth = Math.max(depth, 2);
  return Math.min(3, depth);
}

export function isSealed(entity, currentDay, rules) { return deathDepth(entity, currentDay, rules) >= 3; }
/** Dead, but not sealed — a latent retrieval hook, not a void (§1: dead ≠ gone). */
export function isRetrievable(entity, currentDay, rules) { return entity?.status === "dead" && !isSealed(entity, currentDay, rules); }

/** THE CLOCK (§5.6). A death left untended past `sealAfterDays` sinks to SEALED — the world carries the
 *  loss and the roads back close. Mutates; returns the entities newly sealed this pass (for news). The drama
 *  is the urgency: the longer you wait, the deeper they go, until one day they're beyond reach. */
export function deepenDeaths(entities = [], currentDay = null, rules = {}) {
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const sealed = [];
  for (const e of entities || []) {
    const ds = e?.deathState;
    if (!ds || ds.sealed || e.status !== "dead" || ds.diedDay == null || currentDay == null) continue;
    // ⛔ CCODE-269: a way held open does not seal, and a slowed sinking takes proportionally longer to.
    if (ds.heldOpenBy) continue;
    if (((currentDay - ds.diedDay) / Math.max(1, Number(ds.sinkFactor) || 1)) >= cfg.sealAfterDays) { ds.sealed = true; sealed.push(e); }
  }
  return sealed;
}

/** GM-context reader (SNG-209 §1, the un-terminal). The dead who are NOT gone — figures in the death state at
 *  a REACHABLE depth, each a latent retrieval hook. The GM sees them so a killed figure reads as "behind a
 *  hard road, for now," never as deleted. Pulls epic statuses + the npc registry; SEALED deaths are omitted
 *  (they truly are gone). `currentDay` defaults to the last world-tick's day. Returns a compact list the
 *  prompt can weave, or null when no one is reachable-dead. */
export function reachableDeadForGM(character, content = {}, currentDay = null) {
  const day = currentDay ?? character?.worldState?.lastTickWorldDay ?? null;
  const out = [];
  // SNG-270: WHO WANTS THEM BACK. A dead person the GM can see is atmosphere; a dead person somebody is
  // trying to reach is a QUEST the player can be asked to take. The world-tick records the asker while
  // it decides who spends a front going after their own — this just reads it back.
  const wantedBy = {};
  for (const w of (character?.worldState?.retrievalWanted || [])) if (w?.deadId) wantedBy[w.deadId] = w;
  const consider = (name, e, id = null) => {
    if (!name || !isRetrievable(e, day)) return;
    const d = deathDepth(e, day);
    const w = id ? wantedBy[id] : null;
    out.push({ name, depth: d, wall: DEATH_DEPTH_NAMES[d], cause: e.deathState?.cause || null,
      wantedBy: w?.byName || null, askerWaiting: w?.waiting || false });
  };
  // SNG-269/2b: the LIVING roster — authored figures PLUS the ones the world has minted since. A minted
  // figure who dies must be mournable and retrievable like any other; reading only the authored roster
  // would make them the one kind of dead nobody can go after. Concatenated inline rather than imported —
  // this module is the pure substrate and owes nothing to worldtick.
  const roster = (content.legends?.roster || []).concat(character?.worldState?.mintedFigures || []);
  for (const f of roster) consider(f.name, character?.worldState?.epicStatus?.[f.id], f.id);
  for (const n of Object.values(character?.npcRegistry || {})) if (n && typeof n === "object") consider(n.name, n, n.id);
  return out.length ? out.slice(0, 8) : null;
}

/** A retrieval attempt resolves a death state: RETURN (status active — optionally CHANGED, §4), FAIL (the
 *  attempt is a risk — it sinks them deeper, maybe sealing them), or SEAL (confirmed one-way). The engine
 *  primitive a retrieval quest's outcome or a GM op calls; the COST/CHANGE lives in that layer, this moves
 *  the STATE. A sealed death refuses every road. */
export function resolveRetrieval(entity, outcome, { currentDay = null, changed = null } = {}) {
  if (!entity || entity.status !== "dead") return { ok: false, why: "not in the death state" };
  const ds = entity.deathState || (entity.deathState = { diedDay: null, bodyStatus: "intact", sealed: false, depthOverride: null, cause: null });
  if (ds.sealed) return { ok: false, why: "sealed — beyond any road back" };
  if (outcome === "return") {
    entity.status = "active";
    entity.returnedFromDeath = { day: currentDay, changed: changed || null }; // §4: return can change them
    delete entity.deathState;
    return { ok: true, outcome: "return", changed: changed || null };
  }
  if (outcome === "seal") { ds.sealed = true; return { ok: true, outcome: "seal" }; }
  // fail → sinks deeper; a failed retrieval at the deep dark seals them (the risk, §4).
  ds.depthOverride = Math.min(3, deathDepth(entity, currentDay) + 1);
  if (ds.depthOverride >= 3) ds.sealed = true;
  return { ok: true, outcome: "fail", deepened: true, sealed: !!ds.sealed };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// CCODE-269 / AEVI's SPEC_retrieval_shape — FOUR THINGS THIS LADDER DID NOT HAVE.
//
// ⛔ AND FIRST, WHAT IT ALREADY DID, BECAUSE I DID NOT LOOK AND BUILT A SECOND ONE.
// Aevi's spec says "I do not know where that state lives... That seam is yours", and I read that as "it
// does not exist" instead of searching for it. It exists — SNG-209, this file, wired into app.js and the
// world tick. The four rungs, the day thresholds, sealing, the deepening clock, sink-on-failed-retrieval
// and seal-at-the-deep-dark were ALL ALREADY HERE. `resolveRetrieval` implements her acceptance 2 verbatim.
// ⚠️ I WROTE A PARALLEL `deathdepth.js` AND DELETED IT. That is the same "two names for one thing" failure
// I have spent this month flagging in other people's work, committed by not spending one grep.
//
// What was genuinely missing is below, and it is small.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

/** ⛔ WHICH RANK REACHES WHICH RUNG. `calling_back`'s own mechanic note has said this all along — "r1
 *  reaches depth 0 · r2 depth 1 · r3 depth 2 · depth 3 (sealed) is closed to every rank" — and nothing read
 *  it. The ladder knew how deep someone was and never knew who could get to them.
 *
 *  ⚠️ SURGE REACHES ONE RUNG FURTHER, which is acceptance 4 and was pure prose: *"reach past your rank; A
 *  FAILED REACH SINKS THEM, AND AT THE DEEP DARK IT SEALS THEM."* The sinking half already worked; the
 *  reaching half did not exist, so the gamble had no upside to gamble for.
 *
 *  ⛔ SEALED STAYS CLOSED TO SURGE. Acceptance 3 says every rank, and a surge is not a rank — a top rung you
 *  can reach by trying harder is not a top rung. */
export function reachOf(rank, intensity = "standard") {
  // ⛔ CCODE-285 — CLAMPED ON BOTH PATHS. The SURGE path stopped at 2; the BASE path did not, so `reachOf(4)`
  // answered 3 — THE SEALED RUNG — and `reachOf(9)` answered 8. The paragraph directly above says "acceptance
  // 3 says EVERY RANK", and `docs/HOW_IT_WORKS.md` §6 says the sealed rung is reachable by nothing at any
  // rank. Both were true only because ranks happen to stop at 3 today.
  // ⚠️ A LATENT BREACH IS STILL A BREACH: a braid, a stacked surge, or any future rank-4 craft would have
  // reached past the end of the ladder, and nothing anywhere would have said so. Found by executing the doc.
  const base = Math.min(2, Math.max(0, (Number(rank) || 1) - 1));   // r1→0, r2→1, r3→2, r4+→2
  return intensity === "surge" ? Math.min(2, base + 1) : base;
}

/** Can this reach even be attempted? ⚠️ REFUSED IS NOT FAILED, and the distinction is the whole safety of
 *  the mechanic: a FAILURE sinks them, so being told "that is past your reach" must not cost the person you
 *  were reaching for. `resolveRetrieval(entity, "fail")` is the costly path; this is the free one. */
export function canReach(entity, { rank = 1, intensity = "standard", currentDay = null, rules = {} } = {}) {
  if (!entity || entity.status !== "dead") return { ok: false, why: "there is nobody there to reach for" };
  const at = deathDepth(entity, currentDay, rules);
  if (at >= 3) return { ok: false, sealed: true, why: "they are sealed — no rank reaches this" };
  const reach = reachOf(rank, intensity);
  if (reach < at) {
    return { ok: false, refused: true, at, reach,
      why: `${DEATH_DEPTH_NAMES[at]} is past your reach — you would need rank ${at + 1}${at < 2 ? " or a surge" : ""}` };
  }
  return { ok: true, at, reach };
}

/** ⛔ A WAY HELD OPEN, AND ITS OWNER MAY WALK AWAY. Aevi's point 4 — `open_threshold` r3 leaves one standing
 *  WITHOUT its caster, and `kept_breath` holds someone at the threshold so they never enter it.
 *  ⚠️ IT STOPS THE CLOCK, which is why it is a different verb from slowing. `deepenDeaths` honours it. */
export function holdOpen(entity, byId = null, { willing = null } = {}) {
  if (!entity?.deathState) return { ok: false, why: "there is nothing to hold open" };
  if (entity.deathState.sealed) return { ok: false, why: "sealed — there is no way left to hold" };
  entity.deathState.heldOpenBy = byId || "someone";
  // ⚠️ CONSENT IS A FACT ABOUT THE DEAD, not a parameter of the craft. `open_threshold` says "they may come
  // back IF THEY WILL", so one tradition has already ruled that retrieval ASKS — and a field that lives on
  // the caster could not carry a refusal.
  if (willing != null) entity.deathState.willing = !!willing;
  return { ok: true, heldOpenBy: entity.deathState.heldOpenBy };
}
export function releaseHold(entity) {
  if (entity?.deathState) entity.deathState.heldOpenBy = null;
  return { ok: true };
}

/** ⚠️ SLOW THE SINKING — `names_of_the_lost`: "holds at the Threshold past its day, and in the Near Dark
 *  past its month." It LENGTHENS the spans; it does not stop the clock. Collapsing slow into hold would
 *  erase the difference between what Threnody does and what Ashwarden does, which is the one thing Aevi
 *  asked this build not to do. */
export function slowSink(entity, factor = 2) {
  if (!entity?.deathState) return { ok: false };
  const f = Math.max(1, Number(entity.deathState.sinkFactor) || 1) * Math.max(1, Number(factor) || 2);
  entity.deathState.sinkFactor = f;
  return { ok: true, sinkFactor: f };
}

