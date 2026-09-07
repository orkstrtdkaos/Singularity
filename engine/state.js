// state.js — content loading and save/load.
// v0.1: saves live in localStorage (instant, offline-safe); optional GitHub sync
// via sync.js pushes character + player profile to the shared repo when a PAT is
// configured. Content packs always load from the served repo files.

import { walkingDays } from "./worldmap.js";   // resolveLocationId: the nearest of several same-name places
import { martialAbilityRecords } from "./martial.js";
import { reconcileContent } from "./reconcile.js";
import { applySubstrateField } from "./substrate.js";
import { loadLegends } from "./legends.js";
import { buildTraditionIndex } from "./traditions.js";
import { bestiaryEncounters, frameExemplarEncounters } from "./random_encounters.js"; // SNG-229 §2b: synthesize monster encounters from the loaded bestiary

const LS = {
  character: id => `singularity.character.${id}`,
  characterIndex: "singularity.characters",
  profile: key => `singularity.profile.${key}`,
  playerKey: "singularity.playerKey",
  redirect: key => `singularity.profileRedirect.${key}` // SNG-045: retired dup key → canonical
};

// ---------- content packs ----------

/** SNG-329 — ⚠️ A LOCATION REFERENCE MUST BECOME A STRING *BEFORE* ANYTHING WRITES IT DOWN.
 *
 *  FOUND IN PLAY by Erik on the first real play-leg (Splarf), traced by Aevi. The GM may return `moveTo` as
 *  `{ location: "the_pass" }` OR as `{ location: { id, name } }`. The nested-object form fell through to
 *  `String(ref)` and became the literal text "[object Object]" — slugified to `gen-object-object`,
 *  title-cased to "[Object Object]", and MINTED INTO THE SAVE as a place.
 *
 *  ⛔ AND THE TITLE-CASING IS WHY NOBODY CAUGHT IT. "[Object Object]" is a perfectly good STRING with
 *  capitals and spaces: it passes every "is there a name" check in the codebase and reads like a place.
 *  A corruption that survives normalization comes out looking like content. My own first detector scanned
 *  for lowercase `object Object` and reported ZERO corrupt records across three infected saves.
 *
 *  Returns a usable string, or null. Null is the only other answer — a reference nobody can name is a
 *  reference nobody should mint. */
export function locationRefToString(ref) {
  if (ref == null) return null;
  if (typeof ref === "string") { const s = ref.trim(); return s || null; }
  if (typeof ref === "number" && Number.isFinite(ref)) return String(ref);
  if (typeof ref === "object") {
    // The shapes the GM actually returns, most specific first.
    for (const k of ["id", "locationId", "location", "name"]) {
      const v = ref[k];
      if (typeof v === "string" && v.trim()) return v.trim();
      // ONE level of nesting — `{ location: { id } }` — and no further, because past that we are guessing.
      if (v && typeof v === "object") {
        for (const k2 of ["id", "locationId", "name"]) {
          if (typeof v[k2] === "string" && v[k2].trim()) return v[k2].trim();
        }
      }
    }
  }
  return null;                     // ⛔ never `String(ref)` — that is the bug, and it persists to the save
}

/** ⚠️ IS THIS NAME THE ARTEFACT OF A COERCED OBJECT? Used by the mint (to refuse) and by the repair pass
 *  (to find the ones already written). Case-insensitive on purpose: the mint title-cases, so the damage is
 *  spelled `[Object Object]` on disk and `[object Object]` in fresh JS. */
export function isCoercedObjectName(name) {
  return typeof name !== "string" || !name.trim() || /\[object\s+object\]/i.test(name);
}

/** ⚠️ NARROWER, AND THE DIFFERENCE MATTERS FOR A REPAIR PASS. `isCoercedObjectName` is right for the MINT
 *  (refuse anything unusable). It is too wide for a MIGRATION, which deletes: a record with a missing or
 *  blank name is a different defect with a non-destructive fix (rename it from its id), while the
 *  `[object Object]` artefact is a place that was never named at all and has nothing to restore.
 *
 *  I learned this from the suite rather than from reasoning: the wide check deleted a legitimate SNG-216
 *  fixture that simply had no name yet. Reconcile's own law is "NEVER removes or downgrades", so the
 *  exception has to be as narrow as the damage. */
/** ⛔ SNG-347 — A DESCRIPTION IS NOT A NAME, AND THIS IS THE THIRD PLACE IT HAD TO BE SAID.
 *
 *  Erik's newly-minted NPC arrived as "someone tending the waystation fire—shelter-keeper, traveler" — a
 *  REQUEST rendered as an identity. The ribbon then announced it in bold, as a name: "**someone tending
 *  the waystation fire** is now a real presence in this place."
 *
 *  ⚠️ SNG-199 already found this class on the REGISTRY path and fixed it there ("a descriptive CLAUSE is
 *  not a name" — prettifyNpcName). The GENERATE mint never got the guard, so the same defect walked in
 *  through the other door. Counting the doors is not finding them.
 *
 *  ⛔ AND prettifyNpcName WOULD MAKE THIS ONE WORSE, which is why this is a separate check and not a reuse:
 *  its "already human-shaped" test requires a capital letter, so an all-lowercase description falls through
 *  to the SLUG-PRETTIFIER and gets title-cased into "Someone Tending The Waystation" — which LOOKS like a
 *  name, passes every downstream check, and is nonsense. A cosmetic pass standing where a validator belongs
 *  does not just fail to fix the input; it launders it.
 *
 *  Deliberately conservative — it must never reject a legitimate epithet-name like "The Ashen Warden":
 *    · opens with an indefinite/anonymous marker (someone · somebody · a · an)
 *    · begins lowercase (a person's name is capitalized; a description is not)
 *    · runs to a clause (a comma or semicolon) — SNG-199's own signal
 *    · runs longer than five words — a name is a few words, not a sentence
 */
export function isDescriptiveNotName(name) {
  const s = String(name || "").trim();
  if (!s) return false;                                   // blank is a DIFFERENT defect (see isCoercedObjectArtefact)
  if (/^(someone|somebody|some\s|an?\s)/i.test(s)) return true;
  if (/^[a-z]/.test(s)) return true;
  if (/[,;]/.test(s)) return true;
  if (s.split(/\s+/).length > 5) return true;
  return false;
}


export function isCoercedObjectArtefact(name) {
  return typeof name === "string" && /\[object\s+object\]/i.test(name);
}

/** SNG-330 — ⚠️ REACHABILITY IS SYMMETRIC. A road you walked in one direction is a road.
 *
 *  FOUND IN PLAY by Erik ("I was connected to the place I wanted to go, but no Travel button"), traced by
 *  Aevi. The map read ONE array — the current location's own `connections` — and never asked whether the
 *  DESTINATION lists here. That is harmless for authored content (all 118 authored locations are
 *  reciprocal) and broken for minted ones:
 *
 *    · `mintTransitLocation` writes BOTH edges, correctly, in memory.
 *    · `new → here` lives on `character.generated.location` and PERSISTS.
 *    · `here → new` is a mutation of AUTHORED content, which is shared and never saved. On reload it is gone.
 *
 *  So after a reload the place is on the map, in `knownPlaces`, remembered by the fiction — and missing from
 *  the one array the button reads. Connected in every way a player can perceive, and not in the one that counts.
 *
 *  ⛔ THE SYMMETRIC READ IS THE REAL FIX AND `placeEdges` IS THE BELT: making the READ symmetric renders the
 *  entire class of one-directional edge harmless, including any this codebase has not thought of yet.
 *  Persisting the player's own edges then repairs the ones already lost. */
export function canTravelBetween(here, destId, locations = {}, placeEdges = {}) {
  if (!here || !destId || here === destId) return false;
  const out = locations[here]?.connections || [];
  if (out.includes(destId)) return true;
  // …or the destination lists HERE. One road, either direction.
  const back = locations[destId]?.connections || [];
  if (back.includes(here)) return true;
  // …or the player made this road themselves and we wrote it down.
  return (placeEdges?.[here] || []).includes(destId) || (placeEdges?.[destId] || []).includes(here);
}

/** SNG-056: resolve a GM `moveTo` reference (an id or a place name) to a real loaded location id,
 *  or null if it names nowhere that exists. Exact id → slugified id → exact name → loose name. Pure. */
export function resolveLocationId(ref, locations = {}, { here = null } = {}) {
  // SNG-329: coerce FIRST. An object reference used to stringify to "[object Object]", match nothing, and
  // fall through to a mint that wrote the artefact into the save.
  ref = locationRefToString(ref);
  if (!ref) return null;
  const raw = String(ref).trim();
  if (locations[raw]) return raw;
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  if (locations[slug]) return slug;
  const lc = raw.toLowerCase();
  // ⛔ THE NEAREST OF SEVERAL (Erik 2026-09-06). Two places that answer to one word were decided by file order,
  // position-blind — that is how a name once minted a second Hub. Told where the character stands (`here`: a record
  // or an id), each tier below hands back the CLOSEST match by walking days; not told, it behaves exactly as before.
  const hereLoc = here && typeof here === "object" ? here : (here ? locations[here] : null);
  const pick = (keys) => {
    if (keys.length <= 1 || !hereLoc?.worldPos) return keys[0] ?? null;
    let best = keys[0], bestD = Infinity;
    for (const k of keys) { const d = walkingDays(hereLoc, locations[k]); if (d != null && d < bestD) { best = k; bestD = d; } }
    return best;
  };
  const byName = Object.entries(locations).filter(([, l]) => (l.name || "").toLowerCase() === lc).map(([k]) => k);
  if (byName.length) return pick(byName);
  // SNG-221: a canonical location may declare `aliases` (other names it answers to — e.g. the name a
  // gen-stub carried before its canonical file was authored: "Stillwater's Trouble" / "Raven's Home").
  // An EXACT alias match (raw or slugged) resolves to it, before the looser substring pass below — so
  // traveling to a superseded gen-location's name lands on the real place (Q3), not a fresh mint.
  const byAlias = Object.entries(locations).filter(([, l]) => (l.aliases || []).some(a => String(a).toLowerCase() === lc)).map(([k]) => k);
  if (byAlias.length) return pick(byAlias);
  const byAliasSlug = Object.entries(locations).filter(([, l]) => (l.aliases || []).some(a => String(a).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") === slug)).map(([k]) => k);
  if (byAliasSlug.length) return pick(byAliasSlug);
  const loose = Object.entries(locations).filter(([, l]) => { const n = (l.name || "").toLowerCase(); return n && (n.includes(lc) || lc.includes(n)); }).map(([k]) => k);
  if (loose.length) return pick(loose);
  return null;
}

import { unusablePatterns as unusableTitlePatterns, orderSensitivePatterns } from "./titles.js";
import { economyCoverage } from "./economy.js";
import { setSeasonCalendar, seasonCalendar } from "./worldtime.js";
import { aestheticFor } from "./art.js";   // SNG-435 §C3: one resolver, tradition then power system   // CCODE-195: the world's calendar is authored, not compiled in   // SNG-302: say at load whether the second price axis is reachable   // SNG-287: report patterns with no slot source

/** ⛔ CCODE-229 (Aevi's §3) — THE LOADER'S TEMPLATE MERGE, EXPORTED, SO A GATE CAN SEE WHAT THE GAME SEES.
 *
 *  `first_gift_template` supplies `mechanic` and `shape` to its 25-craft cohort AT LOAD. On disk those
 *  crafts have neither. ⚠️ SO ANY CHECK THAT WALKS THE FILES REPORTS PHANTOM DEFECTS — and one of them,
 *  `SNG-263 §5`, is a RATCHET, so seven crafts that never lost anything were reading as a REGRESSION:
 *  the most alarming possible framing for a defect that does not exist.
 *
 *  ⛔ EXPORTED RATHER THAN COPIED. Aevi's `po/matrix_gen.mjs` had already reimplemented this merge, which
 *  made two implementations and a third path (the file-reading gates) with none. A shared helper that is
 *  a COPY of the loader can drift from the loader; this IS the loader's merge, called by the loader on the
 *  line where it used to be inlined, so parity holds by construction and not by discipline.
 *
 *  ⚠️ AND THE RULE IS ABSENT-FIELDS-ONLY: the template fills gaps and never overwrites authored content,
 *  with `mechanic` shallow-merged so an authored magnitude survives a templated duration. Mutates in place
 *  and returns the same object, matching how the loader used it. */
export function applyFirstGiftTemplate(abilities, firstGiftTemplate) {
  const fgt = firstGiftTemplate;
  const shared = fgt?.template || null;
  const arc = shared?.rankArc || fgt?.rankArc || [];
  for (const id of (Array.isArray(fgt?.cohort) ? fgt.cohort : [])) {
    const a = abilities?.[id];
    if (!a || !shared) continue;
    for (const [k, v] of Object.entries(shared)) {
      if (k === "rankArc" || k.startsWith("_")) continue;
      if (k === "mechanic" && v && typeof v === "object") a.mechanic = { ...v, ...(a.mechanic || {}) };
      else if (a[k] === undefined) a[k] = v;
    }
    for (const step of arc) {
      const rank = (a.tree || []).find(x => x.rank === step.rank);
      if (!rank) continue;
      for (const [k, v] of Object.entries(step)) if (!k.startsWith("_") && rank[k] === undefined) rank[k] = v;
    }
    a._fromTemplate = fgt.id || "first_gift_template";
  }
  return abilities;
}

export async function loadContent() {
  const index = await fetchJSON("content/packs/core/manifest.json");
  const valley = await fetchJSON("content/packs/valley/manifest.json");

  const spectrums = await fetchJSON(`content/packs/core/${index.provides.spectrums}`);
  // SNG-092: ONE loading mechanism. Every core rules file resolves through the manifest's
  // provides.rules by NAME — never by array position (rules[0] silently became attribute_gates.json
  // when the manifest was re-registered, which nulls baseChance/d100/energy) and never by a hardcoded
  // path (origins/backgrounds/regions/accords used to bypass the manifest entirely). rulePath finds the
  // entry by the file's distinctive stem; the array's ORDER never matters again.
  // SNG-331 — ⚠️ MATCH THE FILENAME, NOT A SUBSTRING OF THE PATH.
  //
  // This was `.find(r => r.includes(name))`, and `"rules/location_affinities.json".includes("ties")` is
  // TRUE — "affini**ties**". `location_affinities.json` is registered earlier, so `loadRule("ties")` returned
  // it, and `rules.ties` has been the location-affinities table since the day Aevi authored the ties file.
  //
  // ⛔ A NEW DOOR IN THE PromisedButUnread FAMILY, AND THE NASTIEST YET: registered ✓ loaded ✓ destructured
  // into the right name ✓ merged ✓ — and it was THE WRONG FILE. Every check we built for this family asks
  // whether the wiring reaches something; none asked whether it reached the RIGHT something. The content
  // was never unread — it was read past.
  //
  // One collision exists today. The resolver is the fix rather than the filename, because any short rule
  // name that appears inside a longer one is the same trap waiting: `ties`/`affinities`, and a future
  // `charges`/`surcharges`, `arc`/`hierarchy`, `set`/`offset` would all land the same way.
  const rulePath = (name) => {
    const rules = index.provides.rules || [];
    // 1. EXACT FILENAME WINS. This is the SNG-331 fix: `loadRule("ties")` must not match
    //    `location_affinities.json` just because "affini-TIES" contains it.
    const exact = rules.find(r => r === `rules/${name}.json` || r.endsWith(`/${name}.json`));
    if (exact) return `content/packs/core/${exact}`;
    // 2. ⚠️ THEN AN *UNAMBIGUOUS* SUBSTRING, because exact-only BROKE `emergence`. There is no
    //    `rules/emergence.json` — the content lives in `emergence_recipes.json`, and the old substring
    //    resolver found it. My SNG-331 fix removed that and silently emptied 21 recipes and a branch
    //    template: `loadRule("emergence", {recipes:[],branchTemplates:[]})` fell to its own fallback and
    //    every gate stayed green, because nothing asserted the recipes were non-empty.
    //
    //    ⛔ UNAMBIGUOUS IS THE WHOLE POINT. One match is a filename convention nobody wrote down; TWO is
    //    the `ties` bug, and it now refuses rather than guessing which was meant.
    const near = rules.filter(r => r.split("/").pop().replace(/\.json$/, "").includes(name));
    if (near.length === 1) return `content/packs/core/${near[0]}`;
    if (near.length > 1) console.warn(`[rules] "${name}" matches ${near.length} files ambiguously — refusing to guess:`, near.join(", "));
    return null;
  };
  const resPath = rulePath("resolution");
  if (!resPath) throw new Error("manifest: core provides.rules is missing resolution.json (the base rules)");
  // Every optional core rule loads the same way: found by name in the manifest, fetched, fallback on
  // a miss. No inline .find(), no hardcoded path, no positional index.
  const loadRule = async (name, fallback) => { const p = rulePath(name); if (!p) return fallback; try { return await fetchJSON(p); } catch { return fallback; } };
  // SNG-187: the base rules and every optional core rule are independent fetches (loadRule tolerates
  // its own misses; only the base `rules` is fatal, as before). Load them as ONE wave instead of ~12
  // serial round-trips. rankProgression comments retained on the consumers below.
  const [rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks,
         romanceGuidance, functionVocabulary, nativeGrants, skillBattle, traditionsRaw, worldClock, schools, classArchetypes, repairPanelManifest, craftMechanics, titlesRule, arcResponseRule, encountersRule, coliseumGrid, economyRule, chargesRule, threatRule, incapRule, tiesRule, questStructureRule, martialRule, ladderRule, mintedNamesRule, newsTemplatesRule, firstGiftTemplate, damageFamilies, abilityRenameMap, combinationRecipes] = await Promise.all([
    fetchJSON(resPath),
    loadRule("emergence", { recipes: [], branchTemplates: [] }),
    loadRule("attribute_gates", { gates: {} }),
    loadRule("skill_capacity", { skillsKnownByLevel: {} }),
    loadRule("location_affinities", { typeAffinity: {}, tagAliases: {}, vectorAlignment: {} }),
    loadRule("intensity_scaling", { steps: {} }),
    loadRule("branch_forks", { forks: {} }),
    loadRule("romance_guidance", null),                                 // pulled into the GM prompt on romantic intent
    loadRule("function_vocabulary", { families: {} }),                  // SNG-124: the 8 function families (verb→family)
    loadRule("native_grants", { traditionNativeGrants: {}, grantCap: 5 }), // SNG-101b: by-right native-grant table
    loadRule("skill_battle_system", null),                              // SNG-098: the skill-battle machine layer
    loadRule("traditions", null),                                       // SNG-055/059: the great-circle domain-access map
    loadRule("world_clock", null),                                      // SNG-191: two clocks — the Kept Count unit + peoples' idioms
    loadRule("schools", null),                                          // SNG-193b: a tradition is a root; a school is what it reaches WITH (sets the substrate band)
    loadRule("class_archetypes", null),                                 // SNG-192 §4: soft archetype lenses (role × reach) for the creation front door
    loadRule("repair_panel_manifest", null),                            // SNG-207 §6.2: the authoritative Repair-panel capability list, for the GM's context (no hallucinated controls)
    loadRule("craft_mechanics", { families: {}, familyDefaults: {} }),   // SNG-263: what each verb-family DOES + the magnitudes an unauthored craft inherits
    loadRule("titles", null),                                         // SNG-287: generative titles — patterns whose slots must be fillable
    loadRule("arc_response", null),                                    // SNG-275: the world-engine dials — 21 of them, unauthorable until now
    loadRule("encounters", null),                                       // SNG-271/1a: the XP table — unregistered since forever, so every encounter paid ZERO
    loadRule("coliseum_grid", { cells: [] }),
    // SNG-300 — ⚠️ IN THIS ARRAY, not the second one. `economyRule` is destructured from THIS Promise.all,
    // and the loadRule had been added to the OTHER one thirty lines down, so the name resolved to undefined
    // and `rules.economy = economyRule` merged nothing. Registered ✓ loaded ✓ destructured ✗ — a third
    // distinct way for this same wiring to be half-done, and the one positional destructuring makes silent.
    loadRule("economy", null),
    // SNG-316 — added to THIS array deliberately. CCode had to move `economy` here after I put its
    // loadRule in the second Promise.all thirty lines down, where the name resolved to undefined and
    // merged nothing. Positional destructuring makes that failure silent, so the rule is: the
    // loadRule goes in the SAME array as the name it fills.
    loadRule("charges", null),
    loadRule("threat", null),
    loadRule("incapacitation", null),
    loadRule("ties", null),   // SNG-328: how kin and interests accrue from what the world already records   // SNG-323: aggressor weights, tunable instead of a const   // SNG-322/CCODE-52: the threat ladder — bands decide the lethal flag and the warn offer   // SNG-316: what satisfies each prep condition, so the tick can bank a charge without reading prose
    // SNG-341b — the SHAPE a quest must have. Aevi authored and registered it; these are the other three
    // legs. In THIS array, beside the name that receives it — the rule she wrote after `economy` was
    // destructured from one Promise.all while its loadRule sat in another.
    loadRule("quest_structure", null),
    loadRule("martial_paths", null),
    loadRule("sub_attribute_ladder", null),
    // SNG-431 §1a — THE NAME POOLS. Authored at `5ba1c26f` and reachable by nothing: the file was never in
    // the manifest, so it was not merely registered-but-unloaded (CCODE-55's catch) — it was invisible one
    // step earlier. In THIS array beside the name that receives it, for the reason two comments up.
    loadRule("minted_names", null),
    // SNG-433 — THE CLASH TEMPLATES. Authored at `b197b719` and, like the pools above, in no manifest: the
    // engine kept saying "withdraws to lick their wounds" while the words Erik asked for sat on disk. In
    // THIS array beside the name that receives it, for the reason the `economy` comment gives.
    loadRule("news_templates", null),
    // SNG-506 - THE FIRST-GIFT TEMPLATE. 25 senses share one stat block; the template holds it and
    // each entry holds what makes it that people's craft. Loaded HERE, before the ability merge below,
    // because inheritance has to happen while the catalogue is being built - an ability that reaches
    // the consumers without its levelReq is not late, it is wrong.
    // ⛔ CCODE-281 / Aevi 2026-08-24 — APPENDED AT THE END ON PURPOSE. This is a POSITIONAL destructure:
    // inserting mid-array shifts every rule after it, which is the SNG-092 failure ("rules[0] silently
    // became attribute_gates.json") in a new costume. ⚠️ `damagetypes.js` takes `families` as an argument
    // and defaults to {}, so an unloaded file leaves every type family-less and every composite blow
    // unwardable — registered is only half; CCODE-55 asks whether it is ever READ.
    loadRule("first_gift_template", null),
    loadRule("damage_families", { families: {} }),
    loadRule("ability_rename_map", { map: {} }),
    // ⛔ SNG-369 §2a — SIXTY-THREE AUTHORED BRAIDS, REGISTERED IN THE MANIFEST AND READ BY NOTHING. The
    // file said so itself: "Until a consumer exists, anything authored here is documentation."
    // ⚠️ REGISTRATION IS NOT ARRIVAL (SNG-342) — being in the manifest only means it COULD be fetched.
    loadRule("combination_recipes", { recipes: [] })
  ]);
  // SNG-101b: the native-grant table merges INTO the rules bag so nativeGrantIdsFor reads it directly.
  // SNG-271/1a — THE XP TABLE. `resolution.json` already carried an inline `encounters` block, so duels,
  // challenges and puzzles DID pay; anything else (fled, walked away, a type authored later) hit an undefined
  // entry and `?? 0` paid nothing. The promoted file supersedes the inline block and adds the `default` rung,
  // so an unknown type falls back instead of silently paying zero. Merged here — not merely fetched — because
  // a loaded-but-unread value is the same bug one layer up.
  // SNG-275 — THE DIALS BECOME REACHABLE. The engine read `rules.arcResponse` and `rules.tierLadder` for
  // weeks; neither existed in any pack, so all 21 numbers ran on hardcoded fallbacks and no one could turn
  // one without editing engine source. A reader with no writer — the fourth door. The file is authored at
  // exactly the old fallbacks, so this merge changes no behaviour; it only makes the behaviour reachable.
  if (titlesRule?.patterns) rules.titles = titlesRule;
  // SNG-287: say which authored title patterns can NEVER be chosen, at load, the way the content counts are
  // reported. A pattern whose slot has no source is not broken content — it is content waiting on a source —
  // but it must be visible, or the next reader believes the world can name someone it cannot.
  if (titlesRule?.patterns) {
    const dead = unusableTitlePatterns(titlesRule.patterns);
    if (dead.length) console.log(`[titles] ${dead.length} pattern(s) unusable — no source for their slots: ${dead.map(d => d.id).join(", ")}`);
    // SNG-294: and the ones whose reachability depends on ORDER. Not broken — but a pattern below a permissive
    // one is reached only by records the permissive one declines, which is worth an author knowing.
    const late = orderSensitivePatterns(titlesRule.patterns);
    if (late.length) console.log(`[titles] ${late.length} pattern(s) order-sensitive — reached only by records an earlier pattern declines: ${late.map(d => d.id).join(", ")}`);
  }
  if (arcResponseRule?.arcResponse) rules.arcResponse = { ...(rules.arcResponse || {}), ...arcResponseRule.arcResponse };
  if (arcResponseRule?.tierLadder) rules.tierLadder = { ...(rules.tierLadder || {}), ...arcResponseRule.tierLadder };
  // SNG-297: the pools a minted figure is built from. Merged explicitly — a block sitting in the file that
  // nothing lifts into `rules` is a writer with no reader, which is the sweep's own finding pointed at me.
  if (arcResponseRule?.mintedFigures) rules.mintedFigures = arcResponseRule.mintedFigures;
  // SNG-431 §1a: the pools the ONE NAMER draws from — given names by tradition, bynames built from each
  // tradition's own craft-words, wants by originKind. Merged in the same breath as the load for the reason
  // the line above says: a block sitting in a file that nothing lifts into `rules` is a writer with no reader.
  if (mintedNamesRule?.given && mintedNamesRule?.byname) rules.mintedNames = mintedNamesRule;
  // SNG-433: the sentences a fight is reported in. Merged in the same breath as the load — a rule bag that
  // nothing lifts onto `rules` is the reader-with-no-writer failure one layer up, twice over on this file.
  if (newsTemplatesRule?.templates) rules.newsTemplates = newsTemplatesRule;
  // ⛔ CCODE-195: THE SEASON CALENDAR. It was two engine constants, so the world's own calendar could not be
  // turned by the people who own the world — and at 45 days a season took ~600 turns of play, which is why Erik
  // had never seen one change. Installed here, from the file that already documents the two clocks.
  {
    setSeasonCalendar(worldClock?.calendar);
    // ⚠️ READ BACK WHAT IS IN FORCE, not what was handed over. A malformed block is REFUSED, so the two can
    // differ — and the point of saying this out loud is to name the calendar the game is actually running,
    // which is the one the clock will answer with.
    const cal = seasonCalendar();
    const authored = cal.daysPerSeason === Number(worldClock?.calendar?.daysPerSeason);
    console.log(`[clock] season calendar: ${cal.seasons.length} seasons × ${cal.daysPerSeason} days` +
      `${authored ? "" : " (engine fallback — this pack carries no usable authored calendar)"}`);
  }
  // ⚠️ SAID OUT LOUD AT LOAD, like the titles report above. Without the templates the tick falls back to the
  // four hardcoded sentences and everything still works — which is exactly how a missing file stays missing
  // for two tickets. A fallback that nobody can see is not a fallback, it is a silence.
  {
    const t = rules.newsTemplates?.templates;
    if (t) console.log(`[news] clash templates: ${Object.keys(t).length} outcomes × ${Object.keys(t[Object.keys(t)[0]] || {}).filter(k => !k.startsWith("_")).length} relationships`);
    else console.log("[news] no clash templates loaded — clash news falls back to the engine's built-in lines");
  }
  if (arcResponseRule?.careShift) rules.careShift = arcResponseRule.careShift;
  if (arcResponseRule?.engagement) rules.engagement = arcResponseRule.engagement;   // SNG-300: who seeks a fight   // SNG-298: how a figure changes their mind
  if (encountersRule) rules.encounters = { ...(rules.encounters || {}), ...encountersRule };
  // SNG-300: THE ECONOMY. Registered-but-unloaded is the failure CCODE-55 catches and the one that made every
  // encounter pay zero XP for weeks — the file existed and was whitelisted and reached nothing. Merged here in
  // the same breath as the registration so `worth`, the currencies and the per-region need/scarcity are all
  // readable off `rules`, which is what gives `priceShift` a price to shift.
  if (economyRule) rules.economy = economyRule;
  if (chargesRule) rules.charges = chargesRule;
  if (threatRule) rules.threat = threatRule;
  if (incapRule) rules.incapacitation = incapRule;
  if (tiesRule) rules.ties = tiesRule;   // SNG-328   // SNG-323   // SNG-322: the threat ladder   // SNG-316: the charge-condition vocabulary
  if (questStructureRule) rules.questStructure = questStructureRule;   // SNG-341b
  if (martialRule) rules.martialPaths = martialRule;   // SNG-345
  // SNG-356 — THE AUTHORED SUB-ATTRIBUTE LADDER, and it RETIRES `attributeSoftCap` into content.
  // Erik: "specify what each point up to 20 gets you so we can better control the impact and the player
  // can see it exactly." ⚠️ SNG-342'"'"'s lesson applies exactly here — this file was REGISTERED in the
  // manifest a day before anything loaded it, and registration is not arrival. It is declared a live gap
  // in rules_classification until this line exists.
  if (ladderRule) rules.subAttributeLadder = ladderRule;
  // ⛔ CCODE-282 — THE DAMAGE FAMILIES REACH THE RESOLUTION PATH. Aevi flagged this against herself six
  // lines above the load ("registered is only half; CCODE-55 asks whether it is ever READ") and she was
  // right: `content.damageFamilies` appeared exactly twice in the engine — this destructure and the
  // assignment onto `content` — while `skill_battle` resolved every ward against the OLDER copy inside
  // craft_mechanics.json. Her v2 (four families, 20 types, no polar) was authored, registered, loaded,
  // and inert. ⚠️ MERGED, NOT MERELY FETCHED, for the reason the XP table gives: a loaded-but-unread
  // value is the same bug one layer up.
  // ⚠️ THE DOC IS UNWRAPPED TO ITS FAMILY MAP HERE so every consumer sees one shape. A pack still on the
  // v1 bare-map shape passes through untouched.
  // ⚠️ THE WHOLE DOC, NOT ITS INNER BLOCK. My first pass unwrapped to `.families` here and gate 331 —
  // "every merged rules key holds the CONTENT OF ITS OWN FILE" — caught it immediately. That gate exists
  // because a merged key once held the wrong file entirely. The unwrap belongs at READ time, in
  // `familyMapOf`, where it happens once for every shape rather than once per load site.
  if (damageFamilies) rules.damageFamilies = damageFamilies;
  // ⛔ CCODE-294 — THE RENAME MAP REACHES THE MIGRATION. 377 old→new ability ids from the naming-SOP pass,
  // registered and 57 KB, loaded by nothing — so 22 references across 7 real saves pointed at ids the
  // catalogue no longer answered to. ⚠️ Merged rather than merely fetched, for the reason the XP table
  // above gives: a loaded-but-unread value is the same bug one layer up.
  if (abilityRenameMap?.map) rules.abilityRenames = abilityRenameMap.map;
  // ⛔ SNG-369 — CANON, NOT STORE. The live `world/braid_recipes.json` is what a WORLD has discovered;
  // this is what the world CONTAINS. `recipeFor` reads the store first and falls through to here, so a
  // player who first-found and named a braid keeps their name — the catalogue fills the void behind them.
  // ⚠⚠ THE KEY HOLDS THE WHOLE FILE, NOT THE ARRAY INSIDE IT. Gate 331 asserts that a merged rules key
  // named for a file carries THAT FILE'S CONTENT — it caught me assigning `.recipes` and reporting array
  // indices where the file's own keys belonged. Consumers ask for `.recipes` themselves.
  if (combinationRecipes) rules.combinationRecipes = combinationRecipes;
  rules.traditionNativeGrants = nativeGrants.traditionNativeGrants || {};
  rules.grantCap = nativeGrants.grantCap ?? 5;
  // SNG-263: the craft-mechanics config rides the rules bag so battleRound reads it off a value it already
  // carries — adding it as a battleRound OPTION would have to survive skillBattleRound's hand-built call,
  // and seam_battle_round_options records four separate times an option was silently dropped there.
  rules.craftMechanics = craftMechanics || null;
  // CCODE-89: the blind grid rides the rules bag for the same reason craft-mechanics does — one value the
  // callers already hold. It was manifest-registered and read by NOTHING for a fortnight, sitting as design
  // canon with three champion encounters already authored against it; engine/coliseum.js is its body now.
  rules.coliseumGrid = coliseumGrid || null;
  // SNG-055/059: traditions optional — absence leaves the domain gates ungoverned (open), never breaks load.
  let traditions = traditionsRaw, traditionIndex = null;
  // ⛔ CCODE-333 — DOOR THREE. `traditions_v2.json` was authored and registered in the manifest and NOTHING
  // LOADED IT, so the 14 domains could not be seen by the game. Loaded here and handed to the index; a miss
  // is tolerated the same way every optional rule is, and leaves the domain layer simply absent.
  const traditionsV2Raw = await loadRule("traditions_v2", null);
  if (traditions) { try { traditionIndex = buildTraditionIndex(traditions, traditionsV2Raw); } catch { traditions = null; } }

  // SNG-187: the manifest groups below are 252 files that were fetched STRICTLY SEQUENTIALLY — each
  // await waiting on the one before it — which was the entire 15.3s cold load (10–20s of pure
  // round-trip latency, not payload). Every group reads a path list known in full before the first
  // request, so they fetch in parallel now — one HTTP/2 wave instead of 252. Two invariants held
  // EXACTLY (the spec's cautions):
  //   • FAILURE TOLERANCE — where the old code try-wrapped a group so one bad file didn't kill the
  //     load (valley items, quests), that stays: allSettled, skip the rejected. Every other group was
  //     fatal-on-miss before and stays fatal (Promise.all rejects the batch).
  //   • MANIFEST-ORDER FOLD — Promise.all/allSettled preserve INPUT order in their result arrays, so
  //     the fold loops below run in the SAME order the sequential loops did. For an id-keyed map that
  //     means the same entry wins a duplicate-id collision (last-write-wins unchanged); for the quests
  //     array, the same concatenation order. Verified byte-identical to the sequential load.
  const jAll = list => Promise.all((list || []).map(p => fetchJSON(p)));
  const jSettled = list => Promise.allSettled((list || []).map(p => fetchJSON(p)));
  const corePath = p => `content/packs/core/${p}`, valleyPath = p => `content/packs/valley/${p}`;
  const loreProvides = valley.provides.lore || [];
  const eventProvides = valley.provides.events || [];
  // Fire every group concurrently — creating the promises before the first await is what overlaps them.
  const abilitiesP = jAll((index.provides.abilities || []).map(corePath));
  const coreItemsP = jAll((index.provides.items || []).map(corePath));
  const valleyItemsP = jSettled((valley.provides.items || []).map(valleyPath));
  const locationsP = jAll((valley.provides.locations || []).map(valleyPath));
  const npcsP = jAll((valley.provides.npcs || []).map(valleyPath));
  const eventsP = jAll(eventProvides.map(valleyPath));
  const companionsP = jAll((valley.provides.companions || []).map(valleyPath));
  // ⛔ CCODE-232 (Aevi's §2 pass 3) — CORE'S ENCOUNTERS LOAD TOO. This read `valley` only, so the two
  // encounter defs core declares (the Sunk Assay's intake and warden) were whitelisted, on disk, and
  // reached nothing — SNG-064's own failure inside the loader that enforces it.
  // ⚠️ SAFE TO LOAD because `CONTENT.encounters` is looked up BY ID everywhere in play; the only
  // all-values read is a dev preview leg, and random encounters draw from their own pool. Loading a def
  // nothing links to puts it in front of nobody — which is also why nobody noticed for this long.
  const encountersP = jAll([
    ...(index.provides.encounters || []).map(corePath),
    ...(valley.provides.encounters || []).map(valleyPath),
  ]);
  const loreP = Promise.all(loreProvides.map(p => fetchText(valleyPath(p))));
  const questsP = jSettled((valley.provides.quests || []).map(valleyPath));
  // SNG-203: the quest hierarchy's new tiers — tradition arcs (tier 2, keyed by traditionId) + npc quests
  // (tier 6, the errand tier). Independent, tolerant fetches like everything else; a miss disables the tier.
  const traditionArcsP = jSettled((valley.provides.tradition_arcs || []).map(valleyPath));
  const npcQuestsP = jSettled((valley.provides.npc_quests || []).map(valleyPath));
  const bestiaryP = jSettled((valley.provides.bestiary || []).map(valleyPath)); // SNG-229 §2a
  const traditionMotivationsP = jSettled((valley.provides.tradition_motivations || []).map(valleyPath)); // SNG-229 §2c
  const npcInteriorityP = jSettled((valley.provides.npc_interiority || []).map(valleyPath)); // SNG-233 §2a

  // ability-arch v2: tolerant defaults so the engine can read the new fields before the content
  // classification pass tags every ability. rankProgression defaults to "use" (depth is earned, not
  // bought); nativeOrCombination stays null until authored (consumers treat null as unclassified).
  // ⛔ CCODE-217 — THE ABILITY WINS. This REVERSES CCODE-200's precedence, deliberately and on evidence.
  //
  // CCODE-200 made the PACK win because that was the existing convention and I did not want to move more
  // than the bug required. Aevi then found 333 abilities whose own `powerSystem` disagreed with their
  // file's header and refused to guess which should win - correctly, because the answer decides 333 rows.
  //
  // MEASURED, THE HEADERS WERE MOSTLY NOT POWER SYSTEMS AT ALL. Thirteen of the fifteen disagreeing files
  // are `reach_*` - `reach_body_mind`, `reach_dark_light` - which are AXIS NAMES, the file's subject. So
  // 260+ crafts were loading with a FILENAME where their power system should be, and the real vocabulary
  // (`metaphysical`, `precursor`, `ordered_nanite`, `wild_nanite`, `combination`) sat unread one line down.
  //
  // ⚠️ I BUILT THIS ONCE BEFORE AND PUT IT BACK, because flipping repainted the radiant tradition: the
  // `radiant` palette was reachable only through the pack HEADER. The coverage COUNT did not move when it
  // happened - 9 uncovered before and after - so only the §C3 gate, which asserts WHICH palette rather
  // than WHETHER one, caught it. Aevi then moved radiant/harmonic/valley_craft into `traditions` where
  // they belonged (they are peoples, not physics) and aliased `combination` to the braid palette. With the
  // blocker gone she asked for the flip, and this is it.
  //
  // ⛔ AND THE PACK-LEVEL STAMP STILL FILLS THE GAP, WHICH IS ALL CCODE-200 WAS EVER PROTECTING.
  //
  // Aevi asked for a ruling on 333 abilities whose own `powerSystem` disagrees with their file's header,
  // and refused to guess. Measured, thirteen of the fifteen disagreeing headers are `reach_*` — AXIS
  // NAMES, the file's subject — so 260+ crafts load with a FILENAME where their power system should be
  // and the real vocabulary sits unread one line down. The ability should win. That much is settled.
  //
  // ⛔ BUT FLIPPING IT REPAINTS THE RADIANT TRADITION. `aestheticFor` reaches the `radiant` palette
  // through the pack HEADER; with the ability winning, every radiant craft resolves `precursor` instead
  // and paints as precursor. Coverage stayed at 9 uncovered, so a count-based check said nothing was lost
  // — the pictures changed underneath an unchanged number. The §C3 gate caught it, and it was right to.
  //
  // ⚠️ The blocker is ONE MISSING ALIAS: tradition `radiant_folk` has no palette key, and the palette
  // that belongs to it is filed under `powerSystems.radiant`. That is Aevi's doc and a content decision,
  // so this stays as it was until she rules — shipping a silent repaint of 300 crafts on my own authority
  // is exactly what she declined to do when she declined to guess.
  //
  // ⛔ AND THE PACK-LEVEL STAMP MUST STILL NEVER CLOBBER.
  // CCODE-200 made the PACK win because that was the existing convention and I did not want to move more
  // than the bug required. Aevi then found 333 abilities whose own `powerSystem` disagrees with their
  // file's header and refused to guess which should win - correctly, because the answer decides 333 rows.
  //
  // MEASURED, THE HEADERS ARE MOSTLY NOT POWER SYSTEMS AT ALL. Thirteen of the fifteen disagreeing files
  // are `reach_*` - `reach_body_mind`, `reach_dark_light` - which are AXIS NAMES, the file's subject. So
  // 260+ crafts were loading with a FILENAME where their power system should be, and the real vocabulary
  // (`metaphysical`, `precursor`, `ordered_nanite`, `wild_nanite`, `combination`) sat unread one line down.
  //
  // ⚠️ So the rule is the one this codebase uses everywhere else: THE MORE SPECIFIC DECLARATION WINS.
  // An ability that states its own power system knows better than the file it happens to sit in. The pack
  // header still fills the gap - which is all CCODE-200 was ever really protecting.
  //
  // ⛔ AND THE PACK-LEVEL STAMP MUST STILL NEVER CLOBBER. 13 registered packs declare no pack-level
  // `powerSystem`, so `powerSystem: pack.powerSystem` overwrote 28 abilities' OWN authored value with
  // undefined - silently, at load, where no file-level check can see it. The pack still WINS where it
  // declares one (that is the existing convention everywhere else); the ability's own value now only
  // fills the gap instead of being thrown away. This is what left `sling_and_stone` unable to resolve a
  // palette while its sibling ranged crafts were fine.
  const abilities = {};
  for (const pack of await abilitiesP) for (const a of pack.abilities) abilities[a.id] = {
    ...a, powerSystem: a.powerSystem || pack.powerSystem,
    // ⛔ CCODE-219 — AND THE FILE'S OWN GROUPING SURVIVES. CCODE-217 correctly let the ability's physics
    // win, and SNG-535 then reclassified both currents as `combination` with a `powerMix` - at which point
    // `seedInnateSubstrate`, which matched `powerSystem === "wild_current"`, could no longer tell a wild
    // current from any other combination and NO ORIGIN COULD SEED ONE.
    // ⚠️ Two different questions were being asked of one field: WHAT PHYSICS IS THIS (the ability knows)
    // and WHICH FAMILY IS IT FROM (the file knows). Discarding the second to answer the first is what broke
    // it, so both are kept and each question asks the field that can answer it.
    ...(pack.powerSystem ? { packSystem: pack.powerSystem } : {}),
    rankProgression: a.rankProgression || "use",
    nativeOrCombination: a.nativeOrCombination || null,
    combinationAxis: a.combinationAxis ?? null,
    rankThresholds: a.rankThresholds || { rank1: "given", rank2: "practiced_use", rank3: "defining_moment" }
  };

  // SNG-506 - TEMPLATE INHERITANCE. Erik's ruling on the sense cull: the mechanical identity was the bug,
  // the distinct identity is the feature. So 25 first-gift senses keep their own ids, names, traditions and
  // rank prose, and SHARE one stat block instead of carrying 25 copies of it.
  //
  // THE ENTRY ALWAYS WINS. The template FILLS GAPS; it never overwrites. That is the same law as the pack
  // powerSystem stamp one block up (CCODE-200) and for the same reason - a default that clobbers is a
  // default that eats authored content silently.
  //
  // The template names its own COHORT, so an ability does not opt in; the template opts it in. That keeps
  // the 25-vs-7 split in ONE place, which is where Aevi measured it.
  applyFirstGiftTemplate(abilities, firstGiftTemplate);

  const items = {};
  for (const pack of await coreItemsP) for (const it of pack.items) items[it.id] = it;
  // SNG-BATCH-10 Phase 4: valley.provides.items OVERLAYS core items by id, so it folds AFTER core
  // (unchanged), tolerant of a miss (the Waystaff/riven-gear/valley-kit defs — 19 items — are optional).
  for (const r of await valleyItemsP) if (r.status === "fulfilled") for (const it of (r.value.items || [])) items[it.id] = it;

  const locations = {};
  for (const loc of await locationsP) locations[loc.id] = loc;

  const npcs = {};
  const challengerPools = {}; // SNG-138: a challenger_pool is a COLLECTION (challengers[]), kept out of the
  for (const npc of await npcsP) {                                        // single-NPC registry so it never pollutes
    if (npc && (npc.kind === "challenger_pool" || Array.isArray(npc.challengers))) { if (npc.id) challengerPools[npc.id] = npc; continue; } // name-resolution / GM reuse
    // ⛔ A RECORD WITH NO `id` IS NOT A PERSON. `legends.json` is a COLLECTION file listed under
    // `provides.npcs` — it carries `schemaVersion`, a `note` and a `legends[]`, and no id of its own — so
    // this line stored the file's own header under the key `"undefined"`. ⚠️ THE CENSUS COUNTED A
    // DOCUMENTATION BLOCK AS A PERSON, which is one of the two reasons 113 and 63 disagreed.
    // ⚠️ Its people arrive properly further down, hydrated from `legends.roster`.
    if (!npc?.id) continue;
    npcs[npc.id] = npc;
  }

  const events = {};
  let randomEncounters = null;
  { const packs = await eventsP; eventProvides.forEach((path, i) => {
    const ev = packs[i];
    if (ev.id) events[ev.id] = ev;
    else if (path.includes("random_encounters")) randomEncounters = ev; // SNG-014 table (no id)
  }); }

  // SNG-229 §2a/§2b: the bestiary — morally-clean adversaries, loaded so creatures can be referenced by id
  // (the fear/want/quest weave, Aevi §2c-e, resolves against these), then SYNTHESIZED into danger-gated
  // encounter entries and merged into the pool — so the fight/dangerous rolls (SNG-225) finally have a source
  // of monsters. Tolerant: a missing bestiary just means no synthesized creatures (the pool is unchanged).
  const bestiary = ((await bestiaryP).find(r => r.status === "fulfilled")?.value) || { roster: [], classes: {} };
  if (randomEncounters && Array.isArray(bestiary.roster) && bestiary.roster.length) {
    const monsters = bestiaryEncounters(bestiary);
    randomEncounters = { ...randomEncounters, encounters: [...(randomEncounters.encounters || []), ...monsters] };
  }

  // SNG-229 §2c: WHY the traditions act — each tradition's want, the greater-arc it plays into, its
  // cult-of-purity dark end (villainy), and the creature its craft DREADS (the bestiary fear, resolved by
  // id). NOT plain lore: loreForLocation only surfaces what a location loreRefs, and no location names this —
  // it would be dead content. Loaded as its own type + surfaced SELECTIVELY (traditionMotivationsForGM) for
  // just the traditions in play this beat. Tolerant: a miss disables the surface.
  const traditionMotivations = ((await traditionMotivationsP).find(r => r.status === "fulfilled")?.value) || null;
  // SNG-233 §2a: driven interiority (wants/fears/pushesBackWhen/emotionalRange) for key NPCs, keyed by npc id.
  // Folded into the GM's NPC block (npcRegistryForGM) so an important person renders FROM their drives, not as
  // agreeable furniture. Tolerant: a miss just means no overlay (NPCs render as before).
  const npcInteriority = ((await npcInteriorityP).find(r => r.status === "fulfilled")?.value) || null;

  const companions = {};
  for (const c of await companionsP) companions[c.id] = c;

  const encounters = {};
  for (const e of await encountersP) encounters[e.id] = e;

  // BATCH-13 §A.1. The name strips .md AND .json, because 24 of the 27 lore files are .json and were
  // being keyed as "the_twelve_reaches.json" while every location's loreRefs asks for the bare stem —
  // 84 of 95 locations delivered ZERO lore to the GM until this was fixed. A .json handed to the model
  // raw is ~2,900 tokens of braces per turn, so loreToProse renders it — a silent miss traded for a
  // silent bloat would be worse. (Fold is manifest-ordered; a dup stem resolves as it did sequentially.)
  const lore = {};
  { const raws = await loreP; loreProvides.forEach((path, i) => {
    const file = path.split("/").pop();
    const name = file.replace(/\.(md|json)$/, "");
    lore[name] = file.endsWith(".json") ? loreToProse(raws[i]) : raws[i];
  }); }

  // SNG-BATCH-10 Phase 3 / SNG-065: structured quests concatenate in MANIFEST order (allSettled
  // preserves it). Optional per-file — a miss leaves the rest (freeform GM quests still work). SNG-132:
  // accept an aggregated file ({quests:[…]}), a bare array, or a single standalone quest/arc object.
  let quests = [];
  for (const r of await questsP) if (r.status === "fulfilled") { const qf = r.value; quests = quests.concat(qf.quests || (Array.isArray(qf) ? qf : (qf && qf.id ? [qf] : []))); }
  // SNG-203: tradition arcs keyed by traditionId (the GM finds the right one for a character's people); npc
  // quests as a flat list (the errand pool). Same tolerant shapes as quests: {tradition_arcs:[…]}/{npcQuests:[…]}/bare.
  const traditionArcs = {};
  for (const r of await traditionArcsP) if (r.status === "fulfilled") { const f = r.value; for (const ta of (f.tradition_arcs || f.traditionArcs || (Array.isArray(f) ? f : (f && f.traditionId ? [f] : [])))) if (ta && ta.traditionId) traditionArcs[ta.traditionId] = ta; }
  let npcQuests = [];
  for (const r of await npcQuestsP) if (r.status === "fulfilled") { const f = r.value; npcQuests = npcQuests.concat(f.npcQuests || f.npc_quests || (Array.isArray(f) ? f : (f && f.id ? [f] : []))); }
  // SNG-187: the tail is all INDEPENDENT fetches — the region, the generative substrate grammar +
  // arcs + gen schemas (SNG-BATCH-9, optional: a miss disables generation), origins/backgrounds
  // (SNG-063), terrain regions (SNG-082), the Accords (SNG-089), helper text (SNG-084), the substrate
  // model (SNG-090), the Prologue (SNG-062), and the legends (SNG-042). Load them as ONE wave, then
  // fold the two that mutate already-loaded maps (accords tag abilities, legends hydrate into npcs).
  // Failure semantics preserved exactly: `region` stays fatal; every optional one keeps its fallback.
  const [region, substrate, greaterArcs, genNpc, genLoc, genArc, genCreature, originsDoc, backgroundsDoc, regionsDoc,
         accords, helpDoc, substrateModel, powerSourcesDoc, foothillsDoc, prologue, legendsLoaded, traitReadoutsDoc, traditionAestheticsDoc, frameContentDoc, frameKindsDoc, receiptLineDoc, consumerMapDoc, moveHintsDoc, ribbonCopyDoc, earnedPowerDoc, localLayoutsDoc] = await Promise.all([
    fetchJSON("world/regions/valley.json"),
    fetchJSON("content/packs/valley/lore/generative_substrate.json").catch(() => null),           // generation off on a miss
    fetchJSON("content/packs/valley/lore/greater_arcs.json").then(x => x.arcs || []).catch(() => []), // no arc few-shot
    fetchJSON("schemas/npc.schema.json").catch(() => null),
    fetchJSON("schemas/location.schema.json").catch(() => null),
    fetchJSON("schemas/arc.schema.json").catch(() => null),
    fetchJSON("schemas/creature.schema.json").catch(() => null),   // SNG-250 §4 (CCODE-55): creature generation
    loadRule("origins", {}),
    loadRule("backgrounds", {}),
    loadRule("regions", {}),                                                                       // SNG-082 authored terrain
    loadRule("the_accords", null),                                                                 // SNG-089 the Accords
    loadRule("helper_text", { entries: [] }),                                                      // SNG-084 in-context help
    loadRule("the_substrate", null),                                                               // SNG-090 the substrate model
    loadRule("power_sources", null),                                                               // SNG-382: 26 authored source mixes, registered since SNG-172 and never fetched
    // ⛔ CCODE-233 (Aevi's §2 #4) — `foothills` WAS REGISTERED, WIRED INTO `craftSource`, AND NEVER LOADED.
    // The foothill branch reads `foothills?.foothills?.[tid]`, so with nothing loaded it was ALWAYS null:
    // the seven foothill traditions fell through and the harmonic 50/50-tie rule never ran in play. It ran
    // in tests only, because tests hand the data in directly — a reader with a live gate and a dead caller.
    // ⚠⚠ IN THIS WAVE, not the next one: SNG-300 lost `economy` exactly that way, destructured from a
    // Promise.all it was not added to, resolving to undefined and merging nothing.
    loadRule("foothills", null),
    fetchJSON("content/packs/valley/prologue.json").catch(() => null),                             // SNG-062 the Prologue → form on a miss
    // SNG-042 anchors + the tradition-epics roster (SNG-208 content: 62 epics, 2–3 per tradition, all 24).
    // Merged into ONE roster, deduped by id (the comprehensive epics win the 3 overlaps) so they plug into the
    // whole living-world stack — offscreen actions, arc-lean, rival clashes — automatically.
    Promise.all([
      fetchJSON("content/packs/valley/lore/legends.json").catch(() => ({ figures: [] })),
      fetchJSON("content/packs/valley/tradition_epics.json").catch(() => ({ epics: [] }))
    ]).then(([lf, ef]) => {
      const byId = {};
      for (const f of [...(lf.figures || []), ...(ef.epics || [])]) if (f?.id) byId[f.id] = f; // last wins → epics win on overlap
      return loadLegends({ ...lf, figures: Object.values(byId) });
    }).catch(() => ({ roster: [], beats: {}, tiers: {} })),
    loadRule("trait_readouts", { readouts: {} }),                                                 // SNG-215 §C: per-trait lore+mechanics (Aevi-authored; optional — derived fallback when absent)
    loadRule("tradition_visual_aesthetics", { traditions: {} }),                                   // SNG-223 Q4: per-tradition palette/materials/light/mood for the craft-image prompt (optional — bare tradition name when absent)
    loadRule("encounter_frame_content", { wardDenials: {}, challengePremises: {}, collapseEligibility: {} }), // SNG-230 §7b/§7c: the ward-denial + challenge-premise + collapse-eligibility LAYER (Aevi content; the frame reads it)
    loadRule("encounter_frame_kinds", { frameKinds: {} }),                                         // SNG-230: Aevi's per-kind framing copy (title/icon/win/exits/failStakes) + puzzle/standoff exemplars
    loadRule("encounter_receipt_line", { byKind: {}, degreeIcons: {} }),                            // SNG-246 Fix D: Aevi's per-kind PLAYER-FACING receipt-line format (degree · effect · meter · finish-proximity)
    // SNG-250 §4: THE CONSUMER MAP — the per-type born-whole contract (which sub-fields a real consumer
    // READS, with severity + the citing file:line). Promoted out of po/staged_content into the core rules
    // pack in CCODE-55 so ONE file drives both halves: the CI shape-sweep on AUTHORED content (content_ci)
    // and the birth gate on GENERATED content (generate.js). A staged file could only ever reach the
    // Node-side CI — the browser cannot fetch po/, so the generation half was structurally unreachable.
    loadRule("consumer_required_subfields", { contentTypes: {} }),
    // SNG-252 §2c: the per-family × per-kind move consequence-hints + the kind's emphasis ORDER (a standoff
    // leads with INFLUENCE/KNOW, a fight with HARM), and §2b's ribbon connective copy (subtitle, moves header,
    // freeform line, ward-disabled phrasing). Promoted out of po/staged_content with the build — staged content
    // the browser cannot fetch is content that does not exist (the SNG-247 promotion lesson).
    loadRule("encounter_move_hints", { byKind: {}, default: {} }),
    loadRule("encounter_ribbon_copy", {}),
    // SNG-251 §4: Aevi's grant-strength GUIDANCE — the voice layer over earnedpower.js's arithmetic. It tells
    // the GM what a reasonable grant READS like in each level/craft band, so grants are authored to FIT the
    // ceiling rather than authored big and then refused. Registered in the manifest but loaded by nothing until
    // now, which would have made it dead content (SNG-064): the numbers would clamp and the voice never arrive.
    loadRule("earned_power_guidance", { bands: {} }),
    // ⛔ R28 — THE AUTHORED GROUND. 18 of 135 places, authored since 2026-08-14 and read by nothing but
    // a test. A miss leaves the other 117 exactly as they are, which is the dominant case.
    fetchJSON("content/packs/core/world/local_layouts.json").catch(() => null)
  ]);
  // ⛔ R28 — ATTACHED, not merely fetched, and attached IN THIS WAVE. My first pass put this beside the
  // ladder rule 250 lines up, where `localLayoutsDoc` does not exist yet — the exact temporal-dead-zone
  // shape the comment above the wave warns about. ⚠️ A fetch with no attach is a download thrown away.
  if (localLayoutsDoc) rules.localLayouts = localLayoutsDoc;
  const genSchemas = {}; // SNG-BATCH-9 validation schemas that generate(type, context) authors against
  if (genNpc) genSchemas.npc = genNpc;
  if (genLoc) genSchemas.location = genLoc;
  if (genArc) genSchemas.arc = genArc;
  // SNG-250 §4 (CCODE-55): registering the schema is what OPENS the type — the app's generatable set is
  // derived from genSchemas, so no allow-list edit is needed (and none should be made).
  if (genCreature) genSchemas.creature = genCreature;
  const origins = originsDoc.origins || [];       // SNG-063: origins (27 peoples) via the manifest
  const backgrounds = backgroundsDoc.backgrounds || [];
  const regions = regionsDoc.regions || [];
  // SNG-089: the Accords — 7 crafts FREELY ACCESSED (still spend the point; ungated by origin/domain/
  // ring-penalty; the tuition is the JOURNEY to a waygate). Tag each signatory ability so the learn-gate
  // lets anyone take it. Folds after abilities (loaded above).
  if (accords) for (const sig of (accords.signatories || [])) { const ab = abilities[sig.opens]; if (ab) ab.accord = sig.tradition || true; }
  const helpText = {}; // SNG-084: id → {short, more}, indexed for O(1) lookup at the surface
  for (const e of (helpDoc.entries || [])) if (e.id) helpText[e.id] = e;
  // SNG-042: the world's great figures hydrate into npcs (so SNG-019 resolves them by name + the GM
  // reuses, never reinvents) — after npcs is loaded, and never overwriting a same-id registry NPC.
  const legends = legendsLoaded;
  for (const fig of legends.roster) if (fig.id && !npcs[fig.id]) npcs[fig.id] = fig;

  // BATCH-13 §A.6: resolve the geographic substrate field onto the in-memory locations. Density
  // stops being a flat table of regional averages and becomes a field with authored causes — the
  // lattice pooled where the Transition never took, withdrew where the Returned completed it.
  // Stamped onto `location.substrateDensity`, which is the branch `locationDensity` ALREADY reads
  // first, so nothing downstream changes. The authored files are untouched; an authored override
  // still wins. 26 sources were inert content until this line existed.
  try {
    const stamped = applySubstrateField(locations, substrateModel || {});
    if (stamped) console.log(`[substrate] field resolved onto ${stamped} location(s) from ${Object.values(locations).filter(l => l.substrateSource).length} authored source(s)`);
  } catch (e) { console.warn("[substrate] field resolution skipped:", e?.message); } // never block boot on it

  // SNG-187: a content-count canary at boot — cheap observability, and the proof that parallelising
  // the loaders did not silently drop or reorder any manifest group (the counts must not move).
  // SNG-247: and the FRAME-KIND EXEMPLARS — the standoffs and puzzles Aevi authored. `exemplarEncounters` has
  // been on this doc since SNG-230 and read by nothing: the line below took `frameKinds` and dropped the
  // encounters on the floor, so the sealed door and the toll-keeper were never once reachable in play. Merged
  // through the SAME point and pattern as the bestiary, so there is one way encounters reach the pool, not two.
  if (randomEncounters && frameKindsDoc?.exemplarEncounters?.length) {
    randomEncounters = { ...randomEncounters, encounters: [...(randomEncounters.encounters || []), ...frameExemplarEncounters(frameKindsDoc)] };
  }

  // SNG-302 — ⚠️ REPORTED HERE, WHERE `items` EXISTS. I first put this beside the economy merge, which runs
  // ~65 lines BEFORE `const items` is initialised — a temporal-dead-zone ReferenceError that took the whole
  // content load down at startup. `npm test` stayed GREEN: nothing in the suite exercises the real loader far
  // enough to hit it, which is worth knowing about the suite as much as about the bug.
  {
    const cov = economyCoverage(rules.economy, Object.values(items));
    if (rules.economy && !cov.secondAxisLive) console.log(`[economy] ${cov.withGoods}/${cov.items} items carry a goods category — ${cov.note}`);
  }
  console.log(`[loadContent] abilities=${Object.keys(abilities).length} items=${Object.keys(items).length} locations=${Object.keys(locations).length} npcs=${Object.keys(npcs).length} challengerPools=${Object.keys(challengerPools).length} events=${Object.keys(events).length} companions=${Object.keys(companions).length} encounters=${Object.keys(encounters).length} lore=${Object.keys(lore).length} quests=${quests.length} abilitiesWithAccord=${Object.values(abilities).filter(a => a.accord).length} legendsInNpcs=${legends.roster.filter(f => f.id && npcs[f.id]).length} bestiary=${bestiary.roster?.length || 0} beastEncounters=${(randomEncounters?.encounters || []).filter(e => /^beast_/.test(e.id)).length} traditionMotivations=${Object.keys(traditionMotivations?.traditions || {}).length} npcInteriority=${Object.keys(npcInteriority?.npcs || {}).length} traditionAesthetics=${Object.keys(traditionAestheticsDoc?.traditions || {}).length} wardDenials=${Object.keys(frameContentDoc?.wardDenials || {}).filter(k => k[0] !== "_").length} challengePremises=${Object.keys(frameContentDoc?.challengePremises || {}).filter(k => k[0] !== "_").length} frameKinds=${Object.keys(frameKindsDoc?.frameKinds || {}).length} frameExemplarEncounters=${(randomEncounters?.encounters || []).filter(e => e.fromFrameExemplar).length} consumerContractTypes=${Object.keys(consumerMapDoc?.contentTypes || {}).length}`);
  // SNG-345 — THE MARTIAL FLOOR JOINS THE CATALOG. martial_paths was authored 2026-07-07 with an
  // engineNote naming its own implementation ("4 free zero-cost abilities at creation, powerSystem
  // 'baseline'") and nothing read it, so every character reached play unable to defend itself without
  // spending build. ⚠️ DERIVED, NOT COPIED into an abilities pack: two hand-synced copies of one kit is
  // the SNG-344 crosswalk drift before it happens — those braid tables disagreed within ten minutes.
  // ⛔ AUTHORED CONTENT WINS: an id already in the pack is never overwritten by its projection.
  if (martialRule) {
    const derived = martialAbilityRecords(martialRule);
    let merged = 0;
    for (const [id, rec] of Object.entries(derived)) if (!abilities[id]) { abilities[id] = rec; merged++; }
    console.log(`[rules] martial: ${merged}/${Object.keys(derived).length} baseline+form abilities merged into the catalog`);
  }

  // ⛔ OI-9 / ERIK RULED 2026-08-31 (BACKLOG §OI-9): "wire `folkAccessible` to derive Valleyfolk starting
  // pool." ⚠️ THE BUG IT CLOSES: a Valleyfolk character was getting ZERO native grants. Their 13 anchors
  // sat inside `_folkNativeGrant_20260830` — an underscore DOC KEY with no real sibling — so
  // `nativeGrantIdsFor` never saw them, and `traditionNativeGrants["valleyfolk"]` does not exist.
  //
  // ⚠️ DERIVED AT LOAD, NEVER STORED. The pool IS "every craft carrying `folkAccessible`", so the flag
  // finally has a reader and the list cannot drift from it — which is the whole point of the ruling.
  // ⛔ 18 crafts carry the flag today; the hand-kept 13 are now a cross-check, not a source.
  rules.folkAccessibleIds = Object.values(abilities)
    .filter(a => a && a.folkAccessible)
    .sort((x, y) => (x.levelReq || 1) - (y.levelReq || 1) || String(x.id).localeCompare(String(y.id)))
    .map(a => a.id);
  // ⚠️ AND WHICH ORIGINS ARE FOLK IS ALSO DERIVED — from `nativeKind`, not from a hardcoded "valleyfolk".
  rules.folkOriginIds = origins.filter(o => o && o.nativeKind === "folk").map(o => o.id);
  console.log(`[rules] folk pool: ${rules.folkAccessibleIds.length} folkAccessible crafts for origin(s) ${rules.folkOriginIds.join(", ") || "(none)"}`);

  // ⛔ SNG-435 §C3 — A SILENT FALLBACK IS THE BUG. An ability whose tradition has no aesthetics entry
  // is rendered in the HOUSE palette — muted earth tones with teal and gold — and nothing says so. Erik hit
  // it as "a searing white-light beam in muted earth tones". Said out loud at load, like the titles report,
  // because the picture still draws and the only evidence otherwise is a player squinting at it.
  {
    // ⛔ SNG-435 §C3, CORRECTED BY AEVI: the uncovered ones were never peoples. `harmonic`,
    // `radiant_folk`, `precursor`, `valley_craft`, `cross_pole_braid` are POWER SYSTEMS wearing the
    // `tradition` field, and authoring five traditions for them would have invented five cultures the world
    // does not have. She authored them under `powerSystems` instead — physics, not culture — so the report
    // must count what `aestheticFor` actually resolves, or it goes on naming a gap that has been closed.
    const doc = traditionAestheticsDoc || {};
    const gap = new Map();
    for (const a of Object.values(abilities)) if (!aestheticFor(a, doc)) {
      const k = a?.tradition || a?.powerSystem || "(neither)";
      gap.set(k, (gap.get(k) || 0) + 1);
    }
    console.log(`[art] visual aesthetics: ${Object.keys(doc.traditions || {}).length} tradition(s) + ${Object.keys(doc.powerSystems || {}).length} power system(s)` +
      (gap.size ? ` — ${[...gap.values()].reduce((n, v) => n + v, 0)} abilit(ies) still fall back to the house palette: ${[...gap].sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} (${n})`).join(", ")}` : " — every ability covered"));
  }

  const content = { craftMechanics, damageFamilies, spectrums, rules, foothills: foothillsDoc, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks, abilities, items, locations, npcs, challengerPools, events, companions, encounters, randomEncounters, lore, region, substrate, greaterArcs, genSchemas, legends, traditions, traditionIndex, prologue, origins, backgrounds, quests, traditionArcs, npcQuests, regions, accords, helpText, substrateModel, powerSources: powerSourcesDoc || null, romanceGuidance, skillBattle, functionVocabulary, worldClock, schools, classArchetypes, repairPanelManifest, trait_readouts: traitReadoutsDoc?.readouts || traitReadoutsDoc || {}, traditionVisualAesthetics: traditionAestheticsDoc?.traditions || {}, visualAesthetics: traditionAestheticsDoc || {},   /* SNG-435 §C3: the WHOLE doc — `powerSystems` was flattened away at load */  bestiary, traditionMotivations, npcInteriority, encounterFrameContent: frameContentDoc || {}, frameKinds: frameKindsDoc?.frameKinds || {}, receiptLine: receiptLineDoc || {}, consumerContract: consumerMapDoc || { contentTypes: {} }, moveHints: moveHintsDoc || { byKind: {}, default: {} }, ribbonCopy: ribbonCopyDoc || {}, earnedPowerGuidance: earnedPowerDoc || { bands: {} }, startingLocation: valley.startingLocation };
  // SNG-022: bring every loaded record up to current (derive missing additive fields,
  // flag dangling cross-refs). In-memory only — Pages files are static.
  try { reconcileContent(content); } catch (err) { console.warn("[loadContent] reconcile skipped:", err.message); }
  return content;
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}
async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

// Envelope keys carry no world information — they are how the file is stored, not what it says.
const LORE_SKIP = new Set(["schemaVersion", "id", "kind"]);
const humanize = k => k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");

/** Render one JSON value as something a model reads as prose rather than as a data structure. */
function loreValue(v, depth = 0) {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (Array.isArray(v)) {
    return v.map(x => {
      const inner = loreValue(x, depth + 1);
      return inner.includes("\n") ? inner.split("\n").map((l, i) => (i ? "  " + l : "- " + l)).join("\n") : `- ${inner}`;
    }).join("\n");
  }
  const parts = Object.entries(v).filter(([k]) => !LORE_SKIP.has(k) && v[k] != null && v[k] !== "");
  // A shallow object reads better inline; a deep one wants its own lines.
  const flat = parts.every(([, val]) => typeof val !== "object" || val === null);
  if (flat && depth > 0) return parts.map(([k, val]) => `${humanize(k)}: ${val}`).join(" · ");
  return parts.map(([k, val]) => {
    const rendered = loreValue(val, depth + 1);
    return rendered.includes("\n") ? `${humanize(k).toUpperCase()}\n${rendered}` : `${humanize(k)}: ${rendered}`;
  }).join("\n");
}

/** JSON lore → prose for the prompt. Falls through to the raw text if it does not parse, because a
 *  lore file that reaches the model imperfectly is better than one that does not reach it at all. */
export function loreToProse(raw) {
  try { return loreValue(JSON.parse(raw)).trim(); } catch { return raw; }
}

/** The `reach_<region>` file for a location's region, if one exists. Exact match first, then a light
 *  normalisation — the corpus is ALMOST consistent: `reach_riven_marches`/`riven_marches` and
 *  `reach_unspooling`/`unspooling` line up exactly, and only `reach_somatic`/`somatic_reaches` does
 *  not. Two of three matching is why this is a lookup with one fallback rather than a mapping table
 *  nobody would maintain. Pure; returns {key, text} or {}. */
export function regionLoreFor(location, loreMap = {}) {
  const region = location?.regionId || location?.region;
  if (!region) return {};
  const tries = [
    `reach_${region}`,
    `reach_${region.replace(/^the_/, "")}`,
    `reach_${region.replace(/_reaches$/, "").replace(/^the_/, "")}`
  ];
  for (const key of tries) if (loreMap[key]) return { key, text: loreMap[key] };
  return {};
}

/** Assemble the lore text relevant to a location (only what this turn needs).
 *  BATCH-13: a ref that resolves to nothing is now RETURNED as a marker rather than dropped, so a
 *  broken reference is visible in the prompt and countable by CI instead of silently vanishing —
 *  the silence is what let 84 of 95 locations run lore-blind unnoticed. */
export function loreForLocation(location, loreMap, { markMissing = false } = {}) {
  const refs = location.loreRefs || [];
  const out = [];
  // SNG-167 §1c.1: REGION LORE IS AUTOMATIC, not opt-in. A location should not have to remember to
  // name its own Reach, and three region files were written and reachable by nothing because none
  // did. Pulled first — the wide frame before the local detail — and never duplicated when the
  // location happens to name it explicitly.
  const regionLore = regionLoreFor(location, loreMap);
  if (regionLore.key && !refs.includes(regionLore.key)) out.push(regionLore.text);
  for (const ref of refs) {
    if (loreMap[ref]) out.push(loreMap[ref]);
    else if (markMissing) out.push(`[lore "${ref}" is referenced here but no such file is loaded]`);
  }
  return out.join("\n\n");
}

/** SNG-229 §2c: WHY the traditions in play act — surfaced ONLY for the traditions present this beat, so
 *  the GM knows a people's want and, from the bestiary, the creature their craft DREADS (the fear the
 *  bestiary gives them). `traditionIds` is the caller-selected in-play set (the character's own domains +
 *  each scene NPC's primary craft) — the selection is what keeps this bounded instead of dumping all 24.
 *  `villainy` is the GM-eyes dark end (the cult-of-purity antagonist seed) — marked private, never stated
 *  to the player as fact. `bestiary` resolves a dread's creatureId to its name; `labelOf` names a tradition.
 *  Pure over the doc + who's present. Returns "" when nothing is in play or the doc is absent. */
export function traditionMotivationsForGM(doc, traditionIds, { bestiary = null, labelOf = null } = {}) {
  const map = doc?.traditions || null;
  if (!map) return "";
  const creatureName = id => (bestiary?.roster || []).find(c => c.id === id)?.name || String(id || "").replace(/_/g, " ");
  const seen = new Set(), lines = [];
  for (const tid of traditionIds || []) {
    if (!tid || seen.has(tid) || !map[tid]) continue;
    seen.add(tid);
    const m = map[tid];
    const label = (labelOf && labelOf(tid)) || tid;
    const parts = [`**${label}** wants: ${m.wants}`];
    if (m.dreads?.creature) parts.push(`DREADS ${creatureName(m.dreads.creature)} — ${m.dreads.why}`);
    if (m.villainy) parts.push(`(GM-eyes — its dark end, an antagonist seed, never stated to the player as fact: ${m.villainy})`);
    lines.push("- " + parts.join(" · "));
  }
  return lines.join("\n");
}

/** Which of a location's loreRefs resolve, and which do not. Pure — the CI gate reads this. */
export function loreRefStatus(location, loreMap) {
  const refs = location.loreRefs || [];
  return { resolved: refs.filter(r => !!loreMap[r]), missing: refs.filter(r => !loreMap[r]) };
}

/** Active-event summaries for the GM, including the GM-eyes-only truth. */
export function eventsForGM(region, eventMap) {
  return (region.activeEvents || []).map(({ eventId, stage }) => {
    const ev = eventMap[eventId];
    if (!ev) return null;
    const st = ev.stages?.find(s => s.stage === stage);
    return { eventId, stage, summaryForGM: `${ev.name} — stage ${stage} (${st?.name}): ${st?.summary} ${ev.truth || ""}` };
  }).filter(Boolean);
}

// ---------- character & profile persistence ----------

export function getPlayerKey() {
  let k = localStorage.getItem(LS.playerKey);
  if (!k) { k = "player-" + Math.random().toString(36).slice(2, 8); localStorage.setItem(LS.playerKey, k); }
  // SNG-045: if this device's key was retired into a canonical profile, follow the redirect
  const canon = resolvePlayerKey(k);
  if (canon !== k) { localStorage.setItem(LS.playerKey, canon); k = canon; }
  return k;
}
export function setPlayerKey(k) { localStorage.setItem(LS.playerKey, resolvePlayerKey(k.trim())); }

// ---------- SNG-045: player identity dedup (one person, one profile) ----------

/** Follow the retired-key → canonical redirect chain (cycle-guarded). A key with no redirect
 *  resolves to itself. */
export function resolvePlayerKey(key, guard = 0) {
  if (!key || guard > 20) return key;
  const to = localStorage.getItem(LS.redirect(key));
  return to && to !== key ? resolvePlayerKey(to, guard + 1) : key;
}

/** PURE: given the list of profiles, decide which same-displayName groups merge and which key
 *  is canonical. currentKey (if in a group) wins the canonical slot; else the profile with the
 *  most characters, tie-broken by playerKey (deterministic). Returns [{ name, canonicalKey,
 *  retiredKeys[] }] for groups of size >= 2 only. */
export function planPlayerDedup(profiles, currentKey = null) {
  const groups = {};
  for (const p of profiles) {
    const name = String(p.displayName || p.playerKey || "").trim().toLowerCase();
    if (!name) continue;
    (groups[name] = groups[name] || []).push(p);
  }
  const out = [];
  for (const [name, members] of Object.entries(groups)) {
    if (members.length < 2) continue;
    const score = (p) => (p.playerKey === currentKey ? 1e9 : 0) + (p.charactersPlayed?.length || 0);
    const sorted = [...members].sort((a, b) => score(b) - score(a) || String(a.playerKey).localeCompare(String(b.playerKey)));
    const canonical = sorted[0];
    out.push({ name, canonicalKey: canonical.playerKey, retiredKeys: sorted.slice(1).map(p => p.playerKey) });
  }
  return out;
}

/** Apply the dedup plan to localStorage: union charactersPlayed, reassign each retired profile's
 *  characters to the canonical key, keep a set rating over a default one, write a redirect for
 *  each retired key, delete the retired profile. Idempotent (a second run finds no duplicates).
 *  Repoints this device's key if it was retired. Returns a summary of what merged. */
export function dedupePlayers() {
  const profiles = listPlayerProfiles();
  const currentRaw = localStorage.getItem(LS.playerKey);
  const plan = planPlayerDedup(profiles, currentRaw);
  const merged = [];
  for (const g of plan) {
    const canonical = loadProfile(g.canonicalKey);
    if (!canonical) continue;
    canonical.charactersPlayed = canonical.charactersPlayed || [];
    for (const retiredKey of g.retiredKeys) {
      const dup = loadProfile(retiredKey);
      if (!dup) continue;
      // reassign the duplicate's characters to the canonical owner
      for (const id of (dup.charactersPlayed || [])) {
        const c = loadCharacter(id);
        if (c) { c.playerKey = g.canonicalKey; saveCharacter(c); }
        if (!canonical.charactersPlayed.includes(id)) canonical.charactersPlayed.push(id);
      }
      // also catch any device-local characters that name the retired key but weren't listed
      for (const entry of listCharacters()) {
        const c = loadCharacter(entry.id);
        if (c && c.playerKey === retiredKey) { c.playerKey = g.canonicalKey; saveCharacter(c); if (!canonical.charactersPlayed.includes(c.id)) canonical.charactersPlayed.push(c.id); }
      }
      // prefer a deliberately-set rating over a default one
      if (dup.rating && !dup.rating.isMinor && dup.rating.preset && dup.rating.setBy && (!canonical.rating || !canonical.rating.setBy)) canonical.rating = dup.rating;
      // a minor flag on either side is preserved (protective)
      if (dup.rating?.isMinor) { canonical.rating = canonical.rating || {}; canonical.rating.isMinor = true; }
      localStorage.setItem(LS.redirect(retiredKey), g.canonicalKey);
      localStorage.removeItem(LS.profile(retiredKey));
    }
    saveProfile(canonical);
    merged.push({ name: g.name, canonicalKey: g.canonicalKey, retired: g.retiredKeys });
  }
  // repoint this device if its raw key was retired
  if (currentRaw) { const canon = resolvePlayerKey(currentRaw); if (canon !== currentRaw) localStorage.setItem(LS.playerKey, canon); }
  return merged;
}

/** Full profile objects on this device (not just {playerKey,displayName}). */
export function listPlayerProfiles() { // registry:internal
 // registry:internal
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("singularity.profile.")) continue;
    try { const p = JSON.parse(localStorage.getItem(key)); if (p?.playerKey) out.push(p); } catch { /* skip */ }
  }
  return out;
}

/** SNG-045 Part B: find an existing profile by display name (case-insensitive) — so entering a
 *  name that already exists ATTACHES to that person instead of minting a new per-device key. */
export function findProfileByName(displayName) {
  const target = String(displayName || "").trim().toLowerCase();
  if (!target) return null;
  return listPlayerProfiles().find(p => String(p.displayName || "").trim().toLowerCase() === target) || null;
}

/** SNG-BATCH-7 Phase 1: has THIS device chosen a player yet? (non-creating). */
export function hasChosenPlayer() { return !!localStorage.getItem(LS.playerKey); }

/** All players known on this device — every stored profile. (Phase 2 syncs more down.) */
export function listPlayers() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("singularity.profile.")) continue;
    try {
      const p = JSON.parse(localStorage.getItem(key));
      if (p?.playerKey) out.push({ playerKey: p.playerKey, displayName: p.displayName || p.playerKey });
    } catch { /* skip corrupt */ }
  }
  return out;
}

export function listCharacters() {
  try { return JSON.parse(localStorage.getItem(LS.characterIndex) || "[]"); } catch { return []; }
}

export function saveCharacter(c, { stamp = true } = {}) {
  // SNG-BATCH-7 Phase 2: stamp last-write time + a monotonic rev so cross-device
  // load-latest can tell which copy is fresher. Adopting a remote copy passes
  // stamp:false to preserve the remote's own timestamps.
  if (stamp) { c.updatedAt = Date.now(); c.rev = (c.rev || 0) + 1; }
  const payload = JSON.stringify(c);
  try {
    localStorage.setItem(LS.character(c.id), payload);
  } catch (err) {
    // CCODE-02: the character save is the one write that MUST land. If storage is full, the
    // expendable tenants are the recovery snapshots — evict them all and retry before failing.
    console.warn("[save] character write failed, evicting recovery snapshots and retrying:", err?.name || err);
    for (const k of recoveryKeys()) { try { localStorage.removeItem(k); } catch { /* best-effort */ } }
    localStorage.setItem(LS.character(c.id), payload); // still throws if genuinely out of room — the caller must see that
  }
  const idx = listCharacters().filter(e => e.id !== c.id);
  idx.push({ id: c.id, name: c.name, level: c.level, origin: c.origin });
  localStorage.setItem(LS.characterIndex, JSON.stringify(idx));
}

/** SNG-139: delete a character from THIS device — remove its save blob + drop it from the local index.
 *  Local-only by design: a shared-world sync copy in the family repo is separate and is NOT touched here
 *  (deleting a character must never silently nuke shared canon). Destructive; callers confirm first. */
export function deleteCharacter(id) {
  localStorage.removeItem(LS.character(id));
  const idx = listCharacters().filter(e => e.id !== id);
  localStorage.setItem(LS.characterIndex, JSON.stringify(idx));
  return idx;
}

/** SNG-BATCH-7 Phase 2: write a version pulled from the sync repo to local storage,
 *  preserving its updatedAt/rev and marking THIS as the last synced point. */
export function adoptRemoteCharacter(remote) {
  remote.syncedAt = remote.updatedAt || 0;
  saveCharacter(remote, { stamp: false });
  return remote;
}

const RECOVERY_KEEP = 3; // newest N recovery snapshots per character; older ones are evicted

/** Every recovery key on this device, oldest first. Keys embed `updatedAt`, but they are sorted
 *  NUMERICALLY on that stamp rather than lexically — a lexical sort ranks "10" before "2" and
 *  would evict the newest snapshot instead of the oldest the moment stamp widths differ. */
export function recoveryKeys(characterId = null) {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("singularity.recovery.")) continue;
    if (characterId && !k.startsWith(`singularity.recovery.${characterId}.`)) continue;
    out.push(k);
  }
  const stampOf = (k) => {
    const m = k.match(/^singularity\.recovery\.(.+?)\.(\d+)(?:\..*)?$/);
    return m ? Number(m[2]) : 0;
  };
  return out.sort((a, b) => stampOf(a) - stampOf(b) || a.localeCompare(b));
}

/** Drop all but the newest `keep` snapshots for a character. Returns the keys removed. */
/** Read one recovery snapshot back. ⛔ The sync wrote these for every conflict and nothing ever read one. */
export function loadRecovery(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function pruneRecovery(characterId, keep = RECOVERY_KEEP) { // registry:internal
  const keys = recoveryKeys(characterId);
  const drop = keys.slice(0, Math.max(0, keys.length - keep));
  for (const k of drop) { try { localStorage.removeItem(k); } catch { /* eviction is best-effort */ } }
  return drop;
}

/** Preserve a losing copy under a recovery key so a both-advanced conflict never
 *  destroys work. Returns the recovery key, or null if it could not be written.
 *
 *  CCODE-02: this is a SAFETY NET, and a safety net must never be the thing that breaks the
 *  app. It previously wrote a full character copy under a NEW key every time (keyed by
 *  `updatedAt`) and never pruned — so snapshots accumulated until localStorage's ~5MB quota
 *  was gone, and the raw `setItem` threw QuotaExceededError straight through the character
 *  load path and HUNG it. Now: prune first, write inside a guard, and on a quota failure
 *  evict harder and retry once before giving up quietly. Losing a snapshot is survivable;
 *  losing the ability to load your character is not. */
export function preserveRecovery(c, tag = "") {
  const key = `singularity.recovery.${c.id}.${c.updatedAt || 0}${tag ? "." + tag : ""}`;
  const payload = JSON.stringify(c);
  pruneRecovery(c.id, RECOVERY_KEEP - 1); // make room for the one we're about to write
  try {
    localStorage.setItem(key, payload);
    return key;
  } catch (err) {
    console.warn("[recovery] snapshot write failed, evicting older copies and retrying:", err?.name || err);
    pruneRecovery(c.id, 0);                                  // this character's older copies
    for (const k of recoveryKeys()) { try { localStorage.removeItem(k); } catch { /* best-effort */ } } // then every character's
    try {
      localStorage.setItem(key, payload);
      return key;
    } catch (err2) {
      console.warn("[recovery] snapshot skipped — storage full. Play continues; the remote copy is authoritative.", err2?.name || err2);
      return null;
    }
  }
}

export function loadCharacter(id) {
  try { return JSON.parse(localStorage.getItem(LS.character(id))); } catch { return null; }
}

export function saveProfile(p) { localStorage.setItem(LS.profile(p.playerKey), JSON.stringify(p)); }
export function loadProfile(playerKey) {
  try { return JSON.parse(localStorage.getItem(LS.profile(playerKey))); } catch { return null; }
}

/** Export/import for moving saves between machines until GitHub sync is configured. */
export function exportSave(characterId, playerKey) {
  return JSON.stringify({ character: loadCharacter(characterId), profile: loadProfile(playerKey) }, null, 2);
}
export function importSave(json) {
  const data = JSON.parse(json);
  if (data.character) saveCharacter(data.character);
  if (data.profile) saveProfile(data.profile);
  return data;
}
