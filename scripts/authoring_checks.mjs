// scripts/authoring_checks.mjs — THE AUTHORING RULES FOUR REGISTERED FILES CARRY, AS FUNCTIONS. Pure; imported by
// tests/content_ci.mjs (which runs them over the live corpus) and by §185 (which proves each one can go red).
//
// ⛔ B2 (Aevi's BUILD_LIST §2; Erik 2026-09-12: "proceed with B2"): nine registered rules files reached nothing. Six were
// authored intent with no consumer, which is this project's signature defect wearing content's face — `earned_power_guidance`
// was exactly this, and its numbers would have clamped while its voice layer never reached anyone.
//
// ⚠️ A MENTION IS NOT A READER. `content_ci`'s orphan gate counts a file as consumed when its NAME appears anywhere in
// tests/ — so the cheapest way to turn these green was to name them in a comment. These four are read for what they SAY
// and hold the corpus to it; §185 breaks each rule on a synthetic to prove the gate is not decoration.

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const tierOf = (a) => Math.max(1, num(a?.tier ?? a?.levelReq) || 1);
export const median = (xs) => {
  const s = xs.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** `energy_costs.json` — ⛔ SNG-497 wrote the corpus's energy structure down so an outlier could be SEEN as one, and nothing
 *  read it, so the structure could drift away from the document that described it. The runtime prices a craft from its own
 *  `energyCost`; this holds the DOCUMENT to the corpus: each level's documented median must still be the corpus's median
 *  (±`tolerance`), and the crafts outside the authored band are counted so the census is visible every run.
 *  ⚠️ The file's own `n` is a stored copy of a derived count and goes stale with every craft authored — reported, not gated. */
export function energyBandReport(crafts, spec, { tolerance = 1 } = {}) {
  const rows = [];
  for (const [tier, row] of Object.entries(spec?.byLevel || {})) {
    const at = (crafts || []).filter(a => String(tierOf(a)) === String(tier) && num(a?.energyCost) !== null);
    const costs = at.map(a => num(a.energyCost));
    const [lo, hi] = String(row?.band || "").split("-").map(Number);
    const live = median(costs);
    rows.push({
      tier: Number(tier), band: row?.band ?? null, fileMedian: num(row?.median), liveMedian: live,
      fileN: num(row?.n), liveN: costs.length,
      drift: live !== null && num(row?.median) !== null ? Math.abs(live - num(row.median)) : null,
      outsideBand: Number.isFinite(lo) && Number.isFinite(hi) ? at.filter(a => num(a.energyCost) < lo || num(a.energyCost) > hi).map(a => `${a.id} e${a.energyCost}`) : [],
    });
  }
  return { rows, drifted: rows.filter(r => r.drift === null || r.drift > tolerance), staleCounts: rows.filter(r => r.fileN !== r.liveN) };
}

/** `companion_template.json` — ⛔ SNG-511: the one GM-generated type with no template, written after nine companions had been
 *  hand-authored. This holds every companion to the shape the template declares `required`. */
export function templateGaps(companions, template) {
  const req = Object.keys(template?.required || {});
  return (companions || []).map(c => ({ id: c?.id ?? "(no id)", gaps: req.filter(k => c?.[k] === undefined) })).filter(x => x.gaps.length);
}

/** `damage_types.json` — the authored enum of what a blow can BE. Every type a craft declares must be in it, or in the
 *  census of types the corpus uses and the enum has not admitted yet — which is a content decision (widen the enum, or
 *  retype the crafts), named here so a NEW one fails while the known five wait for Aevi. */
export function damageTypeReport(crafts, spec, census = []) {
  const listed = Array.isArray(spec?.types) ? spec.types.map(t => (typeof t === "string" ? t : t?.id || t?.type)).filter(Boolean) : Object.keys(spec?.types || {});
  const used = new Map();
  for (const a of crafts || []) {
    const seen = [a?.mechanic?.damageType, ...((a?.tree || []).map(t => t?.mechanic?.damageType))].filter(Boolean);
    for (const t of seen) used.set(t, (used.get(t) || 0) + 1);
  }
  const outside = [...used.keys()].filter(t => !listed.includes(t));
  return { listed, used: [...used.entries()].sort((a, b) => b[1] - a[1]), outside, fresh: outside.filter(t => !census.includes(t)), stale: census.filter(t => !used.has(t)) };
}

/** `ability_distribution_target.json` — a design COMPASS, not a mirror: Aevi's per-domain shape (HARM 3, PERCEIVE 4…) with a
 *  snapshot of the totals as they were. The distance between the compass and the corpus is the interesting number, so it is
 *  measured every run and never gated — a compass that must agree with where you are is not a compass. */
export function distributionDistance(crafts, spec, domainOf) {
  const live = {};
  for (const a of crafts || []) { const d = a?.tradition ? domainOf?.[a.tradition] : null; if (d) live[d] = (live[d] || 0) + 1; }
  const rows = Object.entries(spec?.totals || {}).map(([domain, n]) => ({ domain, snapshot: num(n), live: live[domain] || 0 }));
  return { rows: rows.sort((a, b) => (b.live - b.snapshot) - (a.live - a.snapshot)), grown: rows.filter(r => r.live > r.snapshot).length, shrunk: rows.filter(r => r.live < r.snapshot).length };
}

/** `mechanic_effects.json` — each effect claims `wired: true|false|partial`. A claim about the engine is the one thing this
 *  project has learned to distrust, so the claims are checked against the engine's own vocabulary: an effect the file calls
 *  UNWIRED that the engine plainly names is a stale claim (six of them were built after the file was written), and one it
 *  calls wired that the engine never names is either unbuilt or named something else. Reported; the flags are Aevi's. */
export function wiredClaimClashes(spec, engineSource) {
  const words = new Set(String(engineSource || "").match(/[A-Za-z_][A-Za-z0-9_]*/g) || []);
  const camel = (s) => s.toLowerCase().replace(/_([a-z])/g, (m, c) => c.toUpperCase());
  const named = (n) => words.has(n) || words.has(camel(n)) || words.has(n.toLowerCase());
  const rows = [];
  for (const [name, v] of Object.entries(spec?.effects || {})) {
    if (name.startsWith("_")) continue;
    const claim = v?.wired, inEngine = named(name);
    if (claim === true && !inEngine) rows.push({ name, claim: "wired", engine: "not named", why: "unbuilt, or the engine calls it something else" });
    else if (claim === false && inEngine) rows.push({ name, claim: "not wired", engine: "named", why: "built after the file was written — the claim is stale" });
  }
  return rows;
}
