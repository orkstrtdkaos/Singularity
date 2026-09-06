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

import { debit, credit } from "./purse.js";        // Q8: upkeep leaves the purse, a sold store enters it · Q5-B: settling pays
import { regionDemand } from "./economy.js";       // Q8: a unit is worth what THIS Reach wants it for
import { sheetFor as personSheetFor, tierOf as tierOfLevel } from "./npcsheet.js";   // Q18 → v2 §1: the keeper's tier sets the FLOOR
import { locationDensity } from "./substrate.js";   // Q18: the ground scales an enterprise's yield
import { legionClash, contingentsFromPeople } from "./melee.js";   // R46a: a detected raid is a FIGHT, resolved unattended
import { smartClamp } from "./namematch.js";   // an evidence quote is prose — cut at a word, never mid-word
import { isNetworkGate } from "./waygate.js";   // runner fees: a NETWORK gate near a relay post brings traffic
import { walkingDays } from "./worldmap.js";     // …within gateWithinDays of it

export const HOLDING_KINDS = ["post", "enterprise"];
/** ⚠️ WHICH SIDE AN UNKNOWN WORD FALLS ON. A holding that PRODUCES is an enterprise; everything else holds
 *  ground and is a post — which is the safe default, because a post costs no upkeep and cannot bankrupt
 *  someone for a word the GM chose. ⛔ Deliberately short: this is a tiebreaker, not a taxonomy. */
/** ⛔ WORDS THAT NAME SOMETHING THAT IS NOT A PLACE. Refused outright, never coerced — SNG-358, and Aevi's
 *  rule that a family is not a holding. ⚠️ This is the line between "the fiction called it a waystation"
 *  (a description of a place, kept) and "the fiction called it a household" (not a place at all). */
const NOT_A_HOLDING = ["household", "family", "kin", "person", "people", "company", "band", "retinue"];
const ENTERPRISE_WORDS = ["mine", "forge", "mill", "quarry", "workshop", "smithy", "kiln", "fishery", "farm", "works", "enterprise"];

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
export function addHolding(character, { id, kind = "post", name = null, locationId = null, steward = null, obligation = null, day = null, fromAssignment = null, rename = false } = {}) {
  ensureHoldings(character);
  if (!id) return null;
  // ⚠️ AN UNKNOWN KIND IS A DESCRIPTION, NOT A REFUSAL. `post` and `enterprise` are the mechanical
  // dichotomy — one holds ground, the other produces — and the fiction will always have richer words:
  // a waystation, a forge, a relay, a shrine-house. ⛔ Dropping a claim because the GM said "waystation"
  // cost Erik the Whistling Woman Post three times over, silently. The word is KEPT as `describedAs` and
  // the record is filed under the kind it behaves like.
  const said = String(kind || "").toLowerCase();
  // ⛔ AND SOME WORDS ARE STILL REFUSED, because the refusal is about AUTHORITY rather than vocabulary:
  // SNG-358 — a household is not a holding, and "a family is not a holding" is Aevi's line. These name
  // something that is NOT A PLACE, and coercing one into a post would let the GM claim a family as ground.
  if (NOT_A_HOLDING.some(w => said.includes(w))) return null;
  const describedAs = HOLDING_KINDS.includes(said) ? null : (String(kind || "").trim() || null);
  if (!HOLDING_KINDS.includes(said)) kind = ENTERPRISE_WORDS.some(w => said.includes(w)) ? "enterprise" : "post";
  else kind = said;
  let h = character.holdings.find(x => x.id === id);
  if (!h) {
    // ⛔ THE LINK LIVES ON THE HOLDING, NOT THE ASSIGNMENT. The assignment is FINITE — it has a `done` —
    // and the holding is not. ⚠️ A field on the terminal record is lost exactly when the relationship
    // becomes interesting: the moment the work completes is the moment you want to know what it built.
    // ⛔ AND NOT A DERIVED JOIN on npcId + charge — that works today and breaks the first time a steward
    // is replaced, which is precisely the event SNG-355 exists to model.
    h = { id, kind, name: name || id, locationId, steward, obligation, condition: "holding", claimedDay: day, lastMovedWorldCount: null, history: [], ...(describedAs ? { describedAs } : {}), ...(fromAssignment ? { fromAssignment } : {}) };
    character.holdings.push(h);
  } else {
    // ⛔ Erik 2026-09-05: "Stillwater's Trouble was named such, but it reverted back to Raven's Home almost immediately." The
    // narrator re-claims a known hold every few turns with the name it sees in its own block, and this line took it. A name
    // is the player's; a re-claim keeps it unless the op says `rename`.
    if (name && (rename || !h.name)) h.name = name;
    if (describedAs && !h.describedAs) h.describedAs = describedAs;
    if (locationId) h.locationId = locationId;
    if (steward !== null) h.steward = steward;
    if (obligation) h.obligation = obligation;
    if (fromAssignment && !h.fromAssignment) h.fromAssignment = fromAssignment;
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
  // ⛔ THE KEEPER IS THE REASON IT DOES NOT FALL (PROPOSAL_delegate_tiers v2 §1, Erik: "floors not ceilings"). A kept
  // hold does not drop below its keeper's floor — a notable keeper holds a place at `holding` through a raid; a
  // riffraff keeper's floor is `strained`. The tick computes it from the keeper's tier and hands it in as an effect.
  if (!unstewarded && effects?.keeperFloor && CONDITIONS.includes(effects.keeperFloor)) next = Math.max(next, CONDITIONS.indexOf(effects.keeperFloor));
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
export function holdingsForGM(character, effects = null, { hereId = null, nameOf = null } = {}) {
  // ⛔ SPEC_holding_attributes — the narrator is told when the character is STANDING IN a place they hold, and each
  // holding arrives as its sentence. A messenger from the post is one thing; being at the post is another.
  const here = new Set(holdingsAt(character, hereId).map(h => h.id));
  ensureHoldings(character);
  if (!character.holdings.length) return null;
  return character.holdings.map(h =>
    `- ${h.name} (${h.kind}, ${h.condition}${h.steward ? `, kept by ${h.steward} (${delegateScope(character, h.steward) === "charge" ? "in charge" : "keeping"}${character?.npcRegistry?.[h.steward]?.vouchedBy ? `, vouched by ${character.npcRegistry[h.steward].vouchedBy}` : ""})` : (effects?.unstewardedCeiling ? ", kept by your name" : ", UNKEPT")})${here.has(h.id) ? " — YOU ARE STANDING IN IT" : ""}${storeTotal(h) > 0 ? ` · store: ${Object.entries(h.store).filter(([, n]) => n > 0).map(([g, n]) => `${n} ${g}`).join(", ")}` : ""}${h.arrears ? ` · in arrears ${h.arrears}` : ""}${(h.crew || []).length ? ` · hands: ${h.crew.map(id => nameOf ? nameOf(id) : id).join(", ")}` : ""}${(h.garrison || []).length ? ` · guarded by ${h.garrison.map(id => nameOf ? nameOf(id) : id).join(", ")}` : ""}${(h.improvements || []).length ? ` · improved by ${h.improvements.map(i => i.name || i.abilityId).join(", ")}` : ""}${(h.features || []).length ? ` · has ${h.features.map(f => f.name || f.kind).join(", ")}` : ""}${h.watches ? ` · watches over ${(character?.holdings || []).find(o => o && o.id === h.watches)?.name || h.watches}` : ""} · ${holdingSentence(h, { nameOf })}`
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
export function unstewardedHoldings(character, activeIds = [], { registry = null, company = null } = {}) {
  ensureHoldings(character);
  const active = new Set(activeIds);
  return character.holdings.filter(h => h.steward && !active.has(h.steward) && keeperGone(character, h.steward, { registry, company }));
}

/** ⛔ ERIK 2026-09-05 (Silas's save): both accepted holds lost their keepers on the tick's FIRST pass. The rule was "not in
 *  the active company" — but a steward is a DELEGATE who stays at the hold; they are never in the company. Fendt and
 *  Cassiel Ord were wiped for being exactly what a keeper is. A keeper is gone only when they are gone: the registry says
 *  dead or departed, or they were a companion who LEFT (SNG-355 made departure a status — that is the case this rule was
 *  written for). Absent both records the keeper stays; the tick has no grounds to fire them. */
export function keeperGone(character, stewardId, { registry = null, company = null } = {}) {
  if (!stewardId) return false;
  const reg = registry || character?.npcRegistry || {};
  const status = String(reg?.[stewardId]?.status || "").toLowerCase();
  if (status === "dead" || status === "departed") return true;
  const roster = company || character?.company || [];
  const member = roster.find(m => m && m.npcId === stewardId);
  if (member && member.leftDay) return true;
  return false;
}

/* ═══ SPEC_holding_release_transfer — THE ONE-WAY DOOR GETS TWO EXITS, AND THEY ARE NOT THE SAME EXIT ═══
 *
 * ⛔ RELEASE EXISTED AS A BARE FILTER IN app.js (`character.holdings = holdings.filter(x => x.id !== id)`), reachable
 * by the GM through `holdingOps`, and it was the undo button §3 of the spec warns about: the obligation vanished, the
 * steward was silently un-charged, nothing was said. ⚠️ The place always persists; what changes is who answers for it.
 *
 *   release  — you walk away. The obligation stays with you, UNPAID. The steward is released. Recorded, and said once.
 *   transfer — someone else takes it up. The obligation goes WITH it. The steward may stay (assignments key on
 *              npcId::charge and never name the holder, so nothing breaks if they do).
 *
 * ⛔ THE STANDING COST IS NOT DECIDED HERE. §R2.3 left “standing, or a payable debt?” as Erik's; the record carries
 * `reason` and `obligationUnpaid` so whichever instrument he chooses has something to read. Neither exit is a
 * celebration (DESIGN_celebrations §3): they queue ONE line for the world-tick news, announced once. */

/** Queue a line the tick will say once. ⚠️ PERSISTED ON THE CHARACTER, not returned — a turn's apply-step has no
 *  news channel of its own, and the tick already owns “once, ever” for holding offers. */
function queueHoldingEvent(character, text) {
  character.holdingEvents = [...(character.holdingEvents || []), { text, announced: false }];
}

/** The tick's read: every queued line not yet said, marked said. Returns the texts. */
export function takeHoldingEvents(character) {
  const ev = (character?.holdingEvents || []).filter(e => e && !e.announced);
  for (const e of ev) e.announced = true;
  return ev.map(e => e.text);
}

/** You walk away. Returns the moved record, or null when nothing by that id is held. */
export function releaseHolding(character, id, { reason = null, day = null, worldCount = null } = {}) {
  ensureHoldings(character);
  const i = character.holdings.findIndex(h => h && h.id === id);
  if (i < 0) return null;
  const [h] = character.holdings.splice(i, 1);
  const rec = { ...h, formerHolder: character.id || null, releasedDay: day, releasedAt: worldCount, reason: reason || null,
    // ⛔ WHAT YOU OWED IS STILL OWED. Walking away does not pay it; the record says so until something does.
    obligationUnpaid: !!h.obligation, stewardReleased: h.steward || null,
    // ✅ Q8: the store goes with the place — forfeited on release, recorded so the loss is a fact and not a mystery
    storeForfeited: h.store && Object.keys(h.store).length ? { ...h.store } : null,
    history: [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `released${reason ? ` — ${reason}` : ""}` }].slice(-12) };
  character.formerHoldings = [...(character.formerHoldings || []), rec];
  // ✅ Q5-B: what it owed is now a DEBT with a holder — the steward who kept it is the person who remembers. With no
  // steward it is recorded unheld (nobody to escalate it); the GM may name a holder by `debtOps`.
  if (h.obligation) recordDebt(character, { holderId: h.obligationHolder || h.steward || null, kind: "abandoned-holding", amount: null,
    reason: `${h.name || h.id} — ${h.obligation}`, day, holdingId: h.id });
  queueHoldingEvent(character, `You have given up ${h.name || h.id}${h.obligation ? " — what it owed is still owed" : ""}${h.steward ? `, and ${h.steward} is released from keeping it` : ""}.`);
  return rec;
}

/** Someone else takes it up. `toEntity` is an npcId today (§R2.5: a community can be named in `toName` and is a
 *  narrative record — nothing in the world model can hold property yet). Returns the moved record, or null. */
export function transferHolding(character, id, { toEntity = null, toName = null, day = null, worldCount = null } = {}) {
  ensureHoldings(character);
  if (!toEntity) return null;
  const i = character.holdings.findIndex(h => h && h.id === id);
  if (i < 0) return null;
  const [h] = character.holdings.splice(i, 1);
  const rec = { ...h, formerHolder: character.id || null, transferredTo: toEntity, transferredToName: toName || null,
    transferredDay: day, transferredAt: worldCount,
    // ✅ THE OBLIGATION GOES WITH IT — that is the whole difference from release, and why a player would prefer it.
    obligationUnpaid: false, stewardStays: !!h.steward,
    storeCarried: !!(h.store && Object.keys(h.store).length),   // ✅ Q8: the store goes with the place
    history: [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `handed to ${toName || toEntity}` }].slice(-12) };
  character.formerHoldings = [...(character.formerHoldings || []), rec];
  queueHoldingEvent(character, `${h.name || h.id} is ${toName || toEntity}'s to keep now${h.obligation ? ", and what it owes goes with it" : ""}.`);
  return rec;
}

/* ═══ SPEC_holding_attributes — A HOLDING IS A MODIFIER ON A PLACE, AND THIS IS THE JOIN ═══
 *
 * ⛔ EVERY DELTA THE SPEC LISTS ALREADY EXISTS ON LOCATIONS (`substrateSource`, `dangerLevel`, `waygate`, `learnedAt`) and
 * every reader it names exists — and NONE of them can ask whether a holding sits on the place. That was the whole gap.
 * `holdingsAt` is the join. `provides` and `upkeep` are READ here before anyone authors them (reader before field):
 * a holding may carry `provides: […]` (strings from the spec's families — "worked timber", "safe harbor", "a forge") and
 * `upkeep: […]` ("a steward's wage"); with neither, the sentence is condition and keeper alone. ⚠️ NO MAGNITUDES:
 * how many kinds a hold may carry, how much, and what each costs is pass two (RULINGS OWED Q14). Nothing here
 * changes a number; it makes a holding LEGIBLE at the place it sits, which is what pass two lands on. */

/** The holdings that sit on a place. Empty for a place you hold nothing at, and for no location. */
export function holdingsAt(character, locationId) {
  if (!locationId) return [];
  ensureHoldings(character);
  return character.holdings.filter(h => h && h.locationId === locationId);
}

/** ⛔ ERIK'S HARD CONSTRAINT: a hold must be reportable in a SENTENCE. “The mine is running; the watchtower is eating it.”
 *  Built from what the record actually carries — condition, keeper, and (when authored) what it provides and what it eats. */
/** ⚑ SPEC_holdings_screen §3/§4 — THE FACTS A PLAYER SEES, the same on the list and in the popup. Everything the GM's
 *  own line already carries (holdingsForGM), player-safe: hands and guard by name, what it has, what it holds, what it
 *  owes, what it watches. Empty when there is nothing to say — a bare hold is not padded. PURE. */
export function holdingFactsLine(h, { nameOf = null, holdings = [] } = {}) {
  if (!h) return "";
  const nm = (id) => (nameOf ? nameOf(id) : null) || id;
  const parts = [];
  if ((h.crew || []).length) parts.push(`hands: ${h.crew.map(nm).join(", ")}`);
  if ((h.garrison || []).length) parts.push(`guarded by ${h.garrison.map(nm).join(", ")}`);
  if ((h.features || []).length) parts.push(`has ${h.features.map(f => f.name || f.kind).join(", ")}`);
  const store = Object.entries(h.store || {}).filter(([, n]) => Number(n) > 0);
  if (store.length) parts.push(`store: ${store.map(([g, n]) => `${n} ${String(g).replace(/_/g, " ")}`).join(", ")}`);
  if (Number(h.arrears) > 0) parts.push(`in arrears ${h.arrears}`);
  if (h.watches) parts.push(`watches over ${(holdings || []).find(o => o && o.id === h.watches)?.name || h.watches}`);
  return parts.join(" · ");
}

export function holdingSentence(h, { nameOf = null } = {}) {
  if (!h) return "";
  const name = h.name || h.id;
  const state = h.condition === "thriving" ? "is thriving" : h.condition === "holding" ? "is running"
    : h.condition === "strained" ? "is strained" : h.condition === "failing" ? "is failing" : "stands";
  const keeper = h.steward ? ` under ${nameOf ? nameOf(h.steward) : h.steward}` : " with nobody keeping it";
  const gives = Array.isArray(h.provides) && h.provides.length ? `; it provides ${h.provides.join(", ")}` : "";
  const eats = Array.isArray(h.upkeep) && h.upkeep.length ? `; it eats ${h.upkeep.join(", ")}` : "";
  return `${name} ${state}${keeper}${gives}${eats}.`;
}

/* ═══ Q5-B — A DEBT IS HELD BY A PERSON, AND THEY DECIDE (SPEC_debts_and_reception · Erik: option B, a PAYABLE debt) ═══
 * `worldState.debts[holderId]` — keyed by who is OWED, a named NPC. `releaseHolding` writes one when an obligation is walked
 * away from (held by the steward who kept it — the person who remembers); the GM records one by `debtOps`. Escalation
 * is the HOLDER's choice (`advanceDebts`): only a holder whose `reactsToReputation` carries a debtor-shaped tag acts, one
 * step per `escalateAfterDays` — the Kestrel writes it in the ledger; Ceriad shelters you anyway and thinks less of you.
 * "Nothing happens and they remember" is a legitimate outcome. It clears three ways, like `unavenged`: paid, a deed the GM
 * says outweighs it, or the holder gone. ⛔ NEVER coin — a fixed supply cannot be minted by settling. */
export function ensureDebts(character) {
  if (!character) return {};
  if (!character.worldState || typeof character.worldState !== "object") character.worldState = {};
  if (!character.worldState.debts || typeof character.worldState.debts !== "object") character.worldState.debts = {};
  return character.worldState.debts;
}

export function recordDebt(character, { holderId = null, kind = "unpaid-price", amount = null, currency = "crystal", reason = null, day = null, communityId = null, holdingId = null } = {}) {
  const debts = ensureDebts(character);
  if (!kind) return null;
  const cur = String(currency || "crystal");
  if (cur === "coin") return null;
  const key = holderId || (holdingId ? `unheld:${holdingId}` : null);
  if (!key) return null;
  const prev = debts[key] || null;
  const amt = amount === null || amount === undefined ? null : Number(amount);
  const nextAmount = amt !== null && Number.isFinite(amt)
    ? (prev && Number.isFinite(prev.amount) ? prev.amount + amt : amt)
    : (prev?.amount ?? null);
  const rec = {
    kind, amount: nextAmount, currency: cur, reason: reason || prev?.reason || null,
    sinceDay: prev?.sinceDay ?? day ?? null, heldBy: holderId || null,
    communityId: communityId || prev?.communityId || null, holdingId: holdingId || prev?.holdingId || null,
    escalation: prev?.escalation || 0, lastMovedDay: prev?.lastMovedDay ?? day ?? null,
    history: [...(prev?.history || []), { day: day ?? null, note: `${prev ? "added to" : "owed"}: ${kind}${reason ? ` — ${reason}` : ""}` }].slice(-12),
  };
  debts[key] = rec;
  return rec;
}

export function settleDebt(character, key, { how = "paid", day = null, why = null } = {}) {
  const debts = ensureDebts(character);
  const rec = debts[key];
  if (!rec) return null;
  delete debts[key];
  return { ...rec, settled: how, settledDay: day ?? null, why: why || null };
}

/** Does THIS community refuse you? An escalation-2 debt held by one of its people. The GM block reads it; `canSpendHere`
 *  is scrip-shaped and a community is not a Reach, so the refusal is narrated rather than enforced at the purse. */
export function debtRefusalAt(character, communityId) {
  if (!communityId) return null;
  for (const [key, d] of Object.entries(character?.worldState?.debts || {})) {
    if (d && d.communityId === communityId && (d.escalation || 0) >= 2) return { key, holder: d.heldBy, why: d.reason || d.kind };
  }
  return null;
}

/** The tick's pass. Pure over its inputs except the escalation it writes; returns the news it made. */
export function advanceDebts(character, { npcs = {}, cfg = null, day = null } = {}) {
  const debts = character?.worldState?.debts;
  const news = []; let moved = 0;
  if (!debts || !cfg) return { news, moved };
  const tags = new Set((cfg.escalatingTags || ["debtor"]).map(String));
  const after = Number(cfg.escalateAfterDays) || 30;
  const max = Number.isFinite(Number(cfg.maxEscalation)) ? Number(cfg.maxEscalation) : 2;
  const gone = new Set(["dead", "departed"]);
  for (const [key, d] of Object.entries(debts)) {
    if (!d || !d.heldBy) continue;                                  // nobody remembers it — it sits
    const reg = character?.npcRegistry?.[d.heldBy] || null;
    const def = npcs?.[d.heldBy] || null;
    const name = reg?.name || def?.name || d.heldBy;
    if (!d.communityId && def?.communityId) d.communityId = def.communityId;
    if (reg && gone.has(String(reg.status || ""))) {
      delete debts[key]; moved++;
      news.push(`${name} is gone, and what you owed them went with them.`);
      continue;
    }
    const react = def?.reactsToReputation || reg?.reactsToReputation || {};
    if (!Object.keys(react).some(k => tags.has(String(k)))) continue;   // they remember; they do not act
    if ((d.escalation || 0) >= max) continue;
    if (day === null || day === undefined) continue;
    if (day - (d.lastMovedDay ?? d.sinceDay ?? day) < after) continue;
    d.escalation = (d.escalation || 0) + 1; d.lastMovedDay = day; moved++;
    d.history = [...(d.history || []), { day, note: `escalation ${d.escalation}` }].slice(-12);
    const where = d.communityId ? String(d.communityId).split(".").pop().replace(/_/g, " ") : "their people";
    news.push(d.escalation === 1
      ? `${name} has not forgotten what you owe (${d.reason || d.kind}). Word of it has gone round ${where} — you will be received colder there.`
      : `${name} has had enough of waiting. You will not be sold to, hired, or sheltered in ${where} while it stands.`);
  }
  return { news, moved };
}

export function debtsForGM(character, { nameOf = null } = {}) {
  const debts = character?.worldState?.debts || {};
  const rows = Object.entries(debts).filter(([, d]) => d);
  if (!rows.length) return null;
  const word = (e) => e >= 2 ? "REFUSED there — no trade, hire or shelter" : e === 1 ? "spoken of — received colder there" : "owed, and remembered";
  return rows.map(([key, d]) => {
    const who = d.heldBy ? (nameOf ? nameOf(d.heldBy) : d.heldBy) : "nobody in particular (the place was walked away from)";
    const what = Number.isFinite(d.amount) && d.amount !== null ? `${d.amount} ${d.currency}` : d.kind;
    return `- you owe ${who}: ${what}${d.reason ? ` — ${d.reason}` : ""}${d.sinceDay != null ? ` · since day ${d.sinceDay}` : ""} · ${word(d.escalation || 0)}${d.communityId ? ` (${d.communityId})` : ""}`;
  }).join("\n");
}

/** The GM's ops: record · settle (the purse pays) · forgive (a deed outweighed it). Returns receipts, refusals said. */
export function applyDebtOps(character, ops = [], { day = null, regionId = null } = {}) {
  const out = [];
  for (const op of (Array.isArray(ops) ? ops : []).slice(0, 4)) {
    const kind = String(op?.op || "").toLowerCase();
    const key = op?.holderId || op?.npcId || null;
    if (kind === "record") {
      const r = recordDebt(character, { holderId: key, kind: op.kind || "unpaid-price", amount: op.amount ?? null, currency: op.currency || "crystal",
        reason: op.reason || op.why || null, day, communityId: op.communityId || null });
      out.push({ op: kind, ok: !!r, key, ...(r ? {} : { why: "a debt needs a holder and is never in coin" }) });
    } else if (kind === "settle") {
      const d = character?.worldState?.debts?.[key];
      if (!d) { out.push({ op: kind, ok: false, key, why: "no such debt" }); continue; }
      if (Number.isFinite(d.amount) && d.amount > 0) {
        const paid = debit(character, d.currency || "crystal", d.amount, { regionId });
        if (!paid.ok) { out.push({ op: kind, ok: false, key, why: paid.why }); continue; }
      }
      settleDebt(character, key, { how: "paid", day });
      out.push({ op: kind, ok: true, key, paid: Number.isFinite(d.amount) ? d.amount : 0 });
    } else if (kind === "forgive") {
      const r = settleDebt(character, key, { how: "deed", day, why: op.why || op.reason || null });
      out.push({ op: kind, ok: !!r, key, ...(r ? {} : { why: "no such debt" }) });
    }
  }
  return out;
}

/* ═══ Q8 — THE HOLD STORE: it runs itself, you boost it, and it can be robbed (SPEC_hold_store) ═══
 * `holding.store = { goods: units }` accumulates AT the hold on the tick — yield by condition (the curve is steep: thriving
 * is an asset, holding near break-even, strained a subsidy, failing a drain), upkeep from the purse, and a full store is a
 * target (a raid arrives as news and takes a share; an authored `defence`/`garrison` halves the chance). A unit is worth
 * `worthBands[unitWorthBand] × need × scarcity` where it is SOLD, so the same ore is worth more where it is wanted. You
 * sell where the store stands; moving it is the spec's open question and nothing models it yet. Readers before fields:
 * `holding.yields` (a goods kind), `holding.upkeepCost`, `holding.defence`/`garrison` — authored on a record, they win. */
export function yieldFor(holding, cfg, { density = null } = {}) {
  if (!holding || !cfg) return null;
  const goods = holding.yields || (cfg.defaultYield || {})[holding.kind] || null;
  if (!goods) return null;
  const base = Number((cfg.yieldByCondition || {})[holding.condition]);
  if (!Number.isFinite(base)) return null;
  // ✅ Q18 (SPEC_hold_store §5): more hands, more capacity; a hold on good ground yields better. Both are content.
  const g = cfg.growth || {};
  const hands = Math.min(handsCap(holding, cfg), (holding.crew || []).length);
  const handsMult = 1 + hands * (Number(g.handsYieldBonus) || 0);
  // ⚠️ null is "unmeasured", not 0 — `Number(null)` is 0 and would scale every hold with no known ground by ×0.75
  const groundMult = density !== null && density !== undefined && Number.isFinite(Number(density)) && Number.isFinite(Number(g.groundYieldWeight))
    ? Math.max(0.5, 1 + Number(g.groundYieldWeight) * (Number(density) - 0.5)) : 1;
  const units = base > 0 ? Math.max(1, Math.round(base * handsMult * groundMult)) : 0;
  return { goods: String(goods), units, base, hands, handsMult, groundMult: Math.round(groundMult * 100) / 100 };
}
/** A hold is guarded by an authored `defence`, or by a garrison — the list of people on watch (`setGarrison`), or the older
 *  boolean an author may still write. */
/** ✅ R46a (Erik 2026-09-05): A RAID IS A FIGHT, NOT A SUBTRACTION.
 *
 *  ⛔ **UNDETECTED — they take what they came for.** *"That is what a watch is FOR, and having none is the loss."* Walls still
 *  cut the take (`defenceShareStep`), and `minTakeShare` is RETIRED: a hold with enough stone can lose nothing to a raid
 *  nobody saw, and a hold with none can lose everything.
 *
 *  ⚑ **DETECTED — A FIGHT**, resolved unattended on the tick the way a band clash is (`legionClash`), with the garrison as
 *  its actual crew (`contingentsFromPeople`) and the raiders drawn from the danger of the place. ⛔ **Win and they take
 *  NOTHING — and you GAIN something:** what they were carrying goes into your store. *"Not merely the absence of loss."*
 *
 *  ⚠️ A WATCH IS WHAT DETECTS: people on the garrison, or a feature that keeps one (sentries, a tower). Stone alone does not
 *  see. Returns the receipt the news reads, or null when nothing came of it. */
export function resolveRaid(character, holding, { cfg = null, dangerLevel = 0, rng = Math.random, day = null, people = {}, keeperFloor = null } = {}) {
  const wasAt = holding.condition;
  const paid = () => { const r = voucherPays(character, holding, cfg, wasAt, day); return r ? { voucherCost: r } : {}; };
  const fcfg = cfg?.features || {};
  const step = Number.isFinite(Number(fcfg.defenceShareStep)) ? Number(fcfg.defenceShareStep) : 0.15;
  const baseShare = Number.isFinite(Number(cfg?.raid?.takeShare)) ? Number(cfg.raid.takeShare) : 0.5;
  const take = (share) => {
    const taken = {};
    for (const [g, n] of Object.entries(holding.store || {})) {
      const t = Math.floor((Number(n) || 0) * share);
      if (t > 0) { holding.store[g] = (Number(n) || 0) - t; taken[g] = t; }
    }
    return taken;
  };
  const note = (t) => { holding.history = [...(holding.history || []), { at: null, from: holding.condition, to: holding.condition, note: t }].slice(-12); };
  if (!watchOf(holding, cfg).length) {
    // ⛔ nobody saw them coming. Stone still slows them; nothing stops them.
    const share = Math.max(0, Math.min(1, baseShare - step * defenceOf(holding, cfg)));
    const taken = take(share);
    if (!Object.keys(taken).length) return { detected: false, taken: {}, day, why: "they found nothing worth the carrying" };
    if (Object.keys(taken).length) advanceHolding(holding, "problem", null, "raided", keeperFloor ? { keeperFloor } : null);   // ⚑ SLIP FIRST, THEN NOTE — the raid's own line stays the last entry (§78). AN EVENT SLIPS AT ONCE — time slips slowly, a raid does not
    note(`raided unseen — ${Object.entries(taken).map(([g, n]) => `${n} ${g}`).join(", ")} taken`);
    return { detected: false, taken, day, ...paid() };
  }
  // ⚑ the watch saw them: a fight, at band scale, unattended
  const defenders = contingentsFromPeople(watchOf(holding, cfg).map(id => people?.[id] || character?.npcRegistry?.[id] || { id, name: id }),
    { levelOf: (p) => Number(p?.level) || 1 });
  const stone = defenceOf(holding, cfg);
  if (stone > 0) defenders.push({ n: 1, quality: stone, what: "the walls" });
  const raiders = [{ n: Math.max(1, Math.round(dangerLevel)), quality: Math.max(1, Math.round(dangerLevel / 2)), what: "raiders" }];
  const clash = legionClash(defenders, raiders, { rng, cfg: cfg?.raid?.clash || {} });
  const held = clash.tide > 0.05;
  if (held) {
    // ⛔ NOT MERELY THE ABSENCE OF LOSS — what they carried is yours now.
    const spoilKind = String(cfg?.raid?.spoils?.goods || "raw_material");
    const spoils = Math.max(1, Math.round((Number(cfg?.raid?.spoils?.perDanger) || 1) * dangerLevel));
    holding.store = holding.store && typeof holding.store === "object" ? holding.store : {};
    holding.store[spoilKind] = (Number(holding.store[spoilKind]) || 0) + spoils;
    note(`raid beaten off — ${spoils} ${spoilKind} taken from them`);
    return { detected: true, held: true, taken: {}, spoils: { [spoilKind]: spoils }, outcome: clash.outcome, day };
  }
  const taken = take(Math.max(0, Math.min(1, baseShare - step * stone)));
  if (Object.keys(taken).length) advanceHolding(holding, "problem", null, "raided", keeperFloor ? { keeperFloor } : null);   // ⚑ AN EVENT SLIPS AT ONCE — time slips slowly, a raid does not
  note(`raid fought and lost — ${Object.entries(taken).map(([g, n]) => `${n} ${g}`).join(", ") || "nothing"} taken`);
  return { detected: true, held: false, taken, outcome: clash.outcome, day, ...paid() };
}

/** Who is WATCHING: people posted on the garrison, plus a feature that keeps a watch (sentries, a tower). Stone does not see. */
export function watchOf(holding, cfg = null) {
  const ids = Array.isArray(holding?.garrison) ? [...holding.garrison] : [];
  for (const f of featuresOf(holding)) {
    const def = featureDef(f.kind, cfg);
    if (def?.watch) for (let i = 0; i < (Number(f.count) || 1); i++) ids.push(`${f.kind}:${i}`);
  }
  return ids;
}

export function isGuarded(holding, cfg = null) {
  return !!(holding?.defence || (Array.isArray(holding?.garrison) ? holding.garrison.length > 0 : holding?.garrison) || defenceOf(holding, cfg) > 0);
}
export function upkeepFor(holding, cfg) {
  if (!holding || !cfg) return 0;
  const u = holding.upkeepCost ?? (cfg.upkeepByKind || {})[holding.kind];
  const guards = Array.isArray(holding.garrison) ? holding.garrison.length : 0;   // people on watch cost keep; sentries (a feature) do not
  const perGuard = Number(cfg.growth?.garrisonUpkeepPerHand) || 0;
  return Math.max(0, (Number(u) || 0) + guards * perGuard);
}
export function storeTotal(holding) {
  return Object.values(holding?.store || {}).reduce((a, n) => a + (Number(n) || 0), 0);
}
export function unitWorth(goods, { economy = null, regionId = null, cfg = null } = {}) {
  const base = Number(economy?.worthBands?.[cfg?.unitWorthBand || "useful"]);
  if (!Number.isFinite(base)) return null;
  const d = (regionId && regionDemand(economy, regionId, goods)) || { need: "ordinary", scarcity: "ordinary" };
  const nm = Number(economy?.priceModel?.need?.[d.need]), sm = Number(economy?.priceModel?.scarcity?.[d.scarcity]);
  if (!Number.isFinite(nm) || !Number.isFinite(sm)) return null;
  return { each: Math.round(base * nm * sm * 100) / 100, need: d.need, scarcity: d.scarcity };
}
export function storeWorth(holding, { economy = null, regionId = null, cfg = null } = {}) {
  let total = 0, any = false;
  for (const [g, n] of Object.entries(holding?.store || {})) {
    const w = unitWorth(g, { economy, regionId, cfg });
    if (!w) continue;
    any = true; total += (Number(n) || 0) * w.each;
  }
  return any ? Math.round(total) : null;
}
/** ⛔ ERIK 2026-09-06 — RUNNER FEES. "Enough to maintain the post minimally; the more traffic, the more revenue; the
 *  waygate here will bring a lot more runner traffic as word gets out." A hold with a `service: true` feature (a relay
 *  station) earns max(feePerPass, its own upkeep) — a post's upkeep is authored at 0, so 'minimally' means the garrison's
 *  keep — times traffic: 1 + trafficPerStation per other service hold you keep + gateTraffic × ramp, the ramp climbing
 *  over wordPasses while a NETWORK waygate stands within gateWithinDays. PURE: the tick owns the pass counter. */
export function serviceIncome(character, holding, { cfg = null, locations = {}, passes = 0 } = {}) {
  const r = cfg?.relay;
  if (!r || !holding) return null;
  const stations = featuresOf(holding).filter(f => featureDef(f.kind, cfg)?.service);
  if (!stations.length) return null;
  const others = (character?.holdings || []).filter(o => o && o.id !== holding.id && featuresOf(o).some(f => featureDef(f.kind, cfg)?.service)).length;
  const here = holding.locationId ? locations?.[holding.locationId] : null;
  const within = Number.isFinite(Number(r.gateWithinDays)) ? Number(r.gateWithinDays) : 2;
  const gate = here ? Object.values(locations || {}).find(l => l && isNetworkGate(l) && (walkingDays(here, l) ?? Infinity) <= within) : null;
  const ramp = gate ? Math.min(1, Math.max(0, Number(passes) || 0) / Math.max(1, Number(r.wordPasses) || 20)) : 0;
  const traffic = 1 + (Number(r.trafficPerStation) || 0) * others + (Number(r.gateTraffic) || 0) * ramp;
  const base = Math.max(Number(r.feePerPass) || 0, upkeepFor(holding, cfg) || 0);
  return { crystal: Math.round(base * traffic), traffic, gate: gate?.id || null, ramp, stations: stations.length };
}

export function tickStore(character, holding, { cfg = null, economy = null, regionId = null, dangerLevel = 0, rng = Math.random, day = null, density = null, meaning = 0, people = {}, npcCfg = {}, locations = {} } = {}) {
  if (!holding || !cfg) return null;
  const out = { yielded: null, upkeep: 0, short: 0, raid: null, full: false, justFull: false };
  // ✅ features: a post with a mine yields — every material feature adds its goods beside the hold's own kind
  const ys = yieldsFor(holding, cfg, { density });
  for (const y of ys) {
    if (!(y.units > 0)) continue;
    holding.store = holding.store && typeof holding.store === "object" ? holding.store : {};
    holding.store[y.goods] = (Number(holding.store[y.goods]) || 0) + y.units;
  }
  out.yielded = ys.length ? ys[0] : null;
  out.yields = ys;
  // ✅ R46b: what the pilgrims leave, before the keep is paid — attendance is an earning shape beside production.
  // ⛔ A KEEPER SELLS — that is what a keeper IS. Measured before this: a thriving enterprise kept by a
  // steward drained 14 crystal a pass forever while its entire output sat in a shed, because `tickStore`
  // debited upkeep and credited nothing. 100 raw material worth 400 crystal, stranded, and the purse falling.
  // ⚑ Erik: "that should be far outweighed by what she would bring in from selling her wares and labor."
  // ⚠️ NOT THE WHOLE STORE, ON PURPOSE: 8 raw material is 32 in the valley and 115 in the Gearlands, and a
  // keeper who cleared the shelves every pass would make a caravan pointless. She sells the week's work here
  // and keeps stock back — the surplus is what a caravan carries somewhere better.
  // ⛑ AND NO KEEPER MEANS NO SALE, which is the whole meaning of having none.
  if (holding.steward && regionId) {
    // ⛑ HALF, MEASURED. Every share fixes the drain; the choice is between a hold that pays and a hold with
    // stock worth carrying. Over ten passes of the Fell Pell: 0.9 nets +256 and leaves 1 unit (14 crystal in
    // the Gearlands); 0.5 nets +224 and leaves 9 (130); 0.25 nets +148 and leaves 28 (403). ⚑ Half is where
    // the hold is clearly profitable AND the surplus is worth a caravan — which is the whole point of both.
    const share = Math.max(0, Math.min(1, Number(cfg?.keeperSells ?? 0.5)));
    const sold = {}; let earned = 0;
    for (const [g, n] of Object.entries(holding.store || {})) {
      const units = Math.round((Number(n) || 0) * share);
      if (units <= 0) continue;
      const w = unitWorth(g, { economy, regionId, cfg });
      if (!w) continue;
      const val = Math.round(units * w.each);
      if (val <= 0) continue;
      holding.store[g] = (Number(n) || 0) - units;
      if (!(holding.store[g] > 0)) delete holding.store[g];
      sold[g] = units; earned += val;
    }
    if (earned > 0) {
      const cr = credit(character, cfg?.upkeepCurrency || "crystal", earned, { origin: "traded", regionId });
      if (cr.ok) out.keeperSold = { by: holding.steward, goods: sold, crystal: earned };
    }
  }
  const alms = pilgrimIncome(holding, { cfg, meaning });
  if (alms > 0) { const c = credit(character, cfg.upkeepCurrency || "crystal", alms, { origin: "gift" }); if (c.ok) out.pilgrims = alms; }
  // ⛔ RUNNER FEES, BEFORE THE KEEP — so a relay post pays for itself in the same pass (Erik: "maintain the post minimally").
  const svc = serviceIncome(character, holding, { cfg, locations, passes: Number(holding.relayPasses) || 0 });
  if (svc) {
    if (svc.gate) holding.relayPasses = (Number(holding.relayPasses) || 0) + 1; else if (holding.relayPasses) delete holding.relayPasses;
    if (svc.crystal > 0) {
      const c = credit(character, cfg.upkeepCurrency || "crystal", svc.crystal, { origin: "relay" });
      if (c.ok) {
        out.relay = { crystal: svc.crystal, traffic: svc.traffic, gate: svc.gate, ramp: svc.ramp, first: !holding.relayAnnounced, wordOut: svc.ramp >= 1 && !holding.relayWordAnnounced };
        holding.relayAnnounced = true; if (svc.ramp >= 1) holding.relayWordAnnounced = true;
      }
    }
  }
  const up = upkeepFor(holding, cfg);
  if (up > 0) {
    const r = debit(character, cfg.upkeepCurrency || "crystal", up, {});
    if (r.ok) out.upkeep = up; else { out.short = up; holding.arrears = (Number(holding.arrears) || 0) + up; }
  }
  const total = storeTotal(holding);
  const fullAt = Math.max(1, Number(cfg.fullAt) || 40);
  out.full = total >= fullAt;
  out.justFull = out.full && !holding.storeFullAnnounced;
  if (out.full) holding.storeFullAnnounced = true; else if (holding.storeFullAnnounced) delete holding.storeFullAnnounced;
  const raid = cfg.raid || null;
  if (raid && total > 0 && dangerLevel > 0) {
    let p = (Number(raid.base) || 0) * dangerLevel * Math.min(1, total / fullAt);
    if (isGuarded(holding, cfg)) p *= Number.isFinite(Number(raid.defendedMult)) ? Number(raid.defendedMult) : 0.5;
    // ⛔ v2 §1 — "successful places that don't have a strong leader are targets": the KEEPER joins the product. An
    // unkept hold reads `_none`; a keeper of unknown tier reads `_default`, never as absent.
    const tier = holding.steward ? keeperTierOf(character, holding, { npcs: people, npcCfg, day }) : null;
    const km = raid.keeperMult || null;
    if (km) { const m = Number(holding.steward ? (tier && km[tier]) ?? km._default : km._none); if (Number.isFinite(m)) p *= m; }
    // ⛔ ERIK_holds_features §5 — A HOLD THAT WATCHES ANOTHER. "He built the Whistling Woman to watch over it": while the
    // watcher stands (not failing, and keeps a watch of its own — stone does not see) the watched hold raids less; a
    // watcher that is lost leaves it MORE exposed. A reason to defend a post that produces nothing.
    const watcher = (character?.holdings || []).find(o => o && o !== holding && o.watches === holding.id);
    if (watcher) {
      const standing = watcher.condition !== "failing" && watchOf(watcher, cfg).length > 0;
      const m = Number(standing ? raid.watchedMult : raid.watcherLostMult);
      if (Number.isFinite(m)) p *= m;
    }
    const keeperFloor = holding.steward ? keeperFloorFor(tier, cfg?.growth) : null;
    if (rng() < p) out.raid = resolveRaid(character, holding, { cfg, dangerLevel, rng, day, people, keeperFloor });
  }
  return out;
}
/** Only what deserves telling: a raid, a keep unpaid, a store that has just filled. A store that simply grows is not news. */
export function storeNews(holding, st) {
  if (!holding || !st) return [];
  const where = holding.name || holding.id;
  const lines = [];
  // ✅ R46a: three endings, and they do not read alike
  if (st.raid) {
    const r = st.raid;
    const list = (o) => Object.entries(o || {}).map(([g, n]) => `${n} ${g.replace(/_/g, " ")}`).join(", ");
    if (r.detected && r.held) lines.push(`Raiders came at ${where} and the watch met them — they took nothing, and left ${list(r.spoils)} behind them.`);
    else if (r.detected) lines.push(`Raiders came at ${where}, the watch met them and lost — ${list(r.taken) || "nothing"} taken.`);
    else if (Object.keys(r.taken || {}).length) lines.push(`${where} was robbed in the night — ${list(r.taken)} gone, and nobody saw them.`);
    else lines.push(`Something came at ${where} in the night and found nothing worth the carrying.`);
  }
  if (st.raid?.voucherCost) lines.push(`${st.raid.voucherCost.voucherName}'s word for ${st.raid.voucherCost.keeper} cost them — ${where} slipped on that watch.`);
  // ⚑ runner fees are news TWICE — when they begin, and when word of the gate has got out — never every pass
  if (st.relay?.first) lines.push(`The relay at ${where} has begun to pay: ${st.relay.crystal} crystal in runner fees this pass${st.relay.gate ? ", and the gate nearby will bring more as word gets out" : ""}.`);
  else if (st.relay?.wordOut) lines.push(`Word of the gate has got out — runner traffic at ${where} is at its height: ${st.relay.crystal} crystal in fees this pass.`);
  if (st.pilgrims) lines.push(`${st.pilgrims} crystal left at ${where} by those who came to it.`);
  if (Array.isArray(st.yields) && st.yields.length > 1) { /* several goods — the store line on the tab says which */ }
  if (st.grew) lines.push(`${where} has come up to ${holding.condition}${st.grew.keeper ? ` under ${st.grew.keeper}` : ""}.`);
  if (st.short) lines.push(`${where} could not pay its keep this pass (${st.short} owed) — the arrears sit on the place.`);
  if (st.justFull) lines.push(`The store at ${where} is full — ${Object.entries(holding.store || {}).filter(([, n]) => n > 0).map(([g, n]) => `${n} ${g.replace(/_/g, " ")}`).join(", ")} sit waiting for a road, a buyer, or a thief.`);
  return lines;
}
/** Sell what is stored, where it stands, at this Reach's prices. Refuses away from the hold and where nothing is wanted. */
export function sellStore(character, holdingId, { economy = null, cfg = null, hereId = null, regionId = null, day = null, goods = null } = {}) {
  const h = (character?.holdings || []).find(x => x && x.id === holdingId);
  if (!h) return { ok: false, why: "no such holding" };
  if (hereId && h.locationId && hereId !== h.locationId) return { ok: false, why: "the store is at the hold — you sell where it stands, and nothing moves it yet" };
  const sold = {}; let total = 0;
  for (const [g, n] of Object.entries(h.store || {})) {
    if (goods && g !== goods) continue;
    if (!(Number(n) > 0)) continue;
    const w = unitWorth(g, { economy, regionId, cfg });
    if (!w) continue;
    const val = Math.round(Number(n) * w.each);
    if (val <= 0) continue;
    sold[g] = { units: Number(n), crystal: val, need: w.need, scarcity: w.scarcity };
    total += val; delete h.store[g];
  }
  if (!total) return { ok: false, why: storeTotal(h) > 0 ? "nobody here wants what is stored — this Reach has no need of it" : "the store is empty" };
  const cr = credit(character, "crystal", total, { origin: "traded", regionId });
  if (!cr.ok) return { ok: false, why: cr.why };
  if (h.storeFullAnnounced && storeTotal(h) < Math.max(1, Number(cfg?.fullAt) || 40)) delete h.storeFullAnnounced;
  h.history = [...(h.history || []), { at: null, from: h.condition, to: h.condition, note: `sold the store — ${total} crystal` }].slice(-12);
  return { ok: true, crystal: total, sold, day };
}

/* ═══ 2026-09-05 — APPOINT A KEEPER; TAKE A HANDED-OVER HOLD BACK (Erik: "now it says I gave them to the stewards!") ═══
 * The tab's only person selector sat beside "Hand it over" — a transfer of OWNERSHIP with no confirm — and nothing on the tab
 * could appoint a keeper, so the player who meant to assign a steward handed the place away. These are the verbs that were
 * missing. `appointKeeper` sets the steward the GM's `holdingOps steward` op sets, with history and an event. `reclaimHolding`
 * reverses a transfer the player made: the record comes back with its history, the person it was handed to keeps it. */
export function appointKeeper(character, id, npcId, { day = null, worldCount = null, nameOf = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h || !npcId) return null;
  const was = h.steward || null;
  if (was === npcId) return h;
  h.steward = npcId;
  const who = nameOf ? nameOf(npcId) : npcId;
  h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `${who} appointed keeper${was ? ` (was ${nameOf ? nameOf(was) : was})` : ""}` }].slice(-12);
  queueHoldingEvent(character, `${who} keeps ${h.name || h.id} now${was ? `; ${nameOf ? nameOf(was) : was} is released from it` : ""}.`);
  return h;
}

export function reclaimHolding(character, id, { day = null, worldCount = null, nameOf = null } = {}) {
  ensureHoldings(character);
  const i = (character.formerHoldings || []).findIndex(h => h && h.id === id && h.transferredTo);
  if (i < 0) return null;
  const [rec] = character.formerHoldings.splice(i, 1);
  const { formerHolder, transferredTo, transferredToName, transferredDay, transferredAt, stewardStays, storeCarried, obligationUnpaid, ...h } = rec;
  h.steward = transferredTo;   // the person it was handed to is at the place; they keep it
  h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `taken back from ${transferredToName || transferredTo}, who keeps it` }].slice(-12);
  character.holdings.push(h);
  queueHoldingEvent(character, `${h.name || h.id} is yours again; ${transferredToName || (nameOf ? nameOf(transferredTo) : transferredTo)} keeps it.`);
  return h;
}

/* ═══ Q18 — A HOLD GROWS (Erik 2026-09-05: "please build it"; SPEC_hold_store §5) ═══
 * One-time acts with lasting effects, never a per-tick chore. The dials live in `economy.holdStore.growth`:
 *   · a KEPT hold climbs one rung every `passesPerClimb` passes (`growHolding`, on the tick), up to the rung its keeper's
 *     TIER allows (`ceilingByKeeperTier` — a notable keeper holds a place; a regional one can bring it to thriving);
 *   · a CRAFT the character carries, applied to the place (`improveHolding` — the tab, or `holdingOps improve`), lifts it a
 *     rung at once, once per craft per hold, when the craft's functions are the kind that shape or mend (`improveFunctions`);
 *   · HANDS (`setCrew`) raise the yield by `handsYieldBonus` each, to `maxHands`;
 *   · a GARRISON (`setGarrison`) halves a raid (`raid.defendedMult`) and costs `garrisonUpkeepPerHand` each pass;
 *   · the GROUND scales an enterprise's yield: 1 + `groundYieldWeight` × (density − 0.5).
 * What a POST can become is not built — a post holds ground, keeps a garrison and hands, and climbs; it does not produce. */
export function keeperTierOf(character, holding, { npcs = {}, npcCfg = {}, day = null } = {}) {
  const id = holding?.steward;
  if (!id) return null;
  const rec = character?.npcRegistry?.[id] || npcs?.[id] || null;
  if (!rec) return null;
  try { const sheet = personSheetFor(rec, { day, cfg: npcCfg }); return tierOfLevel(sheet.level, { cfg: npcCfg }) || rec.tier || null; }
  catch { return rec.tier || null; }
}

/** v2 §1 — the condition a keeper of this tier will not let the place drop below. `_default` is an unknown tier. */
export function keeperFloorFor(tier, growthCfg = null) {
  const f = growthCfg?.floorByKeeperTier || null;
  if (!f) return null;
  const v = (tier && f[tier]) || f._default || null;
  return v && CONDITIONS.includes(v) ? v : null;
}

/** ⛔ v2 §4 — MY PEOPLE'S PEOPLE. What a person's word is worth to you: their own relationship, or — if someone
 *  vouched for them — the voucher's standing less a discount, whichever is higher. ⚠️ BESIDE relationship, never
 *  moving it (Aevi §6.1: trusted is not known). `via` names the voucher when the vouch is what carries. */
export function trustOf(character, npcId, { cfg = null } = {}) {
  const reg = character?.npcRegistry || {};
  const n = npcId ? reg[npcId] : null;
  if (!n) return { score: 0, own: 0, via: null };
  const own = Number(n.relationship) || 0;
  const v = n.vouchedBy ? reg[n.vouchedBy] : null;
  const discount = Number.isFinite(Number(cfg?.vouchDiscount)) ? Number(cfg.vouchDiscount) : 1;
  const carried = v ? (Number(v.relationship) || 0) - discount : -Infinity;
  return carried > own ? { score: carried, own, via: v.id } : { score: own, own, via: null };
}

/** v2 §2 — KEEPING or CHARGE: breadth of action, not a better number. A charge-holder is a player-shaped person
 *  ("just like you can"); today the scope is READ and SAID — a charge-holder acting on world days is SNG-366's spec. */
export function delegateScope(character, npcId, { cfg = null } = {}) {
  const bar = Number.isFinite(Number(cfg?.chargeStanding)) ? Number(cfg.chargeStanding) : 6;
  return trustOf(character, npcId, { cfg }).score >= bar ? "charge" : "keeping";
}

/** v2 §4 — "IT COSTS THE VOUCHER": when a hold kept by a vouched-for person slips, the voucher's standing takes it.
 *  Priced at `delegates.vouchFallCost` (Aevi §6.2: ruled that it costs, not how much — Erik turns). Once per slip. */
function voucherPays(character, holding, cfg, wasAt, day = null) {
  const reg = character?.npcRegistry || {};
  const k = holding?.steward ? reg[holding.steward] : null;
  if (!k?.vouchedBy || CONDITIONS.indexOf(holding.condition) >= CONDITIONS.indexOf(wasAt)) return null;
  const v = reg[k.vouchedBy];
  if (!v) return null;
  const cost = Number.isFinite(Number(cfg?.delegates?.vouchFallCost)) ? Number(cfg.delegates.vouchFallCost) : 1;
  v.relationship = Math.max(-10, Math.min(10, (Number(v.relationship) || 0) - cost));
  v.history = [...(v.history || []), `[d${day ?? "?"}] their word for ${k.name || k.id} cost them — ${holding.name || holding.id} slipped on that watch.`].slice(-30);
  return { voucher: v.id, voucherName: v.name || v.id, keeper: k.name || k.id, cost };
}

export function growHolding(character, holding, { cfg = null, npcs = {}, npcCfg = {}, worldCount = null, day = null, nameOf = null } = {}) {
  const g = cfg?.growth;
  if (!holding || !g || !holding.steward) return null;
  if (keeperGone(character, holding.steward)) return null;
  const per = Math.max(1, Number(g.passesPerClimb) || 4);
  holding.growthPasses = (Number(holding.growthPasses) || 0) + 1;
  const tier = keeperTierOf(character, holding, { npcs, npcCfg, day });
  // ⛔ FLOORS, NOT CEILINGS (v2 §1). This capped a notable keeper's hold at `holding` — "poor Deni might just be keeping
  // it, but the place might be thriving anyway." A kept hold climbs to thriving whoever keeps it; what the keeper's
  // tier sets is the FLOOR (keeperFloorFor), read where the hold FALLS. "Not permission to climb, but that it stays climbed."
  const at = CONDITIONS.indexOf(holding.condition);
  if (holding.growthPasses < per || at < 0 || at >= CONDITIONS.length - 1) return null;
  holding.growthPasses = 0;
  const before = holding.condition;
  holding.condition = CONDITIONS[at + 1];
  const keeper = nameOf ? nameOf(holding.steward) : holding.steward;
  holding.history = [...(holding.history || []), { at: worldCount, from: before, to: holding.condition, note: `grew under ${keeper} (${tier || "a keeper"})` }].slice(-12);
  return { from: before, to: holding.condition, keeper, tier, floor: keeperFloorFor(tier, g) };
}

export function improveHolding(character, id, abilityId, { catalog = {}, cfg = null, day = null, worldCount = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h) return { ok: false, why: "no such holding" };
  const g = cfg?.growth;
  if (!g) return { ok: false, why: "no growth dials authored" };
  const owned = (character?.abilities || []).find(a => (a?.abilityId || a) === abilityId);
  const def = catalog?.[abilityId];
  if (!owned || !def) return { ok: false, why: "you do not carry that craft" };
  const fns = new Set((g.improveFunctions || []).map(String));
  const verbs = Array.isArray(def.functions) ? def.functions : (def.function ? [def.function] : []);
  if (!verbs.some(v => fns.has(String(v)))) return { ok: false, why: `${def.name || abilityId} does not shape or mend a place — it ${verbs.join("/") || "does something else"}` };
  if ((h.improvements || []).some(i => i.abilityId === abilityId)) return { ok: false, why: `${def.name || abilityId} has already been applied here — a lasting effect, once` };
  const before = h.condition;
  const at = CONDITIONS.indexOf(h.condition);
  h.improvements = [...(h.improvements || []), { abilityId, name: def.name || abilityId, day }];
  if (at >= 0 && at < CONDITIONS.length - 1) h.condition = CONDITIONS[at + 1];
  h.history = [...(h.history || []), { at: worldCount, from: before, to: h.condition, note: `improved with ${def.name || abilityId}` }].slice(-12);
  queueHoldingEvent(character, `You put ${def.name || abilityId} to ${h.name || h.id}${h.condition !== before ? ` — it comes up to ${h.condition}` : " — it is as good as it gets"}.`);
  return { ok: true, holding: h, from: before, to: h.condition };
}

export function setCrew(character, id, npcIds = [], { cfg = null, worldCount = null, nameOf = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h) return null;
  const max = handsCap(h, cfg?.growth ? { growth: cfg.growth, features: cfg.features } : cfg);
  const list = [...new Set((npcIds || []).filter(Boolean).filter(n => n !== h.steward))].slice(0, max);
  const before = (h.crew || []).slice();
  h.crew = list;
  if (JSON.stringify(before) !== JSON.stringify(list)) h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `hands: ${list.map(n => nameOf ? nameOf(n) : n).join(", ") || "none"}` }].slice(-12);
  return h;
}

export function setGarrison(character, id, npcIds = [], { worldCount = null, nameOf = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h) return null;
  const list = [...new Set((npcIds || []).filter(Boolean))];
  const before = (h.garrison || []).slice();
  h.garrison = list;
  if (JSON.stringify(before) !== JSON.stringify(list)) h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `guarded by ${list.map(n => nameOf ? nameOf(n) : n).join(", ") || "nobody"}` }].slice(-12);
  return h;
}

/** The ground under a hold, for the yield: the place's substrate density (null when unknown). */
export function holdingGround(holding, { locations = {}, substrate = null } = {}) {
  const loc = holding?.locationId ? locations?.[holding.locationId] : null;
  if (!loc || !substrate) return null;
  const d = locationDensity(loc, substrate);
  return Number.isFinite(d) ? d : null;
}

/* ═══ FEATURES — what a hold HAS (SPEC_holding_attributes pass two, first cut; Erik 2026-09-05 by example) ═══
 * `holding.features[] = { kind, name, family, by, craftIds[], count, day }` from the catalogue `economy.holdStore.features`
 * (`kinds`): a mine yields into the store, a temple is a meaning aura on the ground, a wall or sentries guard the place and
 * cut a raid's take, quarters raise the hands a hold can work and count as residents, a forge is recorded as a facility.
 * A feature is added through play (`holdingOps feature`) or on the tab; it records who built it and the crafts used. The
 * catalogue is the content Aevi extends; the numbers are Erik's to turn. */
export function featureKinds(cfg) { return (cfg?.features?.kinds) || {}; }
export function featureDef(kind, cfg) { const k = featureKinds(cfg)[String(kind || "")]; return k ? { kind: String(kind), ...k } : null; }
export function featuresOf(holding) { return Array.isArray(holding?.features) ? holding.features : []; }

export function addFeature(character, id, { kind, name = null, by = null, craftIds = [], count = 1, day = null, worldCount = null, cfg = null, yields = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h) return { ok: false, why: "no such holding" };
  const def = featureDef(kind, cfg);
  if (!def) return { ok: false, why: `"${kind}" is not a feature the catalogue knows — Aevi authors kinds in economy.holdStore.features` };
  // ⚑ ERIK 2026-09-06: "a workshop can be for lots of finished goods" — a feature may OVERRIDE its kind's good (Aevi's
  // catalogue said so; nothing stored or read it). A laboratory post's workshop makes instruments; Pell's makes arms.
  const f = { kind: def.kind, family: def.family, name: name || def.label || def.kind, by: by || null, craftIds: (craftIds || []).filter(Boolean), count: Math.max(1, Number(count) || 1), day,
    ...(yields && def.family === "material" ? { yields: String(yields) } : {}) };
  h.features = [...featuresOf(h), f];
  h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `built ${f.name}${f.by ? ` (${f.by})` : ""}${f.craftIds.length ? ` with ${f.craftIds.join(", ")}` : ""}` }].slice(-12);
  queueHoldingEvent(character, `${h.name || h.id} has ${f.name} now${f.by && f.by !== "you" ? `, ${f.by}'s work` : ""}.`);
  return { ok: true, feature: f, holding: h };
}

/** ⚑ THE WORDS THAT ASSERT A FEATURE. Each kind's own vocabulary — what a scene says when the thing is
 *  there. ⚠️ Deliberately literal: "wall" not "defence", "mine" not "resources". An inference that
 *  reaches is a guess, and the spec is explicit that this is a READING, not a guess. */
const FEATURE_WORDS = {   // module-private: read only by inferFeatures; the audit caught it exported to nothing
  mine: /\b(mine|mineshaft|ore|seam|lode|living iron)\b/i,
  quarry: /\bquarr(y|ies)\b/i,
  mill: /\b(mill|millstone|millwheel)\b/i,
  workshop: /\bworkshop\b/i,
  forge: /\b(forge|smithy|anvil)\b/i,
  kiln: /\bkiln\b/i,
  still: /\b(still|stillhouse|distill)\b/i,
  fishery: /\b(fishery|fish-?traps?|weir)\b/i,
  herd: /\b(herd|flock|pens?)\b/i,
  wall: /\b(wall|walls|rampart|palisade)\b/i,
  barrier: /\bbarriers?\b/i,
  tower: /\b(tower|watchtower)\b/i,
  sentries: /\b(sentr(y|ies)|watchmen|guards? posted|on watch)\b/i,
  temple: /\btemple\b/i,
  shrine: /\bshrine\b/i,
  quarters: /\b(quarters|barracks|bunkhouse|lodgings)\b/i,
  laboratory: /\blaborator(y|ies)\b/i,
  scriptorium: /\bscriptorium\b/i,
};

/** ⛔ WHAT THE RECORD ALREADY SAYS IS HERE. Reads the hold's OWN record first (history notes, what it was
 *  called, what it owes), then its place (description, tags — 42 locations are tagged `sacred`), then the
 *  chronicle — the richest source and, until now, entirely unread. Returns candidate features WITH their
 *  evidence, skipping kinds already built and kinds the player has said No to. PURE. */
export function inferFeatures(holding, { location = null, chronicle = [], cfg = null, max = 2 } = {}) {
  if (!holding) return [];
  const have = new Set(featuresOf(holding).map(f => f.kind));
  const refused = new Set(holding.notFeature || []);
  const known = cfg?.features?.kinds || cfg?.features || {};
  const own = [holding.describedAs, holding.obligation, ...(holding.history || []).map(h => h && h.note)].filter(Boolean).map(String);
  const place = [location?.descriptionSeed, location?.description].filter(Boolean).map(String);
  const nameRe = holding.name ? new RegExp(String(holding.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
  const prose = nameRe ? (chronicle || []).filter(e => typeof e === "string" && nameRe.test(e)) : [];
  const out = [];
  for (const [kind, re] of Object.entries(FEATURE_WORDS)) {
    if (have.has(kind) || refused.has(kind)) continue;
    if (Object.keys(known).length && !known[kind]) continue;          // not a kind the catalogue knows
    const hitOwn = own.filter(t => re.test(t));
    const hitPlace = place.filter(t => re.test(t));
    const hitProse = prose.filter(t => re.test(t));
    // ⚑ a `sacred` tag is an authored assertion of meaning — it stands as evidence for a shrine on its own
    const sacred = (kind === "shrine") && Array.isArray(location?.tags) && location.tags.includes("sacred");
    // ⛔ STRONG EVIDENCE ONLY: the hold's own record or its place says it, or the chronicle says it twice.
    const strong = hitOwn.length || hitPlace.length || sacred || hitProse.length >= 2;
    if (!strong) continue;
    // ⚑ QUOTE THE SENTENCE THAT MATCHED, not the first 140 chars of a long description — measured, the
    // offer for a rebuilt post quoted its opening line, which contained none of the words that fired.
    const src = hitOwn[0] || hitPlace[0] || hitProse[0] || "";
    const at = src.search(re);
    const quote = at < 0 ? smartClamp(src, 140) : (at > 60 ? "…" : "") + src.slice(Math.max(0, at - 60), at + 80).trim() + (at + 80 < src.length ? "…" : "");
    out.push({ kind, why: sacred && !quote ? "this place is authored as sacred" : `the record reads: “${quote}”`,
      from: hitOwn.length ? "its own record" : hitPlace.length ? "its place" : sacred ? "the place's authored tags" : "the chronicle",
      strength: (hitOwn.length * 3) + (hitPlace.length * 2) + (sacred ? 2 : 0) + hitProse.length });
  }
  return out.sort((a, b) => b.strength - a.strength).slice(0, max);
}

/** ⚑ OFFER, ON THE TICK, AT MOST ONE NEW OFFER PER HOLD PER PASS — the chore constraint. Returns the offers
 *  it added. An offer is `{ holdingId, kind, why, from }` on `character.featureOffers`, and the same
 *  (hold, kind) is never offered twice while it stands. */
export function queueFeatureOffers(character, { locations = {}, cfg = null, worldCount = null } = {}) {
  ensureHoldings(character);
  const offers = character.featureOffers || (character.featureOffers = []);
  const added = [];
  for (const h of character.holdings || []) {
    if (!h || h.lastFeatureOfferCount === worldCount) continue;
    const cands = inferFeatures(h, { location: locations[h.locationId] || null, chronicle: character.chronicle || [], cfg, max: 2 });
    const fresh = cands.find(c => !offers.some(o => o.holdingId === h.id && o.kind === c.kind));
    if (!fresh) continue;
    h.lastFeatureOfferCount = worldCount;
    const o = { holdingId: h.id, holdingName: h.name || h.id, kind: fresh.kind, why: fresh.why, from: fresh.from };
    offers.push(o); added.push(o);
  }
  return added;
}

/** The player answers. Yes records it through `addFeature` — the one door a feature enters by — attributed
 *  to the fiction. ⛑ No is REMEMBERED on the hold, so the same wrong guess is never made again: that is
 *  Erik's "get better at building itself", and it costs one array. */
export function answerFeatureOffer(character, index, accept, { day = null, worldCount = null, cfg = null } = {}) {
  const offers = character.featureOffers || [];
  const o = offers[index];
  if (!o) return { ok: false, why: "no such offer" };
  character.featureOffers = offers.filter((_, i) => i !== index);
  const h = (character.holdings || []).find(x => x && x.id === o.holdingId);
  if (!h) return { ok: false, why: "the holding is gone" };
  if (!accept) { h.notFeature = [...new Set([...(h.notFeature || []), o.kind])]; return { ok: true, refused: o.kind }; }
  return addFeature(character, h.id, { kind: o.kind, by: "the fiction", day, worldCount, cfg });
}

export function removeFeature(character, id, index, { worldCount = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  if (!h) return null;
  const list = featuresOf(h);
  const f = list[index];
  if (!f) return null;
  h.features = list.filter((_, i) => i !== index);
  h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `${f.name} torn down` }].slice(-12);
  return f;
}

export function renameHolding(character, id, name, { worldCount = null } = {}) {
  ensureHoldings(character);
  const h = character.holdings.find(x => x && x.id === id);
  const next = String(name || "").trim();
  if (!h || !next || next === h.name) return h || null;
  const was = h.name;
  h.name = next;
  // ⛔ SPEC_holdings_screen §2 — A CACHED IMAGE SURVIVED A RENAME: Stillwater's Trouble carried art whose prompt read
  // "Raven's Home". `if (holding.image) return holding.image` is right for never-regenerate and wrong for the-subject-
  // changed. One clear, at the one moment the subject changes; the next read mints it fresh under the new name.
  if (h.image) delete h.image;
  h.history = [...(h.history || []), { at: worldCount, from: h.condition, to: h.condition, note: `renamed from ${was} to ${next}` }].slice(-12);
  queueHoldingEvent(character, `${was} is called ${next} now.`);
  return h;
}

/** Defence points: every martial feature's `defence` × its count. */
export function defenceOf(holding, cfg = null) {
  let d = 0;
  for (const f of featuresOf(holding)) { const def = featureDef(f.kind, cfg); if (def?.family === "martial") d += (Number(def.defence) || 0) * (Number(f.count) || 1); }
  return d;
}
/** The hands a hold can work: the growth cap plus what its quarters add. */
export function handsCap(holding, cfg = null) {
  let cap = Number(cfg?.growth?.maxHands) || 0;
  for (const f of featuresOf(holding)) { const def = featureDef(f.kind, cfg); if (def?.family === "people") cap += (Number(def.hands) || 0) * (Number(f.count) || 1); }
  return cap;
}
/** Who lives here: quarters' capacity, the people at work, the watch, the keeper. */
export function residentsOf(holding, cfg = null) {
  let homes = 0;
  for (const f of featuresOf(holding)) { const def = featureDef(f.kind, cfg); if (def?.family === "people") homes += (Number(def.residents) || 0) * (Number(f.count) || 1); }
  const people = [...new Set([holding?.steward, ...(holding?.crew || []), ...(holding?.garrison || [])].filter(Boolean))];
  return { homes, people };
}
/** ⚑ WHAT THIS PLACE COSTS AND WHAT IT MAKES, IN ONE ANSWER — Erik: *"income vs expense, and per tick
 *  benefits"*. ⛔ Nothing answered that before: the card showed `keep: 14 crystal per pass` beside
 *  `produces: 8 raw material` and left the player to do arithmetic that was WRONG, because until a keeper
 *  sold, the true answer was "it drains forever and the goods strand".
 *
 *  ⚠️ IT READS THE SAME DIALS `tickStore` READS. A panel that computed its own economics would be a second
 *  implementation of the tick and would drift from it; this cannot disagree with the pass, because it is the
 *  same numbers in the same order.
 *
 *  ⛑ `net` IS THE HONEST ONE: what the purse actually feels each pass. A kept place sells `keeperSells` of
 *  what it made and pays its keep; an unkept one pays the keep and banks everything, which reads as a
 *  NEGATIVE net and a rising `banked` — the exact shape a player should be able to see before it costs them.
 *  PURE. */
export function holdingLedger(holding, { economy = null, cfg = null, regionId = null, density = null, character = null, locations = {} } = {}) {
  if (!holding) return null;
  const yields = yieldsFor(holding, cfg, { density }) || [];
  const upkeep = upkeepFor(holding, cfg) || 0;
  const share = holding.steward ? Math.max(0, Math.min(1, Number(cfg?.keeperSells ?? 0.5))) : 0;

  // what a pass MAKES, valued where the place stands
  let made = 0, madeUnits = 0;
  for (const y of yields) {
    const w = unitWorth(y.goods, { economy, regionId, cfg });
    madeUnits += Number(y.units) || 0;
    if (w) made += Math.round((Number(y.units) || 0) * w.each);
  }
  // ⚠️ THE KEEPER SELLS A SHARE OF THE STORE, NOT OF THIS PASS'S YIELD — the same rounding `tickStore` does,
  // over the store as it will stand once the yield lands, or the panel would promise a number the pass misses.
  const soldUnits = Math.round((storeTotal(holding) + madeUnits) * share);
  const sells = share > 0 ? Math.round(made * share) : 0;

  const nameOf = (id) => character?.npcRegistry?.[id]?.name || id;
  const crew = [...new Set(holding.crew || [])].filter(Boolean);
  const watch = watchOf(holding, cfg) || [];
  const res = residentsOf(holding, cfg) || { homes: 0, people: [] };

  return {
    keeper: holding.steward ? { id: holding.steward, name: nameOf(holding.steward) } : null,
    // ⛔ BY TYPE, because the types do different things: crew add yield, a garrison is what SEES a raid
    // coming, and residents are who the place houses. One number would hide the only distinction that matters.
    people: {
      keeper: holding.steward ? 1 : 0,
      crew: crew.length,
      garrison: [...new Set(holding.garrison || [])].filter(Boolean).length,
      watch: watch.length,
      residents: res.people.length,
      homes: res.homes,
      named: res.people.map(id => ({ id, name: nameOf(id) })),
    },
    perPass: {
      yields: yields.map(y => ({ goods: y.goods, units: Number(y.units) || 0, feature: y.feature || null })),
      units: madeUnits,
      worth: made,          // what a pass makes, valued HERE
      sells,                // what the keeper turns into coin
      soldUnits,
      upkeep,
      fees: serviceIncome(character, holding, { cfg, locations, passes: Number(holding.relayPasses) || 0 })?.crystal || 0,   // runner fees (Erik 2026-09-06)
      net: sells + (serviceIncome(character, holding, { cfg, locations, passes: Number(holding.relayPasses) || 0 })?.crystal || 0) - upkeep,  // ⛑ what the purse actually feels
      banks: madeUnits - soldUnits,
    },
    store: { units: storeTotal(holding), worth: storeWorth(holding, { economy, regionId, cfg }) || 0 },
    features: featuresOf(holding).map(f => ({ kind: f.kind, count: Number(f.count) || 1, name: f.name || null })),
    condition: holding.condition || null,
    unkept: !holding.steward,
  };
}

/** Every yield a hold makes this pass: its own kind's, then each material feature's. */
export function yieldsFor(holding, cfg, { density = null } = {}) {
  const out = [];
  const own = yieldFor(holding, cfg, { density });
  if (own) out.push(own);
  const base = Number((cfg?.yieldByCondition || {})[holding?.condition]);
  if (!Number.isFinite(base) || base <= 0) return out;
  for (const f of featuresOf(holding)) {
    const def = featureDef(f.kind, cfg);
    const good = f.yields || def?.yields;   // the feature's own override first, then the kind's default
    if (def?.family !== "material" || !good) continue;
    const proto = { ...holding, kind: "enterprise", yields: good };
    const y = yieldFor(proto, cfg, { density });
    if (y) out.push({ ...y, units: y.units * (Number(f.count) || 1), feature: f.name || f.kind });
  }
  return out;
}
/** The meaning a hold's temples and shrines add to the place it stands in (SPEC_meaning_density: a hold IS people living somewhere). */
/** ✅ R46b: a meaning feature may carry a POWER-SOURCE FIELD — `substrateSource: {kind: "pool"|"sink", delta}` on the
 *  catalogue kind — and a hold is a STATIONARY aura (SPEC_holding_attributes §3c: "companions already carry substrateAura;
 *  a hold is a stationary aura"). The delta rides the same term a carried charge does, so a temple thickens or thins the
 *  apparatus under it exactly as a Waystaff does in a hand. ⚠️ And a hold may be BOTH — dense in meaning, thin in
 *  apparatus — which is the Numinous's authored problem (R38: meaning is the ceiling, substrate the penalty). */
export function holdingFieldDelta(character, locationId, cfg = null) {
  let d = 0;
  for (const h of holdingsAt(character, locationId)) for (const f of featuresOf(h)) {
    const def = featureDef(f.kind, cfg);
    const src = def?.substrateSource;
    if (!src) continue;
    const sign = String(src.kind) === "sink" ? -1 : 1;
    d += sign * Math.abs(Number(src.delta) || 0) * (Number(f.count) || 1);
  }
  return Math.round(d * 1000) / 1000;
}

/** ✅ R46b: REVENUE FROM PILGRIMS — a hold that earns from ATTENDANCE rather than production. *"A temple yields because
 *  people come, not because it makes a good."* The take scales with the MEANING of the place, which is the thing they come
 *  for; it is paid into the purse, because a pilgrim leaves coin and not ore. */
export function pilgrimIncome(holding, { cfg = null, meaning = 0 } = {}) {
  // ⚠️ the dials sit with the KINDS that name the pilgrims (economy.holdFeatures), not with the store's own numbers
  const p = cfg?.features?.pilgrims || cfg?.pilgrims || null;
  const rate = Number(p?.perPilgrim);
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  let heads = 0;
  for (const f of featuresOf(holding)) {
    const def = featureDef(f.kind, cfg);
    heads += (Number(def?.pilgrims) || 0) * (Number(f.count) || 1);
  }
  if (!heads) return 0;
  const draw = 1 + Math.max(0, Number(meaning) || 0) * (Number(p.perMeaning) || 0);
  return Math.max(0, Math.round(heads * rate * draw));
}

export function holdingMeaningAura(character, locationId, cfg = null) {
  let aura = 0;
  for (const h of holdingsAt(character, locationId)) for (const f of featuresOf(h)) { const def = featureDef(f.kind, cfg); if (def?.family === "meaning") aura += (Number(def.aura) || 0) * (Number(f.count) || 1); }
  return Math.round(aura * 1000) / 1000;
}
