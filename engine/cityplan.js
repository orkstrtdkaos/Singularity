/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
 * cityplan.js — A HUB DRAWN AS A CITY, laid out from its own data
 *
 * ✅ ERIK, 2026-10-04, on seeing the polar Crossing in the game: *"really bad"*, and then *"Can we make it look
 * like a big city with these places laid out?"*
 *
 * ⛔ WHY THE GROUND HAD TO GO. The Crossing is about one degree across, and the terrain's information floor is
 * 0.25° — so the concentric rings and radial seams he saw were the generator meeting the pole, not ground. There
 * is nothing down there to draw. A city is not a fallback for that: it is what the place actually is.
 *
 * ⛑ THE PROJECTION STAYS (C1's azimuthal: bearing is longitude, distance is colatitude), because the plan rests
 * on it — every road still leaves on its true bearing, every gate still points where it really points. What
 * changes is the RADIUS, which is log-scaled so a city 0.5° across fills a frame instead of being a dot.
 *
 * ⚠️ PURE AND IMPORT-FREE. It returns where things go; the painter decides what they look like. And it is
 * SEEDED, so the same city is the same city on every repaint — streets that reshuffled between paints would
 * read as a town rebuilding itself while you watched.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;

/** A deterministic 0..1 from integers — the whole fabric hangs off this, so the city holds still. */
function rnd(a, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const strSeed = (s) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
};

/** ⛔ AEVI X1 — the radius rule, in her own form: `r_hall + (R_wall − pad)·ln(1 + ρ/0.06) / ln(1 + ρ_max/0.06)`.
 *  ⛑ LOG-SCALED BECAUSE A CITY IS NOT A MAP OF ITSELF. Linear, the hall's own precinct (ρ 0.04) and the Coliseum
 *  (ρ 0.42) sit a tenth of the frame apart and everything near the middle piles up; logged, the near places get
 *  the room they need to be distinguishable and the far ones still read as far. */
export function cityRadius(rho, { rHall = 34, wallR = 300, pad = 26, rhoMax = 0.5, knee = 0.06 } = {}) {
  const span = Math.max(1, wallR - pad - rHall);
  const top = Math.log(1 + Math.max(1e-9, rhoMax) / knee);
  if (!(top > 0)) return rHall;
  return rHall + span * Math.log(1 + Math.max(0, rho) / knee) / top;
}

/** ⛔ THE PLAN. `places` are `{ id, name, rho, bearingDeg, tier }` — the caller has already read the projection,
 *  so this stays free of worldPos and of any opinion about where north is on a screen.
 *
 *  Returns everything positioned, in canvas pixels, with the hall at the centre. */
export function cityPlan(places, {
  W = 800, H = 520, wallFrac = 0.42, pad = 26, rHall = 34, hallId = null,
  roadsOut = [], gates = [], seed = "city", wardR = 62, relaxPasses = 60,
} = {}) {
  const cx = W / 2, cy = H / 2;
  const wallR = Math.min(W, H) * wallFrac;
  const rhoMax = Math.max(0.0001, ...places.map((p) => Number(p.rho) || 0));
  const S = strSeed(seed);
  // screen bearing: 0° is up, clockwise — the same convention C1's toScreen uses, so a road leaves the city
  // pointing where it leaves the world
  const atBearing = (deg, r) => ({ x: cx + Math.sin(deg * Math.PI / 180) * r, y: cy - Math.cos(deg * Math.PI / 180) * r });

  // ---- the marks ----
  // ⚠️ THE WARD RING. Three of the Crossing's places sit at colatitude 0 — they ARE the hub, and a projection
  // that is honest about that stacks them all on one pixel. Aevi X1: *"places at colatitude 0 sit on a small
  // ward ring at the bearing their names give, not stacked on the hall."*
  const atPole = places.filter((p) => (Number(p.rho) || 0) < 1e-6 && p.id !== hallId);
  const marks = [];
  for (const p of places) {
    const rho = Number(p.rho) || 0;
    if (p.id === hallId) { marks.push({ ...p, x: cx, y: cy, r: 0, hall: true }); continue; }
    if (rho < 1e-6) {
      // fanned around their own bearing so they are separable, rather than stacked on one pixel
      const i = atPole.indexOf(p);
      const spread = atPole.length > 1 ? 44 : 0;
      const b = (Number(p.bearingDeg) || 0) - spread / 2 + (atPole.length > 1 ? (i / (atPole.length - 1)) * spread : 0);
      const q = atBearing(b, wardR);
      marks.push({ ...p, x: q.x, y: q.y, r: wardR, ward: true });
      continue;
    }
    const r = cityRadius(rho, { rHall, wallR, pad, rhoMax });
    const q = atBearing(Number(p.bearingDeg) || 0, r);
    marks.push({ ...p, x: q.x, y: q.y, r });
  }

  // ⛑ DRAWING-ONLY RELAXATION (X1): footprints push apart until they do not overlap. The hall is fixed and the
  // wall is a limit. ⚠️ THE DATA NEVER MOVES — this is the cluster rule's job at city scale, and the hover and
  // the click still resolve to the place that was authored.
  const foot = (m) => (m.hall ? 46 : m.big ? 40 : 24);
  for (let pass = 0; pass < relaxPasses; pass++) {
    let moved = 0;
    for (let i = 0; i < marks.length; i++) {
      const a = marks[i];
      if (a.hall) continue;
      for (let j = 0; j < marks.length; j++) {
        if (i === j) continue;
        const b = marks[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const want = foot(a) + foot(b);
        if (d >= want) continue;
        const push = (want - d) * (b.hall ? 0.5 : 0.25);
        a.x += (dx / d) * push; a.y += (dy / d) * push;
        moved++;
      }
      // kept inside the wall, and never on top of the hall
      const dr = Math.hypot(a.x - cx, a.y - cy);
      const lim = wallR - pad * 0.6;
      if (dr > lim) { a.x = cx + (a.x - cx) * lim / dr; a.y = cy + (a.y - cy) * lim / dr; }
      if (dr < rHall + 14) { const k = (rHall + 14) / (dr || 0.001); a.x = cx + (a.x - cx) * k; a.y = cy + (a.y - cy) * k; }
    }
    if (!moved) break;
  }
  for (const m of marks) m.r = Math.hypot(m.x - cx, m.y - cy);

  // ---- the avenues: one per road out, through its own gate in the wall ----
  // ⛔ AEVI: *"The roads are the city's AVENUES, from the hall out through their gates to the foothill labels on
  // the outer ring."* Twelve roads, twelve gates — the wall is not decoration, it is where the roads leave.
  const rimR = Math.min(W, H) * 0.5 - 12;
  const avenues = (roadsOut || []).map((road) => {
    const b = Number(road.bearingDeg) || 0;
    return { ...road, bearingDeg: b, gate: atBearing(b, wallR), rim: atBearing(b, rimR), from: { x: cx, y: cy } };
  }).sort((a, b) => a.bearingDeg - b.bearingDeg);

  // ---- the gate ring: poles the Axis Gate reaches, at their TRUE bearing, outside the wall ----
  // ⛑ ROADS GO TO FOOTHILLS, GATES GO TO POLES, and the map shows that split rather than drawing both as lines.
  const gateR = Math.min(W, H) * 0.5 - 30;
  const poleRing = (gates || []).map((g) => {
    const b = Number(g.bearingDeg) || 0;
    return { ...g, bearingDeg: b, ...atBearing(b, gateR) };
  }).sort((a, b) => a.bearingDeg - b.bearingDeg);

  // ---- the fabric: ring streets, blocks, roofs ----
  const fabric = cityFabric({ cx, cy, wallR, rHall, marks, avenues, seed: S, foot });

  return { cx, cy, wallR, rimR, rHall, rhoMax, marks, avenues, poleRing, fabric, atBearing };
}

/** ⛔ AEVI X2 — the city fabric, generated and seeded: *"ring streets at fixed radii; blocks between ring streets
 *  and avenues, cut by minor radials about every 34px; each block split into one to three roofs, an occasional
 *  garden, an occasional courtyard. No block inside a landmark's footprint."*
 *
 *  ⚠️ NOTHING IS HAND-PLACED. Every block here is derived from the ring it sits in and the avenues either side of
 *  it, so a new road out moves the blocks around it and the city stays consistent with its own data. */
export function cityFabric({ cx, cy, wallR, rHall, marks = [], avenues = [], seed = 1, foot = () => 26 } = {}) {
  const rings = [];
  const first = rHall + 46;
  for (let r = first; r < wallR - 16; r += 44) rings.push(r);
  const bearings = avenues.length
    ? avenues.map((a) => a.bearingDeg).slice().sort((x, y) => x - y)
    : [0, 60, 120, 180, 240, 300];
  const blocked = marks.filter((m) => !m.hall).map((m) => ({ x: m.x, y: m.y, r: foot(m) + 6 }));
  const clearOf = (x, y) => !blocked.some((b) => Math.hypot(x - b.x, y - b.y) < b.r)
    && Math.hypot(x - cx, y - cy) > rHall + 20;

  const blocks = [];
  for (let ri = 0; ri < rings.length - 1; ri++) {
    const r0 = rings[ri], r1 = rings[ri + 1];
    for (let bi = 0; bi < bearings.length; bi++) {
      const a0 = bearings[bi];
      const a1 = bi + 1 < bearings.length ? bearings[bi + 1] : bearings[0] + 360;
      const sweep = a1 - a0;
      if (sweep <= 0.5) continue;
      // minor radials about every 34px at this ring's radius, so blocks stay block-sized at any distance
      const arc = (sweep / 360) * TAU * ((r0 + r1) / 2);
      const cuts = Math.max(1, Math.round(arc / 34));
      for (let ci = 0; ci < cuts; ci++) {
        const s0 = a0 + (ci / cuts) * sweep + 1.2, s1 = a0 + ((ci + 1) / cuts) * sweep - 1.2;
        if (s1 <= s0) continue;
        const mid = (s0 + s1) / 2, rm = (r0 + r1) / 2;
        const mx = cx + Math.sin(mid * Math.PI / 180) * rm, my = cy - Math.cos(mid * Math.PI / 180) * rm;
        if (!clearOf(mx, my)) continue;                       // ⛔ no block inside a landmark's footprint
        const k = rnd(seed, ri * 97 + bi, ci);
        const kind = k < 0.08 ? "garden" : k < 0.15 ? "courtyard" : "roofs";
        const roofs = kind === "roofs" ? 1 + Math.floor(rnd(seed + 7, ri * 31 + bi, ci) * 3) : 0;
        blocks.push({ r0: r0 + 3, r1: r1 - 3, a0: s0, a1: s1, kind, roofs,
          seed: (seed + ri * 1301 + bi * 17 + ci) >>> 0 });
      }
    }
  }
  return { rings, blocks, bearings };
}

/** The corners of a block, as screen points — the painter strokes or fills whatever it likes from these. */
export function blockPath(b, cx, cy, steps = 3) {
  const pts = [];
  const rad = (d) => d * Math.PI / 180;
  for (let i = 0; i <= steps; i++) { const a = b.a0 + (b.a1 - b.a0) * (i / steps); pts.push([cx + Math.sin(rad(a)) * b.r0, cy - Math.cos(rad(a)) * b.r0]); }
  for (let i = steps; i >= 0; i--) { const a = b.a0 + (b.a1 - b.a0) * (i / steps); pts.push([cx + Math.sin(rad(a)) * b.r1, cy - Math.cos(rad(a)) * b.r1]); }
  return pts;
}

/** A block's roofs: `n` slabs across it, each a quad, deterministic from the block's own seed. */
export function blockRoofs(b, cx, cy) {
  const out = [];
  const n = Math.max(0, b.roofs | 0);
  const rad = (d) => d * Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const jitter = (rnd(b.seed, i, 3) - 0.5) * 0.16;
    const q0 = b.a0 + (b.a1 - b.a0) * Math.max(0, t0 + 0.06 + jitter);
    const q1 = b.a0 + (b.a1 - b.a0) * Math.min(1, t1 - 0.06 + jitter);
    if (q1 <= q0) continue;
    const inset = 2 + rnd(b.seed, i, 5) * 3;
    const r0 = b.r0 + inset, r1 = b.r1 - inset;
    if (r1 <= r0) continue;
    out.push([
      [cx + Math.sin(rad(q0)) * r0, cy - Math.cos(rad(q0)) * r0],
      [cx + Math.sin(rad(q1)) * r0, cy - Math.cos(rad(q1)) * r0],
      [cx + Math.sin(rad(q1)) * r1, cy - Math.cos(rad(q1)) * r1],
      [cx + Math.sin(rad(q0)) * r1, cy - Math.cos(rad(q0)) * r1],
    ]);
  }
  return out;
}
