// scripts/rank_curve.mjs — CCODE-284 / SPEC_rank_scaling_derive_with_override §4.
//
// ⛔ AEVI: "THE TEST THAT MATTERS: run the derived curve against all 30 authored ranks and report every
// disagreement. Any place the engine would have chosen differently from a person is a place to look at the
// curve, not at the craft."
//
// ⚠️ SO THIS PROPOSES NOTHING UNTIL IT HAS VERIFIED HER COUNTS. Three times this week a number in a spec —
// mine and hers both — turned out to measure a different field from the one it named, and a curve fitted to
// a miscounted corpus is worse than no curve.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content/packs/core/abilities");
const abilities = [];
for (const f of readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const a of (j.abilities || j.items || [])) abilities.push({ ...a, _file: f });
}

const W = 100;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

console.log("");
line("═");
console.log("  CCODE-284 — THE RANK CURVE, TESTED AGAINST EVERY HUMAN DECISION IN THE GAME");
line("═");

/* ═══ ① VERIFY THE SPEC'S COUNTS BEFORE FITTING ANYTHING TO THEM ═══ */
const NINE = ["range", "duration", "damage", "scope", "targets", "quality", "autonomy", "conditions", "tempo"];
const nineSet = new Set(NINE);
let gaValues = 0, gaInVocab = 0; const gaOut = [], gaDist = {};
for (const a of abilities) {
  for (const t of (a.tree || [])) {
    for (const g of (t.gainAxes || [])) {
      gaValues++;
      if (nineSet.has(g)) { gaInVocab++; gaDist[g] = (gaDist[g] || 0) + 1; }
      else gaOut.push(`${a.id} r${t.rank}: ${g}`);
    }
  }
}

say();
line();
say("① HER COUNTS, RE-MEASURED");
line();
say();
say(`   gainAxes values          ${String(gaValues).padStart(5)}   spec says 777   ${gaValues === 777 ? "✅" : "⚠️ DIFFERS"}`);
say(`   using one of the nine    ${String(gaInVocab).padStart(5)}   spec says 776   ${gaInVocab === 776 ? "✅" : "⚠️ DIFFERS"}`);
say(`   outside the vocabulary   ${String(gaOut.length).padStart(5)}   spec says 1     ${gaOut.length === 1 ? "✅" : "⚠️ DIFFERS"}`);
if (gaOut.length) { say(); for (const o of gaOut.slice(0, 6)) say("      ⛔ " + o); }
say();
say("   distribution: " + Object.entries(gaDist).sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k} ${v}`).join(" · "));

/* ═══ ② THE RANKS THAT AUTHOR A NUMBER — THE 30 THAT MUST SURVIVE UNTOUCHED ═══ */
// ⛔ A RANK'S OWN NUMBER, per §45.1: authored at the rank, read at the ability. These are the deliberate
// design decisions, and every one of them must come out of derivation unchanged.
// ⛔ MY FIRST PASS HARDCODED A FIELD LIST AND FOUND ZERO — against a spec that said 30. The list was wrong,
// not the spec. DISCOVER the numerics instead of naming them, because there are TWO authoring shapes and I
// knew neither:
//   ① an ARRAY on the ability's mechanic, indexed by rank — soul_stare.mechanic.resistDrop: [2,3,4]
//   ② a SCALAR repeated on each tree node — grief_strike.tree[r].antisoakImposed: 3 / 5 / 8
// ⚠️ A hardcoded list cannot see a shape nobody told it about; discovery can.
const SKIP = new Set(["rank", "levelReq", "cost", "xp", "n", "d", "plus", "marginFloorPer"]);
const realLadders = [];

for (const a of abilities) {
  // ── shape ①: numeric arrays on the mechanic block, position = rank ──
  const scan = (blk, where) => {
    if (!blk || typeof blk !== "object") return;
    for (const [k, v] of Object.entries(blk)) {
      if (SKIP.has(k) || k.startsWith("_")) continue;
      if (Array.isArray(v) && v.length >= 2 && v.every(x => typeof x === "number")) {
        realLadders.push({ key: `${a.id}::${k}`, shape: "array", id: a.id, field: k,
          rs: v.map((value, i) => ({ id: a.id, rank: i + 1, field: k, value })) });
      } else if (v && typeof v === "object" && !Array.isArray(v)) scan(v, where + "." + k);
    }
  };
  scan(a.mechanic, "mechanic");

  // ── shape ②: a numeric field present on 2+ tree nodes with at least one change ──
  const perField = {};
  for (const t of (a.tree || [])) {
    const blk = { ...(t.mechanic || {}), ...t };
    for (const [k, v] of Object.entries(blk)) {
      if (SKIP.has(k) || k.startsWith("_") || typeof v !== "number") continue;
      (perField[k] = perField[k] || []).push({ id: a.id, rank: t.rank, field: k, value: v });
    }
  }
  for (const [k, rs] of Object.entries(perField)) {
    if (rs.length < 2) continue;
    if (new Set(rs.map(r => r.value)).size < 2) continue;      // unchanging is not a ladder
    realLadders.push({ key: `${a.id}::${k}`, shape: "tree", id: a.id, field: k,
      rs: rs.sort((x, y) => x.rank - y.rank) });
  }
}
const authoredRanks = realLadders.flatMap(l => l.rs);

say();
line();
say("② THE AUTHORED NUMBERS — every deliberate decision derivation must not overwrite");
line();
say();
say(`   authored rank VALUES  : ${authoredRanks.length}    (spec says 30 ranks author a number)`);
  say(`   ladders, array shape  : ${realLadders.filter(l=>l.shape==="array").length}`);
  say(`   ladders, tree shape   : ${realLadders.filter(l=>l.shape==="tree").length}`);
say(`   multi-rank ladders (>= 2 ranks): ${realLadders.length}`);

/* ═══ ③ THE CURVE, AND EVERY PLACE IT DISAGREES WITH A PERSON ═══ */
// ⚠️ FROM THE SPEC'S OWN EVIDENCE: 3->5->8 (+67%,+60%) · 4->6->8 (+50%,+33%) · 2->3->4 (+50%,+33%).
// ⛔ "ROUGHLY +50% PER RANK, DECAYING" IS THE SHAPE. The simplest rule with that shape is a fixed
// multiplier per step with a decay on the second — and it must round the way a person rounds.
const CURVES = {
  "flat +50%":        (base, rank) => Math.round(base * Math.pow(1.5, rank - 1)),
  "+50% then +33%":   (base, rank) => rank <= 1 ? base : rank === 2 ? Math.round(base * 1.5) : Math.round(base * 1.5 * 1.33),
  "+60% then +50%":   (base, rank) => rank <= 1 ? base : rank === 2 ? Math.round(base * 1.6) : Math.round(base * 1.6 * 1.5),
};

say();
line();
say("③ ⛔ THE TEST THAT MATTERS — each candidate curve against every authored ladder");
line();
say();

const report = [];
for (const [name, fn] of Object.entries(CURVES)) {
  let agree = 0, disagree = 0; const misses = [];
  for (const { rs } of realLadders) {
    const base = rs[0].value, baseRank = rs[0].rank;
    for (const r of rs.slice(1)) {
      const want = r.value;
      const got = fn(base, r.rank - baseRank + 1);
      if (got === want) agree++;
      else { disagree++; misses.push(`${r.id} ${r.field} r${r.rank}: person ${want}, curve ${got}`); }
    }
  }
  report.push({ name, agree, disagree, misses });
}
report.sort((a, b) => b.agree - a.agree || a.disagree - b.disagree);
for (const r of report) {
  const total = r.agree + r.disagree;
  const pct = total ? Math.round(r.agree / total * 100) : 0;
  say(`   ${r.name.padEnd(18)} agrees ${String(r.agree).padStart(3)}/${String(total).padEnd(3)} (${pct}%)`);
}
say();
const best = report[0];
say(`   ⛔ EVERY DISAGREEMENT FOR THE BEST CANDIDATE (${best.name}) — these are the places to look:`);
say();
for (const m of best.misses.slice(0, 20)) say("      " + m);
if (best.misses.length > 20) say(`      … and ${best.misses.length - 20} more`);

say();
line("═");
say("⚠️ READ THIS BEFORE ADOPTING A NUMBER: the ladders above are the ONLY empirical evidence, and there");
say("   are very few of them. A curve that fits them is fitted to a handful of decisions, not to a law.");
say("   ⛔ THE DISAGREEMENTS ARE THE POINT — Erik should see where the engine would overrule a person.");
line("═");
console.log("");
