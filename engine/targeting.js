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

/** ⛔ CHOOSE. Returns the ally a blow is aimed at, and WHY — the reason is not decoration: a player who
 *  learns "it is going for Sprig" should be able to learn "because Sprig has been mending".
 *
 *  ⚠️ THE DOWNED ARE NOT TARGETS. Something already out of the fight is not what a foe swings at, and
 *  hitting them again is a different act the engine should not perform by accident. */
export function chooseTarget(allies = [], { policy = "threat", rng = Math.random, policies = null } = {}) {
  const live = (allies || []).filter(a => a && a.present !== false && !a.downed);
  if (!live.length) return null;
  // ⛔ A LONE TARGET IS NOT A CHOICE, and this is the line that keeps every existing 1v1 identical.
  if (live.length === 1) return { target: live[0], policy: "only", why: "there is nobody else" };
  const table = policies || TARGET_POLICIES;
  const pick = (table[policy] || table.threat)(live, { rng }) || live[0];
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
