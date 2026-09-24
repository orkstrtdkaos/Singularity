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

/** ⚑ THE LOCAL CROWD, AS A PER-PERSON DAILY RATE. These are the rungs whose presence IS local texture: their
 *  reach is their own doorstep, so how many turn up SHOULD fall out of how many live nearby — that is Aevi's
 *  "a remote post offers one or none, and that difference is information". `mythic` is deliberately absent:
 *  *"a mythic appearing IS the event"*, so it is triggered by an occasion and never by elapsed time. */
export const TIER_RATE = { riffraff: 1, notable: 1, leader: 0.5 };

/** ⛔ CCODE-485 — ERIK'S CADENCE FOR THE GREAT RUNGS, IN THE UNITS HE RULED IT IN: DAYS BETWEEN OFFERS.
 *  "a heroic probably weekly, epics every couple weeks, legends more rarely."
 *  ⚠️ THIS USED TO LIVE IN `TIER_RATE` AS 1/7, 1/14, 1/30 — A PER-PERSON RATE — AND THAT IS THE WHOLE OF THE
 *  §107 RED. A per-person rate times the rung's POPULATION is the cadence the player feels, so when Aevi's
 *  seven-rung pass moved 47 untiered people onto real rungs, `heroic` went from a handful to 59 and a ruled
 *  WEEKLY became every second day. Nobody changed a number; a content pass changed a ruling. ⛑ The gate said
 *  so honestly and stayed red for it, and the note above it called for a retune — but a retune would have been
 *  me choosing balance, and it would have broken again the next time the cast grew.
 *  ⛑ SO THE FIX IS THE UNITS, NOT THE VALUES: the cadence is authored per RUNG, and the per-person chance is
 *  DERIVED from how many of that rung the world holds (see `presenceScale`). Add a hundred heroes and each one
 *  becomes rarer; the rung still arrives weekly. That is what a ruled cadence has to mean. */
export const TIER_CADENCE = { heroic: 7, epic: 14, legendary: 30 };

/** ⚑ HOW FAR A PERSON'S LIFE REACHES, in multiples of their own doorstep. ⛔ Erik's "a heroic probably
 *  weekly" is a rate for the PLAYER, not a property of the village — and the way a heroic becomes weekly is
 *  that THEY TRAVEL. A village storekeeper is in their village; a heroic has a circuit; a legend is wherever
 *  the story is. ⚠️ Measured before this: Millbrook saw a heroic once in four hundred days, because none is
 *  homed near it and home was all the model looked at. */
// ⛑ 11 / 17 / 24 IS MEASURED, NOT PICKED — swept on the real world against the cadence Erik ruled.
// ⚠️ AND IT WAS DOING TWO JOBS, WHICH IS WHY A CONTENT PASS COULD MOVE A RULING (CCODE-485). Reach means how
// far a person's life carries them; it was ALSO the knob that had been turned until the cadence came out right,
// so the cadence had no dial of its own and no way to hold when the cast changed. `TIER_CADENCE` is that dial
// now, and these numbers are only about reach again. ⚑ The FIRST values I tried (8/20/60) made a legendary MORE
// common than an epic, which is the one ordering that must never happen.
/** ⚑ THE PLAYER'S DIAL — SPEC_npc_presence §6, "How crowded the world is", beside World pacing. A pure
 *  resolver with a hardcoded fallback, exactly as `resolvePacing` is. ⛔ It scales HOW OFTEN and never WHO:
 *  the multiplier lands on each person's daily chance, so a thronged moor is still a moor. Default `peopled`
 *  is Erik's own cadence — someone most days, a heroic weekly — which the roster already ships. */
export const PRESENCE_MODES = { solitary: 0.35, occasional: 0.7, peopled: 1, thronged: 1.6 };
export function resolvePresence(key) {
  const k = (typeof key === "string" && Object.prototype.hasOwnProperty.call(PRESENCE_MODES, key)) ? key : "peopled";
  return { key: k, mult: PRESENCE_MODES[k] };
}

export const TIER_REACH = { riffraff: 1, notable: 1, leader: 3, heroic: 11, epic: 17, legendary: 24 };

/** ⛔ CCODE-485 — THE PER-PERSON CHANCE THAT MAKES A RULED CADENCE COME OUT, derived from the cast the world
 *  actually holds. For each great rung: sum every member's `nearness` at a REFERENCE PLACE, then give each
 *  person `1 / (cadenceDays × thatSum)` a day. The rung's daily total at the reference place is exactly
 *  `1 / cadenceDays`, which is Erik's sentence, and it stays there however many people the rung gains.
 *  ⛑ THE REFERENCE IS `content.startingLocation` — a value the content declares (Millbrook), not an id I chose,
 *  and where play begins is the honest place to calibrate "how often does the player meet one".
 *  ⚠️ AND IT DOES NOT FLATTEN THE MAP, which was the trap: normalising against each place's OWN sum would
 *  have made every place equally busy and undone Aevi's "'you have not met a heroic this week' is not a reason
 *  for one to appear in an empty fen". Somewhere better connected than the reference runs busier and somewhere
 *  emptier runs quieter, in proportion. Measured, the great rungs vary little by place (their reach is 11 to 24
 *  days, so distance is mostly absorbed) while the LOCAL rungs vary twelvefold — which is why those keep a
 *  per-person rate and are not normalised at all. §107 gates both halves.
 *  ⛑ MEMOISED PER CONTENT OBJECT: content is loaded once, and this is a walk of the whole cast.
 *  ⛑ AND IT HANDS BACK ITS OWN WORKING — `{ rate, sum }` — rather than only the answer. `sum` is the rung's
 *  reach-weighted size at the reference place, which is the number the rate was divided by, so anything asking
 *  whether the cadence is really the authored one can multiply the two instead of re-deriving the falloff.
 *  ⚠️ THE WIRING AUDIT ASKED FOR THIS: my first version exported the falloff function so a gate could redo
 *  the sum, and that is an export reachable only from a test — it passes CI and never fires in play, and a gate
 *  that re-implements the rule is gating its own copy of it. */
const _scaleCache = new WeakMap();
export function presenceScale(content = {}) {
  if (_scaleCache.has(content)) return _scaleCache.get(content);
  const locs = content.locations || {};
  const ref = locs[content.startingLocation] || null;
  const out = { rate: {}, sum: {} };
  for (const tier of Object.keys(TIER_CADENCE)) {
    let sum = 0;
    for (const n of Object.values(content.npcs || {})) {
      if (String(n?.tier || "notable") !== tier) continue;
      const theirs = locs[n.homeLocation] || null;
      const days = (ref && theirs) ? walkingDays(ref, theirs) : null;
      sum += nearness(days == null ? null : days / (TIER_REACH[tier] || 1));
    }
    out.sum[tier] = sum;
    // ⚠️ A RUNG WITH NOBODY IN IT: no division, and no offers — never a rate of Infinity.
    out.rate[tier] = sum > 0 ? 1 / (TIER_CADENCE[tier] * sum) : 0;
  }
  if (content && typeof content === "object") _scaleCache.set(content, out);
  return out;
}

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
 *  ⛔ IT IS DETERMINISTIC PER (PLACE, DAY) so the same day offers the same people however many turns it takes — and, since
 *  CCODE-382, to EVERYONE in that town that day: `placeKey` is the settlement (`travelers.whereOf`), and `day` the world's.
 *  ⚠️ And it EXCLUDES whoever is already in the scene: the GM does not need to be told about someone it is already talking to.
 *
 *  PURE over content + the character's own registry. */
/** ⛔ SNG-591 (Erik) — "What we should make sure the GM knows is who is (1) nearby and (2) doing things the
 *  player would (3) likely run into… does the PC help them or do they ask for the PCs help? Does the PC get
 *  saved by a higher level NPC? We fix this and we have it."
 *
 *  ⚑ THE FIRST TWO THIS MODULE ALREADY ANSWERED — nearby by reach-over-distance, doing by their own role. THE
 *  THIRD IS THIS: what KIND of meeting two people of these rungs plausibly have. A notable and a heroic do not
 *  run into each other as peers; one of them is having a day and the other is having an event.
 *
 *  ⚠️ AND IT IS THE FRAMING, WHICH AEVI ALREADY SAID IS THE PART THAT MATTERS: "the verb Erik used matters —
 *  'helping or being helped by them'. Not encountering. Not fighting. A roster with no framing becomes a
 *  threat table with names." A band distance without a verb is a number wearing the same problem.
 *
 *  ⛑ DERIVED FROM THE RUNG GAP, NEVER FROM THE NAMES. Same rung → peers, and the help runs both ways. Below
 *  you → they are the ones who would ask. One above → the hand that reaches down. Two or more → being helped
 *  by them is an EVENT, and the GM is told so rather than left to spend a legend on a Tuesday. Pure. */
export function relationOf(myBand, theirBand) {
  // ⛔ `== null` FIRST. `Number(null)` is 0 and 0 IS finite, so a missing band read as band ZERO and every
  // unbanded person came back "far above you". ⚠️ FIFTH instance of that shape this week and my second —
  // `championsFor` had it yesterday, with the same tell: a default that behaves like a value.
  if (myBand == null || theirBand == null) return null;
  const a = Number(myBand), b = Number(theirBand);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const gap = b - a;
  if (gap <= -2) return { gap, kind: "beneath", say: "far under your reach — they would ask you, or never think to" };
  if (gap === -1) return { gap, kind: "asks", say: "a rung under you — the kind of person who asks you for a hand" };
  if (gap === 0) return { gap, kind: "peer", say: "your own rung — the same kinds of work, and help runs both ways" };
  if (gap === 1) return { gap, kind: "lifts", say: "a rung above you — the hand that reaches down, if they choose to" };
  return { gap, kind: "event", say: "far above you — being helped by them is an EVENT, not a favour" };
}

export function presentToday(character, content = {}, { day = 0, hereId = null, placeKey = null, want = null, exclude = [], crowd = 1, bandOf = null, myBand = null } = {}) {
  const locs = content.locations || {};
  const here = locs[hereId || character?.currentLocationId] || null;
  const met = new Set(Object.keys(character?.npcRegistry || {}));
  const skip = new Set([...(exclude || []), ...(character?.company || []).map(m => m && m.npcId)].filter(Boolean));
  // ⛔ CCODE-382 — THE DAY'S ROLL IS THE TOWN'S, NOT THE TRAVELER'S. It was seeded by the character's id, so ⚑ Silas and Adelheid in the
  // same Millbrook square met a different set of people on 58 of 60 world-days — two players, one place, one day, two crowds. Seeded by
  // the settlement and the world-day, everyone standing there meets the same people; what differs is only what is theirs (who they
  // have met, who travels with them, how crowded they like the world — a thronged setting sees MORE of the same people, never others).
  const where = placeKey || here?.id || hereId || "x";
  const scale = presenceScale(content);        // ⛔ CCODE-485: the great rungs' per-person chance, derived once

  const pool = [];
  for (const [id, n] of Object.entries(content.npcs || {})) {
    if (!n || skip.has(id)) continue;
    if (n.status === "dead") continue;
    // ⛔ CCODE-382 — …AND NEVER SOMEONE THE WORLD BURIED. This read only the authored record, so ⚑ a legend dead in Silas's world (the One
    // Called Zeus) was offered to his GM as "around today" 20 times across 400 simulated days. The world's fate (CCODE-381) and the
    // player's own record of a death both count.
    if (character?.worldState?.epicStatus?.[id]?.status === "dead" || character?.npcRegistry?.[id]?.status === "dead") continue;
    // ⚠️ AN UNTIERED AUTHORED PERSON IS LOCAL TEXTURE — the riffraff/notable layer, which is the baseline
    // Erik wants "pretty much every day". 47 of the 117 were exactly this and none of them carried a tier.
    //
    // ⛔ SNG-590 — THAT SENTENCE IS NOW FALSE, AND ITS FALSENESS MOVED THE WHOLE DISTRIBUTION. Aevi's seven-rung
    // pass tiered the corpus: untiered went 48 → 1, and those 47 borrowed bodies left `notable` for the rungs
    // they actually belong to. ⚑ So `notable` fell from ~62 to 15 and stopped being the common rung, while
    // `heroic` rose to 55 real people and started arriving every third day against a ruled weekly.
    //
    // ⛑ THE DEFAULT STAYS, because one untiered record is still one, and a person with no rung is still local
    // texture. ✅ AND THE CADENCE IT MOVED IS FIXED AT THE ROOT (CCODE-485): a ruled cadence is now authored in
    // days per RUNG and divided by that rung's population, so a content pass can grow the cast all it likes
    // without moving a number Erik ruled. It was never a tuning ruling; it was the dial being in the wrong units.
    const tier = String(n.tier || "notable");
    // ⛑ CCODE-485: a local rung carries its own per-person rate; a great rung's is DERIVED from the cadence
    // Erik ruled and the size of that rung in this world. Two dials, each in its own units, one read here.
    const rate = (tier in TIER_CADENCE) ? (scale.rate[tier] || 0) : TIER_RATE[tier];
    if (!rate) continue;                       // mythic, an empty rung, anything unknown: not a day's business
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
    const roll = seedOf(`${where}|${day}|${id}`);
    if (roll >= chance) continue;              // not today
    pool.push({ id, name: n.name || id, tier, met: met.has(id), days: days == null ? null : Math.round(days * 10) / 10,
      doing: String(n.role || "").slice(0, 90), score: roll / Math.max(1e-9, chance),
      // ⛑ SNG-591: the rung, and what a meeting between these two rungs IS. `bandOf` is injected so this
      // module never learns the ladder — the same seam every other reader of it has.
      band: bandOf ? bandOf(tier) : null,
      relation: (bandOf && myBand != null) ? relationOf(myBand, bandOf(tier)) : null });
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
    // ⛑ SNG-591: the RELATION last and plainly, because it is the instruction — the rest is who and where.
    const rel = r.relation ? ` — ${r.relation.say}` : "";
    return `- ${r.name} (${r.tier}${r.met ? ", you have met" : ", a stranger to you"})${far} — ${r.doing || "about their own business"}${rel}`;
  }).join("\n");
}
