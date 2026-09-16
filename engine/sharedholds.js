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
import { walkingDays } from "./worldmap.js";
import { whereOf } from "./travelers.js";
import { smartClamp } from "./namematch.js";

export const HOLDS_PATH = "world/holds/valley.json";
/** How near a hold must be to be known from where a character stands, in walking days. */
export const HOLD_NEAR_DAYS = 2;

/** One holding as the road knows it. Null for nothing to publish. `nameOf` resolves a person's id to their name (the owner's world
 *  knows its own people). Pure. */
export function holdCard(character, h, { locations = {}, nameOf = null } = {}) {
  if (!character?.id || !h?.id) return null;
  const loc = h.locationId ? (locations?.[h.locationId] || null) : null;
  const pos = h.locationId ? positionedPlace(locations || {}, h.locationId)?.worldPos : null;
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
    has: (h.features || []).map(f => f?.name || f?.kind).filter(Boolean).slice(0, 5),
    guardedBy: (h.garrison || []).map(nm).filter(Boolean).slice(0, 3),
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
  return `${c.name} — ${c.ownerName ? `${c.ownerName}'s ${what}` : `a ${what}`}${where} (${distanceWords(n.days)})${c.keeperName ? `, run by ${c.keeperName}` : ""}`;
}

/** ⛔ WHAT THE GM IS TOLD: each near hold, what it is, who runs it, whether it thrives, what it has. Null when none is near. Pure. */
export function holdsNearForGM(store, opts = {}) {
  const near = holdsNear(store, opts);
  if (!near.length) return null;
  return near.map(n => {
    const c = n.card;
    const bits = [c.condition || null, (c.has || []).length ? `has ${c.has.join(", ")}` : null,
      (c.guardedBy || []).length ? `guarded by ${c.guardedBy.join(", ")}` : null].filter(Boolean).join("; ");
    return `- ${holdNearLine(n)}${bits ? `; ${bits}` : ""}.`;
  }).join("\n");
}
