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
import { walkingDays } from "./worldmap.js";    // ⛔ SNG-634 C7 `neighbour`: how close your ground is to theirs

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
  const st = powerStateOf(character, power?.id);
  const lost = st?.lost;
  // ⛔ SNG-634 C4 — AND A POWER CAN GROW. `grownHeads` is what its verbs have earned it (see `powerPass`),
  // spread across its own contingents in proportion so a crossbow line and a household blade grow together
  // rather than one of them becoming the whole band.
  const grown = Math.max(0, Number(st?.grownHeads) || 0);
  const total = base.reduce((n, c) => n + Math.max(0, Number(c?.n) || 0), 0) || 1;
  if ((!lost || typeof lost !== "object") && !grown) return base.map(c => ({ ...c }));
  return base.map((c, i) => {
    const authored = Math.max(0, Number(c.n) || 0);
    const gone = Math.max(0, Number(lost?.[i]) || 0);
    const gain = grown ? Math.round(grown * (authored / total)) : 0;
    return { ...c, n: Math.max(0, authored - gone + gain) };
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
  // ⛔ SNG-634 C6 — AND THEY NOTICE. Killing their people is the plainest thing you can do to a power, so
  // it is the plainest thing their opinion of you should move on. ⚠️ SCALED BY WHAT IT COST THEM rather
  // than flat: one toll-man is not the same as a household.
  const beforeHeads = Math.max(1, before);
  movePowerStanding(character, power, -Math.max(1, Math.round((took / beforeHeads) * 20)),
    { why: `${took} of theirs killed`, day });
  return { id: power.id, name: power.name || power.id, took, before, after, broken: !!st.broken,
           whenBroken: st.broken ? (power.whenBroken || null) : null };
}

/** ⛔ SNG-634 C5 — A POWER'S HOLD IS A PLACE YOU CAN TAKE, and this is the half that turns every other
 *  reader from something that happens TO you into something you do. The twelve authored holds are the Feast
 *  Hall, the chain-post above the waystation, a counting-house behind a spice stall, the bridge towers, the
 *  old muster-yard below the Marchward's wall.
 *  ⚠️ THE KEY IS DERIVED, NEVER AUTHORED. A hold has no id of its own — the records carry `{at, kind, name,
 *  garrison}` — and asking Aevi to invent one would be asking for a field only this reader wants. Two holds
 *  at the same place (the Keelmouth Slip has the watch-house AND the boatyards) are told apart by index. */
export function holdKeyOf(power, hold, i = 0) {
  if (!power?.id || !hold?.at) return "";
  return `${power.id}--${hold.at}${i > 0 ? `--${i}` : ""}`;
}

/** Every hold a power holds, with what this character has done to it folded in. */
export function holdsOf(power, character) {
  const list = Array.isArray(power?.holds) ? power.holds : [];
  const st = powerStateOf(character, power?.id);
  const seen = new Map();
  return list.map((h) => {
    const n = seen.get(h?.at) || 0;
    seen.set(h?.at, n + 1);
    const key = holdKeyOf(power, h, n);
    const lost = Math.max(0, Number(st?.holdLost?.[key]) || 0);
    return {
      key, at: h?.at || null, kind: h?.kind || "post", name: h?.name || null,
      garrison: Math.max(0, (Number(h?.garrison) || 0) - lost),
      garrisonAuthored: Math.max(0, Number(h?.garrison) || 0),
      taken: Array.isArray(st?.holdsTaken) ? st.holdsTaken.includes(key) : false,
    };
  });
}

/** ⛔ WHAT CAN BE ASSAULTED WHERE YOU ARE STANDING. ⚠️ Not a hold this character has already taken, and not
 *  a broken power's: both are places the fight is over. Returns the power alongside the hold, because every
 *  consequence of the fight lands on the power rather than on the hold. */
export function assaultableAt(locationId, { content = null, character = null } = {}) {
  const out = [];
  for (const p of powersReaching(locationId, { content, character })) {
    for (const h of holdsOf(p, character)) {
      if (h.at !== locationId || h.taken) continue;
      out.push({ power: p, hold: h });
    }
  }
  return out;
}

/** ⛔ WHO IS BEHIND THE WALL — the garrison, in the contingent shape `legionClash` takes, so an assault is
 *  the same fight the raid already is and no second combat model appears.
 *  ⚑ AND THE QUALITY COMES FROM THE POWER'S OWN PEOPLE, not from a number the GM picked. The band op has
 *  been fighting `op.against | 0 || 20` since it shipped — an abstract count with nobody behind it, which is
 *  the raid's anonymity pointing the other way. A hold's defenders are as good as that power's best line. */
export function garrisonContingents(power, hold, character) {
  const n = Math.max(0, Number(hold?.garrison) || 0);
  if (!n) return null;
  const own = contingentsOf(power, character);
  const quality = own.length ? Math.max(...own.map(c => Math.max(1, Number(c.quality) || 1))) : 1;
  const what = `${power?.name || power?.id || "a garrison"} at ${hold?.name || hold?.at || "their post"}`;
  return [{ n, quality, what, _hold: hold.key }];
}

/** ⛔ WHAT THE ASSAULT COST THE GARRISON, persisted on the save the same way a band's losses are — a post
 *  ground down over three attempts is three attempts' worth weaker on the fourth. */
export function noteHoldLoss(character, power, holdKey, killed = 0, { day = null } = {}) {
  const k = Math.max(0, Math.round(Number(killed) || 0));
  if (!character || !power?.id || !holdKey || !k) return null;
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (character.powerState[power.id] = character.powerState[power.id] || {});
  st.holdLost = (st.holdLost && typeof st.holdLost === "object") ? st.holdLost : {};
  st.holdLost[holdKey] = (Number(st.holdLost[holdKey]) || 0) + k;
  st.lastLossDay = day ?? st.lastLossDay ?? null;
  return { id: power.id, name: power.name || power.id, holdKey, took: k };
}

/** ⛔ THE HOLD CHANGES HANDS. ⛑ Marked on the SAVE, never on the record: the Feast Hall is still the
 *  Gralloch's in the authored world and in every other player's, and it is yours in yours.
 *  ⚠️ THIS DOES NOT CREATE THE HOLDING — `addHolding` does, in the caller, because that door owns the
 *  vocabulary rules (a household is not a holding) and having two writers of `character.holdings` is how
 *  they drift. This says the power no longer has it and hands back what the caller needs to file it. */
export function takeHold(character, power, hold, { day = null } = {}) {
  if (!character || !power?.id || !hold?.key) return null;
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (character.powerState[power.id] = character.powerState[power.id] || {});
  st.holdsTaken = Array.isArray(st.holdsTaken) ? st.holdsTaken : [];
  if (st.holdsTaken.includes(hold.key)) return null;
  st.holdsTaken.push(hold.key);
  st.holdLost = (st.holdLost && typeof st.holdLost === "object") ? st.holdLost : {};
  st.holdLost[hold.key] = hold.garrisonAuthored;   // the garrison that held it is gone from their strength
  // ⛑ A POWER THAT HAS LOST EVERY HOLD IS NOT AUTOMATICALLY BROKEN. A band with people left can take a post
  // back, and `whenBroken` is about the people rather than the ground — the Tollmen's own line says the road
  // is only the mountain again "until the Gralloch sends a harder captain to take the waystation back".
  const left = holdsOf(power, character).filter(h => !h.taken).length;
  // ⛑ TAKING THEIR GROUND IS WORSE THAN BLEEDING THEM, and the last of it is worse again.
  movePowerStanding(character, power, left === 0 ? -40 : -20,
    { why: `${hold.name || hold.at} taken from them`, day });
  return { id: power.id, name: power.name || power.id, holdKey: hold.key,
           holdName: hold.name || hold.at, at: hold.at, kind: hold.kind || "post",
           theirHoldsLeft: left, whenBroken: left === 0 ? (power.whenBroken || null) : null, day };
}

/** ⛔ SNG-634 C5 — WHO HOLDS THIS GROUND, FOR THE GM. Without this the `hold` field the contract now offers
 *  names a block that does not exist, which is the readerless shape pointing the other way: a producer with
 *  nothing to produce from.
 *  ⚠️ WHAT IT SAYS AND WHAT IT WITHHOLDS. The garrison and the reach are what anybody standing here can see
 *  and what a fight needs; `leverage` and `secretsGM` are NOT here — a power's weak point is something the
 *  fiction has to hand over, not a line in the prompt. ⛑ A hold this character has already taken says so, so
 *  the GM never offers a siege that is over.
 *  Returns "" when nobody holds anything here, which is 120 of the 143 places. PURE. */
export function powersHoldingForGM(locationId, { content = null, character = null } = {}) {
  const here = powersReaching(locationId, { content, character });
  if (!here.length) return "";
  const lines = [];
  for (const p of here) {
    const own = holdsOf(p, character).filter(h => h.at === locationId);
    const heads = headsOf(contingentsOf(p, character));
    const bits = own.map(h => h.taken
      ? `${h.name || h.kind} — TAKEN, it is this character's now`
      : `${h.name || h.kind} (${h.kind}, ${h.garrison} on it${h.garrison < h.garrisonAuthored ? `, down from ${h.garrisonAuthored}` : ""})`);
    const noticed = powerStateOf(character, p.id)?.noticed;
    const mind = standingWithPower(character, p.id, content?.rules || null);
    lines.push(`- **${p.name || p.id}** — ${p.kind || "a power"}, ${heads} they can field${p.dangerLift ? `, and the ground here reads ${p.dangerLift > 0 ? "worse" : "quieter"} for it` : ""}.`
      + (mind.score ? `\n  They think of this character as **${mind.band}** (${mind.score}).` : "")
      + (noticed ? `\n  ⛔ THEY HAVE TAKEN AN INTEREST IN THIS CHARACTER — ${noticed.why}. What they want from them: ${p.wantsFromYou || "to settle it"}${noticed.throughLeader ? ` Their leader is someone this character knows, and is looking for them.` : " They have not met; bring them into the story as the fiction allows."}` : "")
      + (bits.length ? `\n  Holds here: ${bits.join(" · ")}` : "")
      + (p.plainly ? `\n  ${p.plainly}` : ""));
  }
  return lines.join("\n");
}

/** ⛔ SNG-634 C4 — WHAT EACH VERB ACTUALLY DOES, and this table is the whole of the honesty in this pass.
 *  ⚠️ THE SPEC SAYS "`tribute` MOVES CRYSTAL UP `answersTo`", AND IT CANNOT: measured before writing this, a
 *  power record has no wealth, purse or crystal field — none of the 11, and no such field in the schema. So
 *  the relationship is expressed in the only currency a power HAS, which is strength, using Aevi's own
 *  authored `growth` dials: a vassal's tribute counts a WIN for its liege, and at `winsToGrowOneStep` the
 *  liege grows `headsPerStep` of its authored size. That IS the Gralloch growing on the Tollmen and the Edge
 *  Riders, which is what the fiction already says out loud.
 *  ⛑ AND A VERB WITH NO MECHANICAL EFFECT SAYS SO HERE (`null`), because the alternative is a news line that
 *  describes a mechanism that does not exist — the defect this project has caught four times. `toll`, `tax`,
 *  `patrol` and `protect` are ALREADY felt, through `dangerLift` and through C1's raid; the pass does not
 *  need to invent a second consequence for them and must not pretend to. */
export const VERB_EFFECT = {
  tribute: "liegeWin",     // ⛑ up the `answersTo` chain: their take strengthens whoever they answer to
  expand:  "selfWin",      // pushing outward: their own success compounds
  recruit: "selfWin",      // more hands is literally what it is
  feud:    "bothLose",     // two powers grinding each other down, on `rivals[]`
  raid:    null, toll: null, tax: null, levy: null, extort: null, steal: null,
  fence:   null, smuggle: null, protect: null, patrol: null, inform: null,
};

/** Which verb a power takes this pass. ⚠️ ROTATED BY THE DAY rather than rolled, so a world tick is
 *  reproducible and a power works through what it does instead of doing one thing five times by luck. */
export function verbForPass(power, day = 0) {
  const vs = Array.isArray(power?.verbs) ? power.verbs.filter(Boolean) : [];
  if (!vs.length) return null;
  const salt = String(power.id || "").length;
  return vs[(((Math.round(Number(day) || 0) + salt) % vs.length) + vs.length) % vs.length];
}

/** The tally → steps conversion, on Aevi's dials. A step is `headsPerStep` of the power's AUTHORED size and
 *  is capped by its kind's own head range, so a band cannot grow into a legion by winning. */
function stepHeads(power, rules) {
  const g = rules?.powers?.growth || {};
  const authored = (Array.isArray(power?.strength?.contingents) ? power.strength.contingents : [])
    .reduce((n, c) => n + Math.max(0, Number(c?.n) || 0), 0);
  return Math.max(1, Math.round(authored * (Number(g.headsPerStep) || 0.2)));
}
/** ⛔ HOW OFTEN A POWER MAY GROW AT ALL, and this is the dial the spec did not have. `winsToGrowOneStep: 3`
 *  says nothing about how fast three wins arrive — and with a verb a pass, they arrive in days. MEASURED
 *  before adding this: the Gralloch Crown went from its authored 114 to its kind's ceiling of 220 in
 *  FOURTEEN DAYS. The ceiling was doing its job; the growth had no sense of time in it, which is mine.
 *  ⛑ DERIVED FROM THE WORLD'S OWN CLOCK, never picked: `yearDays` (144) over four seasons is 36 days, so a
 *  force may visibly grow about four times a year and reaching its ceiling takes years rather than a
 *  fortnight. A `growth.growEveryDays` in content overrides it the moment Aevi wants a different pace \u2014 the
 *  rate is a design question and it is hers, this is only a defensible default instead of a guess. */
function growWindow({ rules = null, content = null } = {}) {
  const g = rules?.powers?.growth || {};
  const said = Number(g.growEveryDays);
  if (Number.isFinite(said) && said > 0) return said;
  // ⚠️ AND THE CLOCK IS AT `content.worldClock.calendar.yearDays`, NOT ON `rules`. My first version read
  // `rules.worldClock.yearDays`, found nothing, and fell through to a literal 144 — which is the right
  // number by coincidence, so nothing looked wrong and the comment above claimed a read that was not
  // happening. Exactly the defect I keep finding in other people's code, committed inside the fix for it.
  const year = Number(content?.worldClock?.calendar?.yearDays)
    || Number(content?.rules?.worldClock?.calendar?.yearDays) || 144;
  // ⛑ FOUR SEASONS is the FAR band's count (world_clock: "far 4 · middle 3 · ring 2"). A growth window is a
  // world-scale pace, not a local one, so the widest division is the honest one to divide by.
  return Math.max(1, Math.round(year / 4));
}

function headCeiling(power, rules) {
  const range = rules?.powers?.kinds?.[power?.kind]?.heads;
  const authored = (Array.isArray(power?.strength?.contingents) ? power.strength.contingents : [])
    .reduce((n, c) => n + Math.max(0, Number(c?.n) || 0), 0);
  // ⚠️ THE AUTHORED SIZE WINS WHEN IT ALREADY EXCEEDS THE KIND'S RANGE. The Gralloch Crown fields 114 and its
  // kind's range is a band's; an authored record is a ruling and a generator range is a default.
  return Math.max(authored, Array.isArray(range) ? Math.max(...range.map(Number).filter(Number.isFinite)) : authored);
}

/** ⛔ SNG-634 C4 — ONE PASS, ONE VERB EACH, AND THE RESULTS REACH THE NEWS.
 *  ⚠️ EVERY CHANGE LANDS ON `character.powerState`, never on the record: the Gralloch grows in YOUR world
 *  because YOUR Tollmen went on paying it, and it does not grow in somebody else's who broke them.
 *  ⛑ A BROKEN POWER TAKES NO VERB. It is finished until something puts it back, which is the point of
 *  breaking one. Returns news rows; writes nothing else. */
export function powerPass(character, { content = null, rules = null, day = null } = {}) {
  const all = powersFrom(content);
  if (!all.length) return [];
  const R = rules || content?.rules || null;
  const g = R?.powers?.growth || {};
  const winsPer = Math.max(1, Number(g.winsToGrowOneStep) || 3);
  const lossPer = Math.max(1, Number(g.lossesToShrinkOneStep) || 2);
  const window = growWindow({ rules: R, content });   // ⛔ a season, from the world clock — see growWindow for the measurement that forced it
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (id) => (character.powerState[id] = character.powerState[id] || {});
  const byId = new Map(all.map(p => [p.id, p]));
  const news = [];
  const credit = (id, kind) => {
    const p = byId.get(id);
    if (!p || !isStanding(character, p)) return;
    const s = st(id);
    if (kind === "win") s.wins = (Number(s.wins) || 0) + 1;
    else s.losses = (Number(s.losses) || 0) + 1;
    // ⛑ A WIN CANCELS A LOSS BEFORE IT BUILDS. Otherwise a power that alternates would grow AND shrink.
    const w = Number(s.wins) || 0, l = Number(s.losses) || 0;
    const net = Math.min(w, l);
    if (net) { s.wins = w - net; s.losses = l - net; return; }
    if ((Number(s.wins) || 0) >= winsPer) {
      s.wins = 0;
      // ⛑ AND NOT MORE OFTEN THAN THE WINDOW. The wins are spent either way — a power that earned them
      // inside the window got its growth already; it does not bank them and leap two steps later.
      const last = Number(s.grewDay);
      if (Number.isFinite(last) && Number.isFinite(Number(day)) && (Number(day) - last) < window) return;
      const step = stepHeads(p, R), ceil = headCeiling(p, R);
      const now = headsOf(contingentsOf(p, character));
      const room = Math.max(0, ceil - now);
      const took = Math.min(step, room);
      if (took > 0) {
        s.grownHeads = (Number(s.grownHeads) || 0) + took;
        s.grewDay = Number(day) || 0;
        news.push({ text: `${p.name || p.id} is stronger than it was — ${took} more under it.`, section: "world", powerId: p.id, grew: took });
      }
    } else if ((Number(s.losses) || 0) >= lossPer) {
      s.losses = 0;
      const step = stepHeads(p, R);
      const now = headsOf(contingentsOf(p, character));
      const took = Math.min(step, Math.max(0, now - 1));
      if (took > 0) {
        s.lost = (s.lost && typeof s.lost === "object") ? s.lost : {};
        s.lost[0] = (Number(s.lost[0]) || 0) + took;
        news.push({ text: `${p.name || p.id} has lost people it will not get back.`, section: "world", powerId: p.id, shrank: took });
      }
    }
  };

  for (const p of all) {
    if (!isStanding(character, p)) continue;
    const verb = verbForPass(p, day);
    if (!verb) continue;
    const s = st(p.id);
    s.lastVerb = verb; s.lastVerbDay = day ?? null;
    const effect = VERB_EFFECT[verb] ?? null;
    if (effect === "liegeWin" && p.answersTo?.power) credit(p.answersTo.power, "win");
    else if (effect === "selfWin") credit(p.id, "win");
    else if (effect === "bothLose") {
      for (const r of (Array.isArray(p.rivals) ? p.rivals : []).filter(id => byId.has(id))) { credit(p.id, "loss"); credit(r, "loss"); }
    }
    // ⛔ AND NOTHING IS NARRATED FOR TAKING A VERB. My first version wrote a line every time a power tolled,
    // tributed or pushed outward — and TWO gates caught it in the same run: §325 ("a pass with nothing to say
    // writes nothing") and smoke 366, whose charge digest a wall of world rows reshaped.
    // ⛑ THEY ARE RIGHT AND I WAS WRONG. A force doing what it always does is not news; eleven of them saying
    // so every pass is how a player learns to stop reading the news. The only rows this pass emits are the
    // ones in `credit`, where a power actually GREW or SHRANK — a real change in what you face — and the
    // routine is already felt through `dangerLift` and through C1's raid having a name.
    // ⚠️ `lastVerb` is still recorded on the save, so a surface that wants to say what they are doing can,
    // and the news does not have to.
  }
  return news;
}

/** ⛔ SNG-634 C3 — WHO OWNS AN ENCOUNTER, AND WHETHER IT MAY FIRE HERE. A power lists `encounters[]`: those
 *  are ITS people, and they belong to it.
 *  ⛑ TWO RULES, AND THE SECOND IS THE ONE THAT PAYS. An owned encounter fires only inside its owner's reach,
 *  and NOT AT ALL once that owner is broken — so clearing the Tollmen genuinely empties the switchback of
 *  toll-men, instead of the road going on producing them from a table.
 *  ⚠️ AN ENCOUNTER NOBODY CLAIMS IS UNTOUCHED. Measured: of the 98 entries in the pool, exactly ONE is
 *  claimed today (`re_toll_bandits`, by the Switchback Tollmen), and 10 of the 11 powers claim none. The
 *  filter is built for the content to grow into; it changes one encounter at two places right now, and
 *  saying so beats implying it reshaped the pool.
 *  ⛔ RETURNS A PREDICATE, not a filtered list, because `random_encounters.js` is a leaf module that must not
 *  learn what a power is. It already takes `power` meaning the CHARACTER'S level — a second meaning of that
 *  word in one signature is how a reader picks the wrong one. */
export function encounterOwnerFilter(locationId, { content = null, character = null } = {}) {
  const claimed = new Map();   // encounter id -> [power, …] that claim it anywhere in the world
  for (const p of powersFrom(content)) {
    for (const id of (Array.isArray(p.encounters) ? p.encounters : [])) {
      if (!claimed.has(id)) claimed.set(id, []);
      claimed.get(id).push(p);
    }
  }
  if (!claimed.size) return null;   // nobody claims anything: no filter, no cost
  const reaching = new Set(powersReaching(locationId, { content, character }).map(p => p.id));
  return (entryId) => {
    const owners = claimed.get(entryId);
    if (!owners) return { ok: true, owner: null };            // unclaimed — as it always was
    const live = owners.find(p => reaching.has(p.id));
    return live ? { ok: true, owner: live.name || live.id } : { ok: false, owner: null };
  };
}

/** ⛔ SNG-634 C6 — WHAT A POWER THINKS OF YOU. ⚠️ NOT DERIVED FROM DEEDS, which is how a settlement's
 *  standing works: a deed's weight spreads by `communityId` and a power is not a community. A crown's
 *  opinion of you is its OWN, moved by what you did to IT — so it is a stored number on the save.
 *  ⛑ THE BAND COMES FROM `rules.reputationBands`, the same table a people's and a settlement's read from,
 *  so "hostile" means one thing in this game and not three. PURE. */
export function standingWithPower(character, powerId, rules) {
  const score = Math.round(Number(powerStateOf(character, powerId)?.standing) || 0);
  let band = "neutral";
  for (const b of (rules?.reputationBands || [])) { if (score >= b.min) { band = b.band; break; } }
  return { holderId: powerId, kind: "power", score, band };
}

/** ⛔ THE ONE WRITER OF A POWER'S OPINION, with the reason kept. A defender whose ground moved must be able
 *  to see why, and the same is true of a crown that has decided about you. */
export function movePowerStanding(character, power, delta, { why = null, day = null } = {}) {
  const d = Math.round(Number(delta) || 0);
  if (!character || !power?.id || !d) return null;
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  const st = (character.powerState[power.id] = character.powerState[power.id] || {});
  const before = Math.round(Number(st.standing) || 0);
  st.standing = before + d;
  st.standingWhy = [...(Array.isArray(st.standingWhy) ? st.standingWhy : []).slice(-3),
                    { d, why: why ? smartClamp(String(why), 120) : null, day: day ?? null }];
  return { id: power.id, name: power.name || power.id, from: before, to: st.standing, why };
}

/** ⛑ AND WHO WOULD FIGHT BESIDE YOU. A power that thinks well enough of you offers what it can field —
 *  `legionplan` already drafts from allies, so an allied power is one more ally with contingents.
 *  ⚠️ THE BAR IS A BAND, NOT A NUMBER, so it moves when Aevi retunes `reputationBands` and not when I guess.
 *  A broken power offers nothing: there is nobody left to send. */
export function alliedPowersFor(character, { content = null, rules = null, atLeast = "trusted" } = {}) {
  // ⛔ THE BAND NAME MUST BE ONE THIS GAME HAS. My default was `"friendly"`, which is not in the ladder —
  // `reputationBands` is revered / trusted / known / neutral / wary / distrusted / hated — so `indexOf`
  // returned −1, the filter matched nothing, and the function returned an EMPTY LIST IN SILENCE for a power
  // standing at 40. A guessed enum value that happens to parse is the worst kind of wrong: nothing throws
  // and the feature simply never happens.
  // ⛑ So an unknown band is LOUD and falls back to the table's own second rung rather than to nothing.
  const order = (rules?.reputationBands || []).map(b => b.band);
  let barAt = order.indexOf(atLeast);
  if (barAt < 0) {
    if (order.length) console.warn(`[powers] alliedPowersFor: "${atLeast}" is not a reputation band (${order.join(", ")}) — using ${order[Math.min(1, order.length - 1)]}`);
    barAt = order.length ? Math.min(1, order.length - 1) : -1;
  }
  return powersFrom(content)
    .filter(p => isStanding(character, p))
    .map(p => ({ power: p, standing: standingWithPower(character, p.id, rules) }))
    .filter(({ standing }) => barAt >= 0 && order.indexOf(standing.band) >= 0 && order.indexOf(standing.band) <= barAt)
    .map(({ power, standing }) => ({
      id: power.id, name: power.name || power.id, band: standing.band, score: standing.score,
      contingents: contingentsOf(power, character),
      heads: headsOf(contingentsOf(power, character)),
    }))
    .filter(a => a.heads > 0);
}

/** ⛔ SNG-634 C7 — WHY A POWER WOULD TAKE AN INTEREST IN YOU. `noticesYouWhen` is authored per power, from a
 *  closed list: `crossed` (all eleven use it), `rival_ally` (six), `wealth` (four), `neighbour` (three).
 *  ⚠️ EVERY ONE IS EVALUATED FROM THINGS THAT ALREADY HAPPEN — no new tracking. `crossed` reads the state C1
 *  and C5 already write; `neighbour` reads your holdings against their reach; `wealth` takes the purse's
 *  worth from the caller, because this module is pure and does not know the economy; `rival_ally` reads C6's
 *  standing, which is why C6 shipped in the same change rather than after — six of the eleven would have had
 *  a trigger that could never fire.
 *  Returns the trigger that fired and why, or null. PURE. */
export function noticesYou(character, power, { content = null, rules = null, worth = null } = {}) {
  const want = new Set(Array.isArray(power?.noticesYouWhen) ? power.noticesYouWhen : []);
  if (!want.size) return null;
  const st = powerStateOf(character, power?.id);

  // ⛔ CROSSED — you took their ground, killed their people, or finished them. The plainest reason of all,
  // and the only one every power in the corpus authors.
  if (want.has("crossed")) {
    if (st?.broken) return { trigger: "crossed", why: "you finished them" };
    if (Array.isArray(st?.holdsTaken) && st.holdsTaken.length) return { trigger: "crossed", why: "you took ground of theirs" };
    const killed = Object.values(st?.lost || {}).reduce((n, x) => n + (Number(x) || 0), 0);
    if (killed > 0) return { trigger: "crossed", why: `you have killed ${killed} of theirs` };
  }

  // ⛑ NEIGHBOUR — your ground is close enough to theirs to matter. `neighbourWithinDays` is authored (3).
  if (want.has("neighbour")) {
    const within = Number(rules?.powers?.neighbourWithinDays) || 3;
    const locs = content?.locations || {};
    const theirs = [power?.seat, ...(Array.isArray(power?.reach) ? power.reach : [])].filter(Boolean);
    for (const h of (Array.isArray(character?.holdings) ? character.holdings : [])) {
      const mine = locs[h?.locationId];
      if (!mine) continue;
      for (const id of theirs) {
        const d = locs[id] ? walkingDays(mine, locs[id]) : null;
        if (d != null && d <= within) {
          return { trigger: "neighbour", why: `${h.name || h.id} stands ${d < 1 ? "at" : `${Math.round(d)} days from`} ${locs[id].name || id}` };
        }
      }
    }
  }

  // ⚠️ WEALTH — the worth comes IN. `worthOf` needs the economy and a region, and this module is pure; a
  // caller that cannot price the purse passes null and the trigger simply does not fire, which is honest.
  if (want.has("wealth") && Number.isFinite(Number(worth))) {
    const bar = Number(rules?.powers?.wealthAtCrystal) || 1500;
    if (Number(worth) >= bar) return { trigger: "wealth", why: `you are carrying ${Math.round(Number(worth))} crystal's worth` };
  }

  // ⛔ RIVAL_ALLY — you stand well with somebody they hate. This is the one C6 made possible.
  if (want.has("rival_ally")) {
    const order = (rules?.reputationBands || []).map(b => b.band);
    const bar = order.indexOf("known");
    for (const rid of (Array.isArray(power?.rivals) ? power.rivals : [])) {
      const s = standingWithPower(character, rid, rules);
      const at = order.indexOf(s.band);
      if (bar >= 0 && at >= 0 && at <= bar) {
        const r = powerById(rid, content);
        return { trigger: "rival_ally", why: `you stand ${s.band} with ${r?.name || rid}` };
      }
    }
  }
  return null;
}

/** ⛔ SNG-634 C7 — THE PASS. A power that has noticed you is recorded ONCE, and the record is what every
 *  surface reads.
 *  ⚠️ AND IT DOES NOT PUT THEIR LEADER IN YOUR REGISTRY. Measured: TEN of the eleven leaders have been met by
 *  nobody on this device. Minting a stranger into your known-people so that `seeking.js` can bring them
 *  would hand you a name you never earned, which is the rule CCODE-462 settled. ⛑ So: the notice is a FACT on
 *  the save, the GM is told (see `powersHoldingForGM`) and the fiction stages the arrival — and WHEN the
 *  leader is already someone you know, they also gain a want, in the power's OWN authored words, and
 *  `seeking.js` brings them looking on its existing pressure.
 *  Returns news rows; writes `powerState[id].noticed` and, where the leader is known, their captured want. */
export function noticePass(character, { content = null, rules = null, day = null, worth = null } = {}) {
  const news = [];
  character.powerState = (character.powerState && typeof character.powerState === "object") ? character.powerState : {};
  for (const p of powersFrom(content)) {
    if (!isStanding(character, p) && !powerStateOf(character, p.id)?.broken) continue;
    const st = (character.powerState[p.id] = character.powerState[p.id] || {});
    if (st.noticed) continue;                                  // once. A power does not keep discovering you.
    const hit = noticesYou(character, p, { content, rules, worth });
    if (!hit) continue;
    st.noticed = { trigger: hit.trigger, why: hit.why, day: day ?? null };
    // ⛑ THE WANT IS THE POWER'S OWN AUTHORED LINE. `seeking.js`'s rule is that the words are the PO's and not
    // the engine's, and `wantsFromYou` is exactly that sentence already written — "Your knee, your coin, or
    // your head on the stockade." Nothing here composes prose.
    const leader = p.leader && character.npcRegistry ? character.npcRegistry[p.leader] : null;
    if (leader && p.wantsFromYou) {
      leader.interiority = (leader.interiority && typeof leader.interiority === "object") ? leader.interiority : {};
      const have = Array.isArray(leader.interiority.wants) ? leader.interiority.wants : [];
      if (!have.includes(p.wantsFromYou)) leader.interiority.wants = [...have, p.wantsFromYou];
      st.noticed.throughLeader = p.leader;
    }
    news.push({ text: `${p.name || p.id} has taken an interest in you — ${hit.why}.`, section: "world",
                powerId: p.id, noticed: hit.trigger });
  }
  return news;
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
