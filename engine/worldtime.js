// worldtime.js — time passage as a setting. Two modes:
//   "story" (default): the clock advances with play — hours per beat/travel/rest.
//   "real":  the game clock is anchored to the real-world clock at a configurable
//            ratio (game-hours per real-hour). The world moves while you're away.
// NOTE for v0.5 shared worlds: time mode must become a WORLD-level choice — one
// world, one clock. Until then it's a per-player setting applied to their campaign.

// CCODE-193 §2: module-private. Exported and imported by app.js, which never used it — the
// "live code, needless public surface" third of the importedNeverCalled list.
const TIME_MODES = ["story", "real"];
export const DEFAULT_RATIO = 3; // real mode default: 1 real hour = 1 game day
 // registry:internal

// ⛔ CCODE-195 (Erik, from play): "It never ceases to be early-spring... even after over 1000 world ticks."
//
// He is right, and the arithmetic is brutal. A season was 45 character-days = 1080 character-hours, and a
// beat moves the clock 1–2 hours, so ONE SEASON COST ~600 TURNS and a full year ~4,800. His character stands
// at Day 15 — a third of the way into the first season — after weeks of play. The season was not slow, it
// was unreachable.
//
// ⚠️ AND WHAT IT HID WAS AUTHORED CONTENT, NOT A LABEL. `latentarcs.js` carries a SEASON_PRESSURE table:
// eight seasons, each with a condition line the GM narrates from and the arc-kinds it tilts toward — the dry,
// the scarcity, the breaking. SEVEN OF THE EIGHT HAVE NEVER BEEN REACHABLE BY ANY PLAYER. It reads as a stuck
// word in a header; what it actually did was hide seven-eighths of a written mechanic.
//
// ⛔ AND THE NUMBER WAS NOT TURNABLE. Both the length and the names were engine constants, so the people who
// own the world could not change its calendar without editing engine source. They are a dial now
// (`rules.worldClock.calendar`); these stay as the fallback for a pack that does not carry one.
const SEASONS = ["early-spring", "late-spring", "early-summer", "late-summer", "harvest", "early-winter", "deep-winter", "thaw"];
const DAYS_PER_SEASON = 45;

let _calendar = { seasons: SEASONS, daysPerSeason: DAYS_PER_SEASON };

/** The season calendar in force. */
export function seasonCalendar() { return _calendar; }

/** CCODE-195: install the authored calendar. Called once from `loadContent`. A malformed block is REFUSED
 *  rather than half-applied — no seasons, or a season of zero days, is a division by nothing and a header
 *  that reads `undefined`. Returns the calendar actually in force, so the caller can report which one. */
export function setSeasonCalendar(cal) {
  const seasons = Array.isArray(cal?.seasons) ? cal.seasons.filter(s => typeof s === "string" && s.trim()) : [];
  const days = Number(cal?.daysPerSeason);
  if (seasons.length && Number.isFinite(days) && days > 0) _calendar = { seasons, daysPerSeason: days };
  return _calendar;
}

/** Which season a day falls in. ONE definition, so two readers cannot drift into two answers. */
function seasonOf(day) {
  const { seasons, daysPerSeason } = _calendar;
  return seasons[Math.floor((day - 1) / daysPerSeason) % seasons.length];
}

export const ADVANCE = { beat: 1, travel: 3, rest: 8, sceneEnd: 2 };

export function newClock(startDay = 1, startHour = 8) {
  return { schemaVersion: 1, day: startDay, hour: startHour, realAnchor: null };
}

export function getTimeSettings() {
  const mode = localStorage.getItem("singularity.timeMode");
  const ratio = parseFloat(localStorage.getItem("singularity.timeRatio"));
  return { mode: TIME_MODES.includes(mode) ? mode : "story", ratio: ratio > 0 ? ratio : DEFAULT_RATIO };
}
export function setTimeSettings({ mode, ratio }) {
  if (TIME_MODES.includes(mode)) localStorage.setItem("singularity.timeMode", mode);
  if (ratio > 0) localStorage.setItem("singularity.timeRatio", String(ratio));
}

/** Current clock reading, honoring the mode. Real mode derives from the anchor;
 *  story mode returns stored values. Re-anchors lazily on mode entry. */
export function readClock(clock, settings = getTimeSettings()) {
  if (settings.mode === "real") {
    if (!clock.realAnchor) {
      clock.realAnchor = { atMs: Date.now(), day: clock.day, hour: clock.hour };
    }
    const elapsedRealHours = (Date.now() - clock.realAnchor.atMs) / 3600000;
    const gameHours = elapsedRealHours * settings.ratio;
    const total = clock.realAnchor.day * 24 + clock.realAnchor.hour + gameHours;
    return fromTotalHours(total);
  }
  clock.realAnchor = null; // story mode: drop the anchor so re-entering real mode re-anchors from here
  return fromTotalHours(clock.day * 24 + clock.hour);
}

/** Advance the clock by N game-hours (story mode only; real mode advances itself).
 *  In real mode this persists the derived time so switching back to story is seamless. */
export function advanceClock(clock, hours, settings = getTimeSettings()) {
  const cur = readClock(clock, settings);
  if (settings.mode === "real") { clock.day = cur.day; clock.hour = cur.hour; return cur; }
  const next = fromTotalHours(cur.day * 24 + cur.hour + hours);
  clock.day = next.day; clock.hour = next.hour;
  return next;
}

function fromTotalHours(total) {
  const day = Math.floor(total / 24);
  const hour = Math.floor(total % 24);
  const season = seasonOf(day);
  return { day, hour, phase: phaseOf(hour), season, label: `Day ${day}, ${phaseOf(hour)} (${season})` };
}

function phaseOf(hour) {
  if (hour < 5) return "deep night";
  if (hour < 8) return "dawn";
  if (hour < 12) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

// ---------- SNG-041: one world, one clock (the shared absolute) ----------
// Every character's LOCAL frame is their per-character `clock` above (play-paced — it waits
// for the player, advancing by beats/travel/rest / narrative time). The FAR WORLD runs on a
// single SHARED epoch — a fixed origin identical on every device — so cross-character events
// reconcile on ONE calendar and the far world ages in real time whether or not anyone plays.
// The root bug this fixes: newClock(startDay=1) gave each character its own Day-1, so "Day 8"
// and "Day 11" were two private counts with no shared reference.

// The shared world origin. A FIXED constant (never Date.now() — a per-device init would give
// each device a different epoch and break "one clock"). worldDay 1 begins here; the far world
// advances at `rate` world-days per real-day. Tunable via setWorldEpoch / the synced region
// config, but the constant guarantees every device agrees with zero sync dependency.
const WORLD_EPOCH_MS = Date.UTC(2026, 6, 1);   // 2026-07-01T00:00:00Z = world-day 1
const WORLD_EPOCH_DAY = 1;
const WORLD_DAYS_PER_REAL_DAY = 1;             // real pace: the far world ages one day per real day
const MS_PER_DAY = 86400000;

/** The shared world epoch (fixed constant by default; a synced/local override may tune it). */
export function getWorldEpoch() {
  try {
    const raw = JSON.parse(localStorage.getItem("singularity.worldEpoch") || "null");
    if (raw && Number.isFinite(raw.atMs) && Number.isFinite(raw.worldDay)) {
      return { atMs: raw.atMs, worldDay: raw.worldDay, rate: raw.rate > 0 ? raw.rate : WORLD_DAYS_PER_REAL_DAY };
    }
  } catch { /* fall through to the constant */ }
  return { atMs: WORLD_EPOCH_MS, worldDay: WORLD_EPOCH_DAY, rate: WORLD_DAYS_PER_REAL_DAY };
}
export function setWorldEpoch(epoch) {
  if (epoch && Number.isFinite(epoch.atMs) && Number.isFinite(epoch.worldDay)) {
    localStorage.setItem("singularity.worldEpoch", JSON.stringify({ atMs: epoch.atMs, worldDay: epoch.worldDay, rate: epoch.rate > 0 ? epoch.rate : WORLD_DAYS_PER_REAL_DAY }));
  }
}

/** THE reconciliation key: the absolute world-day right now (or at nowMs). Identical on every
 *  device, real-time. Two characters at different journey-days read the SAME value at once. */
export function absoluteWorldDay(nowMs = Date.now(), epoch = getWorldEpoch()) {
  const elapsedDays = Math.max(0, (nowMs - epoch.atMs) / MS_PER_DAY) * epoch.rate;
  return epoch.worldDay + Math.floor(elapsedDays);
}

const MS_PER_HOUR = MS_PER_DAY / 24;
/** SNG-191: WORLD TIME as a monotonic COUNT — real-time-derived, ~1 per hour, never rewound. It is the
 *  shared ORDERING key, and it is deliberately NOT in the same unit as character days: two clocks in
 *  the same unit invite arithmetic (and a day-number to invent), two clocks in different units simply
 *  coexist. Same epoch → same count on every device. This is the logical clock the whole system agrees
 *  a "before/after" on, and it is what removes the world day-number the GM kept fabricating. */
export function worldCount(nowMs = Date.now(), epoch = getWorldEpoch()) {
  const elapsedHours = Math.max(0, (nowMs - epoch.atMs) / MS_PER_HOUR) * (epoch.rate || 1);
  const base = Number.isFinite(epoch.worldDay) ? epoch.worldDay * 24 : 24;   // the count where the day-epoch stood, ×24
  return base + Math.floor(elapsedHours);
}

/** SNG-191 §2: render the count in the LOCAL people's idiom — one count underneath, many words on top.
 *  Cairnhold's ashwardens say "tolls", the enginewrights "revolutions", the rootkin "risings". A people
 *  whose idiom is the parenthetical refusal (the churnfolk, who cheerfully keep no steady one) falls
 *  back to the canonical formal term. `worldClock` is CONTENT.worldClock; `peopleId` is the traditionId
 *  of the region the character stands in. Pure. */
export function worldCountLabel(count, worldClock = null, peopleId = null) {
  const formal = worldClock?.unit?.formal || "the Kept Count";
  const raw = peopleId && worldClock?.idioms?.[peopleId]?.word;
  const idiom = raw && !String(raw).startsWith("(") ? String(raw) : null;
  return idiom ? `${count} ${idiom}` : `${formal} stands at ${count}`;
}

/** Full absolute world-date reading — what the world clock shows.
 *
 * ⛔ CCODE-195: NO SEASON HERE. This computed one from WORLD days and put it in the feed label, while the
 * header computed a different one from CHARACTER days — so one game could show two seasons for one moment,
 * and did. `world_clock.json` settles which is real: *"Character time is days and seasons — personal,
 * human. World time is a monotonic COUNT."* A season is something a traveller lives through, not a property
 * of the shared count, so the world date states the day it can derive and stops there. */
export function worldDate(nowMs = Date.now(), epoch = getWorldEpoch()) {
  const worldDay = absoluteWorldDay(nowMs, epoch);
  return { worldDay, label: `World-day ${worldDay}` };
}

/** Absolute world-day for a real-time stamp (ISO string or ms) — e.g. a ledger event's `.at`,
 *  so a cross-character event dates the SAME on every viewer's calendar. Unknown → null
 *  (derives-never-fabricates: no invented absolute dates). */
export function worldDayAt(atMsOrIso, epoch = getWorldEpoch()) {
  const ms = typeof atMsOrIso === "number" ? atMsOrIso : Date.parse(atMsOrIso);
  if (!Number.isFinite(ms)) return null;
  return absoluteWorldDay(ms, epoch);
}

/** "N days ago"-style phrasing relative to the viewer's current absolute world-day, so an
 *  Ent-timeline event and this character's scene share one felt calendar. */
export function relativeWorldDays(eventWorldDay, nowWorldDay = absoluteWorldDay()) {
  if (!Number.isFinite(eventWorldDay)) return "at an unknown time";
  const d = nowWorldDay - eventWorldDay;
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return `${Math.round(d / 30)} months ago`;
}
