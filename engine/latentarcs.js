// latentarcs.js — SNG-191 §7, the generation turn: the world has its OWN agenda. Arcs FOMENT on the
// world count whether or not anyone has seen them, and SURFACE at thresholds as a face, a changed
// place, a rumour now specific enough to repeat. Discovery is a LATE event in a thing that has been
// building — never its beginning. This is the PROACTIVE half generateRequest deliberately left unbuilt
// (that op is reactive-only: the world does not spawn on its own there; here it does).
//
// INVARIANTS: ATTRIBUTABLE — every arc carries a CAUSE that existed before it surfaced, so nothing
// springs from nothing at the moment of contact (§7 inv2 — the difference between a living world and a
// random-encounter table). NOT-EVERYTHING-IS-THE-PLAYER'S — an arc may complete with no involvement,
// and sometimes the player learns only that it happened (§7 inv3, §7.3's middle fate). UNGUARDRAILED —
// an arc may grow as far as its own logic takes it, no ceiling (§7 inv1). REGIONAL — an arc belongs to
// a place and its people. Pure: no DOM, no fetch, no clock — the caller passes the count and an rng.

import { smartClamp } from "./namematch.js"; // SNG-152: model text clamps on a word boundary

const STAGE_COUNTS = 48;      // ~2 real days of world count (≈1/hour) foment one stage — coarse enough to matter
const SURFACE_AT = 2;         // a couple of stages in, an arc is specific enough to be MET
const RESOLVE_CHANCE = 0.22;  // §7.3: sometimes, untended, the world solves its own problem before you arrive

export function ensureLatentArcs(worldState) {
  if (!worldState.latentArcs) worldState.latentArcs = {};
  return worldState.latentArcs;
}

/** Seed a latent arc with a CAUSE (§7 inv2). It begins fomenting now, it is not the player's, and it
 *  has not surfaced. Idempotent by id — re-seeding an existing arc leaves it untouched. */
export function seedArc(worldState, { id, regionId, kind, premise, cause } = {}, worldCount = 0) {
  if (!id || !regionId || !premise) return null;
  const arcs = ensureLatentArcs(worldState);
  if (arcs[id]) return arcs[id];
  arcs[id] = {
    id, regionId, kind: kind || "tension",
    premise: smartClamp(String(premise), 200),
    cause: smartClamp(String(cause || "the disposition of the place"), 160),
    stage: 0, seededAtCount: worldCount, surfaced: false, fate: "growing", lastMovedCount: worldCount
  };
  return arcs[id];
}

/** Foment an arc by the world count elapsed. Unattended it GROWS (unguardrailed — no ceiling on how far)
 *  — OR the world quietly solves its own problem and it RESOLVES with no player involvement (§7.3, the
 *  fate that keeps the world from being hero-dependent). rng is injected so tests are deterministic. A
 *  surfaced or handled or already-resolved arc is left alone. Returns the arc. */
export function fomentArc(arc, elapsedCount, rng = Math.random, worldCount = 0) {
  if (!arc || arc.fate === "resolved" || arc.fate === "handled") return arc;
  const steps = Math.max(0, Math.floor((elapsedCount || 0) / STAGE_COUNTS));
  if (steps <= 0) return arc;
  for (let i = 0; i < steps; i++) {
    if (!arc.surfaced && rng() < RESOLVE_CHANCE) { arc.fate = "resolved"; break; } // solved before you ever met it
    arc.stage += 1; // grows — unguardrailed
  }
  arc.lastMovedCount = worldCount;
  return arc;
}

/** Arcs fomented enough to be MET but not yet surfaced (and still growing). §7.2: surfacing is the
 *  player's FIRST contact, not the arc's beginning. */
export function surfaceableArcs(worldState) {
  return Object.values(worldState?.latentArcs || {}).filter(a => !a.surfaced && a.fate === "growing" && a.stage >= SURFACE_AT);
}

/** The player has made first contact — the arc is now live in front of them (§7.4: content, not alert). */
export function markSurfaced(arc, worldCount = 0) { if (arc) { arc.surfaced = true; arc.surfacedAtCount = worldCount; } return arc; }
// NOTE: the third fate — "handled", the player intervening — needs an intervention-capture path (a GM
// op or a resolution heuristic on a surfaced arc) that is a Phase-E follow-on. The two automatic fates
// (grows / resolves-itself) and surfacing are wired here; arcsForGM already respects a `handled` fate
// the moment that trigger lands, so the model is ready for it.

/** The GM's view: arcs the player has met that are still live, so the GM can develop them into the
 *  person / place / thread they surfaced as. Null when nothing is live (costs nothing then). */
export function arcsForGM(worldState) {
  const live = Object.values(worldState?.latentArcs || {}).filter(a => a.surfaced && a.fate === "growing");
  if (!live.length) return null;
  return live.map(a => `- ${a.premise} (${a.kind}, stage ${a.stage}${a.regionId ? `, in ${String(a.regionId).replace(/_/g, " ")}` : ""})`).join("\n");
}
