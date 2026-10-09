/* ⛔ WHERE A PLACE IS WHEN IT HAS NO POSITION OF ITS OWN — the nearest placed ancestor up `parentId`.
 *
 * ✅ AEVI, M5 (WORKORDER_aevi_20261004_maps_follow_the_story): *"One answer to 'where is this place'. `anchorsOf` uses the same
 * `positionedPlace` climb as sharedholds, so territory and shared holds agree about a hold founded at a minted site."*
 * ⚠️ MEASURED: two readers of one question gave two answers — `positionedPlace` (maps, routing, shared holds) climbed `parentId`
 * to the first placed ancestor; `anchorsOf` (territory) dropped a hold whose own place had no `worldPos`. A hold founded at a
 * fresh site counted on one surface and not the other.
 * ⛑ IMPORTS NOTHING, so `influence.js` — which imports nothing on purpose — can read the same climb without pulling a graph.
 * Eight hops at most, which also ends a cycle. PURE. */
export function placedAncestor(locations, id, { maxHops = 8 } = {}) {
  const placed = (l) => !!l && Number.isFinite(Number(l.worldPos?.colatitude));
  let loc = id ? locations?.[id] || null : null, guard = 0;
  while (loc && !placed(loc) && loc.parentId && guard++ < maxHops) loc = locations?.[loc.parentId] || null;
  return placed(loc) ? loc : null;
}
