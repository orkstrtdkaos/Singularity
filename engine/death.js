// engine/death.js — SNG-209: death is a STATE, not a terminus.

import { smartClamp } from "./namematch.js";   // SNG-653: the GM's own words about a pledge, clamped at a word boundary
//
// A dead entity is not removed from the world — it is IN THE DEATH STATE at a DEPTH, still on the board,
// potentially retrievable. Depth grades the wall (0 the threshold · 1 the near dark · 2 the deep dark ·
// 3 the sealed) and is COMPUTED from time-dead + body-status + fate-binding, with a GM override. The
// world-tick's clock sinks untended deaths toward sealed — freshly dead is cheap, waiting deepens them,
// long neglect seals them (permanent, and what makes the returnable ones matter). Pure over the entity +
// the current world-day + rules. This is the substrate; the roads BACK (per-tradition method, the retrieval
// quests, player-death UX) are content/design that build ON this model (SNG-209 §3/§4, ROUND 2).

// ⛔ SNG-567 §3.2 (Aevi, on Erik's ruling 2: "mostly it is the ones you have grown closest to") — REACH IS
// RANK **AND BOND**. `bondReach` is how much standing buys a rung: at `bondPerRung` a reacher gains one rung,
// to a ceiling of `bondRungs`. ⚠️ Authorable through `rules.death` like every other dial in this module — the
// numbers are a balance question and they are Erik's and Aevi's to move.
// ⛑ 5 IS NOT A GUESS: it is the number that makes the spec's own worked example true. Aevi wrote "Marrow at
// bond 10 reaches the deep dark" — two rungs at bond 10 — and "an alt who never met you is a stranger with a
// craft, and reaches the threshold at best" — zero rungs at bond 0. Both hold at 5 and the first does not at 6.
// ⛔ CCODE-434 (SNG-627 `healing`): `tendedSinkFactor` — a body lying where the player keeps an infirmary is TENDED, and sinks this many times
// slower (the spans and the seal both). ⚠️ UNAUTHORED — twice stands in, and says so where the GM reads it. The tick stamps `tendedBy`.
const DEFAULTS = { thresholdDays: 1, nearDarkDays: 30, sealAfterDays: 120, bondPerRung: 5, bondRungs: 2, botherAt: 5, tendedSinkFactor: 2 };

/** ⛔ CCODE-434 — HOW MUCH SLOWER THIS DEATH SINKS: its own slowed sinking (`slowSink`), times the infirmary's tending while its body lies
 *  in one. One divisor, read by the depth AND the seal, so a tended death cannot sink slower on one and faster on the other. Pure. */
function sinkDivisor(ds, cfg) {
  const own = Math.max(1, Number(ds?.sinkFactor) || 1);
  const tend = ds?.tendedBy ? Math.max(1, Number(cfg?.tendedSinkFactor) || 1) : 1;
  return own * tend;
}
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
  const days = rawDays / sinkDivisor(ds, cfg);   // ⛔ CCODE-434: a slowed sinking, and a tended body
  let depth = days <= cfg.thresholdDays ? 0 : days <= cfg.nearDarkDays ? 1 : 2;
  if (ds.bodyStatus === "lost" || ds.bodyStatus === "unmade") depth = Math.max(depth, 2);
  return Math.min(3, depth);
}

export function isSealed(entity, currentDay, rules) { return deathDepth(entity, currentDay, rules) >= 3; }

/** ⛔ SNG-566 (Aevi) — "THE ENGINE KNOWS EXACTLY WHERE YOU ARE AND HAS NO WAY TO SAY SO."
 *
 *  ⚑ MEASURED: `deathDepth` has ELEVEN readers across the engine and ZERO in `app.js`. Four depths, a world clock
 *  that reaches the player, holds that stop it and slows that lengthen it — all correct, all wired, and none of it
 *  sayable to the person it is happening to. ⛑ Aevi: "most of this is already built, and it is right." The missing
 *  half was never the model; it was a surface.
 *
 *  ⛔ AND SNG-569 IS THE RULING THAT SHAPES IT. Aevi first argued this should be INVISIBLE while alive, lest a
 *  devotion become a stat line. Erik: "The game needs to show the mechanics somewhere. If Maren IS holding your name
 *  and can use crafts for you, it should indicate that. You can also have it indicate you should have the
 *  conversation with her." ⚠️ HER OWN CORRECTION IS THE BEST ARGUMENT FOR THIS FUNCTION: "hiding a mechanic does not
 *  protect it from becoming a stat line. It just hides it — and a player cannot make a decision about a system they
 *  cannot see." So this returns the FACT and the fact's OWNER, and the surface says both.
 *
 *  ⚠️ PURE, AND IT ANSWERS FOR THE LIVING TOO — `{ dead: false }` with the ladder still described, because the whole
 *  point of a will declared in advance (SNG-568) is that you read this BEFORE it is about you.
 *  Returns { dead, depth, depthName, sealed, daysDead, daysHere, daysLeft, heldOpenBy, willing, sinkFactor, ladder }. */
export function deathStandingFor(entity, { currentDay = null, rules = {} } = {}) {
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const ds = entity?.deathState || null;
  const dead = entity?.status === "dead";
  const depth = dead || ds ? deathDepth(entity, currentDay, rules) : 0;
  const sinkFactor = Math.max(1, Number(ds?.sinkFactor) || 1);
  const rawDays = (currentDay != null && ds?.diedDay != null) ? Math.max(0, currentDay - ds.diedDay) : 0;
  // ⚠️ THE SPANS ARE IN SUNK-DAYS, NOT CALENDAR DAYS, because `sinkFactor` divides before the comparison. Reporting a
  // calendar figure beside a slowed sink would tell a player they have less time than they do — and the whole reason
  // Threnody's slow exists is that it BUYS time. Converted back so the number on the panel is days they can count.
  const bounds = [cfg.thresholdDays, cfg.nearDarkDays, Infinity];
  const sunk = rawDays / sinkFactor;
  const edge = bounds[Math.min(2, depth)];
  // ⛔ A HELD WAY HAS NO DEADLINE AT ALL — that is what holding MEANS, and printing a countdown beside it would be a
  // message claiming a mechanism that is not running.
  const daysLeft = (!dead || ds?.heldOpenBy || !Number.isFinite(edge)) ? null
    : Math.max(0, Math.ceil((edge - sunk) * sinkFactor));

  return {
    dead, depth, depthName: DEATH_DEPTH_NAMES[depth], sealed: depth >= 3,
    daysDead: dead ? Math.round(rawDays) : 0,
    daysLeft,
    heldOpenBy: ds?.heldOpenBy || null,
    // ⚠️ `willing` IS A FACT ABOUT THE DEAD and `holdOpen` says so; null is "never asked", which is a third answer
    // and not the same as a refusal. SNG-568 exists because the one person whose will it is cannot state it.
    willing: ds?.willing ?? null,
    sinkFactor,
    cause: ds?.cause || null,
    bodyStatus: ds?.bodyStatus || null,
    // ⛑ THE LADDER ITSELF, always — a living player reading this is the point, not a side effect.
    ladder: DEATH_DEPTH_NAMES.map((name, i) => ({
      depth: i, name,
      // ⚠️ A SURGE IS A RUNG, NOT A SENTENCE. `reachOf` gives surge = base + 1, so only depths 1 and 2 have a
      // lower rank that a surge can lift; "a surge from rank 0" is not a thing anyone can do.
      reachedBy: i >= 3 ? null : `rank ${i + 1}${i >= 1 ? ` — or rank ${i} with a surge` : ""}`,
      here: i === depth && (dead || !!ds),
    })),
  };
}
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
    if (((currentDay - ds.diedDay) / sinkDivisor(ds, cfg)) >= cfg.sealAfterDays) { ds.sealed = true; sealed.push(e); }   // CCODE-434: the same divisor
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
      wantedBy: w?.byName || null, askerWaiting: w?.waiting || false,
      tendedAt: e.deathState?.tendedBy?.hold || null });   // ⛔ CCODE-434: where their body is tended, and so sinks slower
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
/** ⛔ CCODE-504 (ERIK, 2026-09-25: "Yes on the rolls for return from death … set something smart") — THE
 *  ODDS OF BRINGING SOMEBODY BACK, and they are the odds the resolver rolls.
 *
 *  ⚠️ ASKED ONLY AFTER `canReach` SAYS YES. Being told "that is past your reach" stays FREE — that rule is
 *  older than this one and this must not quietly undo it. THIS is the costly path: a failure sinks them a
 *  depth and a failure at the deep dark SEALS them, so the odds have to be worth the risk, which is why the
 *  deep dark starts on the worse half of a coin.
 *
 *  ⛑ AN ADDITIVE STACK OF NAMED TERMS, like every other number this game shows a player. The reasons come
 *  back with the percentage because a bare number is one to take on faith — the lesson from the fight panel
 *  this week. Every term is a dial in `rules.death.retrieval`; Aevi and Erik turn them.
 *
 *  Returns `{ pct, terms, at, reach, sealed }`. Pure. */
export function retrievalOdds(entity, { rank = 1, intensity = "standard", currentDay = null, rules = {}, bond = 0, reach = null, tier = 0, pledged = false } = {}) {
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const r = cfg.retrieval || {};
  const at = deathDepth(entity, currentDay, rules);
  // ⛔ SNG-655 · AEVI'S DEFECT 3 — THE DEAD'S OWN WILL, BEFORE ANYTHING ELSE. Measured: a person who had
  // refused to be brought back came back a real 70%. `wouldReachFor` honoured the refusal and `canReach` never
  // read it, so the question "would they come?" respected it and the question "does the roll make it?" did not.
  // ⚠️ WHICH IS THE WORSE HALF TO MISS: `wouldReachFor` gates an NPC volunteering, and the PLAYER's own reach
  // never asks it. Erik's rule is that the will outranks every bond, and a percentage is where that is decided.
  // ⛑ AND IT IS FREE, like every other refusal on this ladder — `pct: 0` never rolls, so nobody sinks for
  // having been asked. `refusedByThem` is named apart from `sealed` because the screen must say which it was.
  if (entity?.deathState?.willing === false) {
    return { pct: 0, terms: [], at, reach: null, sealed: false, refusedByThem: true,
      why: "they have refused to come back, and that is honoured" };
  }
  const gate = canReach(entity, { rank, intensity, currentDay, rules, bond, reach });
  if (!gate.ok) return { pct: 0, terms: [], at, reach: gate.reach ?? null, sealed: !!gate.sealed, why: gate.why };
  // ⚠️ EVERY DIAL NAMED LITERALLY, not fetched by a computed key. `unreadRuleConstants` looks for a
  // constant read BY NAME, and a clever accessor hides the whole block from it — which would make these
  // knobs indistinguishable from dead ones. The audit caught exactly that on the first cut.
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const byDepth = Array.isArray(r.byDepth) ? r.byDepth : [70, 45, 20];
  const perReachOver = num(r.perReachOver, 12);
  const perRank = num(r.perRank, 6);
  const perBondRung = num(r.perBondRung, 8);
  const heldOpen = num(r.heldOpen, 15);
  const surge = num(r.surge, -15);          // SNG-655: reaching past your rank is the GAMBLE, so it costs
  const pledge = num(r.pledged, 10);        // SNG-653: a promise made is a road already walked once
  const perTier = num(r.perTier, 5);        // what a greater figure brings, for the world tick's own reaches
  const floor = num(r.floor, 5), ceil = num(r.ceiling, 95);
  const terms = [];
  let pct = Number(byDepth[Math.max(0, Math.min(byDepth.length - 1, at))]) || 0;
  terms.push({ label: `reaching into ${DEATH_DEPTH_NAMES[at]}`, value: pct });
  // ⛔ SNG-655 · AEVI'S DEFECT 4 — `over` COMES FROM THE STANDARD REACH, NEVER THE SURGED ONE.
  // ⚠️ MEASURED, and it inverted the mechanic: a surge raises `reach` by a rung, `over = reach − at` then paid
  // `perReachOver` FOR THE RUNG THE SURGE HAD JUST BOUGHT ITSELF — the threshold went 70% → 82%, rank 2 went
  // 88% → 95%. Straining past your craft was a free bonus. The prose above this function has said since
  // SNG-209 that "a failed reach sinks them, and at the deep dark it seals them": the surge is the gamble, and
  // a gamble that improves your odds is not one.
  // ⛑ I MEASURED IT AT THE DEEP DARK FIRST AND SAW NOTHING, because `reachOf` clamps at 2 and rank 3 is
  // already there — the one case where the surge rung is clamped away is the case I happened to test. Aevi
  // was right and my check asked the question at the one depth that could not answer it.
  // ⚠️ SLACK STILL STEADIES THE HAND — what is retired is slack the surge INVENTED. A rank-3 craft reaching
  // the threshold still has two rungs to spare and is still paid for them.
  const standardReach = Math.min(2, reachOf(rank, "standard") + bondRungs(bond, rules));
  const slack = reach == null ? standardReach : Math.max(0, Math.min(2, Number(reach) || 0));
  const over = Math.max(0, slack - at);
  if (over > 0) { const v = over * perReachOver; pct += v; terms.push({ label: `your reach goes ${over} rung${over === 1 ? "" : "s"} deeper than you need`, value: v }); }
  if (intensity === "surge") { pct += surge; terms.push({ label: `reaching past your craft — a surge is a strain`, value: surge }); }
  const overRank = Math.max(0, (Number(rank) || 1) - 1);
  if (overRank > 0) { const v = overRank * perRank; pct += v; terms.push({ label: `the craft at rank ${rank}`, value: v }); }
  const rungs = bondRungs(bond, rules);
  if (rungs > 0) { const v = rungs * perBondRung; pct += v; terms.push({ label: `what you were to them`, value: v }); }
  if (entity?.deathState?.heldOpenBy) { pct += heldOpen; terms.push({ label: `somebody is holding the way open`, value: heldOpen }); }
  // ⛑ SNG-655 · 5 — THE TWO TERMS THE RULED SPEC HAD AND MINE DID NOT.
  // A PLEDGE is not the bond over again (SNG-653: "a pledge is not a bond stage"): it is a road walked once
  // already, and the caller reads it with `pledgeFrom` because only the caller knows whose pledge to look for.
  if (pledged) { pct += pledge; terms.push({ label: `they said they would come, and it was said aloud`, value: pledge }); }
  // TIER is what a GREATER FIGURE brings — the world tick's own reaches, where there is no craft rank to read.
  const tr = Math.max(0, Math.floor(Number(tier) || 0));
  if (tr > 0) { const v = tr * perTier; pct += v; terms.push({ label: `what they are in the world`, value: v }); }
  const clamped = Math.max(floor, Math.min(ceil, Math.round(pct)));
  return { pct: clamped, terms, at, reach: gate.reach ?? null, sealed: false,
    clampedFrom: clamped !== Math.round(pct) ? Math.round(pct) : null };
}

/** ⛔ CCODE-504 — AND THE ROLL ITSELF, so the % shown is the % rolled. `rng` is injected; the caller decides
 *  what a failure costs by handing the outcome straight to `resolveRetrieval`, which is unchanged. Pure. */
export function rollRetrieval(entity, { rank = 1, intensity = "standard", currentDay = null, rules = {}, bond = 0, reach = null, tier = 0, pledged = false, rng = Math.random } = {}) {
  const odds = retrievalOdds(entity, { rank, intensity, currentDay, rules, bond, reach, tier, pledged });
  if (!odds.pct) return { ...odds, rolled: null, outcome: null, ok: false };
  const rolled = Math.floor(rng() * 100) + 1;      // 1..100, the same d100 every other roll pays
  const made = rolled <= odds.pct;
  return { ...odds, rolled, made, outcome: made ? "return" : "fail" };
}

export function resolveRetrieval(entity, outcome, { currentDay = null, changed = null } = {}) {
  if (!entity || entity.status !== "dead") return { ok: false, why: "not in the death state" };
  const ds = entity.deathState || (entity.deathState = { diedDay: null, bodyStatus: "intact", sealed: false, depthOverride: null, cause: null });
  if (ds.sealed) return { ok: false, why: "sealed — beyond any road back" };
  if (outcome === "return") {
    entity.status = "active";
    entity.returnedFromDeath = { day: currentDay, changed: changed || null }; // §4: return can change them
    delete entity.fateBy;   // ⛔ CCODE-381: the return is the world that made it — not the one whose record of the death this was
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
export function canReach(entity, { rank = 1, intensity = "standard", currentDay = null, rules = {}, bond = 0, reach: stated = null } = {}) {
  if (!entity || entity.status !== "dead") return { ok: false, why: "there is nobody there to reach for" };
  const at = deathDepth(entity, currentDay, rules);
  if (at >= 3) return { ok: false, sealed: true, why: "they are sealed — no rank reaches this" };
  // ⛔ SNG-567 §3.2 — AND THE BOND REACHES TOO. Erik: "mostly it would be the ones you've grown closest to."
  // ⚠️ THIS IS ALSO THE ANSWER TO HIS RULING 6, "make sure the player is limited", and it needs no anti-alt
  // rule: swapping to your own second character is ALLOWED and NATURALLY WEAK, because an alt who never met you
  // is a stranger holding a craft and reaches the threshold at best. A companion at high bond reaches the deep
  // dark. ⛑ THE FICTION IS THE LIMIT, which is the only kind this design has ever wanted.
  const fromBond = bondRungs(bond, rules);
  // ⚠️ A CALLER WITH NO CRAFT RANK MAY STATE THE REACH IT HAS ALREADY RULED. The world tick reaches for the
  // dead of the roster, where the reacher is a FIGURE with a tier and no craft level at all: mapping a tier
  // onto a rank would be inventing a rule nobody has made, and passing rank 1 would silently close the near
  // and deep dark to every NPC retrieval in the game. It states the reach it has always had instead.
  const reach = stated == null ? Math.min(2, reachOf(rank, intensity) + fromBond)
    : Math.max(0, Math.min(2, Number(stated) || 0));
  if (reach < at) {
    // ⚠️ AND THE REFUSAL SAYS WHICH HALF WAS SHORT. "You would need rank 3" is unactionable advice for someone
    // whose rank is already 3 and whose standing is the thing that is missing — and it would read as a bug.
    // ⛔ ERIK 2026-09-14, CORRECTING ME: "the bond shouldn't gate whether someone CAN resurrect you — it gates
    // whether they would BOTHER to. Let's not put rules in place that stop good play."
    // ⚠️ He is right, and a line I had written here said the opposite: "rank alone does not go this deep; it
    // takes someone who was close to them." ⛑ THAT WAS FALSE AND UNREACHABLE AT ONCE — rank 3 already reaches the
    // deep dark, so the branch could never fire, and it still stated a rule the design does not have. A dead
    // branch that lies is worse than one that does nothing: the next reader believes it.
    // ⚑ THE BOND ONLY EVER ADDS. Every reach that worked before this term existed works now (gated in §220), so
    // the refusal names it as a ROAD and never as a requirement.
    const why = fromBond > 0
      ? `${DEATH_DEPTH_NAMES[at]} is past your reach — your craft and what you were to them together fall ${at - reach} short`
      : `${DEATH_DEPTH_NAMES[at]} is past your reach — you would need rank ${at + 1}${at < 2 ? ", a surge, or someone closer to them" : ", or someone closer to them"}`;
    return { ok: false, refused: true, at, reach, fromBond, why };
  }
  return { ok: true, at, reach, fromBond };
}

/** ⛔ SNG-567 §3.2 — HOW MANY RUNGS STANDING BUYS. Pure, and bounded by a ceiling so that a bond can carry a
 *  reacher deeper but can never reach the SEALED: `canReach` refuses depth 3 before this is ever consulted, and
 *  Erik's ruling on the sealed is that nothing reaches it. ⚠️ NEGATIVE STANDING BUYS NOTHING — it does not push
 *  a reacher backwards, because someone who hated you still knows the way; they simply have no help from it. */
/** ⛔ SNG-567 · ERIK 2026-09-14 — "THE BOND GATES WHETHER THEY WOULD BOTHER TO."
 *
 *  ⛑ THIS IS WHERE STANDING BELONGS, AND IT FORBIDS NOTHING. A player may always ask anyone; a person with no
 *  reason to come simply does not volunteer, which is a scene rather than a rule. ⚠️ `canReach` answers CAN;
 *  this answers WOULD, and the two must never be the same function — conflating them is how a design ends up
 *  telling a player that love is a prerequisite for a craft.
 *
 *  ⛔ AND A REFUSAL TO BE BROUGHT BACK OUTRANKS EVERY BOND. `open_threshold` already rules it in its own words:
 *  "it is up to the one in the dark whether they come — the only one that can fail because THEY CHOSE NOT TO."
 *  Erik: "depending on what the bonded NPC wants AND WHAT YOUR WILL WAS." The will is the dead person's, it is
 *  stored on them rather than on the caster, and it is honoured first. PURE. */
export function wouldReachFor(dead, reacher, { rules = {} } = {}) {
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const at = Math.max(0, Number(cfg.botherAt) || 0);
  const bond = Number(reacher?.relationship);
  const name = reacher?.name || "they";
  if (dead?.deathState?.willing === false) {
    return { would: false, honoured: true, bond: Number.isFinite(bond) ? bond : 0,
      why: `${name} would come — but you have refused to be brought back, and that is honoured` };
  }
  if (!Number.isFinite(bond) || bond < at) {
    return { would: false, bond: Number.isFinite(bond) ? bond : 0,
      why: `${name} has no particular reason to go down after you` };
  }
  return { would: true, bond, why: `${name} would come for you` };
}

export function bondRungs(bond = 0, rules = {}) {
  const cfg = { ...DEFAULTS, ...(rules.death || {}) };
  const per = Math.max(1, Number(cfg.bondPerRung) || 6);
  const cap = Math.max(0, Number(cfg.bondRungs) ?? 2);
  const b = Number(bond);
  if (!Number.isFinite(b) || b <= 0) return 0;
  return Math.min(cap, Math.floor(b / per));
}

/** ⛔ A WAY HELD OPEN, AND ITS OWNER MAY WALK AWAY. Aevi's point 4 — `open_threshold` r3 leaves one standing
 *  WITHOUT its caster, and `kept_breath` holds someone at the threshold so they never enter it.
 *  ⚠️ IT STOPS THE CLOCK, which is why it is a different verb from slowing. `deepenDeaths` honours it. */
/* ═════ SNG-653 · THE PLEDGE — "HAVE THEY SAID SO?" ═════
 *
 * ⛔ THE THIRD QUESTION, WHICH HAD NO ANSWER. This module already insists that CAN and WOULD are different
 * questions — "`canReach` answers CAN; `wouldReachFor` answers WOULD, and the two must never be the same
 * function". There is a third, and it is the one a player actually acts on: HAVE THEY SAID SO.
 *
 * ⚠️ ERIK MET THE GAP IN PLAY. Loki's history carries the scene word for word — *"she accepted Loki's
 * confession and made a mutual vow: if death claims one, the other will reach for them. She held Loki's wrist
 * when she said yes. The pact is made."* — and the screen kept saying *"that is a conversation to have with
 * them, not a setting"*, because `wouldReachFor` reads the BOND and a bond is not a promise. Nothing changed
 * after the conversation because nothing could: measured across all 14 saves, no pledge-shaped field exists
 * anywhere.
 *
 * ⛑ A PLEDGE IS NOT A BOND STAGE (Aevi, settled 2026-09-25). Vess is already `committed`; two people can be
 * committed without this promise and can make this promise without being committed. It is its own record.
 */

/** The pledges a character holds, always an array. */
export function pledgesOf(character) { return Array.isArray(character?.pledges) ? character.pledges.filter(Boolean) : []; }

/** Has this person said they will come? Returns the pledge record or null. */
export function pledgeFrom(character, npcId) {
  const id = String(npcId || "");
  return pledgesOf(character).find(p => p && String(p.npcId) === id && !p.released) || null;
}

/** ⛔ RECORDING ONE. `mutual` means the player promised back, which is a SECOND fact about the same scene and
 *  the reason the screen can say "you have promised to go for: Vess" — it matters when she is the one who falls.
 *  `words` is the GM's own account of what was said, kept verbatim so the record reads as the scene did. */
export function recordPledge(character, { npcId, day = null, mutual = false, words = null, source = "play" } = {}) {
  if (!character || !npcId) return { ok: false, why: "a pledge needs a person" };
  character.pledges = pledgesOf(character);
  const id = String(npcId);
  const had = character.pledges.find(p => String(p.npcId) === id);
  // ⚠️ `smartClamp`, not a slice — these are the GM's own words about what was said, and cutting a promise
  // mid-word is the thing the ratchet exists to stop. It was a `slice(0, 400)` and the audit caught it.
  const rec = { npcId: id, day: day ?? null, mutual: !!mutual, words: words ? smartClamp(String(words), 400) : null, source };
  if (had) {
    // ⚠️ A SECOND SAYING DOES NOT ERASE THE FIRST DAY. What changes is what was said and whether it went both
    // ways; when it was made is history, and a promise renewed is not a promise newly made.
    Object.assign(had, { mutual: !!mutual || !!had.mutual, words: rec.words || had.words, source });
    delete had.released; delete had.releasedDay;
    return { ok: true, pledge: had, renewed: true };
  }
  character.pledges.push(rec);
  return { ok: true, pledge: rec, renewed: false };
}

/** ⛔ TAKING IT BACK IS SPOKEN OUT LOUD — never a silent removal (the CCODE-469 lesson). The record stays and
 *  is marked released, so the screen can say a promise was withdrawn rather than quietly showing one fewer name. */
export function releasePledge(character, npcId, { day = null } = {}) {
  const p = pledgesOf(character).find(x => String(x.npcId) === String(npcId) && !x.released);
  if (!p) return { ok: false, why: "no standing pledge from them" };
  p.released = true; p.releasedDay = day ?? null;
  return { ok: true, pledge: p };
}

/** ⛔ THE THREE QUESTIONS, ANSWERED TOGETHER AND KEPT APART — what the "who comes for you" screen renders.
 *
 *  ⚠️ CAN IS DERIVED, AND SAYS SO. Measured 2026-09-25: of 114 registry people across 14 saves, ZERO store a
 *  level and ZERO store crafts — but `npcsheet` derives both for 114 of 114, and `canReach` then answers
 *  DIFFERENTLY for them (a child reaches the threshold; a smith and an engineer reach the near dark). So the
 *  honest answer is the derived one, LABELLED: `seen` is true where `skillsObserved` backs it, and the screen
 *  says "as far as you have seen her work" otherwise. ⛑ Aevi's first draft said "unknown", and unknown would
 *  have been the answer for every person in the game — a column nobody opens twice.
 *
 *  `rankFor` is injected (the app hands it `npcsheet`'s derived rank) so this file stays pure and does not
 *  learn about sheets. Pure. */
export function whoComesFor(character, people = {}, { rules = {}, rankFor = null, currentDay = null, depths = [0, 1, 2] } = {}) {
  const out = [];
  for (const [id, n] of Object.entries(people || {})) {
    if (!n || typeof n !== "object") continue;
    if (n.status === "dead" || n.status === "departed") continue;
    const bond = Number(n.relationship) || 0;
    const pledge = pledgeFrom(character, id);
    const would = wouldReachFor(character, n, { rules });
    const rank = rankFor ? Math.max(1, Number(rankFor(n)) || 1) : 1;
    // ⚠️ ONE PROBE PER DEPTH, through the engine's own gate — never a recomputation of it.
    const reach = depths.map(d => {
      const probe = { status: "dead", deathState: { diedDay: (Number(currentDay) || 0) - 1, depthOverride: d } };
      const r = canReach(probe, { rank, bond, rules, currentDay });
      return { depth: d, name: DEATH_DEPTH_NAMES[d], can: !!r.ok, why: r.why || null, short: r.short || null };
    });
    out.push({ id, name: n.name || id, bond, pledge, mutual: !!pledge?.mutual,
      would: !!would.would, whyWould: would.why || null,
      seen: Array.isArray(n.skillsObserved) && n.skillsObserved.length > 0,
      rank, reach, canAtAll: reach.some(r => r.can) });
  }
  // ⛑ SORTED BY BOND, as the spec asks — the people who would come first, then the rest.
  return out.sort((a, b) => (b.pledge ? 1 : 0) - (a.pledge ? 1 : 0) || b.bond - a.bond);
}

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

