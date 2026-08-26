// engine/intercept.js — CCODE-246 / SPEC_intercept_and_reflect. STANDING IN FRONT OF SOMEONE ELSE.
//
// ⛔ THE GAME HAS NO INTERCEPTION AT ALL. `shield` and `ward` blunt what reaches YOU; nothing lets a
// character take a hit meant for an ally. That is a whole party role — the tank — missing from a game that
// already has soak layers, typed wards, imposed conditions and resist thresholds. ⚠️ THE PIECES WERE ALL
// THERE AND NOTHING CONNECTED THEM.
//
// ⛔ AND MOST OF THE SPINE ALREADY EXISTED, which is why this file is small. `resolveImposition` computes
// `threshold = base + targetResist × perResist − (rank−1) × perRank`, and a failed resist DEGRADES rather
// than evaporating. So "you take it unless you resist, and resisting softens rather than negates" was
// built. The only missing idea is AN IMPOSITION LANDING ON SOMEONE OTHER THAN WHO IT WAS AIMED AT.
//
// ⚠️ THIS FILE INVENTS NO MAGNITUDE. Erik's "boosted" reflection reuses the `onCrit` condition every
// imposing craft already authors (`keening` carries `onCrit: incapacitated`); where a craft authors none,
// the original condition reflects unboosted rather than a number appearing from nowhere.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ r1 IS ONE ALLY, ONE CONDITION — Aevi's §4.4, and it is the floor of a ladder that has somewhere to
 *  go: r2 buys duration and coverage, r3 buys reflection. If r1 covered several, r2 could only buy
 *  duration and the craft would flatten. ⚠️ A single-use intercept is also a real decision at the table —
 *  you have to guess which hit matters, which is what makes a tank interesting rather than automatic. */
// ⚠️ `resistBonus = null`, NOT ` = 0`. A parameter default of 0 SHADOWS the fallback below — `num(0, 2)`
// returns 0 because 0 is a perfectly good number — so r2 hardened the taker by nothing at all. Third time
// this session a default has swallowed a fallback, and the same root as `Number(null) === 0`: an ABSENT
// value has to stay absent long enough for the default to run.
export function openProtection({ protectorId, allyId, rank = 1, roundsLeft = null, resistBonus = null , catches = null } = {}) {
  const r = Math.max(1, num(rank, 1));
  return {
    // ⛔ CCODE-260 / ERIK: "the skill that lets you intercept was a Death skill and was for conditions - so
    // that was correct... however, some skills (yet to be allocated) will likely let you intercept a blow
    // (damage) as well. so keep that in mind."
    // ⚠️ SO INTERCEPTION IS TYPED, AND CONDITIONS ARE THE DEFAULT because the only craft that opens one
    // today authors `interceptCondition` — the key name says it. ⛔ I HAD MADE EVERY PROTECTION CATCH BLOWS,
    // which quietly handed `shared_weight` a power its author never gave it. A reader built ahead of the
    // content it serves is right; a reader that ASSUMES the content is not.
    catches: Array.isArray(catches) && catches.length ? catches.slice() : ["condition"],
    protectorId, allyId, rank: r,
    // r1 is spent by ONE imposition; r2+ runs for its duration
    chargesLeft: r >= 2 ? null : 1,
    roundsLeft: r >= 2 ? Math.max(1, num(roundsLeft, 2)) : null,
    // ⛔ r2 HARDENS THE TAKER — Erik: "you are fuelling yourself with their emotion." ⚠️ AND THE EXISTING
    // ARITHMETIC ALREADY REWARDS IT: `threshold` scales with targetResist, so a hardened taker degrades
    // more of what it catches. The rule and the maths agree without a second mechanism.
    resistBonus: r >= 2 ? Math.max(0, num(resistBonus, 2)) : 0,
    reflects: r >= 3,
    caught: [],
  };
}

/** ⛔ CCODE-246b — THE PROTECTION A CRAFT ACTUALLY AUTHORS. Aevi wrote `shared_weight` to the spec:
 *
 *    r1  interceptCondition: { allies: 1, charges: 1 }
 *    r2  interceptCondition: { allies: 1, rounds: 6, resistBonus: 2 }
 *    r3  interceptCondition: { … }  +  reflectCondition: true
 *
 *  ⚠️ READ RANK-FIRST via `authoredBlock`, which is §45.1's one reader — the field is authored on the
 *  RANK, and a reader looking at the ability level would find nothing for all three tiers, forever.
 *
 *  ⛔ AND THE AUTHORED NUMBERS DECIDE, NOT MY DEFAULTS. `openProtection`'s fallbacks exist for a craft
 *  that authors a partial spec; where Aevi wrote a number it is the number. That is the difference between
 *  a reader and a second opinion. */
export function protectionFromCraft(ability, rank, { protectorId, allyId, authoredBlock } = {}) {
  if (!ability || typeof authoredBlock !== "function") return null;
  const r = Math.max(1, num(rank, 1));
  // ⛔ CCODE-260 — TWO AUTHORED DOORS, AND ONLY ONE OF THEM EXISTS IN CONTENT TODAY. `interceptCondition`
  // is `shared_weight`'s (Threnodist, Death) and it catches bindings. `interceptDamage` is the reader for
  // the crafts Erik says are coming — unauthored by anything right now, and that is the correct state:
  // build the reader, default the dial to a no-op, let content turn it on.
  const condSpec = authoredBlock(ability, "interceptCondition", r);
  const dmgSpec = authoredBlock(ability, "interceptDamage", r);
  const spec = condSpec || dmgSpec;
  if (!spec) return null;
  const catches = [];
  if (condSpec) catches.push("condition");
  if (dmgSpec) catches.push("damage");
  const reflects = authoredBlock(ability, "reflectCondition", r) === true;
  const p = openProtection({
    protectorId, allyId, rank: r,
    roundsLeft: spec.rounds ?? null,
    resistBonus: spec.resistBonus ?? null,
    catches,
  });
  // ⚠️ THE AUTHORED SHAPE OVERRIDES THE RANK HEURISTIC. `openProtection` infers charges/duration from
  // the rank because a craft may author neither; when the craft DOES say, the craft wins.
  // ⚠️ `roundsLeft` IS ALREADY SET — it rides in through `openProtection` above. I had a second
  // assignment here and a mutation removing it changed nothing, which is how I learned it was dead code.
  // A line that cannot be broken is a line that does nothing.
  if (spec.charges != null) p.chargesLeft = Math.max(0, num(spec.charges, 1));
  else if (spec.rounds != null) p.chargesLeft = null;
  // ⛔ REFLECTION IS AUTHORED, NOT INFERRED FROM RANK. A future craft could reflect at r2, or never.
  p.reflects = reflects;
  p.allies = Math.max(1, num(spec.allies, 1));
  p.fromCraft = ability.id || null;
  return p;
}

/** The resist a sheet brings, plus whatever a running protection is lending it. */
export function effectiveResist(sheet, protection = null, { attr = "mental" } = {}) {
  const base = Math.max(0, num(sheet?.attributes?.[attr], 0));
  return base + Math.max(0, num(protection?.resistBonus, 0));
}

/** ⛔ WHO CATCHES IT. Aevi's §4.3 recommendation, and I agree with her three reasons: it is DETERMINISTIC
 *  (last-declared invites players to sequence turns to game who eats the hit), it REWARDS THE RIGHT BUILD
 *  (the character who invested in being the tank is the tank), and it SELF-BALANCES — the highest-resist
 *  interceptor also degrades and reflects the most, so the rule and the arithmetic point the same way.
 *
 *  ⚠️ TIES BREAK BY LAST-DECLARED, which keeps Erik's other option as the tiebreaker rather than throwing
 *  it away. `protections` is in declaration order. */
export function interceptorFor(allyId, protections = [], sheets = {}, opts = {}) {
  const live = (protections || []).filter(p =>
    p && p.allyId === allyId
    && (p.chargesLeft == null || p.chargesLeft > 0)
    && (p.roundsLeft == null || p.roundsLeft > 0));
  if (!live.length) return null;
  let best = null, bestResist = -Infinity;
  for (const p of live) {                                   // declaration order → later wins a tie
    const r = effectiveResist(sheets[p.protectorId], p, opts);
    if (r >= bestResist) { best = p; bestResist = r; }
  }
  return best ? { protection: best, resist: bestResist } : null;
}

/** ⛔ WHAT GOES BACK TO THE SOURCE, BY DEGREE. Erik: "a clean resist sends original, a marginal resist
 *  sends the degraded one, a full resist sends original boosted."
 *
 *  ⚠️ THESE ARE NOT NEW NUMBERS. The margin→degree ladder is already content-dialled (crit 40 / success 15
 *  / partial 0), and Erik's three tiers map straight onto it — which is why this takes a degree rather than
 *  a margin: the caller has already computed it the same way every other branch does.
 *
 *  ⛔ REFLECTION IS EARNED. A failed resist reflects NOTHING and the interceptor carries the degraded
 *  condition, exactly as r2 — Erik's "maybe" kept as written, because automatic reflection turns r3 from a
 *  risk into a wall. */
export function reflectByDegree(degree, { condition, degradesTo = null, onCrit = null } = {}, opts = {}) {
  const canReflect = opts.reflects !== false;
  if (!canReflect) return { reflects: false, why: "this protection does not reflect (needs rank 3)" };
  if (degree === "crit_success") {
    // "boosted" = the craft's OWN authored escalation. Where a craft authors none, the original reflects
    // unboosted — an invented magnitude would be a balance number nobody ruled on.
    const boosted = onCrit ? String(onCrit).toLowerCase() : null;
    return { reflects: true, condition: boosted || condition, boosted: !!boosted,
      why: boosted ? "a full resist sends it back escalated" : "a full resist sends it back (this craft authors no escalation)" };
  }
  if (degree === "success") return { reflects: true, condition, boosted: false, why: "a clean resist sends the original back" };
  if (degree === "partial") return { reflects: true, condition: degradesTo || condition, boosted: false, degraded: true,
    why: "a marginal resist sends back the degraded form" };
  return { reflects: false, carries: degradesTo || condition, why: "the resist failed — nothing reflects and the interceptor carries it" };
}

/** ⛔ THE WHOLE REDIRECT. Given an imposition aimed at `aimedAt`, decide who actually resolves it.
 *  Returns null when nobody is standing in front — the caller then proceeds exactly as before, which is
 *  what keeps this additive rather than a rewrite of the imposition path.
 *
 *  ⚠️ IT RESOLVES AGAINST THE INTERCEPTOR'S OWN SHEET — their resist, their wards, their soak. That is the
 *  entire point: the tank is BETTER at eating it, and a redirect that used the ally's numbers would be
 *  bookkeeping rather than a mechanic. */
export function redirectImposition({ aimedAt, sourceId = null, protections = [], sheets = {},
  imposition = null, degree = null, attr = "mental", resolveFn = null } = {}) {
  const found = interceptorFor(aimedAt, protections, sheets, { attr });
  if (!found) return null;
  const { protection, resist } = found;

  // ⛔ RE-RESOLVED AGAINST THE INTERCEPTOR, NOT INHERITED FROM THE ALLY. Aevi's §5.1: "their resist, their
  // wards, their soak." The imposition handed in was computed against the person it was AIMED at, and
  // reusing that verdict would make the tank a bookkeeping entry rather than a mechanic — the whole point
  // is that the tank is BETTER at eating it, and a hardened r2 taker degrades more of what it catches.
  // ⚠️ INJECTED, so this module stays pure and the caller keeps owning the imposition rules.
  const re = typeof resolveFn === "function" ? resolveFn({ targetResist: resist, protection }) : null;
  const eff = re || imposition;
  const cond = eff?.condition || null;
  if (!cond) return null;

  const back = protection.reflects
    ? reflectByDegree(degree, { condition: cond, degradesTo: eff?.degradedTo || eff?.degradesTo || null,
        onCrit: eff?.onCrit || imposition?.onCrit || null }, { reflects: true })
    : { reflects: false, carries: cond };

  return {
    caughtBy: protection.protectorId,
    onBehalfOf: aimedAt,
    rank: protection.rank,
    resist,
    // ⚠️ STATED SO A CALLER CANNOT QUIETLY SKIP IT: whether the imposition was re-run against the
    // interceptor's own numbers, or inherited from the ally because no resolver was supplied.
    reResolved: !!re,
    // ⛔ WHO ENDS UP WITH WHAT — the receipt Aevi's §5.5 asks for. "A tank mechanic nobody can see is a
    // tank mechanic nobody thanks."
    lands: back.reflects ? { on: sourceId, condition: back.condition, reflected: true, boosted: !!back.boosted }
      : { on: protection.protectorId, condition: back.carries || cond, reflected: false },
    why: back.why || `${protection.protectorId} stepped in front of ${aimedAt}`,
    protection,
  };
}

/** Spend the protection this hit used, and age the sustained ones. ⚠️ SEPARATE FROM THE DECISION, so a
 *  redirect can be inspected without consuming anything — the same split `advanceSeeking` needed, and for
 *  the same reason: being caught is not the same as the charge being spent. */
export function spendProtection(protection) {
  if (!protection) return null;
  if (protection.chargesLeft != null) protection.chargesLeft = Math.max(0, protection.chargesLeft - 1);
  return protection;
}

export function tickProtections(protections = []) {
  const live = [];
  for (const p of (protections || [])) {
    if (!p) continue;
    if (p.roundsLeft != null) p.roundsLeft = Math.max(0, p.roundsLeft - 1);
    const spent = (p.chargesLeft != null && p.chargesLeft <= 0) || (p.roundsLeft != null && p.roundsLeft <= 0);
    if (!spent) live.push(p);
  }
  return live;
}

/** ⚠️ WHAT THIS PROTECTION IS ACTUALLY STANDING IN FRONT OF. Two questions, never one — a craft that eats a
 *  binding meant for an ally is not thereby a craft that eats a spear, and Erik's Death skill is the former. */
export function catchesCondition(p) { return (p?.catches || ["condition"]).includes("condition"); }
export function catchesDamage(p) { return (p?.catches || ["condition"]).includes("damage"); }
