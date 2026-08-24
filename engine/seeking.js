// engine/seeking.js — CCODE-222: A REASON FOR THE ENGINE TO BRING SOMEONE TO YOU.
//
// ⛔ THE GAP THIS CLOSES, STATED EXACTLY. `drivenNpcDirective` fires whenever a driven NPC is in the block
// (CCODE-220 proved it with a transcript). What has never existed is anything that PUTS THEM THERE. The
// directive describes a person who is already in front of you; nothing makes them walk up.
//
// ⚠️ SO THIS IS A CLOCK, NOT A QUEUE, and the difference is the whole design. A queue would hand the
// player a list of people to visit. A clock means the pressure builds while you are APART and empties when
// you meet — so an NPC who wants something comes looking, and one you saw yesterday does not.
//
// ⛔ THE RATE KEYS ON THE MAGNITUDE OF THE RELATIONSHIP, NOT ITS SIGN. Someone who loves you and someone
// who cannot stand you both come sooner than an acquaintance — strong feeling is impatient in either
// direction, and a rival who wants something from you is the more interesting scene. Keying on the signed
// value would have made hostility a reason to stay away, which is a different game.
//
// ⚠️ AND NOTHING SEEKS WITHOUT AN AUTHORED WANT. 111 people are in the registry and 7 have interiority; if
// a bare acquaintance could build pressure, the world would become a stream of interruptions and the
// authored people would be lost in it. NO WANT, NO SEEKING.

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** The wants an NPC actually has — authored interiority first, then anything captured in play. */
export function wantsOf(npcId, interiority = null, entry = null) {
  const authored = interiority?.npcs?.[npcId]?.wants;
  if (Array.isArray(authored) && authored.length) return authored;
  const captured = entry?.interiority?.wants;
  return Array.isArray(captured) && captured.length ? captured : null;
}

/** ⛔ HOW LONG THIS PERSON WILL WAIT. Strong feeling is impatient in EITHER direction, so the band is read
 *  off |relationship|. A stranger with a want waits a long time; a devoted friend or a declared enemy does
 *  not wait at all long. Returns days. */
export function patienceOf(relationship, cfg = {}) {
  const heat = Math.abs(num(relationship, 0));
  const base = num(cfg.patienceDays, 21);
  const perPoint = num(cfg.patiencePerPoint, 2.5);
  return Math.max(num(cfg.patienceFloor, 3), base - heat * perPoint);
}

/** 0 → just seen · 1 → they come looking · >1 → they have been waiting. */
export function seekingPressure({ daysApart = 0, relationship = 0, cfg = {} } = {}) {
  const days = Math.max(0, num(daysApart, 0));
  return days / patienceOf(relationship, cfg);
}

/** ⛔ WHO IS COMING, AND AT MOST `maxSeekers` OF THEM. Bounded on purpose: a world where four people find
 *  you the moment you rest is not a world with relationships in it, it is a notification tray.
 *
 *  Returns [{ id, name, pressure, daysApart, wants, want }] sorted by pressure, longest-waiting first. */
export function seekersAmong(character, { interiority = null, currentDay = 0, cfg = {} } = {}) {
  const reg = character?.npcRegistry || {};
  const out = [];
  for (const [key, n] of Object.entries(reg)) {
    if (!n) continue;
    const id = n.id || key;
    if (n.status && n.status !== "active") continue;      // the dead and the departed do not come looking
    const wants = wantsOf(id, interiority, n);
    if (!wants) continue;                                  // ⛔ no authored want, no seeking
    const seen = num(n.lastSeen?.day, num(n.firstMet?.day, 0));
    const daysApart = Math.max(0, num(currentDay, 0) - seen);
    const pressure = seekingPressure({ daysApart, relationship: n.relationship, cfg });
    if (pressure < 1) continue;
    out.push({ id, name: n.name || id, pressure, daysApart, relationship: num(n.relationship, 0),
      // ⚠️ OPTIONAL, SO A BROKEN GUARD FAILS A GATE INSTEAD OF KILLING THE RUN. Removing the no-want
      // check above made `wants[0]` throw, and a thrown suite reports zero failures while deleting every
      // gate after it - which I have now said twice this week and had written into my own new file.
      wants, want: wants?.[0] || null });
  }
  out.sort((a, b) => b.pressure - a.pressure);
  return out.slice(0, Math.max(1, num(cfg.maxSeekers, 1)));
}

/** ⚠️ THE WORDS ARE THE PO'S, NOT THE ENGINE'S. A line is read from content when authored; the fallback is
 *  deliberately plain, so a placeholder never reads as authored prose. `{name}` and `{want}` are filled. */
export function seekingLine(seeker, cfg = {}) {
  const tmpl = cfg.line || "{name} has been looking for you.";
  return String(tmpl).replace(/\{name\}/g, seeker.name).replace(/\{want\}/g, seeker.want || "something");
}

/** ⛔ THE CLOCK EMPTIES WHEN YOU MEET, AND THAT IS WHAT MAKES IT A CLOCK. Called when the player and this
 *  person are actually in a scene together; without it the pressure only ever rises and everyone arrives
 *  at once forever. */
export function noteSeen(character, npcId, currentDay, locationId = null) {
  const n = character?.npcRegistry?.[npcId];
  if (!n) return false;
  n.lastSeen = { locationId: locationId ?? n.lastSeen?.locationId ?? null, day: num(currentDay, 0) };
  return true;
}

/** The tick hook: who is coming, and the news lines to say so. ⚠️ It does NOT mutate the registry — being
 *  sought is not being met, and marking it seen here would empty the clock without the scene happening. */
export function advanceSeeking(character, { interiority = null, currentDay = 0, cfg = {} } = {}) {
  const seekers = seekersAmong(character, { interiority, currentDay, cfg });
  return { seekers, news: seekers.map(s => seekingLine(s, cfg)) };
}
