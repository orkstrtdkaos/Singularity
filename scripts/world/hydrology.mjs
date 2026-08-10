// scripts/world/hydrology.mjs — SNG-391 §3 steps 4–6, ported from Aevi's rebuild.py (a7692575).
//
// ⛔ A PORT, NOT A REWRITE. Every constant here is hers: the 1.5% accumulation cut, the 30 endorheic
// sinks, lake fill +1.7, marsh at the 40th elevation percentile with ≤1.3 relief, the compactness-12
// polygon rejection, Douglas–Peucker at her epsilons. Where the SPEC and the CODE disagreed, the CODE
// won and the drift is noted: the spec says smooth the DEM 4 passes, rebuild.py smooths THREE.
//
// ⚠️ ONE INPUT IS CANON AND IS NOT IN THE REPO: WATERAUTH.json — the authored list of locations whose own
// text demands water (river/lake/marsh kinds), which rebuild.py digs into the DEM before flow. By Aevi's
// own §1 table authored inputs live in the repo; this one lived in her sandbox. The pipeline loads
// content/packs/core/world/waterauth.json IF PRESENT and says loudly when it is absent — the derived
// hydrology (D8 flow, rivers, endorheic lakes, marsh) runs either way. The shoreline-pushback list was
// hard-coded in rebuild.py itself, so THAT much of the authored layer travelled with the code.

const NB = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];   // Moore, her order

// rebuild.py line 166 — the settlements that stand on the shore, not in the water.
export const SHORELINE_PUSHBACK = ["archive_hollow", "cairn_and_scour", "millbrook", "the_quiet_ground",
  "the_wellspring_deep", "wellspring", "echo_river_crossing", "greywater_stilts", "waystone", "thinwater", "the_hollowing"];

export function buildHydrology({ type, elev, W, H, seedPos, waterAuth }) {
  const K = (j, i) => j * W + ((i % W) + W) % W;
  const idxOf = (lon, lat) => {
    const lo = ((lon + 180) % 360 + 360) % 360;
    return Math.min(H - 1, Math.floor((90 - lat) / 180 * H)) * W + Math.min(W - 1, Math.floor(lo / 360 * W));
  };
  const land = (k) => type[k] !== 0;
  let E = Float64Array.from(elev);

  // authored digs — a water-bearing location lowers its neighbourhood so the flow finds it
  const auth = waterAuth?.authored || {};
  for (const [lid, entry] of Object.entries(auth)) {
    const pos = seedPos[lid]; if (!pos) continue;
    const c = idxOf(pos.lon, pos.lat), cj = Math.floor(c / W), ci = c % W;
    for (let dj = -5; dj <= 5; dj++) for (let di = -5; di <= 5; di++) {
      const j = cj + dj; if (j < 0 || j >= H) continue;
      const k = K(j, ci + di); if (!land(k)) continue;
      const d = Math.hypot(dj, di);
      if (d <= 5) E[k] = Math.max(129, E[k] - 9 * Math.exp(-Math.pow(d / 2.6, 2)));
    }
  }
  // smooth — THREE passes (the code's number; the spec said four)
  for (let pass = 0; pass < 3; pass++) {
    const N2 = Float64Array.from(E);
    for (let j = 1; j < H - 1; j++) for (let i = 0; i < W; i++) {
      const k = K(j, i); if (!land(k)) continue;
      let s = E[k] * 2, n = 2;
      for (const [dj, di] of NB) { const m = K(j + dj, i + di); if (land(m)) { s += E[m]; n++; } }
      N2[k] = s / n;
    }
    E = N2;
  }
  // fill pits, ≤6 sweeps
  for (let sweep = 0; sweep < 6; sweep++) {
    let ch = 0;
    for (let j = 1; j < H - 1; j++) for (let i = 0; i < W; i++) {
      const k = K(j, i); if (!land(k)) continue;
      let lo = Infinity;
      for (const [dj, di] of NB) { const m = K(j + dj, i + di); if (land(m) && E[m] < lo) lo = E[m]; }
      if (lo !== Infinity && E[k] <= lo) { E[k] = lo + 0.35; ch++; }
    }
    if (!ch) break;
  }
  // D8 flow, high to low
  const order = [];
  for (let k = 0; k < W * H; k++) if (land(k)) order.push(k);
  order.sort((a, b) => E[b] - E[a]);
  const acc = new Float64Array(W * H).fill(1), down = new Int32Array(W * H).fill(-1);
  for (const k of order) {
    const j = Math.floor(k / W), i = k % W; let best = -1, bv = E[k];
    for (const [dj, di] of NB) { const jj = j + dj; if (jj < 0 || jj >= H) continue;
      const m = K(jj, i + di); if (E[m] < bv) { bv = E[m]; best = m; } }
    down[k] = best;
  }
  for (const k of order) if (down[k] >= 0) acc[down[k]] += acc[k];
  const va = order.map((k) => acc[k]).sort((a, b) => a - b);
  const WA = new Uint8Array(W * H);                            // 0 none · 1 river · 2 lake · 3 marsh
  const cut985 = va[Math.floor(va.length * 0.985)];
  for (const k of order) if (acc[k] >= cut985) WA[k] = 1;
  // 30 strongest endorheic sinks become lakes, filled to +1.7
  const cut995 = va[Math.floor(va.length * 0.995)];
  const sinks = order.filter((k) => down[k] < 0 && acc[k] > cut995).sort((a, b) => acc[b] - acc[a]).slice(0, 30);
  for (const s of sinks) {
    const lvl = E[s] + 1.7, seen = new Set([s]), stack = [s]; WA[s] = 2; let n = 0;
    while (stack.length && n < 320) {
      const k = stack.pop(); n++;
      const j = Math.floor(k / W), i = k % W;
      for (const [dj, di] of NB) { const jj = j + dj; if (jj < 0 || jj >= H) continue;
        const m = K(jj, i + di);
        if (!seen.has(m) && land(m) && E[m] <= lvl) { seen.add(m); WA[m] = 2; stack.push(m); } }
    }
  }
  // authored kinds: a river location traces downhill 26 steps; lakes/marshes stamp a noisy disc
  const n1 = (x, y) => Math.sin(x * 1.7 + Math.cos(y * 1.3)) * Math.cos(y * 1.1 + Math.sin(x * 0.9));
  const KIND = { river: 1, lake: 2, marsh: 3 };
  for (const [lid, entry] of Object.entries(auth)) {
    const kind = KIND[Array.isArray(entry) ? entry[0] : entry?.kind]; const pos = seedPos[lid];
    if (!kind || !pos) continue;
    const c = idxOf(pos.lon, pos.lat); if (!land(c)) continue;
    let cj = Math.floor(c / W), ci = c % W;
    if (kind === 1) {
      let j = cj, i = ci;
      for (let step = 0; step < 26; step++) {
        const k = K(j, i); if (!land(k)) break;
        if (WA[k] === 0) WA[k] = 1;
        let best = null, bv = Infinity;
        for (const [dj, di] of NB) { const jj = j + dj; if (jj < 0 || jj >= H) continue;
          const m = K(jj, i + di); if (land(m) && E[m] < bv) { bv = E[m]; best = [jj, ((i + di) % W + W) % W]; } }
        if (!best) break; [j, i] = best;
      }
    } else {
      const r = kind === 2 ? 4 : 5;
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        const j = cj + dj; if (j < 0 || j >= H) continue;
        const k = K(j, ci + di); if (!land(k) || WA[k]) continue;
        if (Math.hypot(dj, di) + 0.9 * n1((pos.lon + di) * 0.5, (pos.lat + dj) * 0.5) <= r * 0.72) WA[k] = kind;
      }
    }
  }
  // marsh creep: flat, low, water-adjacent
  const lowE = order.map((k) => E[k]).sort((a, b) => a - b);
  const q40 = lowE[Math.floor(lowE.length * 0.4)];
  for (const k of order) {
    if (WA[k]) continue;
    const j = Math.floor(k / W), i = k % W;
    let adj = false, maxd = 0;
    for (const [dj, di] of NB) { const jj = j + dj; if (jj < 0 || jj >= H) continue;
      const m = K(jj, i + di); if (WA[m]) adj = true; maxd = Math.max(maxd, Math.abs(E[k] - E[m])); }
    if (adj && maxd <= 1.3 && E[k] < q40) WA[k] = 3;
  }
  // ⛔ ONLY THE SUNKEN CHOIR IS AUTHORED AS SUBMERGED — every other water-adjacent settlement stands on
  // the shore. The pushback list travelled inside rebuild.py itself, so it ships with the port.
  for (const lid of SHORELINE_PUSHBACK) {
    const pos = seedPos[lid]; if (!pos) continue;
    const c = idxOf(pos.lon, pos.lat), cj = Math.floor(c / W), ci = c % W;
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const j = cj + dj; if (j < 0 || j >= H) continue;
      const k = K(j, ci + di); if (WA[k] === 2) WA[k] = 0;
    }
  }

  // — vectors: Moore boundary trace → smooth → Douglas–Peucker → compactness ≤ 12 —
  const ll = (k) => { const j = Math.floor(k / W), i = k % W; return [90 - (j + 0.5) * (180 / H), -180 + (i + 0.5) * (360 / W)]; };
  const blobs = (kind, minc) => {
    const cells = new Set(); for (let k = 0; k < W * H; k++) if (WA[k] === kind) cells.add(k);
    const seen = new Set(), out = [];
    for (const st of cells) {
      if (seen.has(st)) continue;
      const stack = [st]; seen.add(st); const g = [];
      while (stack.length) {
        const x = stack.pop(); g.push(x);
        const j = Math.floor(x / W), i = x % W;
        for (const [dj, di] of N8) { const jj = j + dj; if (jj < 0 || jj >= H) continue;
          const m = K(jj, i + di); if (cells.has(m) && !seen.has(m)) { seen.add(m); stack.push(m); } }
      }
      if (g.length >= minc) out.push(new Set(g));
    }
    return out;
  };
  const moore = (cells) => {
    let start = null; for (const k of cells) if (start === null || k < start) start = k;
    let b = start, pd = 6; const loop = [start]; let guard = 0;
    for (;;) {
      if (++guard > 8000) return null;                          // her guard for the slashed-marsh bug: never leave an open path
      const j = Math.floor(b / W), i = b % W; let found = null;
      for (let st = 0; st < 8; st++) {
        const d = (pd + 6 + st) % 8, [dj, di] = N8[d];
        const jj = j + dj; if (jj < 0 || jj >= H) continue;
        const m = K(jj, i + di);
        if (cells.has(m)) { found = [m, d]; break; }
      }
      if (!found) break;
      [b, pd] = found;
      if (b === start && loop.length > 2) break;
      loop.push(b);
    }
    return loop.length >= 6 ? loop.map(ll) : null;
  };
  const smoothPoly = (p, n = 3) => {
    for (let r = 0; r < n && p.length >= 5; r++)
      p = p.map((_, i) => { const a = p[(i - 1 + p.length) % p.length], c = p[(i + 1) % p.length];
        return [(a[0] + 2 * p[i][0] + c[0]) / 4, (a[1] + 2 * p[i][1] + c[1]) / 4]; });
    return p;
  };
  const perp = (p, a, b) => {
    if (a[0] === b[0] && a[1] === b[1]) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  };
  const dp = (pts, eps) => {
    if (pts.length < 3) return pts;
    let dm = 0, ix = 0;
    for (let i = 1; i < pts.length - 1; i++) { const d = perp(pts[i], pts[0], pts[pts.length - 1]); if (d > dm) { dm = d; ix = i; } }
    if (dm > eps) return dp(pts.slice(0, ix + 1), eps).slice(0, -1).concat(dp(pts.slice(ix), eps));
    return [pts[0], pts[pts.length - 1]];
  };
  const compact = (q) => {
    let per = 0, A = 0;
    for (let k = 0; k < q.length; k++) { const a = q[(k - 1 + q.length) % q.length], b = q[k];
      per += Math.hypot(b[0] - a[0], b[1] - a[1]); A += a[1] * b[0] - b[1] * a[0]; }
    A = Math.abs(A) / 2;
    return per * per / Math.max(1e-6, A) / (4 * Math.PI);
  };
  const buildv = (kind, minc, eps, cap) => {
    const out = [];
    for (const g of blobs(kind, minc)) {
      const t2 = moore(g); if (!t2) continue;
      let e = eps, r = dp(smoothPoly(t2), e);
      while (r.length > cap && e < 3) { e *= 1.5; r = dp(smoothPoly(t2), e); }
      if (r.length < 5 || compact(r) > 12) continue;            // the compactness gate — 13 slashed marshes
      out.push(r);
    }
    return out;
  };
  const lakes = buildv(2, 4, 0.03, 150), marsh = buildv(3, 6, 0.05, 150);
  // river polylines — MAIN STEMS FIRST, TRACED FROM EACH MOUTH UP THE LARGEST ACCUMULATION.
  // ⛔ THE FIRST FORM OF THIS WAS ITERATION-ORDER-DEPENDENT and it broke SNG-393 outright: chains grew
  // from whichever head the Set happened to yield first, and a tributary processed early STOLE the main
  // stem — the Echo (91° of river) decomposed with its head on a 2.6° stub, so no polar signature
  // could ever match it. Aevi's Python had the same truncation and her signatures survived only because
  // the same interpreter re-ran the same arbitrary order. Tracing mouth→source along MAX ACCUMULATION
  // (ties to the lower index) is order-free by construction: the main stem is a property of the flow
  // field, not of who asked first.
  const riv = new Set(); for (let k = 0; k < W * H; k++) if (WA[k] === 1) riv.add(k);
  const upsOf = new Map();
  for (const k of riv) {
    const j2 = Math.floor(k / W), i2 = k % W; let best = null, bv = E[k];
    for (const [dj, di] of NB) { const jj = j2 + dj; if (jj < 0 || jj >= H) continue;
      const m = K(jj, i2 + di); if (riv.has(m) && E[m] < bv) { bv = E[m]; best = m; } }
    if (best !== null) { if (!upsOf.has(best)) upsOf.set(best, []); upsOf.get(best).push(k); }
  }
  const isMouth = (k) => { const j2 = Math.floor(k / W), i2 = k % W;
    for (const [dj, di] of NB) { const jj = j2 + dj; if (jj < 0 || jj >= H) continue;
      const m = K(jj, i2 + di); if (riv.has(m) && E[m] < E[k]) return false; } return true; };
  const mouths = [...riv].filter(isMouth).sort((a, b) => acc[b] - acc[a] || a - b);
  const consumed = new Set(), paths = [];
  const traceUp = (start) => {
    const p = [start]; consumed.add(start); let cur = start;
    for (;;) {
      const ups = (upsOf.get(cur) || []).filter((u) => !consumed.has(u));
      if (!ups.length) break;
      ups.sort((a, b) => acc[b] - acc[a] || a - b);            // the largest catchment IS the river
      cur = ups[0]; consumed.add(cur); p.push(cur);
      if (p.length > 800) break;
    }
    return p;
  };
  for (const m of mouths) { const p = traceUp(m); if (p.length >= 3) paths.push(p.reverse().map(ll)); }
  // tributaries: whatever remains, traced from its own local mouths, deterministically
  const rest = [...riv].filter((k) => !consumed.has(k)).sort((a, b) => acc[b] - acc[a] || a - b);
  for (const k of rest) {
    if (consumed.has(k)) continue;
    const p = traceUp(k); if (p.length >= 3) paths.push(p.reverse().map(ll));
  }
  const smOpen = (p) => {
    if (p.length < 3) return p;
    const o = [p[0]];
    for (let i = 1; i < p.length - 1; i++) o.push([(p[i - 1][0] + 2 * p[i][0] + p[i + 1][0]) / 4, (p[i - 1][1] + 2 * p[i][1] + p[i + 1][1]) / 4]);
    o.push(p[p.length - 1]); return o;
  };
  const rr = (Q) => Q.map((q) => q.map(([a, b]) => [Math.round(a * 1000) / 1000, Math.round(b * 1000) / 1000]));
  return { WA, E, hydrology: { rivers: rr(paths.map((p) => dp(smOpen(smOpen(p)), 0.012))), lakes: rr(lakes), marsh: rr(marsh) },
    authoredWaterPresent: Object.keys(auth).length > 0 };
}
