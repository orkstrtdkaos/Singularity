// engine/powers.js — WHO HOLDS THE GROUND, AND WHAT THAT COSTS YOU FOR STANDING ON IT.
//
// ⛔ ERIK (SNG-634): forces that hold ground and can be allied with, opposed, broken and taken over.
// ⚑ AEVI'S FINDING UNDER IT, AND IT IS THE REASON THIS FILE EXISTS: `holdings.js:717` drew a raid as
//   `{ n: dangerLevel, quality: dangerLevel/2, what: "raiders" }`. The band and legion machinery built in
//   CCODE-404–407 has had NOBODY WITH A NAME on the other side of the field since the day it shipped.
//
// ⛑ READERS BEFORE CONTENT, which is her own condition for applying the change set: "CCode applies, after
//   Erik rules on spec §8 and readers C1 and C2 exist — content first would be the no-reader shape this
//   project keeps closing." So every function here is written and gated against the record SHAPE before a
//   single power record is on disk, and the gates drive fixtures. A field authored into a world with no
//   reader is the failure this project has closed eleven times.
//
// ⚠️ THIS FILE IS PURE AND TAKES ITS WORLD IN. Nothing here fetches, and `character` is only ever read or
//   given an explicit, named write (`notePowerLoss`, `breakPower`) — the same contract as holdings.js.
//
// THE TWO READERS SNG-634 §6 ORDERS FIRST, because "C1 and C2 alone change the game":
//   C1 · a raid on a hold inside a power's `reach` is drawn from THAT POWER's strength, is named, and its
//        losses persist — so clearing a band is not a coin-flip you re-roll next week.
//   C2 · effective danger = authored + Σ `dangerLift` of the STANDING powers whose reach covers the place.
//        Erik's 2026-07-19 ruling, mechanised: clearing them lowers it.

import { smartClamp } from "./namematch.js";   // a reason is prose, and prose is clamped on a word boundary

/** ⛔ THE LOADED POWERS, or an empty list. ⚠️ ALWAYS AN ARRAY: every reader below runs on a world with no
 *  powers in it at all and must behave exactly as the game did before them, because for most of the
 *  world's places that is the truth. */
export function powersFrom(content) {
  const p = content?.powers;
  if (Array.isArray(p)) return p.filter(Boolean);
  if (p && typeof p === "object") return Object.values(p).filter(Boolean);
  return [];
}

export function powerById(id, content) {
  if (!id) return null;
  return powersFrom(content).find(p => p && p.id === id) || null;
}

/** ⛔ WHAT THIS CHARACTER HAS DONE TO A POWER — and it lives on the SAVE, not on the record. Two players
 *  meet the same authored Tollmen; only one of them has broken their chain-post. `power_*` records are
 *  shared canon and must never carry one player's history. */
export function powerStateOf(character, id) {
  const s = character?.powerState;
  return (s && typeof s === "object" && s[id]) || null;
}

/** ⛔ STANDING = NOT BROKEN. The one predicate C2 turns on, named so the question reads the same everywhere.
 *  ⚠️ A power with every contingent dead is broken WHETHER OR NOT anybody said so — otherwise a band you
 *  wiped out would keep lifting the danger of the road it no longer holds. */
export function isStanding(character, power) {
  if (!power) return false;
  const st = powerStateOf(character, power.id);
  if (st?.broken) return false;
  return headsOf(contingentsOf(power, character)) > 0;
}

/** Total heads across a contingent list. */
export function headsOf(contingents) {
  return (Array.isArray(contingents) ? contingents : []).reduce((n, c) => n + Math.max(0, Number(c?.n) || 0), 0);
}

/** ⛔ WHAT A POWER CAN STILL FIELD: its authored contingents MINUS what this character has taken off them.
 *  ⚑ This is the whole of "losses persist". The authored record is never mutated; the save carries the
 *  subtraction, indexed by contingent so a crossbow line and a cudgel line are not one pool. */
export function contingentsOf(power, character) {
  const base = Array.isArray(power?.strength?.contingents) ? power.strength.contingents : [];
  const lost = powerStateOf(character, power?.id)?.lost;
  if (!lost || typeof lost !== "object") return base.map(c => ({ ...c }));
  return base.map((c, i) => {
    const gone = Math.max(0, Number(lost[i]) || 0);
    return { ...c, n: Math.max(0, (Number(c.n) || 0) - gone) };
  }).filter(c => (Number(c.n) || 0) > 0);
}

/** ⛔ EVERY POWER WHOSE REACH COVERS A PLACE. `reach` is a list of location ids — the places a power's
 *  presence is FELT, which is deliberately wider than the places it holds.
 *  ⚠️ STANDING ONLY BY DEFAULT: a broken power reaches nowhere. Pass `{ standingOnly: false }` to ask who
 *  USED to, which is what a "you broke them" line needs. */
export function powersReaching(locationId, { content = null, character = null, standingOnly = true } = {}) {
  if (!locationId) return [];
  return powersFrom(content).filter(p =>
    Array.isArray(p?.reach) && p.reach.includes(locationId)
    && (!standingOnly || isStanding(character, p)));
}

/** ⛔ C2 — HOW MUCH THE POWERS STANDING HERE MOVE THE DANGER OF THIS PLACE. The SUM of their signed
 *  `dangerLift`, because two of them can hold the same ground and it should be worse, not the same.
 *  ⚑ AND IT IS SIGNED ON PURPOSE. Measured on the authored eight: the Keelmouth Slip carries **−1** — a
 *  smugglers' arrangement makes its coast quieter — while the Firstsight Barony next door carries +1 and
 *  reaches the same two towns, so on `keelmouth` they cancel exactly. A lift that could only rise would
 *  have made that authoring impossible to express.
 *  ⚠️ RETURNS THE RAW SUM. The clamp belongs to the danger scale itself (`dangerOf`), not here — one place
 *  to know that the scale stops at 4, and a caller that wants the reason can see the whole lift. PURE. */
export function dangerLiftAt(locationId, { content = null, character = null } = {}) {
  return powersReaching(locationId, { content, character })
    .reduce((n, p) => n + (Number(p?.dangerLift) || 0), 0);
}

/** ⛑ …AND WHY, for a surface that has to explain itself. A defender whose ground moved must be able to see
 *  which power did it — the same rule `carriedSubstrateSources` set for the substrate. */
export function dangerLiftReceipt(locationId, { content = null, character = null } = {}) {
  return powersReaching(locationId, { content, character })
    .filter(p => Number(p?.dangerLift))
    .map(p => ({ id: p.id, name: p.name || p.id, lift: Number(p.dangerLift) || 0, kind: p.kind || null }));
}

/** ⛔ C1 — WHO IS RAIDING, when a hold on a power's ground is hit. The NEAREST claim wins: a power that
 *  HOLDS something at this place before one that merely reaches it, then the stronger.
 *  ⚠️ Returns null freely. Most places in the world have no power on them, and the anonymous raid that has
 *  always happened there must go on happening exactly as it did. */
export function raiderPowerAt(locationId, { content = null, character = null } = {}) {
  const here = powersReaching(locationId, { content, character })
    .filter(p => (p.verbs || []).includes("raid") || (p.verbs || []).includes("toll"));
  if (!here.length) return null;
  const holdsHere = (p) => (Array.isArray(p.holds) ? p.holds : []).some(h => h?.at === locationId);
  here.sort((a, b) => (holdsHere(b) - holdsHere(a)) || (headsOf(contingentsOf(b, character)) - headsOf(contingentsOf(a, character))));
  return here[0] || null;
}

/** ⛔ THE RAIDING PARTY ITSELF — a slice of what the power can field, never the whole of it, because a toll
 *  gang does not empty its post to rob a farm. ⛑ AND IT IS THE SAME CONTINGENT SHAPE `legionClash` already
 *  takes, which is the entire reason this is a two-line function instead of a system: the fight machinery
 *  was built in CCODE-404–407 and has been waiting for somebody to name.
 *  ⚠️ `share` is a dial and the FLOOR IS ONE HEAD: a power with two men left still sends one, so the last
 *  of a broken band is a fight you can finish rather than a rounding error that disappears. */
export function raidersFrom(power, character, { share = 0.4 } = {}) {
  const avail = contingentsOf(power, character);
  if (!avail.length) return null;
  const s = Math.max(0, Math.min(1, Number(share) || 0));
  const party = avail.map((c, i) => ({
    _at: i,
    n: Math.max(1, Math.round((Number(c.n) || 0) * s)),
    quality: Math.max(1, Number(c.quality) || 1),
    what: c.what || c.kind || "raiders",
  })).filter(c => c.n > 0);
  return party.length ? party : null;
}

/** ⛔ LOSSES PERSIST. `killed` is the per-contingent count the clash took off the raiding party, mapped back
 *  onto the power's own contingents by the `_at` index `raidersFrom` stamped.
 *  ⛑ AND A POWER WITH NOTHING LEFT IS BROKEN HERE, at the one place that knows the last head fell — not by
 *  a separate pass that has to be remembered. Returns what changed, for the news line. */
export function notePowerLoss(character, power, killed = {}, { day = null } = {}) {
  if (!character || !power?.id) return null;
  const before = headsOf(contingentsOf(power, character));
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (character.powerState[power.id] = character.powerState[power.id] || {});
  st.lost = (st.lost && typeof st.lost === "object") ? st.lost : {};
  let took = 0;
  for (const [at, n] of Object.entries(killed || {})) {
    const k = Math.max(0, Number(n) || 0);
    if (!k) continue;
    st.lost[at] = (Number(st.lost[at]) || 0) + k;
    took += k;
  }
  if (!took) return null;
  const after = headsOf(contingentsOf(power, character));
  st.lastLossDay = day ?? st.lastLossDay ?? null;
  if (after <= 0 && !st.broken) { st.broken = true; st.brokenDay = day ?? null; }
  return { id: power.id, name: power.name || power.id, took, before, after, broken: !!st.broken,
           whenBroken: st.broken ? (power.whenBroken || null) : null };
}

/** ⛔ BROKEN BY HAND — the player took the seat, or the story says so. Kept separate from `notePowerLoss`
 *  because "you killed the last of them" and "this is over" are different claims and the second one is
 *  sometimes a ruling. */
export function breakPower(character, power, { day = null, why = null } = {}) {
  if (!character || !power?.id) return null;
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (character.powerState[power.id] = character.powerState[power.id] || {});
  if (st.broken) return null;
  st.broken = true; st.brokenDay = day ?? null;
  // ⚠️ smartClamp, never `slice` — a fixed cut mid-word is the raw prose cap the wiring ratchet forbids,
  // and a reason somebody will read is prose whatever its length.
  if (why) st.brokenWhy = smartClamp(String(why), 200);
  return { id: power.id, name: power.name || power.id, whenBroken: power.whenBroken || null };
}
