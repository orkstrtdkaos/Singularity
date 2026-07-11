// worldtime.js — time passage as a setting. Two modes:
//   "story" (default): the clock advances with play — hours per beat/travel/rest.
//   "real":  the game clock is anchored to the real-world clock at a configurable
//            ratio (game-hours per real-hour). The world moves while you're away.
// NOTE for v0.5 shared worlds: time mode must become a WORLD-level choice — one
// world, one clock. Until then it's a per-player setting applied to their campaign.

export const TIME_MODES = ["story", "real"];
export const DEFAULT_RATIO = 24; // real mode default: 1 real hour = 1 game day

const SEASONS = ["early-spring", "late-spring", "early-summer", "late-summer", "harvest", "early-winter", "deep-winter", "thaw"];
const DAYS_PER_SEASON = 45;

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
  const season = SEASONS[Math.floor(((day - 1) / DAYS_PER_SEASON)) % SEASONS.length];
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

/** Full absolute world-date reading (day + season + label) — what the world clock shows. */
export function worldDate(nowMs = Date.now(), epoch = getWorldEpoch()) {
  const worldDay = absoluteWorldDay(nowMs, epoch);
  const season = SEASONS[Math.floor((worldDay - 1) / DAYS_PER_SEASON) % SEASONS.length];
  return { worldDay, season, label: `World-day ${worldDay} (${season})` };
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
