// ⛔ SNG-647 §3 — THE DRY RUN AEVI ASKED FOR. "Write nothing to content. Produce a report of what it would mint,
// as if in play: kind, temper, seat, leader tier, verbs, and which rule placed each one."
//
// ⛑ IT WRITES NOTHING, AND THAT IS ENFORCED BY HAVING NO WRITER: this file imports `readFileSync` and never
// `writeFileSync`. The proposals come from `scripts/powergen.mjs`, which is pure, so the same command reports the
// same thing every time and she can review a diff of the REPORT when the rules change.
//
// Usage:  node scripts/power_dryrun.mjs                 — the 15 regions §3 names
//         node scripts/power_dryrun.mjs --all           — every region with no power holding it
//         node scripts/power_dryrun.mjs the_open_reach   — one region, with its refusals
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { proposePowers, densityFor, supplyLineReadiness } from "./powergen.mjs";

// the fifteen §3 names, in her order
const ASKED = ["the_given_land", "the_pattern_reach", "the_reasoned_hold", "the_kept_reach", "the_stark_reach",
  "the_feeling_coast", "the_veiled_reach", "the_open_reach", "foothill_gearsflat", "foothill_greenmarch",
  "foothill_greyhearth", "foothill_kindlerow", "foothill_longshore", "foothill_plainstead", "foothill_thinwater"];

const argv = process.argv.slice(2);
const verbose = argv.includes("--verbose") || argv.some(a => !a.startsWith("--"));
const CONTENT = await loadContentHeadless();
const locs = CONTENT.locations || {};
const powers = Array.isArray(CONTENT.powers) ? CONTENT.powers : [];

const heldRegions = new Set(powers.flatMap(p => [p.seat, ...(p.reach || [])].filter(Boolean).map(id => locs[id]?.regionId)).filter(Boolean));
const allRegions = [...new Set(Object.values(locs).map(l => l.regionId).filter(Boolean))];
const named = argv.filter(a => !a.startsWith("--"));
const targets = named.length ? named : argv.includes("--all") ? allRegions.filter(r => !heldRegions.has(r)) : ASKED;

console.log(`\n══ POWER DRY RUN ─ ${powers.length} powers authored, ${heldRegions.size} of ${allRegions.length} regions held ══`);
console.log(`   ${targets.length} region(s) asked. Nothing is written.\n`);

const tally = { byKind: {}, byTemper: {}, byLeader: {}, total: 0 };
const rows = [];

for (const regionId of targets) {
  const out = proposePowers(regionId, { content: CONTENT });
  const d = out.density;
  console.log(`── ${regionId} ─ ${d ? d.why : "no density rule"}`);
  if (!out.proposals.length) console.log(`     (nothing proposed)`);
  for (const p of out.proposals) {
    tally.total++;
    tally.byKind[p.kind] = (tally.byKind[p.kind] || 0) + 1;
    tally.byTemper[p.temper] = (tally.byTemper[p.temper] || 0) + 1;
    tally.byLeader[p.leaderTier] = (tally.byLeader[p.leaderTier] || 0) + 1;
    rows.push({ regionId, ...p });
    const name = locs[p.seat]?.name || p.seat;
    console.log(`     ${String(p.kind).padEnd(13)} ${String(p.temper).padEnd(6)} at ${name} (${p.seatTier || "?"})`
      + `  ${p.scale}/${p.heads} heads q${p.quality}${p.form ? ` · form ${p.form}` : ""}  leader: ${p.leaderTier}`);
    console.log(`        verbs: ${p.verbs.join(", ") || "(none)"}`);
    console.log(`        placed by: ${p.why.join("  ·  ")}`);
    if (p.cells?.length) console.log(`        cells: ${p.cells.map(c => `${locs[c.id]?.name || c.id} (${c.days.toFixed(1)}d)`).join(", ")}`);
    if (p.rival) console.log(`        rival: ${p.rival.id} — ${p.rival.why}`);
  }
  if (verbose && out.refused.length) for (const r of out.refused) console.log(`     ⚠ refused${r.at ? ` at ${r.at}` : ""}${r.kind ? ` (${r.kind})` : ""}: ${r.why}`);
  console.log("");
}

// ── the four things she asked me to watch for ───────────────────────────────────────────────────────
console.log("══ WHAT SHE ASKED ME TO WATCH FOR ══\n");

const poleCult = targets.filter(r => Object.values(locs).some(l => l.regionId === r && (l.tags || []).some(t => /^cult$/i.test(t))));
const cultOrders = rows.filter(x => poleCult.includes(x.regionId) && x.kind === "order");
console.log(`1 · a pole region's pure-pole \`cult\` locus becomes an order`);
console.log(`    ${poleCult.length} region(s) carry a \`cult\` tag; ${cultOrders.length} order(s) proposed there`
  + ` — ${cultOrders.length >= poleCult.length ? "YES, every one" : cultOrders.length ? "PARTLY" : "NO"}`);
if (poleCult.length) console.log(`    ${poleCult.map(r => `${r}: ${rows.filter(x => x.regionId === r).map(x => x.kind).join("/") || "—"}`).join(" · ")}`);

const markets = targets.filter(r => r.startsWith("foothill_"));
const guildsPer = markets.map(r => [r, rows.filter(x => x.regionId === r && x.kind === "guild").length]);
console.log(`\n2 · the market foothill towns get guilds, and only one per region`);
console.log(`    ${markets.length} market town(s): ${guildsPer.map(([r, n]) => `${r.replace("foothill_", "")}=${n}`).join(" ")}`);
console.log(`    every one has exactly one: ${guildsPer.every(([, n]) => n === 1) ? "YES" : "NO"}`
  + ` · any with more than one: ${guildsPer.some(([, n]) => n > 1) ? "YES ⛔" : "no"}`);

console.log(`\n3 · the supply-line rule fires only where a hunger fits`);
for (const r of targets.slice(0, 1)) { const s = supplyLineReadiness(r, { content: CONTENT }); console.log(`    ${s.why}`); }

const temperRows = Object.entries(tally.byTemper).sort((a, b) => b[1] - a[1]);
const authored = powers.reduce((m, p) => { m[p.temper] = (m[p.temper] || 0) + 1; return m; }, {});
console.log(`\n4 · the tempers come out balanced, or all hard`);
console.log(`    proposed: ${temperRows.map(([t, n]) => `${t} ${n} (${Math.round(100 * n / Math.max(1, tally.total))}%)`).join(" · ") || "(none)"}`);
console.log(`    authored: ${Object.entries(authored).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n} (${Math.round(100 * n / powers.length)}%)`).join(" · ")}`);

console.log(`\n══ TOTAL ─ ${tally.total} power(s) proposed across ${targets.length} region(s) ══`);
console.log(`   kinds:   ${Object.entries(tally.byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ")}`);
console.log(`   leaders: ${Object.entries(tally.byLeader).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ")}`);
console.log(`   ⛑ nothing written. Review the RULES against this, not the names.\n`);
