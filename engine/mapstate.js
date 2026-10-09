// engine/mapstate.js — SNG-679 Part S. EVERYTHING ON THE MAPS CAN CHANGE, THROUGH ONE DOOR.
//
// ✅ ERIK: *"Every single thing that exists needs to be able to be added, damaged, ruined, moved, etc by the
// game."* ✅ AND, asked whether the world's state is per save or shared: *"It's one world."*
//
// ⛔ WHAT WAS TRUE BEFORE THIS FILE, from Aevi's read of origin: *"No GM channel can change a place, site,
// ground, road, river or waygate. SNG-672 M3 is unbuilt; there is no `placeState`."* A hold had a
// `condition` — failing … thriving — which is its FORTUNE, not its fabric: no damaged wall, no burned mill,
// no wrecked hull. `holdingOps` carried fifteen kinds and *"no damage, ruin, destroy, repair or move."*
//
// ⛑ THE TWO AXES ARE SEPARATE AND THAT IS THE POINT. ✅ Aevi: *"Fortune and fabric are separate axes: a
// thriving hold can have a burned wall."* Nothing here touches `condition`.
//
// ⛔ ONE DOOR (S1). `applyMapChange` is the only writer, so the GM's `mapOps`, the hold channels, a raid and
// the world tick cannot grow four different ideas of what "ruined" does. A gate (G2) holds that nothing else
// writes these fields — which is the same rule SNG-672 M1 set for minting a place.
//
// ⛔ ONE WORLD (S2). A change is an EVENT, not a state. Events are append-only, their ids are derived from
// what happened rather than minted, and the state is a FOLD every client computes the same way — so two
// saves that recorded the same burning hold one event, and two saves that recorded different changes in
// either order fold to the same answer. That is `fates.js`'s rule applied to fabric instead of lives.
//
// ⚠️ PURE. Every reading of content, the day and the world is injected; the IO lives with the sync layer,
// exactly as `fates.js` keeps `foldFates` pure and lets `sync.js` carry it.

import { smartClamp } from "./namematch.js";   // model prose is clamped on a word, never sliced
import { fnvHex } from "./fates.js";
import { walkingDays } from "./worldmap.js";   // ✅ S7: word of a ruin travels at a walk
import { positionedPlace } from "./worldtime.js";   // ✅ S8: the live locations carry H5's moving places too   // ⛔ ONE HASH. A second id rule is a second identity for one event.

/* ═════ S0 · THE INVENTORY, AS A TABLE ═════
 * ✅ AEVI: *"This table is the scope. A gate (G1) keeps it complete … A new class drawn on a map without a
 * row fails."* So it is DATA, not a switch: a class is its key shape, what may be done to it, and where its
 * state lives. ⚠️ `onRecord` classes keep their state on their own record (a hold is its owner's); the rest
 * are the world's and live in the shared store.
 * ⛑ `addBack` is what S0's "a repair of destroyed is refused EXCEPT for things S0 says can be added again"
 * turns into: a razed place can be founded again, a destroyed waygate cannot be repaired into existence. */
export const MAP_CLASSES = {
  place: { key: "place:<id>", parts: 1, onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired", "moved", "renamed", "revealed", "hidden"],
    // ⛔ `addedBy` IS READ BY A PLAYER, so it carries words and not a ticket. §262's ratchet caught this:
    // the refusal reads "a place is added by its own channel (…)", and it said "SNG-672 M1 mint". The
    // ticket belongs in a comment — a place is founded through the minting door, which SNG-672 M1 built.
    addBack: true, addedBy: "the founding of a place" },
  site: { key: "site:<placeId>/<siteId>", parts: 2, onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired", "moved", "renamed", "revealed", "hidden"],
    addBack: true, addArgs: ["bearing", "metres"] },
  ground: { key: "ground:<placeId>/<n>", parts: 2, onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired"],
    addBack: true, addKinds: ["cleared", "planted", "drained"] },
  water: { key: "water:<riverId> | water:<placeId>/<n>", parts: [1, 2], onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired", "moved", "renamed", "revealed", "hidden"],
    addBack: true, addedBy: "a cut channel" },
  road: { key: "road:<a>|<b>", parts: 1, sortedPair: true, onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired", "moved", "revealed", "hidden"],
    addBack: true },
  // ⛔ A WAYGATE IS THE ONE THING A REPAIR CANNOT BRING BACK FROM DESTROYED. ✅ S0: *"repaired ✓ (not from
  // destroyed)"*, and `mapStates.repair.localsWillNot` lists `waygate:destroyed` as beyond the locals too.
  gate: { key: "gate:<placeId>", parts: 1, onRecord: false,
    allows: ["added", "damaged", "ruined", "destroyed", "repaired", "revealed", "hidden"],
    addBack: true, repairFromDestroyed: false, addedBy: "the making of a gate" },
  hold: { key: "hold:<holdId>", parts: 1, onRecord: true, recordField: "state",
    allows: ["damaged", "ruined", "destroyed", "repaired", "moved", "renamed"],
    addBack: false, addedBy: "claiming a hold", movedBy: "setting sail" },
  feature: { key: "feature:<holdId>/<featureId>", parts: 2, onRecord: true, recordField: "state",
    allows: ["damaged", "ruined", "destroyed", "repaired", "moved", "renamed"],
    addBack: false, addedBy: "adding a feature" },
  caravan: { key: "caravan:<caravanId>", parts: 1, onRecord: true, recordField: "state",
    allows: ["damaged", "ruined", "destroyed", "moved"],
    addBack: false, addedBy: "sending a caravan", noRepair: true },
  // ⛔ A REGION IS NEVER DAMAGED. ✅ S0 gives it rename and reveal only: a Reach is not a thing that burns,
  // and letting it take the ladder would mean "the Valley of Echoes is ruined", which is not a fact the
  // world can hold about a sixth of itself.
  region: { key: "region:<id>", parts: 1, onRecord: false,
    allows: ["renamed", "revealed", "hidden"], addBack: false },
};

/* ⛔ THE CLASS OF A KEY, AND IT REFUSES RATHER THAN GUESSES. ✅ Aevi (G1): *"A new class drawn on a map
 * without a row fails."* An unknown prefix is the shape a silent default would hide — a class drawn but
 * never declared — so it comes back null and the door says why. */
export function parseMapKey(key) {
  const s = String(key || "");
  const i = s.indexOf(":");
  if (i <= 0) return null;
  const cls = s.slice(0, i), rest = s.slice(i + 1);
  const row = MAP_CLASSES[cls];
  if (!row || !rest) return null;
  const parts = rest.split("/");
  const want = Array.isArray(row.parts) ? row.parts : [row.parts];
  if (!want.includes(parts.length)) return null;
  return { cls, row, parts, id: parts[0], sub: parts[1] ?? null, rest };
}

/* ⛔ A ROAD'S KEY IS SORTED, so one road is one key. ✅ S0: *"`road:<a>|<b>` (sorted ids)"*. Two saves that
 * burned the same bridge from opposite ends must fold one event, and an unsorted key would give them two. */
export function roadKey(a, b) {
  const x = String(a || ""), y = String(b || "");
  return `road:${x < y ? `${x}|${y}` : `${y}|${x}`}`;
}

/* ═════ S2 · THE EVENT ID IS DERIVED, NEVER MINTED ═════
 * ✅ AEVI: *"Event ids are derived from `{ key, change, worldDay, by }`, so two worlds that recorded the same
 * change hold one event, not two (`personIdFor`'s rule)."*
 * ⛑ Through `fnvHex`, the same hash `personIdFor` uses, because a second hash is a second identity for one
 * event and the whole of "one world" rests on two clients agreeing about that.
 * ⚠️ `worldDay` IS FLOORED. A change at day 12.4 in one world and 12.0 in another is the same day's
 * burning; keeping the fraction would make them two events and the bridge would burn twice. */
export function eventIdFor({ key = "", change = "", worldDay = 0, by = null } = {}) {
  const day = Math.floor(Number(worldDay) || 0);
  return `mc-${fnvHex(`${key}|${change}|${day}|${by || "the world"}`)}`;
}

/* ⛔ WHERE A CHANGE SITS ON THE LADDER. `mapStates.ladder` is content — ["whole","damaged","ruined",
 * "destroyed"] — and the engine must not hold a second copy, so it is read, with the authored order as the
 * only source of "worse". */
export function ladderOf(content) {
  const l = content?.mapStates?.ladder;
  return Array.isArray(l) && l.length ? l : ["whole", "damaged", "ruined", "destroyed"];
}
export function rungOf(content, state) {
  const l = ladderOf(content);
  const i = l.indexOf(String(state || l[0]));
  return i < 0 ? 0 : i;
}

/* ═════ S1 · THE DOOR'S VALIDATION ═════
 * ✅ AEVI: *"the key resolves; the class allows the change (S0); a `damaged`/`ruined`/`destroyed` step is a
 * move on `mapStates.ladder`; `added` names a parent that exists and a kind from the closed vocabularies; a
 * repair of `destroyed` is refused except for things S0 says can be added again."*
 * ⛑ IT RETURNS A REASON, never a bare false. A refused GM op has to be able to say why in the scene, which
 * is the same rule `canSail` follows.
 * @param exists (kind, id) => boolean — injected, so this module reads no content of its own
 */
export function validateMapChange(change, { content = null, state = null, exists = null } = {}) {
  const c = change || {};
  const parsed = parseMapKey(c.key);
  if (!parsed) return { ok: false, why: `"${c.key}" is not a key of any class the maps draw` };
  const changes = content?.mapStates?.changes || [];
  if (changes.length && !changes.includes(c.change)) {
    return { ok: false, why: `"${c.change}" is not one of the world's changes` };
  }
  if (!parsed.row.allows.includes(c.change)) {
    return { ok: false, why: `a ${parsed.cls} cannot be ${c.change} — it takes ${parsed.row.allows.join(", ")}` };
  }
  const now = String(state?.state || ladderOf(content)[0]);
  if (c.change === "repaired") {
    if (parsed.row.noRepair) return { ok: false, why: `a ${parsed.cls} is not a thing that is repaired` };
    if (rungOf(content, now) === 0) return { ok: false, why: `it is already whole` };
    // ⛔ THE ONE REFUSAL S0 NAMES BY NAME: a destroyed waygate is not mended, it is made again.
    if (now === "destroyed" && parsed.row.repairFromDestroyed === false) {
      return { ok: false, why: `a destroyed ${parsed.cls} cannot be repaired — it has to be made again` };
    }
  }
  if (c.change === "added") {
    if (!parsed.row.addBack && now !== "destroyed") {
      return { ok: false, why: `a ${parsed.cls} is added by its own channel (${parsed.row.addedBy || "its own door"}), not through a map change` };
    }
    // ⚠️ A PARENT THAT DOES NOT EXIST IS THE COMMONEST WAY A GENERATED CHANGE IS WRONG, so it is checked
    // rather than trusted: the GM naming a site of a place that is not there would otherwise write a record
    // nothing can ever draw.
    if (parsed.sub != null && typeof exists === "function" && !exists("place", parsed.id)) {
      return { ok: false, why: `there is no ${parsed.id} to add a ${parsed.cls} to` };
    }
    // ✅ SNG-679 S8: *"Adding a site or ground takes `{ bearing, fromMetres }` or `{ toward: <placeId>, near|far }` … Adding water is a cut
    // channel, `{ bearing, fromMetres, widthMetres, flowBearing }`."* A thing added has to say WHERE, or nothing can draw it.
    if (["site", "ground"].includes(parsed.cls) || (parsed.cls === "water" && parsed.sub != null)) {
      const why = addedPosProblem(parsed.cls, c.pos);
      if (why) return { ok: false, why };
      if (parsed.cls === "ground" && !(parsed.row.addKinds || []).includes(String(c.kind || ""))) return { ok: false, why: `ground is added as one of ${(parsed.row.addKinds || []).join(", ")}` };
    }
  }
  if (c.change === "moved" && !c.pos) return { ok: false, why: `a move has to say where to` };
  // ✅ SNG-679 S8: *"Moving a fixed place is rare and is a story act … It writes `pos`. … Cap it at 0.5 days from the old point. Further
  // than that is a new place founded (M1) and the old one ruined or razed."* A moving place moves by its circuit (H5), never by this.
  if (c.change === "moved" && parsed.cls === "place") {
    const loc = content?.locations?.[parsed.id] || null;
    const p = c.pos || {};
    if (!Number.isFinite(Number(p.colatitude)) || !Number.isFinite(Number(p.longitude))) return { ok: false, why: "a place is moved to a point — { colatitude, longitude }" };
    if (loc?.carriage?.circuit) return { ok: false, why: `${loc.name || parsed.id} moves by its own circuit, not by being moved` };
    if (loc?.worldPos) {
      const d = walkingDays(loc, { worldPos: { colatitude: Number(p.colatitude), longitude: Number(p.longitude) } });
      if (Number.isFinite(d) && d > MOVE_CAP_DAYS) return { ok: false, why: `that is ${d.toFixed(1)} days from where it stands — further than half a day is a new place founded, and the old one left behind` };
    }
  }
  // ✅ S8: *"Adding a road between two places adds a live connection (M3's 'road opened')."* Both ends must be places that exist.
  if (c.change === "added" && parsed.cls === "road") {
    const [a, b] = String(parsed.rest || "").split("|");
    if (!a || !b || a === b) return { ok: false, why: "a road runs between two places" };
    if (content?.locations && (!content.locations[a] || !content.locations[b])) return { ok: false, why: `there is no ${!content.locations[a] ? a : b} for a road to reach` };
  }
  if (c.change === "renamed" && !String(c.name || "").trim()) return { ok: false, why: `a rename has to say what to` };
  return { ok: true, cls: parsed.cls, parsed };
}

/* ═════ S2 · THE FOLD, AND EVERY CLIENT COMPUTES IT THE SAME WAY ═════
 * ✅ AEVI, exactly: *"events are sorted by world-day, then by severity on a tie (destroyed > ruined >
 * damaged > repaired > the rest), then by id; damage jumps on the ladder, and a repair climbs one rung; the
 * latest move and the latest rename stand; the first `added` stands."*
 * ⛔ THE TIE-BREAK IS NOT DECORATION. Two worlds can record a burning and a mending on the same world-day;
 * without a stated order the same two events fold to "damaged" in one client and "whole" in the other, and
 * "one world" is a claim that quietly fails. Severity first, then the derived id — which every client has.
 * ⚑ A REPAIR CLIMBS ONE RUNG and damage may jump: ✅ *"A fire can take a mill from whole to destroyed in one
 * change. Repair climbs one rung per change."* */
const SEVERITY = { destroyed: 0, ruined: 1, damaged: 2, repaired: 3 };
export function sortEvents(events, content) {
  return [...(events || [])].sort((a, b) => {
    const da = Math.floor(Number(a?.day) || 0), db = Math.floor(Number(b?.day) || 0);
    if (da !== db) return da - db;
    const sa = SEVERITY[a?.change] ?? 9, sb = SEVERITY[b?.change] ?? 9;
    if (sa !== sb) return sa - sb;
    return String(a?.id || "") < String(b?.id || "") ? -1 : 1;
  });
}

/** The folded record for one key. `{ state, since, by, seen, cause, beat, name?, was?, pos?, history[≤12] }` */
export function foldKey(events, content) {
  const l = ladderOf(content);
  const sorted = sortEvents(events, content);
  let state = l[0], since = null, by = null, seen = null, cause = null, beat = null;
  let name = null, was = null, pos = null, added = null;
  const history = [];
  for (const e of sorted) {
    const ch = String(e?.change || "");
    if (SEVERITY[ch] != null) {
      const before = state;
      if (ch === "repaired") {
        // one rung back toward whole, never two, and never past whole
        state = l[Math.max(0, rungOf(content, state) - 1)];
      } else {
        // ⛔ DAMAGE NEVER HEALS BY BEING RECORDED AGAIN: the worse of what it was and what happened.
        state = l[Math.max(rungOf(content, state), rungOf(content, ch))];
      }
      if (state !== before) { since = e.day ?? since; by = e.by ?? null; seen = e.seen ?? null; cause = e.cause ?? null; beat = e.beat ?? null; }
    } else if (ch === "renamed") {
      was = name ?? was; name = e.name ?? name; by = e.by ?? by; since = e.day ?? since;
    } else if (ch === "moved") {
      was = pos ? { pos } : was; pos = e.pos ?? pos; by = e.by ?? by; since = e.day ?? since;
    } else if (ch === "added") {
      // the FIRST added stands; a second is the same thing being founded twice
      if (!added) { added = { day: e.day ?? null, by: e.by ?? null, kind: e.kind ?? null, pos: e.pos ?? null, ...(e.name ? { name: e.name } : {}) };   // S8: a thing added keeps the name it was given
        if (e.pos && !pos) pos = e.pos; }
      // ⛑ founding something again brings it back to whole, which is what "a razed place can be founded
      // again" means in S0's `addBack` column
      if (state === "destroyed") { state = l[0]; since = e.day ?? since; by = e.by ?? null; }
    } else if (ch === "revealed" || ch === "hidden") {
      // knowledge, not fabric — Part R reads it; the ladder is untouched
      seen = ch === "revealed" ? (e.seen ?? "named") : "unseen";
    }
    history.push({ id: e.id, change: ch, day: e.day ?? null, by: e.by ?? null, cause: e.cause ?? null });
  }
  return { state, since, by, seen, cause, beat,
    ...(name ? { name } : {}), ...(was ? { was } : {}), ...(pos ? { pos } : {}), ...(added ? { added } : {}),
    history: history.slice(-12) };
}

/** The whole store folded: `{ [key]: record }`. Pure, and the same answer in every client. */
export function foldMapStates(store, content) {
  const out = {};
  const byKey = store?.keys && typeof store.keys === "object" ? store.keys : {};
  for (const [key, row] of Object.entries(byKey)) {
    const events = Array.isArray(row?.events) ? row.events : [];
    if (!events.length) continue;
    out[key] = foldKey(events, content);
  }
  return out;
}

/* ⛔ THE FOLD IS APPEND-ONLY AND IDEMPOTENT. ✅ Aevi (G10): *"Two saves record changes to the same bridge in
 * either order and fold to the same state. The same change recorded by both is one event."*
 * ⛑ Keyed by the DERIVED event id, so recording the same change twice — from two worlds, or from one world
 * twice — adds nothing the second time. Returns which keys moved, for the publish and the news. */
export function mergeMapEvents(store, events = [], { regionId = "valley" } = {}) {
  const next = { schemaVersion: 1, regionId, ...(store && typeof store === "object" ? store : {}),
    keys: { ...(store?.keys || {}) } };
  const changed = [];
  for (const e of events) {
    if (!e || !e.key || !e.id) continue;
    const row = next.keys[e.key] ? { ...next.keys[e.key], events: [...(next.keys[e.key].events || [])] } : { events: [] };
    if (row.events.some((x) => x.id === e.id)) continue;      // the same event, already held
    row.events.push(e);
    next.keys[e.key] = row;
    if (!changed.includes(e.key)) changed.push(e.key);
  }
  return { store: next, changed };
}

/* ═════ S1 · THE DOOR ═════
 * ✅ AEVI: *"`applyMapChange(character, change, ctx)` is the only writer … Every channel calls it: the GM's
 * new `mapOps`, the hold channels that already exist, raids, and the world tick. That is SNG-672 M1's 'one
 * door', applied to change. It validates and writes, then bumps the world revision."*
 * ⛔ IT WRITES IN TWO PLACES AND THAT IS S2's RULE, NOT A COMPROMISE: a hold, a feature and a caravan are
 * their owner's and keep their state on their own record; everything else is the world's and becomes an
 * EVENT in the shared store. `character.mapState` is a read-through cache of the fold and never a second
 * truth — so this writes the event and recomputes the cache from it, rather than editing the cache.
 * @param ctx { content, worldDay, revision, recordOf, exists, regionId }
 */
export function applyMapChange(character, change, ctx = {}) {
  const { content = null, worldDay = null, recordOf = null, exists = null, regionId = "valley" } = ctx;
  if (!character) return { ok: false, why: "no character" };
  const parsed = parseMapKey(change?.key);
  const onRecord = parsed?.row?.onRecord === true;
  const rec = onRecord && typeof recordOf === "function" ? recordOf(parsed.cls, parsed.id, parsed.sub) : null;
  const before = onRecord
    ? { state: String(rec?.[parsed.row.recordField] || ladderOf(content)[0]) }
    : (mapStateOf(character, change?.key, { content }) || null);

  const gate = validateMapChange(change, { content, state: before, exists });
  if (!gate.ok) return gate;

  const day = Number(worldDay ?? change?.day ?? 0);
  const ev = { id: eventIdFor({ key: change.key, change: change.change, worldDay: day, by: change.by }),
    key: change.key, change: change.change, day: Math.floor(day),
    by: change.by ?? null, cause: change.cause ?? null, beat: change.beat ?? null, seen: change.seen ?? null,
    ...(change.name ? { name: change.name } : {}), ...(change.pos ? { pos: change.pos } : {}),
    ...(change.kind ? { kind: change.kind } : {}) };

  if (onRecord) {
    // ⛔ A HOLD IS ITS OWNER'S. ✅ Aevi: *"Holds, features and caravans keep their state on their own records
    // the way `condition` lives there now."* The event rides on the record too, so the trace is where the
    // thing is and a hold's card can publish it (S2's "its card publishes the hold's own state").
    if (!rec) return { ok: false, why: `there is no ${parsed.cls} ${parsed.parts.join("/")} on this save` };
    const folded = foldKey([...(rec.stateEvents || []), ev], content);
    rec.stateEvents = [...(rec.stateEvents || []), ev].slice(-24);
    rec[parsed.row.recordField] = folded.state;
    rec.stateSince = folded.since;
    rec.stateBy = folded.by;
    return { ok: true, key: change.key, event: ev, state: folded.state, was: before.state, onRecord: true, record: rec };
  }

  // the world's. One record per key, append-only, folded.
  character.mapEvents = Array.isArray(character.mapEvents) ? character.mapEvents : [];
  const merged = mergeMapEvents({ keys: { [change.key]: { events: [...(eventsFor(character, change.key))] } }, regionId },
    [ev], { regionId });
  const already = merged.changed.length === 0;
  if (!already) character.mapEvents.push(ev);
  const folded = foldKey(eventsFor(character, change.key), content);
  character.mapState = character.mapState && typeof character.mapState === "object" ? character.mapState : {};
  character.mapState[change.key] = folded;
  // ⛑ SNG-672 M4's world revision: what tells every reader its cached read is stale.
  character.worldRevision = (Number(character.worldRevision) || 0) + 1;
  return { ok: true, key: change.key, event: ev, state: folded.state, was: before?.state || ladderOf(content)[0],
    onRecord: false, duplicate: already, revision: character.worldRevision };
}

/** Every event this save holds for a key — its own and whatever it adopted from the world. */
export function eventsFor(character, key) {
  const mine = (character?.mapEvents || []).filter((e) => e && e.key === key);
  const world = (character?.worldMapStore?.keys?.[key]?.events) || [];
  const seen = new Set();
  const out = [];
  for (const e of [...world, ...mine]) {
    if (!e || !e.id || seen.has(e.id)) continue;
    seen.add(e.id); out.push(e);
  }
  return out;
}

/* ⛔ ONE READER (S2). ✅ AEVI: *"`mapStateOf(character, key)` reads BOTH stores and returns
 * `{ state: "whole", … }` for anything never touched. Every renderer, the router, the economy and
 * `groundForGM` read it. THE LIVE RECORD WINS (SNG-672 M2)."*
 * ⚠️ "WHOLE" FOR ANYTHING NEVER TOUCHED IS THE WHOLE POINT, and it is why this returns a record rather than
 * null: a renderer asking "what state is this bridge in" must get an answer it can draw without knowing
 * whether anything has ever happened to the bridge. A null here would put a `?? "whole"` at every call site,
 * and one of them would be missed. */
export function mapStateOf(character, key, { content = null, recordOf = null } = {}) {
  const whole = { state: ladderOf(content)[0], since: null, by: null, seen: null, cause: null, beat: null, history: [] };
  const parsed = parseMapKey(key);
  if (!parsed) return whole;
  if (parsed.row.onRecord) {
    const rec = typeof recordOf === "function" ? recordOf(parsed.cls, parsed.id, parsed.sub) : null;
    if (!rec) return whole;
    // the live record wins: its own field is the answer, with the trace beside it
    return { ...whole, state: String(rec[parsed.row.recordField] || whole.state),
      since: rec.stateSince ?? null, by: rec.stateBy ?? null,
      history: (rec.stateEvents || []).slice(-12).map((e) => ({ id: e.id, change: e.change, day: e.day, by: e.by, cause: e.cause })) };
  }
  const events = eventsFor(character, key);
  if (!events.length) return whole;
  return foldKey(events, content);
}

/* ⛑ THE WORD A PLAYER READS, from `mapStates.words` — never composed here. ✅ Her content carries a word per
 * class per change ("razed" for a place, "torn down" for a site), with `{name}`, `{old}` and `{from}` filled
 * in when shown. A class with no word for a state is a content gap and says so rather than inventing one. */
/* ═════ S5 · EVERY TIER DRAWS STATE — the one reader every painter asks ═════
 * ✅ AEVI's table: damaged — the glyph cracked; ruined — a ruin glyph, the label greyed; destroyed — a faint trace, the label
 * `trace`; renamed — the new name; added — normal, "new" on the card for 30 days. ⛑ The answer is what a painter needs and
 * nothing it has to work out again, so the globe, the region map, the local map and the card cannot disagree about a state.
 * `name` is the thing's own name (what a rename replaced); `worldDay` decides "new". PURE. */
export function mapView(character, key, { content = null, name = "", worldDay = null, recordOf = null } = {}) {
  // ✅ SNG-679 S7: *"The map shows the state the character HAS LEARNED, not the state the world holds."*
  const st = knownStateOf(character, key, { content, recordOf }) || { state: ladderOf(content)[0] };
  // ✅ Part R · R2: *"While they work, the local map shows the thing under repair"* — derived from the record and the day
  const rep = worldDay != null ? localRepairAt(st, key, worldDay, content) : null;
  const cls = parseMapKey(key)?.cls || "place";
  const state = String(st.state || ladderOf(content)[0]);
  const now = st.name || name;
  const mark = state === "damaged" ? "crack" : state === "ruined" ? "ruin" : state === "destroyed" ? "trace" : null;
  const label = state === "destroyed" ? (mapStateWord(content, cls, "trace", { name: now }) || now) : now;
  const isNew = !!st.added && worldDay != null && st.added.day != null && Number(worldDay) - Number(st.added.day) < 30;
  return { key, cls, state, mark, glyph: state !== "destroyed", label, isNew,
    alpha: state === "ruined" ? 0.55 : state === "destroyed" ? 0.4 : 1,
    labelAlpha: state === "ruined" ? 0.6 : state === "destroyed" ? 0.55 : 1,
    renamed: !!st.name && st.name !== name, once: st.name ? (typeof st.was === "string" ? st.was : name) : null,
    since: st.since ?? null, cause: st.cause ?? null,
    mending: rep?.mending ? { progress: rep.progress, wholeDay: rep.wholeDay, by: "locals" } : null,
    // ✅ S7: *"Until then their map shows the old state, and the card says `knowledge.lastKnown`."*
    lastKnown: hasUnlearned(character, key),
    // ✅ Aevi: *"The card's words when it lands: 'mended, by word'"* — the last thing they know of it is a mending that came by word
    mendedByWord: mendedByWordAt(character, key) };
}
/** Whether the last change the character knows of at this key is a mending that reached them by word. */
export function mendedByWordAt(character, key) {
  const known = eventsFor(character, key).filter((e) => eventKnown(character, e)).sort(byDay);
  const last = known[known.length - 1];
  return !!last && WORD_OF_MENDING.has(String(last.change)) && character?.mapLearned?.[last.id]?.how === "word";
}

export function mapStateWord(content, cls, state, { name = "", old = "", from = "" } = {}) {
  const w = content?.mapStates?.words?.[cls]?.[state];
  if (!w) return null;
  return String(w).replace(/\{name\}/g, name).replace(/\{old\}/g, old).replace(/\{from\}/g, from);
}

/* ═════ SNG-679 S6 · A STATE THAT ONLY SHOWS IS A PICTURE, NOT A RULE ═════
 * ✅ ERIK: *"Every single thing that exists needs to be able to be added, damaged, ruined, moved, etc by the
 * game."* ✅ AEVI (S6): *"State changes play, not just pictures. The numbers are in `mapStates.effects` and
 * `repairCost`, read from content (first cut, Erik rules them)."*
 * ⛔ UNTIL THIS, THE WHOLE LADDER WAS DECORATION. `applyMapChange` wrote, `mapStateOf` read, and the only
 * consumers were three marks on two maps: a ruined road cost nothing, a destroyed waygate still folded, a
 * razed place still had a market. Measured before building — `mapStateOf` had four callers in the whole
 * repo and not one of them asked what the state DID.
 * ⛑ EVERY NUMBER IS HERS. Nothing here invents a multiplier or a threshold; this is the reader that turns
 * `content.mapStates.effects` into the three questions a caller actually asks: may I go this way, how much
 * longer does it take, and what does this thing still give.
 */

/** The authored effect block for one class at one state, or null. Absent is "no effect", never a guess. */
export function stateEffect(content, cls, state) {
  const e = content?.mapStates?.effects?.[cls];
  if (!e || !state || state === "whole") return null;
  const v = e[state];
  return v && typeof v === "object" ? v : (typeof v === "number" ? { mult: v } : null);
}

/* ⛔ ONE LEG OF ROAD, AND THE TWO PLACES IT JOINS. ✅ *"A blocked road is still walkable, slowly; carts,
 * caravans and moving holds cannot take it. A cut road is gone from the way-finding until it is opened
 * again."* ✅ And a place: *"Ruined: … still a road end, so you can walk to a ruin. Destroyed: not a road
 * end."* ⛑ So the leg answers for all three records at once — the road's own state and both ends' — because
 * a caller walking a graph must not have to remember that a destroyed place also takes its roads with it. */
export function roadLeg(character, aId, bId, baseDays, { content = null, carts = false } = {}) {
  const out = { open: true, days: Number(baseDays) };
  if (!Number.isFinite(out.days)) return { open: false, days: null };
  for (const id of [aId, bId]) {
    const st = mapStateOf(character, `place:${id}`, { content })?.state;
    const pe = stateEffect(content, "place", st);
    if (pe && pe.roadEnd === false) return { open: false, days: null };
  }
  const st = mapStateOf(character, roadKey(aId, bId), { content })?.state;
  const re = stateEffect(content, "road", st);
  if (!re) return out;
  if (re.open === false) return { open: false, days: null };
  if (carts && re.carts === false) return { open: false, days: null };
  if (Number.isFinite(Number(re.daysMult))) out.days *= Number(re.daysMult);
  return out;
}

/** A waygate's own state: whether it still folds, and what a damaged one costs. */
export function gateLeg(character, placeId, { content = null } = {}) {
  const st = mapStateOf(character, `gate:${placeId}`, { content })?.state;
  const ge = stateEffect(content, "waygate", st);
  if (!ge) return { open: true, extraDays: 0, remake: false };
  return { open: ge.open !== false, extraDays: Number(ge.extraDays) || 0, remake: !!ge.remake };
}

/** What a place still is. ✅ *"Ruined: no services (market, inn, trade) and no territory anchor, but still a
 *  road end … Destroyed: not a road end, no anchor; a trace."* */
export function placeAllows(character, placeId, { content = null } = {}) {
  const st = mapStateOf(character, `place:${placeId}`, { content })?.state;
  const pe = stateEffect(content, "place", st);
  return { state: st || "whole",
    services: !pe || pe.services !== false,
    anchor: !pe || pe.anchor !== false,
    roadEnd: !pe || pe.roadEnd !== false };
}

/* ⛔ WHAT A FEATURE STILL GIVES, AND THE HOLD'S STATE CAPS IT. ✅ *"The effect multiplies what the feature
 * gives (yield, defence, aura, beds, facility). A ruined feature keeps its room; a destroyed one frees it."*
 * ✅ *"A hold's own state caps its features: a damaged hold has nothing better than damaged features, a ruined
 * hold nothing better than ruined."* ⛑ The cap is on the LADDER, not on the multiplier — the two are the same
 * only by today's numbers, and a cap written in multipliers would quietly stop meaning "no better than" the
 * day she gives damaged features 0.6. */
export function featureScale(character, { hold = null, feature = null, content = null, water = null, ground = null } = {}) {
  // ⛑ `rungOf` takes the CONTENT first — the ladder is authored, and a one-argument call would have read
  // every state as rung 0 and silently capped nothing.
  const worst = (a, b) => (rungOf(content, a) >= rungOf(content, b) ? a : b);
  let state = feature?.state || "whole";
  if (hold) state = worst(state, hold.state || "whole");
  let mult = 1;
  const fe = stateEffect(content, "feature", state);
  if (fe && Number.isFinite(Number(fe.mult))) mult = Number(fe.mult);
  // ✅ *"Water and ground: the multiplier applies to the water-fed and ground-worked features of the places
  // and holds on them (mills, docks and fisheries; fields, herds and quarries)."*
  for (const [cls, st] of [["water", water], ["ground", ground]]) {
    const e = stateEffect(content, cls, st);
    const m = e && Number.isFinite(Number(e.featuresOnIt)) ? Number(e.featuresOnIt) : null;
    if (m != null) mult *= m;
  }
  return { mult, state, roomTaken: rungOf(content, state) < rungOf(content, "destroyed") };
}

/** What it costs to bring a thing back, as a fraction of building it. Destroyed is a full rebuild (1). */
/* ═════ S3 · THE GM CHANNEL: `mapOps` ═════
 * ✅ AEVI: *"It has the same shape as the other op channels, and its prompt section lists only what the scene can see:
 * the place the party is in and its sites, ground and water; the roads out of it; the holds there. It writes through S1
 * and nothing else. An op the scene could not see is refused, the way a `holdingOp` on a hold you don't own is refused
 * today. The GM's lore section describes damaged and ruined things using `mapStates.words`, so the prose and the map say
 * the same thing."* */

/** every key the scene can see from `hereId`, with its label and its folded state — ONE list the prompt prints and the
 *  door checks, so the GM is refused exactly what it was never shown. PURE given `layout` (the place's local layout). */
export function visibleMapKeys(character, content, { hereId = null, layout = null } = {}) {
  const locs = content?.locations || {};
  const here = hereId || character?.currentLocationId || null;
  const loc = here ? locs[here] : null;
  if (!loc) return [];
  const out = [];
  const stateOf = (key, recordOf = null) => (mapStateOf(character, key, { content, recordOf })?.state) || ladderOf(content)[0];
  const push = (key, label, cls, recordOf = null) => out.push({ key, label, cls, state: stateOf(key, recordOf) });
  push(`place:${here}`, loc.name || here, "place");
  for (const s of (layout?.sites || [])) if (s?.id) push(`site:${here}/${s.id}`, s.name || s.id, "site");
  (layout?.extent || []).forEach((f, n) => {
    if (!f) return;
    if (f.kind === "water") push(`water:${here}/${n}`, f.name || "the water", "water");
    else if (["cleared", "planted", "drained", "ground", "field", "fields", "grove", "orchard", "pasture", "quarry", "marsh"].includes(String(f.kind || ""))) push(`ground:${here}/${n}`, f.name || f.kind, "ground");
  });
  for (const other of (loc.connections || [])) if (locs[other]) push(roadKey(here, other), `the road to ${locs[other].name || other}`, "road");
  if (loc.waygate || loc.role === "gate") push(`gate:${here}`, `the gate at ${loc.name || here}`, "gate");
  for (const h of (character?.holdings || [])) {
    if (!h || h.locationId !== here) continue;
    push(`hold:${h.id}`, h.name || h.id, "hold", () => h);
    for (const f of (h.features || [])) if (f?.id) push(`feature:${h.id}/${f.id}`, `${h.name || h.id}'s ${f.name || f.kind || f.id}`, "feature", () => f);
  }
  return out;
}

/** the prompt block: what stands here and can change, each with the world's word for its state */
export function mapOpsForGM(character, content, { hereId = null, layout = null } = {}) {
  const keys = visibleMapKeys(character, content, { hereId, layout });
  if (!keys.length) return "";
  const line = (k) => {
    const w = k.state && k.state !== ladderOf(content)[0] ? ` — ${mapStateWord(content, k.cls, k.state, { name: k.label }) || k.state}` : "";
    return `- ${k.key} · ${k.label}${w}`;
  };
  return `## WHAT STANDS HERE AND CAN CHANGE (mapOps keys — use them EXACTLY; a thing not listed cannot be changed from here)
${keys.map(line).join("\n")}`;
}

/** the GM's op, through the one door: the key must be one the scene was shown; the change is one of the world's; `by`
 *  defaults to the world and `seen` to unseen (damage by a flood has no culprit). Returns the door's answer. */
export function applyMapOp(character, op, { content = null, worldDay = null, hereId = null, layout = null, visible = null, beat = null, recordOf = null, exists = null, regionId = "valley" } = {}) {
  const o = op || {};
  const key = String(o.key || "").trim();
  const change = String(o.change || o.op || "").trim().toLowerCase();
  const seen = visible || visibleMapKeys(character, content, { hereId, layout });
  if (!key) return { ok: false, why: "a map op has to name a key" };
  // ⛑ S8: a thing ADDED has a new key by its nature — it is allowed when the place it is added to is in view
  const addingHere = change === "added" && (() => { const p = parseMapKey(key); return !!p && p.sub != null && seen.some((k) => k.key === `place:${p.id}`); })();
  if (!addingHere && !seen.some((k) => k.key === key)) return { ok: false, why: `"${key}" is not something the scene can see — the keys it can are listed in the prompt` };
  const by = o.by != null && String(o.by).trim() ? String(o.by).trim() : "the world";
  const seenHow = ["named", "described", "unseen"].includes(String(o.seen || "")) ? String(o.seen) : (by === "the world" ? "unseen" : "described");
  return applyMapChange(character, {
    key, change, by, seen: seenHow, cause: o.cause ? smartClamp(String(o.cause), 120) : null, beat: beat ?? o.beat ?? null, day: worldDay,
    ...(o.name ? { name: smartClamp(String(o.name), 80) } : {}), ...(o.pos ? { pos: o.pos } : {}), ...(o.kind ? { kind: String(o.kind) } : {}),
  }, { content, worldDay, recordOf, exists, regionId });
}

export function repairFraction(content, state) {
  const c = content?.mapStates?.repairCost || {};
  const v = Number(c[state]);
  return Number.isFinite(v) ? v : (state === "destroyed" ? 1 : 0);
}

/* ═════ SNG-679 PART R · R1 + R2: NOTHING MENDS ITSELF, AND THE LOCALS MEND WHAT THEY CAN, AT A PACE ═════
 * ✅ ERIK: *"One world. If you burn a bridge someone must repair or rebuild it. Either the locals — and they'll try to track
 * you down — or a player (who may be rewarded)."* ✅ AEVI (R1): *"There is no timer that restores it."* (R2): *"They start
 * `repair.localsBeginAfterDays` after the change, and take `repair.localDays[state]` to bring it to whole."*
 * ⛔ THE WORK IS A CHANGE, NOT A TIMER. The fold has no clock in it and never will (R1); the locals' work is a `repaired`
 * event written through the one door, by `"locals"`, on the day the work finishes. ⛑ DERIVED, SO IT IS ONE WORLD: the day
 * comes from the record's own `since` and the content's pace, and the event id from `{key, change, worldDay, by}` — so every
 * game that reaches that day writes the SAME event, and the fold takes it once.
 * ⚑ A REPAIR CLIMBS ONE RUNG, so a ruined bridge (45 days) is damaged after 33 and whole after 45: each rung is reached at
 * `localDays[from] − localDays[to]` days of work, and only the first step waits `localsBeginAfterDays` to begin. */
function willNotMatch(entry, cls, state) {
  const [c0, s] = String(entry || "").split(":");
  // ⚠️ content says `waygate:destroyed`; the class a map key carries is `gate` — the same thing, two words
  const c = c0 === "waygate" ? "gate" : c0;
  return c === cls && (!s || s === state);
}
/** Whether the locals will mend this key in this state (`repair.localsWillNot`, and a hold's or a feature's is its keeper's). */
export function localsWillMend(key, state, content) {
  const parsed = parseMapKey(key);
  if (!parsed || parsed.row.onRecord || parsed.row.noRepair) return false;
  if (!parsed.row.allows.includes("repaired")) return false;
  const not = content?.mapStates?.repair?.localsWillNot || [];
  return !not.some((n) => willNotMatch(n, parsed.cls, state));
}
/** When the locals' next step of work lands on a key, or null: `{ day, from, to, start, wholeDay }`. Pure. */
export function nextLocalRepair(record, key, content) {
  const R = content?.mapStates?.repair;
  if (!R || !record) return null;
  const l = ladderOf(content), st = String(record.state || l[0]);
  if (rungOf(content, st) === 0) return null;
  if (!localsWillMend(key, st, content)) return null;
  const days = R.localDays || {};
  const total = Number(days[st]);
  if (!Number.isFinite(total) || total <= 0) return null;
  const to = l[Math.max(0, rungOf(content, st) - 1)];
  const rest = rungOf(content, to) === 0 ? 0 : (Number(days[to]) || 0);
  // the locals' own step does not wait again; anything else (a fresh burning, a player's half-mend) does
  const start = (Number(record.since) || 0) + (record.by === "locals" ? 0 : (Number(R.localsBeginAfterDays) || 0));
  return { day: Math.floor(start + Math.max(1, total - rest)), from: st, to, start, wholeDay: Math.floor(start + total) };
}
/** Where the locals' work stands on a key at a day: `{ mending, progress (toward whole, 0–1), wholeDay }`, or null. */
export function localRepairAt(record, key, worldDay, content) {
  const nx = nextLocalRepair(record, key, content);
  if (!nx || worldDay == null || !Number.isFinite(Number(worldDay))) return null;
  const d = Number(worldDay);
  if (d < nx.start) return { mending: false, progress: 0, beginsDay: Math.ceil(nx.start), wholeDay: nx.wholeDay };
  return { mending: true, progress: Math.max(0, Math.min(1, (d - nx.start) / Math.max(1, nx.wholeDay - nx.start))), wholeDay: nx.wholeDay };
}
/** ⛔ THE LOCALS' PASS — the world tick's. Every step of work due by `worldDay`, on every world key this save holds, written
 *  through the one door by "locals" on the day it finished. Returns `[{ key, from, to, day, whole }]`. */
export function localsMendPass(character, { content = null, worldDay = null } = {}) {
  if (!character || worldDay == null || !Number.isFinite(Number(worldDay)) || !content?.mapStates?.repair) return [];
  const keys = new Set([...(character.mapEvents || []).map((e) => e?.key), ...Object.keys(character.worldMapStore?.keys || {})].filter(Boolean));
  const out = [];
  for (const key of keys) {
    for (let k = 0; k < 4; k++) {
      const nx = nextLocalRepair(mapStateOf(character, key, { content }), key, content);
      if (!nx || nx.day > Number(worldDay)) break;
      const r = applyMapChange(character, { key, change: "repaired", by: "locals", cause: "the locals' work" }, { content, worldDay: nx.day });
      if (!r.ok) break;
      out.push({ key, from: nx.from, to: r.state, day: nx.day, whole: rungOf(content, r.state) === 0 });
    }
  }
  return out;
}
/** The words for a key: `{ place, thing }` — the place it is at and the thing itself, for `reckoning.words`. */
export function mapThingOf(key, content, { siteName = null, from = null } = {}) {
  const p = parseMapKey(key);
  if (!p) return null;
  const L = content?.locations || {};
  const nm = (id) => L[id]?.name || String(id || "").replace(/^gen-/, "").replace(/[-_]+/g, " ");
  const plain = (s) => String(s || "").replace(/^the\s+/i, "");
  if (p.cls === "site") {
    const authored = (content?.rules?.localLayouts?.[p.id]?.sites || []).find((s) => s.id === p.sub)?.name;
    return { place: nm(p.id), thing: plain(siteName || authored || String(p.sub).replace(/[-_]+/g, " ")) };
  }
  // a road is named from the end it is seen from: Millbrook's "road to Echo River Crossing", not the other way about
  if (p.cls === "road") { const [a0, b0] = p.rest.split("|"); const [a, b] = from === b0 ? [b0, a0] : [a0, b0]; return { place: nm(a), thing: `road to ${nm(b)}` }; }
  if (p.cls === "gate") return { place: nm(p.id), thing: "gate" };
  if (p.cls === "water") return { place: nm(p.id), thing: "water" };
  if (p.cls === "ground") return { place: nm(p.id), thing: "ground" };
  return null;   // a place, a hold, a feature, a region — no "the {thing} at {place}" form in the words
}

/* ═════ SNG-679 S7 · WHAT THE CHARACTER KNOWS ═════
 * ✅ AEVI: *"The world is shared, but knowledge isn't. The map shows the state the character has learned, not the state the world
 * holds. A change carries `beat`, and the character learns of it by: being there; being told (a GM line naming it); a relay or hold
 * report; word of it … for anything at `ruined` or worse, which reaches characters within a few days' travel of it. Until then their
 * map shows the old state, and the card says `knowledge.lastKnown`."*
 * ⛔ THE TRUTH STILL RULES THE WORLD. Only what is DRAWN is the learned state: a road ruined in another game still costs the journey
 * that walks it (S6 reads `mapStateOf`, the truth), and the character finds out by walking it.
 * ⛑ WHAT THIS GAME WROTE IS KNOWN: its own events — the character's deeds, the GM's lines in its scenes, its jobs. Only what another
 * game wrote, adopted through the shared store, waits to be learned.
 * ⚠️ "Word of it" is DERIVED from the shared events, not posted to `world/feed.json`: the feed is the players' scrapbook, and its own
 * guard is that it is "never an auto-log". The word walks: learned once the days a walk from the place would take have passed.
 * ✅ AEVI 2026-10-08 (answers to R5–S8): *"Word of mending travels exactly as word of ruin does: the same 3 days' reach and the same
 * delay. It reaches only a character who knows the thing as broken, because nobody passes on 'the Wheels are fine'. Otherwise a near
 * character sees the Wheels ruined for good, which is the stale map S7 exists to prevent. The card's words when it lands: 'mended,
 * by word'."* ⛑ "Knows it as broken" is the state they have LEARNED, read at the moment the word would land — so a ruin and its
 * mending that both walk in on one tick arrive in their order, the ruin first. */
export const WORD_WITHIN_DAYS = 3;
/** ✅ S8: *"Cap it at 0.5 days from the old point."* */
export const MOVE_CAP_DAYS = 0.5;
const WORD_OF = new Set(["ruined", "destroyed"]);
/** ✅ Aevi: word of MENDING carries too — but only to someone who knows the thing as broken. */
const WORD_OF_MENDING = new Set(["repaired"]);
const byDay = (a, b) => (Number(a?.day) || 0) - (Number(b?.day) || 0);
/** Whether the character has learned this key to be anything but whole. */
function knowsBroken(character, key, content) {
  const s = knownStateOf(character, key, { content })?.state;
  return !!s && s !== ladderOf(content)[0];
}
/** The places a key is at (a road has two ends; a hold, a feature and a region are nobody's place). */
export function placesOfKey(key) {
  const p = parseMapKey(key);
  if (!p || p.row.onRecord || p.cls === "region") return [];
  return p.cls === "road" ? p.rest.split("|") : [p.id];
}
/** Whether this character knows of an event: their own game wrote it, it is theirs, or they learned it. */
export function eventKnown(character, e) {
  if (!e?.id) return false;
  // ⚠️ THE LOCALS' WORK IS WRITTEN BY EVERY GAME'S TICK, so "this game wrote it" would hand every character every mending in the world.
  // It is the world's, and learned like the world's.
  if (e.by === "locals") return !!character?.mapLearned?.[e.id];
  if ((character?.mapEvents || []).some((x) => x?.id === e.id)) return true;
  if (e.by && character?.id && e.by === character.id) return true;
  return !!character?.mapLearned?.[e.id];
}
/** The state the character has LEARNED a key to be in — the fold of the events they know. A thing on its owner's record (a hold) is
 *  the owner's to know, and reads as it is. */
export function knownStateOf(character, key, { content = null, recordOf = null } = {}) {
  const parsed = parseMapKey(key);
  if (!parsed || parsed.row.onRecord || !character) return mapStateOf(character, key, { content, recordOf });
  const ev = eventsFor(character, key).filter((e) => eventKnown(character, e));
  if (!ev.length) return { state: ladderOf(content)[0], since: null, by: null, seen: null, cause: null, beat: null, history: [] };
  return foldKey(ev, content);
}
/** Whether the world holds a change at this key the character has not learned. */
export function hasUnlearned(character, key) {
  const parsed = parseMapKey(key);
  if (!parsed || parsed.row.onRecord || !character) return false;
  return eventsFor(character, key).some((e) => !eventKnown(character, e));
}
/** ⛔ THE LEARNING PASS — the world tick's. Each change another game wrote that this character has not learned is learned: by being
 *  THERE (a key at the place they stand), by a hold's REPORT (a key at a place they keep a hold), or by WORD of it (ruined or worse,
 *  or a mending of a thing they know as broken, within `WORD_WITHIN_DAYS` of where they are, once the walk from there has had time).
 *  Mutates `character.mapLearned`. → `[{ key, id, how, change, by }]` */
export function learnMapEvents(character, { content = null, worldDay = null, locations = null } = {}) {
  const out = [];
  if (!character) return out;
  const L = locations || content?.locations || {};
  const here = character.currentLocationId || null;
  const holds = new Set((character.holdings || []).map((h) => h?.locationId).filter(Boolean));
  const keys = new Set([...(character.mapEvents || []).map((e) => e?.key), ...Object.keys(character.worldMapStore?.keys || {})].filter(Boolean));
  for (const key of keys) {
    const places = placesOfKey(key);
    if (!places.length) continue;
    for (const e of [...eventsFor(character, key)].sort(byDay)) {
      if (eventKnown(character, e)) continue;
      let how = null;
      if (here && places.includes(here)) how = "there";
      else if (places.some((p) => holds.has(p))) how = "report";
      else if (worldDay != null && here && L[here]
        && (WORD_OF.has(String(e.change)) || (WORD_OF_MENDING.has(String(e.change)) && knowsBroken(character, key, content)))) {
        let d = Infinity;
        for (const p of places) if (L[p]) { const w = walkingDays(L[p], L[here]); if (Number.isFinite(w) && w < d) d = w; }
        if (d <= WORD_WITHIN_DAYS && Number(worldDay) >= Number(e.day || 0) + d) how = "word";
      }
      if (!how) continue;
      character.mapLearned = character.mapLearned && typeof character.mapLearned === "object" ? character.mapLearned : {};
      character.mapLearned[e.id] = { day: worldDay != null ? Math.floor(Number(worldDay)) : null, how };
      out.push({ key, id: e.id, how, change: e.change || null, by: e.by || null });
    }
  }
  return out;
}

/* ═════ SNG-679 S8 · ADDING, AND THE CASES THAT NEED RULES (first half) ═════
 * ✅ AEVI: *"Adding a site or ground takes `{ bearing, fromMetres }` or `{ toward: <placeId>, near|far }`, the same shapes local_layouts
 * uses. The new thing joins the layout as an overlay entry; content isn't edited. Adding water is a cut channel, `{ bearing, fromMetres,
 * widthMetres, flowBearing }`, drawn like extent water. Turning a river (`moved`) re-routes its local channel at the places on it."*
 * ⛔ AN OVERLAY, NEVER AN EDIT: the added things are folded out of the events every time a layout is asked for, so a game that has
 * not learned of a new shrine does not draw it (S7), and content stays the authored truth. */
const num0 = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
export function addedPosProblem(cls, pos) {
  const p = pos && typeof pos === "object" ? pos : null;
  if (!p) return `an added ${cls} has to say where — { bearing, fromMetres }${cls === "water" ? ", widthMetres, flowBearing" : " or { toward, near|far }"}`;
  if (cls === "water") return [p.bearing, p.fromMetres, p.widthMetres, p.flowBearing].every((v) => num0(v) != null) ? null
    : "a cut channel says { bearing, fromMetres, widthMetres, flowBearing }";
  if (num0(p.bearing) != null && num0(p.fromMetres ?? p.metres) != null) return null;
  if (p.toward && (p.near || p.far || ["on", "near", "far", "away"].includes(String(p.relation || "")))) return null;
  return `an added ${cls} says { bearing, fromMetres } or { toward, near|far }`;
}
/** A `toward` placement read against the layout's own roads: on the way, beside it, further out along it, or away from it. */
function resolveToward(pos, layout) {
  const road = (layout?._measured?.roadsOut || []).find((r) => r?.to === pos.toward);
  const built = (layout?.extent || []).find((f) => f?.kind === "built");
  const R = Number(built?.radiusMetres) || (Number(layout?.radiusMetres) || 300) * 0.4;
  const rel = pos.relation || (pos.far ? "far" : pos.near ? "near" : "near");
  const b = Number(road?.bearing ?? 0);
  if (rel === "on") return { bearing: Math.round(b), metres: Math.round(R * 0.8) };
  if (rel === "away") return { bearing: Math.round(((b + 360) % 360) - 180), metres: Math.round(R * 0.9) };
  if (rel === "far") return { bearing: Math.round(b + 12), metres: Math.round(R * 1.6) };
  return { bearing: Math.round(b + 18), metres: Math.round(R * 0.7) };   // near: beside the way, set back (Mara Wells' store sits 18° off)
}
/** ⛔ THE OVERLAY: the place's layout with everything added to it that this character KNOWS of (S7) — sites, ground, cut channels — and
 *  its own water turned where a `moved` says so. Destroyed additions are not drawn (their trace is S5's). Pure over the inputs. */
export function overlayAdded(layout, placeId, character, { content = null } = {}) {
  if (!layout || !placeId || !character) return layout;
  const keys = new Set([...(character.mapEvents || []).map((e) => e?.key), ...Object.keys(character.worldMapStore?.keys || {})]
    .filter((k) => typeof k === "string" && (k.startsWith(`site:${placeId}/`) || k.startsWith(`ground:${placeId}/`) || k.startsWith(`water:${placeId}/`))));
  if (!keys.size) return layout;
  const named = new Set((layout.sites || []).map((s) => s?.id));
  const sites = [], extent = [], turns = [];
  for (const key of keys) {
    const p = parseMapKey(key);
    const st = knownStateOf(character, key, { content });
    if (p.cls === "water" && st.pos && Number.isFinite(Number(st.pos.flowBearing)) && !st.added) { turns.push({ n: Number(p.sub), pos: st.pos }); continue; }
    if (!st.added || st.state === "destroyed") continue;
    const pos = st.added.pos || st.pos || {};
    if (p.cls === "site") {
      if (named.has(p.sub)) continue;   // an authored or remembered site of that id is already drawn
      const at = pos.toward ? resolveToward(pos, layout) : { bearing: Number(pos.bearing), metres: Number(pos.fromMetres ?? pos.metres) };
      sites.push({ id: p.sub, name: st.name || st.added.name || String(p.sub).replace(/[-_]+/g, " "), kind: st.added.kind || "hall", localMap: at, added: true, generated: true,
        placedBecause: `added on day ${Math.floor(Number(st.added.day) || 0)}` });
    } else if (p.cls === "ground") {
      const at = pos.toward ? resolveToward(pos, layout) : { bearing: Number(pos.bearing), metres: Number(pos.fromMetres ?? pos.metres) };
      const kind = { planted: "field", drained: "field", cleared: "clearing" }[st.added.kind] || "field";
      extent.push({ id: `${placeId}:added:${p.sub}`, name: st.name || st.added.name || null, kind, bearing: at.bearing, fromMetres: at.metres, radiusMetres: Number(pos.radiusMetres) || 90, added: true,
        addedDay: Number.isFinite(Number(st.added.day)) ? Number(st.added.day) : null });   // ⛑ CCODE-691: the frame it was laid out in
    } else if (p.cls === "water") {
      extent.push({ id: `${placeId}:cut:${p.sub}`, name: st.name || st.added.name || null, kind: "water", bearing: Number(pos.bearing), fromMetres: Number(pos.fromMetres),
        widthMetres: Number(pos.widthMetres), flowBearing: Number(pos.flowBearing), added: true, cut: true,
        addedDay: Number.isFinite(Number(st.added.day)) ? Number(st.added.day) : null });   // ⛑ CCODE-691
    }
  }
  if (!sites.length && !extent.length && !turns.length) return layout;
  // a river turned: the n-th water feature of the place's own extent takes the new course
  let wi = -1;
  const base = (layout.extent || []).map((f) => {
    if (f?.kind !== "water") return f;
    wi++;
    const t = turns.find((x) => x.n === wi);
    return t ? { ...f, ...(Number.isFinite(Number(t.pos.bearing)) ? { bearing: Number(t.pos.bearing) } : {}), ...(Number.isFinite(Number(t.pos.fromMetres)) ? { fromMetres: Number(t.pos.fromMetres) } : {}), flowBearing: Number(t.pos.flowBearing), turned: true } : f;
  });
  return { ...layout, extent: [...base, ...extent], sites: [...(layout.sites || []), ...sites] };
}

/* ═════ SNG-679 S8 · THE SECOND HALF: A PLACE MOVED, A ROAD OPENED ═════
 * ✅ AEVI: *"Moving a fixed place … writes `pos`. Its layout keeps its sites, drops its water and ground, re-derives them by L3 at the new
 * point, and leaves a trace at the old one. Its roads re-measure live. … Adding a road between two places adds a live connection (M3's
 * 'road opened'). It is routed by CCODE-626's router like any other road."*
 * ⛔ THE LIVE LOCATIONS, AND THEY ARE THE CHARACTER'S: the content's locations with every move and every road opened that this character
 * KNOWS of (S7) laid over them — and the moving places (H5) where they are today. Journeys, the network and the globe read these, so a
 * road opened is walked and drawn, and a village moved above the flood line is reached where it now stands. Content is never edited.
 * ⛑ Memoised by what can change them (the save's world revision, what it has learned, the day), because the globe asks every frame. */
let _live = { loc: null, ch: null, key: null, out: null };
export function liveLocations(character, locations, { content = null, worldDay = null } = {}) {
  if (!locations) return locations;
  const key = `${character?.id || ""}|${character?.worldRevision || 0}|${Object.keys(character?.mapLearned || {}).length}|${(character?.mapEvents || []).length}|${Object.keys(character?.worldMapStore?.keys || {}).length}|${worldDay == null ? "-" : Math.floor(Number(worldDay))}`;
  if (_live.loc === locations && _live.ch === character && _live.key === key) return _live.out;
  let out = null;
  const copy = (id) => { out = out || { ...locations }; if (out[id] === locations[id]) out[id] = { ...locations[id] }; return out[id]; };
  if (character) {
    const keys = new Set([...(character.mapEvents || []).map((e) => e?.key), ...Object.keys(character.worldMapStore?.keys || {})]
      .filter((k) => typeof k === "string" && (k.startsWith("place:") || k.startsWith("road:"))));
    for (const k of keys) {
      const p = parseMapKey(k);
      if (!p) continue;
      const st = knownStateOf(character, k, { content });
      if (p.cls === "place" && st.pos && Number.isFinite(Number(st.pos.colatitude)) && locations[p.id] && !locations[p.id].carriage?.circuit) {
        const l = copy(p.id);
        l.movedFrom = { ...(locations[p.id].worldPos || {}) };
        l.worldPos = { ...(locations[p.id].worldPos || {}), colatitude: Number(st.pos.colatitude), longitude: Number(st.pos.longitude) };
      }
      if (p.cls === "road" && st.added && st.state !== "destroyed") {
        const [a, b] = p.rest.split("|");
        if (!locations[a] || !locations[b]) continue;
        const la = copy(a), lb = copy(b);
        la.connections = [...new Set([...(la.connections || []), b])];
        lb.connections = [...new Set([...(lb.connections || []), a])];
        (la.opened = la.opened || []).push(b); (lb.opened = lb.opened || []).push(a);
      }
    }
  }
  if (worldDay != null) for (const [id, l] of Object.entries(locations)) {
    if (!l?.carriage?.circuit) continue;
    const live = positionedPlace(locations, id, { worldDay });
    if (live?.circuitAt) { const c = copy(id); c.worldPos = { ...live.worldPos }; c.circuitAt = live.circuitAt; }
  }
  _live = { loc: locations, ch: character, key, out: out || locations };
  return _live.out;
}
