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
  const known = new Set(character?.knownPlaces || []);
  return allWaygates(locations).filter(l => known.has(l.id));
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

/** PURE routing. From a gate, aiming at destId:
 *  { destId, routed: "named"|"hub", known, skilled } — or null when the origin
 *  isn't a gate / the network has no hub / no gates exist (standard travel).
 *  Discovery without skill → hub; skill without discovery → hub; both → named.
 *  Aiming at the hub itself is always "hub" (everyone can find the center). */
export function resolveWaygateTransit({ character, destId, locations }) {
  const origin = locations?.[character?.currentLocationId];
  if (!isWaygate(origin)) return null;
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const dest = locations?.[destId];
  if (!isWaygate(dest) || dest.id === origin.id) return null;
  if (dest.id === hub.id) return { destId: hub.id, routed: "hub", known: true, skilled: true };
  const known = (character?.knownPlaces || []).includes(dest.id);
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
export function waygateBlockForGM(character, locations) {
  const origin = locations?.[character?.currentLocationId];
  if (!isWaygate(origin)) return null;
  const hub = hubWaygate(locations);
  if (!hub) return null;
  const tier = wayfaringTier(character);
  const aimable = knownWaygates(character, locations)
    .filter(l => l.id !== origin.id && (l.id === hub.id || tier >= waygateTierOf(l)))
    .map(l => l.name);
  return `WAYGATE: the character stands at ${origin.name}, a living waygate. Transit is real travel (hours pass). ` +
    (aimable.length
      ? `Gates they can aim true at: ${aimable.join(", ")}. Anywhere else through the gate lands at ${hub.name} — the hub; that is routing, not failure. `
      : `They cannot yet aim at a distant gate (undiscovered, or beyond their wayfaring) — the gate will carry them to ${hub.name}, the hub. `) +
    `You MAY surface the gate as a door woven into the fiction when travel is on the character's mind — never as a menu, never every beat. ` +
    `⛔ IF THE CHARACTER STEPS THROUGH, your "moveTo" MUST NAME THE DESTINATION GATE — one of the gates listed above, or ${hub.name}. ` +
    `Never emit a moveTo of "the waygate", "the gate", "the centre" or any other generic word for the transit itself: those are not places, and naming one lands the character in a room that does not exist. Name where they COME OUT.`;
}
