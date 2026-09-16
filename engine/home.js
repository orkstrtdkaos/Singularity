// engine/home.js — CCODE-369: A HOME IS A PLACE THAT IS YOURS.
//
// ⛔ ERIK 2026-09-16: "Yes, a home is a different type than a hold... but it could BECOME a hold. to start with it's a location."
// And Courtney's wish, the reason it was asked: "collecting herbs and painting at a cabin overlooking the valley".
//
// ⚑ MEASURED BEFORE THIS: nothing let a character call a place home. The nearest thing was a holding — a `post` or an
// `enterprise`, whose condition drops a step every ~30 days without a keeper, and which can be raided: the opposite of a quiet
// cabin. Aevi had already authored the cabin (The Painter's Shelf, 0.8 days above the Kindly Rest); the engine had no way for
// anyone to live there.
//
// ⛑ SO A HOME IS ONLY THIS: a location the character chose, and since when. No condition, no keeper, no decay, no raid — none of
// the holdings machinery reads it. ⚠️ It can BECOME a hold later (Erik); nothing here pretends to be one yet.
//
// ⚠️ PURE.

const dayOrNull = (d) => (d !== null && d !== undefined && Number.isFinite(Number(d))) ? Number(d) : null;

/** The character's home, resolved against the places that exist — null when they have none. */
export function homeOf(character, locations = {}) {
  const h = character?.home;
  if (!h?.locationId) return null;
  const loc = locations?.[h.locationId] || null;
  return { locationId: h.locationId, name: loc?.name || h.name || h.locationId, sinceWorldDay: dayOrNull(h.sinceWorldDay), exists: !!loc };
}

/** Are they standing in it? */
export function isHome(character) {
  return !!character?.home?.locationId && character.home.locationId === character?.currentLocationId;
}

/** Make a place home — the player's choice, never the engine's. Moving home is allowed; it says where from. */
export function makeHome(character, locationId, { locations = {}, worldDay = null } = {}) {
  const loc = locations?.[locationId];
  if (!character || !loc) return { ok: false, why: "there is no such place to call home" };
  if (character.home?.locationId === locationId) return { ok: false, why: `${loc.name || locationId} is already home` };
  const was = character.home?.locationId ? (locations?.[character.home.locationId]?.name || character.home.name || null) : null;
  character.home = { locationId, name: loc.name || locationId, sinceWorldDay: dayOrNull(worldDay) };
  return { ok: true, was, name: loc.name || locationId };
}

/** ⛔ THE GM: where this character lives, and whether they are there. Null when they have no home. */
export function homeForGM(character, locations = {}) {
  const h = homeOf(character, locations);
  if (!h) return null;
  const who = character?.name || "This character";
  return `- ${who}'s home is ${h.name}${h.sinceWorldDay != null ? ` (since world-day ${h.sinceWorldDay})` : ""} — their own place, chosen by them.`
    + (isHome(character) ? ` ${who} is home now: let it feel like home — their things where they left them, the quiet they came back for.` : "");
}
