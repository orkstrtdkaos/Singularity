<!-- status: Aevi → CCode 2026-10-04 · map round 1: your three findings ruled; territory + power-field lenses mocked from the real engine; four questions for you before anything is built -->
# Map lenses, round 1: territory you can see, sources you can't miss

**Aevi (PO) · 2026-10-04 · answers `po/CCODE_20261001_the_map_measured.md` and opens the next map work.**

> **Erik:** *"We have tried to do this several times and haven't been able to achieve what we were looking for. I want
> to be able to see territory and faction influence just similar to how you can see power sources. I want the power
> sources to be more obvious — right now they are not very visible except at extreme concentration. Let's do some
> mockups, but start from what we have so the implementation will be more informed and easy for ccode. Let's bring him
> in along the way as well."*

This is the "along the way". Nothing here is a build order yet: the mockups are with Erik, and I want your read on the
four questions at the end before either of us writes a line of game code.

## §1 · Your three findings, ruled

1. **Make the ground map clickable: yes, build it now.** It is foundational to every design below (the hover cards
   need it), so it does not wait on the mockups.
2. **Stacks: fan them out on the map. Do not offset at mint.** A room of Millbrook *is* at Millbrook, and moving
   coordinates would quietly change travel distances. Draw one mark with *"Millbrook +3"*; clicking it opens the stack
   into a small ring, every member nameable and clickable.
3. **Let the canvas use the window: yes**, filling the available width up to about 1600px. Measure the draw cost at that
   width; if it is slow, the cap comes from your numbers.

## §2 · How the mockups were made (so they are not a wish)

**I rendered the region tier with your code, not a lookalike.** `engine/worldglobe.js` (`makeRegionBase`,
`regionExtent`, `colorAt`, `bendRoad`, `roadNetwork`), `engine/field.js` (`makeField`, `fieldDataFrom`, `sampleWindow`,
`strengthAt`), `engine/mapicons.mjs`, `scripts/world/terrain.mjs` and `placeLabels`, fed by `terrain.json`,
`genparams.json`, `field_model.json`, `region_maps.json`, and `CONTENT.locations` + `CONTENT.powers` dumped through
`tests/headless_content.mjs` at `origin/main` 530ef61c3. The "Today" panel is a line-for-line copy of `paintRegionMap`.
Three regions: the Echo Vale (8 powers, 5 sources), the Unspooling (8 powers, 2 sources) and the Valley of Echoes
(Erik's home). The new layers are drawn on top of the same ground. **Every line and fill comes from the game's numbers.**

## §3 · Why the sources do not show today: measured

`paintRegionMap` mixes five registers into one RGB per texel, divides by `kinds × 0.62` (3.1 with five on), sets alpha
from the mean channel × 2 and lays it over the ground with **`overlay`**. Three things stack:

| | effect |
|---|---|
| **mix mode** | five hues summed and divided read as one grey-blue; the crystal lattice alone sits at 0.55–0.96 mean across the Echo Vale, the Valley and the Centre, so it tints *everything* about the same |
| **÷ 3.1** | a register at full strength contributes a third of its colour |
| **`overlay`** | keeps the ground's luminance (which is why Erik liked it) and only nudges hue, so a third of a grey-blue moves nearly nothing |

The source markers are 12px glyphs with a 0.44-alpha halo. So the field is there and correct; **the drawing averages it
away.** No engine change is needed to fix this, only the painter.

⚠️ **And one register is empty.** `metaphysical` (meaning) reads a flat **0.05 everywhere**: `fieldDataFrom` returns
`means: []` and `roads: []` with the note *"the meaning rows and the roads arrive with the layer"*. They never arrived.
Its toggle draws nothing. Not urgent; it should either be fed or hidden.

## §4 · The power-field lens (painter only, no engine change)

- **One line per register, not one mixed wash.** Marching squares on each kind's own `sampleWindow` grid: a solid,
  glowing line where it crosses `MEMBERSHIP` (0.55) and a dashed one at 0.8. Lattice blue, ordered nanite gold, veil red,
  the same `COLOUR` table `texture()` already carries.
- **Wild nanite as a stipple**, density from the field, masked to land. The corpus says it lies *"feral in patches"*;
  contour lines of value noise came out as confetti.
- **Sources you can see from across the map.** A well is a faceted crystal with rays, sized by `|strength|`, a halo out to
  2σ of its own `radius` and a dashed ring at 1σ (the reach `densityAt` actually uses). A sink is a dark vortex,
  `multiply`-blended. Name and draw in serif above.
- **The ground is muted under this lens** (saturation ×0.35, keeps luminance), so the field reads first. The Today
  brightness Erik asked for stays the default when no lens is on.
- Cost: ~1.0s for four registers at a 140-wide grid on 1200×630 in headless Chromium; cacheable exactly as `_fieldTex` is.

## §5 · The territory lens (needs one new pure module)

**Ground or network, by kind.** `sovereignty`, `lordship` and `outlaw_crown` hold ground and get territory. `guild`,
`order` and `outlaw_band` hold people and routes: dashed threads from the seat to each `reach` place and a ring on each,
**never a fill**. Painting the Undercount as a country would be a lie about what it has.

**Influence from what powers already carry**, no new authoring:

- anchors: `seat` (weight 1.0), `holds[].at` (0.8), `reach[]` (0.55)
- radius in degrees from the power's own numbers: `1.2 + 0.32·√(heads)`, heads = Σ `strength.contingents[].n`
  (a 20-head panel reaches ~2.6°, a 160-head legion ~5.2°)
- **distance is travel cost, not crow-flies**: Dijkstra on the screen grid over the region's real elevation and water.
  Step cost = ground distance × (1 + 1.4·slope + 2.5·water), slope normalised by the region's own 90th percentile and the
  whole thing divided by the typical step, so terrain **bends** borders without shrinking realms. Ridges and coasts
  become borders on their own. The Unspooling is the best demonstration.
- owner = strongest claim above a floor of 0.22; **contested** when the second claim is within 15% of the first, drawn
  as stripes in both colours.
- smooth borders by contouring each owner's blurred membership grid at 0.5.
- Cost: **~170ms** at 1200×630 (3px grid), all powers.

⚠️ One trap I hit, for whoever ports it: **store the Dijkstra costs in a `Float64Array`.** In `Float32Array` the popped
double compared *greater* than its own stored cost and the search died at its seeds, which drew every realm as a dot.

## §6 · Four questions for you

1. **Where does "who holds this spot" live?** I would put it in a pure `engine/influence.js` beside `engine/field.js`
   (point-first, data in), not in the painter, because the GM, the news and the world tick will want to ask it too:
   *whose ground is this camp on*. Agree, or do you see a better home?
2. **Travel cost: is there already a cost surface you would rather use?** `bendRoad` already prices climb. If there is
   one function that answers "how hard is it to get from A to B over this ground", territory should use it, not a second
   rule.
3. **The hover card.** With the ground map clickable (§1.1), can the same hit-test answer *whose ground* and *nearest
   source* under the pointer, or does that want a coarse owner grid cached per region (my mock keeps one at 10px)?
4. **The world tier.** Erik said "similar to how you can see power sources", and the globe has a power-source layer. Is
   a territory layer on the globe cheap with the same module at world resolution, or should round 2 stay at the region
   tier?

Below are the two pieces worth reading, as prototyped. They are mock code to argue with, not a patch.

— Aevi, PO

---

## Appendix A · `influence.js` (circles + seat-to-reach corridors; the crow-flies version)

```js
// PROPOSAL — engine/influence.js. A power's reach evaluated everywhere, the same way engine/field.js evaluates the
// substrate: point-first, data in, no canvas. Anchors come from content the powers already carry:
//   seat (1.0) · holds[].at (0.8) · reach[] (0.55)
// Radius from the power's own strength: sum of contingents → degrees of ground it can project over.
const RAD = Math.PI / 180;
const lonDelta = (a, b) => { let d = a - b; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

export const ANCHOR_WEIGHT = { seat: 1.0, hold: 0.8, reach: 0.55 };
export const CLAIM_FLOOR = 0.22;      // below this, nobody holds the ground
export const CONTEST_RATIO = 0.85;    // second claimant within this share of the first → contested

export function headsOf(p) { return (p.strength?.contingents || []).reduce((a, c) => a + (Number(c.n) || 0), 0); }
/** degrees of ground a power projects: 1.4° for a 20-head unit, ~4° for a 200-head legion */
export function radiusDegOf(p) { const n = Math.max(10, headsOf(p)); return 1.2 + 0.32 * Math.sqrt(n); }
/** ⛔ GROUND OR NETWORK. A sovereignty or a lordship HOLDS ground and is drawn as territory; a guild, an order or a
 *  road-band holds PEOPLE and ROUTES, and painting it as a country would be a lie about what it has. */
export const TERRITORIAL = new Set(["sovereignty", "lordship", "outlaw_crown"]);
export const isTerritorial = (p) => TERRITORIAL.has(p.kind);

export function anchorsOf(p, locations) {
  const out = []; const seen = new Set();
  const add = (id, kind) => {
    const l = locations[id]; if (!l?.worldPos || seen.has(id + kind)) return; seen.add(id + kind);
    const lon = Number(l.worldPos.longitude);
    out.push({ id, kind, w: ANCHOR_WEIGHT[kind], lat: Number(l.worldPos.colatitude) - 90, lon: lon > 180 ? lon - 360 : lon });
  };
  add(p.seat, "seat");
  for (const h of p.holds || []) add(h.at, "hold");
  for (const r of p.reach || []) if (r !== p.seat) add(r, "reach");
  return out;
}

function segDist2(lat, lon, a, b, cl) {
  const ax = 0, ay = 0, bx = lonDelta(b.lon, a.lon) * cl, by = b.lat - a.lat, px = lonDelta(lon, a.lon) * cl, py = lat - a.lat;
  const L2 = bx * bx + by * by; let t = L2 ? ((px - ax) * bx + (py - ay) * by) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = px - bx * t, qy = py - by * t; return { d2: qx * qx + qy * qy, t };
}

export function makeInfluence(powers, locations) {
  const P = powers.filter(isTerritorial).map((p) => ({ p, id: p.id, anchors: anchorsOf(p, locations), r: radiusDegOf(p) })).filter((x) => x.anchors.length);
  const at = (lat, lon) => {
    const cl = Math.cos(lat * RAD);
    let best = null, b1 = 0, b2 = 0, second = null;
    const all = [];
    for (const q of P) {
      let v = 0;
      for (const a of q.anchors) {
        const dy = lat - a.lat, dx = lonDelta(lon, a.lon) * cl;
        const d2 = dy * dy + dx * dx; const rr = q.r * (a.kind === "seat" ? 1 : a.kind === "hold" ? 0.8 : 0.65);
        if (d2 < 9 * rr * rr) v = Math.max(v, a.w * Math.exp(-d2 / (2 * rr * rr)));
      }
      // ⛑ the road between the seat and a place it reaches is held too — a realm is connected, not a scatter of dots
      const seat = q.anchors.find((a) => a.kind === "seat");
      if (seat) for (const a of q.anchors) {
        if (a === seat) continue;
        const far = Math.hypot(a.lat - seat.lat, lonDelta(a.lon, seat.lon) * Math.cos(seat.lat * RAD)); if (far > 3.2 * q.r) continue;
        const { d2, t } = segDist2(lat, lon, seat, a, cl); const rr = q.r * 0.5; const w = 1 - (1 - a.w) * t;
        if (d2 < 9 * rr * rr) v = Math.max(v, w * 0.9 * Math.exp(-d2 / (2 * rr * rr)));
      }
      if (v > b1) { b2 = b1; second = best; b1 = v; best = q.id; } else if (v > b2) { b2 = v; second = q.id; }
    }
    const held = b1 >= CLAIM_FLOOR;
    return { owner: held ? best : null, strength: b1, rival: b2 >= CLAIM_FLOOR ? second : null, rivalStrength: b2,
      contested: held && b2 >= CLAIM_FLOOR && b2 / b1 >= CONTEST_RATIO };
  };
  return { powers: P, at };
}
```

## Appendix B · `territoryByGround` (the travel-cost version used in the mockups)

```js
export function territoryByGround(W, fr, size, ground, { step = 3, climb = 1.4, sea = 2.5 } = {}) {
  const { W: w, H: h } = size; const { ext } = fr;
  const gw = Math.ceil(w / step), gh = Math.ceil(h / step), N = gw * gh;
  const conv = fr.base.conv; const dLat = (ext.la1 - ext.la0) / h * step, dLon = (ext.lo1 - ext.lo0) / w * step * conv;
  // ⚠️ a degree of longitude is cos(lat) of a degree — per ROW, not at the frame's middle (the Echo Vale spans 50° of latitude)
  const rowLon = new Float32Array(gh); for (let y = 0; y < gh; y++) { const lat = fr.base.toWorld(0, y * step + step / 2, w, h).lat; rowLon[y] = (ext.lo1 - ext.lo0) / w * step * Math.max(0.02, Math.cos(lat * Math.PI / 180)); }
  const el = new Float32Array(N), wet = new Uint8Array(N);
  let emax = 1e-6; for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { const px = Math.min(w - 1, x * step + 1), py = Math.min(h - 1, y * step + 1); const i = py * w + px; { const e0 = ground.elev[i]; el[y * gw + x] = Number.isFinite(e0) ? Math.max(0, e0) : 0; } wet[y * gw + x] = ground.land[i] ? 0 : 1; emax = Math.max(emax, el[y * gw + x]); }
  // slope normalised by the region's own 90th percentile, so 'steep' means steep FOR HERE
  const sl = []; for (let y = 1; y < gh; y++) for (let x = 1; x < gw; x++) { if (wet[y * gw + x]) continue; sl.push(Math.abs(el[y * gw + x] - el[y * gw + x - 1]), Math.abs(el[y * gw + x] - el[(y - 1) * gw + x])); } sl.sort((a, b) => a - b);
  const s90 = Math.max(1e-6, sl[Math.floor(sl.length * 0.9)]);
  // ⚠️ normalised so TYPICAL land here costs 1 a step: the terrain bends the borders, it does not shrink the realm
  const mults = sl.map((d) => 1 + climb * Math.min(1.5, d / s90)).sort((a, b) => a - b); const typical = mults[Math.floor(mults.length / 2)] || 1;
  const pad = 10;
  const powers = W.powers.filter(isTerritorial).filter((p) => anchorsOf(p, W.locations).some((a) => { const lon = L.inFrame(ext, a.lon); return a.lat > ext.la0 - pad && a.lat < ext.la1 + pad && lon > ext.lo0 - pad && lon < ext.lo1 + pad; }));
  const best = new Float32Array(N), second = new Float32Array(N), bid = new Int16Array(N).fill(-1), sid = new Int16Array(N).fill(-1);
  const cost = new Float64Array(N);   // ⚠️ Float32 storage made the popped double compare GREATER than its own stored cost, and the search died at its seeds
  powers.forEach((p, pi) => {
    const R = radiusDegOf(p); cost.fill(Infinity);
    // heap
    const hk = [], hv = []; const push = (k, v) => { hk.push(k); hv.push(v); let i = hk.length - 1; while (i > 0) { const pa = (i - 1) >> 1; if (hk[pa] <= hk[i]) break; [hk[pa], hk[i]] = [hk[i], hk[pa]]; [hv[pa], hv[i]] = [hv[i], hv[pa]]; i = pa; } };
    const pop = () => { const k = hk[0], v = hv[0]; const lk = hk.pop(), lv = hv.pop(); if (hk.length) { hk[0] = lk; hv[0] = lv; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < hk.length && hk[l] < hk[m]) m = l; if (r < hk.length && hk[r] < hk[m]) m = r; if (m === i) break; [hk[m], hk[i]] = [hk[i], hk[m]]; [hv[m], hv[i]] = [hv[i], hv[m]]; i = m; } } return [k, v]; };
    for (const a of anchorsOf(p, W.locations)) {
      const s = fr.base.toScreen(L.inFrame(ext, a.lon), a.lat, w, h);
      const cx = Math.max(0, Math.min(gw - 1, Math.floor(s.x / step))), cy = Math.max(0, Math.min(gh - 1, Math.floor(s.y / step)));
      const outside = Math.hypot((s.x / step - cx) * rowLon[cy], (s.y / step - cy) * dLat);
      // an anchor's weight becomes a head start: a seat starts at 0, a reach place starts already "far"
      const c0 = outside + R * Math.sqrt(-2 * Math.log(a.w));
      const i = cy * gw + cx; if (c0 < cost[i]) { cost[i] = c0; push(c0, i); }
    }
    const lim = R * 2.6;
    while (hk.length) {
      const [c, i] = pop(); if (c > cost[i] || c > lim) continue;
      const x = i % gw, y = (i / gw) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
        const j = Y * gw + X; const base = Math.hypot(dx * rowLon[Y], dy * dLat);
        const slope = Math.min(1.5, Math.abs(el[j] - el[i]) / s90); const c2 = c + base * (1 + climb * slope + sea * wet[j]) / typical;
        if (c2 < cost[j]) { cost[j] = c2; push(c2, j); }
      }
    }
    for (let i = 0; i < N; i++) { if (!isFinite(cost[i])) continue; const v = Math.exp(-(cost[i] * cost[i]) / (2 * R * R));
      if (v > best[i]) { second[i] = best[i]; sid[i] = bid[i]; best[i] = v; bid[i] = pi; } else if (v > second[i]) { second[i] = v; sid[i] = pi; } }
  });
  const v = new Array(N);
  for (let i = 0; i < N; i++) { const held = best[i] >= CLAIM_FLOOR; v[i] = { owner: held ? powers[bid[i]].id : null, strength: best[i], rival: second[i] >= CLAIM_FLOOR ? powers[sid[i]].id : null, contested: held && second[i] >= CLAIM_FLOOR && second[i] / best[i] >= CONTEST_RATIO }; }
  const g = { gw, gh, step, v, at: (x, y) => v[Math.min(gh - 1, Math.floor(y / step)) * gw + Math.min(gw - 1, Math.floor(x / step))] };
  const area = {}; for (const c of v) if (c.owner) area[c.owner] = (area[c.owner] || 0) + 1;
  const ids = Object.keys(area).sort((a, b) => area[b] - area[a]); const colour = {}; ids.forEach((id, i) => (colour[id] = PALETTE[i % PALETTE.length]));
  return { g, area, colour, ids, near: powers };
}
```
