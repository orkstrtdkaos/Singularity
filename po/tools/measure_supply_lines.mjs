// ⛔ AEVI'S DECISION 4 (REPLY_aevi_ccode_535_544): *"SNG-641 §7.4, the supply-line rule: turn it on. ⬜ Before
// flipping, run a simulated year and report how many minted powers become lines, per Sovereign and per region. If any
// region ends with more than one line per Sovereign, the cap is broken."*
//
// ⚠️ AND THERE IS NO PER-TICK POWER MINTER TO SIMULATE A YEAR OF. Measured: nothing in `worldtick` mints a power;
// SNG-647's generator was a one-off dry run that produced change sets for Aevi to AUTHOR (see
// po/REPORT_ccode_power_dryrun_SNG-647.md), and the 29 powers in the world are all authored. So "a simulated year" of
// minting is a year of HER authoring, and the honest measurement is the one that answers the same question:
//
//   if the rule is switched on today, which powers become lines, for which Sovereign, in which region —
//   and does any region end with more than one line per Sovereign?
//
// ⛑ Every power is offered in every region its `seat` and `reach` put it in, in declaration order, with the cap
// accumulating exactly as the live reader would see it. Nothing is written.
// ⚠️ RELATIVE, like every sibling tool in this folder: an absolute Windows path is not a `file://` URL, and the ESM
// loader refuses it outright ("Received protocol 'c:'").
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const SV = await import("../../engine/sovereign.js");

const C = await loadContentHeadless();
const powers = Array.isArray(C.powers) ? C.powers : Object.values(C.powers || {});
const npcs = C.npcs || {};
const locations = C.locations || {};
const baseRule = C.rules?.arcResponse?.supplyLineRule || null;
if (!baseRule) { console.log("no supply-line rule in content"); process.exit(1); }

// ⛔ THE RULE AS IT WOULD BE IF ERIK'S §7.4 WERE FLIPPED — the authored dials, `on` forced true. Nothing else moves.
const rule = { ...baseRule, on: true };

// ⚑ THE ARC STAGES AS THEY STAND AT REST (the authored `currentStage`), because a fresh world is the case that
// decides whether the rule is safe to switch on. A world whose arcs have moved only ever has MORE lines available,
// and the cap is what holds that, so the cap is what this measures.
const stageOf = (arcId) => (C.greaterArcs || []).find(a => a && a.id === arcId)?.currentStage ?? 1;

/** Which regions a power stands in: its seat's region and every region its reach touches. */
const regionsOf = (p) => {
  const ids = [p.seat, ...(Array.isArray(p.reach) ? p.reach : []), ...((p.holds || []).map(h => h && h.at))].filter(Boolean);
  return [...new Set(ids.map(id => locations[id]?.regionId).filter(Boolean))];
};

const linesByRegion = {};        // regionId → { sovereignId: n }
const granted = [];
const refused = {};
for (const p of powers) {
  for (const regionId of regionsOf(p)) {
    const already = linesByRegion[regionId] || (linesByRegion[regionId] = {});
    const r = SV.mayBecomeALine(p, { regionId, rule, stageOf, npcs, linesInRegion: already });
    if (r.ok) {
      already[r.sovereignId] = (already[r.sovereignId] || 0) + 1;
      granted.push({ power: p.id, name: p.name, regionId, sovereignId: r.sovereignId, arcId: r.arcId });
      break;                      // ⛑ one power is one line, in the first region it qualifies for
    }
    refused[r.why] = (refused[r.why] || 0) + 1;
  }
}

console.log(`\n── the supply-line rule, switched on, over the ${powers.length} authored powers ──\n`);
console.log(`hungers: ${Object.keys(rule.hungers || {}).join(", ")} · cap ${rule.capPerSovereignPerRegion} per Sovereign per region · a line needs arc stage ≥ ${rule.requiresArcStageAtLeast}\n`);

console.log(`LINES GRANTED: ${granted.length} of ${powers.length} powers\n`);
for (const g of granted) console.log(`  ${g.regionId.padEnd(22)} ${String(g.sovereignId).padEnd(24)} ${g.name} (${g.power})`);

const bySov = granted.reduce((m, g) => { m[g.sovereignId] = (m[g.sovereignId] || 0) + 1; return m; }, {});
console.log(`\nPER SOVEREIGN: ${Object.entries(bySov).map(([s, n]) => `${s} ${n}`).join(" · ") || "none"}`);

// ⛔ THE CAP IS THE QUESTION SHE ASKED. A region with more than `cap` lines for one Sovereign means the cap leaked.
const overCap = [];
for (const [regionId, m] of Object.entries(linesByRegion)) {
  for (const [sov, n] of Object.entries(m)) if (n > (Number(rule.capPerSovereignPerRegion) || 1)) overCap.push(`${regionId} has ${n} for ${sov}`);
}
console.log(`\nTHE CAP: ${overCap.length ? "BROKEN — " + overCap.join(" · ") : "held — no region has more than one line per Sovereign"}`);

console.log(`\nWHY THE REST WERE REFUSED (a power is offered once per region it stands in):`);
for (const [why, n] of Object.entries(refused).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)} × ${why}`);
