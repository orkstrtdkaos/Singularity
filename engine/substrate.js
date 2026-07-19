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

export const SUBSTRATE_TUNING = {
  starveExp: 1.15,      // below-band falloff steepness (Seraph@Quickwood → ≈13%)
  starveFloor: 0.0,     // a starved craft can reach ~0
  crowdSlope: 0.75,     // above-band falloff rate
  crowdFloor: 0.6,      // interference never drops a craft below this
  maxChancePenalty: 65, // factor 0 → −65 to success chance (drives to the d100 floor)
  energyK: 0.6,         // thin/crowded substrate strains: energy × (1 + energyK·(1−factor))
  gateBelow: 0.18,      // factor under this → the craft is effectively OFF (a hard, explained gate)
};

/** A tradition's band {center, width}, or null for the untuned (folk/learned) — substrate-neutral. */
export function bandFor(tradition, data) { // registry:internal
  const b = data?.substrateBand?.[tradition];
  return b && b.center != null ? { center: b.center, width: b.width ?? 0.18 } : null;
}

/** A place's effective density for a wielder carrying `carried` charge, clamped to [0,1]. */
export function effectiveDensity(density, carried = 0) { // registry:internal
  return Math.max(0, Math.min(1, (Number(density) || 0) + (Number(carried) || 0)));
}

/** The output factor [0,1] for a craft of `band` at effective density `eff`. Two-sided: full inside
 *  the band, steep starvation below, mild floored interference above. */
export function bandFactor(band, eff, t = SUBSTRATE_TUNING) { // registry:internal
  if (!band) return 1; // untuned tradition — substrate-neutral
  const lo = band.center - band.width, hi = band.center + band.width;
  if (eff >= lo && eff <= hi) return 1;
  if (eff < lo) {
    const x = lo <= 0 ? 1 : Math.max(0, eff / lo); // 1 at the band edge → 0 at true nature
    return Math.max(t.starveFloor, Math.min(1, Math.pow(x, t.starveExp)));
  }
  return Math.max(t.crowdFloor, 1 - t.crowdSlope * (eff - hi)); // interference — mild, floored
}

/** The full substrate verdict for a craft at a place. `data` = the_substrate.json. Pure. */
export function substrateVerdict({ tradition, density, carried = 0, data, tuning = SUBSTRATE_TUNING }) {
  const band = bandFor(tradition, data);
  const eff = effectiveDensity(density, carried);
  const factor = bandFactor(band, eff, tuning);
  const side = !band ? "neutral"
    : eff < band.center - band.width ? "starved"
    : eff > band.center + band.width ? "crowded" : "full";
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
// DISTANCE IS SHORTEST PATH OVER CONNECTIONS, each edge weighted by coordinate distance. The
// proposal's §3 proved raw coordinates are the wrong DRIVER — they are hand-placed for legibility,
// and ent_deepwood and the_lampless_market share (40,300) while sitting in different regions with
// no connection between them, so euclidean distance says "full bleed" and is wrong. §4 proved
// connections are the right topology. Weighting graph edges by coordinate distance keeps the 26
// authored `radius` values meaningful in the units they were written in, while travel adjacency
// decides what reaches what. Verified: the graph is one connected component, 0 dangling, 0
// asymmetric, 0 isolated.
//
// CALIBRATION. §9b invariant 2 says the authored table is the target and must not be overwritten.
// 19 of 25 regions have sources of only ONE sign, so an uncorrected field drifts the regional mean
// by up to 0.133 — that IS overwriting it. Renormalising per region, across only the locations a
// source actually touched, holds drift at 0.0005 while leaving untouched ground at exactly its
// region's ambient (invariant 3). Measured both ways in scripts/substrate_field_probe.mjs.
//
// It also makes the untuned falloff safe against `tuningNote`: the scales change the SHAPE within a
// region and can no longer move the regional calibration at all.

const FIELD_SUPPORT = 2.5;   // compact support: nothing past radius × this

/** Undirected adjacency over location connections, weighted by map distance. Pure. */
function connectionGraph(locations) {
  const adj = {};
  const xy = l => [l?.map?.x ?? 0, l?.map?.y ?? 0];
  for (const l of Object.values(locations)) {
    adj[l.id] = adj[l.id] || new Map();
    for (const c of l.connections || []) {
      const to = typeof c === "string" ? c : (c?.to || c?.id || c?.locationId);
      const dest = to && locations[to];
      if (!dest) continue;
      const w = Math.hypot(xy(l)[0] - xy(dest)[0], xy(l)[1] - xy(dest)[1]);
      adj[l.id].set(to, w);
      (adj[to] = adj[to] || new Map()).set(l.id, w);
    }
  }
  return adj;
}

/** Dijkstra from one source, bounded by maxDist. Returns Map<locationId, pathDistance>. */
function reachWithin(adj, fromId, maxDist) {
  const dist = new Map([[fromId, 0]]);
  const pq = [[0, fromId]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, n] = pq.shift();
    if (d > (dist.get(n) ?? Infinity)) continue;
    for (const [m, w] of adj[n] || []) {
      const nd = d + w;
      if (nd > maxDist) continue;
      if (nd < (dist.get(m) ?? Infinity)) { dist.set(m, nd); pq.push([nd, m]); }
    }
  }
  return dist;
}

/** Resolve the geographic substrate field. Returns Map<locationId, density>. Pure — no I/O, no
 *  mutation. `locations` is the id→record map; `data` is the_substrate.json. */
export function resolveSubstrateField(locations = {}, data = {}) {
  const base = data?.substrateDensity || {};
  const all = Object.values(locations).filter(l => l && l.id);
  const adj = connectionGraph(locations);
  const pool = new Map(), sink = new Map();

  for (const s of all) {
    const src = s.substrateSource;
    const radius = Number(src?.radius);
    const peak = Number(src?.delta);
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(peak) || peak === 0) continue;
    for (const [id, pathDist] of reachWithin(adj, s.id, radius * FIELD_SUPPORT)) {
      const delta = peak * Math.exp(-pathDist / radius);
      // kind follows the SIGN — a "pool" authored below the background is now unrepresentable
      if (delta < 0) sink.set(id, Math.max(sink.get(id) || 0, -delta));
      else pool.set(id, Math.max(pool.get(id) || 0, delta));
    }
  }

  const raw = new Map();
  for (const l of all) {
    const b = base[l.regionId || l.region];
    if (typeof b !== "number") continue;              // no ambient → locationDensity's own fallback handles it
    raw.set(l.id, b + (pool.get(l.id) || 0) - (sink.get(l.id) || 0));
  }

  const byRegion = {};
  for (const l of all) if (raw.has(l.id)) (byRegion[l.regionId || l.region] = byRegion[l.regionId || l.region] || []).push(l.id);
  const touched = id => (pool.get(id) || 0) !== 0 || (sink.get(id) || 0) !== 0;
  const out = new Map();
  for (const [region, ids] of Object.entries(byRegion)) {
    const hit = ids.filter(touched);
    if (!hit.length) { for (const id of ids) out.set(id, clamp01(raw.get(id))); continue; }
    const mean = ids.reduce((a, id) => a + raw.get(id), 0) / ids.length;
    const shift = (base[region] - mean) * ids.length / hit.length;   // the whole correction, borne by the touched
    for (const id of ids) out.set(id, clamp01(raw.get(id) + (touched(id) ? shift : 0)));
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
