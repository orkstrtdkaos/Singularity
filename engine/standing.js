// standing.js — BATCH-12 §3. How a PEOPLE regards you, as opposed to how a settlement does.
//
// Erik's report is the whole brief: he carries a Radiant teacher and a bound Ashwarden teacher and
// is at ZERO with both. Standing existed but nothing fed it — `peopleDisposition` was written by
// exactly one path (a structured quest with a `people` effect), so a character who had never taken
// such a quest saw an empty screen forever, including one who was BORN to the people in question.
//
// Four feeds, in the order they were missing:
//   §3b  seeded at creation from the domains you chose — being Rootkin-born should mean something
//   §3c  passive accrual per IN-GAME DAY from the company you keep (the Calvar case)
//   §3d  standingOps — a narrative act that plainly helps or offends a people, model-reported and
//        engine-adjudicated, same discipline as SNG-162
//   (quest `people` effects already worked and are untouched)
//
// WHY A NEW MODULE, NOT AN EXTENSION OF reputation.js: reputation.js is deed-sourced settlement
// standing with a transitive reach of 8 (ENGINE_MAP). This is a different source — durable
// per-people integers — and lands on a fresh module with reach 1. §3e's "one shape" is honoured at
// the API (`standingFor`/`standingRoster` answer for every holder kind), not by merging the files.
//
// Pure. No I/O, no clock read — the caller passes `days`. Fully testable.

import { standingWith, standingWithPeople } from "./reputation.js";
import { antipodeOf } from "./traditions.js";

export const STANDING_KINDS = ["people", "settlement"];

// §3b seeds. Decreasing by how close the people is to who you are. `known` (4) is the largest,
// deliberately: birth makes you RECOGNISED, not trusted — trust is still play's to earn.
export const CREATION_SEEDS = { primary: 4, secondary: 2, tertiary: 1, antipode: -1 };

// §3c rates, per in-game day, per qualifying company member. Small on purpose: the Calvar case is
// "slowly over time", and a party member should never out-earn a deed.
export const DRIP = {
  base: 0.25,        // any company member who represents a people
  teacher: 0.5,      // a bound, willing teacher of that people (character.teachers[tid].willing)
  liaison: 1.5,      // multiplier — matches company.js LIAISON_MULT so the two cannot drift apart
  focused: 3,        // multiplier for a day whose work was actually with that people
  floor: 0.15        // deceleration never reaches zero (see below)
};

// "Small and uncapped-slow" (§3c) taken literally would let a party member idle you to `kin`, which
// is the band the spec reserves for earned closeness. Rather than impose a cap the spec did not ask
// for, the rate DECELERATES with score: at 0 you drip at full rate, near `kin` at ~a third, and it
// never stops. Uncapped, genuinely slow, and `kin` stays something you arrive at rather than wait
// out. One constant to retune if it reads wrong in play.
export function dripScale(score) {
  return Math.max(DRIP.floor, 1 - (Number(score) || 0) / 30);
}

function ensure(character) {
  if (character && !character.peopleDisposition) character.peopleDisposition = {};
  return character;
}

function bandOf(score, rules) {
  const bands = rules?.peopleStandingBands || [{ min: 0, band: "neutral" }];
  for (const b of bands) if (Math.round(score) >= b.min) return b.band;
  return bands[bands.length - 1].band;
}

/** Append a receipt. Standing that moves without a reason the player can read is standing they will
 *  not trust — same argument as every other ✦ line in the app. Capped; oldest fall off. */
function note(character, entry) {
  character.standingLedger = [...(character.standingLedger || []), entry].slice(-24);
}

/** §3b — seed people-standing from the domains chosen at creation. Idempotent: it never overwrites a
 *  people you already have standing with, so running it on an existing save (reconcile) adds only
 *  what was missing and cannot inflate a score play has already moved. */
export function seedStandingAtCreation(character, { traditionIndex = null, rules = {}, day = null } = {}) {
  ensure(character);
  const d = character.domains || {};
  const seeded = [];
  const put = (tid, amount, why) => {
    if (!tid) return;
    if (character.peopleDisposition[tid] !== undefined) return;   // play already speaks for this one
    character.peopleDisposition[tid] = amount;
    seeded.push({ people: tid, delta: amount, why });
  };
  put(d.primary, CREATION_SEEDS.primary, "born to this people");
  put(d.secondary, CREATION_SEEDS.secondary, "kin to this people");
  put(d.tertiary, CREATION_SEEDS.tertiary, "a hand in this people's craft");
  if (d.primary && traditionIndex) {
    const anti = antipodeOf(d.primary, traditionIndex);
    if (anti) put(anti, CREATION_SEEDS.antipode, "the far side of the circle from your own");
  }
  if (seeded.length) {
    note(character, { at: day, kind: "seed", entries: seeded, text: `Your birth and training are known: ${seeded.map(s => `${s.people} ${s.delta >= 0 ? "+" : ""}${s.delta}`).join(", ")}.` });
  }
  return { seeded, count: seeded.length };
}

/** Which peoples does the company earn standing with, and how fast?
 *  A member counts through any of three routes — the trainer's `teaches`, the liaison's `liaisonFor`,
 *  or a durable willing teacher in `character.teachers`. Erik's Calvar reaches it by the third.
 *  Returns { [people]: perDayRate } BEFORE deceleration. Pure. */
export function companyStandingRates(character, { focusedPeople = [] } = {}) {
  const rates = {};
  const bump = (tid, amount) => { if (tid) rates[tid] = (rates[tid] || 0) + amount; };
  for (const m of character?.company || []) {
    if (m.teaches) bump(m.teaches, DRIP.base);
    if (m.liaisonFor) bump(m.liaisonFor, DRIP.base * DRIP.liaison);
  }
  for (const [tid, t] of Object.entries(character?.teachers || {})) {
    if (t && t.met && t.willing) bump(tid, DRIP.teacher);
  }
  const focus = new Set((focusedPeople || []).filter(Boolean));
  for (const tid of Object.keys(rates)) if (focus.has(tid)) rates[tid] *= DRIP.focused;
  return rates;
}

/** §3c — advance passive standing by `days` in-game days. The in-game day is the clock (ROUND 2:
 *  per-scene rewards a talky evening, per-session rewards real-world habit; only the world's day
 *  means the same thing to the fiction and the player). Fractions accumulate; display rounds. */
export function accrueStandingForDays(character, days, { rules = {}, focusedPeople = [], day = null } = {}) {
  ensure(character);
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return { moved: [], days: 0 };
  const rates = companyStandingRates(character, { focusedPeople });
  const moved = [];
  for (const [tid, rate] of Object.entries(rates)) {
    const before = character.peopleDisposition[tid] || 0;
    const gain = rate * n * dripScale(before);
    if (gain <= 0) continue;
    const after = before + gain;
    character.peopleDisposition[tid] = after;
    const bandBefore = bandOf(before, rules), bandAfter = bandOf(after, rules);
    if (bandBefore !== bandAfter) {
      moved.push({ people: tid, from: bandBefore, to: bandAfter, score: Math.round(after) });
      note(character, { at: day, kind: "drip", people: tid, text: `The ${tid} now count you ${bandAfter}.` });
    }
  }
  return { moved, days: n, peoples: Object.keys(rates) };
}

/** §3d — standingOps from the GM. The model REPORTS what happened; the engine adjudicates.
 *  Three clamps, each for a reason play would notice:
 *    · delta bounded to ±3 — a scene is not a life
 *    · a single op may not cross a band boundary; it stops at the edge and says so. Bands are what
 *      the player reads, so a jump from `neutral` to `trusted` in one narrated beat reads as the
 *      engine being talked into something
 *    · unknown people, non-finite delta, or a missing `why` are refused, and the refusal is RECORDED
 *      rather than swallowed — a GM that keeps naming a people that does not exist should be visible
 */
export function applyStandingOps(character, ops = [], { rules = {}, knownPeople = null, day = null, liaisonMult = {} } = {}) {
  ensure(character);
  const applied = [], refused = [];
  for (const raw of (Array.isArray(ops) ? ops : []).slice(0, 4)) {
    const tid = raw && raw.people ? String(raw.people).trim() : "";
    const why = raw && raw.why ? String(raw.why).trim() : "";
    if (!tid) { refused.push({ why: "no-people", op: raw }); continue; }
    if (knownPeople && !knownPeople.has(tid)) { refused.push({ people: tid, why: "unknown-people" }); continue; }
    if (!Number.isFinite(Number(raw.delta)) || Number(raw.delta) === 0) { refused.push({ people: tid, why: "no-delta" }); continue; }
    if (!why) { refused.push({ people: tid, why: "no-reason" }); continue; }

    // TWO clamps, reported separately because they mean different things. Magnitude says "a scene
    // is not a life"; the band edge says "the player reads bands, so one narrated beat may not move
    // one". Collapsing them into a single `heldAtBand` flag hid the magnitude clamp entirely — my
    // own test caught that by asserting the clamp was visible and finding it was not.
    const requested = Math.round(Number(raw.delta));
    let delta = Math.max(-3, Math.min(3, requested));
    const heldAtMagnitude = delta !== requested;
    if (delta > 0) delta = delta * (liaisonMult?.[tid] || 1);   // a liaison speeds gains, never losses
    const before = character.peopleDisposition[tid] || 0;
    let after = before + delta;

    // band-edge clamp — stop AT the boundary rather than through it
    const bands = (rules?.peopleStandingBands || []).map(b => b.min).sort((a, b) => a - b);
    const bandBefore = bandOf(before, rules);
    let heldAtBand = false;
    if (bandOf(after, rules) !== bandBefore) {
      const edge = delta > 0
        ? bands.filter(m => m > before).sort((a, b) => a - b)[0]
        : bands.filter(m => m <= before).sort((a, b) => b - a)[0];
      if (Number.isFinite(edge)) { after = delta > 0 ? Math.min(after, edge - 0.01) : Math.max(after, edge); heldAtBand = true; }
    }
    character.peopleDisposition[tid] = after;
    const clamped = Math.round((after - before) * 100) / 100;
    applied.push({ people: tid, requested, delta: clamped, why, band: bandOf(after, rules), heldAtMagnitude, heldAtBand, held: heldAtMagnitude || heldAtBand });
    note(character, { at: day, kind: "act", people: tid, delta: clamped, text: why });
  }
  if (refused.length) character._standingOpRefusals = refused.map(r => `${r.people || "?"}: ${r.why}`).slice(-4);
  return { applied, refused };
}

/** §3e — ONE shape for every holder kind: `{holderId, kind, score, band}`. This is the convergence
 *  the spec asks for — settlements and peoples answered through a single call so callers stop
 *  needing to know which system owns which holder. */
export function standingFor(character, holderId, kind, rules) {
  if (kind === "settlement") {
    const r = standingWith(character, holderId, rules);
    return { holderId, kind, score: r.score, band: r.band };
  }
  const r = standingWithPeople(character, holderId, rules);
  return { holderId, kind: "people", score: r.score, band: r.band };
}

/** Everyone who has an opinion of you, strongest first — the standing screen's feed and the GM's.
 *  `neutral`-at-zero holders are omitted: a list of people who have never heard of you is not a
 *  list worth reading. */
export function standingRoster(character, rules, { settlements = [] } = {}) {
  const out = [];
  for (const tid of Object.keys(character?.peopleDisposition || {})) {
    const s = standingFor(character, tid, "people", rules);
    if (s.score !== 0) out.push(s);
  }
  for (const cid of settlements) {
    const s = standingFor(character, cid, "settlement", rules);
    if (s.score !== 0) out.push(s);
  }
  return out.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}

/** The GM's view — who regards you how, so a scene can act on it without being told separately. */
export function standingForGM(character, rules, opts = {}) {
  const roster = standingRoster(character, rules, opts);
  if (!roster.length) return "";
  return roster.slice(0, 8).map(s => `${s.holderId} (${s.kind}): ${s.band}`).join(" · ");
}
