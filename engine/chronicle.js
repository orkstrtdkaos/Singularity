// chronicle.js — SNG-109: the Chronicle reads the ACCRETED self back to the player. The game computes
// the attended self (deeds, bonds, standing, the grown arc) but shows almost none of it; this assembles
// what already exists into one page that WITNESSES who the character has become. Pure assembly + the
// prompt/cache logic for one "story so far" paragraph — app.js owns the async model call and the content
// ceiling. Read-only: the Chronicle displays state, it never mutates it.

/** Top N deeds by SALIENCE (|weight|), then recency. Weight IS the tier — a routine act makes no deed,
 *  so every deed here is something a community would actually talk about. Positive and negative both
 *  surface (a feared reputation is still a chronicle). */
export function majorDeeds(character, n = 6) {
  const deeds = (character?.deeds || []).filter(d => d && d.description);
  return deeds
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (Math.abs(b.d.weight | 0) - Math.abs(a.d.weight | 0)) || (b.i - a.i))
    .slice(0, n)
    .map(({ d }) => d);
}

/** A cheap signature of the MAJOR state — changes when something worth re-narrating changes (a major
 *  deed |w|>=2, a bond KIND/stage, a domain ceiling or acquisition, the aim, the level), NOT on every
 *  routine turn (Q2: O(deeds + bonds + domains), all small). The paragraph cache keys off this. */
export function majorStateHash(character) {
  const c = character || {};
  const majorDeedCount = (c.deeds || []).filter(d => Math.abs(d.weight | 0) >= 2).length;
  const bonds = Object.values(c.npcRegistry || {})
    .filter(n => n.bondType && n.bondType !== "platonic")
    .map(n => `${n.id}:${n.bondType}:${n.bondStage || "-"}`).sort().join(",");
  const ceilings = Object.entries(c.domainCeilings || {}).map(([k, v]) => `${k}=${v}`).sort().join(",");
  const acquired = (c.domainsAcquired || []).slice().sort().join(",");
  const aim = String(c.bio?.currentAim || c.bio?.motivation || "").slice(0, 48);
  return `d${majorDeedCount}|b${bonds}|c${ceilings}|q${acquired}|L${c.level || 1}|${aim}`;
}

/** Is the cached "story so far" paragraph out of date (or absent) vs the current major state? */
export function chronicleIsStale(character) {
  return !character?.chronicleCache?.text || character.chronicleCache.hash !== majorStateHash(character);
}

/** Build the {system, user} for the paragraph. app.js passes the assembled views (bonds/standing/arc)
 *  + the SAME content-ceiling line the GM narrates to (ratingLine) so the chronicle of an R+ character
 *  is still AUP-bounded and minor-safety floors hold. No new facts: the model uses ONLY what is given. */
export function buildChroniclePrompt(character, ctx = {}) {
  const name = character?.name || "the traveler";
  const deeds = majorDeeds(character, 8).map(d => `- (${(d.weight | 0) > 0 ? "+" : ""}${d.weight | 0}) ${d.description}`).join("\n") || "- (nothing of note yet)";
  const bonds = (ctx.bonds || []).map(b => `- ${b.name}: ${b.label}`).join("\n") || "- (no close ties yet)";
  const standing = (ctx.standing || []).map(s => `- ${s.who}: ${s.band}`).join("\n") || "- (unknown, so far)";
  const arc = ctx.arc || "(their path is still forming)";
  const system = `You are the chronicler of Singularity. Write the "story so far" for ONE character, in warm, grounded second person ("You have become…"). Exactly ONE paragraph, 60–110 words — a portrait of who this person has BECOME through what they have done and who they have bound themselves to, not a list. Concrete over grand; name real deeds and real people. Use ONLY the facts given below — invent nothing. ${ctx.ratingLine || "Keep it within a PG ceiling; never sexualize a minor."}`;
  const user = `Character: ${name}${character?.level ? ` (level ${character.level})` : ""}\nArc / who they are: ${arc}\n\nMajor deeds (weight in parens):\n${deeds}\n\nClose bonds:\n${bonds}\n\nStanding:\n${standing}\n\nWrite the one-paragraph story so far.`;
  return { system, user };
}
