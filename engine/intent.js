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

// SNG-188 §4: a label whose GOVERNING (leading) verb is a speech verb is DISCUSSING a journey, not
// making it — "announce travel plans to Cairnhold" is not "travel to Cairnhold" however many places
// it names. Anchored at the start (optionally after I/I'll/let's/we) so it reads the governing verb.
const SPEECH_ACT = /^\s*(?:i(?:'?ll|'?m|'?d| will| am| would)?\s+(?:want to |going to |plan to |mean to |need to )?|let'?s\s+|we(?:'?ll| will)?\s+)?(announc\w*|tell\w*|say|saying|said|speak\w*|talk\w*|confid\w*|discuss\w*|propos\w*|promis\w*|mention\w*|explain\w*|suggest\w*|reassur\w*|admit\w*|confess\w*|declar\w*|inform\w*|warn\w*|ask|asking|asks|chat\w*|whisper\w*|shar\w*)\b/i;

/** PURE. Is this action label a SPEECH act about travel rather than travel itself? SNG-188 §4 — the
 *  code belt behind the parser prompt: a `travelTo` the model set on "announce/confide/discuss …
 *  travel plans" is caught here before buildTravelDirective can force a move. Reads the governing verb. */
export function isSpeechAct(label) {
  return SPEECH_ACT.test(String(label || "").trim());
}

// SNG-228: signals that a `travelTo` names a PERSON, not a place. TITLES that precede a name, and verbs that
// almost always take a person as their object (you CATCH/CONFRONT/GREET a person, not a road). "find/reach/
// stop" are excluded — they take places too, so they can't disambiguate. Twin of SPEECH_ACT.
const PERSON_TITLE = "warden|clerk|clerk-warden|lord|lady|ser|sir|captain|elder|master|mistress|guard|scout|keeper|reverend|dame|goodman|goodwife|councillor|magistrate";
const PERSON_VERB = "catch|confront|intercept|greet|warn|question|corner|speak to|talk to|meet with|apprehend";

/** PURE. A trusted `travelTo` that resolves to NO real place — is it actually a PERSON, not a destination?
 *  The code belt behind the §3a parser prompt, twin of isSpeechAct (the SNG-188 belt). A person is signalled
 *  by: a match in the NPC registry, a TITLE before the name in the action's words, or a person-only VERB
 *  reaching them. Returns { isPerson, destId } — destId is the person's PLACE when it's recoverable from a
 *  registered NPC's status (§3c: travel THERE, not to the person), else null (a person with no known place is
 *  never a destination — never mint a phantom person-place). A plain new PLACE returns { isPerson:false }.
 *  ctx: { npcRegistry:{}, locations:{} }. */
export function personDestination(ref, action = {}, ctx = {}) {
  const name = String(ref || "").trim(); if (!name) return { isPerson: false };
  const esc = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const eq = (a, b) => { a = String(a || "").toLowerCase().trim(); b = String(b || "").toLowerCase().trim(); return !!a && !!b && (a === b || a.includes(b) || b.includes(a)); };
  const npc = Object.values(ctx.npcRegistry || {}).find(n => n && (eq(n.name, name) || (n.aliases || []).some(a => eq(a, name))));
  const words = `${action.label || ""} ${action.exactWords || ""}`.toLowerCase();
  const titled = new RegExp(`\\b(?:${PERSON_TITLE})\\s+${esc}\\b`).test(words);
  const reached = new RegExp(`\\b(?:${PERSON_VERB})\\b[^.!?]*\\b${esc}\\b`).test(words);
  if (!npc && !titled && !reached) return { isPerson: false };
  // §3c: recover WHERE a registered person is, from their status prose (best-effort) — travel to the PLACE.
  if (npc && npc.statusNote) {
    const sn = String(npc.statusNote).toLowerCase();
    const at = Object.values(ctx.locations || {}).find(l => String(l.name || "").length > 3 && sn.includes(String(l.name).toLowerCase()));
    if (at) return { isPerson: true, destId: at.id };
  }
  return { isPerson: true, destId: null };
}

/** PURE. Should a departure gate fire for this travel intent? SNG-188: travel is OFFERED, never
 *  imposed (§4.1, the same contract lethal encounters carry). The gate now FAILS CLOSED — an
 *  unresolvable origin or destination is the case where the engine knows LEAST about the consequence
 *  of moving, so it ASKS rather than skipping (the old fail-OPEN here is exactly why Silas was
 *  relocated: his origin, an unrecorded warden post, did not resolve). It gates any CONSEQUENTIAL
 *  move — crossing a region, or a journey to a place not directly connected to where they stand —
 *  while an adjacent step in the same region proceeds without a prompt (acceptance §2: a real
 *  departure is not a nag). Returns null only when there is no travel intent, or the move is an
 *  ordinary adjacent step. The gate runs BEFORE the GM is called. */
export function departureGateFor(travelIntent, character, locations) {
  if (!travelIntent || (!travelIntent.destId && !travelIntent.ref)) return null; // not a travel intent
  const here = locations?.[character?.currentLocationId];
  const there = travelIntent.destId ? locations?.[travelIntent.destId] : null;
  const fromRegion = here?.regionId || here?.region || null;
  const toRegion = there?.regionId || there?.region || null;
  const destName = travelIntent.name || there?.name || travelIntent.ref || "there";
  const pretty = (r) => String(r).replace(/_/g, " ");
  const ask = (act, cost) => ({
    kind: "departure", act, cost,
    options: [{ id: "go", label: `Take the road to ${destName}` }, { id: "stay", label: "Stay here for now" }],
    default: "stay"
  });

  // §4.2 FAIL CLOSED — origin or destination the engine cannot resolve is a reason to ASK, not to skip
  // asking. Name what it could not pin down, so the choice is honest rather than a silent relocation.
  if (!there || !fromRegion || !toRegion) {
    return ask(
      `Set out for ${destName}? ${!there ? "The way there isn't certain from here" : "where you stand isn't fixed on the map"} — leaving is a real journey, so it is yours to choose.`,
      "Travel takes hours on the road, and the scene here ends."
    );
  }

  // §5 same-region travel is still travel. CONSEQUENTIAL = a region crossing OR a place not directly
  // connected to where they stand (a journey, not a step). An adjacent place in the same region is an
  // ordinary step and does not gate — that is what keeps a genuine departure from becoming a nag.
  const crossing = fromRegion !== toRegion;
  const adjacent = (here?.connections || []).includes(travelIntent.destId);
  if (!crossing && adjacent) return null;

  return ask(
    crossing
      ? `${destName} lies in ${pretty(toRegion)} — beyond ${pretty(fromRegion)}. Set out?`
      : `${destName} is a journey from here, not a step across the room. Set out?`,
    "Leaving is a real journey: hours on the road, and the scene here ends."
  );
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
