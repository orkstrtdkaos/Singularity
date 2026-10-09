/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
 * realms.js — WHO HOLDS GROUND, AS THINGS STAND TODAY
 *
 * ✅ ERIK, 2026-10-04: *"Make sure changes to power sources and local lords and powers are able to be reflected
 * in the map. I want to see how far the band of the Fell Pell's holds provide influence in their local areas.
 * This is the reason we had decided the watch and patrolling were more than just seeing a raid. Plus territory
 * should grow with influence and army size that is able to exert that influence."*
 *
 * ⛔ THIS IS THE RESOLVER, AND `influence.js` IS THE EVALUATOR. Aevi's round-4 rule: *"the caller hands
 * `makeInfluence` / `territoryByGround` powers as they stand for this character … The evaluator stays pure and
 * imports nothing."* So every read of the SAVE happens here, and `influence.js` keeps knowing nothing about
 * characters, holdings, bands or gates. That split is the reason the GM, the globe and the region map can all
 * ask the same question without a painter or a save-shape in the room.
 *
 * ⚠️ WITHOUT THIS FILE THE MAP DREW DAY ONE FOREVER. `influence.js` reads `p.strength.contingents`, which is the
 * AUTHORED strength; everything that has happened in play lives on the save. A power the player had bled, grown
 * or broken looked exactly as it did before they touched it.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */

import { powersFrom, contingentsOf, isStanding, powerStateOf, foesOf, headsOf as headsOfContingents } from "./powers.js";
import { watchOf, featuresOf, featureDef } from "./holdings.js";
import { gatesHeldBy, gateHeldByPower } from "./gatehold.js";
import { REACH, radiusDegOf, ANCHOR_WEIGHT, isTerritorial } from "./influence.js";

/** The weight an emptied hold carries: its own doorstep and no further. */
export const EMPTY_HOLD = 0.3;
/** Each pair of eyes widens a hold's reach by this much, to this cap. ⛑ R4.2: *"the watch is the reach."* */
export const WATCH_LIFT = 0.15, WATCH_CAP = 1.6;
/** ⛔ THE DOORSTEP — the ground a hold holds by standing on it, before anybody is counted.
 *
 *  ⚠️ WITHOUT IT, `EMPTY_HOLD` WAS ATTACHED TO AN INERT ANCHOR. The reach curve has no floor for a hold
 *  (R4.4, correctly: a hold is not a crown and must not borrow ten imagined heads), so a hold with nobody in it
 *  came out at radius **0** — and the watch lift is multiplicative, so a tower on an empty hold multiplied zero
 *  and still saw nothing. The 0.3 "its own doorstep" weight had nothing to weigh.
 *  ⛑ Found by driving the tower case for §416: the eyes counted 1 against 0 exactly as they should, and both
 *  radii came back 0.0000.
 *  ⚠️ IT IS A DIAL AND AEVI'S TO RULE. 0.06° is about seven kilometres — a hold, its yard and its fields, and
 *  nothing anybody would call a country. It changes no hold that has people in it: every one of Silas's five
 *  has heads, so its own reach is larger and this floor never binds. */
export const DOORSTEP_DEG = 0.06;

const headsRecord = (n) => ({ strength: { contingents: [{ n: Math.max(0, Number(n) || 0) }] } });

/** ⛔ R4.1 — THE POWERS AS THEY STAND FOR THIS CHARACTER, ready to hand straight to either reader.
 *
 *  | what happened in play | what this does |
 *  |---|---|
 *  | lost people, or grew  | radius from `contingentsOf`, not from the authored record |
 *  | broken                | dropped entirely — it holds no ground |
 *  | a hold changed hands  | that hold stops being its anchor (it is the player's now, via `realmsOf`) |
 *  | a garrison ground down| that hold's anchor falls to the empty weight |
 *  | a gate seized         | the gate's place becomes a hold anchor of whoever holds it |
 *
 *  ⚠️ THE AUTHORED RECORD IS NEVER MUTATED. Every power comes back as a copy; `contingentsOf` already works
 *  this way and this keeps that promise one layer up. */
export function resolvedPowers(character, content, { standingOnly = true } = {}) {
  const all = powersFrom(content) || [];
  const out = [];
  for (const p of all) {
    if (!p?.id) continue;
    if (standingOnly && !isStanding(character, p)) continue;
    const st = powerStateOf(character, p.id) || {};
    const live = contingentsOf(p, character);
    const taken = new Set(Object.keys(st.holdsTaken || {}));
    const ground = new Set(Object.keys(st.holdLost || {}));

    const anchors = [];
    const seen = new Set();
    const add = (at, kind, w) => {
      if (!at || seen.has(at + kind)) return;
      seen.add(at + kind);
      anchors.push({ at, kind, w });
    };
    add(p.seat, "seat", ANCHOR_WEIGHT.seat);
    (p.holds || []).forEach((h, i) => {
      const at = h?.at;
      if (!at) return;
      // ⛔ a hold the player has taken is no longer this power's anchor at all
      const key = `${p.id}:${i}`;
      if (taken.has(at) || taken.has(key)) return;
      // ⚠️ …and one whose garrison was ground down keeps the place without the reach
      const emptied = ground.has(at) || ground.has(key);
      add(at, "hold", emptied ? EMPTY_HOLD : ANCHOR_WEIGHT.hold);
    });
    // ⛑ a gate this power holds is a hold anchor of whoever holds it (gatehold.js is the one reader)
    const gate = gateHeldByPower(p, character);
    if (gate) add(gate, "hold", ANCHOR_WEIGHT.hold);
    for (const r of p.reach || []) add(r, "reach", ANCHOR_WEIGHT.reach);

    out.push({ ...p, strength: { ...(p.strength || {}), contingents: live }, anchors });
  }
  return out;
}

/** ⛔ R4.2 — A PLAYER'S HOLDS AND BANDS ARE A REALM, evaluated by the same rule as every lord in the world.
 *  Erik asked to *"see how far the band of the Fell Pell's holds provide influence in their local areas"*, and
 *  the honest way to answer that is to make the Fellowship a power rather than to special-case the player.
 *
 *  ⛑ THE ARMY REACHES FROM HOME. `band.from` is the seat and reaches with the WHOLE band — it can march from
 *  there. Every other hold reaches with the hands actually standing in it.
 *  ⚠️ AND THE WATCH IS THE REACH. This is the thing Erik said the watch was FOR: *"this is the reason we had
 *  decided the watch and patrolling were more than just seeing a raid."* Eyes at a hold widen its radius by
 *  15% each, capped at ×1.6. Empty the watch and the ground shrinks back to the walls. */
export function realmsOf(character, locations = {}, cfg = null) {
  const holds = Array.isArray(character?.holdings) ? character.holdings : [];
  if (!holds.length) return [];
  const bands = Array.isArray(character?.bands) ? character.bands : [];

  // heads raised AT each hold, and the whole of each band, from the one place that records it
  const atHold = new Map(), bandAt = new Map();
  for (const b of bands) {
    let whole = 0;
    for (const c of b?.contingents || []) {
      const n = Math.max(0, Number(c?.n) || 0);
      whole += n;
      // ⚠️ a contingent with no `from` was raised with the band itself, so it belongs to the band's home
      const at = c?.from || b?.from || null;
      if (at) atHold.set(at, (atHold.get(at) || 0) + n);
    }
    if (b?.from) bandAt.set(b.from, Math.max(bandAt.get(b.from) || 0, whole));
  }

  const gates = gatesHeldBy(character);
  const anchors = [];
  const rows = [];
  // ⚠️ A HOLD WHOSE PLACE IS NOT IN `locations` IS REPORTED, NOT DROPPED. Two of Silas's five holds sit at
  // GROWN places (`gen-…`), which live on the save and are merged into the content pools at runtime — so a
  // caller handed authored locations alone silently loses them, and the realm quietly shrinks by 40% with
  // nothing on screen to say why. `unplaced` is the complement every scorer owes its hits list.
  const unplaced = [];
  for (const h of holds) {
    const at = h?.locationId;
    if (!at) continue;
    if (!locations[at]) { unplaced.push({ hold: h.id, name: h.name || h.id, at }); continue; }
    const isSeat = bandAt.has(h.id);
    // the seat fields the whole band; everywhere else fields what is standing there
    const raised = atHold.get(h.id) || 0;
    const garrison = Array.isArray(h.garrison) ? h.garrison.length : 0;
    const heads = isSeat ? Math.max(bandAt.get(h.id) || 0, raised + garrison) : raised + garrison;
    const eyes = watchOf(h, cfg).length + senseOnly(h, cfg);
    // ⛔ floor 0: a hold is not a crown. An emptied outpost reaches its doorstep, not ten imagined heads.
    // ⛔ floor 0 on the HEADS (a hold is not a crown), then a floor on the GROUND (a hold stands somewhere)
    const base = Math.max(DOORSTEP_DEG, radiusDegOf(headsRecord(heads), { floor: 0 }));
    const r = base * Math.min(WATCH_CAP, 1 + WATCH_LIFT * eyes);
    const w = isSeat ? ANCHOR_WEIGHT.seat : (heads > 0 || eyes > 0) ? ANCHOR_WEIGHT.hold : EMPTY_HOLD;
    anchors.push({ at, kind: isSeat ? "seat" : "hold", w, r });
    rows.push({ hold: h.id, name: h.name || h.id, at, heads, eyes, seat: isSeat, radiusDeg: r });
  }
  // ⛑ a gate you hold is ground you hold, the same as it is for a power (R4.1)
  for (const at of Object.keys(gates)) {
    if (!locations[at] || anchors.some((a) => a.at === at)) continue;
    const r = DOORSTEP_DEG;
    anchors.push({ at, kind: "hold", w: EMPTY_HOLD, r });
    rows.push({ hold: null, name: locations[at]?.name || at, at, heads: 0, eyes: 0, seat: false, gate: true, radiusDeg: r });
  }
  if (!anchors.length) return unplaced.length ? [{ id: `realm:${character?.id || "you"}`, name: "", kind: "lordship", yours: true, anchors: [], holds: [], unplaced, strength: { contingents: [] } }] : [];

  const name = bands[0]?.name || `${character?.name || "your"}'s holdings`;
  return [{
    id: `realm:${character?.id || "you"}`,
    name,
    kind: "lordship",                 // ⛑ the evaluator's own word, so there is no special case downstream
    yours: true,
    playerKey: character?.playerKey || null,
    characterId: character?.id || null,
    reachFloor: 0,
    anchors,
    holds: rows,
    unplaced,
    strength: { contingents: [{ n: rows.reduce((n, r) => n + r.heads, 0) }] },
  }];
}

/** ⛔ Features that watch without anybody standing in them — the tower sees, and `watchOf` does not count it.
 *
 *  ✅ AEVI, correcting her own R4.2 wording: *"R4.2 said `sense` features, and I should have written it as the
 *  field it is. The tag is `property: \"sense\"`."* (SNG-627, ✅ ERIK 2026-09-18: *"a watchtower and scouts are
 *  both `sense`."*) Three kinds carry it — `watch` and `sentries`, which are already `watch: true` and so already
 *  counted, and `tower`, which is not.
 *
 *  ⚠️ I HAD READ `def.sense`, A FIELD NO KIND CARRIES, so this returned 0 for every hold in the world and the
 *  clause added nothing. It was the ONE number her independent mock and this engine disagreed about — driven on
 *  Silas's save we matched on 9 of 10 figures across five holds, and the tenth was Stillwater's Trouble, which
 *  has a tower: 4 eyes here against her 5. Two implementations differing by exactly one is a better bug report
 *  than either of us reading our own code again. */
function senseOnly(holding, cfg) {
  let n = 0;
  for (const f of featuresOf(holding) || []) {
    const def = featureDef(f.kind, cfg);
    if (def?.property === "sense" && !def?.watch) n += Math.max(1, Number(f.count) || 1);
  }
  return n;
}

/** ⛔ R4.3, ✅ ERIK 2026-10-04: *"Some alliances are obvious… Others… are ok to be assumed neutral to each other
 *  unless they clash. This will be fertile ground for alliances, trade, vassals, betrayals and narratives."*
 *
 *  ⚠️ NEUTRAL IS THE DEFAULT, AND THAT IS THE WHOLE RULING. Before this, every overlap was a winner and a stripe,
 *  which painted every pair of neighbours as at war. A rivalry now has to be EARNED — by blood, by a hold taken,
 *  by a standing gone sour, or by content saying so outright.
 *
 *  ⛑ Not named `relationOf`: `presence.js` already has one, about how far above you somebody's band sits. Two
 *  functions with one name and different questions is how a call site ends up answering the wrong one. */
export function powerRelation(a, b, character, { content = null, allPowers = null } = {}) {
  if (!a?.id || !b?.id || a.id === b.id) return "self";
  // two characters of one player are not strangers to each other
  if (a.yours && b.yours) return "ally";

  const clash = (x, y) => {
    // one of the pair is the player's realm: read the player's own history with the other
    const them = x.yours ? y : x;
    if (!x.yours && !y.yours) return null;
    const st = powerStateOf(character, them.id) || {};
    if (Number(st.standing) < 0) return "rival";
    if (Number(st.lost) > 0 || Number(st.lostToYou) > 0) return "rival";
    if (st.lost && typeof st.lost === "object" && Object.keys(st.lost).length) return "rival";
    if (st.holdLost && Object.keys(st.holdLost).length) return "rival";
    if (st.holdsTaken && Object.keys(st.holdsTaken).length) return "rival";
    if (st.raidedYou) return "rival";
    if (Number(st.standing) > 0) return "ally";
    // ⛑ the band carrying one of their people is an alliance you can see on the roster
    if (carriesTheirs(character, them)) return "ally";
    return "neutral";
  };

  const byPlay = clash(a, b);
  if (byPlay) return byPlay;

  // ⛔ neither is the player's: content's own word is the only clash on record
  const pool = allPowers || (content ? powersFrom(content) : []);
  if (foesOf(a, pool).some((q) => q.id === b.id)) return "rival";
  return "neutral";
}

/** Does the character's band carry one of this power's people? */
function carriesTheirs(character, power) {
  const theirs = new Set([
    ...(Array.isArray(power?.people) ? power.people : []),
    ...(Array.isArray(power?.notables) ? power.notables : []),
  ].filter(Boolean));
  if (!theirs.size) return false;
  for (const b of character?.bands || []) {
    for (const c of b?.contingents || []) if (c?.npcId && theirs.has(c.npcId)) return true;
  }
  for (const id of character?.companions || []) if (theirs.has(id?.id || id)) return true;
  return false;
}

/** ⛔ R4.1 — THE CACHE STAMP. The territory grid is cached per region; without this in its key the picture
 *  changes a session after the world does, which is the kind of staleness nobody reports as a bug because it
 *  just looks like the map being wrong about something.
 *  ⚠️ CHEAP ON PURPOSE: it is summed per paint, so it counts rather than hashes. */
export function stateStamp(character, powers = []) {
  let heads = 0, marks = 0;
  for (const p of powers) {
    heads += headsOfContingents(p?.strength?.contingents || []);
    const st = powerStateOf(character, p?.id) || {};
    marks += Object.keys(st.holdsTaken || {}).length + Object.keys(st.holdLost || {}).length
      + (st.broken ? 1 : 0) + (st.gateHeld ? 1 : 0) + (Number(st.standing) || 0);
  }
  const holds = Array.isArray(character?.holdings) ? character.holdings : [];
  let eyes = 0;
  for (const h of holds) eyes += (Array.isArray(h?.garrison) ? h.garrison.length : 0);
  const bandHeads = (character?.bands || []).reduce((n, b) =>
    n + (b?.contingents || []).reduce((m, c) => m + (Number(c?.n) || 0), 0), 0);
  /* ✅ AEVI, M4 (SNG-672, CCODE-712): *"One counter, bumped by any mint, any `placeState` write and any holding change (including a
   * moved `locationId`). The field, `_fieldTex`, `_regionBases` (re-frame when a place falls outside), roads and the territory key all
   * include it."* ⚠️ MEASURED: a hold that only changed `locationId` left this stamp where it was, so territory waited for a reload; and
   * the world revision (bumped by a map change, and now by a mint) was read by nothing outside mapstate. ⛑ Where each hold STANDS is
   * read here rather than counted at every holding writer — the same reason the mint's guard lives at the door: a writer nobody
   * remembered cannot leave the picture stale. */
  const standsAt = holds.map((h) => `${h?.id || ""}@${h?.locationId || ""}`).join(",");
  return `${Math.round(heads)}|${Math.round(marks)}|${holds.length}|${eyes}|${bandHeads}|${Object.keys(gatesHeldBy(character)).length}|${Number(character?.worldRevision) || 0}|${standsAt}`;
}

/** Everything that holds ground, in one list, ready for either reader. */
export function groundHolders(character, content, locations, cfg = null) {
  const powers = resolvedPowers(character, content).filter(isTerritorial);
  const realms = realmsOf(character, locations, cfg);
  return [...powers, ...realms];
}
