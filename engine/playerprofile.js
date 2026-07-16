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
  careful: "cautious", retreat: "cautious", defend: "cautious", guard: "cautious",
  help: "generous", give: "generous", rescue: "generous", heal: "generous",
  threaten: "ruthless", steal: "ruthless", extort: "ruthless", coerce: "ruthless", intimidate: "ruthless",
  // SNG-113 — new tendencies for the expanded roster (+ inverse "worldliness" components)
  sneak: "stealth", hide: "stealth", stealth: "stealth",
  deceive: "deception", lie: "deception", feint: "deception", bluff: "deception",
  sustain: "patient", endure: "patient", ritual: "patient", persist: "patient",
  craft: "craft", forge: "craft", repair: "craft", make: "craft", mend: "craft",
  lead: "leadership", rally: "leadership", command: "leadership", coordinate: "leadership",
  devote: "devotion", pray: "devotion", dedicate: "devotion",
  // SNG-113 §4a — the romantic/flirt tags (added SNG-100) finally have a home: the amorous tendency.
  romantic: "amorous", flirt: "amorous", woo: "amorous", seduce: "amorous"
};

const DECAY = 0.995; // legacy default — real value now lives in rules.aptitudeDecay (SNG-113)

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

/** Feed one action's intent tags into a STYLE HOLDER (a character). Mutates + returns it. SNG-113: decay is
 *  read from rules (aptitudeDecay ~0.975 — actually bites, so aptitudes are situational) with the JS constant
 *  as fallback; hysteresis + inverse aptitudes are applied in deriveAptitudes. */
export function updateProfile(holder, intentTags = [], rulesAptitudes = [], rules = {}) {
  ensureCharacterStyle(holder);
  const decay = rules.aptitudeDecay ?? DECAY;
  for (const k of Object.keys(holder.tendencies)) holder.tendencies[k] *= decay;
  for (const tag of intentTags) {
    const tendency = TAG_TO_TENDENCY[tag] || null;
    if (tendency) holder.tendencies[tendency] = (holder.tendencies[tendency] || 0) + 1;
  }
  holder.actionCount = (holder.actionCount || 0) + 1;
  holder.aptitudes = deriveAptitudes(holder, rulesAptitudes, rules);
  return holder;
}

/** SNG-113: the "worldliness" score an inverse aptitude decays UP against — the sum of its named component
 *  tendencies (ruthless/deception/amorous/carousing/…). Innocence is held while this stays below the ceiling. */
function worldliness(profile, components = []) {
  return components.reduce((s, t) => s + (profile.tendencies?.[t] || 0), 0);
}

/** Which aptitudes does this character currently hold? Data-driven, with SNG-113 mechanics:
 *  • EARNED — held when its tendency ≥ threshold; HYSTERESIS keeps a held one until the tendency falls below
 *    threshold − aptitudeKeepMargin (so a single off-tag turn never flickers it, but a real shift drops it).
 *  • INVERSE (innocence) — NEVER earned by play; granted at creation and KEPT while a composite worldliness
 *    score is below the ceiling. One-way: once worldliness crosses (or it's otherwise lost), it does not return. */
export function deriveAptitudes(profile, rulesAptitudes = [], rules = {}) {
  const held = new Set(profile.aptitudes || []);
  const margin = rules.aptitudeKeepMargin ?? 0;
  const out = [];
  for (const a of rulesAptitudes) {
    if (a.axis === "inverse") {
      if (held.has(a.id) && worldliness(profile, a.worldlinessComponents) < (a.worldlinessCeiling ?? 0)) out.push(a.id);
      continue; // inverse aptitudes are only ever GRANTED (creation), never auto-earned
    }
    const t = profile.tendencies?.[a.tendency] || 0;
    const floor = held.has(a.id) ? a.threshold - margin : a.threshold;
    if (t >= floor) out.push(a.id);
  }
  return out;
}

/** SNG-113: which held aptitudes are FADING (about to be lost) — an earned one whose tendency is within
 *  aptitudeFadeBand of its keep-floor, or an inverse one whose worldliness is within the band below its
 *  ceiling. Loss is legible: the UI shows these before they drop. Returns a Set of ids. */
export function fadingAptitudes(profile, rulesAptitudes = [], rules = {}) {
  const held = new Set(profile.aptitudes || []);
  const margin = rules.aptitudeKeepMargin ?? 0, band = rules.aptitudeFadeBand ?? 2;
  const fading = new Set();
  for (const a of rulesAptitudes) {
    if (!held.has(a.id)) continue;
    if (a.axis === "inverse") { const w = worldliness(profile, a.worldlinessComponents); if (w >= (a.worldlinessCeiling ?? 0) - band) fading.add(a.id); }
    else { const t = profile.tendencies?.[a.tendency] || 0; if (t < (a.threshold - margin) + band) fading.add(a.id); }
  }
  return fading;
}

/** SNG-113: grant background/lineage aptitudes at creation. An EARNED aptitude is seeded ABOVE its threshold
 *  (so it's held from day one, but can still be lost by playing against it). An INVERSE (innocence) aptitude
 *  is simply added to the held set — play erodes it. Idempotent. Returns the granted ids. */
export function grantAptitudes(holder, ids = [], rulesAptitudes = [], rules = {}) {
  ensureCharacterStyle(holder);
  const byId = Object.fromEntries((rulesAptitudes || []).map(a => [a.id, a]));
  const granted = [];
  for (const id of ids) {
    const a = byId[id]; if (!a) continue;
    if (a.axis !== "inverse" && a.tendency) holder.tendencies[a.tendency] = Math.max(holder.tendencies[a.tendency] || 0, (a.threshold || 0) + 2);
    if (!holder.aptitudes.includes(id)) { holder.aptitudes.push(id); granted.push(id); }
  }
  holder.grantedAptitudes = [...new Set([...(holder.grantedAptitudes || []), ...ids])]; // lineage provenance for the UI
  holder.aptitudes = deriveAptitudes(holder, rulesAptitudes, rules); // reconcile (keeps granted earned + inverse held)
  // an inverse aptitude just added must survive the reconcile even though deriveAptitudes only KEEPS held ones:
  for (const id of ids) if (byId[id]?.axis === "inverse" && !holder.aptitudes.includes(id) && worldliness(holder, byId[id].worldlinessComponents) < (byId[id].worldlinessCeiling ?? 0)) holder.aptitudes.push(id);
  return granted;
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

/** Short natural-language readout for the profile UI ("who are you becoming?"). SNG-113: marks a fading
 *  aptitude (about to be lost — legible, never silent) and a lineage-granted one. */
export function profileInsight(profile, rulesAptitudes = [], rules = {}) {
  const earned = rulesAptitudes.filter(a => profile.aptitudes?.includes(a.id));
  if (!earned.length) {
    const top = Object.entries(profile.tendencies || {}).sort((a, b) => b[1] - a[1])[0];
    return top ? `A pattern is forming: you lean ${top[0]}.` : "The world is still learning who you are.";
  }
  const fading = fadingAptitudes(profile, rulesAptitudes, rules);
  const lineage = new Set(profile.grantedAptitudes || []);
  return earned.map(a => `${a.id.replace(/_/g, " ")}${lineage.has(a.id) ? " (lineage)" : ""}${fading.has(a.id) ? " — fading" : ""}: ${a.description}`).join(" ");
}
