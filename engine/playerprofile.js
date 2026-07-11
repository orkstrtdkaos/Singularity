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

// ---------- SNG-BATCH-9 §3: content rating (the profile ceiling) ----------
// The ceiling lives on the player profile (the BATCH-7 identity anchor). It governs three
// consumers: (a) GM narration tone, (b) generation ceiling, (c) the per-entity rating tag.
// CEILING CONTROL is load-bearing: Erik sets it per family profile; a profile CANNOT
// self-elevate; R/R+ require an adult gate Erik controls; a minor profile can never exceed
// PG-13. The two FLOORS (no prohibited content; a minor is never romantic/sexual) are
// absolute and rating-INDEPENDENT — enforced at the generation birth-validator, not here.

export const RATING_ORDER = ["G", "PG", "PG-13", "R", "R+"];
export const RATING_LEVEL = { "G": 0, "PG": 1, "PG-13": 2, "R": 3, "R+": 4 };
const ADULT_MIN = "R";      // R and above require the adult gate
const MINOR_CAP = "PG-13";  // a minor profile can never be set above this

export function defaultRating() { return { preset: "PG-13", setBy: null, isMinor: false, updatedAt: null, adultVerified: false }; }
export function ratingCeiling(profile) { return profile?.rating?.preset || "PG-13"; }
export function ratingLevel(profile) { return RATING_LEVEL[ratingCeiling(profile)] ?? 2; }
export function isMinorProfile(profile) { return !!profile?.rating?.isMinor; }

/** Can this profile be set to targetPreset? Enforces the three ceiling-control rules.
 *  authority = who is setting it (a profile setting ITSELF cannot raise its ceiling);
 *  adultGate = an explicit Erik-controlled confirm, required for R/R+. */
export function canSetRating(profile, targetPreset, { authority = null, adultGate = false } = {}) {
  if (!(targetPreset in RATING_LEVEL)) return { ok: false, reason: "unknown rating" };
  const target = RATING_LEVEL[targetPreset];
  if (isMinorProfile(profile) && target > RATING_LEVEL[MINOR_CAP])
    return { ok: false, reason: `a minor profile cannot be set above ${MINOR_CAP}` };
  if (target >= RATING_LEVEL[ADULT_MIN] && !adultGate)
    return { ok: false, reason: `${targetPreset} requires the adult gate Erik controls` };
  if (authority && authority === profile?.playerKey && target > ratingLevel(profile))
    return { ok: false, reason: "a profile cannot raise its own ceiling" };
  return { ok: true };
}

/** Apply a ceiling change if permitted; returns the verdict (no-op on refusal). SNG-052: a
 *  successful R/R+ set records adultVerified so the adult-gate confirmation PERSISTS (the
 *  checkbox binds to it and stays checked on reopen); a sub-R set leaves it as-is (an explicit
 *  revoke clears it at the call site). */
export function setRating(profile, targetPreset, opts = {}) {
  const verdict = canSetRating(profile, targetPreset, opts);
  if (!verdict.ok) return verdict;
  const isAdult = RATING_LEVEL[targetPreset] >= RATING_LEVEL[ADULT_MIN];
  profile.rating = {
    ...(profile.rating || defaultRating()), preset: targetPreset, setBy: opts.authority || "erik", updatedAt: Date.now(),
    adultVerified: isAdult ? true : (profile.rating?.adultVerified || false)
  };
  return { ok: true };
}

/** SNG-052: revoke a profile's persisted adult authorization — clears adultVerified and drops
 *  any R/R+ ceiling back to PG-13. Called when Erik unchecks the adult gate and saves. */
export function revokeAdultGate(profile) {
  profile.rating = profile.rating || defaultRating();
  profile.rating.adultVerified = false;
  if (ratingLevel(profile) >= RATING_LEVEL[ADULT_MIN]) profile.rating.preset = "PG-13";
  return profile.rating;
}

/** Mark/unmark a profile as a minor. Setting minor also caps the ceiling down to PG-13. */
export function setMinorFlag(profile, isMinor) {
  profile.rating = profile.rating || defaultRating();
  profile.rating.isMinor = !!isMinor;
  if (isMinor && ratingLevel(profile) > RATING_LEVEL[MINOR_CAP]) profile.rating.preset = MINOR_CAP;
  return profile.rating;
}

/** Identity-only now (SNG-BATCH-7); SNG-BATCH-9 adds the content-rating ceiling. */
export function newProfile(playerKey, displayName = "") {
  return { schemaVersion: 2, playerKey, displayName, charactersPlayed: [], history: [], rating: defaultRating() };
}

/** Backfill the rating ceiling onto a pre-BATCH-9 profile (safe default). */
export function ensureRating(profile) {
  if (profile && !profile.rating) profile.rating = defaultRating();
  return profile;
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
