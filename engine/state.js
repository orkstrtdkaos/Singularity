// state.js — content loading and save/load.
// v0.1: saves live in localStorage (instant, offline-safe); optional GitHub sync
// via sync.js pushes character + player profile to the shared repo when a PAT is
// configured. Content packs always load from the served repo files.

import { reconcileContent } from "./reconcile.js";
import { applySubstrateField } from "./substrate.js";
import { loadLegends } from "./legends.js";
import { buildTraditionIndex } from "./traditions.js";
import { bestiaryEncounters } from "./random_encounters.js"; // SNG-229 §2b: synthesize monster encounters from the loaded bestiary

const LS = {
  character: id => `singularity.character.${id}`,
  characterIndex: "singularity.characters",
  profile: key => `singularity.profile.${key}`,
  playerKey: "singularity.playerKey",
  redirect: key => `singularity.profileRedirect.${key}` // SNG-045: retired dup key → canonical
};

// ---------- content packs ----------

/** SNG-056: resolve a GM `moveTo` reference (an id or a place name) to a real loaded location id,
 *  or null if it names nowhere that exists. Exact id → slugified id → exact name → loose name. Pure. */
export function resolveLocationId(ref, locations = {}) {
  if (!ref) return null;
  const raw = String(ref).trim();
  if (locations[raw]) return raw;
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  if (locations[slug]) return slug;
  const lc = raw.toLowerCase();
  for (const [k, l] of Object.entries(locations)) if ((l.name || "").toLowerCase() === lc) return k;
  // SNG-221: a canonical location may declare `aliases` (other names it answers to — e.g. the name a
  // gen-stub carried before its canonical file was authored: "Stillwater's Trouble" / "Raven's Home").
  // An EXACT alias match (raw or slugged) resolves to it, before the looser substring pass below — so
  // traveling to a superseded gen-location's name lands on the real place (Q3), not a fresh mint.
  for (const [k, l] of Object.entries(locations)) if ((l.aliases || []).some(a => String(a).toLowerCase() === lc)) return k;
  for (const [k, l] of Object.entries(locations)) if ((l.aliases || []).some(a => String(a).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") === slug)) return k;
  for (const [k, l] of Object.entries(locations)) { const n = (l.name || "").toLowerCase(); if (n && (n.includes(lc) || lc.includes(n))) return k; }
  return null;
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
  const rulePath = name => { const p = (index.provides.rules || []).find(r => r.includes(name)); return p ? `content/packs/core/${p}` : null; };
  const resPath = rulePath("resolution");
  if (!resPath) throw new Error("manifest: core provides.rules is missing resolution.json (the base rules)");
  // Every optional core rule loads the same way: found by name in the manifest, fetched, fallback on
  // a miss. No inline .find(), no hardcoded path, no positional index.
  const loadRule = async (name, fallback) => { const p = rulePath(name); if (!p) return fallback; try { return await fetchJSON(p); } catch { return fallback; } };
  // SNG-187: the base rules and every optional core rule are independent fetches (loadRule tolerates
  // its own misses; only the base `rules` is fatal, as before). Load them as ONE wave instead of ~12
  // serial round-trips. rankProgression comments retained on the consumers below.
  const [rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks,
         romanceGuidance, functionVocabulary, nativeGrants, skillBattle, traditionsRaw, worldClock, schools, classArchetypes, repairPanelManifest] = await Promise.all([
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
    loadRule("repair_panel_manifest", null)                             // SNG-207 §6.2: the authoritative Repair-panel capability list, for the GM's context (no hallucinated controls)
  ]);
  // SNG-101b: the native-grant table merges INTO the rules bag so nativeGrantIdsFor reads it directly.
  rules.traditionNativeGrants = nativeGrants.traditionNativeGrants || {};
  rules.grantCap = nativeGrants.grantCap ?? 5;
  // SNG-055/059: traditions optional — absence leaves the domain gates ungoverned (open), never breaks load.
  let traditions = traditionsRaw, traditionIndex = null;
  if (traditions) { try { traditionIndex = buildTraditionIndex(traditions); } catch { traditions = null; } }

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
  const encountersP = jAll((valley.provides.encounters || []).map(valleyPath));
  const loreP = Promise.all(loreProvides.map(p => fetchText(valleyPath(p))));
  const questsP = jSettled((valley.provides.quests || []).map(valleyPath));
  // SNG-203: the quest hierarchy's new tiers — tradition arcs (tier 2, keyed by traditionId) + npc quests
  // (tier 6, the errand tier). Independent, tolerant fetches like everything else; a miss disables the tier.
  const traditionArcsP = jSettled((valley.provides.tradition_arcs || []).map(valleyPath));
  const npcQuestsP = jSettled((valley.provides.npc_quests || []).map(valleyPath));
  const bestiaryP = jSettled((valley.provides.bestiary || []).map(valleyPath)); // SNG-229 §2a

  // ability-arch v2: tolerant defaults so the engine can read the new fields before the content
  // classification pass tags every ability. rankProgression defaults to "use" (depth is earned, not
  // bought); nativeOrCombination stays null until authored (consumers treat null as unclassified).
  const abilities = {};
  for (const pack of await abilitiesP) for (const a of pack.abilities) abilities[a.id] = {
    ...a, powerSystem: pack.powerSystem,
    rankProgression: a.rankProgression || "use",
    nativeOrCombination: a.nativeOrCombination || null,
    combinationAxis: a.combinationAxis ?? null,
    rankThresholds: a.rankThresholds || { rank1: "given", rank2: "practiced_use", rank3: "defining_moment" }
  };

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
  const [region, substrate, greaterArcs, genNpc, genLoc, genArc, originsDoc, backgroundsDoc, regionsDoc,
         accords, helpDoc, substrateModel, prologue, legendsLoaded, traitReadoutsDoc] = await Promise.all([
    fetchJSON("world/regions/valley.json"),
    fetchJSON("content/packs/valley/lore/generative_substrate.json").catch(() => null),           // generation off on a miss
    fetchJSON("content/packs/valley/lore/greater_arcs.json").then(x => x.arcs || []).catch(() => []), // no arc few-shot
    fetchJSON("schemas/npc.schema.json").catch(() => null),
    fetchJSON("schemas/location.schema.json").catch(() => null),
    fetchJSON("schemas/arc.schema.json").catch(() => null),
    loadRule("origins", {}),
    loadRule("backgrounds", {}),
    loadRule("regions", {}),                                                                       // SNG-082 authored terrain
    loadRule("the_accords", null),                                                                 // SNG-089 the Accords
    loadRule("helper_text", { entries: [] }),                                                      // SNG-084 in-context help
    loadRule("the_substrate", null),                                                               // SNG-090 the substrate model
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
    loadRule("trait_readouts", { readouts: {} })                                                  // SNG-215 §C: per-trait lore+mechanics (Aevi-authored; optional — derived fallback when absent)
  ]);
  const genSchemas = {}; // SNG-BATCH-9 validation schemas that generate(type, context) authors against
  if (genNpc) genSchemas.npc = genNpc;
  if (genLoc) genSchemas.location = genLoc;
  if (genArc) genSchemas.arc = genArc;
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
  console.log(`[loadContent] abilities=${Object.keys(abilities).length} items=${Object.keys(items).length} locations=${Object.keys(locations).length} npcs=${Object.keys(npcs).length} challengerPools=${Object.keys(challengerPools).length} events=${Object.keys(events).length} companions=${Object.keys(companions).length} encounters=${Object.keys(encounters).length} lore=${Object.keys(lore).length} quests=${quests.length} abilitiesWithAccord=${Object.values(abilities).filter(a => a.accord).length} legendsInNpcs=${legends.roster.filter(f => f.id && npcs[f.id]).length} bestiary=${bestiary.roster?.length || 0} beastEncounters=${(randomEncounters?.encounters || []).filter(e => /^beast_/.test(e.id)).length}`);
  const content = { spectrums, rules, emergence, attributeGates, skillCapacity, locationAffinities, intensity, branchForks, abilities, items, locations, npcs, challengerPools, events, companions, encounters, randomEncounters, lore, region, substrate, greaterArcs, genSchemas, legends, traditions, traditionIndex, prologue, origins, backgrounds, quests, traditionArcs, npcQuests, regions, accords, helpText, substrateModel, romanceGuidance, skillBattle, functionVocabulary, worldClock, schools, classArchetypes, repairPanelManifest, trait_readouts: traitReadoutsDoc?.readouts || traitReadoutsDoc || {}, bestiary, startingLocation: valley.startingLocation };
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
