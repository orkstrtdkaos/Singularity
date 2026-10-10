// engine/mapholds.js — SNG-679 H1. ONE HOLD READER FOR THE MAPS.
//
// ✅ ERIK: *"Make sure traveling holds can show up on all the map levels with site details on the local
// level."*
//
// ⛔ WHAT WAS TRUE BEFORE, from Aevi's read of origin: *"NO MAP DRAWS A HOLDING. `character.holdings` is
// read only for framing the world view."* Three renderers, a hundred and fifty places, and the thing the
// player built was on none of them.
//
// ⛔ ONE READER, AND THAT IS THE POINT OF THE TICKET. ✅ Aevi (H1): *"All three tiers read it. Nothing draws
// a hold any other way."* The world map, the region map and the local map each had their own idea of what a
// place was before SNG-677 and it cost three weeks of drift; a hold arriving on all three at once gets one
// source by construction instead.
//
// ⛑ ITS OWN MODULE, AND THE IMPORT GRAPH IS WHY. `worldmap.js` is where the tier readers live
// (`worldTierNodes`, `regionTierNodes`, `locationTierNodes`) and would have been the natural home — but
// `caravan.js` imports `holdings.js`, which imports `worldmap.js`, so a map reader that needs caravans
// cannot live there without a cycle. Measured, not guessed: the graph is in the commit.
//
// ⚠️ PURE. Content, the day, the shared store and the routed roads are injected; nothing here fetches.

import { whereaboutsOf } from "./carriage.js";
import { caravansOf, positionOnRoad } from "./caravan.js";
import { positionedPlace } from "./worldtime.js";
import { mapStateOf, foreignHoldState } from "./mapstate.js";
import { roomOf } from "./holdings.js";
import { roadsOut as bearingsTo } from "./localdetail.mjs";   // ✅ H6: a moving hold's bow faces where she is going, in the local map's own bearings   // ✅ H6: a hold's rung is the larger of the one it was named and the one its features fit

/* A position is only a position if both numbers are real. ⚠️ `Number(null)` is 0 and 0 is a legal
 * colatitude — the Crossing's — so an absent position must be refused by SHAPE and never by value.
 *
 * ⛔ AND IT NORMALISES THE LONGITUDE, BECAUSE THIS READER HAS THREE SOURCES AND THEY DO NOT AGREE.
 * Measured on the first run of this function: The Annex came back at longitude 251.7 and a caravan on the
 * road beside it at −108.0 — the SAME longitude in two conventions. `positionedPlace` hands back the
 * authored `worldPos`, which content stores in 0–360; `worldPosBetween` ends in `Math.atan2`, which returns
 * ±180. Projection happens to survive the difference because `project` only ever feeds it to sin and cos,
 * which are periodic — so this would have shipped looking right and broken the first time anything COMPARED
 * two rows, sorted them, or measured between them.
 * ⚠️ This project has two separate notes about exactly this pair of conventions. A reader that claims to be
 * THE reader cannot hand its callers two of them, so it is settled here, at the one door positions pass
 * through, in ±180 — the convention `unproject` already speaks, since every consumer of these rows is a
 * map. */
function posOf(p) {
  if (!p) return null;
  const c = Number(p.colatitude);
  let l = Number(p.longitude);
  if (!Number.isFinite(c) || !Number.isFinite(l)) return null;
  l = ((l + 180) % 360 + 360) % 360 - 180;
  return { colatitude: c, longitude: l, ...(Number.isFinite(Number(p.depth)) ? { depth: Number(p.depth) } : {}) };
}

/* ═════ H1 · ONE ROW PER HOLD THE CHARACTER CAN KNOW ABOUT ═════
 * ✅ AEVI's row, exactly: `{ key, kind: "hold"|"caravan"|"movingPlace", name, ownerName, rung|frame,
 * atSea|onRoad, worldPos, from, to, fraction, placeId, state }`.
 *
 * ⛔ `state` IS PART S's, NOT `condition`. A hold's `condition` is its FORTUNE — failing to thriving — and
 * its `state` is its FABRIC. ✅ *"a thriving hold can have a burned wall."* Both ride, because a map wants
 * the fabric and a card wants both.
 *
 * ⚑ THE FOURTH SOURCE IS NOT BUILT YET AND SAYS SO. Aevi lists moving places on their circuits as a source
 * of rows, and that is H5: `circuitPosition` does not exist, and three places (the Long Span, the Unlanded,
 * the Wend) carry a `carriage.circuit` no engine code reads. `movingPlace` rows therefore come back EMPTY
 * rather than approximated, and `sources` below says which of the four answered — so a caller can tell an
 * empty list from an unbuilt one, which is the distinction a renderer silently loses.
 *
 * @param sharedStore the published hold cards of other players, as `sharedHolds` holds them
 * @param routes      the routed roads (CCODE-626), so a hull under way is where the map draws her
 */
export function mapHolds(character, { sharedStore = null, locations = {}, worldDay = null,
                                      routes = null, content = null, nameOf = null } = {}) {
  const rows = [];
  const sources = { own: 0, shared: 0, caravan: 0, movingPlace: 0 };
  const nm = (id) => (id && typeof nameOf === "function" ? nameOf(id) : null) || null;

  // ── 1 · the character's own holds ──
  for (const h of (Array.isArray(character?.holdings) ? character.holdings : [])) {
    if (!h?.id) continue;
    // ⛔ WHERE SHE IS, THROUGH THE ONE DOOR. `whereaboutsOf` is H2's reader: a moored hold answers with its
    // own place, one under way with the point the day puts her at. A second position rule here is exactly
    // what H2 existed to remove.
    const w = whereaboutsOf(h, { worldDay, locations, routes });
    const moored = !w.atSea;
    const pos = posOf(w.atSea ? w.worldPos : positionedPlace(locations, h.locationId, { worldDay })?.worldPos);   // H5: a hold at a moving place moves with it
    rows.push({
      key: `hold:${h.id}`, kind: "hold", id: h.id, name: h.name || h.id,
      ownerId: character?.id || null, ownerName: character?.name || null, own: true,
      rung: rungNow(h, content), frame: h.frame || null, condition: h.condition || null,
      state: mapStateOf(character, `hold:${h.id}`, { content, recordOf: () => h }).state,
      atSea: !moored, onRoad: false, worldPos: pos,
      placeId: moored ? (h.locationId || null) : (w.locationId || null),
      from: w.from || null, to: w.to || null, fraction: w.atSea ? w.fraction : null,
      daysOut: w.daysOut ?? null, daysLeft: w.daysLeft ?? null,
      features: (h.features || []).map((f) => ({ id: f?.id || null, name: f?.name || f?.kind || null,
        siteKind: f?.siteKind || null, state: f?.state || "whole" })).filter((f) => f.name),
      site: validSite(h.site),   // ✅ H6: where it stands on its place's local map, once placed
    });
    sources.own++;
  }

  // ── 2 · other players' holds, as far as their cards say ──
  /* ⛔ ONLY WHAT A VISITOR COULD KNOW. ✅ Aevi (H4): *"The card stays 'what a visitor could know': no store,
   * no crew names."* So this reads the published card and never a foreign save — and it must not invent a
   * position either: a card that does not say where she is gets a null, not her port. */
  const shared = sharedStore?.holds && typeof sharedStore.holds === "object" ? Object.values(sharedStore.holds)
    : (Array.isArray(sharedStore) ? sharedStore : []);
  for (const card of shared) {
    if (!card?.id) continue;
    if (card.ownerId && character?.id && card.ownerId === character.id) continue;   // own holds came through above
    rows.push({
      key: `hold:${card.id}`, kind: "hold", id: card.id, name: card.name || card.id,
      ownerId: card.ownerId || null, ownerName: card.ownerName || null, own: false,
      rung: card.rung || null, frame: card.frame || null, condition: card.condition || null,
      // ✅ CCODE-731: what the card says, worsened by any blow its owner's game has not taken in yet — so the one who struck
      // it does not see it standing whole until its owner next plays
      state: foreignHoldState(character, card, content),
      atSea: !!card.atSea, onRoad: false, worldPos: posOf(card.worldPos),
      placeId: card.locationId || null,
      from: card.from || null, to: card.to || null, fraction: card.fraction ?? null,
      daysOut: null, daysLeft: null,
      features: Array.isArray(card.has) ? card.has.map((n) => ({ id: null, name: n, siteKind: null, state: "whole" })) : [],
      site: validSite(card.site),   // ✅ H7: the point its card publishes — the hold, not its rooms
    });
    sources.shared++;
  }

  // ── 3 · caravans under way ──
  for (const car of caravansOf(character)) {
    if (!car?.id) continue;
    const p = positionOnRoad(car, worldDay, locations);
    rows.push({
      key: `caravan:${car.id}`, kind: "caravan", id: car.id,
      name: car.name || `a caravan to ${locations?.[car.to]?.name || car.to || "somewhere"}`,
      ownerId: character?.id || null, ownerName: character?.name || null, own: true,
      rung: null, frame: null, condition: null,
      state: mapStateOf(character, `caravan:${car.id}`, { content, recordOf: () => car }).state,
      atSea: false, onRoad: true, worldPos: posOf(p?.worldPos),
      placeId: p?.placeId || null,
      from: car.from || (car.path || [])[0] || null, to: car.to || (car.path || []).slice(-1)[0] || null,
      fraction: p?.fraction ?? null, daysOut: p?.daysOut ?? null, daysLeft: p?.daysLeft ?? null,
      carriers: Array.isArray(car.carriers) ? car.carriers.map(nm).filter(Boolean).slice(0, 3) : [],
      features: [],
    });
    sources.caravan++;
  }

  // ── 4 · moving places on their circuits — H5 (CCODE-684) ──
  // ✅ BUILT, AND NOT AS ROWS: `positionedPlace(…, { worldDay })` answers a moving place's live point, and the globe's own pin for it is
  // drawn there — so a row here would draw the Long Span twice. ⛑ `movingPlacesBuilt` says it is built; the rows stay empty on purpose.

  return { rows, sources, movingPlacesBuilt: true };
}

/* ⛔ WHAT A MAP DRAWS FOR A ROW, AND IT IS NOT A SECOND TABLE. ✅ Aevi (H3): *"A new `markerKind` for holds,
 * with one shape for fixed holds and one for moving ones. The rung or frame sets the size. Your own holds
 * and other players' holds are told apart by COLOUR, NOT SHAPE."*
 * ⛑ Shape says WHAT it is; colour says WHOSE it is. Keeping those on separate channels is why a glance can
 * answer both questions at once — and it is the same rule `markerKind` already follows for places, where a
 * waygate and a village never share a shape. */
export function holdMarker(row) {
  if (!row) return null;
  const moving = !!(row.atSea || row.onRoad);
  const kind = row.kind === "caravan" ? "caravan" : (moving ? "holdMoving" : "holdFixed");
  // the rung or frame sets the size: a keep is a bigger mark than a shed, and a caravan is smaller than both
  const RUNG_R = { shed: 3.0, cot: 3.2, house: 3.6, hall: 4.2, tower: 4.4, keep: 5.2, fastness: 5.8 };
  const r = row.kind === "caravan" ? 2.4 : (RUNG_R[String(row.rung || "").toLowerCase()] || 3.8);
  return { kind, r, own: row.own !== false, moving, state: row.state || "whole" };
}

/** ⛔ THE RUNG IT IS, NOT ONLY THE ONE IT WAS NAMED. ✅ The ladder's own reading: *"Stillwater's Trouble at 19 is a keep"* —
 *  `roomOf` takes the larger of the promoted rung and the smallest that fits what is built. A hold never promoted stores none,
 *  and drew as the smallest thing on the map. */
function rungNow(h, content) {
  const hs = content?.rules?.economy?.holdStore || null;
  try { const r = hs ? roomOf(h, { ...hs, features: content?.rules?.economy?.holdFeatures || null }) : null; if (r?.rung) return r.rung; } catch {}
  return h?.rung || null;
}

/* ═════ SNG-679 H6 · THE HOLD IS A SITE ON ITS PLACE'S LOCAL MAP ═════
 * ✅ AEVI: *"A fixed hold is a site on its place's local map. Its position (`holding.site = { bearing, fromMetres }`) is
 * chosen once by L2's placer when the hold is claimed, avoiding water extent and existing sites, and then STORED, so it
 * never jumps. Holds that exist today are given one on first draw and stored the same way. Its kind is its rung. Use the
 * `tower` glyph from `keep` upwards, `quarter` below it, and the rung's name on the card."*
 * ⛑ PLACED AT FIRST DRAW, FOR EVERY HOLD. The claim runs in holdings.js, which has no layout in hand; the first draw has
 * one, and a hold claimed today is drawn the moment its owner looks — so "once, then stored" holds either way.
 * ⛔ PURE, AND IN METRES: the layout's own bearings and distances, so the point means the same at every zoom and on
 * every screen, and a card can publish it. */
const DEG = Math.PI / 180;
function validSite(s) {
  return s && Number.isFinite(Number(s.bearing)) && Number.isFinite(Number(s.fromMetres)) ? { bearing: Number(s.bearing), fromMetres: Number(s.fromMetres) } : null;
}
function ladderOf(content) { return content?.rules?.economy?.holdStore?.slots?.ladder || content?.economy?.holdStore?.slots?.ladder || {}; }
/** The rung's place on the ladder (0 = post), from its kind (`"keep"`) or its index. Null when unknown. */
export function holdRungIndex(rung, content) {
  if (rung == null || rung === "") return null;
  const L = ladderOf(content);
  for (const [k, v] of Object.entries(L)) if (v?.kind === rung) return Number(k);
  return Number.isFinite(Number(rung)) && L[String(rung)] ? Number(rung) : null;
}
/** ✅ *"the `tower` glyph from `keep` upwards, `quarter` below it"* */
export function holdSiteKind(rung, content) {
  const L = ladderOf(content);
  const keep = Object.entries(L).find(([, v]) => v?.kind === "keep")?.[0];
  const i = holdRungIndex(rung, content);
  return i != null && keep != null && i >= Number(keep) ? "tower" : "quarter";
}
function seeded(text) {
  let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Where a hold stands on its place's ground: clear of the water (its line and its meander), of every site the layout
 *  names and of the roads out, inside the built ground or just past its edge. Deterministic by hold id, so a VISITOR
 *  whose card carries no point yet sees it where its owner will. Returns `{ bearing, fromMetres }`. */
export function placeHoldSite(layout, holdId, { taken = [] } = {}) {
  const built = (layout?.extent || []).find((f) => f?.kind === "built");
  const R = Number(built?.radiusMetres) || (Number(layout?.radiusMetres) || 300) * 0.4;
  const P = (b, m) => [Math.sin((Number(b) || 0) * DEG) * (Number(m) || 0), Math.cos((Number(b) || 0) * DEG) * (Number(m) || 0)];
  const waters = (layout?.extent || []).filter((f) => f?.kind === "water").map((f) => ({ p: P(f.bearing, f.fromMetres),
    d: P(Number.isFinite(Number(f.flowBearing)) ? f.flowBearing : (Number(f.bearing) || 0) + 90, 1), half: (Number(f.widthMetres) || 120) / 2 }));
  const others = [...(layout?.sites || []).filter((s) => s?.localMap).map((s) => P(s.localMap.bearing, s.localMap.metres)),
    ...taken.filter(validSite).map((s) => P(s.bearing, s.fromMetres))];
  const roads = (layout?._measured?.roadsOut || []).map((r) => Number(r.bearing) || 0);
  const ang = (a, b) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  const clearOf = (b, m) => {
    const q = P(b, m);
    if (waters.some((w) => Math.abs((q[0] - w.p[0]) * w.d[1] - (q[1] - w.p[1]) * w.d[0]) < w.half * 1.6 + 40)) return false;
    if (others.some((s) => Math.hypot(s[0] - q[0], s[1] - q[1]) < Math.max(60, R * 0.25))) return false;
    return !roads.some((rb) => ang(rb, b) < 14);
  };
  const rnd = seeded("holdsite:" + holdId);
  for (let i = 0; i < 80; i++) {
    const b = rnd() * 360, m = R * (0.55 + rnd() * 0.75);
    if (clearOf(b, m)) return { bearing: Math.round(b), fromMetres: Math.round(m) };
  }
  // ⛑ nothing clear (a crowded or a flooded place): the middle of the widest gap between the roads, at the built edge
  const bs = roads.map((b) => ((b % 360) + 360) % 360).sort((a, b) => a - b);
  let mid = 135;
  if (bs.length) { let gap = -1; for (let i = 0; i < bs.length; i++) { const a = bs[i], b = i + 1 < bs.length ? bs[i + 1] : bs[0] + 360; if (b - a > gap) { gap = b - a; mid = a + (b - a) / 2; } } }
  return { bearing: Math.round(((mid % 360) + 540) % 360 - 180), fromMetres: Math.round(R * 1.1) };
}
/** The point, placed once and STORED on the hold (`holding.site`). Returns it. */
export function ensureHoldSite(holding, layout, { taken = [] } = {}) {
  const have = validSite(holding?.site);
  if (have) return have;
  const s = placeHoldSite(layout, holding?.id || "hold", { taken });
  if (holding) holding.site = s;
  return s;
}
/** A map row and its point → the site a local map draws. Its kind is its rung; the hold rides along for the card. */
export function holdSiteOf(row, site, { content = null } = {}) {
  const s = validSite(site);
  if (!row || !s) return null;
  return { id: `hold:${row.id}`, name: row.name || row.id, kind: holdSiteKind(row.rung, content),
    localMap: { bearing: s.bearing, metres: s.fromMetres }, generated: true, placedBecause: row.own ? "your hold, where it was first drawn" : "where its owner's card says it stands",
    hold: { id: row.id, own: !!row.own, ownerName: row.ownerName || null, rung: row.rung || null, rungIndex: holdRungIndex(row.rung, content),
      state: row.state || "whole", condition: row.condition || null, features: (row.features || []).length, frame: row.frame || null } };
}

/* ═════ SNG-679 H6 · OPENING THE HOLD: ITS OWN LOCAL MAP ═════
 * ✅ AEVI: *"Each feature is a site. Kind: `holdFeatures.kinds[k].siteKind` … Position: for a fixed hold, within
 * `holdStore.slots.ladder[rung].siteRadiusMetres` of the hold's centre, placed once and stored on the feature
 * (`feature.site`). The hold's ground follows L3 from the hold's own point. A moving hold's local map is the hold itself.
 * The features are laid out by `holdStore.slots.frames.kinds[frame].deck`: `line` front to back along `lengthMetres`,
 * with the bow facing the direction of travel; `stack` L5 levels; `ring` around an open middle; `scatter` placed and
 * stored as for a fixed hold. It is drawn on whatever it is passing over … not a town. Name: the feature's `name`, or the
 * kind's `label`. Its state comes from Part S. A feature with `count` > 1 is one site with the count on its card."*
 * ⛔ A LAYOUT LIKE ANY OTHER, so the same model, painter, labels, levels and enlargement draw it. */
function holdKindDef(content, k) { return content?.rules?.economy?.holdFeatures?.kinds?.[k] || null; }
export function holdFeatureSiteKind(f, content) { return f?.siteKind || holdKindDef(content, f?.kind)?.siteKind || "works"; }
export function holdFeatureName(f, content) { return f?.name || holdKindDef(content, f?.kind)?.label || f?.kind || "a feature"; }
const bearingOfXY = ([x, y]) => Math.round((((Math.atan2(x, y) / DEG) % 360) + 540) % 360 - 180);
/** How far from a fixed hold's centre its features stand: its rung's `siteRadiusMetres` (the rung it IS, by `roomOf`). */
export function holdSiteRadius(holding, content) {
  const hs = content?.rules?.economy?.holdStore || null;
  let i = null;
  try { i = hs ? roomOf(holding, { ...hs, features: content?.rules?.economy?.holdFeatures || null })?.rungIndex ?? null : null; } catch { i = null; }
  if (i == null) i = holdRungIndex(holding?.rung, content);
  const L = ladderOf(content);
  const r = Number((L?.[i] || L?.[String(i)])?.siteRadiusMetres);
  return Number.isFinite(r) && r > 0 ? r : 150;
}
/** A moving hold's deck — its frame's `deck` — or null for a hold on its ground. */
export function holdDeckOf(holding, content) {
  const frames = content?.rules?.economy?.holdStore?.slots?.frames?.kinds || {};
  const fr = holding?.frame && frames[holding.frame]?.deck ? holding.frame : null;
  return fr ? { frame: fr, ...frames[fr].deck } : null;
}
/** Where a feature stands on a hold's ground: within `R`, clear of the water and of the other features; seeded by the
 *  hold and the feature, so the same feature is offered the same point. */
function placeFeature(R, seedText, taken, waters, index = 0) {
  const rnd = seeded(seedText);
  const P = (b, m) => [Math.sin(b * DEG) * m, Math.cos(b * DEG) * m];
  const sep = Math.max(R * 0.22, 12);
  let best = null, bd = -1;
  for (let i = 0; i < 60; i++) {
    const b = rnd() * 360, m = R * (0.18 + 0.67 * Math.sqrt(rnd())), q = P(b, m);
    if (waters.some((w) => Math.abs((q[0] - w.p[0]) * w.d[1] - (q[1] - w.p[1]) * w.d[0]) < w.half * 1.6 + 10)) continue;
    const d = Math.min(Infinity, ...taken.map((t) => Math.hypot(t[0] - q[0], t[1] - q[1])));
    if (d >= sep) return { bearing: Math.round(b), fromMetres: Math.round(m) };
    if (d > bd) { bd = d; best = { bearing: Math.round(b), fromMetres: Math.round(m) }; }
  }
  // ⛑ nowhere clear at all: spread round the middle by the golden angle, never every room on one point
  return best || { bearing: Math.round(((index * 137.5) % 360) - 180), fromMetres: Math.round(R * (0.35 + 0.1 * (index % 4))) };
}
/** ⛔ THE HOLD'S OWN LOCAL MAP, as a layout the local painter draws. `placeLayout` is its place's; `atSea` and `heading`
 *  say what a moving hold is passing over and where her bow points. Fixed and `scatter` positions are STORED on the
 *  features (`feature.site`); a deck's are its shape's, recomputed. Mutates only to store a feature's first point. */
export function holdLayoutFor(holding, { content = null, placeLayout = null, atSea = false, heading = 0 } = {}) {
  const id = holding?.id || "hold";
  const deck = holdDeckOf(holding, content);
  const feats = (holding?.features || []).filter(Boolean);
  const P = (b, m) => [Math.sin((Number(b) || 0) * DEG) * (Number(m) || 0), Math.cos((Number(b) || 0) * DEG) * (Number(m) || 0)];
  const own = validSite(holding?.site) || { bearing: 0, fromMetres: 0 };
  const hp = P(own.bearing, own.fromMetres);
  const R = deck ? Math.max(10, Number(deck.lengthMetres) || 30) / 2 : holdSiteRadius(holding, content);
  // ✅ L3 from the hold's own point: the place's ground, moved so the hold is the centre — and none of it at sea
  const ground = atSea ? [] : (placeLayout?.extent || []).filter((f) => f && f.kind !== "built").map((f) => {
    const q = P(f.bearing, f.fromMetres), d = [q[0] - hp[0], q[1] - hp[1]];
    return { ...f, id: `${f.id || f.kind}@${id}`, bearing: bearingOfXY(d), fromMetres: Math.round(Math.hypot(d[0], d[1])) };
  }).filter((f) => f.fromMetres - (Number(f.radiusMetres) || (Number(f.widthMetres) || 0) / 2) < R * 3);
  const waters = ground.filter((f) => f.kind === "water").map((f) => ({ p: P(f.bearing, f.fromMetres),
    d: P(Number.isFinite(Number(f.flowBearing)) ? f.flowBearing : (Number(f.bearing) || 0) + 90, 1), half: (Number(f.widthMetres) || 120) / 2 }));
  const shape = deck ? String(deck.shape || "scatter") : "fixed";
  const n = feats.length, levels = Math.max(1, Number(deck?.levels) || 2);
  const taken = [];
  const sites = feats.map((f, i) => {
    let at, level = 0;
    if (shape === "line") {
      // front to back, the bow first, along the direction of travel
      const L = R * 2, t = L / 2 - (i + 0.5) * (L / Math.max(1, n));
      at = { bearing: t >= 0 ? heading : heading + 180, metres: Math.abs(t) };
    } else if (shape === "ring") {
      at = { bearing: heading + (i / Math.max(1, n)) * 360, metres: R * 0.7 };
    } else if (shape === "stack") {
      level = i % levels;
      const per = Math.ceil(n / levels), k = Math.floor(i / levels), t = R * 0.8 - (k + 0.5) * ((R * 1.6) / Math.max(1, per));
      at = { bearing: t >= 0 ? heading : heading + 180, metres: Math.abs(t) };
    } else {
      // fixed, or a `scatter` deck: placed ONCE and stored on the feature, so it never jumps
      let s = validSite(f.site);
      // ⛑ a hold on its ground keeps its rooms out of the river; a deck is its own ground, and the water under it is not in the way
      if (!s) { s = placeFeature(shape === "fixed" ? R : R * 0.9, `holdfeature:${id}:${f.id || i}:${f.kind || ""}`, taken, shape === "fixed" ? waters : [], i); f.site = s; }
      at = { bearing: s.bearing, metres: s.fromMetres };
    }
    taken.push(P(at.bearing, at.metres));
    const count = Math.max(1, Math.round(Number(f.count) || 1));
    return { id: f.id || `${id}:f${i}`, name: holdFeatureName(f, content), kind: holdFeatureSiteKind(f, content),
      localMap: { bearing: bearingOfXY(P(at.bearing, 1)), metres: Math.round(at.metres), ...(level ? { level } : {}) }, generated: true,
      placedBecause: shape === "fixed" ? "where it was raised on the hold's ground" : `on the ${deck?.frame || "deck"}, ${shape === "line" ? "bow to stern" : shape === "ring" ? "round the open middle" : shape === "stack" ? "one deck above another" : "where it found room"}`,
      feature: { holdId: id, id: f.id || null, index: i, kind: f.kind || null, count, state: f.state || "whole", level: Number(f.level) || 1 } };
  });
  const toPlace = !atSea && holding?.locationId ? [{ to: holding.locationId, bearing: bearingOfXY([-hp[0], -hp[1]]), mi: null }] : [];
  return {
    placeId: `hold:${id}`, generated: true, radiusMetres: Math.round(R * (deck ? 1.2 : 1.25)),
    extent: [...(deck ? [] : [{ id: `${id}:built`, name: null, kind: "built", bearing: 0, fromMetres: 0, radiusMetres: Math.round(R * 0.95), generated: true }]), ...ground],
    sites, sea: !!atSea, deck: deck ? { frame: deck.frame, shape, lengthMetres: R * 2, heading, levels: shape === "stack" ? levels : null } : null,
    hold: { id, name: holding?.name || id, frame: deck?.frame || null, atSea: !!atSea },
    _measured: { uphillBearing: placeLayout?._measured?.uphillBearing ?? null, relief: placeLayout?._measured?.relief ?? null,
      riverBearing: null, riverDistanceDeg: null, roadsOut: toPlace },
  };
}
/** The hold's map as its owner opens it: where she is (moored at her place, or out on the water) and which way her bow
 *  points (toward where she is going), through `whereaboutsOf`, H2's one reader. */
export function holdView(holding, { content = null, locations = {}, worldDay = null, routes = null, placeLayout = null } = {}) {
  const w = whereaboutsOf(holding, { worldDay, locations, routes });
  let heading = 0;
  if (w?.atSea && w.to && w.worldPos) { try { heading = bearingsTo({ worldPos: w.worldPos, connections: [w.to] }, locations)[0]?.bearing ?? 0; } catch { heading = 0; } }
  return holdLayoutFor(holding, { content, placeLayout: w?.atSea ? null : placeLayout, atSea: !!w?.atSea, heading });
}
