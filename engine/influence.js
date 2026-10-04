/* ⛔ WHOSE GROUND IS THIS — a power's reach evaluated everywhere, the way `engine/field.js` evaluates the substrate:
 * point-first, data in, no canvas anywhere in it. (AEVI B2, 2026-10-04, from her round-1 appendices A and B.)
 *
 * ⛑ IT IS A WORLD FACT, NOT A LENS, which is why it lives here and not in the painter. The GM needs to answer
 * *whose ground is this camp on*; the news needs it; the tick will want it. A reader only a screen can call is a
 * reader the rest of the engine cannot use — this file has that failure written down by name in several places.
 *
 * ⚠️ IMPORTS NOTHING, deliberately, exactly as `field.js` does. The region reader needs a cost surface and a
 * projection, and both are HANDED IN rather than imported: `worldglobe.js` carries terrain, `melee.js` and
 * `worldmap.js` hang off it, and pulling that graph into a pure evaluator to reach two functions is the wrong
 * trade. `worldtick` hands `divert` to `tickStore` for the same reason.
 *
 * TWO READERS, ONE MODEL (CCODE-590, agreed):
 *   • `makeInfluence(...)` — CROW-FLIES, for the GLOBE. Projection-free, so it works under an orthographic
 *     half-world where a screen grid cannot.
 *   • `territoryByGround(...)` — TRAVEL-COST on a grid, for the REGION, over B1's one ground-cost rule. Terrain
 *     bends the borders: a ridge or a coast becomes a border on its own.
 */

const RAD = Math.PI / 180;
/** ⚠️ THE SHORT WAY ROUND. Authored longitudes run unwrapped (the Sunken Choir's 196.25°) while others are
 *  normalised to ±180, and this codebase has now been bitten three times by subtracting them raw — most recently a
 *  road drawn 357° to join two places 3° apart. Every longitude difference in this file goes through here. */
const lonDelta = (a, b) => { let d = a - b; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

/** ⛔ BRING A LONGITUDE INTO A FRAME'S OWN WINDOW. A region extent runs UNWRAPPED (the valley is 232.9 → 270.9)
 *  while an anchor is normalised to ±180 (the Echo Bridge's seat reads −107.9), and the two describe the same
 *  meridian. Shifting by whole turns is the only honest comparison — subtracting them raw is the trap this
 *  codebase has now fallen into four times, most visibly as a road drawn 357° to join two places 3° apart. */
export function inFrame(lon, lo0, lo1) {
  const mid = (lo0 + lo1) / 2;
  let v = Number(lon);
  while (v - mid > 180) v -= 360;
  while (mid - v > 180) v += 360;
  return v;
}

/** How much of a claim each kind of anchor is worth. A seat is the whole of it; a hold is nearly; a place the power
 *  merely *reaches* is a little over half. (Aevi's numbers.) */
export const ANCHOR_WEIGHT = { seat: 1.0, hold: 0.8, reach: 0.55 };
/** Below this, nobody holds the ground — it is wilderness, not a quiet claim. */
export const CLAIM_FLOOR = 0.22;
/** A second claimant within this share of the first makes the ground CONTESTED rather than held. ("Within 15%.") */
export const CONTEST_RATIO = 0.85;

/** ⛔ GROUND OR NETWORK. A sovereignty, a lordship or an outlaw crown HOLDS GROUND and is drawn as territory; a
 *  guild, an order or a road-band holds PEOPLE and ROUTES, and painting one as a country would be a lie about what
 *  it has. (Aevi: "Painting the Undercount as a country would be a lie about what it has.") */
export const TERRITORIAL = new Set(["sovereignty", "lordship", "outlaw_crown"]);
export const isTerritorial = (p) => TERRITORIAL.has(p?.kind);

/** Every head a power can put in the field, summed off its own contingents. */
export function headsOf(p) {
  return (p?.strength?.contingents || []).reduce((a, c) => a + (Number(c?.n) || 0), 0);
}
/** ⛔ DEGREES OF GROUND A POWER PROJECTS, from its own strength.
 *  ⚠️ `1.2 + 0.32·√heads`: a 20-head council reaches **2.63°**, a 160-head legion **5.25°**, the 260-head Grand
 *  Lattice **6.36°**. Aevi's round-1 appendix carried a comment claiming 1.4° and ~4° — the same formula WITHOUT its
 *  1.2 base — and her §5 prose had the right numbers; I flagged it and these are hers, from the prose.
 *  ⛑ The √ compresses hard on purpose: 13× the heads is 2.4× the radius, so a small realm is small without being
 *  invisible and a large one does not swallow the map. */
export function radiusDegOf(p) {
  const n = Math.max(10, headsOf(p));
  return 1.2 + 0.32 * Math.sqrt(n);
}

/** Where a power's claim is anchored: its seat, the places it holds, the places it reaches.
 *  ⚠️ Normalised to ±180 here so every consumer gets one convention; `lonDelta` then makes the comparison safe
 *  whichever convention the CALLER's point arrives in. */
export function anchorsOf(p, locations = {}) {
  const out = [], seen = new Set();
  const add = (id, kind) => {
    const l = locations[id];
    if (!l?.worldPos || seen.has(id + kind)) return;
    seen.add(id + kind);
    const lon = Number(l.worldPos.longitude);
    out.push({ id, kind, w: ANCHOR_WEIGHT[kind], lat: Number(l.worldPos.colatitude) - 90, lon: lon > 180 ? lon - 360 : lon });
  };
  add(p?.seat, "seat");
  for (const h of p?.holds || []) add(h?.at, "hold");
  for (const r of p?.reach || []) if (r !== p?.seat) add(r, "reach");
  return out;
}

/** distance² from a point to the segment a→b, and how far along it that lands (0..1) */
function segDist2(lat, lon, a, b, cl) {
  const bx = lonDelta(b.lon, a.lon) * cl, by = b.lat - a.lat;
  const px = lonDelta(lon, a.lon) * cl, py = lat - a.lat;
  const L2 = bx * bx + by * by;
  let t = L2 ? (px * bx + py * by) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = px - bx * t, qy = py - by * t;
  return { d2: qx * qx + qy * qy, t };
}

/** ⛔ THE CROW-FLIES READER — the GLOBE's, and the one the GM should ask.
 *  Returns `at(lat, lon) → { owner, strength, rival, rivalStrength, contested }`. Pure.
 *  ⛑ Projection-free on purpose: the region reader walks a SCREEN grid, which on an orthographic globe would price
 *  distance through a distorted projection and cannot see the half of the world facing away. */
export function makeInfluence(powers = [], locations = {}) {
  const P = (powers || [])
    .filter(isTerritorial)
    .map((p) => ({ p, id: p.id, anchors: anchorsOf(p, locations), r: radiusDegOf(p) }))
    .filter((x) => x.anchors.length);

  const at = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    let best = null, second = null, b1 = 0, b2 = 0;
    for (const q of P) {
      let v = 0;
      for (const a of q.anchors) {
        const dy = lat - a.lat, dx = lonDelta(lon, a.lon) * cl;
        const d2 = dy * dy + dx * dx;
        // a seat projects the full radius; a hold a little less; a place merely reached, less again
        const rr = q.r * (a.kind === "seat" ? 1 : a.kind === "hold" ? 0.8 : 0.65);
        if (d2 < 9 * rr * rr) v = Math.max(v, a.w * Math.exp(-d2 / (2 * rr * rr)));
      }
      // ⛑ THE ROAD BETWEEN THE SEAT AND A PLACE IT REACHES IS HELD TOO — a realm is connected ground, not a scatter
      // of dots with gaps between them that belong to nobody.
      const seat = q.anchors.find((a) => a.kind === "seat");
      if (seat) for (const a of q.anchors) {
        if (a === seat) continue;
        const far = Math.hypot(a.lat - seat.lat, lonDelta(a.lon, seat.lon) * Math.cos(seat.lat * RAD));
        if (far > 3.2 * q.r) continue;                    // too far to be one realm's corridor
        const { d2, t } = segDist2(lat, lon, seat, a, cl);
        const rr = q.r * 0.5;                              // a corridor is narrower than the places it joins
        const w = 1 - (1 - a.w) * t;                       // and fades toward the far end
        if (d2 < 9 * rr * rr) v = Math.max(v, w * 0.9 * Math.exp(-d2 / (2 * rr * rr)));
      }
      if (v > b1) { b2 = b1; second = best; b1 = v; best = q.id; }
      else if (v > b2) { b2 = v; second = q.id; }
    }
    const held = b1 >= CLAIM_FLOOR;
    return {
      owner: held ? best : null,
      strength: b1,
      rival: b2 >= CLAIM_FLOOR ? second : null,
      rivalStrength: b2,
      contested: held && b2 >= CLAIM_FLOOR && b2 / b1 >= CONTEST_RATIO,
    };
  };
  return { powers: P, at };
}

/* ══════════════ the region reader ══════════════ */

/** a tiny binary heap — the grid is thousands of cells and a linear scan is the difference between 170ms and minutes */
function heap() {
  const k = [], v = [];
  return {
    get size() { return k.length; },
    push(key, val) {
      k.push(key); v.push(val);
      let i = k.length - 1;
      while (i > 0) {
        const pa = (i - 1) >> 1;
        if (k[pa] <= k[i]) break;
        [k[pa], k[i]] = [k[i], k[pa]]; [v[pa], v[i]] = [v[i], v[pa]]; i = pa;
      }
    },
    pop() {
      const key = k[0], val = v[0], lk = k.pop(), lv = v.pop();
      if (k.length) {
        k[0] = lk; v[0] = lv;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1; let m = i;
          if (l < k.length && k[l] < k[m]) m = l;
          if (r < k.length && k[r] < k[m]) m = r;
          if (m === i) break;
          [k[m], k[i]] = [k[i], k[m]]; [v[m], v[i]] = [v[i], v[m]]; i = m;
        }
      }
      return [key, val];
    },
  };
}

/** ⛔ THE TRAVEL-COST READER — the REGION's. Territory spread over the real ground by Dijkstra, so a ridge or a
 *  coast becomes a border without anybody authoring one.
 *
 *  ⚠️ EVERYTHING TERRAIN-SHAPED IS HANDED IN, so this file stays import-free:
 *    `step(aLat, aLon, bLat, bLon)` — B1's `makeGroundCost(...).step`, the ONE ground-cost rule
 *    `toScreen(lon, lat, w, h)` / `toWorld(x, y, w, h)` — the region base's own projection
 *
 *  ⚠️ COSTS IN `Float64Array`, which is Aevi's trap and worth keeping her words for: in `Float32Array` the popped
 *  double compared GREATER than its own stored cost, so the search died at its seeds and drew every realm as a dot.
 */
export function territoryByGround(powers, locations, { W, H, step, toScreen, toWorld, cell = 3, extent = null, pad = 10 } = {}) {
  if (!W || !H || typeof step !== "function" || typeof toScreen !== "function" || typeof toWorld !== "function") {
    return null;
  }
  const gw = Math.ceil(W / cell), gh = Math.ceil(H / cell), N = gw * gh;
  // ⛔ ONLY POWERS THAT ACTUALLY REACH THIS FRAME. Without this every territorial power in the world seeds the
  // grid, and because an off-frame anchor used to be CLAMPED to a corner cell, the Gralloch Crown — seat on the
  // far side of the world — held ground in Erik's valley. Aevi's appendix had this filter and I dropped it when I
  // rewrote her code; the 0% agreement between the two readers is what found it.
  // ⚠️ `inFrame` because an anchor is ±180 and an extent is unwrapped: comparing them raw puts every power either
  // everywhere or nowhere.
  const inBox = (a) => {
    if (!extent) return true;
    const lon = inFrame(a.lon, extent.lo0, extent.lo1);
    const la0 = Math.min(extent.la0, extent.la1), la1 = Math.max(extent.la0, extent.la1);
    const lo0 = Math.min(extent.lo0, extent.lo1), lo1 = Math.max(extent.lo0, extent.lo1);
    return a.lat > la0 - pad && a.lat < la1 + pad && lon > lo0 - pad && lon < lo1 + pad;
  };
  const near = (powers || []).filter(isTerritorial).filter((p) => anchorsOf(p, locations).some(inBox));
  if (!near.length) return null;

  const best = new Float64Array(N), second = new Float64Array(N);
  const bid = new Int16Array(N).fill(-1), sid = new Int16Array(N).fill(-1);
  const cost = new Float64Array(N);
  const world = new Array(N);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      world[y * gw + x] = toWorld(x * cell + cell / 2, y * cell + cell / 2, W, H);
    }
  }

  near.forEach((p, pi) => {
    const R = radiusDegOf(p);
    cost.fill(Infinity);
    const h = heap();
    for (const a of anchorsOf(p, locations)) {
      if (!inBox(a)) continue;
      const aLon = extent ? inFrame(a.lon, extent.lo0, extent.lo1) : a.lon;
      const s = toScreen(aLon, a.lat, W, H);
      // ⛔ AN ANCHOR OUTSIDE THE CANVAS IS STILL REAL — a realm whose seat sits beyond the frame reaches into it,
      // and its radius (2.8–6.4°) is larger than most frames' margins. So it is clamped to the nearest edge cell
      // and CHARGED the real distance from where it truly stands to that cell.
      // ⚠️ My first cut SKIPPED anything past a 4-cell margin while the proximity filter admitted anything within
      // 10°, and the Centre fell straight down the gap: four powers admitted, every anchor skipped, 0% held.
      const cx = Math.max(0, Math.min(gw - 1, Math.floor(s.x / cell)));
      const cy = Math.max(0, Math.min(gh - 1, Math.floor(s.y / cell)));
      const i = cy * gw + cx;
      const here = world[i];
      const cl = Math.cos(((a.lat + here.lat) / 2) * Math.PI / 180);
      const outside = Math.hypot(here.lat - a.lat, lonDelta(here.lon, aLon) * cl);
      // ⛑ AN ANCHOR'S WEIGHT IS A HEAD START, not a multiplier: a seat begins with nothing to pay, a merely-reached
      // place begins already some way out, so the SAME falloff below reads both correctly.
      const c0 = outside + R * Math.sqrt(Math.max(0, -2 * Math.log(a.w)));
      // ⚠️ AND IT SELF-LIMITS: an anchor far enough out that its head start already exceeds the walk's limit seeds
      // a cell the walk abandons at once, which is not-seeding without a second rule to keep in step with the first.
      if (c0 < cost[i]) { cost[i] = c0; h.push(c0, i); }
    }
    const lim = R * 2.6;                      // beyond this the exponential is noise; stop walking
    while (h.size) {
      const [c, i] = h.pop();
      if (c > cost[i] || c > lim) continue;
      const x = i % gw, y = (i / gw) | 0, a = world[i];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
        const j = Y * gw + X, b = world[j];
        const c2 = c + step(a.lat, a.lon, b.lat, b.lon);
        if (c2 < cost[j]) { cost[j] = c2; h.push(c2, j); }
      }
    }
    for (let i = 0; i < N; i++) {
      if (!Number.isFinite(cost[i])) continue;
      const v = Math.exp(-(cost[i] * cost[i]) / (2 * R * R));
      if (v > best[i]) { second[i] = best[i]; sid[i] = bid[i]; best[i] = v; bid[i] = pi; }
      else if (v > second[i]) { second[i] = v; sid[i] = pi; }
    }
  });

  const cellAt = (i) => {
    const held = best[i] >= CLAIM_FLOOR;
    return {
      owner: held && bid[i] >= 0 ? near[bid[i]].id : null,
      strength: best[i],
      rival: second[i] >= CLAIM_FLOOR && sid[i] >= 0 ? near[sid[i]].id : null,
      rivalStrength: second[i],
      contested: held && second[i] >= CLAIM_FLOOR && second[i] / best[i] >= CONTEST_RATIO,
    };
  };
  const area = {};
  for (let i = 0; i < N; i++) { const o = cellAt(i); if (o.owner) area[o.owner] = (area[o.owner] || 0) + 1; }
  return {
    gw, gh, cell, powers: near,
    /** whose ground is this SCREEN point on */
    at: (x, y) => cellAt(Math.min(gh - 1, Math.max(0, Math.floor(y / cell))) * gw
      + Math.min(gw - 1, Math.max(0, Math.floor(x / cell)))),
    cellAt,
    area,
  };
}
