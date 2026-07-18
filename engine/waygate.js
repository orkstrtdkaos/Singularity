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
export function waygateTierOf(loc) { return Math.max(1, Number(loc?.waygateTier) || 1); }

/** The hub gate — the location flagged waygateHub, falling back to the_crossing
 *  if it carries the waygate flag. Null when no hub is authored (network dark). */
export function hubWaygate(locations) {
  const all = Object.values(locations || {});
  return all.find(l => l?.waygateHub && l?.waygate) || (locations?.the_crossing?.waygate ? locations.the_crossing : null) || null;
}

/** All authored gates. */
export function allWaygates(locations) {
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
    `You MAY surface the gate as a door woven into the fiction when travel is on the character's mind — never as a menu, never every beat.`;
}
