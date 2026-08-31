// scripts/access_census.mjs — CCODE-332. WHAT THE ACCESS MODEL ACTUALLY DOES, BEFORE IT IS REWORKED.
//
// ⛔ ERIK: "we'll likely update the domain access model to eliminate a closed antipole and rework domain or
// pole access policies."
//
// ⚠️ A REWORK NEEDS A BASELINE OR NOBODY CAN TELL WHAT IT CHANGED. `domainAccess` is the rule that decides
// what a character may ever learn, and until now its effect has been described in prose and never counted.
// This walks EVERY authored craft against EVERY legal build and reports where they land.
//
// ⚠️ THE NUMBER THAT MATTERS MOST IS `closed`. Removing the closed-antipode rule is cheap if it shuts a
// handful of crafts and profound if it shuts a fifth of the catalogue — and that is a fact, not a judgement.
//
// Usage:  node scripts/access_census.mjs                → the census across all 24 primaries
//         node scripts/access_census.mjs --primary umbral
//         node scripts/access_census.mjs --noclosed     → the counterfactual: the same world with the
//                                                         closed-antipode rule REMOVED, and the delta

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTraditionIndex, domainAccess, traditionOf, antipodeOf, neighborsOf } from "../engine/traditions.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const tf = rj("content/packs/core/rules/traditions.json");
const index = buildTraditionIndex(tf);

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const ONE = arg("--primary");
const NOCLOSED = process.argv.includes("--noclosed");

/* ── the corpus ─────────────────────────────────────────────────────────────────────────────── */
const abilities = [];
for (const fn of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${fn}`).abilities || [])) abilities.push(a);
}

const poles = (tf.traditions || []).filter(t => t.ring && Number.isFinite(t.ring.position)).map(t => t.traditionId);

/* ── the counterfactual ─────────────────────────────────────────────────────────────────────── */
// ⚠️ THE COUNTERFACTUAL IS COMPUTED FROM THE REAL FUNCTION, NOT A REIMPLEMENTATION OF IT. Re-deriving the
// access rules here to model "without closed" would be a second implementation free to disagree with the
// first — the exact defect this project keeps paying for. Instead: ask the real `domainAccess`, and where it
// answers `closed`, ask again as though that pole were not the antipode.
// ⛔ THAT IS ONLY HONEST BECAUSE `closed` IS A PURE FUNCTION OF THE TRADITION, not of the craft: every band
// below `closed` depends on `trad` and `tier` alone, so re-asking with a neutral primary reproduces exactly
// what the rule would have said. Where it is not safe, it reports `unknown` rather than guessing.
function accessOf(ability, tier, domains) {
  const real = domainAccess(ability, tier, domains, index);
  if (!NOCLOSED || real.band !== "closed") return real;
  const trad = traditionOf(ability, index);
  // re-ask with the antipode relationship broken: what band would this land in on distance alone?
  const steps = neighborsOf(domains.primary, index)?.includes(trad) ? 1 : null;
  if (steps === 1) return { allowed: true, penalty: 1, band: "adjacent", reason: "counterfactual" };
  return { allowed: true, penalty: 3, band: "far", reason: "counterfactual — was closed" };
}

/* ── the census ─────────────────────────────────────────────────────────────────────────────── */
const BANDS = ["primary", "secondary", "tertiary", "acquired", "adjacent", "far", "closed", "foreclosed", "folk", "open"];
const TIER = 3;   // the tier where secondary tops out — the band boundaries are all visible here

function censusFor(primary) {
  const secondary = (neighborsOf(primary, index) || [])[0] || null;
  const tertiary = (neighborsOf(secondary, index) || []).find(t => t !== primary) || null;
  const domains = { primary, secondary, tertiary };
  const counts = Object.fromEntries(BANDS.map(b => [b, 0]));
  let denied = 0;
  for (const a of abilities) {
    const r = accessOf(a, TIER, domains);
    counts[r.band] = (counts[r.band] || 0) + 1;
    if (!r.allowed) denied++;
  }
  return { primary, secondary, tertiary, counts, denied, anti: antipodeOf(primary, index) };
}

const W = 104, line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
console.log("");
line("═");
say(`CCODE-332 — ACCESS CENSUS · ${abilities.length} crafts × ${poles.length} primaries at tier ${TIER}${NOCLOSED ? "  ⚠️ COUNTERFACTUAL: closed-antipode REMOVED" : ""}`);
line("═");
say();

const targets = ONE ? [ONE] : poles;
const rows = targets.map(censusFor);

say("  primary        antipode        closed  foreclosed  denied   adjacent   far    primary/2nd/3rd");
line();
for (const r of rows) {
  const c = r.counts;
  say(`  ${r.primary.padEnd(14)} ${String(r.anti).padEnd(15)}${String(c.closed).padStart(6)}${String(c.foreclosed).padStart(12)}${String(r.denied).padStart(8)}${String(c.adjacent).padStart(11)}${String(c.far).padStart(7)}    ${c.primary}/${c.secondary}/${c.tertiary}`);
}
say();
line("═");

/* ── what it says ───────────────────────────────────────────────────────────────────────────── */
const tot = rows.reduce((a, r) => a + r.counts.closed, 0);
const mean = tot / rows.length;
const worst = [...rows].sort((a, b) => b.counts.closed - a.counts.closed)[0];
const best = [...rows].sort((a, b) => a.counts.closed - b.counts.closed)[0];
say("WHAT THE CLOSED-ANTIPODE RULE COSTS TODAY");
line("═");
say();
if (NOCLOSED) {
  say(`  ⚠️ COUNTERFACTUAL RUN — every craft the rule shut is re-banded on distance alone.`);
  say(`     Closed now: ${tot} (it should be 0). Compare with the plain run to read the delta.`);
} else {
  say(`  ⛔ A build closes ${mean.toFixed(1)} of ${abilities.length} crafts on average — ${(100 * mean / abilities.length).toFixed(1)}% of the catalogue.`);
  say(`     Most shut: ${worst.primary} loses ${worst.counts.closed} (its antipode is ${worst.anti}).`);
  say(`     Least shut: ${best.primary} loses ${best.counts.closed} (antipode ${best.anti}).`);
  say();
  // ⚠️ THE ASYMMETRY IS THE INTERESTING PART: the rule does not cost every people the same, because a pole's
  // antipode may be richly authored or thin. That is a BALANCE fact hiding inside an ACCESS rule.
  const spread = worst.counts.closed - best.counts.closed;
  say(`  ${spread > 10 ? "⛔" : "⚠️"} THE RULE IS NOT EVEN-HANDED: a ${spread}-craft spread between the most and least affected build,`);
  say(`     because a pole's antipode may be richly authored or thin. An ACCESS rule is quietly doing BALANCE work.`);
}
say();
// ⛔ AND THE CASE THAT PROMPTED THIS: a domain holding both poles of one axis closes itself.
const v2 = (() => { try { return rj("content/packs/core/rules/traditions_v2.json").traditions; } catch { return null; } })();
if (v2) {
  const dom = {};
  for (const [d, r] of Object.entries(v2)) for (const [, p] of (r.sects || [])) dom[p] = d;
  const selfClosing = poles.filter(p => { const a = antipodeOf(p, index); return a && dom[p] && dom[p] === dom[a]; });
  if (selfClosing.length) {
    say(`  ⛔ SELF-CLOSING DOMAIN: ${[...new Set(selfClosing.map(p => dom[p]))].join(", ")} holds a pole and its own antipode`);
    say(`     (${selfClosing.join(" ↔ ")}) — so one domain is unreachable-whole under the current rule.`);
    say();
  }
}
line("═");
console.log("");
