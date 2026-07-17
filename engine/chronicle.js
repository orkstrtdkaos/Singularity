// chronicle.js — SNG-109: the Chronicle reads the ACCRETED self back to the player. The game computes
// the attended self (deeds, bonds, standing, the grown arc) but shows almost none of it; this assembles
// what already exists into one page that WITNESSES who the character has become. Pure assembly + the
// prompt/cache logic for one "story so far" paragraph — app.js owns the async model call and the content
// ceiling. Read-only: the Chronicle displays state, it never mutates it.
// SNG-128: extended with the World-Authorship Chronicle — a per-session log + the authorship meta-data
// (authored-vs-novel, persistence tiers, world-effect) that SURFACES what canon.js/generate.js already
// compute. Session tracking mutates a small `character.sessions` marker (pure given an injected clock).

import { GEN_TYPES, generatedRecords, effectiveWeight } from "./generate.js";

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

// ============================ SNG-128: The World-Authorship Chronicle ============================

const SESSION_GAP_HOURS = 3;   // a real-time gap this long starts a new session
const SESSION_CAP = 40;        // keep the most recent N sessions on the save

/** SNG-128: advance the session marker. A session is a real-time play span: extend the current one, or
 *  start a new one after a gap (or an explicit end). Mutates `character.sessions` (the app owns the
 *  clock — pass nowISO + worldDay). Returns the active session. Pure given the injected time. */
export function touchSession(character, { nowISO = null, worldDay = null, gapHours = SESSION_GAP_HOURS } = {}) {
  if (!character) return null;
  const list = Array.isArray(character.sessions) ? character.sessions : (character.sessions = []);
  const now = Date.parse(nowISO || "") || 0;
  const cur = list[list.length - 1];
  const gapMs = gapHours * 3600 * 1000;
  const fresh = !cur || cur.ended || (now - (Date.parse(cur.lastAt || "") || 0)) > gapMs;
  if (fresh) {
    list.push({ id: `sess-${list.length + 1}`, startedAt: nowISO, lastAt: nowISO, startDay: worldDay, endDay: worldDay, beats: 1 });
    if (list.length > SESSION_CAP) character.sessions = list.slice(-SESSION_CAP);
  } else {
    cur.lastAt = nowISO || cur.lastAt;
    if (worldDay != null) cur.endDay = worldDay;
    cur.beats = (cur.beats || 0) + 1;
  }
  return character.sessions[character.sessions.length - 1];
}

/** SNG-128: explicitly close the current session (a "next session" starts fresh). */
export function endSession(character) {
  const list = Array.isArray(character?.sessions) ? character.sessions : [];
  const cur = list[list.length - 1];
  if (cur && !cur.ended) { cur.ended = true; return cur; }
  return null;
}

const inDayRange = (d, s) => d != null && d >= (s.startDay ?? -Infinity) && d <= (s.endDay ?? Infinity);
const genCreatedDay = r => r?._gen?.provenance?.worldDay ?? r?._gen?.createdDay ?? null;

/** SNG-128: the per-session log — each session with the content that fell in its span (deeds by real
 *  time; places/people minted + canon promoted by the world-day range). Newest first. Pure. */
export function sessionLog(character) {
  const sessions = Array.isArray(character?.sessions) ? character.sessions : [];
  const deeds = character?.deeds || [];
  const locs = generatedRecords(character, "location"), npcs = generatedRecords(character, "npc");
  const all = GEN_TYPES.flatMap(t => generatedRecords(character, t));
  return sessions.slice().reverse().map(s => {
    const sDeeds = deeds.filter(d => d?.description && (
      (s.startedAt && s.lastAt && d.at) ? (d.at >= s.startedAt && d.at <= s.lastAt) : inDayRange(d.worldDay ?? d.day, s)
    ));
    const placesMinted = locs.filter(r => inDayRange(genCreatedDay(r), s));
    const peopleMet = npcs.filter(r => inDayRange(genCreatedDay(r), s));
    // SNG-139: a promotion is only "became canon" if its tier is canonical; a collision-loser lands as a
    // variant (rumor). Split so the session banner agrees with the authorship card (which counts canonical
    // as shared, variant as rumor) — one tier field, all readouts consistent.
    const promoted = all.filter(r => r._gen?.promotedWorldDay != null && inDayRange(r._gen.promotedWorldDay, s));
    return {
      id: s.id, startedAt: s.startedAt, endedAt: s.lastAt, startDay: s.startDay, endDay: s.endDay, beats: s.beats || 0, ended: !!s.ended,
      deeds: sDeeds.map(d => ({ description: d.description, weight: d.weight | 0, worldDay: d.worldDay ?? d.day ?? null })),
      placesMinted: placesMinted.map(r => r.name || r.id),
      peopleMet: peopleMet.map(r => r.name || r.id),
      canonPromoted: promoted.filter(r => r._gen.canonTier === "canonical").map(r => r.name || r.id),
      canonRumored: promoted.filter(r => r._gen.canonTier === "variant").map(r => r.name || r.id)
    };
  });
}

/** SNG-128: {system,user} for a SESSION recap paragraph — reuses the chronicle voice, scoped to one
 *  session's deeds + what was made/persisted. app.js owns the model call + ceiling (ratingLine). */
export function buildSessionPrompt(character, session, ctx = {}) {
  const name = character?.name || "the traveler";
  const s = session || {};
  const deeds = (s.deeds || []).map(d => `- (${d.weight > 0 ? "+" : ""}${d.weight}) ${d.description}`).join("\n") || "- (a quiet span — no deeds of note)";
  const made = [...(s.placesMinted || []).map(p => `place: ${p}`), ...(s.peopleMet || []).map(p => `person: ${p}`)].join("; ") || "nothing new";
  const persisted = (s.canonPromoted || []).join(", ") || "none yet";
  const system = `You are the chronicler of Singularity. Recap ONE play SESSION in warm, grounded second person, exactly ONE short paragraph (45–90 words) — what happened and what it changed, not a list. Use ONLY the facts given; invent nothing. ${ctx.ratingLine || "Keep it within a PG ceiling; never sexualize a minor."}`;
  const user = `Character: ${name}. Session ${s.id || ""} (days ${s.startDay ?? "?"}–${s.endDay ?? "?"}, ${s.beats || 0} beats).\n\nDeeds this session:\n${deeds}\n\nNew to the world this session: ${made}\nBecame shared-world canon this session: ${persisted}\n\nWrite the one-paragraph session recap.`;
  return { system, user };
}

/** SNG-128 — THE AUTHORSHIP READOUT (the meta-data Brooklyn wants). Pure over character.generated +
 *  the authored CONTENT spine + the local canon tiers (`_gen.promotedWorldDay`/`canonTier`).
 *  - authored vs novel: authored places you've stood in / people you've met, vs the novel ones you minted.
 *  - persistence: of your novel content, how much is shared-world canon / still personal / a rumor-variant.
 *  - worldEffect: the weighted fingerprint on the SHARED world (Q3 — promoted × realness weight).
 *  - topAttention: the not-yet-shared entities you've poured the most attention into (closest to real). */
export function authorshipStats(character, content = {}) {
  const all = GEN_TYPES.flatMap(t => generatedRecords(character, t));
  const authoredLocs = content.locations || {}, authoredNpcs = content.npcs || {};
  const isAuthored = (map, id) => map[id] && !map[id]._gen;   // authored spine = in CONTENT, not a minted record
  const visitedAuthored = Object.keys(character?.placeMemory || {}).filter(id => isAuthored(authoredLocs, id)).length;
  const knownAuthoredNpcs = Object.keys(character?.npcRegistry || {}).filter(id => isAuthored(authoredNpcs, id)).length;
  const authoredCount = visitedAuthored + knownAuthoredNpcs;
  const novelCount = all.length;

  const promotedShared = all.filter(r => r._gen?.promotedWorldDay != null && r._gen.canonTier === "canonical");
  const variantRumor = all.filter(r => r._gen?.promotedWorldDay != null && r._gen.canonTier === "variant");
  const personal = all.filter(r => r._gen?.promotedWorldDay == null);
  const worldEffect = promotedShared.reduce((sum, r) => sum + effectiveWeight(r), 0); // Q3: weighted, not a bare count

  const topAttention = personal
    .map(r => ({ name: r.name || r.id, type: r._gen?.type || null, score: r._gen?.engagementScore || 0, tier: r._gen?.tier || "fresh", weight: effectiveWeight(r) }))
    .sort((a, b) => b.score - a.score || b.weight - a.weight)
    .slice(0, 5);

  return {
    authoredCount, novelCount,
    persisted: { shared: promotedShared.length, personal: personal.length, rumor: variantRumor.length },
    worldEffect,
    topAttention,
    sharedNames: promotedShared.map(r => r.name || r.id),
    rumorNames: variantRumor.map(r => r.name || r.id)
  };
}

/** SNG-128 Part 3: the cross-character (family) authorship comparison — each character's headline
 *  authorship stats, so a PM/family can see how much of the shared valley each member has authored.
 *  Pure over an array of loaded characters (the app loads them + filters to opted-in). */
export function crossCharacterAuthorship(characters = [], content = {}) {
  return characters.filter(Boolean).map(c => {
    const a = authorshipStats(c, content);
    return {
      id: c.id, name: c.name || c.id, playerKey: c.playerKey || null, level: c.level || 1,
      authoredCount: a.authoredCount, novelCount: a.novelCount,
      shared: a.persisted.shared, rumor: a.persisted.rumor, worldEffect: a.worldEffect
    };
  }).sort((x, y) => y.worldEffect - x.worldEffect || y.novelCount - x.novelCount);
}
