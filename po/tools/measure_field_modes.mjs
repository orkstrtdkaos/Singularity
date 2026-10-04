/* ⛔ ERIK: *"I want the power sources to be more obvious — right now they are not very visible except at extreme
 * concentration."* Aevi measured why (`PROPOSAL_aevi_20261004_map_lenses_round1.md` §3) and every number of hers
 * checks out: `texture()` divides the mix by `kinds.length * 0.62` (3.1 with five on), alpha is the mean × 2.0, and
 * the whole thing lands through `overlay`, which preserves the ground's luminance and only nudges hue.
 *
 * ⛑ BUT `texture()` ALREADY HAS THE OTHER MODE. Its own comment: "TWO MODES, TWO QUESTIONS: `mix` sums and
 * normalises (HOW MUCH FIELD IS HERE); `max` gives the texel to the strongest source (WHICH SOURCE OWNS THIS
 * GROUND)." `mode` is plumbed through the painter and into the texture cache key — and `fieldCtl.mode` is set to
 * "mix" at birth and never written again. No control reaches it.
 *
 * This measures what that unreachable branch is worth, before anyone builds a contour renderer.
 *
 *   node po/tools/measure_field_modes.mjs
 */
import fs from "node:fs";
import { loadContentHeadless } from "../../tests/headless_content.mjs";
import { makeField, fieldDataFrom } from "../../engine/field.js";
import { meaningDensity } from "../../engine/substrate.js";
import { decodeTerrain, regionExtent } from "../../engine/worldglobe.js";

const CONTENT = await loadContentHeadless();
const terrain = decodeTerrain(JSON.parse(fs.readFileSync("content/packs/core/world/terrain.json", "utf8")));
const MODEL = JSON.parse(fs.readFileSync("content/packs/core/world/field_model.json", "utf8"));
const REGION_MAPS = JSON.parse(fs.readFileSync("content/packs/core/world/region_maps.json", "utf8"));

// ⛑ the reader handed in exactly as app.js hands it, or this measures a field the app does not have
const data = fieldDataFrom(terrain.fields, MODEL, { content: CONTENT, substrate: CONTENT?.rules?.the_substrate || null,
  meaningOf: (loc) => meaningDensity(loc, { data: CONTENT?.substrateModel || null }) });
const F = makeField(data);

/* ⚠️ THE PAINTER'S OWN NUMBERS, not approximations of them: a 96×96 window (`fieldWindowFor(ext, 96, 96)`),
   the five kinds the panel shows with `body` off, and alpha = mean × 2.0 clamped at 210. */
const KINDS = ["precursor", "nanite", "veil", "wild", "metaphysical"];
const stat = (rgb, n) => {
  let sum = 0, peak = 0, over = 0, chroma = 0;
  // ⛔ WHICH HUE WINS A TEXEL — the question Erik is actually asking. Brightness is not discrimination: a wash can
  // get twice as bright and still say nothing about WHICH source is under it.
  const hueCount = {};
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const m = (r + g + b) / 3;
    sum += m; if (m > peak) peak = m;
    if (Math.min(210, m * 2.0) >= 64) over++;      // alpha a quarter opaque: the floor at which a wash reads at all
    // ⛑ CHROMA is how far the texel is from grey. A five-way average sits near grey however bright it gets.
    chroma += (Math.max(r, g, b) - Math.min(r, g, b));
    const dom = r >= g && r >= b ? "r" : g >= b ? "g" : "b";
    hueCount[dom] = (hueCount[dom] || 0) + 1;
  }
  const hues = Object.values(hueCount).sort((a, x) => x - a);
  return { mean: sum / n, peak, overPct: 100 * over / n, chroma: chroma / n,
    // the share of texels taken by the single most common dominant channel: 100% means one colour everywhere
    domPct: 100 * hues[0] / n };
};

console.log("── what the unreachable `max` mode is worth, on the real field ──");
console.log("   (alpha = mean × 2.0 clamped 210, exactly as paintRegionMap writes it)\n");
console.log("   region                 mode   mean texel   peak   % at alpha ≥ 64   chroma   one hue");

/* ⛑ the regions the content actually declares, not four ids I typed — one of my first four did not exist and
   printed nothing at all, which is the quiet half of the same mistake. */
const REGION_IDS = [...new Set(Object.values(CONTENT.locations).map(l => l?.regionId || l?.region).filter(Boolean))]
  .filter(r => REGION_MAPS[r]).slice(0, 6);
const rows = [];
for (const regionId of REGION_IDS) {
  const ext = regionExtent(regionId, CONTENT.locations, { authored: REGION_MAPS[regionId] || null });
  if (!ext) continue;
  // ⚠️ `fieldWindowFor`'s EXACT call. My first cut spread `...ext`, whose keys are la0/lo0 — `sampleWindow` wants
  // lat0/lon0, so every key missed and it silently returned the WHOLE WORLD. Three regions reported identical
  // numbers, which is what a reader answering with its default looks like.
  // ⛑ And lat0/lat1 are SWAPPED against the extent on purpose: screen y runs downward.
  const win = F.sampleWindow({ lat0: ext.la1, lat1: ext.la0, lon0: ext.lo0, lon1: ext.lo1, w: 96, h: 96 });
  for (const mode of ["mix", "max"]) {
    const rgb = F.texture({ window: win, kinds: KINDS, mode });
    const n = win ? win.w * win.h : 96 * 96;
    const s = stat(rgb, n);
    rows.push({ regionId, mode, ...s });
    console.log(`   ${regionId.padEnd(20)} ${mode.padEnd(5)}  ${s.mean.toFixed(1).padStart(8)}   ${s.peak.toFixed(0).padStart(5)}   ${s.overPct.toFixed(1).padStart(6)}%   ${s.chroma.toFixed(1).padStart(6)}   ${s.domPct.toFixed(0).padStart(4)}%`);
  }
}

/* ⛔ THE HEADLINE: the same field, the same painter, one word different */
const by = (m) => rows.filter(r => r.mode === m);
const avg = (a, f) => a.reduce((s, r) => s + f(r), 0) / a.length;
const mMix = avg(by("mix"), r => r.mean), mMax = avg(by("max"), r => r.mean);
const vMix = avg(by("mix"), r => r.overPct), vMax = avg(by("max"), r => r.overPct);
console.log(`\n   mean texel   mix ${mMix.toFixed(1)} → max ${mMax.toFixed(1)}   (×${(mMax / Math.max(1e-6, mMix)).toFixed(2)})`);
console.log(`   visible      mix ${vMix.toFixed(1)}% → max ${vMax.toFixed(1)}% of texels at alpha ≥ 64`);
const cMix = avg(by("mix"), r => r.chroma), cMax = avg(by("max"), r => r.chroma);
const dMix = avg(by("mix"), r => r.domPct), dMax = avg(by("max"), r => r.domPct);
console.log(`   chroma       mix ${cMix.toFixed(1)} → max ${cMax.toFixed(1)}   (×${(cMax / Math.max(1e-6, cMix)).toFixed(2)})  — how far from grey, i.e. whether the colour SAYS anything`);
console.log(`   one hue over mix ${dMix.toFixed(0)}% → max ${dMax.toFixed(0)}% of the region  — lower is better: it means the map distinguishes sources`);

/* ⚠️ AND AEVI'S EMPTY REGISTER, checked rather than taken on trust */
console.log(`\n── §3's "one register is empty" ──`);
for (const k of KINDS) {
  const vals = [];
  for (let la = -80; la <= 80; la += 10) for (let lo = -180; lo < 180; lo += 15) vals.push(F.strengthAt(k, la, lo));
  const lo = Math.min(...vals), hi = Math.max(...vals), mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const flat = hi - lo < 1e-9;
  console.log(`   ${k.padEnd(14)} min ${lo.toFixed(3)}  max ${hi.toFixed(3)}  mean ${mean.toFixed(3)}  ${flat ? "⚠️ FLAT — the toggle draws nothing" : ""}`);
}
console.log(`   means rows: ${(data.means || []).length} · roads rows: ${(data.roads || []).length}`);
