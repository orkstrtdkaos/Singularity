// engine/champion.js — SNG-587: SOMEBODY ELSE TAKES THE FIGHT.
//
// ⛔ ERIK 2026-09-14, on the Churn-Revel that read `beneath notice` for a level-33 character: "this could be an
// opportunity for someone else in his party to fight it… if it's too easy for the main PC, he could have
// someone else deal with it and get the experience. If it's too hard for the PC, having a legendary companion
// take care of it would make sense."
//
// ⚑ AND AEVI'S RULING BESIDE IT, WHICH IS WHY THIS MODULE EXISTS AT ALL: `relevanceFloorRatio` "should stop the
// dice offering a rat, not stop the fiction offering one… That's the version where the player decides and the
// engine informs." So a fight that is beneath the PC is not an error to suppress — it is an opportunity with
// somebody else's name on it.
//
// ⛑ TWO DIRECTIONS, ONE READING. The band a foe sits on is RELATIVE to whoever faces them (CCODE-52), so the
// same encounter is `beneath notice` for Silas and `a real fight` for Veth — and that difference IS the
// feature. Nothing here decides for the player; it says what this fight is TO EACH PERSON who could take it.
//
// ⚠️ PURE, AND EVERYTHING EXPENSIVE IS INJECTED. `sheetOf` builds a battle sheet from a record (app.js owns
// `personOpponentFor`, which needs the catalog, the tradition index and the clock); `powerOf` scores one.
// This module knows about neither, the same way `arceffects` knows nothing about the world-tick.

import { threatBand } from "./threat.js";

/** ⛔ WHO CAN BE SENT, AND WHAT THIS FIGHT IS TO THEM.
 *
 *  ⚠️ THE PLAYER IS NOT A CANDIDATE. `alliesOf` puts them first in the roster and they are already the person
 *  being asked; listing them here would offer "send yourself" beside "face it".
 *
 *  ⛑ AND "CAN THEY FIGHT" IS ASKED THE WAY THE REST OF THE GAME ASKS IT — the HARM family, which `alliesOf`
 *  has already derived through `contributionsOf` (and which Erik ruled is the default for anyone with hands).
 *  A record that carries `canStrike: false` and has not earned an override does not appear. */
export function championsFor(allies = [], foe = null, { sheetOf = null, powerOf = null, bands = null, foeThreat = null } = {}) {
  // ⛔ `foeThreat != null` FIRST, AND THAT IS NOT PEDANTRY. My first form was
  // `Number.isFinite(Number(foeThreat)) ? …` — and `Number(null)` is 0, which IS finite, so the override
  // branch won every time it was not passed and every caller got a threat of zero and an empty list.
  // ⚠️ A default that behaves like a value, which is the same shape as three other defects fixed this week.
  const threat = (foeThreat != null && Number.isFinite(Number(foeThreat))) ? Number(foeThreat)
    : Number(foe?.opponent?.threat) || Number(foe?.threat) || 0;
  if (!threat || typeof sheetOf !== "function" || typeof powerOf !== "function") return [];
  const out = [];
  for (const a of allies) {
    if (!a || a.isPlayer || a.kind === "player") continue;
    // ⚠️ PRESENT AND ABLE ARE TWO QUESTIONS and `alliesOf` answers both: someone away on a charge is not in the
    // room, and someone who cannot act is not a candidate however willing.
    if (a.present === false || a.canAct === false) continue;
    if (!(a.contributions || a.does || []).includes("HARM")) continue;
    let sheet = null;
    try { sheet = sheetOf(a.record || a); } catch { sheet = null; }
    // ⛔ NO SHEET IS A REAL ANSWER, NOT A ZERO. A person the engine cannot build a fighter from must not be
    // offered as one — sending them would resolve against a power of nothing and read as a betrayal.
    if (!sheet) continue;
    let power = 0;
    try { power = Number(powerOf(sheet)) || 0; } catch { power = 0; }
    if (power <= 0) continue;
    const band = threatBand(power, threat, bands);
    out.push({ id: a.id, name: a.name, kind: a.kind, level: Number(sheet.level) || null, power,
      band, ratio: band.ratio, sheet });
  }
  // ⛑ ORDERED BY WHO IT MEANS MOST TO. A fight that is a REAL contest for them is the one worth sending them
  // into — it is both the honest challenge and the one they grow from — so `even` sorts ahead of `beneath`,
  // and anything that would get them killed sorts last whatever their name.
  const RANK = { even: 0, hard: 1, trivial: 2, beneath: 3, dire: 4, flee: 5 };
  return out.sort((x, y) => (RANK[x.band.key] ?? 9) - (RANK[y.band.key] ?? 9) || y.power - x.power);
}

/** ⛔ WOULD SENDING THEM BE A KILLING? The bands that mean "do not" are the bands that mean it for the player
 *  too — this is the same ladder, read for a different body. A caller may still offer it; this says what it is. */
export function sendingIsGrim(champion) {
  return ["flee", "dire"].includes(champion?.band?.key);
}

/** One line for the choice row: what this fight is TO THEM, in the band's own words. */
export function championLine(champion) {
  if (!champion) return "";
  const lvl = champion.level != null ? `level ${champion.level}` : "";
  return `${lvl ? lvl + " · " : ""}${champion.band.label} to them`;
}

/** ⛔ THE FIGHT, RESOLVED IN ONE CALL — because you are not piloting it.
 *
 *  ⚠️ THIS IS DELIBERATELY NOT THE ROUND PANEL. Erik's framing is "have someone else deal with it"; a player who
 *  sends a champion is choosing NOT to fight, and handing them a six-round mini-game would be the opposite of
 *  what they asked for. The round engine stays where it belongs: on fights the player takes.
 *
 *  ⛑ THE CURVE IS DERIVED, NOT A TABLE. chance = 1 / (1 + ratio^k): at ratio 1 it is an even fight by
 *  construction, it approaches certainty as the gap widens either way, and it never reaches 0 or 1 — the
 *  legendary companion can still be embarrassed, and the outmatched friend can still come home. `k` is a dial
 *  so the curve's steepness is content's to set and not a constant of mine.
 *
 *  ⚠️ HARM SCALES WITH WHAT IT COST, not with winning or losing: a win against something above you leaves marks,
 *  and a loss to something beneath you is a bruise and a story. Returns a FRACTION of their health so the
 *  caller applies it against the sheet it owns.
 *
 *  Pure — `rng` is injected, so a send is reproducible in a test and in a replay. */
export function resolveChampion(champion, { rng = Math.random, cfg = {} } = {}) {
  if (!champion) return null;
  const ratio = Math.max(0.01, Number(champion.ratio) || 0.01);
  const k = Number(cfg.championCurve) > 0 ? Number(cfg.championCurve) : 2;
  const chance = 1 / (1 + Math.pow(ratio, k));
  const roll = rng();
  const won = roll < chance;
  // ⛑ MARGIN IS HOW DECISIVE IT WAS, in the same 0-1 space as the chance, so a caller can tell a near-run
  // thing from a walkover without a second scale to learn.
  const margin = Math.abs(chance - roll);
  // the harder it was for them, the more it costs — win or lose, and more on a loss
  const bite = Math.min(1, ratio / 2);
  const harmFraction = Math.max(0, Math.min(1, (won ? 0.25 : 0.7) * bite * (1 - margin * 0.5)));
  return { won, chance: Math.round(chance * 100) / 100, roll: Math.round(roll * 1000) / 1000,
    ratio: Math.round(ratio * 100) / 100, band: champion.band?.key || null, margin: Math.round(margin * 100) / 100,
    harmFraction: Math.round(harmFraction * 100) / 100,
    // ⛔ THE GROWTH TERM ALREADY EXISTS AND IS ALREADY AUTHORED. R37a/b: `derivedLevel` reads
    // `completions × levelPerCompletion` (authored at 1) off the person's own record, stamped where the work
    // happens. ⚠️ So "someone else gets the experience" needs no new store and no second ladder — a won fight
    // is a completion, exactly as a finished assignment is, and their level derives up from the same term.
    completion: won };
}

/** ⛔ AND THE WIN IS CREDITED THROUGH THE DOOR THAT ALREADY EXISTS.
 *
 *  ⚑ R37a (Erik 2026-09-04) made a completed assignment worth a level, `worldtick` stamps `completions`, and
 *  `derivedLevel` reads `completions × levelPerCompletion` — authored at 1. ⚠️ So "someone else gets the
 *  experience" needed no new store and no second ladder: a fight somebody won FOR you is work they did, and
 *  it credits exactly as a finished errand does.
 *
 *  ⛑ IDEMPOTENT BY RECORD, NOT BY CALLER — `creditQuestGiver`'s rule, and the reason it is safe: the ids
 *  already credited live on the person, so a re-render, a reload or a replayed turn cannot double-count.
 *
 *  Mutates the record it is handed (as `creditQuestGiver` does) and returns whether it credited. */
export function creditChampion(record, encounterId) {
  if (!record || !encounterId) return false;
  const done = Array.isArray(record.creditedFights) ? record.creditedFights : [];
  if (done.includes(encounterId)) return false;
  record.creditedFights = [...done, encounterId];
  record.completions = (Number(record.completions) || 0) + 1;
  return true;
}
