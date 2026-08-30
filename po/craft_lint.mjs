// po/craft_lint.mjs — the mechanical half of a craft audit, corpus-wide. REPORT ONLY.
//
// ⛔ THIS TOOL EXISTS BECAUSE ITS FIRST DRAFT WAS WRONG. That draft reported 1,198 findings and 663 were
// its own bugs: it linted `operativeAxis` against the NINE GAIN AXES (a different, deliberately OPEN
// vocabulary), and it iterated a field that is a STRING on 29 crafts as if it were a list, producing
// findings named `e`, `o`, `a` and `_`. Three of those "fixes" had already shipped.
//
// ⚠️ SO THE GOVERNING RULE IS: EVERY CHECK PRINTS THE SCHEMA IT MEASURES AGAINST. A finding that cannot
// name its authority is not a finding. If a check's authority is not a real file with a real reader, the
// check does not go in.
//
// ⛔ AND EVERY CHECK HAS A NON-VACUITY FLOOR (CCode): an empty set passes everything. A check that cannot
// find enough crafts to be meaningful reports VACUOUS rather than clean — his first measurement of a live
// braid bug said "0 affected" because he had guessed a field name and got an empty list.
//
// usage:  node po/craft_lint.mjs [tradition|--all] [--check N]

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const R = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

/* ── vocabularies, each READ FROM CANON, never inlined ─────────────────────────────────────────── */
const CM      = R("content/packs/core/rules/craft_mechanics.json");
const ENERGY  = R("content/packs/core/rules/energy_costs.json");
const FGT     = R("content/packs/core/rules/first_gift_template.json");

const AUTH = {
  rung:   "engine/progression.js harmRungGloss + engine/braids.js HARM_ORDER",
  axes:   "SYSTEM_SPEC §34.3 — the nine gain axes",
  energy: "content/packs/core/rules/energy_costs.json byLevel[].band (derived from 342 abilities)",
  notFor: "SYSTEM_SPEC §32.6 — required field",
  gains:  "SYSTEM_SPEC §46.11 — r1 is the base; it cannot deepen what is below it",
  chal:   "content/packs/core/rules/challenge_types (canonical list)",
};
const RUNGS = ["none", "damaging", "incapacitating", "lethal"];   // the four the engine ranks
const AXES  = new Set(["range","duration","damage","scope","targets","quality","autonomy","conditions","tempo"]);
const BAND  = Object.fromEntries(Object.entries(ENERGY.byLevel || {}).map(([k, v]) => {
  const [lo, hi] = String(v.band).split("-").map(Number);
  return [Number(k), [lo, hi]];
}));

/* ── loader parity (§46.4): 25 cohort crafts report phantom defects without it ─────────────────── */
function loadCrafts() {
  const cohort = new Set(FGT.cohort || []), T = FGT.template || {};
  const dir = path.join(ROOT, "content/packs/core/abilities");
  const out = [];
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
    for (const a of (JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).abilities || [])) {
      const e = { ...a, _file: f };
      if (cohort.has(a.id)) {
        for (const [k, v] of Object.entries(T)) {
          if (k === "mechanic") e.mechanic = { ...v, ...(a.mechanic || {}) };
          else if (e[k] === undefined || e[k] === null) e[k] = v;
        }
        e._fromTemplate = true;
      }
      out.push(e);
    }
  }
  return out;
}

/* ⚠️ FIELD-SHAPE TOLERANT. notFor is str on 301 and list on 73; intensity is dict on 345, str on 29. */
const asText = v => typeof v === "string" ? v : Array.isArray(v) ? v.join(" ") : "";
const asList = v => Array.isArray(v) ? v : typeof v === "string" ? [] : [];
const rungIx = r => RUNGS.indexOf(r);

/* ── the checks ────────────────────────────────────────────────────────────────────────────────── */
const CHECKS = [
  {
    n: 1, id: "rung-understated", authority: AUTH.rung, floor: 200,
    severity: "⛔ HARMFUL",
    what: "the ability declares LESS harm than one of its ranks delivers — the GM is told it is safer than it is",
    applies: c => c.harmRung && (c.tree || []).some(t => t.harmRung),
    run(c) {
      const ranks = (c.tree || []).map(t => t.harmRung).filter(Boolean);
      const max = ranks.reduce((m, r) => rungIx(r) > rungIx(m) ? r : m, "none");
      if (rungIx(max) <= rungIx(c.harmRung)) return null;
      const gloss = c.harmRung === "none" ? "  ⛔ AND `none` GLOSSES AS: \"this craft HARMS NOTHING… NEVER invent a wound from it\"" : "";
      return `declared ${c.harmRung}, ranks reach ${max}${gloss}`;
    },
  },
  {
    n: 2, id: "rung-overstated", authority: AUTH.rung, floor: 200,
    severity: "⚠️ cosmetic",
    what: "the ability declares harm no rank delivers — misleading, not dangerous",
    applies: c => c.harmRung && (c.tree || []).some(t => t.harmRung),
    run(c) {
      const ranks = (c.tree || []).map(t => t.harmRung).filter(Boolean);
      const max = ranks.reduce((m, r) => rungIx(r) > rungIx(m) ? r : m, "none");
      return rungIx(max) < rungIx(c.harmRung) ? `declared ${c.harmRung}, ranks reach only ${max}` : null;
    },
  },
  {
    n: 3, id: "rung-off-vocabulary", authority: AUTH.rung, floor: 200,
    severity: "⛔ HARMFUL",
    what: "a harmRung value the engine cannot rank — it sorts BELOW `none` via indexOf -1",
    applies: c => true,
    run(c) {
      const bad = [c.harmRung, ...(c.tree || []).map(t => t.harmRung)].filter(r => r && !RUNGS.includes(r));
      return bad.length ? `unrankable: ${[...new Set(bad)].join(", ")}` : null;
    },
  },
  {
    n: 10, id: "leading-article", authority: "Erik, 2026-08-30", floor: 0,
    severity: "⛔ HARMFUL",
    what: "a craft or rank name that opens with \"The\" — Erik has corrected this THREE times and a written rule did not hold",
    // ⛔ THIS IS A GATE BECAUSE THE RULE FAILED AS PROSE. It lived in PIPELINE rule 10 and I kept breaking it,
    // twice while self-checking and reporting clean — because I was measuring CRAFT names and the habit was in
    // RANK names. Erik: "you continue to fail on the 'The' titles. MOVE THAT RULE TO SOMEWHERE YOU WILL FOLLOW IT."
    // ⚠️ A check that runs on every lint is somewhere I will follow it. A paragraph is not.
    applies: c => true,
    run(c) {
      const bad = [];
      if (String(c.name || "").startsWith("The ")) bad.push(`craft "${c.name}"`);
      for (const t of (c.tree || [])) {
        if (String(t.name || "").startsWith("The ")) bad.push(`r${t.rank} "${t.name}"`);
      }
      return bad.length ? bad.join(" · ") : null;
    },
  },
  {
    n: 11, id: "name-collision", authority: "Erik, 2026-08-30", floor: 0,
    severity: "⛔ HARMFUL",
    what: "a rank named after a DIFFERENT craft that exists — ambiguous to a GM (\"take Held Line\" meant two things)",
    // ⚠️ EXEMPTS r1 SHARING ITS OWN CRAFT'S NAME, which is the convention and ~140 crafts do it.
    applies: c => true,
    run(c, all) {
      if (!all) return null;
      const byName = new Map();
      for (const x of all) byName.set(x.name, x.id);
      const bad = [];
      for (const t of (c.tree || [])) {
        const owner = byName.get(t.name);
        if (owner && owner !== c.id) bad.push(`r${t.rank} "${t.name}" is the craft ${owner}`);
      }
      return bad.length ? bad.join(" · ") : null;
    },
  },
  {
    n: 4, id: "r1-deepens", authority: AUTH.gains, floor: 200,
    severity: "⚠️ INFORMATIONAL — DO NOT FIX",
    // ⛔ DEMOTED FROM AUTO-FIXABLE, 2026-08-24, BEFORE ANY WRITE. Two authorities say leave it alone:
    //   · `po/function_integrity.mjs:157` gates `gains` only for `rank > 1` — r1 is deliberately exempt,
    //     because r1 has nothing below it to gain against, so the value is not read there.
    //   · `first_gift_template.json.rankArc[0]` AUTHORS `{rank: 1, gains: "deepen"}` — the template's own
    //     documented pattern for all 25 cohort crafts.
    // ⚠️ SO "FIXING" 42 CRAFTS WOULD HAVE REWRITTEN THE TEMPLATE'S OWN CONVENTION on a field with no r1
    // consumer. The observation stands (r1 cannot deepen what is not there); the write does not.
    what: "r1 declares `gains: deepen` — true, but no consumer reads gains at r1 and the template authors it that way",
    applies: c => (c.tree || []).some(t => t.rank === 1),
    run: c => (c.tree || []).some(t => t.rank === 1 && t.gains === "deepen") ? "r1 gains=deepen → should be broaden" : null,
  },
  {
    n: 5, id: "gainaxes-off-vocabulary", authority: AUTH.axes, floor: 200,
    severity: "⛔ HARMFUL",
    what: "a gainAxes value outside the nine — invisible to every aggregate that reads them",
    applies: c => (c.tree || []).some(t => (t.gainAxes || []).length),
    run(c) {
      const bad = (c.tree || []).flatMap(t => asList(t.gainAxes)).filter(x => !AXES.has(x));
      return bad.length ? `off-vocabulary: ${[...new Set(bad)].join(", ")}` : null;
    },
  },
  {
    n: 6, id: "energy-off-band", authority: AUTH.energy, floor: 200,
    severity: "⚠️ judgement",
    what: "energy outside the authored band for its level — §32.15: a low price is often an apologetic craft",
    applies: c => BAND[c.levelReq] && Number.isInteger(c.energyCost),
    run(c) {
      const [lo, hi] = BAND[c.levelReq];
      return (c.energyCost < lo || c.energyCost > hi) ? `L${c.levelReq} e${c.energyCost}, band ${lo}-${hi}` : null;
    },
  },
  {
    n: 7, id: "notfor-empty", authority: AUTH.notFor, floor: 200,
    severity: "⛔ authoring",
    what: "no `notFor` — the field that stops a craft being read as universal",
    applies: () => true,
    run: c => asText(c.notFor).trim() ? null : "empty",
  },
  {
    n: 8, id: "challenge-unknown", authority: AUTH.chal, floor: 50,
    severity: "⚠️ report",
    // ⛔ CCODE'S CORRECTION: do NOT pin this to case. The lowercase values are a DIFFERENT VOCABULARY,
    // not a spelling error, and a check pinned to a spelling goes red when content is legitimately right.
    what: "challengeTypes values that are not in the canonical list — reported as UNKNOWN VALUES, not as a case error",
    applies: c => (c.challengeTypes || []).length,
    run(c) {
      const legacy = asList(c.challengeTypes).filter(t => t !== t.toUpperCase());
      return legacy.length ? `not in the canonical list: ${legacy.join(", ")}` : null;
    },
  },
  {
    n: 9, id: "intensity-is-string", authority: "345 crafts author {conserve, surge}", floor: 200,
    severity: "⚠️ shape",
    what: "`intensity` is a bare string — no conserve/surge text for the GM receipt to render",
    applies: () => true,
    run: c => typeof c.intensity === "string" ? `string: "${c.intensity.slice(0, 40)}"` : null,
  },
];

/* ⛔ DROPPED ON CCODE'S REVIEW: the `[cost]`-bound check. It flagged 211 crafts; he classified all 249 and
 * found 240 of 249 are NOT energy costs — they are scope limits, exposure, backlash, time and other
 * resources. `cost` is doing the job of a `drawback` class that does not exist. My 6-for-6 Death sample was
 * thematically biased and I generalised it. A rule condemning 96% of a corpus is a wrong rule. */

/* ── run ───────────────────────────────────────────────────────────────────────────────────────── */
const arg = process.argv[2] || "--all";
const only = process.argv.includes("--check") ? Number(process.argv[process.argv.indexOf("--check") + 1]) : null;
const all = loadCrafts();
const crafts = arg === "--all" ? all : all.filter(c => c.tradition === arg);

console.log(`\nCRAFT LINT — ${crafts.length} crafts${arg === "--all" ? "" : ` in ${arg}`} · REPORT ONLY, nothing written\n`);

let total = 0;
const summary = [];
for (const chk of CHECKS) {
  if (only && chk.n !== only) continue;
  const eligible = crafts.filter(chk.applies);
  // ⛔ NON-VACUITY FLOOR — an empty set passes everything.
  if (eligible.length < Math.min(chk.floor, Math.max(1, Math.floor(crafts.length * 0.1)))) {
    console.log(`  ${chk.n}. ${chk.id} — ⚠️ VACUOUS: only ${eligible.length} eligible crafts, not asserting`);
    summary.push([chk.n, chk.id, "VACUOUS", chk.severity]);
    continue;
  }
  const hits = [];
  for (const c of eligible) { const r = chk.run(c); if (r) hits.push([c, r]); }
  total += hits.length;
  summary.push([chk.n, chk.id, hits.length, chk.severity]);
  console.log(`  ${chk.n}. ${chk.id}  —  ${hits.length} of ${eligible.length} eligible   ${chk.severity}`);
  console.log(`     ${chk.what}`);
  console.log(`     authority: ${chk.authority}`);
  for (const [c, r] of hits.slice(0, only ? 999 : 5))
    console.log(`       · ${c.name} [${c.tradition}] — ${r}`);
  if (!only && hits.length > 5) console.log(`       … and ${hits.length - 5} more (--check ${chk.n} for all)`);
  console.log("");
}

console.log("─".repeat(78));
for (const [n, id, c, sev] of summary) console.log(`  ${String(n).padStart(2)}. ${id.padEnd(26)} ${String(c).padStart(5)}   ${sev}`);
// ⚠️ CCODE: report the LAST count your run prints, not the first — his runner matched an earlier line.
console.log(`\n  TOTAL FINDINGS: ${total}\n`);
