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
  // ⚠️ THE WALL PULLED IN FROM 0.42 TO 0.33 TO MAKE ROOM OUTSIDE IT. ✅ ERIK asked for *"areas outside the
  // city walls"*, and at 0.42 the ring between the wall and the frame was 33px — enough for a hedge, not for a
  // quarter. The city loses a fifth of its radius and the faubourgs gain two and a half times their depth,
  // which is the right trade when the thing outside is the thing that was asked for.
  W = 800, H = 520, wallFrac = 0.33, pad = 26, rHall = 30, hallId = null,
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

/** ⛔ THE GROUND OUTSIDE THE GATES. ✅ ERIK, 2026-10-04: *"Let's render some areas outside the city walls. Each
 *  can be a loose arrangement that matches the tradition in that direction."*
 *
 *  ⛑ THE TRADITION IN THAT DIRECTION IS ALREADY AUTHORED, and nothing here invents it. Every one of the twelve
 *  foothills carries a `spectrum` — the world's own signed description of what lies that way — and a
 *  `betweenCrossingAnd` naming the great place the road runs toward. The faubourg takes its character from the
 *  DOMINANT AXIS of that spectrum, so the quarter outside a gate is the quarter the road earns.
 *
 *  ⚠️ MEASURED on the real Crossing: all twelve roads lean a different way, and FOUR PAIRS ARE OPPOSITE POLES
 *  OF ONE AXIS — Dusklow dark against Kindlerow light, Greenmarch life against Greyhearth death, Stair Hollow
 *  angelic against the Low Market demonic, Gearsflat mechanical against Thinwater spiritual. Those four pairs
 *  must read as opposites or the lens is decoration.
 *
 *  Pure, and seeded: the same quarter every paint. */
export const LEANS = {
  "dark_light-": { kind: "dark", n: 16, spread: 0.62, jitter: 0.85, size: 7, rows: false },
  "dark_light+": { kind: "light", n: 9, spread: 1.15, jitter: 0.25, size: 9, rows: false },
  "mechanical_spiritual-": { kind: "mechanical", n: 14, spread: 0.8, jitter: 0.12, size: 10, rows: true },
  "mechanical_spiritual+": { kind: "spiritual", n: 7, spread: 1.25, jitter: 0.45, size: 7, rows: false },
  "death_life+": { kind: "life", n: 18, spread: 1.0, jitter: 0.7, size: 7, rows: false },
  "death_life-": { kind: "death", n: 13, spread: 0.72, jitter: 0.1, size: 5, rows: true },
  "body_mind+": { kind: "mind", n: 8, spread: 0.9, jitter: 0.3, size: 8, rows: true },
  "body_mind-": { kind: "body", n: 15, spread: 0.85, jitter: 0.55, size: 9, rows: false },
  "space_time+": { kind: "time", n: 11, spread: 1.3, jitter: 0.2, size: 11, rows: true },
  "space_time-": { kind: "space", n: 14, spread: 0.55, jitter: 0.5, size: 8, rows: false },
  "falsehood_truth+": { kind: "truth", n: 7, spread: 0.95, jitter: 0.08, size: 9, rows: true },
  "falsehood_truth-": { kind: "falsehood", n: 15, spread: 0.9, jitter: 0.95, size: 8, rows: false },
  "demonic_angelic+": { kind: "angelic", n: 9, spread: 1.05, jitter: 0.22, size: 10, rows: false },
  "demonic_angelic-": { kind: "demonic", n: 14, spread: 0.75, jitter: 0.9, size: 8, rows: false },
  "destruction_creation-": { kind: "destruction", n: 16, spread: 0.85, jitter: 1.0, size: 8, rows: false },
  "destruction_creation+": { kind: "creation", n: 12, spread: 0.95, jitter: 0.35, size: 9, rows: true },
  "chaos_order+": { kind: "order", n: 13, spread: 0.85, jitter: 0.06, size: 8, rows: true },
  "chaos_order-": { kind: "chaos", n: 15, spread: 0.85, jitter: 1.0, size: 8, rows: false },
  "violence_peace+": { kind: "peace", n: 10, spread: 1.0, jitter: 0.3, size: 8, rows: false },
  "violence_peace-": { kind: "violence", n: 14, spread: 0.7, jitter: 0.7, size: 8, rows: false },
  "concrete_abstract+": { kind: "abstract", n: 9, spread: 1.1, jitter: 0.6, size: 7, rows: false },
  "concrete_abstract-": { kind: "concrete", n: 14, spread: 0.8, jitter: 0.15, size: 10, rows: true },
  "emotional_logical+": { kind: "logical", n: 12, spread: 0.85, jitter: 0.1, size: 8, rows: true },
  "emotional_logical-": { kind: "emotional", n: 14, spread: 0.9, jitter: 0.8, size: 8, rows: false },
};
const PLAIN = { kind: "plain", n: 11, spread: 0.85, jitter: 0.5, size: 8, rows: false };

/** The dominant axis of a spectrum, as the key `LEANS` is keyed by. ⛑ Ties break by name so the same world
 *  always reads the same way — `Object.entries` order is not a guarantee worth leaning on. */
export function leanOf(spectrum) {
  const rows = Object.entries(spectrum || {}).filter(([, v]) => Number.isFinite(Number(v)) && v !== 0);
  if (!rows.length) return null;
  rows.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]) || a[0].localeCompare(b[0]));
  const [axis, v] = rows[0];
  return { axis, value: v, key: `${axis}${v >= 0 ? "+" : "-"}` };
}

/** ⛔ A loose arrangement outside each gate. Returns one quarter per avenue, each with its own character and
 *  its huts already placed in canvas pixels. */
export function faubourgs(avenues, { cx, cy, wallR, rimR, seed = 1, gap = 16, depth = null, W = 0, H = 0 } = {}) {
  const S = typeof seed === "string" ? strSeed(seed) : seed;
  const out = [];
  const r0 = wallR + gap;
  const r1 = depth != null ? r0 + depth : Math.max(r0 + 26, rimR - 34);
  (avenues || []).forEach((a, ai) => {
    const lean = a.lean || null;
    const L = (lean && LEANS[lean.key]) || PLAIN;
    // the quarter's own angular width: half the gap to each neighbour, so quarters never grow into each other
    const prev = avenues[(ai - 1 + avenues.length) % avenues.length];
    const next = avenues[(ai + 1) % avenues.length];
    const dPrev = Math.abs(((a.bearingDeg - prev.bearingDeg + 540) % 360) - 180) || 30;
    const dNext = Math.abs(((next.bearingDeg - a.bearingDeg + 540) % 360) - 180) || 30;
    const halfWide = Math.min(26, Math.max(6, Math.min(dPrev, dNext) * 0.42)) * L.spread;
    const huts = [];
    for (let i = 0; i < L.n; i++) {
      const u = (i + 0.5) / L.n;
      // along the road, then off to one side of it
      const along = r0 + (r1 - r0) * (L.rows ? u : (0.12 + 0.82 * rnd(S, ai * 131 + i, 1)));
      const lane = L.rows
        ? (i % 2 ? 1 : -1) * halfWide * (0.35 + 0.3 * ((i / L.n)))
        : (rnd(S, ai * 211 + i, 2) * 2 - 1) * halfWide;
      const jit = (rnd(S, ai * 307 + i, 3) * 2 - 1) * L.jitter;
      const b = a.bearingDeg + lane + jit * 3.2;
      const rr = along + jit * 9;
      const rad = b * Math.PI / 180;
      const sz = L.size * (0.7 + 0.6 * rnd(S, ai * 401 + i, 4));
      // ⚠️ KEPT ON THE CANVAS. The jitter that makes a quarter look loose also throws the odd structure off
      // the frame — measured, 2 of 157 — and a building drawn where nobody can see it is a building that did
      // not get drawn. Pulled back along its own bearing, so it keeps its direction.
      const lim = Math.max(wallR + 4, rimR - 4);
      const rc = Math.min(rr, lim);
      huts.push({
        x: cx + Math.sin(rad) * rc, y: cy - Math.cos(rad) * rc,
        w: sz, h: sz * (0.55 + 0.5 * rnd(S, ai * 503 + i, 5)),
        rot: (L.rows ? rad : rad + (rnd(S, ai * 601 + i, 6) - 0.5) * 1.1),
        t: rnd(S, ai * 701 + i, 7),
      });
    }
    out.push({ to: a.to, name: a.name, bearingDeg: a.bearingDeg, lean, kind: L.kind, toward: a.toward || null, huts });
  });
  return out;
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
