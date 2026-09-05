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
export function addHolding(character, { id, kind = "post", name = null, locationId = null, steward = null, obligation = null, day = null, fromAssignment = null } = {}) {
  ensureHoldings(character);
  if (!id || !HOLDING_KINDS.includes(kind)) return null;
  let h = character.holdings.find(x => x.id === id);
  if (!h) {
    // ⛔ THE LINK LIVES ON THE HOLDING, NOT THE ASSIGNMENT. The assignment is FINITE — it has a `done` —
    // and the holding is not. ⚠️ A field on the terminal record is lost exactly when the relationship
    // becomes interesting: the moment the work completes is the moment you want to know what it built.
    // ⛔ AND NOT A DERIVED JOIN on npcId + charge — that works today and breaks the first time a steward
    // is replaced, which is precisely the event SNG-355 exists to model.
    h = { id, kind, name: name || id, locationId, steward, obligation, condition: "holding", claimedDay: day, lastMovedWorldCount: null, history: [], ...(fromAssignment ? { fromAssignment } : {}) };
    character.holdings.push(h);
  } else {
    if (name) h.name = name;
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
    `- ${h.name} (${h.kind}, ${h.condition}${h.steward ? `, kept by ${h.steward}` : (effects?.unstewardedCeiling ? ", kept by your name" : ", UNKEPT")})${here.has(h.id) ? " — YOU ARE STANDING IN IT" : ""}${storeTotal(h) > 0 ? ` · store: ${Object.entries(h.store).filter(([, n]) => n > 0).map(([g, n]) => `${n} ${g}`).join(", ")}` : ""}${h.arrears ? ` · in arrears ${h.arrears}` : ""} · ${holdingSentence(h, { nameOf })}`
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
export function yieldFor(holding, cfg) {
  if (!holding || !cfg) return null;
  const goods = holding.yields || (cfg.defaultYield || {})[holding.kind] || null;
  if (!goods) return null;
  const units = Number((cfg.yieldByCondition || {})[holding.condition]);
  return Number.isFinite(units) ? { goods: String(goods), units } : null;
}
export function upkeepFor(holding, cfg) {
  if (!holding || !cfg) return 0;
  const u = holding.upkeepCost ?? (cfg.upkeepByKind || {})[holding.kind];
  return Math.max(0, Number(u) || 0);
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
export function tickStore(character, holding, { cfg = null, economy = null, regionId = null, dangerLevel = 0, rng = Math.random, day = null } = {}) {
  if (!holding || !cfg) return null;
  const out = { yielded: null, upkeep: 0, short: 0, raid: null, full: false, justFull: false };
  const y = yieldFor(holding, cfg);
  if (y && y.units > 0) {
    holding.store = holding.store && typeof holding.store === "object" ? holding.store : {};
    holding.store[y.goods] = (Number(holding.store[y.goods]) || 0) + y.units;
    out.yielded = y;
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
    if (holding.defence || holding.garrison) p *= Number.isFinite(Number(raid.defendedMult)) ? Number(raid.defendedMult) : 0.5;
    if (rng() < p) {
      const share = Math.max(0, Math.min(1, Number.isFinite(Number(raid.takeShare)) ? Number(raid.takeShare) : 0.5));
      const taken = {};
      for (const [g, n] of Object.entries(holding.store || {})) {
        const t = Math.floor((Number(n) || 0) * share);
        if (t > 0) { holding.store[g] = (Number(n) || 0) - t; taken[g] = t; }
      }
      if (Object.keys(taken).length) {
        out.raid = { taken, day };
        holding.history = [...(holding.history || []), { at: null, from: holding.condition, to: holding.condition,
          note: `raided — ${Object.entries(taken).map(([g, n]) => `${n} ${g}`).join(", ")} taken` }].slice(-12);
      }
    }
  }
  return out;
}
/** Only what deserves telling: a raid, a keep unpaid, a store that has just filled. A store that simply grows is not news. */
export function storeNews(holding, st) {
  if (!holding || !st) return [];
  const where = holding.name || holding.id;
  const lines = [];
  if (st.raid) lines.push(`Raiders hit ${where} — ${Object.entries(st.raid.taken).map(([g, n]) => `${n} ${g.replace(/_/g, " ")}`).join(", ")} taken.${holding.defence || holding.garrison ? " The watch was not enough." : " Nobody was there to stop them."}`);
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
