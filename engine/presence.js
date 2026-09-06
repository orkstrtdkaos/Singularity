// presence.js — SPEC_npc_presence_cadence: WHO IS AROUND TODAY.
//
// ⛔ THE MEASUREMENT THIS EXISTS FOR (Aevi): nothing chooses who is there. `npcsPresent` comes back IN the
// turn rather than into it, so it is the GM's own invention; KNOWN PEOPLE is the player's registry, so a
// STRANGER CAN NEVER ARRIVE FROM IT; and `generateRequest` is reactive by rule — *"the world does not spawn on
// its own here."* ⚠️ Measured on Silas: 117 authored figures, 37 met, **110 he has never met because nothing
// has ever offered them.**
//
// ⚑ ERIK SET THE CADENCE: *"riff raff or notables… pretty much every day… a heroic probably weekly, epics
// every couple weeks, legends and mythics more rarely, but definitely at special events."*
//
// ⛔ AND A RATE IS NOT A CALENDAR. Aevi: *"tier as a CEILING, not a schedule"* — "weekly" means a heroic has
// about a one-in-seven chance of being the person the day offers, NEVER "you are owed a heroic". ⚠️ A quota
// would put a heroic in an empty fen because a week elapsed, which is the thing she asked me not to build.
//
// ⚑ AND PROXIMITY IS REAL DISTANCE NOW. Her worry — *"a heroic of the Pale March should not turn up in
// Millbrook because a week elapsed"* — is answerable with geography rather than a region string, because
// `walkingDays` works for every place and 114 of 117 authored figures carry a `homeLocation`. Someone eight
// days away can still turn up; someone eighty is a different story, and the falloff says so.
//
// ⚠️ THESE ARE OFFERED, NEVER FORCED. `generateRequest` is what the GM reaches for when it needs someone who
// does not exist; this is the other half — who ALREADY exists that it does not know about.

import { walkingDays } from "./worldmap.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** ⚑ ERIK'S CADENCE, AS RATES PER DAY. `mythic` is deliberately absent: Aevi — *"a mythic appearing IS the
 *  event"*, so it is triggered by an occasion and never by elapsed time. */
export const TIER_RATE = { riffraff: 1, notable: 1, regional: 0.5, heroic: 1 / 7, epic: 1 / 14, legendary: 1 / 30 };

/** ⚑ HOW FAR A PERSON'S LIFE REACHES, in multiples of their own doorstep. ⛔ Erik's "a heroic probably
 *  weekly" is a rate for the PLAYER, not a property of the village — and the way a heroic becomes weekly is
 *  that THEY TRAVEL. A village storekeeper is in their village; a heroic has a circuit; a legend is wherever
 *  the story is. ⚠️ Measured before this: Millbrook saw a heroic once in four hundred days, because none is
 *  homed near it and home was all the model looked at. */
// ⛑ 11 / 17 / 24 IS MEASURED, NOT PICKED. Swept against Erik's own cadence on the real world; at the
// Crossing it gives heroic 1/8d, epic 1/15d, legendary 1/42d and a notable most days, against his
// "heroic probably weekly, epics every couple weeks, legends more rarely". ⚠️ The FIRST values I tried
// (8/20/60) made a legendary MORE common than an epic, which is the one ordering that must never happen.
/** ⚑ THE PLAYER'S DIAL — SPEC_npc_presence §6, "How crowded the world is", beside World pacing. A pure
 *  resolver with a hardcoded fallback, exactly as `resolvePacing` is. ⛔ It scales HOW OFTEN and never WHO:
 *  the multiplier lands on each person's daily chance, so a thronged moor is still a moor. Default `peopled`
 *  is Erik's own cadence — someone most days, a heroic weekly — which the roster already ships. */
export const PRESENCE_MODES = { solitary: 0.35, occasional: 0.7, peopled: 1, thronged: 1.6 };
export function resolvePresence(key) {
  const k = (typeof key === "string" && Object.prototype.hasOwnProperty.call(PRESENCE_MODES, key)) ? key : "peopled";
  return { key: k, mult: PRESENCE_MODES[k] };
}

export const TIER_REACH = { riffraff: 1, notable: 1, regional: 3, heroic: 11, epic: 17, legendary: 24 };

/** ⚠️ HOW MUCH BEING FAR AWAY COSTS. A day or two is nothing — people travel. Eighty days is another world,
 *  and the falloff has to say so or the roster becomes a lottery over the whole map.
 *  ⚑ THESE ARE PROBABILITIES, NOT WEIGHTS: multiplied by the tier's rate they give the chance that THIS
 *  person crosses your path TODAY, which is the sentence Erik and Aevi both wrote. */
function nearness(days) {
  if (days == null) return 0.05;              // unplaced: possible, unremarkable — never impossible
  if (days <= 1) return 0.30;                 // ⚠️ NOT higher: "someone most days" is a property of the
  if (days <= 3) return 0.16;                 //    CROWD. Four neighbours at 0.55 is the same four people.
  if (days <= 8) return 0.06;
  if (days <= 20) return 0.015;
  if (days <= 45) return 0.002;
  return 0.0002;                              // the far side of the world — their being here IS the story
}
/** A stable number from a string — so a day's roster is the SAME roster all day. ⛔ A list that reshuffled
 *  every turn would be noise the GM could not build on, and the player would see people flicker. */
function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

/** ⚑ WHO THE DAY COULD OFFER. Returns rows of `{ id, name, tier, met, days, doing, why }`, nearest-weighted
 *  and drawn against the cadence — three to six, or fewer when the world genuinely has nobody near.
 *
 *  ⛔ IT IS DETERMINISTIC PER (CHARACTER, DAY) so the same day offers the same people however many turns it
 *  takes. ⚠️ And it EXCLUDES whoever is already in the scene: the GM does not need to be told about someone
 *  it is already talking to.
 *
 *  PURE over content + the character's own registry. */
export function presentToday(character, content = {}, { day = 0, hereId = null, want = null, exclude = [], crowd = 1 } = {}) {
  const locs = content.locations || {};
  const here = locs[hereId || character?.currentLocationId] || null;
  const met = new Set(Object.keys(character?.npcRegistry || {}));
  const skip = new Set([...(exclude || []), ...(character?.company || []).map(m => m && m.npcId)].filter(Boolean));

  const pool = [];
  for (const [id, n] of Object.entries(content.npcs || {})) {
    if (!n || skip.has(id)) continue;
    if (n.status === "dead") continue;
    // ⚠️ AN UNTIERED AUTHORED PERSON IS LOCAL TEXTURE — the riffraff/notable layer, which is the baseline
    // Erik wants "pretty much every day". 47 of the 117 are exactly this and none of them carry a tier.
    const tier = String(n.tier || "notable");
    const rate = TIER_RATE[tier];
    if (!rate) continue;                       // mythic and anything unknown: an event's business, not a day's
    const theirs = locs[n.homeLocation] || null;
    const days = (here && theirs) ? walkingDays(here, theirs) : null;
    // ⛑ THE DISTANCE THAT MATTERS IS DISTANCE DIVIDED BY REACH. A heroic twenty days out is "five days out"
    // for the purpose of whether they might be here today; a storekeeper twenty days out is twenty days out.
    const felt = days == null ? null : days / (TIER_REACH[tier] || 1);
    // ⛑ THE WEIGHT IS THE CADENCE TIMES THE DISTANCE, and nothing else pretends to be either.
    const weight = rate * nearness(felt);
    if (!(weight > 0)) continue;
    // ⚑ A REAL PER-PERSON DAILY CHANCE. `rate` is how often their tier crosses a path at all; `nearness` is
    // how much of that survives the distance. The product is a probability, and the roll is stable for this
    // person on this day so the roster does not flicker between turns.
    // ⚑ the dial lands HERE and nowhere else — on how often, never on who
    const chance = Math.min(0.9, weight * Math.max(0, Number(crowd) || 1));
    const roll = seedOf(`${character?.id || "x"}|${day}|${id}`);
    if (roll >= chance) continue;              // not today
    pool.push({ id, name: n.name || id, tier, met: met.has(id), days: days == null ? null : Math.round(days * 10) / 10,
      doing: String(n.role || "").slice(0, 90), score: roll / Math.max(1e-9, chance) });
  }

  // ⛔ THE COUNT FALLS OUT OF WHO ACTUALLY TURNED UP; IT IS NOT A TARGET. A fixed "three to six" makes the
  // draw reach further and further until it finds six, which is a quota wearing a weight function — and it
  // is exactly how a heroic of the Pale March ends up in Millbrook. ⚑ A market town offers several and a
  // remote post offers one or none, and that difference is information the player should feel.
  pool.sort((a, b) => a.score - b.score);
  const out = pool.slice(0, 6).map(({ score, ...row }) => row);  return want ? out.filter(r => r.tier === want) : out;
}

/** ⛔ WHAT THE GM IS TOLD, and the framing matters more than the list. Aevi: *"the verb Erik used matters —
 *  'helping or being helped by them'. Not encountering. Not fighting."* ⚠️ A roster with no framing becomes a
 *  threat table with names, which is the failure she named. */
export function presenceForGM(character, content = {}, opts = {}) {
  const rows = presentToday(character, content, opts);
  if (!rows.length) return null;
  return rows.map(r => {
    const far = r.days == null ? "" : r.days <= 1 ? " · near" : r.days <= 5 ? ` · ${r.days}d away` : ` · ${r.days}d away, so being here is itself worth a line`;
    return `- ${r.name} (${r.tier}${r.met ? ", you have met" : ", a stranger to you"})${far} — ${r.doing || "about their own business"}`;
  }).join("\n");
}
