// engine/earth.js — SNG-680. THE EARTH THE FILM OPENS ON.
//
// ⛔ ERIK: *"The first world it shows should be earth now."* The opening says "This was Earth" over a globe,
// and until this module that globe was EXESA's terrain wearing a blue-and-green palette. The argument the
// film makes — this world is that world, spent — only lands if the first thing you see is a world you
// recognise. A viewer who does not recognise it reads the whole first movement as fantasy.
//
// ⛑ HAND-DRAWN, AND DELIBERATELY SO. These coastlines are my own coarse tracing, at about 2–5° of fidelity:
// enough that Africa is Africa and the Americas are the Americas at a 420px globe, and nothing taken from a
// dataset whose provenance I cannot state. They are a PICTURE for one film, not a geography anyone should
// measure against: no bays, no fjords, no islands under ~400km, and the poles are simplified to bands.
//
// ⚠️ AND IT IS RASTERISED ONCE, NOT TESTED PER PIXEL. A point-in-polygon over ~1,100 vertices for every
// screen pixel of every frame is 150M operations a second; a scanline fill of the whole equirectangular grid
// is 360 rows against the same edges, once, and every frame after that is an array lookup. That difference is
// the whole reason the globe can turn smoothly at all.

/* Each polygon is [lon, lat] in degrees, lon in ±180, wound either way. Antarctica and the north cap are
 * handled as latitude bands rather than polygons, because at this fidelity they are bands. */
export const EARTH_LAND = [
  // ── Africa ──────────────────────────────────────────────────────────────────────────────────────────
  [[-17, 14], [-17, 21], [-12, 28], [-6, 36], [10, 37], [20, 32], [25, 31], [32, 31], [35, 28], [37, 22],
   [39, 15], [43, 11], [51, 12], [43, 4], [41, -2], [40, -10], [35, -17], [35, -24], [32, -29], [27, -34],
   [20, -35], [18, -32], [15, -22], [12, -17], [9, -1], [1, 6], [-8, 4], [-13, 8], [-17, 14]],
  // Madagascar
  [[44, -12], [50, -15], [50, -25], [45, -25], [43, -17], [44, -12]],
  // ── Eurasia ─────────────────────────────────────────────────────────────────────────────────────────
  [[-10, 36], [-9, 43], [-2, 43], [1, 46], [-2, 49], [4, 51], [8, 54], [11, 58], [18, 59], [21, 60],
   [25, 65], [21, 70], [28, 71], [40, 68], [55, 69], [68, 73], [80, 74], [100, 77], [113, 74], [129, 73],
   [141, 73], [160, 70], [170, 69], [180, 66], [180, 62], [170, 60], [163, 57], [156, 51], [143, 54],
   [135, 55], [141, 46], [131, 43], [127, 38], [122, 40], [119, 35], [122, 31], [117, 24], [110, 21],
   [105, 10], [100, 13], [98, 8], [95, 16], [90, 22], [80, 15], [77, 8], [72, 20], [68, 24], [57, 25],
   [50, 29], [48, 30], [43, 37], [36, 36], [28, 37], [24, 40], [19, 40], [14, 38], [16, 44], [13, 45],
   [12, 41], [8, 44], [3, 42], [-2, 37], [-6, 36], [-10, 36]],
  // the British Isles, as one shape at this scale
  [[-6, 50], [-2, 51], [1, 52], [0, 54], [-3, 58], [-6, 58], [-6, 54], [-10, 54], [-10, 51], [-6, 50]],
  // Japan
  [[130, 31], [136, 34], [141, 38], [142, 42], [145, 44], [141, 45], [138, 37], [133, 34], [130, 31]],
  // the Indonesian arc, as two shapes
  [[95, 5], [105, 0], [112, -3], [106, -7], [100, -2], [95, 5]],
  [[110, -1], [118, 0], [125, 1], [131, -1], [135, -3], [141, -3], [141, -9], [132, -8], [122, -9],
   [114, -8], [110, -1]],
  // ── the Americas ────────────────────────────────────────────────────────────────────────────────────
  // North America
  [[-168, 65], [-162, 70], [-156, 71], [-140, 70], [-128, 70], [-115, 69], [-100, 69], [-95, 68], [-85, 67],
   [-80, 73], [-68, 70], [-64, 61], [-56, 54], [-60, 47], [-66, 45], [-70, 43], [-74, 40], [-76, 35],
   [-81, 31], [-81, 25], [-85, 30], [-91, 29], [-97, 26], [-97, 21], [-95, 18], [-92, 15], [-87, 13],
   [-83, 9], [-78, 9], [-83, 15], [-88, 21], [-97, 26], [-105, 20], [-110, 24], [-114, 28], [-117, 32],
   [-122, 37], [-124, 43], [-124, 48], [-131, 53], [-140, 59], [-150, 59], [-158, 56], [-166, 54],
   [-162, 58], [-166, 61], [-168, 65]],
  // Greenland
  [[-45, 60], [-30, 68], [-22, 70], [-20, 76], [-30, 82], [-45, 83], [-58, 82], [-62, 76], [-54, 68],
   [-45, 60]],
  // South America
  [[-77, 8], [-72, 11], [-62, 10], [-52, 5], [-50, 0], [-44, -2], [-38, -5], [-35, -8], [-39, -14],
   [-41, -22], [-48, -26], [-54, -34], [-58, -38], [-62, -40], [-65, -45], [-68, -50], [-69, -55],
   [-74, -52], [-74, -45], [-73, -38], [-71, -30], [-70, -22], [-70, -16], [-76, -14], [-81, -6],
   [-80, 0], [-77, 8]],
  // ── Australia and New Zealand ───────────────────────────────────────────────────────────────────────
  [[113, -22], [114, -26], [116, -32], [123, -34], [129, -32], [135, -35], [140, -38], [146, -39],
   [150, -37], [153, -30], [153, -25], [146, -19], [142, -11], [136, -12], [130, -12], [126, -14],
   [122, -17], [113, -22]],
  [[145, -39], [148, -41], [148, -43], [145, -43], [145, -39]],
  [[173, -35], [178, -38], [174, -41], [171, -44], [167, -46], [168, -44], [172, -40], [173, -35]],
];

/* ⛔ THE CAPS ARE BANDS, AND SAYING SO IS MORE HONEST THAN DRAWING THEM BADLY. At this fidelity the Arctic
 * is sea ice and the Antarctic is a continent under ice, and both read as white to the eye; the film's first
 * shot is a turning globe at night, not a map. */
export const EARTH_ICE = { north: 75, south: -68 };   // ⚠️ measured on the bake: at 72/−62 the caps were 25.6% of the equirect grid, which is half again Earth's land

/** Rasterise the land into an equirectangular byte grid: 1 land, 0 sea, 2 ice. One scanline fill, once. */
export function bakeEarthMask(w = 720, h = 360) {
  const mask = new Uint8Array(w * h);
  const lonOf = (x) => -180 + (x + 0.5) * (360 / w);
  const latOf = (y) => 90 - (y + 0.5) * (180 / h);
  for (let y = 0; y < h; y++) {
    const lat = latOf(y);
    const xs = [];
    for (const poly of EARTH_LAND) {
      for (let i = 0; i < poly.length - 1; i++) {
        const [x1, y1] = poly[i], [x2, y2] = poly[i + 1];
        // ⛑ the half-open rule, so a vertex exactly on the scanline is counted once and a span cannot leak
        if ((y1 <= lat && y2 > lat) || (y2 <= lat && y1 > lat)) {
          xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.floor((xs[k] + 180) * (w / 360)));
      const b = Math.min(w - 1, Math.ceil((xs[k + 1] + 180) * (w / 360)));
      for (let x = a; x <= b; x++) mask[y * w + x] = 1;
    }
  }
  for (let y = 0; y < h; y++) {
    const lat = latOf(y);
    if (lat < EARTH_ICE.north && lat > EARTH_ICE.south) continue;
    for (let x = 0; x < w; x++) mask[y * w + x] = 2;
  }
  void lonOf;
  return { w, h, mask };
}

/* ⛔ AND IT IS COLOURED LIKE A PHOTOGRAPH OF EARTH, NOT LIKE A MAP. ✅ Erik's whole note is about how it
 * LOOKS: the ocean is deeper away from the shelf, the land runs from desert sand through savannah to taiga,
 * and the ice is blue-white rather than paper-white. The bands are by latitude and by distance from the sea,
 * which is as much as a mask can know and more than enough at this size. */
/* ⚠️ SATURATED FOR A LIT SPHERE, not for a flat map. Everything here is multiplied by the lambert term and
 * then has air drawn over it, so colours that look right as a map read grey as a world. Measured by looking
 * at the first cut: muted green and pale sand came out lavender under the atmosphere. */
const DEEP = [6, 22, 62], SHELF = [16, 74, 134], SAND = [214, 180, 112], GREEN = [52, 118, 52],
  TAIGA = [38, 82, 58], ICE = [236, 242, 250], TUNDRA = [132, 134, 102];

export function bakeEarthRGB(w = 720, h = 360) {
  const { mask } = bakeEarthMask(w, h);
  const rgb = new Uint8ClampedArray(w * h * 3);
  const at = (x, y) => mask[((y + h) % h) * w + ((x + w) % w)];
  /* ⛔ THE SHELF IS A DISTANCE FIELD, IN TWO PASSES, NOT A SEARCH PER CELL. Ringing outward from every sea
   * cell is ~150 lookups each and 39 million for the grid; a forward sweep and a backward sweep give the same
   * answer in two passes over it. The film can afford one bake at the start and nothing per frame. */
  const dist = new Float32Array(w * h).fill(99);
  const dAt = (x, y) => dist[((y + h) % h) * w + ((x + w) % w)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y) >= 1) dist[y * w + x] = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    dist[i] = Math.min(dist[i], dAt(x - 1, y) + 1, dAt(x, y - 1) + 1, dAt(x - 1, y - 1) + 1.4, dAt(x + 1, y - 1) + 1.4);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    dist[i] = Math.min(dist[i], dAt(x + 1, y) + 1, dAt(x, y + 1) + 1, dAt(x + 1, y + 1) + 1.4, dAt(x - 1, y + 1) + 1.4);
  }
  const latOf = (y) => 90 - (y + 0.5) * (180 / h);
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  for (let y = 0; y < h; y++) {
    const lat = latOf(y), al = Math.abs(lat);
    for (let x = 0; x < w; x++) {
      const m = at(x, y);
      let c;
      if (m === 2) c = ICE;
      else if (m === 0) {
        c = mix(SHELF, DEEP, Math.min(1, (dist[y * w + x] - 1) / 5));
      } else {
        // the land's own bands: ice-edge tundra, taiga, the temperate belt, the desert latitudes, the tropics
        const desert = Math.exp(-((al - 24) ** 2) / 90);          // the two desert belts
        const cold = Math.max(0, Math.min(1, (al - 48) / 16));
        c = mix(GREEN, SAND, desert * 0.85);
        c = mix(c, TAIGA, cold * 0.7);
        c = mix(c, TUNDRA, Math.max(0, Math.min(1, (al - 62) / 10)) * 0.8);
      }
      const i = (y * w + x) * 3;
      rgb[i] = c[0]; rgb[i + 1] = c[1]; rgb[i + 2] = c[2];
    }
  }
  return { w, h, rgb, mask };
}

/** Where the lights of cities go: land, away from the ice, with the dense belts brighter. Deterministic. */
export function earthCityLights(w = 720, h = 360, { mask = null } = {}) {
  const m = mask || bakeEarthMask(w, h).mask;
  const out = [];
  const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  for (let k = 0; k < 9000; k++) {
    const lon = -180 + rnd(k) * 360, lat = 78 - rnd(k + 7919) * 150;
    const x = Math.floor((lon + 180) * (w / 360)), y = Math.floor((90 - lat) * (h / 180));
    if (m[y * w + x] !== 1) continue;
    // the real pattern: Europe, India, eastern China, the US coasts and Japan carry most of the light
    const near = (a, b, r) => Math.exp(-(((lon - a) ** 2) / (r * r) + ((lat - b) ** 2) / (r * r)));
    const w8 = 0.3 + 0.7 * Math.max(near(10, 48, 16), near(78, 22, 14), near(115, 32, 14),
      near(-76, 40, 12), near(-120, 37, 8), near(138, 36, 7), near(-47, -22, 9), near(30, -26, 8));
    if (rnd(k + 104729) > w8) continue;
    out.push([lon, lat, Math.min(1, w8)]);
  }
  return out;
}
