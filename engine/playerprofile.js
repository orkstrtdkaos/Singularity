// playerprofile.js — play-style accrual + player identity.
// SNG-BATCH-7 Phase 1: the profile is now IDENTITY (playerKey/displayName/
// charactersPlayed); the earned STYLE (tendencies/aptitudes/actionCount) lives on
// each CHARACTER — accrued from how THAT character is played. These functions are
// generic over any "style holder" (a character); the caller passes the character.
// Every action carries intent tags; those accumulate as tendencies; crossing
// thresholds grants aptitudes — bonuses AND costs — that feed straight into resolve.js.

const TAG_TO_TENDENCY = {
  plan: "strategic", scout: "strategic", prepare: "strategic", ambush: "strategic",
  attack: "physical", climb: "physical", force: "physical", labor: "physical", brawl: "physical",
  persuade: "social", charm: "social", negotiate: "social", comfort: "social", rapport: "social",
  study: "cerebral", investigate: "cerebral", analyze: "cerebral", read: "cerebral", meditate: "cerebral",
  gamble: "carousing", drink: "carousing", revel: "carousing",
  risky: "risky", reckless: "risky",
  careful: "cautious", retreat: "cautious",
  help: "generous", give: "generous", rescue: "generous", heal: "generous",
  threaten: "ruthless", steal: "ruthless", extort: "ruthless"
};

const DECAY = 0.995; // per action — old habits fade slowly if behavior changes

/** Identity-only now (SNG-BATCH-7): playerKey / displayName / charactersPlayed. */
export function newProfile(playerKey, displayName = "") {
  return { schemaVersion: 2, playerKey, displayName, charactersPlayed: [], history: [] };
}

/** Ensure a character carries its own play-style fields (safe empty defaults). */
export function ensureCharacterStyle(c) {
  if (!c.tendencies) c.tendencies = {};
  if (!c.aptitudes) c.aptitudes = [];
  if (c.actionCount == null) c.actionCount = 0;
  return c;
}

/** Feed one action's intent tags into a STYLE HOLDER (a character). Mutates + returns it. */
export function updateProfile(holder, intentTags = [], rulesAptitudes = []) {
  ensureCharacterStyle(holder);
  for (const k of Object.keys(holder.tendencies)) holder.tendencies[k] *= DECAY;
  for (const tag of intentTags) {
    const tendency = TAG_TO_TENDENCY[tag] || null;
    if (tendency) holder.tendencies[tendency] = (holder.tendencies[tendency] || 0) + 1;
  }
  holder.actionCount = (holder.actionCount || 0) + 1;
  holder.aptitudes = deriveAptitudes(holder, rulesAptitudes);
  return holder;
}

/** Which aptitudes has this player earned? Data-driven from core rules. */
export function deriveAptitudes(profile, rulesAptitudes = []) {
  return rulesAptitudes.filter(a => (profile.tendencies[a.tendency] || 0) >= a.threshold).map(a => a.id);
}

/** Merge all earned aptitudes' modifiers into one flat map for resolve.js. */
export function aptitudeMods(profile, rulesAptitudes = []) {
  const mods = {};
  for (const a of rulesAptitudes) {
    if (!profile.aptitudes?.includes(a.id)) continue;
    for (const [k, v] of Object.entries(a.mods)) mods[k] = (mods[k] || 0) + v;
  }
  return mods;
}

/** Short natural-language readout for the profile UI ("who are you becoming?"). */
export function profileInsight(profile, rulesAptitudes = []) {
  const earned = rulesAptitudes.filter(a => profile.aptitudes?.includes(a.id));
  if (!earned.length) {
    const top = Object.entries(profile.tendencies || {}).sort((a, b) => b[1] - a[1])[0];
    return top ? `A pattern is forming: you lean ${top[0]}.` : "The world is still learning who you are.";
  }
  return earned.map(a => `${a.id.replace(/_/g, " ")}: ${a.description}`).join(" ");
}
