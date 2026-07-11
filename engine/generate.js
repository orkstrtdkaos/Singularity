// generate.js — SNG-BATCH-9 Phase 1: the ONE generative path. generate(type, context)
// authors a new npc/location/arc IN-GRAIN for its locale, validates it against the
// derived schema, repairs or stubs on failure, resolves-before-minting (never duplicates
// an existing entity), stamps the promotable-store envelope, and persists it as a durable
// node. The world grows through play.
//
// Design law 1: the ENGINE owns the schema'd mint + scoring + resolution; the GM only
// emits a lightweight generateRequest and narrates. The LLM call is INJECTED (deps.callJSON)
// so every branch here — validate → repair → stub, resolve-before-mint, persistence,
// stamping — is pure and headless-testable without an API key.
//
// Invariants:
//  • generation NEVER halts a turn — every path returns a usable record or null, never throws.
//  • resolve-before-mint: an incoming name that matches an authored or already-generated
//    entity REUSES it rather than forking a duplicate.
//  • the entity's authored-shape fields sit at top level (indistinguishable downstream);
//    all generative metadata lives in a `_gen` sidecar.

import { slugify } from "./quests.js";
import { namesMatch } from "./namematch.js";
import { validate, missingRequired, defaultFor } from "./genschema.js";

export const GEN_TYPES = ["npc", "location", "arc"];
const DEFAULT_SESSION_CAP = 6; // governor: mints per scene/session before we prefer reuse-only

/** Ensure the per-save generated-content store exists. Lives on the character so it syncs
 *  and participates in cross-device load-latest (SNG-BATCH-7). */
export function ensureGenerated(character) {
  if (!character.generated) character.generated = { schemaVersion: 1, npc: {}, location: {}, arc: {} };
  for (const t of GEN_TYPES) if (!character.generated[t]) character.generated[t] = {};
  return character;
}

/** All generated records of a type (the full store records, each carrying `_gen`). */
export function generatedRecords(character, type) {
  return Object.values(character.generated?.[type] || {});
}

// ---------- resolve-before-mint (SNG-019 reuse-over-create) ----------

/** Does an entity of this type + name already exist — authored or generated? Returns the
 *  existing id to REUSE, or null to mint. `known` = { authored: {id:record}, generated: {id:record} }. */
export function resolveExisting(type, name, known = {}) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const scan = (pool) => {
    for (const [id, rec] of Object.entries(pool || {})) {
      const label = rec?.name || rec?.label || id.replace(/-/g, " ");
      if (namesMatch(raw, label) || namesMatch(raw, id.replace(/-/g, " "))) return id;
    }
    return null;
  };
  return scan(known.authored) || scan(known.generated) || null;
}

/** Mint a stable, collision-free id from a name (deterministic — no RNG, so tests reproduce). */
export function mintId(name, taken = {}) {
  const base = slugify(name) || "entity";
  if (!taken[base]) return base;
  for (let n = 2; n < 999; n++) if (!taken[`${base}-${n}`]) return `${base}-${n}`;
  return `${base}-${Object.keys(taken).length + 1}`;
}

// ---------- validate → repair → stub ----------

/** A minimal, schema-VALID, in-grain stub when the model's output can't be repaired.
 *  Derives every field from context — never fabricates specifics it wasn't given. */
export function stubEntity(type, context = {}, schema = {}) {
  const loc = context.location || {};
  const region = loc.regionId || context.regionId || "valley";
  const name = context.hint ? String(context.hint).slice(0, 60) : `a presence in ${loc.name || "the valley"}`;
  const base = { schemaVersion: 1, id: slugify(name) || "generated", name };
  if (type === "npc") {
    Object.assign(base, {
      role: context.role || `someone of ${loc.name || "this place"}`,
      spectrum: loc.spectrum ? { ...loc.spectrum } : {},
      fears: "being undone by the very grain of this place",
      wants: "to go on as they are, in a world that won't quite let them",
      knowledge: [], voiceHints: "", personality: {}, communityId: loc.communityId || null,
      homeLocation: loc.id || null, reactsToReputation: {}
    });
  } else if (type === "location") {
    Object.assign(base, {
      regionId: region, communityId: loc.communityId || null,
      spectrum: loc.spectrum ? { ...loc.spectrum } : {}, poleIntensity: loc.poleIntensity ? { ...loc.poleIntensity } : {},
      tags: [], connections: loc.id ? [loc.id] : [], descriptionSeed: name,
      loreRefs: loc.loreRefs ? [...loc.loreRefs] : [], encounterFlavor: "",
      questSeeds: [], map: nearMap(loc.map)
    });
  } else if (type === "arc") {
    Object.assign(base, {
      scale: "local", pressure: "medium",
      tendency: `a tension local to ${loc.name || "this place"}, untended it hardens`,
      crossesRegions: [loc.name || region], hingeNpcs: [], ifIgnored: "it festers, unwatched",
      ifEngaged: "someone patient could turn it"
    });
  }
  // fill any remaining required key the schema wants but we didn't set
  for (const k of missingRequired(base, schema)) base[k] = defaultFor(schema.properties?.[k]);
  return base;
}

/** deterministic near-by map coords for a generated place (offset from its parent). */
function nearMap(parent) {
  const x = Number.isFinite(parent?.x) ? parent.x : 200;
  const y = Number.isFinite(parent?.y) ? parent.y : 200;
  // small fixed offset — no RNG so tests reproduce; the map just needs a distinct pin
  return { x: x + 12, y: y + 8 };
}

/** Validate raw model output; fill missing required fields from context; if still invalid,
 *  fall back to a schema-valid stub. Returns { entity, repaired, stubbed }. */
export function repairEntity(type, raw, context = {}, schema = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { entity: stubEntity(type, context, schema), repaired: false, stubbed: true };
  }
  const entity = { ...raw };
  if (entity.schemaVersion == null) entity.schemaVersion = 1;
  let repaired = false;
  // fill missing required from a context-derived stub's values (in-grain), else schema default
  const stub = stubEntity(type, context, schema);
  for (const k of missingRequired(entity, schema)) {
    entity[k] = k in stub ? stub[k] : defaultFor(schema.properties?.[k]);
    repaired = true;
  }
  const res = validate(entity, schema);
  if (res.valid) return { entity, repaired, stubbed: false };
  // a type error survived repair (e.g. model returned a string where an array belongs) —
  // coerce the offending fields toward the stub, then last-resort full stub
  for (const k of Object.keys(schema.properties || {})) {
    if (k in entity) {
      const one = validate({ [k]: entity[k] }, { type: "object", properties: { [k]: schema.properties[k] } });
      if (!one.valid && k in stub) { entity[k] = stub[k]; repaired = true; }
    }
  }
  return validate(entity, schema).valid
    ? { entity, repaired, stubbed: false }
    : { entity: stubEntity(type, context, schema), repaired: false, stubbed: true };
}

// ---------- THE FLOORS (SNG-BATCH-9 §4 — rating-INDEPENDENT, absolute, at birth) ----------
// Enforced at generation time because earned-auto-promotion (Phase 3) means there is no
// human gate downstream. R+ scales intensity UP toward these floors; it NEVER unlocks them.

const ADULT_AGE = 18;
const MINOR_MARKERS = /\b(child|children|kid|kids|toddler|infant|baby|boy|girl|adolescent|teenaged?|teens?|underage|minor|youngster|little one)\b/i;
const ADULT_SIGNALS = /\b(adult|grown|elder|old(er)?|woman|man|men|veteran|matron|patriarch|widow|widower|aged)\b/i;
const SEXUAL_MARKERS = /\b(sexual|erotic|nude|naked|seduc\w*|lust\w*|carnal|aroused|fondl\w*|intimate|in bed|make love|bedded)\b/i;
const ROMANTIC_MARKERS = /\b(romanc\w*|romantic|courtship|betroth\w*|paramour|lover|infatuat\w*|beloved|suitor)\b/i;

/** Is this generated entity a minor? An explicit isMinor flag, an age under adulthood, or
 *  clear child descriptors WITHOUT an adult signal. Conservative — false unless it reads young. */
export function isMinorEntity(entity) {
  if (entity?.isMinor === true) return true;
  const age = Number(entity?.age);
  if (Number.isFinite(age)) return age < ADULT_AGE;
  const text = [entity?.role, entity?.appearance, entity?.name, entity?.voiceHints].filter(Boolean).join(" ");
  return MINOR_MARKERS.test(text) && !ADULT_SIGNALS.test(text);
}

/** THE FLOORS. Returns { entity, action } — action: 'clean' | 'neutralized-minor' |
 *  'stubbed-floor'. A minor is NEVER romantic/sexual at ANY tier for ANY player: sexual
 *  framing on a minor is the prohibited floor (full stub); softer romantic framing is
 *  neutralized; either way the entity is marked non-romanceable. */
export function enforceFloors(entity, type, context = {}, schema = {}) {
  if (type !== "npc") return { entity, action: "clean" };
  if (!isMinorEntity(entity)) return { entity, action: "clean" };
  entity.isMinor = true;
  const fields = ["role", "wants", "fears", "voiceHints", "appearance", "name"];
  const text = fields.map(k => entity[k]).filter(v => typeof v === "string").join(" ");
  if (SEXUAL_MARKERS.test(text)) {
    // a fundamentally sexualized minor is prohibited — do not salvage; replace with a clean stub
    const stub = stubEntity(type, context, schema);
    stub.isMinor = true;
    return { entity: stub, action: "stubbed-floor" };
  }
  if (ROMANTIC_MARKERS.test(text)) {
    const stub = stubEntity(type, context, schema);
    for (const k of fields) {
      if (typeof entity[k] === "string" && ROMANTIC_MARKERS.test(entity[k])) entity[k] = stub[k] ?? "";
    }
    return { entity, action: "neutralized-minor" };
  }
  return { entity, action: "clean" };
}

// ---------- stamp the promotable-store envelope ----------

/** Realness = WEIGHT = birth-power + accumulated attention. Birth-power is the level/power
 *  of the character the entity was generated for (the spec's "born strong" road). */
export function birthWeightOf(context = {}) {
  const lvl = Number(context.birthPower ?? context.character?.level ?? 1);
  return Math.max(1, Math.round(lvl));
}

/** Attach the `_gen` sidecar: entityId, birth-weight, engagement/tier, rating-tag, provenance,
 *  attention history. Clean provenance from day one so Phase-3 promotion is zero-rework. */
export function stampGenerated(entity, type, entityId, context = {}) {
  entity.id = entityId;
  entity._gen = {
    entityId, type,
    birthWeight: birthWeightOf(context),
    engagementScore: 0,
    tier: "fresh",
    rating: context.rating || null,           // stamped to the requesting player's ceiling (1c)
    provenance: {
      playerKey: context.playerKey || null,
      characterId: context.character?.id || null,
      locationId: context.location?.id || null,
      day: context.day ?? null,           // per-character journey day (flavor)
      worldDay: context.worldDay ?? null, // SNG-041 forward-compat: absolute shared world-day, filled when the one-clock lands (gate before Phase 2)
      hint: context.hint ? String(context.hint).slice(0, 120) : null,
      why: context.why ? String(context.why).slice(0, 120) : null
    },
    attentionHistory: [],
    createdDay: context.day ?? null
  };
  return entity;
}

// ---------- persist ----------

/** Write a generated record into the per-save store + drop a codex topic pointing at the
 *  same entityId (so the knowledge-graph surfacing finds it). Returns the stored record. */
export function persistGenerated(character, type, record, deps = {}) {
  ensureGenerated(character);
  character.generated[type][record.id] = record;
  // lightweight codex node so codexForGM surfaces it (person/place/lore by type)
  if (deps.applyCodexUpdates) {
    const kind = type === "npc" ? "person" : type === "location" ? "place" : "lore";
    try {
      deps.applyCodexUpdates(character, [{
        entityId: record.id, label: record.name, kind,
        fact: type === "npc" ? (record.role || "met in play")
          : type === "location" ? (record.descriptionSeed || "").slice(0, 160)
          : (record.tendency || "a thread taking shape").slice(0, 160)
      }], deps.codexCtx || {});
    } catch { /* codex is a convenience mirror — never let it break persistence */ }
  }
  return record;
}

// ---------- the one path ----------

/** generate(type, context, deps) — author → validate → repair/stub → resolve-before-mint →
 *  stamp → persist. NEVER throws; returns the persisted record, or null if the governor
 *  declined and nothing could be reused.
 *
 *  context: { location, role, season, arcPressure, hint, why, rating, character, playerKey,
 *             day, birthPower, known:{authored,generated}, examples, substrate, genBudget }
 *  deps:    { callJSON(messages, opts), schema, applyCodexUpdates, codexCtx } */
export async function generate(type, context = {}, deps = {}) {
  if (!GEN_TYPES.includes(type)) return null;
  ensureGenerated(context.character || (context.character = {}));
  const schema = deps.schema || {};
  const known = context.known || {};
  const generatedPool = context.character.generated?.[type] || {};

  // resolve-before-generate: if the hint clearly names an entity we already have, reuse it
  const preHitId = resolveExisting(type, context.hint, { authored: known.authored, generated: generatedPool });
  if (preHitId) {
    const reused = generatedPool[preHitId] || known.authored?.[preHitId] || null;
    if (reused) return reused;
  }

  // governor: past the per-session cap we do NOT mint — reuse-only (already tried above) → null
  const budget = context.genBudget ?? DEFAULT_SESSION_CAP;
  if (budget <= 0) return null;

  // author (injected LLM). Any failure → stub path; generation never halts the turn.
  let raw = null;
  if (deps.callJSON) {
    try {
      const { system, user } = buildGeneratePrompt(type, context, { schema, examples: context.examples, substrate: context.substrate });
      raw = await deps.callJSON([{ role: "user", content: user }], { task: "generate", system });
    } catch { raw = null; }
  }

  const repairedOut = repairEntity(type, raw, context, schema);
  // THE FLOORS — absolute, rating-independent, at the birth-validator (before anything persists)
  const floored = enforceFloors(repairedOut.entity, type, context, schema);
  const entity = floored.entity;
  const repaired = repairedOut.repaired;
  const stubbed = repairedOut.stubbed || floored.action === "stubbed-floor";

  // resolve-before-mint on the AUTHORED name (the model may have named an existing entity)
  const existingId = resolveExisting(type, entity.name, { authored: known.authored, generated: generatedPool });
  if (existingId && (generatedPool[existingId] || known.authored?.[existingId])) {
    return generatedPool[existingId] || known.authored[existingId];
  }

  const entityId = mintId(entity.name, generatedPool);
  stampGenerated(entity, type, entityId, context);
  entity._gen.repaired = repaired;
  entity._gen.stubbed = stubbed;
  // structural minor protection: a minor NPC is never romance/sexual-eligible, any tier, any player
  entity._gen.romanceEligible = !(type === "npc" && isMinorEntity(entity));
  if (floored.action !== "clean") entity._gen.floor = floored.action;
  return persistGenerated(context.character, type, entity, deps);
}

// ---------- prompt assembly (pure) ----------

/** Build the schema-constrained generation prompt from the substrate grammar + local
 *  disposition + few-shot taste. Pure: (type, context) → { system, user }. */
export function buildGeneratePrompt(type, context = {}, { schema = {}, examples = [], substrate = null } = {}) {
  const loc = context.location || {};
  const grammar = substrate?.generationGrammar || {};
  const req = (schema.required || []).join(", ");
  const dispo = describeDisposition(loc);
  const roleLine = context.role ? `\nUNIVERSAL ROLE: ${context.role}${context.roleMethod ? ` — method here: ${context.roleMethod}` : ""}` : "";
  const seedLine = loc.seedFiction ? `\nMANIFEST DOMAIN — this place runs on: ${loc.seedFiction}${loc.nativeLogic ? ` (native law: ${loc.nativeLogic})` : ""}` : "";
  const arcLine = context.arcPressure ? `\nACTIVE ARC-PRESSURE: ${context.arcPressure}` : "";
  const seasonLine = context.season ? `\nSEASON: ${context.season}` : "";
  const ratingLine = context.rating ? `\nCONTENT CEILING: author no more intense than ${context.rating} across violence, sex, language, dread — and no less where the grain calls for it. Absolute floors apply regardless (no prohibited content; a minor is NEVER romantic/sexual).` : "";

  const system = [
    `You are the world-grower for a narrative RPG. Author ONE new ${type} that is IN-GRAIN for where it appears — never generic, never off-key for its place.`,
    grammar.inGrainGuarantee ? `IN-GRAIN LAW: ${grammar.inGrainGuarantee}` : "",
    grammar.asymmetry && type !== "npc" ? `ASYMMETRY: ${grammar.asymmetry}` : "",
    grammar.functionAwareness ? `FUNCTION-AWARENESS: ${grammar.functionAwareness}` : "",
    `Output ONE JSON object and nothing else. REQUIRED fields: ${req}. Match the shape + voice of the examples exactly.`,
    ratingLine
  ].filter(Boolean).join("\n\n");

  const exText = (examples || []).slice(0, 3).map((e, i) => `EXAMPLE ${i + 1}:\n${JSON.stringify(e, null, 1)}`).join("\n\n");
  const user = [
    context.hint ? `WHAT'S NEEDED: ${context.hint}` : `A new ${type} for this place.`,
    context.why ? `WHY: ${context.why}` : "",
    `WHERE: ${loc.name || "the valley"}${loc.regionId ? ` (${loc.regionId})` : ""}`,
    dispo ? `LOCAL DISPOSITION: ${dispo}` : "",
    roleLine, seedLine, arcLine, seasonLine,
    exText ? `\n${exText}` : "",
    `\nAuthor the ${type} now as a single in-grain JSON object.`
  ].filter(Boolean).join("\n");

  return { system, user };
}

/** A short natural-language read of a place's disposition, for the generation prompt. */
export function describeDisposition(loc = {}) {
  const pi = loc.poleIntensity || {};
  const poles = Object.entries(pi).filter(([, v]) => Math.abs(v) > 0.15).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4);
  if (poles.length) return poles.map(([p, v]) => `${p} (${v > 0 ? "strong" : "leaning"})`).join(", ");
  const sp = loc.spectrum || {};
  const ax = Object.entries(sp).filter(([, v]) => Math.abs(v) > 0.2).slice(0, 4);
  return ax.map(([a, v]) => `${a} ${v > 0 ? "+" : ""}${v}`).join(", ");
}
