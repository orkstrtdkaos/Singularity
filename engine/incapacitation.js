// engine/incapacitation.js — SNG-309: what happens when the player goes down.
//
// Erik: *"i thought there is a way to die… the game is supposed to warn you that you're entering a lethal
// encounter, but we should also just make sure all the encounters could get you killed — damage could kill
// you. So we need an incapacitation system — you wake up and the aggressor is gone with your gear, your
// companion revives you, you were slain by an assassin, but your party was able to bring you back to life
// after 27 days…"*
//
// ⚠️ HE WAS RIGHT AND I WAS WRONG. I reported "the engine never kills a player", quoting `encounters.js`
// line 6. That comment describes the DEFAULT; `app.js` has always set `character.dead = true` when the
// encounter def carries `lethal: true`. What is true is that death was almost UNREACHABLE — **2 of 19
// encounter defs are lethal, 0 of 96 random encounters, 0 of 7 bestiary entries** — so in practice a player
// could be killed by a wild boar or a greatcat and by nothing else in the game. Not by an assassin. Not by
// a legend. The mechanism existed; the coverage was two animals.
//
// AND IT WAS A TERMINUS, WHICH CONTRADICTS THE GAME'S OWN DEATH MODEL. `character.dead = true` makes the
// roster say *"their story is over"* and refuse to load them — while `death.js` (SNG-209) has held, since it
// was written, that **death is a STATE, not a terminus**: a depth, a clock, and a road back. Its own header
// says the deferred piece is *"the roads BACK … player-death UX … ROUND 2"*. This is round 2.
//
// THE SHAPE:
//
//   health <= 0  →  INCAPACITATED  →  an OUTCOME, decided by who put you there and who was with you
//
// Going down is never instantly fatal. What happens *next* is the interesting part, and it is the part Erik
// listed: a companion brings you round · you wake and your gear is gone · the one who beat you lets you live
// · you are finished off. Only the last is death, and death enters the SAME ladder every figure is on, so
// "your party brought you back after 27 days" is not a special case — it is `deathDepth` and the retrieval
// model that already exist, finally pointed at the player.
//
// ⛔ INTENT, NOT MORALITY (DIRECTIVE SNG-280). The weights key on what the aggressor CAME TO DO. An assassin
// finishes you because finishing you was the errand; a boar mauls you and wanders off because it is a boar.
// Nothing here reads alignment, tradition, or whether the aggressor is a villain — a heroic duelist who
// fought you to a standstill and an abyssal one behave identically, because a duel is a duel.
//
// Pure. Reads the character, the aggressor and the dials; returns a PLAN. Every mutation is the caller's.

/** The four ways being put down can end. `slain` is the only one that is death. */
export const INCAP_OUTCOMES = ["revived", "spared", "left_for_dead", "slain"];

/** Fallbacks, used only when `rules.incapacitation` is unauthored. ⚠️ EVERY AGGRESSOR CAN KILL — Erik: "we
 *  should also just make sure all the encounters could get you killed". There is no zero in the `slain`
 *  column; what differs is how likely, and why. */
const DEFAULT_WEIGHTS = {
  // who put you down          revived  spared  left_for_dead  slain
  beast:      { revived: 2, spared: 0, left_for_dead: 6, slain: 2 },   // it mauls you and moves on
  duelist:    { revived: 2, spared: 5, left_for_dead: 2, slain: 1 },   // they won; the point was winning
  raider:     { revived: 1, spared: 1, left_for_dead: 6, slain: 2 },   // they wanted what you carry
  assassin:   { revived: 1, spared: 0, left_for_dead: 1, slain: 8 },   // finishing you WAS the errand
  hazard:     { revived: 3, spared: 0, left_for_dead: 4, slain: 3 },   // a cliff has no intent at all
  _default:   { revived: 2, spared: 2, left_for_dead: 4, slain: 2 },
};

const DEFAULTS = {
  /** A declared-lethal encounter multiplies the slain weight. The warning (`lethalOfferClamp`) exists so this
   *  is never a surprise: the choice is labelled "⚠ … (lethal stakes)" and a Decline is forced into the list. */
  lethalSlainMult: 4,
  /** A companion who can reach you is the difference between waking up and not. Multiplies `revived`. */
  companionReviveMult: 6,
  /** …and they cannot pull you back from a finished job: a companion cannot beat an assassin's intent, only
   *  make the other outcomes likelier. Slain stays reachable however many friends you brought. */
  daysDown: { revived: 1, spared: 1, left_for_dead: 3 },
  /** How much of what you carry is taken when you are left where you fell. */
  gearTakenFraction: 0.5,
};

function cfgOf(rules) { return { ...DEFAULTS, ...(rules?.incapacitation || {}) }; }

/** Weighted pick over an object of name -> weight. Returns null if every weight is 0. */
function pick(weights, rng) {
  const entries = Object.entries(weights).filter(([, w]) => Number(w) > 0);
  const total = entries.reduce((s, [, w]) => s + Number(w), 0);
  if (!total) return null;
  let r = rng() * total;
  for (const [k, w] of entries) { r -= Number(w); if (r <= 0) return k; }
  return entries[entries.length - 1][0];
}

/** ⚠️ WHAT KIND OF THING PUT YOU DOWN — read from what the encounter already knows, never guessed from a
 *  name. An unrecognised aggressor falls to `_default`, which can still kill: an unknown assailant being
 *  harmless-by-default is exactly how "everything can kill you" quietly becomes "nothing can". */
export function aggressorKind(aggressor = {}, encounter = {}) {
  const explicit = aggressor.aggressorKind || encounter.aggressorKind || null;
  if (explicit && DEFAULT_WEIGHTS[explicit]) return explicit;
  if (aggressor.kind === "beast" || aggressor.beast || encounter.kind === "hunt") return "beast";
  if (encounter.kind === "hazard" || encounter.unopposed) return "hazard";
  if (aggressor.strike || aggressor.assassin) return "assassin";
  if (encounter.kind === "duel" || encounter.kind === "challenge") return "duelist";
  return "_default";
}

/** THE DECISION. Returns what happened and everything the caller needs to apply it.
 *
 *  `{ outcome, kind, daysDown, gearTaken[], reviver, slain, why }` — `slain` is the flag that sends the
 *  player into the death state; nothing here writes it. */
export function incapacitationOutcome({
  character = {}, aggressor = {}, encounter = {}, companions = [],
  rules = {}, rng = Math.random,
} = {}) {
  const cfg = cfgOf(rules);
  const kind = aggressorKind(aggressor, encounter);
  const table = (rules?.incapacitation?.byAggressor || DEFAULT_WEIGHTS)[kind]
    || (rules?.incapacitation?.byAggressor || DEFAULT_WEIGHTS)._default
    || DEFAULT_WEIGHTS._default;

  const weights = { ...table };
  // A declared-lethal encounter is likelier to end you — and you were TOLD, which is the whole point of
  // `lethalOfferClamp` forcing an explicit choice and a Decline option into the list.
  if (encounter.lethal) weights.slain = (weights.slain || 0) * (Number(cfg.lethalSlainMult) || 1);
  // Someone who can reach you changes what waking up looks like.
  const able = (companions || []).filter(c => c && c.down !== true);
  if (able.length) weights.revived = (weights.revived || 0) * (Number(cfg.companionReviveMult) || 1);
  else weights.revived = 0;                       // nobody to do it — not a smaller chance, none

  const outcome = pick(weights, rng) || "left_for_dead";
  const inv = Array.isArray(character.inventory) ? character.inventory : [];
  const takeN = outcome === "left_for_dead" || outcome === "slain"
    ? Math.floor(inv.length * (Number(cfg.gearTakenFraction) || 0)) : 0;
  // ⚠️ TAKEN FROM THE END, DETERMINISTICALLY — a random subset would make the same seed produce different
  // losses on a replay, and a save that cannot be reproduced cannot be debugged.
  const gearTaken = takeN > 0 ? inv.slice(-takeN).map(i => i?.customName || i?.name).filter(Boolean) : [];

  return {
    outcome, kind,
    slain: outcome === "slain",
    daysDown: outcome === "slain" ? null : (cfg.daysDown?.[outcome] ?? 1),
    gearTaken,
    // ⛔ WHO revived you, so the narration is about a person rather than a mechanic. Null when nobody did.
    reviver: outcome === "revived" ? (able[0]?.name || able[0]?.id || null) : null,
    why: {
      beast: "it had no interest in you once you stopped moving",
      duelist: "they had come to win, and they had won",
      raider: "they had come for what you were carrying",
      assassin: "finishing you was the errand",
      hazard: "the world is not trying to kill you; it simply does not stop",
      _default: null,
    }[kind] || null,
  };
}

/** ⚠️ IS THIS CHARACTER'S STORY ACTUALLY OVER? Only if the death SEALED.
 *
 *  The roster used to refuse to load anyone with `character.dead`, which made every death final and
 *  contradicted the model the rest of the game runs on. A death at the threshold or in the near dark is a
 *  character whose party can still come for them; a sealed one is the terminus SNG-209 says it is.
 *
 *  ⚠️ IN THE ENGINE, NOT IN app.js, SO A TEST CAN CALL IT. The last four of these decisions that lived
 *  inline in the app were gated by regexes over source, and two of them were wrong in ways the regex
 *  matched anyway. */
export function deathStopsPlay(character, currentDay = null, rules = {}) {
  if (!character) return false;
  if (character.status !== "dead" && !character.deathState) return false;
  const day = currentDay ?? character.clock?.day ?? null;
  return _sealed(character, day, rules);
}

/** The line the roster shows: where they are, and whether anyone can still reach them. */
export function deathLine(character, currentDay = null, rules = {}) {
  const day = currentDay ?? character?.clock?.day ?? null;
  const depth = _depth(character, day, rules);
  const name = character?.name || "They";
  if (depth >= 3) return `${name} is sealed. That road is closed now — their story is over.`;
  const where = ["at the threshold", "in the near dark", "in the deep dark"][depth] || "in the dark";
  return `${name} fell in the valley and is ${where}. Someone can still reach them.`;
}

// ⚠️ THE DEPTH RULE IS `death.js`'s AND MUST NOT BE RE-DERIVED HERE. A second copy of "how deep is this
// death" is the surest way to end up with two answers — the injury model, the tier ladder and the arc-stage
// lookup have each been duplicated in this codebase and each time the copies drifted. These two thin
// wrappers exist only so this module does not import a circular dependency at load time.
let _deathMod = null;
function _mod() { return _deathMod; }
/** Injected by `wireDeathModel` so `death.js` stays the single owner of depth. */
export function wireDeathModel(mod) { _deathMod = mod; }
function _depth(entity, day, rules) {
  const m = _mod();
  if (m?.deathDepth) return m.deathDepth(entity, day, rules);
  // Fallback ONLY for a caller that never wired it: dead-with-no-record reads as the near dark, exactly as
  // `death.js` does. Deliberately not a re-implementation of the clock — an unwired caller gets the
  // conservative answer (retrievable), never a wrong sealed.
  return entity?.deathState?.sealed ? 3 : (entity?.status === "dead" ? 1 : 0);
}
function _sealed(entity, day, rules) { return _depth(entity, day, rules) >= 3; }

/** ⚠️ WHAT A PLAYER DEATH IS. Erik: *"you were slain by an assassin, but your party was able to bring you
 *  back to life after 27 days."* That sentence is not a feature request — it is `death.js` already, and the
 *  player has simply never been on it.
 *
 *  So this returns the arguments for `enterDeathState`, the SAME call every figure gets. `bodyStatus` is the
 *  only thing that differs by how you died, and it matters: a body nobody can find starts in the deep dark
 *  (`deathDepth` forces depth >= 2 on `lost`), which is what makes being killed by an assassin who hid you
 *  worse than falling in front of your own party.
 *
 *  ⛔ `character.dead` MUST NOT BE SET FROM THIS. That flag makes the roster say "their story is over" and
 *  refuse to load the character — it is the TERMINUS, and it belongs only to a SEALED death. While a death
 *  is retrievable the character is dead and still on the board, which is the entire point of SNG-209. */
export function playerDeathState(plan = {}, { worldDay = 0 } = {}) {
  const lost = plan.kind === "assassin" || plan.kind === "hazard";
  return {
    diedDay: worldDay,
    bodyStatus: lost ? "lost" : "intact",
    sealed: false,          // never one-way at the moment of death; the CLOCK seals a death nobody tends
    cause: plan.kind === "assassin" ? "slain — the errand was you"
      : plan.kind === "beast" ? "killed by something that was only hungry"
      : plan.kind === "hazard" ? "the world simply did not stop"
      : "killed in a fight they chose",
  };
}
