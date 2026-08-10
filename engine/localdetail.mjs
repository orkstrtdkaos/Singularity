// engine/localdetail.mjs — SNG-404. THE LOCAL DETAILING ENGINE.
//
// Erik: "the results of a few authorings should probably be the basis for a local detailing engine so
// that any place gets this treatment and new (discovered, minted, created) places do as well."
//
// ⛔ THE WORLD LAYER HAS NOTHING AT THIS SCALE AND THAT IS THE WHOLE DESIGN PROBLEM. The terrain
// generator's finest feature is ~0.3° ≈ 33 km; a village spans ~0.01° ≈ 1 km. So a local map is not a
// further zoom of the world — it is a new layer. ⚠️ But it is not invented either: the world layer
// supplies the DIRECTIONS, and every placement is made against one of them.
//
// ⛔ THE PRECEDENCE ORDER IS AEVI'S, DERIVED FROM MEASURING EIGHT AUTHORED LAYOUTS — four Valley towns
// that agreed, and four contrast towns chosen to break them, which they did in four different ways:
//   1 · STRONG GRADIENT   river bearing · uphill bearing (only above a relief threshold) · roads
//   2 · THE PLACE'S OWN PROSE   "the village well and the river dock are the two centres of daily life"
//   3 · THE TRADITION'S AESTHETIC   when no gradient is usable, the people decide the plan
//   4 · NOTHING   emit FEWER sites. "A town with three well-reasoned places beats a town with eight
//       invented ones."
//
// ⚠️ EVERY PLACEMENT CITES ITS SOURCE. Her §4: "a generated placement that cannot cite a gradient or a
// line of prose is decoration, and should be dropped rather than shipped."

const R = Math.PI / 180;
const norm180 = (d) => ((d + 540) % 360) - 180;

/** Great-circle distance in degrees between two [lat, lon] points. */
export function degBetween(a, b) {
  const la1 = a[0] * R, la2 = b[0] * R, dl = (a[1] - b[1]) * R;
  return Math.acos(Math.max(-1, Math.min(1,
    Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(dl)))) / R;
}

/** ⚠️ INITIAL BEARING, and the convention is Aevi's: 0 = up-map (toward +lat), 90 = east. That is the
 *  same frame the world map draws in — `lat = colatitude - 90` — so a bearing read off her layouts and a
 *  bearing measured here mean the same direction on the same picture. */
export function bearingBetween(from, to) {
  const la1 = from[0] * R, la2 = to[0] * R, dl = (to[1] - from[1]) * R;
  const y = Math.sin(dl) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl);
  return norm180(Math.atan2(y, x) / R);
}

/** The nearest traced river to a point: its bearing and its distance in degrees.
 *  ⚠️ Returns the nearest VERTEX of any traced polyline — not the nearest river's midpoint — because a
 *  town sits on a REACH, not on a river's average position. */
export function nearestRiver(pos, hydrology) {
  let best = null;
  for (const path of (hydrology?.rivers || [])) {
    for (const pt of path) {
      const d = degBetween(pos, pt);
      if (!best || d < best.distanceDeg) best = { distanceDeg: d, at: pt };
    }
  }
  if (!best) return null;
  return { bearing: Math.round(bearingBetween(pos, best.at)), distanceDeg: Math.round(best.distanceDeg * 100) / 100 };
}

/** ⛔ THE UPHILL BEARING AND — THE PART THAT DECIDES WHETHER IT MAY BE USED AT ALL — THE RELIEF MAGNITUDE.
 *  Sample the generator's raw elevation in a ring around the point; the highest sample gives the
 *  direction, and the spread across the ring says whether the direction means anything.
 *  ⚠️ Aevi measured 0.002 at Greywater Stilts (flat: "uphill is NOISE on flat ground") against 0.541 at
 *  Kindlerow (dominant). The threshold between them is a DIAL, and §2 asks for it tuned against the
 *  eight rather than taken from her provisional 0.05. */
export function uphillOf(pos, terrainFn, { radiusDeg = 0.4, samples = 24 } = {}) {
  if (typeof terrainFn !== "function") return null;
  const conv = Math.max(0.12, Math.cos(pos[0] * R));
  let hi = null, lo = null, sum = 0, n = 0;
  for (let i = 0; i < samples; i++) {
    const b = (i / samples) * 360;
    const lat = pos[0] + radiusDeg * Math.cos(b * R);
    const lon = pos[1] + (radiusDeg * Math.sin(b * R)) / conv;
    const raw = terrainFn(lon, Math.max(-89.9, Math.min(89.9, lat)))?.raw;
    if (!Number.isFinite(raw)) continue;
    sum += raw; n++;
    if (!hi || raw > hi.raw) hi = { raw, bearing: b };
    if (!lo || raw < lo.raw) lo = { raw, bearing: b };
  }
  if (!n || !hi || !lo) return null;
  return {
    bearing: Math.round(norm180(hi.bearing)),
    // the spread across the ring IS the relief: how much higher the high side is than the low
    relief: Math.round((hi.raw - lo.raw) * 1000) / 1000,
    mean: sum / n,
  };
}

/** Road bearings out of a place, from its connections' own positions. */
export function roadsOut(loc, locations) {
  const from = [loc.worldPos.colatitude - 90, loc.worldPos.longitude];
  const out = [];
  for (const id of loc.connections || []) {
    const t = locations?.[id];
    if (!t?.worldPos) continue;
    out.push({ to: id, bearing: Math.round(bearingBetween(from, [t.worldPos.colatitude - 90, t.worldPos.longitude])) });
  }
  return out;
}

/** Everything the world already knows about this place's surroundings — the input to every placement. */
export function measureGradients(loc, { locations, hydrology, terrainFn } = {}) {
  if (!loc?.worldPos) return null;
  const pos = [loc.worldPos.colatitude - 90, loc.worldPos.longitude];
  const river = nearestRiver(pos, hydrology);
  const up = uphillOf(pos, terrainFn);
  return {
    riverBearing: river?.bearing ?? null,
    riverDistanceDeg: river?.distanceDeg ?? null,
    uphillBearing: up?.bearing ?? null,
    relief: up?.relief ?? null,
    roadsOut: roadsOut(loc, locations),
  };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// ⛔ THE THRESHOLD, TUNED AGAINST THE EIGHT AS ASKED — AND THE TUNING FOUND THE MODEL WAS WRONG.
//
// Aevi's §2 proposes one dial: a gradient is usable above a relief cut, provisionally 0.05, "and I want
// it TUNED against the eight rather than taken from me — I have eight samples, not a distribution."
// Tuned, on the reliefs this module measures:
//
//    greywater_stilts    0.012  uphill NOT used   "uphill is NOISE on flat ground"
//    echo_river_crossing 0.022  uphill USED       "The Granite Shoulders — on the measured uphill"
//    millbrook           0.041  uphill USED       "'climb the lower slopes' — on the MEASURED bearing"
//    the_service_ways    0.048  not used          (underground: depth, not radius)
//    greyhearth          0.236  uphill USED       "UPHILL, on the measured bearing — drainage"
//    the_figure_works    0.268  uphill NOT used   "no usable gradient at all — the TRADITION carried it"
//    kindlerow           0.645  uphill USED       relief dominates
//    the_cogitarium      1.043  uphill USED
//
// ⛔ NO SINGLE CUT REPRODUCES THAT COLUMN. greyhearth USED uphill at 0.236 and the Figure Works did NOT
// at 0.268 — the unused case has the HIGHER relief. And her provisional 0.05 would have disqualified
// millbrook (0.041) and echo (0.022), both of which she placed on the measured uphill herself.
//
// ⚠️ WHAT THE CORPUS ACTUALLY SHOWS: the gradient is chosen by WHAT THE SITE IS, not by which gradient
// is strongest. A burying ground goes uphill because it needs DRAINAGE. A dock goes riverward because it
// needs WATER. A gate sits on a road because a road is what it opens onto. The Figure Works ignored a
// perfectly good slope because a working hall, a proving yard and a containment ring need no slope —
// their tradition lays them on a figure. Relief does not select the gradient; the SITE does.
//
// ⚠️ So relief keeps a narrower job: whether uphill EXISTS as an answer at all. On this module's scale
// the corpus offers exactly one negative — greywater at 0.012 — against a lowest positive of 0.022, so
// the cut goes between them. ⛔ REPORTED, NOT RATIFIED: it rests on ONE negative example, and Erik and
// Aevi own the number. The gate asserts that whatever the number is, it still separates her eight.
export const RELIEF_USABLE = 0.018;

/** Which of the world's gradients this place may actually be laid out against. */
export function usableGradients(measured) {
  if (!measured) return { river: null, uphill: null, roads: [] };
  return {
    // ⚠️ a river you cannot see is not a gradient. Millbrook's is 0.27° away and dictates its dock;
    // Kindlerow's nearest water is 9° — a thousand km — and its forge had to dig a cistern instead.
    river: measured.riverDistanceDeg != null && measured.riverDistanceDeg <= 1.5
      ? { bearing: measured.riverBearing, distanceDeg: measured.riverDistanceDeg } : null,
    uphill: measured.relief != null && measured.relief >= RELIEF_USABLE
      ? { bearing: measured.uphillBearing, relief: measured.relief } : null,
    roads: measured.roadsOut || [],
  };
}

/** ⛔ THE VOCABULARY IS HERS, NOT MINE. I first invented six words for this; Aevi then shipped `basis`
 *  on all thirty-eight sites (db13ac4d) with nine — and hers is the one with worked examples behind every
 *  entry, so it wins outright. Two of hers I had no branch for at all: `anti-uphill` (a thing placed by
 *  the slope it AVOIDS) and `between` (a thing placed by the two places it sits on the walk between).
 *  ⚠️ `prose` and `inferred` are not geometry — they are placements her own reading produced, and the
 *  engine takes them as given rather than pretending to re-derive them. */
export const SITE_BASES = ["centre", "river", "uphill", "anti-uphill", "road", "anti-road", "between", "tradition", "prose", "inferred"];
/** the older names, kept so a caller written against the first draft still resolves */
const BASIS_ALIAS = { water: "river", height: "uphill", apart: "anti-road", depth: "road" };

/** Place one site against the measured frame. Returns null when nothing licenses a placement, which is
 *  the fourth branch of her precedence order: emit FEWER sites rather than invent one.
 *  ⚠️ `why` is never optional. Her §4: "a generated placement that cannot cite a gradient or a line of
 *  prose is decoration, and should be dropped rather than shipped." */
export function placeSite(site, gradients, opts = {}) {
  const { radiusMetres = 400, index = 0, traditionFigure = null, between = null } = opts;
  const raw0 = (site && (site.basis || site.need)) || null;
  const need = SITE_BASES.includes(raw0) ? raw0 : (BASIS_ALIAS[raw0] || null);
  const near = Math.round(radiusMetres * 0.55), far = Math.round(radiusMetres * 0.8);

  if (need === "centre") return { bearing: 0, metres: 0, why: "the centre — what the place is organised around" };

  if (need === "river") {
    if (!gradients.river) return null;                    // no water: the Kindlerow case, and it must not be faked
    return { bearing: gradients.river.bearing, metres: near,
      why: "on the measured river bearing (" + gradients.river.bearing + "°, nearest water " + gradients.river.distanceDeg + "°)" };
  }
  if (need === "uphill") {
    if (!gradients.uphill) return null;                   // flat ground: the Greywater case
    return { bearing: gradients.uphill.bearing, metres: near,
      why: "on the measured uphill bearing (" + gradients.uphill.bearing + "°, relief " + gradients.uphill.relief + ")" };
  }
  if (need === "road") {
    // ⛔ A ROAD BASIS NEEDS TO KNOW *WHICH* ROAD, and measuring the corpus is what proved it: replaying
    // Aevi's own 38 placements through this placer, every basis that names a unique direction reproduced
    // her bearing exactly (uphill 0°, prose 0°, anti-uphill 0°, river 11°) and every basis needing a
    // REFERENT missed — road 58° median across FOURTEEN placements, the most common basis in the corpus.
    // ⚠️ Her data records which road only in the `why` prose ("On the Crossing road"), and reading that
    // back with a pattern is the regex-over-prose she forbade. So the referent is a FIELD: `toward`.
    // Without one this falls back to cycling, which is a guess and is marked as one in the reason.
    const named = site && site.toward ? gradients.roads.find((r) => r.to === site.toward) : null;
    const road = named || gradients.roads[index % Math.max(1, gradients.roads.length)];
    if (!road) return null;
    return { bearing: road.bearing, metres: far,
      why: named ? "on the road to " + road.to + " (bearing " + road.bearing + "°)"
        : "on a road out (" + road.to + ", bearing " + road.bearing + "°) — ⚠️ no `toward` given, so WHICH road is a guess" };
  }
  if (need === "anti-road") {
    // ⚠️ AWAY FROM EVERY ROAD, not merely "somewhere else" — the Deep Platforms are placed by what they
    // are avoiding. Take the widest gap in the road bearings and sit in the middle of it.
    const bs = gradients.roads.map((r) => ((r.bearing % 360) + 360) % 360).sort((a, b) => a - b);
    if (!bs.length) return null;
    let bestMid = null, bestGap = -1;
    for (let i = 0; i < bs.length; i++) {
      const a = bs[i], b2 = bs[(i + 1) % bs.length] + (i + 1 === bs.length ? 360 : 0);
      const gap = b2 - a;
      if (gap > bestGap) { bestGap = gap; bestMid = norm180(a + gap / 2); }
    }
    return { bearing: Math.round(bestMid), metres: far,
      why: "in the widest gap between the roads (" + Math.round(bestGap) + "° clear) — placed by what it keeps away from" };
  }
  if (need === "anti-uphill") {
    // ⚠️ PLACED BY THE SLOPE IT AVOIDS. Millbrook's fields take the flat, and "the flat" is only
    // definable once you know which way is up — so this needs the same gradient the terraces used, read
    // in the opposite sense. Without a usable slope there is no "away from it" either.
    if (!gradients.uphill) return null;
    return { bearing: Math.round(norm180(gradients.uphill.bearing + 180)), metres: near,
      why: "away from the measured uphill (" + gradients.uphill.bearing + "°) — the flat ground is defined by the slope it is not on" };
  }
  if (need === "between") {
    // ⚠️ ON THE WALK BETWEEN TWO PLACES — the Singers' Hall sits between the hearth and the burying
    // grounds because that is the route people take. Needs the two it is between; there is no such thing
    // as "between" in the abstract.
    // ⚠️ same shape as `road`: "between" is meaningless without saying between WHAT. An explicit pair
    // wins; the last two placed is a fallback and says so.
    const pair = (site && Array.isArray(site.betweenPlaced) && site.betweenPlaced.length >= 2)
      ? site.betweenPlaced : between;
    if (!pair || pair.length < 2) return null;
    const [a, b2] = pair;
    const mid = norm180(a.bearing + norm180(b2.bearing - a.bearing) / 2);
    return { bearing: Math.round(mid), metres: Math.round((a.metres + b2.metres) / 2),
      why: "on the walk between two placed sites (" + a.bearing + "° and " + b2.bearing + "°)" };
  }
  if (need === "depth") {
    // ⛔ THE SERVICE WAYS BROKE THE HORIZONTAL FRAME ENTIRELY: a tunnel network has depth, not a radius.
    const road = gradients.roads[index % Math.max(1, gradients.roads.length)];
    return { bearing: road ? road.bearing : 0, metres: radiusMetres * (1 + index), level: -(index + 1),
      why: road ? "underground, entered from the " + road.to + " road — depth is the frame, not radius"
        : "underground — depth is the frame, not radius" };
  }

  // ⚠️ NOTHING LICENSED IT. When no gradient answers and no tradition figure is given, the honest output
  // is no output: "a town with three well-reasoned places beats a town with eight invented ones."
  // ⚠️ `prose` and `inferred` arrive already placed — her reading produced them and the engine must not
  // overrule a bearing a person derived from the text. Pass them through with their citation intact.
  if ((need === "prose" || need === "inferred") && site && site.localMap) {
    return { bearing: site.localMap.bearing, metres: site.localMap.metres, level: site.localMap.level,
      why: site.why || "placed from the location's own prose" };
  }
  if (need === "tradition" && !traditionFigure) return null;
  if (!traditionFigure) return null;
  // the tradition carries the layout — the Figure Works case: a figure has n points, evenly divided
  const n = Math.max(2, traditionFigure.points || 3);
  return { bearing: Math.round(norm180((360 / n) * index)), metres: near,
    why: "on the " + (traditionFigure.name || "tradition") + "'s figure — " + n + " points, no usable gradient to answer to" };
}

/** ⛔ METRES, NOT DEGREES, and her conversion exactly: a village is 400–800 m across and degrees at that
 *  scale are unreadable. `level` rides through untouched — the Cogitarium's entrance hall and third
 *  terrace share a footprint and only depth tells them apart. */
export function localToWorld(parentWorldPos, localMap) {
  if (!parentWorldPos || !localMap) return null;
  const lat = parentWorldPos.colatitude - 90;
  const dLat = (localMap.metres * Math.cos(localMap.bearing * R)) / 111320;
  const dLon = (localMap.metres * Math.sin(localMap.bearing * R)) / (111320 * Math.max(0.02, Math.cos(lat * R)));
  return {
    colatitude: parentWorldPos.colatitude + dLat,
    longitude: ((parentWorldPos.longitude + dLon + 540) % 360) - 180,
    depth: (parentWorldPos.depth || 0) + (localMap.level || 0),
  };
}
