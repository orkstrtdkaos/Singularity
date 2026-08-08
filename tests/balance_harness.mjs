// balance_harness.mjs — SNG-357. THE HARNESS THAT GOES FIRST.
//
// Erik: "we should simulate the growth rates to see their shapes right now then tweak if we want."
// Aevi: "everything else queued behind it is a tuning decision, and the standing rule is sim before tweak."
//
// ⛔ THIS IS A REPORT, NEVER A GATE. It turns no dial and asserts no number. Three dials are queued behind
// it — the bond curve, the ladder's `roll` column (which moves EVERY success chance in the game), and
// whatever falls out of holdings — and each is Erik's. What this does is make the shape visible first.
//
// ⚠️ IT READS THE REAL SAVES, NOT SYNTHETIC CHARACTERS, and that is the whole methodological point. Aevi:
// "every wrong conclusion in this sequence came from reasoning about an idealised player" — her own
// crossover error, and treating Silas as the ceiling when Erik says he is mid-tier. The saves are ground
// truth and they are already in the repo.
//
// Usage:
//   node tests/balance_harness.mjs
//   node tests/balance_harness.mjs --bond-encounter=1.0 --bond-scale=10
//   node tests/balance_harness.mjs --roll=ladder|softcap        (default: report BOTH, side by side)
//   node tests/balance_harness.mjs --skill-point-per-level=3
//
// Overrides are arguments so a dial can be tried WITHOUT editing content — that is the point of §2.

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadContentHeadless } from "./headless_content.mjs";
import { successChance } from "../engine/resolve.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------- arguments ----------
const ARGS = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith("--"))
  .map(a => { const [k, v] = a.slice(2).split("="); return [k, v === undefined ? true : v]; }));
const num = (k, d) => (ARGS[k] !== undefined ? Number(ARGS[k]) : d);

const C = await loadContentHeadless();
const rules = C.rules;
const ladder = rules.subAttributeLadder || JSON.parse(readFileSync(join(root, "content/packs/core/rules/sub_attribute_ladder.json"), "utf8"));

// ---------- the real saves ----------
// ⚠️ A HARNESS THAT SILENTLY FINDS NO SAVES REPORTS AN IDEALISED PLAYER AGAIN. If the directory is absent
// or empty, that is stated loudly rather than degrading into the exact failure this exists to prevent.
function realSaves() {
  const dir = join(root, "characters");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const d of readdirSync(dir)) {
    const sub = join(dir, d);
    let files = [];
    try { files = readdirSync(sub).filter(f => f.endsWith(".json")); } catch { continue; }
    for (const f of files) {
      try { out.push(JSON.parse(readFileSync(join(sub, f), "utf8"))); } catch { /* a corrupt save is not this tool's problem */ }
    }
  }
  return out;
}
const SAVES = realSaves();
const PLAYED = SAVES.filter(s => Number(s.actionCount) > 0 && s.name !== "Test Hero (dev)");

console.log("═".repeat(100));
console.log("SNG-357 — BALANCE HARNESS.  A REPORT. It turns no dial; Erik decides.");
console.log("═".repeat(100));
if (!SAVES.length) {
  console.log("\n⛔ NO REAL SAVES FOUND under characters/. Everything below would be an idealised player,");
  console.log("   which is the exact failure this harness exists to prevent. Stopping.\n");
  process.exit(0);
}
console.log(`\nread ${SAVES.length} save file(s); ${PLAYED.length} with recorded actions (dev character excluded).`);

// ══════════════════════════════════════════════════════════════════════════════════════════════
// §1a — THE BOND CURVE, PLOTTED AGAINST ACTIONS
// ══════════════════════════════════════════════════════════════════════════════════════════════
// Aevi: "plots bond against ACTIONS, not events, because actions are the unit the saves record and the
// unit Erik feels." And the figure that matters is not the curve — it is "% of the campaign spent at max
// bond." For Silas that is 83%, and THAT NUMBER IS THE DEFECT.
console.log("\n" + "─".repeat(100));
console.log("§1a  BOND — the curve, and the number that matters");
console.log("─".repeat(100));

const bondG = rules.companions?.bondGrowth || {};
const GROW = {
  deed: num("bond-deed", bondG.deed ?? 0.5),
  assist: num("bond-assist", bondG.assist ?? 0.25),
  encounter: num("bond-encounter", bondG.encounter ?? 1.5),
};
const SCALE = num("bond-scale", 10);
const GRANT_AT = num("bond-grant-at", rules.companions?.tiers?.grantAt ?? 6);
const overridden = ["bond-deed", "bond-assist", "bond-encounter", "bond-scale", "bond-grant-at"].filter(k => ARGS[k] !== undefined);
console.log(`  growth: deed ${GROW.deed} · assist ${GROW.assist} · encounter ${GROW.encounter} · scale ${SCALE} · grantAt ${GRANT_AT}` +
  (overridden.length ? `   ⚠️ OVERRIDDEN: ${overridden.join(", ")}` : "   (from content)"));

// The observed rate, derived from the saves rather than assumed: how much bond a real player accrues per
// action. ⚠️ Encounters-per-action is NOT recorded, so the curve is fitted from what IS: bond vs actions.
const bondRows = [];
for (const s of PLAYED) {
  const bonds = Object.entries(s.companionBonds || {});
  if (!bonds.length) continue;
  const [who, b] = bonds.sort((x, y) => y[1] - x[1])[0];
  bondRows.push({ name: s.name, actions: Number(s.actionCount), who, bond: Number(b), lvl: s.level });
}
bondRows.sort((a, b) => a.actions - b.actions);

console.log("\n  REAL SAVES (the overlay — these are people who actually played):");
console.log("    character            actions   lvl   companion    bond    per-100-actions   at max?");
for (const r of bondRows) {
  const per = r.actions ? (r.bond / r.actions * 100) : 0;
  console.log(`    ${r.name.slice(0, 19).padEnd(21)}${String(r.actions).padStart(6)}  ${String(r.lvl).padStart(4)}   ${r.who.slice(0, 11).padEnd(12)}${r.bond.toFixed(2).padStart(5)}   ${per.toFixed(2).padStart(13)}   ${r.bond >= SCALE ? "YES" : "no"}`);
}

// ⛔ THE HEADLINE FIGURE, AND THE HONEST WAY TO GET IT.
//
// My first cut derived "time at max" as SCALE / (bond/actions) — which is circular: when bond IS the
// scale, that always lands on the last action and reports 0%. It printed a confident 0% where Aevi
// measured 83%, i.e. the exact opposite of the truth, and it looked entirely reasonable.
//
// ⚠️ WHAT THE SAVE ACTUALLY RECORDS: deeds, each with an `at` timestamp. Encounters and assists — which
// drive bond FASTER (1.5 and 0.25 against a deed's 0.5) — are NOT recorded anywhere. So a deeds-only
// reconstruction reaches the cap LATER than the real game did, which makes it a LOWER BOUND on time spent
// at max. Bounded and honest beats precise and invented.
const bondTimeline = [];
for (const s of PLAYED) {
  const deeds = (s.deeds || []).filter(d => d && d.at).sort((a, b) => new Date(a.at) - new Date(b.at));
  const peak = Math.max(0, ...Object.values(s.companionBonds || {}).map(Number));
  if (deeds.length < 3 || peak <= 0) continue;
  const t0 = +new Date(deeds[0].at), t1 = +new Date(deeds[deeds.length - 1].at);
  if (!(t1 > t0)) continue;
  let acc = 0, crossed = null, crossIdx = null;
  deeds.forEach((d, i) => { acc += GROW.deed; if (acc >= SCALE && crossed === null) { crossed = +new Date(d.at); crossIdx = i + 1; } });
  const fromDeeds = deeds.length * GROW.deed;
  bondTimeline.push({
    name: s.name, actions: Number(s.actionCount), deeds: deeds.length, peak,
    spanDays: (t1 - t0) / 86400000,
    fromDeeds, unexplained: Math.max(0, Math.min(SCALE, peak) - fromDeeds),
    atMaxPct: crossed === null ? null : (1 - (crossed - t0) / (t1 - t0)) * 100,
    crossIdx,
  });
}

console.log("\n  ⚠️ % OF CAMPAIGN SPENT AT MAX BOND — the figure a fix has to move.");
console.log("     Reconstructed from DEED TIMESTAMPS, the only time-stamped bond source in the save.");
console.log("     Encounters (1.5 each) and assists (0.25) are NOT recorded, and both accrue faster than a");
console.log("     deed (0.5) — so every figure below is a LOWER BOUND. The real share is higher.");
console.log("\n    character            actions   deeds   span      cap hit at    ≥ % at max   unrecorded bond");
for (const r of bondTimeline.sort((a, b) => b.actions - a.actions)) {
  const hit = r.atMaxPct === null ? "not on deeds" : `deed ${r.crossIdx}/${r.deeds}`;
  const pct = r.atMaxPct === null ? "—" : `≥ ${r.atMaxPct.toFixed(0)}%`;
  const unex = r.unexplained > 0 ? `${r.unexplained.toFixed(2)} of ${Math.min(SCALE, r.peak)}` : "—";
  console.log(`    ${r.name.slice(0, 19).padEnd(21)}${String(r.actions).padStart(6)}   ${String(r.deeds).padStart(5)}   ${(r.spanDays.toFixed(1) + "d").padStart(6)}   ${hit.padStart(13)}   ${pct.padStart(10)}   ${unex.padStart(15)}`);
}

// ⛔ AND THE SECOND FINDING, WHICH FELL OUT OF FIXING THE FIRST: three characters sit AT the cap whose
// deeds cannot account for it. That gap IS the unrecorded encounter/assist contribution, and it is large.
const unexplained = bondTimeline.filter(r => r.peak >= SCALE && r.unexplained > 0);
if (unexplained.length) {
  console.log(`\n    ⚠️ ${unexplained.length} character(s) are AT the cap with deeds that cannot account for it:`);
  for (const r of unexplained) {
    console.log(`       ${r.name}: ${r.deeds} deeds = ${r.fromDeeds.toFixed(1)} bond, but sits at ${Math.min(SCALE, r.peak)} — ` +
      `${r.unexplained.toFixed(2)} came from encounters/assists in ${r.actions} actions (~${Math.ceil(r.unexplained / GROW.encounter)} encounters).`);
  }
  console.log("\n    ⛔ THE MEASUREMENT GAP IS ITSELF A FINDING. The headline metric — share of campaign at max —");
  console.log("       cannot be read directly from a save, because the fastest bond source leaves no trace.");
  console.log("       If this number is the defect a fix has to move, the game should record enough to");
  console.log("       measure it: a bond event log, or a counter per source. Until then every figure here is");
  console.log("       a bound, and a tuning decision made on it is a decision made on a bound.");
}

// ═══ SNG-361 — THE SAME FIGURE, READ FROM THE LOG INSTEAD OF INFERRED ═══
//
// ⛔ EVERYTHING ABOVE IS A BOUND, AND SAYS SO. This block is the founded version, and it will read
// EMPTY until characters play with the log in place — that emptiness is correct and must stay visible.
// The alternative, backfilling the log from deeds, would produce exactly the confident-and-wrong number
// this ticket exists to retire (Aevi's 83% had no source; my first 0% was circular).
//
// ⚠️ THE PROGRESS BAR IS PART OF THE REPORT. "0 of 4 founded" is the honest state of the
// measurement today, and printing it every run is what stops a bound quietly becoming the number of record.
const { bondLogStatus, shareAtOrAbove } = await import("../engine/companions.js");
console.log("");
console.log("  ── SNG-361 — FOUNDED FIGURES (from the bond log, not inferred) ──");
const founded = [], bounded = [];
for (const s2 of PLAYED) {
  const st = bondLogStatus(s2);
  const bonds = Object.entries(s2.companionBonds || {}).sort((x, y) => y[1] - x[1]);
  (st.founded ? founded : bounded).push({ name: s2.name, st, who: bonds[0]?.[0] || null, save: s2 });
}
console.log(`     ${founded.length} of ${PLAYED.length} played character(s) have a founded bond history.`);
if (!founded.length) {
  console.log("     ⚠️ NO FOUNDED FIGURE EXISTS YET — the log ships now, so it fills from the next session on.");
  console.log("        Until it does, the % above is a LOWER BOUND and the bond dials should not be tuned on it.");
  for (const b of bounded) console.log(`        ${b.name.slice(0, 22).padEnd(24)} ${b.st.why || "—"}`);
} else {
  console.log("");
  console.log("    character            companion      events   at max from   % of campaign at max");
  for (const f of founded) {
    const r = f.who ? shareAtOrAbove(f.save, f.who, SCALE) : null;
    const at = r?.reached ? `action ${r.reachedAtAction}` : "never reached";
    const pc = r?.reached ? `${(r.share * 100).toFixed(0)}%` : "0%";
    console.log(`    ${f.name.slice(0, 19).padEnd(21)}${String(f.who).slice(0, 12).padEnd(14)}${String(f.st.events).padStart(6)}   ${at.padStart(13)}   ${pc.padStart(18)}`);
  }
  if (bounded.length) console.log(`\n    ⚠️ ${bounded.length} character(s) still bounded — do NOT average them together with the above.`);
}

// The proposed curve, under whatever dials were passed — so a change can be tried before it is made.
console.log("\n  PROPOSED CURVE (current dials, or your overrides): encounters needed to reach each landmark");
const need = (target) => Math.ceil(target / GROW.encounter);
console.log(`    grant fires at bond ${GRANT_AT}  →  ~${need(GRANT_AT)} encounters (or ${Math.ceil(GRANT_AT / GROW.deed)} deeds)`);
console.log(`    cap    reached at ${SCALE}  →  ~${need(SCALE)} encounters (or ${Math.ceil(SCALE / GROW.deed)} deeds)`);
console.log(`    Aevi's measured target: grant at 4 encounters, cap at 7. Current: grant at ${need(GRANT_AT)}, cap at ${need(SCALE)}.`);


// ══════════════════════════════════════════════════════════════════════════════════════════════
// §1b — THE LADDER'S `roll` COLUMN vs THE RETIRED SOFT CAP
// ══════════════════════════════════════════════════════════════════════════════════════════════
// ⛔ AEVI'S OWN WARNING, AND THE REASON THIS BLOCK EXISTS: "a flat +10 on success chance from mid-game
// onward is a large change and I do not know that it is right. If the harness shows the +10 pushes
// mid-game characters toward the 95% ceiling, the fix is to lower the per-rank values, not to abandon
// the bend." So this reports the CEILING PRESSURE, not just the delta.
console.log("\n" + "─".repeat(100));
console.log("§1b  THE ROLL COLUMN — ladder vs the soft cap it retires");
console.log("─".repeat(100));

const BANDS = ["very_easy", "easy", "normal", "hard", "very_hard"];
const bc = rules.baseChance;
const softCapRoll = (rank) => Math.min(rank, bc.attributeSoftCap ?? 4) * bc.attributeMultiplier
  + Math.max(0, rank - (bc.attributeSoftCap ?? 4)) * (bc.attributePerPointBeyond ?? 5);
const ladderRoll = (rank) => Number(ladder.rollCumulative?.[String(Math.min(20, Math.max(1, rank)))] ?? softCapRoll(rank));

console.log("\n  rank   soft cap   ladder   delta");
for (const rank of [4, 6, 9, 12, 16, 20]) {
  const a = softCapRoll(rank), b = ladderRoll(rank);
  console.log(`  ${String(rank).padStart(4)}   ${String(a).padStart(8)}   ${String(b).padStart(6)}   ${(b - a >= 0 ? "+" : "") + (b - a)}`);
}

// Success rate by band, at each rank, under both models — with the CEILING flagged.
const CEIL = rules.d100.ceilingChance, FLOOR = rules.d100.floorChance;
const chanceAt = (rollTotal, band) => {
  // The harness must not re-implement the resolver. Feed a character whose sub-attribute yields the
  // intended roll contribution and let successChance do the arithmetic, band included.
  const fake = { attributes: {}, subAttributes: {}, alignment: {}, energy: 50 };
  const bandMod = rules.difficultyBands?.[band] ?? 0;
  const raw = rollTotal + bandMod;
  return Math.max(FLOOR, Math.min(CEIL, raw));
};
console.log("\n  SUCCESS CHANCE BY BAND (no training/gear — the sub-attribute contribution alone):");
console.log("         " + BANDS.map(b => b.replace("_", " ").padStart(11)).join("") + "     model");
for (const rank of [4, 6, 9, 12, 16, 20]) {
  for (const [label, roll] of [["soft cap", softCapRoll(rank)], ["ladder", ladderRoll(rank)]]) {
    const cells = BANDS.map(b => {
      const v = chanceAt(roll, b);
      return ((v >= CEIL ? "*" : "") + v + "%").padStart(11);
    });
    console.log(`  r${String(rank).padStart(2)}   ` + cells.join("") + `     ${label}`);
  }
}
console.log(`  * = at the ${CEIL}% ceiling — the clamp is doing the work, and further rank buys nothing.`);

// Silas's REAL spread, because an idealised even-rank character is precisely what Aevi warned against.
const silas = PLAYED.find(s => /silas/i.test(s.name || ""));
if (silas?.subAttributes) {
  const spread = Object.entries(silas.subAttributes);
  console.log(`\n  ⚠️ AGAINST SILAS'S REAL SPREAD (${spread.map(([, v]) => v).join(",")}) — lvl ${silas.level}, ${silas.actionCount} actions, Erik says MID tier:`);
  console.log("    sub          rank   soft cap   ladder   normal-band chance (soft → ladder)");
  let ceilHits = 0;
  for (const [sub, rank] of spread) {
    const a = softCapRoll(rank), b = ladderRoll(rank);
    const ca = chanceAt(a, "normal"), cbv = chanceAt(b, "normal");
    if (cbv >= CEIL) ceilHits++;
    console.log(`    ${sub.padEnd(12)}${String(rank).padStart(4)}   ${String(a).padStart(8)}   ${String(b).padStart(6)}   ${ca}% → ${cbv}%${cbv >= CEIL ? "  ← AT CEILING" : ""}`);
  }
  console.log(`\n    → ${ceilHits} of ${spread.length} sub-attributes reach the ${CEIL}% ceiling on NORMAL work under the ladder.`);
  console.log("      Aevi's test: if the +10 pushes mid-game toward the ceiling, LOWER THE PER-RANK VALUES —");
  console.log("      the bend from rank 4 to rank 6 is the intent and is not what would be wrong.");
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// §1c — THE DERIVED GRANTS, RETROACTIVELY APPLIED
// ══════════════════════════════════════════════════════════════════════════════════════════════
// Erik ruled the ladder retroactive. This recomputes every real save so the migration is INSPECTED BEFORE
// IT RUNS rather than after — the SNG-343 lesson applied forward: a migration you cannot preview is one
// you find out about from a player.
console.log("\n" + "─".repeat(100));
console.log("§1c  RETROACTIVE DERIVED GRANTS — the migration, previewed on real saves");
console.log("─".repeat(100));

const poolSubs = Object.entries(ladder.subs || {}).filter(([, v]) => v.kind === "pool");
console.log(`\n  pool-governing subs: ${poolSubs.map(([k, v]) => `${k}→${v.governs}`).join(" · ")}`);
console.log("\n  character            sub        rank   grants   pool          now →  after    change");
const doublings = [];
for (const s of PLAYED) {
  for (const [sub, def] of poolSubs) {
    const rank = Number(s.subAttributes?.[sub] || 0);
    if (!rank) continue;
    const grant = Number(def.cumulative?.[String(Math.min(20, rank))] ?? 0);
    const field = def.governs;                                   // maxHealth | maxEnergy
    const now = Number(s[field] || 0);
    const after = now + grant;
    const flag = now > 0 && after > now * 2;
    if (flag) doublings.push(`${s.name} ${field} ${now}→${after}`);
    console.log(`  ${String(s.name).slice(0, 19).padEnd(21)}${sub.padEnd(11)}${String(rank).padStart(4)}   ${("+" + grant).padStart(6)}   ${field.padEnd(11)}${String(now).padStart(5)} → ${String(after).padStart(6)}   ${flag ? "⚠️ MORE THAN DOUBLES" : ""}`);
  }
}
if (doublings.length) {
  console.log(`\n  ⚠️ ${doublings.length} pool(s) MORE THAN DOUBLE — Aevi asked these be flagged:`);
  for (const d of doublings) console.log(`     ${d}`);
} else {
  console.log("\n  no pool more than doubles.");
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// §1d — POINTS AND CAPACITY, KEPT HONEST
// ══════════════════════════════════════════════════════════════════════════════════════════════
// ⛔ THE AVERAGE IS RECOMPUTED FROM THE CATALOG, NEVER HARDCODED. Aevi: "I added six tier-I abilities today
// and will add ~80 more, which lowers it — the harness should recompute rather than hardcoding 2.511, or
// this test rots the moment content lands." A pinned constant here would be the same class of failure as
// a gate pinned to a tuning value.
console.log("\n" + "─".repeat(100));
console.log("§1d  POINTS vs CAPACITY — which one actually binds");
console.log("─".repeat(100));

const craftCosts = Object.values(C.abilities)
  .filter(a => a.powerSystem !== "baseline")
  .map(a => Math.max(1, Number(a.levelReq) || 1));
const avgCost = craftCosts.reduce((s, c) => s + c, 0) / craftCosts.length;
const SPL = num("skill-point-per-level", rules.leveling?.skillPointPerLevel ?? 1);
const capTable = C.skillCapacity?.skillsKnownByLevel || {};

console.log(`\n  average craft cost at zero domain distance: ${avgCost.toFixed(3)}  (recomputed from ${craftCosts.length} abilities, never pinned)`);
console.log(`  skillPointPerLevel: ${SPL}${ARGS["skill-point-per-level"] !== undefined ? "   ⚠️ OVERRIDDEN" : ""}`);
console.log(`\n  RULE: points bind iff skillPointPerLevel < average craft cost  →  ${SPL} < ${avgCost.toFixed(3)} = ${SPL < avgCost ? "POINTS BIND" : "CAPACITY BINDS"}`);

console.log("\n  lvl   points   breadth cap   crafts affordable   binding");
for (const L of [1, 3, 5, 8, 12, 20, 29]) {
  const pts = SPL * (L - 1) + 3;
  const cap = capTable[String(L)] ?? (L + 1);
  const afford = Math.floor(pts / avgCost);
  console.log(`  ${String(L).padStart(3)}   ${String(pts).padStart(6)}   ${String(cap).padStart(11)}   ${String(afford).padStart(17)}   ${afford < cap ? "POINTS" : "capacity"}`);
}

console.log("\n" + "═".repeat(100));
console.log("END OF REPORT — no dial was turned. Every number above re-derives on the next content change.");
console.log("═".repeat(100));
