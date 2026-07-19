// personalArc.js — SNG-133: every character is born with a PRIMARY personal quest arc generated from the
// backstory they wrote. Brooklyn proved the pattern (Aelyn's bio WAS an arc — hand-authored as SNG-132);
// this makes it automatic. Pure prompt/sanitize/fallback; app.js owns the async model call + the ceiling.
// The output is the SNG-132 bound-arc shape, so SNG-132's runtime (surfacing + pacing + never-foreclose)
// runs it with no extra wiring.

const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
const titleize = s => String(s || "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

/** The bio fields that seed an arc (SNG-133 mapping). Returns a compact context object. Pure. */
import { namesMatch } from "./namematch.js";

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
  // SNG-171 §1c.2: HAND the author the world that exists. "Inventing a place that is not on the map
  // is the failure" — so the model is given real candidates and told to bind to them, rather than
  // asked for prose and marked wrong afterwards.
  const cand = arcAnchorCandidates(character, { locations: ctx.locations || {} });
  const anchorLines = [
    cand.location.length ? `PLACES THEY KNOW (bind by id): ${cand.location.map(c => `${c.id} (${c.name})`).join(", ")}` : "",
    cand.npc.length ? `PEOPLE THEY HAVE MET (bind by id): ${cand.npc.map(c => `${c.id} (${c.name})`).join(", ")}` : "",
    cand.item.length ? `WHAT THEY CARRY: ${cand.item.map(c => c.name).join(", ")}` : "",
    cand.people.length ? `PEOPLES THEY HAVE STANDING WITH: ${cand.people.map(c => c.id).join(", ")}` : ""
  ].filter(Boolean).join("\n");
  const exemplar = ctx.exemplar || `{"name":"The Reaching Light","premise":"A fallen Seraph — once a loving father, now an all-powerful nanite that optimized away his memory of loving her — reaches across the world for 'the anomaly': his daughter's dual signature.","stakes":"To be found and reclaimed, or released, or answered by becoming the thing neither pole could hold.","legend":{"name":"Caelum Kantoro","role":"the fallen Seraph, her father, consumed by the substrate he never gave up"},"stages":[{"objective":"the reaching light — a distant attention turns toward you"},{"objective":"the mother's last word — what she left you, and why he can't reach it"},{"objective":"the anomaly and the daughter — he arrives, and the choice is yours"}],"routes":{"reach":"reach him — try to wake the father inside the machine","release":"release him — end what he became","become":"become the braid — refuse the pole, hold both, and answer him as the thing he was reaching for"}}`;
  const system = `You are the myth-weaver of Singularity. From a character's own backstory, author their PRIMARY personal quest arc — the central, unresolved tension the player wrote, bodied into a legendary arc the game will unfold across their play. Register: mythic, tragic-or-heroic as the story warrants, grounded and specific — never a generic fetch quest. Match the QUALITY of this exemplar (drawn from a real player's bio) exactly:\n${exemplar}\n\nReply with ONLY a JSON object of that shape: {"name","premise","stakes","legend":{"name","role"},"stages":[3× {"objective"}],"routes":{key:desc × 2-3}}. The legend is the person or force the backstory is ABOUT (the other pole of their tale). The routes are genuinely different endings — NEVER foreclose which one; the player's choices decide. EVERY STAGE MUST NAME A REAL THING — add "anchors": [{"kind":"location|npc|item|people","id":"<an id from the candidate lists>"}] to each stage, drawn ONLY from the lists supplied. An anchor that does not resolve is DROPPED, so never invent a place or person that is not listed. EVERY ROUTE MUST CHANGE SOMETHING — add "outcomes": {routeKey: [{"type":"disposition","people":"<id>","delta":-3..3} | {"type":"xp","amount":N} | {"type":"codex_fact","text":"..."}]}; routes that differ only in tone are the defect this replaces. Use ONLY what the bio gives; a thin bio yields a MODEST hook about REAL things — never an abstract one — and a rich one an epic. ${ctx.ratingLine || "Keep it within a PG ceiling; never sexualize a minor."}`;
  const user = `Character: ${s.name} (${s.origin} origin${s.primary ? `, domains ${[s.primary, s.secondary, s.tertiary].filter(Boolean).join("/")}` : ""}).\nWhat drives them (motivation/why they're here): ${s.motivation || "(unspoken)"}\nTheir story: ${s.story || "(they kept it to themselves — seed a modest hook from their origin)"}\nHome they reach back to: ${s.hometown || "(unknown)"}\nWhat they did: ${s.livelihood || "(unknown)"}\n\nAuthor their one personal arc.${anchorLines ? `\n\nTHE WORLD THIS CHARACTER ACTUALLY KNOWS — anchor every stage to these:\n${anchorLines}` : ""}`;
  return { system, user };
}

/** Coerce a raw model arc into the bound-arc record SNG-132 runs — premise/stakes/3-stages/routes +
 *  boundToCharacter/boundToPlayer/arcId. Falls back to the origin hook on any malformed field. Pure. */
/** SNG-171 §1: the vocabulary an arc may bind to, and the effects a route may carry.
 *  EFFECT_KINDS mirrors engine/quests.js's structured-effect switch exactly — reusing that vocabulary
 *  is the spec's instruction and it means a personal-arc outcome is applied by the SAME code that
 *  applies an authored quest's, rather than by a second half-built path. */
export const ARC_ANCHOR_KINDS = ["location", "npc", "item", "people"];
export const ARC_EFFECT_KINDS = ["disposition", "npc_state", "codex_fact", "world_event", "location_state", "quest_seed", "ally", "xp"];

/** The real things this character could have an arc about. §1c.2: the author must be HANDED
 *  candidates from the world that exists, because "inventing a place that is not on the map is the
 *  failure". Known places, met people, carried items, peoples they have standing with. Pure. */
export function arcAnchorCandidates(character, { locations = {}, limit = 8 } = {}) {
  const out = { location: [], npc: [], item: [], people: [] };
  for (const id of Object.keys(character?.placeMemory || {})) {
    const l = locations[id];
    if (l?.name) out.location.push({ id, name: l.name });
  }
  if (character?.currentLocationId && locations[character.currentLocationId] && !out.location.some(x => x.id === character.currentLocationId)) {
    out.location.unshift({ id: character.currentLocationId, name: locations[character.currentLocationId].name });
  }
  for (const n of Object.values(character?.npcRegistry || {})) {
    if (n?.id && n?.name) out.npc.push({ id: n.id, name: n.name, bond: n.relationship || 0 });
  }
  out.npc.sort((a, b) => Math.abs(b.bond) - Math.abs(a.bond));
  for (const it of (character?.inventory || [])) {
    if (it?.name) out.item.push({ id: it.name, name: it.customName || it.name });
  }
  for (const t of Object.keys(character?.peopleDisposition || {})) out.people.push({ id: t, name: t });
  for (const k of Object.keys(out)) out[k] = out[k].slice(0, limit);
  return out;
}

/** Bind a model-proposed anchor to something that actually exists, or drop it. §1c.1: an anchor is
 *  only an anchor if it RESOLVES — prose that names a place the world does not have is the defect
 *  this exists to stop, not a near-miss to be tolerated. */
export function resolveArcAnchor(raw, candidates) {
  if (!raw) return null;
  const kind = ARC_ANCHOR_KINDS.includes(raw.kind) ? raw.kind : null;
  if (!kind) return null;
  const want = String(raw.id || raw.name || "").trim().toLowerCase();
  if (!want) return null;
  const pool = candidates?.[kind] || [];
  const hit = pool.find(c => String(c.id).toLowerCase() === want)
    || pool.find(c => String(c.name).toLowerCase() === want)
    || pool.find(c => namesMatch(c.name, want));
  return hit ? { kind, id: hit.id, name: hit.name } : null;
}

/** Clamp a route's effects to the shared vocabulary. Anything unrecognised is DROPPED rather than
 *  passed through — an effect the applier does not understand is an effect that silently does
 *  nothing, which is the `effects: []` failure wearing a different coat. */
export function sanitizeArcEffects(raw, candidates) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const e of raw.slice(0, 3)) {
    const type = e && ARC_EFFECT_KINDS.includes(e.type) ? e.type : null;
    if (!type) continue;
    if (type === "disposition") {
      const people = String(e.people || "").trim();
      const known = (candidates?.people || []).some(p => p.id === people);
      const delta = Math.max(-3, Math.min(3, Math.round(Number(e.delta) || 0)));
      if (people && delta) out.push({ type, people, delta, _unknownPeople: !known || undefined });
    } else if (type === "xp") {
      const amount = Math.max(0, Math.min(200, Math.round(Number(e.amount) || 0)));
      if (amount) out.push({ type, amount });
    } else if (type === "codex_fact") {
      if (e.text) out.push({ type, text: String(e.text).slice(0, 200), secret: !!e.secret });
    } else {
      const keep = { type };
      for (const k of ["npc", "state", "note", "event", "location", "seed", "ally", "text"]) if (e[k] != null) keep[k] = String(e[k]).slice(0, 120);
      if (Object.keys(keep).length > 1) out.push(keep);
    }
  }
  return out;
}

export function sanitizePersonalArc(raw, character, ctx = {}) {
  const s = arcSeed(character);
  if (!raw || typeof raw !== "object" || !raw.premise || !Array.isArray(raw.stages) || raw.stages.length < 1) return fallbackPersonalArc(character);
  const name = String(raw.name || `${s.name}'s Thread`).slice(0, 80);
  // SNG-171 §1a: a stage had NOWHERE to put a place, a person or a thing — id and free prose, and
  // nothing else. So "the thin place speaks in the grammar of his craft" was not the model writing
  // badly; it could not name WHERE because there was no field for where. Anchors are resolved
  // against things that actually exist, and an unresolvable one is dropped rather than kept as prose.
  const candidates = arcAnchorCandidates(character, { locations: ctx.locations || {} });
  const stages = raw.stages.slice(0, 3).map((st, i) => {
    const anchors = (Array.isArray(st?.anchors) ? st.anchors : [])
      .map(a => resolveArcAnchor(a, candidates)).filter(Boolean).slice(0, 3);
    return {
      id: `s${i + 1}`,
      objective: String(st?.objective || st || `stage ${i + 1}`).slice(0, 200),
      anchors,
      unanchored: anchors.length === 0 || undefined   // §1c.1: visible, so "not ready to show" is checkable
    };
  });
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
    // SNG-171 §1b: `effects: []` — empty BY CONSTRUCTION. Author / Unwrite / Read read as three
    // flavours of the same nothing because mechanically they were. Effects now come from the model,
    // clamped to the shared quests.js vocabulary so the SAME applier runs them.
    outcomes: Object.keys(routes).length
      ? Object.keys(routes).map(k => ({ id: k, name: titleize(k), effects: sanitizeArcEffects(raw.outcomes?.[k] ?? raw.effects?.[k], candidates) }))
      : [{ id: "resolve", name: "Resolve it", effects: [] }],
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
