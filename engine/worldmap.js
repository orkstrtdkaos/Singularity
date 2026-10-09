// worldmap.js — the map's pure geometry, headless-testable: no DOM, no rng.
//   • the three tiers' node lists (`worldTierNodes`, `regionTierNodes`, `locationTierNodes`) and what is KNOWN
//     (`isPlaceKnown`; `knownOverlay` — people met and threads heard of, placed at their homes);
//   • world positions and distances (`worldPosForGenerated`, `geodesic`, `walkingDays`, `milesFor`, the bearings);
//   • label and card placement (`placeLabels`, `openingFrame`, `placeCardBox`) and the paths a journey draws.
// ✅ SNG-678 (CCODE-647): the SVG diagram this file was written for (SNG-046) is retired — its auto-positioning,
// hull, tint, icon and field-wash helpers went with it. ✅ AEVI, ruling 4 (CCODE-656): the layout coordinate the
// diagram drew from is retired too — nothing mints one, nothing reads one; a place is where its `worldPos` says.
// The field leaves the authored records, and the schema, with her commit.

/** Stable integer hash of a string (deterministic — same id always lands the same place). */
function hashN(s) { let h = 0; for (const ch of String(s || "")) h = ((h << 5) - h + ch.charCodeAt(0)) | 0; return Math.abs(h); }

// ---------- SNG-154 stage 6: THREE TIERS ----------
// Zoom is NAVIGATION BETWEEN TIERS, not a scale slider. 95 locations on one 800×440 canvas is the
// unreadable map Erik screenshotted; each tier answers one question at the scale that question
// lives at. The LOCATION tier is the one that never existed — and it is where every place bug has
// been hiding, because containment had nowhere to be drawn.

/** WORLD — regions as territories. The question is "which Reach am I in", so individual
 *  settlements are noise here. Waygates surface because they are how you cross the world. */
export function worldTierNodes(CONTENT, character) {
  const locs = Object.values(CONTENT?.locations || {});
  const byRegion = new Map();
  for (const l of locs) {
    const rid = l.regionId || l.region;
    if (!rid) continue;
    const e = byRegion.get(rid) || { regionId: rid, count: 0, gates: [], here: false };
    e.count++;
    if (l.waygate) e.gates.push({ id: l.id, name: l.name, hub: !!l.waygateHub });
    if (l.id === character?.currentLocationId) e.here = true;
    byRegion.set(rid, e);
  }
  const meta = Object.fromEntries((CONTENT?.regions || []).map(r => [r.regionId, r]));
  return [...byRegion.values()].map(e => ({
    ...e,
    name: meta[e.regionId]?.name || String(e.regionId).replace(/_/g, " "),
    palette: meta[e.regionId]?.palette || {},
    known: locs.some(l => (l.regionId || l.region) === e.regionId && (character?.placeMemory?.[l.id]?.visits || 0) > 0)
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/** REGION — the settlements and points of interest inside ONE region. This is today's map, finally
 *  scoped: the same drawing, showing the places that are actually near each other. */
export function regionTierNodes(CONTENT, character, regionId) {
  // SNG-221 render-fix: a gen location that has been PROMOTED into a canonical file (its play-state migrated,
  // `supersededBy` stamped + an id bridge in `character.locationAliases`) must NOT draw as its own node — the
  // canonical twin now owns the place. The reconcile leaves both signals; the render path is the last consumer
  // that hadn't read them, so a promoted stub kept drawing as a duplicate. Drop it here (the record stays in
  // CONTENT.locations so any lingering id ref still resolves — this hides the node, it doesn't delete the data).
  const aliased = character?.locationAliases || {};
  const inRegion = Object.values(CONTENT?.locations || {})
    .filter(l => (l.regionId || l.region) === regionId)
    .filter(l => !l.supersededBy && !aliased[l.id]);
  // CCODE-15 nesting: a SUB-LOCATION (its parentId points at another place shown IN THIS region) belongs
  // nested under its parent at the interior tier, not as a top-level peer node. This is what makes the
  // reparent lever honest — reparenting a stray stub under its true parent actually removes it from the
  // region map. (No canonical valley loc has an in-region parent, so this only nests gen sub-places — e.g.
  // Silas's Ent Grove once reparented under the crossroads; travel/edges still reach it via the parent.)
  const regionIds = new Set(inRegion.map(l => l.id));
  const locs = inRegion.filter(l => { const pid = l.parentId || l.containerId; return !(pid && regionIds.has(pid)); });
  const ids = new Set(locs.map(l => l.id));
  const edges = [];
  const seen = new Set();
  for (const l of locs) for (const c of l.connections || []) {
    if (!ids.has(c)) continue;                       // an edge leaving the region belongs to the world tier
    const key = [l.id, c].sort().join("~");
    if (!seen.has(key)) { seen.add(key); edges.push([l.id, c]); }
  }
  return { locations: locs, edges };
}

/** LOCATION — the interior. Millbrook → the Edge District → the Low Lamp Inn → the back booth.
 *  THIS TIER DID NOT EXIST, which is why containment bugs had nowhere to become visible. Built on
 *  SNG-154's parentId: sub-places of this place, plus any LOCATION promoted out of it (a sub-place
 *  the fiction grew into a place of its own still belongs inside its container). */
export function locationTierNodes(character, CONTENT, locationId) {
  const pm = character?.placeMemory?.[locationId] || {};
  const subs = Object.entries(pm.subPlaces || {}).map(([slug, sp]) => ({
    id: slug, name: sp.name || slug, kind: "subplace",
    visited: !!sp.visited, note: sp.note || "", parentId: sp.parentId || locationId
  }));
  // places promoted OUT of here keep their containment (SNG-154) — draw them as interiors too
  // ✅ …BUT NOT ONE THAT HAS BEEN SUPERSEDED (Aevi's 09-29 tail item 9). ⛔ A gen location PROMOTED into a canonical
  // file keeps `supersededBy` plus an id bridge in `character.locationAliases`, and the canonical twin now owns the
  // place. The world tier and the region tier were both taught that; THIS tier was not, so Silas's second Stillwater's
  // Trouble went on drawing as a child under `gen-ashwarden-march-road` after the other two had stopped showing it.
  // ⚠️ Three readers of one rule and only two of them told. The record stays in place so any lingering id still
  // resolves — this hides the node, it does not delete the data, exactly as the other two tiers do it.
  const aliasedL = character?.locationAliases || {};
  const promoted = [];
  for (const recs of Object.values(character?.generated || {})) {
    for (const r of Object.values(recs || {})) {
      if (r?.parentId === locationId && r?._gen?.type === "location") {
        if (r.supersededBy || aliasedL[r.id]) continue;
        promoted.push({ id: r.id, name: r.name, kind: "location", visited: true, note: "", parentId: locationId, promoted: true });
      }
    }
  }
  const host = CONTENT?.locations?.[locationId] || null;
  return { host, children: [...promoted, ...subs] };
}


/** SNG-117: a place is KNOWN — its name surfaces + it becomes a travel target — by ANY means, not just by
 *  having been visited: you are there, you have visited, it is ADJACENT to where you stand (one travel away),
 *  or the fiction named it (GM destination / en-route / rumour — tracked on character.knownPlaces). "Known"
 *  is wider than "visited"; only the genuinely unheard-of stays a "?". Pure. */
export function isPlaceKnown(character, locId, locations = {}) {
  if (!locId || !character) return false;
  if (locId === character.currentLocationId) return true;
  if ((character.placeMemory?.[locId]?.visits || 0) > 0) return true;
  if ((character.knownPlaces || []).includes(locId)) return true;
  const here = locations[character.currentLocationId];
  if (here && Array.isArray(here.connections) && here.connections.includes(locId)) return true; // adjacent — one travel away
  return false;
}

/** SNG-083: "show what you know" — people AND rumours on the map, in the same grammar the map uses
 *  for places: SOLID = met/known firsthand, DIMMED = heard-of only (from the codex, active quest
 *  threads, news, and the away-digest). Turns the map from a travel tool into an intelligence board.
 *  Returns a flat list of { kind:'person'|'rumour', label, x, y, discovered, locationId, topicId?, note? }. */
export function knownOverlay(character, positions, content = {}) {
  const npcs = content.npcs || {}, locations = content.locations || {};
  const registry = character?.npcRegistry || {};
  const topics = character?.codex?.topics || {};
  const out = [];
  const countAt = {};
  const fan = (locId) => { const n = countAt[locId] = (countAt[locId] || 0) + 1; const ang = (n * 55 + (hashN(locId) % 40)) * Math.PI / 180; const p = positions[locId]; return { x: p.x + Math.cos(ang) * 26, y: p.y + Math.sin(ang) * 26 }; };
  const seen = new Set();
  // 1. people the codex knows — met (in the registry) SOLID, heard-of DIMMED
  for (const t of Object.values(topics)) {
    if (t.kind !== "person" || !t.entityId) continue;
    const npc = npcs[t.entityId] || registry[t.entityId];
    const homeId = npc?.homeLocation;
    if (!homeId || !positions[homeId] || seen.has(t.entityId)) continue;
    seen.add(t.entityId);
    out.push({ kind: "person", label: t.label || t.entityId, topicId: t.id || t.entityId, ...fan(homeId), discovered: !!registry[t.entityId], locationId: homeId });
  }
  // 2. LIVE THREADS — active-quest givers, at their home (or their quest's region). Heard-of.
  for (const q of (character.quests || [])) {
    if (q.status && !["active", "available"].includes(q.status)) continue;
    const giver = q.giver; if (!giver || seen.has(giver)) continue;
    const npc = npcs[giver];
    const homeId = npc?.homeLocation || (q.region && Object.values(locations).find(l => (l.regionId || l.region) === q.region)?.id);
    if (!homeId || !positions[homeId]) continue;
    seen.add(giver);
    out.push({ kind: "rumour", label: (npc?.name || giver) + (q.title ? ` · ${q.title}` : ""), ...fan(homeId), discovered: !!registry[giver], locationId: homeId, note: q.stakes || q.premise || null });
  }
  // 3. NEWS / FACTS / away-digest that NAME a known place → a dimmed rumour sitting where it lives
  const locByName = Object.values(locations).map(l => ({ id: l.id, n: (l.name || "").toLowerCase() })).filter(x => x.n.length > 3);
  const scan = text => { const lc = String(text || "").toLowerCase(); const hit = locByName.find(x => lc.includes(x.n)); return hit?.id || null; };
  const items = [...(character.worldState?.news || []).map(x => x?.text || x), ...(character.establishedFacts || []).map(f => f?.text)].filter(Boolean);
  for (const text of items.slice(-14)) {
    const locId = scan(text);
    if (!locId || !positions[locId] || (countAt[locId] || 0) >= 4) continue;
    out.push({ kind: "rumour", label: String(text).slice(0, 38) + (text.length > 38 ? "…" : ""), ...fan(locId), discovered: false, locationId: locId, note: String(text).slice(0, 160) });
  }
  return out;
}

// ---------- SNG-180: THE WORLD IS A SPHERE ----------
// Canon says "a great circle with uniform antipodal topology", and a great circle is a SPHERICAL
// term — a geodesic on a sphere. Both Aevi and I had read it as a disc for months.
//
// The property that decides it, and it is not aesthetic: on a DISC, cutting through the centre is
// 2r against πr around, so the hub is a degenerate shortcut every optimal route wants to abuse. On a
// SPHERE the antipodal trip is πR either way — routing via the Crossing costs EXACTLY NOTHING. A
// natural waypoint that is not a cheat is not something you can arrange by hand; the tier-1 waygate,
// the Council and the Coliseum all sitting there stops being worldbuilding and becomes a consequence.
//
// Erik's ruling 3: world positions are AUTHORED, not derived. Deriving position from disposition is
// what forbids bastions — a Seraphic city in ordinary country is out of place ON PURPOSE.
//   longitude   — which disposition's quarter of the world
//   colatitude  — 0 at the Crossing (all axes balanced) to 90 at a pole locus (one axis at full)
//   depth       — southern latitude in effect: the Deep Works and the Unlit Deep run DOWN

/** The unit-sphere position of a location. Null when it has not been placed in the world. Pure. */
export function worldVector(loc) {
  const w = loc?.worldPos;
  if (!w || typeof w.colatitude !== "number" || typeof w.longitude !== "number") return null;
  const theta = (w.colatitude * Math.PI) / 180;      // 0 at the hub
  const phi = (w.longitude * Math.PI) / 180;
  return { x: Math.sin(theta) * Math.cos(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(theta), depth: Number(w.depth) || 0 };
}

/** ⛔ DAYS PER RADIUS — canon's "about 300 days pole-to-rim across 180°", which is 300/π per radian.
 *  ONE DEFINITION: `walkingDays` and `carriage.js` each spelled it inline, and a distance constant with
 *  two copies is the thing `scripts/map_convergence_check.mjs` assertion 4 exists to forbid. */
export const DAYS_PER_RADIUS = 300 / Math.PI;

/** ⛔ CCODE-471 — HOW MUCH A DESCENT COSTS, and it is TWO rules because there are two kinds of down.
 *  ⚠️ Erik, on the Regulator Chamber under the Null Stone: "in the story, the chamber below wasn't 4.8
 *  days below… it was after a long circular stone stair descent. we need to be able to have sites go
 *  below ground like this without it requiring us to travel to another settlement."
 *  ⛔ HE IS DESCRIBING A DEFECT THIS FUNCTION'S OWN COMMENT ALREADY WARNED ABOUT: "treating it as such
 *  would make a cellar as far away as a county" — and then `Math.hypot(surface, levels × 0.05)` did
 *  exactly that. Measured across all 10,153 placed pairs, the composition gets it BACKWARDS at both ends:
 *    · the Unlit Deep is 151.7 surface days from the Crossing and five levels down — depth adds 1.9 days,
 *      because a small leg beside a large one vanishes under hypot. The deep is not far because it is deep.
 *    · the Regulator Chamber is 0.00 surface days from the Null Stone it sits under — depth adds 4.77,
 *      which was its ENTIRE distance, and a stair became a week's journey.
 *  ⛑ So: WHEN THE TWO PLACES ARE THE SAME SPOT ON THE SURFACE, the thing between them is the descent and
 *  nothing else, and it is charged as a descent — ADDED as a leg you actually walk, not composed as a
 *  perpendicular displacement. When they are not, the surface arc is already carrying the journey and the
 *  old layer charge stands untouched. ⚠️ "The same spot" is deliberately THE DAY — the very threshold that
 *  makes a place a `site` of its parent (SNG-398) — so there is one idea of "in this place", not two. */
export const DESCENT_DAYS_PER_LEVEL = 0.15;   // a long circular stone stair: down and back inside a day's work
export const DESCENT_SAME_SPOT_DAYS = 1;      // SNG-398's day — if it is a site of here, the way down is a stair
export const DEPTH_RADII_PER_LEVEL = 0.05;    // a journey BETWEEN world layers, unchanged from SNG-398

/** Great-circle (geodesic) distance between two placed locations, in RADII. Null if either is
 *  unplaced — a missing position is reported, never guessed at, because a wrong distance is worse
 *  than a known-missing one and everything downstream already tolerates null.
 *
 *  DEPTH is composed as a separate leg rather than bent into the surface arc: going down is not
 *  travel across the world, and treating it as such would make a cellar as far away as a county.
 *  ⛑ CCODE-471 made that sentence true — see DESCENT_DAYS_PER_LEVEL above for what it used to do. */
export function geodesic(a, b, { depthScale = DEPTH_RADII_PER_LEVEL,
                                 descentDays = DESCENT_DAYS_PER_LEVEL,
                                 sameSpotDays = DESCENT_SAME_SPOT_DAYS } = {}) {
  const va = worldVector(a), vb = worldVector(b);
  if (!va || !vb) return null;
  const dot = Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y + va.z * vb.z));
  const surface = Math.acos(dot);                                  // radians = radii on a unit sphere
  const levels = Math.abs(va.depth - vb.depth);
  if (levels === 0) return surface;
  // ⛔ A STAIR, NOT A JOURNEY BETWEEN LAYERS. Standing on top of it, the only thing between you is the way down.
  if (surface * DAYS_PER_RADIUS <= sameSpotDays) return surface + (levels * descentDays) / DAYS_PER_RADIUS;
  return Math.hypot(surface, levels * depthScale);
}

/** ⛔ A PLACE MADE IN PLAY MUST STILL BE SOMEWHERE. Fourteen generated locations on Erik's save carry no
 *  `worldPos` — including the Whistling Woman Post, which he is standing in and holds — so `geodesic`
 *  returns null for them and every distance, bearing and route is unreachable. ⚠️ `geodesic`'s null is the
 *  RIGHT answer to a missing position; this supplies the position instead of teaching it to guess.
 *
 *  ⚑ DERIVED FROM THE PLACE IT WAS MADE OFF. ✅ AEVI, M1 (CCODE-710): *"In `worldPosForGenerated`, prefer `parentId` and fall back
 *  to `connections[0]`. … A site's parent is where it IS; its first connection is only where a road goes."* So each hop goes up
 *  `parentId` when the parent is known, and along `connections[0]` otherwise. ⛑ A place reached only through parents is INSIDE its
 *  placed ancestor and stands at its coordinates — the born-whole rule (G0, `borncontract.finishLocation`): *"a room is at its
 *  building's coordinates"*. A place reached along a road is a day off it, as below. The chain is walked because a generated place
 *  can hang off another generated place (the post off the gate clearing off the plateau edge).
 *
 *  ⚠️ THE OFFSET IS DETERMINISTIC, FROM THE ID. The same place lands in the same spot every time — a
 *  position that moved between loads would make a route flicker — and two children of one parent do not
 *  stack on each other.
 *
 *  ⛔ AND IT IS SMALL BY DESIGN: `nearbyDays` (default 1) is how far a place found off another one sits. A
 *  clearing off a road, a post by a gate, a shop in a town are all within a day's walk, and inventing a
 *  larger number would put a hold somewhere the fiction never said it was. Returns null when no ancestor is
 *  placed — a chain that reaches nothing is still honestly unplaced. PURE. */
export function worldPosForGenerated(id, lookup, { nearbyDays = 1, maxHops = 8 } = {}) {
  const get = typeof lookup === "function" ? lookup : ((k) => lookup?.[k]);
  const seen = new Set();
  let cur = get(id), hops = 0;
  // ⛔ A PLACE THAT IS ALREADY SOMEWHERE IS NOT MOVED. The walk-up below stops at the first PLACED node, and
  // that node can be the one asked about — measured, it returned a position 1.000 days from itself. ⚑ The
  // offset is for a place with NO position; applied to one that has a position it invents a move, and
  // authored geography would drift a day every time a caller forgot to check first. `derivedFrom` is null
  // because nothing was derived: this position is the world's own.
  if (cur?.worldPos && Number.isFinite(Number(cur.worldPos.colatitude))) return { ...cur.worldPos, derivedFrom: null };
  let byRoad = false;
  while (cur && hops++ < maxHops) {
    if (cur.worldPos && Number.isFinite(Number(cur.worldPos.colatitude))) break;
    // ⛔ M1: the parent first — only a parent nothing knows falls back to the road
    const up = cur.parentId && !seen.has(cur.parentId) && get(cur.parentId) ? cur.parentId : null;
    const next = up || (cur.connections || [])[0];
    if (!next || seen.has(next)) return null;   // no parent, or a cycle
    if (!up) byRoad = true;
    seen.add(next);
    cur = get(next);
  }
  const base = cur?.worldPos;
  if (!base || !Number.isFinite(Number(base.colatitude))) return null;
  // ⛑ inside, all the way up: at the placed ancestor's own point (a room is at its building's coordinates)
  if (!byRoad) return { colatitude: Number(base.colatitude), longitude: Number(base.longitude), depth: Number(base.depth) || 0, derivedFrom: cur.id || null, inside: true };
  // a stable hash of the id → an angle and a sign, so the offset is reproducible and spread out
  let h = 2166136261;
  for (let i = 0; i < String(id).length; i++) { h ^= String(id).charCodeAt(i); h = Math.imul(h, 16777619); }
  const angle = ((h >>> 0) % 3600) / 3600 * Math.PI * 2;
  const radians = Math.max(0, Number(nearbyDays)) * (Math.PI / 300);   // the inverse of walkingDays' scale
  // ⛔ THE POLE IS NOT A WALL, AND A FLAT OFFSET DIES AT IT. The Crossing sits at colatitude 0 — it IS the
  // hub pole — so half the offset angles went negative, clamped back to 0, and both places made off the
  // Crossing landed EXACTLY on it: 0.00 days away, measured. ⚠️ A clamp that eats the offset silently makes
  // two places one place, and a route between them would be free.
  // ⚑ SO WALK THE SPHERE PROPERLY: the great-circle destination from a point, a bearing and a distance. It
  // needs no pole case (going past a pole comes out the far side, which is what walking does) and no
  // convergence correction, and the offset is EXACTLY `nearbyDays` by construction rather than nearly.
  const lat0 = (90 - Number(base.colatitude)) * Math.PI / 180;
  const lon0 = Number(base.longitude) * Math.PI / 180;
  let colat, lon;
  if (Math.abs(Math.cos(lat0)) < 1e-9) {
    // ⛔ ON A POLE THE BEARING VANISHES FROM THE FORMULA. cos(lat0) is 0 there, zeroing the longitude term,
    // so every child of the Crossing came out at ONE point: the made gate and the temple measured 0.000 days
    // apart while each sat exactly 1 day from the hub. ⚑ Longitude is undefined ON a pole, so the bearing you
    // leave by IS the longitude you arrive at — exact, not an epsilon nudge away from the singularity.
    // ⚠️ The Crossing is colatitude 0. This is the hub, not an edge case.
    colat = lat0 > 0 ? (radians * 180 / Math.PI) : (180 - radians * 180 / Math.PI);
    lon = angle * 180 / Math.PI;
  } else {
    const lat1 = Math.asin(Math.min(1, Math.max(-1,
      Math.sin(lat0) * Math.cos(radians) + Math.cos(lat0) * Math.sin(radians) * Math.cos(angle))));
    const lon1 = lon0 + Math.atan2(
      Math.sin(angle) * Math.sin(radians) * Math.cos(lat0),
      Math.cos(radians) - Math.sin(lat0) * Math.sin(lat1));
    colat = 90 - (lat1 * 180 / Math.PI);
    lon = lon1 * 180 / Math.PI;
  }
  return {
    colatitude: Math.max(0, Math.min(180, Math.round(colat * 1000) / 1000)),
    longitude: ((Math.round(lon * 1000) / 1000) % 360 + 360) % 360,
    depth: Number(base.depth) || 0,
    derivedFrom: cur.id || null,
  };
}

/** ⚑ AEVI'S FOUR WORDS, AND THEY ARE BETTER THAN NORTH (SNG-386). Her ruling: *"Colatitude is distance from
 *  the Crossing. Longitude is which disposition's quarter you are in. So the two natural directions are
 *  hubward / outward and spinward / widdershins."* ⛔ `hubward` means toward the Crossing, which means toward
 *  BALANCE; `outward` means toward a pole, which means toward commitment — **the compass and the disposition
 *  are the same axis**, so a player who learns "we are going outward" has learned something true about where
 *  they are going and not only which way.
 *
 *  ⚠️ THE VOCABULARY IS HERS. Her spec says so in as many words — *"do not invent words for it; the four
 *  above are the canon"* — and these four are the only strings this returns.
 *
 *  ⛔ IT IS PER-AXIS, NOT A GREAT-CIRCLE BEARING, and her own measurements are what settle that: two of her
 *  four rows run TO the Crossing, which sits at colatitude 0 where longitude is undefined and a true bearing
 *  has no lateral component at all — yet she reads a spin word on both. Her model compares the two
 *  coordinates, because in this world they mean two different things rather than two components of one
 *  heading.
 *
 *  ⚑ THE LATERAL AXIS IS MEASURED IN GROUND, NOT DEGREES. A degree of longitude near the hub is almost no
 *  walking, so a raw degree threshold would call a step past the Crossing a great lateral journey. Scaling
 *  by sin(colatitude) makes "alongside" mean the same amount of walking everywhere in the world.
 *
 *  ⚠️ AND THE THRESHOLD IS A SHARE OF THE JOURNEY, NOT A FIXED DISTANCE, so it reads the same on a two-day
 *  errand and a hundred-day crossing. An axis is named only if it carries `minShare` of the whole. ⛑ 0.25 is
 *  MEASURED, not chosen: across all 135 placed locations it names both axes on 47.9% of pairs and exactly one
 *  — Aevi's *"alongside"* — on 51.8%, with 0% naming neither. She asked for thresholds *"tuned so alongside
 *  is a real answer"*, and an even split is that answer. All four of her authored rows reproduce anywhere
 *  from 0.15 to 0.35, so they do not pin it; the distribution does.
 *
 *  Returns null when either end is unplaced — the same honest null `geodesic` gives. PURE. */
export function bearingBetween(a, b, { minShare = 0.25, restDays = 0.5 } = {}) {
  const pa = a?.worldPos || a, pb = b?.worldPos || b;
  if (!pa || !pb) return null;
  const ac = Number(pa.colatitude), bc = Number(pb.colatitude);
  const al = Number(pa.longitude), bl = Number(pb.longitude);
  if (![ac, bc, al, bl].every(Number.isFinite)) return null;

  const perDegree = 300 / 180;                       // the inverse of walkingDays' scale, in days per degree
  let dLon = bl - al;
  dLon = ((dLon % 360) + 540) % 360 - 180;           // the SHORT way round, so 350° east is 10° widdershins
  const hubDays = (bc - ac) * perDegree;             // negative is toward the Crossing
  const spinDays = dLon * perDegree * Math.sin(((ac + bc) / 2) * Math.PI / 180);
  const mag = Math.hypot(hubDays, spinDays);

  // ⛑ "YOU ARE ALREADY THERE" IS A REAL ANSWER TOO, and it is not the same as having no direction: a share
  // test on a journey of nearly no length would name an axis off pure floating-point noise.
  if (!(mag > restDays)) return { radial: null, lateral: null, phrase: null, hubDays, spinDays, days: mag };

  const radial = Math.abs(hubDays) >= minShare * mag ? (hubDays < 0 ? "hubward" : "outward") : null;
  const lateral = Math.abs(spinDays) >= minShare * mag ? (spinDays > 0 ? "spinward" : "widdershins") : null;
  return {
    radial, lateral,
    // ⚑ JOINED THE WAY SHE WROTE THEM — "hubward and spinward", "outward" — so the GM can say the sentence
    // without composing it, which is the whole reason SNG-331 called this the cheapest high-value item.
    phrase: [radial, lateral].filter(Boolean).join(" and ") || null,
    hubDays, spinDays, days: mag,
  };
}

/** ⚑ SNG-386 §4.3 — SO THE GM CAN SAY IT WITHOUT INVENTING IT. Aevi: *"`ctx.location.bearingsToKnown` so
 *  the GM can say 'the road runs outward from here' without inventing it — which is the whole reason
 *  SNG-331 flagged this as the cheapest high-value item."*
 *
 *  ⛔ ONLY PLACES THE CHARACTER KNOWS. A bearing to somewhere they have never heard of is a leak, not a
 *  fact — it would let the GM point confidently at a place the player has no business knowing exists.
 *  `isKnown` is the same predicate the map and the recall block already use.
 *
 *  ⚠️ THE DISTANCE IS `walkingDays`, NOT the bearing's own magnitude. The bearing's `days` is the size of
 *  its two axis components, which is a fair thing to threshold on and the WRONG thing to tell a player:
 *  what they want to know is how long the walk is. Nearest first, because that is the order a road
 *  actually offers them. PURE. */
export function bearingsToKnown(from, locations = {}, { isKnown = null, limit = 8 } = {}) {
  const here = (typeof from === "string") ? locations[from] : from;
  if (!here?.worldPos) return [];
  const rows = [];
  for (const l of Object.values(locations || {})) {
    if (!l || !l.id || l.id === here.id || !l.worldPos) continue;
    if (typeof isKnown === "function" && !isKnown(l.id)) continue;
    const b = bearingBetween(here, l);
    if (!b || !b.phrase) continue;                     // 'you are already there' has no direction to give
    const days = walkingDays(here, l);
    if (days == null) continue;
    rows.push({ id: l.id, name: l.name || l.id, phrase: b.phrase, days: Math.round(days * 10) / 10 });
  }
  rows.sort((a, b) => a.days - b.days);
  return rows.slice(0, Math.max(0, limit));
}

/** Geodesic distance in WALKING DAYS, at Erik's year-to-walk scale: antipode-to-antipode (πR) is
 *  300 days, so a radius is 300/π days. Waygates become infrastructure and a pilgrimage to your
 *  antipode is a life event, which is the point. */
/** ⛔ CCODE-416 — A LABEL THAT WOULD LAND ON ANOTHER IS NOT DRAWN, and the one that stays says how many it covers.
 *  The region's ground map draws every place at its real position, and real positions cluster: Millbrook, its store, its
 *  road, the March waygate, the fork, the hollow and the Made Gate all sit within a quarter-day, and their names printed on
 *  top of each other as one unreadable smear. Greedy by `rank` (lower first — where you stand, then gates, then settlements,
 *  then sites), ties in the order given. Each item is a label's box: `x` its centre, `y` its baseline, `w`/`h` its size.
 *  The PLACE is still drawn by the caller; only its name yields. Pure → { shown: Set of ids, hiddenBy: { shownId: n } }. */
/** ⛔ M3 (SNG-675) — THE OPENING FRAME: where the map should be looking when you arrive.
 *
 *  ✅ AEVI: *"Today it opens zoomed to the whole region, so Millbrook's knot of places fills about a fifth of
 *  the frame. The mock opens framed on the known places plus the player's realm, with a margin."*
 *
 *  ⛑ IT RETURNS A VIEW, NOT A PROJECTION. The region's extent is unchanged — this only says which part of the
 *  already-painted map to show, through the same zoom the player can pan afterwards. That matters because the
 *  heavy layers (the road walk, the territory walk, the field grid) are computed in screen space ONCE: making
 *  the projection itself frame differently would recompute all three, while moving the view costs nothing.
 *
 *  ⚠️ AND IT REFUSES RATHER THAN INVENTS. With no points, one point, or points that already fill the frame,
 *  it returns `null` and the caller leaves the view alone — a map of a region the player knows nothing about
 *  should open showing the region, which is the honest answer and today's behaviour.
 *
 *  `pts` are map pixels; `maxK` is the view's own zoom cap, so this can never ask for a zoom the player
 *  cannot then pan out of. */
export function openingFrame(pts = [], W = 0, H = 0, { margin = 0.18, maxK = 4, minSpan = 80 } = {}) {
  const ok = (p) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y));
  const good = (Array.isArray(pts) ? pts : []).filter(ok);
  if (good.length < 2 || !(W > 0) || !(H > 0)) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of good) {
    if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
    if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
  }
  // ⛑ A MARGIN IN THE BOX'S OWN TERMS, with a floor — a knot of places a few pixels across would otherwise
  // ask for a zoom of hundreds, and the floor is what makes "a cluster" and "one place" behave the same way.
  const bw = Math.max(minSpan, (x1 - x0) * (1 + margin * 2));
  const bh = Math.max(minSpan, (y1 - y0) * (1 + margin * 2));
  const k = Math.min(maxK, W / bw, H / bh);
  if (!(k > 1.05)) return null;                     // it already fills the frame; leave the view alone
  return { k, cx: ((x0 + x1) / 2) / W, cy: ((y0 + y1) / 2) / H, box: { x0, y0, x1, y1 } };
}

export function placeLabels(items = [], { pad = 2 } = {}) {
  // ✅ `hiddenInto` IS NEW: hidden id → the id that displaced it. This function has always computed it (`hit.id`)
  // and thrown the pairing away, keeping only the tally — so a caller that places twice could not carry a dropped
  // label's own tally to whoever took its place, and had to guess. A guess there puts "+2" on an arbitrary neighbour.
  const boxes = [], shown = new Set(), hiddenBy = {}, hiddenInto = {};
  const order = items.map((it, i) => ({ it, i })).sort((a, b) => ((a.it.rank ?? 9) - (b.it.rank ?? 9)) || (a.i - b.i));
  for (const { it } of order) {
    const w = Math.max(0, Number(it.w) || 0), h = Math.max(0, Number(it.h) || 0);
    const box = { id: it.id, l: it.x - w / 2 - pad, r: it.x + w / 2 + pad, t: it.y - h - pad, b: it.y + pad };
    const hit = boxes.find(o => box.l < o.r && o.l < box.r && box.t < o.b && o.t < box.b);
    if (hit) { hiddenBy[hit.id] = (hiddenBy[hit.id] || 0) + 1; hiddenInto[it.id] = hit.id; continue; }
    boxes.push(box);
    shown.add(it.id);
  }
  return { shown, hiddenBy, hiddenInto };
}

export function walkingDays(a, b, opts = {}) {
  const d = geodesic(a, b, opts);
  return d == null ? null : d * DAYS_PER_RADIUS;
}

/** ✅ SNG-537 §4 B6a (2026-09-12): `scale.json` — the world's physical size, five constants with no reader since SNG-424 — is READ here:
 *  the miles a walk covers, for the one place the player is shown a distance. `walkingDays` stays on canon 300/π (1° = 5/3 days); the
 *  file's `walkingDaysPerDegree` (1.67) is that number rounded, and `scaleAgrees` is the gate that keeps the two from drifting apart —
 *  a distance changed in one and not the other would move every travel time in the game. A missing or malformed file is a null, never
 *  a crash: days stand on their own. Pure. */
export function milesFor(days, scale) {
  const per = Number(scale?.milesPerWalkingDay);
  return Number.isFinite(days) && days >= 0 && Number.isFinite(per) && per > 0 ? Math.round(days * per) : null;
}
export function scaleAgrees(scale, { tolerance = 0.01 } = {}) {
  const canon = 300 / 180, filed = Number(scale?.walkingDaysPerDegree);
  return Number.isFinite(filed) && Math.abs(filed - canon) / canon <= tolerance;
}

/* ═════ SNG-677 P2 · WHERE THE PLACE CARD GOES, AS ARITHMETIC ═════
 * ✅ AEVI's done-when for P: *"A gate drives it headless: select a place, and assert the card's box lies
 * inside the map's box at both widths."* ⛔ THIS PROJECT HAS NO DOM IN ITS SUITE and no dependencies at all,
 * so "drives it headless" cannot mean a real browser box. It can mean something better: the placement is
 * arithmetic, so it belongs in a function that the painter and the gate both call, and then the gate is
 * measuring the same numbers the browser lays out with rather than a reimplementation of them.
 * ✅ Which is Erik's standing rule — *"app.js and tests call the same functions"* — and the answer to the
 * complaint Aevi made on D1, that a gate checking source text was green while the map was wrong.
 *
 * @param map    {{w,h}} the canvas's laid-out size in CSS pixels
 * @param card   {{w,h}} the card's measured size
 * @param glyph  {{x,y}} the selected glyph in the same frame, or null when it has no mark of its own
 * @returns {{mode, left, top, width, height}} — `left`/`top` relative to the map's top-left
 */
export function placeCardBox(map, card, glyph) {
  const mw = Math.max(1, Number(map?.w) || 0), mh = Math.max(1, Number(map?.h) || 0);
  const PAD = 4, GAP = 18;
  // ⛔ THE SHEET IS DECIDED BY THE MAP'S WIDTH, NOT THE WINDOW'S. A narrow pane on a wide desktop is the
  // case that separates them, and the card has to fit the MAP.
  if (mw <= 640) {
    // ✅ *"about 45% of the map's height"*, pinned to the map's bottom edge — so the selected glyph stays
    // visible above it. ⚠️ A sheet sized against the VIEWPORT instead would cover the glyph it describes
    // on exactly the devices this layout exists for.
    const h = Math.round(mh * 0.45);
    return { mode: "sheet", left: 0, top: mh - h, width: mw, height: h };
  }
  const w = Math.min(Number(card?.w) || 320, mw - PAD * 2);
  const h = Math.min(Number(card?.h) || 220, mh - PAD * 2);
  if (!glyph || !Number.isFinite(Number(glyph.x)) || !Number.isFinite(Number(glyph.y))) {
    // ⛑ no glyph to sit beside: the frame's top-right, out of the way of the cluster it is hiding in.
    return { mode: "popover", left: Math.max(PAD, mw - w - 8), top: 8, width: w, height: h };
  }
  const gx = Number(glyph.x), gy = Number(glyph.y);
  // ✅ *"It flips to whichever side has room and never runs off the canvas."* Right if the whole card fits
  // there, else left if it fits there, else clamped — so the last case is still inside the frame.
  const left = (gx + GAP + w <= mw - PAD) ? gx + GAP
    : (gx - GAP - w >= PAD) ? gx - GAP - w
    : Math.max(PAD, Math.min(mw - w - PAD, gx - w / 2));
  const top = Math.max(PAD, Math.min(mh - h - PAD, gy - h / 2));
  return { mode: "popover", left: Math.round(left), top: Math.round(top), width: w, height: h };
}

/* ═════ SNG-679 H2 · A POINT PART-WAY ALONG A JOURNEY, ON THE SPHERE ═════
 * ✅ AEVI, reading origin: *"A moving hold's position exists but is LINEAR in longitude and colatitude.
 * From longitude 350 to 10 she sails the long way round through 180. Near the Crossing it is the same pole
 * error as the measuring script in CCODE_20261006. `nearestId` (what raids her) inherits it."*
 * ⛔ AND THE CODE CARRIED A DEFENCE OF THE LERP THAT NOBODY HAD MEASURED: *"At this world's scale (1° ≈ 26
 * miles) the two differ by less than a day's sail on any voyage the map allows."* Measured over all 12,403
 * placed pairs, the lerp and the great circle diverge by a MEDIAN of 14.4° (375 miles), a p90 of 122.9°
 * (3,195 miles) and a maximum of 180.0° — the antipode. In 1,286 pairs the error is LARGER THAN THE WHOLE
 * DISTANCE between the two ports. A comment is a claim, and this one was wrong by three orders of magnitude.
 * ⛑ BUILT ON `worldVector`, the same reader `geodesic` uses, so a position and a distance cannot come to
 * disagree about where a point is — which is the whole reason `geodesic` has one definition.
 * ⛑ Depth rides linearly and is NOT bent into the arc, for `geodesic`'s own stated reason: going down is
 * not travel across the world. */
export function worldPosBetween(a, b, f) {
  const va = worldVector(a), vb = worldVector(b);
  if (!va || !vb) return null;
  const k = Math.max(0, Math.min(1, Number(f)));
  let dot = Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y + va.z * vb.z));
  const omega = Math.acos(dot);
  let x, y, z;
  if (omega < 1e-9) { x = va.x; y = va.y; z = va.z; }          // the same point, or near enough
  else if (Math.PI - omega < 1e-9) {
    /* ⛔ ANTIPODAL: every great circle between them is equally short, so there is no "the" arc. Rather than
     * pick one silently, go by way of the pole the two share a meridian with — a definite answer a reader
     * can check, where a normalised zero vector would be a NaN that propagates into `nearestId`. */
    const t2 = k * Math.PI;
    x = va.x * Math.cos(t2); y = va.y * Math.cos(t2); z = Math.cos(t2) * va.z + Math.sin(t2);
  } else {
    const s0 = Math.sin((1 - k) * omega) / Math.sin(omega), s1 = Math.sin(k * omega) / Math.sin(omega);
    x = va.x * s0 + vb.x * s1; y = va.y * s0 + vb.y * s1; z = va.z * s0 + vb.z * s1;
  }
  const n = Math.hypot(x, y, z) || 1;
  x /= n; y /= n; z /= n;
  return {
    colatitude: (Math.acos(Math.max(-1, Math.min(1, z))) * 180) / Math.PI,
    longitude: (Math.atan2(y, x) * 180) / Math.PI,
    depth: va.depth + (vb.depth - va.depth) * k,
  };
}

/* ⛔ AND THE SAME QUESTION ASKED OF A PATH THAT IS ALREADY DRAWN. ✅ Aevi (H2): *"along the ROUTED LINE
 * between `from` and `to` when one exists (`worldRoadRoutes`, CCODE-626) at `fraction` of its length;
 * otherwise a great-circle interpolation."*
 * ⛑ `fraction OF ITS LENGTH`, not of its point count: the router's points are spaced by grid cells, so
 * walking them evenly would move a hull in jerks — fast where the cells are coarse, slow where the route
 * doubles back. Measured by arc length, a half-elapsed voyage is half-way along the road.
 * ⛔ AND THE CONVENTION, WRITTEN DOWN, BECAUSE I GOT IT WRONG HERE FIRST: the path stores LATITUDE and this
 * world stores COLATITUDE, related by `lat = colatitude - 90`. So the inverse is `colatitude = lat + 90`.
 * ⚠️ I wrote `90 - lat`, which is the same confusion that put the Hundred Markets 27° from the Crossing in
 * my own measuring script an hour earlier — and this time it was in code. Caught by driving a real voyage
 * and seeing the path's ENDS not match its two ports: `cloudform` sits at colatitude 88 and the routed line
 * started at 93. ⛑ A sign error of this kind cannot be caught by reading, only by checking the endpoints
 * against the thing they are supposed to be, which the gate below now does.
 * @param path [[lat, lon], …] as `worldRoadRoutes` stores it, or null
 */
export function pointAlongPath(path, f) {
  if (!Array.isArray(path) || path.length < 2) return null;
  const R2 = Math.PI / 180;
  const vec = ([la, lo]) => ({ x: Math.cos(la * R2) * Math.cos(lo * R2), y: Math.cos(la * R2) * Math.sin(lo * R2), z: Math.sin(la * R2) });
  const arc = (p, q) => { const u = vec(p), v = vec(q);
    return Math.acos(Math.max(-1, Math.min(1, u.x * v.x + u.y * v.y + u.z * v.z))); };
  const legs = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) { const d = arc(path[i - 1], path[i]); legs.push(d); total += d; }
  if (!(total > 0)) return { colatitude: path[0][0] + 90, longitude: path[0][1], depth: 0 };
  const want = Math.max(0, Math.min(1, Number(f))) * total;
  let run = 0;
  for (let i = 0; i < legs.length; i++) {
    if (run + legs[i] >= want || i === legs.length - 1) {
      const within = legs[i] > 0 ? (want - run) / legs[i] : 0;
      // ⛑ the leg itself is interpolated on the sphere too, so a long grid cell does not go flat
      const A = { worldPos: { colatitude: path[i][0] + 90, longitude: path[i][1], depth: 0 } };
      const B = { worldPos: { colatitude: path[i + 1][0] + 90, longitude: path[i + 1][1], depth: 0 } };
      return worldPosBetween(A, B, Math.max(0, Math.min(1, within)));
    }
    run += legs[i];
  }
  return null;
}
