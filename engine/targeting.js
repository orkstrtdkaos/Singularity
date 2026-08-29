// @ts-check
// engine/targeting.js — CCODE-250. WHO A BLOW IS AIMED AT, AND WHO GETS TO KNOW.
//
// ⛔ CCODE-288 — THE FIRST MODULE OPTED IN TO `@ts-check` (see `jsconfig.json`), and it is this one because
// its contract cost two false findings on 2026-08-28: I read `chooseTarget(...)` as if it returned the ALLY
// (it returns `{target, policy, why}`), and I called `TARGET_POLICIES.includes(...)` on an object.
// ⚠️ NO DEPENDENCY AND NO BUILD STEP — VS Code ships the checker and honours the typedefs below with
// nothing installed. The CI job for it is deliberately advisory until it has been seen green once.
//
/**
 * @typedef {Object} Ally                     an entry in the party roster a foe may aim at
 * @property {string}   id
 * @property {string}  [name]
 * @property {boolean} [downed]               ⛔ the downed are never targets, and a taunt cannot revive one
 * @property {boolean} [present]              `false` removes them from the round entirely
 * @property {number}  [threatDealt]          what they have actually done to it — the `threat` policy's input
 * @property {string[]}[contributions]        MARTIAL · HARM · RESTORE … — ⚠️ `healer` looks for RESTORE HERE,
 *                                            not at a `roles` array, which is what my fixture guessed
 * @property {number}  [hiddenAtTier]         concealment: a foe below this tier cannot see them
 * @property {{level?:number, attributes?:Record<string,number>}} [sheet]
 *                                            ⚠️ `weakest` sorts on the BEST of the four attributes
 *                                            (`resistOf`), never on a `health` field — there isn't one
 */
/**
 * @typedef {Object} FoeKnowledge             how well the foe reads your side — build with `foeKnowledge()`
 * @property {number}  tier
 * @property {boolean} canJudgeBodies         earns `weakest`
 * @property {boolean} canReadRoles           earns `healer`
 * @property {string}  fallback               what a policy degrades TO — "threat", never randomness
 */
/**
 * @typedef {Object} TargetChoice             ⛔ THE RETURN SHAPE. The ally is under `.target`, not the root.
 * @property {Ally}    target
 * @property {string}  policy                 the policy ACTUALLY used — "taunted"/"only"/"blind" are outcomes
 * @property {string}  why                    a receipt line, always present
 * @property {boolean} [taunted]
 * @property {boolean} [blindly]              ⚠️ `blind` here means CANNOT SEE — the no-preference policy is
 *                                            `mindless`, renamed on Erik's 2026-08-28 ruling
 * @property {string}  [blinded]              the policy it WANTED but could not support
 * @property {number}  [hiddenFrom]
 */
//
// ⛔ ERIK, ANSWERING THE BLOCKING QUESTION: "Yes a foe chooses who to hit... this makes the sense round
// even more interesting — you need to sense who's getting attacked so you can intervene if you want....
// if you obscure yourself you aren't going to know that information."
//
// ⚠️ THAT SECOND CLAUSE IS THE WHOLE DESIGN AND IT COSTS ALMOST NOTHING TO BUILD. The sense step already
// reveals by TIER — outcome, then intent, then band, then skill (`sb.senseVisibility`). WHO THEY ARE GOING
// FOR is simply another thing on that ladder. And obscuring instead of reading earns no tier, so the
// character who hid cannot see the blow coming for the healer.
//
// ⛔ SO THE TRADE IS REAL AND SYMMETRICAL: hiding protects YOU and blinds you to THEM. A tank who obscures
// is safe and useless; a tank who reads is exposed and can intervene. That is a decision every round, and
// it did not exist an hour ago because nothing was aimed anywhere.
//
// ⚠️ THIS FILE DECIDES AND REVEALS. It does not resolve — the round still owns that, and a 1v1 contest
// where the only target is the player must resolve exactly as it does today.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ HOW A FOE CHOOSES. Authored per opponent where it matters, defaulted where it does not.
 *  ⚠️ THE DEFAULT IS `threat` AND NOT `weakest`, deliberately: a foe that always goes for the softest
 *  target turns every fight into "protect the healer" and makes the choice mechanical. A foe that goes for
 *  what is HURTING it is answerable — you can bait it, and baiting is a decision. */
export const TARGET_POLICIES = {
  /** whoever is doing the most to it — bait-able, and the honest default */
  threat: (allies) => allies.slice().sort((a, b) => scoreThreat(b) - scoreThreat(a))[0] || null,
  /** the softest target — cruel, and right for something predatory */
  weakest: (allies) => allies.slice().sort((a, b) => resistOf(a) - resistOf(b))[0] || null,
  /** the one keeping the others up — right for something that has fought a party before */
  healer: (allies) => allies.find(a => (a.contributions || []).includes("RESTORE")) || null,
  /** ⛔ CCODE-286 — RENAMED FROM `blind` ON ERIK'S RULING: *"blind is CAN'T SEE."* The word was doing two
   *  jobs inside this one function — this policy (no preference) and the everyone-is-hidden receipt below,
   *  which genuinely means the foe cannot find you. ⚠️ TWO MEANINGS, ONE WORD, A HUNDRED LINES APART.
   *  `mindless` names the REASON there is no preference instead of describing an eye that does not work.
   *
   *  ⚠️ AND ERIK NARROWED IT FURTHER: *"a rockfall isn't a foe, it's an obstacle or a hazard."* A targeting
   *  policy is for things that CHOOSE. This is the floor for a thing that ACTS WITHOUT CHOOSING — a set
   *  body, a swarm — not for scenery, which needs no policy at all. */
  mindless: (allies, { rng = Math.random } = {}) => allies[Math.floor(rng() * allies.length)] || null,
};

function resistOf(a) {
  const at = a?.sheet?.attributes || {};
  return Math.max(0, num(at.physical), num(at.mental), num(at.social), num(at.practical));
}
function scoreThreat(a) {
  // what they have actually been doing to it, plus what they could
  return num(a?.threatDealt, 0) * 2 + ((a?.contributions || []).includes("MARTIAL") ? 3 : 0)
    + ((a?.contributions || []).includes("HARM") ? 1 : 0) + num(a?.sheet?.level, 1) / 4;
}

/** ⛔ WHAT THE FOE CAN ACTUALLY SEE — CCODE-255. Erik: "i agree with the foe having to read you as well, in
 *  addition to being able to obscure your party."
 *
 *  ⚠️ UNTIL THIS, A FOE PICKED ITS TARGET WITH PERFECT KNOWLEDGE. It knew which of you was softest and which
 *  of you was mending, for free, every round — while you had to earn the same information with a read. The
 *  sense step was one-directional, and that is the asymmetry Erik is closing.
 *
 *  ⛔ THE SHAPE THAT FELL OUT OF IT IS BETTER THAN THE ONE I WOULD HAVE DESIGNED: each policy needs a
 *  DIFFERENT QUALITY OF LOOK, and they happen to rank exactly by how cruel they are.
 *
 *    `threat`  — needs NOTHING. A foe always knows who is hurting it; it is being hit by them.
 *    `weakest` — needs a real look. Judging who will break first means assessing people, not feeling blows.
 *    `healer`  — needs a GOOD look. Knowing who is holding the others up is reading a ROLE, not a body.
 *
 *  ⚠️ SO HIDING YOUR PARTY DOES SOMETHING SPECIFIC AND LEGIBLE: it does not make you untargetable, it makes
 *  the foe stupider about WHOM it targets. A blinded predator stops finding your healer and starts swinging
 *  at whoever is hitting it — which is the tank. **That is the whole point of a tank, and it was previously
 *  impossible to achieve.** */
export const POLICY_NEEDS = { threat: 0, mindless: 0, weakest: 1, healer: 2, only: 0 };

/** ⛔ OLD NAMES THAT STILL RESOLVE. One encounter authors `blind` and old saves may carry it; a rename that
 *  silently dropped it would fall through to `threat` and hand a mindless thing a PREFERENCE it must not
 *  have — the failure being renamed away, re-committed by the rename. ⚠️ ALIASED, NOT DELETED. */
export const POLICY_ALIASES = { blind: "mindless" };
export const canonPolicy = (p) => POLICY_ALIASES[String(p || "")] || p || "threat";

/** How well the foe reads your side this round. `tier` is theirs, earned the same way yours is. */
export function foeKnowledge(tier = 0, { cfg = {} } = {}) {
  const t = Math.max(0, num(tier, 0));
  return {
    tier: t,
    canJudgeBodies: t >= num(cfg.weakestAtTier, 1),
    canReadRoles: t >= num(cfg.healerAtTier, 2),
    /** ⛔ what a policy DEGRADES to when the foe cannot support it. Not to `blind` — a foe that has been
     *  blinded is not a foe that has become random, it is a foe reduced to what it can still feel. */
    fallback: "threat",
  };
}

/** ⛔ CHOOSE. Returns the ally a blow is aimed at, and WHY — the reason is not decoration: a player who
 *  learns "it is going for Sprig" should be able to learn "because Sprig has been mending".
 *
 *  ⚠️ THE DOWNED ARE NOT TARGETS. Something already out of the fight is not what a foe swings at, and
 *  hitting them again is a different act the engine should not perform by accident. */
/** ⛔ CCODE-256 / ERIK: "A successful conceal can also make people untargetable - or at least have it be
 *  very difficult to actually hit them."
 *
 *  ⚠️ CCODE-255 made concealment blind the foe's JUDGEMENT — it could no longer pick out the healer. Erik is
 *  asking for the stronger thing: a well-hidden entity should not be on the list at all.
 *
 *  ⛔ AND THE OBVIOUS EXPLOIT HAS TO BE CLOSED IN THE SAME BREATH: if hiding were free and total, a party
 *  that all concealed would be untouchable. Two things stop that, and neither is a fudge factor.
 *    · HIDING COSTS YOUR SENSE STEP. A party that all hides has read nothing and set nothing up.
 *    · ⛔ STRIKING REVEALS YOU. If you swing, you are found — for this round, at the moment you swing.
 *  A character cannot both be hidden and be hitting people, which is the rule that makes concealment a
 *  TRADE rather than a wall.
 *
 *  ⚠️ AND IF EVERYONE IS HIDDEN, THE FOE STILL SWINGS. It does not stand paralysed — it lashes out at
 *  someone it cannot see, and `blindly` says so on the receipt so the narrator can describe a miss in the
 *  dark rather than a clean hit. Untargetable is not invulnerable. */
export function concealedFrom(entity, foeTier = 0) {
  // ⚠️ REVEALED BY YOUR OWN AGGRESSION, checked FIRST — a hidden character who strikes is not hidden, and
  // an order that checked concealment first would let a striker keep it.
  if (entity?.struck === true || entity?.revealed === true) return false;
  const hidden = num(entity?.concealment, entity?.concealed === true ? 1 : 0);
  if (hidden <= 0) return false;
  return num(foeTier, 0) < hidden;
}

export function chooseTarget(allies = [], { policy = "threat", rng = Math.random, policies = null, knowledge = null, taunt = null } = {}) {
  const live = (allies || []).filter(a => a && a.present !== false && !a.downed);
  if (!live.length) return null;

  // ⛔ CCODE-256 — A TAUNT TAKES THE CHOICE AWAY ENTIRELY, and it outranks concealment on purpose: you
  // cannot demand something's attention and also be hidden from it. Making yourself the target is the
  // opposite of hiding, and a rule that let you do both would make the protector role free.
  if (taunt?.targetId) {
    const t = live.find(a => a.id === taunt.targetId);
    if (t) return { target: t, policy: "taunted", taunted: true,
      why: `${t.name} made themselves impossible to ignore` };
  }

  // ⛔ AND THE HIDDEN ARE NOT ON THE LIST. `knowledge` absent means the foe sees perfectly, so this is inert
  // for every caller that has not adopted the read — same opt-in shape as CCODE-255.
  const seen = knowledge ? live.filter(a => !concealedFrom(a, knowledge.tier)) : live;
  if (!seen.length) {
    // ⚠️ EVERYONE IS HIDDEN. It swings anyway, at someone it cannot see.
    const flail = live[Math.floor(rng() * live.length)] || live[0];
    return { target: flail, policy: "blind", blindly: true,
      why: "it cannot find any of you — it strikes where it thinks you are" };
  }
  const hiddenFrom = live.length - seen.length;
  // ⛔ A LONE TARGET IS NOT A CHOICE, and this is the line that keeps every existing 1v1 identical.
  if (seen.length === 1) return { target: seen[0], policy: "only",
    ...(hiddenFrom ? { hiddenFrom } : {}),
    why: hiddenFrom ? "the only one of you it can still see" : "there is nobody else" };
  const table = policies || TARGET_POLICIES;

  // ⛔ CCODE-255 — CAN IT ACTUALLY SEE WELL ENOUGH TO DO WHAT IT WANTS? `knowledge` absent means yes, so
  // every existing caller and gate behaves exactly as before; a caller that supplies it opts into the read.
  // ⛔ CCODE-286: canonicalise first, so an authored or saved `blind` still resolves to `mindless` rather
  // than missing the table and silently becoming `threat`.
  policy = canonPolicy(policy);
  let used = policy, blinded = null;
  if (knowledge) {
    const need = num(POLICY_NEEDS[policy], 0);
    const has = knowledge.canReadRoles ? 2 : knowledge.canJudgeBodies ? 1 : 0;
    if (need > has) { blinded = policy; used = knowledge.fallback || "threat"; }
  }
  const pick = (table[used] || table.threat)(seen, { rng }) || seen[0];
  if (blinded) {
    return { target: pick, policy: used, blinded, ...(hiddenFrom ? { hiddenFrom } : {}),
      // ⚠️ THE RECEIPT SAYS THE FOE WAS DENIED, because "it went for the tank" and "it WANTED the healer and
      // could not find her" are different events and the second one is the party's achievement.
      why: `it could not pick out ${blinded === "healer" ? "who was mending" : "who was weakest"} — it went for ${pick.name}, who it can feel` };
  }
  return {
    target: pick,
    policy,
    why: policy === "threat" ? `${pick.name} is doing it the most harm`
      : policy === "weakest" ? `${pick.name} is the softest target`
      : policy === "healer" ? `${pick.name} is keeping the others standing`
      : "it strikes without preference",
  };
}

/** ⛔ WHAT A READ BUYS YOU ABOUT THE AIM — and what obscuring costs.
 *
 *  Erik: "you need to sense who's getting attacked so you can intervene… if you obscure yourself you aren't
 *  going to know that information."
 *
 *  ⚠️ TIERED LIKE EVERY OTHER REVEAL. A weak read tells you SOMEONE ELSE is the mark — enough to know you
 *  are not it, not enough to act. A good read names them. A decisive read names them AND the reason, which
 *  is what lets you bait it next round.
 *
 *  ⛔ TIER 0 IS THE OBSCURER'S RESULT AND IT RETURNS NOTHING. Not a guess, not a hint — the character who
 *  hid does not know, and the interception they might have made is the price of having hidden. */
export function revealTarget(choice, tier = 0, { viewerId = null, cfg = {} } = {}) {
  const t = Math.max(0, num(tier, 0));
  const minNamed = num(cfg.namedAtTier, 2);
  const minReason = num(cfg.reasonAtTier, 3);
  if (!choice?.target) return { known: false, tier: t };
  // ⚠️ CCODE-261: match the flag OR the id. A caller that knows the real id still works; one that says
  // "player" — as every gate in this repo did — now also matches the actual player on a real save.
  const isMe = (viewerId != null && choice.target.id === viewerId)
    || (viewerId === "player" && (choice.target.isPlayer === true || choice.target.kind === "player"));
  if (t <= 0) {
    return { known: false, tier: t,
      // ⚠️ EVEN AT ZERO YOU KNOW IF IT IS COMING FOR YOU — that is not a read, it is being hit.
      ...(isMe ? { aimedAtYou: true } : {}),
      why: "you did not look, and you do not know where it is going" };
  }
  if (t < minNamed) {
    return { known: false, tier: t, someoneElse: !isMe, aimedAtYou: isMe,
      why: isMe ? "it is coming for you" : "it is not looking at you" };
  }
  return {
    known: true, tier: t, targetId: choice.target.id, targetName: choice.target.name,
    aimedAtYou: isMe,
    ...(t >= minReason ? { reason: choice.why } : {}),
    why: `it is going for ${choice.target.name}`,
  };
}

/** ⚠️ CAN THIS VIEWER ACT ON WHAT THEY LEARNED? The join between the read and `intercept.js`: you may only
 *  step in front of someone you know is being aimed at. ⛔ A blind intercept is not a mechanic — it is a
 *  coin flip that costs an action, and it would make reading pointless. */
export function canInterveneFor(reveal) {
  return !!reveal?.known && !reveal.aimedAtYou;
}
