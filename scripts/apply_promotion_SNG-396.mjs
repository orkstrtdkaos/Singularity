// scripts/apply_promotion_SNG-396.mjs — applies Aevi's two ratifications, and ONLY what they say.
//
//   SNG-398 (po/staged_content/hierarchy_rederived_SNG-398.ratified.json)
//     all 65 topology-derived "sites" → tier: settlement. TIER FIELD ONLY. Her words: "connections
//     KEPT — the roads are real; the tier was the lie." parentId is not hers to have changed here and
//     is therefore not touched.
//
//   SNG-396 (po/staged_content/generated_places.promotion.json)
//     14 places play authored → real content at tier: site, PARENT FROM THE FICTION (hers, never
//     re-derived — that is the signal SNG-398 proved topology cannot give), worldPos inherited from
//     the parent because a room is at its building's coordinates, region inherited for the same
//     reason (which independently reproduces every one of her regionFix rulings — checked, not
//     assumed). 3 go to canon instead. 1 merges. 1 is residue and is not promoted.
//
// ⛔ THE FIELD DATA COMES FROM THE SAVES, NOT FROM ME. descriptionSeed, tags and connections are what
// play wrote; inventing prose here would put my voice into her content.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { extractGeneratedPlaces } from "./extract_generated_places.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const locDir = join(root, "content/packs/valley/locations");
const NL = String.fromCharCode(10);
const rj = (p) => JSON.parse(readFileSync(p, "utf8"));

const locs = {};
const fileOf = {};
for (const f of readdirSync(locDir).filter((x) => x.endsWith(".json"))) {
  const l = rj(join(locDir, f)); locs[l.id] = l; fileOf[l.id] = join(locDir, f);
}

// ── SNG-398: the retier ────────────────────────────────────────────────────────────────────────
// ⚠️ IDEMPOTENT BY CONSTRUCTION: a second run must not sweep the sites this script just created
// back into settlements. The retier is Aevi's ruling about the TOPOLOGY-DERIVED tier, so it applies
// only to places that predate the promotion — anything carrying the SNG-396 provenance is a room she
// authored and is explicitly out of scope.
let retiered = 0;
for (const l of Object.values(locs)) {
  if (l.tier !== "site" || String(l.provenance || "").startsWith("SNG-396")) continue;
  l.tier = "settlement";
  writeFileSync(fileOf[l.id], JSON.stringify(l, null, 2) + NL);
  retiered++;
}
console.log(`SNG-398: ${retiered} location(s) retiered site → settlement (connections untouched)`);

// ── SNG-396: the promotion ─────────────────────────────────────────────────────────────────────
const promo = rj(join(root, "po/staged_content/generated_places.promotion.json"));
const saved = {};
for (const p of extractGeneratedPlaces().places) saved[p.id] = p;

// the lore that actually exists, so a generated reference to lore nobody wrote can be dropped
const loreIds = new Set();
try {
  for (const f of readdirSync(join(root, "content/packs/valley/lore")).filter((x) => x.endsWith(".json"))) {
    loreIds.add(f.replace(/\.json$/, ""));
    try { const d = rj(join(root, "content/packs/valley/lore", f)); if (d?.id) loreIds.add(d.id); } catch { /* name is enough */ }
  }
} catch { /* no lore pack */ }

// ⛔ axisVector IS CRASH-REQUIRED — a consumer THROWS without it (SNG-238 §5b), so a promoted place
// missing one is a live crash waiting for the first player to walk in. It is not invented here: the
// rule is read off existing content and MEASURED against all of it: the authored spectrum's values,
// placed at their index in world_node_atlas.axisOrder, zero elsewhere. That reproduces the shipped
// vector byte-for-byte in 106 of 118 locations — including millbrook, whose spectrum yields its exact
// [0,0,0,0.6,-0.5,0.2,0.3,0,0.4,0,0,0]. ⚠️ The other 12 (cairnhold, dw_the_burnscar, spindrift_hollow,
// the_blocklands and 8 more) carry HAND-AUTHORED vectors that deliberately differ from their spectrum,
// which is Aevi's to do — disposition is not always the spectrum. So this is the DEFAULT for a place
// that has none, not a claim that the twelve are wrong.
const AXIS_ORDER = rj(join(root, "content/packs/valley/lore/world_node_atlas.json")).axisOrder;
const axisVectorOf = (spectrum) => AXIS_ORDER.map((a) => Number(spectrum?.[a]) || 0);

const slug = (id) => id.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
const made = [];

/** Build one content location from a save record + Aevi's ruling. Parent-derived fields resolve
 *  through the chain, so a site of a site (her Stillwater's Trouble case) inherits correctly. */
function build(id, ruling, tier, extra = {}) {
  const s = saved[id] || {};
  const parentId = ruling.parentId || extra.parentId || null;
  let anchor = parentId, hops = 0;
  while (anchor && !locs[anchor] && hops++ < 4) anchor = (promo.promote.find((q) => q.id === anchor) || {}).parentId;
  const par = anchor ? locs[anchor] : null;
  const rec = s.record || {};
  const loc = {
    // ⛔ THE SAVE RECORD IS THE BODY OF THE PLACE. The generator authored spectrum, poleIntensity,
    // encounterFlavor, questSeeds and the rest when play created it; promotion MOVES that into content
    // and overlays only what Aevi ruled. Rebuilding a subset by hand is how a promoted place arrives
    // schema-invalid and half-mute — which is exactly what my first pass did.
    ...rec,
    schemaVersion: rec.schemaVersion || 1,
    id,
    name: ruling.name || s.name || id,
    regionId: par?.regionId || s.regionId || "valley",
    communityId: rec.communityId || s.communityId || par?.communityId || (par?.regionId || "valley") + "." + (anchor || "unplaced"),
    tags: s.tags?.length ? s.tags : ["authored-in-play"],
    connections: (s.placeEdges || []).filter((c) => locs[c] || promo.promote.some((q) => q.id === c)),
    descriptionSeed: s.descriptionSeed || ruling.why || "A place the road led to.",
    // ⚠️ A GENERATED loreRef POINTS AT LORE THE GENERATOR IMAGINED. `radiant_plateau_culture` is a
    // file nobody wrote; carrying it forward makes the place lore-BLIND (it references only lore that
    // cannot resolve) which is worse than referencing none. Keep the ones that resolve, drop the rest.
    loreRefs: (Array.isArray(rec.loreRefs) ? rec.loreRefs : []).filter((r) => loreIds.has(String(r))),
    // ⚠️ the generator writes encounterFlavor as a LIST of lines; content holds one string.
    encounterFlavor: Array.isArray(rec.encounterFlavor) ? rec.encounterFlavor.join(" ") : (rec.encounterFlavor || ""),
    questSeeds: rec.questSeeds || [],
    poleIntensity: Number.isFinite(rec.poleIntensity) ? rec.poleIntensity : (par?.poleIntensity ?? 0.5),
    spectrum: rec.spectrum || par?.spectrum || {},
    axisVector: axisVectorOf(rec.spectrum || par?.spectrum),
    axisVectorNote: "Derived from the authored spectrum against world_node_atlas.axisOrder (SNG-180). Disposition — what this place IS. Distinct from world position.",
    // ⚠️ `map` IS A RENDER LAYOUT, NOT GEOGRAPHY (gated as such since SNG-383), so a room inheriting
    // its building's card position is honest — they ARE the same point on a layout that means nothing
    // geographic. The globe reads worldPos; this only keeps the legacy card table well-formed.
    map: par?.map ? { ...par.map } : { x: 0, y: 0 },
    ...extra,
    tier,
    parentId,
    // ⚠️ worldPos INHERITED, never invented: a room is at its building's coordinates, which is also
    // what makes these pass the SNG-398 distance rule at 0 days rather than by luck.
    ...(par?.worldPos ? { worldPos: { ...par.worldPos } } : {}),
    worldPosNote: par ? `inherited from ${anchor} — SNG-396: a room is at its building's coordinates` : "unplaced",
    // ⛔ MACHINE-READABLE, because two derivations depend on knowing this position is a DUPLICATE and
    // not an observation: the terrain seed list (a room must not cast a second biome vote at its
    // building's point) and the region-spread statistic (a distance-0 pair shrinks the ruler and strands
    // four innocent locations). A prose note cannot carry that weight.
    ...(par?.worldPos ? { worldPosInherited: true } : {}),
    provenance: `SNG-396 — authored in play, promoted from the saves. ${ruling.why || ""}${
      id === "gen-the-made-gate" ? " ⛔ SNG-148 established the waygate network as INHERITED infrastructure; this is the first gate BUILT, cut at the Crossing by a wright who tends endings. A player broke that premise and the canon now records it." : ""}`.trim(),
  };
  writeFileSync(join(locDir, slug(id) + ".json"), JSON.stringify(loc, null, 2) + NL);
  locs[id] = loc;
  made.push(`${id} → ${tier}${parentId ? " of " + parentId : ""}`);
  return loc;
}

// canon first — two promoted sites depend on them existing
for (const c of promo.canonNotSites) {
  const hint = { "gen-the-made-gate": "the_crossing", "gen-watershed-road": "millbrook", "gen-disputed-zone-far-side": "disputed_zone_fringe" }[c.id];
  const extra = c.id === "gen-the-made-gate"
    // ⛔ SNG-148 SAID THE GATES ARE INHERITED INFRASTRUCTURE. A player cut this one. The flag is what
    // puts it in the network; the note is what stops the next reader assuming it was always there.
    // ⚠️ the claim goes in `provenance`, NOT `loreRefs` — loreRefs resolve to FILES, so a sentence
    // there is a dangling reference by construction and the lore-blindness gate caught it immediately.
    ? { waygate: true, role: "gate" }
    : {};
  build(c.id, { ...c, parentId: hint }, "settlement", extra);
}
// ⚠️ ORDER: a site whose parent is another promoted site must be written after it.
const ordered = [...promo.promote].sort((a, b) =>
  (String(a.parentId).startsWith("gen-") ? 1 : 0) - (String(b.parentId).startsWith("gen-") ? 1 : 0));
for (const p of ordered) build(p.id, p, p.tier || "site");

// ⚠️ THE TWO SNG-397 PLACES HAVE NO SAVE RECORD — they were reconstructed from gen-object-object's
// memories, so they arrive with no edges at all and the reachability gate correctly calls them
// unreachable. Their parent hint IS the edge play describes ("past the shimmer" from the fringe; the
// relay chain running from the mill gate), so the door is opened there and nowhere invented.
for (const id of ["gen-disputed-zone-far-side", "gen-watershed-road"]) {
  const l = locs[id]; if (!l || l.connections?.length) continue;
  l.connections = [l.parentId];
  writeFileSync(join(locDir, slug(id) + ".json"), JSON.stringify(l, null, 2) + NL);
}

// the merge: one district, two ids — the loser becomes an alias, never a second place
const aliases = {};
for (const m of promo.merge || []) aliases[m.from] = m.into;
if (Object.keys(aliases).length) {
  const path = join(root, "content/packs/valley/location_aliases.json");
  const prior = existsSync(path) ? rj(path) : {};
  writeFileSync(path, JSON.stringify({ ...prior, ...aliases }, null, 2) + NL);
  console.log(`SNG-396: ${Object.keys(aliases).length} alias(es) recorded — ${Object.entries(aliases).map(([a, b]) => a + " → " + b).join(", ")}`);
}
// ⛔ EVERY PROMOTED EDGE MUST BE WALKABLE BOTH WAYS. The saves record the edge from the room's side
// only — a player walked IN — so promoting it verbatim builds a one-way door and the reachability gate
// reads it exactly as it plays: "a player who walks in is trapped."
let backEdges = 0;
for (const l of Object.values(locs)) {
  if (!String(l.provenance || "").startsWith("SNG-396")) continue;
  for (const c of l.connections || []) {
    const t = locs[c]; if (!t) continue;
    t.connections = t.connections || [];
    if (t.connections.includes(l.id)) continue;
    t.connections.push(l.id);
    writeFileSync(fileOf[t.id] || join(locDir, slug(t.id) + ".json"), JSON.stringify(t, null, 2) + NL);
    backEdges++;
  }
}
console.log(`SNG-396: ${backEdges} reciprocal edge(s) added — a promoted door opens both ways`);
console.log(`SNG-396: ${made.length} location(s) written`);
for (const m of made) console.log("  " + m);
