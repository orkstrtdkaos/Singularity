// tests/content_coverage.mjs — SNG-301: is it authored yet?
//
// Erik: *"I thought she authored the verbs."* He was right; I was quoting a number I had measured four turns
// earlier, before Aevi authored them, and had carried forward by memory ever since.
//
// ⚠️ THE VERIFICATION LEDGER ONLY PROTECTS NUMBERS THAT GO INTO IT. Every figure in SPEC §4c is stamped with
// the date it was taken and the command that produces it. A number I quote in PROSE gets none of that — and
// prose is where most of what I tell Erik and Aevi actually lives. This is the missing command: the answer to
// "does that content exist yet" in one run, so it is never again something anyone remembers.
//
// It covers the fields where the ENGINE reads content the AUTHOR supplies — the seam where a stale belief in
// either direction is expensive. A field at 0 is not a defect; it is a fact with a date on it.
//
// A REPORT. Reads content, writes nothing.
//
// Run: node tests/content_coverage.mjs

import { loadContentHeadless } from "./headless_content.mjs";

const CONTENT = await loadContentHeadless();

const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
const has = (v) => (Array.isArray(v) ? v.length > 0 : v != null && v !== "");

/** Each row: what the engine reads, and who supplies it. `over` is the population that COULD carry it. */
const FIELDS = [
  { group: "Roster figures", over: () => CONTENT.legends?.roster || [], rows: [
    { field: "personalVerbs", why: "what they do when they are not arguing about the valley (SNG-275)" },
    { field: "interests", why: "alternate pool for the same reader — personalVerbs alone satisfies it" },
    { field: "kin", why: "alternate pool, as above" },
    { field: "offscreenVerbs", why: "their vocation, narrated while the player is elsewhere" },
    { field: "arcAffinities", why: "every care they hold — one care makes a figure a position, not a person" },
    { field: "wantArcId", why: "the tiebreak when nothing is on fire" },
    { field: "tradition", why: "keys engagement disposition (SNG-300) and the {PEOPLE} title slot" },
    { field: "rivals", why: "who they are already against" },
  ] },
  { group: "Items", over: () => Object.values(CONTENT.items || {}), rows: [
    { field: "bonusTags", why: "THE mechanical hook — equipmentBonus and wieldBonusFor match against these" },
    { field: "kind", why: "weapon/shield/armor/… — shields were the notable gap" },
  ] },
  { group: "Greater arcs", over: () => CONTENT.greaterArcs || [], rows: [
    { field: "stages", why: "the rungs themselves" },
  ] },
];

console.log("CONTENT COVERAGE (SNG-301) — is it authored yet? A number with a date on it, not a memory.\n");

for (const g of FIELDS) {
  const pop = g.over();
  console.log(`  ${g.group} — ${pop.length} record(s)\n`);
  for (const r of g.rows) {
    const n = pop.filter((x) => has(x?.[r.field])).length;
    const bar = pct(n, pop.length);
    const mark = n === 0 ? "  (none yet)" : n === pop.length ? "  ✓ complete" : "";
    console.log(`    ${r.field.padEnd(16)} ${String(n).padStart(4)}/${String(pop.length).padEnd(4)} ${String(bar).padStart(3)}%${mark}`);
    console.log(`      ${r.why}`);
  }
  console.log("");
}

// The stage effects are nested a level down, and they are the 2.0.0 row — worth their own count.
{
  const arcs = CONTENT.greaterArcs || [];
  const stages = arcs.flatMap((a) => a.stages || []);
  const withEffects = stages.filter((s) => (s.effects || []).length);
  const kinds = {};
  for (const s of stages) for (const e of s.effects || []) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
  console.log(`  Arc stage effects — ${withEffects.length}/${stages.length} stages carry effects`);
  console.log(`    by kind: ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(" · ") || "(none)"}`);
  console.log("    ⚠️ `priceShift` has NO consumer in the engine — see arceffects.js:EFFECT_CONSUMERS.\n");
}

// Title patterns: authored vs actually reachable, which are different questions.
{
  const pats = CONTENT.rules?.titles?.patterns || [];
  const { unusablePatterns, orderSensitivePatterns } = await import("../engine/titles.js");
  console.log(`  Title patterns — ${pats.length} authored`);
  console.log(`    unusable (a slot has no source): ${unusablePatterns(pats).map((u) => u.id).join(", ") || "none"}`);
  console.log(`    order-sensitive (reached only by records an earlier pattern declines): ${orderSensitivePatterns(pats).map((u) => u.id).join(", ") || "none"}\n`);
}

console.log("A REPORT — reads content, writes nothing. Quote it WITH the date you ran it.");
