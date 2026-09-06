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
import { isNetworkGate, waygateTierOf, wayfaringTier, hubWaygate, gateHopCost } from "./waygate.js";

/** ⚑ THE ROAD GRAPH IS `connections`, WEIGHTED BY REAL DISTANCE. Measured on the shipped world: 135 places,
 *  182 undirected edges, ONE connected component, and not a single asymmetric edge — so a road always goes
 *  both ways and every place can be walked to from every other.
 *
 *  ⚠️ THE WEIGHT IS `walkingDays`, NOT A HOP COUNT. Measured, a road runs 1.0x to 2.0x the straight line, and
 *  counting hops instead would call a single 150-day leg "closer" than three 2-day ones. `banned` lets a
 *  caller ask for the way round something, which is how the second option gets found. PURE. */
export function roadDistances(fromId, locations = {}, { banned = null } = {}) {
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
      const w = walkingDays(locations[u], locations[v]);
      if (w == null) continue;                   // an unplaced end has no measurable leg — skip, never guess
      const nd = d + w;
      if (dist[v] === undefined || nd < dist[v]) { dist[v] = nd; prev[v] = u; queue.push([nd, v]); }
    }
  }
  return { dist, prev };
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
export function roadRoute(fromId, toId, locations = {}, { banned = null } = {}) {
  if (!locations[fromId] || !locations[toId]) return null;
  if (fromId === toId) return { days: 0, path: [fromId], legs: 0 };
  const skip = banned instanceof Set ? new Set(banned) : new Set(banned || []);
  skip.delete(fromId); skip.delete(toId);        // never ban the ends — that is not a route, it is a refusal
  return pathFrom(roadDistances(fromId, locations, { banned: skip }), fromId, toId);
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
  const known = new Set(traveller.knownPlaces || []);
  const tier = wayfaringTier(traveller);
  return all.filter(g => (hub && g.id === hub.id) || (known.has(g.id) && tier >= waygateTierOf(g))).map(g => g.id);
}

/** ⚠️ NAME THE ROUTE BY WHAT YOU GO THROUGH. "Four days through the Wend" only works if something names the
 *  Wend, and a list of nine ids is not a name. The place nearest the HALFWAY POINT by distance is the one a
 *  traveller would actually say they went via — not the longest leg, which is often just the empty middle. */
function viaName(path, locations) {
  if (!Array.isArray(path) || path.length < 3) return null;
  let total = 0;
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    total += walkingDays(locations[path[i - 1]], locations[path[i]]) || 0;
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
export function routeBetween(fromId, toId, locations = {}, { traveller = null, altFactor = 1.6, gateEnergy = true } = {}) {
  if (!locations[fromId] || !locations[toId]) return null;
  if (fromId === toId) return { from: fromId, to: toId, options: [], soleOption: false, note: "you are already there" };

  const options = [];
  const road = roadRoute(fromId, toId, locations);
  if (road) {
    const via = viaName(road.path, locations);
    options.push({
      kind: "road", label: via ? `on foot, by way of ${via.name}` : "on foot",
      days: round1(road.days), energy: 0, legs: road.legs, path: road.path, via: via?.id || null,
    });
  }

  // ── the gate leg, on TWO searches rather than one per ordered pair of gates
  // ⛔ THE SECOND SEARCH RUNS FROM THE DESTINATION AND IS READ BACKWARDS, which is only sound because the
  // road graph is symmetric — measured, 364 directed edges and not one of them one-way. §99 asserts it, so a
  // future one-way road fails a gate instead of quietly making every gate route wrong.
  const gates = gatesUsableBy(traveller, locations);
  const fromAll = roadDistances(fromId, locations);
  const toAll = roadDistances(toId, locations);
  let bestGate = null;
  for (const g1 of gates) {
    const inDays = fromAll.dist[g1];
    if (inDays === undefined) continue;
    for (const g2 of gates) {
      if (g2 === g1) continue;
      const outDays = toAll.dist[g2];
      if (outDays === undefined) continue;
      const hop = gateHopCost(walkingDays(locations[g1], locations[g2]) || 0);
      const days = inDays + hop.hours / 24 + outDays;
      if (!bestGate || days < bestGate.days) bestGate = { days, g1, g2, hop, inDays, outDays };
    }
  }
  if (bestGate) {
    bestGate.in1 = pathFrom(fromAll, fromId, bestGate.g1) || { days: bestGate.inDays, path: [fromId, bestGate.g1], legs: 1 };
    const back = pathFrom(toAll, toId, bestGate.g2);
    bestGate.out = back ? { days: back.days, path: [...back.path].reverse(), legs: back.legs }
      : { days: bestGate.outDays, path: [bestGate.g2, toId], legs: 1 };
  }
  // ⚠️ A GATE THAT SAVES NOTHING IS NOT AN OPTION. It costs energy and it costs the fiction a journey;
  // offering it when the walk is shorter would be offering a worse road with a toll on it.
  if (bestGate && (!road || bestGate.days < road.days)) {
    options.push({
      kind: "gate",
      label: `through the ${bare(locations[bestGate.g1]?.name || bestGate.g1)} gate`,
      days: round1(bestGate.days), energy: gateEnergy ? bestGate.hop.energy : 0,
      legs: bestGate.in1.legs + bestGate.out.legs,
      path: [...bestGate.in1.path, ...bestGate.out.path],
      gate: { from: bestGate.g1, to: bestGate.g2, hours: bestGate.hop.hours, energy: bestGate.hop.energy },
      walkIn: round1(bestGate.in1.days), walkOut: round1(bestGate.out.days),
    });
  }

  // ── a way ROUND, but only when it is a real one
  if (road && options.length < 2) {
    const via = viaName(road.path, locations);
    if (via) {
      const alt = roadRoute(fromId, toId, locations, { banned: [via.id] });
      if (alt && alt.days <= road.days * altFactor) {
        const altVia = viaName(alt.path, locations);
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
    ? `${o.days} days ${o.label} (${o.walkIn} days to it, ${o.gate.hours}h through, ${o.walkOut} days on) — ${o.energy} energy`
    : `${o.days} days ${o.label}`);
  const head = `${name(route.from)} → ${name(route.to)}: `;
  return head + parts.join(", or ") + (route.soleOption ? " — the world offers one way here" : "");
}
