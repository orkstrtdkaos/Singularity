// worldmap.js — SNG-046 Layer 1: the data-driven map foundation. Pure helpers the renderMap
// SVG layer composes on top of:
//   • auto-positioning — every location gets stable coords, even the ones authored without
//     map.x/y and the BATCH-9 GENERATED locations minted mid-play (so they appear immediately
//     and never jump between renders).
//   • iconography — a tag-derived glyph + a disposition tint per place (the illustrated upgrade
//     over bare circles).
//   • KG overlay — the codex's known ENTITIES placed near their home node, solid (met) vs
//     dimmed (only heard of) — the "see the things, not just the places" layer.
// All deterministic + headless-testable; no DOM, no rng.

/** Stable integer hash of a string (deterministic — same id always lands the same place). */
function hashN(s) { let h = 0; for (const ch of String(s || "")) h = ((h << 5) - h + ch.charCodeAt(0)) | 0; return Math.abs(h); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Deterministic coords for every location. Authored map.x/y are kept as-is; a location lacking
 *  them is placed near a positioned neighbour (offset by an id-hash angle/distance so it's stable
 *  and doesn't overlap), and any leftover lands on a hash grid. Same input → same output, so a
 *  place never moves between renders. Returns { [id]: {x,y} }. */
export function autoMapPositions(locations, { width = 800, height = 440, margin = 40 } = {}) {
  const out = {};
  const need = [];
  for (const l of locations || []) {
    if (l.map && Number.isFinite(l.map.x) && Number.isFinite(l.map.y)) out[l.id] = { x: l.map.x, y: l.map.y };
    else need.push(l);
  }
  // resolve coordless locations relative to a positioned neighbour, a few passes so chains fill in
  for (let pass = 0; pass < 4 && need.length; pass++) {
    for (let i = need.length - 1; i >= 0; i--) {
      const l = need[i];
      const anchor = (l.connections || []).map(c => out[c]).find(Boolean);
      if (!anchor) continue;
      const h = hashN(l.id);
      const ang = (h % 360) * Math.PI / 180;
      const dist = 55 + (h % 45);
      out[l.id] = { x: clamp(anchor.x + Math.cos(ang) * dist, margin, width - margin), y: clamp(anchor.y + Math.sin(ang) * dist, margin, height - margin) };
      need.splice(i, 1);
    }
  }
  // anything still unplaced (no positioned neighbour): a deterministic hash grid
  for (const l of need) {
    const h = hashN(l.id);
    out[l.id] = { x: margin + (h % (width - 2 * margin)), y: margin + (Math.floor(h / 97) % (height - 2 * margin)) };
  }
  return out;
}

/** Assign a stable coord to a freshly-generated location near its parent, avoiding existing
 *  points. Deterministic from the new id (no rng). Returns {x,y}. */
export function coordForGenerated(newId, parentMap, existing = {}, { width = 800, height = 440, margin = 40 } = {}) {
  const px = Number.isFinite(parentMap?.x) ? parentMap.x : width / 2;
  const py = Number.isFinite(parentMap?.y) ? parentMap.y : height / 2;
  const taken = Object.values(existing);
  const h = hashN(newId);
  for (let k = 0; k < 12; k++) {
    const ang = ((h + k * 47) % 360) * Math.PI / 180;
    const dist = 45 + ((h + k * 13) % 55);
    const x = clamp(px + Math.cos(ang) * dist, margin, width - margin);
    const y = clamp(py + Math.sin(ang) * dist, margin, height - margin);
    if (!taken.some(t => Math.abs(t.x - x) < 24 && Math.abs(t.y - y) < 24)) return { x, y };
  }
  return { x: clamp(px + 30, margin, width - margin), y: clamp(py + 20, margin, height - margin) };
}

// ---------- iconography ----------

// Tag → glyph, most-specific first (the first matching tag wins). Emoji reads at any zoom.
const TAG_ICON = [
  [/shrine|sacred|temple|altar/, "⛩"], [/market|stall|bazaar|trade/, "🏪"],
  [/ruin|remnant|precursor|old.?road/, "🏛"], [/water|river|dock|well|spring/, "💧"],
  [/forge|smith|workshop|craft/, "⚒"], [/forest|wild|grove|wood/, "🌲"],
  [/mountain|height|peak|pass|cliff/, "⛰"], [/farm|field|orchard|mill/, "🌾"],
  [/settle|town|village|hamlet|home/, "🏘"], [/cave|hollow|deep|under/, "🕳"],
  [/churn|unstable|storm|char/, "🌀"], [/waystation|inn|camp|rest/, "🏕"]
];

/** A glyph for a place from its tags (falls back to a generic marker). Pure. */
export function iconForTags(tags = []) {
  const hay = (tags || []).join(" ").toLowerCase();
  for (const [re, glyph] of TAG_ICON) if (re.test(hay)) return glyph;
  return "◈";
}

/** SNG-082: convex hull (Andrew's monotone chain) of a set of {x,y} points, CCW. Pure. */
export function convexHull(points = []) {
  const pts = points.filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y))
    .map(p => ({ x: p.x, y: p.y })).sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length <= 2) return pts;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** A region's terrain SHAPE for the map: the hull of its locations, each vertex pushed OUTWARD from
 *  the centroid by `pad` so the fill wraps the nodes with a soft margin. Returns an array of {x,y}
 *  (a polygon); a 1–2 point region returns null (draw a blob at the point instead). Pure. */
export function regionShape(points = [], pad = 30) {
  const hull = convexHull(points);
  if (hull.length < 3) return null;
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => { const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1; return { x: p.x + dx / d * pad, y: p.y + dy / d * pad }; });
}

/** A disposition tint class from a place's dominant pole — the terrain fill hint. Pure. */
export function terrainClass(location = {}) {
  const pi = location.poleIntensity || {};
  let top = null, mag = 0;
  for (const [pole, v] of Object.entries(pi)) if (Math.abs(v) > mag) { mag = Math.abs(v); top = pole; }
  if (!top || mag < 0.25) return "terrain-neutral";
  return `terrain-${String(top).replace(/[^a-z]/gi, "").toLowerCase()}`;
}

// ---------- KG overlay ----------

/** The known ENTITIES to overlay on the map: codex person-topics placed near their NPC's home
 *  location. `met` (in the npc registry) → discovered (solid); codex-only → heard (dimmed).
 *  positions = autoMapPositions output; npcs = { id: record } (authored + generated). Pure.
 *  Returns [{ entityId, label, x, y, discovered, locationId }]. */
export function kgOverlayEntities(character, positions, npcs = {}) {
  const topics = character?.codex?.topics || {};
  const registry = character?.npcRegistry || {};
  const out = [];
  const placed = new Set();
  for (const t of Object.values(topics)) {
    if (t.kind !== "person" || !t.entityId) continue;
    const npc = npcs[t.entityId] || registry[t.entityId];
    const homeId = npc?.homeLocation;
    const home = homeId && positions[homeId];
    if (!home) continue;
    if (placed.has(t.entityId)) continue;
    placed.add(t.entityId);
    // fan multiple entities around the same node so they don't stack
    const n = out.filter(e => e.locationId === homeId).length;
    const ang = (n * 55 + (hashN(t.entityId) % 40)) * Math.PI / 180;
    out.push({
      entityId: t.entityId, topicId: t.id || t.entityId, label: t.label || t.entityId,
      x: home.x + Math.cos(ang) * 26, y: home.y + Math.sin(ang) * 26,
      discovered: !!registry[t.entityId], locationId: homeId
    });
  }
  return out;
}
