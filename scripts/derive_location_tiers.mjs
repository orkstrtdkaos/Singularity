// derive_location_tiers.mjs — SNG-383 §2. DERIVE THE HIERARCHY, DO NOT HAND-AUTHOR IT.
//
// Aevi: "The three-tier structure Erik wants ALREADY EXISTS in the connection graph. It has simply never
// been declared, so the renderer has no way to know." — and: "DERIVE THE FIRST PASS. po/staged_content/
// output for me to review and correct, exactly like the copy inventory. I expect ~10 wrong out of 47 and
// those are mine to fix, not yours to guess."
//
// ⛔ THE AXIS GATE IS THE CASE THAT BREAKS A NAIVE DERIVATION, and she said so in advance: it sits in
// `the_center` with 25 connections, 23 of them outward. A hub-detector keyed on "most connections" or "most
// outward reach" crowns the Gate and demotes the Crossing, which is backwards — the Crossing is the
// settlement, the Gate is its door. So the hub is chosen on IN-REGION degree, which is what "everything
// here hangs off this" actually means, and outward reach is what identifies a GATE instead.
//
// Run: node scripts/derive_location_tiers.mjs [--emit]

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content/packs/valley/locations");
const flat = {};
for (const f of readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const l of (d.locations ? Object.values(d.locations) : [d])) if (l && l.id) flat[l.id] = l;
}
const ids = Object.keys(flat);
const regionOf = (id) => flat[id]?.regionId || flat[id]?.region || null;
const conns = (id) => (flat[id]?.connections || []).map(c => (typeof c === "string" ? c : (c.to || c.id))).filter(Boolean);
const inRegion = (id) => conns(id).filter(c => flat[c] && regionOf(c) === regionOf(id));
const outward = (id) => conns(id).filter(c => flat[c] && regionOf(c) !== regionOf(id));

const byRegion = {};
for (const id of ids) (byRegion[regionOf(id) || "(none)"] ||= []).push(id);

const rows = [];
for (const [region, members] of Object.entries(byRegion)) {
  // ⚠️ THE HUB IS THE HIGHEST IN-REGION DEGREE. Not total, not outward — "everything here hangs off this".
  const ranked = [...members].sort((a, b) =>
    inRegion(b).length - inRegion(a).length || conns(b).length - conns(a).length || a.localeCompare(b));
  const hub = ranked[0];
  // ⚠️ A NEAR-TIE IS A JUDGEMENT CALL, NOT A DERIVATION. `valley` ranks disputed_zone_fringe (6) over
  // millbrook (5) by one link — defensible by degree and probably wrong in meaning. Flagged, not decided.
  const hubMargin = ranked.length > 1 ? inRegion(ranked[0]).length - inRegion(ranked[1]).length : 99;
  // ⚠️ THE RUNNER-UP RIDES ON EVERY HUB ROW, UNFLAGGED, so 26 hub calls can be scanned in one pass.
  // `valley` picks disputed_zone_fringe (6) over millbrook (5) — defensible by degree and quite possibly
  // wrong in meaning. That is exactly what a reader catches and a graph rule cannot, so it is shown
  // rather than flagged: flagging all 23 margin-1 regions was the noise I just removed.
  const runnerUp = ranked[1] ? { id: ranked[1], inRegion: inRegion(ranked[1]).length } : null;

  // ⛔ A GATE IS A DOOR, NOT A SETTLEMENT: overwhelmingly outward-facing, and never the hub itself.
  // The threshold is derived from the shape of the thing rather than picked — a door leads OUT more than
  // it leads in. `the_axis_gate` is 23 out / 2 in; nothing else in the world looks like that by accident.
  const gates = members.filter(id => id !== hub && outward(id).length >= 3 && outward(id).length > inRegion(id).length * 2);

  // ⛔ NEVER PARENT A PLACE TO A HUB IT DOES NOT TOUCH. My first cut fell back to the hub whenever a
  // location had no in-region connections — and 25 of 118 have none, 22 of them in `the_foothills`, whose
  // members connect to `the_crossing` and to far places but NEVER to each other. That fallback invented a
  // hierarchy for a whole region out of nothing and would have handed Aevi 22 confident wrong rows.
  //
  // ⚠️ WHAT THE GRAPH ACTUALLY SAYS THERE IS CROSS-REGION: twelve foothills are spokes off the
  // Crossing. That is a real reading and a real question — does the tree allow a parent in another
  // region, or are the foothills a flat region of their own? ⛔ IT IS NOT MINE TO ANSWER, so the row
  // carries the cross-region candidate, says so, and asks.
  const parentOf = (id) => {
    if (id === hub) return null;
    const cands = inRegion(id);
    if (cands.length) {
      if (cands.includes(hub)) {
        const better = cands.filter(c => c !== hub && inRegion(c).length > inRegion(hub).length);
        return better.length ? better[0] : hub;
      }
      return [...cands].sort((a, b) => inRegion(b).length - inRegion(a).length || a.localeCompare(b))[0];
    }
    // No in-region link at all: the strongest OUTWARD neighbour is the only honest candidate.
    const out = outward(id);
    if (!out.length) return null;
    return [...out].sort((a, b) => conns(b).length - conns(a).length || a.localeCompare(b))[0];
  };

  const children = {};
  for (const id of members) { const p = parentOf(id); if (p) (children[p] ||= []).push(id); }

  for (const id of members) {
    const isHub = id === hub, isGate = gates.includes(id);
    // A place with dependents is a SETTLEMENT; a leaf is a SITE. That is what makes the Quiet House
    // (one connection, to the Crossing) a room in a city rather than a peer of the Gearlands.
    const tier = isHub ? "region" : (children[id]?.length ? "settlement" : "site");
    rows.push({
      id, name: flat[id].name || id, region, tier,
      parentId: parentOf(id),
      role: isGate ? "gate" : null,
      evidence: { inRegion: inRegion(id).length, outward: outward(id).length, children: children[id]?.length || 0 },
      // ⚠️ CONFIDENCE HAS TO MEAN SOMETHING OR IT IS NOISE. My first rule flagged every location
      // with any outward reach and produced 46 REVIEW rows against Aevi's expected ~10 — a review list
      // that long is one nobody reads. Flagged now only where the GRAPH GENUINELY CANNOT DECIDE:
      //   · no in-region link at all, so the parent is a cross-region guess
      //   · the hub was a near-tie, so the region's root is a judgement call
      crossRegion: parentOf(id) ? (regionOf(parentOf(id)) !== region) : false,
      ...(isHub ? { runnerUp } : {}),
      // ⚠️ ONLY A TRUE TIE. `<= 1` lit up 23 of 26 regions, and margin 1 IS the ordinary shape here: most
      // regions are three locations — a hub with two in-region links and two spokes with one each. A review
      // list that flags the normal case is one nobody reads, which costs more than the flag is worth.
      confidence: isHub ? (hubMargin === 0 ? "REVIEW — hub TIED on in-region degree, broken alphabetically" : "high")
        : isGate ? "derived-rule"
        : inRegion(id).length === 0 ? "REVIEW — no in-region link; parent is the strongest OUTWARD neighbour"
        : (children[id]?.length ? "medium" : "high"),
    });
  }
}

const review = rows.filter(r => String(r.confidence).startsWith("REVIEW"));
const counts = rows.reduce((a, r) => (a[r.tier] = (a[r.tier] || 0) + 1, a), {});
console.log("═".repeat(96));
console.log("SNG-383 §2 — DERIVED LOCATION HIERARCHY. Nothing is authored or moved; this is a proposal.");
console.log("═".repeat(96));
console.log(`\n${rows.length} locations across ${Object.keys(byRegion).length} regions`);
console.log(`  ${counts.region || 0} region hubs · ${counts.settlement || 0} settlements · ${counts.site || 0} sites`);
console.log(`  ${rows.filter(r => r.role === "gate").length} gate(s): ${rows.filter(r => r.role === "gate").map(r => r.id).join(", ")}`);
// ⚠️ REPORTED AS QUESTIONS, NOT AS ROWS. 22 of the flags are ONE systemic question — the foothills
// have no internal graph at all — and printing them as 22 findings overstates the work twentyfold.
const footFlags = review.filter(r => r.region === "the_foothills");
const tiedHubs = review.filter(r => /tied/i.test(String(r.confidence)));   // ⚠️ case-insensitive: it read "tied" while the string said "TIED" and reported 0 of 3
const stragglers = review.filter(r => r.region !== "the_foothills" && String(r.confidence).includes("no in-region"));
console.log(`
⚠️ ${review.length} row(s) flagged — but they are THREE questions, not ${review.length} errors:`);
console.log(`   1. THE FOOTHILLS (${footFlags.length}) have NO in-region connections; 12 are spokes off the_crossing.`);
console.log(`      Does the tree allow a CROSS-REGION parent, or are the foothills a flat region of their own? Yours.`);
console.log(`   2. ${tiedHubs.length} region hub(s) TIED on in-region degree and were broken alphabetically: ${tiedHubs.map(r => r.region).join(", ")}`);
console.log(`   3. ${stragglers.length} straggler(s) outside the foothills with no in-region link: ${stragglers.map(r => r.id).join(", ")}`);
for (const r of review.slice(0, 14)) console.log(`     ${r.id.padEnd(26)} ${r.region.padEnd(18)} in ${String(r.evidence.inRegion).padStart(2)} / out ${String(r.evidence.outward).padStart(2)} → proposed ${r.tier} of ${r.parentId}`);

console.log("\nTHE CENTER — the case Erik raised:");
for (const r of rows.filter(x => x.region === "the_center")) console.log(`  ${r.id.padEnd(22)} ${String(r.tier).padEnd(11)} ${r.role ? "[gate] " : "       "}parent=${r.parentId || "—"}   (in ${r.evidence.inRegion} / out ${r.evidence.outward})`);

if (process.argv.includes("--emit")) {
  const out = {
    note: "SNG-383 §2 — DERIVED from the connection graph, not authored. Aevi reviews and corrects; CCode applies. Nothing here has been written into content.",
    method: "hub = highest IN-REGION degree (not total, not outward — the Axis Gate case). gate = not the hub, >=3 outward, and outward > 2x in-region. parent = in-region neighbour with highest in-region degree, ties toward the hub. tier = region for the hub, settlement if it has dependents, site if it is a leaf.",
    openQuestion: "§4 says the World view draws 'tier: region hubs AND gates'. A gate is currently emitted as tier settlement/site with role: gate. If gates should render at world scale, gate may need to be a TIER rather than a role — that is a rendering decision and it is yours.",
    counts, reviewCount: review.length,
    locations: rows.sort((a, b) => a.region.localeCompare(b.region) || (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0) || a.id.localeCompare(b.id)),
  };
  mkdirSync(join(root, "po/staged_content"), { recursive: true });
  writeFileSync(join(root, "po/staged_content/location_hierarchy_derived.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\n✅ EMITTED ${rows.length} rows → po/staged_content/location_hierarchy_derived.json`);
}
