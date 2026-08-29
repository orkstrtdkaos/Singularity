// tests/group_capability.mjs — CCODE-307. A GROUP IS A CAPABILITY SET, AND THE TWO DEGRADATIONS DIFFER.
//
// ⛔ ERIK, via `po/SPEC_group_aggregation.md`: "with attrition the group LOSES CAPABILITY THROUGH LOSS OF
// INDIVIDUALS AND THROUGH LOSS OF COHESION." Those are two different mechanisms and the whole point of the
// model is that they are not interchangeable:
//
//     losing one of six spears  → DEPTH falls, coverage is untouched      — a slope
//     losing the only mender    → COVERAGE goes to zero                   — a cliff
//
// ⚠️ THE MOST IMPORTANT TEST IN THIS FILE IS §5, AND IT IS NOT ABOUT ARITHMETIC. Aevi's §6 is Erik's
// constraint — "the capability vocabulary must be DERIVED, never enumerated… a model with a fixed set of
// five capabilities breaks the day a tradition is audited and a sixth appears." §5 invents a seventh
// family at run time and asserts it flows all the way through WITHOUT THIS MODULE BEING EDITED. If that
// test ever needs a change to `group.js` to pass, the constraint has been violated.

import { groupCapability, groupMatchup } from "../engine/group.js";

let pass = 0; const fails = [];
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`ok    ${name}`); }
  else { fails.push(name); console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
};

const who = (id, tags, extra = {}) => ({ id, name: id, present: true, downed: null, assistTags: tags, ...extra });
// ⚠️ `canStrike: false` is what removes the default HARM — a person with hands can swing (CCODE-265).
const soft = (id, tags) => who(id, tags, { canStrike: false });

const band = () => [
  soft("mender", ["mend"]),              // sole RESTORE
  soft("archivist", ["study"]),          // sole KNOW
  who("spear1", []), who("spear2", []), who("spear3", []),
];

/* ══ §1 — COVERAGE IS A UNION; DEPTH IS A COUNT. They are different numbers. ═════════════════════════ */
{
  const g = groupCapability(band());
  check("§1: coverage is the union of what members bring", g.coverage.includes("RESTORE") && g.coverage.includes("KNOW") && g.coverage.includes("HARM"));
  // ⛔ NON-VACUITY: depth must actually differ across families, or "depth" is just coverage with a number.
  check("§1: depth counts suppliers — HARM is deep, RESTORE is not",
    g.depth.HARM >= 3 && g.depth.RESTORE === 1, JSON.stringify(g.depth));
  check("§1: sole coverage is named before it is lost", g.sole.includes("RESTORE") && g.sole.includes("KNOW") && !g.sole.includes("HARM"),
    `sole = ${g.sole.join(", ")}`);
  check("§1: nothing is lost in an intact group", g.lostCoverage.length === 0 && g.down === 0);
}

/* ══ §2 — THE SLOPE: losing one of many costs DEPTH and nothing else ════════════════════════════════ */
{
  const b = band(); b.find(m => m.id === "spear1").downed = { why: "the melee" };
  const g = groupCapability(b);
  check("§2: a shared capability loses DEPTH", g.depth.HARM === 2, JSON.stringify(g.depth));
  check("§2: …and COVERAGE is untouched — this is attrition, not a cliff",
    g.coverage.includes("HARM") && g.lostCoverage.length === 0);
}

/* ══ §3 — THE CLIFF: losing a sole holder removes the capability entirely ═══════════════════════════ */
{
  const b = band(); b.find(m => m.id === "mender").downed = { why: "the melee" };
  const g = groupCapability(b);
  check("§3: a sole capability COLLAPSES — no remaining bodies replace it",
    !g.coverage.includes("RESTORE") && g.lostCoverage.includes("RESTORE"));
  // ⚠️ THE TWO LOSSES MUST BE DISTINGUISHABLE, or the model has not earned its existence.
  const slope = groupCapability((() => { const x = band(); x.find(m => m.id === "spear1").downed = { why: "x" }; return x; })());
  check("§3: the cliff and the slope are distinguishable — SAME headcount, different capability",
    g.down === slope.down && g.lostCoverage.length !== slope.lostCoverage.length,
    `both lost ${g.down}; cliff lost ${g.lostCoverage.length} coverage, slope lost ${slope.lostCoverage.length}`);
}

/* ══ §4 — COHESION falls three ways, and not by the same amount ═════════════════════════════════════ */
{
  const intact = groupCapability(band()).cohesion;
  const attrited = groupCapability((() => { const x = band(); x.find(m => m.id === "spear1").downed = { why: "x" }; return x; })()).cohesion;
  const leaderDown = groupCapability((() => { const x = band(); x.find(m => m.id === "spear1").downed = { why: "x" }; return x; })(), { leaderIds: ["spear1"] }).cohesion;
  const coverageGone = groupCapability((() => { const x = band(); x.find(m => m.id === "mender").downed = { why: "x" }; return x; })()).cohesion;
  check("§4: an intact band is at full cohesion", intact === 1);
  check("§4: attrition lowers it gradually", attrited < intact && attrited > 0.6, String(attrited));
  // ⛔ SHARPER, NOT MERELY LOWER. "the line wavers" has to cost more than one more body.
  check("§4: a LEADER down costs more than the same body would", leaderDown < attrited, `${leaderDown} vs ${attrited}`);
  check("§4: losing COVERAGE costs more than losing a spear", coverageGone < attrited, `${coverageGone} vs ${attrited}`);
  // ⚠️ A WIPED GROUP IS ZERO, and a surviving one never is — a zero multiplier is deletion, not a rout.
  check("§4: a wiped group is 0; a standing one is never 0",
    groupCapability(band().map(m => ({ ...m, downed: { why: "x" } }))).cohesion === 0 && attrited > 0);
  check("§4: an empty group is 0, not NaN — a NaN multiplier silently zeroes what it touches",
    groupCapability([]).cohesion === 0);
}

/* ══ §5 — ⛔ THE VOCABULARY IS DERIVED. A SEVENTH FAMILY, INVENTED HERE, MUST WORK UNTOUCHED. ═══════ */
{
  // ⚠️ THIS IS ERIK'S "EASILY UPDATED AS WE EVOLVE THE GAME" CONSTRAINT, MADE MECHANICAL. `group.js` names
  // no family anywhere; if that ever stops being true, this test fails without the module being edited.
  const tagFamilies = { NAVIGATE: ["read-stars"], HARMONY: ["sing-true"] };
  const crew = [soft("pilot", ["read-stars"]), soft("singer", ["sing-true"]), soft("second", ["read-stars"])];
  const g = groupCapability(crew, { tagFamilies });
  check("§5: a family this module has never heard of appears in coverage",
    g.coverage.includes("NAVIGATE") && g.coverage.includes("HARMONY"), g.coverage.join(", "));
  check("§5: …with correct depth, so it is genuinely derived and not pattern-matched",
    g.depth.NAVIGATE === 2 && g.depth.HARMONY === 1, JSON.stringify(g.depth));
  check("§5: …and its sole holder is flagged like any other", g.sole.includes("HARMONY") && !g.sole.includes("NAVIGATE"));
}

/* ══ §6 — AGGREGATION UPWARD: a unit is a group of groups ═══════════════════════════════════════════ */
{
  const squadA = groupCapability(band());
  const squadB = groupCapability(band());
  const cohort = groupCapability([{ id: "A", capability: squadA }, { id: "B", capability: squadB }]);
  // ⛔ A SUB-GROUP CONTRIBUTES ITS DEPTH, NOT ONE VOTE. Folding a squad in as a single member is how an
  // aggregate stops matching the fight it replaces.
  check("§6: depth SUMS across sub-groups", cohort.depth.HARM === squadA.depth.HARM * 2, JSON.stringify(cohort.depth));
  check("§6: standing sums too", cohort.standing === squadA.standing * 2);
  // ⚠️ AND A CAPABILITY HELD ONCE PER SQUAD IS NO LONGER SOLE AT COHORT SCALE — which is the whole reason
  // a bigger formation is more robust, and it falls out rather than being special-cased.
  check("§6: two squads with a mender each are NOT one casualty from losing RESTORE",
    !cohort.sole.includes("RESTORE") && cohort.coverage.includes("RESTORE"));
}

/* ══ §7 — ABSENT IS NOT DOWNED ══════════════════════════════════════════════════════════════════════ */
{
  const b = band(); b.find(m => m.id === "mender").present = false;
  const g = groupCapability(b);
  check("§7: a withdrawn member is neither capability nor casualty",
    g.down === 0 && !g.coverage.includes("RESTORE") && g.lostCoverage.length === 0,
    `down=${g.down} lostCoverage=${g.lostCoverage.join(",")}`);
}

/* ══ §8 — GROUP vs GROUP reads coverage, not headcount ══════════════════════════════════════════════ */
{
  // ⛔ THE CASE ERIK NAMED: a legion is narrow and deep; a band is broad and thin. Headcount says the
  // legion wins every question, and the fiction says it cannot answer the ones it has no coverage for.
  const legion = groupCapability(Array.from({ length: 40 }, (_, i) => who(`soldier${i}`, [])), { structure: "drilled" });
  const heroes = groupCapability(band(), { structure: "band" });
  const m = groupMatchup(heroes, legion);
  check("§8: the legion is deeper in HARM", m.byFamily.HARM.them > m.byFamily.HARM.us);
  check("§8: …and cannot answer KNOW or RESTORE at all",
    m.uncontested.includes("KNOW") && m.uncontested.includes("RESTORE"), `uncontested: ${m.uncontested.join(", ")}`);
  // ⚠️ NON-VACUITY: the overall edge must NOT simply track headcount, or this is the old answer renamed.
  check("§8: the overall edge is not a headcount verdict — 40 vs 5 does not read as total defeat",
    m.edge > -0.9, `edge ${m.edge}`);
  check("§8: a drilled unit holds more cohesion than a scratch band", legion.cohesion > heroes.cohesion,
    `${legion.cohesion} vs ${heroes.cohesion}`);
}

console.log("\n" + "═".repeat(92));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S)`);
if (fails.length) { console.log("\n  ⛔ THE GROUP MODEL IS WRONG:"); fails.forEach(f => console.log("     " + f)); }
console.log("═".repeat(92) + "\n");
process.exitCode = fails.length ? 1 : 0;
