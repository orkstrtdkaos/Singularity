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
export function advanceHolding(holding, outcome, worldCount = null, note = null) {
  if (!holding) return null;
  const step = OUTCOME_STEP[outcome];
  if (step === undefined) return holding;                    // unknown outcome — leave it rather than corrupt it
  // ⚠️ ONE STEP PER PASS, AND MY FIRST FORMULA TOOK TWO. It read
  //   `Math.min(step,0) - (step > 0 ? 0 : 1)`, which for an unkept holding turned a single `problem` into
  //   −2 — "holding" straight past "strained" to "failing" in one tick. A decline the player cannot see
  //   coming is not a consequence, it is a rug-pull; the whole point of four rungs is that it slides.
  const unstewarded = !holding.steward;
  const applied = unstewarded ? Math.min(step, 0) : step;      // unkept never climbs; it only holds or slips
  let next = clampIdx(CONDITIONS.indexOf(holding.condition) + applied);
  // …and it can never sit above "holding" however well things go — nobody is there to make it thrive.
  if (unstewarded) next = Math.min(next, CONDITIONS.indexOf("holding"));
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
export function holdingNews(holding, before) {
  if (!holding || holding.condition === before) return null;
  const worse = CONDITIONS.indexOf(holding.condition) < CONDITIONS.indexOf(before);
  const where = holding.name || holding.id;
  if (holding.condition === "failing") return `${where} is failing${holding.steward ? "" : " — nobody is keeping it"}.`;
  if (worse) return `${where} has slipped to ${holding.condition}${holding.steward ? "" : " — it has no keeper"}.`;
  return `${where} is ${holding.condition} again.`;
}

/** The GM's view: what you hold, who keeps it, and how it fares. */
export function holdingsForGM(character) {
  ensureHoldings(character);
  if (!character.holdings.length) return null;
  return character.holdings.map(h =>
    `- ${h.name} (${h.kind}, ${h.condition}${h.steward ? `, kept by ${h.steward}` : ", UNKEPT"})${h.obligation ? ` — owes: ${h.obligation}` : ""}`
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
