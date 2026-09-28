import { walkingDays } from "./worldmap.js";
// waygate.js — SNG-148: WAYGATES. A network of gates across the world; the
// Crossing is the hub — earned by geography, not decreed (it already sits at the
// center, and the Coliseum's own connections name it).
//
// PM ruling — competence is BOTH, and they COMPOSE:
//   knowledge — the destination gate has been DISCOVERED by this character
//               (character.knownPlaces, the same discovery ledger travel uses)
//   skill     — a wayfaring competence governs how far/precisely they can aim
//   both      → the NAMED gate.
//   either    → the HUB (the Crossing).
//   neither / not at a gate → the standard destination — a ROUTING OUTCOME,
//               never a failure state (normal travel simply proceeds).
//
// Waygates are CONTENT (Law 2): a `waygate: true` flag on a location, plus
// `waygateTier` (how hard it is to aim at) and `waygateHub` on the hub.
// Transit is real travel — it takes the normal travel hours and, on the play-loop
// path, a cross-region jump is a `departure` trigger under SNG-145 (composes for
// free: the gate rides the same travel dispatch).

export function isWaygate(loc) { return !!loc?.waygate; }
export function waygateTierOf(loc) { return Math.max(1, Number(loc?.waygateTier) || 1); } // registry:internal

/* ═══ ✅ SNG-663 §2b — A GATE AT A SETTLEMENT OPENS INTO A YARD OUTSIDE IT ═══
 *
 * ⛔ ERIK 2026-09-26, on yards only where a gate stands at a settlement: *"Agreed."* And Aevi's reason: *"A force
 * can't appear in a market square."* Fifteen towns carried `waygate` on the town itself, so a gate leg ended INSIDE
 * the city. The flag moves out to a yard an hour and a half's walk away; the town keeps the road to it.
 *
 * ⛑ THE LINK IS TWO FIELDS AND THEY MUST AGREE: the yard says `gateYardFor: "<townId>"`, the town says
 * `gateYardId: "<yardId>"`. Both directions are read — a yard has to name its town (prose, and the hub), a town has
 * to name its yard (an aim at the town, and telling the GM how far out the gate is) — and §383 gates that no yard
 * and town disagree.
 *
 * ⚠️ THE WALK IS THE ROAD GRAPH'S, NOT A FIELD. The staged records carried a `_yardLeg: { hours: 1.5 }` beside a
 * `worldPos` that put every yard HALF A DAY out — one walk with two lengths, and `walkingDays` reads the position.
 * The positions were corrected to make the authored hour and a half true, and nothing here stores an hours number:
 * the distance between two placed locations is already the one answer to that question. */

/** Is this the yard a town's gate stands in? */
export function isGateYard(loc) { return !!loc?.gateYardFor; }

/** The town a gate yard serves — null for a gate in the wild, which keeps no yard. */
export function townOfGateYard(loc, locations) {
  return isGateYard(loc) ? (locations?.[loc.gateYardFor] || null) : null;
}

/** The yard a town's gate moved out to — null for a town that never had a gate. */
export function gateYardOf(loc, locations) {
  const y = loc?.gateYardId ? locations?.[loc.gateYardId] : null;
  return y && isWaygate(y) ? y : null;
}

/** ⛔ WHERE A GATE LEG ACTUALLY LANDS — the one answer every caller asks for, because a gate leg aimed at Bedrock
 *  now ends at the Weighed Arch and the walk in is the traveller's to make.
 *  ⚑ IT IS SAFE ON EVERYTHING: a gate in the wild, a town with no yard, a made gate, an id that resolves to
 *  nothing. `moved` is the fact a caller branches on; `walkDays` is the leg left to walk, from the map. PURE. */
export function gateArrivalFor(destId, locations) {
  const dest = locations?.[destId] || null;
  const yard = gateYardOf(dest, locations);
  if (!yard) return { at: destId || null, moved: false, yard: null, town: dest, walkDays: 0 };
  return { at: yard.id, moved: true, yard, town: dest, walkDays: walkingDays(yard, dest) || 0 };
}

/** ⛔ WHETHER THIS CHARACTER CAN BE SAID TO KNOW THIS GATE — ONE RULE, read by every gate reader in the game
 *  (`knownWaygates`, `networkGatesFrom`, `resolveWaygateTransit`, `gatesUsableBy`), because four copies of a
 *  discovery test is four chances to disagree about whether a player found something.
 *
 *  ⛔ AND THE YARD RULE IS THE WHOLE REASON IT EXISTS. A save's `knownPlaces` names the TOWN it walked to; no save
 *  has ever heard of a yard. Measured on the live saves before the flag moved: matching ids alone took HALF the
 *  discovered gates in the world away — Loki 18 down to 9, Brynjar 3 down to 1 — for a change that moved a gate an
 *  hour and a half down the road. A gate found is a gate found. PURE. */
export function knowsGate(character, gate, locations) {
  if (!gate) return false;
  const known = character?.knownPlaces || [];
  return known.includes(gate.id) || (isGateYard(gate) && known.includes(gate.gateYardFor));
}

/** ⛔ SNG-663 §2b — IS THIS POWER COMING BY GATE? *"A raid or army that comes by gate arrives in the yard."* Two ways
 *  to be coming by gate, and both are READ off the power's own record rather than inferred from distance:
 *
 *    · it HOLDS A GATE (§2c's `gateHeld`, the act — closing, charging, garrisoning the arch) and the place it is
 *      coming at keeps a gate yard on the same network, so there is an arch at both ends; or
 *    · its `reach` names the YARD and not the town — a writ that runs at the arch and not inside the walls, which is
 *      exactly what a power that took a gate looks like.
 *
 *  ⚠️ MEASURED, THIS FIRES FOR NOBODY TODAY: of the 6 powers that raid or toll, none reaches any of the fifteen towns
 *  with a yard, and none holds a gate as an ACT (the four that held a gate held the TOWN it stood in, and §2b moved
 *  the gate out from under them). It goes live when a power takes a gate — §2c — or when a grown one is authored
 *  with a yard in reach. `holds` alone is never enough: holding the ground around an open gate is not holding it.
 *  Returns null when the force is not coming by gate, else `{ at, yard, town, walkDays, why }`. PURE. */
export function comesByGate(power, placeId, locations) {
  if (!power || !placeId) return null;
  const arrival = gateArrivalFor(placeId, locations);
  if (!arrival.moved || !isNetworkGate(arrival.yard)) return null;
  const reach = Array.isArray(power.reach) ? power.reach : [];
  const atArch = reach.includes(arrival.yard.id) && !reach.includes(placeId);
  const holdsAGate = !!power.gateHeld && Object.values(locations || {}).some(l => isNetworkGate(l) && (
    l.id === power.gateHeld || (Array.isArray(power.holds) && power.holds.some(h => h?.at === l.id && h?.gate))));
  if (!atArch && !holdsAGate) return null;
  return { ...arrival, why: atArch ? "its writ runs at the arch and not inside the walls" : "it holds a gate of its own" };
}

/** ⚠️ A YARD NAMES ITS TOWN, OR THE WORLD CONTRADICTS ITS OWN CANON. `hubWaygate` follows the flag, so moving it
 *  made the hub "the Hub Yard" in every sentence that named it — and the Crossing is the Crossing. A yard is a PART
 *  of its town, so prose says both, and says OUTSIDE, which is the point of a yard. PURE. */
export function gateLabel(loc, locations) {
  const town = townOfGateYard(loc, locations);
  const name = String(loc?.name || "the gate");
  return town ? `${name} (the gate yard outside ${town.name})` : name;
}

/** ⛑ A WALK TOO SHORT FOR DAYS. The nearest-gate sentence read `Math.max(1, Math.round(days))` beside a plural
 *  computed from `Math.round(days)` alone, so a ninety-minute walk came out "about 1 days off" — a wrong number AND
 *  a broken plural, and a GM told the gate is a day away will not offer it this beat. PURE. */
export function walkPhrase(days) {
  const d = Number(days);
  if (!Number.isFinite(d) || d <= 0) return "right here";
  const hours = d * 24;
  if (hours < 20) {
    const h = Math.round(hours * 2) / 2;
    return `about ${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"} off`;
  }
  const n = Math.max(1, Math.round(d));
  return `about ${n} day${n === 1 ? "" : "s"} off`;
}

/** The hub gate — the location flagged waygateHub, falling back to the_crossing
 *  if it carries the waygate flag. Null when no hub is authored (network dark). */
export function hubWaygate(locations) {
  const all = Object.values(locations || {});
  return all.find(l => l?.waygateHub && l?.waygate) || (locations?.the_crossing?.waygate ? locations.the_crossing : null) || null;
}

/** All authored gates. */
export function allWaygates(locations) { // registry:internal
  return Object.values(locations || {}).filter(isWaygate);
}

/** Gates this character has DISCOVERED (been to — the knowledge half). */
export function knownWaygates(character, locations) {
  return allWaygates(locations).filter(l => knowsGate(character, l, locations));   // ⛔ SNG-663 §2b: the yard of a town they know counts
}

/** The skill half — a wayfaring tier from wits (the navigation-facing
 *  sub-attribute) plus a breadth bonus for a genuinely traveled character
 *  (regionsKnown, the SNG-100b presence accumulator). Tier 1 floor: anyone can
 *  step through a gate; aiming FAR is what's earned. Data-legible on purpose. */
export function wayfaringTier(character) {
  const wits = character?.subAttributes?.wits ?? character?.attributes?.practical ?? 2;
  const breadth = Object.keys(character?.regionsKnown || {}).length >= 5 ? 1 : 0;
  return Math.max(1, Math.floor(wits / 2) + breadth);
}

// ---------- SNG-243 §4: the gate NETWORK (SNG-148 realized) ----------
// A networkCapable gate reaches any OTHER network gate the character KNOWS (been to) and can aim at (skill),
// gate-to-gate — the hub-and-spoke that turns waygates from convenience into infrastructure. The Made Gate
// (SNG-243 §3) is the player's FIRST personal spoke: Silas made the first new gate, and it's his entry into
// the network. Membership: authored gates ARE network nodes; a runtime (made) gate opts in via networkCapable.

/** ⛔ CCODE-418 — A GATE AIMED OPEN. Erik (2026-09-18): *"It CAN also be used to travel directly to other gates, and if you're really
 *  good, can take you to any location you want (any waygate can do that)."* Gate to gate is SNG-243 §4. This is the other half: at a
 *  network gate, a wayfarer good enough folds straight to any place they KNOW — no gate at the far end, so no walk out of one.
 *  ⚑ "Really good" is data, and there are two ways to be it: a wayfaring tier past every gate's (content gates run 1–3, so the bar
 *  is 4 — wits 8, or wits 6 and five regions walked), or a craft whose whole art is the fold (`waygate`, the Numinous capstone:
 *  "open a fold to a place you KNOW WELL… crossing any distance"). ⚠️ Still knowledge AND skill, as the PM ruling at the top of
 *  this file composes them: the place must be one the traveller knows. `rules.waygate` overrides the defaults; Erik's to turn. */
export const WAYGATE_DEFAULTS = { openAimTier: 4, openAimCrafts: ["waygate"] };
export function waygateRules(rules = {}) {
  return { ...WAYGATE_DEFAULTS, ...((rules && rules.waygate && typeof rules.waygate === "object") ? rules.waygate : {}) };
}

/** Can this traveller aim a gate at a place that is not a gate? → { ok, by } — `by` names what made them good enough (the tier, or the
 *  craft), so a label can say it. Pure. */
export function aimsOpen(traveller, rules = {}) {
  if (!traveller) return { ok: false, by: null };
  const w = waygateRules(rules);
  const tier = wayfaringTier(traveller);
  const bar = Number(w.openAimTier);
  if (Number.isFinite(bar) && bar > 0 && tier >= bar) return { ok: true, by: `wayfaring ${tier}` };
  const held = new Set((Array.isArray(traveller.abilities) ? traveller.abilities : []).map(a => a?.abilityId || a?.id).filter(Boolean));
  const craft = (Array.isArray(w.openAimCrafts) ? w.openAimCrafts : []).find(id => held.has(id));
  return craft ? { ok: true, by: craft } : { ok: false, by: null };
}

/** Is this gate a participant in the travel network? Authored gates are; a made/runtime gate opts in. */
export function isNetworkGate(loc) {
  if (!loc?.waygate) return false;
  if (loc.networkCapable || loc.waygateHub) return true;
  return !loc._gen; // authored gate → in the network; a runtime/made gate joins only if it declared networkCapable
}

// The gate-hop DIALS (Erik's to tune). A hop costs TIME — a fraction of the overland journey, because the gate's
// whole point is that a season becomes an afternoon — plus a flat ENERGY toll (the wayfaring effort). Never free:
// a cost keeps the network infrastructure, not a teleport cheat. Caps keep the shortest hop meaningful, the
// longest sane. timeFraction 0.04 → a 300-day antipodal walk becomes ~12h (capped at maxHours regardless).
/** ✅ SNG-663 §2a — ERIK 2026-09-27: *"It doesn't cost to go through a gate"*, and then: *"I also think the energy
 *  cost at a gate is kind of pointless at this point... 10e is next to nothing."* So a gate leg costs TIME and
 *  nothing else, for a traveller, a load and a company alike.
 *
 *  ⛑ THE PRICE STAYS A NUMBER IN ONE PLACE. Everything downstream — the route option's `energy`, the journey plan's
 *  "(N energy at the gate)", the map's aim-the-gate button, `travelTo`'s spend — reads `gateHopCost`, so the ruling is
 *  this field and the plumbing is untouched. If a gate is ever priced again it is one number, not a rebuild. */
export const GATE_HOP = { timeFraction: 0.04, minHours: 2, maxHours: 72, energy: 0 };
/** Price a hop from an overland distance (days on foot) → { hours, energy, overlandDays }. Pure. */
export function gateHopCost(overlandDays = 0) {
  const d = Math.max(0, Number(overlandDays) || 0);
  const hours = Math.max(GATE_HOP.minHours, Math.min(GATE_HOP.maxHours, Math.round(d * 24 * GATE_HOP.timeFraction)));
  return { hours, energy: GATE_HOP.energy, overlandDays: Math.round(d) };
}

/** The network gates reachable FROM where the character stands (which must itself be a network gate): every
 *  OTHER network gate they've DISCOVERED and can aim at (their wayfaring tier ≥ the gate's), plus the hub
 *  (always findable). Each carries the overland distance + priced hop (gateHopCost) so the caller can surface
 *  cost. Empty when not standing at a network gate. Pure over locations + knownPlaces/wayfaring. `walkingDays`
 *  is injected (worldmap.js) so this module stays geometry-free; without it, cost is the minimum-hours floor. */
export function networkGatesFrom(character, locations, { walkingDays } = {}) {
  const origin = locations?.[character?.currentLocationId];
  if (!isNetworkGate(origin)) return [];
  const hub = hubWaygate(locations);
  const tier = wayfaringTier(character);
  // ⛔ SNG-663 §2b — AND THE DEFAULT IS NORMALISED THROUGH THE YARD. Both made gates in the world default to
  // `the_crossing`, which stopped being a gate the moment the flag moved: the default endpoint vanished from the
  // network list and the router handed the leg back as ordinary travel — a 34-day walk standing in for a gate, on
  // Erik's own save, which is the exact bug §297 exists to forbid.
  const defaultTo = gateArrivalFor(origin.waygateDefaultTo || null, locations).at; // SNG-243 §3: the made gate's default endpoint
  return Object.values(locations || {})
    .filter(l => isNetworkGate(l) && l.id !== origin.id)
    .filter(l => (hub && l.id === hub.id) || (knowsGate(character, l, locations) && tier >= waygateTierOf(l)))
    .map(l => {
      const overlandDays = (typeof walkingDays === "function") ? (walkingDays(origin, l) || 0) : 0;
      return { id: l.id, name: l.name, tier: waygateTierOf(l), isHub: !!(hub && l.id === hub.id), isDefault: l.id === defaultTo, overlandDays, cost: gateHopCost(overlandDays) };
    })
    .sort((a, b) => (a.isDefault !== b.isDefault ? (a.isDefault ? -1 : 1) : a.isHub !== b.isHub ? (a.isHub ? -1 : 1) : a.overlandDays - b.overlandDays));
}

/** PURE routing. From a gate, aiming at destId:
 *  { destId, routed: "named"|"hub"|"open", known, skilled } — or null when the origin
 *  isn't a gate / the network has no hub / no gates exist (standard travel).
 *  Discovery without skill → hub; skill without discovery → hub; both → named.
 *  Aiming at the hub itself is always "hub" (everyone can find the center).
 *  ⛔ CCODE-418: a place that is NOT a gate is "open" — from a network gate, a place they know, a wayfarer good enough (`aimsOpen`);
 *  anyone else gets null, which is ordinary travel, exactly as before. */
export function resolveWaygateTransit({ character, destId, locations, rules = {} }) {
  const origin = locations?.[character?.currentLocationId];
  if (!isWaygate(origin)) return null;
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const dest = locations?.[destId];
  if (!dest || dest.id === origin.id) return null;
  // ⛔ SNG-663 §2b — AIMING AT A TOWN WHOSE GATE MOVED OUT IS AIMING AT ITS YARD. The gate a traveller found at
  // Bedrock is still the gate they found; it now stands an hour and a half outside the walls, and `walkDays` is the
  // leg they have left to walk. ⚠️ WITHOUT THIS a moved town is a non-gate place, and the Made Gate's own default
  // endpoint became an overland walk.
  const yard = gateYardOf(dest, locations);
  if (yard && yard.id !== origin.id) {
    const knewIt = knowsGate(character, yard, locations);
    const skilledEnough = wayfaringTier(character) >= waygateTierOf(yard);
    return (knewIt && skilledEnough)
      ? { destId: yard.id, routed: "named", known: knewIt, skilled: skilledEnough, yardFor: dest.id, walkDays: walkingDays(yard, dest) || 0 }
      : { destId: hub.id, routed: "hub", known: knewIt, skilled: skilledEnough };
  }
  if (!isWaygate(dest)) {
    if (!isNetworkGate(origin)) return null;
    const known = (character?.knownPlaces || []).includes(dest.id);
    return known && aimsOpen(character, rules).ok ? { destId: dest.id, routed: "open", known, skilled: true } : null;
  }
  if (dest.id === hub.id) return { destId: hub.id, routed: "hub", known: true, skilled: true };
  const known = knowsGate(character, dest, locations);
  const skilled = wayfaringTier(character) >= waygateTierOf(dest);
  return (known && skilled)
    ? { destId: dest.id, routed: "named", known, skilled }
    : { destId: hub.id, routed: "hub", known, skilled };
}

/** CCODE-10. Route a GM-narrated `moveTo` that is a WAYGATE TRANSIT.
 *
 *  The bug this closes: SNG-148 declared its REACHABLE link as "map control + GM offer" and only
 *  ever wired the map control. The GM was told gates exist and may narrate stepping through one —
 *  but its `moveTo` went straight to resolveLocationId → mintTransitLocation with zero waygate
 *  awareness. So "you step through the waygate" and "you arrive at the Center" MINTED two generic
 *  places named "Waygate" and "Center", and the player landed in invented rooms instead of the hub.
 *  (Erik's save: gen-waygate + gen-center, both mintedAs transit.)
 *
 *  Returns { destId, routed, why } when the move is a transit we should own, else null:
 *   - standing at a gate, naming a real gate      → normal routing (named | hub)
 *   - standing at a gate, naming nothing resolvable → the HUB, never a minted place
 *   - not at a gate                                → null (ordinary travel, mint as before)
 *  `resolve` is the app's resolveLocationId, injected so this module stays transport-free. */
export function routeGmMoveTo({ character, moveRef, locations, resolve }) {
  const origin = locations?.[character?.currentLocationId];
  if (!isWaygate(origin)) return null;                 // not at a gate — nothing to claim
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const ref = String(moveRef || "").trim();
  if (!ref) return null;

  const directId = resolve ? resolve(ref, locations) : (locations[ref] ? ref : null);
  // ⛔ SNG-663 §2b — A GATE TOWN NAMED BY THE GM IS ITS YARD. The block below tells the model to name where the
  // character COMES OUT, and the honest answer for a moved town is the town: "you step through and arrive at
  // Bedrock". Without this line that is a non-gate place, and the leg falls through to an overland walk.
  if (directId && gateYardOf(locations[directId], locations)) {
    const moved = resolveWaygateTransit({ character, destId: directId, locations });
    return moved ? { ...moved, why: "gate-to-yard" } : null;
  }
  if (directId && locations[directId] && !isWaygate(locations[directId])) return null; // a real non-gate place: ordinary travel

  if (directId && isWaygate(locations[directId])) {
    const t = resolveWaygateTransit({ character, destId: directId, locations });
    return t ? { ...t, why: "gate-to-gate" } : null;
  }
  // SNG-190 §1.1/§1.2: an UNRESOLVABLE destination is NOT evidence the fiction used the gate. Standing
  // in a gate-town is not stepping through the cairn, and an unresolvable ref (a garden latch, a
  // sub-place, a typo) must FAIL CLOSED — never routed to the hub across the world. Returning null
  // hands it back to the caller, which resolves a sub-place to its parent, mints an adjacent place, or
  // stays put. The router now only CLAIMS a move whose destination is a real GATE it can aim at — the
  // only honest evidence a gate was used. The fail-OPEN branch this replaces sent Erik to The Crossing
  // for lifting his mother's garden latch, because Cairnhold happens to contain a gate.
  return null;
}

/** GM context row (§23 REGISTERED link): only when the character STANDS AT a
 *  gate — a compact door the GM may offer in fiction, never a menu. Null
 *  elsewhere (no per-turn spam for a rare capability). */
/** ⛔ WHAT THE CHARACTER ALREADY KNOWS ABOUT THEIR OWN WORLD — for the ASK channel, where players ask how to get
 *  somewhere. ⚠️ NOT for the turn: smoke 148 rules that the waygate block appears only when STANDING at a gate, so
 *  that no turn carries a gate paragraph it did not need. This is the other half of that ruling — a question deserves
 *  the fact, and with none the GM invented lore that contradicted the world and closed a player's goal (Erik).
 *  ⚑ SHORT, and never an offer: it states that the gates ARE a network, names the hub, and says where the nearest
 *  gate they know is. PURE. */
export function waygateTruthForGM(character, locations) {
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const net = Object.values(locations || {}).filter(isNetworkGate);
  if (!net.length) return null;
  const hubName = gateLabel(hub, locations);   // ⛑ SNG-663 §2b: the hub's yard is a PART of the Crossing — canon stays canon
  const theHub = /^the\s/i.test(hubName) ? hubName : `the ${hubName}`;   // "The Crossing" carries its own article
  const origin = locations?.[character?.currentLocationId] || null;
  const atGate = isWaygate(origin);
  const known = knownWaygates(character, locations).filter(l => l.id !== origin?.id);
  const near = known.map(l => ({ l, d: walkingDays(origin, l) })).filter(x => Number.isFinite(x.d)).sort((a, b) => a.d - b.d)[0];
  return `WAYGATES — what the character already knows about their own world (answer questions from this; never invent past it):`
    + ` They ARE a network, ${net.length} of them, and ${hubName} is its HUB — a gate that cannot aim true still routes there,`
    + ` so ${theHub} is reachable THROUGH the gates and does NOT have to be walked to.`
    + ` ⛔ NEVER tell the character the waygates are isolated landmarks, that they do not connect onward, or that ${theHub} must be reached overland. All three are false.`
    + (atGate ? ` They are standing at one right now (${origin.name}).`
      : near ? ` They are not at a gate this moment; the nearest they know is ${gateLabel(near.l, locations)}, ${walkPhrase(near.d)}.`
      : ` They are not at a gate this moment and know of none nearby yet.`)
    + ` If they want to reach a gate or travel through one, say so plainly and let the journey carry them — that is a direction, not a refusal.`;
}

export function waygateBlockForGM(character, locations, rules = {}) {
  const origin = locations?.[character?.currentLocationId];
  if (!isWaygate(origin)) return null;
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const tier = wayfaringTier(character);
  const hubLabel = gateLabel(hub, locations);
  const canAim = knownWaygates(character, locations)
    .filter(l => l.id !== origin.id && (l.id === hub.id || tier >= waygateTierOf(l)));
  // ⚠️ THE LIST STAYS BARE NAMES, because the instruction below says the moveTo must name one of them and a
  // parenthetical in that list is a parenthetical in the moveTo. Where they STAND is a separate sentence.
  const aimable = canAim.map(l => l.name);
  const yardsAimable = canAim.filter(l => isGateYard(l))
    .map(l => `${l.name} outside ${locations[l.gateYardFor]?.name || l.gateYardFor}`);
  // SNG-243 §4: if the character stands at a NETWORK gate, the committed connections + default are canon — the
  // GM reads them instead of improvising where the gate goes. A networkCapable gate reaches the whole network.
  const net = isNetworkGate(origin);
  const defaultName = origin.waygateDefaultTo ? (locations?.[gateArrivalFor(origin.waygateDefaultTo, locations).at]?.name || null) : null;
  const netLine = net
    ? `This is a NETWORK gate — from it the character can fold directly to any gate they know across the network (hub-and-spoke), not only the hub. ` +
      (defaultName ? `Its DEFAULT endpoint, if they step through without naming a destination, is ${defaultName}. ` : "")
    : "";
  // ⛑ SNG-663 §2b — AND STANDING IN A YARD IS STANDING OUTSIDE THE TOWN, which is the whole point of a yard:
  // nothing arrives in a market square, and whoever comes through has the walk in still to make.
  const yardTown = townOfGateYard(origin, locations);
  const yardLine = yardTown
    ? `⚑ This gate stands in ${origin.name}, the gate yard OUTSIDE ${yardTown.name} — the town itself is ${walkPhrase(walkingDays(origin, yardTown) || 0)}. Whoever comes through arrives HERE, outside the walls, and has to walk in. `
    : "";
  const yardsLine = yardsAimable.length ? `⚑ Some of those are gate YARDS and stand outside their towns: ${yardsAimable.join(", ")}. ` : "";
  return `WAYGATE: the character stands at ${origin.name}, a living waygate. Transit is real travel (hours pass). ` +
    yardLine +
    netLine +
    (aimable.length
      ? `Gates they can aim true at: ${aimable.join(", ")}. ${yardsLine}Anywhere else through the gate lands at ${hubLabel} — the hub; that is routing, not failure. `
      : `They cannot yet aim at a distant gate (undiscovered, or beyond their wayfaring) — the gate will carry them to ${hubLabel}, the hub. `) +
    // ⛔ CCODE-418: a wayfarer good enough aims a network gate at any place they know — the GM is told, or it will refuse what the engine allows
    (net && aimsOpen(character, rules).ok
      ? `⚑ They are wayfarer enough to AIM THIS GATE OPEN — straight to any place they know, not only to a gate. If they step through aimed at a place, your "moveTo" names that place. `
      : "") +
    `You MAY surface the gate as a door woven into the fiction when travel is on the character's mind — never as a menu, never every beat. ` +
    `⛔ IF THE CHARACTER STEPS THROUGH, your "moveTo" MUST NAME THE DESTINATION GATE — one of the gates listed above${defaultName ? `, ${defaultName} (the default)` : ""}, or ${hub.name}. ` +
    `Never emit a moveTo of "the waygate", "the gate", "the centre" or any other generic word for the transit itself: those are not places, and naming one lands the character in a room that does not exist. Name where they COME OUT.`;
}
