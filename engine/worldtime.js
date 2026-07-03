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
