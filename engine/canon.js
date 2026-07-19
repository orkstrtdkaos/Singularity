// canon.js — SNG-BATCH-9 Phase 3: the shared world. Personal-canon entities that a player
// grew real (Phase 1/2) EARN their way into a shared-canon store the whole world reads. Three
// composed mechanisms, all PURE + headless-testable here (the sync orchestration that carries
// them across the repo lives in worldtick.js; the LLM re-narration is INJECTED):
//
//   1. EARNED auto-promotion — a nominated-tier entity (its weight crossed the engagement
//      threshold; Phase-2 `nominationsFor` already surfaces it) promotes to shared canon. The
//      threshold IS the gate — no human curator.
//   2. CONTRADICTION → RANK — a promoting entity that collides with existing canon fires an
//      OPPOSED ROLL weighted by each side's realness (effectiveWeight). Winner = loud canonical
//      reality; loser drops to a VARIANT/rumor tier — it persists, stays discoverable, and can
//      be contested later. Authored core canon sits at a HIGH weight floor: the designed spine
//      does not get overwritten by a passing invention.
//   3. RATING-LENS — shared canon is a SUPERSET; each player receives the subset at/below their
//      profile's rating ceiling vs each entity's rating tag. Above-ceiling that can dial down →
//      ADAPTIVE RE-NARRATION (softened per ceiling); above-ceiling that cannot → FILTERED
//      (absent). THE FLOORS stay ABSOLUTE — minor-protection is a hard exclude, never a
//      softening; adaptation only ever dials DOWN.
//
// Design law 1: the ENGINE owns promotion/collision/ranking/filtering; nothing here calls an
// LLM directly (adaptFn is injected) and nothing here fabricates — it composes state stamped at
// birth. Never throws for the caller: every function returns a usable value.

import { namesMatch } from "./namematch.js";
import { effectiveWeight, GEN_TYPES, generatedRecords } from "./generate.js";
import { RATING_LEVEL, ratingLevel, isMinorProfile } from "./playerprofile.js";

export const CANON_SCHEMA_VERSION = 1;
 // registry:internal

// The gate: only entities the engagement governor raised to NOMINATED promote (Phase-2
// `nominationsFor` surfaces exactly these). A weight floor can raise the bar further.
export const PROMOTE_TIER = "nominated";
 // registry:internal
export const PROMOTE_WEIGHT_FLOOR = 0;
 // registry:internal

// Authored core canon is the designed spine — it sits at a weight a generated entity effectively
// never out-rolls, so a promotion that collides with authored content becomes a variant, not an
// overwrite. (Not Infinity: a wildly-attended generated legend should still *occasionally* tie
// the fiction toward itself — the roll stays a roll, just a near-hopeless one.)
export const AUTHORED_CANON_WEIGHT = 100;

// Content that CANNOT be dialed down to a lower ceiling: sexual framing has no in-ceiling analog
// for a G/PG audience (you don't "gently" show sex to a child) — it FILTERS rather than adapts.
// Violence / gore / dread / language CAN re-narrate softer, so they ADAPT.
const SEXUAL_MARKERS = /\b(sexual|erotic|nude|naked|seduc\w*|lust\w*|carnal|aroused|fondl\w*|intimate|in bed|make love|bedded|orgy|brothel)\b/i;
const HARD_INTENSITY_MARKERS = /\b(gore|gory|disembowel\w*|mutilat\w*|eviscerat\w*|torture|flay\w*|slaughter\w*|butcher\w*|blood(y|ied|bath)?|massacre|rape|savage\w*)\b/i;

// ---------- the store ----------

/** A fresh shared-canon store for a region. `entities` = current canonical records keyed by
 *  entityId; `variants` = records that lost a contradiction (each carries `_canon.rivalId`),
 *  kept discoverable + contestable. */
export function ensureCanonStore(store, regionId = "valley") {
  if (!store || typeof store !== "object") store = {};
  if (store.schemaVersion == null) store.schemaVersion = CANON_SCHEMA_VERSION;
  if (!store.regionId) store.regionId = regionId;
  if (!store.entities || typeof store.entities !== "object") store.entities = {};
  if (!Array.isArray(store.variants)) store.variants = [];
  return store;
}

/** All current canonical records in the store. */
export function canonRecords(store) {
  return Object.values(ensureCanonStore(store).entities);
}

// ---------- promotion (pure) ----------

/** The local entities eligible to promote right now: nominated-tier, weight at/above the floor,
 *  and NOT already promoted (idempotent — `_gen.promotedWorldDay` marks a record as landed).
 *  Returns [{ record, weight }], strongest first. */
export function promotionCandidates(character, { weightFloor = PROMOTE_WEIGHT_FLOOR } = {}) {
  const all = GEN_TYPES.flatMap(t => generatedRecords(character, t));
  return all
    .filter(r => r?._gen?.tier === PROMOTE_TIER && r._gen.promotedWorldDay == null && effectiveWeight(r) >= weightFloor)
    .map(r => ({ record: r, weight: effectiveWeight(r) }))
    .sort((a, b) => b.weight - a.weight);
}

/** Build the shared-canon record from a local generated record: authored-shape fields at top
 *  level (so it's indistinguishable downstream, exactly like the local store), plus a `_canon`
 *  envelope carrying the realness + provenance + rating the lens and future contests read.
 *  The local `_gen` sidecar is dropped — engagement is the origin player's private frame. */
export function buildCanonRecord(record, { worldDay = null, tier = "canonical" } = {}) {
  const g = record._gen || {};
  const authored = {};
  for (const [k, v] of Object.entries(record)) if (k !== "_gen") authored[k] = v;
  authored._canon = {
    entityId: record.id,
    type: g.type || null,
    weight: effectiveWeight(record),
    rating: g.rating || null,
    tier,                                  // 'canonical' | 'variant'
    provenance: g.provenance || null,
    // SNG-128: a friendly attribution alias so the authorship readout can name WHO authored this shared
    // record without reaching into provenance (the data was always there; this surfaces it cleanly).
    contributedBy: g.provenance ? { playerKey: g.provenance.playerKey || null, characterId: g.provenance.characterId || null } : null,
    promotedWorldDay: worldDay,
    birthWeight: g.birthWeight ?? null
  };
  return authored;
}

/** SNG-128: per-contributor tally of the SHARED canon store — how much of the world each player has made
 *  real. Reads `_canon.contributedBy` (or falls back to `_canon.provenance`) on every canonical + variant
 *  record. Returns { [playerKey]: { promoted, variant, weight, characters:Set→[] } }. Pure. */
export function contributionsBy(store) {
  const s = ensureCanonStore(store);
  const out = {};
  const who = r => r?._canon?.contributedBy || r?._canon?.provenance || {};
  const bump = (rec, key) => {
    const w = who(rec); const pk = w.playerKey || "unknown";
    const e = out[pk] || (out[pk] = { playerKey: pk, promoted: 0, variant: 0, weight: 0, _chars: new Set() });
    e[key]++; e.weight += (rec?._canon?.weight ?? 1); if (w.characterId) e._chars.add(w.characterId);
  };
  for (const rec of Object.values(s.entities)) bump(rec, "promoted");
  for (const rec of s.variants) bump(rec, "variant");
  return Object.fromEntries(Object.entries(out).map(([k, e]) => [k, { playerKey: e.playerKey, promoted: e.promoted, variant: e.variant, weight: e.weight, characters: [...e._chars] }]));
}

/** Realness weight of any record — a canon record (`_canon.weight`), an authored-content record
 *  (the high spine floor), or a fresh generated record (`effectiveWeight`). */
export function weightOf(record, { authored = false } = {}) {
 // registry:internal
  if (authored) return AUTHORED_CANON_WEIGHT;
  if (record?._canon) return record._canon.weight ?? 1;
  return effectiveWeight(record);
}

/** Find an existing canonical entity — in shared canon or authored core content — that this
 *  incoming (type, name) collides with. Reuses the SNG-019 name primitive. Returns
 *  { where:'canon'|'authored', id, weight, record } or null. Authored core is checked first so
 *  the spine always registers as the thing to contend with. */
export function findCanonCollision(type, name, { canon = {}, authored = {} } = {}) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const scan = (pool, sameType) => {
    for (const [id, rec] of Object.entries(pool || {})) {
      if (sameType && rec?._canon && rec._canon.type && type && rec._canon.type !== type) continue;
      const label = rec?.name || rec?.label || id.replace(/-/g, " ");
      if (namesMatch(raw, label) || namesMatch(raw, id.replace(/-/g, " "))) return { id, rec };
    }
    return null;
  };
  const inAuthored = scan(authored, false);
  if (inAuthored) return { where: "authored", id: inAuthored.id, weight: AUTHORED_CANON_WEIGHT, record: inAuthored.rec };
  const inCanon = scan(canon, true);
  if (inCanon) return { where: "canon", id: inCanon.id, weight: weightOf(inCanon.rec), record: inCanon.rec };
  return null;
}

/** The weighted opposed roll: two realnesses contend for the loud canonical slot. P(incoming
 *  wins) = wIn / (wIn + wExisting). A generated entity (weight ~1–30) vs authored spine
 *  (weight 100) wins ~<25% at best and usually far less — the designed world holds. rng is
 *  injected (deterministic tests). Returns { incomingWins, p, roll }. */
export function resolveContradiction(incomingWeight, existingWeight, rng = Math.random) {
  const wIn = Math.max(1, incomingWeight || 1);
  const wEx = Math.max(1, existingWeight || 1);
  const p = wIn / (wIn + wEx);
  const roll = rng();
  return { incomingWins: roll < p, p, roll };
}

/** Promote a set of candidates INTO a store (mutates + returns { store, results }). For each
 *  candidate: no collision → land canonical; collision → weighted opposed roll: winner is
 *  canonical, loser is filed as a variant (persists, discoverable, contestable). Authored
 *  collisions can only be *contended* (authored records live in `authored`, never in the store),
 *  so an incoming win still writes the generated entity to canon but tags it as having overtaken
 *  the spine locally; an incoming loss files it as a variant of the authored id. Pure given rng.
 *
 *  results: [{ entityId, outcome:'landed'|'won'|'variant', against?, rivalId?, weight }]. */
/** PURE (CCODE-04). Is this "collision" actually the candidate's OWN previously-promoted copy,
 *  rather than a genuine rival? True only when the entity id matches AND the same character
 *  authored both. Two DIFFERENT characters who each grew a "Calvar" are a real contest and must
 *  still contest — this only recognises a record meeting itself after a retry. */
export function isSameEntity(rec, collision) {
  const other = collision?.record;
  if (!other) return false;
  const sameId = collision.id === rec.id || other?._canon?.entityId === rec.id;
  if (!sameId) return false;
  const mine = rec?._gen?.provenance || {};
  const theirs = other?._canon?.contributedBy || other?._canon?.provenance || {};
  // POSITIVE attribution match only. Without it we cannot prove this is our own record, and
  // guessing "self" would silently skip a genuine contest between two players who each grew a
  // same-named entity — a worse failure than the one being fixed. Every real promoted record
  // carries provenance (the live Calvar/Vash both do), so the retry case is covered.
  if (!mine.characterId || !theirs.characterId) return false;
  return mine.characterId === theirs.characterId;
}

export function promoteInto(store, candidates, { authored = {}, worldDay = null, rng = Math.random } = {}) {
  ensureCanonStore(store);
  // `authored` may be a flat pool or a type→pool getter (so an authored NPC and an authored
  // location that happen to share a name never cross-collide).
  const authoredFor = typeof authored === "function" ? authored : () => authored;
  const results = [];
  for (const cand of candidates) {
    const rec = cand.record || cand;
    const type = rec._gen?.type || null;
    const weight = cand.weight ?? effectiveWeight(rec);
    const collision = findCanonCollision(type, rec.name, { canon: store.entities, authored: authoredFor(type) });

    // CCODE-04: A RETRY MUST NEVER CONTEST A RECORD AGAINST ITSELF.
    // Promotion runs inside pushMergedFile's merge callback, which RE-RUNS against a freshly-read
    // remote on every attempt. If attempt 1 landed server-side but its response was lost (GH_TIMEOUT
    // or a 409), attempt 2 re-reads, finds the record it just wrote, treats it as a rival, and can
    // demote the entity to a "variant" of itself — which is exactly what happened to Calvar and Vash
    // in the live valley (`rivalId === entityId`, contributed by the same character). Promotion has to
    // be IDEMPOTENT under retry, the same property mergeBeat has for scenes.
    if (collision && collision.where === "canon" && isSameEntity(rec, collision)) {
      results.push({ entityId: collision.id, outcome: "already", weight });
      continue; // already landed on a previous attempt — not a contest, and never a demotion
    }
    // Same story if the prior attempt landed it in the variants pile: don't mint a second copy.
    const priorVariant = (store.variants || []).findIndex(v => isSameEntity(rec, { id: v?.id, record: v }));
    if (priorVariant >= 0 && !collision) {
      results.push({ entityId: store.variants[priorVariant].id, outcome: "already", weight });
      continue;
    }

    if (!collision) {
      const cr = buildCanonRecord(rec, { worldDay, tier: "canonical" });
      store.entities[cr.id] = cr;
      results.push({ entityId: cr.id, outcome: "landed", weight });
      continue;
    }

    const verdict = resolveContradiction(weight, collision.weight, rng);
    if (verdict.incomingWins) {
      // the invention out-rolled what stood here — it becomes the loud reality.
      const cr = buildCanonRecord(rec, { worldDay, tier: "canonical" });
      cr._canon.overtook = collision.id;
      // the displaced canon record (if it was a generated canon record, not authored) drops to variant
      if (collision.where === "canon" && store.entities[collision.id]) {
        const loser = store.entities[collision.id];
        loser._canon.tier = "variant";
        loser._canon.rivalId = cr.id;
        store.variants.push(loser);
        delete store.entities[collision.id];
      }
      store.entities[cr.id] = cr;
      results.push({ entityId: cr.id, outcome: "won", against: collision.id, weight });
    } else {
      // the standing canon (or authored spine) held — the newcomer is a variant/rumor of it.
      const cr = buildCanonRecord(rec, { worldDay, tier: "variant" });
      cr._canon.rivalId = collision.id;
      store.variants.push(cr);
      results.push({ entityId: cr.id, outcome: "variant", rivalId: collision.id, weight });
    }
  }
  return { store, results };
}

/** Concurrency safety net: merge two versions of the store (two players promoted between one's
 *  fetch and push). Union of entities; on the SAME entityId in both, the higher realness holds
 *  the canonical slot and the other drops to a variant (a deterministic proxy for the roll —
 *  the primary weighted contest already ran in promoteInto; this only reconciles a race). Pure. */
export function mergeCanonStores(a, b) {
  const A = ensureCanonStore(structuredCloneSafe(a));
  const B = ensureCanonStore(b || {});
  for (const [id, recB] of Object.entries(B.entities)) {
    const recA = A.entities[id];
    if (!recA) { A.entities[id] = recB; continue; }
    const wA = weightOf(recA), wB = weightOf(recB);
    if (wB > wA) {
      recA._canon = { ...recA._canon, tier: "variant", rivalId: id };
      A.variants.push(recA);
      A.entities[id] = recB;
    } else {
      recB._canon = { ...recB._canon, tier: "variant", rivalId: id };
      A.variants.push(recB);
    }
  }
  // union variants, deduped by (entityId + rivalId)
  const seen = new Set(A.variants.map(v => `${v._canon?.entityId}|${v._canon?.rivalId}`));
  for (const v of B.variants) {
    const key = `${v._canon?.entityId}|${v._canon?.rivalId}`;
    if (!seen.has(key)) { A.variants.push(v); seen.add(key); }
  }
  return A;
}

/** Structured clone that degrades to JSON round-trip where structuredClone is absent (older
 *  Node in CI). Canon records are plain JSON, so this is lossless. */
function structuredCloneSafe(obj) {
  if (obj == null) return {};
  try { return typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)); }
  catch { return JSON.parse(JSON.stringify(obj)); }
}

// ---------- the rating-lens (pure) ----------

/** The defining text of a canon record — the fields whose intensity the lens judges. */
function definingText(record) {
  const fields = ["role", "wants", "fears", "voiceHints", "appearance", "descriptionSeed",
    "tendency", "encounterFlavor", "ifIgnored", "ifEngaged", "name"];
  return fields.map(k => record[k]).filter(v => typeof v === "string").join(" ");
}

/** Per-entity lens verdict for a viewer. entityRating = the entity's `_canon.rating` (or null =
 *  unrated authored content, always shown). viewerLevel = ratingLevel(profile). Returns
 *  'show' | 'adapt' | 'filter'. Floors: a minor VIEWER, or any viewer facing sexual content
 *  above their ceiling, gets a hard FILTER (never a softening); other above-ceiling intensity
 *  (violence/dread) dials down via ADAPT. */
export function lensDecision(entityRating, viewerLevel, definingText = "", { viewerIsMinor = false } = {}) {
  if (entityRating == null) return "show";                 // unrated (authored) — not rating-gated
  const eLevel = RATING_LEVEL[entityRating];
  if (eLevel == null) return "show";                        // unknown tag — fail safe to visible-as-is
  if (eLevel <= viewerLevel) return "show";                 // at or below the viewer's ceiling
  // above the ceiling from here down:
  if (SEXUAL_MARKERS.test(definingText)) return "filter";   // no in-ceiling analog — hard exclude
  if (viewerIsMinor && HARD_INTENSITY_MARKERS.test(definingText)) return "filter"; // minor-protection: don't soften gore into view for a child
  return "adapt";                                            // violence/dread/language → re-narrate down
}

/** Pure, always-available adaptation: neutralize above-ceiling intensity in the record's
 *  defining fields (redact the marked ones to an in-ceiling gist) and tag the view. This is the
 *  floor of adaptation — it needs no LLM, so the family-safety mechanism works headless. An
 *  injected re-narration (adaptFn) can replace it with richer prose; adaptation only ever dials
 *  DOWN, so no floor can be re-crossed. Returns a NEW record (source untouched). */
export function adaptView(record, targetRating) {
  const out = {};
  for (const [k, v] of Object.entries(record)) out[k] = k === "_canon" ? { ...v } : v;
  const fields = ["role", "wants", "fears", "voiceHints", "appearance", "descriptionSeed",
    "tendency", "encounterFlavor", "ifIgnored", "ifEngaged"];
  for (const k of fields) {
    if (typeof out[k] !== "string") continue;
    if (SEXUAL_MARKERS.test(out[k]) || HARD_INTENSITY_MARKERS.test(out[k])) {
      out[k] = softGist(out[k]);
    }
  }
  out._canon = { ...(out._canon || {}), rating: targetRating, adaptedFrom: record._canon?.rating || null, adapted: true };
  out._lens = { adaptedTo: targetRating, note: `shown at your ${targetRating} ceiling — the harsher grain is dialed down` };
  return out;
}

/** Reduce a too-intense line to a neutral in-ceiling gist (keeps the fact of a presence, drops
 *  the graphic charge). Deterministic — no fabrication beyond "there is something intense here,
 *  not shown." */
function softGist(text) {
  const first = String(text).split(/[.!?]/)[0].replace(SEXUAL_MARKERS, "…").replace(HARD_INTENSITY_MARKERS, "…").trim();
  return first ? `${first} (the rest runs harsher than shown here)` : "carries an intensity dialed down for you";
}

/** The viewer's slice of the shared world: every canonical entity resolved through the rating-
 *  lens. 'show' → as-is; 'adapt' → re-narrated down (injected adaptFn(record,targetRating) if
 *  given, else the pure adaptView); 'filter' → dropped (absent). Returns
 *  [{ record, decision }] where record is the VIEW the player may see. Pure given adaptFn. */
export function canonForViewer(store, profile, { adaptFn = null, cap = 24 } = {}) {
  ensureCanonStore(store);
  const viewerLevel = ratingLevel(profile);
  const viewerIsMinor = isMinorProfile(profile);
  const targetRating = ceilingPreset(viewerLevel);
  const out = [];
  for (const rec of Object.values(store.entities)) {
    const rating = rec._canon?.rating ?? null;
    const decision = lensDecision(rating, viewerLevel, definingText(rec), { viewerIsMinor });
    if (decision === "filter") continue;
    if (decision === "show") { out.push({ record: rec, decision }); continue; }
    // adapt
    let view = null;
    try { view = adaptFn ? adaptFn(rec, targetRating) : adaptView(rec, targetRating); }
    catch { view = adaptView(rec, targetRating); }         // a bad re-narration falls back to the safe pure one
    out.push({ record: view || adaptView(rec, targetRating), decision });
    if (out.length >= cap) break;
  }
  return out.slice(0, cap);
}

/** The preset string for a numeric ceiling level (inverse of RATING_LEVEL). */
function ceilingPreset(level) {
  for (const [preset, lvl] of Object.entries(RATING_LEVEL)) if (lvl === level) return preset;
  return "PG-13";
}
