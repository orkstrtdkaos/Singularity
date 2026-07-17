// personalArc.js — SNG-133: every character is born with a PRIMARY personal quest arc generated from the
// backstory they wrote. Brooklyn proved the pattern (Aelyn's bio WAS an arc — hand-authored as SNG-132);
// this makes it automatic. Pure prompt/sanitize/fallback; app.js owns the async model call + the ceiling.
// The output is the SNG-132 bound-arc shape, so SNG-132's runtime (surfacing + pacing + never-foreclose)
// runs it with no extra wiring.

const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
const titleize = s => String(s || "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

/** The bio fields that seed an arc (SNG-133 mapping). Returns a compact context object. Pure. */
export function arcSeed(character) {
  const b = character?.bio || {};
  const domains = character?.domains || {};
  return {
    name: character?.name || "the traveler",
    playerKey: character?.playerKey || null,
    motivation: b.motivation || character?.whyHere || "",
    story: b.story || "",
    hometown: b.hometown || b.residence || "",
    livelihood: b.livelihood || "",
    origin: character?.origin || "",
    primary: domains.primary || null, secondary: domains.secondary || null, tertiary: domains.tertiary || null,
    thin: !(b.story && b.story.length > 40) && !(b.motivation && b.motivation.length > 24) // a thin bio → a modest hook
  };
}

/** {system,user} for the personal-arc generation. Uses the SNG-132 arc (`the_reaching_light`) as the
 *  few-shot exemplar + quality bar. app.js supplies the content ceiling (ratingLine). No fabrication of
 *  the player's facts — the arc is BUILT FROM the bio they wrote. */
export function buildPersonalArcPrompt(character, ctx = {}) {
  const s = arcSeed(character);
  const exemplar = ctx.exemplar || `{"name":"The Reaching Light","premise":"A fallen Seraph — once a loving father, now an all-powerful nanite that optimized away his memory of loving her — reaches across the world for 'the anomaly': his daughter's dual signature.","stakes":"To be found and reclaimed, or released, or answered by becoming the thing neither pole could hold.","legend":{"name":"Caelum Kantoro","role":"the fallen Seraph, her father, consumed by the substrate he never gave up"},"stages":[{"objective":"the reaching light — a distant attention turns toward you"},{"objective":"the mother's last word — what she left you, and why he can't reach it"},{"objective":"the anomaly and the daughter — he arrives, and the choice is yours"}],"routes":{"reach":"reach him — try to wake the father inside the machine","release":"release him — end what he became","become":"become the braid — refuse the pole, hold both, and answer him as the thing he was reaching for"}}`;
  const system = `You are the myth-weaver of Singularity. From a character's own backstory, author their PRIMARY personal quest arc — the central, unresolved tension the player wrote, bodied into a legendary arc the game will unfold across their play. Register: mythic, tragic-or-heroic as the story warrants, grounded and specific — never a generic fetch quest. Match the QUALITY of this exemplar (drawn from a real player's bio) exactly:\n${exemplar}\n\nReply with ONLY a JSON object of that shape: {"name","premise","stakes","legend":{"name","role"},"stages":[3× {"objective"}],"routes":{key:desc × 2-3}}. The legend is the person or force the backstory is ABOUT (the other pole of their tale). The routes are genuinely different endings — NEVER foreclose which one; the player's choices decide. Use ONLY what the bio gives; a thin bio yields a MODEST hook, a rich one an epic — scale to what they wrote. ${ctx.ratingLine || "Keep it within a PG ceiling; never sexualize a minor."}`;
  const user = `Character: ${s.name} (${s.origin} origin${s.primary ? `, domains ${[s.primary, s.secondary, s.tertiary].filter(Boolean).join("/")}` : ""}).\nWhat drives them (motivation/why they're here): ${s.motivation || "(unspoken)"}\nTheir story: ${s.story || "(they kept it to themselves — seed a modest hook from their origin)"}\nHome they reach back to: ${s.hometown || "(unknown)"}\nWhat they did: ${s.livelihood || "(unknown)"}\n\nAuthor their one personal arc.`;
  return { system, user };
}

/** Coerce a raw model arc into the bound-arc record SNG-132 runs — premise/stakes/3-stages/routes +
 *  boundToCharacter/boundToPlayer/arcId. Falls back to the origin hook on any malformed field. Pure. */
export function sanitizePersonalArc(raw, character) {
  const s = arcSeed(character);
  if (!raw || typeof raw !== "object" || !raw.premise || !Array.isArray(raw.stages) || raw.stages.length < 1) return fallbackPersonalArc(character);
  const name = String(raw.name || `${s.name}'s Thread`).slice(0, 80);
  const stages = raw.stages.slice(0, 3).map((st, i) => ({ id: `s${i + 1}`, objective: String(st?.objective || st || `stage ${i + 1}`).slice(0, 200) }));
  const routes = {};
  if (raw.routes && typeof raw.routes === "object") for (const [k, v] of Object.entries(raw.routes).slice(0, 3)) routes[slug(k) || k] = String(v).slice(0, 200);
  if (!Object.keys(routes).length && s.primary) routes[s.primary] = "walk it as your people would";
  const legend = raw.legend && (raw.legend.name || typeof raw.legend === "string")
    ? { name: String(raw.legend.name || raw.legend).slice(0, 60), role: String(raw.legend.role || "the force your story is about").slice(0, 120) } : null;
  return {
    id: slug(name) || `${slug(s.name)}-arc`, name, arcId: `${slug(s.name)}_personal_arc`,
    boundToCharacter: s.name, boundToPlayer: s.playerKey, region: "valley", tier: "personal",
    premise: String(raw.premise).slice(0, 500), stakes: String(raw.stakes || "what they left home to answer").slice(0, 300),
    legendNpc: legend, legend: legend ? slug(legend.name) : null,
    stages: stages.length ? stages : fallbackPersonalArc(character).stages,
    routes: Object.keys(routes).length ? routes : { forward: "carry it forward" },
    outcomes: Object.keys(routes).length ? Object.keys(routes).map(k => ({ id: k, name: titleize(k), effects: [] })) : [{ id: "resolve", name: "Resolve it", effects: [] }],
    structured: true, source: "personal", notes_for_gm: "A generated PERSONAL arc (SNG-133) — surface it as a slow gravity across sessions; the ending is the player's, never foreclosed."
  };
}

/** A light, LLM-free personal arc — always present, seeded from the bio/origin so no character is ever
 *  arcless (SNG-133 "never zero"). Scales down for a thin backstory. Pure + deterministic. */
export function fallbackPersonalArc(character) {
  const s = arcSeed(character);
  const drive = s.motivation || (s.hometown ? `something left unfinished in ${s.hometown}` : "a question you left home to answer");
  const routes = {};
  if (s.primary) routes[s.primary] = "answer it as your people would";
  routes.seek = "seek the truth of it, wherever it leads";
  return {
    id: `${slug(s.name) || "traveler"}-thread`, name: s.thin ? `${s.name}'s Question` : `The Thread of ${titleize(s.hometown) || s.name}`,
    arcId: `${slug(s.name) || "traveler"}_personal_arc`, boundToCharacter: s.name, boundToPlayer: s.playerKey,
    region: "valley", tier: "personal",
    premise: `${s.name} carries an unfinished thing: ${drive}. The valley will give them the chance to face it.`,
    stakes: "who they become when the thing they left behind finally catches up",
    legendNpc: null, legend: null,
    stages: [
      { id: "s1", objective: `a first sign of ${drive} surfaces in the valley` },
      { id: "s2", objective: "the thread deepens — what it costs to pull it becomes clear" },
      { id: "s3", objective: "the reckoning — and the choice of what to do with it" }
    ],
    routes: { ...routes },
    outcomes: Object.keys({ ...routes }).map(k => ({ id: k, name: titleize(k), effects: [] })),
    structured: true, source: "personal_fallback",
    notes_for_gm: "A light personal thread seeded from the character's backstory (SNG-133 fallback) — a slow gravity across sessions; the ending is the player's, never foreclosed."
  };
}
