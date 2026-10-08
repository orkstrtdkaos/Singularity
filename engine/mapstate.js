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
import { fnvHex } from "./fates.js";   // ⛔ ONE HASH. A second id rule is a second identity for one event.

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
  }
  if (c.change === "moved" && !c.pos) return { ok: false, why: `a move has to say where to` };
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
      if (!added) { added = { day: e.day ?? null, by: e.by ?? null, kind: e.kind ?? null, pos: e.pos ?? null };
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
  const st = mapStateOf(character, key, { content, recordOf }) || { state: ladderOf(content)[0] };
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
    since: st.since ?? null, cause: st.cause ?? null };
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
  if (!seen.some((k) => k.key === key)) return { ok: false, why: `"${key}" is not something the scene can see — the keys it can are listed in the prompt` };
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
