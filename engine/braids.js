// braids.js — SNG-196. The generative core, made real. Co-activating two crafts in one action builds a
// count in the practice ledger (SNG-173) — and past a threshold the character has EARNED a BRAID: a NEW,
// full-schema ability, minted onto them, that neither parent could do alone. NO authored recipe is
// required — that absence was the whole gap (Silas: 40 co-activations, 0 braids, because only 3 recipes
// existed and none touched his crafts). This is what makes the system GENERATIVE.
//
//   • The braid is a REAL ability def (tree, functions, harmRung, tradition) stored in customAbilities, so
//     fullCatalog() resolves it everywhere (rank-up, coverage, the skill wheel) with no special-casing.
//   • TIER scales with POWER: a braid of two mastered crafts is a capstone; two basics, a modest craft.
//   • The name is the model's suggestion OR the player's — buildBraidDef takes an authored override; the
//     stub it falls back to is itself a valid, playable craft, so a mint never halts on a bad model reply.
//
// Pure, no I/O, fully testable. app.js owns the async generation + the mint op; generate.js authors the
// rich tree; this owns the mechanics: what is mintable, at what tier, and the minted shape.

import { discoveryKey } from "./progression.js"; // the SAME co-activation key the ledger is written with
import { smartClamp } from "./namematch.js";

export const BRAID_RIPEN_AT = 5; // co-activations before a pairing is EARNED as a braid — a clearly deliberate
//   pattern (Silas's Double Register sits at 5, and Erik treats it as canon). Tunable; a lower bar risks
//   braid-spam from incidental pairings, a higher one is the unreachability this ticket exists to fix.
const HARM_ORDER = ["none", "restraint", "wounding", "lethal", "atrocity"]; // harsher parent sets the braid's rung
const ROMAN = ["I", "II", "III"];

/** SNG-196: the pairings a character has EARNED the right to braid — co-activated at least `threshold`
 *  times, both crafts still held, and not already braided. GENERATIVE: an authored recipe is NOT required.
 *  Returns candidates richest-first (most co-activated). Pure — reads only the practice ledger + catalog. */
export function mintableBraidsFor(character, { catalog = {}, threshold = BRAID_RIPEN_AT } = {}) {
  const co = character?.practice?.coActivations || {};
  const owned = new Set((character?.abilities || []).map(a => a.abilityId));
  const braided = new Set((character?.braids || []).map(b => braidKey(b.from)));
  const out = [];
  for (const [key, n] of Object.entries(co)) {
    if ((n || 0) < threshold) continue;
    const comps = key.split("+").filter(Boolean);
    if (comps.length !== 2) continue;                       // pairwise braids only (the ledger is pairwise)
    if (!comps.every(id => owned.has(id))) continue;        // you must still hold both crafts
    if (braided.has(braidKey(comps))) continue;             // not already braided
    const sources = comps.map(id => catalog[id]).filter(Boolean);
    if (sources.length !== 2) continue;                     // both defs resolvable
    out.push({ components: comps, coActivations: n, sources, ...braidTier(character, comps, catalog) });
  }
  return out.sort((a, b) => b.coActivations - a.coActivations);
}

/** The stable identity of a braid = its two components, order-independent. */
export function braidKey(components = []) { return [...components].sort().join("+"); } // registry:internal

/** SNG-197 §4: is `verb` a LEGAL emergent function for a braid — the CEILING a player can point at as NEW?
 *  Three conditions, all required: it is a non-empty string; NEITHER parent already had it (an emergent is
 *  by definition something new); and it is a real verb from the 24-verb function vocabulary
 *  (function_vocabulary.json) — never a model hallucination. `vocab` is the set of valid verbs
 *  (`Object.keys(buildFunctionIndex(...).verbToFamily)`). Without a vocab to check against, NOTHING is legal:
 *  a verb that cannot be verified is REJECTED, not accepted-and-logged — the SNG-192 Phase C gate, applied to
 *  generated rather than authored content. This is the code the SNG-197 part-1 comment deferred to part 2. Pure. */
export function isLegalEmergent(verb, parentFunctions = [], vocab = null) {
  if (typeof verb !== "string" || !verb) return false;
  if ((parentFunctions || []).includes(verb)) return false;   // not emergent if a parent already reached it
  const set = vocab instanceof Set ? vocab : Array.isArray(vocab) ? new Set(vocab) : null;
  return !!set && set.has(verb);
}

/** SNG-196 + SNG-197 §5: a braid's TIER + learn-gate, scaled to the POWER of the two crafts braided.
 *  `maxRank` is the DEEPER parent's current rank (1..3) — it sets the tree depth and the energy. A braid is
 *  ONE TIER BEYOND its parents (a fusion is *more* than either — the same doctrine as §1's ceiling), so the
 *  displayed `tier` = maxRank+1, capped at 5. `levelReq` IS that tier, because the ability card renders
 *  `tierOf(levelReq)` = ROMAN[clamp(1,5,levelReq)] — so the badge is now sourceable and intentional, not the
 *  stray "Tier V" a `maxRank*2` levelReq produced. Pure. */
export function braidTier(character, components, catalog = {}) { // registry:internal
  const rankOf = id => (character?.abilities || []).find(a => a.abilityId === id)?.level || 1;
  const sourceRanks = components.map(rankOf);
  const maxRank = Math.min(3, Math.max(1, ...(sourceRanks.length ? sourceRanks : [1]))); // the deeper parent sets the ceiling
  const tier = Math.min(5, maxRank + 1);   // a braid is one tier BEYOND its parents (§1: something neither had)
  const levelReq = tier;                   // the card reads tierOf(levelReq) — keep them the same so the badge is sourceable
  return { tier, maxRank, levelReq, sourceRanks };
}

/** SNG-196: a VALID, full-schema braid ability def — the fallback the model enriches, and a real playable
 *  craft on its own. Unions the sources' functions, takes the harsher harmRung, derives the gate from
 *  braidTier, and scaffolds a `tier`-deep tree. `opts.authored` (from generate.js "braid" type) overrides
 *  name/description/tree when the model gave good ones; `opts.name` is the player's chosen name (wins over
 *  the model's suggestion). Pure. */
/** SNG-227 §3d: a braid's BASE energy cost — the priciest parent PLUS a share (default half) of the cheaper.
 *  Always > the priciest parent (the higher-power premium Erik wants), always < running both parts one after
 *  the other (the efficiency reward of the combination). Computed at MINT from the parents' BASE costs (stable
 *  — a braid's base shouldn't drift as the parents level); the braid's own base then runs through
 *  effectiveEnergyCost (§3a/b/c) like any craft, so a freshly-discovered braid is EXPENSIVE and earns down.
 *  8+10 → 14 · 10+10 → 15 · 6+8 → 11. `fraction` is tunable (rules.leveling.braidCheaperParentFraction). */
export function braidBaseCost(sources = [], fraction = 0.5) {
  const costs = (sources || []).map(s => s?.energyCost || 0).sort((a, b) => b - a);
  const priciest = costs[0] || 4, cheaper = costs[1] || 0;
  return Math.max(priciest + 1, priciest + Math.ceil(cheaper * (Number.isFinite(fraction) ? fraction : 0.5)));
}

export function buildBraidDef(character, components, catalog = {}, opts = {}) {
  const sources = components.map(id => catalog[id]).filter(Boolean);
  if (sources.length !== 2) return null;
  const { tier, maxRank, levelReq } = braidTier(character, components, catalog);
  const authored = opts.authored || {};
  const srcNames = sources.map(s => s.name || s.id);
  const harmRung = sources.map(s => s.harmRung || "none").sort((a, b) => HARM_ORDER.indexOf(b) - HARM_ORDER.indexOf(a))[0] || "none";
  // SNG-197 §1+§4: the FLOOR is the union of both parents; the CEILING is the braid's OWN — an EMERGENT
  // function neither parent had (the line a player can point at that is NEW). isLegalEmergent enforces the
  // 24-verb vocab HERE, in code (part 1 left it a comment): a hallucinated verb is REJECTED, not
  // accepted-and-logged. Pass the vocab via opts.functionVocab (Object.keys(fnIndex.verbToFamily)); without
  // it, no emergent verb is minted. A stub mint (no authored, no vocab) keeps the emergent at the narration
  // level in the rank-1 grant; enrichment adds the validated verb.
  const parentFunctions = [...new Set(sources.flatMap(s => s.functions || []))];
  const emergent = isLegalEmergent(authored.emergentFunction, parentFunctions, opts.functionVocab) ? authored.emergentFunction : null;
  const functions = emergent ? [...parentFunctions, emergent] : parentFunctions;
  const tradition = sources[0]?.tradition || sources[0]?.powerSystem || "learned";
  const namedByPlayer = !!opts.name;
  const name = smartClamp(String(opts.name || authored.name || `${srcNames[0]} × ${srcNames[1]}`), 60);
  const id = "braid_" + braidKey(components).replace(/[^a-z0-9]+/gi, "_");
  // the tree: use the model's ranks when present + valid, else scaffold `maxRank` deep.
  let tree = Array.isArray(authored.tree) ? authored.tree.filter(n => n && n.name).slice(0, maxRank).map((n, i) => ({
    rank: i + 1, name: smartClamp(String(n.name), 60), grants: smartClamp(String(n.grants || "The braid runs as one craft."), 200),
    cannot: smartClamp(String(n.cannot || "What neither parent could do alone."), 160), functions
  })) : [];
  while (tree.length < maxRank) {
    const r = tree.length + 1;
    tree.push({
      rank: r, name: `${name} ${ROMAN[r - 1] || r}`,
      grants: r === 1 ? `${srcNames[0]} and ${srcNames[1]} run as one craft${emergent ? ` — and in the braiding, a thing neither reached alone (${emergent})` : ""}: the move only their joining makes.` : `The braid deepens; the two crafts answer together more surely.`,
      cannot: "What neither parent could do apart.", functions
    });
  }
  return {
    id, name, tradition, powerSystem: tradition,
    levelReq, energyCost: braidBaseCost(sources, opts.braidFraction), // SNG-227 §3d: priciest parent + a share of the cheaper — a premium over either part, still < running both sequentially
    attribute: sources[0]?.attribute || "practical",
    functions, harmRung, effectTags: [], nativeOrCombination: "combination",
    description: smartClamp(String(authored.description || `A braid earned in play: ${srcNames.join(" and ")}, channelled together until they became one craft.`), 400),
    // SNG-197 §1: the boundary is drawn around the BRAID's own reach, not around its parents — it is not
    // either parent entire; it is the one new craft their joining makes, and no wider. (Never delete this.)
    notFor: smartClamp(String(authored.notFor || "What lies outside this braid's own reach — it is not either parent whole, only the single new craft their braiding makes."), 240),
    narrationHints: smartClamp(String(authored.description || `${srcNames.join(" braided with ")}.`), 200),
    tree,
    minted: { kind: "braid", from: [...components], mintedAt: null, namedBy: namedByPlayer ? "player" : (authored.name ? "gm" : "auto"), tier, emergent, enriched: !!(authored.name || authored.description || (authored.tree || []).length || emergent), sourceNames: srcNames }
  };
}

/** SNG-196: mint a braid onto the character — the full def into customAbilities (so fullCatalog resolves
 *  it), a held-ability entry, and a `braids` ledger row for provenance + de-dupe. Idempotent by braidKey;
 *  returns the minted def, or null if this pairing was already braided or the def is invalid. Pure. */
export function mintBraid(character, def, { at = null } = {}) {
  if (!character || !def?.id || !def?.minted?.from) return null;
  const key = braidKey(def.minted.from);
  character.braids = character.braids || [];
  if (character.braids.some(b => braidKey(b.from) === key)) return null; // already braided this pairing
  def.minted.mintedAt = at;
  character.customAbilities = character.customAbilities || {};
  character.customAbilities[def.id] = def;                              // resolvable everywhere via fullCatalog()
  character.abilities = character.abilities || [];
  if (!character.abilities.some(a => a.abilityId === def.id)) character.abilities.push({ abilityId: def.id, level: 1, braided: true });
  character.braids.push({ id: def.id, from: [...def.minted.from], name: def.name, tier: def.minted.tier, mintedAt: at });
  return def;
}

/** SNG-226: a discovery is a RECORDED FACT — make it a USABLE CRAFT. Registers the discovery in `abilities[]`
 *  (+ `customAbilities`, so `fullCatalog()` resolves it) with a braid-shaped, rank-1 usable def — so every
 *  reader of the ONE ability list (the intent-parser, the skill wheel, the roll resolver) finally SEES it,
 *  fixing all three at once (§3). Reuses `buildBraidDef` when the discovery's parents resolve to 2 distinct
 *  catalog crafts (the richest def: unioned functions, tree, cost, tradition); else a minimal braid-shaped
 *  fallback from the discovery's own name + description. Parents are DEDUPED (a 3-parent discovery with a
 *  repeated craft collapses to 2) and id-drift-tolerant (hyphen/underscore). Idempotent: skips a discovery
 *  already in `abilities[]`, OR whose parent-pairing was already braided (it's usable via that braid). Pure. */
export function registerDiscoveryAbility(character, discovery, catalog = {}, { at = null, braidFraction } = {}) {
  if (!character || !discovery?.id || !discovery?.name) return null;
  character.abilities = character.abilities || [];
  if (character.abilities.some(a => a.abilityId === discovery.id)) return null; // already usable under its own id
  const resolve = id => catalog[id] ? id : catalog[String(id).replace(/-/g, "_")] ? String(id).replace(/-/g, "_") : catalog[String(id).replace(/_/g, "-")] ? String(id).replace(/_/g, "-") : null;
  const parents = [...new Set((discovery.abilities || []).map(resolve).filter(Boolean))];
  // already usable via a braid of the SAME pairing (e.g. a discovery that was also braided) → nothing to do.
  if (parents.length === 2 && (character.braids || []).some(b => braidKey(b.from) === braidKey(parents))) return null;
  let def = parents.length === 2 ? buildBraidDef(character, parents, catalog, { name: discovery.name, authored: { description: discovery.description }, braidFraction }) : null;
  if (!def) {
    // fallback: a minimal braid-shaped def from whatever resolved + the discovery's own words (rank 1, deepens).
    const sources = parents.map(id => catalog[id]).filter(Boolean);
    const functions = [...new Set(sources.flatMap(s => Array.isArray(s.functions) ? s.functions : []))];
    const energyCost = braidBaseCost(sources, braidFraction); // SNG-227 §3d: a discovered braid gets the premium cost too (priciest parent + a share of the cheaper)
    const nm = smartClamp(String(discovery.name), 60);
    const desc = smartClamp(String(discovery.description || `A craft discovered in play: ${discovery.name}.`), 400);
    def = {
      id: discovery.id, name: nm, powerSystem: "learned", tradition: "learned", levelReq: 1, energyCost,
      attribute: sources[0]?.attribute || "practical", functions, harmRung: "none", effectTags: [], nativeOrCombination: "combination",
      description: desc, notFor: "What lies outside this craft's own reach — the single new move your discovery made, no wider.",
      narrationHints: smartClamp(String(discovery.description || discovery.name), 200),
      tree: [{ rank: 1, name: nm, grants: smartClamp(String(discovery.description || "The discovered craft runs as one."), 200), cannot: "What it has not yet grown to do.", functions }],
      minted: { kind: "discovery", from: [...(discovery.abilities || [])], mintedAt: at, sourceNames: [...(discovery.abilities || [])], enriched: !!discovery.description }
    };
  }
  def.id = discovery.id;                                    // the ability shares the discovery's id (the name the player uses)
  def.minted = def.minted || { from: [...(discovery.abilities || [])] };
  def.minted.kind = def.minted.kind === "braid" ? "discovery" : (def.minted.kind || "discovery");
  def.minted.discoveredFrom = discovery.key || null;
  character.customAbilities = character.customAbilities || {};
  character.customAbilities[def.id] = def;                  // resolvable everywhere via fullCatalog()
  character.abilities.push({ abilityId: def.id, level: 1, braided: (def.minted.from || []).length >= 2, discovered: true });
  character.braids = character.braids || [];                // provenance ledger (braid-shaped); dedupe by id
  if (!character.braids.some(b => b.id === def.id)) character.braids.push({ id: def.id, from: [...(def.minted.from || [])], name: def.name, tier: def.minted.tier || null, mintedAt: at, discovered: true });
  return def;
}
