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

  const moved = stigmaFor(character, { content, rules, day, delta: num(rules?.gateHold?.seizeStigma, GATE_HOLD.seizeStigma),
    why: `took the arch at ${loc.name || locationId}` });
  return { ok: true, at: locationId, name: loc.name || locationId, how, moved,
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
 *  ⬜ THE PEOPLES HALF IS NOT DONE HERE and I am not pretending it is: `applyStandingOps` is the GM's NARRATED door —
 *  it caps at four ops a beat and clamps at a band edge on purpose, because "a scene is not a life" — and a world rule
 *  moving every people at once through it would be using a throttle as a mechanism. That needs either a bulk door or
 *  Erik's ruling on whether a world consequence may cross a band; it is in the PO note rather than guessed at. */
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
  const out = { news: [], keepers: [], stigma: [] };
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
      const moved = stigmaFor(character, { content, rules, day,
        delta: num(rules?.gateHold?.driftStigma, GATE_HOLD.driftStigma),
        why: `still holds the arch at ${name}` });
      if (moved.length) { out.stigma.push(...moved); out.news.push(`Word has gone round again that the arch at ${name} is still held.`); }
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
