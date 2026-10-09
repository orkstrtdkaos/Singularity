// journey.js — SNG-386 §4.4 / SNG-331 §1: ROUTES OVER THE MIXED GRAPH — roads AND gates.
//
// ⛔ WHY THIS IS ITS OWN MODULE. `waygate.js` is deliberately geometry-free — it takes `walkingDays` by
// injection so it never imports the map — and `worldmap.js` knows nothing about who may use a gate. A route is
// the one thing that needs BOTH, so it lives where it can hold both without either of them growing a
// dependency it was designed not to have. ⚑ It is also where caravans will live: a caravan is a delegate, a
// route and a load, and the route is the half that already exists here.
//
// ⚑ TWO NAMED OPTIONS, NEVER ONE OPTIMAL ONE — SNG-331 §1, and Aevi is right about why: *"four days through
// the Wend, or seven around it"* is a DECISION; a single best route is an ANSWER, and an answer is not
// gameplay. ⚠️ BUT A SECOND OPTION THAT IS 653% WORSE IS NOT A CHOICE, IT IS A TRAP. Measured: banning
// `the_axis_gate` turns a 53-day walk to the Crossing into a 402-day one, because that gate is a chokepoint the
// world genuinely has. So the rule here is that a second option is offered when it is a real one, and when the
// world honestly has only one way through, this SAYS SO rather than manufacturing a decision.

import { walkingDays } from "./worldmap.js";
import { isNetworkGate, waygateTierOf, wayfaringTier, hubWaygate, gateHopCost, aimsOpen, knowsGate } from "./waygate.js";
/* ⛔ SNG-679 S6 — A ROUTE IS WHERE A BROKEN ROAD IS FELT. ✅ Erik: *"Every single thing that exists needs to
 * be able to be … damaged, ruined … by the game."* ✅ Aevi: *"Roads: damaged ×1.5 days. Ruined ×2 days and
 * closed to carts, caravans and moving holds. Destroyed is out of `routeBetween` until it is repaired."*
 * ⛑ Imported rather than injected, unlike `walkingDays`'s neighbours here: a route that silently ignores the
 * state of the roads it routes over is worse than one that cannot be built, and an optional hook is a thing
 * eleven callers can forget. The state is read only when a caller hands in a character AND the content — with
 * neither, every answer is exactly today's. */
import { roadLeg, gateLeg } from "./mapstate.js";

/** ⚑ THE ROAD GRAPH IS `connections`, WEIGHTED BY REAL DISTANCE. Measured on the shipped world: 135 places,
 *  182 undirected edges, ONE connected component, and not a single asymmetric edge — so a road always goes
 *  both ways and every place can be walked to from every other.
 *
 *  ⚠️ THE WEIGHT IS `walkingDays`, NOT A HOP COUNT. Measured, a road runs 1.0x to 2.0x the straight line, and
 *  counting hops instead would call a single 150-day leg "closer" than three 2-day ones. `banned` lets a
 *  caller ask for the way round something, which is how the second option gets found. PURE. */
/* ═════ J1 · A JOURNEY TAKES THE ROAD'S LENGTH ═════
 * ✅ ERIK 2026-10-09 (through Aevi): *"Makes sense for road journeys to take longer. That's why we have travel skills."* ✅ AEVI: *"A
 * leg's days follow the routed road's length, not the crow's line. The median road gets about ×1.4 longer, and that is the intent. …
 * Water stays at `trade.waterSpeed` on the crow's distance, since a boat doesn't follow the road. … A road with no route (a gate
 * yard stub, a leg the router can't price) keeps the straight line, and says so in `fallbacks`."*
 * ⛔ THE LENGTH IS READ FROM A DERIVED TABLE, NEVER FROM THE ROUTER AT PLAY TIME. The router runs on the terrain in the app and
 * takes ~0.6 s; a journey priced from it would cost one number before the globe was opened and another after. So
 * `tests/world_roads_measure.mjs --write` writes `content/packs/core/world/road_lengths.json` (each routed road's length over its
 * straight line, and the `fallbacks` that have no route), and every push fails when the file and the router disagree — the
 * pattern Erik's sea lanes already use. ⛑ One door: every road leg in the game is `roadDays`, so the travel screen, a caravan's
 * run, a job's reach and a band's march all take the same road. */
export function roadRatio(content, a, b) {
  const k = a < b ? `${a}|${b}` : `${b}|${a}`;
  const r = Number(content?.roadLengths?.[k]);
  return Number.isFinite(r) && r >= 1 ? r : 1;
}
/** Whether this road keeps the straight line because it has no route (a `fallbacks` road, or one the table does not know). */
export function roadIsStraight(content, a, b) {
  const k = a < b ? `${a}|${b}` : `${b}|${a}`;
  return !Number.isFinite(Number(content?.roadLengths?.[k]));
}
/** The days a road leg takes: the straight walk × the road's own length over it. Null for an unplaced end. */
export function roadDays(locations, a, b, { content = null } = {}) {
  const w = walkingDays(locations?.[a], locations?.[b]);
  return w == null ? null : w * roadRatio(content, a, b);
}
export function roadDistances(fromId, locations = {}, { banned = null, character = null, content = null, carts = false } = {}) {
  const skip = banned instanceof Set ? banned : new Set(banned || []);
  skip.delete(fromId);
  const dist = { [fromId]: 0 }, prev = {}, done = new Set();
  if (!locations[fromId]) return { dist: {}, prev: {} };
  const queue = [[0, fromId]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u] = queue.shift();
    if (done.has(u)) continue;
    done.add(u);
    for (const v of (locations[u]?.connections || [])) {
      if (!locations[v] || skip.has(v) || done.has(v)) continue;
      let w = roadDays(locations, u, v, { content });   // ✅ J1: the road's own length
      if (w == null) continue;                   // an unplaced end has no measurable leg — skip, never guess
      /* ⛔ S6 · THE LEG'S STATE, ON THE ONE EDGE THE WHOLE GRAPH IS WALKED BY. Every route in the game — the
       * travel screen, a caravan's run, a job's reach, a band's march — comes through here, so a road that is
       * out is out everywhere at once, and a slow road is slow everywhere at once. ⛑ `roadLeg` also answers
       * for the two places: a DESTROYED place is not a road end (S6), so its roads close with it. */
      if (character && content) {
        const leg = roadLeg(character, u, v, w, { content, carts });
        if (!leg.open) continue;
        w = leg.days;
      }
      const nd = d + w;
      if (dist[v] === undefined || nd < dist[v]) { dist[v] = nd; prev[v] = u; queue.push([nd, v]); }
    }
  }
  return { dist, prev };
}

/** ⛔ CCODE-416 (Erik: "fix the travel bugs") — A ROAD GOES BOTH WAYS, and this makes it so for every place in the map it is handed.
 *  ⚑ A place the game grows lists its neighbour, and the mint adds the neighbour's road back — but only in that session's memory: the
 *  neighbour is authored, its list comes from content on the next load, and the road back is gone. `roadDistances` walks only what a
 *  place lists, so after a reload a grown place could be walked OUT of and never walked TO — Threshold Post, listing the Crossing, sat
 *  unreachable by road from everywhere, and a traveller who could not aim a gate had no way there at all.
 *  ⚠️ The authored world is already symmetric (no road in content runs one way — §297 holds it), so this only ever adds the road back
 *  to a place that named its neighbour. Idempotent: a road already listed both ways is left alone. Mutates `locations`; returns the
 *  number of roads it made two-way. */
export function twoWayRoads(locations = {}) {
  let added = 0;
  for (const [id, l] of Object.entries(locations || {})) {
    for (const n of (Array.isArray(l?.connections) ? l.connections : [])) {
      const back = locations[n];
      if (!back || n === id) continue;
      const list = Array.isArray(back.connections) ? back.connections : [];
      if (list.includes(id)) continue;
      back.connections = [...list, id];
      added++;
    }
  }
  return added;
}

/** The path itself, walked back out of a `roadDistances` result. Null when the place was never reached. */
export function pathFrom({ dist, prev }, fromId, toId) {
  if (!dist || dist[toId] === undefined) return null;
  const path = [toId];
  let c = toId;
  while (prev[c] !== undefined) { c = prev[c]; path.unshift(c); }
  if (path[0] !== fromId) return null;
  return { days: dist[toId], path, legs: path.length - 1 };
}

/** One origin, one destination — the common case, and the shape every caller already wanted. */
export function roadRoute(fromId, toId, locations = {}, { banned = null, character = null, content = null, carts = false } = {}) {
  if (!locations[fromId] || !locations[toId]) return null;
  if (fromId === toId) return { days: 0, path: [fromId], legs: 0 };
  const skip = banned instanceof Set ? new Set(banned) : new Set(banned || []);
  skip.delete(fromId); skip.delete(toId);        // never ban the ends — that is not a route, it is a refusal
  return pathFrom(roadDistances(fromId, locations, { banned: skip, character, content, carts }), fromId, toId);
}
/** ⛔ WHICH GATES THIS TRAVELLER MAY AIM AT — and it is a far shorter list than the network. Measured on
 *  Silas: 26 network gates exist and he can aim at TWO. Discovery and wayfaring tier are what keep walking a
 *  real choice; without them the network dominates every journey by 80-98% and the road is decoration.
 *
 *  ⚑ THE HUB IS ALWAYS FINDABLE — everyone can find the centre, which is `networkGatesFrom`'s own rule and the
 *  reason the Crossing is the Crossing. ⚠️ A null traveller means NO RESTRICTION, for planning tools and for
 *  asking what the world could offer someone; it is not the traveller's own answer. */
export function gatesUsableBy(traveller, locations = {}) {
  const all = Object.values(locations).filter(isNetworkGate);
  if (!traveller) return all.map(g => g.id);
  const hub = hubWaygate(locations);
  const tier = wayfaringTier(traveller);
  // ⛔ SNG-663 §2b — THE SAME DISCOVERY RULE THE ROUTER USES (`knowsGate`), not a copy of it: a route offered
  // through a gate the router would refuse is a trap, and a route refused through one it allows is a lost gate.
  return all.filter(g => (hub && g.id === hub.id) || (knowsGate(traveller, g, locations) && tier >= waygateTierOf(g))).map(g => g.id);
}

/** ⚠️ NAME THE ROUTE BY WHAT YOU GO THROUGH. "Four days through the Wend" only works if something names the
 *  Wend, and a list of nine ids is not a name. The place nearest the HALFWAY POINT by distance is the one a
 *  traveller would actually say they went via — not the longest leg, which is often just the empty middle. */
function viaName(path, locations, content = null) {
  if (!Array.isArray(path) || path.length < 3) return null;
  let total = 0;
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    total += roadDays(locations, path[i - 1], path[i], { content }) || 0;   // ✅ J1: halfway along the road walked
    cum.push(total);
  }
  if (!(total > 0)) return null;
  let best = 1, bestGap = Infinity;
  for (let i = 1; i < path.length - 1; i++) {
    const gap = Math.abs(cum[i] - total / 2);
    if (gap < bestGap) { bestGap = gap; best = i; }
  }
  return { id: path[best], name: locations[path[best]]?.name || path[best] };
}

const round1 = (n) => Math.round(n * 10) / 10;
/** ⚠️ "through the The Crossing gate" — this world names a great many of its places "The something", so a
 *  label that prefixes its own article has to take the name's off first. */
const bare = (name) => String(name || "").replace(/^the\s+/i, "");
// ⚑ CCODE-418: "through the Made Gate gate" — a gate whose name already says gate is not called a gate twice
// ⛑ CCODE-689 (Erik's renames): AND A NAME THAT IS ONE WORD ENDING IN "gate" IS A PROPER NAME, NOT "the X gate". "The Made
// Gate" became Madegate and the label read "through the Madegate gate"; it reads "through Madegate", as "through Palegate".
const gateName = (name) => {
  const b = bare(name);
  if (/\bgate$/i.test(b)) return `the ${b}`;
  if (/^\S+gate$/i.test(b)) return b;
  return `the ${b} gate`;
};

/** ⚑ THE ROUTE, AS A DECISION. Returns `{ from, to, options, soleOption, note }` — never a single "best" with
 *  the alternatives hidden, and never a fabricated second.
 *
 *  ⛔ THE GATE LEG IS THE WHOLE POINT (Aevi): *"forty days on foot, or six to the Longshore gate and twelve
 *  hours through."* Measured on the shipped world, a gate turns a 236-day walk to the Gearlands Verge into 3.9
 *  days — but only for a traveller who has FOUND the gates, which is why `traveller` restricts them.
 *
 *  ⚠️ A SECOND ROAD OPTION IS OFFERED ONLY WHEN IT IS ONE. `altFactor` is the ceiling: a way round that costs
 *  more than this much extra is a trap rather than a choice, and the honest answer is that the world has one
 *  road here. ⛑ `soleOption` says so out loud, so a caller never has to infer it from the array's length.
 *
 *  PURE over locations + the traveller's own knowledge. */
export function routeBetween(fromId, toId, locations = {}, { traveller = null, altFactor = 1.6, gateEnergy = true, rules = {}, character = null, content = null, carts = false } = {}) {
  // ⛑ the traveller IS the character on every in-play call; `character` stays separate because a planning
  // tool may ask what the WORLD offers someone who is not standing anywhere, and that caller passes neither.
  const who = character || traveller;
  if (!locations[fromId] || !locations[toId]) return null;
  if (fromId === toId) return { from: fromId, to: toId, options: [], soleOption: false, note: "you are already there" };

  const options = [];
  const road = roadRoute(fromId, toId, locations, { character: who, content, carts });
  if (road) {
    const via = viaName(road.path, locations, content);
    options.push({
      kind: "road", label: via ? `on foot, by way of ${via.name}` : "on foot",
      days: round1(road.days), energy: 0, legs: road.legs, path: road.path, via: via?.id || null,
    });
  }

  // ── the gate leg, on TWO searches rather than one per ordered pair of gates
  // ⛔ THE SECOND SEARCH RUNS FROM THE DESTINATION AND IS READ BACKWARDS, which is only sound because the
  // road graph is symmetric — measured, 364 directed edges and not one of them one-way. §99 asserts it, so a
  // future one-way road fails a gate instead of quietly making every gate route wrong.
  /* ✅ S6: *"Waygates: damaged is +1 day. Ruined and destroyed are out of the network."* ⛑ Filtered where the
   * list is BUILT, so every one of the four places this function reaches for a gate sees the same list — the
   * gate-to-gate search, the aimed-open fold, and both ends of the walk. */
  const gateState = (id) => (who && content ? gateLeg(who, id, { content }) : { open: true, extraDays: 0 });
  const gates = gatesUsableBy(traveller, locations).filter((id) => gateState(id).open);
  const fromAll = roadDistances(fromId, locations, { character: who, content, carts });
  const toAll = roadDistances(toId, locations, { character: who, content, carts });
  let bestGate = null;
  for (const g1 of gates) {
    const inDays = fromAll.dist[g1];
    if (inDays === undefined) continue;
    for (const g2 of gates) {
      if (g2 === g1) continue;
      const outDays = toAll.dist[g2];
      if (outDays === undefined) continue;
      const hop = gateHopCost(walkingDays(locations[g1], locations[g2]) || 0);
      // a damaged gate at either end costs its extra day — the fold is slower, not shut
      const slow = gateState(g1).extraDays + gateState(g2).extraDays;
      const days = inDays + hop.hours / 24 + outDays + slow;
      if (!bestGate || days < bestGate.days) bestGate = { days, g1, g2, hop, inDays, outDays };
    }
  }
  if (bestGate) {
    bestGate.in1 = pathFrom(fromAll, fromId, bestGate.g1) || { days: bestGate.inDays, path: [fromId, bestGate.g1], legs: 1 };
    const back = pathFrom(toAll, toId, bestGate.g2);
    bestGate.out = back ? { days: back.days, path: [...back.path].reverse(), legs: back.legs }
      : { days: bestGate.outDays, path: [bestGate.g2, toId], legs: 1 };
  }
  // ⛔ CCODE-418 — AIMED OPEN. A wayfarer good enough (`aimsOpen`) walks to a gate and folds STRAIGHT to the place: the far end needs
  // no gate, so there is no walk out. Only to a place they know, and only when the place is not itself a gate (gate to gate is above).
  // Priced like any hop, on the distance folded. When it is quicker than gate-to-gate it IS the gate way — one gate option, not two.
  const dest = locations[toId];
  if (traveller && !isNetworkGate(dest) && (traveller.knownPlaces || []).includes(toId) && aimsOpen(traveller, rules).ok) {
    let open = null;
    for (const g1 of gates) {
      const inDays = fromAll.dist[g1];
      if (inDays === undefined || g1 === toId) continue;
      const hop = gateHopCost(walkingDays(locations[g1], dest) || 0);
      const days = inDays + hop.hours / 24 + gateState(g1).extraDays;
      if (!open || days < open.days) open = { days, g1, g2: toId, hop, inDays, outDays: 0, open: true };
    }
    if (open && (!bestGate || open.days < bestGate.days)) {
      open.in1 = pathFrom(fromAll, fromId, open.g1) || { days: open.inDays, path: [fromId, open.g1], legs: 1 };
      open.out = { days: 0, path: [], legs: 0 };
      bestGate = open;
    }
  }
  // ⚠️ A GATE THAT SAVES NOTHING IS NOT AN OPTION. It costs energy and it costs the fiction a journey;
  // offering it when the walk is shorter would be offering a worse road with a toll on it.
  if (bestGate && (!road || bestGate.days < road.days)) {
    options.push({
      kind: "gate",
      label: `through ${gateName(locations[bestGate.g1]?.name || bestGate.g1)}${bestGate.open ? ", folded straight there" : ""}`,
      days: round1(bestGate.days), energy: gateEnergy ? bestGate.hop.energy : 0,
      legs: bestGate.in1.legs + (bestGate.open ? 1 : bestGate.out.legs),
      path: bestGate.open ? [...bestGate.in1.path, toId] : [...bestGate.in1.path, ...bestGate.out.path],
      gate: { from: bestGate.g1, to: bestGate.g2, hours: bestGate.hop.hours, energy: bestGate.hop.energy, ...(bestGate.open ? { open: true } : {}) },
      walkIn: round1(bestGate.in1.days), walkOut: round1(bestGate.out.days),
    });
  }

  // ── a way ROUND, but only when it is a real one
  if (road && options.length < 2) {
    const via = viaName(road.path, locations, content);
    if (via) {
      const alt = roadRoute(fromId, toId, locations, { banned: [via.id], character: who, content, carts });   // ⛑ J1: the way round walks the same roads
      if (alt && alt.days <= road.days * altFactor) {
        const altVia = viaName(alt.path, locations, content);
        options.push({
          kind: "road", label: altVia ? `around ${via.name}, by way of ${altVia.name}` : `around ${via.name}`,
          days: round1(alt.days), energy: 0, legs: alt.legs, path: alt.path, via: altVia?.id || null, avoids: via.id,
        });
      }
    }
  }

  options.sort((a, b) => a.days - b.days);
  // ⛔ SAY WHEN THERE IS ONLY ONE WAY. SNG-331 asks for two named options and it is right, but the world does
  // not always have two, and manufacturing one would hand the player a decision the fiction cannot honour.
  const soleOption = options.length < 2;
  return {
    from: fromId, to: toId, options, soleOption,
    note: soleOption && options.length ? "the world offers one way here" : null,
  };
}

/** ⚑ THE ROUTE AS A SENTENCE THE GM CAN SAY, because a shape it has to compose is a shape it will get wrong.
 *  Aevi's own phrasing from SNG-331: *"forty days on foot, or six to the Longshore gate and twelve hours
 *  through."* ⚠️ Empty when there is nothing to say — never a line that reports no route as if it were one. */
export function routeLine(route, locations = {}) {
  if (!route?.options?.length) return null;
  const name = (id) => locations[id]?.name || id;
  const parts = route.options.map(o => o.kind === "gate"
    ? `${o.days} days ${o.label} (${o.walkIn} days to it, ${o.gate.hours}h through, ${o.gate.open ? "straight there" : `${o.walkOut} days on`}) — ${o.energy} energy`
    : `${o.days} days ${o.label}`);
  const head = `${name(route.from)} → ${name(route.to)}: `;
  return head + parts.join(", or ") + (route.soleOption ? " — the world offers one way here" : "");
}
