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
  const days = (currentDay != null && ds.diedDay != null) ? Math.max(0, currentDay - ds.diedDay) : 0;
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
    if ((currentDay - ds.diedDay) >= cfg.sealAfterDays) { ds.sealed = true; sealed.push(e); }
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
  const consider = (name, e) => {
    if (!name || !isRetrievable(e, day)) return;
    const d = deathDepth(e, day);
    out.push({ name, depth: d, wall: DEATH_DEPTH_NAMES[d], cause: e.deathState?.cause || null });
  };
  for (const f of (content.legends?.roster || [])) consider(f.name, character?.worldState?.epicStatus?.[f.id]);
  for (const n of Object.values(character?.npcRegistry || {})) if (n && typeof n === "object") consider(n.name, n);
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
