// pacing.js — SNG-080: THE WORLD MUST PUSH. Erik sat in the safest village and nothing happened,
// because the world is REACTIVE — it waits. The player must never have to ask the world to be
// interesting. Track quiet turns; past a threshold the world ACTS — escalating, and respecting the
// place (a farming village gets a frightened neighbour, not a bandit ambush). Pure + headless-testable;
// the GM narrates the pressure the engine decides to apply (Law 1).

export const QUIET_THRESHOLD = 3;

/** A turn is "eventful" (it resets the quiet counter) when the world already acted this beat: an
 *  encounter is live or was just woven, a quest changed, a scene ended, or pressure was applied. */
export function isEventfulTurn({ encounterActive = false, questChanged = false, woveEncounter = false, sceneEnded = false } = {}) {
  return !!(encounterActive || questChanged || woveEncounter || sceneEnded);
}

/** Given the running quiet-turn count and how many pressures this idle streak has already produced,
 *  return the escalation tier to apply now (0 = stay quiet). 1 rumor → 2 someone-with-a-problem →
 *  3 a-hook-that-won't-wait → 4 something-arrives. */
export function pressureTier(quietTurns, appliedThisStreak = 0, threshold = QUIET_THRESHOLD) {
  if (quietTurns < threshold) return 0;
  return Math.min(4, appliedThisStreak + 1);
}

const ESCALATION = [
  "",
  "a small rumor, sign, or unease that something is stirring — a seed, not yet a demand",
  "someone arrives who needs something, or a problem lands at the character's feet",
  "a hook that will NOT wait: a demand, a deadline, a person in real trouble now",
  "something ARRIVES — a messenger, riffraff, a body, a summons. The world moves ONTO the character.",
];

/** The GM directive for a world-pressure beat. RESPECTS the place's danger, and TIGHTENS a live
 *  quest/villain thread when there is one (the antagonist acts on their own clock). Pure. */
export function pressureDirective(tier, dangerLevel = 0, questTitles = []) {
  const t = Math.max(1, Math.min(4, tier || 1));
  const d = Math.max(0, Math.min(4, dangerLevel | 0));
  const place = d <= 1
    ? "This is a SAFE place — pressure here is human and small: a frightened neighbour, a rumor off the road, a quiet worry brought to the character. NEVER a bandit ambush here."
    : d >= 3
      ? "This is a DANGEROUS place — the pressure can have teeth."
      : "Keep the pressure proportionate to this place.";
  const thread = questTitles.length
    ? ` A quest thread is live (${questTitles.slice(0, 2).join("; ")}) — consider TIGHTENING it: the antagonist acts on their own clock whether or not the player does, and a thread ignored gets worse and comes closer.`
    : "";
  return `The scene has gone quiet, and the world must not let the player be bored. Introduce pressure INTO the fiction now — woven, never a system announcement: ${ESCALATION[t]}. ${place}${thread}`;
}
