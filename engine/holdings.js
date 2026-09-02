/** SNG-358 — HOLDINGS. Erik: "He has 2 warden stations and a pregnant wife and a smithy… you have
 *  fortresses, party members, businesses, etc at mid to late game."
 *
 *  ⛔ A CONDITION THAT MOVES BOTH WAYS, NOT A COUNTER TO A TERMINUS. This is the whole reason holdings
 *  could not simply be assignments: a task legitimately ends, and a holding does not. A smithy never
 *  finishes being a smithy — it thrives, or holds, or strains, or fails, and any of those can become any
 *  other. `advanceAssignment`'s monotonic `progress` + terminal `done` would have retired a holding at the
 *  moment its steward succeeded.
 *
 *  ⚠️ ONE BASE RECORD, DISCRIMINATED BY `kind`, and the evidence for that is in Erik's own save rather
 *  than in principle: his live charge reads "full reconstruction of the Raven's Home POST — laboratory,
 *  workshop, Watch, FORGE, keeper's hut." A post that CONTAINS an enterprise. Separate top-level records
 *  would split one real place into two that point at each other.
 *
 *  ⛔ HOUSEHOLD IS DELIBERATELY NOT A KIND HERE. Aevi: "stake and obligation, never a stat line — the
 *  moment a pregnant wife grants a combat bonus the game has said something false." A household has no
 *  steward, no condition that improves, and nothing it produces; putting it in this table is the first
 *  step toward it acquiring `condition: "thriving"`, which is the sentence about a family the game must
 *  never say. It is authored with Erik directly, separately, and it is not modelled here.
 */

export const HOLDING_KINDS = ["post", "enterprise"];

/** ⚠️ ORDERED WORST TO BEST — the index IS the condition, so "better"/"worse" is arithmetic rather than a
 *  lookup table that some future caller gets backwards. */
export const CONDITIONS = ["failing", "strained", "holding", "thriving"];

const clampIdx = (i) => Math.max(0, Math.min(CONDITIONS.length - 1, i));

/** The model already answers `progress | stall | problem | done` for delegated work, and answering a
 *  second vocabulary well is harder than answering one. So the same four outcomes MOVE the condition
 *  rather than naming it: the narrator keeps the question it is good at, the engine owns the meaning. */
const OUTCOME_STEP = { progress: +1, done: +1, stall: 0, problem: -1 };

export function ensureHoldings(character) {
  if (character && !Array.isArray(character.holdings)) character.holdings = [];
  return character;
}

/** Take a holding into your keeping. Idempotent on id — re-claiming a place you already hold updates it
 *  rather than minting a second one. */
export function addHolding(character, { id, kind = "post", name = null, locationId = null, steward = null, obligation = null, day = null } = {}) {
  ensureHoldings(character);
  if (!id || !HOLDING_KINDS.includes(kind)) return null;
  let h = character.holdings.find(x => x.id === id);
  if (!h) {
    h = { id, kind, name: name || id, locationId, steward, obligation, condition: "holding", claimedDay: day, lastMovedWorldCount: null, history: [] };
    character.holdings.push(h);
  } else {
    if (name) h.name = name;
    if (locationId) h.locationId = locationId;
    if (steward !== null) h.steward = steward;
    if (obligation) h.obligation = obligation;
  }
  return h;
}

/** ⛔ AN UNSTEWARDED HOLDING CANNOT THRIVE. This is the failure state that makes a holding a claim on your
 *  attention rather than scenery: nobody is keeping it, so the best it can do is hold, and it drifts down.
 *  It is also what makes SNG-355's company work matter — a castellan who DEPARTS leaves a post behind. */
/** ⛔ SNG-356 · PRESENCE 14 AND 18 — STANDING KEEPS A PLACE YOU ARE NOT STANDING IN.
 *
 *  ⚠️ `effects` IS THE LIVE MILESTONE MAP (`ladder.milestoneEffects(...).live`), keyed by `kind` — not a
 *  rank and not a sub-attribute. The gate reads what the ladder AUTHORED, so Aevi can move the rank, or
 *  hang the same effect off a different sub, without touching this file.
 *
 *  `unstewardedFloor` (presence 14) — an unkept holding stops decaying. It still cannot THRIVE: nobody is
 *  there. ⚠️ SNG-355's company work stays load-bearing at 14 — a steward is still the only road up.
 *  `unstewardedCeiling` (presence 18) — the clamp lifts, and a place with no keeper can climb on the
 *  strength of the name alone. */
export function advanceHolding(holding, outcome, worldCount = null, note = null, effects = null) {
  if (!holding) return null;
  const step = OUTCOME_STEP[outcome];
  if (step === undefined) return holding;                    // unknown outcome — leave it rather than corrupt it
  // ⚠️ ONE STEP PER PASS, AND MY FIRST FORMULA TOOK TWO. It read
  //   `Math.min(step,0) - (step > 0 ? 0 : 1)`, which for an unkept holding turned a single `problem` into
  //   −2 — "holding" straight past "strained" to "failing" in one tick. A decline the player cannot see
  //   coming is not a consequence, it is a rug-pull; the whole point of four rungs is that it slides.
  const unstewarded = !holding.steward;
  // ⛔ PRESENCE 18 — the name climbs it. With `unstewardedCeiling` live, an unkept holding advances like
  // any other; the ceiling below lifts with it, or raising the floor would be the only visible effect.
  const mayClimb = !!effects?.unstewardedCeiling;
  const applied = (unstewarded && !mayClimb) ? Math.min(step, 0) : step;   // unkept never climbs; it only holds or slips
  let next = clampIdx(CONDITIONS.indexOf(holding.condition) + applied);
  // …and it can never sit above "holding" however well things go — nobody is there to make it thrive.
  // ⛔ PRESENCE 14 — THE FLOOR. An unkept holding cannot fall below `holding`; the name keeps it standing.
  // ⚠️ FLOOR FIRST, THEN CEILING, and the order matters: at 18 the ceiling is gone and the floor is all
  // that remains, so applying the ceiling afterwards would clamp a thriving place straight back down.
  if (unstewarded && effects?.unstewardedFloor) {
    next = Math.max(next, CONDITIONS.indexOf(effects.unstewardedFloor.condition || "holding"));
  }
  if (unstewarded && !mayClimb) next = Math.min(next, CONDITIONS.indexOf("holding"));
  const before = holding.condition;
  holding.condition = CONDITIONS[next];
  holding.lastMovedWorldCount = worldCount;
  if (before !== holding.condition || note) {
    holding.history = [...(holding.history || []), { at: worldCount, from: before, to: holding.condition, note: note || null }].slice(-12);
  }
  return holding;
}

/** Did this change deserve telling? ⚠️ Only a CHANGE of condition is news — a holding that goes on holding
 *  is not an event, and reporting every quiet pass is how a player learns to skip the news (SNG-366). */
export function holdingNews(holding, before, effects = null) {
  if (!holding || holding.condition === before) return null;
  const worse = CONDITIONS.indexOf(holding.condition) < CONDITIONS.indexOf(before);
  const where = holding.name || holding.id;
  // ⚠️ AEVI: "— it has no keeper" and "nobody is keeping it" READ WRONG for a place prospering in the
  // player's name. At presence 18 an unkept holding can thrive, and the news would still be calling it
  // abandoned. ⛔ The absence of a steward stops being the story once standing is doing the keeping.
  const namedKeeps = !!effects?.unstewardedCeiling;
  const unkept = !holding.steward && !namedKeeps;
  if (holding.condition === "failing") return `${where} is failing${unkept ? " — nobody is keeping it" : ""}.`;
  if (worse) return `${where} has slipped to ${holding.condition}${unkept ? " — it has no keeper" : ""}.`;
  // ✅ AND THE THING THAT IS NEW: a place with no keeper CLIMBING, on the name alone.
  if (!holding.steward && namedKeeps) return `${where} is ${holding.condition} — kept by your name, not your presence.`;
  return `${where} is ${holding.condition} again.`;
}

/** The GM's view: what you hold, who keeps it, and how it fares. */
/** ⛔ SNG-356 · PRESENCE 20 — THE OBLIGATION INVERTS. `— owes: X` becomes `— X draws standing from your
 *  holding of it`. ⚠️ NARRATIVE, NOT NUMERIC: nothing is discharged mechanically and no cost is removed.
 *  What changes is who is beholden, which is the whole of "the name is a power in the world". */
export function holdingsForGM(character, effects = null) {
  ensureHoldings(character);
  if (!character.holdings.length) return null;
  return character.holdings.map(h =>
    `- ${h.name} (${h.kind}, ${h.condition}${h.steward ? `, kept by ${h.steward}` : (effects?.unstewardedCeiling ? ", kept by your name" : ", UNKEPT")})`
    + (h.obligation
      ? (effects?.obligationDischarged
        ? ` — ${h.obligation}: they draw standing from your holding of it, not the reverse`
        : ` — owes: ${h.obligation}`)
      : "")
  ).join("\n");
}

/** ⚠️ A DEPARTED STEWARD LEAVES THE POST BEHIND. SNG-355 made departure a status rather than a deletion,
 *  which is exactly what lets this be expressible: the holding remembers who kept it and knows they are
 *  gone. Returns the holdings whose keeper has left. */
export function unstewardedHoldings(character, activeIds = []) {
  ensureHoldings(character);
  const active = new Set(activeIds);
  return character.holdings.filter(h => h.steward && !active.has(h.steward));
}
