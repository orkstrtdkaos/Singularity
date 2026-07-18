// intent.js — SNG-145: INTENT CONFIRMATION FOR COSTLY ACTS (Law 9 extended into
// the play loop). Character creation already works this way: choices accumulate,
// nothing commits until the player confirms. This module brings the same shape to
// any in-play act with irreversible or world-scale cost.
//
// THE ESCROW SHAPE (no turn is ever held mid-flight — applyTurn is synchronous):
// nothing is rolled, spent, or committed until the player answers. The engine
// gates BEFORE the act (onChoice, pre-dice) or BEFORE propagation (the shared
// ledger), never after the narration — so a decline never contradicts fiction.
//   - harm:        a lethal-harmRung ability is DECLARED → gate before the roll.
//   - departure:   a travel intent crosses a REGION boundary → gate before the GM
//                  is called (the always-emit moveTo contract is never touched).
//   - irreversible: a world-scale ledgerEvent with impactsLocal reaches ANOTHER
//                  player → the event holds in escrow; narration stands, the
//                  shared-world propagation waits for confirm.
// LENIENT BY CONSTRUCTION: a dropped confirmation, closed tab, or timeout commits
// NOTHING — and nothing is the gentle branch (the target lives, the character
// stays, the event never propagates). The gate never kills by inaction.
//
// THE GATE MUST BE RARE (the SNG-043/077 lesson: a hint that fires every turn is
// a hint nobody reads): three triggers only, each deduped — harm once per
// encounter/scene, departure only on a real region crossing, irreversible only on
// impactsLocal. All gates fail OPEN on missing data (a null regionId is "no
// gate", never "a boundary").

export const INTENT_KINDS = ["harm", "departure", "irreversible"]; // registry:internal

/** PURE. Should a harm gate fire for this declared action? Fires when any used
 *  ability's harmRung is `lethal`, the player hasn't already answered (rung
 *  carried on the choice), and this encounter/scene hasn't asked yet.
 *  `askedKey` scopes the dedupe: never twice in one encounter (spec §2). */
/** PURE. The harm rung an ability actually carries AT THE RANK THE CHARACTER HOLDS.
 *  SNG-147c moved the canonical rung per-rank into `ab.tree[]` ({rank, grants, harmRung, …});
 *  the top-level `harmRung` is the ability's ceiling. Gating on the ceiling would fire on a
 *  rank-1 use of a craft that only turns lethal at rank 3 — a false gate, and this gate is only
 *  honest if it is rare. Falls back to the top-level rung when no per-rank entry exists. */
export function rungAtRank(ab, level = 1) {
  if (!ab) return null;
  const entry = (ab.tree || []).find(t => Number(t.rank) === Number(level));
  return entry?.harmRung ?? ab.harmRung ?? null;
}

export function harmGateFor(abilityIds, catalog, askedKey, asked = {}, ownedLevels = {}) {
  if (!abilityIds?.length) return null;
  if (askedKey && asked?.[askedKey]) return null;
  const lethal = abilityIds.map(id => catalog?.[id])
    .find(ab => ab && rungAtRank(ab, ownedLevels?.[ab.id] ?? 1) === "lethal");
  if (!lethal) return null;
  return {
    kind: "harm",
    act: `${lethal.name} is a killing craft — this cast can END a life.`,
    cost: "A death is permanent in this world: it travels as deeds, reputation, and consequence.",
    options: [
      { id: "incapacitate", label: "Put them down, not out" },
      { id: "lethal", label: "End it" }
    ],
    default: "incapacitate",
    askedKey: askedKey || null
  };
}

/** PURE. Should a departure gate fire for this travel intent? Only on a REAL
 *  region crossing — in-location and intra-region movement never gates, so the
 *  moveTo always-emit discipline is untouched (the gate runs BEFORE the GM is
 *  even called). Fails open when either region is unknown; a minted destination
 *  inherits the origin's region (app.mintTransitLocation) so it can never
 *  spuriously read as a crossing. */
export function departureGateFor(travelIntent, character, locations) {
  if (!travelIntent?.destId) return null; // unresolvable destination → no gate (fail open)
  const here = locations?.[character?.currentLocationId];
  const there = locations?.[travelIntent.destId];
  const fromRegion = here?.regionId || here?.region || null;
  const toRegion = there?.regionId || there?.region || null;
  if (!fromRegion || !toRegion || fromRegion === toRegion) return null;
  const pretty = (r) => String(r).replace(/_/g, " ");
  return {
    kind: "departure",
    act: `${travelIntent.name || "That road"} lies in ${pretty(toRegion)} — beyond ${pretty(fromRegion)}.`,
    cost: "Leaving the region is a real journey: hours on the road, and the scene here ends.",
    options: [
      { id: "go", label: `Take the road to ${travelIntent.name || pretty(toRegion)}` },
      { id: "stay", label: "Hold here for now" }
    ],
    default: "stay"
  };
}

/** PURE. Validate a GM-emitted offerIntent op (the fiction-recognized cases the
 *  engine's declared-ability gates can't see — a strangling in freetext, a
 *  point-of-no-return the GM names). Repair-not-wish discipline: bad shape → null
 *  (no gate), never a guessed gate. */
export function sanitizeOfferIntent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = INTENT_KINDS.includes(raw.kind) ? raw.kind : null;
  if (!kind) return null;
  const options = (Array.isArray(raw.options) ? raw.options : [])
    .filter(o => o && o.id && o.label)
    .slice(0, 4)
    .map(o => ({ id: String(o.id).slice(0, 40), label: String(o.label).slice(0, 120) }));
  if (options.length < 2) return null;
  const def = options.some(o => o.id === raw.default) ? raw.default : options[options.length - 1].id;
  return {
    kind,
    act: String(raw.act || "").slice(0, 300) || "Something with real cost is about to happen.",
    cost: String(raw.cost || "").slice(0, 300),
    options,
    default: def,
    fromGM: true
  };
}

/** PURE. The directive the GM receives once an intent is confirmed — appended to
 *  the resolution so narration honors the choice. */
export function intentNoteFor(gate, optionId) {
  const opt = (gate?.options || []).find(o => o.id === optionId);
  const label = opt?.label || optionId;
  if (gate?.kind === "harm") {
    return optionId === "lethal"
      ? `INTENT CONFIRMED — LETHAL: the player chose to kill ("${label}"). The blow may end the target; narrate honestly at the rating, and record the death's weight.`
      : `INTENT CONFIRMED — SUBDUE: the player chose to spare ("${label}"). The target SURVIVES this beat — put them down, not out; no narration may kill them.`;
  }
  return `INTENT CONFIRMED: the player chose "${label}". Proceed within that choice — nothing else was decided for them.`;
}

/** PURE. Split a turn's ledger events into {pass, hold}: impactsLocal events
 *  reach ANOTHER player's area, so they wait in escrow for the player's confirm
 *  (SNG-145 trigger 3). Ordinary events pass straight through. */
export function splitLedgerEvents(events) {
  const pass = [], hold = [];
  for (const e of events || []) (e.impactsLocal ? hold : pass).push(e);
  return { pass, hold };
}
