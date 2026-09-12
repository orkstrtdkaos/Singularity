// engine/fellowship.js — WHO HAS THROWN IN WITH YOU, WHICH BAND THEY STAND IN, AND WHERE THEY ARE.
//
// ⛔ ERIK 2026-09-12, THE RULING THIS FILE IS SHAPED BY: "Silas has a band right now under the Fellowship of the Fell... but he'll
// likely have other bands as he adventures... so don't make everything about a single band. And we'll need to be able to form them
// into a legion later." ⚠️ SO THERE IS NO `theBand` ANYWHERE IN HERE. Every function takes or returns UNITS, plural, addressed by
// id; nothing indexes `bands[0]`; and every row carries the unit it belongs to, so a roster of three bands reads as three bands.
//
// ⛑ AND THE LEGION NEEDS NO NEW CONTAINER, which is the long-game answer: `engine/group.js` already draws the distinction Erik is
// reaching for — "a legion is deep; a band is broad and thin... a legion may have ZERO KNOW coverage" — and `legionClash` already
// resolves one. A legion is therefore a UNIT WHOSE CONTINGENTS ARE THE CONTINGENTS OF SEVERAL BANDS, with `formedFrom` naming them.
// `contingentsOf`, `bandCan` and `bandStrength` are already written against contingents and would not change a line. ⚠️ I HAVE NOT
// BUILT THE FORMING: an engine export with no caller is a test-only export, `wiring_audit` ratchets those, and a panel that offers
// to form a legion before the forming exists is exactly the message-claiming-a-mechanism defect this project keeps catching.
//
// ⛔ SPEC_SNG-541 (Aevi 2026-09-12) — THE POOL IS A VIEW, NOT A CONTAINER: "every member of the Fellowship who is not in `company`
// today. Nothing to migrate, nothing to keep in sync, and no way for the two lists to disagree." Membership is being IN a band;
// posture is being AT YOUR SIDE. The two are independent, which is why Silas's save read as broken: six sworn, nobody beside him.
//
// PURE. Every function reads the character and content and returns data; the writers stay `recruit`/`partCompany` in company.js.
import { contingentsOf, bandCan, bandStrength } from "./melee.js";
import { activeCompany } from "./company.js";
import { companyPlaces } from "./ladder.js";
import { derivedLevel } from "./npcsheet.js";
import { walkingDays, bearingBetween } from "./worldmap.js";

const num = (v, d = null) => (Number.isFinite(Number(v)) ? Number(v) : d);
const arr = (v) => (Array.isArray(v) ? v : []);

/** ⛔ AEVI'S §4: "Families read as verbs, not tags. `SHAPE/HARM` on a card is a database. 'shapes and harms' is a person." */
const FAMILY_VERBS = {
  SHAPE: "shapes", HARM: "harms", PROTECT: "protects", KNOW: "knows",
  RESTORE: "restores", MOVE: "moves", INFLUENCE: "sways", SUSTAIN: "sustains",
};

/** The verbs for a `does` list, joined as a person rather than a record. ⚠️ TWO IS THE LIMIT IN A ROW (her rule: "a row that lists
 *  everything ranks nothing"); a caller asks for more only in a detail view. An unknown family is dropped, never printed raw. */
function familyVerbs(does = [], limit = 2) {
  const verbs = arr(does).map(d => FAMILY_VERBS[String(d || "").toUpperCase()]).filter(Boolean);
  const shown = limit > 0 ? verbs.slice(0, limit) : verbs;
  if (!shown.length) return null;
  if (shown.length === 1) return shown[0];
  return shown.slice(0, -1).join(", ") + " and " + shown[shown.length - 1];
}

/** ⛔ THE DERIVED HEADCOUNT, NEVER `band.count`. Aevi: "never print `count: 6` to a player. It is six people and they have names" —
 *  and the deeper reason is the one she ruled on the energy counts the same day: a stored copy of a derived number is a staleness
 *  generator. `melee.js` learned this already ("my first version kept num(band.count, 0) here"). The contingents are the truth. */
function unitHead(unit) {
  return contingentsOf(unit).reduce((a, c) => a + Math.max(0, num(c.n, 0)), 0);
}

/** Every unit you command, normalised and PLURAL. ⚠️ Returns [] for a character with no bands rather than a fabricated one. */
export function unitsOf(character) {
  return arr(character?.bands).filter(b => b && (b.id || b.name)).map(b => ({
    id: String(b.id || b.name),
    name: b.name || String(b.id),
    seatId: b.from || null,          // where the unit was raised, and its seat until something says otherwise
    quality: num(b.quality, 1),
    condition: b.condition || "fresh",
    raisedDay: num(b.raisedDay, null),
    losses: num(b.losses, 0),
    head: unitHead(b),
    can: bandCan(b),
    worth: bandStrength(b, {}),
    formedFrom: arr(b.formedFrom).map(String),   // ⛔ EMPTY TODAY. A legion is a unit formed FROM units; see the header.
    unit: b,
  }));
}

/** ⛔ ONE ROW PER STANDING, ACROSS EVERY UNIT — the roster Erik asked for: "everyone listed with their level and primary functions."
 *  A contingent with an `npcId` is a PERSON (name, level, whereabouts); one without is HANDS (n of them, what they do, and no
 *  invented identity). ⚠️ Both belong on the roster: a band is people and bodies by construction, and a roster that hid the bodies
 *  would under-report the very unit it describes. Each row names its unit, so the plural case needs no grouping logic. */
function memberRows(character, { content = {}, worldDay = null, cfg = null, includeHands = true } = {}) {
  const npcs = content?.npcs || {};
  const reg = character?.npcRegistry || {};
  const side = new Set(activeCompany(character).map(m => m.npcId));
  // ⛔ THE MERGED BAG, NOT THE RAW SUB-BLOCK. `rules.npcStanding` is where `state.js` merges the authored
  // `tier_signals` table in; `rules.resolution.npcStanding` is the file's own copy and carries `tierFloor`
  // WITHOUT the signals. Reading the wrong one made `tierFromRole` return null for everyone, so every person
  // with no authored level collapsed to 1 — Aldric and Dara read level 1 on Erik's screen and he caught it in
  // an hour. ⚠️ `scripts/npc_pipeline.mjs` records this exact trap in its own header and I walked into it anyway.
  const sheetCfg = cfg || content?.rules?.npcStanding || content?.rules?.resolution?.npcStanding || {};
  const rows = [];
  for (const u of unitsOf(character)) {
    for (const c of contingentsOf(u.unit)) {
      const id = c.npcId ? String(c.npcId) : null;
      if (!id) {
        if (!includeHands || !(num(c.n, 0) > 0)) continue;
        rows.push({
          kind: "hands", id: null, unitId: u.id, unitName: u.name, n: num(c.n, 0), name: null,
          what: c.what || null, does: arr(c.does), verbs: familyVerbs(c.does), level: null,
          atSide: false, quality: num(c.quality, u.quality),
        });
        continue;
      }
      const entry = reg[id] || npcs[id] || { id };
      const authored = npcs[id] || null;
      rows.push({
        kind: "person", id, unitId: u.id, unitName: u.name, n: num(c.n, 1),
        name: entry.name || authored?.name || id,
        what: c.what || entry.role || null,
        does: arr(c.does), verbs: familyVerbs(c.does),
        level: derivedLevel(entry, { day: worldDay, cfg: sheetCfg, authored }),
        atSide: side.has(id),
        quality: num(c.quality, u.quality),
        entry, authored, seatId: u.seatId,
      });
    }
  }
  return rows;
}

/** ⛔ THE POOL IS A VIEW (Aevi's §1): sworn, and not at your side today. No third container, so the two lists cannot disagree. */
export function poolRows(character, opts = {}) { return memberRows(character, opts).filter(r => !r.atSide); }

/** …and its other half: sworn AND here. ⚠️ A person can be at your side without being in a band; that is `activeCompany`'s list and
 *  deliberately not this one. This answers "who of my bands walks with me", which is the question the roster header asks. */
export function atSideRows(character, opts = {}) { return memberRows(character, opts).filter(r => r.atSide); }

/** ⛔ WHERE THEY ARE, WITH THE BASIS NAMED — Erik: "it should list where those people are located currently, if not in my vicinity."
 *  The chain is honest and each rung says which rung it is, because the one thing worse than not knowing where someone is, is being
 *  told confidently: at your side (a fact) → last seen (a fact with a date) → an authored home → the unit's seat → where you met.
 *  ⚠️ NO INVENTED POSITION: a row with nothing behind it says so. Distance and direction use the world's own words
 *  (hubward/outward/spinward/widdershins, via `bearingBetween`), never a compass this setting does not have. */
export function wherePerson(row, { locations = {}, generated = {}, holdings = [], hereId = null, worldDay = null } = {}) {
  if (row?.atSide) return { line: "here, with you", basis: "at your side", locationId: hereId || null, days: 0 };
  const e = row?.entry || {};
  const pick = e.lastSeen?.locationId ? { id: e.lastSeen.locationId, basis: "last seen", day: num(e.lastSeen.day, null) }
    : row?.authored?.homeLocation ? { id: row.authored.homeLocation, basis: "home" }
    : row?.seatId ? { id: row.seatId, basis: "with the band" }
    : e.firstMet?.locationId ? { id: e.firstMet.locationId, basis: "where you met", day: num(e.firstMet.day, null) }
    : null;
  if (!pick) return { line: "you do not know where they are", basis: "nothing on the record", locationId: null, days: null };
  const where = placeOf(pick.id, { locations, generated, holdings });
  const seat = pick.basis === "with the band";
  // ⚠️ A PLACE THAT RESOLVES TO NOTHING IS NOT A PLACE TO PRINT. The slug is the one thing a player must never be shown, so an
  // unresolvable id degrades to the fact that survives it: they are with their band, or you simply do not know.
  if (!where) return { line: seat ? "with the band" : "you do not know where they are", basis: seat ? pick.basis : "nothing that resolves", locationId: null, days: null };
  const stale = pick.basis === "last seen" && pick.day != null && worldDay != null && worldDay - pick.day >= 14
    ? ` (as of day ${pick.day})` : "";
  if (hereId && (where.id === hereId || where.posId === hereId)) {
    return { line: `here at ${where.name}${stale}`, basis: pick.basis, locationId: where.id, days: 0 };
  }
  const from = hereId ? (locations?.[hereId] || generated?.[hereId] || null) : null;
  const days = from && where.pos ? walkingDays(from, where.pos) : null;
  const bear = from && where.pos ? bearingBetween(from, where.pos) : null;
  const far = days == null ? "" : `, ${dayWord(days)}${bear?.phrase ? ` ${bear.phrase}` : ""}`;
  return {
    line: `${seat ? "with the band at" : "at"} ${where.name}${far}${stale}`,
    basis: pick.basis, locationId: where.id, bearing: bear?.phrase || null,
    days: days == null ? null : Math.round(days * 10) / 10,
  };
}

/** ⛔ A PLACE IS THREE THINGS HERE, AND THE ROSTER NEEDS ALL THREE: an authored location, a place the fiction minted
 *  (`character.generated.location` — where a good half of Silas's world lives), or A HOLDING OF YOURS. The band's seat reads
 *  `the-fell-pell`, which is a HOLDING id standing at Millbrook, so resolving against `locations` alone printed the slug straight
 *  at the player. ⚠️ The display name and the point to measure from are returned separately, because a holding is named in its own
 *  right and located at somewhere else. Returns null when the id resolves to nothing, which the caller must then not print. */
function placeOf(id, { locations = {}, generated = {}, holdings = [] } = {}) {
  if (!id) return null;
  const loc = locations?.[id] || generated?.[id] || null;
  if (loc) return { id, name: loc.name || id, posId: id, pos: loc };
  const hold = arr(holdings).find(h => h && h.id === id);
  if (!hold) return null;
  const at = hold.locationId ? (locations?.[hold.locationId] || generated?.[hold.locationId] || null) : null;
  return { id, name: hold.name || id, posId: hold.locationId || null, pos: at, isHolding: true };
}

/** ⚠️ A DIFFERENT PLACE IS NEVER "no distance at all". Measured on Silas's save, the walk from Whistling Woman Post to Millbrook
 *  rounds to zero days — true, and a sentence that then reads "at Millbrook, no distance at all" tells a player their man is both
 *  elsewhere and here. Under a day is `within the day`, which is the fact and reads like one. */
function dayWord(days) {
  const raw = Math.max(0, num(days, 0));
  if (raw < 0.75) return "within the day";
  const d = Math.round(raw);
  const words = ["", "one day", "two days", "three days", "four days", "five days", "six days", "seven days"];
  return words[d] || `${d} days`;
}

/** ⛔ CAN THEY COME FORWARD — the refusal WITH ITS REASON, because `recruit` returns a bare `null` over the cap, and a button that
 *  fails silently is the defect I shipped in the holds screen a week ago. ⚠️ THE CAP IS ERIK'S (3 by level 10, 6 not long after)
 *  and `companyPlaces` already reads it; this only says so in words a player can act on. */
export function canBringForward(character, row, { ladder = null } = {}) {
  if (!row || row.kind !== "person") return { ok: false, why: "hands stay with their band" };
  if (row.atSide) return { ok: false, why: `${row.name} is already at your side` };
  const places = ladder ? companyPlaces(ladder, character) : null;
  const taken = activeCompany(character).length;
  if (places != null && taken >= places) {
    return { ok: false, why: `${taken} of ${places} places at your side are taken — someone steps back before ${row.name} steps up`, places, taken };
  }
  return { ok: true, places, taken };
}

/** The header line for a roster of any size. ⛔ COUNT-FREE IN AEVI'S SENSE: it says "six sworn, two here" — her own words — derived
 *  from the rows every time and never from a stored `count`. One unit names itself; several are counted as bands, because that IS
 *  the fact a player needs the day it stops being one. */
export function rosterLine(character, opts = {}) {
  const units = unitsOf(character);
  if (!units.length) return "You command no bands.";
  const rows = memberRows(character, opts);
  const people = rows.filter(r => r.kind === "person");
  const hands = rows.filter(r => r.kind === "hands").reduce((a, r) => a + r.n, 0);
  const here = people.filter(r => r.atSide).length;
  const lead = units.length === 1 ? units[0].name : `${wordFor(units.length)} bands`;
  const withHands = hands > 0 ? ` and ${wordFor(hands)} hands` : "";
  return `${lead} — ${wordFor(people.length)} sworn${withHands}, ${here ? `${wordFor(here)} here` : "none of them here"}`;
}

function wordFor(n) {
  const words = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  return words[Math.max(0, num(n, 0))] || String(n);
}

/** ⛔ ONE LINE ABOUT A UNIT, for the panel's per-band heading: what it is worth and what it is FOR. ⚠️ "six strong" is derived
 *  from the contingents every render; the stored `count` is never read and never shown. */
export function unitLine(u) {
  const can = arr(u?.can).length ? arr(u.can).map(f => FAMILY_VERBS[f] || String(f).toLowerCase()).join(", ") : "nothing named yet";
  return `${wordFor(u?.head)} strong, ${u?.condition || "fresh"} — it ${can}`;
}

/** ⛔ THE GM'S VIEW, and the reason it lives here: `gm_registry` printed `${b.name} (${b.condition}, ${b.count})` — the stored copy
 *  again, in the one place the GM reads what you command. It now reads the derived head and says what each unit is FOR, which is
 *  what a GM needs in order to narrate a band being used. ⚠️ One line per unit, so three bands cost three lines, not a paragraph. */
export function rosterForGM(character, opts = {}) {
  const units = unitsOf(character);
  if (!units.length) return [];
  const rows = memberRows(character, opts);
  return units.map(u => {
    const mine = rows.filter(r => r.unitId === u.id);
    const named = mine.filter(r => r.kind === "person");
    const here = named.filter(r => r.atSide);
    const can = u.can.length ? u.can.map(f => FAMILY_VERBS[f] || String(f).toLowerCase()).join(", ") : "nothing named";
    return `${u.name} — ${wordFor(u.head)} strong, ${u.condition}; it ${can}`
      + (named.length ? ` · ${named.map(r => `${r.name}${r.atSide ? " (with you)" : ""}`).join(", ")}` : "")
      + (here.length ? "" : " · none of them at your side");
  });
}
