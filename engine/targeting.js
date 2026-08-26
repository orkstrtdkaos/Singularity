// engine/targeting.js — CCODE-250. WHO A BLOW IS AIMED AT, AND WHO GETS TO KNOW.
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
  /** no pattern at all — a beast, a rockfall, something without intent */
  blind: (allies, { rng = Math.random } = {}) => allies[Math.floor(rng() * allies.length)] || null,
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
export const POLICY_NEEDS = { threat: 0, blind: 0, weakest: 1, healer: 2, only: 0 };

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
export function chooseTarget(allies = [], { policy = "threat", rng = Math.random, policies = null, knowledge = null } = {}) {
  const live = (allies || []).filter(a => a && a.present !== false && !a.downed);
  if (!live.length) return null;
  // ⛔ A LONE TARGET IS NOT A CHOICE, and this is the line that keeps every existing 1v1 identical.
  if (live.length === 1) return { target: live[0], policy: "only", why: "there is nobody else" };
  const table = policies || TARGET_POLICIES;

  // ⛔ CCODE-255 — CAN IT ACTUALLY SEE WELL ENOUGH TO DO WHAT IT WANTS? `knowledge` absent means yes, so
  // every existing caller and gate behaves exactly as before; a caller that supplies it opts into the read.
  let used = policy, blinded = null;
  if (knowledge) {
    const need = num(POLICY_NEEDS[policy], 0);
    const has = knowledge.canReadRoles ? 2 : knowledge.canJudgeBodies ? 1 : 0;
    if (need > has) { blinded = policy; used = knowledge.fallback || "threat"; }
  }
  const pick = (table[used] || table.threat)(live, { rng }) || live[0];
  if (blinded) {
    return { target: pick, policy: used, blinded,
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
  const isMe = viewerId != null && choice.target.id === viewerId;
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
