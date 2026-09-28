// ⛔ WHERE THE UNESCORTED 50% CAME FROM, AND WHETHER ANYBODY IS EVER UNESCORTED.
//
// `resolveRoadHazard` reads `cfg.raid.takeShare` — authored in economy.json under `holdStore.raid`, where its own note
// says *"a raid takes takeShare and arrives as news"*. That is Erik's Q8 ruling about A RAID ON A HOLD: a shed full of
// stock loses half. The road borrows it twice — once for a lost fight and once for having nobody walking beside the cart
// — and my own po table of 2026-09-06 labelled the row "Erik's ruling", which is how a hold's dial acquired a road's
// authority. Nobody ruled 50% for a road.
//
// ⛑ THIS TOOL ANSWERS THE THREE THINGS THE NUMBER DEPENDS ON:
//   1 · how often a real standing run actually goes out with nobody (the population — a dial over an empty set is moot),
//   2 · the WHOLE outcome ladder by escort size and road danger, splitting LOST from WIPED, because the 84–100% I
//       reported to Erik was the WIPE rate of a small escort and not a penalty for losing, and
//   3 · what candidate values do to the ladder's ordering — an escort must never be worse for the load than no escort.
import { readFileSync, readdirSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CV = await import("../../engine/caravan.js");
const C = await loadContentHeadless();
const econ = C.rules.economy;
const cfg0 = { ...econ.holdStore, features: econ.holdFeatures };
const L = C.locations;
const people0 = { ...(C.npcs || {}) };

console.log(`\nthe dial as authored: holdStore.raid.takeShare = ${econ.holdStore?.raid?.takeShare} — and its note is about A HOLD:`);
console.log(`  "${String(econ.holdStore?.note || "").match(/Raids:[^.]*\./)?.[0] || "(no note)"}"\n`);

/* ── 1 · THE POPULATION. Who would actually walk a road with nobody? ─────────────────────────────────────────── */
const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
let holds = 0, noCrew = 0, oneOrTwo = 0, more = 0, standing = 0, standingBare = 0;
for (const ch of saves) for (const h of ch.holdings || []) {
  holds++;
  const crew = (h.crew || []).filter(Boolean).length;
  if (!crew) noCrew++; else if (crew <= 2) oneOrTwo++; else more++;
  if (h.route?.toId) { standing++; if (!(h.route.crew || []).length && !h.route.by) standingBare++; }
}
console.log(`1 · THE POPULATION — ${holds} holds across ${saves.length} saves:`);
console.log(`    no crew at all: ${noCrew}   ·   1–2: ${oneOrTwo}   ·   3+: ${more}`);
console.log(`    standing runs: ${standing}, of which ${standingBare} would go out with NOBODY (no crew, no company)`);
console.log(`    ⛑ app.js sends \`carriers: (h.crew || []).slice(0, 2)\`, so a hold with no crew walks its load alone.\n`);

/* ── 2 · THE WHOLE LADDER, LOST SPLIT FROM WIPED ─────────────────────────────────────────────────────────────── */
const RUNS = 2000;
const mkCar = (danger, crew, guards) => ({
  id: "c", holdingId: "h", from: "millbrook", to: "plainstead", danger,
  load: { raw_material: 100 }, carriers: crew.map(p => p.id), events: [], status: "travelling",
  ...(guards ? { company: { id: "co", cut: 0.2, guards } } : {}),
});
const crewOf = (n) => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}`, level: 3, energy: 10, status: "active" }));

function ladder(danger, n, kind, cfg) {
  const tally = { held: 0, lost: 0, wiped: 0, nobody: 0, taken: 0 };
  for (let i = 0; i < RUNS; i++) {
    const crew = kind === "crew" ? crewOf(n) : [];
    const ppl = { ...people0 };
    for (const p of crew) ppl[p.id] = { ...p };
    const ch = { name: "T", npcRegistry: ppl, holdings: [], clock: { day: 1 } };
    const car = mkCar(danger, crew, kind === "guards" ? n : 0);
    const before = car.load.raw_material;
    const r = CV.resolveRoadHazard(ch, car, { rng: Math.random, cfg, people: ppl, day: 1, where: { placeId: "plainstead", danger } });
    tally.taken += (before - (car.load.raw_material || 0)) / before;
    if (!r.fought) tally.nobody++; else if (r.held) tally.held++; else if (r.wiped) tally.wiped++; else tally.lost++;
  }
  const pct = (x) => `${(x / RUNS * 100).toFixed(1)}%`;
  return { share: tally.taken / RUNS, held: pct(tally.held), lost: pct(tally.lost), wiped: pct(tally.wiped), nobody: pct(tally.nobody) };
}

console.log("2 · THE LADDER — 2,000 runs a cell. ⛔ The 84–100% I reported is the WIPE RATE of a small escort,");
console.log("    not a penalty for losing: a plain loss takes the same share as having nobody (both read one dial).\n");
console.log("  escort        danger   beat off   lost   WIPED    share of the load lost");
for (const danger of [2, 3, 4, 5]) {
  for (const [kind, n] of [["none", 0], ["crew", 1], ["crew", 2], ["crew", 5], ["guards", 3], ["guards", 6]]) {
    const r = ladder(danger, n, kind, cfg0);
    const label = kind === "none" ? "nobody" : `${n} ${kind === "crew" ? "of your own" : "hired guards"}`;
    console.log(`  ${label.padEnd(15)}${String(danger).padStart(3)}   ${r.held.padStart(8)}  ${r.lost.padStart(6)}  ${r.wiped.padStart(6)}    ${(r.share * 100).toFixed(1)}%`);
  }
  console.log("");
}

/* ── 3 · THE ORDERING, AND WHAT A CANDIDATE VALUE DOES ───────────────────────────────────────────────────────── */
// ⛔ THE CONSTRAINT THAT IS NOT A TASTE: bringing people must never be WORSE for the load than bringing nobody.
// Today unescorted and a lost fight read ONE dial, so an escort's only effects are the 0% (beat off) and 100% (wiped)
// branches — and at danger 5 a small escort is wiped often enough that sending it is worse than sending nobody.
console.log("3 · THE ORDERING — is an escort ever WORSE for the load than nobody? (today, one shared dial)\n");
console.log("  danger   nobody   1 own   2 own   5 own   3 hired   6 hired   ⛔ escort worse than nobody?");
for (const danger of [2, 3, 4, 5]) {
  const none = ladder(danger, 0, "none", cfg0).share;
  const row = [["crew", 1], ["crew", 2], ["crew", 5], ["guards", 3], ["guards", 6]].map(([k, n]) => ladder(danger, n, k, cfg0).share);
  const worse = row.filter(s => s > none + 0.02).length;
  console.log(`  ${String(danger).padStart(6)}   ${(none * 100).toFixed(1).padStart(6)}%  ${row.map(s => `${(s * 100).toFixed(1)}%`.padStart(6)).join("  ")}    ${worse ? `⛔ YES — ${worse} of 5` : "no"}`);
}
console.log("\n  ⛑ Erik's ruled bound: a TOTAL loss means your people died (\"especially if all your people get killed\"),");
console.log("     and an unescorted cart has nobody to kill — so the unescorted share is bounded strictly below 1.0,");
console.log("     and must sit ABOVE the lost-fight share or bringing people is a penalty. 0.5 satisfies neither end.");
