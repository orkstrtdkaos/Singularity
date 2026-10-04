/* B1 made two changes to `bendRoad` at once, and they have to be measured APART or the second gets credit for the
 * first. This measures each with the other held fixed.
 *
 *   1. THE COST RULE. It used to sum raw |delta elevation| with no water term; it now prices slope SQUARED against
 *      the region's own 90th percentile and charges for water (`makeGroundCost`, GROUND_COST.road).
 *   2. THE LONGITUDE WRAP. It took `b.lon - a.lon` raw, so a road whose ends straddle the 0/360 seam was drawn ALL
 *      THE WAY ROUND THE WORLD. Not caused by B1 -- the old code had the same subtraction -- but B1's measurement
 *      is what surfaced it, because a 112-degree midpoint shift is impossible for a bend capped at 0.28 of the
 *      separation, and that impossibility is what made me look rather than file the number.
 *
 *   node po/tools/measure_groundcost.mjs
 */
import fs from "node:fs";
import { loadContentHeadless } from "../../tests/headless_content.mjs";
import { decodeTerrain, bendRoad, makeGroundCost, elevSmooth, sampleAt, GROUND_COST } from "../../engine/worldglobe.js";

const CONTENT = await loadContentHeadless();
const terrain = decodeTerrain(JSON.parse(fs.readFileSync("content/packs/core/world/terrain.json", "utf8")));
const R2 = Math.PI / 180;

/* The PRE-B1 bend, kept verbatim, with `wrap` as a switch so each change can be isolated. */
const oldBend = (t, a, b, { samples = 9, offsets = 7, maxOffsetFrac = 0.28, wrap = false } = {}) => {
  const dLonTotal = wrap ? ((b[1] - a[1] + 540) % 360) - 180 : (b[1] - a[1]);
  const elevAt = (lat, lon) => elevSmooth(t, lon, lat);
  const along = (f, offDeg) => {
    const lat = a[0] + (b[0] - a[0]) * f, lon = a[1] + dLonTotal * f;
    const dLat = b[0] - a[0], dLon = dLonTotal * Math.cos(lat * R2);
    const m = Math.hypot(dLat, dLon) || 1;
    const pLat = -dLon / m, pLon = dLat / m;
    return [lat + pLat * offDeg, lon + (pLon * offDeg) / Math.max(0.12, Math.cos(lat * R2))];
  };
  const climbOf = (offDeg) => {
    let climb = 0, prev = null;
    for (let i = 0; i <= samples; i++) {
      const f = i / samples, w = Math.sin(Math.PI * f);
      const p = along(f, offDeg * w);
      const e = elevAt(p[0], p[1]);
      if (prev !== null) climb += Math.abs(e - prev);
      prev = e;
    }
    return climb;
  };
  const sep = Math.hypot(b[0] - a[0], dLonTotal * Math.cos(((a[0] + b[0]) / 2) * R2));
  const maxOff = sep * maxOffsetFrac;
  let best = { off: 0, climb: climbOf(0) };
  for (let k = 1; k <= offsets; k++) for (const sgn of [-1, 1]) {
    const off = (k / offsets) * maxOff * sgn;
    const c = climbOf(off);
    if (c < best.climb) best = { off, climb: c };
  }
  const pts = [];
  for (let i = 0; i <= samples; i++) { const f = i / samples; pts.push(along(f, best.off * Math.sin(Math.PI * f))); }
  return { points: pts, bent: Math.abs(best.off) > 1e-9 };
};

/* every real connection in the world, once each */
const L = CONTENT.locations;
const seen = new Set(), segs = [];
for (const [id, l] of Object.entries(L)) {
  if (!l?.worldPos || l.supersededBy) continue;
  for (const to of l.connections || []) {
    const o = L[to];
    if (!o?.worldPos || o.supersededBy) continue;
    const k = [id, to].sort().join("|");
    if (seen.has(k)) continue;
    seen.add(k);
    segs.push({ a: [l.worldPos.colatitude - 90, l.worldPos.longitude], b: [o.worldPos.colatitude - 90, o.worldPos.longitude], from: l.name, to: o.name });
  }
}
const wet = (lat, lon) => { const s = sampleAt(terrain, lon, lat); return s ? (s.type & 3) === 0 : false; };
const wetFrac = (pts) => pts.filter(p => wet(p[0], p[1])).length / pts.length;
const mid = (r) => r.points[Math.floor(r.points.length / 2)];
const apart = (p, q) => Math.hypot(q[0] - p[0], (q[1] - p[1]) * Math.cos(p[0] * R2));

console.log("");
console.log("== 1. THE LONGITUDE WRAP, with the old cost rule held fixed ==");
{
  let moved = 0, drier = 0; const worst = [];
  for (const s of segs) {
    const un = oldBend(terrain, s.a, s.b, { wrap: false });
    const wr = oldBend(terrain, s.a, s.b, { wrap: true });
    const d = apart(mid(un), mid(wr));
    if (d > 1e-9) { moved++; worst.push({ s, d, uw: wetFrac(un.points), ww: wetFrac(wr.points) }); }
    if (wetFrac(wr.points) < wetFrac(un.points) - 1e-9) drier++;
  }
  console.log(`   drawn the LONG way round: ${moved} of ${segs.length} (${(100 * moved / segs.length).toFixed(1)}%)`);
  console.log(`   of those, now over less water: ${drier}`);
  for (const w of worst.sort((a, b) => b.d - a.d).slice(0, 5)) {
    console.log(`      ${w.d.toFixed(1).padStart(6)} deg  ${w.s.from} -> ${w.s.to}   water ${(w.uw * 100).toFixed(0)}% -> ${(w.ww * 100).toFixed(0)}%`);
  }
}

console.log("");
console.log("== 2. THE COST RULE, with the wrap held fixed (both wrapped) ==");
{
  let moved = 0, same = 0, drier = 0, wetter = 0, bentOld = 0, bentNew = 0;
  const shifts = [], worst = [];
  for (const s of segs) {
    const o = oldBend(terrain, s.a, s.b, { wrap: true });
    const n = bendRoad(terrain, s.a, s.b);
    if (o.bent) bentOld++;
    if (n.bent) bentNew++;
    const d = apart(mid(o), mid(n));
    if (d > 1e-9) { moved++; shifts.push(d); } else same++;
    const ow = wetFrac(o.points), nw = wetFrac(n.points);
    if (nw < ow - 1e-9) drier++; else if (nw > ow + 1e-9) wetter++;
    if (d > 1e-9) worst.push({ s, d, ow, nw });
  }
  shifts.sort((a, b) => a - b);
  console.log(`   bent before ${bentOld} -> after ${bentNew}`);
  console.log(`   unchanged ${same} - moved ${moved}`);
  if (shifts.length) console.log(`   midpoint shift: median ${shifts[Math.floor(shifts.length / 2)].toFixed(3)} deg - worst ${shifts[shifts.length - 1].toFixed(3)} deg`);
  console.log(`   roads now running DRIER : ${drier}`);
  console.log(`   roads now running WETTER: ${wetter}  ${wetter ? "<-- a road the rule pushed INTO water is the rule failing" : "(none)"}`);
  for (const w of worst.sort((a, b) => b.d - a.d).slice(0, 5)) {
    console.log(`      ${w.d.toFixed(3).padStart(7)} deg  ${w.s.from} -> ${w.s.to}   water ${(w.ow * 100).toFixed(0)}% -> ${(w.nw * 100).toFixed(0)}%`);
  }
}

console.log("");
console.log("== two settings of one rule ==");
for (const [name, opts] of Object.entries(GROUND_COST)) {
  const G = makeGroundCost(terrain, opts);
  console.log(`   ${name.padEnd(10)} climb ${String(opts.climb).padStart(4)}  water ${String(opts.water).padStart(3)}   slopeRef ${G.slopeRef.toFixed(2)}  typical ${G.typical.toFixed(3)}`);
}
