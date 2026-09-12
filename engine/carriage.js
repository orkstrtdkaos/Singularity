// engine/carriage.js — THE HOLDING THAT MOVES. Pure over its inputs except the holding it sails; no DOM, no fetch.
//
// ✅ SPEC_mobile_holdings (Aevi 2026-09-08, Round 2 mine 2026-09-09; Erik: "Give CCode what he needs to make holds/enterprises
// mobile — this could be airships or floating cities, or entire groves on the move, a giant sea turtle, etc. A dragon perhaps.")
// Erik 2026-09-12: "I want mobile holdings prioritized fairly high."
//
// ⛔ `mobile: true` IS NOT ENOUGH — Aevi's §2, and it is the whole design. A longship is moved BY ITS CREW; an airship by apparatus,
// with nobody aboard, which is a hazard; a floating city drifts whether you like it or not; a grove walks on its own season; and a
// dragon MOVES BECAUSE IT AGREES TO. Five kinds, one field: `carriage.moves`.
//
// ⚑ `willed` IS THE ONE THAT MATTERS: "A DRAGON THAT CARRIES YOUR HOLDING IS NOT A VEHICLE. IT IS A GARRISON MEMBER WHO IS ALSO THE
// GROUND." `bearerId` points at a person and everything about that person applies — so willingness lives on the BEARER, never on the
// holder, which is the rule `open_threshold` and `death.js` already keep for the dead ("a fact about the dead, not a parameter of the
// craft"). If their standing falls far enough, the holding walks away; that is not a punishment, it is the honest reading of a place
// with opinions. And per Aevi's Q3 the record says `steward: <bearerId>` — a dragon is not property and the schema must not let it
// read as one.
//
// ⛔ IN TRANSIT IS NOT `locationId: null`. `reconcile.js` repairs "a hold that is nowhere" by guessing it a place, so a null would
// TELEPORT THE SHIP TO A SHORE on the next load. A voyage lives in `carriage.voyage` and `locationId` stays at the port she left
// until she arrives — Aevi's "a mobile holding WRITES IT ON ARRIVAL", which makes the safety structural rather than lucky.
//
// ⚠️ THE TERRAIN GATE IS `tags`, MEASURED: all 364 route edges are bare strings and no location carries terrain, water or port as a
// field — terrain lives on the REGION, as prose. `tags` is on 135 of 135 places, so a crewed carriage requires one of the water tags
// the content authors (Keelmouth: harbour · river · shipyard) and a grove wants ground. No new field and no second graph.

import { geodesic } from "./worldmap.js";   // ⛔ Erik 2026-09-12: a hull under way is SOMEWHERE, and the nearest place decides what can reach her
const num = (v, d = null) => (Number.isFinite(Number(v)) ? Number(v) : d);
export const CARRIAGE_KINDS = ["crewed", "powered", "drifting", "living", "willed"];

/** The carriage, normalised, or null when this place does not move. Pure. */
export function carriageOf(holding) {
  const c = holding?.carriage;
  if (!c || typeof c !== "object") return null;
  const moves = String(c.moves || "").toLowerCase();
  if (!CARRIAGE_KINDS.includes(moves)) return null;
  return {
    moves,
    speed: Math.max(0.1, num(c.speed, 1)),
    needsCrew: Math.max(0, num(c.needsCrew, moves === "crewed" ? 1 : 0)),
    bearerId: c.bearerId || null,
    needsTags: Array.isArray(c.needsTags) ? c.needsTags.map(String) : null,
    voyage: c.voyage && typeof c.voyage === "object" ? c.voyage : null,
  };
}

/** Is she at anchor? ⚠️ AEVI'S §4 SAID MOORED IS RAIDABLE AND MOVING IS NOT; ERIK OVERRULED IT (see `voyagePosition`) — a hull
 *  under way is raidable where she is. This is kept because the two states still differ in every other way: a voyage cannot be
 *  sailed again, cannot be built on, and answers a different place. */
export function isMoored(holding) {
  return !carriageOf(holding)?.voyage;
}
/** ⛔ ERIK RULED IT 2026-09-12, OVER THE SPEC: "I would want any moving holds or trade caravans to be raidable from where they
 *  currently are along the route. it doesn't make sense to only update their location at the very end. you can come up with a
 *  simplified way to do this by day."
 *
 *  ⚠️ SO AEVI'S §4 — *"moored is raidable, moving is not"* — IS OVERRULED, and the replacement is better: a hull under way is
 *  somewhere, and where she is decides what can reach her. The simplified way is the day: the fraction of the voyage elapsed puts
 *  her between the two ports, and the nearest known place to that point is the danger she is under. `locationId` still only changes
 *  on arrival (a null would let `reconcile` teleport her to a shore), so this is a DERIVED position and nothing to keep in sync.
 *
 *  ⚑ The interpolation is linear in colatitude and longitude rather than a great circle. At this world's scale (1° ≈ 26 miles) the
 *  two differ by less than a day's sail on any voyage the map allows, and the answer it feeds is "which place is she near", which is
 *  robust to that. Pure. */
export function voyagePosition(holding, { worldDay = null, locations = {} } = {}) {
  const carriage = carriageOf(holding);
  const v = carriage?.voyage;
  if (!v) return null;
  const from = (locations || {})[v.from], to = (locations || {})[v.to];
  const total = Math.max(0.0001, num(v.days, 0));
  const day = num(worldDay, num(v.startedDay, 0));
  const elapsed = Math.max(0, Math.min(total, day - num(v.startedDay, 0)));
  const f = total ? elapsed / total : 1;
  const lerp = (a, b) => a + (b - a) * f;
  const pos = from?.worldPos && to?.worldPos
    ? { colatitude: lerp(Number(from.worldPos.colatitude), Number(to.worldPos.colatitude)), longitude: lerp(Number(from.worldPos.longitude), Number(to.worldPos.longitude)), depth: 0 }
    : null;
  // the nearest known place to where she is — the one whose danger she is under, and the one a player would name
  let nearestId = f < 0.5 ? v.from : v.to, best = Infinity;
  if (pos) for (const [id, loc] of Object.entries(locations || {})) {
    if (!loc?.worldPos || !Number.isFinite(Number(loc.worldPos.colatitude))) continue;
    const d = geodesic({ worldPos: pos }, loc);
    if (d != null && d < best) { best = d; nearestId = id; }
  }
  return { from: v.from, to: v.to, fraction: f, daysOut: elapsed, daysLeft: Math.max(0, total - elapsed), days: total, worldPos: pos, nearestId, nearestDays: best === Infinity ? null : best * (300 / Math.PI) };
}

/** ⛔ WHERE SHE IS FOR EVERYTHING THAT ASKS — the raid, the danger, the region under her. A holding at anchor answers with its own
 *  place, unchanged; one under way answers with the nearest place to the point she has reached, and says she is at sea. Pure. */
export function whereaboutsOf(holding, { worldDay = null, locations = {} } = {}) {
  const p = voyagePosition(holding, { worldDay, locations });
  if (!p) return { locationId: holding?.locationId || null, atSea: false };
  return { locationId: p.nearestId, atSea: true, from: p.from, to: p.to, daysOut: p.daysOut, daysLeft: p.daysLeft, fraction: p.fraction, worldPos: p.worldPos };
}

/** The line a player reads for a hull under way: "two days out of Keelmouth, nearest Firstsight, three to go". Pure. */
export function voyageLine(holding, { worldDay = null, locations = {}, nameOf = null } = {}) {
  const p = voyagePosition(holding, { worldDay, locations });
  if (!p) return null;
  const nm = (id) => (nameOf ? nameOf(id) : (locations?.[id]?.name || id));
  const d = (n) => (n < 1 ? "under a day" : `${Math.round(n)} day${Math.round(n) === 1 ? "" : "s"}`);
  const near = p.nearestId && p.nearestId !== p.from && p.nearestId !== p.to ? `, nearest ${nm(p.nearestId)}` : "";
  return `${d(p.daysOut)} out of ${nm(p.from)}${near} · ${d(p.daysLeft)} to ${nm(p.to)}`;
}

/** Is this holding under way, and how far along? */
export function voyageOf(holding) {
  const v = carriageOf(holding)?.voyage;
  return v ? { ...v } : null;
}

const tagsOf = (loc) => (Array.isArray(loc?.tags) ? loc.tags.map(t => String(t).toLowerCase()) : []);
const needsFor = (carriage, cfg) => carriage.needsTags || (cfg?.needsTags || {})[carriage.moves] || [];

/** The bearer's willingness, for a `willed` carriage: `carries` while their standing holds, `leaves` once it falls past the floor. */
export function bearerWill(carriage, npcs, cfg) {
  if (carriage.moves !== "willed" && carriage.moves !== "living") return { carries: true, bearer: null };
  const bearer = carriage.bearerId ? (npcs || {})[carriage.bearerId] : null;
  if (!bearer) return { carries: false, leaves: false, bearer: null, why: "nobody has agreed to carry it" };
  const gone = ["dead", "departed", "missing"].includes(String(bearer.status || "active"));
  const standing = num(bearer.relationship, 0);
  const willingAt = num(cfg?.willingAt, 1);
  const leavesAt = num(cfg?.leavesAt, -4);
  const name = bearer.name || carriage.bearerId;
  if (gone) return { carries: false, leaves: true, bearer, why: `${name} is not here to carry it` };
  if (standing <= leavesAt) return { carries: false, leaves: true, bearer, why: `${name} has carried you as far as they cared to` };
  if (standing < willingAt) return { carries: false, leaves: false, bearer, why: `${name} will not carry you while things stand as they do` };
  return { carries: true, leaves: false, bearer };
}

/** ⛔ CAN SHE SAIL, AND IF NOT, WHY — said in the words the player needs. Never a silent false: a refusal the player cannot read is
 *  indistinguishable from a broken control (the lesson of §172/§178). Returns { ok, why, days, carriage }. Pure. */
export function canSail(character, holding, toLocationId, { locations = {}, npcs = null, cfg = null, routeDays = null } = {}) {
  const carriage = carriageOf(holding);
  if (!carriage) return { ok: false, why: `${holding?.name || "this place"} does not move.` };
  if (carriage.voyage) return { ok: false, why: `${holding.name} is already under way.`, carriage };
  const to = (locations || {})[toLocationId];
  if (!toLocationId || !to) return { ok: false, why: "there is nowhere named to sail to.", carriage };
  if (toLocationId === holding.locationId) return { ok: false, why: `${holding.name} is already there.`, carriage };
  const will = bearerWill(carriage, npcs || character?.npcRegistry || {}, cfg);
  if (!will.carries) return { ok: false, why: `${will.why}.`, carriage, bearer: will.bearer };
  if (carriage.moves === "crewed") {
    const crew = (holding.garrison || []).length;   // ⚑ Aevi: THE GARRISON IS THE CREW, and below `needsCrew` she does not sail
    if (crew < carriage.needsCrew) return { ok: false, why: `${holding.name} needs ${carriage.needsCrew} aboard to move and has ${crew}.`, carriage, crew };
  }
  const needs = needsFor(carriage, cfg);
  if (needs.length) {
    const has = tagsOf(to);
    if (!needs.some(t => has.includes(String(t).toLowerCase()))) return { ok: false, why: `${to.name || toLocationId} is no place for ${holding.name} to arrive — it wants ${needs.slice(0, 4).join(", ")}.`, carriage, needs };
  }
  const raw = num(routeDays, null);
  const days = raw === null ? null : Math.max(0, raw) / carriage.speed;
  return { ok: true, why: "", days, carriage };
}

/** ⛔ SAIL HER. Two outcomes, both honest:
 *   · the player is ABOARD (standing where she stands) — she arrives and the player arrives with her, which Aevi calls the whole
 *     appeal, and the caller advances the clock by the days returned;
 *   · the player is NOT aboard — a VOYAGE is in flight: `locationId` stays at the port she left until `arriveDay`, and `voyageTick`
 *     writes the new place on arrival. Anyone at the old place who is not in her garrison is LEFT, and it is said before it happens.
 *  Mutates the holding (and nothing else). Returns the receipt. */
export function sailHolding(character, holding, toLocationId, { locations = {}, npcs = null, cfg = null, routeDays = null, worldDay = null, aboard = null } = {}) {
  const gate = canSail(character, holding, toLocationId, { locations, npcs, cfg, routeDays });
  if (!gate.ok) return { ok: false, why: gate.why };
  const days = num(gate.days, 0) || 0;
  const from = holding.locationId;
  const carried = aboard === null ? character?.currentLocationId === from : !!aboard;
  const left = (holding.garrison || []).length ? [] : [];
  holding.carriage = { ...holding.carriage };
  if (carried) {
    holding.locationId = toLocationId;
    holding.carriage.voyage = null;
    holding.history = [...(holding.history || []), `[d${worldDay ?? "?"}] sailed from ${from} to ${toLocationId}, ${days.toFixed(1)} days, with you aboard`].slice(-40);
    return { ok: true, arrived: true, carried: true, days, from, to: toLocationId };
  }
  holding.carriage.voyage = { from, to: toLocationId, days, startedDay: num(worldDay, null), arriveDay: num(worldDay, null) === null ? null : num(worldDay) + Math.ceil(days) };
  holding.history = [...(holding.history || []), `[d${worldDay ?? "?"}] put out from ${from} for ${toLocationId}, ${days.toFixed(1)} days, without you`].slice(-40);
  return { ok: true, sailed: true, carried: false, days, from, to: toLocationId, arriveDay: holding.carriage.voyage.arriveDay, left };
}

/** ⛔ THE WORLD BRINGS HER IN. A voyage whose day has come writes `locationId` and clears itself; a `willed` carriage whose bearer has
 *  had enough LEAVES, taking the place with it — the holding is released, with the reason on the record. Mutates; returns the notes. */
export function voyageTick(character, { worldDay = null, npcs = null, cfg = null } = {}) {
  const out = { arrived: [], departed: [], notes: [] };
  const day = num(worldDay, null);
  for (const h of character?.holdings || []) {
    const carriage = carriageOf(h);
    if (!carriage) continue;
    const will = bearerWill(carriage, npcs || character?.npcRegistry || {}, cfg);
    if (will.leaves) {
      h.carriage = { ...h.carriage, voyage: null, left: { day, why: will.why } };
      h.condition = "gone";
      out.departed.push({ id: h.id, name: h.name, why: will.why });
      out.notes.push(`${h.name} is gone — ${will.why}.`);
      h.history = [...(h.history || []), `[d${day ?? "?"}] left: ${will.why}`].slice(-40);
      continue;
    }
    const v = carriage.voyage;
    if (!v || v.arriveDay === null || day === null || day < v.arriveDay) continue;
    h.locationId = v.to;
    h.carriage = { ...h.carriage, voyage: null };
    out.arrived.push({ id: h.id, name: h.name, from: v.from, to: v.to });
    out.notes.push(`${h.name} has come in at ${v.to}.`);
    h.history = [...(h.history || []), `[d${day}] arrived at ${v.to} from ${v.from}`].slice(-40);
  }
  return out;
}

/** ⛔ WHAT CAN RIDE, AND WHAT WORKS AT SEA. `hullable` says a feature can be aboard at all (a mine cannot); `producesWhileMoving`
 *  says it still earns under way — Aevi's Q1: "a fishery at sea produces and a market does not; a market needs someone to sell TO."
 *  Absent `hullable` means it rides: the immovable kinds are the named ones, so a new feature is not silently grounded. Pure. */
export function featureRuling(holding, kinds) {
  const feats = Array.isArray(holding?.features) ? holding.features : [];
  const spec = (k) => (kinds || {})[k] || {};
  const rides = feats.filter(f => spec(f.kind).hullable !== false);
  const grounded = feats.filter(f => spec(f.kind).hullable === false);
  const underWay = rides.filter(f => spec(f.kind).producesWhileMoving === true);
  return { rides, grounded, underWay, earnsAtSea: underWay.length > 0 };
}

/** Can this feature be built on this holding at all? A mobile holding refuses the kinds that cannot ride, with the reason. Pure. */
export function canBuildOn(holding, kind, kinds) {
  if (!carriageOf(holding)) return { ok: true };
  const hullable = ((kinds || {})[kind] || {}).hullable;
  return hullable === false
    ? { ok: false, why: `a ${String(kind).replace(/_/g, " ")} cannot be built aboard something that moves` }
    : { ok: true };
}
