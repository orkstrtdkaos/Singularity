// gatehold.js — SNG-663 §2c: HOLDING A GATE COSTS YOU, AND THEN SOMETHING COMES THROUGH IT.
//
// ✅ ERIK 2026-09-26: *"Both stigma AND consequence of something coming for you from the gate… the gate keeps of some
// sort."* ⛑ AEVI §2c: *"The 26 inherited gates were laid by the Lattice and have never been claimed… Holding one has two
// costs. 1 · Stigma — every power and people who knows of it thinks less of the holder. 2 · The keepers come, and it
// escalates the longer they do… Let the gate go, and it stops."*
//
// ⛔ THE ONE DESIGN RULE THAT MATTERS, AND AEVI WROTE IT IN CAPITALS FOR A REASON: **HOLDING A GATE IS NOT HOLDING THE
// PLACE IT STANDS IN.** *"A power that holds the ground around an open gate, and lets anyone through, is not holding the
// gate: no stigma, no keepers. Holding the gate is an act on the arch itself… make it a flag the act sets, never derived
// from `holds`."*
//
// ⚠️ AND THE MEASUREMENT SAYS WHY. Five powers' `holds` names a place that still carries an arch (the Echo Bridge, the
// Ender's Host, Pressureholt, the Long Choir, the Deepwood Moot — §2b moved the other four's gates out into yards). And
// TWO PLAYERS keep a holding at `gen-the-made-gate`, **both with a garrison posted**. So a rule derived from "a power
// holds here" or "a garrison stands here" would wake keepers on seven holders on day one, two of whom are explicitly
// exempt. Derived from the act, it wakes nobody — which is what §2c asks for.
//
// ⛑ AND THE EXEMPTION IS THE CORPUS ITSELF, NOT A FLAG SOMEBODY HAS TO REMEMBER. §2c.3: *"The Made Gate is the
// exception. It was permitted."* The Lattice's gates are the AUTHORED ones — measured, exactly **26**, which is the
// number the spec names. A gate that exists because somebody built one in play is `_gen`/`_canon` and is nobody's
// inheritance to resent.
import { isNetworkGate } from "./waygate.js";
import { worldConsequenceForPeoples } from "./standing.js";   // ✅ Erik 2026-09-29: a world consequence may cross a band edge
import { movePowerStanding, powerStateOf } from "./powers.js";
import { seasonCalendar } from "./worldtime.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

/** ⛔ THE ACTS THAT COUNT AS HOLDING, in Aevi's own words: *"closing it, charging for passage through it, or
 *  garrisoning it to decide who passes."* Anything else at the same place is standing near an arch. */
export const GATE_ACTS = {
  closed: { you: "closed the arch", they: "has closed the arch" },
  tolled: { you: "begun charging for passage through the arch", they: "charges for passage through the arch" },
  garrisoned: { you: "put people on the arch to decide who passes", they: "has put people on the arch" },
};

/** ⛑ THE DIALS. `seasonDays` is DERIVED from the world's own calendar rather than picked — Aevi's rhythm is "a season"
 *  and the world already divides its 144-day year into four for the band people live in, so 36 falls out. A content
 *  `rules.gateHold.seasonDays` overrides it the day somebody wants a different pace. */
export const GATE_HOLD = {
  rungs: ["signs", "notable", "heroic", "epic", "legendary"],
  seizeStigma: -2,          // what every power that knows of it thinks of you, the day you take one
  driftStigma: -1,          // …and again, each season it stays yours
  driftEverySeasons: 1,
};

/** ⛑ How long a season is here, from the calendar in force. PURE. */
export function seasonDays(rules = null) {
  const authored = num(rules?.gateHold?.seasonDays, 0);
  if (authored > 0) return authored;
  const cal = seasonCalendar();
  // ⛔ THE SEASONS, NOT THEIR THIRDS. `seasonCalendar().seasons` is the PORTION-EXPANDED list — "early-spring,
  // mid-spring, late-spring, …" — twelve names for four seasons, and dividing by it made Aevi's "a season's rhythm"
  // TWELVE DAYS: a legendary keeper in 48 days instead of a year and a half. ⚠️ A dial in the units of the ruling; she
  // ruled a season, and a third of one is a different rule wearing the same name. The band's own `seasons` is the four.
  const band = (cal.bands || []).find(b => b?.id === cal.defaultBand) || (cal.bands || [])[0] || null;
  const n = Math.max(1, (band?.seasons || cal.seasons || []).length);
  return Math.max(1, Math.round(num(cal.yearDays, 144) / n));
}

/** ⛔ IS THIS ONE OF THE LATTICE'S? An authored gate is; one grown in play is not, and §2c.3 exempts it by name.
 *  ⚠️ `content.locations` holds grown (`_gen`) and shared (`_canon`) records at runtime beside the authored ones, so
 *  "is it authored" has to filter them — the same trap that makes a promotion contest a record against itself. PURE. */
export function isLatticeGate(loc) {
  if (!loc) return false;
  if (loc._gen || loc._canon) return false;
  return !!(loc.waygate || isNetworkGate(loc));
}

/** ⛑ EVERY GATE THE LATTICE LAID, from the pool. Measured 2026-09-28: exactly 26, which is the number §2c names. PURE. */
export function latticeGates(locations = {}) {
  return Object.entries(locations).filter(([, l]) => isLatticeGate(l)).map(([id]) => id);
}

/* ═════ THE HOLDING TEST — A FLAG AN ACT SETS ═════ */

/** ⛔ WHAT THIS CHARACTER HOLDS. `character.gatesHeld` is written only by `takeGate`, never derived from a holding, a
 *  garrison or a power's reach. Returns `{ [locationId]: {since, how, why} }`. PURE. */
export function gatesHeldBy(character) {
  const held = character?.gatesHeld;
  return held && typeof held === "object" ? held : {};
}

/** ⛑ …and whether a POWER holds one. `power.gateHeld` is content's to write (an authored seizure) and
 *  `powerState[id].gateHeld` is the world tick's, for a power that takes one in play.
 *  ⬜ NOTHING SETS EITHER YET, and that is deliberate: Aevi's §2c ends *"when a generated power's verbs would do it, the
 *  news should say so"*, which is a rule about power verbs that has not been written. The READER is here so the day a
 *  power takes a gate the whole consequence already exists — and so this file is not a feature with only one half. PURE. */
export function gateHeldByPower(power, character = null) {
  const live = powerStateOf(character || {}, power?.id)?.gateHeld;
  const at = live || power?.gateHeld || null;
  return at ? String(at) : null;
}

/** ⛔ WHO HOLDS THIS ARCH, if anybody — the player, or a power. PURE. */
export function holderOfGate(locationId, { character = null, powers = [] } = {}) {
  if (!locationId) return null;
  if (gatesHeldBy(character)[locationId]) return { kind: "you", id: null, since: gatesHeldBy(character)[locationId].since ?? null };
  for (const p of (Array.isArray(powers) ? powers : [])) {
    if (gateHeldByPower(p, character) === locationId) return { kind: "power", id: p.id, name: p.name, since: powerStateOf(character || {}, p.id)?.gateHeldSince ?? null };
  }
  return null;
}

/* ═════ THE ACT, AND WHAT IT COSTS ═════ */

/** ⛔ TAKE A GATE. The act sets the flag, and the stigma lands the same moment — Aevi: *"a standing drop with all of
 *  them on seizing"*. Refuses a gate that is not the Lattice's, because there is nobody to offend and nothing to send. */
export function takeGate(character, locationId, { how = "garrisoned", content = null, rules = null, day = null } = {}) {
  const loc = content?.locations?.[locationId] || character?.generated?.location?.[locationId] || null;
  if (!loc) return { ok: false, why: "nowhere by that name" };
  if (!(loc.waygate || isNetworkGate(loc))) return { ok: false, why: `${loc.name || locationId} has no arch to hold` };
  if (!isLatticeGate(loc)) {
    // ⛑ §2c.3, said in the fiction's own terms rather than refused with a shrug.
    return { ok: false, why: `${loc.name || locationId} was made, not inherited — it was permitted, and holding it costs you nothing` };
  }
  if (!GATE_ACTS[how]) return { ok: false, why: "that is not a way to hold an arch" };
  const held = character.gatesHeld && typeof character.gatesHeld === "object" ? character.gatesHeld : (character.gatesHeld = {});
  if (held[locationId]) return { ok: false, why: `you already hold ${loc.name || locationId}`, already: true };
  held[locationId] = { since: day, how, seasonsHeld: 0, lastKeeperDay: null, rung: 0 };

  const whyTook = `took the arch at ${loc.name || locationId}`;
  const seize = num(rules?.gateHold?.seizeStigma, GATE_HOLD.seizeStigma);
  const moved = stigmaFor(character, { content, rules, day, delta: seize, why: whyTook });
  // ✅ ERIK 2026-09-29 — AND THE PEOPLES, who are not clamped the way a narrated beat is.
  const movedPeoples = peoplesStigmaFor(character, { rules, day, delta: seize, why: whyTook });
  return { ok: true, at: locationId, name: loc.name || locationId, how, moved, movedPeoples,
    said: `You have ${GATE_ACTS[how].you} at ${loc.name || locationId}. Nobody has done that in living memory.`,
    news: `${character?.name || "Someone"} ${GATE_ACTS[how].they} at ${loc.name || locationId}. Nobody has done that in living memory.` };
}

/** ⛑ AND LETTING IT GO IS ITS OWN ACT, because §2c's whole escape is *"Let the gate go, and it stops."* The stigma is
 *  NOT refunded — what people thought of you for doing it is a thing that happened. */
export function releaseGate(character, locationId, { content = null, day = null } = {}) {
  const held = gatesHeldBy(character);
  if (!held[locationId]) return { ok: false, why: "you hold no arch there" };
  const was = held[locationId];
  delete character.gatesHeld[locationId];
  const name = content?.locations?.[locationId]?.name || locationId;
  return { ok: true, was, at: locationId,
    said: `You have let ${name} go. Whatever came through it goes back through it within the day.`,
    news: `The arch at ${name} stands open again.` };
}

/** ⛔ THE STIGMA — every power that knows of it thinks less of you. Aevi's line covers *"every power and people"*;
 *  ✅ THE PEOPLES HALF IS `peoplesStigmaFor`, below, since 2026-10-01. It waited on a ruling rather than a guess: the
 *  GM's door caps at four ops a beat and clamps at a band edge ON PURPOSE, and routing a world rule through it would
 *  have been using a throttle as a mechanism. ERIK RULED on 09-29 — *"a world consequence may cross a band edge"* — and
 *  `worldConsequenceForPeoples` implements it, leaving the GM's clamps exactly where they are. */
export function stigmaFor(character, { content = null, rules = null, day = null, delta = -2, why = "", floor = true } = {}) {
  const moved = [];
  // ⛑ AND IT STOPS AT THE BOTTOM. A step a season forever runs past every band the game has: `reputationBands` ends at
  // "hated", whose own floor is −999 — which is a way of writing "no floor". A power that already stands in the worst
  // band has nothing further to think, so it stops moving. ⚠️ The floor is content's own vocabulary, not a number I
  // picked: retune the bands and this follows them.
  const bands = [...(Array.isArray(rules?.reputationBands) ? rules.reputationBands : [])].sort((a, b) => num(b?.min) - num(a?.min));
  const worst = bands.length ? bands[bands.length - 1] : null;
  const secondWorst = bands.length > 1 ? bands[bands.length - 2] : null;
  const atTheBottom = (st) => floor && delta < 0 && secondWorst && num(st?.standing, 0) < num(secondWorst.min, -Infinity);
  for (const p of (content?.powers || [])) {
    if (!p?.id) continue;
    // ⚑ only powers this character has actually heard of — a stranger on the far side of the world does not think
    // less of you for something they have no way to know.
    if (!powerStateOf(character, p.id)) continue;
    if (atTheBottom(powerStateOf(character, p.id))) continue;    // ⛑ already in `${worst?.band}` — nothing further to lose
    // ⛔ `movePowerStanding` RETURNS THE MOVE ITSELF — `{id, name, from, to, why}` — not `{moved: …}`. Testing `r.moved`
    // meant the stigma landed on all 29 powers and reported none of them: a consequence the player pays and cannot see.
    const r = movePowerStanding(character, p, delta, { why, day });
    if (r) moved.push({ power: r.id, name: r.name, from: r.from, to: r.to });
  }
  return moved;
}

/** ✅ THE PEOPLES HALF OF THE STIGMA (Erik, 2026-09-29). Every people this character has a standing with thinks less of
 *  them for holding an arch — and unlike a narrated beat, this one may carry a band with it.
 *  ⚠️ THE SAME SHAPE AS `stigmaFor` ON PURPOSE: only those who know, a floor at the bottom band, and the moves
 *  RETURNED so the player can be told what the holding cost them. "A consequence the player pays and cannot see" is a
 *  defect this file has already recorded once. Mutates the standings. */
export function peoplesStigmaFor(character, { rules = null, day = null, delta = -2, why = "" } = {}) {
  void day;   // ⛑ kept in the signature to match `stigmaFor`'s; the peoples door keeps no log of its own
  return worldConsequenceForPeoples(character, delta, { rules, why });
}

/* ═════ A POWER TAKES AN ARCH, AND LETS IT GO BY ITS TEMPER ═════
 *
 * ⛑ AEVI, REPLY_aevi_ccode_563: *"A verb, for powers in play: `seize_arch`… Powers let go, by temper. A power isn't a
 * fool: it releases the arch when a keeper at its temper's rung arrives (kind/fair: at the first signs; hard: heroic;
 * cruel: epic). So the Ender Host will hold through two keepers and break at the third."*
 */

/** ⛔ WHICH RUNG BREAKS A POWER OF THIS TEMPER. ⚠️ READ FROM THE LADDER BY NAME, never by an index typed here — the
 *  rungs are `["signs","notable","heroic","epic","legendary"]` and a content retune of that ladder must retune this
 *  with it, not silently disagree. An unknown temper breaks at the first signs, which is the cautious answer. PURE. */
export const TEMPER_BREAKS_AT = { kind: "signs", fair: "signs", hard: "heroic", cruel: "epic" };

export function breakRungFor(temper, { rules = null } = {}) {
  const ladder = Array.isArray(rules?.gateHold?.rungs) && rules.gateHold.rungs.length ? rules.gateHold.rungs : GATE_HOLD.rungs;
  const want = TEMPER_BREAKS_AT[String(temper || "").toLowerCase()] || "signs";
  const i = ladder.indexOf(want);
  return i >= 0 ? i : 0;
}

/** ⛔ A POWER TAKES AN ARCH IT STANDS ON BUT DOES NOT HOLD. Written to the SAVE's power state, never to the authored
 *  record — a seizure in play is this character's world, not everyone's.
 *  ⚠️ IT REFUSES A MADE GATE, exactly as the player's own seizure does: the inheritance is the 26 authored names, and
 *  a gate built in play is nobody's to inherit. → { ok, at, news } or { ok: false, why }. Mutates. */
export function powerSeizesArch(character, power, { content = null, locations = null, rules = null, day = null } = {}) {
  if (!power?.id) return { ok: false, why: "no power" };
  if (gateHeldByPower(power, character)) return { ok: false, why: "it already holds one" };
  const locs = locations || content?.locations || {};
  const lattice = new Set(latticeGates(locs));
  // ⛑ the ground it stands on, and only an arch of the Lattice's own laying
  const at = (power.holds || []).map(h => h?.at).find(a => a && lattice.has(a));
  if (!at) return { ok: false, why: "it stands on no arch of the Lattice's laying" };
  const taken = holderOfGate(at, { character, powers: content?.powers || [] });
  if (taken) return { ok: false, why: `${taken.name || taken.id} holds it already` };
  // ⚠️ `powerStateOf` READS; it does not create. A power the character has never heard of has no state at all, and
  // seizing an arch is exactly how they hear of it — so the bag is made here rather than assumed.
  const bag = character.powerState && typeof character.powerState === "object" ? character.powerState : (character.powerState = {});
  const s = bag[power.id] || (bag[power.id] = {});
  s.gateHeld = at;
  s.gateHeldSince = day ?? null;
  const name = locs?.[at]?.name || at;
  return { ok: true, at, power: power.id,
    news: `${power.name || power.id} has put its people on the arch at ${name}.` };
}

/** ⛔ …AND LETS IT GO WHEN SOMEBODY IT CANNOT FACE ARRIVES. The keeper rung climbs on the same season rhythm the
 *  player's own holding does, and a power breaks at the rung its temper can stand. → the releases, which the caller
 *  turns into news. ⚠️ A power with no seizure DAY cannot be timed, so it holds — absence is not "a season ago".
 *  Mutates. */
export function powersReleaseArches(character, { content = null, locations = null, rules = null, day = null } = {}) {
  const out = [];
  if (day == null) return out;
  const locs = locations || content?.locations || {};
  for (const p of (content?.powers || [])) {
    const s = powerStateOf(character, p?.id);
    const at = s?.gateHeld;
    if (!at) continue;
    if (!Number.isFinite(Number(s.gateHeldSince))) continue;   // ⚠️ never timed — it holds
    const rung = keeperRungAt(s.gateHeldSince, day, { rules });
    const breaks = breakRungFor(p.temper || p.tempers?.now || null, { rules });
    if (rung < breaks) continue;
    delete s.gateHeld; delete s.gateHeldSince;
    const name = locs?.[at]?.name || at;
    out.push({ power: p.id, name: p.name || p.id, at, rung, temper: p.temper || null,
      news: `${p.name || p.id} has come off the arch at ${name}.` });
  }
  return out;
}

/* ═════ THE CLOCK, AND WHAT COMES THROUGH ═════ */

/** ⛔ HOW FAR UP THE LADDER THIS HOLDING HAS CLIMBED. Aevi: *"first signs… then keepers at a rising rung (notable →
 *  heroic → epic → legendary) on a season's rhythm"*. Rung 0 is the signs. PURE. */
export function keeperRungAt(since, day, { rules = null } = {}) {
  if (!Number.isFinite(Number(since)) || !Number.isFinite(Number(day))) return 0;
  const per = seasonDays(rules);
  const seasons = Math.floor(Math.max(0, num(day) - num(since)) / per);
  return Math.max(0, Math.min(GATE_HOLD.rungs.length - 1, seasons));
}

/** ⛑ THE CREATURE FOR A RUNG, out of Aevi's own roster — matched by the tier she authored, never by position, so the
 *  order of her file is hers to change. Rung 0 (the signs) has no creature: nothing has come through yet. PURE. */
export function keeperFor(rung, { content = null } = {}) {
  const tier = GATE_HOLD.rungs[Math.max(0, Math.min(GATE_HOLD.rungs.length - 1, num(rung, 0)))];
  if (!tier || tier === "signs") return null;
  // ⛔ `bestiary.roster`, NOT `bestiary`. The loader keeps the FILE whole — `{schemaVersion, id, kind, classes, roster}`
  // — so `Object.values(bestiary)` is `[1, "bestiary", "kind", …]` and this found nothing, every time. The clock climbed
  // through all four rungs and nothing ever came through, because the `if (!creature) continue` below reads as a guard
  // for content Aevi has not authored yet. ⚠️ A tolerant guard is exactly where a wrong shape hides.
  const all = Array.isArray(content?.bestiary?.roster) ? content.bestiary.roster
    : Array.isArray(content?.bestiary) ? content.bestiary : [];
  return all.find(c => c && c.class === "lattice_keeper" && String(c.tier) === tier) || null;
}

/** ⛔ IS ONE DUE? One a season, and never twice for the same season. PURE apart from reading the holding's own record. */
export function keeperDue(record, day, { rules = null } = {}) {
  const rung = keeperRungAt(record?.since, day, { rules });
  if (rung < 1) return { due: false, rung, why: "only signs so far — nothing has come through yet" };
  const last = Number.isFinite(Number(record?.lastKeeperRung)) ? Number(record.lastKeeperRung) : -1;
  if (rung <= last) return { due: false, rung, why: "this season's keeper has already come" };
  return { due: true, rung };
}

/** ⛔ THE PASS — the drift, and what the arch sends. Called from the world tick.
 *
 *  ⛑ `signs` IS A BEAT, NOT A FIGHT: the gate opens somewhere it does not lead, a lattice line hums under the town.
 *  Then a keeper a season, climbing. ⚠️ Nothing here pursues: Aevi's own line is *"It never pursues past the gate's yard,
 *  and it never comes for a gate nobody holds."* Releasing the gate ends it, which is why `gatesHeld` is the only input. */
export function gateHoldPass(character, { content = null, rules = null, day = null } = {}) {
  const out = { news: [], keepers: [], stigma: [], peoples: [] };   // ✅ `peoples` since Erik's 09-29 ruling
  const held = gatesHeldBy(character);
  const per = seasonDays(rules);
  for (const [locId, rec] of Object.entries(held)) {
    if (!rec || !Number.isFinite(Number(rec.since)) || !Number.isFinite(Number(day))) continue;
    const name = content?.locations?.[locId]?.name || locId;
    const seasons = Math.floor(Math.max(0, num(day) - num(rec.since)) / per);

    // ⛑ THE SLOW DRIFT — "a slow drift down while it's held", one step a season, and only once per season.
    const drifted = num(rec.seasonsDrifted, 0);
    if (seasons > drifted) {
      rec.seasonsDrifted = seasons;
      const whyStill = `still holds the arch at ${name}`;
      const drift = num(rules?.gateHold?.driftStigma, GATE_HOLD.driftStigma);
      const moved = stigmaFor(character, { content, rules, day, delta: drift, why: whyStill });
      // ✅ ERIK 2026-09-29 — the peoples drift with the powers. Both halves on both sites, or it is half a rule.
      const movedPeoples = peoplesStigmaFor(character, { rules, day, delta: drift, why: whyStill });
      if (movedPeoples.length) out.peoples = [...(out.peoples || []), ...movedPeoples];
      if (moved.length || movedPeoples.length) {
        out.stigma.push(...moved);
        out.news.push(`Word has gone round again that the arch at ${name} is still held.`);
      }
    }

    // ⛔ AND WHAT COMES THROUGH IT
    const first = !rec.saidSigns;
    const due = keeperDue(rec, day, { rules });
    if (first && due.rung < 1) {
      rec.saidSigns = true;
      out.news.push(`The arch at ${name} opened twice on nothing, and a lattice line hummed under the ground all night.`);
      continue;
    }
    if (!due.due) continue;
    const creature = keeperFor(due.rung, { content });
    if (!creature) continue;                       // content has not authored this rung: no invention here
    rec.lastKeeperRung = due.rung;
    rec.lastKeeperDay = num(day);
    out.keepers.push({ at: locId, name, rung: due.rung, tier: GATE_HOLD.rungs[due.rung], creatureId: creature.id, creature });
    out.news.push(`Something came through the arch at ${name}: ${creature.name}. It is not anyone's, and it will not be argued with.`);
  }
  return out;
}

/** ⛑ THE READOUT — what holding this arch has cost so far and what is coming, for the card and for the GM. PURE. */
export function gateHoldReadout(character, { content = null, rules = null, day = null } = {}) {
  const rows = [];
  for (const [locId, rec] of Object.entries(gatesHeldBy(character))) {
    const rung = keeperRungAt(rec?.since, day, { rules });
    const next = Math.min(GATE_HOLD.rungs.length - 1, rung + 1);
    const per = seasonDays(rules);
    const intoSeason = Number.isFinite(Number(rec?.since)) && Number.isFinite(Number(day))
      ? Math.max(0, num(day) - num(rec.since)) % per : 0;
    rows.push({
      at: locId, name: content?.locations?.[locId]?.name || locId,
      how: rec?.how || null, since: rec?.since ?? null,
      rung, tier: GATE_HOLD.rungs[rung],
      nextTier: next > rung ? GATE_HOLD.rungs[next] : null,
      daysToNext: next > rung ? Math.max(0, per - intoSeason) : null,
      said: rung < 1
        ? `The arch has begun to misbehave. Nothing has come through yet.`
        : `${GATE_HOLD.rungs[rung]} — and it climbs while you hold it. Let the arch go and whatever came through goes back through it within the day.`,
    });
  }
  return rows;
}
