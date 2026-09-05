// substrate.js — SNG-090. The SECOND difficulty map. Pure, no I/O, fully testable.
//
// All craft in this world is nanite-mediated. The lattice varies in DENSITY by place, and each
// tradition is TUNED to a BAND of density (center ± width) — Amendment 1 (Erik, via CCode's Round 2):
// it is a BAND, not a fuel gauge. You can have too much.
//   • INSIDE the band  → full output.
//   • BELOW the band   → STARVATION, steep: a Continuous craft in thin ground is nearly OFF
//                        (a Seraph in the Quickwood ≈ 13%).
//   • ABOVE the band   → INTERFERENCE, mild: a Returned craft in dense ground is impaired, never off
//                        (a Rootkin in the Gearlands floors ~60–75%). "Equivalent, not equal."
//   • CARRIED charge adds to local density — it rescues the STARVED and WORSENS the CROWDED
//                        (why the Rootkin find the Waystaff trade ridiculous).
//
// ⛔ Substrate is a SEPARATE resolve term from spectral fit (SNG-079). Never fold them — a place can
//    suit you dispositionally and still starve your craft.
// ⛔ Ability actions ONLY. A weapon swing is substrate-free (SNG-089's narrative baseline).
//
// The curves are TUNABLE CONSTANTS, validated against the design anchors by tests/balance_sim.mjs.
// Do NOT eyeball them — re-run the sim after any change (CCode's Round-2 blocker, accepted).

import { geodesic } from "./worldmap.js";   // SNG-180: the substrate field measures direct geodesic distance

export const SUBSTRATE_TUNING = {
  starveExp: 1.15,      // below-band falloff steepness (Seraph@Quickwood → ≈13%)
  starveFloor: 0.0,     // a starved craft can reach ~0
  // ⛔ ERIK'S RULING (7e15eb9f, 2026-08-09): BOTH of SNG-389's options — crowdSlope raised AND wild
  // narrowed. The measurement that moved it: at 0.75 the crowded tail could never reach the floor
  // (wild bottomed at 0.74 with the floor at 0.6), so "make abundance hurt" was arithmetic that
  // could not fire. At 1.6, wild's worst crowded factor is 0.46 — abundance genuinely costs.
  crowdSlope: 1.6,      // above-band falloff rate — RULED, was 0.75
  crowdFloor: 0.6,      // interference never drops a craft below this
  maxChancePenalty: 65, // factor 0 → −65 to success chance (drives to the d100 floor)
  energyK: 0.6,         // thin/crowded substrate strains: energy × (1 + energyK·(1−factor))
  gateBelow: 0.18,      // factor under this → the craft is effectively OFF (a hard, explained gate)
  materialFloor: 0.7,   // SNG-193b §4: a material root/extension is never STARVED — the augmented craft
                        //   degrades TOWARD its pure form (this floor), never to zero. Sits with crowdFloor.
};

// SNG-193b: a source's characteristic band — what a craft LEANS ON decides its best-ground, not the
// tradition it roots in. A tradition is a ROOT; a school is what it reaches WITH, and the reach sets the
// band. material leans on nothing (a flat floor — never starved, no band); inherent/natural want THIN
// ground (a dense lattice is interference, apparatus between them and the thing); lattice wants DENSE
// (the machine running); wild thrives in the ungoverned gaps (widest band). Centres track SNG-172's
// source classification and are AUDITED against the per-tradition bands, never fight them (existing
// saves without a school keep the tradition's authored band — see schoolForTradition's fallback).
// ⛔ SNG-380 — THIS TABLE MOVED INTO CONTENT, and the move IS the fix. It lived here as a literal
// keyed on the pre-SNG-378 vocabulary (material/natural/inherent/lattice/wild). When Aevi rebased every
// school onto the ratified source list the keys stopped matching, and because `bandForSchool` falls back
// to the tradition band for an unmodelled source — a correct safety net for ONE source — the whole
// vocabulary going missing at once became a silent no-op: 44 of 48 augmented schools inert, the §4 floor
// matching 0 of 74, no error, no red gate, every line still rendering.
//
// ⚠️ THE VOCABULARY LIVES IN CONTENT, SO ITS TABLE MUST TOO. It is now
// `the_substrate.json → sourceBands.sources`, and a join gate asserts every extension in schools.json has
// a key there — SHAPE, never values. A future rebase breaks loudly instead of routing through a fallback.
//
// ⚠️ AND `band: null` IS NO LONGER OVERLOADED. The old `material: null` meant BOTH "no best-ground"
// and "never starved", so the §4 protection was a side effect of an absent value rather than a stated
// one — which is exactly how it vanished in a rename. `floor` is now its own boolean: `body` has no band
// AND keeps the floor; `nanite` has no band and does NOT.
const sourceEntry = (source, substrateData) => {
  if (source === null || source === undefined) return null;
  return substrateData?.sourceBands?.sources?.[source] || null;
};

/** Does reaching with this source carry the §4 never-starved floor? Read from content, never inferred
 *  from a null band — that inference is what lost the mechanic in the first place. */
export function sourceHasFloor(source, substrateData) {
  return sourceEntry(source, substrateData)?.floor === true;
}

/** The authored line describing the ground a source favours — the GM-facing half. */
export function sourceGround(source, substrateData) {
  return sourceEntry(source, substrateData)?.ground || null;
}

/** A tradition's band {center, width}, or null for the untuned (folk/learned) — substrate-neutral. */
export function bandFor(tradition, data) {
 // registry:internal
  const b = data?.substrateBand?.[tradition];
  return b && b.center != null ? { center: b.center, width: b.width ?? 0.18 } : null;
}

/** SNG-193b Q3: the character's SCHOOL for a tradition — or the tradition's PURE/root school as a SILENT
 *  fallback (every save that predates schools has no `character.schools`, and must keep working). Returns
 *  the school object {id, name, extension, why} or null when schools.json / the tradition isn't loaded.
 *  `schoolsData` is `CONTENT.schools` (schools.json) — the content→engine edge the band resolution reads.
 *  The pure school (extension null) is preferred as the fallback so an un-schooled character leans on
 *  nothing new — their band stays the tradition's authored one (zero regression). */
export function schoolForTradition(character, traditionId, schoolsData) { // registry:internal
  const trad = schoolsData?.traditionSchools?.[traditionId];
  if (!trad) return null;
  const list = trad.schools || [];
  const chosen = character?.schools?.[traditionId];
  if (chosen) { const s = list.find(x => x.id === chosen); if (s) return s; }
  return list.find(x => x.extension === null) || list.find(x => x.extension === trad.root) || list[0] || null;
}

/** SNG-193b Section 3.3 — the LOAD-BEARING seam. The band a craft resolves at reads the SCHOOL, not the
 *  tradition: the EXTENSION source sets it. Two practitioners of one tradition with different schools get
 *  OPPOSITE best-grounds (the reaching mind wants thin ground; the instrumented wants dense). A PURE
 *  school (extension null) leans on nothing new, so it keeps the tradition's own authored band — which is
 *  also the un-schooled fallback, so no existing save shifts. An unmodelled extension source likewise
 *  falls back to the tradition band rather than going neutral. */
export function bandForSchool(traditionId, school, substrateData) { // registry:internal
  const ext = school ? school.extension : undefined;
  const entry = sourceEntry(ext, substrateData);
  // ⚠️ AN AUTHORED SOURCE WITH `band: null` IS AN ANSWER, NOT AN ABSENCE. `body` and `nanite` say
  // "no best-ground" deliberately, and returning null here is that answer — distinct from falling through
  // to the tradition band, which means "we do not model this source" and is now a gated condition.
  if (entry) return entry.band || null;
  return bandFor(traditionId, substrateData); // pure school, no school, or a source the table does not model
}

/** SNG-192 §6b: the density window where a WHOLE build works — the INTERSECTION of its traditions'
 *  substrate bands. Coherent sources overlap into a shared window; Erik's warning case — a natural primary
 *  plus one lattice craft — has NONE: wherever you stand, one half is starved, and the engine can say so
 *  exactly at the moment of the pick. Untuned (folk/learned) traditions are substrate-neutral and never
 *  constrain the window. Pure. `data` = the_substrate.json. Returns { window: [lo,hi]|null, per, empty }. */
export function commonGroundFor(traditions, data) { // registry:internal
  const bands = [...new Set((traditions || []).filter(Boolean))].map(t => ({ tradition: t, band: bandFor(t, data) })).filter(x => x.band);
  if (!bands.length) return { window: null, per: [], empty: false, untuned: true };
  let lo = 0, hi = 1;
  for (const { band } of bands) { lo = Math.max(lo, band.center - band.width); hi = Math.min(hi, band.center + band.width); }
  const empty = lo > hi;
  return {
    window: empty ? null : [Math.max(0, lo), Math.min(1, hi)],
    per: bands.map(b => ({ tradition: b.tradition, lo: Math.max(0, b.band.center - b.band.width), hi: Math.min(1, b.band.center + b.band.width) })),
    empty, untuned: false
  };
}

/** SNG-192 §6b: name a density window as a KIND OF COUNTRY, not a number — where a build BELONGS, which is
 *  worth more to a player than any stat. Null window (no common ground) has no place; that is the warning. */
export function groundAsPlace(window) { // registry:internal
  if (!window) return null;
  const mid = (window[0] + window[1]) / 2;
  return mid < 0.34 ? "thin country — the wild, unreached lands where the lattice runs faint"
    : mid > 0.66 ? "dense country — the machine-thick cities and the deep Precursor sites"
    : "the middle country — settled valleys and open roads, neither wild nor machine-thick";
}

/** SNG-193b Section 3.2: the school map a fresh character starts with — each practised domain defaults to
 *  its tradition's PURE/root school (the orthodoxy for material peoples, the never-starved safe start for
 *  the rest). A story-earned adoptSchool op, or a later creation pick, moves a domain to an augmented
 *  school and shifts that craft's best-ground. Returns {} when schools aren't loaded — the band seam then
 *  falls back on its own, so an un-schooled save is identical either way. */
export function defaultSchoolsForDomains(domains, schoolsData) { // registry:internal
  const out = {};
  if (!domains || !schoolsData?.traditionSchools) return out;
  for (const tid of [domains.primary, domains.secondary, domains.tertiary]) {
    if (!tid || out[tid]) continue;
    const s = schoolForTradition(null, tid, schoolsData);
    if (s) out[tid] = s.id;
  }
  return out;
}

/** SNG-193b Section 3.2 — the ONE validated write-seam for a character's school (a creation pick, or a
 *  teacher of that people once the fiction earns it). Sets character.schools[traditionId] only when the
 *  school genuinely belongs to that tradition; a bad id is REFUSED (returns false) rather than silently
 *  corrupting the map into a dead reference the band seam would then fall back through. */
export function setCharacterSchool(character, traditionId, schoolId, schoolsData) { // registry:internal
  const list = schoolsData?.traditionSchools?.[traditionId]?.schools || [];
  if (!character || !list.some(s => s.id === schoolId)) return false;
  character.schools = character.schools || {};
  character.schools[traditionId] = schoolId;
  return true;
}

/** SNG-193b Section 3.6: the GM-facing note on the character's schools — one line per practised domain,
 *  naming the CURRENT school, what it reaches WITH, and its best-ground, so the GM describes the craft as
 *  THIS school does it (not generically by tradition) and knows what a teacher of that people would open.
 *  Lists the tradition's other school ids so a story-earned adoptSchool has valid targets. null when
 *  nothing is loaded or practised. */
/** ⚠️ SNG-380 ADDED `substrateData`, and the edit that added it had to reach the CALLER too. The
 *  ground line now comes from the authored table, and this function had never been handed it — writing
 *  the read without threading the argument would have been a ReferenceError in the GM context builder,
 *  which is the one place a throw costs the player their whole turn. Optional, so a caller without the
 *  table degrades to the pure-school line rather than breaking. */
export function schoolsDetailForGM(character, schoolsData, substrateData = null) { // registry:internal
  const domains = character?.domains;
  if (!domains || !schoolsData?.traditionSchools) return null;
  // ⚠️ THE GROUND LINE IS AUTHORED TOO. This was a hard-coded chain on the retired vocabulary, so
  // 44 of 74 schools degraded to the string "its own ground" — a sentence that tells the narrator nothing
  // while looking like an answer. A pure school (no extension) leans on nothing new and says so.
  const ground = ext => (ext === null || ext === undefined)
    ? "leaning on nothing new — the tradition's own ground"
    : (sourceGround(ext, substrateData) || "its own ground");
  const lines = [];
  for (const tid of [domains.primary, domains.secondary, domains.tertiary]) {
    if (!tid) continue;
    const trad = schoolsData.traditionSchools[tid];
    const cur = schoolForTradition(character, tid, schoolsData);
    if (!trad || !cur) continue;
    const others = (trad.schools || []).filter(s => s.id !== cur.id).map(s => s.id);
    lines.push(`- ${tid}: **${cur.name}** [${cur.id}${cur.extension ? " · joined to " + cur.extension : " · pure"}] — ${ground(cur.extension)}.${others.length ? ` Other schools of this people: ${others.join(", ")}.` : ""}`);
  }
  return lines.length ? lines.join("\n") : null;
}

/** A place's effective density for a wielder carrying `carried` charge, clamped to [0,1]. */
export function effectiveDensity(density, carried = 0) {
 // registry:internal
  return Math.max(0, Math.min(1, (Number(density) || 0) + (Number(carried) || 0)));
}

/** The output factor [0,1] for a craft of `band` at effective density `eff`. Two-sided: full inside
 *  the band, steep starvation below, mild floored interference above. */
export function bandFactor(band, eff, t = SUBSTRATE_TUNING) {
 // registry:internal
  if (!band) return 1; // untuned tradition — substrate-neutral
  const lo = band.center - band.width, hi = band.center + band.width;
  if (eff >= lo && eff <= hi) return 1;
  if (eff < lo) {
    const x = lo <= 0 ? 1 : Math.max(0, eff / lo); // 1 at the band edge → 0 at true nature
    return Math.max(t.starveFloor, Math.min(1, Math.pow(x, t.starveExp)));
  }
  return Math.max(t.crowdFloor, 1 - t.crowdSlope * (eff - hi)); // interference — mild, floored
}

/** The full substrate verdict for a craft at a place. `data` = the_substrate.json. Pure.
 *  SNG-193b: pass the character's `school` (from schoolForTradition) and the tradition's `root` and the
 *  band reads the SCHOOL's extension source, floored by a material root. Omit both and it is the legacy
 *  per-tradition verdict — every un-schooled save resolves exactly as before. */
export function substrateVerdict({ tradition, school = null, root = null, density, carried = 0, data, tuning = SUBSTRATE_TUNING }) {
  // §3.3: the school's extension source sets the band; absent a school, the tradition's own band.
  const band = school ? bandForSchool(tradition, school, data) : bandFor(tradition, data);
  const eff = effectiveDensity(density, carried);
  let factor = bandFactor(band, eff, tuning);
  let side = !band ? "neutral"
    : eff < band.center - band.width ? "starved"
    : eff > band.center + band.width ? "crowded" : "full";
  // §4: the FLOOR is the root's. A material ROOT — or a material-EXTENSION school — is never STARVED: the
  // augmented craft degrades TOWARD its pure form (materialFloor), never to zero. The floor bites only on
  // the starved side; interference from ABUNDANCE still applies. "The material school is the one that travels."
  // ⛔ THE FLOOR IS READ, NOT INFERRED. This was `root === "material" || school?.extension === "material"`
  // and matched 0 of 74 schools the moment `material` became `body` — a mechanical protection that
  // vanished in a rename with nothing to report it.
  const hasFloor = sourceHasFloor(root, data) || sourceHasFloor(school?.extension, data);
  if (hasFloor && side === "starved" && factor < tuning.materialFloor) { factor = tuning.materialFloor; side = "floored"; }
  return {
    factor,
    side,
    percent: Math.round(factor * 100),
    chancePenalty: Math.round((1 - factor) * tuning.maxChancePenalty),
    energyMult: 1 + tuning.energyK * (1 - factor),
    off: factor < tuning.gateBelow, // the lattice is too thin (or too loud) for this craft to work
  };
}

/** SNG-090: the charge a character CARRIES — summed from inventory items with a `substrateCharge`
 *  (the Waystaff, charged reservoirs) plus any companion `substrateAura` (Aevi, a living mote-swarm).
 *  Adds to local density: rescues the starved, worsens the crowded. 0 until such content is authored.
 *  `itemCatalog` maps id→def for items stored as ids; inline item objects carry the field directly. */
// BATCH-13: NEGATIVES NOW COUNT. This guarded `c > 0` and floored at `Math.max(0, …)`, so a
// suppressor — an Ent-embassy ward, a dampening focus — was discarded twice over and could not
// exist. Two are now authored (Stillhold veil −0.10, truce token −0.05) plus Sprig's −0.08 aura.
// A suppressor is a legitimate weapon: carried into the Gearlands it shelters a Rootkin and
// cripples an Enginewright, and that falls out of the band model rather than being bolted on.
// The result is clamped to ±1 — it is a shift applied to density, not a density itself.
export function carriedSubstrate(character, itemCatalog = {}, companions = []) {
  let carried = 0;
  for (const entry of (character?.inventory || [])) {
    const def = (entry && typeof entry === "object") ? entry : (itemCatalog[entry] || null);
    const c = Number(def?.substrateCharge);
    if (Number.isFinite(c)) carried += c;
  }
  for (const comp of (companions || [])) {
    const a = Number(comp?.substrateAura);
    if (Number.isFinite(a)) carried += a;
  }
  return Math.max(-1, Math.min(1, carried));
}

/** What the player is CARRYING that moves the ground, itemised — so a receipt can name the cause.
 *  §9b invariant 5: when a carried source is why the lattice reads differently, saying so is the
 *  difference between a mechanic and "the cruellest possible bug". Returns strongest first. */
export function carriedSubstrateSources(character, itemCatalog = {}, companions = []) {
  const out = [];
  for (const entry of (character?.inventory || [])) {
    const def = (entry && typeof entry === "object") ? entry : (itemCatalog[entry] || null);
    const c = Number(def?.substrateCharge);
    if (Number.isFinite(c) && c !== 0) out.push({ name: def?.customName || def?.name || String(entry), delta: c, kind: "item" });
  }
  for (const comp of (companions || [])) {
    const a = Number(comp?.substrateAura);
    if (Number.isFinite(a) && a !== 0) out.push({ name: comp?.name || comp?.id, delta: a, kind: "companion" });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

/** The effective substrate density at a location: a per-location override, else its region's density.
 *  Returns null when neither resolves (the CI flags that). Pure over the loaded content. */
export function locationDensity(location, data) {
  if (!location || !data) return null;
  if (typeof location.substrateDensity === "number") return location.substrateDensity;
  const region = location.regionId || location.region;
  const d = data.substrateDensity?.[region];
  return typeof d === "number" ? d : null;
}

// ---------- BATCH-13: THE GEOGRAPHIC FIELD ----------
// Density is not a table of regional averages — it is a field with causes. The lattice POOLED where
// the Transition never took and WITHDREW where the Returned completed it, and 26 sites carry an
// authored ±delta saying so.
//
// DISTANCE IS THE GEODESIC ON THE SPHERE (SNG-180), and it is DIRECT — not shortest-path over the
// travel graph. That distinction is the correction to my first two attempts, and the PO's reply
// settled it: the lattice pooled and withdrew in SPACE, and its influence radiates through space,
// not along roads. Travel distance (walkingDays) is path-over-connections because walking follows
// roads; the substrate FIELD is direct geodesic because the lattice does not care whether there is a
// path. My path-over-connections instinct was right for travel and wrong for the field. Verified:
// direct geodesic reproduces the PO's published drift (0.0515) to the digit; path-over-connections
// does not.
//
// NO CALIBRATION STEP. §9b invariant 2 asks regional means to stay NEAR their authored values AS A
// CONSEQUENCE of the field, never by a correction applied to make them match — the PO's corrected
// wording after I read "the authored table is the target" as "hit the target" and renormalised. That
// forcing broke invariant 1 at the tight `radiusWorld` scale: making every local lift pay itself back
// within the region pushes a source onto the wrong side of its own baseline. Over-satisfying
// invariant 2 ate invariant 1. The ~0.05 residual drift is emergent and healthy. `pools rise / sinks
// fall` is now STRUCTURAL — a source keeps its own signed delta and nothing can flip it.

/** ✅ R38a (Erik 2026-09-04): `meaningDensity` is DERIVED, never stored — computed on demand from what a place already
 *  authors (`tags`: sacred · locus · cult · home, `tier`, `communityId`) and from who is THERE (people living somewhere
 *  carries meaning; a place loses it when they leave). The weights are content (`the_substrate.meaning`) and a first pass
 *  is deliberately crude — the SHAPE is what was ruled. Returns null when no dials are authored, so nothing reads a
 *  number nobody chose. Pure. */
export function meaningDensity(location, { present = 0, data = null } = {}) {
  const m = data?.meaning;
  if (!location || !m) return null;
  let v = Number(m.base) || 0;
  const tags = new Set((Array.isArray(location.tags) ? location.tags : []).map(String));
  for (const [tag, w] of Object.entries(m.tags || {})) if (tags.has(tag)) v += Number(w) || 0;
  v += Number((m.tier || {})[String(location.tier || "")]) || 0;
  if (location.communityId) v += Number(m.community) || 0;
  v += Math.min(Number(m.presentCap) || 0, (Number(present) || 0) * (Number(m.perPerson) || 0));
  return Math.max(0, Math.min(1, v));
}

/** Who is THERE, for the dynamic half of R38a: registry people last seen at the place and still with us, plus the
 *  content people whose home it is. A count, deduplicated — the crude weight is per person. Pure. */
export function peoplePresentAt(locationId, { registry = {}, npcs = {} } = {}) {
  if (!locationId) return 0;
  const gone = new Set(["dead", "departed"]);
  const ids = new Set();
  for (const [id, n] of Object.entries(registry || {})) if (n && n.lastSeen?.locationId === locationId && !gone.has(String(n.status || ""))) ids.add(id);
  for (const [id, n] of Object.entries(npcs || {})) if (n && n.homeLocation === locationId && !gone.has(String(registry?.[id]?.status || ""))) ids.add(id);
  return ids.size;
}

/** R38b: the CEILING meaning sets — a place with no meaning caps a metaphysical craft at `ceilingFloor`, a place full of
 *  it caps nothing. `meaning` null → no ceiling (unauthored dials, or a place the derivation cannot read). Pure. */
export function meaningCeiling(meaning, data = null) {
  const m = data?.meaning;
  if (meaning === null || meaning === undefined || !m) return null;
  const floor = Math.max(0, Math.min(1, Number(m.ceilingFloor) || 0));
  return Math.max(0, Math.min(1, floor + (1 - floor) * meaning));
}

const FIELD_SUPPORT = 2.5;   // compact support: nothing past radius × this

/** Resolve the geographic substrate field. Returns Map<locationId, density>. Pure — no I/O, no
 *  mutation. `locations` is the id→record map; `data` is the_substrate.json. */
export function resolveSubstrateField(locations = {}, data = {}) {
  const base = data?.substrateDensity || {};
  const all = Object.values(locations).filter(l => l && l.id);
  const sources = all.filter(l => l.substrateSource);
  const pool = new Map(), sink = new Map();

  for (const s of sources) {
    const src = s.substrateSource;
    // radiusWorld is RADII on the sphere and is what mechanics use; `radius` (legacy map units) is
    // only a fallback for any source not yet re-authored.
    const radius = Number.isFinite(Number(src?.radiusWorld)) ? Number(src.radiusWorld) : Number(src?.radius) / 309;
    const peak = Number(src?.delta);
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(peak) || peak === 0) continue;
    for (const l of all) {
      const g = geodesic(s, l);
      if (g == null || g > radius * FIELD_SUPPORT) continue;   // compact support; unplaced → skip
      const delta = peak * Math.exp(-g / radius);
      // kind follows the SIGN — a "pool" authored below the background is unrepresentable
      if (delta < 0) sink.set(l.id, Math.max(sink.get(l.id) || 0, -delta));
      else pool.set(l.id, Math.max(pool.get(l.id) || 0, delta));
    }
  }

  // The field IS the density — no normalisation step. Each location is its region's baseline plus
  // the strongest positive delta reaching it minus the strongest negative one (the `max` above, not
  // a sum, so overlapping sources do not stack). §9b's invariant 2 asks regional means to stay NEAR
  // their authored values AS A CONSEQUENCE of the field, never by a correction applied to make them
  // match — the PO's corrected wording after I got this exactly wrong.
  //
  // I previously renormalised per region to force the mean to its authored value, and it broke
  // invariant 1 at the tight radiusWorld scale: forcing drift to zero means every local lift is paid
  // back somewhere in the same region, which pushes a source back onto the wrong side of its own
  // baseline. Over-satisfying invariant 2 ate invariant 1. The residual drift (~0.05) is emergent
  // and healthy; drift forced to zero was the symptom. `pools rise / sinks fall` is now STRUCTURAL —
  // a source keeps its own signed delta and nothing can flip it.
  const out = new Map();
  for (const l of all) {
    const b = base[l.regionId || l.region];
    if (typeof b !== "number") continue;              // no ambient → locationDensity's own fallback handles it
    out.set(l.id, clamp01(b + (pool.get(l.id) || 0) - (sink.get(l.id) || 0)));
  }
  return out;
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

/** Write the resolved field onto the in-memory location records, so `locationDensity`'s existing
 *  per-location branch picks it up with no change to it or to any call site. The authored FILES are
 *  never touched — the table stays the calibration target. Returns how many locations were stamped. */
export function applySubstrateField(locations = {}, data = {}) {
  const field = resolveSubstrateField(locations, data);
  let n = 0;
  for (const [id, density] of field) {
    const loc = locations[id];
    if (!loc || typeof loc.substrateDensity === "number") continue;   // an authored override always wins
    loc.substrateDensity = density;
    n++;
  }
  return n;
}

/* ═══ SNG-381 — THE GROUND CARD. Erik: "we need a better way to show what each skill depends on
 * for success" — and then, on seeing the shape: "with the cards that tell what the best ground is, we
 * need to see how well it performs on the CURRENT ground."
 *
 * ⛔ THAT SECOND SENTENCE IS THE WHOLE DESIGN. A card listing a craft's dependencies is a spec sheet;
 * the question a player actually has, standing somewhere, is "will this work HERE". So the line LEADS with
 * the verdict here and gives the dependency as the REASON — not the other way round.
 *
 * ⚠️ AND IT NEEDED NO NEW AUTHORED FIELD, which is the answer to Aevi's "spec the card before the
 * field". She feared authoring a weighted source mix nobody could see. The chain already exists end to end:
 *     ability.tradition → character.schools[tradition] → school.extension → sourceBands.sources[ext]
 * 374 of 383 abilities carry a tradition and all 26 traditions have schools, so a craft's source is
 * DERIVED from what the character actually practises rather than restated per ability. Her own instruction
 * on the classification pass — "derive first, hand me the residue" — applies here first.
 */

/** The source a craft reaches with FOR THIS CHARACTER. Precedence: the school they practise in the craft's
 *  tradition (if it has an extension) → an explicit deferral → ⛔ THE CRAFT'S OWN `powerSystem` → the
 *  tradition's authored primary → the foothill mix. ⚠️ This docstring used to say "never a field on the
 *  ability" — that was the defect SPEC_body_source.md §0 names, not the design. Null when the craft has no
 *  tradition or its source is deferred: an honest "we do not know" rather than a default that looks like one. */
/** ⛔ FOUND WHILE VERIFYING SPEC_body_source.md, NOT DESCRIBED IN IT — a wider defect the same shape
 *  as the one the spec names. `power_sources.json`’s `byTradition[t].primary` speaks the CRAFT vocabulary
 *  (`ordered_nanite`, `wild_nanite` — the same values `ability.powerSystem` uses); `the_substrate.json`’s
 *  `sourceBands.sources` speaks the BAND vocabulary (`nanite`, `wild`). ⚠️ `school.extension` already uses
 *  the band vocabulary directly — only the tradition-primary and foothill paths carry the mismatch.
 *
 *  ⛔ MEASURED: 9 traditions (churnfolk, rootkin, threnodist, figurist — wild_nanite; seraphic,
 *  enginewright, syllogist, mason, lattice — ordered_nanite) resolve a `source` that `sourceBands.sources`
 *  has no entry for. Every ground-reading function keys off that dictionary by exact string
 *  (`sourceEntry`, `sourceGround`, `sourceHasFloor`, `fieldOfSource`, and the inline band lookup in
 *  `groundCardFor`) — so all of them silently return null/false/"substrate", and 152 of 428 crafts
 *  (over a third of the corpus) report `verdict: "unaffected by the ground"` for every location, for
 *  ANY character who has not chosen a school with its own extension — which is the common case this
 *  whole resolver exists to handle correctly (CCODE-221’s own “zero regression” baseline).
 *
 *  ✅ THE CORRESPONDENCE IS UNAMBIGUOUS, NOT AUTHORED: the content’s own `_nanieStates` note says
 *  “ordered and wild are one source in two states”, and `nanite`’s band {0.9, 0.2} matches precursor —
 *  exactly what “ordered” nanite (war infrastructure, disciplined) should mirror — while `wild`’s
 *  {0.32, 0.2} matches “thrives in the unreached gaps”. This is a rename, not a judgement call.
 *
 *  ⚠️ APPLIED ONLY AT THE RETURN BOUNDARY, after the foothill branch’s tie-detection has already run on
 *  the RAW ordered/wild values — that logic (§30.2: a 50/50 split IS `combination`, not a coin flip) needs
 *  the two states kept distinct to find a tie; only the BAND LOOKUP needs them merged. */
const BAND_VOCAB_ALIAS = { ordered_nanite: "nanite", wild_nanite: "wild" };
const toBandVocab = (source) => BAND_VOCAB_ALIAS[source] || source;

export function craftSource(ability, character, schoolsData, powerSources = null, foothills = null) {
  const tid = ability?.tradition;
  if (!tid) return null;
  const school = schoolForTradition(character, tid, schoolsData);
  // ⛔ CCODE-221 — A PURE SCHOOL FALLS THROUGH TO ITS TRADITION, AND THE COMMENT BELOW ALREADY SAID SO.
  // "A PURE school (extension null) leans on nothing new, so it keeps the TRADITION'S OWN authored band."
  // The code returned `source: school.extension` — null — and stopped, so every practitioner who had not
  // CHOSEN a school (the default is the pure one, line 96) graded against nothing. That is Aevi's
  // acceptance test 3: an ashwarden craft must score against `metaphysical`, and it was scoring against
  // no source at all while reporting `via: "school"` as though it had answered.
  // ⚠️ The school is still RETURNED — it is true and the card should say it — the SOURCE just comes from
  // the tradition, which is what "leans on nothing new" means.
  if (school?.extension) return { traditionId: tid, school, source: school.extension, via: "school" };
  // ⛔ SNG-382 — THE TRADITION MIX IS THE FALLBACK, AND WIRING IT IS WHAT GAVE IT A READER. Aevi
  // authored 26 weighted mixes with Erik's reasons into `power_sources.json`; the file was registered,
  // never fetched by the loader, and read by nothing but a CI audit. Five traditions — harmonic,
  // radiant_folk, valley_craft, precursor, cross_pole_braid — have no schools at all, so 53 of 374 crafts
  // could show no ground card whatever. The mix answers for exactly those.
  //
  // ⚠️ `via` IS RETURNED SO THE CARD CAN SAY WHICH IT IS. A school is what THIS practitioner reaches
  // with; a tradition mix is what the craft TYPICALLY leans on. Those are different claims and a card that
  // presented them identically would be overstating the second.
  const row = powerSources?.byTradition?.[tid];
  // ⛔ CCODE-221 — A NULL PRIMARY IS UNKNOWN, NOT ABSENT, AND MUST NOT FALL THROUGH TO A GUESS. `abyssal`
  // sits at null because Erik deferred it to the Abyssal audit; returning null here makes the card DECLINE,
  // which is the honest answer. Falling through to the foothill computation would answer it from parents
  // that are not its parents.
  if (row && row.primary === null) return { traditionId: tid, school: null, source: null, mix: null, via: "deferred" };
  // ⛔ SPEC_body_source.md §0 — ERIK: “the craft's powerSystem isn't read at all — it's what the craft
  // itself is supposed to use.” MEASURED: `craftSource` read only `ability.tradition`, never
  // `ability.powerSystem`, so 55 of 419 crafts were graded against a band their own declared source
  // disagrees with (16 on a DISJOINT band — e.g. `uttered_name`, a veil craft graded as precursor,
  // switched off standing on the ground it wants). ALL 419 tradition-bearing crafts already carry a
  // `powerSystem` — this is not a guess filling a gap, it is a read the resolver always skipped.
  //
  // ⚠️ CHECKED AFTER THE DEFERRED-NULL RETURN ABOVE, ON PURPOSE: `abyssal`'s primary is explicitly
  // UNKNOWN, not absent (Erik: “a card that cannot answer must decline rather than answer wrongly”) —
  // 22 abyssal crafts already carry their own `powerSystem` (precursor ×20, combination ×2), and letting
  // the craft's field win here would silently un-defer a tradition-wide ruling with a per-craft workaround.
  // ✅ THIS IS A DEFAULT, NOT A DECIDED QUESTION — flagged in the SPEC_body_source.md reply as open:
  // should a craft's own declaration override the Abyssal deferral now that it is read at all? Left
  // deferring, the conservative side of that question, until Erik answers.
  const declared = ability?.powerSystem;
  if (declared) return { traditionId: tid, school: school || null, source: toBandVocab(declared), mix: null,
    mixAuthored: false, via: "craft" };
  // ⚠️ `mixAuthored` IS RETURNED SEPARATELY, AND THAT IS §2b'S WHOLE POINT. `mix: null` must mean
  // UNAUTHORED and never "the mean is pure" — an absent value doing double duty is the trap, and a card
  // that cannot tell them apart will render a confident blend out of nothing.
  if (row?.primary) return { traditionId: tid, school: school || null, source: toBandVocab(row.primary), mix: row.mix || null,
    mixAuthored: !!row.mix && !row._mixUnauthored, via: "tradition" };

  // ⛔ A FOOTHILL HAS NO SOURCE OF ITS OWN — IT INHERITS FROM WHOEVER LIVES THERE. §30.6: `tradition` is
  // LINEAGE and `learnedAt` is ACCESS; a foothill is a place of access, not a new ancestry. So the seven
  // keys that used to sit in `byTradition` are COMPUTED here and never stored — a stored copy of a derived
  // value is the failure that produced this whole ticket.
  //
  // ⚠️ AEVI'S PROOF THAT THE DERIVATION IS RIGHT: `harmonic`'s parents resolve 50/50 between the two
  // nanite states, a tie, which resolves to `combination` — and its 15 crafts already carry exactly that.
  // A computation that reproduces a value nobody derived it from is the strongest evidence available.
  const foot = foothills?.foothills?.[tid];
  if (foot?.parents) {
    const weight = {};
    for (const [parent, w] of Object.entries(foot.parents)) {
      const pr = powerSources?.byTradition?.[parent]?.primary;
      if (pr) weight[pr] = (weight[pr] || 0) + (Number(w) || 0);
    }
    const ranked = Object.entries(weight).sort((a, b) => b[1] - a[1]);
    if (ranked.length) {
      // ⛔ A TIE IS `combination`, NOT A COIN FLIP. §30.2: ordered and wild are one source in two states,
      // and a people standing evenly between two sources IS a combination rather than an arbitrary pick.
      const tied = ranked.length > 1 && ranked[0][1] === ranked[1][1];
      return { traditionId: tid, school: null, source: tied ? "combination" : toBandVocab(ranked[0][0]),
        mix: weight, mixAuthored: false, via: "foothill", parents: foot.parents };
    }
  }
  return null;
}

/** ⚠️ ONE LINE, AND THE ORDER OF IT IS THE POINT. Returns the pieces rather than a formatted string
 *  so the wheel, the level-up list and the GM block cannot drift about what a craft is worth here.
 *
 *  `strength` is 0–4 pips for scanning; `verdict` is the word; `because` is the authored ground line.
 *  Returns null when the source is unknown — a card that cannot answer must not render a confident row. */
export function groundCardFor(ability, character, { schools, substrate, location, powerSources = null, locations = null, foothills = null,
  // ✅ Q3 (GO_LIST_20260904 §2): THE ROLL READS THE CRAFT, NOT THE TRADITION. `substrateForAction` now builds its verdict
  // from THIS card — the craft's own source, the per-source field at the site, one tuning — so the card and the roll can
  // never disagree about what a craft is worth here. `carried` is the roll's term (a Waystaff, a companion's aura) and
  // `present` is R38's (who is there); a card caller that passes neither sees the card it saw before.
  carried = 0, present = 0 } = {}) {
  const cs = craftSource(ability, character, schools, powerSources, foothills);
  if (!cs) return null;
  // ⛔ SNG-385 — THE CARD READS THE SOURCE'S OWN FIELD. A nanite craft scored against lattice density
  // is being marked on the wrong exam: the Heartroot is lattice 0.02 and nanite `wild` 0.75, and a card
  // that calls a nanite craft starved there is simply wrong about the world.
  // ⚠️ SNG-392: at a SITE, the LOCAL FRAME adjusts the value the card scores against — this is the
  // seam where an invasion becomes visible, and the receipt rides along so the card can say WHY.
  const sited = location ? fieldValueAtSite(cs.source, location, substrate, locations) : { value: null, local: null };
  const density = sited.value;
  const localGround = sited.local;
  const nan = fieldOfSource(cs.source, substrate) === "nanite" ? naniteAt(location, substrate) : null;
  const because = sourceGround(cs.source, substrate);
  // A source with no band (body, nanite) does not care about the ground, and saying "strong here" about it
  // would be inventing a relationship the content explicitly denies.
  // ⚠️ A TRADITION-MIX SOURCE HAS NO SCHOOL OBJECT, so the band comes from the SOURCE directly.
  // `combination` is a deliberate authored value meaning "no single source dominates" — it is not on the
  // ratified source list and has no band, which is correct rather than missing.
  const band = cs.school ? bandForSchool(cs.traditionId, cs.school, substrate)
    : (substrate?.sourceBands?.sources?.[cs.source]?.band || null);
  const banded = !!band;
  if (density === null || !banded) {
    // ⚠️ A NANITE CRAFT IS NOT "UNAFFECTED BY THE GROUND" — it is unSCORED, because no band is
    // authored for its axis yet. Saying the field does not touch it would be a statement about the world;
    // naming the country it is standing in is a statement about what we know.
    return { source: cs.source, school: cs.school, via: cs.via, density, because, field: fieldOfSource(cs.source, substrate), nanite: nan,
             verdict: nan ? `in ${nan.state} nanite country` : "unaffected by the ground",
             strength: 4, percent: null, chancePenalty: 0, energyMult: 1, off: false, grounded: false };
  }
  const tuning = SUBSTRATE_TUNING;
  const v = cs.school
    ? substrateVerdict({ tradition: cs.traditionId, school: cs.school,
        root: schools?.traditionSchools?.[cs.traditionId]?.root, density, carried, data: substrate })
    // ⛔ Q3: the unschooled branch used to carry its OWN constants (−30 max, ×0.5 energy, off under 0.2) while the roll
    // used the tuning (−65, ×0.6, 0.18) — two arithmetics for one ground. One tuning now, and the source's own floor.
    : (() => { const eff = effectiveDensity(density, carried);
        let factor = bandFactor(band, eff, tuning);
        let side = eff < band.center - band.width ? "starved" : eff > band.center + band.width ? "crowded" : "full";
        if (sourceHasFloor(cs.source, substrate) && side === "starved" && factor < tuning.materialFloor) { factor = tuning.materialFloor; side = "floored"; }
        return { factor, side, percent: Math.round(factor * 100), chancePenalty: Math.round((1 - factor) * tuning.maxChancePenalty),
                 energyMult: 1 + tuning.energyK * (1 - factor), off: factor < tuning.gateBelow }; })();
  // ✅ R38b (Erik 2026-09-04): MEANING SETS THE CEILING, SUBSTRATE SETS THE PENALTY. A metaphysical craft reads TWO grounds:
  // how much there is to work with (meaning → the ceiling) and how cleanly it can be reached (substrate → the penalty
  // above). Shape 1 of three: `min(ceiling, factor)`, never a product — a place with both is not worse than a place with
  // neither. Which sources read meaning is content (`meaning.appliesTo`); a craft may opt out with `mechanic.meaning:
  // "none"` (a body craft under a metaphysical source — Aevi's ki_wield case) — reader before field.
  const meaningSources = new Set((substrate?.meaning?.appliesTo || []).map(String));
  const readsMeaning = meaningSources.has(String(cs.source)) && ability?.mechanic?.meaning !== "none";
  const meaning = readsMeaning && location ? meaningDensity(location, { present, data: substrate }) : null;
  const ceiling = readsMeaning ? meaningCeiling(meaning, substrate) : null;
  let meaningBound = false;
  if (ceiling !== null && v.factor > ceiling) {
    v.factor = ceiling; v.percent = Math.round(ceiling * 100); meaningBound = true;
    v.chancePenalty = Math.round((1 - ceiling) * tuning.maxChancePenalty);
    v.energyMult = 1 + tuning.energyK * (1 - ceiling);
    v.off = ceiling < tuning.gateBelow;
    v.side = "meaningless";
  }
  const word = v.off ? "will not answer here"
    : v.side === "meaningless" ? "capped here — little meaning to work with"
    : v.side === "full" ? "at full strength here"
    : v.side === "floored" ? "holding at its floor here"
    : v.side === "starved" ? "starved here — the ground is too thin"
    : v.side === "crowded" ? "crowded here — the ground is too loud"
    : "unaffected by the ground";
  // ⛔ DARK FIELD, GIVEN A READER (2026-09-04): `byTradition[t].mix` — 26 authored blends with Erik’s reasons — had ZERO consumers
  // since the day it landed; `craftSource` returned it and nothing looked. The card now carries the LINEAGE’s blend whenever the
  // row authors one (whatever `via` says — a craft that declares veil is still of a people that leans veil .5 / metaphysical .45),
  // in the band vocabulary, as a readable list. `mixAuthored` guards the “the mean is pure” trap (§2b): an unauthored mix is absent.
  const row = powerSources?.byTradition?.[cs.traditionId];
  const lineageMix = row?.mix && !row._mixUnauthored
    ? Object.entries(row.mix).filter(([, w]) => Number(w) > 0).sort((a, b) => b[1] - a[1]).map(([k, w]) => ({ source: toBandVocab(k), share: Math.round(Number(w) * 100) }))
    : null;
  return { source: cs.source, school: cs.school, via: cs.via, density, because, field: fieldOfSource(cs.source, substrate), nanite: nan, localGround, verdict: word, lineageMix,
    strength: Math.max(0, Math.min(4, Math.round(v.factor * 4))), percent: v.percent, factor: v.factor, side: v.side,
    // R38: the second ground, when this source reads it — absent otherwise, never a default
    ...(readsMeaning ? { meaning, ceiling, meaningBound } : {}),
    chancePenalty: v.chancePenalty, energyMult: v.energyMult, off: v.off, grounded: true };
}

/** ⛔ SNG-381 — THE GROUND UNDER YOUR FEET, FOR THE LOCATION BANNER. Erik: "the current ground's power
 *  sources should be viewable in the location banner. Remember there are bastions of power with auras."
 *
 *  ⚠️ THE BASTIONS WERE ALREADY THERE AND FULLY AUTHORED — 26 locations carry a `substrateSource`
 *  pool or sink with a radius on the sphere and a reason, and state.js resolves that field onto all 118
 *  locations. Nothing needed inventing; the player simply could not see any of it. A banner is the one
 *  place they are already looking to learn where they are.
 *
 *  Returns { density, word, bastion } — `bastion` non-null only AT an authored source, and it carries the
 *  authored reason, because "dense here" is trivia and "the machines here never stopped" is the world. */
export function groundHere(location, substrateData) {
  if (!location) return null;
  const density = locationDensity(location, substrateData);
  if (typeof density !== "number") return null;
  const word = density >= 0.75 ? "dense" : density >= 0.45 ? "middling" : density >= 0.2 ? "thin" : "dead-thin";
  const src = location.substrateSource;
  // ⚠️ ONE LOCATION AUTHORS THIS AS A BARE STRING ("thin-unreached") RATHER THAN THE OBJECT SHAPE.
  // Reported, not coerced — guessing a delta for it would be inventing a bastion.
  const bastion = (src && typeof src === "object" && src.kind)
    ? { kind: src.kind, delta: src.delta ?? null, reason: src.reason || null } : null;
  // ⛔ SNG-385 — THE SECOND FIELD RIDES ALONG. Erik: "two fields, two colours — a Precursor vault
  // and a wild bloom must not render the same." The Heartroot is lattice 0.02 and nanite `wild` 0.75; a
  // banner that shows only the first says "dead ground" about a place that is blooming.
  return { density, word, bastion, nanite: naniteAt(location, substrateData) };
}

/* ═══ SNG-385 — THE NANITE FIELD. Aevi authored it for all 26 regions and flagged it herself:
 * "⚠️ NO CONSUMER YET. Authored ahead of a reader DELIBERATELY and flagged: `substrateDensity` has a
 * resolver and this does not. Until then this is documentation, and I am saying so rather than letting it
 * look wired."
 *
 * ⛔ IT IS A SECOND GEOGRAPHY, NOT A SECOND OPINION ABOUT THE FIRST. Erik: ground nanite in "what the
 * PRE-TRANSITION HUMANS WERE DOING THERE." The lattice map says where the Precursors built; this one says
 * where the tech was deployed and what became of it — still cycled (`ordered`), abandoned and bloomed
 * (`wild`), or absent (`clear`, and there are two ways to be clear). A Precursor vault and a wild bloom
 * must not render the same, which is exactly why they cannot share a field.
 *
 * ⚠️ AUTHORED PER REGION, NOT AS POINT SOURCES. `substrateSource` is 43 pools and sinks with radii
 * on the sphere; this is 26 regional values. Inventing radii for it would be me designing a geography she
 * deliberately shaped differently — so the resolver reads the region, and honours a per-location override
 * if one is ever authored, which is the same courtesy `locationDensity` pays `substrateDensity`.
 */

/** The nanite reading where this location stands: { v, state, why } — or null when nothing is authored
 *  for its region. ⚠️ NULL IS "WE DO NOT KNOW", NOT ZERO: a region with no entry is unsurveyed, and
 *  scoring a craft as starved there would be inventing an absence. */
export function naniteAt(location, substrateData) {
  if (!location) return null;
  // A per-location override wins, exactly as an authored `substrateDensity` does.
  if (typeof location.naniteDensity === "number") {
    return { v: location.naniteDensity, state: location.naniteState || null, why: null, source: "location" };
  }
  const region = location.regionId || location.region;
  const e = substrateData?.naniteField?.byRegion?.[region];
  if (!e || typeof e.v !== "number") return null;
  return { v: e.v, state: e.state || null, why: e.why || null, source: "region" };
}

/** Which FIELD does a source answer to? ⛔ THE WHOLE POINT OF SNG-385: `nanite` has no band against
 *  lattice density and never should have — it answers to the nanite field. Read from content so the
 *  answer is authored rather than a list in code, defaulting to the substrate for everything else. */
export function fieldOfSource(source, substrateData) {
  return substrateData?.sourceBands?.sources?.[source]?.field || "substrate";
}

/** The value a craft with this source is scored against, at this location — the ONE place that decides
 *  which geography applies. Returns null when the relevant field has nothing to say here. */
export function fieldValueFor(source, location, substrateData) {
  if (fieldOfSource(source, substrateData) === "nanite") {
    const n = naniteAt(location, substrateData);
    return n ? n.v : null;
  }
  const d = locationDensity(location, substrateData);
  return typeof d === "number" ? d : null;
}

/* ═══ SNG-392 §1 — THE LOCAL FRAME. The schema that unblocks Aevi's 65 sites, and the resolver
 * that makes it a mechanic instead of a spreadsheet the day she authors it.
 *
 *   localMap:     { x, y }                                    — the site's place in its settlement's floor
 *                                                               plan. A LOCAL frame, a projection of nothing.
 *   localSources: [ { kind: "pool"|"sink", delta, radiusLocal, reason, field?: "substrate"|"nanite" } ]
 *
 * ⛔ ERIK'S RULING GOVERNS THE MAGNITUDE: LOCAL GROUND CAN OVERTURN WORLD GROUND. Aevi proposed ±0.15
 * and he declined — "that's how different traditions INVADE and can be effective in an antipole. It takes
 * planning and resources." NO CAP lives here; the sum clamps to the axis's own [0,1] and nothing else.
 * The counter is the same mechanic pointed the other way.
 *
 * ⚠️ PER-AXIS, BECAUSE SNG-387 §2 SAID SO IN ADVANCE: "the Ent-embassy ward is not generic
 * thinness — it is nanite-clear and lattice-neutral." A local source may name its `field`; it defaults to
 * the substrate. Cross the courtyard and your craft changes — differently per craft.
 *
 * ⚠️ WITHIN THE FRAME ONLY. A settlement's wells and sinks reach its own sites and nothing beyond —
 * they do not participate in the world field, and a source in one settlement never leaks into another. */

/** The local field at one site: the summed reach of every localSource in its settlement's frame — its
 *  own and its siblings' — with an itemised receipt naming each contributor. Pure.
 *  ⚠️ THE RECEIPT IS NOT DECORATION: carriedSubstrateSources set the precedent, and its own design
 *  note says why — a defender whose ground moved must be told WHY, "the difference between a mechanic and
 *  the cruellest possible bug." */
export function localFieldAt(siteId, locations) {
  const site = locations?.[siteId];
  if (!site || !site.localMap || !Number.isFinite(site.localMap.x) || !Number.isFinite(site.localMap.y)) return null;
  const parentId = site.parentId;
  if (!parentId) return null;
  const out = { substrate: 0, nanite: 0, receipt: [] };
  for (const l of Object.values(locations)) {
    if (l.parentId !== parentId && l.id !== parentId) continue;          // the frame: the settlement and its sites
    if (!Array.isArray(l.localSources) || !l.localMap) continue;
    const dx = site.localMap.x - l.localMap.x, dy = site.localMap.y - l.localMap.y;
    const dist = Math.hypot(dx, dy);
    for (const src of l.localSources) {
      const r = Number(src.radiusLocal);
      if (!Number.isFinite(src.delta) || !(r > 0)) continue;
      if (dist >= r * 2.5) continue;                                     // compact support, as the world field
      const v = src.delta * Math.exp(-Math.pow(dist / r, 2));
      const field = src.field === "nanite" ? "nanite" : "substrate";
      out[field] += v;
      out.receipt.push({ at: l.id, field, kind: src.kind || (src.delta >= 0 ? "pool" : "sink"),
        contribution: Math.round(v * 1000) / 1000, reason: src.reason || null });
    }
  }
  return out.receipt.length ? out : null;
}

/** The value a craft is scored against at a SITE: the world field plus the local frame, clamped to the
 *  axis — the one place local and world ground meet, so an invasion and its counter both read here. */
export function fieldValueAtSite(source, location, substrateData, locations) {
  const base = fieldValueFor(source, location, substrateData);
  if (base === null) return { value: null, local: null };
  const local = location?.id && locations ? localFieldAt(location.id, locations) : null;
  if (!local) return { value: base, local: null };
  const axis = fieldOfSource(source, substrateData) === "nanite" ? "nanite" : "substrate";
  return { value: Math.max(0, Math.min(1, base + local[axis])), local };
}
