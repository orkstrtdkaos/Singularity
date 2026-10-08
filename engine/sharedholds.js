// sharedholds.js — ⛔ CCODE-383, shared lives: A HOLD NEARBY IS KNOWN — what it is, and who runs it.
//
// Erik 2026-09-16: "if there is a hold nearby PCs should hear about what it is and who's running it. they can and should interact
// with it.." — and Aevi, on the same ruling: a hold that only its owner's game can see is a defect.
//
// ⚑ MEASURED: 6 holdings across the saves (Silas 5, Loki 1), and not one visible outside its owner's game — while Adelheid stood in
// Millbrook with the Fell Pell in the same square, and anyone at the Crossing stood at the Made Gate and the Standing Annex.
//
// ⛑ THE OWNER'S GAME PUBLISHES A CARD PER HOLDING to `world/holds/valley.json`, one set per owner, replaced whole (a hold let go is a card
// gone). A card carries what a visitor could know: the name and kind, where it stands — with the position, so a world that never made
// the place can still measure the walk — who runs it, whether it thrives, what it has and who guards it.
// ⚠️ NEVER its store, its debts or its obligations: those are the owner's business, and a card is what the road knows.
// Another traveler's GM hears of those within two walking days, and the play screen says one line.

import { positionedPlace } from "./worldtime.js";
// ⛔ SNG-679 H4: a hull under way is published WHERE SHE IS. `whereaboutsOf` is H2's one reader, so a
// visitor's map and her owner's map cannot disagree about the water she is on.
import { whereaboutsOf } from "./carriage.js";
import { walkingDays } from "./worldmap.js";
import { whereOf } from "./travelers.js";
import { smartClamp } from "./namematch.js";
import { tradeOffer, goodsNamesOf, tradeLine } from "./holdtrade.js";   // CCODE-388: what an opened hold trades

export const HOLDS_PATH = "world/holds/valley.json";
/** How near a hold must be to be known from where a character stands, in walking days. */
export const HOLD_NEAR_DAYS = 2;

/** One holding as the road knows it. Null for nothing to publish. `nameOf` resolves a person's id to their name (the owner's world
 *  knows its own people). Pure. */
/* ⛔ WHAT A VISITOR SEES FROM OUTSIDE (SNG-679 S2). The martial family and the works that stand up out of
 *  the ground — a burned wall or a fallen tower is visible from the road; a damaged cellar is not. Closed on
 *  purpose: a feature kind not named here publishes nothing, which is the safe direction for a card that
 *  crosses between players' worlds. */
const OUTWARD_FEATURES = new Set(["wall", "gate", "tower", "keep", "yard", "dock", "mill", "circle", "outcrop", "burial"]);

export function holdCard(character, h, { locations = {}, nameOf = null, economy = null, cfg = null,
                                         worldDay = null, routes = null } = {}) {
  if (!character?.id || !h?.id) return null;
  const loc = h.locationId ? (locations?.[h.locationId] || null) : null;
  /* ═════ SNG-679 H4 · WHERE SHE IS, NOT WHERE SHE LEFT ═════
   * ✅ AEVI, reading origin: *"Another player's hold under way is published at its PORT: `holdCard` takes
   * `worldPos` from `locationId` only."* And her instruction: *"`holdCard` publishes
   * `whereaboutsOf(h).worldPos` when she is under way, with `atSea`, `from`, `to` and `fraction`, so other
   * players see her on the water and not at her port."*
   * ⛑ THROUGH `whereaboutsOf`, which is H2's one reader — so a visitor's map, her owner's map and the raid
   * that reaches her all read the same point. A second position rule here is what H2 existed to remove.
   * ⚠️ `locationId` STILL ONLY CHANGES ON ARRIVAL, so this is a DERIVED position and nothing to keep in
   * sync; a card built with no `worldDay` falls back to the port, which is what every existing caller gets
   * until it passes one. */
  const away = whereaboutsOf(h, { worldDay, locations, routes });
  const pos = away?.atSea
    ? away.worldPos
    : (h.locationId ? positionedPlace(locations || {}, h.locationId, { worldDay })?.worldPos : null);   // H5
  const where = h.locationId ? whereOf({ currentLocationId: h.locationId }, locations || {}) : null;
  const nm = (id) => (id && nameOf ? nameOf(id) : null) || null;
  return {
    key: `${character.id}:${h.id}`, id: h.id, ownerId: character.id, ownerName: character.name || null,
    name: h.name || h.id, kind: h.kind || null, describedAs: h.describedAs ? smartClamp(String(h.describedAs), 60) : null,
    locationId: h.locationId || null, placeName: loc?.name || null,
    settlementId: where?.settlementId || null, settlementName: where?.settlementName || null,
    worldPos: pos && Number.isFinite(Number(pos.colatitude)) && Number.isFinite(Number(pos.longitude))
      ? { colatitude: Number(pos.colatitude), longitude: Number(pos.longitude), ...(Number.isFinite(Number(pos.depth)) ? { depth: Number(pos.depth) } : {}) } : null,
    keeperId: h.steward || null, keeperName: nm(h.steward),
    condition: h.condition || null,
    /* ⛔ FORTUNE AND FABRIC BOTH, BECAUSE A VISITOR CAN SEE ONE AND BE TOLD THE OTHER. `condition` is how
     * the place is DOING; `state` (SNG-679 Part S) is whether anything is broken. ✅ Aevi: *"a thriving hold
     * can have a burned wall."* ⛑ And the card stays *"what a visitor could know"* — the rung, the frame and
     * a burned wall are all things you can see from the road; the store and the crew's names are not, and
     * they are still absent. */
    rung: h.rung || null, frame: h.frame || null,
    state: h.state || "whole",
    // ✅ SNG-679 H7: *"`holdCard` adds `site` alone, not the hold's feature layout. A visitor sees the hold, not its rooms."*
    ...(h.site && Number.isFinite(Number(h.site.bearing)) && Number.isFinite(Number(h.site.fromMetres))
      ? { site: { bearing: Number(h.site.bearing), fromMetres: Number(h.site.fromMetres) } } : {}),
    // ⛑ H4's four: so a reader can draw her on the water and say how far along she is.
    ...(away?.atSea ? { atSea: true, from: away.from || null, to: away.to || null,
      fraction: Number.isFinite(Number(away.fraction)) ? Number(away.fraction) : null } : {}),
    // ⛔ THE OUTWARD FEATURES ONLY. ✅ S2: *"its card publishes the hold's own `state` and the state of its
    // OUTWARD features (the martial family: wall, gate, tower, keep and so on), because those are what a
    // visitor would see."* An inward feature's state is its owner's business.
    outward: (h.features || []).filter((f) => OUTWARD_FEATURES.has(String(f?.siteKind || f?.kind || "").toLowerCase()))
      .map((f) => ({ name: f?.name || f?.kind || null, siteKind: f?.siteKind || null, state: f?.state || "whole" }))
      .filter((f) => f.name).slice(0, 5),
    has: (h.features || []).map(f => f?.name || f?.kind).filter(Boolean).slice(0, 5),
    guardedBy: (h.garrison || []).map(nm).filter(Boolean).slice(0, 3),
    // ⛔ CCODE-388: only a hold its owner OPENED to trade says what it sells — its goods, how many, and the price at its own Reach
    ...(() => { const t = tradeOffer(h, { economy, cfg, regionId: loc?.regionId || loc?.region || null, goodsNames: goodsNamesOf(economy) }); return t ? { trades: t } : {}; })(),
  };
}

/** Every holding a character has, as cards. Pure. */
export function holdCardsOf(character, opts = {}) {
  return (Array.isArray(character?.holdings) ? character.holdings : []).map(h => holdCard(character, h, opts)).filter(Boolean);
}

/** The merge body: this owner's set replaces whatever the store held for them — so a hold let go is gone — and every other owner's
 *  cards are kept as they are. Idempotent and union-safe per owner. Pure. */
export function mergeHoldCards(remote, ownerId, cards = []) {
  const holds = {};
  for (const [k, c] of Object.entries(remote?.holds || {})) if (c && c.ownerId !== ownerId) holds[k] = c;
  for (const c of cards || []) if (c?.key && c.ownerId === ownerId) holds[c.key] = c;
  return { schemaVersion: 1, regionId: "valley", holds };
}

/** Whether this owner's cards differ from what the store holds for them — a tick that changes nothing writes nothing. Pure. */
export function holdCardsChanged(remote, ownerId, cards = []) {
  const stable = (xs) => JSON.stringify([...xs].sort((a, b) => String(a.key).localeCompare(String(b.key))));
  const theirs = Object.values(remote?.holds || {}).filter(c => c && c.ownerId === ownerId);
  return stable(theirs) !== stable(cards || []);
}

/** Another traveler's holds within `maxDays` walking days of `here` (a place with a position), nearest first. Pure. */
export function holdsNear(store, { selfId = null, here = null, maxDays = HOLD_NEAR_DAYS, max = 4 } = {}) {
  if (!store?.holds || !here?.worldPos) return [];
  const out = [];
  for (const c of Object.values(store.holds)) {
    if (!c || !c.worldPos || (selfId && c.ownerId === selfId)) continue;
    const d = walkingDays(here, { worldPos: c.worldPos });
    if (d == null || d > maxDays) continue;
    out.push({ card: c, days: Math.round(d * 10) / 10 });
  }
  return out.sort((a, b) => a.days - b.days || String(a.card.key).localeCompare(String(b.card.key))).slice(0, max);
}

const distanceWords = (days) => days <= 0.3 ? "here" : days <= 0.7 ? "half a day off" : days <= 1.3 ? "a day off" : `${Math.round(days)} days off`;

/** One hold in a sentence a player reads: "The Fell Pell — Silas Weir's forge in Millbrook (here), run by Pell Ran Marsh". Pure. */
export function holdNearLine(n) {
  const c = n?.card;
  if (!c) return "";
  const what = c.describedAs || c.kind || "hold";
  const where = c.settlementName ? ` in ${c.settlementName}` : c.placeName ? ` at ${c.placeName}` : "";
  return `${c.name} — ${c.ownerName ? `${c.ownerName}'s ${what}` : `a ${what}`}${where} (${distanceWords(n.days)})${c.keeperName ? `, run by ${c.keeperName}` : ""}${c.trades ? " · open to trade" : ""}`;
}

/** ⛔ WHAT THE GM IS TOLD: each near hold, what it is, who runs it, whether it thrives, what it has. Null when none is near. Pure. */
export function holdsNearForGM(store, opts = {}) {
  const near = holdsNear(store, opts);
  if (!near.length) return null;
  return near.map(n => {
    const c = n.card;
    const bits = [c.condition || null, (c.has || []).length ? `has ${c.has.join(", ")}` : null,
      (c.guardedBy || []).length ? `guarded by ${c.guardedBy.join(", ")}` : null,
      c.trades ? tradeLine(c, opts.pending || []) : null].filter(Boolean).join("; ");
    return `- ${holdNearLine(n)}${bits ? `; ${bits}` : ""}.`;
  }).join("\n");
}
