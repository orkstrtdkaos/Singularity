// recipes.js — SNG-201: found once, known forever. When a co-activation ripens a braid pairing that
// ANYONE has already found, the player ADOPTS the world's recipe (its name / description / tree / emergent
// reach) instead of minting a duplicate. The DISCOVERY is still theirs — their bond, their mint moment,
// their rank-1 — but the CRAFT is the world's. First finder authors it for everyone: the strongest
// content-generator loop in the game, running on machinery that already exists.
//
// A NEW store (world/braid_recipes.json), deliberately NOT emergence_recipes.json — that file's consumers
// (ripeCombos / ripeBranches / validEmergenceId) are PRESCRIPTIVE, gating what a character may CLAIM. A
// recipe must stay DESCRIPTIVE (what a pairing BECAME), never prescriptive (what a pairing is ALLOWED to
// become) — reusing that file risks the exact SNG-196 gate reborn (§3.5). Rides the shared-canon sync
// concurrency (pushMergedFile: read-merge-write, SHA-retry re-contest) but is its own file (§3.1).
//
// Design law 1: the ENGINE owns the recipe shape + adopt/merge; the sync orchestration + the LLM authoring
// live in app.js. Pure + headless-testable. Never throws for the caller.

import { braidKey } from "./braids.js";

export const RECIPES_SCHEMA_VERSION = 1;

/** A fresh braid-recipe store: recipes keyed by braidKey (order-independent pairing identity — one pairing,
 *  one recipe, globally). */
export function ensureRecipeStore(store) {
  if (!store || typeof store !== "object") store = {};
  if (store.schemaVersion == null) store.schemaVersion = RECIPES_SCHEMA_VERSION;
  if (!store.recipes || typeof store.recipes !== "object") store.recipes = {};
  return store;
}

/** The SHAREABLE fields of an ENRICHED braid def — the world learns the craft's name + prose + emergent
 *  reach, NEVER the numbers (tier / levelReq / energy derive from each adopter's OWN ranks via braidTier).
 *  Returns null for a STUB: a stub never promotes (§1) — shipping the failure fallback as the world's
 *  permanent recipe is the exact inversion of SNG-197's point. `contributedBy` is the first-finder
 *  attribution. Pure. */
export function buildRecipeRecord(def, { worldDay = null, contributedBy = null } = {}) {
  if (!def?.minted || def.minted.enriched !== true) return null;   // stub never promotes
  const comps = def.minted.from || [];
  if (comps.length !== 2) return null;
  const key = braidKey(comps);
  if (!key) return null;
  return {
    braidKey: key,
    name: def.name,
    description: def.description || "",
    notFor: def.notFor || "",
    emergentFunction: def.minted.emergent || null,
    tree: (def.tree || []).map(n => ({ name: n.name, grants: n.grants, cannot: n.cannot })),
    namedBy: def.minted.namedBy === "player" ? "player" : "gm",   // §1: a player-conferred first-finder name travels, attributed
    sourceNames: def.minted.sourceNames || [],
    contributedBy: contributedBy || null,   // { playerKey, characterId, characterName }
    foundWorldDay: worldDay
  };
}

/** The recipe for a pairing, or null. */
export function recipeFor(store, components) {
  const s = ensureRecipeStore(store);
  return s.recipes[braidKey(components || [])] || null;
}

/** Convert a world recipe into the `authored` bag buildBraidDef consumes — so ADOPTION runs the SAME mint
 *  path as a fresh author (functions = parent-union + emergent, re-validated against the current vocab;
 *  numbers from the adopter's braidTier). The world-name rides in `name`; the caller decides whether to keep
 *  a player's personal nickname over it. Pure. */
export function recipeToAuthored(recipe) {
  if (!recipe) return {};
  return {
    name: recipe.name,
    description: recipe.description,
    notFor: recipe.notFor,
    emergentFunction: recipe.emergentFunction || undefined,
    tree: Array.isArray(recipe.tree) ? recipe.tree : []
  };
}

/** The merge body for pushMergedFile (§3.1 concurrency, §3.2 resolution). FIRST-PUT-WINS: a recipe has no
 *  realness axis (unlike a contested world-FACT), so "first finder = first to land a PUT" is the honest,
 *  deterministic resolution — and it is exactly what pushMergedFile's SHA-retry already gives for free. A
 *  local braid whose pairing is ALREADY in the freshly-read remote does NOT overwrite it (the world-name is
 *  fixed once landed, §2); it is returned in `adopted` so the caller updates the local def to the world's.
 *  A pairing not yet present is added as first-finder (`published`). Recipes are immutable once landed.
 *  Returns { store, adopted:[{local,recipe}], published:[recipe] }. Pure. */
export function mergeRecipes(remoteStore, localRecipes = []) {
  const s = ensureRecipeStore(remoteStore || {});
  const adopted = [], published = [];
  for (const rec of localRecipes) {
    if (!rec?.braidKey) continue;
    const existing = s.recipes[rec.braidKey];
    if (existing) adopted.push({ local: rec, recipe: existing });   // someone landed it first → adopt theirs
    else { s.recipes[rec.braidKey] = rec; published.push(rec); }     // first finder — landed for everyone
  }
  return { store: s, adopted, published };
}

/** Attribution line for a recognition moment: who found this braid first. Pure. */
export function firstFinderName(recipe) { // registry:internal
  return recipe?.contributedBy?.characterName || null;
}
